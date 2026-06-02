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

// Initialize theme
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
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
