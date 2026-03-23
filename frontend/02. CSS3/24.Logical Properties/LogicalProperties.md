# 24. CSS Logical Properties

## What Are Logical Properties?

Logical properties replace physical direction-based properties (`left`, `right`, `top`, `bottom`) with **flow-relative** terms that adapt to writing direction and text orientation.

### Why?

- Physical properties (`margin-left`) are tied to the screen
- Logical properties (`margin-inline-start`) adapt to **LTR / RTL** and **horizontal / vertical** writing modes
- Essential for internationalization (i18n)

---

## Axes

| Axis | Physical (LTR) | Logical |
|------|----------------|---------|
| **Inline** | Left → Right | Start → End (text direction) |
| **Block** | Top → Bottom | Start → End (stacking direction) |

In left-to-right (LTR) horizontal text:
- **inline-start** = left
- **inline-end** = right
- **block-start** = top
- **block-end** = bottom

In right-to-left (RTL):
- **inline-start** = right
- **inline-end** = left

---

## Property Mapping

### Margin

| Physical | Logical |
|----------|---------|
| `margin-top` | `margin-block-start` |
| `margin-bottom` | `margin-block-end` |
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `margin: 10px 20px` | `margin-block: 10px; margin-inline: 20px;` |

```css
.card {
  margin-block: 1rem;       /* Top and bottom */
  margin-inline: auto;      /* Left and right (centering) */
}
```

### Padding

| Physical | Logical |
|----------|---------|
| `padding-top` | `padding-block-start` |
| `padding-bottom` | `padding-block-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |

```css
.sidebar {
  padding-block: 2rem;
  padding-inline: 1.5rem;
}
```

### Border

| Physical | Logical |
|----------|---------|
| `border-top` | `border-block-start` |
| `border-bottom` | `border-block-end` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |
| `border-top-left-radius` | `border-start-start-radius` |
| `border-top-right-radius` | `border-start-end-radius` |
| `border-bottom-left-radius` | `border-end-start-radius` |
| `border-bottom-right-radius` | `border-end-end-radius` |

```css
.list-item {
  border-block-end: 1px solid #e5e7eb;
  padding-inline-start: 1rem;
}
```

### Sizing

| Physical | Logical |
|----------|---------|
| `width` | `inline-size` |
| `height` | `block-size` |
| `min-width` | `min-inline-size` |
| `max-width` | `max-inline-size` |
| `min-height` | `min-block-size` |
| `max-height` | `max-block-size` |

```css
.card {
  inline-size: 100%;            /* width: 100% */
  max-inline-size: 600px;       /* max-width: 600px */
  min-block-size: 200px;        /* min-height: 200px */
}
```

### Position / Inset

| Physical | Logical |
|----------|---------|
| `top` | `inset-block-start` |
| `bottom` | `inset-block-end` |
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |

```css
.tooltip {
  position: absolute;
  inset-block-start: 100%;
  inset-inline-start: 0;
}
```

### Shorthand: inset

```css
.overlay {
  position: absolute;
  inset: 0;                    /* top: 0; right: 0; bottom: 0; left: 0; */
  inset-block: 10px;           /* top: 10px; bottom: 10px; */
  inset-inline: 20px;          /* left: 20px; right: 20px; */
}
```

### Text Alignment

| Physical | Logical |
|----------|---------|
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |

### Float & Clear

```css
img { float: inline-start; }     /* float: left in LTR, float: right in RTL */
.clear { clear: inline-end; }
```

### Overflow

```css
.scroll {
  overflow-inline: auto;       /* overflow-x in horizontal writing */
  overflow-block: hidden;      /* overflow-y in horizontal writing */
}
```

---

## RTL Support Example

```css
/* Works correctly for BOTH LTR and RTL */
.nav-item {
  padding-inline: 1rem;
  margin-inline-end: 0.5rem;
  border-inline-start: 3px solid #3b82f6;
}

/* Icon + text always correctly ordered */
.icon-text {
  display: flex;
  gap: 0.5rem;
}
.icon-text .icon {
  margin-inline-end: 0.25rem;
}
```

```html
<!-- LTR: border on left, margin on right -->
<div dir="ltr">
  <div class="nav-item">English</div>
</div>

<!-- RTL: border on right, margin on left (automatic!) -->
<div dir="rtl">
  <div class="nav-item">العربية</div>
</div>
```

---

## writing-mode

```css
.vertical { writing-mode: vertical-rl; }    /* Vertical, right-to-left */
.vertical { writing-mode: vertical-lr; }    /* Vertical, left-to-right */
.horizontal { writing-mode: horizontal-tb; } /* Default */
```

When `writing-mode: vertical-rl`:
- **inline** = vertical (top to bottom)
- **block** = horizontal (right to left)
- `inline-size` = height (not width!)
- `block-size` = width (not height!)

---

## When to Use Logical Properties

**Use logical properties when:**
- Building for multiple languages (LTR + RTL)
- Building component libraries
- Working with vertical text layouts
- Starting new projects (adopt as default)

**Physical properties are fine when:**
- Truly physical positioning (like `box-shadow` offset)
- Legacy browser support is critical
- Simple single-language projects
