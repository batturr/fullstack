# Bordered Tables (Bootstrap 5.3+)

Overview
- Bordered tables add borders on all sides of the table and cells, improving separation for dense data. Use the `.table-bordered` modifier on the `<table>` element.

Basic usage

```html
<table class="table table-bordered">
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

Selective borders
- For selective control, use border utilities on specific cells or rows, e.g. `border-0` to remove borders, or `border-top` / `border-bottom` to add only horizontal separators.

```html
<tr>
  <td class="border-top-0 border-bottom">...</td>
</tr>
```

Combining with other table modifiers
- Works with `.table-striped`, `.table-hover`, `.table-sm`, and contextual classes.

Accessibility
- Use proper semantics: `<caption>`, `<thead>`, `<tbody>`, and `<tfoot>` as needed.
- Add `scope="col"` and `scope="row"` for header cells.
- Ensure contrast and focus styles remain usable — borders help sighted users parse rows but keyboard and screen reader users rely on semantics.

Responsive behavior
- Wrap in `.table-responsive` or breakpoint variants to enable horizontal scrolling on smaller viewports.

```html
<div class="table-responsive">
  <table class="table table-bordered">
    <!-- ... -->
  </table>
</div>
```

Dark mode & theming
- Combine with `.table-dark` if you need a dark variant with borders. When customizing, check Bootstrap CSS variables (5.3) such as `--bs-table-border-color` to match your theme.

Contextual backgrounds & emphasis
- Use contextual classes like `table-success` or `table-danger` on rows or cells to show status while keeping borders.

Performance & large datasets
- For interactivity (sorting, paging, filtering) integrate a JS library such as DataTables. For very large tables use server-side paging or virtualization.

Best practices
- Prefer semantic headers and `scope` attributes.
- Use responsive wrappers for narrow screens.
- Use selective border utilities when you need partial borders rather than the global `.table-bordered`.

Examples from folder
- The existing `Example.html` shows a simple `.table table-bordered` usage; this `Container.md` adds usage scenarios, accessibility notes, and customization tips aligned with Bootstrap 5.3+.

References
- Bootstrap Tables docs: https://getbootstrap.com/docs/5.3/content/tables/
- WAI Accessible Tables: https://www.w3.org/WAI/tutorials/tables/
