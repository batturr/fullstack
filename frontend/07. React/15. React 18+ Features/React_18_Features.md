# React 18+ Features (React + TypeScript)

**React** **18** **introduces** **concurrent** **rendering,** **automatic** **batching,** **transitions,** **deferred** **values,** **new** **hooks** **(`useId`,** **`useSyncExternalStore`,** **`useInsertionEffect`),** **and** **stronger** **Suspense** **patterns** **for** **data** **and** **streaming.** **These** **features** **help** **e-commerce** **search,** **social** **feeds,** **dashboards,** **todo** **apps,** **weather** **widgets,** **and** **chat** **UIs** **stay** **responsive** **under** **load** **when** **used** **with** **TypeScript** **types** **for** **props** **and** **external** **stores.**

---

## 📑 Table of Contents

- [React 18+ Features (React + TypeScript)](#react-18-features-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [15.1 Concurrent Features](#151-concurrent-features)
  - [15.2 Transitions](#152-transitions)
  - [15.3 Deferred Values](#153-deferred-values)
  - [15.4 Suspense Enhancements](#154-suspense-enhancements)
  - [15.5 useId Hook](#155-useid-hook)
  - [15.6 useSyncExternalStore](#156-usesyncexternalstore)
  - [15.7 useInsertionEffect](#157-useinsertioneffect)
  - [15.8 Automatic Batching](#158-automatic-batching)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 15.1 Concurrent Features

### Concurrent Rendering Basics

**Beginner Level**

**Concurrent** **Rendering** **allows** **React** **to** **prepare** **multiple** **versions** **of** **the** **UI,** **interrupt** **low-priority** **work,** **and** **resume** **later** **so** **urgent** **inputs** **(typing,** **clicking)** **stay** **fast.**

**Real-time example**: **Chat** **app** **—** **sending** **a** **message** **updates** **the** **input** **immediately** **while** **a** **heavy** **thread** **re-sort** **happens** **in** **the** **background.**

**Intermediate Level**

**React** **schedules** **updates** **by** **priority.** **Transitions** **and** **`useDeferredValue`** **mark** **work** **as** **non-urgent** **so** **concurrent** **features** **can** **help.**

**Expert Level**

**Rendering** **must** **remain** **pure:** **no** **side** **effects** **in** **render,** **no** **mutations** **of** **external** **systems** **without** **effects.** **This** **allows** **React** **to** **discard** **in-progress** **renders** **safely.**

```typescript
export type ReactPriority = "user-blocking" | "normal" | "low";

// Conceptual: urgent vs non-urgent updates
export declare function scheduleUpdate(priority: ReactPriority, fn: () => void): void;
```

#### Key Points — Concurrent Rendering Basics

- **Enables** **interruptible** **work** **and** **better** **UX** **under** **load.**
- **Requires** **pure** **render** **functions.**
- **Pairs** **with** **transitions** **and** **Suspense.**

---

### createRoot

**Beginner Level**

**React** **18** **uses** **`createRoot(domNode)`** **from** **`react-dom/client`** **instead** **of** **`ReactDOM.render`.** **This** **opts** **into** **the** **new** **Concurrent** **Root** **API.**

**Real-time example**: **Todo** **SPA** **bootstraps** **with** **`createRoot(document.getElementById("root")!).render(<App />)`.**

**Intermediate Level**

**`hydrateRoot`** **is** **the** **SSR** **counterpart** **for** **hydrating** **server-rendered** **HTML.**

**Expert Level**

**Feature** **detection** **and** **gradual** **migration** **from** **legacy** **`render`** **should** **follow** **official** **upgrade** **guides.**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("Root element missing");

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

#### Key Points — createRoot

- **Required** **for** **React** **18** **concurrent** **features.**
- **Use** **`hydrateRoot`** **for** **SSR** **hydration.**
- **Test** **with** **`StrictMode`** **during** **development.**

---

### Concurrent vs Legacy Root

**Beginner Level**

**Legacy** **`ReactDOM.render`** **uses** **the** **Legacy** **Root** **and** **does** **not** **enable** **Concurrent** **Rendering** **features** **fully.**

**Real-time example**: **E-commerce** **site** **upgrading** **from** **React** **17** **switches** **`render`** **→** **`createRoot`** **as** **a** **first** **step.**

**Intermediate Level**

**Some** **behaviors** **change** **(automatic** **batching** **scope,** **Strict** **Mode** **effects)** **—** **read** **the** **migration** **guide.**

**Expert Level**

**Libraries** **that** **patch** **DOM** **imperatively** **may** **need** **audits** **when** **Concurrent** **Rendering** **re-runs** **effects** **or** **replays** **renders** **in** **development.**

```typescript
export type RootMode = "legacy" | "concurrent";

export function describeRoot(mode: RootMode): string {
  return mode === "concurrent"
    ? "createRoot / hydrateRoot — full React 18 concurrent features"
    : "legacy render — limited concurrent behavior";
}
```

#### Key Points — Concurrent vs Legacy

- **Migrate** **to** **`createRoot`** **for** **new** **features.**
- **Expect** **dev** **Strict** **Mode** **double** **invocations.**
- **Validate** **third-party** **DOM** **libraries.**

---

### Interruptible Rendering

**Beginner Level**

**React** **can** **pause** **a** **long** **render** **to** **handle** **a** **new** **urgent** **update** **(e.g.,** **user** **typed** **another** **character)** **and** **resume** **or** **discard** **later** **work.**

**Real-time example**: **Dashboard** **filtering** **a** **large** **chart** **—** **typing** **in** **the** **search** **box** **interrupts** **an** **in-progress** **expensive** **chart** **render.**

**Intermediate Level**

**This** **is** **why** **render** **must** **be** **idempotent** **and** **free** **of** **side** **effects.**

**Expert Level**

**Pair** **with** **`useTransition`** **or** **`useDeferredValue`** **to** **explicitly** **mark** **non-urgent** **updates.**

```tsx
import { startTransition, useState } from "react";

export function InterruptibleSearch({ items }: { items: string[] }) {
  const [text, setText] = useState("");
  const [filtered, setFiltered] = useState(items);

  return (
    <input
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        startTransition(() => {
          setFiltered(items.filter((x) => x.toLowerCase().includes(v.toLowerCase())));
        });
      }}
    />
  );
}
```

#### Key Points — Interruptible Rendering

- **Improves** **responsiveness.**
- **Demands** **pure** **rendering.**
- **Use** **transitions** **for** **heavy** **work.**

---

## 15.2 Transitions

### useTransition

**Beginner Level**

**`const [isPending, startTransition] = useTransition()`** **marks** **state** **updates** **inside** **`startTransition`** **as** **non-urgent.** **`isPending`** **is** **`true`** **while** **the** **transition** **is** **pending.**

**Real-time example**: **Social** **feed** **tab** **switch** **—** **show** **a** **spinner** **while** **non-urgent** **list** **swap** **finishes.**

**Intermediate Level**

**Transitions** **are** **for** **updates** **that** **can** **lag** **slightly** **behind** **user** **input** **that** **must** **feel** **instant.**

**Expert Level**

**Don’t** **wrap** **every** **update** **—** **only** **those** **that** **cause** **expensive** **renders** **or** **suspense** **boundaries.**

```tsx
import { useState, useTransition } from "react";

export function TabPanel({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <nav>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => startTransition(() => setActive(t.id))}
            aria-current={active === t.id}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {isPending ? <p>Loading…</p> : null}
      <div>{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
```

#### Key Points — useTransition

- **Keeps** **UI** **responsive.**
- **Expose** **pending** **state** **for** **UX.**
- **Use** **for** **heavy** **UI** **updates.**

---

### startTransition

**Beginner Level**

**`startTransition(() => { setState(...) })`** **schedules** **the** **enclosed** **updates** **as** **a** **transition** **without** **needing** **`useTransition`** **hook** **(e.g.,** **in** **class** **code** **or** **non-component** **modules** **with** **care).**

**Real-time example**: **Weather** **—** **after** **`fetch`**,** **update** **large** **forecast** **table** **inside** **`startTransition`** **so** **map** **controls** **stay** **snappy.**

**Intermediate Level**

**Import** **`startTransition`** **from** **`react`** **directly.**

**Expert Level**

**Don’t** **wrap** **updates** **that** **must** **commit** **synchronously** **for** **accessibility** **(e.g.,** **focus** **management)** **without** **testing.**

```tsx
import { startTransition, useState } from "react";

export function applyRemoteFilter(next: string, setQuery: (q: string) => void) {
  startTransition(() => setQuery(next));
}
```

#### Key Points — startTransition

- **Works** **outside** **hook** **component** **bodies** **when** **imported** **from** **`react`.**
- **Marks** **updates** **as** **low** **priority.**
- **Combine** **with** **user** **input** **that** **updates** **urgently** **separately.**

---

### isPending

**Beginner Level**

**`isPending`** **from** **`useTransition`** **signals** **that** **a** **transition** **is** **in** **flight** **—** **use** **for** **inline** **spinners** **or** **dim** **content.**

**Real-time example**: **E-commerce** **product** **grid** **dims** **while** **filters** **reapply.**

**Intermediate Level**

**`isPending`** **may** **be** **`true`** **for** **brief** **periods** **—** **avoid** **flashing** **too** **aggressively** **(debounce** **or** **CSS** **transitions).**

**Expert Level**

**For** **data** **fetching,** **prefer** **library** **pending** **states** **+** **Suspense** **fallbacks** **for** **coherent** **loading** **UX.**

```tsx
import { useTransition, useState } from "react";

export function PendingIndicator({ items }: { items: string[] }) {
  const [q, setQ] = useState("");
  const [filtered, setFiltered] = useState(items);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input
        value={q}
        onChange={(e) => {
          const v = e.target.value;
          setQ(v);
          startTransition(() => setFiltered(items.filter((x) => x.includes(v))));
        }}
      />
      {isPending ? <span aria-busy="true">Updating…</span> : null}
      <ul>
        {filtered.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </>
  );
}
```

#### Key Points — isPending

- **Improves** **perceived** **performance** **feedback.**
- **Combine** **with** **accessible** **busy** **states.**
- **Don’t** **overuse** **tiny** **spinners.**

---

### Marking Updates (urgent vs non-urgent)

**Beginner Level**

**Urgent** **updates** **reflect** **direct** **user** **input** **(text** **field,** **radio)** **—** **apply** **immediately** **`setState`.** **Non-urgent** **updates** **(filtering** **huge** **lists)** **go** **in** **`startTransition`.**

**Real-time example**: **Chat** **—** **message** **draft** **text** **is** **urgent;** **rebuilding** **mention** **autocomplete** **list** **can** **be** **non-urgent.**

**Intermediate Level**

**Separating** **concerns** **reduces** **jank** **more** **than** **`memo`** **alone.**

**Expert Level**

**Measure** **INP** **and** **frame** **drops** **to** **validate** **which** **updates** **should** **be** **transitions.**

```tsx
import { useState, startTransition } from "react";

export function SplitUrgency() {
  const [text, setText] = useState("");
  const [heavy, setHeavy] = useState<string[]>([]);

  return (
    <input
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v); // urgent
        startTransition(() => {
          setHeavy(Array.from({ length: 5000 }, (_, i) => `${v}-${i}`)); // non-urgent demo
        });
      }}
    />
  );
}
```

#### Key Points — Marking Updates

- **Keep** **input** **instant.**
- **Defer** **expensive** **derived** **UI.**
- **Validate** **with** **profiling.**

---

### Urgent vs Non-urgent (summary pattern)

**Beginner Level**

**If** **the** **user** **waits** **on** **it** **for** **direct** **manipulation,** **it’s** **urgent.** **If** **it’s** **a** **consequence** **of** **that** **input,** **it** **may** **be** **non-urgent.**

**Real-time example**: **Dashboard** **date** **picker** **selection** **is** **urgent;** **recomputing** **all** **charts** **can** **be** **a** **transition.**

**Intermediate Level**

**Combine** **with** **Suspense** **for** **data** **that** **loads** **asynchronously** **during** **navigation** **(framework-specific).**

**Expert Level**

**Server** **Components** **and** **streaming** **change** **where** **work** **happens** **—** **coordinate** **with** **Next** **Remix** **patterns.**

```typescript
export type UpdateClass = "urgent" | "transition";

export function classifyUpdate(kind: "input" | "derived" | "route"): UpdateClass {
  if (kind === "input") return "urgent";
  return "transition";
}
```

#### Key Points — Urgent vs Non-urgent

- **User** **latency** **first.**
- **Batch** **heavy** **work** **as** **transitions.**
- **Align** **with** **framework** **data** **loading.**

---

## 15.3 Deferred Values

### useDeferredValue

**Beginner Level**

**`const deferred = useDeferredValue(value)`** **returns** **a** **version** **of** **`value`** **that** **may** **lag** **behind** **the** **latest** **`value`** **during** **concurrent** **rendering** **so** **expensive** **children** **can** **update** **less** **aggressively.**

**Real-time example**: **Social** **graph** **search** **—** **input** **shows** **immediate** **text**,** **deferred** **prop** **feeds** **heavy** **visualization.**

**Intermediate Level**

**Pair** **with** **`React.memo`** **on** **children** **so** **they** **skip** **renders** **when** **deferred** **value** **unchanged.**

**Expert Level**

**Not** **a** **debounce** **timer** **—** **it’s** **cooperative** **scheduling** **with** **React’s** **renderer.**

```tsx
import { useDeferredValue, useState, memo } from "react";

const Heavy = memo(function Heavy({ q }: { q: string }) {
  return <div>{/* expensive visualization */}Searching: {q}</div>;
});

export function SearchPage() {
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <Heavy q={deferred} />
    </>
  );
}
```

#### Key Points — useDeferredValue

- **Smooths** **expensive** **child** **updates.**
- **Combine** **with** **`memo`.**
- **Different** **semantics** **than** **`useTransition`.**

---

### Deferring Expensive Renders

**Beginner Level**

**Pass** **deferred** **values** **into** **slow** **components** **so** **fast** **UI** **(inputs)** **doesn’t** **wait** **for** **them** **each** **keystroke.**

**Real-time example**: **E-commerce** **facet** **counts** **recompute** **in** **a** **deferred** **tree** **while** **checkbox** **responds** **instantly.**

**Intermediate Level**

**Show** **staleness** **indicators** **(optional)** **when** **`deferred !== value`.**

**Expert Level**

**For** **server** **data,** **prefer** **React** **Query** **or** **framework** **caching** **—** **`useDeferredValue`** **is** **for** **render** **cost,** **not** **network** **latency.**

```tsx
import { useDeferredValue } from "react";

export function StaleIndicator({ value }: { value: string }) {
  const deferred = useDeferredValue(value);
  const isStale = deferred !== value;
  return isStale ? <span aria-live="polite">Updating results…</span> : null;
}
```

#### Key Points — Deferring Expensive Renders

- **Target** **CPU-heavy** **React** **trees.**
- **Optional** **staleness** **UI.**
- **Don’t** **confuse** **with** **network** **loading.**

---

### useDeferredValue vs useTransition

**Beginner Level**

**`useTransition`** **wraps** **state** **setters** **you** **control** **in** **an** **event** **handler.** **`useDeferredValue`** **wraps** **a** **value** **propagating** **into** **children** **without** **changing** **how** **you** **set** **state.**

**Real-time example**: **Weather** **—** **`useTransition`** **for** **branching** **state** **updates** **after** **`fetch`;** **`useDeferredValue`** **for** **passing** **`city`** **into** **expensive** **child.**

**Intermediate Level**

**Often** **used** **together** **—** **both** **can** **appear** **in** **the** **same** **screen.**

**Expert Level**

**Pick** **based** **on** **where** **the** **expensive** **work** **lives:** **handler-driven** **updates** **vs** **value** **flow** **into** **memoized** **children.**

```typescript
import type { Dispatch, SetStateAction } from "react";

export function transitionVsDeferred<T>(
  mode: "transition",
  set: Dispatch<SetStateAction<T>>,
  next: T
): void;
export function transitionVsDeferred<T>(mode: "deferred", value: T): T;
export function transitionVsDeferred<T>(mode: "transition" | "deferred", a: unknown, b?: T): unknown {
  return mode === "deferred" ? a : undefined;
}
```

#### Key Points — vs useTransition

- **Different** **API** **surfaces** **for** **different** **control** **points.**
- **Can** **complement** **each** **other.**
- **Profile** **which** **fits** **your** **tree.**

---

## 15.4 Suspense Enhancements

### Data Fetching with Suspense

**Beginner Level**

**When** **a** **component** **“suspends”** **(throws** **a** **promise** **per** **React’s** **data** **Suspense** **contract),** **the** **nearest** **`<Suspense`** **boundary** **shows** **`fallback`** **until** **data** **resolves.**

**Real-time example**: **Dashboard** **widget** **loads** **KPI** **JSON** **with** **a** **library** **that** **supports** **Suspense** **(implementation-specific).**

**Intermediate Level**

**Use** **libraries** **that** **integrate** **with** **Suspense** **correctly** **(React** **Query** **with** **`useSuspenseQuery`,** **etc.).**

**Expert Level**

**Server** **Components** **and** **streaming** **change** **where** **suspension** **occurs** **—** **follow** **Next.js** **App** **Router** **docs.**

```tsx
import { Suspense } from "react";

function Kpi({ value }: { value: Promise<{ k: number }> }) {
  // Pseudo: real Suspense data patterns depend on library/framework
  return null;
}

export function KpiCard(props: { value: Promise<{ k: number }> }) {
  return (
    <Suspense fallback={<div aria-busy="true">Loading KPI…</div>}>
      <Kpi {...props} />
    </Suspense>
  );
}
```

#### Key Points — Data Fetching

- **Requires** **compatible** **data** **libraries.**
- **Nest** **boundaries** **for** **granular** **loading.**
- **Pair** **with** **error** **handling.**

---

### Suspense Boundaries

**Beginner Level**

**Place** **`<Suspense`** **around** **components** **that** **may** **suspend** **so** **the** **rest** **of** **the** **page** **remains** **interactive.**

**Real-time example**: **E-commerce** **PDP** **—** **skeleton** **for** **recommendations** **while** **product** **details** **already** **visible.**

**Intermediate Level**

**Too** **few** **boundaries** **→** **big** **fallbacks;** **too** **many** **→** **layout** **shift** **noise** **—** **balance** **with** **design.**

**Expert Level**

**Streaming** **HTML** **sends** **fallback** **shells** **first** **—** **align** **with** **SSR** **framework.**

```tsx
import { Suspense } from "react";

export function ProductPage() {
  return (
    <div>
      <Suspense fallback={<div>Product skeleton…</div>}>
        <ProductDetails />
      </Suspense>
      <Suspense fallback={<div>Recommendations…</div>}>
        <Recommendations />
      </Suspense>
    </div>
  );
}
```

#### Key Points — Boundaries

- **Granular** **loading** **UX.**
- **Avoid** **one** **giant** **page** **spinner** **when** **possible.**
- **Coordinate** **with** **layout** **stability.**

---

### Multiple Suspense Boundaries

**Beginner Level**

**Nest** **multiple** **`Suspense`** **nodes** **to** **load** **sections** **independently.**

**Real-time example**: **Social** **profile** **—** **header** **fast,** **tabs** **lazy** **with** **their** **own** **fallbacks.**

**Intermediate Level**

**Order** **of** **resolution** **can** **create** **visual** **cascades** **—** **use** **skeleton** **design** **systems.**

**Expert Level**

**Streaming** **protocols** **may** **flush** **sections** **as** **they** **ready** **—** **match** **fallback** **height** **to** **reduce** **CLS.**

```tsx
import { Suspense } from "react";

export function Profile() {
  return (
    <>
      <Suspense fallback={<header className="skeleton">…</header>}>
        <ProfileHeader />
      </Suspense>
      <Suspense fallback={<div className="skeleton">Posts…</div>}>
        <Posts />
      </Suspense>
    </>
  );
}
```

#### Key Points — Multiple Suspense

- **Parallel** **loading** **perception.**
- **Design** **consistent** **skeletons.**
- **Watch** **CLS** **metrics.**

---

### With React Query / SWR

**Beginner Level**

**TanStack** **Query** **`useSuspenseQuery`** **and** **SWR** **suspense** **modes** **integrate** **with** **Suspense** **boundaries** **for** **declarative** **loading** **UI.**

**Real-time example**: **Todo** **list** **suspends** **while** **tasks** **load** **from** **`/api/todos`.**

**Intermediate Level**

**Still** **need** **error** **boundaries** **+** **`QueryErrorResetBoundary`** **or** **equivalents** **for** **retries.**

**Expert Level**

**Prefetch** **on** **hover** **or** **route** **intent** **to** **avoid** **suspense** **spinner** **on** **every** **visit.**

```tsx
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

const qc = new QueryClient();

type Todo = { id: string; title: string };

function TodoList() {
  const { data } = useSuspenseQuery({
    queryKey: ["todos"],
    queryFn: async (): Promise<Todo[]> => {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
  return (
    <ul>
      {data.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <Suspense fallback={<div>Loading todos…</div>}>
        <TodoList />
      </Suspense>
    </QueryClientProvider>
  );
}
```

#### Key Points — React Query / SWR

- **Standard** **patterns** **for** **server** **state.**
- **Combine** **Suspense** **+** **Error** **Boundaries.**
- **Prefetch** **for** **instant** **UX.**

---

### Error Boundaries with Suspense

**Beginner Level**

**Suspense** **handles** **loading;** **Error** **Boundaries** **catch** **render** **errors** **including** **failed** **suspending** **data** **loads** **(depending** **on** **library).**

**Real-time example**: **Weather** **card** **shows** **fallback** **“Unable** **to** **load** **forecast”** **without** **crashing** **the** **whole** **dashboard.**

**Intermediate Level**

**Reset** **keys** **on** **retry** **to** **remount** **subtrees.**

**Expert Level**

**Log** **errors** **to** **observability** **with** **`onError`** **and** **correlation** **ids.**

```tsx
import { Component, type ErrorInfo, type ReactNode, Suspense } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { err: Error | null }
> {
  state = { err: null as Error | null };

  static getDerivedStateFromError(err: Error) {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error(err, info);
  }

  render() {
    if (this.state.err) return this.props.fallback;
    return this.props.children;
  }
}

export function SafePanel({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <Suspense fallback={<div>Loading…</div>}>{children}</Suspense>
    </ErrorBoundary>
  );
}
```

#### Key Points — Error Boundaries

- **Pair** **with** **Suspense** **for** **robust** **data** **UI.**
- **Provide** **retry** **UX.**
- **Log** **errors** **in** **production.**

---

## 15.5 useId Hook

### Basics

**Beginner Level**

**`const id = useId()`** **returns** **a** **stable** **unique** **string** **id** **for** **the** **lifetime** **of** **the** **component** **instance.**

**Real-time example**: **Link** **`label`** **to** **`input`** **with** **`htmlFor`/`id`.**

**Intermediate Level**

**Ids** **are** **unique** **across** **the** **component** **tree** **and** **work** **with** **SSR** **hydration.**

**Expert Level**

**Prefix** **with** **static** **strings** **for** **multiple** **ids** **per** **component** (`${id}-name`).**

```tsx
import { useId } from "react";

export function EmailField() {
  const id = useId();
  return (
    <div>
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} type="email" autoComplete="email" />
    </div>
  );
}
```

#### Key Points — Basics

- **Prefer** **over** **manual** **increment** **counters.**
- **Stable** **per** **mount.**
- **Compose** **with** **suffixes.**

---

### Generating Unique IDs

**Beginner Level**

**Use** **`useId`** **whenever** **you** **need** **DOM** **ids** **for** **a11y** **associations** **(label,** **description,** **error).**

**Real-time example**: **E-commerce** **checkout** **field** **errors** **linked** **via** **`aria-describedby`.**

**Intermediate Level**

**Don’t** **use** **`Math.random()`** **in** **render** **—** **breaks** **SSR** **and** **causes** **mismatches.**

**Expert Level**

**For** **lists,** **combine** **`useId`** **with** **row** **keys** **or** **entity** **ids** **from** **data** **when** **appropriate.**

```tsx
import { useId } from "react";

export function FieldError({ message }: { message: string | null }) {
  const id = useId();
  const errId = message ? `${id}-err` : undefined;
  return (
    <>
      <input aria-invalid={!!message} aria-describedby={errId} />
      {message ? (
        <p id={errId} role="alert">
          {message}
        </p>
      ) : null}
    </>
  );
}
```

#### Key Points — Unique IDs

- **SSR-safe.**
- **No** **random** **in** **render.**
- **Great** **for** **a11y** **relationships.**

---

### SSR-safe IDs

**Beginner Level**

**Server** **and** **client** **must** **generate** **matching** **ids** **on** **hydrate** **—** **`useId`** **is** **designed** **for** **this.**

**Real-time example**: **Dashboard** **form** **hydrates** **without** **`id`** **mismatch** **warnings.**

**Intermediate Level**

**Avoid** **incrementing** **global** **counters** **in** **module** **scope** **across** **requests** **on** **the** **server.**

**Expert Level**

**For** **multiple** **React** **roots** **or** **portals,** **still** **prefer** **`useId`** **over** **ad-hoc** **schemes.**

```typescript
// Anti-pattern: module-level counter on SSR leaks across requests
let counter = 0;
export function badId() {
  return `id-${counter++}`;
}
```

#### Key Points — SSR-safe

- **Use** **`useId`.**
- **Avoid** **module** **global** **counters** **server-side.**
- **Test** **hydration** **warnings.**

---

### Accessibility Patterns

**Beginner Level**

**Connect** **`label`**,** **`input`,** **`description`,** **`error`** **messages** **with** **`id`/`htmlFor`/`aria-*`.**

**Real-time example**: **Todo** **app** **task** **checkbox** **with** **visible** **label** **and** **`aria-labelledby`**

**Intermediate Level**

**`useId`** **supports** **multiple** **related** **ids** **per** **widget** **with** **suffixes.**

**Expert Level**

**Follow** **WCAG** **patterns** **for** **composite** **widgets** **(combobox,** **tabs).**

```tsx
import { useId } from "react";

export function SearchField() {
  const id = useId();
  return (
    <div>
      <label htmlFor={`${id}-q`}>Search</label>
      <input id={`${id}-q`} type="search" role="searchbox" aria-controls={`${id}-results`} />
      <ul id={`${id}-results`} role="listbox" />
    </div>
  );
}
```

#### Key Points — Accessibility

- **IDs** **wire** **ARIA** **relationships.**
- **Test** **with** **screen** **readers.**
- **Prefer** **semantic** **HTML** **first.**

---

## 15.6 useSyncExternalStore

### Basics

**Beginner Level**

**`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)`** **subscribes** **to** **an** **external** **store** **(not** **React** **state)** **and** **re-renders** **when** **it** **changes,** **safely** **with** **Concurrent** **Rendering.**

**Real-time example**: **Chat** **connection** **status** **from** **a** **`WebSocket`** **manager** **object** **outside** **React.**

**Intermediate Level**

**Use** **when** **integrating** **third-party** **state** **or** **browser** **APIs** **that** **aren’t** **React** **stores.**

**Expert Level**

**`getServerSnapshot`** **is** **required** **when** **SSR** **and** **the** **store** **exists** **on** **the** **server.**

```typescript
import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createSimpleStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    setState(next: T) {
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export function useStore<T>(store: ReturnType<typeof createSimpleStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
```

#### Key Points — Basics

- **Bridge** **for** **external** **stores.**
- **Concurrent-safe** **subscription** **model.**
- **Alternative** **to** **manual** **`useEffect` ** **subscriptions** **(often** **incorrect).**

---

### Subscribing to External Stores

**Beginner Level**

**`subscribe`** **must** **register** **a** **listener** **and** **return** **unsubscribe** **when** **called** **with** **cleanup.**

**Real-time example**: **Weather** **service** **singleton** **emitting** **when** **cache** **updates.**

**Intermediate Level**

**The** **subscription** **must** **be** **synchronous** **regarding** **registration** **(per** **React** **docs)** **—** **avoid** **async** **subscribe** **that** **misses** **updates.**

**Expert Level**

**For** **multiple** **stores,** **wrap** **each** **with** **`useSyncExternalStore`** **or** **compose** **a** **unified** **snapshot.**

```typescript
export type StoreApi<T> = {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => T;
};
```

#### Key Points — Subscribing

- **Unsubscribe** **must** **cleanup.**
- **Avoid** **missing** **updates** **during** **subscribe.**
- **Keep** **`getSnapshot`** **fast.**

---

### Store Snapshot

**Beginner Level**

**`getSnapshot`** **returns** **the** **current** **state** **value** **read** **from** **the** **external** **source.** **It** **must** **be** **cached** **immutably** **per** **external** **state** **version** **—** **if** **the** **same** **snapshot** **object** **is** **mutated,** **React** **cannot** **detect** **changes** **reliably.**

**Real-time example**: **Dashboard** **browser** **`matchMedia`** **snapshot** **—** **return** **boolean** **or** **immutable** **object.**

**Intermediate Level**

**If** **`getSnapshot`** **returns** **a** **new** **object** **each** **time** **without** **actual** **changes,** **you’ll** **cause** **extra** **renders** **—** **memoize** **or** **return** **primitives.**

**Expert Level**

**TanStack** **Query** **uses** **similar** **patterns** **internally** **—** **prefer** **the** **library** **for** **server** **state.**

```typescript
import { useSyncExternalStore } from "react";

function subscribeDark(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getDarkSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function usePrefersDark() {
  return useSyncExternalStore(subscribeDark, getDarkSnapshot, () => false);
}
```

#### Key Points — Snapshot

- **Snapshot** **equality** **drives** **re-renders.**
- **Avoid** **mutating** **returned** **objects.**
- **Return** **primitives** **when** **possible.**

---

### SSR and useSyncExternalStore

**Beginner Level**

**On** **the** **server,** **there** **is** **no** **`window`.** **Pass** **`getServerSnapshot`** **to** **return** **a** **consistent** **SSR** **value.**

**Real-time example**: **`matchMedia`** **returns** **`false`** **on** **server** **or** **reads** **cookie** **theme.**

**Intermediate Level**

**Mismatch** **between** **server** **and** **client** **snapshot** **can** **cause** **hydration** **warnings** **—** **design** **defaults** **carefully.**

**Expert Level**

**Remount** **or** **suppress** **known** **benign** **mismatches** **only** **with** **documented** **patterns.**

```typescript
import { useSyncExternalStore } from "react";

export function useThemeFlag() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      /* client */
      return document.documentElement.dataset.theme === "dark";
    },
    () => false
  );
}
```

#### Key Points — SSR

- **Always** **provide** **`getServerSnapshot`** **when** **SSR** **applies.**
- **Avoid** **browser-only** **APIs** **in** **server** **snapshot.**
- **Align** **with** **cookie** **theme** **strategies.**

---

## 15.7 useInsertionEffect

### Basics

**Beginner Level**

**`useInsertionEffect`** **runs** **before** **`useLayoutEffect`** **and** **before** **DOM** **mutations** **are** **exposed** **to** **layout** **effects.** **It** **exists** **for** **injecting** **styles** **into** **the** **DOM** **in** **CSS-in-JS** **libraries.**

**Real-time example**: **Styled-components** **/** **Emotion** **use** **this** **internally** **—** **app** **code** **rarely** **calls** **it** **directly.**

**Intermediate Level**

**Don’t** **use** **`useInsertionEffect`** **for** **general** **logic** **—** **only** **style** **injection** **concerns.**

**Expert Level**

**Ensures** **styles** **exist** **before** **`useLayoutEffect`** **reads** **layout** **metrics.**

```tsx
import { useInsertionEffect, useRef } from "react";

export function useInjectStyle(rule: string) {
  const inserted = useRef(false);

  useInsertionEffect(() => {
    if (inserted.current) return;
    const el = document.createElement("style");
    el.textContent = rule;
    document.head.appendChild(el);
    inserted.current = true;
    return () => {
      el.remove();
      inserted.current = false;
    };
  }, [rule]);
}
```

#### Key Points — Basics

- **Library-level** **hook** **primarily.**
- **Runs** **before** **layout** **effects.**
- **For** **style** **injection** **ordering.**

---

### CSS-in-JS Integration

**Beginner Level**

**CSS-in-JS** **needs** **to** **insert** **rules** **before** **paint** **and** **before** **components** **measure** **layout** **—** **`useInsertionEffect`** **coordinates** **this.**

**Real-time example**: **E-commerce** **theme** **tokens** **injected** **per** **route** **chunk.**

**Intermediate Level**

**Prefer** **established** **libraries** **rather** **than** **rolling** **your** **own** **unless** **you** **maintain** **a** **design** **system.**

**Expert Level**

**Concurrent** **rendering** **amplifies** **ordering** **bugs** **if** **styles** **are** **missing** **during** **layout** **reads** **—** **`useInsertionEffect`** **mitigates.**

```typescript
export type CSSinJS = {
  inject: (rules: string) => void;
  // useInsertionEffect schedules insertion before layout reads
};
```

#### Key Points — CSS-in-JS

- **Frameworks** **handle** **complexity.**
- **Ordering** **matters** **with** **Concurrent** **Rendering.**
- **Consider** **zero-runtime** **solutions** **(Tailwind,** **CSS** **Modules)** **for** **bundle** **size.**

---

### Timing vs useLayoutEffect

**Beginner Level**

**`useLayoutEffect`** **runs** **after** **DOM** **updates** **and** **before** **paint** **—** **good** **for** **measuring** **DOM.** **`useInsertionEffect`** **runs** **earlier** **for** **injecting** **styles.**

**Real-time example**: **Dashboard** **chart** **measures** **container** **in** **`useLayoutEffect`** **after** **CSS** **present.**

**Intermediate Level**

**Don’t** **read** **layout** **in** **`useInsertionEffect`.**

**Expert Level**

**SSR** **warning:** **`useLayoutEffect`** **doesn’t** **run** **on** **server** **—** **use** **`useEffect`** **or** **suppress** **with** **patterns** **from** **docs.**

```tsx
import { useLayoutEffect, useRef, useState } from "react";

export function MeasureWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;
    setW(ref.current.getBoundingClientRect().width);
  }, []);

  return <div ref={ref}>width={w}</div>;
}
```

#### Key Points — Timing

- **Insertion** **→** **Layout** **→** **Paint** **ordering.**
- **Don’t** **mix** **concerns** **across** **hooks.**
- **Prefer** **`useEffect`** **for** **non-layout** **side** **effects.**

---

## 15.8 Automatic Batching

### Batching in React 18

**Beginner Level**

**Multiple** **`setState`** **calls** **in** **the** **same** **event** **handler** **are** **batched** **into** **one** **render** **(React** **17** **did** **this** **in** **some** **cases).** **React** **18** **extends** **batching** **to** **more** **async** **contexts.**

**Real-time example**: **Todo** **app** **bulk** **checks** **two** **pieces** **of** **state** **after** **`await`** **without** **two** **paints.**

**Intermediate Level**

**Batching** **reduces** **layout** **thrash** **and** **intermediate** **UI** **states.**

**Expert Level**

**Understand** **when** **you** **need** **`flushSync`** **to** **escape** **batching.**

```tsx
import { useState } from "react";

export function DoubleUpdate() {
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

#### Key Points — Batching in React 18

- **Fewer** **renders** **for** **common** **patterns.**
- **Better** **out-of-the-box** **performance.**
- **Test** **after** **upgrades.**

---

### Automatic Behavior

**Beginner Level**

**You** **don’t** **call** **a** **batching** **API** **explicitly** **in** **most** **app** **code** **—** **React** **automatically** **batches** **eligible** **updates.**

**Real-time example**: **Social** **like** **button** **updates** **optimistic** **count** **+** **icon** **state** **together.**

**Intermediate Level**

**Third-party** **event** **systems** **may** **need** **`flushSync`** **or** **`unstable_batchedUpdates`** **(legacy)** **in** **edge** **cases.**

**Expert Level**

**Concurrent** **rendering** **interacts** **with** **batching** **—** **read** **release** **notes** **when** **debugging** **unexpected** **ordering.**

```typescript
export const automaticBatching = "enabled in React 18 for more cases than React 17";
```

#### Key Points — Automatic Behavior

- **Less** **boilerplate** **for** **developers.**
- **May** **hide** **intermediate** **states** **you** **relied** **on** **—** **adjust** **tests.**
- **Use** **`flushSync`** **when** **needed.**

---

### flushSync

**Beginner Level**

**`flushSync(() => { setState(...) })`** **forces** **synchronous** **flush** **of** **updates** **inside** **the** **callback** **for** **cases** **that** **need** **immediate** **DOM** **reads.**

**Real-time example**: **Chat** **scrolls** **to** **bottom** **after** **append** **—** **sometimes** **needs** **`flushSync`** **before** **measuring** **(often** **prefer** **`useLayoutEffect`** **instead).**

**Intermediate Level**

**Overuse** **hurts** **performance** **—** **escape** **hatch** **only.**

**Expert Level**

**May** **interact** **with** **Concurrent** **features** **—** **consult** **docs** **for** **your** **React** **version.**

```tsx
import { flushSync, useState } from "react";

export function ForcedSyncDemo() {
  const [n, setN] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        flushSync(() => setN((x) => x + 1));
        // DOM reflects updated state immediately after flushSync
      }}
    >
      {n}
    </button>
  );
}
```

#### Key Points — flushSync

- **Escape** **hatch** **for** **batching.**
- **Use** **sparingly.**
- **Prefer** **`useLayoutEffect`** **for** **measure-after-update** **patterns** **when** **possible.**

---

### Migration from Legacy Batching

**Beginner Level**

**After** **upgrading** **to** **React** **18,** **some** **tests** **or** **code** **that** **assumed** **two** **renders** **for** **two** **`setState`** **calls** **in** **`setTimeout`** **may** **see** **one** **render** **instead.**

**Real-time example**: **E-commerce** **unit** **tests** **counting** **renders** **may** **need** **updates.**

**Intermediate Level**

**Prefer** **testing** **observable** **outputs** **rather** **than** **render** **counts.**

**Expert Level**

**If** **you** **must** **force** **separate** **commits,** **use** **`flushSync`** **or** **explicitly** **structure** **state** **into** **one** **object.**

```typescript
export type MigrationNote =
  | "Expect fewer intermediate renders in async code"
  | "Update tests that rely on render counts"
  | "Use flushSync for rare synchronous needs";
```

#### Key Points — Migration

- **Review** **tests** **after** **upgrade.**
- **Avoid** **depending** **on** **render** **counts.**
- **Read** **official** **React** **18** **upgrade** **guide.**

---

## Key Points (Chapter Summary)

- **Concurrent** **Rendering** **requires** **pure** **components** **and** **enables** **interruptible** **work.**
- **Use** **`createRoot`** **for** **React** **18** **features.**
- **Transitions** **and** **`useDeferredValue`** **separate** **urgent** **vs** **non-urgent** **work.**
- **Suspense** **+** **Error** **Boundaries** **+** **data** **libraries** **build** **robust** **loading** **UX.**
- **`useId`** **is** **the** **SSR-safe** **way** **to** **generate** **DOM** **ids.**
- **`useSyncExternalStore`** **bridges** **external** **stores** **concurrently** **and** **SSR**
- **`useInsertionEffect`** **orders** **CSS-in-JS** **injection** **before** **layout.**
- **Automatic** **batching** **reduces** **renders;** **`flushSync`** **escapes** **when** **required.**

---

## Best Practices (Global)

- **Adopt** **`createRoot`** **and** **test** **in** **`StrictMode`.**
- **Mark** **heavy** **UI** **updates** **as** **transitions** **or** **defer** **values** **to** **children** **with** **`memo`.**
- **Nest** **Suspense** **boundaries** **thoughtfully** **with** **consistent** **skeletons.**
- **Use** **`useId`** **for** **a11y** **relationships** **instead** **of** **random** **ids.**
- **Use** **`useSyncExternalStore`** **when** **subscribing** **to** **non-React** **stores** **—** **not** **ad-hoc** **`useEffect`.**
- **Leave** **`useInsertionEffect`** **to** **CSS-in-JS** **libraries** **unless** **you** **maintain** **one.**
- **Review** **tests** **and** **assumptions** **about** **batching** **when** **migrating** **to** **React** **18.**

---

## Common Mistakes to Avoid

- **Side** **effects** **in** **render** **that** **break** **with** **concurrent** **re-renders.**
- **Using** **`Math.random()`** **for** **ids** **in** **SSR** **apps.**
- **Subscribing** **to** **external** **stores** **with** **`useEffect`** **without** **`useSyncExternalStore`** **—** **tearing** **bugs.**
- **Using** **`useLayoutEffect`** **for** **style** **injection** **—** **wrong** **ordering** **vs** **`useInsertionEffect`.**
- **Assuming** **`useDeferredValue`** **is** **the** **same** **as** **debouncing** **with** **`setTimeout`.**
- **Omitting** **`getServerSnapshot`** **for** **browser-only** **snapshots** **causing** **SSR** **errors.**
- **Overusing** **`flushSync`** **and** **hurting** **performance.**

---
