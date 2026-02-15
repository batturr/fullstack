# Borderless Tables (Bootstrap 5.3+)

Overview
- Borderless tables remove the default cell borders to create a cleaner, lightweight look while preserving the tabular semantics of HTML tables. Use the `.table-borderless` modifier on the `<table>` element to remove borders from all cells.

Basic usage

```html
<table class="table table-borderless">
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
- Use borderless tables for minimalist UIs, summary rows, or when table data is placed inside cards or panels where borders are redundant.
- Avoid removing borders when gridlines are needed to visually separate dense tabular data — consider `.table-sm` with subtle borders instead.

Combining with other classes
- `.table-borderless` can be combined with other table modifiers:
  - `.table-striped` — keep zebra stripes while removing borders.
  - `.table-hover` — hover highlights without borders.
  - `.table-sm` — compact spacing and no borders.

Example: striped, borderless, hover

```html
<table class="table table-borderless table-striped table-hover">
  <!-- ... -->
</table>
```

Accessibility
- Borderless tables still require proper semantics: use `<caption>`, `<thead>`, `<tbody>`, and `scope` attributes on `<th>` elements for screen readers.
- Because borders may help sighted users parse rows, ensure sufficient row contrast and consider adding `aria-describedby` or visible separators (padding, background striping) when borders are removed.

Responsive behavior
- Wrap with `.table-responsive` (or breakpoint variants) if the table may overflow smaller screens:

```html
<div class="table-responsive">
  <table class="table table-borderless">
    <!-- ... -->
  </table>
</div>
```

Dark mode and themes
- Use `.table-dark` with `table-borderless` for dark-themed UIs:

```html
<table class="table table-dark table-borderless">
  <!-- ... -->
</table>
```

Customization & alternatives
- If you need selective borders, use utility classes like `border-0` on specific `<td>` or `<th>` elements, or apply `border-top` / `border-bottom` to particular rows.
- You can override CSS variables (Bootstrap 5.3) or custom CSS to tune border colors or remove only horizontal/vertical borders.

Best practices
- Preserve semantic HTML and `scope` attributes.
- Use background striping or increased row padding when removing borders to maintain row separation for readability.
- Test with reduced contrast settings and screen readers to ensure the table remains usable.

Examples from the folder
- The included `Example.html` demonstrates a basic `.table table-borderless` usage; this `Container.md` expands on variants, accessibility, responsive wrappers, and customization tips.

Further reading
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
- W3 ARIA tables guidance: https://www.w3.org/WAI/tutorials/tables/
