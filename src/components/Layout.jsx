import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

export default function Layout() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <main style={{
        flex: 1,
        padding: '0 20px',
        paddingTop: 'max(20px, env(safe-area-inset-top))',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
        overflowY: 'auto',
        overflowX: 'hidden',
        color: 'var(--cream)',
      }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
