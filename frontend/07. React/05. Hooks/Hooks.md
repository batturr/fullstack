# Hooks (React + TypeScript)

**Hooks** are functions that let you **use React features** (state, lifecycle, context, refs) inside **function components**. This chapter covers every built-in hook and **custom hooks** with **TypeScript** typing patterns, plus **real-time examples** from **e-commerce**, **social media**, **dashboards**, **todo**, **weather**, **chat**, and **admin** apps.

---

## 📑 Table of Contents

- [Hooks (React + TypeScript)](#hooks-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [5.1 Hooks Introduction](#51-hooks-introduction)
  - [5.2 useState Hook with TypeScript Detailed](#52-usestate-hook-with-typescript-detailed)
  - [5.3 useEffect Hook](#53-useeffect-hook)
  - [5.4 useContext Hook](#54-usecontext-hook)
  - [5.5 useReducer Hook with TypeScript](#55-usereducer-hook-with-typescript)
  - [5.6 useCallback Hook](#56-usecallback-hook)
  - [5.7 useMemo Hook](#57-usememo-hook)
  - [5.8 useRef Hook with TypeScript](#58-useref-hook-with-typescript)
  - [5.9 useImperativeHandle](#59-useimperativehandle)
  - [5.10 useLayoutEffect](#510-uselayouteffect)
  - [5.11 useDebugValue](#511-usedebugvalue)
  - [5.12 Custom Hooks with TypeScript](#512-custom-hooks-with-typescript)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 5.1 Hooks Introduction

### What are Hooks?

**Beginner Level**

**Hooks** are special **functions** whose names start with **`use`** (for example `useState`, `useEffect`). You call them **inside** your function component to add **state**, **side effects**, **context**, **refs**, and more—without writing a **class**.

**Real-time example**: In a **todo** app, `useState` remembers whether a new task input is empty; `useEffect` can save todos to **localStorage** when the list changes.

**Intermediate Level**

Hooks **compose**: you can use several hooks in one component, and you can **extract** repeated logic into **custom hooks** (`useCart`, `useAuth`) that themselves call other hooks. Hooks rely on **call order** (not names) so React can associate state with the correct component instance on each render.

**Expert Level**

Hooks align with React’s **fiber** architecture: each hook call creates a **hook object** in a linked list attached to the component’s fiber. That is why **rules of hooks** exist—conditional hook calls would desynchronize this list. **Strict Mode** double-invokes certain lifecycles in development to surface unsafe side effects.

```tsx
import { useState } from "react";

export function WeatherBadge() {
  const [city, setCity] = useState("London");
  return (
    <button type="button" onClick={() => setCity(city === "London" ? "Paris" : "London")}>
      Weather: {city}
    </button>
  );
}
```

#### Key Points — What are Hooks?

- Hooks are **functions** you call from **function components** (or custom hooks).
- They **encapsulate** stateful logic in a **reusable** way.
- Built-in hooks cover **state**, **effects**, **context**, **refs**, **memoization**, and **debugging**.

---

### Motivation for Hooks

**Beginner Level**

Before hooks, sharing **stateful logic** between components often meant **higher-order components (HOCs)** or **render props**, which could make trees **hard to read**. Hooks let you **reuse** logic as plain functions.

**Real-time example**: A **social media** “infinite scroll feed” needs scroll position and fetch logic—`useInfiniteFeed()` can bundle that once and use it in **Profile** and **Explore** screens.

**Intermediate Level**

Hooks **colocate** related logic: effects sit next to the state they depend on, instead of splitting across `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. This improves **local reasoning**.

**Expert Level**

Hooks enable **composition** over **inheritance**, play well with **concurrent features**, and integrate cleanly with **TypeScript** via generics and **discriminated unions** for reducers and state machines.

```tsx
// Motivation: colocated effect + state (e-commerce product view count)
import { useEffect, useState } from "react";

export function ProductViews({ productId }: { productId: string }) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const unsub = analytics.subscribeViews(productId, setViews);
    return () => unsub();
  }, [productId]);

  return <span>{views} views</span>;
}
```

#### Key Points — Motivation

- **Reuse** stateful logic without HOC/render-prop nesting.
- **Colocate** effects with the state they manage.
- **Simpler** mental model for many teams vs class lifecycle methods.

---

### Rules of Hooks — Top Level + Only React Functions

**Beginner Level**

1. **Only call hooks at the top level** of a React function component or **custom hook**—not inside loops, conditions, or nested functions (except callbacks *defined* at top level that call hooks is wrong—hooks must not be conditional).
2. **Only call hooks from React functions**—components or custom hooks starting with `use`.

**Real-time example**: A **dashboard** must not do `if (isAdmin) { useState(...) }`—instead compute `useState` once and branch **rendering** on `isAdmin`.

**Intermediate Level**

Violating rules breaks React’s **linked list** of hooks per fiber. **ESLint** `eslint-plugin-react-hooks` catches most mistakes. In **TypeScript**, typing custom hooks as `function useX(): ReturnType` documents intent.

**Expert Level**

For **conditionally needed** state, **lift** state up, **split** components, or use **reducers** / **state machines** so hook order stays fixed. **Fast Refresh** relies on stable hook signatures.

```tsx
// BAD: conditional hook — never do this
function Bad({ show }: { show: boolean }) {
  if (show) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- intentionally wrong
    const [x, setX] = useState(0);
    return <button onClick={() => setX(x + 1)}>{x}</button>;
  }
  return null;
}

// GOOD: unconditional hooks, conditional UI
function Good({ show }: { show: boolean }) {
  const [x, setX] = useState(0);
  if (!show) return null;
  return <button onClick={() => setX((n) => n + 1)}>{x}</button>;
}
```

#### Key Points — Rules

- **Stable call order** every render.
- Use **lint rules** in CI.
- Refactor **conditionals** into JSX or child components, not around hooks.

---

### ESLint Plugin (react-hooks)

**Beginner Level**

Install **`eslint-plugin-react-hooks`** and enable **`rules-of-hooks`** and **`exhaustive-deps`**. The first enforces **where** hooks are called; the second warns when `useEffect`/`useMemo`/`useCallback` **dependency arrays** might be wrong.

**Real-time example**: A **chat** component’s `useEffect` that loads messages when `roomId` changes—if `roomId` is missing from deps, you get **stale** messages from the previous room.

**Intermediate Level**

`exhaustive-deps` is a **heuristic**: sometimes you **intentionally** omit deps (rare) and add an **eslint-disable** with a comment explaining **why**. Prefer **fixing** the effect (stable callbacks via `useCallback`, refs for mutable values).

**Expert Level**

In large codebases, combine with **TypeScript** `strict` mode and **React Compiler** (when adopted) to reduce manual memoization. Document **team policy** for eslint-disable usage.

```json
{
  "extends": ["plugin:react-hooks/recommended"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### Key Points — ESLint Plugin

- Catches **invalid hook calls** and many **dependency** bugs early.
- Treat warnings as **tech debt**—schedule fixes.
- Pair with **code review** for intentional exceptions.

---

### Hooks with TypeScript

**Beginner Level**

Type **state** explicitly when inference is too wide (`useState<string | null>(null)`). Type **event handlers** with React’s types (`React.ChangeEvent<HTMLInputElement>`). Type **refs** as `useRef<HTMLDivElement>(null)`.

**Intermediate Level**

Use **generics** on `useState`, `useReducer`, `useRef`, and custom hooks (`useLocalStorage<T>`). For **context**, define a **tuple** or interface for `{ state, dispatch }` and use **`null!`** or guards for default context in tests only—prefer **undefined default** + runtime check or **split contexts**.

**Expert Level**

Model **impossible states** with **discriminated unions**. Use **`satisfies`** for action types in reducers. Expose **readonly** types from custom hooks. Consider **`useReducer` + exhaustive switch** for complex flows (checkout, wizards).

```tsx
import { useState } from "react";

type Tab = "feed" | "notifications" | "profile";

export function SocialNav() {
  const [tab, setTab] = useState<Tab>("feed");
  return (
    <nav>
      {(["feed", "notifications", "profile"] as const).map((t) => (
        <button key={t} type="button" onClick={() => setTab(t)} aria-current={tab === t}>
          {t}
        </button>
      ))}
    </nav>
  );
}
```

#### Key Points — Hooks + TypeScript

- Prefer **inference**; add types when **widening** hurts safety.
- Use **generics** and **unions** for scalable state.
- Align hook **return types** with **consumer expectations** (explicit return types on custom hooks for public APIs).

---

## 5.2 useState Hook with TypeScript Detailed

### Type Inference

**Beginner Level**

`useState(0)` infers **`number`**; `useState("hi")` infers **`string`**. TypeScript picks the type from the **initial argument**.

**Real-time example**: **Todo** list `useState([])` may infer **`never[]`**—then pushing fails; use **`useState<Todo[]>([])`** or `as const` initial values carefully.

**Intermediate Level**

**Union** initial values like `useState("a" as "a" | "b")` or pass a **generic** `useState<Status>("idle")` so `setState` accepts only valid transitions if you narrow via callbacks.

**Expert Level**

With **strict null checks**, `useState(null)` infers **`null`** only—use **`useState<string | null>(null)`** for nullable strings. For **functional updates**, ensure the updater’s parameter type matches.

```tsx
type CartItem = { id: string; qty: number };

// Inference: initial [] would be never[] — annotate
export function useCartState() {
  const [items, setItems] = useState<CartItem[]>([]);
  return { items, setItems };
}
```

#### Key Points — Type Inference

- Watch **`[]` and `null`** inference gotchas.
- Add **explicit generics** when inference is wrong.
- **Functional updaters** preserve type safety when done correctly.

---

### Generic Type on useState

**Beginner Level**

`useState<Type>(initial)` tells TypeScript what values **`state`** and **`setState`** may hold.

**Real-time example**: **E-commerce** `useState<number>(1)` for quantity—`setQty("2")` is a **type error**.

**Intermediate Level**

You can combine with **union types**: `useState<"light" | "dark">("light")` for theme toggles in a **dashboard**.

**Expert Level**

Use **generic custom wrappers** (`createStateHook<T>()`) sparingly; prefer simple `useState<T>` at call site for readability.

```tsx
type WeatherUnit = "C" | "F";

export function WeatherToggle() {
  const [unit, setUnit] = useState<WeatherUnit>("C");
  return (
    <button type="button" onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}>
      °{unit}
    </button>
  );
}
```

#### Key Points — Generic Type

- **One generic parameter**—the state type.
- Initial value must be **assignable** to that type.
- Use for **domain enums** and **numeric** / **string** unions.

---

### Interface Types in State

**Beginner Level**

Store **objects** in state with an **`interface`** or **`type`** describing fields—e.g. **`User`** for profile name and avatar in a **social** app.

**Intermediate Level**

Prefer **readonly** fields for things updated by **replacement** (`setUser({ ...user, name })`). Avoid **optional chaos**—use explicit **`undefined`** vs **missing** consistently.

**Expert Level**

For **normalized** entities, store **`Record<string, User>`** or **byId** maps; update immutably with **spread** or **Immer**.

```tsx
interface DashboardFilter {
  readonly from: string;
  readonly to: string;
  readonly region: string;
}

export function SalesFilter() {
  const [filter, setFilter] = useState<DashboardFilter>({
    from: "2025-01-01",
    to: "2025-12-31",
    region: "EU",
  });

  return (
    <input
      aria-label="Region"
      value={filter.region}
      onChange={(e) => setFilter({ ...filter, region: e.target.value })}
    />
  );
}
```

#### Key Points — Interface Types

- **Shape** state for clarity and refactors.
- Update with **immutable** patterns.
- **Readonly** where appropriate to signal intent.

---

### Update Patterns (merge vs replace)

**Beginner Level**

- **Primitives**: `setCount(count + 1)` or functional `setCount((c) => c + 1)`.
- **Objects**: replace or merge with **`{ ...prev, key: value }`**.

**Real-time example**: **Todo** app: toggle done with `setTodos((todos) => todos.map(...))`.

**Intermediate Level**

**Functional updates** avoid stale closures when the new state depends on the **previous** state in the same event or async flow.

**Expert Level**

**Batching**: React 18+ batches multiple `setState` in async handlers automatically; still use **functional updates** when chaining.

```tsx
export function QuantityStepper() {
  const [qty, setQty] = useState(1);

  const inc = () => setQty((q) => q + 1);
  const incTwiceBuggy = () => {
    setQty(qty + 1);
    setQty(qty + 1); // still +1 if qty was stale in closure-heavy scenarios — functional form fixes
  };

  return (
    <div>
      <button type="button" onClick={inc}>
        {qty}
      </button>
      <button type="button" onClick={incTwiceBuggy}>
        buggy double
      </button>
    </div>
  );
}
```

#### Key Points — Update Patterns

- Prefer **functional updates** when deriving from **previous** state.
- **Objects**: immutable updates.
- Avoid **mutating** arrays/objects in place.

---

### Union Types in State

**Beginner Level**

Use unions for **modal** open/closed, **loading** states, or **wizard** steps: `type UiState = { status: "idle" } | { status: "loading" } | { status: "error"; message: string }`.

**Intermediate Level**

**Discriminated unions** with a **`status`** or **`type`** field let TypeScript **narrow** inside `switch` for safe access to **`message`**.

**Expert Level**

Pair with **`useReducer`** for transitions; avoid **boolean soup** (`isLoading`, `isError`, `isSuccess`) that allows **impossible combinations**.

```tsx
type CheckoutState =
  | { step: "cart" }
  | { step: "shipping"; addressId: string }
  | { step: "payment"; addressId: string; method: "card" | "paypal" };

export function useCheckout(initial: CheckoutState = { step: "cart" }) {
  return useState<CheckoutState>(initial);
}
```

#### Key Points — Union Types

- **Discriminate** with a shared field.
- **Narrow** before accessing branch-specific data.
- Prefer **state machines** for complex UX.

---

### Gotchas (useState)

**Beginner Level**

- **Same reference**: mutating an array in place and calling `setState` **may not** re-render—**replace** with a new array.
- **Async**: state right after `setState` is **not** updated yet—use `useEffect` to react to new values or functional updates.

**Intermediate Level**

**Object identity**: `setState({ ...obj })` creates new reference—good. **`setState(obj)`** when `obj` reference unchanged—no update.

**Expert Level**

**Concurrent rendering**: treat state updates as **pending**; avoid relying on **synchronous** state reads after updates in the same render path for external side effects—use **`useEffect`**.

```tsx
// Gotcha: mutation
function BadTodos() {
  const [todos, setTodos] = useState<{ id: string; done: boolean }[]>([]);
  const toggle = (id: string) => {
    const t = todos.find((x) => x.id === id);
    if (t) t.done = !t.done; // mutates — React may not see change
    setTodos(todos); // same array ref
  };
  return null;
}
```

#### Key Points — Gotchas

- **Immutability** for reference types.
- **No immediate** read-after-write expectation.
- **Functional updates** for correctness under batching/concurrency.

---

## 5.3 useEffect Hook

### Basics of useEffect

**Beginner Level**

`useEffect(() => { ... }, deps)` runs **after paint** (by default) to perform **side effects**: fetch data, subscribe, timers, logging. It runs **after** the component commits to the screen.

**Real-time example**: **Weather** widget fetches forecast when `city` changes.

**Intermediate Level**

The **effect function** can return **nothing** or a **cleanup** function. React runs cleanup **before** the next effect run and on **unmount**.

**Expert Level**

Effects are **declarative** descriptions of synchronization with **external systems**—not “lifecycle” in the old sense. React may **re-run** them when dependencies change; design for **idempotency** where possible.

```tsx
import { useEffect, useState } from "react";

export function CityWeather({ city }: { city: string }) {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await fetchTemp(city);
      if (!cancelled) setTemp(t);
    })();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return <div>{temp === null ? "…" : `${temp}°`}</div>;
}

async function fetchTemp(_city: string): Promise<number> {
  return 22;
}
```

#### Key Points — Basics

- Side effects **after** render.
- Optional **cleanup** return.
- **Declare** what you sync to—**dependencies** tell React when to re-sync.

---

### Timing (after paint)

**Beginner Level**

`useEffect` runs **after** the browser paints—so users see UI first; heavy work can still make things sluggish if not split.

**Intermediate Level**

For **synchronous** DOM reads/writes that must happen **before** paint (measure then mutate layout), use **`useLayoutEffect`** (see §5.10).

**Expert Level**

**Suspense** and **streaming** change loading patterns—effects still run on the client after commit; server components don’t use client hooks the same way.

---

### Dependency Array

**Beginner Level**

- **`[a, b]`**: effect re-runs when **`a` or `b`** changes (shallow compare with `Object.is`).
- **Omitting** the second argument is **deprecated** in strict setups—means “run every render” (usually a bug).

**Real-time example**: **Dashboard** `useEffect(..., [userId, range])` refetches analytics when either changes.

**Intermediate Level**

Include **every** value from the component scope used inside the effect that **can change**—including **functions** unless stabilized with **`useCallback`**.

**Expert Level**

**Stale closures**: missing deps causes effects to see **old** values; **eslint exhaustive-deps** helps. For **stable** event handlers, **`useRef`** holding a callback updated each render is an advanced pattern (see subscription APIs).

```tsx
useEffect(() => {
  document.title = `${unread} unread — Chat`;
}, [unread]);
```

#### Key Points — Dependency Array

- **List** all reactive dependencies.
- **Stabilize** functions or include them.
- Avoid **empty deps** unless effect truly runs once on mount **and** uses only stable refs/globals safely.

---

### Empty Dependency Array `[]`

**Beginner Level**

`useEffect(() => { ... }, [])` runs **once** after initial mount (and cleanup on unmount). Use for **one-time** subscriptions or **`document.title`** init.

**Intermediate Level**

If the effect **closes over** props/state** without listing them**, `[]` causes **stale** values—often wrong.

**Expert Level**

For **once** but needing latest values, either **include deps** or use **refs** updated each render to hold latest callbacks (document the pattern).

```tsx
useEffect(() => {
  const id = window.setInterval(() => {
    // ping server — if you need latest props, use refs or include deps
  }, 30_000);
  return () => window.clearInterval(id);
}, []);
```

#### Key Points — Empty Array

- Means **mount/unmount** lifecycle for that effect instance.
- **Dangerous** if effect uses changing values without refs.
- Validate with **lint** and tests.

---

### No Dependency Array (every render)

**Beginner Level**

Omitting the second argument runs the effect **after every render**—rarely what you want; can cause **infinite loops** if the effect updates state unconditionally.

**Intermediate Level**

Sometimes used for **logging** or **debugging**—still prefer **`useEffect` with proper deps** or **`useLayoutEffect`** for specific cases.

**Expert Level**

In modern React, prefer **explicit** dependencies for **predictability**; “run every time” is usually **`useEffect(() => {}, [depThatChangesEveryTime])`** with clarity.

---

### Cleanup Function

**Beginner Level**

Return a function from `useEffect` to **undo** the effect: clear timers, **abort** fetch, unsubscribe, remove listeners.

**Real-time example**: **Chat** websocket: `socket.close()` on cleanup.

**Intermediate Level**

Cleanup runs **before** re-running the effect when deps change, and on **unmount**. Order matters: don’t rely on cleanup running **synchronously** at a specific microtask.

**Expert Level**

**AbortController** pairs well with fetch for **race** cancellation when `query` changes.

```tsx
useEffect(() => {
  const ac = new AbortController();
  fetch(`/api/inbox?user=${userId}`, { signal: ac.signal })
    .then((r) => r.json())
    .then(setMessages)
    .catch(() => {});
  return () => ac.abort();
}, [userId]);
```

#### Key Points — Cleanup

- **Always** clean **subscriptions** and **timers**.
- Use **AbortSignal** for in-flight requests.
- Avoid **memory leaks** from listeners.

---

### Multiple Effects

**Beginner Level**

Split **unrelated** concerns into **multiple** `useEffect` calls—one for **keyboard** shortcuts, one for **document.title**, one for **data fetching**.

**Intermediate Level**

Each effect should have a **focused** dependency list—easier to reason about than one giant effect.

**Expert Level**

Order of effects is **declaration order**; cleanups run in **reverse** order on unmount / before re-run.

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [onClose]);

useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "";
  };
}, []);
```

#### Key Points — Multiple Effects

- **Separate** concerns.
- **Simpler** dependency arrays.
- Easier **testing** and **review**.

---

### useEffect vs Class Lifecycle

**Beginner Level**

`componentDidMount` + `componentDidUpdate` + `componentWillUnmount` map roughly to **`useEffect`** with appropriate **deps** and **cleanup**—but **mental model** is “sync with external system,” not “lifecycle stages.”

**Intermediate Level**

There is **no direct** `componentDidCatch` equivalent in hooks alone—use **error boundaries** (class or future APIs).

**Expert Level**

**getSnapshotBeforeUpdate** maps to **`useLayoutEffect`** + refs for some cases—measure carefully.

---

### Mistakes with useEffect

**Beginner Level**

- Missing **deps** → stale data.
- **Infinite loop**: `setState` in effect without proper guards/deps.
- **No cleanup** on subscriptions.

**Intermediate Level**

Using `useEffect` for **derived state** that could be computed during render—**compute in render** or **`useMemo`**.

**Expert Level**

**Over-fetching** due to unstable **object/array** deps—**memoize** upstream or pass **primitives**.

---

### Best Practices for useEffect

**Beginner Level**

- List **correct** dependencies.
- **Cleanup** subscriptions.
- **Cancel** async work.

**Intermediate Level**

- Split effects by **concern**.
- Don’t **fetch** in render—use effect or dedicated data library.

**Expert Level**

- Prefer **TanStack Query** / **RTK Query** for server cache; use **effects** for imperative bridges.

---

## 5.4 useContext Hook

### Basics of useContext

**Beginner Level**

`useContext(MyContext)` reads the **nearest** `MyContext.Provider` value above in the tree. Avoid **prop drilling** for cross-cutting values like **theme** or **current user**.

**Real-time example**: **Dashboard** **theme** (`"light" | "dark"`) consumed by many nested cards.

**Intermediate Level**

Context triggers **re-renders** when the **value** changes (reference equality)—**memoize** provider values when passing objects/functions.

**Expert Level**

Split **high-churn** and **low-churn** context to reduce **broad** re-renders (see Context API chapter).

```tsx
import { createContext, useContext } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<Theme>("light");

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
```

#### Key Points — Basics

- **Nearest provider** wins.
- **Default** from `createContext(default)` when no provider.
- **Re-render** consumers when value changes.

---

### Consuming Context

**Beginner Level**

Call **`useContext`** in a child component; value is **typed** if `createContext` is typed.

**Intermediate Level**

Custom hook **`useAuth()`** wraps `useContext(AuthContext)` and throws if missing provider—better errors.

**Expert Level**

**Multiple providers** of same context: nearest wins; useful for **scoped** overrides (storybook, modals).

---

### Multiple Contexts

**Beginner Level**

Call **`useContext(ThemeContext)`** and **`useContext(LocaleContext)`** in the same component—order doesn’t matter.

**Real-time example**: **E-commerce**: **currency** + **cart** + **locale** contexts.

**Intermediate Level**

Too many contexts can hint at **composition** or **state library** needs—not always wrong.

---

### useContext vs Consumer (Legacy)

**Beginner Level**

**`<ThemeContext.Consumer>{value => ...}</ThemeContext.Consumer>`** is the **legacy** pattern; **`useContext`** is shorter and works with hooks rules cleanly.

**Intermediate Level**

**Consumer** still works in class components; prefer **hooks** in new code.

---

### Context + useReducer

**Beginner Level**

Provide **`[state, dispatch]`** from `useReducer` via context so deep children can **dispatch** actions (e.g. **todo** app).

**Intermediate Level**

**Split** `state` and `dispatch` contexts to avoid re-rendering **all** consumers when only **dispatch** identity is stable (advanced pattern).

**Expert Level**

Type **`dispatch`** with **`React.Dispatch<Action>`** where **`Action`** is a discriminated union.

```tsx
import { createContext, Dispatch, useContext, useReducer } from "react";

type Todo = { id: string; text: string; done: boolean };
type Action =
  | { type: "add"; text: string }
  | { type: "toggle"; id: string };

const StateCtx = createContext<Todo[] | null>(null);
const DispatchCtx = createContext<Dispatch<Action> | null>(null);

export function useTodos() {
  const s = useContext(StateCtx);
  const d = useContext(DispatchCtx);
  if (!s || !d) throw new Error("TodosProvider missing");
  return [s, d] as const;
}
```

#### Key Points — Context + useReducer

- Great for **moderately complex** shared state.
- **Type** actions exhaustively.
- Consider **split contexts** for performance.

---

## 5.5 useReducer Hook with TypeScript

### Basics of useReducer

**Beginner Level**

`const [state, dispatch] = useReducer(reducer, initialArg, init?)`—**dispatch** sends **actions**; **reducer** returns **new state**—good for **complex** state logic.

**Real-time example**: **Shopping cart** with add/remove/apply coupon.

**Intermediate Level**

**Pure** reducer: same state + action → same new state; **no side effects** inside reducer.

**Expert Level**

Use with **middleware** patterns outside React or **redux-toolkit** for app-scale.

```tsx
type CartState = { items: Record<string, number> };

type CartAction =
  | { type: "add"; id: string; qty: number }
  | { type: "remove"; id: string };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const prev = state.items[action.id] ?? 0;
      return { items: { ...state.items, [action.id]: prev + action.qty } };
    }
    case "remove": {
      const { [action.id]: _, ...rest } = state.items;
      return { items: rest };
    }
    default:
      return state;
  }
}
```

#### Key Points — Basics

- **Centralizes** transitions.
- **Easier** to test reducers in isolation.
- **Type** actions with **unions**.

---

### Typed Reducer

**Beginner Level**

Type **`state`** and **`action`** parameters; return type inferred or explicit.

**Intermediate Level**

Use **`satisfies`** for action literals in tests to ensure **exhaustive** handling.

**Expert Level**

**Immer** reducers (`produce`) can simplify nested updates—still keep types strict.

---

### Discriminated Unions for Actions

**Beginner Level**

Each action has **`type`** and related **payload** fields—TypeScript **narrows** in `switch`.

**Real-time example**: **Social** feed: `{ type: "like"; postId }` vs `{ type: "unlike"; postId }`.

**Intermediate Level**

Avoid **`action: any`**—use **`never`** default case to catch **unhandled** actions.

```tsx
function assertNever(x: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(x)}`);
}

function feedReducer(
  state: FeedState,
  action: FeedAction
): FeedState {
  switch (action.type) {
    case "like":
      return { ...state, likes: { ...state.likes, [action.postId]: true } };
    case "unlike": {
      const { [action.postId]: _, ...likes } = state.likes;
      return { ...state, likes };
    }
    default:
      return assertNever(action);
  }
}
```

---

### Initial State and Lazy Initialization

**Beginner Level**

`useReducer(reducer, initialState)`—or **`useReducer(reducer, initialArg, init)`** where **`init(initialArg)`** computes initial state **once**.

**Real-time example**: **Todo** list from **`localStorage`**—expensive parse only on first mount.

**Intermediate Level**

Lazy init avoids **recomputing** initial state on every render.

**Expert Level**

Ensure **`init`** is **pure** and **deterministic** for SSR hydration consistency where applicable.

```tsx
import { useReducer } from "react";

function initTodos(raw: string | null): Todo[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Todo[];
  } catch {
    return [];
  }
}

export function useTodosFromStorage(key: string) {
  return useReducer(todoReducer, localStorage.getItem(key), (stored) => initTodos(stored));
}
```

---

### useReducer vs useState

**Beginner Level**

**useState**: simple independent values. **useReducer**: many **related** updates or **next state** depends on **previous** in complex ways.

**Intermediate Level**

**useReducer** shines with **multiple sub-values** that must stay **consistent**.

**Expert Level**

**XState** or **state machines** when flows dominate (checkout, wizards).

---

### Complex Logic and Action Creators

**Beginner Level**

**Action creators** are functions returning actions: `const addItem = (id: string) => ({ type: "add", id } as const)`.

**Intermediate Level**

Use **`as const`** for **literal** `type` fields.

**Expert Level**

Colocate action creators with **reducer** file; export **typed** `dispatch` wrappers for **components** to avoid malformed actions.

---

### Generic Reducers

**Beginner Level**

Rarely, **`function reducer<T>(state: State<T>, action: Action<T>)`—use when building **reusable** table state**.

**Intermediate Level**

Ensure **inference** at call site—often clearer to **duplicate** small reducers than over-abstract.

**Expert Level**

**Library code** (data grids) may expose generic reducers—document **invariants**.

---

## 5.6 useCallback Hook

### Basics of useCallback

**Beginner Level**

`useCallback(fn, deps)` returns a **memoized** function reference—stable across re-renders if **deps** unchanged.

**Real-time example**: Pass **`onSelect`** to **memoized** `ProductRow` so rows don’t all re-render when parent re-renders for unrelated state.

**Intermediate Level**

**React.memo** + **useCallback** work together: child receives **stable** props.

**Expert Level**

**React Compiler** may auto-memoize—manual `useCallback` may become less necessary over time; measure before blanket removal.

```tsx
import { memo, useCallback, useState } from "react";

const ProductRow = memo(function ProductRow({
  id,
  onAdd,
}: {
  id: string;
  onAdd: (id: string) => void;
}) {
  return (
    <button type="button" onClick={() => onAdd(id)}>
      Add {id}
    </button>
  );
});

export function ProductList({ ids }: { ids: string[] }) {
  const [cartCount, setCartCount] = useState(0);

  const onAdd = useCallback((id: string) => {
    setCartCount((c) => c + 1);
    void id;
  }, []);

  return (
    <div>
      <p>Cart items: {cartCount}</p>
      {ids.map((id) => (
        <ProductRow key={id} id={id} onAdd={onAdd} />
      ))}
    </div>
  );
}
```

#### Key Points — useCallback

- Stabilizes **function identity** for **deps** and **memo children**.
- **Deps** must be **complete**.
- Not a silver bullet—**profile** first.

---

### Memoizing and Dependency Array

**Beginner Level**

Include **all** values from outer scope used inside the callback—**eslint** helps.

**Intermediate Level**

If you need **latest** state without deps churn, combine **`useRef`** pattern for **event callbacks**.

**Expert Level**

**useCallback** returning **inline** functions still creates new inner closures—only the **outer** function identity is stable.

---

### Use Cases and Performance

**Beginner Level**

- Pass callbacks to **`React.memo`** children.
- **`useEffect`** dependency when effect calls a handler.

**Intermediate Level**

**Context** value functions—stabilize with **`useCallback`** + **`useMemo`** for the value object.

**Expert Level**

Avoid **premature** memoization—**measure** with React Profiler.

---

### Pitfalls of useCallback

**Beginner Level**

Wrong **deps** → **stale** closures (same class of bugs as `useEffect`).

**Intermediate Level**

**Over-memoization** adds complexity without gains for cheap children.

**Expert Level**

**Inline** `useCallback` that **allocates** objects/arrays in deps—still unstable if those are new each render.

---

## 5.7 useMemo Hook

### Basics of useMemo

**Beginner Level**

`useMemo(() => compute(), [deps])` **memoizes** a **computed value** between renders when **deps** unchanged.

**Real-time example**: **Dashboard** expensive aggregation of **sales** rows—recompute only when **`range`** or **`rows`** change.

**Intermediate Level**

`useMemo` does **not** guarantee computation only once—React may **discard** cache in the future; treat as **optimization hint**.

**Expert Level**

**Concurrent** rendering may **invoke** render multiple times—**pure** computations only; no side effects inside `useMemo`.

```tsx
import { useMemo } from "react";

type Row = { amount: number; region: string };

export function RegionalTotals({ rows, region }: { rows: Row[]; region: string }) {
  const total = useMemo(
    () => rows.filter((r) => r.region === region).reduce((s, r) => s + r.amount, 0),
    [rows, region]
  );
  return <output>{total}</output>;
}
```

#### Key Points — useMemo

- **Caches** derived values.
- **No side effects** inside factory.
- **Deps** must capture **all** inputs to the computation.

---

### Expensive Computations

**Beginner Level**

Use for **genuinely expensive** pure work—sorting large lists, complex charts data.

**Intermediate Level**

For **small** arrays, **plain** computation in render is often **faster** than memo bookkeeping.

**Expert Level**

**Web Workers** for **heavy** CPU off main thread—`useMemo` won’t fix that alone.

---

### useMemo vs useCallback

**Beginner Level**

- **`useMemo`**: memoize a **value** (result of calling function).
- **`useCallback(fn, deps)`** is equivalent to **`useMemo(() => fn, deps)`** for the function reference.

**Intermediate Level**

Choose **`useCallback`** for **readability** when memoizing **functions**.

---

### When to Use and Premature Optimization

**Beginner Level**

Don’t wrap **everything**—default to **simple** code.

**Intermediate Level**

**Profile** first; optimize **hot paths**.

**Expert Level**

**Semantic** use: stable **object** props to context consumers—`useMemo` for **context value** object.

---

## 5.8 useRef Hook with TypeScript

### Type Parameters for useRef

**Beginner Level**

- **`useRef<number | null>(null)`** for mutable **box** holding a number.
- **`useRef<HTMLInputElement>(null)`** for DOM nodes.

**Real-time example**: Focus **search** input in **social** header on shortcut.

**Intermediate Level**

**`.current` is mutable**—doesn’t trigger re-renders when changed.

**Expert Level**

Use **`RefObject<T>`** vs **`MutableRefObject<T>`** types from React—`useRef` overloads differ for **nullable** initial values.

```tsx
import { useEffect, useRef } from "react";

export function ChatComposer() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <textarea ref={inputRef} placeholder="Message…" />;
}
```

#### Key Points — Type Parameters

- **DOM**: element type matches **intrinsic** element.
- **Value refs**: initialize with **`null`** or the correct **initial** value.
- **No re-render** on `.current` change.

---

### DOM Elements and HTMLElement Types

**Beginner Level**

Use **`HTMLDivElement`**, **`HTMLButtonElement`**, etc., for **refs**—get **autocomplete** for DOM APIs.

**Intermediate Level**

**Nullable** refs: check **`ref.current`** before use.

**Expert Level**

**SVG** elements have specific types (`SVGSVGElement`, etc.).

---

### Mutable Values Without Re-renders

**Beginner Level**

Store **timer ids**, **last rendered** props, **subscription** handles in **`useRef`** to avoid **extra** renders.

**Real-time example**: **Debounced** search in **e-commerce** catalog.

**Intermediate Level**

Updating **ref** in **`useEffect`** vs render—both possible; avoid **reads** during render that depend on async **ref** writes unless careful.

---

### useRef vs useState

**Beginner Level**

**State**: changing it **re-renders**. **Ref**: **silent** mutation—use when UI **doesn’t** need to reflect the value.

**Intermediate Level**

**Render count**, **previous props** patterns use refs.

---

### Previous Values and Forward Refs

**Beginner Level**

**Previous value**: store **`prev` in ref** updated in **`useEffect`** after render.

**Intermediate Level**

**`forwardRef`** + **`useImperativeHandle`** for **parent** accessing **child** imperative API (see §5.9).

**Expert Level**

**Callback refs** `(el) => { ... }` for **measure** logic without `useRef`—sometimes simpler.

```tsx
import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
```

---

### Ref Types (RefObject vs MutableRefObject)

**Beginner Level**

When you pass **`useRef(null)`** to a DOM **`ref`**, TypeScript models **`RefObject<T>`** where **`.current` is readonly** in some typings—**mutable** refs used for **instance fields** differ.

**Intermediate Level**

**`useRef<number>(0)`** gives **mutable** ref with initial **0**.

**Expert Level**

**Component refs** with **`forwardRef`** and **`ComponentPropsWithRef`** for **library** components.

---

## 5.9 useImperativeHandle

### Basics of useImperativeHandle

**Beginner Level**

**`useImperativeHandle(ref, () => api, deps)`** exposes a **custom object** to parent **`ref`** instead of the raw DOM node—**escape hatch** for imperative actions (**focus**, **scroll**).

**Real-time example**: **Video player** exposes **`play()`** / **`pause()`** to parent **dashboard** widget.

**Intermediate Level**

Prefer **declarative** props when possible; use imperative handle for **non-React** APIs (maps, canvas, video).

**Expert Level**

**Stable** **`api`** object via **`useMemo`** inside factory when exposing multiple methods to avoid **parent** seeing new object identity each render—often combine with **`forwardRef`**.

```tsx
import { forwardRef, useImperativeHandle, useRef } from "react";

export type VideoHandle = { play: () => void; pause: () => void };

export const Video = forwardRef<VideoHandle, { src: string }>(function Video({ src }, ref) {
  const el = useRef<HTMLVideoElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      play: () => void el.current?.play(),
      pause: () => void el.current?.pause(),
    }),
    []
  );
  return <video ref={el} src={src} controls />;
});
```

#### Key Points — useImperativeHandle

- **Limit** surface area—don’t expose **everything**.
- Pair with **`forwardRef`** for **ref** forwarding.
- **Deps** if **callbacks** close over changing values.

---

### Customizing Ref and with forwardRef

**Beginner Level**

**Parent** does **`const r = useRef<VideoHandle>(null)`** and **`<Video ref={r} />`**—calls **`r.current?.play()`**.

**Intermediate Level**

**`useImperativeHandle`** **replaces** default **`ref`** forwarding unless you also **assign** underlying DOM ref via **`useRef`** patterns or merge refs.

---

### Use Cases

**Beginner Level**

Maps (**Mapbox**, **Leaflet**), **charts** (**D3** integration), **text editors**.

**Intermediate Level**

**Design system** components hiding **implementation** details—expose **`focus()`** only.

---

## 5.10 useLayoutEffect

### Basics of useLayoutEffect

**Beginner Level**

Like **`useEffect`** but fires **synchronously after DOM mutations** and **before** the browser paints—use when you must **read layout** and **write DOM** before user sees inconsistent frames.

**Real-time example**: **Tooltip** position based on **measured** anchor rect.

**Intermediate Level**

**Blocking**—can hurt performance if heavy; prefer **`useEffect`** unless you **need** synchronous layout.

**Expert Level**

**SSR**: `useLayoutEffect` warns—use **`useEffect`** for SSR-safe code or **`suppressHydrationWarning`** patterns carefully; **`useIsomorphicLayoutEffect`** wrapper is common.

```tsx
import { useLayoutEffect, useRef, useState } from "react";

export function MeasuredBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setWidth(rect.width);
  }, []);

  return <div ref={ref}>width={width}px</div>;
}
```

#### Key Points — useLayoutEffect

- **Measure** then **mutate** before paint.
- **Performance** cost—use sparingly.
- **SSR** caveats.

---

### useLayoutEffect vs useEffect

**Beginner Level**

**useEffect**: async-ish after paint—user may **flicker**. **useLayoutEffect**: sync before paint—**no flicker** but **blocks** paint.

**Intermediate Level**

**useEffect** for **data fetching**; **useLayoutEffect** for **DOM** synchronization.

---

### Synchronous and DOM Measurements

**Beginner Level**

Read **`offsetHeight`**, **`getBoundingClientRect`** in **`useLayoutEffect`** to avoid **mismatched** visual and state.

---

### When to Use useLayoutEffect

**Beginner Level**

**Animations** that need **correct starting** position, **auto-scrolling** chat to bottom on new message before paint.

**Intermediate Level**

If you can do it with **CSS** alone, prefer **CSS**.

---

## 5.11 useDebugValue

### Basics of useDebugValue

**Beginner Level**

**`useDebugValue(value)`** adds a **label** for custom hooks in **React DevTools**—helps **debug** hook state.

**Real-time example**: **`useChatConnection()`** shows **`"connected" | "reconnecting"`** in DevTools.

**Intermediate Level**

Optional **formatter**: **`useDebugValue(id, (id) => "User: " + id)`**.

**Expert Level**

Don’t put **secrets** in debug values—DevTools can leak in screenshots.

```tsx
import { useDebugValue, useState } from "react";

export function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useDebugValue(online ? "online" : "offline");
  return online;
}
```

#### Key Points — useDebugValue

- **Custom hooks** only (ignored elsewhere conceptually).
- Improves **DX** in DevTools.
- **Privacy** aware.

---

### Custom Hook Debugging and Formatting

**Beginner Level**

Use **second argument** to **lazy format** expensive summaries **only** when DevTools inspects.

---

## 5.12 Custom Hooks with TypeScript

### Creating Custom Hooks

**Beginner Level**

A function named **`useSomething`** that **calls other hooks**—extract **reusable** stateful logic.

**Real-time example**: **`useCartTotal()`** sums **e-commerce** cart from context + local promo state.

**Intermediate Level**

Return **stable** **tuples** or **objects**—document **contract** with explicit return type.

**Expert Level**

**Composable**: custom hooks calling custom hooks—keep **rules of hooks** satisfied.

```tsx
import { useMemo, useState } from "react";

export function useToggle(initial = false): [boolean, () => void] {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((o) => !o);
  return useMemo(() => [on, toggle] as const, [on]);
}
```

---

### Naming Conventions

**Beginner Level**

Prefix **`use`**, **PascalCase** after prefix is wrong—**`useOnlineStatus`**, not **`UseOnline`**.

**Intermediate Level**

Name by **behavior**, not **implementation** (`useFetch` vs `useAxios` unless axios-specific).

---

### Extracting and Sharing Logic

**Beginner Level**

Move **duplicated** `useState`+`useEffect` pairs from **Dashboard** widgets into **`useInterval`**, **`useDocumentTitle`**.

**Intermediate Level**

Co-locate hook file next to **feature** or in **`/hooks`** shared folder per team rules.

---

### Generic Custom Hooks

**Beginner Level**

**`function useLocalStorage<T>(key: string, initial: T)`**—persist **typed** JSON.

**Intermediate Level**

**Guard** parsing with **Zod** for **runtime** safety—not only **compile-time** types.

---

### Example: useToggle

**Beginner Level**

See **§Creating**—tuple **`[boolean, () => void]`** or object **`{ on, toggle }`**.

---

### Example: useFetch<T>

**Beginner Level**

Wrap **`useState`** for **`data`**, **`error`**, **`loading`** + **`useEffect`** for fetch when **`url`** changes; **abort** on cleanup.

**Intermediate Level**

Prefer **TanStack Query** in production for **caching**, **retries**, **deduping**.

```tsx
import { useEffect, useState } from "react";

type AsyncStatus = "idle" | "loading" | "success" | "error";

export function useFetchJson<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const ac = new AbortController();
    setStatus("loading");
    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<T>;
      })
      .then((d) => {
        setData(d);
        setStatus("success");
      })
      .catch((e) => {
        if ((e as { name?: string }).name === "AbortError") return;
        setError(e);
        setStatus("error");
      });
    return () => ac.abort();
  }, [url]);

  return { data, status, error } as const;
}
```

---

### Example: useLocalStorage<T>

**Beginner Level**

**Read** initial from **`localStorage`**, **`useState`**, **`useEffect`** to **write** back on change—handle **SSR** (`typeof window`).

**Intermediate Level**

**Storage** event for **cross-tab** sync.

```tsx
import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota */
    }
  }, [key, value]);

  const remove = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(initial);
  }, [key, initial]);

  return [value, setValue, remove] as const;
}
```

---

### Example: useDebounce<T>

**Beginner Level**

Return **debounced value** after **`delay`** ms of stability—**weather** search input.

**Intermediate Level**

**Timer** in **`useEffect`** + cleanup; generic **`T`** for any value type.

```tsx
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
```

---

### Example: useWindowSize

**Beginner Level**

Track **`innerWidth` / `innerHeight`** with **`resize`** listener—**dashboard** responsive panels.

```tsx
import { useEffect, useState } from "react";

type Size = { width: number; height: number };

export function useWindowSize(): Size {
  const [size, setSize] = useState<Size>({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}
```

---

### Example: usePrevious<T>

**Beginner Level**

Returns **previous** render’s value—compare **props** for **animations** or **diffs**.

---

### Return Types and Best Practices for Custom Hooks

**Beginner Level**

Explicit **`type UseCartReturn = { ... }`** and **`export function useCart(): UseCartReturn`** for **public** hooks.

**Intermediate Level**

Prefer **`as const`** tuples for **stable** literal unions in consumers.

**Expert Level**

**Test** hooks with **`@testing-library/react`** **`renderHook`**.

#### Key Points — Custom Hooks

- **Reuse** logic, not UI.
- **Type** returns for **API clarity**.
- **Document** assumptions (browser APIs, providers).

---

## Key Points (Chapter Summary)

- Hooks enable **state** and **effects** in **function components** with **clear rules**.
- **TypeScript** generics and **unions** make **state transitions** safer.
- **useEffect** synchronizes with **external systems**—**deps** and **cleanup** are critical.
- **useContext** + **useReducer** scale **shared** domain logic when used with **performance** awareness.
- **useMemo** / **useCallback** are **optimization** tools—**profile** before applying broadly.
- **useRef** holds **mutable** values and **DOM** nodes without **re-renders**.
- **useLayoutEffect** addresses **synchronous layout**; **`useDebugValue`** improves **DevTools** story for custom hooks.
- **Custom hooks** are the primary **composition** mechanism for **cross-cutting** React logic with **types**.

---

## Best Practices (Global)

- **Enable** `eslint-plugin-react-hooks` and treat **`exhaustive-deps`** seriously.
- **Prefer** deriving state in render when possible; use **reducers** for complex transitions.
- **Split** effects by **concern**; always **cancel** async work and **clean up** subscriptions.
- **Memoize** context values and **callbacks** passed to **memoized** children **when measured** necessary.
- **Type** **actions** as **discriminated unions**; use **`assertNever`** for **exhaustive** checks.
- **Document** custom hooks with **return types** and **examples**.
- **Reach** for **data-fetching libraries** for server state instead of hand-rolled **`useEffect`** fetch in large apps.
- **Avoid** **impossible states** with **boolean** combinations—use **unions** and **state machines**.

---

## Common Mistakes to Avoid

- **Calling hooks conditionally** or in **loops**—breaks React’s internal hook list.
- **Stale closures** from **missing** dependencies in **`useEffect`**, **`useMemo`**, **`useCallback`**.
- **Mutating** state **in place** (especially **arrays** and **objects**).
- **`useEffect`** **without** proper deps that **fetches** or **subscribes**—shows **wrong** data.
- **Forgetting** **cleanup** for listeners, timers, and **abort** controllers.
- **useLayoutEffect** for **non-layout** work—**blocks** painting unnecessarily.
- **Overusing** **`useMemo`/`useCallback`** without **profiling**—complexity without benefit.
- **Exposing** huge **imperative** surfaces via **`useImperativeHandle`** instead of **narrow** APIs.
- **Custom hooks** that **hide** **non-obvious** requirements (must be under **Router**, etc.) without **documentation** or **runtime checks**.

---

_End of Hooks chapter — refer to Context API, Events & Forms, and Lists & Keys chapters for adjacent patterns._
