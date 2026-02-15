# 29. Subgrid & Advanced Layout

## CSS Subgrid

Subgrid allows a grid child to **inherit** its parent's grid tracks, keeping rows/columns aligned across nested elements.

### Problem Without Subgrid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Each card has its own height — headers and footers DON'T align */
.card {
  display: grid;
  grid-template-rows: auto 1fr auto;  /* Independent rows — not synced! */
}
```

### Solution With Subgrid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: auto;             /* Cards spanning multiple rows */
  gap: 1.5rem;
}

.card {
  display: grid;
  grid-row: span 3;                  /* Card spans 3 parent rows */
  grid-template-rows: subgrid;       /* Inherit parent's row tracks! */
  gap: 0;
}
```

Now all card headers, bodies, and footers align across columns.

### Column Subgrid

```css
.parent {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.child {
  grid-column: span 6;
  display: grid;
  grid-template-columns: subgrid;    /* Inherit parent's column tracks */
}
```

### Browser Support

Chrome 117+, Firefox 71+, Safari 16+, Edge 117+

---

## aspect-ratio

Maintain an element's width-to-height ratio:

```css
.video { aspect-ratio: 16 / 9; }
.square { aspect-ratio: 1 / 1; }    /* Or just: 1 */
.poster { aspect-ratio: 2 / 3; }
.golden { aspect-ratio: 1.618 / 1; }
```

```css
/* Responsive image container */
.image-container {
  aspect-ratio: 4 / 3;
  width: 100%;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsive video embed */
iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
}
```

---

## object-fit

Controls how replaced elements (images, videos) fit their container:

```css
img {
  width: 100%;
  height: 300px;
  object-fit: fill;         /* Default: stretches to fill (distorts) */
  object-fit: contain;      /* Fits inside, preserves ratio (may letterbox) */
  object-fit: cover;        /* Fills container, preserves ratio (may crop) */
  object-fit: none;         /* Natural size (may overflow) */
  object-fit: scale-down;   /* Like contain, but never upscales */
}
```

### object-position

Where the image is positioned within its box:

```css
img {
  object-fit: cover;
  object-position: center;         /* Default */
  object-position: top;            /* Crop from bottom */
  object-position: right 20%;      /* Focus on right side */
  object-position: 30% 70%;       /* Custom offset */
}
```

### Common Pattern: Avatar

```css
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
}
```

---

## content-visibility

Optimize rendering by skipping off-screen content:

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;  /* Estimated height for layout */
}
```

| Value | Behavior |
|-------|----------|
| `visible` | Normal rendering (default) |
| `hidden` | Like `display: none` but keeps state, accessible |
| `auto` | Skip rendering of off-screen content (huge performance boost) |

### contain-intrinsic-size

Provides a placeholder size so the page doesn't jump when off-screen content renders:

```css
.article {
  content-visibility: auto;
  contain-intrinsic-size: 0 800px;    /* Width: auto, Height estimate: 800px */
  contain-intrinsic-size: auto 800px; /* Remembers rendered size */
}
```

> `content-visibility: auto` can dramatically improve initial page load for long pages.

---

## Masonry Layout (Experimental)

Create Pinterest-style layouts:

```css
/* Experimental — Chrome flag / Firefox flag */
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: masonry;           /* Items pack vertically */
  gap: 16px;
}
```

### JavaScript Polyfill (Current Practical Approach)

```css
/* CSS Columns approach (works now) */
.masonry-columns {
  columns: 3;
  column-gap: 1rem;
}

.masonry-columns .item {
  break-inside: avoid;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .masonry-columns { columns: 2; }
}

@media (max-width: 480px) {
  .masonry-columns { columns: 1; }
}
```

---

## Multi-Column Layout

```css
.article {
  columns: 3;                   /* 3 columns */
  columns: 300px;               /* Auto number, each ~300px wide */
  columns: 3 300px;             /* Prefer 3 columns, min 300px each */
  
  column-gap: 2rem;
  column-rule: 1px solid #e5e7eb;  /* Divider between columns */
}

/* Prevent element from splitting across columns */
.no-break {
  break-inside: avoid;
}

/* Element spans all columns */
.full-width {
  column-span: all;
}
```

---

## contain

CSS containment — tell the browser what won't affect the rest of the page:

```css
.widget {
  contain: layout;            /* Layout changes are isolated */
  contain: paint;             /* Nothing paints outside the box */
  contain: size;              /* Size doesn't depend on children */
  contain: style;             /* Counters/etc don't leak */
  contain: content;           /* Shorthand: layout + paint */
  contain: strict;            /* Shorthand: layout + paint + size */
}
```

### Benefits
- Enables browser optimizations
- Required for `container-type` (container queries)
- Prevents accidental layout side effects

---

## Advanced Grid Techniques

### Dense Packing

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-flow: dense;      /* Fill gaps by reordering items */
  gap: 8px;
}

.gallery .wide { grid-column: span 2; }
.gallery .tall { grid-row: span 2; }
```

### Named Grid Lines

```css
.layout {
  display: grid;
  grid-template-columns:
    [full-start] 1fr
    [content-start] minmax(0, 800px)
    [content-end] 1fr
    [full-end];
}

.full-width { grid-column: full-start / full-end; }
.content { grid-column: content-start / content-end; }
```

### Responsive Without Media Queries

```css
/* RAM pattern: Repeat, Auto, Minmax */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: 1.5rem;
}
```
