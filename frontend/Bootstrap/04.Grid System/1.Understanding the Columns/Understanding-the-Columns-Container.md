# BOOTSTRAP 5.3+ GRID SYSTEM - UNDERSTANDING THE COLUMNS

## Overview

The Bootstrap grid system is a powerful, responsive, mobile-first system built with flexbox. It provides a flexible framework for building layouts using rows and columns. The grid divides the page width into 12 equal columns, allowing you to create responsive layouts that adapt to any screen size.

### Key Features
- **12-column grid** - Flexible division of layout space
- **Responsive design** - Different layouts at different breakpoints
- **Mobile-first approach** - Start with mobile, enhance for larger screens
- **Flexbox-based** - Modern, flexible layout engine
- **Auto-layout columns** - Equal-width columns without specifying sizes
- **Offset columns** - Push columns to the right
- **Nesting** - Columns can contain other rows and columns
- **NEW in Bootstrap 5.3+** - Enhanced CSS variables, improved utilities
- **Accessibility** - Semantic HTML support
- **RTL support** - Works with right-to-left languages

---

## Grid System Basics

### The 12-Column Grid

Bootstrap's grid is based on a 12-column layout:

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ Col 1│ Col 2│ Col 3│ Col 4│ Col 5│ Col 6│ Col 7│ Col 8│ Col 9│ Col 10│ Col 11│ Col 12│
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

Each column represents 1/12th of the total width. You can combine columns to create different widths:
- 1 column = 8.33%
- 2 columns = 16.66%
- 3 columns = 25%
- 4 columns = 33.33%
- 6 columns = 50%
- 12 columns = 100%

---

## Grid System Components

### 1. Container (`.container` or `.container-fluid`)

```html
<!-- Fixed-width container with responsive breakpoints -->
<div class="container">
  <!-- Grid content here -->
</div>

<!-- Full-width container -->
<div class="container-fluid">
  <!-- Grid content here -->
</div>
```

| Container | Width (XS) | Width (SM ≥576px) | Width (MD ≥768px) | Width (LG ≥992px) | Width (XL ≥1200px) | Width (XXL ≥1400px) |
|-----------|-----------|------------------|-------------------|-------------------|-------------------|-------------------|
| `.container` | 100% | 540px | 720px | 960px | 1140px | 1320px |
| `.container-fluid` | 100% | 100% | 100% | 100% | 100% | 100% |

### 2. Row (`.row`)

```html
<div class="container">
  <div class="row">
    <!-- Columns go here -->
  </div>
</div>
```

The `.row` class:
- Creates a horizontal group of columns
- Uses flexbox for layout
- Has 12 equal columns by default
- Provides negative margin to counteract column gutters

### 3. Columns (`.col-*`)

```html
<div class="container">
  <div class="row">
    <div class="col">Column 1</div>
    <div class="col">Column 2</div>
    <div class="col">Column 3</div>
  </div>
</div>
```

---

## Column Classes Reference

### Basic Column Classes (Without Breakpoints)

| Class | Width | Use Case |
|-------|-------|----------|
| `.col` | Auto (equal width) | Equal-width columns |
| `.col-auto` | Auto (content width) | Columns based on content |
| `.col-1` | 8.33% (1/12) | Single column |
| `.col-2` | 16.66% (2/12) | Two columns |
| `.col-3` | 25% (3/12) | Three columns / Quarter width |
| `.col-4` | 33.33% (4/12) | Four columns / Third width |
| `.col-5` | 41.66% (5/12) | Five columns |
| `.col-6` | 50% (6/12) | Six columns / Half width |
| `.col-7` | 58.33% (7/12) | Seven columns |
| `.col-8` | 66.66% (8/12) | Eight columns / Two-thirds width |
| `.col-9` | 75% (9/12) | Nine columns / Three-quarters width |
| `.col-10` | 83.33% (10/12) | Ten columns |
| `.col-11` | 91.66% (11/12) | Eleven columns |
| `.col-12` | 100% (12/12) | Full width / Single column |

### Responsive Column Classes

Bootstrap provides responsive column classes for each breakpoint:

| Breakpoint | Prefix | Screen Size | Classes |
|-----------|--------|------------|---------|
| Extra small | None | <576px | `.col-1` through `.col-12` |
| Small | `sm` | ≥576px | `.col-sm-1` through `.col-sm-12` |
| Medium | `md` | ≥768px | `.col-md-1` through `.col-md-12` |
| Large | `lg` | ≥992px | `.col-lg-1` through `.col-lg-12` |
| Extra large | `xl` | ≥1200px | `.col-xl-1` through `.col-xl-12` |
| XXL | `xxl` | ≥1400px | `.col-xxl-1` through `.col-xxl-12` |

---

## Basic Column Examples

### Single Column (Full Width)

```html
<div class="container">
  <div class="row">
    <div class="col-12 bg-primary text-white p-3">
      Full width column (12/12)
    </div>
  </div>
</div>
```

### Two Equal Columns

```html
<div class="container">
  <div class="row">
    <div class="col-6 bg-primary text-white p-3">
      Column 1 (6/12)
    </div>
    <div class="col-6 bg-success text-white p-3">
      Column 2 (6/12)
    </div>
  </div>
</div>
```

### Three Equal Columns

```html
<div class="container">
  <div class="row">
    <div class="col-4 bg-primary text-white p-3">
      Column 1 (4/12)
    </div>
    <div class="col-4 bg-success text-white p-3">
      Column 2 (4/12)
    </div>
    <div class="col-4 bg-info text-white p-3">
      Column 3 (4/12)
    </div>
  </div>
</div>
```

### Four Equal Columns

```html
<div class="container">
  <div class="row">
    <div class="col-3 bg-primary text-white p-3">Col 1</div>
    <div class="col-3 bg-success text-white p-3">Col 2</div>
    <div class="col-3 bg-info text-white p-3">Col 3</div>
    <div class="col-3 bg-warning text-dark p-3">Col 4</div>
  </div>
</div>
```

### Twelve Single Columns

```html
<div class="container">
  <div class="row">
    <div class="col-1 bg-primary text-white p-3">1</div>
    <div class="col-1 bg-success text-white p-3">2</div>
    <div class="col-1 bg-info text-white p-3">3</div>
    <div class="col-1 bg-warning text-dark p-3">4</div>
    <div class="col-1 bg-danger text-white p-3">5</div>
    <div class="col-1 bg-secondary text-white p-3">6</div>
    <div class="col-1 bg-dark text-white p-3">7</div>
    <div class="col-1 bg-light text-dark p-3">8</div>
    <div class="col-1 bg-primary text-white p-3">9</div>
    <div class="col-1 bg-success text-white p-3">10</div>
    <div class="col-1 bg-info text-white p-3">11</div>
    <div class="col-1 bg-warning text-dark p-3">12</div>
  </div>
</div>
```

---

## Mixed Column Widths

### 4-8 Layout (One-Third, Two-Thirds)

```html
<div class="container">
  <div class="row">
    <div class="col-4 bg-primary text-white p-3">
      Sidebar (4/12 = 33.33%)
    </div>
    <div class="col-8 bg-success text-white p-3">
      Main Content (8/12 = 66.66%)
    </div>
  </div>
</div>
```

### 3-6-3 Layout

```html
<div class="container">
  <div class="row">
    <div class="col-3 bg-primary text-white p-3">
      Left (3/12 = 25%)
    </div>
    <div class="col-6 bg-success text-white p-3">
      Center (6/12 = 50%)
    </div>
    <div class="col-3 bg-info text-white p-3">
      Right (3/12 = 25%)
    </div>
  </div>
</div>
```

### 2-8-2 Layout

```html
<div class="container">
  <div class="row">
    <div class="col-2 bg-primary text-white p-3">
      Left Sidebar (2/12 = 16.66%)
    </div>
    <div class="col-8 bg-success text-white p-3">
      Main Content (8/12 = 66.66%)
    </div>
    <div class="col-2 bg-info text-white p-3">
      Right Sidebar (2/12 = 16.66%)
    </div>
  </div>
</div>
```

### 5-7 Layout

```html
<div class="container">
  <div class="row">
    <div class="col-5 bg-primary text-white p-3">
      Featured (5/12 = 41.66%)
    </div>
    <div class="col-7 bg-success text-white p-3">
      Content (7/12 = 58.33%)
    </div>
  </div>
</div>
```

---

## Responsive Columns

### Mobile-First Responsive Design

```html
<!-- 
  Mobile (default): Full width
  Tablet (≥768px): Half width (2 columns)
  Desktop (≥992px): One-third width (3 columns)
-->
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4 bg-primary text-white p-3">
      Responsive column
    </div>
    <div class="col-12 col-md-6 col-lg-4 bg-success text-white p-3">
      Responsive column
    </div>
    <div class="col-12 col-md-6 col-lg-4 bg-info text-white p-3">
      Responsive column
    </div>
  </div>
</div>
```

### Different Layouts at Different Breakpoints

```html
<div class="container">
  <div class="row">
    <!-- Mobile: 12 (full width)
         Tablet: 6 (half)
         Desktop: 3 (quarter)
    -->
    <div class="col-12 col-sm-6 col-lg-3 bg-primary text-white p-3">
      Box 1
    </div>
    <div class="col-12 col-sm-6 col-lg-3 bg-success text-white p-3">
      Box 2
    </div>
    <div class="col-12 col-sm-6 col-lg-3 bg-info text-white p-3">
      Box 3
    </div>
    <div class="col-12 col-sm-6 col-lg-3 bg-warning text-dark p-3">
      Box 4
    </div>
  </div>
</div>
```

---

## Auto-Layout Columns

### Equal Width Columns

```html
<!-- Columns automatically divide space equally -->
<div class="container">
  <div class="row">
    <div class="col bg-primary text-white p-3">Column 1</div>
    <div class="col bg-success text-white p-3">Column 2</div>
    <div class="col bg-info text-white p-3">Column 3</div>
  </div>
</div>
```

### Auto-Width Based on Content

```html
<!-- Columns size based on content -->
<div class="container">
  <div class="row">
    <div class="col-auto bg-primary text-white p-3">
      Variable width content
    </div>
    <div class="col bg-success text-white p-3">
      Remaining space
    </div>
  </div>
</div>
```

### Mixed Auto and Fixed Width

```html
<div class="container">
  <div class="row">
    <div class="col-auto bg-primary text-white p-3">
      Auto width (left sidebar)
    </div>
    <div class="col bg-success text-white p-3">
      Remaining space (main content)
    </div>
    <div class="col-auto bg-info text-white p-3">
      Auto width (right sidebar)
    </div>
  </div>
</div>
```

---

## Column Offsetting

### Offset Columns

```html
<!-- Move column to the right using offset -->
<div class="container">
  <div class="row">
    <div class="col-4 offset-8 bg-primary text-white p-3">
      Column offset 8 (pushed to right)
    </div>
  </div>
</div>
```

### Multiple Offset Examples

```html
<div class="container">
  <div class="row">
    <!-- No offset (aligned left) -->
    <div class="col-3 bg-primary text-white p-3">
      No offset
    </div>
  </div>
  
  <div class="row">
    <!-- Offset 1 -->
    <div class="col-3 offset-1 bg-success text-white p-3">
      Offset 1
    </div>
  </div>
  
  <div class="row">
    <!-- Offset 2 -->
    <div class="col-3 offset-2 bg-info text-white p-3">
      Offset 2
    </div>
  </div>
</div>
```

### Responsive Offset

```html
<!-- Offset changes at breakpoints -->
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 offset-md-3 bg-primary text-white p-3">
      Mobile: Full width
      Desktop: Half width, centered (6/12 + 3 offset)
    </div>
  </div>
</div>
```

---

## Nested Columns

### Nesting Rows and Columns

```html
<div class="container">
  <div class="row">
    <div class="col-8 bg-primary text-white p-3">
      Main column (8/12)
      
      <!-- Nested row inside column -->
      <div class="row mt-3">
        <div class="col-6 bg-info text-white p-3">
          Nested column 1
        </div>
        <div class="col-6 bg-warning text-dark p-3">
          Nested column 2
        </div>
      </div>
    </div>
    
    <div class="col-4 bg-success text-white p-3">
      Sidebar (4/12)
    </div>
  </div>
</div>
```

### Deep Nesting

```html
<div class="container">
  <div class="row">
    <div class="col-12 bg-primary text-white p-3">
      Level 1
      
      <div class="row mt-3">
        <div class="col-6 bg-success text-white p-3">
          Level 2 - Column 1
          
          <div class="row mt-3">
            <div class="col-6 bg-info text-white p-3">
              Level 3 - Column 1
            </div>
            <div class="col-6 bg-warning text-dark p-3">
              Level 3 - Column 2
            </div>
          </div>
        </div>
        
        <div class="col-6 bg-danger text-white p-3">
          Level 2 - Column 2
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Real-World Layouts

### Blog Layout (Sidebar + Main Content)

```html
<div class="container">
  <div class="row">
    <div class="col-8">
      <!-- Main blog content area -->
      <article>
        <h1>Blog Post Title</h1>
        <p>Blog content here...</p>
      </article>
    </div>
    
    <div class="col-4">
      <!-- Sidebar -->
      <div class="card mb-3">
        <div class="card-header">
          Recent Posts
        </div>
        <div class="card-body">
          <ul>
            <li>Post 1</li>
            <li>Post 2</li>
            <li>Post 3</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

### E-Commerce Product Grid

```html
<div class="container">
  <div class="row">
    <!-- Mobile: Full width
         Tablet: Half width (2 columns)
         Desktop: Quarter width (4 columns)
    -->
    <div class="col-12 col-sm-6 col-lg-3 mb-4">
      <div class="card">
        <img src="product.jpg" class="card-img-top" alt="Product">
        <div class="card-body">
          <h5>Product Name</h5>
          <p class="card-text">$99.99</p>
          <button class="btn btn-primary">Add to Cart</button>
        </div>
      </div>
    </div>
    <!-- Repeat for more products -->
  </div>
</div>
```

### Dashboard Layout

```html
<div class="container-fluid">
  <div class="row">
    <!-- Sidebar -->
    <div class="col-md-3 col-lg-2 bg-light">
      <nav class="nav flex-column">
        <a class="nav-link" href="#">Dashboard</a>
        <a class="nav-link" href="#">Analytics</a>
        <a class="nav-link" href="#">Settings</a>
      </nav>
    </div>
    
    <!-- Main content -->
    <div class="col-md-9 col-lg-10">
      <h1>Dashboard</h1>
      <div class="row">
        <!-- Stats cards -->
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5>Total Users</h5>
              <p class="h3">1,234</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5>Revenue</h5>
              <p class="h3">$12,345</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5>Growth</h5>
              <p class="h3">+15%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Three-Column Landing Page

```html
<div class="container">
  <!-- Hero section (full width) -->
  <div class="row">
    <div class="col-12 bg-primary text-white text-center py-5">
      <h1>Welcome to Our Service</h1>
      <p>The best solution for your needs</p>
    </div>
  </div>
  
  <!-- Features section (three columns) -->
  <div class="row my-5">
    <div class="col-12 col-md-4 mb-4 mb-md-0">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Feature 1</h5>
          <p class="card-text">Description of feature 1</p>
        </div>
      </div>
    </div>
    
    <div class="col-12 col-md-4 mb-4 mb-md-0">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Feature 2</h5>
          <p class="card-text">Description of feature 2</p>
        </div>
      </div>
    </div>
    
    <div class="col-12 col-md-4">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Feature 3</h5>
          <p class="card-text">Description of feature 3</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Column Sizing Rules

### How Columns Are Sized

1. **Explicit sizing** - Using `.col-1` through `.col-12`
   ```html
   <div class="col-6">Fixed 50% width</div>
   ```

2. **Auto sizing** - Using `.col` (equal width)
   ```html
   <div class="col">Auto equal width</div>
   <div class="col">Auto equal width</div>
   <div class="col">Auto equal width</div>
   ```

3. **Content-based** - Using `.col-auto`
   ```html
   <div class="col-auto">Width based on content</div>
   ```

4. **Mix of explicit and auto**
   ```html
   <div class="col-6">Fixed 50%</div>
   <div class="col">Takes remaining space</div>
   ```

---

## Gutters (Column Spacing)

### Default Gutters

```html
<!-- Default gutter (1.5rem or 24px on each side) -->
<div class="container">
  <div class="row">
    <div class="col-6">Column with default gutter</div>
    <div class="col-6">Column with default gutter</div>
  </div>
</div>
```

### Custom Gutters

```html
<!-- No gutters -->
<div class="container">
  <div class="row g-0">
    <div class="col-6">No gutter</div>
    <div class="col-6">No gutter</div>
  </div>
</div>

<!-- Small gutters -->
<div class="row g-2">
  <div class="col-6">Small gutter</div>
  <div class="col-6">Small gutter</div>
</div>

<!-- Large gutters -->
<div class="row g-5">
  <div class="col-6">Large gutter</div>
  <div class="col-6">Large gutter</div>
</div>

<!-- Responsive gutters -->
<div class="row g-2 g-md-5">
  <div class="col-6">Mobile: small, Desktop: large</div>
  <div class="col-6">Mobile: small, Desktop: large</div>
</div>
```

### Gutter Classes

| Class | Spacing (default) | Spacing (custom) |
|-------|-------------------|------------------|
| `.g-0` | 0 | None |
| `.g-1` | 0.25rem (4px) | `--bs-gutter-x` |
| `.g-2` | 0.5rem (8px) | `--bs-gutter-x` |
| `.g-3` | 1rem (16px) | `--bs-gutter-x` |
| `.g-4` | 1.5rem (24px) | `--bs-gutter-x` |
| `.g-5` | 3rem (48px) | `--bs-gutter-x` |

---

## CSS Properties

### Grid System CSS Variables (NEW in Bootstrap 5.3+)

```css
:root {
  --bs-gutter-x: 1.5rem;
  --bs-gutter-y: 0;
  --bs-grid-columns: 12;
}

/* Breakpoints */
@media (max-width: 575.98px) {
  /* XS: < 576px */
}

@media (min-width: 576px) {
  /* SM: ≥ 576px */
}

@media (min-width: 768px) {
  /* MD: ≥ 768px */
}

@media (min-width: 992px) {
  /* LG: ≥ 992px */
}

@media (min-width: 1200px) {
  /* XL: ≥ 1200px */
}

@media (min-width: 1400px) {
  /* XXL: ≥ 1400px */
}
```

---

## Complete HTML Example Template

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grid System - Understanding Columns</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .example-col {
            background-color: #e7f3ff;
            border: 1px solid #0d6efd;
            padding: 15px;
            margin-bottom: 10px;
            text-align: center;
            border-radius: 3px;
        }
        .section {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="#">Grid System Tutorial</a>
        </div>
    </nav>

    <!-- Hero -->
    <section class="bg-dark text-white py-5 text-center">
        <div class="container">
            <h1 class="display-3 fw-bold mb-3">Understanding Bootstrap Columns</h1>
            <p class="lead">Master the 12-column responsive grid system</p>
        </div>
    </section>

    <!-- Main content -->
    <div class="container">
        <!-- Section 1: Full Width -->
        <section class="section">
            <h2 class="fw-bold mb-4">Single Column (Full Width - col-12)</h2>
            <div class="row">
                <div class="col-12 example-col">
                    <strong>12/12</strong> - Full width column
                </div>
            </div>
        </section>

        <!-- Section 2: Two Columns -->
        <section class="section">
            <h2 class="fw-bold mb-4">Two Equal Columns (col-6)</h2>
            <div class="row">
                <div class="col-6 example-col">
                    <strong>6/12</strong> - Half width
                </div>
                <div class="col-6 example-col">
                    <strong>6/12</strong> - Half width
                </div>
            </div>
        </section>

        <!-- Section 3: Three Columns -->
        <section class="section">
            <h2 class="fw-bold mb-4">Three Equal Columns (col-4)</h2>
            <div class="row">
                <div class="col-4 example-col">
                    <strong>4/12</strong> - Third width
                </div>
                <div class="col-4 example-col">
                    <strong>4/12</strong> - Third width
                </div>
                <div class="col-4 example-col">
                    <strong>4/12</strong> - Third width
                </div>
            </div>
        </section>

        <!-- Section 4: Four Columns -->
        <section class="section">
            <h2 class="fw-bold mb-4">Four Equal Columns (col-3)</h2>
            <div class="row">
                <div class="col-3 example-col"><strong>3/12</strong></div>
                <div class="col-3 example-col"><strong>3/12</strong></div>
                <div class="col-3 example-col"><strong>3/12</strong></div>
                <div class="col-3 example-col"><strong>3/12</strong></div>
            </div>
        </section>

        <!-- Section 5: Twelve Columns -->
        <section class="section">
            <h2 class="fw-bold mb-4">Twelve Single Columns (col-1)</h2>
            <div class="row">
                <div class="col-1 example-col"><strong>1</strong></div>
                <div class="col-1 example-col"><strong>2</strong></div>
                <div class="col-1 example-col"><strong>3</strong></div>
                <div class="col-1 example-col"><strong>4</strong></div>
                <div class="col-1 example-col"><strong>5</strong></div>
                <div class="col-1 example-col"><strong>6</strong></div>
                <div class="col-1 example-col"><strong>7</strong></div>
                <div class="col-1 example-col"><strong>8</strong></div>
                <div class="col-1 example-col"><strong>9</strong></div>
                <div class="col-1 example-col"><strong>10</strong></div>
                <div class="col-1 example-col"><strong>11</strong></div>
                <div class="col-1 example-col"><strong>12</strong></div>
            </div>
        </section>

        <!-- Section 6: Mixed Widths -->
        <section class="section">
            <h2 class="fw-bold mb-4">Mixed Column Widths (col-4 + col-8)</h2>
            <div class="row">
                <div class="col-4 example-col">
                    <strong>4/12</strong> - Sidebar
                </div>
                <div class="col-8 example-col">
                    <strong>8/12</strong> - Main content
                </div>
            </div>
        </section>

        <!-- Section 7: Auto-Width -->
        <section class="section">
            <h2 class="fw-bold mb-4">Auto-Width Equal Columns (col)</h2>
            <div class="row">
                <div class="col example-col">Auto</div>
                <div class="col example-col">Auto</div>
                <div class="col example-col">Auto</div>
            </div>
        </section>

        <!-- Section 8: Responsive -->
        <section class="section">
            <h2 class="fw-bold mb-4">Responsive Columns</h2>
            <p class="text-muted">Mobile: Full width (col-12), Tablet: Half (col-md-6), Desktop: Quarter (col-lg-3)</p>
            <div class="row">
                <div class="col-12 col-md-6 col-lg-3 example-col mb-3">
                    Responsive 1
                </div>
                <div class="col-12 col-md-6 col-lg-3 example-col mb-3">
                    Responsive 2
                </div>
                <div class="col-12 col-md-6 col-lg-3 example-col mb-3">
                    Responsive 3
                </div>
                <div class="col-12 col-md-6 col-lg-3 example-col mb-3">
                    Responsive 4
                </div>
            </div>
        </section>

        <!-- Section 9: Nesting -->
        <section class="section">
            <h2 class="fw-bold mb-4">Nested Columns</h2>
            <div class="row">
                <div class="col-8 example-col">
                    <strong>8/12</strong> - Parent column
                    <div class="row mt-3">
                        <div class="col-6" style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; text-align: center; border-radius: 3px;">
                            <strong>6/12</strong> - Nested
                        </div>
                        <div class="col-6" style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; text-align: center; border-radius: 3px;">
                            <strong>6/12</strong> - Nested
                        </div>
                    </div>
                </div>
                <div class="col-4 example-col">
                    <strong>4/12</strong> - Sidebar
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5">
        <div class="container text-center">
            <p class="fw-bold mb-2">Bootstrap 5.3+ Grid System</p>
            <p class="text-muted">12-Column Responsive Layout</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Accessibility Guidelines

### Best Practices

✅ **DO:**
- Use semantic HTML with grid system
- Ensure proper heading hierarchy
- Test responsiveness on real devices
- Use meaningful content in columns
- Provide alt text for images
- Ensure color contrast
- Test keyboard navigation
- Use ARIA labels when needed

❌ **DON'T:**
- Don't use columns for layout hacks
- Don't ignore mobile responsiveness
- Don't create confusing layouts
- Don't forget about touch targets
- Don't ignore accessibility standards
- Don't nest too deeply
- Don't use empty columns for spacing
- Don't ignore focus indicators

---

## Bootstrap 5.3+ Improvements vs Bootstrap 4

### What's New in Bootstrap 5.3+

| Feature | Bootstrap 4 | Bootstrap 5.3+ |
|---------|-----------|----------------|
| 12-column grid | ✅ Yes | ✅ Yes |
| Responsive classes | ✅ Yes | ✅ Enhanced |
| CSS variables | ❌ No | ✅ Yes |
| Gutter customization | Limited | ✅ Enhanced |
| Dark mode support | ❌ No | ✅ Yes |
| Documentation | ✅ Good | ✅ Excellent |

---

## Quick Reference

### Column Width Percentages

```
col-1  =  8.33%   (1/12)
col-2  = 16.66%   (2/12)
col-3  = 25%      (3/12 or 1/4)
col-4  = 33.33%   (4/12 or 1/3)
col-5  = 41.66%   (5/12)
col-6  = 50%      (6/12 or 1/2)
col-7  = 58.33%   (7/12)
col-8  = 66.66%   (8/12 or 2/3)
col-9  = 75%      (9/12 or 3/4)
col-10 = 83.33%   (10/12)
col-11 = 91.66%   (11/12)
col-12 = 100%     (12/12)
```

### Breakpoint Prefixes

```
(none)  = XS: < 576px
sm      = SM: ≥ 576px
md      = MD: ≥ 768px
lg      = LG: ≥ 992px
xl      = XL: ≥ 1200px
xxl     = XXL: ≥ 1400px
```

---

## Resources and References

### Official Bootstrap Documentation
- **Grid System**: https://getbootstrap.com/docs/5.3/layout/grid/
- **Containers**: https://getbootstrap.com/docs/5.3/layout/containers/
- **CSS Variables**: https://getbootstrap.com/docs/5.3/customize/css-variables/
- **Utilities**: https://getbootstrap.com/docs/5.3/utilities/

### CDN Links (Bootstrap 5.3.2)

**CSS:**
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
```

**JavaScript:**
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

---

## Summary

### Key Points about Grid Columns

1. **12 columns** - Base unit for all layouts
2. **Responsive** - Different widths at different breakpoints
3. **Flexible** - Combine columns in any configuration
4. **Mobile-first** - Start with mobile, enhance for larger screens
5. **Auto-layout** - Columns can size automatically
6. **Nesting** - Columns can contain rows
7. **Offsetting** - Push columns to the right
8. **Gutters** - Customizable spacing between columns
9. **CSS Variables** - Fully customizable
10. **Modern Flexbox** - Powerful, flexible layout engine

### Best Practices Recap

✅ Use responsive classes for mobile-first design  
✅ Understand the 12-column system  
✅ Use semantic HTML structure  
✅ Test on actual devices  
✅ Keep nesting shallow  
✅ Use auto-layout when appropriate  
✅ Maintain accessibility standards  
✅ Customize gutters as needed  
✅ Leverage CSS variables  
✅ Test across browsers  

The Bootstrap grid system is fundamental to responsive web design. Mastering the column system empowers you to create flexible, responsive layouts that work beautifully on all devices!