import { motion } from 'framer-motion'

export default function AmbientBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'var(--bg)'
    }}>
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '60vw',
          height: '60vh',
          background: 'var(--accent)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.15
        }}
      />
      <motion.div
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vh',
          background: 'var(--accent-soft)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.15
        }}
      />
    </div>
  )
}
