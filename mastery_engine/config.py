from pathlib import Path

DEFAULT_MIN_TOPICS_PER_TIER = 8
DEFAULT_MAX_TOPICS_PER_TIER = 10
ESTIMATED_MINUTES_MIN = 15
ESTIMATED_MINUTES_MAX = 25
STATE_DIR = Path.home() / ".mastery-engine" / "runs"
CONFIG_FILE = Path.home() / ".mastery-engine" / "config.json"

# ── Model tiers ───────────────────────────────────────────────────────────────
# HIGH: tasks requiring sustained reasoning, domain judgment, and teaching quality
# LOW:  tasks that are structural, extractive, or JSON-formatting work

GEMINI_HIGH = "gemini-2.5-pro-preview-05-06"
GEMINI_LOW  = "gemini-2.0-flash"

OPENAI_HIGH = "gpt-4o"
OPENAI_LOW  = "gpt-4o-mini"

CLAUDE_HIGH = "claude-sonnet-4-6"
CLAUDE_LOW  = "claude-haiku-4-5-20251001"

# Task → model tier mapping
HIGH_TASKS = {"lesson", "practice_set", "capstone"}
LOW_TASKS  = {"syllabus", "repair", "overview", "glossary", "analogy_extraction", "topic_summary"}

# Fallback chain order (Gemini always first — uses CLI auth, not API key)
FALLBACK_ORDER = ["gemini", "openai", "anthropic"]

# ── Retry ─────────────────────────────────────────────────────────────────────
RETRY_BASE_DELAY = 2
RETRY_MULTIPLIER = 2
RETRY_JITTER = 1.0
RETRY_MAX_DELAY = 30
RETRY_MAX_ATTEMPTS = 3
REPAIR_MAX_ATTEMPTS = 2

# ── Context windows ───────────────────────────────────────────────────────────
RECENT_ANALOGIES_WINDOW = 8
PRIOR_SUMMARIES_WINDOW = 5

TIERS = ["Foundations", "Mechanics", "Mastery"]
