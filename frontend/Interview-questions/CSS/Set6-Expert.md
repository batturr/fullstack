# CSS MCQ - Set 6 (Expert Level)

**1. `will-change: transform` hints the browser to:**

a) Disable transforms
b) Potentially promote the element to its own layer for upcoming transform changes
c) Remove compositing
d) Block scrolling

**Answer: b) Potentially promote the element to its own layer for upcoming transform changes**

---

**2. Overusing `will-change` can:**

a) Always improve performance
b) Increase memory and hurt performance by excessive layer promotion
c) Disable GPU
d) Remove repaints entirely

**Answer: b) Increase memory and hurt performance by excessive layer promotion**

---

**3. `contain: paint` implies:**

a) The element’s descendants cannot display outside its box (typical clip/paint containment)
b) Fonts won’t load
c) `overflow` becomes scroll always
d) Disables `z-index`

**Answer: a) The element’s descendants cannot display outside its box (typical clip/paint containment)**

---

**4. `content-visibility: auto` can:**

a) Force synchronous layout of entire document always
b) Skip rendering work for off-screen subtrees until needed (with containment implications)
c) Hide content from accessibility always incorrectly
d) Disable CSS variables

**Answer: b) Skip rendering work for off-screen subtrees until needed (with containment implications)**

---

**5. Compositing promotes elements to:**

a) Server components
b) GPU layers for certain properties like opacity/transform in many engines
c) HTML templates
d) SQL indexes

**Answer: b) GPU layers for certain properties like opacity/transform in many engines**

---

**6. Reflow (layout) is triggered more often by changes to:**

a) Only `transform` and `opacity`
b) Properties like `width`, `height`, `top` in layout-affecting contexts
c) `color` only
d) `will-change: auto` only

**Answer: b) Properties like `width`, `height`, `top` in layout-affecting contexts**

---

**7. Repaint without full reflow may occur when changing:**

a) `display` between block and flex
b) `background-color` without layout changes
c) `width` on block in flow
d) Adding siblings changing flex line breaks

**Answer: b) `background-color` without layout changes**

---

**8. Critical CSS strategy often inlines:**

a) All site CSS forever
b) Above-the-fold styles to reduce render-blocking for first paint
c) Only JavaScript
d) Web fonts only

**Answer: b) Above-the-fold styles to reduce render-blocking for first paint**

---

**9. Render-blocking CSS is:**

a) Always async
b) Stylesheets in `<head>` without `media` tricks or async that delay first render until loaded/parsed
c) Never a problem
d) Only inline styles

**Answer: b) Stylesheets in `<head>` without `media` tricks or async that delay first render until loaded/parsed**

---

**10. Container-query-driven responsive components:**

a) Cannot exist
b) Adapt to parent/container size rather than only viewport media queries
c) Replace HTML
d) Require jQuery

**Answer: b) Adapt to parent/container size rather than only viewport media queries**

---

**11. CSS-in-JS runtime trade-offs often include:**

a) Zero cost always
b) Runtime overhead, caching challenges, and specificity collisions vs static stylesheets
c) No SSR issues ever
d) Guaranteed better SEO always

**Answer: b) Runtime overhead, caching challenges, and specificity collisions vs static stylesheets**

---

**12. Implicit grid tracks are created when:**

a) You define `grid-template-columns` for all items always
b) More grid items exist than explicit cells in a dimension
c) You use `subgrid` only
d) You set `display:flex`

**Answer: b) More grid items exist than explicit cells in a dimension**

---

**13. Explicit grid is defined by:**

a) Only auto-placement
b) `grid-template-rows/columns` and related template properties
c) Only `float`
d) Table layout

**Answer: b) `grid-template-rows/columns` and related template properties**

---

**14. Named grid lines like `[start] 1fr [end]` allow placement with:**

a) Only numbers
b) `grid-column: start / end`
c) Only `span`
d) Flex `order`

**Answer: b) `grid-column: start / end`**

---

**15. Grid auto-placement algorithm fills:**

a) Random cells
b) Cells in row-major order by default (`grid-auto-flow: row`) unless modified
c) Only column 1
d) Only absolutely positioned items

**Answer: b) Cells in row-major order by default (`grid-auto-flow: row`) unless modified**

---

**16. `subgrid` affects:**

a) Flex basis
b) Alignment of nested grid to parent tracks on specified axes
c) Table colspan only
d) `z-index` computation only

**Answer: b) Alignment of nested grid to parent tracks on specified axes**

---

**17. Flex item `min-width: auto` default can cause:**

a) Items always shrink to zero
b) Items refusing to shrink below min-content size, often overflow in flex row layouts
c) Column direction only
d) No effect

**Answer: b) Items refusing to shrink below min-content size, often overflow in flex row layouts**

---

**18. `align-items: baseline` in a flex row aligns:**

a) Top borders
b) Baselines of flex items in the cross axis
c) Left margins only
d) Grid tracks

**Answer: b) Baselines of flex items in the cross axis**

---

**19. `flex: none` is equivalent to:**

a) `0 0 auto`
b) `1 1 0%`
c) `1 1 auto`
d) `0 1 auto`

**Answer: a) `0 0 auto`**

---

**20. CSS Anchor Positioning ties absolutely positioned elements to:**

a) Only `id` attributes in URL hashes
b) An anchor element via `anchor-name` / `position-anchor` and inset references
c) Flex lines
d) Table captions

**Answer: b) An anchor element via `anchor-name` / `position-anchor` and inset references**

---

**21. The Popover API is often styled with:**

a) `:popover-open` and `::backdrop` in supporting browsers
b) Only `:hover`
c) `:modal` only
d) `display:popover`

**Answer: a) `:popover-open` and `::backdrop` in supporting browsers**

---

**22. `:has(+ .error)` can match:**

a) Previous siblings only
b) An element immediately followed by a sibling matching `.error`
c) Parents only
d) Invalid selector

**Answer: b) An element immediately followed by a sibling matching `.error`**

---

**23. `:has(img:only-child)` matches a container:**

a) With multiple images
b) That has a single child and it is an `img`
c) With no images
d) Only `table` elements

**Answer: b) That has a single child and it is an `img`**

---

**24. Selectors Level 4 `li:nth-child(3 of .item)` picks:**

a) The third `li` in the parent regardless of class
b) The third `li` among siblings that match `.item`
c) Invalid syntax
d) Every third `.item` in the document

**Answer: b) The third `li` among siblings that match `.item`**

---

**25. `oklch()` is designed to:**

a) Encode colors in a perceptually uniform polar space (L, C, h)
b) Replace HTML only
c) Work only in print
d) Describe fonts

**Answer: a) Encode colors in a perceptually uniform polar space (L, C, h)**

---

**26. `oklab()` represents color as:**

a) Hue-only
b) Lab-style axes L, a, b in a modern OK variant space
c) CMYK only
d) Indexed palette only

**Answer: b) Lab-style axes L, a, b in a modern OK variant space**

---

**27. `color-mix(in oklch, red 50%, blue)` mixes:**

a) Only named colors in sRGB unrelated space
b) Two colors in the specified color space by percentage
c) Only gradients
d) Only borders

**Answer: b) Two colors in the specified color space by percentage**

---

**28. Relative color syntax like `oklch(from var(--c) l c h / 0.5)` derives:**

a) A new color from components of an existing color
b) Only hex colors
c) Animation names
d) Grid tracks

**Answer: a) A new color from components of an existing color**

---

**29. `light-dark()` chooses between colors based on:**

a) CPU temperature
b) Light or dark color scheme preference exposure
c) Viewport width only
d) Print vs screen only

**Answer: b) Light or dark color scheme preference exposure**

---

**30. `font-display: swap` in `@font-face` typically:**

a) Blocks text forever until font loads
b) Shows fallback then swaps to webfont when loaded (FOFT/FOUT tradeoff)
c) Never uses fallback
d) Disables web fonts

**Answer: b) Shows fallback then swaps to webfont when loaded (FOFT/FOUT tradeoff)**

---

**31. Variable fonts expose axes such as:**

a) Only `font-size`
b) `wght`, `wdth`, `ital`, etc. via `font-variation-settings`
c) Only `line-height`
d) Z-index

**Answer: b) `wght`, `wdth`, `ital`, etc. via `font-variation-settings`**

---

**32. `font-feature-settings: "liga" 0` disables:**

a) Kerning always
b) Ligatures for fonts that support OpenType features
c) Font loading
d) Color fonts

**Answer: b) Ligatures for fonts that support OpenType features**

---

**33. `offset-path` with `offset-distance` enables:**

a) Table layout
b) Motion along a defined path for positioned elements
c) Only SVG filters
d) Grid placement

**Answer: b) Motion along a defined path for positioned elements**

---

**34. Individual transform properties like `translate` and `rotate` (where supported):**

a) Replace the cascade entirely
b) Can compose with `transform` per CSS transforms module rules
c) Cannot coexist with `transform`
d) Only apply to SVG

**Answer: b) Can compose with `transform` per CSS transforms module rules**

---

**35. `@starting-style` is used for:**

a) Defining styles for newly rendered elements before the first style frame in transitions
b) Keyframe names only
c) Print margins only
d) `@font-face` only

**Answer: a) Defining styles for newly rendered elements before the first style frame in transitions**

---

**36. `transition-behavior: allow-discrete` matters for:**

a) Only `transform`
b) Allowing discrete properties to participate in transitions where defined
c) Disabling all transitions
d) JavaScript timers

**Answer: b) Allowing discrete properties to participate in transitions where defined**

---

**37. `filter: url(#svg)` applies:**

a) Only box shadows
b) An SVG filter defined elsewhere
c) Only `blur()`
d) Invalid in HTML documents

**Answer: b) An SVG filter defined elsewhere**

---

**38. `backdrop-filter: saturate(0)` behind a semi-transparent panel:**

a) Never visible
b) Desaturates the backdrop seen through the panel’s backdrop sampling region
c) Only affects text color
d) Requires `mix-blend-mode: multiply` always

**Answer: b) Desaturates the backdrop seen through the panel’s backdrop sampling region**

---

**39. `shape-outside: circle(50%)` affects:**

a) Border radius only
b) Float wrapping geometry around non-rectangular float shapes
c) Grid auto rows
d) Flex gaps

**Answer: b) Float wrapping geometry around non-rectangular float shapes**

---

**40. `@supports (display: grid)` queries:**

a) User JavaScript settings
b) Whether the UA claims support for a property:value pair
c) Network speed
d) Screen DPI only

**Answer: b) Whether the UA claims support for a property:value pair**

---

**41. `::highlight(myhl)` relates to:**

a) Print headers
b) CSS Custom Highlight API ranges styled from script
c) Spellcheck only
d) `::selection` alias always

**Answer: b) CSS Custom Highlight API ranges styled from script**

---

**42. `color()` function allows:**

a) Specifying colors in arbitrary defined color spaces when supported
b) Only hex
c) Only hsl()
d) Disabling alpha

**Answer: a) Specifying colors in arbitrary defined color spaces when supported**

---

**43. `contain: strict` is effectively like:**

a) `contain: size layout paint` (shorthand combining multiple containments)
b) `overflow: visible` only
c) `display: none`
d) `position: fixed`

**Answer: a) `contain: size layout paint` (shorthand combining multiple containments)**

---

**44. Layer promotion from `transform: translateZ(0)` can:**

a) Reduce paint cost for animated subtrees sometimes at memory cost
b) Always remove GPU use
c) Disable subpixel antialiasing in some cases
d) Both a) and c) can occur depending on content and platform

**Answer: d) Both a) and c) can occur depending on content and platform**

---

**45. `reading-flow` / logical document flow patterns in responsive design often combine:**

a) Only floats
b) Fluid type with `clamp()`, container queries, and intrinsic layouts
c) Fixed 960px only
d) Table layout only

**Answer: b) Fluid type with `clamp()`, container queries, and intrinsic layouts**

---

**46. Dense packing `grid-auto-flow: row dense`:**

a) Ignores order
b) Backfills holes earlier in the grid when smaller items appear later
c) Only works in subgrid
d) Disables explicit placement

**Answer: b) Backfills holes earlier in the grid when smaller items appear later**

---

**47. `gap` in flex differs from margins in that:**

a) Gaps are outside the flex container
b) Gaps separate items without doubling space between like adjacent margins can
c) Gaps collapse with margins always
d) Flex has no `gap`

**Answer: b) Gaps separate items without doubling space between like adjacent margins can**

---

**48. `content-visibility` with `contain-intrinsic-size` helps avoid:**

a) Layout shifts when placeholder size approximates final size
b) Font loading
c) HTTP caching
d) Specificity wars

**Answer: a) Layout shifts when placeholder size approximates final size**

---

**49. `:has()` performance cost is managed by browsers partly via:**

a) Ignoring `:has()` always
b) Relative selector bloom filters and limits on certain complex cases in implementations
c) Running only on server
d) Disabling layout

**Answer: b) Relative selector bloom filters and limits on certain complex cases in implementations**

---

**50. `@supports selector(:has(+ *))` tests:**

a) Color parsing
b) Whether `:has()` selector feature is supported as queried
c) Grid track sizes
d) Font face loading

**Answer: b) Whether `:has()` selector feature is supported as queried**

---
</think>
Fixing a corrupted question in Set6 and verifying the file.

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Grep