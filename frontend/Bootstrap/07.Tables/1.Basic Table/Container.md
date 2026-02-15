# Basic Tables (Bootstrap 5.3+)

Overview
-	Bootstrap provides simple, flexible table styles built on top of native HTML <table> markup. Use the base `.table` class to get a clean default table and enhance it with additional utility classes and responsive wrappers.

CDN (example)
- Latest stable CSS (5.3.x):

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
```

Basic usage
- Wrap your tabular data with the `.table` class:

```html
<table class="table">
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

Common table classes (reference)
- `.table` — base class for styling tables.
- `.table-striped` — zebra-striping for rows within the `<tbody>`.
- `.table-bordered` — adds borders on all sides of the table and cells.
- `.table-borderless` — removes borders.
- `.table-hover` — enable a hover state on table rows within `<tbody>`.
- `.table-sm` — compact table with smaller paddings.
- `.table-active` — applies to a row or cell to indicate active state.
- `.table-dark` — invert colors for dark backgrounds (useful for dark themes).
- `.caption-top` — place `<caption>` at the top of the table.

Responsive tables
- Wrap the `<table>` in a `.table-responsive-{breakpoint}` container to enable horizontal scrolling on smaller viewports.
- Available wrappers: `.table-responsive` (always), `.table-responsive-sm`, `.table-responsive-md`, `.table-responsive-lg`, `.table-responsive-xl`, `.table-responsive-xxl`.

Example:

```html
<div class="table-responsive">
  <table class="table">
    <!-- ... -->
  </table>
</div>
```

Accessibility
- Use proper semantics: `<thead>`, `<tbody>`, `<tfoot>`, and `<caption>`.
- Add `scope="col"` to header `<th>` cells and `scope="row"` to row header `<th>` cells when appropriate.
- For complex tables, include `aria-describedby` on the table and reference explanatory content.
- Ensure color is not the only means of conveying information (pair color with icons or text labels).

Examples (variants)

Striped rows:
```html
<table class="table table-striped">
  <!-- ... -->
</table>
```

Bordered:
```html
<table class="table table-bordered">
  <!-- ... -->
</table>
```

Hover rows and small:
```html
<table class="table table-hover table-sm">
  <!-- ... -->
</table>
```

Dark table:
```html
<table class="table table-dark">
  <!-- ... -->
</table>
```

Contextual classes
- Bootstrap provides contextual background classes for table rows and cells: `table-primary`, `table-secondary`, `table-success`, `table-danger`, `table-warning`, `table-info`, `table-light`, `table-dark`.

```html
<tr class="table-success">
  <td>...</td>
</tr>
```

Table head & footer
- Use `<thead class="table-light">` or `<thead class="table-dark">` to color the header.
- Use `<tfoot>` for summaries.

Captions
- Use the `<caption>` element for short descriptions. Combine with `.caption-top` to move it above the table.

Sizing & alignment
- Vertical alignment can be controlled with utility classes like `.align-top`, `.align-middle`, `.align-bottom` on `<td>` or `<th>`.
- Use text alignment utilities like `.text-center` and `.text-end` on cells.

Sorting, filtering, and large datasets
- Bootstrap is CSS only — for interactive features (sorting, filtering, pagination) integrate a JS library such as `DataTables`, `List.js`, or write custom scripts.
- For very large tables, prefer server-side pagination or virtualized rendering.

Dark mode considerations
- Use `.table-dark` for dark-themed tables or rely on your theme variables.
- Bootstrap 5.3 supports CSS variables — ensure your theme adapts `--bs-table-*` variables if you provide custom colors.

Styling tips & CSS variables
- Bootstrap exposes several variables you can override to fine-tune table appearance. For example, inspect `--bs-table-bg` and related variables in Bootstrap source if customizing.

Best practices
- Keep tables semantic and accessible.
- Use `.table-responsive-*` wrappers when tables may overflow on small screens.
- Avoid horizontal scrolling if you can reformat data (stacked cards, key/value lists) for small screens.
- Prefer `scope` on `<th>` for screen reader clarity.

Examples taken from the folder
- The existing `Example.html` demonstrates a simple `.table` usage with header and body rows. The example is preserved; this `Container.md` expands on variants, accessibility, responsiveness and best practices.

Further reading & resources
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
- Accessible Tables: https://www.w3.org/WAI/tutorials/tables/ 
- DataTables (for sorting/paging): https://datatables.net/

Summary
- Use `.table` for base styling, add modifier classes for appearance and `.table-responsive-*` wrappers for small screens. For interactive features, combine with JS libraries while keeping accessibility in mind.
