import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function useModalAnimation(overlayRef, panelRef, onClose) {
  const tl = useRef()

  useGSAP(() => {
    if (!overlayRef.current || !panelRef.current) return

    tl.current = gsap.timeline({ 
      defaults: { ease: 'expo.out', duration: 0.25 }
    })
      .from(overlayRef.current, { 
        autoAlpha: 0, 
      })
      .from(panelRef.current, { 
        scale: 0.98, 
        y: 8, 
        autoAlpha: 0, 
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
