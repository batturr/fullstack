# JSX Fundamentals (React + TypeScript)

**JSX** (JavaScript XML) is a syntax extension that lets you write **HTML-like markup** inside JavaScript/TypeScript. React uses JSX to describe **what the UI should look like**. TypeScript adds **static checking** for elements, attributes, and children.

---

## 📑 Table of Contents

- [JSX Fundamentals (React + TypeScript)](#jsx-fundamentals-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [2.1 JSX Basics](#21-jsx-basics)
    - [What is JSX?](#what-is-jsx)
    - [JSX vs HTML](#jsx-vs-html)
    - [Compilation and Babel](#compilation-and-babel)
    - [Under the Hood: React.createElement](#under-the-hood-reactcreateelement)
    - [Syntax Rules](#syntax-rules)
  - [2.2 JSX Expressions](#22-jsx-expressions)
    - [Embedding JavaScript `{}`](#embedding-javascript-)
    - [String Literals](#string-literals)
    - [Template Literals](#template-literals)
    - [Arithmetic](#arithmetic)
    - [Ternary Operator](#ternary-operator)
    - [Logical AND, OR, and Nullish Coalescing](#logical-and-or-and-nullish-coalescing)
  - [2.3 JSX Attributes](#23-jsx-attributes)
    - [className](#classname)
    - [htmlFor](#htmlfor)
    - [camelCase Convention](#camelcase-convention)
    - [Style Object](#style-object)
    - [Boolean Attributes](#boolean-attributes)
    - [data-* Attributes](#data--attributes)
    - [Spread Attributes](#spread-attributes)
  - [2.4 JSX Children](#24-jsx-children)
    - [Text Children](#text-children)
    - [Element Children](#element-children)
    - [Mixed Children](#mixed-children)
    - [Functions as Children](#functions-as-children)
    - [Fragments](#fragments)
  - [2.5 JSX Best Practices](#25-jsx-best-practices)
    - [Self-Closing Tags](#self-closing-tags)
    - [Parentheses for Multi-Line JSX](#parentheses-for-multi-line-jsx)
    - [Conditional Rendering Patterns](#conditional-rendering-patterns)
    - [Comments in JSX](#comments-in-jsx)
    - [XSS and Escaping](#xss-and-escaping)
    - [dangerouslySetInnerHTML](#dangerouslysetinnerhtml)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices](#best-practices)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 2.1 JSX Basics

### What is JSX?

**Beginner Level**

JSX looks like HTML inside your TypeScript files, but it is **syntactic sugar** for function calls that create **React elements**. A **real-time example**: in an **e-commerce** product row, you write `<td>{product.name}</td>` instead of manually creating DOM nodes.

**Intermediate Level**

JSX is **expressions**: you can assign JSX to variables, return it from functions, and pass it as arguments. The TypeScript compiler (with `@types/react`) checks **intrinsic elements** (`div`, `span`) and **component types** (`<ProductRow />`). A **dashboard** card might be a function returning JSX based on typed props.

**Expert Level**

JSX integrates with **React 17+ automatic runtime** (`react/jsx-runtime`)—no need to import React for JSX in many setups. Custom **JSX namespaces** and **declaration merging** allow **design systems** to augment intrinsic props. **Server Components** (frameworks) may restrict JSX to certain environments—still JSX syntax, different runtime rules.

```tsx
import type { ReactElement } from "react";

type Sku = string;

export function ProductNameCell(props: { sku: Sku; name: string }): ReactElement {
  const { sku, name } = props;
  return (
    <td data-sku={sku} title={name}>
      {name}
    </td>
  );
}
```

#### Key Points — What is JSX?

- JSX describes **UI as structured expressions**.
- TypeScript knows **HTML attribute** spellings via React’s typings.
- JSX is **not** a template language with its own runtime—**it compiles to JS**.

---

### JSX vs HTML

**Beginner Level**

Differences you will notice immediately:

| HTML | JSX (React) |
|------|----------------|
| `class` | `className` |
| `for` | `htmlFor` |
| `style="color:red"` | `style={{ color: "red" }}` |

**Real-time example**: a **todo app** list uses `className` for CSS modules or Tailwind classes.

**Intermediate Level**

JSX is **embedded in JavaScript**: attribute values can be **any expression** in `{}`. Event handlers take **functions**, not strings (`onClick={handler}` not `onClick="..."`). Void elements must be **self-closing** in JSX (`<img />`, `<br />`).

**Expert Level**

**SVG** and **MathML** namespaces work with specific tags; TypeScript’s JSX types map intrinsics carefully. **Custom elements** (web components) use `jsxIntrinsicElements` augmentation. **Accessibility** attributes map to camelCase (`aria-*` stays lowercase in DOM props per React typings).

```tsx
type Props = { id: string; label: string; onToggle: (id: string) => void };

export function TodoItem({ id, label, onToggle }: Props) {
  return (
    <li className="todo-item">
      <input
        id={id}
        type="checkbox"
        aria-label={`Toggle ${label}`}
        onChange={() => onToggle(id)}
      />
      <label htmlFor={id}>{label}</label>
    </li>
  );
}
```

#### Key Points — JSX vs HTML

- JSX follows **DOM property** naming more than HTML attribute naming.
- **Never** use string handlers for events in React—security and correctness.
- Use **`className`** to avoid clashing with JS `class` keyword.

---

### Compilation and Babel

**Beginner Level**

Tools like **TypeScript**, **Babel**, or **esbuild** transform JSX into plain JavaScript—typically calls to `jsx()` from `react/jsx-runtime`. You normally **do not** see the output day-to-day.

**Real-time example**: saving a **weather app** component triggers Vite to **hot-reload** the transformed code in the browser.

**Intermediate Level**

`tsconfig` option `"jsx": "react-jsx"` selects the automatic runtime. Older code used `"jsx": "react"` requiring `import React from "react"`. Source maps map runtime errors **back to TSX** lines.

**Expert Level**

Custom **Babel plugins** (macros, styled-components, i18n extraction) run at compile time. **Fast refresh** relies on consistent component signatures. **Monorepos** must align **one** JSX transform across packages.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

#### Key Points — Compilation

- JSX is **not** interpreted in the browser directly in most setups.
- **`react-jsx`** runtime reduces boilerplate and enables better optimization.
- Align **toolchain** versions across packages.

---

### Under the Hood: React.createElement

**Beginner Level**

Conceptually, JSX like `<Greeting name="Ada" />` becomes a **React element**—a plain object describing the component and props. You rarely call APIs manually in app code.

**Intermediate Level**

Classic transform:

```tsx
import { createElement } from "react";

// Equivalent conceptual mapping (simplified)
const el = createElement(Greeting, { name: "Ada" });
```

**Expert Level**

Understanding elements vs **instances** vs **fibers** helps debug. **Elements are immutable** descriptions; React reconciles them. Libraries sometimes use **`cloneElement`** or **`createElement`** for **HOCs**—prefer composition with hooks in modern code.

```tsx
import { createElement } from "react";

function Greeting(props: { name: string }) {
  return <p>Hello, {props.name}</p>;
}

export const demo = createElement(Greeting, { name: "Ada" });
```

#### Key Points — createElement

- JSX **desugars** to `jsx()` or `createElement()` calls.
- Elements are **cheap**—re-creating them each render is normal.
- Prefer **`jsx()` runtime** in modern apps.

---

### Syntax Rules

**Beginner Level**

- One **parent** per return (or use a **Fragment**).
- **Close** all tags (`<input />`).
- **camelCase** event names: `onClick`, `onChange`.

**Intermediate Level**

Adjacent JSX needs a **wrapper** or Fragment `<>...</>`. **Expressions** only inside `{}`—not arbitrary statements (`if` must be outside or ternary/`&&`).

**Expert Level**

**Type narrowing** in TS works with JSX when you branch correctly. **Discriminated unions** model UI states (`{ status: "ok" | "error" }`). Avoid **IIFEs** in JSX for logic—extract functions or components.

```tsx
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

export function RemoteValue<T>(props: {
  state: LoadState<T>;
  children: (data: T) => React.ReactNode;
}) {
  const { state } = props;
  if (state.status === "idle" || state.status === "loading") {
    return <p role="status">Loading…</p>;
  }
  if (state.status === "error") {
    return (
      <p role="alert" className="error">
        {state.message}
      </p>
    );
  }
  return <>{props.children(state.data)}</>;
}
```

#### Key Points — Syntax Rules

- **Fragments** avoid extra DOM nodes.
- **Branches** should be simple; complex logic belongs **above** the return.
- **TypeScript** + unions prevent impossible UI states when modeled well.

---

## 2.2 JSX Expressions

### Embedding JavaScript `{}`

**Beginner Level**

Curly braces **embed** any JavaScript **expression** inside JSX: variables, function calls, object property access.

**Real-time example**: **chat app** message timestamp:

```tsx
<span>{message.sentAt.toLocaleTimeString()}</span>
```

**Intermediate Level**

You **cannot** embed statements (`const`, `for`, `return`) directly—only expressions. Use **map** for lists. **Optional chaining** and **nullish coalescing** are expressions and work well.

**Expert Level**

**Performance**: inline arrow functions in JSX create new function identities each render—sometimes fine, sometimes problematic for memoized children. **Extract** stable callbacks with `useCallback` when profiling shows issues.

```tsx
type User = { displayName: string };

export function Welcome({ user }: { user: User | null }) {
  return <h1>Hello, {user?.displayName ?? "guest"}</h1>;
}
```

#### Key Points — `{}`

- **Expressions only** inside braces.
- **`?.` and `??`** integrate cleanly with JSX text.
- Watch **function identity** when optimizing.

---

### String Literals

**Beginner Level**

Plain text can sit **outside** braces: `<h1>Dashboard</h1>`. You can also put string **expressions**: `{title}`.

**Intermediate Level**

Combining **static** and **dynamic** strings: prefer **template literals** inside `{}` for clarity: `` {`Order #${id}`} ``.

**Expert Level**

**i18n**: never concatenate untranslated fragments naively for RTL languages—use ICU message formats or libraries that handle **pluralization** and **placeholders** properly.

```tsx
export function OrderHeading({ orderId }: { orderId: string }) {
  return <h2>{`Order #${orderId}`}</h2>;
}
```

#### Key Points — String Literals

- Literal text **children** need no braces.
- Use **template literals** for composed strings.
- Consider **i18n** early for user-visible strings.

---

### Template Literals

**Beginner Level**

Inside `{}`, template literals build strings with **embedded expressions**:

```tsx
const price = 49.99;
<p>{`$${price.toFixed(2)}`}</p>
```

**Real-time example**: **e-commerce** shows `You save ${saved}` dynamically.

**Intermediate Level**

**Tag templates** (styled-components, gql macros) are compile-time tools—not needed for basic JSX learning—but show how TS + tooling **extend** JSX ergonomics.

**Expert Level**

**Sanitize** if combining user input into strings displayed as HTML—default React text escaping is safe; **HTML injection** risks appear with `dangerouslySetInnerHTML`.

```tsx
type SavingsProps = { listPrice: number; salePrice: number };

export function Savings({ listPrice, salePrice }: SavingsProps) {
  const saved = Math.max(0, listPrice - salePrice);
  return <p>{`You save $${saved.toFixed(2)}`}</p>;
}
```

#### Key Points — Template Literals

- Great for **currency** and **labels** with variables.
- Still subject to **React’s XSS protections** when used as **text nodes**.

---

### Arithmetic

**Beginner Level**

Use normal operators inside `{}`: `{a + b}`, `{items.length}`, `{qty * price}`.

**Intermediate Level**

**NaN** renders as text `"NaN"`—guard inputs. **Rounding** for money: use **integer cents** in serious **e-commerce** or **Decimal** libraries—floats are approximate.

**Expert Level**

**BigInt** rarely appears in JSX directly; convert to **string** for display. **Locale-aware** number formatting via `Intl.NumberFormat`.

```tsx
type Line = { qty: number; unitPrice: number };

export function LineTotal({ line }: { line: Line }) {
  const total = line.qty * line.unitPrice;
  return <td>{new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(total)}</td>;
}
```

#### Key Points — Arithmetic

- Validate **inputs** before math in UI.
- Prefer **`Intl`** formatters for **production** display.

---

### Ternary Operator

**Beginner Level**

`condition ? a : b` chooses between two JSX snippets—ideal for **either/or** UIs.

**Real-time example**: **weather app** badge:

```tsx
{tempC > 30 ? <span>Hot</span> : <span>Mild</span>}
```

**Intermediate Level**

Avoid **deeply nested** ternaries—extract component or compute **view model** above the return. TypeScript narrows types in branches when conditions involve **discriminants**.

**Expert Level**

Combine with **memoized** subcomponents for heavy branches. **Accessibility**: ensure both branches preserve **focus** and **ARIA** roles appropriately.

```tsx
type Role = "admin" | "viewer";

export function AdminBanner({ role }: { role: Role }) {
  return role === "admin" ? (
    <aside role="status">You have admin access.</aside>
  ) : (
    <aside role="status">Read-only access.</aside>
  );
}
```

#### Key Points — Ternary

- Prefer for **two-choice** render paths.
- Refactor **nested** ternaries into **named** components or variables.

---

### Logical AND, OR, and Nullish Coalescing

**Beginner Level**

- **`&&`**: render right side only if left is truthy—common for **optional** bits: `{isOnSale && <Badge />}`.
- **`||`**: first truthy value—careful: `0`, `""` are falsy.
- **`??`**: falls back only for **`null`/`undefined`**.

**Real-time example**: **social media** “New messages” chip:

```tsx
{unread > 0 && <span className="badge">{unread}</span>}
```

**Intermediate Level**

**Pitfall**: `count && <List />` renders `0` when count is zero—use `count > 0 &&` or **ternary**. **`??`** is ideal for **defaults** without clobbering `0` or `""`.

**Expert Level**

**Short-circuit** evaluation matters for **side effects**—do not put impure operations in JSX; compute before return. **Accessibility**: conditional rendering can confuse screen readers—use **`aria-live`** where appropriate.

```tsx
type InboxProps = { unread: number };

export function InboxBadge({ unread }: InboxProps) {
  return (
    <span aria-label={`${unread} unread messages`}>
      {unread > 0 ? <mark>{unread}</mark> : "No new messages"}
    </span>
  );
}

export function DisplayName({ name }: { name: string | null | undefined }) {
  return <strong>{name ?? "Anonymous"}</strong>;
}
```

#### Key Points — && / || / ??

- Avoid **`&&`** when **0** or **empty string** are valid outputs.
- Prefer **`??`** over **`||`** when **falsy values** are meaningful.
- Keep **side effects** out of JSX expressions.

---

## 2.3 JSX Attributes

### className

**Beginner Level**

Use **`className`** to assign CSS classes—works with plain CSS, **CSS Modules** (`import styles from "./x.module.css"`), or **Tailwind** strings.

**Intermediate Level**

Combine classes safely:

```tsx
const active = true;
<button className={["btn", active ? "btn--active" : ""].filter(Boolean).join(" ")} type="button">
  Save
</button>
```

Libraries like **`clsx`** / **`classnames`** help. **Expert Level**: **CSS-in-JS** solutions may inject class names automatically—still often expose `className` for **composition**.

```tsx
import clsx from "clsx";

type TabProps = { label: string; selected: boolean; onSelect: () => void };

export function Tab({ label, selected, onSelect }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={clsx("tab", selected && "tab--selected")}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
```

#### Key Points — className

- **`class` is invalid** in JSX—use `className`.
- Use helpers to **compose** variants cleanly.

---

### htmlFor

**Beginner Level**

Associate `<label>` with inputs via **`htmlFor`** matching **`id`**—not `for`.

**Intermediate Level**

Improves **accessibility** and **hit targets**. In **dashboard** forms, pair with **error** `id`s for `aria-describedby`.

**Expert Level**

**Nested** labels can avoid `htmlFor`, but explicit ids support **virtualized** lists where nesting is awkward.

```tsx
type FieldProps = { id: string; label: string; error?: string };

export function TextField({ id, label, error }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
      {error ? (
        <p id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

#### Key Points — htmlFor

- **`for`** is a JS keyword—hence **`htmlFor`**.
- Pair with **`id`** on controls for **a11y**.

---

### camelCase Convention

**Beginner Level**

Most DOM properties in JSX use **camelCase**: `tabIndex`, `maxLength`, `readOnly`.

**Intermediate Level**

**SVG** attributes differ (`strokeWidth`, `viewBox`). TypeScript catches many typos via **`JSX.IntrinsicElements`**.

**Expert Level**

**Custom data** and **`aria-*`** attributes are generally **strings** as in HTML; React passes them through. For **non-standard** experimental props, module augmentation may be required.

```tsx
export function SearchInput() {
  return <input tabIndex={0} maxLength={120} readOnly={false} placeholder="Search products" />;
}
```

#### Key Points — camelCase

- Follow **React DOM** typings—they mirror **property** names.
- Consult **TS errors** when migrating HTML snippets.

---

### Style Object

**Beginner Level**

Inline styles accept a **JavaScript object** with **camelCased** properties:

```tsx
<div style={{ color: "crimson", marginTop: 8 }} />
```

**Intermediate Level**

Numeric `0` often needs **no units**; others default to **px** for certain fields in React DOM typings. Prefer **CSS classes** for large apps; inline for **dynamic** values (charts, animations).

**Expert Level**

**Performance**: large inline style objects recreated each render can defeat memoization—**stabilize** objects with `useMemo` if profiling shows thrash.

```tsx
import { useMemo } from "react";

type BarProps = { widthPct: number };

export function ProgressBar({ widthPct }: BarProps) {
  const style = useMemo(
    () => ({
      height: 8,
      width: `${Math.min(100, Math.max(0, widthPct))}%`,
      background: "#2563eb",
    }),
    [widthPct]
  );

  return <div role="progressbar" aria-valuenow={widthPct} style={style} />;
}
```

#### Key Points — Style Object

- Use for **dynamic** values; prefer **CSS** for static styling.
- **Memoize** heavy style objects if needed.

---

### Boolean Attributes

**Beginner Level**

For boolean props, **`propName`** alone means `true`:

```tsx
<input disabled />
<button type="submit" disabled>
  Pay
</button>
```

**Intermediate Level**

Explicit `{true}` / `{false}` is fine; avoid strings `"true"` / `"false"`. Custom components should name booleans clearly (`isOpen`, `hasError`).

**Expert Level**

**ARIA** attributes are often strings (`aria-expanded="true"`)—still strings in JSX for DOM compatibility.

```tsx
type Props = { busy?: boolean };

export function CheckoutButton({ busy }: Props) {
  return (
    <button type="button" disabled={busy}>
      {busy ? "Processing…" : "Checkout"}
    </button>
  );
}
```

#### Key Points — Boolean Attributes

- **`disabled`** without value sets **true**.
- Custom components: prefer **explicit** prop names.

---

### data-* Attributes

**Beginner Level**

`data-*` attributes help **testing** and **analytics** hooks:

```tsx
<button data-testid="add-to-cart" type="button">
  Add
</button>
```

**Intermediate Level**

**React Testing Library** prefers **roles** and **labels** over test ids when possible—use `data-testid` as a last resort.

**Expert Level**

**CSP** and **sanitization** still apply if values include user input—**never** interpolate raw user strings into attributes without escaping considerations.

```tsx
export function ProductTile({ sku }: { sku: string }) {
  return (
    <article data-product-sku={sku}>
      <h3>Product {sku}</h3>
    </article>
  );
}
```

#### Key Points — data-*

- Great for **stable selectors** in tests.
- Prefer **accessible queries** first.

---

### Spread Attributes

**Beginner Level**

Spread props onto elements: `<input {...field} />`—common with form libraries.

**Intermediate Level**

Order matters: **later** props override earlier. Merge **className** with helpers. Type **exact optional** props carefully with TypeScript.

**Expert Level**

**Security**: spreading unknown objects onto DOM can introduce **`dangerouslySetInnerHTML`** accidentally—**sanitize** or **whitelist** keys in untrusted data.

```tsx
type ButtonProps = React.ComponentProps<"button">;

export function PrimaryButton({ className, ...rest }: ButtonProps) {
  return <button {...rest} type={rest.type ?? "button"} className={clsx("btn-primary", className)} />;
}
```

#### Key Points — Spread

- **Convenient** for wrappers and **higher-order** patterns.
- **Whitelist** when spreading **external** data.

---

## 2.4 JSX Children

### Text Children

**Beginner Level**

Place text between tags: `<p>Free shipping</p>`. Dynamic text uses `{}`.

**Intermediate Level**

**Whitespace** is mostly preserved—watch accidental newlines in multi-line text. Trim user content if needed.

**Expert Level**

**Bi-directional text** and **unicode**—ensure CSS supports mixed RTL/LTR in **social** apps.

```tsx
export function PromoBanner() {
  return <p>Free shipping on orders over $50</p>;
}
```

#### Key Points — Text Children

- Simple strings need **no** `{}`.
- Mind **whitespace** in pretty-printed JSX.

---

### Element Children

**Beginner Level**

Nest elements naturally:

```tsx
<article>
  <header>
    <h1>Post</h1>
  </header>
  <p>Body</p>
</article>
```

**Intermediate Level**

**Children** prop typing: `React.ReactNode` covers most cases. For **single child** constraints, use custom types or `React.ReactElement`.

**Expert Level**

**Slots** pattern: pass named props instead of overloading `children` when multiple distinct regions are needed (header/footer areas).

```tsx
import type { ReactNode } from "react";

export function Modal(props: { title: string; children: ReactNode }) {
  return (
    <dialog open>
      <h2>{props.title}</h2>
      <div>{props.children}</div>
    </dialog>
  );
}
```

#### Key Points — Element Children

- Compose **larger** UIs from **smaller** elements.
- Consider **named props** for multiple regions.

---

### Mixed Children

**Beginner Level**

Combine text and elements:

```tsx
<p>
  Total: <strong>$42.00</strong> USD
</p>
```

**Intermediate Level**

**Arrays** of children: `items.map(...)`—each needs a **stable `key`**.

**Expert Level**

**Keyed** fragments in complex lists; avoid **index keys** when order changes.

```tsx
type Item = { id: string; label: string };

export function Breadcrumbs({ items }: { items: Item[] }) {
  return (
    <nav aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={it.id}>
          {i > 0 ? " / " : null}
          <a href={`/${it.id}`}>{it.label}</a>
        </span>
      ))}
    </nav>
  );
}
```

#### Key Points — Mixed Children

- **Keys** on list items—**not** on fragments wrapping static siblings only.
- **Separators** as conditional text nodes are fine.

---

### Functions as Children

**Beginner Level**

Not common in basic JSX—**Render Props** pass a **function child**:

```tsx
<DataLoader>{(data) => <List items={data} />}</DataLoader>
```

**Intermediate Level**

Type **function children** explicitly:

```tsx
type Props = { children: (value: string) => React.ReactNode };
```

**Expert Level**

Patterns overlap with **hooks**—prefer hooks for many cases; render props remain useful for **component injection** and **libraries**.

```tsx
import type { ReactNode } from "react";

type RepeatProps = { times: number; children: (i: number) => ReactNode };

export function Repeat({ times, children }: RepeatProps) {
  return (
    <>
      {Array.from({ length: times }, (_, i) => (
        <span key={i}>{children(i)}</span>
      ))}
    </>
  );
}
```

#### Key Points — Function Children

- Powerful for **library** APIs.
- Often replaced by **hooks** in app code—choose clarity.

---

### Fragments

**Beginner Level**

Fragments group children **without** an extra DOM node: `<>...</>` or `<Fragment>`.

**Intermediate Level**

**Keyed fragments**: `<Fragment key={id}>...</Fragment>` when lists need stable grouping—short syntax cannot take a key.

**Expert Level**

**Portals** still mount elsewhere; fragments affect **reconciliation** only locally.

```tsx
import { Fragment } from "react";

type Grouped = { category: string; items: Array<{ id: string; name: string }> };

export function Catalog({ groups }: { groups: Grouped[] }) {
  return (
    <>
      {groups.map((g) => (
        <Fragment key={g.category}>
          <h3>{g.category}</h3>
          <ul>
            {g.items.map((it) => (
              <li key={it.id}>{it.name}</li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}
```

#### Key Points — Fragments

- Avoid **wrapper divs** that break layout.
- Use **long form** when **keys** are required.

---

## 2.5 JSX Best Practices

### Self-Closing Tags

**Beginner Level**

Void elements must close: `<img />`, `<input />`, `<br />`, `<hr />`.

**Intermediate Level**

Custom components with **no children** should also self-close for clarity: `<Spinner />`.

**Expert Level**

Consistency with **linters** (`react/self-closing-comp`) prevents noisy diffs.

```tsx
export function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} loading="lazy" />;
}
```

#### Key Points — Self-Closing

- **Always** self-close void tags in JSX.
- Improves **readability** and **lint** alignment.

---

### Parentheses for Multi-Line JSX

**Beginner Level**

Wrap multi-line returns in **parentheses** to avoid ASI pitfalls:

```tsx
return (
  <main>
    <h1>Dashboard</h1>
  </main>
);
```

**Intermediate Level**

**First token** after `return` on same line matters—parentheses make intent clear.

**Expert Level**

**Consistent** formatting via Prettier removes debates.

```tsx
export function Panel() {
  return (
    <section>
      <header>Metrics</header>
      <div className="content">...</div>
    </section>
  );
}
```

#### Key Points — Parentheses

- Prevents **automatic semicolon insertion** bugs.
- Use with **Prettier**.

---

### Conditional Rendering Patterns

**Beginner Level**

Choose among:

- **Ternary** for two outcomes
- **`&&`** for optional presence (watch **0**)
- **Early `return`** before main JSX in components

**Real-time example**: **e-commerce** cart empty state:

```tsx
if (items.length === 0) return <EmptyCart />;
```

**Intermediate Level**

**Switch** on discriminated unions for **multi-state** flows (loading/success/error).

**Expert Level**

**State machines** (`xstate`) clarify complex flows—render maps from **state.value**.

```tsx
type Props =
  | { status: "loading" }
  | { status: "ready"; data: string[] }
  | { status: "error"; message: string };

export function RemoteList(props: Props) {
  switch (props.status) {
    case "loading":
      return <p>Loading…</p>;
    case "error":
      return <p role="alert">{props.message}</p>;
    case "ready":
      return (
        <ul>
          {props.data.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      );
  }
}
```

#### Key Points — Conditionals

- **Early returns** simplify main JSX.
- **Exhaustive** `switch` with unions catches missing cases in TS.

---

### Comments in JSX

**Beginner Level**

Use `{/* ... */}` inside JSX—`//` comments **do not** work inside expressions.

**Intermediate Level**

Comment **why**, not **what**—keep JSX readable.

**Expert Level**

Avoid huge commented-out JSX—use **feature flags** or **git history** instead.

```tsx
export function Note() {
  return (
    <p>
      {/* TODO(i18n): extract marketing copy */}
      Limited time offer
    </p>
  );
}
```

#### Key Points — Comments

- Only **`{/* */}`** form works inside JSX trees.
- Prefer **clear code** over noisy comments.

---

### XSS and Escaping

**Beginner Level**

React **escapes** text inserted in JSX by default—user-supplied strings in `{userInput}` are **not** interpreted as HTML.

**Intermediate Level**

**Never** build HTML strings from user input and assign via **`dangerouslySetInnerHTML`** without **sanitization** (e.g., **DOMPurify** on server or client).

**Expert Level**

**URL** attributes (`href`) with `javascript:` schemes are a vector—validate **allowed protocols**. **Markdown** renderers must sanitize HTML output.

```tsx
export function UserBio({ text }: { text: string }) {
  // Safe: text is escaped
  return <p>{text}</p>;
}
```

#### Key Points — XSS

- Default **text** interpolation is **safe**.
- **`dangerouslySetInnerHTML`** is the high-risk API.

---

### dangerouslySetInnerHTML

**Beginner Level**

Escape hatch to inject **HTML** strings:

```tsx
<div dangerouslySetInnerHTML={{ __html: trustedHtml }} />
```

**Intermediate Level**

Use **only** for **trusted** or **sanitized** content—**CMS** HTML, **markdown-to-html** with sanitizer.

**Expert Level**

**Hydration** mismatches if server/client HTML differs—ensure deterministic sanitization. Prefer **structured content** (Portable Text, MDX) when possible.

```typescript
import DOMPurify from "dompurify";

export function CmsBody({ html }: { html: string }) {
  const safe = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: safe }} />;
}
```

#### Key Points — dangerouslySetInnerHTML

- **Last resort**—prefer safe abstractions.
- **Sanitize** with vetted libraries; test **CSP**.

---

## Key Points (Chapter Summary)

- JSX is **compiled** to React elements; rules differ slightly from **HTML**.
- Expressions in `{}` power **dynamic** UIs—mind **`&&`** with **0** and **`??`** for defaults.
- Attributes map to **DOM properties** (`className`, `htmlFor`, **camelCase**).
- **Children** can be text, elements, arrays, or patterns like **render props**.
- **Security**: default escaping is strong; **`dangerouslySetInnerHTML`** requires **sanitization**.

---

## Best Practices

1. Keep JSX **readable**: extract components when nesting grows deep.
2. Prefer **accessibility-first** patterns: labels, roles, **keyboard** support.
3. Use **clsx**/**classnames** for **variant** styling.
4. Model UI states with **discriminated unions** in TypeScript.
5. **Internationalize** visible strings; avoid concatenation that breaks **RTL**.
6. **Test** with **React Testing Library**—queries resembling user behavior.
7. **Profile** before micro-optimizing inline handlers and style objects.
8. Never pipe **raw user HTML** into **`dangerouslySetInnerHTML`**.

---

## Common Mistakes to Avoid

1. Using **`class`** instead of **`className`**.
2. **`&&`** conditions that render **`0`** unintentionally.
3. Putting **`//` comments** inside JSX without `{}` comment form.
4. **Array index** as **`key`** in dynamic/reorderable lists.
5. Spreading **untrusted** objects onto DOM elements.
6. **Inline** styles/objects recreated causing avoidable **re-renders**—measure first.
7. **Deeply nested** ternaries harming readability.
8. Assuming **`{""}`** or **falsy** handling matches business rules—use **`??`**.

---

*Continue to Components and State Management notes for React with TypeScript.*
