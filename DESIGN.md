# Design System Specification: The Inspector’s Ledger

## 1. Overview & Creative North Star
**Creative North Star: The Digital Architect**
This design system moves away from the generic "admin dashboard" trope. Instead, it adopts the persona of a precision instrument—an architectural blueprint for data. It is designed for the QA engineer and developer who requires high information density without the cognitive load of a cluttered interface. 

The aesthetic is "Technical Editorial": it combines the authoritative, high-contrast typography of a premium journal with the utilitarian, rigid functionality of a terminal. We achieve this through intentional asymmetry (e.g., offset data headers), tonal layering that replaces heavy borders, and a disciplined monochromatic foundation punctuated by high-energy teals.

## 2. Colors
The palette is rooted in the deep "Obsidian Blue" and "Slate Gray" spectrum to minimize eye strain during long-form debugging sessions.

### Surface Hierarchy & Nesting
To create a premium "dev-tool" feel, we abandon the flat grid. We use **Tonal Layering** to define space:
- **Base Layer:** `surface` (#0b1326) – The canvas of the application.
- **Sectioning:** `surface_container_low` (#131b2e) – Used for large sidebar or navigation regions.
- **Primary Workspaces:** `surface_container` (#171f33) – The main content area where inspection happens.
- **Actionable Cards:** `surface_container_high` (#222a3d) – Used for individual match cards or JSON blocks.

### The "No-Line" Rule
Standard 1px borders are prohibited for layout sectioning. Boundaries must be defined by shifting between `surface_container` tiers. A card should be distinguishable from the background simply because it is two steps "brighter" in the hierarchy (`surface_container_high` on `surface`).

### The "Glass & Gradient" Rule
For floating modals or pop-over inspectors, use Glassmorphism:
- **Background:** `secondary_container` at 60% opacity.
- **Effect:** 12px Backdrop Blur.
- **Accent:** A 1px "Ghost Border" using `outline_variant` at 15% opacity to catch the light.

## 3. Typography
We utilize a dual-font strategy to balance high-end editorial vibes with technical precision.

- **The Display & Headline (Space Grotesk):** This typeface provides a geometric, modern "tech" feel. Use `headline-lg` for match titles to give them an authoritative presence.
- **The Body (Inter):** Highly legible and neutral. Used for all status descriptions and UI labels.
- **The Data (Monospace):** For JSON inspection and match IDs, use a high-quality monospaced font (e.g., JetBrains Mono or Roboto Mono). This is non-negotiable for the "dev-tool" aesthetic.

**Hierarchy Strategy:**
- **Title-SM (Inter, Bold):** For data keys (e.g., `Match ID:`).
- **Label-MD (Space Grotesk, Medium):** For secondary metadata to provide a visual texture change from the body text.

## 4. Elevation & Depth
Depth in this system is a product of light and layering, not heavy shadows.

- **The Layering Principle:** Instead of shadows, "stack" your containers. A `surface_container_highest` element sitting on a `surface_dim` background creates a natural, sophisticated lift.
- **Ambient Shadows:** For high-priority floating elements (e.g., a "Live" match notification), use a shadow tinted with the primary color: `0px 8px 24px rgba(60, 221, 199, 0.08)`.
- **Ghost Borders:** On dark backgrounds, use the `outline_variant` (#41484c) at 20% opacity. This creates a "razor-thin" edge that feels like professional hardware.

## 5. Components

### Status Indicators (The "Pulse" System)
Status is the heartbeat of the inspection console.
- **Live:** `primary` (#3cddc7) text with a subtle `primary_container` background. Add a small 4px pulse dot.
- **Finished:** `secondary` (#b9c8de) text. Desaturated to indicate a past state.
- **Scheduled:** `tertiary` (#7bd0ff) text. A bright, energetic blue to signal future potential.

### Buttons
- **Primary:** Gradient from `primary` to `primary_fixed_dim`. No border. White or `on_primary` text.
- **Secondary:** Transparent background with a `Ghost Border`. Text in `secondary`.
- **Ghost/Tertiary:** No background or border. `on_surface_variant` text, shifting to `primary` on hover.

### JSON Inspector Blocks
- **Container:** `surface_container_lowest` (#060e20).
- **Styling:** Inset padding of `1rem`. Monospaced font.
- **Syntax Highlighting:** 
    - Keys: `secondary`
    - Strings: `primary`
    - Numbers: `tertiary`

### Match Cards
Forbid divider lines. Separate the "Team vs Team" header from the "Metadata" footer using a vertical space of `1.5rem` and a background shift to `surface_container_highest` for the footer area.

## 6. Do’s and Don’ts

### Do:
- **Use Monospace for IDs:** Any hexadecimal or ID string must be monospaced to signify "technical data."
- **Embrace Negative Space:** High density doesn't mean "cramped." Use consistent 8px/16px/24px spacing increments to let the data breathe.
- **Use Subtle Gradients:** Apply a 10% vertical gradient to primary buttons to give them a "machined" feel.

### Don’t:
- **Don’t use 100% white text:** Always use `on_surface` or `on_surface_variant`. Pure white (#FFFFFF) is jarring against the deep blue background and causes "vibration."
- **Don’t use rounded corners larger than `lg` (0.5rem):** This is a professional tool; excessively round corners feel too consumer-facing/playful. Keep edges crisp (0.25rem is the default).
- **Don’t use default shadows:** Standard black shadows look "dirty" on deep blue surfaces. Always tint your shadows with the background hue.