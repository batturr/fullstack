# 26. Container Queries

## What Are Container Queries?

**Media queries** respond to the **viewport** size. **Container queries** respond to the **parent container** size. This makes components truly responsive — they adapt to the space they're placed in, not the screen.

---

## Basic Syntax

### 1. Define a Container

```css
.card-wrapper {
  container-type: inline-size;      /* Enable container queries on inline (width) axis */
}
```

### 2. Write Container Query

```css
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container (min-width: 700px) {
  .card {
    grid-template-columns: 300px 1fr;
    padding: 2rem;
  }
}
```

---

## container-type

| Value | Queried Dimensions |
|-------|-------------------|
| `normal` | No containment (default) |
| `inline-size` | Width queries only (**most common**) |
| `size` | Width AND height queries |

```css
.parent { container-type: inline-size; }
```

> `inline-size` is almost always what you want. `size` requires explicit height.

---

## container-name

Name containers to target specific ones:

```css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.main {
  container-type: inline-size;
  container-name: main-content;
}

/* Query specific containers */
@container sidebar (min-width: 200px) {
  .nav-item { font-size: 0.875rem; }
}

@container main-content (min-width: 600px) {
  .article { columns: 2; }
}
```

### Shorthand

```css
.parent {
  container: sidebar / inline-size;
  /* Same as:
     container-name: sidebar;
     container-type: inline-size; */
}
```

---

## Container Query Units

Size relative to the **container**, not the viewport:

| Unit | Relative To |
|------|-------------|
| `cqw` | 1% of container width |
| `cqh` | 1% of container height |
| `cqi` | 1% of container inline size |
| `cqb` | 1% of container block size |
| `cqmin` | Smaller of `cqi` / `cqb` |
| `cqmax` | Larger of `cqi` / `cqb` |

```css
.card-title {
  font-size: clamp(1rem, 3cqi, 2rem);    /* Scale with container width */
}

.card-image {
  height: 30cqw;                          /* 30% of container width */
}
```

---

## Practical Examples

### Responsive Card Component

```css
.card-container {
  container-type: inline-size;
}

/* Small: stacked layout */
.card {
  display: flex;
  flex-direction: column;
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* Medium: horizontal layout */
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
  .card-image {
    width: 180px;
    height: auto;
  }
}

/* Large: expanded layout */
@container (min-width: 700px) {
  .card {
    gap: 2rem;
    padding: 1.5rem;
  }
  .card-image {
    width: 280px;
  }
  .card-title {
    font-size: 1.5rem;
  }
}
```

### Responsive Navigation Inside Any Container

```css
.nav-container {
  container-type: inline-size;
}

.nav { display: flex; flex-wrap: wrap; gap: 0.5rem; }

/* Narrow: stack vertically */
@container (max-width: 400px) {
  .nav {
    flex-direction: column;
  }
  .nav a { padding: 12px; }
}

/* Wide: horizontal */
@container (min-width: 401px) {
  .nav {
    flex-direction: row;
    justify-content: center;
  }
  .nav a { padding: 8px 16px; }
}
```

### Dashboard Widget

```css
.widget-wrapper {
  container: widget / inline-size;
}

.widget {
  padding: 1rem;
}

.widget-chart { display: none; }

@container widget (min-width: 300px) {
  .widget { padding: 1.5rem; }
  .widget-chart { display: block; }
  .widget-title { font-size: 1.25rem; }
}

@container widget (min-width: 500px) {
  .widget {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}
```

---

## Style Queries (Experimental)

Query the **computed value** of a CSS property:

```css
.card-wrapper {
  --variant: featured;
}

@container style(--variant: featured) {
  .card {
    border: 2px solid gold;
    background: #fffdf0;
  }
}

@container style(--variant: compact) {
  .card {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
```

> Style queries are supported in Chrome 111+ (behind flags or progressively available).

---

## Container Queries vs Media Queries

| Feature | Media Queries | Container Queries |
|---------|--------------|-------------------|
| Based on | Viewport size | Parent container size |
| Scope | Global | Component-level |
| Reusability | Low | **High** — components adapt anywhere |
| Use case | Page-level layout | Component design |
| Browser support | All | Modern (2023+) |

---

## Browser Support

- Chrome 105+, Edge 105+, Safari 16+, Firefox 110+
- Container query units: Chrome 105+, Safari 16+, Firefox 110+
- Style queries: Chrome 111+ (limited)

```css
/* Progressive enhancement */
.card { /* Default mobile layout */ }

@supports (container-type: inline-size) {
  .card-wrapper { container-type: inline-size; }
  
  @container (min-width: 400px) {
    .card { /* Enhanced layout */ }
  }
}
```
