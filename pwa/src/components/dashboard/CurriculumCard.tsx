import type { LoadedCurriculum } from '@/engine/curriculumLoader';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Badge } from '@/components/ui/Badge';
import { useProgressStore } from '@/store';

interface CurriculumCardProps {
  curriculum: LoadedCurriculum;
}

const TIER_ORDER = ['Foundations', 'Mechanics', 'Mastery'] as const;
type TierVariant = 'sage' | 'amber' | 'red';
const TIER_VARIANT: Record<string, TierVariant> = {
  Foundations: 'sage',
  Mechanics: 'amber',
  Mastery: 'red',
};

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const getCompletedCountForCurriculum = useProgressStore((s) => s.getCompletedCountForCurriculum);
  const getTotalCountForCurriculum = useProgressStore((s) => s.getTotalCountForCurriculum);
  const getCompletedCountForTier = useProgressStore((s) => s.getCompletedCountForTier);
  const getTotalCountForTier = useProgressStore((s) => s.getTotalCountForTier);

  const blocks = curriculum.readingBlocks;
  const completed = getCompletedCountForCurriculum(curriculum.meta.id, blocks);
  const total = getTotalCountForCurriculum(curriculum.meta.id, blocks);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '1.25rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
        cursor: 'default',
        transition: 'background 200ms',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-raised)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)';
      }}
    >
      <CircularProgress
        value={pct}
        size={64}
        strokeWidth={5}
        color="var(--color-accent-sage)"
        label={`${pct}%`}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {curriculum.meta.title}
        </h3>
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
  );
}
