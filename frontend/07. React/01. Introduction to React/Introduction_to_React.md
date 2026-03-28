# Introduction to React (with TypeScript)

This guide introduces **React**—a JavaScript library for building user interfaces—and how it fits into modern **TypeScript** development. You will learn what React is, how its philosophy shapes apps you build every day (from e-commerce checkouts to dashboards), and how to set up a professional development environment.

---

## 📑 Table of Contents

- [Introduction to React (with TypeScript)](#introduction-to-react-with-typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [1.1 What is React?](#11-what-is-react)
    - [History](#history)
    - [Philosophy](#philosophy)
    - [Declarative vs Imperative UI](#declarative-vs-imperative-ui)
    - [Component-Based Architecture](#component-based-architecture)
    - [Virtual DOM](#virtual-dom)
    - [React vs Other Libraries and Frameworks](#react-vs-other-libraries-and-frameworks)
  - [1.2 React Ecosystem Overview](#12-react-ecosystem-overview)
    - [Core Library](#core-library)
    - [React DOM](#react-dom)
    - [React Native](#react-native)
    - [DevTools](#devtools)
    - [Popular Libraries](#popular-libraries)
  - [1.3 Setting Up Development Environment](#13-setting-up-development-environment)
    - [Node.js](#nodejs)
    - [Create React App with TypeScript](#create-react-app-with-typescript)
    - [Vite](#vite)
    - [Next.js](#nextjs)
    - [VS Code Extensions](#vs-code-extensions)
    - [Browser DevTools](#browser-devtools)
    - [tsconfig.json](#tsconfigjson)
    - [ESLint and Prettier](#eslint-and-prettier)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices](#best-practices)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1.1 What is React?

**React** is a library for building **user interfaces** by composing **components**—reusable pieces of UI that describe what should appear on screen for a given state. React is often paired with **TypeScript** so props, state, and APIs are checked at compile time.

### History

**Beginner Level**

React was created at **Facebook (Meta)** to make large, interactive web apps easier to build. Before React, developers often manipulated the DOM with many manual steps. React gave a simpler mental model: **describe the UI**, and React updates the screen when data changes. A **real-time example**: imagine a **weather app** that shows temperature—when new data arrives, you update a variable and React refreshes what you see.

**Intermediate Level**

React was **open-sourced in 2013**. Early versions introduced a **component** model and a **virtual DOM** for efficient updates. Over time, React added **hooks** (`useState`, `useEffect`, …), **concurrent features**, and stronger integration with **TypeScript** through community types and official guidance. In a **social media feed**, history matters because patterns you learn (one-way data flow, immutable updates) scale from a single post card to thousands of virtualized items.

**Expert Level**

React’s evolution tracks **UI as a function of state**: `UI = f(state)`. Major milestones include: **Fiber** (incremental rendering), **Suspense** (async UI boundaries), **Server Components** (in frameworks like Next.js), and stricter **Strict Mode** behaviors in development. In **production e-commerce**, history informs choices like **code splitting**, **error boundaries**, and **hydration** strategies when using SSR—topics you will deepen after this introduction.

```typescript
// Conceptual: UI as a function of state (React + TypeScript mental model)
type Weather = { city: string; tempC: number };

function weatherView(w: Weather): string {
  return `${w.city}: ${w.tempC}°C`;
}

const data: Weather = { city: "Berlin", tempC: 12 };
console.log(weatherView(data)); // Mirrors the idea: state in → description out
```

#### Key Points — History

- React was built for **large, data-driven UIs** and later became a general industry standard.
- Understanding **why** it exists helps you accept constraints (immutable updates, one-way flow).
- TypeScript adds **compile-time safety** on top of React’s runtime model.

---

### Philosophy

**Beginner Level**

React’s core idea is **simplicity for the developer**: you build **small pieces** (components) and **combine** them. Think of a **todo app**: a list component, an input component, a filter component—each does one job.

**Intermediate Level**

Philosophy includes **composition over inheritance**, **explicit data flow** (props down), and **predictable updates** (state changes trigger re-renders). In a **dashboard**, charts, tables, and sidebars are composed; shared behavior is extracted via **hooks** or **render props**, not deep class hierarchies.

**Expert Level**

At scale, philosophy becomes **architecture**: **colocation** of state, **boundary** components for loading/error, **design systems** (tokens, primitives), and **performance budgets**. Production teams align React’s philosophy with **observability** (why a component rendered) and **feature flags** for safe rollout.

```tsx
// Composition: dashboard tiles as independent components
import type { ReactNode } from "react";

type TileProps = { title: string; children: ReactNode };

function DashboardTile({ title, children }: TileProps) {
  return (
    <section aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>{title}</h2>
      {children}
    </section>
  );
}

// Usage: e-commerce KPIs
export function KpiStrip() {
  return (
    <>
      <DashboardTile title="Revenue">...</DashboardTile>
      <DashboardTile title="Orders">...</DashboardTile>
    </>
  );
}
```

#### Key Points — Philosophy

- Prefer **small, composable** units with clear responsibilities.
- **Data in, events out** keeps flows traceable.
- TypeScript reinforces **explicit contracts** (`props` types).

---

### Declarative vs Imperative UI

**Beginner Level**

- **Imperative**: you say *how* to change the screen step by step (“find this button, set text to Loading…”).
- **Declarative**: you say *what* the screen should look like for each situation (“if loading, show spinner”).

**Real-time example (todo app)**: declaratively, `isDone` decides whether a checkbox appears checked; you do not manually toggle DOM attributes in five places.

**Intermediate Level**

Imperative code often **scatters** updates across event handlers; declarative UI **centralizes** the view as a function of state. This reduces bugs when requirements change—e.g., a **chat app** showing read receipts, typing indicators, and message lists: one state tree drives all branches.

**Expert Level**

Under the hood, React still performs **imperative** DOM operations—but **batched** and **diffed** for efficiency. Advanced patterns bridge paradigms: **refs** for escape hatches, **imperative handles** with `useImperativeHandle`, and **canvas/WebGL** libraries that wrap imperative APIs in declarative components.

```tsx
type Status = "idle" | "loading" | "error";

type Props = { status: Status; message?: string };

// Declarative: the UI is a pure mapping from `status`
export function ChatConnectionBanner({ status, message }: Props) {
  if (status === "loading") return <p role="status">Connecting to chat…</p>;
  if (status === "error")
    return (
      <p role="alert">
        Could not connect{message ? `: ${message}` : ""}.
      </p>
    );
  return <p>Connected</p>;
}
```

#### Key Points — Declarative vs Imperative

- **Declare outcomes**, not manual DOM steps.
- **State machines** (finite states) map cleanly to declarative UIs.
- TypeScript **union types** model UI branches precisely.

---

### Component-Based Architecture

**Beginner Level**

A **component** is a reusable UI block: header, product card, comment. A **real-time example**: an **e-commerce product page** might use `<ProductGallery />`, `<PriceTag />`, `<AddToCartButton />`.

**Intermediate Level**

Architecture scales by **nesting** and **ownership**: container components fetch data; presentational components receive typed props. In a **social media app**, `PostCard` might own layout while `LikeButton` encapsulates interaction and analytics callbacks.

**Expert Level**

Large apps introduce **module boundaries**, **lazy loading**, **route-level code splitting**, and **micro-frontends** (sometimes). Design systems expose **tokens** and **headless** primitives; TypeScript types become part of the public API (`Variant`, `Size`).

```tsx
type Money = { currency: "USD" | "EUR"; amount: number };

export type ProductCardProps = {
  title: string;
  price: Money;
  onAddToCart: (id: string) => void;
  productId: string;
};

export function ProductCard({
  title,
  price,
  onAddToCart,
  productId,
}: ProductCardProps) {
  return (
    <article>
      <h3>{title}</h3>
      <p>
        {price.currency} {price.amount.toFixed(2)}
      </p>
      <button type="button" onClick={() => onAddToCart(productId)}>
        Add to cart
      </button>
    </article>
  );
}
```

#### Key Points — Component Architecture

- **One clear responsibility** per component when possible.
- **Typed props** document contracts between teams.
- **Composition** beats inheritance for UI reuse.

---

### Virtual DOM

**Beginner Level**

The **virtual DOM** is a lightweight **in-memory description** of the UI (a tree of plain objects). When state changes, React computes a **diff** and updates only what changed—like efficiently refreshing one line item in a **shopping cart** instead of rebuilding the whole page by hand.

**Intermediate Level**

The virtual DOM enables **predictable reconciliation**: React compares the previous and next element trees. This is not magic—it has costs, so **keys** in lists and **memoization** matter. In a **dashboard** with hundreds of rows, poor list keys cause unnecessary work.

**Expert Level**

Experts know the virtual DOM is an **implementation detail**; **React Fiber** schedules updates with priorities. Performance tuning may involve **`React.memo`**, **`useMemo`**, **`useCallback`**, **windowing** (`react-window`), or moving work off the main thread—not only “virtual DOM is fast.”

```tsx
import { useState } from "react";

type LineItem = { id: string; title: string; qty: number };

export function CartLines({ items }: { items: LineItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          aria-current={selectedId === item.id ? "true" : undefined}
        >
          <button type="button" onClick={() => setSelectedId(item.id)}>
            {item.title} × {item.qty}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

#### Key Points — Virtual DOM

- Think **trees**: UI as structured data.
- **Keys** help reconcile lists correctly.
- Profile real apps; **measure** before optimizing.

---

### React vs Other Libraries and Frameworks

**Beginner Level**

- **React** is a **library** focused on UI; you often add routing, data fetching, and structure yourself (or use a meta-framework).
- **Angular** is a **full framework** with strong opinions (DI, templates, RxJS often).
- **Vue** offers **progressive adoption** and a template DSL with excellent ergonomics.
- **Svelte** shifts work to **compile time** for smaller bundles.

**Real-time example**: a **weather app** can be built in any of them; React’s advantage is **ecosystem size** and **hiring/market familiarity**.

**Intermediate Level**

Compare dimensions: **learning curve**, **SSR story**, **state management**, **TypeScript integration**, **bundle size**, and **corporate governance**. React + **Next.js** competes with **Nuxt** (Vue) or **SvelteKit**. For **enterprise dashboards**, integration with design systems and testing tools often drives the choice.

**Expert Level**

**Production** decisions weigh **team skill**, **operational complexity**, **licensing**, **release cadence**, and **interop** (embedding React in legacy apps, web components). **React Server Components** change the comparison: UI can span server and client with explicit boundaries—different from traditional SPA-only mental models.

```typescript
// TypeScript types do not depend on the framework—portable domain models
export type Forecast = {
  city: string;
  hourly: Array<{ time: string; tempC: number; rainPct: number }>;
};

export function worstRainSlot(forecast: Forecast) {
  return forecast.hourly.reduce((best, cur) =>
    cur.rainPct > best.rainPct ? cur : best
  );
}
```

#### Key Points — React vs Others

- React is **UI-focused**; combine with tools for routing, SSR, and data.
- **Framework vs library** affects who owns architecture decisions.
- **TypeScript** domain logic is often **portable** across stacks.

---

## 1.2 React Ecosystem Overview

### Core Library

**Beginner Level**

The **`react`** package provides: **components**, **elements**, **hooks**, and APIs like `createContext`, `memo`, `lazy`, `Suspense`. You import hooks from `react` and render with `react-dom` on the web.

**Real-time example**: a **todo app** uses `useState` for items and `useEffect` to sync to `localStorage`.

**Intermediate Level**

Core APIs are **stable** and versioned semver-ish; breaking changes are rare but documented. Concurrent features may alter **timing** of effects in development (`StrictMode`). For a **chat app**, `useSyncExternalStore` can subscribe to an external store safely.

**Expert Level**

Internals: **ReactElement** types, **element factories**, **batching** of updates, **transitions** (`useTransition`), and **streaming** APIs when paired with a supporting renderer. Teams wrap core patterns in **internal libraries** (design system, data layer).

```tsx
import { useEffect, useState, useTransition } from "react";

type Todo = { id: string; text: string; done: boolean };

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const raw = localStorage.getItem("todos");
    if (raw) setTodos(JSON.parse(raw) as Todo[]);
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function markAllDone() {
    startTransition(() => {
      setTodos((prev) => prev.map((t) => ({ ...t, done: true })));
    });
  }

  return (
    <section>
      {isPending ? <p>Updating…</p> : null}
      <button type="button" onClick={markAllDone}>
        Mark all done
      </button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>
    </section>
  );
}
```

#### Key Points — Core Library

- **`react`**: components, hooks, composition primitives.
- Pair with **`react-dom`** for web rendering.
- Learn **hooks rules** early—they underpin most apps.

---

### React DOM

**Beginner Level**

**`react-dom`** connects React to the browser: `createRoot`, `hydrateRoot`, `flushSync` (escape hatch). You mount a tree into a DOM node (e.g., `#root`).

**Intermediate Level**

React DOM handles **events** (synthetic event system), **portals** (`createPortal`), and **SSR hydration**. For **e-commerce**, portals help modals and tooltips render at `document.body` while preserving React context.

**Expert Level**

Production concerns: **hydration mismatches**, **progressive enhancement**, **resource hints**, and **third-party script** integration. Profiling with **React Profiler** ties to React DOM commit phases.

```tsx
import { createRoot } from "react-dom/client";
import { App } from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("Root element not found");

createRoot(el).render(<App />);
```

#### Key Points — React DOM

- Web apps use **`react-dom/client`** (React 18+).
- **Portals** and **refs** bridge layout and modals.
- SSR apps use **`hydrateRoot`** on the client.

---

### React Native

**Beginner Level**

**React Native** brings React’s component model to **iOS and Android** using native views, not a webview (by default). One team can share **logic and types** across web and mobile.

**Real-time example**: a **social media** “post composer” might share validation and API types between web React and React Native.

**Intermediate Level**

Differences: **styling** (flexbox, no CSS cascade), **navigation** libraries, **platform modules**, and **build tooling** (Metro). TypeScript helps share **domain models** and **API clients**.

**Expert Level**

**Brownfield** apps embed RN screens into native apps; **performance** tuning involves **Hermes**, **reanimated**, and **native modules**. **Monorepos** (pnpm/turborepo) coordinate shared packages.

```typescript
// Shared domain types between web React and React Native consumers
export type UserProfile = {
  id: string;
  handle: string;
  displayName: string;
};

export function canMention(handle: string): boolean {
  return /^[a-z0-9_]{2,30}$/i.test(handle);
}
```

#### Key Points — React Native

- **Share logic/types**, not always entire components.
- Platform APIs differ—**test on devices**.
- Invest in **monorepo** hygiene when sharing code.

---

### DevTools

**Beginner Level**

**React Developer Tools** browser extension shows the **component tree**, **props**, and **state**. Essential for debugging a **todo** or **weather** UI.

**Intermediate Level**

Use **Profiler** to record commits, flame charts, and why a component rendered. In **dashboards**, find expensive subtrees before optimizing.

**Expert Level**

Integrate with **source maps**, **component stacks** for error reporting, and **testing** (React Testing Library aligns with accessible queries). For **production**, avoid leaking sensitive data in props visible to extensions on shared machines—use **environment discipline**.

```tsx
// Naming components helps DevTools (displayName for HOCs/wrappers)
export function CartSummary() {
  return <aside aria-label="Cart summary">...</aside>;
}

CartSummary.displayName = "CartSummary";
```

#### Key Points — DevTools

- Inspect **props/state/context** live.
- **Profiler** guides performance work.
- Clear **display names** aid navigation.

---

### Popular Libraries

**Beginner Level**

Common additions:

| Concern | Example library | Notes |
|--------|------------------|------|
| Routing | React Router | Declarative routes |
| Server state | TanStack Query | Caching, retries |
| Forms | React Hook Form | Performance, TS |
| Styling | CSS Modules, Tailwind | Colocate styles |
| Testing | Vitest/Jest + RTL | User-centric tests |

**Real-time example**: **e-commerce** uses TanStack Query for product fetch + cache; **chat** might use WebSockets + a small zustand store for ephemeral UI.

**Intermediate Level**

Choose libraries with **TypeScript** typings, **active maintenance**, and **bundle impact**. Avoid **duplicate** responsibilities (two form systems, two routers).

**Expert Level**

**Design systems** (MUI, Chakra, Radix primitives), **data grids** (AG Grid, TanStack Table), **i18n** (i18next), **analytics** wrappers, and **feature flag** SDKs integrate at boundaries—wrap third parties behind **your** interfaces for testability.

```typescript
// Boundary: wrap data-fetching library behind a typed port
export type ProductId = string;

export type ProductPort = {
  getById: (id: ProductId) => Promise<{ id: ProductId; title: string; price: number }>;
};

// App code depends on `ProductPort`, not the HTTP client directly
```

#### Key Points — Popular Libraries

- Prefer **focused** libraries with clear roles.
- **Abstract** third-party APIs behind your types.
- Measure **bundle** and **runtime** costs.

---

## 1.3 Setting Up Development Environment

### Node.js

**Beginner Level**

**Node.js** runs JavaScript on your machine so you can use **npm/pnpm/yarn**, bundlers, and dev servers. Install an **LTS** version for stability.

**Real-time example**: running `npm run dev` for a **weather app** starts Vite and hot reload.

**Intermediate Level**

Use **nvm**, **fnm**, or **volta** to switch versions per project. **Corepack** can manage **pnpm**. Lockfiles (`package-lock.json`, `pnpm-lock.yaml`) ensure reproducible installs—critical for **CI/CD**.

**Expert Level**

**Dockerized** dev environments, **supply-chain** auditing (`npm audit`, **Socket**, **Snyk**), and **deterministic builds** integrate with Node version pinning and **engines** field in `package.json`.

```json
{
  "engines": {
    "node": ">=20.10.0"
  },
  "packageManager": "pnpm@9.12.0"
}
```

#### Key Points — Node.js

- **LTS** for production-aligned local dev.
- **Pin versions** across the team.
- **Lockfiles** are source of truth for dependencies.

---

### Create React App with TypeScript

**Beginner Level**

**Create React App (CRA)** bootstraps a React app with minimal configuration. TypeScript template:

```bash
npx create-react-app my-app --template typescript
```

You get `src/App.tsx`, tests, and a dev server. Good for **learning** and **prototyping**.

**Intermediate Level**

CRA abstracts **Webpack**; ejecting is rarely needed. Downsides vs modern tools: slower dev server, less flexible than Vite for some setups. Many teams now prefer **Vite** or **Next.js**.

**Expert Level**

For **enterprise**, evaluate **long-term maintenance**—CRA’s role in the ecosystem has shifted. If you stay on CRA, enforce **strict TypeScript**, **linting**, and **CI** pipelines; plan migration paths.

```tsx
// CRA + TypeScript: start component
import type { FC } from "react";

export const App: FC = () => {
  return <main>Hello from CRA + TS</main>;
};
```

#### Key Points — CRA

- Fastest **onboarding** for classic SPA.
- Compare with **Vite** for DX/perf.
- Keep **TS strictness** enabled early.

---

### Vite

**Beginner Level**

**Vite** provides a **fast dev server** (native ESM) and **optimized production builds** (Rollup). Scaffold React + TS:

```bash
npm create vite@latest my-app -- --template react-ts
```

**Real-time example**: a **dashboard** with many modules benefits from instant HMR.

**Intermediate Level**

Configure **aliases**, **environment variables** (`import.meta.env`), and **proxy** for APIs. **Vitest** integrates cleanly for unit tests.

**Expert Level**

**Library mode**, **SSR plugins**, **multi-page** setups, and **module federation** (advanced) require custom Vite config. **CI** caches `node_modules` and build artifacts.

```typescript
// vite-env.d.ts for client env typing
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

#### Key Points — Vite

- Excellent **DX** for SPAs and many SSR setups via plugins.
- Use **`VITE_` prefixed** env vars for client exposure.
- Pair with **Vitest** for fast tests.

---

### Next.js

**Beginner Level**

**Next.js** is a **React framework** with **routing**, **SSR/SSG**, **API routes**, and **image optimization**. Create a TS app:

```bash
npx create-next-app@latest --ts
```

**Real-time example**: **e-commerce** product pages benefit from **SSR/ISR** for SEO and fast first paint.

**Intermediate Level**

Understand **app router** vs **pages router** (projects may use either). **Server Components** change where hooks can run—**client components** opt in with `"use client"`.

**Expert Level**

**Edge** deployments, **incremental adoption**, **middleware**, **caching** semantics, and **observability** integrate with **Vercel** or self-hosted Node. **Type-safe** linking and **metadata** APIs support large sites.

```tsx
// Server Component by default (App Router) — no useState here
type PageProps = { params: { sku: string } };

export default async function ProductPage({ params }: PageProps) {
  const data = await fetch(`https://api.example.com/products/${params.sku}`, {
    next: { revalidate: 60 },
  }).then((r) => r.json() as Promise<{ title: string; price: number }>);

  return (
    <main>
      <h1>{data.title}</h1>
      <p>{data.price}</p>
    </main>
  );
}
```

#### Key Points — Next.js

- Framework handles **routing and rendering modes**.
- Learn **server vs client components** boundaries.
- Great for **SEO** and **mixed** static/dynamic content.

---

### VS Code Extensions

**Beginner Level**

Install:

- **ESLint** — lint on save
- **Prettier** — formatting
- **ES7+ React/Redux/React-Native snippets** — optional productivity

**Intermediate Level**

Add **Tailwind CSS IntelliSense** if using Tailwind. **TypeScript** built-in: enable **strict** settings. **Path aliases** via `tsconfig` `paths` improve imports in **large dashboards**.

**Expert Level**

Team **settings.json** recommendations, **format on save**, **code actions on save**, and **workspace trust**. Optional: **Nx**/**Turbo** extensions for monorepos.

```jsonc
// .vscode/settings.json (example snippet)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

#### Key Points — VS Code

- Align **formatting** and **linting** across the team.
- **Strict TS** catches issues early.
- **Share** workspace settings for consistency.

---

### Browser DevTools

**Beginner Level**

Use **Elements** to inspect DOM, **Console** for logs/errors, **Network** for API calls. For React, add **React DevTools**.

**Intermediate Level**

**Performance** tab for main-thread bottlenecks; **Memory** for leaks in **SPAs** (detach listeners, caches). **Lighthouse** for audits—useful for **e-commerce** performance budgets.

**Expert Level**

**Source maps** to TS/JSX, **React Profiler** integration, **Web Vitals** in RUM. For **hydration** issues, compare server HTML vs client tree.

#### Key Points — Browser DevTools

- **Network + Performance** find real bottlenecks.
- **React DevTools** for component-level issues.
- Validate **accessibility** in the **Accessibility** pane.

---

### tsconfig.json

**Beginner Level**

`tsconfig.json` configures the TypeScript compiler: which files, target JS version, and strictness.

Starter strict flags:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**Intermediate Level**

**Path aliases**:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

**Expert Level**

**Project references** for monorepos, **`types`** for global ambient defs, **`verbatimModuleSyntax`** for ESM correctness, and alignment with **Bundler** resolution.

#### Key Points — tsconfig.json

- **`jsx: react-jsx`** for modern React transform.
- **`strict`** prevents large classes of bugs.
- Align compiler options with **Vite/Next** presets.

---

### ESLint and Prettier

**Beginner Level**

- **ESLint** finds problematic patterns (`react-hooks/rules-of-hooks`, `jsx-a11y` for accessibility).
- **Prettier** formats code consistently.

**Intermediate Level**

Use **`eslint-config-prettier`** to avoid rule conflicts. Type-aware linting with `@typescript-eslint/parser` catches more issues in **dashboard** codebases.

**Expert Level**

**CI** runs `eslint .` and `prettier --check`. **Husky + lint-staged** for pre-commit. **Incremental** linting in large repos; **ESLint flat config** (`eslint.config.js`) on newer setups.

```javascript
// eslint.config.js (illustrative flat config sketch)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];
```

#### Key Points — ESLint/Prettier

- **Automate** formatting; **argue less** about style.
- **Hooks rules** prevent subtle bugs.
- Run in **CI** for enforcement.

---

## Key Points (Chapter Summary)

- React is a **UI library** centered on **components** and **declarative** updates.
- **Virtual DOM + reconciliation** enable efficient updates; **keys** and **profiling** matter at scale.
- The **ecosystem** (router, data fetching, testing) completes production apps.
- **TypeScript** adds **safety** to props, state, and domain logic.
- **Tooling** (Vite/Next, ESLint, Prettier, strict `tsconfig`) shapes long-term velocity.

---

## Best Practices

1. **Start strict**: enable rigorous TypeScript and ESLint rules early—retrofitting is costly.
2. **Prefer composition**: small components with typed props and clear boundaries.
3. **Learn one meta-stack deeply**: e.g., Vite SPA or Next.js—avoid half-knowing many.
4. **Profile before optimizing**: use React Profiler and browser Performance tools.
5. **Treat dependencies as inventory**: audit, update, and remove unused packages.
6. **Document setup**: Node version, package manager, and `README` bootstrapping for onboarding.
7. **Plan accessibility and SEO** from the start—especially for **e-commerce** and **marketing** surfaces.
8. **Keep domain logic framework-agnostic** where possible—pure TypeScript modules test easily.

---

## Common Mistakes to Avoid

1. **Confusing React with a full framework** — then being surprised routing/data are extra.
2. **Disabling TypeScript strictness** to “move faster”—creating long-term maintenance debt.
3. **Omitting list keys** or using unstable keys (array index) for dynamic lists.
4. **Optimizing prematurely** without measuring—adding `memo` everywhere can hurt readability.
5. **Ignoring DevTools**—shipping slow **dashboard** interactions that Profiler would expose.
6. **Mismatched tooling versions**—React 18 APIs with outdated type packages or tutorials.
7. **Over-relying on global state** for data that could be **server-cached** (TanStack Query) or **local** (`useState`).
8. **Skipping environment discipline**—exposing secrets via `VITE_` or client bundles.

---

*End of Introduction to React (with TypeScript). Continue with JSX Fundamentals, Components, and State Management notes in this course series.*
