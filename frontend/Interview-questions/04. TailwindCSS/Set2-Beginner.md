# Tailwind CSS v4 MCQ - Set 2 (Beginner Level)

**1. Which variant applies styles while the pointer is over an element (when hover is supported)?**

a) `pointer:`
b) `hover:`
c) `over:`
d) `hvr:`

**Answer: b) `hover:`**

---

**2. Which variant targets an element when it receives keyboard focus?**

a) `active:`
b) `focus:`
c) `tabbed:`
d) `kbd:`

**Answer: b) `focus:`**

---

**3. Which variant applies while a control is being activated (e.g. mouse button held on a button)?**

a) `pressed:`
b) `active:`
c) `down:`
d) `click:`

**Answer: b) `active:`**

---

**4. Which variant is tailored for focus states that should be obvious to keyboard users (often showing rings)?**

a) `focus:`
b) `focus-visible:`
c) `focus-only:`
d) `visible-focus:`

**Answer: b) `focus-visible:`**

---

**5. Which variant styles a parent when **any** descendant matches `:focus`?**

a) `focus-within:`
b) `focus-descendant:`
c) `child-focus:`
d) `has-focus:`

**Answer: a) `focus-within:`**

---

**6. Which variant targets disabled form controls?**

a) `inactive:`
b) `disabled:`
c) `readonly:`
d) `off:`

**Answer: b) `disabled:`**

---

**7. Which variant applies to visited links?**

a) `seen:`
b) `visited:`
c) `clicked:`
d) `history:`

**Answer: b) `visited:`**

---

**8. In v4, which variant inverts a selector (applies when a condition is **not** met)?**

a) `without:`
b) `not-*`
c) `except:`
d) `exclude:`

**Answer: b) `not-*`**

---

**9. Which variant targets elements marked with the `inert` attribute?**

a) `static:`
b) `inert:`
c) `frozen:`
d) `locked:`

**Answer: b) `inert:`**

---

**10. v4 includes built-in support for `@starting-style` transitions. Conceptually, what does that enable?**

a) `Animating properties on the first frame when an element is newly rendered or displayed`
b) `Disabling all transitions globally`
c) `Forcing reduced motion for every user`
d) `Replacing the need for any CSS keyframes`

**Answer: a) `Animating properties on the first frame when an element is newly rendered or displayed`**

---

**11. Which class creates a grid layout on a container?**

a) `flex`
b) `grid`
c) `table`
d) `columns`

**Answer: b) `grid`**

---

**12. Which utility creates a 12-column grid template?**

a) `grid-cols-12`
b) `cols-12`
c) `twelve-cols`
d) `grid-12`

**Answer: a) `grid-cols-12`**

---

**13. In this grid, how many columns does the middle item span?**

```html
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-1">A</div>
  <div class="col-span-2">B</div>
</div>
```

a) `1 column`
b) `2 columns`
c) `3 columns`
d) `It breaks the grid`

**Answer: b) `2 columns`**

---

**14. Which utility defines three equal rows in a grid?**

a) `grid-rows-3`
b) `rows-3`
c) `grid-template-rows-3`
d) `row-3`

**Answer: a) `grid-rows-3`**

---

**15. Which class makes a grid item span two rows?**

a) `row-span-2`
b) `rows-span-2`
c) `grid-row-2`
d) `span-rows-2`

**Answer: a) `row-span-2`**

---

**16. Which positioning value keeps the element in normal flow but allows offsets?**

a) `absolute`
b) `relative`
c) `fixed`
d) `static`

**Answer: b) `relative`**

---

**17. Which positioning removes the element from normal flow and positions it against the nearest positioned ancestor?**

a) `sticky`
b) `absolute`
c) `relative`
d) `fixed, which typically anchors to the viewport`

**Answer: b) `absolute`**

---

**18. Which utility sets `top`, `right`, `bottom`, and `left` to `0` on a positioned element?**

a) `inset-0`
b) `offset-0`
c) `place-0`
d) `zero-inset`

**Answer: a) `inset-0`**

---

**19. For an absolutely positioned element, what does `left-0` do?**

a) `Adds left margin in the spacing scale`
b) `Offsets the element’s left edge to 0 from its positioning context’s left`
c) `Floats the element left`
d) `Aligns text to the left`

**Answer: b) `Offsets the element’s left edge to 0 from its positioning context’s left`**

---

**20. Which z-index utility is highest among these defaults?**

a) `z-10`
b) `z-20`
c) `z-30`
d) `z-50`

**Answer: d) `z-50`**

---

**21. Which position value sticks an element when scrolling until a threshold, then fixes it within its ancestor?**

a) `fixed`
b) `sticky`
c) `absolute`
d) `relative`

**Answer: b) `sticky`**

---

**22. Which overflow utility clips content that exceeds the box without scrollbars?**

a) `overflow-auto`
b) `overflow-hidden`
c) `overflow-scroll`
d) `overflow-visible`

**Answer: b) `overflow-hidden`**

---

**23. Which utility shows scrollbars only when needed?**

a) `overflow-scroll`
b) `overflow-auto`
c) `overflow-always`
d) `overflow-if`

**Answer: b) `overflow-auto`**

---

**24. Which class enables horizontal scrolling inside a child while keeping vertical overflow unchanged?**

a) `overflow-y-auto`
b) `overflow-x-auto`
c) `scroll-x`
d) `x-scroll`

**Answer: b) `overflow-x-auto`**

---

**25. What do `opacity-0`, `opacity-50`, and `opacity-100` primarily control?**

a) `Only border opacity`
b) `The element’s overall opacity (including descendants’ painted result in normal cases)`
c) `Z-index stacking only`
d) `Font weight`

**Answer: b) `The element’s overall opacity (including descendants’ painted result in normal cases)`**

---

**26. Which shadow utility is heavier than `shadow-md` in the default scale?**

a) `shadow-sm`
b) `shadow`
c) `shadow-lg`
d) `shadow-none`

**Answer: c) `shadow-lg`**

---

**27. Which class removes box shadow entirely?**

a) `shadow-0`
b) `shadow-none`
c) `no-shadow`
d) `shadow-hidden`

**Answer: b) `shadow-none`**

---

**28. Which combination adds a 2px focus-style ring in blue from the palette?**

a) `ring-2 ring-blue-500`
b) `border-2 border-blue-500`
c) `outline-2 outline-blue-500`
d) `shadow-2 shadow-blue-500`

**Answer: a) `ring-2 ring-blue-500`**

---

**29. What does `ring-offset-2` typically do visually?**

a) `Thickens the ring width only`
b) `Creates a gap between the element edge and the ring using an offset`
c) `Removes the ring`
d) `Changes ring color to offset gray`

**Answer: b) `Creates a gap between the element edge and the ring using an offset`**

---

**30. Which transition utility limits animated properties to colors (e.g. text and background)?**

a) `transition-all`
b) `transition-colors`
c) `transition-opacity`
d) `transition-fast`

**Answer: b) `transition-colors`**

---

**31. Which duration utility sets a 300ms transition time?**

a) `duration-200`
b) `duration-300`
c) `duration-350`
d) `duration-400`

**Answer: b) `duration-300`**

---

**32. Which easing utility applies symmetric acceleration and deceleration?**

a) `ease-in`
b) `ease-out`
c) `ease-in-out`
d) `ease-linear`

**Answer: c) `ease-in-out`**

---

**33. What does `scale-110` do on transform?**

a) `Rotates 110 degrees`
b) `Scales the element to 110% size`
c) `Skews 110%`
d) `Translates 110px`

**Answer: b) `Scales the element to 110% size`**

---

**34. Which class rotates an element 45 degrees around the Z axis (2D rotation)?**

a) `rotate-45`
b) `spin-45`
c) `twist-45`
d) `deg-45`

**Answer: a) `rotate-45`**

---

**35. In this snippet, how is the element shifted?**

```html
<div class="translate-x-4 -translate-y-2">M</div>
```

a) `Right 1rem and up 0.5rem (using spacing scale units)`
b) `Left 1rem and down 0.5rem`
c) `Only vertically`
d) `No movement; invalid combination`

**Answer: a) `Right 1rem and up 0.5rem (using spacing scale units)`**

---

**36. Tailwind CSS v4 adds 3D transform utilities. Which class rotates around the X axis?**

a) `rotate-x-12`
b) `spin-x-12`
c) `3d-rotate-x`
d) `tilt-x-12`

**Answer: a) `rotate-x-12`**

---

**37. Which utility establishes a 3D perspective for children transformed in 3D space?**

a) `perspective-distant`
b) `perspective-near`
c) `Both a and b name built-in perspective utilities in v4`
d) `depth-3d`

**Answer: c) `Both a and b name built-in perspective utilities in v4`**

---

**38. Which `object-*` utility covers the box like `background-size: cover` for replaced elements?**

a) `object-contain`
b) `object-cover`
c) `object-fill`
d) `object-none`

**Answer: b) `object-cover`**

---

**39. Which aspect ratio utility matches a typical widescreen video frame?**

a) `aspect-square`
b) `aspect-video`
c) `aspect-photo`
d) `aspect-cinema`

**Answer: b) `aspect-video`**

---

**40. v4 supports composable variants like `group-*`, `peer-*`, and `has-*`. Which pair creates a “when the group is hovered, change a child” pattern?**

a) `parent-hover: on the child`
b) `Ancestor has group; descendant uses group-hover:`
c) `ancestor-hover: on both elements`
d) `hover-group: on the child`

**Answer: b) `Ancestor has group; descendant uses group-hover:`**

---

**41. For a checkbox followed by a label, which pattern styles the label when the box is checked?**

a) `Peer on the input; label uses peer-checked:`
b) `Group on body; label uses group-checked:`
c) `sibling-checked: on the label`
d) `input:checked as a Tailwind variant prefix`

**Answer: a) `Peer on the input; label uses peer-checked:`**

---

**42. Which utilities add vertical borders between flex/grid children?**

a) `border-y on each child`
b) `divide-y on the parent`
c) `split-y on the parent`
d) `separator-y on each child`

**Answer: b) `divide-y on the parent`**

---

**43. Which divide color utility tints those separator borders gray?**

a) `divide-gray-200`
b) `border-gray-200 on the parent only`
c) `split-gray-200`
d) `line-gray-200`

**Answer: a) `divide-gray-200`**

---

**44. Tailwind includes `list-decimal` for ordered lists. Which utility should you use on a control so the cursor shows a pointer hand?**

a) `list-decimal`
b) `cursor-pointer`
c) `cursor-hand`
d) `peer-hover:`

**Answer: b) `cursor-pointer`**

---

**45. `list-none` removes list markers entirely. For disabled controls, which cursor communicates that interaction is disallowed?**

a) `cursor-pointer`
b) `cursor-not-allowed`
c) `list-none`
d) `cursor-wait`

**Answer: b) `cursor-not-allowed`**

---

**46. Which utility applies decimal numbering for ordered lists (`<ol>`)?**

a) `list-disc`
b) `list-decimal`
c) `list-alpha`
d) `list-roman`

**Answer: b) `list-decimal`**

---

**47. Which pair places disc markers inside the list item’s content box (common for tight layouts)?**

a) `list-outside list-decimal`
b) `list-inside list-disc`
c) `list-none list-inside`
d) `list-disc list-outside`

**Answer: b) `list-inside list-disc`**

---

**48. In Tailwind CSS v4, which directive loads plugins from within your CSS (the CSS-first replacement for wiring plugins through JS config)?**

a) `@utility`
b) `@plugin`
c) `@variant`
d) `@source`

**Answer: b) `@plugin`**

---

**49. In v4 CSS-first configuration, which directive defines a reusable custom utility (whereas `@variant` is used for custom variants and `@plugin` loads plugins)?**

a) `@source`
b) `@utility`
c) `@import`
d) `@theme`

**Answer: b) `@utility`**

---

**50. Container queries use variants like `@min-*`. In this example, what must the parent include?**

```html
<div class="@container">
  <p class="@min-md:text-lg">Resize me</p>
</div>
```

a) `The @container class (or equivalent) on an ancestor establishes the query container`
b) `Only the paragraph needs classes; browsers infer containers`
c) `@import tailwindcss inside the paragraph`
d) `A tailwind.config.js file is mandatory for @min-*`

**Answer: a) `The @container class (or equivalent) on an ancestor establishes the query container`**

---

</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read