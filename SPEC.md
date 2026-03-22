# MasteryEngine — Finalized Implementation Spec

## Summary

MasteryEngine is a modular Python CLI that orchestrates `gemini` and Google Workspace CLIs to turn any subject into a structured microlearning curriculum. v1 is Google-Workspace-only, uses resumable local run state, validates all model JSON before use, and prioritizes teaching quality. Lessons are reading-first Google Docs with realistic examples, explicit misconception handling, transfer-style mastery checks, graded practice sets, and tier capstone projects.

Subjects range from Biochemistry to Law to Real Estate to Cybersecurity to Thermodynamics — all prompts must be domain-adaptive.

---

## Public CLI

```
mastery-engine build "<subject>" [--resume [--run-id ID]] [--max-topics-per-tier N] [--dry-run]
mastery-engine doctor
mastery-engine status [--run-id ID]
```

`--output-dir` removed from v1. All docs go to Google Workspace, state goes to `~/.mastery-engine/runs/`.

---

## Package Structure

```
mastery_engine/
├── __init__.py
├── cli.py
├── orchestrator.py
├── models.py
├── state.py
├── validation.py
├── retry.py
├── prompts.py
├── config.py
├── logging_utils.py
├── adapters/
│   ├── __init__.py
│   ├── gemini_adapter.py
│   └── workspace_adapter.py
└── tests/
    ├── __init__.py
    ├── test_validation.py
    ├── test_state.py
    ├── test_retry.py
    ├── test_prompts.py
    ├── test_adapters.py
    └── test_workflow.py
pyproject.toml
```

---

## Deliverables Per Run

| Artifact                | Quantity        | What it is                                           |
| ----------------------- | --------------- | ---------------------------------------------------- |
| Lesson doc              | 1 per topic     | Reading-first lesson (Hook → Mastery Question)       |
| Practice set doc        | 1 per topic     | 6 graded exercises + answer key                      |
| Tier capstone doc       | 1 per tier (3)  | Realistic integrative scenario + 4–5 tasks           |
| Curriculum overview doc | 1 per run       | Orientation, tier logic, "What Makes This Hard", map |
| Master glossary doc     | 1 per run       | 30–60 terms, alphabetical                            |
| Google Sheets dashboard | 1 per run       | Tracking sheet with Summary + 3 tier tabs            |

At 8–12 topics per tier: **53–77 Google Docs total**.

---

## Curriculum Contract

- Exactly 3 tiers in fixed order: `Foundations`, `Mechanics`, `Mastery`
- Default 8–12 topics per tier (`--max-topics-per-tier` overrides the upper bound)
- Each topic: `title`, `description` (2–3 sentences), `tier`, `sequence` (1-indexed, restarts per tier), `estimated_minutes` (15–25)
- `id` is engine-assigned post-validation: `{tier_slug}-{sequence:02d}` (e.g., `foundations-01`, `mechanics-03`)
- Topics must be unique, specific, scoped to one serious reading session
- Estimated minutes violations: hard failure → repair prompt, not clamped

---

## Google Sheets Dashboard

Spreadsheet title: `Mastery: <Subject>`

Tabs in fixed order: `Summary`, `Foundations`, `Mechanics`, `Mastery`

**Tier tab columns:**

| A      | B     | C      | D            | E            | F        | G        |
| ------ | ----- | ------ | ------------ | ------------ | -------- | -------- |
| Status | Topic | Lesson | Practice Set | Mastery Note | Topic ID | Capstone |

- Bold headers, frozen top row, checkbox validation in column A
- Seed all topic rows before any docs are created
- Capstone row sits below topic rows in each tier tab
- Summary tab links to overview and glossary docs, shows per-tier and overall completion formulas (counting checked checkboxes)

---

## State Management

### Status Enums

```python
class TopicStatus(str, Enum):
    PENDING = "pending"
    LESSON_GENERATED = "lesson_generated"
    LESSON_DOC_CREATED = "lesson_doc_created"
    PRACTICE_GENERATED = "practice_generated"
    PRACTICE_DOC_CREATED = "practice_doc_created"
    SHEET_UPDATED = "sheet_updated"
    COMPLETED = "completed"
    FAILED = "failed"

class TierStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    CAPSTONE_GENERATED = "capstone_generated"
    CAPSTONE_DOC_CREATED = "capstone_doc_created"
    COMPLETED = "completed"
    FAILED = "failed"

class RunStatus(str, Enum):
    INITIALIZING = "initializing"
    SYLLABUS_GENERATED = "syllabus_generated"
    OVERVIEW_CREATED = "overview_created"
    GLOSSARY_CREATED = "glossary_created"
    SPREADSHEET_SEEDED = "spreadsheet_seeded"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
```

### State File Schema

Location: `~/.mastery-engine/runs/<run-id>.json`
Write strategy: atomic (write to `.tmp`, rename)

```json
{
  "run_id": "string",
  "subject": "string",
  "status": "RunStatus",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "config": {
    "max_topics_per_tier": 10,
    "min_topics_per_tier": 8
  },
  "spreadsheet": {
    "id": "string",
    "url": "string",
    "title": "string"
  },
  "overview_doc": { "id": "string", "url": "string" },
  "glossary_doc": { "id": "string", "url": "string" },
  "topics": [
    {
      "id": "foundations-01",
      "title": "string",
      "description": "string",
      "tier": "Foundations",
      "sequence": 1,
      "estimated_minutes": 20,
      "status": "TopicStatus",
      "lesson_doc": { "id": "string", "url": "string" },
      "practice_doc": { "id": "string", "url": "string" },
      "sheet_row": 2,
      "error": "string | null",
      "retry_count": 0
    }
  ],
  "tiers": {
    "Foundations": {
      "status": "TierStatus",
      "capstone_doc": { "id": "string", "url": "string" },
      "sheet_row": 12
    },
    "Mechanics": {},
    "Mastery": {}
  },
  "prompt_metadata": {
    "syllabus_prompt_hash": "string",
    "lesson_prompt_hash": "string"
  },
  "context_carry": {
    "recent_analogies": ["string"],
    "prior_topic_summaries": {
      "foundations-01": "string (1-2 sentences)"
    }
  }
}
```

### Run ID

Format: `{subject-slug}-{YYYYMMDD}-{4-char-hex}` (e.g., `thermodynamics-20260322-a3f1`)

### Resume Logic

- `--resume` with no `--run-id`: selects most recent incomplete run by `updated_at`. If multiple subjects have incomplete runs, prints a numbered list and asks which to resume. If none exist, exits with clear error.
- `--resume --run-id ID`: loads that specific run, errors if not found.
- Re-running same subject without `--resume`: new run, new ID, never overwrites.
- Resume skips any step where the artifact already exists (idempotent).

---

## Retry and Error Handling

```python
RETRY_POLICY = {
    "max_attempts": 3,
    "base_delay_seconds": 2,
    "multiplier": 2,
    "jitter_range_seconds": 1,
    "max_delay_seconds": 30,
}
# Delays: attempt 1 → 2s ±1s, attempt 2 → 4s ±1s, attempt 3 → 8s ±1s

REPAIR_MAX_ATTEMPTS = 2  # separate from general retry
```

**Retryable:** quota exceeded, transient network, workspace timeout, gemini timeout

**Fatal:** auth failure, CLI not found, schema validation after max repair, workspace permission denied

**SIGINT/SIGTERM:** signal handler flushes current state file before exit. In-progress topic left at last completed status.

---

## Adapter Contracts

### Gemini Adapter

- Prompt via **stdin**, response from **stdout**
- Model via `--model` flag
- Returns raw string; parsing happens in `validation.py`
- Error detection: non-zero exit code or empty stdout

### Workspace Adapter

Each operation returns a typed dataclass. Assumed `gws` command shapes (adapter-isolated — only adapter changes if actual CLI differs):

| Operation           | Assumed command shape                                                                 |
| ------------------- | ------------------------------------------------------------------------------------- |
| Create spreadsheet  | `gws sheets create --title "..."` → returns spreadsheet ID                            |
| Create tab          | `gws sheets add-sheet --id SHEET_ID --title "..."`                                    |
| Write cell          | `gws sheets update --id SHEET_ID --sheet "Tab" --range "A1" --value "..."`            |
| Checkbox validation | `gws sheets set-validation --id SHEET_ID --sheet "Tab" --range "A2:A50" --type checkbox` |
| Bold row            | `gws sheets format --id SHEET_ID --sheet "Tab" --range "1:1" --bold`                  |
| Freeze row          | `gws sheets freeze --id SHEET_ID --sheet "Tab" --rows 1`                              |
| Create doc          | `gws docs create --title "..."` → returns doc ID and URL                              |
| Write doc content   | `gws docs append --id DOC_ID --content "..."`                                         |
| Update cell (link)  | `gws sheets update --id SHEET_ID --sheet "Tab" --range "C2" --value '=HYPERLINK("URL","Open")'` |

---

## Config Defaults (`config.py`)

```python
DEFAULT_MIN_TOPICS_PER_TIER = 8
DEFAULT_MAX_TOPICS_PER_TIER = 10
ESTIMATED_MINUTES_MIN = 15
ESTIMATED_MINUTES_MAX = 25
STATE_DIR = Path.home() / ".mastery-engine" / "runs"
GEMINI_MODEL = "gemini-2.0-flash"
RETRY_BASE_DELAY = 2
RETRY_MULTIPLIER = 2
RETRY_JITTER = 1
RETRY_MAX_DELAY = 30
RETRY_MAX_ATTEMPTS = 3
REPAIR_MAX_ATTEMPTS = 2
```

---

## Implementation Flow

### `doctor`
1. Verify `gemini` CLI found on PATH
2. Verify `gemini` auth (test call or auth check command)
3. Verify `gws` CLI found on PATH
4. Verify `gws` auth (test call or auth check command)
5. Verify adapter parsing assumptions (small test output)
6. Print pass/fail per check

### `build`
1. Initialize run state
2. Generate syllabus JSON via gemini
3. Validate JSON against schema; if invalid → repair prompt (up to 2 attempts) → fail
4. Assign topic IDs (`{tier_slug}-{sequence:02d}`)
5. Generate overview doc content → create Google Doc → persist
6. Generate glossary doc content → create Google Doc → persist
7. Create spreadsheet and tabs (Summary, Foundations, Mechanics, Mastery)
8. Seed all tier rows (topics + capstone placeholder) and persist row mapping
9. For each topic in deterministic order (Foundations → Mechanics → Mastery, by sequence):
   a. Generate lesson text (with prior context carry)
   b. Create Google Doc, write lesson content, persist doc metadata
   c. Generate practice set text
   d. Create Google Doc, write practice set content, persist doc metadata
   e. Update sheet row with lesson + practice set links
   f. Extract analogy from lesson (store in `context_carry.recent_analogies`)
   g. Generate 1–2 sentence summary of this topic (store in `context_carry.prior_topic_summaries`)
   h. Mark topic completed
10. After all topics in a tier complete:
    a. Generate capstone using all tier topic titles/descriptions
    b. Create Google Doc, write capstone content, persist
    c. Update sheet capstone row with link
    d. Mark tier completed
11. Update Summary tab with links to overview/glossary and completion formulas
12. Print dashboard URL + run ID

### `status`
1. Read local run state
2. Print: subject, status, per-tier progress bar, last updated, dashboard URL
3. If no runs: `No runs found in ~/.mastery-engine/runs/`

### `--dry-run`
1. Generate syllabus and validate
2. Print full topic list as readable table
3. Generate one sample lesson (first Foundations topic) and print to stdout
4. Print summary: `Would create: 1 spreadsheet, N docs, N practice sets, 3 capstones, 1 overview, 1 glossary`
5. Save nothing to state

---

## Context Carry Between Lessons

### `{prior_topic_titles}`
All completed topic titles within the **same tier** only. For the first topic in a tier, this is empty.

### `{prior_topic_summaries}`
1–2 sentence summaries generated after each lesson. Bounded to the **last 5 topics in the same tier** to avoid prompt bloat. Generated by a lightweight follow-up prompt or extracted from the lesson's "Why It Matters" section.

### `{recent_analogies}`
Rolling window of the **last 8 analogies** across all tiers. Extracted from lesson output by a lightweight follow-up prompt: "What was the primary analogy used in this lesson? Reply with one sentence only."

### First-topic edge case
When all prior-context fields are empty, pass `"None — this is the first topic."` for each. The lesson prompt handles this naturally.

---

## Prompts

### Syllabus Generation Prompt

```
You are designing a structured microlearning curriculum for a motivated self-directed learner.

Your job is to produce a topic list only — not lessons, not explanations, not commentary.

Subject: {subject}
Topics per tier: {min_topics}–{max_topics}

## Curriculum Structure

The curriculum must have exactly 3 tiers in exactly this order:

1. Foundations — core concepts, mental models, and vocabulary a beginner must build first
2. Mechanics — how things actually work: processes, rules, interactions, and cause-effect relationships
3. Mastery — advanced application, edge cases, tradeoffs, and judgment under real conditions

## Topic Requirements

Each topic must:
- Cover exactly one learnable concept scoped to a single serious reading session (15–25 minutes)
- Be specific enough that a lesson writer knows exactly what to teach
- Build on what comes before it within the tier
- Have a description of 2–3 sentences that explains what the topic covers and why it matters at this stage

Each topic must not:
- Duplicate or substantially overlap with any other topic in the curriculum
- Be an overview, introduction, or survey of a broad area (e.g., "Introduction to X", "Overview of Y", "X in Practice")
- Rely on knowledge not yet introduced in the curriculum sequence
- Use a vague title that could mean many different things (e.g., "Advanced Concepts", "Key Ideas", "Important Patterns")
- Be filler that exists only to pad the curriculum to the required count

## Output Format

Return only valid JSON with no commentary, markdown, or explanation before or after.

{
  "topics": [
    {
      "title": "string",
      "description": "string (2-3 sentences)",
      "tier": "Foundations" | "Mechanics" | "Mastery",
      "sequence": integer (1-indexed, restarts per tier)
    }
  ]
}

Rules:
- Output all tiers. Do not skip any.
- Output topics in tier order: all Foundations first, then Mechanics, then Mastery.
- Within each tier, output topics in sequence order.
- Do not add fields not listed above.
- Do not wrap the JSON in a code block.
```

### JSON Repair Prompt

```
The following text was supposed to be a valid JSON syllabus for a microlearning curriculum but failed schema validation.

Subject: {subject}
Validation error: {validation_error}

Broken output:
{broken_output}

Required schema:
{
  "topics": [
    {
      "title": "string",
      "description": "string (2-3 sentences)",
      "tier": "Foundations" | "Mechanics" | "Mastery",
      "sequence": integer (1-indexed, restarts per tier)
    }
  ]
}

Rules:
- Return only valid JSON matching this schema exactly.
- Do not add fields not in the schema.
- Do not wrap in a code block.
- Do not explain what you changed.
- Preserve all original topic content unless it violates the schema.
- If a field is missing, infer it from context rather than inventing new content.
```

### Lesson Generation Prompt

```
You are writing one microlearning lesson for a motivated learner.

Your job is not to impress, summarize, or sound academic. Your job is to teach so clearly that a serious beginner can build real understanding from reading.

Write the lesson for this topic:

Subject: {subject}
Tier: {tier}
Topic Title: {topic_title}
Topic Description: {topic_description}
Estimated Reading Time: {estimated_minutes} minutes

Relevant prior context:
- Prior topics in this tier: {prior_topic_titles}
- Brief carry-forward summary: {prior_topic_summaries}
- Recent analogies already used: {recent_analogies}

## Teaching Goal
Teach this topic so the learner:
1. forms a correct mental model,
2. understands why it matters,
3. can follow the mechanism without getting lost in jargon,
4. can recognize the most common misunderstanding,
5. can reason about the idea in a realistic situation.

This lesson is primarily reading material. It is not a worksheet and it is not a generic encyclopedia article.

## Required Writing Standard
- Write for a bright beginner who wants serious understanding.
- Be clear, concrete, and specific.
- Build from intuitive understanding to technical understanding.
- Define technical terms immediately when first introduced.
- Prefer one strong example over many shallow examples.
- Use realistic situations, not fake fluff.
- Keep the lesson scoped tightly to this one topic.
- Do not assume the learner already knows advanced prerequisites unless they are present in the provided prior context.
- Do not include unsupported factual specifics, obscure statistics, or named claims unless they are essential and reliable.
- Do not pad with motivational filler or generic conclusions.

## Hard Constraints
- Use exactly the section headings below, in exactly this order.
- Do not add extra top-level sections.
- Do not omit any section.
- Do not output JSON.
- Do not include notes to the instructor.
- Do not mention these instructions.

# Required Output Structure

## The Hook
If this topic is technical, procedural, or inherently abstract, open with one specific payoff sentence before the analogy: tell the learner exactly what they will be able to do, see, or understand after this lesson that they currently cannot. Make it specific to this topic — not generic encouragement.

Then follow with one concrete analogy, comparison, or intuitive frame that makes the topic easier to grasp.
Rules:
- The analogy must map meaningfully to the concept.
- It must not be childish, cute for its own sake, or unrelated.
- It must not repeat an analogy from `recent_analogies`.
- Keep it short and useful.

## Why It Matters
Explain where this topic shows up in real life, work, systems, or decisions.
Rules:
- Name a realistic consequence, use case, or practical situation.
- Be specific enough that the reader sees why the topic exists.
- If this topic is technical or abstract, name a specific real consequence of not understanding it — the moment a practitioner hits a wall because they skipped this. Competence friction is more motivating than a list of use cases.
- Avoid vague claims like "this is important in many fields."

## The Ladder
Teach the concept progressively.
Rules:
- Start from the intuitive picture.
- Then explain the mechanism.
- Then explain the implication or consequence.
- Define jargon immediately.
- If a term is necessary, explain it in plain language first.
- Avoid giant leaps in abstraction.
- This should be the main teaching section.

## Worked Reality
Show the concept in action through one realistic example, scenario, or mini-case.
Rules:
- This is primarily an applied reading example, not a mandatory coding drill.
- Walk through what is happening and why.
- Use enough detail that the learner can mentally simulate the situation.
- Prefer real-world texture over abstract toy examples.

## Friction Point
Identify the single most common misunderstanding or confusion point.
Rules:
- State the wrong mental model clearly.
- Explain why it is tempting.
- Replace it with the correct mental model.
- Clarify the distinction in plain language.
- Do not just repeat the definition.

## Check Your Understanding
Write 3 short comprehension checks.
Rules:
- They should test understanding, not trivia.
- They should be answerable from genuine comprehension of the lesson.
- Mix forms if useful: short-answer, compare/contrast, "what would happen if..."
- Do not provide answers.

## Mastery Question
Write 1 harder transfer question.
Rules:
- It must require application, synthesis, or judgment.
- It must not be answerable by quoting a sentence from the lesson.
- It should force the learner to use the mental model in a new but related situation.
- Keep it challenging but fair.

## Quality Guardrails
Avoid these failure modes:
- textbook-style dumping of definitions
- empty "engaging" tone without substance
- abstract explanations with no grounded example
- unexplained jargon
- analogies that break under inspection
- fake friction points that are really just restated terminology
- easy quiz questions that only test recall
- mastery questions that are just "define X in your own words"
- repetitive phrasing that makes lessons feel templated

## Continuity Rules
- If prior context is provided, connect this lesson to it naturally.
- Reuse prior knowledge, but do not assume the learner remembers every detail.
- If there is a meaningful contrast with earlier topics, make it explicit.
- Avoid reusing the same analogy family too often.

## Final Instruction
Write the full lesson now with strong teaching quality, concrete explanation, and realistic application. Optimize for real understanding, not coverage.
```

### Practice Set Prompt

```
You are writing a practice set for a learner who has just read a microlearning lesson.

Your job is to produce exercises that test genuine understanding and application — not recall of definitions.

Subject: {subject}
Tier: {tier}
Topic Title: {topic_title}
Topic Description: {topic_description}

Prior topics in this tier: {prior_topic_titles}

## Exercise Structure

Write exactly 6 exercises that progress in difficulty:
- Exercises 1–2: Comprehension and direct application
- Exercises 3–4: Analysis in a new but related situation
- Exercises 5–6: Synthesis requiring integration with prior concepts or judgment under realistic conditions

## Domain Adaptation

Match exercise format to the subject domain:
- Quantitative domains (chemistry, physics, engineering, math): include problems requiring calculation, derivation, or step-by-step working
- Qualitative domains (law, real estate, policy, history): include analysis, argument construction, scenario reasoning, or case application
- Mixed domains (medicine, economics, computer science, cybersecurity): use both types as appropriate

Do not force a format that does not fit the domain.

## Hard Constraints
- Every exercise must be answerable using concepts from this lesson and prior context
- No exercise should be answerable by quoting a sentence from the lesson
- No trivial definition recall ("Define X" or "What is X?")
- Each exercise must have a specific, clear question
- Model answers must show reasoning, not just conclusions
- For quantitative exercises, show the method, not just the final number

## Required Output Structure

Use exactly these section headings in exactly this order. Do not add sections.

## Exercises

**Exercise 1**
[question]

**Exercise 2**
[question]

**Exercise 3**
[question]

**Exercise 4**
[question]

**Exercise 5**
[question]

**Exercise 6**
[question]

---

## Answer Key

**Answer 1**
[substantive answer with reasoning]

**Answer 2**
[substantive answer with reasoning]

**Answer 3**
[substantive answer with reasoning]

**Answer 4**
[substantive answer with reasoning]

**Answer 5**
[substantive answer with reasoning]

**Answer 6**
[substantive answer with reasoning]
```

### Capstone Prompt

```
You are writing a capstone project for a learner who has completed the {tier} tier of a structured curriculum.

The capstone is a performance task — not a test. It requires the learner to integrate multiple concepts from this tier in a realistic, demanding situation.

Subject: {subject}
Tier: {tier}
Topics covered in this tier:
{tier_topic_titles_and_descriptions}

## Capstone Requirements

The capstone must:
1. Present a realistic, specific scenario from the actual domain of the subject
2. Require integration of at least 3 concepts from different topics in this tier
3. Have a clear deliverable the learner knows they are producing
4. Include 4–5 distinct tasks, each requiring different reasoning
5. Be completable by a learner who genuinely worked through the tier — challenging but fair

## Domain Adaptation

Ground the scenario in the real domain:
- Law: a client situation, contract dispute, or regulatory question
- Real Estate: a specific deal, investment decision, or market analysis
- Biochemistry: a research scenario, experimental design, or clinical case
- Cybersecurity: a threat scenario, incident response, or system audit
- Thermodynamics: a system design, efficiency problem, or engineering tradeoff
- All other subjects: a situation a real practitioner in this field would actually face

Generic or abstract scenarios are not acceptable.

## Hard Constraints
- Do not provide answers or hints within the capstone
- Do not make tasks overlap substantially — each should require distinct reasoning
- The scenario must have enough specific detail that the learner knows what they are working with
- "What good work looks like" must describe reasoning quality, not restate the tasks

## Required Output Structure

## Capstone: {tier} — {subject}

### The Scenario
[2–4 paragraphs. Specific situation, relevant context, enough detail to work with.]

### Your Tasks
1. [Task]
2. [Task]
3. [Task]
4. [Task]
5. [Task]

### What Good Work Looks Like
[3–5 bullet points describing what a strong response demonstrates — no answers]
```

### Curriculum Overview Prompt

```
You are writing the opening orientation document for a learner starting a structured microlearning curriculum.

Your job is to orient them clearly: what they will learn, why it is structured this way, and exactly how to use the materials.

Subject: {subject}
Total topics: {total_topic_count}
Tiers and topics:
{tier_topic_list}

## Hard Constraints
- No motivational filler
- No generic learning advice not specific to this subject
- No promises about outcomes
- Keep the tone direct and informative
- Explain the tier logic in terms of the actual subject, not generic pedagogy

## Required Output Structure

# Curriculum Overview: {subject}

## What This Curriculum Covers
[What the learner will understand and be able to do on completion. What is explicitly out of scope.]

## How It Is Structured
[Explain the three-tier logic in terms of this specific subject:
- What Foundations builds and why it comes first
- What Mechanics adds and why it follows
- What Mastery requires and what it prepares the learner for]

## What Makes This Hard (and Worth It)
For each tier, name 1–2 topics that learners typically find difficult or unintuitive. For each one:
- Say plainly why it trips people up
- Say what becomes clear once it clicks
- Do not soften it — treat the learner as capable of handling honest difficulty

This is not a warning. It is a frame that converts frustration into expected progress.

## How to Use These Materials
1. Read the lesson doc for each topic before attempting anything else
2. Attempt every exercise in the practice set before reading the answer key
3. Complete the tier capstone before moving to the next tier
4. Use the master glossary when a term is unclear
[Add subject-specific guidance only where genuinely useful. Cut anything generic.]

## Curriculum Map

### Foundations
1. [Topic Title] — [one sentence]
...

### Mechanics
1. [Topic Title] — [one sentence]
...

### Mastery
1. [Topic Title] — [one sentence]
...
```

### Glossary Prompt

```
You are generating a master glossary for a structured microlearning curriculum.

Subject: {subject}
The curriculum covers these topics:
{tier_topic_titles_and_descriptions}

## Your Task

Identify every technical term, domain-specific concept, and field jargon a learner will encounter across this curriculum. For each term write a definition that:
- Opens with a plain-language explanation
- Follows with the precise technical meaning
- Notes common confusion or misuse only when genuinely relevant
- Is scoped to how the term is used in this subject

## Requirements
- Include every term a beginner would not already know
- Do not include ordinary English words used in their ordinary sense
- Do not write circular definitions
- Order alphabetically
- Target 30–60 terms depending on subject complexity
- Definitions must be accurate — do not speculate on technical meanings

## Required Output Structure

# Glossary: {subject}

**[Term]**
[Definition — 2–4 sentences]

**[Term]**
[Definition — 2–4 sentences]

[continue alphabetically...]
```

### Analogy Extraction Prompt (lightweight follow-up)

```
What was the primary analogy or comparison used in the following lesson? Reply with one sentence only describing the analogy.

Lesson text:
{lesson_text}
```

### Topic Summary Prompt (lightweight follow-up)

```
Summarize the key concept taught in the following lesson in 1–2 sentences. Focus on what the learner should carry forward, not the lesson structure.

Lesson text:
{lesson_text}
```

---

## CLI UX

### `doctor` output

```
mastery-engine doctor

✓ gemini CLI found at /usr/local/bin/gemini
✓ gemini auth: authenticated
✓ gws CLI found at /usr/local/bin/gws
✓ gws auth: Google Workspace connected
✓ adapter output shapes: OK

All checks passed. Ready to build.
```

On failure: `✗ gemini CLI not found` with install guidance, exit code 2.

### `status` output

```
Run: thermodynamics-20260322-a3f1
Subject: Thermodynamics
Status: in_progress

Foundations    ████████░░  8/10 topics complete
Mechanics     ░░░░░░░░░░  0/10 topics complete
Mastery       ░░░░░░░░░░  0/10 topics complete

Last updated: 2026-03-22 14:32
Dashboard: https://docs.google.com/spreadsheets/d/...
```

### Exit Codes

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| 0    | Success                                         |
| 1    | General error                                   |
| 2    | Auth or config failure                          |
| 3    | Schema validation failure (non-repairable)      |
| 4    | Partial completion (some topics failed)         |

---

## Packaging (`pyproject.toml`)

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "mastery-engine"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "click>=8.1",
    "pydantic>=2.0",
    "rich>=13.0",
]

[project.scripts]
mastery-engine = "mastery_engine.cli:main"
```

---

## Test Plan

### Unit tests
- Syllabus schema validation (valid, missing fields, wrong types, out-of-range minutes)
- Tier ordering and topic constraints (uniqueness, sequence, count bounds)
- Topic ID generation (`{tier_slug}-{sequence:02d}`)
- Retry classification (retryable vs. fatal)
- Backoff calculation with jitter
- Resume-state loading and skip logic (each TopicStatus transition)
- Prompt construction includes all required sections and context inputs
- Prompt construction with empty prior context (first topic edge case)
- Repair loop terminates after REPAIR_MAX_ATTEMPTS
- `--max-topics-per-tier` effect on validation bounds

### Adapter tests (mocked CLI output)
- Success cases for each operation
- Malformed JSON from gemini
- Auth failures (non-zero exit, specific error messages)
- Quota/transient failures
- Unexpected command output format
- Empty stdout handling

### Workflow tests
- Dry-run path (no Workspace artifacts, correct stdout)
- Partial failure after some docs created → successful resume
- Resume skips completed topics without duplication
- Doc-created-but-sheet-not-updated scenario → resume updates sheet
- Deterministic sheet row mapping
- Capstone generated only after all tier topics complete
- State file atomic write (no corruption on simulated crash)
- Run ID collision (same subject, different run IDs)
- `doctor` with CLI present but unauthenticated vs. CLI absent
- Final output includes dashboard URL and run ID
- Signal handler flushes state on SIGINT
