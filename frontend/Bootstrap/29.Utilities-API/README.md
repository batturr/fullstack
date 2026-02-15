# Bootstrap 5 Utilities API

## Overview
Bootstrap 5 includes a powerful Utilities API that allows you to generate custom utility classes. This enables you to extend Bootstrap's utility classes or create entirely new ones.

## Basic Syntax

```scss
$utilities: (
  "utility-name": (
    property: css-property,
    class: class-prefix,
    values: (
      value-key: value
    )
  )
);
```

## Built-in Utilities

Bootstrap comes with many pre-built utilities:

### Spacing (Margin & Padding)

```html
<!-- Margin -->
<div class="m-0">margin: 0</div>
<div class="mt-3">margin-top: 1rem</div>
<div class="mb-4">margin-bottom: 1.5rem</div>
<div class="mx-auto">margin-left & right: auto</div>
<div class="my-5">margin-top & bottom: 3rem</div>

<!-- Padding -->
<div class="p-2">padding: 0.5rem</div>
<div class="pt-4">padding-top: 1.5rem</div>
<div class="px-3">padding-left & right: 1rem</div>
```

### Display Utilities

```html
<!-- Display -->
<div class="d-none">display: none</div>
<div class="d-block">display: block</div>
<div class="d-flex">display: flex</div>
<div class="d-grid">display: grid</div>
<div class="d-inline-block">display: inline-block</div>

<!-- Responsive display -->
<div class="d-none d-md-block">Hidden on mobile, visible on md+</div>
<div class="d-block d-lg-none">Visible up to lg, hidden on lg+</div>
```

### Flexbox Utilities

```html
<!-- Direction -->
<div class="d-flex flex-row">Row direction</div>
<div class="d-flex flex-column">Column direction</div>

<!-- Justify Content -->
<div class="d-flex justify-content-start">Start</div>
<div class="d-flex justify-content-center">Center</div>
<div class="d-flex justify-content-end">End</div>
<div class="d-flex justify-content-between">Space between</div>
<div class="d-flex justify-content-around">Space around</div>
<div class="d-flex justify-content-evenly">Space evenly</div>

<!-- Align Items -->
<div class="d-flex align-items-start">Start</div>
<div class="d-flex align-items-center">Center</div>
<div class="d-flex align-items-end">End</div>
<div class="d-flex align-items-stretch">Stretch</div>

<!-- Flex Wrap -->
<div class="d-flex flex-wrap">Wrap</div>
<div class="d-flex flex-nowrap">No wrap</div>

<!-- Align Self -->
<div class="align-self-start">Self start</div>
<div class="align-self-center">Self center</div>

<!-- Flex Grow/Shrink -->
<div class="flex-grow-1">Grow</div>
<div class="flex-shrink-1">Shrink</div>
```

### Colors

```html
<!-- Text colors -->
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-success">Success text</p>
<p class="text-danger">Danger text</p>
<p class="text-warning">Warning text</p>
<p class="text-info">Info text</p>
<p class="text-light">Light text</p>
<p class="text-dark">Dark text</p>
<p class="text-muted">Muted text</p>

<!-- Background colors -->
<div class="bg-primary">Primary background</div>
<div class="bg-success">Success background</div>
<div class="bg-light">Light background</div>

<!-- Opacity -->
<div class="text-primary text-opacity-75">75% opacity</div>
<div class="bg-success bg-opacity-50">50% opacity</div>
```

### Borders

```html
<!-- Border -->
<div class="border">All borders</div>
<div class="border-top">Top border</div>
<div class="border-end">End border</div>
<div class="border-0">No border</div>

<!-- Border color -->
<div class="border border-primary">Primary border</div>
<div class="border border-danger">Danger border</div>

<!-- Border radius -->
<div class="rounded">Rounded</div>
<div class="rounded-circle">Circle</div>
<div class="rounded-pill">Pill</div>
<div class="rounded-0">No radius</div>
<div class="rounded-top">Top rounded</div>
```

### Sizing

```html
<!-- Width -->
<div class="w-25">Width 25%</div>
<div class="w-50">Width 50%</div>
<div class="w-75">Width 75%</div>
<div class="w-100">Width 100%</div>
<div class="w-auto">Width auto</div>

<!-- Height -->
<div class="h-25">Height 25%</div>
<div class="h-50">Height 50%</div>
<div class="h-100">Height 100%</div>

<!-- Max width/height -->
<div class="mw-100">Max width 100%</div>
<div class="mh-100">Max height 100%</div>

<!-- Viewport units -->
<div class="vw-100">100vw</div>
<div class="vh-100">100vh</div>
<div class="min-vw-100">Min 100vw</div>
<div class="min-vh-100">Min 100vh</div>
```

### Position

```html
<!-- Position -->
<div class="position-static">Static</div>
<div class="position-relative">Relative</div>
<div class="position-absolute">Absolute</div>
<div class="position-fixed">Fixed</div>
<div class="position-sticky">Sticky</div>

<!-- Position values -->
<div class="position-absolute top-0 start-0">Top-left</div>
<div class="position-absolute top-0 end-0">Top-right</div>
<div class="position-absolute bottom-0 start-0">Bottom-left</div>
<div class="position-absolute bottom-0 end-0">Bottom-right</div>

<!-- Center positioning -->
<div class="position-absolute top-50 start-50 translate-middle">Centered</div>
```

### Text Utilities

```html
<!-- Alignment -->
<p class="text-start">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-end">Right aligned</p>

<!-- Transform -->
<p class="text-lowercase">LOWERCASE</p>
<p class="text-uppercase">uppercase</p>
<p class="text-capitalize">capitalize each word</p>

<!-- Weight & Style -->
<p class="fw-bold">Bold text</p>
<p class="fw-normal">Normal text</p>
<p class="fw-light">Light text</p>
<p class="fst-italic">Italic text</p>

<!-- Size -->
<p class="fs-1">Font size 1</p>
<p class="fs-2">Font size 2</p>
<p class="fs-6">Font size 6</p>

<!-- Line height -->
<p class="lh-1">Line height 1</p>
<p class="lh-base">Line height base</p>

<!-- Text decoration -->
<p class="text-decoration-none">No decoration</p>
<p class="text-decoration-underline">Underlined</p>
<p class="text-decoration-line-through">Strike-through</p>

<!-- Text wrap -->
<p class="text-wrap">Wrapping text</p>
<p class="text-nowrap">No wrap text</p>
<p class="text-break">Break long text</p>
```

### Shadow

```html
<div class="shadow-none">No shadow</div>
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Regular shadow</div>
<div class="shadow-lg">Large shadow</div>
```

### Overflow

```html
<div class="overflow-auto">Auto overflow</div>
<div class="overflow-hidden">Hidden overflow</div>
<div class="overflow-visible">Visible overflow</div>
<div class="overflow-scroll">Scroll overflow</div>
```

### Visibility

```html
<div class="visible">Visible</div>
<div class="invisible">Invisible (takes space)</div>
```

### Z-index

```html
<div class="z-0">z-index: 0</div>
<div class="z-1">z-index: 1</div>
<div class="z-2">z-index: 2</div>
<div class="z-3">z-index: 3</div>
```

## Creating Custom Utilities

### Example 1: Add Custom Color

```scss
$utilities: (
  "color": (
    property: color,
    class: text,
    values: map-merge(
      $theme-colors,
      (
        "custom-purple": #6f42c1,
        "custom-pink": #d63384
      )
    )
  )
);
```

```html
<p class="text-custom-purple">Custom purple text</p>
<p class="text-custom-pink">Custom pink text</p>
```

### Example 2: Custom Opacity Utility

```scss
$utilities: (
  "opacity": (
    property: opacity,
    class: opacity,
    values: (
      0: 0,
      10: 0.1,
      25: 0.25,
      50: 0.5,
      75: 0.75,
      90: 0.9,
      100: 1
    )
  )
);
```

```html
<div class="opacity-50">50% opacity</div>
<div class="opacity-75">75% opacity</div>
```

### Example 3: Custom Gap Utility

```scss
$utilities: (
  "gap": (
    property: gap,
    class: gap,
    responsive: true,
    values: $spacers
  )
);
```

```html
<div class="d-flex gap-3">Flex with gap</div>
<div class="d-grid gap-lg-4">Grid with responsive gap</div>
```

### Example 4: Cursor Utility

```scss
$utilities: (
  "cursor": (
    property: cursor,
    class: cursor,
    values: (
      auto: auto,
      pointer: pointer,
      grab: grab,
      not-allowed: not-allowed,
      none: none,
      default: default
    )
  )
);
```

```html
<button class="cursor-pointer">Clickable</button>
<div class="cursor-not-allowed">Disabled</div>
```

### Example 5: Custom Spacing Scale

```scss
// Add larger spacing values
$spacers: map-merge(
  $spacers,
  (
    6: 4rem,
    7: 5rem,
    8: 6rem,
    9: 8rem,
    10: 10rem
  )
);
```

```html
<div class="mt-6">margin-top: 4rem</div>
<div class="pb-8">padding-bottom: 6rem</div>
```

## Advanced Custom Utilities

### Responsive Utility

```scss
$utilities: (
  "aspect-ratio": (
    property: aspect-ratio,
    class: ratio,
    responsive: true,
    values: (
      "1x1": 1 / 1,
      "4x3": 4 / 3,
      "16x9": 16 / 9,
      "21x9": 21 / 9
    )
  )
);
```

```html
<div class="ratio-16x9 ratio-lg-21x9">Responsive aspect ratio</div>
```

### State Variants (hover, focus)

```scss
$utilities: (
  "background-color": (
    property: background-color,
    class: bg,
    state: hover,
    values: $theme-colors
  )
);
```

```html
<div class="bg-light bg-hover-primary">Hover to change background</div>
```

### Print Utilities

```scss
$utilities: (
  "display": (
    property: display,
    class: d,
    print: true,
    values: (
      none: none,
      block: block
    )
  )
);
```

```html
<div class="d-print-none">Hidden when printing</div>
<div class="d-print-block">Visible only when printing</div>
```

## Modifying Existing Utilities

### Remove Utilities

```scss
$utilities: map-remove($utilities, "float");
```

### Modify Utility Values

```scss
$utilities: map-merge(
  $utilities,
  (
    "width": (
      property: width,
      class: w,
      values: (
        10: 10%,
        20: 20%,
        25: 25%,
        30: 30%,
        40: 40%,
        50: 50%,
        60: 60%,
        70: 70%,
        75: 75%,
        80: 80%,
        90: 90%,
        100: 100%,
        auto: auto
      )
    )
  )
);
```

## Utility Options

```scss
$utilities: (
  "custom-property": (
    property: css-property,           // CSS property
    class: class-prefix,              // Class prefix
    values: (),                       // Values map
    responsive: false,                // Generate responsive classes
    print: false,                     // Generate print classes
    state: null,                      // hover, focus, active
    rfs: false,                       // Use RFS
    rtl: true                         // RTL support
  )
);
```

## Real-World Examples

### Complete Custom Utilities File

```scss
// custom-utilities.scss
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";

// Add custom utilities
$custom-utilities: (
  "cursor": (
    property: cursor,
    class: cursor,
    values: pointer not-allowed grab default
  ),
  "object-fit": (
    property: object-fit,
    class: object-fit,
    values: contain cover fill none scale-down
  ),
  "transition": (
    property: transition,
    class: transition,
    values: (
      all: all 0.3s ease,
      fast: all 0.15s ease,
      slow: all 0.5s ease
    )
  ),
  "z-index": map-merge(
    map-get($utilities, "z-index"),
    (
      values: map-merge(
        map-get(map-get($utilities, "z-index"), "values"),
        (
          "tooltip": 1070,
          "modal": 1055
        )
      )
    )
  )
);

// Merge with Bootstrap utilities
$utilities: map-merge($utilities, $custom-utilities);

// Import Bootstrap components and utilities API
@import "bootstrap/scss/utilities";
@import "bootstrap/scss/utilities/api";
```

## Usage Tips

1. **Override before import** - Define custom utilities before importing Bootstrap
2. **Use responsive: true** - For mobile-first design
3. **Leverage existing maps** - Reuse `$spacers`, `$theme-colors`, etc.
4. **Keep it semantic** - Use meaningful class names
5. **Document custom utilities** - For team collaboration
6. **Test print classes** - If using `print: true`
7. **Consider performance** - Don't over-generate utilities

## Best Practices

- ✅ Use utilities for single-purpose styles
- ✅ Combine utilities instead of creating new components
- ✅ Make utilities responsive when needed
- ✅ Keep utility names short and memorable
- ✅ Group related utilities
- ❌ Don't create utilities for complex components
- ❌ Don't override too many default utilities
- ❌ Avoid utilities with many CSS properties

## Resources

- [Bootstrap Utilities API Documentation](https://getbootstrap.com/docs/5.3/utilities/api/)
- [Sass Maps Documentation](https://sass-lang.com/documentation/values/maps)
