import type { LoadedCurriculum } from '@/engine/curriculumLoader';
import { useProgressStore } from '@/store';
import { Badge } from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/CircularProgress';

interface Props {
  curriculum: LoadedCurriculum;
  onSequential: () => void;
  onInterleaved: () => void;
  onBack: () => void;
}

const TIER_ORDER = ['Foundations', 'Mechanics', 'Mastery'] as const;
const TIER_VARIANT: Record<string, 'sage' | 'amber' | 'red'> = {
  Foundations: 'sage',
  Mechanics: 'amber',
  Mastery: 'red',
};

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
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

export function CurriculumDetailView({ curriculum, onSequential, onInterleaved, onBack }: Props) {
  const getCompletedCountForCurriculum = useProgressStore((s) => s.getCompletedCountForCurriculum);
  const getTotalCountForCurriculum = useProgressStore((s) => s.getTotalCountForCurriculum);
  const getCompletedCountForTier = useProgressStore((s) => s.getCompletedCountForTier);
  const getTotalCountForTier = useProgressStore((s) => s.getTotalCountForTier);

  const blocks = curriculum.readingBlocks;
  const completed = getCompletedCountForCurriculum(curriculum.meta.id, blocks);
  const total = getTotalCountForCurriculum(curriculum.meta.id, blocks);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const modeCard = (active: boolean): React.CSSProperties => ({
    padding: '24px 20px',
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
    width: '100%',
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
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-sans)',
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: '1.5rem',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <ArrowLeftIcon /> Back to Dashboard
        </button>

        {/* Curriculum header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <CircularProgress
            value={pct}
            size={56}
            strokeWidth={4}
            color="var(--color-accent-sage)"
            label={`${pct}%`}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.4rem 0',
                lineHeight: 1.2,
              }}
            >
              {curriculum.meta.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {TIER_ORDER.map((tier) => {
                const tierCompleted = getCompletedCountForTier(curriculum.meta.id, tier, blocks);
                const tierTotal = getTotalCountForTier(curriculum.meta.id, tier, blocks);
                if (tierTotal === 0) return null;
                return (
                  <Badge key={tier} variant={TIER_VARIANT[tier]}>
                    {tier.slice(0, 4)} {tierCompleted}/{tierTotal}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-border)', margin: '1.5rem 0' }} />

        {/* Mode picker label */}
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            marginBottom: '0.75rem',
          }}
        >
          How do you want to read?
        </div>

        {/* Mode cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button style={modeCard(false)} onClick={onSequential}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent-sage)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
          >
            <div style={{ color: 'var(--color-accent-sage)' }}>
              <BookIcon />
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              Sequential
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Stay in this subject only
            </div>
          </button>

          <button style={modeCard(false)} onClick={onInterleaved}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent-amber)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
          >
            <div style={{ color: 'var(--color-accent-amber)' }}>
              <ShuffleIcon />
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              Interleaved
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Mix all subjects together
            </div>
          </button>
        </div>

        {/* Topic list */}
        {curriculum.meta.tiers.map((tier) => {
          if (tier.topics.length === 0) return null;
          return (
            <div key={tier.name} style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.4rem',
                }}
              >
                {tier.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tier.topics.map((topic) => {
                  const topicTotal = blocks.filter(
                    (b) => b.topicId === topic.id && b.tier === tier.name
                  ).length;

                  return (
                    <div
                      key={topic.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.83rem',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {topic.title}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {topicTotal} blocks
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
