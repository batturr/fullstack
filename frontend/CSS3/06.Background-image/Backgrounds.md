# 06. Backgrounds

## background-color

```css
div { background-color: #f0f0f0; }
div { background-color: rgba(0, 0, 0, 0.5); }   /* Semi-transparent */
div { background-color: transparent; }             /* Default */
```

---

## background-image

```css
div { background-image: url("image.jpg"); }
div { background-image: url("../images/hero.png"); }
div { background-image: none; }                    /* Default */
```

---

## background-size

| Value | Behavior |
|-------|----------|
| `auto` | Original image size (default) |
| `cover` | Scale to fill container (may crop) |
| `contain` | Scale to fit inside container (may leave gaps) |
| `100px 200px` | Exact width × height |
| `50% auto` | 50% width, auto height |

```css
.hero {
  background-image: url("hero.jpg");
  background-size: cover;          /* Most common for full-bleed images */
}

.logo {
  background-image: url("logo.svg");
  background-size: contain;        /* Show full image, no cropping */
}

.pattern {
  background-image: url("tile.png");
  background-size: 50px 50px;      /* Fixed tile size */
}
```

---

## background-position

Where the background image starts:

```css
div { background-position: center; }
div { background-position: top right; }
div { background-position: 50% 50%; }         /* Center */
div { background-position: 20px 40px; }        /* From top-left */
div { background-position: right 20px bottom 10px; }  /* Offsets from edges */
```

### Common Values

| Value | Position |
|-------|----------|
| `top left` | Top-left corner |
| `top center` | Top center |
| `center` | Dead center |
| `bottom right` | Bottom-right corner |
| `50% 50%` | Center (percentage) |

---

## background-repeat

| Value | Behavior |
|-------|----------|
| `repeat` | Tile in both directions (default) |
| `repeat-x` | Tile horizontally only |
| `repeat-y` | Tile vertically only |
| `no-repeat` | Show once, no tiling |
| `space` | Tile without clipping, add space between |
| `round` | Tile and stretch to fill without clipping |

```css
.hero { background-repeat: no-repeat; }
.stripe { background-repeat: repeat-x; }
.pattern { background-repeat: round; }
```

---

## background-attachment

Controls if background scrolls with content:

```css
div { background-attachment: scroll; }   /* Scrolls with element (default) */
div { background-attachment: fixed; }    /* Fixed to viewport (parallax) */
div { background-attachment: local; }    /* Scrolls with element's content */
```

### Parallax Effect

```css
.parallax {
  background-image: url("landscape.jpg");
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  height: 100vh;
}
```

> **Note:** `background-attachment: fixed` has performance issues on mobile devices and may be ignored by some mobile browsers.

---

## background-origin

Where the background image's position is calculated from:

```css
div { background-origin: padding-box; }   /* Default: starts at padding edge */
div { background-origin: border-box; }    /* Starts at border edge */
div { background-origin: content-box; }   /* Starts at content edge */
```

---

## background-clip

Where the background is **visible**:

```css
div { background-clip: border-box; }    /* Default: visible under border */
div { background-clip: padding-box; }   /* Visible up to padding (not under border) */
div { background-clip: content-box; }   /* Visible only in content area */
div { background-clip: text; }          /* Clip to text shape! */
```

### Gradient Text Effect

```css
.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 4rem;
  font-weight: 900;
}
```

---

## background (Shorthand)

```css
/* Order: color image position/size repeat attachment origin clip */
div {
  background: #f0f0f0 url("bg.jpg") center/cover no-repeat fixed;
}

/* Simpler */
div {
  background: url("hero.jpg") center/cover no-repeat;
}
```

---

## Multiple Backgrounds

Layer multiple backgrounds (first = top layer):

```css
.hero {
  background:
    url("overlay.png") center/cover no-repeat,        /* Top layer */
    url("pattern.svg") repeat,                          /* Middle layer */
    linear-gradient(to bottom, #000, #333);            /* Bottom layer */
}
```

---

## CSS Gradients

### Linear Gradient

```css
/* Direction + color stops */
div { background: linear-gradient(to right, red, blue); }
div { background: linear-gradient(to bottom right, #667eea, #764ba2); }
div { background: linear-gradient(135deg, #f093fb, #f5576c); }

/* Multiple color stops */
div {
  background: linear-gradient(
    to right,
    red 0%,
    orange 25%,
    yellow 50%,
    green 75%,
    blue 100%
  );
}

/* Hard stops (stripes) */
div {
  background: linear-gradient(
    to right,
    red 0%, red 33%,
    white 33%, white 66%,
    blue 66%, blue 100%
  );
}
```

### Repeating Linear Gradient

```css
div {
  background: repeating-linear-gradient(
    45deg,
    #606dbc,
    #606dbc 10px,
    #465298 10px,
    #465298 20px
  );
}
```

### Radial Gradient

```css
div { background: radial-gradient(circle, #fff, #000); }
div { background: radial-gradient(ellipse at top left, red, blue); }
div { background: radial-gradient(circle at 30% 70%, yellow, green); }

/* Size keywords */
div { background: radial-gradient(closest-side, red, blue); }
div { background: radial-gradient(farthest-corner, red, blue); }
```

### Conic Gradient

```css
/* Color wheel */
div {
  background: conic-gradient(red, yellow, green, cyan, blue, magenta, red);
  border-radius: 50%;
}

/* Pie chart */
div {
  background: conic-gradient(
    #4caf50 0deg 120deg,
    #2196f3 120deg 240deg,
    #ff9800 240deg 360deg
  );
  border-radius: 50%;
}

/* Repeating conic (checkerboard) */
div {
  background: repeating-conic-gradient(
    #000 0deg 90deg,
    #fff 90deg 180deg
  );
  background-size: 50px 50px;
}
```

---

## Background Patterns (CSS Only)

### Stripes

```css
.stripes {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 10px,
    rgba(0,0,0,0.05) 10px,
    rgba(0,0,0,0.05) 20px
  );
}
```

### Dots

```css
.dots {
  background-image: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Grid

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## Common Patterns

### Hero Section with Overlay

```css
.hero {
  background:
    linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
    url("hero.jpg") center/cover no-repeat;
  color: white;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Frosted Glass

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

### Gradient Border

```css
.gradient-border {
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #667eea, #764ba2) border-box;
  border: 3px solid transparent;
  border-radius: 12px;
}
```
