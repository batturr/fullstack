# BOOTSTRAP 5.3+ DISPLAY HEADINGS - COMPREHENSIVE GUIDE

## Overview

Display headings are specialized heading classes in Bootstrap used to create large, prominent text elements with thin weight and increased font size. They're perfect for hero sections, landing pages, and attention-grabbing headlines.

### Key Features
- **Large, readable typography** - Designed for visual hierarchy
- **Thin font weight** (300) - Modern, elegant appearance
- **Multiple size options** - 6 responsive display classes
- **Responsive design** - Automatically scales on mobile devices
- **NEW in Bootstrap 5.3+** - Enhanced CSS variable support, improved typography system
- **Accessibility compliant** - WCAG AA/AAA standards

---

## Display Heading Classes Reference

Bootstrap provides 6 display heading classes (display-1 through display-6):

### Complete Class List with Details

| Class | Font Size (Desktop) | Font Size (Mobile) | Font Weight | Line Height | Use Case |
|-------|-------------------|--------------------|------------|------------|----------|
| `.display-1` | 5.5rem (88px) | 3.5rem (56px) | 300 | 1.2 | Hero titles, main headlines |
| `.display-2` | 4.5rem (72px) | 3rem (48px) | 300 | 1.2 | Section headers, featured content |
| `.display-3` | 3.5rem (56px) | 2.5rem (40px) | 300 | 1.2 | Major section titles |
| `.display-4` | 2.5rem (40px) | 2rem (32px) | 300 | 1.2 | Subsection titles |
| `.display-5` | 2rem (32px) | 1.5rem (24px) | 400 | 1.2 | Sub-headings, card titles |
| `.display-6` | 1.5rem (24px) | 1.25rem (20px) | 400 | 1.2 | Emphasized text, highlights |

### Key Characteristics
- **Font-weight**: 300 (light/thin) for display-1 to display-4; 400 (normal) for display-5 and display-6
- **Line-height**: Consistent 1.2 across all sizes for balanced spacing
- **Responsive**: All sizes automatically adjust on smaller viewports
- **Letter-spacing**: Optimized for readability at large sizes
- **Color inheritance**: Inherits text color from parent element (support for text color utilities)

---

## CSS Properties

### Display Heading CSS Variables (NEW in Bootstrap 5.3+)

All display headings use CSS custom properties for easy customization:

```css
--bs-display1-size: 5.5rem;
--bs-display1-weight: 300;
--bs-display1-line-height: 1.2;
--bs-display1-letter-spacing: 0;

--bs-display2-size: 4.5rem;
--bs-display2-weight: 300;
--bs-display2-line-height: 1.2;

--bs-display3-size: 3.5rem;
--bs-display3-weight: 300;
--bs-display3-line-height: 1.2;

--bs-display4-size: 2.5rem;
--bs-display4-weight: 300;
--bs-display4-line-height: 1.2;

--bs-display5-size: 2rem;
--bs-display5-weight: 400;
--bs-display5-line-height: 1.2;

--bs-display6-size: 1.5rem;
--bs-display6-weight: 400;
--bs-display6-line-height: 1.2;
```

---

## Basic Syntax Examples

### Simple Display Headings

```html
<!-- Display Heading 1 - Largest -->
<p class="display-1">Welcome to Bootstrap</p>

<!-- Display Heading 2 -->
<p class="display-2">Your Amazing Site</p>

<!-- Display Heading 3 -->
<p class="display-3">Featured Content</p>

<!-- Display Heading 4 -->
<p class="display-4">Important Section</p>

<!-- Display Heading 5 -->
<p class="display-5">Subsection Header</p>

<!-- Display Heading 6 - Smallest Display -->
<p class="display-6">Supporting Text</p>
```

### Display Headings with Color Classes

```html
<!-- Primary color display heading -->
<p class="display-1 text-primary">Primary Headline</p>

<!-- Success color display heading -->
<p class="display-2 text-success">Success Message</p>

<!-- Danger color display heading -->
<p class="display-3 text-danger">Alert Headline</p>

<!-- Warning color display heading -->
<p class="display-4 text-warning">Warning Notice</p>

<!-- Info color display heading -->
<p class="display-5 text-info">Information</p>

<!-- Secondary color display heading -->
<p class="display-6 text-secondary">Supporting Headline</p>
```

### Display Headings with Text Styles

```html
<!-- Bold display heading -->
<p class="display-1 fw-bold">Bold Headline</p>

<!-- Light/thin display heading -->
<p class="display-1 fw-light">Light Headline</p>

<!-- Italic display heading -->
<p class="display-2 fst-italic">Italic Headline</p>

<!-- Underlined display heading -->
<p class="display-3 text-decoration-underline">Underlined Headline</p>

<!-- Uppercase display heading -->
<p class="display-4 text-uppercase">Uppercase Headline</p>

<!-- Lowercase display heading -->
<p class="display-5 text-lowercase">Lowercase Headline</p>

<!-- Centered display heading -->
<p class="display-6 text-center">Centered Headline</p>
```

### Display Headings with Backgrounds

```html
<!-- Display heading with primary background -->
<p class="display-1 bg-primary text-white p-3 rounded">
  Dark Background Headline
</p>

<!-- Display heading with light background -->
<p class="display-2 bg-light text-dark p-3 rounded">
  Light Background Headline
</p>

<!-- Display heading with success background -->
<p class="display-3 bg-success text-white p-3 rounded">
  Success Headline
</p>

<!-- Display heading with danger background -->
<p class="display-4 bg-danger text-white p-3 rounded">
  Danger Headline
</p>

<!-- Display heading with opacity background -->
<p class="display-5 bg-primary bg-opacity-50 text-white p-3">
  Semi-transparent Background
</p>
```

### Display Headings with Spacing

```html
<!-- Display heading with margin bottom -->
<p class="display-1 mb-4">Headline with margin bottom</p>

<!-- Display heading with padding -->
<p class="display-2 p-4">Headline with padding</p>

<!-- Display heading with margins on all sides -->
<p class="display-3 m-5">Headline with all margins</p>

<!-- Display heading with custom spacing -->
<p class="display-4 ps-3 pe-3">Headline with padding sides</p>
```

### Display Headings with Borders

```html
<!-- Display heading with bottom border -->
<p class="display-1 border-bottom pb-3">Headline with border</p>

<!-- Display heading with left border -->
<p class="display-2 border-start ps-3">Headline with left border</p>

<!-- Display heading with full border -->
<p class="display-3 border p-3">Headline with full border</p>

<!-- Display heading with rounded border -->
<p class="display-4 border rounded p-3">Headline with rounded border</p>
```

---

## Real-World Practical Examples

### Hero Section with Display Heading

```html
<section class="bg-dark text-white py-5">
  <div class="container">
    <p class="display-1">Welcome to Our Platform</p>
    <p class="lead mb-4">Build amazing things with Bootstrap</p>
    <button class="btn btn-primary btn-lg">Get Started</button>
  </div>
</section>
```

### Landing Page Hero

```html
<div class="hero-section bg-gradient text-white text-center py-5">
  <div class="container">
    <p class="display-2 mb-3">Revolutionize Your Business</p>
    <p class="display-5 text-opacity-75">Simple, powerful, and scalable solutions</p>
    <div class="mt-4">
      <button class="btn btn-light btn-lg me-2">Learn More</button>
      <button class="btn btn-outline-light btn-lg">Contact Us</button>
    </div>
  </div>
</div>
```

### Featured Content Section

```html
<section class="py-5">
  <div class="container">
    <p class="display-3 text-primary mb-4">Featured Products</p>
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <p class="display-6">Product 1</p>
            <p class="card-text">Description goes here</p>
          </div>
        </div>
      </div>
      <!-- Additional cards -->
    </div>
  </div>
</section>
```

### About Section Header

```html
<section class="py-5 bg-light">
  <div class="container">
    <p class="display-4 text-center mb-4">About Our Company</p>
    <p class="lead text-center">
      Learn more about who we are and what we do
    </p>
    <p class="mt-4">
      Company description and mission statement goes here...
    </p>
  </div>
</section>
```

### Contact Page Header

```html
<div class="py-5 bg-primary text-white">
  <div class="container text-center">
    <p class="display-3 mb-3">Get In Touch</p>
    <p class="display-5 text-opacity-75">We'd love to hear from you</p>
  </div>
</div>
```

### Success/Error Message Display

```html
<!-- Success message with display heading -->
<div class="alert alert-success alert-dismissible fade show" role="alert">
  <p class="display-6 text-success mb-2">✓ Success!</p>
  <p>Your action has been completed successfully.</p>
  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>

<!-- Error message with display heading -->
<div class="alert alert-danger alert-dismissible fade show" role="alert">
  <p class="display-6 text-danger mb-2">✗ Error!</p>
  <p>Something went wrong. Please try again.</p>
  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
```

### Blog Post Header

```html
<article class="py-5">
  <div class="container">
    <p class="display-2">How to Master Bootstrap</p>
    <p class="text-muted">Published on January 29, 2026</p>
    <hr class="my-4">
    <p class="lead">Learn everything you need to know about Bootstrap 5.3+</p>
    <!-- Article content -->
  </div>
</article>
```

### Pricing Page Header

```html
<section class="py-5 text-center bg-light">
  <div class="container">
    <p class="display-3 text-primary mb-3">Simple, Transparent Pricing</p>
    <p class="display-6 text-muted mb-4">Choose the plan that works best for you</p>
  </div>
</section>
```

### Statistics Display

```html
<section class="py-5 bg-dark text-white">
  <div class="container">
    <p class="display-4 text-center mb-5">Our Achievement</p>
    <div class="row text-center">
      <div class="col-md-3">
        <p class="display-3 text-primary">10K+</p>
        <p class="display-6">Happy Users</p>
      </div>
      <div class="col-md-3">
        <p class="display-3 text-success">500+</p>
        <p class="display-6">Projects</p>
      </div>
      <div class="col-md-3">
        <p class="display-3 text-warning">100%</p>
        <p class="display-6">Satisfaction</p>
      </div>
      <div class="col-md-3">
        <p class="display-3 text-info">24/7</p>
        <p class="display-6">Support</p>
      </div>
    </div>
  </div>
</section>
```

### Testimonial Section

```html
<section class="py-5">
  <div class="container">
    <p class="display-4 text-center mb-5">What Our Clients Say</p>
    <div class="row">
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <p class="display-6 text-primary">John Doe</p>
            <p class="card-text">
              "Best solution we've ever used. Highly recommended!"
            </p>
          </div>
        </div>
      </div>
      <!-- Additional testimonials -->
    </div>
  </div>
</section>
```

---

## Combining Display Headings with Other Elements

### With Subtitle (Lead Text)

```html
<div class="container py-5">
  <p class="display-2">Main Headline</p>
  <p class="lead">This is a supporting subtitle with the lead class</p>
  <hr>
  <p>Regular paragraph content goes here...</p>
</div>
```

### With Navigation

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="#">
      <p class="display-6 mb-0">Brand</p>
    </a>
    <button class="navbar-toggler" type="button">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">About</a></li>
      </ul>
    </div>
  </div>
</nav>
```

### With Cards

```html
<div class="container py-5">
  <p class="display-3 mb-4">Our Services</p>
  <div class="row">
    <div class="col-md-4">
      <div class="card h-100">
        <div class="card-body">
          <p class="display-6 card-title">Service 1</p>
          <p class="card-text">Description of the service</p>
        </div>
      </div>
    </div>
    <!-- Additional cards -->
  </div>
</div>
```

### With Forms

```html
<div class="container py-5">
  <p class="display-3 text-center mb-4">Contact Us</p>
  <form class="row g-3">
    <div class="col-12">
      <label for="name" class="form-label">Full Name</label>
      <input type="text" class="form-control" id="name">
    </div>
    <div class="col-12">
      <label for="email" class="form-label">Email</label>
      <input type="email" class="form-control" id="email">
    </div>
    <div class="col-12">
      <button type="submit" class="btn btn-primary">Send Message</button>
    </div>
  </form>
</div>
```

---

## Responsive Behavior

### How Display Headings Scale

Display headings automatically adjust their font size based on viewport width:

| Class | Desktop (≥576px) | Tablet (576px-992px) | Mobile (<576px) |
|-------|-----------------|---------------------|-----------------|
| display-1 | 5.5rem (88px) | 4.5rem (72px) | 3.5rem (56px) |
| display-2 | 4.5rem (72px) | 3.5rem (56px) | 3rem (48px) |
| display-3 | 3.5rem (56px) | 3rem (48px) | 2.5rem (40px) |
| display-4 | 2.5rem (40px) | 2.25rem (36px) | 2rem (32px) |
| display-5 | 2rem (32px) | 1.75rem (28px) | 1.5rem (24px) |
| display-6 | 1.5rem (24px) | 1.375rem (22px) | 1.25rem (20px) |

### Mobile-First Approach

Always test display headings on mobile devices to ensure readability:

```html
<!-- Single display heading adapts to screen size -->
<p class="display-1">Responsive Headline</p>

<!-- This will automatically resize based on viewport -->
<!-- No additional media queries needed! -->
```

---

## Accessibility Guidelines

### Best Practices for Accessible Display Headings

✅ **DO:**
- Use `<p>`, `<h1>`, `<h2>`, `<h3>` tags semantically
- Maintain logical heading hierarchy
- Combine with supporting text when needed
- Use sufficient color contrast (4.5:1 minimum)
- Test with screen readers
- Ensure responsive scaling works
- Use meaningful text content
- Combine colors with icons/text for meaning

❌ **DON'T:**
- Rely on display headings for semantic meaning
- Use display headings for all text
- Skip logical heading levels
- Ignore contrast requirements
- Use very light colors on light backgrounds
- Make text too small on mobile
- Use display headings for decorative text
- Ignore accessibility standards

### Semantic HTML Structure

```html
<!-- Correct: Using heading tags -->
<h1 class="display-1">Main Page Title</h1>
<h2 class="display-2">Section Heading</h2>
<h3 class="display-3">Subsection</h3>

<!-- Also acceptable: Using paragraph for styling only -->
<p class="display-1" role="heading" aria-level="1">Styled Heading</p>
```

### Color Contrast Examples

```html
<!-- Good contrast: Dark text on light background -->
<p class="display-2 text-dark bg-light p-3">Good Contrast</p>

<!-- Good contrast: Light text on dark background -->
<p class="display-3 text-white bg-dark p-3">Good Contrast</p>

<!-- Poor contrast: Avoid -->
<p class="display-4 text-light bg-light p-3">Poor Contrast - AVOID</p>
```

---

## Dark Mode Support (NEW in Bootstrap 5.3+)

### Display Headings in Dark Mode

Display headings automatically adapt colors in dark mode:

```html
<!-- Enable dark mode on document -->
<html data-bs-theme="dark" lang="en">
  <body>
    <!-- Text colors automatically adjust for visibility -->
    <p class="display-1">Dark Mode Text</p>
    <p class="display-2 text-primary">Primary in Dark Mode</p>
    <p class="display-3 text-danger">Danger in Dark Mode</p>
  </body>
</html>
```

### Color Behavior in Dark Mode

| Light Mode | Dark Mode | Result |
|-----------|-----------|--------|
| text-dark | Automatic | Light gray on dark background |
| text-light | Automatic | Dark gray on light background |
| text-primary | Adjusted | Lighter blue on dark background |
| text-white | Adjusted | Light gray on dark background |

---

## Customizing Display Headings

### Override CSS Variables

```css
/* Custom display heading sizes */
:root {
  --bs-display1-size: 6rem;      /* Larger display-1 */
  --bs-display1-weight: 400;     /* Heavier weight */
  --bs-display2-size: 5rem;      /* Larger display-2 */
  --bs-display3-size: 4rem;      /* Larger display-3 */
}
```

### Custom Font Families

```css
/* Apply custom font to display headings */
:root {
  --bs-heading-font-family: 'Playfair Display', serif;
}

.display-1, .display-2, .display-3,
.display-4, .display-5, .display-6 {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}
```

### Custom Spacing

```css
/* Add extra spacing to display headings */
.display-1, .display-2, .display-3 {
  margin-bottom: 2rem;
  letter-spacing: 0.05em;
}
```

### Animation with Display Headings

```html
<!-- Display heading with fade-in animation -->
<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .display-animated {
    animation: fadeIn 1s ease-in;
  }
</style>

<p class="display-1 display-animated">Animated Headline</p>
```

---

## Bootstrap 5.3+ Improvements

### What's New vs Bootstrap 4

| Feature | Bootstrap 4 | Bootstrap 5.3+ |
|---------|-----------|----------------|
| Display classes | display-1 to display-4 | display-1 to display-6 |
| CSS variables | No | ✅ Yes |
| Dark mode support | No | ✅ Yes |
| Responsive scaling | Limited | ✅ Enhanced |
| Font weight options | Limited | ✅ More control |
| Line height control | Fixed | ✅ Customizable |
| Letter spacing | No | ✅ Available |

### Migration Notes from Bootstrap 4

```html
<!-- Bootstrap 4 -->
<h1 class="display-1">Bootstrap 4 Style</h1>

<!-- Bootstrap 5.3+ (same syntax, enhanced features) -->
<h1 class="display-1">Bootstrap 5.3+ Style</h1>

<!-- NEW in Bootstrap 5.3+ -->
<h1 class="display-5">New display-5</h1>
<h1 class="display-6">New display-6</h1>
```

---

## Typography Utilities to Combine with Display Headings

### Font Weight Utilities

```html
<!-- Change font weight -->
<p class="display-1 fw-bold">Bold display heading</p>
<p class="display-2 fw-bolder">Bolder display heading</p>
<p class="display-3 fw-normal">Normal weight</p>
<p class="display-4 fw-light">Light weight</p>
<p class="display-5 fw-lighter">Lighter weight</p>
```

### Font Style Utilities

```html
<!-- Italic style -->
<p class="display-1 fst-italic">Italic display heading</p>

<!-- Normal/upright style -->
<p class="display-2 fst-normal">Normal style</p>
```

### Text Decoration Utilities

```html
<!-- Underline -->
<p class="display-1 text-decoration-underline">Underlined</p>

<!-- Line through -->
<p class="display-2 text-decoration-line-through">Strikethrough</p>

<!-- No decoration -->
<p class="display-3 text-decoration-none">No decoration</p>
```

### Text Transform Utilities

```html
<!-- Uppercase -->
<p class="display-1 text-uppercase">All Caps</p>

<!-- Lowercase -->
<p class="display-2 text-lowercase">all lowercase</p>

<!-- Capitalize -->
<p class="display-3 text-capitalize">Capitalize Words</p>
```

### Text Alignment Utilities

```html
<!-- Left align (default) -->
<p class="display-1">Left aligned</p>

<!-- Center align -->
<p class="display-2 text-center">Center aligned</p>

<!-- Right align -->
<p class="display-3 text-end">Right aligned</p>

<!-- Justified -->
<p class="display-4 text-justify">Justified text</p>
```

---

## Complete HTML Example Template

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Display Headings - Bootstrap 5.3+ Complete Example</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
        <div class="container">
            <p class="display-1">Display Headings</p>
            <p class="lead">All sizes and combinations</p>
        </div>
    </section>

    <!-- All Display Sizes -->
    <section class="section">
        <div class="container">
            <p class="display-3 mb-5">All Display Heading Sizes</p>
            
            <p class="display-1">Display 1</p>
            <p class="text-muted mb-4">5.5rem (88px) - Use for hero titles</p>
            
            <p class="display-2">Display 2</p>
            <p class="text-muted mb-4">4.5rem (72px) - Section headers</p>
            
            <p class="display-3">Display 3</p>
            <p class="text-muted mb-4">3.5rem (56px) - Major sections</p>
            
            <p class="display-4">Display 4</p>
            <p class="text-muted mb-4">2.5rem (40px) - Subsection titles</p>
            
            <p class="display-5">Display 5</p>
            <p class="text-muted mb-4">2rem (32px) - Sub-headings</p>
            
            <p class="display-6">Display 6</p>
            <p class="text-muted">1.5rem (24px) - Highlights</p>
        </div>
    </section>

    <!-- Colored Display Headings -->
    <section class="section bg-light">
        <div class="container">
            <p class="display-3 mb-4">Display Headings with Colors</p>
            
            <p class="display-4 text-primary">Primary Color</p>
            <p class="display-5 text-success">Success Color</p>
            <p class="display-5 text-danger">Danger Color</p>
            <p class="display-5 text-warning">Warning Color</p>
            <p class="display-5 text-info">Info Color</p>
        </div>
    </section>

    <!-- Display Headings with Backgrounds -->
    <section class="section">
        <div class="container">
            <p class="display-3 mb-4">Display Headings with Backgrounds</p>
            
            <p class="display-4 bg-primary text-white p-3 rounded mb-3">
                Primary Background
            </p>
            <p class="display-5 bg-success text-white p-3 rounded mb-3">
                Success Background
            </p>
            <p class="display-5 bg-danger text-white p-3 rounded mb-3">
                Danger Background
            </p>
            <p class="display-5 bg-warning p-3 rounded">
                Warning Background
            </p>
        </div>
    </section>

    <!-- Combined with Other Elements -->
    <section class="section bg-light">
        <div class="container">
            <p class="display-3 mb-4">Combined with Other Elements</p>
            
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <p class="display-6 card-title text-primary">Card Title</p>
                            <p class="card-text">Card content with display heading</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <p class="display-6 card-title text-success">Feature</p>
                            <p class="card-text">Another card with display heading</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <p class="display-6 card-title text-info">Service</p>
                            <p class="card-text">Third card with display heading</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p class="display-6 mb-2">Display Headings Guide</p>
            <p class="text-muted">Bootstrap 5.3+ - Complete Reference</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Common Use Cases and Patterns

### Pattern 1: Hero Landing Page

```html
<section class="hero-landing bg-gradient-primary text-white py-5 text-center">
  <div class="container">
    <p class="display-1 mb-3 fw-bold">Transform Your Business</p>
    <p class="display-5 mb-4 text-opacity-75">Powerful solutions for modern challenges</p>
    <div>
      <button class="btn btn-light btn-lg me-2">Start Free Trial</button>
      <button class="btn btn-outline-light btn-lg">Learn More</button>
    </div>
  </div>
</section>
```

### Pattern 2: Feature Section

```html
<section class="py-5">
  <div class="container">
    <p class="display-3 text-center mb-5">Key Features</p>
    <div class="row">
      <div class="col-md-4 text-center mb-4">
        <p class="display-6 text-primary">⚡ Fast</p>
        <p>Lightning-fast performance</p>
      </div>
      <div class="col-md-4 text-center mb-4">
        <p class="display-6 text-success">🔒 Secure</p>
        <p>Enterprise-grade security</p>
      </div>
      <div class="col-md-4 text-center mb-4">
        <p class="display-6 text-info">📱 Responsive</p>
        <p>Works on all devices</p>
      </div>
    </div>
  </div>
</section>
```

### Pattern 3: Statistics/Metrics

```html
<section class="bg-dark text-white py-5">
  <div class="container">
    <p class="display-3 text-center mb-5">Our Impact</p>
    <div class="row text-center">
      <div class="col-md-3 mb-4">
        <p class="display-3 text-primary">1M+</p>
        <p class="display-6 text-muted">Users</p>
      </div>
      <div class="col-md-3 mb-4">
        <p class="display-3 text-success">10B+</p>
        <p class="display-6 text-muted">Transactions</p>
      </div>
      <div class="col-md-3 mb-4">
        <p class="display-3 text-warning">99.9%</p>
        <p class="display-6 text-muted">Uptime</p>
      </div>
      <div class="col-md-3 mb-4">
        <p class="display-3 text-info">24/7</p>
        <p class="display-6 text-muted">Support</p>
      </div>
    </div>
  </div>
</section>
```

---

## Performance Considerations

### Font Loading
- Display headings use system fonts by default - no additional font files needed
- Consider using `font-display: swap` if adding custom fonts

### Responsive Design Tips
- Always test display headings on mobile devices
- Font sizes automatically scale - no media queries needed
- Consider the mobile viewport for large headlines
- Use padding/margin utilities for proper spacing

### Accessibility Checks
✅ Validate heading hierarchy  
✅ Check color contrast ratios (WCAG AA 4.5:1 minimum)  
✅ Test with screen readers  
✅ Ensure semantic HTML structure  
✅ Test in dark mode  

---

## Resources and References

### Official Bootstrap Documentation
- **Display Headings Docs**: https://getbootstrap.com/docs/5.3/content/typography/#display-headings
- **Typography Overview**: https://getbootstrap.com/docs/5.3/content/typography/
- **CSS Variables**: https://getbootstrap.com/docs/5.3/customize/css-variables/
- **Utilities**: https://getbootstrap.com/docs/5.3/utilities/

### Accessibility Resources
- **WCAG Color Contrast**: https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Bootstrap Accessibility**: https://getbootstrap.com/docs/5.3/getting-started/accessibility/

### CDN Links (Bootstrap 5.3.2)

**CSS:**
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
```

**JavaScript:**
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

**Icons (optional):**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
```

---

## Summary

### Key Points about Display Headings

1. **6 Size Options**: display-1 through display-6 for different hierarchy levels
2. **Responsive by Default**: Automatically scales for mobile, tablet, and desktop
3. **Modern Typography**: Thin font weight (300) for elegant appearance
4. **CSS Variables**: All properties customizable via custom properties
5. **Dark Mode Support**: Automatic color adjustments in dark mode
6. **Flexible Styling**: Combine with color, background, border, and spacing utilities
7. **Accessible**: Built with WCAG compliance and semantic HTML support
8. **Easy Integration**: Works seamlessly with all Bootstrap components

### Best Practices Recap

✅ Use semantically appropriate heading tags (`<h1>`, `<h2>`, etc.)  
✅ Maintain logical heading hierarchy  
✅ Ensure sufficient color contrast  
✅ Test responsiveness on all devices  
✅ Combine with supporting text when needed  
✅ Use dark mode for modern websites  
✅ Follow WCAG accessibility guidelines  
✅ Consider custom fonts only when necessary  

Display headings are powerful tools for creating visual hierarchy and establishing design direction. Use them strategically for maximum impact!