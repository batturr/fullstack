# 03. Font Styles

## font-family

Specifies the typeface. Always provide **fallback fonts**:

```css
body {
  font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

code {
  font-family: "Fira Code", "Cascadia Code", "Courier New", monospace;
}
```

### Generic Font Families

| Generic | Description | Examples |
|---------|-------------|----------|
| `serif` | Has small decorative strokes | Times New Roman, Georgia |
| `sans-serif` | Clean, no decorative strokes | Arial, Helvetica, Roboto |
| `monospace` | Fixed-width characters | Courier New, Fira Code |
| `cursive` | Handwriting-style | Comic Sans MS, Brush Script |
| `fantasy` | Decorative | Impact, Papyrus |
| `system-ui` | OS default UI font | San Francisco, Segoe UI |
| `ui-serif` | OS default serif | New York |
| `ui-sans-serif` | OS default sans-serif | San Francisco |
| `ui-monospace` | OS default monospace | SF Mono |
| `math` | Mathematical typography | Latin Modern Math |

### Modern System Font Stack

```css
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont,
               "Segoe UI", Roboto, "Helvetica Neue", Arial,
               "Noto Sans", sans-serif, "Apple Color Emoji",
               "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
```

---

## font-size

### Absolute vs Relative

```css
h1 { font-size: 32px; }     /* Absolute: fixed size */
h1 { font-size: 2rem; }     /* Relative: 2× root font-size */
h1 { font-size: 2em; }      /* Relative: 2× parent font-size */
h1 { font-size: 200%; }     /* Relative: 2× parent font-size */
```

### Keyword Sizes

```css
p { font-size: xx-small; }   /* ~9px */
p { font-size: x-small; }    /* ~10px */
p { font-size: small; }      /* ~13px */
p { font-size: medium; }     /* ~16px (default) */
p { font-size: large; }      /* ~18px */
p { font-size: x-large; }    /* ~24px */
p { font-size: xx-large; }   /* ~32px */
p { font-size: xxx-large; }  /* ~48px */
```

### Responsive Font Sizing with clamp()

```css
h1 {
  /* min: 1.5rem, preferred: 5vw, max: 3.5rem */
  font-size: clamp(1.5rem, 5vw, 3.5rem);
}

p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}
```

### Type Scale (Recommended Sizes)

```css
:root {
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
}
```

---

## font-weight

Controls the thickness of text:

| Value | Keyword | Description |
|-------|---------|-------------|
| `100` | `thin` | Ultra light |
| `200` | `extra-light` | Very light |
| `300` | `light` | Light |
| `400` | `normal` | Regular (**default**) |
| `500` | `medium` | Medium |
| `600` | `semi-bold` | Semi bold |
| `700` | `bold` | Bold |
| `800` | `extra-bold` | Extra bold |
| `900` | `black` | Ultra bold |

```css
h1 { font-weight: 700; }      /* Bold */
h1 { font-weight: bold; }     /* Same as 700 */
p  { font-weight: 400; }      /* Normal */
p  { font-weight: normal; }   /* Same as 400 */
```

### Relative Keywords

```css
p { font-weight: lighter; }   /* One step lighter than parent */
p { font-weight: bolder; }    /* One step bolder than parent */
```

> **Note:** Not all fonts support all 9 weights. If a weight isn't available, the browser picks the nearest available weight.

---

## font-style

```css
p { font-style: normal; }     /* Default upright text */
p { font-style: italic; }     /* Italic (uses font's italic variant) */
p { font-style: oblique; }    /* Slanted (artificially tilted if no italic) */
p { font-style: oblique 14deg; }  /* Custom slant angle */
```

---

## font-variant

```css
p { font-variant: normal; }
p { font-variant: small-caps; }       /* SMALL CAPS TEXT */
p { font-variant-numeric: tabular-nums; }  /* Fixed-width numbers */
p { font-variant-numeric: oldstyle-nums; } /* Old-style numbers */
```

---

## font-stretch

```css
p { font-stretch: condensed; }
p { font-stretch: expanded; }
p { font-stretch: ultra-condensed; }
p { font-stretch: 75%; }    /* Custom stretch percentage */
```

> Requires a variable font or a font family with width variants.

---

## font (Shorthand)

```css
/* Shorthand: font-style font-variant font-weight font-size/line-height font-family */
p {
  font: italic small-caps bold 16px/1.5 "Georgia", serif;
}

/* Minimum required: font-size + font-family */
p {
  font: 16px Arial, sans-serif;
}
```

---

## @font-face (Custom Fonts)

Load fonts from files:

```css
@font-face {
  font-family: "MyCustomFont";
  src: url("fonts/MyFont.woff2") format("woff2"),
       url("fonts/MyFont.woff") format("woff");
  font-weight: 400;
  font-style: normal;
  font-display: swap;  /* Show fallback text while loading */
}

body {
  font-family: "MyCustomFont", sans-serif;
}
```

### Font Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| WOFF2 | `.woff2` | **Best** — smallest size, modern browsers |
| WOFF | `.woff` | Good — older browser fallback |
| TTF/OTF | `.ttf`/`.otf` | Desktop fonts, larger files |
| SVG | `.svg` | Legacy, not recommended |

### font-display Values

| Value | Behavior |
|-------|----------|
| `auto` | Browser decides |
| `swap` | Show fallback immediately, swap when loaded **(recommended)** |
| `block` | Hide text briefly, then show custom font |
| `fallback` | Very short block period, swap, give up if too slow |
| `optional` | Short block, use only if cached, otherwise fallback |

---

## Google Fonts

```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
body {
  font-family: "Inter", sans-serif;
}
```

### Using @import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

> **Tip:** `<link>` in HTML is faster than `@import` in CSS (non-blocking vs blocking).

---

## Variable Fonts

A single font file that contains multiple weights/widths/styles:

```css
@font-face {
  font-family: "InterVariable";
  src: url("Inter-Variable.woff2") format("woff2-variations");
  font-weight: 100 900;       /* Supports range */
  font-stretch: 75% 125%;
}

h1 {
  font-family: "InterVariable";
  font-weight: 650;           /* Any value in the range! */
  font-variation-settings: "wght" 650, "wdth" 90;
}
```

### Animating Variable Fonts

```css
@keyframes weight-change {
  from { font-weight: 100; }
  to { font-weight: 900; }
}

h1 {
  animation: weight-change 2s ease-in-out infinite alternate;
}
```

---

## Text Rendering & Smoothing

```css
body {
  -webkit-font-smoothing: antialiased;    /* macOS: smoother text */
  -moz-osx-font-smoothing: grayscale;    /* Firefox macOS */
  text-rendering: optimizeLegibility;      /* Better kerning/ligatures */
}
```
