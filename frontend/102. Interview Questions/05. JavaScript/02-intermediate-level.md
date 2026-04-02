# JavaScript Interview Questions — Intermediate (4+ Years Experience)

100 in-depth questions with detailed answers for mid-level developers. Covers advanced concepts, patterns, and real-world scenarios.

---

## 1. What is an execution context, and what phases does it go through when a function runs?

An execution context is the internal structure the engine uses to track running code: bindings (`var`, `let`, `const`, `class`), the outer lexical environment for lookup, the `this` value, and (in functions) arguments. Each invocation pushes a new context onto the call stack; returning pops it. Conceptually, creation initializes hoisting—`var` becomes `undefined`, function declarations are fully initialized, and lexical declarations exist in the temporal dead zone until their line executes—then execution runs line by line. Closures retain outer environment records, which is why nested functions keep access after the outer call completes. Understanding creation vs execution explains TDZ errors, why `typeof` can see hoisted `var` but not TDZ `let`, and how async callbacks get fresh stacks but share captured environments.

```javascript
function demo() {
  console.log(typeof later); // "function" — hoisted declaration
  let x = 1;
  function later() {
    return x;
  }
  return later;
}
```

---

## 2. How does the call stack relate to execution contexts, and what causes stack overflow?

The call stack is a LIFO list of execution contexts for nested calls: synchronous code unwinds strictly in call order. Stack overflow happens when depth exceeds engine limits—typically unbounded or very deep recursion without tail-call optimization (which browsers largely do not apply to JS). The error is `RangeError: Maximum call stack size exceeded`. Async callbacks start with a shallow stack after prior work completes; they do not “stack” the whole async chain synchronously. Trampolines and iterative algorithms avoid overflow for deep logical recursion when TCO is unavailable.

```javascript
function boom() {
  return 1 + boom();
}
// boom(); // RangeError
```

---

## 3. What typically lives on the stack versus the heap in JavaScript implementations?

Engines optimize aggressively, but the useful mental model is: call frames, local primitives, and references are stack-oriented, while objects, arrays, functions, and closure environments backing live bindings live on the heap. Anything that can outlive a single synchronous invocation—returned objects, retained callbacks—must be heap-allocated. Profiling “memory” usually means heap snapshots; stack memory is small per frame but deep recursion multiplies frame count. Retaining one callback that closes over a huge array keeps that array on the heap even after the outer function returns.

```javascript
function factory() {
  const big = new Uint8Array(1_000_000);
  return () => big.byteLength;
}
```

---

## 4. Explain mark-and-sweep garbage collection as used in modern JavaScript VMs.

Tracing collectors start from roots (globals, stack, registers) and mark reachable objects, then sweep unmarked objects. Generational collectors promote survivors to older spaces; write barriers track cross-generational pointers. Cycles of unreachable objects are collected because reachability—not pairwise reference counts—defines liveness. Incremental/concurrent marking reduces pause times. You cannot force GC in portable production JS; `globalThis.gc` is debug-only in some environments. The consequence for developers is: eliminate accidental edges from roots to large graphs.

```javascript
let a = { x: {} };
let b = { y: a.x };
a = b = null; // objects become unreachable if nothing else references them
```

---

## 5. Why is reference counting alone insufficient for JavaScript-style object graphs?

Reference counting frees when refcount hits zero, but mutually referencing objects never hit zero even if detached from the program—classic cycles. Tracing GC avoids this by computing reachability from roots. Some systems combine refcounting with cycle collectors; standard JS engines rely on tracing. Interview insight: explaining cycles shows why “I null everything” intuition differs from refcount semantics.

```javascript
function cycle() {
  const x = {};
  const y = {};
  x.r = y;
  y.r = x;
}
```

---

## 6. What are common JavaScript memory leaks, and how do you find them?

Typical leaks: timers never cleared, event listeners on long-lived targets, unbounded caches (`Map` without eviction), detached DOM nodes retained by JS references, and closures capturing large accidental scope. Tools: heap snapshots, comparison snapshots after actions, retaining path view in DevTools, and monitoring JS heap over time. Fixes narrow references (`WeakMap` for metadata), remove listeners with `{ once: true }` or `AbortController`, and cancel async work on teardown.

```javascript
const cache = new Map();
function remember(k, v) {
  cache.set(k, v); // grows forever without eviction policy
}
```

---

## 7. Describe the event loop and how macrotasks interact with microtasks.

The event loop runs one macrotask at a time (script, timer callback, I/O), then drains the microtask queue completely (`Promise` reactions, `queueMicrotask`, `MutationObserver`). Then rendering may occur (browser), then the next macrotask. This ordering makes `Promise.then` run before `setTimeout(0)` scheduled in the same synchronous block. Starvation happens if microtasks recurse forever—timers and I/O never run. Node has extra phases, but microtask draining after each macrotask is the portable mental model.

```javascript
console.log("a");
setTimeout(() => console.log("timer"), 0);
Promise.resolve().then(() => console.log("micro"));
console.log("b");
// a, b, micro, timer
```

---

## 8. What is the difference between microtasks and macrotasks, and why does it matter for UI code?

Microtasks run at higher priority—before the next timer or I/O callback—while macrotasks yield between iterations. This matters because state updates batched as microtasks can flush before paint in a frame, while timers align with later tasks. Abuse: infinite `queueMicrotask` recursion blocks the tab. Libraries often schedule continuation work as microtasks to stay consistent with promise ordering.

```javascript
let depth = 0;
function chain() {
  if (depth++ > 100000) return;
  queueMicrotask(chain);
}
// chain(); // would starve timers — dangerous
```

---

## 9. What does `queueMicrotask` do, and when is it preferable to `Promise.resolve().then`?

`queueMicrotask(fn)` schedules `fn` on the microtask queue with the same priority as promise reactions—useful when you are not otherwise using promises. It defers work until the current stack clears but before macrotasks, which helps coordinate DOM updates or flush internal queues consistently with promise-based code. It is not a substitute for `setTimeout` when you need a macrotask boundary or minimum delay.

```javascript
queueMicrotask(() => console.log("second"));
console.log("first");
```

---

## 10. How does `requestAnimationFrame` relate to rendering and the event loop?

`requestAnimationFrame` schedules a callback before the next repaint, typically aligned to display refresh. It is the right hook for visual updates (DOM, canvas) to batch work with the browser’s paint pipeline. Unlike `setInterval`, it backs off when the tab is hidden. Pair with `cancelAnimationFrame` for cleanup. It is not a replacement for precise wall-clock timing—audio and networking need other APIs.

```javascript
let id = requestAnimationFrame(function tick(t) {
  // update visuals using timestamp
  id = requestAnimationFrame(tick);
});
```

---

## 11. What is `requestIdleCallback`, and what are realistic pitfalls?

`requestIdleCallback` runs low-priority work when the browser is idle, exposing `deadline.timeRemaining()`. Pitfalls: idle time may never arrive under load; tasks may be deferred indefinitely without a timeout option; API availability varies (Workers lack it). Prefer splitting work into chunks with time budgets; combine with `timeout` in supporting browsers. For scheduler priority, `scheduler.postTask` is emerging where available.

```javascript
requestIdleCallback(
  (deadline) => {
    while (deadline.timeRemaining() > 0 && work.length) {
      work.pop()();
    }
  },
  { timeout: 2000 }
);
```

---

## 12. What is `structuredClone`, and how does it compare to JSON cloning?

`structuredClone` deep-clones using the structured clone algorithm, preserving `Date`, `Map`, `Set`, circular references, typed arrays, and more. JSON loses `undefined`, functions, symbols, `BigInt` (without replacer), and breaks many types. `structuredClone` supports optional transfer of `ArrayBuffer` ownership. Some objects remain uncloneable (certain host objects). It is the standard approach for worker messaging and immutable snapshots when available.

```javascript
const a = { d: new Date(), m: new Map([[1, "x"]]) };
const b = structuredClone(a);
b.m.set(1, "y");
console.log(a.m.get(1)); // still "x"
```

---

## 13. How does the module pattern use closures to encapsulate state?

The module pattern wraps private state in an outer function and returns an object exposing only chosen methods—variables not returned are private. This predates ES modules but models the same encapsulation idea. Closures keep the private bindings alive while the public API is referenced. Trade-offs: testing private helpers requires seams or exports; hard privacy is weaker than `#` fields until modern classes.

```javascript
const counter = (function () {
  let n = 0;
  return {
    inc: () => ++n,
    read: () => n,
  };
})();
```

---

## 14. How does memoization use closures, and what are production pitfalls?

Memoization caches results keyed by arguments using a closure-held `Map`. Pitfalls: unbounded caches, non-stable keys for objects, stale results when underlying data changes, and memory growth on hot paths with diverse keys. Pure functions memoize cleanly; add `maxSize`/`TTL` or use memoization libraries with eviction for production services.

```javascript
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const v = fn.apply(this, args);
    cache.set(key, v);
    return v;
  };
}
```

---

## 15. What is currying, and how does partial application differ?

Currying turns `f(a,b,c)` into `f(a)(b)(c)` with nested unary functions. Partial application fixes some arguments early, yielding a function of fewer parameters—often via `bind` or wrappers. Currying aids functional pipelines; partial application is common in event handlers and configuration. Neither implies the other: currying is a shape; partial application is an operation.

```javascript
const add = (a) => (b) => a + b;
const add5 = add(5);
console.log(add5(10)); // 15
```

---

## 16. Why were IIFEs important, and where do they still appear?

IIFEs create a scope for `var` and avoid global pollution in pre-module scripts. They still appear in legacy bundles, quick isolation snippets, and legacy patterns. ES modules and block scope reduce the need, but `;(async () => { ... })()` remains a bootstrap pattern in scripts without top-level await.

```javascript
(function () {
  const secret = 1;
  console.log(secret);
})();
```

---

## 17. How can closures cause memory leaks with DOM nodes or timers?

A closure keeps its lexical environment alive. If a closure references a DOM subtree or large object graph, that graph stays reachable. Long-lived listeners on `document` capturing huge data are a classic leak. Timers close over variables until cleared—always `clearInterval`/`clearTimeout` on teardown. Weak collections (`WeakMap`) help attach metadata without retaining keys strongly.

```javascript
function bad(el) {
  const huge = new Uint8Array(10_000_000);
  el.addEventListener("click", () => {
    console.log(huge[0]);
  });
}
```

---

## 18. What are `WeakRef` and `FinalizationRegistry` for?

`WeakRef` references an object weakly; `deref()` returns it or `undefined` if collected. `FinalizationRegistry` schedules cleanup callbacks after GC—useful for releasing external resources tied to JS objects, not for deterministic teardown. Finalizers run at an unspecified time; never rely on them for critical safety. Prefer explicit `dispose`/`AbortController` for deterministic lifetimes.

```javascript
const reg = new FinalizationRegistry((held) => {
  console.log("cleanup", held);
});
let obj = { id: 1 };
reg.register(obj, "meta", obj);
obj = null;
```

---

## 19. How does lexical resolution walk environments, and why do closures share live bindings?

Identifier lookup consults the current lexical environment, then outer links until found or error. When two closures capture the same `let` binding in a loop with per-iteration semantics, they share the live binding—observing updates. If a single `var` binding is shared, all closures see the final value—classic interview trap. Engines optimize unused bindings but correctness reasoning uses the full environment model.

```javascript
const fs = [];
for (let i = 0; i < 3; i++) fs.push(() => i);
console.log(fs.map((f) => f())); // [0,1,2]
```

---

## 20. How did developers emulate private state with closures before `#` private fields?

Constructor functions returned objects whose methods close over variables in the constructor scope—true privacy by obscurity, not language enforcement. Unlike `#`, introspection cannot access the fields without exported accessors. Today, private fields provide hard privacy and static analysis support.

```javascript
function Wallet() {
  let balance = 0;
  return {
    deposit(n) {
      balance += n;
    },
    getBalance() {
      return balance;
    },
  };
}
```

---

## 21. Explain the classic `var` + loop + async bug and modern fixes.

`var` is function-scoped, so one binding updates across iterations; deferred callbacks see the final value. Fixes: `let` per iteration, IIFE `(function(i){ ... })(i)`, or `forEach` with `i` parameter. Understanding this separates developers who know scope rules from those who only pattern-match `async` syntax.

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3,3,3
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0); // 0,1,2
}
```

---

## 22. How do weak collections complement closures for caching?

`WeakMap` keys are objects held weakly—ideal for auxiliary data keyed by DOM nodes or instances without preventing GC. Combined with `WeakRef`, you can build caches that do not strongly retain values. You cannot enumerate weak maps—design must not rely on listing entries. This is how you avoid closure + `Map` leaks when ownership is non-exclusive.

```javascript
const metadata = new WeakMap();
function tag(obj, data) {
  metadata.set(obj, data);
}
```

---

## 23. What is the prototype chain, and how does property lookup proceed?

Objects delegate to `[[Prototype]]` via `Object.getPrototypeOf`. Lookup checks own properties, then walks the chain until `null`. Assignment creates an own property unless a setter exists on the chain. `Object.create(null)` removes `Object.prototype`—useful for dict-like maps without `toString` collisions.

```javascript
const base = { a: 1 };
const child = Object.create(base);
console.log(child.a); // inherited
```

---

## 24. Contrast `__proto__`, `prototype`, and `[[Prototype]]`.

`[[Prototype]]` is the internal link; `Object.getPrototypeOf` / legacy `__proto__` expose it. `prototype` is a property of functions used when constructing instances with `new`: `new F()` sets instance `[[Prototype]]` to `F.prototype`. Confusing `Fn.prototype` with `Object.getPrototypeOf(Fn)` is a common mistake—functions inherit from `Function.prototype`.

```javascript
function F() {}
const x = new F();
console.log(Object.getPrototypeOf(x) === F.prototype); // true
```

---

## 25. How does `Object.create` differ from literals and `new Constructor`?

`Object.create(proto)` sets `[[Prototype]]` without running a constructor—ideal for delegation without side effects. `new Ctor()` runs `Ctor` and wires `Ctor.prototype`. Literals inherit from `Object.prototype` unless `Object.create(null)`.

```javascript
const base = { greet() { return "hi"; } };
const d = Object.create(base);
d.greet(); // delegates
```

---

## 26. How did constructor functions emulate class inheritance?

`Sub.prototype = Object.create(Super.prototype)` (plus `constructor` fix) wires the chain; `Super.call(this, ...)` initializes superclass fields. ES6 `class` automates this and `super` semantics. Mis-wiring `prototype` breaks `instanceof` and method inheritance.

```javascript
function Super(x) {
  this.x = x;
}
function Sub(x, y) {
  Super.call(this, x);
  this.y = y;
}
Sub.prototype = Object.create(Super.prototype);
Sub.prototype.constructor = Sub;
```

---

## 27. What do ES6 classes desugar to conceptually?

Methods are placed on `prototype`, statics on the constructor, `extends` sets up prototype links and `super` dispatch, and private fields use internal slots—not a new object model. Classes are not hoisted like function declarations; they are in TDZ until evaluated. Transpilers rewrite to ES5 functions and helpers.

```javascript
class A {
  m() {
    return 1;
  }
}
```

---

## 28. How do public and private class fields (`#`) behave differently?

Public fields initialize on instances; private `#` fields are lexically scoped to the class body and enforced at runtime—no accidental access from subclasses or external code. Static private fields belong to the constructor. Static blocks (`static {}`) run once for initialization.

```javascript
class Box {
  #v = 0;
  inc() {
    this.#v++;
  }
}
```

---

## 29. How do `extends` and `super` cooperate in subclasses?

`extends` sets up inheritance and enables `super()` in constructors to initialize the parent portion of the instance—must run before `this` in derived constructors. In methods, `super.method()` dispatches to parent implementations. Arrow functions in class fields inherit `this` but not `super` from the class body in the same way—subtle edge cases exist.

```javascript
class P {
  m() {
    return 1;
  }
}
class C extends P {
  m() {
    return super.m() + 1;
  }
}
```

---

## 30. What is `Symbol.species` and why do built-ins use it?

`Symbol.species` lets subclasses control which constructor methods like `map` use for output—e.g., returning plain `Array` from a subclass for interoperability. Custom collections can override `static get [Symbol.species]() { return Array; }`.

```javascript
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}
```

---

## 31. Compare `typeof` and `instanceof`—including pitfalls.

`typeof` distinguishes primitives (with `typeof null === "object"` bug) and `"function"` for callables. `instanceof` checks prototype chain membership against `Ctor.prototype`; cross-realm objects break constructor identity, so `Array.isArray` is safer for arrays. `Symbol.hasInstance` customizes `instanceof`.

```javascript
console.log(typeof []); // "object"
console.log([] instanceof Array); // true
```

---

## 32. What are mixins, and how are they expressed in modern JavaScript?

Mixins compose behavior without deep inheritance—often `class C extends Mixin(Base) {}` where `Mixin` returns a subclass. `Object.assign` on prototypes is another pattern but less clean. Private fields complicate mixin composition because `#` scopes are per class body.

```javascript
const Timestamped = (Base) =>
  class extends Base {
    time = Date.now();
  };
class User extends Timestamped(Object) {}
```

---

## 33. Why is `Object.setPrototypeOf` discouraged after object creation?

Mutating `[[Prototype]]` is slow in many engines (deoptimizes shapes) and can surprise security-sensitive code. Prefer `Object.create` at construction or `class` inheritance. Dynamic mutation is rare and should be isolated.

```javascript
const a = {};
Object.setPrototypeOf(a, { x: 1 });
```

---

## 34. What does the `new` operator do, step by step?

Creates a new object with `[[Prototype]]` from `F.prototype`, calls `F` with `this` bound to that object, returns the object unless `F` returns an object (then that object wins). `new.target` identifies the real constructor in subclasses.

```javascript
function F() {
  this.x = 1;
}
console.log(new F());
```

---

## 35. Explain `call`, `apply`, and `bind` with `this` semantics.

`call` invokes with `this` and spread args; `apply` uses an array-like arguments object; `bind` returns a partial function with fixed `this` and args. Arrow functions ignore `this` passed via `call`. Method borrowing uses `call` to invoke array methods on array-likes.

```javascript
function greet(g, p) {
  return `${g}, ${this.name}${p}`;
}
greet.call({ name: "Ada" }, "Hi", "!");
```

---

## 36. How does `this` get determined across method calls, plain calls, arrows, and constructors?

Method call sets `this` to the base object (or `undefined` in strict mode for unqualified calls). Plain `f()` yields `undefined` (strict) or `globalThis` (sloppy). Arrows close over lexical `this`. `new` binds `this` to the new instance. DOM handlers often set `this` to the element—know your API.

```javascript
const obj = { x: 1, m() { return this.x; } };
const f = obj.m;
console.log(f()); // undefined
```

---

## 37. What is method borrowing, and what is a safe pattern?

Borrowing invokes a method from `Prototype` on another receiver—`Array.prototype.slice.call(arrayLike)`. Combine with `Object.prototype.hasOwnProperty.call(obj, key)` when objects may shadow `hasOwnProperty`. Modern code often prefers `Object.hasOwn`.

```javascript
function toArray(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
}
```

---

## 38. What are `compose` and `pipe`, and how do you implement them?

`compose(f,g,h)(x)` conventionally means `f(g(h(x)))` (right-to-left); `pipe` applies left-to-right—state your convention explicitly. Implementation uses `reduce`. Useful for data transforms; debugging may need tap/logging helpers.

```javascript
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);
```

---

## 39. Implement debounce and explain when to prefer throttle.

Debounce waits until activity pauses—great for search-as-you-type. Throttle caps frequency—great for scroll/resize. Debounce resets a timer on each call; throttle uses time windows or trailing edges. Add `cancel`/`flush` for component lifecycles.

```javascript
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}
```

---

## 40. Implement throttle and describe leading vs trailing edges.

Throttle fires at most once per window—leading edge immediate, trailing after quiet period, or both. Scroll handlers often use trailing throttle to coalesce events.

```javascript
function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}
```

---

## 41. What is trampolining, and when does it beat naive recursion?

Trampolining turns recursion into a loop of thunks to avoid stack overflow when TCO is unavailable. Each step returns either a value or a continuation function. Functional parsers use this; performance is slower than iterative loops.

```javascript
function trampoline(fn) {
  return (...args) => {
    let v = fn(...args);
    while (typeof v === "function") v = v();
    return v;
  };
}
```

---

## 42. What is tail call optimization in JavaScript, and can you rely on it?

ES6 specifies tail calls in strict mode for eligible calls, but major browsers do not implement general TCO for JS—do not rely on it for deep recursion. Use loops or trampolines.

```javascript
"use strict";
function sum(n, acc = 0) {
  if (n === 0) return acc;
  return sum(n - 1, acc + n);
}
```

---

## 43. How do generator functions work with `yield` and `next`?

Generators return an iterator; `yield` pauses and returns a value; `next(arg)` resumes, feeding `arg` back as the result of the inner `yield` expression. Local variables persist across suspensions—enabling lazy iteration and cooperative multitasking.

```javascript
function* gen() {
  const x = yield 1;
  yield x + 10;
}
const g = gen();
console.log(g.next()); // { value:1, done:false }
console.log(g.next(5)); // { value:15, done:false }
```

---

## 44. What does `yield*` do?

`yield*` delegates iteration to another iterable or generator, forwarding `return`/`throw` where supported. It composes generators cleanly.

```javascript
function* inner() {
  yield 1;
  yield 2;
}
function* outer() {
  yield* inner();
  yield 3;
}
console.log([...outer()]); // [1,2,3]
```

---

## 45. What is `Symbol.iterator`, and how do you build a custom iterable?

Objects implement `[Symbol.iterator]` returning an iterator with `next()` returning `{value,done}`. `for...of` and spread consume it. Custom iterables enable lazy sequences and domain-specific collections.

```javascript
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let n = this.from;
    const last = this.to;
    return {
      next() {
        if (n > last) return { done: true, value: undefined };
        return { done: false, value: n++ };
      },
    };
  },
};
console.log([...range]);
```

---

## 46. How do async generators differ from synchronous ones?

`async function*` yields promises/values; `for await...of` consumes them. They implement the async iterator protocol—`next` returns a promise. Useful for streaming paginated data or async I/O sequences.

```javascript
async function* pages() {
  for (let i = 1; i <= 2; i++) {
    yield i;
  }
}
(async () => {
  for await (const p of pages()) console.log(p);
})();
```

---

## 47. What does `for await...of` require, and how do errors propagate?

It must run inside an async context; it awaits each step of an async iterable. Use `try/catch` around the loop for failures; `throw` into generators can be handled with `try/catch` inside the generator or outer await.

```javascript
async function consume(ai) {
  for await (const v of ai) {
    console.log(v);
  }
}
```

---

## 48. How do generators enable lazy evaluation and infinite sequences?

Generators compute on demand via `next`, so infinite sequences are representable without storing all elements. Compose `map`/`filter` as generator pipelines—careful with operations that require full materialization.

```javascript
function* naturals() {
  let n = 0;
  while (true) yield n++;
}
```

---

## 49. How did generators enable async control flow before `async/await`?

Libraries executed `yield`ed promises with a runner, resuming on fulfillment—`co`-style flows. This mirrors how `async` functions desugar to promise machinery. Understanding this clarifies debugging stepping and error propagation in generators.

```javascript
function run(genFn) {
  const g = genFn();
  return new Promise((resolve, reject) => {
    function step(v) {
      let r;
      try {
        r = g.next(v);
      } catch (e) {
        reject(e);
        return;
      }
      if (r.done) return resolve(r.value);
      Promise.resolve(r.value).then(step, reject);
    }
    step();
  });
}
```

---

## 50. Explain `Symbol.toPrimitive`, `Symbol.toStringTag`, and `Symbol.hasInstance`.

`Symbol.toPrimitive` customizes coercion order; `Symbol.toStringTag` affects `Object.prototype.toString` branding; `Symbol.hasInstance` customizes `instanceof` via static methods. These integrate objects with language operations without polluting string keys.

```javascript
class Metric {
  static [Symbol.hasInstance](x) {
    return x && x.unit === "m";
  }
}
```

---

## 51. What are iterator `return` and `throw`, and when does `for-of` call them?

If iteration ends early (break, error, `return`), `for-of` calls `iterator.return()` to cleanup—important for file locks or disposable resources. Generator `try/finally` runs on `return()`. Implementing iterators correctly prevents resource leaks.

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log("cleanup");
  }
}
const it = gen();
it.next();
it.return();
```

---

## 52. How do you combine generator pipelines for transformations?

Map/filter as generators avoid intermediate arrays: yield from inner loops, short-circuit with conditions. Readable and memory-friendly for large inputs.

```javascript
function* map(iter, fn) {
  for (const v of iter) yield fn(v);
}
```

---

## 53. What is `Symbol.asyncIterator`, and how does it relate to `Symbol.iterator`?

Async iterables expose `[Symbol.asyncIterator]` returning an object whose `next` returns promises. Sync iterables use `[Symbol.iterator]`. Node streams and browser `ReadableStream` async iteration build on this.

```javascript
const ai = {
  async *[Symbol.asyncIterator]() {
    yield 1;
    yield 2;
  },
};
```

---

## 54. What are common pitfalls when mixing generators and `this`?

Generators are functions—`this` depends on call style. If you need a bound `this`, use arrow-wrapped methods or `bind`. Class generator methods use the instance `this` when invoked as `obj.method()`.

```javascript
const obj = {
  x: 1,
  *gen() {
    yield this.x;
  },
};
console.log(obj.gen().next().value); // 1
```

---

## 55. How do well-known symbols customize core operations beyond iteration?

Beyond `iterator`, RegExp hooks (`Symbol.match`, etc.), `Symbol.toStringTag`, and `Symbol.toPrimitive` integrate custom objects with builtins consistently—prefer these over monkey-patching `Object.prototype`.

```javascript
const o = {
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? "s" : 42;
  },
};
```

---

## 56. How do promises interact with the microtask queue?

Promise reactions (`then/catch/finally`) schedule as microtasks—always async even if already settled. The executor runs synchronously, but handlers are deferred. This prevents reentrancy bugs and unifies ordering with other microtasks.

```javascript
const p = new Promise((r) => {
  console.log("exec");
  r(1);
});
p.then(() => console.log("micro"));
console.log("sync");
```

---

## 57. Compare `Promise.all`, `allSettled`, `race`, and `any`.

`all` fails fast on first rejection; `allSettled` waits for all outcomes; `race` settles with first settled promise; `any` fulfills with first fulfillment or `AggregateError` if all reject. Choose based on whether partial failure is acceptable.

```javascript
Promise.any([Promise.reject(1), Promise.resolve(2)]).then(console.log); // 2
```

---

## 58. How do `AbortController` and `AbortSignal` structure cancellation?

Pass `signal` to `fetch` and call `abort()` to cancel; listen for `abort` events for cleanup. Combine with `AbortSignal.timeout` or `AbortSignal.any` where supported. Handle `AbortError` distinctly from other failures.

```javascript
const c = new AbortController();
fetch("/x", { signal: c.signal }).catch(() => {});
c.abort();
```

---

## 59. How do async iterators differ from sync iterators for streaming data?

Async iterators await each step—useful for paginated HTTP, streams, and async generators. Backpressure must be designed explicitly; the language does not automatically throttle producers.

```javascript
async function* stream() {
  yield await Promise.resolve(1);
}
```

---

## 60. What patterns help with robust error handling in async code?

Group `await` in `try/catch`, use `Promise.allSettled` when partial results matter, and centralize logging. Avoid empty catches; narrow `fetch` failures with `response.ok`. In TypeScript, treat `catch` values as `unknown`.

```javascript
async function load() {
  try {
    const r = await fetch("/a");
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
}
```

---

## 61. What is `unhandledrejection`, and how should apps handle it?

Global `unhandledrejection` fires when a promise rejects with no handler—log to telemetry and fix root causes. Avoid relying on it for control flow; attach `catch` everywhere. Node may terminate depending on flags.

```javascript
window.addEventListener("unhandledrejection", (ev) => {
  console.warn(ev.reason);
});
```

---

## 62. What race conditions appear in async UI, and how do you fix them?

Stale responses when requests return out of order: abort superseded fetches, ignore outdated results with request tokens, or compare latest id before committing state. React cleanups often abort on dependency change.

```javascript
let token = 0;
async function load(id) {
  const t = ++token;
  const data = await fetchData(id);
  if (t !== token) return;
  render(data);
}
```

---

## 63. What is the difference between concurrency and parallelism in JavaScript?

Concurrency interleaves tasks on one thread via the event loop; parallelism requires Workers or similar for simultaneous CPU work. `Promise.all` overlaps waiting, not CPU parallelism, on the main thread.

```javascript
await Promise.all([fetch("/a"), fetch("/b")]);
```

---

## 64. What structured concurrency patterns exist in JS?

Use `AbortSignal` trees to cancel child work, `Promise.race` with cleanup, and explicit teardown on unmount. Avoid fire-and-forget promises in components without cancellation.

```javascript
async function parent(signal) {
  await work({ signal });
}
```

---

## 65. What does `Promise.withResolvers` provide (ES2024)?

It returns `{ promise, resolve, reject }`—cleaner than `new Promise` wrapper for bridging callbacks to promises. Polyfill is trivial; availability depends on runtime version.

```javascript
const { promise, resolve } = Promise.withResolvers();
queueMicrotask(() => resolve(1));
await promise;
```

---

## 66. How do ES modules differ from CommonJS in loading and semantics?

ESM is static, live bindings, strict mode, and supports `import.meta` and tree shaking. CommonJS `require` is dynamic, copies primitives for exports, and uses `module.exports`. Interop in bundlers and Node adds complexity—know default vs namespace interop.

```javascript
export let x = 1;
export function inc() {
  x++;
}
```

---

## 67. What does dynamic `import()` enable for applications?

Code-splitting and lazy routes: returns a promise for the module namespace. Bundlers create separate chunks. Handle errors for missing modules; avoid unbounded dynamic specifiers if your build tool cannot analyze them.

```javascript
async function load() {
  const mod = await import("./feature.js");
  return mod.setup();
}
```

---

## 68. What is `import.meta` used for?

It exposes module metadata—`import.meta.url` for module-relative asset resolution in browsers and Node ESM. Bundlers may inject additional fields. Not available in classic scripts.

```javascript
const url = new URL("./asset.png", import.meta.url).href;
```

---

## 69. Explain tree shaking and what blocks it.

Tree shaking removes unused exports when bundlers can prove side-effect-free modules. Side-effect imports (`import "polyfill"`), star re-exports with side effects, and dynamic property access on namespaces can inhibit shaking. Annotations like `/*#__PURE__*/` help mark pure calls.

```javascript
export const used = () => 1;
export const unused = () => 2;
```

---

## 70. What goes wrong with circular dependencies in ES modules?

Bindings may be in TDZ during partial initialization—accessing exports before initialization throws. Refactor shared code to a third module or defer reads behind functions. Avoid relying on evaluation order hacks.

```javascript
// a.js imports b.js imports a.js — careful with top-level reads
```

---

## 71. How is the singleton pattern expressed in modern JS?

Module top-level state is singleton per module graph in ESM—`export const store = createStore()`. Avoid global `window` singletons unless necessary. Test isolation may reset modules with loader hooks or dependency injection.

```javascript
let instance;
export function getInstance() {
  return (instance ??= create());
}
function create() {
  return { n: 0 };
}
```

---

## 72. How does the observer pattern map to browser APIs?

`EventTarget`’s `addEventListener` is the classic observer: subject notifies many listeners. Custom `EventEmitter` in Node is similar. Unsubscribe to prevent leaks.

```javascript
const t = new EventTarget();
t.addEventListener("x", (e) => console.log(e.detail));
t.dispatchEvent(new CustomEvent("x", { detail: 1 }));
```

---

## 73. How does pub/sub differ from direct observer wiring?

Pub/sub decouples publishers and subscribers via channels—many-to-many without direct references. Implement with a `Map` of topic to listener sets; always provide `off` to avoid leaks.

```javascript
function bus() {
  const m = new Map();
  return {
    on(t, fn) {
      (m.get(t) ?? m.set(t, new Set()).get(t)).add(fn);
    },
    emit(t, p) {
      m.get(t)?.forEach((fn) => fn(p));
    },
  };
}
```

---

## 74. What is the factory pattern’s role in JavaScript?

Factories encapsulate object creation—returning configured instances or choosing subclasses based on input. Functions as first-class values make factories idiomatic without heavy class hierarchies.

```javascript
function createTransport(kind) {
  if (kind === "http") return { send() {} };
  if (kind === "ws") return { send() {} };
  throw new Error("unknown");
}
```

---

## 75. How does the strategy pattern appear with first-class functions?

Pass a comparator to `sort`, a serializer function, or a policy object—strategies are pluggable without subclass explosion.

```javascript
const strategies = { fast: (x) => x * 2, safe: (x) => x + 1 };
function run(mode, v) {
  return strategies[mode](v);
}
```

---

## 76. What capabilities do `Proxy` and `Reflect` provide?

`Proxy` traps operations like `get`, `set`, `apply`; `Reflect` mirrors internal methods for correct forwarding inside traps. Performance cost exists—avoid hot-path proxies without profiling. Private fields are not simple properties—proxies cannot emulate `#` fields.

```javascript
const p = new Proxy(
  {},
  {
    get(t, k, r) {
      return Reflect.get(t, k, r);
    },
  }
);
```

---

## 77. Describe property descriptors and `Object.defineProperty` nuances.

Data descriptors use `value`/`writable`; accessors use `get`/`set`—do not mix. `configurable`/`enumerable` control redefinition and `Object.keys` visibility. Non-configurable properties constrain proxy traps.

```javascript
const o = {};
Object.defineProperty(o, "x", { value: 1, writable: false });
```

---

## 78. How do getters and setters interact with assignment and invariants?

Accessors compute on read/write; setters validate invariants. Combined with private fields, they guard internal state. Prototype chain getters can shadow unless own properties exist—watch for unexpected polymorphism.

```javascript
class Rect {
  #w = 0;
  #h = 0;
  get area() {
    return this.#w * this.#h;
  }
}
```

---

## 79. When choose `Map`/`Set` versus `WeakMap`/`WeakSet`?

`Map`/`Set` allow any value types (with `Map` keys), iteration, and size. `WeakMap`/`WeakSet` hold keys weakly—ideal for metadata keyed by objects without retaining them—cannot enumerate keys.

```javascript
const wm = new WeakMap();
wm.set(obj, { tag: 1 });
```

---

## 80. What are `SharedArrayBuffer` and `Atomics`, and what are browser constraints?

Shared memory for workers requires cross-origin isolation in browsers for security reasons. `Atomics` coordinates access—misuse causes data races. Prefer message passing unless profiling proves otherwise.

```javascript
const sab = new SharedArrayBuffer(4);
const i32 = new Int32Array(sab);
Atomics.store(i32, 0, 1);
```

---

## 81. What are transferable objects, and why do they matter for workers?

Transfer moves ownership of buffers to another thread via `postMessage`’s transfer list—no copy, sender becomes detached. Critical for large binary performance.

```javascript
const buf = new ArrayBuffer(16);
worker.postMessage(buf, [buf]);
```

---

## 82. How does `structuredClone` support advanced copying scenarios?

It clones cycles, `Map`/`Set`, dates, and handles transfer lists—unlike JSON. Functions and DOM nodes are generally not cloneable. Use for worker messages and immutable snapshots.

```javascript
const a = { b: {} };
a.self = a;
const c = structuredClone(a);
```

---

## 83. What edge cases arise when combining `Proxy` with private class fields?

Private fields are not ordinary properties—internal slots bypass many traps—so proxies wrapping instances with `#` fields can surprise. Reactive systems document these limitations.

```javascript
// Private fields live in internal slots — proxies won't intercept `#x` access
```

---

## 84. How do `Object.groupBy` and `Map.groupBy` help (ES2024)?

`Object.groupBy` buckets by string/symbol keys; `Map.groupBy` allows arbitrary keys. Cleaner than manual `reduce` for grouping.

```javascript
const items = [
  { type: "a", v: 1 },
  { type: "b", v: 2 },
];
const g = Object.groupBy(items, (x) => x.type);
```

---

## 85. What role does `Reflect.ownKeys` play with proxies and symbols?

`Reflect.ownKeys` returns string and symbol keys including non-enumerable—useful in proxies implementing `ownKeys` traps matching invariants for non-configurable properties.

```javascript
Reflect.ownKeys({ [Symbol("x")]: 1, a: 2 });
```

---

## 86. How do optional chaining (`?.`) and nullish coalescing (`??`) reduce bugs?

`?.` short-circuits on `null`/`undefined`; `??` defaults only for `null`/`undefined`, unlike `||` which treats `0`/`""` as missing. Combine thoughtfully for configuration parsing.

```javascript
const port = env.PORT ?? 3000;
const name = user?.profile?.name;
```

---

## 87. What are `globalThis`, `BigInt`, and their portability notes?

`globalThis` resolves the global object across environments. `BigInt` supports arbitrary integers—do not mix with `Number` without explicit conversion; JSON.stringify throws on BigInt unless handled.

```javascript
const x = 10n;
```

---

## 88. Explain logical assignment (`||=`, `&&=`, `??=`) and short-circuit behavior.

`??=` assigns only if `null`/`undefined`; `||=`/`&&=` use truthiness—watch for valid `0`/`""` being overwritten by `||=`. These evaluate the left-hand side once—important for getters with side effects.

```javascript
let o = { retries: 0 };
o.retries ||= 3; // sets because 0 is falsy — often a bug; prefer ??=
```

---

## 89. What do `Array.prototype.at`, `findLast`, and `findLastIndex` add?

`at` supports negative indices; `findLast*` searches from the end—useful for time-ordered data. Prefer over manual `length` arithmetic.

```javascript
const xs = [1, 2, 3];
console.log(xs.at(-1)); // 3
```

---

## 90. Describe non-mutating array methods `toSorted`, `toReversed`, `toSpliced`, and `with`.

They return new arrays, leaving originals untouched—better for immutable updates. Copying has cost—profile large arrays.

```javascript
const a = [3, 1, 2];
const b = a.toSorted((x, y) => x - y);
```

---

## 91. What Set operations exist in modern JavaScript (ES2024)?

`union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf`, `isDisjointFrom` express set math clearly. Feature-detect before use.

```javascript
const a = new Set([1, 2]);
const b = new Set([2, 3]);
console.log(a.union(b));
```

---

## 92. Why prefer `Object.hasOwn` over `hasOwnProperty` calls?

`Object.hasOwn(obj, key)` avoids null-prototype objects and shadowing of `hasOwnProperty`. Clearer and safer in new code.

```javascript
const o = Object.create(null);
o.x = 1;
Object.hasOwn(o, "x");
```

---

## 93. How do Web Workers improve performance, and what are their limits?

Workers run JS off the main thread—no DOM access. Use for CPU-heavy tasks; transfer buffers to reduce copy costs. Startup overhead exists—pool workers thoughtfully.

```javascript
const w = new Worker("worker.js", { type: "module" });
w.postMessage({ n: 42 });
```

---

## 94. How do `requestAnimationFrame`, debouncing, and throttling improve perceived performance?

rAF aligns visual work with frames; debounce/throttle reduce handler frequency. Measure before optimizing—avoid rAF for non-visual work.

```javascript
const onResize = debounce(() => layout(), 100);
window.addEventListener("resize", onResize);
```

---

## 95. What does lazy loading mean for modules and media?

Dynamic `import()` defers JS execution; `loading="lazy"` defers images/iframes. Trade initial latency for smaller bundles—prefetch when predictable.

```html
<img src="hero.jpg" loading="lazy" alt="" />
```

---

## 96. What is code splitting in bundlers?

Splitting separates chunks loaded on demand—smaller initial bundles. Avoid waterfall by prefetching or merging strategically. Framework routers often auto-split routes.

```javascript
if (user.isAdmin) await import("./admin.js");
```

---

## 97. How do you profile memory for leaks?

Heap snapshots, comparison snapshots, and retaining path analysis in DevTools; watch detached DOM trees. Fix by removing references and using weak collections.

```javascript
// Detached DOM retained by closure → see retaining path in DevTools
```

---

## 98. What makes a good JavaScript unit test?

Fast, deterministic, isolated—mock external I/O and time. Test observable behavior; avoid brittle implementation details. Use factories for data.

```javascript
import { expect, test } from "vitest";
test("adds numbers", () => {
  expect(sum(1, 2)).toBe(3);
});
```

---

## 99. What is mocking, and how do you avoid over-mocking?

Mocks replace dependencies with controlled fakes—useful for network and clocks. Over-mocking causes tests that pass while integration fails—mock at boundaries, keep core logic real.

```javascript
const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => ({}) }));
globalThis.fetch = fetchMock;
```

---

## 100. What debugging techniques go beyond `console.log`?

Breakpoints (conditional), logpoints, async stack traces, `debugger` statements, Performance profiling, Network inspection, and source maps for transpiled code. Reproduce minimally, then bisect.

```javascript
function debugMe(x) {
  debugger;
  return complex(x);
}
```

---
