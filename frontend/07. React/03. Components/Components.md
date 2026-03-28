# Components (React + TypeScript)

**Components** are the building blocks of React applications: independent, reusable pieces of UI that accept **typed inputs (props)** and return **React elements**. This guide covers **function components** (modern default), **legacy class components**, **props**, **children**, **lifecycle**, and **pure rendering** optimizations.

---

## 📑 Table of Contents

- [Components (React + TypeScript)](#components-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [3.1 Component Basics](#31-component-basics)
    - [What is a Component?](#what-is-a-component)
    - [Composition](#composition)
    - [Reusability](#reusability)
    - [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
    - [Naming Conventions](#naming-conventions)
  - [3.2 Function Components with TypeScript](#32-function-components-with-typescript)
    - [Syntax](#syntax)
    - [Arrow vs Function Declarations](#arrow-vs-function-declarations)
    - [Exports](#exports)
    - [Return Types](#return-types)
    - [React.FC vs Plain Function](#reactfc-vs-plain-function)
  - [3.3 Class Components (Legacy)](#33-class-components-legacy)
    - [Syntax](#syntax-1)
    - [Constructor](#constructor)
    - [render](#render)
    - [this Binding](#this-binding)
    - [When to Use Class Components](#when-to-use-class-components)
  - [3.4 Props with TypeScript](#34-props-with-typescript)
    - [Interface vs Type](#interface-vs-type)
    - [Passing Props](#passing-props)
    - [Accessing Props](#accessing-props)
    - [Readonly Props](#readonly-props)
    - [Default Props](#default-props)
    - [Destructuring](#destructuring)
    - [Spread Props](#spread-props)
    - [Optional vs Required](#optional-vs-required)
    - [Inference](#inference)
    - [Generic Components](#generic-components)
  - [3.5 Children Prop](#35-children-prop)
    - [ReactNode](#reactnode)
    - [Single vs Multiple Children](#single-vs-multiple-children)
    - [Render Props](#render-props)
    - [PropsWithChildren](#propswithchildren)
    - [Children API (Legacy Patterns)](#children-api-legacy-patterns)
  - [3.6 Component Lifecycle](#36-component-lifecycle)
    - [Mounting](#mounting)
    - [Updating](#updating)
    - [Unmounting](#unmounting)
    - [Error Boundaries](#error-boundaries)
  - [3.7 Pure Components](#37-pure-components)
    - [PureComponent](#purecomponent)
    - [Shallow Comparison](#shallow-comparison)
    - [React.memo](#reactmemo)
    - [Custom Comparison](#custom-comparison)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices](#best-practices)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 3.1 Component Basics

### What is a Component?

**Beginner Level**

A **component** is a function (or class) that returns **UI**—typically JSX. You reuse it like LEGO blocks: `<Header />`, `<ProductCard />`, `<Footer />`. A **real-time example**: a **todo app** has `TodoInput`, `TodoList`, and `TodoItem`—each focused on one concern.

**Intermediate Level**

Components encapsulate **structure**, **behavior**, and **styling hooks** (via classes or CSS modules). They accept **props** as inputs and may own **state** (via hooks or class fields). In a **dashboard**, charts and filters are separate components composed on a page.

**Expert Level**

Components are **not** always DOM—**portals**, **context providers**, and **suspense boundaries** are components too. **Server Components** (frameworks) blur lines: some components never ship to the client. TypeScript models **props** as contracts; **discriminated unions** encode state machines.

```tsx
type Props = { title: string };

export function Panel({ title }: Props) {
  return (
    <section aria-labelledby="panel-title">
      <h2 id="panel-title">{title}</h2>
    </section>
  );
}
```

#### Key Points — What is a Component?

- Components are **reusable UI units** with explicit **props**.
- **Function components + hooks** are the modern default.
- TypeScript makes **contracts** explicit and refactor-safe.

---

### Composition

**Beginner Level**

**Composition** means building big UIs by **nesting** smaller components—prefer **has-a** relationships over inheritance.

**Real-time example**: **e-commerce** product page composes `Gallery`, `BuyBox`, `Reviews`.

**Intermediate Level**

Patterns: **container/presentational**, **compound components** (`<Tabs><Tabs.List/></Tabs>`), **slots** via `children` or named props. **Social media** `Post` might compose `Header`, `Media`, `Actions`.

**Expert Level**

**Inversion of control**: parents pass **render functions** or **elements** as props for flexibility. **Headless** UI libraries expose state/logic; you supply JSX.

```tsx
import type { ReactNode } from "react";

type PageProps = { header: ReactNode; sidebar: ReactNode; main: ReactNode };

export function AppShell({ header, sidebar, main }: PageProps) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{main}</main>
    </div>
  );
}
```

#### Key Points — Composition

- Prefer **nesting** and **props** over **inheritance**.
- **Named regions** scale better than overloaded `children` for complex layouts.

---

### Reusability

**Beginner Level**

Reusable components avoid **copy-paste**—one `Button` used across **todo**, **chat**, and **admin** screens.

**Intermediate Level**

Balance **abstraction**: too generic (`<Thing />`) hurts readability; too specific duplicates code. Parameterize with **props** and **variants**. **Design tokens** unify styling.

**Expert Level**

**Storybook** documents reusable components; **visual regression** tests catch drift. **Tree-shaking** and **barrel files** impact bundles—export intentionally.

```tsx
type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: Variant;
};

const variantClass: Record<Variant, string> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
};

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  return <button {...rest} className={clsx("btn", variantClass[variant], className)} />;
}
```

#### Key Points — Reusability

- **Parametrize** behavior and appearance—don’t fork prematurely.
- Document **props** and **usage** in Storybook or similar.

---

### Single Responsibility Principle (SRP)

**Beginner Level**

Each component should do **one job** well: `PriceTag` shows price; it should not also fetch exchange rates unless that is its explicit purpose.

**Intermediate Level**

Split **fetching** from **presentation** when testing and reuse matter. A **weather app** might use `useWeather()` hook + `WeatherCard` UI.

**Expert Level**

**SRP conflicts** with **colocation**—group related code together until boundaries emerge. **Refactor** when files grow hard to navigate or tests become brittle.

```tsx
// Presentation-only: easy to test
export function CartTotal({ subtotal, tax, total }: { subtotal: number; tax: number; total: number }) {
  return (
    <dl>
      <dt>Subtotal</dt>
      <dd>{subtotal.toFixed(2)}</dd>
      <dt>Tax</dt>
      <dd>{tax.toFixed(2)}</dd>
      <dt>Total</dt>
      <dd>{total.toFixed(2)}</dd>
    </dl>
  );
}
```

#### Key Points — SRP

- **Separate** data loading from **pure UI** when beneficial.
- Avoid **god components**—split by **behavior** and **test surface**.

---

### Naming Conventions

**Beginner Level**

- **PascalCase** for components: `UserAvatar`.
- **camelCase** for props/functions: `onClick`, `isOpen`.

**Intermediate Level**

Prefix **event handlers** with `on` in props (`onSave`), implementation handlers with `handle` (`handleSave`). Boolean props: `is`, `has`, `should`.

**Expert Level**

Filename alignment: `UserAvatar.tsx` exporting `UserAvatar`. **Consistent** default vs named exports across the codebase—pick one style per project.

```tsx
type UserAvatarProps = {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  onError?: () => void;
};

export function UserAvatar({ src, alt, size = "md", onError }: UserAvatarProps) {
  return <img src={src} alt={alt} data-size={size} onError={onError} />;
}
```

#### Key Points — Naming

- **PascalCase** components match JSX usage.
- **Verb prefixes** clarify events vs booleans.

---

## 3.2 Function Components with TypeScript

### Syntax

**Beginner Level**

```tsx
import type { FC } from "react";

export const Greeting: FC<{ name: string }> = ({ name }) => {
  return <p>Hello, {name}</p>;
};
```

Or without `FC`:

```tsx
export function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}
```

**Real-time example**: **chat app** `MessageBubble` as a function component.

**Intermediate Level**

Add explicit **`Props`** types/interfaces for readability. Use **`ComponentProps<"button">`** to extend intrinsic elements.

**Expert Level**

**Overload** functions for complex prop unions if needed—rare in app code, more in libraries.

```tsx
type GreetingProps = { name: string; emphasis?: boolean };

export function Greeting({ name, emphasis = false }: GreetingProps) {
  return emphasis ? <strong>Hello, {name}</strong> : <span>Hello, {name}</span>;
}
```

#### Key Points — Syntax

- **Annotate props** with `type` or `interface`.
- Start simple; add **generics** when patterns repeat.

---

### Arrow vs Function Declarations

**Beginner Level**

**Function declarations** are hoisted; **arrow** components are **const** bindings—both work. Pick **one** style for consistency.

**Intermediate Level**

**Function declarations** often read better for top-level components; **arrows** for **small** inline components or callbacks.

**Expert Level**

**Display names** for HOCs—function names infer better in DevTools. **Memo**/`forwardRef` wrappers may need **`displayName`**.

```tsx
export const CompactMetric = ({ value }: { value: number }) => <span>{value}</span>;

export function MetricDetails({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
```

#### Key Points — Arrow vs Function

- **Consistency** matters more than the choice itself.
- **function** keyword can improve **stack traces** slightly in some setups.

---

### Exports

**Beginner Level**

**Named exports** scale better for refactoring; **default exports** allow flexible import names—teams often prefer **named**.

**Intermediate Level**

**Barrel** files (`index.ts`) re-export—watch for **circular imports** and **bundle size** if barrels become huge.

**Expert Level**

**Package** `exports` map in `package.json` for libraries; **tree-shaking** prefers **named** ESM exports.

```tsx
// Named export (preferred in many codebases)
export function Toolbar() {
  return <nav aria-label="Toolbar">...</nav>;
}
```

#### Key Points — Exports

- Prefer **named exports** for **refactorability**.
- Avoid **barrel** over-aggregation without need.

---

### Return Types

**Beginner Level**

Often **inferred**. You can annotate:

```tsx
import type { ReactElement } from "react";

export function Icon(): ReactElement {
  return <svg aria-hidden="true" />;
}
```

**Intermediate Level**

Use **`JSX.Element`**, **`ReactElement`**, or **`ReactNode`** intentionally:

- `ReactNode`: widest (strings, numbers, fragments, arrays, null, undefined).
- `ReactElement`: a single element.
- `JSX.Element`: similar to `ReactElement` in many setups.

**Expert Level**

**void** returns are invalid for components—must return **`null`** if nothing to render.

```tsx
import type { ReactNode } from "react";

export function Maybe({ when, children }: { when: boolean; children: ReactNode }): ReactNode {
  return when ? children : null;
}
```

#### Key Points — Return Types

- **`ReactNode`** is flexible for wrappers.
- **`null`** explicitly means **no render**.

---

### React.FC vs Plain Function

**Beginner Level**

`React.FC` (or `FC`) historically provided **`children` implicitly**—this is now discouraged by many teams because it **hides** `children` in the type signature.

**Intermediate Level**

Prefer **explicit props**:

```tsx
type Props = { title: string; children?: React.ReactNode };

export function Card({ title, children }: Props) {
  return (
    <article>
      <h2>{title}</h2>
      {children}
    </article>
  );
}
```

**Expert Level**

`React.FC` also had quirks with **`defaultProps`** in older patterns. Modern codebases favor **plain functions** + explicit types.

```tsx
// Plain function + explicit children typing (recommended pattern)
import type { ReactNode } from "react";

type CardProps = { title: string; children?: ReactNode };

export function Card({ title, children }: CardProps) {
  return (
    <section>
      <header>{title}</header>
      {children}
    </section>
  );
}
```

#### Key Points — React.FC

- **Avoid `FC`** unless you know why you need it.
- Always **type `children` explicitly** when present.

---

## 3.3 Class Components (Legacy)

### Syntax

**Beginner Level**

```tsx
import { Component } from "react";

type Props = { sku: string };

type State = { qty: number };

export class BuyBox extends Component<Props, State> {
  state: State = { qty: 1 };

  render() {
    return (
      <div>
        <p>SKU: {this.props.sku}</p>
        <p>Qty: {this.state.qty}</p>
      </div>
    );
  }
}
```

**Real-time example**: legacy **e-commerce** codebases may still contain class components.

**Intermediate Level**

Lifecycle methods (`componentDidMount`, …) map loosely to hooks—but not 1:1. Prefer **function components** for new code.

**Expert Level**

**Error boundaries** must be classes (or framework support)—`componentDidCatch`. **Refs** on classes expose **instances**.

#### Key Points — Class Syntax

- **`Component<Props, State>`** generics type props/state.
- **New code**: prefer **functions + hooks**.

---

### Constructor

**Beginner Level**

Initialize state or bind methods:

```tsx
constructor(props: Props) {
  super(props);
  this.state = { qty: 1 };
}
```

**Intermediate Level**

**Field** syntax avoids constructor boilerplate for state. **Don’t** call `setState` in constructor.

**Expert Level**

**Derived state** from props in constructor is usually wrong—prefer **keys** or **effects** (hooks) or **`getDerivedStateFromProps`** in rare class cases.

---

### render

**Beginner Level**

`render()` returns JSX—must be **pure** (no side effects).

**Intermediate Level**

Split **child components** instead of huge `render` methods.

**Expert Level**

**StrictMode** may double-invoke lifecycles in development—`render` must remain pure.

---

### this Binding

**Beginner Level**

Class methods used as callbacks may need **binding**:

```tsx
constructor(props: Props) {
  super(props);
  this.inc = this.inc.bind(this);
}
```

Or use **class fields**:

```tsx
inc = () => {
  this.setState((s) => ({ qty: s.qty + 1 }));
};
```

**Intermediate Level**

**Arrow functions** in render create new identities—can cause extra re-renders in children if passed as props.

**Expert Level**

Prefer **field arrows** for stable handlers when profiling demands it.

---

### When to Use Class Components

**Beginner Level**

**Rarely** for new apps—learn them to **read old code** and **error boundaries**.

**Intermediate Level**

**Error boundaries** historically required classes; React 19+ introduces hooks for error reporting in some experimental paths—verify current docs for your version.

**Expert Level**

**Third-party** libraries may still export class APIs—interop remains relevant.

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { error: Error | null };

export class PageBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI error", error, info.componentStack);
  }

  render() {
    if (this.state.error) return <p role="alert">Something went wrong.</p>;
    return this.props.children;
  }
}
```

#### Key Points — Class Components

- Use classes when **required** (some boundaries) or **maintaining** legacy.
- Prefer **hooks** for new logic.

---

## 3.4 Props with TypeScript

### Interface vs Type

**Beginner Level**

Both work for props:

```tsx
interface UserCardProps {
  name: string;
  avatarUrl: string;
}

type UserCardProps = {
  name: string;
  avatarUrl: string;
};
```

**Intermediate Level**

**Interfaces** merge via declaration merging; **types** use unions/intersections flexibly. For props, **either** is fine—**pick team convention**.

**Expert Level**

**Discriminated unions** are often easier with **`type`**:

```tsx
type ButtonProps =
  | { href: string; children: React.ReactNode }
  | { onClick: () => void; children: React.ReactNode };
```

#### Key Points — Interface vs Type

- **Consistency** beats theoretical purity.
- **Unions** for **mutually exclusive** props.

---

### Passing Props

**Beginner Level**

```tsx
<UserCard name="Ada" avatarUrl="/a.png" />
```

**Intermediate Level**

Spread:

```tsx
const props = { name: "Ada", avatarUrl: "/a.png" } as const;
<UserCard {...props} />
```

**Expert Level**

**Conditional spreads** with care—TypeScript narrowing may need help.

---

### Accessing Props

**Beginner Level**

**Destructuring**:

```tsx
function UserCard({ name, avatarUrl }: UserCardProps) {
  return (
    <figure>
      <img src={avatarUrl} alt="" />
      <figcaption>{name}</figcaption>
    </figure>
  );
}
```

**Intermediate Level**

**Rest props** for DOM passthrough:

```tsx
function Input(props: React.ComponentProps<"input">) {
  return <input {...props} />;
}
```

---

### Readonly Props

**Beginner Level**

Props should be **treated as immutable**—React does not enforce this, but TypeScript can:

```tsx
type Props = Readonly<{ count: number }>;
```

**Intermediate Level**

**Readonly** at top level does not deeply freeze nested objects—use **`Readonly`** utility or **`immutable`** patterns manually.

---

### Default Props

**Beginner Level**

**Default parameters**:

```tsx
function Badge({ text = "New" }: { text?: string }) {
  return <span>{text}</span>;
}
```

**Intermediate Level**

**defaultProps** on functions is legacy/uncommon in TS-first codebases—prefer **parameter defaults**.

---

### Destructuring

**Beginner Level**

Pull values from props object in signature—clear and concise.

**Intermediate Level**

Rename: `({ user: u }: { user: User })`.

**Expert Level**

**Exhaustive** checks with unions—destructure discriminants carefully.

---

### Spread Props

**Beginner Level**

Forward all unknown props:

```tsx
type BoxProps = React.ComponentProps<"div">;

export function Box({ className, ...rest }: BoxProps) {
  return <div className={clsx("box", className)} {...rest} />;
}
```

---

### Optional vs Required

**Beginner Level**

```tsx
type Props = { title: string; subtitle?: string };
```

**Intermediate Level**

**Required** all fields with **`Required<T>`** utility when building from partial base.

---

### Inference

**Beginner Level**

`ComponentProps<typeof Button>` infers props from a component—great for **wrappers**.

```tsx
import type { ComponentProps } from "react";
import { Button } from "./Button";

type IconButtonProps = ComponentProps<typeof Button> & { icon: React.ReactNode };

export function IconButton({ icon, children, ...rest }: IconButtonProps) {
  return (
    <Button {...rest}>
      {icon} {children}
    </Button>
  );
}
```

---

### Generic Components

**Beginner Level**

Components can be **generic functions** (with care):

```tsx
type SelectProps<T> = {
  value: T;
  options: T[];
  getLabel: (item: T) => string;
  onChange: (value: T) => void;
};

export function Select<T>(props: SelectProps<T>) {
  const { value, options, getLabel, onChange } = props;
  return (
    <select value={String(value)} onChange={(e) => onChange(e.target.value as unknown as T)}>
      {options.map((opt) => (
        <option key={getLabel(opt)} value={String(opt)}>
          {getLabel(opt)}
        </option>
      ))}
    </select>
  );
}
```

**Expert Level**

**Typing generic components** with `forwardRef` is more verbose—use **patterns from** community libraries (Radix, React Aria).

#### Key Points — Props

- Use **`ComponentProps`** or **`ComponentPropsWithoutRef`** for **DOM** extension.
- **Generics** for reusable **list/select** components.

---

## 3.5 Children Prop

### ReactNode

**Beginner Level**

`React.ReactNode` is the usual type for `children`—includes **`null`**, **`undefined`**, strings, numbers, fragments, arrays, portals.

**Real-time example**: **dashboard** `Card` accepts arbitrary content.

**Intermediate Level**

If you need **only elements**, consider `ReactElement` or `ReactElement | ReactElement[]`.

**Expert Level**

**Never** use `React.FC` just to get `children`—type explicitly.

```tsx
import type { ReactNode } from "react";

type CardProps = { title: string; children: ReactNode };

export function Card({ title, children }: CardProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

---

### Single vs Multiple Children

**Beginner Level**

`children` can be **one** node or **array**—`React.Children` utilities help in advanced cases.

**Intermediate Level**

Prefer **named props** (`header`, `footer`) when you need **fixed regions** instead of inspecting `children`.

---

### Render Props

**Beginner Level**

Pass a **function** as prop to customize rendering:

```tsx
type Props<T> = { items: T[]; renderItem: (item: T) => React.ReactNode };

export function List<T>({ items, renderItem }: Props<T>) {
  return <ul>{items.map((it) => renderItem(it))}</ul>;
}
```

**Intermediate Level**

Often replaced by **hooks**, but still valuable for **component injection** and **libraries**.

---

### PropsWithChildren

**Beginner Level**

Utility type:

```tsx
import type { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{ title: string }>;

export function Layout({ title, children }: LayoutProps) {
  return (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
```

---

### Children API (Legacy Patterns)

**Beginner Level**

`React.Children.map`, `only`, `count`—use sparingly.

**Intermediate Level**

**Fragile**—breaks with arrays/fragments unexpectedly in edge cases. Prefer **explicit props**.

**Expert Level**

Some **animation** libraries still traverse children—know the costs and **alternatives**.

```tsx
import { Children } from "react";

export function WithIndices({ children }: { children: React.ReactNode }) {
  return (
    <>
      {Children.map(children, (child, idx) => (
        <span key={idx} data-index={idx}>
          {child}
        </span>
      ))}
    </>
  );
}
```

#### Key Points — Children

- Prefer **explicit** APIs over **magic** child inspection.
- **`PropsWithChildren`** saves typing when `children` is standard.

---

## 3.6 Component Lifecycle

### Mounting

**Beginner Level**

Function components **mount** when inserted into the tree. **`useEffect(() => ..., [])`** runs after first paint—similar spirit to `componentDidMount`.

**Real-time example**: **weather app** fetches forecast on mount.

**Intermediate Level**

**StrictMode** double-invokes effects in development to surface bugs—cleanup must be symmetric.

**Expert Level**

**Suspense** and **concurrent** rendering change **timing** guarantees—effects should be **idempotent** where possible.

```tsx
import { useEffect, useState } from "react";

type Forecast = { tempC: number };

export function WeatherPanel({ city }: { city: string }) {
  const [data, setData] = useState<Forecast | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((r) => r.json() as Promise<Forecast>)
      .then((d) => {
        if (alive) setData(d);
      });
    return () => {
      alive = false;
    };
  }, [city]);

  return <p>{data ? `${data.tempC}°C` : "Loading…"}</p>;
}
```

---

### Updating

**Beginner Level**

Components **re-render** when **state** or **context** changes, or **parent** re-renders (unless memoized).

**Intermediate Level**

**memo**/`useMemo`/`useCallback` reduce work—profile first.

**Expert Level**

**Transitions** (`useTransition`) deprioritize updates—keep UI responsive in **heavy dashboards**.

---

### Unmounting

**Beginner Level**

Return a **cleanup** from `useEffect`:

```tsx
useEffect(() => {
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
}, []);
```

**Intermediate Level**

Cancel **fetch** with **AbortController**; remove **listeners**.

**Expert Level**

**Avoid** setting state after unmount—use **flags** or **AbortController**.

---

### Error Boundaries

**Beginner Level**

Catch **render** errors in subtree—implemented with **class** `componentDidCatch` / `getDerivedStateFromError` (or framework primitives).

**Intermediate Level**

Do **not** catch **event handler** errors—use `try/catch` in handlers.

**Expert Level**

Integrate **error reporting** (Sentry) in `componentDidCatch`; provide **fallback UI** and **reset keys**.

#### Key Points — Lifecycle

- **Effects** map to mount/update/unmount concerns—learn **dependency** rules.
- **Boundaries** isolate failures—especially in **chat** and **plugin** UIs.

---

## 3.7 Pure Components

### PureComponent

**Beginner Level**

`React.PureComponent` **shallow-compares** props/state before re-rendering—**legacy** class optimization.

**Intermediate Level**

**Shallow** misses deep object changes—often caused **stale UI** if you mutate nested data.

**Expert Level**

Prefer **`memo`** for function components today.

```tsx
import { PureComponent } from "react";

type Props = { value: number };

export class Meter extends PureComponent<Props> {
  render() {
    return <meter value={this.props.value} />;
  }
}
```

---

### Shallow Comparison

**Beginner Level**

Compares **first-level** keys with `Object.is` semantics for each property—**references** matter for objects/arrays.

**Intermediate Level**

If parent passes **inline objects** each render, `memo` thinks props changed—stabilize or accept re-renders.

**Expert Level**

**Immer** or **immutable** updates keep semantics clear.

---

### React.memo

**Beginner Level**

Wrap **function components** to skip re-render if props are shallowly equal:

```tsx
import { memo } from "react";

type Props = { sku: string; title: string };

export const ProductRow = memo(function ProductRow({ sku, title }: Props) {
  return (
    <tr>
      <td>{sku}</td>
      <td>{title}</td>
    </tr>
  );
});
```

**Real-time example**: **e-commerce** product table virtualization benefits from memoized rows.

**Intermediate Level**

**Default** shallow compare—sufficient for many cases.

**Expert Level**

**Custom compare** for expensive components/props with **stable** internal structures.

---

### Custom Comparison

**Beginner Level**

```tsx
export const Chart = memo(
  function Chart(props: { seriesId: string; points: readonly number[] }) {
    return <svg>...</svg>;
  },
  (prev, next) => prev.seriesId === next.seriesId && prev.points === next.points
);
```

**Intermediate Level**

Incorrect **custom** compare can **skip** needed renders—test thoroughly.

**Expert Level**

Sometimes **better to fix prop stability** upstream than to add complex compares.

#### Key Points — Pure Rendering

- **`memo`** is not free—measure.
- **Stabilize props** (callbacks, objects) or accept re-renders.
- **Immutability** makes shallow compares reliable.

---

## Key Points (Chapter Summary)

- **Components** encapsulate UI; **composition** scales better than inheritance.
- **Function components + TypeScript** are the modern default—explicit **`children`** typing.
- **Props** are contracts—use **`ComponentProps`**, unions, and **generics** wisely.
- **Lifecycle** in functions maps to **`useEffect`** and careful **cleanup**.
- **`memo`**/**custom compare** optimize **hot paths**—profile first.

---

## Best Practices

1. Prefer **named exports** and **PascalCase** filenames matching components.
2. Type **`props`** explicitly; avoid **`React.FC`** unless justified.
3. **Split** large components; **colocate** tests and styles where helpful.
4. Use **`memo`** on **expensive** leaf components with **stable** props.
5. **Error boundaries** around risky subtrees (**widgets**, **third-party**).
6. **Avoid** mutating props or state—**immutability** aids **`memo`**.
7. **Document** complex **render props**/**children** patterns in Storybook.
8. Learn **class** syntax for **legacy** maintenance—not for greenfield features.

---

## Common Mistakes to Avoid

1. Using **`React.FC`** to smuggle implicit **`children`**—be explicit.
2. **`memo`** everywhere without profiling—adds noise and bugs if compares wrong.
3. **Inline** object/array literals as props causing **avoidable** re-renders—sometimes fine; don’t cargo-cult.
4. **Mutating** nested state in place—breaks **`PureComponent`/`memo`** assumptions.
5. **Effects without cleanup**—timers, subscriptions, and **race** conditions in **data fetching**.
6. **Error boundaries** for **async** errors in handlers—won’t catch; use **`try/catch`**.
7. **Overusing `Children` API**—prefer explicit **props**.
8. **Generic components** without clear **constraints**—leads to **`any`** escapes.

---

*Next: State Management notes for React with TypeScript.*
