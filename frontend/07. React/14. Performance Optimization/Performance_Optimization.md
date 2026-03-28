# Performance Optimization (React + TypeScript)

**Performance** **optimization** **makes** **e-commerce** **catalogs** **scroll** **smoothly,** **social** **feeds** **stay** **responsive** **under** **load,** **dashboards** **render** **heavy** **charts** **without** **jank,** **and** **chat** **UIs** **keep** **typing** **instant.** **TypeScript** **helps** **you** **model** **props** **and** **memoization** **contracts** **explicitly** **so** **optimizations** **don’t** **silently** **break.**

---

## 📑 Table of Contents

- [Performance Optimization (React + TypeScript)](#performance-optimization-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [14.1 Performance Basics](#141-performance-basics)
  - [14.2 React.memo](#142-reactmemo)
  - [14.3 useMemo and useCallback](#143-usememo-and-usecallback)
  - [14.4 Component Optimization](#144-component-optimization)
  - [14.5 List Optimization](#145-list-optimization)
  - [14.6 State Optimization](#146-state-optimization)
  - [14.7 Render Optimization](#147-render-optimization)
  - [14.8 Bundle Optimization](#148-bundle-optimization)
  - [14.9 React 18+ Performance](#149-react-18-performance)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 14.1 Performance Basics

### Overview

**Beginner Level**

**React** **re-renders** **components** **when** **state** **or** **context** **they** **depend** **on** **changes** **(or** **when** **parents** **re-render,** **unless** **memoized).** **Performance** **work** **targets** **three** **areas:** **render** **time,** **commit** **to** **DOM,** **and** **network/bundle** **costs.**

**Real-time example**: **Weather** **widget** **—** **if** **the** **whole** **app** **re-renders** **every** **second** **for** **a** **clock,** **you’ve** **optimized** **the** **wrong** **layer.**

**Intermediate Level**

**Profile** **before** **optimizing.** **User** **perceived** **performance** **often** **tracks** **input** **latency** **and** **time** **to** **interactive** **more** **than** **raw** **FPS.**

**Expert Level**

**Distinguish** **CPU-bound** **(expensive** **selectors,** **large** **lists)** **vs** **IO-bound** **(API** **latency)** **vs** **main-thread** **blocking** **(long** **tasks).** **Each** **needs** **different** **tools.**

```typescript
export type PerfHotspot = "render" | "commit" | "network" | "bundle" | "idle";

export function classifyIssue(signal: { longTasks: boolean; slowNetwork: boolean; bigList: boolean }): PerfHotspot[] {
  const out: PerfHotspot[] = [];
  if (signal.bigList) out.push("render");
  if (signal.longTasks) out.push("commit");
  if (signal.slowNetwork) out.push("network");
  return out;
}
```

#### Key Points — Overview

- **Measure** **first;** **don’t** **guess.**
- **Separate** **concerns:** **render** **vs** **fetch** **vs** **bundle.**
- **Target** **user-visible** **latency.**

---

### Identifying Issues

**Beginner Level**

**Symptoms** **include** **dropped** **frames** **when** **scrolling,** **laggy** **typing,** **slow** **route** **transitions,** **and** **high** **CPU** **in** **devtools.**

**Real-time example**: **E-commerce** **product** **grid** **stutters** **when** **filters** **change** **—** **likely** **too** **many** **components** **re-rendering** **or** **unvirtualized** **list.**

**Intermediate Level**

**Use** **React** **Profiler** **flame** **charts** **to** **see** **which** **components** **commit** **often.** **Check** **for** **state** **stored** **too** **high** **in** **the** **tree.**

**Expert Level**

**Correlate** **with** **Performance** **panel** **“Main”** **thread** **long** **tasks** **and** **Layout/Recalculate** **Style** **events** **when** **animations** **jank.**

```tsx
// Quick dev-only render counter (remove in production)
import { useRef } from "react";

export function useRenderCount(name: string) {
  const n = useRef(0);
  n.current += 1;
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[render] ${name} #${n.current}`);
  }
}
```

#### Key Points — Identifying Issues

- **Profiler** **+** **Performance** **panel** **=** **signal.**
- **Re-render** **counts** **are** **hints,** **not** **proof** **of** **slowness.**
- **Reproduce** **on** **throttled** **CPU** **devices.**

---

### React DevTools Profiler

**Beginner Level**

**Record** **a** **session,** **interact** **with** **the** **UI,** **stop** **—** **see** **which** **components** **rendered** **and** **how** **long** **they** **took.**

**Real-time example**: **Dashboard** **chart** **pane** **shows** **expensive** **renders** **when** **date** **picker** **changes.**

**Intermediate Level**

**Enable** **“Record** **why** **each** **component** **rendered”** **(implementation** **depends** **on** **React** **version)** **to** **spot** **prop** **changes** **vs** **context** **vs** **hooks.**

**Expert Level**

**Compare** **profiles** **before/after** **memoization** **or** **splitting;** **watch** **for** **cascading** **parent** **updates.**

```text
Profiler workflow:
1. Start profiling
2. Perform user journey (filter, paginate, open modal)
3. Stop → inspect flamegraph and ranked chart
4. Drill into commits with unexpected child renders
```

#### Key Points — React DevTools Profiler

- **Profile** **production-like** **builds** **too** **(React** **18+** **profiling** **builds).**
- **Focus** **on** **commits** **with** **large** **total** **time.**
- **Pair** **with** **component** **names** **(`displayName`)** **for** **HOCs.**

---

### Chrome DevTools

**Beginner Level**

**Performance** **tab** **records** **frames,** **JS** **execution,** **and** **layout.** **Network** **tab** **shows** **waterfalls** **for** **slow** **APIs.**

**Real-time example**: **Social** **feed** **—** **large** **images** **without** **lazy** **loading** **inflate** **LCP.**

**Intermediate Level**

**Use** **Coverage** **to** **find** **unused** **JS/CSS.** **Memory** **snapshots** **for** **leaks** **in** **long-lived** **SPAs.**

**Expert Level**

**Long** **Animation** **Frames** **(LoAF)** **and** **Interaction** **to** **Next** **Paint** **(INP)** **relate** **to** **main-thread** **work** **blocking** **inputs.**

```typescript
// Mark and measure a user journey (DevTools Performance user timings)
export function measureCheckoutStep(step: string, fn: () => void) {
  performance.mark(`${step}-start`);
  fn();
  performance.mark(`${step}-end`);
  performance.measure(step, `${step}-start`, `${step}-end`);
}
```

#### Key Points — Chrome DevTools

- **Network** **and** **Performance** **complement** **React** **Profiler.**
- **Throttle** **CPU/network** **to** **emulate** **real** **users.**
- **Watch** **for** **layout** **thrash** **(read/write** **DOM** **interleaved).**

---

### Measuring Render Time

**Beginner Level**

**`console.time`** **around** **a** **state** **update** **is** **naive** **but** **sometimes** **useful** **for** **rough** **checks.**

**Real-time example**: **Todo** **list** **bulk** **toggle** **—** **measure** **how** **long** **React** **spends** **in** **render** **phase** **vs** **effects.**

**Intermediate Level**

**Use** **Profiler** **commit** **durations.** **For** **custom** **metrics,** **`scheduler`** **is** **internal** **—** **prefer** **profiling** **tools.**

**Expert Level**

**Integrate** **OpenTelemetry** **or** **web-vitals** **for** **field** **data** **(LCP,** **FID/INP,** **CLS)** **on** **production** **routes.**

```typescript
import { onCLS, onINP, onLCP } from "web-vitals";

export function reportWebVitals(send: (m: { name: string; value: number }) => void) {
  onLCP((m) => send({ name: "LCP", value: m.value }));
  onINP((m) => send({ name: "INP", value: m.value }));
  onCLS((m) => send({ name: "CLS", value: m.value }));
}
```

#### Key Points — Measuring Render Time

- **Lab** **(Profiler)** **vs** **field** **(web-vitals)** **both** **matter.**
- **Don’t** **optimize** **render** **time** **if** **network** **dominates.**
- **Track** **regressions** **in** **CI** **with** **bundle** **budgets** **and** **Lighthouse** **CI.**

---

## 14.2 React.memo

### Basics

**Beginner Level**

**`React.memo(Component)`** **memoizes** **the** **component** **so** **it** **skips** **re-render** **if** **props** **are** **unchanged** **(default** **shallow** **compare).**

**Real-time example**: **E-commerce** **—** **`ProductCard`** **wrapped** **in** **`memo`** **so** **parent** **list** **header** **re-renders** **don’t** **re-render** **every** **card.**

**Intermediate Level**

**`memo`** **only** **helps** **when** **parent** **re-renders** **often** **and** **child** **is** **pure** **with** **stable** **props.**

**Expert Level**

**If** **props** **include** **inline** **functions/objects** **recreated** **each** **render,** **`memo`** **won’t** **bail** **out** **—** **fix** **prop** **stability** **first.**

```tsx
import { memo } from "react";

export type Product = { id: string; title: string; price: number };

export const ProductCard = memo(function ProductCard({ p }: { p: Product }) {
  return (
    <article>
      <h3>{p.title}</h3>
      <p>${p.price.toFixed(2)}</p>
    </article>
  );
});
```

#### Key Points — Basics

- **Use** **for** **pure** **presentational** **components** **in** **hot** **lists.**
- **Combine** **with** **stable** **props.**
- **Not** **a** **default** **for** **every** **component** **—** **adds** **comparison** **cost.**

---

### Shallow Comparison

**Beginner Level**

**Default** **`memo`** **compares** **each** **prop** **with** **`Object.is`.** **Primitives** **compare** **by** **value;** **objects** **by** **reference.**

**Real-time example**: **Dashboard** **`style={{ width: "100%" }}`** **as** **prop** **breaks** **`memo`** **every** **time.**

**Intermediate Level**

**Arrays** **and** **objects** **must** **be** **stable** **references** **or** **you** **need** **custom** **compare.**

**Expert Level**

**Consider** **data** **normalization** **so** **children** **receive** **primitive** **props** **or** **stable** **ids.**

```tsx
import { memo } from "react";

const Row = memo(
  function Row({ id, label }: { id: string; label: string }) {
    return <div data-id={id}>{label}</div>;
  },
  (prev, next) => prev.id === next.id && prev.label === next.label
);
```

#### Key Points — Shallow Comparison

- **Reference** **equality** **dominates** **failures.**
- **Lift** **stable** **objects** **up** **or** **memoize** **them.**
- **Custom** **compare** **when** **you** **know** **which** **props** **matter.**

---

### Custom Comparison

**Beginner Level**

**Pass** **second** **arg** **`(prev, next) => boolean`** **to** **`memo`** **—** **return** **`true`** **when** **props** **are** **“equal** **enough”.**

**Real-time example**: **Chat** **message** **row** **ignores** **ephemeral** **highlight** **props** **that** **don’t** **affect** **paint.**

**Intermediate Level**

**Custom** **compare** **must** **be** **fast** **—** **don’t** **do** **deep** **JSON** **stringify** **on** **every** **parent** **render.**

**Expert Level**

**If** **custom** **compare** **gets** **complex,** **derive** **memoized** **props** **upstream** **or** **split** **components.**

```tsx
import { memo } from "react";

type Msg = { id: string; text: string; editedAt?: number };

export const MessageRow = memo(
  function MessageRow({ m }: { m: Msg }) {
    return <div>{m.text}</div>;
  },
  (a, b) => a.m.id === b.m.id && a.m.text === b.m.text && a.m.editedAt === b.m.editedAt
);
```

#### Key Points — Custom Comparison

- **Keep** **O(1)** **or** **near** **O(1).**
- **Document** **why** **certain** **props** **are** **ignored.**
- **Prefer** **modeling** **stable** **data** **over** **clever** **compares.**

---

### When to Use

**Beginner Level**

**Use** **`memo`** **for** **list** **items,** **rows,** **cells,** **and** **pure** **widgets** **that** **receive** **frequent** **parent** **updates.**

**Real-time example**: **Social** **—** **`FeedItem`** **memo** **when** **header** **search** **state** **changes** **often.**

**Intermediate Level**

**Skip** **`memo`** **for** **tiny** **components** **where** **comparison** **cost** **> ** **render** **cost.**

**Expert Level**

**Validate** **with** **Profiler** **—** **sometimes** **splitting** **state** **(`useState` ** **colocation)** **fixes** **root** **cause** **better** **than** **`memo`.**

```typescript
export function shouldMemoLeafComponent(inputs: {
  parentRerenderHz: number;
  leafRenderCostMs: number;
  compareCostMs: number;
}): boolean {
  return inputs.parentRerenderHz > 10 && inputs.compareCostMs < inputs.leafRenderCostMs * 0.5;
}
```

#### Key Points — When to Use

- **Hot** **paths** **first.**
- **Pair** **with** **stable** **props.**
- **Re-measure** **after** **changes.**

---

### Limitations

**Beginner Level**

**`memo`** **doesn’t** **stop** **renders** **if** **context** **value** **changes** **and** **the** **consumer** **subscribes,** **or** **if** **internal** **state** **updates.**

**Real-time example**: **Weather** **—** **memoed** **child** **still** **re-renders** **when** **consuming** **a** **broad** **context** **object** **that** **changes** **each** **parent** **render.**

**Intermediate Level**

**HOC** **wrappers** **can** **obscure** **props** **—** **set** **`displayName`** **and** **ensure** **ref** **forwarding** **with** **`forwardRef`.**

**Expert Level**

**Concurrent** **features** **may** **render** **more** **than** **once** **for** **a** **single** **logical** **update** **—** **components** **must** **stay** **pure** **and** **idempotent.**

```tsx
import { createContext, memo, useContext } from "react";

const Ctx = createContext<{ theme: "light" | "dark" }>({ theme: "light" });

export const ThemedText = memo(function ThemedText({ children }: { children: string }) {
  const { theme } = useContext(Ctx);
  return <span data-theme={theme}>{children}</span>;
});
// If Ctx provider value is a new object each time, consumers still rerender.
```

#### Key Points — Limitations

- **Context** **can** **bypass** **`memo`.**
- **Refs** **and** **state** **still** **trigger** **renders.**
- **Don’t** **rely** **on** **`memo`** **for** **correctness** **—** **only** **performance.**

---

## 14.3 useMemo and useCallback

### Memoization Concepts

**Beginner Level**

**`useMemo`** **caches** **a** **computed** **value** **between** **renders** **when** **deps** **unchanged.** **`useCallback`** **caches** **a** **function** **reference** **(implementation** **is** **`useMemo(() => fn, deps)`).**

**Real-time example**: **Dashboard** **—** **memoize** **aggregated** **totals** **from** **large** **arrays.**

**Intermediate Level**

**Memoization** **trades** **memory** **for** **CPU** **—** **small** **computations** **don’t** **need** **`useMemo`.**

**Expert Level**

**React** **may** **discard** **memo** **across** **high-priority** **updates** **in** **some** **cases** **—** **don’t** **depend** **on** **`useMemo`** **for** **semantic** **guarantees** **beyond** **optimization** **(React** **docs).**

```typescript
import { useCallback, useMemo, useState } from "react";

export function useOrderTotals(lines: { qty: number; price: number }[]) {
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.qty * l.price, 0),
    [lines]
  );
  const fmt = useCallback((n: number) => n.toFixed(2), []);
  return { subtotal, fmt };
}
```

#### Key Points — Memoization Concepts

- **Deps** **array** **must** **be** **complete** **and** **stable.**
- **Not** **a** **general** **cache** **—** **per** **component** **instance.**
- **Profile** **before** **sprinkling** **`useMemo`.**

---

### Expensive Calculations

**Beginner Level**

**Put** **heavy** **pure** **computations** **inside** **`useMemo`** **so** **they** **don’t** **run** **on** **every** **render.**

**Real-time example**: **E-commerce** **—** **sorting** **10k** **SKUs** **client-side** **for** **a** **table.**

**Intermediate Level**

**If** **input** **changes** **often,** **consider** **Web** **Workers** **or** **server-side** **pre-aggregation** **for** **dashboards.**

**Expert Level**

**For** **incremental** **updates,** **maintain** **a** **normalized** **index** **(Map)** **instead** **of** **re-scanning** **arrays.**

```typescript
import { useMemo } from "react";

export function useSortedProducts(products: { id: string; price: number }[], sort: "asc" | "desc") {
  return useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
    return arr;
  }, [products, sort]);
}
```

#### Key Points — Expensive Calculations

- **Measure** **cost** **first.**
- **Prefer** **algorithmic** **fixes** **over** **`useMemo`** **alone.**
- **Watch** **memory** **when** **memoizing** **large** **structures.**

---

### Function Stability

**Beginner Level**

**Child** **components** **wrapped** **in** **`memo`** **need** **stable** **callback** **props** **—** **use** **`useCallback`** **when** **passing** **handlers** **down.**

**Real-time example**: **Todo** **—** **`onToggle(id)`** **stable** **if** **created** **with** **`useCallback`** **+** **`dispatch`.**

**Intermediate Level**

**If** **deps** **change** **often,** **`useCallback`** **won’t** **help** **—** **fix** **architecture** **(move** **state** **down,** **reducer).**

**Expert Level**

**Event** **handlers** **in** **lists** **sometimes** **use** **ref** **patterns** **to** **avoid** **per-row** **callbacks** **—** **e.g.,** **`data-id`** **+** **one** **parent** **handler.**

```tsx
import { useCallback, useState } from "react";

export function Counter({ onChange }: { onChange: (n: number) => void }) {
  const [n, setN] = useState(0);
  const inc = useCallback(() => {
    setN((x) => {
      const next = x + 1;
      onChange(next);
      return next;
    });
  }, [onChange]);
  return <button type="button" onClick={inc}>{n}</button>;
}
```

#### Key Points — Function Stability

- **Stable** **callbacks** **unlock** **`memo`** **benefits.**
- **Don’t** **fight** **frequently** **changing** **deps** **—** **restructure.**
- **Consider** **dispatch** **patterns** **to** **reduce** **callback** **churn.**

---

### Dependency Arrays

**Beginner Level**

**Hooks** **compare** **deps** **with** **`Object.is`.** **Missing** **deps** **cause** **stale** **closures;** **extra** **unstable** **deps** **defeat** **memoization.**

**Real-time example**: **Chat** **`useMemo`** **for** **filtered** **threads** **must** **list** **`query`** **and** **`threads`.**

**Intermediate Level**

**ESLint** **`exhaustive-deps`** **rule** **helps** **—** **fix** **properly** **instead** **of** **silencing** **without** **thought.**

**Expert Level**

**For** **stable** **but** **mutable** **refs,** **use** **`useRef`** **for** **values** **that** **shouldn’t** **trigger** **re-memoization.**

```typescript
import { useEffect, useRef, useState } from "react";

export function useDebouncedQuery(q: string, ms: number) {
  const [debounced, setDebounced] = useState(q);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setDebounced(q), ms);
    return () => window.clearTimeout(t.current);
  }, [q, ms]);

  return debounced;
}
```

#### Key Points — Dependency Arrays

- **Lint** **deps** **religiously.**
- **Split** **hooks** **when** **deps** **diverge.**
- **Use** **refs** **for** **non-reactive** **values.**

---

### When NOT to Use

**Beginner Level**

**Avoid** **`useMemo`/`useCallback`** **for** **cheap** **operations** **or** **values** **that** **must** **recompute** **every** **time** **anyway.**

**Real-time example**: **Weather** **formatting** **a** **single** **number** **—** **trivial** **cost.**

**Intermediate Level**

**Premature** **memoization** **adds** **complexity** **and** **can** **hide** **real** **issues** **(unstable** **props).**

**Expert Level**

**If** **you’re** **memoizing** **everything,** **likely** **need** **state** **colocation** **or** **better** **data** **structures.**

```typescript
// Anti-pattern sketch: memoizing trivial work
// const label = useMemo(() => `${user.firstName} ${user.lastName}`, [user]);
// Often clearer as inline expression unless profiled hot path
```

#### Key Points — When NOT to Use

- **Default** **to** **simple** **code.**
- **Optimize** **proven** **hotspots.**
- **Fix** **architecture** **before** **micro-memoizing.**

---

## 14.4 Component Optimization

### Splitting

**Beginner Level**

**Split** **large** **components** **so** **state** **changes** **in** **one** **section** **don’t** **re-render** **unrelated** **UI.**

**Real-time example**: **Dashboard** **—** **separate** **`FiltersPanel`** **from** **`ChartsPanel`.**

**Intermediate Level**

**Extract** **heavy** **subtrees** **behind** **`memo`** **or** **their** **own** **state** **containers.**

**Expert Level**

**Align** **splits** **with** **design** **system** **boundaries** **and** **lazy** **loading** **opportunities.**

```tsx
export function DashboardPage() {
  return (
    <div>
      <FiltersPanel />
      <ChartsPanel />
      <TablesPanel />
    </div>
  );
}
```

#### Key Points — Splitting

- **Colocate** **state** **with** **where** **it’s** **needed.**
- **Smaller** **trees** **rerender** **less.**
- **Combine** **with** **route-level** **splitting.**

---

### Lazy Loading

**Beginner Level**

**Load** **code** **only** **when** **needed** **(route,** **modal,** **tab).**

**Real-time example**: **E-commerce** **admin** **—** **lazy** **reports** **bundle** **opens** **only** **for** **staff.**

**Intermediate Level**

**Prefetch** **on** **hover/focus** **for** **instant** **feel.**

**Expert Level**

**Coordinate** **with** **service** **workers** **or** **HTTP/2** **push** **only** **when** **measured** **beneficial.**

```tsx
import { lazy, Suspense } from "react";

const AdminReports = lazy(() => import("./AdminReports"));

export function AdminGate({ show }: { show: boolean }) {
  return show ? (
    <Suspense fallback={<div>Loading reports…</div>}>
      <AdminReports />
    </Suspense>
  ) : null;
}
```

#### Key Points — Lazy Loading

- **Shrink** **initial** **bundle.**
- **Provide** **skeleton** **fallbacks.**
- **Prefetch** **critical** **chunks.**

---

### Code Splitting

**Beginner Level**

**Split** **bundles** **by** **route** **or** **feature** **so** **users** **download** **only** **what** **they** **use.**

**Real-time example**: **Social** **—** **separate** **messaging** **chunk** **from** **feed** **chunk.**

**Intermediate Level**

**Bundler** **(`vite`,** **`webpack`)** **emits** **async** **chunks** **for** **`import()`.**

**Expert Level**

**Analyze** **bundle** **graph** **to** **find** **accidental** **shared** **dependencies** **inflating** **main** **chunk.**

```typescript
export async function loadFeature(name: "chat" | "feed") {
  switch (name) {
    case "chat":
      return import("../features/chat");
    case "feed":
      return import("../features/feed");
  }
}
```

#### Key Points — Code Splitting

- **Per-route** **splits** **are** **common** **defaults.**
- **Watch** **duplicate** **vendor** **chunks.**
- **Measure** **with** **analyzer.**

---

### React.lazy and Suspense

**Beginner Level**

**`lazy(() => import("./X"))`** **returns** **a** **component** **that** **loads** **on** **first** **render;** **wrap** **with** **`Suspense`** **for** **fallback** **UI.**

**Real-time example**: **Todo** **app** **settings** **page** **lazy.**

**Intermediate Level**

**Error** **boundaries** **catch** **failed** **chunks** **(network).**

**Expert Level**

**Server** **Components** **and** **SSR** **frameworks** **have** **different** **streaming** **patterns** **—** **follow** **framework** **docs.**

```tsx
import { lazy, Suspense } from "react";

const HeavyMap = lazy(() => import("./HeavyMap"));

export function TripPlanner() {
  return (
    <Suspense fallback={<div>Loading map…</div>}>
      <HeavyMap />
    </Suspense>
  );
}
```

#### Key Points — React.lazy + Suspense

- **Always** **provide** **fallback.**
- **Handle** **errors** **at** **route** **level.**
- **Test** **slow** **network** **throttling.**

---

### Dynamic Imports

**Beginner Level**

**`import("path")`** **returns** **a** **promise** **of** **a** **module** **—** **used** **by** **`lazy`** **and** **manual** **prefetch.**

**Real-time example**: **Dashboard** **downloads** **chart** **library** **only** **when** **user** **opens** **analytics** **tab.**

**Intermediate Level**

**Tree-shaking** **still** **applies** **to** **static** **parts** **of** **entry** **graph.**

**Expert Level**

**Prefetch** **`import()`** **on** **`pointerenter`** **for** **likely** **navigation.**

```typescript
export function prefetchAnalytics() {
  void import("./AnalyticsDashboard");
}
```

#### Key Points — Dynamic Imports

- **Primary** **tool** **for** **route** **and** **modal** **splitting.**
- **Combine** **with** **skeleton** **UI.**
- **Watch** **for** **waterfall** **if** **not** **preloaded.**

---

### Preloading

**Beginner Level**

**Preload** **likely-next** **routes** **after** **idle** **time** **or** **on** **hover.**

**Real-time example**: **E-commerce** **—** **preload** **checkout** **chunk** **when** **cart** **has** **items.**

**Intermediate Level**

**`<link rel="modulepreload">`** **for** **critical** **chunks** **(framework-specific** **helpers** **exist).**

**Expert Level**

**ML-based** **prefetch** **in** **large** **products** **—** **only** **with** **metrics** **proving** **benefit.**

```tsx
import { useEffect } from "react";

export function useIdlePrefetch(importer: () => Promise<unknown>) {
  useEffect(() => {
    const id = requestIdleCallback(() => {
      void importer();
    });
    return () => cancelIdleCallback(id);
  }, [importer]);
}
```

#### Key Points — Preloading

- **Improves** **perceived** **speed.**
- **Don’t** **preload** **everything** **—** **costs** **bandwidth.**
- **Respect** **data-saver** **and** **slow** **connections.**

---

## 14.5 List Optimization

### Virtualization (react-window)

**Beginner Level**

**Render** **only** **visible** **rows** **+** **overscan** **in** **a** **scroll** **viewport** **—** **`FixedSizeList`** **from** **`react-window`.**

**Real-time example**: **Social** **infinite** **feed** **with** **thousands** **of** **posts.**

**Intermediate Level**

**Variable** **row** **heights** **need** **`VariableSizeList`** **or** **measurement** **caching.**

**Expert Level**

**Integrate** **with** **infinite** **loaders** **—** **append** **items** **to** **data** **store** **without** **breaking** **scroll** **position.**

```tsx
import { FixedSizeList, type ListChildComponentProps } from "react-window";

type Row = { id: string; title: string };

function Row({ index, style, data }: ListChildComponentProps<Row[]>) {
  return (
    <div style={style} data-id={data[index].id}>
      {data[index].title}
    </div>
  );
}

export function VirtualList({ items }: { items: Row[] }) {
  return (
    <FixedSizeList
      height={500}
      itemCount={items.length}
      itemSize={40}
      width="100%"
      itemData={items}
    >
      {Row}
    </FixedSizeList>
  );
}
```

#### Key Points — react-window

- **Essential** **for** **long** **lists.**
- **Avoid** **unknown** **height** **pitfalls** **—** **measure** **or** **estimate.**
- **Combine** **with** **memoized** **row** **components.**

---

### Windowing Concepts

**Beginner Level**

**Windowing** **means** **only** **mounting** **visible** **window** **of** **items.**

**Real-time example**: **Dashboard** **log** **viewer** **with** **100k** **lines.**

**Intermediate Level**

**Overscan** **reduces** **flicker** **when** **scrolling** **fast** **at** **cost** **of** **more** **rows** **rendered.**

**Expert Level**

**Bi-directional** **virtualization** **for** **grids** **(`react-virtualized`/`react-window` **variants).**

```typescript
export type WindowParams = { startIndex: number; endIndex: number; itemSize: number; height: number };
```

#### Key Points — Windowing

- **Trade** **memory** **for** **CPU.**
- **Test** **keyboard** **navigation** **and** **a11y.**
- **Sticky** **headers** **need** **special** **handling.**

---

### Pagination vs Virtualization

**Beginner Level**

**Pagination** **loads** **one** **page** **at** **a** **time** **from** **server;** **virtualization** **renders** **a** **subset** **of** **already-loaded** **items** **client-side.**

**Real-time example**: **E-commerce** **—** **server** **pagination** **for** **catalog;** **virtualization** **for** **current** **page’s** **100** **rows.**

**Intermediate Level**

**Infinite** **scroll** **often** **combines** **both:** **virtualize** **current** **items,** **fetch** **next** **page** **near** **end.**

**Expert Level**

**Cursor-based** **pagination** **for** **stable** **ordering** **in** **feeds;** **offset** **pagination** **can** **skip/duplicate** **when** **data** **mutates.**

```typescript
export type Strategy = "pagination" | "virtualization" | "hybrid";

export function pickStrategy(totalRows: number, viewportRows: number): Strategy {
  if (totalRows > 5000) return "hybrid";
  if (totalRows > 200) return "virtualization";
  return "pagination";
}
```

#### Key Points — Pagination vs Virtualization

- **Server** **pagination** **limits** **payload.**
- **Virtualization** **limits** **DOM** **nodes.**
- **Hybrid** **is** **common** **in** **feeds.**

---

### Infinite Scroll

**Beginner Level**

**Load** **more** **when** **user** **nears** **bottom** **(IntersectionObserver).**

**Real-time example**: **Chat** **history** **loading** **older** **messages** **upward** **(reverse** **infinite** **scroll).**

**Intermediate Level**

**Debounce** **requests** **and** **show** **spinners** **without** **layout** **shift.**

**Expert Level**

**Preserve** **scroll** **anchor** **when** **prepended** **items** **—** **tricky** **but** **solved** **by** **libraries** **and** **careful** **scroll** **restoration.**

```tsx
import { useEffect, useRef } from "react";

export function useNearBottom(onNear: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onNear();
      },
      { root: el, threshold: 1 }
    );
    const sentinel = document.createElement("div");
    el.appendChild(sentinel);
    io.observe(sentinel);
    return () => io.disconnect();
  }, [onNear]);
  return ref;
}
```

#### Key Points — Infinite Scroll

- **Works** **well** **with** **virtualization.**
- **Handle** **empty/error/end** **states.**
- **Accessibility:** **provide** **“Load** **more”** **fallback.**

---
## 14.6 State Optimization

### Colocation

**Beginner Level**

**Keep** **state** **as** **close** **as** **possible** **to** **where** **it’s** **used** **so** **fewer** **components** **subscribe.**

**Real-time example**: **Todo** **—** **`editingId`** **in** **the** **list** **container** **or** **row,** **not** **in** **App** **root.**

**Intermediate Level**

**Lifting** **state** **too** **high** **causes** **wide** **rerenders** **and** **harder** **memoization.**

**Expert Level**

**URL** **state** **for** **shareable** **dashboard** **filters** **colocates** **with** **routing** **and** **reduces** **global** **store** **needs.**

```tsx
import { useState } from "react";

export function TodoRow({ id, title }: { id: string; title: string }) {
  const [editing, setEditing] = useState(false);
  return editing ? <input defaultValue={title} onBlur={() => setEditing(false)} /> : <span onClick={() => setEditing(true)}>{title}</span>;
}
```

#### Key Points — Colocation

- **Default** **pattern** **for** **React** **performance** **and** **maintainability.**
- **Revisit** **after** **Profiler** **shows** **hot** **parents.**
- **Combine** **with** **composition.**

---

### Avoiding Unnecessary State

**Beginner Level**

**Don’t** **store** **what** **you** **can** **compute** **from** **props** **or** **other** **state.**

**Real-time example**: **Weather** **—** **don’t** **store** **`celsius`** **and** **`fahrenheit`** **—** **derive** **one** **from** **the** **other.**

**Intermediate Level**

**Avoid** **duplicated** **sources** **of** **truth** **that** **must** **be** **kept** **in** **sync.**

**Expert Level**

**Use** **reducers** **or** **finite** **state** **machines** **when** **multiple** **flags** **encode** **combinations** **that** **should** **be** **impossible.**

```typescript
import { useMemo, useState } from "react";

export function useTemperature(initialC: number) {
  const [celsius, setCelsius] = useState(initialC);
  const fahrenheit = useMemo(() => (celsius * 9) / 5 + 32, [celsius]);
  return { celsius, fahrenheit, setCelsius };
}
```

#### Key Points — Avoiding Unnecessary State

- **Derive** **when** **possible.**
- **Reduce** **invalid** **states.**
- **Simpler** **mental** **model.**

---

### Normalization

**Beginner Level**

**Store** **entities** **by** **`id`** **in** **a** **map** **instead** **of** **deep** **nested** **arrays** **when** **you** **update** **items** **often.**

**Real-time example**: **Social** **`postsById`** **for** **likes** **and** **comments** **without** **rewriting** **whole** **feed** **arrays.**

**Intermediate Level**

**Arrays** **of** **ids** **preserve** **order;** **entities** **map** **stores** **data.**

**Expert Level**

**RTK** **`createEntityAdapter`** **or** **manual** **helpers** **standardize** **CRUD.**

```typescript
export type Normalized<T extends { id: string }> = {
  ids: string[];
  entities: Record<string, T>;
};

export function upsert<T extends { id: string }>(s: Normalized<T>, item: T): Normalized<T> {
  const exists = item.id in s.entities;
  return {
    entities: { ...s.entities, [item.id]: item },
    ids: exists ? s.ids : [...s.ids, item.id],
  };
}
```

#### Key Points — Normalization

- **O(1)** **updates** **by** **id.**
- **Easier** **memoized** **selectors.**
- **Standard** **pattern** **for** **large** **apps.**

---

### Derived State vs Memoization

**Beginner Level**

**Derived** **state** **is** **computed** **from** **other** **state;** **memoization** **caches** **expensive** **derivations.**

**Real-time example**: **E-commerce** **cart** **total** **derived** **from** **lines;** **`useMemo`** **if** **calculation** **is** **heavy.**

**Intermediate Level**

**If** **derivation** **is** **cheap,** **skip** **`useMemo`.**

**Expert Level**

**Push** **derivation** **to** **selectors** **(Redux)** **or** **atoms** **(Jotai)** **for** **centralized** **reuse.**

```typescript
import { useMemo } from "react";

export function useCartTotal(lines: { qty: number; price: number }[]) {
  return useMemo(() => lines.reduce((s, l) => s + l.qty * l.price, 0), [lines]);
}
```

#### Key Points — Derived vs Memoization

- **Derive** **first.**
- **Memoize** **hot** **paths.**
- **Centralize** **in** **stores** **when** **shared.**

---

### Context Performance

**Beginner Level**

**Context** **value** **changes** **re-render** **all** **consumers.** **Split** **contexts** **by** **concern** **(theme** **vs** **session).**

**Real-time example**: **Dashboard** **—** **don’t** **put** **fast-changing** **mouse** **coords** **in** **global** **context.**

**Intermediate Level**

**Memoize** **provider** **value** **with** **`useMemo`** **and** **stable** **callbacks** **with** **`useCallback`.**

**Expert Level**

**Use** **context** **selectors** **libraries** **or** **avoid** **context** **for** **high-frequency** **updates** **(use** **subscriptions** **or** **external** **stores).**

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeCtx = createContext<Theme>("light");
const CountCtx = createContext<number>(0);

export function Providers({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const countValue = useMemo(() => count, [count]);
  return (
    <ThemeCtx.Provider value="light">
      <CountCtx.Provider value={countValue}>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          inc
        </button>
        {children}
      </CountCtx.Provider>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
```

#### Key Points — Context Performance

- **Split** **contexts.**
- **Stable** **values.**
- **Not** **a** **general** **state** **manager** **for** **hot** **updates.**

---

## 14.7 Render Optimization

### Minimizing Re-renders

**Beginner Level**

**Reduce** **state** **scope,** **memoize** **leaves,** **stabilize** **props,** **and** **virtualize** **lists.**

**Real-time example**: **Chat** **—** **don’t** **lift** **draft** **text** **to** **root;** **keep** **in** **composer.**

**Intermediate Level**

**Profile** **to** **see** **which** **parents** **trigger** **cascades.**

**Expert Level**

**Concurrent** **features** **(`startTransition`)** **keep** **input** **responsive** **during** **heavy** **updates.**

```tsx
import { startTransition, useState } from "react";

export function SearchBox({ onQuery }: { onQuery: (q: string) => void }) {
  const [text, setText] = useState("");
  return (
    <input
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        startTransition(() => onQuery(v));
      }}
    />
  );
}
```

#### Key Points — Minimizing Re-renders

- **Attack** **root** **causes** **first.**
- **Leaves** **memo** **second.**
- **Use** **transitions** **for** **non-urgent** **work.**

---

### Preventing Prop Drilling

**Beginner Level**

**Prop** **drilling** **passes** **props** **through** **many** **layers.** **Fix** **with** **composition** **(children),** **context,** **or** **state** **stores.**

**Real-time example**: **E-commerce** **`user`** **passed** **through** **10** **wrappers** **—** **replace** **with** **`UserProvider`** **or** **route** **loader** **data.**

**Intermediate Level**

**Prefer** **composition:** **`Layout`** **accepts** **`slots`** **instead** **of** **threading** **every** **flag.**

**Expert Level**

**Colocate** **data** **fetching** **with** **leaf** **routes** **(Remix/Next)** **to** **avoid** **global** **prop** **chains.**

```tsx
export function PageShell({ sidebar, main }: { sidebar: React.ReactNode; main: React.ReactNode }) {
  return (
    <div className="grid">
      <aside>{sidebar}</aside>
      <section>{main}</section>
    </div>
  );
}
```

#### Key Points — Prop Drilling

- **Composition** **often** **beats** **context.**
- **Context** **for** **truly** **cross-cutting** **data.**
- **Don’t** **over-globalize.**

---

### Composition Patterns

**Beginner Level**

**Pass** **`children`** **or** **render** **props** **to** **avoid** **wrappers** **re-rendering** **unrelated** **content.**

**Real-time example**: **Dashboard** **`Panel`** **with** **`children`** **so** **charts** **don’t** **rerender** **when** **panel** **title** **state** **changes** **if** **structured** **carefully.**

**Intermediate Level**

**“Slot”** **components** **stabilize** **boundaries.**

**Expert Level**

**Compound** **components** **with** **context** **scoped** **to** **subtree** **(Radix-style** **patterns).**

```tsx
import type { ReactNode } from "react";

export function Card({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className="card">
      <header>{header}</header>
      <div>{children}</div>
    </div>
  );
}
```

#### Key Points — Composition Patterns

- **Limit** **rerender** **surface** **area.**
- **Explicit** **slots** **improve** **readability.**
- **Works** **with** **design** **systems.**

---

### Children as Props

**Beginner Level**

**When** **parent** **re-renders,** **`children`** **passed** **from** **outside** **may** **preserve** **referential** **identity** **depending** **on** **how** **created** **—** **understand** **React** **behavior** **to** **avoid** **surprises.**

**Real-time example**: **App** **layout** **`<Layout>{page}</Layout>`** **where** **`page`** **comes** **from** **router.**

**Intermediate Level**

**Inlining** **`children`** **as** **JSX** **inside** **parent** **still** **couples** **renders** **—** **patterns** **matter** **more** **than** **labels.**

**Expert Level**

**Use** **`React.memo`** **on** **expensive** **`children`** **containers** **when** **router** **elements** **are** **stable.**

```tsx
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return <main className="shell">{children}</main>;
}
```

#### Key Points — Children as Props

- **Router** **often** **controls** **child** **elements.**
- **Don’t** **assume** **magic** **—** **measure.**
- **Combine** **with** **route-level** **code** **splitting.**

---

### Bailout

**Beginner Level**

**React** **skips** **child** **reconciliation** **when** **props** **are** **unchanged** **and** **components** **are** **`memo`,** **or** **when** **bailing** **out** **in** **hooks** **that** **support** **it** **(implementation-specific).**

**Real-time example**: **`memo`** **leaf** **doesn’t** **rerender** **if** **props** **stable.**

**Intermediate Level**

**PureComponent/** **`memo`** **+** **stable** **props** **=** **consistent** **bailouts.**

**Expert Level**

**Concurrent** **rendering** **may** **discard** **in-progress** **work** **—** **components** **must** **be** **pure** **(no** **side** **effects** **in** **render).**

```typescript
// Conceptual: memo equals bailout when props equal
export const bailoutCondition = "propsEqual && memoizedComponent";
```

#### Key Points — Bailout

- **Stability** **enables** **bailouts.**
- **Purity** **required** **for** **Concurrent** **features.**
- **Profiler** **validates** **assumptions.**

---

## 14.8 Bundle Optimization

### Size Analysis

**Beginner Level**

**Measure** **bundle** **with** **rollup-plugin-visualizer,** **webpack-bundle-analyzer,** **or** **Vite’s** **build** **report.**

**Real-time example**: **Discover** **that** **moment.js** **dominates** **dashboard** **chunk** **—** **switch** **to** **dayjs/date-fns.**

**Intermediate Level**

**Track** **gzip** **and** **brotli** **sizes** **separately.**

**Expert Level**

**Set** **CI** **budgets** **per** **chunk** **and** **fail** **builds** **on** **regressions.**

```json
{
  "name": "bundle-budget",
  "budgets": [{ "type": "initial", "maximumWarning": "250kb", "maximumError": "400kb" }]
}
```

#### Key Points — Size Analysis

- **Analyze** **before** **optimizing** **imports.**
- **Track** **over** **time.**
- **Per-route** **chunks** **matter.**

---

### Tree Shaking

**Beginner Level**

**ESM** **`import { x } from "lib"`** **allows** **bundlers** **to** **drop** **unused** **exports** **if** **`lib`** **is** **side-effect** **free.**

**Real-time example**: **Import** **`lodash-es`** **per-function** **instead** **of** **whole** **`lodash`.**

**Intermediate Level**

**`sideEffects: false`** **in** **`package.json`** **helps** **but** **must** **be** **truthful.**

**Expert Level**

**Barrel** **files** **can** **accidentally** **import** **entire** **modules** **—** **use** **direct** **imports** **or** **optimize** **barrels.**

```typescript
import debounce from "lodash-es/debounce";
export const debouncedSearch = debounce((q: string) => fetch(`/api/search?q=${q}`), 300);
```

#### Key Points — Tree Shaking

- **Prefer** **ESM.**
- **Avoid** **wildcard** **imports** **from** **huge** **libs.**
- **Verify** **with** **analyzer.**

---

### Dead Code

**Beginner Level**

**Remove** **unused** **exports,** **feature** **flags** **for** **old** **paths,** **and** **unreferenced** **assets.**

**Real-time example**: **Social** **legacy** **emoji** **picker** **still** **linked** **in** **bundle** **—** **delete** **route.**

**Intermediate Level**

**TypeScript** **`noUnusedLocals`** **helps** **locally;** **coverage** **tools** **for** **runtime** **paths.**

**Expert Level**

**Periodic** **dependency** **audits** **(`depcheck`)** **to** **remove** **unused** **packages.**

```typescript
// Dead code example: unreachable feature
export function legacyCheckout() {
  return null; // remove route + imports in real cleanup
}
```

#### Key Points — Dead Code

- **Delete** **unused** **features** **aggressively.**
- **Automate** **detection** **where** **possible.**
- **Smaller** **surface** **=** **fewer** **bugs.**

---

### Import Optimization

**Beginner Level**

**Import** **only** **what** **you** **need;** **avoid** **default** **imports** **of** **heavy** **modules** **unless** **tree-shaken.**

**Real-time example**: **Icon** **libraries** **—** **import** **single** **icons** **or** **use** **SVGR** **per** **icon.**

**Intermediate Level**

**Pre-bundle** **dependencies** **with** **`optimizeDeps`** **in** **Vite** **for** **dev** **speed** **—** **different** **from** **prod** **size** **but** **related.**

**Expert Level**

**Server** **components** **(Next)** **can** **move** **some** **logic** **server-side** **—** **shrinks** **client** **JS.**

```typescript
import { format } from "date-fns/format";
export function fmtDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}
```

#### Key Points — Import Optimization

- **Per-path** **imports** **win** **for** **large** **libs.**
- **Audit** **icon** **and** **chart** **libraries.**
- **Measure** **after** **changes.**

---

### Dynamic Imports for Routes

**Beginner Level**

**Each** **route** **`import()`** **creates** **async** **chunks** **loaded** **on** **navigation.**

**Real-time example**: **Admin** **routes** **not** **needed** **for** **shoppers.**

**Intermediate Level**

**Prefetch** **on** **link** **hover** **in** **framework** **routers** **(Next.js** **`<Link`**,** **etc.).**

**Expert Level**

**Analyze** **critical** **path** **—** **sometimes** **inline** **tiny** **routes** **to** **avoid** **waterfall.**

```tsx
import { lazy } from "react";

export const Admin = lazy(() => import("./routes/Admin"));
```

#### Key Points — Dynamic Imports (Routes)

- **Big** **win** **for** **large** **apps.**
- **Balance** **with** **waterfall** **risk.**
- **Prefetch** **likely** **paths.**

---

### Webpack Analyzer (and equivalents)

**Beginner Level**

**Visual** **graphs** **show** **which** **modules** **inflate** **chunks.**

**Real-time example**: **Duplicate** **`react`** **versions** **in** **monorepo** **—** **dedupe** **with** **resolutions.**

**Intermediate Level**

**Compare** **main** **vs** **async** **chunks** **separately.**

**Expert Level**

**Integrate** **into** **CI** **with** **static** **HTML** **artifacts** **on** **PRs.**

```text
# Typical workflow (webpack)
ANALYZE=true npm run build
# opens treemap in browser
```

#### Key Points — Webpack Analyzer

- **Works** **for** **webpack;** **Vite** **has** **visualizer** **plugins** **too.**
- **Find** **duplicates** **and** **accidental** **imports.**
- **Share** **reports** **in** **PRs.**

---

## 14.9 React 18+ Performance

### Automatic Batching

**Beginner Level**

**React** **18** **batches** **multiple** **`setState`** **calls** **in** **async** **handlers,** **timeouts,** **and** **promises** **into** **one** **render** **(in** **many** **cases).**

**Real-time example**: **Dashboard** **two** **state** **updates** **after** **`await`** **don’t** **double** **paint** **like** **React** **17** **in** **some** **setups.**

**Intermediate Level**

**Use** **`flushSync`** **when** **you** **need** **synchronous** **DOM** **reads** **after** **mutations** **(rare).**

**Expert Level**

**Understand** **batching** **with** **Concurrent** **rendering** **and** **transitions** **—** **urgent** **vs** **non-urgent** **updates** **interleave** **differently.**

```tsx
import { useState } from "react";

export function BatchDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  return (
    <button
      type="button"
      onClick={async () => {
        await Promise.resolve();
        setA((x) => x + 1);
        setB((x) => x + 1);
      }}
    >
      a={a} b={b}
    </button>
  );
}
```

#### Key Points — Automatic Batching

- **Fewer** **renders** **for** **async** **flows.**
- **`flushSync`** **escape** **hatch.**
- **Test** **across** **React** **versions** **when** **upgrading.**

---

### useTransition

**Beginner Level**

**`const [isPending, startTransition] = useTransition()`** **marks** **updates** **inside** **`startTransition`** **as** **non-urgent** **so** **input** **stays** **snappy.**

**Real-time example**: **E-commerce** **search** **—** **update** **text** **input** **immediately,** **filter** **heavy** **list** **in** **transition.**

**Intermediate Level**

**Show** **pending** **UI** **with** **`isPending`.**

**Expert Level**

**Combine** **with** **Suspense** **for** **data** **that** **loads** **during** **transition** **(patterns** **vary** **by** **data** **library).**

```tsx
import { useState, useTransition } from "react";

export function HeavyFilter({ items }: { items: string[] }) {
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          startTransition(() => setQ(v));
        }}
      />
      {isPending ? <span>Updating…</span> : null}
      <ul>
        {items.filter((x) => x.includes(q)).map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </>
  );
}
```

#### Key Points — useTransition

- **Keeps** **UX** **responsive.**
- **Great** **for** **large** **lists** **and** **trees.**
- **Not** **a** **substitute** **for** **virtualization.**

---

### useDeferredValue

**Beginner Level**

**`useDeferredValue(value)`** **returns** **a** **lagging** **version** **of** **`value`** **so** **expensive** **children** **can** **render** **behind** **the** **latest** **input.**

**Real-time example**: **Social** **graph** **visualization** **updates** **deferred** **while** **search** **box** **feels** **instant.**

**Intermediate Level**

**Pair** **with** **`memo`** **on** **deferred** **child** **props.**

**Expert Level**

**Different** **tradeoff** **than** **`useTransition`** **—** **often** **for** **child** **lag** **without** **explicit** **`startTransition`** **in** **parent** **handlers.**

```tsx
import { useDeferredValue, memo } from "react";

const Chart = memo(function Chart({ q }: { q: string }) {
  return <div aria-busy="true">Expensive chart for {q}</div>;
});

export function Dashboard({ query }: { query: string }) {
  const deferred = useDeferredValue(query);
  return <Chart q={deferred} />;
}
```

#### Key Points — useDeferredValue

- **Smooths** **expensive** **renders.**
- **Shows** **stale** **UI** **briefly** **—** **acceptable** **for** **some** **UX.**
- **Combine** **with** **`memo`.**

---

### Concurrent Rendering

**Beginner Level**

**React** **can** **interrupt,** **resume,** **and** **discard** **renders** **to** **keep** **high-priority** **updates** **fast.**

**Real-time example**: **Chat** **typing** **while** **a** **large** **list** **update** **is** **in** **progress.**

**Intermediate Level**

**Rendering** **must** **remain** **pure** **—** **no** **side** **effects** **in** **render.**

**Expert Level**

**Libraries** **must** **respect** **Strict** **Mode** **double** **invocations** **and** **abort** **in-flight** **requests** **when** **inputs** **change.**

```typescript
export const concurrentRule = "pure render + cancellable effects + transitions for heavy work";
```

#### Key Points — Concurrent Rendering

- **Enables** **better** **UX** **under** **load.**
- **Requires** **pure** **components.**
- **Test** **with** **Strict** **Mode.**

---

### Suspense for Data (patterns)

**Beginner Level**

**`<Suspense`** **fallback=...>`** **shows** **loading** **UI** **while** **children** **“suspend”** **(React** **Query/SWR/Next** **patterns).**

**Real-time example**: **Weather** **dashboard** **card** **suspends** **until** **forecast** **fetch** **completes** **(with** **compatible** **library).**

**Intermediate Level**

**Nest** **multiple** **boundaries** **for** **granular** **loading** **states.**

**Expert Level**

**Error** **boundaries** **pair** **with** **Suspense** **for** **robust** **data** **UI** **(see** **React** **docs** **and** **framework** **guides).**

```tsx
import { Suspense } from "react";
import { ForecastCard } from "./ForecastCard";

export function WeatherPage({ city }: { city: string }) {
  return (
    <Suspense fallback={<div>Loading forecast…</div>}>
      <ForecastCard city={city} />
    </Suspense>
  );
}
```

#### Key Points — Suspense for Data

- **Improves** **perceived** **performance** **with** **streaming** **(framework-dependent).**
- **Coordinate** **with** **cache** **libraries.**
- **Always** **handle** **errors.**

---

## Key Points (Chapter Summary)

- **Profile** **before** **optimizing;** **target** **render,** **commit,** **network,** **and** **bundle** **separately.**
- **`memo`,** **`useMemo`,** **`useCallback`** **help** **only** **with** **stable** **inputs** **and** **measured** **hotspots.**
- **Split** **components,** **colocate** **state,** **and** **virtualize** **long** **lists.**
- **Normalize** **entities** **for** **large** **dashboards** **and** **feeds.**
- **Optimize** **bundles** **with** **analysis,** **tree-shaking,** **and** **route** **splits.**
- **React** **18** **features** **(batching,** **transitions,** **deferred** **values,** **Concurrent** **rendering)** **improve** **UX** **under** **load** **when** **used** **correctly.**

---

## Best Practices (Global)

- **Establish** **performance** **budgets** **and** **track** **web-vitals** **in** **production.**
- **Prefer** **simple** **code** **until** **Profiler** **proves** **otherwise.**
- **Virtualize** **large** **lists;** **paginate** **remote** **data.**
- **Split** **routes** **and** **heavy** **features** **with** **`lazy`/`import()`.**
- **Split** **context** **and** **avoid** **high-frequency** **values** **in** **global** **context.**
- **Keep** **render** **pure;** **put** **side** **effects** **in** **`useEffect`/event** **handlers.**

---

## Common Mistakes to Avoid

- **Memoizing** **every** **component** **without** **measuring** **—** **adds** **complexity** **and** **sometimes** **slows** **things** **down.**
- **Broken** **dependency** **arrays** **causing** **stale** **UI** **or** **excessive** **recomputation.**
- **Passing** **inline** **objects/functions** **to** **`memo`** **children.**
- **Using** **context** **for** **rapidly** **changing** **values** **without** **splitting** **providers.**
- **Skipping** **virtualization** **on** **multi-thousand-row** **tables.**
- **Ignoring** **bundle** **size** **until** **late** **—** **fixing** **architecture** **is** **harder** **then.**
- **Assuming** **`useMemo`** **guarantees** **a** **single** **computation** **in** **all** **future** **React** **versions** **for** **semantic** **correctness** **—** **it’s** **an** **optimization** **hint.**

---
