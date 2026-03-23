# BOOTSTRAP 5.3+ TEXT ALIGNMENT - COMPREHENSIVE GUIDE

## Overview

Text alignment utilities in Bootstrap provide simple, flexible classes for aligning text content in any direction. These utilities allow you to control text alignment (left, center, right, justify) and are fully responsive with breakpoint modifiers.

### Key Features
- **4 alignment options** - Start (left), center, end (right), justify
- **Responsive design** - Apply different alignment at different breakpoints
- **Simple syntax** - Easy-to-use class names
- **CSS-based** - Pure CSS, no JavaScript required
- **RTL support** - Works with right-to-left languages
- **NEW in Bootstrap 5.3+** - Enhanced documentation, improved dark mode support

---

## Text Alignment Classes Reference

### Core Alignment Classes

| Class | Effect | CSS Property | Browser Default |
|-------|--------|--------------|-----------------|
| `.text-start` | Align text to the left | `text-align: left;` | Left |
| `.text-center` | Align text to the center | `text-align: center;` | Left |
| `.text-end` | Align text to the right | `text-align: right;` | Left |
| `.text-justify` | Justify text alignment | `text-align: justify;` | Left |

### Responsive Alignment Classes

Bootstrap provides responsive versions of text alignment classes that apply at specific breakpoints:

| Breakpoint | Classes |
|-----------|---------|
| Extra small (default) | `.text-start`, `.text-center`, `.text-end`, `.text-justify` |
| Small (≥576px) | `.text-sm-start`, `.text-sm-center`, `.text-sm-end`, `.text-sm-justify` |
| Medium (≥768px) | `.text-md-start`, `.text-md-center`, `.text-md-end`, `.text-md-justify` |
| Large (≥992px) | `.text-lg-start`, `.text-lg-center`, `.text-lg-end`, `.text-lg-justify` |
| Extra large (≥1200px) | `.text-xl-start`, `.text-xl-center`, `.text-xl-end`, `.text-xl-justify` |
| XXL (≥1400px) | `.text-xxl-start`, `.text-xxl-center`, `.text-xxl-end`, `.text-xxl-justify` |

---

## Basic Syntax Examples

### Simple Text Alignment

```html
<!-- Left aligned (default) -->
<p class="text-start">This text is left aligned</p>

<!-- Center aligned -->
<p class="text-center">This text is center aligned</p>

<!-- Right aligned -->
<p class="text-end">This text is right aligned</p>

<!-- Justified text -->
<p class="text-justify">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
  Est eligendi magni nihil expedita amet quos officia. 
  Veniam, alias unde voluptas rerum blanditiis odio modi nam.
</p>
```

### Text Alignment in Containers

```html
<!-- Left aligned in container -->
<div class="text-start">
  <p>Container with left aligned content</p>
  <p>All child elements inherit left alignment</p>
</div>

<!-- Center aligned section -->
<div class="text-center">
  <h2>Centered Heading</h2>
  <p>Centered paragraph text</p>
  <button class="btn btn-primary">Centered Button</button>
</div>

<!-- Right aligned div -->
<div class="text-end">
  <p>Right aligned content</p>
  <p>Useful for right-to-left languages</p>
</div>
```

### Combining with Headings

```html
<!-- Centered heading -->
<h1 class="text-center">Welcome to Our Website</h1>

<!-- Left aligned heading with paragraph -->
<h2 class="text-start">Section Title</h2>
<p class="text-start">Supporting paragraph text</p>

<!-- Right aligned heading -->
<h3 class="text-end">Footer Section</h3>
```

### Combining with Buttons

```html
<!-- Centered button -->
<div class="text-center">
  <button class="btn btn-primary">Click Me</button>
</div>

<!-- Right aligned button group -->
<div class="text-end">
  <button class="btn btn-secondary">Cancel</button>
  <button class="btn btn-primary">Save</button>
</div>

<!-- Left aligned buttons -->
<div class="text-start">
  <button class="btn btn-outline-primary">Back</button>
  <button class="btn btn-primary">Next</button>
</div>
```

### Combining with Lists

```html
<!-- Centered unordered list -->
<div class="text-center">
  <ul class="list-unstyled">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</div>

<!-- Right aligned ordered list -->
<div class="text-end">
  <ol>
    <li>Step 1</li>
    <li>Step 2</li>
    <li>Step 3</li>
  </ol>
</div>
```

---

## Responsive Text Alignment

### Mobile-First Approach

```html
<!-- 
  Mobile: Left aligned
  Tablet (≥768px): Center aligned
  Desktop (≥992px): Right aligned
-->
<p class="text-start text-md-center text-lg-end">
  Responsive text alignment
</p>
```

### Different Alignment per Breakpoint

```html
<!-- Start centered on mobile, left on desktop -->
<div class="text-center text-lg-start">
  <h2>Responsive Heading</h2>
  <p>Mobile: centered, Desktop: left aligned</p>
</div>

<!-- Navigation item alignment -->
<div class="text-center text-md-end">
  <a href="#">Contact</a>
</div>

<!-- Footer content alignment -->
<footer class="text-center text-lg-start">
  <div class="row">
    <div class="col-md-3">
      <h5 class="text-center text-md-start">Company</h5>
    </div>
  </div>
</footer>
```

### Complex Responsive Layout

```html
<!-- Grid layout with responsive alignment -->
<div class="container">
  <div class="row">
    <!-- Left column: left aligned on mobile, right aligned on desktop -->
    <div class="col-md-6 text-center text-md-start">
      <h3>Left Section</h3>
      <p>Left aligned on medium screens and up</p>
    </div>
    
    <!-- Right column: right aligned on mobile, left aligned on desktop -->
    <div class="col-md-6 text-center text-md-end">
      <h3>Right Section</h3>
      <p>Right aligned on mobile, left aligned on desktop</p>
    </div>
  </div>
</div>
```

---

## Real-World Practical Examples

### Hero Section with Centered Content

```html
<section class="hero bg-dark text-white py-5">
  <div class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h1 class="display-2">Welcome to Our Platform</h1>
        <p class="lead">Build amazing things with Bootstrap</p>
        <button class="btn btn-primary btn-lg">Get Started</button>
      </div>
    </div>
  </div>
</section>
```

### Contact Page with Centered Form

```html
<section class="contact py-5">
  <div class="container">
    <h2 class="text-center mb-4">Contact Us</h2>
    <div class="row justify-content-center">
      <div class="col-md-6">
        <form class="text-start">
          <div class="mb-3">
            <label for="name" class="form-label">Full Name</label>
            <input type="text" class="form-control" id="name">
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email">
          </div>
          <div class="text-center">
            <button type="submit" class="btn btn-primary">Send</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
```

### Card with Different Alignments

```html
<div class="card">
  <!-- Left aligned header -->
  <div class="card-header text-start">
    <h5 class="card-title">Card Header</h5>
  </div>
  
  <!-- Centered body -->
  <div class="card-body text-center">
    <p class="card-text">This is the card body content</p>
    <button class="btn btn-primary">Learn More</button>
  </div>
  
  <!-- Right aligned footer -->
  <div class="card-footer text-end">
    <small class="text-muted">Last updated 3 mins ago</small>
  </div>
</div>
```

### Blog Post Layout

```html
<article class="py-5">
  <div class="container">
    <!-- Centered title -->
    <h1 class="text-center mb-2">How to Master Bootstrap</h1>
    
    <!-- Centered metadata -->
    <div class="text-center text-muted mb-4">
      <p>Published on January 29, 2026 | By John Doe</p>
    </div>
    
    <!-- Left aligned content -->
    <div class="row">
      <div class="col-lg-8 mx-auto text-justify">
        <p>Article content here...</p>
      </div>
    </div>
    
    <!-- Centered related posts -->
    <div class="text-center mt-5">
      <h3>Related Posts</h3>
    </div>
  </div>
</article>
```

### Testimonial Section

```html
<section class="testimonials bg-light py-5">
  <div class="container">
    <h2 class="text-center mb-5">What Our Clients Say</h2>
    
    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <p class="card-text">"Great service and support!"</p>
            <p class="fw-bold">Sarah Johnson</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <p class="card-text">"Highly recommended for everyone"</p>
            <p class="fw-bold">Mike Chen</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <p class="card-text">"Best investment I've made"</p>
            <p class="fw-bold">Emma Davis</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Footer with Different Alignments

```html
<footer class="bg-dark text-white py-5">
  <div class="container">
    <div class="row">
      <!-- Left aligned column -->
      <div class="col-md-3 mb-4 text-start">
        <h5>Company</h5>
        <ul class="list-unstyled">
          <li><a href="#">About</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Careers</a></li>
        </ul>
      </div>
      
      <!-- Center aligned column -->
      <div class="col-md-3 mb-4 text-center">
        <h5>Support</h5>
        <ul class="list-unstyled">
          <li><a href="#">Help Center</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Status</a></li>
        </ul>
      </div>
      
      <!-- Right aligned column -->
      <div class="col-md-3 mb-4 text-end">
        <h5>Legal</h5>
        <ul class="list-unstyled">
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li><a href="#">License</a></li>
        </ul>
      </div>
    </div>
    
    <!-- Centered copyright -->
    <hr>
    <p class="text-center text-muted">
      &copy; 2026 Company Name. All rights reserved.
    </p>
  </div>
</footer>
```

### Navigation Bar Items

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container">
    <!-- Left aligned brand -->
    <a class="navbar-brand text-start" href="#">Brand</a>
    
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
            data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <!-- Right aligned nav items -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto text-end">
        <li class="nav-item">
          <a class="nav-link" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">About</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Contact</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### Table with Aligned Content

```html
<table class="table">
  <thead>
    <tr>
      <th class="text-start">Product</th>
      <th class="text-center">Quantity</th>
      <th class="text-end">Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-start">Widget A</td>
      <td class="text-center">5</td>
      <td class="text-end">$50.00</td>
    </tr>
    <tr>
      <td class="text-start">Widget B</td>
      <td class="text-center">10</td>
      <td class="text-end">$100.00</td>
    </tr>
  </tbody>
</table>
```

### Modal Dialog

```html
<div class="modal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <!-- Left aligned header -->
      <div class="modal-header text-start">
        <h5 class="modal-title">Dialog Title</h5>
        <button type="button" class="btn-close"></button>
      </div>
      
      <!-- Centered body -->
      <div class="modal-body text-center">
        <p>Are you sure you want to proceed?</p>
      </div>
      
      <!-- Right aligned footer -->
      <div class="modal-footer text-end">
        <button type="button" class="btn btn-secondary">Cancel</button>
        <button type="button" class="btn btn-primary">Confirm</button>
      </div>
    </div>
  </div>
</div>
```

---

## Text Alignment with Other Utilities

### Combining with Text Color

```html
<!-- Red text, center aligned -->
<p class="text-center text-danger">Error Message</p>

<!-- Green text, right aligned -->
<p class="text-end text-success">Success Notification</p>

<!-- Blue text, left aligned -->
<p class="text-start text-primary">Information</p>

<!-- Muted gray text, center aligned -->
<p class="text-center text-muted">Secondary text</p>
```

### Combining with Font Weight

```html
<!-- Bold text, center aligned -->
<p class="text-center fw-bold">Bold centered text</p>

<!-- Light text, right aligned -->
<p class="text-end fw-light">Light right-aligned text</p>

<!-- Normal weight, justified -->
<p class="text-justify fw-normal">Justified text</p>
```

### Combining with Font Style

```html
<!-- Italic text, center aligned -->
<p class="text-center fst-italic">Italic centered text</p>

<!-- Normal style, left aligned -->
<p class="text-start fst-normal">Normal left-aligned text</p>
```

### Combining with Text Decoration

```html
<!-- Underlined text, center aligned -->
<p class="text-center text-decoration-underline">Underlined text</p>

<!-- Strike-through text, right aligned -->
<p class="text-end text-decoration-line-through">Strike-through</p>

<!-- No decoration, justified -->
<p class="text-justify text-decoration-none">No decoration</p>
```

### Combining with Text Transform

```html
<!-- Uppercase, center aligned -->
<p class="text-center text-uppercase">All caps text</p>

<!-- Lowercase, left aligned -->
<p class="text-start text-lowercase">all lowercase text</p>

<!-- Capitalize, right aligned -->
<p class="text-end text-capitalize">Capitalize Each Word</p>
```

### Combining with Opacity

```html
<!-- 75% opacity, center aligned -->
<p class="text-center text-opacity-75">Slightly transparent text</p>

<!-- 50% opacity, right aligned -->
<p class="text-end text-opacity-50">More transparent text</p>

<!-- 25% opacity, left aligned -->
<p class="text-start text-opacity-25">Very transparent text</p>
```

---

## CSS Properties

### Text Alignment CSS

```css
/* Basic CSS behind Bootstrap classes */
.text-start {
  text-align: left !important;
}

.text-center {
  text-align: center !important;
}

.text-end {
  text-align: right !important;
}

.text-justify {
  text-align: justify !important;
}
```

### Responsive CSS Variables (NEW in Bootstrap 5.3+)

Bootstrap 5.3+ uses CSS custom properties for better customization:

```css
/* CSS custom properties for text alignment */
:root {
  --bs-text-align-start: left;
  --bs-text-align-center: center;
  --bs-text-align-end: right;
  --bs-text-align-justify: justify;
}
```

### Custom Text Alignment

```css
/* Override text alignment globally */
:root {
  --bs-text-align-default: center;
}

/* Custom class for justified text with hyphenation */
.text-justify-hyphenated {
  text-align: justify;
  hyphens: auto;
  word-break: break-word;
}

/* Centered text with letter spacing */
.text-centered-spaced {
  text-align: center;
  letter-spacing: 0.05em;
}
```

---

## Accessibility Guidelines

### Best Practices for Text Alignment

✅ **DO:**
- Use left alignment for body text (most readable)
- Use center alignment for headings and titles
- Use justified text sparingly (can be hard to read)
- Consider language direction (RTL languages)
- Test alignment on all devices
- Ensure sufficient line height with justified text
- Use hyphens for justified text (improves readability)
- Always test with screen readers

❌ **DON'T:**
- Don't use center or right alignment for long paragraphs
- Don't justify text on narrow screens (mobile)
- Don't ignore line-height with justified text
- Don't use justified text with short lines
- Don't force alignment that hurts readability
- Don't ignore responsive breakpoints
- Don't use alignment to create pseudo-buttons
- Don't forget about text contrast with colors

### Readability Considerations

```html
<!-- Good: Left aligned body text with proper line-height -->
<p class="text-start" style="line-height: 1.6;">
  Left-aligned text is the most readable for long content. 
  Use this for paragraphs, articles, and main body text.
</p>

<!-- Good: Centered titles/headings -->
<h2 class="text-center">Centered Heading</h2>

<!-- Acceptable: Justified text with hyphens (desktop only) -->
<p class="text-justify" style="hyphens: auto;">
  Justified text can look professional but is harder to read. 
  Use only for wide screens and enable hyphens for better breaks.
</p>

<!-- Bad: Right-aligned body text (hard to read) -->
<p class="text-end">
  Right-aligned text is difficult to read for long content. 
  Only use for specific design purposes like RTL languages.
</p>
```

---

## Dark Mode Support (NEW in Bootstrap 5.3+)

### Text Alignment in Dark Mode

```html
<!-- Enable dark mode -->
<html data-bs-theme="dark" lang="en">
  <body>
    <!-- Text alignment works the same in dark mode -->
    <p class="text-start">Left aligned in dark mode</p>
    <p class="text-center">Center aligned in dark mode</p>
    <p class="text-end">Right aligned in dark mode</p>
  </body>
</html>
```

### Color Adjustments for Dark Mode

```html
<!-- Light text, centered in dark mode -->
<p class="text-center text-light">Light centered text</p>

<!-- Dark text that adjusts for dark mode -->
<p class="text-center text-dark">Dark text (adjusts in dark mode)</p>

<!-- Primary color, centered (adjusts in dark mode) -->
<p class="text-center text-primary">Primary color text</p>
```

---

## Responsive Design Patterns

### Mobile-First Design Pattern

```html
<!-- 
  Default (mobile): Centered
  Medium screens (≥768px): Left aligned
  Large screens (≥992px): Right aligned
-->
<div class="text-center text-md-start text-lg-end">
  <p>Responsive alignment example</p>
</div>
```

### Adaptive Navigation Links

```html
<!-- Mobile: Center aligned, Desktop: Right aligned -->
<nav>
  <ul class="text-center text-lg-end">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

### Flexible Grid Content

```html
<div class="container">
  <div class="row">
    <!-- Mobile: centered, Desktop: left aligned -->
    <div class="col-md-6 text-center text-md-start">
      <h3>Left Content</h3>
      <p>This content is centered on mobile...</p>
    </div>
    
    <!-- Mobile: centered, Desktop: right aligned -->
    <div class="col-md-6 text-center text-md-end">
      <h3>Right Content</h3>
      <p>This content is centered on mobile...</p>
    </div>
  </div>
</div>
```

---

## Advanced Text Alignment Techniques

### Combining with Flexbox (via Grid/Flex utilities)

```html
<!-- Centered using flexbox -->
<div class="d-flex justify-content-center align-items-center" style="height: 200px;">
  <div class="text-center">
    <h2>Centered Content</h2>
    <p>Using flexbox for both horizontal and vertical centering</p>
  </div>
</div>

<!-- Left aligned in flex container -->
<div class="d-flex">
  <div class="text-start">
    <p>Left aligned in flex container</p>
  </div>
</div>
```

### Combining with Grid Layout

```html
<!-- Grid layout with text alignment -->
<div class="container">
  <div class="row">
    <div class="col-md-4 text-start">
      <h4>Column 1</h4>
    </div>
    <div class="col-md-4 text-center">
      <h4>Column 2</h4>
    </div>
    <div class="col-md-4 text-end">
      <h4>Column 3</h4>
    </div>
  </div>
</div>
```

### Justified Text with Custom Styling

```html
<!-- Justified text with better readability -->
<div class="text-justify" style="
  hyphens: auto;
  word-break: break-word;
  line-height: 1.8;
  max-width: 600px;
">
  <p>
    Justified text that looks professional while maintaining 
    readability through proper hyphenation and line-height.
  </p>
</div>
```

---

## Browser Support and Compatibility

### Text Alignment Browser Support

| Feature | Chrome | Firefox | Safari | Edge | IE 11 |
|---------|--------|---------|--------|------|-------|
| text-align: left | ✅ | ✅ | ✅ | ✅ | ✅ |
| text-align: center | ✅ | ✅ | ✅ | ✅ | ✅ |
| text-align: right | ✅ | ✅ | ✅ | ✅ | ✅ |
| text-align: justify | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responsive classes | ✅ | ✅ | ✅ | ✅ | ⚠️ |

---

## Common Use Cases and Best Practices

### Use Case 1: Navigation Menu

```html
<!-- Right-aligned navigation items -->
<nav class="navbar navbar-light bg-light">
  <div class="container-fluid">
    <span class="navbar-brand">Logo</span>
    <ul class="nav ms-auto text-end">
      <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Services</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
    </ul>
  </div>
</nav>
```

### Use Case 2: Article/Blog

```html
<!-- Centered article with left-aligned content -->
<article class="container text-center mt-5">
  <h1>Article Title</h1>
  <p class="text-muted">Published on January 29, 2026</p>
  
  <div class="row justify-content-center">
    <div class="col-lg-8 text-start">
      <p>Article content here...</p>
    </div>
  </div>
</article>
```

### Use Case 3: Modal Dialog

```html
<!-- Modal with appropriate text alignment -->
<div class="modal-dialog">
  <div class="modal-content">
    <!-- Title is left-aligned -->
    <div class="modal-header">
      <h5 class="modal-title text-start">Confirm Action</h5>
    </div>
    
    <!-- Message is center-aligned -->
    <div class="modal-body text-center">
      <p>Are you sure you want to continue?</p>
    </div>
    
    <!-- Buttons are right-aligned -->
    <div class="modal-footer text-end">
      <button type="button" class="btn btn-secondary">Cancel</button>
      <button type="button" class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Use Case 4: Call-to-Action Section

```html
<!-- Centered CTA with centered button -->
<section class="bg-primary text-white py-5">
  <div class="container text-center">
    <h2>Ready to Get Started?</h2>
    <p class="lead mb-4">Join thousands of satisfied customers</p>
    <button class="btn btn-light btn-lg">Sign Up Now</button>
  </div>
</section>
```

### Use Case 5: Feature List

```html
<!-- Feature items with varying alignment -->
<section class="py-5">
  <div class="container">
    <h2 class="text-center mb-5">Our Features</h2>
    
    <div class="row">
      <!-- Odd rows left-aligned -->
      <div class="col-md-6 mb-4 text-start">
        <h4>Feature 1</h4>
        <p>Description of feature 1</p>
      </div>
      
      <!-- Even rows right-aligned -->
      <div class="col-md-6 mb-4 text-end">
        <h4>Feature 2</h4>
        <p>Description of feature 2</p>
      </div>
    </div>
  </div>
</section>
```

---

## Bootstrap 5.3+ Improvements vs Bootstrap 4

### What's New in Bootstrap 5.3+

| Feature | Bootstrap 4 | Bootstrap 5.3+ |
|---------|-----------|----------------|
| Basic alignment classes | ✅ Yes | ✅ Yes |
| Responsive alignment | ✅ Limited | ✅ Enhanced |
| CSS variables | ❌ No | ✅ Yes |
| Dark mode support | ❌ No | ✅ Yes |
| Documentation | ✅ Basic | ✅ Comprehensive |
| Performance | ✅ Good | ✅ Better |

### Migration from Bootstrap 4

```html
<!-- Bootstrap 4 (still works in 5.3+) -->
<p class="text-left">Left aligned</p>    <!-- Deprecated -->
<p class="text-center">Center aligned</p>  <!-- Same -->
<p class="text-right">Right aligned</p>   <!-- Deprecated -->

<!-- Bootstrap 5.3+ (recommended) -->
<p class="text-start">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-end">Right aligned</p>
```

---

## Performance Considerations

### CSS File Size Impact
- Text alignment utilities add minimal file size (~1KB)
- Responsive variants add approximately 2-3KB
- Fully gzipped, impact is negligible

### Responsive Design Performance Tips
- Mobile-first approach reduces CSS output
- Use breakpoint-specific classes only when needed
- Minimize unnecessary alignment changes
- Test on actual devices for performance

---

## Complete HTML Example Template

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Text Alignment - Bootstrap 5.3+ Complete Example</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .example-box {
            padding: 20px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            margin-bottom: 20px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
            <a class="navbar-brand" href="#">Text Alignment Demo</a>
            <div class="collapse navbar-collapse ms-auto">
                <ul class="navbar-nav text-end">
                    <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">About</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-dark text-white py-5">
        <div class="container text-center">
            <h1 class="display-3">Text Alignment Guide</h1>
            <p class="lead">Bootstrap 5.3+ Complete Reference</p>
        </div>
    </section>

    <!-- Basic Alignments -->
    <section class="py-5">
        <div class="container">
            <h2 class="text-center mb-5">Basic Text Alignments</h2>
            
            <div class="example-box">
                <p class="text-start"><strong>Left Aligned (text-start)</strong></p>
                <p class="text-start">
                    This is left-aligned text. This is the default and most readable 
                    alignment for body text and paragraphs.
                </p>
            </div>
            
            <div class="example-box">
                <p class="text-center"><strong>Center Aligned (text-center)</strong></p>
                <p class="text-center">
                    This is center-aligned text. Use this for headings, titles, 
                    and other decorative text elements.
                </p>
            </div>
            
            <div class="example-box">
                <p class="text-end"><strong>Right Aligned (text-end)</strong></p>
                <p class="text-end">
                    This is right-aligned text. Use this sparingly for RTL languages 
                    or specific design needs.
                </p>
            </div>
            
            <div class="example-box">
                <p class="text-justify"><strong>Justified (text-justify)</strong></p>
                <p class="text-justify" style="hyphens: auto;">
                    This is justified text. It stretches to fill the entire line width. 
                    Use with caution on narrow screens and enable hyphens for better readability. 
                    Justified text can be harder to read, so use it sparingly for body text.
                </p>
            </div>
        </div>
    </section>

    <!-- Responsive Examples -->
    <section class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5">Responsive Alignment</h2>
            
            <div class="example-box">
                <p class="text-center text-lg-start">
                    <strong>Mobile: Center | Desktop: Left</strong><br>
                    This text is centered on mobile and left-aligned on large screens
                </p>
            </div>
            
            <div class="example-box">
                <p class="text-start text-lg-center">
                    <strong>Mobile: Left | Desktop: Center</strong><br>
                    This text is left-aligned on mobile and centered on large screens
                </p>
            </div>
            
            <div class="example-box">
                <p class="text-center text-lg-end">
                    <strong>Mobile: Center | Desktop: Right</strong><br>
                    This text is centered on mobile and right-aligned on large screens
                </p>
            </div>
        </div>
    </section>

    <!-- Combined with Other Utilities -->
    <section class="py-5">
        <div class="container">
            <h2 class="text-center mb-5">Combined with Other Utilities</h2>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="text-center text-primary fw-bold">
                            Bold, Colored, Centered
                        </p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="text-end text-success fst-italic">
                            Italic, Colored, Right-aligned
                        </p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="text-center text-uppercase text-danger fw-bold">
                            Uppercase, Colored, Bold, Centered
                        </p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="example-box">
                        <p class="text-start text-capitalize text-info">
                            Capitalize Words And Left Align
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container">
            <div class="row">
                <div class="col-md-4 text-start">
                    <h5>Company</h5>
                    <p>Left-aligned footer section</p>
                </div>
                <div class="col-md-4 text-center">
                    <h5>Support</h5>
                    <p>Center-aligned footer section</p>
                </div>
                <div class="col-md-4 text-end">
                    <h5>Legal</h5>
                    <p>Right-aligned footer section</p>
                </div>
            </div>
            <hr>
            <p class="text-center text-muted">
                &copy; 2026 Bootstrap Text Alignment Guide
            </p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Breakpoint Reference Table

### Complete Responsive Alignment Classes

```
No Breakpoint (Mobile First):
  .text-start       → text-align: left
  .text-center      → text-align: center
  .text-end         → text-align: right
  .text-justify     → text-align: justify

Small (≥576px):
  .text-sm-start    → text-align: left
  .text-sm-center   → text-align: center
  .text-sm-end      → text-align: right
  .text-sm-justify  → text-align: justify

Medium (≥768px):
  .text-md-start    → text-align: left
  .text-md-center   → text-align: center
  .text-md-end      → text-align: right
  .text-md-justify  → text-align: justify

Large (≥992px):
  .text-lg-start    → text-align: left
  .text-lg-center   → text-align: center
  .text-lg-end      → text-align: right
  .text-lg-justify  → text-align: justify

Extra Large (≥1200px):
  .text-xl-start    → text-align: left
  .text-xl-center   → text-align: center
  .text-xl-end      → text-align: right
  .text-xl-justify  → text-align: justify

XXL (≥1400px):
  .text-xxl-start   → text-align: left
  .text-xxl-center  → text-align: center
  .text-xxl-end     → text-align: right
  .text-xxl-justify → text-align: justify
```

---

## Resources and References

### Official Bootstrap Documentation
- **Text Alignment Docs**: https://getbootstrap.com/docs/5.3/utilities/text/#text-alignment
- **Utilities Documentation**: https://getbootstrap.com/docs/5.3/utilities/
- **CSS Variables**: https://getbootstrap.com/docs/5.3/customize/css-variables/

### Typography Resources
- **CSS text-align**: https://developer.mozilla.org/en-US/docs/Web/CSS/text-align
- **WCAG Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/
- **Typography Best Practices**: https://www.smashingmagazine.com/

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

### Key Points about Text Alignment

1. **4 Alignment Options**: Start (left), center, end (right), justify
2. **Fully Responsive**: Different alignment at different breakpoints
3. **Simple Syntax**: Easy-to-remember class names
4. **Mobile-First**: Base classes apply to all sizes, then override with breakpoints
5. **Combines Well**: Works with color, weight, style, and other utilities
6. **Accessible**: When used properly, maintains good readability
7. **RTL Support**: Works with right-to-left languages
8. **Dark Mode**: Automatic adjustment in dark mode theme

### Best Practices Recap

✅ Use left alignment for body text (most readable)  
✅ Use center alignment for headings and titles  
✅ Use right alignment for specific layouts or RTL languages  
✅ Use justified text sparingly with proper hyphenation  
✅ Always test on mobile devices  
✅ Maintain sufficient line height with justified text  
✅ Consider accessibility requirements  
✅ Use responsive classes for different screen sizes  

### Common Pitfalls to Avoid

❌ Don't center align long paragraphs (hard to read)  
❌ Don't justify text on narrow screens  
❌ Don't ignore responsive design  
❌ Don't forget about line-height with justified text  
❌ Don't use alignment for non-semantic positioning  
❌ Don't ignore color contrast when combining with colors  
❌ Don't forget accessibility considerations  

Text alignment is a fundamental typography utility that, when used correctly, greatly improves the visual structure and readability of your website!