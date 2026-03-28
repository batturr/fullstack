# JavaScript MCQ - Set 4 (Intermediate Level)

**1. What does the following code output?**
```javascript
async function foo() {
  return 42;
}
foo().then(val => console.log(val));
```

a) `42`
b) `Promise {42}`
c) `undefined`
d) `Error`

**Answer: a) `42`**

---

**2. What does `Promise.resolve(1).then(x => x + 1).then(x => console.log(x))` log?**
```javascript
Promise.resolve(1).then(x => x + 1).then(x => console.log(x));
```

a) `1`
b) `2`
c) `undefined`
d) `Promise {2}`

**Answer: b) `2`**

---

**3. What is the result of `Promise.all([])`?**
```javascript
Promise.all([]).then(v => console.log(v));
```

a) It rejects immediately
b) It resolves to `[]`
c) It resolves to `undefined`
d) It never settles

**Answer: b) It resolves to `[]`**

---

**4. What does `Promise.race([Promise.resolve(1), Promise.resolve(2)])` settle with?**
```javascript
Promise.race([Promise.resolve(1), Promise.resolve(2)]).then(v => console.log(v));
```

a) Always `1`
b) Always `2`
c) Either `1` or `2` (implementation-dependent order)
d) `[1, 2]`

**Answer: c) Either `1` or `2` (implementation-dependent order)**

---

**5. What does `Promise.allSettled` return for a mix of fulfilled and rejected promises?**
```javascript
Promise.allSettled([
  Promise.resolve('ok'),
  Promise.reject('no')
]).then(results => console.log(results.length));
```

a) `1`
b) `2`
c) It rejects and never logs
d) `undefined`

**Answer: b) `2`**

---

**6. What happens when `Promise.any` receives only rejected promises?**
```javascript
Promise.any([Promise.reject(1), Promise.reject(2)])
  .catch(e => console.log(e.name));
```

a) Logs `"TypeError"`
b) Logs `"AggregateError"`
c) The promise stays pending forever
d) Logs `"Error"`

**Answer: b) Logs `"AggregateError"`**

---

**7. What does this `async/await` snippet log?**
```javascript
async function run() {
  const x = await Promise.resolve(10);
  console.log(x);
}
run();
```

a) `undefined`
b) `10`
c) `Promise {<pending>}`
d) Throws because `await` is invalid here

**Answer: b) `10`**

---

**8. In an `async` function, what does a bare `return` statement return to the caller’s `.then()`?**
```javascript
async function f() {
  return;
}
f().then(v => console.log(v));
```

a) `undefined`
b) `null`
c) A rejected promise
d) Nothing is logged

**Answer: a) `undefined`**

---

**9. What does this code print?**
```javascript
async function outer() {
  return await Promise.resolve('x');
}
outer().then(console.log);
```

a) `Promise { 'x' }`
b) `x`
c) `undefined`
d) Throws

**Answer: b) `x`**

---

**10. What is logged if the awaited promise rejects inside `try`?**
```javascript
async function main() {
  try {
    await Promise.reject('fail');
    console.log('A');
  } catch (e) {
    console.log(e);
  }
}
main();
```

a) `A` then `fail`
b) Only `fail`
c) Only `A`
d) Uncaught rejection in console

**Answer: b) Only `fail`**

---

**11. Does `finally` run when `try` contains a `return` in an `async` function?**
```javascript
async function f() {
  try {
    return 1;
  } finally {
    console.log('done');
  }
}
f();
```

a) No, `finally` is skipped on `return`
b) Yes, `done` is logged
c) Only if you `await f()`
d) It throws because `return` in `try` is illegal

**Answer: b) Yes, `done` is logged**

---

**12. What does `JSON.parse('{"a":1}')` produce?**
```javascript
const o = JSON.parse('{"a":1}');
console.log(typeof o, o.a);
```

a) `"object" 1`
b) `"string" 1`
c) Throws — keys must be unquoted
d) `"object" undefined`

**Answer: a) `"object" 1`**

---

**13. What does `JSON.stringify({ x: undefined })` return?**
```javascript
console.log(JSON.stringify({ x: undefined }));
```

a) `'{"x":null}'`
b) `'{"x":undefined}'`
c) `'{}'`
d) Throws

**Answer: c) `'{}'`**

---

**14. `fetch` returns a Promise that resolves to what?**
```javascript
// Conceptual: fetch('https://example.com')
```

a) The response body as a string
b) A `Response` object
c) Parsed JSON
d) An `ArrayBuffer` only

**Answer: b) A `Response` object**

---

**15. What does `/a+/.test('baaa')` evaluate to?**
```javascript
console.log(/a+/.test('baaa'));
```

a) `false`
b) `true`
c) `null`
d) Throws

**Answer: b) `true`**

---

**16. What does `'abc'.match(/b/)` return?**
```javascript
console.log('abc'.match(/b/));
```

a) `['b']`
b) `['b', index: 1, input: 'abc', groups: undefined]` (array-like with index)
c) `true`
d) `null`

**Answer: b) `['b', index: 1, input: 'abc', groups: undefined]` (array-like with index)**

---

**17. What does `'1a2'.replace(/\d/g, 'x')` produce?**
```javascript
console.log('1a2'.replace(/\d/g, 'x'));
```

a) `xa2`
b) `1ax`
c) `xax`
d) `1a2`

**Answer: c) `xax`**

---

**18. With the global flag, what does `exec` do on successive calls?**
```javascript
const re = /a/g;
re.exec('aba');
const second = re.exec('aba');
console.log(second[0]);
```

a) `'a'` (first match again)
b) `'a'` (second match)
c) `null`
d) Throws

**Answer: b) `'a'` (second match)**

---

**19. What does `/^a{2,4}$/.test('aaa')` return?**
```javascript
console.log(/^a{2,4}$/.test('aaa'));
```

a) `false`
b) `true`
c) `undefined`
d) Only works with `RegExp` constructor

**Answer: b) `true`**

---

**20. What does `/[a-z]/.test('A')` return?**
```javascript
console.log(/[a-z]/.test('A'));
```

a) `true`
b) `false`
c) `null`
d) Case-insensitive by default

**Answer: b) `false`**

---

**21. Inside a regular (non-arrow) function, what is `typeof arguments`?**
```javascript
function f() {
  return typeof arguments;
}
console.log(f(1, 2));
```

a) `"array"`
b) `"object"`
c) `"arguments"`
d) `"undefined"`

**Answer: b) `"object"`**

---

**22. Constructor function: after `const o = new C()`, what is `Object.getPrototypeOf(o)`?**
```javascript
function C() { this.x = 1; }
const o = new C();
console.log(Object.getPrototypeOf(o) === C.prototype, o.x);
```

a) `false 1`
b) `true 1`
c) `true undefined`
d) `false undefined`

**Answer: b) `true 1`**

---

**23. What happens if you call a constructor without `new` (non-strict, sloppy mode) in a browser?**
```javascript
function C() { this.x = 1; }
C();
```

a) Always throws
b) May assign `x` on the global object (legacy behavior)
c) Returns `undefined` and does nothing
d) Creates an object anyway

**Answer: b) May assign `x` on the global object (legacy behavior)**

---

**24. ES6 class: are methods enumerable on the prototype?**
```javascript
class A { m() {} }
console.log(Object.getOwnPropertyDescriptor(A.prototype, 'm').enumerable);
```

a) `true`
b) `false`
c) `undefined`
d) Classes cannot have methods

**Answer: b) `false`**

---

**25. What does a `static` method on a class refer to when called as `A.s()`?**
```javascript
class A { static s() { return this === A; } }
console.log(A.s());
```

a) `true`
b) `false`
c) `undefined`
d) Throws

**Answer: a) `true`**

---

**26. In a subclass constructor, when must you call `super()`?**
```javascript
class B extends A {
  constructor() {
    // ...
  }
}
```

a) Before using `this`
b) After using `this`
c) Only if the parent has a constructor
d) Never required

**Answer: a) Before using `this`**

---

**27. What does `super.method()` in a subclass invoke?**
```javascript
class A { m() { return 1; } }
class B extends A { m() { return super.m() + 1; } }
console.log(new B().m());
```

a) `1`
b) `2`
c) `NaN`
d) Throws

**Answer: b) `2`**

---

**28. Getter/setter: what is logged?**
```javascript
const o = {
  _v: 0,
  get v() { return this._v; },
  set v(n) { this._v = n * 2; }
};
o.v = 3;
console.log(o.v);
```

a) `3`
b) `6`
c) `0`
d) Throws

**Answer: b) `6`**

---

**29. What does `Object.assign({ a: 1 }, { b: 2 }, { a: 3 })` produce?**
```javascript
console.log(Object.assign({ a: 1 }, { b: 2 }, { a: 3 }).a);
```

a) `1`
b) `2`
c) `3`
d) Throws — duplicate keys

**Answer: c) `3`**

---

**30. After `Object.freeze`, can you add a new property?**
```javascript
const o = Object.freeze({ x: 1 });
o.y = 2;
console.log(o.y);
```

a) `2`
b) `undefined`
c) Throws in strict mode; silent fail in sloppy
d) Always throws

**Answer: c) Throws in strict mode; silent fail in sloppy**

---

**31. What does `Object.entries({ a: 1, b: 2 })` return?**
```javascript
console.log(JSON.stringify(Object.entries({ a: 1, b: 2 })));
```

a) `[["a",1],["b",2]]`
b) `{a:1,b:2}`
c) `["a","b"]`
d) `[1,2]`

**Answer: a) `[["a",1],["b",2]]`**

---

**32. What does `Object.fromEntries([['a', 1]])` produce?**
```javascript
console.log(Object.fromEntries([['a', 1]]).a);
```

a) `undefined`
b) `1`
c) Throws
d) `['a', 1]`

**Answer: b) `1`**

---

**33. In a regular function called as `obj.f()`, what is `this`?**
```javascript
const obj = { x: 1, f() { return this.x; } };
console.log(obj.f());
```

a) `undefined`
b) `1`
c) The global object always
d) `window` only

**Answer: b) `1`**

---

**34. What does `const g = obj.f; g()` return in non-strict sloppy mode (browser)?**
```javascript
const obj = { x: 1, f() { return this.x; } };
const g = obj.f;
console.log(g());
```

a) Always `1`
b) Often `undefined` (or global `x` if it existed on global)
c) Always throws
d) `null`

**Answer: b) Often `undefined` (or global `x` if it existed on global)**

---

**35. What does `fn.call(obj, 1, 2)` pass as arguments to `fn`?**
```javascript
function fn(a, b) { return a + b; }
console.log(fn.call(null, 1, 2));
```

a) `this` is `null` and `a,b` are `1,2` (sloppy: this becomes global)
b) Always throws
c) `NaN`
d) `undefined`

**Answer: a) `this` is `null` and `a,b` are `1,2` (sloppy: this becomes global)**

---

**36. How does `apply` differ from `call` for the arguments list?**
```javascript
Math.max.apply(null, [1, 2, 3]);
```

a) `apply` takes arguments as separate values after `this`
b) `apply` takes an array (or array-like) of arguments
c) They are identical
d) `apply` only works on arrow functions

**Answer: b) `apply` takes an array (or array-like) of arguments**

---

**37. What does `bind` return?**
```javascript
function f() { return this.x; }
const o = { x: 2 };
const b = f.bind(o);
console.log(b());
```

a) A new function with fixed `this`
b) Immediately invokes `f`
c) A Promise
d) `undefined` always

**Answer: a) A new function with fixed `this`**

---

**38. In strict mode, what happens when you assign to an undeclared variable?**
```javascript
'use strict';
function f() {
  undeclared = 1;
}
try { f(); } catch (e) { console.log(e.name); }
```

a) Logs nothing; creates a global `undeclared`
b) Logs `"ReferenceError"`
c) Logs `"TypeError"`
d) Assigns successfully inside `f` only

**Answer: b) Logs `"ReferenceError"`**

---

**39. What does `'7'.padStart(3, '0')` produce?**
```javascript
console.log('7'.padStart(3, '0'));
```

a) `'7'`
b) `'07'`
c) `'007'`
d) Throws

**Answer: c) `'007'`**

---

**40. What does `'hi'.padEnd(5, '.')` produce?**
```javascript
console.log('hi'.padEnd(5, '.'));
```

a) `'hi...'`
b) `'...hi'`
c) `'hi..'`
d) `'hi.....'`

**Answer: a) `'hi...'`**

---

**41. What do `startsWith` and `endsWith` return?**
```javascript
console.log('abc'.startsWith('a'), 'abc'.endsWith('c'));
```

a) `true true`
b) `true false`
c) `false true`
d) `false false`

**Answer: a) `true true`**

---

**42. What does `'ab'.repeat(3)` produce?**
```javascript
console.log('ab'.repeat(3));
```

a) `'ababab'`
b) `'abababab'`
c) `'aabbcc'`
d) Throws

**Answer: a) `'ababab'`**

---

**43. With the global regex flag, what does `matchAll` yield?**
```javascript
const it = 'a1a2'.matchAll(/a/g);
console.log([...it].length);
```

a) `0`
b) `1`
c) `2`
d) Throws without `g`

**Answer: c) `2`**

---

**44. What does `[10, 20, 30].findIndex(x => x > 15)` return?**
```javascript
console.log([10, 20, 30].findIndex(x => x > 15));
```

a) `0`
b) `1`
c) `2`
d) `-1`

**Answer: b) `1`**

---

**45. What does `new Array(3).fill(1)` produce?**
```javascript
console.log(new Array(3).fill(1).join(','));
```

a) `,,`
b) `1,1,1`
c) `empty,empty,empty`
d) Throws

**Answer: b) `1,1,1`**

---

**46. After `arr.copyWithin(0, 1)`, what is a typical outcome for `[1, 2, 3, 4]`?**
```javascript
const a = [1, 2, 3, 4];
a.copyWithin(0, 1);
console.log(a.join(','));
```

a) `1,2,3,4`
b) `2,3,4,4`
c) `2,3,4,1`
d) `4,3,2,1`

**Answer: b) `2,3,4,4`**

---

**47. What does `Array.from({ length: 2 }, (_, i) => i)` produce?**
```javascript
console.log(Array.from({ length: 2 }, (_, i) => i).join(','));
```

a) `,`
b) `0,1`
c) `1,2`
d) Throws

**Answer: b) `0,1`**

---

**48. What do `Array.isArray([])` and `Array.of(1, 2)` evaluate to?**
```javascript
console.log(Array.isArray([]), Array.of(1, 2).length);
```

a) `true 2`
b) `false 2`
c) `true 1`
d) `false 1`

**Answer: a) `true 2`**

---

**49. `typeof` vs `instanceof`: what is true for `[]`?**
```javascript
console.log(typeof [], [] instanceof Array);
```

a) `"object" true`
b) `"array" true`
c) `"object" false`
d) `"array" false`

**Answer: a) `"object" true`**

---

**50. In ES modules, what is true about `import` at the top level?**
```javascript
// In an ES module file
import { x } from './mod.js';
```

a) `import` is hoisted and evaluated before other module code runs
b) `import` runs line-by-line like `require` in CommonJS
c) You cannot import named exports
d) `import` only works inside functions

**Answer: a) `import` is hoisted and evaluated before other module code runs**
