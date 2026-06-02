/**
 * Logo — distinctive vault/cube mark for PKGVault.
 *
 * A stylised 3D vault face: two stacked diamonds in negative space carved
 * into a rounded square, suggesting "secure container" + "package".
 * Renders as a pure SVG with a soft gradient fill — pairs with the wordmark
 * in the navbar / hero / footer.
 */

interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Disable the gradient and render as a flat currentColor mark. */
  monochrome?: boolean;
}

export function Logo({ size = 32, className, style, monochrome }: LogoProps) {
  const id = "pv-logo-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      style={style}
      aria-label="PKGVault"
      role="img"
    >
      <title>PKGVault</title>
      {!monochrome && (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent-hover)" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
      )}
      {/* Vault body */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill={monochrome ? "currentColor" : `url(#${id})`}
      />
      {/* Top shine band — two-layer iOS style */}
      {!monochrome && <rect x="2" y="2" width="28" height="14" rx="8" fill={`url(#${id}-shine)`} />}
      {/* Vault inset — two stacked chevrons forming a "V" carved face */}
      <path
        d="M9 10 L16 17 L23 10"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 17 L16 24 L23 17"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
