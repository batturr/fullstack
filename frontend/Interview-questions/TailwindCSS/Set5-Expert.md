# Tailwind CSS MCQ - Set 5 (Expert Level)

**1. In Tailwind v3+, which engine generates utilities on demand as classes are detected?**

a) `AOT compiler only`
b) `JIT (Just-In-Time) engine`
c) `Runtime CSS interpreter in the browser`
d) `Sass preprocessor`

**Answer: b) `JIT (Just-In-Time) engine`**

---

**2. What is the high-level flow from `content` globs to final CSS?**

a) `Tailwind scans files, finds candidate class strings, generates matching rules, then tree-shakes unused`
b) `Tailwind downloads CSS from a CDN only`
c) `Browsers infer utilities from HTML tags`
d) `Webpack guesses classes from filenames`

**Answer: a) `Scan content, match utilities, emit CSS for used candidates`**

---

**3. Why is “purging” less of a manual concern with JIT + correct `content` paths?**

a) `Because unused utilities are not emitted if never detected`
b) `Because CSS is always 2KB`
c) `Because JIT disables optimization`
d) `Because HTML is not parsed`

**Answer: a) `JIT emits CSS for detected candidates, reducing unused output`**

---

**4. In `plugin(function ({ addUtilities, theme }) { ... })`, what is `addUtilities` for?**

a) `Register new rules in the utilities layer`
b) `Add npm scripts`
c) `Add HTML partials`
d) `Add PostCSS plugins automatically`

**Answer: a) `Register new utilities in the utilities layer`**

---

**5. Which API adds rules equivalent to reusable “component classes”?**

a) `addBase`
b) `addComponents`
c) `addExports`
d) `addPostCSS`

**Answer: b) `addComponents`**

---

**6. Which API injects global base styles or resets from a plugin?**

a) `addBase`
b) `addUtilities`
c) `addTheme`
d) `addPreflight`

**Answer: a) `addBase`**

---

**7. What does `matchUtilities` enable compared to static `addUtilities`?**

a) `Dynamic utility generation from arbitrary values using a matcher pattern`
b) `Only color utilities`
c) `Only breakpoints`
d) `Disables JIT`

**Answer: a) `Generate utilities dynamically from arbitrary values with a pattern`**

---

**8. What does `theme('colors.blue.500')` commonly represent inside a plugin?**

a) `Reading a value from the resolved Tailwind theme`
b) `Setting webpack mode`
c) `Opening a color picker`
d) `Importing a React component`

**Answer: a) `Reading a value from the resolved Tailwind theme`**

---

**9. What does `addVariant` allow you to register?**

a) `A new variant prefix that wraps selectors for utilities`
b) `A new HTML element`
c) `A new npm dependency`
d) `A new PostCSS parser`

**Answer: a) `A new variant prefix that wraps selectors`**

---

**10. Why is Tailwind often paired with “headless” UI libraries?**

a) `Headless libraries provide behavior and accessibility; Tailwind handles presentation`
b) `Headless libraries replace HTML`
c) `They cannot be used together`
d) `Headless means no CSS`

**Answer: a) `Headless provides logic/a11y; Tailwind styles the markup you render`**

---

**11. Radix-style primitives + Tailwind typically means:**

```html
<button
  type="button"
  class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white"
>
  Action
</button>
```

a) `You style unstyled parts with utility classes while keeping accessible semantics`
b) `You must use Bootstrap`
c) `You cannot customize focus rings`
d) `You lose keyboard navigation`

**Answer: a) `Style accessible primitives with utilities`**

---

**12. What is the core idea of shadcn/ui-style workflows with Tailwind?**

a) `Copy/paste accessible components you own, styled with Tailwind tokens`
b) `Only use inline styles`
c) `Ban custom themes`
d) `Ship a single global CSS file without components`

**Answer: a) `Own the component code and style it with Tailwind utilities/tokens`**

---

**13. Design tokens in a Tailwind design system often map to:**

a) `theme.extend values consumed consistently across apps`
b) `Random class names`
c) `Only hex colors in components`
d) `node_modules CSS only`

**Answer: a) `Central theme keys (colors, spacing, radii) used consistently`**

---

**14. Dynamic theming with CSS variables often involves:**

a) `Defining variables on :root or a wrapper and referencing them in theme or arbitrary values`
b) `Deleting tailwind.config`
c) `Using only inline styles for colors`
d) `Disabling dark mode`

**Answer: a) `Drive colors/spacing via CSS variables toggled at runtime`**

---

**15. Multiple themes (brand A/B) can be implemented by:**

a) `Swapping wrapper classes or variables while keeping the same utility vocabulary`
b) `Duplicating every HTML file`
c) `Using only CSS !important everywhere`
d) `Removing responsive variants`

**Answer: a) `Swap theme variables or wrapper class while reusing utilities`**

---

**16. Why can an enormous `safelist` hurt production CSS size?**

a) `It forces many utilities to be generated even if unused in content`
b) `It removes utilities`
c) `It disables minification`
d) `It only affects development`

**Answer: a) `Safelist forces inclusion of matched patterns regardless of scanning`**

---

**17. What is a best practice to keep CSS output small?**

a) `Ensure accurate content globs and avoid unnecessary safelist patterns`
b) `Import all of Bootstrap too`
c) `Disable JIT`
d) `Put every utility in a safelist`

**Answer: a) `Accurate content paths and minimal safelist`**

---

**18. Production builds should typically:**

a) `Minify CSS and enable Tailwind’s content scanning for dead code elimination`
b) `Ship the full development Tailwind CDN bundle always`
c) `Remove PostCSS`
d) `Avoid autoprefixer`

**Answer: a) `Minify and rely on proper scanning for smallest CSS`**

---

**19. Advanced arbitrary patterns like `grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]` show that:**

a) `Arbitrary values can encode complex layout expressions`
b) `Arbitrary values are forbidden`
c) `Only theme keys work`
d) `JIT cannot parse brackets`

**Answer: a) `Arbitrary values can encode complex CSS expressions`**

---

**20. Complex responsive layouts often combine:**

a) `Responsive grid/flex utilities, container queries (when needed), and consistent spacing tokens`
b) `Tables for all layout`
c) `Only absolute positioning`
d) `Fixed px widths everywhere`

**Answer: a) `Responsive flex/grid plus tokens and optional container queries`**

---

**21. Tailwind CSS v4 (high level) moved toward:**

a) `More CSS-first configuration and a new engine/pipeline improvements`
b) `Removing utilities entirely`
c) `Requiring jQuery`
d) `Dropping PostCSS forever in all setups`

**Answer: a) `CSS-first configuration and modernized tooling (directionally)`**

---

**22. v4 improvements often emphasize:**

a) `Faster builds and simpler authoring with native CSS features where possible`
b) `Removing dark mode`
c) `Removing arbitrary values`
d) `Removing plugins`

**Answer: a) `Faster builds and simpler CSS-native configuration patterns`**

---

**23. CSS-in-JS + Tailwind tension is mainly about:**

a) `Build-time class detection vs runtime style injection`
b) `They are identical`
c) `CSS-in-JS cannot use colors`
d) `Tailwind forbids components`

**Answer: a) `Ensuring class names are visible to Tailwind scanning in build pipelines`**

---

**24. `matchComponents` is used to:**

a) `Generate component-like classes dynamically from a pattern`
b) `Add eslint rules`
c) `Import fonts`
d) `Polyfill flexbox`

**Answer: a) `Generate component classes dynamically from a pattern`**

---

**25. A plugin that uses `addUtilities` with `respectPrefix: false` implies:**

a) `Utilities won’t be prefixed with your configured prefix`
b) `Dark mode breaks`
c) `JIT turns off`
d) `HTML must change`

**Answer: a) `Bypass configured selector prefixing for those utilities`**

---

**26. Why might you use `corePlugins` disable list?**

a) `Remove unused categories to reduce generated CSS surface`
b) `Increase bundle size`
c) `Enable experimental React compiler`
d) `Fix TypeScript errors`

**Answer: a) `Shrink CSS by disabling unneeded utility groups`**

---

**27. Tailwind “internals” of variant ordering matter because:**

a) `Later variants wrap earlier ones; wrong mental model causes confusing selectors`
b) `Variants are random`
c) `Variants only affect HTML`
d) `Variants are runtime-only`

**Answer: a) `Variant stacking builds nested selector transformations`**

---

**28. Performance optimization in a component library context often includes:**

a) `Shared preset config, consistent tokens, and avoiding huge safelists`
b) `One giant inline style per element`
c) `Loading all Google Fonts weights`
d) `Disabling compression`

**Answer: a) `Shared config/tokens and careful safelist usage`**

---

**29. Advanced arbitrary values can reference CSS functions like `min()` because:**

a) `Arbitrary brackets pass through to CSS declarations when valid`
b) `Tailwind evaluates min() at compile time always`
c) `Functions are banned`
d) `Only theme() works`

**Answer: a) `Valid CSS inside arbitrary values is emitted`**

---

**30. When extracting a component (React/Vue), Tailwind users often:**

a) `Keep utilities in the component template for colocation or wrap repeated patterns thoughtfully`
b) `Never reuse classes`
c) `Ban @apply always`
d) `Move all CSS to external stylesheets without listing them in content`

**Answer: a) `Colocate utilities or extract intentional abstractions`**

---

**31. `addBase` is appropriate for:**

a) `Element defaults like typography on the root or form controls globally`
b) `A single button component only`
c) `Tree shaking utilities`
d) `Image optimization`

**Answer: a) `Global element defaults and resets`**

---

**32. Why is regex-based safelist powerful but risky?**

a) `It can match many utilities and balloon CSS if too broad`
b) `It cannot match anything`
c) `It deletes classes`
d) `It only works in Safari`

**Answer: a) `Broad patterns can over-generate utilities`**

---

**33. Tailwind plugin `theme()` helper inside `addUtilities` callbacks helps:**

a) `Use consistent spacing/color scales instead of hardcoding raw values`
b) `Fetch REST APIs`
c) `Parse JSX`
d) `Render SSR`

**Answer: a) `Reference theme tokens instead of duplicating raw values`**

---

**34. “Utility generation” in JIT means:**

a) `Emit CSS rules when a class candidate is discovered during scanning`
b) `Emit every rule always`
c) `Emit rules at runtime in the browser`
d) `Emit rules based on cookies`

**Answer: a) `Emit on discovery during scanning`**

---

**35. Monorepo design systems with Tailwind often share:**

a) `A preset config extended per app + consistent content globs per package`
b) `Only node_modules paths`
c) `No config`
d) `Separate unrelated color systems`

**Answer: a) `Shared presets and per-package content paths`**

---

**36. Tailwind + component libraries (Material-style) conflicts are usually about:**

a) `Specificity, preflight differences, and class naming collisions`
b) `They never conflict`
c) `Tailwind cannot style divs`
d) `CSS variables are impossible`

**Answer: a) `Specificity, resets, and naming collisions need coordination`**

---

**37. Expert-level debugging of “missing utilities” starts with:**

a) `Verify class appears as a literal in scanned files and check safelist/content globs`
b) `Reinstall macOS`
c) `Delete HTML`
d) `Disable accessibility`

**Answer: a) `Confirm scanning paths and literal class strings`**

---

**38. Why might `!` important modifier be used sparingly?**

a) `It increases specificity wars and makes overrides harder`
b) `It does nothing`
c) `It removes styles`
d) `It is required for flexbox`

**Answer: a) `Important modifiers can create specificity escalation`**

---

**39. Tailwind’s `presets` feature is for:**

a) `Sharing a base configuration across projects`
b) `Importing images`
c) `Setting cookies`
d) `Bundling WASM`

**Answer: a) `Sharing a base configuration across projects`**

---

**40. Advanced theming with multiple color schemes might combine:**

a) `class strategy, CSS variables, and semantic token names (e.g. bg-background)`
b) `Only inline styles for every pixel`
c) `Deleting breakpoints`
d) `Using tables for colors`

**Answer: a) `CSS variables + semantic utilities + dark variants`**

---

**41. `matchUtilities` pairs well with arbitrary values when you need:**

a) `A family of utilities that accept many bracket values safely`
b) `Only fixed px widths`
c) `No variants`
d) `Runtime CSS injection`

**Answer: a) `Systematic support for many arbitrary values`**

---

**42. Content scanning limitations imply:**

a) `Dynamic class composition may need safelist or static safeties`
b) `All strings are always detected`
c) `Comments count as utilities`
d) `JSON never scans`

**Answer: a) `Dynamic strings may need safelist or static fallbacks`**

---

**43. Tailwind performance tuning in CI often checks:**

a) `CSS output size trends and build time regressions`
b) `Only unit test count`
c) `Only image DPI`
d) `Only favicon size`

**Answer: a) `CSS size and build time`**

---

**44. Design system “consistent scales” means:**

a) `Spacing, type, and radii align to shared increments to reduce one-off values`
b) `Every value is random`
c) `Only prime numbers`
d) `Only em units forbidden`

**Answer: a) `Shared increments for spacing/type/radius`**

---

**45. Why do teams document “allowed patterns” for Tailwind?**

a) `To keep layouts maintainable and prevent one-off arbitrary soup`
b) `To ban utilities`
c) `To remove responsive design`
d) `To require Bootstrap`

**Answer: a) `Maintainability and fewer arbitrary one-offs`**

---

**46. v4 “CSS-first” direction affects experts by:**

a) `Shifting some configuration from JS config to CSS-native constructs in many setups`
b) `Removing HTML`
c) `Removing PostCSS always`
d) `Removing plugins always`

**Answer: a) `More configuration expressed in CSS in modern workflows`**

---

**47. Complex responsive layout with sidebar + content often uses:**

```html
<div class="flex min-h-screen">
  <aside class="hidden w-64 shrink-0 border-r md:block">Nav</aside>
  <main class="min-w-0 flex-1 overflow-auto">Content</main>
</div>
```

a) `grid/flex with responsive col spans, overflow handling, and sticky headers`
b) `iframes only`
c) `float:right for sidebar`
d) `marquee tags`

**Answer: a) `Flex/grid with responsive spans and overflow discipline`**

---

**48. `addVariant` with a function form can implement:**

a) `Custom selector transformations beyond built-ins`
b) `REST routing`
c) `SQL queries`
d) `GPU shaders`

**Answer: a) `Custom selector transformations`**

---

**49. Tailwind “architecture decision”: prefer utilities unless:**

a) `A pattern repeats broadly and abstraction reduces noise without harming scanning`
b) `You use any color`
c) `You use any HTML`
d) `You use CDN`

**Answer: a) `Abstract only when repetition is real and scanning stays safe`**

---

**50. Expert mental model: Tailwind is a:**

a) `Design-token-aware CSS compiler that generates rules from class candidates`
b) `Component library like Bootstrap`
c) `JavaScript framework`
d) `Database ORM`

**Answer: a) `Token-aware CSS compiler driven by class candidates`**

---
