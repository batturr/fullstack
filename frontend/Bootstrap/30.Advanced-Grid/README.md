# Advanced Grid Techniques in Bootstrap 5

## Overview
Bootstrap 5's grid system is powerful and flexible. This guide covers advanced techniques beyond the basics.

## Grid Fundamentals Review

```html
<div class="container">
  <div class="row">
    <div class="col-md-6">Column 1</div>
    <div class="col-md-6">Column 2</div>
  </div>
</div>
```

## Advanced Techniques

### 1. Nesting Grids

Nest rows within columns for complex layouts:

```html
<div class="container">
  <div class="row">
    <div class="col-md-8">
      <h3>Main Content</h3>
      <div class="row">
        <div class="col-md-6">Nested 1</div>
        <div class="col-md-6">Nested 2</div>
      </div>
    </div>
    <div class="col-md-4">
      <h3>Sidebar</h3>
    </div>
  </div>
</div>
```

### 2. Column Wrapping

Columns wrap automatically when they exceed 12:

```html
<div class="row">
  <div class="col-9">col-9</div>
  <div class="col-4">col-4 (wraps to next line)</div>
  <div class="col-6">col-6 (on new line)</div>
</div>
```

### 3. Column Breaks

Force columns to break to a new line:

```html
<div class="row">
  <div class="col-6">Column 1</div>
  <div class="col-6">Column 2</div>
  
  <!-- Break -->
  <div class="w-100"></div>
  
  <div class="col-6">Column 3</div>
  <div class="col-6">Column 4</div>
</div>
```

### 4. Order Classes

Reorder columns with `.order-*` classes:

```html
<div class="row">
  <div class="col order-3">First in DOM, appears third</div>
  <div class="col order-1">Second in DOM, appears first</div>
  <div class="col order-2">Third in DOM, appears second</div>
</div>

<!-- Responsive ordering -->
<div class="row">
  <div class="col-12 col-md-6 order-2 order-md-1">
    Mobile: Second, Desktop: First
  </div>
  <div class="col-12 col-md-6 order-1 order-md-2">
    Mobile: First, Desktop: Second
  </div>
</div>
```

### 5. Offset Classes

Offset columns to create spacing:

```html
<!-- Offset by 4 columns -->
<div class="row">
  <div class="col-md-4">Column</div>
  <div class="col-md-4 offset-md-4">Offset column</div>
</div>

<!-- Responsive offsets -->
<div class="row">
  <div class="col-md-6 offset-md-3 col-lg-4 offset-lg-4">
    Centered column with different widths
  </div>
</div>

<!-- Reset offset -->
<div class="row">
  <div class="col-sm-5 offset-sm-2 col-md-6 offset-md-0">
    Offset on small, not on medium+
  </div>
</div>
```

### 6. Gutters (Spacing)

Control spacing between columns:

```html
<!-- Default gutters -->
<div class="row">
  <div class="col">Column</div>
  <div class="col">Column</div>
</div>

<!-- No gutters -->
<div class="row g-0">
  <div class="col">No gutter</div>
  <div class="col">No gutter</div>
</div>

<!-- Custom gutters -->
<div class="row g-2">Small gutter</div>
<div class="row g-3">Medium gutter</div>
<div class="row g-5">Large gutter</div>

<!-- Horizontal and vertical gutters separately -->
<div class="row gx-3 gy-4">
  <div class="col-6">Column</div>
  <div class="col-6">Column</div>
  <div class="col-6">Column</div>
  <div class="col-6">Column</div>
</div>

<!-- Responsive gutters -->
<div class="row g-2 g-md-4 g-lg-5">
  <div class="col">Responsive gutter</div>
</div>
```

### 7. Row Columns

Set equal-width columns quickly:

```html
<!-- 2 columns per row -->
<div class="row row-cols-2">
  <div class="col">Column</div>
  <div class="col">Column</div>
  <div class="col">Column</div>
  <div class="col">Column</div>
</div>

<!-- Responsive row columns -->
<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
  <div class="col">Column</div>
  <div class="col">Column</div>
  <div class="col">Column</div>
  <div class="col">Column</div>
  <div class="col">Column</div>
  <div class="col">Column</div>
</div>

<!-- Auto columns -->
<div class="row row-cols-auto">
  <div class="col">Auto width 1</div>
  <div class="col">Auto width 2</div>
  <div class="col">Auto width 3</div>
</div>
```

### 8. Vertical Alignment

Align columns vertically:

```html
<!-- Align entire row -->
<div class="row align-items-start" style="height: 200px;">
  <div class="col">Top</div>
</div>

<div class="row align-items-center" style="height: 200px;">
  <div class="col">Middle</div>
</div>

<div class="row align-items-end" style="height: 200px;">
  <div class="col">Bottom</div>
</div>

<!-- Align individual columns -->
<div class="row" style="height: 200px;">
  <div class="col align-self-start">Top</div>
  <div class="col align-self-center">Middle</div>
  <div class="col align-self-end">Bottom</div>
</div>
```

### 9. Horizontal Alignment

```html
<!-- Left (default) -->
<div class="row justify-content-start">
  <div class="col-4">Column</div>
  <div class="col-4">Column</div>
</div>

<!-- Center -->
<div class="row justify-content-center">
  <div class="col-4">Column</div>
  <div class="col-4">Column</div>
</div>

<!-- Right -->
<div class="row justify-content-end">
  <div class="col-4">Column</div>
  <div class="col-4">Column</div>
</div>

<!-- Space between -->
<div class="row justify-content-between">
  <div class="col-4">Column</div>
  <div class="col-4">Column</div>
</div>

<!-- Space around -->
<div class="row justify-content-around">
  <div class="col-4">Column</div>
  <div class="col-4">Column</div>
</div>

<!-- Space evenly -->
<div class="row justify-content-evenly">
  <div class="col-4">Column</div>
  <div class="col-4">Column</div>
</div>
```

### 10. Mixed Column Sizes

```html
<div class="row">
  <div class="col">Auto width</div>
  <div class="col-6">Fixed 6 columns</div>
  <div class="col">Auto width</div>
</div>

<div class="row">
  <div class="col-md">Auto on md+</div>
  <div class="col-md-6">Fixed 6 on md+</div>
  <div class="col-md">Auto on md+</div>
</div>
```

### 11. Complex Responsive Layouts

```html
<div class="container">
  <div class="row">
    <!-- Mobile: full width, Tablet: half, Desktop: third, Large: quarter -->
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card">Product 1</div>
    </div>
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card">Product 2</div>
    </div>
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card">Product 3</div>
    </div>
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card">Product 4</div>
    </div>
  </div>
</div>
```

### 12. Masonry-style Layout

Using row columns and different heights:

```html
<div class="row row-cols-1 row-cols-md-3 g-4">
  <div class="col">
    <div class="card h-100">
      <div class="card-body" style="min-height: 200px;">Variable height</div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
      <div class="card-body" style="min-height: 300px;">Taller card</div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
      <div class="card-body" style="min-height: 250px;">Medium height</div>
    </div>
  </div>
</div>
```

### 13. Grid with Flexbox

Combine grid and flexbox utilities:

```html
<div class="row">
  <div class="col-md-6 d-flex align-items-stretch">
    <div class="card w-100">Card stretches to match height</div>
  </div>
  <div class="col-md-6">
    <div class="card">Taller content here...</div>
  </div>
</div>
```

### 14. CSS Grid Alternative

Bootstrap 5 also supports CSS Grid:

```html
<div class="d-grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
  <div class="p-3 border">Grid item</div>
  <div class="p-3 border">Grid item</div>
  <div class="p-3 border">Grid item</div>
  <div class="p-3 border">Grid item</div>
</div>
```

### 15. Holy Grail Layout

Classic 3-column layout:

```html
<div class="container-fluid">
  <header class="row">
    <div class="col">Header</div>
  </header>
  
  <div class="row flex-grow-1">
    <aside class="col-md-2">Left Sidebar</aside>
    <main class="col-md-8">Main Content</main>
    <aside class="col-md-2">Right Sidebar</aside>
  </div>
  
  <footer class="row">
    <div class="col">Footer</div>
  </footer>
</div>
```

### 16. Dashboard Layout

```html
<div class="container-fluid">
  <div class="row">
    <!-- Sidebar -->
    <nav class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
      <div class="position-sticky pt-3">
        <!-- Sidebar content -->
      </div>
    </nav>
    
    <!-- Main content -->
    <main class="col-md-9 col-lg-10 ms-sm-auto px-md-4">
      <div class="row g-4">
        <!-- Dashboard widgets -->
        <div class="col-md-6 col-lg-3">
          <div class="card">Widget 1</div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="card">Widget 2</div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="card">Widget 3</div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="card">Widget 4</div>
        </div>
      </div>
    </main>
  </div>
</div>
```

### 17. Magazine Layout

```html
<div class="container">
  <div class="row g-4">
    <!-- Featured article (large) -->
    <div class="col-12 col-lg-8">
      <article class="card h-100">Featured Article</article>
    </div>
    
    <!-- Sidebar articles (stacked) -->
    <div class="col-12 col-lg-4">
      <div class="row g-3">
        <div class="col-12">
          <article class="card">Sidebar Article 1</article>
        </div>
        <div class="col-12">
          <article class="card">Sidebar Article 2</article>
        </div>
      </div>
    </div>
    
    <!-- Grid of articles -->
    <div class="col-12">
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col"><article class="card">Article</article></div>
        <div class="col"><article class="card">Article</article></div>
        <div class="col"><article class="card">Article</article></div>
        <div class="col"><article class="card">Article</article></div>
        <div class="col"><article class="card">Article</article></div>
        <div class="col"><article class="card">Article</article></div>
      </div>
    </div>
  </div>
</div>
```

## Sass Grid Customization

```scss
// Modify grid breakpoints
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1600px  // Custom breakpoint
);

// Modify container widths
$container-max-widths: (
  sm: 540px,
  md: 720px,
  lg: 960px,
  xl: 1140px,
  xxl: 1400px
);

// Modify columns
$grid-columns: 12;
$grid-gutter-width: 1.5rem;

// Modify spacers for gutters
$spacers: (
  0: 0,
  1: $spacer * 0.25,
  2: $spacer * 0.5,
  3: $spacer,
  4: $spacer * 1.5,
  5: $spacer * 3,
  6: $spacer * 4
);
```

## Best Practices

1. **Mobile-first** - Start with mobile layout, add complexity for larger screens
2. **Semantic columns** - Use meaningful column counts, not random widths
3. **Consistent gutters** - Use standard gutter sizes throughout
4. **Nested wisely** - Avoid deep nesting (max 2-3 levels)
5. **Test responsive** - Check all breakpoints
6. **Use utilities** - Combine grid with spacing, display utilities
7. **Accessibility** - Use semantic HTML elements
8. **Performance** - Don't over-nest or over-complicate

## Common Patterns

### Equal Height Cards
```html
<div class="row row-cols-1 row-cols-md-3 g-4">
  <div class="col">
    <div class="card h-100">Equal height</div>
  </div>
  <div class="col">
    <div class="card h-100">Even with different content</div>
  </div>
  <div class="col">
    <div class="card h-100">All cards same height</div>
  </div>
</div>
```

### Centered Column
```html
<div class="row">
  <div class="col-md-8 col-lg-6 mx-auto">
    Centered content column
  </div>
</div>
```

### Sidebar Layout
```html
<div class="row">
  <aside class="col-lg-3 order-lg-1">Sidebar</aside>
  <main class="col-lg-9 order-lg-2">Main content</main>
</div>
```

## Resources

- [Bootstrap Grid Documentation](https://getbootstrap.com/docs/5.3/layout/grid/)
- [CSS-Tricks: Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
