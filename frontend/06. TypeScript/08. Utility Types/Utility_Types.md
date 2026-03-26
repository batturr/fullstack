# TypeScript Utility Types

**Utility types** are built-in or custom type-level functions that transform one type into another. They help you derive safer, DRY typings from existing models—without duplicating shapes by hand. TypeScript ships with a rich set of standard utilities (`Partial`, `Pick`, `Awaited`, and more); you can also compose **mapped types** and **conditional types** to build domain-specific helpers. This guide explains each major built-in utility, string and intrinsic manipulators, patterns for custom utilities, and how teams use them in APIs, forms, state, and configuration.

---

## 📑 Table of Contents

1. [Built-in Object-Related Utility Types](#1-built-in-object-related-utility-types)
2. [Built-in Union and Nullability Utilities](#2-built-in-union-and-nullability-utilities)
3. [Built-in Function, Class, and Context Utilities](#3-built-in-function-class-and-context-utilities)
4. [`Awaited<T>` (TypeScript 4.5+)](#4-awaitedt-typescript-45)
5. [String Manipulation Types](#5-string-manipulation-types)
6. [Intrinsic Types and `NoInfer<T>`](#6-intrinsic-types-and-noinfert)
7. [Creating Custom Utility Types](#7-creating-custom-utility-types)
8. [Utility Type Patterns](#8-utility-type-patterns)
9. [Use Cases: APIs, Forms, State, and Configuration](#9-use-cases-apis-forms-state-and-configuration)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
12. [Comparison Table](#comparison-table)

---

## 1. Built-in Object-Related Utility Types

These utilities reshape **object types**: optional vs required, readonly vs mutable, key picking/omitting, and string-keyed records.

### `Partial<T>`

Makes every property of `T` **optional**.

#### 🟢 Beginner Example
```typescript
type User = { id: number; name: string; email: string };

type UserPatch = Partial<User>;
// { id?: number; name?: string; email?: string }

const patch: UserPatch = { name: "New Name" };
```
#### 🟡 Intermediate Example
```typescript
function updateUser(id: number, changes: Partial<User>): User {
  return { id, name: "Default", email: "d@x.com", ...changes };
}
```
#### 🔴 Expert Example
```typescript
// Partial only affects top-level keys; nested objects stay as-is
type Nested = { a: { b: number } };
type P = Partial<Nested>; // { a?: { b: number } } — inner `b` still required if `a` is present
```
#### 🌍 Real-Time Example
```typescript
// PATCH body for a REST resource: only send fields that changed
type Article = { slug: string; title: string; body: string; published: boolean };
type ArticleUpdateBody = Partial<Pick<Article, "title" | "body" | "published">>;
```

### `Required<T>`

Makes every property of `T` **required** (strips `?`).

#### 🟢 Beginner Example
```typescript
type Draft = { title?: string; body?: string };
type Published = Required<Draft>;
// { title: string; body: string }
```
#### 🟡 Intermediate Example
```typescript
type AppConfig = { apiUrl?: string; timeoutMs?: number; retries?: number };
function assertComplete(cfg: Partial<AppConfig>): Required<AppConfig> {
  const { apiUrl, timeoutMs, retries } = cfg;
  if (!apiUrl || timeoutMs === undefined || retries === undefined) {
    throw new Error("Invalid config");
  }
  return { apiUrl, timeoutMs, retries };
}
```
#### 🔴 Expert Example
```typescript
type AppConfig = { apiUrl?: string; timeoutMs?: number; retries?: number };
type RuntimeConfig = Required<Pick<AppConfig, "apiUrl" | "timeoutMs">> &
  AppConfig;
```
#### 🌍 Real-Time Example
```typescript
// After hydration from env + defaults, server config must be fully specified
type EnvConfig = { DATABASE_URL?: string; PORT?: string };
type ResolvedEnv = Required<EnvConfig>;
```

### `Readonly<T>`

Makes every property **readonly** at the top level.

#### 🟢 Beginner Example
```typescript
type Point = { x: number; y: number };
type FrozenPoint = Readonly<Point>;

const p: FrozenPoint = { x: 0, y: 0 };
// p.x = 1; // Error
```
#### 🟡 Intermediate Example
```typescript
const ACTIONS = ["create", "update", "delete"] as const;
type Action = (typeof ACTIONS)[number];
type ReadonlyActions = Readonly<typeof ACTIONS>;
```
#### 🔴 Expert Example
```typescript
// Readonly is shallow; nested objects can still be mutated unless also Readonly
type Outer = Readonly<{ inner: { value: number } }>;
// outer.inner.value = 2; // still allowed unless DeepReadonly (custom)
```
#### 🌍 Real-Time Example
```typescript
// Redux-style: state snapshot passed to selectors is readonly
type AppState = Readonly<{
  user: { id: string } | null;
  theme: "light" | "dark";
}>;
```

### `Record<K, T>`

Constructs an object type with keys `K` and values `T`.

#### 🟢 Beginner Example
```typescript
type Role = "admin" | "member" | "guest";
type RoleLabel = Record<Role, string>;

const labels: RoleLabel = {
  admin: "Administrator",
  member: "Member",
  guest: "Guest",
};
```
#### 🟡 Intermediate Example
```typescript
type FeatureFlags = Record<string, boolean>;
const flags: FeatureFlags = { betaDashboard: true };
```
#### 🔴 Expert Example
```typescript
// Record with union keys from keyof another type
type HandlerMap = Record<keyof WindowEventMap, (ev: WindowEventMap[keyof WindowEventMap]) => void>;
```
#### 🌍 Real-Time Example
```typescript
// Per-locale message dictionary: keys are locale codes
type Locale = "en" | "es" | "fr";
type Messages = Record<Locale, { welcome: string }>;
```

### `Pick<T, K>`

Selects a **subset of keys** `K` from `T`.

#### 🟢 Beginner Example
```typescript
type User = { id: number; name: string; email: string; passwordHash: string };
type PublicUser = Pick<User, "id" | "name" | "email">;
```
#### 🟡 Intermediate Example
```typescript
type Row = Pick<User, "id" | "email">;
function toRow(u: User): Row {
  return { id: u.id, email: u.email };
}
```
#### 🔴 Expert Example
```typescript
type Keys = "a" | "b";
type Obj = { a: number; b: string; c: boolean };
type Sub = Pick<Obj, Keys>; // { a: number; b: string }
```
#### 🌍 Real-Time Example
```typescript
// GraphQL-style projection: entity → client DTO
type UserEntity = { id: string; name: string; email: string; internalNote: string };
type UserForClient = Pick<UserEntity, "id" | "name" | "email">;
```

### `Omit<T, K>`

**Removes** keys `K` from `T` (opposite of Pick for exclusion lists).

#### 🟢 Beginner Example
```typescript
type User = { id: number; name: string; passwordHash: string };
type SafeUser = Omit<User, "passwordHash">;
```
#### 🟡 Intermediate Example
```typescript
type CreateUserInput = Omit<User, "id">;
type WithoutSecrets = Omit<User, "passwordHash" | "recoveryCodes">;
```
#### 🔴 Expert Example
```typescript
// Omit is Pick + Exclude at the type level
type OmitAlt<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Same = OmitAlt<User, "passwordHash">;
```
#### 🌍 Real-Time Example
```typescript
type Session = { id: string };
type DbUser = User & { passwordHash: string; sessions: Session[] };
type UserDto = Omit<DbUser, "passwordHash" | "sessions">;
```

---

## 2. Built-in Union and Nullability Utilities

### `Exclude<T, U>`

Removes from union `T` any member assignable to `U`.

#### 🟢 Beginner Example
```typescript
type T = "a" | "b" | "c";
type WithoutA = Exclude<T, "a">; // "b" | "c"
```
#### 🟡 Intermediate Example
```typescript
type All = string | number | boolean;
type NoBool = Exclude<All, boolean>; // string | number
```
#### 🔴 Expert Example
```typescript
// Exclude literal unions from a wider union
type Status = "idle" | "loading" | "success" | "error";
type Terminal = Exclude<Status, "idle" | "loading">; // "success" | "error"
```
#### 🌍 Real-Time Example
```typescript
// Event names: remove internal-only events from public API
type InternalEvent = "debug:ping" | "user:login" | "user:logout";
type PublicEvent = Exclude<InternalEvent, `debug:${string}`>;
```

### `Extract<T, U>`

Keeps only members of `T` that are assignable to `U`.

#### 🟢 Beginner Example
```typescript
type T = "a" | "b" | 1;
type OnlyStrings = Extract<T, string>; // "a" | "b"
```
#### 🟡 Intermediate Example
```typescript
type Mixed = { type: "a"; x: number } | { type: "b"; y: string } | string;
type ObjMembers = Extract<Mixed, { type: string }>;
```
#### 🔴 Expert Example
```typescript
// Extract function types from a union
type Handlers = (() => void) | string | ((n: number) => number);
type Fn = Extract<Handlers, (...args: any) => any>;
```
#### 🌍 Real-Time Example
```typescript
// From a union of message types, keep only those with payload
type Msg =
  | { kind: "ping" }
  | { kind: "data"; payload: Uint8Array }
  | { kind: "err"; code: number };
type WithPayload = Extract<Msg, { payload: unknown }>;
```

### `NonNullable<T>`

Removes `null` and `undefined` from `T`.

#### 🟢 Beginner Example
```typescript
type MaybeId = string | null | undefined;
type Id = NonNullable<MaybeId>; // string
```
#### 🟡 Intermediate Example
```typescript
function isDefined<T>(x: T): x is NonNullable<T> {
  return x !== null && x !== undefined;
}
```
#### 🔴 Expert Example
```typescript
// Distribute over unions
type U = string | null | number | undefined;
type V = NonNullable<U>; // string | number
```
#### 🌍 Real-Time Example
```typescript
// After optional chaining in strict mode, narrow DB row fields
type Row = { deletedAt: string | null };
type ActiveRow = Row & { deletedAt: NonNullable<Row["deletedAt"]> };
```

---

## 3. Built-in Function, Class, and Context Utilities

### `ReturnType<T>`

Infers the **return type** of a function type `T`.

#### 🟢 Beginner Example
```typescript
function makeId() {
  return crypto.randomUUID();
}
type Id = ReturnType<typeof makeId>; // string
```
#### 🟡 Intermediate Example
```typescript
type FetchUser = () => Promise<{ id: string }>;
type UserPromise = ReturnType<FetchUser>; // Promise<{ id: string }>
```
#### 🔴 Expert Example
```typescript
// Overloads: ReturnType uses the last overload’s return type (implementation not used for inference)
function f(x: number): string;
function f(x: string): number;
function f(x: number | string): string | number {
  return typeof x === "number" ? String(x) : x.length;
}
type R = ReturnType<typeof f>; // number (last overload)
```
#### 🌍 Real-Time Example
```typescript
// Mirror a library function’s return type without importing its types
declare const api: { listOrders(): Promise<{ id: string }[]> };
type Orders = Awaited<ReturnType<typeof api.listOrders>>;
```

### `Parameters<T>`

Tuple of **parameter types** for a function type `T`.

#### 🟢 Beginner Example
```typescript
function greet(name: string, age: number) {
  return `${name} (${age})`;
}
type GreetArgs = Parameters<typeof greet>; // [name: string, age: number]
```
#### 🟡 Intermediate Example
```typescript
type LogFn = (level: "info" | "error", msg: string, meta?: object) => void;
type FirstArg = Parameters<LogFn>[0]; // "info" | "error"
```
#### 🔴 Expert Example
```typescript
// Wrap an existing function preserving args
function wrap<A extends any[], R>(fn: (...args: A) => R) {
  return (...args: A): R => {
    console.log("call");
    return fn(...args);
  };
}
```
#### 🌍 Real-Time Example
```typescript
// Event emitter: restrict listener to same args as source method
type Emit = (event: "save", payload: { id: string }) => void;
type SavePayload = Parameters<Emit>[1];
```

### `ConstructorParameters<T>`

Like `Parameters`, but for **constructor** signatures (instance types use `InstanceType`).

#### 🟢 Beginner Example
```typescript
class Point {
  constructor(public x: number, public y: number) {}
}
type PointCtorArgs = ConstructorParameters<typeof Point>; // [x: number, y: number]
```
#### 🟡 Intermediate Example
```typescript
declare class Logger {
  constructor(prefix: string, opts?: { json: boolean });
}
type LoggerOpts = ConstructorParameters<typeof Logger>[1];
```
#### 🔴 Expert Example
```typescript
// Factory from class
function create<T extends new (...args: any) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args);
}
```
#### 🌍 Real-Time Example
```typescript
declare class DatabaseClient {
  constructor(connectionString: string, poolSize?: number);
}
type ServiceMap = { db: typeof DatabaseClient };
type DbArgs = ConstructorParameters<ServiceMap["db"]>;
```

### `InstanceType<T>`

The **instance type** of a constructor type `T`.

#### 🟢 Beginner Example
```typescript
class Box<T> {
  constructor(public value: T) {}
}
// `InstanceType<typeof Box>` erases the generic; use a concrete subclass or interface for precise `T`
type AnyBox = InstanceType<typeof Box>;
```
#### 🟡 Intermediate Example
```typescript
type Ctor = new (x: number) => { readonly n: number };
type Inst = InstanceType<Ctor>; // { readonly n: number }
```
#### 🔴 Expert Example
```typescript
// Map constructors to instances
type Ctors = [typeof Date, typeof RegExp];
type Instances = { [K in keyof Ctors]: InstanceType<Ctors[K]> };
```
#### 🌍 Real-Time Example
```typescript
interface PluginApi {
  log(msg: string): void;
}
declare class Plugin {
  constructor(api: PluginApi);
}
type PluginInstance = InstanceType<typeof Plugin>;
```

### `ThisType<T>`

Marker in **object literals** to contextualize `this` (no runtime effect).

#### 🟢 Beginner Example
```typescript
type Logger = {
  prefix: string;
  log(this: Logger, msg: string): void;
};

const logger: Logger = {
  prefix: "[app]",
  log(msg) {
    console.log(this.prefix, msg);
  },
};
```
#### 🟡 Intermediate Example
```typescript
// ThisType in an object type literal for mixin-style config
type Methods<T> = {
  [K in keyof T]: (this: T & Methods<T>, ...args: any[]) => any;
};
```
#### 🔴 Expert Example
```typescript
// `ThisType` is often paired with generic options objects (e.g. framework-style `methods`)
type Opts<M> = M & ThisType<{ count: number } & M>;
```
#### 🌍 Real-Time Example
```typescript
// Framework-style options object where handlers need typed `this`
type ViewModel = { count: number; inc(): void };
const vm: ViewModel & ThisType<ViewModel> = {
  count: 0,
  inc() {
    this.count += 1;
  },
};
```

---

## 4. `Awaited<T>` (TypeScript 4.5+)

Recursively unwraps **Promise-like** types (thenables) in `T`, matching `await` behavior.

### 🟢 Beginner Example
```typescript
type A = Awaited<Promise<string>>; // string
type B = Awaited<number>; // number (non-Promise passes through)
```

### 🟡 Intermediate Example
```typescript
type Nested = Awaited<Promise<Promise<boolean>>>; // boolean
```

### 🔴 Expert Example
```typescript
// With union: Awaited distributes over union members
type U = Awaited<Promise<string> | number>; // string | number
```

### 🌍 Real-Time Example
```typescript
async function loadUser() {
  return { id: "u1", name: "Ada" };
}
type User = Awaited<ReturnType<typeof loadUser>>;
```

---

## 5. String Manipulation Types

TypeScript provides **intrinsic string** utilities for template types: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. They operate on **literal string types** and are evaluated by the compiler.

### Overview with progressive depth

#### 🟢 Beginner Example
```typescript
type S = "hello";
type U = Uppercase<S>; // "HELLO"
type L = Lowercase<"WORLD">; // "world"
type C = Capitalize<"userName">; // "UserName"
type X = Uncapitalize<"UserName">; // "userName"
```
#### 🟡 Intermediate Example
```typescript
type EventName = "userCreated" | "userDeleted";
type Prefixed = `on${Capitalize<EventName>}`; // "onUserCreated" | "onUserDeleted"
```
#### 🔴 Expert Example
```typescript
type CamelFromKebab<S extends string> = S extends `${infer H}-${infer T}`
  ? `${H}${Capitalize<CamelFromKebab<T>>}`
  : S;
type Test = CamelFromKebab<"font-size">; // "fontSize"
```
#### 🌍 Real-Time Example
```typescript
// HTTP header normalization: build allowed header keys
type Header = "content-type" | "authorization";
type Canonical = Uppercase<Header>; // "CONTENT-TYPE" | "AUTHORIZATION"
```

---

## 6. Intrinsic Types and `NoInfer<T>` (TypeScript 5.4+)

**Intrinsics** are special type operators implemented inside the TypeScript compiler (not userland mapped types). Examples include `Uppercase<S>`, `Lowercase<S>`, `Capitalize<S>`, `Uncapitalize<S>`, and **`NoInfer<T>`**.

`NoInfer<T>` **blocks inference** from a position: when TypeScript would otherwise infer a type argument from that parameter, `NoInfer` keeps the default or explicit type parameter instead.

### 🟢 Beginner Example
```typescript
// Without NoInfer, inference might widen unexpectedly in generic APIs
declare function choose<T>(a: T, b: NoInfer<T>): T;
const x = choose("a" as const, "b"); // T inferred from first arg; second checked against it
```

### 🟡 Intermediate Example
```typescript
// Prefer default generic when second argument should not drive inference
function createStore<TState>(
  initial: TState,
  reducer: (s: NoInfer<TState>, a: unknown) => TState
) {
  let state = initial;
  return {
    dispatch(a: unknown) {
      state = reducer(state, a);
      return state;
    },
  };
}
```

### 🔴 Expert Example
```typescript
// Library pattern: user passes a literal, options object must match literal union but not widen T
declare function route<T extends string>(
  path: T,
  handler: (params: Record<NoInfer<T>, string>) => void
): void;
```

### 🌍 Real-Time Example
```typescript
// Form: field name union from schema; validator map keys must match but inference from validators alone shouldn't pick T
type Field = "email" | "password";
type Validators = { [K in Field]: (v: string) => boolean };
declare function useForm<T extends Field>(
  fields: T[],
  v: { [K in NoInfer<T>]: (value: string) => boolean }
): void;
```

---

## 7. Creating Custom Utility Types

Custom utilities combine **mapped types** (`[K in keyof T]`), **key remapping** (`as`), **indexed access** (`T[K]`), and **conditional types** (`T extends U ? X : Y`).

### Mapped types and conditional types (basics)

Mapped types iterate `keyof T` to produce a new object shape; **conditional types** (`T extends U ? X : Y`) filter and infer types. Together they power most custom utilities.

#### 🟢 Beginner Example
```typescript
type Optionalize<T> = { [K in keyof T]?: T[K] }; // like Partial<T>
type IsString<T> = T extends string ? true : false;
```
#### 🟡 Intermediate Example
```typescript
type NullableProps<T> = { [K in keyof T]: T[K] | null };
type ArrayElem<T> = T extends ReadonlyArray<infer U> ? U : never;
```
#### 🔴 Expert Example
```typescript
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};
type ToPromise<T> = T extends any ? Promise<T> : never;
```
#### 🌍 Real-Time Example
```typescript
type DataOnly<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
type ApiError = { status: 404 } | { status: 500; traceId: string };
type ErrorStatus = ApiError extends { status: infer S } ? S : never;
```

### `DeepPartial<T>`

Recursively makes all properties optional. Naive definitions recurse into any `object` (including arrays); libraries often add branches for arrays, `Date`, `Map`, etc.

#### 🟢 Beginner Example
```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```
#### 🟡 Intermediate Example
```typescript
type Config = { db: { host: string; port: number }; features: { x: boolean } };
type Patch = DeepPartial<Config>;
```
#### 🔴 Expert Example
```typescript
type DeepPartialArrays<T> = T extends readonly (infer U)[]
  ? readonly DeepPartialArrays<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartialArrays<T[K]> }
    : T;
```
#### 🌍 Real-Time Example
```typescript
type Document = { meta: { title: string; tags: string[] }; body: string };
type MergePatch = DeepPartial<Document>;
```

### `DeepReadonly<T>`

Recursively marks properties readonly.

#### 🟢 Beginner Example
```typescript
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
```
#### 🟡 Intermediate Example
```typescript
type State = { user: { name: string }; ids: number[] };
type Immutable = DeepReadonly<State>;
```
#### 🔴 Expert Example
```typescript
// Skip functions
type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;
```
#### 🌍 Real-Time Example
```typescript
// Freeze-like typing for config trees loaded at startup
type AppConfig = DeepReadonly<{ api: { baseUrl: string } }>;
```

### `Mutable<T>`

Strips `readonly` from properties (inverse of `Readonly` at one level; deep variant possible).

#### 🟢 Beginner Example
```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
```
#### 🟡 Intermediate Example
```typescript
type RO = Readonly<{ x: number; y: number }>;
type M = Mutable<RO>; // { x: number; y: number }
```
#### 🔴 Expert Example
```typescript
type DeepMutable<T> = T extends readonly (infer U)[]
  ? DeepMutable<U>[]
  : T extends object
    ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
    : T;
```
#### 🌍 Real-Time Example
```typescript
type ComplexShape = { items: readonly string[] };
type Draft = Mutable<Readonly<ComplexShape>>;
```

### `Optional<T, K>`

Makes selected keys optional.

#### 🟢 Beginner Example
```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```
#### 🟡 Intermediate Example
```typescript
type User = { id: string; name: string; email: string };
type UserCreate = Optional<User, "id">;
```
#### 🔴 Expert Example
```typescript
// Same shape as `Optional<T, K>` when `K` is a union of keys
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```
#### 🌍 Real-Time Example
```typescript
type Article = { id: string; title: string; body: string };
type Body = Optional<Pick<Article, "title" | "body">, "title" | "body">;
```

### `Nullable<T>`

Maps all properties to `T[K] | null`.

#### 🟢 Beginner Example
```typescript
type Nullable<T> = { [K in keyof T]: T[K] | null };
```
#### 🟡 Intermediate Example
```typescript
type Row = Nullable<{ name: string; age: number }>;
```
#### 🔴 Expert Example
```typescript
type NullableDeep<T> = {
  [K in keyof T]: T[K] extends object ? NullableDeep<T[K]> | null : T[K] | null;
};
```
#### 🌍 Real-Time Example
```typescript
// GraphQL nullable fields vs optional: explicit null in schema
type GqlUser = Nullable<{ bio: string; avatarUrl: string }>;
```

### `NonNullableKeys<T>`

Keys whose values are not `null | undefined`.

#### 🟢 Beginner Example
```typescript
type NonNullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? never : undefined extends T[K] ? never : K;
}[keyof T];
```
#### 🟡 Intermediate Example
```typescript
type M = { a: string; b: string | null; c?: number };
type Req = NonNullableKeys<M>; // "a"
```
#### 🔴 Expert Example
```typescript
// Optional keys: `c?` includes undefined — refine with `-?` helper
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
```
#### 🌍 Real-Time Example
```typescript
// Validate only columns that must be present in CSV import
type ImportRow = { sku: string; title?: string; price: number | null };
type MustFill = NonNullableKeys<Pick<ImportRow, "sku" | "price">>;
```

### `PromiseType<T>` (legacy name pattern)

Alias for **`Awaited<T>`** in modern TypeScript; use `Awaited` in new code.

#### 🟢 Beginner Example
```typescript
type PromiseType<T> = Awaited<T>;
type P = PromiseType<Promise<{ ok: true }>>; // { ok: true }
```
#### 🟡 Intermediate Example
```typescript
// Pre-4.5 style thenable unwrap (prefer Awaited today)
type ThenArg<T> = T extends { then(onfulfilled: (value: infer V) => any): any } ? V : T;
```
#### 🔴 Expert Example
```typescript
declare function fetchProfile(): Promise<{ id: string }>;
type ResolvedProfile = Awaited<ReturnType<typeof fetchProfile>>;
```
#### 🌍 Real-Time Example
```typescript
declare const client: { fetchProfile(): Promise<{ id: string }> };
type User = Awaited<ReturnType<typeof client.fetchProfile>>;
```

### `UnionToIntersection<T>`

Converts a union to an intersection (advanced; uses conditional inference).

#### 🟢 Beginner Example
```typescript
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
```
#### 🟡 Intermediate Example
```typescript
type A = { a: string };
type B = { b: number };
type AB = UnionToIntersection<A | B>; // { a: string } & { b: number }
```
#### 🔴 Expert Example
```typescript
type PluginApis = { log: (m: string) => void } | { metrics: () => void };
type Combined = UnionToIntersection<PluginApis>;
```
#### 🌍 Real-Time Example
```typescript
// Merge fragments defined separately (each file exports a partial shape)
type DbFragment = { database: { url: string } };
type CacheFragment = { cache: { ttlMs: number } };
type Parts = DbFragment | CacheFragment;
type MergedConfig = UnionToIntersection<Parts>;
```

### `Flatten<T>` (array union flattening)

#### 🟢 Beginner Example
```typescript
type Flatten<T extends any[]> = T[number];
type E = Flatten<[1, 2, 3]>; // 1 | 2 | 3
```
#### 🟡 Intermediate Example
```typescript
type TupleValues<T> = T extends readonly (infer U)[] ? U : never;
```
#### 🔴 Expert Example
```typescript
type FlattenOnce<T> = T extends (infer U)[]
  ? U extends any[]
    ? FlattenOnce<U>
    : U
  : T;
```
#### 🌍 Real-Time Example
```typescript
type Menu = readonly ["Home", "Settings", "Billing"];
type MenuItem = Flatten<Menu>; // "Home" | "Settings" | "Billing"
```

---

## 8. Utility Type Patterns

### Combining utilities

#### 🟢 Beginner Example
```typescript
type Update<T> = Partial<Pick<T, "name" | "email">> & Pick<T, "id">;
```
#### 🟡 Intermediate Example
```typescript
type Public<T> = Readonly<Pick<T, keyof T extends `_${string}` ? never : keyof T>>;
```
#### 🔴 Expert Example
```typescript
type Brand<T, B> = T & { readonly __brand: B };
type Money = Brand<number, "Money">;
```
#### 🌍 Real-Time Example
```typescript
type ApiListResponse<T> = Readonly<{
  items: ReadonlyArray<T>;
  nextCursor: string | null;
}>;
```

### Chaining

#### 🟢 Beginner Example
```typescript
type User = { id: number; name: string; email: string };
type T1 = Pick<User, "id" | "name">;
type T2 = Readonly<Partial<T1>>;
```
#### 🟡 Intermediate Example
```typescript
type Strict<T> = Required<Readonly<T>>;
```
#### 🔴 Expert Example
```typescript
type User = { id: number; name: string; email: string };
type Step = Readonly<Required<Partial<User>>>;
```
#### 🌍 Real-Time Example
```typescript
declare function toDto(raw: unknown): Promise<{ id: string; internal: string }>;
type Dto = Readonly<Omit<Awaited<ReturnType<typeof toDto>>, "internal">>;
```

### Nesting

#### 🟢 Beginner Example
```typescript
type NestedPartial = Partial<{ user: { name: string } }>; // shallow on `user`
```
#### 🟡 Intermediate Example
```typescript
type NP = DeepPartial<{ user: { name: string } }>;
```
#### 🔴 Expert Example
```typescript
type DeepPick<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? { [Q in K]: DeepPick<T[K], R> }
    : never
  : P extends keyof T
    ? Pick<T, P>
    : never;
```
#### 🌍 Real-Time Example
```typescript
// Feature flags nested per environment
type Flags = DeepReadonly<{ prod: { billing: boolean }; dev: { billing: boolean } }>;
```

### Conditional utility types

#### 🟢 Beginner Example
```typescript
type ApiResult<T> = T extends string ? { id: T } : { data: T };
```
#### 🟡 Intermediate Example
```typescript
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
```
#### 🔴 Expert Example
```typescript
type Arg0<F> = F extends (a0: infer A, ...args: any[]) => any ? A : never;
```
#### 🌍 Real-Time Example
```typescript
type CacheKey<T> = T extends { id: infer I } ? `entity:${I & string}` : string;
```

---

## 9. Use Cases: APIs, Forms, State, and Configuration

### API response typing

#### 🟢 Beginner Example
```typescript
type UserJson = { id: string; name: string };
type ListUsersResponse = Readonly<{ users: UserJson[] }>;
```
#### 🟡 Intermediate Example
```typescript
type Product = { id: string; title: string; sku: string };
type Paginated<T> = {
  data: T[];
  page: number;
  total: number;
};
type ProductPage = Paginated<Pick<Product, "id" | "title">>;
```
#### 🔴 Expert Example
```typescript
type User = { id: string; name: string };
type OperationMap = {
  getUser: { params: { id: string }; response: User };
  listUsers: { params: void; response: User[] };
};
type ResponseFor<K extends keyof OperationMap> = OperationMap[K]["response"];
```
#### 🌍 Real-Time Example
```typescript
type User = { id: string; name: string };
type OperationMap = {
  getUser: { params: { id: string }; response: User };
  listUsers: { params: void; response: User[] };
};
declare function typedFetch<K extends keyof OperationMap>(
  op: K,
  params: OperationMap[K]["params"]
): Promise<Awaited<OperationMap[K]["response"]>>;
```

### Form data typing

#### 🟢 Beginner Example
```typescript
type FormValues = { email: string; password: string };
type FormErrors = Partial<Record<keyof FormValues, string>>;
```
#### 🟡 Intermediate Example
```typescript
type Touched = Partial<Record<keyof FormValues, boolean>>;
type SubmitPayload = Required<Pick<FormValues, "email" | "password">>;
```
#### 🔴 Expert Example
```typescript
type FieldState<V> = { value: V; error: string | null; touched: boolean };
type FormState<T> = { [K in keyof T]: FieldState<T[K]> };
```
#### 🌍 Real-Time Example
```typescript
type Signup = { email: string; password: string; confirm: string };
type WizardStep1 = Pick<Signup, "email">;
type WizardStep2 = Pick<Signup, "password" | "confirm">;
type WizardData = Partial<Signup> & Required<Pick<Signup, "email">>;
```

### State management typing

#### 🟢 Beginner Example
```typescript
type State = { count: number };
type Action = { type: "inc" } | { type: "set"; value: number };
type Reducer = (s: State, a: Action) => State;
```
#### 🟡 Intermediate Example
```typescript
type Selector<R> = (s: Readonly<State>) => R;
type Dispatch = (a: Action) => void;
```
#### 🔴 Expert Example
```typescript
type Slice<S, A> = {
  initial: S;
  reducers: { [K in keyof S]?: (s: S, a: A) => S };
};
```
#### 🌍 Real-Time Example
```typescript
type ComplexState = { cart: readonly string[]; userId: string | null };
type Undoable<T> = { past: readonly T[]; present: T; future: readonly T[] };
type AppUndo = Undoable<Readonly<ComplexState>>;
```

### Configuration objects

#### 🟢 Beginner Example
```typescript
type Config = Readonly<{ apiUrl: string; env: "dev" | "prod" }>;
```
#### 🟡 Intermediate Example
```typescript
type EnvSource = { apiUrl?: string; env?: string };
type Resolved = Required<{ apiUrl: string; env: "dev" | "prod" }>;
```
#### 🔴 Expert Example
```typescript
type DefineConfig<T extends Record<string, unknown>> = T & {
  readonly __validated: true;
};
```
#### 🌍 Real-Time Example
```typescript
// Merge default config with partial file overrides
type Defaults = { logLevel: "info" | "debug"; port: number };
type FileOverrides = DeepPartial<Defaults>;
type Merged = Defaults & FileOverrides; // still need runtime merge for deep
```

---

## Best Practices

1. **Prefer built-ins first** — `Partial`, `Pick`, `Omit`, `Awaited`, and `Readonly` cover most day-to-day cases; custom utilities should justify their complexity.
2. **Document recursive helpers** — `DeepPartial` and friends are easy to get wrong with arrays, tuples, Dates, and class instances; add comments or tests for edge cases.
3. **Keep inference predictable** — heavy conditional chains can slow the compiler; extract intermediate type aliases with meaningful names.
4. **Match runtime behavior** — types like `DeepReadonly` do not freeze objects at runtime; pair with `Object.freeze` or immutability libraries when needed.
5. **Use `satisfies` where appropriate** — alongside utilities, `satisfies` preserves literal types while checking shape (TypeScript 4.9+).
6. **Version-sensitive APIs** — `Awaited` and `NoInfer` require minimum TS versions; note this in shared library `peerDependencies`.
7. **Avoid leaking `any`** — when wrapping `Parameters`/`ReturnType`, constrain generics with `extends (...args: any) => any` thoughtfully.

---

## Common Mistakes to Avoid

1. **Assuming `Readonly` / `Partial` are deep** — they only affect the top level unless you use a custom recursive type.
2. **Confusing `Exclude` vs `Omit`** — `Exclude` works on **union members**; `Omit` removes **keys** from an object type.
3. **Overloading `ReturnType`** — with overloaded functions, `ReturnType` follows the **last overload** declaration, which may not match all branches.
4. **Distributive surprises** — bare `T extends X ? Y : Z` distributes over unions in `T`; use `[T] extends [X] ? Y : Z` to disable distribution when needed.
5. **Indexing with `keyof` on unions** — `keyof (A | B)` is only the **intersection** of keys; often you need `keyof (A & B)` or a different modeling approach.
6. **Infinite recursion** — poorly written recursive types can hit “type instantiation is excessively deep”; simplify or add base cases.
7. **String intrinsics on non-literals** — `Uppercase<string>` is just `string`; intrinsics shine with **template literal** and **const** patterns.

---

## Comparison Table

| Utility / pattern | Primary input | Primary output | Typical use |
|------------------|---------------|----------------|-------------|
| `Partial<T>` | Object `T` | All keys optional | PATCH bodies, drafts |
| `Required<T>` | Object `T` | All keys required | Post-validation / defaults |
| `Readonly<T>` | Object `T` | All keys readonly | Immutability, exposed state |
| `Record<K, T>` | Keys `K`, value `T` | Map-like object | Dictionaries, fixed key sets |
| `Pick<T, K>` | Object `T`, keys `K` | Subset of `T` | Projections, DTOs |
| `Omit<T, K>` | Object `T`, keys `K` | `T` without `K` | Strip secrets / relations |
| `Exclude<T, U>` | Union `T` | Union minus `U` members | Filter string unions |
| `Extract<T, U>` | Union `T` | Intersection with `U` | Narrow union members |
| `NonNullable<T>` | Type `T` | Without `null` / `undefined` | After guards, strict fields |
| `ReturnType<F>` | Function `F` | Return type | Mirror function outputs |
| `Parameters<F>` | Function `F` | Tuple of params | Wrappers, adapters |
| `ConstructorParameters<C>` | Constructor `C` | Tuple of ctor args | Factories, DI |
| `InstanceType<C>` | Constructor `C` | Instance type | Class-based plugins |
| `ThisType<T>` | `T` | Context for `this` | Options objects, mixins |
| `Awaited<T>` | Possibly Promise `T` | Unwrapped type | `async` / Promise chains |
| `Uppercase` / `Lowercase` / etc. | String literal | Transformed literal | Events, routes, CSS |
| `NoInfer<T>` | Any `T` | Blocks inference from slot | Generic API design |
| Mapped types | Object `T` | Transformed properties | Systematic key rewrites |
| Conditional types | `T`, condition | Branch types | Filtering, inference |
| `DeepPartial` / `DeepReadonly` | Nested `T` | Recursive variant | Documents, config trees |
| `UnionToIntersection<U>` | Union `U` | `A & B & ...` | Merge extension APIs |
