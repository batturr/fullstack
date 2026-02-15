# Small Tables (`.table-sm`) — Bootstrap 5.3+

Overview
- Use `.table-sm` to reduce cell padding and create a more compact table. Useful for dense data displays, admin panels, or listing where vertical space is limited.

Basic usage

```html
<table class="table table-sm">
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

When to use
- Compact lists, dense admin tables, or UI patterns where reducing vertical rhythm improves scanability.
- Avoid for tables where readability suffers — if cells contain multiline content, prefer the default spacing.

Combine with other modifiers
- `.table-sm` works with `.table-striped`, `.table-hover`, `.table-bordered`, and `.table-borderless`.

```html
<table class="table table-sm table-striped table-hover">
  <!-- ... -->
</table>
```

Responsive considerations
- `.table-sm` affects spacing but not layout; still wrap wide tables with `.table-responsive` variants to handle horizontal overflow on small screens.

Accessibility
- Compact spacing can reduce target sizes for touch users. Ensure interactive controls inside table cells are large enough and have sufficient spacing.
- Maintain `scope` attributes on header cells and use semantic markup (`<caption>`, `<thead>`, `<tbody>`, `<tfoot>`).

Dark mode & contrast
- Use `.table-dark` or `table-*` contextual classes with `.table-sm` as needed. Ensure contrast remains sufficient when reducing padding and when using small text.

Performance & large datasets
- `.table-sm` is CSS-only and low-cost. For very large tables, the main costs are DOM size and rendering; consider virtualization or pagination.

Styling tips
- To further compress horizontal spacing, combine `.table-sm` with smaller font utilities (e.g., `fs-6`) but test readability.
- If only a few columns need compactness, apply `p-1` / `px-2` utilities to specific cells instead of the global `.table-sm`.

Examples from the folder
- The included `Example.html` shows side-by-side normal and `.table-sm` tables for comparison. This `Container.md` documents usage patterns, accessibility notes, and combinations with other table modifiers.

References
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
