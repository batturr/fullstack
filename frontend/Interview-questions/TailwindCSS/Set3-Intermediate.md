# Tailwind CSS MCQ - Set 3 (Intermediate Level)

**1. Where should you add new theme tokens without replacing Tailwind’s defaults?**

a) `theme.replace`
b) `theme.extend`
c) `theme.override`
d) `theme.merge`

**Answer: b) `theme.extend`**

---

**2. What does this config fragment accomplish?**

```js
theme: {
  extend: {
    colors: {
      brand: { DEFAULT: '#0ea5e9', dark: '#0369a1' },
    },
  },
},
```

a) `Replaces every Tailwind color with only brand`
b) `Adds custom brand color tokens alongside defaults`
c) `Sets the browser default color`
d) `Disables the color palette`

**Answer: b) `Adds brand color tokens alongside the default palette`**

---

**3. How do you define a custom spacing key `128` in the theme?**

a) `Only by editing node_modules`
b) `Under theme.extend.spacing`
c) `Under content.spacing (wrong place)`
d) `Using @spacing directive`

**Answer: b) `Under theme.extend.spacing`**

---

**4. Where are custom font families typically registered?**

a) `theme.extend.fontFamily`
b) `theme.fonts`
c) `postcss.fontFamily`
d) `@tailwind fonts`

**Answer: a) `theme.extend.fontFamily`**

---

**5. How can you customize default breakpoints?**

a) `Only in HTML`
b) `theme.screens or theme.extend.screens`
c) `vite.config.js only`
d) `Cannot customize`

**Answer: b) `theme.screens or theme.extend.screens`**

---

**6. What is `@apply` used for?**

a) `Import JavaScript modules`
b) `Inline Tailwind utilities into custom CSS rules`
c) `Apply ESLint fixes`
d) `Polyfill CSS`

**Answer: b) `Inline Tailwind utilities into custom CSS rules`**

---

**7. Which `@layer` name is intended for element resets/base styles?**

a) `utilities`
b) `components`
c) `base`
d) `global`

**Answer: c) `base`**

---

**8. Which `@layer` is appropriate for reusable composed classes like `.btn`?**

a) `base`
b) `components`
c) `utilities`
d) `tokens`

**Answer: b) `components`**

---

**9. What is a key constraint of using `@apply` with variants?**

a) `Variants cannot be used with @apply in v3+`
b) `You can @apply variant-prefixed utilities in many setups, but complex ordering can be tricky`
c) `Only hover variants work with @apply`
d) `Requires Sass`

**Answer: b) `Variant-prefixed utilities can be used with care; ordering and source files matter`**

---

**10. What does an arbitrary value like `w-[137px]` do?**

a) `Throws a build error`
b) `Generates width: 137px without adding a permanent theme key`
c) `Sets 137rem width`
d) `Requires a plugin`

**Answer: b) `Generates width: 137px without adding a permanent theme key`**

---

**11. Which arbitrary value syntax sets a custom hex background?**

a) `bg-hex[#1a1a1a]`
b) `bg-[#1a1a1a]`
c) `bg(#1a1a1a)`
d) `background:#1a1a1a` as class name

**Answer: b) `bg-[#1a1a1a]`**

---

**12. Which class uses an arbitrary property to set a custom CSS property?**

a) `prop-[mask-type:luminance]`
b) `[mask-type:luminance]` via arbitrary property form like `[mask-type:luminance]` on element
c) `arbitrary-[mask-type:luminance]`
d) `Not supported`

**Answer: b) `Square-bracket arbitrary property classes like [mask-type:luminance]`**

---

**13. What does the important modifier `!` do in a class like `!mt-4`?**

a) `Marks the class optional`
b) `Adds CSS !important to the generated declaration`
c) `Imports a module`
d) `Disables the utility`

**Answer: b) `Adds !important to the generated declaration`**

---

**14. In Tailwind v3, which `darkMode` strategy uses a class on a root element (e.g. `dark`)?**

a) `media`
b) `class`
c) `prefers`
d) `system`

**Answer: b) `class`**

---

**15. Which strategy uses `prefers-color-scheme` without a manual toggle class?**

a) `class`
b) `media`
c) `auto`
d) `root`

**Answer: b) `media`**

---

**16. How do you style for dark mode when `darkMode: 'class'`?**

a) `night:`
b) `dark:`
c) `theme-dark:`
d) `invert:`

**Answer: b) `dark:`**

---

**17. What does the `container` class do by default?**

a) `Full viewport width always`
b) `Sets a responsive max-width and horizontal centering pattern (plugin/core behavior depends on version)`
c) `Creates CSS container queries automatically everywhere`
d) `Hides overflow`

**Answer: b) `Provides a responsive fixed max-width container pattern (centered with mx-auto typically added separately)`**

---

**18. Where is `container` centering/padding often customized?**

a) `theme.container` / `theme.extend.container` in config
b) `package.json`
c) `Only in HTML`
d) `Cannot customize`

**Answer: a) `theme.container / theme.extend.container in config`**

---

**19. How do you include a first-party plugin in `tailwind.config.js`?**

a) `import only; no config`
b) `plugins: [require('@tailwindcss/typography')]`
c) `plugins: ['typography']` string only
d) `use tailwind/plugin`

**Answer: b) `plugins: [require('@tailwindcss/typography')]`**

---

**20. In a custom plugin, which API registers element resets?**

a) `addUtilities`
b) `addBase`
c) `addComponents`
d) `addReset`

**Answer: b) `addBase`**

---

**21. Which API adds reusable “component-level” rules from a plugin?**

a) `addUtilities`
b) `addComponents`
c) `addLayer`
d) `registerCSS`

**Answer: b) `addComponents`**

---

**22. Which API is used to register new utility classes programmatically?**

a) `addUtilities`
b) `addBase`
c) `addTheme`
d) `pushUtility`

**Answer: a) `addUtilities`**

---

**23. Why must the `content` globs be correct in production?**

a) `So Vite starts faster`
b) `So Tailwind can scan files and tree-shake unused CSS`
c) `So images load`
d) `So TypeScript compiles`

**Answer: b) `So Tailwind can scan files and tree-shake unused CSS`**

---

**24. Which glob is typical for a React app in `content`?**

a) `content: ['./src/**/*.{js,jsx,ts,tsx}']`
b) `content: ['node_modules/**']`
c) `content: ['./public/**']` only
d) `content: []`

**Answer: a) `content: ['./src/**/*.{js,jsx,ts,tsx}']`**

---

**25. Mobile-first in Tailwind means:**

a) `Desktop styles are default; mobile uses max-width queries`
b) `Unprefixed utilities apply everywhere; larger breakpoints add overrides`
c) `Only mobile devices are supported`
d) `You must write raw CSS for desktop`

**Answer: b) `Unprefixed utilities apply everywhere; larger breakpoints add overrides`**

---

**26. Which pattern hides on small screens and shows from the md breakpoint up?**

```html
<div class="hidden md:block">Panel</div>
```

a) `hidden md:block`
b) `block md:hidden`
c) `invisible md:visible` always correct
d) `display-none md:show`

**Answer: a) `hidden md:block`**

---

**27. What is wrong conceptually with putting Tailwind classes only in `.css` files but not listing those files in `content`?**

a) `Nothing`
b) `Those class strings may not be detected, so utilities may not be generated`
c) `It doubles bundle size automatically`
d) `PostCSS will refuse to run`

**Answer: b) `Class strings may not be scanned, so utilities might be missing in production`**

---

**28. Arbitrary values can include spaces if you:**

a) `Never; spaces are forbidden`
b) `Use underscores instead of spaces in many cases`
c) `Use commas only`
d) `Use URL encoding always`

**Answer: b) `Often replace spaces with underscores per Tailwind arbitrary value rules`**

---

**29. What does `theme()` function do inside custom CSS processed by Tailwind?**

a) `Runs unit tests`
b) `Pulls values from the Tailwind theme in CSS`
c) `Imports React components`
d) `Minifies HTML`

**Answer: b) `Pulls values from the Tailwind theme in CSS`**

---

**30. Which file extension is commonly used for the Tailwind config in JS ecosystems?**

a) `tailwind.json`
b) `tailwind.config.js` or `tailwind.config.ts`
c) `tailwind.yml`
d) `postcss.tailwind`

**Answer: b) `tailwind.config.js or tailwind.config.ts`**

---

**31. In `@layer components`, will utilities always override component rules?**

a) `Yes, because of layer ordering in Tailwind’s CSS architecture`
b) `Never`
c) `Only in Safari`
d) `Only if important modifier is banned`

**Answer: a) `Generally yes—utilities layer comes later unless specificity/important differs`**

---

**32. What is a common use of `preflight`?**

a) `Aviation styles`
b) `Tailwind’s base reset/normalize layer`
c) `Image optimization`
d) `Server routing`

**Answer: b) `Tailwind’s base reset/normalize layer`**

---

**33. Which directive imports Tailwind’s preflight/base styles in v3 entry CSS?**

a) `@tailwind base;`
b) `@import tailwind/base`
c) `@use base`
d) `@layer reset`

**Answer: a) `@tailwind base;`**

---

**34. Can you extend `maxWidth` with arbitrary keys in `theme.extend`?**

a) `No`
b) `Yes, for example 7xl or custom names`
c) `Only in v1`
d) `Only with CDN`

**Answer: b) `Yes via theme.extend.maxWidth`**

---

**35. What does `screens` customization affect?**

a) `Only font sizes`
b) `Responsive variant prefixes such as md:`
c) `Only colors`
d) `Only z-index`

**Answer: b) `Breakpoint definitions used by responsive variants`**

---

**36. Which snippet correctly extends a color as a nested scale?**

```js
extend: {
  colors: {
    ocean: { 500: '#0ea5e9', 700: '#0369a1' },
  },
},
```

a) `Invalid`
b) `Valid: enables classes like text-ocean-500`
c) `Only works with Sass`
d) `Requires a plugin`

**Answer: b) `Valid: creates ocean-500 / ocean-700 tokens`**

---

**37. What is a downside of overusing `@apply` in large apps?**

a) `It always breaks dark mode`
b) `You can lose some of Tailwind’s colocation benefits and increase indirection`
c) `It disables JIT`
d) `It removes responsive variants`

**Answer: b) `More indirection vs colocated utilities; harder to grep usage`**

---

**38. Which class uses arbitrary arbitrary value for font size?**

a) `text-size-[1.125rem]`
b) `text-[1.125rem]`
c) `font-[1.125rem]`
d) `size-text-[1.125rem]`

**Answer: b) `text-[1.125rem]`**

---

**39. What does `clamp` in `text-[clamp(1rem,3vw,2rem)]` provide?**

a) `Fixed px text only`
b) `Fluid typography bounded between min and max`
c) `Animation timing`
d) `Grid clamping`

**Answer: b) `Fluid typography bounded between min and max`**

---

**40. Dark mode class strategy often pairs `dark:` with which root pattern?**

```html
<html class="dark">
  <body class="bg-white dark:bg-slate-950">...</body>
</html>
```

a) `A dark class on the html element or a wrapper toggled by JS`
b) `meta viewport`
c) `rel="dark"`
d) `data-router`

**Answer: a) `A dark class toggled on html or a root wrapper`**

---

**41. Which is true about `plugins: []` in config?**

a) `Disables Tailwind entirely`
b) `Means no extra Tailwind plugins beyond core processing`
c) `Enables every official plugin`
d) `Required to be non-empty`

**Answer: b) `No additional Tailwind plugins are registered`**

---

**42. What is `addVariant` used for in plugin authoring?**

a) `Add a custom variant prefix such as hocus:`
b) `Add npm dependencies`
c) `Add HTML templates`
d) `Add ESLint rules`

**Answer: a) `Register a custom variant (e.g. hocus:) for utilities`**

---

**43. Content scanning applies to which kinds of strings?**

a) `Only inline styles`
b) `Complete class names as substrings in scanned files (heuristics)`
c) `Only JSON`
d) `Only comments`

**Answer: b) `Detects utility candidates in file contents per extractor rules`**

---

**44. Why might dynamic class names like `text-${color}-500` fail?**

a) `Tailwind always supports any template string`
b) `Scanners may not see full class strings, so utilities won’t be generated`
c) `Browsers block them`
d) `PostCSS forbids templates`

**Answer: b) `Build-time scanning may miss dynamically constructed class names`**

---

**45. `theme.extend` merges with defaults using:**

a) `Shallow merge only for all keys`
b) `Deep merge for most nested objects like colors`
c) `No merge; defaults are deleted`
d) `Random merge`

**Answer: b) `Deep merge for nested theme objects in typical cases`**

---

**46. Which utility centers a `container` horizontally in common patterns?**

a) `container mx-auto`
b) `container only` always centers
c) `center-container`
d) `flex-center`

**Answer: a) `container mx-auto`**

---

**47. What does disabling `corePlugins` for a utility category do?**

a) `Speeds up network only`
b) `Prevents generation of those utilities even if present in content`
c) `Enables more utilities`
d) `Changes HTML semantics`

**Answer: b) `Stops generating those utilities`**

---

**48. Which `@tailwind` directive injects utilities layer?**

a) `@tailwind utilities;`
b) `@tailwind utility;`
c) `@import utilities`
d) `@layer tailwind-utilities`

**Answer: a) `@tailwind utilities;`**

---

**49. In a design system, `theme.extend` is useful for:**

a) `Removing accessibility`
b) `Aligning tokens (colors, spacing, fonts) with brand guidelines`
c) `Deleting responsive breakpoints`
d) `Bundling images`

**Answer: b) `Aligning design tokens with brand guidelines`**

---

**50. Best practice for monorepo shared tokens often includes:**

a) `Duplicating full config in every package with no sharing`
b) `A shared preset or base config extended per app`
c) `Removing content globs`
d) `Hardcoding colors only in components`

**Answer: b) `A shared preset or base config extended per app`**

---
