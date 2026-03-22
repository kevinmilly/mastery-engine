import subprocess
import pytest
from unittest.mock import patch, MagicMock
from mastery_engine.adapters.gemini_adapter import GeminiAdapter
from mastery_engine.adapters.workspace_adapter import WorkspaceAdapter, _run
from mastery_engine.retry import FatalError, RetryableError


# ── GeminiAdapter ─────────────────────────────────────────────────────────────

def _mock_run(stdout: str = "response", returncode: int = 0, stderr: str = ""):
    result = MagicMock()
    result.stdout = stdout
    result.stderr = stderr
    result.returncode = returncode
    return result


@patch("mastery_engine.adapters.gemini_adapter.subprocess.run")
def test_gemini_success(mock_run):
    mock_run.return_value = _mock_run(stdout="Generated lesson content")
    adapter = GeminiAdapter()
    result = adapter.call("write a lesson")
    assert result == "Generated lesson content"


@patch("mastery_engine.adapters.gemini_adapter.subprocess.run")
def test_gemini_empty_stdout_raises_retryable(mock_run):
    mock_run.return_value = _mock_run(stdout="", returncode=0)
    adapter = GeminiAdapter()
    with pytest.raises(RetryableError, match="empty output"):
        adapter.call("prompt")


@patch("mastery_engine.adapters.gemini_adapter.subprocess.run")
def test_gemini_nonzero_exit_raises_retryable(mock_run):
    mock_run.return_value = _mock_run(stdout="", stderr="quota exceeded", returncode=1)
    adapter = GeminiAdapter()
    with pytest.raises(RetryableError):
        adapter.call("prompt")


@patch("mastery_engine.adapters.gemini_adapter.subprocess.run")
def test_gemini_auth_error_raises_fatal(mock_run):
    mock_run.return_value = _mock_run(stdout="", stderr="unauthorized: invalid credentials", returncode=1)
    adapter = GeminiAdapter()
    with pytest.raises(FatalError, match="auth"):
        adapter.call("prompt")


@patch("mastery_engine.adapters.gemini_adapter.subprocess.run")
def test_gemini_cli_not_found_raises_fatal(mock_run):
    mock_run.side_effect = FileNotFoundError()
    adapter = GeminiAdapter()
    with pytest.raises(FatalError, match="not found"):
        adapter.call("prompt")


@patch("mastery_engine.adapters.gemini_adapter.subprocess.run")
def test_gemini_timeout_raises_retryable(mock_run):
    mock_run.side_effect = subprocess.TimeoutExpired(cmd="gemini", timeout=120)
    adapter = GeminiAdapter()
    with pytest.raises(RetryableError, match="timed out"):
        adapter.call("prompt")


# ── WorkspaceAdapter (_run helper) ────────────────────────────────────────────

@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_workspace_success(mock_run):
    mock_run.return_value = _mock_run(stdout='{"spreadsheetId": "abc123"}')
    result = _run(["gws", "sheets", "create", "--title", "Test"])
    assert "abc123" in result


@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_workspace_cli_not_found_raises_fatal(mock_run):
    mock_run.side_effect = FileNotFoundError()
    with pytest.raises(FatalError, match="not found"):
        _run(["gws", "sheets", "create"])


@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_workspace_timeout_raises_retryable(mock_run):
    mock_run.side_effect = subprocess.TimeoutExpired(cmd="gws", timeout=60)
    with pytest.raises(RetryableError, match="timed out"):
        _run(["gws", "sheets", "create"])


@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_workspace_auth_error_raises_fatal(mock_run):
    mock_run.return_value = _mock_run(stdout="", stderr="permission denied: token expired", returncode=1)
    with pytest.raises(FatalError, match="auth"):
        _run(["gws", "sheets", "create"])


@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_workspace_transient_error_raises_retryable(mock_run):
    mock_run.return_value = _mock_run(stdout="", stderr="503 service unavailable", returncode=1)
    with pytest.raises(RetryableError):
        _run(["gws", "sheets", "create"])


# ── WorkspaceAdapter create methods ──────────────────────────────────────────

@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_create_spreadsheet_returns_ref(mock_run):
    mock_run.return_value = _mock_run(
        stdout='{"spreadsheetId": "sheet123", "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/sheet123"}'
    )
    adapter = WorkspaceAdapter()
    ref = adapter.create_spreadsheet("Mastery: Law")
    assert ref.id == "sheet123"
    assert "sheet123" in ref.url


@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_create_doc_returns_ref(mock_run):
    mock_run.return_value = _mock_run(
        stdout='{"documentId": "doc456", "documentUrl": "https://docs.google.com/document/d/doc456"}'
    )
    adapter = WorkspaceAdapter()
    ref = adapter.create_doc("Foundations — Topic 1 | Law")
    assert ref.id == "doc456"
    assert "doc456" in ref.url


@patch("mastery_engine.adapters.workspace_adapter.subprocess.run")
def test_create_spreadsheet_malformed_json_raises_retryable(mock_run):
    mock_run.return_value = _mock_run(stdout="not json", returncode=0)
    adapter = WorkspaceAdapter()
    with pytest.raises(RetryableError, match="non-JSON"):
        adapter.create_spreadsheet("Test")
