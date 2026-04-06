# Best Practices (React + TypeScript)

Solid conventions turn **React + TypeScript** codebases into systems that scale across **e-commerce** teams, **social** squads, **analytics dashboards**, **todo** utilities, **weather** widgets, and **real-time chat**. This chapter collects **organizational**, **component**, **state**, **performance**, **quality**, **security**, and **workflow** practices that keep shipping fast without trading away safety.

---

## 📑 Table of Contents

- [Best Practices (React + TypeScript)](#best-practices-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [22.1 Code Organization](#221-code-organization)
    - [Folder Structure](#folder-structure)
    - [Feature-based Organization](#feature-based-organization)
    - [Component Organization](#component-organization)
    - [File Naming](#file-naming)
    - [Barrel Exports](#barrel-exports)
  - [22.2 Component Best Practices](#222-component-best-practices)
    - [Single Responsibility](#single-responsibility)
    - [Component Size](#component-size)
    - [Props Naming](#props-naming)
    - [Default Props](#default-props)
    - [Prop Drilling Solutions](#prop-drilling-solutions)
    - [Composition over Inheritance](#composition-over-inheritance)
  - [22.3 State Management Best Practices](#223-state-management-best-practices)
    - [Minimize State](#minimize-state)
    - [Colocate State](#colocate-state)
    - [Lift State When Needed](#lift-state-when-needed)
    - [Avoid Duplicating State](#avoid-duplicating-state)
    - [Normalization](#normalization)
  - [22.4 Performance Best Practices](#224-performance-best-practices)
    - [Avoid Inline Functions](#avoid-inline-functions)
    - [Anonymous Functions in JSX](#anonymous-functions-in-jsx)
    - [Production Build](#production-build)
    - [Lazy Load](#lazy-load)
    - [Optimize Images](#optimize-images)
    - [Code Splitting Strategy](#code-splitting-strategy)
  - [22.5 Code Quality](#225-code-quality)
    - [ESLint Config](#eslint-config)
    - [Prettier Config](#prettier-config)
    - [TypeScript Strict Mode](#typescript-strict-mode)
    - [Code Reviews](#code-reviews)
    - [Git Commit Conventions](#git-commit-conventions)
  - [22.6 Security Best Practices](#226-security-best-practices)
    - [Sanitize Input](#sanitize-input)
    - [Avoid dangerouslySetInnerHTML](#avoid-dangerouslysetinnerhtml)
    - [XSS Prevention](#xss-prevention)
    - [CSRF](#csrf)
    - [Secure Auth](#secure-auth)
    - [Env Vars Security](#env-vars-security)
  - [22.7 Development Workflow](#227-development-workflow)
    - [Git Workflow](#git-workflow)
    - [Branch Strategy](#branch-strategy)
    - [Code Documentation](#code-documentation)
    - [Storybook](#storybook)
    - [Design System Integration](#design-system-integration)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 22.1 Code Organization

### Folder Structure

**Beginner Level**

Start with **`src/components`**, **`src/pages`**, **`src/hooks`**, **`src/utils`**, **`src/types`**. Keeps **todo** and **weather** demos navigable. Avoid dumping everything in **`components/`** without subfolders once you pass ~20 files.

**Real-time example**: A **shopping** app uses **`pages/Checkout`**, **`components/cart`**, **`api/orders`** so new hires find code quickly.

**Intermediate Level**

Add **`src/app`** (shell), **`src/features`** when domains emerge. **Colocate tests** **`Component.test.tsx`** next to components or under **`__tests__`**. **Absolute imports** via **`tsconfig`** `paths`: `@/components/...`.

**Expert Level**

**Monorepos** (`apps/web`, `packages/ui`) isolate **design system** from **product**. **Barrel files** per package with explicit public API. **ESLint boundaries** (`eslint-plugin-boundaries`) enforce layer rules (UI cannot import from `server`).

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

#### Key Points — Folder Structure

- Grow structure with **team size** and **domain complexity**, not upfront.
- **One** obvious home for each file—avoid ambiguous `misc` folders.
- **Tests** near code increase update likelihood.

---

### Feature-based Organization

**Beginner Level**

Group by **feature**: `features/cart`, `features/catalog`, `features/auth`. Each holds components, hooks, and API glue for that slice. A **social** **feed** feature owns **`PostCard`**, **`useFeed`**, **`feedApi`**.

**Intermediate Level**

**Public API** per feature via **`index.ts`** exporting only what other features need. **Cross-feature imports** go through **stable** contracts, not deep paths.

**Expert Level**

**Vertical slice** architecture: features align with **DDD** bounded contexts. **Lazy routes** map 1:1 to feature entry. **Micro-frontends** may expose features as **federated** remotes.

```text
src/features/cart/
  components/CartDrawer.tsx
  hooks/useCart.ts
  api/cartClient.ts
  index.ts   # public exports
```

#### Key Points — Feature-based Organization

- Reduces merge conflicts vs giant shared folders.
- Requires **discipline** on cross-feature dependencies—lint rules help.

---

### Component Organization

**Beginner Level**

**Presentational** vs **container** split (optional pattern): dumb UI in **`ProductImage`**, data in **`ProductContainer`**. For small apps, a single **`ProductCard`** file is fine.

**Intermediate Level**

**Compound components** for flexible APIs: **`Tabs`**, **`Tabs.List`**, **`Tabs.Panel`**. Co-locate **styles** (`ProductCard.module.css` or **`styled`** file).

**Expert Level**

**Server Components** (Next.js) vs **Client Components**—split files or `'use client'` boundaries deliberately. **Storybook** stories live beside components.

```tsx
// Compound-style API for a dashboard filter bar
export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="filter-bar">{children}</div>;
}
FilterBar.Group = function Group(props: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3>{props.title}</h3>
      {props.children}
    </section>
  );
};
```

#### Key Points — Component Organization

- Prefer **composition** over deep prop trees.
- **Name** files after default export component (`UserAvatar.tsx`).

---

### File Naming

**Beginner Level**

Use **`PascalCase.tsx`** for components, **`camelCase.ts`** for hooks/utilities. **`useCart.ts`** for hooks. Consistency beats personal taste.

**Real-time example**: **`CheckoutSummary.tsx`** is instantly recognizable in an **e-commerce** repo.

**Intermediate Level**

**Suffixes**: **`*.test.tsx`**, **`*.stories.tsx`**. **Route files** in Next may be **`page.tsx`**, **`layout.tsx`**—follow framework conventions.

**Expert Level**

**Codemods** and **ESLint** `filename-rules` enforce patterns. **Case-sensitive** Linux CI catches **`import './Button'`** vs **`button.tsx`** mistakes macOS hides.

#### Key Points — File Naming

- **Match** component name to file name for searchability.
- **Avoid** generic names like **`utils2.ts`**.

---

### Barrel Exports

**Beginner Level**

**`index.ts`** re-exports modules so consumers write **`import { Button } from '@/ui'`** instead of long paths.

**Intermediate Level**

**Barrels** can harm **tree-shaking** if they eagerly re-export huge graphs. Prefer **named exports**; avoid **`export *`** storms in performance-critical packages.

**Expert Level**

**Subpath exports** in **`package.json`** for libraries: **`@acme/ui/button`**. **Vite/Webpack** `sideEffects: false` in **`package.json`** when safe.

```typescript
// packages/ui/src/index.ts
export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";
// Avoid: export * from "./components/*" in hot paths without measuring
```

#### Key Points — Barrel Exports

- Great DX; watch **bundle** impact for **library** authors.
- **Explicit** exports document public API.

---

## 22.2 Component Best Practices

### Single Responsibility

**Beginner Level**

Each component should do **one job**: render a **price**, collect **shipping** info, show **error** text. Mixing **cart** math + **address** validation in one 400-line component hurts testing.

**Real-time example**: Split **`CheckoutForm`** into **`ShippingFields`**, **`PaymentFields`**, **`OrderSummary`**.

**Intermediate Level**

**Hooks** extract responsibility without class inheritance: **`useShippingQuote`**, **`usePromoCode`**.

**Expert Level**

**Domain services** (pure TS modules) hold business rules; components orchestrate UI. Enables **unit tests** without React.

```tsx
type Money = { currency: "USD" | "EUR"; amount: number };

export function formatMoney(m: Money): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: m.currency }).format(m.amount);
}

export function PriceTag({ value }: { value: Money }) {
  return <span className="price">{formatMoney(value)}</span>;
}
```

#### Key Points — Single Responsibility

- **Refactor** when PRs repeatedly touch the same giant file.
- **Extract** when JSX branches multiply for unrelated concerns.

---

### Component Size

**Beginner Level**

Aim for **< ~150 lines** per component file as a soft cap. Long files signal missing extraction. **Todo** list item rows stay tiny.

**Intermediate Level**

**Complexity** metrics: cyclomatic complexity ESLint rules. **Early return** patterns reduce nesting.

**Expert Level**

**Code review** checklist: “Could this be 3 components?” **Storybook** forces usable boundaries.

#### Key Points — Component Size

- **Size** is a signal, not law—data tables can be legitimately longer if uniform.
- **Split** by **render phases** (loading / error / success).

---

### Props Naming

**Beginner Level**

Use **`onX`** for callbacks (`onSubmit`, `onAddToCart`). Booleans: **`isOpen`**, **`hasError`**, **`disabled`**. Avoid **`flag`** ambiguity.

**Intermediate Level**

**Discriminated unions** for variants: `variant: 'primary' | 'ghost'`. **`children`** reserved for composition.

**Expert Level**

**Consistent ordering**: **DOM** props spread last. **`...rest`** typed with **`ComponentProps<'button'>`** for polymorphic wrappers.

```tsx
import type { ComponentPropsWithoutRef } from "react";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  icon: React.ReactNode;
  isLoading?: boolean;
};

export function IconButton({ icon, isLoading = false, children, ...rest }: IconButtonProps) {
  return (
    <button type="button" {...rest} disabled={isLoading || rest.disabled}>
      {isLoading ? <Spinner /> : icon}
      {children}
    </button>
  );
}
```

#### Key Points — Props Naming

- **Match** DOM expectations (`aria-*`, `role`).
- **Document** non-obvious props in **TS** + short JSDoc when needed.

---

### Default Props

**Beginner Level**

Use **default parameters** in function components: `function Panel({ padded = true })`. Avoid **`defaultProps`** on function components (legacy pattern).

**Intermediate Level**

**`defaultProps`** still relevant for **class components**; for FCs, **parameter defaults** + **`satisfies`** optional props types.

**Expert Level**

**Required** vs **optional** props explicit in types; **`default`** values mirror **design system** tokens.

```tsx
type BadgeProps = {
  tone?: "neutral" | "success" | "danger";
  label: string;
};

export function Badge({ tone = "neutral", label }: BadgeProps) {
  return <span data-tone={tone}>{label}</span>;
}
```

#### Key Points — Default Props

- Defaults belong **next to** destructuring for readability.
- **Avoid** duplicating defaults in multiple wrappers—centralize.

---

### Prop Drilling Solutions

**Beginner Level**

**Prop drilling** passes callbacks through many layers. Fine for **2–3** levels; painful at **6+**. **Dashboard** sidebars drilling **`user`** everywhere is a smell.

**Intermediate Level**

**Context** for mid-scope sharing (`Theme`, `CurrentUser`). **Composition**: pass **`children`** instead of props through intermediate wrappers.

**Expert Level**

**Zustand/Jotai/Redux** for app-wide client state; **React Query** for server cache. **Router loaders** (Remix/Next) inject data at route boundaries.

```tsx
import { createContext, useContext, useMemo } from "react";

type User = { id: string; name: string; role: "admin" | "user" };
const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }: { user: User; children: React.ReactNode }) {
  const value = useMemo(() => user, [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): User {
  const u = useContext(UserContext);
  if (!u) throw new Error("UserProvider missing");
  return u;
}
```

#### Key Points — Prop Drilling Solutions

- **Prefer** composition + context before global stores.
- **Don’t** put **high-churn** objects in context without **memoization**.

---

### Composition over Inheritance

**Beginner Level**

React favors **composition** (`children`, render props) over **class inheritance**. Don’t subclass **`React.Component`** to reuse UI—wrap components.

**Intermediate Level**

**Higher-Order Components (HOC)** exist but **hooks** replaced most use cases. **`withAuth`** → **`useAuth`**.

**Expert Level**

**Slot patterns** via **`ReactNode`** props: **`header`**, **`footer`** for **e-commerce** **layout** without inheritance chains.

```tsx
type PageShellProps = {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

export function PageShell({ header, sidebar, children }: PageShellProps) {
  return (
    <div className="layout">
      <header>{header}</header>
      <div className="body">
        {sidebar ? <aside>{sidebar}</aside> : null}
        <main>{children}</main>
      </div>
    </div>
  );
}
```

#### Key Points — Composition over Inheritance

- **Reuse** behavior via **hooks** and **small components**.
- **Inheritance** in TS types (`extends`) is fine; **React** trees prefer composition.

---

## 22.3 State Management Best Practices

### Minimize State

**Beginner Level**

Store only what **must** change over time. Derive **`fullName`** from **`first`** + **`last`** instead of storing all three unless **`fullName`** is edited independently.

**Real-time example**: **Cart** **subtotal** = derive from **items**, don’t duplicate unless perf-measured denormalization needed.

**Intermediate Level**

**URL** as state for **shareable** **filters** on a **social** feed: **`?tag=react`**.

**Expert Level**

**Single source of truth** per entity; **selectors** memoized with **`useMemo`** or **Reselect**.

```tsx
import { useMemo, useState } from "react";

type LineItem = { sku: string; qty: number; unitPrice: number };

export function CartTotals({ items }: { items: LineItem[] }) {
  const subtotal = useMemo(
    () => items.reduce((sum, li) => sum + li.qty * li.unitPrice, 0),
    [items],
  );
  return <output aria-live="polite">${subtotal.toFixed(2)}</output>;
}
```

#### Key Points — Minimize State

- **Fewer** `setState` calls → fewer sync bugs.
- **Prefer** **derived values** in render when cheap.

---

### Colocate State

**Beginner Level**

Keep state **as close** as possible to where it’s used. **Modal open** boolean lives in **`Modal`** or its parent, not global store.

**Intermediate Level**

**Lift** only when siblings need it. **Weather** **city** search input state stays in **`CitySearch`** until **`ForecastPanel`** also needs it.

**Expert Level**

**Micro-stores** (Zustand slices) per feature vs one giant reducer—easier deletion and testing.

#### Key Points — Colocate State

- **Reduces** unnecessary re-renders at app root.
- **Easier** reasoning in code review.

---

### Lift State When Needed

**Beginner Level**

When two siblings must stay in sync (**selected tab** + **tab panel**), lift state to **common parent** and pass **value** + **onChange** down.

**Intermediate Level**

**Controlled vs uncontrolled** inputs: controlled for instant validation in **checkout** forms.

**Expert Level**

**URL/router** lifts navigation state; **forms** may use **React Hook Form** uncontrolled performance with **controlled** error display.

```tsx
import { useState } from "react";

export function Tabs({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div role="tablist">
        {labels.map((label, i) => (
          <button key={label} role="tab" aria-selected={active === i} type="button" onClick={() => setActive(i)}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{/* render panel for active */}</div>
    </div>
  );
}
```

#### Key Points — Lift State When Needed

- **Don’t** lift prematurely—wait for **actual** sharing requirement.
- **Consider** **composition** to avoid prop drilling explosion.

---

### Avoid Duplicating State

**Beginner Level**

Don’t store **`items`** and also **`itemCount`** unless **`count`** is expensive—derive **`count`** from **`items.length`**.

**Intermediate Level**

**Two sources of truth** for **likes** count in **social** app: optimistic UI + server—reconcile with **ids** and **timestamps**.

**Expert Level**

**NormalForm** in **Redux** with **entity adapters**; single record per **`id`**.

#### Key Points — Avoid Duplicating State

- **Sync** bugs appear at duplicated state boundaries.
- **Exception**: **denormalized caches** for perf—**invalidate** carefully.

---

### Normalization

**Beginner Level**

Store entities by **`id`** in a **`Record<string, User>`** map instead of nested duplicates. **Chat** messages reference **`userId`**, not full **`user`** objects everywhere.

**Intermediate Level**

**Relational** shape mirrors databases: **`users`**, **`messages`**, **`byId`**, **`allIds`**.

**Expert Level**

**Redux Toolkit** **`createEntityAdapter`**; **TanStack Query** normalized caches optional—often **flatten** in **`select`** functions.

```typescript
export type UserId = string;

export type User = { id: UserId; handle: string; avatarUrl: string };

export type UserState = {
  byId: Record<UserId, User>;
  allIds: UserId[];
};

export function selectUser(state: UserState, id: UserId): User | undefined {
  return state.byId[id];
}
```

#### Key Points — Normalization

- **Essential** for large **social** graphs and **e-commerce** catalogs.
- **Tradeoff**: more boilerplate—use **helpers**/**libraries**.

---

## 22.4 Performance Best Practices

### Avoid Inline Functions

**Beginner Level**

**Inline arrow functions** in **`onClick={() => ...}`** create new function identities each render. Often **fine**; problematic inside **`memo`**’d children receiving function props.

**Real-time example**: **`ProductRow`** wrapped in **`memo`** re-renders if parent passes **new** **`onAdd`** each time.

**Intermediate Level**

**`useCallback`** stabilizes handlers when dependencies stable: **`useCallback(() => add(sku), [sku, add])`**.

**Expert Level**

**Don’t blanket-`useCallback`** everything—measure. **Virtualized lists** need stable **`itemKey`** + handlers.

```tsx
import { memo, useCallback } from "react";

type RowProps = { sku: string; onAdd: (sku: string) => void };

const ProductRow = memo(function ProductRow({ sku, onAdd }: RowProps) {
  const handleAdd = useCallback(() => onAdd(sku), [onAdd, sku]);
  return (
    <button type="button" onClick={handleAdd}>
      Add {sku}
    </button>
  );
});
```

#### Key Points — Avoid Inline Functions

- **Optimize** hot paths (lists, charts), not every button.
- **`memo`** + **unstable** callbacks = wasted **`memo`**.

---

### Anonymous Functions in JSX

**Beginner Level**

**`.map(item => <Row ... />)`** is normal. The **anonymous** function in **`map`** is not the same issue as **event handlers** unless **`memo`**’d **`Row`** receives inline lambdas as props.

**Intermediate Level**

**Extract** **`renderItem`** or use **`useCallback`** per row when virtualizing.

**Expert Level**

**React Compiler** (future/experimental) auto-memoizes—patterns may shift; still write clear code first.

#### Key Points — Anonymous Functions in JSX

- **Distinguish** list **`map`** callbacks vs **`memo`** pitfalls.
- **Readability** first; **profile** second.

---

### Production Build

**Beginner Level**

**Production** bundles minify, strip **`console`**, enable tree shaking. **Always** test **`npm run build`** locally before release.

**Intermediate Level**

**Analyze** bundles; **drop** dev-only libraries behind **`import.meta.env.DEV`** checks.

**Expert Level**

**Feature flags** server-driven to avoid dead code in client for **A/B** experiments.

```tsx
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.debug("Cart snapshot", cart);
}
```

#### Key Points — Production Build

- **CI** should run **production** build, not only **`dev`** server tests.
- **Measure** gzip/brotli sizes.

---

### Lazy Load

**Beginner Level**

**`React.lazy` + `Suspense`** defer route JS. **Admin** **dashboard** loads only for staff.

**Intermediate Level**

**Prefetch** on hover (`router.prefetch`) for **e-commerce** **PDP** transitions.

**Expert Level**

**IntersectionObserver** for **below-fold** **recommendations** carousel chunks.

```tsx
import { lazy, Suspense } from "react";

const Analytics = lazy(() => import("./pages/Analytics"));

export function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading analytics…</div>}>
      <Analytics />
    </Suspense>
  );
}
```

#### Key Points — Lazy Load

- Provide **accessible** fallbacks (skeletons).
- **Handle** **errors** with **ErrorBoundary** around lazy trees.

---

### Optimize Images

**Beginner Level**

**Resize** assets to displayed size; use **`srcSet`**; prefer **CDN** optimization. **Hero** images dominate **LCP**.

**Intermediate Level**

**Lazy** load offscreen images **`loading="lazy"`**. **Decode** async.

**Expert Level**

**Blurhash**/**LQIP** placeholders for **social** image grids.

```tsx
type AvatarProps = { name: string; src: string; size: number };

export function Avatar({ name, src, size }: AvatarProps) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ borderRadius: "50%" }}
    />
  );
}
```

#### Key Points — Optimize Images

- **Never** forget **`width`/`height`** to reduce CLS.
- **Compress** uploads server-side for **UGC** in **social** apps.

---

### Code Splitting Strategy

**Beginner Level**

Split by **route** first. Then **heavy** components (**charts**, **maps**).

**Intermediate Level**

**Vendor splitting** via bundler config; **avoid** tiny over-split chunks (HTTP overhead).

**Expert Level**

**Preload** critical route chunks after idle (`requestIdleCallback`). **Analyze** **RUM** for **slow** navigations.

#### Key Points — Code Splitting Strategy

- **Balance** chunk count vs **caching** granularity.
- **Monitor** **failed** dynamic imports (network flakiness).

---

## 22.5 Code Quality

### ESLint Config

**Beginner Level**

Use **`eslint-plugin-react`**, **`eslint-plugin-react-hooks`**, **`@typescript-eslint`**. Catch **missing hook deps**, **`key`**, **`no-array-index-key`**.

**Real-time example**: Block **`useEffect`** without deps when reading **chat** **WebSocket** subscription incorrectly.

**Intermediate Level**

**Flat config** (`eslint.config.js`) with **typescript-eslint** `recommendedTypeChecked` for typed rules.

**Expert Level**

**Import resolver** + **`eslint-plugin-import`** for **barrel** cycles; **`eslint-plugin-jsx-a11y`** for accessibility.

```typescript
// eslint.config.ts (excerpt)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  { plugins: { "react-hooks": reactHooks }, rules: { ...reactHooks.configs.recommended.rules } },
);
```

#### Key Points — ESLint Config

- **CI** fails on **lint**—no “warn-only” drift.
- **Type-aware** rules need **`parserOptions.project`**.

---

### Prettier Config

**Beginner Level**

**Prettier** formats code consistently. **No** debates on semicolons in PRs. **`formatOnSave`** in editor.

**Intermediate Level**

**`.prettierrc`**: **`printWidth`**, **`singleQuote`**, **`trailingComma`**. **`eslint-config-prettier`** disables conflicting rules.

**Expert Level**

**CI** `prettier --check`. **Lint-staged** formats on commit.

```json
{
  "printWidth": 100,
  "singleQuote": false,
  "trailingComma": "all"
}
```

#### Key Points — Prettier Config

- **One formatter**—avoid competing ESLint style rules.
- **Ignore** generated files via **`.prettierignore`**.

---

### TypeScript Strict Mode

**Beginner Level**

Enable **`"strict": true`** in **`tsconfig.json`**. Catches **`null`**, implicit **`any`**, **`this`** issues.

**Intermediate Level**

Add **`noUncheckedIndexedAccess`**, **`exactOptionalPropertyTypes`** gradually.

**Expert Level**

**Project references** for monorepos; **`tsc --build`** incremental.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

#### Key Points — TypeScript Strict Mode

- **Strict** early cheaper than **big-bang** migration later.
- **Types** for API boundaries with **`zod`** **parsing**.

---

### Code Reviews

**Beginner Level**

PRs check **correctness**, **tests**, **a11y**, **security**. Use **checklists** for **auth** changes.

**Intermediate Level**

**Small PRs** (<400 LOC) for meaningful review. **Screenshots** for UI.

**Expert Level**

**RFCs** for architecture; **pair review** for **critical** **payments** code.

#### Key Points — Code Reviews

- **Kind**, **specific** comments; **suggest** patches.
- **Rotate** reviewers to spread knowledge.

---

### Git Commit Conventions

**Beginner Level**

**Conventional Commits**: **`feat:`**, **`fix:`**, **`chore:`**, **`docs:`**. Enables **changelog** generation.

**Intermediate Level**

**Scopes**: **`feat(cart): add promo field`**.

**Expert Level**

**Semantic release** + **commitlint** in CI.

```text
feat(chat): add optimistic message send

BREAKING CHANGE: remove legacy websocket endpoint
```

#### Key Points — Git Commit Conventions

- **Imperative** mood, **50** char subject lines (soft guideline).
- **Link** **issue** tickets.

---

## 22.6 Security Best Practices

### Sanitize Input

**Beginner Level**

Treat **all** user input as **untrusted**. **Trim** strings, **validate** formats, **reject** unexpected fields server-side.

**Real-time example**: **E-commerce** **review** text stored escaped; **profanity** filter optional business rule.

**Intermediate Level**

**`zod`** schemas at API boundary: **`z.string().max(500)`**.

**Expert Level**

**CSP** + **sanitization** for rich text; **never** trust client-only checks.

```typescript
import { z } from "zod";

export const ReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000),
});

export type ReviewBody = z.infer<typeof ReviewBodySchema>;
```

#### Key Points — Sanitize Input

- **Server** validation is authoritative.
- **Log** **validation** failures without storing **PII** raw.

---

### Avoid dangerouslySetInnerHTML

**Beginner Level**

**`dangerouslySetInnerHTML`** bypasses React escaping—**XSS** risk. Avoid unless sanitized HTML from **trusted** pipeline.

**Intermediate Level**

Use **`DOMPurify`** on **client** if you must render HTML; **sanitize** on **server** too.

**Expert Level**

**Markdown** → **React** via **`react-markdown`** with **allowed** elements list.

```tsx
import DOMPurify from "dompurify";

type SafeHtmlProps = { html: string };

export function SafeHtml({ html }: SafeHtmlProps) {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

#### Key Points — dangerouslySetInnerHTML

- **Default** stance: **don’t**.
- **Policy**: which tags/attrs allowed—**centralize**.

---

### XSS Prevention

**Beginner Level**

React **escapes** text by default. **XSS** enters via **`dangerouslySetInnerHTML`**, **`javascript:`** URLs, **`eval`**.

**Intermediate Level**

**CSP** headers: **`script-src 'self'`**, **`object-src 'none'`**.

**Expert Level**

**Trusted Types** in supporting browsers; **nonce**-based CSP for inline needs.

#### Key Points — XSS Prevention

- **URL** sanitization for **`href`** with user content.
- **Third-party** scripts** review (tags managers).

---

### CSRF

**Beginner Level**

**Cross-Site Request Forgery** tricks browsers into **state-changing** requests with cookies. **Mitigate** with **CSRF tokens** or **SameSite** cookies.

**Intermediate Level**

**SPA** + **API** on same site: **`SameSite=Lax/Strict`**. **Double-submit** cookie pattern for APIs.

**Expert Level**

**OAuth** **PKCE** for public clients; **CORS** **never** replaces **CSRF** protection for **cookie** auth.

#### Key Points — CSRF

- **State-changing** endpoints: **non-GET**, **authenticated**.
- **Framework** middleware often handles tokens—**don’t** roll your own poorly.

---

### Secure Auth

**Beginner Level**

**Don’t** store **raw tokens** in **`localStorage`** if XSS can steal them—**HttpOnly** **Secure** cookies preferred for **session** tokens when possible.

**Intermediate Level**

**Short-lived** access tokens + **refresh** rotation. **Logout** clears server session.

**Expert Level**

**OIDC** libraries, **PKCE**, **mTLS** for high-security **dashboard** **admin**.

```typescript
// types only — actual cookie setting is server-side
export type SessionCookieFlags = {
  httpOnly: true;
  secure: true;
  sameSite: "lax" | "strict";
  path: "/";
};
```

#### Key Points — Secure Auth

- **MFA** for sensitive accounts.
- **Rate limit** login endpoints.

---

### Env Vars Security

**Beginner Level**

**Client-exposed** env (`VITE_*`, `NEXT_PUBLIC_*`) is **public**. **Never** put **database passwords** there.

**Intermediate Level**

**Server-only** secrets in **deployment** platform vaults. **Rotate** on leaks.

**Expert Level**

**SOPS**, **Vault**, **cloud KMS** for **multi-env** **e-commerce** ops.

#### Key Points — Env Vars Security

- **Principle of least privilege** for CI secrets.
- **Audit** **`.env`** commits with **secret scanning**.

---

## 22.7 Development Workflow

### Git Workflow

**Beginner Level**

**Feature branches** off **`main`**, PR merge via **squash** or **merge** per team policy. **`git pull --rebase`** to linear history.

**Intermediate Level**

**Trunk-based** with **short-lived** branches + **feature flags** for large work.

**Expert Level**

**GitHub** **merge queue** for high velocity **monorepos**.

#### Key Points — Git Workflow

- **Protect** **`main`** with required CI.
- **Release** branches if **scheduled** shipping.

---

### Branch Strategy

**Beginner Level**

**`main`**, **`develop`** (optional), **`feature/*`**, **`fix/*`**. Tags for releases **`v1.2.0`**.

**Intermediate Level**

**GitFlow** vs **GitHub Flow**—pick one document.

**Expert Level**

**Environment branches** (`staging`) sometimes—prefer **artifact** promotion instead.

#### Key Points — Branch Strategy

- **Align** with **CD** pipeline (what deploys where).
- **Delete** merged branches automatically.

---

### Code Documentation

**Beginner Level**

**README** per app: **setup**, **scripts**, **env**. **TSDoc** on **non-obvious** exported functions.

**Intermediate Level**

**Architecture Decision Records (ADRs)** for big choices (**Redux** vs **Query**).

**Expert Level**

**Storybook** docs mode + **MDX** for **design system** consumers.

```typescript
/**
 * Computes discounted price for display-only; server recomputes for checkout.
 * @param base - pre-tax catalog price in minor units
 */
export function previewDiscountedMinor(base: number, bps: number): number {
  return Math.round((base * (10_000 - bps)) / 10_000);
}
```

#### Key Points — Code Documentation

- **Why** > **what** in comments.
- **Keep** docs near code—avoid stale wikis.

---

### Storybook

**Beginner Level**

**Storybook** renders components in isolation—great for **design QA** and **visual** testing.

**Intermediate Level**

**Controls** and **actions** for props. **A11y** addon.

**Expert Level**

**Chromatic** visual regression on **`main`**.

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = { component: Button };
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: "Continue", variant: "primary" } };
```

#### Key Points — Storybook

- Stories are **living documentation**.
- **Mirror** production **wrappers** (theme, i18n) via **decorators**.

---

### Design System Integration

**Beginner Level**

Consume **`@acme/ui`** package with **tokens** (**colors**, **spacing**). **Don’t** fork **`Button`** per app—extend via props.

**Intermediate Level**

**CSS variables** or **Tailwind** preset for **theming**. **Dark mode** via **`prefers-color-scheme`** + class.

**Expert Level**

**Multi-brand** **white-label** **e-commerce**: **token** sets per tenant at runtime (careful with SSR + flash).

```tsx
import { tokens } from "@acme/ui/tokens";

export function Prose({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: tokens.font.body, color: tokens.color.text }}>{children}</div>;
}
```

#### Key Points — Design System Integration

- **Version** the system semver; communicate **breaking** changes.
- **Visual regression** tests for **core** components.

---

## Key Points (Chapter Summary)

- **Organize** by **feature** as products grow; **colocate** state and tests.
- **Composition**, **hooks**, and **context** reduce prop drilling before global stores.
- **Performance**: measure, then **`memo`/`useCallback`/split**; **images** and **routes** first levers.
- **Quality**: **strict TS**, **ESLint typed rules**, **Prettier**, **reviews**, **conventional commits**.
- **Security**: **sanitize**, avoid raw HTML, **CSRF** + **cookie** strategies, **secrets** off the client.
- **Workflow**: **Storybook**, **design tokens**, **trunk** + **CI** discipline.

---

## Best Practices (Global)

1. **Write** **types** at **system boundaries** (API, storage) with **runtime validation**.
2. **Automate** **format/lint/typecheck/test** in CI on every PR.
3. **Document** **architecture** decisions affecting multiple features.
4. **Use** **feature flags** to integrate long-running work without huge branches.
5. **Monitor** **bundle size** and **Web Vitals** as **release gates** for major UI changes.
6. **Security** review for **auth**, **payments**, **HTML** rendering, **OAuth** callbacks.
7. **Onboard** new devs with **guided** **first PR** touching **Storybook** + **tests**.

---

## Common Mistakes to Avoid

| Mistake | Why it hurts | Better approach |
|--------|----------------|-----------------|
| **Global** state for **local** UI | Broad re-renders, coupling | **Colocate**; **URL** state |
| **Over-`useCallback`** without profiling | Noise, stale deps bugs | Measure **React Profiler** first |
| **`export *`** barrels in libraries | Tree-shaking pain | **Named** exports / **package exports** |
| **`any`** escape hatches everywhere | Types become theater | **`unknown`** + **narrowing** |
| **Skipping** a11y in **Storybook** | Shipping **keyboard** traps | **eslint-plugin-jsx-a11y** + tests |
| **Storing** **tokens** in **localStorage** casually | XSS exfiltration | **HttpOnly** cookies + **mitigations** |
| **Huge** PRs | Review misses | Split features + **flags** |
| **Undocumented** **env** requirements | Broken local/staging setups | **`.env.example`** + README |

---

*End of Best Practices chapter.*
