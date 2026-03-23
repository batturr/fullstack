# Tailwind CSS MCQ - Set 6 (Expert Level)

**1. `matchComponents` is most appropriate when you need:**

a) `Dynamic generation of component-like classes from a pattern`
b) `Adding Google Analytics`
c) `Parsing markdown`
d) `SSR caching only`

**Answer: a) `Dynamic generation of component-like classes from a pattern`**

---

**2. Custom modifier handling in advanced plugins often requires understanding:**

a) `How variants/modifiers wrap selectors and interact with arbitrary values`
b) `TCP congestion control`
c) `SQL indexes`
d) `GPU rasterization only`

**Answer: a) `Variant/modifier selector wrapping with arbitrary values`**

---

**3. Complex variant creation might combine:**

a) `Multiple pseudo selectors, attribute selectors, and media queries in one variant definition`
b) `Only simple hover variants`
c) `Only print:`
d) `Only z-index`

**Answer: a) `Pseudo, attribute, and media query combinations`**

---

**4. In a typical PostCSS pipeline for Tailwind v3, which tool adds vendor prefixes?**

a) `autoprefixer`
b) `eslint`
c) `prettier`
d) `typescript`

**Answer: a) `autoprefixer`**

---

**5. What is `cssnano` commonly used for?**

a) `Minifying CSS for production`
b) `Adding prefixes only`
c) `Bundling JavaScript`
d) `Type checking`

**Answer: a) `Minifying CSS for production`**

---

**6. Custom PostCSS plugins run:**

a) `As transforms on CSS between Tailwind and the final bundle`
b) `Only in the browser at runtime`
c) `Only on PNG files`
d) `Only before npm install`

**Answer: a) `As transforms in the CSS pipeline`**

---

**7. Tailwind in monorepos often uses `presets` to:**

a) `Share tokens and plugin setup across packages`
b) `Hide source maps`
c) `Disable flexbox`
d) `Replace HTML`

**Answer: a) `Share tokens and plugin setup across packages`**

---

**8. A shared Tailwind preset should usually avoid:**

a) `Hardcoding package-specific absolute paths that break in other apps`
b) `Extending colors`
c) `Defining spacing scale`
d) `Using plugins`

**Answer: a) `Non-portable absolute content paths in shared presets`**

---

**9. Advanced dark mode with system + manual toggle often uses:**

a) `class on html for manual override layered with prefers-color-scheme handling`
b) `Only inline styles`
c) `Media darkMode strategy only, with no manual override`
d) `Cookies for layout`

**Answer: a) `Manual class override combined with system preference logic`**

---

**10. Multiple color schemes (e.g. “blue” vs “green” theme) pair well with:**

a) `Semantic class names backed by CSS variables swapped on a wrapper`
b) `Duplicating every component in separate repos`
c) `Removing Tailwind`
d) `Using CSS !important for every rule`

**Answer: a) `Semantic utilities backed by swappable CSS variables`**

---

**11. Next.js + Tailwind integration typically requires:**

a) `Correct content globs for app/, pages/, and proper PostCSS config`
b) `Deleting next.config.js entirely`
c) `No CSS imports`
d) `jQuery`

**Answer: a) `Content globs for app/pages and valid PostCSS setup`**

---

**12. Remix + Tailwind considerations often include:**

a) `Ensuring build tools process CSS imports in routes and shared root links`
b) `Banning link tags`
c) `Using only CSS modules without Tailwind`
d) `Removing route modules`

**Answer: a) `Proper CSS pipeline with route-level imports and root stylesheets`**

---

**13. Astro + Tailwind often uses:**

a) `Official integration or PostCSS setup with scoped component styles awareness`
b) `Only inline CSS in markdown`
c) `No static generation`
d) `Banning islands`

**Answer: a) `Official integration or PostCSS with framework-aware scoping`**

---

**14. Migrating custom CSS to Tailwind incrementally is best done by:**

a) `Replacing leaf components first and aligning tokens in theme.extend`
b) `Deleting all CSS in one commit without testing`
c) `Removing accessibility attributes`
d) `Avoiding responsive design`

**Answer: a) `Incremental component migration with shared tokens`**

---

**15. Bootstrap-to-Tailwind migration challenges often include:**

a) `Grid/naming mental model shift and removing reliance on Bootstrap components`
b) `Identical class names`
c) `No need to change HTML`
d) `Automatic 1:1 mapping for every utility`

**Answer: a) `Different layout primitives and component patterns`**

---

**16. `focus-visible:` is important for accessibility because:**

a) `It styles keyboard focus without forcing mouse-click focus rings everywhere`
b) `It removes focus outlines always`
c) `It disables keyboard navigation`
d) `It hides focus from screen readers`

**Answer: a) `Keyboard-focused styling without unwanted mouse focus rings`**

---

**17. `motion-reduce:` helps accessibility by:**

a) `Reducing or disabling motion for users who prefer less animation`
b) `Increasing animation speed`
c) `Disabling color contrast`
d) `Removing headings`

**Answer: a) `Respecting reduced motion preferences`**

---

**18. `forced-colors:` is relevant for:**

a) `Windows High Contrast / forced colors mode adjustments`
b) `JPEG compression`
c) `GPU fan curves`
d) `SQL transactions`

**Answer: a) `Forced-colors / high contrast environments`**

---

**19. `contrast-more:` targets:**

a) `Users who prefer higher contrast (prefers-contrast)`
b) `Only print`
c) `Only Safari 9`
d) `Only dark mode`

**Answer: a) `prefers-contrast: more`**

---

**20. Testing Tailwind styles effectively often combines:**

a) `Visual regression / component tests plus accessibility checks`
b) `Only counting classes`
c) `Only unit testing hex values in JS`
d) `Only Lighthouse without components`

**Answer: a) `Visual/component tests and accessibility checks`**

---

**21. When to extract a component vs use `@apply` is mainly a tradeoff of:**

a) `Colocation vs reuse and scanning/discoverability`
b) `Always choose @apply`
c) `Never reuse markup`
d) `Always inline SVG only`

**Answer: a) `Colocation vs reuse and build-time discovery`**

---

**22. `@apply` can become problematic when:**

a) `It creates long dependency chains across many CSS files with unclear ownership`
b) `It is used once`
c) `It sets display:flex in one rule`
d) `It is used only in base layer`

**Answer: a) `Heavy indirection across many CSS files hurts maintainability`**

---

**23. Tailwind v3 vs v4 (expert summary):**

a) `v4 pushes CSS-native configuration and modernized compilation; v3 is JS-config centric`
b) `v4 removes utilities`
c) `v3 removed JIT`
d) `They are identical`

**Answer: a) `v4 emphasizes CSS-first config and updated engine/pipeline`**

---

**24. Holy-grail layout with Tailwind often uses:**

a) `flex or grid with sticky header/footer and min-h-screen patterns`
b) `marquee elements`
c) `framesets`
d) `table layout only`

**Answer: a) `Flex/grid with sticky regions and min-height viewport patterns`**

---

**25. Dashboard layouts often rely on:**

a) `Grid areas / col-span patterns + overflow-auto sections + sticky nav`
b) `iframes for every widget`
c) `absolute positioning for all text`
d) `float-based columns only`

**Answer: a) `Grid spans, scrollable panes, and sticky navigation`**

---

**26. Complex CSS Grid patterns in Tailwind may use:**

a) `grid-cols-*`, `col-span-*`, `row-span-*`, and arbitrary templates when needed`
b) `Only float`
c) `Only tables`
d) `Only position:static layouts`

**Answer: a) `Template columns/rows with spans and arbitrary templates`**

---

**27. Orchestrated animations often combine:**

a) `delay-*, duration-*, ease-*, and keyframed utilities with reduced-motion guards`
b) `Only animate-spin`
c) `Only transitions on z-index`
d) `Only print:`

**Answer: a) `Delays/durations/easing plus keyframes and motion preferences`**

---

**28. Complex keyframes in Tailwind are typically registered via:**

a) `theme.extend.keyframes + theme.extend.animation`
b) `Only inline style attributes`
c) `Only SVG SMIL`
d) `Cannot be done`

**Answer: a) `theme.extend.keyframes and animation mapping`**

---

**29. Container query integration means styling:**

a) `Based on a container’s size, not only the viewport`
b) `Based only on cookies`
c) `Based only on CPU temperature`
d) `Based only on print`

**Answer: a) `Based on container size rather than only viewport`**

---

**30. Dynamic class generation anti-pattern example:**

```html
<!-- Anti-pattern: building class names by concatenating fragments
     in JS/JSX so "text-red-500" never appears as a literal in source -->
<div class="text-red-500"></div>
```

a) `Always safe; Tailwind reads runtime values`
b) `Often breaks scanning; full class strings may not appear in source`
c) `Forces dark mode`
d) `Improves SEO automatically`

**Answer: b) `Scanning may miss split template strings`**

---

**31. Safer alternative to dynamic concatenation is often:**

a) `A mapping object of full class strings or safelist with explicit keys`
b) `Using Math.random() for class names`
c) `Using CSS url() only`
d) `Deleting tailwind.config`

**Answer: a) `Explicit full class strings or controlled safelist`**

---

**32. Why does string concatenation fail for Tailwind in many setups?**

a) `Extractors look for explicit substrings; split patterns may not match candidates`
b) `Browsers block it`
c) `PostCSS forbids template strings`
d) `TypeScript removes className`

**Answer: a) `Build-time detection needs discoverable class strings`**

---

**33. Advanced plugin: custom modifiers may require:**

a) `Understanding Tailwind’s variant API and selector list composition`
b) `Writing SQL migrations`
c) `Patching the kernel`
d) `Using only CDN`

**Answer: a) `Variant API and selector composition`**

---

**34. PostCSS `from` and `map` options matter for Tailwind because:**

a) `Source maps and dependency tracking for incremental builds`
b) `They change HTML semantics`
c) `They set cookies`
d) `They configure TLS`

**Answer: a) `Source maps and correct file metadata for tooling`**

---

**35. In monorepos, per-package `content` arrays should include:**

a) `That package’s source files that contain class strings`
b) `Only README files`
c) `Only dist bundles if they contain raw class strings you rely on`
d) `Never include components`

**Answer: a) `Each package’s sources that include Tailwind classes`**

---

**36. Next.js App Router might place components under `app/`; content globs must:**

a) `Include those paths or utilities won’t generate`
b) `Exclude app always`
c) `Only include public/`
d) `Only include next.config.js`

**Answer: a) `Include app/ (and related dirs) in content`**

---

**37. Remix root stylesheet approach means Tailwind entry CSS should be:**

a) `Imported from a root route (or equivalent) so it applies globally`
b) `Embedded in favicon`
c) `Loaded only from a web worker`
d) `Banned`

**Answer: a) `Loaded via root/global stylesheet import pattern`**

---

**38. Astro `.astro` files require Tailwind to scan:**

a) `Astro templates where class attributes appear`
b) `Only standalone CSS files`
c) `Only package-lock.json`
d) `Only PNG assets`

**Answer: a) `Astro component templates with class attributes`**

---

**39. Accessibility: never removing outlines without replacement means:**

a) `Provide visible focus styles via focus or focus-visible utilities`
b) `Use outline-none everywhere without a replacement plan`
c) `Hide focus rings always`
d) `Rely on mouse only`

**Answer: a) `Replace default outlines with deliberate focus-visible styling`**

---

**40. Tailwind architecture: component abstraction is justified when:**

a) `Duplication is high and the pattern is stable and token-driven`
b) `You used a color once`
c) `You want to hide classes from scanning`
d) `You need slower builds`

**Answer: a) `High stable duplication with token alignment`**

---

**41. v4 migration planning for large codebases should include:**

a) `Audit config moves, plugin equivalents, and incremental rollout strategy`
b) `Delete tests`
c) `Remove all arbitrary values`
d) `Remove responsive prefixes`

**Answer: a) `Incremental rollout with config/plugin audits`**

---

**42. Advanced grid: `auto-fit` vs `auto-fill` differences are expressed in Tailwind via:**

a) `Arbitrary template utilities or extended theme keys, not only fixed 12-column grids`
b) `Only grid-cols-1`
c) `Only floats`
d) `Only table-row display`

**Answer: a) `Arbitrary grid templates when fixed counts aren’t enough`**

---

**43. `supports-[selector(:focus-visible)]:` might be used to:**

a) `Progressively enhance focus styling when a browser supports :focus-visible`
b) `Disable buttons`
c) `Load fonts`
d) `Parse JSON`

**Answer: a) `Progressive enhancement for focus-visible support`**

---

**44. Print styles with Tailwind often use:**

a) `print: variants for hiding nav and adjusting typography`
b) `only screen: variants for every rule`
c) `landscape: variants only`
d) `forced-colors: variants only`

**Answer: a) `print: variants for layout adjustments`**

---

**45. Touch-action utilities help with:**

a) `Gesture conflicts on mobile (panning/zooming) in carousels and maps`
b) `Server-side rendering only`
c) `SQL injection prevention`
d) `JWT signing`

**Answer: a) `Controlling pan/zoom gesture behavior`**

---

**46. `will-change` should be used:**

a) `Sparingly for known upcoming animations to avoid memory overhead`
b) `On every element always`
c) `Instead of layout`
d) `To replace alt text`

**Answer: a) `Sparingly for known animation hotspots`**

---

**47. Testing: snapshot tests for Tailwind-heavy UI risk:**

a) `Brittleness on any class reorder or refactors without behavior change`
b) `Perfect stability always`
c) `No maintenance`
d) `Automatic a11y proof`

**Answer: a) `Brittle diffs on class reorder without behavior changes`**

---

**48. Tailwind + design tokens + CI can enforce:**

a) `Lint rules for disallowed arbitrary values or class naming conventions`
b) `Random class names`
c) `No HTML`
d) `No CSS output`

**Answer: a) `Linting for disallowed patterns or conventions`**

---

**49. Expert layout: sticky sidebar inside a flex row often needs:**

a) `min-h-0 / overflow discipline so nested scroll areas behave`
b) `iframe per paragraph`
c) `float:left on sidebar`
d) `table layout mandatory`

**Answer: a) `min-h-0 and overflow rules for nested scrolling`**

---

**50. Container queries + responsive grids shine when:**

a) `Components must adapt inside cards/sidebars independent of viewport width`
b) `Only full-page layouts matter`
c) `You never reuse components`
d) `You only support one breakpoint`

**Answer: a) `Components live in variable-width containers`**

---
