# Tailwind CSS v4 MCQ - Set 5 (Expert Level)

**1. What best describes the Oxide engine in Tailwind CSS v4?**

a) `A JavaScript-only AST walker that replaces PostCSS entirely`
b) `A new high-performance pipeline written in Rust, integrating Lightning CSS for transforms and minification`
c) `A browser runtime that evaluates utilities at paint time`
d) `A webpack loader that defers compilation to the client`

**Answer: b) `A new high-performance pipeline written in Rust, integrating Lightning CSS for transforms and minification`**

---

**2. In v4’s CSS-first setup, where do design tokens live by default instead of a JavaScript tailwind.config file?**

a) `Inside HTML data attributes only`
b) `In @theme blocks that emit CSS custom properties such as --color-*, --spacing-*, and --font-*`
c) `Exclusively in theme() calls inside arbitrary values`
d) `In a required tokens.json consumed by the CLI`

**Answer: b) `In @theme blocks that emit CSS custom properties such as --color-*, --spacing-*, and --font-*`**

---

**3. Given this stylesheet fragment, what is the primary role of @theme?**

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.72 0.19 250);
  --spacing: 0.25rem;
}
```

a) `It registers PostCSS plugins at build time`
b) `It declares design tokens that Tailwind maps into utilities and exposes as CSS variables`
c) `It replaces @layer utilities ordering`
d) `It disables automatic content detection`

**Answer: b) `It declares design tokens that Tailwind maps into utilities and exposes as CSS variables`**

---

**4. When should you prefer @theme inline over a normal @theme block?**

a) `When you want tokens inlined at usage sites without generating standalone CSS variables for every token`
b) `When you need to disable OKLCH`
c) `When you must load Tailwind from a CDN without imports`
d) `When you want to remove @layer base`

**Answer: a) `When you want tokens inlined at usage sites without generating standalone CSS variables for every token`**

---

**5. What does @theme reference accomplish?**

a) `It lets you reference token values without generating utilities from those referenced tokens alone`
b) `It forces all utilities to use !important`
c) `It enables runtime HMR for HTML class lists`
d) `It replaces @source for monorepos`

**Answer: a) `It lets you reference token values without generating utilities from those referenced tokens alone`**

---

**6. How does v4’s automatic content detection generally behave regarding ignored files?**

a) `It scans every file on disk including node_modules and binaries`
b) `It uses heuristics, respects .gitignore, and skips common binary and vendor paths`
c) `It only reads files listed in package.json exports`
d) `It requires an explicit content array in JavaScript`

**Answer: b) `It uses heuristics, respects .gitignore, and skips common binary and vendor paths`**

---

**7. When is @source the correct escape hatch?**

a) `When Lightning CSS fails to minify`
b) `When auto-detection misses templates (unusual extensions or paths outside heuristics)`
c) `When you want to remove @layer theme`
d) `When you need to polyfill IE11`

**Answer: b) `When auto-detection misses templates (unusual extensions or paths outside heuristics)`**

---

**8. What does @source not express in a stylesheet?**

a) `A safelist of dynamic classes`
b) `Explicit paths or globs to exclude from Tailwind’s candidate scanning`
c) `A directive to disable Oxide`
d) `Import maps for npm workspaces`

**Answer: b) `Explicit paths or globs to exclude from Tailwind’s candidate scanning`**

---

**9. Which statement about this snippet is correct?**

```css
@import "tailwindcss";

@source "../app/views/**/*.html";
```

a) `Invalid — v4 forbids globs in CSS`
b) `Valid — augments automatic detection with an explicit glob`
c) `Valid only inside @config`
d) `Requires a JS content array to compile`

**Answer: b) `Valid — augments automatic detection with an explicit glob`**

---

**10. How does the --spacing token relate to spacing-* utilities in v4?**

a) `It is ignored; spacing uses fixed px steps only`
b) `Spacing utilities derive from calc(var(--spacing) * n), so changing --spacing rescales the scale`
c) `It only affects gap-*, not padding or margin utilities`
d) `It replaces @theme entirely`

**Answer: b) `Spacing utilities derive from calc(var(--spacing) * n), so changing --spacing rescales the scale`**

---

**11. What is the idiomatic v4 way to define a custom utility family?**

```css
@utility tab-4 {
  tab-size: 4;
}
```

a) `Use @apply inside @layer components`
b) `Use @utility to register a named utility Tailwind can generate and variant-wrap`
c) `Use @variant only`
d) `Use @plugin with Sass mixins`

**Answer: b) `Use @utility to register a named utility Tailwind can generate and variant-wrap`**

---

**12. Custom utilities created with @utility can participate in responsive and state modifiers because:**

a) `Browsers reinterpret class names at runtime`
b) `Tailwind treats them like first-class utilities in the utilities layer, applying variant transforms`
c) `PostCSS runs them after autoprefixer only`
d) `They must be prefixed with tw- manually`

**Answer: b) `Tailwind treats them like first-class utilities in the utilities layer, applying variant transforms`**

---

**13. Which directive defines a reusable variant selector?**

```css
@variant hocus (&:hover, &:focus-visible) {
  /* ... */
}
```

a) `@plugin`
b) `@variant`
c) `@theme reference`
d) `@config`

**Answer: b) `@variant`**

---

**14. When would you reach for @plugin in v4 CSS?**

a) `To import npm Tailwind plugins into the CSS pipeline`
b) `To replace @import "tailwindcss"`
c) `To declare OKLCH defaults only`
d) `To configure Vite entry points`

**Answer: a) `To import npm Tailwind plugins into the CSS pipeline`**

---

**15. When is @config appropriate?**

a) `To pull in a legacy tailwind.config.js for backward compatibility while migrating`
b) `To disable container queries`
c) `To force Oxide off`
d) `To inline arbitrary HTML`

**Answer: a) `To pull in a legacy tailwind.config.js for backward compatibility while migrating`**

---

**16. In v4 plugin authoring, addUtilities, matchUtilities, and addVariant primarily target:**

a) `Runtime CSSOM mutation in the browser`
b) `Build-time extension of Tailwind’s generated CSS across layers`
c) `Webpack splitChunks configuration`
d) `Service worker caching`

**Answer: b) `Build-time extension of Tailwind’s generated CSS across layers`**

---

**17. Which statement about Tailwind v4 cascade layers is most accurate?**

a) `Utilities always win because they are injected as inline styles`
b) `Tailwind orders native CSS layers: theme, base, components, utilities — for predictable cascade`
c) `Layers are removed when using @tailwindcss/vite`
d) `Layers apply only to OKLCH colors`

**Answer: b) `Tailwind orders native CSS layers: theme, base, components, utilities — for predictable cascade`**

---

**18. Why can @apply behave differently in v4 compared to v3 expectations?**

a) `Stricter layer scoping: you cannot @apply utilities from other layers by default`
b) `@apply now executes in the browser`
c) `@apply requires Sass`
d) `@apply ignores variants`

**Answer: a) `Stricter layer scoping: you cannot @apply utilities from other layers by default`**

---

**19. Multi-theme setups in v4 commonly leverage:**

a) `Swapping CSS custom properties under @theme (or scoped themes) while keeping utility names stable`
b) `Rebuilding Oxide per HTTP request`
c) `Replacing Lightning CSS with Babel`
d) `Deleting @layer base`

**Answer: a) `Swapping CSS custom properties under @theme (or scoped themes) while keeping utility names stable`**

---

**20. Dark mode with CSS variables in v4 often pairs:**

a) `Media queries on color-scheme only, never class strategies`
b) `The dark: variant with tokens that change underlying --color-* values`
c) `Inline style attributes on every element`
d) `Disabling @layer theme`

**Answer: b) `The dark: variant with tokens that change underlying --color-* values`**

---

**21. Integrating Headless UI, Radix, or shadcn-style libraries with Tailwind v4 typically means:**

a) `Avoiding @source entirely`
b) `Ensuring their files are discoverable (auto or @source) and aligning @theme namespaces with design tokens`
c) `Using only @apply in JS`
d) `Dropping @layer utilities`

**Answer: b) `Ensuring their files are discoverable (auto or @source) and aligning @theme namespaces with design tokens`**

---

**22. For fastest dev builds with Vite, the recommended Tailwind v4 integration is:**

a) `Only the PostCSS plugin`
b) `The @tailwindcss/vite first-party plugin`
c) `Importing tailwind.min.css from a CDN`
d) `Running the Sass compiler twice`

**Answer: b) `The @tailwindcss/vite first-party plugin`**

---

**23. The PostCSS path in v4 uses:**

a) `The legacy tailwindcss PostCSS plugin name unchanged`
b) `@tailwindcss/postcss, with Lightning CSS handling many transforms autoprefixer covered in v3 stacks`
c) `Only cssnano without Tailwind`
d) `esbuild CSS loader exclusively`

**Answer: b) `@tailwindcss/postcss, with Lightning CSS handling many transforms autoprefixer covered in v3 stacks`**

---

**24. Container queries in v4 are:**

a) `Unavailable without a separate container-queries plugin`
b) `Built-in: @container plus min-* / max-* style range variants without an extra plugin`
c) `Limited to @media only`
d) `Runtime-only in the browser`

**Answer: b) `Built-in: @container plus min-* / max-* style range variants without an extra plugin`**

---

**25. Composable variants such as not-* and in-* help you:**

a) `Express :not() / :is()-style compositions without hand-authoring every raw selector`
b) `Disable OKLCH`
c) `Remove @layer theme`
d) `Bundle fonts from Google automatically`

**Answer: a) `Express :not() / :is()-style compositions without hand-authoring every raw selector`**

---

**26. 3D transforms being built-in means utilities like rotate-x-*, rotate-y-*, and perspective-* are:**

a) `Only available after installing a community plugin`
b) `Part of core without a separate 3D transform plugin`
c) `Only valid inside @layer base`
d) `Only tied to arbitrary HTML attributes`

**Answer: b) `Part of core without a separate 3D transform plugin`**

---

**27. @starting-style integration in v4 is useful for:**

a) `Entry animations from an element’s initial style state before it participates in the layout`
b) `Server-side database queries`
c) `Configuring npm workspaces`
d) `Replacing @theme`

**Answer: a) `Entry animations from an element’s initial style state before it participates in the layout`**

---

**28. OKLCH as the default color space helps because:**

a) `It guarantees identical file sizes across projects`
b) `Perceptually uniform manipulation: lightness and chroma shifts behave more predictably than many sRGB workflows`
c) `It removes the need for CSS variables`
d) `It disables gradients`

**Answer: b) `Perceptually uniform manipulation: lightness and chroma shifts behave more predictably than many sRGB workflows`**

---

**29. A gradient direction utility rename in v4 maps:**

a) `bg-gradient-to-r to bg-linear-to-r`
b) `bg-linear-to-r to bg-gradient-to-r`
c) `from-* to to-* only`
d) `bg-none to bg-hidden`

**Answer: a) `bg-gradient-to-r to bg-linear-to-r`**

---

**30. The blur utility scale in v4 was adjusted so that:**

a) `The default blur step aligns with the old blur-sm-style magnitude (naming shifted on the scale)`
b) `All blur utilities were removed`
c) `blur only works inside @apply`
d) `blur requires a JS config`

**Answer: a) `The default blur step aligns with the old blur-sm-style magnitude (naming shifted on the scale)`**

---

**31. The decoration-slice utility was removed in favor of:**

a) `box-decoration-slice`
b) `border-slice`
c) `slice-decoration`
d) `bg-clip-slice`

**Answer: a) `box-decoration-slice`**

---

**32. Lightning CSS’s role inside Oxide is closest to:**

a) `Parsing and transforming modern CSS (including nesting) efficiently at build time`
b) `Executing Tailwind classes in the browser`
c) `Managing React state`
d) `Type-checking TypeScript`

**Answer: a) `Parsing and transforming modern CSS (including nesting) efficiently at build time`**

---

**33. Automatic detection still benefits from @source when:**

a) `Templates live under generated or ignored paths the heuristics skip`
b) `You use only inline styles`
c) `You disable @import "tailwindcss"`
d) `You use monochrome colors only`

**Answer: a) `Templates live under generated or ignored paths the heuristics skip`**

---

**34. Namespace tokens like --font-sans under @theme map to utilities such as:**

a) `font-sans (font-family utilities from --font-* tokens)`
b) `text-sans exclusively`
c) `grid-sans exclusively`
d) `shadow-sans exclusively`

**Answer: a) `font-sans (font-family utilities from --font-* tokens)`**

---

**35. Extending vs overriding in @theme is primarily about:**

a) `Whether new tokens merge into existing namespaces or replace the predefined scale for that namespace`
b) `Choosing between Vite and webpack`
c) `Enabling Sass`
d) `Setting display:flex globally`

**Answer: a) `Whether new tokens merge into existing namespaces or replace the predefined scale for that namespace`**

---

**36. Type-like modifiers on custom utilities often come from:**

a) `matchUtilities-style dynamic definitions in JS plugins, or documented @utility patterns that support modifiers`
b) `HTML inline styles only`
c) `Disabling layers`
d) `Importing Bootstrap`

**Answer: a) `matchUtilities-style dynamic definitions in JS plugins, or documented @utility patterns that support modifiers`**

---

**37. @variant can encode compound selectors such as:**

a) `&:where(:hover, :focus-visible) wrapped into a reusable variant name`
b) `JSON theme keys only`
c) `HTTP cache headers`
d) `SVG path data only`

**Answer: a) `&:where(:hover, :focus-visible) wrapped into a reusable variant name`**

---

**38. The CLI package for standalone Tailwind v4 builds is:**

a) `@tailwindcss/cli`
b) `tailwind-cli`
c) `oxide-cli`
d) `postcss-cli only`

**Answer: a) `@tailwindcss/cli`**

---

**39. Native CSS nesting in your source stylesheets is:**

a) `Forbidden when using Tailwind`
b) `Supported and processed via Lightning CSS in typical v4 toolchains`
c) `Only allowed in HTML`
d) `Replaced by JSX`

**Answer: b) `Supported and processed via Lightning CSS in typical v4 toolchains`**

---

**40. @property alongside Tailwind matters when:**

a) `You animate custom properties and need registered typed interpolation in supporting browsers`
b) `You configure content globs`
c) `You add Rust crates`
d) `You disable variants`

**Answer: a) `You animate custom properties and need registered typed interpolation in supporting browsers`**

---

**41. In Next.js App Router setups, v4 typically starts from:**

a) `A global CSS entry with @import "tailwindcss" and optional @source for missed paths`
b) `Importing tailwind.config.js in every page`
c) `Using only styled-jsx`
d) `Disabling CSS layers`

**Answer: a) `A global CSS entry with @import "tailwindcss" and optional @source for missed paths`**

---

**42. Remix with v4 on Vite should consider:**

a) `Scan coverage for route modules (auto or @source) and using @tailwindcss/vite when applicable`
b) `Avoiding CSS imports in routes`
c) `Runtime Tailwind CDN only`
d) `Removing @layer base`

**Answer: a) `Scan coverage for route modules (auto or @source) and using @tailwindcss/vite when applicable`**

---

**43. Astro plus v4 often uses:**

a) `One global stylesheet with @import "tailwindcss" and optional @source for .astro and island paths`
b) `Per-component Sass only`
c) `No build tooling`
d) `Webpack 4 exclusively`

**Answer: a) `One global stylesheet with @import "tailwindcss" and optional @source for .astro and island paths`**

---

**44. SvelteKit plus v4 commonly pairs:**

a) `@tailwindcss/vite in vite.config.ts plus a root CSS entry that imports Tailwind`
b) `Only gulp`
c) `A runtime Tailwind interpreter`
d) `jQuery plugins`

**Answer: a) `@tailwindcss/vite in vite.config.ts plus a root CSS entry that imports Tailwind`**

---

**45. Arbitrary values still work; expert teams still guard against:**

a) `Dynamic class string interpolation that scanning cannot see without @source inline(...) or static extraction`
b) `Arbitrary values always yielding smaller CSS than theme tokens`
c) `Automatic removal of @layer`
d) `OKLCH being incompatible with gradients`

**Answer: a) `Dynamic class string interpolation that scanning cannot see without @source inline(...) or static extraction`**

---

**46. Versus v3-era JIT plus PostCSS, Oxide plus Lightning CSS typically improves:**

a) `Cold builds in every case without exception`
b) `Incremental CSS processing and a leaner transform pipeline in typical apps`
c) `Nothing measurable`
d) `Only client-side runtime`

**Answer: b) `Incremental CSS processing and a leaner transform pipeline in typical apps`**

---

**47. Binary assets are generally skipped during scanning because:**

a) `The engine treats non-text files as non-candidates`
b) `Tailwind executes binaries as plugins`
c) `They must be listed in @config`
d) `They require Sass`

**Answer: a) `The engine treats non-text files as non-candidates`**

---

**48. @layer theme conceptually contains:**

a) `Design tokens and variables that underpin generated utilities`
b) `Only user-agent resets`
c) `JavaScript bundles`
d) `HTML partials`

**Answer: a) `Design tokens and variables that underpin generated utilities`**

---

**49. Isolating third-party CSS conflicts in v4 usually involves:**

a) `Respecting layer order and avoiding cross-layer @apply; deliberate import and token scoping`
b) `Deleting .gitignore`
c) `Using only RGB hex`
d) `Disabling Lightning CSS always`

**Answer: a) `Respecting layer order and avoiding cross-layer @apply; deliberate import and token scoping`**

---

**50. Official help migrating v3 projects toward v4 idioms is provided by:**

a) `The @tailwindcss/upgrade CLI tool`
b) `npx tailwindcss@3 purge`
c) `Webpack-only codemods`
d) `A tw-migrate browser API`

**Answer: a) `The @tailwindcss/upgrade CLI tool`**

---
