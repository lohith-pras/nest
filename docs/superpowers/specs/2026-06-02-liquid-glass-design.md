# WWDC iOS 26 Liquid Glass Redesign

## Goal
Implement a "pure liquid glass" visual aesthetic across the application. This replaces all frosted/matte "glassmorphism" with a highly transparent, glossy, liquid-refraction look that distorts the underlying UI dynamically as if viewed through a sheet of moving water or syrup.

## 1. Architecture & Global Liquid Layer

*   **LiquidOverlay Component:** A new React component `<LiquidOverlay />` will be created and mounted at the root level (likely inside `App.jsx` or `Layout.jsx`), sitting on top of the UI with `pointer-events: none` and a high `z-index`.
*   **SVG Filters:** The overlay will utilize an inline SVG containing `<filter id="liquid">`. This filter will combine:
    *   `<feTurbulence>` to generate organic noise.
    *   `<feDisplacementMap>` to use the noise to warp and refract the pixels underneath the overlay.
*   **CSS Application:** The SVG filter will be applied to the overlay's CSS via `backdrop-filter: url(#liquid)`.

## 2. Specular Highlights & Gloss

*   **Removal of Matte Blur:** All standard `blur()` and semi-opaque background colors will be removed from `.glass` and `.glass-card` classes to eliminate the frosted look.
*   **Gloss Animations:** The `<LiquidOverlay />` will include animated CSS radial/linear gradients simulating specular light reflections moving across the surface of the "liquid." These will be highly transparent white/bright flashes overlaying the refracted UI.
*   **Card Boundaries:** With backgrounds fully transparent, individual cards and UI elements will be delineated entirely by thin, sharp, high-contrast borders (e.g., `box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4)` or similar) and their typography.

## 3. Animation Strategy

*   The `baseFrequency` or `numOctaves` of the `<feTurbulence>` primitive will be animated using GSAP or CSS to create a slow, continuous flowing liquid motion without the performance penalty of WebGL.
*   The specular gradients will orbit or pan slowly across the screen.

## Verification

*   Check performance on both desktop and simulated mobile environments to ensure the SVG displacement map does not cause severe frame drops.
*   Verify that clicking and interacting with buttons/inputs still works perfectly (i.e., `pointer-events: none` is correctly applied to the overlay).
