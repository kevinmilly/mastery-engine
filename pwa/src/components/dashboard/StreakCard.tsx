import { Fire } from '@phosphor-icons/react';

interface StreakCardProps {
  streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.4rem',
      }}
    >
      {streak > 0 ? (
        <>
          <div
            style={{
              animation: 'streakPulse 3s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Fire
              size={36}
              weight="fill"
              style={{ color: 'var(--color-accent-amber)' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3rem',
                fontWeight: 700,
                color: 'var(--color-accent-amber)',
                lineHeight: 1,
              }}
            >
              {streak}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            day streak
          </span>
        </>
      ) : (
        <>
          <Fire size={32} weight="regular" style={{ color: 'var(--color-text-muted)' }} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Start your streak today
          </span>
        </>
      )}

      <style>{`
        @keyframes streakPulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(212,168,83,0.3)); }
          50% { filter: drop-shadow(0 0 12px rgba(212,168,83,0.6)); }
        }
      `}</style>
    </div>
  );
}
