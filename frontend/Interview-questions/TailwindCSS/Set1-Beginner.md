# Tailwind CSS MCQ - Set 1 (Beginner Level)

**1. What is the primary philosophy of Tailwind CSS?**

a) `Component-first: ship prebuilt UI components`
b) `Utility-first: compose UIs with small single-purpose classes`
c) `Semantic-first: name classes after page meaning only`
d) `Inline-style-first: avoid classes entirely`

**Answer: b) `Utility-first: compose UIs with small single-purpose classes`**

---

**2. Which package is typically installed alongside `tailwindcss` for a standard PostCSS build?**

a) `webpack-only`
b) `postcss` and `autoprefixer`
c) `sass` and `less`
d) `babel-core`

**Answer: b) `postcss` and `autoprefixer`**

---

**3. In a Play CDN or quick prototype setup, which HTML attribute is used to configure Tailwind (v3-style CDN usage)?**

a) `data-theme`
b) `tailwind.config` inside a script tag
c) `rel="tailwind"`
d) `vite-plugin-tailwind`

**Answer: b) `tailwind.config` inside a script tag**

---

**4. What does the `content` array in `tailwind.config.js` control?**

a) `Maximum bundle size of JavaScript`
b) `Which files Tailwind scans to decide which utilities to generate`
c) `Blog post markdown paths`
d) `Image asset locations`

**Answer: b) `Which files Tailwind scans to decide which utilities to generate`**

---

**5. In your CSS entry file, which directive pulls in Tailwind’s component layer?**

a) `@import "tailwind/components";`
b) `@tailwind components;`
c) `@use tailwind/components;`
d) `@layer tailwind.components;`

**Answer: b) `@tailwind components;`**

---

**6. What does the utility class `p-4` typically apply?**

a) `padding: 1rem` (using the default spacing scale)
b) `padding: 4px`
c) `padding: 4rem`
d) `position: page-4`

**Answer: a) `padding: 1rem` (using the default spacing scale)**

---

**7. Which class horizontally centers a block-level element with automatic left/right margins?**

a) `mx-center`
b) `m-auto`
c) `center-x`
d) `margin-inline: auto` (not a Tailwind class)

**Answer: b) `m-auto`**

---

**8. What is the purpose of `space-x-4` on a flex container?**

a) `Adds horizontal gap using margin between child elements`
b) `Sets letter-spacing on text`
c) `Adds padding inside each child`
d) `Collapses margins between siblings`

**Answer: a) `Adds horizontal gap using margin between child elements`**

---

**9. What does `w-full` set?**

a) `width: 100%`
b) `width: 100vw` always
c) `max-width: 100%`
d) `width: auto`

**Answer: a) `width: 100%`**

---

**10. Which utility makes an element at least as tall as the viewport?**

a) `h-screen`
b) `h-full`
c) `min-h-dvh` only
d) `height: viewport` (invalid)

**Answer: a) `h-screen`**

---

**11. What does `min-w-0` often help fix in flex/grid layouts?**

a) `Forces zero minimum font size`
b) `Allows shrinking below intrinsic content width (overflow behavior)`
c) `Removes borders`
d) `Disables responsive breakpoints`

**Answer: b) `Allows shrinking below intrinsic content width (overflow behavior)`**

---

**12. Which class constrains width to a comfortable reading measure (Tailwind’s prose-like max width)?**

a) `max-w-screen`
b) `max-w-prose`
c) `w-prose`
d) `container-prose`

**Answer: b) `max-w-prose`**

---

**13. What does `text-xl` primarily change?**

a) `Font family`
b) `Font size`
c) `Font weight`
d) `Text transform`

**Answer: b) `Font size`**

---

**14. Which class sets font weight to 700 in the default theme?**

a) `font-medium`
b) `font-bold`
c) `font-black` (900)
d) `weight-700`

**Answer: b) `font-bold`**

---

**15. What does `leading-relaxed` adjust?**

a) `Letter spacing`
b) `Line height`
c) `Word spacing`
d) `Paragraph indentation`

**Answer: b) `Line height`**

---

**16. Which utility increases letter spacing?**

a) `tracking-wide`
b) `leading-wide`
c) `spacing-wide`
d) `kern-wide`

**Answer: a) `tracking-wide`**

---

**17. How do you set text color to a default red at shade 500?**

a) `color-red-500`
b) `text-red-500`
c) `fg-red-500`
d) `font-red-500`

**Answer: b) `text-red-500`**

---

**18. How do you set a light blue background using the default palette at shade 200?**

a) `background-blue-200`
b) `bg-blue-200`
c) `fill-blue-200`
d) `color-bg-blue-200`

**Answer: b) `bg-blue-200`**

---

**19. In Tailwind’s default color system, what does the numeric suffix (e.g. `500`) generally represent?**

a) `Opacity only`
b) `A position on a lightness scale for that hue`
c) `Z-index pairing`
d) `Number of columns in grid`

**Answer: b) `A position on a lightness scale for that hue`**

---

**20. Which class adds a 1px border on all sides (default border style/width as configured)?**

a) `outline`
b) `border`
c) `ring`
d) `stroke`

**Answer: b) `border`**

---

**21. What does `border-2` change compared to default `border` width behavior?**

a) `Border radius`
b) `Border width`
c) `Border color`
d) `Box shadow`

**Answer: b) `Border width`**

---

**22. Which class applies large border radius corners?**

a) `radius-lg`
b) `rounded-lg`
c) `corner-lg`
d) `round-lg`

**Answer: b) `rounded-lg`**

---

**23. Which display value does `inline-block` approximate?**

a) `display: inline-block`
b) `display: block`
c) `display: flex`
d) `display: grid`

**Answer: a) `display: inline-block`**

---

**24. Which class sets `display: flex`?**

a) `flexbox`
b) `flex`
c) `d-flex`
d) `display-flex`

**Answer: b) `flex`**

---

**25. Which class sets `display: grid`?**

a) `grids`
b) `grid`
c) `display-grid`
d) `layout-grid`

**Answer: b) `grid`**

---

**26. What does `hidden` do?**

a) `visibility: hidden` only
b) `display: none`
c) `opacity: 0` only
d) `Removes the node from the DOM`

**Answer: b) `display: none`**

---

**27. Which background sizing utility scales the image to cover the entire box while cropping if needed?**

a) `bg-contain`
b) `bg-cover`
c) `bg-fill`
d) `bg-stretch`

**Answer: b) `bg-cover`**

---

**28. Which utility centers a background image within its box?**

a) `bg-middle`
b) `bg-center`
c) `bg-middle-center`
d) `place-bg-center`

**Answer: b) `bg-center`**

---

**29. Which class prevents a background image from repeating?**

a) `bg-once`
b) `bg-no-repeat`
c) `bg-single`
d) `bg-repeat-none`

**Answer: b) `bg-no-repeat`**

---

**30. Which class sets flex direction to row (default in Tailwind flex utilities)?**

a) `flex-row`
b) `flex-horizontal`
c) `direction-row`
d) `row-flex`

**Answer: a) `flex-row`**

---

**31. Which class stacks flex items vertically?**

a) `flex-vertical`
b) `flex-col`
c) `flex-down`
d) `flex-stack`

**Answer: b) `flex-col`**

---

**32. Which utility distributes flex items with space between them?**

a) `justify-around`
b) `justify-between`
c) `justify-even`
d) `content-between`

**Answer: b) `justify-between`**

---

**33. Which utility vertically centers flex items in a row flex container (cross-axis alignment)?**

a) `items-center`
b) `justify-center`
c) `align-center`
d) `cross-center`

**Answer: a) `items-center`**

---

**34. In modern Tailwind, which is the preferred way to set consistent spacing between flex/grid children?**

a) `gap-4`
b) `space-inner-4`
c) `gutter-4`
d) `split-4`

**Answer: a) `gap-4`**

---

**35. What does the `md:` prefix mean?**

a) `Apply only on print media`
b) `Apply at the `md` breakpoint and above (min-width)`
c) `Apply only below `md``
d) `Apply only in dark mode`

**Answer: b) `Apply at the `md` breakpoint and above (min-width)`**

---

**36. Which breakpoint prefix is the smallest among Tailwind’s default `sm`, `md`, `lg`?**

a) `lg:`
b) `md:`
c) `sm:`
d) `xs:`

**Answer: c) `sm:`**

---

**37. Which default breakpoint prefix targets extra-large screens?**

a) `2xl:`
b) `xl:`
c) `xxl:`
d) `wide:`

**Answer: b) `xl:`**

---

**38. Which prefix targets very large screens in the default scale (after `xl:`)?**

a) `3xl:`
b) `2xl:`
c) `mega:`
d) `ultra:`

**Answer: b) `2xl:`**

---

**39. In Tailwind’s responsive design model, unprefixed utilities apply at which range by default?**

a) `Only at `sm` and up`
b) `All sizes (base), then overridden by larger breakpoints`
c) `Only desktop`
d) `Only mobile portrait`

**Answer: b) `All sizes (base), then overridden by larger breakpoints`**

---

**40. What will this markup do visually on medium screens and up?**

```html
<div class="text-sm md:text-lg">Hi</div>
```

a) `Always `text-lg``
b) `Always `text-sm``
c) `Small text by default; large text from `md` upward`
d) `Large text by default; small from `md` upward`

**Answer: c) `Small text by default; large text from `md` upward`**

---

**41. Which padding utility sets padding on the left and right only?**

a) `py-4`
b) `px-4`
c) `ps-4`
d) `plr-4`

**Answer: b) `px-4`**

---

**42. Which margin utility sets only top margin?**

a) `m-top-4`
b) `mt-4`
c) `my-4`
d) `margin-t-4`

**Answer: b) `mt-4`**

---

**43. What does `text-center` do?**

a) `Centers a block element horizontally`
b) `Sets `text-align: center``
c) `Vertically centers flex children`
d) `Centers the viewport`

**Answer: b) `Sets `text-align: center``**

---

**44. Which class italicizes text?**

a) `font-italic`
b) `italic`
c) `style-italic`
d) `text-italic`

**Answer: b) `italic`**

---

**45. Which class underlines text?**

a) `text-underline`
b) `underline`
c) `decoration-underline`
d) `u-line`

**Answer: b) `underline`**

---

**46. Which border color utility sets a gray border using shade 300?**

a) `border-gray-300`
b) `text-gray-300`
c) `outline-gray-300`
d) `stroke-gray-300`

**Answer: a) `border-gray-300`**

---

**47. Which class allows flex items to wrap to the next line?**

a) `flex-wrap`
b) `flex-multiline`
c) `wrap-flex`
d) `flex-flow-wrap`

**Answer: a) `flex-wrap`**

---

**48. What does `flex-1` commonly mean in Tailwind’s flex shorthand utilities?**

a) `flex: none`
b) `flex: 1 1 0%` (grow/shrink/basis pattern)`
c) `flex-direction: column`
d) `order: 1`

**Answer: b) `flex: 1 1 0%` (grow/shrink/basis pattern)**

---

**49. Which class prevents a flex item from shrinking?**

a) `grow-0`
b) `shrink-0`
c) `flex-none` only
d) `no-shrink`

**Answer: b) `shrink-0`**

---

**50. Which stack adds vertical spacing between direct children?**

a) `space-y-4`
b) `stack-y-4`
c) `gap-y-4` on non-flex parent without grid
d) `divide-y-4` always equals gap

**Answer: a) `space-y-4`**

---
