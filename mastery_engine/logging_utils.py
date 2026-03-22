from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.table import Table
from rich.text import Text

import sys
console = Console(file=open(sys.stdout.fileno(), mode="w", encoding="utf-8", buffering=1, closefd=False))
error_console = Console(stderr=True, style="bold red", file=open(sys.stderr.fileno(), mode="w", encoding="utf-8", buffering=1, closefd=False))


def info(msg: str) -> None:
    console.print(f"[dim]>[/dim] {msg}")


def success(msg: str) -> None:
    console.print(f"[green]✓[/green] {msg}")


def warn(msg: str) -> None:
    console.print(f"[yellow]![/yellow] {msg}")


def error(msg: str) -> None:
    error_console.print(f"✗ {msg}")


def section(title: str) -> None:
    console.rule(f"[bold]{title}[/bold]")


def make_progress() -> Progress:
    return Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console,
        transient=True,
    )


def print_topic_table(topics: list[dict]) -> None:
    table = Table(title="Curriculum", show_header=True, header_style="bold")
    table.add_column("ID", style="dim", width=16)
    table.add_column("Tier", width=12)
    table.add_column("Title")
    table.add_column("Min", justify="right", width=4)

    for t in topics:
        table.add_row(
            t["id"],
            t["tier"],
            t["title"],
            str(t["estimated_minutes"]),
        )
    console.print(table)


def print_run_status(state: object) -> None:
    """Print a status summary for a RunState."""
    from mastery_engine.config import TIERS

    console.print(f"\n[bold]Run:[/bold] {state.run_id}")
    console.print(f"[bold]Subject:[/bold] {state.subject}")
    console.print(f"[bold]Status:[/bold] {state.status.value}")
    console.print()

    for tier in TIERS:
        tier_topics = [t for t in state.topics if t.tier == tier]
        completed = sum(1 for t in tier_topics if t.status.value == "completed")
        total = len(tier_topics)
        bar = _progress_bar(completed, total)
        console.print(f"{tier:<14} {bar}  {completed}/{total} topics complete")

    console.print()
    console.print(f"[dim]Last updated:[/dim] {state.updated_at[:16].replace('T', ' ')}")
    if state.spreadsheet.url:
        console.print(f"[dim]Dashboard:[/dim] {state.spreadsheet.url}")


def _progress_bar(completed: int, total: int, width: int = 10) -> str:
    if total == 0:
        filled = 0
    else:
        filled = round(completed / total * width)
    bar = "█" * filled + "░" * (width - filled)
    return bar


def print_doctor_result(checks: list[tuple[bool, str]]) -> None:
    all_ok = all(ok for ok, _ in checks)
    for ok, msg in checks:
        if ok:
            console.print(f"[green]✓[/green] {msg}")
        else:
            console.print(f"[red]✗[/red] {msg}")
    console.print()
    if all_ok:
        console.print("[bold green]All checks passed. Ready to build.[/bold green]")
    else:
        console.print("[bold red]Doctor found issues. Fix them before running build.[/bold red]")
