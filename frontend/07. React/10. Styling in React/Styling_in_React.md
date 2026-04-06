# Styling in React (TypeScript)

**Styling** shapes **perceived** **quality** in **e-commerce** **product** **pages**, **social** **timelines**, **analytics** **dashboards**, **todo** **apps**, **weather** **cards**, **chat** **bubbles**, and **admin** **consoles**. React **does** **not** **prescribe** **one** **approach**—teams **mix** **global** **CSS**, **CSS** **Modules**, **utility** **frameworks**, **CSS-in-JS**, and **component** **libraries**. This chapter **maps** **options** **with** **TypeScript-aware** **examples** and **production** **trade-offs**.

---

## 📑 Table of Contents

- [Styling in React (TypeScript)](#styling-in-react-typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [10.1 CSS Styling Methods](#101-css-styling-methods)
  - [10.2 CSS-in-JS Libraries](#102-css-in-js-libraries)
  - [10.3 Utility-First CSS](#103-utility-first-css)
  - [10.4 Component Libraries](#104-component-libraries)
  - [10.5 Animation Libraries](#105-animation-libraries)
  - [10.6 Styling Best Practices](#106-styling-best-practices)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 10.1 CSS Styling Methods

### Inline Styles (`style` prop)

**Beginner Level**

**`style={{ color: 'red' }}`** passes **JavaScript** **objects** with **camelCased** **properties**. **Good** for **quick** **prototypes** and **dynamic** **values** **computed** at **runtime**—**not** **ideal** for **large** **design** **systems**.

**Real-time example**: **Dashboard** **sparkline** **color** **from** **threshold** **logic** (**green**/**amber**/**red**).

**Intermediate Level**

**No** **pseudo-classes** (**`:hover`**) **without** **extra** **state**; **no** **media** **queries** **inline**—**use** **CSS** **files** or **CSS-in-JS** **for** **those**.

**Expert Level**

**Performance**: **avoid** **allocating** **new** **`style`** **objects** **each** **render**—**memoize** **or** **predefine** **variants**.

```tsx
type Trend = "up" | "down" | "flat";

const TREND_COLOR: Record<Trend, string> = {
  up: "#16a34a",
  down: "#dc2626",
  flat: "#64748b",
};

export function KpiDelta({ trend, value }: { trend: Trend; value: string }) {
  return (
    <span style={{ color: TREND_COLOR[trend], fontWeight: 600 }} aria-label={`Trend ${trend}`}>
      {value}
    </span>
  );
}
```

#### Key Points — Inline

- **Great** for **computed** **one-off** **values**.
- **Poor** for **pseudos**, **keyframes**, **and** **responsive** **rules**.
- **Prefer** **tokens** **over** **magic** **hex** **strings** **when** **scaling**.

---

### Global CSS Stylesheets (`import './App.css'`)

**Beginner Level**

**Plain** **`.css`** **files** **imported** **in** **TS/TSX** **apply** **globally** **unless** **namespaced** **manually**—**simplest** **onboarding** **path**.

**Real-time example**: **E-commerce** **site** **header**/**footer** **layout** **shared** **across** **routes**.

**Intermediate Level**

**Co-locate** **per** **feature** **CSS** **but** **mind** **specificity** **wars**; **use** **layer** (**`@layer`**) **or** **BEM** (§10.6).

**Expert Level**

**Critical** **CSS** **and** **code-splitting**: **ensure** **route** **CSS** **loads** **with** **chunks** **to** **avoid** **FOUC** **regressions**.

```css
/* layout.css */
.app-shell {
  display: grid;
  min-height: 100dvh;
  grid-template-rows: auto 1fr auto;
}
```

```tsx
import "./layout.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">Shop</header>
      <main className="app-shell__main">{children}</main>
      <footer className="app-shell__footer">© {new Date().getFullYear()}</footer>
    </div>
  );
}
```

#### Key Points — Stylesheets

- **Fast** **authoring** **for** **teams** **comfortable** **with** **CSS**.
- **Risk** **of** **global** **collisions** **without** **discipline**.
- **Works** **everywhere**—**no** **runtime** **CSS** **engine** **needed**.

---

### CSS Modules (`*.module.css`)

**Beginner Level**

**`import styles from './Card.module.css'`** → **`styles.title`** is **a** **unique** **class** **name** at **build** **time**—**local** **scope** **by** **default**.

**Real-time example**: **Social** **post** **card** **with** **`.title`**, **`.meta`**, **`.body`** **without** **clashing** **with** **other** **`.title`**.

**Intermediate Level**

**`:global(.dark)`** **escapes** **to** **global** **selectors** **when** **integrating** **third-party** **markup**.

**Expert Level**

**TypeScript** **plugins** **can** **generate** **`*.module.css.d.ts`** **for** **autocomplete** **and** **typos** **as** **errors**.

```tsx
import styles from "./PostCard.module.css";

type Post = { author: string; text: string };

export function PostCard({ author, text }: Post) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={styles.author}>{author}</span>
      </header>
      <p className={styles.body}>{text}</p>
    </article>
  );
}
```

#### Key Points — CSS Modules

- **Strong** **default** **for** **component** **CSS** **in** **CRA/Vite/Webpack**.
- **Composable** **with** **`classnames`** / **`clsx`** **for** **variants**.
- **Keeps** **specificity** **low** **when** **paired** **with** **BEM-like** **local** **names**.

---

### Sass / SCSS

**Beginner Level**

**SCSS** **adds** **variables**, **nesting**, **mixins**, **and** **partials**—**compile** **to** **CSS** **at** **build** **time**.

**Real-time example**: **Dashboard** **theme** **spacing** **scale** **via** **`$space-4`**.

**Intermediate Level**

**Deep** **nesting** **mimics** **high** **specificity**—**flatten** **to** **avoid** **pain** **later**.

**Expert Level**

**Design** **tokens** **in** **JSON** **→** **Style** **Dictionary** **→** **SCSS** **variables** **for** **multi-platform** **consistency**.

```scss
$radius: 12px;

.card {
  border-radius: $radius;

  &__title {
    font-weight: 700;
  }
}
```

```tsx
import "./Card.scss";

export function MetricCard({ title }: { title: string }) {
  return (
    <section className="card">
      <h3 className="card__title">{title}</h3>
    </section>
  );
}
```

#### Key Points — Sass

- **Excellent** **for** **tokenized** **spacing**/**typography** **systems**.
- **Nesting** **is** **powerful** **but** **can** **create** **brittle** **selectors**.
- **Build** **tooling** **required**—**not** **native** **in** **browser**.

---

### PostCSS

**Beginner Level**

**PostCSS** **transforms** **CSS** **with** **plugins**: **autoprefixer**, **`postcss-preset-env`**, **Tailwind** (**as** **plugin** **pipeline**).

**Real-time example**: **E-commerce** **checkout** **gets** **automatic** **vendor** **prefixes** **for** **flexbox** **edge** **cases**.

**Intermediate Level**

**Custom** **plugins** **lint** **colors**, **ban** **disallowed** **properties**, **or** **strip** **unused** **rules**.

**Expert Level**

**Integrate** **with** **CSS** **Modules** **and** **minifiers** **in** **Vite**/**Webpack** **for** **deterministic** **output**.

```typescript
// postcss.config.ts (illustrative)
export default {
  plugins: {
    autoprefixer: {},
  },
};
```

#### Key Points — PostCSS

- **Central** **place** **for** **browser** **compat** **policy**.
- **Often** **invisible** **to** **app** **developers**—**still** **must** **be** **versioned**.
- **Pairs** **with** **any** **authoring** **syntax** **that** **compiles** **to** **CSS**.

---

### CSS-in-JS Overview (Runtime vs Zero-Runtime)

**Beginner Level**

**CSS-in-JS** **colocates** **styles** **with** **components**—**two** **families**: **runtime** (**styled-components**, **Emotion**) **injects** **rules** **in** **the** **browser**; **build-time** (**Vanilla** **Extract**, **Linaria**) **emits** **static** **CSS** **files**.

**Real-time example**: **Chat** **bubble** **variants** **with** **`variant={mine|theirs}`**.

**Intermediate Level**

**Trade-offs**: **runtime** **bundle** **size**/**SSR** **complexity** vs **DX** **ergonomics**; **zero-runtime** **closer** **to** **CSS** **Modules** **performance**.

**Expert Level**

**Concurrent** **React** **and** **streaming** **SSR** **need** **careful** **style** **ordering** **and** **cache** **keys**—**follow** **library** **guides**.

```tsx
// Conceptual — detailed libraries in §10.2
declare const StyledBubble: React.ComponentType<{ $mine?: boolean; children?: React.ReactNode }>;

export function ChatBubble({ mine, text }: { mine: boolean; text: string }) {
  return <StyledBubble $mine={mine}>{text}</StyledBubble>;
}
```

#### Key Points — CSS-in-JS Overview

- **Pick** **runtime** **vs** **zero-runtime** **based** **on** **SSR**, **perf** **budget**, **and** **team** **familiarity**.
- **Theming** **often** **first-class** **in** **runtime** **libraries**.
- **Avoid** **mixing** **three** **styling** **systems** **without** **rules**.

---

## 10.2 CSS-in-JS Libraries

### Styled Components — Basics

**Beginner Level**

**`styled.tag`** **template** **literals** **create** **React** **components** **with** **attached** **styles**—**great** **DX** **for** **component** **libraries** **inside** **apps**.

**Real-time example**: **Todo** **app** **primary** **button** **component** **with** **padding**/**radius**.

**Intermediate Level**

**TypeScript** **augmentation** **for** **theme** **props**—**declare** **`DefaultTheme`**.

**Expert Level**

**Server-side** **rendering** **requires** **`ServerStyleSheet`** **or** **framework** **integration** **to** **collect** **critical** **CSS**.

```tsx
// Illustrative types — install styled-components for real usage
import styled from "styled-components";

export const PrimaryButton = styled.button`
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  background: #2563eb;
  color: white;
  font-weight: 600;
`;
```

#### Key Points — Styled Components Basics

- **Styles** **travel** **with** **components**—**easy** **refactors**.
- **Adds** **runtime** **cost**—**measure** **on** **low-end** **devices**.
- **Great** **fit** **for** **design-system** **primitives**.

---

### Styled Components — Props & Interpolation

**Beginner Level**

**`${(p) => p.$active}`** **inside** **template** **strings** **changes** **rules** **based** **on** **props**—**typed** **props** **recommended**.

**Real-time example**: **E-commerce** **size** **picker** **highlights** **selected** **SKU**.

**Intermediate Level**

**Transient** **props** **`$active`** **avoid** **leaking** **DOM** **attributes** **(styled-components** **v5+** **convention**).

**Expert Level**

**Co-locate** **cubic-bezier** **transitions** **with** **interaction** **design** **tokens**.

```tsx
import styled from "styled-components";

type ChipProps = { $selected: boolean };

export const SkuChip = styled.button<ChipProps>`
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid ${(p) => (p.$selected ? "#111827" : "#e5e7eb")};
  background: ${(p) => (p.$selected ? "#111827" : "white")};
  color: ${(p) => (p.$selected ? "white" : "#111827")};
`;
```

#### Key Points — Props

- **Prefix** **`$`** **for** **style-only** **props** **where** **supported**.
- **Keep** **style** **props** **narrow**—**avoid** **exploding** **permutations**.
- **Test** **visual** **states** **with** **storybook** **controls**.

---

### Styled Components — Extending & `as` Polymorphism

**Beginner Level**

**`styled(Existing)`** **extends** **styles**; **`as="a"`** **changes** **rendered** **element** **while** **keeping** **styles**.

**Real-time example**: **Social** **link** **looks** **like** **button** **but** **navigates** **with** **`<a>`** **semantics**.

**Intermediate Level**

**Polymorphic** **typing** **gets** **tricky**—**use** **library** **helpers** **or** **explicit** **unions**.

**Expert Level**

**Composition** **with** **router** **`Link`** **components** **requires** **forwardRef** **awareness**.

```tsx
import styled from "styled-components";

const Base = styled.button`
  font: inherit;
`;

export const TextButton = styled(Base)`
  background: transparent;
  border: 0;
  color: #2563eb;
`;
```

#### Key Points — Extending

- **Prefer** **composition** **over** **deep** **inheritance** **chains**.
- **`as`** **impacts** **a11y**—**verify** **roles**/**keyboard**.
- **Document** **which** **props** **are** **valid** **per** **target** **element**.

---

### Styled Components — Theming (`ThemeProvider`)

**Beginner Level**

**`ThemeProvider`** **injects** **tokens** **(`theme.colors.brand`)** **accessible** **in** **all** **styled** **components**.

**Real-time example**: **Dashboard** **dark**/**light** **toggle** **swaps** **palette** **tokens**.

**Intermediate Level**

**Type** **`DefaultTheme`** **for** **autocomplete** **and** **compile-time** **safety**.

**Expert Level**

**Split** **themes** **per** **brand** **for** **white-label** **e-commerce** **experiences**.

```tsx
import type { DefaultTheme } from "styled-components";
import styled, { ThemeProvider } from "styled-components";

const theme: DefaultTheme = {
  colors: { bg: "#0b1220", fg: "#e5e7eb", brand: "#38bdf8" },
};

const Panel = styled.section`
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.fg};
`;

export function ThemedApp({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

#### Key Points — Theming

- **Centralize** **tokens**—**avoid** **one-off** **hex** **in** **components**.
- **Persist** **user** **theme** **choice** **in** **`localStorage`** **+** **`prefers-color-scheme`** **fallback**.
- **Test** **contrast** **ratios** **for** **a11y**.

---

### Styled Components — Global Styles (`createGlobalStyle`)

**Beginner Level**

**`createGlobalStyle`** **defines** **resets**, **font-face**, **and** **CSS** **variables** **on** **`:root`**.

**Real-time example**: **App-wide** **box-sizing** **reset** **and** **font** **stack** **for** **chat** **UI**.

**Intermediate Level**

**Order** **matters**—**import** **global** **style** **component** **high** **in** **tree**.

**Expert Level**

**Layer** **with** **route-level** **CSS** **for** **micro-frontends** **carefully**—**avoid** **duplicated** **resets**.

```tsx
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: dark light;
  }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
`;
```

#### Key Points — Global

- **Keep** **globals** **minimal**—**push** **component** **rules** **down**.
- **Prefer** **CSS** **variables** **for** **runtime** **theming** **where** **appropriate**.
- **Document** **what** **belongs** **in** **global** **vs** **module** **CSS**.

---

### Emotion

**Beginner Level**

**`@emotion/react` + `@emotion/styled`** **similar** **API** **to** **styled-components**—**often** **smaller** **bundles** **with** **specific** **configs**.

**Real-time example**: **Weather** **widget** **with** **`css` prop** **for** **one-off** **rules**.

**Intermediate Level**

**`css` prop** **requires** **JSX** **pragma** **or** **babel**/**SWC** **plugin** **configuration**.

**Expert Level**

**Used** **heavily** **by** **MUI** **v5**—**good** **interop** **with** **that** **ecosystem**.

```tsx
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

const card = css`
  border-radius: 12px;
  padding: 12px;
  background: #0f172a;
  color: #e2e8f0;
`;

export function WeatherCard({ tempC }: { tempC: number }) {
  return (
    <article css={card}>
      <p>{tempC.toFixed(1)}°C</p>
    </article>
  );
}
```

#### Key Points — Emotion

- **Flexible** **between** **`styled`** **and** **`css` prop**.
- **Verify** **build** **plugin** **setup** **for** **TypeScript** **projects**.
- **Mind** **SSR** **style** **caching** **like** **other** **runtime** **CSS-in-JS**.

---

### JSS

**Beginner Level**

**JavaScript** **objects** **describe** **styles**—**less** **common** **in** **greenfield** **React** **now**, **still** **present** **in** **legacy** **code**.

**Real-time example**: **Admin** **table** **column** **widths** **computed** **from** **schema**.

**Intermediate Level**

**`createUseStyles`** **hooks** **scoped** **classes** **with** **theme** **injection**.

**Expert Level**

**Consider** **migration** **to** **Emotion**/**Linaria**/**CSS** **Modules** **when** **maintaining** **long-term**.

```tsx
// Conceptual JSS-style object
const styles = {
  root: {
    display: "grid",
    gap: 8,
  },
  cell: {
    padding: "6px 8px",
  },
} as const;

export function LegacyGrid() {
  return (
    <div style={styles.root}>
      <div style={styles.cell}>SKU</div>
      <div style={styles.cell}>Qty</div>
    </div>
  );
}
```

#### Key Points — JSS

- **Object** **syntax** **maps** **well** **to** **TS** **const** **assertions**.
- **Ecosystem** **momentum** **lower** **than** **Emotion**/**styled-components**.
- **Evaluate** **migration** **cost** **vs** **benefit** **explicitly**.

---

### Linaria (Zero-Runtime)

**Beginner Level**

**Write** **CSS** **in** **TS** **files** **with** **`css` tagged** **templates**—**build** **step** **extracts** **to** **static** **`.css`**.

**Real-time example**: **Marketing** **landing** **page** **with** **animations** **but** **strict** **performance** **budget**.

**Intermediate Level**

**Atomic** **output** **and** **deduplication** **vary** **by** **config**—**read** **docs** **for** **your** **bundler**.

**Expert Level**

**Excellent** **for** **SSR** **and** **edge** **rendering** **where** **runtime** **CSS** **injection** **is** **undesirable**.

```tsx
// Illustrative — API resembles tagged templates; configure bundler per Linaria docs
import { css } from "@linaria/core";

const hero = css`
  padding: 48px 16px;
  background: radial-gradient(circle at top, #1d4ed8, #0b1220);
`;

export function Hero() {
  return <section className={hero}>Build faster</section>;
}
```

#### Key Points — Linaria

- **Near** **CSS-in-JS** **DX** **without** **runtime** **tax**.
- **Requires** **build** **pipeline** **support**.
- **Great** **when** **performance** **is** **critical**.

---

### Vanilla Extract

**Beginner Level**

**Type-safe** **style** **API** **with** **`.css.ts`** **files**—**styles** **compile** **to** **static** **classes**.

**Real-time example**: **Design** **system** **primitives** **for** **multi-app** **e-commerce** **monorepo**.

**Intermediate Level**

**Recipes** **and** **sprinkles** **patterns** **for** **variants** **akin** **to** **Tailwind-like** **atomic** **composition** **within** **VE** **ecosystem**.

**Expert Level**

**Strong** **typing** **for** **tokens**—**ideal** **for** **large** **teams** **wanting** **compile-time** **guarantees**.

```ts
// styles.css.ts (conceptual)
import { style } from "@vanilla-extract/css";

export const card = style({
  borderRadius: 12,
  padding: 12,
  background: "#0b1220",
  color: "#e5e7eb",
});
```

```tsx
import { card } from "./styles.css";

export function Panel({ children }: { children: React.ReactNode }) {
  return <section className={card}>{children}</section>;
}
```

#### Key Points — Vanilla Extract

- **Excellent** **TS** **integration**.
- **Zero** **runtime** **styles** **(excluding** **dev** **helpers)**.
- **Pairs** **well** **with** **strict** **design** **tokens**.

---

## 10.3 Utility-First CSS

### Tailwind CSS — Core Ideas

**Beginner Level**

**Compose** **UI** **with** **small** **utility** **classes** **`flex`**, **`p-4`**, **`text-sm`** **directly** **in** **`className`**.

**Real-time example**: **Social** **profile** **header** **layout** **without** **writing** **custom** **CSS** **files**.

**Intermediate Level**

**JIT** **compiler** **generates** **only** **used** **classes**—**large** **design** **space**, **small** **CSS** **output**.

**Expert Level**

**Design** **tokens** **mapped** **to** **Tailwind** **theme** **extension**—**single** **source** **of** **truth** **for** **product** **and** **engineering**.

```tsx
export function ProfileHeader({ name, handle }: { name: string; handle: string }) {
  return (
    <header className="flex items-center gap-3 border-b border-slate-800 p-4">
      <div className="h-12 w-12 rounded-full bg-slate-700" aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-slate-50">{name}</p>
        <p className="truncate text-sm text-slate-400">@{handle}</p>
      </div>
    </header>
  );
}
```

#### Key Points — Tailwind

- **Rapid** **iteration** **for** **product** **teams**.
- **Requires** **discipline** **to** **avoid** **unreadable** **`className`** **strings**.
- **Use** **`@apply` sparingly**—**prefer** **components** **for** **repeated** **patterns**.

---

### Tailwind Configuration (`tailwind.config.ts`)

**Beginner Level**

**Extend** **`theme.colors`**, **`fontFamily`**, **`screens`** **to** **encode** **brand** **guidelines**.

**Real-time example**: **E-commerce** **brand** **primary** **palette** **wired** **into** **`bg-brand`**, **`text-brand`**.

**Intermediate Level**

**Plugins** **`@tailwindcss/forms`**, **`typography`** **add** **opinionated** **presets**.

**Expert Level**

**Monorepo** **shared** **preset** **package** **consumed** **by** **web** **and** **docs** **sites**.

```ts
// tailwind.config.ts (illustrative)
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#2563eb", foreground: "#ffffff" },
      },
    },
  },
  plugins: [],
};

export default config;
```

#### Key Points — Configuration

- **`content` paths** **must** **be** **accurate** **or** **styles** **purge** **incorrectly**.
- **Prefer** **semantic** **token** **names** **over** **raw** **hex** **in** **components**.
- **Version** **lock** **config** **with** **design** **tokens** **repo**.

---

### Custom Classes & Component Extraction

**Beginner Level**

**Wrap** **repeated** **utility** **clusters** **in** **`components/ui/Button.tsx`** **with** **fixed** **variants**.

**Real-time example**: **Dashboard** **toolbar** **buttons** **share** **height**, **radius**, **focus** **ring**.

**Intermediate Level**

**`clsx` + `tailwind-merge`** **resolve** **conflicting** **classes** **when** **merging** **props**.

**Expert Level**

**`cva` (class-variance-authority)** **for** **typed** **variant** **APIs**—**popular** **with** **shadcn/ui**.

```tsx
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cx(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium",
        variant === "primary" && "bg-brand text-brand-foreground hover:bg-brand/90",
        variant === "ghost" && "bg-transparent text-slate-200 hover:bg-slate-800",
        className,
      )}
      {...props}
    />
  );
}
```

#### Key Points — Custom Classes

- **Componentize** **early**—**avoid** **copy-pasted** **20-class** **strings**.
- **`tailwind-merge`** **prevents** **`p-2` vs `p-4`** **conflicts**.
- **Expose** **`className`** **escape** **hatch** **for** **consumers**.

---

### Component Libraries Built on Tailwind (DaisyUI, etc.)

**Beginner Level**

**Plugins** **add** **component** **classes** **like** **`btn`**, **`card`**—**faster** **MVP** **prototyping**.

**Real-time example**: **Internal** **admin** **tool** **uses** **prefab** **tables** **and** **modals**.

**Intermediate Level**

**Balance** **between** **plugin** **magic** **and** **design** **uniqueness**.

**Expert Level**

**Audit** **accessibility** **of** **prefab** **patterns**—**not** **all** **defaults** **are** **WCAG** **compliant** **out** **of** **box**.

#### Key Points — Tailwind Ecosystem

- **Great** **velocity** **for** **internal** **tools**.
- **May** **fight** **strict** **brand** **requirements**.
- **Test** **keyboard** **and** **screenreader** **flows**.

---

### UnoCSS

**Beginner Level**

**Instant** **on-demand** **atomic** **CSS** **engine**—**Tailwind-like** **utilities** **with** **different** **plugin** **ecosystem**.

**Real-time example**: **High-performance** **marketing** **sites** **with** **massive** **variant** **matrices**.

**Intermediate Level**

**Presets** **mirror** **Tailwind** **or** **Windi** **for** **migration** **paths**.

**Expert Level**

**Integrations** **with** **Vite** **for** **extremely** **fast** **DX** **in** **large** **repos**.

#### Key Points — UnoCSS

- **Evaluate** **vs** **Tailwind** **based** **on** **tooling** **fit**.
- **Great** **when** **build** **speed** **is** **bottleneck**.
- **Team** **docs** **still** **needed** **for** **utility** **discoverability**.

---

## 10.4 Component Libraries

### MUI (Material UI)

**Beginner Level**

**`<Button variant="contained">`** **and** **comprehensive** **inputs** **accelerate** **dashboard** **builds**.

**Real-time example**: **Analytics** **console** **filters**, **tables**, **dialogs** **with** **consistent** **Material** **language**.

**Intermediate Level**

**Theming** **`createTheme`**, **`ThemeProvider`**, **`sx` prop** **for** **one-off** **layout** **tweaks**.

**Expert Level**

**DataGrid** **Pro** **features** **licensing**—**plan** **costs** **for** **enterprise** **grids**.

```tsx
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Button variant="contained" onClick={onSave}>
        Save changes
      </Button>
    </Stack>
  );
}
```

#### Key Points — MUI

- **Huge** **surface** **area**—**tree-shake** **imports**.
- **Strong** **a11y** **baseline** **when** **used** **as** **documented**.
- **Bundle** **size** **requires** **attention** **on** **mobile**.

---

### Ant Design

**Beginner Level**

**Enterprise** **components** **(Table**, **Form**, **DatePicker)** **with** **opinionated** **UX**.

**Real-time example**: **Operations** **dashboard** **with** **complex** **filtering** **and** **server-driven** **tables**.

**Intermediate Level**

**Less** **theming** **flexibility** **vs** **headless** **libraries**—**budget** **customization** **time**.

**Expert Level**

**Icon** **bundle** **size**—**import** **icons** **explicitly**.

#### Key Points — Ant Design

- **Great** **for** **dense** **admin** **UIs**.
- **Heavier** **visual** **opinion**—**may** **clash** **with** **brand** **guides**.
- **Check** **React** **18**/**19** **compatibility** **per** **release**.

---

### Chakra UI

**Beginner Level**

**Composable** **primitives** **`Box`**, **`Stack`**, **`Button`** **with** **`sx`/`style` props** **and** **theme** **tokens**.

**Real-time example**: **Marketing** **site** **+** **app** **shell** **with** **consistent** **spacing** **scale**.

**Intermediate Level**

**Chakra** **v2/v3** **migration** **nuances**—**follow** **official** **guides**.

**Expert Level**

**Great** **DX** **for** **teams** **wanting** **design** **tokens** **without** **writing** **raw** **CSS**.

#### Key Points — Chakra

- **Token-driven** **layout** **feels** **natural** **in** **TSX**.
- **Runtime** **CSS-in-JS** **trade-offs** **apply**.
- **Strong** **community** **recipes**.

---

### Mantine

**Beginner Level**

**Feature-rich** **hooks** **+** **components** **(DatePicker**, **RichText**, **Spotlight)** **for** **app** **builders**.

**Real-time example**: **Internal** **CRM** **with** **keyboard** **shortcuts** **and** **command** **palette**.

**Intermediate Level**

**Bundled** **styles** **strategy** **differs** **by** **version**—**read** **install** **docs**.

**Expert Level**

**Great** **fit** **for** **admin** **panels** **needing** **many** **inputs** **out** **of** **box**.

#### Key Points — Mantine

- **Rapid** **feature** **development**.
- **Assess** **bundle** **impact** **per** **import** **path**.
- **Accessibility** **generally** **solid**—**still** **verify** **custom** **composition**.

---

### shadcn/ui (Pattern) + Radix Primitives

**Beginner Level**

**Copy-paste** **components** **into** **your** **repo**—**not** **an** **npm** **opaque** **black** **box**; **built** **on** **Radix** **+** **Tailwind**.

**Real-time example**: **SaaS** **app** **dialogs**, **dropdowns**, **tabs** **with** **accessible** **behavior** **you** **own**.

**Intermediate Level**

**You** **maintain** **code**—**upgrades** **are** **merges**, **not** **semver** **bumps** **only**.

**Expert Level**

**Ideal** **when** **design** **system** **must** **match** **brand** **exactly** **with** **full** **control**.

```tsx
import * as Dialog from "@radix-ui/react-dialog";

export function ConfirmDelete({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(90vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-4 text-slate-900 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Delete post?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-slate-600">This action cannot be undone.</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

#### Key Points — shadcn/Radix

- **Ownership** **model** **fits** **teams** **wanting** **fork-level** **control**.
- **Radix** **handles** **focus** **trap**, **ARIA**—**still** **style** **responsibly**.
- **Pair** **with** **Tailwind** **for** **speed**.

---

### React Bootstrap

**Beginner Level**

**Bootstrap** **components** **as** **React** **components**—**familiar** **grid** **and** **utilities**.

**Real-time example**: **Admin** **backoffice** **with** **rapid** **CRUD** **screens**.

**Intermediate Level**

**Theming** **via** **Sass** **variables** **historically**—**check** **current** **version** **docs**.

**Expert Level**

**Less** **popular** **in** **new** **design** **systems** **vs** **headless** **approaches**, **still** **valid** **for** **legacy** **comfort**.

#### Key Points — React Bootstrap

- **Fast** **layout** **with** **Bootstrap** **grid** **mental** **model**.
- **Visual** **language** **is** **recognizably** **Bootstrap**—**brand** **fit** **matters**.
- **Accessibility** **depends** **on** **composition**—**test** **patterns**.

---

### Blueprint (Palantir)

**Beginner Level**

**Dense** **data-dense** **UI** **kit** **optimized** **for** **complex** **tools**.

**Real-time example**: **Operations** **dashboards** **with** **many** **controls** **visible** **at** **once**.

**Intermediate Level**

**Styling** **assumes** **certain** **global** **CSS** **imports**—**follow** **setup** **guide**.

**Expert Level**

**Great** **when** **users** **expect** **desktop-app-like** **density**.

#### Key Points — Blueprint

- **Not** **mobile-first** **aesthetic** **by** **default**.
- **Powerful** **for** **internal** **tools**.
- **Bundle** **size** **and** **icon** **imports** **need** **care**.

---

## 10.5 Animation Libraries

### Framer Motion

**Beginner Level**

**Declarative** **`motion.div`** **with** **`animate`**, **`initial`**, **`exit`** **props**—**great** **for** **micro-interactions**.

**Real-time example**: **E-commerce** **image** **gallery** **crossfade** **and** **product** **card** **hover** **lift**.

**Intermediate Level**

**`AnimatePresence`** **for** **mount/unmount** **transitions** **in** **lists** **and** **modals**.

**Expert Level**

**Layout** **animations** **`layoutId`** **for** **shared** **element** **transitions**—**use** **with** **performance** **caution** **on** **low** **power** **devices**.

```tsx
import { motion } from "framer-motion";

export function LikeHeart({ liked }: { liked: boolean }) {
  return (
    <motion.span
      aria-hidden
      animate={{ scale: liked ? 1.15 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      style={{ display: "inline-block" }}
    >
      {liked ? "♥" : "♡"}
    </motion.span>
  );
}
```

#### Key Points — Framer Motion

- **Excellent** **DX** **for** **interaction** **designers** **collaborating** **with** **devs**.
- **Mind** **main-thread** **cost** **on** **large** **lists**.
- **Use** **reduced** **motion** **media** **query** **respect** (see §10.6).

---

### React Spring

**Beginner Level**

**Physics-based** **springs** **for** **natural** **motion**—**great** **for** **charts** **and** **gestures**.

**Real-time example**: **Dashboard** **number** **ticker** **animates** **to** **new** **KPIs**.

**Intermediate Level**

**Hook** **API** **`useSpring`** **returns** **animated** **values** **you** **bind** **to** **styles**.

**Expert Level**

**Interruptible** **animations** **excel** **in** **data** **viz** **when** **inputs** **change** **rapidly**.

```tsx
import { animated, useSpring } from "@react-spring/web";

export function AnimatedCounter({ value }: { value: number }) {
  const props = useSpring({ number: value, from: { number: 0 } });
  return <animated.span>{props.number.to((n) => n.toFixed(0))}</animated.span>;
}
```

#### Key Points — React Spring

- **Beautiful** **continuous** **motion**.
- **Learning** **curve** **higher** **than** **Framer** **for** **simple** **cases**.
- **Combine** **with** **`ResizeObserver`** **for** **layout-aware** **springs**.

---

### React Transition Group

**Beginner Level**

**Manages** **classes** **and** **timeouts** **for** **enter/exit** **states**—**pairs** **with** **CSS** **transitions**.

**Real-time example**: **Chat** **toast** **notifications** **fade** **in/out**.

**Intermediate Level**

**Lower-level** **than** **Framer**—**you** **own** **the** **CSS**.

**Expert Level**

**Good** **when** **bundle** **size** **must** **stay** **minimal** **and** **CSS** **already** **exists**.

```tsx
import { CSSTransition } from "react-transition-group";
import { useRef } from "react";

export function Fade({ show, children }: { show: boolean; children: React.ReactNode }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  return (
    <CSSTransition nodeRef={nodeRef} in={show} timeout={200} classNames="fade" unmountOnExit>
      <div ref={nodeRef}>{children}</div>
    </CSSTransition>
  );
}
```

#### Key Points — Transition Group

- **Tiny** **conceptual** **surface** **for** **CSS** **animators**.
- **Requires** **well-scoped** **CSS** **class** **names**.
- **Remember** **`nodeRef`** **requirements** **in** **recent** **versions**.

---

### GSAP (GreenSock)

**Beginner Level**

**Industry-standard** **timeline** **animation** **for** **complex** **sequences**—**imperative** **API**.

**Real-time example**: **Marketing** **hero** **storytelling** **with** **scroll-linked** **timelines**.

**Intermediate Level**

**Use** **`useLayoutEffect` + refs** **for** **DOM** **targets**; **avoid** **animating** **React** **state** **every** **frame**.

**Expert Level**

**ScrollTrigger** **for** **sophisticated** **scrollytelling**—**coordinate** **with** **SSR** **carefully** **(disable** **or** **hydrate)**.

```tsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function HeroTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
  }, [text]);

  return (
    <h1 ref={ref} className="text-4xl font-bold">
      {text}
    </h1>
  );
}
```

#### Key Points — GSAP

- **Best** **for** **designer-driven** **complex** **motion**.
- **Keep** **React** **reconciliation** **separate** **from** **per-frame** **`setState`**.
- **Licensing** **for** **certain** **plugins**—**verify** **terms**.

---

### React Move

**Beginner Level**

**Animates** **list** **reordering** **and** **data** **changes**—**niche** **compared** **to** **Framer**/**GSAP**.

**Real-time example**: **Leaderboard** **rank** **changes** **with** **sliding** **rows**.

**Intermediate Level**

**Evaluate** **maintenance** **status** **vs** **alternatives** **before** **adopting**.

**Expert Level**

**If** **choosing**, **benchmark** **list** **size** **and** **FPS** **on** **mobile**.

#### Key Points — React Move

- **Use** **when** **specific** **layout** **list** **behaviors** **are** **required**.
- **Smaller** **community** **than** **Framer**—**assess** **risk**.
- **Profile** **performance** **early**.

---

## 10.6 Styling Best Practices

### Naming & BEM Conventions

**Beginner Level**

**Block** **`card`**, **Element** **`card__title`**, **Modifier** **`card--highlighted`** **reduces** **collisions** **in** **global** **CSS**.

**Real-time example**: **E-commerce** **product** **card** **variants** **without** **CSS** **Modules**.

**Intermediate Level**

**Even** **with** **CSS** **Modules**, **BEM-like** **names** **read** **well** **in** **DevTools**.

**Expert Level**

**Combine** **BEM** **with** **`@layer`** **to** **control** **cascade** **in** **large** **apps**.

```tsx
export function ProductCard({ title, highlighted }: { title: string; highlighted: boolean }) {
  const cls = highlighted ? "product-card product-card--highlighted" : "product-card";
  return (
    <article className={cls}>
      <h3 className="product-card__title">{title}</h3>
    </article>
  );
}
```

#### Key Points — BEM

- **Predictable** **specificity**.
- **Verbose** **class** **names**—**trade-off** **accepted** **for** **clarity**.
- **Works** **across** **teams** **without** **build** **magic**.

---

### Component-Scoped Styling Discipline

**Beginner Level**

**Keep** **styles** **near** **components**—**CSS** **Modules**/**VE**/**styled** **all** **encourage** **this**.

**Real-time example**: **Todo** **list** **row** **styles** **live** **next** **to** **`TodoRow.tsx`**.

**Intermediate Level**

**Barrel** **files** **should** **not** **hide** **style** **imports**—**explicit** **is** **better**.

**Expert Level**

**Enforce** **via** **lint** **rules** **(eslint-plugin-boundaries)** **in** **monorepos**.

#### Key Points — Scoped Discipline

- **Faster** **onboarding**—**developers** **find** **styles** **quickly**.
- **Reduces** **accidental** **cross-feature** **coupling**.
- **Pair** **with** **Storybook** **for** **visual** **review**.

---

### Responsive Design

**Beginner Level**

**Mobile-first** **media** **queries**: **base** **styles** **for** **small** **screens**, **`min-width`** **enhancements**.

**Real-time example**: **Social** **feed** **switches** **from** **single** **column** **to** **two** **columns** **on** **tablet**.

**Intermediate Level**

**Container** **queries** **style** **cards** **based** **on** **parent** **width**—**great** **for** **reusable** **widgets** **in** **dashboards**.

**Expert Level**

**Coordinate** **with** **SSR** **to** **avoid** **huge** **layout** **shifts**—**reserve** **space** **for** **media**.

```css
.feed {
  display: grid;
  gap: 12px;
}
@media (min-width: 768px) {
  .feed {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

#### Key Points — Responsive

- **Test** **real** **devices**, **not** **only** **Chrome** **resize**.
- **Touch** **targets** **≥** **44×44px** **where** **possible**.
- **Use** **`clamp()`** **for** **fluid** **typography**.

---

### Dark Mode

**Beginner Level**

**`prefers-color-scheme`** **and** **`.dark` class on `html`** **toggle** **themes**.

**Real-time example**: **Weather** **app** **night** **palette** **reduces** **eye** **strain**.

**Intermediate Level**

**Store** **preference** **in** **`localStorage`**, **respect** **system** **default** **on** **first** **visit**.

**Expert Level**

**Use** **CSS** **variables** **for** **tokens**—**swap** **once** **on** **`html`**.

```css
:root {
  --bg: #ffffff;
  --fg: #0f172a;
}
html.dark {
  --bg: #0b1220;
  --fg: #e5e7eb;
}
body {
  background: var(--bg);
  color: var(--fg);
}
```

#### Key Points — Dark Mode

- **Avoid** **pure** **black** **#000** **backgrounds**—**reduce** **halation**.
- **Check** **contrast** **for** **charts** **and** **borders**.
- **Images** **may** **need** **separate** **dark** **variants**.

---

### Accessibility in Styling

**Beginner Level**

**Visible** **focus** **rings** **`:focus-visible`**—**never** **remove** **focus** **indicators** **without** **replacement**.

**Real-time example**: **Chat** **composer** **shows** **clear** **keyboard** **focus** **for** **WCAG** **compliance**.

**Intermediate Level**

**Hit** **areas** **for** **small** **icons**—**expand** **with** **padding**, **not** **just** **larger** **visuals**.

**Expert Level**

**Respect** **`prefers-reduced-motion`**—**disable** **non-essential** **animations**.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

#### Key Points — A11y Styling

- **Contrast** **ratios** **≥** **4.5:1** **for** **body** **text** **(general** **guideline)**.
- **Focus** **management** **pairs** **with** **Radix**/**MUI** **components**.
- **Test** **with** **keyboard** **only** **and** **screen** **readers**.

---

## Key Points (Chapter Summary)

- **Choose** **styling** **approach** **based** **on** **SSR**, **performance**, **team** **skills**, **and** **brand** **needs**.
- **CSS** **Modules**/**VE**/**Tailwind** **are** **common** **defaults** **in** **2025+** **greenfield** **apps**.
- **Component** **libraries** **accelerate** **features** **but** **impose** **visual**/**bundle** **trade-offs**.
- **Animations** **must** **respect** **accessibility** **and** **device** **performance**.
- **Design** **tokens** + **consistent** **patterns** **beat** **ad-hoc** **styling** **long-term**.

---

## Best Practices (Global)

1. **Centralize** **tokens** **(colors**, **spacing**, **radii**, **typography)** **and** **document** **them**.
2. **Colocate** **styles** **with** **components**; **avoid** **mystery** **global** **rules**.
3. **Prefer** **composition** **(small** **components)** **over** **deep** **selector** **nesting**.
4. **Measure** **bundle** **size** **and** **LCP/CLS** **when** **adding** **heavy** **libraries**.
5. **Use** **`clsx`/`tailwind-merge`** **when** **combining** **utility** **classes** **dynamically**.
6. **Test** **responsive** **layouts** **and** **dark** **mode** ** systematically**.
7. **Respect** **`prefers-reduced-motion`** **and** **visible** **focus** **styles** **for** **inclusive** **UX**.

---

## Common Mistakes to Avoid

1. **Leaking** **global** **styles** **that** **break** **third-party** **widgets** **or** **modals**.
2. **Animating** **expensive** **properties** **`width`/`height`** **instead** **of** **`transform`**/**`opacity`**.
3. **Removing** **focus** **outlines** **without** **accessible** **alternatives**.
4. **Importing** **entire** **icon** **packages** **instead** **of** **tree-shaken** **paths**.
5. **Mixing** **multiple** **styling** **systems** **without** **team** **guidelines**—**inconsistent** **UX** **and** **bundle** **bloat**.
6. **Ignoring** **purge/content** **config** **in** **Tailwind**—**missing** **styles** **in** **production**.
7. **Assuming** **a** **component** **library** **is** **accessible** **without** **testing** **your** **composition**.

---

_This chapter pairs with **Conditional Rendering** (variants), **Routing** (layout shells), and **Performance** topics (lazy loading, image optimization)._
