from mastery_engine.config import TIERS


def syllabus_prompt(subject: str, min_topics: int, max_topics: int) -> str:
    return f"""You are designing a structured microlearning curriculum for a motivated self-directed learner.

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

{{
  "topics": [
    {{
      "title": "string",
      "description": "string (2-3 sentences)",
      "tier": "Foundations" | "Mechanics" | "Mastery",
      "sequence": integer (1-indexed, restarts per tier)
    }}
  ]
}}

Rules:
- Output all tiers. Do not skip any.
- Output topics in tier order: all Foundations first, then Mechanics, then Mastery.
- Within each tier, output topics in sequence order.
- Do not add fields not listed above.
- Do not wrap the JSON in a code block."""


def repair_prompt(subject: str, validation_error: str, broken_output: str) -> str:
    return f"""The following text was supposed to be a valid JSON syllabus for a microlearning curriculum but failed schema validation.

Subject: {subject}
Validation error: {validation_error}

Broken output:
{broken_output}

Required schema:
{{
  "topics": [
    {{
      "title": "string",
      "description": "string (2-3 sentences)",
      "tier": "Foundations" | "Mechanics" | "Mastery",
      "sequence": integer (1-indexed, restarts per tier)
    }}
  ]
}}

Rules:
- Return only valid JSON matching this schema exactly.
- Do not add fields not in the schema.
- Do not wrap in a code block.
- Do not explain what you changed.
- Preserve all original topic content unless it violates the schema.
- If a field is missing, infer it from context rather than inventing new content."""


def lesson_prompt(
    subject: str,
    tier: str,
    topic_title: str,
    topic_description: str,
    estimated_minutes: int,
    prior_topic_titles: list[str],
    prior_topic_summaries: list[str],
    recent_analogies: list[str],
) -> str:
    prior_titles_str = ", ".join(prior_topic_titles) if prior_topic_titles else "None — this is the first topic."
    prior_summaries_str = "\n".join(prior_topic_summaries) if prior_topic_summaries else "None — this is the first topic."
    analogies_str = ", ".join(recent_analogies) if recent_analogies else "None yet."

    return f"""You are writing one microlearning lesson for a motivated learner.

Your job is not to impress, summarize, or sound academic. Your job is to teach so clearly that a serious beginner can build real understanding from reading.

Write the lesson for this topic:

Subject: {subject}
Tier: {tier}
Topic Title: {topic_title}
Topic Description: {topic_description}
Estimated Reading Time: {estimated_minutes} minutes

Relevant prior context:
- Prior topics in this tier: {prior_titles_str}
- Brief carry-forward summary: {prior_summaries_str}
- Recent analogies already used: {analogies_str}

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
Write the full lesson now with strong teaching quality, concrete explanation, and realistic application. Optimize for real understanding, not coverage."""


def practice_set_prompt(
    subject: str,
    tier: str,
    topic_title: str,
    topic_description: str,
    prior_topic_titles: list[str],
) -> str:
    prior_titles_str = ", ".join(prior_topic_titles) if prior_topic_titles else "None — this is the first topic."

    return f"""You are writing a practice set for a learner who has just read a microlearning lesson.

Your job is to produce exercises that test genuine understanding and application — not recall of definitions.

Subject: {subject}
Tier: {tier}
Topic Title: {topic_title}
Topic Description: {topic_description}

Prior topics in this tier: {prior_titles_str}

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
[substantive answer with reasoning]"""


def capstone_prompt(
    subject: str,
    tier: str,
    tier_topic_titles_and_descriptions: str,
) -> str:
    return f"""You are writing a capstone project for a learner who has completed the {tier} tier of a structured curriculum.

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
[3–5 bullet points describing what a strong response demonstrates — no answers]"""


def overview_prompt(
    subject: str,
    total_topic_count: int,
    tier_topic_list: str,
) -> str:
    return f"""You are writing the opening orientation document for a learner starting a structured microlearning curriculum.

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

## Curriculum Map

### Foundations
[numbered list]

### Mechanics
[numbered list]

### Mastery
[numbered list]"""


def glossary_prompt(subject: str, tier_topic_titles_and_descriptions: str) -> str:
    return f"""You are generating a master glossary for a structured microlearning curriculum.

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

[continue alphabetically...]"""


def analogy_extraction_prompt(lesson_text: str) -> str:
    return f"""What was the primary analogy or comparison used in the following lesson? Reply with one sentence only describing the analogy.

Lesson text:
{lesson_text[:3000]}"""


def topic_summary_prompt(lesson_text: str) -> str:
    return f"""Summarize the key concept taught in the following lesson in 1–2 sentences. Focus on what the learner should carry forward, not the lesson structure.

Lesson text:
{lesson_text[:3000]}"""


def format_tier_topic_list(topics: list) -> str:
    """Format topics grouped by tier for use in prompts."""
    lines = []
    for tier in TIERS:
        tier_topics = [t for t in topics if t["tier"] == tier]
        if tier_topics:
            lines.append(f"\n{tier}:")
            for t in sorted(tier_topics, key=lambda x: x["sequence"]):
                lines.append(f"  {t['sequence']}. {t['title']} — {t['description']}")
    return "\n".join(lines)
