interface MomentumArcProps {
  momentum: number; // 0-100
}

// Interpolate color: red (0) -> amber (50) -> sage (100)
function getMomentumColor(value: number): string {
  if (value < 50) {
    // red to amber
    const t = value / 50;
    const r = Math.round(192 + (212 - 192) * t);
    const g = Math.round(57 + (168 - 57) * t);
    const b = Math.round(43 + (83 - 43) * t);
    return `rgb(${r},${g},${b})`;
  } else {
    // amber to sage
    const t = (value - 50) / 50;
    const r = Math.round(212 + (122 - 212) * t);
    const g = Math.round(168 + (155 - 168) * t);
    const b = Math.round(83 + (138 - 83) * t);
    return `rgb(${r},${g},${b})`;
  }
}

export function MomentumArc({ momentum }: MomentumArcProps) {
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;

  // Semi-circle: start at left (180deg), end at right (0deg), spanning 180deg
  const cx = size / 2;
  const cy = size / 2;

  // Arc path for a semi-circle (bottom half hidden, top half shown)
  // We use stroke-dasharray on a full circle but only show top half
  const circumference = Math.PI * radius; // half circumference
  const fullCircumference = 2 * Math.PI * radius;
  const filled = (momentum / 100) * circumference;
  // We rotate so arc starts from left
  const dashArray = `${filled} ${fullCircumference - filled}`;
  // offset: start at left side of circle (270deg from top = 3/4 of circumference)
  const dashOffset = -(fullCircumference * 0.75);

  const color = getMomentumColor(momentum);

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
        gap: '0.5rem',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size / 2 + strokeWidth / 2, overflow: 'hidden' }}>
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Track semi-circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${fullCircumference - circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color,
              lineHeight: 1,
              transition: 'color 0.6s ease',
            }}
          >
            {momentum}%
          </span>
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        Session Momentum
      </span>
    </div>
  );
}
