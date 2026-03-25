# JavaScript Collections

JavaScript provides specialized built-in collection types beyond plain objects and arrays. **Map** and **Set** (ES2015) give you predictable key–value storage and unique-value membership with iteration order guarantees. **WeakMap** and **WeakSet** hold *weak* references so values can be garbage-collected when nothing else references them—ideal for metadata and private-like associations without leaking memory. This guide covers creation, APIs, iteration, performance trade-offs, and practical patterns.

---

## 📑 Table of Contents

1. [Map (ES6)](#1-map-es6)
2. [Set (ES6)](#2-set-es6)
3. [WeakMap and WeakSet](#3-weakmap-and-weakset)
4. [Collection Performance](#4-collection-performance)
5. [Advanced Patterns](#5-advanced-patterns)
6. [Best Practices](#best-practices)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Map (ES6)

A **Map** is a collection of key–value pairs where keys can be of *any* type (including objects, functions, symbols). Iteration order follows insertion order.

### Creating Maps

```javascript
// Empty map
const m1 = new Map();

// From iterable of [key, value] pairs
const m2 = new Map([
  ['name', 'Ada'],
  ['year', 1815],
]);

// Clone shallowly (same key/value references)
const m3 = new Map(m2);

// From object (static method, ES2019+)
const m4 = new Map(Object.entries({ a: 1, b: 2 }));
```

### Map methods: `set`, `get`, `has`, `delete`, `clear`

```javascript
const userScores = new Map();

// set(key, value) — returns the map (chainable)
userScores.set('alice', 100).set('bob', 85);

// get(key) — undefined if missing
console.log(userScores.get('alice')); // 100
console.log(userScores.get('nobody')); // undefined

// has(key)
console.log(userScores.has('bob')); // true

// delete(key) — returns boolean
console.log(userScores.delete('bob')); // true
console.log(userScores.delete('bob')); // false

// clear() — removes all entries
userScores.clear();
console.log(userScores.size); // 0
```

### Map vs Object

| Aspect | Map | Plain Object |
|--------|-----|--------------|
| Key types | Any | String / Symbol (plus special cases) |
| Size | `.size` in O(1)-ish | `Object.keys(o).length` |
| Default keys | No inherited keys | Prototype chain / `__proto__` pitfalls |
| Iteration | Built-in iterators, insertion order | `for...in` + `hasOwnProperty` or `Object.*` |
| JSON | Not serializable as Map | Native `JSON.stringify` |

```javascript
const obj = {};
obj['10'] = 'ten';
obj[10] = 'number ten'; // same key as '10' after string coercion

const map = new Map();
map.set('10', 'ten');
map.set(10, 'number ten');
console.log(map.size); // 2 — distinct keys

// Objects often need null prototype for “pure” key bags
const safe = Object.create(null);
safe.foo = 1;
```

### Map iteration

```javascript
const m = new Map([
  ['x', 1],
  ['y', 2],
]);

// for...of yields [key, value]
for (const [k, v] of m) {
  console.log(k, v);
}

// Explicit iterators
for (const k of m.keys()) console.log('key', k);
for (const v of m.values()) console.log('value', v);
for (const entry of m.entries()) console.log(entry);

// forEach((value, key, map) => ...)
m.forEach((value, key) => {
  console.log(key, value);
});

// Spread to array of entries
console.log([...m]); // [['x',1], ['y',2]]
```

### Map size

```javascript
const counts = new Map();
counts.set('a', 1);
counts.set('b', 2);
console.log(counts.size); // 2

// set on existing key does not increase size
counts.set('a', 99);
console.log(counts.size); // still 2
```

### Map keys (any type)

```javascript
const keyObj = { id: 1 };
const keyFn = () => {};
const keySym = Symbol('k');

const data = new Map();
data.set(keyObj, 'metadata for object');
data.set(keyFn, 'metadata for function');
data.set(keySym, 'symbol key');

console.log(data.get(keyObj)); // works with same reference
console.log(data.get(keySym));

// Two different object literals are different keys
data.set({ id: 2 }, 'lost unless you keep reference');
console.log(data.get({ id: 2 })); // undefined
```

### WeakMap

A **WeakMap** only accepts **object** (or registered symbol in some engines) keys. Keys are held *weakly*: if nothing else references the key object, it can be collected and the entry disappears.

```javascript
const wm = new WeakMap();

const el = { tag: 'div' };
wm.set(el, { listeners: [] });

console.log(wm.has(el)); // true
// If `el` goes out of scope and is unreferenced, GC may remove the entry

// No .size, no clear, not iterable
// wm.set(1, 'x'); // TypeError in strict ordinary use (non-object key)
```

```javascript
// Typical pattern: associate private data with instances
const privateData = new WeakMap();

class Counter {
  constructor() {
    privateData.set(this, { n: 0 });
  }
  inc() {
    const s = privateData.get(this);
    s.n += 1;
    return s.n;
  }
}
```

---

## 2. Set (ES6)

A **Set** stores **unique** values (by `SameValueZero` equality: like `===` but treats `NaN` equal to `NaN). Insertion order is preserved for iteration.

### Creating Sets

```javascript
const s1 = new Set();

const s2 = new Set([1, 2, 2, 3]); // {1, 2, 3}

const s3 = new Set('hello'); // {'h','e','l','o'}

// From Map keys or values
const m = new Map([['a', 1], ['b', 2]]);
const keysOnly = new Set(m.keys());
```

### Set methods: `add`, `has`, `delete`, `clear`

```javascript
const tags = new Set();

tags.add('js');
tags.add('web');
tags.add('js'); // duplicate ignored

console.log(tags.has('web')); // true
console.log(tags.delete('web')); // true
console.log(tags.size); // 1

tags.clear();
console.log(tags.size); // 0
```

### Set vs Array

```javascript
// Array: allows duplicates, index-based
const arr = [1, 1, 2];
arr.push(2);

// Set: uniqueness by value semantics
const set = new Set([1, 1, 2]);
set.add(2);
console.log(set.size); // 2

// Dedupe an array
const unique = [...new Set([1, 2, 2, 3])];
```

### Set iteration

```javascript
const s = new Set(['a', 'b', 'c']);

for (const v of s) console.log(v);

s.forEach((value, valueAgain, set) => {
  // value === valueAgain (Set API mirrors Map)
  console.log(value);
});

console.log([...s.keys()]);   // same as values for Set
console.log([...s.values()]);
console.log([...s.entries()]); // [value, value] pairs
```

### Set size

```javascript
const ids = new Set();
ids.add(10);
ids.add(20);
console.log(ids.size); // 2
```

### Set operations: Union, Intersection, Difference

```javascript
function union(a, b) {
  return new Set([...a, ...b]);
}

function intersection(a, b) {
  return new Set([...a].filter((x) => b.has(x)));
}

function difference(a, b) {
  return new Set([...a].filter((x) => !b.has(x)));
}

function symmetricDifference(a, b) {
  return new Set([
    ...[...a].filter((x) => !b.has(x)),
    ...[...b].filter((x) => !a.has(x)),
  ]);
}

const A = new Set([1, 2, 3]);
const B = new Set([2, 3, 4]);

console.log([...union(A, B)]);           // [1,2,3,4]
console.log([...intersection(A, B)]);  // [2,3]
console.log([...difference(A, B)]);    // [1]
```

### WeakSet

**WeakSet** holds only **objects** (weakly). Like WeakMap: no size, not iterable, no arbitrary enumeration.

```javascript
const visited = new WeakSet();

function traverse(node) {
  if (visited.has(node)) return;
  visited.add(node);
  // ... walk children
}

const n1 = {};
const n2 = {};
visited.add(n1);
console.log(visited.has(n1)); // true
console.log(visited.has(n2)); // false
```

```javascript
// Mark authorized instances without a property anyone can forge
const canEdit = new WeakSet();

class Document {
  authorize(user) {
    canEdit.add(user);
  }
  edit(user) {
    if (!canEdit.has(user)) throw new Error('Forbidden');
    // ...
  }
}
```

---

## 3. WeakMap and WeakSet

### Basics

- **WeakMap**: weak keys → values. Keys must be objects (or registered symbols where supported).
- **WeakSet**: weak membership of objects only.
- Neither exposes `.size`, `.keys()`, or `clear()` in the standard API—because the engine cannot reliably report live weak collections without forcing GC or leaking implementation details.

```javascript
const wm = new WeakMap();
const ws = new WeakSet();
const o = {};

wm.set(o, { data: 1 });
ws.add(o);

console.log(wm.get(o)); // { data: 1 }
console.log(ws.has(o)); // true
```

### Use cases

| Tool | Typical use |
|------|-------------|
| WeakMap | Private data, metadata on DOM nodes, caching by object identity |
| WeakSet | “Seen” sets, branding instances, deduping object graphs without retaining |

```javascript
// Cache expensive computation results keyed by object identity
const cache = new WeakMap();

function computeConfig(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = { /* heavy work using obj */ };
  cache.set(obj, result);
  return result;
}
```

### Limitations

```javascript
// Not iterable — cannot list keys or values
const wm = new WeakMap();
// for (const x of wm) {} // TypeError

// Cannot use primitive keys in WeakMap / WeakSet (ordinary usage)
// const wm2 = new WeakMap();
// wm2.set('id', 1); // TypeError

// No JSON serialization of weak collections as a concept
```

### Garbage collection (conceptual)

Weak references do not prevent their referent from being collected. When an object is only reachable through a WeakMap key or WeakSet entry, the runtime may reclaim it; the corresponding entry then disappears as if `delete` had run.

```javascript
function demo() {
  const wm = new WeakMap();
  let o = { id: 1 };
  wm.set(o, 'meta');
  o = null; // object may be collected; entry may vanish
}
// You cannot observe GC timing in plain JS — no “onCollected” callback in the language
```

---

## 4. Collection Performance

Exact timings depend on engine, size, and workload. These are **rule-of-thumb** comparisons for typical hot paths.

### Map vs Object

- **Frequent add/delete**: Map is designed for dynamic key–value churn; objects can be fine too but Map avoids prototype / string-key coercion surprises.
- **Fixed string keys, JSON round-trip**: Plain objects are natural and fast for serialization.
- **Non-string keys**: Map is the right abstraction.

```javascript
// Micro-pattern: counting with Map
function countOccurrences(items) {
  const m = new Map();
  for (const item of items) {
    m.set(item, (m.get(item) ?? 0) + 1);
  }
  return m;
}
```

### Set vs Array

- **Membership tests**: `set.has(x)` is typically **O(1)** average; `array.includes(x)` is **O(n)**.
- **Uniqueness**: Set enforces uniqueness on insert; array requires manual checks or post-pass dedupe.

```javascript
const n = 100_000;
const arr = Array.from({ length: n }, (_, i) => i);
const set = new Set(arr);

const target = n - 1;

console.time('array includes');
arr.includes(target);
console.timeEnd('array includes');

console.time('set has');
set.has(target);
console.timeEnd('set has');
```

### When to use each

| Need | Prefer |
|------|--------|
| Unique values, fast `has` | Set |
| Key–value, any key type | Map |
| JSON API / config blob | Object |
| Private metadata tied to object identity | WeakMap |
| “Is this object branded/seen?” without retaining | WeakSet |

### Memory

- **Map/Set** hold **strong** references to keys and values (Set: values only)—they prevent GC of those values while the collection lives.
- **WeakMap/WeakSet** do **not** keep key objects alive by themselves; values in a WeakMap are strongly reachable *only while the key is strongly reachable* (simplified: if the key is collected, the entry goes away).

```javascript
// Strong Set retains objects until cleared or removed
const strong = new Set();
let o = {};
strong.add(o);
o = null; // {} may still live inside `strong`

const weak = new WeakSet();
let p = {};
weak.add(p);
p = null; // object may be collected; weak set won't keep it
```

---

## 5. Advanced Patterns

### Chaining

```javascript
const m = new Map()
  .set('a', 1)
  .set('b', 2);

const pipeline = new Set()
  .add('read')
  .add('parse')
  .add('validate');
```

### Filtering

```javascript
const m = new Map([
  ['x', 1],
  ['y', 2],
  ['z', 3],
]);

const evens = new Map(
  [...m].filter(([, v]) => v % 2 === 0),
);

const s = new Set([1, 2, 3, 4, 5]);
const small = new Set([...s].filter((n) => n < 4));
```

### Converting

```javascript
const obj = { a: 1, b: 2 };
const mapFromObj = new Map(Object.entries(obj));
const objFromMap = Object.fromEntries(mapFromObj);

const arr = [1, 2, 2, 3];
const setFromArr = new Set(arr);
const arrFromSet = [...setFromArr];

// Map from two parallel arrays (same length)
const keys = ['a', 'b'];
const vals = [10, 20];
const zipMap = new Map(keys.map((k, i) => [k, vals[i]]));
```

### Nested collections

```javascript
// Map of Sets: adjacency-style structure
const graph = new Map();

function addEdge(from, to) {
  if (!graph.has(from)) graph.set(from, new Set());
  graph.get(from).add(to);
}

addEdge('A', 'B');
addEdge('A', 'C');
console.log([...graph.get('A')]); // ['B','C'] (order: insertion)

// Map of Maps
const table = new Map();
function cell(row, col, value) {
  if (!table.has(row)) table.set(row, new Map());
  table.get(row).set(col, value);
}
cell(0, 1, 'x');
console.log(table.get(0).get(1)); // 'x'
```

### Serialization

```javascript
// Maps are not JSON-native; convert for transport
function mapToJSON(m) {
  return JSON.stringify([...m]);
}

function jsonToMap(json) {
  return new Map(JSON.parse(json));
}

const original = new Map([
  ['name', 'Ada'],
  ['scores', [10, 9]],
]);
const roundTrip = jsonToMap(mapToJSON(original));
console.log(roundTrip.get('name')); // Ada

// Object keys in JSON are always strings — non-string Map keys need a custom format
const tricky = new Map();
tricky.set(1, 'one');
tricky.set(true, 'true');
// JSON.stringify(Object.fromEntries(tricky)) loses key types
```

### Immutability

```javascript
function setImmutableAdd(s, v) {
  return new Set([...s, v]);
}

function mapImmutableSet(m, k, v) {
  return new Map([...m, [k, v]]);
}

const s0 = new Set([1, 2]);
const s1 = setImmutableAdd(s0, 3);
console.log([...s0], [...s1]); // [1,2] vs [1,2,3]

const m0 = new Map([['a', 1]]);
const m1 = mapImmutableSet(m0, 'b', 2);
```

```javascript
// Structural sharing pattern: copy-on-write for nested map of sets
function addToIndex(index, key, item) {
  const next = new Map(index);
  const prevSet = next.get(key) ?? new Set();
  next.set(key, new Set([...prevSet, item]));
  return next;
}
```

---

## Best Practices

1. **Use Map** when keys are not always strings, or when you care about insertion order and a clean `.size` without `Object.keys`.
2. **Use Set** for uniqueness and fast membership; **dedupe** with `[...new Set(arr)]` when order should follow first occurrence.
3. **Prefer WeakMap/WeakSet** for caches, private fields, or branding tied to object identity so you do not leak memory after instances become unreachable.
4. **Avoid using plain objects as Map keys** inside a Map unless you keep a stable reference—two literals are never the same key.
5. **Document serialization**: convert Map/Set to arrays or objects before `JSON.stringify`, and define a schema if key types are not strings.
6. **Choose the right default**: config and API payloads → Object; algorithms and DOM metadata → Map/Set/Weak* as appropriate.

---

## Common Mistakes to Avoid

1. **Treating Map like a plain object** — use `.get` / `.set`, not bracket notation (`map['key']` creates regular object behavior only if you mistakenly use a plain object).
2. **Expecting JSON to round-trip Map/Set** — they serialize as `{}` or get dropped unless you convert explicitly.
3. **Using WeakMap with primitive keys** — results in `TypeError`; keys must be objects (in typical code).
4. **Assuming WeakMap/WeakSet size or iteration** — the API intentionally omits these; you cannot list “all weak keys.”
5. **Forgetting `NaN` uniqueness in Set** — `Set` treats `NaN` as equal to `NaN` (only one `NaN` stored).
6. **Relying on object key order for *all* objects** — insertion order is defined for string/symbol keys in modern engines, but Map’s API is clearer for ordered key–value workflows.
7. **Holding large graphs in StrongMap/Set when identity-only association is needed** — prevents GC; consider WeakMap if the key should drive lifetime.
8. **Using `for...in` on Map** — it does not iterate entries; use `for...of` or `.forEach`.

---

*These notes reflect standard ECMAScript semantics as widely implemented in modern engines. Always verify edge-case behavior in your target runtime when shipping production code.*
