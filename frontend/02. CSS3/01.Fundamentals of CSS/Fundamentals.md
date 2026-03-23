# 01. Fundamentals of CSS

## What is CSS?

**CSS** = **Cascading Style Sheets** — a style sheet language used to describe the presentation (layout, colors, fonts) of a document written in HTML or XML.

### The "Cascade" in CSS

The cascade is the algorithm that determines which CSS rule wins when multiple rules apply to the same element. It evaluates in this order:

1. **Origin & Importance** — User-agent (browser defaults) → Author → User → `!important`
2. **Specificity** — How specifically the selector targets the element
3. **Source Order** — Later rules override earlier ones (when specificity is equal)

---

## CSS Syntax

```css
selector {
  property: value;
  property: value;
}
```

### Example

```css
h1 {
  color: navy;
  font-size: 32px;
  text-align: center;
}
```

### Terminology

| Term | Meaning |
|------|---------|
| **Selector** | Targets which HTML elements to style |
| **Declaration Block** | The `{ }` block containing all declarations |
| **Declaration** | A single `property: value;` pair |
| **Property** | The CSS attribute to change (e.g., `color`, `margin`) |
| **Value** | The setting for that property (e.g., `red`, `20px`) |

---

## Three Ways to Add CSS

### 1. Inline CSS (in the HTML element)

```html
<p style="color: red; font-size: 18px;">Inline styled text</p>
```

- ❌ Highest specificity — hard to override
- ❌ No reusability
- ❌ Mixes content with presentation

### 2. Internal / Embedded CSS (in `<style>` tag)

```html
<head>
  <style>
    p {
      color: blue;
      font-size: 16px;
    }
  </style>
</head>
```

- ✅ Good for single-page styles
- ❌ Not reusable across pages

### 3. External CSS (separate `.css` file)

```html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
```

```css
/* styles.css */
p {
  color: green;
  font-size: 16px;
}
```

- ✅ **Recommended** — reusable, cacheable, clean separation
- ✅ One file styles multiple pages

---

## Basic Selectors

### Tag / Type Selector

Selects **all** elements of that tag:

```css
p { color: hotpink; }        /* All <p> elements */
h1 { font-size: 36px; }      /* All <h1> elements */
```

### ID Selector (`#`)

Selects **one unique** element by its `id` attribute:

```css
#header { background: navy; }
#intro { color: green; }
```

```html
<div id="header">Only one element can have this ID</div>
```

> **Rule:** IDs must be unique per page. Use classes for shared styles.

### Class Selector (`.`)

Selects **all** elements with that class:

```css
.highlight { background: yellow; }
.error { color: red; font-weight: bold; }
```

```html
<p class="highlight">Highlighted paragraph</p>
<span class="error">Error message</span>
<p class="highlight error">Both classes applied</p>
```

### Universal Selector (`*`)

Selects **every** element:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;   /* Very common reset */
}
```

---

## How CSS is Processed by the Browser

```
HTML Document
    ↓
Parse HTML → DOM Tree
    ↓
Parse CSS → CSSOM (CSS Object Model)
    ↓
Combine DOM + CSSOM → Render Tree
    ↓
Layout (compute positions/sizes)
    ↓
Paint (draw pixels to screen)
    ↓
Composite (layer composition)
```

### Key Concepts

| Concept | Meaning |
|---------|---------|
| **DOM** | Document Object Model — tree structure of HTML elements |
| **CSSOM** | CSS Object Model — tree structure of all CSS rules |
| **Render Tree** | Combines DOM + CSSOM; only includes visible elements |
| **Layout / Reflow** | Calculating the geometry (position, size) of each element |
| **Paint** | Filling in pixels (colors, borders, shadows, text) |
| **Composite** | Combining painted layers in the correct order |

---

## CSS Comments

```css
/* This is a single-line comment */

/*
  This is a 
  multi-line comment
*/

p {
  color: blue;   /* inline comment */
  /* font-size: 20px; */  /* commented-out declaration */
}
```

---

## CSS Units

### Absolute Units

| Unit | Meaning |
|------|---------|
| `px` | Pixels (most common absolute unit) |
| `pt` | Points (1pt = 1/72 inch, used in print) |
| `cm` | Centimeters |
| `mm` | Millimeters |
| `in` | Inches |

### Relative Units

| Unit | Relative To |
|------|-------------|
| `em` | Parent element's font-size |
| `rem` | Root element's (`<html>`) font-size |
| `%` | Parent element's corresponding property |
| `vw` | 1% of viewport width |
| `vh` | 1% of viewport height |
| `vmin` | 1% of smaller viewport dimension |
| `vmax` | 1% of larger viewport dimension |
| `ch` | Width of the "0" character |
| `lh` | Line height of the element |
| `dvh` | Dynamic viewport height (accounts for mobile browser chrome) |
| `svh` | Small viewport height |
| `lvh` | Large viewport height |

### em vs rem

```css
html { font-size: 16px; }      /* 1rem = 16px */

.parent { font-size: 20px; }
.child {
  font-size: 1.5em;            /* 1.5 × 20px = 30px (relative to parent) */
  padding: 1.5rem;             /* 1.5 × 16px = 24px (relative to root) */
}
```

> **Best Practice:** Use `rem` for consistent sizing across the page, `em` for component-relative scaling.

---

## Specificity

Specificity determines which CSS rule wins when multiple rules target the same element.

### Specificity Score (A, B, C)

| Component | What Counts | Weight |
|-----------|-------------|--------|
| **A** | Inline styles (`style="..."`) | 1,0,0 |
| **B** | ID selectors (`#id`) | 0,1,0 |
| **C** | Class (`.class`), attribute (`[attr]`), pseudo-class (`:hover`) | 0,0,1 |
| — | Type (`h1`), pseudo-element (`::before`) | 0,0,1* |
| — | Universal (`*`), combinator (` `, `>`, `+`, `~`) | 0,0,0 |

*Type selectors have a separate lower tier in the full algorithm.

### Examples

```css
p { }                    /* (0,0,1) — 1 type selector */
.intro { }               /* (0,1,0) — 1 class */
#header { }              /* (1,0,0) — 1 ID */
p.intro { }              /* (0,1,1) — 1 type + 1 class */
#header .nav li.active { } /* (1,1,2) — 1 ID + 1 class + 2 types */
```

### !important

Forces a declaration to win regardless of specificity:

```css
p {
  color: red !important;   /* Wins over any specificity */
}
```

> **Warning:** Avoid `!important` — it breaks the natural cascade and makes debugging harder. Use higher specificity selectors instead.

---

## Inheritance

Some CSS properties are **inherited** by child elements automatically:

### Commonly Inherited Properties
- `color`
- `font-family`, `font-size`, `font-weight`, `font-style`
- `line-height`, `letter-spacing`, `word-spacing`
- `text-align`, `text-transform`, `text-indent`
- `visibility`
- `cursor`
- `list-style`

### Not Inherited (must be set explicitly)
- `margin`, `padding`, `border`
- `width`, `height`
- `background`
- `display`, `position`
- `overflow`

### Controlling Inheritance

```css
.child {
  color: inherit;     /* Explicitly inherit from parent */
  border: initial;    /* Reset to browser default */
  margin: unset;      /* inherit if inheritable, initial if not */
  all: unset;         /* Reset ALL properties */
}
```

---

## CSS Reset vs Normalize

### Reset (removes all defaults)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

### Normalize (makes defaults consistent across browsers)

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
```

### Modern Reset (Recommended)

```css
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
```
