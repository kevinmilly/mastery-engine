from mastery_engine.config import GEMINI_LOW
from mastery_engine.retry import FatalError, RetryableError
from mastery_engine.user_config import get_key


class GeminiAdapter:
    def __init__(self, model: str = GEMINI_LOW):
        self.model = model
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                from google import genai
            except ImportError:
                raise FatalError(
                    "google-genai package not installed. Run: pip install google-genai"
                )
            api_key = get_key("google_api_key")
            if not api_key:
                raise FatalError(
                    "Google API key not configured. Run: mastery-engine setup"
                )
            self._client = genai.Client(api_key=api_key)
        return self._client

    def call(self, prompt: str) -> str:
        client = self._get_client()
        try:
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            text = response.text
            if not text or not text.strip():
                raise RetryableError("Gemini returned empty output.")
            return text.strip()
        except FatalError:
            raise
        except RetryableError:
            raise
        except Exception as e:
            msg = str(e).lower()
            if any(sig in msg for sig in ["api_key", "unauthorized", "permission", "auth", "403", "401"]):
                raise FatalError(f"Gemini auth failure: {e}")
            if any(sig in msg for sig in ["quota", "rate", "limit", "timeout", "503", "529"]):
                raise RetryableError(f"Gemini transient error: {e}")
            raise RetryableError(f"Gemini error: {e}")

    def check(self) -> tuple[bool, str]:
        try:
            self._get_client()
        except FatalError as e:
            return False, str(e)

        try:
            result = self.call("Reply with the single word: ready")
            if "ready" in result.lower():
                return True, f"Gemini ({self.model}): authenticated and responsive"
            return True, f"Gemini ({self.model}): connected"
        except FatalError as e:
            return False, str(e)
        except Exception as e:
            return False, f"Gemini probe failed: {e}"
