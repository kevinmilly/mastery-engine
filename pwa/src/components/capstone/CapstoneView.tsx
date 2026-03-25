import { useState, useEffect } from 'react';
import { MarkdownRenderer } from '@/components/reader/MarkdownRenderer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface CapstoneViewProps {
  capstone: { scenario: string; tasks: string[] };
  tier: string;
  curriculumTitle: string;
  onBack: () => void;
}

function localStorageKey(curriculumTitle: string, tier: string): string {
  return `mastery-capstone-${curriculumTitle.toLowerCase().replace(/\s+/g, '-')}-${tier.toLowerCase()}`;
}

export function CapstoneView({ capstone, tier, curriculumTitle, onBack }: CapstoneViewProps) {
  const lsKey = localStorageKey(curriculumTitle, tier);
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set());

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        setCheckedTasks(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, [lsKey]);

  function toggleTask(index: number) {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      try {
        localStorage.setItem(lsKey, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const completedCount = checkedTasks.size;
  const totalCount = capstone.tasks.length;

  const tierVariant = tier.toLowerCase() === 'mastery'
    ? 'amber'
    : tier.toLowerCase() === 'mechanics'
    ? 'blue'
    : 'sage';

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Badge variant={tierVariant as 'sage' | 'amber' | 'blue'}>
          Capstone · {tier}
        </Badge>
        {completedCount > 0 && (
          <Badge variant="muted">
            {completedCount}/{totalCount} tasks
          </Badge>
        )}
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '1.9rem',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: '0 0 2rem 0',
          lineHeight: 1.25,
        }}
      >
        {curriculumTitle}
      </h1>

      {/* Scenario */}
      <div
        style={{
          marginBottom: '2.5rem',
          padding: '24px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Scenario
        </div>
        <MarkdownRenderer content={capstone.scenario} />
      </div>

      {/* Tasks */}
      {capstone.tasks.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Tasks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {capstone.tasks.map((task, i) => {
              const checked = checkedTasks.has(i);
              return (
                <label
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: `1px solid ${checked ? 'var(--color-accent-sage)' : 'var(--color-border)'}`,
                    background: checked ? 'rgba(122,155,138,0.06)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'border-color 150ms, background 150ms',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTask(i)}
                    style={{
                      accentColor: 'var(--color-accent-sage)',
                      width: 16,
                      height: 16,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      color: checked ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      lineHeight: 1.55,
                      textDecoration: checked ? 'line-through' : 'none',
                      transition: 'color 150ms',
                    }}
                  >
                    <strong
                      style={{
                        fontWeight: 600,
                        color: checked ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                        marginRight: 6,
                      }}
                    >
                      {i + 1}.
                    </strong>
                    {task}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion state */}
      {totalCount > 0 && completedCount === totalCount && (
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 12,
            border: '1px solid var(--color-accent-sage)',
            background: 'rgba(122,155,138,0.08)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--color-accent-sage)',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          All tasks complete. Well done.
        </div>
      )}

      <Button variant="ghost" onClick={onBack}>
        ← Back to Dashboard
      </Button>
    </div>
  );
}
