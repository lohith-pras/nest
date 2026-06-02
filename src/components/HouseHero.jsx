/* Signature illustration: a cozy little house with smoke drifting from the
   chimney. Pure inline SVG + CSS keyframes (see .house-smoke in index.css) so
   there's no Lottie/asset dependency and it themes off the palette. The smoke
   only drifts when prefers-reduced-motion is "no-preference" — otherwise it
   renders as a calm static puff. Frequency-gated to rare views (Login). */
export default function HouseHero({ size = 132 }) {
  const stroke = 'var(--cream)'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label="A small house with smoke rising from the chimney"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Smoke — three puffs rising from the chimney, staggered */}
      <g className="house-smoke">
        <circle className="house-smoke__puff house-smoke__puff--1" cx="78" cy="30" r="5" fill="var(--accent-soft)" />
        <circle className="house-smoke__puff house-smoke__puff--2" cx="82" cy="22" r="6.5" fill="var(--accent)" />
        <circle className="house-smoke__puff house-smoke__puff--3" cx="76" cy="14" r="8" fill="var(--accent-soft)" />
      </g>

      {/* Chimney */}
      <rect x="72" y="34" width="13" height="20" rx="2" fill="var(--accent)" />

      {/* Roof */}
      <path d="M60 26 L100 58 L20 58 Z" fill="var(--accent-deep)" />

      {/* House body */}
      <rect x="28" y="58" width="64" height="46" rx="3" fill="var(--surface)" stroke={stroke} strokeWidth="2.5" />

      {/* Door */}
      <rect x="52" y="78" width="16" height="26" rx="2" fill="var(--accent-deep)" />
      <circle cx="64" cy="91" r="1.6" fill="var(--cream)" />

      {/* Window, with a warm glow */}
      <rect x="36" y="68" width="14" height="14" rx="2" fill="var(--accent-soft)" stroke={stroke} strokeWidth="2" />
      <line x1="43" y1="68" x2="43" y2="82" stroke={stroke} strokeWidth="1.4" />
      <line x1="36" y1="75" x2="50" y2="75" stroke={stroke} strokeWidth="1.4" />

      {/* Ground line */}
      <line x1="14" y1="104" x2="106" y2="104" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
