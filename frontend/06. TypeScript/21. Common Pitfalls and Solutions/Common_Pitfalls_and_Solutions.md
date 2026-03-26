# TypeScript Common Pitfalls and Solutions

This guide maps frequent TypeScript mistakes to fixes. Each major area uses **Beginner → Intermediate → Expert → Real-Time** examples; **wrong** patterns appear first, then **correct** alternatives.

---

## 📑 Table of Contents

1. [Type System Pitfalls](#1-type-system-pitfalls)
2. [Configuration Pitfalls](#2-configuration-pitfalls)
3. [Generic Pitfalls](#3-generic-pitfalls)
4. [Class Pitfalls](#4-class-pitfalls)
5. [Async Pitfalls](#5-async-pitfalls)
6. [Module Pitfalls](#6-module-pitfalls)
7. [Type Inference Pitfalls](#7-type-inference-pitfalls)
8. [Common Solutions](#8-common-solutions)
9. [Quick Reference](#quick-reference)

---

## 1. Type System Pitfalls

**Themes:** Values widen to broad primitives; `any` disables checking; TypeScript is **structural** (shape-based), not nominal; some callback positions are **bivariant** for historical reasons; **`as` assertions** lie to the compiler.

### 🟢 Beginner Example

```typescript
// ❌ WRONG: `let` without `as const` widens literals to `string` / `number`.
let status = "pending";
status = "done";
// typeof status is `string`, not `"pending" | "done"`.

// ✅ CORRECT: `const` or `as const` preserves literal types.
const fixed = "pending" as const;
type Status = "pending" | "done" | "failed";
let s: Status = "pending";
s = "done";

// ❌ WRONG: `any` escape hatch — callers can pass anything; no property checks.
function logUser(u: any) {
  console.log(u.nmae); // typo: no error
}

// ✅ CORRECT: define a shape or use `unknown` + narrowing.
interface User {
  name: string;
}
function logUserGood(u: User) {
  console.log(u.name);
}

// ❌ WRONG: Implicit `any` from untyped JS migration (`noImplicitAny` off).
function add(a, b) {
  return a + b;
}

// ✅ CORRECT: Parameter types (or enable `noImplicitAny` and fix errors).
function addGood(a: number, b: number) {
  return a + b;
}
```

### 🟡 Intermediate Example

```typescript
// ❌ WRONG: Treating types as nominal — two interfaces with same shape are interchangeable.
interface Dog {
  name: string;
}
interface Cat {
  name: string;
}
function walkDog(d: Dog) {
  return d.name;
}
const c: Cat = { name: "Whiskers" };
walkDog(c); // structurally valid — surprise if you expected nominal branding

// ✅ CORRECT: Brand with a unique symbol or phantom property for nominal-style safety.
declare const dogBrand: unique symbol;
interface BrandedDog {
  readonly [dogBrand]: void;
  name: string;
}
function makeDog(name: string): BrandedDog {
  return { [dogBrand]: undefined, name } as BrandedDog;
}

// ❌ WRONG: Unsafe assertion — compiler trusts you about DOM shape.
const el = document.getElementById("root") as HTMLCanvasElement;
el.getContext("2d"); // runtime crash if element is not a canvas

// ✅ CORRECT: Narrow with runtime checks or optional chaining + early return.
const maybe = document.getElementById("root");
if (!(maybe instanceof HTMLCanvasElement)) {
  throw new Error("Expected canvas");
}
const ctx = maybe.getContext("2d");

// ❌ WRONG: Non-exhaustive `switch` on discriminated union — no compiler error without `never` check.
type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };
function areaWrong(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.r * shape.r;
    default:
      return 0; // silently wrong if a new variant is added
  }
}

// ✅ CORRECT: Exhaustive switch with `never` fallback.
function areaGood(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.r * shape.r;
    case "square":
      return shape.s * shape.s;
    default: {
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}
```

### 🔴 Expert Example

```typescript
// ❌ WRONG: Assuming method parameter positions are always contravariant-safe.
// In `--strictFunctionTypes`, *method* parameters in interfaces can be bivariant
// for backward compatibility; prefer function properties for stricter checking.
interface Handlers {
  onData(data: string | number): void; // method form — looser in some positions
}

// ✅ CORRECT: Use a function property type when you need strict parameter checking.
type StrictHandlers = {
  onData: (data: string | number) => void;
};

// ❌ WRONG: Double assertion through `any` to force unrelated types.
declare const x: unknown;
const y = x as any as { deep: number };

// ✅ CORRECT: Validate and narrow, or use a single honest assertion after a type guard.
function isDeep(v: unknown): v is { deep: number } {
  return typeof v === "object" && v !== null && "deep" in v && typeof (v as { deep: unknown }).deep === "number";
}
if (isDeep(x)) {
  console.log(x.deep);
}
```

### 🌍 Real-Time Example

```typescript
// ❌ WRONG: WebSocket message assumed shape via assertion only.
type PriceTick = { symbol: string; price: number };
function onMessage(raw: MessageEvent) {
  const tick = JSON.parse(raw.data as string) as PriceTick;
  broadcast(tick.price); // `symbol` might be missing; `price` might be a string
}

// ✅ CORRECT: Parse as `unknown`, validate, then use a narrowed type.
function isPriceTick(v: unknown): v is PriceTick {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.symbol === "string" && typeof o.price === "number";
}

function onMessageSafe(raw: MessageEvent) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw.data));
  } catch {
    return;
  }
  if (!isPriceTick(parsed)) return;
  broadcast(parsed.price);
}

function broadcast(n: number) {
  /* ... */
}

// ❌ WRONG: Using `!` non-null assertion instead of guarding nullable API results.
interface User {
  name: string;
}
declare function findUser(id: string): User | undefined;
const u = findUser("x")!;
console.log(u.name); // runtime error if undefined

// ✅ CORRECT: Guard or optional chaining.
const u2 = findUser("x");
if (u2) console.log(u2.name);
```

---

## 2. Configuration Pitfalls

**Themes:** Without **`strict`**, many bugs slip through; **`moduleResolution`** must match your bundler/runtime; **`target`** affects emitted syntax and lib availability; **`paths`** without aligned **`baseUrl`** or tool support breaks resolution.

### 🟢 Beginner Example

```typescript
// ❌ WRONG mindset: "strict is optional" — `strictNullChecks` off allows:
function greet(name: string | null) {
  return name.toUpperCase(); // no error if strict null checks disabled
}

// ✅ CORRECT: Enable strict family in tsconfig.json:
// "strict": true
// (implies strictNullChecks, strictFunctionTypes, strictBindCallApply, etc.)
function greetGood(name: string | null) {
  if (name === null) return "Hello";
  return name.toUpperCase();
}

// ❌ WRONG: `skipLibCheck: true` hides issues in `.d.ts` — convenient but can mask broken types.
// ✅ CORRECT: Turn it off periodically or in CI strict job; fix upstream typings or patch packages.
```

### 🟡 Intermediate Example

```jsonc
// ❌ WRONG: "module": "CommonJS" with "moduleResolution": "node10" in a pure ESM package
// can confuse tools expecting Node16/NodeNext resolution for package.json "exports".

// ✅ CORRECT (Node ESM package example):
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022"
  }
}
```

```typescript
// ❌ WRONG: `target` too old for syntax you use in source without downleveling awareness.
// e.g. target ES5 but using async/await without proper lib/downlevel settings.

// ✅ CORRECT: Match target to minimum runtime (browserslist / Node LTS) and verify emit.
// "target": "ES2020" or align with your bundler's transpilation pipeline.
async function load() {
  const m = await import("./mod.js");
  return m;
}

// ❌ WRONG: `types` / `typeRoots` misconfigured — global `@types` packages not visible or wrong set loaded.
// ✅ CORRECT: Omit `typeRoots` unless you need isolation; let TS resolve `@types/node` from node_modules.
```

### 🔴 Expert Example

```jsonc
// ❌ WRONG: paths alias without baseUrl — paths may not resolve as expected.
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/*"]
    }
  }
}

// ✅ CORRECT:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"]
    }
  }
}
```

```typescript
// Note: `tsc` paths do not rewrite emitted imports — bundlers/test runners need
// matching resolve config (e.g. Vite, webpack, tsconfig-paths).

// ❌ WRONG: Assuming `isolatedModules` is optional when using Babel/swc/esbuild.
// Files that rely on type-only merging or certain patterns break under transpile-only.

// ✅ CORRECT: "isolatedModules": true and use `import type` / `export type` where needed.
import type { User } from "./types";
export type { User };
```

### 🌍 Real-Time Example

```jsonc
// Monorepo pitfall: composite project references without proper "references" / build order.

// ❌ WRONG: App compiles against stale .d.ts from packages because skipLibCheck hides issues
// and references are missing.

// ✅ CORRECT pattern (illustrative):
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["packages/shared/src/*"]
    }
  },
  "references": [{ "path": "../shared" }]
}
```

```typescript
// Ensure Vite/tsconfig paths stay in sync; drift causes "Cannot find module '@shared/...'".
// For React 17+ automatic JSX runtime, prefer `"jsx": "react-jsx"` over legacy `"react"`.
```

---

## 3. Generic Pitfalls

**Themes:** Constraints that are too tight block valid callers; missing **`extends`** yields **`{}`**-like behavior and weak errors; inference fails across positions; variance shows up in generic **function types** vs methods.

### 🟢 Beginner Example

```typescript
// ❌ WRONG: Generic with no constraint — you cannot access `.length` safely.
function first<T>(arr: T) {
  return arr.length; // error: T might not have length
}

// ✅ CORRECT: Constrain to arrays or iterable as appropriate.
function firstGood<T>(arr: readonly T[]) {
  return arr[0];
}
```

### 🟡 Intermediate Example

```typescript
// ❌ WRONG: Over-constraining — requiring `T extends string` when `T` could be number keys.
function keys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]; // still a known footgun — keys are only strings at runtime
}

// ✅ CORRECT: Accept the runtime reality of `Object.keys` or use a typed helper carefully.
function keysOf<T extends object>(obj: T): Array<Extract<keyof T, string>> {
  return Object.keys(obj) as Array<Extract<keyof T, string>>;
}
```

### 🔴 Expert Example

```typescript
// ❌ WRONG: Expecting inference to flow through multiple hops without hints.
declare function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
const out = pipe(1, (n) => n + 1, (x) => x.toFixed(2)); // often OK, but breaks with complex overloads

// ✅ CORRECT: Annotate intermediate function parameters or result when inference fails.
const out2 = pipe<number, number, string>(
  1,
  (n) => n + 1,
  (x) => x.toFixed(2)
);

// Variance sketch: avoid unsound generic callbacks without `strictFunctionTypes` understanding.
type Mapper<T> = (x: T) => T;
// Assigning Mapper<number> to Mapper<number | string> is unsafe — contravariance on parameter.

// ❌ WRONG: Relying on inference for every type parameter when call sites are ambiguous.
declare function pair<A, B>(a: A, b: B): { a: A; b: B };
// Widen-risk: `pair("x", 1)` is fine; problems appear with `unknown` or overloaded returns.

// ✅ CORRECT: Pass explicit type arguments when the checker picks `unknown` or a too-wide union.
const boxed = pair<string, number>("x", 1);
```

### 🌍 Real-Time Example

```typescript
// ❌ WRONG: API wrapper generic defaults to `{}` for response body.
async function fetchJson<T = {}>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as T; // unchecked — any JSON shape
}

// ✅ CORRECT: Default to `unknown` and narrow at call site, or use Zod/io-ts.
async function fetchJsonSafe<T>(url: string, validate: (v: unknown) => v is T): Promise<T> {
  const res = await fetch(url);
  const data: unknown = await res.json();
  if (!validate(data)) throw new Error("Invalid response");
  return data;
}

// ❌ WRONG: Class generic default that is too wide for consumers.
class CacheBad<T = object> {
  private m = new Map<string, T>();
  set(k: string, v: T) {
    this.m.set(k, v);
  }
}

// ✅ CORRECT: Default to `unknown` or no default — force callers to specify value type.
class CacheGood<T = unknown> {
  private m = new Map<string, T>();
  set(k: string, v: T) {
    this.m.set(k, v);
  }
}
```

---

## 4. Class Pitfalls

**Themes:** **`strictPropertyInitialization`** flags fields not set in constructor; **`this`** in detached methods is wrong; arrow fields vs methods trade **binding** vs **prototype**; constructor **implementation** must match overloads and **`super()`** rules.

### 🟢 Beginner Example

```typescript
// ❌ WRONG: Property used before assignment (fails under strictPropertyInitialization).
class Counter {
  value: number;
  bump() {
    this.value += 1;
  }
}

// ✅ CORRECT: Initialize in field, constructor, or use definite assignment assertion sparingly.
class CounterGood {
  value = 0;
  bump() {
    this.value += 1;
  }
}

// ❌ WRONG: Public field declared but never initialized — error under strictPropertyInitialization.
class LabelBad {
  text: string;
  getText() {
    return this.text;
  }
}

// ✅ CORRECT: Initialize at declaration or in every constructor path.
class LabelGood {
  text = "";
  getText() {
    return this.text;
  }
}
```

### 🟡 Intermediate Example

```typescript
// ❌ WRONG: Passing method loses `this`.
class Greeter {
  name = "Ada";
  greet() {
    return `Hi, ${this.name}`;
  }
}
const g = new Greeter();
setTimeout(g.greet, 10); // `this` is wrong in non-strict mode may still "work" by accident — unreliable

// ✅ CORRECT: Arrow field, bind, or wrap.
class GreeterGood {
  name = "Ada";
  greet = () => `Hi, ${this.name}`;
}
```

### 🔴 Expert Example

```typescript
// ❌ WRONG: Overloads that don't match implementation signature rules.
class Box {
  // overloads
  set(v: string): void;
  set(v: number): void;
  set(v: string | number) {
    // must be compatible union — OK here
  }
}

// Constructor overload pitfall: implementation signature is not visible externally.
class Point {
  constructor(x: number, y: number);
  constructor(xy: string);
  constructor(x: number | string, y?: number) {
    if (typeof x === "string") {
      const [a, b] = x.split(",").map(Number);
      this.x = a;
      this.y = b;
    } else {
      this.x = x;
      this.y = y ?? 0;
    }
  }
  x: number;
  y: number;
}

// ✅ CORRECT: Keep overload declarations + one implementation; ensure all paths assign fields.

// ❌ WRONG: Extending built-ins (e.g. `Array`) without proper prototype setup in some runtimes.
// class MyArray extends Array<number> { ... } // can break `.map` identity in older engines

// ✅ CORRECT: Prefer composition over extending `Array` / `Error` unless you control emit and targets.
class BufferList {
  private items: number[] = [];
  push(n: number) {
    this.items.push(n);
  }
  toArray() {
    return [...this.items];
  }
}
```

### 🌍 Real-Time Example

```typescript
// ❌ WRONG: React class component handler passed without bind in legacy code.
// (Functional components avoid this; still common in older codebases.)

// ✅ CORRECT patterns: arrow class field, bind in constructor, or inline wrapper.
import { Component } from "react";

type Props = { label: string };

class Row extends Component<Props> {
  // arrow preserves `this` when passed to child
  onClick = () => {
    console.log(this.props.label);
  };
  render() {
    return <button onClick={this.onClick}>{this.props.label}</button>;
  }
}
```

---

## 5. Async Pitfalls

**Themes:** **Floating promises** (not awaited or voided intentionally); **`async` functions** always return promises — forgetting **`await`** doubles wrapping; **`Promise<Promise<T>>`** confusion; **`async` functions returning `void`** lose error propagation to callers.

### 🟢 Beginner Example

```typescript
// ❌ WRONG: Floating promise — errors become unhandled rejections.
function save() {
  fetch("/api/save"); // not awaited, not returned, not voided
}

// ✅ CORRECT: await in async caller, return the promise, or explicit void with comment.
async function saveGood() {
  await fetch("/api/save");
}

function fireAndForget() {
  void fetch("/api/ping"); // intentional — document why
}

// ❌ WRONG: `forEach` with async callback — parallel chaos or ignored promises.
async function saveAllBad(ids: string[]) {
  ids.forEach(async (id) => {
    await fetch(`/api/item/${id}`, { method: "POST" });
  });
  console.log("done"); // fires before requests finish
}

// ✅ CORRECT: `for...of` with await, or `Promise.all` with map when parallel is intended.
async function saveAllGood(ids: string[]) {
  for (const id of ids) {
    await fetch(`/api/item/${id}`, { method: "POST" });
  }
}

async function saveAllParallel(ids: string[]) {
  await Promise.all(ids.map((id) => fetch(`/api/item/${id}`, { method: "POST" })));
}
```

### 🟡 Intermediate Example

```typescript
// ❌ WRONG: Missing await — caller gets Promise<Promise<Response>> if inner is async.
async function outerBad() {
  return inner(); // if inner is async, this returns Promise<Promise<T>> unless inner returns T
}
async function inner() {
  return await Promise.resolve(1);
}

// ✅ CORRECT: await or return flattened promise.
async function outerGood() {
  return await inner();
}

// ❌ WRONG: Mixing sync throws and Promise rejections — callers must catch both styles.
function maybeBad(ok: boolean): Promise<number> {
  if (!ok) throw new Error("sync throw");
  return Promise.resolve(1);
}

// ✅ CORRECT: Consistent async — reject async too, or document sync precondition.
async function maybeGood(ok: boolean): Promise<number> {
  if (!ok) throw new Error("failed");
  return 1;
}
```

### 🔴 Expert Example

```typescript
// ❌ WRONG: `async function foo(): void` is illegal — async must return Promise.
// But `async () => void` in callbacks is allowed and swallows rejections unless you handle them.

// ✅ CORRECT: Type promise return when errors matter.
async function run(): Promise<void> {
  await step();
}

// Library typing example: prefer `Promise<void>` over `void` for async operations in public APIs.

// ❌ WRONG: Long-running fetch with no timeout — hung requests look like "slow app".
async function fetchForever(url: string) {
  return fetch(url);
}

// ✅ CORRECT: Combine `AbortSignal` + `setTimeout` (or `AbortSignal.timeout` where available).
async function fetchWithDeadline(url: string, ms: number) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}
```

### 🌍 Real-Time Example

```typescript
// ❌ WRONG: Express handler declared async but errors not passed to next().
// import type { Request, Response, NextFunction } from "express";

// async function badHandler(req: Request, res: Response) {
//   await db.query(); // rejection may not reach Express error middleware
// }

// ✅ CORRECT: wrap with try/catch or use utilities that forward to next().
// async function goodHandler(req: Request, res: Response, next: NextFunction) {
//   try {
//     await db.query();
//     res.json({ ok: true });
//   } catch (e) {
//     next(e);
//   }
// }
```

---

## 6. Module Pitfalls

**Themes:** **Circular imports** lead to partial initialization; **side-effect imports** hide dependencies; **default exports** rename easily and confuse refactors; **CJS/ESM interop** (`require` vs `import`, `__esModule`) causes runtime surprises.

### 🟢 Beginner Example

```typescript
// ❌ WRONG: Heavy reliance on default export — importers use arbitrary names.
// export default function createStore() {}

// ✅ CORRECT: Prefer named exports for stable refactoring and re-exports.
export function createStore() {}
export type { Store } from "./types";

// ❌ WRONG: Re-exporting values you only need as types — can pull runtime deps into graph.
// export { heavyFn } from "./heavy"; // when consumers only needed the type

// ✅ CORRECT: `export type { ... }` or `import type` so type-only edges stay erasable.
```

### 🟡 Intermediate Example

```typescript
// ❌ WRONG: Circular dependency — a.ts imports b.ts imports a.ts during load.
// a.ts: import { b } from "./b";
// b.ts: import { a } from "./a";
// One side may see uninitialized bindings.

// ✅ CORRECT: Extract shared types/helpers to c.ts; or use dynamic import() inside function.
// c.ts: export type Shared = { id: string };

// ❌ WRONG: `import * as ns from "./mod"` then relying on `ns.default` shape without checking interop.

// ✅ CORRECT: Prefer named imports; test CJS default interop once per package in a small harness.
```

### 🔴 Expert Example

```typescript
// ❌ WRONG: Assuming `import "./polyfill"` is obvious to tree-shakers and readers.
// Side-effect import — document and group separately.

// ✅ CORRECT: Centralize setup in a single `setup.ts` imported once from entry.

// CJS default interop pitfall:
// import pkg from "legacy-cjs-pkg";
// may be `pkg.default` at runtime depending on `esModuleInterop` / `allowSyntheticDefaultImports`.
// Verify runtime shape in tests.
```

### 🌍 Real-Time Example

```typescript
// ❌ WRONG: Mixing `require` in ESM-first Vite app without compatibility shims.

// ✅ CORRECT: Use `import` or dynamic `import()`; configure `optimizeDeps` / conditions as needed.

// Barrel file pitfall: `export * from "./heavy"` pulls everything into consumers' graphs.
// Prefer explicit re-exports or direct imports for large libraries.

// ❌ WRONG: Duplicate identifier across `declare module` augmentation and local file — merge errors.

// ✅ CORRECT: Centralize augmentations in `types/global.d.ts` with `/// <reference types="..." />` as needed.
```

---

## 7. Type Inference Pitfalls

**Themes:** **`const`** inference is narrow; **`let`** widens; **contextual typing** fails when passing through generic wrappers; **destructuring** loses precise literals; **generic defaults** erase information.

### 🟢 Beginner Example

```typescript
// ❌ WRONG: Expecting tuple inference from array literal.
const pair = [1, "a"];
// inferred as (string | number)[] unless contextual tuple type provided

// ✅ CORRECT: `as const` or explicit tuple annotation.
const pairGood = [1, "a"] as const;
type Pair = readonly [number, string];
const pairGood2: Pair = [1, "a"];

// ❌ WRONG: Object literal widens string properties when no contextual literal type applies.
const action = { type: "INCREMENT", by: 1 };
// `type` is often inferred as `string`, not the literal `"INCREMENT"`.

// ✅ CORRECT: `as const` or `satisfies` against a discriminated union.
const actionGood = { type: "INCREMENT", by: 1 } as const;
type Reduxish = { type: "INCREMENT"; by: number } | { type: "RESET" };
const actionGood2 = { type: "INCREMENT", by: 1 } satisfies Reduxish;
```

### 🟡 Intermediate Example

```typescript
// ❌ WRONG: Passing a function to a generic loses parameter contextual typing.
declare function id<T>(x: T): T;
const f = id((e: { kind: "a" }) => e.kind); // may infer overly wide parameter types in some cases

// ✅ CORRECT: Annotate generic call or function parameter explicitly when inference widens.
const f2 = id<(e: { kind: "a" | "b" }) => "a" | "b">((e) => e.kind);

// ❌ WRONG: Preferring `arguments` over rest parameters — loses arity typing and is not arrow-friendly.
function legacySum() {
  return 0; // real code would use `arguments` — avoid
}

// ✅ CORRECT: Rest parameters infer and check element types.
function modernSum(...values: number[]) {
  return values.reduce((a, n) => a + n, 0);
}
```

### 🔴 Expert Example

```typescript
// ❌ WRONG: Destructuring with rest loses connection to narrowed discriminated union sometimes.
type Ev = { kind: "x"; x: number } | { kind: "y"; y: string };
function handle(ev: Ev) {
  const { kind, ...rest } = ev;
  if (kind === "x") {
    // rest is still a union — must narrow `ev` or use discriminant on `ev`
    // console.log(rest.x); // not safe without further checks
  }
}

// ✅ CORRECT: Switch on `ev.kind` and handle each branch with full object.
function handleGood(ev: Ev) {
  switch (ev.kind) {
    case "x":
      return ev.x + 1;
    case "y":
      return ev.y.length;
  }
}
```

### 🌍 Real-Time Example

```typescript
// ❌ WRONG: Event handler inference in loosely typed UI libs — `event` becomes `any` if lib types missing.

// ✅ CORRECT: Type the handler parameter using the framework's event types.
// React.ChangeEvent<HTMLInputElement>, etc.

// ❌ WRONG: `useState([])` infers `never[]`.
// const [items, setItems] = useState([]);

// ✅ CORRECT: Provide generic or initial value with explicit type.
// const [items, setItems] = useState<Item[]>([]);

// ❌ WRONG: `noImplicitReturns` off — missing return branches return `undefined` silently.
function parseIntWrong(s: string): number {
  if (/^\d+$/.test(s)) {
    return Number(s);
  }
  // forgot return / throw
}

// ✅ CORRECT: Enable `noImplicitReturns` and return or throw on all paths.
function parseIntGood(s: string): number {
  if (/^\d+$/.test(s)) {
    return Number(s);
  }
  throw new Error("invalid");
}
```

---

## 8. Common Solutions

**Themes:** Assertions when you **know** more than the checker after checks; **user-defined type guards**; **`as const`** for literals; **helper types** (`Pick`, `Omit`, mapped types); **explicit annotations** at boundaries; **splitting** complex types into named aliases.

### 🟢 Beginner Example

```typescript
// Problem: `unknown` from JSON.parse
// ✅ Solution: type guard
function isString(v: unknown): v is string {
  return typeof v === "string";
}

declare const raw: unknown;
if (isString(raw)) {
  raw.toUpperCase();
}

// ✅ const assertion for config keys
const roles = ["admin", "editor", "viewer"] as const;
type Role = (typeof roles)[number];

// ❌ WRONG: Casting through `unknown` repeatedly instead of one validated boundary.
function badNormalize(v: unknown) {
  return v as unknown as { id: string };
}

// ✅ CORRECT: Single guard + return type from validation.
function goodNormalize(v: unknown): { id: string } {
  if (typeof v === "object" && v !== null && "id" in v && typeof (v as { id: unknown }).id === "string") {
    return { id: (v as { id: string }).id };
  }
  throw new Error("bad shape");
}
```

### 🟡 Intermediate Example

```typescript
// ✅ Helper types instead of copying interfaces
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

type PublicUser = Omit<User, "passwordHash">;
type UserPatch = Partial<Pick<User, "name" | "email">>;

// ✅ Assertion after runtime check (single honest `as` or guard)
function assertIsNumber(n: unknown): asserts n is number {
  if (typeof n !== "number") throw new Error("not a number");
}
```

### 🔴 Expert Example

```typescript
// ✅ Refactor complex intersection into branded + utilities
type Id<T extends string> = string & { readonly __brand: T };
type UserId = Id<"UserId">;
type OrderId = Id<"OrderId">;

function userId(id: string): UserId {
  return id as UserId;
}

// ✅ Template literal types for routes
type HttpMethod = "GET" | "POST";
type Path = `/api/v1/${string}`;
type Route = `${HttpMethod} ${Path}`;

const r: Route = "GET /api/v1/users";

// ❌ WRONG: `enum` for string sets when union + const object is clearer and tree-shakes better.
enum Color {
  Red = "red",
  Green = "green",
}

// ✅ CORRECT (when you want runtime object + literal union):
const ColorMap = { Red: "red", Green: "green" } as const;
type ColorName = (typeof ColorMap)[keyof typeof ColorMap];

// ✅ `satisfies` keeps literal types while checking shape (TS 4.9+).
const theme = {
  fg: "#111",
  bg: "#fff",
} satisfies Record<string, `#${string}`>;
```

### 🌍 Real-Time Example

```typescript
// ✅ Boundary annotation: external API response typed at the edge
type ApiUser = { id: string; display_name: string };

interface User {
  id: string;
  name: string;
}

function toUser(api: ApiUser): User {
  return { id: api.id, name: api.display_name };
}

// ✅ Zod-style validation (pseudo) — replace with your schema library
// const Schema = z.object({ id: z.string(), price: z.number() });
// type T = z.infer<typeof Schema>;
```

---

## Quick Reference

| Symptom | Likely pitfall | First fix |
|--------|----------------|---------|
| Literal types collapse to `string` / `number` | Widening with `let` or mutable contexts | Use `as const`, `const`, or explicit union annotation |
| Property access on possibly `null` / `undefined` | `strictNullChecks` off or missing guard | Enable `strict`; narrow with `if`, `?.`, or early return |
| Same-shaped types interchangeable | Structural typing | Brand types or keep domain separation in functions |
| Callback parameter types too permissive | Bivariant method parameters | Prefer function property types in interfaces |
| `as` hides runtime errors | Unsafe assertion | `instanceof`, `in`, schema validation, type guards |
| Cannot find module for path alias | `paths` without `baseUrl` / bundler config | Set `baseUrl`; mirror aliases in Vite/webpack |
| `import` fails in Node package | Wrong `moduleResolution` / ESM-CJS mix | Use `NodeNext` + `"type": "module"` or consistent CJS |
| Generic `T` has no usable members | Missing `extends` constraint | Add `extends SomeConstraint` |
| Inference is `unknown` or `{}` | Defaults or loose JSON boundaries | Default generics to `unknown`; validate at runtime |
| `this` is `undefined` in handler | Unbound class method | Arrow field, `.bind`, or lambda wrapper |
| Unhandled promise rejection | Floating promise | `await`, `return`, `void` + comment, or `try/catch` |
| Double `Promise` | Returned `async` without `await` | `return await` or flatten with `then` |
| Circular import undefined exports | Cycle between modules | Extract shared module; dynamic `import()` |
| Default export rename confusion | Implicit naming | Prefer named exports |
| `never[]` from `useState([])` | Empty array inference | `useState<Type[]>([])` or initial element |
| Complex types unreadable | One giant inline type | Named aliases, `Pick`/`Omit`, separate `.types.ts` |
| Index access `obj[k]` is `undefined` in types | `noUncheckedIndexedAccess` | Narrow, default with `??`, or use `Map` |
| Optional props behave like `T \| undefined` | `exactOptionalPropertyTypes` | Only pass `undefined` when truly optional, or omit key |
| `readonly` array assigned to mutable array | Covariance of readonly | Use `readonly T[]` in parameters, or clone when mutating |
| DOM value always `string` | Input elements widen | Parse/coerce (`Number()`, schema) at boundary |
| `JSON.parse` returns `any` in older typings | Implicit any from parse | Annotate `unknown`, then validate |
| Test doubles don't match interface | Structural extra props allowed | Use `satisfies` or explicit mock type |
| `keyof` includes unwanted keys | Index signature / prototype | Use `Pick`, branded keys, or `Extract` |
| Library generic defaults to `{}` | Loose third-party types | Pass type args, wrap adapter, or augment `.d.ts` |
| `Array.isArray` not enough | `unknown[]` vs tuple goal | Follow with element guard or schema |
| `typeof null === "object"` | Null is object in JS | Use `=== null` check explicitly |

**tsconfig checklist (baseline for new projects):** `"strict": true`, `"noUncheckedIndexedAccess": true` (if team agrees), `"exactOptionalPropertyTypes": true` (optional; stricter), `"moduleResolution": "Bundler"` or `"NodeNext"` to match shipping environment, `"verbatimModuleSyntax": true` (TS 5+) for clearer type-only imports, align **`target`** with runtime, and keep **path aliases** synchronized in tooling.

**Lint integration (optional but high value):** `@typescript-eslint/no-floating-promises`, `no-explicit-any`, `no-unsafe-*` family, and `await-thenable` catch many pitfalls `tsc` alone will not flag.

**When to assert:** Only after a runtime check, or at a true trust boundary with a comment explaining the invariant. Prefer **type guards** and **schemas** for external data.

**Refactoring playbook:** When a type error explodes across the project, fix the **root exported type** first (the boundary), then fan in with helper types; avoid silencing with `any` at the center — that spreads unsoundness.

---

*Document version: aligned with modern TypeScript (5.x) patterns; verify flag names and defaults against your installed `typescript` package.*
