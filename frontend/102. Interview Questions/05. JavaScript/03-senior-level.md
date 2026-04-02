# JavaScript Interview Questions — Senior (7+ Years)

100 advanced questions with detailed answers for senior and staff-level developers.

---

## 1. How does the V8 engine compile and optimize JavaScript code (Ignition, TurboFan)?

V8 does not execute source text directly as a permanent strategy: it parses JavaScript into an AST, then Ignition compiles functions to compact bytecode that runs with relatively low memory and collects type feedback at each bytecode site. Functions that become “hot” are candidates for TurboFan, which lowers optimized machine code from a graph-based IR using speculative assumptions (types, shapes, control flow) derived from profiling. When those assumptions fail, the runtime deoptimizes to Ignition or re-optimizes with updated feedback, preserving correctness at the cost of a discontinuity in throughput. This tiered design trades off startup latency against peak performance—cold code stays cheap, hot code can approach native speed when stable. In production systems, p99 latency often traces to deoptimization storms or megamorphic sites rather than average CPU, so senior engineers correlate flame graphs with object layout churn. Team conventions for stable constructors and monomorphic hot paths are architectural decisions, not micro-optimizations. Ignition remains the reliable baseline; TurboFan is a reward for predictable workloads.

```javascript
function Point(x, y) {
  this.x = x;
  this.y = y;
}
function sumMany(points) {
  let s = 0;
  for (let i = 0; i < points.length; i++) s += points[i].x + points[i].y;
  return s;
}
```

---

## 2. What is Just-In-Time (JIT) compilation and how does it work in JavaScript engines?

JIT compilation generates native (or highly optimized) code at runtime, using observations from actual executions rather than only static analysis. Because JavaScript is dynamically typed, the JIT combines profiling with speculation: it emits fast paths for observed types and inserts guards that verify those assumptions on later runs. When guards fail, execution falls back to less specialized tiers or recompiles with broader assumptions. This contrasts with ahead-of-time compilers that must remain conservative for unknown types. The practical lesson for senior engineers is that “fast JavaScript” is often predictable JavaScript: stable call sites, consistent object shapes, and avoiding accidental polymorphism at inner loops. Cold-start heavy services may never amortize JIT wins; steady traffic allows specialization to pay off. Always validate performance under production-like object diversity, not only microbenchmarks on homogeneous inputs.

```javascript
function add(a, b) {
  return a + b;
}
```

---

## 3. What are hidden classes (shapes/maps) and inline caches in V8?

Hidden classes (maps) describe an object’s layout: which properties exist, their order, and storage locations. Objects constructed with the same sequence of property additions can share a hidden class, enabling monomorphic property access through known offsets. Inline caches record, at a specific bytecode site, what was observed last time—often a hidden class id and offset—so repeated compatible accesses avoid generic dictionary lookups. When property addition order diverges or objects fall into dictionary mode, caches become polymorphic or megamorphic and performance drops. API boundaries that accept arbitrary object shapes and pass them into hot inner loops without normalization are a common source of megamorphism. Reviews should flag `delete` on hot objects and dynamic key assignment patterns. Measuring with engine-specific tracing (where available) can confirm IC states when regressions appear after refactors.

```javascript
function makeA() {
  const o = {};
  o.x = 1;
  o.y = 2;
  return o;
}
function makeB() {
  const o = {};
  o.y = 2;
  o.x = 1;
  return o;
}
```

---

## 4. How does the garbage collector work in V8 (Orinoco, generational GC, mark-sweep-compact)?

V8’s collector is generational: most allocations die young, so a nursery is collected frequently with copying, promoting survivors to older generations. Older generations use mark–sweep with compaction phases to limit fragmentation and reclaim large unreachable graphs. Incremental and concurrent marking interleave work with the mutator to shorten stop-the-world pauses, though some steps still synchronize. The operational insight is that retaining unnecessary graphs shifts work to major collections and increases pause risk. Production issues often tie to accidental global caches, unbounded listeners, or detached DOM retained by JS references. Profiling allocation sites and retained size helps prioritize fixes over micro-optimizing allocation counts. Node workloads benefit from tuning heap limits and watching for native addon leaks outside the JS heap.

```javascript
function alloc(n) {
  const a = [];
  for (let i = 0; i < n; i++) a.push({ i });
  return a;
}
```

---

## 5. What is the difference between stack-allocated and heap-allocated values in JavaScript?

Primitives are manipulated by value in local computation, while object references live on the stack as pointers into the heap where objects, arrays, closures, and environments reside. The stack records call frames for active invocations; when a frame ends, its locals disappear unless captured by a closure that outlives the call. Closures keep environment cells alive, holding references to heap objects even after the outer function returns—this is the primary retention mechanism behind many “leaks.” Understanding the split explains why returning large arrays from hot paths is fine if ephemeral, but returning inner functions that close over request-scoped megabyte buffers is not. Profiling tools show retainers from closure → environment → object graph. Architectural guidance: pass IDs through long-lived callbacks and fetch data in bounded scopes.

```javascript
function outer() {
  const big = new Uint8Array(10_000_000);
  return () => big[0];
}
```

---

## 6. How does the event loop work at the libuv/browser level (phases, poll, timers)?

In Node.js, libuv schedules phases: timers, pending callbacks, poll for I/O, check (`setImmediate`), close callbacks, with `nextTick` and microtasks interleaved per their own rules. Browsers follow HTML’s task sources: tasks (macrotasks) include events, parsing, and timer callbacks, while microtasks flush after each task. The unifying mental model is cooperative single-threaded execution: run a task, drain microtasks, then render (browser) or continue phases (Node). Long synchronous JS blocks timers, I/O readiness, and paint. Architecturally, move CPU-heavy work to workers, chunk work with `scheduler.postTask`, and never assume `setTimeout(fn,0)` orders relative to I/O without reading your platform’s guarantees. Distributed tracing across async boundaries requires explicit correlation IDs carried through promises.

```javascript
setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('micro'));
console.log('sync');
```

---

## 7. What are microtask checkpoints and how does the browser schedule them?

Microtasks include promise reactions, explicit `queueMicrotask`, and mutation observer deliveries; they run after the current stack empties and before the next macrotask. The spec schedules a microtask checkpoint at defined points—after each task, and sometimes after scripts—so promise continuations interleave deterministically with respect to tasks. Nested `queueMicrotask` scheduling drains until empty, which can starve rendering if abused. Frameworks rely on this ordering for batched updates and consistent state before paint. Node differs slightly: `process.nextTick` runs before promise microtasks and can starve I/O if overused. In debugging, mis-ordered UI updates often trace to misunderstanding microtask vs task boundaries. Instrumentation rarely exposes checkpoints directly; tests assert observable ordering instead.

```javascript
queueMicrotask(() => console.log('microtask'));
```

---

## 8. How does JavaScript handle floating-point arithmetic (IEEE 754)?

The Number type is IEEE 754 double-precision binary64; there is no separate integer type for arithmetic beyond bitwise ops that coerce to 32-bit integers. Many decimals are not exactly representable, so financial comparisons need integer minor units, decimals libraries, or `BigInt` for integer-only exactness beyond `Number.MAX_SAFE_INTEGER`. Rounding modes follow IEEE defaults; cumulative error matters in simulations. Serialization to JSON and databases can lose precision if not normalized at boundaries. Senior engineers specify numeric invariants in API contracts—never assume a JS `number` matches a SQL `NUMERIC` without conversion rules. Tests should include edge cases near 2^53 and subnormal numbers if your domain touches scientific computing.

```javascript
0.1 + 0.2 === 0.3;
Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2;
```

---

## 9. What is speculative optimization and deoptimization in JIT compilers?

Speculation means compiling fast paths assuming future executions resemble past ones—types, shapes, and branches. Guards validate assumptions cheaply; if they fail, the engine deoptimizes, discarding specialized code and resuming in a lower tier with updated feedback. Deoptimization is correct but costly; repeated churn causes jank and CPU spikes. Hot polymorphic APIs force megamorphic inline caches and limit optimization. Narrow interfaces at module boundaries, normalize inputs once, and branch into separate monomorphic helpers per type when throughput matters. Staging environments can enable engine trace flags to confirm deopt sources during load tests. Production observability rarely exposes deopts directly—infer from function-level CPU regressions after schema changes.

```javascript
function id(x) {
  return x;
}
for (let i = 0; i < 1e7; i++) id(i);
id('oops');
```

---

## 10. How does V8 handle string representations internally (SeqString, ConsString, SlicedString)?

Sequential strings store UTF-16 units contiguously. Cons strings (ropes) concatenate lazily as trees, trading indexing cost for faster concatenation in some scenarios. Sliced strings reference subranges of parent buffers to avoid copies until flattening is required. Repeated `+=` in loops can build deep ropes; `Array.prototype.join` often scales better for huge aggregates. Indexing or RegExp may force flattening, incurring large one-time costs. Sliced children can keep large parent buffers alive unexpectedly—watch retained size in heap snapshots for text pipelines. Cross-realm string operations still behave as strings at the language level regardless of representation.

```javascript
let s = '';
for (let i = 0; i < n; i++) s += chunk[i];
```

---

## 11. What are ArrayBuffers, TypedArrays, and DataViews at the engine level?

`ArrayBuffer` is a fixed-length raw byte buffer; typed arrays provide aligned numeric views with fixed element sizes; `DataView` reads and writes multi-byte values with explicit endianness. These types underpin WebAssembly linear memory, binary protocols, and media codecs. Garbage collection still applies to buffers unless transferred—zero-copy transfer detaches the sender’s buffer. Shared memory uses `SharedArrayBuffer` plus `Atomics`, gated by cross-origin isolation in browsers. Architecture: keep parsers and serializers on typed arrays at IO boundaries to avoid intermediate string copies. Pool buffers when profiling shows allocation churn in hot paths.

```javascript
const buf = new ArrayBuffer(16);
const u32 = new Uint32Array(buf);
const dv = new DataView(buf);
dv.setUint32(0, 0xff, true);
```

---

## 12. What is the Realm concept in JavaScript?

A realm comprises global objects, intrinsics, and the global environment—one per global `this` in browsers, workers, and iframes. `Array` from realm A is not `instanceof Array` for instances from realm B when compared across frames without adapters. `structuredClone` and `postMessage` handle cross-realm data with algorithms aware of type tags. Secure multi-tenant embedders use realms for isolation; testing harnesses may create fresh realms to avoid prototype pollution bleed. When designing SDKs that run in iframes, document identity and branding expectations. Serialization and `instanceof` checks are unreliable across boundaries—prefer duck typing or tagged unions.

```javascript
// iframe.contentWindow.Array !== window.Array
```

---
## 13. How do you diagnose and fix memory leaks in production JavaScript applications?

Diagnosis combines metrics (heap growth, GC time), session replay of long-lived tabs, and heap snapshots or allocation timelines in staging with production-like data. Diff snapshots to find constructors with monotonic growth; retainers explain paths. Fixes break retaining edges: remove listeners, clear timers, bound caches with LRU, use `WeakMap` for auxiliary metadata, and avoid module singletons capturing request-scoped data. Node services need attention to global maps and native handles. Validate fixes under soak tests—some “leaks” are unbounded caches needing configuration, not code bugs. Alert on RSS and heap thresholds per service SLO.

```javascript
const cache = new Map();
function track(o) {
  cache.set(o, heavyMetadata());
}
```

---

## 14. What are detached DOM trees and how do they cause memory leaks?

Detached subtrees are removed from the document but still referenced by JavaScript, retaining entire trees and associated styles. Caches of elements, closures over nodes, or forgotten observers are typical causes. Memory per node is significant on mobile; thousands of detached nodes matter. Teardown on route changes should null references and clear collections. Framework unmount hooks should remove listeners registered outside the framework. Heap snapshots label detached nodes—follow dominators to the JS root. Architectural fixes include `WeakMap` for node-associated data and scoping caches to route lifetime.

```javascript
let holder;
function leak() {
  const el = document.createElement('div');
  holder = el;
  document.body.appendChild(el);
  el.remove();
}
```

---

## 15. How do you use Chrome DevTools heap snapshots and allocation timelines?

Heap snapshots graph reachable objects; comparison mode highlights growth between two captures. Filter by constructor, inspect shallow vs retained size, and walk retainers to find accidental roots. Allocation instrumentation on a timeline attributes allocations to call stacks—ideal for per-frame spikes in animations. Production often requires remote debugging or exporting snapshots from controlled sessions. Workflow: reproduce, snapshot A, exercise, snapshot B, diff, fix, verify. Pair with Performance panel to see GC cost versus frame budget. Workers need separate DevTools sessions. Baseline cold vs warm heaps to avoid chasing expected growth.

---

## 16. What is the cost of closures in terms of memory and when should you avoid them?

Closures allocate environment records; anything reachable from captured variables stays alive until the closure is collectible. Costs include the function object plus retained graph—not just a pointer. Avoid long-lived closures over large transient data (e.g., debouncers closing over full API payloads). Prefer passing identifiers and re-fetching, or `WeakMap` for ancillary data. Per-iteration closures in hot loops allocate heavily in young generation. React render closures are often fine; module-level singletons holding closures across routes are not. Review global event subscriptions for captured scope size.

```javascript
function makeHandler(big) {
  return () => doWork(big);
}
```

---

## 17. How does object shape (monomorphism, polymorphism, megamorphism) affect performance?

Monomorphic sites see one hidden class; polymorphic a small fixed set; megamorphic many or dictionary mode. Inline caches specialize monomorphic access best; megamorphic sites fall back to generic lookups. Hot paths with megamorphism spend disproportionate time in property access. Normalize inputs at boundaries, split heterogeneous handling into typed branches, and avoid mixing unrelated object kinds at the same access site. Profiling tools can sometimes surface IC states; otherwise infer from refactor patterns (`delete`, dynamic keys). API design should not force “any object” into inner loops without normalization.

---

## 18. What is the hidden class transition tree and how does it impact object creation patterns?

Engines build transition trees from empty objects to shapes as properties add in sequence; divergent orders create distinct branches and fewer shared maps. Combinatorial optional fields can explode shapes—use nested stable objects or explicit schemas. Libraries returning plain objects should document initialization patterns if consumers hot-loop. Testing should cover constructor order permutations when performance SLAs exist. Refactors that reorder property assignment can silently regress benchmarks—track microbenchmarks in CI for critical modules.

---

## 19. How do you optimize hot loops and critical paths in JavaScript?

Profile production-like inputs; microbenchmarks lie. Hoist invariants, cache `length`, use typed arrays for numeric kernels, avoid allocations in inner loops, and chunk async work to yield. React: memoize and stabilize props; virtualize long lists. WebAssembly may win for numeric kernels. SIMD when available. Validate before/after on target devices—JIT interactions can invert expectations. Build systems should not strip profiling symbols in staging. Pair CPU profiles with allocation profiles to see if GC dominates.

```javascript
function sum(xs) {
  let s = 0;
  for (let i = 0, n = xs.length; i < n; i++) s += xs[i];
  return s;
}
```

---

## 20. What is the performance impact of `try-catch`, `arguments` object, and `with` statement?

`try-catch` can inhibit some optimizations around hot regions in older engines; modern engines improved but splitting try regions minimally still helps extreme hot paths. Materializing `arguments` is costly—use rest parameters. `with` prevents lexical binding analysis and is disallowed in strict mode; it forces generic property access. Linters ban `with`; remove from legacy when touching code. Exception handlers should not surround tiny inner loops without need—prefer validating preconditions outside. Node and browser differ slightly—measure your targets.

```javascript
function safe(...items) {
  return items.map((x) => x);
}
```

---

## 21. How do you implement efficient data structures (trie, LRU cache, bloom filter) in JavaScript?

Use `Map` for O(1) expected operations with arbitrary keys; objects work for stable string keys with predictable shapes. Tries use nested `Map` nodes for prefix search; radix compression saves memory. LRU with `Map` insertion order yields O(1) amortized get/put with eviction of oldest. Bloom filters use hashed bit positions in `Uint8Array` for membership with false positives—great for negative caches. Always benchmark with real distributions; library implementations often win on edge cases. Document thread safety—JS is single-threaded but async interleaving still matters for logical consistency.

```javascript
class LRU {
  constructor(cap) {
    this.cap = cap;
    this.m = new Map();
  }
  get(k) {
    if (!this.m.has(k)) return;
    const v = this.m.get(k);
    this.m.delete(k);
    this.m.set(k, v);
    return v;
  }
  set(k, v) {
    if (this.m.has(k)) this.m.delete(k);
    this.m.set(k, v);
    if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value);
  }
}
```

---

## 22. What is `ArrayBuffer` transfer and zero-copy patterns?

Transfer moves buffer ownership to another thread without copying; the sender’s buffer detaches. Use for large payloads to workers, OffscreenCanvas, or WASM without duplicating memory. `SharedArrayBuffer` shares memory but requires cross-origin isolation and careful synchronization. Mistakes include using buffers after transfer. Measure transfer vs copy for small payloads—overhead can dominate. Feature-detect and degrade to structured clone when needed. Ring buffers pair well with SAB for audio/video pipelines.

```javascript
const buf = new ArrayBuffer(1024);
worker.postMessage(buf, [buf]);
```

---

## 23. How do you implement a concurrent task scheduler with configurable concurrency limits?

Maintain a FIFO queue of async jobs and a counter of in-flight work; when a job finishes, start the next if below the cap. Integrate `AbortSignal` for cancellation. Separate queues per priority if needed. Emit metrics: wait time, queue depth, error rate. Browsers should cap parallel fetch/Image decode to protect memory and connection limits. Node should respect file descriptors. This pattern underlies download managers, test runners, and connection pools—tune concurrency from load tests, not defaults.

```javascript
function createPool(max) {
  let active = 0;
  const q = [];
  const next = () => {
    if (active >= max || !q.length) return;
    active++;
    const { run, resolve, reject } = q.shift();
    Promise.resolve()
      .then(run)
      .then(resolve, reject)
      .finally(() => {
        active--;
        next();
      });
  };
  return (run) =>
    new Promise((resolve, reject) => {
      q.push({ run, resolve, reject });
      next();
    });
}
```

---

## 24. What is cooperative multitasking with generators?

Generators (`function*`) pause at `yield`, preserving stack state on the iterator object. Cooperative scheduling requires explicit yields—no preemption—so CPU-heavy generator bodies still block the event loop. Common uses: iterators, coroutine-style control flow, and DSL interpreters. `yield*` delegates to another iterable. Async generators combine async iteration for streaming I/O. Without a trampoline, mixing promise-based async with bare generators is error-prone—prefer `async`/`await` or `async function*` for asynchronous iteration. Generators integrate with `for...of` and manual `next()` protocols for backpressure-friendly consumers.

```javascript
function* range(n) {
  for (let i = 0; i < n; i++) yield i;
}
```

---

## 25. How do you implement cancellable promises and the abort pattern?

Promises abstract completion; cancellation targets the underlying operation via `AbortController` and `AbortSignal`. Pass `signal` to `fetch`, timers, or your async APIs; listen for `abort` to clean up resources. `Promise.race` with abort can work but risks leaking work if the winning branch does not cancel the loser—use explicit cancellation patterns or `AbortSignal.any` where available. Document whether partial results are observable and whether server mutations are idempotent. React should abort in-flight fetches on unmount or route change. Libraries should expose composable signals for nested operations.

```javascript
async function load(url, signal) {
  const res = await fetch(url, { signal });
  return res.json();
}
const ctl = new AbortController();
load('/api', ctl.signal);
ctl.abort();
```

---

## 26. What is the Actor model and how can you implement it with Web Workers?

Actors encapsulate state and communicate only via messages—no shared mutable memory. Each Web Worker is a natural actor with a message port; the main thread routes messages and can supervise workers by restarting them on failure. Request correlation uses opaque ids and pending maps on both sides. Serialization costs dominate for large graphs—prefer transferable `ArrayBuffer` slices. Compared to `SharedArrayBuffer`, actors avoid data races at the expense of copy/transfer overhead. Design message schemas (versioned, validated) and backpressure (drop, queue, or apply pressure upstream). For CPU isolation, workers excel; for shared fine-grained state, consider SAB with Atomics only if your security posture allows cross-origin isolation.

```javascript
const worker = new Worker('actor.js', { type: 'module' });
worker.postMessage({ type: 'compute', id: 1, payload: data });
worker.onmessage = (e) => console.log(e.data);
```

---

## 27. How do SharedArrayBuffer and Atomics enable shared memory concurrency?

`SharedArrayBuffer` exposes one byte array to multiple threads; `Atomics` provides atomic read-modify-write and `wait`/`notify` on typed integer arrays for coordination. You can build ring buffers, lock-free counters, and bounded queues—subject to careful memory ordering reasoning. Data races are still bugs: torn reads of multi-word structures without synchronization are undefined at the language level. Browsers require cross-origin isolation for SAB to reduce Spectre risk—deploy COOP/COEP and verify third-party assets. Node supports SAB in worker threads with similar care. Fall back to message passing when isolation headers are impossible.

```javascript
const sab = new SharedArrayBuffer(4);
const ia = new Int32Array(sab);
Atomics.store(ia, 0, 42);
```

---

## 28. What is lock-free programming in JavaScript using Atomics?

Lock-free structures make progress without mutexes by relying on atomic operations and careful invariants; wait-free variants guarantee per-thread progress. JS exposes a limited subset versus C++—practical patterns include atomic counters, simple queues with compare-exchange loops, and `wait`/`notify` for parking. Compare-exchange style loops must account for ABA-like issues at the logical level even when the underlying word size matches, because higher-level invariants span multiple words. Complexity and subtle bugs rise quickly; prefer message passing unless profiling proves a bottleneck. Stress-test under contention; flaky tests often indicate races. Document memory order assumptions; the ECMAScript memory model is easy to misunderstand without reading the spec notes. For most web applications, shared-memory lock-free code is a last resort after workers and batched message passing fail to meet budgets; keep the critical section minimal and well reviewed.

---

## 29. How do you implement backpressure in streaming data processing?

Backpressure slows producers when consumers lag, preventing unbounded memory growth. Node streams expose `highWaterMark` and `drain` events; Web Streams expose `desiredSize` and writer readiness. Async iterators can await semaphores when pending work exceeds limits. UI pipelines should virtualize rendering rather than append unbounded DOM. Distributed systems pair client backpressure with server rate limits and HTTP 429/503 semantics. Observability includes queue depth and age of oldest chunk—alert before OOM. Transform streams should propagate errors and abort signals to release resources.

```javascript
async function pump(producer, consumer, maxPending = 8) {
  let pending = [];
  for await (const chunk of producer) {
    while (pending.length >= maxPending) await Promise.race(pending);
    const p = Promise.resolve(consumer(chunk)).finally(() => {
      pending = pending.filter((x) => x !== p);
    });
    pending.push(p);
  }
  await Promise.all(pending);
}
```

---

## 30. What are ReadableStream, WritableStream, and TransformStream?

Web Streams model asynchronous I/O with built-in backpressure. Readable sources push or pull data; writable sinks apply pressure via ready promises; transforms pair both sides for mapping, compression, or parsing. They integrate with `fetch` bodies, Service Worker responses, and encoding APIs. Errors propagate as `abort` reasons; always handle `abort` to release underlying resources (file handles, sockets). Compared to Node streams, APIs differ but concepts align—use transforms to bound memory on large downloads. Testing should cover half-closed states and consumer cancellation mid-stream.

```javascript
const { readable, writable } = new TransformStream();
writable.getWriter().write(new Uint8Array([1, 2, 3]));
```

---

## 31. How does `structuredClone` differ from `JSON.parse(JSON.stringify())` and `postMessage`?

`structuredClone` deep-clones many object kinds, preserves cycles, `Date`, `Map`, `Set`, typed arrays, and more—rejecting functions and symbols as values. JSON loses types, drops `undefined`, and cannot represent cycles. `postMessage` uses the structured clone algorithm with optional transfer lists for zero-copy buffers. Choose `structuredClone` for in-process snapshots; JSON for plain interchange with defined schemas. Performance favors structured clone for binary-rich graphs. Always validate external data regardless of clone path.

```javascript
const a = { d: new Date(), m: new Map([[1, 2]]) };
const b = structuredClone(a);
```

---

## 32. How do you design a robust error recovery strategy for distributed async workflows?

Assume partial failure: duplicate delivery, ordering issues, and poison messages. Make handlers idempotent with business keys; retry with exponential backoff and jitter; classify retryable vs fatal errors; dead-letter poison messages for inspection. Correlate logs with trace ids. Frontends should show degraded modes and manual retries, not infinite spinners. Sagas need compensating transactions with explicit state machines. Chaos testing validates assumptions. Define SLIs on stuck workflow age and retry budget burn. Version workflow state for upgrades mid-flight. Redact PII in stored error artifacts while keeping debuggability.

---

## 33. What is the SAB (SharedArrayBuffer) security model and cross-origin isolation?

Shared memory aids high-resolution timing side channels used in Spectre-class attacks. Browsers gate `SharedArrayBuffer` and related APIs behind cross-origin isolated contexts established with `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` (or credentialless variants), plus compatible CORP/CORS on embedded resources. Third-party iframes and scripts must opt in or be proxied. Feature-detect and degrade to message passing. Security reviews should inventory all embedded origins and verify headers on HTML and assets. Operational tradeoffs include broken legacy embeds until vendors update CORP.

---

## 34. How do you implement priority queues for async task scheduling?

Use a binary min-heap keyed by `(priority, sequence)` where sequence breaks ties for FIFO stability within the same priority. Dequeue runs the next task subject to a separate concurrency limiter. Combine with `scheduler.postTask` priorities in browsers when available; emulate lower priority with delayed scheduling carefully to avoid starvation—consider aging or weighted fair queueing. Instrument queue depth and oldest-waiting latency. Node’s `nextTick` vs `setImmediate` ordering differs from browsers—do not port scheduling logic blindly. For starvation avoidance, promote tasks that wait longer than thresholds.

```javascript
class PriQueue {
  constructor() {
    this.a = [];
    this.seq = 0;
  }
  cmp(i, j) {
    const a = this.a,
      x = a[i],
      y = a[j];
    return x.pri < y.pri || (x.pri === y.pri && x.seq < y.seq);
  }
  push(pri, run) {
    const item = { pri, seq: this.seq++, run };
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.cmp(i, p)) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    if (!a.length) return;
    const top = a[0];
    const last = a.pop();
    if (!a.length) return top;
    a[0] = last;
    let i = 0;
    for (;;) {
      const l = i * 2 + 1,
        r = l + 1;
      if (l >= a.length) break;
      let j = l;
      if (r < a.length && this.cmp(r, l)) j = r;
      if (!this.cmp(j, i)) break;
      [a[i], a[j]] = [a[j], a[i]];
      i = j;
    }
    return top;
  }
}
```

---

## 35. What are Service Workers and how do they intercept network requests?

Service workers are event-driven scripts scoped to origins, running off the main thread with ephemeral lifetimes. They handle `fetch` to implement caching strategies, offline shells, and background sync. Global mutable state is unreliable—persist via `caches` and IndexedDB. Updates require versioned caches and careful `skipWaiting`/`clients.claim` flows. HTTPS is mandatory (except localhost). Misconfiguration can cache broken assets—test update and rollback paths. They underpin PWAs and can participate in push notifications. Combine with CSP reporting endpoints for defense-in-depth telemetry.

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});
```

---

## 36. How do Proxies enable metaprogramming, and what are all the available traps?

Proxies interpose on internal object operations via handler traps: `get`, `set`, `has`, `deleteProperty`, `ownKeys`, `getOwnPropertyDescriptor`, `defineProperty`, `getPrototypeOf`, `setPrototypeOf`, `isExtensible`, `preventExtensions`, `apply`, `construct`, and legacy `enumerate` in older specs. `Proxy.revocable` supports membranes and teardown. Invariants prevent violating non-configurable, non-writable properties. Uses include reactive systems, mocking, validation, and lazy objects. Overhead can be significant on hot paths—measure before wrapping inner loops. Traps should delegate via `Reflect` to preserve correct `receiver` semantics for prototype chain accessors.

```javascript
const p = new Proxy(
  {},
  {
    get(t, prop) {
      return prop in t ? t[prop] : 42;
    },
  }
);
```

---

## 37. How do you implement reactive programming primitives using Proxy?

Wrap data objects with `get`/`set` traps that track dependencies on read and notify subscribers on write—often with an active effect stack for automatic dependency collection. Deep reactivity lazily wraps nested objects. Arrays may require instrumenting mutating methods or replacing with proxied subclasses. Batch updates to reduce notification storms. Trade memory and trap overhead against simpler immutable patterns with structural sharing. Frameworks integrate schedulers to coalesce flushes to the next microtask or animation frame. Testing should assert notification counts and batching semantics.

```javascript
function reactive(obj, notify) {
  return new Proxy(obj, {
    set(t, k, v, r) {
      const old = t[k];
      const ok = Reflect.set(t, k, v, r);
      if (old !== v) notify(k, v, old);
      return ok;
    },
  });
}
```

---
## 38. What is `Reflect` and why was it introduced alongside Proxy?

`Reflect` exposes object operations as functions mirroring internal methods, enabling Proxy traps to forward default behavior safely. It returns booleans for `Reflect.set` where appropriate and exposes `Reflect.construct` with explicit `newTarget` for subclassing scenarios. The API aligns metaprogramming with engine semantics and invariants. Using `Reflect` inside traps avoids double-invoking accessors incorrectly and preserves receiver binding for prototype setters. It groups operations for future optimization and static analysis better than ad hoc helpers. MDN documents each method’s exact failure modes—read before overriding behavior.

```javascript
const h = {
  set(t, k, v, r) {
    return Reflect.set(t, k, v, r);
  },
};
```

---

## 39. How do Symbols work at the specification level (well-known, registered, unique)?

`Symbol()` creates a unique primitive each time; `Symbol.for` registers strings in the global symbol registry for cross-realm sharing. Well-known symbols (`Symbol.iterator`, `Symbol.toStringTag`, etc.) hook into built-in protocols. `Reflect.ownKeys` includes symbols; `Object.keys` does not. JSON serialization drops symbol keys—design APIs accordingly. Property order rules differ between operations; do not rely on enumeration order for security decisions. Symbols avoid accidental name collisions in mixins and metadata.

```javascript
const a = Symbol('a');
const b = Symbol.for('shared');
const c = Symbol.for('shared');
console.log(b === c);
```

---

## 40. What is the TC39 proposal process and how does it work?

TC39 advances ECMAScript proposals from stage 0 (strawperson) through stage 4 (finished, ready for the yearly spec). Higher stages demand spec text, acceptance tests (Test262), and multiple implementations. Champions own proposals; committee consensus avoids web-breaking changes. Stage 3 signals readiness for implementers; stage 4 is ratification-ready. Organizations often gate production use by stage and policy. Track meeting notes for semantic tweaks before stage 4—edge cases still move. Align Babel/TypeScript settings with your policy to avoid shipping experimental syntax unintentionally.

---

## 41. How do you implement a custom `Symbol.iterator`, `Symbol.asyncIterator`, and `Symbol.toPrimitive`?

Iterables return objects with `next()` producing `{ value, done }`. Async iterables return promises from `next`—use `for await...of`. `Symbol.toPrimitive` receives hints `'number'`, `'string'`, or `'default'` to control coercion for `+`, comparisons, and templates. Implementations must handle all hints or delegate sensibly. Provide `valueOf`/`toString` fallbacks when `toPrimitive` is absent. Unit tests should cover coercion paths—bugs here surface as subtle comparison failures. Libraries wrapping primitives should document non-obvious coercion behavior.

```javascript
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => ({ value: i++, done: i > 3 }),
    };
  },
};
```

---

## 42. What are decorators (TC39 Stage 3) and how do they work?

Decorators transform class declarations, methods, accessors, and fields at evaluation time via user-defined functions receiving rich metadata contexts. They run once per class evaluation—not per instance—unless you emit per-instance logic inside. Transpilers differ slightly; lock versions and read release notes. Use cases: logging, DI metadata, validation, and binding. They complement reflection where available. Avoid decorators for hot per-call work—keep them declarative. Security: decorators execute at load time with module privileges—treat them like application code, not user plugins without sandboxing.

```javascript
// @logged
// class C { @bind m() {} }
```

---

## 43. How does the `with` statement work and why is it deprecated?

`with` inserts an object into the lexical environment chain so bare identifiers may resolve as properties. Engines cannot statically determine bindings inside the block, defeating optimizations and complicating security review. Strict mode prohibits `with`. Replace with destructuring, explicit prefixes, or block-scoped locals. Legacy templates sometimes emitted `with` for data binding—avoid in modern codebases. If encountered in vendor bundles, pin versions and audit interactions with `eval`. Linters should fail CI on `with` usage.

---

## 44. What is the difference between `[[Call]]` and `[[Construct]]` internal methods?

`[[Call]]` runs a function as `f()`. `[[Construct]]` allocates an object for `new`/`Reflect.construct`, sets `new.target`, and wires prototypes—arrow functions and some builtins lack `[[Construct]]`. Class constructors throw when called without `new` unless explicitly designed otherwise. Understanding this split clarifies `super` semantics and subclassing interop. Polyfills use `Reflect.construct` to emulate `new` on arbitrary targets. API surfaces should not overload one callable for both factory and constructor without clear naming.

```javascript
const Arrow = () => {};
```

---

## 45. How do tagged template literals work at the specification level?

Tags are functions invoked as `tag(strings, ...expressions)` where `strings` is a frozen array-like object with a `.raw` array parallel for escapes. Expressions evaluate left-to-right before invocation. This enables DSLs for styling, i18n, and tagged SQL with parameterization—never concatenate raw user input into SQL strings without bound parameters. Tags are not methods—`this` is not automatically bound. Large templates allocate; usually acceptable in UI code. Sanitize outputs in security-sensitive DSLs.

```javascript
function sql(strings, ...vals) {
  return { text: strings.join('?'), vals };
}
sql`SELECT * FROM t WHERE id = ${id}`;
```

---

## 46. What are template literal types and branded types?

TypeScript template literal types model string patterns at compile time—routes, units, and command strings—by combining unions. Branded types (`type UserId = string & { __brand: 'UserId' }`) create nominal distinctions among compatible primitives without runtime overhead after erasure. They encode invariants for API boundaries but do not replace runtime validation for external input. Document branding conventions to avoid confusion. Pair with `satisfies` for inference without widening. Misuse can produce unreadable error messages—keep brands shallow.

```typescript
type Hex = string & { __brand: 'hex' };
function hexOnly(x: Hex) {}
```

---

## 47. How do you implement a DSL (Domain-Specific Language) in JavaScript?

Options include fluent APIs, tagged templates, parser combinators over ASTs (`acorn`, `chevrotain`), or interpreters for small command languages. Sandboxing untrusted DSLs requires workers, WASM, or restricted eval alternatives—never raw `new Function` on user input. Provide great error messages with locations; users abandon opaque DSLs. Testing combines golden files and property tests for parsers. Version DSL schemas and migrate with codemods. For configuration, JSON Schema or CUE may suffice without a Turing-complete language—choose deliberately.

```javascript
const dsl = {
  chain: (a) => ({
    map: (fn) => dsl.chain(fn(a)),
    val: () => a,
  }),
};
```

---

## 48. What is the `eval` function's security model and variable environment impact?

Direct `eval` executes in the current lexical environment, accessing locals—catastrophic if fed attacker-controlled strings combined with XSS. Indirect eval runs in global scope; strict mode changes binding rules. CSP `unsafe-eval` blocks `eval` and similar dynamic code capabilities. Prefer JSON, expression sandboxes, or WASM for untrusted logic. Build tools using `eval` for HMR conflict with strict CSP—use nonces/hashes and alternative reload strategies in hardened environments. Code review should treat any `eval` as security-critical.

```javascript
'use strict';
eval('var x = 1');
```

---

## 49. How does the ES module loader work (parsing, instantiation, evaluation phases)?

The loader fetches modules, parses into module records, resolves specifiers to URLs, and links import/export bindings as live cells shared across the graph. Instantiation allocates those cells and wires them; evaluation executes module bodies in dependency order with defined cycle handling. Live bindings mean importers observe updates to exported `let`/`const` after initialization completes—TDZ applies until initialization. `import.meta` exposes module-specific metadata. Dynamic `import()` loads subgraphs asynchronously. Bundlers emulate this graph—verify dev vs prod behavior for cycles.

---

## 50. What is the difference between live bindings (ESM) and value copies (CJS)?

ESM importers read live bindings to exported names—mutations of exported `let` are visible where allowed. CommonJS `require` returns a module namespace object whose properties update if the exporter mutates `exports`, but the indirection differs and bundler interop layers add `__esModule` defaults. Tree shaking relies on ESM static structure; CJS side effects complicate shaking. Design stable exports; prefer named exports for clarity. Interop tests should cover default/named combinations your bundler emits.

```javascript
exports.count = 1;
exports.inc = () => exports.count++;
```

---
## 51. How do circular dependencies behave differently in ESM vs CJS?

In CommonJS, partially initialized exports can be `undefined` during a cycle when `require` executes bodies in dependency order before assignments complete. ESM allocates binding cells first, but accessing uninitialized bindings throws TDZ `ReferenceError` until the defining module runs `const`/`let` initializers. Mitigations: extract shared state to an acyclic module, lazy `import()` inside functions, or redesign boundaries. Bundlers may reorder modules—test production bundles. Document team rules for cycles—many codebases forbid them via lint graphs. Understanding initialization order prevents “works in dev, fails in prod” surprises.

---

## 52. How does top-level await work and what are its implications?

Top-level `await` blocks evaluation of the module and any static importers until the awaited promise settles—creating potential startup waterfalls. Libraries exporting TLA force consumers into async loading graphs whether or not they need the awaited resource. Bundlers may split chunks around TLA; tree shaking and execution order change. Use sparingly for one-time initialization; prefer explicit `init()` functions for clearer control. Measure cold-start impact in SSR and edge runtimes where latency budgets are tight. Document side effects—awaited I/O at import time can surprise test harnesses.

```javascript
const config = await fetch('/config.json').then((r) => r.json());
export { config };
```

---

## 53. What are import assertions/attributes and how do they work?

Import attributes (e.g., `with { type: 'json' }`) let the host validate module type against response metadata before execution, reducing MIME confusion attacks for JSON/CSS modules. The exact syntax evolved—verify your toolchain and target browsers. Servers must send consistent `Content-Type` and CORS headers. Assertions integrate with the module loader’s integrity checks in secure configurations. Feature-detect in progressive enhancement paths. Security reviews should treat assertions as part of the supply chain for module content.

---

## 54. How do you design a plugin architecture using dynamic imports?

Expose a narrow host capability object; load plugins with `import()` under an allowlist of specifiers or signed URLs. Version plugin APIs with semver and compatibility matrices. Run untrusted plugins in workers or iframes with `postMessage` RPC and structured validation (JSON Schema, zod). Provide `init`/`dispose` lifecycles and resource caps. Avoid passing raw DOM unless necessary—capability-based APIs reduce blast radius. Monitor plugin errors without taking down the host—isolate failures per plugin. Document upgrade paths and ship codemods for breaking host API changes.

```javascript
async function loadPlugin(name) {
  const mod = await import(`./plugins/${name}.js`);
  return mod.setup(hostApi);
}
```

---

## 55. What is Module Federation and how does it relate to JavaScript modules?

Module Federation (webpack/Rspack) composes separately deployed bundles at runtime, sharing singletons like React across micro-frontends and reducing duplicate vendors. Remote entries expose modules consumed by hosts; version negotiation prevents incompatible duplicates. Tradeoffs include orchestration complexity, network dependency on remotes, and security of remoteEntry integrity—use SRI and pinning where possible. It complements native ESM: bundlers still emit async chunks and shared scopes. CI must matrix-test host/remote combinations. Fallback UI when remotes fail is mandatory for resilience.

---

## 56. What is the Command Query Responsibility Segregation (CQRS) pattern in frontend?

CQRS splits command handling (writes) from query models (reads), often with different shapes and storage. SPAs may maintain denormalized read models in IndexedDB for fast screens while posting commands to APIs that emit events. Benefits: tuned views per use case, clearer scaling boundaries, and auditability. Costs: eventual consistency, more infrastructure, and harder mental models—debugging requires correlation ids across projections. Use when read/write asymmetry is extreme or offline read richness justifies complexity—not for every CRUD app. Pair selectively with event sourcing.

---

## 57. How do you implement the Mediator pattern for component communication?

Route peer-to-peer chatter through a mediator (store, event bus, or router) so components depend on the mediator’s API instead of concrete collaborators. Define typed events and central logging. Scope mediators per feature to avoid global coupling. In React, context providers often mediate; in micro-frontends, a shared bus with versioned schemas helps. Unsubscribe on teardown to prevent leaks. Testing substitutes a fake mediator quickly. Beware god-object mediators—partition by bounded context.

```javascript
function createMediator() {
  const subs = new Map();
  return {
    on(type, fn) {
      if (!subs.has(type)) subs.set(type, new Set());
      subs.get(type).add(fn);
      return () => subs.get(type).delete(fn);
    },
    emit(type, payload) {
      subs.get(type)?.forEach((fn) => fn(payload));
    },
  };
}
```

---

## 58. What is the Repository pattern in frontend data management?

Repositories hide transport details (REST, GraphQL, RPC) behind domain-shaped methods—`UserRepository.getById`, not raw `fetch`. Map DTOs to domain models in one place; add caching, retries, and telemetry consistently. Repositories simplify testing by swapping fakes and clarify where normalization happens. Avoid anemic pass-through layers unless indirection pays for multiple backends. Large apps often split repositories by aggregate. Align repository contracts with backend OpenAPI or GraphQL schema evolution.

---

## 59. How do you design a state management system from scratch?

Start with requirements: time-travel debugging, middleware, derivations, and async story. Implement subscribe/notify with immutable updates or structural sharing as needed. Middleware composes cross-cutting concerns (logging, persistence). Selectors memoize derived data to avoid redundant computation. Batch notifications to reduce renders. For async, integrate cancellation and staleness tokens. Document whether state is normalized or nested—normalization aids consistency. Grow features when pain appears—premature global stores harm small apps.

```javascript
function createStore(reducer, init) {
  let state = init;
  const subs = new Set();
  return {
    getState: () => state,
    dispatch: (a) => {
      state = reducer(state, a);
      subs.forEach((fn) => fn());
    },
    subscribe: (fn) => (subs.add(fn), () => subs.delete(fn)),
  };
}
```

---

## 60. What is Event Sourcing and how can it be applied in frontend applications?

Event sourcing stores state changes as an append-only log of facts; current state is a fold—often augmented with snapshots for performance. Frontends may keep local event logs for undo/redo, offline command queues, or collaborative features. Challenges: schema evolution of events, snapshot strategy, and privacy of stored payloads on devices. Combine with CQRS when projections differ materially. Encrypt sensitive event payloads at rest if persisted locally. Not every interaction needs full sourcing—use for domains with audit requirements or rich undo.

---

## 61. How do you implement dependency injection in JavaScript?

Pass dependencies via constructors or factory parameters rather than importing singletons directly—constructor injection for classes, factories for functional modules. Lightweight DI containers map tokens to implementations and manage lifetimes (singleton vs per-request). In React, context supplies dependencies to subtrees. Testing swaps implementations without brittle module mocks. Document lifetime rules to avoid singletons holding request-scoped state. Avoid service locators that hide dependencies—explicit signatures aid readability and static analysis.

```javascript
function createApp(services) {
  return {
    users: () => services.http.get('/users'),
  };
}
```

---

## 62. What is the Saga pattern for managing side effects?

Sagas coordinate multi-step workflows with compensating actions on failure—often modeled as state machines or generator-based interpreters. They excel when remote steps can partially succeed and need rollback semantics. Frontend sagas orchestrate wizard flows; backend sagas coordinate microservices—mind the boundary. Testing requires simulating failures at each step. Observability: log saga ids and transitions. Avoid duplicating business rules that belong server-side—client sagas should be presentation-level orchestration, not authoritative policy.

---

## 63. How do you design a micro-frontend architecture?

Choose integration: build-time packages, runtime federation, or edge includes. Define ownership per vertical slice, shared design system versions, and routing composition in a shell. Standardize cross-app events and authentication token propagation. CSS isolation via modules or shadow DOM prevents collisions. Monitor bundle duplication and negotiate shared vendor versions. Operational maturity (independent deploys, SLOs per slice) must justify complexity over a modular monolith. Document failure modes when a remote is unavailable.

---

## 64. What are monorepo strategies and their tradeoffs for JavaScript projects?

Workspaces (pnpm/npm/yarn) plus tools like Turborepo/Nx unify builds with caching and affected graphs. Benefits: atomic refactors, shared tooling, consistent linting. Costs: CI complexity, potential coupling if boundaries blur. Enforce package boundaries with lint rules and CODEOWNERS. Remote cache artifacts speed CI. Version internal packages deliberately—avoid implicit “always latest” coupling. Polyrepos suit independently released products with distinct compliance needs—choose per org constraints.

---

## 65. How do you implement the Circuit Breaker pattern for API calls?

Track failures per dependency; open the circuit after thresholds, failing fast for a cooldown, then half-open probe calls. Add jitter to avoid synchronized retries after outages. Combine with bulkheads limiting concurrent calls to flaky services. Emit metrics on state transitions for alerting. Client-side breakers complement server retries—ensure user-visible messaging during outages. Tune thresholds from historical error budgets—not defaults.

```javascript
function circuitBreaker(fn, { threshold = 5, coolDown = 5000 } = {}) {
  let failures = 0;
  let openUntil = 0;
  return async (...args) => {
    if (Date.now() < openUntil) throw new Error('circuit open');
    try {
      const r = await fn(...args);
      failures = 0;
      return r;
    } catch (e) {
      if (++failures >= threshold) openUntil = Date.now() + coolDown;
      throw e;
    }
  };
}
```

---

## 66. What is the Strangler Fig pattern for frontend migrations?

Incrementally replace a legacy system by routing slices of traffic or features to new implementations behind a stable facade until the old path is retired. Feature flags and proxies assist cutover. Measure parity with KPIs and user-reported defects before decommissioning legacy modules. Reduces big-bang risk in enterprise migrations (e.g., AngularJS to React). Communicate temporary duplication costs and staffing for parallel maintenance. Plan data migration and URL compatibility across phases.

---

## 67. How do you design a robust error boundary and fallback system?

React error boundaries catch render errors in children—pair with telemetry and actionable fallbacks. They do not catch event handler errors unless rethrown into render paths—handle those explicitly. Model async errors in state machines (`idle/loading/error`). Provide correlation ids in support messaging. Nested boundaries isolate subsystems—avoid one boundary for the entire app unless fallback UX is acceptable globally. Log to observability stacks with breadcrumbs; scrub PII. Test fallbacks with forced throws in staging. Outside React, combine `window.onerror` and `unhandledrejection` with route-level recovery and cached offline shells where applicable.

```javascript
// React 16+ (import React according to your JSX runtime)
class Boundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}
```

---

## 68. What is the BFF (Backend for Frontend) pattern?

A BFF aggregates and shapes APIs for a specific client, reducing chatty calls and client complexity. It can enforce auth translation, pagination, and field selection tailored to UI needs. Risks: duplicated domain logic if the BFF becomes authoritative—delegate core rules to domain services. Operate BFFs as first-class services with SLOs. Version BFF endpoints with the client when teams align. Useful when mobile and web need materially different payloads from the same microservices.

---

## 69. How do you implement feature flags in a JavaScript application?

Use a provider or remote config with etag caching; evaluate flags early to avoid UI flicker—bootstrap from HTML/SSR when possible. Kill switches for risky deploys; gradual rollouts by cohort. Server must enforce security-sensitive flags—never trust client-only toggles for authorization. Track exposures for experiment analysis. Remove stale flags to reduce branching debt. Type-safe flag names via codegen reduce typos. Audit who can change flags—tie to RBAC.

```javascript
if (flags.newCheckout) return <NewCheckout />;
return <OldCheckout />;
```

---

## 70. What is the Adapter pattern and how do you use it for API abstraction?

Adapters translate external DTOs into domain models expected by UI layers—one place to absorb versioning differences. When APIs evolve, update adapters without touching every component. Name adapters clearly (`BillingApiAdapter`). Combine with anti-corruption layers in DDD. Test adapters against contract fixtures and consumer-driven contracts when available. Avoid leaking transport headers into domain objects unless modeled explicitly.

```javascript
class UserApiAdapter {
  constructor(client) {
    this.client = client;
  }
  async getUser(id) {
    const dto = await this.client.get(`/users/${id}`);
    return { id: dto.user_id, name: dto.full_name };
  }
}
```

---

## 71. How do prototype pollution attacks work and how do you prevent them?

Attackers merge attacker-controlled objects so keys like `__proto__` or `constructor.prototype` mutate `Object.prototype`, affecting nearly all subsequent object literals—leading to XSS gadgets, auth bypass, or RCE in template engines. Prevent unsafe deep merges on untrusted input; use `Object.create(null)` for maps; validate schemas; freeze prototypes in hardened contexts; patch utilities promptly. Server-side normalization should strip dangerous keys. Monitor dependencies for known merge vulnerabilities.

```javascript
const polluted = JSON.parse('{"__proto__":{"isAdmin":true}}');
```

---

## 72. What is supply chain security for JavaScript packages?

Threats include compromised packages, typosquatting, maintainer account takeover, and malicious install scripts. Mitigations: lockfiles, verified reproducible installs, dependency review in CI, SBOMs, pinning versions, Sigstore/npm provenance, and running installs in isolated CI sandboxes. Runtime integrity via SRI for CDN assets. Assume breach—detect anomalous outbound traffic. Organizational policies limit new dependencies and require justification. Regularly rotate tokens and enable 2FA for publishing accounts.

---

## 73. How does the Same-Origin Policy work at the browser level?

Origins combine scheme, host, and port. Documents cannot read each other’s DOM or responses across origins by default. CORS lets servers opt into cross-origin reads with explicit headers. `postMessage` enables explicit cross-origin messaging with origin checks. Cookies have additional `SameSite` protections. XSS in origin A is severe because scripts run with A’s privileges against A’s data. Design APIs assuming SOP—never rely on client-side obscurity. Iframes and `window.opener` interactions require careful `rel` and COOP settings.

---

## 74. What are Trusted Types and how do they prevent DOM XSS?

Trusted Types require sinks like `innerHTML` to accept only policy-created typed objects, rejecting raw strings by default. Central policies sanitize or generate markup safely. Deploy report-only first; fix violations iteratively. Complements CSP. Third-party scripts may need policy hooks—coordinate vendors. Reduces scattered `DOMPurify` omissions by funneling through audited code paths. Not a substitute for server-side encoding—layer defenses.

```javascript
const policy = trustedTypes.createPolicy('default', {
  createHTML: (s) => DOMPurify.sanitize(s),
});
el.innerHTML = policy.createHTML(userHtml);
```

---

## 75. How do you implement Content Security Policy headers effectively?

Start restrictive: `default-src 'self'`, nonces or hashes for scripts, tight `connect-src`, `img-src`, and `frame-ancestors`. Avoid `unsafe-inline` where possible. Report-only mode collects violations before enforcement. Iterate with real user traffic—breakage is common with third parties. Coordinate nonce injection in SSR. CSP is not a silver bullet—pair with Trusted Types and input validation. Document exceptions and sunset temporary `unsafe-*` allowances.

---
## 76. What is Subresource Integrity and how do you implement it?

SRI (`integrity` on `<script>`/`<link>`) hashes expected resource bytes; browsers block execution or styling on mismatch—mitigating CDN compromise or cache poisoning. Requires CORS for cross-origin loads (`crossorigin` attribute). Pin exact versions because any file change invalidates the hash. Automate hash updates in build pipelines. Self-hosting avoids third-party drift. Limitations: dynamic loader scripts that fetch additional code must also be trusted or audited—SRI only covers the first resource you tag.

```html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

---

## 77. How do you handle secrets management in frontend applications?

Never ship long-lived secrets in client bundles—everything in the browser is extractable. Use short-lived tokens from your auth server, scope minimally, prefer HttpOnly Secure cookies for refresh tokens to reduce XSS impact versus `localStorage`. Proxy privileged API calls through your backend. Scan repos for accidental commits with secret scanners in CI. For build-time keys to third-party services, keep them server-side. Educate teams that environment variables prefixed for client builds are public. Rotate keys on exposure incidents immediately.

---

## 78. What are COOP, COEP, and CORP headers and why do they matter?

`Cross-Origin-Opener-Policy: same-origin` isolates browsing context groups, reducing cross-window attacks and enabling certain platform features. `Cross-Origin-Embedder-Policy` requires explicit opt-in from cross-origin resources via CORP/CORS—needed for cross-origin isolation that unlocks `SharedArrayBuffer` and high-resolution timers in many browsers. `Cross-Origin-Resource-Policy` declares who may embed a resource, limiting cross-origin inclusion in Spectre mitigations. Together they harden pages but can break ads and legacy embeds—plan allowlists and vendor outreach. Test in staging with full third-party traffic.

---

## 79. How do you architect a test strategy for a large JavaScript application?

Layer tests: many fast unit tests, focused integration tests, fewer E2E journeys covering critical paths. Use typecheck and lint as first gates. Contract tests between services reduce brittle E2E. Parallelize CI with sharding; use affected-only testing in monorepos. Track flaky tests with quarantine policies. Synthetic monitors validate production after deploy. Align coverage goals with risk—payment flows over UI labels. Invest in factories and fixtures for deterministic data. Define ownership per suite to prevent orphaned tests.

---

## 80. What is property-based testing and how does it compare to example-based testing?

Property-based tests generate many inputs to assert invariants (round-trip, idempotence, monoid laws) using libraries like fast-check. They discover edge cases humans omit—empty arrays, unicode, boundary numbers. Example-based tests document concrete regressions and business scenarios. Combine: properties for algorithms and pure functions; examples for workflows. Downsides: slower runs, need for shrinking configuration, occasional flaky shrinking paths. Great for serializers, reducers, and parsers—less for visual snapshot UI without careful modeling.

```javascript
import fc from 'fast-check';
test('reverse twice is identity', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const rev = (a) => [...a].reverse();
      expect(rev(rev(arr))).toEqual(arr);
    })
  );
});
```

---

## 81. How do you implement snapshot testing effectively?

Snapshots serialize component trees or API responses for diff-based regression detection—best when outputs are stable and reviewers scrutinize diffs. Keep snapshots small and focused; avoid giant dumps that obscure intent. Combine with semantic assertions for critical behavior. Update snapshots deliberately in PRs with clear rationale. For structured data, sort keys deterministically. When migrating design systems, snapshots help catch unintended visual structure changes—pair with visual testing tools for pixels.

---

## 82. What is mutation testing?

Mutation testing seeds small code changes (mutants) and checks whether tests fail—surviving mutants imply weak assertions despite green CI. Tools like Stryker integrate with Jest/Vitest. Costs: slow, noisy in UI layers—use targeted runs on critical modules. Interprets coverage meaningfully: 100% line coverage with surviving mutants is hollow. Run in nightly pipelines or pre-merge for risk-sensitive packages—not necessarily every PR.

---

## 83. How do you test async code and race conditions?

Prefer explicit `async/await` with controlled clocks (`vi.useFakeTimers`) and deterministic ordering tests. Stress-test concurrent code with many interleavings; property-based generators can vary scheduling. For shared state, design tests around invariants rather than timing. React Testing Library’s `waitFor`/`findBy` handles microtasks—avoid missing `await` on user events. Reproduce race bugs with logging of ordering and correlation ids. Where nondeterminism persists, isolate logic into pure functions testable without concurrency.

```javascript
test('debounce', async () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const d = debounce(fn, 100);
  d();
  d();
  vi.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(1);
});
```

---

## 84. What is contract testing for frontend-backend integration?

Consumer-driven contracts (e.g., Pact) record expected interactions and verify providers independently—catching breaking API changes early. Complements OpenAPI, which may drift from reality. Requires discipline to publish and verify contracts on each change. Reduces reliance on heavyweight E2E for every permutation. In CI, fail fast when contracts break—coordinate versioning between teams. Useful in microservice environments with many evolving endpoints.

---

## 85. How do you measure and improve test coverage meaningfully?

Track branch coverage on critical domains, not just lines. Exclude generated files from targets. Pair coverage with risk analysis—uncovered error handling in payments matters more than uncovered constants. Use mutation testing selectively to validate assertion strength. Improve tests by adding behaviors, not lines—refactor tests that block useful changes. Watch for false confidence: integration gaps remain even with high unit coverage. Set thresholds as advisory in early phases; tighten as maturity grows.

---

## 86. How does a JavaScript bundler work (dependency graph, tree shaking, code splitting)?

Bundlers resolve entry points, walk static `import` graphs, and emit optimized assets. Tree shaking marks live exports via static analysis and removes unused code in production mode—`sideEffects` in `package.json` guides safety. Dynamic `import()` creates async chunks loaded on demand. Hashing filenames enables long-term caching. Challenges: barrel files re-exporting side effects, CommonJS interop, and runtime `require` defeating static analysis. Analyze bundle stats regularly; misconfigured externals can duplicate large libraries.

---

## 87. What is AST (Abstract Syntax Tree) and how do tools like Babel and ESLint use it?

ASTs represent source as structured trees—nodes for expressions, statements, declarations—with source locations for transforms and lint messages. Babel parses to AST, transforms via visitors, and generates code with source maps. ESLint walks AST with selectors to flag patterns. Codemods (`jscodeshift`) rewrite large codebases mechanically. Performance matters at scale—incremental parsing and caching in IDEs help. When writing rules, preserve comments and formatting using recast or thoughtful codegen options.

---

## 88. How do source maps work?

Source maps encode mappings from generated code back to original sources using VLQ-encoded line/column segments; optional `sourcesContent` embeds sources for debugging without separate files. Browsers and Node use them for stack traces and breakpoints. Pitfalls: stale maps after misconfigured builds, incorrect `sourcesRoot`, and leaking proprietary sources—host maps securely or omit `sourcesContent` in public artifacts. Upload maps to error trackers with release versions. Validate maps in CI when debugging production issues.

---

## 89. What are Vite, esbuild, and SWC, and how do they differ from webpack?

Vite serves native ESM in dev with fast cold starts and uses Rollup for optimized production builds; esbuild prebundles dependencies. esbuild (Go) and SWC (Rust) transpile and minify at very high speed using parallelism. webpack offers deep plugin flexibility and mature ecosystem but slower defaults. Choose based on constraints: complex custom pipelines (webpack), greenfield speed (Vite/esbuild/SWC). Frameworks (Next, Nuxt) wrap tooling—follow their supported paths. Migration requires auditing loader parity and HMR behavior.

---

## 90. How do you implement a custom Babel plugin or ESLint rule?

Babel plugins export a function returning a `visitor` mapping node types to enter/exit handlers; use `@babel/types` builders and path APIs to mutate safely. ESLint rules export `meta` and `create(context)` with listeners; `RuleTester` validates positive/negative cases. Provide autofixes only when semantics are preserved—document risky fixes. Version against parser ecmaVersion and share configs across repos. Publish internal rule packs with examples—rules without docs get disabled locally.

```javascript
export default function () {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name === 'DEBUG') path.remove();
      },
    },
  };
}
```

---

## 91. What is incremental compilation and how do modern tools achieve it?

Incremental builds reuse prior artifacts when inputs change minimally—hashing files, tracking module graphs, and persisting caches to disk. TypeScript `--incremental`, SWC caches, and esbuild incremental mode exemplify this. Remote caches (Turborepo, CI vendors) share work across machines keyed by lockfiles and toolchain versions. Pitfalls: stale outputs after toolchain upgrades—bump cache keys. Monorepos use affected-only subsets to shrink work. Measure clean vs incremental times to justify investment.

---

## 92. How does Hot Module Replacement (HMR) work?

Dev servers inject a runtime that replaces modules when sources change, propagating `accept` boundaries up the graph or falling back to full reload. State may be preserved via `import.meta.hot.data` patterns in supported frameworks. React Fast Refresh tracks component identity to avoid losing local state unnecessarily. Service workers and SSR require careful HMR integration—misconfigurations cause stale modules. Production builds strip HMR. When debugging weird state, prefer hard reload to rule out HMR artifacts.

```javascript
if (import.meta.hot) {
  import.meta.hot.accept('./module.js', (mod) => {
    applyUpdate(mod);
  });
}
```

---

## 93. How does the browser rendering pipeline work in detail (parse, style, layout, paint, composite)?

HTML parsing constructs the DOM; CSS builds the CSSOM; together they form a render tree of visual elements. Style resolves cascades to computed values. Layout computes geometry—any change to layout-affecting properties can force reflow for dependent subtrees. Paint fills display lists into layers; composite merges layers GPU-side. JS can force layout thrashing by interleaving reads and writes of layout properties in loops. Animating `transform`/`opacity` often stays compositor-only; `top`/`left` may trigger layout. Chunk work to meet frame budgets.

```javascript
for (const el of elements) {
  el.style.width = el.clientWidth + 10 + 'px';
}
```

---

## 94. What is the difference between compositor layers and main thread rendering?

Compositor layers are GPU-backed surfaces for elements promoted to isolate repaints—animations on `transform`/`opacity` can run without full main-thread layout when possible. Main-thread work includes JS, style recalculation, and layout. `will-change` hints promotion but can waste memory if overused. Input handling still runs on the main thread unless offloaded—smooth scrolling can hide main-thread stalls. Measure long tasks and INP alongside FPS. Balance layer count vs memory on mobile GPUs.

---

## 95. How do you use the Performance API (PerformanceObserver, marks, measures)?

`performance.mark`/`measure` annotate timelines for spans; `PerformanceObserver` subscribes to entry types (`navigation`, `resource`, `longtask`, `paint`, LCP-related metrics where supported). Long tasks highlight main-thread blocking. Integrate marks with OpenTelemetry web traces via `traceparent` propagation. Sample in production to limit overhead—high-volume sites batch or throttle. Compare `performance.now()` monotonic timestamps for micro-measurements within a page. Use buffered observers when subscribing late to avoid missing early entries.

```javascript
performance.mark('start');
await work();
performance.mark('end');
performance.measure('work', 'start', 'end');
```

---

## 96. What is the Storage API landscape (IndexedDB, Cache API, OPFS)?

`localStorage`/`sessionStorage` are synchronous and small—avoid main-thread blocking writes. IndexedDB is async, structured, and suitable for large offline caches with transactions. Cache API stores `Response` objects keyed by `Request`, ideal for Service Worker precaching. Origin Private File System (OPFS) offers performant file-like storage with sync handles in workers—great for WASM or media processing. Eviction policies differ—especially on mobile Safari—test quota errors. Encrypt sensitive local data; never store secrets unprotected.

---

## 97. How do WebAssembly and JavaScript interoperate?

Wasm modules export functions callable from JS; imports supply JS functions to Wasm. Linear memory is an `ArrayBuffer` view—copies may occur for some marshalling paths depending on toolchain. Minimize boundary crossings for hot loops; batch data. Toolchains like Emscripten and wasm-bindgen generate glue. Startup includes compile and instantiate costs—measure on mobile. SIMD and threads (with SAB) extend performance when available. Use JS for DOM and orchestration; Wasm for compute kernels.

```javascript
const { instance } = await WebAssembly.instantiateStreaming(fetch('/mod.wasm'));
const result = instance.exports.add(1, 2);
```

---

## 98. What are Worklets (Paint, Animation, Audio, Layout)?

Worklets are lightweight, isolated global scopes for extension points without blocking the main thread’s primary JS execution model. `AudioWorklet` runs real-time audio processing; `PaintWorklet` registers custom paint for CSS; `AnimationWorklet` drives parallel animations; `LayoutWorklet` enables custom layout algorithms. They load via `addModule` and have strict determinism constraints compared to full workers. Support varies—feature-detect. Useful for advanced rendering and audio pipelines where main-thread JS cannot meet deadlines.

---

## 99. How does the Navigation API (replacing History API) work?

The Navigation API centralizes same-origin navigations with `navigate` events, `navigation.transition`, and interception APIs that reduce ad hoc `pushState` patching. It improves scroll restoration handling and integrates with single-page routing patterns. Use `event.intercept` for async transitions and cancellation of in-flight navigations. Feature-detect—support is evolving; polyfills are limited. Align router implementations with accessibility and focus management during navigations. Useful for analytics and unified loading states across SPA transitions.

```javascript
navigation.addEventListener('navigate', (e) => {
  if (e.canIntercept) e.intercept({ handler: () => router.go(e.destination.url) });
});
```

---

## 100. What is the Scheduler API (`scheduler.postTask()`) and how does it enable priority-based scheduling?

`scheduler.postTask` schedules callbacks with explicit priorities (`user-blocking`, `user-visible`, `background`) and integrates with the browser’s scheduling, yielding better than ad hoc `setTimeout` chains for main-thread work partitioning. It accepts `AbortSignal` for cancellation and cooperates with rendering deadlines. Use to chunk heavy work while preserving input responsiveness—pair with yielding strategies. Feature-detect; fall back to `requestIdleCallback` or `setTimeout` with delays. Instrument task durations to ensure background tasks do not starve indefinitely—apply aging if needed.

```javascript
await scheduler.postTask(() => heavyWorkChunk(), { priority: 'background' });
```

---
