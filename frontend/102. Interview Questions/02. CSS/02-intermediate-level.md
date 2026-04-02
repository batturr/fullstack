# CSS & CSS3 Interview Questions — Intermediate (4+ Years Experience)

100 in-depth questions with detailed answers for experienced developers. Covers layout mastery, performance, architecture, accessibility, and advanced CSS3 features.

---

## 1. Explain the CSS cascade algorithm in full detail.

The cascade determines which declaration wins when multiple rules target the same property on the same element. The algorithm processes in this order:

1. **Origin and importance** — Declarations are sorted by source: transition declarations > user-agent `!important` > user `!important` > author `!important` > author animations > author normal > user normal > user-agent normal.
2. **Context** — Encapsulation boundaries like Shadow DOM scope the cascade.
3. **Element-attached styles** — Inline `style=""` beats any external/internal rule (unless `!important` is involved externally at a higher origin).
4. **Layers** — `@layer` ordering gives precedence to later unlayered styles over earlier layers.
5. **Specificity** — Compared only when origin, context, layers, and importance are equal.
6. **Scope proximity** — `@scope` proximity (inner wins over outer for equal specificity).
7. **Order of appearance** — The last rule declared wins when everything else is equal.

Understanding this prevents "specificity wars" and overuse of `!important`. Modern CSS with `@layer` gives you explicit control over cascade ordering.

---

## 2. What are CSS cascade layers (`@layer`), and why are they important?

Cascade layers let you explicitly control the cascade order of groups of rules, independent of specificity or source order. Unlayered styles always beat layered styles.

```css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}
@layer base {
  body { font-family: system-ui; line-height: 1.5; }
}
@layer components {
  .btn { padding: 8px 16px; border-radius: 4px; }
}
@layer utilities {
  .hidden { display: none; }
}
```

Rules in later layers override earlier layers regardless of specificity. This solves the long-standing problem of third-party stylesheets fighting with your own styles. You can wrap a library's CSS in a low-priority layer so your component styles always win.

---

## 3. Explain CSS specificity edge cases and how `@layer`, `:where()`, and `:is()` affect it.

`:is()` and `:not()` take the specificity of their **most specific argument**: `:is(.a, #b)` has specificity (0,1,0,0) because `#b` is the highest. `:where()` always contributes **zero specificity**, making it ideal for resets and defaults that should be easy to override.

```css
:where(.card, .panel) { padding: 16px; }  /* specificity: 0,0,0,0 */
:is(.card, .panel) { padding: 16px; }     /* specificity: 0,0,1,0 */
```

Within `@layer`, specificity still resolves conflicts between rules in the same layer, but inter-layer ordering takes precedence over specificity. This means a `*` selector in a later layer beats an `#id` selector in an earlier layer.

---

## 4. What is the Block Formatting Context (BFC), and how do you create one?

A BFC is an independent layout region where block boxes are laid out. Inside a BFC, floats are contained, margins do not collapse across the BFC boundary, and the box does not overlap floats. A BFC is created by:

- Root element
- `overflow` other than `visible` (e.g., `auto`, `hidden`)
- `display: flow-root` (purpose-built, no side effects)
- Floated elements
- Absolutely/fixed positioned elements
- `display: flex/grid/inline-block/table-cell`
- `contain: layout/content/strict`
- Multi-column containers

```css
.container {
  display: flow-root; /* cleanest BFC trigger */
}
```

`display: flow-root` is the modern, intentional way to create a BFC without unwanted side effects like clipping (`overflow: hidden`) or changing layout mode.

---

## 5. Explain the `contain` property and CSS containment.

CSS containment limits the scope of browser rendering calculations, improving performance. The `contain` property accepts:

| Value | Effect |
|-------|--------|
| `layout` | The element's layout is independent from the rest of the page |
| `paint` | Children cannot paint outside the element's bounds |
| `size` | The element's size is independent of its children |
| `style` | Counters and `content` are scoped |
| `content` | Shorthand for `layout paint style` |
| `strict` | Shorthand for `layout paint size style` |

```css
.widget {
  contain: content;
}
```

This tells the browser that changes inside `.widget` cannot affect layout outside it, enabling rendering optimizations. It is particularly valuable for complex dashboards with many independent widgets.

---

## 6. What is `content-visibility`, and how does it improve performance?

`content-visibility: auto` allows the browser to skip rendering (layout, paint, and style computation) for off-screen elements until they are about to scroll into view. Combined with `contain-intrinsic-size` (which provides a placeholder size), this dramatically reduces initial render time for long pages.

```css
.article-card {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

The browser renders only visible cards; off-screen cards are skipped until the user scrolls near them. This can reduce rendering time by 50–90% on content-heavy pages.

---

## 7. Explain CSS Grid's `grid-template-areas` and named grid lines.

`grid-template-areas` lets you define a grid layout visually using named regions:

```css
.page {
  display: grid;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

Named grid lines are implicit: a region named `header` creates lines `header-start` and `header-end`. You can also define explicit named lines:

```css
.grid {
  grid-template-columns: [sidebar-start] 250px [sidebar-end main-start] 1fr [main-end];
}
```

---

## 8. What is `subgrid`, and when would you use it?

`subgrid` allows a grid item that is also a grid container to inherit the row or column tracks of its parent grid, keeping nested items aligned to the outer grid.

```css
.parent {
  display: grid;
  grid-template-columns: 200px 1fr 100px;
}

.child {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
}
```

Without `subgrid`, the child defines its own column tracks that have no relationship to the parent's. With `subgrid`, columns in the child line up perfectly with the parent's columns. This is essential for card grids where internal elements (title, body, footer) should align across cards.

---

## 9. Explain the `fr` unit in CSS Grid.

`fr` (fraction) represents a portion of the available free space in a grid container. After fixed sizes and content-based tracks are computed, the remaining space is divided among `fr` tracks proportionally.

```css
.grid {
  grid-template-columns: 200px 1fr 2fr;
  /* 200px fixed, remaining space split 1:2 */
}
```

`1fr` is not the same as `1fr minmax(0, 1fr)`. By default, `1fr` behaves as `minmax(auto, 1fr)`, meaning it will not shrink below the content's minimum size. To allow a track to shrink to zero, use `minmax(0, 1fr)`.

---

## 10. What is `auto-fill` vs. `auto-fit` in `repeat()`?

Both create as many columns as fit in the available space, but they differ when there are fewer items than tracks:

```css
/* auto-fill: creates empty tracks to fill the space */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

/* auto-fit: collapses empty tracks, stretching existing items */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

With 3 items and room for 5 columns: `auto-fill` creates 5 columns (2 empty), while `auto-fit` creates 3 columns that expand to fill the space. Use `auto-fit` for responsive grids where items should stretch, and `auto-fill` when you want consistent column widths.

---

## 11. Explain the difference between `align-items`, `align-content`, `align-self`, `justify-items`, `justify-content`, and `justify-self`.

| Property | Axis | Scope | Used in |
|----------|------|-------|---------|
| `justify-content` | Main/inline | All items as a group | Flex, Grid |
| `align-content` | Cross/block | All lines as a group | Flex (wrap), Grid |
| `justify-items` | Inline | Default for all items in cells | Grid only |
| `align-items` | Cross/block | Default for all items | Flex, Grid |
| `justify-self` | Inline | Single item in its cell | Grid only |
| `align-self` | Cross/block | Single item | Flex, Grid |

In Flexbox, the main axis is determined by `flex-direction`. In Grid, `justify-*` is always inline (horizontal in LTR) and `align-*` is always block (vertical).

---

## 12. What is Flexbox's `flex: 1` really doing?

`flex: 1` expands to `flex-grow: 1; flex-shrink: 1; flex-basis: 0%`. This is different from `flex: auto` (`1 1 auto`) and `flex: none` (`0 0 auto`).

| Shorthand | grow | shrink | basis | Behavior |
|-----------|------|--------|-------|----------|
| `flex: 1` | 1 | 1 | 0% | Ignores content size; distributes space equally |
| `flex: auto` | 1 | 1 | auto | Accounts for content size, then distributes extra |
| `flex: none` | 0 | 0 | auto | Fixed at content size; will not grow or shrink |
| `flex: 0` | 0 | 1 | 0% | Collapses to zero width |

The `flex-basis: 0%` in `flex: 1` is crucial — it makes all items start from zero and then grow equally, giving equal widths. `flex: auto` starts from content width and distributes the remaining space.

---

## 13. How does `min-width: 0` fix Flexbox overflow issues?

Flex items have an implicit `min-width: auto`, which prevents them from shrinking below their content's intrinsic minimum width. This causes overflow in containers with long words, code blocks, or wide children. Setting `min-width: 0` overrides this default and allows the item to shrink below its content width, enabling `text-overflow: ellipsis` and other overflow handling to work.

```css
.flex-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

The same applies vertically: `min-height: 0` fixes overflow issues in column-direction flex layouts.

---

## 14. Explain CSS custom properties scoping and inheritance.

CSS custom properties follow normal CSS inheritance — they cascade down the DOM tree. But they can be scoped to any selector, not just `:root`:

```css
:root { --color: blue; }

.dark-section {
  --color: lightblue;
}

.card {
  color: var(--color); /* blue normally, lightblue inside .dark-section */
}
```

They can also be used in `@media` queries for responsive theming:

```css
:root {
  --spacing: 16px;
}
@media (min-width: 768px) {
  :root { --spacing: 24px; }
}
```

Unlike Sass variables (resolved at compile time), CSS custom properties are live in the browser and can be changed dynamically with JavaScript: `element.style.setProperty('--color', 'red')`.

---

## 15. What is the `@property` at-rule, and why is it significant?

`@property` registers a custom property with a type, inheritance behavior, and initial value. This enables features that plain custom properties cannot do — like animating custom properties.

```css
@property --gradient-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.rotating-gradient {
  --gradient-angle: 0deg;
  background: linear-gradient(var(--gradient-angle), #f00, #00f);
  transition: --gradient-angle 1s ease;
}
.rotating-gradient:hover {
  --gradient-angle: 360deg;
}
```

Without `@property`, the browser treats custom properties as strings and cannot interpolate them. With `@property`, the browser knows the type and can animate smoothly.

---

## 16. What is the `@scope` at-rule?

`@scope` defines a scoping root and optionally a lower boundary, limiting where styles apply in the DOM tree:

```css
@scope (.card) to (.card-footer) {
  p { color: #333; }
  a { color: blue; }
}
```

This scopes styles to elements inside `.card` but not within `.card-footer`. It solves the problem of styles leaking into deeply nested components without requiring BEM naming or Shadow DOM. Proximity matters: when two scopes match, the closer scope wins.

---

## 17. Explain CSS nesting (native).

Native CSS nesting allows you to write nested selectors directly, similar to Sass:

```css
.card {
  padding: 16px;
  border-radius: 8px;

  & .title {
    font-size: 1.25rem;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    padding: 24px;
  }
}
```

The `&` refers to the parent selector. Media queries can also be nested directly. This is now part of the CSS specification and supported in all modern browsers, reducing the need for preprocessors for nesting purposes.

---

## 18. What are container queries, and how do they differ from media queries?

Media queries respond to the **viewport** size; container queries respond to a **parent container's** size. This makes components truly responsive — they adapt based on the space available to them, not the overall screen size.

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
```

`container-type: inline-size` enables inline-dimension queries. `container-type: size` enables both inline and block queries but requires explicit sizing.

---

## 19. What are container style queries?

Container style queries let you apply styles based on the computed value of a container's custom properties:

```css
.theme-wrapper {
  container-type: normal;
  --theme: dark;
}

@container style(--theme: dark) {
  .card {
    background: #1a1a1a;
    color: #eee;
  }
}
```

This enables context-aware theming where components adapt their appearance based on ancestor properties without JavaScript.

---

## 20. Explain `clamp()`, `min()`, and `max()` functions.

These comparison functions enable fluid, responsive values without media queries:

```css
/* clamp(minimum, preferred, maximum) */
.title {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /* Never smaller than 1.5rem, scales with viewport, caps at 3rem */
}

/* min() picks the smallest value */
.container {
  width: min(90%, 1200px);
}

/* max() picks the largest value */
.sidebar {
  width: max(250px, 20vw);
}
```

`clamp(a, b, c)` is equivalent to `max(a, min(b, c))`. These functions are invaluable for fluid typography and spacing that scales smoothly without breakpoints.

---

## 21. What is the `color-mix()` function?

`color-mix()` blends two colors in a specified color space:

```css
.lighter-primary {
  background: color-mix(in srgb, #3498db, white 30%);
}
.muted {
  color: color-mix(in oklch, var(--text), transparent 40%);
}
```

It replaces the need for Sass's `lighten()`/`darken()` functions and works with any CSS color format. Using perceptually uniform color spaces like `oklch` produces more visually consistent results.

---

## 22. What are the `oklch` and `oklab` color spaces, and why use them?

`oklch` (lightness, chroma, hue) and `oklab` (lightness, a, b) are perceptually uniform color spaces — equal numerical changes produce equal perceived visual changes. This is not true for `hsl` or `rgb`, where identical lightness values can appear very different.

```css
:root {
  --primary: oklch(60% 0.2 250);
  --secondary: oklch(60% 0.2 150);
  /* Same perceived lightness and saturation, different hue */
}
```

Benefits: better palette generation, smoother gradients, more predictable `color-mix()` results, and consistent contrast ratios across hues.

---

## 23. What is the `color-scheme` property?

`color-scheme` tells the browser which color schemes the page supports, affecting default element colors (scrollbars, form controls, backgrounds):

```css
:root {
  color-scheme: light dark;
}
```

This signals that the page handles both light and dark modes, allowing the browser to adapt default UI colors accordingly. Combined with `prefers-color-scheme` media queries and CSS variables, it enables complete theme switching.

---

## 24. Explain the `prefers-color-scheme` media feature and how to implement dark mode.

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --surface: #f5f5f5;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a1a;
    --text: #e5e5e5;
    --surface: #2a2a2a;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
```

For a manual toggle, add a class on `<html>` and use custom properties. The `prefers-color-scheme` media query detects the OS setting; JavaScript can override it with a stored preference.

---

## 25. What is `prefers-reduced-motion`, and why is it important?

`prefers-reduced-motion: reduce` fires when the user has enabled a "reduce motion" accessibility setting in their OS. You should respect it:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Vestibular disorders, motion sensitivity, and cognitive disabilities can make animations physically uncomfortable or disorienting. Always provide reduced-motion alternatives.

---

## 26. Explain CSS `@supports` (feature queries) and its use cases.

`@supports` applies styles only when the browser supports a specific CSS feature:

```css
@supports (display: grid) {
  .layout { display: grid; grid-template-columns: 1fr 1fr; }
}

@supports not (backdrop-filter: blur(10px)) {
  .glass { background: rgba(255, 255, 255, 0.9); }
}

@supports (container-type: inline-size) {
  .card-wrapper { container-type: inline-size; }
}
```

It enables progressive enhancement — you write base styles for all browsers, then layer advanced features for browsers that support them. This is more reliable than user-agent sniffing.

---

## 27. What is the difference between `display: contents` and removing an element?

`display: contents` makes the element's box disappear from layout, but its children participate as if they were direct children of the element's parent. The element still exists in the DOM and accessibility tree.

```css
.wrapper {
  display: contents;
}
```

Use case: A wrapper `<div>` needed for React/framework structure but not wanted in the layout. Caution: `display: contents` can remove the element from the accessibility tree in some browsers, causing issues with semantic elements like `<button>` or `<table>`.

---

## 28. How do CSS animations differ from JavaScript animations in terms of performance?

CSS animations and transitions on `transform` and `opacity` run on the **compositor thread**, separate from the main thread. This means they remain smooth even when JavaScript is busy. JavaScript animations (via `requestAnimationFrame`) run on the main thread and can be janky under load, but offer more control (dynamic values, physics, sequencing).

Best practice: Use CSS for simple state transitions and hover effects. Use JavaScript (with Web Animations API or GSAP) for complex choreographed sequences, scroll-driven interactions, or animations requiring dynamic calculation.

---

## 29. What causes layout thrashing, and how do CSS choices help avoid it?

Layout thrashing occurs when JavaScript alternately reads layout properties (like `offsetHeight`) and writes style changes, forcing the browser to recalculate layout repeatedly within a single frame. CSS choices that mitigate this:

- Animate only `transform` and `opacity` (composite-only, no layout recalculation).
- Use `contain: layout` to isolate elements so changes do not force re-layout of the entire page.
- Use CSS Grid/Flexbox with fixed tracks instead of JavaScript-calculated dimensions.
- Avoid animating `width`, `height`, `top`, `left`, `margin`, or `padding`.

---

## 30. What is the `will-change` property, and what are its pitfalls?

`will-change` hints to the browser which properties will animate, allowing preemptive optimization (e.g., promoting to a GPU layer):

```css
.animated {
  will-change: transform, opacity;
}
```

Pitfalls:
- Using it on too many elements wastes GPU memory.
- It creates a new stacking context and containing block.
- It should be applied just before the animation and removed after.
- It should not be used as a permanent style; `transform: translateZ(0)` was the older hack.

---

## 31. Explain the `scroll-snap` properties and their use cases.

Scroll snapping creates touch-friendly, paginated scrolling:

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 16px;
}

.slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
```

| Property | Purpose |
|----------|---------|
| `scroll-snap-type` | Axis and strictness (`x/y mandatory/proximity`) |
| `scroll-snap-align` | Where items snap (`start/center/end`) |
| `scroll-padding` | Offset for the snap point (accounts for sticky headers) |
| `scroll-margin` | Margin on the snap target |

Use cases: image carousels, full-page sections, horizontal product lists.

---

## 32. What are scroll-driven animations?

Scroll-driven animations let you animate elements based on scroll position without JavaScript:

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

`animation-timeline: scroll()` ties animation to the scroll container. `animation-timeline: view()` ties it to when the element enters the viewport. This replaces Intersection Observer for many scroll animation patterns.

---

## 33. What is `@counter-style`?

`@counter-style` lets you define custom list markers beyond built-in types:

```css
@counter-style thumbs {
  system: cyclic;
  symbols: "👍" "👎";
  suffix: " ";
}

.custom-list {
  list-style: thumbs;
}
```

It supports various numbering systems (additive for Roman numerals, alphabetic, numeric, cyclic) and is useful for multilingual content or brand-specific list styles.

---

## 34. What is the `text-wrap: balance` property?

`text-wrap: balance` adjusts line breaks in headings so that lines have roughly equal length, avoiding the common problem of a single orphan word on the last line:

```css
h1, h2, h3 {
  text-wrap: balance;
}
```

`text-wrap: pretty` optimizes for the best typographic appearance (avoiding orphans) with less aggressive reflow than `balance`. Use `balance` for headings and `pretty` for body text.

---

## 35. Explain the `writing-mode` property and logical properties.

`writing-mode` controls text flow direction:

```css
.vertical { writing-mode: vertical-rl; } /* top-to-bottom, right-to-left */
.horizontal { writing-mode: horizontal-tb; } /* default */
```

Logical properties adapt to writing mode automatically:

| Physical | Logical |
|----------|---------|
| `width` | `inline-size` |
| `height` | `block-size` |
| `margin-left` | `margin-inline-start` |
| `padding-top` | `padding-block-start` |
| `border-right` | `border-inline-end` |
| `text-align: left` | `text-align: start` |

Using logical properties makes your CSS work correctly for RTL (Arabic, Hebrew) and vertical (Chinese, Japanese) writing modes without separate stylesheets.

---

## 36. What are CSS logical properties, and why should you use them?

Logical properties replace physical directions (top/right/bottom/left) with flow-relative directions (block-start/inline-end/block-end/inline-start). This ensures layouts adapt correctly when the writing direction changes.

```css
.card {
  margin-block: 16px;        /* top and bottom */
  padding-inline: 24px;      /* left and right in LTR; right and left in RTL */
  border-inline-start: 4px solid blue;
  max-inline-size: 600px;
}
```

For internationalized applications, logical properties are essential. Even for English-only sites, they are a good habit that makes code more semantic.

---

## 37. What is the `@font-face` descriptor `font-display` and its strategies?

`font-display` controls how custom fonts render during loading:

| Value | FOIT | FOUT | Behavior |
|-------|------|------|----------|
| `auto` | Browser default | — | Unpredictable |
| `block` | Up to 3s | Then swap | Brief invisible text |
| `swap` | None | Immediate | Shows fallback, then swaps |
| `fallback` | ~100ms | ~3s swap window | Brief FOIT, limited swap |
| `optional` | ~100ms | No swap | Uses font only if cached |

`swap` is best for body text (content is always visible). `optional` is best for non-critical decorative fonts (avoids layout shift). `fallback` is a middle ground for important but non-critical fonts.

---

## 38. How do you optimize web font loading?

1. **Subset fonts** — include only the characters you need (`unicode-range`).
2. **Use WOFF2** — best compression format.
3. **Preload critical fonts** — `<link rel="preload" href="font.woff2" as="font" crossorigin>`.
4. **Use `font-display: swap` or `optional`**.
5. **Match fallback metrics** — use `@font-face` descriptors (`size-adjust`, `ascent-override`, `descent-override`) to minimize layout shift.

```css
@font-face {
  font-family: "Inter";
  src: url("inter.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0000-00FF;
}
```

---

## 39. What is CSS `@font-face` `size-adjust` and metric overrides?

These descriptors let you fine-tune fallback font metrics to match the custom font, reducing Cumulative Layout Shift (CLS):

```css
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

body {
  font-family: "Inter", "Inter Fallback", sans-serif;
}
```

The fallback font is adjusted to match Inter's metrics, so when Inter loads and swaps in, the text barely shifts.

---

## 40. What is the `::view-transition` pseudo-element and View Transitions API?

The View Transitions API (with CSS pseudo-elements) creates smooth animated transitions between DOM states:

```css
::view-transition-old(root) {
  animation: fade-out 0.3s ease-in;
}
::view-transition-new(root) {
  animation: fade-in 0.3s ease-out;
}

.hero-image {
  view-transition-name: hero;
}
```

When combined with `document.startViewTransition()`, it animates between old and new snapshots of elements. Named transitions (via `view-transition-name`) allow specific elements to animate independently (e.g., a shared hero image morphing between pages).

---

## 41. What is the `color()` function and wide-gamut colors?

The `color()` function accesses color spaces beyond sRGB:

```css
.vibrant {
  background: color(display-p3 1 0.2 0.1);
  background: color(rec2020 0.9 0.3 0.2);
}
```

Display P3 offers ~50% more colors than sRGB. Modern screens (Apple Retina, recent OLED monitors) support P3. Always provide an sRGB fallback:

```css
.vibrant {
  background: #ff3300;
  background: color(display-p3 1 0.2 0.1);
}
```

---

## 42. Explain the `light-dark()` function.

`light-dark()` returns one of two values depending on the current color scheme:

```css
:root {
  color-scheme: light dark;
}

body {
  background: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#1a1a1a, #e5e5e5);
}
```

This eliminates the need for `prefers-color-scheme` media queries for simple light/dark value swaps, making theme code more concise.

---

## 43. What are CSS Houdini APIs?

CSS Houdini is a set of low-level browser APIs that let developers extend CSS itself:

- **Paint API** (`CSS.paintWorklet`) — draw custom backgrounds/borders in a `<canvas>`-like environment.
- **Layout API** — define custom layout algorithms (like a masonry layout).
- **Animation Worklet** — create scroll-linked or physics-based animations off the main thread.
- **Properties and Values API** (`CSS.registerProperty`) — register typed custom properties with animation support.
- **Parser API** — extend CSS parsing with custom syntax.

```javascript
CSS.registerProperty({
  name: '--angle',
  syntax: '<angle>',
  initialValue: '0deg',
  inherits: false
});
```

---

## 44. What is a CSS methodology, and compare BEM, SMACSS, and ITCSS.

CSS methodologies provide naming and organizational conventions:

**BEM (Block Element Modifier):**
```css
.card { }
.card__title { }
.card__title--highlighted { }
```

**SMACSS** — categorizes rules: Base, Layout, Module, State, Theme.

**ITCSS (Inverted Triangle)** — layers from generic to specific: Settings → Tools → Generic → Elements → Objects → Components → Utilities.

BEM is the most popular for naming. ITCSS is the most popular for file organization. They can be combined. The goal is predictable, scalable, and maintainable CSS.

---

## 45. What is CSS-in-JS, and what are its trade-offs?

CSS-in-JS (styled-components, Emotion, vanilla-extract) co-locates styles with components using JavaScript:

**Pros:** Automatic scoping, dynamic styles, dead code elimination, type safety (with TypeScript), component-level encapsulation.

**Cons:** Runtime performance overhead (styled-components/Emotion insert styles at runtime), increased bundle size, no static caching, incompatibility with streaming SSR in some cases.

**Zero-runtime alternatives** like vanilla-extract and Linaria extract CSS at build time, giving scoping benefits without runtime cost. CSS Modules offer a simpler middle ground with class name scoping at build time.

---

## 46. What are CSS Modules?

CSS Modules scope class names locally by default — the build tool generates unique class names (e.g., `.card_abc123`), preventing name collisions without runtime overhead.

```css
/* card.module.css */
.card { padding: 16px; }
.title { font-size: 1.25rem; }
```

```jsx
import styles from './card.module.css';
<div className={styles.card}>
  <h2 className={styles.title}>Title</h2>
</div>
```

Unlike CSS-in-JS, CSS Modules produce standard CSS files that are cached normally. They support `composes` for composing styles from other modules.

---

## 47. What is the `@starting-style` at-rule?

`@starting-style` defines the initial styles for an element when it first appears (e.g., entering the DOM or transitioning from `display: none`). This enables entry animations with CSS transitions:

```css
.dialog {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s;
}

@starting-style {
  .dialog {
    opacity: 0;
    transform: translateY(-20px);
  }
}
```

Before `@starting-style`, CSS transitions could not animate elements appearing for the first time because there was no "before" state to transition from.

---

## 48. What is the `popover` attribute and how does CSS style it?

The HTML `popover` attribute combined with CSS anchoring and the `::backdrop` pseudo-element enables native pop-up behavior:

```css
[popover] {
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

[popover]::backdrop {
  background: rgba(0, 0, 0, 0.3);
}

[popover]:popover-open {
  opacity: 1;
}
```

This eliminates the need for custom modal/tooltip JavaScript for many common UI patterns.

---

## 49. What is CSS anchor positioning?

CSS anchor positioning allows an element to be positioned relative to another element (the anchor) without JavaScript:

```css
.tooltip {
  position: fixed;
  position-anchor: --button;
  top: anchor(bottom);
  left: anchor(center);
}

.trigger {
  anchor-name: --button;
}
```

This is designed for tooltips, dropdowns, and popovers that need to follow their trigger elements. It includes built-in fallback positioning for when the preferred position would overflow the viewport.

---

## 50. Explain the `overscroll-behavior` property.

`overscroll-behavior` controls what happens when scrolling reaches the boundary of a scroll container:

```css
.modal-body {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

| Value | Behavior |
|-------|----------|
| `auto` | Default browser behavior (scroll chaining to parent) |
| `contain` | Prevents scroll chaining; keeps scrolling within the element |
| `none` | Prevents scroll chaining and bounce/refresh effects |

`contain` is essential for modals and sidebars to prevent the page behind from scrolling when the user reaches the bottom of the modal's scrollable area.

---

## 51. How do you implement a responsive grid without media queries?

Using `auto-fit`/`auto-fill` with `minmax()`:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 16px;
}
```

This creates a grid where columns are at least 300px (or 100% on small screens) and grow to fill space. Items wrap automatically as the container resizes, with no breakpoints needed.

---

## 52. What is the `inset` shorthand property?

`inset` is a shorthand for `top`, `right`, `bottom`, and `left`:

```css
.overlay {
  position: fixed;
  inset: 0; /* equivalent to top: 0; right: 0; bottom: 0; left: 0; */
}

.modal {
  position: fixed;
  inset: 10% 20%;
}
```

---

## 53. What are CSS counters?

CSS counters are variables maintained by CSS whose values can be incremented and displayed using `counter()` or `counters()`:

```css
body { counter-reset: section; }

h2::before {
  counter-increment: section;
  content: counter(section) ". ";
}
```

Nested counters:

```css
ol { counter-reset: item; }
li::before {
  counter-increment: item;
  content: counters(item, ".") " ";
}
```

This auto-numbers sections or nested lists purely with CSS.

---

## 54. What is `mix-blend-mode` and `background-blend-mode`?

These properties control how colors blend:

```css
.overlay-effect {
  mix-blend-mode: multiply; /* blends with elements behind */
}
.textured-bg {
  background-image: url("texture.png"), linear-gradient(#3498db, #2ecc71);
  background-blend-mode: overlay; /* blends backgrounds within element */
}
```

Common modes: `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `difference`. They enable Photoshop-like effects purely in CSS.

---

## 55. What is the `shape-outside` property?

`shape-outside` defines a shape around which inline content wraps, enabling magazine-style text flow:

```css
.circular-image {
  float: left;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  shape-outside: circle(50%);
  margin-right: 16px;
}
```

Values: `circle()`, `ellipse()`, `polygon()`, `inset()`, `url()` (uses image alpha channel). `shape-margin` adds spacing between the shape and the text.

---

## 56. What is the `:has()` selector, and why is it called the "parent selector"?

`:has()` selects an element based on its descendants or following siblings:

```css
.card:has(img) { padding-top: 0; }
.form:has(:invalid) { border-color: red; }
h2:has(+ p) { margin-bottom: 8px; }
figure:has(> figcaption) { border: 1px solid #eee; }
```

It is called the "parent selector" because for the first time in CSS, you can style a parent based on its children. It is extremely powerful for contextual styling and eliminates many JavaScript-based class toggling patterns.

---

## 57. What is the `:not()` selector, and what are its new capabilities?

The original `:not()` accepted only simple selectors. The modern version accepts complex selector lists:

```css
/* Old: single simple selector */
input:not([disabled]) { }

/* Modern: complex selector list */
.item:not(.featured, .archived) { }
nav a:not(:first-child, :last-child) { }
div:not(.card > .title) { }
```

Specificity of `:not()` equals the specificity of its most specific argument.

---

## 58. What is the `mask` property?

`mask` applies an image or gradient as an alpha mask, controlling element transparency per-pixel:

```css
.masked {
  mask-image: linear-gradient(to bottom, black, transparent);
  mask-size: 100% 100%;
}
.icon-mask {
  mask-image: url("icon.svg");
  mask-repeat: no-repeat;
  mask-size: contain;
  background: currentColor;
}
```

This is commonly used for gradient fade-outs, SVG icon coloring, and creative image treatments.

---

## 59. How do you create a CSS-only dark mode toggle?

Using `:has()` and a checkbox:

```css
:root {
  --bg: #fff;
  --text: #1a1a1a;
}

:root:has(#dark-toggle:checked) {
  --bg: #1a1a1a;
  --text: #e5e5e5;
}

body {
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s, color 0.3s;
}
```

```html
<label for="dark-toggle">Dark mode</label>
<input type="checkbox" id="dark-toggle" />
```

---

## 60. Explain the `touch-action` property.

`touch-action` controls how the browser handles touch gestures:

```css
.carousel { touch-action: pan-y; }    /* allow vertical scroll, block horizontal */
.pinch-zoom { touch-action: manipulation; } /* allow pan+zoom, disable double-tap delay */
.no-touch { touch-action: none; }      /* handle everything in JavaScript */
```

This improves touch responsiveness by eliminating the 300ms tap delay (with `manipulation`) and prevents unwanted gestures on interactive elements like sliders and canvases.

---

## 61. What is `forced-colors` mode, and how do you support it?

Forced colors mode (Windows High Contrast) overrides author colors with user-chosen system colors. Use `@media (forced-colors: active)` to adapt:

```css
@media (forced-colors: active) {
  .btn {
    border: 2px solid ButtonText;
    forced-color-adjust: none; /* opt out if needed */
  }
}
```

System color keywords (`Canvas`, `CanvasText`, `LinkText`, `ButtonText`, `ButtonFace`, `Highlight`, `HighlightText`) map to the user's chosen colors.

---

## 62. What is `prefers-contrast` and how do you support it?

```css
@media (prefers-contrast: more) {
  :root {
    --border-color: #000;
    --text-color: #000;
    --bg-color: #fff;
  }
}

@media (prefers-contrast: less) {
  :root {
    --border-color: #ccc;
    --text-color: #555;
  }
}
```

This media feature detects whether the user prefers increased or decreased contrast, allowing you to adjust colors and borders accordingly.

---

## 63. What are the `outline-offset` and `outline-style` properties?

`outline-offset` adjusts the gap between the element's border and the outline. Positive values push the outline outward; negative values pull it inward (even overlapping the element).

```css
button:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 3px;
}
```

This creates a visible gap between the button and its focus ring, which is both aesthetically pleasing and easier to see against complex backgrounds.

---

## 64. Explain the `column-count` and multi-column layout.

Multi-column layout creates newspaper-style columns:

```css
.article {
  column-count: 3;
  column-gap: 32px;
  column-rule: 1px solid #ddd;
}

.article h2 {
  column-span: all;
}
```

`column-width` sets a minimum column width and lets the browser calculate the count. `break-inside: avoid` prevents elements from splitting across columns.

---

## 65. What is `image-rendering`?

`image-rendering` controls how images are upscaled:

```css
.pixel-art {
  image-rendering: pixelated; /* sharp pixel edges */
}
.photo {
  image-rendering: auto; /* browser's default smooth scaling */
}
```

`pixelated` is essential for pixel art and low-resolution textures. `crisp-edges` preserves hard edges without pixelation (useful for diagrams).

---

## 66. What is the `math` style in `font-variant-numeric`?

`font-variant-numeric` controls number presentation in OpenType fonts:

```css
.tabular {
  font-variant-numeric: tabular-nums; /* equal-width digits for alignment */
}
.old-style {
  font-variant-numeric: oldstyle-nums; /* lowercase-style digits */
}
.fractions {
  font-variant-numeric: diagonal-fractions; /* ½ style fractions */
}
```

`tabular-nums` is critical for data tables and timers where numbers must align vertically across rows.

---

## 67. Explain `::part()` and Shadow DOM styling.

`::part()` allows styling Shadow DOM elements from outside, when the component explicitly exposes parts:

```html
<custom-card>
  #shadow-root
    <h2 part="title">Card Title</h2>
    <p part="body">Card content</p>
</custom-card>
```

```css
custom-card::part(title) {
  color: blue;
  font-size: 1.5rem;
}
```

This bridges the encapsulation boundary of Shadow DOM without exposing internal structure.

---

## 68. What is the `line-clamp` property?

`line-clamp` truncates text to a specific number of lines with an ellipsis:

```css
.excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

The standard `line-clamp` property (without `-webkit-` prefix) is being standardized but currently requires the prefixed version for cross-browser support.

---

## 69. What is `scroll-timeline` and how does it work?

`scroll-timeline` creates a timeline tied to scroll progress:

```css
.scroll-container {
  scroll-timeline: --page-scroll block;
}

.progress-bar {
  animation: grow-width linear both;
  animation-timeline: --page-scroll;
}

@keyframes grow-width {
  from { width: 0; }
  to { width: 100%; }
}
```

The progress bar width animates from 0 to 100% as the user scrolls from top to bottom. This replaces JavaScript scroll event listeners for progress indicators and parallax effects.

---

## 70. How do you handle CSS specificity conflicts in large projects?

Strategies in order of preference:

1. **CSS Layers** — `@layer` explicitly orders rule groups.
2. **Low-specificity selectors** — Use `:where()` for resets and defaults.
3. **Methodology** — BEM ensures flat, non-conflicting class names.
4. **CSS Modules/Scoped styles** — Build tools generate unique class names.
5. **Single class selectors** — Avoid nested/compound selectors.
6. **Utility-first** — Tailwind applies single-purpose classes directly.
7. **Avoid `!important`** — If needed, isolate in a utility layer.

---

## 71. What is the `content-visibility: hidden` value?

Unlike `content-visibility: auto` (which renders when near the viewport), `content-visibility: hidden` always skips rendering. Unlike `display: none`, the element retains its cached rendering state, making it much faster to show again.

Use case: off-screen tabs in a tab panel. The inactive tab is hidden with `content-visibility: hidden`; when activated, the browser restores it from cache instead of re-rendering.

---

## 72. What is the `env()` function?

`env()` accesses environment variables set by the user agent, most commonly for safe area insets on notched/rounded devices:

```css
.bottom-bar {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

The second argument is a fallback value. You also need `<meta name="viewport" content="viewport-fit=cover">` to enable it.

---

## 73. How do you create a CSS-only tooltip?

```css
.tooltip {
  position: relative;
}
.tooltip::after {
  content: attr(data-tip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #333;
  color: #fff;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
.tooltip:hover::after,
.tooltip:focus::after {
  opacity: 1;
}
```

```html
<button class="tooltip" data-tip="Save changes">Save</button>
```

---

## 74. What is `interpolate-size` and how does it enable `height: auto` animations?

Traditionally, you cannot transition `height: auto` because the browser cannot interpolate between a fixed value and `auto`. `interpolate-size: allow-keywords` enables this:

```css
:root {
  interpolate-size: allow-keywords;
}

.accordion-panel {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}
.accordion-panel.open {
  height: auto;
}
```

This eliminates the need for JavaScript-measured max-height hacks for collapsible sections.

---

## 75. What is the `@media` `hover` and `pointer` features?

These detect input device capabilities:

```css
@media (hover: hover) {
  .link:hover { text-decoration: underline; }
}

@media (hover: none) {
  .link { text-decoration: underline; } /* always show on touch */
}

@media (pointer: coarse) {
  .btn { min-height: 44px; min-width: 44px; } /* larger tap targets */
}

@media (pointer: fine) {
  .btn { min-height: 32px; }
}
```

`hover: hover` means the primary input can hover (mouse). `pointer: coarse` means imprecise pointing (touch). This ensures appropriate interactions per device type.

---

## 76. What is `text-underline-offset` and `text-decoration-thickness`?

These properties give fine-grained control over underline appearance:

```css
a {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  text-decoration-color: rgba(0, 0, 0, 0.3);
}
a:hover {
  text-decoration-color: currentColor;
}
```

This creates modern, well-spaced underlines that do not cut through descenders, improving readability and aesthetics.

---

## 77. Explain `outline` vs. `box-shadow` for focus indicators.

`outline` does not affect layout and follows `border-radius` in modern browsers. `box-shadow` also does not affect layout and always follows `border-radius`, but can be combined with existing shadows.

```css
/* Outline approach */
button:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

/* Box-shadow approach */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
}
```

`outline` is the accessible default. `box-shadow` is useful when you need rounded focus rings on older browsers where outlines did not follow `border-radius`.

---

## 78. What is `font-variation-settings` and variable fonts?

Variable fonts contain multiple styles (weight, width, slant) in a single file, controlled by variation axes:

```css
@font-face {
  font-family: "InterVariable";
  src: url("Inter.var.woff2") format("woff2");
  font-weight: 100 900;
}

.text {
  font-family: "InterVariable";
  font-weight: 450; /* any value between 100-900 */
}

.fancy {
  font-variation-settings: "wght" 600, "slnt" -10, "wdth" 85;
}
```

Benefits: one font file replaces multiple weight files, reducing downloads. Animations between weights become smooth because the browser interpolates between axis values.

---

## 79. What is the `@layer` import syntax?

You can assign an imported stylesheet directly to a layer:

```css
@import url("reset.css") layer(reset);
@import url("framework.css") layer(framework);

@layer reset, framework, components, utilities;

@layer components {
  .card { padding: 16px; }
}
```

This ensures third-party CSS always sits in a controlled layer, preventing it from accidentally overriding your component styles regardless of specificity.

---

## 80. Explain the `contain-intrinsic-size` property.

When using `content-visibility: auto`, the browser skips rendering off-screen elements but needs an estimated size to calculate scroll height. `contain-intrinsic-size` provides this estimate:

```css
.article {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

The `auto` keyword tells the browser to remember the element's actual rendered size once it has been laid out, using that instead of the estimate for subsequent visits.

---

## 81. How do you create a responsive image gallery with CSS Grid?

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
  gap: 8px;
}

.gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

.gallery .featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

---

## 82. What is the `field-sizing` property?

`field-sizing: content` makes form fields (like `<textarea>` and `<input>`) automatically resize to fit their content:

```css
textarea {
  field-sizing: content;
  min-height: 3lh; /* minimum 3 lines */
  max-height: 10lh;
}
```

This eliminates the need for JavaScript auto-resize libraries.

---

## 83. What are the `lh` and `rlh` units?

`lh` equals the computed `line-height` of the current element. `rlh` equals the root element's computed `line-height`. These are useful for sizing elements relative to text lines:

```css
.spacer { height: 2lh; }    /* 2 lines tall */
textarea { min-height: 4lh; } /* at least 4 lines */
```

---

## 84. What is the `timeline-scope` property?

`timeline-scope` makes a scroll or view timeline available to elements outside the normal scoping tree:

```css
.page {
  timeline-scope: --hero-scroll;
}

.scroll-section {
  scroll-timeline: --hero-scroll;
}

.unrelated-element {
  animation: fade linear both;
  animation-timeline: --hero-scroll;
}
```

Without `timeline-scope`, a scroll timeline is only available to descendants of the scroll container.

---

## 85. What is `@media (scripting: none)` for?

This media feature detects whether JavaScript is enabled:

```css
@media (scripting: none) {
  .js-only { display: none; }
  .no-js-fallback { display: block; }
}

@media (scripting: enabled) {
  .no-js-fallback { display: none; }
}
```

It provides a pure-CSS way to show or hide content based on JavaScript availability.

---

## 86. What is the `print` media type, and how do you optimize CSS for printing?

```css
@media print {
  body { font-size: 12pt; color: #000; background: #fff; }
  nav, footer, .no-print { display: none; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 0.8em; }
  .page-break { break-before: page; }
  * { box-shadow: none !important; text-shadow: none !important; }
}
```

Key considerations: remove backgrounds and shadows (save ink), show link URLs, use `pt` units, set explicit page breaks, and hide non-essential UI elements.

---

## 87. What is the `@page` rule?

`@page` controls printed page properties:

```css
@page {
  size: A4 portrait;
  margin: 2cm;
}

@page :first {
  margin-top: 4cm;
}

@page :left { margin-left: 3cm; }
@page :right { margin-right: 3cm; }
```

---

## 88. What is the `hyphens` property?

`hyphens` controls automatic word hyphenation:

```css
.article {
  hyphens: auto;
  hyphenate-limit-chars: 6 3 3;
}
```

`auto` enables browser-driven hyphenation (requires `lang` attribute on HTML). `manual` only breaks at `&shy;` soft hyphens. `none` disables hyphenation entirely.

---

## 89. What is `text-spacing-trim`?

`text-spacing-trim` adjusts spacing around CJK (Chinese, Japanese, Korean) punctuation for improved typography:

```css
.japanese-text {
  text-spacing-trim: space-all;
}
```

This is important for East Asian typography where punctuation marks are full-width and can create excessive visual whitespace.

---

## 90. How do you create a sticky header that respects scroll-padding?

```css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 64px;
}

html {
  scroll-padding-top: 64px;
}
```

`scroll-padding-top` ensures anchor links and `scrollIntoView` account for the sticky header height, preventing content from being hidden behind it.

---

## 91. What is `overflow-anchor` and scroll anchoring?

Scroll anchoring prevents content jumps when above-the-fold content loads dynamically (ads, images, lazy content). Browsers enable it by default. `overflow-anchor: none` disables it for specific elements:

```css
.ad-slot {
  overflow-anchor: none;
}
```

To ensure anchoring works well, provide explicit dimensions (via `aspect-ratio` or fixed height) for dynamically loaded content.

---

## 92. What is the `individual-transform` properties?

CSS now allows setting transform functions as individual properties:

```css
.element {
  translate: 50px 100px;
  rotate: 45deg;
  scale: 1.5;
}
```

This is equivalent to `transform: translate(50px, 100px) rotate(45deg) scale(1.5)` but allows independent animation of each function without overriding the others.

---

## 93. Explain CSS cascade ordering with `@layer` and `!important`.

Normal declarations: later layers win. `!important` declarations: the order **reverses** — earlier layers win.

```css
@layer base, components;

@layer base {
  p { color: black !important; } /* wins because base is earlier */
}
@layer components {
  p { color: blue !important; }  /* loses to base !important */
}
```

This inversion is by design: lower-priority layers should be able to use `!important` to protect values from being overridden by higher-priority layers. Unlayered `!important` still wins over all layered `!important`.

---

## 94. How do you implement fluid typography?

```css
:root {
  font-size: clamp(1rem, 0.5rem + 1vw, 1.25rem);
}

h1 { font-size: clamp(2rem, 1rem + 3vw, 4rem); }
h2 { font-size: clamp(1.5rem, 0.75rem + 2vw, 3rem); }
```

This scales typography smoothly between a minimum and maximum based on viewport width, eliminating the need for font-size breakpoints.

---

## 95. What is `animation-composition`?

`animation-composition` controls how multiple animations or an animation and the underlying value are combined:

```css
.element {
  transform: translateX(100px);
  animation: slide 1s;
  animation-composition: add;
}
@keyframes slide {
  to { transform: translateX(50px); }
}
```

With `add`, the animated value is added to the underlying value (result: 150px). With `replace` (default), the animation overrides the underlying value (result: 50px). With `accumulate`, values are combined additively.

---

## 96. What is `transition-behavior: allow-discrete`?

This allows transitioning discrete properties like `display`:

```css
.modal {
  display: none;
  opacity: 0;
  transition: display 0.3s, opacity 0.3s;
  transition-behavior: allow-discrete;
}
.modal.open {
  display: block;
  opacity: 1;
}
```

Combined with `@starting-style`, this enables full entry/exit CSS transitions for elements toggling between `display: none` and a visible state.

---

## 97. How do CSS custom properties interact with the `var()` fallback?

`var()` accepts a fallback as the second argument:

```css
.card {
  color: var(--text-color, #333);
  padding: var(--card-padding, var(--spacing, 16px));
}
```

The fallback activates when the custom property is not defined. However, if the property is defined but set to an invalid value for the context, the browser uses the property's inherited value (not the fallback). This is a common source of bugs.

---

## 98. What is `font-palette` and `@font-palette-values`?

Color fonts (like emoji or multi-color typefaces) support palettes:

```css
@font-palette-values --brand-palette {
  font-family: "Bungee Spice";
  base-palette: 0;
  override-colors: 0 #3498db, 1 #2ecc71;
}

.heading {
  font-family: "Bungee Spice";
  font-palette: --brand-palette;
}
```

This customizes the colors within color fonts without editing the font file.

---

## 99. What is the `:user-valid` and `:user-invalid` pseudo-class?

These pseudo-classes apply only **after** the user has interacted with a form control:

```css
input:user-invalid {
  border-color: red;
}
input:user-valid {
  border-color: green;
}
```

Unlike `:invalid` (which applies immediately on page load), `:user-invalid` only triggers after the user modifies or blurs the input. This prevents premature error styling on empty forms.

---

## 100. How do you audit and improve CSS performance in a production application?

1. **Coverage** — Use Chrome DevTools Coverage tab to identify unused CSS. Remove or defer it.
2. **Critical CSS** — Extract above-the-fold CSS and inline it in `<head>`; load the rest asynchronously.
3. **Containment** — Apply `contain: content` to isolated widgets; use `content-visibility: auto` for off-screen sections.
4. **Animation** — Animate only `transform` and `opacity`; avoid animating layout properties.
5. **Selectors** — Avoid overly complex selectors (deeply nested, universal with qualifiers); keep selectors flat.
6. **Fonts** — Subset, use WOFF2, preload critical fonts, use `font-display: swap`.
7. **Bundle** — Minify CSS; use tree-shaking tools (PurgeCSS); configure `@layer` for priority.
8. **Layout** — Prefer Grid/Flexbox over JavaScript-calculated layouts; provide explicit dimensions.
9. **Monitoring** — Track Core Web Vitals (CLS, LCP) and CSS-related rendering metrics.
10. **Code quality** — Use Stylelint; enforce methodology (BEM/ITCSS); review for specificity issues.

---
