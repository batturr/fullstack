# Hover Tables (Bootstrap 5.3+)

Overview
- The `.table-hover` modifier applies a hover state to table rows within the `<tbody>`, giving visual feedback as the pointer moves over rows. It's useful for interactive tables or when users need row-level focus on pointer hover.

Basic usage

```html
<table class="table table-hover">
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

Notes
- The hover effect is applied only to `<tbody>` rows by default. If you need hover on header rows, apply a custom rule or class to those rows.
- `.table-hover` is purely visual — do not rely on hover alone for discoverability or accessibility. Provide keyboard focus states and ARIA where appropriate.

Combining with other classes
- Works with `.table-striped`, `.table-bordered`, `.table-sm`, and `.table-borderless`:

```html
<table class="table table-hover table-striped table-sm">
  <!-- ... -->
</table>
```

Keyboard & accessibility considerations
- Hover does not equate to keyboard focus. Ensure row interactions are accessible by providing `:focus` styles for interactive row elements (links, buttons) and logical keyboard navigation.
- If rows are clickable, make the interactive element (e.g., a link or button) focusable and not the `<tr>` itself. Use `role="button"` sparingly and only when necessary, and manage `tabindex` properly.
- For screen reader users, ensure each row has sufficient semantic markers (row headers, `scope` attributes) and announcements for state changes.

Customizing hover style
- Override the hover background using CSS variables or a small rule:

```css
.table-hover tbody tr:hover {
  background-color: rgba(13,110,253,0.08); /* example */
}
```

Make sure your custom color meets contrast requirements.

Responsive usage
- Wrap the table in `.table-responsive` or breakpoint variants to avoid horizontal overflow on small screens. Hover styles still apply when users scroll horizontally.

Dark mode
- When using `.table-dark`, hover colors differ — test hover contrast in dark themes and override variables if necessary. Bootstrap variables can be adjusted in your theme customization.

Performance & large tables
- For very large tables, hover effects are low-overhead CSS; the main performance concerns are DOM size and rendering during scroll. Use virtualization or server-side pagination where needed.

Best practices
- Do not depend solely on hover for important functionality; always provide non-pointer alternatives.
- Use clear focus styles for keyboard users and ensure clickable controls inside rows are reachable via keyboard.
- Test hover contrast in both light and dark themes.

Examples from folder
- The provided `Example.html` demonstrates `.table table-hover` usage; this `Container.md` expands on accessibility, keyboard considerations, custom styling, and responsive behavior.

References
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
- WAI best practices — Keyboard accessibility: https://www.w3.org/WAI/
