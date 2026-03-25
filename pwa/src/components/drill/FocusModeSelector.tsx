import { useState } from 'react';
import type { LoadedCurriculum } from '@/engine/curriculumLoader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface FocusModeSelectorProps {
  curricula: LoadedCurriculum[];
  onConfirm: (topicIds: string[]) => void;
  onChaos: () => void;
}

function ShuffleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

type ModeOption = 'none' | 'chaos' | 'focused';

export function FocusModeSelector({ curricula, onConfirm, onChaos }: FocusModeSelectorProps) {
  const [selected, setSelected] = useState<ModeOption>('none');
  const [chosenTopics, setChosenTopics] = useState<Set<string>>(new Set());

  // Collect all topics from curricula
  const allTopics = curricula.flatMap((c) =>
    c.meta.tiers.flatMap((t) =>
      t.topics.map((topic) => ({ id: topic.id, title: topic.title, tier: t.name, curriculum: c.meta.title }))
    )
  );

  function toggleTopic(id: string) {
    setChosenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  }

  const cardStyle = (active: boolean): React.CSSProperties => ({
    padding: '28px 24px',
    borderRadius: 14,
    border: `1px solid ${active ? 'var(--color-accent-sage)' : 'var(--color-border)'}`,
    background: active ? 'rgba(122,155,138,0.08)' : 'var(--color-surface)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    textAlign: 'left',
    transition: 'border-color 150ms, background 150ms',
    outline: 'none',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100svh - 52px)',
        padding: '2rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1.6rem',
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          How do you want to drill?
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginBottom: 32,
          }}
        >
          Choose a focus mode to begin your session.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Chaos */}
          <button
            style={cardStyle(selected === 'chaos')}
            onClick={() => { setSelected('chaos'); onChaos(); }}
          >
            <div style={{ color: 'var(--color-accent-amber)' }}>
              <ShuffleIcon />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--color-text-primary)',
              }}
            >
              Chaos Mode
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              All topics, maximum interleaving
            </div>
          </button>

          {/* Focused */}
          <button
            style={cardStyle(selected === 'focused')}
            onClick={() => setSelected('focused')}
          >
            <div style={{ color: 'var(--color-accent-sage)' }}>
              <TargetIcon />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--color-text-primary)',
              }}
            >
              Focused Mode
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              Pick 1–3 topics
            </div>
          </button>
        </div>

        {/* Topic list for focused mode */}
        {selected === 'focused' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                marginBottom: 12,
              }}
            >
              Select up to 3 topics · {chosenTopics.size}/3 chosen
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
              {allTopics.map((t) => {
                const checked = chosenTopics.has(t.id);
                const disabled = !checked && chosenTopics.size >= 3;
                return (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${checked ? 'var(--color-accent-sage)' : 'var(--color-border)'}`,
                      background: checked ? 'rgba(122,155,138,0.08)' : 'var(--color-surface)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.45 : 1,
                      transition: 'border-color 150ms, background 150ms',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleTopic(t.id)}
                      style={{ accentColor: 'var(--color-accent-sage)', width: 14, height: 14 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.85rem',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {t.title}
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        <Badge variant="muted">{t.tier}</Badge>
                        <Badge variant="muted">{t.curriculum}</Badge>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button
                variant="primary"
                disabled={chosenTopics.size === 0}
                onClick={() => onConfirm([...chosenTopics])}
              >
                Start Focused Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
