# State Management (React + TypeScript)

**State** is data that changes over time and drives what users see. In React, **local component state** (via `useState` or class `setState`) is the default tool; you lift state up when multiple components must share it, and you derive values when they can be computed from existing state or props. This guide ties these ideas to **TypeScript** with practical patterns from **e-commerce**, **dashboards**, **todo**, **chat**, and **social** apps.

---

## 📑 Table of Contents

- [State Management (React + TypeScript)](#state-management-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [4.1 State Basics](#41-state-basics)
    - [What is State?](#what-is-state)
    - [State vs Props](#state-vs-props)
    - [Local State](#local-state)
    - [Immutability](#immutability)
    - [Async Updates](#async-updates)
  - [4.2 useState with TypeScript](#42-usestate-with-typescript)
    - [Inference](#inference)
    - [Explicit Types](#explicit-types)
    - [Declaring State](#declaring-state)
    - [Updating State](#updating-state)
    - [Functional Updates](#functional-updates)
    - [Objects in State](#objects-in-state)
    - [Arrays in State](#arrays-in-state)
    - [Multiple useState Hooks](#multiple-usestate-hooks)
    - [Lazy Initialization](#lazy-initialization)
    - [Union Types](#union-types)
  - [4.3 Class Component State (Legacy)](#43-class-component-state-legacy)
    - [this.state](#thisstate)
    - [setState](#setstate)
    - [setState Callback](#setstate-callback)
    - [Functional Updater](#functional-updater)
    - [Batching](#batching)
  - [4.4 State Update Patterns](#44-state-update-patterns)
    - [Objects](#objects)
    - [Nested Objects](#nested-objects)
    - [Arrays — Add](#arrays--add)
    - [Arrays — Remove](#arrays--remove)
    - [Arrays — Update](#arrays--update)
    - [Arrays — Filter](#arrays--filter)
    - [Arrays — Sort](#arrays--sort)
    - [Immer](#immer)
    - [Reducer Pattern](#reducer-pattern)
  - [4.5 State Lifting](#45-state-lifting)
    - [Lifting State Up](#lifting-state-up)
    - [Shared State](#shared-state)
    - [Inverse Data Flow](#inverse-data-flow)
    - [When to Lift](#when-to-lift)
  - [4.6 Derived State](#46-derived-state)
    - [Computing Derived Values](#computing-derived-values)
    - [Avoiding Redundant State](#avoiding-redundant-state)
    - [useMemo](#usememo)
    - [When to Avoid Derived State Anti-Patterns](#when-to-avoid-derived-state-anti-patterns)
  - [4.7 Best Practices](#47-best-practices)
    - [Minimize State](#minimize-state)
    - [Colocate State](#colocate-state)
    - [Do Not Mirror Props](#do-not-mirror-props)
    - [Structure](#structure)
    - [Normalized Shape](#normalized-shape)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 4.1 State Basics

### What is State?

**Beginner Level**

**State** is information the component **remembers** and that can **change**—for example, whether a **todo** item is done, the current **tab** in a **dashboard**, or the **quantity** in an **e-commerce** cart.

**Intermediate Level**

State is **not** props: props come **from outside**; state is **owned** by the component (or lifted owner). Updates to state **schedule re-renders** so the UI can reflect the new truth.

**Expert Level**

**Concurrent React** can **interrupt** renders—state updates must be **predictable** and **immutable** to avoid tearing. **External stores** (TanStack Query, Redux) complement **local** state for **server/cache** concerns.

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}
```

#### Key Points — What is State?

- State drives **UI over time**.
- Prefer **minimal** state—derive what you can.
- **Type** state so invalid states are **hard** to represent.

---

### State vs Props

**Beginner Level**

- **Props**: **inputs** from parent—read-only for the child.
- **State**: **internal** data the component controls (or lifted shared data).

**Real-time example**: **social media** `Post` receives **`author`** as props; **`liked`** might be local state or lifted depending on requirements.

**Intermediate Level**

**Callbacks** (`onLike`) let children **request** changes—parent owns truth if multiple views must sync.

**Expert Level**

**Controlled vs uncontrolled** inputs blur lines—state ownership is explicit in good designs.

```tsx
type PostProps = {
  author: string;
  body: string;
  likedInitially?: boolean;
  onToggleLike?: (id: string) => void;
  postId: string;
};

export function Post({ author, body, likedInitially = false, onToggleLike, postId }: PostProps) {
  const [liked, setLiked] = useState(likedInitially);

  function toggle() {
    const next = !liked;
    setLiked(next);
    onToggleLike?.(postId);
  }

  return (
    <article>
      <header>{author}</header>
      <p>{body}</p>
      <button type="button" aria-pressed={liked} onClick={toggle}>
        {liked ? "Unlike" : "Like"}
      </button>
    </article>
  );
}
```

#### Key Points — State vs Props

- **Single source of truth**—avoid duplicating the same fact in props and state.
- **Lift** when multiple children must agree.

---

### Local State

**Beginner Level**

**Local state** lives in one component—ideal for **UI-only** concerns: open/closed panels, draft text before submit.

**Intermediate Level**

**Colocate** state: keep it as **low** as possible until sharing is needed.

**Expert Level**

**Server state** is not local—use **query libraries** with caching.

```tsx
import { useState, type ReactNode } from "react";

export function CollapsibleSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
      </button>
      {open ? <div>{children}</div> : null}
    </section>
  );
}
```

#### Key Points — Local State

- Prefer **local** until proven **shared**.
- **UI state** vs **domain state**—often separate concerns.

---

### Immutability

**Beginner Level**

**Do not mutate** state objects/arrays in place—**replace** with new copies so React can detect changes.

**Intermediate Level**

Spread syntax, **`map`/`filter`**, or **Immer** produce new structures. **Mutation** breaks **`memo`** and time-travel debugging.

**Expert Level**

**Structural sharing** in libraries (Immer) keeps performance acceptable for large trees.

```tsx
import { useState } from "react";

type User = { id: string; name: string };

export function UserEditor({ initial }: { initial: User }) {
  const [user, setUser] = useState<User>(initial);

  function rename(name: string) {
    setUser((u) => ({ ...u, name }));
  }

  return <input value={user.name} onChange={(e) => rename(e.target.value)} />;
}
```

#### Key Points — Immutability

- Treat state as **immutable** even if React can’t enforce it.
- **Copy** nested levels you change.

---

### Async Updates

**Beginner Level**

`setState`/`setState` from `useState` is **async**—you may not read the new value immediately after calling it.

**Intermediate Level**

Use **functional updates** when next state depends on previous state:

```tsx
setCount((c) => c + 1);
```

**Expert Level**

**React 18+** batches updates in **promises/timeouts** and **native** handlers—fewer surprises.

```tsx
import { useState } from "react";

export function BatchDemo() {
  const [n, setN] = useState(0);

  function incrThree() {
    setN((x) => x + 1);
    setN((x) => x + 1);
    setN((x) => x + 1);
  }

  return (
    <button type="button" onClick={incrThree}>
      {n}
    </button>
  );
}
```

#### Key Points — Async Updates

- **Never** trust `state` immediately after `setState` in the same scope—use functional updates.
- **Batching** reduces renders—good for performance.

---

## 4.2 useState with TypeScript

### Inference

**Beginner Level**

TypeScript infers simple state:

```tsx
const [count, setCount] = useState(0); // number
```

**Intermediate Level**

**Union** inference from initial value—if you `useState(null)`, you may need a **generic** to include wider types.

**Expert Level**

**Discriminated unions** for state machines:

```tsx
type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

const [status, setStatus] = useState<Status>({ kind: "idle" });
```

---

### Explicit Types

**Beginner Level**

```tsx
const [items, setItems] = useState<string[]>([]);
```

**Intermediate Level**

**Readonly** arrays for immutable intent:

```tsx
const [points, setPoints] = useState<readonly number[]>([]);
```

---

### Declaring State

**Beginner Level**

One `useState` per concern or group related fields in an object.

**Intermediate Level**

Avoid **mega-objects** unless updates are atomic—split for **clarity**.

---

### Updating State

**Beginner Level**

Replace primitives directly:

```tsx
setCount(5);
```

**Intermediate Level**

For objects, **merge** carefully:

```tsx
setForm((f) => ({ ...f, email: next }));
```

---

### Functional Updates

**Beginner Level**

Always use when depending on prior value:

```tsx
setQty((q) => q + 1);
```

**Intermediate Level**

**Queues** of updates—functional form processes each on latest.

---

### Objects in State

**Beginner Level**

```tsx
type Filter = { query: string; minPrice: number };

const [filter, setFilter] = useState<Filter>({ query: "", minPrice: 0 });

setFilter((f) => ({ ...f, query: "shoes" }));
```

**Real-time example**: **e-commerce** filters.

---

### Arrays in State

**Beginner Level**

**Copy** then change:

```tsx
setTodos((todos) => [...todos, { id: crypto.randomUUID(), text, done: false }]);
```

---

### Multiple useState Hooks

**Beginner Level**

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

**Intermediate Level**

**useReducer** when many transitions are coupled.

---

### Lazy Initialization

**Beginner Level**

```tsx
const [state, setState] = useState(() => expensiveParse(localStorage.getItem("x")));
```

**Intermediate Level**

Initializer runs **once**—avoid heavy work without need.

---

### Union Types

**Beginner Level**

Model **steps** in a wizard:

```tsx
type Step = 1 | 2 | 3;
const [step, setStep] = useState<Step>(1);
```

**Expert Level**

**Exhaustive** handling with `switch` + **`never`** checks.

```tsx
import { useMemo, useState } from "react";

type AsyncData<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<AsyncData<T>>({ status: "idle" });

  async function load() {
    setState({ status: "loading" });
    try {
      const data = await fetcher();
      setState({ status: "success", data });
    } catch (e) {
      setState({ status: "error", error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  const label = useMemo(() => {
    switch (state.status) {
      case "idle":
        return "Idle";
      case "loading":
        return "Loading…";
      case "success":
        return `Got ${JSON.stringify(state.data)}`;
      case "error":
        return state.error;
      default: {
        const _exhaustive: never = state;
        return _exhaustive;
      }
    }
  }, [state]);

  return { state, load, label };
}
```

#### Key Points — useState + TS

- Provide **generics** when initial value is **`null`** or **narrow**.
- Prefer **unions** for **mutually exclusive** states.
- **Lazy init** for expensive **first** read.

---

## 4.3 Class Component State (Legacy)

### this.state

**Beginner Level**

```tsx
state = { qty: 1 };
```

**Intermediate Level**

**Do not** assign directly except in constructor/field init—use **`setState`**.

---

### setState

**Beginner Level**

```tsx
this.setState({ qty: 2 });
```

**Intermediate Level**

**Partial merges** for shallow merge at top level.

---

### setState Callback

**Beginner Level**

```tsx
this.setState({ qty: 2 }, () => console.log("updated"));
```

**Intermediate Level**

Useful for **DOM** reads after update—prefer **`useEffect`** in functions.

---

### Functional Updater

**Beginner Level**

```tsx
this.setState((prev) => ({ qty: prev.qty + 1 }));
```

---

### Batching

**Beginner Level**

React **batches** multiple `setState` calls in same event.

**Intermediate Level**

**React 18** batches more broadly—**fewer** intermediate renders.

```tsx
import { Component } from "react";

type Props = Record<string, never>;

type State = { qty: number };

export class CartQty extends Component<Props, State> {
  state: State = { qty: 0 };

  inc = () => {
    this.setState((s) => ({ qty: s.qty + 1 }));
  };

  render() {
    return (
      <button type="button" onClick={this.inc}>
        {this.state.qty}
      </button>
    );
  }
}
```

#### Key Points — Class State

- **Functional updaters** for safe increments.
- **Legacy**—use **hooks** for new code.

---

## 4.4 State Update Patterns

### Objects

**Beginner Level**

**Shallow merge**:

```tsx
setProfile((p) => ({ ...p, city: "Berlin" }));
```

**Intermediate Level**

**Nested** requires copying **each level** up to the changed node.

---

### Nested Objects

**Beginner Level**

```tsx
type Address = { city: string; zip: string };
type User = { name: string; address: Address };

setUser((u) => ({
  ...u,
  address: { ...u.address, zip: "10115" },
}));
```

**Real-time example**: **dashboard** user profile editor.

---

### Arrays — Add

**Beginner Level**

```tsx
setItems((xs) => [...xs, item]);
```

---

### Arrays — Remove

**Beginner Level**

```tsx
setItems((xs) => xs.filter((x) => x.id !== id));
```

---

### Arrays — Update

**Beginner Level**

```tsx
setItems((xs) => xs.map((x) => (x.id === id ? { ...x, done: true } : x)));
```

---

### Arrays — Filter

**Beginner Level**

Non-mutating **filter** returns new array—assign as new state.

---

### Arrays — Sort

**Beginner Level**

**Copy first**—sort is **mutating**:

```tsx
setRows((rows) => [...rows].sort((a, b) => a.title.localeCompare(b.title)));
```

**Intermediate Level**

**Stable** sorting for UX in **tables**.

---

### Immer

**Beginner Level**

**Immer** lets you write **draft-style** updates:

```tsx
import { produce } from "immer";

setState((s) =>
  produce(s, (draft) => {
    draft.users[0].name = "Ada";
  })
);
```

**Intermediate Level**

Great for **deep** trees—**profile** before adopting.

---

### Reducer Pattern

**Beginner Level**

**`useReducer`** for complex transitions:

```tsx
type Action = { type: "add"; text: string } | { type: "toggle"; id: string };

function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      return [...state, { id: crypto.randomUUID(), text: action.text, done: false }];
    case "toggle":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    default:
      return state;
  }
}
```

**Expert Level**

**Redux** scales **reducer** pattern app-wide—**RTK** adds ergonomics.

```tsx
import { useReducer } from "react";

type Todo = { id: string; text: string; done: boolean };

type Action =
  | { type: "add"; text: string }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string };

function todoReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      return [...state, { id: crypto.randomUUID(), text: action.text, done: false }];
    case "toggle":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "remove":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <div>
      <button type="button" onClick={() => dispatch({ type: "add", text: "Buy milk" })}>
        Add sample
      </button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => dispatch({ type: "toggle", id: t.id })}
              />
              {t.text}
            </label>
            <button type="button" onClick={() => dispatch({ type: "remove", id: t.id })}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Key Points — Patterns

- **Immutable** updates keep **predictable** React behavior.
- **Reducer** for **event-heavy** state machines.
- **Immer** for **deep** updates—mind **bundle** size.

---

## 4.5 State Lifting

### Lifting State Up

**Beginner Level**

Move shared state to **closest common ancestor** so siblings can read/update via **props**.

**Real-time example**: **e-commerce** filters and product list share **filter state** in parent.

---

### Shared State

**Beginner Level**

One owner holds truth; children receive **values** and **callbacks**.

---

### Inverse Data Flow

**Beginner Level**

Parents pass **`onChange`** handlers; children call them with **new values**.

---

### When to Lift

**Beginner Level**

Lift when **two or more** components must **stay in sync**.

**Intermediate Level**

**Avoid** lifting too early—**props drilling** pain signals **context** or **composition** alternatives.

**Expert Level**

**Colocated** server state with **TanStack Query** reduces lifting for **remote** data.

```tsx
import { useMemo, useState } from "react";

type Product = { id: string; title: string; price: number };

const SAMPLE: Product[] = [
  { id: "p1", title: "Keyboard", price: 120 },
  { id: "p2", title: "Mouse", price: 40 },
];

function FilterBar({
  query,
  onQuery,
}: {
  query: string;
  onQuery: (q: string) => void;
}) {
  return <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search" />;
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.title} — ${p.price}
        </li>
      ))}
    </ul>
  );
}

export function Catalog() {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => SAMPLE.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div>
      <FilterBar query={query} onQuery={setQuery} />
      <ProductList products={visible} />
    </div>
  );
}
```

#### Key Points — Lifting

- **Shared state** belongs to the **ancestor** that can reach all consumers.
- **Callbacks** propagate **up**; **data** flows **down**.

---

## 4.6 Derived State

### Computing Derived Values

**Beginner Level**

If you can compute `Y` from `X` during render, **do not** store `Y` in state.

**Example**: **cart** subtotal from line items.

---

### Avoiding Redundant State

**Beginner Level**

**Bad** duplicate: storing **`items`** and **`filteredItems`** when filter is separate.

**Better**: store **`items` + `query`**, derive **`filtered`**.

---

### useMemo

**Beginner Level**

**Memoize** expensive pure computations:

```tsx
const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
```

**Intermediate Level**

**Not** for every tiny calculation—**memoize** when profiling shows cost.

**Expert Level**

**Referential stability** for downstream **`memo`** components:

```tsx
const chartData = useMemo(() => transformSeries(raw), [raw]);
```

---

### When to Avoid Derived State Anti-Patterns

**Beginner Level**

**Anti-pattern**: `useEffect` to set state from props/state when a **render-time** expression would suffice.

**Intermediate Level**

**Exception**: **expensive** IO—use **effects** with care, not for simple derivations.

**Expert Level**

**Controlled components** intentionally mirror props with **keys** to reset—different from redundant duplication.

```tsx
import { useMemo, useState } from "react";

type Line = { id: string; qty: number; unitPrice: number };

export function CartSummary({ lines }: { lines: Line[] }) {
  const [taxRate, setTaxRate] = useState(0.08);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    const taxAmt = sub * taxRate;
    return { subtotal: sub, tax: taxAmt, total: sub + taxAmt };
  }, [lines, taxRate]);

  return (
    <aside>
      <label>
        Tax rate{" "}
        <input
          type="number"
          step="0.01"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
      </label>
      <dl>
        <dt>Subtotal</dt>
        <dd>{subtotal.toFixed(2)}</dd>
        <dt>Tax</dt>
        <dd>{tax.toFixed(2)}</dd>
        <dt>Total</dt>
        <dd>{total.toFixed(2)}</dd>
      </dl>
    </aside>
  );
}
```

#### Key Points — Derived State

- **Derive** when possible; **store** minimal facts.
- **`useMemo`** for **cost** or **stable references**—not by default.

---

## 4.7 Best Practices

### Minimize State

**Beginner Level**

**Fewer** moving parts → fewer bugs. Ask: “Can this be computed?”

**Intermediate Level**

**URL state** for shareable **dashboard** filters (`?sort=price`).

---

### Colocate State

**Beginner Level**

Keep state **near** where it is used until sharing is required.

---

### Do Not Mirror Props

**Beginner Level**

**Avoid**:

```tsx
const [value, setValue] = useState(props.value);
```

**unless** you intentionally need **editable** fork—then **reset** with **`key`** when props identity changes.

---

### Structure

**Beginner Level**

**Group** related fields; **name** setters clearly (`setFilter` vs `setF`).

**Intermediate Level**

**Normalized** data for large apps (by id).

---

### Normalized Shape

**Beginner Level**

Instead of **nested arrays everywhere**, store **`byId`** and **`allIds`**:

```tsx
type State = {
  byId: Record<string, Product>;
  allIds: string[];
};
```

**Intermediate Level**

**Redux** docs describe this pattern well—applies to **hooks** too.

**Expert Level**

**Selectors** memoize derived views (reselect).

```tsx
type Product = { id: string; title: string; price: number };

type CatalogState = {
  productsById: Record<string, Product>;
  productIds: string[];
};

export function selectVisibleProducts(state: CatalogState, query: string): Product[] {
  const q = query.trim().toLowerCase();
  return state.productIds
    .map((id) => state.productsById[id])
    .filter((p) => p.title.toLowerCase().includes(q));
}
```

#### Key Points — Practice

- **Minimize**, **colocate**, **normalize** at scale.
- **Avoid** prop mirroring without **`key`** reset strategy.

---

## Key Points (Chapter Summary)

- **State** is mutable-over-time **data** owned by components; **props** are inputs.
- **Immutable** updates and **functional** setters keep concurrent rendering safe.
- **`useState`** + **TypeScript unions** model **states** cleanly; **`useReducer`** for complex transitions.
- **Lift** state to the **nearest** common ancestor for **shared** truth.
- **Derive** values when possible; **`useMemo`** when computation or **reference** stability matters.
- **Normalize** large relational **client** state for **predictable** updates.

---

## Best Practices (Global)

1. **Start minimal**—prove the need before adding state.
2. **Type** state as **precisely** as business rules allow.
3. **Separate** **server state** (query/cache) from **UI state** (`useState`).
4. **Use functional updates** whenever the next state depends on the **previous**.
5. **Avoid** deep mutation—**Immer** if ergonomics demand it.
6. **URL** and **storage** are stateful too—use intentionally for **shareable** **dashboard** views.
7. **Test** state transitions—especially **reducers**—as pure functions.
8. **Measure** before **`useMemo`**/`memo`—avoid premature optimization.

---

## Common Mistakes to Avoid

1. **Mutating** arrays/objects in state—**breaks** updates and **`memo`**.
2. **Storing** what you can **derive** from other state/props.
3. **Mirroring props** without a controlled/**reset** strategy.
4. **Skipping** functional updates when using **stale** closures in rapid events.
5. **Lifting** too high too early—**prop drilling** without **context** where appropriate.
6. **Sorting** arrays **in place**—**copy** first.
7. **Effects** to **sync** derived values that belong in **render**—causes **extra** passes.
8. **Giant** `useState` objects without **reducers** or **split**—hard to reason about.

---

*End of State Management notes (React + TypeScript).*
