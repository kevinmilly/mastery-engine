"""
Manages ~/.mastery-engine/config.json — stores API keys and user preferences.

Keys are loaded in priority order:
  1. Environment variable (always wins — useful for CI/CD)
  2. config.json (set via `mastery-engine setup`)

This means a user can override config-file keys with env vars at any time.
"""
import json
import os
from pathlib import Path
from mastery_engine.config import CONFIG_FILE


def _load_config() -> dict:
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def _save_config(data: dict) -> None:
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def get_key(name: str) -> str | None:
    """
    Get an API key by name. Env var takes priority over config file.
    name: 'openai_api_key' | 'anthropic_api_key'
    """
    env_name = name.upper()
    env_val = os.environ.get(env_name)
    if env_val:
        return env_val
    return _load_config().get(name)


def set_key(name: str, value: str) -> None:
    data = _load_config()
    data[name] = value
    _save_config(data)


def clear_key(name: str) -> None:
    data = _load_config()
    data.pop(name, None)
    _save_config(data)


def configured_providers() -> list[str]:
    """
    Return which LLM providers have keys configured (env var or config file).
    Gemini is primary; Anthropic and OpenAI are fallbacks.
    """
    providers = []
    if get_key("google_api_key"):
        providers.append("gemini")
    if get_key("anthropic_api_key"):
        providers.append("anthropic")
    if get_key("openai_api_key"):
        providers.append("openai")
    return providers


def status_summary() -> list[tuple[str, str]]:
    """
    Return a list of (provider, status_string) for display in setup/doctor.
    """
    rows = []

    anthropic_key = get_key("anthropic_api_key")
    if anthropic_key:
        rows.append(("Anthropic", f"key configured ({_mask(anthropic_key)})"))
    else:
        rows.append(("Anthropic", "not configured"))

    openai_key = get_key("openai_api_key")
    if openai_key:
        rows.append(("OpenAI", f"key configured ({_mask(openai_key)})"))
    else:
        rows.append(("OpenAI", "not configured"))

    google_key = get_key("google_api_key")
    if google_key:
        rows.append(("Gemini", f"key configured ({_mask(google_key)})"))
    else:
        rows.append(("Gemini", "not configured"))

    return rows


def _mask(key: str) -> str:
    if len(key) <= 8:
        return "***"
    return key[:4] + "..." + key[-4:]
