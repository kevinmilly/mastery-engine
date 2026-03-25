interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  color = 'var(--color-accent-sage)',
  label,
  sublabel,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Center text */}
      {(label || sublabel) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {label && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: size < 60 ? '0.75rem' : '0.9rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          )}
          {sublabel && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.6rem',
                color: 'var(--color-text-muted)',
                marginTop: 2,
                lineHeight: 1,
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
