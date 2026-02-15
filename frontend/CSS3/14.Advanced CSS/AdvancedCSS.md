# 14. Advanced CSS — Borders, Shadows, Transitions, Transforms, Animations

## border-radius

```css
/* All corners */
div { border-radius: 8px; }

/* Individual corners */
div { border-radius: 10px 20px 30px 40px; }  /* TL TR BR BL */

/* Circle (on square element) */
.avatar { border-radius: 50%; }

/* Pill shape */
.badge { border-radius: 9999px; }

/* Elliptical */
div { border-radius: 50% / 30%; }
```

---

## box-shadow

```css
/* box-shadow: offsetX offsetY blur spread color */
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Multiple shadows */
.card-elevated {
  box-shadow:
    0 1px 3px rgba(0,0,0,0.12),
    0 1px 2px rgba(0,0,0,0.24);
}

/* Inset shadow (inner shadow) */
.inset {
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

/* No shadow */
.flat {
  box-shadow: none;
}
```

### Shadow Elevation System

```css
.shadow-sm  { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.shadow     { box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); }
.shadow-md  { box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06); }
.shadow-lg  { box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05); }
.shadow-xl  { box-shadow: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04); }
.shadow-2xl { box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
```

---

## text-shadow

```css
h1 { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }

/* Glow effect */
h1 { text-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6; }

/* Embossed */
h1 {
  color: #ccc;
  text-shadow: -1px -1px 0 #000, 1px 1px 0 #fff;
}
```

---

## CSS Transitions

Smooth animations when a property changes:

```css
/* transition: property duration timing-function delay */
.button {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.button:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
```

### Individual Properties

```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.2s;
}
```

### Timing Functions

| Value | Behavior |
|-------|----------|
| `ease` | Slow start, fast middle, slow end (default) |
| `ease-in` | Slow start |
| `ease-out` | Slow end |
| `ease-in-out` | Slow start and end |
| `linear` | Constant speed |
| `cubic-bezier(x1,y1,x2,y2)` | Custom curve |
| `steps(n, start\|end)` | Stepped animation |

```css
.custom { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.bounce { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.snap { transition: all 0.3s steps(5, end); }
```

### Transition Events (JavaScript)

```javascript
element.addEventListener('transitionend', (e) => {
  console.log(`${e.propertyName} transition finished`);
});
```

---

## CSS Transforms

### 2D Transforms

```css
/* Translate (move) */
div { transform: translateX(50px); }
div { transform: translateY(-20px); }
div { transform: translate(50px, -20px); }

/* Rotate */
div { transform: rotate(45deg); }
div { transform: rotate(-90deg); }

/* Scale */
div { transform: scale(1.5); }         /* 150% of original */
div { transform: scaleX(2); }          /* Double width */
div { transform: scaleY(0.5); }        /* Half height */
div { transform: scale(1.2, 0.8); }    /* Different X and Y */

/* Skew */
div { transform: skew(10deg, 5deg); }
div { transform: skewX(20deg); }
div { transform: skewY(-15deg); }

/* Multiple transforms */
div {
  transform: translate(50px, 0) rotate(45deg) scale(1.2);
}
```

### 3D Transforms

```css
/* Perspective (on parent or element) */
.container { perspective: 1000px; }
div { transform: perspective(1000px) rotateY(45deg); }

/* 3D Rotation */
div { transform: rotateX(45deg); }
div { transform: rotateY(60deg); }
div { transform: rotateZ(30deg); }
div { transform: rotate3d(1, 1, 0, 45deg); }

/* 3D Translation */
div { transform: translateZ(50px); }
div { transform: translate3d(10px, 20px, 30px); }

/* Preserve 3D on children */
.parent {
  transform-style: preserve-3d;
}

/* Backface visibility */
.card-face {
  backface-visibility: hidden;     /* Hide element when facing away */
}
```

### Transform Origin

```css
div { transform-origin: center; }          /* Default */
div { transform-origin: top left; }
div { transform-origin: 0 0; }
div { transform-origin: 50% 100%; }        /* Bottom center */
```

### Card Flip Effect

```css
.flip-card {
  perspective: 1000px;
  width: 300px;
  height: 200px;
}

.flip-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-inner {
  transform: rotateY(180deg);
}

.flip-front, .flip-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
}

.flip-back {
  transform: rotateY(180deg);
}
```

---

## CSS Animations

### @keyframes + animation

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
```

### Animation Properties

```css
.animated {
  animation-name: fadeIn;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-delay: 0.2s;
  animation-iteration-count: 1;        /* infinite, number */
  animation-direction: normal;          /* normal, reverse, alternate, alternate-reverse */
  animation-fill-mode: forwards;        /* none, forwards, backwards, both */
  animation-play-state: running;        /* running, paused */
}

/* Shorthand */
.animated {
  animation: fadeIn 0.5s ease-out 0.2s 1 normal forwards running;
}
```

### animation-fill-mode

| Value | Behavior |
|-------|----------|
| `none` | No styles applied before/after |
| `forwards` | Keeps final keyframe state after animation |
| `backwards` | Applies first keyframe during delay |
| `both` | Combines forwards + backwards |

### Common Animations

```css
/* Pulse */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.pulse { animation: pulse 2s ease-in-out infinite; }

/* Shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.shake { animation: shake 0.3s ease-in-out; }

/* Slide in from left */
@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.slide-in { animation: slideInLeft 0.5s ease-out; }

/* Bounce */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}
.bounce { animation: bounce 1s ease infinite; }

/* Typing effect */
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

.typewriter {
  font-family: monospace;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #333;
  animation:
    typing 3s steps(30) forwards,
    blink 0.7s step-end infinite;
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

### Multiple Animations

```css
.element {
  animation:
    fadeIn 0.5s ease-out,
    slideUp 0.5s ease-out,
    pulse 2s ease-in-out 0.5s infinite;
}
```

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
