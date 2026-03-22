import json
import re
from typing import Any

from pydantic import ValidationError

from mastery_engine.config import TIERS, DEFAULT_MIN_TOPICS_PER_TIER, DEFAULT_MAX_TOPICS_PER_TIER
from mastery_engine.models import SyllabusResponse, RawTopic


class ValidationFailure(Exception):
    pass


def extract_json(text: str) -> str:
    """Strip markdown code fences and leading/trailing whitespace."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_syllabus_json(raw: str) -> dict[str, Any]:
    cleaned = extract_json(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValidationFailure(f"Invalid JSON: {e}") from e


def validate_syllabus(
    data: dict[str, Any],
    min_topics: int = DEFAULT_MIN_TOPICS_PER_TIER,
    max_topics: int = DEFAULT_MAX_TOPICS_PER_TIER,
) -> SyllabusResponse:
    try:
        syllabus = SyllabusResponse.model_validate(data)
    except ValidationError as e:
        raise ValidationFailure(str(e)) from e

    errors: list[str] = []

    # All 3 tiers must be present
    tiers_present = {t.tier for t in syllabus.topics}
    missing = set(TIERS) - tiers_present
    if missing:
        errors.append(f"Missing tiers: {missing}")

    # Topic count per tier
    for tier in TIERS:
        tier_topics = [t for t in syllabus.topics if t.tier == tier]
        count = len(tier_topics)
        if count < min_topics or count > max_topics:
            errors.append(
                f"Tier '{tier}' has {count} topics; expected {min_topics}–{max_topics}"
            )

    # Sequence integrity per tier
    for tier in TIERS:
        tier_topics = sorted(
            [t for t in syllabus.topics if t.tier == tier], key=lambda t: t.sequence
        )
        for i, topic in enumerate(tier_topics, start=1):
            if topic.sequence != i:
                errors.append(
                    f"Tier '{tier}' sequence gap: expected {i}, got {topic.sequence} for '{topic.title}'"
                )

    # Unique titles
    titles = [t.title.strip().lower() for t in syllabus.topics]
    seen: set[str] = set()
    for title in titles:
        if title in seen:
            errors.append(f"Duplicate topic title: '{title}'")
        seen.add(title)

    if errors:
        raise ValidationFailure("\n".join(errors))

    return syllabus


def assign_topic_ids(syllabus: SyllabusResponse, estimated_minutes: int) -> list[dict]:
    """Assign deterministic IDs and add estimated_minutes to each topic."""
    topics = []
    for tier in TIERS:
        tier_topics = sorted(
            [t for t in syllabus.topics if t.tier == tier], key=lambda t: t.sequence
        )
        for topic in tier_topics:
            tier_slug = topic.tier.lower()
            topic_id = f"{tier_slug}-{topic.sequence:02d}"
            topics.append({
                "id": topic_id,
                "title": topic.title,
                "description": topic.description,
                "tier": topic.tier,
                "sequence": topic.sequence,
                "estimated_minutes": estimated_minutes,
            })
    return topics
