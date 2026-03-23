# Pagination Alignment in Bootstrap 5.3

## Overview

Bootstrap pagination alignment controls the horizontal placement of pagination within its container. Use Flexbox utility classes to align pagination to the left (default), center, or right.

---

## Basic Alignments

### Left (Default)

By default, pagination is left-aligned. No extra utility is required:

```html
<nav aria-label="Page navigation">
  <ul class="pagination">
    <li class="page-item"><a class="page-link" href="#" aria-label="Previous">&laquo;</a></li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item active" aria-current="page"><a class="page-link" href="#">2 <span class="visually-hidden">(current)</span></a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item"><a class="page-link" href="#" aria-label="Next">&raquo;</a></li>
  </ul>
</nav>
```

### Center (`.justify-content-center`)

Center pagination using the `.justify-content-center` utility on the `.pagination` list or its parent flex container:

```html
<nav aria-label="Centered pagination">
  <ul class="pagination justify-content-center">
    <li class="page-item"><a class="page-link" href="#">Previous</a></li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item active" aria-current="page"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item"><a class="page-link" href="#">Next</a></li>
  </ul>
</nav>
```

### Right (`.justify-content-end`)

Right-align pagination using `.justify-content-end`:

```html
<nav aria-label="Right aligned pagination">
  <ul class="pagination justify-content-end">
    <li class="page-item"><a class="page-link" href="#">Previous</a></li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item active" aria-current="page"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item"><a class="page-link" href="#">Next</a></li>
  </ul>
</nav>
```

---

## Responsive Alignment

Use breakpoint-specific justify utilities to change alignment by viewport size. For example, center on small screens and align end on larger screens:

```html
<nav aria-label="Responsive alignment">
  <ul class="pagination justify-content-center justify-content-md-end">
    <li class="page-item"><a class="page-link" href="#">Prev</a></li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item active" aria-current="page"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item"><a class="page-link" href="#">Next</a></li>
  </ul>
</nav>
```

Utility classes available: `.justify-content-start|center|end|between|around|evenly` (with responsive variants like `.justify-content-sm-center`).

---

## Alignment Inside Layouts

When using grid or other layouts, ensure the pagination is placed inside a flex container or a column where justify utilities apply. Examples:

```html
<div class="row">
  <div class="col-12 d-flex justify-content-end">
    <nav aria-label="Grid-aligned pagination">
      <ul class="pagination mb-0">
        <li class="page-item"><a class="page-link" href="#">Prev</a></li>
        <li class="page-item active" aria-current="page"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
      </ul>
    </nav>
  </div>
</div>
```

---

## Combining Alignment with Size and Spacing

Combine alignment with size classes (`.pagination-lg`, `.pagination-sm`) and spacing utilities (e.g., `mb-3`, `mt-4`) for consistent layout:

```html
<nav aria-label="Combined pagination example">
  <ul class="pagination pagination-lg justify-content-center mb-3">
    <li class="page-item"><a class="page-link" href="#">Prev</a></li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item active" aria-current="page"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">Next</a></li>
  </ul>
</nav>
```

---

## Accessibility Notes

- Always wrap pagination in `<nav>` with an appropriate `aria-label` (e.g., "Search results pagination").
- Mark the active page with `aria-current="page"` and include a visually-hidden label for screen readers.
- Disabled controls should include `aria-disabled="true"` and `tabindex="-1"` to avoid keyboard focus.

```html
<li class="page-item disabled">
  <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
</li>
```

---

## Dark Mode and Theming

Alignment is purely layout-related and works unchanged in dark mode. Ensure color and contrast of pagination links meet WCAG when themed.

---

## Best Practices

- Use semantics: always use `<nav>` and descriptive `aria-label`s.
- Prefer utility classes over custom CSS for alignment to keep layout predictable.
- Test breakpoint-specific alignment to ensure pagination doesn't overlap content on small screens.
- Keep touch targets large enough for mobile (minimum ~44×44px).

---

## References

- [Bootstrap 5.3 Pagination Documentation](https://getbootstrap.com/docs/5.3/components/pagination/)
- [Bootstrap Flex Utilities](https://getbootstrap.com/docs/5.3/utilities/flex/)
- [WAI-ARIA Pagination Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/pagination/)
