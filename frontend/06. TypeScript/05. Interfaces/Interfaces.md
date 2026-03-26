# TypeScript Interfaces

TypeScript **interfaces** describe the *shape* of objects: property names, types, optional and readonly members, callable and constructable forms, and how types compose through extension and merging. They are erased at compile time (they produce no JavaScript output) but give you strong static checks, great editor tooling, and a vocabulary for designing APIs. This guide walks from everyday declarations through generics, declaration merging, and production-minded patterns—with examples at every level.

---

## 📑 Table of Contents

1. [Interface Basics](#1-interface-basics)
2. [Interface Methods](#2-interface-methods)
3. [Index Signatures](#3-index-signatures)
4. [Interface Extension](#4-interface-extension)
5. [Declaration Merging](#5-declaration-merging)
6. [Hybrid Types](#6-hybrid-types)
7. [Generic Interfaces](#7-generic-interfaces)
8. [Best Practices & Patterns](#8-best-practices--patterns)
9. [Common Mistakes to Avoid](#9-common-mistakes-to-avoid)
10. [Interface vs Type Alias: Comparison Table](#10-interface-vs-type-alias-comparison-table)

---

## 1. Interface Basics

Interfaces declare object shapes. You can use an interface anywhere a type is expected (variables, parameters, return types). **Optional** properties use `?`. **Readonly** properties cannot be reassigned after initialization. **Type aliases** (`type`) overlap with interfaces for object shapes but differ in merging, mapped types ergonomics, and union/intersection expressiveness.

### 🟢 Beginner Example

```typescript
interface User {
  id: number;
  name: string;
  email?: string; // optional
  readonly createdAt: string;
}

const u: User = {
  id: 1,
  name: "Asha",
  createdAt: new Date().toISOString(),
};

u.name = "Asha K.";
// u.createdAt = "..."; // Error: cannot assign to 'createdAt' because it is a read-only property.

function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

### 🟡 Intermediate Example

```typescript
// Interface as a type annotation for class instance shape
interface Logger {
  debug(message: string): void;
}

class ConsoleLogger implements Logger {
  debug(message: string): void {
    console.debug(message);
  }
}

// Interface vs type alias for object shape (both work here)
type Point = { x: number; y: number };
interface Vector {
  x: number;
  y: number;
}

function length(p: Point | Vector): number {
  return Math.hypot(p.x, p.y);
}
```

### 🔴 Expert Example

```typescript
// Discriminated narrowing with interfaces (not a union of interfaces, but compatible)
interface Success<T> {
  ok: true;
  data: T;
}

interface Failure {
  ok: false;
  error: string;
}

type Result<T> = Success<T> | Failure;

function unwrap<T>(r: Result<T>): T {
  if (r.ok) return r.data;
  throw new Error(r.error);
}

// Readonly depth: readonly on property; nested mutability is separate concern
interface Config {
  readonly endpoints: { api: string; auth: string };
}

const c: Config = { endpoints: { api: "/api", auth: "/auth" } };
// c.endpoints = { api: "x", auth: "y" }; // Error
c.endpoints.api = "/v2"; // Allowed unless endpoints is Readonly<> or deeply readonly type
```

### 🌍 Real-Time Example

```typescript
// API response DTOs in a frontend app
interface ProductDto {
  sku: string;
  title: string;
  priceCents: number;
  readonly updatedAt: string;
  tags?: string[];
}

interface PagedResponse<T> {
  items: T[];
  nextCursor?: string;
}

async function fetchProducts(
  cursor?: string
): Promise<PagedResponse<ProductDto>> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const res = await fetch(`/api/products${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<PagedResponse<ProductDto>>;
}
```

---

## 2. Interface Methods

Interfaces can describe **methods** in two equivalent surface forms: **method syntax** (`add(a: number, b: number): number`) and **property signatures** with a function type (`add: (a: number, b: number) => number`). The compiler treats them similarly for object types; pick one style and stay consistent within a codebase. **Overloads** are expressed as multiple call signatures in an interface (or adjacent overload signatures on a function implementation). **Call signatures** describe values you can invoke like functions. **Construct signatures** describe values you can call with `new`.

### 🟢 Beginner Example

```typescript
interface Calculator {
  // Method syntax (common in interfaces)
  add(a: number, b: number): number;
  reset(): void;
}

// Same shape using property signatures (useful when assigning existing function values)
interface CalculatorFnStyle {
  add: (a: number, b: number) => number;
  reset: () => void;
}

const calc: Calculator = {
  add(a, b) {
    return a + b;
  },
  reset() {
    /* noop */
  },
};

const calc2: CalculatorFnStyle = {
  add: (a, b) => a + b,
  reset: () => {},
};
```

### 🟡 Intermediate Example

```typescript
// Method overloads on an interface (call signature list)
interface Stringifier {
  (value: string): string;
  (value: number): string;
  (value: boolean): string;
}

const stringify: Stringifier = (value: string | number | boolean) =>
  String(value);

const a = stringify("hi");
const b = stringify(42);
```

### 🔴 Expert Example

```typescript
// Call signature + properties = hybrid (see [Hybrid Types](#6-hybrid-types))
interface Command<T = void> {
  (...args: unknown[]): T;
  readonly name: string;
}

const exit: Command<never> = Object.assign(
  (code: number): never => {
    throw new Error(`exit ${code}`);
  },
  { name: "exit" } as const
);

// Construct signature: describes a constructor
interface ComponentConstructor {
  new (props: { id: string }): { render(): string };
}

declare const Button: ComponentConstructor;

const instance = new Button({ id: "ok" });
```

### 🌍 Real-Time Example

```typescript
// Plugin interface for an extensible build tool
interface BuildPlugin {
  name: string;
  apply(context: BuildContext): void;
  transform?(source: string, path: string): string;
}

interface BuildContext {
  addHook(hook: "pre" | "post", fn: () => void): void;
}

function loadPlugin(p: BuildPlugin): void {
  const ctx: BuildContext = {
    addHook(_phase, _fn) {
      /* register */
    },
  };
  p.apply(ctx);
}
```

---

## 3. Index Signatures

**Index signatures** allow objects with dynamic keys: `[key: string]: ValueType` or `[index: number]: ValueType`. Rules: each known property must be assignable to the index signature type. **Readonly** index signatures prevent assignment via bracket notation. Mixing string and number indexes is allowed with care: numeric keys are coerced in object literals; array-like types often use `number` indexes.

### 🟢 Beginner Example

```typescript
interface StringDict {
  [key: string]: string;
}

const colors: StringDict = {
  primary: "#3366ff",
  secondary: "#ff6633",
};

const primary = colors["primary"];
```

### 🟡 Intermediate Example

```typescript
interface MixedBag {
  [key: string]: string | number | undefined;
  id: number; // must be assignable to index signature
  title: string;
  // count: boolean; // Error: boolean not assignable to string | number | undefined
}

const bag: MixedBag = { id: 1, title: "doc" };
```

### 🔴 Expert Example

```typescript
interface ReadonlyStringMap {
  readonly [key: string]: string;
}

const env: ReadonlyStringMap = { NODE_ENV: "production" };
// env["FOO"] = "bar"; // Error: index signature is readonly

// Template literal keys with index patterns (often paired with mapped types;
// interfaces use index signatures for the broad bucket)
interface HttpHeaders {
  [header: string]: string | string[] | undefined;
  "content-type"?: string;
  authorization?: string;
}

// Mixed numeric + string index: numeric indexer result must be assignable
// to the string indexer’s value type (arrays and array-like objects).
interface StringArrayLike {
  [index: number]: string;
  [key: string]: string | number | undefined;
  length: number;
}
```

### 🌍 Real-Time Example

```typescript
// i18n dictionary: locale -> key -> message
interface Messages {
  [key: string]: string;
}

interface LocalePack {
  [namespace: string]: Messages;
}

const en: LocalePack = {
  common: { save: "Save", cancel: "Cancel" },
  errors: { notFound: "Not found" },
};

function t(pack: LocalePack, ns: string, key: string): string {
  return pack[ns]?.[key] ?? key;
}
```

---

## 4. Interface Extension

Use **`extends`** to build larger interfaces from smaller ones. TypeScript supports **multiple** `extends` clauses (`interface A extends B, C {}`). An **`interface` may extend a `type` alias** when that alias resolves to a **static object type** (not a bare union of unrelated shapes—prefer `type T = A & B` or split interfaces in those cases). The idiomatic pattern for ad hoc combinations remains `interface X extends Y, Z` or intersecting at the use site. **Overriding** properties in subinterfaces narrows types (must be assignable per structural rules).

### 🟢 Beginner Example

```typescript
interface Named {
  name: string;
}

interface Aged {
  age: number;
}

interface Person extends Named, Aged {
  id: number;
}

const p: Person = { id: 1, name: "Lee", age: 30 };
```

### 🟡 Intermediate Example

```typescript
// Extending a type alias (object shape) with an interface
type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

interface BlogPost extends Timestamps {
  slug: string;
  title: string;
}

const post: BlogPost = {
  slug: "ts-interfaces",
  title: "Interfaces",
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface Entity {
  id: string;
}

interface SoftDeletable {
  deletedAt: string | null;
}

interface User extends Entity, SoftDeletable {
  email: string;
}

// Property override: narrowing is allowed
interface Admin extends User {
  role: "admin";
  deletedAt: null; // narrower than string | null
}
```

### 🔴 Expert Example

```typescript
interface ApiError {
  code: string;
  message: string;
}

interface HttpError extends ApiError {
  status: number;
  // Cannot widen message to unknown without breaking assignability rules
}

// Compose behavior-only interfaces
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Versioned {
  version: number;
}

interface Document extends Timestamped, Versioned {
  title: string;
  body: string;
}
```

### 🌍 Real-Time Example

```typescript
interface BaseEvent {
  type: string;
  timestamp: number;
}

interface UserSignedInEvent extends BaseEvent {
  type: "user.signed_in";
  userId: string;
  sessionId: string;
}

interface OrderPlacedEvent extends BaseEvent {
  type: "order.placed";
  orderId: string;
  totalCents: number;
}

type DomainEvent = UserSignedInEvent | OrderPlacedEvent;

function handle(e: DomainEvent): void {
  switch (e.type) {
    case "user.signed_in":
      console.log(e.sessionId);
      break;
    case "order.placed":
      console.log(e.orderId);
      break;
  }
}
```

---

## 5. Declaration Merging

Interfaces with the **same name** in the same scope **merge** into one. This is unique to interfaces (not `type`). **Merging rules (essentials):** non-function members with the same name must have **identical** types; function members with the same name merge as **overload signatures** (order matters for implementation matching); namespaces, enums, interfaces, and classes can participate in merging in specific combinations. **Namespaces** can merge with interfaces and classes. **Module augmentation** extends third-party modules by redeclaring their module and adding interfaces.

### 🟢 Beginner Example

```typescript
interface Window {
  title: string;
}

interface Window {
  width: number;
}

// Merged Window has title and width
const w: Window = { title: "App", width: 1024 };
```

### 🟡 Intermediate Example

```typescript
interface Request {
  path: string;
}

interface Request {
  method: "GET" | "POST";
}

// Non-function members must be identical if duplicated (not shown).
// Functions merge as overloads:
interface Logger {
  log(msg: string): void;
}

interface Logger {
  log(msg: string, meta: Record<string, unknown>): void;
}

const logger: Logger = {
  log(msg: string, meta?: Record<string, unknown>) {
    if (meta) console.log(msg, meta);
    else console.log(msg);
  },
};
```

### 🔴 Expert Example

```typescript
namespace App {
  export interface Config {
    env: "dev" | "prod";
  }
}

namespace App {
  export interface Config {
    apiBase: string;
  }
}

// App.Config now has env and apiBase

declare global {
  interface Window {
    /** Injected at build time in some SPAs */
    __APP_BUILD_ID__?: string;
  }
}

export {};
```

### 🌍 Real-Time Example

```typescript
// Typical pattern: `global.d.ts` or `types/vendor.d.ts` augments a published package
// so your app can type fields the upstream types omit.

declare module "@acme/runtime" {
  export interface Session {
    userId: string;
    expiresAt: number;
  }
}

declare module "@acme/runtime" {
  export interface Session {
    /** Set by your auth middleware after refresh */
    refreshedAt?: number;
  }
}

// Merged Session: { userId, expiresAt, refreshedAt? }
// import type { Session } from "@acme/runtime";

export {};

// Express-style global augmentation (often in the same kind of file):
// declare global {
//   namespace Express {
//     interface Request {
//       user?: { id: string; roles: string[] };
//     }
//   }
// }
// export {};
```

---

## 6. Hybrid Types

A value can be **callable**, **constructable**, and still have **properties** (e.g., a function with metadata). Interfaces express this by combining call/construct signatures with property members.

### 🟢 Beginner Example

```typescript
interface Counter {
  (): number;
  count: number;
}

function makeCounter(): Counter {
  const c = (() => c.count++) as Counter;
  c.count = 0;
  return c;
}

const next = makeCounter();
next(); // 0
next(); // 1
```

### 🟡 Intermediate Example

```typescript
interface Comparator<T> {
  (a: T, b: T): number;
  label: string;
}

const byAge: Comparator<{ age: number }> = Object.assign(
  (a, b) => a.age - b.age,
  { label: "byAge" }
);
```

### 🔴 Expert Example

```typescript
interface SerializableConstructor<T> {
  new (raw: string): T;
  schemaVersion: number;
  fromJSON(raw: string): T;
}

declare const UserModel: SerializableConstructor<{ id: string }>;

const u = new UserModel('{"id":"u1"}');
const u2 = UserModel.fromJSON('{"id":"u2"}');
const v = UserModel.schemaVersion;
```

### 🌍 Real-Time Example

```typescript
// Styled component pattern: function + static properties
interface StyledTag {
  (strings: TemplateStringsArray, ...expr: unknown[]): string;
  displayName: string;
}

const styled: StyledTag = Object.assign(
  (strings: TemplateStringsArray, ...expr: unknown[]) => {
    return strings.reduce((acc, s, i) => acc + s + (expr[i] ?? ""), "");
  },
  { displayName: "styled" }
);

const css = styled`color: ${"red"};`;
```

---

## 7. Generic Interfaces

**Generic interfaces** parameterize shapes: `interface Box<T> { value: T }`. Implementations fix or infer `T`. Use **`extends`** on type parameters for **constraints**. **Defaults** on generics (`T = string`) simplify call sites. **Inference** flows from arguments and contextual typing.

### 🟢 Beginner Example

```typescript
interface Box<T> {
  value: T;
}

const n: Box<number> = { value: 42 };
const s: Box<string> = { value: "hi" };
```

### 🟡 Intermediate Example — inference

```typescript
// T is inferred from the argument when you pass a Box<T>
interface Box<T> {
  value: T;
}

function unwrap<T>(box: Box<T>): T {
  return box.value;
}

const inferred = unwrap({ value: { id: "x" } }); // T inferred as { id: string }
```

### 🟡 Intermediate Example — constraints & `implements`

```typescript
interface Repository<T extends { id: string }> {
  findById(id: string): T | undefined;
  save(entity: T): void;
}

interface Invoice {
  id: string;
  total: number;
}

class InvoiceRepo implements Repository<Invoice> {
  private store = new Map<string, Invoice>();
  findById(id: string) {
    return this.store.get(id);
  }
  save(entity: Invoice) {
    this.store.set(entity.id, entity);
  }
}
```

### 🔴 Expert Example

```typescript
interface ApiClient<
  TResponse = unknown,
  TError extends { message: string } = { message: string }
> {
  get(path: string): Promise<TResponse>;
  // error shape constrained for uniform handling
  mapError(e: TError): never;
}

interface Paginated<T> {
  items: T[];
  next?: string;
}

type UserPage = Paginated<{ id: string }>;

declare const client: ApiClient<UserPage>;

async function load(): Promise<UserPage> {
  return client.get("/users");
}
```

### 🌍 Real-Time Example

```typescript
// DataTable column definitions: infer row type from generic
interface Column<TRow, TKey extends keyof TRow> {
  key: TKey;
  header: string;
  render?: (value: TRow[TKey], row: TRow) => string;
}

interface UserRow {
  id: string;
  name: string;
  lastLogin: Date;
}

const columns: Column<UserRow, keyof UserRow>[] = [
  { key: "name", header: "Name" },
  {
    key: "lastLogin",
    header: "Last login",
    render: (v) => v.toISOString(),
  },
];
```

---

## 8. Best Practices & Patterns

Use **interfaces** for object shapes you may **extend or merge** (especially public APIs and library types). Use **type aliases** for **unions**, **intersections** of unions, **mapped types**, **conditional types**, and **tuple** aliases. Name interfaces in **PascalCase** without an `I` prefix (modern style). Prefer **composition** (`extends`, smaller interfaces) over giant “god objects.” Avoid **index signatures** unless the domain is truly dynamic; they weaken excess property checks and hide typos.

### 🟢 Beginner Example

```typescript
// Prefer interface for a clear object contract
interface Props {
  title: string;
  onClose(): void;
}

// Prefer type for a union of literals
type Theme = "light" | "dark";

function Screen(props: Props, theme: Theme): void {
  console.log(props.title, theme);
}
```

### 🟡 Intermediate Example

```typescript
interface Identifiable {
  id: string;
}

interface Auditable {
  createdBy: string;
  updatedBy: string;
}

// Composition over one mega-interface
interface Article extends Identifiable, Auditable {
  slug: string;
  body: string;
}

// Type alias for intersection when combining unrelated object types ad hoc
type Draft = Article & { published: false };
```

### 🔴 Expert Example

```typescript
// Interface for extension in consumer code (libraries)
export interface PluginHost {
  register(p: Plugin): void;
}

export interface Plugin {
  name: string;
  setup(host: PluginHost): void;
}

// Type for advanced manipulation — not merging with consumers
export type PluginFactory = (options: { debug: boolean }) => Plugin;

// Branded IDs: often implemented with types, not interfaces
type UserId = string & { readonly __brand: unique symbol };
```

### 🌍 Real-Time Example

```typescript
// Public SDK surface: interfaces; internal helpers: types as needed
export interface HttpClient {
  get<T>(url: string): Promise<T>;
}

export type HttpClientConfig =
  | { kind: "fetch"; baseUrl: string }
  | { kind: "axios"; instance: unknown };

export function createClient(config: HttpClientConfig): HttpClient {
  if (config.kind === "fetch") {
    return {
      async get<T>(url: string) {
        const res = await fetch(config.baseUrl + url);
        return res.json() as Promise<T>;
      },
    };
  }
  throw new Error("unsupported");
}
```

---

## 9. Common Mistakes to Avoid

1. **Declaring an index signature too wide** — forces every explicit property to match it; leads to `any`-like ergonomics or errors when adding booleans alongside strings.
2. **Expecting `implements` to enforce “extra properties” on literals** — excess property checks apply mainly to fresh object literals assigned to a type, not class `implements` clauses the same way.
3. **Using declaration merging accidentally** — duplicate interface names in a file merge; can surprise teams. Prefer unique names or `type` when merging is not intended.
4. **Mixing `type` and `interface` for the same name** — not allowed; pick one per symbol.
5. **Overloading interfaces without a single implementation signature** — remember the implementation must satisfy the overload union in real functions; interfaces only describe the call surface.
6. **Assuming `readonly` is deep** — `readonly props` does not deeply freeze nested objects unless you model them as readonly too.

### 🟢 Beginner Example

```typescript
// Mistake: index signature too strict/loose
interface Bad {
  [k: string]: string;
  active: boolean; // Error: boolean not assignable to string
}

// Fix: widen the index or drop it and list known keys
interface Good {
  active: boolean;
  metadata: Record<string, string>;
}
```

### 🟡 Intermediate Example

```typescript
interface Options {
  timeoutMs: number;
}

class Client implements Options {
  // Class can have more members than Options; implements checks instance side
  timeoutMs = 5_000;
  connect(): void {}
}
```

### 🔴 Expert Example

```typescript
// Mistake: duplicate global augmentation files merging conflicting members
// Keep augmentations in one place per module.

// Safer: narrow augmentation behind explicit import path
// types/express.d.ts with a single `declare module "express-serve-static-core" { ... }`
```

### 🌍 Real-Time Example

```typescript
// Mistake: using Record<string, any> / broad index for all API JSON
interface LooseApi {
  [key: string]: any;
}

// Better: schema-driven known fields + small escape hatch
interface StrictUser {
  id: string;
  email: string;
  traits?: Record<string, string | number | boolean>;
}
```

---

## 10. Interface vs Type Alias: Comparison Table

| Capability | `interface` | `type` |
|------------|-------------|--------|
| Object shape declaration | Yes | Yes |
| Union / intersection of primitives & complex types | Via intersection with care | Idiomatic (`A \| B`, `A & B`) |
| Declaration merging | Yes | No |
| Mapped / conditional types | Not directly on `interface` body | Yes |
| `extends` / `implements` | `interface extends`, class `implements` | Intersection `&` with types; class `implements` type alias |
| Performance (compiler) | Often faster to display errors on large object types | Heavy intersections can be slower |
| Extending third-party types | Module augmentation via `interface` | Limited; often wrap in new type |

### 🟢 Beginner Example

```typescript
interface Point2D {
  x: number;
  y: number;
}
type Point3D = Point2D & { z: number };
```

### 🟡 Intermediate Example

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

interface Success<T> {
  success: true;
  data: T;
}
interface Failure {
  success: false;
  error: string;
}
type Result2<T> = Success<T> | Failure;
```

### 🔴 Expert Example

```typescript
// Mapped type: only `type`
type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];
};

// Library: export interface for extension, export type for utilities
export interface StoreState {
  user: { id: string } | null;
}
export type StoreSelector<T> = (s: StoreState) => T;
```

### 🌍 Real-Time Example

```typescript
// Choose interface for events consumers will augment
export interface TelemetryEvent {
  name: string;
  payload: Record<string, unknown>;
}

// Choose type for transport-level union of frames
export type WireFrame =
  | { kind: "ping" }
  | { kind: "data"; body: Uint8Array }
  | { kind: "error"; code: number };
```

---

### Quick reference checklist

- Use **interfaces** for **object contracts** you or consumers might **extend** or **augment**.
- Use **types** for **unions**, **mapped types**, **conditional types**, and **complex compositions**.
- Prefer **explicit properties** over **index signatures** when keys are known.
- Apply **readonly** and **generics** at the boundaries (APIs, repositories, components) for safer refactors.
- Treat **declaration merging** as a **deliberate feature**, not an accident.

---

*These examples are illustrative. Enable `strict` in `tsconfig.json` for maximum safety (`strictNullChecks`, `noImplicitAny`, etc.).*
