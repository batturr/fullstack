# Context API (React + TypeScript)

The **Context API** lets you **pass data through the tree** without threading props **manually through every level**—ideal for **theme**, **auth**, **locale**, **routing** helpers, and **feature flags**. This guide pairs **Context** with **TypeScript** and patterns from **e-commerce**, **social**, **dashboard**, **chat**, and **admin** apps.

---

## 📑 Table of Contents

- [Context API (React + TypeScript)](#context-api-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [6.1 Context Basics](#61-context-basics)
  - [6.2 Context Provider](#62-context-provider)
  - [6.3 Context Consumer](#63-context-consumer)
  - [6.4 Context Patterns](#64-context-patterns)
  - [6.5 Context Performance](#65-context-performance)
  - [6.6 Context Best Practices](#66-context-best-practices)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 6.1 Context Basics

### What is Context?

**Beginner Level**

**Context** is a way to **share a value** (like a **theme** or **current user**) with **many nested components** without passing it as props **at every level**—sometimes called avoiding **prop drilling**.

**Real-time example**: **E-commerce** **cart item count** in the **header** and **checkout** page—both can read **`CartContext`** instead of passing **`cart`** through **layout**, **nav**, and **banners**.

**Intermediate Level**

**`createContext(defaultValue)`** returns a **Context object** with **`Provider`** and **`Consumer`** (legacy). Consumers **subscribe** to the nearest **`Provider`** above them in the tree.

**Expert Level**

Context is **not** a global store—**updates** propagate through React’s **renderer** and **re-render** subscribed consumers when the **Provider value** changes (reference equality). **Concurrent** rendering can still **interrupt** updates; **context** is a **React-managed** subscription channel.

```tsx
import { createContext } from "react";

export type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>("light");
```

#### Key Points — What is Context?

- **Share** data **deeply** without prop drilling.
- **Nearest Provider** supplies the value.
- **Default** is used when **no Provider** wraps the tree.

---

### When to Use Context

**Beginner Level**

Use when **many** components need the same **read-mostly** data: **theme**, **language**, **auth user**, **feature flags**.

**Real-time example**: **Social media** app: **`CurrentUserContext`** for **avatar** in **nav**, **composer**, and **comment threads**.

**Intermediate Level**

Avoid context for **frequently changing** **high-volume** data unless you **split** or **optimize**—otherwise **many** components re-render. **Server state** often belongs in **TanStack Query** / **SWR**, not raw context.

**Expert Level**

**Colocate** context per **feature** or **route subtree**; **avoid** a single **app-wide** context holding **everything**—it becomes a **performance** and **dependency** bottleneck.

```tsx
// When to use: cross-cutting, relatively stable read
export const LocaleContext = createContext<{ locale: string; currency: string }>({
  locale: "en-GB",
  currency: "GBP",
});
```

#### Key Points — When to Use

- **Cross-cutting** concerns.
- **Stable-ish** values or **optimized** updates.
- **Not** a replacement for **general** global state.

---

### Context vs Props Drilling

**Beginner Level**

**Props drilling** passes **props** through **intermediate** components that **don’t use** them—only **forward** them. **Context** lets **leaf** components **read** directly.

**Intermediate Level**

**Props** are still best when **ownership** is **clear** and **few** levels deep—**explicit** data flow. **Context** trades **explicitness** for **ergonomics**—use **documentation** and **typed hooks**.

**Expert Level**

**Composition** (`children`) can avoid props drilling too—pass **elements** as **`children`** so intermediates don’t need prop names. **Context** is for **ambient** data.

```tsx
// Drilling: Layout passes user to Header only to forward to Menu
function Layout({ user }: { user: User }) {
  return <Header user={user} />;
}
function Header({ user }: { user: User }) {
  return <UserMenu user={user} />;
}

// Context: leaves consume UserContext directly
```

#### Key Points — vs Props Drilling

- **Drilling** is fine for **shallow** trees.
- **Context** reduces **noise** for **deep** shared data.
- **Composition** is a third alternative.

---

### createContext with TypeScript

**Beginner Level**

**`createContext<T>(defaultValue)`**—the **default** must be a **valid `T`** when no provider exists. Often **teams** use **`undefined`** and **`null`** checks, or a **non-null assertion** if you **always** mount a provider in app.

**Real-time example**: **Dashboard** **`RoleContext`** with **`"viewer" | "editor" | "admin"`**.

**Intermediate Level**

Use **`undefined` as default** + **`useContext` hook** that **throws** if missing provider—**type-safe** and **fail-fast**.

**Expert Level**

**Split** types for **state** vs **dispatch** (`createContext<State | undefined>`) and **`Dispatch<Action>`**) to **memo** **dispatch** separately.

```tsx
import { createContext, useContext } from "react";

export type User = { id: string; name: string };

const UserContext = createContext<User | undefined>(undefined);

export function useUser(): User {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
```

#### Key Points — createContext

- **Type** the **value** explicitly.
- Prefer **explicit** error when **provider** required.
- **Default** value must satisfy **`T`** or use **`undefined`** + guards.

---

## 6.2 Context Provider

### Provider Component

**Beginner Level**

**`<MyContext.Provider value={something}>`** wraps children. **Children** (and descendants) **see** **`something`** as the context value.

**Real-time example**: **Chat** app wraps **`ThreadList`** and **`MessagePane`** with **`ChatProvider`** supplying **`activeChannelId`**.

**Intermediate Level**

**Provider** is a **component**—you can **compute** state with **hooks** inside it (`useReducer`, `useState`) and pass **`value`** down.

**Expert Level**

**Multiple Providers** can **nest**—**order** matters for **dependencies** (e.g. **`ThemeProvider`** outside **`StyledProvider`**).

```tsx
import { useState } from "react";
import { ThemeContext, type Theme } from "./theme-context";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}
```

#### Key Points — Provider Component

- **Encapsulates** context **value** creation.
- Often **holds** state with **hooks**.
- **Nest** with other providers.

---

### Providing Value

**Beginner Level**

The **`value`** prop is **live**—when it changes, **consumers** **re-render**.

**Intermediate Level**

**Avoid** **new object identity every render** unless you **`useMemo`** the value—**unstable** values cause **unnecessary** consumer updates.

**Expert Level**

**Separate** **volatile** and **stable** parts of value into **contexts** or split **state** and **dispatch**.

```tsx
import { useMemo, useState } from "react";

import { CartContext } from "./cart-context";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({});

  const value = useMemo(() => ({ items, setItems }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

#### Key Points — Providing Value

- **Reference equality** drives updates.
- **Memoize** **objects** and **functions** when needed.
- **Keep** value **shape** stable.

---

### Nesting Providers

**Beginner Level**

**Nest** providers like **onions**—outer **theme**, inner **auth**, inner **chat**—each child can access **all** outer contexts.

**Real-time example**: **E-commerce**: **`IntlProvider`** → **`UserProvider`** → **`CartProvider`** → **`CheckoutPage`**.

**Intermediate Level**

**Provider composition** helper:

```tsx
function composeProviders(...providers: Array<React.FC<{ children: React.ReactNode }>>) {
  return providers.reduce(
    (Acc, P) =>
      function Composed({ children }: { children: React.ReactNode }) {
        return (
          <Acc>
            <P>{children}</P>
          </Acc>
        );
      },
    ({ children }: { children: React.ReactNode }) => <>{children}</>
  );
}
```

**Expert Level**

**Order** matters if **inner** providers **read** **outer** context during **initialization**—use **custom hooks** to **initialize** from outer context.

---

### Dynamic Values

**Beginner Level**

**`value`** can change **from state**—e.g. **toggle theme** from **`light`** to **`dark`**—**all** consumers **re-render** (unless **memoized** children block them).

**Intermediate Level**

**Performance**: **dynamic** **high-frequency** updates (mouse position) **through** context can **hurt**—prefer **refs** or **subscriptions** outside context for **per-frame** updates.

**Expert Level**

**Selectors** or **split contexts** (see §6.5) reduce **blast radius**.

```tsx
export function LiveOrderProvider({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<"pending" | "shipped">("pending");

  useEffect(() => {
    const ws = new WebSocket(`/orders/${orderId}`);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data as string) as { status: typeof status };
      setStatus(msg.status);
    };
    return () => ws.close();
  }, [orderId]);

  return (
    <OrderContext.Provider value={{ orderId, status }}>{/* ... */}</OrderContext.Provider>
  );
}
```

#### Key Points — Dynamic Values

- **State-driven** updates are **natural**.
- **High-frequency** updates need **care**.
- **Combine** with **subscriptions** or **selectors**.

---

## 6.3 Context Consumer

### Consumer Component (Legacy)

**Beginner Level**

**`<MyContext.Consumer>{value => ...}</MyContext.Consumer>`** **render props** style—still works in **class** components.

**Real-time example**: **Legacy** **dashboard** widget written as a **class** reading **`theme`** from **`ThemeContext.Consumer`**.

**Intermediate Level**

**Verbose** compared to **`useContext`**—prefer **hooks** in new code.

```tsx
import { ThemeContext } from "./theme-context";

export function LegacyBanner() {
  return (
    <ThemeContext.Consumer>
      {(theme) => <div className={theme}>Welcome</div>}
    </ThemeContext.Consumer>
  );
}
```

#### Key Points — Legacy Consumer

- **Render prop** API.
- **Prefer** **`useContext`** in function components.

---

### useContext (Modern)

**Beginner Level**

**`const value = useContext(MyContext)`** — **simple** and **composable** with other hooks.

**Real-time example**: **Social** **`useCurrentUser()`** wraps **`useContext(UserContext)`**.

**Intermediate Level**

**Custom hook** adds **validation** and **types**.

**Expert Level**

**Multiple contexts** in one component—**order** of hooks** follows** rules of hooks.

```tsx
import { useContext } from "react";

import { CartContext } from "./cart-context";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("CartProvider missing");
  return ctx;
}
```

#### Key Points — useContext

- **Primary** API today.
- **Pair** with **custom hooks**.
- **Throw** when **required** provider missing.

---

### Multiple Contexts

**Beginner Level**

**`useTheme()`** + **`useLocale()`** + **`useAuth()`** in the same component—each reads a **different** context.

**Real-time example**: **Dashboard** **header** shows **localized** **currency** + **dark**/**light** **icons** + **user** **menu**.

**Intermediate Level**

**Avoid** **mega-context** with **dozens** of fields—**split** into **focused** contexts.

---

### Default Values

**Beginner Level**

**`createContext(default)`**—when **no Provider**, consumers get **`default`**. Useful for **optional** theming in **libraries** or **tests**.

**Intermediate Level**

If **`undefined`** default is **intentional**, **throw** in **`useHook`** when **missing provider**—**not** in **library** code that **must** work without provider.

**Expert Level**

**Default** can be **partial** for **testing**—use **`Partial`** types carefully; **prefer** **explicit** mocks.

```tsx
const FeatureFlagsContext = createContext<FeatureFlags>({ betaCharts: false });

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext);
}
```

#### Key Points — Default Values

- **Defaults** for **optional** or **test** scenarios.
- **Strict** apps often **require** provider + **throw** on missing.

---

## 6.4 Context Patterns

### Separate State and Dispatch

**Beginner Level**

**Two contexts**: **`StateContext`** holds **data**; **`DispatchContext`** holds **stable** **`dispatch`** function from **`useReducer`**. **Consumers** that only **dispatch** don’t re-render when **state** changes **if** they only **`useDispatch`** (dispatch identity stable).

**Real-time example**: **Todo** app: **list** re-renders on **items** change; **toolbar** may only **dispatch** **`addTodo`** without **subscribing** to **items** (if structured carefully).

**Intermediate Level**

**Pattern** reduces **re-renders** but **adds** complexity—**measure** before adopting.

```tsx
import { createContext, Dispatch, useContext, useReducer } from "react";

type State = { items: string[] };
type Action = { type: "add"; text: string };

const StateCtx = createContext<State | undefined>(undefined);
const DispatchCtx = createContext<Dispatch<Action> | undefined>(undefined);

export function TodosProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

export function useTodosState() {
  const s = useContext(StateCtx);
  if (!s) throw new Error("missing");
  return s;
}

export function useTodosDispatch() {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error("missing");
  return d;
}
```

#### Key Points — Separate State/Dispatch

- **Cuts** re-renders for **dispatch-only** consumers.
- **More** boilerplate.
- **Pair** with **Reducer** typing.

---

### Context + useReducer

**Beginner Level**

**Provider** uses **`useReducer`** and passes **`[state, dispatch]`** or **split** contexts (above).

**Real-time example**: **E-commerce** **checkout** **wizard** with **typed** **actions**.

**Intermediate Level**

**Reducer** stays **pure**—**test** without React.

**Expert Level**

**Middleware** / **logging** can wrap **dispatch** in provider.

---

### Provider Component Pattern

**Beginner Level**

**Single file** exports **`ThingContext`**, **`ThingProvider`**, **`useThing`**—**encapsulates** **defaults** and **errors**.

**Intermediate Level**

**Barrel** files **re-export** for **clean** imports.

---

### Compound Components

**Beginner Level**

**`<Tabs>`**, **`<Tabs.List>`**, **`<Tabs.Panel>`** share **implicit** state via **context**—internal **subcomponents** **consume** **parent** context.

**Real-time example**: **Dashboard** **filter** **panel** with **synced** **tabs** and **charts**.

**Intermediate Level**

**Public API** stays **ergonomic**; **implementation** uses **private** context.

```tsx
import { createContext, useContext, useState } from "react";

type TabsCtx = { active: string; setActive: (id: string) => void };

const TabsContext = createContext<TabsCtx | undefined>(undefined);

export function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("overview");
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function List({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Tab = function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.Tab must be inside Tabs");
  const selected = ctx.active === id;
  return (
    <button role="tab" type="button" aria-selected={selected} onClick={() => ctx.setActive(id)}>
      {children}
    </button>
  );
};
```

---

### Composition

**Beginner Level**

**Providers** **compose** with **`children`**—**app shell** mounts **many** providers **around** **`Outlet`** or **`children`**.

**Intermediate Level**

**Avoid** **provider hell** in **tests**—**test helpers** `renderWithProviders(ui)` wrap **standard** providers.

---

## 6.5 Context Performance

### Update Performance

**Beginner Level**

When **Provider value** changes, **all** **consumers** **subscribed** to that context **re-render** (unless **memo**/`React.memo` stops them).

**Real-time example**: **Chat** app: **typing indicator** in **context** updates **every** keystroke—**many** consumers re-render.

**Intermediate Level**

**Split** context by **update frequency**—**UserProfile** vs **LiveTyping**.

**Expert Level**

**External stores** with **useSyncExternalStore** for **fine-grained** subscriptions outside React.

---

### Avoiding Re-renders

**Beginner Level**

**`React.memo`** on **consumers**; **split** contexts; **selectors** (see below).

**Intermediate Level**

**Memoize** **value** in provider with **`useMemo`** / **`useCallback`**.

**Expert Level**

**Context selectors** via **libraries** or **split** **atomic** contexts.

```tsx
import { memo } from "react";

import { useCart } from "./cart-context";

export const CartBadge = memo(function CartBadge() {
  const { items } = useCart();
  const count = Object.values(items).reduce((a, b) => a + b, 0);
  return <span aria-label="Cart items">{count}</span>;
});
```

---

### Splitting Contexts

**Beginner Level**

**Theme** rarely changes—**Auth** may change **session**—**split** so **theme** consumers **don’t** re-render on **auth** token refresh.

**Real-time example**: **Social** app: **`SessionContext`** vs **`PreferencesContext`**.

---

### Memoizing Values

**Beginner Level**

**`const value = useMemo(() => ({ a, b }), [a, b])`** — **stable** object when **deps** unchanged.

**Intermediate Level**

**Functions** in value: **`useCallback`** for **each** method or **useMemo** for **whole** object.

---

### Selectors Pattern

**Beginner Level**

**`useMemo`** inside consumer to **derive** subset from **context**—**still** re-renders when **context** changes, but **child** props can be **stable**.

**Intermediate Level**

**Third-party** `use-context-selector` or **Zustand** for **true** selective subscriptions.

**Expert Level**

**Normalized** stores in **context** + **memoized** selectors similar to **Redux** **reselect**.

```tsx
import { useContext, useMemo } from "react";

import { ProductsContext } from "./products-context";

export function useProduct(id: string) {
  const { byId } = useContext(ProductsContext);
  return useMemo(() => byId[id], [byId, id]);
}
```

---

## 6.6 Context Best Practices

### When Not to Use Context

**Beginner Level**

**Don’t** use **context** for **props** that **only** pass **one** or **two** levels—**props** are **clearer**.

**Intermediate Level**

**Server state** (API data) **scales** better with **TanStack Query**—**cache**, **dedupe**, **retries**.

**Expert Level**

**High-frequency** streams (mouse, animation) **—** **refs** or **external** stores.

---

### Naming Conventions

**Beginner Level**

**`UserContext`**, **`UserProvider`**, **`useUser`**—**consistent** triple.

**Intermediate Level**

**File** names: **`user-context.tsx`** or **`UserContext.tsx`**.

---

### File Organization

**Beginner Level**

**Colocate** **`context` + `provider` + `hook`** in **one** folder per **feature**.

**Intermediate Level**

**Shared** **`app/providers`** for **global** stack; **feature** providers **near** **routes**.

---

### TypeScript with Context

**Beginner Level**

**Type** `createContext` **value**; **type** **custom** hook **returns**.

**Intermediate Level**

**Discriminated unions** for **complex** state in **context**.

**Expert Level**

**Module** augmentation for **library** context consumers **if** needed.

```tsx
// typescript: ensure dispatch actions are exhaustive
type Action = { type: "logout" } | { type: "login"; token: string };

function assertNever(x: never): never {
  throw new Error(`Unhandled ${JSON.stringify(x)}`);
}

function sessionReducer(state: Session, action: Action): Session {
  switch (action.type) {
    case "logout":
      return { status: "anon" };
    case "login":
      return { status: "authed", token: action.token };
    default:
      return assertNever(action);
  }
}
```

---

## Key Points (Chapter Summary)

- **Context** removes **prop drilling** for **shared** cross-cutting data.
- **Providers** **supply** values; **consumers** **use** `useContext` or **legacy** **Consumer**.
- **Memoize** **value** objects and **split** contexts for **performance**.
- **State + dispatch** patterns pair well with **`useReducer`** and **TypeScript** **actions**.
- **Compound components** use **context** internally for **ergonomic** APIs.
- **Not** a replacement for **server state** libraries or **every** global.

---

## Best Practices (Global)

- **Export** `Provider` + **`useX`** hook together; **throw** on missing provider when **required**.
- **Memoize** `value` with **`useMemo`** when passing **objects**/**functions**.
- **Split** **volatile** and **stable** data into **separate** contexts.
- **Use** **React.memo** on **expensive** consumers after **profiling**.
- **Test** with **provider** **wrappers** or **helper** `renderWithProviders`.
- **Document** **context** **contract** in **TypeScript** types.
- **Prefer** **feature-level** context over **one** **god** context.

---

## Common Mistakes to Avoid

- **New object** every render as **`value`** → **mass** **re-renders**.
- **Putting** **everything** in **one** context—**hard** to optimize.
- **Using** context for **remote** data **without** caching **strategy**.
- **Missing** **provider** in **tests** or **routes**—**undefined** **errors**.
- **Ignoring** **concurrent** rendering—**side effects** belong in **effects**, not **render** during context read.
- **Overusing** **context** where **props** or **composition** would be **simpler**.

---

### Performance Checklist (Quick Reference)

**Beginner Level**

Before **blaming** context, **confirm** **re-renders** with **React DevTools** **Profiler**. **Highlight** updates and see **which** providers **changed**.

**Intermediate Level**

**Stable dispatch**: from **`useReducer`** is **stable**—good candidate for **DispatchContext** without **state** in same consumer.

**Expert Level**

**useSyncExternalStore** for **external** stores that **already** support **snapshots** and **subscriptions**—often **better** than **shoving** **high-churn** data through **context**.

```tsx
// Dispatch-only consumer does not need state context
function AddTodo({ text }: { text: string }) {
  const dispatch = useTodosDispatch();
  return (
    <button type="button" onClick={() => dispatch({ type: "add", text })}>
      Add
    </button>
  );
}
```

#### Key Points — Performance Checklist

- **Profile** before **optimizing**.
- **Split** contexts by **update** cadence.
- **Leverage** **stable** **dispatch** references.

---

### Testing Context Consumers

**Beginner Level**

Wrap **unit tests** with **`Provider`** and **pass** **controlled** **value** or **state**.

**Intermediate Level**

Create **`renderWithProviders(ui, { user })`** helper to **reduce** boilerplate across **dashboard** and **e-commerce** tests.

**Expert Level**

**Mock** **modules** for **integration** tests sparingly—**prefer** **explicit** **provider** **props** for **determinism**.

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CartProvider } from "./cart-context";
import { MiniCart } from "./MiniCart";

describe("MiniCart", () => {
  it("shows total", () => {
    render(
      <CartProvider>
        <MiniCart />
      </CartProvider>
    );
    expect(screen.getByText(/items/i)).toBeInTheDocument();
  });
});
```

#### Key Points — Testing

- **Wrap** with **real** **providers** when possible.
- **Helpers** for **consistent** **defaults**.
- **Avoid** **testing** **implementation** details of **context** **internals**.

---

### Migration from Prop Drilling

**Beginner Level**

**Pick** a **shared** **prop** **threaded** through **3+** **layers**—**introduce** **context** at **common** **ancestor**.

**Intermediate Level**

**Gradual** migration: **start** with **read-only** **context**; keep **callbacks** as **props** initially if **clearer**.

**Expert Level**

**Route-level** **providers** for **feature** **isolation**—**lazy** **load** **checkout** **provider** only on **checkout** **routes**.

---

_End of Context API chapter._
