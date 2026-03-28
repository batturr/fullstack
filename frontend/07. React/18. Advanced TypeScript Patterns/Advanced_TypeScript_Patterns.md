# Advanced TypeScript Patterns (React)

**Advanced** **TypeScript** **patterns** **let** **you** **model** **React** **props**, **events**, **context**, **and** **API** **contracts** **precisely**—**reducing** **production** **bugs** **in** **e-commerce** **checkout**, **social** **feeds**, **admin** **dashboards**, **todo** **apps**, **weather** **widgets**, **and** **chat** **clients**. **This** **chapter** **covers** **conditional** **types**, **generics**, **hooks**, **events**, **`forwardRef`**, **HOCs**, **typed** **context**, **type-safe** **API** **layers**, **and** **third-party** **library** **typing** **strategies**.

---

## 📑 Table of Contents

- [Advanced TypeScript Patterns (React)](#advanced-typescript-patterns-react)
  - [📑 Table of Contents](#-table-of-contents)
  - [18.1 Advanced Type Techniques](#181-advanced-type-techniques)
  - [18.2 Generic Components](#182-generic-components)
  - [18.3 Hooks with TypeScript](#183-hooks-with-typescript)
  - [18.4 Event Types](#184-event-types)
  - [18.5 forwardRef and HOC](#185-forwardref-and-hoc)
  - [18.6 Context with Advanced Types](#186-context-with-advanced-types)
  - [18.7 Type-safe API Clients](#187-type-safe-api-clients)
  - [18.8 Third-party Library Types](#188-third-party-library-types)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 18.1 Advanced Type Techniques

### Conditional Types

**Beginner Level**

**A** **conditional** **type** **chooses** **one** **type** **or** **another** **based** **on** **a** **condition**: **`T extends U ? X : Y`**. **Use** **it** **to** **derive** **props** **from** **a** **union** **or** **to** **strip** **`null`** **only** **when** **needed**.

**Real-time example**: **E-commerce** **product** **detail** **page** **returns** **`DigitalProduct`** **or** **`PhysicalProduct`**—**conditional** **types** **pick** **shipping** **fields** **only** **for** **physical** **goods**.

**Intermediate Level**

**Distributive** **conditional** **types** **apply** **across** **union** **members**—**powerful** **for** **mapping** **API** **variants**.

**Expert Level**

**Combine** `infer` **inside** **conditional** **types** **to** **extract** **function** **return** **types** **or** **element** **types** **from** **arrays**.

```typescript
type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };
type ApiResult<T> = ApiOk<T> | ApiErr;

type Unwrap<T> = T extends ApiOk<infer D> ? D : never;

type Revenue = Unwrap<ApiResult<{ cents: number }>>; // { cents: number } | never → simplified in practice with Extract
```

#### Key Points — Conditional Types

- **Use** **for** **type-level** **branching** **on** **generics**.
- **`infer`** **extracts** **pieces** **of** **types** **for** **reuse**.

---

### Mapped Types for Props

**Beginner Level**

**Mapped** **types** **transform** **each** **key** **in** **a** **type**: **`{ [K in keyof T]: ... }`**. **Common** **use**: **make** **all** **props** **optional** **or** **readonly** **for** **story** **fixtures**.

**Real-time example**: **Dashboard** **widget** **props** **you** **want** **to** **mock** **partially** **in** **tests**.

**Intermediate Level**

**`Pick` + `Record`** **or** **custom** **maps** **for** **derived** **prop** **bags** **(e.g.**, **only** **event** **handlers)**.

**Expert Level**

**Key** **remapping** **with** **`as`** **(TS** **4.1+)** **for** **prefixing** **keys** **in** **design** **systems**.

```typescript
type Props = { title: string; onClose: () => void };

type ReadonlyProps<T> = { readonly [K in keyof T]: T[K] };

type ReadonlyDashboardCardProps = ReadonlyProps<Props>;
```

#### Key Points — Mapped Types

- **Transforms** **entire** **prop** **objects** **without** **duplication**.
- **Pairs** **well** **with** **`keyof`** **and** **utility** **types**.

---

### Template Literal Types

**Beginner Level**

**Template** **literal** **types** **build** **string** **union** **types** **from** **patterns**: **`${Foo}${Bar}`**. **Use** **for** **route** **paths**, **event** **names**, **or** **CSS** **variables** **in** **typed** **design** **tokens**.

**Real-time example**: **Social** **app** **routes** **`/u/:userId/posts/:postId`** **encoded** **as** **discriminated** **path** **helpers**.

**Intermediate Level**

**Combine** **with** **`Extract`/`Exclude`** **to** **narrow** **API** **keys**.

**Expert Level**

**Recursive** **template** **types** **can** **model** **deep** **paths** **(with** **care** **for** **complexity)**.

```typescript
type ChatChannel = "general" | "random" | "incidents";
type ChatPath = `/chat/${ChatChannel}`;

const path: ChatPath = "/chat/general";
```

#### Key Points — Template Literal Types

- **Great** **for** **URL** **and** **event** **names**.
- **Avoid** **exploding** **union** **sizes** **accidentally**.

---

### Utility Types — Partial, Pick, Omit

**Beginner Level**

**`Partial<T>`** **makes** **all** **properties** **optional**. **`Pick<T, K>`** **selects** **keys**. **`Omit<T, K>`** **removes** **keys**.

**Real-time example**: **Todo** **app** **`createTodo`** **accepts** **`Omit<Todo, 'id'>`** **because** **the** **server** **assigns** **id**.

**Intermediate Level**

**`Required<T>`**, **`Readonly<T>`**, **`Record<K, V>`** **complete** **common** **patterns**.

**Expert Level**

**`Pick`/`Omit`** **with** **unions** **and** **`keyof`** **need** **care**—**use** **`Extract`/`Exclude`** **for** **key** **sets**.

```typescript
type User = { id: string; email: string; displayName: string };

type CreateUserInput = Omit<User, "id">;

type PublicProfile = Pick<User, "displayName">;

type DraftProfile = Partial<Pick<User, "displayName" | "email">>;
```

#### Key Points — Utility Types

- **Prefer** **`Omit`** **over** **`Pick`** **when** **excluding** **few** **keys** **from** **large** **types**.
- **`Partial`** **for** **forms** **and** **drafts**.

---

## 18.2 Generic Components

### Function Component Types

**Beginner Level**

**Type** **a** **function** **component** **as** **`(props: Props) => JSX.Element`** **or** **`ReactElement`**. **TypeScript** **infers** **props** **at** **call** **sites**.

**Real-time example**: **Weather** **card** **receives** **`city`** **and** **`tempC`**.

**Intermediate Level**

**Explicit** **return** **type** **helps** **catch** **accidental** **`undefined`** **returns**.

**Expert Level**

**Use** **`React.FC`** **sparingly** **(see** **next** **section)**—**explicit** **function** **types** **are** **often** **clearer**.

```typescript
type WeatherCardProps = { city: string; tempC: number };

export function WeatherCard(props: WeatherCardProps): JSX.Element {
  return (
    <article>
      <h2>{props.city}</h2>
      <p>{props.tempC}°C</p>
    </article>
  );
}
```

#### Key Points — Function Component Types

- **Explicit** **props** **type** **first**.
- **Return** **`JSX.Element`** **or** **`null`** **when** **conditionally** **rendering** **nothing**.

---

### React.FC vs Function Declaration

**Beginner Level**

**`React.FC<Props>`** **adds** **`children`** **implicitly** **in** **older** **typings**—**modern** **teams** **often** **avoid** **`FC`** **and** **declare** **`children`** **explicitly**.

**Real-time example**: **Dashboard** **panel** **may** **not** **need** **`children`**—**`FC`** **would** **still** **allow** **them** **historically**.

**Intermediate Level**

**Function** **declaration** **with** **explicit** **`Props`** **including** **`children?: React.ReactNode`** **when** **needed** **is** **more** ** precise**.

**Expert Level**

**`React.FC`** **can** **interact** **with** **`defaultProps`** **legacy** **patterns**—**prefer** **default** **parameters** **in** **modern** **code**.

```typescript
// Preferred: explicit children when needed
type PanelProps = { title: string; children: React.ReactNode };

export function Panel({ title, children }: PanelProps): JSX.Element {
  return (
    <section aria-labelledby="panel-title">
      <h2 id="panel-title">{title}</h2>
      {children}
    </section>
  );
}
```

#### Key Points — React.FC vs Function Declaration

- **Prefer** **plain** **functions** **+** **explicit** **`Props`**.
- **Avoid** **implicit** **`children`** **unless** **intended**.

---

### Props Interface

**Beginner Level**

**`interface`** **Props** **is** **readable** **and** **extendable** **with** **`extends`**. **Use** **for** **object** **shapes** **of** **component** **props**.

**Real-time example**: **E-commerce** **`ProductCardProps`** **extends** **`BaseCardProps`**.

**Intermediate Level**

**`type`** **with** **intersection** **(`&`)** **can** **compose** **too**—**choose** **one** **style** **per** **repo**.

**Expert Level**

**Declaration** **merging** **applies** **to** **`interface`** **only**—**usually** **irrelevant** **for** **React** **props** **(avoid** **merging** **for** **clarity)**.

```typescript
interface BaseCardProps {
  className?: string;
}

interface ProductCardProps extends BaseCardProps {
  sku: string;
  title: string;
  price: number;
}
```

#### Key Points — Props Interface

- **`extends`** **for** **shared** **layout** **props**.
- **Keep** **props** **narrow** **and** **documented**.

---

### Props Type Inference

**Beginner Level**

**`satisfies`** **(TS** **4.9+)** **checks** **object** **literals** **against** **a** **type** **without** **widening** **literals**.

**Real-time example**: **Chat** **theme** **tokens** **stay** **literal** **union** **types**.

**Intermediate Level**

**`as const`** **on** **objects** **helps** **infer** **readonly** **tuples** **and** **string** **unions**.

**Expert Level**

**`ComponentProps`**, **`ComponentPropsWithoutRef`** **extract** **props** **from** **elements** **or** **components** **for** **wrappers**.

```typescript
import type { ComponentPropsWithoutRef } from "react";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

export type IconButtonProps = NativeButtonProps & { icon: "cart" | "heart" };
```

#### Key Points — Props Inference

- **`satisfies`** **for** **config** **objects**.
- **`ComponentProps`** **for** **HTML** **wrapping**.

---

### Children Props Type

**Beginner Level**

**`children?: React.ReactNode`** **covers** **most** **content** **(elements**, **strings**, **numbers**, **fragments**, **portals)**.

**Real-time example**: **Social** **layout** **shell** **wraps** **feed** **and** **sidebar**.

**Intermediate Level**

**`React.ReactElement`** **if** **you** **require** **a** **single** **element** **child** **or** **specific** **render** **prop**.

**Expert Level**

**`children` **as** **function** **(render** **prop)** **needs** **explicit** **typing** **(see** **Advanced** **Patterns** **chapter)**.

```typescript
type Props = { children: React.ReactNode };

export function Layout({ children }: Props): JSX.Element {
  return <div className="layout">{children}</div>;
}
```

#### Key Points — Children Props

- **`ReactNode`** **by** **default**.
- **Narrow** **when** **you** **must** **enforce** **structure**.

---

### DefaultProps (Legacy)

**Beginner Level**

**Legacy** **`defaultProps`** **on** **function** **components** **interacted** **poorly** **with** **TypeScript** **in** **some** **versions**. **Modern** **pattern**: **default** **parameters** **in** **destructuring**.

**Real-time example**: **Todo** **priority** **defaults** **to** **`"medium"`**.

**Intermediate Level**

**If** **you** **must** **support** **`defaultProps`**, **use** **explicit** **optional** **props** **+** **defaults** **carefully**.

**Expert Level**

**Libraries** **like** **`styled-components`** **may** **still** **use** **`defaultProps`**—**prefer** **defaults** **at** **definition** **for** **new** **code**.

```typescript
type Props = { title: string; subtitle?: string };

export function Section({ title, subtitle = "Details" }: Props): JSX.Element {
  return (
    <header>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}
```

#### Key Points — DefaultProps

- **Prefer** **parameter** **defaults**.
- **Avoid** **`defaultProps`** **on** **function** **components** **unless** **required** **by** **tooling**.

---

## 18.3 Hooks with TypeScript

### useState

**Beginner Level**

**Provide** **an** **explicit** **type** **when** **`null`** **or** **union** **state** **is** **possible**: **`useState<User | null>(null)`**.

**Real-time example**: **E-commerce** **cart** **user** **session** **may** **be** **missing**.

**Intermediate Level**

**Functional** **updates** **`setState(s => ...)`** **preserve** **narrowing** **when** **written** **carefully**.

**Expert Level**

**Discriminated** **unions** **for** **mode** **state** **(idle/loading/success/error)** **reduce** **invalid** **combinations**.

```typescript
type Session =
  | { status: "anonymous" }
  | { status: "signedIn"; userId: string; displayName: string };

export function useSession(): [Session, React.Dispatch<React.SetStateAction<Session>>] {
  return useState<Session>({ status: "anonymous" });
}
```

#### Key Points — useState

- **Always** **type** **nullable** **state**.
- **Prefer** **discriminated** **unions** **for** **async** **flows**.

---

### useEffect

**Beginner Level**

**Type** **dependencies** **implicitly** **via** **typed** **values**. **Avoid** **`any`** **in** **deps** **arrays**.

**Real-time example**: **Dashboard** **refetch** **when** **`metric`** **string** **changes**.

**Intermediate Level**

**`useEffect`** **callback** **must** **not** **be** **`async`** **directly**—**use** **inner** **`async`** **function**.

**Expert Level**

**Use** **`AbortController`** **with** **typed** **`signal`** **passed** **to** **`fetch`**.

```typescript
useEffect(() => {
  const ac = new AbortController();

  async function load() {
    const res = await fetch(`/api/metrics?kpi=${encodeURIComponent(kpi)}`, { signal: ac.signal });
    if (!res.ok) throw new Error(res.statusText);
    const data = (await res.json()) as { value: number };
    setValue(data.value);
  }

  void load();

  return () => ac.abort();
}, [kpi]);
```

#### Key Points — useEffect

- **Keep** **deps** **complete** **and** **typed**.
- **Abort** **async** **work** **on** **cleanup**.

---

### useRef

**Beginner Level**

**`useRef<HTMLInputElement | null>(null)`** **for** **DOM** **refs**. **Mutable** **boxes** **use** **`useRef<number>(0)`** **without** **`null`** **if** **you** **prefer** **explicit** **initialization**.

**Real-time example**: **Chat** **composer** **focus** **after** **send**.

**Intermediate Level**

**Readonly** **`RefObject`** **vs** **mutable** **`MutableRefObject`**—**know** **which** **you** **need**.

**Expert Level**

**Store** **timer** **ids** **in** **`useRef<number | undefined>`** **with** **`window.setTimeout`** **typing**.

```typescript
const inputRef = useRef<HTMLTextAreaElement | null>(null);

function focusComposer() {
  inputRef.current?.focus();
}
```

#### Key Points — useRef

- **DOM** **refs** **are** **`null`** **until** **mounted**.
- **Separate** **DOM** **refs** **from** **mutable** **value** **refs**.

---

### useContext

**Beginner Level**

**Create** **context** **with** **`createContext<T | undefined>(undefined)`** **and** **throw** **if** **missing** **in** **a** **hook** **wrapper**.

**Real-time example**: **Theme** **for** **dashboard** **charts**.

**Intermediate Level**

**Split** **contexts** **to** **avoid** **rerender** **storms** **and** **to** **type** **smaller** **surfaces**.

**Expert Level**

**Use** **`const ThemeContext = createContext<Theme | null>(null)`** **+** **`useTheme()`** **hook** **that** **narrows**.

```typescript
type Theme = "light" | "dark";

const ThemeContext = createContext<Theme | null>(null);

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

#### Key Points — useContext

- **Never** **export** **raw** **context** **without** **a** **typed** **hook**.
- **Split** **by** **concern**.

---

### useReducer

**Beginner Level**

**State** **and** **actions** **as** **typed** **discriminated** **unions** **give** **exhaustive** **`switch`** **checks** **with** **`never`**.

**Real-time example**: **Todo** **list** **reducer** with **`add`/`toggle`/`remove`**.

**Intermediate Level**

**`Reducer<State, Action>`** **type** **from** **React** **helps** **define** **reducer** **function** **signatures**.

**Expert Level**

**Immer** **or** **custom** **middleware** **types** **for** **complex** **state** **(see** **global** **state** **chapter)**.

```typescript
type Todo = { id: string; title: string; done: boolean };

type State = { todos: Todo[] };

type Action =
  | { type: "add"; title: string }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string };

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "add":
      return { todos: [...state.todos, { id: crypto.randomUUID(), title: action.title, done: false }] };
    case "toggle":
      return {
        todos: state.todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case "remove":
      return { todos: state.todos.filter((t) => t.id !== action.id) };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
};
```

#### Key Points — useReducer

- **Model** **actions** **as** **discriminated** **unions**.
- **Use** **`never`** **for** **exhaustiveness**.

---

### Custom Hook Types

**Beginner Level**

**Export** **a** **function** **whose** **name** **starts** **with** **`use`** **and** **return** **a** **typed** **tuple** **or** **object**.

**Real-time example**: **`usePagination`** **for** **social** **feed**.

**Intermediate Level**

**Overload** **signatures** **when** **optional** **parameters** **change** **return** **types** **(advanced)**.

**Expert Level**

**Return** **stable** **`useMemo`**/**`useCallback`** **references** **with** **correct** **dependency** **types**.

```typescript
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
```

#### Key Points — Custom Hooks

- **Return** **types** **should** **be** **explicit** **for** **public** **hooks**.
- **Document** **invariants** **(e.g.**, **only** **call** **in** **provider)**.

---

## 18.4 Event Types

### Event Handler Types

**Beginner Level**

**Use** **`React.ChangeEvent<HTMLInputElement>`** **for** **controlled** **inputs**. **`React.MouseEvent<HTMLButtonElement>`** **for** **clicks**.

**Real-time example**: **Checkout** **form** **fields** **typed** **per** **element**.

**Intermediate Level**

**`FormEvent`** **for** **form** **submit** **handlers**.

**Expert Level**

**`SyntheticEvent`** **pooling** **is** **legacy** **in** **React** **17+**—**still** **type** **handlers** **narrowly**.

```typescript
function onQtyChange(e: React.ChangeEvent<HTMLInputElement>) {
  const qty = Number(e.target.value);
  if (Number.isFinite(qty)) setQty(qty);
}
```

#### Key Points — Event Handlers

- **Always** **parameterize** **element** **type**.

---

### Mouse Events

**Beginner Level**

**`MouseEvent`** **includes** **`clientX`**, **`button`**, **`metaKey`**. **Use** **for** **drag** **handles** **on** **dashboard** **widgets**.

**Intermediate Level**

**Pointer** **events** **may** **be** **preferred** **for** **touch** **+** **mouse**—**types** **exist** **for** **`PointerEvent`** **too**.

**Expert Level**

**Normalize** **accessibility** **for** **custom** **sliders**—**pair** **mouse** **+** **keyboard** **handlers**.

```typescript
function onCanvasClick(e: React.MouseEvent<SVGSVGElement>) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;
  plotPoint(x, y);
}
```

#### Key Points — Mouse Events

- **Use** **`currentTarget`** **when** **handler** **is** **on** **the** **element** **you** **control**.

---

### Keyboard Events

**Beginner Level**

**`KeyboardEvent`** **for** **`keydown`/`keyup`**. **Check** **`e.key`** **for** **“** **Enter** **”**, **`e.key`** **for** **shortcuts**.

**Real-time example**: **Chat** **composer** **sends** **on** **Enter** **without** **Shift**.

**Intermediate Level**

**`e.preventDefault()`** **for** **global** **shortcuts** **when** **appropriate**.

**Expert Level**

**Use** **`useKeyboard`** **pattern** **with** **`useEffect`** **and** **typed** **listeners** **on** **`window`**.

```typescript
function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
}
```

#### Key Points — Keyboard Events

- **Prefer** **`e.key`** **over** **`keyCode`** **(deprecated)**.

---

### Form Events

**Beginner Level**

**`onSubmit`** **typed** **`FormEvent<HTMLFormElement>`**. **Call** **`preventDefault()`** **for** **SPA** **forms**.

**Real-time example**: **E-commerce** **address** **form** **submission**.

**Intermediate Level**

**`reset`** **events** **and** **`input`** **events** **have** **specific** **generic** **parameters**.

**Expert Level**

**Integrate** **with** **validation** **libraries** **that** **supply** **typed** **`handleSubmit`**.

```typescript
function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const postal = String(formData.get("postal") ?? "");
  saveAddress({ postal });
}
```

#### Key Points — Form Events

- **`FormData`** **still** **requires** **runtime** **validation**.

---

### Generic Event Types

**Beginner Level**

**If** **you** **build** **wrappers**, **type** **handler** **props** **as** **`React.EventHandler<T>`** **or** **specific** **`BivarianceHack`** **patterns** **are** **rarely** **needed** **in** **app** **code**.

**Real-time example**: **Dashboard** **wrapper** **passes** **through** **click** **handlers**.

**Intermediate Level**

**Extract** **`type ButtonProps = ComponentPropsWithoutRef<'button'>`** **and** **`Pick`** **what** **you** **expose**.

**Expert Level**

**For** **library** **code**, **consider** **`Omit`** **and** **re-export** **native** **types**.

```typescript
type PassthroughClick = {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export function Card({ onClick, children }: React.PropsWithChildren<PassthroughClick>): JSX.Element {
  return (
    <div role="button" tabIndex={0} onClick={onClick}>
      {children}
    </div>
  );
}
```

#### Key Points — Generic Events

- **Reuse** **React’s** **built-in** **handler** **types**.
- **Expose** **narrow** **surfaces** **on** **wrappers**.

---

## 18.5 forwardRef and HOC

### forwardRef Generic Types

**Beginner Level**

**`forwardRef<T, P>`** **types** **the** **ref** **target** **`T`** **and** **props** **`P`**.

**Real-time example**: **E-commerce** **button** **forwards** **ref** **to** **DOM** **button**.

**Intermediate Level**

**`ComponentPropsWithoutRef<'button'>`** **merged** **with** **your** **props**.

**Expert Level**

**`useImperativeHandle`** **for** **custom** **ref** **APIs** **with** **typed** **handles**.

```typescript
type InputProps = Omit<React.ComponentPropsWithoutRef<"input">, "ref"> & { label: string };

export const FancyInput = React.forwardRef<HTMLInputElement, InputProps>(function FancyInput(
  { label, ...rest },
  ref
) {
  return (
    <label>
      <span>{label}</span>
      <input ref={ref} {...rest} />
    </label>
  );
});
```

#### Key Points — forwardRef

- **Always** **type** **both** **ref** **element** **and** **props**.
- **Use** **`displayName`** **for** **debugging**.

---

### HOC Type Inference

**Beginner Level**

**A** **HOC** **wraps** **a** **component** **and** **injects** **props**. **Typing** **requires** **generics** **to** **preserve** **wrapped** **props**.

**Real-time example**: **`withAuth`** **dashboard** **HOC** **injects** **`user`** **from** **session**.

**Intermediate Level**

**`JSX.LibraryManagedAttributes`** **is** **advanced**—**often** **use** **simpler** **explicit** **return** **types**.

**Expert Level**

**Prefer** **hooks** **over** **HOCs** **for** **new** **code** **unless** **you** **need** **ref** **forwarding** **composition** **patterns**.

```typescript
export function withClassName<P extends object>(Component: React.ComponentType<P>, className: string) {
  const Wrapped: React.FC<P> = (props) => <Component {...props} className={className} />;
  Wrapped.displayName = `withClassName(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}
```

#### Key Points — HOC Inference

- **Preserve** **wrapped** **component** **props** **with** **generics**.
- **Set** **`displayName`**.

---

### Typing Wrapped Components

**Beginner Level**

**Intersection** **types** **for** **injected** **props**: **`P & Injected`**.

**Real-time example**: **Social** **`withTracking`** **adds** **`analyticsId`**.

**Intermediate Level**

**`Omit`** **props** **that** **are** **supplied** **by** **HOC** **externally**.

**Expert Level**

**Use** **`ComponentType`** **constraints** **for** **generic** **HOCs**.

```typescript
type Injected = { tenantId: string };

export function withTenant<P>(Component: React.ComponentType<P & Injected>) {
  return function TenantBound(props: Omit<P, keyof Injected> & Partial<Injected>) {
    const tenantId = useTenantId();
    return <Component {...(props as P & Injected)} tenantId={tenantId} />;
  };
}
```

#### Key Points — Wrapped Components

- **Be** **explicit** **about** **what** **the** **HOC** **provides** **vs** **expects**.

---

### Preserving Props

**Beginner Level**

**Spread** **rest** **props** **onto** **wrapped** **DOM** **or** **components** **with** **`...rest`**.

**Real-time example**: **Styled** **wrapper** **around** **`button`**.

**Intermediate Level**

**`Omit`** **conflicting** **keys** **when** **both** **wrapper** **and** **child** **accept** **`className`**.

**Expert Level**

**Use** **`Merge`** **utility** **types** **in** **design** **systems** **for** **consistent** **overrides**.

```typescript
type Props = React.ComponentPropsWithoutRef<"button"> & { variant: "primary" | "ghost" };

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(
  { variant, className, ...rest },
  ref
) {
  return <button ref={ref} className={cn(variant, className)} {...rest} />;
});
```

#### Key Points — Preserving Props

- **Forward** **unknown** **native** **props** **when** **wrapping** **native** **elements**.

---

### HOC Composition Types

**Beginner Level**

**Compose** **HOCs** **left-to-right** **or** **use** **function** **composition** **with** **explicit** **types** **at** **each** **step**.

**Real-time example**: **`withTheme(withAuth(Page))`** **in** **legacy** **dashboard**.

**Intermediate Level**

**Each** **layer** **should** **narrow** **or** **add** **props** **predictably**.

**Expert Level**

**Prefer** **single** **provider** **+** **hooks** **instead** **of** **deep** **HOC** **stacks**.

```typescript
const compose =
  <A, B, C>(f: (a: A) => B, g: (b: B) => C) =>
  (a: A) =>
    g(f(a));

// Prefer hooks in new code:
// const user = useAuth(); const theme = useTheme();
```

#### Key Points — HOC Composition

- **Deep** **HOC** **chains** **hurt** **inference** **and** **debuggability**.
- **Hooks** **often** **replace** **stacks** **cleanly**.

---

## 18.6 Context with Advanced Types

### Typed Providers

**Beginner Level**

**`createContext<Value>(defaultValue)`** **where** **`Value`** **is** **a** **fully** **specified** **object** **type**.

**Real-time example**: **E-commerce** **cart** **context** **with** **`items[]`** **and** **`addItem`** **method** **types**.

**Intermediate Level**

**Separate** **contexts** **for** **state** **vs** **dispatch** **(like** **Redux** **pattern)** **with** **typed** **tuples**.

**Expert Level**

**Use** **`useReducer`** **+** **context** **typed** **with** **`Dispatch<Action>`**.

```typescript
type CartValue = {
  items: { sku: string; qty: number }[];
  add: (sku: string, qty: number) => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartValue["items"]>([]);
  const value = useMemo<CartValue>(
    () => ({
      items,
      add: (sku, qty) => setItems((prev) => mergeLine(prev, sku, qty)),
    }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

#### Key Points — Typed Providers

- **Value** **objects** **should** **be** **`useMemo`** **stable** **where** **needed**.

---

### Discriminated Unions

**Beginner Level**

**Model** **state** **as** **`{ status: 'idle' } | { status: 'loading' } | ...`** **so** **TypeScript** **narrows** **with** **`switch`**.

**Real-time example**: **Weather** **fetch** **state** **in** **context**.

**Intermediate Level**

**Expose** **narrowing** **helpers** **in** **hooks** **(`getData()`** **only** **when** **`success`)**.

**Expert Level**

**Avoid** **optional** **fields** **that** **combine** **invalid** **states** **(e.g.**, **`data`** **and** **`error`** **both** **set)**.

```typescript
type Remote<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

#### Key Points — Discriminated Unions

- **Make** **illegal** **states** **unrepresentable**.

---

### Multiple Context Composition

**Beginner Level**

**Nest** **providers** **or** **create** **one** **`AppProviders`** **component** **that** **nests** **all**.

**Real-time example**: **Chat** **app** **combines** **`UserProvider`**, **`SocketProvider`**, **`ThemeProvider`**.

**Intermediate Level**

**Order** **matters** **when** **dependencies** **exist**—**document** **required** **nesting**.

**Expert Level**

**Avoid** **mega-context** **values** **that** **change** **often**; **split** **context** **by** **update** **frequency**.

```tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>{children}</ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
```

#### Key Points — Multiple Context

- **Split** **to** **minimize** **rerenders**.
- **Single** **compose** **component** **for** **readability**.

---

### Selectors with Types

**Beginner Level**

**Custom** **hooks** **select** **derived** **data** **from** **context** **with** **`useMemo`**.

**Real-time example**: **Dashboard** **computes** **`total`** **from** **cart** **lines**.

**Intermediate Level**

**Type** **selectors** **as** **pure** **functions** **`(state: State) => ViewModel`**.

**Expert Level**

**For** **performance**, **use** **context** **selectors** **libraries** **or** **external** **stores** **with** **fine-grained** **subscriptions**.

```typescript
export function useCartTotal(): number {
  const { items } = useCart();
  return useMemo(() => items.reduce((sum, l) => sum + l.qty * l.unitPrice, 0), [items]);
}
```

#### Key Points — Selectors

- **Keep** **selectors** **pure** **and** **typed**.
- **Memoize** **expensive** **derivations**.

---

## 18.7 Type-safe API Clients

### Typed Fetch Wrappers

**Beginner Level**

**Wrap** **`fetch`** **with** **a** **function** **`apiGet<T>(path): Promise<T>`** **that** **checks** **`response.ok`**.

**Real-time example**: **Todo** **API** **`GET /api/todos`**.

**Intermediate Level**

**Centralize** **headers**, **base** **URL**, **and** **JSON** **parsing**.

**Expert Level**

**Use** **`zod`** **to** **parse** **JSON** **at** **runtime** **and** **infer** **types**.

```typescript
export class HttpError extends Error {
  constructor(public status: number, message?: string) {
    super(message ?? `HTTP ${status}`);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new HttpError(res.status, await res.text());
  return (await res.json()) as T;
}
```

#### Key Points — Typed Fetch

- **Never** **trust** **`as T`** **without** **validation** **in** **production**.
- **Uniform** **errors**.

---

### API Response Types

**Beginner Level**

**Define** **DTO** **types** **matching** **backend** **JSON** **field** **names**.

**Real-time example**: **Social** **`PostDto`** **with** **`authorId`**, **`createdAt`**.

**Intermediate Level**

**Map** **DTOs** **to** **domain** **types** **in** **a** **single** **layer** **(`mapPostDto`)**.

**Expert Level**

**Version** **API** **responses** **with** **union** **types** **if** **multiple** **versions** **exist**.

```typescript
export type PostDto = {
  id: string;
  author_id: string;
  created_at: string;
  body: string;
};

export type Post = {
  id: string;
  authorId: string;
  createdAt: Date;
  body: string;
};

export function mapPostDto(dto: PostDto): Post {
  return {
    id: dto.id,
    authorId: dto.author_id,
    createdAt: new Date(dto.created_at),
    body: dto.body,
  };
}
```

#### Key Points — API Response Types

- **Isolate** **snake_case** **to** **camelCase** **at** **boundaries**.

---

### Type-safe Query Keys

**Beginner Level**

**Use** **tuples** **as** **keys**: **`['user', userId] as const`**.

**Real-time example**: **TanStack** **Query** **cache** **keys** **for** **dashboard** **metrics**.

**Intermediate Level**

**Factory** **functions** **`userKeys.detail(userId)`** **return** **typed** **readonly** **tuples**.

**Expert Level**

**Encode** **filters** **in** **keys** **with** **stable** **serialization**.

```typescript
export const weatherKeys = {
  all: ["weather"] as const,
  city: (city: string) => [...weatherKeys.all, "city", city] as const,
};
```

#### Key Points — Query Keys

- **`as const`** **for** **literal** **tuple** **types**.
- **Centralize** **key** **factories**.

---

### End-to-end Type Safety

**Beginner Level**

**Share** **types** **via** **a** **monorepo** **package** **`@app/contracts`**.

**Real-time example**: **E-commerce** **and** **Node** **API** **share** **`OrderDto`**.

**Intermediate Level**

**tRPC** **or** **connect** **RPC** **frameworks** **infer** **client** **types** **from** **server** **routers**.

**Expert Level**

**OpenAPI** **codegen** **or** **GraphQL** **codegen** **for** **cross-language** **contracts**.

```typescript
// Shared contract (conceptual)
export type CreateOrderRequest = { cartId: string; shippingAddressId: string };
export type CreateOrderResponse = { orderId: string; paymentClientSecret: string };
```

#### Key Points — End-to-end Safety

- **Single** **source** **of** **truth** **for** **DTOs**.
- **Prefer** **generated** **clients** **for** **large** **APIs**.

---

### Code Generation (GraphQL / OpenAPI)

**Beginner Level**

**GraphQL** **codegen** **emits** **hooks** **and** **types** **from** **schema**. **OpenAPI** **generates** **fetch** **clients**.

**Real-time example**: **Admin** **dashboard** **against** **generated** **SDK**.

**Intermediate Level**

**CI** **checks** **that** **generated** **files** **are** **up** **to** **date**.

**Expert Level**

**Customize** **naming** **and** **nullable** **handling** **to** **match** **your** **TS** **strictness**.

```typescript
// Typical generated hook signature (illustrative)
// const { data } = useGetOrderQuery({ variables: { orderId } });
```

#### Key Points — Code Generation

- **Regenerate** **on** **schema** **changes**.
- **Commit** **generated** **output** **or** **generate** **in** **CI** **(team** **policy)**.

---

## 18.8 Third-party Library Types

### React Router Types

**Beginner Level**

**Use** **`useParams()`** **with** **generics** **in** **v6** **patterns** **or** **assert** **typed** **params** **with** **zod**.

**Real-time example**: **`/shop/:productId`** **in** **e-commerce**.

**Intermediate Level**

**`RouteObject`** **typing** **for** **route** **configs**.

**Expert Level**

**Typed** **router** **state** **via** **`location.state`** **as** **discriminated** **union**.

```typescript
import { useParams } from "react-router-dom";

type Params = { productId: string };

export function ProductPage() {
  const { productId } = useParams<keyof Params>() as Params;
  return <ProductDetails productId={productId} />;
}
```

#### Key Points — React Router

- **Validate** **params** **at** **runtime**.
- **Avoid** **`as`** **without** **checks**.

---

### Redux Toolkit Types

**Beginner Level**

**`configureStore`** **infers** **`RootState`** **and** **`AppDispatch`**.

**Real-time example**: **Dashboard** **slices** **for** **filters** **and** **KPIs**.

**Intermediate Level**

**`createSlice`** **with** **`PayloadAction<T>`**.

**Expert Level**

**RTK** **Query** **typed** **endpoints** **with** **`generated`** **hooks**.

```typescript
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({ reducer: { /* ... */ } } as any);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Key Points — Redux Toolkit

- **Export** **`RootState`**/**`AppDispatch`** **types**.
- **Use** **`typed** **hooks** **`useAppDispatch`**.

---

### Styled Components Types

**Beginner Level**

**`styled.button<{ $active: boolean }>`** **for** **transient** **props** **`$`**.

**Real-time example**: **Social** **tab** **underline** **state**.

**Intermediate Level**

**Theme** **typing** **`DefaultTheme`** **interface** **module** **augmentation**.

**Expert Level**

**Avoid** **prop** **drilling** **into** **DOM**—**`$`** **prefix** **for** **style-only** **props**.

```typescript
import styled from "styled-components";

export const Tab = styled.button<{ $active: boolean }>`
  border-bottom: 2px solid ${(p) => (p.$active ? "blue" : "transparent")};
`;
```

#### Key Points — Styled Components

- **`$`** **transient** **props** **avoid** **invalid** **HTML** **attributes**.
- **Augment** **theme** **types**.

---

### Form Library Types

**Beginner Level**

**React** **Hook** **Form** **`useForm<FormValues>()`** **types** **values** **and** **field** **names**.

**Real-time example**: **Checkout** **shipping** **form**.

**Intermediate Level**

**`zodResolver`** **connects** **schema** **types** **to** **form**.

**Expert Level**

**Field** **arrays** **and** **nested** **objects** **need** **careful** **typing** **with** **`useFieldArray`**.

```typescript
import { useForm } from "react-hook-form";

type ShippingForm = {
  fullName: string;
  address1: string;
  postalCode: string;
};

export function ShippingFormView() {
  const { register, handleSubmit } = useForm<ShippingForm>({ defaultValues: { fullName: "", address1: "", postalCode: "" } });
  return <form onSubmit={handleSubmit(() => {})}>...</form>;
}
```

#### Key Points — Form Libraries

- **One** **source** **of** **truth** **for** **form** **values**.
- **Pair** **with** **schema** **validation**.

---

### Extending Library Types

**Beginner Level**

**Module** **augmentation** **`declare module 'x'`** **for** **missing** **props** **on** **third-party** **components**.

**Real-time example**: **Patch** **`svg` **props** **for** **legacy** **libs**.

**Intermediate Level**

**Wrap** **libraries** **with** **your** **typed** **facade** **instead** **of** **fighting** **internals**.

**Expert Level**

**Contribute** **upstream** **types** **to** **`DefinitelyTyped`** **when** **possible**.

```typescript
// Example: augment theme
declare module "styled-components" {
  export interface DefaultTheme {
    colors: { primary: string; danger: string };
  }
}
```

#### Key Points — Extending Types

- **Prefer** **facades** **for** **large** **gaps**.
- **Augment** **for** **small**, **stable** **fixes**.

---

## Key Points (Chapter Summary)

- **Conditional** **types**, **mapped** **types**, **and** **template** **literals** **model** **complex** **prop** **relationships**.
- **Generic** **components** **and** **explicit** **`Props`** **types** **beat** **implicit** **`any`**.
- **Hooks** **gain** **safety** **from** **discriminated** **unions** **and** **explicit** **ref** **types**.
- **Event** **types** **should** **match** **the** **element** **you** **attach** **to**.
- **`forwardRef`** **and** **HOCs** **need** **generics** **to** **preserve** **inference**.
- **Typed** **context** **+** **selectors** **scales** **better** **than** **untyped** **bags**.
- **API** **layers** **should** **combine** **static** **types** **with** **runtime** **validation** **where** **needed**.
- **Third-party** **types** **often** **need** **thin** **wrappers** **or** **augmentations**.

---

## Best Practices (Global)

- **Prefer** **explicit** **function** **components** **over** **`React.FC`** **unless** **your** **team** **standard** **says** **otherwise**.
- **Use** **`ComponentPropsWithoutRef`** **when** **wrapping** **HTML** **elements**.
- **Model** **remote** **data** **as** **discriminated** **unions** **(`idle/loading/success/error`)**.
- **Centralize** **fetch** **types** **and** **DTO** **mapping** **in** **one** **module** **per** **API** **boundary**.
- **Generate** **clients** **when** **APIs** **are** **large** **or** **frequently** **changing**.
- **Validate** **route** **params** **and** **JSON** **payloads** **at** **runtime** **for** **production** **apps**.
- **Avoid** **`any`** **in** **event** **handlers** **and** **context** **values**.

---

## Common Mistakes to Avoid

- **`as` **casting** **without** **validation** **on** **external** **JSON**.
- **Using** **`React.FC`** **and** **accidentally** **allowing** **unexpected** **`children`** **(legacy)**.
- **Omitting** **`null`** **in** **refs** **and** **crashing** **on** **`.current`** **access**.
- **Missing** **exhaustive** **`switch`** **cases** **in** **reducers** **after** **adding** **actions**.
- **Overly** **complex** **conditional** **types** **that** **slow** **`tsc`** **and** **confuse** **readers**.
- **HOC** **chains** **that** **lose** **prop** **types** **or** **`ref`** **forwarding**.
- **Putting** **unstable** **objects** **in** **context** **value** **without** **`useMemo`**.
- **Ignoring** **library** **`peerDependencies`** **types** **(e.g.**, **router** **version** **mismatches)**.
- **Using** **`keyof any`** **or** **`string`** **for** **query** **keys** **without** **structure**.
- **Duplicating** **DTO** **types** **manually** **across** **frontend** **and** **backend** **without** **a** **shared** **package** **or** **codegen**.

---
