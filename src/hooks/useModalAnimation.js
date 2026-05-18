import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function useModalAnimation(overlayRef, panelRef, onClose) {
  const tl = useRef()

  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true })
      .from(overlayRef.current, { autoAlpha: 0, duration: 0.25 })
      .from(panelRef.current, { scale: 0.92, y: 20, autoAlpha: 0, ease: 'back.out(1.7)', duration: 0.35 }, '<0.05')
      
    tl.current.play()
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
