# TypeScript Advanced Types (Part 2)

This guide continues where foundational advanced types leave off. You will work with **conditional types**, **mapped types**, **indexed access**, **`keyof` / `typeof`**, **recursive type definitions**, **branded types** for safer domain modeling, **type predicates and assertion functions**, and the **`infer`** keyword for extracting pieces of types. Together, these features let you express libraries, APIs, and application boundaries with compile-time precision that scales to large codebases.

---

## 📑 Table of Contents

1. [Conditional Types](#1-conditional-types)
2. [Mapped Types](#2-mapped-types)
3. [Indexed Access Types](#3-indexed-access-types)
4. [The `keyof` Type Operator](#4-the-keyof-type-operator)
5. [The `typeof` Type Operator](#5-the-typeof-type-operator)
6. [Recursive Types](#6-recursive-types)
7. [Branded Types](#7-branded-types)
8. [Type Predicates](#8-type-predicates)
9. [The `infer` Keyword](#9-the-infer-keyword)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Conditional Types

A **conditional type** selects one of two types based on whether a type **extends** another: `T extends U ? X : Y`. It is evaluated at the type level (not at runtime). Conditional types can carry **constraints**, use **`infer`** to capture parts of `T`, and may be **distributive** when `T` is a naked type parameter in a union position.

### Syntax and mental model

- **`T extends U ? X : Y`**: If `T` is assignable to `U`, the result is `X`; otherwise `Y`.
- **Constraints** often appear as `T extends SomeConstraint ? ... : never` to reject invalid `T`.
- **`infer`**: Declares a type variable inside the `extends` side to **extract** a constituent (see [Section 9](#9-the-infer-keyword)).

### 🟢 Beginner Example

```typescript
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>; // "yes"
type B = IsString<number>; // "no"
```

### 🟡 Intermediate Example

```typescript
type ApiResult<T> = T extends Error
  ? { ok: false; error: T }
  : { ok: true; data: T };

type Good = ApiResult<{ id: number }>; // { ok: true; data: { id: number } }
type Bad = ApiResult<TypeError>; // { ok: false; error: TypeError }
```

### 🔴 Expert Example

```typescript
// Constrain T to object-like types before mapping keys
type OptionalizeKeys<T extends object, K extends keyof T> = {
  [P in keyof T as P extends K ? P : never]?: T[P];
} & {
  [P in keyof T as P extends K ? never : P]: T[P];
};

type User = { id: string; name: string; role: "admin" | "user" };
type PartialName = OptionalizeKeys<User, "name">;
// { name?: string } & { id: string; role: "admin" | "user" }
```

### 🌍 Real-Time Example

```typescript
// After validation, model “known present” fields without changing unrelated keys
type StripNullFromKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>;
};

type RawProfile = {
  displayName: string | null;
  bio: string | undefined;
  email: string;
};

type VerifiedProfile = StripNullFromKeys<RawProfile, "displayName" | "bio">;
// { email: string; displayName: string; bio: string }

function verifyProfile(row: RawProfile): VerifiedProfile | null {
  if (row.displayName === null || row.bio === undefined) return null;
  return { ...row, displayName: row.displayName, bio: row.bio };
}
```

This pairs **conditional reasoning at the value level** with a **mapped intersection** so the return type matches what you actually enforced.

### Constraints on generic parameters in conditional types

A **constraint** limits which `T` you will accept before the `?` branch is evaluated. Write `T extends SomeBound ? ... : ...` so invalid shapes collapse to `never` or a safe fallback instead of producing nonsensical fields.

### 🟢 Beginner Example

```typescript
type KeysOfObject<T extends object> = keyof T;

type KO = KeysOfObject<{ a: 1 }>; // "a"
// type Bad = KeysOfObject<string>; // Error: string does not satisfy object constraint
```

### 🟡 Intermediate Example

```typescript
type ValueForKey<T extends object, K extends keyof T> = T[K];

type V = ValueForKey<{ id: number }, "id">; // number
```

### 🔴 Expert Example

```typescript
type CallIfFunction<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : never;

type Fn = CallIfFunction<(x: number) => string>; // (x: number) => string
type Not = CallIfFunction<number>; // never
```

### 🌍 Real-Time Example

```typescript
// Only objects with a string `id` may be passed to cache helpers
type HasStringId<T extends { id: string }> = T;

function rememberEntity<T extends { id: string }>(entity: HasStringId<T>) {
  return entity.id;
}
```

### Distributive conditional types

When `T` is a **naked type parameter** on the left of `extends`, TypeScript **distributes** the conditional over members of a **union** in `T`:

```typescript
type ToArray<T> = T extends any ? T[] : never;

type R = ToArray<string | number>; // string[] | number[]
```

**Non-distributive** behavior is achieved by **wrapping** `T` in a tuple or an identity that prevents distribution:

```typescript
type NonDistributiveExample<T> = [T] extends [string] ? T : T[];
type S = NonDistributiveExample<string | number>; // (string | number)[]
```

### 🟢 Beginner Example (distribution)

```typescript
type ExcludeString<T> = T extends string ? never : T;
type U = ExcludeString<"a" | 1 | true>; // 1 | true
```

### 🟡 Intermediate Example (turn off distribution)

```typescript
type AllExtendString<T> = T extends string ? true : false;
type Wrapped<T> = [T] extends [string] ? true : false;

type D = AllExtendString<string | number>; // true | false (distributed)
type W = Wrapped<string | number>; // false (not distributed)
```

### 🔴 Expert Example (filter union members)

```typescript
type ExtractByTag<
  U extends { tag: string },
  Tag extends U["tag"]
> = U extends { tag: Tag } ? U : never;

type Event =
  | { tag: "click"; x: number; y: number }
  | { tag: "key"; key: string };

type ClickOnly = ExtractByTag<Event, "click">;
// { tag: "click"; x: number; y: number }
```

### 🌍 Real-Time Example (route params)

```typescript
type PathParams<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | PathParams<`/${Rest}`>
    : Path extends `${infer _Start}:${infer Param}`
      ? Param
      : never;

type Id = PathParams<"/users/:userId/posts/:postId">; // "userId" | "postId"
```

### `infer` inside conditional types (preview)

The compiler can **bind** temporary type variables while matching `T` against a pattern. This is the same `infer` family described fully in [Section 9](#9-the-infer-keyword); here it is shown only as it appears inside conditionals:

```typescript
type UnwrapArray<T> = T extends (infer Item)[] ? Item : T;

type U = UnwrapArray<number[]>; // number
type V = UnwrapArray<string>; // string
```

### Non-distributive conditional types (wrapping patterns)

**Wrap** the checked type when you need “all-or-nothing” logic on a union:

```typescript
type IsAllString<T> = [T] extends [string] ? true : false;

type All1 = IsAllString<string>; // true
type All2 = IsAllString<string | number>; // false — the union as a whole is not assignable to string
```

Contrast with the distributive form `T extends string ? true : false`, which yields `true | false` for `string | number`.

---

## 2. Mapped Types

**Mapped types** construct a new object type by iterating keys from a union (often `keyof T`) and transforming each property’s type and modifiers. You can add **`readonly`** and **`?`**, **remap keys** with `as`, **filter** keys by mapping unwanted keys to `never`, use **template literal types** as keys, and apply **`+`** / **`-`** modifier prefixes.

### Basics

```typescript
type ReadonlyShallow<T> = { readonly [K in keyof T]: T[K] };
type PartialShallow<T> = { [K in keyof T]?: T[K] };
```

### Mapping modifiers (`readonly`, `?`)

```typescript
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type RequiredShallow<T> = { [K in keyof T]-?: T[K] };
```

### Key remapping (`as`)

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Person = { name: string; age: number };
type PG = Getters<Person>; // { getName: () => string; getAge: () => number }
```

### Filtering keys with `never`

```typescript
type StripFunctions<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

type Mixed = { id: number; log: () => void };
type DataOnly = StripFunctions<Mixed>; // { id: number }
```

### Template literal keys

```typescript
type HttpMethod = "get" | "post";
type Endpoint = "/users" | "/posts";
type RouteKey = `${HttpMethod} ${Endpoint}`;
// "get /users" | "get /posts" | "post /users" | "post /posts"
```

### Modifiers `+` and `-`

- **`-readonly`**, **`-?`**: Remove readonly / optional.
- **`+readonly`**, **`+?`**: Add readonly / optional (explicit form; often optional is default when you write `?`).

Explicit `+` is useful when you start from a type that already has `-?` or `-readonly` in a pipeline of mapped utilities:

```typescript
type ReOptional<T> = { [K in keyof T]+?: T[K] };

type Tight = { id: string; name?: string };
type LooseAgain = ReOptional<Tight>; // name optional explicitly re-affirmed
```

### Homomorphic mapped types

When you map with `[K in keyof T]` **without** remapping `as`, TypeScript tries to preserve modifiers and relation to `T` (**homomorphic** behavior). Once you add `as SomeRemap`, filtering and renaming can drop or alter modifiers unless you re-apply them.

```typescript
type Copy<T> = { [K in keyof T]: T[K] }; // preserves readonly / optional on each key
type RenameId<T> = {
  [K in keyof T as K extends "id" ? "identifier" : K]: T[K];
};
```

### 🟢 Beginner Example

```typescript
type Nullable<T> = { [K in keyof T]: T[K] | null };

type Row = { id: number; title: string };
type NullableRow = Nullable<Row>; // { id: number | null; title: string | null }
```

### 🟡 Intermediate Example

```typescript
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type Box = { a: string; b: number; c: string };
type StringsOnly = PickByType<Box, string>; // { a: string; c: string }
```

### 🔴 Expert Example

```typescript
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type Nested = { x: { y: { z: number } } };
type Frozen = DeepReadonly<Nested>;
// { readonly x: { readonly y: { readonly z: number } } }
```

### 🌍 Real-Time Example

```typescript
// Versioned entity: same runtime object, different “views” per role
type Entity = {
  id: string;
  internalScore: number;
  displayName: string;
};

type PublicEntity = {
  [K in keyof Entity as K extends "internalScore" ? never : K]: Entity[K];
};
// { id: string; displayName: string }
```

---

## 3. Indexed Access Types

**Indexed access types** use bracket notation `T[K]` to read the type of a property (or an element type). `K` can be a single key, a **union of keys**, or another type that resolves to keys of `T`.

### Type indexing with `[]`

```typescript
type User = { id: number; name: string; tags: string[] };
type Name = User["name"]; // string
type IdOrName = User["id" | "name"]; // number | string
```

### `number` index access (arrays and tuples)

```typescript
type Arr = string[];
type Elem = Arr[number]; // string

type Tuple = [string, number, boolean];
type Head = Tuple[0]; // string
type AnyIndex = Tuple[number]; // string | number | boolean
```

### `typeof` index access

```typescript
const settings = {
  theme: "dark",
  fontSize: 14,
} as const;

type Theme = (typeof settings)["theme"]; // "dark"
type Keys = keyof typeof settings; // "theme" | "fontSize"
```

### `keyof` with index access

```typescript
type Row = { id: number; meta: { version: number } };
type MetaVersion = Row["meta"]["version"]; // number
```

### 🟢 Beginner Example

```typescript
type Point = { x: number; y: number };
type Coord = Point["x"]; // number
```

### 🟡 Intermediate Example

```typescript
type Values<T> = T[keyof T];

type Flags = { read: boolean; write: boolean };
type AnyFlag = Values<Flags>; // boolean
```

### 🔴 Expert Example

```typescript
type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type Doc = { user: { profile: { name: string } } };
type N = PathValue<Doc, "user.profile.name">; // string
```

### 🌍 Real-Time Example

```typescript
// Column type from a schema map
type ColumnMap = {
  id: "uuid";
  amount: "money";
  createdAt: "timestamp";
};

type SqlTypeFor<Col extends keyof ColumnMap> = ColumnMap[Col];

type AmountSql = SqlTypeFor<"amount">; // "money"
```

---

## 4. The `keyof` Type Operator

**`keyof T`** produces a union of known keys of `T`. With **index signatures**, classes, and numeric keys, the exact union reflects TypeScript’s rules for **string**, **number**, and **symbol** keys.

### Basics

```typescript
type User = { id: number; name: string };
type UserKeys = keyof User; // "id" | "name"
```

### With index signatures

```typescript
type Dict = { [key: string]: number };
type DK = keyof Dict; // string | number
// number is included because array-like numeric access is considered
```

### With classes

```typescript
class Account {
  id = 0;
  name = "";
  private secret = "";
}

type PublicKeys = keyof Account; // "id" | "name" (private fields excluded from keyof instance type in typical usage)
```

### Numeric vs string keys

Object keys at runtime are strings (or symbols). TypeScript still models **numeric keys** for arrays and tuple-like objects:

```typescript
type ArrKeys = keyof [boolean, string]; // "0" | "1" | "length" | ...
```

### 🟢 Beginner Example

```typescript
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### 🟡 Intermediate Example

```typescript
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type Opt = OptionalKeys<{ a: string; b?: number }>; // "b"
```

### 🔴 Expert Example

```typescript
type KnownKeys<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

type M = { [k: string]: unknown; id: number };
type KK = KnownKeys<M>; // "id"
```

### 🌍 Real-Time Example

```typescript
// Event names strictly tied to handler map
type Handlers = {
  open: (id: string) => void;
  close: () => void;
};

type EventName = keyof Handlers;

function emit<E extends EventName>(name: E, ...args: Parameters<Handlers[E]>) {
  // dispatch name with args
}
```

---

## 5. The `typeof` Type Operator

At the **type** level, `typeof value` refers to the **TypeScript type** of that value (not JavaScript’s runtime `typeof`). It is essential for **const objects**, **functions**, **classes**, and for deriving types from existing values.

### On values

```typescript
const modes = ["read", "write", "admin"] as const;
type Mode = (typeof modes)[number]; // "read" | "write" | "admin"
```

### On functions

```typescript
function add(a: number, b: number) {
  return a + b;
}

type AddFn = typeof add; // (a: number, b: number) => number
type AddParams = Parameters<typeof add>; // [a: number, b: number]
```

### On classes

```typescript
class Service {
  run(): string {
    return "ok";
  }
}

type ServiceInstance = InstanceType<typeof Service>;
type ServiceCtor = typeof Service;
```

### `typeof` vs `ReturnType`

- **`typeof fn`**: The whole function type.
- **`ReturnType<typeof fn>`**: Only the return type.

```typescript
declare const fetchUser: (id: string) => Promise<{ id: string; name: string }>;

type F = typeof fetchUser;
type R = ReturnType<typeof fetchUser>; // Promise<{ id: string; name: string }>
```

### 🟢 Beginner Example

```typescript
const config = {
  api: "https://api.example.com",
  retries: 3,
} as const;

type Config = typeof config;
```

### 🟡 Intermediate Example

```typescript
const actions = {
  inc: (n: number) => n + 1,
  dec: (n: number) => n - 1,
} as const;

type ActionName = keyof typeof actions;
type ActionFn = (typeof actions)[ActionName];
```

### 🔴 Expert Example

```typescript
// Module namespace style: derive a union of command shapes from a const map
const commands = {
  login: (email: string) => ({ email }),
  logout: () => ({ reason: "user" as const }),
} as const;

type CommandName = keyof typeof commands;
type CommandPayload<N extends CommandName> = ReturnType<(typeof commands)[N]>;
```

### 🌍 Real-Time Example

```typescript
// Keep Zod-like schema and inferred type in sync (pattern sketch)
const UserSchema = {
  parse: (input: unknown) => {
    if (typeof input !== "object" || input === null) throw new Error("bad");
    return input as { id: string };
  },
};

type User = ReturnType<typeof UserSchema.parse>;
```

---

## 6. Recursive Types

**Recursive types** refer to themselves, directly or indirectly. They model **trees**, **JSON**, **linked structures**, and **nested updates**. TypeScript supports recursion in type aliases and interfaces, but very deep instantiation can hit **compiler limits**; recent versions improve **tail recursion** optimization for some conditional-type patterns.

### Recursive type aliases

```typescript
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];
```

### Recursive interfaces

```typescript
interface Category {
  id: string;
  name: string;
  children: Category[];
}
```

### Deeply nested types

```typescript
type NestedPartial<T> = {
  [K in keyof T]?: T[K] extends object ? NestedPartial<T[K]> : T[K];
};
```

### Tail recursion in types (conditional chains)

TypeScript can optimize certain **self-referential conditional types** that are **tail-recursive**-like, reducing instantiation depth errors. Prefer **single** recursive step per branch and **base cases** that terminate on primitives or empty objects.

```typescript
type Length<T extends readonly unknown[]> = T extends readonly [
  unknown,
  ...infer R
]
  ? 1 + Length<R>
  : 0;

type L = Length<["a", "b", "c"]>; // 3
```

### 🟢 Beginner Example

```typescript
type Tree<T> = {
  value: T;
  children: Tree<T>[];
};

const n: Tree<number> = { value: 1, children: [] };
```

### 🟡 Intermediate Example

```typescript
type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? `${K}` | `${K}.${Path<T[K]>}`
        : never;
    }[keyof T]
  : never;

type P = Path<{ a: { b: { c: number } } }>; // "a" | "a.b" | "a.b.c" (simplified illustration)
```

### 🔴 Expert Example

```typescript
// Flatten tuple type recursively
type Flatten<T extends readonly unknown[]> = T extends readonly [
  infer H,
  ...infer R
]
  ? H extends readonly unknown[]
    ? [...Flatten<H>, ...Flatten<R>]
    : [H, ...Flatten<R>]
  : [];

type F = Flatten<[[1, 2], [3], 4]>; // [1, 2, 3, 4]
```

### 🌍 Real-Time Example

```typescript
// File system node used in an IDE sidebar
type FsNode =
  | { kind: "file"; name: string }
  | { kind: "dir"; name: string; children: FsNode[] };

function countFiles(node: FsNode): number {
  if (node.kind === "file") return 1;
  return node.children.reduce((n, c) => n + countFiles(c), 0);
}
```

---

## 7. Branded Types

TypeScript’s type system is **structural**: two types with the same shape are compatible. **Branded types** simulate **nominal typing** by intersecting a base type with a **brand** (often a unique symbol or impossible property) so that values are not accidentally interchangeable.

### Nominal typing simulation

```typescript
declare const brandUserId: unique symbol;
type UserId = string & { readonly [brandUserId]: true };

function createUserId(raw: string): UserId {
  return raw as UserId;
}
```

### Brand property pattern

```typescript
type Brand<B> = string & { __brand: B };
type Email = Brand<"Email">;
type Username = Brand<"Username">;

function sendEmail(to: Email) {
  // ...
}

// const u = "ada" as Username;
// sendEmail(u); // Error: Username is not Email
```

### Type guards for branded types

```typescript
type IsoDateString = string & { readonly __isoDate: unique symbol };

function isIsoDateString(v: string): v is IsoDateString {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function parseDate(v: string): IsoDateString | null {
  return isIsoDateString(v) ? v : null;
}
```

### Use cases: IDs, currencies, validated strings

```typescript
type UsdCents = number & { readonly __currency: "USD_CENTS" };
type EurCents = number & { readonly __currency: "EUR_CENTS" };

function usd(n: number): UsdCents {
  return n as UsdCents;
}

function addUsd(a: UsdCents, b: UsdCents): UsdCents {
  return (a + b) as UsdCents;
}
```

### 🟢 Beginner Example

```typescript
type ProductId = string & { __productId: void };

const id = "p-1" as ProductId;
```

### 🟡 Intermediate Example

```typescript
type Tagged<T, Tag extends string> = T & { readonly __tag: Tag };

type CustomerId = Tagged<string, "CustomerId">;
type OrderId = Tagged<string, "OrderId">;

function lookupOrder(customerId: CustomerId, orderId: OrderId) {
  return { customerId, orderId };
}
```

### 🔴 Expert Example

```typescript
declare const filePathBrand: unique symbol;
type FilePath = string & { readonly [filePathBrand]: true };

function joinPath(base: FilePath, segment: string): FilePath {
  return `${base}/${segment}` as FilePath;
}

// Prevents passing arbitrary strings where a validated path is required
```

### 🌍 Real-Time Example

```typescript
// Payment rail: never add USD to EUR at compile time
type Money<C extends string> = { amount: bigint; currency: C };

function addMoney<C extends string>(a: Money<C>, b: Money<C>): Money<C> {
  return { amount: a.amount + b.amount, currency: a.currency };
}

type USD = Money<"USD">;
type EUR = Money<"EUR">;

const a: USD = { amount: 100n, currency: "USD" };
const b: USD = { amount: 50n, currency: "USD" };
const sum = addMoney(a, b);
```

---

## 8. Type Predicates

**Type predicates** tell the compiler how to **narrow** a value’s type after a check. A **user-defined type guard** returns `x is SomeType`. **Assertion functions** use **`asserts`** to narrow or assert facts about parameters or the function’s return path.

### User-defined type guards

```typescript
interface Dog {
  bark(): void;
}
interface Cat {
  meow(): void;
}

function isDog(a: Dog | Cat): a is Dog {
  return (a as Dog).bark !== undefined;
}
```

### The `is` keyword

```typescript
function isString(v: unknown): v is string {
  return typeof v === "string";
}
```

### Type predicate functions

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function isOk<T>(r: Result<T>): r is { ok: true; value: T } {
  return r.ok;
}
```

### Assertion functions (`asserts`)

```typescript
function assertDefined<T>(v: T): asserts v is NonNullable<T> {
  if (v === undefined || v === null) {
    throw new Error("Expected value");
  }
}

function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new Error("Not a string");
}
```

### 🟢 Beginner Example

```typescript
function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

function double(v: unknown) {
  if (!isNumber(v)) return 0;
  return v * 2;
}
```

### 🟡 Intermediate Example

```typescript
type UnknownRecord = Record<string, unknown>;

function hasProp<K extends string>(
  obj: unknown,
  key: K
): obj is UnknownRecord & Record<K, unknown> {
  return typeof obj === "object" && obj !== null && key in obj;
}
```

### 🔴 Expert Example

```typescript
type Discriminated =
  | { type: "num"; value: number }
  | { type: "str"; value: string };

function narrowDiscriminated(v: Discriminated): v is { type: "num"; value: number } {
  return v.type === "num";
}
```

### 🌍 Real-Time Example

```typescript
// Express-style middleware: assert authenticated user on request
interface User {
  id: string;
}

function assertUser(req: { user?: User }): asserts req is { user: User } {
  if (!req.user) throw new Error("Unauthorized");
}

function profileHandler(req: { user?: User }) {
  assertUser(req);
  return req.user.id;
}
```

---

## 9. The `infer` Keyword

**`infer`** introduces a **type variable** inside the **check type** of a conditional type. TypeScript tries to **infer** the best type for that variable; if it cannot, the branch fails (often resolving to `never` in larger compositions). You may use **multiple** `infer` positions and **nested** patterns to extract **return types**, **parameters**, **promise payloads**, and more.

### In conditional types

```typescript
type ElementType<T> = T extends readonly (infer U)[] ? U : never;

type E = ElementType<string[]>; // string
```

### Multiple `infer` usages

```typescript
type FirstArg<T> = T extends (a: infer A, ...args: unknown[]) => unknown
  ? A
  : never;

type FA = FirstArg<(x: number, y: string) => void>; // number
```

### `infer` patterns (structured extraction)

```typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type U = UnwrapPromise<Promise<{ id: number }>>; // { id: number }
```

### Extracting types (utility-style)

```typescript
type ConstructorReturn<T> = T extends new (...args: unknown[]) => infer R
  ? R
  : never;

class Box {
  value = 0;
}

type Inst = ConstructorReturn<typeof Box>; // Box
```

### 🟢 Beginner Example

```typescript
type Args<T> = T extends (...args: infer A) => unknown ? A : never;

type A = Args<(a: string, b: number) => void>; // [a: string, b: number]
```

### 🟡 Intermediate Example

```typescript
type Last<T extends readonly unknown[]> = T extends readonly [
  ...infer _,
  infer L
]
  ? L
  : never;

type L = Last<[1, 2, 3]>; // 3
```

### 🔴 Expert Example

```typescript
// Currying parameter list split
type CurryParams<T> = T extends (first: infer F, ...rest: infer R) => infer Out
  ? R extends []
    ? (first: F) => Out
    : (first: F) => CurryParams<(...args: R) => Out>
  : T;

// Illustrative only — real currying types grow complex quickly
```

### 🌍 Real-Time Example

```typescript
// Extract event payload from a handler map
type HandlerMap = {
  save: (doc: { id: string; body: string }) => void;
  delete: (id: string) => void;
};

type Payload<E extends keyof HandlerMap> = Parameters<HandlerMap[E]>[0];

type SavePayload = Payload<"save">; // { id: string; body: string }
```

### When `infer` does not match

If `T` cannot be matched against the `extends` pattern, the conditional uses the **false** branch. Extraction helpers often set that branch to `never` so invalid shapes do not silently pass through.

```typescript
type ElementOnly<T> = T extends readonly (infer U)[] ? U : never;

type Ok = ElementOnly<string[]>; // string
type No = ElementOnly<number>; // never
```

For utilities that should **echo** non-matching `T`, use a fallback such as `: T` (as `UnwrapPromise` does in the standard library style).

### Multiple `infer` bindings in one pattern

Several names may appear together as long as the compiler can solve them **uniquely** from `T`:

```typescript
type DescribeCallable<T> = T extends (...args: infer A) => infer R
  ? { params: A; return: R }
  : never;

type D = DescribeCallable<(a: string, b: number) => boolean>;
// { params: [a: string, b: number]; return: boolean }
```

### Chaining extractions

Build small aliases, then compose—easier to test and to read than one mega-conditional:

```typescript
type Fn = (x: string) => Promise<number>;
type Args<F> = F extends (...a: infer A) => unknown ? A : never;
type Ret<F> = F extends (...a: never) => infer R ? R : never;

type A = Args<Fn>; // [x: string]
type R = Ret<Fn>; // Promise<number>
```

---

## Best Practices

1. **Prefer standard utilities first** — `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `InstanceType` cover many cases before you write custom mapped or conditional types.
2. **Name intent, not mechanics** — Types like `PublicApiOf<T>` or `Serialized<T>` communicate purpose better than `Type1` / `HelperX`.
3. **Terminate recursion** — Always include **base cases** in recursive aliases; test with **deep** sample types to catch “type instantiation is excessively deep” errors early.
4. **Watch distributivity** — When you mean to check a **union as a whole**, wrap with tuples `[T]` or use a non-distributive pattern; when you mean to **map over unions**, keep `T` naked.
5. **Brands at boundaries** — Create branded types at **validation** boundaries (parsing, DB mapping), not at every internal variable, to avoid ergonomic cost.
6. **Predicates must be honest** — A type guard or assertion function should reflect a **real** runtime check; lying to the compiler converts type safety into footguns.
7. **Keep `infer` patterns readable** — Split complex extractions into **small** named conditional type aliases rather than one giant nested expression.
8. **Document type-level APIs** — Library-style conditional types deserve a one-line **TSDoc** describing constraints (`T extends ...`) and failure modes (`never`).

---

## Common Mistakes to Avoid

1. **Assuming conditional types run at runtime** — They only affect **compile-time** checking and editor tooling; emitted JavaScript is unchanged.
2. **Forgetting distribution** — `T extends X ? ...` distributes when `T` is a naked union; debugging “why did my union split” often ends here.
3. **Using `keyof` on primitives** — `keyof string` is not what most people expect; apply `keyof` to **object types** you control.
4. **Confusing JS `typeof` with TS `typeof`** — Runtime `typeof x === "object"` is unrelated to `type T = typeof x` in type space.
5. **Brands without validation** — Casting `as UserId` everywhere without checks gives **false confidence**; pair brands with **parsers** or **factories**.
6. **Over-deep mapped + conditional towers** — Combining many layers can hit **compiler limits** and slow `tsc`; simplify or truncate with interfaces at the leaf level.
7. **Assertion functions that do not throw** — If `asserts` is used but some paths **do not** narrow (or don’t throw), callers get incorrect assumptions.
8. **`infer` in the wrong branch** — `infer` only binds in the **`extends`** target; putting it in the wrong position yields `never` or unexpected errors.
9. **Indexed access on optional fields** — `T["maybe"]` includes `undefined` when the property is optional; use `-?` mapped modifiers or `Required<Pick<...>>` when you need stricter types.
10. **Ignoring `readonly` tuples** — `infer` with rest elements often requires `readonly` tuple patterns to match both mutable and readonly arrays consistently.

---

*This document is intended as a companion to earlier “Advanced Types” material and focuses on type-level programming patterns commonly used in application code, libraries, and framework typings.*
