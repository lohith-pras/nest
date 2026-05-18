import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function useModalAnimation(overlayRef, panelRef, onClose) {
  const tl = useRef()

  useGSAP(() => {
    if (!overlayRef.current || !panelRef.current) return

    tl.current = gsap.timeline({ 
      defaults: { ease: 'power2.out' }
    })
      .from(overlayRef.current, { 
        autoAlpha: 0, 
        duration: 0.3 
      })
      .from(panelRef.current, { 
        scale: 0.94, 
        y: 20, 
        autoAlpha: 0, 
        ease: 'back.out(1.4)', 
        duration: 0.4,
        force3D: true
      }, '<0.05')
  }, { scope: overlayRef })

  const handleClose = () => {
    if (tl.current) {
      tl.current.reverse().then(onClose)
    } else {
      onClose()
    }
  }

  return { handleClose }
}
