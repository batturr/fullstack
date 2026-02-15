# Basic Pagination — Bootstrap 5.3+

Overview
- Pagination is a list of page links used for navigating through datasets or multi-page content. Bootstrap provides semantic `.pagination`, `.page-item`, and `.page-link` classes for flexible, accessible pagination components.

Basic markup

```html
<ul class="pagination">
  <li class="page-item"><a class="page-link" href="#">Previous</a></li>
  <li class="page-item"><a class="page-link" href="#">1</a></li>
  <li class="page-item active"><a class="page-link" href="#">2</a></li>
  <li class="page-item"><a class="page-link" href="#">3</a></li>
  <li class="page-item"><a class="page-link" href="#">Next</a></li>
</ul>
```

Structure
- `.pagination` — wrapper list with flex layout and spacing.
- `.page-item` — individual page item (list item).
- `.page-link` — clickable anchor or button for navigation.
- `.active` — class on `.page-item` to indicate the current page.

Active page
- Add `.active` to the `.page-item` containing the current page number:

```html
<li class="page-item active"><a class="page-link" href="#">2</a></li>
```

Disabled links
- Add `.disabled` to `.page-item` for non-clickable pages (e.g., "Previous" on the first page):

```html
<li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
```

Using buttons instead of anchors
- Replace `<a>` with `<button>` for form submissions or client-side handlers:

```html
<li class="page-item">
  <button class="page-link" type="button">2</button>
</li>
```

Previous/Next navigation
- Use chevrons or arrows in page links for navigation:

```html
<ul class="pagination">
  <li class="page-item"><a class="page-link" href="#">&laquo; Previous</a></li>
  <!-- page numbers -->
  <li class="page-item"><a class="page-link" href="#">Next &raquo;</a></li>
</ul>
```

Sizing
- Use `.pagination-lg` or `.pagination-sm` on the `.pagination` container for larger or smaller variants:

```html
<ul class="pagination pagination-lg">
  <!-- items -->
</ul>

<ul class="pagination pagination-sm">
  <!-- items -->
</ul>
```

Alignment
- Use flexbox utilities to align pagination:

```html
<ul class="pagination justify-content-center">
  <!-- items -->
</ul>

<ul class="pagination justify-content-end">
  <!-- items -->
</ul>
```

Accessibility
- Always use semantic `<ul>`, `<li>`, and `<a>` elements for proper screen reader support.
- Add `aria-current="page"` to the current page link:

```html
<a class="page-link" href="#" aria-current="page">2</a>
```

- Use `.visually-hidden` to add descriptive text if page numbers alone are ambiguous:

```html
<a class="page-link" href="#">
  1 <span class="visually-hidden">(current)</span>
</a>
```

- For disabled pages, add `disabled` attribute to links or use `aria-disabled="true"`.

Keyboard navigation
- Ensure all page links are keyboard-accessible (focusable). Test Tab and Enter key navigation.

Label context
- Consider wrapping pagination in a `<nav>` with `aria-label`:

```html
<nav aria-label="Page navigation">
  <ul class="pagination">
    <!-- items -->
  </ul>
</nav>
```

Styling & customization
- Customize pagination colors, spacing, and borders via Sass variables or CSS variables. The default styling uses primary color for active pages.

Common patterns
- **Product listings**: "Page 1 of 5", numbered pages, and "Next" button.
- **Search results**: previous/next with page info.
- **Blog archives**: month/year-based pagination.

Best practices
- Keep pagination concise—display 5-10 page numbers unless space allows.
- Always indicate the current page clearly.
- Disable "Previous" on the first page and "Next" on the last page.
- Consider infinite scroll or "Load More" for mobile-friendly alternatives.

Examples from folder
- The provided `Example.html` shows a basic pagination list with previous/next arrows, numbered pages, and an active state on page 2; this `Container.md` expands on sizing, alignment, accessibility (ARIA), keyboard navigation, and best practices.

Further reading
- Bootstrap docs — Pagination: https://getbootstrap.com/docs/5.3/components/pagination/
- WAI ARIA Authoring Practices — Pagination: https://www.w3.org/WAI/ARIA/apg/
