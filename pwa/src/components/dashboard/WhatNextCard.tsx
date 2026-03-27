import type { ReadingBlock } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight } from '@phosphor-icons/react';

interface WhatNextCardProps {
  block: ReadingBlock | null;
  onStart: () => void;
  dueDrillsCount?: number;
  focusCurriculumTitle?: string | null;
  onClearFocus?: () => void;
}

function estimatedReadLabel(minutes: number): string {
  if (minutes < 1) return '< 1 min read';
  return `${minutes} min read`;
}

const TIER_VARIANT: Record<string, 'sage' | 'amber' | 'red'> = {
  Foundations: 'sage',
  Mechanics: 'amber',
  Mastery: 'red',
};

export function WhatNextCard({ block, onStart, dueDrillsCount = 0, focusCurriculumTitle, onClearFocus }: WhatNextCardProps) {
  if (!block) {
    return (
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.75rem',
          minHeight: 180,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontStyle: 'italic',
            color: 'var(--color-accent-sage)',
          }}
        >
          All caught up!
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          No reading blocks due right now. Come back later.
        </span>
      </div>
    );
  }

  const tierVariant = TIER_VARIANT[block.tier] ?? 'muted';

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {focusCurriculumTitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '6px 10px',
            borderRadius: 8,
            background: 'rgba(122,155,138,0.1)',
            border: '1px solid rgba(122,155,138,0.3)',
            alignSelf: 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              color: 'var(--color-accent-sage)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Sequential: {focusCurriculumTitle}
          </span>
          {onClearFocus && (
            <button
              onClick={onClearFocus}
              title="Switch to all subjects"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'rgba(122,155,138,0.2)',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-accent-sage)',
                padding: 0,
                lineHeight: 1,
                fontSize: '0.7rem',
              }}
            >
              ×
            </button>
          )}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Badge variant={tierVariant}>{block.tier}</Badge>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {block.curriculumId}
        </span>
        <Badge variant="muted">{estimatedReadLabel(block.estimatedMinutes)}</Badge>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.25,
        }}
      >
        {block.heading}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={onStart}>
          Read Now <ArrowRight size={16} weight="bold" />
        </Button>
        {dueDrillsCount > 0 && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Also: {dueDrillsCount} drills due
          </span>
        )}
      </div>
    </div>
  );
}
