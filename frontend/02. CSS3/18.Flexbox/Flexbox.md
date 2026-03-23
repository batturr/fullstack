# 18. Flexbox

## What is Flexbox?

**Flexbox** (Flexible Box Layout) is a **one-dimensional** layout system for arranging items in rows or columns with powerful alignment and distribution controls.

```css
.container {
  display: flex;          /* Creates a flex container */
}
```

---

## Flex Container Properties

### flex-direction

```css
.container { flex-direction: row; }            /* ← Default: left-to-right */
.container { flex-direction: row-reverse; }    /* → Right-to-left */
.container { flex-direction: column; }         /* ↓ Top-to-bottom */
.container { flex-direction: column-reverse; } /* ↑ Bottom-to-top */
```

### flex-wrap

```css
.container { flex-wrap: nowrap; }     /* Default: all items on one line (may overflow) */
.container { flex-wrap: wrap; }       /* Items wrap to next line */
.container { flex-wrap: wrap-reverse; } /* Items wrap upward */
```

### flex-flow (Shorthand)

```css
.container { flex-flow: row wrap; }    /* direction + wrap */
```

---

### justify-content (Main Axis)

Distributes items along the **main axis** (horizontal for `row`, vertical for `column`):

```css
.container { justify-content: flex-start; }     /* |||_______ Pack to start (default) */
.container { justify-content: flex-end; }       /* _______|||  Pack to end */
.container { justify-content: center; }         /* ___|||___  Center items */
.container { justify-content: space-between; }  /* |___||___| First & last at edges */
.container { justify-content: space-around; }   /* _|__|__|_  Equal space around each */
.container { justify-content: space-evenly; }   /* _|_|_|_|_  Equal space everywhere */
```

### align-items (Cross Axis)

Aligns items along the **cross axis** (vertical for `row`, horizontal for `column`):

```css
.container { align-items: stretch; }       /* Default: items stretch to fill */
.container { align-items: flex-start; }    /* Items at top */
.container { align-items: flex-end; }      /* Items at bottom */
.container { align-items: center; }        /* Items centered vertically */
.container { align-items: baseline; }      /* Items aligned by text baseline */
```

### align-content (Multi-line)

Controls spacing between **wrapped lines** (only works with `flex-wrap: wrap`):

```css
.container { align-content: flex-start; }
.container { align-content: flex-end; }
.container { align-content: center; }
.container { align-content: space-between; }
.container { align-content: space-around; }
.container { align-content: stretch; }       /* Default */
```

### gap

Space between flex items:

```css
.container { gap: 16px; }                /* Row and column gap */
.container { gap: 16px 24px; }           /* Row gap, column gap */
.container { row-gap: 16px; }
.container { column-gap: 24px; }
```

---

## Flex Item Properties

### flex-grow

How much an item should **grow** relative to siblings:

```css
.item { flex-grow: 0; }    /* Default: don't grow */
.item { flex-grow: 1; }    /* Grow to fill available space */
.item-wide { flex-grow: 2; }  /* Grow twice as much as flex-grow: 1 */
```

### flex-shrink

How much an item should **shrink** when space is limited:

```css
.item { flex-shrink: 1; }     /* Default: can shrink */
.item { flex-shrink: 0; }     /* Don't shrink at all */
.item { flex-shrink: 3; }     /* Shrink 3× faster than default */
```

### flex-basis

The **initial size** of an item before growing/shrinking:

```css
.item { flex-basis: auto; }     /* Default: use width/height */
.item { flex-basis: 200px; }    /* Start at 200px */
.item { flex-basis: 30%; }      /* Start at 30% of container */
.item { flex-basis: 0; }        /* Ignore content size, distribute equally */
```

### flex (Shorthand)

```css
/* flex: grow shrink basis */
.item { flex: 0 1 auto; }     /* Default */
.item { flex: 1; }            /* flex: 1 1 0 — grow equally */
.item { flex: auto; }         /* flex: 1 1 auto — grow based on content */
.item { flex: none; }         /* flex: 0 0 auto — rigid, no grow/shrink */
.item { flex: 2 1 200px; }    /* Custom: grow 2×, shrink 1×, start 200px */
```

### align-self

Override `align-items` for a **single item**:

```css
.item { align-self: auto; }         /* Use parent's align-items */
.item { align-self: flex-start; }
.item { align-self: flex-end; }
.item { align-self: center; }
.item { align-self: stretch; }
.item { align-self: baseline; }
```

### order

Change visual order (default is 0):

```css
.first  { order: -1; }    /* Appears first */
.normal { order: 0; }     /* Default */
.last   { order: 1; }     /* Appears last */
```

> **Accessibility warning:** `order` only changes visual order, not tab/screen-reader order.

---

## Common Flexbox Patterns

### Center Everything

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

### Navigation Bar

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}
```

### Card Row (Equal Height)

```css
.card-row {
  display: flex;
  gap: 1.5rem;
}

.card {
  flex: 1;               /* Equal width cards */
  display: flex;
  flex-direction: column;
}

.card-body {
  flex: 1;               /* Body fills remaining height */
}

.card-footer {
  margin-top: auto;      /* Push footer to bottom */
}
```

### Sidebar Layout

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex: 0 0 260px;       /* Fixed 260px, no grow, no shrink */
}

.content {
  flex: 1;               /* Takes remaining space */
  padding: 2rem;
}
```

### Holy Grail Layout

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  display: flex;
  flex: 1;
}

.content { flex: 1; }
.sidebar-left { flex: 0 0 200px; order: -1; }
.sidebar-right { flex: 0 0 200px; }
```

### Wrap with Auto-Sizing

```css
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  flex: 0 0 auto;         /* Don't grow or shrink */
  padding: 4px 12px;
  border-radius: 999px;
  background: #e5e7eb;
}
```

### Media Object (Image + Text)

```css
.media {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.media-image {
  flex-shrink: 0;          /* Image doesn't shrink */
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.media-body {
  flex: 1;
}
```

### Input with Button

```css
.input-group {
  display: flex;
}

.input-group input {
  flex: 1;
  border-right: none;
  border-radius: 8px 0 0 8px;
}

.input-group button {
  flex-shrink: 0;
  border-radius: 0 8px 8px 0;
}
```

---

## Responsive Flexbox

```css
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card {
  flex: 1 1 300px;         /* Min 300px, grow to fill row */
  max-width: 100%;
}
```
