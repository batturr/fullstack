# Striped Tables (Bootstrap 5.3+)

Overview
- Striped tables apply a zebra-striping effect to rows within the `<tbody>` using the `.table-striped` modifier. This improves row readability, especially for wide or dense datasets.

Basic usage

```html
<table class="table table-striped">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
      <th scope="col">Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
  </tbody>
</table>
```

Striped placement
- By default, striping applies to rows inside `<tbody>` only. If you need header striping, apply classes on `<thead>` or use custom CSS.

Combine with other modifiers
- Works with `.table-bordered`, `.table-hover`, `.table-sm`, and `.table-borderless`:

```html
<table class="table table-striped table-hover table-sm">
  <!-- ... -->
</table>
```

Accessibility
- Ensure the stripe color contrast meets WCAG AA to remain visible to users with low vision.
- Don’t rely on stripe color alone to convey meaning—pair with labels, icons, or semantic markup if a row indicates status.
- Use proper semantics (`<thead>`, `<tbody>`, `scope` on `<th>`) for screen reader clarity.

Responsive behavior
- Use `.table-responsive` wrappers to avoid clipped content on small screens. Stripes remain effective when horizontally scrolled.

Dark mode
- In dark themes, use `.table-dark` together with `table-striped` or customize stripe colors to ensure contrast. Bootstrap’s variables allow tuning: inspect `--bs-table-accent-bg` and related variables in Bootstrap source.

Custom striping
- To adjust stripe color, override CSS variables or add a custom rule targeting `.table-striped tbody tr:nth-of-type(odd) { background-color: ... }` while preserving accessible contrast.

Best practices
- Keep stripes subtle—high-contrast stripes can be visually noisy.
- Test with high-density data to ensure stripes help readability rather than distract.
- Avoid using stripes as the sole indicator for interactive states (use `:hover`, focus outlines, or icons in addition).

Examples from folder
- The existing `Example.html` shows `.table table-striped` usage; this `Container.md` expands on accessibility, combinations, responsive wrappers, dark mode, and customization.

Further reading
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
- WCAG contrast guidelines: https://www.w3.org/WAI/standards-guidelines/wcag/
