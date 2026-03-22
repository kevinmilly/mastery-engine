import sys
import click
from rich.console import Console
from rich.table import Table

from mastery_engine import logging_utils as log
from mastery_engine.config import DEFAULT_MIN_TOPICS_PER_TIER, DEFAULT_MAX_TOPICS_PER_TIER, CURRICULA_DIR
from mastery_engine.llm_router import LLMRouter
from mastery_engine.orchestrator import Orchestrator
from mastery_engine.retry import FatalError
from mastery_engine.state import (
    STATE_DIR, RunState, init_state, load_by_run_id,
    load_latest_incomplete, list_incomplete_runs, register_signal_handler,
)
from mastery_engine.user_config import (
    get_key, set_key, clear_key, status_summary,
)

console = Console()


@click.group()
def main() -> None:
    """MasteryEngine — turn any subject into a structured microlearning curriculum."""
    pass


# ── setup ─────────────────────────────────────────────────────────────────────

@main.command()
@click.option("--show", is_flag=True, default=False, help="Show current configuration without editing.")
def setup(show: bool) -> None:
    """Configure API keys for LLM providers (OpenAI, Anthropic)."""
    console.print()
    console.print("[bold]MasteryEngine — Provider Setup[/bold]")
    console.print()
    console.print("Anthropic is the primary provider. Gemini (Google API) and OpenAI are automatic fallbacks.")
    console.print()

    if show:
        _print_config_status()
        return

    console.print("[dim]Press Enter to keep an existing value. Type 'clear' to remove a key.[/dim]")
    console.print()

    # ── Anthropic (primary) ──
    existing_anthropic = get_key("anthropic_api_key")
    prompt_anthropic = (
        f"Anthropic API key [{_mask_or_none(existing_anthropic)}]: "
        if existing_anthropic else "Anthropic API key (leave blank to skip): "
    )
    raw_anthropic = click.prompt(prompt_anthropic, default="", show_default=False).strip()
    if raw_anthropic.lower() == "clear":
        clear_key("anthropic_api_key")
        console.print("  [yellow]Anthropic key cleared.[/yellow]")
    elif raw_anthropic:
        set_key("anthropic_api_key", raw_anthropic)
        console.print("  [green]Anthropic key saved.[/green]")
    else:
        console.print("  [dim]Anthropic key unchanged.[/dim]")

    console.print()

    # ── OpenAI (fallback) ──
    existing_openai = get_key("openai_api_key")
    prompt_openai = (
        f"OpenAI API key [{_mask_or_none(existing_openai)}]: "
        if existing_openai else "OpenAI API key (leave blank to skip): "
    )
    raw_openai = click.prompt(prompt_openai, default="", show_default=False).strip()
    if raw_openai.lower() == "clear":
        clear_key("openai_api_key")
        console.print("  [yellow]OpenAI key cleared.[/yellow]")
    elif raw_openai:
        set_key("openai_api_key", raw_openai)
        console.print("  [green]OpenAI key saved.[/green]")
    else:
        console.print("  [dim]OpenAI key unchanged.[/dim]")

    console.print()

    # ── Google / Gemini (fallback) ──
    existing_google = get_key("google_api_key")
    prompt_google = (
        f"Google API key [{_mask_or_none(existing_google)}]: "
        if existing_google else "Google API key (leave blank to skip): "
    )
    raw_google = click.prompt(prompt_google, default="", show_default=False).strip()
    if raw_google.lower() == "clear":
        clear_key("google_api_key")
        console.print("  [yellow]Google key cleared.[/yellow]")
    elif raw_google:
        set_key("google_api_key", raw_google)
        console.print("  [green]Google key saved.[/green]")
    else:
        console.print("  [dim]Google key unchanged.[/dim]")

    console.print()
    _print_config_status()
    console.print()
    console.print("[dim]Keys are stored in ~/.mastery-engine/config.json[/dim]")
    console.print("[dim]Environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY) always take priority.[/dim]")


def _print_config_status() -> None:
    table = Table(show_header=True, header_style="bold", box=None, padding=(0, 2))
    table.add_column("Provider")
    table.add_column("Status")
    table.add_column("Models (high / low)")

    key_map = {
        "Anthropic": ("anthropic_api_key", "claude-sonnet-4-6 / claude-haiku-4-5"),
        "OpenAI":    ("openai_api_key",     "gpt-4o / gpt-4o-mini"),
        "Gemini":    ("google_api_key",     "gemini-2.5-pro / gemini-2.0-flash"),
    }

    for provider, status_str in status_summary():
        key_name, models = key_map[provider]
        indicator = "[green]●[/green]" if get_key(key_name) else "[dim]○[/dim]"
        table.add_row(f"{indicator} {provider}", status_str, f"[dim]{models}[/dim]")

    console.print(table)
    console.print()
    active = [p for p, (k, _) in key_map.items() if get_key(k)]
    chain = " → ".join(active) if active else "[red]No providers configured[/red]"
    console.print(f"[bold]Fallback chain:[/bold] {chain}")


def _mask_or_none(key: str | None) -> str:
    if not key:
        return "none"
    if len(key) <= 8:
        return "***"
    return key[:4] + "..." + key[-4:]


# ── build ─────────────────────────────────────────────────────────────────────

@main.command()
@click.argument("subject")
@click.option("--resume", is_flag=True, default=False, help="Resume the most recent incomplete run.")
@click.option("--run-id", default=None, help="Specific run ID to resume.")
@click.option(
    "--max-topics-per-tier", default=DEFAULT_MAX_TOPICS_PER_TIER,
    show_default=True, help="Maximum topics per tier."
)
@click.option("--dry-run", is_flag=True, default=False, help="Preview syllabus and sample lesson without creating files.")
def build(subject: str, resume: bool, run_id: str | None, max_topics_per_tier: int, dry_run: bool) -> None:
    """Build a microlearning curriculum for SUBJECT."""
    router = LLMRouter()

    chain = " -> ".join(p.capitalize() for p in router.provider_chain)
    log.info(f"Provider chain: {chain}")

    if resume or run_id:
        state = _resolve_resume(subject, run_id)
        log.info(f"Resuming run: {state.run_id} ({state.subject})")
    else:
        state = init_state(subject, max_topics_per_tier, DEFAULT_MIN_TOPICS_PER_TIER)
        log.info(f"Starting new run: {state.run_id}")

    register_signal_handler(state)

    orchestrator = Orchestrator(router, state, dry_run=dry_run)

    try:
        orchestrator.build()
    except FatalError as e:
        log.error(str(e))
        sys.exit(2)
    except Exception as e:
        log.error(f"Unexpected error: {e}")
        state.save(state.state_path())
        sys.exit(1)


def _resolve_resume(subject: str, run_id: str | None) -> RunState:
    if run_id:
        try:
            return load_by_run_id(run_id)
        except FileNotFoundError:
            log.error(f"No run found with ID: {run_id}")
            sys.exit(1)

    state = load_latest_incomplete(subject)
    if state:
        return state

    all_incomplete = list_incomplete_runs()
    if not all_incomplete:
        log.error("No incomplete runs found. Start a new run without --resume.")
        sys.exit(1)

    if len(all_incomplete) == 1:
        return all_incomplete[0]

    console.print("\n[bold]Multiple incomplete runs found:[/bold]\n")
    for i, s in enumerate(all_incomplete, start=1):
        console.print(f"  {i}. {s.run_id}  ({s.subject})  [{s.status.value}]  {s.updated_at[:16]}")
    console.print()

    choice = click.prompt("Which run to resume? (number)", type=int)
    if not 1 <= choice <= len(all_incomplete):
        log.error("Invalid choice.")
        sys.exit(1)
    return all_incomplete[choice - 1]


# ── doctor ────────────────────────────────────────────────────────────────────

@main.command()
def doctor() -> None:
    """Check all configured providers and local filesystem readiness."""
    router = LLMRouter()

    chain = " -> ".join(p.capitalize() for p in router.provider_chain)
    console.print(f"\n[bold]Provider chain:[/bold] {chain}\n")

    checks: list[tuple[bool, str]] = router.check()

    # Local filesystem check
    try:
        CURRICULA_DIR.mkdir(parents=True, exist_ok=True)
        test_file = CURRICULA_DIR / ".doctor_test"
        test_file.write_text("test")
        test_file.unlink()
        checks.append((True, f"Curricula directory: {CURRICULA_DIR} (writable)"))
    except Exception as e:
        checks.append((False, f"Curricula directory: {CURRICULA_DIR} (error: {e})"))

    log.print_doctor_result(checks)

    if not all(ok for ok, _ in checks):
        sys.exit(2)


# ── status ────────────────────────────────────────────────────────────────────

@main.command()
@click.option("--run-id", default=None, help="Run ID to inspect.")
def status(run_id: str | None) -> None:
    """Show status of a run."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    if run_id:
        try:
            state = load_by_run_id(run_id)
        except FileNotFoundError:
            log.error(f"No run found with ID: {run_id}")
            sys.exit(1)
        log.print_run_status(state)
        return

    all_runs = list_incomplete_runs()
    if not all_runs:
        completed = []
        for path in STATE_DIR.glob("*.json"):
            try:
                s = RunState.load(path)
                completed.append(s)
            except Exception:
                continue
        if not completed:
            console.print(f"No runs found in {STATE_DIR}")
            return
        completed.sort(key=lambda s: s.updated_at, reverse=True)
        log.print_run_status(completed[0])
        return

    if len(all_runs) == 1:
        log.print_run_status(all_runs[0])
    else:
        console.print(f"\n[bold]{len(all_runs)} incomplete runs:[/bold]\n")
        for s in all_runs:
            console.print(f"  {s.run_id}  ({s.subject})  [{s.status.value}]  {s.updated_at[:16]}")
        console.print(f"\nUse [bold]mastery-engine status --run-id <id>[/bold] for details.")


if __name__ == "__main__":
    main()
