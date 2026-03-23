# CSS MCQ - Set 4 (Intermediate Level)

**1. Which at-rule applies styles conditionally based on viewport or environment?**

a) `@font-face`
b) `@media`
c) `@scope`
d) `@charset`

**Answer: b) `@media`**

---

**2. What does this query target?**

```css
@media (min-width: 768px) { }
```

a) Viewports strictly less than 768px
b) Viewports 768px wide and wider
c) Only print
d) Only landscape phones under 400px

**Answer: b) Viewports 768px wide and wider**

---

**3. `max-width: 600px` in a media query matches when:**

a) Viewport is at least 600px
b) Viewport is 600px or narrower
c) Never in modern browsers
d) Only for `tv` media type

**Answer: b) Viewport is 600px or narrower**

---

**4. Which media feature detects preferred color scheme?**

a) `color-gamut`
b) `prefers-color-scheme`
c) `theme: dark`
d) `dark-mode`

**Answer: b) `prefers-color-scheme`**

---

**5. Which media feature respects user motion preferences?**

a) `prefers-reduced-data`
b) `prefers-reduced-motion`
c) `motion: none`
d) `animation: off`

**Answer: b) `prefers-reduced-motion`**

---

**6. Which at-rule defines animation keyframes?**

a) `@animate`
b) `@keyframes`
c) `@frames`
d) `@motion`

**Answer: b) `@keyframes`**

---

**7. Which property assigns a keyframes name to an element?**

a) `keyframes-name`
b) `animation-name`
c) `animate`
d) `transition-name`

**Answer: b) `animation-name`**

---

**8. What does `animation-duration: 2s` set?**

a) Delay before repeat
b) Length of one animation cycle
c) Number of iterations
d) Easing for transitions only

**Answer: b) Length of one animation cycle**

---

**9. `animation-iteration-count: infinite` means:**

a) Animation runs once
b) Animation repeats forever
c) Animation pauses
d) Invalid value

**Answer: b) Animation repeats forever**

---

**10. CSS custom properties are declared with:**

a) `$var`
b) `--name`
c) `@var`
d) `var--name`

**Answer: b) `--name`**

---

**11. How do you use a custom property with fallback?**

a) `var(--x, #000)`
b) `var(--x || #000)`
c) `fallback(--x, #000)`
d) `$(--x, #000)`

**Answer: a) `var(--x, #000)`**

---

**12. Custom properties are inherited:**

a) Never
b) Yes, like normal inheritance unless otherwise specified
c) Only on `:root`
d) Only in Shadow DOM

**Answer: b) Yes, like normal inheritance unless otherwise specified**

---

**13. What does this compute to if `--w` is `100px`?**

```css
width: calc(var(--w) + 20px);
```

a) `100px20px` (invalid)
b) `120px`
c) `100%`
d) `20px` only

**Answer: b) `120px`**

---

**14. `min(100%, 600px)` returns:**

a) Always `100%`
b) Always `600px`
c) The smaller of the two computed values
d) Invalid combination

**Answer: c) The smaller of the two computed values**

---

**15. `max(10px, 5vh)` returns:**

a) The larger of the two computed values
b) Always `10px`
c) Always `5vh`
d) Average

**Answer: a) The larger of the two computed values**

---

**16. `clamp(1rem, 2vw, 3rem)` constrains a preferred value:**

a) To never exceed `1rem` or fall below `3rem`
b) Between a minimum `1rem` and maximum `3rem`, preferring `2vw` when possible
c) To exactly `2vw`
d) Invalid without three lengths

**Answer: b) Between a minimum `1rem` and maximum `3rem`, preferring `2vw` when possible**

---

**17. Which creates a gradient along a line?**

a) `radial-gradient()`
b) `linear-gradient()`
c) `conic-gradient()` only
d) `gradient: linear`

**Answer: b) `linear-gradient()`**

---

**18. Which gradient radiates from a center point?**

a) `linear-gradient()`
b) `radial-gradient()`
c) `repeat-linear-gradient()` only
d) `mesh-gradient()` standard everywhere

**Answer: b) `radial-gradient()`**

---

**19. Which adds shadow around the element’s frame?**

a) `text-shadow`
b) `box-shadow`
c) `filter: shadow()`
d) `outline-shadow`

**Answer: b) `box-shadow`**

---

**20. Which adds shadow to glyphs?**

a) `box-shadow`
b) `text-shadow`
c) `font-shadow`
d) `glyph-shadow`

**Answer: b) `text-shadow`**

---

**21. Which filter blurs the rendered output of an element?**

a) `blur(5px)` inside `filter`
b) `opacity(0.5)`
c) `contrast(1)`
d) `spread(5px)`

**Answer: a) `blur(5px)` inside `filter`**

---

**22. Which filter adjusts perceived lightness?**

a) `brightness()`
b) `sepia()`
c) `hue-rotate()`
d) `invert()` only

**Answer: a) `brightness()`**

---

**23. `filter: drop-shadow()` differs from `box-shadow` mainly in that:**

a) It never follows transparency of images
b) It can follow the alpha shape of non-rectangular content more like an outer glow on the painted image
c) It only works on text
d) It is identical to `box-shadow`

**Answer: b) It can follow the alpha shape of non-rectangular content more like an outer glow on the painted image**

---

**24. Which property blends an element with its backdrop?**

a) `mix-blend-mode`
b) `background-blend-mode`
c) Both `mix-blend-mode` and `background-blend-mode` are valid blending modes in CSS
d) `blend: multiply`

**Answer: c) Both `mix-blend-mode` and `background-blend-mode` are valid blending modes in CSS**

---

**25. `clip-path: circle(50% at center)` affects:**

a) Pointer events only
b) The visible/painted region of the element
c) Font rendering only
d) Z-index

**Answer: b) The visible/painted region of the element**

---

**26. `object-fit: cover` on a replaced element like `img`:**

a) Always distorts aspect ratio
b) Scales to cover the box, cropping overflow
c) Never crops
d) Only works on video

**Answer: b) Scales to cover the box, cropping overflow**

---

**27. `object-position: 0 100%` typically:**

a) Anchors the image to top-left
b) Anchors the positioned object toward bottom-left within its box
c) Centers always
d) Invalid

**Answer: b) Anchors the positioned object toward bottom-left within its box**

---

**28. `aspect-ratio: 16 / 9` sets:**

a) Font aspect
b) A preferred width/height ratio for the box when one axis is auto
c) Video codec
d) Grid columns

**Answer: b) A preferred width/height ratio for the box when one axis is auto**

---

**29. `:is()` differs from `:where()` in specificity because:**

a) `:is()` contributes specificity of its most specific argument; `:where()` contributes zero specificity
b) They are identical in specificity
c) `:where()` always wins
d) Neither matches selectors

**Answer: a) `:is()` contributes specificity of its most specific argument; `:where()` contributes zero specificity**

---

**30. `:not(.a)` specificity includes:**

a) Zero specificity
b) The specificity of `.a` inside `:not()`
c) Only universal selector weight
d) Invalid in modern CSS

**Answer: b) The specificity of `.a` inside `:not()`**

---

**31. `:has(.child)` allows:**

a) Parent selection based on descendant state
b) Only sibling selection
c) Only previous sibling
d) It is not supported in browsers

**Answer: a) Parent selection based on descendant state**

---

**32. Which at-rule defines counter reset/increment?**

a) `@counter`
b) `counter-reset` / `counter-increment` properties
c) `list-counter: on`
d) `@numbering`

**Answer: b) `counter-reset` / `counter-increment` properties**

---

**33. `writing-mode: vertical-rl` affects:**

a) Only English spellcheck
b) Block flow direction and inline progression for CJK-style vertical text
c) Only `float`
d) Only print margins

**Answer: b) Block flow direction and inline progression for CJK-style vertical text**

---

**34. `direction: rtl` primarily influences:**

a) Physical compass direction of the monitor
b) Inline base direction for bidirectional text layout
c) Flex `justify-content` always
d) Grid `fr` direction only

**Answer: b) Inline base direction for bidirectional text layout**

---

**35. `animation-fill-mode: forwards` keeps:**

a) Only the first keyframe styles after animation ends
b) Computed styles from the last keyframe after the animation completes (depending on direction)
c) The animation running
d) Opacity at 0

**Answer: b) Computed styles from the last keyframe after the animation completes (depending on direction)**

---

**36. `animation-direction: alternate` with multiple iterations:**

a) Always reverses timing only
b) Reverses direction each cycle
c) Disables easing
d) Invalid with `infinite`

**Answer: b) Reverses direction each cycle**

---

**37. Registering a custom property with `@property` can define:**

a) Only color syntax
b) Syntax, inheritance, and initial value for typed custom properties
c) JavaScript variables
d) HTML attributes

**Answer: b) Syntax, inheritance, and initial value for typed custom properties**

---

**38. `conic-gradient` is useful for:**

a) Linear fades only
b) Color transitions around a center angle (pie charts, color wheels)
c) Table borders
d) Flex gaps

**Answer: b) Color transitions around a center angle (pie charts, color wheels)**

---

**39. `backdrop-filter` applies filters to:**

a) Only the element’s own background layers
b) The area behind the element (backdrop), not the element’s own content typically
c) Only text
d) SVG only

**Answer: b) The area behind the element (backdrop), not the element’s own content typically**

---

**40. `grayscale(1)` filter makes the output:**

a) Higher contrast color
b) Fully desaturated (grayscale) at maximum in typical implementations
c) Blurry
d) Invisible

**Answer: b) Fully desaturated (grayscale) at maximum in typical implementations**

---

**41. `content: counter(section) ". "` is used with:**

a) Flex order
b) Generated content in `::before`/`::after`
c) Grid lines
d) `@import`

**Answer: b) Generated content in `::before`/`::after`**

---

**42. The media query below matches when:**

```css
@media (prefers-color-scheme: dark) { }
```

a) User prefers light scheme
b) User prefers dark color scheme (when exposed to the page)
c) Always on OLED
d) Never in Safari

**Answer: b) User prefers dark color scheme (when exposed to the page)**

---

**43. `max()` inside `calc()` is valid when:**

a) Never
b) In supporting browsers for comparing computed values at computed-value time
c) Only in JS
d) Only for `z-index`

**Answer: b) In supporting browsers for comparing computed values at computed-value time**

---

**44. `mix-blend-mode: multiply` blends:**

a) Only backgrounds of one element
b) The element’s painted content with what’s behind it using multiply blending
c) Only text with shadows
d) Only SVG filters

**Answer: b) The element’s painted content with what’s behind it using multiply blending**

---

**45. `:where(h1, h2, h3)` matches:**

a) Nothing
b) Any `h1`, `h2`, or `h3` element
c) Only nested headings
d) Only first heading

**Answer: b) Any `h1`, `h2`, or `h3` element**

---

**46. `linear-gradient(to right, red, blue)` transitions colors:**

a) Bottom to top
b) Left to right
c) In a circle
d) Randomly

**Answer: b) Left to right**

---

**47. `animation-play-state: paused`:**

a) Removes the animation
b) Freezes the animation at its current progress
c) Skips to end
d) Invalid with `transform`

**Answer: b) Freezes the animation at its current progress**

---

**48. Scoped custom properties on `.card { --accent: red; }` are visible to:**

a) Only the `.card` element itself
b) `.card` and its descendants unless overridden
c) Entire document always
d) Only `:root`

**Answer: b) `.card` and its descendants unless overridden**

---

**49. `text-shadow: 2px 2px 4px #000` parameters are typically:**

a) x-offset, y-offset, blur-radius, color
b) color only
c) spread, inset, x, y
d) Invalid order

**Answer: a) x-offset, y-offset, blur-radius, color**

---

**50. `orientation: landscape` in `@media` matches:**

a) Portrait phones only
b) Viewport width greater than height (broadly)
c) Print only
d) Dark mode

**Answer: b) Viewport width greater than height (broadly)**

---
