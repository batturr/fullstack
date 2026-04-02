# Tailwind CSS 4 Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

---

## 1. What is Tailwind CSS, and why do teams use it?

Tailwind CSS is a utility-first CSS framework: instead of writing large bespoke stylesheets with custom class names like `card` or `hero`, you compose small, single-purpose classes (`flex`, `p-4`, `text-slate-700`) directly in your markup to build layouts and visuals. Each utility maps to a predictable CSS rule, so you avoid naming fatigue and reduce context switching between HTML and separate CSS files for routine styling. Teams adopt it because design tokens (spacing, colors, type scale) stay consistent through shared configuration, and refactors are often safer because you see all styles where the element is declared. Tailwind ships with a compiler that scans your templates and emits only the CSS you actually use, which keeps production bundles small compared to shipping a monolithic framework stylesheet. For freshers, the mental shift is treating the class list as a styling API rather than as semantic hooks for separate CSS files.

```html
<button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
  Save
</button>
```

---

## 2. What does “utility-first” mean in Tailwind?

Utility-first means your primary styling unit is a short class that does one job: `mt-6` adds margin-top, `text-center` sets text-align, `max-w-md` constrains width. You combine many utilities to express a design instead of inventing a new class name for every component variation. This differs from “semantic CSS” where you might write `.login-form { ... }` and keep rules in another file; in Tailwind, the composition lives beside the markup. The approach trades custom names for explicitness: teammates can read the class list and know exactly which properties apply without hunting through stylesheets. Utility-first does not forbid component abstraction; you still extract repeated patterns into framework components or use `@apply` sparingly when a pattern stabilizes.

```html
<article class="mx-auto max-w-prose space-y-4 px-6 py-10">
  <h1 class="text-3xl font-bold tracking-tight">Title</h1>
  <p class="leading-relaxed text-slate-600">Body copy.</p>
</article>
```

---

## 3. How does Tailwind differ from Bootstrap or traditional hand-written CSS?

Bootstrap ships opinionated components (buttons, navbars, modals) with predefined look-and-feel; you often override its defaults or fight specificity when you need a custom design system. Traditional CSS usually separates concerns: HTML for structure, CSS files for presentation, with BEM or similar naming conventions to avoid collisions. Tailwind inverts the workflow for day-to-day layout: you style in place with utilities, and the framework generates CSS from a constrained design token set rather than from hand-authored rule blocks. You still write custom CSS when Tailwind’s primitives are not enough, but routine spacing, flex alignment, and typography rarely need new class names. Compared to Bootstrap, Tailwind is lower-level and more composable; compared to raw CSS, it is more systematic and faster to iterate for common UI tasks.

```html
<!-- Tailwind: utilities compose without new CSS files -->
<div class="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
  <span class="font-semibold">Item</span>
  <span class="text-sm text-slate-500">Meta</span>
</div>
```

---

## 4. What is new or different in Tailwind CSS v4 compared to v3?

Tailwind CSS v4 moves toward a CSS-native workflow: you import the framework with `@import "tailwindcss"` in your CSS entry file instead of the older `@tailwind base; @tailwind components; @tailwind utilities` directives. Configuration is CSS-first by default—theme customization often lives in CSS using `@theme { ... }` rather than requiring a `tailwind.config.js` file for typical projects. The new Oxide engine (Rust-powered) speeds up builds and incremental compilation, which matters as projects grow. Content detection is more automatic in many setups, reducing the need to manually list template paths in a `content` array. V4 also leans on modern CSS features (for example `color-mix()`, `@starting-style`) where they improve theming and interactions, while keeping the utility vocabulary familiar to v3 users.

```css
@import "tailwindcss";

@theme {
  --font-display: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

---

## 5. How do you install Tailwind CSS 4 in a new project?

You typically add Tailwind as a dev dependency alongside a bundler or build tool that processes CSS (Vite is a common choice). After installing `tailwindcss` and any required PostCSS plugin if your stack uses PostCSS, you create a CSS entry file that imports Tailwind with `@import "tailwindcss"`. You then wire that CSS file into your application’s entry (for example `main.tsx` or `main.js`) so the build pipeline includes it. The exact package manager command depends on npm, pnpm, or yarn, but the pattern is `npm install -D tailwindcss` at minimum. You verify setup by adding a few utility classes to HTML and confirming compiled CSS contains the expected rules in dev tools.

```bash
npm install -D tailwindcss
```

```css
/* src/styles.css */
@import "tailwindcss";
```

---

## 6. Is `tailwind.config.js` still required in Tailwind v4?

In Tailwind CSS v4, a JavaScript configuration file is no longer the default starting point for many apps. Theme tokens, breakpoints, and font families can be defined in CSS using `@theme`, which keeps styling concerns colocated with your stylesheet imports. You can still use a config file when you need programmatic integration or legacy tooling, but fresh projects often begin with zero `tailwind.config.js`. This CSS-first default reduces context switching between JS config and CSS files for common customization. If your team relies on plugins or complex JS-only logic, you may still adopt a config layer, but it is not assumed for basic theming anymore.

```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.62 0.19 264);
  --breakpoint-3xl: 120rem;
}
```

---

## 7. What role does PostCSS play with Tailwind?

PostCSS is a tool that transforms CSS with plugins; Tailwind historically ran as a PostCSS plugin that expanded `@tailwind` directives and applied transforms like autoprefixing when configured. In Tailwind v4, depending on your integration, you may still use PostCSS in pipelines that expect it, or use first-class integrations such as the Vite plugin that wraps the compiler. The important idea for interviews is that Tailwind is not a runtime library in the browser—it is a build-time compiler that outputs static CSS. PostCSS remains a common plumbing layer in many stacks even as Tailwind’s Oxide engine improves performance.

```js
// postcss.config.js (example pattern — exact shape depends on toolchain)
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

---

## 8. What is the Oxide engine in Tailwind v4?

The Oxide engine is Tailwind’s newer high-performance compiler pipeline, implemented with Rust for speed and safety during CSS generation and incremental rebuilds. It replaces slower pure-JavaScript parsing paths for large projects and improves developer experience when file watchers run on every save. For freshers, think of Oxide as the “engine under the hood” that scans your templates and emits optimized CSS with minimal latency. You rarely configure Oxide directly; you benefit from it automatically when using supported Tailwind v4 tooling. Faster builds reduce friction when iterating on utility-heavy UIs.

---

## 9. What is automatic content detection in Tailwind v4?

In earlier versions, you often listed glob paths in `tailwind.config.js` under `content` so Tailwind knew which files contained class names to scan. Tailwind v4 improves ergonomics with automatic content detection in many setups: the toolchain discovers source files in common locations without manual globs for typical project layouts. This lowers beginner mistakes where classes are “missing” from production CSS because a template folder was omitted from `content`. You should still understand that Tailwind only emits utilities for class names it can find during the build; dynamic string concatenation that hides class names can still break purging. When automatic detection does not fit an unusual structure, you can configure paths explicitly.

---

## 10. How does Tailwind keep production CSS small?

Tailwind generates utilities on demand based on the class names detected in your source files, so unused utilities are not shipped in the final stylesheet in a typical production build. This “tree-shaking” style output contrasts with downloading a full framework CSS file where most rules are never used. Minification and modern tooling further compress the result. The discipline of using design tokens also prevents one-off magic numbers from proliferating across the codebase. For very large apps, build caching and the Oxide engine keep rebuild times manageable as the utility set grows.

---

## 11. How do you integrate Tailwind CSS 4 with Vite?

You add Tailwind as a dev dependency and import your global stylesheet that contains `@import "tailwindcss"` from your application entry (for example `main.tsx`). The official Vite plugin for Tailwind v4 (`@tailwindcss/vite`) processes Tailwind as part of the dev server and production build, giving fast HMR when you edit templates. You point Vite at your HTML/JSX sources as usual; Tailwind’s scanner reads those files through the integration. After setup, running `vite` should show your utility classes applied without a separate CSS preprocessor step unless your stack needs one.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

---

## 12. What does `@import "tailwindcss"` do?

The `@import "tailwindcss"` statement pulls in Tailwind’s layers, base styles, and the utility system from a single entry point in your CSS file. It replaces the older trio of `@tailwind base`, `@tailwind components`, and `@tailwind utilities` that v3 documentation emphasized. This single import aligns with Tailwind v4’s CSS-first architecture and simplifies mental models for newcomers. After compilation, the output is normal CSS your browser understands. You keep this import at the top level of your main stylesheet so downstream `@theme` and custom layers compose predictably.

```css
@import "tailwindcss";

body {
  font-family: var(--font-sans);
}
```

---

## 13. What is CSS-first configuration in Tailwind v4?

CSS-first configuration means you express design tokens and framework customization primarily in CSS using directives like `@theme`, rather than exporting a JavaScript object from `tailwind.config.js`. This keeps theme values next to `@import "tailwindcss"` and leverages native CSS capabilities such as custom properties. It also makes it easier for designers and developers to reason about tokens without switching files for every tweak. JavaScript configuration remains available when you need it, but the happy path for many apps is now stylesheet-driven.

```css
@import "tailwindcss";

@theme {
  --radius-xl: 1rem;
  --font-sans: ui-sans-serif, system-ui, sans-serif;
}
```

---

## 14. What is the `@theme` directive used for?

The `@theme` directive declares design tokens that Tailwind turns into utilities and CSS variables, such as colors, spacing scales, fonts, breakpoints, and radii. Values you define in `@theme` become part of the framework’s generated utility map—for example a `--color-accent` token might unlock `bg-accent`, `text-accent`, and related utilities depending on naming conventions. This centralizes theming and supports consistent refactoring when brand colors change. Because tokens compile to CSS custom properties where appropriate, you can also reference them in hand-written CSS for components that are not utility-only.

```css
@import "tailwindcss";

@theme {
  --color-accent: #6366f1;
  --spacing-18: 4.5rem;
}
```

```html
<div class="bg-accent p-18">Themed panel</div>
```

---

## 15. How do you add custom colors in Tailwind v4?

You define color tokens inside `@theme` using CSS custom property syntax; Tailwind generates utilities from those tokens following its naming rules. Prefer semantic names (`--color-primary`, `--color-danger`) so your markup reads meaningfully (`bg-primary`, `text-danger`). You can use modern color functions like `oklch()` or `color-mix()` when you need perceptually uniform ramps. After adding tokens, rebuild the project so the compiler picks up new utilities. This approach avoids scattering raw hex values across JSX while keeping a single source of truth.

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.62 0.19 264);
  --color-surface: color-mix(in oklab, white 92%, var(--color-primary));
}
```

---

## 16. Do you still need `@tailwind base/components/utilities` in v4?

In Tailwind CSS v4, the recommended entry is `@import "tailwindcss"`, which supersedes manually listing the three `@tailwind` layers for standard setups. The older directives remain conceptually valid in the ecosystem’s mental model—base, components, utilities—but the import form is the streamlined default. Migrating projects should replace the three lines with the single import and then move theme customizations into `@theme` as needed. This reduces boilerplate and matches documentation for new projects.

---

## 17. What is the difference between dev and production CSS output?

In development, tooling often emphasizes fast rebuilds, source maps, and sometimes unminified CSS for easier debugging in browser dev tools. In production, CSS is minified, deduplicated, and tree-shaken so only used utilities ship, reducing download size and parse time. Tailwind’s compiler runs in both modes, but production pipelines may enable additional optimizers. Freshers should connect “small CSS” to faster LCP and better mobile performance, not just smaller disk files.

---

## 18. How does Tailwind handle vendor prefixes and browser support?

Tailwind generates modern CSS and relies on your build tooling (Autoprefixer or equivalent) when your browser matrix requires prefixed properties for certain features. The exact setup depends on Browserslist configuration in your project. Utilities abstract away many cross-browser details, but when you drop into raw CSS for cutting-edge features, you remain responsible for fallbacks. Interviewers often check whether you understand that Tailwind is not a polyfill for JavaScript APIs.

---

## 19. Can you use Tailwind with frameworks like React, Vue, or Svelte?

Yes. Tailwind is framework-agnostic: you add utility classes to JSX, Vue templates, or Svelte markup, and the build tool scans those files. Component-based frameworks pair well because repeated utility clusters become reusable components. Each framework’s styling conventions (CSS modules, styled components) can coexist, but many teams use utilities directly for layout. Ensure your bundler processes the CSS entry with Tailwind’s plugin so class scanning sees all component files.

```jsx
export function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
      {children}
    </span>
  );
}
```

---

## 20. What files do you typically commit for a Tailwind v4 project?

You commit your CSS entry with `@import "tailwindcss"` and any `@theme` customizations, plus framework source files and build configuration (`package.json`, `vite.config.ts`, etc.). You generally do not commit generated `node_modules` or ephemeral build artifacts. If your team uses optional `tailwind.config.js` or PostCSS config, commit those too so CI matches local builds. Documentation of design tokens in code comments is optional; the `@theme` block itself is the source of truth.

---

## 21. How do padding and margin utilities work (`p-*`, `m-*`)?

Padding and margin utilities follow a spacing scale where the suffix maps to a rem-based size from your theme (for example `p-4`, `mt-6`, `mx-auto`). The prefix letter tells you which side: `t` top, `r` right, `b` bottom, `l` left, `x` horizontal pair, `y` vertical pair, or no side letter for all sides. `mx-auto` is a special case commonly used to center block-level elements with a defined width. These utilities replace ad hoc `margin: 12px` declarations with consistent tokens, which keeps vertical rhythm aligned across screens.

```html
<section class="mx-auto max-w-3xl px-4 py-10 md:px-8">
  <h2 class="mb-4 text-2xl font-semibold">Section</h2>
  <p class="mb-6">Paragraph with bottom margin.</p>
</section>
```

---

## 22. What is the spacing scale, and why use theme values instead of arbitrary pixels?

Tailwind’s spacing scale is a constrained set of steps (often based on `0.25rem` increments) referenced by utilities like `p-3`, `gap-4`, `top-8`. Using the scale instead of random pixel values keeps layouts visually harmonious and reduces bikeshedding in code review. When you need a one-off size, arbitrary values exist, but defaults should favor tokens. Consistent spacing also simplifies responsive tweaks because you change scale steps (`md:p-8`) rather than re-specifying entire rule blocks.

```html
<div class="space-y-3">
  <div class="h-2 rounded bg-slate-200"></div>
  <div class="h-2 rounded bg-slate-200"></div>
</div>
```

---

## 23. How do width and height utilities (`w-*`, `h-*`, `max-w-*`) behave?

`w-full` sets width to 100% of the parent; `h-screen` sets height to 100vh; `max-w-prose` limits line length for readability. Fixed sizes like `w-64` map to theme spacing or sizing keys, while fractional widths (`w-1/2`, `w-2/3`) express percentages in a utility-friendly way. `min-h-*` and `max-h-*` help with flex layouts and overflow control. Understanding these utilities is essential for responsive cards, media objects, and full-bleed sections.

```html
<div class="flex min-h-screen w-full items-center justify-center bg-slate-50">
  <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">Card</div>
</div>
```

---

## 24. What do `display` utilities like `block`, `inline-flex`, `hidden` do?

They set the CSS `display` property: `block` stacks elements as block boxes; `inline-flex` makes an inline-level flex container; `hidden` sets `display: none` and removes the element from layout. `sr-only` is a special utility that visually hides content but keeps it available to screen readers. Choosing the right display value is the first step in layout before flex or grid properties apply. Interviewers expect you to connect `hidden` with conditional rendering patterns in frameworks.

```html
<div class="hidden md:block">Desktop only</div>
<button type="button" class="inline-flex items-center gap-2">
  <span>Open</span>
</button>
```

---

## 25. How do typography utilities (`text-*`, `font-*`, `leading-*`) work?

`text-sm`, `text-lg` control font size; `font-semibold`, `font-medium` control weight; `leading-tight`, `leading-relaxed` control line-height; `tracking-tight` adjusts letter-spacing. `text-left`, `text-center`, `text-right` set horizontal alignment, while `text-balance` can improve heading wraps in supporting browsers. These utilities encode a typographic system so body copy and headings stay consistent. Combined with `max-w-prose`, you can build readable article layouts quickly.

```html
<h1 class="text-balance text-3xl font-bold tracking-tight text-slate-900">Balanced title</h1>
<p class="mt-3 text-base leading-relaxed text-slate-600">Comfortable reading.</p>
```

---

## 26. How do text and background color utilities work?

`text-slate-700` sets `color`, while `bg-indigo-500` sets `background-color`, using names from the palette defined in your theme. Opacity variants like `bg-black/50` apply alpha without separate CSS rules in modern Tailwind versions. Gradients use utilities such as `bg-gradient-to-r` combined with `from-*` and `to-*` stops. Understanding foreground/background pairing is important for contrast and accessibility (WCAG). Always test color combinations with contrast checkers, not just aesthetic preference.

```html
<div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white">
  <p class="text-indigo-50">Subtle contrast on gradient.</p>
</div>
```

---

## 27. What is `space-x-*` / `space-y-*` for?

These utilities add consistent gaps between child elements by applying margins to adjacent siblings, which is convenient for simple stacks without wrapping every child in a flex container. `space-y-4` adds vertical spacing between block siblings; `space-x-3` adds horizontal spacing between inline or flex row children. They differ slightly from `gap` utilities, which require flex or grid containers. Choose `gap` when you already use flex/grid; use `space-*` for quick vertical lists.

```html
<ul class="space-y-2">
  <li class="rounded border border-slate-200 p-3">One</li>
  <li class="rounded border border-slate-200 p-3">Two</li>
</ul>
```

---

## 28. What is `overflow-*` used for?

`overflow-hidden` clips content to the box and is common for rounded images; `overflow-auto` adds scrollbars when needed; `overflow-x-auto` enables horizontal scrolling for wide tables on small screens. These utilities help you manage content that exceeds its container without writing custom CSS for every card or table. Pair `truncate` (which relies on `overflow-hidden`) with `text-ellipsis` and `whitespace-nowrap` for single-line ellipsis patterns.

```html
<div class="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-3 text-sm">
  Long scrollable content…
</div>
```

---

## 29. How do `position` utilities (`relative`, `absolute`, `fixed`, `sticky`) work?

They set CSS positioning so you can layer elements: `relative` establishes a containing block for absolutely positioned children; `absolute` removes the element from normal flow relative to the nearest positioned ancestor; `fixed` positions relative to the viewport; `sticky` toggles between relative and fixed based on scroll offset. Combine with `top-*`, `right-*`, `inset-*` utilities for offsets. These are essential for modals, dropdowns, and sticky headers.

```html
<header class="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
  Sticky bar
</header>
```

---

## 30. What is `z-*` for?

`z-index` utilities control stacking order when elements overlap (`z-0`, `z-10`, `z-50`, `z-auto`). Higher values paint above lower values within the same stacking context. Misunderstood z-index bugs often come from new stacking contexts created by transforms or opacity; Tailwind does not magically fix that, but consistent `z-*` tokens reduce chaos. Use `z-50` for dropdowns and overlays only if your design system reserves that layer.

```html
<div class="relative z-10">Above</div>
<div class="relative z-0">Below</div>
```

---

## 31. What does `flex` do in Tailwind?

The `flex` utility sets `display: flex` on a container, enabling flexbox layout for its children. Once applied, child elements follow flex rules for direction, alignment, and distribution. Flexbox is ideal for one-dimensional layouts: toolbars, button groups, vertically centered hero content. It pairs with `flex-row` or `flex-col` to choose main axis orientation. Understanding flex containers versus flex items is the foundation for the next utilities.

```html
<div class="flex gap-3">
  <button class="rounded-md bg-slate-900 px-3 py-1.5 text-white">Primary</button>
  <button class="rounded-md border border-slate-300 px-3 py-1.5">Secondary</button>
</div>
```

---

## 32. What is the difference between `flex-row` and `flex-col`?

`flex-row` lays items along the horizontal main axis (default in Tailwind’s flex shorthand patterns), while `flex-col` stacks items vertically by setting `flex-direction: column`. Responsive prefixes let you switch: `flex-col md:flex-row` is a classic pattern for mobile-first navigation. The main axis determines how `justify-*` and gaps apply, so changing direction changes the mental model of “horizontal vs vertical” spacing. Interviewers may ask you to sketch how `justify-between` behaves under each direction.

```html
<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <span>Title</span>
  <span>Actions</span>
</div>
```

---

## 33. How do `justify-*` utilities work?

`justify-start`, `justify-center`, `justify-end`, `justify-between`, `justify-around`, and `justify-evenly` control alignment along the main axis of a flex container. They answer “how are items distributed on the row or column axis?” For a row flex, this is usually horizontal distribution; for `flex-col`, it affects vertical distribution. These utilities map directly to `justify-content` in CSS. They are frequently combined with `items-*` for the cross axis.

```html
<div class="flex justify-between border-b pb-3">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## 34. How do `items-*` utilities work?

`items-start`, `items-center`, `items-end`, `items-stretch`, and `items-baseline` align flex items along the cross axis (perpendicular to the main axis). If you have a row flex, `items-center` vertically centers items of differing heights. This is different from `justify-*`, which operates on the main axis. Getting both axes right is how you build polished toolbars and form rows.

```html
<div class="flex items-center gap-2">
  <input class="h-10 flex-1 rounded-md border border-slate-300 px-3" />
  <button class="h-10 rounded-md bg-slate-900 px-4 text-white">Go</button>
</div>
```

---

## 35. What does `gap-*` do in flex layouts?

`gap-*` sets consistent spacing between flex items without manual margins on children, using the CSS `gap` property. It avoids first/last child margin hacks and works cleanly when wrapping. You can use `gap-x-*` and `gap-y-*` for independent row and column gaps in wrapped flex layouts. This utility is preferred over `space-x-*` when you are already in flex or grid.

```html
<div class="flex flex-wrap gap-3">
  <span class="rounded-full bg-slate-100 px-3 py-1 text-sm">Tag A</span>
  <span class="rounded-full bg-slate-100 px-3 py-1 text-sm">Tag B</span>
</div>
```

---

## 36. What is `flex-wrap` and when do you need it?

`flex-wrap` allows flex items to wrap onto multiple lines when they exceed the container width, while `flex-nowrap` keeps them on one line (often causing overflow). `flex-wrap-reverse` exists but is rare. Wrapping is essential for responsive chip lists and tag clouds. When items wrap, `gap` still applies between rows and columns, simplifying layout math.

```html
<div class="flex flex-wrap gap-2">
  <!-- many chips -->
</div>
```

---

## 37. What do `flex-1`, `grow`, and `shrink` utilities mean?

`flex-1` typically sets `flex: 1 1 0%`, letting an item grow and shrink to fill available space equally with siblings. `grow` and `grow-0` toggle `flex-grow`; `shrink` and `shrink-0` toggle `flex-shrink`. `shrink-0` is useful for icons or badges that must not compress in tight flex rows. These utilities implement the flex shorthand properties without writing custom CSS.

```html
<div class="flex">
  <aside class="w-64 shrink-0 border-r p-4">Nav</aside>
  <main class="min-w-0 flex-1 p-6">Content</main>
</div>
```

---

## 38. How does `order-*` work in flexbox?

`order-first`, `order-last`, and numeric `order-*` utilities set the CSS `order` property to rearrange flex items without changing HTML order—useful for responsive layouts where visual priority differs from DOM order. Accessibility caution: screen readers follow DOM order, so do not rely on `order` to fix illogical markup for assistive technology users; prefer meaningful source order. For purely decorative reordering on large screens, `order` is acceptable.

```html
<div class="flex flex-col md:flex-row">
  <div class="order-2 md:order-1">Main</div>
  <aside class="order-1 md:order-2">Aside</aside>
</div>
```

---

## 39. What is `self-*` for?

`self-auto`, `self-start`, `self-center`, `self-end`, `self-stretch` align an individual flex item along the cross axis, overriding the container’s `items-*` setting for that item alone. This helps when one button should align to the bottom while siblings top-align. It maps to `align-self` in CSS.

```html
<div class="flex h-24 items-start gap-3">
  <div class="rounded bg-slate-200 p-2">A</div>
  <div class="self-end rounded bg-slate-200 p-2">B</div>
</div>
```

---

## 40. Why is `min-w-0` often added to flex children?

Flex items default to `min-width: auto`, which can prevent shrinking below content size and cause overflow in flex rows. Adding `min-w-0` allows the item to shrink and lets truncation (`truncate`) work inside nested flex layouts. This is a common “gotcha” in interview questions about overflowing text in flex containers. It demonstrates that Tailwind utilities map to real CSS quirks you must understand.

```html
<div class="flex">
  <div class="min-w-0 flex-1 truncate">Long filename………………………</div>
  <button class="shrink-0">⋮</button>
</div>
```

---

## 41. What does `grid` do in Tailwind?

The `grid` utility sets `display: grid` on a container, enabling two-dimensional layout with explicit rows and columns. Unlike flexbox, grid handles both axes simultaneously, which suits dashboards, image galleries, and complex forms. You define tracks with `grid-cols-*` and `grid-rows-*`, then place items with column and row span utilities. Grid is powerful but has a steeper learning curve than flex for beginners.

```html
<div class="grid grid-cols-3 gap-4">
  <div class="rounded-lg bg-slate-100 p-4">1</div>
  <div class="rounded-lg bg-slate-100 p-4">2</div>
  <div class="rounded-lg bg-slate-100 p-4">3</div>
</div>
```

---

## 42. How do `grid-cols-*` utilities work?

`grid-cols-1`, `grid-cols-12`, `grid-cols-[repeat(3,minmax(0,1fr))]` (arbitrary) define the number and pattern of column tracks. Responsive variants like `md:grid-cols-2` change the column count at breakpoints for mobile-first layouts. These utilities correspond to `grid-template-columns`. Choosing a 12-column system is common for app layouts mirroring design tools.

```html
<div class="grid grid-cols-1 gap-6 md:grid-cols-12">
  <section class="md:col-span-8">Main</section>
  <aside class="md:col-span-4">Side</aside>
</div>
```

---

## 43. What are `grid-rows-*` utilities for?

They define row tracks via `grid-template-rows`, useful for full-viewport sections (`grid-rows-[auto,1fr,auto]`) or fixed header/footer patterns. Less common than column utilities but important for vertical rhythm in certain dashboards. Combine with `min-h-screen` to stretch rows.

```html
<div class="grid min-h-screen grid-rows-[auto,1fr,auto]">
  <header>Header</header>
  <main class="overflow-auto">Body</main>
  <footer>Footer</footer>
</div>
```

---

## 44. How do `col-span-*` and `row-span-*` work?

`col-span-2` makes an item cover two columns; `row-span-3` covers three rows. `col-start-*` and `col-end-*` help with explicit line-based placement when needed. Span utilities map to `grid-column` and `grid-row` shorthand. They are essential for featured tiles in card grids.

```html
<div class="grid grid-cols-4 gap-3">
  <div class="col-span-2 rounded-lg bg-indigo-100 p-6">Wide</div>
  <div class="rounded-lg bg-slate-100 p-6">Narrow</div>
  <div class="rounded-lg bg-slate-100 p-6">Narrow</div>
</div>
```

---

## 45. What is `gap` in CSS Grid versus margin hacks?

`gap` sets spacing between grid tracks without affecting outer margins, producing cleaner layouts than applying margins to each cell. Tailwind’s `gap-*`, `gap-x-*`, and `gap-y-*` utilities work for both grid and flex in modern browsers. Consistent gaps help align baselines across a page. This is preferred over percentage margins on children.

```html
<div class="grid grid-cols-2 gap-6">
  <article class="rounded-xl border p-4">A</article>
  <article class="rounded-xl border p-4">B</article>
</div>
```

---

## 46. What do `place-items-*` and `place-content-*` do?

`place-items-center` sets both `align-items` and `justify-items` for grid containers, centering items within their grid areas. `place-content-center` aligns the entire grid within the container when extra space exists, using `place-content`. These are convenient shortcuts for hero sections and empty states. Understanding the difference between item alignment and track alignment separates intermediate from beginner grid knowledge.

```html
<div class="grid min-h-[16rem] place-items-center rounded-2xl border border-dashed">
  <p class="text-sm text-slate-500">Drop files here</p>
</div>
```

---

## 47. What is `auto-flow` in Tailwind (`grid-flow-*`)?

`grid-flow-row`, `grid-flow-col`, `grid-flow-dense`, and combinations control whether the auto-placement algorithm fills rows or columns first and whether it packs densely. Dense packing can reorder visual flow, so use carefully for accessibility. These map to `grid-auto-flow`.

```html
<div class="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto">
  <!-- horizontal scroller of grid tracks -->
</div>
```

---

## 48. How do `justify-items` and `align-items` differ in grid?

In grid layout, `justify-items` aligns content within each cell along the inline axis, while `align-items` aligns along the block axis (for default horizontal writing modes, think horizontal vs vertical within the cell). Tailwind exposes `justify-items-*` and `items-*` (for grid and flex) with similar names, which can confuse beginners—context matters. Interview answers should mention writing mode and axis awareness for bonus points.

---

## 49. When would you pick Grid over Flexbox?

Choose Grid when you need two-dimensional alignment with explicit rows and columns, such as complex dashboards, bento layouts, or overlapping regions. Choose Flexbox for one-dimensional distributions: navbars, button rows, vertically stacked forms. Many UIs combine both: a grid page layout with flex inside each cell. Tailwind makes experimenting cheap, but architectural clarity still matters.

---

## 50. What are `subgrid` considerations in modern CSS?

`grid-rows-subgrid` and related utilities (where supported) let nested grids align to parent tracks for complex alignment across sections. Browser support and Tailwind feature exposure evolve; interviewers may only expect awareness that subgrid solves parent-child track alignment problems. Check current Tailwind docs for class names in your version. Conceptually, subgrid reduces duplicate track definitions.

---

## 51. What breakpoints does Tailwind use (`sm`, `md`, `lg`, `xl`, `2xl`)?

Tailwind provides default min-width breakpoints where each prefix applies at that width and above (mobile-first). Typical defaults are `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`, though projects can override them in `@theme`. A class like `md:flex` applies `display:flex` only from `md` upward; below that, non-prefixed classes or smaller breakpoints control behavior. Understanding min-width semantics is critical: `md:text-center` does not mean “only at md,” it means “md and larger.”

```html
<div class="px-4 sm:px-6 lg:px-8">
  Responsive padding.
</div>
```

---

## 52. What does mobile-first mean in Tailwind?

Mobile-first means unprefixed utilities apply to all screen sizes, and you add larger breakpoints to enhance or override layout as viewport width increases. You design the narrow screen experience first, then progressively add columns, side navigation, or larger typography using `sm:`, `md:`, etc. This matches CSS media query best practices where base styles target small screens. It reduces the number of overrides compared to desktop-first approaches.

```html
<h1 class="text-2xl md:text-4xl">Responsive heading</h1>
```

---

## 53. How do responsive prefixes compose with multiple utilities?

You can chain breakpoints on the same element: `text-sm md:text-base lg:text-lg`. Each breakpoint layer applies when its min-width matches, with later rules overriding earlier ones in the generated CSS according to specificity and source order managed by Tailwind. You can combine breakpoints with state variants: `md:hover:bg-slate-100`. Understanding source order helps debug “why isn’t my `lg:` class working,” often due to conflicting unprefixed utilities.

---

## 54. What is the `container` class?

The `container` utility sets `max-width` at each breakpoint to align content with a centered column width, often used for page shells. Behavior can be customized via theme to match your grid system. Some teams prefer explicit `max-w-*` and `mx-auto` instead for clearer control. Know that `container` is not automatic margin centering unless your configuration enables it—check defaults in your version.

```html
<div class="container mx-auto px-4">Centered shell</div>
```

---

## 55. Can you target max-width instead of min-width?

Tailwind’s default responsive system is min-width based; for max-width targeting, use the `max-*` variant where available (for example `max-md:`) if enabled in your version and configuration. This lets you apply styles only below a threshold, which is handy for disabling hover effects on coarse pointers or simplifying mobile-only styles. Always verify which variants your project exposes.

```html
<div class="text-base max-md:text-sm">Smaller on narrow screens</div>
```

---

## 56. How do you debug responsive classes that seem ignored?

Check whether a non-responsive utility later in the class list or with higher specificity conflicts; remember that Tailwind’s generated order follows a deterministic sorting, not your HTML string order. Inspect computed styles in dev tools to see which rule wins. Also verify you are not inside an iframe with a different viewport width. Finally, confirm the stylesheet with Tailwind is actually loaded in that route.

---

## 57. What is `screens` customization in the CSS-first era?

In Tailwind v4, breakpoints can be defined in `@theme` using `--breakpoint-*` custom properties or related theme keys depending on documentation for your exact release. This keeps breakpoints aligned with design tokens. JavaScript `theme.extend.screens` still exists for advanced setups. Consistent naming (`3xl`) helps teams communicate layout behavior.

```css
@theme {
  --breakpoint-3xl: 120rem;
}
```

---

## 58. How does responsive design interact with `flex` and `grid`?

You toggle `flex-col` to `md:flex-row`, `grid-cols-1` to `lg:grid-cols-3`, and adjust `gap` per breakpoint for comfortable touch targets on mobile. Responsive utilities let one component adapt without duplicate markup. This pattern is ubiquitous in dashboards and marketing pages.

```html
<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div>Panel</div>
  <div>Panel</div>
  <div>Panel</div>
</div>
```

---

## 59. Why might you avoid duplicating entire components per breakpoint?

Utility-responsive design lets you keep one component with conditional classes, reducing maintenance and bugs from divergent copies. Duplication increases the risk that accessibility attributes drift between variants. When differences become large, split components—but start with responsive utilities. This is a maintainability talking point in interviews.

---

## 60. What is a common mistake with `sm:` vs unprefixed classes?

Beginners assume `sm:p-4` applies only on small screens; it actually applies from `sm` upward, replacing smaller default padding if combined thoughtfully. Another mistake is stacking conflicting utilities without clear intent—use consistent spacing tokens per breakpoint. Document team conventions for when to bump `text-*` sizes.

---

## 61. What are state variants like `hover:` and `focus:`?

Variants prepend utilities to scope styles to interaction states: `hover:bg-slate-100` applies background on pointer hover; `focus:ring-2` adds a focus ring for keyboard users. Tailwind generates the appropriate selectors, such as `:hover` and `:focus-visible` depending on plugin defaults. These replace handwritten pseudo-class rules for common UI feedback. Always include visible focus styles for accessibility.

```html
<button class="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
  Submit
</button>
```

---

## 62. What is `active:` and when is it used?

`active:` styles apply while a button or link is being pressed, giving tactile feedback (`active:scale-95`). It maps to the `:active` pseudo-class. Pair with `transition` utilities for smooth micro-interactions. Do not rely solely on `active` for critical affordances; hover does not exist on touch devices.

```html
<button class="transition active:scale-95">Press me</button>
```

---

## 63. How do `first:` and `last:` child variants work?

`first:pt-0` removes top padding on the first item in a list; `last:border-b-0` removes a border from the last item. These use `:first-child` and `:last-child` selectors under the hood. They help style stacked rows without manual index logic in JavaScript.

```html
<ul class="divide-y divide-slate-200">
  <li class="py-3 first:pt-0 last:pb-0">Item</li>
</ul>
```

---

## 64. What are `odd:` and `even:` variants?

They target alternating rows, commonly for zebra striping tables (`odd:bg-white even:bg-slate-50`). This improves scannability of dense data. Ensure sufficient contrast remains WCAG compliant when choosing striping colors.

```html
<tbody>
  <tr class="odd:bg-white even:bg-slate-50">
    <td>Cell</td>
  </tr>
</tbody>
```

---

## 65. What does `disabled:` do?

`disabled:opacity-50` styles controls that are disabled, typically with `disabled:pointer-events-none` to prevent interaction. It targets `:disabled` form elements. Always reflect disabled state visually and in ARIA attributes when applicable.

```html
<button class="disabled:cursor-not-allowed disabled:opacity-40" disabled>
  Unavailable
</button>
```

---

## 66. What is `group-hover`?

When a parent has `group`, children can use `group-hover:` variants to change style when the parent is hovered—great for card overlays and disclosure arrows. The parent must include the `group` class. This avoids JavaScript for simple hover reveals.

```html
<a href="#" class="group block rounded-lg border p-4 hover:border-slate-300">
  <span class="text-slate-700 group-hover:text-slate-900">Title</span>
  <span class="translate-x-0 text-sm text-slate-400 transition group-hover:translate-x-1">→</span>
</a>
```

---

## 67. What is `peer` and `peer-focus`?

Mark a sibling control with `peer` so another element can style based on its state: `peer-invalid:border-red-500` on an input can drive error text styling on a label or helper sibling using `peer-invalid:` on the following element. This models adjacent-sibling relationships in CSS. It reduces React state for simple validation visuals.

```html
<input class="peer rounded border px-3 py-2" />
<p class="mt-1 hidden text-sm text-red-600 peer-invalid:block">Required</p>
```

---

## 68. How do you combine responsive and state variants?

Order is `responsive:state:utility` in modern Tailwind versions (consult docs for exact ordering rules in your release), enabling `md:hover:underline` or `lg:focus-visible:ring`. Understanding variant ordering prevents surprises in generated CSS. When in doubt, inspect compiled output.

```html
<a class="underline-offset-4 transition hover:underline md:no-underline md:hover:underline">Link</a>
```

---

## 69. What are `motion-safe` and `motion-reduce` variants?

They respect user preferences for reduced motion by toggling animations (`motion-safe:animate-pulse`, `motion-reduce:animate-none`). Accessibility guidelines recommend honoring `prefers-reduced-motion`. Tailwind exposes variants to make this easy without custom media queries everywhere.

```html
<div class="motion-safe:transition motion-reduce:transition-none">Content</div>
```

---

## 70. Why should `focus` styles never be removed without replacement?

Removing outlines harms keyboard users who rely on visible focus indicators to navigate. Tailwind provides `focus-visible:` to show rings only for keyboard focus, which balances aesthetics and accessibility. Always test with keyboard navigation, not only mouse. This is a frequent seniority signal in frontend interviews.

---

## 71. How do border utilities work (`border`, `border-*`, `divide-*`)?

`border` sets default border width on all sides; `border-t`, `border-slate-200`, and `border-2` combine width and color utilities. `divide-y` adds borders between stacked children, similar to `space-y` but for separators. Rounded corners use `rounded-*` utilities mapping to `border-radius`. These replace most bespoke border CSS.

```html
<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">Card</div>
```

---

## 72. What are ring utilities (`ring`, `ring-offset`)?

Rings draw focus indicators using box-shadows, often nicer than default outlines for design systems. `ring-2 ring-indigo-500 ring-offset-2` creates a visible focus treatment. They are composable with `focus-visible:` variants. Rings do not affect layout the same way borders do, which helps with micro-adjustments.

```html
<button class="rounded-md ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500">OK</button>
```

---

## 73. How do shadow utilities work?

`shadow-sm`, `shadow`, `shadow-lg`, `shadow-inner` apply preset box-shadows for elevation. Combine with `hover:shadow-md` for interactive cards. Shadows contribute to perceived depth; overuse can hurt performance on low-end devices, but generally CSS shadows are fine.

```html
<div class="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md">Elevated</div>
```

---

## 74. What are `rounded-*` utilities?

They set `border-radius` with consistent steps (`rounded-md`, `rounded-full` for pills and avatars). `rounded-t-*` targets top corners only for tabs and headers. Match radius tokens to your design system for cohesion.

```html
<img class="h-12 w-12 rounded-full object-cover" src="/avatar.jpg" alt="" />
```

---

## 75. How does `opacity-*` work?

`opacity-0` through `opacity-100` set element transparency, affecting the entire subtree’s painted output for that layer. For selective transparency on colors, prefer `bg-black/50` syntax. Remember that opacity changes can create stacking contexts, which sometimes breaks `z-index` expectations.

```html
<div class="opacity-50 hover:opacity-100">Fade</div>
```

---

## 76. What are `transition-*` utilities?

`transition`, `duration-200`, `ease-out`, and `delay-75` configure transitions for animatable properties. Pair with `hover:` or `transform` utilities. Keep durations short (150–250ms) for UI responsiveness. Always respect `motion-reduce` for large animations.

```html
<button class="transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">Lift</button>
```

---

## 77. How do transform utilities work (`translate`, `scale`, `rotate`)?

`translate-x-*`, `scale-95`, `rotate-3` apply transforms with GPU-friendly properties when combined with `transform` (or default transform behavior in modern Tailwind). They are useful for modals, buttons, and icon micro-interactions. Combine with `origin-*` to control transform origin points.

```html
<div class="origin-top scale-95 opacity-0 transition data-[state=open]:scale-100 data-[state=open]:opacity-100">
  Panel
</div>
```

---

## 78. What are `animate-*` utilities?

Tailwind includes keyframed animations like `spin`, `ping`, `pulse`, and `bounce` for loaders and attention states. Use sparingly to avoid distracting users. For custom animations, define keyframes in CSS or extend theme according to v4 practices. Pair with `motion-reduce` considerations.

```html
<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
```

---

## 79. What is `@starting-style` and how does CSS relate to Tailwind v4?

`@starting-style` is a modern CSS at-rule that defines starting values for transitions when an element’s display toggles, enabling enter/exit animations for things like dialogs. Tailwind v4 embraces modern platform features where they improve UX; check documentation for any corresponding utilities or arbitrary property support. Conceptually, this bridges display changes and smooth interpolation in browsers that support the feature.

```css
@starting-style {
  dialog {
    opacity: 0;
    transform: translateY(8px);
  }
}
```

---

## 80. How does `color-mix()` help theming in Tailwind v4 projects?

`color-mix()` blends colors in a perceptual color space, useful for hover states, borders on tinted backgrounds, and accessible contrasts. In `@theme`, you might define surfaces using `color-mix(in oklab, var(--color-primary), white 85%)` to derive subtle tints. Tailwind utilities then reference those tokens. This reduces manual hex picking and keeps ramps coherent.

```css
@theme {
  --color-primary-strong: color-mix(in oklab, var(--color-primary), black 12%);
}
```

---

## 81. How do you extend or override theme values in Tailwind v4?

You add or change tokens in `@theme` blocks in your CSS after `@import "tailwindcss"`. Overrides replace defaults where keys match; additions merge into the design system. For JavaScript-heavy setups, `tailwind.config` may still extend theme, but CSS tokens are the idiomatic v4 path for many teams. Keep token naming consistent to avoid duplicate utilities.

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --radius-2xl: 1.25rem;
}
```

---

## 82. What is the `@utility` directive in Tailwind v4?

`@utility` lets you define custom utility classes in CSS with first-class integration into Tailwind’s pipeline, rather than only writing raw CSS classes manually. You specify the utility name and body; Tailwind generates the variant and ordering behavior consistently. This replaces some plugin use-cases for simple custom utilities. It keeps extensions close to your stylesheet alongside `@theme`.

```css
@import "tailwindcss";

@utility tab-focus {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

---

## 83. How are CSS variables used in Tailwind v4 themes?

Theme tokens compile to CSS custom properties on `:root` or relevant layers, enabling runtime theming and integration with non-Tailwind CSS. You can reference `var(--color-primary)` in hand-authored styles or in arbitrary values. This supports dark mode toggles by swapping variables on a class or data attribute. Variables bridge design tokens and browser-native APIs.

```css
@theme {
  --color-bg: #ffffff;
}

html.dark {
  --color-bg: #0b1220;
}
```

---

## 84. What is built-in import support in Tailwind v4?

Tailwind’s CSS pipeline can resolve additional `@import` statements in your stylesheets as part of the build, reducing need for separate preprocessors for simple partials. Organize tokens, base styles, and component layers across files while keeping a single compiled output. Verify how your bundler deduplicates imports to avoid duplicate rules.

```css
@import "tailwindcss";
@import "./tokens.css";
```

---

## 85. How do you add custom spacing scales?

Define spacing keys in `@theme`, such as `--spacing-18`, which unlocks utilities like `p-18`, `gap-18` depending on naming conventions in your Tailwind version. Align spacing with your design grid (4px, 8px systems). Document token meanings for engineers and designers.

```css
@theme {
  --spacing-18: 4.5rem;
}
```

---

## 86. Can you reference native CSS functions in theme values?

Yes—modern color functions (`oklch`, `lab`), `calc()`, and `color-mix()` are valid in token definitions where supported by target browsers. This makes themes more perceptually uniform and accessible. Always verify browser support or provide fallbacks for enterprise constraints.

---

## 87. What are plugins in Tailwind, and are they still relevant in v4?

Plugins historically added utilities, variants, or base styles via JavaScript APIs. In v4, CSS directives like `@utility` and improved core coverage reduce plugin needs for many cases, but ecosystem plugins remain for complex domains. Understand that plugins run at build time, not in the browser.

---

## 88. How do you migrate theme keys from JS config to `@theme`?

Identify `theme.extend` entries—colors, fonts, spacing—and translate them to CSS custom properties inside `@theme`. Remove duplicate definitions to prevent conflicting sources of truth. Run visual regression tests after migration because token shifts alter many utilities at once. Migration scripts may exist in official upgrade guides.

---

## 89. What naming conventions help maintainable `@theme` blocks?

Group tokens semantically (`--color-*`, `--radius-*`, `--shadow-*`) and avoid ambiguous names like `--blue-1`. Prefer roles (`--color-danger`) over raw palette names in product code. This clarity helps when designers rename brand colors but not roles.

---

## 90. How does `@utility` differ from `@layer components`?

`@layer components` is for component classes you compose manually; `@utility` registers utilities integrated with Tailwind’s variant and sorting machinery. Use `@utility` when you want a small primitive available with `hover:` and responsive prefixes. Use component classes for larger chunks where variants are less important.

---

## 91. How do you implement dark mode in Tailwind?

Tailwind supports a `dark:` variant that applies when a parent has `class="dark"` or when using media strategy depending on configuration. Define dark palette tokens via CSS variables in `@theme` and swap them when `.dark` is present on `html`. Avoid hardcoding separate hexes in JSX; prefer variables. Test images and shadows in dark mode for sufficient contrast.

```html
<html class="dark">
  <body class="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    App
  </body>
</html>
```

---

## 92. What are arbitrary values in bracket notation?

Arbitrary values let you supply one-off values inline: `w-[32rem]`, `top-[117px]`, `bg-[#ff00aa]`, `grid-cols-[repeat(16,minmax(0,1fr))]`. They escape the design system when necessary prototypes or third-party constraints demand it. Overuse undermines consistency, so default to theme tokens first. Arbitrary properties also exist: `[mask-image:linear-gradient(...)]`.

```html
<div class="aspect-[4/3] w-full max-w-[65ch]">Arbitrary ratio and measure</div>
```

---

## 93. What does the `!important` modifier do in Tailwind (`!` prefix)?

Prefixing with `!` marks a utility as `!important`, useful when fighting specificity battles with third-party CSS—though it is better to fix architecture when possible. Overuse creates maintenance nightmares. Reach for it sparingly for legacy integrations.

```html
<div class="!mt-0">Override stubborn margin</div>
```

---

## 94. What is `@apply` and when should you use it?

`@apply` inlines existing utilities into a CSS rule, letting you name a repeated pattern while still using Tailwind tokens. It is helpful for global base styles or complex pseudo-elements, but overusing `@apply` recreates traditional CSS abstraction and can reduce scan optimization clarity. Prefer components in frameworks for reuse when possible.

```css
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium;
  }
}
```

---

## 95. What is `@layer` and how does Tailwind organize CSS?

`@layer base, components, utilities` orders styles to manage specificity and overrides predictably. Tailwind places its generated utilities in the utilities layer; you can add base resets or component classes in appropriate layers. Understanding layers helps when mixing Tailwind with other CSS frameworks.

```css
@layer base {
  :root {
    color-scheme: light dark;
  }
}
```

---

## 96. How do you compose utilities effectively?

Group class strings logically: layout (`flex`, `gap`), box (`p`, `border`), typography (`text`, `font`), visuals (`bg`, `shadow`), states (`hover:`, `focus:`). Extract repeated clusters into framework components or `@apply` sparingly. Use `clsx` or `cn` helpers to toggle classes conditionally in React. Consistency beats cleverness for team scalability.

```tsx
const pill = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs";
```

---

## 97. What are common layout patterns in Tailwind?

Sticky headers, sidebar layouts (`flex` with `shrink-0` aside), responsive grids for marketing sections, and centered modals (`fixed inset-0 flex items-center justify-center bg-black/40`). Learn these templates to move quickly in interviews. Combine `container`, `grid`, and `gap` for most landing pages.

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
  <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">Modal</div>
</div>
```

---

## 98. What best practices prevent messy class attributes?

Establish design tokens early, avoid arbitrary values except for prototypes, and wrap repeated utility sets in components. Use Prettier plugins or class sorting tools if your team adopts them. Keep accessibility utilities (`aria-*`, focus rings) as non-negotiable parts of patterns. Review class lists in PRs like any other code.

---

## 99. What pitfalls affect dynamic class names in JavaScript?

Tailwind’s compiler scans source text for static class strings; building class names by concatenating variables (`'bg-' + color`) often prevents detection, so utilities may be missing in production. Safelist specific classes or use complete literal class names in maps. This is a common production bug for freshers.

```js
const variants = {
  info: "bg-sky-50 text-sky-900 border-sky-200",
  danger: "bg-rose-50 text-rose-900 border-rose-200",
};
```

---

## 100. How do you summarize Tailwind CSS v4 for an interviewer in one minute?

Tailwind CSS v4 is a utility-first styling system compiled at build time, now oriented around `@import "tailwindcss"` and CSS-first theming with `@theme` and `@utility`, reducing reliance on `tailwind.config.js` for typical projects. It features faster builds through the Oxide engine and smarter content detection, while embracing modern CSS like `color-mix()` and `@starting-style` where they improve real UIs. Developers compose responsive, stateful utilities (`md:hover:`) directly in markup, achieving consistent design tokens and small production CSS via static analysis. You should mention accessibility (focus, motion), dynamic class pitfalls, and when to extract components—showing you understand both mechanics and team workflow.

```css
@import "tailwindcss";

@theme {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --color-brand: oklch(0.62 0.19 264);
}
```

```html
<main class="min-h-dvh bg-white font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-50">
  <h1 class="text-balance text-3xl font-semibold tracking-tight">Ready for v4</h1>
</main>
```

---
