import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export function SuccessOverlay({ show, onComplete }) {
  const dismissed = useRef(false)
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Reset guard each time overlay opens
  useEffect(() => {
    if (show) dismissed.current = false
  }, [show])

  function dismiss() {
    if (dismissed.current) return
    dismissed.current = true
    onComplete()
  }

  // Fallback: auto-dismiss after 3s if onComplete prop never fires
  useEffect(() => {
    if (!show) return
    // Reduced motion: don't autoplay the burst; dismiss quickly.
    const t = setTimeout(dismiss, prefersReduced ? 500 : 1400)
    return () => clearTimeout(t)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          onClick={dismiss}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--overlay-bg)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 200,
            cursor: 'pointer',
          }}
        >
          <DotLottieReact
            src="/Money.lottie"
            loop={false}
            autoplay={!prefersReduced}
            speed={2}
            onComplete={dismiss}
            style={{ width: 220, height: 220 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
