# CSS MCQ - Set 2 (Beginner Level)

**1. Which selector targets `span` elements inside `div`, at any depth?**

a) `div > span`
b) `div span`
c) `div + span`
d) `div ~ span`

**Answer: b) `div span`**

---

**2. Which combinator selects direct child elements only?**

a) Space (descendant)
b) `>`
c) `+`
d) `~`

**Answer: b) `>`**

---

**3. What does `h2 + p` select?**

a) All `p` inside `h2`
b) Every `p` that immediately follows an `h2` sibling
c) All `h2` followed by any `p` descendant
d) `p` elements that are children of `h2`

**Answer: b) Every `p` that immediately follows an `h2` sibling**

---

**4. What does `h2 ~ p` select?**

a) Only the first `p` after `h2`
b) All `p` siblings that share the same parent and come after `h2`
c) All `p` descendants of `h2`
d) `p` elements before `h2`

**Answer: b) All `p` siblings that share the same parent and come after `h2`**

---

**5. Which selector matches an `input` with `type="text"`?**

a) `input.text`
b) `input[type="text"]`
c) `input#text`
d) `input(type=text)`

**Answer: b) `input[type="text"]`**

---

**6. Which attribute selector matches `class` values containing a space-separated `btn` token?**

a) `[class=btn]`
b) `[class*="btn"]` only
c) `[class~="btn"]`
d) `[class^="btn"]` only

**Answer: c) `[class~="btn"]`**

---

**7. When does `:hover` apply?**

a) While the element is being activated (click)
b) While the pointing device is over the element (when hover is supported)
c) When the element has keyboard focus
d) After the link was visited

**Answer: b) While the pointing device is over the element (when hover is supported)**

---

**8. Which pseudo-class matches an element while it is being activated (e.g. mouse down)?**

a) `:hover`
b) `:focus`
c) `:active`
d) `:pressed`

**Answer: c) `:active`**

---

**9. Which pseudo-class applies when an element can receive input focus?**

a) `:hover`
b) `:focus`
c) `:target`
d) `:enabled`

**Answer: b) `:focus`**

---

**10. For unvisited hyperlinks, which pseudo-class is commonly styled?**

a) `:link`
b) `:visited` only
c) `:href`
d) `:unvisited`

**Answer: a) `:link`**

---

**11. Which pseudo-class selects an element that is the first child of its parent?**

a) `:first-of-type`
b) `:first-child`
c) `:nth-child(0)`
d) `:root-child`

**Answer: b) `:first-child`**

---

**12. Which pseudo-class selects an element that is the last child of its parent?**

a) `:last-of-type`
b) `:last-child`
c) `:end-child`
d) `:final`

**Answer: b) `:last-child`**

---

**13. What does `li:nth-child(2n)` typically select?**

a) Only the second list item
b) Every odd-positioned child among all element types
c) Every even-positioned child among siblings (2nd, 4th, …)
d) Invalid syntax

**Answer: c) Every even-positioned child among siblings (2nd, 4th, …)**

---

**14. Which inserts generated content before an element’s content?**

a) `::after`
b) `::before`
c) `::first-line`
d) `:before` only (never double colon)

**Answer: b) `::before`**

---

**15. Which pseudo-element styles the first line of a block?**

a) `::first-letter`
b) `::first-line`
c) `:line(1)`
d) `::line-first`

**Answer: b) `::first-line`**

---

**16. Which pseudo-element styles the first letter of the first line?**

a) `::first-line`
b) `::first-letter`
c) `::initial-letter` (standard everywhere)
d) `:letter(1)`

**Answer: b) `::first-letter`**

---

**17. In specificity, what weighs more: one class or one element selector?**

a) Equal
b) One class beats one element
c) One element beats one class
d) Specificity does not apply to classes

**Answer: b) One class beats one element**

---

**18. What is the effect of `!important` on a declaration in the cascade?**

a) It is ignored by browsers
b) It increases priority in the origin and importance layer of the cascade
c) It only works for colors
d) It disables inheritance

**Answer: b) It increases priority in the origin and importance layer of the cascade**

---

**19. Which property is typically inherited by default?**

a) `margin`
b) `border`
c) `color`
d) `width`

**Answer: c) `color`**

---

**20. When two rules have equal specificity, which wins?**

a) The one that appears first in the stylesheet
b) The one that appears later in the cascade
c) External styles always win
d) Inline always loses

**Answer: b) The one that appears later in the cascade**

---

**21. Which property sets the bullet style for lists?**

a) `list-type`
b) `list-style-type`
c) `marker-style`
d) `bullet`

**Answer: b) `list-style-type`**

---

**22. What does `list-style-position: inside` do?**

a) Hides markers
b) Places the marker inside the principal box of the list item
c) Only works on `ol`
d) Aligns text to the right

**Answer: b) Places the marker inside the principal box of the list item**

---

**23. Which declaration rounds element corners?**

a) `corner-radius: 4px`
b) `border-radius: 4px`
c) `radius: 4px`
d) `round: 4px`

**Answer: b) `border-radius: 4px`**

---

**24. Which `border-style` value draws a series of short square-ended dashes?**

a) `dotted`
b) `dashed`
c) `solid`
d) `groove`

**Answer: b) `dashed`**

---

**25. What does `overflow: hidden` do to overflowing content?**

a) Always adds scrollbars
b) Clips content that overflows the padding edge (typical painting)
c) Expands the box to fit content
d) Moves content to a new line only

**Answer: b) Clips content that overflows the padding edge (typical painting)**

---

**26. How does `visibility: hidden` differ from `display: none`?**

a) No difference
b) `hidden` hides visually but often preserves layout box; `none` removes from layout
c) `hidden` removes from layout; `none` only hides paint
d) Both remove from accessibility tree always the same way

**Answer: b) `hidden` hides visually but often preserves layout box; `none` removes from layout**

---

**27. What does `opacity: 0` do?**

a) Removes the element from layout
b) Makes the element fully transparent but it can still receive events depending on context
c) Same as `visibility: hidden` in every way
d) Invalid on images

**Answer: b) Makes the element fully transparent but it can still receive events depending on context**

---

**28. Which property changes the mouse pointer over an element?**

a) `pointer`
b) `cursor`
c) `mouse`
d) `caret`

**Answer: b) `cursor`**

---

**29. Outline differs from border primarily in that:**

a) Outline always affects layout size
b) Outline typically does not take up layout space and may not follow `border-radius` the same way
c) Border cannot be styled
d) Outline replaces border in all cases

**Answer: b) Outline typically does not take up layout space and may not follow `border-radius` the same way**

---

**30. Which limits how wide an element can grow?**

a) `min-width`
b) `max-width`
c) `width-limit`
d) `clamp-width`

**Answer: b) `max-width`**

---

**31. What does `box-sizing: border-box` do?**

a) Excludes padding and border from `width`
b) Includes padding and border in the specified `width` and `height`
c) Removes the border
d) Forces `display: block`

**Answer: b) Includes padding and border in the specified `width` and `height`**

---

**32. What is a common effect of `float: left` on a block?**

a) The element is removed from flow entirely like `display:none`
b) The element is shifted left and following content may wrap around it
c) Text cannot wrap floats
d) It only affects inline elements

**Answer: b) The element is shifted left and following content may wrap around it**

---

**33. Which property clears floats on following block formatting?**

a) `float: clear`
b) `clear`
c) `overflow: float`
d) `z-index: clear`

**Answer: b) `clear`**

---

**34. What does `white-space: nowrap` do?**

a) Collapses all whitespace to nothing
b) Prevents wrapping to a new line inside the element
c) Preserves newlines only
d) Hides overflow text

**Answer: b) Prevents wrapping to a new line inside the element**

---

**35. Which property adds an ellipsis when text overflows a single line (with common companion properties)?**

a) `text-overflow: ellipsis`
b) `overflow-text: dots`
c) `ellipsis: true`
d) `font-overflow: clip`

**Answer: a) `text-overflow: ellipsis`**

---

**36. Which value allows long unbroken strings to break and wrap?**

a) `word-wrap: nowrap` (valid)
b) `overflow-wrap: break-word`
c) `word-break: keep-all` always
d) `hyphens: none` only

**Answer: b) `overflow-wrap: break-word`**

---

**37. Given this CSS, what is the specificity of the selector?**

```css
div.container #main p.intro { }
```

a) `0,1,1,3` (IDs, classes, elements) style count
b) One ID, two classes, two elements — beats a single class rule
c) Same as `.intro` only
d) Invalid selector

**Answer: b) One ID, two classes, two elements — beats a single class rule**

---

**38. `:visited` styles apply to:**

a) All links always
b) Links the user has visited (within privacy constraints)
c) Only buttons
d) Focused links only

**Answer: b) Links the user has visited (within privacy constraints)**

---

**39. Which selector matches any `a` with an `href` attribute?**

a) `a`
b) `a[href]`
c) `a::href`
d) `a(href)`

**Answer: b) `a[href]`**

---

**40. `::before` content usually requires which property to show anything?**

a) `display: block` only
b) `content`
c) `data-before`
d) `pseudo: on`

**Answer: b) `content`**

---

**41. `min-width: 320px` prevents the used width from going below 320px when:**

a) Always, on every element
b) When other constraints allow — it sets a minimum used width under the layout algorithm
c) Only on flex items
d) Only in print media

**Answer: b) When other constraints allow — it sets a minimum used width under the layout algorithm**

---

**42. Inheritance of `font-family` means:**

a) Children ignore parent font
b) Descendants use the parent’s computed `font-family` unless overridden
c) Only direct text nodes inherit
d) Only works with `@import`

**Answer: b) Descendants use the parent’s computed `font-family` unless overridden**

---

**43. Which combinator is the adjacent sibling combinator?**

a) `~`
b) `+`
c) `>`
d) `||`

**Answer: b) `+`**

---

**44. `[class^="pre"]` matches `class` values that:**

a) End with `pre`
b) Start with `pre`
c) Contain `pre` anywhere
d) Equal `pre` exactly only

**Answer: b) Start with `pre`**

---

**45. `:focus-visible` is used to:**

a) Replace `:hover` on touch devices only
b) Style focus indicators when the UA determines focus should be visibly indicated
c) Never match keyboard focus
d) Match only mouse focus

**Answer: b) Style focus indicators when the UA determines focus should be visibly indicated**

---

**46. `list-style: none` typically:**

a) Removes list markers
b) Hides the entire list
c) Sets decimal numbering
d) Breaks flex layout

**Answer: a) Removes list markers**

---

**47. Float clearing with `clear: both` on a block:**

a) Positions the element below prior floats on both sides where applicable
b) Removes floats from the document
c) Creates a new stacking context always
d) Is invalid in flex containers for all cases

**Answer: a) Positions the element below prior floats on both sides where applicable**

---

**48. `opacity` applies to:**

a) Only text
b) The whole element including descendants as a group (creates a stacking context)
c) Borders only
d) Cannot be animated

**Answer: b) The whole element including descendants as a group (creates a stacking context)**

---

**49. Which pairs with `text-overflow: ellipsis` for single-line clipping in common patterns?**

a) `white-space: nowrap` and `overflow: hidden`
b) `display: flex` only
c) `height: 1px`
d) `word-break: break-all` only

**Answer: a) `white-space: nowrap` and `overflow: hidden`**

---

**50. Specificity of inline `style=""` compared to a class in a stylesheet:**

a) Class always wins
b) Inline style declaration usually wins if importance and layer are equal
c) They never conflict
d) `!important` on class always loses to normal inline

**Answer: b) Inline style declaration usually wins if importance and layer are equal**

---
