# Conditional Rendering (React + TypeScript)

**Conditional rendering** decides **what UI to show** based on **state**, **props**, **permissions**, **feature flags**, and **async** outcomes. It powers **e-commerce** **checkout** flows, **social** **feed** **empty** states, **dashboard** **loading** **skeletons**, **todo** **filters**, **weather** **error** banners, **chat** **typing** indicators, and **admin** **role** **gates**. This chapter uses **TypeScript** so **conditions** and **branches** stay **type-safe**.

---

## 📑 Table of Contents

- [Conditional Rendering (React + TypeScript)](#conditional-rendering-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [9.1 Conditional Rendering Techniques](#91-conditional-rendering-techniques)
  - [9.2 Conditional Rendering Patterns](#92-conditional-rendering-patterns)
  - [9.3 Common Conditional Scenarios](#93-common-conditional-scenarios)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 9.1 Conditional Rendering Techniques

### if / else (Statements Outside JSX)

**Beginner Level**

Use **`if`**, **`else if`**, and **`else`** **before** **`return`** when a **branch** is **large** or **multiple** **returns** **clarify** **logic**. You **cannot** put **bare** **`if`** **inside** **JSX** **expressions**—**statements** belong **above** the **return** or **inside** **functions**.

**Real-time example**: **E-commerce** **cart** page: if **cart** is **empty**, **return** **`<EmptyCart />`**; **else** **return** **`<CartTable />`**.

**Intermediate Level**

**Early** **`return`** **pairs** well with **`if`**—**reduce** **nesting** and **avoid** **deep** **ternaries** in **JSX**.

**Expert Level**

**TypeScript** **narrowing**: after **`if (!user)`** **`return`**, **`user`** is **narrowed** in **remaining** **code**—**fewer** **`optional`** **checks**.

```tsx
type CartItem = { id: string; qty: number };

export function CartView({ items }: { items: CartItem[] }) {
  if (items.length === 0) {
    return <p>Your cart is empty — add products to continue checkout.</p>;
  }

  return (
    <table>
      <tbody>
        {items.map((i) => (
          <tr key={i.id}>
            <td>{i.id}</td>
            <td>{i.qty}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

#### Key Points — if / else

- **Prefer** **`if`** **returns** for **large** **UI** **differences**.
- **Leverage** **narrowing** in **TypeScript** after **guards**.
- **Keep** **JSX** **expression** **slots** for **small** **conditions** (see **ternary** / **`&&`**).

---

### Ternary Operator (`condition ? a : b`)

**Beginner Level**

**`a ? b : c`** **chooses** **between** **two** **expressions**—**perfect** **inside** **JSX** **curly** **braces** for **small** **branches** like **labels** or **icons**.

**Real-time example**: **Social** **post** **like** **button** shows **“Liked”** vs **“Like”** based on **`isLiked`**.

**Intermediate Level**

**Nested** **ternaries** **hurt** **readability**—**flatten** with **helpers**, **early** **return**, or **small** **components**.

**Expert Level**

**Discriminated** **unions** + **ternary** in **leaf** **components** keep **parent** **logic** **minimal**.

```tsx
type LikeButtonProps = { liked: boolean; onToggle: () => void };

export function LikeButton({ liked, onToggle }: LikeButtonProps) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={liked}>
      {liked ? "♥ Liked" : "♡ Like"}
    </button>
  );
}
```

#### Key Points — Ternary

- **One** **level** **ternary** **per** **expression** **slot** is **usually** **enough**.
- **Extract** **components** when **UI** **differs** **substantially**.
- **Pair** with **`aria-*`** for **accessible** **toggle** **semantics**.

---

### Logical AND (`condition && <Element />`)

**Beginner Level**

**`show && <Banner />`** **renders** **`Banner`** **only** when **`show`** is **truthy**. **Falsy** **values** like **`0`** can **leak** into the **DOM**—**watch** **numeric** **conditions**.

**Real-time example**: **Dashboard** **shows** **“New messages”** **badge** **only** when **`unreadCount > 0`**.

**Intermediate Level**

Use **`Boolean(x)`** or **`!!x`** **carefully**; **prefer** **explicit** **comparisons** like **`count > 0`** **over** **`count &&`** when **`count`** **can** be **`0`**.

**Expert Level**

**Short-circuit** **evaluation** **skips** **right-hand** **side**—**avoid** **side** **effects** **in** **`&&`** **RHS** **unless** **intentional**.

```tsx
export function UnreadBadge({ count }: { count: number }) {
  return (
    <div>
      {count > 0 && (
        <span className="badge" aria-label={`${count} unread messages`}>
          {count}
        </span>
      )}
    </div>
  );
}
```

#### Key Points — `&&`

- **Never** **`{count && ...}`** **when** **`count`** **may** be **`0`** **unless** you **want** **`0`** **rendered**.
- **Use** **`!!`** **sparingly**—**prefer** **clear** **predicates**.
- **Remember** **RHS** **is** **skipped** when **LHS** is **falsy**.

---

### Logical OR (`a || b`) for Fallback Values

**Beginner Level**

**`value || "default"`** **picks** **the** **first** **truthy** **value**. **Empty** **string** **`""`** and **`0`** are **falsy**, so **`||`** **replaces** them—sometimes **wrong** for **UI** **text** or **counts**.

**Real-time example**: **Weather** **widget** **title**: **`cityName || "Your location"`** when **geolocation** **label** **missing**.

**Intermediate Level**

**Prefer** **nullish** **coalescing** (**`??`**) when **only** **`null`**/**`undefined`** **should** **trigger** **fallback**.

**Expert Level**

**Normalize** **API** **data** **at** **boundaries**—**components** **receive** **clean** **strings** **or** **`undefined`**, **not** **mixed** **`""`/`null`**.

```tsx
type WeatherHeaderProps = { city?: string | null };

export function WeatherHeader({ city }: WeatherHeaderProps) {
  const title = city || "Your location";
  return <h2>{title}</h2>;
}
```

#### Key Points — `||`

- **`||`** **treats** **many** **values** as **falsy**—**not** **just** **`null`**/**`undefined`**.
- **Use** **when** **falsy** **values** **should** **map** to **defaults**.
- **Document** **expected** **input** **shape** in **types**.

---

### Nullish Coalescing (`??`)

**Beginner Level**

**`a ?? b`** **returns** **`b`** **only** when **`a`** is **`null`** or **`undefined`**. **`0`**, **`""`**, and **`false`** **are** **preserved**.

**Real-time example**: **Todo** **list** **counter** shows **`0`** **tasks** **without** **replacing** **with** **fallback** **text**.

**Intermediate Level**

**Chain**: **`settings.theme ?? userPrefs.theme ?? "light"`** for **config** **merging** in **dashboard** **apps**.

**Expert Level**

**Combine** with **optional** **chaining**: **`user?.name ?? "Guest"`**—**types** **flow** **cleanly** in **TypeScript** **4+**.

```tsx
type Stats = { completed: number; label?: string | null };

export function TodoStats({ completed, label }: Stats) {
  return (
    <p>
      {label ?? "Tasks"} completed: {completed ?? 0}
    </p>
  );
}
```

#### Key Points — `??`

- **Default** **only** for **`null`**/**`undefined`**—**safe** for **numbers** and **strings**.
- **Pairs** with **`?.`** for **nested** **optional** **data**.
- **Avoid** **mixing** **`??`** **with** **`&&`** **without** **parentheses**—**operator** **precedence** **pitfalls**.

---

### switch / Discriminated Unions

**Beginner Level**

**`switch (status)`** **maps** **enum-like** **strings** to **different** **UI**—**clearer** than **long** **`if`** **chains** for **many** **branches**.

**Real-time example**: **E-commerce** **order** **status**: **`pending`**, **`shipped`**, **`delivered`**, **`cancelled`**.

**Intermediate Level**

**Discriminated** **union** **`{ kind: "loading" } | { kind: "error"; message: string }`**—**`switch (x.kind)`** **narrows** **`x`** **per** **case**.

**Expert Level**

**Exhaustive** **`switch`** with **`never`** **helper** **catches** **missing** **cases** at **compile** **time**.

```tsx
type OrderState =
  | { status: "pending" }
  | { status: "shipped"; trackingUrl: string }
  | { status: "delivered" }
  | { status: "cancelled"; reason: string };

function OrderBanner(state: OrderState) {
  switch (state.status) {
    case "pending":
      return <p>We are preparing your order.</p>;
    case "shipped":
      return (
        <p>
          Shipped — <a href={state.trackingUrl}>Track package</a>
        </p>
      );
    case "delivered":
      return <p>Delivered. Enjoy your purchase!</p>;
    case "cancelled":
      return <p>Cancelled: {state.reason}</p>;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
```

#### Key Points — switch

- **Use** **discriminated** **unions** + **`switch`** for **async** **UI** **machines**.
- **`default` + `never`** **enforces** **exhaustiveness**.
- **Avoid** **fall-through** **`case`** **bugs**—**use** **`break`**/**`return`** **per** **case**.

---

### IIFE Inside JSX (Immediately Invoked Function Expression)

**Beginner Level**

**`{(() => { ... return <X/>; })()}`** **runs** a **function** **inline** **in** **JSX**—**rarely** **needed**; **often** **harder** to **read** than **extracting** **a** **function** **or** **component**.

**Real-time example**: **Quick** **prototype** in **chat** **UI** to **branch** **on** **three** **states** **without** **hoisting** **logic**.

**Intermediate Level**

**Prefer** **named** **functions** **`function renderBody()`** **above** **`return`** or **small** **child** **components**.

**Expert Level**

**IIFE** **can** **capture** **lexical** **scope** **tightly**—**use** **only** when **profiling** shows **benefit** or **legacy** **constraints**; **default** to **clarity**.

```tsx
type ChatStatus = "connecting" | "ready" | "error";

export function ChatStatusBar({ status }: { status: ChatStatus }) {
  return (
    <div>
      {(() => {
        switch (status) {
          case "connecting":
            return <span>Connecting…</span>;
          case "ready":
            return <span>Connected</span>;
          case "error":
            return <span role="alert">Connection failed</span>;
        }
      })()}
    </div>
  );
}
```

#### Key Points — IIFE in JSX

- **Legitimate** **but** **uncommon**—**extract** **when** **reused**.
- **Do** **not** **nest** **deep** **IIFEs**—**readability** **suffers**.
- **Consider** **`useMemo`** **only** for **expensive** **pure** **computations**, **not** **for** **IIFE** **structure**.

---

## 9.2 Conditional Rendering Patterns

### Early Return (Guard Clauses)

**Beginner Level**

**Return** **`null`**, **a** **spinner**, or **a** **placeholder** **before** the **main** **JSX** when **required** **data** is **missing**—**flattens** **the** **happy** **path**.

**Real-time example**: **Social** **profile**: if **`!user`**, **show** **skeleton**; **else** **show** **timeline**.

**Intermediate Level**

**Stack** **guards**: **auth** → **feature** → **data**—**each** **layer** **short-circuits**.

**Expert Level**

**Combine** with **suspense** **boundaries** **and** **error** **boundaries** at **route** **level** for **production** **shells**.

```tsx
type UserProfileProps = { user: { id: string; handle: string } | null; loading: boolean };

export function UserProfile({ user, loading }: UserProfileProps) {
  if (loading) return <p>Loading profile…</p>;
  if (!user) return <p>Profile not found.</p>;

  return (
    <section>
      <h1>@{user.handle}</h1>
      <p>User id: {user.id}</p>
    </section>
  );
}
```

#### Key Points — Early Return

- **Order** **guards** **from** **cheapest** **to** **most** **specific**.
- **Keeps** **main** **`return`** **readable**.
- **Align** **with** **design** **system** **loading**/**empty** **components**.

---

### Element Variables

**Beginner Level**

**Assign** **`let content = ...`** **or** **`const`** **blocks** **before** **`return`** to **build** **UI** **pieces** **step** **by** **step**.

**Real-time example**: **Dashboard** **widget** **builds** **`header`**, **`chart`**, **`footer`** **based** on **`range`**.

**Intermediate Level**

**Type** **variables** as **`React.ReactNode`** **when** **mixing** **strings** **and** **elements**.

**Expert Level**

**Pair** with **`useMemo`** **for** **heavy** **subtrees** **when** **deps** **are** **stable**—**measure** **first**.

```tsx
import type { ReactNode } from "react";

type Range = "7d" | "30d" | "90d";

export function SalesWidget({ range }: { range: Range }) {
  let subtitle: string;
  switch (range) {
    case "7d":
      subtitle = "Last 7 days";
      break;
    case "30d":
      subtitle = "Last 30 days";
      break;
    case "90d":
      subtitle = "Last quarter";
      break;
  }

  const chart: ReactNode = range === "7d" ? <Sparkline /> : <BarChart />;

  return (
    <article>
      <h3>Sales</h3>
      <p>{subtitle}</p>
      {chart}
    </article>
  );
}

function Sparkline() {
  return <div aria-hidden>…</div>;
}
function BarChart() {
  return <div aria-hidden>…</div>;
}
```

#### Key Points — Element Variables

- **Clarifies** **multi-step** **UI** **assembly**.
- **Explicit** **`ReactNode`** **helps** **TypeScript** **when** **mixing** **types**.
- **Avoid** **reassigning** **large** **trees** **every** **render** **without** **need**.

---

### Enum-like Objects / Maps for UI Lookup

**Beginner Level**

**`const LABELS: Record<Status, string>`** **centralizes** **copy**—**switch** **avoidance** for **simple** **string** **mapping**.

**Real-time example**: **E-commerce** **payment** **method** **labels** for **radio** **buttons**.

**Intermediate Level**

**Map** **to** **`ReactNode`** **for** **icons** + **text**; **keep** **keys** **exhaustive** with **`satisfies`** or **`Record`**.

**Expert Level**

**i18n**: **replace** **static** **object** with **`t('order.status.shipped')`** **wrappers**—**same** **pattern**.

```tsx
type PaymentMethod = "card" | "paypal" | "apple";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Credit or debit card",
  paypal: "PayPal",
  apple: "Apple Pay",
};

export function PaymentMethodPicker({ value }: { value: PaymentMethod }) {
  return <fieldset>{PAYMENT_LABELS[value]}</fieldset>;
}
```

#### Key Points — Enum Objects

- **Single** **source** **of** **truth** for **display** **strings**.
- **Use** **`as const`** **arrays** + **`typeof`** **for** **derived** **unions** when **needed**.
- **Validate** **unknown** **API** **strings** **before** **indexing** **`Record`**.

---

### Higher-Order Components (HOC) for Conditional Shells

**Beginner Level**

**`withAuth(Component)`** **returns** **a** **new** **component** that **checks** **session** **before** **rendering** **children**—**legacy** **pattern**, **still** **seen** in **older** **codebases**.

**Real-time example**: **Admin** **dashboard** **wraps** **pages** **with** **`withRole('admin')`**.

**Intermediate Level**

**Prefer** **hooks** + **composition** **today**; **HOCs** **complicate** **ref** **forwarding** and **static** **typing**.

**Expert Level**

**`ComponentType<P>`** **merging** **props** **requires** **careful** **generics**—**document** **injected** **props**.

```tsx
import type { ComponentType } from "react";

export function withRequiresAuth<P extends object>(Wrapped: ComponentType<P>) {
  return function Authenticated(props: P & { isAuthenticated: boolean }) {
    const { isAuthenticated, ...rest } = props;
    if (!isAuthenticated) return <p>Please sign in to continue.</p>;
    return <Wrapped {...(rest as P)} />;
  };
}
```

#### Key Points — HOC

- **Modern** **codebases** **favor** **hooks** **`useAuth()`** + **route** **guards**.
- **Display** **name** **wrapping** **helps** **DevTools**.
- **Avoid** **deep** **HOC** **nesting**—**composition** **wins**.

---

### Render Props for Flexible Conditional UI

**Beginner Level**

**`<DataLoader render={data => ...} />`** **passes** **data** **into** **a** **function** **child**—**caller** **controls** **conditional** **UI**.

**Real-time example**: **Weather** **fetcher** **exposes** **`{ loading, error, data }`** **to** **parent** **layout**.

**Intermediate Level**

**Overlaps** with **children-as-function**; **hooks** **often** **replace** **both**.

**Expert Level**

**Libraries** like **React** **Query** **use** **hooks** **`useQuery`**—**render** **props** **remain** **useful** for **highly** **generic** **containers**.

```tsx
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

export function AsyncView<T>({
  state,
  children,
}: {
  state: AsyncState<T>;
  children: (data: T) => JSX.Element;
}) {
  if (state.status === "idle" || state.status === "loading") return <p>Loading weather…</p>;
  if (state.status === "error") return <p role="alert">{state.message}</p>;
  return children(state.data);
}

type Weather = { tempC: number };

export function WeatherPanel({ state }: { state: AsyncState<Weather> }) {
  return (
    <AsyncView state={state}>
      {(w) => <p>{w.tempC.toFixed(1)}°C</p>}
    </AsyncView>
  );
}
```

#### Key Points — Render Props

- **Great** **for** **library** **APIs** **with** **inversion** **of** **control**.
- **Hooks** **simplify** **most** **app** **code** **paths**.
- **Memoize** **inline** **render** **functions** **if** **they** **cause** **child** **re-renders**—**rare** **issue** **but** **possible**.

---

## 9.3 Common Conditional Scenarios

### Loading States

**Beginner Level**

Show **spinners**, **skeletons**, or **“Loading…”** **text** **while** **`fetch`** **runs**—**avoid** **blank** **screens**.

**Real-time example**: **E-commerce** **product** **grid** **skeleton** **rows** **match** **final** **layout** **to** **reduce** **CLS**.

**Intermediate Level**

**Coarse** vs **fine** **loading**: **route-level** **`<Suspense>`** vs **component-level** **`isLoading`**.

**Expert Level**

**Stale-while-revalidate**: **show** **cached** **data** **with** **small** **inline** **spinner**—**TanStack** **Query** **patterns** (see **chapter** **12**).

```tsx
export function ProductGridShell({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <ul aria-busy="true" aria-live="polite">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="skeleton" />
        ))}
      </ul>
    );
  }
  return null;
}
```

#### Key Points — Loading

- **Prefer** **skeletons** **over** **spinners** for **content-heavy** **pages**.
- **`aria-busy`** **and** **`aria-live`** **improve** **a11y**.
- **Match** **dimensions** **to** **final** **UI** **for** **perceived** **performance**.

---

### Error States

**Beginner Level**

**Catch** **failures** **and** **render** **friendly** **messages** + **retry** **buttons**—**never** **silent** **failures** **in** **production** **UI**.

**Real-time example**: **Chat** **history** **load** **fails** → **inline** **error** **with** **“Try again”**.

**Intermediate Level**

**Map** **HTTP** **codes** **to** **copy**; **log** **correlation** **ids** **for** **support**.

**Expert Level**

**Error** **boundaries** **around** **route** **segments** **complement** **fetch** **errors**—**different** **failure** **domains**.

```tsx
export function ErrorCallout({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="error">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
```

#### Key Points — Error

- **Distinguish** **network** vs **4xx** vs **5xx** **when** **possible**.
- **Always** **offer** **recovery** **actions** **when** **reasonable**.
- **Do** **not** **leak** **raw** **stack** **traces** **to** **end** **users**.

---

### Empty States

**Beginner Level**

When **lists** **have** **no** **items**, **show** **helpful** **empty** **illustrations**, **CTA** **buttons**, and **short** **explanations**.

**Real-time example**: **Todo** **app**: **“No tasks yet — add your first task.”**

**Intermediate Level**

**Differentiate** **“no** **results** **for** **filter”** vs **“no** **data** **at** **all”**—**different** **copy** **and** **actions**.

**Expert Level**

**Track** **analytics** **events** **on** **empty** **state** **views** **to** **improve** **onboarding**.

```tsx
export function TodoEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <section aria-labelledby="empty-heading">
      <h2 id="empty-heading">No tasks yet</h2>
      <p>Create a task to get started with your day.</p>
      <button type="button" onClick={onCreate}>
        New task
      </button>
    </section>
  );
}
```

#### Key Points — Empty

- **Pair** **with** **primary** **CTA** **matching** **user** **intent**.
- **Consider** **permissions**—**maybe** **user** **cannot** **create** **items**.
- **Test** **screen** **readers** **with** **headings** **and** **landmarks**.

---

### Auth-Based Rendering

**Beginner Level**

**Show** **login** **prompts** vs **app** **chrome** **based** on **`user`** **presence**—**simplest** **gate** **for** **MVP**.

**Real-time example**: **Social** **app** **shows** **“Sign** **in** **to** **comment”** **when** **logged** **out**.

**Intermediate Level**

**Avoid** **flash** **of** **wrong** **content**: **wait** **for** **auth** **hydration** **before** **routing** **to** **protected** **views**.

**Expert Level**

**Server** **sessions** + **HTTP-only** **cookies** **with** **SSR** **patterns**—**client** **conditional** **is** **last** **line** **of** **defense**, **not** **only** **security** **layer**.

```tsx
type Session = { userId: string; displayName: string } | null;

export function CommentBox({ session }: { session: Session }) {
  if (!session) {
    return <p>Sign in to join the discussion.</p>;
  }
  return <textarea aria-label="Write a comment" />;
}
```

#### Key Points — Auth-Based

- **Never** **rely** **only** on **client** **hiding** **sensitive** **data**.
- **Align** **with** **backend** **authorization** **checks**.
- **Handle** **token** **refresh** **and** **session** **expiry** **gracefully**.

---

### Feature Flags

**Beginner Level**

**Toggle** **UI** **sections** **from** **remote** **config**—**ship** **dark** **launches** **and** **gradual** **rollouts**.

**Real-time example**: **E-commerce** **enables** **“Buy** **now,** **pay** **later”** **for** **10%** **of** **users**.

**Intermediate Level**

**Stable** **flag** **keys**; **type** **flags** **with** **`Record<FlagKey, boolean>`** **from** **generated** **schema**.

**Expert Level**

**Consistent** **evaluation** **server-side** **for** **pricing** **or** **compliance**; **client** **flags** **for** **UX** **only**.

```tsx
type Flags = { enableNewCheckout: boolean };

export function CheckoutRouter({ flags }: { flags: Flags }) {
  return flags.enableNewCheckout ? <NewCheckout /> : <LegacyCheckout />;
}

function NewCheckout() {
  return <div>New checkout flow</div>;
}
function LegacyCheckout() {
  return <div>Legacy checkout flow</div>;
}
```

#### Key Points — Feature Flags

- **Default** **safe** **off** **states** **when** **config** **fails**.
- **Log** **exposures** **for** **experiment** **analysis**.
- **Avoid** **hundreds** **of** **ad-hoc** **booleans**—**central** **registry**.

---

### Permission-Based Rendering

**Beginner Level**

**Show** **or** **hide** **actions** **like** **“Delete”** **based** on **`user.role`** **or** **`canDelete`** **booleans**.

**Real-time example**: **Dashboard** **“Export** **report”** **only** **for** **`analyst`** **role**.

**Intermediate Level**

**Policy** **functions**: **`can(user, 'invoice:delete', invoice)`** **keep** **rules** **in** **one** **place**.

**Expert Level**

**Attribute-based** **access** **control** (**ABAC**) **with** **server** **enforcement**; **UI** **is** **hint** **only**.

```tsx
type Role = "viewer" | "editor" | "admin";

function canDeleteInvoice(role: Role): boolean {
  return role === "admin" || role === "editor";
}

export function InvoiceRow({ role }: { role: Role }) {
  return (
    <tr>
      <td>INV-1001</td>
      <td>
        {canDeleteInvoice(role) ? (
          <button type="button">Delete</button>
        ) : (
          <span className="muted">No permission</span>
        )}
      </td>
    </tr>
  );
}
```

#### Key Points — Permissions

- **Mirror** **server** **rules**—**never** **assume** **client-only** **checks** **secure** **data**.
- **Hide** vs **disable** **with** **tooltip** **explaining** **why**—**UX** **choice**.
- **Test** **matrix** **of** **roles** **x** **actions**.

---

## Key Points (Chapter Summary)

- **Choose** **techniques** **by** **readability**: **`if`** **returns** **for** **big** **forks**, **ternary**/**`&&`** **for** **small** **inline** **slots**.
- **`??`** **preserves** **`0`/`""`/`false`**; **`||`** **does** **not**—**pick** **intentionally**.
- **Discriminated** **unions** + **`switch`** **scale** **well** **for** **complex** **state** **machines**.
- **Patterns** **like** **early** **return** **and** **policy** **helpers** **reduce** **nested** **JSX**.
- **Loading**, **error**, **empty**, **auth**, **flags**, and **permissions** **are** **standard** **dimensions** **of** **production** **conditionals**.

---

## Best Practices (Global)

1. **Prefer** **explicit** **predicates** **`count > 0`** **over** **truthy** **checks** **when** **numbers** **appear** **in** **UI**.
2. **Extract** **branchy** **UI** **into** **named** **components** **or** **helpers** **to** **keep** **files** **skimmable**.
3. **Centralize** **permission** **and** **feature-flag** **evaluation** **in** **typed** **modules**.
4. **Pair** **conditional** **UI** **with** **accessible** **semantics** (**`role`**, **`aria-live`**, **`aria-busy`**).
5. **Test** **all** **branches** **including** **edge** **cases** (**empty** **strings**, **`0`**, **`null`**).
6. **Align** **client** **visibility** **with** **server** **authorization**—**never** **duplicate** **business** **rules** **only** **on** **client**.
7. **Use** **design** **system** **primitives** **for** **loading**/**error**/**empty** **for** **consistent** **UX**.

---

## Common Mistakes to Avoid

1. **Rendering** **`0`** **with** **`{count && <Badge/>}`**—**use** **`count > 0`**.
2. **Replacing** **valid** **`0`** **or** **`""`** **with** **`value || fallback`** **when** **`??`** **was** **intended**.
3. **Deeply** **nested** **ternaries** **in** **JSX** **without** **extraction**.
4. **Relying** **on** **client-only** **hiding** **for** **security** **or** **compliance**.
5. **Inconsistent** **loading** **UX** **across** **routes** **causing** **layout** **shifts**.
6. **Missing** **exhaustive** **`switch`** **cases** **when** **union** **types** **grow**.
7. **Putting** **side** **effects** **in** **conditional** **expressions** **that** **may** **not** **run**—**use** **`useEffect`** **or** **event** **handlers** **instead**.

---

_This chapter pairs with **Routing** (protected routes), **Data Fetching** (async states), and **State Management** (global session and flags)._
