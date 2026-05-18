# Design Spec: Mobile-Only Migration & Navigation Refactor

## 1. Goal
Transition the Roomy app from a responsive web app to a strict mobile-only layout optimized for the iPhone 16 Pro dimensions. Resolve the current navigation bug where the "Apartment" and "Sign Out" actions are inaccessible on mobile devices.

## 2. Architecture & Layout Updates
*   **Viewport & Sizing**: Lock the application's maximum width and styling to mobile proportions. We will remove desktop-specific media queries from `index.css` to ensure elements render at the intended iPhone 16 Pro scale (viewport width ~393px to 430px) regardless of the host browser window.
*   **Component Pruning**: The desktop `<aside>` sidebar in `Layout.jsx` will be completely removed.

## 3. Navigation Strategy (The "More" Menu)
The bottom navigation bar will be made permanent across all screens and expanded to a 5-tab layout:
1.  **Dashboard** (Home)
2.  **Expenses**
3.  **Groceries**
4.  **Calendar**
5.  **More** (New Tab)

### 4. The "More" Screen
A new top-level route and component (`More.jsx`) will be created. This screen will act as a hub for secondary features and account management.
*   **Content**: 
    *   Profile summary (Avatar + Name)
    *   Link to **Interests**
    *   Link to **Apartment**
    *   Link to **Settings**
    *   **Sign Out** button (Red/Danger style)

## 5. Data Flow & State
No database schema changes are required. The `Layout.jsx` will be simplified to purely render the main `<Outlet />` and the persistent `<nav className="bottom-nav">`. The `AuthContext` will continue handling the sign-out logic, simply triggered from the new `More.jsx` view.

## 6. Testing
*   Verify the bottom tab bar shows 5 icons evenly spaced.
*   Verify routing to the new `/more` path works.
*   Verify the Sign Out action functions correctly from the new menu.
*   Check that layout boundaries respect mobile dimensions.