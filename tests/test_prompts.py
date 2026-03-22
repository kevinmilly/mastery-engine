from mastery_engine.prompts import (
    lesson_prompt, practice_set_prompt, capstone_prompt,
    overview_prompt, glossary_prompt, syllabus_prompt,
    analogy_extraction_prompt, topic_summary_prompt,
)


REQUIRED_LESSON_SECTIONS = [
    "## The Hook",
    "## Why It Matters",
    "## The Ladder",
    "## Worked Reality",
    "## Friction Point",
    "## Check Your Understanding",
    "## Mastery Question",
]


def _lesson(**kwargs) -> str:
    defaults = dict(
        subject="Thermodynamics",
        tier="Foundations",
        topic_title="The First Law",
        topic_description="Energy cannot be created or destroyed.",
        estimated_minutes=20,
        prior_topic_titles=[],
        prior_topic_summaries=[],
        recent_analogies=[],
    )
    defaults.update(kwargs)
    return lesson_prompt(**defaults)


# ── lesson_prompt ─────────────────────────────────────────────────────────────

def test_lesson_prompt_contains_all_sections():
    prompt = _lesson()
    for section in REQUIRED_LESSON_SECTIONS:
        assert section in prompt, f"Missing section: {section}"


def test_lesson_prompt_includes_subject():
    prompt = _lesson(subject="Biochemistry")
    assert "Biochemistry" in prompt


def test_lesson_prompt_includes_topic_title():
    prompt = _lesson(topic_title="Enzyme Kinetics")
    assert "Enzyme Kinetics" in prompt


def test_lesson_prompt_includes_prior_titles():
    prompt = _lesson(prior_topic_titles=["Topic A", "Topic B"])
    assert "Topic A" in prompt
    assert "Topic B" in prompt


def test_lesson_prompt_handles_empty_prior_context():
    prompt = _lesson(prior_topic_titles=[], prior_topic_summaries=[], recent_analogies=[])
    assert "None — this is the first topic." in prompt


def test_lesson_prompt_includes_recent_analogies():
    prompt = _lesson(recent_analogies=["a pump analogy", "a river analogy"])
    assert "a pump analogy" in prompt


def test_lesson_prompt_includes_payoff_instruction():
    prompt = _lesson()
    assert "payoff" in prompt.lower() or "what they will be able to" in prompt


def test_lesson_prompt_includes_competence_friction_instruction():
    prompt = _lesson()
    assert "competence friction" in prompt.lower() or "hits a wall" in prompt.lower()


# ── practice_set_prompt ───────────────────────────────────────────────────────

def test_practice_set_contains_exercises_and_answers():
    prompt = practice_set_prompt(
        subject="Law",
        tier="Foundations",
        topic_title="Offer and Acceptance",
        topic_description="The first elements of a valid contract.",
        prior_topic_titles=[],
    )
    assert "## Exercises" in prompt
    assert "## Answer Key" in prompt
    assert "Exercise 1" in prompt
    assert "Answer 6" in prompt


def test_practice_set_includes_domain_adaptation():
    prompt = practice_set_prompt("Physics", "Mechanics", "Newton's Laws", "Forces.", [])
    assert "quantitative" in prompt.lower() or "calculation" in prompt.lower()


# ── capstone_prompt ───────────────────────────────────────────────────────────

def test_capstone_contains_required_structure():
    prompt = capstone_prompt(
        subject="Real Estate",
        tier="Foundations",
        tier_topic_titles_and_descriptions="1. Topic A — desc\n2. Topic B — desc",
    )
    assert "### The Scenario" in prompt
    assert "### Your Tasks" in prompt
    assert "### What Good Work Looks Like" in prompt


def test_capstone_includes_domain_examples():
    prompt = capstone_prompt("Law", "Foundations", "topics here")
    assert "Law" in prompt
    # Domain adaptation list should mention law
    assert "law" in prompt.lower() or "client situation" in prompt.lower()


# ── overview_prompt ───────────────────────────────────────────────────────────

def test_overview_contains_required_sections():
    prompt = overview_prompt("Cybersecurity", 24, "topic list here")
    assert "## What This Curriculum Covers" in prompt
    assert "## How It Is Structured" in prompt
    assert "## What Makes This Hard" in prompt
    assert "## How to Use These Materials" in prompt
    assert "## Curriculum Map" in prompt


def test_overview_includes_subject():
    prompt = overview_prompt("Biochemistry", 24, "topics")
    assert "Biochemistry" in prompt


# ── syllabus_prompt ───────────────────────────────────────────────────────────

def test_syllabus_prompt_includes_tiers():
    prompt = syllabus_prompt("Thermodynamics", 8, 10)
    assert "Foundations" in prompt
    assert "Mechanics" in prompt
    assert "Mastery" in prompt


def test_syllabus_prompt_includes_topic_range():
    prompt = syllabus_prompt("Law", 8, 10)
    assert "8" in prompt and "10" in prompt


def test_syllabus_prompt_forbids_overview_topics():
    prompt = syllabus_prompt("Chemistry", 8, 10)
    assert "Introduction to" in prompt or "Overview of" in prompt  # Listed as forbidden


# ── lightweight prompts ───────────────────────────────────────────────────────

def test_analogy_extraction_includes_lesson_text():
    lesson = "The pump is like a heart..."
    prompt = analogy_extraction_prompt(lesson)
    assert "pump" in prompt


def test_topic_summary_prompt_includes_lesson_text():
    lesson = "Entropy is a measure of disorder..."
    prompt = topic_summary_prompt(lesson)
    assert "Entropy" in prompt
