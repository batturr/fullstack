# Next.js Font Optimization — Topics 14.1–14.5

Fonts affect **readability**, **brand**, and **Core Web Vitals** (CLS, LCP). The `next/font` module self-hosts fonts, eliminates extra network round trips to Google’s CSS endpoint, and applies **`font-display`** strategies—essential for **e‑commerce** storefronts, **blogs**, **SaaS** dashboards, **social** apps, and **marketing** landing pages.

## 📑 Table of Contents

- [14.1 `next/font` Module](#141-nextfont-module)
  - [14.1.1 Overview](#1411-overview)
  - [14.1.2 `next/font/google`](#1412-nextfontgoogle)
  - [14.1.3 `next/font/local`](#1413-nextfontlocal)
  - [14.1.4 Zero layout shift](#1414-zero-layout-shift)
- [14.2 Google Fonts](#142-google-fonts)
  - [14.2.1 Importing Google fonts](#1421-importing-google-fonts)
  - [14.2.2 Configuration object](#1422-configuration-object)
  - [14.2.3 `weight`](#1423-weight)
  - [14.2.4 `subsets`](#1424-subsets)
  - [14.2.5 `display`](#1425-display)
  - [14.2.6 Variable fonts](#1426-variable-fonts)
  - [14.2.7 Multiple fonts](#1427-multiple-fonts)
- [14.3 Local Fonts](#143-local-fonts)
  - [14.3.1 Loading font files](#1431-loading-font-files)
  - [14.3.2 `src` path](#1432-src-path)
  - [14.3.3 Weight variants](#1433-weight-variants)
  - [14.3.4 Format support](#1434-format-support)
- [14.4 Font Usage](#144-font-usage)
  - [14.4.1 `className`](#1441-classname)
  - [14.4.2 CSS variables](#1442-css-variables)
  - [14.4.3 Global application](#1443-global-application)
  - [14.4.4 Reuse and composition](#1444-reuse-and-composition)
- [14.5 Font Best Practices](#145-font-best-practices)
  - [14.5.1 Minimizing load time](#1451-minimizing-load-time)
  - [14.5.2 Subsetting](#1452-subsetting)
  - [14.5.3 Display strategies](#1453-display-strategies)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices (End of Guide)](#best-practices-end-of-guide)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 14.1 `next/font` Module

### 14.1.1 Overview

**Beginner Level**  
`next/font` loads fonts **through Next.js** so pages get fast, privacy-friendly font files without adding manual `<link>` tags for Google CSS.

**Intermediate Level**  
At build time, Next downloads font files (Google) or bundles local files, fingerprints them, and serves from your domain. It injects **`@font-face`** CSS.

**Expert Level**  
Integrates with the **App Router** by exporting `className` and `style` objects compatible with React. Works with **Turbopack** and **Webpack**; verify font lists when upgrading Next major versions.

```tsx
// app/layout.tsx (illustrative)
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

#### Key Points — 14.1.1

- Self-hosting reduces **DNS + connection** overhead to third parties.
- Build may **fetch** Google fonts—CI needs network or cache strategy.

---

### 14.1.2 `next/font/google`

**Beginner Level**  
Import named helpers like `Inter`, `Roboto` from `next/font/google`.

**Intermediate Level**  
Each call returns a font object with `className`, variable CSS hooks, and config for weights/subsets.

**Expert Level**  
Google module validates available font families; TypeScript typings list supported fonts—use IDE autocomplete. For **SaaS** white-label themes, wrap font selection in a typed map.

```typescript
import { Manrope } from "next/font/google";

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});
```

#### Key Points — 14.1.2

- Strongly typed **font family** names reduce typos.
- Keep **weights** minimal for bundle size.

---

### 14.1.3 `next/font/local`

**Beginner Level**  
Use when you have `.woff2` files in your repo—brand fonts for **e‑commerce** luxury sites.

**Intermediate Level**  
`localFont({ src: [...], display: 'swap' })` accepts one or multiple files for weight/style tuples.

**Expert Level**  
Combine with **licensing** compliance—only bundle fonts your contract permits for web embedding.

```typescript
import localFont from "next/font/local";

export const brandSans = localFont({
  src: [
    { path: "./fonts/BrandSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/BrandSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-brand",
});
```

#### Key Points — 14.1.3

- Local fonts excel for **custom** corporate typefaces.
- Prefer **woff2** for compression and browser support.

---

### 14.1.4 Zero layout shift

**Beginner Level**  
Next injects **`size-adjust`** fallbacks (when supported) and metrics so text doesn’t jump when fonts swap in.

**Intermediate Level**  
Pair with explicit **`line-height`** and container sizes in design systems for **dashboard** dense tables.

**Expert Level**  
CLS still fails if you change `font-size` after hydration or load **webfonts** outside `next/font` without metrics. Audit with **Lighthouse** and field RUM.

#### Key Points — 14.1.4

- `next/font` targets **CLS** mitigation, not a substitute for good CSS.
- Avoid animating **font-size** on LCP text aggressively.

---

## 14.2 Google Fonts

### 14.2.1 Importing Google fonts

**Beginner Level**  
`import { Inter } from 'next/font/google'` then call `Inter({...})` once in a module.

**Intermediate Level**  
Export the instance from `lib/fonts.ts` and import in `layout.tsx` for reuse across **blog** and **marketing** routes.

**Expert Level**  
Deduplicate: do not call the font initializer in every component—**singleton** module pattern.

```typescript
// lib/fonts.ts
import { Inter, Source_Serif_4 } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
```

#### Key Points — 14.2.1

- One module centralizes **font config**.
- Easier theming for **multi-brand** **SaaS**.

---

### 14.2.2 Configuration object

**Beginner Level**  
Pass options like `subsets`, `weight`, `display` in the constructor object.

**Intermediate Level**  
`adjustFontFallback` and `fallback` let you tune system font stacks.

**Expert Level**  
For **international** **social** apps, configure **`subsets`** per locale pipeline to avoid loading unused glyphs.

```typescript
import { Noto_Sans } from "next/font/google";

export const noto = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});
```

#### Key Points — 14.2.2

- Explicit **fallbacks** improve FOUT behavior on failure paths.
- Subset expansion increases **byte size**.

---

### 14.2.3 `weight`

**Beginner Level**  
Pick only weights you use—400 body, 700 headings.

**Intermediate Level**  
Variable fonts may use `weight` range or shorthand depending on API—consult Next docs for your version.

**Expert Level**  
**Dashboard** UIs often need 500/600 for buttons; still prune unused weights from production build.

```typescript
import { Work_Sans } from "next/font/google";

export const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
```

#### Key Points — 14.2.3

- Each weight can mean **separate files**.
- Align with **Figma** design tokens.

---

### 14.2.4 `subsets`

**Beginner Level**  
`latin` covers English; add others for **i18n**.

**Intermediate Level**  
`['latin','cyrillic']` for Russian **marketplace** storefronts.

**Expert Level**  
Loading all subsets “just in case” bloats fonts—compute subset per **locale** in split layouts if needed.

```typescript
import { IBM_Plex_Sans } from "next/font/google";

export const plex = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic-ext"],
  weight: ["400", "600"],
});
```

#### Key Points — 14.2.4

- Subset = **glyph coverage** tradeoff.
- Coordinate with **translation** rollout.

---

### 14.2.5 `display`

**Beginner Level**  
`swap` shows fallback text immediately, then swaps—usually best UX.

**Intermediate Level**  
`optional` can reduce CLS for non-critical **marketing** hero subheadings but may never swap if connection slow.

**Expert Level**  
`block` risks **FOIT**—avoid for body text in **SaaS** apps.

```typescript
import { Lora } from "next/font/google";

export const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});
```

#### Key Points — 14.2.5

- Default in many examples: **`swap`**.
- Brand-critical headings may experiment with **`optional`** cautiously.

---

### 14.2.6 Variable fonts

**Beginner Level**  
One file can cover many weights—smaller total bytes when using a range.

**Intermediate Level**  
Enable with `variable: '--font-x'` and CSS `font-variation-settings` or axis utilities.

**Expert Level**  
Great for **editorial** **blogs** with fluid typography (`clamp()` + variable axes).

```typescript
import { Inter } from "next/font/google";

export const interVar = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-var",
});
```

```css
/* globals.css */
.heading-fluid {
  font-family: var(--font-inter-var), system-ui;
  font-variation-settings: "wght" 650;
}
```

#### Key Points — 14.2.6

- Variable fonts simplify **weight** management.
- Test **Safari** behavior for axes you rely on.

---

### 14.2.7 Multiple fonts

**Beginner Level**  
Use one sans for UI, one serif for **blog** body—two `next/font` instances.

**Intermediate Level**  
Apply via combining `className` strings: `${inter.className} ${serif.className}` is wrong for separate elements—usually set sans on `body`, serif on `article`.

**Expert Level**  
Limit to **2–3 families** max for performance and cohesive design; lazy-load rare display fonts only on campaign pages.

```tsx
import type { ReactNode } from "react";
import { inter, serif } from "@/lib/fonts";

export default function MarketingLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className={`${inter.className} ${serif.variable}`}>
      <main className="font-sans">{children}</main>
    </div>
  );
}
```

```css
article.prose {
  font-family: var(--font-serif), Georgia, serif;
}
```

#### Key Points — 14.2.7

- Multiple fonts multiply **bytes** and **complexity**.
- Use **CSS variables** for scoped typography roles.

---

## 14.3 Local Fonts

### 14.3.1 Loading font files

**Beginner Level**  
Put `.woff2` files under `app/fonts/` or `public/fonts/` (imported paths differ).

**Intermediate Level**  
`localFont({ src: './file.woff2' })` bundles at build.

**Expert Level**  
For **e‑commerce** with seasonal campaigns, swap font files with cache-busted names in deployments.

```typescript
import localFont from "next/font/local";

export const editorial = localFont({
  src: "./fonts/Editorial-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
});
```

#### Key Points — 14.3.1

- Prefer **woff2**; keep **TTF** only if required for special targets.
- Verify **path** resolution from file location.

---

### 14.3.2 `src` path

**Beginner Level**  
Relative to the file calling `localFont`.

**Intermediate Level**  
Array form maps multiple files to weights/styles.

**Expert Level**  
Monorepos: ensure font files live inside the **Next app** package so bundler resolves them.

```typescript
import localFont from "next/font/local";

export const mono = localFont({
  src: [
    { path: "./fonts/Mono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Mono-Italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
});
```

#### Key Points — 14.3.2

- Incorrect relative paths fail **build**.
- Use **TypeScript** path aliases only if supported by your bundler setup for fonts (often simpler to use relative).

---

### 14.3.3 Weight variants

**Beginner Level**  
Each physical file declares its **`weight`** in the descriptor.

**Intermediate Level**  
Missing weight mapping causes **synthetic** bolding—ugly for **dashboard** UI.

**Expert Level**  
Map CSS `font-weight` utilities (Tailwind) to actually loaded weights only.

#### Key Points — 14.3.3

- Real files for **600** read better than faux bold.
- Keep parity with design system tokens.

---

### 14.3.4 Format support

**Beginner Level**  
**woff2** is standard; **woff** fallback occasionally added.

**Intermediate Level**  
Avoid **EOT/TTF** for web unless legacy requirements.

**Expert Level**  
Variable fonts in local bundles need correct **`weight`** range configuration per `next/font` version docs.

#### Key Points — 14.3.4

- Modern browsers: **woff2** sufficient.
- Test **mobile** WebViews used in **social** hybrid apps.

---

## 14.4 Font Usage

### 14.4.1 `className`

**Beginner Level**  
`const inter = Inter(...);` then `className={inter.className}` on `<html>` or layout wrapper.

**Intermediate Level**  
Compose with Tailwind: `className={cn(inter.className, 'antialiased')}`.

**Expert Level**  
For **component libraries**, export font wrapper components to prevent inconsistent application.

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap" });

export function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className={`${jakarta.className} min-h-dvh antialiased`}>{children}</div>;
}
```

#### Key Points — 14.4.1

- `className` applies **`font-family`** CSS.
- Add **`antialiased`** sparingly; test readability.

---

### 14.4.2 CSS variables

**Beginner Level**  
Pass `variable: '--font-brand'` to expose a CSS custom property.

**Intermediate Level**  
Put variable on parent, use `font-family: var(--font-brand)` in CSS modules or Tailwind config.

**Expert Level**  
Enables **theme switching** between sans/serif modes in **blogs**.

```typescript
import { DM_Sans } from "next/font/google";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});
```

```tsx
<html lang="en" className={dmSans.variable}>
  <body className="font-[family-name:var(--font-dm-sans)]">{/* ... */}</body>
</html>
```

#### Key Points — 14.4.2

- Variables integrate with **Tailwind v4** / arbitrary properties patterns.
- Keep naming **consistent** across themes.

---

### 14.4.3 Global application

**Beginner Level**  
Set fonts in `app/layout.tsx` for entire **SaaS** app.

**Intermediate Level**  
Nested layouts can override for **marketing** vs **app** areas.

**Expert Level**  
Separate `(marketing)` and `(app)` route groups with different `layout.tsx` font choices.

```tsx
import type { ReactNode } from "react";
import { inter } from "@/lib/fonts";

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}
```

#### Key Points — 14.4.3

- Global defaults reduce **FOUC** inconsistencies.
- Scoped overrides for **editorial** zones.

---

### 14.4.4 Reuse and composition

**Beginner Level**  
Import the same font object everywhere from `lib/fonts.ts`.

**Intermediate Level**  
Do not re-instantiate fonts inside frequently remounted client components.

**Expert Level**  
For **SSR** + **client** boundaries, initialize fonts only in **server** modules imported by layouts.

```typescript
// lib/fonts.ts — single source of truth
import { Inter } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], display: "swap" });
```

#### Key Points — 14.4.4

- Singleton modules prevent **duplicate** `@font-face` rules.
- Easier **testing** of typography tokens.

---

## 14.5 Font Best Practices

### 14.5.1 Minimizing load time

**Beginner Level**  
Fewer weights and subsets = faster.

**Intermediate Level**  
Preload only what LCP text needs; `next/font` handles much of this—avoid extra manual preloads unless measured necessary.

**Expert Level**  
For **above-the-fold** **e‑commerce** headlines, avoid loading decorative fonts on PLP—defer to PDP if needed.

#### Key Points — 14.5.1

- Treat fonts like **critical CSS**—justify each file.
- Monitor **RUM** by page template.

---

### 14.5.2 Subsetting

**Beginner Level**  
Load only character sets you need (`latin` vs `vietnamese`).

**Intermediate Level**  
For **user-generated content** in many languages, plan dynamic subset strategy or system font fallbacks.

**Expert Level**  
Some teams use **noto** variable fonts with careful subsetting per locale route.

#### Key Points — 14.5.2

- Subsetting impacts **i18n** completeness—test content.
- Automated checks for missing glyph tofu □.

---

### 14.5.3 Display strategies

**Beginner Level**  
Default to **`swap`** for body text.

**Intermediate Level**  
Use **`optional`** for nice-to-have display faces on **marketing** landers.

**Expert Level**  
Align with brand guidelines on **FOUT** vs **FOIT** tolerance; document in design system.

#### Key Points — 14.5.3

- **`display`** is a UX contract with users on slow networks.
- Re-test when changing **fallback** stacks.

---

### Extended real-world patterns (E‑commerce, Blog, Dashboard, SaaS, Social)

**Beginner Level**  
Different products stress fonts differently: a **blog** wants readable long-form serif/sans pairing; a **dashboard** wants compact UI fonts.

**Intermediate Level**  
**E‑commerce**: use a single UI sans across PLP/PDP for performance, load a **display** font only on campaign landing routes via nested `layout.tsx`. **SaaS**: align `next/font` with your design tokens and export CSS variables consumed by Tailwind `theme.extend.fontFamily`.

**Expert Level**  
**Social** feeds mix user content (system font fallbacks for unknown scripts) with app chrome (custom font). Use `unicode-range` splits only when you manually craft `@font-face`; with `next/font`, prefer **separate locale layouts** loading Noto subsets for Cyrillic/Arabic routes. **Dashboard** density: test **tabular nums** with `font-feature-settings: "tnum"` on financial tables—works with many Google fonts when enabled in CSS.

```tsx
// app/(app)/dashboard/layout.tsx — dashboard-specific font tuning
import type { ReactNode } from "react";
import { IBM_Plex_Sans } from "next/font/google";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex",
});

export default function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className={`${plex.variable} font-[family-name:var(--font-plex)]`}>
      <div className="tabular-nums">{children}</div>
    </div>
  );
}
```

```typescript
// tailwind.config.ts (excerpt) — wire next/font variables
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
};

export default config;
```

#### Key Points — Extended patterns

- Route-group **layouts** localize font cost to surfaces that need it.
- Combine **`variable`** fonts with Tailwind for **tokenized** typography.
- **Tabular figures** matter for **fintech** dashboards and **e‑commerce** order tables.

---

### Font loading observability and CI notes

**Beginner Level**  
If fonts look wrong in production, check that **`subsets`** include your language and that CSS actually applies `className`.

**Intermediate Level**  
In CI, **`next build`** may download Google fonts—ensure outbound network or use **cached** font artifacts per your org policy. Compare **Lighthouse** “Font display” and **WebPageTest** filmstrips before/after changes.

**Expert Level**  
Track **CLS** attributed to text in RUM (e.g., web-vitals library). For **SaaS** multi-tenant branding, lazy-load tenant-specific **local** fonts only after auth when the brand requires it—use dynamic `import()` of a small CSS module or split layout per tenant **slug** with caution for cache cardinality.

```typescript
// instrumentation: send web-vitals CLS to analytics (client component sketch)
"use client";

import { onCLS } from "web-vitals";

export function FontMetricsListener(): null {
  if (typeof window === "undefined") return null;
  onCLS((metric) => {
    if (metric.entries.length) {
      // eslint-disable-next-line no-console
      console.debug("CLS", metric.value, metric.entries);
    }
  });
  return null;
}
```

#### Key Points — Observability

- **Build reproducibility** matters when fonts are fetched remotely.
- **CLS** entries help catch bad fallback stacks or late-applied `className` swaps.

---

### Quick reference — choosing `next/font/google` vs `next/font/local`

| Scenario | Recommendation | Rationale |
|----------|----------------|-----------|
| Default marketing **blog** | `next/font/google` with 2 weights | Fast setup, self-hosted by Next |
| Licensed **brand** font | `next/font/local` woff2 | Compliance + full control |
| **Dashboard** data UI | Single sans, limited weights | Smaller CSS and fewer files |
| **Social** UGC multilingual | System stack + targeted Noto subsets | Avoid shipping global glyphs unused |
| **E‑commerce** campaign page | Optional second display font on nested layout | Keeps PLP lean |

**Beginner Level**  
Use the table as a cheat sheet when starting a new Next app.

**Intermediate Level**  
Validate each row against your **Core Web Vitals** budget and **brand** guidelines.

**Expert Level**  
Automate checks: fail CI if new font weights are added without design approval; parse `lib/fonts.ts` exports in a lint script.

These rows are guidance, not rules: always confirm with **Lighthouse**, **RUM**, and **brand** compliance before shipping typography changes to **production**.

When in doubt, ship the smallest **font surface area** first, then expand weights or families only after **metrics** justify the cost.

---

## Key Points (Chapter Summary)

- `next/font` **self-hosts** fonts and integrates with React layouts via `className` and **CSS variables**.
- **`next/font/google`** is typed and configurable; **`next/font/local`** suits licensed brand fonts.
- **Weights and subsets** dominate **byte size**—prune aggressively.
- **`display: swap`** is the general-purpose default for readable **SaaS** UIs.
- **Variable fonts** can reduce file proliferation when axes match design needs.
- **Singleton font modules** prevent duplication and ease theming.

## Best Practices (End of Guide)

- Centralize font definitions in a **`lib/fonts.ts`** module.
- Limit font families and weights to **design-token** lists.
- Use **`variable`** + CSS for role-based typography (UI vs prose).
- Apply fonts at **`layout.tsx`** levels appropriate to route groups.
- Prefer **woff2** for local fonts; verify licensing for **brand** typefaces.
- Pair font strategy with **tailwind** config (`fontFamily`) when applicable.
- Measure **CLS** and **LCP** after font changes in **field** data.
- Document **`display`** decisions for marketing vs app surfaces.

## Common Mistakes to Avoid

- Re-instantiating fonts in many files → duplicated **`@font-face`** and confusion.
- Importing **all** Google weights “for convenience.”
- Loading **unused** subsets for every locale on every page.
- Using **`block`** display without understanding FOIT impact.
- Mixing `next/font` with manual **Google `<link>`** tags—double downloads.
- Incorrect **`src`** paths for local fonts breaking CI builds.
- Applying **different** font families to children without inheriting variables—inheritance bugs.
- Ignoring **fallback** metrics causing visible **layout shift** when swapping.
- Using **too many** custom fonts on **mobile** **social** feeds—CPU and memory cost.
- Forgetting **`antialiased`**/`subpixel-antialiased` tradeoffs on low-DPI screens—test readability.
