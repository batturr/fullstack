# BOOTSTRAP 5.3+ TEXT STYLES - COMPREHENSIVE GUIDE

## Overview

Text styles utilities in Bootstrap provide simple, effective classes for styling text with various options including font weight, font style, text decoration, text transformation, and more. These utilities help create visual hierarchy, emphasis, and consistent typography throughout your design.

### Key Features
- **Font weight options** - 9 different weight levels (100-900)
- **Font styles** - Italic and normal styles
- **Text decorations** - Underline, line-through, none
- **Text transformations** - Uppercase, lowercase, capitalize
- **Text opacity** - Control text transparency (10-100%)
- **Monospace font** - Code/technical text styling
- **Combinable** - Mix and match with other utilities
- **Responsive** - Apply different styles at different breakpoints
- **NEW in Bootstrap 5.3+** - Enhanced CSS variable support, improved dark mode
- **Accessibility** - Maintains WCAG compliance standards

---

## Font Weight Classes Reference

### Complete Font Weight Options

Bootstrap provides 9 font weight levels for maximum flexibility:

| Class | Font Weight | Use Case | Example |
|-------|-------------|----------|---------|
| `.fw-light` | 300 | Thin/light emphasis | Light paragraph text |
| `.fw-lighter` | Lighter | Thinner relative weight | Supporting text |
| `.fw-normal` | 400 | Normal/regular text | Body text, default |
| `.fw-medium` | 500 | Medium emphasis | Buttons, labels |
| `.fw-semibold` | 600 | Semi-bold emphasis | Subheadings |
| `.fw-bold` | 700 | Bold emphasis | Headings, important text |
| `.fw-bolder` | Bolder | Heavier relative weight | Highlighted text |
| `.fw-900` | 900 | Extra heavy/black | Display text |
| No class | 400 (default) | Normal weight | Regular text |

### Font Weight Demonstration

```html
<!-- Light weight text -->
<p class="fw-light">This text has light weight (300)</p>

<!-- Lighter weight text -->
<p class="fw-lighter">This text is lighter (relative)</p>

<!-- Normal/default weight text -->
<p class="fw-normal">This text has normal weight (400)</p>

<!-- Medium weight text -->
<p class="fw-medium">This text has medium weight (500)</p>

<!-- Semi-bold weight text -->
<p class="fw-semibold">This text has semi-bold weight (600)</p>

<!-- Bold weight text -->
<p class="fw-bold">This text has bold weight (700)</p>

<!-- Bolder weight text -->
<p class="fw-bolder">This text is bolder (relative)</p>

<!-- Extra heavy/black weight text -->
<p class="fw-900">This text has extra heavy weight (900)</p>
```

---

## Font Style Classes Reference

### Font Style Options

| Class | CSS Property | Use Case | Example |
|-------|--------------|----------|---------|
| `.fst-italic` | `font-style: italic;` | Emphasis, citations, foreign words | *Emphasized text* |
| `.fst-normal` | `font-style: normal;` | Reset italic to normal | Normal text |

### Font Style Demonstration

```html
<!-- Italic text -->
<p class="fst-italic">This text is italicized</p>

<!-- Normal/upright text (resets italic) -->
<p class="fst-normal">This text is normal style</p>

<!-- Bold and italic together -->
<p class="fw-bold fst-italic">Bold and italic text</p>

<!-- Light and italic together -->
<p class="fw-light fst-italic">Light and italic text</p>
```

---

## Text Decoration Classes Reference

### Text Decoration Options (NEW in Bootstrap 5.3+)

| Class | CSS Property | Effect | Use Case |
|-------|--------------|--------|----------|
| `.text-decoration-underline` | `text-decoration: underline;` | Underlined text | Links, emphasized text |
| `.text-decoration-line-through` | `text-decoration: line-through;` | Strikethrough text | Deleted content, corrections |
| `.text-decoration-none` | `text-decoration: none;` | Remove decoration | Links without underline |

### Text Decoration Demonstration

```html
<!-- Underlined text -->
<p class="text-decoration-underline">This text is underlined</p>

<!-- Line-through/strikethrough text -->
<p class="text-decoration-line-through">This text has line-through</p>

<!-- No decoration (removes underline from links) -->
<a href="#" class="text-decoration-none">Link without underline</a>

<!-- Underlined bold text -->
<p class="fw-bold text-decoration-underline">Bold and underlined</p>

<!-- Strikethrough with specific color -->
<p class="text-decoration-line-through text-muted">Deleted text</p>
```

---

## Text Transform Classes Reference

### Text Transformation Options

| Class | CSS Property | Effect | Result |
|-------|--------------|--------|--------|
| `.text-uppercase` | `text-transform: uppercase;` | Convert to uppercase | UPPERCASE TEXT |
| `.text-lowercase` | `text-transform: lowercase;` | Convert to lowercase | lowercase text |
| `.text-capitalize` | `text-transform: capitalize;` | Capitalize first letter | Capitalize Words |

### Text Transform Demonstration

```html
<!-- Uppercase text -->
<p class="text-uppercase">this will be all uppercase</p>
<!-- Output: THIS WILL BE ALL UPPERCASE -->

<!-- Lowercase text -->
<p class="text-lowercase">THIS WILL BE ALL LOWERCASE</p>
<!-- Output: this will be all lowercase -->

<!-- Capitalize each word -->
<p class="text-capitalize">capitalize every word</p>
<!-- Output: Capitalize Every Word -->

<!-- Uppercase with bold -->
<p class="fw-bold text-uppercase">bold uppercase text</p>

<!-- Lowercase with italic -->
<p class="fst-italic text-lowercase">ITALIC LOWERCASE TEXT</p>

<!-- Capitalize with color -->
<p class="text-capitalize text-primary">capitalize primary text</p>
```

---

## Text Opacity Classes Reference (NEW in Bootstrap 5.3+)

### Text Opacity Options

Control text transparency/opacity with these utility classes:

| Class | Opacity | CSS Value | Use Case |
|-------|---------|-----------|----------|
| `.text-opacity-100` | 100% | `opacity: 1;` | Full opacity (default) |
| `.text-opacity-75` | 75% | `opacity: 0.75;` | Slightly transparent |
| `.text-opacity-50` | 50% | `opacity: 0.5;` | Semi-transparent |
| `.text-opacity-25` | 25% | `opacity: 0.25;` | Very transparent |
| `.text-opacity-10` | 10% | `opacity: 0.1;` | Extremely faint |

### Text Opacity Demonstration

```html
<!-- 100% opacity (fully visible) -->
<p class="text-opacity-100">Full opacity text</p>

<!-- 75% opacity -->
<p class="text-opacity-75">75% opacity text</p>

<!-- 50% opacity -->
<p class="text-opacity-50">50% opacity text</p>

<!-- 25% opacity -->
<p class="text-opacity-25">25% opacity text</p>

<!-- 10% opacity -->
<p class="text-opacity-10">10% opacity text</p>

<!-- Colored text with opacity -->
<p class="text-primary text-opacity-75">Primary color at 75% opacity</p>

<!-- Muted text with opacity -->
<p class="text-muted text-opacity-50">Muted text at 50% opacity</p>
```

---

## Monospace Font Class

### Monospace Text (NEW in Bootstrap 5.3+)

```html
<!-- Monospace font for code/technical text -->
<p class="font-monospace">Monospace text for code snippets</p>

<!-- Monospace with bold weight -->
<p class="font-monospace fw-bold">Code variable name</p>

<!-- Monospace code block styling -->
<code class="font-monospace bg-light p-2 rounded">
  var name = "John Doe";
</code>
```

---

## Basic Syntax Examples

### Combining Font Weight and Style

```html
<!-- Light italic text -->
<p class="fw-light fst-italic">Light italic text</p>

<!-- Bold italic text -->
<p class="fw-bold fst-italic">Bold italic text</p>

<!-- Semi-bold normal style -->
<p class="fw-semibold">Semi-bold text</p>

<!-- Medium weight italic -->
<p class="fw-medium fst-italic">Medium italic text</p>
```

### Combining with Text Colors

```html
<!-- Bold primary color text -->
<p class="fw-bold text-primary">Bold primary text</p>

<!-- Light success color text -->
<p class="fw-light text-success">Light success text</p>

<!-- Italic danger color text -->
<p class="fst-italic text-danger">Italic danger text</p>

<!-- Uppercase warning color text -->
<p class="fw-bold text-uppercase text-warning">Bold uppercase warning</p>
```

### Combining with Backgrounds

```html
<!-- Bold text on light background -->
<p class="fw-bold bg-light p-2 rounded">Bold on light background</p>

<!-- Italic text on primary background -->
<p class="fst-italic bg-primary text-white p-2 rounded">Italic on primary</p>

<!-- Uppercase text on dark background -->
<p class="fw-bold text-uppercase bg-dark text-white p-2 rounded">
  Bold uppercase on dark
</p>
```

### Combining All Text Style Classes

```html
<!-- All text styles combined -->
<p class="fw-bold fst-italic text-uppercase text-decoration-underline text-primary">
  Bold, Italic, Uppercase, Underlined, Primary Color
</p>

<!-- Multiple decorations (be careful - can be hard to read!) -->
<p class="fw-900 text-uppercase text-decoration-line-through">
  Extra heavy, uppercase, strikethrough
</p>
```

---

## Real-World Practical Examples

### Blog Post Styling

```html
<article class="py-5">
  <div class="container">
    <!-- Article title: bold, large -->
    <h1 class="fw-bold mb-3">How to Master Bootstrap</h1>
    
    <!-- Byline: light, muted -->
    <p class="fw-light text-muted">By John Doe | January 29, 2026</p>
    
    <!-- Emphasis within text -->
    <p>
      This guide will help you 
      <strong class="fw-bold">master Bootstrap</strong> 
      and create 
      <em class="fst-italic">amazing websites</em>.
    </p>
    
    <!-- Code snippet: monospace -->
    <p class="font-monospace bg-light p-3 rounded">
      &lt;div class="container"&gt;...&lt;/div&gt;
    </p>
  </div>
</article>
```

### Product Card with Styled Text

```html
<div class="card">
  <!-- Card title: bold, uppercase -->
  <div class="card-header">
    <h5 class="fw-bold text-uppercase mb-0">Product Name</h5>
  </div>
  
  <!-- Card body with mixed styling -->
  <div class="card-body">
    <!-- Italic description -->
    <p class="fst-italic text-muted">Premium quality product</p>
    
    <!-- Price: bold, large -->
    <p class="fw-bold" style="font-size: 1.5rem;">$99.99</p>
    
    <!-- Stock status: uppercase -->
    <p class="fw-semibold text-uppercase text-success">In Stock</p>
  </div>
  
  <!-- Footer: light, small -->
  <div class="card-footer">
    <p class="fw-light">Last updated 2 hours ago</p>
  </div>
</div>
```

### Navigation with Styled Items

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <!-- Bold brand name -->
  <a class="navbar-brand fw-bold" href="#">MyBrand</a>
  
  <div class="collapse navbar-collapse">
    <ul class="navbar-nav ms-auto">
      <li class="nav-item">
        <!-- Semi-bold active link -->
        <a class="nav-link fw-semibold active" href="#">Home</a>
      </li>
      <li class="nav-item">
        <!-- Normal weight inactive link -->
        <a class="nav-link" href="#">About</a>
      </li>
      <li class="nav-item">
        <!-- Italic muted link -->
        <a class="nav-link fst-italic text-muted" href="#">Help</a>
      </li>
    </ul>
  </div>
</nav>
```

### Form Labels and Inputs

```html
<form>
  <!-- Bold required label -->
  <div class="mb-3">
    <label for="name" class="form-label fw-bold">
      Full Name <span class="text-danger">*</span>
    </label>
    <input type="text" class="form-control" id="name">
  </div>
  
  <!-- Normal label with light helper text -->
  <div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input type="email" class="form-control" id="email">
    <small class="fw-light text-muted">We'll never share your email</small>
  </div>
  
  <!-- Uppercase label -->
  <div class="mb-3">
    <label class="form-label fw-bold text-uppercase">Options</label>
  </div>
  
  <!-- Button with text styles -->
  <button type="submit" class="btn btn-primary fw-bold text-uppercase">
    Submit Form
  </button>
</form>
```

### Alert Messages with Styled Text

```html
<!-- Success alert with bold title -->
<div class="alert alert-success">
  <p class="fw-bold mb-2">✓ Success!</p>
  <p class="fw-light">Your action has been completed successfully.</p>
</div>

<!-- Warning alert with uppercase title -->
<div class="alert alert-warning">
  <p class="fw-bold text-uppercase mb-2">⚠ Warning</p>
  <p>Please review this information before proceeding.</p>
</div>

<!-- Danger alert with strikethrough text -->
<div class="alert alert-danger">
  <p class="fw-bold mb-2">✗ Error</p>
  <p>
    <span class="text-decoration-line-through">Old information</span>
    Please use the updated version instead.
  </p>
</div>

<!-- Info alert with mixed styles -->
<div class="alert alert-info">
  <p class="fw-semibold mb-2">ℹ Information</p>
  <p class="fst-italic">This is informational text with special styling.</p>
</div>
```

### Table with Styled Headers and Content

```html
<table class="table">
  <thead>
    <tr>
      <!-- Bold headers -->
      <th class="fw-bold">Product</th>
      <th class="fw-bold">Price</th>
      <th class="fw-bold text-uppercase">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <!-- Normal product name -->
      <td>Widget A</td>
      
      <!-- Bold price -->
      <td class="fw-bold">$50.00</td>
      
      <!-- Uppercase status -->
      <td class="fw-semibold text-uppercase text-success">in stock</td>
    </tr>
    
    <tr>
      <!-- Italic discontinued product -->
      <td class="fst-italic text-muted">Widget B</td>
      
      <!-- Strikethrough old price -->
      <td class="text-decoration-line-through">$75.00</td>
      
      <!-- Uppercase out of stock -->
      <td class="fw-semibold text-uppercase text-danger">out of stock</td>
    </tr>
  </tbody>
</table>
```

### Button Variations

```html
<!-- Bold button text -->
<button class="btn btn-primary fw-bold">Bold Button</button>

<!-- Light weight button -->
<button class="btn btn-secondary fw-light">Light Button</button>

<!-- Uppercase button -->
<button class="btn btn-success fw-bold text-uppercase">
  Action Button
</button>

<!-- Semi-bold outlined button -->
<button class="btn btn-outline-primary fw-semibold">
  Outlined Button
</button>

<!-- Italic muted button -->
<button class="btn btn-link fw-light fst-italic">
  Link Button
</button>
```

### Quote/Blockquote Styling

```html
<!-- Italic blockquote -->
<blockquote class="blockquote fst-italic">
  <p>"The only way to do great work is to love what you do."</p>
  <footer class="blockquote-footer fw-light">Steve Jobs</footer>
</blockquote>

<!-- Bold pull quote -->
<blockquote class="blockquote border-start ps-3 fw-bold">
  <p>This is an important quote that deserves emphasis.</p>
</blockquote>
```

---

## CSS Properties Reference

### Font Weight CSS

```css
/* Font weight utilities */
.fw-light {
  font-weight: 300 !important;
}

.fw-lighter {
  font-weight: lighter !important;
}

.fw-normal {
  font-weight: 400 !important;
}

.fw-medium {
  font-weight: 500 !important;
}

.fw-semibold {
  font-weight: 600 !important;
}

.fw-bold {
  font-weight: 700 !important;
}

.fw-bolder {
  font-weight: bolder !important;
}

.fw-900 {
  font-weight: 900 !important;
}
```

### Font Style CSS

```css
/* Font style utilities */
.fst-italic {
  font-style: italic !important;
}

.fst-normal {
  font-style: normal !important;
}
```

### Text Decoration CSS

```css
/* Text decoration utilities */
.text-decoration-underline {
  text-decoration: underline !important;
}

.text-decoration-line-through {
  text-decoration: line-through !important;
}

.text-decoration-none {
  text-decoration: none !important;
}
```

### Text Transform CSS

```css
/* Text transform utilities */
.text-uppercase {
  text-transform: uppercase !important;
}

.text-lowercase {
  text-transform: lowercase !important;
}

.text-capitalize {
  text-transform: capitalize !important;
}
```

### CSS Variables (NEW in Bootstrap 5.3+)

```css
/* Text style CSS variables */
:root {
  --bs-font-weight-light: 300;
  --bs-font-weight-normal: 400;
  --bs-font-weight-medium: 500;
  --bs-font-weight-semibold: 600;
  --bs-font-weight-bold: 700;
}
```

---

## Responsive Text Styles

### Responsive Font Weight

```html
<!-- 
  Mobile: normal weight
  Tablet (≥768px): semi-bold
  Desktop (≥992px): bold
-->
<p class="fw-normal fw-md-semibold fw-lg-bold">
  Responsive font weight
</p>

<!-- Note: Bootstrap currently supports breakpoint-based alignment 
     but not font weight per breakpoint. Use media queries for this. -->
```

### Media Query Approach for Responsive Text

```html
<style>
  .responsive-text {
    font-weight: 400;
  }
  
  @media (min-width: 768px) {
    .responsive-text {
      font-weight: 600;
    }
  }
  
  @media (min-width: 992px) {
    .responsive-text {
      font-weight: 700;
    }
  }
</style>

<p class="responsive-text">Responsive font weight using media queries</p>
```

---

## Accessibility Guidelines

### Best Practices for Text Styles

✅ **DO:**
- Use bold for important information and emphasis
- Use italic for citations, foreign words, and special emphasis
- Maintain sufficient contrast for all text
- Use uppercase sparingly (can be hard to read)
- Combine styles logically (don't over-style)
- Test styles on all devices
- Ensure semantic meaning with proper HTML
- Use decorations to reinforce meaning
- Consider color-blind users when using colors with styles
- Maintain readable line height with styled text

❌ **DON'T:**
- Don't overuse bold or italic (reduces effectiveness)
- Don't use uppercase for long text passages
- Don't rely on styling alone for meaning
- Don't combine too many styles at once
- Don't use strikethrough for important information
- Don't ignore contrast requirements
- Don't use styles instead of proper semantic HTML
- Don't forget about screen reader users
- Don't apply styles inconsistently
- Don't reduce font size with increased font weight

### Semantic HTML and Styling

```html
<!-- Semantic: Use <strong> or <b> with fw-bold -->
<p>This is <strong class="fw-bold">important text</strong>.</p>

<!-- Semantic: Use <em> or <i> with fst-italic -->
<p>This is <em class="fst-italic">emphasized text</em>.</p>

<!-- Semantic: Use <mark> for highlighting -->
<p>This is <mark class="fw-bold">marked text</mark>.</p>

<!-- Semantic: Use <del> for deleted content -->
<p>This is <del class="text-decoration-line-through">deleted text</del>.</p>

<!-- Semantic: Use <ins> for inserted content -->
<p>This is <ins class="fw-bold">inserted text</ins>.</p>
```

---

## Dark Mode Support (NEW in Bootstrap 5.3+)

### Text Styles in Dark Mode

```html
<!-- Enable dark mode -->
<html data-bs-theme="dark" lang="en">
  <body>
    <!-- Text styles work the same in dark mode -->
    <p class="fw-bold">Bold text in dark mode</p>
    <p class="fst-italic">Italic text in dark mode</p>
    <p class="text-uppercase">Uppercase in dark mode</p>
    
    <!-- Colors automatically adjust for contrast -->
    <p class="fw-bold text-primary">Bold primary in dark mode</p>
  </body>
</html>
```

### Color Contrast in Dark Mode

```html
<!-- High contrast in dark mode -->
<p class="fw-bold text-light">Bold light text on dark background</p>

<!-- Lower contrast - may need adjustment -->
<p class="fw-light text-muted">Light text (may be hard to read)</p>

<!-- Proper contrast -->
<p class="fw-semibold text-white">Semi-bold white text</p>
```

---

## Complete HTML Example Template

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Text Styles - Bootstrap 5.3+ Complete Example</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .example-box {
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            margin-bottom: 15px;
            border-radius: 5px;
            font-size: 1rem;
        }
        .section {
            padding: 3rem 0;
            border-bottom: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="bg-dark text-white py-5">
        <div class="container text-center">
            <h1 class="display-3 fw-bold mb-3">Text Styles Guide</h1>
            <p class="lead fst-italic">Bootstrap 5.3+ Complete Reference</p>
        </div>
    </section>

    <!-- Font Weight Styles -->
    <section class="section">
        <div class="container">
            <h2 class="fw-bold mb-5">Font Weight Styles</h2>
            
            <div class="example-box">
                <p class="fw-light mb-2"><strong>Light (fw-light):</strong></p>
                <p class="fw-light">This text has a light font weight (300). Use for subtle emphasis.</p>
            </div>
            
            <div class="example-box">
                <p class="fw-normal mb-2"><strong>Normal (fw-normal):</strong></p>
                <p class="fw-normal">This text has normal font weight (400). This is the default.</p>
            </div>
            
            <div class="example-box">
                <p class="fw-medium mb-2"><strong>Medium (fw-medium):</strong></p>
                <p class="fw-medium">This text has medium font weight (500). Good for labels.</p>
            </div>
            
            <div class="example-box">
                <p class="fw-semibold mb-2"><strong>Semi-bold (fw-semibold):</strong></p>
                <p class="fw-semibold">This text has semi-bold weight (600). Use for emphasis.</p>
            </div>
            
            <div class="example-box">
                <p class="fw-bold mb-2"><strong>Bold (fw-bold):</strong></p>
                <p class="fw-bold">This text has bold weight (700). Use for important text.</p>
            </div>
            
            <div class="example-box">
                <p class="fw-900 mb-2"><strong>Extra Heavy (fw-900):</strong></p>
                <p class="fw-900">This text has extra heavy weight (900). Use for display text.</p>
            </div>
        </div>
    </section>

    <!-- Font Style -->
    <section class="section bg-light">
        <div class="container">
            <h2 class="fw-bold mb-5">Font Styles</h2>
            
            <div class="example-box">
                <p class="fst-italic mb-2"><strong>Italic (fst-italic):</strong></p>
                <p class="fst-italic">This text is italicized. Use for emphasis and citations.</p>
            </div>
            
            <div class="example-box">
                <p class="fst-normal mb-2"><strong>Normal (fst-normal):</strong></p>
                <p class="fst-normal">This text is in normal style. This resets italic styling.</p>
            </div>
            
            <div class="example-box">
                <p class="fw-bold fst-italic mb-2"><strong>Bold + Italic:</strong></p>
                <p class="fw-bold fst-italic">Combined bold and italic styling for maximum emphasis.</p>
            </div>
        </div>
    </section>

    <!-- Text Decoration -->
    <section class="section">
        <div class="container">
            <h2 class="fw-bold mb-5">Text Decorations</h2>
            
            <div class="example-box">
                <p class="text-decoration-underline mb-2"><strong>Underline:</strong></p>
                <p class="text-decoration-underline">This text is underlined.</p>
            </div>
            
            <div class="example-box">
                <p class="text-decoration-line-through mb-2"><strong>Line-through:</strong></p>
                <p class="text-decoration-line-through">This text has strikethrough.</p>
            </div>
            
            <div class="example-box">
                <p class="mb-2"><strong>No decoration:</strong></p>
                <a href="#" class="text-decoration-none">Link without underline</a>
            </div>
        </div>
    </section>

    <!-- Text Transformations -->
    <section class="section bg-light">
        <div class="container">
            <h2 class="fw-bold mb-5">Text Transformations</h2>
            
            <div class="example-box">
                <p class="text-uppercase mb-2"><strong>Uppercase:</strong></p>
                <p class="text-uppercase">this text is transformed to uppercase</p>
            </div>
            
            <div class="example-box">
                <p class="text-lowercase mb-2"><strong>Lowercase:</strong></p>
                <p class="text-lowercase">THIS TEXT IS TRANSFORMED TO LOWERCASE</p>
            </div>
            
            <div class="example-box">
                <p class="text-capitalize mb-2"><strong>Capitalize:</strong></p>
                <p class="text-capitalize">capitalize every word in the text</p>
            </div>
        </div>
    </section>

    <!-- Text Opacity -->
    <section class="section">
        <div class="container">
            <h2 class="fw-bold mb-5">Text Opacity Levels</h2>
            
            <div class="example-box">
                <p class="text-opacity-100">100% opacity - fully visible text</p>
                <p class="text-opacity-75">75% opacity - slightly transparent</p>
                <p class="text-opacity-50">50% opacity - semi-transparent</p>
                <p class="text-opacity-25">25% opacity - very transparent</p>
                <p class="text-opacity-10">10% opacity - extremely faint</p>
            </div>
        </div>
    </section>

    <!-- Combinations -->
    <section class="section bg-light">
        <div class="container">
            <h2 class="fw-bold mb-5">Combined Styles</h2>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="fw-bold text-primary text-uppercase mb-2">Bold + Primary + Uppercase</p>
                        <p>Combined multiple text styles for emphasis</p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="fw-light fst-italic text-muted mb-2">Light + Italic + Muted</p>
                        <p>Subtle styling for secondary text</p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="fw-bold text-decoration-underline text-success mb-2">Bold + Underline + Success</p>
                        <p>Highlighted success text</p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="text-decoration-line-through text-danger mb-2">Strikethrough + Danger</p>
                        <p>Indicate deleted or invalid content</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Monospace Example -->
    <section class="section">
        <div class="container">
            <h2 class="fw-bold mb-5">Monospace Text</h2>
            
            <div class="example-box">
                <p class="font-monospace">console.log('Hello World');</p>
            </div>
            
            <div class="example-box">
                <p class="font-monospace fw-bold">const variable = "value";</p>
            </div>
            
            <div class="example-box bg-dark text-light">
                <code class="font-monospace">&lt;div class="container"&gt;&lt;/div&gt;</code>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p class="fw-bold mb-2">Text Styles Complete Guide</p>
            <p class="fw-light text-opacity-75">Bootstrap 5.3+ - Comprehensive Reference</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Common Use Cases and Patterns

### Pattern 1: Blog Post Typography

```html
<article>
  <!-- Bold, large title -->
  <h1 class="fw-bold mb-2">Article Title</h1>
  
  <!-- Light, muted metadata -->
  <p class="fw-light text-muted mb-4">By Author | January 29, 2026</p>
  
  <!-- First paragraph with emphasis -->
  <p>
    This is the first paragraph with 
    <strong class="fw-bold">important keyword</strong> 
    and <em class="fst-italic">emphasis</em>.
  </p>
  
  <!-- Body paragraphs -->
  <p>Regular body text goes here...</p>
</article>
```

### Pattern 2: Form Labels and Hints

```html
<form>
  <!-- Bold required label -->
  <label for="name" class="form-label fw-bold">
    Your Name <span class="text-danger">*</span>
  </label>
  <input type="text" class="form-control" id="name">
  
  <!-- Light hint text -->
  <small class="fw-light text-muted">Provide your full name</small>
</form>
```

### Pattern 3: Product Card

```html
<div class="card">
  <!-- Bold uppercase product name -->
  <div class="card-header">
    <h5 class="fw-bold text-uppercase mb-0">Product Name</h5>
  </div>
  
  <!-- Description with italic style -->
  <div class="card-body">
    <p class="fst-italic text-muted">Premium product description</p>
    <p class="fw-bold fs-5">$99.99</p>
  </div>
</div>
```

### Pattern 4: Alert Messages

```html
<!-- Success alert -->
<div class="alert alert-success">
  <p class="fw-bold mb-2">✓ Success!</p>
  <p>Operation completed successfully.</p>
</div>

<!-- Error alert -->
<div class="alert alert-danger">
  <p class="fw-bold text-uppercase mb-2">✗ Error</p>
  <p>An error occurred. Please try again.</p>
</div>
```

### Pattern 5: Navigation Items

```html
<nav class="navbar">
  <!-- Bold brand -->
  <a class="navbar-brand fw-bold" href="#">Brand</a>
  
  <ul class="navbar-nav">
    <!-- Semi-bold active link -->
    <li><a class="nav-link fw-semibold active" href="#">Home</a></li>
    
    <!-- Normal inactive link -->
    <li><a class="nav-link" href="#">About</a></li>
  </ul>
</nav>
```

---

## Bootstrap 5.3+ Improvements vs Bootstrap 4

### What's New in Bootstrap 5.3+

| Feature | Bootstrap 4 | Bootstrap 5.3+ |
|---------|-----------|----------------|
| Font weights | Limited | ✅ 9 levels (100-900) |
| Font styles | Basic | ✅ Enhanced |
| Text decoration | No | ✅ Yes (underline, line-through, none) |
| Text opacity | No | ✅ Yes (10%, 25%, 50%, 75%, 100%) |
| Monospace font | No | ✅ Yes (font-monospace) |
| CSS variables | No | ✅ Yes |
| Dark mode support | No | ✅ Yes |
| Documentation | Basic | ✅ Comprehensive |

### Migration from Bootstrap 4

```html
<!-- Bootstrap 4 -->
<p style="font-weight: 700;">Bold text (inline style)</p>

<!-- Bootstrap 5.3+ (recommended) -->
<p class="fw-bold">Bold text</p>

<!-- Bootstrap 4 -->
<span style="font-style: italic;">Italic text</span>

<!-- Bootstrap 5.3+ (recommended) -->
<span class="fst-italic">Italic text</span>
```

---

## Advanced Text Styling Techniques

### Custom Text Styles with CSS Variables

```css
/* Define custom text style variables */
:root {
  --bs-text-highlight-weight: 700;
  --bs-text-highlight-color: #0d6efd;
}

.text-highlight {
  font-weight: var(--bs-text-highlight-weight);
  color: var(--bs-text-highlight-color);
}
```

### Pseudo-elements with Text Styles

```html
<style>
  .highlight::before {
    content: "→ ";
    font-weight: 700;
    color: #0d6efd;
  }
</style>

<p class="highlight fw-semibold">Important point</p>
```

### Text Styles with Transitions

```html
<style>
  .text-hover-bold {
    transition: font-weight 0.3s ease;
  }
  
  .text-hover-bold:hover {
    font-weight: 700;
  }
</style>

<a href="#" class="text-hover-bold">Hover for bold text</a>
```

---

## Browser Support and Compatibility

### Text Styles Browser Support

| Feature | Chrome | Firefox | Safari | Edge | IE 11 |
|---------|--------|---------|--------|------|-------|
| font-weight | ✅ | ✅ | ✅ | ✅ | ✅ |
| font-style | ✅ | ✅ | ✅ | ✅ | ✅ |
| text-decoration | ✅ | ✅ | ✅ | ✅ | ✅ |
| text-transform | ✅ | ✅ | ✅ | ✅ | ✅ |
| opacity | ✅ | ✅ | ✅ | ✅ | ⚠️ |

---

## Performance Considerations

### CSS File Size Impact
- Font weight utilities: ~2KB
- Font style utilities: ~0.5KB
- Text decoration utilities: ~1KB
- Text transform utilities: ~1KB
- Total text styles: ~4.5KB (fully gzipped: ~1KB)

### Rendering Performance
- Text styles have minimal impact on rendering
- Use `!important` flag ensures consistency (already in Bootstrap)
- No JavaScript required
- CSS-only, pure performance

---

## Resources and References

### Official Bootstrap Documentation
- **Text Styles Docs**: https://getbootstrap.com/docs/5.3/utilities/text/
- **Typography**: https://getbootstrap.com/docs/5.3/content/typography/
- **Utilities**: https://getbootstrap.com/docs/5.3/utilities/
- **CSS Variables**: https://getbootstrap.com/docs/5.3/customize/css-variables/

### Typography Best Practices
- **Web Typography**: https://www.smashingmagazine.com/guides/typography/
- **Font Weight**: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
- **Text Transform**: https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform
- **WCAG Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

### CDN Links (Bootstrap 5.3.2)

**CSS:**
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
```

**JavaScript:**
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

**Icons:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
```

---

## Summary

### Key Points about Text Styles

1. **9 Font Weights**: From 300 (light) to 900 (extra heavy)
2. **2 Font Styles**: Italic and normal
3. **3 Text Decorations**: Underline, line-through, none
4. **3 Text Transforms**: Uppercase, lowercase, capitalize
5. **5 Opacity Levels**: 10%, 25%, 50%, 75%, 100%
6. **Monospace Font**: For code and technical text
7. **Fully Combinable**: Mix and match any styles
8. **Responsive Ready**: Apply different styles via CSS
9. **Accessible**: Maintains WCAG compliance
10. **Dark Mode**: Automatic adjustment in dark mode

### Best Practices Summary

✅ Use bold for emphasis and important text  
✅ Use italic for citations and special emphasis  
✅ Keep font weights consistent within sections  
✅ Combine styles logically  
✅ Maintain good contrast  
✅ Use uppercase sparingly  
✅ Test all combinations on different devices  
✅ Consider accessibility requirements  
✅ Use semantic HTML with styling  
✅ Don't over-style (less is more)  

### Common Pitfalls to Avoid

❌ Don't use too many font weights in one design  
❌ Don't italic or underline whole paragraphs  
❌ Don't use uppercase for body text  
❌ Don't combine conflicting styles  
❌ Don't ignore contrast and readability  
❌ Don't style without semantic meaning  
❌ Don't forget mobile device testing  
❌ Don't make text too light (fw-light + low opacity)  
❌ Don't apply styles inconsistently  

Text styles are powerful tools for creating visual hierarchy, emphasis, and visual interest in your website. Use them strategically and consistently for the best results!