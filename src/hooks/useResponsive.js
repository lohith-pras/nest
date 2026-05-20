import { useState, useEffect } from 'react'

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 481,
  desktop: 769,
  largeDesktop: 1024,
}

export default function useResponsive() {
  const [breakpoint, setBreakpoint] = useState(getBreakpoint(window.innerWidth))

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isLargeDesktop: breakpoint === 'largeDesktop',
    width: window.innerWidth,
  }
}

function getBreakpoint(width) {
  if (width >= BREAKPOINTS.largeDesktop) return 'largeDesktop'
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}
