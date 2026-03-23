# JavaScript MCQ - Set 6 (Expert Level)

**1. What is the output?**
```javascript
const o = {
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? "S" : hint === "number" ? 1 : "D";
  },
};
console.log(`${o}`);
console.log(o + 0);
console.log(o == 1);
```

a) `"S", "D0", false`
b) `"S", 1, true`
c) `"D", "D0", true`
d) `"S", "10", true`

**Answer: a) `"S", "D0", false`**

---

**2. What is the output?**
```javascript
console.log(null == undefined);
console.log(null === undefined);
console.log(null <= 0);
console.log(null < 0);
```

a) `true, false, true, false`
b) `true, false, false, false`
c) `false, false, true, false`
d) `true, true, true, false`

**Answer: b) `true, false, false, false`**

---

**3. What is the output?**
```javascript
console.log([] == false);
console.log([0] == false);
console.log([[]] == false);
console.log([1] == true);
```

a) `true, true, true, true`
b) `true, true, false, true`
c) `false, true, true, false`
d) `true, false, true, true`

**Answer: b) `true, true, false, true`**

---

**4. What is the output?**
```javascript
console.log(Boolean(new Boolean(false)));
console.log(!!new Boolean(false));
console.log(new Boolean(false) == false);
```

a) `true, false, true`
b) `false, false, false`
c) `true, false, false`
d) `true, true, false`

**Answer: c) `true, false, false`**

---

**5. In ECMAScript, when the abstract equality algorithm compares a string to a number, which conversion is applied first?**

a) `ToString` on the number
b) `ToNumber` on the string
c) `ToPrimitive` with hint `"default"` on both operands
d) `SameValue` without coercion

**Answer: b) `ToNumber` on the string**

---

**6. What is the output?**
```javascript
function outer() {
  let x = 1;
  function inner() {
    console.log(x);
    let x = 2;
  }
  inner();
}
outer();
```

a) `1`
b) `2`
c) `undefined`
d) Throws `ReferenceError`

**Answer: d) Throws `ReferenceError`**

---

**7. What is the output?**
```javascript
var y = 1;
if (true) {
  let x = (y = 2, 3);
  console.log(x, y);
}
console.log(typeof x, y);
```

a) `3 2, "undefined" 2`
b) `3 2, "number" 2`
c) `3 1, "undefined" 2`
d) Throws `ReferenceError`

**Answer: a) `3 2, "undefined" 2`**

---

**8. What is the output?**
```javascript
async function* gen() {
  const v = yield 1;
  yield v * 2;
}
(async () => {
  const it = gen();
  console.log(await it.next());
  console.log(await it.next(3));
  console.log(await it.next());
})();
```

a) `{value:1,done:false}, {value:6,done:false}, {value:undefined,done:true}`
b) `{value:1,done:false}, {value:3,done:false}, {value:undefined,done:true}`
c) `{value:1,done:false}, {value:6,done:false}, {value:6,done:true}`
d) Throws because `await` on sync iterator value

**Answer: a) `{value:1,done:false}, {value:6,done:false}, {value:undefined,done:true}`**

---

**9. What is the output?**
```javascript
const ac = new AbortController();
const p = new Promise((_, rej) => {
  ac.signal.addEventListener("abort", () => rej("aborted"));
});
ac.abort();
p.catch((e) => console.log(e));
console.log("after");
```

a) `aborted` then `after` (order may vary)
b) `after` then `aborted`
c) Only `after`
d) Unhandled rejection

**Answer: b) `after` then `aborted`**

---

**10. What does this print (locale data may affect grouping; assume `en-US`)?**
```javascript
console.log(
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234.5)
);
```

a) `$1,234.5`
b) `USD 1,234.50`
c) `$1,234.50`
d) `1,234.50 USD`

**Answer: c) `$1,234.50`**

---

**11. What is the output?**
```javascript
const d = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
console.log(
  new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(d)
);
```

a) `2024-01-15`
b) `01/15/2024`
c) `2024/01/15`
d) Depends on local timezone only

**Answer: c) `2024/01/15`**

---

**12. What is the output?**
```javascript
console.log(["z", "ä", "b"].sort(new Intl.Collator("sv").compare).join(","));
```

a) Always `b,ä,z` regardless of engine
b) Typically `b,z,ä` in Swedish collation (ä after z)
c) `ä,b,z`
d) Throws `TypeError`

**Answer: b) Typically `b,z,ä` in Swedish collation (ä after z)**

---

**13. What is the output?**
```javascript
const a = { x: 1 };
const b = structuredClone(a);
b.x = 2;
console.log(a.x, b.x);
```

a) `2 2`
b) `1 2`
c) `1 1`
d) Throws `DataCloneError`

**Answer: b) `1 2`**

---

**14. What happens?**
```javascript
structuredClone(new WeakMap());
```

a) Returns a deep clone of the `WeakMap`
b) Throws `DataCloneError` / `DOMException`
c) Returns an empty ordinary `Map`
d) Returns `undefined`

**Answer: b) Throws `DataCloneError` / `DOMException`**

---

**15. What is the output?**
```javascript
class E extends Error {
  constructor(m) {
    super(m);
    this.name = "E";
  }
}
const e = new E("x", { cause: new Error("y") });
console.log(e.cause?.message);
```

a) `"y"`
b) `undefined`
c) Throws in `super`
d) `"x"`

**Answer: b) `undefined`**

---

**16. What is the output?**
```javascript
const err = new AggregateError([new Error("a"), new Error("b")], "both");
console.log(err.errors.length, err.message);
```

a) `2, "both"`
b) `1, "both"`
c) `2, "a"`
d) Throws

**Answer: a) `2, "both"`**

---

**17. What is the output?**
```javascript
class C {
  #x = 1;
  static {
    this.prototype.get = function () {
      return this.#x;
    };
  }
}
console.log(new C().get());
```

a) `1`
b) `undefined`
c) Throws `TypeError` (private field access)
d) Throws `SyntaxError` at parse time

**Answer: a) `1`**

---

**18. What is the output?**
```javascript
class C {
  static #s = 2;
  static get s() {
    return this.#s;
  }
}
class D extends C {}
console.log(D.s);
```

a) `2`
b) `undefined`
c) Throws `TypeError`
d) `NaN`

**Answer: c) Throws `TypeError`**

---

**19. Which statement best contrasts `Object.create(proto)` and `{ ...obj }` for object creation?**

a) Both copy own enumerable properties from `proto` / `obj`
b) `Object.create` sets `[[Prototype]]` without copying own properties; spread copies own enumerable properties and sets prototype to `Object.prototype`
c) `Object.create` always invokes constructor functions
d) Spread preserves accessor descriptors exactly like `Object.assign`

**Answer: b) `Object.create` sets `[[Prototype]]` without copying own properties; spread copies own enumerable properties and sets prototype to `Object.prototype`**

---

**20. What is the output?**
```javascript
const o = {};
Object.defineProperty(o, "a", { value: 1, enumerable: false });
console.log({ ...o }.a, Object.assign({}, o).a);
```

a) `1, 1`
b) `undefined, undefined`
c) `1, undefined`
d) `undefined, 1`

**Answer: b) `undefined, undefined`**

---

**21. What is the output?**
```javascript
const m = new Map([[{}, 1]]);
const k = [...m.keys()][0];
m.set(k, 2);
console.log(m.get(k));
```

a) `1`
b) `2`
c) `undefined`
d) Throws

**Answer: b) `2`**

---

**22. What is the output?**
```javascript
const a = NaN;
const m = new Map([[a, 1]]);
console.log(m.get(NaN), m.has(NaN));
```

a) `1, true`
b) `undefined, false`
c) `1, false`
d) `undefined, true`

**Answer: a) `1, true`**

---

**23. What is the output?**
```javascript
const s = new Set([1, 1, "1", NaN, NaN]);
console.log(s.size);
```

a) `3`
b) `4`
c) `5`
d) `2`

**Answer: b) `4`**

---

**24. What is the output?**
```javascript
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
```

a) `true, true`
b) `false, false`
c) `false, true`
d) `true, false`

**Answer: c) `false, true`**

---

**25. What is the output?**
```javascript
console.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2);
```

a) `true`
b) `false`
c) Throws `RangeError`
d) `NaN`

**Answer: a) `true`**

---

**26. What is the output?**
```javascript
function* g() {
  const x = yield 10;
  yield x + 1;
}
const it = g();
console.log(it.next().value);
console.log(it.next(5).value);
console.log(it.next().done);
```

a) `10, 6, true`
b) `10, 6, false`
c) `undefined, 6, true`
d) `10, undefined, true`

**Answer: a) `10, 6, true`**

---

**27. What is the output in sloppy (non-strict) global scope when `eval` runs this code?**
```javascript
eval("var x = 1");
console.log(typeof x);
```

a) `"number"`
b) `"undefined"`
c) Throws `ReferenceError`
d) `"object"`

**Answer: a) `"number"`**

---

**28. Which is true about `eval` in strict mode inside a function?**

a) `eval("var y=1")` creates a binding in the outer function scope
b) `eval` runs in a new variable environment isolated from the surrounding lexical declarations
c) Strict mode forbids any use of `eval`
d) `eval` always returns `undefined`

**Answer: b) `eval` runs in a new variable environment isolated from the surrounding lexical declarations**

---

**29. What is the output?**
```javascript
let o = { a: 1 };
with (o) {
  a = 2;
}
console.log(o.a);
```

a) `2`
b) `1`
c) Throws in strict mode only
d) `undefined`

**Answer: a) `2`**

---

**30. What is the output?**
```javascript
let x = 0;
outer: for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 2; j++) {
    x++;
    if (j === 1) break outer;
  }
}
console.log(x);
```

a) `2`
b) `3`
c) `4`
d) `1`

**Answer: a) `2`**

---

**31. What is the output?**
```javascript
let a = (1, 2, 3);
console.log(a);
```

a) `1`
b) `3`
c) `[1, 2, 3]`
d) Throws

**Answer: b) `3`**

---

**32. What is the output?**
```javascript
let u;
console.log(void 0, void u, u === void 0);
```

a) `undefined, undefined, true`
b) `null, undefined, true`
c) `undefined, undefined, false`
d) `0, undefined, true`

**Answer: a) `undefined, undefined, true`**

---

**33. What is the output?**
```javascript
console.log((-1 >>> 0).toString(16));
```

a) `"ffffffff"`
b) `"-1"`
c) `"80000000"`
d) `"0"`

**Answer: a) `"ffffffff"`**

---

**34. What is the output?**
```javascript
const o = {};
Object.setPrototypeOf(o, { a: 1 });
console.log(o.a, Object.prototype.hasOwnProperty.call(o, "a"));
```

a) `1, true`
b) `1, false`
c) `undefined, false`
d) Throws `TypeError`

**Answer: b) `1, false`**

---

**35. What is the output?**
```javascript
const o = { __proto__: { b: 2 } };
console.log(o.b, Object.getPrototypeOf(o).b);
```

a) `2, 2`
b) `undefined, 2`
c) `2, undefined`
d) Syntax error

**Answer: a) `2, 2`**

---

**36. What does this `Proxy` trap control?**
```javascript
new Proxy(target, { has() { return true; } });
```

a) Whether `Object.keys` lists a property
b) Result of `in` operator and `Reflect.has`
c) Result of `delete target[prop]`
d) Enumeration order in `for...in`

**Answer: b) Result of `in` operator and `Reflect.has`**

---

**37. What is the output?**
```javascript
const t = { a: 1 };
const p = new Proxy(t, {
  deleteProperty() {
    return true;
  },
});
delete p.a;
console.log(t.a);
```

a) `undefined`
b) `1`
c) Throws
d) `null`

**Answer: b) `1`**

---

**38. What is the output?**
```javascript
const t = { a: 1, b: 2 };
Object.preventExtensions(t);
const p = new Proxy(t, {
  ownKeys() {
    return ["a"];
  },
});
console.log(Object.keys(p).length, Reflect.ownKeys(p).length);
```

a) `1, 1`
b) `2, 2`
c) `1, 2`
d) Throws `TypeError`

**Answer: d) Throws `TypeError`**

---

**39. What is the output?**
```javascript
const t = {};
const p = new Proxy(t, {
  getPrototypeOf() {
    return null;
  },
});
console.log(Object.getPrototypeOf(p) === null);
```

a) `true`
b) `false`
c) Throws `TypeError`
d) `undefined`

**Answer: a) `true`**

---

**40. Which pair is correct: `Reflect.set(target, key, value, receiver)` behavior?**

a) Always defines a new own property on `target` regardless of receiver
b) Uses the same semantics as property assignment with optional `receiver` as the `this` value for accessors and for creating properties on prototypes when needed
c) Cannot invoke setters on the prototype chain
d) Returns `undefined` on success and `true` on failure

**Answer: b) Uses the same semantics as property assignment with optional `receiver` as the `this` value for accessors and for creating properties on prototypes when needed**

---

**41. JavaScript engines are required to perform tail-call optimization in which situation?**

a) All recursive calls in strict mode
b) Only in sloppy mode for direct recursion
c) Proper tail calls are defined in ES6 for strict mode in specific syntactic tail positions, but engines may omit optimization
d) Guaranteed for any function returning another function call

**Answer: c) Proper tail calls are defined in ES6 for strict mode in specific syntactic tail positions, but engines may omit optimization**

---

**42. Trampolining is primarily used to:**

a) Replace promises with callbacks
b) Avoid deep synchronous recursion by returning thunks and looping in a trampoline driver
c) Serialize async iterators
d) Polyfill `WeakRef`

**Answer: b) Avoid deep synchronous recursion by returning thunks and looping in a trampoline driver**

---

**43. What is the output?**
```javascript
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);
const inc = (n) => n + 1;
const dbl = (n) => n * 2;
console.log(pipe(inc, dbl)(2));
```

a) `6`
b) `5`
c) `4`
d) `8`

**Answer: a) `6`**

---

**44. What is the output?**
```javascript
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((v, f) => f(v), x);
const inc = (n) => n + 1;
const dbl = (n) => n * 2;
console.log(compose(inc, dbl)(2));
```

a) `6`
b) `5`
c) `4`
d) `8`

**Answer: b) `5`**

---

**45. What best describes a typical valid use of `FinalizationRegistry` with `WeakRef`?**

a) Guaranteed immediate cleanup when the weak target is collected
b) Registering a cleanup callback that may run after the object becomes unreachable, paired with weak references that do not keep the target alive
c) Strongly retaining objects until `unregister` is called
d) Replacing `try/finally` for all resource management

**Answer: b) Registering a cleanup callback that may run after the object becomes unreachable, paired with weak references that do not keep the target alive**

---

**46. What is the output?**
```javascript
let target = { a: 1 };
const ref = new WeakRef(target);
target = null;
console.log(typeof ref.deref());
```

a) Always `"object"`
b) `"undefined"` or `"object"` depending on GC timing
c) Always `"undefined"`
d) Throws `ReferenceError`

**Answer: b) `"undefined"` or `"object"` depending on GC timing**

---

**47. What is the output?**
```javascript
async function f() {
  async function* g() {
    yield 1;
    yield 2;
  }
  let s = 0;
  for await (const v of g()) s += v;
  console.log(s);
}
f();
```

a) `3`
b) `12` (string concat)
c) `0`
d) Throws because `for await...of` requires async iterable

**Answer: a) `3`**

---

**48. What is the output?**
```javascript
const sym = Symbol("x");
const o = { [sym]: 1, a: 2 };
console.log(JSON.stringify(o));
```

a) `"{\"a\":2}"`
b) `"{\"a\":2,\"x\":1}"`
c) `"{}"`
d) Throws

**Answer: a) `"{\"a\":2}"`**

---

**49. What is the output?**
```javascript
"use strict";
const o = {};
Object.preventExtensions(o);
o.__proto__ = null;
console.log(Object.getPrototypeOf(o));
```

a) `null`
b) `Object.prototype`
c) Throws `TypeError`
d) `undefined`

**Answer: c) Throws `TypeError`**

---

**50. What is the output?**
```javascript
console.log(String.raw`a\nb`.length);
console.log(String.raw`a${"\\n"}b`);
```

a) `4, "a\\nb"`
b) `3, "a\nb"`
c) `4, "a\nb"`
d) `3, "a\\nb"`

**Answer: a) `4, "a\\nb"`**

---
