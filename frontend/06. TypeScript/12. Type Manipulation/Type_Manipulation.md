# TypeScript Type Manipulation

**Type manipulation** is the practice of deriving, transforming, filtering, and constructing types from other types (or from values) using TypeScript’s type system. It keeps APIs and data models in sync, encodes invariants at compile time, and reduces duplicated type declarations. This guide covers `typeof` and value-derived types; `keyof`, indexed access, conditional and mapped types, and template literals; common transformations between unions, intersections, tuples, and objects; built-in extraction utilities; filtering with `Exclude`, `Extract`, and custom key filters; construction with `Record`, `Pick`, `Omit`, and friends; and advanced patterns including recursion, state machines, type-level computation, predicates, and typed builders.

---

## 📑 Table of Contents

1. [Type from Value](#1-type-from-value)
2. [Type from Type](#2-type-from-type)
3. [Type Transformation](#3-type-transformation)
4. [Type Extraction](#4-type-extraction)
5. [Type Filtering](#5-type-filtering)
6. [Type Construction](#6-type-construction)
7. [Advanced Patterns](#7-advanced-patterns)
8. [Best Practices](#best-practices)
9. [Common Mistakes](#common-mistakes)

---

## 1. Type from Value

The **`typeof` type operator** (not the runtime `typeof`) queries the type of a value in type position. Combined with **`as const`** and **tuple inference**, you can extract precise literal unions and function signatures without duplicating declarations.

### `typeof` on objects and primitives

### 🟢 Beginner Example

```typescript
const user = {
  id: 1,
  name: "Ada",
  role: "admin" as const,
};

type UserShape = typeof user;
// { id: number; name: string; role: "admin" }

const PI = 3.14;
type PiType = typeof PI; // number
```

### 🟡 Intermediate Example

```typescript
// Share runtime defaults with compile-time types
const defaultTheme = {
  mode: "dark",
  contrast: "high",
  fontScale: 1,
} as const;

type Theme = typeof defaultTheme;
// { readonly mode: "dark"; readonly contrast: "high"; readonly fontScale: 1 }

function applyTheme(t: Theme) {
  document.documentElement.dataset.mode = t.mode;
}
```

### 🔴 Expert Example

```typescript
// typeof on a namespace import merges value + type namespaces
import * as fs from "node:fs";

type ReadFile = typeof fs.readFile; // (...args) => void (simplified)
// Use for mocking: replace fs.readFile while preserving its call signature shape
```

### 🌍 Real-Time Example

```typescript
// API response envelope: one source of truth for runtime + types
const ApiErrorCodes = {
  RATE_LIMIT: "RATE_LIMIT",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes];
// "RATE_LIMIT" | "NOT_FOUND" | "UNAUTHORIZED"

function isKnownError(code: string): code is ApiErrorCode {
  return Object.values(ApiErrorCodes).includes(code as ApiErrorCode);
}
```

### `typeof` on functions and classes

### 🟢 Beginner Example

```typescript
function add(a: number, b: number): number {
  return a + b;
}

type AddFn = typeof add;
// (a: number, b: number) => number
```

### 🟡 Intermediate Example

```typescript
class Counter {
  count = 0;
  inc() {
    this.count += 1;
  }
}

type CounterCtor = typeof Counter;
// typeof Counter (constructor value type)

const c = new Counter();
type CounterInstance = typeof c; // Counter
```

### 🔴 Expert Example

```typescript
// Overloads: typeof resolves to the merged callable type (implementation must be compatible)
function format(x: string): string;
function format(x: number): string;
function format(x: string | number): string {
  return String(x);
}

type Format = typeof format;
// Callable with both overload signatures in the type checker’s view
```

### 🌍 Real-Time Example

```typescript
// Event handler map: derive handler arg types from a single dispatch function
function dispatch(event: "click", detail: { x: number; y: number }): void;
function dispatch(event: "keydown", detail: { key: string }): void;
function dispatch(event: string, detail: unknown): void {
  /* ... */
}

type Dispatch = typeof dispatch;
// Use with Parameters<Dispatch> for tuple of args per overload (first overload wins in some contexts)
```

### Arrays, tuples, and `as const`

### 🟢 Beginner Example

```typescript
const roles = ["guest", "user", "admin"] as const;
type Role = (typeof roles)[number];
// "guest" | "user" | "admin"
```

### 🟡 Intermediate Example

```typescript
const matrix = [
  [1, 2],
  [3, 4],
] as const;

type Row = (typeof matrix)[number];
// readonly [1, 2] | readonly [3, 4]
```

### 🔴 Expert Example

```typescript
// Tuple length and order preserved
const route = ["/", "/about", "/settings"] as const;
type RoutePath = (typeof route)[number];
type RouteIndex = Exclude<keyof typeof route, keyof unknown[]>;
// "0" | "1" | "2" — string indices of tuple elements
```

### 🌍 Real-Time Example

```typescript
// Zod-like pattern: const schema drives literals
const OrderStatus = ["pending", "paid", "shipped", "cancelled"] as const;
type OrderStatusValue = (typeof OrderStatus)[number];

function transition(
  from: OrderStatusValue,
  to: OrderStatusValue
): boolean {
  // business rules...
  return true;
}
```

---

## 2. Type from Type

These operators work **only in type space**. Below, each difficulty band combines **`keyof`**, **indexed access `T[K]`**, **conditional types**, **mapped types**, and **template literal types**.

### 🟢 Beginner Example

```typescript
type User = { id: number; name: string };
type UserKeys = keyof User; // "id" | "name"
type UserName = User["name"]; // string

type IsNum<T> = T extends number ? "yes" : "no";
type Optional<T> = { [K in keyof T]?: T[K] };

type Click = `on${Capitalize<"click">}`; // "onClick"
```

### 🟡 Intermediate Example

```typescript
type Dict = { [k: string]: number };
type DK = keyof Dict; // string | number

type Nested = { meta: { locale: string } };
type Loc = Nested["meta"]["locale"];

type Flatten<T> = T extends Array<infer U> ? U : T;

type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

type Method = "GET" | "POST";
type Route = `${Method} /api/items`;
```

### 🔴 Expert Example

```typescript
// keyof (A | B) = intersection of keys
type KeysAB = keyof ({ a: 1; b: 2 } | { b: 3; c: 4 }); // "b"

type Values<T> = T[keyof T];
type Distrib<T> = T extends unknown ? T[] : never;
type R = Distrib<string | number>; // string[] | number[]

type DeepRO<T> = { readonly [K in keyof T]: T[K] extends object ? DeepRO<T[K]> : T[K] };

type Trim<S extends string> = S extends ` ${infer R}` | `${infer R} ` ? Trim<R> : S;
```

### 🌍 Real-Time Example

```typescript
type UserDto = { id: string; name: string };
type ApiRoutes = {
  "/users": { method: "GET"; response: UserDto[] };
  "/users/:id": { method: "GET"; response: UserDto };
};
type Path = keyof ApiRoutes;
type Res<P extends Path> = ApiRoutes[P]["response"];

type FormErrors<T> = { [K in keyof T]?: T[K] extends string ? string : string[] };

type Bp = "sm" | "md" | "lg";
type Token = `--space-${Bp}`;
```

---

## 3. Type Transformation

Convert between **unions and intersections**, **tuple element unions**, and **object key/value unions** with helpers such as `UnionToIntersection`, `T[keyof T]`, and mapped “entries” patterns.

### 🟢 Beginner Example

```typescript
type U = { a: 1 } | { b: 2 };
type ManualIntersect = { a: 1 } & { b: 2 };

type Tuple = [string, number];
type Elem = Tuple[number]; // string | number

type Obj = { x: "a"; y: "b" };
type Vals = Obj[keyof Obj]; // "a" | "b"
```

### 🟡 Intermediate Example

```typescript
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type Both = { id: string } & { name: string };
type K = keyof Both;

const roles = ["editor", "viewer"] as const;
type Role = (typeof roles)[number];

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
```

### 🔴 Expert Example

```typescript
type ValuesOf<T> = T[keyof T];
type A = { id: 1 | 2 } & { name: "x" | "y" };
type Flat = ValuesOf<A>; // 1 | 2 | "x" | "y"

type TupleToUnion<T extends readonly unknown[]> = T[number];

type KeyValueUnion<T> = { [K in keyof T]: { key: K; value: T[K] } }[keyof T];
```

### 🌍 Real-Time Example

```typescript
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type Configs = { retries: number } | { timeoutMs: number } | { baseUrl: string };
type FullConfig = UnionToIntersection<Configs>;

const perms = ["read", "write", "admin"] as const;
type Perm = (typeof perms)[number];

type Filters = { status: "open" | "closed"; q: string };
function setFilter<K extends keyof Filters>(k: K, v: Filters[K]) {}
```

---

## 4. Type Extraction

Built-in utilities **`ReturnType`**, **`Parameters`**, **`ConstructorParameters`**, **`InstanceType`**, contextual **`ThisType`**, and **`Awaited`** pull pieces out of functions, constructors, and promises.

### 🟢 Beginner Example

```typescript
function parseId(s: string): number {
  return Number(s);
}
type R = ReturnType<typeof parseId>; // number

function greet(name: string, age: number) {}
type P = Parameters<typeof greet>; // [name: string, age: number]

class Point {
  constructor(public x: number, public y: number) {}
}
type Args = ConstructorParameters<typeof Point>;
type Pt = InstanceType<typeof Point>;

type Resolved = Awaited<Promise<string>>; // string
```

### 🟡 Intermediate Example

```typescript
type AsyncNum = () => Promise<number>;
type Prom = ReturnType<AsyncNum>;
type N = Awaited<Prom>; // number

type FirstArg<T extends (...args: never) => unknown> = Parameters<T>[0];

interface Ctx {
  prefix: string;
}
const api = {
  hi(this: Ctx, n: string) {
    return this.prefix + n;
  },
};
```

### 🔴 Expert Example

```typescript
type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

function make<T extends abstract new (...args: never) => unknown>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args) as InstanceType<T>;
}

// Overloaded functions: ReturnType/Parameters follow TS overload rules; split APIs if inference is wrong
type DeepAwaited = Awaited<PromiseLike<Promise<number>>>; // number
```

### 🌍 Real-Time Example

```typescript
const createStore = <S,>(initial: S) => {
  let state = initial;
  return { get: () => state, set: (s: S) => void (state = s) };
};
type Store<S> = ReturnType<typeof createStore<S>>;

type Handler = (ev: MouseEvent, el: HTMLElement) => void;
type MouseEv = Parameters<Handler>[0];

async function fetchUser() {
  return { id: "1" };
}
type UserRow = Awaited<ReturnType<typeof fetchUser>>;

type PluginCtx = { log: (m: string) => void };
function definePlugin<P extends Record<string, (this: PluginCtx, ...a: never[]) => unknown>>(
  p: P & ThisType<PluginCtx>
) {
  return p;
}
```

---

## 5. Type Filtering

Use **`Exclude` / `Extract`** on unions, **`NonNullable`** for nullability, and **mapped `as` clauses** to filter keys by shape or name patterns.

### 🟢 Beginner Example

```typescript
type ABC = "a" | "b" | "c";
type NoA = Exclude<ABC, "a">;
type AB = Extract<ABC, "a" | "b">;

type Maybe = string | null | undefined;
type Sure = NonNullable<Maybe>;

type PickByType<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
type U = { a: string; b: number };
type OnlyStr = PickByType<U, string>;
```

### 🟡 Intermediate Example

```typescript
type Mixed = string | string[] | number;
type Strings = Extract<Mixed, string | string[]>;
type NotArray = Exclude<Mixed, unknown[]>;

type Row = { title: string | null };
type Title = NonNullable<Row["title"]>;

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
```

### 🔴 Expert Example

```typescript
type FnKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type DataKeys<T> = Exclude<keyof T, FnKeys<T>>;

type Public<T> = { [K in keyof T as K extends `_${string}` ? never : K]: T[K] };

type Api = { getUser: () => void; deleteUser: () => void };
type Gets = Pick<Api, Extract<keyof Api, `get${string}`>>;
```

### 🌍 Real-Time Example

```typescript
type DomainEvent =
  | { type: "order.placed"; orderId: string }
  | { type: "order.shipped"; orderId: string; tracking: string };

type Placed = Extract<DomainEvent, { type: "order.placed" }>;

function assertDefined<T>(v: T): asserts v is NonNullable<T> {
  if (v == null) throw new Error("required");
}
```

---

## 6. Type Construction

**`Record`**, **`Pick`**, **`Omit`**, **`Partial`**, **`Required`**, and **`Readonly`** (and their compositions) construct API DTOs, patches, and immutable views.

### 🟢 Beginner Example

```typescript
type Role = "admin" | "user";
type Perms = Record<Role, boolean>;

type User = { id: number; name: string; email: string };
type PublicUser = Pick<User, "name" | "email">;
type NewUser = Omit<User, "id">;

type Draft = Partial<User>;
type Frozen = Readonly<User>;
type Complete = Required<Partial<{ a?: number }>>;
```

### 🟡 Intermediate Example

```typescript
const locales = ["en", "fr"] as const;
type Locale = (typeof locales)[number];
type Copy = Record<Locale, { title: string }>;

type PickNullable<T, K extends keyof T> = { [P in K]: T[P] | null } & Omit<T, K>;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
```

### 🔴 Expert Example

```typescript
type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, "UserId">;
```

### 🌍 Real-Time Example

```typescript
type User = { id: number; name: string; email: string };

type PatchBody = Partial<Pick<User, "name" | "email">>;
type ListQuery = Partial<Pick<User, keyof User>> & { page?: number };

type ApiRow = Readonly<Pick<User, "id" | "name">> & Partial<Omit<User, "id">>;
```

---

## 7. Advanced Patterns

Advanced type manipulation models **recursive data**, **state machines**, **type-level algorithms**, **runtime guards**, and **fluent builders**.

### Recursive type building

### 🟢 Beginner Example

```typescript
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };
```

### 🟡 Intermediate Example

```typescript
type Path<T> = T extends object
  ? {
      [K in keyof T & string]: `${K}` | `${K}.${Path<T[K]>}`;
    }[keyof T & string]
  : never;

type P = Path<{ user: { name: { first: string } } }>;
```

### 🔴 Expert Example

```typescript
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends ReadonlyArray<infer U>
    ? DeepMutable<U>[]
    : T[K] extends object
      ? DeepMutable<T[K]>
      : T[K];
};
```

### 🌍 Real-Time Example

```typescript
type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
};
```

### Type state machines

### 🟢 Beginner Example

```typescript
type State = "idle" | "loading" | "success" | "error";

type Transition = {
  idle: "loading";
  loading: "success" | "error";
  success: never;
  error: "idle";
};
```

### 🟡 Intermediate Example

```typescript
type Machine<S extends State, E extends string> = S extends keyof Transition
  ? Transition[S] extends never
    ? { state: S; event?: never }
    : { state: S; event: Transition[S] }
  : never;
```

### 🔴 Expert Example

```typescript
// Narrow transitions with event + state pairs (full tables grow quickly; keep them shallow)
type Next = { idle: "loading"; loading: "ok" | "err"; ok: never; err: "idle" };
```

### 🌍 Real-Time Example

```typescript
// Encode legal UI steps for a checkout wizard
type Step = "cart" | "shipping" | "payment" | "confirm";
type Allowed = {
  cart: "shipping";
  shipping: "payment";
  payment: "confirm";
  confirm: never;
};
```

### Type-level programming

### 🟢 Beginner Example

```typescript
type Length<T extends readonly unknown[]> = T["length"];
type L = Length<[1, 2, 3]>; // 3
```

### 🟡 Intermediate Example

```typescript
type TupleOf<N extends number, T, Acc extends T[] = []> = Acc["length"] extends N
  ? Acc
  : TupleOf<N, T, [...Acc, T]>;
```

### 🔴 Expert Example

```typescript
// Peano-style numbers (illustrative; TS recursion depth limits apply)
type Zero = [];
type Succ<N extends unknown[]> = [...N, 0];
type Three = Succ<Succ<Succ<Zero>>>; // [0,0,0]
```

### 🌍 Real-Time Example

```typescript
type ArgIndex = 0 | 1 | 2;
type TupleMap<T extends unknown[]> = { [I in keyof T]: T[I] extends string ? Uppercase<T[I]> : T[I] };
```

### Type predicates and type guards

### 🟢 Beginner Example

```typescript
function isString(x: unknown): x is string {
  return typeof x === "string";
}
```

### 🟡 Intermediate Example

```typescript
type Admin = { role: "admin"; key: string };
type User = { role: "user" };

function isAdmin(x: Admin | User): x is Admin {
  return x.role === "admin";
}
```

### 🔴 Expert Example

```typescript
function assertNever(x: never, msg?: string): never {
  throw new Error(msg ?? `Unexpected: ${JSON.stringify(x)}`);
}

function handle(e: "a" | "b") {
  switch (e) {
    case "a":
      return 1;
    case "b":
      return 2;
    default:
      assertNever(e);
  }
}
```

### 🌍 Real-Time Example

```typescript
function isApiError(x: unknown): x is { code: string; message: string } {
  return (
    typeof x === "object" &&
    x !== null &&
    "code" in x &&
    "message" in x
  );
}
```

### Builder pattern types

### 🟢 Beginner Example

```typescript
class QueryBuilder {
  private _tag = "";
  tag(t: string) {
    this._tag = t;
    return this;
  }
  build() {
    return { tag: this._tag };
  }
}
```

### 🟡 Intermediate Example

```typescript
type BuilderState = { url?: string; method?: "GET" | "POST" };

class Req {
  private s: BuilderState = {};
  url(u: string) {
    this.s = { ...this.s, url: u };
    return this;
  }
  method(m: "GET" | "POST") {
    this.s = { ...this.s, method: m };
    return this;
  }
  build(): Required<BuilderState> {
    if (!this.s.url || !this.s.method) throw new Error("incomplete");
    return this.s as Required<BuilderState>;
  }
}
```

### 🔴 Expert Example

```typescript
// Staged builder: each method returns a new type alias tracking "filled" keys
type HasUrl = { url: string };
type HasMethod = { method: "GET" | "POST" };
type Step1 = Partial<HasUrl> & Partial<HasMethod>;
type Step2 = HasUrl & Partial<HasMethod>;
type Step3 = HasUrl & HasMethod;
// Implement methods returning `this as Step2` / `this as Step3` for compile-time progression
```

### 🌍 Real-Time Example

```typescript
// Fluent SQL-ish builder with staged required columns
type SelectBuilder<T extends string = never> = {
  select<C extends string>(c: C): SelectBuilder<T | C>;
  from(table: string): { columns: T extends never ? never : T };
};

function select(): SelectBuilder {
  const cols: string[] = [];
  return {
    select(c) {
      cols.push(c);
      return this as any;
    },
    from(table) {
      return { table, columns: cols as any };
    },
  };
}
```

---

## Best Practices

- **Single source of truth**: Prefer `typeof` on `const` objects and `as const` arrays so runtime values and literal unions stay aligned.
- **Prefer built-ins**: Use `ReturnType`, `Parameters`, `Awaited`, `Pick`, `Omit`, `Extract`, and `Exclude` before reinventing utilities.
- **Name intermediate types**: Complex conditional and mapped types are easier to test and document when broken into small aliases.
- **Watch distributivity**: Conditionals over naked type parameters distribute over unions; wrap with `[T] extends [U]` when you need non-distributive behavior.
- **Respect recursion limits**: Deep mapped types and long tuple arithmetic hit compiler limits; keep recursion shallow or widen types intentionally.
- **Pair types with guards**: When narrowing `unknown`, implement runtime checks that match your type predicates.
- **Staged APIs**: For builders and state machines, model “what’s required next” with generics so invalid sequences fail at compile time where feasible.
- **Compatibility with strict options**: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and `strictNullChecks` change how `Partial`, `keyof`, and index access behave—test under your real `tsconfig`.

---

## Common Mistakes

- **Confusing value `typeof` and type `typeof`**: Runtime `typeof x === "object"` is JavaScript; type `typeof x` in type position queries TypeScript’s type of `x`.
- **Expecting `keyof` on unions to list all keys**: `keyof (A | B)` is the intersection of keys, not the union.
- **Assuming `Partial` is deep**: `Partial` only affects the top level unless you define a recursive mapped type.
- **Using `Parameters<>` on overloaded functions naively**: Inference may not match the overload you expect; consider explicit generic parameters or splitting overloads.
- **Forgetting `readonly` tuples**: Without `as const`, inferred arrays widen to `string[]` instead of precise tuple/literal unions.
- **Template literal false positives**: Not every string at runtime matches a template literal pattern; validate at runtime when input is external.
- **Over-using intersection from unions**: `UnionToIntersection` can produce `never` or surprising results if the union arms are incompatible.
- **Mismatching guards and types**: A predicate `x is Foo` that returns true for non-Foo values breaks type safety—keep predicates honest.
- **Huge mapped types on `any`**: Mapping over `keyof any` or loose index signatures explodes to `string | number` keys and weakens checking.
- **Ignoring `Awaited`**: Using `ReturnType` on async functions gives `Promise<T>`; use `Awaited<ReturnType<...>>` for the resolved value.
