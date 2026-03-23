# CSS MCQ - Set 5 (Expert Level)

**1. In BEM, a modifier class typically looks like:**

a) `block__element--modifier`
b) `block-element-modifier` with only hyphens
c) `.js-button`
d) `#modifier`

**Answer: a) `block__element--modifier`**

---

**2. OOCSS encourages:**

a) Tight coupling of structure and skin
b) Separating structure from skin and container from content
c) Only inline styles
d) Dropping class names

**Answer: b) Separating structure from skin and container from content**

---

**3. SMACSS categorizes rules including:**

a) Base, layout, module, state, theme
b) Only utilities
c) Only components
d) Inline, block, flex

**Answer: a) Base, layout, module, state, theme**

---

**4. Atomic CSS (e.g. utility-first) emphasizes:**

a) Large monolithic selectors
b) Small single-purpose classes composed in markup
c) Only element selectors
d) No reuse

**Answer: b) Small single-purpose classes composed in markup**

---

**5. Specificity of `#nav .link:hover` compared to `.nav a`:**

a) `.nav a` always wins
b) `#nav .link:hover` is more specific
c) Equal
d) Depends on `!important` only

**Answer: b) `#nav .link:hover` is more specific**

---

**6. Inline `style` with `!important` loses to:**

a) Normal author stylesheet rules
b) User agent `!important` rules in the cascade origin ordering
c) Nothing; it always wins every cascade
d) Only `revert-layer` in same specificity

**Answer: b) User agent `!important` rules in the cascade origin ordering**

---

**7. `@layer` primarily controls:**

a) Z-index only
b) Cascade layer ordering among grouped style rules
c) Animation timing
d) Font loading

**Answer: b) Cascade layer ordering among grouped style rules**

---

**8. A later-declared unlayered rule versus an earlier layered rule typically:**

a) Layered always wins
b) Unlayered author styles win over layered author styles of same origin/importance (modern cascade)
c) They never interact
d) `@layer` is ignored by browsers

**Answer: b) Unlayered author styles win over layered author styles of same origin/importance (modern cascade)**

---

**9. `@scope` limits:**

a) JavaScript execution only
b) The subject elements a selector rule can match, relative to a scoping root
c) Viewport width
d) `@font-face` loading

**Answer: b) The subject elements a selector rule can match, relative to a scoping root**

---

**10. Native CSS nesting allows:**

a) Nesting only in preprocessors
b) Nesting selectors inside style rules in compliant browsers
c) Nesting HTML elements inside CSS files
d) Nesting `@keyframes` only

**Answer: b) Nesting selectors inside style rules in compliant browsers**

---

**11. Container queries use which at-rule?**

a) `@media`
b) `@container`
c) `@viewport`
d) `@size`

**Answer: b) `@container`**

---

**12. `container-type: inline-size` establishes:**

a) A block-size query container
b) An inline-size query container for `cqw`/`cqi`-style queries
c) No containment
d) Grid subgrid

**Answer: b) An inline-size query container for `cqw`/`cqi`-style queries**

---

**13. Naming a container with `container-name: sidebar` allows:**

a) Only JS access
b) Targeted `@container sidebar (min-width: ...)` queries
c) Shadow DOM piercing
d) Automatic BEM

**Answer: b) Targeted `@container sidebar (min-width: ...)` queries**

---

**14. CSS subgrid lets a grid item:**

a) Become a flex container only
b) Use its parent’s track definitions for its own rows/columns on an axis
c) Escape overflow hidden
d) Disable `z-index`

**Answer: b) Use its parent’s track definitions for its own rows/columns on an axis**

---

**15. Masonry layout in CSS Grid (where supported) is characterized by:**

a) Strict equal row heights always
b) Packing items into columns with minimized vertical gaps like masonry
c) Only flexbox
d) Table layout

**Answer: b) Packing items into columns with minimized vertical gaps like masonry**

---

**16. A new stacking context is created when an element has:**

a) `position: static` and `z-index: auto` only
b) `position` other than `static` with `z-index` not `auto` (common case)
c) `color: inherit` only
d) `display: inline` always

**Answer: b) `position` other than `static` with `z-index` not `auto` (common case)**

---

**17. The containing block for an absolutely positioned element is:**

a) Always the viewport
b) The padding edge of the nearest positioned ancestor or specific initial containing block rules
c) Always `body`
d) The margin edge of parent always

**Answer: b) The padding edge of the nearest positioned ancestor or specific initial containing block rules**

---

**18. A Block Formatting Context (BFC) isolates:**

a) Only floats inside tables
b) Block layout so floats and margins are contained in predictable ways inside the BFC root
c) Only flex items
d) Only grid gaps

**Answer: b) Block layout so floats and margins are contained in predictable ways inside the BFC root**

---

**19. Vertical margins of adjacent block siblings often:**

a) Add arithmetically always
b) Collapse to the larger of the two (classic margin collapsing)
c) Never collapse in CSS
d) Double

**Answer: b) Collapse to the larger of the two (classic margin collapsing)**

---

**20. Margin collapsing is prevented between parent and first child when:**

a) Parent has padding or border or overflow not visible (among other triggers)
b) Never
c) Only with flex parent
d) Only with `float`

**Answer: a) Parent has padding or border or overflow not visible (among other triggers)**

---

**21. `position: sticky` can fail to stick if:**

a) An ancestor has `overflow: hidden` creating a scrollport that clips sticky behavior
b) `top` is set
c) `z-index` is `auto`
d) It always sticks regardless of ancestors

**Answer: a) An ancestor has `overflow: hidden` creating a scrollport that clips sticky behavior**

---

**22. Logical property `margin-inline-start` maps in LTR to:**

a) `margin-top`
b) `margin-left`
c) `margin-right`
d) `margin-bottom`

**Answer: b) `margin-left`**

---

**23. `padding-block` sets padding on:**

a) Left and right in all writing modes
b) Block axis sides (top/bottom in horizontal-tb)
c) Only grid gaps
d) Inline axis only

**Answer: b) Block axis sides (top/bottom in horizontal-tb)**

---

**24. `scroll-snap-type: y mandatory` on a scroll container:**

a) Disables scrolling
b) Requires scroll positions to settle on snap points on the y axis when scrolling stops
c) Only works on `body`
d) Snaps the viewport only, never overflow elements

**Answer: b) Requires scroll positions to settle on snap points on the y axis when scrolling stops**

---

**25. `scroll-snap-align: center` on a snap child:**

a) Aligns text
b) Aligns the snap area to the snapport center when snapping
c) Sets flex alignment
d) Invalid on images

**Answer: b) Aligns the snap area to the snapport center when snapping**

---

**26. Scroll-driven animations tie animation progress to:**

a) Only `hover`
b) Scroll position or view timeline progress along an axis
c) CPU load
d) `@media` only

**Answer: b) Scroll position or view timeline progress along an axis**

---

**27. `view-timeline` (conceptually) relates an element’s visibility in a scroller to:**

a) `z-index` changes
b) Animation timelines based on intersection along an axis
c) Font loading
d) `prefers-reduced-motion` only

**Answer: b) Animation timelines based on intersection along an axis**

---

**28. CSS Houdini’s Paint Worklet allows:**

a) Server-side rendering only
b) Programmatic custom painting for `background-image: paint(foo)`
c) Replacing HTML parsing
d) SQL queries

**Answer: b) Programmatic custom painting for `background-image: paint(foo)`**

---

**29. Layout API in Houdini enables:**

a) Custom layout models like `display: layout(mylayout)` for children
b) Only color interpolation
c) Only transitions
d) HTTP caching

**Answer: a) Custom layout models like `display: layout(mylayout)` for children**

---

**30. `@property --x` can declare:**

a) HTML attributes
b) Syntax and inheritance for a registered custom property
c) Keyframe names only
d) Grid template names only

**Answer: b) Syntax and inheritance for a registered custom property**

---

**31. A custom property animation between registered `<color>` values:**

a) Is always impossible
b) Can interpolate smoothly when registered with `syntax: "<color>"` via `@property`
c) Requires SVG only
d) Requires jQuery

**Answer: b) Can interpolate smoothly when registered with `syntax: "<color>"` via `@property`**

---

**32. `sin()` and `cos()` in CSS math are used for:**

a) String manipulation
b) Trigonometric calculations in `calc()`-like contexts
c) Selector matching
d) HTTP requests

**Answer: b) Trigonometric calculations in `calc()`-like contexts**

---

**33. `mod(7, 3)` returns:**

a) `3`
b) `1` (remainder in typical mod semantics)
c) `21`
d) Error always

**Answer: b) `1` (remainder in typical mod semantics)**

---

**34. `round()` in CSS can:**

a) Round numbers to nearest multiple under CSS Values spec functions
b) Only round borders
c) Round HTML tags
d) Not exist in CSS

**Answer: a) Round numbers to nearest multiple under CSS Values spec functions**

---

**35. Specificity of `:where(#id)` is:**

a) `1,0,0` for the id
b) `0,0,0` because `:where()` contributes zero specificity
c) Infinite
d) Invalid

**Answer: b) `0,0,0` because `:where()` contributes zero specificity**

---

**36. `!important` inside `@layer` still respects:**

a) Nothing
b) Layer order among same-origin `!important` layered rules
c) Only inline normal declarations
d) Only user styles normal

**Answer: b) Layer order among same-origin `!important` layered rules**

---

**37. `isolation: isolate` on an element:**

a) Disables transforms
b) Creates a stacking context for blending and z-order grouping
c) Removes backgrounds
d) Breaks subgrid

**Answer: b) Creates a stacking context for blending and z-order grouping**

---

**38. `contain: layout` hints:**

a) Download fonts early
b) Internal layout of the element does not affect rest of page (broadly, per containment spec goals)
c) Disables animations
d) Forces `display:none`

**Answer: b) Internal layout of the element does not affect rest of page (broadly, per containment spec goals)**

---

**39. Margin collapse through an empty block occurs because:**

a) Floats always collapse
b) Margins of in-flow block-level boxes can collapse through boxes with no border/padding/min-height content
c) Flex always collapses margins
d) It never occurs in CSS

**Answer: b) Margins of in-flow block-level boxes can collapse through boxes with no border/padding/min-height content**

---

**40. `inset: 0` on an absolutely positioned element sets:**

a) Only `margin` to 0
b) `top`, `right`, `bottom`, `left` all to `0` (logical mapping aware)
c) `width` to 0
d) Invalid shorthand

**Answer: b) `top`, `right`, `bottom`, `left` all to `0` (logical mapping aware)**

---

**41. `border-inline-end` in `horizontal-tb` LTR corresponds to:**

a) Top border
b) Right border
c) Left border
d) Bottom border

**Answer: b) Right border**

---

**42. Container query length `cqw` is:**

a) 1% of query container width (conceptually)
b) Always viewport width
c) Character width
d) Query count

**Answer: a) 1% of query container width (conceptually)**

---

**43. When both margins of parent and last child collapse, the collapsed margin is:**

a) Always zero
b) Can escape outside the parent’s border box visually if parent has no border/padding
c) Doubled inside parent
d) Ignored in flex layouts always

**Answer: b) Can escape outside the parent’s border box visually if parent has no border/padding**

---

**44. `transform` on an element establishes:**

a) A new stacking context and containing block for fixed descendants (fixed becomes like absolute to that ancestor in many cases)
b) Nothing
c) Only BFC
d) Only margin collapse

**Answer: a) A new stacking context and containing block for fixed descendants (fixed becomes like absolute to that ancestor in many cases)**

---

**45. `@scope (.root) to (.limit)` conceptually restricts:**

a) JavaScript variables
b) Selector subjects to between scoping root and limit elements
c) Network scope
d) Font family list

**Answer: b) Selector subjects to between scoping root and limit elements**

---

**46. Expert pattern: typed custom properties help avoid:**

a) Faster networks
b) Invalid at computed-value-time surprises and enable interpolation where declared
c) HTML validation
d) Semantic HTML

**Answer: b) Invalid at computed-value-time surprises and enable interpolation where declared**

---

**47. `subgrid` on `grid-template-columns` means:**

a) Child ignores parent tracks
b) Child uses parent column tracks for alignment
c) Switches to flex
d) Disables gaps

**Answer: b) Child uses parent column tracks for alignment**

---

**48. Stacking context with `opacity: 0.99` and sibling with `z-index`:**

a) Never interacts
b) Can change painting order compared to flattening without stacking contexts
c) Removes anti-aliasing always
d) Disables `position:sticky`

**Answer: b) Can change painting order compared to flattening without stacking contexts**

---

**49. Logical sizing `inline-size: 200px` in horizontal writing mode sets:**

a) Height to 200px
b) Width to 200px (inline axis is horizontal)
c) Both axes
d) Min-height only

**Answer: b) Width to 200px (inline axis is horizontal)**

---

**50. `@layer base, components, utilities` declares:**

a) Keyframe order
b) Layer precedence: later named layers defeat earlier in *cascade layer ordering* for unlayered vs layered rules handled separately
c) Z-index layers automatically
d) Grid areas

**Answer: b) Layer precedence: later named layers defeat earlier in *cascade layer ordering* for unlayered vs layered rules handled separately**

---
