# JavaScript Arrays

**Arrays** are ordered, list-like collections stored in a single variable. Each element has a numeric **index** (starting at `0`). Arrays are **objects** under the hood (`typeof [] === "object"`), are **mutable**, and are passed **by reference**. They are the primary structure for sequences, collections, and many functional programming patterns in JavaScript.

---

## 📑 Table of Contents

1. [Array Basics](#1-array-basics)
2. [Adding and Removing Elements](#2-adding-and-removing-elements)
3. [Iteration Methods](#3-iteration-methods)
4. [Searching Methods](#4-searching-methods)
5. [Sorting and Reversing](#5-sorting-and-reversing)
6. [Transformation and Static Methods](#6-transformation-and-static-methods)
7. [Copying Arrays and Elements](#7-copying-arrays-and-elements)
8. [Typed Arrays and Binary Data](#8-typed-arrays-and-binary-data)
9. [Array-like Objects](#9-array-like-objects)
10. [Advanced Topics](#10-advanced-topics)
11. [Best Practices](#best-practices)
12. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
13. [Comparison Table](#comparison-table)

---

## 1. Array Basics

### Key Points

- Arrays hold values in **order**; access by **zero-based index**
- The **`length`** property is writable and affects the array’s size (including sparse behavior)
- Arrays can nest: **multi-dimensional** arrays are arrays of arrays
- **Sparse arrays** have “holes” (missing indices); iteration methods **skip** holes differently than `for` loops

### 1.1 Creation — Array Literal

The most common and recommended way to create an array.

```javascript
const empty = [];
const nums = [1, 2, 3, 4];
const mixed = [1, "two", true, { a: 1 }, [10, 20]];
const fromLength = Array(3);        // [empty × 3] — sparse slots, not [3]
const singleEl = Array.of(3);       // [3] — one element with value 3

console.log(nums.length);           // 4
console.log(mixed[3]);              // { a: 1 }
```

### 1.2 Creation — Array Constructor

`new Array()` or `Array()` can be confusing: one numeric argument sets **length**, not a single element.

```javascript
const a = new Array();              // []
const b = new Array(5);             // length 5, empty slots (sparse)
const c = new Array(1, 2, 3);       // [1, 2, 3]

console.log(b.length);              // 5
console.log(b[0]);                  // undefined (hole, not assigned)

// Prefer literal or Array.of for a single numeric element
console.log(Array.of(5));           // [5]
```

### 1.3 Length

`length` is one more than the greatest **own numeric index**. Setting `length` truncates or extends (with holes).

```javascript
const arr = ["a", "b", "c"];
console.log(arr.length);            // 3

arr.length = 2;
console.log(arr);                   // ["a", "b"] — "c" removed

arr.length = 5;
console.log(arr);                   // ["a", "b", empty × 3]
console.log(arr.length);            // 5
```

### 1.4 Accessing and Modifying Elements

Use bracket notation with integer indices. Out-of-range access yields `undefined`.

```javascript
const scores = [88, 92, 79];
console.log(scores[0]);             // 88
scores[1] = 95;
console.log(scores);                // [88, 95, 79]

scores[10] = 100;                   // creates holes between 3 and 10
console.log(scores.length);         // 11
console.log(scores[5]);             // undefined (hole)
```

### 1.5 Multi-dimensional Arrays

Represent matrices or grids as nested arrays.

```javascript
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log(matrix[1][2]);          // 6 (row 1, column 2)

// Jagged array (rows of different lengths)
const jagged = [[1], [2, 3], [4, 5, 6]];
console.log(jagged[2].length);      // 3
```

### 1.6 Array.isArray()

Because `typeof []` is `"object"`, use **`Array.isArray`** to distinguish real arrays from plain objects.

```javascript
console.log(Array.isArray([1, 2]));        // true
console.log(Array.isArray({ length: 1 })); // false — array-like, not Array
console.log([] instanceof Array);          // true (cross-realm: prefer isArray)
```

### 1.7 Sparse Arrays and Array Holes

A **hole** is an index that exists in the range `0 .. length-1` but has **no element** (was never set, or was deleted). Holes are **not** the same as an element with value `undefined`.

```javascript
const sparse = [, , "c"];           // holes at 0 and 1
console.log(0 in sparse);           // false — index 0 is a hole
console.log(2 in sparse);           // true

const withUndefined = [undefined, undefined, "c"];
console.log(0 in withUndefined);    // true — property 0 exists

delete sparse[2];
console.log(sparse);                // [empty × 3] — new hole at 2

// Object.keys skips holes; length may still count up to max index + 1
const a = [];
a[2] = "x";
console.log(a.length);              // 3
console.log(Object.keys(a));        // ["2"]
```

---

## 2. Adding and Removing Elements

### 2.1 push()

Adds one or more elements to the **end**. Returns the **new** `length`. **Mutates** the array.

```javascript
const stack = [1, 2];
const len = stack.push(3, 4);
console.log(len);                   // 4
console.log(stack);                 // [1, 2, 3, 4]
```

### 2.2 pop()

Removes the **last** element and returns it. **Mutates** the array. On empty array, returns `undefined`.

```javascript
const stack = [1, 2, 3];
const last = stack.pop();
console.log(last);                  // 3
console.log(stack);                 // [1, 2]

console.log([].pop());              // undefined
```

### 2.3 unshift()

Adds elements to the **beginning**. Returns new `length`. **Mutates** (shifts existing indices).

```javascript
const q = [2, 3];
const n = q.unshift(0, 1);
console.log(n);                     // 4
console.log(q);                     // [0, 1, 2, 3]
```

### 2.4 shift()

Removes the **first** element and returns it. **Mutates**. Empty array → `undefined`.

```javascript
const q = [1, 2, 3];
const first = q.shift();
console.log(first);                 // 1
console.log(q);                     // [2, 3]
```

### 2.5 splice(start, deleteCount, ...items)

Removes/replaces/inserts at `start`. Returns an **array of removed elements**. **Mutates**.

```javascript
const nums = [1, 2, 3, 4, 5];

// Remove 2 elements starting at index 1
const removed = nums.splice(1, 2);
console.log(removed);               // [2, 3]
console.log(nums);                  // [1, 4, 5]

// Insert without removing
const letters = ["a", "c"];
letters.splice(1, 0, "b");
console.log(letters);               // ["a", "b", "c"]

// Replace
const data = [10, 20, 30];
data.splice(1, 1, 99);
console.log(data);                  // [10, 99, 30]
```

### 2.6 slice(start?, end?)

Returns a **shallow copy** of a portion from `start` (inclusive) to `end` (**exclusive**). Does **not** mutate.

```javascript
const full = [0, 1, 2, 3, 4];
const part = full.slice(1, 4);
console.log(part);                  // [1, 2, 3]
console.log(full);                  // unchanged

console.log(full.slice(-2));        // [3, 4] — last two
console.log(full.slice());          // shallow copy of entire array
```

### 2.7 concat(...values)

Returns a **new** array combining the original with arguments (arrays are flattened one level).

```javascript
const a = [1, 2];
const b = a.concat([3, 4], 5, [[6]]);
console.log(b);                     // [1, 2, 3, 4, 5, [6]]

// Original unchanged
console.log(a);                     // [1, 2]
```

### 2.8 Spread for Combining

Spread creates a new array literal; nested arrays are **not** flattened.

```javascript
const a = [1, 2];
const b = [3, 4];
const merged = [...a, ...b, 5];
console.log(merged);                // [1, 2, 3, 4, 5]

const nested = [...[1, 2], ...[[3, 4]]];
console.log(nested);                // [1, 2, [3, 4]]
```

---

## 3. Iteration Methods

All methods below (except notes) invoke the callback for **assigned** indices; **holes are skipped** in `forEach`, `map`, `filter`, etc.

### 3.1 forEach(callback, thisArg?)

Executes a function for each element. Returns **`undefined`**. Cannot be stopped with `break` (use `for`/`for...of` if you need to break).

```javascript
["a", "b", "c"].forEach((el, i, arr) => {
    console.log(i, el, arr.length);
});
// 0 a 3
// 1 b 3
// 2 c 3
```

### 3.2 map(callback, thisArg?)

Returns a **new array** of the same length (holes become holes in the result) with callback return values.

```javascript
const doubled = [1, 2, 3].map((n) => n * 2);
console.log(doubled);               // [2, 4, 6]

const objs = [{ v: 1 }, { v: 2 }].map((o) => o.v);
console.log(objs);                  // [1, 2]
```

### 3.3 filter(callback, thisArg?)

Returns a **new array** of elements where callback returns **truthy**.

```javascript
const nums = [1, 2, 3, 4, 5];
const evens = nums.filter((n) => n % 2 === 0);
console.log(evens);                 // [2, 4]
```

### 3.4 reduce(callback, initialValue?)

Reduces to a single value. Callback: `(accumulator, current, index, array) => nextAccumulator`.

```javascript
const sum = [1, 2, 3, 4].reduce((acc, n) => acc + n, 0);
console.log(sum);                   // 10

const max = [3, 1, 4, 1].reduce((a, b) => (a > b ? a : b));
console.log(max);                   // 4

// Without initial value: first element is initial accumulator
const nested = [[1], [2], [3]].reduce((acc, cur) => acc.concat(cur));
console.log(nested);                // [1, 2, 3]
```

### 3.5 reduceRight(callback, initialValue?)

Same as `reduce` but iterates **right to left**.

```javascript
const flat = [[0, 1], [2, 3], [4, 5]].reduceRight((acc, cur) => acc.concat(cur), []);
console.log(flat);                  // [4, 5, 2, 3, 0, 1]
```

### 3.6 every(callback, thisArg?)

Returns `true` if **every** element passes the test (empty array → `true`).

```javascript
console.log([2, 4, 6].every((n) => n % 2 === 0));   // true
console.log([2, 3, 6].every((n) => n % 2 === 0));   // false
```

### 3.7 some(callback, thisArg?)

Returns `true` if **at least one** element passes (empty array → `false`).

```javascript
console.log([1, 3, 4].some((n) => n % 2 === 0));  // true
console.log([1, 3, 5].some((n) => n % 2 === 0));  // false
```

### 3.8 find(callback, thisArg?)

Returns the **first element** that satisfies the callback, or `undefined`.

```javascript
const users = [{ id: 1 }, { id: 2 }];
const u = users.find((x) => x.id === 2);
console.log(u);                     // { id: 2 }
```

### 3.9 findIndex(callback, thisArg?)

Returns the **index** of the first match, or **-1**.

```javascript
const idx = [10, 20, 30].findIndex((n) => n > 15);
console.log(idx);                   // 1
```

### 3.10 findLast(callback, thisArg?) — ES2023

Like `find`, but searches from the **end**.

```javascript
const nums = [1, 2, 3, 2, 1];
const lastEven = nums.findLast((n) => n % 2 === 0);
console.log(lastEven);              // 2
```

### 3.11 findLastIndex(callback, thisArg?) — ES2023

Like `findIndex`, but from the **end**; returns **-1** if none.

```javascript
const nums = [1, 2, 3, 2, 1];
const i = nums.findLastIndex((n) => n === 2);
console.log(i);                     // 3
```

> **Note:** For older runtimes, polyfill `findLast` / `findLastIndex` or use a reverse loop.

---

## 4. Searching Methods

### 4.1 indexOf(searchElement, fromIndex?)

First index at which `searchElement` appears, using **Strict Equality** (`===`). Returns **-1** if not found.

```javascript
const arr = [1, 2, 3, 2, 1];
console.log(arr.indexOf(2));        // 1
console.log(arr.indexOf(2, 2));     // 3 — start search at index 2
console.log(arr.indexOf(99));       // -1
```

### 4.2 lastIndexOf(searchElement, fromIndex?)

Last index; search runs **backward** from `fromIndex` (default `length - 1`).

```javascript
const arr = [1, 2, 3, 2, 1];
console.log(arr.lastIndexOf(2));    // 3
console.log(arr.lastIndexOf(2, 2)); // 1
```

### 4.3 includes(searchElement, fromIndex?) — ES2016

Returns **`true`**/`false`**. Uses `SameValueZero` (treats `NaN` as findable, unlike `indexOf`).

```javascript
console.log([1, 2, 3].includes(2));           // true
console.log([NaN].includes(NaN));             // true
console.log([1, 2, 3].includes(2, 2));      // false — from index 2
```

---

## 5. Sorting and Reversing

### 5.1 sort(compareFn?)

**Sorts in place** and returns the **same** array reference. Default sort converts elements to **strings** and compares UTF-16 code units (often wrong for numbers).

```javascript
const words = ["banana", "apple", "Cherry"];
words.sort();
console.log(words);                 // ["Cherry", "apple", "banana"] — case-sensitive Unicode order

const nums = [10, 2, 1, 20];
nums.sort();
console.log(nums);                  // [1, 10, 2, 20] — string sort!
```

### 5.2 Custom Compare Functions

Return **negative** if `a` before `b`, **positive** if `a` after `b`, **0** if equal.

```javascript
const nums = [10, 2, 1, 20];
nums.sort((a, b) => a - b);         // ascending numeric
console.log(nums);                  // [1, 2, 10, 20]

nums.sort((a, b) => b - a);         // descending
console.log(nums);                  // [20, 10, 2, 1]

const people = [{ name: "Bob" }, { name: "Alice" }];
people.sort((a, b) => a.name.localeCompare(b.name));
console.log(people.map((p) => p.name));  // ["Alice", "Bob"]
```

### 5.3 reverse()

**Reverses in place**; returns the same array.

```javascript
const a = [1, 2, 3];
a.reverse();
console.log(a);                     // [3, 2, 1]
```

### 5.4 Stable vs Unstable Sorting

Since **ECMAScript 2019**, `Array.prototype.sort` is required to be **stable**: equal elements (per compare function) keep their **relative order**.

```javascript
const items = [
    { key: "a", order: 1 },
    { key: "b", order: 2 },
    { key: "a", order: 3 }
];
items.sort((x, y) => x.key.localeCompare(y.key));
// Both "a" entries stay in original relative order: order 1 before 3
console.log(items.map((i) => i.order));  // [1, 3, 2]
```

---

## 6. Transformation and Static Methods

### 6.1 flat(depth?) — ES2019

Flattens nested arrays up to `depth` (default **1**). `Infinity` flattens all levels.

```javascript
const nested = [1, [2, [3, [4]]]];
console.log(nested.flat());         // [1, 2, [3, [4]]]
console.log(nested.flat(2));        // [1, 2, 3, [4]]
console.log(nested.flat(Infinity)); // [1, 2, 3, 4]
```

### 6.2 flatMap(callback, thisArg?) — ES2019

Equivalent to `map` followed by `flat(1)` — one level flatten only.

```javascript
const sentences = ["hello world", "foo bar"];
const words = sentences.flatMap((s) => s.split(" "));
console.log(words);                 // ["hello", "world", "foo", "bar"]

const dup = [1, 2, 3].flatMap((n) => [n, n]);
console.log(dup);                   // [1, 1, 2, 2, 3, 3]
```

### 6.3 Array.from(arrayLike, mapFn?, thisArg?)

Creates a new array from an **iterable** or **array-like** object. Optional second argument maps like `map`.

```javascript
console.log(Array.from("abc"));     // ["a", "b", "c"]

const range = Array.from({ length: 5 }, (_, i) => i);
console.log(range);                 // [0, 1, 2, 3, 4]

const doubled = Array.from([1, 2, 3], (n) => n * 2);
console.log(doubled);               // [2, 4, 6]
```

### 6.4 Array.of(...elements)

Creates an array from arguments — avoids the `new Array(3)` single-number trap.

```javascript
console.log(Array.of(7));           // [7]
console.log(new Array(7).length);   // 7 empty slots
```

### 6.5 join(separator?)

Joins elements into a **string**; default separator is comma.

```javascript
console.log([1, 2, 3].join());      // "1,2,3"
console.log([1, 2, 3].join("-"));   // "1-2-3"
console.log([].join());             // ""
```

### 6.6 toString()

Same as `join(",")` for arrays (inherited pattern from `Object`).

```javascript
console.log([1, true, "x"].toString());  // "1,true,x"
```

---

## 7. Copying Arrays and Elements

### 7.1 Shallow Copy

A **shallow** copy duplicates the **array structure**; **nested objects/arrays** are still **shared references**.

```javascript
const inner = [1];
const original = [inner, 2];
const copy = [...original];

copy[0].push(99);
console.log(original[0]);           // [1, 99] — same inner array
copy[1] = 200;
console.log(original[1]);           // 2 — primitive copied by value in the new array slot
```

### 7.2 Deep Copy

**Deep** copy duplicates nested structures. Common approaches: `structuredClone` (modern), `JSON.parse(JSON.stringify())` (limited — no functions, dates lose type, etc.), or libraries.

```javascript
const data = { a: 1, b: { c: 2 } };
const deep = structuredClone(data);
deep.b.c = 99;
console.log(data.b.c);              // 2

// JSON caveat
const withDate = { d: new Date() };
const jsonCopy = JSON.parse(JSON.stringify(withDate));
console.log(jsonCopy.d instanceof Date);  // false — becomes string
```

### 7.3 copyWithin(target, start, end?)

**Mutates** the array by copying a slice to `target` position (overlapping regions handled per spec).

```javascript
const a = [1, 2, 3, 4, 5];
a.copyWithin(0, 3);
console.log(a);                     // [4, 5, 3, 4, 5]

const b = [1, 2, 3, 4, 5];
b.copyWithin(0, -2, -1);
console.log(b);                     // [4, 2, 3, 4, 5]
```

### 7.4 Spread Operator for Copy

```javascript
const src = [1, 2, 3];
const clone = [...src];
console.log(clone);                 // [1, 2, 3]
console.log(clone === src);         // false
```

---

## 8. Typed Arrays and Binary Data

Typed arrays provide **array-like** views over raw binary buffers — essential for WebGL, files, sockets, and performance-critical numeric work.

### 8.1 ArrayBuffer

A **fixed-length** raw binary data holder. Read/write through **views** (`TypedArray` or `DataView`).

```javascript
const buffer = new ArrayBuffer(8);  // 8 bytes
console.log(buffer.byteLength);     // 8
```

### 8.2 Int8Array

8-bit signed integers per element.

```javascript
const i8 = new Int8Array(4);
i8[0] = 127;
i8[1] = -128;
console.log(i8);                    // Int8Array [127, -128, 0, 0]
```

### 8.3 Uint8Array

8-bit unsigned (0–255). Often used with binary data and `TextEncoder`/`TextDecoder`.

```javascript
const u8 = new Uint8Array([255, 0, 128]);
console.log(u8[0]);                 // 255
```

### 8.4 Float32Array and Float64Array

IEEE 754 floating-point views.

```javascript
const f32 = new Float32Array([1.5, 2.5]);
const f64 = new Float64Array([1.5, 2.5]);
console.log(f32.BYTES_PER_ELEMENT); // 4
console.log(f64.BYTES_PER_ELEMENT); // 8
```

### 8.5 DataView

Read/write **heterogeneous** types at arbitrary byte offsets with explicit endianness.

```javascript
const buf = new ArrayBuffer(8);
const view = new DataView(buf);
view.setInt16(0, 256, true);        // little-endian
console.log(view.getInt16(0, true)); // 256
```

---

## 9. Array-like Objects

### 9.1 Understanding Array-like Objects

An **array-like** object has indexed properties (`0`, `1`, …) and a `length` property, but is **not** necessarily an `Array` — no `push`, `map`, etc., unless inherited.

```javascript
const like = { 0: "a", 1: "b", length: 2 };
console.log(Array.isArray(like));   // false
// like.map is undefined
```

### 9.2 Converting to Arrays

```javascript
const like = { 0: "x", 1: "y", length: 2 };
console.log(Array.from(like));      // ["x", "y"]

// NodeList in browser:
// const nodes = document.querySelectorAll("div");
// const arr = [...nodes];
// const arr2 = Array.from(nodes);
```

### 9.3 arguments Object (non-arrow functions)

Legacy **`arguments`** is array-like (and iterable in modern engines) but not an array.

```javascript
function legacy() {
    const args = Array.from(arguments);
    console.log(args);              // true array
}
legacy(1, 2, 3);

// Prefer rest parameters
function modern(...args) {
    console.log(args);
}
modern(1, 2, 3);
```

### 9.4 NodeList

DOM APIs like `querySelectorAll` return **NodeList** — often iterable; convert when you need array methods.

```javascript
// In browser only:
// const list = document.querySelectorAll("p");
// Array.from(list).forEach((el) => el.classList.add("read"));
```

---

## 10. Advanced Topics

### 10.1 Destructuring Arrays

Unpack elements into variables; use **rest** for the remainder, **defaults** for missing values.

```javascript
const [first, second, ...rest] = [1, 2, 3, 4];
console.log(first, second, rest);   // 1 2 [3, 4]

const [a = 0, b = 0] = [1];
console.log(a, b);                  // 1 0

let x = 1, y = 2;
[y, x] = [x, y];
console.log(x, y);                  // 2 1
```

### 10.2 Performance Optimization

- Prefer **`for` loops** or **indexed `for`** for hot paths over many method callbacks
- **`push`/`pop`** on the end is cheaper than **`shift`/`unshift`** (re-indexing)
- Pre-allocate or reuse arrays in tight loops when profiling shows benefit
- **`TypedArray`** for large homogeneous numeric data

```javascript
// Fast sum in hot path (example)
function sumFast(nums) {
    let s = 0;
    for (let i = 0; i < nums.length; i++) s += nums[i];
    return s;
}
```

### 10.3 Immutability Patterns

Avoid mutating source arrays when building predictable state (e.g. React/Redux).

```javascript
const items = [1, 2, 3];
const added = [...items, 4];
const updated = items.map((n, i) => (i === 1 ? 99 : n));
const removed = items.filter((n) => n !== 2);
console.log(items);                 // [1, 2, 3] — unchanged
```

### 10.4 Method Chaining

Many methods return new arrays (`map`, `filter`, `slice`) or the same array (`sort`, `reverse`); chain accordingly.

```javascript
const result = [1, 2, 3, 4, 5]
    .filter((n) => n % 2 === 0)
    .map((n) => n * 10)
    .reduce((a, b) => a + b, 0);
console.log(result);                // 60  (20 + 40)
```

### 10.5 toReversed() — ES2023

**Non-mutating** reverse; returns a **new** array.

```javascript
const a = [1, 2, 3];
const b = a.toReversed();
console.log(a);                     // [1, 2, 3]
console.log(b);                     // [3, 2, 1]
```

### 10.6 toSorted(compareFn?) — ES2023

**Non-mutating** sort; returns a **new** array.

```javascript
const a = [3, 1, 2];
const b = a.toSorted((x, y) => x - y);
console.log(a);                     // [3, 1, 2]
console.log(b);                     // [1, 2, 3]
```

### 10.7 toSpliced(start, deleteCount, ...items) — ES2023

**Non-mutating** splice; returns a **new** array.

```javascript
const a = [1, 2, 3, 4];
const b = a.toSpliced(1, 2, 99);
console.log(a);                     // [1, 2, 3, 4]
console.log(b);                     // [1, 99, 4]
```

### 10.8 with(index, value) — ES2023

Returns a **new** array with the element at `index` replaced.

```javascript
const a = [1, 2, 3];
const b = a.with(1, 42);
console.log(a);                     // [1, 2, 3]
console.log(b);                     // [1, 42, 3]
```

---

## Best Practices

1. **Prefer array literals** (`[]`) and **`Array.of`** over `new Array(n)` when you mean “list of values,” not “length n.”
2. **Use `===` awareness** with `indexOf` / `includes` (`includes` finds `NaN`; `indexOf` does not).
3. **Pass compare functions** to `sort` for numbers; never rely on default sort for numeric data.
4. **Prefer immutable patterns** (`spread`, `toSorted`, `toSpliced`, `with`, `toReversed`) when sharing state or avoiding side effects.
5. **Know hole behavior**: `forEach`/`map` skip holes; `for` loops visit `undefined` for missing indices inconsistently — avoid sparse arrays when possible.
6. **Convert array-likes** with `Array.from` or spread (if iterable) before using array methods.
7. **Choose the right tool**: `find` stops early; `filter` scans all — use `find` for first match.
8. **Document ES2023** usage (`findLast`, `toSorted`, etc.) if your minimum engine version is older; add transpilation or polyfills as needed.

---

## Common Mistakes to Avoid

### ❌ Don’t:

1. **Using default `sort()` for numbers**
   ```javascript
   // BAD
   [10, 2, 1].sort();  // [1, 10, 2]

   // GOOD
   [10, 2, 1].sort((a, b) => a - b);
   ```

2. **Expecting `map`/`filter` to mutate the original**
   ```javascript
   const nums = [1, 2, 3];
   nums.map((n) => n * 2);           // result ignored!
   const doubled = nums.map((n) => n * 2);
   ```

3. **Confusing holes with `undefined`**
   ```javascript
   const a = [, 1];
   console.log(0 in a);              // false — hole at 0
   const b = [undefined, 1];
   console.log(0 in b);              // true
   ```

4. **Shallow copying when you need deep copy**
   ```javascript
   const src = [{ x: 1 }];
   const bad = [...src];
   bad[0].x = 99;
   console.log(src[0].x);            // 99 — shared object

   const good = structuredClone(src);
   good[0].x = 0;
   console.log(src[0].x);            // 99
   ```

5. **Using `forEach` when you need to stop early**
   ```javascript
   // Use for...of + break, or some/every/find
   const firstBig = [1, 5, 10].find((n) => n > 4);
   ```

6. **Mutating during iteration** (can skip elements or behave unexpectedly)
   ```javascript
   const arr = [1, 2, 3, 4];
   // Risky: splicing while iterating forward
   // Safer: iterate copy, or build new array, or loop backward
   ```

7. **Relying on `==` with `includes`** — `includes` uses `SameValueZero`, but mixing `null`/`undefined` in searches still deserves explicit checks.

---

## Comparison Table

### Mutation vs New Array

| Method / Pattern   | Mutates original? | Returns              |
|--------------------|-------------------|----------------------|
| `push` / `pop`     | Yes               | length / element     |
| `shift` / `unshift`| Yes               | element / length     |
| `splice`           | Yes               | removed elements     |
| `sort` / `reverse` | Yes               | same array           |
| `copyWithin`       | Yes               | same array           |
| `slice`            | No                | new array (shallow)  |
| `concat` / spread  | No                | new array            |
| `map` / `filter`   | No                | new array            |
| `toSorted`         | No                | new array (ES2023)   |
| `toReversed`       | No                | new array (ES2023)   |
| `toSpliced`        | No                | new array (ES2023)   |
| `with`             | No                | new array (ES2023)   |

### Searching Methods

| Method           | Returns              | Equality / notes        |
|------------------|----------------------|-------------------------|
| `indexOf`        | index or `-1`        | `===`                   |
| `lastIndexOf`    | index or `-1`        | `===`, from end         |
| `includes`       | boolean              | `SameValueZero`, finds `NaN` |
| `find`           | element or `undefined` | callback            |
| `findIndex`      | index or `-1`        | callback                |
| `findLast`       | element or `undefined` | callback, ES2023    |
| `findLastIndex`  | index or `-1`        | callback, ES2023        |

### Iteration: Return Values

| Method        | Return value        |
|---------------|---------------------|
| `forEach`     | `undefined`         |
| `map`         | new array           |
| `filter`      | new array           |
| `reduce`      | accumulated value   |
| `some` / `every` | boolean          |
| `find` / `findIndex` | element / index |

### Copying Strategies

| Approach           | Depth   | Notes                              |
|--------------------|---------|------------------------------------|
| `[...arr]`         | Shallow | Fast, idiomatic                    |
| `slice()`          | Shallow | Same                               |
| `concat()`         | Shallow | Same                               |
| `Array.from(arr)`  | Shallow | Also maps / from iterables         |
| `structuredClone`| Deep    | Modern; some types unsupported     |
| `JSON` round-trip  | Deep    | Data-only; loses Date, Map, etc.   |

---

*This reference aligns with modern ECMAScript. Verify [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) and your target runtime for exact version support.*
