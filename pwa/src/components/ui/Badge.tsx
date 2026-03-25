import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'sage' | 'amber' | 'red' | 'blue' | 'muted';
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, { bg: string; color: string }> = {
  sage: { bg: 'rgba(122,155,138,0.15)', color: 'var(--color-accent-sage)' },
  amber: { bg: 'rgba(212,168,83,0.15)', color: 'var(--color-accent-amber)' },
  red: { bg: 'rgba(192,57,43,0.15)', color: 'var(--color-accent-red)' },
  blue: { bg: 'rgba(107,140,174,0.15)', color: 'var(--color-accent-blue)' },
  muted: { bg: 'rgba(107,99,96,0.2)', color: 'var(--color-text-muted)' },
};

export function Badge({ children, variant = 'muted' }: BadgeProps) {
  const { bg, color } = variantStyles[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 100,
        fontSize: '0.7rem',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        letterSpacing: '0.02em',
        background: bg,
        color,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
