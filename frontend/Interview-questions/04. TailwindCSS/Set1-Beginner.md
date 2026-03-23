# Tailwind CSS v4 MCQ - Set 1 (Beginner Level)

**1. What best describes Tailwind CSS’s core approach to styling?**

a) `You write mostly custom CSS classes named after components`
b) `You compose interfaces from small, single-purpose utility classes`
c) `You download a large library of prebuilt React components`
d) `You rely on a grid system with fixed column classes only`

**Answer: b) `You compose interfaces from small, single-purpose utility classes`**

---

**2. Compared to Bootstrap, what is a typical difference in day-to-day styling?**

a) `Bootstrap emphasizes utility classes only; Tailwind ships prebuilt components`
b) `Bootstrap ships opinionated components; Tailwind focuses on composable utilities`
c) `Both require identical HTML structure for every project`
d) `Neither supports responsive breakpoints`

**Answer: b) `Bootstrap ships opinionated components; Tailwind focuses on composable utilities`**

---

**3. In Tailwind CSS v4, which PostCSS plugin package should you use in a PostCSS pipeline?**

a) `tailwindcss/postcss`
b) `@tailwindcss/postcss`
c) `postcss-tailwind`
d) `@tailwind/postcss-plugin`

**Answer: b) `@tailwindcss/postcss`**

---

**4. For a Vite project using Tailwind CSS v4, which official plugin package integrates Tailwind into the bundler?**

a) `vite-plugin-windicss`
b) `@tailwindcss/vite`
c) `@vitejs/plugin-tailwind`
d) `tailwind-vite-bridge`

**Answer: b) `@tailwindcss/vite`**

---

**5. Which package provides the official Tailwind CSS v4 command-line interface?**

a) `@tailwindcss/cli`
b) `tailwind-cli`
c) `tw-cli`
d) `@tailwind/cli-tools`

**Answer: a) `@tailwindcss/cli`**

---

**6. What is the correct v4 entry pattern in your main CSS file?**

```css
/* main.css */
```

a) `@tailwind base; @tailwind components; @tailwind utilities;`
b) `@import "tailwindcss";`
c) `@use "tailwind";`
d) `@include tailwind(all);`

**Answer: b) `@import "tailwindcss";`**

---

**7. By default in v4, how is project configuration typically handled compared to v3’s `tailwind.config.js`?**

a) `v4 requires a larger tailwind.config.cjs file`
b) `v4 is CSS-first by default—no tailwind.config.js is required`
c) `v4 removes all customization options`
d) `v4 only works with inline JSON in HTML`

**Answer: b) `v4 is CSS-first by default—no tailwind.config.js is required`**

---

**8. In v4, which CSS directive is used to define design tokens (similar in spirit to `theme.extend` in older config files)?**

a) `@tokens`
b) `@theme`
c) `@config`
d) `@extend-theme`

**Answer: b) `@theme`**

---

**9. Tailwind CSS v4 automatically detects class usage in your source files. What directive can you add in CSS when you need to register extra content paths?**

a) `@content`
b) `@source`
c) `@scan`
d) `@paths`

**Answer: b) `@source`**

---

**10. Design tokens in v4 are exposed as CSS custom properties. Which variable name matches Tailwind’s blue 500 color token?**

a) `--blue-500`
b) `--color-blue-500`
c) `--tailwind-blue-500`
d) `--tw-color-blue500`

**Answer: b) `--color-blue-500`**

---

**11. What does `p-4` apply, assuming the default spacing scale?**

a) `Padding on left and right only`
b) `Padding on all sides using the spacing scale (e.g. tied to --spacing-4)`
c) `Only padding-top`
d) `Percentage padding based on viewport width`

**Answer: b) `Padding on all sides using the spacing scale (e.g. tied to --spacing-4)`**

---

**12. In this markup, what is the effect of `-m-2`?**

```html
<div class="-m-2">Box</div>
```

a) `Negative margin on all sides using the spacing scale`
b) `Margin removed entirely`
c) `Only margin-top becomes negative`
d) `Invalid class; Tailwind ignores it`

**Answer: a) `Negative margin on all sides using the spacing scale`**

---

**13. Which utility adds horizontal spacing between **direct child** elements?**

a) `gap-x-4`
b) `space-x-4`
c) `divide-x-4`
d) `px-4`

**Answer: b) `space-x-4`**

---

**14. For a vertical stack of siblings, which class adds vertical spacing between children?**

a) `space-y-6`
b) `gap-y-6` on the parent without flex/grid
c) `my-6 on each child automatically`
d) `stack-gap-6`

**Answer: a) `space-y-6`**

---

**15. In a flex container, what does `gap-4` control?**

a) `Only the gap between text lines`
b) `The gap between flex items along both row and column according to flex direction/wrap`
c) `The page’s global gutter outside the flex container`
d) `Border width between cells in a table only`

**Answer: b) `The gap between flex items along both row and column according to flex direction/wrap`**

---

**16. Which class makes an element span the full width of its containing block?**

a) `w-screen`
b) `w-full`
c) `w-max`
d) `w-auto`

**Answer: b) `w-full`**

---

**17. Which height utility typically makes an element as tall as the viewport?**

a) `h-full`
b) `h-screen`
c) `h-dvh`
d) `Both b and c are common viewport-height utilities in modern Tailwind usage`

**Answer: d) `Both b and c are common viewport-height utilities in modern Tailwind usage`**

---

**18. What does `min-w-0` often help fix in flex/grid layouts?**

a) `It forces the element to disappear`
b) `It allows flex items to shrink below their intrinsic content width`
c) `It sets minimum width to the viewport`
d) `It disables responsive behavior`

**Answer: b) `It allows flex items to shrink below their intrinsic content width`**

---

**19. Which class caps an element’s width near a comfortable reading measure on large screens?**

a) `max-w-screen`
b) `max-w-prose`
c) `max-w-full`
d) `max-w-min`

**Answer: b) `max-w-prose`**

---

**20. What does `size-10` set?**

a) `Only width: 2.5rem`
b) `Equal width and height using the spacing scale (e.g. 2.5rem each)`
c) `Font size only`
d) `Border size only`

**Answer: b) `Equal width and height using the spacing scale (e.g. 2.5rem each)`**

---

**21. Which text size utility sits between `text-sm` and `text-lg` in the default scale?**

a) `text-md`
b) `text-base`
c) `text-regular`
d) `text-normal`

**Answer: b) `text-base`**

---

**22. Which class sets a semi-bold font weight?**

a) `font-medium`
b) `font-semibold`
c) `font-heavy`
d) `font-thick`

**Answer: b) `font-semibold`**

---

**23. Which utility increases line height for more airy paragraph text?**

a) `leading-none`
b) `leading-tight`
c) `leading-relaxed`
d) `leading-0`

**Answer: c) `leading-relaxed`**

---

**24. What does `tracking-wider` adjust?**

a) `Word spacing only`
b) `Letter spacing (tracking)`
c) `Line length in characters`
d) `Paragraph indentation`

**Answer: b) `Letter spacing (tracking)`**

---

**25. Which class centers inline content horizontally inside a block?**

a) `align-center`
b) `text-center`
c) `justify-center` (without flex on the same element)
d) `center-text`

**Answer: b) `text-center`**

---

**26. Tailwind v4 uses OKLCH as its default color space for palettes. What is a valid text color utility?**

a) `text-red-500`
b) `text-red-rgb`
c) `text-oklch-only`
d) `color-red-500`

**Answer: a) `text-red-500`**

---

**27. In this snippet, what does the `/80` suffix mean?**

```html
<p class="text-white/80">Muted</p>
```

a) `It sets width to 80%`
b) `It applies 80% opacity to the color`
c) `It sets z-index to 80`
d) `It is invalid in Tailwind v4`

**Answer: b) `It applies 80% opacity to the color`**

---

**28. Default palette shades run from 50 to 950. Which shade is generally the lightest?**

a) `950`
b) `50`
c) `100`
d) `0`

**Answer: b) `50`**

---

**29. Which class adds a 2px border width on all sides?**

a) `border-wide`
b) `border-2`
c) `border-double`
d) `border-thick`

**Answer: b) `border-2`**

---

**30. How do you give a border a red color from the default palette?**

a) `border-color-red-500`
b) `border-red-500`
c) `outline-red-500`
d) `stroke-red-500`

**Answer: b) `border-red-500`**

---

**31. Border radius in v4 can be tied to scale variables like `--radius`. Which class applies a large rounded corner preset?**

a) `rounded-lg`
b) `radius-large`
c) `corner-lg`
d) `round-big`

**Answer: a) `rounded-lg`**

---

**32. Which class makes an element a perfect circle (or pill for non-square elements)?**

a) `rounded-md`
b) `rounded-full`
c) `rounded-pill`
d) `circle`

**Answer: b) `rounded-full`**

---

**33. Which display value creates a flex formatting context?**

a) `grid`
b) `flex`
c) `block`
d) `table`

**Answer: b) `flex`**

---

**34. Which class removes an element from the layout flow entirely (including visually)?**

a) `invisible`
b) `hidden`
c) `opacity-0`
d) `sr-only`

**Answer: b) `hidden`**

---

**35. Which display combines inline behavior with flex item layout for children?**

a) `inline-block`
b) `inline-flex`
c) `inline-grid`
d) `flex-inline`

**Answer: b) `inline-flex`**

---

**36. Which background utility scales the image to cover the entire box while preserving aspect ratio?**

a) `bg-contain`
b) `bg-cover`
c) `bg-fill`
d) `bg-stretch`

**Answer: b) `bg-cover`**

---

**37. Which class pins the background relative to the viewport so it does not scroll with content?**

a) `bg-local`
b) `bg-scroll`
c) `bg-fixed`
d) `bg-sticky`

**Answer: c) `bg-fixed`**

---

**38. Which flex direction stacks items vertically?**

a) `flex-row`
b) `flex-col`
c) `flex-stack`
d) `flex-vertical`

**Answer: b) `flex-col`**

---

**39. In this flex row, how are items spaced along the main axis?**

```html
<div class="flex flex-row justify-between items-center">
  <span>A</span><span>B</span><span>C</span>
</div>
```

a) `Packed to the start`
b) `Even space between items; first at start, last at end`
c) `Centered as a group with equal gaps on both outer sides`
d) `Stacked vertically`

**Answer: b) `Even space between items; first at start, last at end`**

---

**40. Which pair aligns flex items to the start of the cross axis?**

a) `items-center`
b) `items-start`
c) `items-stretch`
d) `items-baseline`

**Answer: b) `items-start`**

---

**41. Tailwind’s responsive prefixes follow which general philosophy?**

a) `Desktop-first: unprefixed styles apply to large screens only`
b) `Mobile-first: unprefixed styles apply to small screens, larger breakpoints add overrides`
c) `Random breakpoints with no order`
d) `Print-first`

**Answer: b) `Mobile-first: unprefixed styles apply to small screens, larger breakpoints add overrides`**

---

**42. At which breakpoint does `md:text-xl` begin to apply (conceptually)?**

a) `Only on screens smaller than phones`
b) `At the medium breakpoint and up`
c) `Only in dark mode`
d) `Only when printing`

**Answer: b) `At the medium breakpoint and up`**

---

**43. Which prefix targets extra-large screens in the default scale?**

a) `lg:`
b) `xl:`
c) `xxl:`
d) `wide:`

**Answer: b) `xl:`**

---

**44. Which prefix targets the largest default breakpoint tier?**

a) `3xl:`
b) `2xl:`
c) `max-xl:`
d) `ultra:`

**Answer: b) `2xl:`**

---

**45. Spacing utilities map to the shared spacing scale, often reflected in variables like `--spacing-*`. What does `m-4` use conceptually?**

a) `A one-off pixel value unrelated to the scale`
b) `The same spacing scale step as p-4 and gap-4 at that step`
c) `Only margin-left`
d) `Viewport-based margin only`

**Answer: b) `The same spacing scale step as p-4 and gap-4 at that step`**

---

**46. Font families can be customized via theme tokens such as `--font-*`. Which utility applies a sans-serif stack from the default theme?**

a) `font-serif`
b) `font-sans`
c) `font-default`
d) `text-sans`

**Answer: b) `font-sans`**

---

**47. v4 organizes utilities using native CSS cascade layers for base, components, and utilities. What is the main benefit for authors?**

a) `It removes the need for any CSS file`
b) `It gives predictable ordering between resets, component layers, and utilities`
c) `It disables the main tailwindcss import entirely`
d) `It only works with Sass`

**Answer: b) `It gives predictable ordering between resets, component layers, and utilities`**

---

**48. Newer gradient APIs in v4 support angled linear gradients. Which class represents a 45° linear gradient background?**

a) `bg-gradient-45`
b) `bg-linear-45`
c) `from-linear-45`
d) `linear-bg-45`

**Answer: b) `bg-linear-45`**

---

**49. Which utility lets a form control grow vertically with its content (useful for textareas)?**

a) `resize-y`
b) `field-sizing-content`
c) `h-auto-only`
d) `overflow-text`

**Answer: b) `field-sizing-content`**

---

**50. Container queries are built into v4. What must you typically add on an ancestor to use `@min-*` / `@max-*` container variants on descendants?**

a) `The @container class on the ancestor`
b) `container-type-normal on the body only`
c) `data-container on every child`
d) `cq:wrapper on the html element`

**Answer: a) `The @container class on the ancestor`**

---
