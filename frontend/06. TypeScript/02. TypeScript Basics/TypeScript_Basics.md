# TypeScript Basics

TypeScript is a structural, gradually typed superset of JavaScript that adds static types, rich editor tooling, and compile-time checks. This guide focuses on how you configure the compiler, which types exist and when to use them, and how declarations interact with inference—skills you use daily in real applications.

## 📑 Table of Contents

1. [TypeScript Configuration (`tsconfig.json`)](#1-typescript-configuration-tsconfigjson)
2. [Basic Types](#2-basic-types)
3. [Variable Declarations](#3-variable-declarations)
4. [Best Practices](#4-best-practices)
5. [Common Mistakes to Avoid](#5-common-mistakes-to-avoid)

---

## 1. TypeScript Configuration (`tsconfig.json`)

### 1.1 What `tsconfig.json` is and how to generate it

`tsconfig.json` is the **root configuration** for a TypeScript project. It tells the compiler which files belong to the program, which JavaScript version to emit, how modules resolve, and how strict the type checker should be. The TypeScript compiler (`tsc`) discovers this file automatically when you run it in a directory (or via `-p`).

**Generate a starter file:**

```bash
npx tsc --init
```

This creates a `tsconfig.json` with common options commented out. You then uncomment or edit values for your app or library.

### 🟢 Beginner Example

A minimal project that only compiles files in `src/` to `dist/` as CommonJS for Node:

```typescript
// src/hello.ts
export function greet(name: string): string {
  return `Hello, ${name}`;
}
```

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  },
  "include": ["src"]
}
```

### 🟡 Intermediate Example

Same project, but emitting ES modules and modern libs for a bundler:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "sourceMap": true,
    "declaration": true,
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src"]
}
```

### 🔴 Expert Example

Monorepo-style base config with path aliases consumed by both `tsc` and your bundler (paths often duplicated in bundler config):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": ".",
    "outDir": "dist",
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@app/*": ["packages/app/src/*"],
      "@shared/*": ["packages/shared/src/*"]
    }
  },
  "references": [{ "path": "./packages/shared" }, { "path": "./packages/app" }]
}
```

### 🌍 Real-Time Example

In production, teams keep **one strict `tsconfig.json` for type-checking** (often `tsconfig.json`) and sometimes a **`tsconfig.build.json`** that extends it with `declaration`, `declarationMap`, and stricter emit settings for publishing an npm package. CI runs `tsc --noEmit` or `tsc -p tsconfig.build.json` so broken types never reach `main`.

---

### 1.2 Annotated `tsconfig.json` (important options explained)

Below is a **single reference file** showing widely used `compilerOptions`. Adjust for your runtime (Node vs browser vs edge).

```json
{
  "compilerOptions": {
    /* Language & emit */
    "target": "ES2022",
    /* JS version emitted by tsc (not necessarily what your runtime supports if a bundler transpiles again). */

    "module": "ESNext",
    /* Output module format: commonjs, ESNext, NodeNext, etc. */

    "lib": ["ES2022", "DOM"],
    /* Type definitions for globals (Array, Promise, document, etc.). */

    "outDir": "dist",
    /* Where .js (and .d.ts if declaration: true) files go. */

    "rootDir": "src",
    /* Logical root for output folder structure. */

    "sourceMap": true,
    /* Emit .js.map for debugging original TS in devtools. */

    "declaration": true,
    /* Emit .d.ts so consumers get types for your package. */

    "declarationMap": true,
    /* Maps .d.ts back to .ts (better jump-to-definition in consuming projects). */

    /* Strictness (see next subsection for each flag in code) */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* Module resolution */
    "moduleResolution": "bundler",
    /* "node10" | "node" | "nodenext" | "bundler" — must align with module + runtime. */

    "esModuleInterop": true,
    /* Practical default interop with CommonJS default exports. */

    "resolveJsonModule": true,
    /* Allow import assertion / import of .json as modules where supported. */

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]

  /* Root "solution" style (optional): split builds with tsc -b
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/app" }
  ]
  */
}
```

> **Note:** The commented `references` block is illustrative—either use a normal `include`/`exclude` project **or** a root `references` setup as in §1.4, not both in one invalid file. Setting `"strict": true` enables most strict-family flags together. Individual flags below still matter when you need to toggle one behavior without turning all of `strict` off.

---

### 1.2.1 Compiler options in practice (`target`, `module`, `lib`, `outDir`, `rootDir`, `sourceMap`, `declaration`)

These notes pair with the JSON in §1.2: each option changes **what JavaScript is emitted**, **which globals are typed**, or **what extra artifacts** land on disk.

#### `target`

Sets the **ECMAScript version** for emitted syntax. Lower targets make `tsc` downlevel features (e.g. async/await, class fields); higher targets emit closer to what you wrote.

```typescript
// Emitted shape depends on target; type-checking is largely the same.
export async function fetchStatus(url: string): Promise<number> {
  const res = await fetch(url);
  return res.status;
}
```

#### `module`

Controls **module format** in output (`commonjs`, `ESNext`, `NodeNext`, etc.). Must align with how Node or your bundler loads files.

```typescript
import { createHash } from "node:crypto";

export function digest(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
```

#### `lib`

Tells the checker which **built-in type definitions** to include (e.g. `ES2022`, `DOM`). A Node-only config often omits `DOM` so accidental `window`/`document` usage fails at compile time.

```typescript
// With lib including "DOM", this type-checks in a browser project:
declare function getCanvas(): HTMLCanvasElement | null;

export function setup() {
  const el = getCanvas();
  if (el) el.getContext("2d");
}
```

#### `outDir` and `rootDir`

`rootDir` is the logical source root; `outDir` is where `.js` (and `.d.ts` when `declaration` is on) are written. The relative path from `rootDir` is preserved under `outDir`.

```text
# Example layout
src/features/auth/login.ts  →  dist/features/auth/login.js
```

#### `sourceMap`

When `true`, emits **source maps** (`.js.map`) so debuggers and stack traces can point to `.ts` lines. Typical for apps; library authors may also ship `declarationMap` for `.d.ts` → `.ts` navigation.

#### `declaration`

When `true`, emits **`.d.ts` declaration files** next to outputs so dependents get types without compiling your sources.

```typescript
/** Public API surface is what consumers see in .d.ts */
export interface User {
  id: string;
  displayName: string;
}

export function formatUser(u: User): string {
  return `${u.displayName} (${u.id})`;
}
```

### 🟢 Beginner Example

```json
{ "compilerOptions": { "target": "ES2020", "module": "commonjs", "outDir": "dist", "rootDir": "src", "sourceMap": true }, "include": ["src"] }
```

### 🟡 Intermediate Example

```json
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "lib": ["ES2022", "DOM"], "outDir": "build", "rootDir": "src", "sourceMap": true, "declaration": true }, "include": ["src"] }
```

### 🔴 Expert Example

```json
{ "compilerOptions": { "target": "ES2022", "module": "NodeNext", "moduleResolution": "NodeNext", "lib": ["ES2022"], "outDir": "dist", "rootDir": "src", "sourceMap": true, "declaration": true, "declarationMap": true, "composite": true }, "include": ["src"] }
```

### 🌍 Real-Time Example

Shipping an **npm library**: CI runs `tsc` with `declaration` + `declarationMap`, publishes `dist/**/*.js` and `dist/**/*.d.ts`, and consumers get accurate types in VS Code without cloning your repo. Apps often use `sourceMap: true` in staging and strip or omit maps in production bundles via the bundler.

---

### 1.3 Strict mode options—practical code for each flag

#### `strict` (umbrella)

Turning on `strict` enables the family of checks listed below (exact set can vary slightly by TS version; consult your version’s docs). Prefer **`"strict": true`** for new projects.

#### `noImplicitAny`

**Effect:** Parameters and locals that would become `any` from lack of annotation/inference are errors.

```typescript
// ❌ With noImplicitAny: true — implicit any on `x`
function double(x) {
  return x * 2;
}

// ✅ Explicit or inferred from usage in a typed context
function doubleGood(x: number): number {
  return x * 2;
}
```

#### `strictNullChecks`

**Effect:** `null` and `undefined` are not assignable to every type; you must model absence explicitly.

```typescript
function len(s: string) {
  return s.length;
}

// ❌ Might be undefined
declare const maybe: string | undefined;
// len(maybe);

// ✅ Narrow or use default
function safeLen(s: string | undefined): number {
  return (s ?? "").length;
}
```

#### `strictFunctionTypes`

**Effect:** Function types are checked **contravariantly** for parameters: a callback that must accept *all* values of a union is not satisfied by a function that only accepts a *narrower* parameter type.

```typescript
// Handler may receive string OR number — implementation must handle both.
type Handler = (value: string | number) => void;

// ❌ Not assignable under strictFunctionTypes: this only accepts string,
// but callers of Handler might pass a number.
// const bad: Handler = (value: string) => {
//   console.log(value.toUpperCase());
// };

// ✅ Parameter type is wide enough for every call site
const good: Handler = (value: string | number) => {
  if (typeof value === "string") console.log(value.toUpperCase());
  else console.log(value.toFixed(2));
};
```

**Method vs property:** assignability can differ when functions are declared as object methods; `strictFunctionTypes` applies to **function property** types in object types, not always to **methods** declared in interfaces in the same way—consult the [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) when modeling callbacks on interfaces.

#### `strictBindCallApply`

**Effect:** `bind`, `call`, and `apply` are typed; misuse is a type error.

```typescript
function add(a: number, b: number): number {
  return a + b;
}

const addOne = add.bind(null, 1);
const ok = addOne(2);

// const bad = add.bind(null, "nope");
```

#### `strictPropertyInitialization`

**Effect:** Class fields declared without definite assignment must be initialized in the constructor or marked definite.

```typescript
class User {
  // ❌ Not definitely assigned
  // id: number;

  // ✅ Constructor assignment
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  // ✅ Definite assignment assertion (use sparingly)
  email!: string;
}
```

#### `noImplicitThis`

**Effect:** `this` must have a known type in functions; loose `this` is an error.

```typescript
const counter = {
  count: 0,
  inc(this: { count: number }) {
    this.count += 1;
  },
};
```

#### `alwaysStrict`

**Effect:** Parses in strict mode and emits `"use strict"` for non-module targets where applicable.

```typescript
// With alwaysStrict, sloppy-mode pitfalls are reduced at parse/emit level.
export const x = 1;
```

### 🟢 Beginner Example (strict family)

```typescript
// Turn on strict in tsconfig; fix the easy issues first.
function greet(name: string | null): string {
  if (name === null) return "Hello";
  return `Hello, ${name}`;
}
```

### 🟡 Intermediate Example (strict family)

```typescript
interface Row {
  id: string;
  title: string | null;
}

function titleLen(row: Row): number {
  // strictNullChecks: can't treat title as string without narrowing
  return row.title?.length ?? 0;
}
```

### 🔴 Expert Example (strict family)

```typescript
class BufferPool {
  private pool: Uint8Array[];

  constructor(private readonly size: number) {
    this.pool = [];
  }

  acquire(): Uint8Array {
    return this.pool.pop() ?? new Uint8Array(this.size);
  }

  release(buf: Uint8Array): void {
    this.pool.push(buf);
  }
}
```

### 🌍 Real-Time Example (strict family)

Payment services use `strictNullChecks` so **optional fields** (`failureCode?`) are not dereferenced without checks—reducing runtime `Cannot read properties of undefined` in webhook handlers and database mappers.

---

### 1.4 Module resolution, path mapping, and project references

**Module resolution** decides how `import "./x"` or `import "pkg"` maps to files. Use **`NodeNext`/`Node16`** with `"module": "NodeNext"` for modern Node ESM, or **`bundler`** when a bundler resolves packages and extensions.

**Path mapping** (`baseUrl` + `paths`) rewrites import specifiers at type-check time; your runtime or bundler must apply the same mapping.

**Project references** split a codebase into buildable subgraphs with `tsc -b` for incremental builds.

### 🟢 Beginner Example

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

```typescript
// src/app.ts
import { clamp } from "@utils/math";

export const n = clamp(5, 0, 10);
```

### 🟡 Intermediate Example

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 🔴 Expert Example

`packages/shared/tsconfig.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src"]
}
```

Root `tsconfig.json`:

```json
{
  "files": [],
  "references": [{ "path": "./packages/shared" }, { "path": "./packages/app" }]
}
```

Build with:

```bash
tsc -b
```

### 🌍 Real-Time Example

Large apps use **project references** so changing shared types only rebuilds dependent packages. Path aliases like `@/features/*` keep imports stable when folders move, as long as Vite/Webpack/`tsc` configs stay aligned.

---

## 2. Basic Types

### 2.1 Primitive types

TypeScript models JavaScript’s runtime primitives. Use them for values that are not objects (with the usual JS caveats: `typeof null === "object"` historically).

| Type        | Example                         | Notes                                      |
| ----------- | ------------------------------- | ------------------------------------------ |
| `boolean`   | `true`, `false`                 | Logical flags                              |
| `number`    | `42`, `3.14`, `0xff`            | IEEE-754 double; no separate `int`         |
| `string`    | `"hi"`, `` `x` ``               | UTF-16 text                                |
| `null`      | `null`                          | Often paired with unions under strict null |
| `undefined` | `undefined`                     | Absent optional values                     |
| `symbol`    | `Symbol("id")`                  | Unique keys                                |
| `bigint`    | `10n`                           | Arbitrary-precision integers                 |

#### `boolean`

```typescript
const isActive: boolean = true;

function toggle(v: boolean): boolean {
  return !v;
}
```

#### `number`

```typescript
const count: number = 7;
const hex: number = 0xff;
const bin: number = 0b1010;

function avg(a: number, b: number): number {
  return (a + b) / 2;
}
```

#### `string`

```typescript
const name: string = "Ada";
const greeting: string = `Hello, ${name}`;

function initials(full: string): string {
  const parts = full.split(" ");
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}
```

#### `null`

Represents an **intentional absence** of an object reference. With `strictNullChecks`, `null` is not assignable to `string` unless you union it in.

```typescript
function findUser(id: string): { name: string } | null {
  if (id === "0") return null;
  return { name: "Ada" };
}

const u = findUser("1");
if (u !== null) console.log(u.name);
```

#### `undefined`

Means **value not provided** or **property missing**. Optional properties use `?`, which adds `undefined` to the read type.

```typescript
type Options = { timeout?: number };

function run(opts: Options): void {
  const ms = opts.timeout ?? 5000;
  console.log(ms);
}
```

When an API might return **either** “missing” or “explicitly empty,” combine unions: `string | null | undefined`, then normalize with `??` or explicit checks.

#### `symbol`

```typescript
const id = Symbol("userId");

type User = {
  name: string;
  [id]: string;
};

const u: User = { name: "A", [id]: "u_1" };
```

#### `bigint`

```typescript
const big: bigint = 1_000_000_000_000n;

function addBig(a: bigint, b: bigint): bigint {
  return a + b;
}

// Mixing bigint and number is a type error:
// const bad = 1n + 1;
```

### 🟢 Beginner Example

```typescript
const username: string = "dev";
const score: number = 100;
const done: boolean = false;
```

### 🟡 Intermediate Example

```typescript
type ID = string | symbol;

const cache = new Map<ID, number>();

function remember(key: ID, value: number): void {
  cache.set(key, value);
}
```

### 🔴 Expert Example

```typescript
declare const brandUserId: unique symbol;

type UserId = string & { readonly [brandUserId]: void };

function createUserId(raw: string): UserId {
  if (!/^usr_[a-z0-9]+$/.test(raw)) throw new Error("bad id");
  return raw as UserId;
}
```

### 🌍 Real-Time Example

API layers model IDs as **branded `string`** types (`OrderId`, `UserId`) so you cannot pass a user id where an order id is expected—catching integration bugs before deploy.

---

### 2.2 Special types: `any`, `unknown`, `void`, `never`

#### `any`

**Opt-out of type checking.** Use rarely—prefer `unknown` at boundaries.

```typescript
let value: any = JSON.parse("{}");
value.foo.bar; // allowed (unsafe)
```

#### `unknown`

**Type-safe top type.** You must narrow before use.

```typescript
function parse(input: string): unknown {
  return JSON.parse(input);
}

function useData(raw: string) {
  const data = parse(raw);
  if (typeof data === "object" && data !== null && "id" in data) {
    const id = (data as { id: unknown }).id;
    if (typeof id === "string") console.log(id);
  }
}
```

#### `void`

**Absence of a meaningful return value** (functions that return `undefined` for side effects).

```typescript
function logMessage(msg: string): void {
  console.log(msg);
}
```

#### `never`

**No value can exist**—unreachable code, exhaustive checks, or throwing functions.

```typescript
function fail(msg: string): never {
  throw new Error(msg);
}

type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.r * s.r;
    case "square":
      return s.s * s.s;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}
```

### 🟢 Beginner Example

```typescript
function printTwice(x: unknown): void {
  if (typeof x === "string") {
    console.log(x);
    console.log(x);
  }
}
```

### 🟡 Intermediate Example

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function unwrap<T>(r: Result<T>): T {
  if (r.ok) return r.value;
  return fail(r.error);
}
```

### 🔴 Expert Example

```typescript
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

function isJson(x: unknown): x is Json {
  if (
    x === null ||
    typeof x === "string" ||
    typeof x === "number" ||
    typeof x === "boolean"
  ) {
    return true;
  }
  if (Array.isArray(x)) return x.every(isJson);
  if (typeof x === "object") {
    return Object.values(x as object).every(isJson);
  }
  return false;
}
```

### 🌍 Real-Time Example

HTTP handlers treat `req.body` as **`unknown`**, validate with Zod/io-ts, and only then use typed DTOs—so malformed JSON cannot silently flow through the app as `any`.

---

### 2.3 Type annotations vs type inference

**Annotations** (`: Type`) state types explicitly. **Inference** lets TypeScript deduce types from initializers and control flow.

```typescript
// Inferred: number
const n = 42;

// Annotated: number | string (wider than inference would guess)
const id: number | string = 42;

// Inferred return type: string
function hello(name: string) {
  return `Hi ${name}`;
}

// Annotated return (useful for public APIs)
function version(): string {
  return "1.0.0";
}
```

### 🟢 Beginner Example

```typescript
// Inference from literal
const title = "TS Basics";

// Annotation when no initializer
let total: number;
total = 0;
```

### 🟡 Intermediate Example

```typescript
const users = [{ id: "1", name: "A" }];
// Inferred: { id: string; name: string }[]

type User = (typeof users)[number];
```

### 🔴 Expert Example

```typescript
declare function createStore<S>(): {
  getState(): S;
  setState(s: S): void;
};

// Explicit S when inference would collapse undesirably
const store = createStore<{ count: number; meta?: { trace: string } }>();
```

### 🌍 Real-Time Example

Libraries **annotate exported function signatures** while keeping internals mostly inferred—stable public types without noisy repetition inside private helpers.

---

### 2.4 When to annotate explicitly vs rely on inference

**Prefer inference when:**

- Local variables have clear initializers.
- Return types are obvious and you want refactors to propagate.

**Annotate when:**

- You export a public API (functions, classes, module-scope `const`).
- Inference widens undesirably (`let x = null` becoming `any` or over-wide unions).
- You implement an interface or satisfy a contract (`implements`, callbacks).
- Complex generics need a “source of truth” type parameter.

```typescript
interface Payment {
  amountCents: number;
  currency: "USD" | "EUR";
}

// Exported: explicit return type documents the contract
export function normalizePayment(p: unknown): Payment | null {
  if (typeof p !== "object" || p === null) return null;
  const amount = (p as { amountCents?: unknown }).amountCents;
  const currency = (p as { currency?: unknown }).currency;
  if (typeof amount !== "number") return null;
  if (currency !== "USD" && currency !== "EUR") return null;
  return { amountCents: amount, currency };
}
```

### 🟢 Beginner Example

```typescript
// Explicit for clarity when learning
const age: number = 30;
```

### 🟡 Intermediate Example

```typescript
// Inference for locals, explicit for exports
function helper(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}

export function publicSum(xs: number[]): number {
  return helper(xs);
}
```

### 🔴 Expert Example

```typescript
type Fn = (n: number) => string;

// Annotate parameter position to enforce contravariance expectations in callbacks
function run(f: Fn): string {
  return f(1);
}
```

### 🌍 Real-Time Example

Teams often enforce **explicit module boundary types** via ESLint (`@typescript-eslint/explicit-module-boundary-types`) while allowing inference inside files—balancing safety and noise.

---

## 3. Variable Declarations

### 3.1 `let` and `const` with types

- **`const`**: binding cannot be reassigned; value may still be mutated if it is an object/array.
- **`let`**: mutable binding; type is fixed unless you use a union or `any`.

```typescript
const pi = 3.14; // inferred literal type 3.14 (often widened by usage context)
let count = 0; // inferred number
count = 1;

const user = { name: "Ada" };
user.name = "Grace"; // ok: object is mutable
// user = { name: "B" }; // error: cannot reassign const binding
```

### 🟢 Beginner Example

```typescript
const appName: string = "MyApp";
let score: number = 0;
score += 10;
```

### 🟡 Intermediate Example

```typescript
let mode: "dev" | "prod" = "dev";
mode = "prod";

const flags = Object.freeze({ dark: true as const });
// flags.dark = false; // error
```

### 🔴 Expert Example

```typescript
function makeCounter() {
  let n = 0;
  return {
    inc(): void {
      n += 1;
    },
    read(): number {
      return n;
    },
  };
}
```

### 🌍 Real-Time Example

Configuration objects are often **`const`** with **`as const`** on literals so derived types stay narrow for feature flags and environment keys.

---

### 3.2 Type annotations on variables

```typescript
let title: string;
title = "Intro";

let maybe: string | undefined;
maybe = undefined;

const ids: readonly string[] = ["a", "b"];
```

### 🟢 Beginner Example

```typescript
const total: number = 10 + 20;
```

### 🟡 Intermediate Example

```typescript
type Theme = "light" | "dark";
let theme: Theme = "light";
```

### 🔴 Expert Example

```typescript
declare function fetchConfig(): Promise<unknown>;

let cached: Awaited<ReturnType<typeof fetchConfig>> | null = null;

async function getConfig() {
  if (cached) return cached;
  cached = await fetchConfig();
  return cached;
}
```

### 🌍 Real-Time Example

Feature modules declare **`let connection: DatabaseClient | null`** and initialize lazily—types document lifecycle without using `any` for the client handle.

---

### 3.3 Implicit vs explicit typing

**Implicit:** TypeScript infers from the right-hand side.

```typescript
const scores = [10, 20, 30]; // number[]
```

**Explicit:** You supply the type (or widen/narrow intentionally).

```typescript
const scores: Array<number | string> = [10, "bonus", 30];
```

**Common pitfall:** Empty array literal without context becomes `never[]` or `any[]` depending on settings—annotate when needed.

```typescript
const items: string[] = [];
items.push("a");
```

### 🟢 Beginner Example

```typescript
// Implicit
const name = "Ada";

// Explicit
const role: string = "engineer";
```

### 🟡 Intermediate Example

```typescript
type EventName = "click" | "hover";
const handlers: Record<EventName, () => void> = {
  click: () => {},
  hover: () => {},
};
```

### 🔴 Expert Example

```typescript
type Vec2 = readonly [number, number];

const origin: Vec2 = [0, 0];
// origin.push(1); // error if you mistakenly used mutable tuple inference
```

### 🌍 Real-Time Example

Redux/React state slices often use **explicit state interfaces** so reducers stay consistent when initial state is built from `createSlice` or similar tools.

---

## 4. Best Practices

1. **Enable `strict`** (and keep it on) for new projects; fix violations incrementally in brownfield code behind focused PRs.
2. **Prefer `unknown` over `any`** at system boundaries (JSON, DOM events, third-party callbacks); narrow before use.
3. **Annotate public exports** (package entrypoints, shared `types` folders) so consumers get stable contracts.
4. **Align `module` / `moduleResolution` / `target`** with your runtime and bundler; mismatches cause subtle emit and import issues.
5. **Use path aliases consistently** across `tsconfig`, Vite/Webpack, and Jest/Vitest so imports resolve everywhere.
6. **Use project references** when build times grow; cache artifacts in CI for `tsc -b`.
7. **Commit `sourceMap` for apps** in dev/staging; consider turning off or stripping for sensitive production bundles.
8. **Emit `declaration` + `declarationMap`** for libraries to improve DX in dependent repos.

---

## 5. Common Mistakes to Avoid

1. **Turning off `strictNullChecks`** to “fix” errors—this hides real undefined/null hazards.
2. **Using `any` to silence the compiler**—debt compounds; use `unknown` + validation or proper generics.
3. **Assuming `tsconfig` paths affect runtime**—they do not unless your bundler/runtime mirrors them.
4. **Mixing `moduleResolution: "node"` with `"module": "NodeNext"`** without understanding resolution differences—imports may fail or types may lie.
5. **Relying on inference for empty collections** (`const xs = []`) and then pushing typed values—start with an annotation.
6. **Ignoring `this` typing** in object literals passed as callbacks—use arrow functions or explicit `this` parameters.
7. **Publishing packages without `.d.ts`** (when `declaration` is false) forcing consumers to lose types or use shims.
8. **Using `!` (non-null assertion) habitually** instead of narrowing—assertions bypass checks, they do not add runtime safety.

**Hands-on:** Run `tsc --init`, toggle one strict flag at a time, and watch how errors move—that builds intuition faster than memorizing rules alone.
