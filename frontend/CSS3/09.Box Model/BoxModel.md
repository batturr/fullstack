# 09. Box Model

## What is the Box Model?

Every HTML element is a rectangular box with four layers:

```
┌──────────────────────────────────────────┐
│                 MARGIN                   │  ← Space outside the border
│  ┌────────────────────────────────────┐  │
│  │              BORDER                │  │  ← Visible border line
│  │  ┌──────────────────────────────┐  │  │
│  │  │           PADDING            │  │  │  ← Space between border and content
│  │  │  ┌────────────────────────┐  │  │  │
│  │  │  │        CONTENT         │  │  │  │  ← Text, images, child elements
│  │  │  │  (width × height)      │  │  │  │
│  │  │  └────────────────────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## border

### Individual Properties

```css
div {
  border-width: 2px;
  border-style: solid;
  border-color: #333;
}
```

### Shorthand

```css
div { border: 2px solid #333; }
```

### Per-Side

```css
div {
  border-top: 3px solid red;
  border-right: 1px dashed blue;
  border-bottom: 3px double green;
  border-left: none;
}
```

### border-style Values

| Value | Appearance |
|-------|-----------|
| `none` | No border (default) |
| `solid` | ─── |
| `dashed` | --- |
| `dotted` | ··· |
| `double` | ═══ |
| `groove` | 3D grooved (depends on border-color) |
| `ridge` | 3D ridged |
| `inset` | 3D inset |
| `outset` | 3D outset |
| `hidden` | Like none, but wins in border-collapse |

---

## border-radius

Round the corners:

```css
div { border-radius: 8px; }                /* All corners equal */
div { border-radius: 50%; }                /* Circle (on square elements) */
div { border-radius: 10px 20px 30px 40px; } /* TL TR BR BL */
div { border-radius: 10px 30px; }           /* TL/BR=10 TR/BL=30 */
```

### Elliptical Corners

```css
/* Horizontal-radii / Vertical-radii */
div { border-radius: 50px / 25px; }         /* Elliptical corners */
div { border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%; }  /* Blob shape */
```

### Individual Corners

```css
div {
  border-top-left-radius: 10px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 40px;
}
```

### Pill / Capsule Shape

```css
.pill {
  border-radius: 9999px;     /* Fully rounded ends */
  padding: 8px 24px;
}
```

---

## margin

Space **outside** the border:

```css
div { margin: 20px; }                       /* All sides */
div { margin: 10px 20px; }                  /* Top/Bottom Left/Right */
div { margin: 10px 20px 30px; }             /* Top Left/Right Bottom */
div { margin: 10px 20px 30px 40px; }        /* Top Right Bottom Left (clockwise) */
```

### Individual Sides

```css
div {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 30px;
  margin-left: 40px;
}
```

### Auto Margin (Centering)

```css
.container {
  width: 800px;
  margin: 0 auto;          /* Centers horizontally */
}

/* Flexbox centering with auto margins */
.child {
  margin: auto;             /* Centers in flex container */
}
```

### Negative Margin

```css
div {
  margin-top: -20px;        /* Pull element up */
  margin-left: -10px;       /* Pull element left */
}
```

### Margin Collapse

When **vertical** margins of adjacent block elements touch, they **collapse** — only the larger margin is used:

```css
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }
/* Gap between them: 30px (not 50px!) */
```

#### When Margins DO Collapse

- Adjacent siblings (vertical only)
- Parent and first/last child (if no border, padding, or content between)
- Empty blocks

#### When Margins DON'T Collapse

- Flexbox / Grid children
- Floated elements
- Absolutely/fixed positioned elements
- Elements with `overflow: hidden/auto/scroll`
- Inline-block elements

---

## padding

Space **inside** the border (between border and content):

```css
div { padding: 20px; }                       /* All sides */
div { padding: 10px 20px; }                  /* Top/Bottom Left/Right */
div { padding: 10px 20px 30px; }             /* Top Left/Right Bottom */
div { padding: 10px 20px 30px 40px; }        /* Top Right Bottom Left */
```

### Individual Sides

```css
div {
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 30px;
  padding-left: 40px;
}
```

> **Key difference:** Padding CANNOT be negative. Margin CAN be negative.

---

## outline

Drawn **outside** the border — does NOT affect layout:

```css
div {
  outline: 2px solid blue;
  outline-offset: 4px;           /* Gap between border and outline */
}
```

### Outline vs Border

| Feature | Border | Outline |
|---------|--------|---------|
| Affects layout | Yes | No |
| Per-side control | Yes | No |
| Border-radius | Follows corners | Follows corners (modern) |
| Offset | No | Yes (`outline-offset`) |
| Part of box model | Yes | No |

### Accessibility Warning

```css
/* ❌ NEVER remove focus outline without replacement */
button:focus { outline: none; }

/* ✅ Replace with a visible alternative */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## box-sizing

### content-box (Default)

```
Total width = width + padding-left + padding-right + border-left + border-right
```

```css
div {
  box-sizing: content-box;
  width: 300px;
  padding: 20px;
  border: 5px solid black;
  /* Actual width: 300 + 20 + 20 + 5 + 5 = 350px */
}
```

### border-box (Recommended)

```
Total width = width (includes padding + border)
```

```css
div {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 5px solid black;
  /* Actual width: 300px (content shrinks to 250px) */
}
```

### Universal Reset

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

## Logical Properties (Modern CSS)

Physical properties (`margin-left`, `padding-top`) don't adapt to writing direction. Logical properties do:

| Physical | Logical | Meaning |
|----------|---------|---------|
| `margin-top` | `margin-block-start` | Start of block axis |
| `margin-bottom` | `margin-block-end` | End of block axis |
| `margin-left` | `margin-inline-start` | Start of inline axis |
| `margin-right` | `margin-inline-end` | End of inline axis |
| `padding-top` | `padding-block-start` | Block start padding |
| `border-left` | `border-inline-start` | Inline start border |
| `width` | `inline-size` | Size along inline axis |
| `height` | `block-size` | Size along block axis |

```css
/* Works correctly for LTR AND RTL languages */
.card {
  margin-block: 1rem;         /* Top and bottom */
  margin-inline: auto;        /* Left and right */
  padding-inline: 2rem;
  border-inline-start: 4px solid blue;
}
```

---

## Visualizing the Box Model

Open **DevTools** → Select element → **Computed** tab → See the box model diagram.

```
                     margin
          ┌──────────────────────┐
          │        border        │
          │  ┌────────────────┐  │
          │  │    padding     │  │
          │  │  ┌──────────┐  │  │
          │  │  │ content  │  │  │
          │  │  │ 300×200  │  │  │
          │  │  └──────────┘  │  │
          │  └────────────────┘  │
          └──────────────────────┘
```
