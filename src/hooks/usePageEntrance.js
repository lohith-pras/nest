import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function usePageEntrance(selector = '.enter-item') {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (!containerRef.current) return
    const items = containerRef.current.querySelectorAll(selector)
    if (!items.length) return
    // Reduced motion: leave items at their natural rendered state, no entrance.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      items,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      }
    )
  }, { scope: containerRef })

  return containerRef
}
