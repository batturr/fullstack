# TypeScript Best Practices

This guide collects team-oriented conventions for maintainable TypeScript: structure, naming, type design, and compiler settings. Each topic has **Beginner → Intermediate → Expert → Real-Time** examples (production-shaped APIs and configs).

---

## 📑 Table of Contents

1. [Type Safety](#1-type-safety)
2. [Code Organization](#2-code-organization)
3. [Naming Conventions](#3-naming-conventions)
4. [Type Design](#4-type-design)
5. [Function Best Practices](#5-function-best-practices)
6. [Class Best Practices](#6-class-best-practices)
7. [Error Handling](#7-error-handling)
8. [Performance](#8-performance)
9. [Testing](#9-testing)
10. [Documentation](#10-documentation)
11. [Quick Reference Checklist](#quick-reference-checklist)

---

## 1. Type Safety

**Principles:** Treat `any` as a last resort; use `unknown` and narrow before use. Turn on **`strict`** (and related flags) so mistakes surface early. Let inference do the heavy lifting, but add annotations at module boundaries. Use **`as const`** for literal fidelity. Prefer **discriminated unions** (string literal `kind` fields) over numeric enums when you want exhaustiveness without extra runtime objects.

### 🟢 Beginner Example

```typescript
// Avoid `any` — it disables checking for this value.
function badParse(input: any) {
  return input.foo; // no error even if `foo` does not exist
}

// Prefer `unknown` and check before use.
function goodParse(input: unknown) {
  if (typeof input === "object" && input !== null && "foo" in input) {
    const o = input as { foo: string };
    return o.foo;
  }
  throw new Error("Invalid shape");
}

const count = 3; // number
const message = "ok"; // string
```

### 🟡 Intermediate Example

```typescript
// Const assertion: preserve literal types and readonly tuples.
const routes = ["/home", "/settings"] as const;
type Route = (typeof routes)[number]; // "/home" | "/settings"

const config = {
  apiUrl: "https://api.example.com",
  retries: 2,
} as const;

// Discriminated union instead of enum for event kinds.
type UiEvent =
  | { kind: "click"; x: number; y: number }
  | { kind: "keydown"; key: string };

function handleEvent(e: UiEvent) {
  switch (e.kind) {
    case "click":
      return e.x + e.y;
    case "keydown":
      return e.key.length;
    default: {
      const _exhaustive: never = e;
      return _exhaustive;
    }
  }
}
```

### 🔴 Expert Example

```typescript
// Narrow `unknown` with a type predicate reusable across the codebase.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readId(body: unknown): string {
  if (!isRecord(body) || typeof body.id !== "string") {
    throw new TypeError("body.id must be a string");
  }
  return body.id;
}

// Const type parameter (TS 5.0+) for literal preservation in generic helpers.
function tuple<const T extends readonly unknown[]>(...args: T): T {
  return args;
}
const t = tuple("a", 1); // readonly ["a", 1]
```

### 🌍 Real-Time Example

```typescript
// WebSocket / SSE: validate unknown payloads at the edge.
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

type ServerPush =
  | { type: "price"; symbol: string; cents: number }
  | { type: "heartbeat"; at: string };

function isServerPush(x: unknown): x is ServerPush {
  if (!isRecord(x) || typeof x.type !== "string") return false;
  if (x.type === "price") {
    return typeof x.symbol === "string" && typeof x.cents === "number";
  }
  if (x.type === "heartbeat") {
    return typeof x.at === "string";
  }
  return false;
}

export function onSocketMessage(raw: unknown, dispatch: (m: ServerPush) => void) {
  if (!isServerPush(raw)) {
    console.warn("Dropped invalid message");
    return;
  }
  dispatch(raw);
}
```

---

## 2. Code Organization

**Principles:** Organize by **feature/domain**; use **barrels** (`index.ts`) at package or feature edges and avoid circular re-exports. Split **`*.types.ts`** from runtime modules; colocate **`.d.ts`** with JS or centralize ambient modules.

### 🟢 Beginner Example

```typescript
// src/features/auth/authTypes.ts
export type Credentials = { email: string; password: string };

// src/features/auth/index.ts — barrel re-exports public surface
export type { Credentials } from "./authTypes";
export { login } from "./authApi";
```

### 🟡 Intermediate Example

```typescript
// Module boundary: consumers import from '@app/auth', not deep paths.
// packages/auth/src/index.ts
export type { Session, Credentials } from "./types";
export { createSession, revokeSession } from "./sessionService";

// Avoid circular barrels: if A imports B and B imports A through index,
// import concrete modules inside the package instead of the package root.
```

### 🔴 Expert Example

```typescript
// Split "runtime" and "compile-time only" for tree-shaking clarity.
// session.types.ts — interfaces/types only, no side effects
export interface SessionClaims {
  sub: string;
  exp: number;
}

// session.ts — imports types with `import type` where possible (see Performance)
import type { SessionClaims } from "./session.types";

export function decodeClaims(token: string): SessionClaims {
  // ... parse JWT, validate — illustrative
  return JSON.parse(atob(token.split(".")[1]!)) as SessionClaims;
}
```

### 🌍 Real-Time Example

```typescript
// packages/logger/src/index.ts — public package API only
export { createLogger } from "./createLogger";
export type { LogLevel, Logger } from "./types";
// internal/formatters.ts is not re-exported

// types/legacy-widget.d.ts — ambient module for untyped JS dependency
declare module "legacy-widget" {
  export function mount(selector: string): void;
}
```

---

## 3. Naming Conventions

**Principles:** `PascalCase` for interfaces/types; **`I` prefix** is optional—many teams drop it for readability. Generics: **`T`**, **`K`/`V`**, **`E`**, or **`TItem`**-style when unclear. **Files:** pick `camelCase` or `kebab-case` repo-wide. **Enums vs** `as const` object + union—pick one style and document it.

### 🟢 Beginner Example

```typescript
// Interface without "I" prefix (common modern style)
interface User {
  id: string;
  displayName: string;
}

// Type alias for a union
type Status = "idle" | "loading" | "error";

// Simple generic
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### 🟡 Intermediate Example

```typescript
// Multiple generics: prefer meaningful names when clarity beats brevity.
function mapBy<K extends PropertyKey, V, R>(
  items: V[],
  keyFn: (item: V) => K,
  mapFn: (item: V) => R
): Record<K, R> {
  const out = {} as Record<K, R>;
  for (const item of items) {
    out[keyFn(item)] = mapFn(item);
  }
  return out;
}

// File naming examples (pick one convention repo-wide):
// userService.ts
// user-repository.ts
```

### 🔴 Expert Example

```typescript
// Const object + type instead of enum — names mirror domain language.
const HttpVerb = {
  Get: "GET",
  Post: "POST",
} as const;

type HttpVerb = (typeof HttpVerb)[keyof typeof HttpVerb];

function request(method: HttpVerb, url: string) {
  // method is "GET" | "POST"
}

// When you keep `I` prefix (legacy codebase), stay consistent; do not mix styles.
```

### 🌍 Real-Time Example

```typescript
// OpenAPI-generated types often use PascalCase models; align hand-written code.
// types/api/OrderDto.ts
export interface OrderDto {
  orderId: string;
  lineItems: { sku: string; quantity: number }[];
}

// Adapter layer uses domain names, not DTO names in public functions.
import type { OrderDto } from "./api/OrderDto";

export interface Order {
  id: string;
  items: { sku: string; qty: number }[];
}

export function toDomainOrder(dto: OrderDto): Order {
  return {
    id: dto.orderId,
    items: dto.lineItems.map((li) => ({ sku: li.sku, qty: li.quantity })),
  };
}
```

---

## 4. Type Design

**Principles:** **`interface`** for extendable objects; **`type`** for unions, mapped/conditional types. **`readonly`** / `ReadonlyArray` for immutability. **`?` vs `| undefined`** differ under `exactOptionalPropertyTypes`. Use **`undefined`** for “missing”; **`null`** when APIs/DB use null. **Branded types** distinguish validated strings/IDs at compile time.

### 🟢 Beginner Example

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

// Optional property — caller may omit `middleName`
interface Person {
  name: string;
  middleName?: string;
}

// Readonly array type
const names: readonly string[] = ["Ada", "Alan"];
```

### 🟡 Intermediate Example

```typescript
// Prefer type for unions
type Shape = { kind: "circle"; radius: number } | { kind: "rect"; w: number; h: number };

// Optional vs undefined (with strictOptionalPropertyTypes in mind)
type A = { x?: number }; // property can be absent
type B = { x: number | undefined }; // property must exist, may be undefined

// Branded nominal-ish string
type Email = string & { readonly __brand: unique symbol };
function assertEmail(s: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new Error("bad email");
  return s as Email;
}

function sendWelcome(to: Email) {
  // cannot pass plain string
}
```

### 🔴 Expert Example

```typescript
// Interface extension for evolving public API
interface BaseConfig {
  readonly env: "dev" | "prod";
}

interface AppConfig extends BaseConfig {
  readonly apiBaseUrl: string;
}

// Recursive readonly deep type (illustrative pattern)
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
```

### 🌍 Real-Time Example

```typescript
// IDs from different tables should not be interchangeable at compile time.
type UserId = string & { readonly __brand: "UserId" };
type OrgId = string & { readonly __brand: "OrgId" };

function userIdFromDb(raw: string): UserId {
  return raw as UserId;
}

function fetchMembership(userId: UserId, orgId: OrgId) {
  // query...
}

// Null from SQL vs undefined from JSON — model both explicitly
interface Row {
  nickname: string | null; // DB column nullable
}

interface ClientPayload {
  nickname?: string; // may be omitted in JSON
}
```

---

## 5. Function Best Practices

**Principles:** **Explicit return types** on exports/public methods. Avoid heavy **overloads**; prefer unions/generics. **Rest parameters** over `arguments`. **Type guards** and **assertion functions** for `unknown`.

### 🟢 Beginner Example

```typescript
// Public API: explicit return type
export function add(a: number, b: number): number {
  return a + b;
}

// Rest parameters
function sum(...values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

// Type guard
function isString(x: unknown): x is string {
  return typeof x === "string";
}
```

### 🟡 Intermediate Example

```typescript
// Prefer one union-typed parameter over overload sets when behavior is uniform.
type Formattable = string | number | boolean;
function formatAny(value: Formattable): string {
  return String(value);
}
```

### 🔴 Expert Example

```typescript
// Assertion function for input validation
function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) throw new Error(msg);
}

function parsePositive(n: unknown): number {
  assert(typeof n === "number" && n > 0, "expected positive number");
  return n;
}

// Generic guard factory (use sparingly — keep readable)
const hasProp =
  <K extends string>(k: K) =>
  <T>(obj: T): obj is T & Record<K, unknown> =>
    typeof obj === "object" && obj !== null && k in obj;
```

### 🌍 Real-Time Example

```typescript
// Express-style handler: narrow body once, pass typed object down
import type { Request, Response } from "express";

type CreateItemBody = { title: string; quantity: number };

function isCreateItemBody(x: unknown): x is CreateItemBody {
  if (!isRecord(x)) return false;
  return typeof x.title === "string" && typeof x.quantity === "number";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createItemHandler(req: Request, res: Response) {
  if (!isCreateItemBody(req.body)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const body: CreateItemBody = req.body;
  // ... service layer gets a known shape
  res.status(201).json({ id: "new", title: body.title });
}
```

---

## 6. Class Best Practices

**Principles:** **Composition** over deep inheritance. **`#` private fields** for runtime privacy. **Initialize all properties** for `strictPropertyInitialization`. Avoid **`protected`** unless subclass extension is intentional.

### 🟢 Beginner Example

```typescript
class Counter {
  #value = 0;

  increment(): void {
    this.#value += 1;
  }

  getValue(): number {
    return this.#value;
  }
}
```

### 🟡 Intermediate Example

```typescript
// Composition: logger injected, not inherited
interface Logger {
  info(msg: string): void;
}

class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly db: { findUser(id: string): Promise<{ name: string } | null> }
  ) {}

  async getDisplayName(id: string): Promise<string> {
    const user = await this.db.findUser(id);
    if (!user) {
      this.logger.info(`missing user ${id}`);
      return "Guest";
    }
    return user.name;
  }
}
```

### 🔴 Expert Example

```typescript
// Initialize all fields — satisfies strictPropertyInitialization
class JobRunner {
  private readonly queue: string[];
  private isRunning: boolean;

  constructor(initial: string[]) {
    this.queue = [...initial];
    this.isRunning = false;
  }
}
```

### 🌍 Real-Time Example

```typescript
// Payment adapter: compose gateways instead of subclassing each provider
interface PaymentGateway {
  charge(amountCents: number, token: string): Promise<{ id: string }>;
}

class CheckoutService {
  constructor(private readonly gateway: PaymentGateway) {}

  async checkout(amountCents: number, token: string) {
    const receipt = await this.gateway.charge(amountCents, token);
    return receipt.id;
  }
}

// StripePaymentGateway implements PaymentGateway in another module — no inheritance tree
```

---

## 7. Error Handling

**Principles:** In **`catch`**, the caught value is **`unknown`** in strict modern TS—narrow before use. Define **custom error classes** sparingly but consistently (name, `cause`, codes). **Result types** (`{ ok: true, value } | { ok: false, error }`) make expected failures explicit without exceptions. **Error unions** on return types work well for domain-specific outcomes.

### 🟢 Beginner Example

```typescript
try {
  JSON.parse("{}");
} catch (e: unknown) {
  if (e instanceof Error) {
    console.error(e.message);
  } else {
    console.error("Unknown error", e);
  }
}
```

### 🟡 Intermediate Example

```typescript
class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "AppError";
  }
}
```

### 🔴 Expert Example

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, "division_by_zero"> {
  if (b === 0) return { ok: false, error: "division_by_zero" };
  return { ok: true, value: a / b };
}

function useDivide() {
  const r = divide(10, 0);
  if (!r.ok) {
    // handle "division_by_zero"
    return;
  }
  console.log(r.value);
}
```

### 🌍 Real-Time Example

```typescript
type FetchUserError = "not_found" | "network" | "unauthorized";

type FetchUserResult =
  | { ok: true; user: { id: string; name: string } }
  | { ok: false; error: FetchUserError };

export async function fetchUser(id: string): Promise<FetchUserResult> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (res.status === 404) return { ok: false, error: "not_found" };
    if (res.status === 401) return { ok: false, error: "unauthorized" };
    const user = (await res.json()) as { id: string; name: string };
    return { ok: true, user };
  } catch {
    return { ok: false, error: "network" };
  }
}
```

---

## 8. Performance

**Principles:** Extremely **deep conditional or mapped types** can slow `tsc` and the language service—materialize intermediate type aliases. Use **project references** to split compilation graphs in large repos. Tune **`tsconfig`**: `skipLibCheck`, incremental builds, consistent `module`/`moduleResolution`. Prefer **`import type`** for type-only imports to avoid emitting unnecessary runtime imports (and to clarify intent).

### 🟢 Beginner Example

```typescript
// type-only import — erased from JS output when isolatedModules / verbatimModuleSyntax align
import type { User } from "./types";

export function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

### 🟡 Intermediate Example

```typescript
// Mirrors tsconfig.json — copy keys into compilerOptions / references
const compilerOptions = {
  incremental: true,
  skipLibCheck: true,
  strict: true,
  module: "NodeNext",
  moduleResolution: "NodeNext",
  verbatimModuleSyntax: true,
} as const;

const projectReferences = [{ path: "./packages/shared" }] as const;
```

### 🔴 Expert Example

```typescript
// Break up complex conditional type into named aliases (faster to check, easier to read)
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

// Instead of one giant nested conditional, compose:
type NotNull<T> = T extends null ? never : T;
```

### 🌍 Real-Time Example

```typescript
// Composite package + references: packages/shared ("composite": true), apps/web references it.
// CI: `tsc -b packages/shared apps/web`

import type { HeavyDto } from "./dto";
export function toViewModel(dto: HeavyDto) {
  return { title: dto.title };
}
```

---

## 9. Testing

**Principles:** Type **test helpers** and **factories** so fixtures stay in sync with production types. **Mocks** should implement **minimal interfaces** (`Pick`, `Partial`, or custom test-only types). Add **compile-time tests** with `expectTypeOf` or assignment to `never` patterns when using testing libraries that support them. Avoid **`any`** in tests—use `unknown` + guards or `satisfies` to keep assertions honest.

### 🟢 Beginner Example

```typescript
import type { User } from "../src/user";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Test User",
    ...overrides,
  };
}

const u = makeUser({ name: "Ada" });
```

### 🟡 Intermediate Example

```typescript
// Mock only what the test needs
type DbPort = {
  findById(id: string): Promise<{ id: string } | null>;
};

function createMockDb(overrides: Partial<DbPort> = {}): DbPort {
  return {
    async findById() {
      return null;
    },
    ...overrides,
  };
}
```

### 🔴 Expert Example

```typescript
// Compile-time equality check (no test lib required)
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type _check = Equal<Pick<{ id: string; name: string }, "id">, { id: string }> extends true ? true : never;
```

### 🌍 Real-Time Example

```typescript
import { describe, it, expect } from "vitest";

type ChargeFn = (amount: number, token: string) => Promise<{ id: string }>;

const mockGateway = {
  async charge(_amount: number, _token: string) {
    return { id: "ch_123" };
  },
} satisfies { charge: ChargeFn };

describe("checkout", () => {
  it("charges the gateway", async () => {
    const charge: ChargeFn = async () => ({ id: "x" });
    expect(await charge(1000, "tok")).toEqual({ id: "x" });
  });
});
```

---

## 10. Documentation

**Principles:** Use **JSDoc** on public exports for IDE hover text and for `.d.ts` generation from JS. Types themselves are documentation—**name** fields precisely. Provide **`@example`** blocks for non-obvious utilities. **`@template`** documents generics in JSDoc-first JS projects.

### 🟢 Beginner Example

```typescript
/**
 * Returns the full name for display.
 * @param first - Given name
 * @param last - Family name
 */
export function fullName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}
```

### 🟡 Intermediate Example

```typescript
/**
 * Parses a non-negative integer from a string.
 * @throws {RangeError} if the value is negative or not an integer
 * @example
 * parsePositiveInt("42") // => 42
 */
export function parsePositiveInt(s: string): number {
  const n = Number(s);
  if (!Number.isInteger(n) || n < 0) throw new RangeError("expected positive int");
  return n;
}
```

### 🔴 Expert Example

```typescript
/**
 * Map items by key; duplicate keys merged with `combine`.
 * @template T Element @template K Key type
 */
export function mergeMapBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T) => K,
  combine: (a: T, b: T) => T
): Readonly<Record<K, T>> {
  const out = {} as Record<K, T>;
  for (const item of items) {
    const k = keyOf(item);
    out[k] = out[k] === undefined ? item : combine(out[k], item);
  }
  return out;
}
```

### 🌍 Real-Time Example

```typescript
/**
 * HTTP client wrapper for our public API.
 * @example
 * ```ts
 * const client = createApiClient({ baseUrl: "https://api.example.com" });
 * const user = await client.getUser("user_123");
 * ```
 */
export interface ApiClient {
  getUser(id: string): Promise<{ id: string; email: string }>;
}

export function createApiClient(options: { baseUrl: string }): ApiClient {
  return {
    async getUser(id: string) {
      const res = await fetch(`${options.baseUrl}/users/${id}`);
      if (!res.ok) throw new Error(`getUser failed: ${res.status}`);
      return (await res.json()) as { id: string; email: string };
    },
  };
}
```

---

## Quick Reference Checklist

**Type safety**

- [ ] `strict` (and related flags) enabled in `tsconfig`
- [ ] No `any` in new code; use `unknown` + narrowing
- [ ] `as const` for literal configs and route tables
- [ ] Discriminated unions for variant data; exhaustiveness checked with `never`

**Code organization**

- [ ] Feature or domain folders; avoid mega `types.ts` without structure
- [ ] Barrel `index.ts` only at package or feature boundaries; watch for cycles
- [ ] `import type` for type-only dependencies at module boundaries
- [ ] `.d.ts` colocated with JS or centralized for third-party gaps

**Naming**

- [ ] Consistent interface/type `PascalCase`; team rule on `I` prefix
- [ ] Generics: `T`/`K`/`V` or descriptive `TItem` when needed
- [ ] File naming convention agreed (camelCase vs kebab-case)
- [ ] Enums vs const objects + union documented and consistent

**Type design**

- [ ] `interface` for extendable object shapes; `type` for unions and advanced types
- [ ] `readonly` / `Readonly` where mutation is not part of the API
- [ ] Clear model of `null` (external/DB) vs `undefined` (optional/absent)
- [ ] Branded types for IDs and validated strings when confusion is costly

**Functions**

- [ ] Explicit return types on exported/public functions
- [ ] Prefer simple signatures over large overload sets
- [ ] Rest parameters instead of `arguments`
- [ ] Type guards and assertion functions for `unknown` boundaries

**Classes**

- [ ] Composition over inheritance; shallow hierarchies
- [ ] `#private` fields when runtime privacy matters
- [ ] All properties initialized; avoid leaking half-constructed state
- [ ] `protected` only when subclassing is intentional and documented

**Errors**

- [ ] `catch (e: unknown)` with narrowing
- [ ] Custom errors with `code` / `cause` when operational distinction matters
- [ ] `Result` types or error unions for expected failure paths in domain layer

**Performance**

- [ ] Split huge projects with project references / solution-style builds
- [ ] Pragmatic `tsconfig` (`incremental`, `skipLibCheck` where appropriate)
- [ ] Avoid pathological nested types; extract aliases
- [ ] `import type` / `verbatimModuleSyntax` aligned with bundler expectations

**Testing**

- [ ] Factories typed with `Partial<T>` or builders
- [ ] Mocks implement narrow interfaces
- [ ] No `any` in assertions; `unknown` + guards or typed stubs
- [ ] Optional compile-time type tests for critical utilities

**Documentation**

- [ ] JSDoc on public exports (`@param`, `@returns`, `@throws`, `@example`)
- [ ] Types and names self-document; avoid redundant comments
- [ ] Example snippets reflect real call patterns

---

*Adapt this baseline to your repo’s TypeScript version and style guide.*
