# BOOTSTRAP 5.3+ IMAGE FLUID

## Overview

`img-fluid` is the primary Bootstrap utility for responsive images. It ensures images scale with their parent container so they never overflow and always look good across devices.

This document covers:
- `.img-fluid` usage and behavior
- `srcset` and `sizes` for responsive image delivery
- `picture` element for art-direction
- `loading="lazy"` and performance tips
- `object-fit` helpers and `.ratio` integration
- alignment, sizing and accessibility best practices
- Bootstrap 5.3+ improvements vs Bootstrap 4

---

## Core utility: `.img-fluid`

Usage:
```html
<img src="image.jpg" class="img-fluid" alt="Description">
```

What it does (CSS):
```css
.img-fluid {
  max-width: 100%;
  height: auto;
}
```

- Ensures the image will never be wider than its parent container.
- Keeps original aspect ratio because `height: auto` is applied.
- Works for `img`, `svg`, and replaced elements.

---

## Practical patterns

### Full-width responsive image
```html
<div class="container-fluid p-0">
  <img src="hero-large.jpg" class="img-fluid w-100" alt="Hero image">
</div>
```

### Responsive image inside a column
```html
<div class="row">
  <div class="col-md-6">
    <img src="product.jpg" class="img-fluid rounded" alt="Product">
  </div>
</div>
```

### Image with fixed max width
```html
<img src="logo.png" class="img-fluid" style="max-width:200px;" alt="Logo">
```

---

## Srcset and sizes (responsive delivery)

To serve appropriately sized images for different device widths, use `srcset` and `sizes`.

```html
<img
  src="image-small.jpg"
  srcset="image-small.jpg 480w, image-medium.jpg 768w, image-large.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  class="img-fluid"
  alt="Responsive image">
```

- `srcset` lists image files with their intrinsic widths.
- `sizes` tells the browser how much CSS width the image will take in different viewport conditions.
- The browser picks the best file to download, saving bandwidth on small devices.

---

## Picture element (art-direction)

Use `picture` when you need different crops or formats per breakpoint:

```html
<picture>
  <source media="(min-width:1200px)" srcset="image-xl.jpg">
  <source media="(min-width:768px)" srcset="image-md.jpg">
  <img src="image-sm.jpg" class="img-fluid" alt="Art-directed image">
</picture>
```

`<picture>` also lets you offer modern formats (WebP) with fallbacks:

```html
<picture>
  <source type="image/webp" srcset="image.webp">
  <source type="image/jpeg" srcset="image.jpg">
  <img src="image.jpg" class="img-fluid" alt="Image with WebP fallback">
</picture>
```

---

## Lazy loading (performance)

Use native lazy loading where appropriate:
```html
<img src="large.jpg" loading="lazy" class="img-fluid" alt="">
```

- `loading="lazy"` defers off-screen images until user scrolls near them.
- Use sparingly for above-the-fold hero images (do not lazy-load critical images).

---

## Integration with `.ratio` and `object-fit`

When you need a specific aspect ratio and control how the image fills the box, combine `.ratio` with `object-fit` utilities.

```html
<div class="ratio ratio-16x9">
  <img src="image.jpg" class="img-fluid object-fit-cover" alt="Cover image">
</div>
```

Useful `object-fit` classes:
- `.object-fit-cover` (image covers container, may crop)
- `.object-fit-contain` (image fits without cropping)
- `.object-fit-fill` (stretches to fill)
- `.object-fit-scale-down`

Note: `.object-fit-*` rely on CSS `object-fit` and work best when the image has width/height set by the container (e.g. `.ratio`) or CSS.

---

## Responsive image components

### Figure with caption
```html
<figure class="figure">
  <img src="photo.jpg" class="figure-img img-fluid rounded" alt="Captioned photo">
  <figcaption class="figure-caption">A caption for the photo.</figcaption>
</figure>
```

### Grid gallery
```html
<div class="row g-2">
  <div class="col-6 col-md-3">
    <img src="thumb1.jpg" class="img-fluid rounded" alt="">
  </div>
  <!-- repeat -->
</div>
```

---

## Accessibility best practices

- Always provide descriptive `alt` text for informative images.
- For purely decorative images, use `alt=""` and `aria-hidden="true"`.
- Ensure images used as controls have accessible names.
- Check contrast for overlaid text on images (use overlays or background shading).
- Avoid using images of text for important content.

---

## Optimization checklist

- Use `srcset` and `sizes` to serve proper resolutions.
- Use `picture` to serve modern formats (WebP/AVIF) with fallbacks.
- Use `loading="lazy"` for non-critical images.
- Compress images and use appropriate formats.
- Use responsive image CDN or build step to generate multiple sizes.

---

## Bootstrap 5.3+ vs 4 notes

- `.img-fluid` unchanged; still recommended for responsive images.
- New in Bootstrap 5.x: `.ratio` and `object-fit` utilities make responsive, cropped layouts easier.
- Browser support for `loading="lazy"` is now widespread; polyfill only when needed.

---

## Examples

### Basic responsive image
```html
<img src="https://via.placeholder.com/1200x800" class="img-fluid rounded shadow" alt="Sample">
```

### Hero with `srcset` and lazy load
```html
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
  sizes="100vw"
  loading="lazy"
  class="img-fluid w-100"
  alt="Hero">
```

### Picture with WebP and fallback
```html
<picture>
  <source type="image/avif" srcset="image.avif">
  <source type="image/webp" srcset="image.webp">
  <img src="image.jpg" class="img-fluid" alt="">
</picture>
```

---

## Quick reference

- Use `.img-fluid` for responsive images.
- Use `srcset` + `sizes` for bandwidth-efficient images.
- Use `picture` for art-direction and format fallbacks.
- Use `loading="lazy"` for non-critical images.
- Combine `.ratio` + `.object-fit-*` for controlled cropping.

---

## Resources

- Bootstrap Images: https://getbootstrap.com/docs/5.3/content/images/
- Responsive images guide (MDN): https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
- Picture element (WHATWG): https://html.spec.whatwg.org/multipage/embedded-content.html#the-picture-element

---

## Next steps

- Review `Container.md` and tell me if you want extra examples (galleries, CMS patterns) or a pre-generated set of responsive image files (placeholders) to include for live testing.
