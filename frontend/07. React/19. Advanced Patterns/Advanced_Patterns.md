# Advanced Patterns (React + TypeScript)

**Advanced** **React** **patterns** **shape** **large** **applications**: **e-commerce** **flows**, **social** **timelines**, **analytics** **dashboards**, **collaborative** **chat**, **weather** **widgets**, **and** **multi-step** **forms**. **Patterns** **like** **HOCs**, **render** **props**, **compound** **components**, **controlled** **inputs**, **state** **reducers**, **providers**, **container/presentational** **split**, **composition**, **error** **handling**, **and** **code** **splitting** **help** **you** **balance** **flexibility**, **reuse**, **and** **maintainability**. **TypeScript** **makes** **many** **patterns** **safer** **by** **encoding** **contracts** **explicitly**.

---

## 📑 Table of Contents

- [Advanced Patterns (React + TypeScript)](#advanced-patterns-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [19.1 Higher-Order Components (HOC)](#191-higher-order-components-hoc)
  - [19.2 Render Props](#192-render-props)
  - [19.3 Compound Components](#193-compound-components)
  - [19.4 Controlled vs Uncontrolled](#194-controlled-vs-uncontrolled)
  - [19.5 State Reducer Pattern](#195-state-reducer-pattern)
  - [19.6 Provider Pattern](#196-provider-pattern)
  - [19.7 Container / Presentational](#197-container--presentational)
  - [19.8 Composition Patterns](#198-composition-patterns)
  - [19.9 Error Handling Patterns](#199-error-handling-patterns)
  - [19.10 Code Splitting Patterns](#1910-code-splitting-patterns)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 19.1 Higher-Order Components (HOC)

### HOC Basics

**Beginner Level**

**A** **higher-order** **component** **(HOC)** **is** **a** **function** **that** **takes** **a** **component** **and** **returns** **a** **new** **component** **with** **extra** **behavior** **or** **props**.

**Real-time example**: **E-commerce** **site** **wraps** **checkout** **pages** **to** **require** **sign-in**.

**Intermediate Level**

**HOCs** **were** **the** **primary** **reuse** **mechanism** **before** **hooks**; **they** **still** **appear** **in** **older** **codebases** **and** **some** **libraries**.

**Expert Level**

**HOCs** **compose** **but** **can** **obscure** **types** **and** **refs**—**modern** **apps** **often** **prefer** **hooks** **+** **composition**.

```typescript
type Component<P> = React.ComponentType<P>;

export function withPadding<P>(Wrapped: Component<P>, padding: number): React.FC<P> {
  return function WithPadding(props: P) {
    return (
      <div style={{ padding }}>
        <Wrapped {...props} />
      </div>
    );
  };
}
```

#### Key Points — HOC Basics

- **HOC** **=** **function(Component) → Component**.
- **Name** **wrapped** **output** **with** **`displayName`**.

---

### Creating HOCs

**Beginner Level**

**Create** **a** **function** **accepting** **a** **component**, **return** **a** **new** **component** **that** **renders** **the** **original** **with** **added** **UI** **or** **logic**.

**Real-time example**: **Dashboard** **cards** **share** **loading** **chrome** **via** **`withSkeleton`**.

**Intermediate Level**

**Forward** **unknown** **props** **with** **spread** **and** **preserve** **static** **typing** **with** **generics**.

**Expert Level**

**Consider** **whether** **a** **wrapper** **component** **or** **hook** **is** **clearer** **for** **new** **code**.

```typescript
export function withSkeleton<P extends { loading?: boolean }>(
  Wrapped: React.ComponentType<P>
): React.FC<P> {
  function WithSkeleton(props: P) {
    if (props.loading) return <div aria-busy="true">Loading…</div>;
    return <Wrapped {...props} />;
  }
  WithSkeleton.displayName = `withSkeleton(${Wrapped.displayName ?? Wrapped.name})`;
  return WithSkeleton;
}
```

#### Key Points — Creating HOCs

- **Keep** **HOCs** **small** **and** **focused**.
- **Set** **`displayName`** **for** **React** **DevTools**.

---

### Props Proxy

**Beginner Level**

**Props** **proxy** **means** **the** **HOC** **intercepts** **or** **transforms** **props** **before** **passing** **them** **to** **the** **wrapped** **component**.

**Real-time example**: **Social** **app** **injects** **`analyticsId`** **into** **every** **feed** **item** **props**.

**Intermediate Level**

**Use** **`Omit`** **when** **the** **outer** **API** **does** **not** **expose** **props** **that** **the** **HOC** **supplies**.

**Expert Level**

**Avoid** **mutating** **props** **objects**—**always** **create** **new** **objects**.

```typescript
type WithTenantProps = { tenantId: string };

export function withTenant<P extends object>(Wrapped: React.ComponentType<P & WithTenantProps>) {
  return function TenantProxy(props: Omit<P, keyof WithTenantProps> & Partial<WithTenantProps>) {
    const tenantId = useTenantId(); // from hook/context
    return <Wrapped {...(props as P)} tenantId={tenantId} />;
  };
}
```

#### Key Points — Props Proxy

- **Be** **explicit** **about** **injected** **vs** **passed** **props**.
- **Prefer** **immutable** **merges**.

---

### Inversion of Control (HOC Context)

**Beginner Level**

**HOCs** **invert** **control** **by** **letting** **the** **wrapper** **decide** **when** **and** **how** **to** **render** **the** **inner** **component**.

**Real-time example**: **Feature** **flag** **HOC** **renders** **fallback** **or** **wrapped** **route**.

**Intermediate Level**

**Compare** **to** **render** **props** **and** **hooks**—**all** **invert** **control** **differently**.

**Expert Level**

**Too** **many** **nested** **HOCs** **hurt** **readability**—**flatten** **with** **composition** **or** **hooks**.

```typescript
export function featureFlag<P extends object>(
  flag: string,
  Wrapped: React.ComponentType<P>,
  Fallback: React.ComponentType<P>
): React.FC<P> {
  return function Feature(props: P) {
    const enabled = useFlag(flag);
    return enabled ? <Wrapped {...props} /> : <Fallback {...props} />;
  };
}
```

#### Key Points — Inversion of Control

- **HOC** **centralizes** **policy** **(auth**, **flags**, **telemetry)**.
- **Hooks** **often** **replace** **HOC** **layers** **today**.

---

### HOC Composition

**Beginner Level**

**Compose** **by** **nesting** **or** **pipe** **functions**: **`withAuth(withAnalytics(Page))`**.

**Real-time example**: **Admin** **dashboard** **page** **layers** **logging** **and** **role** **guards**.

**Intermediate Level**

**Order** **matters** **when** **outer** **layers** **depend** **on** **inner** **context** **(e.g.**, **analytics** **requires** **user** **id)**.

**Expert Level**

**Prefer** **a** **single** **`PageShell`** **wrapper** **or** **route** **hooks** **instead** **of** **deep** **nesting**.

```typescript
const compose = <P,>(a: (c: React.ComponentType<P>) => React.ComponentType<P>, b: (c: React.ComponentType<P>) => React.ComponentType<P>) =>
  (c: React.ComponentType<P>) =>
    a(b(c));

// Often clearer in modern code:
// const user = useAuth(); useAnalytics(user?.id);
```

#### Key Points — HOC Composition

- **Deep** **stacks** **are** **hard** **to** **type** **and** **debug**.
- **Hooks** **reduce** **nesting**.

---

### HOC Naming

**Beginner Level**

**Prefix** `with` **or** **`use`** **is** **reserved** **for** **hooks**—**HOCs** **commonly** **use** **`withX`**.

**Real-time example**: **`withCart`**, **`withRouter`** **(legacy)**.

**Intermediate Level**

**`displayName`** **should** **include** **wrapped** **name** **for** **traceability**.

**Expert Level**

**Avoid** **ambiguous** **names** **like** **`enhance`** **or** **`connect`** **without** **module** **context**.

```typescript
Wrapped.displayName = `withAuth(${Inner.displayName ?? Inner.name})`;
```

#### Key Points — HOC Naming

- **Predictable** **prefixes** **help** **grep** **and** **onboarding**.

---

### HOC vs Hooks

**Beginner Level**

**Hooks** **share** **stateful** **logic** **without** **wrapper** **components**. **HOCs** **wrap** **components** **in** **another** **layer**.

**Real-time example**: **Chat** **presence** **as** **`usePresence()`** **instead** **of** **`withPresence`**.

**Intermediate Level**

**Hooks** **compose** **at** **call** **site**; **HOCs** **compose** **at** **module** **level**.

**Expert Level**

**Prefer** **hooks** **for** **new** **code** **unless** **you** **need** **class** **components** **or** **a** **library** **API** **that** **is** **HOC-first**.

```typescript
// Hook-first (preferred today)
export function ChatHeader() {
  const presence = usePresence();
  return <span>{presence.online ? "Online" : "Away"}</span>;
}
```

#### Key Points — HOC vs Hooks

- **Default** **to** **hooks** **for** **logic** **reuse**.
- **HOCs** **remain** **valid** **for** **legacy** **and** **certain** **library** **patterns**.

---

## 19.2 Render Props

### Render Props Pattern

**Beginner Level**

**A** **component** **receives** **a** **function** **prop** **that** **returns** **React** **nodes**, **usually** **named** **`render`** **or** **children**.

**Real-time example**: **Weather** **data** **loader** **renders** **children** **function** **with** **`{data, loading, error}`**.

**Intermediate Level**

**The** **parent** **owns** **state** **and** **exposes** **it** **via** **the** **function** **parameters**.

**Expert Level**

**Type** **the** **function** **parameters** **explicitly** **for** **API** **stability**.

```typescript
type Props<T> = {
  load: () => Promise<T>;
  children: (state: { loading: boolean; data: T | null; error: string | null }) => React.ReactNode;
};

export function AsyncData<T>({ load, children }: Props<T>) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void load()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return <>{children({ loading, data, error })}</>;
}
```

#### Key Points — Render Props

- **Flexible** **composition** **without** **wrapping** **many** **components**.
- **Can** **cause** **callback** **recreation** **if** **not** **memoized**.

---

### Function as Children

**Beginner Level**

**`children`** **as** **a** **function** **`{(props) => ...}`** **is** **a** **render** **prop** **style**.

**Real-time example**: **E-commerce** **cart** **context** **consumer** **pattern** **(legacy)**.

**Intermediate Level**

**Naming** **`children`** **as** **function** **can** **surprise** **readers**—**document** **it**.

**Expert Level**

**Prefer** **typed** **hooks** **for** **context** **today** **(`useCart`)** **for** **simplicity**.

```typescript
type ChildrenFn = (ctx: { count: number }) => React.ReactNode;

export function Counter({ children }: { children: ChildrenFn }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      {children({ count })}
    </div>
  );
}
```

#### Key Points — Function as Children

- **Powerful** **but** **less** **common** **now** **with** **hooks**.

---

### Render Props with Hooks

**Beginner Level**

**Hooks** **cannot** **be** **called** **inside** **inline** **render** **prop** **callbacks** **from** **parents**—**the** **component** **with** **the** **hook** **must** **be** **a** **real** **component**.

**Real-time example**: **Split** **`AsyncData`** **into** **`useAsyncData`** **hook** **+** **thin** **presentational** **component**.

**Intermediate Level**

**Extract** **a** **child** **component** **if** **you** **need** **hooks** **per** **item**.

**Expert Level**

**Pattern**: **hook** **returns** **state**; **parent** **passes** **to** **render** **prop** **or** **children**.

```typescript
function useAsync<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<{ loading: boolean; data: T | null; error: string | null }>({
    loading: true,
    data: null,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    void fn()
      .then((d) => !cancelled && setState({ loading: false, data: d, error: null }))
      .catch((e) => !cancelled && setState({ loading: false, data: null, error: e instanceof Error ? e.message : "err" }));
    return () => {
      cancelled = true;
    };
  }, [fn]);
  return state;
}
```

#### Key Points — Render Props + Hooks

- **Put** **hooks** **in** **components** **or** **custom** **hooks**, **not** **inline** **render** **functions**.

---

### Render Props vs HOC vs Hooks

**Beginner Level**

**Render** **props:** **inline** **composition** **at** **call** **site**. **HOC:** **wrap** **component** **at** **definition**. **Hooks:** **reuse** **state** **in** **function** **components**.

**Real-time example**: **Dashboard** **metric** **fetching** **as** **`useMetric()`**.

**Intermediate Level**

**Hooks** **are** **usually** **simplest** **for** **teams** **today**.

**Expert Level**

**Libraries** **may** **expose** **multiple** **APIs** **for** **flexibility** **(React** **Router** **hooks** **+** **components)**.

#### Key Points — Comparison

- **Default** **to** **hooks**.
- **Render** **props** **still** **useful** **for** **highly** **parameterized** **UI** **slots**.

---

## 19.3 Compound Components

### Compound Components Pattern

**Beginner Level**

**Compound** **components** **split** **one** **concept** **into** **multiple** **named** **subcomponents** **(`Tabs`**, **`Tabs.List`**, **`Tabs.Panel`)** **that** **share** **implicit** **state**.

**Real-time example**: **E-commerce** **filters** **panel** **with** **sections** **that** **coordinate** **open/close**.

**Intermediate Level**

**Users** **compose** **a** **small** **API** **surface** **without** **giant** **prop** **lists**.

**Expert Level**

**Often** **implemented** **with** **context** **or** **explicit** **parent** **registration**.

```tsx
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabButton,
  Panel: TabPanel,
});
```

#### Key Points — Compound Components

- **Great** **for** **design** **systems** **and** **flexible** **UI** **kits**.

---

### Compound Components Using Context

**Beginner Level**

**Parent** **(`TabsRoot`)** **stores** **active** **id** **in** **state** **and** **provides** **via** **context**.

**Real-time example**: **Social** **profile** **tabs** **(Posts**, **Media**, **Likes)**.

**Intermediate Level**

**Children** **consume** **context** **with** **hooks** **(`useTabsContext`)** **and** **throw** **if** **missing**.

**Expert Level**

**Split** **context** **into** **state** **and** **dispatch** **if** **needed** **for** **performance**.

```tsx
type TabsCtx = { activeId: string; setActiveId: (id: string) => void };

const TabsContext = createContext<TabsCtx | null>(null);

export function useTabsContext(): TabsCtx {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs.Root>");
  return ctx;
}
```

#### Key Points — Context in Compound Components

- **Centralizes** **coordination** **logic**.
- **Private** **context** **hook** **prevents** **misuse**.

---

### Flexible APIs

**Beginner Level**

**Callers** **choose** **order** **and** **composition** **of** **subcomponents** **while** **the** **library** **maintains** **invariants**.

**Real-time example**: **Dashboard** **card** **with** **optional** `Card.Header` **and** **`Card.Footer`**.

**Intermediate Level**

**Provide** **sensible** **defaults** **when** **optional** **parts** **missing**.

**Expert Level**

**Use** **type-level** **constraints** **(rare)** **or** **runtime** **validation** **for** **invalid** **combinations**.

#### Key Points — Flexible APIs

- **Avoid** **exploding** **prop** **objects** **on** **the** **root**.

---

### Example Tab Component

**Beginner Level**

**Tabs** **highlight** **active** **tab** **and** **show** **matching** **panel**.

**Real-time example**: **Chat** **settings** **tabs** **(Notifications**, **Devices)**.

**Intermediate Level**

**Associate** **tab** **buttons** **with** **panels** **via** **`id`** **and** **`aria-controls`**.

**Expert Level**

**Keyboard** **navigation** **(arrow** **keys)** **belongs** **here** **or** **via** **a** **headless** **library** **(React** **Aria**/**Radix)**.

```tsx
export function TabsRoot({ children, defaultId }: { children: React.ReactNode; defaultId: string }) {
  const [activeId, setActiveId] = useState(defaultId);
  return <TabsContext.Provider value={{ activeId, setActiveId }}>{children}</TabsContext.Provider>;
}

export function TabButton({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeId, setActiveId } = useTabsContext();
  const selected = activeId === id;
  return (
    <button role="tab" aria-selected={selected} id={`tab-${id}`} onClick={() => setActiveId(id)}>
      {children}
    </button>
  );
}
```

#### Key Points — Tab Example

- **Pair** **with** **ARIA** **roles** **for** **accessibility**.
- **Keep** **state** **in** **root** **provider**.

---

## 19.4 Controlled vs Uncontrolled

### Controlled Pattern

**Beginner Level**

**Controlled** **inputs** **store** **value** **in** **React** **state** **and** **update** **via** **`onChange`**.

**Real-time example**: **Todo** **title** **field** **drives** **disabled** **state** **of** **“** **Add** **”**.

**Intermediate Level**

**Single** **source** **of** **truth** **in** **React** **makes** **derived** **UI** **easy**.

**Expert Level**

**Performance** **for** **large** **forms** **may** **need** **field** **libraries** **or** **uncontrolled** **sections**.

```tsx
function CouponField({ onApply }: { onApply: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <label>
      Coupon
      <input value={code} onChange={(e) => setCode(e.target.value)} />
      <button type="button" onClick={() => onApply(code)}>
        Apply
      </button>
    </label>
  );
}
```

#### Key Points — Controlled

- **Great** **when** **value** **drives** **other** **UI**.
- **More** **renders** **than** **uncontrolled** **for** **fast** **typing**.

---

### Uncontrolled Pattern

**Beginner Level**

**Uncontrolled** **inputs** **use** **`defaultValue`** **and** **`ref`** **to** **read** **values** **on** **submit**.

**Real-time example**: **E-commerce** **search** **bar** **where** **you** **only** **need** **value** **on** **Enter**.

**Intermediate Level**

**Less** **state** **in** **React** **for** **simple** **forms**.

**Expert Level**

**Harder** **to** **enforce** **per-keystroke** **validation** **without** **controlled** **mode**.

```tsx
function SearchBar({ onSubmit }: { onSubmit: (q: string) => void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(ref.current?.value ?? "");
      }}
    >
      <input ref={ref} defaultValue="" aria-label="Search" />
      <button type="submit">Search</button>
    </form>
  );
}
```

#### Key Points — Uncontrolled

- **Good** **for** **simple** **forms** **and** **performance**.
- **Combine** **with** **refs** **and** **`FormData`**.

---

### Hybrid Pattern

**Beginner Level**

**Hybrid** **means** **some** **fields** **controlled** **(validation**, **masking)** **and** **others** **uncontrolled**.

**Real-time example**: **Dashboard** **settings** **form** **with** **one** **complex** **masked** **input** **uncontrolled** **rest** **controlled**.

**Intermediate Level**

**Document** **which** **fields** **are** **which** **to** **avoid** **bugs** **(value** **vs** **defaultValue)**.

**Expert Level**

**Libraries** **may** **manage** **this** **internally** **(RHF** **can** **register** **uncontrolled** **inputs)**.

#### Key Points — Hybrid

- **Never** **mix** **`value`** **and** **`defaultValue`** **on** **one** **input** **incorrectly**.

---

### When to Use Each

**Beginner Level**

**Controlled** **when** **you** **need** **immediate** **React** **state** **per** **keystroke**. **Uncontrolled** **when** **you** **only** **read** **at** **submit** **or** **need** **native** **behavior** **cheaply**.

**Real-time example**: **Chat** **composer** **controlled** **for** **typing** **indicators**; **file** **input** **often** **uncontrolled**.

**Intermediate Level**

**Large** **tables** **may** **use** **uncontrolled** **filters** **for** **perf**.

**Expert Level**

**Measure** **before** **optimizing**—**controlled** **forms** **are** **usually** **fine** **until** **scale** **demands**.

#### Key Points — When to Use

- **Start** **controlled** **unless** **you** **have** **a** **reason**.
- **Uncontrolled** **for** **file** **inputs** **and** **some** **simple** **cases**.

---

## 19.5 State Reducer Pattern

### State Reducer Concept

**Beginner Level**

**State** **reducer** **means** **you** **don’t** **set** **state** **directly**—**you** **dispatch** **actions** **to** **a** **reducer** **function** **that** **returns** **the** **next** **state**.

**Real-time example**: **Todo** **app** **with** **`add`**, **`toggle`**, **`clearCompleted`**.

**Intermediate Level**

**`useReducer`** **bundles** **state** **+** **transitions** **in** **one** **place**.

**Expert Level**

**Reducer** **can** **be** **externalized** **for** **testing** **or** **time-travel** **debugging**.

```typescript
type Action = { type: "increment" } | { type: "decrement" };

function counterReducer(state: number, action: Action): number {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    default:
      return state;
  }
}
```

#### Key Points — State Reducer

- **Centralizes** **transitions**.
- **Great** **for** **multi-step** **flows**.

---

### Inversion of Control

**Beginner Level**

**Libraries** **like** **Downshift** **let** **you** **pass** **a** **custom** **reducer** **to** **override** **internal** **state** **transitions** **(state** **reducer** **pattern** **in** **libraries)**.

**Real-time example**: **E-commerce** **autocomplete** **prevents** **selection** **when** **item** **is** **out** **of** **stock**.

**Intermediate Level**

**You** **receive** **`state`**, **`action`**, **`next`** **and** **return** **modified** **next** **state**.

**Expert Level**

**Powerful** **but** **complex**—**document** **supported** **actions**.

```typescript
type InternalAction = { type: "select"; id: string };

export function productReducer(state: string, action: InternalAction, next: string): string {
  if (action.type === "select" && action.id === "out-of-stock") return state;
  return next;
}
```

#### Key Points — Inversion of Control

- **Custom** **reducers** **enable** **policy** **without** **forking** **libraries**.

---

### Custom State Management

**Beginner Level**

**Reducer** **+** **context** **can** **replace** **Redux** **for** **medium** **apps**.

**Real-time example**: **Social** **notification** **feed** **filters**.

**Intermediate Level**

**Split** **dispatch** **and** **state** **contexts** **to** **reduce** **rerenders**.

**Expert Level**

**Use** **existing** **libraries** **(Zustand**, **Redux**, **Jotai)** **when** **needs** **grow**.

#### Key Points — Custom State

- **Reducers** **shine** **with** **clear** **actions** **and** **middle** **logic**.

---

### State Reducer Use Cases

**Beginner Level**

**Multi-step** **wizards**, **complex** **UI** **state** **machines**, **undo/redo**.

**Real-time example**: **Dashboard** **drag-and-drop** **layout** **editor**.

**Intermediate Level**

**When** **multiple** **`setState`** **calls** **become** **hard** **to** **reason** **about**.

**Expert Level**

**Pair** **with** **XState** **for** **large** **machines**.

#### Key Points — Use Cases

- **Prefer** **reducer** **when** **transitions** **multiply**.

---

## 19.6 Provider Pattern

### Provider Component

**Beginner Level**

**A** **provider** **component** **renders** **`<Context.Provider value={...}>`** **around** **children**.

**Real-time example**: **Theme** **provider** **for** **dashboard**.

**Intermediate Level**

**Encapsulate** **state** **creation** **inside** **the** **provider** **component**.

**Expert Level**

**Memoize** **value** **objects** **to** **avoid** **unnecessary** **rerenders**.

```tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

#### Key Points — Provider Component

- **`useMemo`** **for** **stable** **context** **values**.
- **Split** **providers** **by** **frequency** **of** **change**.

---

### Context-based Providers

**Beginner Level**

**Context** **stores** **global** **or** **subtree** **state** **without** **prop** **drilling**.

**Real-time example**: **E-commerce** **cart** **context**.

**Intermediate Level**

**Expose** **via** **`useCart()`** **hook**.

**Expert Level**

**Avoid** **putting** **everything** **in** **one** **context**.

#### Key Points — Context Providers

- **Great** **for** **medium-frequency** **updates**.
- **Not** **a** **replacement** **for** **server** **cache** **(use** **TanStack** **Query)**.

---

### Provider Composition

**Beginner Level**

**Nest** **providers** **in** **`main.tsx`** **or** **`AppProviders`**.

**Real-time example**: **Chat** **app** **nests** **auth**, **socket**, **theme**.

**Intermediate Level**

**Order** **dependencies** **bottom-up** **(theme** **before** **components** **that** **read** **theme)**.

**Expert Level**

**Consider** **lazy** **providers** **for** **optional** **subsystems**.

```tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

#### Key Points — Composition

- **Single** **file** **for** **provider** **tree** **aids** **readability**.

---

### Provider Best Practices

**Beginner Level**

**Don’t** **put** **unstable** **values** **in** **context** **without** **memoization**.

**Real-time example**: **Weather** **context** **with** **`fetch`** **result** **memoized**.

**Intermediate Level**

**Split** **read** **and** **write** **if** **needed** **(two** **contexts)**.

**Expert Level**

**Use** **external** **stores** **for** **very** **high** **frequency** **updates**.

#### Key Points — Provider Best Practices

- **Measure** **rerenders** **when** **context** **feels** **slow**.

---

## 19.7 Container / Presentational

### Smart vs Dumb

**Beginner Level**

**Smart** **(container)** **components** **fetch** **data** **and** **wire** **events**; **dumb** **(presentational)** **components** **render** **props**.

**Real-time example**: **`ProductPageContainer`** **loads** **`ProductDetailsView`**.

**Intermediate Level**

**Hooks** **often** **replace** **containers** **by** **colocating** **logic** **with** **UI**.

**Expert Level**

**Still** **useful** **as** **a** **mental** **model** **for** **separating** **data** **from** **UI** **even** **if** **not** **separate** **files**.

```tsx
export function ProductDetailsView(props: { title: string; price: number; onAdd: () => void }) {
  return (
    <article>
      <h1>{props.title}</h1>
      <p>${props.price.toFixed(2)}</p>
      <button type="button" onClick={props.onAdd}>
        Add to cart
      </button>
    </article>
  );
}
```

#### Key Points — Smart vs Dumb

- **Separation** **aids** **testing** **presentational** **components** **with** **fixtures**.

---

### Separation of Concerns

**Beginner Level**

**Keep** **network** **and** **routing** **concerns** **out** **of** **pure** **UI** **when** **possible**.

**Real-time example**: **Social** **`PostCard`** **doesn’t** **know** **about** **`fetch`**.

**Intermediate Level**

**Hooks** **blur** **the** **line** **but** **concerns** **still** **exist**.

**Expert Level**

**Domain** **types** **should** **not** **leak** **HTTP** **details** **into** **UI** **props**.

#### Key Points — Separation

- **Map** **DTOs** **to** **view** **models** **at** **boundary**.

---

### Container Components

**Beginner Level**

**Containers** **subscribe** **to** **data** **sources** **and** **pass** **props** **down**.

**Real-time example**: **Dashboard** **`KpiContainer`** **uses** **`useQuery`** **and** **renders** **`KpiCard`**.

**Intermediate Level**

**Containers** **can** **be** **routes** **or** **route** **segments**.

**Expert Level**

**Avoid** **“** **container** **for** **everything** **”** **over-splitting**.

#### Key Points — Containers

- **Co-locate** **with** **routes** **or** **features**.

---

### Presentational Components

**Beginner Level**

**Mostly** **pure** **given** **props**; **easy** **to** **snapshot** **or** **test** **in** **Storybook**.

**Real-time example**: **Weather** **icons** **and** **temperature** **layout**.

**Intermediate Level**

**Keep** **side** **effects** **minimal** **(e.g.**, **no** **`fetch`)**.

**Expert Level**

**Still** **may** **use** **local** **UI** **state** **(expanded/collapsed)**.

#### Key Points — Presentational

- **Great** **for** **design** **system** **components**.

---

### Hooks vs Container

**Beginner Level**

**Hooks** **replace** **many** **container** **classes** **and** **some** **container** **components**.

**Real-time example**: **`useProduct(productId)`** **instead** **of** **`ProductPageContainer`**.

**Intermediate Level**

**Feature** **component** **calls** **hooks** **+** **renders** **presentational** **children**.

**Expert Level**

**Containers** **still** **help** **when** **you** **need** **clear** **Storybook** **stories** **without** **data** **providers**.

```tsx
export function ProductRoute() {
  const { id } = useParams();
  const product = useProduct(id ?? "");
  if (product.status === "loading") return <Spinner />;
  if (product.status === "error") return <ErrorBanner message={product.error} />;
  return <ProductDetailsView title={product.data.title} price={product.data.price} onAdd={product.addToCart} />;
}
```

#### Key Points — Hooks vs Container

- **Hooks** **are** **the** **modern** **container** **mechanism**.

---

## 19.8 Composition Patterns

### Component Composition

**Beginner Level**

**Compose** **small** **components** **with** **`children`** **and** **slots** **instead** **of** **config** **props**.

**Real-time example**: **E-commerce** **product** **layout** **with** **`Media`**, **`Summary`**, **`Reviews`**.

**Intermediate Level**

**Prefer** **composition** **over** **inheritance** **(React** **has** **no** **component** **inheritance)**.

**Expert Level**

**Align** **with** **compound** **components** **for** **library** **APIs**.

#### Key Points — Composition

- **Small** **pieces**, **clear** **boundaries**.

---

### Prop Getters

**Beginner Level**

**Prop** **getters** **(popularized** **by** **Downshift)** **return** **props** **objects** **to** **spread** **onto** **elements** **while** **merging** **user** **handlers**.

**Real-time example**: **Autocomplete** **input** **merges** **`onKeyDown`**.

**Intermediate Level**

**Must** **compose** **event** **handlers** **without** **clobbering**.

**Expert Level**

**Headless** **libraries** **encapsulate** **this** **for** **you**.

```typescript
function getInputProps(userProps: React.HTMLAttributes<HTMLInputElement>) {
  return {
    ...userProps,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      userProps.onKeyDown?.(e);
      // internal logic...
    },
  };
}
```

#### Key Points — Prop Getters

- **Use** **headless** **libraries** **when** **possible**.

---

### State Initializers

**Beginner Level**

**Lazy** **initialization** **`useState(() => expensive())`** **runs** **once**.

**Real-time example**: **Todo** **list** **reads** **initial** **state** **from** **`localStorage`**.

**Intermediate Level**

**Avoid** **recomputing** **initial** **state** **on** **every** **render**.

**Expert Level**

**For** **resetting** **state** **when** **props** **change**, **use** **`key`** **prop** **or** **explicit** **`reset()`** **pattern**.

```typescript
const [todos, setTodos] = useState<Todo[]>(() => loadTodosFromStorage());
```

#### Key Points — State Initializers

- **Use** **lazy** **init** **for** **expensive** **defaults**.

---

### Control Props

**Beginner Level**

**A** **component** **supports** **both** **controlled** **and** **uncontrolled** **modes** **via** **`value`** **+** **`onChange`** **optional**.

**Real-time example**: **Tabs** **where** **parent** **can** **own** **active** **tab** **or** **let** **internal** **state** **handle** **it**.

**Intermediate Level**

**Pattern** **from** **React** **docs** **(fully** **controlled** **vs** **internal** **state)**.

**Expert Level**

**Type** **`value`** **and** **`defaultValue`** **carefully** **to** **avoid** **invalid** **combinations**.

```typescript
type Props = { activeId?: string; defaultActiveId?: string; onChange?: (id: string) => void };

function useControllableState(props: Props) {
  const [internal, setInternal] = useState(props.defaultActiveId ?? "");
  const isControlled = props.activeId !== undefined;
  const activeId = isControlled ? props.activeId! : internal;
  const setActiveId = (id: string) => {
    if (!isControlled) setInternal(id);
    props.onChange?.(id);
  };
  return { activeId, setActiveId };
}
```

#### Key Points — Control Props

- **Enables** **flexible** **library** **components**.

---

### Slot Pattern

**Beginner Level**

**Pass** **named** **props** **like** **`header`****, **`footer`** **as** **`ReactNode`** **or** **render** **props**.

**Real-time example**: **Dashboard** **layout** **slots** **for** **toolbar** **and** **sidebar**.

**Intermediate Level**

**`children`** **is** **the** **default** **slot**.

**Expert Level**

**Multiple** **slots** **avoid** **prop** **explosion** **on** **one** **mega** **component**.

```tsx
export function ModalFrame(props: { title: React.ReactNode; body: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div role="dialog">
      <header>{props.title}</header>
      <div>{props.body}</div>
      {props.footer}
    </div>
  );
}
```

#### Key Points — Slot Pattern

- **Clear** **composition** **points** **for** **design** **systems**.

---

## 19.9 Error Handling Patterns

### Error Boundaries

**Beginner Level**

**Class** **components** **or** **`react-error-boundary`** **catch** **render** **errors** **in** **children** **and** **show** **fallback** **UI**.

**Real-time example**: **Social** **feed** **item** **isolation** **so** **one** **bad** **post** **doesn’t** **crash** **the** **page**.

**Intermediate Level**

**Error** **boundaries** **do** **not** **catch** **event** **handler** **errors** **or** **async** **errors** **unless** **handled**.

**Expert Level**

**Log** **to** **Sentry** **with** **component** **stack** **info**.

```tsx
import { ErrorBoundary } from "react-error-boundary";

export function Feed() {
  return (
    <ErrorBoundary FallbackComponent={PostError}>
      <PostList />
    </ErrorBoundary>
  );
}
```

#### Key Points — Error Boundaries

- **Isolate** **faults** **by** **feature** **or** **route**.

---

### Fallback UI

**Beginner Level**

**Provide** **human-friendly** **fallback** **with** **retry** **actions**.

**Real-time example**: **E-commerce** **payment** **panel** **shows** **“** **Try** **again** **”**.

**Intermediate Level**

**Different** **fallbacks** **for** **chunk** **load** **errors** **vs** **render** **errors**.

**Expert Level**

**Use** **design** **system** **`EmptyState`** **components**.

#### Key Points — Fallback UI

- **Always** **offer** **a** **path** **forward**.

---

### Error Recovery

**Beginner Level**

**Reset** **boundary** **state** **with** **`resetKeys`** **(react-error-boundary)** **when** **navigation** **changes**.

**Real-time example**: **Dashboard** **tab** **switch** **clears** **previous** **error**.

**Intermediate Level**

**Combine** **with** **query** **retry** **for** **data** **errors**.

**Expert Level**

**Idempotent** **server** **operations** **for** **safe** **retries**.

---

### Global Error Handling

**Beginner Level**

**Top-level** **boundary** **around** **app** **plus** **route-level** **boundaries**.

**Real-time example**: **Chat** **app** **global** **“** **something** **went** **wrong** **”** **page**.

**Intermediate Level**

**`window.onerror`** **and** **`unhandledrejection`** **for** **logging** **outside** **React**.

**Expert Level**

**Source** **maps** **in** **production** **for** **readable** **stack** **traces**.

```tsx
export function Root() {
  return (
    <ErrorBoundary FallbackComponent={FatalScreen}>
      <App />
    </ErrorBoundary>
  );
}
```

#### Key Points — Global Handling

- **Layer** **boundaries** **at** **route** **and** **feature** **granularity**.

---

### Async Error Handling

**Beginner Level**

**Async** **errors** **must** **be** **caught** **in** **`try/catch`** **or** **`.catch`** **and** **mapped** **to** **state** **because** **boundaries** **won’t** **catch** **them**.

**Real-time example**: **Weather** **fetch** **failure** **shows** **inline** **error** **banner**.

**Intermediate Level**

**React** **Query** **handles** **error** **states** **per** **query**.

**Expert Level**

**Use** **Error** **types** **and** **discriminated** **unions** **for** **retry** **policies**.

```tsx
function useSafeFetch<T>(url: string) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "ok" | "err"; data?: T; error?: string }>({
    status: "idle",
  });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return (await r.json()) as T;
      })
      .then((data) => !cancelled && setState({ status: "ok", data }))
      .catch((e) => !cancelled && setState({ status: "err", error: e instanceof Error ? e.message : "err" }));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
```

#### Key Points — Async Error

- **Map** **errors** **to** **UI** **state** **explicitly**.
- **Don’t** **rely** **on** **error** **boundaries** **for** **`async`** **work**.

---

## 19.10 Code Splitting Patterns

### Route-based Splitting

**Beginner Level**

**Use** **`React.lazy`** **+** **`Suspense`** **per** **route** **to** **load** **only** **the** **code** **needed** **for** **that** **page**.

**Real-time example**: **E-commerce** **`/checkout`** **bundle** **separate** **from** **`/browse`**.

**Intermediate Level**

**Router** **integration** **with** **`lazy`** **route** **elements**.

**Expert Level**

**Prefetch** **on** **hover** **for** **likely** **navigations**.

```tsx
import { lazy, Suspense } from "react";

const Checkout = lazy(() => import("./routes/Checkout"));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </Suspense>
  );
}
```

#### Key Points — Route Splitting

- **Biggest** **wins** **for** **large** **apps**.

---

### Component-based Splitting

**Beginner Level**

**Lazy-load** **heavy** **widgets** **(charts**, **maps)** **even** **within** **a** **page**.

**Real-time example**: **Dashboard** **chart** **bundle** **loads** **only** **on** **dashboard** **tab**.

**Intermediate Level**

**Provide** **meaningful** **fallbacks** **sized** **like** **final** **UI** **(skeletons)**.

**Expert Level**

**Measure** **bundle** **with** **analyzer** **plugins**.

```tsx
const SalesChart = lazy(() => import("./SalesChart"));

export function SalesPanel() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <SalesChart />
    </Suspense>
  );
}
```

#### Key Points — Component Splitting

- **Great** **for** **heavy** **optional** **widgets**.

---

### Dynamic Loading

**Beginner Level**

**Load** **modules** **on** **demand** **with** **`import()`** **in** **event** **handlers** **for** **rare** **features**.

**Real-time example**: **Admin** **“** **Export** **CSV** **”** **loads** **parser** **only** **when** **clicked**.

**Intermediate Level**

**Show** **spinner** **during** **dynamic** **import**.

**Expert Level**

**Handle** **import** **failures** **(network)** **with** **retry** **UI**.

```typescript
async function exportCsv() {
  const { buildCsv } = await import("./csv");
  const blob = buildCsv(rows);
  downloadBlob(blob);
}
```

#### Key Points — Dynamic Loading

- **Defer** **cost** **until** **needed**.

---

### Loading States

**Beginner Level**

**`Suspense`** **fallback** **for** **lazy** **components**; **local** **spinners** **for** **async** **actions**.

**Real-time example**: **Weather** **page** **shows** **skeleton** **while** **forecast** **loads**.

**Intermediate Level**

**Avoid** **layout** **shift** **with** **skeleton** **dimensions**.

**Expert Level**

**Streaming** **SSR** **(Next.js)** **changes** **loading** **patterns**—**coordinate** **server** **and** **client** **fallbacks**.

**Expert Level**

**Use** **`startTransition`** **to** **keep** **UI** **responsive** **when** **deferring** **non-urgent** **updates**.

```tsx
import { Suspense, useTransition } from "react";

export function Browse() {
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      {isPending ? <InlineSpinner /> : null}
      <Suspense fallback={<GridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
```

#### Key Points — Loading States

- **Skeletons** **>** **spinners** **for** **perceived** **performance**.
- **Pair** **splitting** **with** **clear** **fallbacks**.

---

## Key Points (Chapter Summary)

- **HOCs** **compose** **behavior** **but** **hooks** **often** **replace** **them** **for** **new** **code**.
- **Render** **props** **offer** **flexible** **composition**; **hooks** **simplify** **many** **cases**.
- **Compound** **components** **+** **context** **enable** **ergonomic** **design** **system** **APIs**.
- **Controlled** **inputs** **are** **default** **when** **state** **drives** **UI**; **uncontrolled** **helps** **simple** **or** **perf-sensitive** **forms**.
- **State** **reducers** **and** **library** **state** **reducers** **encode** **complex** **rules** **explicitly**.
- **Providers** **should** **memoize** **values** **and** **split** **by** **update** **frequency**.
- **Container/presentational** **remains** **a** **mental** **model**; **hooks** **carry** **container** **logic**.
- **Composition** **patterns** **(slots**, **prop** **getters**, **control** **props)** **power** **headless** **libraries**.
- **Errors** **need** **boundaries** **for** **render** **and** **explicit** **state** **for** **async**.
- **Code** **splitting** **at** **routes** **and** **heavy** **widgets** **improves** **load** **performance**.

---

## Best Practices (Global)

- **Prefer** **hooks** **for** **sharing** **stateful** **logic** **unless** **HOC** **is** **required** **by** **a** **library**.
- **Design** **compound** **components** **with** **accessible** **roles** **and** **keyboard** **support** **(or** **delegate** **to** **Radix/React** **Aria)**.
- **Validate** **controlled** **vs** **uncontrolled** **modes** **in** **reusable** **inputs**.
- **Memoize** **context** **values**; **split** **contexts** **to** **minimize** **rerenders**.
- **Use** **error** **boundaries** **at** **route** **and** **feature** **granularity** **+** **typed** **error** **state** **for** **async**.
- **Lazy** **load** **routes** **and** **heavy** **charts/maps**; **use** **skeleton** **fallbacks**.
- **Document** **library-style** **patterns** **(render** **props**, **prop** **getters)** **for** **teammates**.

---

## Common Mistakes to Avoid

- **Deep** **HOC** **nesting** **that** **breaks** **ref** **forwarding** **and** **types**.
- **Calling** **hooks** **inside** **inline** **render-prop** **callbacks**.
- **Mega** **context** **values** **that** **change** **every** **render** **and** **slow** **the** **tree**.
- **Mixing** **`value`** **and** **`defaultValue`** **incorrectly** **on** **inputs**.
- **Expecting** **error** **boundaries** **to** **catch** **async** **`fetch`** **errors**.
- **Forgetting** **`Suspense`** **fallback** **UX** **(layout** **shifts)**.
- **Over-splitting** **containers** **into** **too** **many** **files** **without** **benefit**.
- **Prop** **getters** **that** **overwrite** **user** **handlers** **without** **composition**.
- **State** **reducer** **patterns** **without** **exhaustive** **action** **types** **(TypeScript** **`never`** **checks)**.
- **Lazy** **routes** **without** **error** **handling** **for** **failed** **chunk** **loads**.

---
