import json
import os
import signal
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from pydantic import BaseModel

from mastery_engine.config import STATE_DIR, TIERS
from mastery_engine.models import (
    Topic, TierState, RunStatus, RunConfig, FileRef, ContextCarry
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _subject_slug(subject: str) -> str:
    slug = subject.lower()
    slug = "".join(c if c.isalnum() else "-" for c in slug)
    slug = "-".join(p for p in slug.split("-") if p)
    return slug[:40]


def generate_run_id(subject: str) -> str:
    date = datetime.now(timezone.utc).strftime("%Y%m%d")
    hex4 = hashlib.md5(f"{subject}{date}{os.getpid()}".encode()).hexdigest()[:4]
    return f"{_subject_slug(subject)}-{date}-{hex4}"


class RunState(BaseModel):
    run_id: str
    subject: str
    status: RunStatus = RunStatus.INITIALIZING
    created_at: str = ""
    updated_at: str = ""
    config: RunConfig
    run_dir: Optional[str] = None
    overview_doc: FileRef = FileRef()
    glossary_doc: FileRef = FileRef()
    topics: list[Topic] = []
    tiers: dict[str, TierState] = {}
    prompt_metadata: dict[str, str] = {}
    context_carry: ContextCarry = ContextCarry()

    def model_post_init(self, __context: object) -> None:
        if not self.created_at:
            self.created_at = _now()
        if not self.updated_at:
            self.updated_at = _now()
        if not self.tiers:
            self.tiers = {t: TierState() for t in TIERS}

    def save(self, path: Path) -> None:
        self.updated_at = _now()
        tmp = path.with_suffix(".json.tmp")
        tmp.write_text(self.model_dump_json(indent=2), encoding="utf-8")
        tmp.replace(path)

    @classmethod
    def load(cls, path: Path) -> "RunState":
        data = json.loads(path.read_text(encoding="utf-8"))
        return cls.model_validate(data)

    def state_path(self) -> Path:
        return STATE_DIR / f"{self.run_id}.json"


def init_state(subject: str, max_topics: int, min_topics: int) -> RunState:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    run_id = generate_run_id(subject)
    state = RunState(
        run_id=run_id,
        subject=subject,
        config=RunConfig(
            max_topics_per_tier=max_topics,
            min_topics_per_tier=min_topics,
        ),
    )
    state.save(state.state_path())
    return state


def load_latest_incomplete(subject: Optional[str] = None) -> Optional[RunState]:
    """Return the most recently updated incomplete run, optionally filtered by subject."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    candidates = []
    for path in STATE_DIR.glob("*.json"):
        try:
            s = RunState.load(path)
            if s.status == RunStatus.COMPLETED:
                continue
            if subject and _subject_slug(s.subject) != _subject_slug(subject):
                continue
            candidates.append((s.updated_at, path, s))
        except Exception:
            continue
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][2]


def list_incomplete_runs() -> list[RunState]:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for path in STATE_DIR.glob("*.json"):
        try:
            s = RunState.load(path)
            if s.status != RunStatus.COMPLETED:
                results.append(s)
        except Exception:
            continue
    results.sort(key=lambda s: s.updated_at, reverse=True)
    return results


def load_by_run_id(run_id: str) -> RunState:
    path = STATE_DIR / f"{run_id}.json"
    if not path.exists():
        raise FileNotFoundError(f"No run found with ID: {run_id}")
    return RunState.load(path)


def register_signal_handler(state: RunState) -> None:
    """Flush state on SIGINT/SIGTERM so resume works after interruption."""
    def _handler(signum: int, frame: object) -> None:
        try:
            state.save(state.state_path())
        except Exception:
            pass
        raise SystemExit(1)

    signal.signal(signal.SIGINT, _handler)
    signal.signal(signal.SIGTERM, _handler)
