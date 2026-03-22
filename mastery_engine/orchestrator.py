from __future__ import annotations

import hashlib
from typing import Any
from pathlib import Path

from mastery_engine import logging_utils as log
from mastery_engine.adapters.local_adapter import LocalAdapter, FileRef
from mastery_engine.config import (
    TIERS, REPAIR_MAX_ATTEMPTS, RECENT_ANALOGIES_WINDOW, PRIOR_SUMMARIES_WINDOW,
    DEFAULT_MIN_TOPICS_PER_TIER, DEFAULT_MAX_TOPICS_PER_TIER, CURRICULA_DIR
)
from mastery_engine.llm_router import LLMRouter
from mastery_engine.models import (
    Topic, TopicStatus, TierStatus, RunStatus, FileRef
)
from mastery_engine.prompts import (
    syllabus_prompt, repair_prompt, lesson_prompt, practice_set_prompt,
    capstone_prompt, overview_prompt, glossary_prompt,
    analogy_extraction_prompt, topic_summary_prompt,
    format_tier_topic_list,
)
from mastery_engine.retry import FatalError
from mastery_engine.state import RunState
from mastery_engine.validation import (
    ValidationFailure, parse_syllabus_json, validate_syllabus, assign_topic_ids,
)

class Orchestrator:
    def __init__(
        self,
        router: LLMRouter,
        state: RunState,
        dry_run: bool = False,
    ):
        self.router = router
        self.state = state
        self.dry_run = dry_run
        self.output_dir: Path | None = None
        self.adapter: LocalAdapter | None = None

    def build(self) -> None:
        s = self.state
        self.output_dir = CURRICULA_DIR / s.run_id
        self.adapter = LocalAdapter(self.output_dir)
        
        if not s.run_dir:
            s.run_dir = str(self.output_dir)
            s.save(s.state_path())

        if s.status == RunStatus.INITIALIZING:
            self._generate_syllabus()

        if s.status == RunStatus.SYLLABUS_GENERATED:
            self._create_overview()

        if s.status == RunStatus.OVERVIEW_CREATED:
            self._create_glossary()

        if s.status == RunStatus.GLOSSARY_CREATED:
            self._seed_index()

        # Main topic loop
        s.status = RunStatus.IN_PROGRESS
        s.save(s.state_path())

        for tier in TIERS:
            self._process_tier(tier)

        self._finalize_index()
        s.status = RunStatus.COMPLETED
        s.save(s.state_path())

        log.section("Build Complete")
        log.success(f"Output Directory: {self.output_dir}")
        log.success(f"Run ID: {s.run_id}")

    # ── Syllabus ──────────────────────────────────────────────────────────────

    def _generate_syllabus(self) -> None:
        s = self.state
        log.info("Generating syllabus…")

        prompt = syllabus_prompt(
            s.subject,
            s.config.min_topics_per_tier,
            s.config.max_topics_per_tier,
        )
        s.prompt_metadata["syllabus_prompt_hash"] = hashlib.md5(prompt.encode()).hexdigest()

        raw = self._call_llm("syllabus", prompt)
        syllabus_data = self._parse_and_validate_syllabus(raw)

        estimated_minutes = 20
        topic_dicts = assign_topic_ids(syllabus_data, estimated_minutes)
        s.topics = [Topic(**t) for t in topic_dicts]

        if self.dry_run:
            log.section("Dry Run — Syllabus")
            log.print_topic_table(topic_dicts)

        s.status = RunStatus.SYLLABUS_GENERATED
        s.save(s.state_path())
        log.success(f"Syllabus: {len(s.topics)} topics across 3 tiers")

    def _parse_and_validate_syllabus(self, raw: str) -> Any:
        s = self.state
        for attempt in range(1, REPAIR_MAX_ATTEMPTS + 2):
            try:
                data = parse_syllabus_json(raw)
                return validate_syllabus(
                    data,
                    s.config.min_topics_per_tier,
                    s.config.max_topics_per_tier,
                )
            except ValidationFailure as e:
                if attempt > REPAIR_MAX_ATTEMPTS:
                    raise FatalError(
                        f"Syllabus validation failed after {REPAIR_MAX_ATTEMPTS} repair attempts: {e}"
                    ) from e
                log.warn(f"Syllabus validation failed (attempt {attempt}), attempting repair…")
                repair = repair_prompt(s.subject, str(e), raw)
                raw = self._call_llm("repair", repair)

    # ── Overview and Glossary ─────────────────────────────────────────────────

    def _create_overview(self) -> None:
        s = self.state
        if s.overview_doc.url:
            log.info("Overview already exists, skipping.")
            s.status = RunStatus.OVERVIEW_CREATED
            return

        log.info("Generating curriculum overview…")
        tier_list = format_tier_topic_list([t.model_dump() for t in s.topics])
        prompt = overview_prompt(s.subject, len(s.topics), tier_list)
        content = self._call_llm("overview", prompt)

        if not self.dry_run:
            ref = self.adapter.write_file("Overview.md", content)
            s.overview_doc = FileRef(id=ref.id, url=ref.url)
        else:
            log.section("Dry Run — Overview (sample)")
            log.console.print(content[:500] + "\n[dim]…truncated[/dim]")

        s.status = RunStatus.OVERVIEW_CREATED
        s.save(s.state_path())
        log.success("Overview created")

    def _create_glossary(self) -> None:
        s = self.state
        if s.glossary_doc.url:
            log.info("Glossary already exists, skipping.")
            s.status = RunStatus.GLOSSARY_CREATED
            return

        log.info("Generating master glossary…")
        tier_list = format_tier_topic_list([t.model_dump() for t in s.topics])
        prompt = glossary_prompt(s.subject, tier_list)
        content = self._call_llm("glossary", prompt)

        if not self.dry_run:
            ref = self.adapter.write_file("Glossary.md", content)
            s.glossary_doc = FileRef(id=ref.id, url=ref.url)

        s.status = RunStatus.GLOSSARY_CREATED
        s.save(s.state_path())
        log.success("Glossary created")

    # ── Index Generation (Replaces Spreadsheet) ───────────────────────────────

    def _seed_index(self) -> None:
        s = self.state
        log.info("Initializing INDEX.md…")
        
        if self.dry_run:
            total_files = len(s.topics) * 2 + 3 + 1 + 1
            log.info(
                f"Would create: {len(s.topics)} lessons, "
                f"{len(s.topics)} practice sets, 3 capstones, 1 overview, 1 glossary, 1 INDEX.md "
                f"({total_files} total files)"
            )
            s.status = RunStatus.INDEX_SEEDED
            s.save(s.state_path())
            return

        self._update_index()
        s.status = RunStatus.INDEX_SEEDED
        s.save(s.state_path())
        log.success("INDEX.md initialized")

    def _update_index(self) -> None:
        s = self.state
        
        lines = [f"# Mastery: {s.subject}", ""]
        lines.append(f"**Run ID:** `{s.run_id}`")
        lines.append("")
        
        overview_link = f"[Curriculum Overview]({s.overview_doc.url})" if s.overview_doc.url else "Curriculum Overview (Pending)"
        glossary_link = f"[Master Glossary]({s.glossary_doc.url})" if s.glossary_doc.url else "Master Glossary (Pending)"
        
        lines.append(f"- {overview_link}")
        lines.append(f"- {glossary_link}")
        lines.append("")
        
        lines.append("## Curriculum Map")
        lines.append("")
        
        for tier in TIERS:
            lines.append(f"### {tier}")
            lines.append("| Status | Topic | Lesson | Practice |")
            lines.append("| :--- | :--- | :--- | :--- |")
            
            tier_topics = sorted([t for t in s.topics if t.tier == tier], key=lambda t: t.sequence)
            for t in tier_topics:
                status_emoji = "✅" if t.status == TopicStatus.COMPLETED else "⏳"
                lesson_link = f"[Read]({t.lesson_file.url})" if t.lesson_file.url else "---"
                practice_link = f"[Practice]({t.practice_file.url})" if t.practice_file.url else "---"
                lines.append(f"| {status_emoji} | {t.title} | {lesson_link} | {practice_link} |")
            
            # Capstone row
            tier_state = s.tiers[tier]
            capstone_link = f"[**Capstone: {tier}**]({tier_state.capstone_file.url})" if tier_state.capstone_file.url else f"**Capstone: {tier}** (Pending)"
            lines.append(f"| | {capstone_link} | | |")
            lines.append("")

        self.adapter.write_file("INDEX.md", "\n".join(lines))

    def _finalize_index(self) -> None:
        self._update_index()
        log.success("INDEX.md finalized")

    # ── Tier processing ───────────────────────────────────────────────────────

    def _process_tier(self, tier: str) -> None:
        s = self.state
        tier_state = s.tiers[tier]

        if tier_state.status == TierStatus.COMPLETED:
            log.info(f"{tier}: already complete, skipping.")
            return

        tier_state.status = TierStatus.IN_PROGRESS
        s.save(s.state_path())

        tier_topics = sorted(
            [t for t in s.topics if t.tier == tier], key=lambda t: t.sequence
        )

        log.section(f"Tier: {tier}")

        for topic in tier_topics:
            self._process_topic(topic, tier_topics)

        # Capstone after all topics in tier
        if tier_state.status not in (TierStatus.CAPSTONE_FILE_CREATED, TierStatus.COMPLETED):
            self._create_capstone(tier, tier_topics)

        tier_state.status = TierStatus.COMPLETED
        s.save(s.state_path())

    def _process_topic(self, topic: Topic, tier_topics: list[Topic]) -> None:
        s = self.state

        if topic.status == TopicStatus.COMPLETED:
            log.info(f"  {topic.id}: already complete, skipping.")
            return

        log.info(f"  Processing {topic.id}: {topic.title}")

        prior_titles = [
            t.title for t in tier_topics
            if t.sequence < topic.sequence and t.status == TopicStatus.COMPLETED
        ]

        completed_in_tier = [
            t for t in tier_topics
            if t.sequence < topic.sequence and t.status == TopicStatus.COMPLETED
        ][-PRIOR_SUMMARIES_WINDOW:]
        prior_summaries = [
            s.context_carry.prior_topic_summaries.get(t.id, "")
            for t in completed_in_tier
            if s.context_carry.prior_topic_summaries.get(t.id)
        ]

        recent_analogies = s.context_carry.recent_analogies[-RECENT_ANALOGIES_WINDOW:]

        # Create tier directory
        tier_dir = topic.tier

        # ── Lesson ──
        if topic.status == TopicStatus.PENDING:
            lesson_text = self._call_llm("lesson", lesson_prompt(
                s.subject, topic.tier, topic.title, topic.description,
                topic.estimated_minutes, prior_titles, prior_summaries, recent_analogies,
            ))
            topic.status = TopicStatus.LESSON_GENERATED
            s.save(s.state_path())

            if not self.dry_run:
                filename = f"{tier_dir}/{topic.sequence:02d}-{topic.id}.md"
                ref = self.adapter.write_file(filename, lesson_text)
                topic.lesson_file = FileRef(id=ref.id, url=ref.url)
                topic.status = TopicStatus.LESSON_FILE_CREATED
                s.save(s.state_path())

            # Extract analogy and summary
            try:
                analogy = self._call_llm("analogy_extraction", analogy_extraction_prompt(lesson_text)).strip()
                if analogy:
                    s.context_carry.recent_analogies.append(analogy)
                    s.context_carry.recent_analogies = s.context_carry.recent_analogies[-RECENT_ANALOGIES_WINDOW:]

                summary = self._call_llm("topic_summary", topic_summary_prompt(lesson_text)).strip()
                if summary:
                    s.context_carry.prior_topic_summaries[topic.id] = summary
            except Exception:
                pass 

        # ── Practice set ──
        if topic.status in (TopicStatus.LESSON_GENERATED, TopicStatus.LESSON_FILE_CREATED):
            practice_text = self._call_llm("practice_set", practice_set_prompt(
                s.subject, topic.tier, topic.title, topic.description, prior_titles,
            ))
            topic.status = TopicStatus.PRACTICE_GENERATED
            s.save(s.state_path())

            if not self.dry_run:
                filename = f"{tier_dir}/{topic.sequence:02d}-{topic.id}-practice.md"
                ref = self.adapter.write_file(filename, practice_text)
                topic.practice_file = FileRef(id=ref.id, url=ref.url)
                topic.status = TopicStatus.PRACTICE_FILE_CREATED
                s.save(s.state_path())

        # Update index after each topic
        if not self.dry_run:
            self._update_index()
            topic.status = TopicStatus.INDEX_UPDATED
            s.save(s.state_path())

        topic.status = TopicStatus.COMPLETED
        s.save(s.state_path())
        log.success(f"  {topic.id} complete")

    def _create_capstone(self, tier: str, tier_topics: list[Topic]) -> None:
        s = self.state
        tier_state = s.tiers[tier]

        if tier_state.capstone_file.url:
            log.info(f"  {tier} capstone already exists, skipping.")
            tier_state.status = TierStatus.CAPSTONE_FILE_CREATED
            return

        log.info(f"  Generating {tier} capstone…")
        topic_context = "\n".join(
            f"{i+1}. {t.title} — {t.description}"
            for i, t in enumerate(sorted(tier_topics, key=lambda t: t.sequence))
        )
        cap_text = self._call_llm("capstone",
            capstone_prompt(s.subject, tier, topic_context)
        )
        tier_state.status = TierStatus.CAPSTONE_GENERATED
        s.save(s.state_path())

        if not self.dry_run:
            filename = f"{tier}/Capstone.md"
            ref = self.adapter.write_file(filename, cap_text)
            tier_state.capstone_file = FileRef(id=ref.id, url=ref.url)
            tier_state.status = TierStatus.CAPSTONE_FILE_CREATED
            self._update_index()
            s.save(s.state_path())

        log.success(f"  {tier} capstone created")

    # ── LLM helper ────────────────────────────────────────────────────────────

    def _call_llm(self, task: str, prompt: str) -> str:
        if self.dry_run:
            if task in ("syllabus", "repair"):
                topics = []
                for tier in TIERS:
                    for i in range(1, 9):
                        topics.append({
                            "title": f"Sample {tier} Topic {i}",
                            "description": f"Description for {tier} {i}",
                            "tier": tier,
                            "sequence": i
                        })
                import json
                return json.dumps({"topics": topics})
            if task == "analogy_extraction":
                return "This is a sample analogy."
            if task == "topic_summary":
                return "This is a sample topic summary."
            return f"Sample content for {task} on {self.state.subject}"
            
        return self.router.call(task, prompt)
