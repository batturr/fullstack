# JavaScript MCQ - Set 5 (Expert Level)

**1. What is the output?**
```javascript
console.log('start');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
queueMicrotask(() => console.log('microtask'));
console.log('end');
```

a) `start, end, timeout, promise, microtask`
b) `start, end, promise, microtask, timeout`
c) `start, end, microtask, promise, timeout`
d) `start, timeout, promise, microtask, end`

**Answer: b) `start, end, promise, microtask, timeout`**

---

**2. In Node.js, what is the typical relative order after synchronous code finishes, when all are scheduled from the same turn?**
```javascript
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('tick'));
Promise.resolve().then(() => console.log('promise'));
```

a) `promise, tick, immediate`
b) `tick, promise, immediate`
c) `tick, immediate, promise`
d) `promise, immediate, tick`

**Answer: b) `tick, promise, immediate`**

---

**3. What is the output?**
```javascript
Promise.resolve().then(() => {
  console.log('A');
  queueMicrotask(() => console.log('C'));
});
queueMicrotask(() => console.log('B'));
```

a) `A, B, C`
b) `A, C, B`
c) `B, A, C`
d) `B, C, A`

**Answer: a) `A, B, C`**

---

**4. A closure captures a large object only referenced by a variable used in an inner function. If the outer function returns and nothing else references the outer variable, when can the large object be collected?**

a) Immediately after the outer function returns, before the inner function runs
b) Only after the inner function is garbage-collected and no other references exist
c) Never, because closures always pin all variables from the activation record
d) After the first invocation of the inner function completes

**Answer: b) Only after the inner function is garbage-collected and no other references exist**

---

**5. What is the output?**
```javascript
const target = { a: 1 };
const p = new Proxy(target, {
  get(obj, prop) {
    if (prop === 'a') return 42;
    return Reflect.get(obj, prop);
  }
});
console.log(p.a, target.a);
```

a) `42 42`
b) `42 1`
c) `1 1`
d) `1 42`

**Answer: b) `42 1`**

---

**6. Which `Reflect` method is the correct meta-level equivalent of `Function.prototype.apply` for calling a function with a given `this` and an array (or array-like) of arguments?**

a) `Reflect.construct`
b) `Reflect.apply`
c) `Reflect.defineProperty`
d) `Reflect.getPrototypeOf`

**Answer: b) `Reflect.apply`**

---

**7. What is the output?**
```javascript
function* inner() {
  yield 2;
  yield 3;
}
function* outer() {
  yield 1;
  yield* inner();
  yield 4;
}
console.log([...outer()].join(''));
```

a) `1234`
b) `1324`
c) `1243`
d) `2134`

**Answer: a) `1234`**

---

**8. For a generator object `g`, calling `g.return(value)` while the generator is paused after `yield` does what to the generator’s state?**

a) Resumes execution so `yield` evaluates to `value`, then continues until the next `yield`
b) Closes the generator: runs `finally` (if any), then completes with `{ value, done: true }`
c) Throws `value` into the generator at the current `yield` point
d) Has no effect unless the generator is still in the `"suspendedStart"` state

**Answer: b) Closes the generator: runs `finally` (if any), then completes with `{ value, done: true }`**

---

**9. What is the output?**
```javascript
const ref = { x: 1 };
let wr = new WeakRef(ref);
console.log(wr.deref() === ref);
ref.x = 2;
console.log(wr.deref()?.x);
```

a) `true` then `undefined`
b) `false` then `2`
c) `true` then `2`
d) `true` then `1`

**Answer: c) `true` then `2`**

---

**10. `FinalizationRegistry` callbacks are primarily intended for which kind of use case?**

a) Running synchronous cleanup exactly when `unregister` is called
b) Scheduling cleanup after an object has become unreachable and the GC has reclaimed it (best-effort)
c) Replacing `try/finally` for all resource management
d) Preventing an object from ever being garbage-collected

**Answer: b) Scheduling cleanup after an object has become unreachable and the GC has reclaimed it (best-effort)**

---

**11. In modern browsers, creating a `SharedArrayBuffer` typically requires which security context?**

a) Any HTTPS page regardless of headers
b) Cross-origin isolated context (e.g. `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` configured appropriately)
c) Only Web Workers, never the main thread
d) A user gesture such as a click event

**Answer: b) Cross-origin isolated context (e.g. `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` configured appropriately)**

---

**12. What is the main purpose of `Atomics.wait` on a `SharedArrayBuffer` view?**

a) To sort typed array elements atomically
b) To block a worker thread until another thread wakes it with `Atomics.notify`
c) To guarantee real-time scheduling of microtasks across threads
d) To encrypt shared memory regions

**Answer: b) To block a worker thread until another thread wakes it with `Atomics.notify`**

---

**13. What is the output?**
```javascript
const o = Object.create(null);
o.__proto__ = { a: 1 };
console.log(Object.getPrototypeOf(o) === Object.prototype);
console.log('a' in o, o.a);
```

a) `true true 1`
b) `false true 1`
c) `false false undefined`
d) `true false undefined`

**Answer: c) `false false undefined`**

---

**14. What happens in strict mode?**
```javascript
'use strict';
const o = {};
Object.defineProperty(o, 'x', { value: 1, writable: false, configurable: false });
o.x = 1;
```

a) Assignment silently fails and `o.x` stays `1`
b) A `TypeError` is thrown
c) `o.x` becomes `NaN`
d) The property is deleted and recreated

**Answer: b) A `TypeError` is thrown**

---

**15. What is the output?**
```javascript
const o = {
  [Symbol.toPrimitive](hint) {
    console.log(hint);
    return hint === 'string' ? 's' : 1;
  }
};
console.log(String(o));
console.log(o + 2);
```

a) `string` then `default` printed; then coerced results `s` and `3`
b) `default` then `number`; then `1` and `3`
c) `string` then `default`; printed order only `string`
d) No hints logged; prints `[object Object]` then `NaN`

**Answer: a) `string` then `default` printed; then coerced results `s` and `3`**

---

**16. What is the output?**
```javascript
class A {}
class B {
  static [Symbol.hasInstance](x) {
    return x === 1;
  }
}
console.log(1 instanceof B, new A() instanceof B);
```

a) `true true`
b) `true false`
c) `false true`
d) `false false`

**Answer: b) `true false`**

---

**17. What does `Symbol.species` on a constructor influence in built-in subclassing patterns?**

a) The `instanceof` operator for primitive wrappers
b) Which constructor `Promise.prototype.then` (and similar methods) use to create derived instances
c) The name shown in `Error.stack`
d) Whether an object is iterable

**Answer: b) Which constructor `Promise.prototype.then` (and similar methods) use to create derived instances**

---

**18. What is the output?**
```javascript
function tag(strings, a, b) {
  return strings.raw[0].length + ',' + a + b;
}
console.log(tag`x\n${1}${2}`);
```

a) `4,12`
b) `3,12`
c) `2,12`
d) `1,12`

**Answer: b) `3,12`**

---

**19. What is the value of `z` after this runs?**
```javascript
const [a, , [b, c = 10] = []] = [1, 2, [3]];
const z = a + b + c;
```

a) `14`
b) `13`
c) `NaN`
d) `4`

**Answer: a) `14`**

---

**20. What is the output?**
```javascript
const p = Promise.resolve(1);
p.then(() => {
  return { then(r) { r(2); } };
}).then(v => console.log(v));
```

a) `1`
b) `2`
c) `[object Object]`
d) The promise never settles

**Answer: b) `2`**

---

**21. What is the output?**
```javascript
async function f() {
  return Promise.resolve(3);
}
f().then(console.log);
```

a) `Promise { <pending> }`
b) `3`
c) `undefined`
d) A rejected promise

**Answer: b) `3`**

---

**22. What is the output?**
```javascript
const obj = {
  x: 1,
  m() {
    const f = () => this.x;
    return f();
  }
};
console.log(obj.m());
const g = obj.m;
console.log(g());
```

a) `1` then `1`
b) `1` then `undefined`
c) `undefined` then `1`
d) `undefined` then `undefined`

**Answer: b) `1` then `undefined`**

---

**23. Regarding proper tail calls in the ECMAScript specification versus common JavaScript engines in browsers, which statement is most accurate?**

a) All major browsers fully implement PTC for all strict-mode tail calls as required by the spec
b) The spec defines PTC, but most mainstream browser engines do not provide general PTC optimization users can rely on
c) PTC applies only to generator functions
d) Tail calls are optimized only for `async` functions

**Answer: b) The spec defines PTC, but most mainstream browser engines do not provide general PTC optimization users can rely on**

---

**24. From a GC perspective, storing a key in a `WeakMap` means:**

a) The key cannot be collected while the `WeakMap` exists
b) The key can be collected when only the `WeakMap` references it (weak reference from map to key)
c) The value is always strongly pinned even if the key is collected
d) Entries survive until `WeakMap.prototype.clear` is called

**Answer: b) The key can be collected when only the `WeakMap` references it (weak reference from map to key)**

---

**25. Why does this regular expression fail at parse time?**
```javascript
const re = /(?<n>.)(?<n>.)/;
```

a) Lookbehind assertions cannot use named groups
b) Duplicate capture group names are a `SyntaxError` in a single pattern
c) The `.` metacharacter is invalid inside `(?< … >)`
d) Named groups require the `u` (`unicode`) flag

**Answer: b) Duplicate capture group names are a `SyntaxError` in a single pattern**

---

**26. What does this regex match?**
```javascript
const re = /(?<=@)\w+/g;
re.exec('user@name');
```

a) `null`
b) `['name', index: 5, input: 'user@name']` (conceptually: full match `"name"`)
c) `['@name']`
d) `['user']`

**Answer: b) `['name', index: 5, input: 'user@name']` (conceptually: full match `"name"`)**

---

**27. What is the output?**
```javascript
const sum = a => b => c => a + b + c;
console.log(sum(1)(2)(3));
```

a) `6`
b) `"123"`
c) A function
d) `NaN`

**Answer: a) `6`**

---

**28. Partial application fixes some arguments early. How does it differ from currying in the usual sense?**

a) They are identical terms
b) Currying transforms f(a,b,c) into unary nested functions; partial application can fix any subset of arguments in one step without requiring unary chaining
c) Partial application only works with `async` functions
d) Currying requires `Function.prototype.bind`; partial application forbids it

**Answer: b) Currying transforms f(a,b,c) into unary nested functions; partial application can fix any subset of arguments in one step without requiring unary chaining**

---

**29. A naive memoization cache using a plain object with user-controlled string keys risks which issue?**

a) Prototype pollution via keys like `__proto__`
b) Automatic weak references to arguments
c) Guaranteed stack overflow on recursion
d) Disabling the microtask queue

**Answer: a) Prototype pollution via keys like `__proto__`**

---

**30. In a canonical trailing-edge debounce implementation, if events fire continuously before the wait elapses, the debounced function:**

a) Runs once per event
b) Runs only after events stop for the full wait period
c) Runs on the leading edge of the first event only
d) Is invoked synchronously inside each event handler

**Answer: b) Runs only after events stop for the full wait period**

---

**31. What is the output?**
```javascript
let i = 0;
function tick() {
  if (++i < 3) queueMicrotask(tick);
  console.log(i);
}
queueMicrotask(tick);
console.log(0);
```

a) `0 1 2 3`
b) `0 3 2 1`
c) `0 1 2 3` with `3` printed twice
d) `1 2 3 0`

**Answer: a) `0 1 2 3`**

---

**32. The Revealing Module Pattern primarily achieves what?**

a) Native ES module tree-shaking without bundlers
b) Encapsulation via a closure exposing only chosen public members
c) Automatic memory leak detection
d) Shared memory between workers

**Answer: b) Encapsulation via a closure exposing only chosen public members**

---

**33. What is the output?**
```javascript
const desc = Object.getOwnPropertyDescriptor([1, 2], 'length');
console.log(desc.writable, desc.enumerable, desc.configurable);
```

a) `true false false`
b) `false true true`
c) `false false false`
d) `true true false`

**Answer: a) `true false false`**

---

**34. What is the output?**
```javascript
const a = [1, 2];
Object.defineProperty(a, '0', { value: 1, writable: false, configurable: false });
(function () {
  'use strict';
  try {
    a[0] = 2;
    console.log('ok', a[0]);
  } catch (e) {
    console.log(e.name, a[0]);
  }
})();
```

a) `ok 2`
b) `TypeError 1`
c) `ok 1`
d) `ReferenceError 1`

**Answer: b) `TypeError 1`**

---

**35. What is the output?**
```javascript
class Counter {
  #n = 0;
  inc() { return ++this.#n; }
}
const c = new Counter();
console.log('n' in c, Object.keys(c).length);
```

a) `true 1`
b) `false 0`
c) `true 0`
d) `false 1`

**Answer: b) `false 0`**

---

**36. What is the output?**
```javascript
async function outer() {
  const inner = async () => {
    throw new Error('x');
  };
  try {
    return await inner();
  } catch (e) {
    return 'caught';
  }
}
outer().then(console.log);
```

a) Prints nothing; unhandled rejection
b) `caught`
c) `undefined`
d) A pending promise forever

**Answer: b) `caught`**

---

**37. What is the output?**
```javascript
Promise.resolve()
  .then(() => { throw new Error('e'); })
  .then(() => console.log('A'))
  .catch(() => console.log('B'))
  .then(() => console.log('C'));
```

a) `A` then `C`
b) `B` then `C`
c) `B` only
d) Uncaught exception stops all logging

**Answer: b) `B` then `C`**

---

**38. What is the output?**
```javascript
const o = {};
Object.defineProperty(o, 'x', {
  get() { return this._x; },
  set(v) { this._x = v * 2; },
  enumerable: true,
  configurable: true
});
o.x = 3;
console.log(o.x, o._x);
```

a) `6 6`
b) `6 3`
c) `3 6`
d) `undefined undefined`

**Answer: a) `6 6`**

---

**39. What is the output?**
```javascript
const iter = {
  i: 0,
  next() {
    return this.i < 2 ? { value: this.i++, done: false } : { value: undefined, done: true };
  },
  [Symbol.iterator]() { return this; }
};
const [a, b, c] = iter;
console.log(a, b, c);
```

a) `0 1 undefined`
b) `0 1 2`
c) Throws `TypeError`
d) `undefined undefined undefined`

**Answer: a) `0 1 undefined`**

---

**40. What is the output?**
```javascript
function* g() {
  try {
    yield 1;
  } finally {
    console.log('F');
  }
}
const it = g();
it.next();
it.return(9);
```

a) Nothing is printed
b) Prints `F`
c) Throws because `return` skips `finally`
d) Prints `F` twice

**Answer: b) Prints `F`**

---

**41. `Reflect.set(target, key, value, receiver)` when `target` has an accessor setter on `key` binds `this` in the setter to:**

a) Always `target`
b) Always `undefined` in strict mode
c) `receiver` if provided, otherwise `target`
d) The global object

**Answer: c) `receiver` if provided, otherwise `target`**

---

**42. What is the output?**
```javascript
const target = { a: 1 };
Object.preventExtensions(target);
const p = new Proxy(target, {
  set() { return true; }
});
p.b = 2;
console.log('b' in target, target.b);
```

a) `true 2`
b) `false undefined`
c) `true undefined`
d) `false 2`

**Answer: b) `false undefined`**

---

**43. What is the output?**
```javascript
const f = (function () {
  let secret = 0;
  return {
    get() { return secret; },
    set(v) { secret = v; }
  };
})();
f.set(1);
console.log(f.get());
```

a) `1`
b) `undefined`
c) `0`
d) Throws `ReferenceError`

**Answer: a) `1`**

---

**44. Dynamic `import()` returns:**

a) The module namespace object directly
b) A Promise that fulfills to the module namespace object
c) A synchronous `Module` record
d) A generator of exports

**Answer: b) A Promise that fulfills to the module namespace object**

---

**45. What is the output?**
```javascript
let x = 1;
function f() {
  console.log(x);
  let x = 2;
}
f();
```

a) `1`
b) `2`
c) `undefined`
d) Throws `ReferenceError`

**Answer: d) Throws `ReferenceError`**

---

**46. In a standard ES module, what does `import.meta` provide?**

a) A read-only object exposing module metadata (e.g. `import.meta.url`), distinct from `exports`
b) The same value as `module.exports` in CommonJS
c) A hook invoked once when the module is first `import`ed
d) The namespace object of all transitive dependencies

**Answer: a) A read-only object exposing module metadata (e.g. `import.meta.url`), distinct from `exports`**

---

**47. A throttle function that executes on the leading edge and uses a trailing timeout primarily ensures:**

a) The handler never runs more than once per window, and may run again immediately after the window if events continue
b) At most one invocation per wait period at the start, with a possible trailing invocation after activity stops
c) Identical behavior to debounce with zero wait
d) Microtasks run before the throttled callback

**Answer: b) At most one invocation per wait period at the start, with a possible trailing invocation after activity stops**

---

**48. What is the output?**
```javascript
const re = /(?<n>\d)\k<n>/;
console.log(re.test('11'), re.test('12'));
```

a) `true true`
b) `true false`
c) `false true`
d) `false false`

**Answer: b) `true false`**

---

**49. What is the output?**
```javascript
const obj = new String('hi');
obj[0] = 'x';
console.log(obj[0], Object.prototype.hasOwnProperty.call(obj, '0'));
```

a) `x true`
b) `h false`
c) `h true`
d) `x false`

**Answer: c) `h true`**

---

**50. What is the output?**
```javascript
setTimeout(() => console.log('T'), 0);
const p = new Promise((resolve) => {
  console.log('P');
  resolve();
  console.log('Q');
});
p.then(() => console.log('R'));
console.log('S');
```

a) `P Q S R T`
b) `P Q R S T`
c) `S P Q R T`
d) `P S Q R T`

**Answer: a) `P Q S R T`**

---
