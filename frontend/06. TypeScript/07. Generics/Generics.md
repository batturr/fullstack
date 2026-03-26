# TypeScript Generics

**Generics** let you write reusable, type-safe APIs without giving up static checking: you parameterize types and functions over *type variables* (like `T`) so one implementation can work for many concrete types while preserving relationships between inputs and outputs. TypeScript erases generics at emit time, but the compiler uses them to catch mistakes early and to power inference, constraints, and advanced patterns like conditional types. This guide moves from everyday generic functions through constraints, interfaces and classes, collections, production patterns, variance, and the limits of higher-kinded types—with examples at beginner, intermediate, expert, and real-world levels.

---

## 📑 Table of Contents

1. [Generic Basics](#1-generic-basics)
2. [Generic Constraints](#2-generic-constraints)
3. [Generic Interfaces](#3-generic-interfaces)
4. [Generic Classes](#4-generic-classes)
5. [Generic Types](#5-generic-types)
6. [Generic Utility Patterns](#6-generic-utility-patterns)
7. [Advanced Concepts](#7-advanced-concepts)
8. [Best Practices](#8-best-practices)
9. [Generic Collections](#9-generic-collections)
10. [Higher-Kinded Types](#10-higher-kinded-types)
11. [Best Practices Checklist](#11-best-practices-checklist)
12. [Common Mistakes to Avoid](#12-common-mistakes-to-avoid)

## 1. Generic Basics

Generics answer: *how do I reuse one implementation while keeping precise types?* Without generics you either duplicate code or fall back to `any` / wide types and lose safety. A **generic function** declares one or more **type parameters** in angle brackets (`<T>`). The compiler often **infers** them from arguments; you can also pass them explicitly (`identity<number>(42)`). **Multiple type parameters** model relationships between several values (e.g. keys and values, or input and output types). Overloads explode combinatorially; `any` disables checking—generics keep one implementation and relate types.

### 🟢 Beginner Example

```typescript
// Generic function: T is a type variable
function identity<T>(value: T): T {
  return value;
}

const n = identity(42); // T inferred as number
const s = identity("hi"); // T inferred as string

// Explicit type argument (rarely needed when inference works)
const explicit = identity<number>(100);
```

### 🟡 Intermediate Example

```typescript
// Multiple type parameters
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const p = pair("x", 1); // [string, number]

// Generic inference from a tuple
function first<T extends readonly unknown[]>(arr: T): T[0] {
  return arr[0];
}

const f = first([1, 2, 3] as const); // literal 1
```

### 🔴 Expert Example

```typescript
// Inference with contextual typing and deferred inference
declare function createBox<T>(value: T): { value: T };

const box1 = createBox({ count: 1 }); // T = { count: number }

// Curried generic: sometimes you must annotate the first call
const makeParser =
  <T>() =>
  (raw: string): T =>
    JSON.parse(raw) as T;

const parseUser = makeParser<{ id: string }>();
const u = parseUser('{"id":"u1"}');
```

### 🌍 Real-Time Example

```typescript
// API client wrapper: response type tied to endpoint definition
type Endpoint = { path: string; response: unknown };

async function fetchJson<T extends Endpoint>(ep: T): Promise<T["response"]> {
  const res = await fetch(ep.path);
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as T["response"];
}

const userEp = { path: "/api/me", response: {} as { id: string; name: string } };
const me = await fetchJson(userEp); // { id: string; name: string }
```

## 2. Generic Constraints

Constraints narrow what a type parameter may be using **`extends`**: `T extends SomeType`. You can reference other type parameters in constraints (`T extends U`). For objects, **`keyof`** connects keys to values. **Conditional types** (see Section 7) express constraints that depend on relationships between types.

### `extends` constraint

### 🟢 Beginner Example

```typescript
function logLength<T extends { length: number }>(x: T): void {
  console.log(x.length);
}

logLength("abc");
logLength([1, 2, 3]);
// logLength(123); // Error: number has no 'length'
```

### 🟡 Intermediate Example

```typescript
// Constrain to object with an 'id' field
type HasId = { id: string };

function indexById<T extends HasId>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}
```

### 🔴 Expert Example

```typescript
// Type param used inside another constraint
function assertKeys<T, K extends keyof T>(obj: T, keys: readonly K[]): asserts obj is T {
  for (const k of keys) {
    if (!(k in obj)) throw new Error(`Missing key: ${String(k)}`);
  }
}
```

### 🌍 Real-Time Example

```typescript
// Only allow patching whitelisted keys of a domain entity
type Patch<T, K extends keyof T> = Pick<T, K> & Partial<Pick<T, K>>;

function applyPatch<T, K extends keyof T>(entity: T, patch: Patch<T, K>): T {
  return { ...entity, ...patch };
}

// applyPatch(user, { email: "new@b.com" }) → User
```

### Constraining to object properties, `keyof`, and conditional constraints

**`keyof` + `T[K]`** tie keys to value types. **Conditional constraints** use `T extends … ? … : …` (often with `infer`) so valid instantiations depend on structure.

### 🟢 Beginner Example

```typescript
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### 🟡 Intermediate Example

```typescript
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
function entries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}
```

### 🔴 Expert Example

```typescript
type NonNullableProps<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
};
type EnsureEntity<T> = T extends { id: unknown } ? T : never;
function save<T extends EnsureEntity<T>>(e: T): void {
  void e.id;
}
```

### 🌍 Real-Time Example

```typescript
function column<R extends Record<string, string | number>, K extends keyof R>(
  rows: R[],
  key: K
): R[K][] {
  return rows.map((r) => r[key]);
}

type ApiEnvelope<T> = T extends { data: infer D } ? D : T;
```

## 3. Generic Interfaces

**Generic interfaces** declare type parameters on the interface itself. Implementations (classes or object literals) must satisfy the interface for some choice of type arguments. **Generic index signatures** and mapped types often appear together with generic interfaces for dictionaries and plugin APIs.

### Declaration and usage

### 🟢 Beginner Example

```typescript
interface Box<T> {
  value: T;
}
const numBox: Box<number> = { value: 1 };
const strBox: Box<string> = { value: "hi" };
```

### 🟡 Intermediate Example

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}
interface User {
  id: string;
  name: string;
}
class UserRepository implements Repository<User> {
  async findById(_id: string): Promise<User | null> {
    return null;
  }
  async save(_entity: User): Promise<void> {}
}
```

### 🔴 Expert Example

```typescript
interface ReadonlySource<out T> {
  read(): T;
}
declare const src: ReadonlySource<string>;
const wide: ReadonlySource<string | number> = src;
```

### 🌍 Real-Time Example

```typescript
type AppEvents = { login: { userId: string }; logout: { reason?: string } };
interface EventEmitter<E extends Record<string, unknown>> {
  on<K extends keyof E>(name: K, fn: (payload: E[K]) => void): void;
  emit<K extends keyof E>(name: K, payload: E[K]): void;
}
```

### Generic index types (signatures and mapped keys)

### 🟢 Beginner Example

```typescript
interface Dict<T> {
  [key: string]: T | undefined;
}
const scores: Dict<number> = { alice: 10 };
```

### 🟡 Intermediate Example

```typescript
interface ReadonlyDict<K extends string | number, V> {
  readonly [P in K]?: V;
}
```

### 🔴 Expert Example

```typescript
declare const brand: unique symbol;
type UserId = string & { readonly [brand]: typeof brand };
interface UserCache<V> {
  [id: UserId]: V | undefined;
}
```

### 🌍 Real-Time Example

```typescript
interface Messages<T extends Record<string, string>> {
  en: T;
  es: T;
}
```

## 4. Generic Classes

**Generic classes** parameterize the instance shape. **Static members** cannot reference the class’s instance type parameters directly (each instance could have different `T`). Use static generics (`static fromJSON<T>(...)`) or outer type parameters on a namespace-like pattern when you need type-safe static factories.

### Declaration

### 🟢 Beginner Example

```typescript
class ValueCell<T> {
  constructor(private value: T) {}
  get(): T {
    return this.value;
  }
  set(next: T): void {
    this.value = next;
  }
}

const cell = new ValueCell(0);
cell.set(1);
```

### 🟡 Intermediate Example

```typescript
class Stack<T> {
  private items: T[] = [];
  push(x: T): void {
    this.items.push(x);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
}
class Codec {
  static parse<T>(raw: string, reviver?: (key: string, value: unknown) => unknown): T {
    return JSON.parse(raw, reviver) as T;
  }
}

const x = Codec.parse<{ ok: boolean }>('{"ok":true}');
```

### 🌍 Real-Time Example

```typescript
// Generic bounded context cache for any entity with id
class EntityCache<T extends { id: string }> {
  private map = new Map<string, T>();
  upsert(e: T): void {
    this.map.set(e.id, e);
  }
  get(id: string): T | undefined {
    return this.map.get(id);
  }
}
```

### Static members and constraints

Static members **cannot** use the class’s instance type parameters (`T` on `class Foo<T>`). Use **static generics** (`static parse<T>(...)`) or a **`Constructor<T>`**-style helper for factories. Plugins often use a class-level generic for **config** only on the instance side.

### 🟢 Beginner Example

```typescript
class Bad<T> {
  // static create(): T { return null as T; }
  // Error: static members cannot reference class type parameters
}
```

### 🟡 Intermediate Example

```typescript
class Factory {
  static create<T>(ctor: new () => T): T {
    return new ctor();
  }
}
```

### 🔴 Expert Example

```typescript
interface Constructor<T> {
  new (...args: never[]): T;
}
function register<T>(ctor: Constructor<T>, name: string): void {
  void ctor;
  void name;
}
```

### 🌍 Real-Time Example

```typescript
abstract class Plugin<C> {
  abstract readonly name: string;
  abstract activate(config: C): void;
}
class TelemetryPlugin extends Plugin<{ endpoint: string }> {
  readonly name = "telemetry";
  activate(config: { endpoint: string }): void {
    void config.endpoint;
  }
}
```

## 5. Generic Types

Beyond functions and classes, you can write **generic type aliases**, **generic object types**, **generic tuple/array types**, and **generic function types**. These compose with mapped types, conditional types, and utility types (`Partial`, `Pick`, etc.).

### Generic type aliases

### 🟢 Beginner Example

```typescript
type Nullable<T> = T | null | undefined;
type Point<T> = { x: T; y: T };
```

### 🟡 Intermediate Example

```typescript
type AsyncResult<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

### 🔴 Expert Example

```typescript
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
type ApiResponse<T> = { data: T; meta: { requestId: string; durationMs: number } };
```

### 🌍 Real-Time Example

```typescript
type ListEnvelope<T> = { items: T[]; total: number; nextOffset?: number };
```

### Generic object types

### 🟢 Beginner Example

```typescript
type RecordOf<K extends keyof any, V> = Record<K, V>;
type Merge<A, B> = Omit<A, keyof B> & B;
```

### 🟡 Intermediate Example

```typescript
type FormValues<T extends Record<string, unknown>> = { [K in keyof T]: T[K] | "" };
type FieldErrors<T> = Partial<{ [K in keyof T]: string[] }>;
```

### 🔴 Expert Example

```typescript
type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : P extends keyof T
    ? T[P]
    : never;
```

### 🌍 Real-Time Example

```typescript
type ColumnMap<T> = { [K in keyof T]: string };
```

### Generic array types

### 🟢 Beginner Example

```typescript
type NumArray = Array<number>;
type Pair<T> = [T, T];
```

### 🟡 Intermediate Example

```typescript
function tail<T>(xs: readonly T[]): T[] {
  return xs.slice(1);
}
type Page<T> = { items: T[]; nextCursor?: string };
```

### 🔴 Expert Example

```typescript
type TupleOf<T, N extends number, R extends T[] = []> = R["length"] extends N
  ? R
  : TupleOf<T, N, [...R, T]>;
```

### 🌍 Real-Time Example

```typescript
type OrderedQueue<T> = { priority: number; item: T }[];
```

### Generic function types

### 🟢 Beginner Example

```typescript
type Unary<T, R> = (x: T) => R;
type Mapper<T, U> = (item: T, index: number) => U;
```

### 🟡 Intermediate Example

```typescript
type EventHandler<E> = (event: E) => void;
```

### 🔴 Expert Example

```typescript
type Fn<A extends readonly unknown[], R> = (...args: A) => R;
type LastArg<F> = F extends (...args: infer A) => unknown
  ? A extends [...infer _, infer L]
    ? L
    : never
  : never;
```

### 🌍 Real-Time Example

```typescript
type AsyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;
```

## 6. Generic Utility Patterns

Common reusable shapes: **identity** (preserve type), **factories** (constructors + config), **repositories** (storage abstraction), **builders** (fluent configuration). Generics keep each pattern honest across entity types.

### Identity function pattern

### 🟢 Beginner Example

```typescript
const id = <T>(x: T) => x;
```

### 🟡 Intermediate Example

```typescript
const tuple = <T extends readonly unknown[]>(xs: T) => xs;
const t = tuple([1, "a"] as const);
```

### 🔴 Expert Example

```typescript
declare function createModel<T>(config: NoInfer<T>): T; // TS 5.4+: NoInfer
```

### 🌍 Real-Time Example

```typescript
// Pass through config object with exact literal types preserved
function defineConfig<T extends Record<string, unknown>>(c: T): T {
  return c;
}
```

### Factory pattern

### 🟢 Beginner Example

```typescript
function makeArray<T>(n: number, fill: T): T[] {
  return Array.from({ length: n }, () => fill);
}
```

### 🟡 Intermediate Example

```typescript
function withDeps<T extends { clock: () => Date }>(deps: T) {
  return { now: () => deps.clock() };
}
```

### 🔴 Expert Example

```typescript
type Class<T> = new (...args: never[]) => T;
function createPool<T>(Ctor: Class<T>, size: number): T[] {
  return Array.from({ length: size }, () => new Ctor());
}
```

### 🌍 Real-Time Example

```typescript
function createHttpClient<BasePath extends string>(base: BasePath) {
  return {
    get<Path extends string>(path: `${BasePath}${Path}`) {
      return fetch(path);
    },
  };
}
```

### Repository pattern

### 🟢 Beginner Example

```typescript
interface Repo<T> {
  all(): Promise<T[]>;
}
interface CrudRepository<T extends { id: string }> {
  find(id: string): Promise<T | null>;
  list(filter?: Partial<T>): Promise<T[]>;
  upsert(entity: T): Promise<void>;
  remove(id: string): Promise<void>;
}
```

### 🟡 Intermediate Example

```typescript
type OrderBy<T> = Partial<{ [K in keyof T]: "asc" | "desc" }>;
interface Queryable<T> {
  findMany(opts: { where?: Partial<T>; orderBy?: OrderBy<T>; take?: number }): Promise<T[]>;
}
```

### 🔴 Expert Example

```typescript
interface Mapper<D, R> {
  toDomain(row: R): D;
  toRow(domain: D): R;
}
```

### 🌍 Real-Time Example

```typescript
class SqlRepository<D extends { id: string }, R> {
  constructor(private m: Mapper<D, R>) {}
  async byId(id: string): Promise<D | null> {
    const row = null as R | null;
    return row ? this.m.toDomain(row) : null;
  }
}
```

### Builder pattern

### 🟢 Beginner Example

```typescript
class QueryBuilder<T extends Record<string, unknown>> {
  private state: Partial<T> = {};
  set<K extends keyof T>(k: K, v: T[K]): this {
    this.state[k] = v;
    return this;
  }
  build(): Partial<T> {
    return { ...this.state };
  }
}
```

### 🟡 Intermediate Example

```typescript
type Built<B> = B extends { build(): infer R } ? R : never;
function build<B extends { build(): unknown }>(b: B): Built<B> {
  return b.build() as Built<B>;
}
```

### 🔴 Expert Example

```typescript
class ReportBuilder<T extends Record<string, unknown>> {
  private rows: Partial<T>[] = [];
  addRow(row: Partial<T>): this {
    this.rows.push(row);
    return this;
  }
  build(): Partial<T>[] {
    return this.rows;
  }
}
```

### 🌍 Real-Time Example

```typescript
class UpdateBuilder<T extends object> {
  private sets = {} as Partial<T>;
  set<K extends keyof T>(k: K, v: T[K]): this {
    this.sets[k] = v;
    return this;
  }
}
```

## 7. Advanced Concepts

This section covers **default type parameters**, **constraints with conditional types**, **variance** (covariance and contravariance), **generic type guards**, and **generic `this` types** for fluent APIs.

### Default type parameters

### 🟢 Beginner Example

```typescript
interface HttpResult<T = unknown, E = string> {
  data?: T;
  error?: E;
}
```

### 🟡 Intermediate Example

```typescript
type EventName<E extends { type: string } = { type: string }> = E["type"];
```

### 🔴 Expert Example

```typescript
type Flatten<T> = T extends readonly (infer U)[] ? U : T;
```

### 🌍 Real-Time Example

```typescript
type Paginated<T, M = Record<string, unknown>> = {
  items: T[];
  meta: M & { page: number; pageSize: number };
};
```

### Constraints with conditional types

### 🟢 Beginner Example

```typescript
type IsString<T> = T extends string ? true : false;
```

### 🟡 Intermediate Example

```typescript
type ExtractIds<T> = T extends { id: infer I } ? I : never;
```

### 🔴 Expert Example

```typescript
type Callable<T> = T extends (...args: infer A) => infer R ? [A, R] : never;
```

### 🌍 Real-Time Example

```typescript
type DTO<T> = T extends Date ? string : T extends bigint ? string : T;

type ToJson<T> = { [K in keyof T]: DTO<T[K]> };
```

### Variance (`out` / `in`)

Read-only positions are often **covariant** in `T`; function parameters are **contravariant** in their parameter types. TypeScript historically was **unsound** in some places; **variance annotations** on type parameters help library authors document intent.

### 🟢 Beginner Example

```typescript
const nums: number[] = [1];
const numsOrStrings: (number | string)[] = nums; // historically allowed; prefer readonly for reads
```

### 🟡 Intermediate Example

```typescript
type Producer<T> = () => T;
declare let pStr: Producer<string>;
declare let pStrOrNum: Producer<string | number>;
pStrOrNum = pStr; // return position: covariant
```

### 🔴 Expert Example

```typescript
interface Source<out T> {
  get(): T;
}
interface Sink<in T> {
  put(value: T): void;
}
```

### 🌍 Real-Time Example

```typescript
interface ReadonlyStore<out T> {
  snapshot(): T;
}
```

### Generic type guards

### 🟢 Beginner Example

```typescript
function isString(x: unknown): x is string {
  return typeof x === "string";
}
```

### 🟡 Intermediate Example

```typescript
function isNonNull<T>(x: T | null | undefined): x is T {
  return x != null;
}
```

### 🔴 Expert Example

```typescript
function isOfShape<T extends Record<string, unknown>, K extends keyof T>(x: unknown, keys: readonly K[]): x is Pick<T, K> & Record<string, unknown> {
  return typeof x === "object" && x !== null && keys.every((k) => k in x);
}
```

### 🌍 Real-Time Example

```typescript
interface ApiErrorBody { code: string; message: string }
function isApiError(x: unknown): x is ApiErrorBody {
  return typeof x === "object" && x !== null && "code" in x && "message" in x && typeof (x as ApiErrorBody).code === "string";
}
```

### Generic `this` types

### 🟢 Beginner Example

```typescript
class Counter {
  private n = 0;
  inc(): this {
    this.n++;
    return this;
  }
}
```

### 🟡 Intermediate Example

```typescript
class Box<T> {
  constructor(private v: T) {}
  map<U>(f: (x: T) => U): Box<U> {
    return new Box(f(this.v));
  }
}
```

### 🔴 Expert Example

```typescript
interface Chainable<T> {
  tap(fn: (x: T) => void): this;
}
class Impl implements Chainable<number> {
  constructor(private x: number) {}
  tap(fn: (x: number) => void): this {
    fn(this.x);
    return this;
  }
}
```

### 🌍 Real-Time Example

```typescript
class SqlSelect<TTable extends string, TCol extends string> {
  constructor(private table: TTable, private cols: TCol[]) {}
  where(_clause: string): this {
    return this;
  }
  build(): string {
    return `SELECT ${this.cols.join(", ")} FROM ${this.table}`;
  }
}
```

## 8. Best Practices

Use generics when the **same logic** applies to **many types** and you need to **preserve** or **relate** those types. Prefer **concrete** types when there is only one use. **Name** type parameters consistently: `T` for a single arbitrary type, `K`/`V` for keys/values, `E` for errors or elements, `R` for results. **Push type parameters down** to the narrowest scope (prefer a generic function over a generic module). **Use fewer parameters**: if `T` can be inferred from `U`, drop `T`. The heuristic **“type parameters should appear twice”** means a bare `T` that only appears once in the signature often adds noise (exceptions exist for documentation/branding). **Avoid over-generic** APIs that force callers to think in types. **Constrain early** with `extends` so error messages stay local.

### 🟢 Beginner Example

```typescript
// Good: T appears in arg and return
function first<T>(xs: T[]): T | undefined {
  return xs[0];
}

// Often unnecessary: explicit T when inference suffices
const x = first<number>([1, 2, 3]);
```

### 🟡 Intermediate Example

```typescript
// Push generic to function, not outer file
export function sortBy<T, K extends keyof T>(xs: T[], key: K): T[] {
  return [...xs].sort((a, b) => String(a[key]).localeCompare(String(b[key])));
}
```

### 🔴 Expert Example

```typescript
// Constrain instead of accepting everything
function maxBy<T, K extends keyof T>(xs: readonly T[], key: K): T | undefined {
  if (xs.length === 0) return undefined;
  return xs.reduce((a, b) => (a[key] < b[key] ? b : a));
}
```

### 🌍 Real-Time Example

```typescript
declare function createStore<S, A>(init: S, r: { [K in keyof A]: (s: S, x: A[K]) => S }): unknown;
```

## 9. Generic Collections

Built-ins are generic: **`Array<T>`**, **`ReadonlyArray<T>`**, **`Map<K, V>`**, **`Set<T>`**, **`Promise<T>`**, **`Iterator<T>`** / **`Iterable<T>`**, **`AsyncIterable<T>`**. Modeling domain code on these types keeps interop with the standard library and improves readability.

### Generic arrays

### 🟢 Beginner Example

```typescript
const xs: Array<number> = [1, 2, 3];
const ys: readonly string[] = ["a", "b"];
```

### 🟡 Intermediate Example

```typescript
function groupBy<T, K extends PropertyKey>(xs: T[], key: (x: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const x of xs) (out[key(x)] ??= []).push(x);
  return out;
}
```

### 🔴 Expert Example

```typescript
type NonEmpty<T> = [T, ...T[]];

function head<T>(xs: NonEmpty<T>): T {
  return xs[0];
}
```

### 🌍 Real-Time Example

```typescript
type BatchJob<T> = { id: string; payload: T }[];

async function processBatch<T>(jobs: BatchJob<T>, worker: (p: T) => Promise<void>) {
  for (const job of jobs) {
    await worker(job.payload);
  }
}
```

### Maps and sets

### 🟢 Beginner Example

```typescript
const m = new Map<string, number>();
m.set("a", 1);

const s = new Set<string>();
s.add("x");
```

### 🟡 Intermediate Example

```typescript
function invert<K, V>(map: Map<K, V>): Map<V, K[]> {
  const out = new Map<V, K[]>();
  for (const [k, v] of map) {
    const arr = out.get(v) ?? [];
    arr.push(k);
    out.set(v, arr);
  }
  return out;
}
```

### 🔴 Expert Example

```typescript
class BiMap<A, B> {
  private ab = new Map<A, B>();
  private ba = new Map<B, A>();
  set(a: A, b: B): void {
    this.ab.set(a, b);
    this.ba.set(b, a);
  }
  getByA(a: A): B | undefined {
    return this.ab.get(a);
  }
}
```

### 🌍 Real-Time Example

```typescript
type SessionStore<TUser> = Map<string, { user: TUser; expiresAt: number }>;
```

### Promises

### 🟢 Beginner Example

```typescript
async function load(): Promise<string> {
  return "ok";
}
```

### 🟡 Intermediate Example

```typescript
async function pipe<A, B, C>(a: A, f: (x: A) => B, g: (x: B) => C): Promise<C> {
  return g(f(a));
}
```

### 🔴 Expert Example

```typescript
// Built-in Awaited<T> in TS; tuple Promise.all preserves tuple element types when input is fixed tuple
declare function allTyped<T extends readonly unknown[]>(
  ps: { [K in keyof T]: Promise<T[K]> }
): Promise<T>;
```

### 🌍 Real-Time Example

```typescript
type Task<T> = () => Promise<T>;

async function runWithTimeout<T>(task: Task<T>, ms: number): Promise<T> {
  return await Promise.race([
    task(),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}
```

### Iterators and async iterators

### 🟢 Beginner Example

```typescript
function* nums(): Iterable<number> {
  yield 1;
  yield 2;
}
```

### 🟡 Intermediate Example

```typescript
function* mapIter<T, U>(it: Iterable<T>, fn: (x: T) => U): Generator<U> {
  for (const x of it) yield fn(x);
}
```

### 🔴 Expert Example

```typescript
async function* mergeAsync<T>(...streams: AsyncIterable<T>[]): AsyncIterable<T> {
  for (const s of streams) for await (const x of s) yield x;
}
```

### 🌍 Real-Time Example

```typescript
type PageFetcher<T> = (cursor?: string) => Promise<{ items: T[]; next?: string }>;

async function* paginate<T>(fetchPage: PageFetcher<T>): AsyncIterable<T> {
  let cursor: string | undefined;
  for (;;) {
    const page = await fetchPage(cursor);
    for (const item of page.items) yield item;
    if (!page.next) break;
    cursor = page.next;
  }
}
```

## 10. Higher-Kinded Types

**Higher-kinded types (HKTs)** abstract over type constructors (e.g. “for any `F<_>`, …”). TypeScript has **no** first-class type-level lambdas—you work at **kind \*** or use **encodings** (`URItoKind` / `Apply<K,T>`), **conditional types**, **fp-ts**-style patterns, or **codegen**. For many apps, **avoid** emulating HKTs unless the abstraction pays for itself.

### Limitations and encodings

### 🟢 Beginner Example

```typescript
// Not expressible: interface Functor<F<_>> { map<A,B>(fa: F<A>, f: (a:A)=>B): F<B> }
```

### 🟡 Intermediate Example

```typescript
interface BoxFunctor<F> {
  map<A, B>(fa: F, f: (a: A) => B): F;
}
```

### 🔴 Expert Example

```typescript
declare const URI: unique symbol;
interface URItoKind<A> {
  readonly [URI]?: unknown;
}
type Kind<F extends URItoKind<any>, A> = (F & { readonly [URI]: A })[typeof URI];
```

### 🌍 Real-Time Example

```typescript
interface Option<T> {
  map<U>(f: (t: T) => U): Option<U>;
}
```

### Workarounds and emulating HKTs

### 🟢 Beginner Example

```typescript
function wrapArray<T>(x: T): T[] {
  return [x];
}
```

### 🟡 Intermediate Example

```typescript
type TypeRegistry = { Array: Array<unknown>; Promise: Promise<unknown> };
type Apply<K extends keyof TypeRegistry, T> = K extends "Array"
  ? T[]
  : K extends "Promise"
    ? Promise<T>
    : never;
```

### 🔴 Expert Example

```typescript
type Curry2<P1, P2, R> = P1 extends infer A ? (a: A) => (b: P2) => R : never;
```

### 🌍 Real-Time Example

```typescript
interface CacheAdapter<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
}
```

## 11. Best Practices Checklist

Prefer inference; constrain with `extends`; keep type parameters local and meaningfully repeated; use `T`/`K`/`V`/`E`/`R` consistently; defaults + stable arity in libraries; branded types and documented variance at boundaries.

## 12. Common Mistakes to Avoid

1. **Over-generic public APIs** and **phantom type parameters**—split helpers, improve inference, drop unused `T`.
2. **`any` in generic implementations** and **loose `extends object`** without `keyof`/guards—prefer `unknown`, narrow, and accurate optionality.
3. **Mutable `T[]` parameters** for read-only use—prefer `readonly T[]` for callers.
4. **Statics expecting instance `T`**, **HKT emulation** without team buy-in, **variance surprises**, and **unintended conditional distribution** (`[T] extends [X] ? …` when needed).
