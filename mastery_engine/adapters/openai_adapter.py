from mastery_engine.config import OPENAI_LOW
from mastery_engine.retry import FatalError, RetryableError
from mastery_engine.user_config import get_key


class OpenAIAdapter:
    def __init__(self, model: str = OPENAI_LOW):
        self.model = model
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                from openai import OpenAI
            except ImportError:
                raise FatalError(
                    "openai package not installed. Run: pip install openai"
                )
            api_key = get_key("openai_api_key")
            if not api_key:
                raise FatalError(
                    "OpenAI API key not configured. Run: mastery-engine setup"
                )
            self._client = OpenAI(api_key=api_key)
        return self._client

    def call(self, prompt: str) -> str:
        client = self._get_client()
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=8192,
            )
            content = response.choices[0].message.content
            if not content or not content.strip():
                raise RetryableError("OpenAI returned empty output.")
            return content.strip()
        except FatalError:
            raise
        except RetryableError:
            raise
        except Exception as e:
            msg = str(e).lower()
            if any(sig in msg for sig in ["auth", "api_key", "invalid_api_key", "unauthorized"]):
                raise FatalError(f"OpenAI auth failure: {e}")
            if any(sig in msg for sig in ["rate_limit", "quota", "overloaded", "timeout", "503", "529"]):
                raise RetryableError(f"OpenAI transient error: {e}")
            raise RetryableError(f"OpenAI error: {e}")

    def check(self) -> tuple[bool, str]:
        try:
            self._get_client()
        except FatalError as e:
            return False, str(e)
        try:
            result = self.call("Reply with the single word: ready")
            if "ready" in result.lower():
                return True, f"OpenAI ({self.model}): authenticated and responsive"
            return True, f"OpenAI ({self.model}): connected"
        except FatalError as e:
            return False, str(e)
        except Exception as e:
            return False, f"OpenAI probe failed: {e}"
