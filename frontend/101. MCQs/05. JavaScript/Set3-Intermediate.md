# JavaScript MCQ - Set 3 (Intermediate Level)

**1. What will be logged?**
```javascript
let x = 1;
function outer() {
  let x = 2;
  return function inner() {
    console.log(x);
  };
}
const f = outer();
x = 3;
f();
```

a) `1`
b) `2`
c) `3`
d) `undefined`

**Answer: b) `2`**

---

**2. Which statement best describes the JavaScript scope chain?**
```javascript
// Conceptual: when resolving `name`, the engine searches...
```

a) Only the current function's local scope
b) Outer lexical environments until a binding is found or the global object is reached
c) The prototype chain of the nearest object literal
d) The call stack from top to bottom

**Answer: b) Outer lexical environments until a binding is found or the global object is reached**

---

**3. What is logged?**
```javascript
console.log(a);
var a = 10;
```

a) `10`
b) `undefined`
c) `ReferenceError`
d) `null`

**Answer: b) `undefined`**

---

**4. What happens when this runs?**
```javascript
console.log(b);
let b = 5;
```

a) Logs `undefined`
b) Logs `5`
c) Throws `ReferenceError` in the temporal dead zone
d) Logs `null`

**Answer: c) Throws `ReferenceError` in the temporal dead zone**

---

**5. What does this IIFE return?**
```javascript
const result = (function (n) {
  return n * 2;
})(4);
console.log(result);
```

a) `undefined`
b) `4`
c) `8`
d) `function`

**Answer: c) `8`**

---

**6. What is the output?**
```javascript
function greet(cb) {
  return cb("World");
}
const out = greet(function (name) {
  return "Hi, " + name;
});
console.log(out);
```

a) `Hi, World`
b) `undefined`
c) `[object Object]`
d) `World`

**Answer: a) `Hi, World`**

---

**7. Which expression correctly describes a higher-order function?**

a) A function that always returns a Promise
b) A function that takes another function as an argument and/or returns a function
c) A function declared with the `function` keyword only
d) A function that mutates its arguments in place

**Answer: b) A function that takes another function as an argument and/or returns a function**

---

**8. What is logged?**
```javascript
const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2);
console.log(doubled.join(","));
```

a) `1,2,3`
b) `2,4,6`
c) `6`
d) `undefined`

**Answer: b) `2,4,6`**

---

**9. What is the value of `evens`?**
```javascript
const evens = [1, 2, 3, 4].filter((n) => n % 2 === 0);
console.log(evens.length);
```

a) `0`
b) `1`
c) `2`
d) `4`

**Answer: c) `2`**

---

**10. What is logged?**
```javascript
const sum = [1, 2, 3, 4].reduce((acc, n) => acc + n, 0);
console.log(sum);
```

a) `4`
b) `9`
c) `10`
d) `undefined`

**Answer: c) `10`**

---

**11. What does `find` return here?**
```javascript
const arr = [{ id: 1 }, { id: 2 }];
const hit = arr.find((x) => x.id === 3);
console.log(hit);
```

a) `{}`
b) `null`
c) `undefined`
d) `0`

**Answer: c) `undefined`**

---

**12. What is logged?**
```javascript
const ok = [2, 4, 6].some((n) => n % 2 !== 0);
console.log(ok);
```

a) `true`
b) `false`
c) `undefined`
d) `0`

**Answer: b) `false`**

---

**13. What is logged?**
```javascript
const allPos = [-1, 0, 2].every((n) => n > 0);
console.log(allPos);
```

a) `true`
b) `false`
c) `undefined`
d) `2`

**Answer: b) `false`**

---

**14. What is the output?**
```javascript
let s = "";
[1, 2].forEach((n, i) => {
  s += i + n;
});
console.log(s);
```

a) `"12"`
b) `"13"`
c) `"03"`
d) `"3"`

**Answer: b) `"13"`**

---

**15. What is logged?**
```javascript
const flat = [1, [2, [3]]].flat(1);
console.log(JSON.stringify(flat));
```

a) `"[1,2,3]"`
b) `"[1,[2,[3]]]"`
c) `"[1,2,[3]]"`
d) `"[1,[2,3]]"`

**Answer: c) `"[1,2,[3]]`**

---

**16. What is logged?**
```javascript
const out = [1, 2].flatMap((n) => [n, n * 10]);
console.log(out.join("-"));
```

a) `1-2-10-20`
b) `1-10-2-20`
c) `1-2-1-2`
d) `10-20`

**Answer: b) `1-10-2-20`**

---

**17. After this runs, what is `b`?**
```javascript
const [a, b = 9] = [1];
console.log(b);
```

a) `undefined`
b) `9`
c) `1`
d) `0`

**Answer: b) `9`**

---

**18. What is logged?**
```javascript
const { x: renamed, y = 5 } = { x: 1 };
console.log(renamed, y);
```

a) `1 5`
b) `x 5`
c) `1 undefined`
d) `undefined 5`

**Answer: a) `1 5`**

---

**19. What is the value of `merged`?**
```javascript
const merged = { ...{ a: 1 }, ...{ a: 2, b: 3 } };
console.log(merged.a, merged.b);
```

a) `1 3`
b) `2 3`
c) `undefined 3`
d) `1 undefined`

**Answer: b) `2 3`**

---

**20. What is logged?**
```javascript
function sum(a, b = a) {
  return a + b;
}
console.log(sum(3));
```

a) `3`
b) `6`
c) `NaN`
d) `undefined`

**Answer: b) `6`**

---

**21. What is logged?**
```javascript
const obj = {
  name: "App",
  show() {
    setTimeout(() => console.log(this.name), 0);
  },
};
obj.show();
```

a) `undefined`
b) `"App"`
c) `ReferenceError`
d) `window` (or global object name)

**Answer: b) `"App"`**

---

**22. What is logged?**
```javascript
const obj = {
  name: "App",
  show: function () {
    setTimeout(function () {
      console.log(this.name);
    }, 0);
  },
};
obj.show();
```

a) Always `"App"` in strict and non-strict mode
b) In browsers, often `undefined` (strict) or the global object’s `name` (non-strict), not `"App"`
c) Always throws
d) Always logs `"App"`

**Answer: b) In browsers, often `undefined` (strict) or the global object’s `name` (non-strict), not `"App"`**

---

**23. What is logged?**
```javascript
const tag = "user";
const id = 42;
console.log(`${tag.toUpperCase()}-${`${id}`.padStart(3, "0")}`);
```

a) `USER-42`
b) `USER-042`
c) `user-042`
d) `USER-0042`

**Answer: b) `USER-042`**

---

**24. What is the shape of `o` after creation?**
```javascript
const x = 1;
const o = { x, ["a" + "b"]: 2 };
console.log(o.x + o.ab);
```

a) `NaN`
b) `3`
c) `12`
d) `undefined`

**Answer: b) `3`**

---

**25. What is `typeof` of a `Symbol()`?**
```javascript
console.log(typeof Symbol("s"));
```

a) `"object"`
b) `"symbol"`
c) `"string"`
d) `"function"`

**Answer: b) `"symbol"`**

---

**26. What is logged?**
```javascript
const iter = [10, 20][Symbol.iterator]();
console.log(iter.next().value, iter.next().done);
```

a) `10 false`
b) `10 true`
c) `20 false`
d) `undefined false`

**Answer: a) `10 false`**

---

**27. What does this loop primarily iterate over?**
```javascript
const o = Object.create({ inherited: 1 });
o.own = 2;
for (const k in o) console.log(k);
```

a) Only own enumerable string keys (never inherited)
b) Own and inherited enumerable string keys (not Symbol keys unless using other APIs)
c) Only Symbol keys
d) Array indices only

**Answer: b) Own and inherited enumerable string keys (not Symbol keys unless using other APIs)**

---

**28. What is logged?**
```javascript
const m = new Map([[1, "a"]]);
m.set(1, "b").set(2, "c");
console.log(m.get(1), m.size);
```

a) `a 1`
b) `b 2`
c) `b 1`
d) `undefined 2`

**Answer: b) `b 2`**

---

**29. What is `s.size`?**
```javascript
const s = new Set([1, 1, "1", { n: 1 }, { n: 1 }]);
console.log(s.size);
```

a) `2`
b) `3`
c) `4`
d) `5`

**Answer: c) `4`**

---

**30. Which statement about `WeakMap` keys is correct?**

a) Keys can be any primitive or object
b) Keys must be objects (or registered symbols in modern engines); values can be arbitrary
c) Keys must be strings only
d) `WeakMap` allows duplicate keys like `Map`

**Answer: b) Keys must be objects (or registered symbols in modern engines); values can be arbitrary**

---

**31. What is logged?**
```javascript
const user = { profile: { name: "Ada" } };
console.log(user.profile?.name ?? user.name ?? "anon");
```

a) `Ada`
b) `anon`
c) `undefined`
d) `null`

**Answer: a) `Ada`**

---

**32. What is logged?**
```javascript
const count = 0;
console.log(count ?? 10);
```

a) `0`
b) `10`
c) `undefined`
d) `null`

**Answer: a) `0`**

---

**33. What is logged?**
```javascript
const count = null;
console.log(count || 10);
```

a) `null`
b) `10`
c) `0`
d) `undefined`

**Answer: b) `10`**

---

**34. What is logged?**
```javascript
let x = 0;
const y = x++ && 5;
console.log(x, y);
```

a) `1 0`
b) `1 5`
c) `0 0`
d) `0 5`

**Answer: a) `1 0`**

---

**35. In the browser, when does the callback from `setTimeout(fn, 0)` typically run?**

a) Immediately before any other script on the page
b) After the current call stack clears and macrotasks like timers can run (often after rendering/paint opportunities)
c) Only after `requestAnimationFrame` callbacks in the same frame, always before I/O
d) Synchronously at the point `setTimeout` is called

**Answer: b) After the current call stack clears and macrotasks like timers can run (often after rendering/paint opportunities)**

---

**36. What is a likely log order?**
```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

a) `A D B C`
b) `A D C B`
c) `A B C D`
d) `D A C B`

**Answer: b) `A D C B`**

---

**37. What does `setInterval` return in browsers (historically and commonly)?**

a) Always a string token
b) A numeric timer id (may be an object in some environments)
c) A Promise
d) `undefined`

**Answer: b) A numeric timer id (may be an object in some environments)**

---

**38. Which method creates a new element node in the DOM?**

a) `document.querySelector()`
b) `document.createElement()`
c) `element.appendChild()` alone
d) `document.getElementById()`

**Answer: b) `document.createElement()`**

---

**39. What is the difference between `element.textContent` and `element.innerHTML` for assignment?**

a) There is no practical difference
b) `textContent` treats input as plain text; `innerHTML` parses HTML markup
c) `innerHTML` is faster and safer for user input
d) `textContent` removes all attributes automatically

**Answer: b) `textContent` treats input as plain text; `innerHTML` parses HTML markup**

---

**40. In the DOM event flow, what is the correct order for a target inside a nested element?**

a) Only bubbling: target → document
b) Capturing: window → target, then bubbling: target → window
c) Only capturing: document → target
d) Target phase runs twice before bubbling

**Answer: b) Capturing: window → target, then bubbling: target → window**

---

**41. What does `stopPropagation()` do?**

a) Prevents the default browser action only
b) Stops the event from reaching other listeners on the same element
c) Stops the event from propagating to other elements further along the capture/bubble path
d) Removes the event listener permanently

**Answer: c) Stops the event from propagating to other elements further along the capture/bubble path**

---

**42. What is logged?**
```javascript
function foo() {
  console.log(this?.x);
}
const o1 = { x: 1, foo };
const o2 = { x: 2 };
o1.foo.call(o2);
```

a) `1`
b) `2`
c) `undefined`
d) Throws

**Answer: b) `2`**

---

**43. What is logged?**
```javascript
const f = (...args) => args.reduce((a, b) => a + b, 0);
console.log(f(1, 2, 3));
```

a) `"123"`
b) `6`
c) `NaN`
d) Throws

**Answer: b) `6`**

---

**44. What is logged?**
```javascript
const key = "type";
const car = { [key]: "sedan" };
console.log(car["type"]);
```

a) `undefined`
b) `"sedan"`
c) `"type"`
d) Throws

**Answer: b) `"sedan"`**

---

**45. What is logged?**
```javascript
const sym = Symbol("id");
const o = { [sym]: 7, id: 1 };
console.log(Object.keys(o).length, o[sym]);
```

a) `2 7`
b) `1 7`
c) `2 undefined`
d) `0 7`

**Answer: b) `1 7`**

---

**46. What is logged?**
```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

a) `0, 1, 2`
b) `3, 3, 3`
c) `undefined, undefined, undefined`
d) `0, 0, 0`

**Answer: b) `3, 3, 3`**

---

**47. What is logged?**
```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

a) `0, 1, 2`
b) `3, 3, 3`
c) `undefined` three times
d) `2, 2, 2`

**Answer: a) `0, 1, 2`**

---

**48. What is logged?**
```javascript
const ws = new WeakSet();
let o = {};
ws.add(o);
o = null;
// After GC (conceptually), which is true?
```

a) `WeakSet` automatically removes unreachable object references
b) `WeakSet` throws if the object is set to `null`
c) `WeakSet` keeps strong references so the object never can be collected
d) `WeakSet` size is readable via `.size`

**Answer: a) `WeakSet` automatically removes unreachable object references**

---

**49. What is logged?**
```javascript
const arr = [1, , 3];
console.log(arr.map((x) => x * 2));
```

a) `[2, NaN, 6]`
b) A sparse array: `2` at index `0`, a hole at index `1`, `6` at index `2` (callback not run for the hole)
c) `[2, undefined, 6]` with `undefined` produced by the callback at index `1`
d) `[2, 2, 6]`

**Answer: b) A sparse array: `2` at index `0`, a hole at index `1`, `6` at index `2` (callback not run for the hole)**

---

**50. What is logged?**
```javascript
async function demo() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
}
console.log("0");
demo();
console.log("3");
```

a) `0 1 3 2`
b) `0 3 1 2`
c) `1 0 3 2`
d) `0 1 2 3`

**Answer: a) `0 1 3 2`**

---
