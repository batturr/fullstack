# Tailwind CSS v4 MCQ - Set 3 (Intermediate Level)

**1. In Tailwind CSS v4, what is the default way to pull Tailwind into your stylesheet?**

a) `@tailwind base;` `@tailwind components;` `@tailwind utilities;`  
b) `@import "tailwindcss";`  
c) `require('tailwindcss')` in `postcss.config.js` only  
d) A mandatory `tailwind.config.js` with `content` and `theme`

**Answer: b) `@import "tailwindcss";`**

---

**2. Where do you primarily define design tokens like brand colors in Tailwind v4’s CSS-first setup?**

a) Only in `tailwind.config.js` under `theme.extend`  
b) In JavaScript `theme()` callbacks  
c) Using the `@theme` directive in CSS  
d) In `package.json` under `"tailwind"`

**Answer: c) Using the `@theme` directive in CSS**

---

**3. Which snippet correctly adds a custom color token `brand` in v4?**

```css
@theme {
  --color-brand: #0ea5e9;
}
```

a) `@theme { color-brand: #0ea5e9; }`  
b) `@theme { --color-brand: #0ea5e9; }`  
c) `@import theme { brand: #0ea5e9 };`  
d) `@config { colors: { brand: '#0ea5e9' } }`

**Answer: b) `@theme { --color-brand: #0ea5e9; }`**

---

**4. What does `@theme inline` do compared to a regular `@theme` block?**

a) It deletes all default Tailwind tokens  
b) It inlines theme values so they resolve directly as custom properties without extra indirection  
c) It disables dark mode  
d) It replaces `@import "tailwindcss"`

**Answer: b) It inlines theme values so they resolve directly as custom properties without extra indirection**

---

**5. After defining `--spacing-18: 4.5rem` in `@theme`, which class uses that token?**

a) `gap-18`  
b) `spacing-18`  
c) `m-spacing-18`  
d) `space-18`

**Answer: a) `gap-18`**

---

**6. Custom font families in v4 are exposed as which CSS variable pattern?**

a) `--family-display`  
b) `--font-display`  
c) `--typography-display`  
d) `--text-display`

**Answer: b) `--font-display`**

---

**7. How do you define a custom breakpoint `3xl` at `120rem` in v4?**

```css
@theme {
  --breakpoint-3xl: 120rem;
}
```

a) `--screen-3xl: 120rem`  
b) `--breakpoint-3xl: 120rem`  
c) `--mq-3xl: 120rem`  
d) `@media-3xl: 120rem`

**Answer: b) `--breakpoint-3xl: 120rem`**

---

**8. Radius tokens use which prefix in the theme?**

a) `--radius-*`  
b) `--corner-*`  
c) `--rounded-*`  
d) `--border-radius-*`

**Answer: a) `--radius-*`**

---

**9. What is the role of the `--spacing` base variable in v4?**

a) It sets the default font size  
b) It scales the spacing scale so utilities like `p-4` derive from it  
c) It controls z-index only  
d) It replaces OKLCH entirely

**Answer: b) It scales the spacing scale so utilities like `p-4` derive from it**

---

**10. Which directive creates a new utility class from CSS in v4?**

a) `@apply`  
b) `@utility`  
c) `@layer utilities` only  
d) `@tailwind utility`

**Answer: b) `@utility`**

---

**11. Which block defines a custom utility `tab-4` for tab-size?**

```css
@utility tab-4 {
  tab-size: 4;
}
```

a) `@variant tab-4 { tab-size: 4; }`  
b) `@plugin tab-4 { tab-size: 4; }`  
c) `@utility tab-4 { tab-size: 4; }`  
d) `@theme tab-4 { tab-size: 4; }`

**Answer: c) `@utility tab-4 { tab-size: 4; }`**

---

**12. Which directive registers a custom variant such as `theme-midnight:`?**

a) `@plugin`  
b) `@source`  
c) `@variant`  
d) `@utility`**

**Answer: c) `@variant`**

---

**13. How do you load the official typography plugin from CSS in v4?**

a) `plugins: [require('@tailwindcss/typography')]` in `tailwind.config.js` only  
b) `@plugin "@tailwindcss/typography";`  
c) `@import typography`  
d) `npm install tailwind-typography` without CSS

**Answer: b) `@plugin "@tailwindcss/typography";`**

---

**14. What is `@source` used for in v4?**

a) Defining color sources in OKLCH  
b) Adding extra paths for Tailwind’s automatic content detection  
c) Importing Google Fonts  
d) Enabling SSR

**Answer: b) Adding extra paths for Tailwind’s automatic content detection**

---

**15. By default in v4, how does Tailwind discover class names in your project?**

a) You must list every file in `tailwind.config.js` `content`  
b) Automatic content detection scans your project; `@source` augments paths  
c) Only files named `*.tw.css`  
d) Only inline styles in HTML

**Answer: b) Automatic content detection scans your project; `@source` augments paths**

---

**16. Which class applies a width of exactly 137 pixels using arbitrary syntax?**

a) `w-137px`  
b) `w-[137px]`  
c) `width-[137]`  
d) `arbitrary-w-137`

**Answer: b) `w-[137px]`**

---

**17. Which class sets an arbitrary background color `#1a1a1a`?**

a) `bg-hex-1a1a1a`  
b) `bg-[#1a1a1a]`  
c) `bg-color-[1a1a1a]`  
d) `bg-arbitrary-1a1a1a`

**Answer: b) `bg-[#1a1a1a]`**

---

**18. Which class uses `clamp()` for fluid font size?**

a) `text-fluid`  
b) `text-[clamp(1rem,3vw,2rem)]`  
c) `clamp-text-3`  
d) `text-size-[1rem-3vw-2rem]`

**Answer: b) `text-[clamp(1rem,3vw,2rem)]`**

---

**19. How do you set an arbitrary CSS property like `mask-type: luminance`?**

a) `mask-luminance`  
b) `[mask-type:luminance]`  
c) `arbitrary-mask:luminance`  
d) `utility-mask-luminance`

**Answer: b) `[mask-type:luminance]`**

---

**20. Which class forces `color: var(--color-red-500)` to win with the important modifier?**

a) `important-text-red-500`  
b) `!text-red-500`  
c) `text-red-500!`  
d) `priority-text-red-500`

**Answer: b) `!text-red-500`**

---

**21. How does `dark:` behave by default in Tailwind v4?**

a) It always requires a `.dark` class on `<html>`  
b) It uses `prefers-color-scheme: dark` unless you configure a selector strategy  
c) It is disabled until you add `darkMode: 'class'` in `tailwind.config.js`  
d) It only works with `@media print`

**Answer: b) It uses `prefers-color-scheme: dark` unless you configure a selector strategy**

---

**22. Which pattern switches dark mode to a class-based strategy using `@variant`?**

```css
@variant dark (&:where(.dark, .dark *));
```

a) `@dark class .dark;`  
b) `@variant dark (&:where(.dark, .dark *));`  
c) `@theme dark { selector: '.dark'; }`  
d) `@plugin darkMode 'class';`

**Answer: b) `@variant dark (&:where(.dark, .dark *));`**

---

**23. On which element do you typically add `@container` to enable container queries for descendants?**

a) The `<body>` only  
b) Any ancestor you want to measure; often a card or layout wrapper  
c) Only `<main>`  
d) Only elements with `position: fixed`

**Answer: b) Any ancestor you want to measure; often a card or layout wrapper**

---

**24. Which variant applies styles when the container is at least the `sm` breakpoint?**

a) `@sm:`  
b) `@min-sm:`  
c) `container-sm:`  
d) `cq-sm:`

**Answer: b) `@min-sm:`**

---

**25. Which variant targets a container at most `lg` width?**

a) `@at-most-lg:`  
b) `@max-lg:`  
c) `@lg-down:`  
d) `@container-lg:`

**Answer: b) `@max-lg:`**

---

**26. What does the `not-*` variant do?**

a) Negates a media query or condition (e.g. `not-hover:`)  
b) Removes all styles  
c) Inverts OKLCH chroma only  
d) Disables `@container`

**Answer: a) Negates a media query or condition (e.g. `not-hover:`)**

---

**27. The `in-*` variant matches when:**

a) The element itself has the state  
b) Some ancestor matches the given variant selector  
c) The user is inside an iframe  
d) The color is in P3 gamut

**Answer: b) Some ancestor matches the given variant selector**

---

**28. Composable variants in v4 let you:**

a) Chain variant prefixes like `hover:focus:` on a single class  
b) Only use one variant per element  
c) Replace `@theme`  
d) Avoid cascade layers

**Answer: a) Chain variant prefixes like `hover:focus:` on a single class**

---

**29. Which class applies a left-to-right linear gradient in v4 naming?**

a) `bg-gradient-to-r`  
b) `bg-linear-to-r`  
c) `linear-bg-r`  
d) `gradient-x`**

**Answer: b) `bg-linear-to-r`**

---

**30. Which utilities set gradient color stops?**

a) `start-*` `middle-*` `end-*`  
b) `from-*` `via-*` `to-*`  
c) `color-1-*` `color-2-*`  
d) `stop-a-*` `stop-b-*`**

**Answer: b) `from-*` `via-*` `to-*`**

---

**31. Which class applies a 45° linear gradient using angle syntax?**

a) `bg-linear-45`  
b) `rotate-gradient-45`  
c) `from-45-deg`  
d) `angle-bg-45`

**Answer: a) `bg-linear-45`**

---

**32. After adding `@plugin "@tailwindcss/typography";`, which class styles article prose?**

a) `article`  
b) `prose`  
c) `typography`  
d) `rich-text`

**Answer: b) `prose`**

---

**33. OKLCH as the default color space in v4 primarily helps with:**

a) Faster gzip  
b) Perceptually uniform adjustments and predictable lightness  
c) Removing the need for CSS variables  
d) Disabling dark mode

**Answer: b) Perceptually uniform adjustments and predictable lightness**

---

**34. `@property` rules in v4 are used to:**

a) Declare typed custom properties for smoother transitions and inheritance behavior  
b) Replace `@import "tailwindcss"`  
c) Define React props  
d) Load npm plugins only

**Answer: a) Declare typed custom properties for smoother transitions and inheritance behavior**

---

**35. Native CSS cascade layers in Tailwind v4 mean utilities generally live in:**

a) Unlayered CSS only  
b) Ordered layers such as `theme`, `base`, `components`, `utilities`  
c) Inline styles only  
d) Shadow DOM exclusively

**Answer: b) Ordered layers such as `theme`, `base`, `components`, `utilities`**

---

**36. Why is there often no `tailwind.config.js` by default in new v4 projects?**

a) Tailwind no longer supports configuration  
b) Configuration moves to CSS (`@theme`, `@plugin`, `@source`, etc.)  
c) Config must be in TypeScript only  
d) Webpack forbids config files

**Answer: b) Configuration moves to CSS (`@theme`, `@plugin`, `@source`, etc.)**

---

**37. To reference your theme color `brand` inside custom CSS, you typically use:**

a) `var(--brand)`  
b) `var(--color-brand)`  
c) `theme('colors.brand')` only  
d) `$color-brand`**

**Answer: b) `var(--color-brand)`**

---

**38. Which is true about `theme.extend` from v3 vs v4?**

a) They are identical; `theme.extend` is required  
b) `@theme` replaces extending the JS theme for most tokens  
c) `theme.extend` is the only way to add plugins  
d) `theme.extend` controls container queries

**Answer: b) `@theme` replaces extending the JS theme for most tokens**

---

**39. Spacing utilities like `p-4` map to:**

a) Fixed px values hardcoded in Tailwind only  
b) Derived scale based on `--spacing` and related tokens  
c) Only `rem` with no variables  
d) Container width only

**Answer: b) Derived scale based on `--spacing` and related tokens**

---

**40. Which HTML snippet marks a container and uses a container-query variant?**

```html
<div class="@container">
  <p class="@min-md:text-lg">Responsive to this box</p>
</div>
```

a) `container @md:text-lg` on the same element  
b) `@container` on parent and `@min-md:text-lg` on child  
c) `data-container` attribute only  
d) `@source` on `<p>`

**Answer: b) `@container` on parent and `@min-md:text-lg` on child**

---

**41. `not-disabled:opacity-100` means:**

a) Always full opacity  
b) Full opacity when the element is not `:disabled`  
c) Opacity only when disabled  
d) Opacity only in print

**Answer: b) Full opacity when the element is not `:disabled`**

---

**42. `in-data-[open=true]:block` is useful when:**

a) A descendant should show when an ancestor has `data-open="true"`  
b) The element itself toggles `open`  
c) You use only media queries  
d) OKLCH is disabled

**Answer: a) A descendant should show when an ancestor has `data-open="true"`**

---

**43. 3D transforms in v4 include utilities like:**

a) `rotate-3d-45` only  
b) `rotate-x-*`, `rotate-y-*`, and `perspective-*`  
c) `transform-none` exclusively  
d) `matrix3d()` only via plugins

**Answer: b) `rotate-x-*`, `rotate-y-*`, and `perspective-*`**

---

**44. Which import is invalid for a v4 entry CSS file?**

a) `@import "tailwindcss";`  
b) `@import "tailwindcss/preflight";` (if exposed in your setup)  
c) `@tailwind utilities;` as the sole v4 entry  
d) `@theme { ... }` after import**

**Answer: c) `@tailwind utilities;` as the sole v4 entry**

---

**45. `@plugin` in CSS is closest in purpose to v3’s:**

a) `content` array  
b) `plugins: []` in `tailwind.config.js`  
c) `corePlugins`  
d) `presets` only

**Answer: b) `plugins: []` in `tailwind.config.js`**

---

**46. Arbitrary properties can combine with variants—for example:**

```html
<div class="hover:[outline:2px_solid_var(--color-brand)]">...</div>
```

a) False, arbitrary properties cannot use variants  
b) True, variants can wrap arbitrary property classes  
c) Only `dark:` works  
d) Only in `@apply`

**Answer: b) True, variants can wrap arbitrary property classes**

---

**47. Cascade layers help prevent:**

a) Build-time errors only  
b) Specificity wars where custom CSS accidentally beats utilities  
c) OKLCH parsing  
d) Container queries

**Answer: b) Specificity wars where custom CSS accidentally beats utilities**

---

**48. To add a font token and use it, you might write:**

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

```html
<body class="font-sans">...</body>
```

a) `font-sans` maps from `--font-sans`  
b) You must use `font-[family-name:var(--font-sans)]` always  
c) `--font-sans` is only for `@apply`  
d) `font-sans` is removed in v4

**Answer: a) `font-sans` maps from `--font-sans`**

---

**49. Content detection “automatic” implies you should still:**

a) Never use dynamic class strings Tailwind cannot see  
b) Use `@source` for paths outside normal scans if needed  
c) Always commit `node_modules` for scanning  
d) Disable layers

**Answer: b) Use `@source` for paths outside normal scans if needed**

---

**50. Which statement best describes v4 configuration philosophy?**

a) JS config is mandatory for every token  
b) CSS-first with `@theme`, directives, and CSS variables; optional JS when needed  
c) No CSS variables exist  
d) Only arbitrary values are supported

**Answer: b) CSS-first with `@theme`, directives, and CSS variables; optional JS when needed**

---
