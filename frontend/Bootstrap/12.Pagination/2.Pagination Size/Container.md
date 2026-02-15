# Pagination Size in Bootstrap 5.3

## Overview

Bootstrap provides built-in sizing options for pagination components to accommodate different UI layouts and use cases. The `.pagination-lg` class creates larger pagination buttons, while `.pagination-sm` creates smaller variants. These size modifications scale both the padding and font size of pagination items.

---

## Basic Pagination Sizes

### Large Pagination (`.pagination-lg`)

Add the `.pagination-lg` class to the `.pagination` wrapper to create larger pagination controls, ideal for prominent navigation sections:

```html
<nav aria-label="Pagination with large size">
  <ul class="pagination pagination-lg">
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item active" aria-current="page">
      <a class="page-link" href="#">3</a>
    </li>
    <li class="page-item"><a class="page-link" href="#">4</a></li>
    <li class="page-item"><a class="page-link" href="#">5</a></li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  </ul>
</nav>
```

---

## Small Pagination (`.pagination-sm`)

Apply the `.pagination-sm` class for compact pagination suitable for tight layouts or secondary navigation:

```html
<nav aria-label="Pagination with small size">
  <ul class="pagination pagination-sm">
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item active" aria-current="page">
      <a class="page-link" href="#">3</a>
    </li>
    <li class="page-item"><a class="page-link" href="#">4</a></li>
    <li class="page-item"><a class="page-link" href="#">5</a></li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  </ul>
</nav>
```

---

## Responsive Sizing Pattern

Combine pagination sizes with responsive utilities to adapt based on viewport:

```html
<!-- Large on desktop, small on mobile -->
<nav aria-label="Responsive pagination">
  <ul class="pagination pagination-lg pagination-sm">
    <!-- Utility classes can override size on different breakpoints -->
    <li class="page-item">
      <a class="page-link" href="#">Previous</a>
    </li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item active" aria-current="page">
      <a class="page-link" href="#">3</a>
    </li>
    <li class="page-item"><a class="page-link" href="#">4</a></li>
    <li class="page-item">
      <a class="page-link" href="#">Next</a>
    </li>
  </ul>
</nav>

<style>
  /* Custom responsive sizing using CSS variables */
  @media (max-width: 768px) {
    .pagination.pagination-lg {
      --bs-pagination-padding-x: 0.5rem;
      --bs-pagination-padding-y: 0.375rem;
      --bs-pagination-font-size: 0.875rem;
    }
  }
</style>
```

---

## Size Variants Comparison Table

| Class | Padding | Font Size | Use Case |
|-------|---------|-----------|----------|
| (default) | 0.375rem 0.75rem | 1rem | Standard pagination |
| `.pagination-lg` | 0.75rem 1.5rem | 1.25rem | Main navigation, search results |
| `.pagination-sm` | 0.25rem 0.5rem | 0.875rem | Secondary nav, embedded lists |

---

## CSS Variables (Bootstrap 5.3+)

Customize pagination sizes using Bootstrap CSS variables for consistency:

```html
<style>
  /* Override default pagination variables */
  :root {
    /* Default size variables */
    --bs-pagination-padding-x: 0.75rem;
    --bs-pagination-padding-y: 0.375rem;
    --bs-pagination-font-size: 1rem;
    --bs-pagination-line-height: 1.25;
  }

  /* Large pagination variant */
  .pagination-lg {
    --bs-pagination-padding-x: 1.5rem;
    --bs-pagination-padding-y: 0.75rem;
    --bs-pagination-font-size: 1.25rem;
  }

  /* Small pagination variant */
  .pagination-sm {
    --bs-pagination-padding-x: 0.5rem;
    --bs-pagination-padding-y: 0.25rem;
    --bs-pagination-font-size: 0.875rem;
  }
</style>
```

---

## Combined Size and State Classes

Mix pagination sizes with other Bootstrap state and utility classes:

```html
<nav aria-label="Combined pagination sizing and states">
  <ul class="pagination pagination-lg">
    <!-- Disabled previous button -->
    <li class="page-item disabled">
      <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
        <span aria-hidden="true">&laquo;</span> Previous
      </a>
    </li>
    
    <!-- Page number links -->
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item active" aria-current="page">
      <a class="page-link" href="#">3</a>
    </li>
    <li class="page-item"><a class="page-link" href="#">4</a></li>
    
    <!-- Active next button -->
    <li class="page-item">
      <a class="page-link" href="#">
        Next <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  </ul>
</nav>
```

---

## Accessibility Features

### ARIA Labels and Descriptions

```html
<nav aria-label="Search results pagination">
  <ul class="pagination pagination-lg">
    <li class="page-item">
      <a class="page-link" href="?page=prev" aria-label="Go to previous page">
        &laquo;
      </a>
    </li>
    <li class="page-item"><a class="page-link" href="?page=1">1</a></li>
    <li class="page-item"><a class="page-link" href="?page=2">2</a></li>
    <li class="page-item active" aria-current="page">
      <a class="page-link" href="?page=3">3 <span class="visually-hidden">(current)</span></a>
    </li>
    <li class="page-item"><a class="page-link" href="?page=4">4</a></li>
    <li class="page-item">
      <a class="page-link" href="?page=next" aria-label="Go to next page">
        &raquo;
      </a>
    </li>
  </ul>
</nav>
```

### Keyboard Navigation

- Tab through pagination items
- Enter to activate links
- Space to trigger buttons
- Disabled items not keyboard-accessible (tabindex="-1")

---

## Dark Mode Support (Bootstrap 5.3+)

Pagination sizes automatically adapt to dark mode through Bootstrap's color-mode system:

```html
<div data-bs-theme="dark">
  <nav aria-label="Dark mode pagination">
    <ul class="pagination pagination-lg">
      <li class="page-item">
        <a class="page-link" href="#">Previous</a>
      </li>
      <li class="page-item"><a class="page-link" href="#">1</a></li>
      <li class="page-item"><a class="page-link" href="#">2</a></li>
      <li class="page-item active" aria-current="page">
        <a class="page-link" href="#">3</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#">Next</a>
      </li>
    </ul>
  </nav>
</div>

<style>
  /* Custom dark mode pagination styling */
  @media (prefers-color-scheme: dark) {
    .pagination-lg .page-link {
      background-color: #2d3748;
      border-color: #4a5568;
      color: #e2e8f0;
    }

    .pagination-lg .page-link:hover {
      background-color: #4a5568;
      border-color: #718096;
    }
  }
</style>
```

---

## Real-World Example: Product Listing Pagination

```html
<div class="container mt-5">
  <h2>Products</h2>
  
  <!-- Product grid here -->
  <div class="row g-4">
    <!-- Product cards... -->
  </div>
  
  <!-- Large pagination for main product navigation -->
  <nav aria-label="Product listing pagination" class="mt-4">
    <ul class="pagination pagination-lg justify-content-center">
      <li class="page-item">
        <a class="page-link" href="/products?page=1" aria-label="Go to first page">
          &laquo; First
        </a>
      </li>
      <li class="page-item">
        <a class="page-link" href="/products?page=1" aria-label="Go to previous page">
          Previous
        </a>
      </li>
      
      <li class="page-item"><a class="page-link" href="/products?page=1">1</a></li>
      <li class="page-item"><a class="page-link" href="/products?page=2">2</a></li>
      <li class="page-item active" aria-current="page">
        <a class="page-link" href="/products?page=3">3</a>
      </li>
      <li class="page-item"><a class="page-link" href="/products?page=4">4</a></li>
      <li class="page-item"><a class="page-link" href="/products?page=5">5</a></li>
      
      <li class="page-item">
        <a class="page-link" href="/products?page=2" aria-label="Go to next page">
          Next
        </a>
      </li>
      <li class="page-item">
        <a class="page-link" href="/products?page=50" aria-label="Go to last page">
          Last &raquo;
        </a>
      </li>
    </ul>
  </nav>
</div>
```

---

## Sass Customization

Override Bootstrap's Sass variables for custom pagination sizing:

```scss
// _custom-pagination.scss
$pagination-padding-y-lg: 0.75rem;
$pagination-padding-x-lg: 1.5rem;
$pagination-font-size-lg: 1.25rem;

$pagination-padding-y-sm: 0.25rem;
$pagination-padding-x-sm: 0.5rem;
$pagination-font-size-sm: 0.875rem;

// Import Bootstrap after defining custom variables
@import "bootstrap";
```

---

## Best Practices

1. **Choose the right size**: Use `.pagination-lg` for primary navigation, `.pagination-sm` for secondary or embedded pagination
2. **Maintain consistency**: Use same size throughout related pages/sections
3. **Semantic HTML**: Always wrap pagination in `<nav>` with descriptive `aria-label`
4. **Mark current page**: Use `aria-current="page"` on active item
5. **Label navigation buttons**: Add `aria-label` attributes to Previous/Next links
6. **Responsive consideration**: Consider reducing size on mobile devices
7. **Sufficient touch target**: Ensure pagination items are at least 44×44px on touch devices
8. **Color contrast**: Ensure text meets WCAG AA standards (4.5:1 ratio)
9. **Status indication**: Use visual+textual indicators for active page
10. **Logical ordering**: Arrange pagination items in clear numerical order

---

## Browser Compatibility

- All modern browsers: Chrome, Firefox, Safari, Edge
- Bootstrap 5.3+ required
- CSS Grid and Flexbox support needed
- CSS Custom Properties (variables) support required

---

## References

- [Bootstrap 5.3 Pagination Documentation](https://getbootstrap.com/docs/5.3/components/pagination/)
- [WAI-ARIA Authoring Practices - Pagination](https://www.w3.org/WAI/ARIA/apg/patterns/pagination/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Bootstrap CSS Variables](https://getbootstrap.com/docs/5.3/customize/css-variables/)
