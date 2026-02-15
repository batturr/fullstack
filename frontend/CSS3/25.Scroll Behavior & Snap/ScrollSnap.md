# 25. Scroll Behavior & Snap

## scroll-behavior

Smooth scrolling for anchor links and programmatic scrolling:

```css
html {
  scroll-behavior: smooth;    /* Smooth animated scrolling */
}

/* Or on specific containers */
.container {
  scroll-behavior: smooth;
}
```

```html
<!-- Clicking this anchor now scrolls smoothly -->
<a href="#section2">Go to Section 2</a>
...
<section id="section2">Section 2</section>
```

### Disable for Users Who Prefer Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;    /* Instant scrolling */
  }
}
```

---

## scroll-snap

Creates touch-friendly snap points for scrolling — like app carousels, full-page sections, or image galleries.

### Container Properties

```css
.snap-container {
  overflow-x: auto;            /* or overflow-y: auto */
  scroll-snap-type: x mandatory;
}
```

#### scroll-snap-type

```css
/* Axis + Strictness */
.container { scroll-snap-type: x mandatory; }     /* Horizontal, always snaps */
.container { scroll-snap-type: y mandatory; }      /* Vertical, always snaps */
.container { scroll-snap-type: x proximity; }      /* Horizontal, snaps when close */
.container { scroll-snap-type: both mandatory; }    /* Both axes */
.container { scroll-snap-type: none; }              /* Disable snapping */
```

| Strictness | Behavior |
|------------|----------|
| `mandatory` | Always snaps to a snap point after scrolling stops |
| `proximity` | Only snaps when scroll lands near a snap point |

### Item Properties

```css
.snap-item {
  scroll-snap-align: start;     /* Snap to start edge */
  scroll-snap-align: center;    /* Snap to center */
  scroll-snap-align: end;       /* Snap to end edge */
}
```

### scroll-snap-stop

```css
.snap-item {
  scroll-snap-stop: normal;     /* Can skip past snap points (default) */
  scroll-snap-stop: always;     /* Must stop at this snap point */
}
```

---

## Full-Page Snap (Vertical)

```css
html, body {
  margin: 0;
  height: 100%;
}

.fullpage-container {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.section {
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section:nth-child(1) { background: #3b82f6; color: white; }
.section:nth-child(2) { background: #10b981; color: white; }
.section:nth-child(3) { background: #f59e0b; color: white; }
```

---

## Horizontal Carousel

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;    /* Smooth on iOS */
}

.carousel::-webkit-scrollbar {
  display: none;              /* Hide scrollbar */
}

.slide {
  flex: 0 0 80%;              /* Each slide takes 80% width */
  scroll-snap-align: center;
  border-radius: 12px;
  overflow: hidden;
}

.slide img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

/* Full-width slides */
.slide-full {
  flex: 0 0 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;    /* Must stop at each slide */
}
```

---

## scrollbar Styling

### Standard (Firefox + Chrome 121+)

```css
.scrollable {
  scrollbar-width: thin;                      /* auto | thin | none */
  scrollbar-color: #888 #f1f1f1;             /* thumb-color  track-color */
}
```

### WebKit (Chrome, Safari, Edge)

```css
.scrollable::-webkit-scrollbar {
  width: 8px;
  height: 8px;
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

/* Hide scrollbar but keep scrolling */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  scrollbar-width: none;
}
```

---

## overscroll-behavior

Controls what happens when you scroll past the boundary:

```css
.modal-body {
  overscroll-behavior: contain;    /* Stop scroll from chaining to parent */
}

body {
  overscroll-behavior-y: none;     /* Disable pull-to-refresh / bounce */
}
```

| Value | Behavior |
|-------|----------|
| `auto` | Default browser behavior (scroll chaining, bounce) |
| `contain` | Prevents scroll chaining to parent |
| `none` | Prevents chaining + browser overscroll effects (bounce, refresh) |

---

## scroll-padding / scroll-margin

Offset snap points to account for fixed headers or other UI:

```css
/* Account for fixed header */
html {
  scroll-padding-top: 80px;     /* Snap point offset from top */
}

/* Or on the snap container */
.container {
  scroll-padding: 80px 20px;   /* Block, inline */
}

/* On individual items */
.snap-item {
  scroll-margin-top: 20px;     /* Item-level offset */
}
```

### Common Use: Fixed Header + Anchor Links

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 64px;     /* Height of fixed header */
}
```

---

## Scroll-Driven Animations (Modern CSS)

Animate based on scroll position instead of time:

```css
/* Progress bar that fills as you scroll */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: #3b82f6;
  width: 100%;
  transform-origin: left;
  animation: grow-progress linear;
  animation-timeline: scroll();
}

@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

```css
/* Fade in element when scrolled into view */
.reveal {
  animation: fadeIn linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```

> Scroll-driven animations are supported in Chrome 115+ and Firefox 110+.
