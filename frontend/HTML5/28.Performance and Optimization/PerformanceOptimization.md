# 28. Performance & Optimization

## Why Performance Matters

- **53%** of mobile users abandon pages that take longer than 3 seconds to load
- Google uses page speed as a **ranking factor**
- Better performance → better UX, conversion, and SEO

---

## Core Web Vitals

| Metric | What It Measures | Target |
|--------|-----------------|--------|
| **LCP** (Largest Contentful Paint) | Loading speed — when main content appears | < 2.5s |
| **INP** (Interaction to Next Paint) | Responsiveness — delay after user interaction | < 200ms |
| **CLS** (Cumulative Layout Shift) | Visual stability — unexpected layout shifts | < 0.1 |

---

## Script Loading: `async` vs `defer`

```html
<!-- Default: blocks HTML parsing -->
<script src="app.js"></script>

<!-- async: downloads in parallel, executes immediately when ready (blocks parsing briefly) -->
<script src="analytics.js" async></script>

<!-- defer: downloads in parallel, executes after HTML parsing, in order -->
<script src="app.js" defer></script>

<!-- Module scripts: deferred by default -->
<script type="module" src="app.js"></script>
```

### Comparison

| Feature | Default | `async` | `defer` |
|---------|---------|---------|---------|
| Blocks HTML parsing | ✅ | ❌ (only during execution) | ❌ |
| Downloads in parallel | ❌ | ✅ | ✅ |
| Execution order | In order | **Random** (first downloaded) | **In order** |
| Executes after DOM ready | ❌ | ❌ | ✅ |
| Use for | Inline critical scripts | Analytics, ads, third-party | App scripts, DOM-dependent |

```
HTML Parsing: ─────────────────────────────────────►

Default:      ────│ download ││ execute │────────────►
async:        ────│ download ││execute│──────────────►
defer:        ────│ download │─────────────│execute│─►
```

---

## Resource Hints

```html
<!-- Preconnect: establish early connection to important origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

<!-- DNS prefetch: resolve DNS early (lighter than preconnect) -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- Preload: load critical resources early (current page) -->
<link rel="preload" href="hero.webp" as="image">
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

<!-- Prefetch: load resources for next page (low priority) -->
<link rel="prefetch" href="/next-page.html">
<link rel="prefetch" href="/next-page-data.json" as="fetch">

<!-- Prerender: fully pre-render a page (speculative) -->
<link rel="prerender" href="/likely-next-page.html">

<!-- Module preload -->
<link rel="modulepreload" href="app.js">
```

### When to Use What

| Hint | When |
|------|------|
| `preconnect` | Third-party origins (fonts, CDNs, APIs) |
| `dns-prefetch` | Many third-party origins, less critical |
| `preload` | Critical resources on current page (above-fold images, fonts, CSS) |
| `prefetch` | Resources for the next likely navigation |
| `prerender` | High-confidence next page |

---

## Image Optimization

### Use Modern Formats

```html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="Photo" loading="lazy" decoding="async"
       width="800" height="600">
</picture>
```

| Format | Size (vs JPEG) | Browser Support |
|--------|----------------|----------------|
| AVIF | 50% smaller | Chrome, Firefox |
| WebP | 25-35% smaller | All modern browsers |
| JPEG | Baseline | All |

### Responsive Images

```html
<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
     alt="Photo" loading="lazy" decoding="async"
     width="800" height="600">
```

### Key Attributes

| Attribute | Purpose |
|-----------|---------|
| `loading="lazy"` | Defer off-screen images |
| `decoding="async"` | Non-blocking image decode |
| `width` + `height` | Prevent layout shift (CLS) |
| `fetchpriority="high"` | Boost priority for LCP image |

```html
<!-- Mark the LCP image as high priority -->
<img src="hero.webp" alt="Hero" fetchpriority="high" 
     width="1200" height="600" decoding="async">
```

---

## Lazy Loading

### Native Lazy Loading

```html
<!-- Images -->
<img src="photo.jpg" loading="lazy" alt="Photo">

<!-- Iframes -->
<iframe src="https://youtube.com/embed/..." loading="lazy"></iframe>
```

### `fetchpriority`

```html
<img src="hero.jpg" fetchpriority="high">     <!-- Above-fold hero image -->
<img src="thumbnail.jpg" fetchpriority="low">  <!-- Below-fold thumbnails -->
<link rel="preload" href="font.woff2" as="font" fetchpriority="high">
<script src="analytics.js" fetchpriority="low"></script>
```

---

## CSS Performance

```html
<!-- Critical CSS inline for fast first paint -->
<style>
  /* Only above-the-fold styles */
  body { margin: 0; font-family: system-ui; }
  .hero { height: 100vh; display: flex; align-items: center; }
</style>

<!-- Non-critical CSS: load asynchronously -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

### Font Loading

```css
/* Use font-display for fast text rendering */
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;     /* Show fallback immediately, swap when loaded */
}
```

| `font-display` | Behavior |
|----------------|----------|
| `auto` | Browser decides |
| `block` | Hide text briefly (up to 3s), then swap |
| `swap` | Show fallback immediately, swap when ready |
| `fallback` | Short block (100ms), swap within 3s, else keep fallback |
| `optional` | Short block (100ms), may not swap at all (network-dependent) |

---

## Reducing Layout Shift (CLS)

```html
<!-- ✅ Always set width/height on images and videos -->
<img src="photo.jpg" width="800" height="600" alt="">
<video width="640" height="360"></video>

<!-- ✅ Reserve space for ads/embeds -->
<div style="min-height: 250px;">
  <!-- Ad loads here -->
</div>

<!-- ✅ Use aspect-ratio for responsive containers -->
<div style="aspect-ratio: 16 / 9;">
  <iframe src="..." width="100%" height="100%"></iframe>
</div>
```

---

## Minification and Compression

| Optimization | What It Does | Tools |
|-------------|-------------|-------|
| **Minification** | Remove whitespace, comments, shorten names | Terser (JS), cssnano (CSS), html-minifier |
| **Gzip** | Server-side compression (70-90% reduction) | Server config |
| **Brotli** | Better compression than Gzip | Server config |
| **Tree shaking** | Remove unused code | Webpack, Rollup, Vite |

---

## Performance Checklist

```
□ Images: Use WebP/AVIF with fallbacks
□ Images: Set width/height attributes
□ Images: Use loading="lazy" for below-fold images
□ Images: Use fetchpriority="high" for LCP image
□ Scripts: Use defer for app scripts
□ Scripts: Use async for third-party scripts
□ Fonts: Use font-display: swap
□ Fonts: Preload critical fonts
□ CSS: Inline critical above-fold CSS
□ Resources: Preconnect to important origins
□ Resources: Prefetch likely next pages
□ HTML: Minify HTML output
□ Server: Enable Gzip/Brotli compression
□ Server: Set proper cache headers
□ Measure: Test with Lighthouse & PageSpeed Insights
```
