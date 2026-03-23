# 19. CSS Grid

## What is CSS Grid?

**CSS Grid** is a **two-dimensional** layout system for creating complex layouts with rows and columns simultaneously.

```css
.container {
  display: grid;
}
```

---

## Grid Container Properties

### grid-template-columns / grid-template-rows

```css
/* Fixed widths */
.grid { grid-template-columns: 200px 200px 200px; }

/* Fractional units (proportional) */
.grid { grid-template-columns: 1fr 2fr 1fr; }     /* 3 columns: 25% 50% 25% */

/* Mixed */
.grid { grid-template-columns: 250px 1fr; }         /* Sidebar + content */
.grid { grid-template-columns: 200px 1fr 200px; }   /* Holy grail */

/* repeat() */
.grid { grid-template-columns: repeat(3, 1fr); }     /* 3 equal columns */
.grid { grid-template-columns: repeat(4, 200px); }   /* 4 × 200px columns */
.grid { grid-template-columns: repeat(3, 1fr 2fr); } /* 6 columns: 1fr 2fr 1fr 2fr 1fr 2fr */

/* Rows */
.grid {
  grid-template-rows: 80px 1fr 60px;                 /* Header, main, footer */
}
```

### Auto-Fill vs Auto-Fit

```css
/* auto-fill: Creates as many columns as fit, empty columns preserved */
.grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }

/* auto-fit: Same, but empty columns collapse to 0 */
.grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
```

> Use `auto-fill` when you want consistent column count. Use `auto-fit` when items should stretch to fill remaining space.

### gap

```css
.grid { gap: 20px; }                 /* Row and column gap */
.grid { gap: 20px 30px; }           /* Row gap, column gap */
.grid { row-gap: 20px; }
.grid { column-gap: 30px; }
```

---

### grid-template-areas

Name regions of the grid:

```css
.layout {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "sidebar main   aside"
    "footer  footer  footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

### Use `.` for empty cells

```css
.grid {
  grid-template-areas:
    "header header"
    "sidebar main"
    ". footer";
}
```

---

### justify-items / align-items

Aligns items **within their grid cells**:

```css
.grid { justify-items: stretch; }    /* Default: items fill cell width */
.grid { justify-items: start; }      /* Left-align items in cells */
.grid { justify-items: center; }     /* Center items in cells */
.grid { justify-items: end; }        /* Right-align items in cells */

.grid { align-items: stretch; }      /* Default: items fill cell height */
.grid { align-items: start; }        /* Top-align */
.grid { align-items: center; }       /* Center vertically */
.grid { align-items: end; }          /* Bottom-align */

.grid { place-items: center; }       /* Shorthand: align + justify */
```

### justify-content / align-content

Aligns the **entire grid** within the container:

```css
.grid { justify-content: center; }       /* Center grid horizontally */
.grid { align-content: center; }         /* Center grid vertically */
.grid { place-content: center; }         /* Both */

/* Also: start, end, space-between, space-around, space-evenly */
```

---

## Grid Item Properties

### grid-column / grid-row

```css
.item {
  grid-column: 1 / 3;        /* Span from line 1 to line 3 (2 columns) */
  grid-row: 1 / 2;           /* Span 1 row */
}

/* Shorthand with span */
.wide { grid-column: span 2; }    /* Span 2 columns */
.tall { grid-row: span 3; }       /* Span 3 rows */

/* Full width */
.full-width { grid-column: 1 / -1; }  /* From first to last line */
```

### grid-area

```css
/* Assign to named area */
.header { grid-area: header; }

/* Or specify: row-start / col-start / row-end / col-end */
.item { grid-area: 1 / 1 / 3 / 4; }
```

### justify-self / align-self

Override alignment for **single items**:

```css
.item { justify-self: center; }
.item { align-self: end; }
.item { place-self: center; }       /* Both */
```

---

## Sizing Functions

### minmax()

```css
/* Column: at least 200px, at most 1fr */
.grid { grid-template-columns: repeat(3, minmax(200px, 1fr)); }

/* Auto-responsive grid */
.grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
```

### min-content / max-content / fit-content

```css
.grid {
  grid-template-columns:
    min-content    /* As narrow as possible */
    max-content    /* As wide as needed (no wrapping) */
    fit-content(300px)  /* Like max-content but capped at 300px */
    1fr;
}
```

### auto

```css
.grid {
  grid-template-columns: auto 1fr;     /* First col: content width */
  grid-template-rows: auto 1fr auto;   /* Header/footer: content height */
}
```

---

## Implicit Grid

When items are placed outside the explicit grid:

```css
.grid {
  grid-template-columns: repeat(3, 1fr);
  /* If more items than columns: */
  grid-auto-rows: 200px;              /* Implicit rows are 200px */
  grid-auto-rows: minmax(100px, auto); /* At least 100px, auto height */
  
  grid-auto-flow: row;                /* Default: fill rows first */
  grid-auto-flow: column;             /* Fill columns first */
  grid-auto-flow: dense;              /* Fill gaps by reordering */
}
```

---

## Common Grid Patterns

### Responsive Card Grid (No Media Queries)

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### Dashboard Layout

```css
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
}
```

### Magazine Layout

```css
.magazine {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: 16px;
}

.featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

### 12-Column Grid System

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
```

### Centering with Grid

```css
.center {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
```

### Overlap / Layering

```css
.stack {
  display: grid;
}

.stack > * {
  grid-area: 1 / 1;     /* All items occupy same cell */
}

/* Image with text overlay */
.hero { display: grid; }
.hero img { grid-area: 1 / 1; width: 100%; }
.hero .overlay { grid-area: 1 / 1; display: grid; place-items: center; }
```

---

## Grid vs Flexbox

| Feature | Flexbox | Grid |
|---------|---------|------|
| Dimensions | **1D** (row or column) | **2D** (rows and columns) |
| Best for | Navigation, card rows, alignment | Page layouts, dashboards, galleries |
| Content-driven | Yes | Column-driven |
| Item sizing | Items define their size | Grid defines item size |
| Gap support | Yes | Yes |
| Overlapping | Difficult | Easy with same grid-area |

> **Use both together:** Grid for page layout, Flexbox for component layout.
