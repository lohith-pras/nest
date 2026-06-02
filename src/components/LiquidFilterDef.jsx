import { useEffect, useRef } from 'react'

/**
 * LiquidFilterDef
 * Renders a hidden SVG that defines the global #liquid-glass filter.
 * Apply the filter on any element via: backdrop-filter: url(#liquid-glass)
 * The turbulence baseFrequency is animated via rAF to create flowing liquid motion.
 */
export default function LiquidFilterDef() {
  const turbRef = useRef(null)

  useEffect(() => {
    let raf
    let t = 0

    const tick = () => {
      t += 0.003
      if (turbRef.current) {
        const bfX = (0.008 + Math.sin(t * 0.7) * 0.002).toFixed(5)
        const bfY = (0.012 + Math.cos(t * 0.5) * 0.003).toFixed(5)
        turbRef.current.setAttribute('baseFrequency', `${bfX} ${bfY}`)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'fixed', width: 0, height: 0, top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id="liquid-glass"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          {/* Animated organic noise */}
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          {/* Displace the backdrop pixels to create refraction */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Slightly brighten displaced result for glassy clarity */}
          <feComponentTransfer in="displaced">
            <feFuncR type="linear" slope="1.04" />
            <feFuncG type="linear" slope="1.04" />
            <feFuncB type="linear" slope="1.06" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}
