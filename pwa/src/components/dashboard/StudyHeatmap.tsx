import type { SessionLog } from '@/types';

interface StudyHeatmapProps {
  sessions: SessionLog[];
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getOpacity(durationMs: number): number {
  if (durationMs <= 0) return 0;
  const minutes = durationMs / 60000;
  if (minutes < 5) return 0.2;
  if (minutes < 15) return 0.45;
  if (minutes < 30) return 0.7;
  return 1;
}

export function StudyHeatmap({ sessions }: StudyHeatmapProps) {
  // Build a map of date string -> total durationMs
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    const key = new Date(s.date).toISOString().slice(0, 10);
    byDate.set(key, (byDate.get(key) ?? 0) + s.durationMs);
  }

  // Build 12 weeks x 7 days grid ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from 12 weeks ago, aligned to Sunday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7 * 12 + 1);
  // Align to Sunday
  const dow = startDate.getDay();
  startDate.setDate(startDate.getDate() - dow);

  const weeks: Array<Array<{ date: Date; dateStr: string; durationMs: number }>> = [];
  const cursor = new Date(startDate);

  for (let w = 0; w < 12; w++) {
    const week: typeof weeks[0] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().slice(0, 10);
      week.push({
        date: new Date(cursor),
        dateStr,
        durationMs: byDate.get(dateStr) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels: show when month changes
  const monthLabels: Array<{ weekIdx: number; label: string }> = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        weekIdx: wi,
        label: week[0].date.toLocaleDateString('en-US', { month: 'short' }),
      });
      lastMonth = m;
    }
  });

  const cellSize = 10;
  const gap = 2;
  const totalWidth = weeks.length * (cellSize + gap) - gap;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        Study Activity
      </span>

      <div style={{ overflowX: 'auto' }}>
        <svg
          width={totalWidth}
          height={7 * (cellSize + gap) - gap + 16}
          style={{ display: 'block' }}
        >
          {/* Month labels */}
          {monthLabels.map(({ weekIdx, label }) => (
            <text
              key={weekIdx}
              x={weekIdx * (cellSize + gap)}
              y={10}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 8,
                fill: 'var(--color-text-muted)',
              }}
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((cell, di) => {
              const x = wi * (cellSize + gap);
              const y = 14 + di * (cellSize + gap);
              const opacity = getOpacity(cell.durationMs);
              const fill =
                opacity === 0
                  ? 'var(--color-surface-raised)'
                  : `rgba(212,168,83,${opacity})`;
              const isFuture = cell.date > today;

              return (
                <g key={`${wi}-${di}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={2}
                    fill={isFuture ? 'transparent' : fill}
                    stroke="var(--color-border)"
                    strokeWidth={isFuture ? 0 : 0}
                  />
                  {!isFuture && (
                    <title>
                      {formatDate(cell.date.getTime())}
                      {cell.durationMs > 0
                        ? ` — ${Math.round(cell.durationMs / 60000)} min`
                        : ' — No activity'}
                    </title>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}
