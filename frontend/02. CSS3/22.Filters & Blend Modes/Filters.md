# 22. Filters & Blend Modes

## CSS filter Property

Apply graphical effects (blur, brightness, etc.) to elements:

```css
.image {
  filter: <function>;
}
```

### Filter Functions

#### blur()
```css
img { filter: blur(0); }        /* No blur (default) */
img { filter: blur(4px); }      /* 4px Gaussian blur */
img { filter: blur(20px); }     /* Heavy blur */
```

#### brightness()
```css
img { filter: brightness(1); }     /* Normal (default) */
img { filter: brightness(0.5); }   /* 50% brightness (darker) */
img { filter: brightness(1.5); }   /* 150% brightness (brighter) */
img { filter: brightness(0); }     /* Completely black */
```

#### contrast()
```css
img { filter: contrast(1); }      /* Normal */
img { filter: contrast(0.5); }    /* Low contrast (washed out) */
img { filter: contrast(2); }      /* High contrast */
```

#### grayscale()
```css
img { filter: grayscale(0); }      /* Full color */
img { filter: grayscale(50%); }    /* Partially desaturated */
img { filter: grayscale(100%); }   /* Fully grayscale */
```

#### hue-rotate()
```css
img { filter: hue-rotate(0deg); }     /* Normal */
img { filter: hue-rotate(90deg); }    /* Shift hue 90° */
img { filter: hue-rotate(180deg); }   /* Invert hue */
```

#### invert()
```css
img { filter: invert(0); }        /* Normal */
img { filter: invert(100%); }     /* Fully inverted (negative) */
```

#### opacity()
```css
img { filter: opacity(1); }       /* Fully opaque */
img { filter: opacity(0.5); }     /* 50% transparent */
```

> `filter: opacity()` is GPU-accelerated; `opacity:` property may not be.

#### saturate()
```css
img { filter: saturate(1); }      /* Normal */
img { filter: saturate(0); }      /* Desaturated (grayscale) */
img { filter: saturate(3); }      /* Over-saturated */
```

#### sepia()
```css
img { filter: sepia(0); }         /* Normal */
img { filter: sepia(100%); }      /* Full sepia (vintage photo) */
```

#### drop-shadow()

Like `box-shadow` but follows the **shape** of the element (including transparent areas):

```css
img { filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3)); }

/* Compare: */
.png-icon { box-shadow: 4px 4px 8px rgba(0,0,0,0.3); }      /* Shadow of bounding box */
.png-icon { filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3)); } /* Shadow of actual shape! */
```

### Combining Multiple Filters

```css
img {
  filter: brightness(1.1) contrast(1.2) saturate(1.3);
}

/* Vintage photo effect */
img.vintage {
  filter: sepia(60%) brightness(1.1) contrast(0.9) saturate(0.8);
}

/* Frosted glass (on background) */
img.frosted {
  filter: blur(10px) brightness(1.1);
}
```

---

## backdrop-filter

Apply filter effects to the **area behind** the element:

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);   /* Safari */
}
```

### Frosted Glass Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px) saturate(1.5);
  -webkit-backdrop-filter: blur(12px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Blurred Navbar

```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px) saturate(1.2);
  -webkit-backdrop-filter: blur(8px) saturate(1.2);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
}
```

---

## mix-blend-mode

Controls how an element's content blends with the content **behind** it:

```css
.element {
  mix-blend-mode: normal;      /* Default: no blending */
}
```

### Blend Mode Values

| Mode | Effect |
|------|--------|
| `normal` | No blending |
| `multiply` | Darkens — white disappears |
| `screen` | Lightens — black disappears |
| `overlay` | Combines multiply + screen |
| `darken` | Keeps darker pixels |
| `lighten` | Keeps lighter pixels |
| `color-dodge` | Brightens background |
| `color-burn` | Darkens background |
| `hard-light` | Like overlay, but based on top layer |
| `soft-light` | Gentle version of overlay |
| `difference` | Subtracts colors (black = no change) |
| `exclusion` | Like difference, lower contrast |
| `hue` | Applies hue from top layer |
| `saturation` | Applies saturation from top layer |
| `color` | Applies hue + saturation from top layer |
| `luminosity` | Applies luminosity from top layer |

### Common Patterns

```css
/* Colored overlay on image */
.image-overlay {
  position: relative;
}
.image-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: #3b82f6;
  mix-blend-mode: multiply;
}

/* Text that blends with background */
.blend-text {
  mix-blend-mode: difference;
  color: white;
  /* Text is always readable regardless of background */
}

/* Duotone image effect */
.duotone {
  position: relative;
  background: #3b82f6;
}
.duotone img {
  mix-blend-mode: luminosity;
  opacity: 0.8;
}
```

---

## background-blend-mode

Blends background **layers** together:

```css
.hero {
  background:
    url("hero.jpg") center/cover,
    linear-gradient(135deg, #667eea, #764ba2);
  background-blend-mode: overlay;
}

/* Tinted image */
.tinted {
  background:
    url("photo.jpg") center/cover,
    #3b82f6;
  background-blend-mode: multiply;
}

/* Duotone */
.duotone {
  background:
    url("photo.jpg") center/cover,
    linear-gradient(to right, #ee5a24, #0652dd);
  background-blend-mode: luminosity;
}
```

---

## Practical Examples

### Dark Mode Invert (Quick Hack)

```css
@media (prefers-color-scheme: dark) {
  html {
    filter: invert(1) hue-rotate(180deg);
  }
  /* Don't invert images and videos */
  img, video, iframe {
    filter: invert(1) hue-rotate(180deg);
  }
}
```

### Hover Image Effects

```css
.gallery img {
  transition: filter 0.3s ease;
}

.gallery img:hover {
  filter: brightness(1.1) saturate(1.2);
}

/* Grayscale to color on hover */
.gallery img {
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}
.gallery img:hover {
  filter: grayscale(0);
}
```

### Text Knockout Effect

```css
.knockout {
  background: url("texture.jpg") center/cover;
  color: white;
  mix-blend-mode: screen;
  /* White text reveals the background texture */
}
```

---

## Performance Notes

- `filter` creates a **new stacking context**
- `filter` and `backdrop-filter` can be GPU-accelerated
- `backdrop-filter` is expensive — minimize the blurred area
- Use `will-change: filter` if animating filters
- Avoid large `blur()` values on large elements
