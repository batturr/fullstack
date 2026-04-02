# CSS & CSS3 Interview Questions — Senior (7+ Years Experience)

100 advanced questions with detailed answers for senior/lead engineers. Covers architecture, performance optimization, design systems, rendering internals, accessibility, and cutting-edge CSS.

---

## 1. Explain the complete browser rendering pipeline and where CSS fits in.

The browser rendering pipeline consists of these stages:

1. **Parse HTML** → DOM tree.
2. **Parse CSS** → CSSOM (CSS Object Model). `@import` and `<link>` block rendering until loaded.
3. **Style** — combine DOM + CSSOM → Render tree (only visible elements; `display: none` excluded).
4. **Layout (Reflow)** — calculate geometry (position, size) for each node in the render tree.
5. **Paint** — fill pixels: text, colors, images, borders, shadows. Paint operations are recorded.
6. **Composite** — layer paint results and composite them together (GPU-accelerated).

CSS impacts every stage except HTML parsing. Expensive CSS patterns include: large CSSOM (many rules/selectors), complex selectors (requiring extra matching work), layout-triggering properties (width, height, margin, top/left), paint-triggering properties (background, border-radius, box-shadow), and frequent recalculations from JS-driven style changes.

**Key optimization insight:** Changing `transform` or `opacity` on a composited layer skips layout and paint entirely, going straight to composite — making these the cheapest properties to animate.

---

## 2. What is the CSSOM, and how does it differ from the DOM?

The CSSOM (CSS Object Model) is a tree representation of all CSS rules parsed by the browser. It mirrors the DOM but contains style information. Key differences:

- The DOM represents document structure; the CSSOM represents style rules.
- The CSSOM is render-blocking — the browser will not render anything until CSS is fully parsed.
- JavaScript can access the CSSOM via `document.styleSheets`, `getComputedStyle()`, and `CSSStyleSheet` objects.
- The CSSOM is not queryable like the DOM (no `querySelector` equivalent); you iterate rule lists.

The **Render Tree** is constructed by combining DOM and CSSOM, containing only nodes that are visible and styled. This means `<head>`, `<script>`, and elements with `display: none` are excluded from the render tree.

---

## 3. What are render-blocking and parser-blocking resources, and how does CSS interact with them?

CSS is **render-blocking** by default — the browser will not render any content until all CSS referenced in `<head>` is downloaded and parsed. This is because rendering without styles causes a flash of unstyled content (FOUC).

Strategies to mitigate:
- **Critical CSS**: Extract and inline above-the-fold CSS in `<head>`.
- **Async loading**: Load non-critical CSS with `<link rel="preload" as="style" onload="this.rel='stylesheet'">` or `media="print" onload="this.media='all'"`.
- **HTTP/2 push or 103 Early Hints**: Hint the browser to fetch CSS early.
- **Reduce CSS size**: Minify, tree-shake, and remove unused rules.
- **`@import` avoidance**: `@import` chains CSS downloads sequentially; use parallel `<link>` tags instead.

```html
<!-- Critical CSS inline -->
<style>
  body { margin: 0; font-family: system-ui; }
  .header { height: 64px; background: #fff; }
</style>
<!-- Non-critical CSS loaded async -->
<link rel="preload" href="styles.css" as="style"
      onload="this.rel='stylesheet'" />
```

---

## 4. How does the browser's style recalculation work, and what makes it expensive?

When the DOM or CSSOM changes, the browser must recalculate which rules apply to which elements. The cost depends on:

1. **Number of elements affected** — changing a class on `<body>` can invalidate styles for the entire page.
2. **Selector complexity** — deeply nested selectors or selectors with pseudo-classes require more matching work.
3. **DOM size** — more nodes means more work.

Browsers match selectors right-to-left (the rightmost part is checked first). A selector like `div.container > ul > li > a.link` starts by finding all `a.link` elements, then checks if each has the required ancestors. This means the rightmost part (key selector) should be as specific as possible.

**Optimization strategies:**
- Avoid universal key selectors: `*.active` is much more expensive than `.card.active`.
- Keep selectors flat and class-based.
- Use CSS containment (`contain: style`) to limit recalculation scope.
- Batch DOM changes to minimize style recalculation triggers.

---

## 5. Explain compositor layers, layer promotion, and their CSS triggers.

The browser composites the final page from multiple layers. Some elements are promoted to their own compositor layers:

**Automatic promotion triggers:**
- `transform: translateZ(0)` or `translate3d(0,0,0)`
- `will-change: transform` or `will-change: opacity`
- `position: fixed`
- Animated `transform` or `opacity`
- `<video>`, `<canvas>`, CSS `filter`, `backdrop-filter`
- Elements overlapping an already-composited layer

**Benefits:** Changes to a composited layer only require compositing (cheapest step), not layout or paint.

**Costs:** Each layer consumes GPU memory. Excessive layer promotion (e.g., `will-change: transform` on hundreds of elements) can cause memory issues and actually degrade performance.

**Best practice:** Let the browser decide. Only manually promote elements you will actually animate with `transform`/`opacity`. Apply `will-change` just before animation, remove after.

---

## 6. How do you design a robust CSS architecture for a large-scale application?

A scalable CSS architecture addresses predictability, maintainability, and performance:

**Layer structure (ITCSS or similar):**
```
Settings     → Variables, feature flags
Tools        → Mixins, functions (preprocessor only)
Generic      → Reset/normalize, box-sizing
Elements     → Bare HTML element styles
Objects      → Layout primitives (container, grid, media)
Components   → UI components (card, button, modal)
Utilities    → Single-purpose overrides (hidden, text-center)
```

**Enforce with CSS Layers:**
```css
@layer reset, tokens, base, layout, components, utilities;
```

**Naming:** BEM for component classes. Utility classes for overrides. Data attributes for state (`[data-state="open"]`).

**Scoping:** CSS Modules or `@scope` for component isolation. Design tokens via CSS custom properties.

**Testing:** Visual regression tests (Chromatic, Percy). Stylelint rules enforcing naming and specificity limits. CSS coverage analysis in CI.

**Performance budget:** Maximum CSS bundle size. Critical CSS extraction. `content-visibility: auto` for long pages.

---

## 7. What are design tokens, and how do you implement them with CSS?

Design tokens are the smallest atomic design decisions — colors, spacing, typography, shadows, radii — stored as platform-agnostic variables. They bridge design and engineering.

```css
:root {
  /* Primitive tokens */
  --color-blue-500: oklch(55% 0.2 250);
  --color-gray-100: oklch(95% 0.01 250);
  --space-4: 1rem;
  --radius-md: 8px;

  /* Semantic tokens */
  --color-primary: var(--color-blue-500);
  --color-surface: var(--color-gray-100);
  --spacing-component: var(--space-4);
  --radius-card: var(--radius-md);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: oklch(70% 0.15 250);
    --color-surface: oklch(20% 0.01 250);
  }
}
```

**Architecture:** Primitive tokens → Semantic tokens → Component tokens. This three-tier system allows theme changes by remapping semantic tokens without touching components. Tools like Style Dictionary or Cobalt can generate CSS custom properties from a central token source.

---

## 8. How do you build a themeable design system with CSS custom properties?

```css
/* Theme contract */
:root {
  --ds-color-bg: #ffffff;
  --ds-color-fg: #1a1a1a;
  --ds-color-primary: oklch(55% 0.2 250);
  --ds-color-surface: oklch(97% 0.005 250);
  --ds-shadow-md: 0 4px 12px oklch(0% 0 0 / 0.1);
  --ds-radius-md: 8px;
  --ds-font-body: system-ui, sans-serif;
  --ds-space-unit: 4px;
}

/* Dark theme override */
[data-theme="dark"] {
  --ds-color-bg: #0a0a0a;
  --ds-color-fg: #e5e5e5;
  --ds-color-primary: oklch(70% 0.15 250);
  --ds-color-surface: oklch(15% 0.005 250);
  --ds-shadow-md: 0 4px 12px oklch(0% 0 0 / 0.4);
}

/* Brand B override */
[data-theme="brand-b"] {
  --ds-color-primary: oklch(60% 0.2 150);
}

/* Components use only tokens, never raw values */
.card {
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-md);
  padding: calc(var(--ds-space-unit) * 4);
}
```

Key principles: Components never reference raw color/spacing values. Theme switching is a token remap, not a style override. Validation tools ensure no component uses raw values.

---

## 9. Explain the CSS `@layer` ordering inversion with `!important` and its design rationale.

In normal (non-important) declarations, later layers have higher priority:

```css
@layer base, components, utilities;
/* utilities > components > base */
```

With `!important`, the priority **inverts** — earlier layers win:

```css
@layer base {
  p { color: black !important; } /* WINS */
}
@layer utilities {
  p { color: red !important; }   /* loses */
}
```

**Rationale:** This inversion ensures that foundational layers (resets, accessibility) can protect critical values with `!important` and those values cannot be overridden by higher-priority layers. Without inversion, a utility layer's `!important` would override a reset layer's `!important`, defeating the purpose of layered architecture.

Unlayered `!important` beats all layered `!important`. The full priority order for `!important` is: user-agent important > user important > unlayered author important > first-layer author important > ... > last-layer author important.

---

## 10. How do you approach CSS-to-JavaScript communication in complex UIs?

**CSS → JS:**
- `getComputedStyle()` reads resolved values including custom properties.
- `ResizeObserver` reacts to element size changes (driven by CSS layout).
- `matchMedia()` observes media query state changes.
- CSS custom properties as a data channel:

```javascript
const value = getComputedStyle(element).getPropertyValue('--breakpoint');
```

**JS → CSS:**
- `element.style.setProperty('--scroll-y', window.scrollY)` updates custom properties.
- Toggle classes/data-attributes that CSS selects on.
- `CSSStyleSheet` API for programmatic rule insertion.

```javascript
const sheet = new CSSStyleSheet();
sheet.replaceSync('.dynamic { color: red; }');
document.adoptedStyleSheets = [sheet];
```

**Best practice:** Use CSS custom properties as the primary bridge. JavaScript sets values; CSS consumes them via `var()`. This keeps styling logic in CSS and data logic in JavaScript.

---

## 11. How does CSS containment (`contain`) improve rendering performance?

CSS containment creates an optimization boundary. When the browser knows that changes inside a contained element cannot affect the outside (and vice versa), it can:

1. **Skip layout recalculation** for the contained subtree when external changes occur.
2. **Skip paint** for off-screen contained elements.
3. **Limit style recalculation scope** with `contain: style`.

```css
.widget {
  contain: layout paint;  /* or contain: content */
}
```

Real-world impact: A dashboard with 50 independent widgets, each with `contain: content`, can recalculate layout for a single widget change without touching the other 49. This turns O(n) recalculation into O(1).

Pair with `content-visibility: auto` for the ultimate rendering optimization on long scrollable pages.

---

## 12. Explain `content-visibility` in depth — how it interacts with accessibility, SEO, and find-in-page.

`content-visibility: auto` tells the browser to skip rendering for off-screen elements:

- **Layout:** The element is given an estimated size (`contain-intrinsic-size`) for scroll calculations.
- **Paint and style:** Completely skipped until near-viewport.
- **Accessibility:** Content remains in the accessibility tree (screen readers can still access it).
- **SEO:** Content is in the DOM and parsed by crawlers.
- **Find-in-page (Ctrl+F):** The browser renders the content when searched, scrolling to the match.

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}
```

**Caveats:** Scroll position can jump if `contain-intrinsic-size` is significantly different from actual size. Use `auto` with a fallback value so the browser remembers the real size after first render. Avoid on above-the-fold content (it is already visible).

---

## 13. What is the CSS Typed Object Model (Typed OM), and how does it improve performance?

Typed OM (part of Houdini) provides a JavaScript API for CSS values as typed objects instead of strings:

```javascript
// Old (string-based, requires parsing)
element.style.opacity = '0.5';
const opacity = getComputedStyle(element).opacity; // string "0.5"

// Typed OM (structured, faster)
element.attributeStyleMap.set('opacity', 0.5);
const opacity = element.computedStyleMap().get('opacity'); // CSSUnitValue { value: 0.5 }

// Unit arithmetic
const width = CSS.px(100).add(CSS.percent(50));
```

Benefits: eliminates string parsing overhead, catches type errors early, enables arithmetic on CSS values, and is ~30% faster for style operations in benchmarks.

---

## 14. Explain the CSS Paint API (Houdini Paint Worklet).

The Paint API lets you draw custom backgrounds, borders, and decorations using a Canvas-like API:

```javascript
// paint-worklet.js
class CheckerPainter {
  static get inputProperties() { return ['--checker-size', '--checker-color']; }

  paint(ctx, size, props) {
    const cellSize = parseInt(props.get('--checker-size'));
    const color = props.get('--checker-color').toString();
    for (let y = 0; y < size.height; y += cellSize) {
      for (let x = 0; x < size.width; x += cellSize) {
        if ((x / cellSize + y / cellSize) % 2 === 0) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }
}

registerPaint('checker', CheckerPainter);
```

```css
.bg {
  --checker-size: 20;
  --checker-color: #eee;
  background: paint(checker);
}
```

Use cases: procedural patterns, responsive decorations that adapt to element size, effects that would be impossible or extremely complex with CSS alone.

---

## 15. How does the CSS Layout API (Houdini) work?

The Layout API lets you define custom layout algorithms:

```javascript
// layout-worklet.js
class MasonryLayout {
  static get inputProperties() { return ['--masonry-gap']; }

  async intrinsicSizes() { }

  async layout(children, edges, constraints, styleMap) {
    const gap = parseInt(styleMap.get('--masonry-gap'));
    const columns = Math.floor(constraints.fixedInlineSize / 250);
    const columnHeights = new Array(columns).fill(0);

    const childFragments = await Promise.all(
      children.map(child => child.layoutNextFragment({ fixedInlineSize: constraints.fixedInlineSize / columns - gap }))
    );

    childFragments.forEach(fragment => {
      const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
      fragment.inlineOffset = shortestCol * (constraints.fixedInlineSize / columns);
      fragment.blockOffset = columnHeights[shortestCol];
      columnHeights[shortestCol] += fragment.blockSize + gap;
    });

    return { childFragments, autoBlockSize: Math.max(...columnHeights) };
  }
}

registerLayout('masonry', MasonryLayout);
```

```css
.grid {
  display: layout(masonry);
  --masonry-gap: 16;
}
```

---

## 16. How do you implement a complete responsive spacing system?

```css
:root {
  --space-unit: 0.25rem;    /* 4px base */
  --space-1: var(--space-unit);             /* 4px */
  --space-2: calc(var(--space-unit) * 2);   /* 8px */
  --space-3: calc(var(--space-unit) * 3);   /* 12px */
  --space-4: calc(var(--space-unit) * 4);   /* 16px */
  --space-6: calc(var(--space-unit) * 6);   /* 24px */
  --space-8: calc(var(--space-unit) * 8);   /* 32px */
  --space-12: calc(var(--space-unit) * 12); /* 48px */
  --space-16: calc(var(--space-unit) * 16); /* 64px */
}

/* Responsive scaling */
@media (min-width: 768px) {
  :root {
    --space-unit: 0.3rem;
  }
}

/* Fluid spacing */
.section {
  padding-block: clamp(var(--space-8), 5vw, var(--space-16));
}
```

The single `--space-unit` change cascades through all derived tokens. Pair with a type scale using `clamp()` for fully fluid, consistent spacing.

---

## 17. Explain the `@property` at-rule and its role in animating custom properties.

`@property` registers a custom property with metadata the browser needs for interpolation:

```css
@property --hue {
  syntax: "<number>";
  initial-value: 0;
  inherits: false;
}

.rainbow {
  --hue: 0;
  background: oklch(70% 0.15 var(--hue));
  animation: hue-rotate 3s linear infinite;
}

@keyframes hue-rotate {
  to { --hue: 360; }
}
```

Without `@property`, `--hue` is a string and cannot be animated. With registration, the browser knows it is a `<number>` and smoothly interpolates between values.

Supported syntaxes: `<number>`, `<integer>`, `<length>`, `<percentage>`, `<color>`, `<angle>`, `<time>`, `<resolution>`, `<transform-function>`, `<transform-list>`, `<custom-ident>`, `<image>`, and combinations with `|`, `+`, `#`.

---

## 18. How do you architect CSS for micro-frontends?

Micro-frontends require CSS isolation between independently deployed applications:

1. **Shadow DOM** — strongest isolation; each micro-frontend renders in a shadow root. Styles cannot leak in or out (except via `::part()` and custom properties).

2. **CSS Layers with namespace** — each micro-frontend declares its styles in a named layer with prefixed class names:
```css
@layer mfe-checkout {
  .checkout-btn { background: blue; }
}
```

3. **CSS Modules / Scoped styles** — build-tool-generated unique class names prevent collisions.

4. **Constructable Stylesheets** — programmatic stylesheet injection per micro-frontend:
```javascript
const sheet = new CSSStyleSheet();
sheet.replaceSync(cssText);
shadowRoot.adoptedStyleSheets = [sheet];
```

5. **Convention** — prefix all classes with the micro-frontend name: `.mfe-cart-item`.

The best approach depends on the framework, integration method (iframe, Web Components, module federation), and whether shared design tokens are needed.

---

## 19. How do you handle CSS for Web Components with Shadow DOM?

Inside Shadow DOM, styles are encapsulated. External CSS does not apply (with exceptions), and internal CSS does not leak out.

**Styling approaches:**

```css
/* Inherited properties pierce shadow boundary */
:host {
  color: var(--text-color, #333);
  font-family: inherit;
}

/* Expose parts for external styling */
/* Inside shadow: */
<span part="label">Text</span>

/* Outside: */
my-component::part(label) {
  font-weight: bold;
}

/* Theme via custom properties */
:host {
  --button-bg: var(--ds-color-primary, blue);
}
.internal-btn {
  background: var(--button-bg);
}

/* Constructable Stylesheets for dynamic styles */
const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host { display: block; }
  .content { padding: 16px; }
`);
this.shadowRoot.adoptedStyleSheets = [sheet];
```

---

## 20. What is the Constructable Stylesheets API?

Constructable Stylesheets allow creating and modifying `CSSStyleSheet` objects in JavaScript, then adopting them into documents or shadow roots:

```javascript
const sheet = new CSSStyleSheet();
await sheet.replace(`
  .card { padding: 16px; border-radius: 8px; }
  .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
`);

document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
shadowRoot.adoptedStyleSheets = [sheet];
```

Benefits:
- Share a single stylesheet instance across multiple shadow roots (saves memory).
- Modify styles dynamically without DOM manipulation.
- No FOUC from dynamically inserted `<style>` tags.
- Used internally by many CSS-in-JS libraries for better performance.

---

## 21. How do you optimize Cumulative Layout Shift (CLS) with CSS?

CLS measures visual stability. CSS-related causes and fixes:

| Cause | CSS Fix |
|-------|---------|
| Images without dimensions | `img { aspect-ratio: 16/9; width: 100%; height: auto; }` |
| Custom fonts loading | `font-display: optional` or metric overrides (`size-adjust`) |
| Dynamic content insertion | Reserve space with `min-height` or `aspect-ratio` |
| Ads/embeds | Fixed-size containers with `contain: strict` |
| Animations | Animate only `transform`/`opacity`; never animate layout properties |
| Late-loading CSS | Inline critical CSS; preload non-critical |

```css
/* Reserve space for dynamically loaded content */
.ad-slot {
  min-height: 250px;
  contain: strict;
}

/* Prevent font-swap CLS */
@font-face {
  font-family: "Body";
  src: url("body.woff2") format("woff2");
  font-display: optional;
  size-adjust: 102%;
  ascent-override: 88%;
}
```

---

## 22. How do you optimize Largest Contentful Paint (LCP) with CSS?

LCP measures when the largest visible element renders. CSS optimizations:

1. **Inline critical CSS** — the CSS needed for above-the-fold content should be in `<head>` to avoid blocking.
2. **Preload hero images** — `<link rel="preload" as="image" fetchpriority="high">`.
3. **Avoid CSS `background-image` for LCP elements** — use `<img>` instead, which the browser's preload scanner can discover earlier.
4. **Eliminate render-blocking CSS** — defer non-critical stylesheets.
5. **Avoid `@import`** — it creates sequential download chains.
6. **Minimize CSS size** — minify, tree-shake, split by route.
7. **Font optimization** — preload critical fonts; use `font-display: swap`.

```html
<!-- Critical CSS inline -->
<style>
  .hero { min-height: 60vh; }
  .hero img { width: 100%; height: auto; }
</style>
<!-- Preload hero image -->
<link rel="preload" as="image" href="hero.webp" fetchpriority="high" />
<!-- Defer non-critical CSS -->
<link rel="preload" href="below-fold.css" as="style"
      onload="this.rel='stylesheet'" />
```

---

## 23. How does `content-visibility: auto` affect Interaction to Next Paint (INP)?

INP measures responsiveness — the time from user interaction to the next visual update. `content-visibility: auto` helps by:

1. Reducing the amount of DOM that needs style recalculation during interactions.
2. Skipping layout and paint for off-screen sections.
3. Lowering the cost of JavaScript-triggered DOM changes that cascade into CSS recalculation.

However, revealing previously-hidden content (when the user scrolls to it) incurs a rendering cost. Combine with `contain-intrinsic-size: auto <estimate>` and ensure the estimate is close to actual size to avoid scroll jank.

---

## 24. What is the critical rendering path, and how do you optimize CSS's role in it?

The critical rendering path is the sequence of steps the browser takes to render the first pixel:

HTML → DOM → CSS → CSSOM → Render Tree → Layout → Paint → Composite

**CSS optimizations:**
1. Minimize critical CSS bytes (inline above-the-fold styles).
2. Eliminate render-blocking requests (defer non-critical CSS).
3. Reduce CSSOM construction time (fewer rules, simpler selectors).
4. Use `<link rel="preconnect">` for CDN-hosted CSS.
5. HTTP/2 server push or 103 Early Hints for CSS resources.
6. Split CSS by route (only load what the current page needs).

---

## 25. How do you implement a CSS-driven state machine without JavaScript?

Using the checkbox hack with `:checked` and `~` combinators:

```css
.tabs input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

#tab-1:checked ~ .panels .panel-1,
#tab-2:checked ~ .panels .panel-2,
#tab-3:checked ~ .panels .panel-3 {
  display: block;
}

.panel { display: none; }

#tab-1:checked ~ .tab-labels label[for="tab-1"],
#tab-2:checked ~ .tab-labels label[for="tab-2"],
#tab-3:checked ~ .tab-labels label[for="tab-3"] {
  border-bottom: 2px solid var(--primary);
  color: var(--primary);
}
```

Modern CSS with `:has()` enables even more powerful state machines:

```css
.form:has(#step-2:checked) .step-2-content { display: block; }
.form:has(#step-2:checked) .progress-bar { width: 66%; }
```

---

## 26. How do you handle CSS for right-to-left (RTL) languages at scale?

**Logical properties first:**
```css
.card {
  margin-inline-start: 16px;    /* left in LTR, right in RTL */
  padding-inline: 24px;
  border-inline-start: 4px solid var(--accent);
  text-align: start;
}
```

**Direction-aware transforms:**
```css
[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}
```

**Flexbox and Grid adapt automatically** — `justify-content: flex-start` respects writing direction.

**Audit strategy:**
1. Lint for physical properties (`margin-left`, `padding-right`, `text-align: left`) and suggest logical alternatives.
2. Use `[dir="rtl"]` overrides only for visual elements that cannot use logical properties (transforms, absolute positioning offsets).
3. Test with `:dir(rtl)` pseudo-class where supported.

---

## 27. How do you implement CSS feature detection and progressive enhancement at scale?

```css
/* Layer progressive enhancements */
@layer base, enhanced;

@layer base {
  .layout {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}

@layer enhanced {
  @supports (display: grid) and (grid-template-columns: subgrid) {
    .layout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
    .layout > .card {
      display: grid;
      grid-template-rows: subgrid;
      grid-row: span 3;
    }
  }

  @supports (container-type: inline-size) {
    .card-wrapper { container-type: inline-size; }
    @container (min-width: 400px) {
      .card { flex-direction: row; }
    }
  }
}
```

This ensures a solid flexbox layout for all browsers, with grid + subgrid + container queries layered on for modern browsers.

---

## 28. What is the `:dir()` pseudo-class?

`:dir()` matches elements based on their computed text directionality:

```css
:dir(ltr) .arrow { transform: rotate(0deg); }
:dir(rtl) .arrow { transform: rotate(180deg); }
```

Unlike `[dir="rtl"]`, which only matches elements with an explicit `dir` attribute, `:dir(rtl)` matches any element with computed RTL directionality (inherited or from content). This is more robust for mixed-direction content.

---

## 29. How do you handle dynamic theming with CSS custom properties and JavaScript?

```css
:root {
  --hue: 220;
  --saturation: 80%;
  --primary: oklch(55% calc(var(--saturation) * 0.003) var(--hue));
  --primary-light: oklch(90% calc(var(--saturation) * 0.001) var(--hue));
  --primary-dark: oklch(30% calc(var(--saturation) * 0.003) var(--hue));
}
```

```javascript
function setThemeHue(hue) {
  document.documentElement.style.setProperty('--hue', hue);
}

function applyUserTheme(theme) {
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
}
```

This pattern enables user-customizable themes, brand color configuration, and A/B testing of visual styles without CSS rebuilds.

---

## 30. What is CSS Scope Proximity, and how does it resolve conflicts?

When two `@scope` rules match the same element with equal specificity, **scope proximity** determines the winner — the closer scope root wins:

```css
@scope (.light-section) {
  p { color: #1a1a1a; }
}

@scope (.card) {
  p { color: #333; }
}
```

If a `<p>` is inside both `.card` and `.light-section`, and `.card` is the closer ancestor, the `.card` scope wins. This models real-world component nesting naturally.

---

## 31. Explain the `anchor()` function and CSS anchor positioning in detail.

CSS anchor positioning connects positioned elements to anchor elements:

```css
.trigger {
  anchor-name: --tooltip-anchor;
}

.tooltip {
  position: fixed;
  position-anchor: --tooltip-anchor;

  /* Position below the anchor, centered */
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 8px;

  /* Fallback positioning */
  position-try-fallbacks: flip-block, flip-inline;
}
```

`position-try-fallbacks` defines alternative positions when the preferred position would overflow the viewport:
- `flip-block` — flip to the opposite side on the block axis.
- `flip-inline` — flip on the inline axis.
- Named `@position-try` blocks for custom fallback positions.

This eliminates JavaScript positioning libraries (Popper.js, Floating UI) for most tooltip/dropdown use cases.

---

## 32. How do you debug CSS performance issues?

**Tools:**
1. **Chrome DevTools Performance tab** — record and inspect rendering phases (style, layout, paint, composite). Look for long "Recalculate Style" or "Layout" tasks.
2. **Rendering panel** — enable Paint Flashing, Layout Shift Regions, Layer Borders.
3. **Coverage tab** — identify unused CSS rules.
4. **Performance Monitor** — real-time layout/sec, style recalc/sec counters.

**Process:**
1. Profile a slow interaction.
2. Identify the rendering phase causing the bottleneck.
3. If **Style Recalculation** is expensive: reduce selector complexity, use `contain: style`, reduce DOM size.
4. If **Layout** is expensive: avoid layout-triggering properties in animations, use `contain: layout`, batch DOM reads/writes.
5. If **Paint** is expensive: reduce `box-shadow` complexity, minimize `filter` usage, promote animated elements to compositor layers.
6. If **Composite** is expensive: reduce the number of promoted layers.

---

## 33. What is the Layout Instability API, and how does it relate to CSS?

The Layout Instability API (in Performance Observer) reports layout shifts — when visible elements move without user input. This directly feeds the CLS Core Web Vital.

CSS causes of layout shifts:
- Images/iframes without explicit dimensions.
- Fonts swapping (FOUT).
- Dynamic content injected above existing content.
- Animations on layout properties.

CSS solutions:
```css
img, video { aspect-ratio: attr(width) / attr(height); max-width: 100%; height: auto; }
.skeleton { min-height: 200px; background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%); }
```

---

## 34. Explain the interaction between `@layer`, `@scope`, and `@container`.

These three at-rules serve orthogonal purposes and compose cleanly:

```css
@layer components {
  @scope (.card) to (.card-footer) {
    @container card-wrapper (min-width: 500px) {
      .card-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
  }
}
```

- `@layer components` — determines cascade priority relative to other layers.
- `@scope (.card)` — limits which DOM elements these rules apply to.
- `@container` — makes the rules conditional on the container's size.

They do not conflict. `@layer` controls cascade ordering, `@scope` controls DOM reach, and `@container` controls responsive behavior.

---

## 35. How do you implement CSS-based skeleton loading screens?

```css
.skeleton {
  --shimmer-color: oklch(90% 0.01 250);
  --shimmer-highlight: oklch(95% 0.005 250);

  background:
    linear-gradient(
      90deg,
      var(--shimmer-color) 25%,
      var(--shimmer-highlight) 50%,
      var(--shimmer-color) 75%
    );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text { height: 1lh; margin-bottom: 0.5lh; }
.skeleton-title { height: 1.5lh; width: 60%; }
.skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }
```

---

## 36. How do you handle CSS architecture for a multi-brand, white-label product?

```
tokens/
  brand-a.css      → --ds-color-primary: oklch(55% 0.2 250);
  brand-b.css      → --ds-color-primary: oklch(55% 0.2 150);
  shared.css       → --ds-radius-md: 8px; --ds-space-4: 16px;
components/
  button.css       → uses only --ds-* tokens, never raw values
  card.css
layouts/
  page.css
```

```css
/* Build-time: select brand token file */
@import url("tokens/shared.css") layer(tokens);
@import url("tokens/brand-a.css") layer(tokens);

@layer tokens, base, components, utilities;
```

Alternatively, runtime switching:

```html
<link rel="stylesheet" href="tokens/brand-a.css" id="brand-tokens" />
```

```javascript
document.getElementById('brand-tokens').href = `tokens/${brandId}.css`;
```

Components never reference brand-specific values directly. The token file is the only thing that changes between brands.

---

## 37. How do you implement a CSS-only accordion?

```css
.accordion details {
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

.accordion summary {
  padding: 16px;
  cursor: pointer;
  font-weight: 600;
  list-style: none;
}

.accordion summary::marker { content: ""; }
.accordion summary::after {
  content: "+";
  float: right;
  transition: transform 0.2s;
}

.accordion details[open] summary::after {
  content: "−";
}

.accordion details > div {
  padding: 0 16px 16px;
}
```

Using the native `<details>`/`<summary>` elements provides accessibility out of the box (keyboard navigable, screen reader compatible, proper ARIA semantics).

---

## 38. How do you use CSS Grid for a dashboard layout with resizable panels?

```css
.dashboard {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 3fr minmax(200px, 1fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header  header"
    "sidebar main    aside"
    "footer  footer  footer";
  min-height: 100vh;
}

.dashboard-header  { grid-area: header; }
.dashboard-sidebar { grid-area: sidebar; resize: horizontal; overflow: auto; }
.dashboard-main    { grid-area: main; overflow: auto; }
.dashboard-aside   { grid-area: aside; }
.dashboard-footer  { grid-area: footer; }

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "footer";
  }
  .dashboard-sidebar,
  .dashboard-aside { display: none; }
}
```

---

## 39. How do you prevent FOUC (Flash of Unstyled Content)?

FOUC occurs when HTML renders before CSS is applied. Prevention strategies:

1. **Place `<link rel="stylesheet">` in `<head>`** — ensures CSS blocks rendering.
2. **Inline critical CSS** — styles for above-the-fold content are available immediately.
3. **Avoid `@import` in CSS** — it creates sequential loading.
4. **Preload critical CSS files** — `<link rel="preload" as="style">`.
5. **Minimize CSS file size** — smaller files parse faster.
6. **Use `font-display: swap/optional`** — prevents flash of invisible text.
7. **Server-side rendering** — deliver fully styled HTML.

For JavaScript-rendered apps, a common pattern is:
```css
.app-loading { opacity: 0; }
.app-loaded { opacity: 1; transition: opacity 0.3s; }
```

---

## 40. How do you build accessible focus management with CSS?

```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--focus-color, #3498db);
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Skip-to-content link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 9999;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
}
.skip-link:focus {
  top: 8px;
}

/* Focus trapping visual indicator */
[data-focus-trap="active"] {
  box-shadow: inset 0 0 0 3px var(--focus-color);
}

/* High contrast mode support */
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid Highlight;
  }
}
```

---

## 41. How do you manage CSS for a component library distributed as a package?

```
dist/
  styles.css            → full bundled CSS
  styles.min.css
  tokens.css            → design tokens only
  components/
    button.css          → individual component CSS
    card.css
    modal.css
  layers.css            → @layer ordering declaration
```

```css
/* layers.css — consumers import this first */
@layer lib-reset, lib-tokens, lib-components;
```

```css
/* components/button.css */
@layer lib-components {
  .lib-btn {
    padding: var(--lib-space-2) var(--lib-space-4);
    border-radius: var(--lib-radius-md);
    background: var(--lib-color-primary);
    color: var(--lib-color-on-primary);
  }
}
```

Consumers can:
1. Import the full bundle for convenience.
2. Import individual components for tree-shaking.
3. Override tokens by redefining variables after import.
4. Override styles by placing their rules in a layer after `lib-components`.

---

## 42. How do you test CSS? What strategies and tools exist?

1. **Visual regression testing** — Chromatic, Percy, BackstopJS capture screenshots and diff them against baselines. Catches unintended visual changes.

2. **Unit testing CSS logic** — Test custom properties and `calc()` computations with `getComputedStyle()`:
```javascript
test('primary color is blue', () => {
  const style = getComputedStyle(document.documentElement);
  expect(style.getPropertyValue('--color-primary').trim()).toBe('#3498db');
});
```

3. **Accessibility testing** — axe-core, pa11y for color contrast, focus indicators.

4. **Performance testing** — Lighthouse CSS audits, CSS coverage analysis.

5. **Linting** — Stylelint with rules for specificity limits, naming conventions, property order, and disallowed patterns.

6. **Snapshot testing** — CSS Modules class name snapshots ensure stable generated names.

---

## 43. How do you handle CSS code splitting for a multi-page application?

**Route-based splitting:**
```
styles/
  critical.css         → inline in <head> for all pages
  global.css           → loaded on all pages
  pages/
    home.css           → loaded only on home route
    dashboard.css      → loaded only on dashboard route
    settings.css       → loaded only on settings route
  components/
    modal.css          → loaded when modal is first opened
```

**Implementation:**
```html
<!-- All pages -->
<style>/* critical.css inlined */</style>
<link rel="stylesheet" href="global.css" />

<!-- Page-specific, loaded by router -->
<link rel="stylesheet" href="pages/dashboard.css" />
```

**Framework integration (React/Next.js):**
- CSS Modules — imported per component, tree-shaken automatically.
- `next/dynamic` with `import()` — code-splits both JS and CSS.
- `@loadable/component` — lazy-loads CSS alongside components.

---

## 44. What is the `@position-try` at-rule?

`@position-try` defines named fallback positions for anchor-positioned elements:

```css
@position-try --above {
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% -8px;
}

@position-try --right {
  left: anchor(right);
  top: anchor(center);
  translate: 8px -50%;
}

.tooltip {
  position: fixed;
  position-anchor: --trigger;
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 8px;
  position-try-fallbacks: --above, --right;
}
```

The browser tries the primary position first, then each fallback in order, using the first position that fits within the viewport.

---

## 45. How do you implement a CSS-only dark/light mode that respects system preference and user choice?

```css
:root {
  color-scheme: light dark;

  /* Default: follow system preference */
  --bg: light-dark(#ffffff, #0a0a0a);
  --text: light-dark(#1a1a1a, #e5e5e5);
  --surface: light-dark(#f5f5f5, #1a1a1a);
}

/* User explicitly chose light */
:root[data-theme="light"] {
  color-scheme: light;
  --bg: #ffffff;
  --text: #1a1a1a;
  --surface: #f5f5f5;
}

/* User explicitly chose dark */
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0a0a0a;
  --text: #e5e5e5;
  --surface: #1a1a1a;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

JavaScript stores the preference in `localStorage` and sets `data-theme` on the root element. Without `data-theme`, the system preference controls via `light-dark()`.

---

## 46. How do you handle CSS for email clients?

Email CSS is severely limited. Key constraints and strategies:

```css
/* Inline styles are required for most email clients */
<td style="padding: 16px; font-family: Arial, sans-serif; font-size: 16px; color: #333333;">

/* Table-based layout is the only reliable approach */
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">

/* Embedded <style> in <head> for clients that support it */
<style>
  @media screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .column { display: block !important; width: 100% !important; }
  }
</style>
```

**Rules:**
- Use tables for layout. Flexbox/Grid are not supported.
- Inline all critical styles. Many clients strip `<style>` tags.
- Avoid shorthand properties (some clients do not parse them).
- Use `px` units, not `rem`/`em`.
- Test with Litmus or Email on Acid.
- Use tools like MJML or Maizzle to write modern syntax and compile to email-safe HTML.

---

## 47. How do you implement a type scale system?

```css
:root {
  --type-scale: 1.25;  /* major third */
  --type-base: 1rem;

  --type-xs: calc(var(--type-base) / var(--type-scale));
  --type-sm: var(--type-base);
  --type-md: calc(var(--type-base) * var(--type-scale));
  --type-lg: calc(var(--type-base) * var(--type-scale) * var(--type-scale));
  --type-xl: calc(var(--type-base) * var(--type-scale) * var(--type-scale) * var(--type-scale));
  --type-2xl: calc(var(--type-base) * var(--type-scale) * var(--type-scale) * var(--type-scale) * var(--type-scale));
}

/* Fluid variant */
h1 { font-size: clamp(var(--type-xl), 3vw + 1rem, var(--type-2xl)); }
h2 { font-size: clamp(var(--type-lg), 2vw + 0.75rem, var(--type-xl)); }
body { font-size: clamp(var(--type-sm), 0.5vw + 0.875rem, var(--type-md)); }
```

Changing `--type-scale` or `--type-base` scales the entire typographic hierarchy proportionally.

---

## 48. What is the `color-gamut` media feature?

`color-gamut` detects the display's color capabilities:

```css
@media (color-gamut: p3) {
  :root {
    --primary: color(display-p3 0.2 0.5 1);
    --accent: color(display-p3 1 0.3 0.2);
  }
}

@media (color-gamut: srgb) {
  :root {
    --primary: #3380ff;
    --accent: #ff4d33;
  }
}
```

This allows serving wider-gamut colors to capable displays while providing sRGB fallbacks for standard displays.

---

## 49. How do you create a CSS-only masonry layout?

True CSS masonry is proposed but not yet standardized. Current approaches:

**Multi-column (simplest, but column-order is top-to-bottom):**
```css
.masonry {
  column-count: 3;
  column-gap: 16px;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
}
```

**Grid with dense packing (approximate):**
```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;
  gap: 0 16px;
}
.masonry-item {
  grid-row: span var(--span);  /* set via JS based on content height */
}
```

**Proposed CSS Masonry (future):**
```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: masonry;
  gap: 16px;
}
```

---

## 50. How do you handle CSS for high-DPI (Retina) displays?

```css
/* Serve 2x images to high-DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .logo {
    background-image: url("logo@2x.png");
    background-size: 200px 50px;
  }
}

/* Better approach: use responsive images in HTML */
/* <img srcset="logo.png 1x, logo@2x.png 2x" /> */

/* SVGs are resolution-independent */
.icon { background: url("icon.svg"); }

/* Fine borders on high-DPI */
.divider {
  border-bottom: 0.5px solid #ddd; /* renders as true 1 physical pixel on 2x */
}
```

Best practices: Use SVGs for icons and logos. Use `srcset` for raster images. Use CSS `border-width: 0.5px` for hairline borders on retina displays.

---

## 51. How do you implement container query units?

Container query units are relative to the queried container's size:

| Unit | Meaning |
|------|---------|
| `cqw` | 1% of container's width |
| `cqh` | 1% of container's height |
| `cqi` | 1% of container's inline size |
| `cqb` | 1% of container's block size |
| `cqmin` | smaller of `cqi`/`cqb` |
| `cqmax` | larger of `cqi`/`cqb` |

```css
.card-wrapper {
  container-type: inline-size;
}

.card-title {
  font-size: clamp(1rem, 4cqi, 2rem);
}
.card-image {
  height: 50cqi;
}
```

These units allow truly component-relative sizing, not just viewport-relative.

---

## 52. How does `@layer` ordering work with `@import`?

Layer ordering is determined by the first complete `@layer` declaration:

```css
/* This sets the layer order */
@layer reset, tokens, base, components, utilities;

/* These can be in any file order */
@import url("utilities.css") layer(utilities);
@import url("reset.css") layer(reset);
@import url("components.css") layer(components);
```

Even though `utilities.css` is imported first, it is in the `utilities` layer, which comes last in the declared order. The explicit ordering declaration takes precedence over import order.

---

## 53. How do you implement CSS-based responsive data tables?

```css
/* Desktop: standard table */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

/* Mobile: stack cells vertically */
@media (max-width: 768px) {
  .data-table thead { display: none; }
  .data-table tr {
    display: block;
    margin-bottom: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px;
  }
  .data-table td {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  .data-table td::before {
    content: attr(data-label);
    font-weight: bold;
    flex: 0 0 40%;
  }
  .data-table td:last-child { border-bottom: none; }
}
```

This stacks table cells vertically on mobile, using `data-label` attributes to show column headers inline.

---

## 54. How do you handle CSS in a monorepo with multiple applications sharing a design system?

```
packages/
  design-tokens/
    tokens.css          → CSS custom properties
    package.json
  ui-components/
    src/
      button/
        button.module.css
        button.tsx
    package.json
apps/
  web-app/
    styles/
      app.css           → @import '@company/design-tokens/tokens.css';
  mobile-web/
    styles/
      app.css           → @import '@company/design-tokens/tokens.css';
```

Key decisions:
- **Tokens package** — published separately, consumed by all apps and component library.
- **Component CSS** — co-located with components using CSS Modules. Bundled per-component.
- **Layer ordering** — each consuming app declares `@layer` order to control precedence.
- **Versioning** — tokens follow semantic versioning; breaking changes (renamed variables) require major bump.
- **Build** — each app bundles only the components it uses (tree-shaking at the CSS level).

---

## 55. What is the `@media (dynamic-range: high)` feature?

`dynamic-range: high` detects HDR-capable displays:

```css
@media (dynamic-range: high) {
  .hero-image {
    filter: brightness(1.2) contrast(1.1);
  }
  .video-player {
    color-gamut: rec2020;
  }
}
```

This allows serving enhanced visual content to displays that can render it, while providing standard visuals to SDR displays.

---

## 56. How do you implement a modular z-index system?

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-drawer: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-toast: 800;
  --z-dev-tools: 9999;
}

/* Components use tokens */
.dropdown { z-index: var(--z-dropdown); }
.modal-backdrop { z-index: var(--z-modal-backdrop); }
.modal { z-index: var(--z-modal); }

/* Isolate components to prevent z-index leaking */
.card { isolation: isolate; }
```

Using `isolation: isolate` on components creates stacking contexts, ensuring internal `z-index` values do not compete with the page-level stack.

---

## 57. How do you implement CSS for a design system that supports multiple density modes?

```css
:root {
  --density: 1;
  --space-unit: calc(4px * var(--density));
}

[data-density="compact"] { --density: 0.75; }
[data-density="comfortable"] { --density: 1; }
[data-density="spacious"] { --density: 1.5; }

.btn {
  padding: calc(var(--space-unit) * 2) calc(var(--space-unit) * 4);
  font-size: calc(14px * var(--density));
  gap: var(--space-unit);
}

.table td {
  padding: calc(var(--space-unit) * 2) calc(var(--space-unit) * 3);
}

@media (pointer: coarse) {
  :root { --density: 1.25; }
}
```

---

## 58. How do you use CSS `revert` and `revert-layer`?

`revert` rolls back a property to the user-agent stylesheet value (or user stylesheet if present):

```css
.unstyled-list {
  all: revert; /* restore browser defaults */
}
```

`revert-layer` rolls back to the value from the previous cascade layer:

```css
@layer base, components;

@layer components {
  .btn {
    background: revert-layer; /* use the value from @layer base */
  }
}
```

`revert-layer` is powerful for selective opt-outs within a layered architecture without using `unset` or `initial`.

---

## 59. How do you handle CSS for internationalization beyond RTL?

Beyond RTL (logical properties), internationalization requires:

**Line height for CJK:**
```css
:lang(zh), :lang(ja), :lang(ko) {
  line-height: 1.8;
}
```

**Text spacing:**
```css
:lang(ja) { text-spacing-trim: space-all; }
```

**Font stacks per script:**
```css
:lang(ja) { font-family: "Noto Sans JP", "Hiragino Sans", sans-serif; }
:lang(ar) { font-family: "Noto Sans Arabic", "Segoe UI", sans-serif; }
:lang(hi) { font-family: "Noto Sans Devanagari", sans-serif; }
```

**Vertical writing:**
```css
.vertical-jp {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

**Word break for CJK:**
```css
:lang(zh), :lang(ja) {
  word-break: break-all;
  overflow-wrap: break-word;
}
```

---

## 60. What is the `reading-flow` property?

`reading-flow` controls the order in which elements are navigated (tabbed through) in a grid or flex container, independent of DOM order:

```css
.grid {
  display: grid;
  reading-flow: grid-rows;  /* tab in visual row order */
}
```

Values: `normal` (DOM order), `grid-rows`, `grid-columns`, `grid-order`, `flex-visual`, `flex-flow`. This solves the accessibility problem where CSS `order` changes visual layout but keyboard navigation follows DOM order.

---

## 61. How do you implement motion-safe animations with progressive enhancement?

```css
/* Base: no motion */
.card {
  opacity: 1;
  transform: none;
}

/* Enhanced: add motion only if user allows it */
@media (prefers-reduced-motion: no-preference) {
  .card {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .card.visible {
    opacity: 1;
    transform: none;
  }
}

/* Reduced motion: instant state changes */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
```

The key insight: start with the final state (no motion) and layer animations as enhancement. This is the opposite of the common pattern where animations are added by default and reduced-motion removes them.

---

## 62. How do you implement a CSS Grid-based holy grail layout with sticky elements?

```css
.page {
  display: grid;
  grid-template:
    "header header header" auto
    "nav    main   aside"  1fr
    "footer footer footer" auto
    / minmax(200px, 1fr) minmax(0, 3fr) minmax(200px, 1fr);
  min-height: 100dvh;
}

.header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.nav {
  grid-area: nav;
  position: sticky;
  top: 64px;
  align-self: start;
  max-height: calc(100dvh - 64px);
  overflow-y: auto;
}

.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

@media (max-width: 768px) {
  .page {
    grid-template:
      "header" auto
      "main"   1fr
      "footer" auto
      / 1fr;
  }
  .nav, .aside { display: none; }
}
```

---

## 63. How do you handle CSS specificity in a utility-first framework like Tailwind?

Tailwind uses `@layer utilities` to place utility classes in the utilities cascade layer. This means:

1. Component styles in an earlier layer are overridden by utilities.
2. If you need to override a utility, use another utility or place your override in an unlayered context.
3. Tailwind's `@apply` directive compiles utilities into the component layer at build time.

```css
@layer base {
  h1 { font-size: 2rem; }
}

@layer components {
  .btn { @apply px-4 py-2 rounded; }
}

@layer utilities {
  /* Tailwind utilities are auto-generated here */
}
```

For custom components that need to compete with utilities, place them in the `components` layer. For overrides that must win, keep them unlayered.

---

## 64. What is the `@starting-style` at-rule, and how does it enable entry animations?

`@starting-style` defines the initial property values when an element first appears:

```css
.modal {
  display: block;
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.3s, transform 0.3s, display 0.3s allow-discrete;
}

@starting-style {
  .modal {
    opacity: 0;
    transform: scale(0.95);
  }
}

.modal.closing {
  opacity: 0;
  transform: scale(0.95);
  display: none;
}
```

Before `@starting-style`, CSS transitions required the initial state to exist before the element appeared. `@starting-style` provides that initial state declaratively, enabling full entry/exit animations with pure CSS.

---

## 65. How do you implement a responsive navigation pattern with CSS-only?

```css
.nav-toggle { display: none; }

.nav-links {
  display: flex;
  gap: 16px;
  list-style: none;
}

@media (max-width: 768px) {
  .nav-toggle { display: block; }

  .nav-links {
    position: fixed;
    inset: 0;
    flex-direction: column;
    background: var(--bg);
    padding: 80px 24px 24px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .nav-toggle:checked ~ .nav-links {
    transform: translateX(0);
  }

  /* Overlay */
  .nav-toggle:checked ~ .nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }
}
```

The hidden checkbox pattern toggles the mobile menu without JavaScript.

---

## 66. How do you handle CSS for print media in a complex web application?

```css
@media print {
  /* Hide non-essential UI */
  nav, footer, .sidebar, .toolbar, .toast, [role="dialog"],
  button:not(.print-btn), .no-print {
    display: none !important;
  }

  /* Reset to print-friendly styles */
  body {
    font: 12pt/1.5 Georgia, "Times New Roman", serif;
    color: #000;
    background: #fff;
  }

  /* Show URLs for links */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #555;
  }

  /* Page breaks */
  h1, h2, h3 { break-after: avoid; }
  table, figure { break-inside: avoid; }
  .chapter { break-before: page; }

  /* Expand collapsed content */
  details { open: true; }
  .accordion-content { display: block !important; max-height: none !important; }

  /* Page margins */
  @page { margin: 2cm; }
  @page :first { margin-top: 4cm; }
}
```

---

## 67. How do you approach CSS migration from a legacy codebase to a modern architecture?

**Phase 1: Audit**
- Run CSS coverage analysis (Chrome DevTools).
- Inventory selectors, specificity distribution, and file sizes.
- Identify unused CSS, `!important` usage, and specificity conflicts.

**Phase 2: Containment**
- Wrap legacy CSS in a low-priority layer: `@layer legacy { @import "old-styles.css"; }`.
- New code goes in higher-priority layers: `@layer legacy, modern;`.
- Legacy styles are automatically overridden by modern styles without touching old files.

**Phase 3: Incremental migration**
- Replace components one at a time.
- Use CSS Modules or `@scope` for new components.
- Introduce design tokens (custom properties) and replace hardcoded values.

**Phase 4: Cleanup**
- Remove unused legacy rules (PurgeCSS, UnCSS).
- Eventually remove the legacy layer entirely.

```css
/* Migration bridge */
@layer legacy, tokens, base, components, utilities;

@layer legacy {
  @import url("legacy/all.css");
}

@layer components {
  /* New components automatically win over legacy */
  .card { padding: var(--space-4); }
}
```

---

## 68. How do you handle dynamic viewport units (`dvh`, `svh`, `lvh`)?

Mobile browsers have dynamic toolbars that change the viewport height. Traditional `vh` is ambiguous:

| Unit | Meaning |
|------|---------|
| `vh` | Varies by browser (often = `lvh`) |
| `svh` | Small viewport height (toolbar visible) |
| `lvh` | Large viewport height (toolbar hidden) |
| `dvh` | Dynamic viewport height (updates as toolbar animates) |

```css
.hero {
  min-height: 100dvh;     /* adapts to toolbar state */
}

.fixed-overlay {
  height: 100svh;          /* conservative: always fits */
}

.full-page {
  min-height: 100lvh;     /* assumes maximum space */
}
```

Use `dvh` for elements that should fill the visible area. Use `svh` for elements that must always be fully visible. Use `lvh` only when you want maximum height regardless of toolbar.

---

## 69. How do you implement a CSS custom scrollbar?

```css
/* Webkit/Blink browsers */
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: var(--surface);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}

/* Standard (Firefox, future) */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--text-muted) var(--surface);
}
```

The standard `scrollbar-width` and `scrollbar-color` properties work in Firefox. WebKit browsers use the `::webkit-scrollbar` pseudo-elements for more control.

---

## 70. What is the `@media (prefers-reduced-transparency)` feature?

```css
@media (prefers-reduced-transparency: reduce) {
  .glass-panel {
    background: var(--surface); /* solid instead of transparent */
    backdrop-filter: none;
  }
  .overlay {
    background: var(--bg); /* opaque instead of semi-transparent */
  }
}
```

This respects the user's OS-level transparency preference, important for users with visual impairments who find transparency distracting or hard to read through.

---

## 71. How do you implement CSS custom media queries?

```css
@custom-media --tablet (min-width: 768px);
@custom-media --desktop (min-width: 1024px);
@custom-media --dark (prefers-color-scheme: dark);
@custom-media --motion-ok (prefers-reduced-motion: no-preference);

@media (--tablet) {
  .container { max-width: 720px; }
}

@media (--desktop) and (--motion-ok) {
  .hero { animation: fadeIn 1s ease; }
}
```

Custom media queries reduce repetition and centralize breakpoint definitions. Currently requires a PostCSS plugin for browser support.

---

## 72. How do you handle CSS for server-side rendered (SSR) applications?

SSR sends fully styled HTML to the client. CSS considerations:

1. **Critical CSS extraction** — tools like `critters` extract CSS needed for the initial HTML and inline it.
2. **No FOUC** — since HTML arrives with styles, there is no flash.
3. **Hydration mismatch** — CSS-in-JS solutions must generate the same class names on server and client.
4. **Streaming** — CSS must be available before the HTML it styles. With React 18+ streaming SSR, inline CSS into each streamed chunk.
5. **CSS Modules** — work seamlessly with SSR because class names are deterministic.

```javascript
// Next.js automatically handles CSS for SSR
import styles from './component.module.css';
```

---

## 73. How do you use CSS `@media` queries for accessibility?

```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) { }

/* Respect contrast preferences */
@media (prefers-contrast: more) { }
@media (prefers-contrast: less) { }

/* Respect color scheme */
@media (prefers-color-scheme: dark) { }

/* Respect transparency preferences */
@media (prefers-reduced-transparency: reduce) { }

/* High contrast / forced colors mode */
@media (forced-colors: active) { }

/* Detect scripting support */
@media (scripting: none) { }

/* Input device capabilities */
@media (hover: none) { }
@media (pointer: coarse) { }
```

A comprehensive accessible stylesheet addresses all of these, ensuring the UI adapts to user preferences and capabilities.

---

## 74. How do you implement a responsive image strategy with CSS?

```css
/* Fluid images (base) */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Aspect ratio preservation */
img {
  aspect-ratio: attr(width) / attr(height);
}

/* Art direction with <picture> (HTML) + CSS */
.hero-image {
  width: 100%;
  object-fit: cover;
  object-position: center 30%;
}

/* Background images responsive to pixel density */
.banner {
  background-image: url("banner-1x.webp");
  background-image: image-set(
    url("banner-1x.webp") 1x,
    url("banner-2x.webp") 2x
  );
  background-size: cover;
}
```

---

## 75. What is the CSS `round()` function?

`round()` rounds a value to a specified interval:

```css
.grid-item {
  width: round(nearest, 100%, 50px);
  /* rounds width to nearest multiple of 50px */
}

.spacing {
  gap: round(up, 1.3rem, 4px);
  /* rounds up to nearest multiple of 4px */
}
```

Rounding modes: `nearest`, `up`, `down`, `to-zero`. This enables pixel-perfect alignment in fluid layouts.

---

## 76. How do you handle CSS for progressive web apps (PWAs)?

PWA-specific CSS considerations:

```css
/* Standalone mode detection */
@media (display-mode: standalone) {
  .install-prompt { display: none; }
  .app-header { padding-top: env(safe-area-inset-top); }
}

/* Safe area insets for notched devices */
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* Offline indicator */
.offline-banner {
  display: none;
}
@media (prefers-color-scheme: dark) {
  .offline-banner { background: #332200; }
}

/* Touch-optimized tap targets */
@media (pointer: coarse) {
  button, a, input, select {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## 77. What is `CSS.supports()` in JavaScript?

`CSS.supports()` is the JavaScript counterpart of `@supports`:

```javascript
if (CSS.supports('display', 'grid')) {
  console.log('Grid is supported');
}

if (CSS.supports('(container-type: inline-size)')) {
  console.log('Container queries are supported');
}

if (CSS.supports('selector(:has(*))')) {
  console.log(':has() is supported');
}
```

Use it for JavaScript-side feature detection to conditionally load polyfills or alternative stylesheets.

---

## 78. How do you implement a responsive sidebar layout that collapses to an overlay on mobile?

```css
.layout {
  display: grid;
  grid-template-columns: auto 1fr;
}

.sidebar {
  width: 280px;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }

  .sidebar {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: var(--z-drawer);
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: calc(var(--z-drawer) - 1);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  .sidebar.open ~ .sidebar-backdrop {
    opacity: 1;
    pointer-events: auto;
  }
}
```

---

## 79. How do you handle CSS for complex form layouts?

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 24px 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group--full { grid-column: 1 / -1; }
.form-group--half { }

/* Validation states */
.form-group:has(input:user-invalid) label { color: var(--error); }
.form-group:has(input:user-valid) label { color: var(--success); }
.form-group:has(input:user-invalid)::after {
  content: attr(data-error);
  color: var(--error);
  font-size: 0.875rem;
}

/* Disabled state */
fieldset:disabled {
  opacity: 0.6;
  pointer-events: none;
}
```

---

## 80. How do you implement a CSS-only notification/toast system?

```css
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  z-index: var(--z-toast);
}

.toast {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  animation: toast-in 0.3s ease forwards, toast-out 0.3s ease 4s forwards;
  max-width: 400px;
}

@keyframes toast-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes toast-out {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

.toast--success { border-left: 4px solid var(--success); }
.toast--error { border-left: 4px solid var(--error); }
```

---

## 81. How do you handle CSS for an application with dynamic themes set by end users?

```css
:root {
  --user-hue: 220;
  --user-saturation: 80;
  --user-radius: 8;
  --user-density: 1;
}

:root {
  --primary: oklch(55% calc(var(--user-saturation) * 0.003) var(--user-hue));
  --primary-hover: oklch(45% calc(var(--user-saturation) * 0.003) var(--user-hue));
  --primary-light: oklch(95% calc(var(--user-saturation) * 0.001) var(--user-hue));
  --radius: calc(var(--user-radius) * 1px);
  --space-unit: calc(4px * var(--user-density));
}
```

JavaScript reads user preferences from an API and updates root custom properties. All components consume tokens, so the entire UI adapts instantly without CSS rebuilds or page reloads.

---

## 82. What is the `text-box-trim` and `text-box-edge` properties?

These properties remove the extra space above and below text caused by font metrics:

```css
h1 {
  text-box-trim: both;
  text-box-edge: cap alphabetic;
}
```

`text-box-trim: both` trims space from both the top and bottom of the text box. `text-box-edge` defines which font metric to use as the edge (cap height, ascender, etc.). This enables pixel-perfect vertical alignment of text in UI components.

---

## 83. How do you implement CSS for variable-width elements that snap to a grid?

```css
:root {
  --grid-unit: 8px;
}

.snapped {
  width: round(nearest, 100%, var(--grid-unit));
  padding: round(nearest, 1.3rem, var(--grid-unit));
  margin: round(nearest, clamp(8px, 2vw, 24px), var(--grid-unit));
}
```

The `round()` function ensures fluid values always land on grid-unit boundaries, maintaining visual consistency.

---

## 84. How do you build a performant infinite scroll list with CSS?

```css
.virtual-list {
  height: 100vh;
  overflow-y: auto;
  contain: strict;
}

.virtual-list-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 60px;
}

/* Scroll anchoring prevents jumps when items are recycled */
.virtual-list {
  overflow-anchor: auto;
}
```

CSS `content-visibility: auto` handles the rendering optimization. For true virtualization (removing DOM nodes), JavaScript is still needed, but CSS minimizes the rendering cost of visible elements.

---

## 85. What is `@font-feature-values`?

`@font-feature-values` creates named aliases for OpenType features:

```css
@font-feature-values "MyFont" {
  @styleset {
    elegant: 1;
    informal: 2;
  }
  @swash {
    fancy: 1;
  }
}

.elegant-text {
  font-family: "MyFont";
  font-variant-alternates: styleset(elegant);
}

.fancy-initial::first-letter {
  font-variant-alternates: swash(fancy);
}
```

This provides semantic names for numeric OpenType feature indices, improving CSS readability.

---

## 86. How do you handle CSS for iframes and cross-origin embedded content?

```css
/* Responsive iframe container */
.iframe-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
}

.iframe-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Loading state */
.iframe-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--surface);
  z-index: 1;
}
.iframe-wrapper.loaded::before {
  display: none;
}
```

Cross-origin styles cannot be injected into iframes. Communication happens via `postMessage`, potentially including theme tokens that the iframe's own CSS custom properties can consume.

---

## 87. How do you implement a CSS pipeline for a large team?

1. **Stylelint** — enforce naming conventions, specificity limits, property order, and disallowed patterns.
2. **PostCSS** — autoprefixer, custom media, nesting, minification.
3. **CSS Modules / Scoping** — prevent naming collisions.
4. **Design token generation** — Style Dictionary generates CSS variables from a single source.
5. **Visual regression tests** — Chromatic or Percy in CI.
6. **CSS coverage** — fail builds if coverage drops below threshold.
7. **Bundle size budgets** — alert when CSS exceeds target.
8. **Code review checklist** — accessibility (contrast, focus), performance (no layout animations), maintainability (token usage, no hardcoded values).

```json
{
  "stylelint": {
    "rules": {
      "selector-max-specificity": "0,3,0",
      "selector-class-pattern": "^[a-z][a-zA-Z0-9]*(__[a-z][a-zA-Z0-9]*)?(--[a-z][a-zA-Z0-9]*)?$",
      "declaration-no-important": true,
      "custom-property-pattern": "^ds-"
    }
  }
}
```

---

## 88. What is the `initial-letter` property?

`initial-letter` creates drop caps:

```css
.article p:first-of-type::first-letter {
  initial-letter: 3;  /* span 3 lines */
  font-weight: bold;
  margin-right: 8px;
  color: var(--primary);
}
```

The number specifies how many lines the initial letter should span. The browser handles sizing and alignment automatically.

---

## 89. How do you approach CSS for a design system that needs to support both web and React Native?

Since React Native uses a subset of CSS (no cascade, no pseudo-elements, limited selectors), the strategy is:

1. **Shared design tokens** — define tokens in a platform-agnostic format (JSON/YAML), generate CSS custom properties for web and JavaScript objects for React Native.

2. **Platform-specific implementations:**
```css
/* Web */
.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary);
}
```

```javascript
// React Native
const styles = StyleSheet.create({
  btn: {
    paddingVertical: tokens.space2,
    paddingHorizontal: tokens.space4,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorPrimary,
  },
});
```

3. **Token generation pipeline** — Style Dictionary converts one source to multiple outputs.

---

## 90. How do you handle CSS for complex animation choreography?

```css
.stagger-group > * {
  opacity: 0;
  transform: translateY(20px);
}

@media (prefers-reduced-motion: no-preference) {
  .stagger-group > * {
    animation: fadeInUp 0.5s ease forwards;
  }

  .stagger-group > *:nth-child(1) { animation-delay: 0ms; }
  .stagger-group > *:nth-child(2) { animation-delay: 100ms; }
  .stagger-group > *:nth-child(3) { animation-delay: 200ms; }
  .stagger-group > *:nth-child(4) { animation-delay: 300ms; }
  .stagger-group > *:nth-child(5) { animation-delay: 400ms; }
}

/* Dynamic stagger with custom properties */
.stagger-group > * {
  animation-delay: calc(var(--index, 0) * 80ms);
}
```

For complex sequences, use the Web Animations API or CSS scroll-driven animations rather than managing dozens of `@keyframes`.

---

## 91. What is `@media (inverted-colors)`?

```css
@media (inverted-colors: inverted) {
  img, video {
    filter: invert(1); /* re-invert media to show correctly */
  }
}
```

When a user has system-level color inversion enabled (an accessibility feature), images and videos appear negative. This media query detects that state and re-inverts media to display correctly.

---

## 92. How do you implement CSS for accessible modal dialogs?

```css
dialog {
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: min(90vw, 600px);
  max-height: 85dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Entry animation */
dialog[open] {
  opacity: 1;
  transform: translateY(0);
}
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: translateY(-20px);
  }
}
dialog {
  transition: opacity 0.3s, transform 0.3s, overlay 0.3s allow-discrete, display 0.3s allow-discrete;
}

/* Focus trap visual */
dialog:focus-visible {
  outline: none;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  dialog { transition: none; }
}
```

Using the native `<dialog>` element provides built-in focus trapping, escape key handling, and `::backdrop` styling.

---

## 93. How do you implement a CSS design system documentation page?

```css
/* Token showcase */
.color-swatch {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}
.swatch {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  display: grid;
  place-items: end start;
  padding: 8px;
  font-size: 0.75rem;
  font-family: monospace;
}
.swatch::after {
  content: attr(data-token);
}

/* Live component preview */
.preview {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  container-type: inline-size;
}

/* Code block with copy */
.code-block {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-md);
  overflow: auto;
  font-family: "Fira Code", monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  padding: var(--space-4);
  tab-size: 2;
}
```

---

## 94. What are CSS registered custom properties, and how do they enable type-safe theming?

`@property` registration enforces types at the browser level:

```css
@property --color-primary {
  syntax: "<color>";
  initial-value: #3498db;
  inherits: true;
}

@property --spacing-base {
  syntax: "<length>";
  initial-value: 16px;
  inherits: true;
}

@property --radius-md {
  syntax: "<length>";
  initial-value: 8px;
  inherits: false;
}
```

If a theme file sets `--color-primary: not-a-color`, the browser ignores it and falls back to the initial value. This provides runtime type safety for design tokens — something not possible with unregistered custom properties.

---

## 95. How do you implement CSS for accessible data visualizations?

```css
/* Bar chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
}

.bar {
  flex: 1;
  background: var(--primary);
  transition: height 0.3s ease;
  position: relative;
  min-width: 20px;
}

/* Pattern fill for color-blind accessibility */
@media (prefers-contrast: more), (forced-colors: active) {
  .bar:nth-child(odd) {
    background: repeating-linear-gradient(
      45deg, currentColor, currentColor 2px, transparent 2px, transparent 6px
    );
  }
  .bar:nth-child(even) {
    background: repeating-linear-gradient(
      -45deg, currentColor, currentColor 2px, transparent 2px, transparent 6px
    );
  }
}

/* Value labels */
.bar::after {
  content: attr(data-value);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  padding: 2px 4px;
}
```

---

## 96. How do you handle CSS for complex text formatting (code editors, rich text)?

```css
.code-editor {
  font-family: "Fira Code", "JetBrains Mono", monospace;
  font-variant-ligatures: contextual;
  font-feature-settings: "calt" 1;
  tab-size: 2;
  white-space: pre;
  overflow-x: auto;
  line-height: 1.6;
  caret-color: var(--accent);
}

/* Line numbers */
.code-line {
  display: flex;
  counter-increment: line;
}
.code-line::before {
  content: counter(line);
  display: inline-block;
  width: 4ch;
  text-align: right;
  margin-right: 1ch;
  color: var(--text-muted);
  user-select: none;
}

/* Syntax highlighting tokens */
.token-keyword { color: oklch(55% 0.2 300); }
.token-string { color: oklch(55% 0.15 150); }
.token-comment { color: oklch(60% 0.05 250); font-style: italic; }
.token-number { color: oklch(55% 0.15 80); }
```

---

## 97. How do you implement a CSS strategy for micro-animations and interaction feedback?

```css
/* Interaction feedback system */
:root {
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

/* Button press */
.btn {
  transition: transform var(--duration-instant) ease,
              background var(--duration-fast) ease;
}
.btn:active {
  transform: scale(0.97);
}

/* Ripple effect */
.ripple {
  position: relative;
  overflow: hidden;
}
.ripple::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10%);
  background-size: 1000% 1000%;
  background-position: center;
  opacity: 0;
  transition: background-size var(--duration-normal) var(--ease-out),
              opacity var(--duration-slow);
}
.ripple:active::after {
  background-size: 0% 0%;
  opacity: 1;
  transition: 0s;
}

/* Loading spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .btn { transition: none; }
  .btn:active { transform: none; }
  .ripple::after { display: none; }
  .spinner { animation-duration: 1.5s; }
}
```

---

## 98. How do you debug a complex stacking context issue?

**Process:**

1. **Identify the problem** — An element with a high `z-index` is hidden behind another element.

2. **Map the stacking tree** — Use Chrome DevTools Layers panel or the "3D View" extension to visualize layers.

3. **Find stacking context boundaries** — Any of these create a new stacking context:
   - `position` + `z-index`
   - `opacity < 1`
   - `transform`, `filter`, `perspective`, `backdrop-filter`, `clip-path`
   - `isolation: isolate`
   - `contain: paint/layout`
   - `will-change` with paint/composite properties
   - Flex/grid children with `z-index`

4. **Resolution** — `z-index` only competes within the same stacking context. If two elements are in different stacking contexts, you must adjust the stacking context ancestors, not the elements themselves.

5. **Prevention** — Use `isolation: isolate` on component roots. Maintain a centralized z-index scale. Audit stacking contexts in code reviews.

---

## 99. How do you implement a complete CSS animation system for a design system?

```css
/* Motion tokens */
:root {
  --motion-duration-1: 100ms;
  --motion-duration-2: 200ms;
  --motion-duration-3: 300ms;
  --motion-duration-4: 500ms;

  --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion-ease-decelerate: cubic-bezier(0, 0, 0, 1);
  --motion-ease-accelerate: cubic-bezier(0.3, 0, 1, 1);
  --motion-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Reusable animation mixins via custom properties */
.animate-fade-in {
  animation: ds-fade-in var(--motion-duration-3) var(--motion-ease-decelerate) forwards;
}
.animate-slide-up {
  animation: ds-slide-up var(--motion-duration-3) var(--motion-ease-standard) forwards;
}
.animate-scale-in {
  animation: ds-scale-in var(--motion-duration-2) var(--motion-ease-spring) forwards;
}

@keyframes ds-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ds-slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ds-scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Stagger utility */
.stagger > * {
  animation-delay: calc(var(--stagger-index, 0) * var(--stagger-interval, 50ms));
}

/* Reduced motion: instant transitions */
@media (prefers-reduced-motion: reduce) {
  [class*="animate-"] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

---

## 100. What does the future of CSS look like, and how should a senior engineer prepare?

**Actively shipping or nearing universal support:**
- Container queries and container query units (`cqi`, `cqb`)
- CSS nesting (native)
- `:has()` selector
- `@layer` cascade layers
- View Transitions API
- Scroll-driven animations (`animation-timeline: scroll()`)
- `@property` registered custom properties
- `@starting-style` for entry animations
- `transition-behavior: allow-discrete` for transitioning `display`
- `text-wrap: balance` / `pretty`
- `oklch` / `oklab` color spaces

**Emerging (shipping in some browsers):**
- CSS anchor positioning
- `@scope`
- `@custom-media`
- `text-box-trim`
- `interpolate-size: allow-keywords`
- `reading-flow`
- `field-sizing: content`

**In specification development:**
- CSS masonry layout (in Grid)
- CSS Mixins (`@mixin` / `@apply`)
- CSS functions (`@function`)
- Cross-document view transitions
- CSS toggles

**How to prepare:**
1. Master the cascade — `@layer`, specificity, `!important` inversion.
2. Think in components — container queries, `@scope`, CSS Modules.
3. Build accessible — respect all `prefers-*` media features.
4. Optimize performance — containment, `content-visibility`, compositor-friendly animations.
5. Design with tokens — custom properties, `@property`, themeable architectures.
6. Stay current — follow CSS Working Group drafts, browser release notes, and `caniuse.com`.

The trend is clear: CSS is becoming a complete, powerful styling language that reduces dependency on JavaScript for layout, responsiveness, theming, and animation. Senior engineers who invest in deep CSS knowledge will build faster, more accessible, and more maintainable applications.

---
