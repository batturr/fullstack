# 10. Advanced CSS Properties

## opacity

Controls element transparency (0 = invisible, 1 = fully visible):

```css
div { opacity: 1; }       /* Fully opaque (default) */
div { opacity: 0.5; }     /* 50% transparent */
div { opacity: 0; }       /* Invisible (still in layout) */
```

> **Note:** `opacity` affects the **entire element** and all its children.

### opacity vs rgba/hsla

```css
/* opacity: fades EVERYTHING — text, borders, backgrounds */
.card {
  background: black;
  color: white;
  opacity: 0.5;       /* Text becomes 50% transparent too! */
}

/* rgba: fades ONLY the background */
.card {
  background: rgba(0, 0, 0, 0.5);  /* 50% transparent background */
  color: white;                       /* Text stays fully opaque */
}
```

### Opacity in Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

---

## display

### All Display Values

| Value | Behavior |
|-------|----------|
| `none` | Removed from layout entirely |
| `block` | Full width, starts on new line |
| `inline` | Content width, inline flow |
| `inline-block` | Inline flow with block features |
| `flex` | Flex container |
| `inline-flex` | Inline flex container |
| `grid` | Grid container |
| `inline-grid` | Inline grid container |
| `contents` | Box removed, children inherit layout |
| `flow-root` | Block box that creates new BFC |
| `table` | Behaves like `<table>` |
| `list-item` | Behaves like `<li>` |

---

## visibility

```css
div { visibility: visible; }     /* Default: element is visible */
div { visibility: hidden; }      /* Invisible but STILL takes up space */
div { visibility: collapse; }    /* For table rows/columns */
```

### display: none vs visibility: hidden vs opacity: 0

| | `display: none` | `visibility: hidden` | `opacity: 0` |
|---|---|---|---|
| Occupies space | No | **Yes** | **Yes** |
| Events (click, hover) | No | No | **Yes** |
| Accessible to screen readers | No | No | Depends |
| Children affected | All hidden | Can override | All transparent |
| Transitions | Can't transition | Can transition | Can transition |

### Visibility Override on Children

```css
.parent { visibility: hidden; }
.parent .child { visibility: visible; }   /* Child becomes visible! */
/* This doesn't work with display: none or opacity: 0 */
```

---

## overflow

Controls what happens when content overflows its container:

```css
div { overflow: visible; }   /* Default: content spills outside */
div { overflow: hidden; }    /* Content is clipped */
div { overflow: scroll; }    /* Always show scrollbars */
div { overflow: auto; }      /* Show scrollbars only when needed */
div { overflow: clip; }      /* Like hidden, but prevents programmatic scroll */
```

### Per-Axis Overflow

```css
div {
  overflow-x: auto;        /* Horizontal scrollbar if needed */
  overflow-y: hidden;      /* Clip vertically */
}
```

### Scroll Behavior

```css
html {
  scroll-behavior: smooth;    /* Smooth scrolling for anchor links */
}

.container {
  overflow-y: auto;
  scroll-behavior: smooth;
  overscroll-behavior: contain;   /* Prevent scroll chaining */
}
```

### Custom Scrollbar (WebKit)

```css
.scrollable::-webkit-scrollbar {
  width: 8px;
}

.scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scrollable::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Standard (Firefox) */
.scrollable {
  scrollbar-width: thin;             /* auto | thin | none */
  scrollbar-color: #888 #f1f1f1;    /* thumb track */
}
```

---

## cursor

Changes the mouse cursor:

```css
.default { cursor: default; }        /* Arrow */
.pointer { cursor: pointer; }        /* Hand (clickable) */
.text { cursor: text; }              /* I-beam (text selection) */
.move { cursor: move; }              /* Move cursor */
.not-allowed { cursor: not-allowed; } /* Prohibited */
.wait { cursor: wait; }              /* Loading spinner */
.crosshair { cursor: crosshair; }   /* Crosshair */
.grab { cursor: grab; }             /* Open hand */
.grabbing { cursor: grabbing; }     /* Closed hand */
.zoom-in { cursor: zoom-in; }       /* Zoom in */
.zoom-out { cursor: zoom-out; }     /* Zoom out */
.help { cursor: help; }             /* Question mark */
```

### Resize Cursors

```css
.resize-ew { cursor: ew-resize; }    /* ↔ East-West */
.resize-ns { cursor: ns-resize; }    /* ↕ North-South */
.resize-nw { cursor: nwse-resize; }  /* ↘ Northwest-Southeast */
.resize-ne { cursor: nesw-resize; }  /* ↙ Northeast-Southwest */
.resize-col { cursor: col-resize; }  /* Column resize */
.resize-row { cursor: row-resize; }  /* Row resize */
```

### Custom Cursor

```css
.custom {
  cursor: url("custom-cursor.png") 12 12, auto;
  /* url, hotspot-x, hotspot-y, fallback */
}
```

---

## resize

Allow users to resize elements:

```css
textarea { resize: both; }     /* Default for textarea */
div { resize: horizontal; }    /* Only horizontal resize */
div { resize: vertical; }      /* Only vertical resize */
div { resize: none; }          /* Disable resize */
div { resize: block; }         /* Block axis only */
div { resize: inline; }        /* Inline axis only */
```

> Element must have `overflow` set to something other than `visible` for `resize` to work.

```css
.resizable {
  overflow: auto;
  resize: both;
  min-width: 200px;
  max-width: 600px;
  min-height: 100px;
  max-height: 400px;
}
```

---

## pointer-events

```css
.disabled {
  pointer-events: none;    /* Element ignores all mouse/touch events */
  opacity: 0.5;            /* Visual feedback */
}

.clickable {
  pointer-events: auto;    /* Default: element receives events */
}
```

---

## user-select

Control text selection:

```css
.no-select { user-select: none; }     /* Cannot select text */
.all-select { user-select: all; }     /* Click selects all text */
.auto-select { user-select: auto; }   /* Default browser behavior */
.text-select { user-select: text; }   /* Allow text selection */
```

---

## accent-color

Style native form controls:

```css
:root {
  accent-color: #3b82f6;    /* Changes checkbox, radio, range, progress colors */
}

input[type="checkbox"] { accent-color: green; }
input[type="radio"] { accent-color: purple; }
input[type="range"] { accent-color: #ff6b6b; }
progress { accent-color: orange; }
```

---

## caret-color

Color of the text cursor in input fields:

```css
input {
  caret-color: #3b82f6;      /* Blue text cursor */
}

input.error {
  caret-color: red;
}
```
