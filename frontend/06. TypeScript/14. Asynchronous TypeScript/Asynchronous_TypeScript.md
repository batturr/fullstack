# Asynchronous TypeScript

**Asynchronous programming** in TypeScript layers static types over JavaScript’s event loop, promises, async functions, callbacks, streams, and iterators. The compiler tracks *what resolves when*: `Promise<T>` models a future value, `async`/`await` sugar preserves return types, utility types like `Awaited<T>` peel nested promises, and libraries such as RxJS expose `Observable<T>` for push-based workflows. Typed async code catches mismatched shapes early (e.g. forgetting `await`, wrong tuple lengths from `Promise.all`, or unsafe callback `any` usage). This guide covers promises, async/await, callbacks, RxJS observables, async iterators, and reusable async patterns—with examples from beginner through production-style usage.

---

## 📑 Table of Contents

1. [Promises with TypeScript](#1-promises-with-typescript)
2. [Async/Await](#2-asyncawait)
3. [Callbacks with TypeScript](#3-callbacks-with-typescript)
4. [Observables (RxJS)](#4-observables-rxjs)
5. [Async Iterators](#5-async-iterators)
6. [Async Patterns](#6-async-patterns)
7. [Best Practices](#7-best-practices)
8. [Common Mistakes](#8-common-mistakes)

## 1. Promises with TypeScript

A **`Promise<T>`** represents a value of type `T` that may arrive later (or fail). TypeScript treats `Promise` as a generic interface: unresolved work is `Promise<Pending>` in spirit, but the type parameter describes the **fulfilled** value. **Type inference** flows from `new Promise((resolve) => ...)` and from `async` functions. **Generic constraints** let you write factories that return `Promise<T>` where `T` must extend a base (e.g. `Serializable`). Static helpers **`Promise.all`**, **`Promise.race`**, **`Promise.allSettled`**, and **`Promise.any`** have distinct typings: `all` preserves tuple lengths when given a tuple, `allSettled` yields a union of fulfilled/rejected result objects, `race` is the union of input promise value types, and `any` aggregates errors in an `AggregateError` while succeeding on the first fulfillment.

### 🟢 Beginner Example

```typescript
// Explicit Promise<string>
function fetchGreeting(): Promise<string> {
  return Promise.resolve("Hello");
}

// Inference: resolve(123) => Promise<number>
function delayNumber(ms: number): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(42), ms);
  });
}

async function main() {
  const s: string = await fetchGreeting();
  const n: number = await delayNumber(10);
  console.log(s, n);
}
```

### 🟡 Intermediate Example

```typescript
// Generic function: T must be object-like for JSON
async function fetchJson<T extends Record<string, unknown>>(
  url: string
): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as T;
}

// Promise.all: tuple in => tuple of awaited types out
declare function id<T>(x: T): Promise<T>;

async function tupleAll() {
  const [a, b, c] = await Promise.all([
    id("a" as const),
    id(1 as const),
    id(true as const),
  ]);
  // a: "a", b: 1, c: true
  return { a, b, c };
}

// Promise.allSettled: never throws; discriminated union per entry
async function settled() {
  const results = await Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(new Error("x")),
  ]);
  for (const r of results) {
    if (r.status === "fulfilled") {
      console.log(r.value); // number
    } else {
      console.error(r.reason);
    }
  }
}
```

### 🔴 Expert Example

```typescript
// Constrained async factory: output type tied to input keys
type AsyncRecord<K extends string, V> = Promise<Record<K, V>>;

async function buildMap<K extends string, V>(
  keys: readonly K[],
  loader: (k: K) => Promise<V>
): AsyncRecord<K, V> {
  const entries = await Promise.all(
    keys.map(async (k) => [k, await loader(k)] as const)
  );
  return Object.fromEntries(entries) as Record<K, V>;
}

// Promise.race: Awaited union of branches (narrow with runtime checks)
async function raceExample(
  fast: Promise<{ kind: "fast"; ms: number }>,
  slow: Promise<{ kind: "slow"; id: string }>
) {
  const winner = await Promise.race([fast, slow]);
  // winner: { kind: "fast"; ms: number } | { kind: "slow"; id: string }
  if (winner.kind === "fast") {
    return winner.ms;
  }
  return winner.id;
}

// Promise.any: first fulfillment; catch clause gets AggregateError
declare const p1: Promise<number>;
declare const p2: Promise<number>;

async function anyNumber() {
  try {
    return await Promise.any([p1, p2]);
  } catch (e) {
    if (e instanceof AggregateError) {
      return e.errors as unknown[];
    }
    throw e;
  }
}
```

### 🌍 Real-Time Example

```typescript
// Dashboard: parallel resource fetches with typed JSON and fallbacks
type User = { id: string; name: string };
type Metrics = { cpu: number; mem: number };

async function loadDashboard(userId: string): Promise<{
  user: User | null;
  metrics: Metrics | null;
}> {
  const userUrl = `/api/users/${encodeURIComponent(userId)}`;
  const metricsUrl = `/api/metrics/${encodeURIComponent(userId)}`;

  const [userResult, metricsResult] = await Promise.allSettled([
    fetch(userUrl).then((r) => r.json() as Promise<User>),
    fetch(metricsUrl).then((r) => r.json() as Promise<Metrics>),
  ]);

  return {
    user: userResult.status === "fulfilled" ? userResult.value : null,
    metrics:
      metricsResult.status === "fulfilled" ? metricsResult.value : null,
  };
}
```

## 2. Async/Await

An **`async function`** always returns **`Promise<R>`** where `R` is the type you write after `return` in the function body (TypeScript wraps it). **`await`** accepts *thenables*; for `Promise<T>`, the expression type after `await` is **`Awaited<T>`** (which flattens nested promises). Use **`Awaited<T>`** in generic utilities to model “fully unwrapped” async results. **Error handling** combines `try`/`catch` with typed `unknown` in `catch`, or result types (`{ ok: true; value: T } | { ok: false; error: E }`) for explicit control flow without exceptions.

### 🟢 Beginner Example

```typescript
// Async return type is Promise<number> even though you return a number
async function double(n: number): Promise<number> {
  return n * 2;
}

async function caller() {
  const x = await double(3); // x: number
  const p = double(3); // p: Promise<number> — forgot await
  return { x, p };
}
```

### 🟡 Intermediate Example

```typescript
// Nested Promise: await flattens one level; Awaited<> describes final type
type Deep = Promise<Promise<string>>;
type Flat = Awaited<Deep>; // string

async function unwrapDeep(v: Deep): Promise<string> {
  const once = await v; // Promise<string>
  return await once; // string
}

// try/catch with unknown
async function safeParse(json: string): Promise<number | null> {
  try {
    const data = JSON.parse(json) as unknown;
    if (typeof data === "number") return data;
    return null;
  } catch {
    return null;
  }
}
```

### 🔴 Expert Example

```typescript
// Generic async pipeline: Awaited<U> ties steps together
async function pipe<A, B, C>(
  a: A,
  f: (x: A) => B | Promise<B>,
  g: (x: Awaited<B>) => C | Promise<C>
): Promise<Awaited<C>> {
  const b = await f(a);
  return await g(b);
}

// Conditional return: union narrows after await
async function fetchFlag(on: boolean): Promise<"yes" | "no"> {
  if (on) return "yes";
  return Promise.resolve("no");
}

// Discriminated async result helper
type AsyncResult<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function toResult<T>(
  p: Promise<T>
): Promise<AsyncResult<T, unknown>> {
  try {
    return { ok: true, value: await p };
  } catch (error) {
    return { ok: false, error };
  }
}
```

### 🌍 Real-Time Example

```typescript
// Payment intent: sequential awaits with typed errors and telemetry
class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: "network" | "declined" | "invalid"
  ) {
    super(message);
  }
}

async function chargeCard(amount: number): Promise<{ id: string }> {
  if (amount <= 0) {
    throw new PaymentError("Invalid amount", "invalid");
  }
  // Simulate gateway
  await new Promise((r) => setTimeout(r, 50));
  return { id: "ch_123" };
}

async function checkout(total: number) {
  try {
    const charge = await chargeCard(total);
    return { success: true as const, chargeId: charge.id };
  } catch (e) {
    if (e instanceof PaymentError) {
      return { success: false as const, code: e.code };
    }
    return { success: false as const, code: "network" as const };
  }
}
```

## 3. Callbacks with TypeScript

Before promises dominated APIs, **callbacks** threaded completion through function parameters. TypeScript models them with **function types**: `(err: Error | null, result: T) => void` for **Node-style error-first** callbacks, or `(value: T) => void` for success-only APIs. **Generic callbacks** reuse one signature for many `T` values (e.g. `Array#map`). Prefer `unknown` over `any` for untyped payloads, and use **overloads** when the callback shape changes with options.

### 🟢 Beginner Example

```typescript
type SuccessCb<T> = (value: T) => void;

function loadName(cb: SuccessCb<string>): void {
  setTimeout(() => cb("Ada"), 0);
}

loadName((name) => {
  console.log(name.toUpperCase());
});
```

### 🟡 Intermediate Example

```typescript
// Error-first Node-style callback
type NodeCb<T> = (err: Error | null, result?: T) => void;

function readFakeFile(path: string, cb: NodeCb<string>): void {
  if (!path) {
    cb(new Error("empty path"));
    return;
  }
  cb(null, "file contents");
}

readFakeFile("ok.txt", (err, data) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(data!.length);
});
```

### 🔴 Expert Example

```typescript
// Generic callback with constrained result
function withCache<K extends string, V>(
  key: K,
  fetcher: (k: K, done: NodeCb<V>) => void,
  cb: NodeCb<V>
): void {
  // ... pretend cache lookup
  fetcher(key, cb);
}

// Callback + Promise bridge (typed)
function promisifyNode<T>(
  fn: (cb: NodeCb<T>) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result as T);
    });
  });
}
```

### 🌍 Real-Time Example

```typescript
// Legacy SDK wrapper: preserve callback types at the boundary
type EventMap = {
  message: { text: string; userId: string };
  ping: { at: number };
};

type EventName = keyof EventMap;

type LegacyListener<E extends EventName> = (payload: EventMap[E]) => void;

class LegacyBus {
  private listeners = new Map<EventName, Set<LegacyListener<EventName>>>();

  on<E extends EventName>(event: E, cb: LegacyListener<E>): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(cb as LegacyListener<EventName>);
  }

  emit<E extends EventName>(event: E, payload: EventMap[E]): void {
    this.listeners.get(event)?.forEach((cb) =>
      (cb as LegacyListener<E>)(payload)
    );
  }
}
```

## 4. Observables (RxJS)

**RxJS** models asynchronous streams with **`Observable<T>`**, which pushes notifications of type `T` over time. The **`Observer<T>`** interface types `next`, `error`, and `complete`. **Operators** are typically functions `(source: Observable<A>) => Observable<B>` or higher-order variants; TypeScript carries `A` → `B` through generics. **`Subject<T>`** is both an `Observer` and an `Observable`, useful for multicasting; variants like `BehaviorSubject<T>` and `ReplaySubject<T>` refine initial/replay semantics. Install with `npm install rxjs` and import from `'rxjs'` / `'rxjs/operators'` (pipeable style).

### 🟢 Beginner Example

```typescript
import { Observable } from "rxjs";

const nums = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

nums.subscribe({
  next: (n) => console.log(n),
  error: (e) => console.error(e),
  complete: () => console.log("done"),
});
```

### 🟡 Intermediate Example

```typescript
import { Observable, map, filter } from "rxjs";

function parsePositiveInts(source: Observable<string>): Observable<number> {
  return source.pipe(
    map((s) => Number(s)),
    filter((n): n is number => Number.isInteger(n) && n > 0)
  );
}

// Subject as event bus
import { Subject } from "rxjs";

const clicks = new Subject<{ x: number; y: number }>();
clicks.subscribe((p) => console.log(p.x, p.y));
clicks.next({ x: 10, y: 20 });
```

### 🔴 Expert Example

```typescript
import {
  Observable,
  defer,
  switchMap,
  catchError,
  of,
  OperatorFunction,
} from "rxjs";

// Custom operator: preserve input type metadata
function retryWith<T>(
  attempts: number,
  delayMs: number
): OperatorFunction<T, T> {
  return (source) =>
    defer(() => {
      let count = 0;
      return new Observable<T>((sub) => {
        const trySub = source.subscribe({
          next: (v) => sub.next(v),
          error: (err) => {
            count += 1;
            if (count >= attempts) {
              sub.error(err);
              return;
            }
            setTimeout(() => {
              trySub.unsubscribe();
              source.subscribe(trySub);
            }, delayMs);
          },
          complete: () => sub.complete(),
        });
        return trySub;
      });
    });
}

// Higher-order: switchMap unwraps inner Observable
declare function fetchUser(id: string): Observable<{ id: string; name: string }>;
declare const id$: Observable<string>;

const user$ = id$.pipe(
  switchMap((id) => fetchUser(id)),
  catchError(() => of({ id: "anon", name: "Guest" }))
);
```

### 🌍 Real-Time Example

```typescript
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { BehaviorSubject } from "rxjs";

type ServerMsg =
  | { type: "price"; symbol: string; value: number }
  | { type: "error"; message: string };

// Typed WebSocketSubject (configure serializer/deserializer in real apps)
function connectPrices(url: string): WebSocketSubject<ServerMsg> {
  return webSocket<ServerMsg>({ url });
}

class PriceStore {
  private readonly latest = new BehaviorSubject<Record<string, number>>({});

  constructor(private readonly socket: WebSocketSubject<ServerMsg>) {
    this.socket.subscribe({
      next: (msg) => {
        if (msg.type === "price") {
          this.latest.next({
            ...this.latest.getValue(),
            [msg.symbol]: msg.value,
          });
        }
      },
      error: () => {
        /* reconnect policy */
      },
    });
  }

  snapshot() {
    return this.latest.getValue();
  }
}
```

## 5. Async Iterators

**Async iterables** expose `[Symbol.asyncIterator]()` returning an **`AsyncIterator<T>`** whose `next()` returns `Promise<IteratorResult<T>>`. The **`for await...of`** loop consumes them with proper `await` per step. **Async generator functions** (`async function*`) yield promises transparently and return `AsyncIterableIterator<T>`. Typing aligns with sync iterators but uses `AsyncIterable<T>` / `AsyncIterator<T>` from `Symbol.asyncIterator` and lib definitions.

### 🟢 Beginner Example

```typescript
async function* countTo(n: number): AsyncIterableIterator<number> {
  for (let i = 1; i <= n; i++) {
    await Promise.resolve(); // optional async boundary
    yield i;
  }
}

async function printCount() {
  for await (const v of countTo(3)) {
    console.log(v);
  }
}
```

### 🟡 Intermediate Example

```typescript
// Manual AsyncIterable
class DelayedRange implements AsyncIterable<number> {
  constructor(
    private readonly start: number,
    private readonly end: number
  ) {}

  [Symbol.asyncIterator](): AsyncIterator<number> {
    let i = this.start;
    return {
      next: async () => {
        if (i > this.end) {
          return { value: undefined, done: true };
        }
        await new Promise((r) => setTimeout(r, 10));
        return { value: i++, done: false };
      },
    };
  }
}

async function consume() {
  const values: number[] = [];
  for await (const n of new DelayedRange(1, 3)) {
    values.push(n);
  }
  return values;
}
```

### 🔴 Expert Example

```typescript
// Merge async iterables with typing preserved
async function* mergeAsync<T>(
  ...sources: AsyncIterable<T>[]
): AsyncIterableIterator<T> {
  const iterators = sources.map((s) => s[Symbol.asyncIterator]());
  const pending = new Map(
    iterators.map((it, idx) => [idx, it.next()] as const)
  );

  while (pending.size) {
    const [idx, result] = await Promise.race(
      [...pending.entries()].map(async ([i, p]) => {
        const r = await p;
        return [i, r] as const;
      })
    );

    pending.delete(idx);
    if (!result.done) {
      yield result.value;
      const it = iterators[idx];
      pending.set(idx, it.next());
    }
  }
}
```

### 🌍 Real-Time Example

```typescript
// Paginated API as async iterator (backpressure-friendly)
type Page<T> = { items: T[]; nextCursor?: string };

async function* fetchAllPages<T>(
  fetchPage: (cursor?: string) => Promise<Page<T>>
): AsyncIterableIterator<T> {
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    for (const item of page.items) {
      yield item;
    }
    cursor = page.nextCursor;
  } while (cursor);
}

// Consumer
async function syncProducts(
  fetchPage: (c?: string) => Promise<Page<{ sku: string }>>
) {
  for await (const product of fetchAllPages(fetchPage)) {
    await fetch("/api/sync", {
      method: "POST",
      body: JSON.stringify(product),
      headers: { "content-type": "application/json" },
    });
  }
}
```

## 6. Async Patterns

Production code composes small **patterns**: **retry** (repeat until success or cap), **timeout** (fail if too slow), **race** (first wins), and **parallel execution** (bounded or unbounded concurrency). TypeScript adds value by typing *attempt counts*, *delays*, *results vs errors*, and **task shapes** (`() => Promise<T>`). Use generics so a retry helper returns the same `T` as the inner task, and model **cancellation** with `AbortSignal` where APIs support it.

### 🟢 Beginner Example

```typescript
// Parallel: Promise.all keeps types
async function loadAB(): Promise<[string, number]> {
  const a = Promise.resolve("A");
  const b = Promise.resolve(2);
  return Promise.all([a, b]);
}
```

### 🟡 Intermediate Example

```typescript
// Timeout pattern: reject after ms unless task wins
function withTimeout<T>(task: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([task, timeout]);
}

// Retry with exponential backoff (typed T)
async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  baseDelayMs: number
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      await new Promise((r) =>
        setTimeout(r, baseDelayMs * 2 ** i)
      );
    }
  }
  throw lastError;
}
```

### 🔴 Expert Example

```typescript
// Bounded parallel pool: preserve order of completion typing via mapper
async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function run(): Promise<void> {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    run()
  );
  await Promise.all(runners);
  return results;
}

// Race condition typing: model shared state updates as serial async queue
type Job<T> = () => Promise<T>;

class AsyncQueue {
  private tail: Promise<unknown> = Promise.resolve();

  enqueue<T>(job: Job<T>): Promise<T> {
    const result = this.tail.then(() => job());
    this.tail = result.catch(() => {});
    return result;
  }
}
```

### 🌍 Real-Time Example

```typescript
// Real-time ingestion: bounded concurrency + per-shard timeout + retries
type IngestResult = { id: string; bytes: number };

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const t = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new Error("timeout")), ms)
  );
  return Promise.race([p, t]);
}

async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  baseDelayMs: number
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
    }
  }
  throw lastError;
}

async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function run(): Promise<void> {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run()
  );
  await Promise.all(runners);
  return results;
}

async function ingestShard(shard: Blob): Promise<IngestResult> {
  await new Promise((r) => setTimeout(r, 30));
  return { id: crypto.randomUUID(), bytes: shard.size };
}

async function ingestAllShards(
  shards: readonly Blob[],
  opts: { perShardTimeoutMs: number; retries: number; concurrency: number }
): Promise<IngestResult[]> {
  return mapPool(shards, opts.concurrency, async (blob) =>
    retry(
      () => withTimeout(ingestShard(blob), opts.perShardTimeoutMs),
      opts.retries,
      50
    )
  );
}
```

---

## 7. Best Practices

- **Prefer `Promise<T>` and `async`/`await`** for linear control flow; reserve callbacks for legacy boundaries and wrap them with `new Promise` or small typed adapters.
- **Annotate public async APIs** explicitly (`Promise<MyDto>`) so refactors do not silently widen return types; let inference work inside private helpers.
- **Use `Awaited<T>`** when building generic utilities over async functions or nested `Promise` types instead of hand-written conditional types.
- **Type `catch` as `unknown`** and narrow with `instanceof` or type guards before accessing properties; avoid `any` in async error paths.
- **Choose the right static helper**: `Promise.all` for fail-fast tuples, `allSettled` when partial success matters, `race` for timeouts or first-wins, `any` for redundant providers.
- **Model cancellation** with `AbortSignal` and `fetch`/library support; thread the signal through async stacks for predictable teardown.
- **For streams**, prefer RxJS (or similar) when you need operators, multicasting, and backpressure strategies; use async iterators when consuming pull-based or native async sequences.
- **Avoid floating promises**: enable `no-floating-promises` (typescript-eslint) so fire-and-forget is explicit (`void promise` or `void (async () => { ... })()`).
- **Keep concurrency bounded** in pools and batch jobs; type workers as `(item: T) => Promise<R>` and return `Promise<R[]>` for traceable outputs.
- **Document time semantics** (timeouts, retries, ordering) next to function types—types express *what*, comments express *how long* and *how often*.

## 8. Common Mistakes

- **Forgetting `await`**: the variable becomes `Promise<T>` instead of `T`, breaking downstream types and runtime logic.
- **Assuming `Promise.all` on mixed types widens to a union**: passing an array literal (not `as const` tuple) often becomes `(string | number)[]`—use tuples or `as const` when you need positional typing.
- **Treating `async` return as synchronous**: `return value` inside `async` still wraps in a promise; returning another `Promise` does not double-wrap at runtime but types can get confusing—stay consistent.
- **Using `any` in `then` chains**: erases errors from `JSON.parse`, network payloads, or third-party SDKs—prefer `unknown` + validation (zod/io-ts) or typed assertions at a single boundary.
- **Swallowing errors in `finally` or empty `catch`**: TypeScript cannot enforce “handle every rejection”; log or rethrow with context.
- **Mis-typing Node-style callbacks**: optional `result` when `err` is null leads to unsafe `!` assertions—encode invariants with overloads or result types.
- **Subscribing to RxJS without teardown**: memory leaks are not type errors; use `takeUntil`, `Subscription` management, or `async` interop with discipline.
- **`for await...of` on sync iterables**: works (wraps values) but can hide accidental sync loops—be explicit about async vs sync sources.
- **Unbounded `Promise.all` on huge arrays**: can exhaust sockets or memory; use pools (`mapPool`) and typed chunking.
- **Ignoring `AggregateError` from `Promise.any`**: callers must handle the rejection shape or risk untyped error inspection.

---

*These notes assume TypeScript 5.x with `"lib"` including ES2021+ for `AggregateError` / `Promise.any` where used, and optional RxJS 7+ for observable examples.*
