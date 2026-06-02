import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function useModalAnimation(overlayRef, panelRef, onClose) {
  const tl = useRef()

  useGSAP(() => {
    if (!overlayRef.current || !panelRef.current) return
    // Reduced motion: show overlay/panel instantly, no enter/exit timeline.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    tl.current = gsap.timeline({
      defaults: { ease: 'expo.out', duration: 0.25 }
    })
      .fromTo(overlayRef.current, { 
        autoAlpha: 0, 
      }, {
        autoAlpha: 1,
      })
      .fromTo(panelRef.current, { 
        scale: 0.98, 
        y: 8, 
        autoAlpha: 0, 
      }, {
        scale: 1,
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
        force3D: true
      }, '<0.05')
  }, { scope: overlayRef })

  const handleClose = () => {
    if (tl.current) {
      tl.current.reverse(1.5).then(onClose) // Faster reverse for snappy dismissal
    } else {
      onClose()
    }
  }

  return { handleClose }
}
