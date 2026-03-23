# Table Background Colors (Bootstrap 5.3+)

Overview
- Bootstrap provides contextual background classes for tables, rows, and cells to indicate state or emphasis using `table-*` contextual classes and general `bg-*` utilities.

Contextual `table-*` classes
- Apply to `<tr>` or `<td>` to set the background for that row or cell: `table-primary`, `table-secondary`, `table-success`, `table-danger`, `table-warning`, `table-info`, `table-light`, `table-dark`, and `table-active`.

Example — row backgrounds:

```html
<table class="table">
  <tbody>
    <tr class="table-primary">
      <td>Primary row</td>
      <td>...</td>
    </tr>
    <tr class="table-success">
      <td>Success row</td>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

Using `bg-*` utilities
- Use `bg-*` utilities on cells or rows for consistent utility-based backgrounds (e.g., `bg-primary text-white`) when you need to pair with utility text colors.

```html
<tr>
  <td class="bg-warning">Warning cell</td>
  <td class="bg-warning text-dark">...</td>
</tr>
```

Header backgrounds
- For header rows, use `.table-light` / `.table-dark` on `<thead>` or apply `bg-*` on `<th>`.

```html
<thead class="table-light">
  <tr>
    <th>Header</th>
  </tr>
</thead>
```

Combining with other table classes
- Works with `.table-striped`, `.table-bordered`, `.table-hover`, and `.table-sm`. Be mindful of contrast when combining striping and contextual classes.

Accessibility & contrast
- Ensure sufficient contrast between background and text. When using `table-*` classes, pair with appropriate text color utilities (e.g., `text-white` on dark backgrounds).
- Don’t rely on color alone to convey important information—add icons or labels for clarity.
- When customizing theme colors, verify WCAG contrast levels.

Selective application
- Apply classes to individual `<td>` cells for fine-grained emphasis instead of whole-row coloring.
- To remove color from specific borders or cells, use border utilities (e.g., `border-0`) or custom CSS.

Dark mode and theming
- Bootstrap 5.3 uses CSS variables for colors—override theme variables (or use Sass maps) to ensure contextual classes adapt to dark themes. Test `.table-dark` along with contextual classes.

Custom colors
- Prefer customizing Bootstrap’s Sass variables for consistent results. If you must add custom colors, use a scoped CSS class and ensure accessibility.

Performance & large tables
- Background utilities are CSS-only and low cost. For very large tables, DOM size and repaint on hover/scroll are the main concerns.

Examples from folder
- The current `Example.html` demonstrates `table-*` row classes for many contextual colors. This `Container.md` expands on usage, pairing with `bg-*`, header backgrounds, accessibility, and theming.

Further reading
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
- Bootstrap utilities — Backgrounds: https://getbootstrap.com/docs/5.3/utilities/colors/
- WCAG contrast: https://www.w3.org/WAI/standards-guidelines/wcag/
