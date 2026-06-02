import { motion } from 'framer-motion'

const containerStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: -1,
  overflow: 'hidden',
  pointerEvents: 'none',
  background: 'var(--bg)'
};

const shapeBaseStyle = {
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(80px)',
  opacity: 0.15,
  willChange: 'transform'
};

const shape1Style = {
  ...shapeBaseStyle,
  top: '-10%',
  left: '-10%',
  width: '60vw',
  height: '60vh',
  background: 'var(--accent)'
};

const shape2Style = {
  ...shapeBaseStyle,
  bottom: '-10%',
  right: '-10%',
  width: '50vw',
  height: '50vh',
  background: 'var(--accent-soft)'
};

export default function AmbientBackground() {
  return (
    <div style={containerStyle}>
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={shape1Style}
      />
      <motion.div
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={shape2Style}
      />
    </div>
  )
}
