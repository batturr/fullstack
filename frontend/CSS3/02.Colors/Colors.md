# 02. Colors in CSS

## Color Formats

CSS supports **7 color formats**:

| Format | Syntax | Example |
|--------|--------|---------|
| Named | `colorname` | `red`, `hotpink`, `rebeccapurple` |
| HEX | `#RRGGBB` | `#ff5733`, `#3498db` |
| HEX (short) | `#RGB` | `#f00` = `#ff0000` |
| HEX + Alpha | `#RRGGBBAA` | `#ff573380` (50% opacity) |
| RGB | `rgb(R, G, B)` | `rgb(255, 87, 51)` |
| RGBA | `rgba(R, G, B, A)` | `rgba(255, 87, 51, 0.5)` |
| HSL | `hsl(H, S%, L%)` | `hsl(14, 100%, 60%)` |
| HSLA | `hsla(H, S%, L%, A)` | `hsla(14, 100%, 60%, 0.5)` |
| OKLCH | `oklch(L C H)` | `oklch(0.7 0.15 30)` |
| OKLAB | `oklab(L a b)` | `oklab(0.7 0.1 0.08)` |

---

## Named Colors

CSS defines **148 named colors**:

```css
p { color: red; }
p { color: tomato; }
p { color: cornflowerblue; }
p { color: rebeccapurple; }     /* Added in CSS4 */
p { color: transparent; }       /* Fully transparent */
p { color: currentcolor; }      /* Inherits from the element's color */
```

> Named colors are convenient but limited. Use HEX/RGB/HSL for precise control.

---

## Hexadecimal (HEX) Colors

```
#RRGGBB
  │ │ │
  │ │ └─ Blue  (00-FF)
  │ └─── Green (00-FF)
  └───── Red   (00-FF)
```

```css
.red    { color: #ff0000; }     /* Pure red */
.green  { color: #00ff00; }     /* Pure green */
.blue   { color: #0000ff; }     /* Pure blue */
.white  { color: #ffffff; }     /* White */
.black  { color: #000000; }     /* Black */
.gray   { color: #808080; }     /* Gray */
```

### Shorthand (When pairs repeat)

```css
#ff0000 → #f00
#00ff00 → #0f0
#336699 → #369
```

### HEX with Alpha (Transparency)

```css
/* 8-digit hex: last 2 digits = opacity */
.overlay { background: #00000080; }   /* 50% black */
.overlay { background: #ffffff40; }   /* 25% white */

/* Alpha values: 00 = transparent, FF = opaque */
/* 80 = ~50%, 40 = ~25%, BF = ~75% */
```

---

## RGB / RGBA

Each channel: **0–255** (or 0%–100%):

```css
p { color: rgb(255, 0, 0); }           /* Red */
p { color: rgb(0, 128, 255); }         /* Blue */
p { color: rgba(0, 0, 0, 0.5); }       /* 50% black */
p { color: rgba(255, 255, 255, 0.8); }  /* 80% white */
```

### Modern Syntax (no commas)

```css
p { color: rgb(255 0 0); }             /* Red */
p { color: rgb(255 0 0 / 50%); }       /* 50% opacity red */
p { color: rgb(0 128 255 / 0.75); }    /* 75% opacity blue */
```

---

## HSL / HSLA

**HSL** = **Hue, Saturation, Lightness** — more intuitive than RGB.

```
hsl(H, S%, L%)
     │   │   │
     │   │   └─ Lightness: 0% = black, 50% = normal, 100% = white
     │   └───── Saturation: 0% = gray, 100% = full color
     └───────── Hue: 0-360 (color wheel angle)
```

### Hue Color Wheel

```
  0° / 360° = Red
  60°       = Yellow
  120°      = Green
  180°      = Cyan
  240°      = Blue
  300°      = Magenta
```

```css
.red     { color: hsl(0, 100%, 50%); }
.orange  { color: hsl(30, 100%, 50%); }
.yellow  { color: hsl(60, 100%, 50%); }
.green   { color: hsl(120, 100%, 50%); }
.blue    { color: hsl(240, 100%, 50%); }
.purple  { color: hsl(280, 100%, 50%); }
```

### Creating Tints and Shades with HSL

```css
/* Same hue, different lightness = tints/shades */
.blue-dark    { color: hsl(220, 80%, 20%); }  /* Dark blue */
.blue-base    { color: hsl(220, 80%, 50%); }  /* Base blue */
.blue-light   { color: hsl(220, 80%, 80%); }  /* Light blue */

/* Same hue, different saturation = vivid to muted */
.vivid  { color: hsl(220, 100%, 50%); }  /* Vivid */
.muted  { color: hsl(220, 30%, 50%); }   /* Muted / grayish */
.gray   { color: hsl(220, 0%, 50%); }    /* Pure gray */
```

> **Tip:** HSL is great for creating consistent color palettes — just vary lightness/saturation.

---

## OKLCH (Modern CSS)

**OKLCH** = **Lightness, Chroma, Hue** — perceptually uniform, more accurate than HSL.

```css
p { color: oklch(0.7 0.2 30); }
/*              L    C   H
    L = Lightness: 0 (black) to 1 (white)
    C = Chroma: 0 (gray) to ~0.37 (vivid)
    H = Hue: 0-360 (similar to HSL)
*/
```

```css
.red    { color: oklch(0.63 0.26 29); }
.green  { color: oklch(0.72 0.20 142); }
.blue   { color: oklch(0.45 0.22 264); }
```

> **Browser support:** All modern browsers (2024+).

---

## color-mix() Function

Mix two colors in a specified color space:

```css
.mixed {
  /* 50% red + 50% blue in sRGB space */
  color: color-mix(in srgb, red, blue);

  /* 30% red + 70% blue */
  background: color-mix(in srgb, red 30%, blue);

  /* Mix in OKLCH for better perceptual results */
  border-color: color-mix(in oklch, #3b82f6, white 20%);
}
```

---

## Color Properties

### Text Color

```css
p { color: #333333; }
h1 { color: navy; }
```

### Background Color

```css
div { background-color: #f0f0f0; }
body { background-color: rgb(245, 245, 245); }
```

### Border Color

```css
div { border: 2px solid hsl(220, 80%, 50%); }
```

### Opacity vs Alpha

```css
/* opacity: affects ENTIRE element including children */
.card {
  opacity: 0.5;   /* Everything inside becomes 50% transparent */
}

/* alpha channel: affects ONLY that color */
.card {
  background: rgba(0, 0, 0, 0.5);   /* Only background is 50% */
  color: white;                       /* Text stays fully opaque */
}
```

---

## currentcolor Keyword

Refers to the element's computed `color` value:

```css
.icon-button {
  color: blue;
  border: 2px solid currentcolor;      /* Blue border */
  box-shadow: 0 2px 4px currentcolor;  /* Blue shadow */
}

/* Change color = border & shadow change too! */
.icon-button:hover {
  color: red;   /* Border and shadow become red */
}
```

---

## System Color Keywords

CSS defines system colors for accessibility:

```css
.accessible {
  color: CanvasText;           /* Default text color */
  background: Canvas;          /* Default background */
  border-color: ButtonBorder;  /* Default button border */
}

/* Other system colors: LinkText, VisitedText, ActiveText, 
   ButtonFace, ButtonText, Field, FieldText, Highlight, 
   HighlightText, Mark, MarkText, GrayText */
```

---

## Color Contrast & Accessibility

| WCAG Level | Contrast Ratio | Use Case |
|------------|---------------|----------|
| AA (minimum) | 4.5:1 | Normal text (< 18px) |
| AA (large) | 3:1 | Large text (≥ 18px bold or ≥ 24px) |
| AAA (enhanced) | 7:1 | Normal text |
| AAA (large) | 4.5:1 | Large text |

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Inspect → Color picker → Contrast ratio
- Firefox DevTools → Accessibility panel

### Tips

```css
/* ❌ Poor contrast */
p { color: #999999; background: #ffffff; }  /* Ratio: 2.85:1 */

/* ✅ Good contrast */
p { color: #595959; background: #ffffff; }  /* Ratio: 7:1 */
```
