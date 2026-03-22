"""
LLMRouter — automatic model selection and provider fallback chain.

Anthropic is the primary provider for all tasks.
Gemini (via Google API key) is the fallback for all tasks.

  HIGH tasks (lesson, practice_set, capstone) — need strong reasoning:
    1. Anthropic — claude-sonnet-4-6        (if anthropic_api_key configured)
    2. Gemini    — gemini-2.5-pro-preview   (if google_api_key configured)

  LOW tasks (syllabus, repair, overview, glossary, analogy_extraction, topic_summary):
    1. Anthropic — claude-haiku             (if anthropic_api_key configured)
    2. Gemini    — gemini-2.0-flash         (if google_api_key configured)
"""

from mastery_engine import logging_utils as log
from mastery_engine.adapters.claude_adapter import ClaudeAdapter
from mastery_engine.adapters.gemini_adapter import GeminiAdapter
from mastery_engine.config import (
    GEMINI_HIGH, GEMINI_LOW,
    CLAUDE_HIGH, CLAUDE_LOW,
    HIGH_TASKS, LOW_TASKS,
)
from mastery_engine.retry import FatalError, RetryableError, with_retry
from mastery_engine.user_config import configured_providers


class LLMRouter:
    def __init__(self):
        self._configured = configured_providers()

        self._adapters: dict[str, tuple] = {}
        if "anthropic" in self._configured:
            self._adapters["anthropic"] = (
                ClaudeAdapter(model=CLAUDE_HIGH),
                ClaudeAdapter(model=CLAUDE_LOW),
            )
        if "gemini" in self._configured:
            self._adapters["gemini"] = (
                GeminiAdapter(model=GEMINI_HIGH),
                GeminiAdapter(model=GEMINI_LOW),
            )

        # Anthropic first for all task tiers; Gemini as fallback
        self._high_chain = [p for p in ["anthropic", "gemini"] if p in self._adapters]
        self._low_chain  = [p for p in ["anthropic", "gemini"] if p in self._adapters]

    def call(self, task: str, prompt: str) -> str:
        """
        Call the best available model for task.
        Automatically falls back down the provider chain on failure.
        """
        if task not in HIGH_TASKS and task not in LOW_TASKS:
            raise ValueError(
                f"Unknown task: {task!r}. Must be one of {HIGH_TASKS | LOW_TASKS}"
            )

        is_high = task in HIGH_TASKS
        chain = self._high_chain if is_high else self._low_chain
        errors: list[str] = []

        for provider in chain:
            high_adapter, low_adapter = self._adapters[provider]
            adapter = high_adapter if is_high else low_adapter
            tier = "HIGH" if is_high else "LOW"

            def _call(a=adapter) -> str:
                return a.call(prompt)

            def _on_retry(attempt: int, exc: Exception, p=provider, t=tier) -> None:
                log.warn(f"{p} {t} failed (attempt {attempt}) for '{task}': {exc}")

            try:
                result = with_retry(_call, on_retry=_on_retry)
                if provider != chain[0]:
                    log.success(f"Used {provider} ({adapter.model}) as fallback for '{task}'")
                return result
            except FatalError as e:
                log.warn(f"{provider} fatal for '{task}': {e} — trying next provider…")
                errors.append(f"{provider}: {e}")
            except RetryableError as e:
                log.warn(f"{provider} exhausted retries for '{task}': {e} — trying next provider…")
                errors.append(f"{provider}: {e}")

        raise FatalError(
            f"All providers failed for task '{task}'.\n"
            + "\n".join(f"  {e}" for e in errors)
            + "\nRun `mastery-engine setup` to configure additional providers."
        )

    def check(self) -> list[tuple[bool, str]]:
        """Check each configured provider. Used by doctor."""
        checks = []
        for provider in self._adapters:
            high_adapter, _ = self._adapters[provider]
            ok, msg = high_adapter.check()
            checks.append((ok, msg))
        return checks

    @property
    def provider_chain(self) -> list[str]:
        return list(self._adapters.keys())
