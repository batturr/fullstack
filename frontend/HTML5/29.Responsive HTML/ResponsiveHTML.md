# 29. Responsive HTML

## What Is Responsive Design?

Responsive design makes web pages look and work well on **all screen sizes** — from phones to large desktops.

---

## Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**This is required for responsive design to work on mobile.**

Without it, mobile browsers render pages at desktop width (~980px) and zoom out.

---

## Responsive Images

### `srcset` with Width Descriptors

```html
<img 
  src="photo-800.jpg"
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1200.jpg 1200w,
    photo-1600.jpg 1600w"
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1000px) 50vw,
    33vw"
  alt="Responsive photo"
  loading="lazy"
  decoding="async">
```

- `srcset` lists available image files with their widths (`400w`, `800w`, etc.)
- `sizes` tells the browser the displayed size at different breakpoints
- The browser **picks the best image** based on screen size and pixel density

### `srcset` with Pixel Density

```html
<img 
  src="logo.png"
  srcset="
    logo.png 1x,
    logo@2x.png 2x,
    logo@3x.png 3x"
  alt="Logo"
  width="200" height="60">
```

- `1x` = standard displays, `2x` = Retina, `3x` = high-density mobile

---

## `<picture>` Element

For **art direction** — different images for different screen sizes:

```html
<picture>
  <!-- Mobile: cropped portrait image -->
  <source media="(max-width: 600px)" srcset="hero-mobile.webp" type="image/webp">
  <source media="(max-width: 600px)" srcset="hero-mobile.jpg">
  
  <!-- Tablet -->
  <source media="(max-width: 1024px)" srcset="hero-tablet.webp" type="image/webp">
  <source media="(max-width: 1024px)" srcset="hero-tablet.jpg">
  
  <!-- Desktop: full landscape image -->
  <source srcset="hero-desktop.webp" type="image/webp">
  <img src="hero-desktop.jpg" alt="Hero image" width="1200" height="600">
</picture>
```

### Format Fallback

```html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="Photo" width="800" height="600">
</picture>
```

### Dark Mode Images

```html
<picture>
  <source srcset="logo-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="logo-light.svg" alt="Logo">
</picture>
```

---

## Responsive Video

```html
<!-- HTML5 video -->
<video controls width="100%" style="max-width: 800px;">
  <source src="video.mp4" type="video/mp4">
</video>

<!-- Responsive iframe (YouTube, Vimeo) -->
<div style="aspect-ratio: 16 / 9; max-width: 800px;">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID"
    width="100%" height="100%" 
    frameborder="0" allowfullscreen
    loading="lazy">
  </iframe>
</div>
```

---

## Responsive Tables

### Horizontal Scroll

```html
<div style="overflow-x: auto;">
  <table>
    <thead>
      <tr><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>ZIP</th></tr>
    </thead>
    <tbody>
      <tr><td>John</td><td>john@example.com</td><td>555-1234</td><td>NYC</td><td>10001</td></tr>
    </tbody>
  </table>
</div>
```

### Stacked Layout (Mobile)

```css
@media (max-width: 600px) {
  table, thead, tbody, tr, td {
    display: block;
  }
  thead { display: none; }
  td {
    position: relative;
    padding-left: 50%;
    text-align: right;
  }
  td::before {
    content: attr(data-label);
    position: absolute;
    left: 10px;
    font-weight: bold;
    text-align: left;
  }
}
```

```html
<tr>
  <td data-label="Name">John</td>
  <td data-label="Email">john@example.com</td>
  <td data-label="Phone">555-1234</td>
</tr>
```

---

## Media Queries in HTML

### Conditional Stylesheets

```html
<!-- Only load on small screens -->
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- Only load on large screens -->
<link rel="stylesheet" href="desktop.css" media="(min-width: 769px)">

<!-- Print styles -->
<link rel="stylesheet" href="print.css" media="print">
```

### Conditional `<source>` in `<picture>`

```html
<picture>
  <source media="(max-width: 768px)" srcset="mobile.jpg">
  <source media="(min-width: 769px)" srcset="desktop.jpg">
  <img src="default.jpg" alt="Responsive image">
</picture>
```

---

## Common Breakpoints

| Breakpoint | Target |
|-----------|--------|
| `320px` | Small phones |
| `375px` | Standard phones (iPhone) |
| `480px` | Large phones |
| `768px` | Tablets |
| `1024px` | Small laptops / landscape tablets |
| `1280px` | Laptops |
| `1440px` | Large screens |
| `1920px` | Full HD desktops |

---

## CSS Responsive Techniques (Used with HTML)

### Fluid Typography

```css
html {
  font-size: clamp(14px, 2vw + 0.5rem, 20px);
}
```

### Container Queries

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

### Responsive Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

---

## User Preference Media Queries

```html
<!-- In <picture> -->
<picture>
  <source srcset="dark-image.png" media="(prefers-color-scheme: dark)">
  <img src="light-image.png" alt="">
</picture>
```

```css
/* Dark mode */
@media (prefers-color-scheme: dark) {
  body { background: #111; color: #eee; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

/* High contrast */
@media (prefers-contrast: high) {
  body { border: 2px solid; }
}
```

---

## Responsive Design Checklist

```
□ Viewport meta tag included
□ Images use srcset/sizes or <picture>
□ Videos maintain aspect ratio
□ Tables scroll or stack on mobile
□ Font sizes are readable (min 16px body text)
□ Touch targets are at least 44×44px
□ No horizontal scroll at any breakpoint
□ Tested on real devices (not just DevTools)
```
