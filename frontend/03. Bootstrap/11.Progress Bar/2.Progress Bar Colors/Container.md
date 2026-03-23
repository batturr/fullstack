# Progress Bar Colors — Bootstrap 5.3+

Overview
- Progress bars support semantic color variants using `.bg-*` utilities to indicate different states or meanings. Combine colors with `.progress-bar-striped` and `.progress-bar-animated` for enhanced visual feedback.

Color variants

```html
<!-- Default (primary) -->
<div class="progress">
  <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- Success (green) -->
<div class="progress">
  <div class="progress-bar bg-success" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- Info (light blue) -->
<div class="progress">
  <div class="progress-bar bg-info" role="progressbar" style="width: 50%;" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- Warning (orange) -->
<div class="progress">
  <div class="progress-bar bg-warning" role="progressbar" style="width: 75%;" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- Danger (red) -->
<div class="progress">
  <div class="progress-bar bg-danger" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- Secondary (grey) -->
<div class="progress">
  <div class="progress-bar bg-secondary" role="progressbar" style="width: 50%;" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- Light (requires dark text and border) -->
<div class="progress border">
  <div class="progress-bar bg-light text-dark" role="progressbar" style="width: 60%;" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- Dark -->
<div class="progress">
  <div class="progress-bar bg-dark" role="progressbar" style="width: 80%;" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
</div>
```

Semantic use
- **Default/Primary**: general progress, loading states.
- **Success**: completed tasks, positive outcomes, or successful operations.
- **Info**: informational status, neutral progress.
- **Warning**: caution states, slow progress, or pending operations.
- **Danger**: errors, critical states, or failed operations.
- **Secondary**: neutral or secondary indicators.
- **Light**: subtle indicators (requires `.text-dark` for contrast).
- **Dark**: emphasis or dark-themed progress bars.

Striped progress bars
- Add `.progress-bar-striped` for a diagonal stripe pattern:

```html
<div class="progress">
  <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: 75%;" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
</div>
```

Animated striped bars
- Combine `.progress-bar-striped` and `.progress-bar-animated` for a moving stripe effect (indicates ongoing activity):

```html
<div class="progress">
  <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: 50%;" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">Loading...</div>
</div>
```

Contrast & accessibility
- Verify color contrast meets WCAG standards, especially for light backgrounds (e.g., `bg-light` with `.text-dark`).
- Don't rely solely on color to convey status. Pair with labels, icons, or surrounding text.
- Always include ARIA attributes (`role`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).

Stacked bars with multiple colors
- Combine multiple bars and colors to show different components or statuses:

```html
<div class="progress">
  <div class="progress-bar bg-success" role="progressbar" style="width: 35%;" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100">Done</div>
  <div class="progress-bar bg-warning" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">In Progress</div>
  <div class="progress-bar bg-danger" role="progressbar" style="width: 15%;" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">Failed</div>
</div>
```

Customizing bar colors
- Use Sass variables or CSS variables to customize the color palette. Bootstrap exposes theme tokens like `--bs-success`, `--bs-warning`, etc.

Dark mode
- Progress bar colors adapt to light/dark themes when using standard utility classes. Test contrast in both modes; adjust theme variables if needed.

Text inside colored bars
- Keep text readable on colored backgrounds; ensure foreground/background contrast. Default text color in progress bars is typically inherited or white.

Best practices
- Use color semantically—don't use red just for visual emphasis.
- For long-running tasks, consider pairing animated bars with status text or time estimates.
- Test striped and animated bars for performance on low-end devices.

Examples from folder
- The provided `Example.html` shows all eight color variants with different widths, plus striped and animated examples; this `Container.md` expands on semantics, accessibility, stacking patterns, and customization.

Further reading
- Bootstrap docs — Progress: https://getbootstrap.com/docs/5.3/components/progress/
- WCAG color contrast: https://www.w3.org/WAI/standards-guidelines/wcag/
