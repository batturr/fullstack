# JavaScript Functional Programming

Functional programming (FP) treats computation as the evaluation of mathematical functions and avoids changing state and mutable data. In JavaScript, FP is not enforced by the language—you combine discipline (immutability, pure functions) with patterns (composition, functors) and sometimes libraries. This guide connects core FP ideas to idiomatic JavaScript with runnable examples you can paste into a module or the browser console.

---

## 📑 Table of Contents

1. [FP Concepts](#1-fp-concepts)
2. [Array Methods for FP](#2-array-methods-for-fp)
3. [Function Composition](#3-function-composition)
4. [Currying and Partial Application](#4-currying-and-partial-application)
5. [Recursion in FP](#5-recursion-in-fp)
6. [Functors and Monads](#6-functors-and-monads)
7. [FP Libraries](#7-fp-libraries)
8. [Best Practices](#best-practices)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. FP Concepts

### 1.1 Pure functions

A **pure function** always returns the same output for the same inputs and has no observable side effects. That makes reasoning, testing, and parallelization easier.

```javascript
// Pure: depends only on arguments, no I/O or mutation
function add(a, b) {
  return a + b;
}

// Impure: reads external state
let taxRate = 0.08;
function priceWithTax(price) {
  return price * (1 + taxRate);
}

// Make it pure by passing everything in
function priceWithTaxPure(price, rate) {
  return price * (1 + rate);
}
```

### 1.2 Immutability

**Immutability** means not changing data in place; you produce new values instead. JavaScript objects and arrays are mutable by default, so immutability is a convention (or enforced with libraries / `Object.freeze` for shallow freezing).

```javascript
const user = { name: "Ada", score: 10 };

// Mutation (avoid when aiming for FP style)
// user.score = 11;

// Immutable update: shallow copy + override
const user2 = { ...user, score: 11 };

const nums = [1, 2, 3];
const nums2 = [...nums, 4]; // new array
const nums3 = nums.map((n) => n * 2); // new array
```

### 1.3 First-class functions

Functions are **first-class**: they can be stored in variables, passed as arguments, and returned from other functions.

```javascript
const greet = (name) => `Hello, ${name}`;

function runWith(name, fn) {
  return fn(name);
}

runWith("World", greet); // "Hello, World"

function makeMultiplier(factor) {
  return (n) => n * factor;
}

const triple = makeMultiplier(3);
triple(4); // 12
```

### 1.4 Higher-order functions

A **higher-order function** (HOF) takes one or more functions as arguments and/or returns a function. `map`, `filter`, and `reduce` are built-in HOFs.

```javascript
function repeat(n, fn) {
  const out = [];
  for (let i = 0; i < n; i += 1) out.push(fn(i));
  return out;
}

repeat(3, (i) => i * i); // [0, 1, 4]
```

### 1.5 Referential transparency

An expression is **referentially transparent** if you can replace it with its value without changing the program’s behavior. Pure functions enable this.

```javascript
const x = add(2, 3); // always 5
// Anywhere you see add(2, 3), you could substitute 5 if add is pure
```

### 1.6 Side effects

**Side effects** are anything that interacts with the world outside the function’s return value: I/O, logging, mutating globals, DOM updates, network calls, throwing unexpectedly, etc. FP often **pushes effects to the edges** and keeps the core pure.

```javascript
// Side effect: console
function logSum(a, b) {
  console.log(a + b);
  return a + b;
}

// Typical pattern: pure core + thin impure shell
function formatTotal(items) {
  return items.reduce((acc, item) => acc + item.price, 0);
}

function showCartTotal(items) {
  const total = formatTotal(items); // pure
  document.getElementById("total").textContent = String(total); // effect at edge
}
```

---

## 2. Array Methods for FP

### 2.1 `map()` for transformation

`map` applies a function to each element and returns a **new array** of the same length.

```javascript
const ids = [1, 2, 3];
const doubled = ids.map((n) => n * 2);

const users = [{ name: "ada" }, { name: "linus" }];
const capitalized = users.map((u) => ({
  ...u,
  name: u.name.charAt(0).toUpperCase() + u.name.slice(1),
}));
```

### 2.2 `filter()` for selection

`filter` keeps elements where the predicate returns a truthy value. Result is a **new array** (possibly shorter).

```javascript
const nums = [1, 2, 3, 4, 5];
const evens = nums.filter((n) => n % 2 === 0);

const files = [
  { name: "a.ts", size: 10 },
  { name: "b.md", size: 200 },
];
const smallTs = files.filter((f) => f.name.endsWith(".ts") && f.size < 50);
```

### 2.3 `reduce()` for aggregation

`reduce` folds a collection into a single value (or any accumulator shape: object, map, another array).

```javascript
const nums = [1, 2, 3, 4];
const sum = nums.reduce((acc, n) => acc + n, 0);

const words = ["fp", "is", "fun"];
const sentence = words.reduce((acc, w, i) => (i === 0 ? w : `${acc} ${w}`), "");

const cart = [
  { sku: "A", qty: 2, price: 5 },
  { sku: "B", qty: 1, price: 9 },
];
const total = cart.reduce((acc, line) => acc + line.qty * line.price, 0);
```

Building a lookup object without mutation of the **same** accumulator reference across unsafe patterns—here each step returns a new object:

```javascript
const pairs = [
  ["a", 1],
  ["b", 2],
];
const obj = pairs.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
// { a: 1, b: 2 }
```

### 2.4 Method chaining

Chaining keeps pipelines readable: each step is a transformation on a new array.

```javascript
const data = [
  { id: 1, tags: ["js", "fp"], active: true },
  { id: 2, tags: ["js"], active: false },
  { id: 3, tags: ["fp", "ts"], active: true },
];

const tagSet = data
  .filter((row) => row.active)
  .flatMap((row) => row.tags)
  .filter((t, i, arr) => arr.indexOf(t) === i)
  .sort();

// ['fp', 'js', 'ts']
```

### 2.5 Avoiding mutations

Prefer returns from `map`/`filter`/`reduce` over `for` loops that `push` into an external array when you want a functional style. Also avoid mutating the accumulator in `reduce` if you aim for predictable data flow (especially with concurrency or time-travel debugging).

```javascript
// Less ideal: mutating external array
const out = [];
[1, 2, 3].forEach((n) => {
  out.push(n * 2);
});

// Preferred in FP style: map produces new array
const out2 = [1, 2, 3].map((n) => n * 2);
```

---

## 3. Function Composition

### 3.1 Compose (right-to-left)

**Compose** applies functions from right to left: `(f ∘ g)(x) === f(g(x))`.

```javascript
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((acc, fn) => fn(acc), x);

const add1 = (n) => n + 1;
const double = (n) => n * 2;
const square = (n) => n * n;

const f = compose(square, double, add1);
f(2); // square(double(add1(2))) -> square(double(3)) -> square(6) -> 36
```

### 3.2 Pipe (left-to-right)

**Pipe** is often more readable in JavaScript because it matches reading order.

```javascript
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);

const g = pipe(add1, double, square);
g(2); // 36 (same as compose but reversed order of fns)
```

### 3.3 Point-free style

**Point-free** style defines functions without explicitly mentioning the argument when it is just passed through.

```javascript
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Not point-free
const names1 = (users) => users.map((u) => capitalize(u.name));

// Point-free (fn reference passed directly)
const names2 = (users) => users.map((u) => capitalize(u.name)); // still needs u for property access

// Better point-free example with a pre-made unary fn
const toUpper = (s) => s.toUpperCase();
const shout = pipe(toUpper, (s) => `${s}!`);

const shouts = (xs) => xs.map(shout);
```

True point-free shines when unary functions line up:

```javascript
const getName = (u) => u.name;
const trim = (s) => s.trim();

const cleanName = pipe(getName, trim, capitalize);
cleanName({ name: "  ada  " }); // "Ada"
```

### 3.4 Function combinators

Small reusable **combinators** build larger behavior.

```javascript
// Identity
const I = (x) => x;

// Constant (ignore second arg)
const K = (x) => () => x;

// Flip argument order for binary function
const flip =
  (fn) =>
  (a, b) =>
    fn(b, a);

const div = (a, b) => a / b;
flip(div)(2, 10); // 10 / 2 -> 5

// Unary guard: only call fn if predicate holds
const when =
  (pred, fn) =>
  (x) =>
    pred(x) ? fn(x) : x;

const incIfPos = when((n) => n > 0, (n) => n + 1);
incIfPos(3); // 4
incIfPos(-1); // -1
```

---

## 4. Currying and Partial Application

### 4.1 Currying explained

**Currying** transforms a function that takes multiple arguments into a sequence of functions each taking a single argument (or, in practice, one argument at a time).

```javascript
// Uncurried
function add3(a, b, c) {
  return a + b + c;
}

// Curried manually
function add3c(a) {
  return (b) => (c) => a + b + c;
}

add3c(1)(2)(3); // 6
```

### 4.2 Manual currying (binary and n-ary)

```javascript
function curry2(fn) {
  return function curried(a, b) {
    if (arguments.length >= 2) return fn(a, b);
    return (b2) => fn(a, b2);
  };
}

const modulo = (a, b) => a % b;
const curriedMod = curry2(modulo);
curriedMod(10, 3); // 1
curriedMod(10)(3); // 1

const isDivisibleBy = (n) => (x) => x % n === 0;
[1, 2, 3, 4, 5, 6].filter(isDivisibleBy(3)); // [3, 6]
```

### 4.3 Auto-currying

A generic **auto-curry** helper (arity-based) is common in FP libraries; a minimal version:

```javascript
function curry(fn) {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn.apply(this, args);
    return (...more) => curried.apply(this, args.concat(more));
  };
}

const sum3 = (a, b, c) => a + b + c;
const csum3 = curry(sum3);
csum3(1)(2)(3); // 6
csum3(1, 2)(3); // 6
```

Note: `fn.length` ignores rest parameters and can be wrong for some patterns—libraries handle edge cases.

### 4.4 Partial application

**Partial application** fixes some arguments now and returns a function for the rest. Unlike currying, you may supply multiple arguments at once.

```javascript
function partial(fn, ...fixed) {
  return (...rest) => fn(...fixed, ...rest);
}

const fetchWithBase = partial(fetch, "https://api.example.com");
// fetchWithBase("/users") -> GET https://api.example.com/users
```

With `bind`:

```javascript
const multiply = (a, b, c) => a * b * c;
const doubleFirst = multiply.bind(null, 2);
doubleFirst(3, 4); // 2 * 3 * 4 = 24
```

### 4.5 Practical use cases

```javascript
// Configuring serializers
const field = (key) => (obj) => obj[key];
const pluckName = field("name");
[{ name: "a" }, { name: "b" }].map(pluckName);

// Event handlers with stable arity
const logWithPrefix = (prefix) => (event) => {
  console.log(prefix, event.type);
};
// element.addEventListener("click", logWithPrefix("[ui]"));

// API middleware style (simplified)
const withHeader = (headers) => (url, opts = {}) =>
  fetch(url, { ...opts, headers: { ...opts.headers, ...headers } });

const authFetch = withHeader({ Authorization: "Bearer TOKEN" });
```

---

## 5. Recursion in FP

### 5.1 Recursive array processing

Recursion replaces loops; base case + recursive case.

```javascript
function sum(arr) {
  if (arr.length === 0) return 0;
  const [head, ...tail] = arr;
  return head + sum(tail);
}

sum([1, 2, 3]); // 6

function mapRecursive(arr, fn) {
  if (arr.length === 0) return [];
  const [head, ...tail] = arr;
  return [fn(head), ...mapRecursive(tail, fn)];
}

mapRecursive([1, 2, 3], (n) => n * 2); // [2, 4, 6]
```

For deep trees:

```javascript
function flattenDeep(value) {
  if (!Array.isArray(value)) return [value];
  return value.flatMap(flattenDeep);
}

flattenDeep([1, [2, [3, 4]], 5]); // [1, 2, 3, 4, 5]
```

### 5.2 Tail call optimization (TCO)

A **tail call** happens when a function returns the result of another function call with nothing left to do. ES6 specified **proper tail calls** in strict mode, but **most JavaScript engines do not implement TCO**, so deep recursion can overflow the stack.

```javascript
"use strict";

// Not tail-recursive (must multiply after factorial returns)
function factorialBad(n) {
  if (n <= 1) return 1;
  return n * factorialBad(n - 1);
}

// Tail-recursive form with accumulator (would need engine TCO to be safe at depth)
function factorialTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc);
}
```

Practical approach in JS: use a loop, `reduce`, or trampolining for deep cases.

### 5.3 Trampolining

A **trampoline** turns recursive calls into a loop of thunks, avoiding stack growth.

```javascript
function trampoline(fn) {
  return (...args) => {
    let result = fn(...args);
    while (typeof result === "function") result = result();
    return result;
  };
}

const sumRange = trampoline(function sumRange(n, acc = 0) {
  if (n <= 0) return acc;
  return () => sumRange(n - 1, acc + n);
});

sumRange(100000); // 5000050000 (example; may be slow but avoids deep stack from naive recursion)
```

Another pattern: **continuation-passing style** with the trampoline.

---

## 6. Functors and Monads

These terms come from category theory; in JavaScript they appear as **design patterns** with laws you can test.

### 6.1 Functor basics

A **functor** is a type with `map` that obeys identity and composition laws. Arrays are functors.

```javascript
// Identity: map(x => x) ~ same structure
const xs = [1, 2, 3];
const id = (x) => x;
JSON.stringify(xs.map(id)) === JSON.stringify(xs); // true

// Composition: map(f).map(g) ~ map(x => g(f(x)))
const f = (n) => n + 1;
const g = (n) => n * 2;
JSON.stringify(xs.map(f).map(g)) === JSON.stringify(xs.map((x) => g(f(x)))); // true
```

A trivial **Box** functor:

```javascript
const Box = (x) => ({
  map: (fn) => Box(fn(x)),
  fold: (fn) => fn(x),
});

Box(2)
  .map((n) => n + 1)
  .map((n) => n * 3)
  .fold((n) => n); // 9
```

### 6.2 Maybe monad

**Maybe** represents optional values without `null` checks everywhere: `Nothing` or `Just(value)`.

```javascript
const Nothing = () => ({
  isNothing: true,
  map: () => Nothing(),
  chain: () => Nothing(),
  getOrElse: (d) => d,
});

const Just = (x) => ({
  isNothing: false,
  map: (fn) => {
    try {
      const y = fn(x);
      return y == null ? Nothing() : Just(y);
    } catch {
      return Nothing();
    }
  },
  chain: (fn) => fn(x),
  getOrElse: () => x,
});

const safeProp = (key) => (obj) =>
  obj != null && Object.prototype.hasOwnProperty.call(obj, key)
    ? Just(obj[key])
    : Nothing();

const readStreet = (user) =>
  safeProp("address")(user)
    .chain(safeProp("street"))
    .map((s) => s.trim());

readStreet({ address: { street: "  FP Lane  " } }).getOrElse("unknown"); // "FP Lane"
readStreet(null).getOrElse("unknown"); // "unknown"
```

### 6.3 Either monad

**Either** models success (`Right`) or failure (`Left`), often used instead of throwing.

```javascript
const Left = (e) => ({
  isLeft: true,
  map: () => Left(e),
  chain: () => Left(e),
  fold: (onLeft) => onLeft(e),
});

const Right = (x) => ({
  isLeft: false,
  map: (fn) => {
    try {
      return Right(fn(x));
    } catch (err) {
      return Left(err.message);
    }
  },
  chain: (fn) => fn(x),
  fold: (_, onRight) => onRight(x),
});

function parseJson(input) {
  try {
    return Right(JSON.parse(input));
  } catch (e) {
    return Left("Invalid JSON");
  }
}

parseJson('{"a":1}')
  .map((o) => o.a)
  .fold(
    (err) => `Error: ${err}`,
    (n) => `a = ${n}`
  ); // "a = 1"
```

### 6.4 Promise as monad

Promises are **thenable** structures: `then` acts like `map`/`chain` for async workflows (with automatic flattening).

```javascript
const p = Promise.resolve(2)
  .then((n) => n + 1) // map-like
  .then((n) => Promise.resolve(n * 3)); // chain-like flattening

p.then(console.log); // 9

// Async/await is syntactic sugar over monadic chaining
async function run() {
  const n = await Promise.resolve(2);
  const m = await Promise.resolve(n + 1);
  return m * 3;
}
```

---

## 7. FP Libraries

### 7.1 Lodash/fp

`lodash/fp` provides **curried**, **data-last** functions and avoids mutable defaults.

```javascript
// Conceptual usage (install: lodash)
// import fp from 'lodash/fp';
// const xs = [1, 2, 3];
// fp.map(fp.add(1), xs); // [2, 3, 4]
// const pickNames = fp.map(fp.pick(['name']));
```

Typical traits: iteratee-first, data-last, curried, immutable by convention.

### 7.2 Ramda

**Ramda** is designed for FP: curried, data-last, rich function set.

```javascript
// Conceptual usage (install: ramda)
// import * as R from 'ramda';
// const f = R.pipe(R.prop('x'), R.add(1));
// f({ x: 2 }); // 3
// R.evolve({ a: R.inc, b: R.negate }, { a: 1, b: 2 }); // { a: 2, b: -2 }
```

### 7.3 Immutable.js

**Immutable.js** provides persistent immutable collections with efficient structural sharing.

```javascript
// Conceptual usage (install: immutable)
// import { Map, List } from 'immutable';
// const m0 = Map({ count: 0 });
// const m1 = m0.set('count', 1);
// m0.get('count'); // 0
// m1.get('count'); // 1
```

Use when you need large nested state trees and performance-friendly immutability.

### 7.4 Folktale

**Folktale** provides `Result`, `Maybe`, `Task`, and utilities for typed functional errors and composition.

```javascript
// Conceptual usage (install: folktale)
// import Result from 'folktale/result';
// Result.Ok(1).map(x => x + 1); // Ok(2)
// Result.Error('nope').map(x => x + 1); // Error('nope') — unchanged
```

---

## Best Practices

- Prefer **small pure functions** and combine them with `pipe`/`compose` for readability.
- **Immutability by default**: spread, `map`, `slice`, or library structures; document when you intentionally mutate for performance.
- Use **`map` for same-length transforms**, **`filter` for subsets**, **`reduce` when the shape changes**—do not force everything through `reduce` when `map`/`filter` is clearer.
- **Name intermediate concepts** (`isActive`, `toDTO`) instead of anonymous lambdas when it improves scanability.
- **Isolate side effects** (I/O, DOM, `Date.now`, `Math.random`) in outer layers; pass results into pure cores.
- Learn **arity and currying** so library APIs (`lodash/fp`, Ramda) feel natural.
- For deep recursion in production JS, assume **no TCO**—use loops, trampolines, or iterative algorithms.
- When modeling errors, prefer **`Result`/`Either`** or typed returns over thrown exceptions in domain logic.
- **Test functor/monad laws** if you implement custom types shared across the codebase.

---

## Common Mistakes to Avoid

- Using **`forEach` to “transform”** data—`map` returns a new array; `forEach` returns `undefined` and encourages mutation.
- **Mutating** inside `map`/`filter` (e.g., pushing to an outer array) — undermines predictability and parallel safety.
- **Empty `reduce` without initial value** on empty arrays throws; always pass a sensible initial accumulator when the array can be empty.
- **Confusing `map` and `filter` arity**: `map(fn)` is `(value, index, array)` — using index incorrectly can cause subtle bugs.
- **Over-point-free** code that hides important argument names—readability beats style points.
- **Giant `reduce` bodies** with multiple responsibilities; split into named steps or use small helpers.
- Assuming **tail recursion is optimized** in your engine; verify stack limits for real inputs.
- Treating **Promises like pure values**—they represent async effects; sequencing still has ordering and failure modes.
- **Reimplementing Ramda poorly** across the codebase—sometimes a small dependency is cheaper than 20 partial utilities without tests.

---

_These notes are a starting point. Pair them with small exercises: rewrite imperative loops as `map`/`filter`/`reduce`, implement `pipe` and `Maybe`, and refactor a module so pure logic is separately unit-tested from DOM fetches._
