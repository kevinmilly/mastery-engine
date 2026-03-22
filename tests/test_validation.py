import pytest
from mastery_engine.validation import (
    ValidationFailure, parse_syllabus_json, validate_syllabus, assign_topic_ids, extract_json
)
from mastery_engine.models import SyllabusResponse


def _make_topics(per_tier: int = 8) -> list[dict]:
    topics = []
    for tier in ["Foundations", "Mechanics", "Mastery"]:
        for seq in range(1, per_tier + 1):
            topics.append({
                "title": f"{tier} Topic {seq}",
                "description": "A description of this topic. It covers important concepts.",
                "tier": tier,
                "sequence": seq,
            })
    return topics


def _valid_payload(per_tier: int = 8) -> dict:
    return {"topics": _make_topics(per_tier)}


# ── extract_json ──────────────────────────────────────────────────────────────

def test_extract_json_strips_code_fences():
    raw = "```json\n{\"topics\": []}\n```"
    assert extract_json(raw) == '{"topics": []}'


def test_extract_json_plain():
    raw = '  {"topics": []}  '
    assert extract_json(raw) == '{"topics": []}'


# ── parse_syllabus_json ───────────────────────────────────────────────────────

def test_parse_valid_json():
    result = parse_syllabus_json('{"topics": []}')
    assert result == {"topics": []}


def test_parse_invalid_json_raises():
    with pytest.raises(ValidationFailure, match="Invalid JSON"):
        parse_syllabus_json("not json at all")


# ── validate_syllabus ─────────────────────────────────────────────────────────

def test_valid_syllabus_passes():
    syllabus = validate_syllabus(_valid_payload(8), min_topics=8, max_topics=10)
    assert isinstance(syllabus, SyllabusResponse)
    assert len(syllabus.topics) == 24


def test_missing_tier_fails():
    topics = [t for t in _make_topics(8) if t["tier"] != "Mastery"]
    with pytest.raises(ValidationFailure, match="Missing tiers"):
        validate_syllabus({"topics": topics})


def test_too_few_topics_fails():
    payload = _valid_payload(3)
    with pytest.raises(ValidationFailure, match="topics"):
        validate_syllabus(payload, min_topics=8, max_topics=10)


def test_too_many_topics_fails():
    payload = _valid_payload(15)
    with pytest.raises(ValidationFailure, match="topics"):
        validate_syllabus(payload, min_topics=8, max_topics=10)


def test_duplicate_title_fails():
    topics = _make_topics(8)
    topics[1]["title"] = topics[0]["title"]
    with pytest.raises(ValidationFailure, match="Duplicate"):
        validate_syllabus({"topics": topics})


def test_sequence_gap_fails():
    topics = _make_topics(8)
    # Break sequence in Foundations
    foundations = [t for t in topics if t["tier"] == "Foundations"]
    foundations[3]["sequence"] = 99
    with pytest.raises(ValidationFailure, match="sequence"):
        validate_syllabus({"topics": topics})


def test_invalid_tier_fails():
    topics = _make_topics(8)
    topics[0]["tier"] = "Beginners"
    with pytest.raises(ValidationFailure):
        validate_syllabus({"topics": topics})


# ── assign_topic_ids ──────────────────────────────────────────────────────────

def test_topic_ids_are_deterministic():
    syllabus = validate_syllabus(_valid_payload(8))
    result = assign_topic_ids(syllabus, estimated_minutes=20)
    ids = [t["id"] for t in result]
    assert ids[0] == "foundations-01"
    assert ids[7] == "foundations-08"
    assert ids[8] == "mechanics-01"
    assert ids[16] == "mastery-01"


def test_topic_ids_include_estimated_minutes():
    syllabus = validate_syllabus(_valid_payload(8))
    result = assign_topic_ids(syllabus, estimated_minutes=20)
    assert all(t["estimated_minutes"] == 20 for t in result)


def test_topic_order_is_tier_then_sequence():
    syllabus = validate_syllabus(_valid_payload(8))
    result = assign_topic_ids(syllabus, estimated_minutes=20)
    tiers = [t["tier"] for t in result]
    # All Foundations first, then Mechanics, then Mastery
    assert tiers[:8] == ["Foundations"] * 8
    assert tiers[8:16] == ["Mechanics"] * 8
    assert tiers[16:] == ["Mastery"] * 8
