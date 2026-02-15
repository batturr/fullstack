# Table Header Background Colors (Bootstrap 5.3+)

Overview
- Bootstrap provides simple utilities and contextual table classes to style table headers (`<thead>`) for improved emphasis and contrast. Use `.table-light` or `.table-dark` on `<thead>` or apply `bg-*` utilities to `<th>` elements.

Basic usage

```html
<table class="table">
  <thead class="table-light">
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Mark</td>
      <td>Otto</td>
    </tr>
  </tbody>
</table>

<table class="table">
  <thead class="table-dark">
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
    </tr>
  </thead>
</table>
```

Using `bg-*` utilities for headers
- For finer control, use general background utilities on header cells: `bg-primary`, `bg-secondary`, etc., combined with text color utilities like `text-white`.

```html
<thead>
  <tr>
    <th class="bg-primary text-white">Name</th>
    <th class="bg-warning text-dark">Status</th>
  </tr>
</thead>
```

When to prefer `table-*` vs `bg-*`
- Use `.table-light` / `.table-dark` when you want the built-in header look that pairs with Bootstrap table styles.
- Use `bg-*` when you need a specific brand color or when you need to color only individual `<th>` cells.

Accessibility & contrast
- Ensure header foreground and background meet WCAG contrast requirements. Dark headers often require `text-white` for sufficient contrast.
- Avoid using color alone to convey meaning; include visible labels or icons.
- Use `scope="col"` on `<th>` elements to aid screen readers.

Combining with other table features
- Header classes work with `.table-striped`, `.table-bordered`, `.table-hover`, and responsive wrappers. When using `.table-striped`, header striping is independent and requires its own styles.

Dark mode and theming
- For dark themes, prefer `.table-dark` for headers or adapt Bootstrap’s CSS variables (5.3) to ensure consistent color tokens across your site.
- When creating custom themes, override relevant Sass variables or CSS variables like `--bs-table-accent-bg`.

Examples and patterns
- Full-width header: apply `.table-light` on `<thead>`.
- Mixed headers: use `bg-*` on individual `<th>` cells for multi-colored headers (e.g., action columns).
- Sticky header: combine with CSS `position: sticky; top: 0;` on `th` for long tables inside `.table-responsive`.

```css
.table-responsive thead th {
  position: sticky;
  top: 0;
  z-index: 2; /* ensure header sits above scrollable rows */
}
```

Best practices
- Keep header colors subtle and consistent with your design system.
- Verify contrast in both light and dark themes.
- Use header backgrounds to convey grouping or emphasis, not complex semantics.

Folder examples
- The repository `Example.html` shows `thead` with `.table-light` and `.table-dark`. This `Container.md` expands on alternatives using `bg-*`, accessibility, sticky headers, and theming guidance aligned with Bootstrap 5.3+.

Resources
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
- Bootstrap utilities — Colors: https://getbootstrap.com/docs/5.3/utilities/colors/
- WCAG contrast guidelines: https://www.w3.org/WAI/standards-guidelines/wcag/
