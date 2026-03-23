# 05. Images

## The `<img>` Tag

```html
<img src="photo.jpg" alt="A sunset over the ocean" width="600" height="400">
```

`<img>` is a **void (self-closing)** element — no closing tag needed.

### Required Attributes

| Attribute | Purpose |
|-----------|---------|
| `src` | Path/URL to the image file |
| `alt` | Alternative text (screen readers, broken images, SEO) |

### Optional Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `width` | Width in pixels or CSS units | `width="600"` |
| `height` | Height in pixels or CSS units | `height="400"` |
| `loading` | Lazy load images | `loading="lazy"` |
| `decoding` | Decoding hint | `decoding="async"` |
| `fetchpriority` | Resource priority | `fetchpriority="high"` |
| `crossorigin` | CORS policy | `crossorigin="anonymous"` |
| `referrerpolicy` | Referrer policy | `referrerpolicy="no-referrer"` |

---

## Image Paths

```html
<!-- Same folder -->
<img src="photo.jpg" alt="Photo">

<!-- Subfolder -->
<img src="images/photo.jpg" alt="Photo">

<!-- Parent folder -->
<img src="../photo.jpg" alt="Photo">

<!-- Root-relative path -->
<img src="/images/photo.jpg" alt="Photo">

<!-- External URL -->
<img src="https://example.com/photo.jpg" alt="Photo">

<!-- Data URI (inline base64) -->
<img src="data:image/png;base64,iVBORw0KGgo..." alt="Inline image">
```

---

## Supported Image Formats

| Format | Extension | Best For | Transparency | Animation |
|--------|-----------|----------|-------------|-----------|
| **JPEG** | `.jpg`, `.jpeg` | Photos, gradients | ❌ | ❌ |
| **PNG** | `.png` | Graphics, screenshots, text | ✅ | ❌ |
| **GIF** | `.gif` | Simple animations | ✅ (1-bit) | ✅ |
| **WebP** | `.webp` | Modern alternative to JPEG/PNG | ✅ | ✅ |
| **AVIF** | `.avif` | Best compression, modern | ✅ | ✅ |
| **SVG** | `.svg` | Icons, logos, illustrations | ✅ | ✅ |
| **ICO** | `.ico` | Favicons | ✅ | ❌ |

> **Recommendation:** Use **WebP** for photos, **SVG** for icons/logos, **AVIF** where supported.

---

## Alt Text Best Practices

```html
<!-- ✅ Good: Descriptive -->
<img src="dog.jpg" alt="Golden retriever puppy playing in the park">

<!-- ✅ Decorative image: empty alt -->
<img src="divider.png" alt="">

<!-- ❌ Bad: Redundant -->
<img src="dog.jpg" alt="Image of dog">

<!-- ❌ Bad: Missing alt -->
<img src="dog.jpg">

<!-- ❌ Bad: Filename as alt -->
<img src="dog.jpg" alt="IMG_20250115_001.jpg">
```

### Guidelines

- Be **descriptive but concise** (under 125 characters)
- For **decorative** images, use `alt=""` (empty string, NOT missing)
- Don't start with "image of" or "picture of" — screen readers already announce it's an image
- For **functional** images (buttons, links), describe the **function**, not the image

---

## Lazy Loading

```html
<!-- Loads only when near the viewport -->
<img src="photo.jpg" alt="Photo" loading="lazy">

<!-- Load immediately (default behavior, good for above-the-fold images) -->
<img src="hero.jpg" alt="Hero" loading="eager">
```

- `loading="lazy"` — Defers loading until the image is near the viewport
- Saves bandwidth and speeds up initial page load
- Don't lazy-load **above-the-fold** images (hero images, logos)

---

## Responsive Images

### `srcset` — Multiple Resolutions

```html
<img
  src="photo-800.jpg"
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1200.jpg 1200w,
    photo-1600.jpg 1600w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1200px) 50vw,
    33vw
  "
  alt="Responsive photo"
>
```

| Attribute | Purpose |
|-----------|---------|
| `srcset` | List of image files with their intrinsic width (`w`) or pixel density (`x`) |
| `sizes` | Tells the browser how wide the image will be displayed at different viewport sizes |
| `src` | Fallback for browsers that don't support `srcset` |

### `srcset` with Pixel Density

```html
<img
  src="logo.png"
  srcset="logo.png 1x, logo@2x.png 2x, logo@3x.png 3x"
  alt="Logo"
>
```

### `<picture>` — Art Direction

```html
<picture>
  <source media="(min-width: 1024px)" srcset="hero-wide.webp" type="image/webp">
  <source media="(min-width: 1024px)" srcset="hero-wide.jpg">
  <source media="(min-width: 640px)" srcset="hero-medium.webp" type="image/webp">
  <source media="(min-width: 640px)" srcset="hero-medium.jpg">
  <source srcset="hero-small.webp" type="image/webp">
  <img src="hero-small.jpg" alt="Hero image">
</picture>
```

- `<picture>` lets you serve **different images** for different screen sizes
- Also used for **format fallback** (WebP → JPEG)
- The `<img>` inside is **required** — it's the fallback

---

## `<figure>` and `<figcaption>`

```html
<figure>
  <img src="chart.png" alt="Revenue growth chart showing 25% increase in Q4">
  <figcaption>Fig. 1 — Revenue growth in Q4 2024</figcaption>
</figure>
```

- `<figure>` — Self-contained content (image, diagram, code snippet, quote)
- `<figcaption>` — Caption/description for the figure
- Not limited to images — also for code blocks, tables, quotes

```html
<figure>
  <pre><code>console.log("Hello");</code></pre>
  <figcaption>Example: Hello World in JavaScript</figcaption>
</figure>
```

---

## Image as Link

```html
<a href="https://example.com">
  <img src="banner.jpg" alt="Visit Example.com">
</a>
```

---

## Image Maps

Define clickable areas on an image:

```html
<img src="world-map.jpg" alt="World Map" usemap="#worldmap" width="800" height="400">

<map name="worldmap">
  <area shape="rect" coords="0,0,200,200" href="americas.html" alt="Americas">
  <area shape="circle" coords="400,200,80" href="europe.html" alt="Europe">
  <area shape="poly" coords="500,100,600,200,500,300" href="asia.html" alt="Asia">
</map>
```

| Shape | coords Value |
|-------|-------------|
| `rect` | `x1,y1,x2,y2` (top-left, bottom-right) |
| `circle` | `x,y,radius` (center, radius) |
| `poly` | `x1,y1,x2,y2,...` (polygon points) |

---

## Favicon

```html
<head>
  <!-- Standard favicon -->
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  
  <!-- SVG favicon (modern browsers) -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  
  <!-- Apple Touch Icon -->
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>
```

---

## Performance Tips

1. **Always set `width` and `height`** — Prevents layout shift (CLS)
2. **Use `loading="lazy"`** for below-the-fold images
3. **Use `fetchpriority="high"`** for hero/LCP images
4. **Use modern formats** (WebP, AVIF) with `<picture>` fallback
5. **Compress images** — Use tools like Squoosh, TinyPNG
6. **Use `decoding="async"`** to prevent blocking the main thread
