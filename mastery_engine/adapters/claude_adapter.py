from mastery_engine.config import CLAUDE_HIGH
from mastery_engine.retry import FatalError, RetryableError
from mastery_engine.user_config import get_key


class ClaudeAdapter:
    def __init__(self, model: str = CLAUDE_HIGH):
        self.model = model
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                import anthropic
            except ImportError:
                raise FatalError(
                    "anthropic package not installed. Run: pip install anthropic"
                )
            api_key = get_key("anthropic_api_key")
            if not api_key:
                raise FatalError(
                    "Anthropic API key not configured. Run: mastery-engine setup"
                )
            self._client = anthropic.Anthropic(api_key=api_key)
        return self._client

    def call(self, prompt: str) -> str:
        client = self._get_client()
        try:
            message = client.messages.create(
                model=self.model,
                max_tokens=8192,
                messages=[{"role": "user", "content": prompt}],
            )
            content = message.content[0].text
            if not content or not content.strip():
                raise RetryableError("Claude returned empty output.")
            return content.strip()
        except FatalError:
            raise
        except RetryableError:
            raise
        except Exception as e:
            msg = str(e).lower()
            if any(sig in msg for sig in ["auth", "api_key", "unauthorized", "permission"]):
                raise FatalError(f"Claude auth failure: {e}")
            if any(sig in msg for sig in ["rate_limit", "overloaded", "timeout", "529", "529"]):
                raise RetryableError(f"Claude transient error: {e}")
            raise RetryableError(f"Claude error: {e}")

    def check(self) -> tuple[bool, str]:
        try:
            self._get_client()
        except FatalError as e:
            return False, str(e)

        try:
            result = self.call("Reply with the single word: ready")
            if "ready" in result.lower():
                return True, f"Anthropic ({self.model}): authenticated and responsive"
            return True, f"Anthropic ({self.model}): connected"
        except FatalError as e:
            return False, str(e)
        except Exception as e:
            return False, f"Claude probe failed: {e}"
