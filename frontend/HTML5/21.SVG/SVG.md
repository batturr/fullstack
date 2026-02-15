# 21. SVG (Scalable Vector Graphics)

## What Is SVG?

SVG is an **XML-based vector image format** for 2D graphics. Unlike canvas (bitmap), SVG shapes are part of the DOM and scale without losing quality.

```html
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#3b82f6" />
</svg>
```

---

## Embedding SVG

### 1. Inline SVG (Recommended)

```html
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="coral" rx="10" />
</svg>
```

- Full CSS and JavaScript control
- Can be styled with external CSS
- Best for interactive graphics

### 2. `<img>` Tag

```html
<img src="icon.svg" alt="Icon" width="100" height="100">
```

- Simple, like any image
- No CSS/JS interaction with SVG internals

### 3. CSS Background

```css
.icon {
  background-image: url('icon.svg');
  width: 100px;
  height: 100px;
}
```

### 4. `<object>` Tag

```html
<object type="image/svg+xml" data="graphic.svg" width="200" height="200">
  Fallback text
</object>
```

---

## SVG Coordinate System

```
(0,0) ──────────────────► x
  │
  │
  │
  │
  ▼
  y
```

- Origin `(0,0)` is the **top-left** corner
- `x` increases rightward, `y` increases downward
- `viewBox` defines the coordinate system:

```html
<svg viewBox="0 0 100 100" width="200" height="200">
  <!-- Draws in a 100x100 coordinate space, displayed at 200x200 pixels -->
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

---

## Basic Shapes

### Rectangle

```html
<rect x="10" y="10" width="100" height="60" 
      fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" 
      rx="10" ry="10" />
<!-- rx/ry = rounded corners -->
```

### Circle

```html
<circle cx="100" cy="100" r="50" fill="#ef4444" />
```

### Ellipse

```html
<ellipse cx="100" cy="100" rx="80" ry="50" fill="#10b981" />
```

### Line

```html
<line x1="10" y1="10" x2="200" y2="100" 
      stroke="black" stroke-width="2" />
```

### Polyline (Open Shape)

```html
<polyline points="10,10 50,80 90,10 130,80 170,10" 
          fill="none" stroke="#3b82f6" stroke-width="2" />
```

### Polygon (Closed Shape)

```html
<!-- Triangle -->
<polygon points="100,10 40,198 190,78 10,78 160,198" 
         fill="#f59e0b" stroke="#d97706" stroke-width="2" />
```

---

## Path — The Most Powerful Shape

```html
<path d="M 10 80 Q 95 10 180 80 T 350 80" fill="none" stroke="black" stroke-width="2" />
```

### Path Commands

| Command | Name | Parameters |
|---------|------|-----------|
| `M` / `m` | Move to | `x y` |
| `L` / `l` | Line to | `x y` |
| `H` / `h` | Horizontal line | `x` |
| `V` / `v` | Vertical line | `y` |
| `C` / `c` | Cubic Bézier | `x1 y1 x2 y2 x y` |
| `S` / `s` | Smooth cubic | `x2 y2 x y` |
| `Q` / `q` | Quadratic Bézier | `x1 y1 x y` |
| `T` / `t` | Smooth quadratic | `x y` |
| `A` / `a` | Arc | `rx ry rotation large-arc sweep x y` |
| `Z` / `z` | Close path | — |

> **Uppercase** = absolute coordinates, **lowercase** = relative to current position.

### Examples

```html
<!-- Square using path -->
<path d="M 10 10 H 110 V 110 H 10 Z" fill="#3b82f6" />

<!-- Heart shape -->
<path d="M 100 200 
         C 100 150, 30 100, 30 60 
         C 30 20, 60 0, 100 40 
         C 140 0, 170 20, 170 60 
         C 170 100, 100 150, 100 200 Z" 
      fill="red" />
```

---

## Text

```html
<svg width="300" height="100">
  <text x="10" y="50" font-size="24" fill="#333" font-family="Arial">
    Hello SVG!
  </text>
  
  <!-- Text on a path -->
  <defs>
    <path id="curve" d="M 10 80 Q 150 10 290 80" />
  </defs>
  <text font-size="16" fill="#3b82f6">
    <textPath href="#curve">Text along a curve!</textPath>
  </text>
</svg>
```

---

## Styling SVG

### Inline Attributes

```html
<circle cx="50" cy="50" r="40" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3" opacity="0.8" />
```

### CSS (Inline SVG)

```css
svg circle {
  fill: #3b82f6;
  stroke: #1d4ed8;
  stroke-width: 3;
  transition: fill 0.3s;
}
svg circle:hover {
  fill: #ef4444;
}
```

### Common Style Properties

| SVG Attribute | CSS Property | Purpose |
|---------------|-------------|---------|
| `fill` | `fill` | Fill color |
| `stroke` | `stroke` | Outline color |
| `stroke-width` | `stroke-width` | Outline thickness |
| `opacity` | `opacity` | Transparency |
| `fill-opacity` | `fill-opacity` | Fill transparency |
| `stroke-dasharray` | `stroke-dasharray` | Dashed lines |
| `stroke-linecap` | `stroke-linecap` | butt, round, square |

---

## Gradients

```html
<svg width="200" height="200">
  <defs>
    <!-- Linear gradient -->
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    
    <!-- Radial gradient -->
    <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="white" />
      <stop offset="100%" stop-color="#3b82f6" />
    </radialGradient>
  </defs>
  
  <rect width="200" height="80" fill="url(#grad1)" rx="10" />
  <circle cx="100" cy="150" r="40" fill="url(#grad2)" />
</svg>
```

---

## Groups and Reuse

```html
<svg width="300" height="200">
  <!-- Group: apply transforms/styles to multiple elements -->
  <g fill="#3b82f6" stroke="#1d4ed8" stroke-width="2">
    <rect x="10" y="10" width="50" height="50" />
    <rect x="70" y="10" width="50" height="50" />
  </g>
  
  <!-- Defs: define reusable elements (not rendered) -->
  <defs>
    <circle id="dot" r="10" />
  </defs>
  
  <!-- Use: reference defined elements -->
  <use href="#dot" x="200" y="30" fill="red" />
  <use href="#dot" x="230" y="30" fill="green" />
  <use href="#dot" x="260" y="30" fill="blue" />
</svg>
```

---

## Filters

```html
<svg width="200" height="200">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.3)" />
    </filter>
    <filter id="blur">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>
  
  <rect width="100" height="100" x="10" y="10" fill="#3b82f6" filter="url(#shadow)" />
  <circle cx="160" cy="60" r="40" fill="#ef4444" filter="url(#blur)" />
</svg>
```

---

## Animations

### CSS Animation

```css
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

svg .spinner {
  transform-origin: center;
  animation: rotate 2s linear infinite;
}
```

### SMIL Animation (SVG Native)

```html
<circle cx="100" cy="100" r="40" fill="#3b82f6">
  <animate attributeName="r" from="40" to="60" dur="1s" repeatCount="indefinite" />
  <animate attributeName="fill" from="#3b82f6" to="#ef4444" dur="2s" repeatCount="indefinite" />
</circle>

<!-- Animate along a path -->
<circle r="5" fill="red">
  <animateMotion dur="3s" repeatCount="indefinite" 
    path="M 10 80 Q 150 10 290 80" />
</circle>
```

---

## SVG Icons — Best Practice

```html
<!-- Sprite: define all icons in one hidden SVG -->
<svg style="display:none;">
  <defs>
    <symbol id="icon-home" viewBox="0 0 24 24">
      <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3" 
            fill="none" stroke="currentColor" stroke-width="2" />
    </symbol>
    <symbol id="icon-user" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M4 20c0-4 4-7 8-7s8 3 8 7" 
            fill="none" stroke="currentColor" stroke-width="2" />
    </symbol>
  </defs>
</svg>

<!-- Use icons anywhere -->
<svg width="24" height="24"><use href="#icon-home" /></svg>
<svg width="24" height="24"><use href="#icon-user" /></svg>
```

- `currentColor` inherits the CSS `color` property
