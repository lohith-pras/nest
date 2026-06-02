# Liquid Glass Architecture Design

## Purpose
To implement an Apple-style "liquid glass" aesthetic across the application for both dark and light modes. The design relies on an ambient, organic background mesh to provide the visual complexity needed for the frosted glass elements to stand out, while keeping the content area clean and readable.

## Visual Direction
- **Style:** Subtle iOS Glass (opaque but blurred surfaces, softer borders).
- **Background:** Ambient Mesh Gradient (slowly moving color blobs mapped to theme accents).
- **Behavior:** Ensures sufficient contrast for typography while giving the app a premium, layered spatial feel.

## Architecture & Components

### 1. AmbientBackground Component
- **Location:** `src/components/AmbientBackground.jsx` (or similar shared component directory).
- **Purpose:** Renders 2-3 large, heavily blurred DOM elements that drift slowly across the screen using `framer-motion` or CSS animations.
- **Placement:** Positioned fixed at the back of `#root` or `App.jsx`, taking up `100vw` and `100vh` with `z-index: -1`.
- **Theming:** Colors will map to existing CSS variables (`--accent`, `--accent-soft`, etc.) and automatically adjust opacity/brightness for light vs. dark mode.

### 2. Design Tokens (`src/index.css`)
Introduces new CSS variables to separate solid backgrounds from glass backgrounds.

**New Variables:**
- `--glass-surface`: For cards and modals (e.g., `rgba(255,255,255,0.65)` in light, `rgba(28,25,26,0.65)` in dark).
- `--glass-nav`: For structural navigation like bottom bars and sidebars.
- `--glass-border`: A lighter, semi-transparent color for simulating specular edge highlights.
- `--glass-blur`: Standardized blur amount (e.g., `12px`).

### 3. Component Updates
Existing UI components will be updated to consume the new glass tokens:
- **Cards & Modals (`.glass`, `.glass-card`, `.modal`)**: Replace `var(--surface-raised)` with `var(--glass-surface)` and add `backdrop-filter: blur(var(--glass-blur))`.
- **Navigation (`.bottom-nav`, `.sidebar`)**: Apply `--glass-nav` and the standard blur.
- **Borders**: Update standard `1px solid var(--border)` to include a subtle inset shadow or lighter top/left border to simulate physical glass thickness.

## Error Handling & Edge Cases
- **Reduced Motion:** If `prefers-reduced-motion` is active, the ambient background blobs will remain static.
- **Performance:** CSS `backdrop-filter` can be expensive on lower-end devices. Will ensure hardware acceleration (`transform: translateZ(0)`) is used on the blur layers.

## Testing Strategy
- Manual visual QA in both Light and Dark mode to ensure text contrast on top of the glass remains accessible.
- Verify `prefers-reduced-motion` stops the ambient background animation.
