# CSS MCQ - Set 3 (Intermediate Level)

**1. Which declaration establishes a flex formatting context on a container?**

a) `display: flex-inline`
b) `display: flex`
c) `flex: container`
d) `layout: flex`

**Answer: b) `display: flex`**

---

**2. What is the initial value of `flex-direction`?**

a) `column`
b) `row`
c) `row-reverse`
d) `auto`

**Answer: b) `row`**

---

**3. Which property aligns flex items along the main axis?**

a) `align-items`
b) `justify-content`
c) `align-content`
d) `place-items`

**Answer: b) `justify-content`**

---

**4. Which property aligns flex items along the cross axis in a single-line flex container?**

a) `justify-content`
b) `align-items`
c) `flex-align`
d) `cross-align`

**Answer: b) `align-items`**

---

**5. What does `align-self` do?**

a) Aligns the entire flex container in its parent
b) Overrides cross-axis alignment for a single flex item
c) Sets main-axis distribution
d) Only works on grid items

**Answer: b) Overrides cross-axis alignment for a single flex item**

---

**6. What does `flex-wrap: wrap` allow?**

a) Items shrink below their content size always
b) Flex items wrap onto multiple flex lines if needed
c) Reverses main axis
d) Disables gap

**Answer: b) Flex items wrap onto multiple flex lines if needed**

---

**7. In `flex: 1 1 200px`, what does the first number represent?**

a) `flex-basis`
b) `flex-grow`
c) `flex-shrink`
d) `order`

**Answer: b) `flex-grow`**

---

**8. What does `flex-shrink: 0` imply?**

a) The item will not grow
b) The item will not shrink below its flex base size when space is tight
c) The item is removed from flex layout
d) Same as `min-width: 0`

**Answer: b) The item will not shrink below its flex base size when space is tight**

---

**9. What does `flex-basis: auto` typically mean?**

a) Zero main size
b) Use the width/height from `width`/`height` or content-based auto sizing
c) Equal distribution
d) Same as `flex: none`

**Answer: b) Use the width/height from `width`/`height` or content-based auto sizing**

---

**10. What does `order: -1` on a flex item do?**

a) Hides the item
b) Moves the item earlier in the flex order among siblings
c) Reverses the flex direction
d) Invalid value

**Answer: b) Moves the item earlier in the flex order among siblings**

---

**11. Which property sets spacing between flex items and lines (modern shorthand)?**

a) `grid-gap` only
b) `gap`
c) `flex-gap`
d) `spacing`

**Answer: b) `gap`**

---

**12. When a flex container has multiple lines, which property aligns those lines in the cross axis?**

a) `justify-content`
b) `align-content`
c) `align-items`
d) `flex-lines`

**Answer: b) `align-content`**

---

**13. Which declaration creates a grid formatting context?**

a) `display: grid`
b) `layout: grid`
c) `grid: on`
d) `position: grid`

**Answer: a) `display: grid`**

---

**14. What does `grid-template-columns: 100px 1fr` define?**

a) One column
b) Two columns: fixed 100px and one flexible track consuming remaining space
c) Invalid `fr` usage
d) Only works with `float`

**Answer: b) Two columns: fixed 100px and one flexible track consuming remaining space**

---

**15. Which shorthand places an item by named grid areas?**

a) `grid-area: header`
b) `grid-template: header`
c) `area: header`
d) `template-area: header`

**Answer: a) `grid-area: header`**

---

**16. What does `grid-column: 1 / 3` span?**

a) One column track
b) From line 1 to line 3 (two tracks typically)
c) Three tracks
d) Invalid unless `span` keyword is used

**Answer: b) From line 1 to line 3 (two tracks typically)**

---

**17. Which property is the legacy name still supported for gutters in Grid?**

a) `flex-gap`
b) `grid-gap`
c) `gutter`
d) `column-margin`

**Answer: b) `grid-gap`**

---

**18. What does `repeat(3, 1fr)` produce?**

a) One track of `1fr`
b) Three equal flexible tracks
c) Repeating animation
d) Three fixed pixel tracks

**Answer: b) Three equal flexible tracks**

---

**19. What does `minmax(200px, 1fr)` express?**

a) Fixed 200px only
b) A track with minimum 200px and maximum `1fr` of free space
c) Invalid in Grid
d) Same as `clamp(200px, 1fr, 100%)`

**Answer: b) A track with minimum 200px and maximum `1fr` of free space**

---

**20. In `repeat(auto-fill, minmax(120px, 1fr))`, empty tracks are typically:**

a) Always collapsed to zero
b) Preserved as empty columns when extra space exists (`auto-fill` behavior)
c) Removed like `auto-fit` always
d) Ignored by browsers

**Answer: b) Preserved as empty columns when extra space exists (`auto-fill` behavior)**

---

**21. `grid-template-areas` works with:**

a) Only absolutely positioned children
b) Named cells referenced by `grid-area` on children
c) Only flex items
d) Tables only

**Answer: b) Named cells referenced by `grid-area` on children**

---

**22. Which pair sets both `align-items` and `justify-items` on a grid container?**

a) `place-content`
b) `place-items`
c) `justify-content`
d) `align-content`

**Answer: b) `place-items`**

---

**23. Which pair sets `align-content` and `justify-content` together on a grid container?**

a) `place-items`
b) `place-content`
c) `grid-align`
d) `content-place`

**Answer: b) `place-content`**

---

**24. Which `position` value is the default?**

a) `relative`
b) `absolute`
c) `static`
d) `initial`

**Answer: c) `static`**

---

**25. For `position: relative`, offsets like `top`:**

a) Remove the element from flow
b) Shift the element visually relative to its normal position while preserving layout space
c) Position relative to the viewport always
d) Require `z-index: 1`

**Answer: b) Shift the element visually relative to its normal position while preserving layout space**

---

**26. `position: absolute` is positioned relative to:**

a) The viewport always
b) The nearest positioned ancestor (or initial containing block)
c) Parent padding edge only
d) `body` always

**Answer: b) The nearest positioned ancestor (or initial containing block)**

---

**27. `position: fixed` is typically positioned relative to:**

a) Parent element
b) Initial containing block / viewport in screen-like media
c) `html` only when `transform` is set
d) Table cell

**Answer: b) Initial containing block / viewport in screen-like media**

---

**28. `position: sticky` requires:**

a) No inset values
b) A scrolling ancestor and typically `top`/`left` etc. to define the stick point
c) `display: flex` on parent
d) `z-index: auto` only

**Answer: b) A scrolling ancestor and typically `top`/`left` etc. to define the stick point**

---

**29. What does `z-index` affect?**

a) Source order in HTML
b) Stacking order within a stacking context
c) Flex grow factor
d) Font depth

**Answer: b) Stacking order within a stacking context**

---

**30. Which creates a stacking context in common cases?**

a) `opacity: 1` never
b) `opacity` less than 1 on an element
c) `display: block` always
d) `color: red`

**Answer: b) `opacity` less than 1 on an element**

---

**31. What does `transform: translateX(20px)` do?**

a) Rotates 20 degrees
b) Moves the element 20px along the X axis in transform space
c) Scales width by 20
d) Skews 20px

**Answer: b) Moves the element 20px along the X axis in transform space**

---

**32. What does `transform: rotate(45deg)` do?**

a) Moves the element
b) Rotates the element 45 degrees around the transform origin
c) Changes font slant
d) Clips corners

**Answer: b) Rotates the element 45 degrees around the transform origin**

---

**33. `transform: scale(2)` scales:**

a) Only text
b) The element’s coordinate system by 2 in both axes by default
c) Border width only
d) Viewport

**Answer: b) The element’s coordinate system by 2 in both axes by default**

---

**34. What does `skewX(10deg)` affect?**

a) Translation along X
b) Shearing/slanting along the X axis
c) Rotation around Z only
d) Opacity

**Answer: b) Shearing/slanting along the X axis**

---

**35. Which transition property lists CSS properties to animate?**

a) `transition-properties`
b) `transition-property`
c) `animate`
d) `animation-name`

**Answer: b) `transition-property`**

---

**36. Which sets how long a transition runs?**

a) `transition-delay`
b) `transition-duration`
c) `transition-timing`
d) `transition-speed`

**Answer: b) `transition-duration`**

---

**37. Which timing function starts slow, speeds up, then slows down?**

a) `linear`
b) `ease`
c) `steps(3)`
d) `cubic-bezier(1,1,0,0)` only

**Answer: b) `ease`**

---

**38. What does `transition-delay: 0.5s` do?**

a) Makes the transition last 0.5s
b) Waits 0.5s before the transition starts after a property change
c) Repeats the transition
d) Delays hover only

**Answer: b) Waits 0.5s before the transition starts after a property change**

---

**39. Given:**

```css
.box { transition: transform 200ms ease; }
.box:hover { transform: scale(1.1); }
```

What transitions on hover?

a) `color` only
b) `transform` over 200ms with `ease`
c) All properties automatically
d) Nothing without `will-change`

**Answer: b) `transform` over 200ms with `ease`**

---

**40. In Flexbox, `justify-content: space-between` distributes items with:**

a) Equal space on every side of every item including ends
b) First item at start, last at end, equal space between items
c) All items centered with no end gaps
d) Random distribution

**Answer: b) First item at start, last at end, equal space between items**

---

**41. `align-items: stretch` on a flex container (default) makes items:**

a) Shrink to content height always
b) Stretch to the cross size of the flex line (typical row flex)
c) Align to baseline always
d) Ignore height

**Answer: b) Stretch to the cross size of the flex line (typical row flex)**

---

**42. `grid-auto-rows` defines sizing for:**

a) Explicit template rows only
b) Implicit rows created when items flow beyond defined template rows
c) Column tracks
d) Flex lines

**Answer: b) Implicit rows created when items flow beyond defined template rows**

---

**43. `fr` units distribute:**

a) Only pixel space
b) Remaining free space in the grid container after min/max and fixed tracks
c) Parent font size
d) Viewport only

**Answer: b) Remaining free space in the grid container after min/max and fixed tracks**

---

**44. `transform-origin: top left` changes:**

a) The element’s position in normal flow
b) The point about which transforms like rotate/scale are applied
c) Z-index base
d) Flex basis

**Answer: b) The point about which transforms like rotate/scale are applied**

---

**45. Multiple transforms in one property are applied:**

a) Right-to-left in the list (as composed matrices)
b) Left-to-right as specified (matrix multiplication order per CSS transforms)
c) Random order
d) Only the last one applies

**Answer: b) Left-to-right as specified (matrix multiplication order per CSS transforms)**

---

**46. `position: absolute` with `top:0; left:0` places the box’s margin edge:**

a) At the padding edge of containing block (typical CSS box model for absolute positioning)
b) Always at viewport corner regardless of ancestors
c) Outside the document
d) Relative to sibling only

**Answer: a) At the padding edge of containing block (typical CSS box model for absolute positioning)**

---

**47. `flex-flow` is shorthand for:**

a) `flex-direction` and `flex-wrap`
b) `justify-content` and `align-items`
c) `flex-grow` and `flex-shrink`
d) `gap` and `order`

**Answer: a) `flex-direction` and `flex-wrap`**

---

**48. `grid-row: span 2` means:**

a) Span two columns
b) Span two rows
c) Invalid
d) Double gap

**Answer: b) Span two rows**

---

**49. A flex item with `margin: auto` on the main axis often:**

a) Is ignored
b) Absorbs extra space, acting like automatic margins in flex layout
c) Breaks flex entirely
d) Forces `wrap`

**Answer: b) Absorbs extra space, acting like automatic margins in flex layout**

---

**50. `transition: all` is generally:**

a) The most performant choice always
b) Convenient but can be costly if many properties change unintentionally
c) Invalid
d) Same as `transition: none`

**Answer: b) Convenient but can be costly if many properties change unintentionally**

---
