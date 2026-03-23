# 17. CSS Positioning

## Position Property

| Value | Behavior |
|-------|----------|
| `static` | Default — element in normal document flow |
| `relative` | Normal flow, then offset from its natural position |
| `absolute` | Removed from flow, positioned relative to nearest positioned ancestor |
| `fixed` | Removed from flow, positioned relative to viewport |
| `sticky` | Normal flow until scroll threshold, then fixed |

---

## static (Default)

```css
div {
  position: static;   /* Default — top/right/bottom/left/z-index have no effect */
}
```

---

## relative

Element stays in normal flow, but you can **offset** it:

```css
.box {
  position: relative;
  top: 10px;           /* Moves DOWN 10px from its natural position */
  left: 20px;          /* Moves RIGHT 20px from its natural position */
}
```

- Original space is **preserved** in the layout
- Creates a **positioning context** for absolute children
- Most common use: **parent container** for absolute children

---

## absolute

Element is **removed** from normal flow, positioned relative to nearest **positioned ancestor** (parent with `position: relative/absolute/fixed/sticky`):

```css
.parent {
  position: relative;   /* Creates positioning context */
}

.child {
  position: absolute;
  top: 0;
  right: 0;            /* Top-right corner of parent */
}
```

### Common Patterns

```css
/* Center absolutely positioned element */
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Full overlay */
.overlay {
  position: absolute;
  inset: 0;            /* Shorthand for top: 0; right: 0; bottom: 0; left: 0; */
  background: rgba(0, 0, 0, 0.5);
}

/* Badge on card corner */
.card { position: relative; }
.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: red;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}
```

---

## fixed

Element is positioned relative to the **viewport** — stays in place during scrolling:

```css
/* Fixed header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Add padding to body so content isn't hidden behind header */
body { padding-top: 64px; }

/* Floating action button */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 50;
  cursor: pointer;
}

/* Back to top button */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 50;
}
```

---

## sticky

Element behaves like `relative` until a **scroll threshold** is reached, then behaves like `fixed`:

```css
/* Sticky header */
.header {
  position: sticky;
  top: 0;              /* Sticks when scrolled to top: 0 */
  z-index: 100;
  background: white;
}

/* Sticky sidebar */
.sidebar {
  position: sticky;
  top: 80px;           /* Sticks 80px from viewport top (below fixed header) */
  height: fit-content;
}

/* Sticky table header */
thead th {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

/* Sticky section headers */
.section-header {
  position: sticky;
  top: 0;
  background: #f9fafb;
  padding: 8px 16px;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}
```

### Sticky Requirements
- Must have `top`, `right`, `bottom`, or `left` specified
- Parent must **not** have `overflow: hidden` or `overflow: auto`
- Element sticks within its parent's bounds (stops sticking at parent's end)

---

## z-index

Controls stacking order of positioned elements:

```css
.behind { z-index: 1; }
.middle { z-index: 10; }
.front  { z-index: 100; }
```

### z-index Rules
- Only works on **positioned** elements (relative, absolute, fixed, sticky)
- Higher z-index = closer to the viewer
- `z-index: auto` = 0 (but doesn't create a stacking context)

### Recommended z-index Scale

```css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}
```

---

## Stacking Context

A **stacking context** is a self-contained z-index scope. Elements inside a stacking context are stacked relative to each other, not to outside elements.

### What Creates a Stacking Context

- Root element (`<html>`)
- `position: absolute/relative` with `z-index` ≠ auto
- `position: fixed/sticky`
- `opacity` < 1
- `transform`, `filter`, `backdrop-filter` (any value)
- `will-change: transform/opacity`
- `isolation: isolate`
- Flex/Grid children with `z-index` ≠ auto

### Isolation

```css
/* Force a new stacking context without side effects */
.modal-container {
  isolation: isolate;
}
```

---

## inset (Shorthand)

```css
/* Instead of top: 0; right: 0; bottom: 0; left: 0; */
.overlay {
  position: absolute;
  inset: 0;                     /* All sides: 0 */
}

.positioned {
  inset: 10px 20px;             /* top/bottom: 10px, left/right: 20px */
  inset: 10px 20px 30px 40px;  /* top right bottom left */
}
```

---

## Centering with Position

```css
/* Method 1: transform */
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Method 2: inset + margin auto */
.center {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 300px;     /* Must have explicit width */
  height: 200px;    /* Must have explicit height */
}
```
