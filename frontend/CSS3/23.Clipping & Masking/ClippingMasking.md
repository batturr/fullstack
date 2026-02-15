# 23. Clipping & Masking

## clip-path

Clips (crops) an element to a specific shape — anything outside the shape is hidden:

```css
.element {
  clip-path: <shape>;
}
```

---

### Basic Shapes

#### circle()

```css
.circle { clip-path: circle(50%); }                    /* Full circle */
.circle { clip-path: circle(100px at 50% 50%); }       /* 100px radius at center */
.circle { clip-path: circle(40% at 30% 30%); }         /* Offset center */
```

#### ellipse()

```css
.ellipse { clip-path: ellipse(50% 30% at 50% 50%); }  /* Horizontal, vertical radii */
```

#### inset()

```css
.inset { clip-path: inset(10px); }                       /* 10px from all edges */
.inset { clip-path: inset(10px 20px 30px 40px); }        /* T R B L */
.inset { clip-path: inset(10px 20px round 8px); }        /* With border-radius */
```

#### polygon()

```css
/* Triangle */
.triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }

/* Pentagon */
.pentagon { clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }

/* Hexagon */
.hexagon { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }

/* Star */
.star { clip-path: polygon(
  50% 0%, 61% 35%, 98% 35%, 68% 57%,
  79% 91%, 50% 70%, 21% 91%, 32% 57%,
  2% 35%, 39% 35%
); }

/* Arrow pointing right */
.arrow { clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%); }

/* Diamond */
.diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }

/* Diagonal cut */
.diagonal { clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); }
```

#### path()

Use an SVG path string:

```css
.custom-shape {
  clip-path: path("M 0 200 Q 150 0 300 200 Q 450 400 600 200 L 600 400 L 0 400 Z");
}
```

---

### Animated clip-path

```css
.reveal {
  clip-path: circle(0% at 50% 50%);
  transition: clip-path 0.5s ease;
}

.reveal:hover {
  clip-path: circle(100% at 50% 50%);
}

/* Polygon morph (same number of points required) */
.morph {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  transition: clip-path 0.3s ease;
}

.morph:hover {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}
```

---

## CSS Masks

Masks control element visibility using **images**; white = visible, black = hidden, gray = semi-transparent:

```css
.element {
  mask-image: url("mask.svg");
  -webkit-mask-image: url("mask.svg");
}
```

### Gradient Mask (Fade Effect)

```css
/* Fade out at bottom */
.fade-bottom {
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}

/* Fade from center */
.vignette {
  mask-image: radial-gradient(circle, black 50%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle, black 50%, transparent 80%);
}

/* Fade both edges (horizontal scroll hint) */
.scroll-fade {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

### Mask Properties

```css
.masked {
  mask-image: url("mask.png");
  mask-size: cover;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-mode: alpha;          /* Use alpha channel */
  mask-mode: luminance;      /* Use brightness for masking */
  mask-composite: intersect; /* How multiple masks combine */
}
```

---

## shape-outside

Makes inline content (text) wrap around a **shape** instead of a rectangle:

```css
.float-circle {
  float: left;
  width: 200px;
  height: 200px;
  shape-outside: circle(50%);
  clip-path: circle(50%);      /* Visual match */
  margin-right: 20px;
}

.float-polygon {
  float: left;
  width: 200px;
  height: 200px;
  shape-outside: polygon(0 0, 100% 0, 100% 100%);
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}

/* Shape from image alpha channel */
.float-image {
  float: left;
  shape-outside: url("shape.png");
  shape-image-threshold: 0.5;    /* Alpha cutoff */
  shape-margin: 20px;            /* Space between shape and text */
}
```

---

## Practical Examples

### Diagonal Section Divider

```css
.section-angled {
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  padding-bottom: 5rem;     /* Extra space for the cut */
}
```

### Image Hover Reveal

```css
.image-reveal {
  position: relative;
  overflow: hidden;
}

.image-reveal img {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.6s cubic-bezier(0.77, 0, 0.175, 1);
}

.image-reveal:hover img {
  clip-path: inset(0 0 0 0);
}
```

### Text Fade (Read More)

```css
.excerpt {
  position: relative;
  max-height: 200px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black 50%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent);
}
```
