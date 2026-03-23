# 200 CSS Real-Time Assignments

---

## 🟢 BEGINNER LEVEL (Assignments 1–70)

### Selectors & Basics

**Assignment 1:** Style all `<p>` elements with a base font size and color using an element selector.

**Assignment 2:** Create a `.highlight` class that applies a yellow background and bold text.

**Assignment 3:** Use an `#main-title` ID selector to center a single heading and set a distinct color.

**Assignment 4:** Apply a box reset for all elements using the universal selector (`*`).

**Assignment 5:** Group `h1`, `h2`, and `h3` so they share the same font family and margin.

**Assignment 6:** Style links inside `.article-body` with a color and underline using a descendant selector.

**Assignment 7:** Select only direct child `<li>` elements of `.menu` (not nested lists) and set list-style.

**Assignment 8:** Style a paragraph that immediately follows an `h2` using the adjacent sibling combinator.

**Assignment 9:** Target `<input type="email">` and `<a>` elements whose `href` starts with `https` using attribute selectors.

**Assignment 10:** Combine class and element selectors (e.g. `button.primary`) for a primary button style.

### Colors & Backgrounds

**Assignment 11:** Build a palette using named CSS colors for text and background on a card.

**Assignment 12:** Use hexadecimal colors for brand primary, secondary, and surface tones.

**Assignment 13:** Set semi-transparent overlays with `rgb()` and `rgba()` / modern `rgb` with alpha.

**Assignment 14:** Create readable text on colored backgrounds using `hsl()` and `hsla()` (or `hsl` with slash alpha).

**Assignment 15:** Draw a linear gradient header band and a radial gradient spotlight behind a hero.

**Assignment 16:** Add a `background-image` with a local or URL image and control repeat.

**Assignment 17:** Use `background-size` (`cover`, `contain`, explicit values) and `background-position` for a hero image.

**Assignment 18:** Layer multiple backgrounds (gradient + image + solid color) on one element.

### Typography

**Assignment 19:** Set a system font stack with `font-family` and fallbacks for cross-platform consistency.

**Assignment 20:** Scale type with `rem`-based `font-size` for body and headings.

**Assignment 21:** Differentiate labels, body, and captions using `font-weight` values.

**Assignment 22:** Improve readability with `line-height` on paragraphs and headings.

**Assignment 23:** Add letter spacing to uppercase labels and tight spacing for large display text.

**Assignment 24:** Align text left, center, and justify in different sections using `text-align`.

**Assignment 25:** Style links with `text-decoration` (underline, none, thickness, offset) and hover states.

**Assignment 26:** Use `text-transform` for uppercase navigation and capitalize titles.

**Assignment 27:** Load a custom font with `@font-face` (woff2) and apply it to headings.

**Assignment 28:** Import and use a font from Google Fonts via `@import` or `<link>` and apply to the whole page.

### Box Model

**Assignment 29:** Demonstrate margin collapsing between stacked block elements.

**Assignment 30:** Add consistent inner spacing to cards with `padding` using logical shorthand.

**Assignment 31:** Create bordered inputs with `border`, `border-width`, `style`, and `color`.

**Assignment 32:** Set explicit `width` and `height` on a box and show overflow behavior.

**Assignment 33:** Apply `box-sizing: border-box` globally and show the difference in total size.

**Assignment 34:** Use `outline` for focus rings that do not affect layout (keyboard users).

**Assignment 35:** Round corners with `border-radius` on buttons, cards, and avatars.

**Assignment 36:** Constrain layouts with `min-width`, `max-width`, `min-height`, and `max-height`.

**Assignment 37:** Handle long content with `overflow: auto`, `hidden`, and `clip` where appropriate.

**Assignment 38:** Lock aspect ratio for media tiles using `aspect-ratio`.

### Display & Positioning

**Assignment 39:** Convert a list into a vertical stack of block-level items.

**Assignment 40:** Place badges inline with text using `display: inline`.

**Assignment 41:** Build pill tags with `inline-block` for padding and width control.

**Assignment 42:** Toggle visibility with `display: none` vs `visibility: hidden` (explain layout impact).

**Assignment 43:** Offset an element visually with `position: relative` and `top`/`left`.

**Assignment 44:** Position a close button in the corner of a card with `position: absolute` and a positioned ancestor.

**Assignment 45:** Create a fixed header that stays visible on scroll.

**Assignment 46:** Build a sticky table of contents or section heading with `position: sticky`.

**Assignment 47:** Layer overlapping boxes with `z-index` and stacking context basics.

**Assignment 48:** Float an image left with text wrapping using `float` and `clear`.

**Assignment 49:** Clear floats with a clearfix or `flow-root` on the parent.

**Assignment 50:** Combine `relative` container + `absolute` children for a simple badge on an avatar.

### Pseudo-classes & Pseudo-elements

**Assignment 51:** Style button and link `:hover` states with color and transform hints.

**Assignment 52:** Add visible `:focus-visible` rings for keyboard focus only.

**Assignment 53:** Show pressed state with `:active` on a clickable card.

**Assignment 54:** Style the first item in a list with `:first-child`.

**Assignment 55:** Stripe table rows with `:nth-child(even)` and highlight every third item in a grid.

**Assignment 56:** Insert decorative content with `::before` on a heading (icon or bar).

**Assignment 57:** Add a fade overlay with `::after` on a thumbnail.

**Assignment 58:** Style placeholder text in inputs with `::placeholder`.

**Assignment 59:** Customize text selection colors with `::selection`.

**Assignment 60:** Change list bullet color with `::marker` on `ul`/`ol`.

### Specificity & Cascade

**Assignment 61:** Given conflicting rules, calculate which wins by specificity (type, class, ID).

**Assignment 62:** Demonstrate when `!important` overrides normal cascade (and why to avoid abuse).

**Assignment 63:** Show inherited properties (`color`, `font-size`) vs non-inherited (`margin`).

**Assignment 64:** Explain cascade order: origin, importance, specificity, source order.

**Assignment 65:** Apply a minimal CSS reset (or normalize approach) for consistent baselines.

**Assignment 66:** Use `initial` to reset a property to its default CSS value.

**Assignment 67:** Use `inherit` to force a property to take the parent’s computed value.

**Assignment 68:** Use `unset` to behave like `inherit` or `initial` depending on the property.

**Assignment 69:** Compare user agent styles vs author styles in a short demo page.

**Assignment 70:** Build a tiny stylesheet where layering source order fixes a specificity tie.

---

## 🟡 INTERMEDIATE LEVEL (Assignments 71–140)

### Flexbox

**Assignment 71:** Create a flex container with default row direction and spaced items.

**Assignment 72:** Switch main axis to column for a mobile stack using `flex-direction`.

**Assignment 73:** Allow wrapping of flex items with `flex-wrap` for a responsive row.

**Assignment 74:** Distribute items along the main axis with `justify-content` (`space-between`, `center`, etc.).

**Assignment 75:** Align items on the cross axis with `align-items` (`stretch`, `center`, `flex-end`).

**Assignment 76:** Override alignment for one flex item with `align-self`.

**Assignment 77:** Grow flexible columns with `flex-grow` and prevent shrinking with `flex-shrink`.

**Assignment 78:** Set ideal starting widths with `flex-basis` and shorthand `flex`.

**Assignment 79:** Reorder items visually with `order` without changing HTML order.

**Assignment 80:** Space flex items with `gap` instead of margins.

**Assignment 81:** Build a horizontal navbar with flex, hover states, and spaced brand + links.

**Assignment 82:** Create a card row where cards equal height using flex alignment.

**Assignment 83:** Implement the classic “holy grail” layout (header, footer, sidebars, main) with flex.

**Assignment 84:** Perfectly center a modal box horizontally and vertically with flex.

**Assignment 85:** Build a responsive “grid” of cards using flex + `flex-wrap` + `min-width` on items.

**Assignment 86:** Align form label + input rows with flex baseline and gap.

**Assignment 87:** Build a footer with pushed copyright using `margin-inline-start: auto` on a flex child.

**Assignment 88:** Create a split hero: text column + image column with responsive column direction.

### CSS Grid

**Assignment 89:** Define a grid with `grid-template-columns` and `grid-template-rows` fixed tracks.

**Assignment 90:** Use the `fr` unit for fluid column tracks.

**Assignment 91:** Use `repeat()` for 12-column and auto row patterns.

**Assignment 92:** Create flexible tracks with `minmax(200px, 1fr)` for responsive columns.

**Assignment 93:** Build `repeat(auto-fill, minmax(...))` vs `auto-fit` gallery behavior.

**Assignment 94:** Place items with `grid-column`, `grid-row`, and shorthand `grid-area`.

**Assignment 95:** Define named grid areas in `grid-template-areas` for a page layout.

**Assignment 96:** Span cells with `span` keywords across rows and columns.

**Assignment 97:** Observe implicit grid auto-placement when adding extra items.

**Assignment 98:** Build a responsive image gallery with grid and `aspect-ratio` tiles.

**Assignment 99:** Build a dashboard shell: sidebar, top bar, widgets in grid areas.

**Assignment 100:** Create a magazine-style asymmetric grid ( varied spans ).

**Assignment 101:** Nest a flex toolbar inside a grid cell (grid + flex combo).

**Assignment 102:** Align grid items with `justify-items`, `align-items`, and `place-items`.

**Assignment 103:** Align the whole grid inside the container with `justify-content` / `align-content`.

**Assignment 104:** Use `gap`, `row-gap`, and `column-gap` for grid spacing.

**Assignment 105:** Build a calendar-like grid with 7 columns and bordered cells.

**Assignment 106:** Create a pricing comparison table layout using CSS Grid (not `<table>`).

**Assignment 107:** Implement subgrid: parent grid + child grid aligned to parent tracks (where supported).

**Assignment 108:** Fallback: duplicate layout intent with flex when subgrid is unavailable (feature query).

### Responsive Design

**Assignment 109:** Write mobile-first media queries that add columns as `min-width` increases.

**Assignment 110:** Define sensible breakpoints for phone, tablet, and desktop.

**Assignment 111:** Implement fluid typography with `clamp()` for heading sizes.

**Assignment 112:** Serve responsive images with `max-width: 100%`, `height: auto`, and `object-fit`.

**Assignment 113:** Make a wide data table scroll horizontally on small screens.

**Assignment 114:** Build a hamburger toggle (checkbox hack or details/summary) with CSS-only open state.

**Assignment 115:** Stack card grids to single column under a breakpoint.

**Assignment 116:** Hide non-essential columns in tables on narrow viewports.

**Assignment 117:** Use container-relative units or container queries for a card component (see also advanced).

**Assignment 118:** Build a responsive landing section: fluid padding with `clamp()` and max-width content.

### Transitions & Transforms

**Assignment 119:** Animate `opacity` and `transform` with `transition` shorthand.

**Assignment 120:** Compare `ease`, `ease-in-out`, `cubic-bezier()`, and `linear` timing functions.

**Assignment 121:** Move an element with `translate` without affecting layout flow.

**Assignment 122:** Rotate a card or icon with `rotate` and `transform-origin`.

**Assignment 123:** Scale a button on hover with `scale` and subtle shadow.

**Assignment 124:** Skew a decorative banner with `skew` (use sparingly).

**Assignment 125:** Combine multiple transforms in one `transform` list.

**Assignment 126:** Build hover-lift cards (translateY + shadow) with transition.

**Assignment 127:** Create a 3D flip card using `transform-style` and `backface-visibility`.

**Assignment 128:** Build a CSS-only loading spinner with `rotate` and `@keyframes` (transition to animations section as needed).

### Animations

**Assignment 129:** Define `@keyframes` that change `opacity` from 0 to 1.

**Assignment 130:** Set `animation-name`, `duration`, `timing-function`, `delay`, `iteration-count`, and `direction`.

**Assignment 131:** Create an infinite subtle pulse on a notification dot.

**Assignment 132:** Animate a horizontal progress bar from 0% to 100% width.

**Assignment 133:** Implement a typewriter effect using width steps or ch units (CSS-heavy demo).

**Assignment 134:** Animate a bouncing ball with keyframes on `translateY`.

**Assignment 135:** Fade sections in on load with staggered `animation-delay`.

**Assignment 136:** Slide a drawer in from off-screen with `translateX` keyframes.

**Assignment 137:** Build a “breathing” button glow with keyframed `box-shadow`.

**Assignment 138:** Create skeleton loading placeholders with shimmer gradient animation.

**Assignment 139:** Use `animation-timeline: view()` (scroll-driven) to fade elements as they enter (modern browsers).

**Assignment 140:** Animate a conic or linear gradient background shift for a live banner effect.

---

## 🔴 ADVANCED LEVEL (Assignments 141–200)

### CSS Variables & Functions

**Assignment 141:** Define global custom properties on `:root` for color, space, and radius.

**Assignment 142:** Use `var(--token)` with a fallback: `var(--missing, #000)`.

**Assignment 143:** Switch themes by toggling a class on `<html>` that overrides variables.

**Assignment 144:** Compute layout with `calc()` for widths that account for gaps and padding.

**Assignment 145:** Use `min()`, `max()`, and `clamp()` for responsive padding and font sizes.

**Assignment 146:** Build spacing scale utilities driven entirely by variables.

**Assignment 147:** Implement light/dark mode using `color-scheme` and variable sets.

**Assignment 148:** Store a brand gradient in variables and reuse across components.

**Assignment 149:** Use variables inside `@media` queries indirectly via inherited values on components.

**Assignment 150:** Create a density toggle (compact/comfortable) by changing spacing variables.

### Advanced Selectors & Features

**Assignment 151:** Refactor repetitive selectors with `:is()` for hover/focus groups.

**Assignment 152:** Use `:where()` for zero-specificity resets or base styles.

**Assignment 153:** Style a card when it contains an image with `:has(img)`.

**Assignment 154:** Exclude states with `:not()` (e.g. disabled buttons).

**Assignment 155:** Style a component when the container is narrow using `@container` queries.

**Assignment 156:** Organize styles with `@layer base, components, utilities` and layer order.

**Assignment 157:** Nest rules with CSS nesting (`.card { &:hover { ... } }`).

**Assignment 158:** Scope styles with `@scope` to limit which descendants match.

**Assignment 159:** Combine `:has()` with form validation visuals (e.g. invalid email).

**Assignment 160:** Build a menu that opens on `:hover` and `:focus-within` for accessibility.

### Advanced Layouts

**Assignment 161:** Use `subgrid` for aligning inner card content to a parent product grid.

**Assignment 162:** Mimic masonry-like packing with grid `grid-auto-rows` and dense packing (or column workaround).

**Assignment 163:** Build responsive tiles locked with `aspect-ratio` and `object-fit`.

**Assignment 164:** Refactor physical properties to logical `margin-inline`, `padding-block`, `border-inline`.

**Assignment 165:** Demonstrate `writing-mode: vertical-rl` on a sidebar label.

**Assignment 166:** Implement horizontal scroll snapping for a carousel track with `scroll-snap-type`.

**Assignment 167:** Snap each slide with `scroll-snap-align: center` and mandatory proximity.

**Assignment 168:** Build a sticky sidebar beside long scrolling article content.

**Assignment 169:** Use `position: sticky` with a grid layout for dashboard panels.

**Assignment 170:** Combine `min-height: 100dvh` with grid rows for full-viewport layouts.

### Modern CSS

**Assignment 171:** Style native controls with `accent-color` on checkboxes and ranges.

**Assignment 172:** Mix colors with `color-mix(in oklch, var(--a), var(--b) 30%)`.

**Assignment 173:** Define a palette using `oklch()` for perceptually uniform steps.

**Assignment 174:** Animate new DOM states with `@starting-style` and `transition-behavior: allow-discrete`.

**Assignment 175:** Add a simple View Transitions API hook via `view-transition-name` on cards (demo markup).

**Assignment 176:** Build a scroll-driven fade using `animation-timeline: scroll()` on a progress indicator.

**Assignment 177:** Position a popover relative to an anchor with `anchor-name` and `position-anchor` (demo).

**Assignment 178:** Register an animatable custom property with `@property` for gradient angles.

**Assignment 179:** Use `color-scheme: light dark` with `light-dark()` function for surfaces (where supported).

**Assignment 180:** Combine `prefers-reduced-motion` media query to disable non-essential motion.

### CSS Art & Shapes

**Assignment 181:** Draw a circle and ellipse with `border-radius` and overflow hidden image.

**Assignment 182:** Create a CSS triangle with border tricks or `clip-path`.

**Assignment 183:** Build a heart shape using pseudo-elements and transforms.

**Assignment 184:** Cut a hexagon avatar with `clip-path: polygon(...)`.

**Assignment 185:** Float text around an image with `shape-outside: circle()` and `float`.

**Assignment 186:** Build a simple CSS-only hamburger icon with three spans or gradients.

**Assignment 187:** Illustrate a minimalist landscape (sun, hills) using only divs and gradients.

**Assignment 188:** Create a star badge using `clip-path` or layered transforms.

### Real-World Projects

**Assignment 189:** Build a complete responsive landing page: hero, features, CTA, footer.

**Assignment 190:** Build a responsive pricing table with highlighted “popular” plan.

**Assignment 191:** Build an admin dashboard with CSS Grid areas and widgets.

**Assignment 192:** Create an animated portfolio grid with hover overlays.

**Assignment 193:** Build a CSS-only dropdown menu with `:focus-within` keyboard support.

**Assignment 194:** Stub a responsive HTML email-friendly layout (inline-style patterns + media queries in `<style>`).

**Assignment 195:** Design a glassmorphism card with blur, transparency, and border highlight.

**Assignment 196:** Build a neumorphism button and card with soft dual shadows.

**Assignment 197:** Implement a dark mode toggle using class + `color-scheme` + variables.

**Assignment 198:** Build a CSS-only modal using `:target` on a hidden fragment or checkbox hack.

**Assignment 199:** Create a vertical responsive timeline with markers and connecting lines.

**Assignment 200:** Build an animated hero: gradient background, headline `clamp()`, and CTA pulse animation.
