# Design System Specification: Ground Control Editorial

## 1. Overview & Creative North Star

### The Creative North Star: "The Tactical Obsidian"
This design system is engineered for the high-stakes environment of Professional Drone Ground Control Stations (GCS). It rejects the cluttered, utility-first aesthetics of traditional aerospace software in favor of a "Tactical Obsidian" approach. We blend the ruthless minimalism of premium consumer electronics with the absolute precision of mission-critical telemetry.

By utilizing intentional asymmetry and a hyper-focused color palette, we create a UI that feels less like a dashboard and more like a curated tactical lens. The experience is defined by "breathing depth"—where the vastness of a 3D map is overlaid with translucent, intelligent layers that prioritize human cognition over data density.

---

## 2. Colors

The palette is anchored in deep blacks and charcols to preserve the pilot's night vision and focus, punctuated by a singular, high-energy accent.

### Primary Role: Moreh Orange
*   **Primary (`#ffb59a`) / Primary Container (`#FF5C00`):** This is our "Action Heart." It is reserved strictly for primary interactions, active flight states, and critical telemetry highlights.
*   **The Signature Glow:** Active icons and critical status indicators should utilize a subtle outer glow (0px 0px 8px) using the `primary_container` value at 40% opacity.

### Neutral & Surface Hierarchy
*   **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning panels. Boundaries must be defined by the transition from `surface` (#131313) to `surface_container_low` (#1c1b1b) or via backdrop blurs.
*   **Surface Nesting:** 
    *   **Level 0 (Map/Background):** `surface_container_lowest` (#0e0e0e).
    *   **Level 1 (Floating Panels):** `surface_container` (#201f1f) with `backdrop-blur-xl`.
    *   **Level 2 (In-Panel Cards):** `surface_container_high` (#2a2a2a).

### Status Colors
*   **Normal:** `tertiary` (#47e266) — For "Safe" and "Connected" states.
*   **Critical:** `error` (#ffb4ab) — For emergency overrides and hardware failure.

---

## 3. Typography

We use a dual-font strategy to balance editorial authority with technical legibility.

*   **Headlines & Display (SF Pro Display):** Used for large telemetry readouts (Alt, Spd) and section headers. High-contrast white (`on_surface`) ensures these are the first things a pilot sees.
*   **Data & Labels (SF Pro Text / Inter):** For granular telemetry and system logs. These use `body-sm` and `label-md` scales to maximize information density without sacrificing clarity.
*   **The Editorial Scale:** Utilize `display-lg` (3.5rem) for the most vital metric on a screen (e.g., Battery %), while secondary metadata uses `label-sm` (0.6875rem) in `on_surface_variant` (#e4beb1) to recede visually.

---

## 4. Elevation & Depth

In a GCS, depth is a functional tool. It separates the "Operating Environment" (the map) from the "Control Layer" (the UI).

*   **The Layering Principle:** Avoid drop shadows on static elements. Instead, use Tonal Layering. A `surface_container_highest` header sitting on a `surface_container` body creates a crisp, sophisticated edge through value contrast alone.
*   **Ambient Shadows:** For "Modal" overlays or floating emergency panels, use an extra-diffused shadow: `0px 24px 48px rgba(0, 0, 0, 0.4)`. 
*   **The "Ghost Border":** If a boundary is required for legibility against a complex 3D map, use a 1px stroke of `outline_variant` at 15% opacity. This creates a "hairline" glass effect without feeling like a heavy box.
*   **Glassmorphism:** All sidebars and HUD elements must use 80% opacity on their surface color combined with `backdrop-blur-xl`. This ensures the pilot never loses context of the drone's position behind the UI.

---

## 5. Components

### Buttons
*   **Primary:** Pill-shaped (`rounded-full` / 9999px). Background: `primary_container` (#FF5C00). Text: `on_primary_container`. No border.
*   **Secondary (Tactical):** Background: `surface_container_highest`. Text: `on_surface`. 1px Ghost Border.
*   **Tertiary:** Ghost style. No background. `on_surface_variant` text. Moreh Orange icon glow when hovered.

### Chips (Telemetry Tags)
*   Used for drone IDs (e.g., DRN-001).
*   **Style:** `surface_container_low` background with a 2px vertical "status bar" on the left edge using the `tertiary` (Green) or `primary` (Orange) tokens.

### Input Fields
*   **State:** Minimalist underline or tonal shift. Do not use boxed inputs.
*   **Focus:** The underline transitions from `outline_variant` to `primary_container` with a soft 2px outer glow.

### Cards & Lists
*   **Forbid Dividers:** Do not use horizontal lines to separate drones in a list. Use `spacing-4` (0.9rem) of vertical whitespace and a subtle background hover state (`surface_bright`).
*   **Status Indicators:** Small 8px circular "pills" that pulse subtly when data is being actively received.

---

## 6. Do's and Don'ts

### Do
*   **Do** prioritize the "Moreh Orange" for the most important data point on the screen. If everything is orange, nothing is important.
*   **Do** use asymmetrical layouts. For example, a heavy telemetry rail on the left balanced by a floating, translucent "Mini-Map" on the bottom right.
*   **Do** use `letter-spacing: -0.02em` on large Display titles to achieve that premium, "Apple-style" editorial tightness.

### Don't
*   **Don't** use pure white (#FFFFFF) for secondary text. Use `on_surface_variant` (#e4beb1) to reduce eye fatigue during long missions.
*   **Don't** use standard "Material Design" cards with heavy shadows. Use tonal shifts and glass blurs to imply hierarchy.
*   **Don't** use sharp 90-degree corners. Even in a professional tool, the `DEFAULT` (1rem) or `md` (1.5rem) roundedness scale should be applied to keep the UI feeling "consumer-grade premium."