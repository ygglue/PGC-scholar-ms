# Design System Document: PGC-Scholar Management System

## 1. Overview & Creative North Star
This design system is built for a premier scholar management portal, moving beyond the utilitarian look of standard administrative tools to create a space that feels prestigious, nurturing, and high-performance. 

**Creative North Star: "The Digital Curator"**
The system rejects the "boxed-in" feeling of traditional portals. Instead of rigid grids and heavy borders, it utilizes **Organic Editorialism**. We treat information like curated exhibits in a modern gallery: expansive white space, intentional asymmetry in card sizing, and sophisticated tonal layering. This creates a sense of "intellectual breathing room," allowing scholars to focus on their journey without the cognitive load of cluttered interfaces.

---

## 2. Color Strategy
Our palette is rooted in a "Prestigious Botanical" theme, using deep greens for authority and vibrant golds for achievement.

### The Palette (Material Design Tokens)
- **Primary Hub (`#006834`):** Represents growth and stability. Used for primary actions and brand presence.
- **Secondary Aura (`#785900`):** Representing excellence and reward. Used for achievement milestones and high-value data points.
- **Surface Hierarchy:** 
  - `background`: `#f5fbf2` (The foundation)
  - `surface_container_low`: `#f0f5ec`
  - `surface_container_highest`: `#dee4db`
  - `surface_container_lowest`: `#ffffff` (Used for peak-priority content)

### The "No-Line" Rule
**Explicit Instruction:** Junior designers are prohibited from using 1px solid borders to section content. To separate a scholarship overview from a list of tasks, use background shifts. A `surface_container_low` section should sit directly on the `background`. Boundary definition is a matter of tone, not strokes.

### Signature Textures & Glassmorphism
To avoid a flat, "template" look:
- **Hero Gradients:** Use a subtle linear gradient from `primary` (#006834) to `primary_container` (#008444) at a 135-degree angle for main dashboard cards.
- **Glassmorphism:** For floating navigation bars or modal overlays, use `surface_container_lowest` with 80% opacity and a `20px` backdrop blur. This ensures the vibrant portal colors bleed through, creating a "frosted glass" premium feel.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance modern performance with academic tradition.

*   **Display & Headlines (Plus Jakarta Sans):** A high-character sans-serif that feels contemporary yet established. Use `display-lg` (3.5rem) with tight tracking (-2%) for big impact "Welcome" states. Use `headline-sm` (1.5rem) for section headers to provide a confident, clear roadmap.
*   **Body & Titles (Work Sans):** Chosen for its exceptional legibility in dense data environments. `body-md` (0.875rem) is the workhorse for scholar details. 
*   **Visual Hierarchy:** Always pair a `headline-md` in `on_surface` with a `label-md` in `on_surface_variant`. The contrast between the bold, geometric Jakarta and the utilitarian Work Sans creates an "editorial" look found in high-end journals.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a feeling, not a shadow effect.

*   **The Layering Principle:** Physicality is achieved by "stacking" tones. 
    *   *Level 0:* `background` (#f5fbf2)
    *   *Level 1:* `surface_container_low` (Large content areas)
    *   *Level 2:* `surface_container_lowest` (Interactive cards/actionable items)
*   **Ambient Shadows:** If a card must "float" (e.g., a critical notification), use a shadow with a blur of `32px`, an offset of `y: 8px`, and an opacity of `4%` using a tint of `on_surface`. Avoid pure black shadows at all costs.
*   **The "Ghost Border" Fallback:** For accessibility in form inputs, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards & Scholastic Modules
*   **Structure:** No borders. Use `md` (0.75rem) or `lg` (1rem) corner radius.
*   **Padding:** Generous `xl` (1.5rem) internal padding to allow data to breathe.
*   **Nesting:** Place `secondary_container` chips inside `surface_container_lowest` cards to highlight scholarship status (e.g., "Active" or "Distinction").

### Buttons
*   **Primary:** Solid `primary` background with `on_primary` text. Use `full` (pill-shaped) rounding for a modern, friendly feel.
*   **Secondary (The "Gold" Action):** Use `secondary_container` with `on_secondary_container` text for high-importance secondary actions like "Claim Reward."
*   **Ghost:** No background, `primary` text. Used for low-emphasis navigation.

### Inputs & Selection
*   **Text Fields:** Use `surface_container_highest` for the track. No bottom line. Use `md` rounding. When focused, transition to a `2px` "Ghost Border" of `primary`.
*   **Chips:** Use `tertiary_container` for academic tags (e.g., "STEM," "Year 1"). These should be small and use the `label-sm` typography.

### Specialized Portal Components
*   **The Achievement Tracker:** A horizontal progress bar using a gradient from `secondary` to `secondary_fixed`. 
*   **Metric Tiles:** Small, square `surface_container_lowest` cards displaying a single `headline-lg` number (e.g., GPA or Credits) with a `label-md` descriptor.

---

## 6. Do's and Don'ts

### Do
*   **Do** use intentional asymmetry. A dashboard with three cards of different widths feels more "designed" than three equal columns.
*   **Do** use `secondary_fixed_dim` (Gold) sparingly as a "star" color to highlight achievements.
*   **Do** prioritize vertical whitespace over horizontal dividers. If a list feels messy, add `16px` of space instead of a line.

### Don't
*   **Don't** use 100% black (#000000). Use `on_surface` (#171d18) for all high-contrast text.
*   **Don't** use sharp 90-degree corners. The system is "organic"; even the smallest components should have at least a `sm` (0.25rem) radius.
*   **Don't** overwhelm the user with the Primary Green. Use the `surface` tokens for 80% of the UI, saving the Green/Gold for the 20% that truly matters.