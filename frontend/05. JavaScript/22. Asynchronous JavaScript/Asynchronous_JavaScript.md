# JavaScript Asynchronous Programming

JavaScript is **single-threaded**, yet it handles I/O, timers, user input, and network requests without freezing the UI. That balance comes from **asynchronous programming**: deferring work, scheduling callbacks, and coordinating results with callbacks, Promises, and `async`/`await`. This guide explains how the runtime schedules work, how each API behaves, and how to compose reliable async code in browsers and Node.js.

---

## 📑 Table of Contents

1. [Sync vs Async: Blocking, Event Loop, and Queues](#1-sync-vs-async-blocking-event-loop-and-queues)
   - [Blocking vs non-blocking](#blocking-vs-non-blocking)
   - [Call stack](#call-stack)
   - [Task queue (macrotasks)](#task-queue-macrotasks)
   - [Microtask queue](#microtask-queue)
   - [Event loop basics](#event-loop-basics)
2. [Callbacks](#2-callbacks)
   - [Basics](#callback-basics)
   - [Async callbacks](#async-callbacks)
   - [Callback hell](#callback-hell)
   - [Error-first callbacks](#error-first-callbacks)
   - [Callback patterns](#callback-patterns)
3. [Promises (ES6)](#3-promises-es6)
   - [States](#promise-states)
   - [Creating promises](#creating-promises)
   - [then, catch, finally](#then-catch-finally)
   - [Chaining](#promise-chaining)
   - [Returning promises](#returning-promises)
   - [Error handling](#promise-error-handling)
4. [Promise Static Methods](#4-promise-static-methods)
   - [Promise.resolve and Promise.reject](#promiseresolve-and-promisereject)
   - [Promise.all](#promiseall)
   - [Promise.allSettled (ES2020)](#promiseallsettled-es2020)
   - [Promise.race](#promiserace)
   - [Promise.any (ES2021)](#promiseany-es2021)
   - [Comparison](#static-methods-comparison)
5. [Async/Await (ES2017)](#5-asyncawait-es2017)
   - [async functions](#async-functions)
   - [await](#the-await-keyword)
   - [Returning values](#async-return-values)
   - [try/catch](#async-error-handling-with-trycatch)
   - [vs raw Promises](#asyncawait-vs-promises)
   - [Parallel vs sequential](#parallel-and-sequential-execution)
   - [Top-level await (ES2022)](#top-level-await-es2022)
6. [Timers](#6-timers)
   - [setTimeout and clearTimeout](#settimeout-and-cleartimeout)
   - [setInterval and clearInterval](#setinterval-and-clearinterval)
   - [setImmediate (Node.js)](#setimmediate-nodejs)
   - [process.nextTick (Node.js)](#processnexttick-nodejs)
7. [Event Loop Deep Dive](#7-event-loop-deep-dive)
   - [Phases and ordering](#phases-and-ordering)
   - [Macro vs micro tasks](#macro-vs-micro-tasks)
   - [requestAnimationFrame](#requestanimationframe)
   - [requestIdleCallback](#requestidlecallback)
8. [Async Patterns](#8-async-patterns)
   - [Sequential execution](#sequential-execution)
   - [Parallel execution](#parallel-execution)
   - [Race conditions](#race-conditions)
   - [Retry logic](#retry-logic)
   - [Timeout patterns](#timeout-patterns)
   - [Circuit breaker](#circuit-breaker)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Sync vs Async: Blocking, Event Loop, and Queues

### Blocking vs non-blocking

**Synchronous** code runs line by line; each statement **blocks** the thread until it finishes. **Asynchronous** APIs **schedule** work (or wait for external events) and return immediately; a **callback** or **Promise** continues later. Non-blocking I/O does not mean work is instant—it means the main thread can keep running other tasks while waiting.

```javascript
// Synchronous: each step blocks until complete
function syncWork() {
  console.log('1');
  console.log('2');
  console.log('3');
}
syncWork();
// Output order: 1, 2, 3

// Asynchronous: scheduling defers execution
console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');
// Typical output: A, C, B (B runs after current sync work + task queue)
```

### Call stack

The **call stack** tracks **currently executing** functions. When a function is invoked, a **stack frame** is pushed; when it returns, the frame is popped. Deep or infinite recursion overflows the stack. Only one frame runs at a time on the main thread.

```javascript
function first() {
  second();
  console.log('first done');
}

function second() {
  console.log('inside second');
}

first();
// Stack: first → second → (second returns) → first continues
```

### Task queue (macrotasks)

Operations like `setTimeout`, `setInterval`, I/O completion, and UI events enqueue **tasks** (often called **macrotasks**). When the call stack is empty, the **event loop** picks the next task and runs its callback.

```javascript
setTimeout(() => console.log('task 1'), 0);
setTimeout(() => console.log('task 2'), 0);
console.log('sync');
// sync, then task 1, then task 2 (FIFO for same delay)
```

### Microtask queue

**Microtasks** include Promise reactions (`.then` / `.catch` / `.finally`), `queueMicrotask()`, and `MutationObserver` callbacks in browsers. After the current script/task finishes and the stack is empty, **all microtasks** run before the next macrotask.

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

queueMicrotask(() => console.log('4'));

console.log('5');

// Typical order: 1, 5, 3, 4, 2
// (microtasks 3, 4 before the timeout macrotask 2)
```

### Event loop basics

The **event loop** repeatedly:

1. Executes **synchronous** code until the stack is empty.
2. Drains the **microtask** queue completely.
3. Takes **one** macrotask from the task queue and runs it.
4. Repeats.

This model explains ordering between Promises, timers, and rendering.

```javascript
async function demo() {
  console.log('a');
  await Promise.resolve();
  console.log('b');
}

console.log('start');
demo();
console.log('end');
// Often: start, a, end, b (await splits execution; microtasks resume async body)
```

---

## 2. Callbacks

### Callback basics

A **callback** is a function passed to another function to be invoked **later**. Synchronous callbacks run immediately inside the caller; asynchronous callbacks run after an event or timer.

```javascript
function greet(name, done) {
  done(`Hello, ${name}`);
}

greet('Ada', (msg) => console.log(msg)); // synchronous callback

function runLater(fn) {
  setTimeout(fn, 100);
}

runLater(() => console.log('later')); // asynchronous callback
```

### Async callbacks

Async callbacks are the classic way to handle completion of **non-blocking** work: file reads, HTTP, database queries, user clicks.

```javascript
function fakeFetch(url, callback) {
  setTimeout(() => {
    callback(null, { url, data: 'payload' });
  }, 50);
}

fakeFetch('/api/user', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(result.data);
});
```

### Callback hell

**Nested** callbacks for sequential steps become hard to read and maintain—often called **callback hell** or the **pyramid of doom**.

```javascript
getData('a', (err, a) => {
  if (err) return handle(err);
  getData('b', (err, b) => {
    if (err) return handle(err);
    getData('c', (err, c) => {
      if (err) return handle(err);
      combine(a, b, c);
    });
  });
});
```

Promises and `async`/`await` flatten this structure.

### Error-first callbacks

Node.js-style APIs use **error-first** signatures: `(err, result) => { ... }`. The first argument is `null` on success or an **Error** on failure.

```javascript
const fs = require('fs');

fs.readFile('config.json', 'utf8', (err, data) => {
  if (err) {
    console.error('read failed', err.message);
    return;
  }
  console.log(JSON.parse(data));
});
```

### Callback patterns

**Named callbacks** improve stack traces; **guarding** avoids double invocation; **cancellation** may use flags or `AbortController` with modern APIs.

```javascript
function safeOnce(fn) {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    fn(...args);
  };
}

const finish = safeOnce((err, data) => {
  console.log(err || data);
});

// finish can only run effectively once
```

---

## 3. Promises (ES6)

### Promise states

A Promise is in exactly one state:

- **pending** — initial; neither settled yet
- **fulfilled** — completed successfully with a **value**
- **rejected** — failed with a **reason** (often an `Error`)

Once fulfilled or rejected, the state is **immutable**.

```javascript
const p = new Promise(() => {});
console.log(p); // Promise { <pending> }

const ok = Promise.resolve(42);
ok.then((v) => console.log(v)); // 42 — fulfilled

const bad = Promise.reject(new Error('no'));
bad.catch((e) => console.log(e.message)); // no — rejected
```

### Creating promises

Use the **constructor** when wrapping callback-based APIs. Call `resolve(value)` or `reject(reason)` **once**.

```javascript
function delay(ms, value) {
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      reject(new RangeError('ms must be non-negative'));
      return;
    }
    setTimeout(() => resolve(value), ms);
  });
}

delay(100, 'ready').then(console.log);
```

### then, catch, finally

- **`.then(onFulfilled, onRejected)`** — handles success and optionally rejection in the second argument (prefer `.catch` for readability).
- **`.catch(onRejected)`** — shorthand for `.then(undefined, onRejected)`.
- **`.finally(onFinally)`** — runs when settled; use for cleanup; receives no value (use outer scope).

```javascript
fetch('/api/data')
  .then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  })
  .then((data) => console.log(data))
  .catch((err) => console.error('failed', err))
  .finally(() => console.log('done'));
```

### Promise chaining

`.then` returns a **new** Promise. Returning a value wraps it in `Promise.resolve`; returning a Promise **chains** through that Promise’s outcome.

```javascript
Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => Promise.resolve(x * 2))
  .then((x) => {
    console.log(x); // 4
  });
```

### Returning promises

Functions that return Promises compose cleanly. Errors propagate down the chain until a `.catch` handles them.

```javascript
function loadUser(id) {
  return fetch(`/users/${id}`).then((r) => r.json());
}

function loadPosts(userId) {
  return fetch(`/users/${userId}/posts`).then((r) => r.json());
}

loadUser(1)
  .then((user) => loadPosts(user.id))
  .then((posts) => console.log(posts.length))
  .catch(console.error);
```

### Promise error handling

Unhandled rejections may surface as **global errors**. Always end chains with `.catch` or use `try/catch` with `async`/`await`.

```javascript
Promise.resolve()
  .then(() => {
    throw new Error('oops');
  })
  .catch((e) => {
    console.error('handled', e.message);
    return 'recovered';
  })
  .then((v) => console.log(v)); // recovered
```

---

## 4. Promise Static Methods

### Promise.resolve and Promise.reject

**`Promise.resolve(x)`** returns a fulfilled Promise (or adopts if `x` is thenable). **`Promise.reject(r)`** returns a rejected Promise.

```javascript
Promise.resolve(10).then(console.log); // 10

const thenable = {
  then(resolve) {
    resolve('from thenable');
  },
};

Promise.resolve(thenable).then(console.log); // from thenable

Promise.reject(new Error('fail')).catch((e) => console.log(e.message));
```

### Promise.all

**`Promise.all(iterable)`** fulfills with an **array of results** when **all** input Promises fulfill. If **any** reject, the result rejects with **that** reason (first rejection wins in practice for already-settled competitors).

```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);

Promise.all([p1, p2]).then((arr) => console.log(arr)); // [1, 2]

Promise.all([Promise.resolve('ok'), Promise.reject('bad')]).catch((e) =>
  console.log(e)
); // bad
```

### Promise.allSettled (ES2020)

**`Promise.allSettled(iterable)`** waits until **every** input settles. Each result is `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`.

```javascript
const results = await Promise.allSettled([
  Promise.resolve('a'),
  Promise.reject(new Error('b')),
]);

for (const r of results) {
  if (r.status === 'fulfilled') console.log('value', r.value);
  else console.log('reason', r.reason.message);
}
```

### Promise.race

**`Promise.race(iterable)`** settles with the **first** settled Promise (fulfillment or rejection).

```javascript
function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  );
}

Promise.race([fetch('/api'), timeout(5000)])
  .then((res) => console.log('got response'))
  .catch((e) => console.log(e.message));
```

### Promise.any (ES2021)

**`Promise.any(iterable)`** fulfills with the **first fulfillment**. If **all** reject, it rejects with an **`AggregateError`** of all reasons.

```javascript
const fastest = Promise.any([
  fetch('/mirror-a'),
  fetch('/mirror-b'),
  fetch('/mirror-c'),
]);

fastest
  .then((res) => console.log('first ok', res.url))
  .catch((e) => console.log('all failed', e.errors));
```

### Static methods comparison

| Method           | Resolves when                         | Rejects when                          |
|-----------------|----------------------------------------|----------------------------------------|
| `all`           | All fulfill                            | Any rejects                            |
| `allSettled`    | Always (array of outcomes)             | Never                                  |
| `race`          | First settles (fulfill or reject)      | First rejection if that wins           |
| `any`           | First fulfillment                      | All reject (`AggregateError`)          |

```javascript
// Quick mental model
// all:     need every success
// allSettled: inventory every outcome
// race:    first done wins (including failure)
// any:     first success wins; all fail = error bundle
```

---

## 5. Async/Await (ES2017)

### Async functions

Functions declared with **`async`** always return a **Promise**. Non-Promise return values are wrapped; thrown errors become rejections.

```javascript
async function add(a, b) {
  return a + b;
}

add(2, 3).then(console.log); // 5

async function boom() {
  throw new Error('async throw');
}

boom().catch((e) => console.log(e.message));
```

### The await keyword

**`await`** pauses **only the async function** (not the whole thread) until the awaited Promise settles, then resumes with the value or throws on rejection.

```javascript
async function load() {
  const res = await fetch('/api/items');
  const data = await res.json();
  return data;
}
```

### Async return values

Returning inside `async` is equivalent to `Promise.resolve(value)`. Returning another Promise flattens (same as `then`).

```javascript
async function nested() {
  return Promise.resolve('inner');
}

nested().then(console.log); // inner
```

### Async error handling with try/catch

Use **`try/catch`** around `await` for linear error handling—similar to synchronous code.

```javascript
async function safeLoad(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.error('load failed', err);
    return null;
  }
}
```

### Async/await vs Promises

`async`/`await` is **syntactic sugar** over Promises. Use whichever reads best; they interoperate.

```javascript
// Promise chain
function chain() {
  return step1()
    .then(step2)
    .then(step3)
    .catch(handle);
}

// async/await equivalent
async function linear() {
  try {
    const a = await step1();
    const b = await step2(a);
    return await step3(b);
  } catch (e) {
    return handle(e);
  }
}
```

### Parallel and sequential execution

**Sequential**: each `await` waits for the previous. **Parallel**: start Promises first, then `await` them together (e.g. `Promise.all`).

```javascript
async function sequential() {
  const a = await slowA(); // waits
  const b = await slowB(); // then waits — total time ≈ a + b
  return [a, b];
}

async function parallel() {
  const pa = slowA();
  const pb = slowB();
  return Promise.all([pa, pb]); // total time ≈ max(a, b)
}

// Common mistake: accidental sequentialization
async function accidental() {
  const a = await slowA();
  const b = await slowB(); // B didn't start until A finished
}
```

### Top-level await (ES2022)

In **ES modules**, **`await`** at the top level blocks **module evaluation** (not the whole app—other modules can still load per loader rules). Useful for bootstrapping config.

```javascript
// module.mjs (ES module)
const config = await fetch('/config.json').then((r) => r.json());
export { config };
```

In **CommonJS** or browsers without modules, wrap in an async IIFE or use `.then`.

```javascript
(async () => {
  const mod = await import('./dynamic.mjs');
  mod.init();
})();
```

---

## 6. Timers

### setTimeout and clearTimeout

**`setTimeout(fn, delayMs, ...args)`** schedules `fn` after at least `delayMs` milliseconds (not a real-time guarantee under load). Returns a **timer id** for cancellation.

```javascript
const id = setTimeout(
  (name) => {
    console.log('hi', name);
  },
  1000,
  'World'
);

clearTimeout(id); // cancels before firing
```

### setInterval and clearInterval

**`setInterval`** repeats execution at roughly each interval. Prefer **`setTimeout`** chaining if drift matters or intervals can overlap.

```javascript
const tick = setInterval(() => console.log('tick'), 1000);
clearInterval(tick);

// Chained setTimeout: no pile-up if fn slower than interval
function loop() {
  setTimeout(() => {
    doWork();
    loop();
  }, 1000);
}
```

### setImmediate (Node.js)

**`setImmediate(fn)`** schedules a callback to run **after** I/O events in the **check** phase of the Node event loop. Not standardized for browsers.

```javascript
// Node.js
setImmediate(() => console.log('immediate'));

setTimeout(() => console.log('timeout 0'), 0);

// Often: immediate before timeout 0 in Node (ordering can vary by context)
```

### process.nextTick (Node.js)

**`process.nextTick(fn)`** runs **before** the next event loop phase—highest priority among Node callbacks. Overuse can **starve** I/O; prefer `setImmediate` for most deferral.

```javascript
// Node.js
console.log('1');
setTimeout(() => console.log('2'), 0);
process.nextTick(() => console.log('3'));
console.log('4');
// Typical: 1, 4, 3, 2
```

---

## 7. Event Loop Deep Dive

### Phases and ordering

**Browser** (simplified): run script → microtasks → possibly render → next task (timer, input, etc.). **Node** has explicit phases: timers, pending callbacks, poll, check, close callbacks—plus microtasks and `nextTick` between steps.

```javascript
// Illustration: microtasks between macrotasks
setTimeout(() => console.log('timer1'), 0);
setTimeout(() => console.log('timer2'), 0);
Promise.resolve().then(() => console.log('micro'));
// Often: micro, timer1, timer2 (all microtasks drain before next timer task)
```

### Macro vs micro tasks

| Kind        | Examples                                      |
|------------|------------------------------------------------|
| Macrotask  | `setTimeout`, `setInterval`, I/O, UI events    |
| Microtask  | `Promise` reactions, `queueMicrotask`, `MutationObserver` |

```javascript
queueMicrotask(() => console.log('micro A'));
Promise.resolve().then(() => console.log('micro B'));
setTimeout(() => console.log('macro'), 0);
// micro A, micro B, macro
```

### requestAnimationFrame

**`requestAnimationFrame(cb)`** runs `cb` **before** the next **repaint**, synced to display refresh—ideal for smooth animations.

```javascript
function animate(time) {
  // update DOM / canvas using time (DOMHighResTimeStamp)
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### requestIdleCallback

**`requestIdleCallback(cb)`** (browser) schedules work when the browser is **idle**, with a **deadline** object. Good for low-priority tasks; check `deadline.timeRemaining()`.

```javascript
function lowPriority(deadline) {
  while (deadline.timeRemaining() > 0 && workQueue.length) {
    const job = workQueue.shift();
    job();
  }
  if (workQueue.length) {
    requestIdleCallback(lowPriority);
  }
}

requestIdleCallback(lowPriority);
```

---

## 8. Async Patterns

### Sequential execution

Run async steps **one after another** when each depends on the previous result.

```javascript
async function pipeline(ids) {
  const results = [];
  for (const id of ids) {
    const item = await fetchItem(id);
    results.push(item);
  }
  return results;
}
```

### Parallel execution

Run **independent** tasks together to minimize latency.

```javascript
async function fetchAll(urls) {
  const tasks = urls.map((u) => fetch(u).then((r) => r.json()));
  return Promise.all(tasks);
}
```

### Race conditions

When **shared mutable state** is updated from concurrent async work, outcomes depend on timing—**race conditions**. Prefer immutable updates, queues, or atomic operations.

```javascript
// Problematic: concurrent increments on shared object
let counter = { n: 0 };

async function bad() {
  await Promise.all([
    (async () => {
      const v = counter.n;
      await delay(10);
      counter.n = v + 1;
    })(),
    (async () => {
      const v = counter.n;
      await delay(10);
      counter.n = v + 1;
    })(),
  ]);
}

// Safer: single writer or reduce from fetched values
async function better() {
  const [a, b] = await Promise.all([fetchA(), fetchB()]);
  return { n: a.inc + b.inc };
}
```

### Retry logic

**Retry** transient failures with **backoff** and a **max attempts** cap.

```javascript
async function withRetry(fn, { tries = 3, delayMs = 200 } = {}) {
  let lastError;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < tries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}

withRetry(() => fetch('/flaky')).then(console.log).catch(console.error);
```

### Timeout patterns

Combine the real operation with **`Promise.race`** against a timeout Promise.

```javascript
function timeoutPromise(ms, message = 'timeout') {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
}

async function fetchWithTimeout(url, ms) {
  const res = await Promise.race([
    fetch(url),
    timeoutPromise(ms, `fetch exceeded ${ms}ms`),
  ]);
  return res;
}
```

### Circuit breaker

After repeated failures, **stop calling** the dependency for a **cooldown** to avoid overload; periodically try **half-open** recovery.

```javascript
function createBreaker({ threshold = 3, resetMs = 10_000 } = {}) {
  let failures = 0;
  let openedAt = null;
  const state = () => {
    if (openedAt && Date.now() - openedAt > resetMs) return 'half-open';
    if (failures >= threshold) return 'open';
    return 'closed';
  };

  return async function call(fn) {
    const s = state();
    if (s === 'open') throw new Error('circuit open');

    try {
      const result = await fn();
      failures = 0;
      openedAt = null;
      return result;
    } catch (e) {
      failures += 1;
      if (failures >= threshold) openedAt = Date.now();
      throw e;
    }
  };
}

const breaker = createBreaker();
breaker(() => fetch('/api')).catch(console.error);
```

---

## Best Practices

- **Prefer Promises or `async`/`await`** over raw callback pyramids for new code; use **`util.promisify`** in Node for legacy APIs when needed.
- **Always handle rejections**: end Promise chains with `.catch`, use `try/catch` with `await`, or attach **`unhandledrejection`** handlers in apps for logging.
- **Choose the right combinator**: `all` for “every success,” `allSettled` for partial failure tolerance, `race` for first completion, `any` for redundant providers.
- **Avoid accidental sequential `await`**: start independent Promises together, then await—use `Promise.all` / `allSettled` for fan-out.
- **Keep microtasks cheap**: long microtask chains can delay rendering and timer callbacks; defer heavy work to macrotasks or workers if needed.
- **Use `AbortController`** with `fetch` to cancel in-flight requests and avoid stale updates when components unmount or navigation changes.
- **Document timer guarantees**: treat `setTimeout(0)` as “after current work,” not “instantly.”
- **Test failure paths**: timeouts, network errors, and partial `allSettled` results are where production bugs hide.

```javascript
// Abortable fetch example
const ac = new AbortController();
const t = setTimeout(() => ac.abort(), 8000);

fetch('/data', { signal: ac.signal })
  .then((r) => r.json())
  .finally(() => clearTimeout(t));
```

---

## Common Mistakes to Avoid

- **Forgetting `await`**: calling an `async` function without `await`/`.then` returns a **Pending** Promise, not the value.
- **Swallowing errors**: empty `.catch(() => {})` hides bugs; at least log or rethrow.
- **Mixing sync throw in Promise constructor**: throws inside `new Promise` reject the Promise, but sync throw **after** `resolve` in `.then` needs `.catch` on the chain.
- **Assuming `forEach` + async**: `forEach` does not wait for async callbacks; use **`for...of` + await** or `map` + `Promise.all`.
- **Creating unnecessary `async`**: if you only return a Promise, return it directly without `async` to avoid an extra microtask wrapper (minor, but clearer).
- **Relying on exact timer order** between `setTimeout(0)`, `setImmediate`, and microtasks across environments—code should not depend on fragile cross-API ordering.
- **Mutating shared state** across concurrent `await` gaps without clear ownership.
- **Unbounded parallelism**: `Promise.all` on huge arrays can overwhelm servers or memory; use **batches** or a **pool** limit.

```javascript
// Wrong: forEach does not await
async function wrong(ids) {
  const out = [];
  ids.forEach(async (id) => {
    out.push(await fetchItem(id)); // race: out order/size wrong
  });
}

// Right: sequential
async function rightSequential(ids) {
  const out = [];
  for (const id of ids) out.push(await fetchItem(id));
  return out;
}

// Right: parallel with all
async function rightParallel(ids) {
  return Promise.all(ids.map((id) => fetchItem(id)));
}
```

---

This document aligns with modern ECMAScript and common runtime behavior; always verify edge cases (e.g. Node vs browser timer ordering) against current MDN and engine documentation for your deployment targets.
