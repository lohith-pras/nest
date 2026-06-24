import { motion } from 'framer-motion'

/* Global atmospheric glow layer — the single source of the app's ambient
   mesh-gradient background (Slava Kornilov "AI OS" DNA). Sits behind all
   page content so every screen shares one consistent dark canvas. */

const containerStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: -1,
  overflow: 'hidden',
  pointerEvents: 'none',
  background: 'var(--color-bg)',
}

const shapeBase = {
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(90px)',
  willChange: 'transform',
}

export default function AmbientBackground() {
  return (
    <div style={containerStyle} aria-hidden="true">
      {/* warm red — top right */}
      <motion.div
        animate={{ x: [0, 40, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.12, 0.92, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{ ...shapeBase, top: '-12%', right: '-10%', width: '52vw', height: '52vw', maxWidth: 460, maxHeight: 460, background: 'oklch(58% 0.26 18 / 0.30)' }}
      />
      {/* violet — bottom left */}
      <motion.div
        animate={{ x: [0, -50, 50, 0], y: [0, 50, -40, 0], scale: [1, 0.9, 1.12, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        style={{ ...shapeBase, bottom: '-8%', left: '-14%', width: '60vw', height: '60vw', maxWidth: 520, maxHeight: 520, background: 'oklch(48% 0.20 295 / 0.24)' }}
      />
      {/* warm taupe accent — center drift, ties to brand */}
      <motion.div
        animate={{ x: [0, 30, -30, 0], y: [0, 30, -20, 0], scale: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
        style={{ ...shapeBase, top: '35%', left: '20%', width: '44vw', height: '44vw', maxWidth: 380, maxHeight: 380, background: 'var(--color-accent-glow)' }}
      />
    </div>
  )
}
