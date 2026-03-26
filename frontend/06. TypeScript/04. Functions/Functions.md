# TypeScript Functions

Functions are first-class values in TypeScript: you can annotate their parameters and return values, overload them, make them generic, and pass them as callbacks or higher-order arguments. TypeScript adds static typing on top of JavaScript’s flexible function model so you can document intent, catch mistakes at compile time, and keep refactoring safe in large codebases. This guide walks from basic function types through generics, overloads, and production patterns.

## 📑 Table of Contents

1. [Function Types](#1-function-types)
2. [Function Parameters](#2-function-parameters)
3. [Function Return Types](#3-function-return-types)
4. [Function Overloading](#4-function-overloading)
5. [Generic Functions](#5-generic-functions)
6. [Arrow Functions](#6-arrow-functions)
7. [Callback Functions](#7-callback-functions)
8. [Higher-Order Functions](#8-higher-order-functions)
9. [Function Guidelines](#9-function-guidelines)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
12. [Comparison Table](#comparison-table)

---

## 1. Function Types

TypeScript describes “what a function looks like” using **function type expressions** (inline types), **call signatures** (especially on object types), **construct signatures** (for `new`-able values), and **type aliases** for reuse.

### 1.1 Function type expressions and call signatures

A **function type expression** has the form `(params) => ReturnType`. A **call signature** can appear in an object type when you want a callable object with extra properties (see intermediate example).

#### 🟢 Beginner Example
```typescript
// Simple function type: takes two numbers, returns a number
type Add = (a: number, b: number) => number;

const add: Add = (x, y) => x + y;

// Inline annotation without a named type
const greet: (name: string) => string = (name) => `Hello, ${name}`;
```

#### 🟡 Intermediate Example
```typescript
// Callable object: call signature + properties
interface Logger {
  (message: string, level?: "info" | "warn" | "error"): void;
  readonly prefix: string;
}

function createLogger(prefix: string): Logger {
  const fn = (message: string, level: "info" | "warn" | "error" = "info") => {
    console.log(`[${level}] ${prefix}: ${message}`);
  };
  return Object.assign(fn, { prefix });
}

const log = createLogger("app");
log("Server started"); // call signature
console.log(log.prefix); // property
```

#### 🔴 Expert Example
```typescript
// Overloaded call signature inside an object type (single implementation must be compatible)
interface DualCallable {
  (id: string): { id: string };
  (id: number): { id: number };
}

// Implementation type is the widened form TypeScript expects
const dual: DualCallable = ((id: string | number) =>
  typeof id === "string" ? { id } : { id }) as DualCallable;
```

#### 🌍 Real-Time Example
```typescript
// Express-style request handler type (simplified)
type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: unknown, res: unknown, next: NextFunction) => void;

const jsonParser: RequestHandler = (_req, res, next) => {
  // parse body, then call next() or next(err)
  next();
};
```
### 1.2 Construct signatures

**Construct signatures** describe values that can be called with `new`. They use `new (...args) => InstanceType`.

#### 🟢 Beginner Example
```typescript
type StringCtor = new (value?: string) => String;

const BuiltInString: StringCtor = String;
const s = new BuiltInString("hello");
```

#### 🟡 Intermediate Example
```typescript
class User {
  constructor(public name: string) {}
}

type UserConstructor = new (name: string) => User;

function createInstance(Ctor: UserConstructor, name: string): User {
  return new Ctor(name);
}

const u = createInstance(User, "Ada");
```

#### 🔴 Expert Example
```typescript
// `ConstructorParameters` + `InstanceType` tie `new` to its instance (built-in utilities)
function makeInstance<Ctor extends new (...args: any) => any>(
  Class: Ctor,
  ...args: ConstructorParameters<Ctor>
): InstanceType<Ctor> {
  return new Class(...args);
}
```

#### 🌍 Real-Time Example
```typescript
// Plugin registration: each plugin is a class with a known constructor
interface PluginInstance {
  mount(container: HTMLElement): void;
}

type PluginClass = new (options: Record<string, unknown>) => PluginInstance;

const registry = new Map<string, PluginClass>();

function registerPlugin(name: string, Plugin: PluginClass): void {
  registry.set(name, Plugin);
}
```
### 1.3 Function type aliases

**Type aliases** give reusable names to function types, which improves readability and keeps APIs consistent.

#### 🟢 Beginner Example
```typescript
type Predicate<T> = (item: T) => boolean;

const isPositive: Predicate<number> = (n) => n > 0;
```

#### 🟡 Intermediate Example
```typescript
type AsyncFetcher<T> = (signal: AbortSignal) => Promise<T>;

async function loadAll<T>(fetchers: AsyncFetcher<T>[], signal: AbortSignal): Promise<T[]> {
  return Promise.all(fetchers.map((f) => f(signal)));
}
```

#### 🔴 Expert Example
```typescript
// Branded IDs + typed handlers
type UserId = string & { readonly __brand: "UserId" };
type UserEventMap = {
  login: { userId: UserId; at: Date };
  logout: { userId: UserId };
};

type UserEventHandler<K extends keyof UserEventMap> = (payload: UserEventMap[K]) => void;

declare function onUserEvent<K extends keyof UserEventMap>(
  event: K,
  handler: UserEventHandler<K>
): void;
```

#### 🌍 Real-Time Example
```typescript
// Redux-style: dispatch accepts actions shaped by a union
type AppAction =
  | { type: "INCREMENT"; by: number }
  | { type: "SET_USER"; user: { id: string; name: string } };

type Dispatch = (action: AppAction) => void;

const dispatch: Dispatch = (action) => {
  /* reducer logic */
};
```
## 2. Function Parameters

Parameters can be **annotated**, marked **optional** with `?`, given **defaults**, collected with **rest** (`...args`), **destructured** with their own types, and bound to a **`this` type** for callback-style APIs.

### 2.1 Parameter type annotations and optional parameters

#### 🟢 Beginner Example
```typescript
function repeat(text: string, times: number): string {
  return text.repeat(times);
}

// Optional parameter: may be omitted; undefined is allowed when not defaulted
function greetPerson(name: string, title?: string): string {
  return title ? `${title} ${name}` : name;
}
```

#### 🟡 Intermediate Example
```typescript
// Optional before required is invalid unless you use a default or overload
function configure(opts?: { timeout: number; retries: number }): void {
  const timeout = opts?.timeout ?? 5000;
  const retries = opts?.retries ?? 3;
  console.log(timeout, retries);
}
```

#### 🔴 Expert Example
```typescript
// Optional chaining on tuple rest with precise tuple typing
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;

function first<T extends readonly unknown[]>(...args: T): Head<T> | undefined {
  return args[0];
}

const a = first(1, 2, 3); // number | undefined
```

#### 🌍 Real-Time Example
```typescript
interface Pagination {
  page?: number;
  pageSize?: number;
}

function listProducts(filters: { category?: string } & Pagination): void {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  // call API with resolved values
}
```
### 2.2 Default parameters

Default parameters make arguments optional at the call site while keeping a concrete value inside the function.

#### 🟢 Beginner Example
```typescript
function createCounter(initial = 0): () => number {
  let n = initial;
  return () => ++n;
}
```

#### 🟡 Intermediate Example
```typescript
// Default can use earlier parameters
function buildUrl(path: string, base: string = "https://api.example.com"): string {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
```

#### 🔴 Expert Example
```typescript
// Default parameter type inferred from default expression
const DEFAULT_LOCALE = "en-US" as const;

function formatMoney(amount: number, locale: typeof DEFAULT_LOCALE = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(amount);
}
```

#### 🌍 Real-Time Example
```typescript
function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}
```
### 2.3 Rest parameters

**Rest parameters** bundle remaining arguments into an array. Type them as `T[]`, `readonly T[]`, or tuples for fixed trailing shapes.

#### 🟢 Beginner Example
```typescript
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
```

#### 🟡 Intermediate Example
```typescript
function leadFollow(leader: string, ...followers: string[]): string[] {
  return [leader, ...followers];
}
```

#### 🔴 Expert Example
```typescript
// Tuple rest after fixed params
declare function emit(event: string, ...args: [number] | [string, boolean]): void;

emit("tick", 1);
emit("auth", "token", true);
```

#### 🌍 Real-Time Example
```typescript
class EventBus<E extends Record<string, unknown>> {
  private listeners = new Map<keyof E, Array<(p: unknown) => void>>();
  on<K extends keyof E>(event: K, handler: (payload: E[K]) => void): void {
    const list = this.listeners.get(event) ?? [];
    list.push(handler as (p: unknown) => void);
    this.listeners.set(event, list);
  }
  emit<K extends keyof E>(event: K, ...args: [E[K]]): void {
    this.listeners.get(event)?.forEach((h) => h(args[0]));
  }
}
```
### 2.4 Parameter destructuring

Destructured parameters get types via **inline type annotation** on the whole pattern, not on each binding alone.

#### 🟢 Beginner Example
```typescript
function printPoint({ x, y }: { x: number; y: number }): void {
  console.log(x, y);
}
```

#### 🟡 Intermediate Example
```typescript
interface UserProfile {
  id: string;
  name: string;
  settings: { theme: "light" | "dark" };
}

function renderUser({ id, name, settings: { theme } }: UserProfile): void {
  console.log(id, name, theme);
}
```

#### 🔴 Expert Example
```typescript
// Deep readonly + satisfies-style narrowing via discriminated param
type Cmd =
  | { op: "move"; dx: number; dy: number }
  | { op: "scale"; factor: number };

function applyCmd({ op, ...rest }: Cmd): void {
  switch (op) {
    case "move":
      console.log(rest.dx, rest.dy);
      break;
    case "scale":
      console.log(rest.factor);
      break;
  }
}
```

#### 🌍 Real-Time Example
```typescript
// React-style props (conceptual)
function Button({
  children,
  variant = "primary",
  disabled = false,
}: {
  children: string;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}): string {
  return `<button data-variant="${variant}" ${disabled ? "disabled" : ""}>${children}</button>`;
}
```
### 2.5 `this` parameters

A **fake first parameter** `this: T` sets the type of `this` inside the function. It is erased at emit and does not affect arity.

#### 🟢 Beginner Example
```typescript
function getLabel(this: { label: string }): string {
  return this.label;
}

const box = { label: "A", getLabel };
box.getLabel(); // ok
```

#### 🟡 Intermediate Example
```typescript
function addItem(this: string[], item: string): void {
  this.push(item);
}

const items: string[] = [];
addItem.call(items, "x");
```

#### 🔴 Expert Example
```typescript
// Strict callback: caller must preserve this type
type ClickHandler = (this: HTMLButtonElement, ev: MouseEvent) => void;

const h: ClickHandler = function () {
  this.disabled = true;
};
```

#### 🌍 Real-Time Example
```typescript
// jQuery-style plugin (illustrative)
interface JQueryLike {
  each(callback: (this: HTMLElement, index: number) => void): void;
}

declare const $: JQueryLike;

$(".item").each(function (i) {
  this.setAttribute("data-i", String(i));
});
```
## 3. Function Return Types

You can write **explicit** return types, rely on **inference**, use **`void`** when callers should ignore results, use **`never`** when the function never returns normally, and benefit from **contextual typing** when a function is assigned where a type is expected.

### 3.1 Explicit vs inferred return types

#### 🟢 Beginner Example
```typescript
// Explicit: documents contract, can catch accidental extra returns
function toUpper(s: string): string {
  return s.toUpperCase();
}

// Inferred as string
function toLower(s: string) {
  return s.toLowerCase();
}
```

#### 🟡 Intermediate Example
```typescript
// Explicit union narrows implementation branches
function parseFlag(v: string): true | false | null {
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}
```

#### 🔴 Expert Example
```typescript
// Conditional return type from generics
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

function wrap<T>(data: T | null): ApiResult<T> {
  if (data == null) return { ok: false, error: "empty" };
  return { ok: true, data };
}
```

#### 🌍 Real-Time Example
```typescript
async function loadConfig(): Promise<{ apiUrl: string }> {
  const res = await fetch("/config.json");
  if (!res.ok) throw new Error("config failed");
  return res.json() as Promise<{ apiUrl: string }>;
}
```
### 3.2 `void` and `never`

#### 🟢 Beginner Example
```typescript
function logMessage(msg: string): void {
  console.log(msg);
  // no return value intended
}

function fail(msg: string): never {
  throw new Error(msg);
}
```

#### 🟡 Intermediate Example
```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`);
}

type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.r * s.r;
    case "square":
      return s.s * s.s;
    default:
      return assertNever(s);
  }
}
```

#### 🔴 Expert Example
```typescript
// never in control flow for exhaustive checks over string unions
type Theme = "light" | "dark";

function themeClass(t: Theme): string {
  switch (t) {
    case "light":
      return "theme-light";
    case "dark":
      return "theme-dark";
    default: {
      const _exhaustive: never = t;
      return _exhaustive;
    }
  }
}
```

#### 🌍 Real-Time Example
```typescript
// Process exit paths: void handlers vs never for fatal
function onShutdown(): void {
  console.log("cleaning up");
}

function panic(code: string): never {
  console.error(code);
  process.exit(1);
}
```
### 3.3 Contextual typing

When a function appears in a position that already has a type, parameter types can be **contextually** inferred.

#### 🟢 Beginner Example
```typescript
type NumOp = (a: number, b: number) => number;

const mul: NumOp = (a, b) => a * b; // a, b inferred as number
```

#### 🟡 Intermediate Example
```typescript
const items = [1, 2, 3];
const doubled = items.map((n) => n * 2); // n inferred as number
```

#### 🔴 Expert Example
```typescript
declare function route<R>(handlers: {
  get?: () => R;
  post?: (body: unknown) => R;
}): R;

const r = route({
  get: () => ({ ok: true as const }),
  post: (body) => ({ ok: true as const, body }),
});
```

#### 🌍 Real-Time Example
```typescript
// Array.sort comparator contextually typed
const pairs: [string, number][] = [
  ["a", 2],
  ["b", 1],
];
pairs.sort((a, b) => a[1] - b[1]);
```
## 4. Function Overloading

**Overload signatures** describe the public call shapes; the **implementation signature** must be compatible with all overloads. **Overload resolution** picks the first matching overload. **Generic overloads** combine generics with multiple call patterns.

### 4.1 Overload and implementation signatures

#### 🟢 Beginner Example
```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return String(value);
}
```

#### 🟡 Intermediate Example
```typescript
function createElement(tag: "canvas"): HTMLCanvasElement;
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}
```

#### 🔴 Expert Example
```typescript
interface BufferLike {
  readonly length: number;
}

function readAll(source: string): string;
function readAll(source: Uint8Array): Uint8Array;
function readAll(source: BufferLike): BufferLike {
  return source;
}
```

#### 🌍 Real-Time Example
```typescript
// Axios-like: overloads for responseType
function get(url: string, responseType: "json"): Promise<unknown>;
function get(url: string, responseType: "text"): Promise<string>;
function get(url: string, responseType: "json" | "text"): Promise<unknown> {
  return fetch(url).then((r) => (responseType === "text" ? r.text() : r.json()));
}
```
### 4.2 Overload resolution and generic overloads

#### 🟢 Beginner Example
```typescript
// First matching overload wins — order matters
function pick(n: 1): "one";
function pick(n: 2): "two";
function pick(n: number): string {
  if (n === 1) return "one";
  if (n === 2) return "two";
  return "many";
}
```

#### 🟡 Intermediate Example
```typescript
function map<T, U>(arr: T[], fn: (x: T) => U): U[];
function map(arr: null | undefined, fn: unknown): [];
function map<T, U>(arr: T[] | null | undefined, fn: (x: T) => U): U[] {
  if (!arr) return [];
  return arr.map(fn);
}
```

#### 🔴 Expert Example
```typescript
interface Box<T> {
  value: T;
}

function unbox(box: Box<string>): string;
function unbox(box: Box<number>): number;
function unbox<T>(box: Box<T>): T {
  return box.value;
}
```

#### 🌍 Real-Time Example
```typescript
// DOM query overloads (simplified)
function $(sel: string): HTMLElement | null;
function $(sel: string, root: ParentNode): HTMLElement | null;
function $(sel: string, root?: ParentNode): HTMLElement | null {
  const base = root ?? document;
  return base.querySelector(sel);
}
```
## 5. Generic Functions

**Generic functions** introduce type parameters in angle brackets. Use **`extends`** to constrain them, reference type params inside constraints, support **multiple parameters**, and rely on **inference** at call sites.

### 5.1 Generic type parameters and constraints

#### 🟢 Beginner Example
```typescript
function identity<T>(value: T): T {
  return value;
}

const n = identity(42); // T inferred as 42
```

#### 🟡 Intermediate Example
```typescript
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hi", "hello");
longest([1, 2], [1, 2, 3]);
```

#### 🔴 Expert Example
```typescript
// Type param used inside constraint of another param
function assign<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}

const user = { name: "Ada", age: 36 };
assign(user, "age", 37);
```

#### 🌍 Real-Time Example
```typescript
async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
```
### 5.2 Multiple type parameters and inference

#### 🟢 Beginner Example
```typescript
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
```

#### 🟡 Intermediate Example
```typescript
function mapRecord<K extends string | number | symbol, V, U>(
  rec: Record<K, V>,
  fn: (v: V, k: K) => U
): Record<K, U> {
  const out = {} as Record<K, U>;
  (Object.keys(rec) as K[]).forEach((k) => {
    out[k] = fn(rec[k], k);
  });
  return out;
}
```

#### 🔴 Expert Example
```typescript
// Infer tuple of handler return types
function allResults<T extends readonly (() => unknown)[]>(fns: T) {
  return fns.map((f) => f()) as {
    [K in keyof T]: T[K] extends () => infer R ? R : never;
  };
}
```

#### 🌍 Real-Time Example
```typescript
function createStore<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
  initial: S
) {
  let state = initial;
  return {
    getState: (): S => state,
    dispatch: (action: A): void => {
      state = reducer(state, action);
    },
  };
}
```
## 6. Arrow Functions

**Arrow functions** share the same type syntax as other function values. They **capture `this` lexically** (no dynamic `this`), which affects how you type methods vs callbacks.

### 6.1 Arrow function types and inference

#### 🟢 Beginner Example
```typescript
const double: (n: number) => number = (n) => n * 2;

const triple = (n: number): number => n * 3;
```

#### 🟡 Intermediate Example
```typescript
const nums = [1, 2, 3];
const squares = nums.map((n): number => n * n); // explicit block return type
```

#### 🔴 Expert Example
```typescript
const compose =
  <A, B, C>(f: (b: B) => C, g: (a: A) => B) =>
  (a: A): C =>
    f(g(a));
```

#### 🌍 Real-Time Example
```typescript
const debounce = <T extends (...args: any[]) => void>(fn: T, ms: number) => {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
```
### 6.2 `this` in arrow functions vs function expressions

#### 🟢 Beginner Example
```typescript
const counter = {
  n: 0,
  inc: function (this: { n: number }) {
    this.n++;
  },
  // arrow: cannot use this-parameter meaningfully for the object
  badInc: () => {
    // `this` is lexical (often undefined in strict modules)
  },
};
```

#### 🟡 Intermediate Example
```typescript
class Timer {
  private ticks = 0;
  start() {
    setInterval(() => {
      this.ticks++; // lexical this from Timer instance
    }, 1000);
  }
}
```

#### 🔴 Expert Example
```typescript
// EventEmitter-style: store arrow to preserve this
class Emitter {
  private listeners: Array<(payload: unknown) => void> = [];
  subscribe(fn: (payload: unknown) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}
```

#### 🌍 Real-Time Example
```typescript
// React: hooks rely on closures; arrow callbacks common
function useIncrement() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}
```
## 7. Callback Functions

**Callbacks** are functions passed as arguments. Annotate them with function types, mark them **optional** when appropriate, and specify **return types** (including `void`).

### 7.1 Callback type annotations and optional callbacks

#### 🟢 Beginner Example
```typescript
function withNotify(message: string, onDone?: () => void): void {
  console.log(message);
  onDone?.();
}
```

#### 🟡 Intermediate Example
```typescript
function download(url: string, onProgress?: (pct: number) => void): Promise<Blob> {
  return fetch(url).then(async (res) => {
    onProgress?.(50);
    return res.blob();
  });
}
```

#### 🔴 Expert Example
```typescript
type NodeStyleCallback<T> = (err: Error | null, result?: T) => void;

function readFile(path: string, cb: NodeStyleCallback<string>): void {
  setTimeout(() => cb(null, "contents"), 0);
}
```

#### 🌍 Real-Time Example
```typescript
function track(event: string, props?: Record<string, unknown>, onSent?: () => void): void {
  navigator.sendBeacon("/track", JSON.stringify({ event, props }));
  onSent?.();
}
```
### 7.2 Callback return types

#### 🟢 Beginner Example
```typescript
function runTwice(fn: () => void): void {
  fn();
  fn();
}
```

#### 🟡 Intermediate Example
```typescript
function mapAsync<T, U>(items: T[], fn: (t: T) => Promise<U>): Promise<U[]> {
  return Promise.all(items.map(fn));
}
```

#### 🔴 Expert Example
```typescript
// Callback returns Result type for typed errors
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function tryMap<T, U, E>(
  items: T[],
  fn: (t: T) => Result<U, E>
): Result<U[], E> {
  const out: U[] = [];
  for (const t of items) {
    const r = fn(t);
    if (!r.ok) return r;
    out.push(r.value);
  }
  return { ok: true, value: out };
}
```

#### 🌍 Real-Time Example
```typescript
// Stripe-like: user supplies idempotency key factory
function charge(
  amount: number,
  getKey: () => string
): Promise<{ id: string }> {
  const key = getKey();
  return Promise.resolve({ id: key });
}
```
## 8. Higher-Order Functions

**Higher-order functions** return functions or take functions as arguments. TypeScript can express them with **generics**, **`Parameters`**, and **`ReturnType`**.

### 8.1 Functions returning functions

#### 🟢 Beginner Example
```typescript
function makeGreeter(salutation: string): (name: string) => string {
  return (name) => `${salutation}, ${name}`;
}
```

#### 🟡 Intermediate Example
```typescript
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as ReturnType<T>;
    const v = fn(...args);
    cache.set(key, v);
    return v;
  }) as T;
}
```

#### 🔴 Expert Example
```typescript
function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a) => (b) => fn(a, b);
}
```

#### 🌍 Real-Time Example
```typescript
// Express middleware factory
type Handler = (req: unknown, res: unknown, next: () => void) => void;

function requireRole(role: string): Handler {
  return (_req, _res, next) => {
    if (/* check role */ true) next();
    else next(); // would call error handler in real app
  };
}
```
### 8.2 Functions accepting functions and type safety

#### 🟢 Beginner Example
```typescript
function twice(n: number, op: (x: number) => number): number {
  return op(op(n));
}
```

#### 🟡 Intermediate Example
```typescript
function pipe<A, B, C>(a: A, f: (x: A) => B, g: (x: B) => C): C {
  return g(f(a));
}
```

#### 🔴 Expert Example
```typescript
// Prefer small overload sets for pipe/flow-style HOFs — full variadic inference is verbose
function flow<A, B>(f: (a: A) => B): (a: A) => B;
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C;
function flow(...fns: Array<(x: unknown) => unknown>): (x: unknown) => unknown {
  return (x) => fns.reduce((v, fn) => fn(v), x);
}
```

#### 🌍 Real-Time Example
```typescript
function batchProcess<T>(
  items: T[],
  process: (chunk: T[]) => Promise<void>,
  chunkSize: number
): Promise<void> {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks.reduce((p, c) => p.then(() => process(c)), Promise.resolve());
}
```
## 9. Function Guidelines

Practical guidance for **overload design**, **`this` declarations**, **rest parameters**, **destructuring**, **`unknown` vs `any`**, and **`void` vs `undefined`**.

### 9.1 Writing good overloads

#### 🟢 Beginner Example
```typescript
// Prefer few overloads; widen implementation
function padLeft(value: string, padding: string): string;
function padLeft(value: string, padding: number): string;
function padLeft(value: string, padding: string | number): string {
  if (typeof padding === "number") return " ".repeat(padding) + value;
  return padding + value;
}
```

#### 🟡 Intermediate Example
```typescript
// Put specific overloads before general ones
declare function parse(s: "true" | "false"): boolean;
declare function parse(s: string): unknown;
```

#### 🔴 Expert Example
```typescript
// When overloads get unwieldy, use discriminated unions as a single parameter
type Input =
  | { kind: "id"; value: string }
  | { kind: "ids"; value: string[] };

function resolve(input: Input): string[] {
  return input.kind === "id" ? [input.value] : input.value;
}
```

#### 🌍 Real-Time Example
```typescript
// Public API: overloads for ergonomics, single implementation
interface Client {
  getBaseUrl(): string;
}
declare function createClient(token: string): Client;
declare function createClient(opts: { token: string; baseUrl?: string }): Client;
```
### 9.2 Declaring `this`, rest, and destructuring

#### 🟢 Beginner Example
```typescript
// Explicit this + rest
function sumThis(this: { factor: number }, ...nums: number[]): number {
  return nums.reduce((a, n) => a + n * this.factor, 0);
}
```

#### 🟡 Intermediate Example
```typescript
// Destructure with defaults in params
function draw({ x = 0, y = 0 }: { x?: number; y?: number } = {}): void {
  console.log(x, y);
}
```

#### 🔴 Expert Example
```typescript
// Tuple rest for variadic tuple manipulation (TS 4+)
type Append<Head extends unknown[], T> = [...Head, T];

function pushTuple<T extends unknown[], U>(tuple: T, item: U): Append<T, U> {
  return [...tuple, item] as Append<T, U>;
}
```

#### 🌍 Real-Time Example
```typescript
function initAnalytics({
  apiKey,
  debug = false,
}: {
  apiKey: string;
  debug?: boolean;
}): void {
  if (debug) console.debug("analytics init", apiKey);
}
```
### 9.3 `unknown` vs `any` and `void` vs `undefined`

#### 🟢 Beginner Example
```typescript
// any opts out of checking
function unsafe(x: any) {
  x.foo.bar(); // no error
}

// unknown forces narrowing
function safe(x: unknown) {
  if (typeof x === "object" && x !== null && "foo" in x) {
    console.log((x as { foo: unknown }).foo);
  }
}
```

#### 🟡 Intermediate Example
```typescript
// void: caller should ignore return; you may still return a value (discouraged)
function fireAndForget(): void {
  return undefined; // ok
}

// undefined: explicitly might return undefined
function maybe(): string | undefined {
  return Math.random() > 0.5 ? "yes" : undefined;
}
```

#### 🔴 Expert Example
```typescript
// Callback returning void is special: any return is allowed (ignored)
type VoidCb = () => void;
const cb: VoidCb = () => 123; // ok in TypeScript

// Prefer explicit undefined in data models; void for side-effect callbacks
```

#### 🌍 Real-Time Example
```typescript
// API boundary: parse body as unknown then validate
function handleWebhook(body: unknown): void {
  if (
    typeof body === "object" &&
    body !== null &&
    "type" in body &&
    typeof (body as { type: unknown }).type === "string"
  ) {
    // route event
  }
}
```
## Best Practices

1. **Exported functions:** use explicit return types so refactors do not widen contracts silently; use `unknown` at JSON/user boundaries and narrow instead of `any`.
2. **Overloads:** order from most specific to general; prefer one signature with optional/default params when it covers all cases.
3. **Rest and callbacks:** type rest as narrowly as you can; declare `this` on callback types for DOM- or library-style APIs; document sync vs async and error conventions in types when helpful.
4. **Generics:** use `extends` to tie keys to values; split unreadable HOF utility types into aliases or small overload sets.
5. **Return intent:** use `void` for side-effect-only callbacks; for “missing” values in data, prefer `null`, `Result`, or a clear union over ambiguous `undefined`.

## Common Mistakes to Avoid

| Mistake | Why it hurts | Safer approach |
|--------|----------------|----------------|
| Over-using `any` | Disables checking for the whole chain | `unknown` + narrowing or generics |
| Optional before required | Invalid or confusing call shapes | Reorder or use an options object |
| Missing `this` on library callbacks | Wrong `this` in user code | Add `this` to the callback type |
| Too many overloads | Brittle resolution, hard maintenance | Discriminated unions or generics |
| `noImplicitAny` off + untyped params | Silent weak typing | Enable strictness; annotate params |
| Arrow fields when you need dynamic `this` | Lexical `this` bugs | Methods or explicit `bind` |
| Wrong overload order | Unexpected overload wins | Most specific overloads first |

## Comparison Table

| Topic | What it is | Syntax / keyword | When to use |
|-------|------------|------------------|-------------|
| Function / call / construct types | Callable shape on value or object | `(x: T) => U`, `{ (x: T): U }`, `new (x: T) => R` | Props, factories, plugins |
| Type alias for functions | Reusable named callable | `type F = (...) => R` | Shared module APIs |
| Optional / default / rest | Arity and defaults | `x?: T`, `x = 1`, `...xs: T[]` | Optional input, defaults, variadic |
| `this` parameter | Type of `this` | `function (this: T, ...)` | DOM, jQuery-style, mixins |
| Return typing | Output contract | `: R` explicit, inferred, `: void`, `: never` | APIs, exhaustiveness, no-return |
| Overloads | Multiple external signatures | Declarations + one implementation | Distinct call shapes |
| Generics + `extends` | Parameterized + bounded | `<T>(x: T)`, `<T extends U>` | Reuse, keyed access, lengths |
| Arrow vs function | Lexical vs dynamic `this` | `(x) => y` vs `function` | Callbacks vs methods |
| Callback / HOF | Fn param or return | `fn: (e: E) => R`, `(f: F) => G` | Events, compose, middleware |
| `unknown` / `any` | Safe boundary vs unchecked | `unknown`, `any` | External data vs legacy only |

