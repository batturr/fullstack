# CSS & CSS3 Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

---

## 1. What is CSS, and why is it used?

CSS (Cascading Style Sheets) is a stylesheet language that controls the visual presentation of HTML documents. It separates content (HTML) from presentation (colors, fonts, layout, spacing), making code easier to maintain and enabling a single stylesheet to govern the look of an entire site. Without CSS, every visual tweak would require inline attributes on HTML elements, leading to bloated, hard-to-manage markup. CSS also enables responsive design, animations, and print-specific styles, making it indispensable in modern web development.

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}
```

---

## 2. What are the three ways to apply CSS to an HTML document?

There are three methods:

**Inline CSS** — applied directly on an element via the `style` attribute. It has the highest specificity but is hard to maintain.

```html
<p style="color: red;">Red text</p>
```

**Internal (Embedded) CSS** — placed inside a `<style>` tag in the `<head>`. Useful for single-page styles but does not scale across multiple pages.

```html
<head>
  <style>
    p { color: blue; }
  </style>
</head>
```

**External CSS** — written in a separate `.css` file and linked via `<link>`. This is the preferred method because it promotes reusability, caching, and separation of concerns.

```html
<link rel="stylesheet" href="styles.css" />
```

---

## 3. What is the CSS box model?

The box model is the foundation of CSS layout. Every element is rendered as a rectangular box consisting of four areas from inside out:

1. **Content** — the actual text, image, or child elements.
2. **Padding** — transparent space between the content and the border.
3. **Border** — a line surrounding the padding.
4. **Margin** — transparent space outside the border separating the element from neighbors.

By default (`box-sizing: content-box`), the `width` and `height` properties apply only to the content area. Padding and border are added on top, which can make sizing unpredictable. Switching to `box-sizing: border-box` makes `width` and `height` include padding and border, which is far more intuitive and is considered best practice.

```css
.card {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 2px solid #ccc;
  margin: 10px;
}
```

---

## 4. What is `box-sizing: border-box`, and why should you use it?

By default, CSS uses `content-box`, meaning `width: 300px` sets only the content width; padding and border are added on top, making the total rendered width larger than 300px. With `border-box`, the specified width includes padding and border, so the element never exceeds the declared size. This simplifies layouts enormously, especially in responsive grids. A common reset is to apply it globally:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

## 5. What is the difference between a class selector and an ID selector?

A **class selector** (`.classname`) can be applied to multiple elements and is the workhorse of CSS styling. An **ID selector** (`#idname`) must be unique within a page and carries much higher specificity (0,1,0,0 vs 0,0,1,0), making it harder to override later. Best practice is to use classes for styling and reserve IDs for JavaScript hooks or fragment links.

```css
.btn { background: blue; }   /* reusable */
#hero { height: 100vh; }      /* unique section */
```

---

## 6. What does "cascading" mean in CSS?

"Cascading" refers to the algorithm that determines which rule wins when multiple declarations target the same property on the same element. The cascade considers three factors in order:

1. **Origin and importance** — User-agent styles < author styles < `!important` author styles < `!important` user styles.
2. **Specificity** — More specific selectors win (ID > class > element).
3. **Source order** — When specificity is equal, the last rule declared wins.

Understanding the cascade prevents "specificity wars" and overuse of `!important`.

---

## 7. What is CSS specificity, and how is it calculated?

Specificity is a weight assigned to a selector that determines which conflicting rule applies. It is expressed as a tuple (a, b, c, d):

| Component | Adds | Example |
|-----------|------|---------|
| Inline style | 1,0,0,0 | `style="..."` |
| ID | 0,1,0,0 | `#nav` |
| Class / attribute / pseudo-class | 0,0,1,0 | `.active`, `[type]`, `:hover` |
| Element / pseudo-element | 0,0,0,1 | `div`, `::before` |

Selectors are compared component by component from left to right. `#nav .link` (0,1,1,0) beats `.nav .link` (0,0,2,0). The universal selector `*` and combinators contribute zero specificity.

---

## 8. What is the difference between `margin` and `padding`?

`padding` is the space **inside** an element between its content and its border. It inherits the element's background and is click-targetable. `margin` is the space **outside** the border separating the element from siblings. Margins can collapse (adjacent vertical margins merge into one), while padding never collapses. Use padding to give content breathing room within a container and margin to space containers apart.

```css
.card {
  padding: 16px;  /* inner breathing room */
  margin: 24px;   /* gap between cards */
}
```

---

## 9. What is margin collapsing?

When two vertical margins touch (top of one element meets bottom of the previous sibling, or parent and first child), they collapse into a single margin equal to the larger of the two, rather than summing. Horizontal margins never collapse. This behavior applies only to block-level elements in the normal flow — it does not occur with flexbox items, grid items, floated elements, or absolutely positioned elements. Understanding this avoids unexpected spacing bugs.

```css
.a { margin-bottom: 30px; }
.b { margin-top: 20px; }
/* Actual gap between .a and .b is 30px, not 50px */
```

---

## 10. What is the difference between `display: block`, `display: inline`, and `display: inline-block`?

**`block`** — the element takes the full available width, starts on a new line, and respects `width`, `height`, `margin`, and `padding` on all sides. Examples: `<div>`, `<p>`, `<h1>`.

**`inline`** — the element flows within text, does not start a new line, and ignores `width` and `height`. Vertical `margin` and `padding` do not push other elements away. Examples: `<span>`, `<a>`, `<em>`.

**`inline-block`** — combines both: it flows inline (no line break) but respects `width`, `height`, and all box model properties. Useful for laying out buttons or cards side by side without floats.

```css
.tag {
  display: inline-block;
  padding: 4px 12px;
  background: #eee;
  border-radius: 4px;
}
```

---

## 11. What is the `display: none` property, and how does it differ from `visibility: hidden`?

`display: none` removes the element from the document flow entirely — it occupies no space and is not accessible to screen readers (in most implementations). `visibility: hidden` hides the element visually but it still occupies its space in the layout. If you need the space preserved (to avoid layout shifts), use `visibility: hidden`. If you want the element completely gone, use `display: none`. A third alternative, `opacity: 0`, hides the element visually while keeping it in the flow and interactive (it can still receive clicks).

---

## 12. What are pseudo-classes in CSS?

Pseudo-classes select elements based on their state or position, without adding extra classes in the HTML. They are denoted with a single colon `:`.

```css
a:hover { color: red; }          /* mouse hovers */
input:focus { outline: 2px solid blue; } /* keyboard focus */
li:first-child { font-weight: bold; }    /* first list item */
tr:nth-child(even) { background: #f9f9f9; } /* zebra rows */
button:disabled { opacity: 0.5; }
```

Common pseudo-classes: `:hover`, `:focus`, `:active`, `:first-child`, `:last-child`, `:nth-child()`, `:not()`, `:checked`, `:disabled`, `:visited`.

---

## 13. What are pseudo-elements in CSS?

Pseudo-elements target a specific part of an element's content rather than the whole element. They are denoted with double colons `::` (though the single-colon syntax works for legacy ones).

```css
p::first-line { font-variant: small-caps; }
p::first-letter { font-size: 2em; float: left; }
.quote::before { content: "\201C"; }   /* opening " */
.quote::after { content: "\201D"; }    /* closing " */
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

Common pseudo-elements: `::before`, `::after`, `::first-line`, `::first-letter`, `::placeholder`, `::selection`.

---

## 14. What is the difference between `::before` and `::after`?

Both are pseudo-elements that insert generated content. `::before` inserts content **before** the element's existing children; `::after` inserts content **after** them. They require the `content` property (even if empty) to render. They are often used for decorative icons, tooltips, clearfixes, and overlays without cluttering the HTML.

```css
.required-label::after {
  content: " *";
  color: red;
}
```

---

## 15. What is the `position` property in CSS?

The `position` property determines how an element is placed in the document:

| Value | Behavior |
|-------|----------|
| `static` | Default. Normal document flow; `top/right/bottom/left` have no effect. |
| `relative` | Positioned relative to its normal position; still occupies original space. |
| `absolute` | Removed from flow; positioned relative to the nearest positioned ancestor. |
| `fixed` | Removed from flow; positioned relative to the viewport; stays in place on scroll. |
| `sticky` | Acts like `relative` until a scroll threshold is crossed, then acts like `fixed`. |

```css
.tooltip {
  position: absolute;
  top: 100%;
  left: 0;
}
```

---

## 16. What is the difference between `relative` and `absolute` positioning?

A `relative` element stays in normal flow but can be offset via `top`, `left`, etc. It still occupies its original space. An `absolute` element is removed from flow and positioned relative to its closest ancestor that has `position` set to anything other than `static`. If no such ancestor exists, it is positioned relative to the initial containing block (`<html>`). A common pattern is to set the parent to `position: relative` and place a child with `position: absolute` inside it.

```css
.parent { position: relative; }
.badge {
  position: absolute;
  top: -8px;
  right: -8px;
}
```

---

## 17. What is the `z-index` property?

`z-index` controls the stacking order of positioned elements (those with `position` other than `static`). Higher values are rendered in front of lower values. It only works on positioned elements and flex/grid children. Elements without `z-index` are stacked in source order. A common pitfall is setting `z-index` without setting `position`, which has no effect.

```css
.modal-overlay { position: fixed; z-index: 100; }
.modal-content { position: fixed; z-index: 101; }
```

---

## 18. What are CSS selectors? List the main types.

CSS selectors are patterns used to target HTML elements for styling. The main types are:

- **Universal** — `*` matches every element.
- **Type** — `p`, `div` matches elements by tag name.
- **Class** — `.card` matches elements with `class="card"`.
- **ID** — `#header` matches the element with `id="header"`.
- **Attribute** — `[type="text"]` matches elements by attribute.
- **Descendant** — `article p` matches `<p>` inside `<article>`.
- **Child** — `ul > li` matches direct children only.
- **Adjacent sibling** — `h2 + p` matches the first `<p>` after `<h2>`.
- **General sibling** — `h2 ~ p` matches all `<p>` siblings after `<h2>`.
- **Pseudo-class** — `a:hover`.
- **Pseudo-element** — `p::first-line`.

---

## 19. What is the universal selector `*`?

The universal selector `*` matches every element on the page. It is commonly used in resets:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

Its specificity is (0,0,0,0) — the lowest possible — so it never accidentally overrides more specific rules.

---

## 20. What are CSS combinators?

Combinators define the relationship between selectors:

| Combinator | Syntax | Meaning |
|------------|--------|---------|
| Descendant | `A B` | B is anywhere inside A |
| Child | `A > B` | B is a direct child of A |
| Adjacent sibling | `A + B` | B immediately follows A (same parent) |
| General sibling | `A ~ B` | B follows A at any distance (same parent) |

```css
nav > ul > li { list-style: none; }    /* direct children only */
h2 + p { margin-top: 0; }              /* first paragraph after heading */
```

---

## 21. What are attribute selectors in CSS?

Attribute selectors target elements based on the presence or value of HTML attributes.

```css
[href] { color: blue; }                    /* has href */
[type="email"] { border-color: green; }     /* exact value */
[class~="card"] { padding: 16px; }          /* word in space-separated list */
[href^="https"] { color: green; }           /* starts with */
[src$=".png"] { border: 1px solid #ccc; }   /* ends with */
[data-role*="admin"] { font-weight: bold; } /* contains substring */
```

These are powerful for styling form elements by type or targeting elements with specific `data-*` attributes without adding extra classes.

---

## 22. What is the difference between `em`, `rem`, `px`, `%`, `vh`, and `vw` units?

| Unit | Reference | Use case |
|------|-----------|----------|
| `px` | Absolute (CSS pixel) | Borders, shadows, fine detail |
| `em` | Parent element's font-size | Compound scaling with nesting |
| `rem` | Root (`<html>`) font-size | Consistent global scaling |
| `%` | Parent element's dimension | Fluid widths, padding |
| `vh` | 1% of viewport height | Full-screen sections |
| `vw` | 1% of viewport width | Fluid typography, full-width |

`rem` is preferred for font sizes because it avoids the compounding problem of `em`. `px` is used where exact control is needed. `%` and viewport units drive responsive layouts.

---

## 23. What is the difference between `em` and `rem`?

`em` is relative to the **parent element's** font-size. If a parent is `16px` and you set `2em`, the result is `32px`. But if that element is nested inside another element that is also `2em`, the compounding causes unexpected sizes. `rem` (root em) always refers to the `<html>` element's font-size, so `2rem` is always `32px` (assuming the root is `16px`) regardless of nesting depth. For this reason, `rem` is the standard choice for consistent typography and spacing.

---

## 24. What are CSS colors, and what formats are available?

CSS supports several color formats:

```css
.color-formats {
  color: red;                   /* named keyword */
  color: #ff0000;               /* hex (6-digit) */
  color: #f00;                  /* hex shorthand (3-digit) */
  color: #ff000080;             /* hex with alpha (8-digit) */
  color: rgb(255, 0, 0);        /* RGB */
  color: rgba(255, 0, 0, 0.5);  /* RGB with alpha */
  color: hsl(0, 100%, 50%);     /* HSL */
  color: hsla(0, 100%, 50%, 0.5); /* HSL with alpha */
}
```

HSL is often preferred for design because adjusting lightness or saturation is more intuitive than tweaking individual RGB channels.

---

## 25. What is the `float` property?

`float` removes an element from normal flow and shifts it to the left or right of its container, allowing text and inline elements to wrap around it. It was originally designed for wrapping text around images but was widely used for layout before Flexbox and Grid arrived. Floats cause the parent to collapse (lose height) unless cleared.

```css
.image { float: left; margin-right: 16px; }
.clearfix::after { content: ""; display: table; clear: both; }
```

In modern CSS, Flexbox and Grid have largely replaced floats for layout purposes.

---

## 26. What is the `clear` property?

`clear` specifies which sides of an element cannot be adjacent to preceding floated elements. Values include `left`, `right`, `both`, and `none`. When applied, the element moves down below the specified floats. The classic "clearfix" hack uses `::after` with `clear: both` to force a parent container to encompass its floated children.

```css
.footer { clear: both; }
```

---

## 27. What is `overflow` in CSS?

The `overflow` property controls what happens when content exceeds its container's dimensions.

| Value | Behavior |
|-------|----------|
| `visible` | Default; content overflows without clipping. |
| `hidden` | Content is clipped; no scrollbar. |
| `scroll` | Always shows scrollbar(s). |
| `auto` | Shows scrollbar only when content overflows. |

You can control each axis independently with `overflow-x` and `overflow-y`. A common use of `overflow: hidden` is to clip floated children or create a new block formatting context.

---

## 28. What are CSS shorthand properties?

Shorthand properties let you set multiple related properties in a single declaration:

```css
/* margin: top right bottom left */
margin: 10px 20px 30px 40px;

/* background shorthand */
background: #fff url("bg.png") no-repeat center / cover;

/* font shorthand */
font: italic bold 16px/1.5 Arial, sans-serif;

/* border shorthand */
border: 2px solid #333;

/* transition shorthand */
transition: opacity 0.3s ease-in-out;
```

When using shorthands, be aware that any omitted sub-property is reset to its initial value, which can unintentionally override earlier declarations.

---

## 29. What is the `opacity` property?

`opacity` sets the transparency of an entire element and all its children. It accepts a value from `0` (fully transparent) to `1` (fully opaque). Unlike `visibility: hidden`, an element with `opacity: 0` still takes up space and is interactive (clickable). If you need to make only the background transparent without affecting children, use `rgba()` or `hsla()` color values instead.

```css
.overlay {
  background: rgba(0, 0, 0, 0.5); /* only background is semi-transparent */
}
.faded {
  opacity: 0.5; /* entire element and children are semi-transparent */
}
```

---

## 30. What is the `background` property and its sub-properties?

The `background` shorthand covers:

| Sub-property | Purpose | Example |
|-------------|---------|---------|
| `background-color` | Fill color | `#fff` |
| `background-image` | Image or gradient | `url("bg.jpg")` |
| `background-repeat` | Tiling behavior | `no-repeat` |
| `background-position` | Placement | `center top` |
| `background-size` | Scaling | `cover`, `contain` |
| `background-attachment` | Scroll behavior | `fixed`, `scroll` |
| `background-origin` | Positioning area | `border-box` |
| `background-clip` | Painting area | `padding-box` |

```css
.hero {
  background: linear-gradient(135deg, #667eea, #764ba2) center / cover no-repeat fixed;
}
```

---

## 31. What is the difference between `background-size: cover` and `background-size: contain`?

`cover` scales the image to be as large as possible so that it completely covers the container, potentially cropping parts of the image. `contain` scales the image to fit entirely within the container without cropping, which may leave empty space (letterboxing). Use `cover` for hero sections where full coverage matters and `contain` for logos or illustrations where the full image must be visible.

---

## 32. What is a CSS reset vs. a CSS normalize?

A **CSS reset** (e.g., Eric Meyer's reset) strips all default browser styles — margins, paddings, font sizes — to zero, giving you a blank canvas. A **CSS normalize** (e.g., Normalize.css) preserves useful defaults, corrects cross-browser inconsistencies, and fixes known bugs. Normalizing is generally preferred because it keeps sane defaults (like headings being larger than paragraphs) while ensuring consistency. Most modern projects use either a normalize library or a minimal custom reset.

---

## 33. What is the `font-family` property, and what is a font stack?

`font-family` specifies which typeface to use. A **font stack** is a comma-separated list of fonts ordered by preference, ending with a generic family as a fallback:

```css
body {
  font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
```

The browser uses the first available font. Generic families (`serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`) should always be the last entry to guarantee some styling even if all preferred fonts fail to load.

---

## 34. What is the `line-height` property?

`line-height` controls the vertical spacing between lines of text. It can be set as a unitless number (multiplier of font-size), a length, or a percentage. A unitless value like `1.5` is recommended because it scales proportionally with font-size changes and is inherited cleanly by child elements, unlike fixed values.

```css
body {
  font-size: 16px;
  line-height: 1.5; /* 24px effective line height */
}
```

---

## 35. What is the `text-align` property?

`text-align` sets horizontal alignment for inline content within a block container. Values include `left`, `right`, `center`, `justify`, and `start`/`end` (which respect writing direction). It affects text, inline elements, and inline-block children, but not block-level children (use `margin: 0 auto` for centering blocks).

```css
.hero-text { text-align: center; }
```

---

## 36. What is the `text-decoration` property?

`text-decoration` adds visual decorations to text. In CSS3, it is a shorthand for `text-decoration-line`, `text-decoration-color`, `text-decoration-style`, and `text-decoration-thickness`.

```css
a { text-decoration: none; }  /* remove link underline */
.strike { text-decoration: line-through red wavy; }
.underline { text-decoration: underline #333 solid 2px; }
```

---

## 37. What is `text-transform`?

`text-transform` changes the capitalization of text without modifying the HTML source:

```css
.uppercase { text-transform: uppercase; }   /* ALL CAPS */
.lowercase { text-transform: lowercase; }   /* all lower */
.capitalize { text-transform: capitalize; } /* First Letter Of Each Word */
.none { text-transform: none; }             /* as-is */
```

This is preferred over writing uppercase text directly in HTML because it separates content from presentation and is easier to update.

---

## 38. What is the `cursor` property?

The `cursor` property controls the mouse pointer appearance when hovering over an element. Common values: `pointer` (hand icon for links), `default` (arrow), `text` (I-beam), `not-allowed` (prohibited), `grab`/`grabbing` (drag), `crosshair`, `wait`, `help`, and `none`.

```css
.clickable { cursor: pointer; }
.disabled { cursor: not-allowed; opacity: 0.5; }
```

---

## 39. What is the `list-style` property?

`list-style` is a shorthand for `list-style-type`, `list-style-position`, and `list-style-image`. It controls the appearance of list item markers.

```css
ul.custom {
  list-style: none;          /* remove bullets */
  padding-left: 0;
}
ol.roman {
  list-style-type: upper-roman;
}
ul.icon {
  list-style: square inside;
}
```

Setting `list-style: none` and `padding: 0` is the standard way to strip default list styling for navigation menus.

---

## 40. What is the `border-radius` property?

`border-radius` rounds the corners of an element's border box. It accepts one to four values (like `margin`/`padding`) and can use lengths or percentages.

```css
.rounded { border-radius: 8px; }        /* uniform rounding */
.pill { border-radius: 9999px; }         /* fully rounded ends */
.circle { border-radius: 50%; }          /* perfect circle (square element) */
.custom { border-radius: 10px 0 10px 0; } /* alternating corners */
```

---

## 41. How do you center an element horizontally in CSS?

The method depends on the element type:

**Block element with known width:**
```css
.centered-block {
  width: 600px;
  margin: 0 auto;
}
```

**Inline or inline-block element:**
```css
.parent { text-align: center; }
```

**Flexbox (most versatile):**
```css
.parent {
  display: flex;
  justify-content: center;
}
```

**Grid:**
```css
.parent {
  display: grid;
  place-items: center;
}
```

---

## 42. How do you center an element both horizontally and vertically?

**Flexbox (recommended):**
```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

**Grid (shortest):**
```css
.parent {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
```

**Absolute positioning + transform:**
```css
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

## 43. What is Flexbox?

Flexbox (Flexible Box Layout) is a one-dimensional layout system for distributing space along a single axis — either a row or a column. It simplifies centering, equal-height columns, reordering, and responsive distribution without floats or positioning hacks. You activate it with `display: flex` on the container, then control children with properties like `justify-content`, `align-items`, `flex-grow`, `flex-shrink`, and `flex-basis`.

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

## 44. What are the main Flexbox container properties?

| Property | Purpose | Common values |
|----------|---------|---------------|
| `flex-direction` | Main axis direction | `row`, `row-reverse`, `column`, `column-reverse` |
| `flex-wrap` | Whether items wrap | `nowrap`, `wrap`, `wrap-reverse` |
| `justify-content` | Main axis alignment | `flex-start`, `center`, `space-between`, `space-around`, `space-evenly` |
| `align-items` | Cross axis alignment | `stretch`, `flex-start`, `center`, `flex-end`, `baseline` |
| `align-content` | Multi-line cross alignment | Same as `justify-content` |
| `gap` | Spacing between items | `10px`, `1rem 2rem` |

---

## 45. What are the main Flexbox item properties?

| Property | Purpose | Default |
|----------|---------|---------|
| `flex-grow` | Proportion of extra space to absorb | `0` |
| `flex-shrink` | Proportion to shrink when space is tight | `1` |
| `flex-basis` | Initial size before growing/shrinking | `auto` |
| `flex` | Shorthand for grow, shrink, basis | `0 1 auto` |
| `align-self` | Override container's `align-items` for this item | `auto` |
| `order` | Visual order (lower = first) | `0` |

```css
.sidebar { flex: 0 0 250px; }   /* fixed 250px, no grow/shrink */
.content { flex: 1; }           /* takes remaining space */
```

---

## 46. What is CSS Grid?

CSS Grid is a two-dimensional layout system that lets you control both rows and columns simultaneously. It excels at complex page layouts (headers, sidebars, main content, footers) that would be cumbersome with Flexbox alone. You define a grid on the container with `display: grid`, specify rows and columns with `grid-template-rows` and `grid-template-columns`, and place children into cells.

```css
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  min-height: 100vh;
}
```

---

## 47. When should you use Flexbox vs. Grid?

**Flexbox** is ideal for one-dimensional layouts — a row of navigation items, a toolbar, vertically stacked cards. **Grid** is ideal for two-dimensional layouts — full page structures, dashboards, image galleries where row and column alignment both matter. They work well together: use Grid for the page skeleton and Flexbox inside individual components.

---

## 48. What is a media query?

A media query applies CSS rules conditionally based on device characteristics like viewport width, height, orientation, resolution, or preferred color scheme. They are the cornerstone of responsive design.

```css
/* Mobile first: base styles for small screens */
.container { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 32px; max-width: 720px; margin: 0 auto; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { max-width: 960px; }
}
```

---

## 49. What is responsive web design?

Responsive web design (RWD) is an approach where a website's layout, images, and content adapt fluidly to different screen sizes and devices. Key techniques include fluid grids (using `%`, `fr`, `vw`), flexible images (`max-width: 100%`), media queries, and modern layout tools like Flexbox and Grid. The goal is a single codebase that provides an optimal experience on phones, tablets, and desktops.

---

## 50. What is the `viewport` meta tag, and why is it important for CSS?

The viewport meta tag tells mobile browsers how to scale the page:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Without it, mobile browsers render pages at a virtual width (typically 980px) and scale down, making media queries based on viewport width ineffective. This tag is essential for responsive CSS to work correctly on mobile devices.

---

## 51. What is the `inherit` keyword in CSS?

`inherit` forces a property to take the computed value from its parent element. By default, some properties (like `color`, `font-family`) are inherited automatically, while others (like `border`, `margin`, `padding`) are not. Using `inherit` on a non-inherited property explicitly pulls the parent's value.

```css
.child {
  border: inherit; /* takes parent's border */
}
```

---

## 52. What is the `initial` keyword in CSS?

`initial` resets a property to its specification-defined default value, regardless of inheritance or prior declarations. For example, `display: initial` resolves to `inline` (the CSS spec default for `display`), not to what the browser's user-agent stylesheet sets for that element.

---

## 53. What is the `unset` keyword?

`unset` acts as `inherit` for inherited properties and `initial` for non-inherited properties. It is useful for resetting a property cleanly without needing to know whether it inherits.

```css
.reset-all {
  all: unset; /* resets every property to inherited or initial */
}
```

---

## 54. What is the `!important` declaration?

`!important` overrides normal specificity and cascade rules, making a declaration the highest priority (among author styles). It should be avoided in most cases because it makes styles hard to override and debug. Legitimate uses include utility classes in CSS frameworks and overriding third-party widget styles. If you find yourself using `!important` frequently, it is a sign that your selector strategy needs refactoring.

```css
.hidden { display: none !important; } /* utility override */
```

---

## 55. What are CSS transitions?

Transitions animate the change of a CSS property from one value to another over a specified duration. They require a trigger (like `:hover`) and apply to properties that have interpolatable values (colors, lengths, opacity, transforms — not `display`).

```css
.btn {
  background: #3498db;
  transition: background 0.3s ease, transform 0.2s ease;
}
.btn:hover {
  background: #2980b9;
  transform: scale(1.05);
}
```

The shorthand `transition` accepts: `property duration timing-function delay`.

---

## 56. What are CSS animations and `@keyframes`?

While transitions animate between two states, CSS animations let you define multi-step sequences using `@keyframes`. Animations can run automatically, loop, alternate direction, and control timing granularly.

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.5s ease-out forwards;
}
```

Key properties: `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`.

---

## 57. What is the `transform` property?

`transform` applies 2D or 3D geometric transformations to an element without affecting layout flow. Common functions:

```css
.element {
  transform: translate(50px, 100px);  /* move */
  transform: rotate(45deg);           /* rotate */
  transform: scale(1.5);              /* enlarge */
  transform: skew(10deg, 5deg);       /* skew */
  transform: translate(-50%, -50%) rotate(45deg); /* chained */
}
```

Transforms are hardware-accelerated, making them ideal for smooth animations. They do not trigger layout recalculations (unlike changing `width`, `top`, or `margin`).

---

## 58. What is the `transition-timing-function`?

It controls the acceleration curve of a transition:

- `ease` — slow start, fast middle, slow end (default).
- `linear` — constant speed.
- `ease-in` — slow start, speeds up.
- `ease-out` — starts fast, slows down.
- `ease-in-out` — slow start and end.
- `cubic-bezier(x1, y1, x2, y2)` — custom curve.

```css
.smooth { transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); }
```

---

## 59. What is the `@import` rule in CSS?

`@import` loads an external stylesheet from within a CSS file:

```css
@import url("reset.css");
@import url("typography.css");
```

However, it blocks parallel downloading because the browser must load the first stylesheet before discovering the imported one. For performance, use multiple `<link>` tags in HTML instead. `@import` is acceptable in CSS preprocessors (Sass/Less) because they resolve imports at build time.

---

## 60. What are CSS variables (custom properties)?

CSS custom properties (variables) are named values defined with `--` prefix and consumed with `var()`. They cascade and inherit like regular properties, making them powerful for theming.

```css
:root {
  --primary: #3498db;
  --radius: 8px;
  --spacing: 16px;
}

.btn {
  background: var(--primary);
  border-radius: var(--radius);
  padding: var(--spacing);
}

.dark-theme {
  --primary: #2ecc71;
}
```

Unlike preprocessor variables (Sass `$var`), CSS variables are live in the browser, can be updated with JavaScript, and respond to media queries.

---

## 61. What is the `calc()` function?

`calc()` lets you perform arithmetic in CSS, mixing different units:

```css
.sidebar {
  width: calc(100% - 250px);
  padding: calc(1rem + 4px);
  font-size: calc(14px + 0.5vw);
}
```

It supports `+`, `-`, `*`, `/` and respects operator precedence. Spaces around `+` and `-` are required.

---

## 62. What is the difference between `max-width` and `width`?

`width` sets a fixed or fluid width. `max-width` sets an upper limit — the element can be narrower but never wider than the specified value. This is essential for responsive design:

```css
.container {
  width: 100%;       /* fluid */
  max-width: 1200px; /* caps at 1200px */
  margin: 0 auto;    /* centers when viewport is wider */
}
```

Similarly, `min-width` sets a lower limit.

---

## 63. What are `min-height` and `max-height`?

`min-height` ensures an element is at least a certain height (useful for hero sections). `max-height` caps growth (useful for collapsible panels or scrollable regions).

```css
.hero { min-height: 100vh; }
.dropdown {
  max-height: 300px;
  overflow-y: auto;
}
```

---

## 64. What is the `object-fit` property?

`object-fit` controls how replaced content (like `<img>` or `<video>`) is resized within its container:

| Value | Behavior |
|-------|----------|
| `fill` | Stretches to fill (may distort) |
| `contain` | Scales to fit; may leave gaps |
| `cover` | Scales to cover; may crop |
| `none` | Original size; may overflow |
| `scale-down` | Behaves as `none` or `contain`, whichever is smaller |

```css
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}
```

---

## 65. What is a CSS gradient?

Gradients create smooth transitions between colors as backgrounds:

```css
/* Linear gradient */
.hero { background: linear-gradient(135deg, #667eea, #764ba2); }

/* Radial gradient */
.spotlight { background: radial-gradient(circle at center, #fff, #000); }

/* Conic gradient */
.pie { background: conic-gradient(red 0% 33%, green 33% 66%, blue 66%); }

/* Repeating gradient */
.stripes {
  background: repeating-linear-gradient(
    45deg, #eee, #eee 10px, #fff 10px, #fff 20px
  );
}
```

---

## 66. What is the `outline` property, and how does it differ from `border`?

`outline` draws a line outside the element's border but does not take up space in the layout (it does not affect width, height, or surrounding elements). It is commonly used for focus indicators. Unlike `border`, `outline` cannot have rounded corners (though `outline-offset` can adjust its distance), and it is drawn on top of existing content.

```css
button:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
```

Never remove outlines without providing an alternative focus indicator, as this harms keyboard accessibility.

---

## 67. What is the `word-wrap` / `overflow-wrap` property?

`overflow-wrap` (formerly `word-wrap`) controls whether the browser can break long words that would overflow their container. `break-word` allows the browser to break unbreakable strings (like URLs) at any character to prevent overflow.

```css
.content {
  overflow-wrap: break-word;
}
```

---

## 68. What is `white-space` in CSS?

`white-space` controls how whitespace and line breaks in the source code are handled:

| Value | Collapses whitespace | Wraps text |
|-------|---------------------|------------|
| `normal` | Yes | Yes |
| `nowrap` | Yes | No |
| `pre` | No | No |
| `pre-wrap` | No | Yes |
| `pre-line` | Yes | Yes (but preserves newlines) |

```css
.code { white-space: pre; }
.no-break { white-space: nowrap; }
```

---

## 69. What is `text-overflow: ellipsis`?

It truncates overflowing text with "..." instead of showing the overflow. It requires three companion properties:

```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

For multi-line truncation, use the `-webkit-line-clamp` technique:

```css
.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 70. What is the `vertical-align` property?

`vertical-align` controls vertical positioning of **inline** and **table-cell** elements relative to their line box or cell. Common values: `baseline` (default), `top`, `middle`, `bottom`, `text-top`, `text-bottom`, and length/percentage values. It does not work on block-level elements — use Flexbox or Grid for vertical centering of blocks.

```css
img { vertical-align: middle; } /* aligns image with text middle */
```

---

## 71. What is a CSS sprite?

A CSS sprite is a single image file containing multiple small graphics (icons, buttons). Individual graphics are displayed by setting the image as a `background-image` and positioning it with `background-position`. This reduces the number of HTTP requests, improving load performance. Although icon fonts and SVGs have largely replaced sprites, the technique is still relevant for interviews and legacy projects.

```css
.icon {
  background: url("sprites.png") no-repeat;
  width: 32px;
  height: 32px;
}
.icon-home { background-position: 0 0; }
.icon-search { background-position: -32px 0; }
```

---

## 72. What is the `@font-face` rule?

`@font-face` allows you to load custom fonts from a server instead of relying on system fonts:

```css
@font-face {
  font-family: "MyFont";
  src: url("myfont.woff2") format("woff2"),
       url("myfont.woff") format("woff");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

body { font-family: "MyFont", sans-serif; }
```

`font-display: swap` shows fallback text immediately and swaps to the custom font once loaded, improving perceived performance.

---

## 73. What is the `@media` rule used for beyond screen widths?

While most common for responsive breakpoints, `@media` can query many features:

```css
@media (prefers-color-scheme: dark) {
  body { background: #1a1a1a; color: #eee; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

@media print {
  .no-print { display: none; }
}

@media (orientation: landscape) {
  .sidebar { width: 300px; }
}

@media (hover: none) {
  .tooltip { display: none; } /* no hover on touch devices */
}
```

---

## 74. What is the `pointer-events` property?

`pointer-events` controls whether an element responds to mouse/touch events. Setting `pointer-events: none` makes the element "invisible" to the pointer — clicks pass through to elements underneath. This is useful for overlay decorations that should not block interaction.

```css
.overlay-decoration {
  pointer-events: none;
}
```

---

## 75. What is the difference between `nth-child()` and `nth-of-type()`?

`:nth-child(n)` selects the nth child regardless of type. `:nth-of-type(n)` selects the nth child of a specific type. The difference matters when sibling elements have mixed types:

```html
<div>
  <h2>Title</h2>
  <p>First paragraph</p>
  <p>Second paragraph</p>
</div>
```

```css
p:nth-child(2) { }    /* matches "First paragraph" (2nd child overall) */
p:nth-of-type(2) { }  /* matches "Second paragraph" (2nd <p>) */
```

---

## 76. What is the `content` property?

`content` is used with `::before` and `::after` pseudo-elements to insert generated content. It can contain text strings, counters, attribute values, images, or be empty (for decorative elements styled with width/height/background).

```css
a[href^="http"]::after {
  content: " ↗";
}
.tooltip::before {
  content: attr(data-tooltip);
}
.step::before {
  content: counter(step-counter) ". ";
  counter-increment: step-counter;
}
```

---

## 77. What is the `table-layout` property?

`table-layout` controls how table column widths are calculated:

- `auto` (default) — the browser analyzes all cell content before calculating widths, which can be slow for large tables.
- `fixed` — column widths are determined by the first row only (or explicit widths), making rendering faster and more predictable.

```css
.data-table {
  table-layout: fixed;
  width: 100%;
}
```

---

## 78. What is the `resize` property?

`resize` allows users to resize an element by dragging its corner. It requires `overflow` to be set to something other than `visible`.

```css
textarea { resize: vertical; }    /* only vertical resizing */
.panel {
  resize: both;
  overflow: auto;
  min-width: 200px;
  min-height: 100px;
}
```

Values: `none`, `horizontal`, `vertical`, `both`.

---

## 79. What is the `filter` property?

`filter` applies graphical effects (like blur, brightness, contrast) to elements:

```css
.blurred { filter: blur(5px); }
.dark { filter: brightness(0.5); }
.grayscale { filter: grayscale(100%); }
.sepia { filter: sepia(80%); }
.combined { filter: contrast(1.2) saturate(1.5) drop-shadow(2px 2px 4px rgba(0,0,0,0.3)); }
```

`filter` affects the entire element including children. For background-only effects, use `backdrop-filter`.

---

## 80. What is `backdrop-filter`?

`backdrop-filter` applies graphical effects to the area **behind** an element (the backdrop), creating frosted-glass or depth effects without affecting the element's own content.

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}
```

---

## 81. What is the `:root` pseudo-class?

`:root` matches the document's root element — `<html>` in HTML. It is identical to the `html` selector but has higher specificity (pseudo-class vs type selector). It is the conventional place to define CSS custom properties (variables) for global theming.

```css
:root {
  --font-base: 16px;
  --color-brand: #3498db;
}
```

---

## 82. What is the `gap` property?

`gap` (formerly `grid-gap`) sets spacing between flex or grid items without adding margins. It only creates space between items, not at the edges.

```css
.grid { display: grid; gap: 16px; }
.flex-row { display: flex; gap: 12px; }
.grid-2d { display: grid; gap: 16px 24px; } /* row-gap column-gap */
```

---

## 83. What is the `place-items` shorthand?

In Grid, `place-items` is shorthand for `align-items` and `justify-items`. The one-liner `place-items: center` centers content both vertically and horizontally within each grid cell.

```css
.centered-grid {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
```

---

## 84. What is a CSS preprocessor?

A CSS preprocessor (Sass, Less, Stylus) extends CSS with features like variables, nesting, mixins, functions, and imports, then compiles into standard CSS. They improve maintainability and reduce repetition. Sass (with SCSS syntax) is the most popular:

```scss
$primary: #3498db;

.btn {
  background: $primary;
  &:hover { background: darken($primary, 10%); }
  &--large { padding: 16px 32px; }
}
```

With native CSS variables and nesting now available, preprocessors are still useful but less essential than before.

---

## 85. What is `word-spacing` and `letter-spacing`?

`letter-spacing` adjusts the space between individual characters; `word-spacing` adjusts the space between words.

```css
.spaced-heading {
  letter-spacing: 2px;
  word-spacing: 4px;
  text-transform: uppercase;
}
```

Negative values tighten spacing. These properties are often used in headings and navigation for visual polish.

---

## 86. What is the difference between `visibility: hidden` and `opacity: 0`?

Both hide an element visually while keeping it in the document flow (it still occupies space). The key difference: `visibility: hidden` makes the element non-interactive (cannot be clicked or focused), while `opacity: 0` keeps the element interactive — users can still click, tab to, and interact with it. `opacity: 0` also supports transitions, making it useful for fade effects.

---

## 87. What is a CSS comment?

CSS comments are enclosed in `/* */` and can span multiple lines. They are stripped by the browser and have no effect on rendering. Use them sparingly for documenting non-obvious decisions, section dividers, or TODO notes.

```css
/* Primary navigation styles */
.nav { display: flex; }

/*
 * TODO: Refactor this to use CSS Grid
 * once browser support for subgrid is sufficient.
 */
```

---

## 88. What is the `currentColor` keyword?

`currentColor` refers to the element's computed `color` value. It is useful for keeping borders, shadows, and SVG fills in sync with the text color without repeating values.

```css
.icon-link {
  color: #3498db;
  border-bottom: 2px solid currentColor;
}
.icon-link svg {
  fill: currentColor;
}
```

---

## 89. What is the `appearance` property?

`appearance` controls whether an element is styled with platform-native OS styles. Setting `appearance: none` removes default browser styling from form elements, giving you full control over their appearance.

```css
select, input, button {
  appearance: none;
}
```

This is essential when building custom-styled form controls.

---

## 90. What is the `will-change` property?

`will-change` hints to the browser that a property will be animated, allowing it to optimize rendering (e.g., promoting the element to its own compositor layer). It should be applied shortly before the animation and removed afterward — not set globally, as excessive use wastes memory.

```css
.animated-card:hover {
  will-change: transform, opacity;
}
```

---

## 91. What is the `clip-path` property?

`clip-path` clips an element to a shape, hiding everything outside the shape:

```css
.circle-clip { clip-path: circle(50%); }
.triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
.inset-box { clip-path: inset(10px 20px 30px 40px round 10px); }
```

It is powerful for creative layouts, hero sections, and image masking without editing the image file itself.

---

## 92. What is the `aspect-ratio` property?

`aspect-ratio` sets a preferred width-to-height ratio for an element, eliminating the old padding-hack technique:

```css
.video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
}
.square-thumb {
  aspect-ratio: 1;
}
```

If both `width` and `height` are set, `aspect-ratio` is ignored.

---

## 93. What is the `accent-color` property?

`accent-color` lets you change the color of built-in form controls (checkboxes, radio buttons, range sliders, progress bars) with a single property:

```css
input[type="checkbox"],
input[type="radio"],
input[type="range"],
progress {
  accent-color: #3498db;
}
```

---

## 94. What is a stacking context?

A stacking context is an isolated layer in the rendering tree. Elements within a stacking context are stacked relative to each other; their `z-index` values do not compete with elements in other stacking contexts. A new stacking context is created by:

- Root element (`<html>`)
- `position: absolute/relative/fixed/sticky` with `z-index` other than `auto`
- `opacity` less than 1
- `transform`, `filter`, `perspective`, `clip-path`
- `isolation: isolate`
- Flex/grid children with `z-index` other than `auto`

Understanding stacking contexts is essential for debugging `z-index` issues.

---

## 95. What is the `isolation` property?

`isolation: isolate` creates a new stacking context without requiring `position` or `z-index`. This is useful to contain `z-index` conflicts within a component so they do not leak into the surrounding page.

```css
.card {
  isolation: isolate;
}
```

---

## 96. What is the `:focus-visible` pseudo-class?

`:focus-visible` applies styles only when focus is relevant to the user — typically via keyboard navigation, not mouse clicks. This lets you show focus rings for keyboard users while hiding them for mouse users, improving both accessibility and aesthetics.

```css
button:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
button:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 97. What is the `scroll-behavior` property?

`scroll-behavior: smooth` enables smooth scrolling when navigating via anchor links or programmatic scrolling. Without it, navigation jumps instantly.

```css
html {
  scroll-behavior: smooth;
}
```

Respect the user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

---

## 98. What is the `caret-color` property?

`caret-color` changes the color of the text input cursor (caret):

```css
input, textarea {
  caret-color: #3498db;
}
```

This is a small but noticeable UX enhancement for branded form experiences.

---

## 99. What is the `user-select` property?

`user-select` controls whether text can be selected by the user:

```css
.no-select { user-select: none; }   /* prevent selection (e.g., buttons, icons) */
.all-select { user-select: all; }   /* select all on click (e.g., code snippets) */
```

Use `none` sparingly — preventing text selection can frustrate users and harm accessibility.

---

## 100. What are vendor prefixes, and are they still needed?

Vendor prefixes (`-webkit-`, `-moz-`, `-ms-`, `-o-`) were used to implement experimental CSS features before they were standardized. Examples: `-webkit-transform`, `-moz-border-radius`. Most modern properties no longer need prefixes because browser support is mature. However, some properties like `backdrop-filter` may still require `-webkit-` in certain browsers. Tools like **Autoprefixer** (a PostCSS plugin) automatically add necessary prefixes based on your browser support targets, so you write standard CSS and let the tooling handle compatibility.

```css
/* Autoprefixer handles this at build time */
.glass {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
}
```

---
