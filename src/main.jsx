import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Sensible project defaults
gsap.defaults({ ease: 'power2.out', duration: 0.55 })

// Respect reduced motion: skip the animation entirely so elements render at
// their natural (final) state. Freezing globalTimeline.timeScale(0) used to
// leave entrance tweens stuck at opacity:0, hiding content. Per-hook guards
// (usePageEntrance, useModalAnimation) handle GSAP; CSS is handled in index.css.

// Initialize theme — atmospheric dark is the default experience.
// `.light` opts into the simple light variant; absence of the class = dark.
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
  document.documentElement.classList.add('light')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
