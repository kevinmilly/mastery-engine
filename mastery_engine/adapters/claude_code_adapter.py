"""
ClaudeCodeAdapter — uses the local `claude` CLI in headless mode.

Bills against the user's Claude Code subscription instead of the Anthropic API,
so it costs nothing extra when the subscription is active. Requires `claude` on PATH.
"""
import shutil
import subprocess

from mastery_engine.config import CLAUDE_CODE_HIGH
from mastery_engine.retry import FatalError, RetryableError


CALL_TIMEOUT_SECONDS = 600


class ClaudeCodeAdapter:
    def __init__(self, model: str = CLAUDE_CODE_HIGH):
        self.model = model
        self._binary: str | None = None

    def _resolve_binary(self) -> str:
        if self._binary is None:
            found = shutil.which("claude")
            if not found:
                raise FatalError(
                    "claude CLI not found on PATH. Install Claude Code from "
                    "https://claude.com/claude-code"
                )
            self._binary = found
        return self._binary

    def call(self, prompt: str) -> str:
        binary = self._resolve_binary()
        cmd = [
            binary,
            "-p",
            "--no-session-persistence",
            "--model", self.model,
            "--output-format", "text",
        ]
        try:
            result = subprocess.run(
                cmd,
                input=prompt,
                capture_output=True,
                text=True,
                encoding="utf-8",
                timeout=CALL_TIMEOUT_SECONDS,
            )
        except FileNotFoundError as e:
            raise FatalError(f"claude CLI invocation failed: {e}")
        except subprocess.TimeoutExpired:
            raise RetryableError(f"claude CLI timed out after {CALL_TIMEOUT_SECONDS}s")

        if result.returncode != 0:
            stderr = (result.stderr or "").strip()
            lowered = stderr.lower()
            if any(sig in lowered for sig in ["not authenticated", "login", "unauthorized", "auth"]):
                raise FatalError(
                    f"claude CLI auth failure: {stderr}\n"
                    "Run `claude` interactively once to sign in."
                )
            if any(sig in lowered for sig in ["rate limit", "rate_limit", "quota", "5-hour", "usage limit"]):
                raise RetryableError(f"claude CLI rate limited: {stderr}")
            raise RetryableError(f"claude CLI exit {result.returncode}: {stderr or 'no stderr'}")

        output = (result.stdout or "").strip()
        if not output:
            raise RetryableError("claude CLI returned empty output.")
        return output

    def check(self) -> tuple[bool, str]:
        try:
            binary = self._resolve_binary()
        except FatalError as e:
            return False, str(e)

        try:
            result = self.call("Reply with the single word: ready")
        except FatalError as e:
            return False, str(e)
        except RetryableError as e:
            return False, f"claude CLI probe failed: {e}"
        except Exception as e:
            return False, f"claude CLI probe failed: {e}"

        if "ready" in result.lower():
            return True, f"Claude Code ({self.model}): authenticated and responsive ({binary})"
        return True, f"Claude Code ({self.model}): connected ({binary})"
