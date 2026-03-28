# Common Patterns and Anti-Patterns (React + TypeScript)

Even experienced teams ship bugs when **state**, **effects**, and **async** combine. This chapter maps **pitfalls** to **fixes**, **debugging** workflows, **migration** paths, **refactoring** moves, and **recipes** (debounce, infinite scroll, modals) using **e-commerce**, **social**, **dashboard**, **todo**, **weather**, and **chat** scenarios—all with **TypeScript**-first examples.

---

## 📑 Table of Contents

- [Common Patterns and Anti-Patterns (React + TypeScript)](#common-patterns-and-anti-patterns-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [23.1 Common Pitfalls](#231-common-pitfalls)
    - [Mutating State](#mutating-state)
    - [Missing Keys](#missing-keys)
    - [Index as Key](#index-as-key)
    - [Overusing useEffect](#overusing-useeffect)
    - [Props Drilling](#props-drilling)
    - [Unnecessary Re-renders](#unnecessary-re-renders)
    - [Memory Leaks](#memory-leaks)
    - [Stale Closures](#stale-closures)
  - [23.2 Debugging Techniques](#232-debugging-techniques)
    - [React DevTools](#react-devtools)
    - [Console Logging](#console-logging)
    - [Debugger Statement](#debugger-statement)
    - [Error Boundaries](#error-boundaries)
    - [Source Maps](#source-maps)
    - [Network Tab](#network-tab)
  - [23.3 Problem-Solving Patterns](#233-problem-solving-patterns)
    - [Infinite Loop Solutions](#infinite-loop-solutions)
    - [Race Condition Fixes](#race-condition-fixes)
    - [Memory Leak Prevention](#memory-leak-prevention)
    - [State Update Batching](#state-update-batching)
    - [Effect Cleanup](#effect-cleanup)
  - [23.4 Migration Patterns](#234-migration-patterns)
    - [Class to Function](#class-to-function)
    - [Legacy Context to Hooks](#legacy-context-to-hooks)
    - [Redux to Modern](#redux-to-modern)
    - [Router v5 to v6](#router-v5-to-v6)
    - [CRA to Vite](#cra-to-vite)
  - [23.5 Refactoring Patterns](#235-refactoring-patterns)
    - [Extract Component](#extract-component)
    - [Extract Custom Hook](#extract-custom-hook)
    - [Combine Related State](#combine-related-state)
    - [Split Unrelated State](#split-unrelated-state)
    - [Composition Refactoring](#composition-refactoring)
  - [23.6 Common Solutions](#236-common-solutions)
    - [Debouncing Input](#debouncing-input)
    - [Throttling Events](#throttling-events)
    - [Infinite Scroll](#infinite-scroll)
    - [Modal Management](#modal-management)
    - [Toast Notifications](#toast-notifications)
    - [File Upload](#file-upload)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 23.1 Common Pitfalls

### Mutating State

**Beginner Level**

React state must be **replaced immutably**. **`items.push(x)`** mutates the array in place; **`setItems`** may not re-render. Use **`[...items, x]`** or **`items.concat(x)`**.

**Real-time example**: **Shopping cart** line items disappear from UI after add because the array reference didn’t change meaningfully or React **bailout** confused—always return **new** references when content changes.

**Intermediate Level**

**Immer** (`produce`) helps deep updates: **`draft.cart.items[sku].qty++`**.

**Expert Level**

**Normalization** updates **`byId`** immutably with **`{ ...byId, [id]: { ...entity, ...patch } }`**.

```tsx
import { useState } from "react";

type LineItem = { sku: string; qty: number };

export function CartLines({ initial }: { initial: LineItem[] }) {
  const [lines, setLines] = useState<LineItem[]>(initial);

  function increment(sku: string) {
    setLines((prev) =>
      prev.map((li) => (li.sku === sku ? { ...li, qty: li.qty + 1 } : li)),
    );
  }

  return (
    <ul>
      {lines.map((li) => (
        <li key={li.sku}>
          {li.sku} × {li.qty}{" "}
          <button type="button" onClick={() => increment(li.sku)}>
            +
          </button>
        </li>
      ))}
    </ul>
  );
}
```

#### Key Points — Mutating State

- **Never** mutate **`prev`** inside **`setState`** updater if you read-then-write composite objects without copying.
- **Use** **Immer** when immutability noise dominates.

---

### Missing Keys

**Beginner Level**

**`key`** helps React match list items across renders. **Missing keys** warn in dev and cause **state mis-association** in lists with inputs.

**Real-time example**: **Todo** list reorders; without keys, **checkbox** state jumps rows.

**Intermediate Level**

Keys must be **stable** and **unique among siblings**—not necessarily globally unique.

**Expert Level**

**Virtualized** lists map **index + offset** carefully—prefer **row ids** from server.

```tsx
type Todo = { id: string; title: string };

export function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          <label>
            <input type="checkbox" /> {t.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

#### Key Points — Missing Keys

- **Always** key **dynamic** lists.
- **Don’t** use **random** keys per render.

---

### Index as Key

**Beginner Level**

**`key={index}`** is acceptable for **static** lists that never reorder/filter. **Bad** when items **insert/delete/reorder**—identity follows index, not data.

**Real-time example**: **Social** **comment** thread with **expand/collapse** per row breaks when new comment inserts at top.

**Intermediate Level**

If no **id**, derive **`key` from content hash** or **create client ids** (`crypto.randomUUID()` once).

**Expert Level**

**Virtualization** libraries require **stable** **`id`** + **`index`** strategies documented.

```tsx
// Avoid for mutable lists:
// todos.map((t, i) => <Row key={i} ... />)

// Prefer:
// <Row key={t.id} ... />
```

#### Key Points — Index as Key

- **Rule of thumb**: if **order changes**, **index keys** are wrong.
- **MVP** static lists: index **ok** temporarily.

---

### Overusing useEffect

**Beginner Level**

**`useEffect`** is for **synchronization** with **external systems** (DOM APIs, subscriptions, network). **Not** for **deriving** state from props—compute in render or **`useMemo`**.

**Real-time example**: **Dashboard** **filters** re-fetch in **`useEffect`** on every unrelated state change due to wrong deps—split effects or move fetch to **event**/**query library**.

**Intermediate Level**

**React Query** replaces most **`useEffect` fetch** patterns with **declarative** **`useQuery`**.

**Expert Level**

**useEffectEvent** (React experimental) or **ref** patterns for **stable** subscriptions without stale closures.

```tsx
import { useMemo, useState } from "react";

type Product = { id: string; price: number };

export function Total({ items }: { items: Product[] }) {
  // Derived state — no effect needed
  const total = useMemo(() => items.reduce((s, p) => s + p.price, 0), [items]);
  const [taxRate] = useState(0.08);
  return <output>${(total * (1 + taxRate)).toFixed(2)}</output>;
}
```

#### Key Points — Overusing useEffect

- **Fetch** on interaction or with **query** libraries.
- **Derive** don’t **sync** when possible.

---

### Props Drilling

**Beginner Level**

Passing props through **intermediate** components that don’t use them is **prop drilling**. Manageable for shallow trees; painful at scale.

**Real-time example**: **E-commerce** **`User`** passed through **Header → Layout → Sidebar`** just for **avatar**.

**Intermediate Level**

**Context** or **composition** (`children`) flattens drilling.

**Expert Level**

**Colocated routers** + **data loaders** fetch at boundary—less context needs.

#### Key Points — Props Drilling

- **Composition** first; **context** second; **global store** last.
- **Refactor** when **3+** layers ignore a prop.

---

### Unnecessary Re-renders

**Beginner Level**

Components re-render when **parent** renders unless **memoized**. Often **fine**—optimize hot paths (**lists**, **charts**).

**Intermediate Level**

**`React.memo`**, **`useMemo`**, **`useCallback`** after measuring **Profiler**.

**Expert Level**

**Context splitting** (separate **`ThemeProvider`** vs **`UserProvider`**) avoids broad consumers re-rendering.

```tsx
import { memo } from "react";

type RowProps = { sku: string; title: string };

export const ProductRow = memo(function ProductRow({ sku, title }: RowProps) {
  return (
    <tr>
      <td>{sku}</td>
      <td>{title}</td>
    </tr>
  );
});
```

#### Key Points — Unnecessary Re-renders

- **Profile** before **memo** spam.
- **Context** **value** objects **recreate** each render—**split** or **`useMemo`** the value.

---

### Memory Leaks

**Beginner Level**

Subscriptions/timers **without cleanup** keep references after unmount—**leaks**. Always return cleanup from **`useEffect`**.

**Real-time example**: **Chat** **WebSocket** listener still fires after navigating away, updating unmounted component state → warning.

**Intermediate Level**

**`AbortController`** for **`fetch`**. **Third-party** maps/charts **`dispose()`** calls.

**Expert Level**

**Detached** **DOM** nodes in **singleton** caches—clear on route change.

```tsx
import { useEffect, useState } from "react";

export function LivePrice({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { price: number };
      setPrice(data.price);
    }, 5_000);
    return () => window.clearInterval(id);
  }, [symbol]);

  return <span>{price?.toFixed(2) ?? "—"}</span>;
}
```

#### Key Points — Memory Leaks

- **Every** **subscription** gets **teardown**.
- **Test** navigation **away** from **real-time** views.

---

### Stale Closures

**Beginner Level**

**Handlers** capture variables from render **N**; after async **`await`**, state may have moved on—**functional updates** **`setCount(c => c+1)`** avoid stale **`count`**.

**Real-time example**: **Weather** search fires multiple requests; **slow** response overwrites **new** city results—use **abort** or **request id**.

**Intermediate Level**

**`useRef`** for **latest** value in **interval** callbacks without resubscribing.

**Expert Level**

**eslint-plugin-react-hooks** exhaustive-deps catches many cases; not all—**async** still needs **cancellation** patterns.

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  function incrementTwice() {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  }

  return (
    <button type="button" onClick={incrementTwice}>
      {count}
    </button>
  );
}
```

#### Key Points — Stale Closures

- **Functional** **`setState`** for **multiple** updates in one event.
- **Race** **conditions**: **cancel**, **ignore**, or **sequence** requests.

---

## 23.2 Debugging Techniques

### React DevTools

**Beginner Level**

**Components** tab shows **props**, **state**, **hooks** per fiber. **Profiler** records **commit** times and **why** renders happened.

**Real-time example**: **Dashboard** **chart** re-renders entire page—Profiler shows **`DashboardLayout`** state change rippling.

**Intermediate Level**

**“Highlight updates”** visualizes re-renders. **Suspense** tab for **lazy** boundaries.

**Expert Level**

**Timeline** + **server components** debugging in frameworks—pair with **Next.js** dev overlay.

#### Key Points — React DevTools

- **Record** Profiler sessions for **regressions** in CI via **manual** acceptance tests.
- **Inspect** **context** values at runtime.

---

### Console Logging

**Beginner Level**

**`console.log`** props/state during development. Remove or **`import.meta.env.DEV`** guard before prod.

**Intermediate Level**

**`console.trace`** for **call stacks**. **Grouped** logs **`console.group`**.

**Expert Level**

**Structured** logging to **Sentry** breadcrumbs instead of ad-hoc logs in staging.

```typescript
export function devLog(...args: unknown[]) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[dev]", ...args);
  }
}
```

#### Key Points — Console Logging

- **Never** log **PII**/**tokens**.
- **Prefer** **temporary** logs removed before merge or behind **flags**.

---

### Debugger Statement

**Beginner Level**

**`debugger;`** pauses execution if **DevTools** open—useful to **inspect** closures in **event** handlers.

**Intermediate Level**

**Conditional** **`if (cond) debugger`** for **rare** branches (**payment** errors).

**Expert Level**

**Source maps** must align or breakpoints land wrong—verify **build** settings.

#### Key Points — Debugger Statement

- Remove **`debugger`** before **production** builds—**ESLint** **`no-debugger`**.
- **Works** best with **non-minified** dev bundles.

---

### Error Boundaries

**Beginner Level**

**Class** **`componentDidCatch`** or **`react-error-boundary`** **`ErrorBoundary`** wraps routes to catch **render** errors—**not** event handler errors (those need **`try/catch`**).

**Real-time example**: **Social** **feed** item throws; boundary shows **fallback** without white screen.

**Intermediate Level**

**Reset keys** on navigation to **retry** rendering.

**Expert Level**

**Report** to **Sentry** in **`onError`** callback.

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean };

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <div>Something went wrong.</div>;
    return this.props.children;
  }
}
```

#### Key Points — Error Boundaries

- **Place** at **route** boundaries + **major** widgets.
- **Doesn’t** catch **async** errors—handle separately.

---

### Source Maps

**Beginner Level**

Enable **source maps** in **staging** builds; **pause** on exceptions maps to **TSX** lines.

**Intermediate Level**

Upload to **Sentry** with **release** artifacts.

**Expert Level**

**Hidden** maps: available to tools, not referenced in browser.

#### Key Points — Source Maps

- **CI** reproducibility: store **map** + **commit** SHA.
- **Security**: don’t expose proprietary logic if policy forbids.

---

### Network Tab

**Beginner Level**

Inspect **fetch/XHR**: status codes, **CORS**, **payloads**, **timing**. **E-commerce** **checkout** fails—verify **`POST /orders`** body and **401**/**419**.

**Intermediate Level**

**Throttle** CPU/network to reproduce **mobile** issues.

**Expert Level**

**Waterfall** view finds **blocking** **scripts**; **`priority`** hints for **LCP** image.

#### Key Points — Network Tab

- **Correlate** **API** errors with **frontend** state transitions.
- **Export** **HAR** for **support** tickets (scrub secrets).

---

## 23.3 Problem-Solving Patterns

### Infinite Loop Solutions

**Beginner Level**

**`useEffect(() => setState(...), [state])`** where **effect** depends on **state** it changes → **infinite loop**. Fix **dependencies**, **derive** state, or **guard** with **refs**.

**Intermediate Level**

**`useEffect`** that sets state from **props** on every change—prefer **controlled** component or **`key` reset** pattern.

**Expert Level**

**Batching** in React 18 reduces some loops but **logic** still wrong—**lint** **rules** catch common patterns.

```tsx
import { useEffect, useState } from "react";

export function SyncedInput({ value }: { value: string }) {
  const [draft, setDraft] = useState(value);
  // Reset local state when external value changes — avoid looping setState in effect without deps care
  useEffect(() => {
    setDraft(value);
  }, [value]);
  return <input value={draft} onChange={(e) => setDraft(e.target.value)} />;
}
```

#### Key Points — Infinite Loop Solutions

- **List** **deps** mentally: does effect **write** something in **deps**?
- **Prefer** **`key={resetToken}`** to **reset** **local** state.

---

### Race Condition Fixes

**Beginner Level**

**Out-of-order** responses: **ignore** stale results with **abort**, **boolean** **`ignore`**, or **monotonic** **request id**.

**Real-time example**: **Weather** **city** changes fast—**slow** **London** response overwrites **Paris**.

**Intermediate Level**

**`AbortController`** tied to **effect** cleanup cancels prior **`fetch`**.

**Expert Level**

**TanStack Query** dedupes and **cancels** automatically with **query keys**.

```tsx
import { useEffect, useState } from "react";

type Forecast = { city: string; tempC: number };

export function useForecast(city: string) {
  const [data, setData] = useState<Forecast | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    async function run() {
      const res = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`, { signal: ctrl.signal });
      if (!res.ok) return;
      const json = (await res.json()) as Forecast;
      if (!cancelled) setData(json);
    }

    void run();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [city]);

  return data;
}
```

#### Key Points — Race Condition Fixes

- **Always** handle **`AbortError`** as benign.
- **Optimistic** UI needs **reconciliation** with **server** truth.

---

### Memory Leak Prevention

**Beginner Level**

**Cleanup** **subscriptions**, **timers**, **listeners**. **Detach** **third-party** widgets.

**Intermediate Level**

**WeakMap** caches for **DOM** **nodes** if needed—rare in React apps.

**Expert Level**

**Profiling** **heap** snapshots if **Detached** nodes grow in **SPA** long sessions.

#### Key Points — Memory Leak Prevention

- **Unmount** tests with **React Testing Library** **`unmount()`**.
- **Global** **singletons** are **leak** magnets.

---

### State Update Batching

**Beginner Level**

React **batches** multiple **`setState`** calls in **event handlers** automatically (React 18+ also batches **promises** in many cases).

**Intermediate Level**

**`flushSync`** escapes batching—use sparingly for **DOM** **measure** then **mutate** patterns.

**Expert Level**

**Concurrent** features may **interrupt**—**useTransition** for **non-urgent** updates.

```tsx
import { useState } from "react";

export function BatchDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  function onClick() {
    setA((x) => x + 1);
    setB((y) => y + 1); // batched: one re-render
  }

  return (
    <button type="button" onClick={onClick}>
      {a}:{b}
    </button>
  );
}
```

#### Key Points — State Update Batching

- **Don’t** rely on **intermediate** **`useState`** reads immediately after **`set`** in same tick—use **computed** values.
- **`startTransition`** for **heavy** **dashboard** updates.

---

### Effect Cleanup

**Beginner Level**

Return **function** from **`useEffect`** to unsubscribe. **Empty deps** `[]` runs once on mount.

**Intermediate Level**

**Resubscribe** when **`symbol`** changes—cleanup runs before next effect.

**Expert Level**

**Strict Mode** **double-invokes** effects in dev to surface missing cleanups—**not** a prod bug.

```tsx
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

*Note: In production apps, prefer React’s **`useSyncExternalStore`** with **`matchMedia`** to subscribe without tearing issues in concurrent rendering.*

#### Key Points — Effect Cleanup

- **Symmetry**: every **addListener** → **removeListener**.
- **Test** **StrictMode** behavior in dev.

---

## 23.4 Migration Patterns

### Class to Function

**Beginner Level**

Replace **`this.state`/`setState`** with **`useState`**, **`componentDidMount`** with **`useEffect`**, **`componentWillUnmount`** with **cleanup**.

**Real-time example**: **Todo** **`TodoApp`** class → **`function TodoApp`** + hooks.

**Intermediate Level**

**`getDerivedStateFromProps`** → **controlled** props or **`key`** reset.

**Expert Level**

**Error boundaries** still class-only (or library)—keep thin class wrapper.

```tsx
import { useEffect, useState } from "react";

type ClockProps = { tz: string };

export function Clock({ tz }: ClockProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(id);
  }, [tz]);

  return <time dateTime={now.toISOString()}>{now.toLocaleString(undefined, { timeZone: tz })}</time>;
}
```

#### Key Points — Class to Function

- **Hooks** rules: **top-level** only.
- **Ref** for **mutable** values **`useRef`**.

---

### Legacy Context to Hooks

**Beginner Level**

**`static contextType`** / **`Consumer`** → **`createContext` + `useContext`**.

**Intermediate Level**

**Split contexts** to minimize re-renders; **memoize** provider **value**.

**Expert Level**

**Server Components** change context story—**client** providers at boundaries.

```tsx
import { createContext, useContext } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<Theme>("light");

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
```

#### Key Points — Legacy Context to Hooks

- **Default** **context** **value** only for **unprovided** tests—prefer **required** provider.
- **Type** contexts **`createContext<Theme | null>(null)`** + **guard** hook.

---

### Redux to Modern

**Beginner Level**

**Server state** → **TanStack Query**; **client UI state** → **Zustand**/**Context**/**useReducer**; keep **Redux** only if team expertise/investment warrants.

**Intermediate Level**

**RTK Query** if staying Redux ecosystem.

**Expert Level**

**Incremental** migration: **new** features avoid Redux; **adapter** bridges during transition.

#### Key Points — Redux to Modern

- **Don’t** big-bang rewrite—**strangler** pattern.
- **Normalize** or **Query cache**—pick **one** source of truth.

---

### Router v5 to v6

**Beginner Level**

**`<Switch>`** → **`<Routes>`**, **`component=`** → **`<Route element={<X/>}/>`**, **`useHistory`** → **`useNavigate`**.

**Intermediate Level**

**Nested routes** with **`<Outlet>`**. **Relative** links.

**Expert Level**

**Data routers** **`createBrowserRouter`** + **loaders** (Remix-style).

```tsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export function CheckoutButton() {
  const nav = useNavigate();
  return (
    <button type="button" onClick={() => nav("/cart")}>
      View cart
    </button>
  );
}
```

#### Key Points — Router v5 to v6

- **Search params**: **`useSearchParams`** replaces **`location.search`** manual parsing (mostly).
- **Prompt/blocking** navigation APIs changed—check **docs**.

---

### CRA to Vite

**Beginner Level**

**`react-scripts`** → **`vite` + `@vitejs/plugin-react`**. Move **`index.html`** to **root**, script **`src/main.tsx`** **`type="module"`**.

**Intermediate Level**

**`process.env.REACT_APP_*`** → **`import.meta.env.VITE_*`**. **`public/`** paths unchanged conceptually.

**Expert Level**

**Jest** → **Vitest** alignment; **update** **CI** **cache** keys.

```typescript
// main.tsx entry
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

#### Key Points — CRA to Vite

- **Faster** **DX**; verify **browserlist** and **polyfills**.
- **Env** rename **script** helps migration.

---

## 23.5 Refactoring Patterns

### Extract Component

**Beginner Level**

**Copy** JSX block into new function **`ShippingForm`** in new file; **pass** needed props.

**Intermediate Level**

**Storybook** story drives **API** design before wiring data.

**Expert Level**

**Codemod** if many similar extractions (**cards** in **catalog**).

#### Key Points — Extract Component

- **Props interface** explicit **`type Props`**
- **Avoid** extracting **too early**—wait for **second** use or **clarity** win.

---

### Extract Custom Hook

**Beginner Level**

Move **`useState` + `useEffect`** cluster to **`useCart()`** reusable across **pages**.

**Intermediate Level**

Return **stable** **`actions`** with **`useMemo`**/**`useCallback`** if consumers **`memo`**’d.

**Expert Level**

**`useSyncExternalStore`** for **subscriptions** to external stores.

```tsx
import { useCallback, useMemo, useState } from "react";

type Item = { sku: string; qty: number };

export function useCart(initial: Item[]) {
  const [items, setItems] = useState<Item[]>(initial);

  const add = useCallback((sku: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.sku === sku);
      if (idx === -1) return [...prev, { sku, qty: 1 }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      return next;
    });
  }, []);

  const totalQty = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return { items, add, totalQty };
}
```

#### Key Points — Extract Custom Hook

- **Name** **`useX`** rule.
- **Don’t** hide **React** **rules**—hooks stay **pure** at call order.

---

### Combine Related State

**Beginner Level**

Multiple **`useState`** for **`loading`**, **`error`**, **`data`** → **`useReducer`** or **React Query** **`status`**.

**Intermediate Level**

**Discriminated union** state machine: **`{status:'idle'}|{status:'loading'}|{status:'error',error:Error}`**.

**Expert Level**

**XState** for complex **checkout** flows.

```typescript
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

#### Key Points — Combine Related State

- **Impossible states** become **unrepresentable**.
- **Simpler** than many **booleans**.

---

### Split Unrelated State

**Beginner Level**

One giant **`useState<{ui:..., data:...}>`** causes unnecessary merges—split **`useUI`** vs **`useData`**.

**Intermediate Level**

**Context** splitting applies same idea.

**Expert Level**

**Zustand** **slices** pattern.

#### Key Points — Split Unrelated State

- **Fewer** accidental **clobber** writes.
- **Fine-grained** subscriptions in external stores.

---

### Composition Refactoring

**Beginner Level**

Replace **`props.showHeader`** booleans with **`layout` slot** **`header`** **`ReactNode`**.

**Intermediate Level**

**Render props** / **slots** for **customization** without **config explosion**.

**Expert Level**

**Headless** components (**Radix**) provide behavior; app provides **styles**.

```tsx
type PageProps = {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
};

export function Page({ toolbar, children }: PageProps) {
  return (
    <div>
      {toolbar}
      <div className="content">{children}</div>
    </div>
  );
}
```

#### Key Points — Composition Refactoring

- **Fewer** boolean **combinatorics**.
- **Aligns** with **design system** **slots**.

---

## 23.6 Common Solutions

### Debouncing Input

**Beginner Level**

**Debounce** delays invoking a function until **pause** in events—**search** **as-you-type** for **e-commerce** **catalog**.

**Intermediate Level**

**`useDebouncedValue`** hook + **`useEffect`** **fetch**, or **libraries** **`use-debounce`**.

**Expert Level**

**Leading** edge debounce for **instant** feedback + **trailing** **save**.

```tsx
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return v;
}

export function ProductSearch() {
  const [q, setQ] = useState("");
  const debounced = useDebouncedValue(q, 300);
  // use debounced in query hook
  return <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />;
}
```

#### Key Points — Debouncing Input

- **300ms** typical starting point for search.
- **Cancel** in-flight **fetch** when **debounced** value changes.

---

### Throttling Events

**Beginner Level**

**Throttle** runs at most **once per window**—**scroll** handlers for **infinite** **feed**.

**Intermediate Level**

**`requestAnimationFrame`** throttle for **scroll** **parallax**.

**Expert Level**

**Passive** **`{ passive: true }`** listeners for **scroll** perf.

```typescript
export function throttle<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let last = 0;
  let t: number | undefined;
  return (...args: T) => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}
```

#### Key Points — Throttling Events

- **Prefer** **CSS** **`position: sticky`** over **scroll** JS when possible.
- **Throttle** **resize** observers for **dashboard** **charts**.

---

### Infinite Scroll

**Beginner Level**

**IntersectionObserver** on **sentinel** **`div`** at list bottom → **`fetchNextPage`**.

**Intermediate Level**

**TanStack Query** **`useInfiniteQuery`**.

**Expert Level**

**Virtualization** **`@tanstack/react-virtual`** + **infinite** **query** **prefetch**.

```tsx
import { useEffect, useRef } from "react";

type FeedProps = {
  hasMore: boolean;
  onEndReached: () => void;
};

export function FeedSentinel({ hasMore, onEndReached }: FeedProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) onEndReached();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, onEndReached]);

  return <div ref={ref} aria-hidden />;
}
```

#### Key Points — Infinite Scroll

- **Skeleton** rows while **loading** next page.
- **Avoid** **duplicate** **fetches** with **in-flight** **guard**.

---

### Modal Management

**Beginner Level**

**`dialog`** element + **`open`** prop or **portal** **`createPortal`** to **`document.body`**. **Focus trap** via library (**Radix**, **Headless UI**).

**Intermediate Level**

**`aria-modal`**, **`aria-labelledby`**, **ESC** close, **scroll** lock.

**Expert Level**

**Nested** modals and **stacking** context—**use** proven **primitive**.

```tsx
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

type ModalProps = { open: boolean; title: string; onClose: () => void; children: React.ReactNode };

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="modal">
      <h2 id={titleId}>{title}</h2>
      {children}
    </div>,
    document.body,
  );
}
```

#### Key Points — Modal Management

- **Focus** **management** is non-negotiable for **a11y**.
- **Portal** avoids **overflow:hidden** clipping in **dashboard** layouts.

---

### Toast Notifications

**Beginner Level**

**Global** **provider** maintains **queue**; **auto-dismiss** timers; **ARIA** **`role="status"`**.

**Intermediate Level**

**Pause** **dismiss** on hover/focus for **WCAG**.

**Expert Level**

**Limit** concurrent toasts; **dedupe** identical **errors**.

```tsx
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: string; message: string; tone: "info" | "error" };

type Ctx = { push: (t: Omit<Toast, "id">) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 4_000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="toasts">
        {items.map((t) => (
          <div key={t.id} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("ToastProvider required");
  return ctx;
}
```

#### Key Points — Toast Notifications

- **Errors** vs **info** styling; don’t **only** rely on **color**.
- **Integrate** **Sentry** for **errors**, toast for **user** message.

---

### File Upload

**Beginner Level**

**`<input type="file">`** + **`FormData`** **`fetch`**. Show **progress** with **`xhr`** or **`fetch` **streams** (limited).

**Intermediate Level**

**`multipart`** upload to **S3** **presigned URLs**—browser talks to **S3** directly.

**Expert Level**

**Chunked** uploads, **resume**, **virus scan** server-side. For upload progress with **`fetch`**, consider **`XMLHttpRequest.onprogress`** or **cloud SDKs** that expose progress events.

```tsx
import { useState } from "react";

type UploadResult = { url: string };

export function AvatarUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload failed");
      const data = (await res.json()) as UploadResult;
      onUploaded(data.url);
    } finally {
      setBusy(false);
    }
  }

  return <input type="file" accept="image/*" disabled={busy} onChange={onChange} />;
}
```

#### Key Points — File Upload

- **Validate** **type/size** client-side; **enforce** server-side.
- **Show** **perceived** progress for **large** **social** **video** uploads.

---

## Key Points (Chapter Summary)

- **Immutability**, **keys**, and **correct** **effects** prevent the most common UI bugs.
- **Debug** with **DevTools Profiler**, **network**, **maps**, **boundaries**.
- **Race** conditions need **cancellation** or **ignore** strategies.
- **Migrations** are **incremental**: **router**, **state**, **build** tool one slice at a time.
- **Recipes**: **debounce** search, **throttle** scroll, **observer** infinite lists, **portals** for **modals**, **toasts** for feedback, **FormData** uploads.

---

## Best Practices (Global)

1. **Enable** **StrictMode** in dev to catch **unsafe** lifecycles and **missing** cleanups.
2. **Prefer** **React Query** for **server** state to avoid **manual** **effect** **fetch**.
3. **Measure** with **Profiler** before **`memo`**/**`useCallback`**.
4. **Centralize** **error reporting** (Sentry) from **boundaries** and **global** **handlers**.
5. **Document** **migration** runbooks with **checklists** and **rollback** plans.
6. **Test** **navigation** and **unmount** paths for **subscriptions**.
7. **Use** **battle-tested** **primitives** for **modals**/**comboboxes**/**a11y**.

---

## Common Mistakes to Avoid

| Mistake | Why it hurts | Better approach |
|--------|----------------|-----------------|
| **Mutate** nested state | Subtle no-op updates | **Spread**/Immer |
| **`useEffect`** for derivable values | Loops + bugs | **Compute** in render |
| **Ignoring** **abort** on **navigate** | Sets state on unmounted | **`AbortController`** + cleanup |
| **`key={Math.random()}`** | Full remount each render | **Stable ids** |
| **Error boundary** for **event** errors | Won’t catch | **`try/catch`** |
| **Debounce** without **canceling** **fetch** | Race results | **Request** **id** or **query** lib |
| **Modal** without **focus** trap | **Keyboard** users stuck | **Radix/Headless** |
| **Upload** without **server** validation | Malware/**DoS** | **Type/size** limits + scan |

---

*End of Common Patterns and Anti-Patterns chapter.*
