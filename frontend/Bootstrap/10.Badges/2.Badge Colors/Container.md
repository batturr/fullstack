# Badge Colors — Bootstrap 5.3+

Overview
- Badges use background color utilities (`.bg-primary`, `.bg-secondary`, etc.) to convey meaning and visual hierarchy. Each color maps to a semantic context: primary, secondary, success, danger, warning, info, light, and dark.

Available color variants

```html
<span class="badge bg-primary">primary</span>
<span class="badge bg-secondary">secondary</span>
<span class="badge bg-success">success</span>
<span class="badge bg-danger">danger</span>
<span class="badge bg-warning">warning</span>
<span class="badge bg-info">info</span>
<span class="badge bg-light">light</span>
<span class="badge bg-dark">dark</span>
```

Semantic use
- **Primary**: main actions, highlights, or feature badges.
- **Secondary**: neutral or supporting information.
- **Success**: positive outcomes, completion, or approval.
- **Danger**: errors, warnings, or critical status.
- **Warning**: caution, pending, or attention-needed states.
- **Info**: informational or neutral context.
- **Light**: subtle badges (pair with `.text-dark` for contrast).
- **Dark**: emphasis or dark-themed badges.

Contrast & accessibility
- Light backgrounds (`.bg-light`) require `.text-dark` for sufficient contrast:

```html
<span class="badge bg-light text-dark">Light with dark text</span>
```

- Dark backgrounds (`.bg-dark`, `.bg-primary`, etc.) have default light text automatically.
- Verify contrast meets WCAG AA when customizing or using theme variants.

Pairing with intent
- Don't rely on color alone to convey meaning. Combine with icons, labels, or surrounding text:

```html
<span class="badge bg-success">✓ Approved</span>
<span class="badge bg-danger">✗ Rejected</span>
<span class="badge bg-warning">⚠ Pending</span>
```

Customizing badge colors
- Override Sass variables or CSS variables in your theme to adjust badge colors. Bootstrap exposes color tokens for theming (e.g., `--bs-primary`, `--bs-success`).

Dark mode considerations
- Badges adapt to light/dark themes using utility backgrounds. If using custom colors, ensure the theme provides appropriate dark-mode variants.

Combining color variants with other modifiers
- Badges with color utilities work with other classes like `rounded-pill`, spacing utilities, and text-color utilities:

```html
<span class="badge rounded-pill bg-success">Complete</span>
<span class="badge bg-warning ms-2">New</span>
```

Best practices
- Use color semantically—don't use red just for visual emphasis if the content isn't actually an error.
- Test color combinations in both light and dark modes.
- Provide text or icons alongside colors to support users with color blindness.

Examples from folder
- The provided `Example.html` shows all eight badge color variants in headings; this `Container.md` expands on semantic usage, accessibility, pairing strategies, and theming.

Further reading
- Bootstrap docs — Badges: https://getbootstrap.com/docs/5.3/components/badge/
- WCAG contrast guidelines: https://www.w3.org/WAI/standards-guidelines/wcag/
