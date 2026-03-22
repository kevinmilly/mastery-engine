from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator
from mastery_engine.config import ESTIMATED_MINUTES_MIN, ESTIMATED_MINUTES_MAX, TIERS


class TopicStatus(str, Enum):
    PENDING = "pending"
    LESSON_GENERATED = "lesson_generated"
    LESSON_FILE_CREATED = "lesson_file_created"
    PRACTICE_GENERATED = "practice_generated"
    PRACTICE_FILE_CREATED = "practice_file_created"
    INDEX_UPDATED = "index_updated"
    COMPLETED = "completed"
    FAILED = "failed"


class TierStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    CAPSTONE_GENERATED = "capstone_generated"
    CAPSTONE_FILE_CREATED = "capstone_file_created"
    COMPLETED = "completed"
    FAILED = "failed"


class RunStatus(str, Enum):
    INITIALIZING = "initializing"
    SYLLABUS_GENERATED = "syllabus_generated"
    OVERVIEW_CREATED = "overview_created"
    GLOSSARY_CREATED = "glossary_created"
    INDEX_SEEDED = "index_seeded"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class FileRef(BaseModel):
    id: str = ""  # For local, this is the relative path
    url: str = "" # For local, this is also the relative path


class RawTopic(BaseModel):
    """Topic as returned by the syllabus prompt (before ID assignment)."""
    title: str
    description: str
    tier: str
    sequence: int

    @field_validator("tier")
    @classmethod
    def tier_must_be_valid(cls, v: str) -> str:
        if v not in TIERS:
            raise ValueError(f"tier must be one of {TIERS}, got {v!r}")
        return v

    @field_validator("sequence")
    @classmethod
    def sequence_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError(f"sequence must be >= 1, got {v}")
        return v


class Topic(BaseModel):
    id: str
    title: str
    description: str
    tier: str
    sequence: int
    estimated_minutes: int
    status: TopicStatus = TopicStatus.PENDING
    lesson_file: FileRef = FileRef()
    practice_file: FileRef = FileRef()
    error: Optional[str] = None
    retry_count: int = 0

    @field_validator("estimated_minutes")
    @classmethod
    def minutes_in_range(cls, v: int) -> int:
        if not (ESTIMATED_MINUTES_MIN <= v <= ESTIMATED_MINUTES_MAX):
            raise ValueError(
                f"estimated_minutes must be {ESTIMATED_MINUTES_MIN}–{ESTIMATED_MINUTES_MAX}, got {v}"
            )
        return v


class TierState(BaseModel):
    status: TierStatus = TierStatus.PENDING
    capstone_file: FileRef = FileRef()


class RunConfig(BaseModel):
    max_topics_per_tier: int
    min_topics_per_tier: int


class ContextCarry(BaseModel):
    recent_analogies: list[str] = []
    prior_topic_summaries: dict[str, str] = {}


class SyllabusResponse(BaseModel):
    topics: list[RawTopic]
