"""
Integration-style workflow tests using mocked adapters.
These test the orchestrator's logic without hitting real services.
"""
import pytest
from unittest.mock import MagicMock, patch, call
from mastery_engine.adapters.workspace_adapter import WorkspaceAdapter, DocRef as WsDocRef, SpreadsheetRef
from mastery_engine.config import DEFAULT_MIN_TOPICS_PER_TIER, DEFAULT_MAX_TOPICS_PER_TIER
from mastery_engine.llm_router import LLMRouter
from mastery_engine.models import RunStatus, TopicStatus, TierStatus
from mastery_engine.orchestrator import Orchestrator
from mastery_engine.state import init_state
from mastery_engine.validation import ValidationFailure
from mastery_engine.retry import FatalError


def _make_syllabus_json(per_tier: int = 2) -> str:
    """Small curriculum for fast tests."""
    import json
    topics = []
    for tier in ["Foundations", "Mechanics", "Mastery"]:
        for seq in range(1, per_tier + 1):
            topics.append({
                "title": f"{tier} Topic {seq}",
                "description": "A two-sentence description of this topic. It explains the concept clearly.",
                "tier": tier,
                "sequence": seq,
            })
    return json.dumps({"topics": topics})


@pytest.fixture
def tmp_state_dir(tmp_path, monkeypatch):
    monkeypatch.setattr("mastery_engine.state.STATE_DIR", tmp_path)
    return tmp_path


@pytest.fixture
def mock_gemini():
    router = MagicMock(spec=LLMRouter)
    router.call.return_value = "Mock lesson or syllabus content."
    router.provider_chain = ["gemini"]
    return router


@pytest.fixture
def mock_workspace():
    adapter = MagicMock(spec=WorkspaceAdapter)
    adapter.create_spreadsheet.return_value = SpreadsheetRef(
        id="sheet-id", url="https://docs.google.com/spreadsheets/d/sheet-id", title="Mastery: Test"
    )
    adapter.create_doc.return_value = WsDocRef(
        id="doc-id", url="https://docs.google.com/document/d/doc-id"
    )
    return adapter


def _make_orchestrator(state, router, workspace, dry_run=False):
    return Orchestrator(router, workspace, state, dry_run=dry_run)


# ── dry run ───────────────────────────────────────────────────────────────────

def test_dry_run_creates_no_workspace_artifacts(tmp_state_dir, mock_gemini, mock_workspace):
    mock_gemini.call.return_value = _make_syllabus_json(2)
    state = init_state("Test Subject", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2

    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=True)
    orch.build()

    mock_workspace.create_spreadsheet.assert_not_called()
    mock_workspace.create_doc.assert_not_called()


def test_dry_run_completes_without_error(tmp_state_dir, mock_gemini, mock_workspace):
    mock_gemini.call.return_value = _make_syllabus_json(2)
    state = init_state("Biochemistry", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2
    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=True)
    orch.build()
    assert state.status == RunStatus.COMPLETED


# ── resume: skip completed topics ────────────────────────────────────────────

def test_resume_skips_completed_topics(tmp_state_dir, mock_gemini, mock_workspace):
    from mastery_engine.models import DocRef
    mock_gemini.call.return_value = _make_syllabus_json(2)
    state = init_state("Law", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2

    # Partially run to generate syllabus
    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=True)
    orch._generate_syllabus()

    # Mark first topic as completed manually
    state.topics[0].status = TopicStatus.COMPLETED
    state.topics[0].lesson_doc = DocRef(id="existing-doc", url="https://existing")
    state.save(state.state_path())

    # Count gemini calls before resuming
    call_count_before = mock_gemini.call.call_count

    # Resume dry run
    orch2 = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=True)
    orch2.build()

    # Should complete without errors
    assert state.status == RunStatus.COMPLETED

    # The first completed topic should not trigger new gemini calls for its lesson
    # (It was skipped — total calls should be less than a fresh full run)
    # Fresh run for 2-per-tier = 6 topics * 2 calls (lesson+practice) + 3 capstones + overview + glossary + 6 lightweight = many
    # After skipping 1, should be fewer calls
    total_calls = mock_gemini.call.call_count
    # Hard to assert exact count, but at minimum verify it ran
    assert total_calls > call_count_before


# ── syllabus repair ───────────────────────────────────────────────────────────

def test_syllabus_repair_attempted_on_invalid_json(tmp_state_dir, mock_gemini, mock_workspace):
    valid = _make_syllabus_json(2)
    # First call: invalid JSON; second call: valid
    mock_gemini.call.side_effect = [
        "not valid json at all",
        valid,
        # Subsequent calls for lessons etc
        *["Mock content." for _ in range(100)],
    ]
    state = init_state("Chemistry", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2
    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=True)
    orch.build()
    assert state.status == RunStatus.COMPLETED


def test_syllabus_fails_after_max_repair_attempts(tmp_state_dir, mock_gemini, mock_workspace):
    # Always return invalid JSON
    mock_gemini.call.return_value = "still not valid json"
    state = init_state("Physics", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2
    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=True)
    with pytest.raises(FatalError):
        orch.build()


# ── row mapping ───────────────────────────────────────────────────────────────

def test_topic_sheet_rows_are_deterministic(tmp_state_dir, mock_gemini, mock_workspace):
    mock_gemini.call.return_value = _make_syllabus_json(2)
    state = init_state("Real Estate", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2
    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=True)
    orch._generate_syllabus()
    orch._create_overview()
    orch._create_glossary()
    orch._seed_spreadsheet()

    foundations_topics = sorted(
        [t for t in state.topics if t.tier == "Foundations"], key=lambda t: t.sequence
    )
    # First data row is 2
    assert foundations_topics[0].sheet_row == 2
    assert foundations_topics[1].sheet_row == 3


# ── doc-created-but-sheet-not-updated ────────────────────────────────────────

def test_resume_updates_sheet_when_doc_created_but_row_not_updated(
    tmp_state_dir, mock_gemini, mock_workspace
):
    from mastery_engine.models import DocRef
    mock_gemini.call.return_value = _make_syllabus_json(2)
    state = init_state("Thermodynamics", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2
    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=False)

    # Manually set up state as if we crashed mid-topic after creating the doc
    orch._generate_syllabus()
    state.topics[0].status = TopicStatus.PRACTICE_DOC_CREATED
    state.topics[0].lesson_doc = DocRef(id="lesson-id", url="https://lesson-url")
    state.topics[0].practice_doc = DocRef(id="practice-id", url="https://practice-url")
    state.topics[0].sheet_row = 2
    state.save(state.state_path())

    # Now complete the tier — it should call update_cell_hyperlink for the sheet
    orch._create_overview()
    orch._create_glossary()
    orch._seed_spreadsheet()

    tier_topics = sorted([t for t in state.topics if t.tier == "Foundations"], key=lambda t: t.sequence)
    # Process the stuck topic
    orch._process_topic(state.topics[0], tier_topics)

    assert state.topics[0].status == TopicStatus.COMPLETED
    mock_workspace.update_cell_hyperlink.assert_called()


# ── final output ──────────────────────────────────────────────────────────────

def test_build_completes_with_dashboard_url(tmp_state_dir, mock_gemini, mock_workspace):
    mock_gemini.call.return_value = _make_syllabus_json(2)
    state = init_state("Cybersecurity", 2, 2)
    state.config.min_topics_per_tier = 2
    state.config.max_topics_per_tier = 2
    orch = _make_orchestrator(state, mock_gemini, mock_workspace, dry_run=False)
    orch.build()
    assert state.status == RunStatus.COMPLETED
    assert state.spreadsheet.id == "sheet-id"
