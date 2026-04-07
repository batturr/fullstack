# Next.js Topic 16 — Styling

Complete guide to styling Next.js applications (App Router and Pages Router patterns) with CSS Modules, global CSS, Tailwind, CSS-in-JS, Sass, UI frameworks, and production best practices. Examples use TypeScript and realistic domains: e-commerce, blog, dashboard, SaaS, and social products.

## 📑 Table of Contents

- [16.1 CSS Modules](#161-css-modules)
- [16.2 Global Styles](#162-global-styles)
- [16.3 Tailwind CSS](#163-tailwind-css)
- [16.4 CSS-in-JS](#164-css-in-js)
- [16.5 Sass / SCSS](#165-sass--scss)
- [16.6 CSS Frameworks](#166-css-frameworks)
- [16.7 Styling Best Practices](#167-styling-best-practices)
- [Document-Wide Best Practices](#document-wide-best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 16.1 CSS Modules

### 16.1.1 Basics

**Beginner Level**  
CSS Modules let you write normal CSS files where class names are automatically renamed at build time so they do not clash between files. In a Next.js e-commerce product card, `title` in one component will not override `title` in another.

**Intermediate Level**  
Next.js treats files matching `*.module.css` (and `*.module.scss`) as CSS Modules. Imports return a JavaScript object mapping logical names to generated unique class strings. This is compile-time scoping: the bundler rewrites selectors and hashes names.

**Expert Level**  
Webpack/Turbopack generates a deterministic hash from content and path. Tree-shaking applies to unused classes when analyzers run. For micro-frontends, namespace collisions are avoided without BEM verbosity. You can customize `localIdentName` via `next.config.js` `webpack` hook if you need readable debug names in non-production builds.

```tsx
// app/shop/ProductTeaser.tsx
import type { FC } from "react";
import styles from "./ProductTeaser.module.css";

export type ProductTeaserProps = {
  name: string;
  priceCents: number;
};

export const ProductTeaser: FC<ProductTeaserProps> = ({ name, priceCents }) => (
  <article className={styles.card}>
    <h2 className={styles.title}>{name}</h2>
    <p className={styles.price}>${(priceCents / 100).toFixed(2)}</p>
  </article>
);
```

```css
/* ProductTeaser.module.css */
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
}
.title {
  font-size: 1.125rem;
  margin: 0 0 0.5rem;
}
.price {
  color: #059669;
  font-weight: 600;
}
```

**Key Points**

- CSS Modules are opt-in per file via the `.module.css` suffix.
- Imported `styles` is a typed object when you enable CSS module types (see Next.js docs for `declaration` or ambient module).
- Works in both Server and Client Components for styling; the CSS still ships as static CSS.

### 16.1.2 `.module.css` Convention

**Beginner Level**  
Name your file `Something.module.css` next to `Something.tsx`. Import it as `import styles from "./Something.module.css"`.

**Intermediate Level**  
Next.js resolves `.module.css` through the same pipeline as global CSS but emits scoped class maps. Co-locate modules with components (`components/avatar/Avatar.tsx` + `Avatar.module.css`) for discoverability in a SaaS dashboard codebase.

**Expert Level**  
Monorepos can share tokens via `@repo/ui/styles/tokens.module.css` imported into feature modules. Use `package.json` `exports` to expose only intended CSS entry points. Avoid deep relative paths with TypeScript `paths` + barrel files for UI kits.

```tsx
// components/dashboard/MetricTile.tsx
import type { FC, ReactNode } from "react";
import styles from "./MetricTile.module.css";

export type MetricTileProps = {
  label: string;
  value: string;
  trend?: ReactNode;
};

export const MetricTile: FC<MetricTileProps> = ({ label, value, trend }) => (
  <div className={styles.root} data-testid="metric-tile">
    <span className={styles.label}>{label}</span>
    <strong className={styles.value}>{value}</strong>
    {trend ? <div className={styles.trend}>{trend}</div> : null}
  </div>
);
```

**Key Points**

- File name must include `.module` before `.css` (or `.sass`/`.scss` with Sass enabled).
- One module per visual component is a common scalable pattern.

### 16.1.3 Component-Scoped Styles

**Beginner Level**  
Scoped means styles apply only where you use `className={styles.foo}`—not to the whole site.

**Intermediate Level**  
For a blog post layout, scope `article`, `heading`, and `codeBlock` classes inside `PostBody.module.css` so markdown-rendered content does not leak styles to the marketing header.

**Expert Level**  
Combine with `data-*` attributes for integration tests and design tokens: `className={styles.wrapper}` plus `data-layout="post"` for Playwright selectors without brittle CSS class strings.

```tsx
// app/blog/[slug]/PostBody.tsx
import type { FC } from "react";
import styles from "./PostBody.module.css";

export type PostBodyProps = { html: string };

export const PostBody: FC<PostBodyProps> = ({ html }) => (
  <div
    className={styles.prose}
    data-surface="blog-post"
    // Sanitize HTML server-side before passing in production
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
```

**Key Points**

- Scoping is per-module file, not per React component instance.
- Child components need their own modules or explicit composition (see Composing).

### 16.1.4 Composing Classes

**Beginner Level**  
Use `composes:` in CSS Modules to reuse another class from the same file or import composition from another module.

**Intermediate Level**  
A social media “story ring” might compose `baseRing` + `liveRing` for variants without duplicating border logic.

**Expert Level**  
Composition is a build-time merge: it does not increase runtime classList juggling if you keep variants in CSS. For TypeScript, derive union types for variant props and map to `styles[variant]` with a fallback.

```css
/* StoryAvatar.module.css */
.base {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
}
.ringLive {
  composes: base;
  box-shadow: 0 0 0 3px #ef4444;
}
.ringSeen {
  composes: base;
  box-shadow: 0 0 0 2px #d1d5db;
}
```

```tsx
// components/social/StoryAvatar.tsx
import type { FC } from "react";
import styles from "./StoryAvatar.module.css";

export type StoryState = "live" | "seen" | "none";

export type StoryAvatarProps = {
  src: string;
  alt: string;
  state: StoryState;
};

const stateClass: Record<StoryState, string> = {
  live: styles.ringLive,
  seen: styles.ringSeen,
  none: styles.base,
};

export const StoryAvatar: FC<StoryAvatarProps> = ({ src, alt, state }) => (
  <img className={stateClass[state]} src={src} alt={alt} />
);
```

**Key Points**

- `composes` keeps design tokens and geometry DRY within CSS Modules.
- Prefer CSS composition over long template strings in TSX when variants are purely visual.

### 16.1.5 Global Styles Inside Modules (`:global`)

**Beginner Level**  
Sometimes you need a global class (e.g., from a third-party library). In a module file, wrap selectors with `:global(.foo)`.

**Intermediate Level**  
E-commerce sites using a legacy carousel library might target `.swiper-slide` inside a scoped wrapper to avoid polluting `globals.css`.

**Expert Level**  
Nest `:global` carefully to avoid widening specificity accidentally. Prefer wrapper-scoped globals: `.root :global(.ProseMirror)` for a SaaS rich-text editor shell.

```css
/* EditorShell.module.css */
.root :global(.ProseMirror) {
  min-height: 240px;
  outline: none;
}
.root :global(.ProseMirror p) {
  margin: 0 0 0.75rem;
}
```

```tsx
// components/saas/EditorShell.tsx
"use client";

import type { FC, ReactNode } from "react";
import styles from "./EditorShell.module.css";

export const EditorShell: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.root}>{children}</div>
);
```

**Key Points**

- Use `:global` sparingly; it reintroduces cascade risks.
- Scope globals under a known parent class from the same module.

---

## 16.2 Global Styles

### 16.2.1 `globals.css` Role

**Beginner Level**  
`app/globals.css` (App Router) or `pages/_app` import holds site-wide rules: body font, background, link defaults.

**Intermediate Level**  
Import `globals.css` exactly once from `app/layout.tsx` to avoid duplicate CSS in the bundle. A dashboard app sets `html, body, #__next { height: 100% }` for full-height layouts.

**Expert Level**  
Split concerns: `globals.css` for resets and surfaces; modules/Tailwind for components. Use `@layer` if combining Tailwind v4 directives with custom global rules to control cascade.

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Acme Shop", template: "%s | Acme Shop" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Key Points**

- Single entry for global CSS prevents order bugs.
- Keep globals minimal to reduce specificity wars.

### 16.2.2 Importing Global CSS

**Beginner Level**  
Import CSS in `layout.tsx` or `_app.tsx` only—Next.js restricts global CSS imports elsewhere.

**Intermediate Level**  
For a blog using MDX, you may import a `syntax-highlight.css` from `layout.tsx` alongside `globals.css` to style code blocks globally.

**Expert Level**  
In monorepos, expose `import "@acme/ui/globals.css"` from a package; ensure the package does not import global CSS from deep component entry points to satisfy Next.js rules.

```tsx
// app/layout.tsx (pattern)
import "@acme/design-tokens/globals.css";
import "./globals.css";
```

**Key Points**

- Global CSS import locations are constrained by design—follow framework rules.
- Order of imports affects cascade when specificity ties.

### 16.2.3 CSS Reset

**Beginner Level**  
A reset removes inconsistent default margins and font sizes across browsers so your e-commerce layout looks the same in Chrome and Safari.

**Intermediate Level**  
Use `postcss-normalize`, `@csstools/normalize.css`, or Tailwind’s preflight (if using Tailwind). A SaaS admin UI benefits from consistent form control sizing.

**Expert Level**  
If mixing Tailwind with hand-written global CSS, disable duplicate resets or layer them explicitly to avoid double-zeroing margins on `p` and `h*` elements.

```css
/* globals.css (minimal custom reset excerpt) */
*,
*::before,
*::after {
  box-sizing: border-box;
}
body {
  margin: 0;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}
```

**Key Points**

- Pick one reset strategy per project.
- Test forms and rich text after resets—some plugins expect user-agent defaults.

### 16.2.4 CSS Variables (Custom Properties)

**Beginner Level**  
CSS variables let you define colors once on `:root` and reuse them—great for light/dark themes on a social app.

**Intermediate Level**  
Expose semantic tokens: `--color-surface`, `--color-text`, not only raw hex. Toggle themes by setting `data-theme="dark"` on `html` and redefining variables.

**Expert Level**  
Sync with Next.js `next-themes` or a cookie-backed theme for SSR without flash. For performance, prefer variables for colors and radii; avoid animating layout properties.

```css
/* globals.css */
:root {
  --color-bg: #ffffff;
  --color-fg: #0a0a0a;
  --radius-md: 10px;
}
html[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-fg: #fafafa;
}
body {
  background: var(--color-bg);
  color: var(--color-fg);
}
```

```tsx
// components/theme/ThemeRoot.tsx
"use client";

import type { FC, ReactNode } from "react";
import { ThemeProvider } from "next-themes";

export const ThemeRoot: FC<{ children: ReactNode }> = ({ children }) => (
  <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
    {children}
  </ThemeProvider>
);
```

**Key Points**

- Custom properties cascade and can be updated client-side without rebuilding CSS.
- Use semantic names for maintainability across product surfaces.

---

## 16.3 Tailwind CSS

### 16.3.1 Setup with Next.js

**Beginner Level**  
Install `tailwindcss`, `postcss`, `autoprefixer`, run `npx tailwindcss init -p`, then add Tailwind directives to your global CSS.

**Intermediate Level**  
For App Router, content paths include `./app/**/*.{js,ts,jsx,tsx,mdx}` and `./components/**/*`. A marketplace app scans `features/` folders too.

**Expert Level**  
Use Tailwind v4’s CSS-first config when migrating; for v3, keep `tailwind.config.ts` as the source of truth for design tokens mirroring your Figma variables.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4f46e5",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Key Points**

- Content globs must cover all template paths or classes will be purged.
- Keep one global entry that imports Tailwind layers.

### 16.3.2 `postcss.config.js`

**Beginner Level**  
PostCSS runs Tailwind and Autoprefixer when Next.js builds CSS.

**Intermediate Level**  
Add `postcss-import` only if you need CSS `@import` ordering before Tailwind—common in design systems.

**Expert Level**  
Custom plugins (e.g., `postcss-nesting`) must be ordered correctly: nesting before Tailwind if you author nested CSS in non-module files.

```typescript
// postcss.config.ts
import type { Config } from "postcss-load-config";

const config: Config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

**Key Points**

- Next.js auto-detects `postcss.config.*` at project root.
- Match ESM (`mjs`) vs CJS (`js`) to your repo conventions.

### 16.3.3 `tailwind.config.js` / `tailwind.config.ts`

**Beginner Level**  
Extend `theme` to add brand colors and fonts for your dashboard.

**Intermediate Level**  
Use `theme.extend.screens` for container queries breakpoints shared with marketing pages.

**Expert Level**  
Type the config with `satisfies Config` or `defineConfig` patterns; expose tokens consumed by both Tailwind and CSS Modules via a shared `theme.ts` JSON-safe export.

```typescript
// tailwind.config.ts (extend excerpt)
import type { Config } from "tailwindcss";

const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.2s infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;

export default config;
```

**Key Points**

- Prefer `extend` over replacing entire `theme` keys to keep defaults.
- Check plugin compatibility with your Tailwind major version.

### 16.3.4 JIT Mode

**Beginner Level**  
JIT generates CSS only for class names you actually used—smaller CSS files for your blog.

**Intermediate Level**  
Arbitrary values like `w-[38rem]` and `bg-[#ff00aa]` work on demand; useful for one-off marketing sections.

**Expert Level**  
Safelist dynamic classes in `tailwind.config` when class names are assembled at runtime from CMS data; otherwise purge removes them.

```typescript
// tailwind.config.ts — safelist example
const config = {
  content: ["./app/**/*.{ts,tsx}"],
  safelist: [
    "bg-red-500",
    "bg-emerald-500",
    { pattern: /bg-(red|emerald|amber)-(500|600)/ },
  ],
} satisfies import("tailwindcss").Config;

export default config;
```

```tsx
// components/cms/Badge.tsx
import type { FC } from "react";

export type BadgeProps = { label: string; tone: "success" | "warning" | "danger" };

const toneClass: Record<BadgeProps["tone"], string> = {
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-black",
  danger: "bg-red-500 text-white",
};

export const Badge: FC<BadgeProps> = ({ label, tone }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[tone]}`}>
    {label}
  </span>
);
```

**Key Points**

- JIT is default in modern Tailwind—understand purge/safelist for dynamic UIs.
- Arbitrary values are powerful but can fragment design consistency—use tokens when repeated.

### 16.3.5 Plugins (`@tailwindcss/typography`, forms, etc.)

**Beginner Level**  
Plugins add extra utilities—`typography` styles long-form article HTML from your CMS.

**Intermediate Level**  
`@tailwindcss/forms` normalizes inputs across browsers for a checkout flow.

**Expert Level**  
Author internal plugins with `plugin(function ({ addUtilities, theme }) { ... })` to encode brand-specific elevation utilities used across SaaS tables and modals.

```typescript
// tailwind.plugin.example.ts (reference pattern)
import plugin from "tailwindcss/plugin";

export default plugin(({ addUtilities }) => {
  addUtilities({
    ".elev-1": {
      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    },
    ".elev-2": {
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    },
  });
});
```

**Key Points**

- Install official plugins matching Tailwind version.
- Document plugin utilities for designers and other engineers.

### 16.3.6 Custom Classes (`@layer components`)

**Beginner Level**  
Put repeated patterns like `.btn-primary` in `@layer components` in `globals.css`.

**Intermediate Level**  
Use `@apply` sparingly inside component layers to bundle Tailwind atoms into semantic classes for a design system.

**Expert Level**  
Prefer React components over heavy `@apply` stacks to keep tree-shaking predictable; reserve `@apply` for third-party HTML you cannot wrap.

```css
@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50;
  }
}
```

**Key Points**

- `@layer` integrates with Tailwind’s cascade ordering.
- Overusing `@apply` can obscure which utilities are active—code review carefully.

---

## 16.4 CSS-in-JS

### 16.4.1 styled-components — SSR Setup

**Beginner Level**  
styled-components let you write `const Button = styled.button\`...\`` with styles next to components—helpful for a small marketing site.

**Intermediate Level**  
For Next.js SSR, you must collect styles on the server and inject them into the HTML so the first paint matches. App Router integration typically uses the library’s documented registry pattern.

**Expert Level**  
Measure style extraction cost; for high-traffic e-commerce, consider zero-runtime solutions (Vanilla Extract, CSS Modules, Tailwind) to reduce JS and improve TTFB.

```tsx
// lib/registry-styled.tsx (illustrative App Router pattern)
"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>{children}</StyleSheetManager>
  );
}
```

**Key Points**

- Follow the official Next.js + styled-components example for your Next major version.
- Keep the registry in a Client Component boundary.

### 16.4.2 styled-components — Babel Plugin

**Beginner Level**  
The Babel plugin improves debugging display names and can enable server-side-friendly transforms depending on version.

**Intermediate Level**  
Configure in `.babelrc` or `babel.config.js` alongside `next/babel` if you are not using the default SWC-only pipeline.

**Expert Level**  
Next.js defaults to SWC; enabling a custom Babel config opts out of some SWC optimizations—evaluate tradeoffs for a large dashboard bundle.

```typescript
// babel.config.ts (example when Babel is required)
export default {
  presets: ["next/babel"],
  plugins: [["styled-components", { ssr: true, displayName: true }]],
};
```

**Key Points**

- Prefer SWC + official registry when possible.
- Document why Babel is enabled if the team adds it.

### 16.4.3 Emotion

**Beginner Level**  
Emotion is similar to styled-components: CSS-in-JS with tagged templates or `css` prop patterns.

**Intermediate Level**  
Use `@emotion/cache` + `CacheProvider` for SSR insertion in App Router analogously to styled-components registries.

**Expert Level**  
For MUI v5+, Emotion is the default styling engine—align `createTheme` with Next font loaders and `AppRouterCacheProvider` from `@mui/material-nextjs` when using MUI’s documented Next integration.

```tsx
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import type { FC } from "react";

const banner = css`
  border-radius: 8px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  color: #fff;
`;

export const PromoBanner: FC<{ text: string }> = ({ text }) => (
  <div css={banner}>{text}</div>
);
```

**Key Points**

- Emotion and MUI integrate deeply—follow vendor guides for Next.js.
- Mind RSC boundaries: styling libraries often require client components.

### 16.4.4 `styled-jsx` (built into Next.js)

**Beginner Level**  
`styled-jsx` scopes CSS inside a component with a `<style jsx>` tag—no extra install.

**Intermediate Level**  
Use `styled-jsx/global` for small global tweaks in a specific page, like a landing hero background.

**Expert Level**  
Dynamic styles via template literals recompute per render—memoize expensive CSS generation in hot paths; for static styles prefer CSS Modules/Tailwind.

```tsx
// app/campaign/page.tsx
export default function CampaignPage() {
  return (
    <main>
      <h1 className="title">Spring Sale</h1>
      <style jsx>{`
        .title {
          font-size: clamp(2rem, 4vw, 3rem);
          letter-spacing: -0.02em;
        }
      `}</style>
    </main>
  );
}
```

**Key Points**

- Zero-config for Pages Router; still usable in App Router components.
- Co-locates styles but can clutter TSX when large.

### 16.4.5 Vanilla Extract

**Beginner Level**  
Vanilla Extract lets you write `.css.ts` files with TypeScript; build time outputs real CSS files—no runtime style injection.

**Intermediate Level**  
Great for design systems in a SaaS product: type-safe themes with `createThemeContract` and `createGlobalTheme`.

**Expert Level**  
Integrate Sprinkles for atomic utility typing; compose with Next.js `next/font` for font variables passed into VE styles.

```typescript
// styles/blogCard.css.ts
import { style } from "@vanilla-extract/css";

export const card = style({
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  selectors: {
    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
  },
});
```

```tsx
// components/blog/BlogCard.tsx
import { card } from "@/styles/blogCard.css";

export function BlogCard({ title }: { title: string }) {
  return <article className={card}>{title}</article>;
}
```

**Key Points**

- Zero-runtime CSS with strong typing—excellent for performance purists.
- Requires build plugin setup per Next version—follow official integration docs.

---

## 16.5 Sass / SCSS

### 16.5.1 Setup

**Beginner Level**  
Install `sass` package; rename files to `.scss` or `.module.scss` and import them.

**Intermediate Level**  
Next.js compiles Sass automatically; large e-commerce teams often use SCSS modules for legacy migrations from Create React App.

**Expert Level**  
Watch build times in monorepos—Sass is slower than PostCSS-only pipelines; consider incremental adoption (new routes in Tailwind, legacy in SCSS).

```bash
npm install sass
```

```tsx
import styles from "./Toolbar.module.scss";

export function Toolbar() {
  return <header className={styles.bar}>Dashboard</header>;
}
```

**Key Points**

- No webpack rule tweaks needed for standard Next Sass usage.
- Prefer modules over global `.scss` imports for new code.

### 16.5.2 `.scss` / `.sass` Files

**Beginner Level**  
SCSS uses braces and semicolons; SASS is indented syntax—most teams pick SCSS.

**Intermediate Level**  
Use partials `_tokens.scss` imported into modules for shared variables in a blog theme.

**Expert Level**  
Avoid `@import` deprecation issues by migrating to `@use` and namespaced variables in new files.

```scss
// _tokens.scss
$radius: 10px;
```

```scss
// Card.module.scss
@use "../styles/tokens" as t;

.card {
  border-radius: t.$radius;
}
```

**Key Points**

- `.module.scss` participates in CSS Modules class exports.
- Understand `@use` vs legacy `@import` for long-term maintenance.

### 16.5.3 Variables

**Beginner Level**  
Store brand colors in `$brand` variables at the top of a file.

**Intermediate Level**  
Share variables via `@use` modules across dashboard components.

**Expert Level**  
Mirror Sass variables with CSS custom properties for runtime theming where SCSS variables are compile-time only.

```scss
@use "../styles/tokens" as *;

.button {
  background: $brand;
}
```

**Key Points**

- SCSS variables are erased at compile time—cannot toggle live without CSS variables.

### 16.5.4 Mixins

**Beginner Level**  
Mixins are reusable chunks—like a `truncate` text mixin for social post previews.

**Intermediate Level**  
Parameterize mixins for elevation levels on SaaS cards.

**Expert Level**  
Avoid deep mixin chains that explode CSS size—compose with placeholder selectors or move shared patterns to utilities.

```scss
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  @include truncate;
}
```

**Key Points**

- Mixins duplicate output per invocation—monitor bundle size.

### 16.5.5 Sass Modules (`@use`, namespaces)

**Beginner Level**  
`@use` loads a Sass file once and namespaces its members.

**Intermediate Level**  
`@use "tokens" as *` imports everything into scope—convenient but can collide names in large teams.

**Expert Level**  
Enforce namespacing (`as tokens`) in shared libraries to make token origin obvious during code review.

```scss
@use "../../styles/tokens" as tokens;

.shell {
  padding: tokens.$space-4;
}
```

**Key Points**

- Prefer `@use` for new Sass in Next.js projects.
- Align Sass modules with CSS Modules for component boundaries.

---

## 16.6 CSS Frameworks

### 16.6.1 Bootstrap

**Beginner Level**  
Bootstrap provides grid, components, and utilities—quick admin prototypes.

**Intermediate Level**  
Import Bootstrap CSS in `layout.tsx`; use React-Bootstrap for accessible components in a marketplace back-office.

**Expert Level**  
Tree-shake unused CSS with PurgeCSS or migrate to modular imports; avoid fighting Bootstrap’s opinionated styles with Tailwind on the same nodes.

```tsx
// app/layout.tsx (excerpt)
import "bootstrap/dist/css/bootstrap.min.css";
```

**Key Points**

- Good for rapid CRUD UIs; heavier than utility-first stacks.
- Watch jQuery-era patterns—prefer React component libraries.

### 16.6.2 MUI (Material UI)

**Beginner Level**  
MUI gives ready-made React components themed with Material Design—ideal for internal dashboards.

**Intermediate Level**  
Use `ThemeProvider` + `createTheme` for brand colors; integrate `next/font` with MUI `CssBaseline`.

**Expert Level**  
Use the official Next.js App Router integration package for Emotion cache and streaming compatibility; split heavy components with dynamic imports for marketing pages.

```tsx
// theme/mui-theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    primary: { main: "#4f46e5" },
    secondary: { main: "#ec4899" },
  },
  shape: { borderRadius: 10 },
});
```

**Key Points**

- Strong ecosystem and accessibility when using core components correctly.
- Bundle size—import per-component paths or rely on modern bundler optimizations consciously.

### 16.6.3 Chakra UI

**Beginner Level**  
Chakra provides style props (`<Box p={4} bg="gray.50">`)—fast iteration for SaaS MVPs.

**Intermediate Level**  
Customize `theme.ts` to align with product branding; use `ChakraProvider` in a client layout shell.

**Expert Level**  
Chakra v3 changes APIs—verify docs version. For RSC, keep Chakra usage in client islands.

```tsx
"use client";

import { ChakraProvider, Box, Button } from "@chakra-ui/react";
import type { FC, ReactNode } from "react";
import { theme } from "./chakra-theme";

export const AppProviders: FC<{ children: ReactNode }> = ({ children }) => (
  <ChakraProvider value={theme}>
    <Box minH="100dvh">{children}</Box>
  </ChakraProvider>
);
```

**Key Points**

- Developer ergonomics are high; learn theme tokens to avoid magic numbers.

### 16.6.4 Mantine

**Beginner Level**  
Mantine is a full React component suite with hooks—great for dense dashboards.

**Intermediate Level**  
Use `MantineProvider` with `createTheme` and CSS variables strategy for theming.

**Expert Level**  
Leverage Mantine’s `modals`, `notifications`, and `dates` packages with tree-shaking-friendly imports.

```tsx
"use client";

import { MantineProvider, createTheme, Button } from "@mantine/core";
import type { FC, ReactNode } from "react";

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
});

export const MantineRoot: FC<{ children: ReactNode }> = ({ children }) => (
  <MantineProvider theme={theme}>{children}</MantineProvider>
);
```

**Key Points**

- Cohesive DX for complex UI; confirm SSR notes in Mantine Next template.

### 16.6.5 shadcn/ui

**Beginner Level**  
shadcn/ui copies component source into your repo— you own the code, styled with Tailwind.

**Intermediate Level**  
Use the CLI to add `button`, `dialog`, `dropdown-menu` for a modern SaaS UI without a black-box dependency.

**Expert Level**  
Centralize tokens in `tailwind.config` and `components/ui` wrappers so upgrades to primitives are controlled PRs, not surprise node_modules diffs.

```tsx
// components/ui/button.tsx (typical shadcn-style API)
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90",
        outline: "border border-zinc-200 bg-white hover:bg-zinc-100",
      },
      size: { default: "h-10 px-4 py-2", sm: "h-9 px-3", lg: "h-11 px-8" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
```

**Key Points**

- Ownership model fits design system teams.
- Depends on Radix + Tailwind + CVA—learn those foundations.

---

## 16.7 Styling Best Practices

### 16.7.1 Component-Scoped Styling First

**Beginner Level**  
Keep styles near the component so a blog card change does not break checkout.

**Intermediate Level**  
Default to CSS Modules or Tailwind in feature folders; allow globals only for tokens and resets.

**Expert Level**  
Enforce with ESLint boundaries (`eslint-plugin-boundaries`) so `app/(marketing)` cannot import `app/(app)/dashboard` styles.

**Key Points**

- Scope reduces regression risk in large teams.
- Align with Next.js RSC boundaries—avoid styling logic that forces client unnecessarily.

### 16.7.2 Avoiding Conflicts

**Beginner Level**  
Do not reuse vague class names like `.container` globally without a system.

**Intermediate Level**  
Namespace layout wrappers: `.layout-root`, `.prose-scope` under modules or data attributes.

**Expert Level**  
Use Shadow DOM only for rare widget embeds—Next.js apps usually solve conflicts with modules and design tokens.

**Key Points**

- Specificity wars are a smell—refactor toward tokens and components.

### 16.7.3 Performance

**Beginner Level**  
Fewer big CSS files load faster—Tailwind purges unused classes.

**Intermediate Level**  
Split CSS by route using built-in optimizations; avoid importing huge framework CSS on landing pages that are mostly static.

**Expert Level**  
Track `performance.measure` for LCP; inline critical CSS only with measurement—Next handles much automatically; do not premature-optimize with fragile hacks.

```tsx
// dynamic import heavy dashboard skin only on /app routes
import dynamic from "next/dynamic";

const HeavyChartSkin = dynamic(() => import("./HeavyChartSkin"), { ssr: false });
```

**Key Points**

- Prefer static CSS solutions for public pages.
- Defer non-critical client-only styling bundles.

### 16.7.4 Dark Mode

**Beginner Level**  
Use `prefers-color-scheme` or a toggle that sets a `data-theme` attribute.

**Intermediate Level**  
Store preference in `localStorage` with `next-themes` and avoid flash using their blocking script pattern.

**Expert Level**  
For OAuth login pages rendered edge-only, ensure theme cookies are read in `layout.tsx` to SSR correct colors for brand trust.

**Key Points**

- Test charts, images, and shadows in both themes.
- Respect reduced motion alongside color changes.

### 16.7.5 Responsive Design

**Beginner Level**  
Use mobile-first CSS or Tailwind breakpoints (`sm:`, `md:`) for a social feed layout.

**Intermediate Level**  
Container queries (when supported) help card grids inside sidebars; Tailwind v4 improves ergonomics.

**Expert Level**  
Align breakpoints with analytics on real devices; avoid duplicating markup for “mobile vs desktop” when CSS can refactor layout.

```tsx
export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
```

**Key Points**

- Touch targets ≥ 44px for primary actions.
- Test keyboard focus on responsive menus.

### 16.7.6 Critical CSS (Conceptual in Next.js)

**Beginner Level**  
Critical CSS is the minimum CSS needed for above-the-fold content to render nicely fast—important for e-commerce hero sections.

**Intermediate Level**  
Next.js and modern bundlers inline some optimizations; manually splitting “hero” styles is rarely needed if you keep components lean.

**Expert Level**  
If using external critical CSS tools, ensure they understand dynamic imports and RSC streaming; validate with Lighthouse filmstrips, not guesses.

**Key Points**

- Measure before complex critical CSS pipelines.
- Prefer font and image optimization alongside CSS budgets.

---

## Document-Wide Best Practices

1. Choose one primary styling system (Tailwind **or** CSS Modules **or** a component library) per surface unless you have explicit integration rules.
2. Co-locate styles with components; centralize only tokens, resets, and keyframes.
3. Use TypeScript for props and theme objects; keep class maps typed.
4. Prefer zero-runtime CSS for public SEO pages; use client styling libraries inside interactive islands.
5. Theme with semantic variables (`surface`, `text`, `danger`) not raw hex scattered in JSX.
6. Audit bundle CSS with Lighthouse and Next analytics on slow 4G.
7. Document how to add a new token and where it is consumed (Figma ↔ code).
8. Test accessibility: focus rings, contrast, and forced colors mode.
9. Align with design system versioning when using shadcn/MUI/Chakra.
10. Keep global CSS imports minimal and ordered at the root layout.

---

## Common Mistakes to Avoid

1. Importing global CSS from arbitrary nested components—Next.js will error or behave unexpectedly.
2. Forgetting Tailwind `content` paths → missing classes in production after purge.
3. Mixing multiple resets (Tailwind preflight + aggressive custom reset) causing layout bugs.
4. Using `:global` broadly and reintroducing unpredictable cascade.
5. Running styled-components without SSR registry → flash of unstyled content.
6. Animating `width`/`height` instead of `transform` for carousel performance.
7. Hardcoding breakpoints inconsistently across SCSS, Tailwind, and JS.
8. Shipping entire Bootstrap/MUI CSS on marketing pages that need only a hero.
9. Duplicating theme values in Sass variables and CSS variables without a single source of truth.
10. Ignoring dark mode contrast for semantic colors (success/warning).

---

_End of Topic 16 — Styling._
