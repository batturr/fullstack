# Tailwind CSS v4 MCQ - Set 6 (Expert Level)

**1. The primary official path to migrate a Tailwind v3 project toward v4 idioms is:**

a) `Manual rewrite of every HTML file to inline styles`
b) `Run the @tailwindcss/upgrade CLI, then reconcile breaking changes and renamed utilities`
c) `Delete all CSS and rely on Oxide defaults`
d) `Switch from Vite to webpack 4 only`

**Answer: b) `Run the @tailwindcss/upgrade CLI, then reconcile breaking changes and renamed utilities`**

---

**2. In v4, the old @tailwind directives are replaced idiomatically by:**

a) `Keeping @tailwind base/components/utilities forever`
b) `@import "tailwindcss" as the CSS entry that wires layers, theme, and utilities`
c) `link rel=stylesheet to skypack`
d) `import tailwind from "jquery"`

**Answer: b) `@import "tailwindcss" as the CSS entry that wires layers, theme, and utilities`**

---

**3. A v3 content: [] array is largely superseded in v4 by:**

a) `Automatic content detection with heuristics plus optional @source / @source not`
b) `A required Babel plugin`
c) `Runtime reflection of DOM classList`
d) `esbuild metafile parsing only`

**Answer: a) `Automatic content detection with heuristics plus optional @source / @source not`**

---

**4. Theme extension that lived in module.exports.theme in v3 now most often maps to:**

a) `Only package.json "tailwind" key`
b) `@theme blocks declaring --color-*, --spacing-*, --radius-*, etc.`
c) `CSS modules default export`
d) `PostCSS env() only`

**Answer: b) `@theme blocks declaring --color-*, --spacing-*, --radius-*, etc.`**

---

**5. When you still need tailwind.config.js during migration, you attach it with:**

a) `@config "../../tailwind.config.js"`
b) `@plugin "../../tailwind.config.js"`
c) `@source "../../tailwind.config.js"`
d) `@theme reference "../../tailwind.config.js"`

**Answer: a) `@config "../../tailwind.config.js"`**

---

**6. Advanced plugin work in v4 can combine:**

a) `CSS directives (@plugin) for npm plugins plus JS APIs (addUtilities, matchUtilities, addVariant) where needed`
b) `Only Excel macros`
c) `Only Service Worker caches`
d) `Only Dockerfile COPY`

**Answer: a) `CSS directives (@plugin) for npm plugins plus JS APIs (addUtilities, matchUtilities, addVariant) where needed`**

---

**7. matchUtilities in v4-oriented plugins is especially suited to:**

a) `Utilities generated from a value pattern (arbitrary or themed) with consistent CSS templates`
b) `Adding Google Fonts link tags`
c) `Parsing PDFs`
d) `SSL termination`

**Answer: a) `Utilities generated from a value pattern (arbitrary or themed) with consistent CSS templates`**

---

**8. In a PostCSS-only v4 stack, tailwindcss as the PostCSS plugin is replaced by:**

a) `@tailwindcss/postcss`
b) `cssnext`
c) `stylus`
d) `less-loader`

**Answer: a) `@tailwindcss/postcss`**

---

**9. Lightning CSS inside the v4 toolchain commonly means:**

a) `You still need autoprefixer for every project`
b) `Vendor prefixing and modern syntax lowering are handled in the Rust/CSS pipeline, reducing classic autoprefixer reliance`
c) `Browsers download Tailwind at runtime`
d) `IE6 compatibility is guaranteed`

**Answer: b) `Vendor prefixing and modern syntax lowering are handled in the Rust/CSS pipeline, reducing classic autoprefixer reliance`**

---

**10. Choose @tailwindcss/vite over PostCSS when:**

a) `You want the tightest Vite integration and fastest incremental CSS in a Vite-first app`
b) `You are on webpack 3`
c) `You refuse to import CSS`
d) `You only write inline styles`

**Answer: a) `You want the tightest Vite integration and fastest incremental CSS in a Vite-first app`**

---

**11. Keep @tailwindcss/postcss when:**

a) `Your bundler or pipeline is PostCSS-centric (e.g., legacy webpack, custom PostCSS chains)`
b) `You have deleted all CSS files`
c) `You target browsers without CSS support`
d) `You only use runtime Tailwind Play CDN`

**Answer: a) `Your bundler or pipeline is PostCSS-centric (e.g., legacy webpack, custom PostCSS chains)`**

---

**12. In a monorepo, sharing tokens across packages often uses:**

a) `A shared CSS entry imported by apps that defines @theme and @source paths into packages`
b) `Copy-pasting hex codes into Slack`
c) `Disabling Oxide per package`
d) `One global variable window.__TW`

**Answer: a) `A shared CSS entry imported by apps that defines @theme and @source paths into packages`**

---

**13. @source in a shared package boundary might point to:**

a) `../../packages/ui/src/**/*.{tsx,vue,svelte}`
b) `node_modules/.cache only`
c) `README.md exclusively`
d) `Binary .wasm assets only`

**Answer: a) `../../packages/ui/src/**/*.{tsx,vue,svelte}`**

---

**14. Overriding prefers-color-scheme-only dark with a class strategy is done by:**

```css
@custom-variant dark (&:where(.dark, .dark *));
```

a) `Defining a custom dark variant (e.g., .dark on an ancestor) and toggling that class on html or body`
b) `Deleting @layer theme`
c) `Using color-scheme: light only on :root`
d) `Removing all --color-* variables`

**Answer: a) `Defining a custom dark variant (e.g., with @custom-variant) and toggling that class on html or body`**

---

**15. forced-colors: is primarily for:**

a) `Windows High Contrast / forced-colors mode adjustments`
b) `Disabling all animations globally`
c) `Print stylesheets only`
d) `Safari PDF export only`

**Answer: a) `Windows High Contrast / forced-colors mode adjustments`**

---

**16. contrast-more: and contrast-less: help when:**

a) `Users request higher or lower contrast via prefers-contrast`
b) `You emulate display-p3 only`
c) `You target XML parsers`
d) `You disable OKLCH`

**Answer: a) `Users request higher or lower contrast via prefers-contrast`**

---

**17. motion-reduce: pairs with:**

a) `prefers-reduced-motion to tone down animation and large transitions`
b) `container-type: size`
c) `@starting-style only`
d) `display: grid always`

**Answer: a) `prefers-reduced-motion to tone down animation and large transitions`**

---

**18. motion-safe: is useful to:**

a) `Gate decorative motion behind users who have not requested reduced motion`
b) `Force 60fps canvas`
c) `Replace @theme`
d) `Enable 3D transforms on SVG filters only`

**Answer: a) `Gate decorative motion behind users who have not requested reduced motion`**

---

**19. Named containers in Tailwind-style markup typically combine:**

```html
<div class="@container/sidebar">
  <div class="flex flex-row @sm/sidebar:flex-col">…</div>
</div>
```

a) `@container/name on an ancestor and @sm/name: (or @min-[…]/name:) utilities on descendants`
b) `Only @media queries`
c) `Only table layouts`
d) `Only position: fixed`

**Answer: a) `@container/name on an ancestor and @sm/name: (or @min-[…]/name:) utilities on descendants`**

---

**20. Nested containers imply:**

a) `Queries resolve against the nearest appropriate container, so naming avoids ambiguity`
b) `Only the root viewport is queried`
c) `Container queries are ignored in v4`
d) `3D transforms are disabled`

**Answer: a) `Queries resolve against the nearest appropriate container, so naming avoids ambiguity`**

---

**21. Range-style container variants (@min-* / @max-*) let you:**

a) `Style between two container widths/heights without only a single breakpoint threshold`
b) `Query SQL`
c) `Polyfill flex-gap in IE10`
d) `Replace @import "tailwindcss"`

**Answer: a) `Style between two container widths/heights without only a single breakpoint threshold`**

---

**22. @starting-style pairs naturally with:**

a) `Transitions on properties that need a defined before-change value for entry animations`
b) `Server components only`
c) `Sass variables`
d) `autoprefixer alone`

**Answer: a) `Transitions on properties that need a defined before-change value for entry animations`**

---

**23. A solid 3D card tilt composition might stack:**

a) `perspective-*, transform-gpu, rotate-x-*, rotate-y-*, and preserve-3d on a shared parent`
b) `Only z-index`
c) `Only filter: blur on text`
d) `Only table-cell`

**Answer: a) `perspective-*, transform-gpu, rotate-x-*, rotate-y-*, and preserve-3d on a shared parent`**

---

**24. Dynamic class generation like concatenating btn- with a color name often fails with v4 because:**

a) `The scanner cannot see runtime-only concatenated strings; candidates never enter the build graph`
b) `Oxide forbids arbitrary values`
c) `OKLCH breaks template literals`
d) `Vite bans variables`

**Answer: a) `The scanner cannot see runtime-only concatenated strings; candidates never enter the build graph`**

---

**25. A disciplined fix for hidden dynamic classes is:**

a) `Static safelisting via @source inline(...) or refactoring to complete class strings the scanner can read`
b) `Deleting .gitignore`
c) `Using only RGB 3-digit hex`
d) `Disabling Lightning CSS`

**Answer: a) `Static safelisting via @source inline(...) or refactoring to complete class strings the scanner can read`**

---

**26. OKLCH in @theme is advantageous for:**

a) `Perceptually even steps when defining ramps and semantic color roles`
b) `Guaranteeing zero CSS output`
c) `Removing container queries`
d) `Avoiding @layer utilities`

**Answer: a) `Perceptually even steps when defining ramps and semantic color roles`**

---

**27. Declaring a brand ramp in OKLCH might look like:**

```css
@theme {
  --color-brand-500: oklch(0.65 0.2 264);
  --color-brand-600: oklch(0.55 0.18 264);
}
```

a) `Invalid — v4 only allows hex`
b) `Valid — tokens feed generated color utilities`
c) `Requires tailwind.config.cjs`
d) `Ignored unless autoprefixer is present`

**Answer: b) `Valid — tokens feed generated color utilities`**

---

**28. Prefixing all utilities in v4 CSS is done via:**

```css
@import "tailwindcss" prefix(tw);
```

a) `@import "tailwindcss" prefix(tw);`
b) `@prefix tw;`
c) `package.json twPrefix`
d) `data-tw-* attributes only`

**Answer: a) `@import "tailwindcss" prefix(tw);`**

---

**29. Scoped detection to a subtree of files can use:**

```css
@import "tailwindcss" source("../packages/acme-ui/src");
```

a) `@import "tailwindcss" source("../packages/acme-ui/src");`
b) `@source not alone — it only excludes paths`
c) `@theme reference alone — it does not set scan roots`
d) `@config with no path argument`

**Answer: a) `@import "tailwindcss" source("../packages/acme-ui/src");`**

---

**30. The @theme namespace for fonts maps --font-* to utilities like:**

a) `font-sans, font-mono from family tokens`
b) `text-xs from font tokens`
c) `leading-* from --font-* alone`
d) `shadow-* from --font-*`

**Answer: a) `font-sans, font-mono from family tokens`**

---

**31. Replacing an entire default color palette in @theme is conceptually:**

a) `Overriding the --color-* namespace wholesale rather than merging new keys only`
b) `Impossible in v4`
c) `Done with @apply only`
d) `Done by editing node_modules by hand`

**Answer: a) `Overriding the --color-* namespace wholesale rather than merging new keys only`**

---

**32. Utility conflicts at the same specificity usually resolve by:**

a) `Source order within the utilities layer and how Tailwind emits the final rule list`
b) `Random choice per build`
c) `Always favoring inline HTML`
d) `Alphabetical HTML attribute order`

**Answer: a) `Source order within the utilities layer and how Tailwind emits the final rule list`**

---

**33. Adding ! to a utility (e.g., !flex) affects:**

a) `Declaration priority via !important on that utility’s declarations`
b) `JSX key stability`
c) `Oxide Rust memory layout`
d) `Git LFS`

**Answer: a) `Declaration priority via !important on that utility’s declarations`**

---

**34. Testing Tailwind output often combines:**

a) `Snapshotting compiled CSS for critical routes plus targeted visual regression on key components`
b) `Only unit testing raw className strings without a build`
c) `Deleting @layer base before tests`
d) `Measuring npm stars`

**Answer: a) `Snapshotting compiled CSS for critical routes plus targeted visual regression on key components`**

---

**35. Playwright or Cypress tests for UI should prefer:**

a) `Stable selectors (roles, test ids) while asserting computed styles only where design contracts matter`
b) `Asserting the exact order of utilities in the class attribute`
c) `Parsing Oxide IR`
d) `Testing .gitignore patterns`

**Answer: a) `Stable selectors (roles, test ids) while asserting computed styles only where design contracts matter`**

---

**36. Cross-layer @apply issues often appear when:**

a) `A component in @layer components tries to @apply a utility whose definitions are not visible in that layer context`
b) `You use only OKLCH`
c) `You enable @tailwindcss/vite`
d) `You add @source`

**Answer: a) `A component in @layer components tries to @apply a utility whose definitions are not visible in that layer context`**

---

**37. Mitigating specificity wars with third-party CSS can include:**

a) `Layer ordering, avoiding duplicated resets, and scoping third-party imports outside conflicting layers`
b) `Doubling class names randomly`
c) `Using only IDs in Tailwind`
d) `Inlining 10MB of CSS`

**Answer: a) `Layer ordering, avoiding duplicated resets, and scoping third-party imports outside conflicting layers`**

---

**38. @apply with !important on composed rules can surprise teams because:**

a) `It raises cascade pressure and can make overrides from other layers or themes harder to reason about`
b) `It disables Oxide`
c) `It removes container queries`
d) `It converts OKLCH to CMYK`

**Answer: a) `It raises cascade pressure and can make overrides from other layers or themes harder to reason about`**

---

**39. @theme inline is preferable when:**

a) `You want one-off tokens not emitted as standalone global variables`
b) `You must delete @layer utilities`
c) `You need webpack 2`
d) `You disable scanning`

**Answer: a) `You want one-off tokens not emitted as standalone global variables`**

---

**40. @theme reference suits:**

a) `Pulling in token definitions you depend on in CSS without generating utilities from every referenced key`
b) `Runtime HMR for Rust`
c) `JSON Schema validation of HTML`
d) `SQLite migrations`

**Answer: a) `Pulling in token definitions you depend on in CSS without generating utilities from every referenced key`**

---

**41. Renamed gradient utilities mean old class strings must update to:**

a) `bg-linear-to-* instead of bg-gradient-to-*`
b) `bg-radial-only`
c) `gradient-from only`
d) `to-gradient-*`

**Answer: a) `bg-linear-to-* instead of bg-gradient-to-*`**

---

**42. blur-sm in v4 roughly corresponds to:**

a) `The magnitude many teams previously associated with the old default blur step before the scale shift`
b) `No blur at all`
c) `SVG filter:url only`
d) `backdrop-filter only`

**Answer: a) `The magnitude many teams previously associated with the old default blur step before the scale shift`**

---

**43. box-decoration-slice replaces:**

a) `decoration-slice`
b) `bg-origin`
c) `outline-offset`
d) `ring-offset`

**Answer: a) `decoration-slice`**

---

**44. Oxide is implemented in Rust primarily to:**

a) `Speed up scanning, parsing, and codegen versus a pure JS pipeline at scale`
b) `Execute utilities in Chrome`
c) `Replace HTML`
d) `Bundle npm packages`

**Answer: a) `Speed up scanning, parsing, and codegen versus a pure JS pipeline at scale`**

---

**45. @source not "../legacy/**/*.html" is appropriate when:**

```css
@import "tailwindcss";
@source not "../legacy/**/*.html";
```

a) `Legacy templates still exist on disk but must not contribute class candidates`
b) `You want to force-include binaries`
c) `You need to disable @layer theme`
d) `You import only OKLCH`

**Answer: a) `Legacy templates still exist on disk but must not contribute class candidates`**

---

**46. Composable variants (not-*, in-*) matter for:**

a) `Expressive conditional styling without exploding custom @variant boilerplate`
b) `Removing CSS variables`
c) `Mandatory Sass`
d) `Disabling dark mode`

**Answer: a) `Expressive conditional styling without exploding custom @variant boilerplate`**

---

**47. The --spacing design token controls:**

a) `The base step multiplied across spacing-* utilities via calc(var(--spacing) * n)`
b) `Only font-size`
c) `Only border-width`
d) `Only z-index`

**Answer: a) `The base step multiplied across spacing-* utilities via calc(var(--spacing) * n)`**

---

**48. Why is the required CSS entry that imports the tailwindcss package necessary?**

a) `It loads the versioned entry that registers Tailwind’s layers, preflight, and utility compiler hooks`
b) `It installs npm packages`
c) `It replaces HTML DOCTYPE`
d) `It configures PostgreSQL`

**Answer: a) `It loads the versioned entry that registers Tailwind’s layers, preflight, and utility compiler hooks`**

---

**49. Expert debugging when classes vanish after upgrade starts with:**

a) `Verify scanning (@source), renamed utilities (bg-linear-to-*), and layer/@apply scoping before blaming Oxide`
b) `Delete all CSS variables`
c) `Pin to IE11`
d) `Remove .git`

**Answer: a) `Verify scanning (@source), renamed utilities (bg-linear-to-*), and layer/@apply scoping before blaming Oxide`**

---

**50. A healthy v4 design-system package exports:**

a) `A CSS entry consumers import: @import tailwindcss, shared @theme, optional @plugin, and documented @source paths`
b) `Only minified JS without CSS`
c) `Only PNG sprites`
d) `A webpackDll manifest`

**Answer: a) `A CSS entry consumers import: @import tailwindcss, shared @theme, optional @plugin, and documented @source paths`**

---
