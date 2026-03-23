# 30. CSS Performance & Best Practices

## How Browsers Render CSS

```
Parse HTML → DOM Tree
Parse CSS  → CSSOM
           ↓
    Render Tree (DOM + CSSOM)
           ↓
      Layout (Reflow)  → Compute geometry (position, size)
           ↓
        Paint           → Fill pixels (colors, borders, shadows)
           ↓
      Composite         → Combine layers, apply transforms
```

---

## Layout, Paint & Composite

### Layout (Reflow) — Most Expensive

Changes element geometry — triggers recalculation of surrounding elements:

```css
/* ❌ Triggers layout (expensive) */
width, height, padding, margin, border
top, left, right, bottom
font-size, line-height
display, position, float
```

### Paint — Moderate

Changes appearance without geometry change:

```css
/* ⚠️ Triggers paint (moderate cost) */
color, background, background-image
border-color, border-style, border-radius
box-shadow, text-shadow
outline, visibility
```

### Composite — Cheapest

Only affects compositing — GPU-accelerated:

```css
/* ✅ Composite only (cheap, GPU-accelerated) */
transform         /* translate, rotate, scale */
opacity
filter
will-change
```

---

## Performance Best Practices

### 1. Animate Only Composite Properties

```css
/* ❌ Slow: animating layout properties */
.box {
  transition: width 0.3s, height 0.3s, margin 0.3s;
}

/* ✅ Fast: animating composite properties */
.box {
  transition: transform 0.3s, opacity 0.3s;
}

/* ❌ Move by changing left/top */
@keyframes move-slow {
  to { left: 100px; top: 50px; }
}

/* ✅ Move with transform */
@keyframes move-fast {
  to { transform: translate(100px, 50px); }
}
```

### 2. Use will-change Sparingly

```css
/* Tell browser to prepare GPU layer — use only when needed */
.animated-element {
  will-change: transform, opacity;
}

/* ❌ Don't put on everything */
* { will-change: transform; }           /* VERY BAD — wastes GPU memory */

/* ✅ Add on hover/interaction, or just before animation */
.card:hover {
  will-change: transform;
}
```

### 3. Avoid Layout Thrashing

Layout thrashing = reading layout, then writing, then reading again:

```javascript
// ❌ Triggers multiple reflows
elements.forEach(el => {
  el.style.width = el.offsetWidth + 10 + 'px';  // Read → Write → Read → Write...
});

// ✅ Batch reads, then batch writes
const widths = elements.map(el => el.offsetWidth);
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px';
});
```

### 4. content-visibility for Long Pages

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
/* Browser skips rendering off-screen sections */
```

### 5. Reduce Selector Complexity

```css
/* ❌ Slow: deeply nested selectors */
body > main > section > article > div > p > span { color: red; }

/* ✅ Fast: flat, specific class selectors */
.article-highlight { color: red; }
```

---

## CSS Architecture Patterns

### BEM (Block Element Modifier)

```css
/* Block */
.card { }

/* Element (child of block) */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier (variation) */
.card--featured { }
.card--compact { }
.card__header--sticky { }
```

### ITCSS (Inverted Triangle CSS)

Organize styles from generic to specific:

```
Settings    — Variables, tokens
Tools       — Mixins, functions
Generic     — Reset, normalize
Elements    — Default element styles (h1, p, a)
Objects     — Layout patterns (container, grid)
Components  — UI components (card, button, nav)
Utilities   — Overrides (hidden, text-center)
```

### Utility-First (Tailwind-like)

```css
.flex { display: flex; }
.items-center { align-items: center; }
.gap-4 { gap: 1rem; }
.p-4 { padding: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
```

### CSS Layers Architecture

```css
@layer reset, tokens, base, layout, components, utilities;
```

---

## Specificity Strategies

### Use Low Specificity

```css
/* ❌ High specificity — hard to override */
#header .nav ul li.active a { color: blue; }

/* ✅ Low specificity — easy to override */
.nav-link.active { color: blue; }
```

### :where() for Zero Specificity

```css
/* Resets that are easy to override */
:where(h1, h2, h3, h4, h5, h6) {
  margin: 0;
  line-height: 1.2;
}

:where(ul, ol) {
  padding: 0;
  list-style: none;
}
```

### Never Use !important (Almost)

```css
/* Only acceptable uses of !important: */

/* 1. Utility classes that MUST win */
.hidden { display: none !important; }
.sr-only { position: absolute !important; }

/* 2. Overriding third-party CSS you can't change */
.third-party-widget .override {
  color: red !important;
}
```

---

## Loading Performance

### Critical CSS (Above the Fold)

```html
<head>
  <!-- Inline critical CSS for instant first paint -->
  <style>
    body { margin: 0; font-family: system-ui; }
    .header { height: 64px; background: white; }
    .hero { min-height: 60vh; }
  </style>
  
  <!-- Load rest of CSS asynchronously -->
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
</head>
```

### Reduce File Size

```css
/* ❌ Verbose */
.box {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}

/* ✅ Shorthand */
.box { margin: 10px 20px; }
```

### Minimize Repaints

```css
/* Use transform instead of top/left for movement */
/* Use opacity instead of visibility/display for showing/hiding */
/* Avoid animating box-shadow — use pseudo-element trick: */

.card {
  position: relative;
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  opacity: 0;
  transition: opacity 0.3s;      /* Animate opacity, not shadow */
}

.card:hover::after {
  opacity: 1;
}
```

---

## Debugging CSS

### Browser DevTools

1. **Inspect Element** → See computed styles, box model, applied rules
2. **Computed Tab** → See final resolved values
3. **Changes Tab** → Track CSS modifications
4. **CSS Grid / Flexbox overlays** → Visualize layout
5. **Rendering Tab** → Paint flashing, layout shift regions
6. **Performance Tab** → Record and analyze layout/paint/composite

### Common Debug Utilities

```css
/* Outline everything to see boxes */
* { outline: 1px solid red; }

/* Or more useful version */
* { outline: 1px solid rgba(255, 0, 0, 0.2); }

/* Debug specific element */
.debug {
  outline: 2px solid red !important;
  background: rgba(255, 0, 0, 0.1) !important;
}
```

---

## Modern CSS Checklist

- [ ] `box-sizing: border-box` globally
- [ ] CSS custom properties for design tokens
- [ ] `@layer` for cascade management
- [ ] Flexbox for 1D layouts
- [ ] Grid for 2D layouts
- [ ] Container queries for component responsiveness
- [ ] Logical properties for i18n
- [ ] `clamp()` for fluid typography
- [ ] `prefers-color-scheme` for dark mode
- [ ] `prefers-reduced-motion` for accessibility
- [ ] Native nesting for organization
- [ ] `:has()`, `:is()`, `:where()` for smart selectors
