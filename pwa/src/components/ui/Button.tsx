import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4em',
  padding: '0.55em 1.2em',
  borderRadius: 6,
  border: '1px solid transparent',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.9rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 200ms, color 200ms, border-color 200ms, opacity 200ms',
  textDecoration: 'none',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
};

const variants: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent-red)',
    color: '#fff',
    borderColor: 'var(--color-accent-red)',
  },
  secondary: {
    background: 'var(--color-surface-raised)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    borderColor: 'transparent',
  },
};

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...base,
        ...variants[variant],
        ...(disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}),
      }}
    >
      {children}
    </button>
  );
}
