"""
Tests for LLMRouter: provider chain construction, task routing, fallback logic.
All external adapter calls are mocked.
"""
import pytest
from unittest.mock import MagicMock, patch
from mastery_engine.retry import FatalError, RetryableError


def _make_adapter(response="ok", fail_with=None):
    adapter = MagicMock()
    if fail_with:
        adapter.call.side_effect = fail_with
    else:
        adapter.call.return_value = response
    return adapter


# ── Provider chain construction ───────────────────────────────────────────────

def test_gemini_only_when_no_keys_configured(monkeypatch):
    monkeypatch.setattr("mastery_engine.llm_router.configured_providers", lambda: ["gemini"])
    from mastery_engine.llm_router import LLMRouter
    router = LLMRouter()
    assert router.provider_chain == ["gemini"]


def test_openai_added_when_key_configured(monkeypatch):
    monkeypatch.setattr("mastery_engine.llm_router.configured_providers", lambda: ["gemini", "openai"])
    from mastery_engine.llm_router import LLMRouter
    router = LLMRouter()
    assert "openai" in router.provider_chain


def test_anthropic_added_when_key_configured(monkeypatch):
    monkeypatch.setattr("mastery_engine.llm_router.configured_providers", lambda: ["gemini", "anthropic"])
    from mastery_engine.llm_router import LLMRouter
    router = LLMRouter()
    assert "anthropic" in router.provider_chain


def test_full_chain_order(monkeypatch):
    monkeypatch.setattr(
        "mastery_engine.llm_router.configured_providers",
        lambda: ["gemini", "openai", "anthropic"]
    )
    from mastery_engine.llm_router import LLMRouter
    router = LLMRouter()
    assert router.provider_chain == ["gemini", "openai", "anthropic"]


# ── Task routing: HIGH vs LOW ──────────────────────────────────────────────────

def _router_with_mock_adapters(monkeypatch, providers=None):
    if providers is None:
        providers = ["gemini", "openai", "anthropic"]
    monkeypatch.setattr("mastery_engine.llm_router.configured_providers", lambda: providers)

    gemini_high = _make_adapter("gemini-high-response")
    gemini_low = _make_adapter("gemini-low-response")
    openai_high = _make_adapter("openai-high-response")
    openai_low = _make_adapter("openai-low-response")
    claude_high = _make_adapter("claude-high-response")
    claude_low = _make_adapter("claude-low-response")

    from mastery_engine.llm_router import LLMRouter
    router = LLMRouter()
    router._adapters = {
        "gemini": (gemini_high, gemini_low),
        "openai": (openai_high, openai_low),
        "anthropic": (claude_high, claude_low),
    }
    return router, {
        "gemini_high": gemini_high, "gemini_low": gemini_low,
        "openai_high": openai_high, "openai_low": openai_low,
        "claude_high": claude_high, "claude_low": claude_low,
    }


def test_high_task_uses_high_adapter(monkeypatch):
    router, adapters = _router_with_mock_adapters(monkeypatch)
    result = router.call("lesson", "prompt")
    adapters["gemini_high"].call.assert_called_once()
    adapters["gemini_low"].call.assert_not_called()
    assert result == "gemini-high-response"


def test_low_task_uses_low_adapter(monkeypatch):
    router, adapters = _router_with_mock_adapters(monkeypatch)
    result = router.call("syllabus", "prompt")
    adapters["gemini_low"].call.assert_called_once()
    adapters["gemini_high"].call.assert_not_called()
    assert result == "gemini-low-response"


# ── Fallback logic ────────────────────────────────────────────────────────────

def test_falls_back_to_openai_on_gemini_fatal(monkeypatch):
    router, adapters = _router_with_mock_adapters(monkeypatch)
    adapters["gemini_high"].call.side_effect = FatalError("auth failure")
    result = router.call("lesson", "prompt")
    assert result == "openai-high-response"


def test_falls_back_to_openai_on_gemini_retryable_exhausted(monkeypatch):
    router, adapters = _router_with_mock_adapters(monkeypatch)
    adapters["gemini_high"].call.side_effect = RetryableError("quota exceeded")
    result = router.call("lesson", "prompt")
    assert result == "openai-high-response"


def test_falls_back_to_anthropic_when_gemini_and_openai_fail(monkeypatch):
    router, adapters = _router_with_mock_adapters(monkeypatch)
    adapters["gemini_high"].call.side_effect = FatalError("auth")
    adapters["openai_high"].call.side_effect = FatalError("auth")
    result = router.call("lesson", "prompt")
    assert result == "claude-high-response"


def test_raises_fatal_when_all_providers_fail(monkeypatch):
    router, adapters = _router_with_mock_adapters(monkeypatch)
    adapters["gemini_high"].call.side_effect = FatalError("auth")
    adapters["openai_high"].call.side_effect = FatalError("auth")
    adapters["claude_high"].call.side_effect = FatalError("auth")
    with pytest.raises(FatalError, match="All providers failed"):
        router.call("lesson", "prompt")


def test_gemini_only_no_fallback_raises_on_failure(monkeypatch):
    router, adapters = _router_with_mock_adapters(monkeypatch, providers=["gemini"])
    adapters["gemini_high"].call.side_effect = FatalError("auth")
    with pytest.raises(FatalError, match="All providers failed"):
        router.call("lesson", "prompt")


def test_unknown_task_raises_value_error(monkeypatch):
    monkeypatch.setattr("mastery_engine.llm_router.configured_providers", lambda: ["gemini"])
    from mastery_engine.llm_router import LLMRouter
    router = LLMRouter()
    with pytest.raises(ValueError, match="Unknown task"):
        router.call("nonexistent_task", "prompt")


# ── user_config ───────────────────────────────────────────────────────────────

def test_configured_providers_gemini_only(monkeypatch):
    monkeypatch.setattr("mastery_engine.user_config.get_key", lambda name: None)
    from mastery_engine.user_config import configured_providers
    providers = configured_providers()
    assert providers == ["gemini"]


def test_configured_providers_with_openai(monkeypatch):
    def mock_get_key(name):
        return "sk-test" if name == "openai_api_key" else None
    monkeypatch.setattr("mastery_engine.user_config.get_key", mock_get_key)
    from mastery_engine.user_config import configured_providers
    providers = configured_providers()
    assert "openai" in providers
    assert "anthropic" not in providers


def test_configured_providers_with_both(monkeypatch):
    monkeypatch.setattr("mastery_engine.user_config.get_key", lambda name: "key-value")
    from mastery_engine.user_config import configured_providers
    providers = configured_providers()
    assert providers == ["gemini", "openai", "anthropic"]


def test_set_and_get_key(tmp_path, monkeypatch):
    monkeypatch.setattr("mastery_engine.user_config.CONFIG_FILE", tmp_path / "config.json")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    from mastery_engine.user_config import set_key, get_key
    set_key("openai_api_key", "sk-test-key")
    assert get_key("openai_api_key") == "sk-test-key"


def test_env_var_overrides_config_file(tmp_path, monkeypatch):
    monkeypatch.setattr("mastery_engine.user_config.CONFIG_FILE", tmp_path / "config.json")
    monkeypatch.setenv("OPENAI_API_KEY", "env-key")
    from mastery_engine.user_config import set_key, get_key
    set_key("openai_api_key", "file-key")
    assert get_key("openai_api_key") == "env-key"


def test_clear_key(tmp_path, monkeypatch):
    monkeypatch.setattr("mastery_engine.user_config.CONFIG_FILE", tmp_path / "config.json")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    from mastery_engine.user_config import set_key, get_key, clear_key
    set_key("openai_api_key", "sk-test")
    clear_key("openai_api_key")
    assert get_key("openai_api_key") is None
