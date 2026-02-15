# Sass Customization in Bootstrap 5

## Overview
Bootstrap 5 is built with Sass, providing powerful customization capabilities. You can override variables, import only what you need, and create custom builds.

## Setup

### Installation

```bash
npm install bootstrap@5.3.2 sass
```

### Project Structure

```
project/
├── scss/
│   ├── custom.scss
│   └── _variables.scss
├── css/
│   └── style.css (generated)
├── node_modules/
│   └── bootstrap/
└── package.json
```

## Basic Customization

### Method 1: Override Variables

Create `custom.scss`:

```scss
// 1. Include functions first (required)
@import "../node_modules/bootstrap/scss/functions";

// 2. Override default variables
$primary: #6f42c1;
$secondary: #fd7e14;
$success: #20c997;
$info: #17a2b8;
$warning: #ffc107;
$danger: #dc3545;

$font-family-base: 'Inter', sans-serif;
$font-size-base: 1rem;
$line-height-base: 1.6;

$border-radius: 0.5rem;
$border-radius-sm: 0.25rem;
$border-radius-lg: 1rem;

// 3. Include required Bootstrap files
@import "../node_modules/bootstrap/scss/variables";
@import "../node_modules/bootstrap/scss/variables-dark";
@import "../node_modules/bootstrap/scss/maps";
@import "../node_modules/bootstrap/scss/mixins";
@import "../node_modules/bootstrap/scss/root";

// 4. Include optional Bootstrap components
@import "../node_modules/bootstrap/scss/utilities";
@import "../node_modules/bootstrap/scss/reboot";
@import "../node_modules/bootstrap/scss/type";
@import "../node_modules/bootstrap/scss/containers";
@import "../node_modules/bootstrap/scss/grid";
@import "../node_modules/bootstrap/scss/buttons";
@import "../node_modules/bootstrap/scss/forms";
@import "../node_modules/bootstrap/scss/navbar";
@import "../node_modules/bootstrap/scss/card";
// Add more components as needed

// 5. Include utilities API last
@import "../node_modules/bootstrap/scss/utilities/api";
```

### Method 2: Include Everything

```scss
// Override variables
$primary: #6f42c1;
$secondary: #fd7e14;

// Import all of Bootstrap
@import "../node_modules/bootstrap/scss/bootstrap";
```

## Common Variable Customizations

### Colors

```scss
// Theme colors
$primary: #0d6efd;
$secondary: #6c757d;
$success: #198754;
$danger: #dc3545;
$warning: #ffc107;
$info: #0dcaf0;
$light: #f8f9fa;
$dark: #212529;

// Add custom colors
$custom-colors: (
  "purple": #6f42c1,
  "pink": #d63384,
  "teal": #20c997
);

// Merge with theme colors
$theme-colors: map-merge($theme-colors, $custom-colors);
```

### Typography

```scss
// Font families
$font-family-sans-serif: 'Roboto', system-ui, -apple-system, sans-serif;
$font-family-monospace: 'Fira Code', 'Courier New', monospace;
$font-family-base: $font-family-sans-serif;

// Font sizes
$font-size-base: 1rem;
$font-size-sm: $font-size-base * 0.875;
$font-size-lg: $font-size-base * 1.25;

// Headings
$h1-font-size: $font-size-base * 2.5;
$h2-font-size: $font-size-base * 2;
$h3-font-size: $font-size-base * 1.75;
$h4-font-size: $font-size-base * 1.5;
$h5-font-size: $font-size-base * 1.25;
$h6-font-size: $font-size-base;

$headings-font-weight: 700;
$headings-line-height: 1.2;
```

### Spacing

```scss
// Spacer scale
$spacer: 1rem;
$spacers: (
  0: 0,
  1: $spacer * 0.25,   // 0.25rem = 4px
  2: $spacer * 0.5,    // 0.5rem = 8px
  3: $spacer,          // 1rem = 16px
  4: $spacer * 1.5,    // 1.5rem = 24px
  5: $spacer * 3,      // 3rem = 48px
  6: $spacer * 4,      // 4rem = 64px
  7: $spacer * 5       // 5rem = 80px
);
```

### Grid Breakpoints

```scss
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// Container max-widths
$container-max-widths: (
  sm: 540px,
  md: 720px,
  lg: 960px,
  xl: 1140px,
  xxl: 1320px
);
```

### Border Radius

```scss
$border-radius: 0.375rem;
$border-radius-sm: 0.25rem;
$border-radius-lg: 0.5rem;
$border-radius-xl: 1rem;
$border-radius-2xl: 2rem;
$border-radius-pill: 50rem;
```

### Components

#### Buttons

```scss
$btn-padding-y: 0.5rem;
$btn-padding-x: 1rem;
$btn-font-size: 1rem;
$btn-border-radius: 0.375rem;

$btn-padding-y-sm: 0.25rem;
$btn-padding-x-sm: 0.5rem;
$btn-font-size-sm: 0.875rem;

$btn-padding-y-lg: 0.75rem;
$btn-padding-x-lg: 1.5rem;
$btn-font-size-lg: 1.25rem;
```

#### Cards

```scss
$card-spacer-y: 1rem;
$card-spacer-x: 1rem;
$card-border-width: 1px;
$card-border-radius: 0.5rem;
$card-border-color: rgba(0, 0, 0, 0.125);
$card-bg: #fff;
```

#### Navbar

```scss
$navbar-padding-y: 0.5rem;
$navbar-padding-x: 1rem;
$navbar-brand-font-size: 1.25rem;
$navbar-dark-color: rgba(255, 255, 255, 0.75);
$navbar-dark-hover-color: rgba(255, 255, 255, 1);
```

## Custom Theme Example

### Complete Custom Theme

```scss
// custom-theme.scss

// 1. Functions
@import "../node_modules/bootstrap/scss/functions";

// 2. Your custom variables
$primary: #667eea;
$secondary: #764ba2;
$success: #48bb78;
$info: #4299e1;
$warning: #ed8936;
$danger: #f56565;

$body-bg: #f7fafc;
$body-color: #2d3748;

$font-family-sans-serif: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-size-base: 0.95rem;
$line-height-base: 1.6;

$border-radius: 0.5rem;
$border-radius-lg: 0.75rem;

$btn-border-radius: 0.5rem;
$btn-font-weight: 600;

$card-border-radius: 0.75rem;
$card-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

// 3. Import Bootstrap
@import "../node_modules/bootstrap/scss/variables";
@import "../node_modules/bootstrap/scss/variables-dark";
@import "../node_modules/bootstrap/scss/maps";
@import "../node_modules/bootstrap/scss/mixins";
@import "../node_modules/bootstrap/scss/root";

// 4. Import components
@import "../node_modules/bootstrap/scss/bootstrap";

// 5. Your custom styles
.btn {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card {
  box-shadow: $card-box-shadow;
}
```

## Dark Mode Customization

```scss
// Custom dark mode colors
$primary-dark: #818cf8;
$secondary-dark: #a78bfa;

// Dark mode overrides
[data-bs-theme="dark"] {
  --bs-body-bg: #1a202c;
  --bs-body-color: #e2e8f0;
  --bs-primary: #{$primary-dark};
  --bs-secondary: #{$secondary-dark};
  
  // Custom dark mode styles
  .card {
    --bs-card-bg: #2d3748;
    --bs-card-border-color: #4a5568;
  }
}
```

## Import Only What You Need

For smaller file sizes, import components selectively:

```scss
// Required
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";

// Optional - only import what you need
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";
@import "bootstrap/scss/containers";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/forms";
@import "bootstrap/scss/navbar";
@import "bootstrap/scss/card";

// Utilities
@import "bootstrap/scss/utilities";
@import "bootstrap/scss/utilities/api";
```

## Using Bootstrap Mixins

```scss
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";

// Responsive breakpoint mixin
.my-custom-class {
  padding: 1rem;
  
  @include media-breakpoint-up(md) {
    padding: 2rem;
  }
  
  @include media-breakpoint-up(lg) {
    padding: 3rem;
  }
}

// Button variant mixin
.btn-custom {
  @include button-variant(
    $background: #6f42c1,
    $border: #6f42c1,
    $color: #fff,
    $hover-background: darken(#6f42c1, 7.5%),
    $hover-border: darken(#6f42c1, 10%),
    $hover-color: #fff
  );
}

// Gradient background
.custom-gradient {
  @include gradient-x(#667eea, #764ba2);
}
```

## Build Script

Add to `package.json`:

```json
{
  "scripts": {
    "sass": "sass --watch scss/custom.scss:css/style.css",
    "sass:build": "sass scss/custom.scss:css/style.css --style compressed"
  }
}
```

Run:

```bash
npm run sass        # Watch mode
npm run sass:build  # Production build
```

## Advanced: Create Custom Utilities

```scss
$custom-utilities: (
  "opacity": (
    property: opacity,
    values: (
      0: 0,
      25: 0.25,
      50: 0.5,
      75: 0.75,
      100: 1
    )
  ),
  "cursor": (
    property: cursor,
    values: pointer not-allowed grab
  )
);

$utilities: map-merge($utilities, $custom-utilities);
```

## Best Practices

1. **Always import functions first** - Required for Sass functions
2. **Override before import** - Set variables before importing Bootstrap
3. **Import selectively** - Only include components you use
4. **Use variables** - Don't hardcode values
5. **Organize files** - Separate variables, custom styles, and overrides
6. **Build for production** - Compress final CSS
7. **Version control** - Don't commit generated CSS
8. **Document changes** - Comment your customizations

## Debugging

```scss
// Check compiled value
@debug $primary; // Outputs in console

// Type checking
@if type-of($primary) == color {
  // Do something
}
```

## Resources

- [Bootstrap Sass Documentation](https://getbootstrap.com/docs/5.3/customize/sass/)
- [Sass Official Guide](https://sass-lang.com/guide)
- [Bootstrap Theming](https://getbootstrap.com/docs/5.3/customize/color/)
