# 16. Responsive Web Design

## What is Responsive Web Design?

Responsive Web Design (RWD) makes web pages look good on **all screen sizes** — desktops, tablets, and phones — using flexible layouts, images, and CSS media queries.

### Three Pillars of RWD

1. **Fluid Grids** — Use percentages / fr / flex instead of fixed pixel widths
2. **Flexible Media** — Images and videos scale with their container
3. **Media Queries** — Apply different CSS rules based on screen size

---

## The Viewport Meta Tag

**Required** in every responsive page:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

| Attribute | Meaning |
|-----------|---------|
| `width=device-width` | Viewport width matches the device screen width |
| `initial-scale=1.0` | No zoom on page load |
| `maximum-scale=1.0` | Prevent zoom (avoid — hurts accessibility) |
| `user-scalable=no` | Disable pinch-zoom (avoid — hurts accessibility) |

---

## Media Queries

### Basic Syntax

```css
/* Apply styles when screen is 768px or narrower */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .content { width: 100%; }
}

/* Apply styles when screen is 769px or wider */
@media (min-width: 769px) {
  .container { max-width: 1200px; }
}
```

### Common Breakpoints

| Breakpoint | Target |
|------------|--------|
| `< 576px` | Extra small phones |
| `576px – 767px` | Phones (landscape) |
| `768px – 991px` | Tablets |
| `992px – 1199px` | Laptops / small desktops |
| `≥ 1200px` | Large desktops |
| `≥ 1400px` | Extra large screens |

### Mobile-First Approach (Recommended)

Start with mobile styles, then add complexity for larger screens:

```css
/* Base styles = mobile */
.card { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .card { padding: 1.5rem; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .card { padding: 2rem; }
}
```

### Desktop-First Approach

Start with desktop styles, then adjust for smaller screens:

```css
.card { padding: 2rem; }

@media (max-width: 1023px) {
  .card { padding: 1.5rem; }
}

@media (max-width: 767px) {
  .card { padding: 1rem; }
}
```

> **Best Practice:** Mobile-first produces cleaner CSS and better performance on mobile devices.

### Range Syntax (Modern)

```css
/* Width between 768px and 1024px */
@media (768px <= width <= 1024px) {
  .content { max-width: 900px; }
}

/* Width less than 768px */
@media (width < 768px) {
  .sidebar { display: none; }
}
```

---

## Media Query Features

### Screen Orientation

```css
@media (orientation: portrait) {
  /* Taller than wide */
}

@media (orientation: landscape) {
  /* Wider than tall */
}
```

### Resolution / Pixel Density

```css
/* High-DPI screens (Retina) */
@media (min-resolution: 2dppx) {
  .logo { background-image: url("logo@2x.png"); }
}

/* Equivalent */
@media (-webkit-min-device-pixel-ratio: 2) {
  /* Retina screens */
}
```

### Hover Capability

```css
/* Device has hover (mouse/trackpad) */
@media (hover: hover) {
  .card:hover { transform: translateY(-4px); }
}

/* Touch devices (no hover) */
@media (hover: none) {
  .card { /* No hover effects */ }
}
```

### Pointer Type

```css
/* Fine pointer (mouse) */
@media (pointer: fine) {
  button { padding: 8px 16px; }
}

/* Coarse pointer (touch) */
@media (pointer: coarse) {
  button { padding: 14px 24px; }  /* Larger touch targets */
}
```

### Prefers Color Scheme (Dark Mode)

```css
/* Default (light mode) styles */
body {
  background: white;
  color: #333;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #e5e5e5;
  }
}
```

### Prefers Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Prefers Contrast

```css
@media (prefers-contrast: high) {
  body {
    border-color: black;
    color: black;
  }
}
```

---

## Fluid / Responsive Techniques

### Fluid Typography

```css
h1 {
  /* Minimum: 1.5rem, Scales: 5vw, Maximum: 3.5rem */
  font-size: clamp(1.5rem, 5vw, 3.5rem);
}

p {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem);
}
```

### Fluid Spacing

```css
.section {
  padding: clamp(2rem, 5vw, 6rem) clamp(1rem, 3vw, 4rem);
}
```

### Responsive Images

```css
img {
  max-width: 100%;
  height: auto;        /* Maintain aspect ratio */
  display: block;
}
```

```html
<!-- Responsive image with srcset -->
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w,
          photo-800.jpg 800w,
          photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1000px) 50vw,
         33vw"
  alt="Description"
>

<!-- Art direction with <picture> -->
<picture>
  <source media="(min-width: 1024px)" srcset="hero-wide.jpg">
  <source media="(min-width: 600px)" srcset="hero-medium.jpg">
  <img src="hero-mobile.jpg" alt="Hero image">
</picture>
```

### Responsive Video

```css
.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;   /* 16:9 aspect ratio */
  height: 0;
}

.video-wrapper iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}

/* Modern approach */
.video {
  aspect-ratio: 16 / 9;
  width: 100%;
}
```

---

## Responsive Layout Patterns

### Stack on Mobile, Side-by-Side on Desktop

```css
.two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .two-col {
    grid-template-columns: 1fr 1fr;
  }
}
```

### Auto-Fill Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
/* No media queries needed! Cards wrap automatically. */
```

### Responsive Navigation

```css
/* Desktop nav */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.nav-toggle { display: none; }

/* Mobile nav */
@media (max-width: 768px) {
  .nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .nav-links.open { display: flex; }
  .nav-toggle { display: block; }
}
```

---

## Container Queries (Modern CSS)

Media queries are based on **viewport** size. Container queries are based on **parent** size:

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
  }
}

@container card (min-width: 700px) {
  .card {
    grid-template-columns: 200px 1fr;
    padding: 2rem;
  }
}
```

---

## Testing Responsive Design

1. **Browser DevTools** → Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
2. **Resize browser window** and watch layout adapt
3. **Real devices** — test on actual phones and tablets
4. **Chrome Lighthouse** — audit mobile performance & usability
