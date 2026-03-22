from __future__ import annotations

import hashlib
from typing import Any

from mastery_engine import logging_utils as log
from mastery_engine.adapters.workspace_adapter import WorkspaceAdapter
from mastery_engine.config import (
    TIERS, REPAIR_MAX_ATTEMPTS, RECENT_ANALOGIES_WINDOW, PRIOR_SUMMARIES_WINDOW,
    DEFAULT_MIN_TOPICS_PER_TIER, DEFAULT_MAX_TOPICS_PER_TIER,
)
from mastery_engine.llm_router import LLMRouter
from mastery_engine.models import (
    Topic, TopicStatus, TierStatus, RunStatus, DocRef,
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


# Column mapping for tier tabs: A=Status B=Topic C=Lesson D=PracticeSet E=MasteryNote F=TopicID G=Capstone
COL_STATUS = "A"
COL_TOPIC = "B"
COL_LESSON = "C"
COL_PRACTICE = "D"
COL_MASTERY_NOTE = "E"
COL_TOPIC_ID = "F"
COL_CAPSTONE = "G"

HEADER_ROW = 1
FIRST_DATA_ROW = 2


class Orchestrator:
    def __init__(
        self,
        router: LLMRouter,
        workspace: WorkspaceAdapter,
        state: RunState,
        dry_run: bool = False,
    ):
        self.router = router
        self.workspace = workspace
        self.state = state
        self.dry_run = dry_run

    # ── Top-level build ───────────────────────────────────────────────────────

    def build(self) -> None:
        s = self.state

        if s.status == RunStatus.INITIALIZING:
            self._generate_syllabus()

        if s.status == RunStatus.SYLLABUS_GENERATED:
            self._create_overview()

        if s.status == RunStatus.OVERVIEW_CREATED:
            self._create_glossary()

        if s.status == RunStatus.GLOSSARY_CREATED:
            self._seed_spreadsheet()

        # Main topic loop
        s.status = RunStatus.IN_PROGRESS
        s.save(s.state_path())

        for tier in TIERS:
            self._process_tier(tier)

        self._finalize_summary()
        s.status = RunStatus.COMPLETED
        s.save(s.state_path())

        log.section("Build Complete")
        log.success(f"Dashboard: {s.spreadsheet.url}")
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

        # Use midpoint of range for estimated_minutes
        estimated_minutes = (
            s.config.min_topics_per_tier + s.config.max_topics_per_tier
        ) // 2
        # Actually use fixed 20 min (midpoint of 15-25)
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
        if s.overview_doc.id:
            log.info("Overview doc already exists, skipping.")
            s.status = RunStatus.OVERVIEW_CREATED
            return

        log.info("Generating curriculum overview…")
        tier_list = format_tier_topic_list([t.model_dump() for t in s.topics])
        prompt = overview_prompt(s.subject, len(s.topics), tier_list)
        content = self._call_llm("overview", prompt)

        if not self.dry_run:
            doc = self.workspace.create_doc(f"Overview: {s.subject}")
            self.workspace.write_doc(doc.id, content)
            s.overview_doc = DocRef(id=doc.id, url=doc.url)
        else:
            log.section("Dry Run — Overview (sample)")
            log.console.print(content[:500] + "\n[dim]…truncated[/dim]")

        s.status = RunStatus.OVERVIEW_CREATED
        s.save(s.state_path())
        log.success("Overview doc created")

    def _create_glossary(self) -> None:
        s = self.state
        if s.glossary_doc.id:
            log.info("Glossary doc already exists, skipping.")
            s.status = RunStatus.GLOSSARY_CREATED
            return

        log.info("Generating master glossary…")
        tier_list = format_tier_topic_list([t.model_dump() for t in s.topics])
        prompt = glossary_prompt(s.subject, tier_list)
        content = self._call_llm("glossary", prompt)

        if not self.dry_run:
            doc = self.workspace.create_doc(f"Glossary: {s.subject}")
            self.workspace.write_doc(doc.id, content)
            s.glossary_doc = DocRef(id=doc.id, url=doc.url)

        s.status = RunStatus.GLOSSARY_CREATED
        s.save(s.state_path())
        log.success("Glossary doc created")

    # ── Spreadsheet ───────────────────────────────────────────────────────────

    def _seed_spreadsheet(self) -> None:
        s = self.state
        if s.spreadsheet.id:
            log.info("Spreadsheet already exists, skipping seed.")
            s.status = RunStatus.SPREADSHEET_SEEDED
            return

        log.info("Creating Sheets dashboard…")

        # Always assign row numbers (needed for resume logic), even in dry-run
        for tier in TIERS:
            tier_topics = sorted(
                [t for t in s.topics if t.tier == tier], key=lambda t: t.sequence
            )
            for i, topic in enumerate(tier_topics):
                topic.sheet_row = FIRST_DATA_ROW + i
            capstone_row = FIRST_DATA_ROW + len(tier_topics)
            s.tiers[tier].sheet_row = capstone_row

        if self.dry_run:
            total_docs = len(s.topics) * 2 + 3 + 1 + 1
            log.info(
                f"Would create: 1 spreadsheet, {len(s.topics)} lesson docs, "
                f"{len(s.topics)} practice sets, 3 capstones, 1 overview, 1 glossary "
                f"({total_docs} total docs)"
            )
            s.status = RunStatus.SPREADSHEET_SEEDED
            s.save(s.state_path())
            return

        sheet_ref = self.workspace.create_spreadsheet(f"Mastery: {s.subject}")
        s.spreadsheet = DocRef(id=sheet_ref.id, url=sheet_ref.url)

        # Create tabs in order (Summary already exists as default Sheet1 — rename it)
        self.workspace.add_sheet(sheet_ref.id, "Summary")
        for tier in TIERS:
            self.workspace.add_sheet(sheet_ref.id, tier)

        # Seed each tier tab — batch all cell writes per tier into one API call
        for tier in TIERS:
            tier_topics = sorted(
                [t for t in s.topics if t.tier == tier], key=lambda t: t.sequence
            )
            headers = ["Status", "Topic", "Lesson", "Practice Set", "Mastery Note", "Topic ID", "Capstone"]
            batch: list[tuple[str, str, str]] = []

            for col_idx, header in enumerate(headers):
                col = chr(ord("A") + col_idx)
                batch.append((tier, f"{col}{HEADER_ROW}", header))

            for topic in tier_topics:
                row = topic.sheet_row
                batch.append((tier, f"{COL_TOPIC}{row}", topic.title))
                batch.append((tier, f"{COL_TOPIC_ID}{row}", topic.id))

            capstone_row = s.tiers[tier].sheet_row
            batch.append((tier, f"{COL_TOPIC}{capstone_row}", f"[Capstone: {tier}]"))

            self.workspace.batch_update_cells(sheet_ref.id, batch)
            self.workspace.bold_row(sheet_ref.id, tier, HEADER_ROW)
            self.workspace.freeze_row(sheet_ref.id, tier)

            # Checkbox validation on status column for data rows
            last_row = FIRST_DATA_ROW + len(tier_topics) - 1
            if last_row >= FIRST_DATA_ROW:
                self.workspace.set_checkbox_validation(
                    sheet_ref.id, tier, f"{COL_STATUS}{FIRST_DATA_ROW}:{COL_STATUS}{last_row}"
                )

        s.status = RunStatus.SPREADSHEET_SEEDED
        s.save(s.state_path())
        log.success("Spreadsheet seeded")

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
        if tier_state.status not in (TierStatus.CAPSTONE_DOC_CREATED, TierStatus.COMPLETED):
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

        # Prior summaries: bounded window of last N completed topics in same tier
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

        # ── Lesson ──
        if topic.status == TopicStatus.PENDING:
            lesson_text = self._call_llm("lesson", lesson_prompt(
                s.subject, topic.tier, topic.title, topic.description,
                topic.estimated_minutes, prior_titles, prior_summaries, recent_analogies,
            ))
            topic.status = TopicStatus.LESSON_GENERATED
            s.save(s.state_path())

            if not self.dry_run:
                doc = self.workspace.create_doc(f"{topic.tier} — {topic.title} | {s.subject}")
                self.workspace.write_doc(doc.id, lesson_text)
                topic.lesson_doc = DocRef(id=doc.id, url=doc.url)
                topic.status = TopicStatus.LESSON_DOC_CREATED
                s.save(s.state_path())

            # Extract analogy and summary (lightweight calls)
            try:
                analogy = self._call_llm("analogy_extraction", analogy_extraction_prompt(lesson_text)).strip()
                if analogy:
                    s.context_carry.recent_analogies.append(analogy)
                    # Keep window
                    s.context_carry.recent_analogies = s.context_carry.recent_analogies[-RECENT_ANALOGIES_WINDOW:]

                summary = self._call_llm("topic_summary", topic_summary_prompt(lesson_text)).strip()
                if summary:
                    s.context_carry.prior_topic_summaries[topic.id] = summary
            except Exception:
                pass  # Non-critical: continue if extraction fails

        # ── Practice set ──
        if topic.status in (TopicStatus.LESSON_GENERATED, TopicStatus.LESSON_DOC_CREATED):
            practice_text = self._call_llm("practice_set", practice_set_prompt(
                s.subject, topic.tier, topic.title, topic.description, prior_titles,
            ))
            topic.status = TopicStatus.PRACTICE_GENERATED
            s.save(s.state_path())

            if not self.dry_run:
                doc = self.workspace.create_doc(
                    f"{topic.tier} — {topic.title} | Practice Set | {s.subject}"
                )
                self.workspace.write_doc(doc.id, practice_text)
                topic.practice_doc = DocRef(id=doc.id, url=doc.url)
                topic.status = TopicStatus.PRACTICE_DOC_CREATED
                s.save(s.state_path())

        # ── Sheet update ──
        if topic.status == TopicStatus.PRACTICE_DOC_CREATED and not self.dry_run:
            if topic.lesson_doc.url:
                self.workspace.update_cell_hyperlink(
                    s.spreadsheet.id, topic.tier,
                    f"{COL_LESSON}{topic.sheet_row}",
                    topic.lesson_doc.url, "Lesson",
                )
            if topic.practice_doc.url:
                self.workspace.update_cell_hyperlink(
                    s.spreadsheet.id, topic.tier,
                    f"{COL_PRACTICE}{topic.sheet_row}",
                    topic.practice_doc.url, "Practice",
                )
            topic.status = TopicStatus.SHEET_UPDATED
            s.save(s.state_path())

        topic.status = TopicStatus.COMPLETED
        s.save(s.state_path())
        log.success(f"  {topic.id} complete")

    def _create_capstone(self, tier: str, tier_topics: list[Topic]) -> None:
        s = self.state
        tier_state = s.tiers[tier]

        if tier_state.capstone_doc.id:
            log.info(f"  {tier} capstone doc already exists, skipping.")
            tier_state.status = TierStatus.CAPSTONE_DOC_CREATED
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
            doc = self.workspace.create_doc(f"Capstone: {tier} — {s.subject}")
            self.workspace.write_doc(doc.id, cap_text)
            tier_state.capstone_doc = DocRef(id=doc.id, url=doc.url)
            tier_state.status = TierStatus.CAPSTONE_DOC_CREATED
            s.save(s.state_path())

            if tier_state.sheet_row and tier_state.capstone_doc.url:
                self.workspace.update_cell_hyperlink(
                    s.spreadsheet.id, tier,
                    f"{COL_CAPSTONE}{tier_state.sheet_row}",
                    tier_state.capstone_doc.url, "Capstone",
                )

        log.success(f"  {tier} capstone created")

    # ── Summary tab ───────────────────────────────────────────────────────────

    def _finalize_summary(self) -> None:
        s = self.state
        if self.dry_run or not s.spreadsheet.id:
            return

        log.info("Finalizing Summary tab…")
        batch: list[tuple[str, str, str]] = [
            ("Summary", "A1", "Mastery Engine Dashboard"),
            ("Summary", "A2", f"Subject: {s.subject}"),
            ("Summary", "A4", "Overview"),
            ("Summary", "A5", "Glossary"),
            ("Summary", "A7", "Tier"),
            ("Summary", "B7", "Completed"),
            ("Summary", "C7", "Total"),
        ]
        if s.overview_doc.url:
            batch.append(("Summary", "B4", f'=HYPERLINK("{s.overview_doc.url}","Open")'))
        if s.glossary_doc.url:
            batch.append(("Summary", "B5", f'=HYPERLINK("{s.glossary_doc.url}","Open")'))

        row = 7
        for tier in TIERS:
            row += 1
            tier_topics = [t for t in s.topics if t.tier == tier]
            total = len(tier_topics)
            first_data = FIRST_DATA_ROW
            last_data = FIRST_DATA_ROW + total - 1
            formula = f"=COUNTIF('{tier}'!{COL_STATUS}{first_data}:{COL_STATUS}{last_data},TRUE)"
            batch.append(("Summary", f"A{row}", tier))
            batch.append(("Summary", f"B{row}", formula))
            batch.append(("Summary", f"C{row}", str(total)))

        self.workspace.batch_update_cells(s.spreadsheet.id, batch)
        self.workspace.bold_row(s.spreadsheet.id, "Summary", 1)
        self.workspace.bold_row(s.spreadsheet.id, "Summary", 7)

        s.save(s.state_path())
        log.success("Summary tab finalized")

    # ── LLM helper ────────────────────────────────────────────────────────────

    def _call_llm(self, task: str, prompt: str) -> str:
        return self.router.call(task, prompt)
