# TypeScript Advanced Types

TypeScript’s type system goes far beyond primitive annotations. **Advanced types** let you model real data precisely, narrow unions safely, compose types from smaller pieces, and catch bugs at compile time. This guide walks through object shapes, arrays and tuples, unions and intersections, literals and enums, aliases and assertions, narrowing strategies, and template literal types—with examples from beginner patterns through production-style scenarios.

---

## 📑 Table of Contents

1. [Object Types](#1-object-types)
2. [Array Types](#2-array-types)
3. [Union Types](#3-union-types)
4. [Intersection Types](#4-intersection-types)
5. [Literal Types](#5-literal-types)
6. [Enum Types](#6-enum-types)
7. [Type Aliases](#7-type-aliases)
8. [Type Assertions](#8-type-assertions)
9. [Type Narrowing](#9-type-narrowing)
10. [Template Literal Types](#10-template-literal-types)
11. [Best Practices](#best-practices)
12. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
13. [Comparison Table](#comparison-table)

---

## 1. Object Types

Object types describe the **shape** of plain JavaScript objects: which properties exist, whether they are optional, whether they can be reassigned (`readonly`), how to allow **dynamic keys** (index signatures), how **nested** structures are typed, and when TypeScript’s **excess property check** rejects extra fields.

### 🟢 Beginner Example

```typescript
// Explicit object type annotation
type User = {
  id: number;
  name: string;
  email?: string; // optional
};

const u: User = { id: 1, name: "Ada" };
// u.email is string | undefined
```

### 🟡 Intermediate Example

```typescript
type Config = {
  readonly apiUrl: string;
  timeoutMs: number;
  headers: Record<string, string>;
  retry?: { max: number; backoffMs: number };
};

const cfg: Config = {
  apiUrl: "https://api.example.com",
  timeoutMs: 5000,
  headers: { "X-Client": "web" },
};

// cfg.apiUrl = "other"; // Error: readonly
```

### 🔴 Expert Example

```typescript
// Index signature + known keys + excess property checks
type JsonPrimitive = string | number | boolean | null;
type JsonObject = {
  [key: string]: JsonPrimitive | JsonObject | JsonArray;
};
type JsonArray = Array<JsonPrimitive | JsonObject | JsonArray>;

type Document = {
  id: string;
  meta: {
    createdAt: string;
    tags: readonly string[];
  };
  // Catch-all for extension fields (string values only)
  [extra: string]: string | { createdAt: string; tags: readonly string[] };
};

const doc: Document = {
  id: "d1",
  meta: { createdAt: "2025-01-01", tags: ["draft"] as const },
  department: "eng", // allowed: string
};

// const bad: Document = { id: "x", meta: doc.meta, unknownFlag: true };
// Error: unknownFlag is not assignable (excess / incompatible index value)
```

### 🌍 Real-Time Example

```typescript
// API request body validated then typed for a Nest/Express handler
type CreateOrderBody = {
  customerId: string;
  lineItems: ReadonlyArray<{ sku: string; qty: number }>;
  notes?: string;
};

function parseCreateOrder(raw: unknown): CreateOrderBody {
  if (typeof raw !== "object" || raw === null) throw new Error("Invalid body");
  const o = raw as Record<string, unknown>;
  if (typeof o.customerId !== "string") throw new Error("customerId required");
  // ... validate lineItems in production
  return {
    customerId: o.customerId,
    lineItems: [],
    ...(typeof o.notes === "string" ? { notes: o.notes } : {}),
  };
}
```

**Excess property checks** apply when you assign an **object literal** to a variable or pass it as an argument where the target type is known. Fresh literals cannot include unknown properties unless the type allows them (e.g. via index signatures or intersection tricks).

### Nested objects

Nested objects are typed by giving **inner object types** for each property. Optional and `readonly` apply **per property**; inner fields stay mutable unless you mark them `readonly` too.

### 🟢 Beginner Example

```typescript
type Address = { city: string; zip: string };
type Customer = {
  name: string;
  address: Address;
};

const c: Customer = {
  name: "Lin",
  address: { city: "NYC", zip: "10001" },
};
```

### 🟡 Intermediate Example

```typescript
type Deep = {
  user: {
    readonly profile: {
      displayName: string;
      avatarUrl?: string;
    };
  };
};

const d: Deep = { user: { profile: { displayName: "Ada" } } };
// d.user.profile = { displayName: "X" }; // Error: cannot assign readonly `profile`
d.user.profile.displayName = "Ada L."; // OK here (fields not readonly)
```

### 🔴 Expert Example

```typescript
type UserState = {
  session: { token: string; expiresAt: number };
  prefs: { theme: "light" | "dark"; density: "cozy" | "compact" };
};

type PartialPrefs = {
  session: UserState["session"];
  prefs?: Partial<UserState["prefs"]>;
};

const patch: PartialPrefs = {
  session: { token: "t", expiresAt: 1 },
  prefs: { theme: "dark" },
};
```

### 🌍 Real-Time Example

```typescript
type InvoiceLine = { sku: string; qty: number; unitPriceCents: number };
type InvoiceDto = {
  id: string;
  customer: { id: string; email: string };
  lines: readonly InvoiceLine[];
  totals: { subtotalCents: number; taxCents: number };
};

function sumLines(inv: InvoiceDto): number {
  return inv.lines.reduce((s, l) => s + l.qty * l.unitPriceCents, 0);
}
```

**Excess property checks (recap):** a **fresh** literal `{ a: 1, b: 2 }` assigned to `{ a: number }` is an error; the same object in a **variable** `extra` often assigns cleanly because the check does not apply the same way.

---

## 2. Array Types

Arrays can be written as **`T[]`** or **`Array<T>`** (equivalent for most purposes). **`readonly T[]`** (or `ReadonlyArray<T>`) prevents mutating methods. **Tuples** fix length and position types; **`readonly` tuples**, **rest elements**, **optional elements**, and **labeled tuple elements** (for readability and tooling) refine that model.

### 🟢 Beginner Example

```typescript
const nums: number[] = [1, 2, 3];
const names: Array<string> = ["a", "b"];

nums.push(4); // OK
```

### 🟡 Intermediate Example

```typescript
const ro: readonly number[] = [1, 2, 3];
// ro.push(4); // Error

type Point = [number, number];
const p: Point = [10, 20];

type StringNumberPairs = [string, number][];
const rows: StringNumberPairs = [
  ["age", 30],
  ["score", 100],
];
```

### 🔴 Expert Example

```typescript
// Rest, optional, and readonly tuple
type Rgb = readonly [r: number, g: number, b: number, a?: number];

const color: Rgb = [255, 128, 0];
const colorWithAlpha: Rgb = [255, 128, 0, 0.5];

// Rest element must be last
type HeadTail = [string, ...number[]];
const ht: HeadTail = ["scores", 1, 2, 3];

// Optional middle (TS 3.0+): ? before element
type MaybeMiddle = [string, string?, string?];
const m1: MaybeMiddle = ["only"];
const m2: MaybeMiddle = ["a", "b"];

// Named tuple elements (labels are for tooling only)
type Row = [first: string, middle?: string, last: string];
```

### 🌍 Real-Time Example

```typescript
// CSV row: [id, name, ...tags] from a parser
type ParsedRow = [id: string, name: string, ...tags: string[]];

function normalizeRow(row: ParsedRow): { id: string; name: string; tags: string[] } {
  const [id, name, ...tags] = row;
  return { id, name, tags };
}

// React useState tuple-style inference
function usePair(): readonly [number, (n: number) => void] {
  // simplified
  return [0, () => {}] as const;
}
```

### `T[]` vs `Array<T>`

Both mean the same **mutable** array type. Style guides often pick one for consistency; `ReadonlyArray<T>` / `readonly T[]` is the immutable counterpart.

### 🟢 Beginner Example

```typescript
const a: string[] = [];
const b: Array<string> = [];
```

### 🟡 Intermediate Example

```typescript
function mapNum(arr: ReadonlyArray<number>): number[] {
  return arr.map((n) => n * 2);
}
```

### 🔴 Expert Example

```typescript
// Higher-order: Array constructor interface vs shorthand in conditional types
type Elem<X> = X extends ReadonlyArray<infer E> ? E : X;
type E1 = Elem<string[]>; // string
type E2 = Elem<readonly number[]>; // number
```

### 🌍 Real-Time Example

```typescript
// Public API: accept readonly from callers, return mutable copies internally
function cloneTags(tags: readonly string[]): string[] {
  return [...tags];
}
```

**Tuple recap:** optional elements use `?` (`[string, number?]`); **rest** must be last (`[string, ...number[]]`); **labels** (`[id: string]`) help IDE messages only. See the **Expert** and **Real-Time** examples in this section for `Rgb`, `HeadTail`, and `ParsedRow`.

---

## 3. Union Types

A **union** `A | B` means “either A or B.” You must **narrow** before using members that exist on only one side. **Discriminated unions** add a shared literal **discriminant** field (e.g. `kind: "success" | "error"`) so control flow can narrow reliably. **`any`** disables checking; unions preserve it.

### 🟢 Beginner Example

```typescript
type Id = string | number;

function formatId(id: Id): string {
  if (typeof id === "string") return id.toUpperCase();
  return id.toFixed(0);
}
```

### 🟡 Intermediate Example

```typescript
type Success = { ok: true; data: string };
type Failure = { ok: false; error: string };
type Result = Success | Failure;

function unwrap(r: Result): string {
  if (r.ok) return r.data;
  throw new Error(r.error);
}
```

### 🔴 Expert Example

```typescript
// Discriminated union + exhaustiveness
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; w: number; h: number }
  | { kind: "poly"; points: readonly [number, number][] };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.w * s.h;
    case "poly":
      return 0; // shoelace in real code
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}
```

### 🌍 Real-Time Example

```typescript
// Payment provider webhook payloads
type Webhook =
  | { type: "invoice.paid"; invoiceId: string; amountCents: number }
  | { type: "invoice.failed"; invoiceId: string; reason: string };

function routeWebhook(event: Webhook): void {
  switch (event.type) {
    case "invoice.paid":
      ledgerCredit(event.invoiceId, event.amountCents);
      break;
    case "invoice.failed":
      notifyOps(event.invoiceId, event.reason);
      break;
  }
}

function ledgerCredit(_id: string, _cents: number): void {}
function notifyOps(_id: string, _reason: string): void {}
```

### Union vs `any`

**`any`** turns off type checking for that value. **Unions** keep checking but require narrowing. Prefer **`unknown`** over `any` at boundaries, then narrow to a union or concrete type.

### 🟢 Beginner Example

```typescript
function double(x: any): any {
  return x * 2;
}

function doubleSafe(x: number | string): number {
  const n = typeof x === "string" ? Number(x) : x;
  return n * 2;
}
```

### 🟡 Intermediate Example

```typescript
type Row = Record<string, string | number>;
// row["x"] is string | number — still safer than any

let loose: any = 1;
loose.foo.bar; // no compile error — runtime bomb

let tight: string | undefined;
// tight.length; // Error until narrowed

function handle(input: string | number | boolean): void {
  if (typeof input === "string" || typeof input === "number") void input.valueOf();
  else void input.valueOf();
}
```

### 🔴 Expert Example

```typescript
// Narrow `unknown` into a union before use — same idea as `toEvent` below
function parseKind(raw: unknown): "click" | "scroll" | null {
  if (raw === "click" || raw === "scroll") return raw;
  return null;
}
```

### 🌍 Real-Time Example

```typescript
import type { Request } from "express";

type IngestEvent = { kind: "click"; x: number } | { kind: "scroll"; y: number };

function toEvent(raw: unknown): IngestEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (o.kind === "click" && typeof o.x === "number") return { kind: "click", x: o.x };
  if (o.kind === "scroll" && typeof o.y === "number") return { kind: "scroll", y: o.y };
  return null;
}

function fromRequest(req: Request): IngestEvent | null {
  return toEvent(req.body as unknown);
}
```

---

## 4. Intersection Types

**`A & B`** means the value must satisfy **both** types at once. For objects, fields merge. Intersections differ from **`extends`** in generics: `extends` constrains a type parameter; `&` combines two types into one.

### 🟢 Beginner Example

```typescript
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const p: Person = { name: "Bob", age: 40 };
```

### 🟡 Intermediate Example

```typescript
type Timestamps = { createdAt: Date; updatedAt: Date };
type SoftDelete = { deletedAt: Date | null };

type Entity = { id: string } & Timestamps & SoftDelete;
```

### 🔴 Expert Example

```typescript
// Combining object type with callable signature
type LogFn = (msg: string) => void;
type WithMeta = { level: "info" | "warn" | "error" };

type Logger = LogFn & WithMeta;

const log: Logger = Object.assign((msg: string) => console.log(msg), {
  level: "info" as const,
});

// Intersection + conflicting primitives becomes `never`
type Oops = string & number; // never
```

### 🌍 Real-Time Example

```typescript
// Express: merge route params + authenticated user from middleware
type Params = { orderId: string };
type AuthedUser = { userId: string; roles: readonly string[] };

type OrderHandlerContext = Params & { user: AuthedUser };

function handleOrder(ctx: OrderHandlerContext): void {
  void ctx.orderId;
  void ctx.user.userId;
}
```

### Intersection vs `extends` (generics)

**`T extends U`** constrains a **type parameter** (“T must be assignable to U”). **`A & B`** forms a **single type** that must satisfy both. Use `extends` in generic signatures; use `&` when **merging** object-like requirements.

### 🟢 Beginner Example

```typescript
function takeString<T extends string>(x: T): T {
  return x;
}
```

### 🟡 Intermediate Example

```typescript
type Admin = { role: "admin"; permissions: string[] };
type User = { id: string; name: string };

function isAdminAccount(u: User & { role: string }): u is User & Admin {
  return u.role === "admin";
}
```

### 🔴 Expert Example

```typescript
type Serializable = { toJSON(): unknown };

function save<T extends object & Serializable>(obj: T): void {
  void obj.toJSON();
}

// `extends` in mapped types vs intersection in output
type Optionalize<T> = {
  [K in keyof T]?: T[K];
} & {};

type X = Optionalize<{ a: number; b: string }>;
```

### 🌍 Real-Time Example

```typescript
// Prisma-style: base model intersected with relations
type Base = { id: string; createdAt: Date };
type WithAuthor = { author: { id: string; name: string } };

type Post = Base & { title: string; body: string };
type PostWithAuthor = Post & WithAuthor;

function renderPost(p: PostWithAuthor): string {
  return `${p.title} by ${p.author.name}`;
}
```

---

## 5. Literal Types

**Literal types** pin a value to exactly one primitive: `"ok"`, `42`, `true`. Without `const` or `as const`, literals in **`let`** assignments often **widen** to `string` or `number`. **`as const`** freezes literals and readonly views for deep structures.

### 🟢 Beginner Example

```typescript
let direction: "up" | "down" = "up";
direction = "down";
// direction = "sideways"; // Error
```

### 🟡 Intermediate Example

```typescript
function makePoint(axis: "x" | "y", n: number) {
  return axis === "x" ? { x: n, y: 0 } : { x: 0, y: n };
}

let port = 3000 as 3000; // literal type 3000
// port = 8080; // Error
```

### 🔴 Expert Example

```typescript
// Widening vs const assertion
let a = "hello"; // string
const b = "hello"; // "hello"

const config = {
  mode: "strict",
  retries: 3,
} as const;

type Mode = (typeof config)["mode"]; // "strict"
type Retries = (typeof config)["retries"]; // 3

// Tuple + literal preservation
const tuple = [10, "ten"] as const;
type T0 = (typeof tuple)[0]; // 10
```

### 🌍 Real-Time Example

```typescript
// Finite set of feature flags from server config
const FLAGS = ["betaCharts", "newNav", "darkMode"] as const;
type FeatureFlag = (typeof FLAGS)[number];

function isEnabled(flag: FeatureFlag, userFlags: readonly string[]): boolean {
  return userFlags.includes(flag);
}
```

### Boolean literals, widening, and `as const` “deep freeze”

**Boolean literals** behave like other literals: `const ready = true` is type `true`; `let maybe = true` widens to **`boolean`**. **Widening** also turns `"dev"` into **`string`** on `let` unless you annotate. **`as const`** makes nested properties **readonly** and preserves literal types; arrays become **readonly tuples**.

### 🟢 Beginner Example

```typescript
const ready = true; // true
let maybe = true; // boolean

const routes = ["/", "/login"] as const;
type Route = (typeof routes)[number];
```

### 🟡 Intermediate Example

```typescript
function configure(mode: "dev" | "prod"): void {
  void mode;
}

let m = "dev";
// configure(m); // Error: string is too wide
let m2: "dev" | "prod" = "dev";
configure(m2);

const theme = {
  colors: { fg: "#111", bg: "#fff" },
  radii: { sm: 4, md: 8 },
} as const;
type Fg = (typeof theme)["colors"]["fg"];
```

### 🔴 Expert Example

```typescript
declare function tuple<T extends readonly unknown[]>(...args: T): T;

const a = tuple("a", 1); // readonly ["a", 1]
const nums = [1, 2, 3];
const b = tuple(...nums); // number[] — tuple length lost via spread widening

function pick<T extends readonly unknown[], I extends number>(t: T, i: I): T[I] {
  return t[i];
}
const t = [1, "x"] as const;
type A = typeof t; // readonly [1, "x"]
```

### 🌍 Real-Time Example

```typescript
const Env = {
  NODE_ENV: "production",
  PORT: 8080,
} as const;
type NodeEnv = (typeof Env)["NODE_ENV"];
type Port = (typeof Env)["PORT"];

const MESSAGES = {
  en: { hello: "Hello", bye: "Bye" },
  es: { hello: "Hola", bye: "Adiós" },
} as const;

type Locale = keyof typeof MESSAGES;
type Key = keyof (typeof MESSAGES)["en"];

function t(locale: Locale, key: Key): string {
  return MESSAGES[locale][key];
}
```

---

## 6. Enum Types

**Enums** assign names to numeric or string values. **Numeric enums** auto-increment; **string enums** require each member initialized. **Heterogeneous** enums mix string and number (discouraged). **Computed members** must be compile-time constants for const contexts. **`const enum`** inlines values (no JS object; erasure caveats). **Ambient enums** declare shape without emitting JS. **Union of string literals** is often preferred for tree-shaking and simplicity.

### 🟢 Beginner Example

```typescript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

const d: Direction = Direction.Up;
```

### 🟡 Intermediate Example

```typescript
enum Http {
  OK = 200,
  NotFound = 404,
}

enum Theme {
  Light = "light",
  Dark = "dark",
}

function setTheme(t: Theme): void {
  document.documentElement.dataset.theme = t;
}
```

### 🔴 Expert Example

```typescript
const enum InlineCodes {
  A = 1,
  B = A * 2,
}

// Ambient enum (typical in .d.ts)
declare enum OS {
  Darwin = "darwin",
  Linux = "linux",
}

// Enum vs union: union is often clearer
type Role = "admin" | "member" | "guest";

// Heterogeneous (allowed but avoid)
enum Mixed {
  No = 0,
  Yes = "YES",
}
```

### 🌍 Real-Time Example

```typescript
// Persisted order status: string enum maps cleanly to DB text column
enum OrderStatus {
  Pending = "PENDING",
  Paid = "PAID",
  Shipped = "SHIPPED",
  Cancelled = "CANCELLED",
}

function canRefund(status: OrderStatus): boolean {
  return status === OrderStatus.Paid || status === OrderStatus.Shipped;
}

// Prefer const object + union for new code:
const OrderStatus2 = {
  Pending: "PENDING",
  Paid: "PAID",
} as const;
type OrderStatus2 = (typeof OrderStatus2)[keyof typeof OrderStatus2];
```

### Computed and constant enum members

Numeric enum members may use **compile-time constant** expressions. **`const enum`** erases the enum object at emit time and **inlines** numbers/strings—consumers without TS may not see a runtime enum.

### 🟢 Beginner Example

```typescript
enum Size {
  Small = 10,
  Medium = Small + 5,
  Large = Medium + 10,
}
```

### 🟡 Intermediate Example

```typescript
const FACTOR = 2 as const;
enum Scale {
  A = 1,
  B = FACTOR * 2,
}
```

### 🔴 Expert Example

```typescript
const enum Bits {
  Read = 1 << 0,
  Write = 1 << 1,
  Exec = 1 << 2,
}

function canRead(flags: number): boolean {
  return (flags & Bits.Read) !== 0;
}

// Analytics: const enum inlines — verify downlevel / consumer tooling
const enum DeliveryMode {
  Immediate = 0,
  Batched = 1,
}
function track(event: string, mode: DeliveryMode): void {
  void event;
  void mode;
}
```

**Numeric enums** emit a **reverse map** at runtime (`Direction[0] === "Up"`); **string enums** do not. For JSON or DB columns, **string enums** or **literal unions** usually fit better.

```typescript
enum N {
  A,
  B,
} // N[0] === "A" at runtime

enum Color {
  Red = "RED",
} // no reverse map for string members
```

---

## 7. Type Aliases

**`type`** introduces a name for any type expression: unions, primitives, tuples, mapped types, and more. **Generic aliases** parameterize shapes. **Recursive aliases** model trees (`JSON`, AST nodes). **`interface`** can be extended/merged; **`type`** cannot merge declarations but supports unions/intersections more naturally.

### 🟢 Beginner Example

```typescript
type UserId = string;
type Score = number;

type Player = {
  id: UserId;
  score: Score;
};
```

### 🟡 Intermediate Example

```typescript
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };

type UserDto = { id: string; name: string };
type UsersPayload = ApiResponse<readonly UserDto[]>;
```

### 🔴 Expert Example

```typescript
// Recursive JSON-like type
type Json =
  | string
  | number
  | boolean
  | null
  | { readonly [k: string]: Json }
  | readonly Json[];

type Tree<T> = {
  value: T;
  children?: readonly Tree<T>[];
};

const t: Tree<number> = { value: 1, children: [{ value: 2 }] };
```

### 🌍 Real-Time Example

```typescript
// Redux-style action union from generic factory pattern
type ActionMap<M extends Record<string, unknown>> = {
  [K in keyof M]: { type: K; payload: M[K] };
}[keyof M];

type AppActions = ActionMap<{
  "user/login": { token: string };
  "user/logout": undefined;
  "ui/toggleSidebar": boolean;
}>;

function reduce(_state: unknown, action: AppActions): void {
  switch (action.type) {
    case "user/login":
      void action.payload.token;
      break;
    case "user/logout":
      break;
    case "ui/toggleSidebar":
      void action.payload;
      break;
  }
}
```

### Type alias vs `interface`

**Interfaces** support **declaration merging** (same name augments). **Type aliases** can express **unions**, **mapped types**, and **tuple** aliases in one name. For plain object shapes, either works; libraries often export **interfaces** for extension.

### 🟢 Beginner Example

```typescript
interface IUser {
  id: string;
}
type TUser = {
  id: string;
};
```

### 🟡 Intermediate Example

```typescript
interface Box<T> {
  value: T;
}
type NullableBox<T> = Box<T> | null;

// interface NullableBox<T> = Box<T> | null; // invalid — interfaces cannot be unions
```

### 🔴 Expert Example

```typescript
interface Window {
  myLib?: { version: string };
}
// Second `interface Window` elsewhere merges

type Id = string & { readonly __brand: unique symbol };
// Cannot merge two `type Id` declarations
```

### 🌍 Real-Time Example

```typescript
// Public SDK: interface for consumers to `extends` / `implements`
export interface ClientOptions {
  baseUrl: string;
  timeoutMs?: number;
}

// Internal: alias for complex union of transport errors
type TransportError = { kind: "timeout" } | { kind: "http"; status: number };
```

---

## 8. Type Assertions

Assertions tell the compiler “trust me about this type.” Syntax: **`value as Type`** or **`<Type>value`** (the latter forbidden in TSX files). **`!`** asserts non-null/undefined. **Double assertion** `as unknown as T` escapes the type system—use rarely. **`as const`** is an assertion that narrows to literals.

### 🟢 Beginner Example

```typescript
const el = document.getElementById("root") as HTMLDivElement;
// Without assertion, el is HTMLElement | null
```

### 🟡 Intermediate Example

```typescript
type Legacy = { name: string } | string;

function getName(x: Legacy): string {
  if (typeof x === "string") return x;
  return x.name;
}

const raw: unknown = { name: "Ada" };
const person = raw as { name: string };
```

### 🔴 Expert Example

```typescript
// Angle-bracket form (non-TSX only)
const n = <number>(<unknown>"42"); // still wrong at runtime—illustration only

// Branded nominal typing via assertion boundary
type UserId = string & { readonly __brand: unique symbol };
function toUserId(id: string): UserId {
  return id as UserId;
}
```

### 🌍 Real-Time Example

```typescript
// DOM: narrowing canvas vs element
function setupCanvas(el: HTMLElement): void {
  if (!(el instanceof HTMLCanvasElement)) return;
  const ctx = el.getContext("2d"); // narrowed
  if (!ctx) return;
  ctx.fillStyle = "#000";
}

// Non-null when invariant enforced by app logic
function readConfig(): { apiKey: string } {
  const key = process.env.API_KEY!;
  return { apiKey: key };
}
```

### Angle-bracket (`<Type>value`), non-null (`!`), and double assertions

- **Angle brackets** work in **`.ts`** only; **`as`** is required in **`.tsx`** (JSX ambiguity).
- **`!`** strips `null`/`undefined` from the type with **no runtime check**.
- **`as unknown as T`** bridges **unrelated** types—keep inside small adapter functions.

### 🟢 Beginner Example

```typescript
declare const unknownValue: unknown;
const asString = <string>unknownValue; // same as: unknownValue as string

function badFirst(s: string | undefined): string {
  return s!.charAt(0); // unsafe if s is undefined
}
```

### 🟡 Intermediate Example

```typescript
declare const el: HTMLElement;
const canvas = el as HTMLCanvasElement;

const map = new Map<string, HTMLButtonElement>();
const btn = map.get("submit")!;

interface Dog {
  bark(): void;
}
declare const maybeCat: object;
const dog = maybeCat as unknown as Dog;
```

### 🔴 Expert Example

```typescript
function assert<T>(cond: T, msg?: string): asserts cond {
  if (!cond) throw new Error(msg ?? "assertion failed");
}

let x: string | undefined;
assert(x !== undefined);
void x.length; // prefer this over `!` when you can

type EUR = number & { readonly __brand: "EUR" };
type USD = number & { readonly __brand: "USD" };
function unsafeFx(u: USD): EUR {
  return u as unknown as EUR;
}
```

### 🌍 Real-Time Example

```typescript
function readData<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

declare const testFetch: typeof fetch;
(globalThis as unknown as { fetch: typeof testFetch }).fetch = testFetch;

const HTTP = { OK: 200, NOT_FOUND: 404 } as const;
type HttpStatus = (typeof HTTP)[keyof typeof HTTP];
// `as const` narrows literals (see [Literal Types](#5-literal-types)); it is not a double assertion
```

---

## 9. Type Narrowing

**Narrowing** refines a union in a branch using **`typeof`**, **truthiness**, **`===` / `!==`**, **`in`**, **`instanceof`**, **discriminated `switch`**, **assignments** (control-flow analysis), and **`never`** for exhaustiveness. Remember **`typeof null === "object"`**—use **`=== null`** when you care about null.

### 🟢 Beginner Example

```typescript
function printLen(x: string | undefined): void {
  if (x === undefined) return;
  console.log(x.length);
}

function pad(x: string | number): string {
  if (typeof x === "number") return String(x).padStart(3, "0");
  return x.padStart(3, " ");
}

type Cat = { meow: true };
type Dog = { bark: true };
function speak(pet: Cat | Dog): void {
  if ("meow" in pet) void pet.meow;
  else void pet.bark;
}

function formatDate(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : d;
}
```

### 🟡 Intermediate Example

```typescript
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

type Flags = { verbose?: boolean };
function isVerbose(f: Flags): boolean {
  return f.verbose === true;
}

type State = { tag: "idle" } | { tag: "busy"; job: string };
function label(s: State): string {
  switch (s.tag) {
    case "idle":
      return "ready";
    case "busy":
      return s.job;
  }
}
```

### 🔴 Expert Example

```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${JSON.stringify(x)}`);
}

type Msg = { t: "a"; n: number } | { t: "b"; s: string };
function handle(m: Msg): string {
  switch (m.t) {
    case "a":
      return m.n.toFixed(0);
    case "b":
      return m.s;
    default:
      return assertNever(m);
  }
}

let v: string | number = "hi";
if (typeof v === "string") {
  v = 1;
  void v.toFixed;
}

class PaymentError extends Error {
  code = "PAYMENT" as const;
}
function mapError(e: unknown): string {
  if (e instanceof PaymentError) return e.message;
  if (e instanceof Error) return e.message;
  return String(e);
}

function exhaust(x: never): never {
  throw new Error("missing case");
}
type U = { k: 1 } | { k: 2 };
function f(u: U): number {
  if (u.k === 1) return 10;
  if (u.k === 2) return 20;
  return exhaust(u);
}
```

### 🌍 Real-Time Example

```typescript
type Ok<T> = { ok: true; status: 200; body: T };
type Err = { ok: false; status: number; body: string };
type HttpResult<T> = Ok<T> | Err;

async function parseJson<T>(res: Response): Promise<HttpResult<T>> {
  if (res.status !== 200) {
    return { ok: false, status: res.status, body: await res.text() };
  }
  return { ok: true, status: 200, body: (await res.json()) as T };
}

function pickApiKey(primary: string | undefined, fallback: string | undefined): string | undefined {
  if (primary) return primary;
  if (fallback) return fallback;
  return undefined;
}

type Action =
  | { type: "SET_USER"; userId: string }
  | { type: "LOGOUT" };

function reduceUserId(state: string | null, a: Action): string | null {
  switch (a.type) {
    case "SET_USER":
      return a.userId;
    case "LOGOUT":
      return null;
    default: {
      const _n: never = a;
      return _n;
    }
  }
}
```

---

## 10. Template Literal Types

**Template literal types** build string types from unions of strings: `` `Hello, ${Name}` ``. Combine with **intrinsic string manipulators**: **`Uppercase<T>`**, **`Lowercase<T>`**, **`Capitalize<T>`**, **`Uncapitalize<T>`** for consistent API surface typing (routes, event names, CSS variables).

### 🟢 Beginner Example

```typescript
type Greeting = `Hello, ${string}`;
const g: Greeting = "Hello, world";
```

### 🟡 Intermediate Example

```typescript
type HttpMethod = "GET" | "POST";
type Path = "/users" | "/orders";
type Route = `${HttpMethod} ${Path}`;
// "GET /users" | "GET /orders" | "POST /users" | "POST /orders"

type Prop = "color" | "size";
type Token = `--${Prop}`;
// "--color" | "--size"
```

### 🔴 Expert Example

```typescript
type EventName = "click" | "focus";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus"

type CssVar = `--theme-${Lowercase<"Primary" | "Secondary">}`;
// "--theme-primary" | "--theme-secondary"

// Distributive behavior over unions
type S = Uppercase<"a" | "b">; // "A" | "B"
```

### 🌍 Real-Time Example

```typescript
// Typed event bus: channel names derived from domain verbs + entities
type Entity = "user" | "order";
type Verb = "created" | "updated" | "deleted";
type Channel = `${Entity}.${Verb}`;

type MessageOf<C extends Channel> = C extends `${infer E}.${infer V}`
  ? { entity: E; verb: V; at: string }
  : never;

function publish<C extends Channel>(_channel: C, _msg: MessageOf<C>): void {
  // kafka / redis publish
}

publish("user.created", { entity: "user", verb: "created", at: new Date().toISOString() });
```

### Intrinsic string manipulators

TypeScript provides **`Uppercase<T>`**, **`Lowercase<T>`**, **`Capitalize<T>`**, and **`Uncapitalize<T>`** for types. They distribute over unions. Use them for **consistent naming** (event handlers, CSS vars, i18n keys).

### 🟢 Beginner Example

```typescript
type Shout = Uppercase<"hello">; // "HELLO"
type Whisper = Lowercase<"HELLO">; // "hello"
```

### 🟡 Intermediate Example

```typescript
type Field = "name" | "email";
type Getter = `get${Capitalize<Field>}`;
// "getName" | "getEmail"

type Setter = `set${Capitalize<Field>}`;
type Api = Getter | Setter;
```

### 🔴 Expert Example

```typescript
type CamelToGetter<T extends string> = T extends `${infer Head}${infer Tail}`
  ? `on${Capitalize<Head>}${Tail}`
  : never;

type E = CamelToGetter<"click">; // "onClick"

type Prefixed = `data-${Lowercase<"ITEM" | "LIST">}`;
// "data-item" | "data-list"

type ThemeKey = "primaryFg" | "primaryBg";
type CssCustomProp = `--app-${Uncapitalize<ThemeKey>}`;
// "--app-primaryFg" | "--app-primaryBg"
```

### `infer` inside template literal types

**`infer`** captures parts of a string when a **pattern** matches—useful for stripping suffixes, splitting paths, or building RPC names. Combinations can grow large; keep unions small.

### 🟢 Beginner Example

```typescript
type Suffix = "_id";
type StripId<T extends string> = T extends `${infer Base}${Suffix}` ? Base : T;
type T1 = StripId<"user_id">; // "user"
```

### 🟡 Intermediate Example

```typescript
type Versioned = `v${number}`;
type IsV = "v1" extends Versioned ? true : false; // true

type Segments<S extends string> = S extends `${infer A}/${infer B}`
  ? A | Segments<B>
  : S;
type ApiPath = Segments<"api/v1/users">; // "api" | "v1" | "users"
```

### 🔴 Expert Example

```typescript
type QueryPair<S extends string> = S extends `${infer K}=${infer V}` ? [K, V] : never;
type Pair = QueryPair<"sort=asc">; // ["sort", "asc"]
```

### 🌍 Real-Time Example

```typescript
type Ns = "auth" | "billing";
type Method = "login" | "charge";
type Rpc = `${Ns}.${Method}`;

function call<M extends Rpc>(_m: M, _payload: unknown): void {
  /* transport */
}
```

---

## Best Practices

- Prefer **discriminated unions** over loose unions when modeling variants with different payloads.
- Use **`readonly`** on data that should not be mutated across module boundaries (DTOs, config).
- Default to **literal unions** or **`as const` objects** instead of enums when you do not need reverse mapping or a stable emitted object.
- **Narrow** with `typeof`, `in`, and `switch` before accessing type-specific members; reserve **`as`** for well-defined boundaries (DOM, parsers).
- Use **template literal types** for **API routes**, **event names**, and **CSS custom properties** to keep strings and types in sync.
- For recursive structures (JSON, trees), define **recursive type aliases** once and reuse instead of repeating `any`.
- When combining types, choose **`&`** for independent requirements; avoid impossible intersections (`string & number`).
- Enable **`strictNullChecks`** so narrowing and `undefined` handling stay honest.

---

## Common Mistakes to Avoid

- **Asserting instead of validating**: `as MyType` on `unknown` from `fetch` does not make runtime data correct—pair with validation (zod, io-ts, etc.).
- **Overusing `any`**: bypasses unions and narrowing; use `unknown` and narrow.
- **Mutating readonly tuples** created with `as const` by casting away readonly—defeats the guarantee.
- **Relying on excess property checks** for all objects: checks apply to **fresh** object literals, not arbitrary variables assigned earlier.
- **Confusing `enum` with union**: merging, const enum inlining, and reverse numeric mappings surprise teams; prefer unions for new TS code unless enums are a team standard.
- **Double assertions** (`as unknown as T`) masking real incompatibilities—document and isolate in adapter functions.
- **Template literal explosion**: huge unions of template combinations can slow the compiler; keep unions small or use simpler string types.

---

## Comparison Table

| Feature | What it does | Typical use | Watch out for |
|--------|----------------|-------------|----------------|
| **Object type** | Fixed property set + optional/readonly | DTOs, props | Excess property checks only on fresh literals |
| **`T[]` vs `Array<T>`** | Same array type, two spellings | Collections | Pick one style per codebase |
| **`readonly` array** | No mutating array methods | Immutable data | Need mutable copy to `.push` |
| **Tuple** | Fixed length/positions | Coordinates, `[value, setter]` | Optional/rest ordering rules |
| **Union `|`** | Either type | Results, variants | Narrow before use |
| **Intersection `&`** | Must satisfy both | Mixins, `fn & { meta }` | Conflicts become `never` |
| **Literal type** | Exact primitive value | Discriminants, flags | Widening on `let` without annotation |
| **`as const`** | Freeze literals/readonly tuple | Config, route tables | Deep readonly surprises |
| **`enum`** | Named constants object | Legacy interop, string columns | Merge behavior, `const enum` pitfalls |
| **`type` alias** | Name any type expression | Unions, generics | No declaration merge |
| **`interface`** | Object shape, extend/merge | Public APIs, OOP | Cannot express all unions cleanly |
| **`as` assertion** | Override static type | DOM, parser output | No runtime effect |
| **`!` assertion** | Non-null/undefined | Invariants | Crashes if wrong |
| **Narrowing** | Smaller type in branch | Unions, `unknown` | Discriminant typos break exhaustiveness |
| **Template literal type** | String pattern from unions | Events, CSS vars | Compiler performance on huge unions |

---

*TypeScript 5.x-oriented notes. Use `strict` in `tsconfig.json` for the behaviors above.*
