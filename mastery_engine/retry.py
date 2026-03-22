import random
import time
from typing import Callable, TypeVar

from mastery_engine.config import (
    RETRY_BASE_DELAY, RETRY_MULTIPLIER, RETRY_JITTER,
    RETRY_MAX_DELAY, RETRY_MAX_ATTEMPTS,
)

T = TypeVar("T")

RETRYABLE_SIGNALS = [
    "quota",
    "rate limit",
    "timeout",
    "transient",
    "connection",
    "temporarily unavailable",
    "503",
    "429",
    "500",
]

FATAL_SIGNALS = [
    "auth",
    "permission denied",
    "not found",
    "invalid credentials",
    "unauthorized",
]


class RetryableError(Exception):
    pass


class FatalError(Exception):
    pass


def classify_error(message: str) -> str:
    lower = message.lower()
    for sig in FATAL_SIGNALS:
        if sig in lower:
            return "fatal"
    for sig in RETRYABLE_SIGNALS:
        if sig in lower:
            return "retryable"
    return "retryable"  # default: retry unknown errors


def backoff_delay(attempt: int) -> float:
    delay = RETRY_BASE_DELAY * (RETRY_MULTIPLIER ** (attempt - 1))
    delay = min(delay, RETRY_MAX_DELAY)
    delay += random.uniform(0, RETRY_JITTER)
    return delay


def with_retry(
    fn: Callable[[], T],
    max_attempts: int = RETRY_MAX_ATTEMPTS,
    on_retry: Callable[[int, Exception], None] | None = None,
) -> T:
    """
    Retry fn up to max_attempts times with exponential backoff.
    Raises FatalError immediately on fatal errors.
    Raises RetryableError after max_attempts exhausted.
    """
    last_exc: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            return fn()
        except FatalError:
            raise
        except Exception as e:
            classification = classify_error(str(e))
            if classification == "fatal":
                raise FatalError(str(e)) from e
            last_exc = e
            if attempt < max_attempts:
                delay = backoff_delay(attempt)
                if on_retry:
                    on_retry(attempt, e)
                time.sleep(delay)

    raise RetryableError(
        f"Failed after {max_attempts} attempts: {last_exc}"
    ) from last_exc
