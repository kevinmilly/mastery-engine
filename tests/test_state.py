import json
import pytest
from pathlib import Path
from mastery_engine.state import (
    RunState, init_state, load_by_run_id, generate_run_id,
    load_latest_incomplete, list_incomplete_runs,
)
from mastery_engine.models import RunStatus, TopicStatus
from mastery_engine.config import DEFAULT_MIN_TOPICS_PER_TIER, DEFAULT_MAX_TOPICS_PER_TIER


@pytest.fixture
def tmp_state_dir(tmp_path, monkeypatch):
    monkeypatch.setattr("mastery_engine.state.STATE_DIR", tmp_path)
    monkeypatch.setattr("mastery_engine.config.STATE_DIR", tmp_path)
    return tmp_path


# ── generate_run_id ───────────────────────────────────────────────────────────

def test_run_id_contains_subject_slug():
    run_id = generate_run_id("Thermodynamics")
    assert "thermodynamics" in run_id


def test_run_id_format():
    run_id = generate_run_id("Real Estate")
    parts = run_id.split("-")
    # real-estate-YYYYMMDD-xxxx → at least 4 parts
    assert len(parts) >= 4


def test_different_subjects_produce_different_ids():
    id1 = generate_run_id("Biochemistry")
    id2 = generate_run_id("Cybersecurity")
    assert id1 != id2


# ── init_state ────────────────────────────────────────────────────────────────

def test_init_state_creates_file(tmp_state_dir):
    state = init_state("Thermodynamics", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    path = tmp_state_dir / f"{state.run_id}.json"
    assert path.exists()


def test_init_state_persists_subject(tmp_state_dir):
    state = init_state("Real Estate", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    loaded = RunState.load(tmp_state_dir / f"{state.run_id}.json")
    assert loaded.subject == "Real Estate"


# ── save / load roundtrip ─────────────────────────────────────────────────────

def test_state_roundtrip(tmp_state_dir):
    state = init_state("Law", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    state.status = RunStatus.SYLLABUS_GENERATED
    state.save(state.state_path())

    loaded = RunState.load(state.state_path())
    assert loaded.status == RunStatus.SYLLABUS_GENERATED
    assert loaded.subject == "Law"


def test_atomic_write_uses_tmp_file(tmp_state_dir):
    state = init_state("Cybersecurity", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    state.save(state.state_path())
    # .tmp file should not linger
    assert not (tmp_state_dir / f"{state.run_id}.json.tmp").exists()


def test_load_by_run_id(tmp_state_dir):
    state = init_state("Biology", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    loaded = load_by_run_id(state.run_id)
    assert loaded.run_id == state.run_id


def test_load_by_run_id_missing_raises(tmp_state_dir):
    with pytest.raises(FileNotFoundError):
        load_by_run_id("nonexistent-run-id")


# ── corrupted state ───────────────────────────────────────────────────────────

def test_corrupted_state_raises_on_load(tmp_state_dir):
    bad_path = tmp_state_dir / "bad-run.json"
    bad_path.write_text("{not valid json", encoding="utf-8")
    with pytest.raises(Exception):
        RunState.load(bad_path)


# ── resume selection ──────────────────────────────────────────────────────────

def test_load_latest_incomplete_returns_most_recent(tmp_state_dir):
    s1 = init_state("Subject A", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    s2 = init_state("Subject A", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    # Touch s2 to make it newer
    import time; time.sleep(0.01)
    s2.status = RunStatus.SYLLABUS_GENERATED
    s2.save(s2.state_path())

    latest = load_latest_incomplete("Subject A")
    assert latest.run_id == s2.run_id


def test_load_latest_incomplete_ignores_completed(tmp_state_dir):
    s1 = init_state("Subject B", DEFAULT_MAX_TOPICS_PER_TIER, DEFAULT_MIN_TOPICS_PER_TIER)
    s1.status = RunStatus.COMPLETED
    s1.save(s1.state_path())

    result = load_latest_incomplete("Subject B")
    assert result is None


def test_list_incomplete_runs_empty(tmp_state_dir):
    assert list_incomplete_runs() == []
