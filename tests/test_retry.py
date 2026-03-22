import pytest
from unittest.mock import patch
from mastery_engine.retry import (
    with_retry, FatalError, RetryableError, classify_error, backoff_delay
)


# ── classify_error ────────────────────────────────────────────────────────────

def test_auth_error_is_fatal():
    assert classify_error("auth failure") == "fatal"


def test_permission_denied_is_fatal():
    assert classify_error("permission denied") == "fatal"


def test_quota_error_is_retryable():
    assert classify_error("quota exceeded") == "retryable"


def test_timeout_is_retryable():
    assert classify_error("timeout occurred") == "retryable"


def test_unknown_error_is_retryable():
    assert classify_error("something unexpected happened") == "retryable"


# ── backoff_delay ─────────────────────────────────────────────────────────────

def test_backoff_increases_with_attempts():
    with patch("mastery_engine.retry.random.uniform", return_value=0):
        d1 = backoff_delay(1)
        d2 = backoff_delay(2)
        d3 = backoff_delay(3)
    assert d1 < d2 < d3


def test_backoff_caps_at_max():
    with patch("mastery_engine.retry.random.uniform", return_value=0):
        d = backoff_delay(100)  # Very high attempt
    from mastery_engine.config import RETRY_MAX_DELAY
    assert d <= RETRY_MAX_DELAY


# ── with_retry ────────────────────────────────────────────────────────────────

def test_succeeds_on_first_try():
    calls = []
    def fn():
        calls.append(1)
        return "ok"
    result = with_retry(fn)
    assert result == "ok"
    assert len(calls) == 1


def test_retries_on_failure_then_succeeds():
    calls = []
    def fn():
        calls.append(1)
        if len(calls) < 3:
            raise RuntimeError("transient error")
        return "ok"
    with patch("mastery_engine.retry.time.sleep"):
        result = with_retry(fn, max_attempts=3)
    assert result == "ok"
    assert len(calls) == 3


def test_raises_retryable_after_max_attempts():
    def fn():
        raise RuntimeError("quota exceeded")
    with patch("mastery_engine.retry.time.sleep"):
        with pytest.raises(RetryableError):
            with_retry(fn, max_attempts=3)


def test_fatal_error_raised_immediately():
    calls = []
    def fn():
        calls.append(1)
        raise FatalError("auth failure")
    with pytest.raises(FatalError):
        with_retry(fn, max_attempts=3)
    assert len(calls) == 1  # No retries


def test_fatal_classification_stops_retry():
    calls = []
    def fn():
        calls.append(1)
        raise RuntimeError("permission denied: access revoked")
    with pytest.raises(FatalError):
        with_retry(fn, max_attempts=3)
    assert len(calls) == 1


def test_on_retry_callback_called():
    retries = []
    def fn():
        raise RuntimeError("quota exceeded")
    def on_retry(attempt, exc):
        retries.append(attempt)
    with patch("mastery_engine.retry.time.sleep"):
        with pytest.raises(RetryableError):
            with_retry(fn, max_attempts=3, on_retry=on_retry)
    assert retries == [1, 2]  # Called before attempts 2 and 3
