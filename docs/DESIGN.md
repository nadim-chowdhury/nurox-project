# Design System Specification: Liquid Precision

## 1. Overview & Creative North Star: "The Architectural Infinite"

This design system is a departure from the cluttered, modular nature of traditional ERPs. It is built upon the North Star of **The Architectural Infinite**—a philosophy that treats digital interfaces as expansive, high-end physical environments.

By prioritizing "Liquid Precision," the system balances fluid, responsive layouts with razor-sharp typographic execution. We reject the "template" look characterized by rigid grids and boxed-in data. Instead, we embrace intentional asymmetry, vast whitespace, and a high-contrast scale that makes enterprise data feel like a curated editorial experience. This is not just a tool; it is a premium environment designed for high-stakes decision-making.

---

## 2. Colors: The Deep Space Palette

The color strategy utilizes a monochromatic base of charcoal, slate, and silver to create a sense of vastness, punctuated by "Electric Cyan" for functional energy.

### Color Principles

- **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid borders for sectioning or layout containment. Boundaries must be defined solely through background color shifts. For example, a main content area using `surface` should be distinguished from a sidebar using `surface_container_low` without any stroke between them.
- **Surface Hierarchy & Nesting:** Use the surface-container tiers to create "nested" depth. Treat the UI as a series of physical layers. An inner dashboard widget should sit on `surface_container_highest` if the parent container is `surface_container_low`.
- **The "Glass & Gradient" Rule:** To achieve a futuristic feel, floating elements (modals, dropdowns) must use Glassmorphism. Apply `surface_variant` with a 60% opacity and a 20px backdrop-blur.
- **Signature Textures:** For primary calls-to-action, use a subtle linear gradient transitioning from `primary` (#c3f5ff) to `primary_container` (#00e5ff) at a 135-degree angle. This adds "soul" and professional polish to interactive elements.

### Key Tokens

- **Background:** `#0c1324` (Deep Space)
- **Primary:** `#c3f5ff` (Electric Cyan)
- **Surface Tiers:** From `surface_container_lowest` (#070d1f) to `highest` (#2e3447).
- **Accents:** Use `tertiary` (#e3eeff) for secondary data points to maintain the silver/slate architectural tone.

---

## 3. Typography: Razor-Sharp Editorial

The typography system uses a variable sans-serif approach to create a hierarchy that feels both futuristic and authoritative.

- **Display & Headlines (Space Grotesk):** These are the architectural anchors. Space Grotesk provides a technical, "razor-sharp" edge. Use `display-lg` (3.5rem) with tighter tracking (-0.02em) for hero data points.
- **Body & Labels (Manrope):** Manrope is used for high-readability. Its modern, geometric shapes complement the display font while ensuring that dense ERP data remains legible.
- **Hierarchy as Identity:** Use extreme scale contrast. A `display-sm` header should sit confidently above a `body-sm` description to create a sophisticated, high-end editorial rhythm.

---

## 4. Elevation & Depth: Tonal Layering

In this design system, depth is a result of light and material, not artificial structure.

- **The Layering Principle:** Depth is achieved by "stacking" surface-container tiers. For instance, place a `surface_container_lowest` card on a `surface_container_low` section. This creates a soft, natural lift that feels architectural rather than "pasted on."
- **Ambient Shadows:** If a floating effect is required (e.g., a high-priority modal), use an extra-diffused shadow.
  - _Shadow Property:_ `0px 24px 48px rgba(7, 13, 31, 0.4)`
  - The shadow must be a tinted version of the background, never a neutral grey.
- **The "Ghost Border" Fallback:** If a border is essential for accessibility, it must be a "Ghost Border." Use the `outline_variant` token at 15% opacity. High-contrast, 100% opaque borders are strictly forbidden.
- **Glassmorphism:** Navigation rails and floating action bars must use backdrop blurs. This allows the "Deep Space" colors to bleed through, softening the interface and making it feel integrated into the "Liquid" layout.

---

## 5. Components

### Buttons

- **Primary:** High-energy `primary` background with `on_primary` text. Use the `DEFAULT` (0.25rem) roundedness for a sharp, precision look.
- **Secondary:** Ghost-style buttons with a `primary` "Ghost Border" (20% opacity) and `primary` text.
- **Interaction:** On hover, primary buttons should emit a soft `primary_fixed_dim` outer glow (8px blur).

### Cards & Data Landscapes

- **Rules:** Forbid all divider lines.
- **Structure:** Separate content using the Spacing Scale (generous whitespace). Use `surface_container_low` as the base and `surface_container_high` for internal hovering states.
- **Data Density:** For ERP tables, use "Data Landscapes." Use background stripes of `surface_container_lowest` against `surface` to denote rows, rather than lines.

### Input Fields

- **Style:** Minimalist. A simple `surface_container_highest` background with a `primary` 2px bottom-accent that appears only on focus.
- **Labels:** Use `label-md` in `on_surface_variant` positioned strictly above the field to maintain architectural alignment.

### Chips & Tags

- **Action Chips:** Utilize `full` roundedness and `secondary_container` backgrounds.
- **Feedback:** Functional states (error/success) must use the `error` (#ffb4ab) and `primary` (cyan) tokens with 10% opacity backgrounds to remain subtle and premium.

---

## 6. Do's and Don'ts

### Do

- **Do** use asymmetrical layouts where one column is significantly wider than the other to create a curated feel.
- **Do** lean into whitespace. If a section feels "empty," it is likely working as intended.
- **Do** use `spaceGrotesk` for all numerical data in dashboards to emphasize precision.
- **Do** use the `primary` (Electric Cyan) sparingly; it should represent "signal" within the "noise."

### Don't

- **Don't** use 1px borders to separate content sections.
- **Don't** use pure black (#000000) or pure white (#FFFFFF). Use the `surface` and `on_surface` tokens for better tonal depth.
- **Don't** use heavy "drop shadows" with 0 blur. Shadows must be ambient and atmospheric.
- **Don't** use the `full` roundedness on primary structural containers; keep them to `DEFAULT` (0.25rem) or `none` to maintain the architectural aesthetic.
