# 21. CSS Functions

## calc()

Perform math with mixed units:

```css
.sidebar {
  width: calc(100% - 260px);
}

.content {
  min-height: calc(100vh - 64px - 80px);  /* viewport - header - footer */
  padding: calc(1rem + 2vw);
}

/* Nesting */
.item {
  width: calc(100% / 3 - calc(2 * 16px));
}
```

### Supported Operators
- `+` Addition (spaces required around `+` and `-`)
- `-` Subtraction
- `*` Multiplication (at least one operand must be a number)
- `/` Division (divisor must be a number)

---

## min(), max(), clamp()

### min() — Uses the **smallest** value

```css
.container {
  width: min(90%, 1200px);           /* Whichever is smaller */
}

h1 {
  font-size: min(5vw, 3rem);         /* Never bigger than 3rem */
}
```

### max() — Uses the **largest** value

```css
.content {
  width: max(50%, 400px);            /* At least 400px */
}

.text {
  font-size: max(1rem, 2vw);         /* Never smaller than 1rem */
}
```

### clamp() — Value with min and max bounds

```css
/* clamp(minimum, preferred, maximum) */
h1 {
  font-size: clamp(1.5rem, 5vw, 3.5rem);
  /* At least 1.5rem, prefers 5vw, max 3.5rem */
}

.container {
  width: clamp(320px, 90%, 1200px);
}

.spacing {
  padding: clamp(1rem, 3vw, 3rem);
}
```

### Fluid Type Scale with clamp()

```css
:root {
  --text-sm: clamp(0.8rem, 0.17vw + 0.76rem, 0.89rem);
  --text-base: clamp(1rem, 0.34vw + 0.91rem, 1.19rem);
  --text-lg: clamp(1.25rem, 0.61vw + 1.1rem, 1.58rem);
  --text-xl: clamp(1.56rem, 1vw + 1.31rem, 2.11rem);
  --text-2xl: clamp(1.95rem, 1.56vw + 1.56rem, 2.81rem);
  --text-3xl: clamp(2.44rem, 2.38vw + 1.85rem, 3.75rem);
}
```

---

## Color Functions

### rgb() / hsl() / oklch()

```css
.box {
  color: rgb(59 130 246);
  color: rgb(59 130 246 / 0.5);      /* With alpha */
  color: hsl(217 91% 60%);
  color: hsl(217 91% 60% / 0.5);
  color: oklch(0.62 0.21 259);
  color: oklch(0.62 0.21 259 / 0.5);
}
```

### color-mix()

```css
.mix {
  /* Mix 50/50 */
  color: color-mix(in srgb, red, blue);
  
  /* Mix with percentages */
  background: color-mix(in srgb, #3b82f6 70%, white);
  
  /* Mix in OKLCH for better results */
  border-color: color-mix(in oklch, var(--primary), black 20%);
}
```

### light-dark()

```css
:root { color-scheme: light dark; }

.text {
  /* Automatically picks based on color-scheme */
  color: light-dark(#333, #eee);
  background: light-dark(white, #1a1a1a);
}
```

---

## Gradient Functions

```css
/* Linear */
div { background: linear-gradient(135deg, #667eea, #764ba2); }

/* Radial */
div { background: radial-gradient(circle at center, red, blue); }

/* Conic */
div { background: conic-gradient(red, yellow, green, cyan, blue, magenta, red); }

/* Repeating */
div { background: repeating-linear-gradient(45deg, #000 0px, #000 10px, #fff 10px, #fff 20px); }
```

---

## Transform Functions

```css
.element {
  transform: translate(50px, 20px);
  transform: translateX(50px);
  transform: translateY(-20px);
  transform: rotate(45deg);
  transform: scale(1.2);
  transform: scaleX(2) scaleY(0.5);
  transform: skew(10deg, 5deg);
  transform: perspective(1000px) rotateY(45deg);
  transform: matrix(1, 0, 0, 1, 50, 20);
}
```

---

## Filter Functions

```css
.image {
  filter: blur(4px);
  filter: brightness(1.2);
  filter: contrast(1.5);
  filter: grayscale(100%);
  filter: hue-rotate(90deg);
  filter: invert(100%);
  filter: opacity(0.5);
  filter: saturate(2);
  filter: sepia(80%);
  filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));
  
  /* Multiple filters */
  filter: brightness(1.1) contrast(1.2) saturate(1.3);
}
```

---

## Shape Functions

```css
/* clip-path */
.triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
.circle { clip-path: circle(50%); }
.ellipse { clip-path: ellipse(40% 60% at 50% 50%); }
.star { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }

/* inset */
.inset { clip-path: inset(10px 20px 30px 40px round 8px); }
```

---

## env()

Access environment variables (safe areas for notched devices):

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* With fallback */
body {
  padding-top: env(safe-area-inset-top, 20px);
}
```

> Requires: `<meta name="viewport" content="viewport-fit=cover">`

---

## attr()

Read HTML attributes (currently limited to `content`):

```css
/* Display data attribute in pseudo-element */
[data-tooltip]::after {
  content: attr(data-tooltip);
}

/* Display href of links in print */
@media print {
  a[href]::after {
    content: " (" attr(href) ")";
  }
}
```

---

## fit-content()

```css
.grid {
  grid-template-columns: fit-content(200px) 1fr fit-content(300px);
  /* Column shrinks to content but won't exceed specified max */
}
```

---

## Counter Functions

```css
ol {
  counter-reset: section;
  list-style: none;
}

ol li {
  counter-increment: section;
}

ol li::before {
  content: counter(section) ". ";           /* 1. 2. 3. */
  content: counter(section, upper-roman);    /* I. II. III. */
  content: counters(section, ".") " ";       /* 1.1, 1.2, 2.1 (nested) */
}
```

---

## Summary Table

| Function | Purpose | Example |
|----------|---------|---------|
| `calc()` | Math with mixed units | `calc(100% - 20px)` |
| `min()` | Smallest of values | `min(90%, 1200px)` |
| `max()` | Largest of values | `max(50%, 400px)` |
| `clamp()` | Bounded value | `clamp(1rem, 3vw, 2rem)` |
| `var()` | Use CSS variable | `var(--color, blue)` |
| `rgb()/hsl()` | Color | `rgb(0 128 255 / 0.5)` |
| `color-mix()` | Mix colors | `color-mix(in oklch, red, blue)` |
| `linear-gradient()` | Gradient | `linear-gradient(to right, red, blue)` |
| `url()` | External resource | `url("image.jpg")` |
| `attr()` | HTML attribute value | `attr(data-label)` |
| `env()` | Environment variable | `env(safe-area-inset-top)` |
| `fit-content()` | Content-limited size | `fit-content(300px)` |
| `minmax()` | Size range (Grid) | `minmax(200px, 1fr)` |
| `repeat()` | Repeat pattern (Grid) | `repeat(3, 1fr)` |
