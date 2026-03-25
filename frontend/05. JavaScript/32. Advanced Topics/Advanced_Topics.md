# JavaScript Advanced Topics

This guide covers advanced JavaScript and runtime capabilities: metaprogramming with `Reflect` and `Proxy`, memory and performance considerations, workers and WASM, streams, internationalization, design patterns, tooling (Babel, TypeScript, ASTs), and Node.js fundamentals. Examples assume modern ECMAScript and browser or Node environments unless noted.

---

## 📑 Table of Contents

1. [Metaprogramming: Reflect, Proxy, and Descriptors](#1-metaprogramming-reflect-proxy-and-descriptors)
2. [Memory and Performance Deep Dive](#2-memory-and-performance-deep-dive)
3. [Web Workers, Service Workers, and Worklets](#3-web-workers-service-workers-and-worklets)
4. [WebAssembly (WASM)](#4-webassembly-wasm)
5. [Streams API](#5-streams-api)
6. [Internationalization (i18n)](#6-internationalization-i18n)
7. [Advanced Design Patterns](#7-advanced-design-patterns)
8. [Compilers and Transpilers](#8-compilers-and-transpilers)
9. [Node.js Specific Topics](#9-nodejs-specific-topics)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Metaprogramming: Reflect, Proxy, and Descriptors

Metaprogramming lets code observe and change its own structure and behavior. JavaScript exposes this through **property descriptors**, the **`Reflect`** API (default semantics for operations), and **`Proxy`** (intercept those operations).

### Property descriptors

Every object property has a descriptor: value/writable or get/set, plus `enumerable` and `configurable`.

```javascript
const obj = {};

Object.defineProperty(obj, 'x', {
  value: 1,
  writable: false,
  enumerable: true,
  configurable: false,
});

// Reading the descriptor (introspection)
console.log(Object.getOwnPropertyDescriptor(obj, 'x'));
// { value: 1, writable: false, enumerable: true, configurable: false }

Object.defineProperty(obj, 'computed', {
  get() {
    return this._c ?? 0;
  },
  set(v) {
    this._c = v;
  },
  enumerable: true,
  configurable: true,
});

obj.computed = 42;
console.log(obj.computed); // 42
```

```javascript
// Seal vs freeze vs preventExtensions
const a = { n: 1 };
Object.preventExtensions(a);
// a.newProp = 2; // strict mode: TypeError

const b = { n: 1 };
Object.seal(b); // cannot add/remove/reconfigure; can still change values if writable
b.n = 2;

const c = { n: 1 };
Object.freeze(c);
// c.n = 2; // strict mode: TypeError (non-writable in practice for data props)
```

### Reflect API

`Reflect` mirrors internal `[[...]]` operations and returns booleans or values instead of throwing in some cases (e.g. `Reflect.set` on a non-writable property returns `false`).

```javascript
const target = { a: 1, b: 2 };

Reflect.get(target, 'a'); // 1
Reflect.get(target, 'missing', target); // undefined

Reflect.set(target, 'a', 10);
console.log(target.a); // 10

Reflect.has(target, 'b'); // true (like 'b' in target)
Reflect.deleteProperty(target, 'b'); // true
console.log('b' in target); // false

Reflect.ownKeys(target); // ['a'] after delete (order: strings, then symbols)

const sum = (a, b) => a + b;
const result = Reflect.apply(sum, null, [3, 4]); // 7

function Person(name) {
  this.name = name;
}
const p = Reflect.construct(Person, ['Ada'], Person);
console.log(p instanceof Person); // true
console.log(p.name); // Ada

Reflect.defineProperty(target, 'readOnly', {
  value: 99,
  writable: false,
  enumerable: true,
  configurable: true,
});

Reflect.preventExtensions(target);
console.log(Reflect.isExtensible(target)); // false
```

```javascript
// Reflect.getPrototypeOf / setPrototypeOf
const proto = { inherited: true };
const o = Object.create(proto);
console.log(Reflect.getPrototypeOf(o) === proto); // true
```

### Proxy: handler traps

A `Proxy` wraps a **target** object. The **handler** can implement **traps** that run before forwarding (or replacing) the default behavior.

```javascript
const user = { name: 'Sam', _secret: 'hidden' };

const loggedUser = new Proxy(user, {
  get(target, prop, receiver) {
    if (prop.startsWith('_')) {
      return undefined;
    }
    console.log(`get ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    if (prop.startsWith('_')) {
      return false;
    }
    return Reflect.set(target, prop, value, receiver);
  },
  has(target, prop) {
    if (String(prop).startsWith('_')) return false;
    return Reflect.has(target, prop);
  },
  deleteProperty(target, prop) {
    if (String(prop).startsWith('_')) return false;
    return Reflect.deleteProperty(target, prop);
  },
});

console.log('name' in loggedUser); // true
console.log('_secret' in loggedUser); // false
```

```javascript
// apply trap — for callable targets (functions)
function greet(who) {
  return `Hello, ${who}`;
}

const wrapped = new Proxy(greet, {
  apply(target, thisArg, argList) {
    console.log('called with', argList);
    return Reflect.apply(target, thisArg, argList).toUpperCase();
  },
});

console.log(wrapped('world')); // HELLO, WORLD
```

```javascript
// construct trap — for constructor calls with `new`
function Box(w) {
  this.w = w;
}

const ProxiedBox = new Proxy(Box, {
  construct(target, argList, newTarget) {
    const instance = Reflect.construct(target, argList, newTarget);
    instance.createdAt = Date.now();
    return instance;
  },
});

const b = new ProxiedBox(10);
console.log(b.w, b.createdAt);
```

### Object introspection summary

```javascript
const o = { x: 1 };
Object.defineProperty(o, 'y', { value: 2, enumerable: false });
const s = Symbol('s');
o[s] = 3;

Object.keys(o); // ['x'] — enumerable string keys only
Object.getOwnPropertyNames(o); // ['x', 'y']
Object.getOwnPropertySymbols(o); // [Symbol(s)]
Reflect.ownKeys(o); // ['x', 'y', Symbol(s)] — spec order

console.log(Object.getOwnPropertyDescriptors(o));
```

---

## 2. Memory and Performance Deep Dive

JavaScript engines (V8, SpiderMonkey, JavaScriptCore) manage memory automatically. Understanding the model helps you avoid leaks and slow paths.

### Garbage collection (conceptual)

**Mark-and-sweep:** From roots (globals, stack, registers), the runtime traces reachable objects and **marks** them. Unmarked objects are **swept** (freed). Cycles are handled; reachability matters, not reference counting alone.

**Generational hypothesis:** Most objects die young. **Young generation** is collected often (fast scavenging). Surviving objects are **promoted** to **old generation**, collected less frequently (often mark-compact or incremental/concurrent marking to reduce pauses).

**Orinoco / incremental / concurrent GC (V8-style):** Work is split so main-thread pauses stay short; some marking runs alongside your code.

```javascript
// No API to "free" an object — drop references and let GC reclaim
function makeLeak() {
  const cache = [];
  return function (item) {
    cache.push(item); // grows forever if never cleared — classic leak pattern
  };
}
// Prefer bounded caches, WeakMap for object-keyed metadata, clear intervals/listeners on teardown
```

### Memory profiling (browser)

- **Chrome DevTools → Memory:** heap snapshots, allocation timeline, detached DOM detection.
- Record snapshot → perform action → record again → compare retained size.

```javascript
// Chrome: expose heap size (non-standard, dev/debug)
if (performance.memory) {
  console.log({
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
  });
}
```

### Performance profiling

- **Performance panel:** flame charts, long tasks, scripting vs rendering time.
- **`performance.mark` / `measure`:** micro-benchmarks in code.

```javascript
performance.mark('task-start');
for (let i = 0; i < 1e6; i++) {
  Math.sqrt(i);
}
performance.mark('task-end');
performance.measure('sqrt-loop', 'task-start', 'task-end');
const entries = performance.getEntriesByName('sqrt-loop');
console.log(entries[0].duration);
```

### Benchmark testing

Use dedicated harnesses (e.g. **Benchmark.js**, **vitest bench**, **Node `perf_hooks`**) rather than one-off `Date.now()` loops — JIT warmup and variance matter.

```javascript
const { performance, PerformanceObserver } = require('node:perf_hooks');

performance.mark('A');
// ... work ...
performance.mark('B');
performance.measure('work', 'A', 'B');
console.log(performance.getEntriesByName('work')[0].duration);
```

```javascript
// Simple repeated timing (illustrative — use a real benchmark lib for conclusions)
function timeIt(fn, iterations = 1000) {
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return (performance.now() - t0) / iterations;
}
```

---

## 3. Web Workers, Service Workers, and Worklets

Workers run JavaScript off the main thread so UI stays responsive. They have separate globals and **no DOM** (except DOM stubs in some test envs).

### Dedicated worker

```javascript
// main.js
const worker = new Worker('worker.js', { type: 'module' });

worker.postMessage({ job: 'hash', payload: 'data' });

worker.onmessage = (ev) => {
  console.log('result', ev.data);
};

worker.onerror = (err) => {
  console.error(err.message);
};

worker.postMessage({ cmd: 'stop' });
// worker.terminate(); // hard stop from main thread
```

```javascript
// worker.js
self.onmessage = (ev) => {
  const { job, payload } = ev.data;
  if (job === 'hash') {
    // CPU-heavy work here
    const result = payload.split('').reverse().join('');
    self.postMessage({ ok: true, result });
  }
};
```

### SharedWorker (limited browser support; often avoided in favor of service workers or BroadcastChannel)

```javascript
// Conceptual: multiple tabs connect to one shared worker
// const shared = new SharedWorker('shared-worker.js');
// shared.port.start();
// shared.port.postMessage('hi');
// shared.port.onmessage = (e) => console.log(e.data);
```

### Service worker: lifecycle, fetch, caching

Service workers sit between the page and the network. They are **event-driven** and **async**.

**Lifecycle:** `install` → `activate` → idle → `fetch` / `push` / `sync` events. `skipWaiting()` and `clients.claim()` control takeover timing.

```javascript
// sw.js (service worker file)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('app-v1').then((cache) => cache.addAll(['/', '/styles.css', '/app.js']))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== 'app-v1').map((k) => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});
```

```javascript
// main app: registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((reg) => console.log('SW registered', reg.scope))
    .catch(console.error);
}
```

### Communication: structured clone and transferables

`postMessage` uses the **structured clone algorithm** (supports most objects, not functions). **Transferable** objects (e.g. `ArrayBuffer`) move ownership to the receiver — zero-copy style.

```javascript
const worker = new Worker('worker.js');

const buffer = new ArrayBuffer(16);
new Uint8Array(buffer).set([1, 2, 3]);

worker.postMessage({ buf: buffer }, [buffer]);
// buffer.byteLength === 0 in sender after transfer
```

```javascript
// worker.js
self.onmessage = (e) => {
  const { buf } = e.data;
  const view = new Uint8Array(buf);
  view[0] = 99;
  self.postMessage({ buf }, [buf]);
};
```

### Worklets (e.g. PaintWorklet, AudioWorklet)

Worklets are lightweight, **short-lived** script contexts with a strict API — used by CSS Houdini (paint/layout/animation) and Web Audio.

```javascript
// paint-worklet.js — registered in worklet global
registerPaint(
  'checker',
  class {
    static get inputProperties() {
      return ['--checker-size'];
    }
    paint(ctx, size, props) {
      const s = parseInt(props.get('--checker-size').toString(), 10) || 10;
      for (let y = 0; y < size.height; y += s) {
        for (let x = 0; x < size.width; x += s) {
          const on = ((x / s) + (y / s)) % 2 === 0;
          ctx.fillStyle = on ? '#ccc' : '#fff';
          ctx.fillRect(x, y, s, s);
        }
      }
    }
  }
);
```

```javascript
// main document
await CSS.paintWorklet.addModule('paint-worklet.js');
// Then use paint(checker) in CSS background: paint(checker);
```

---

## 4. WebAssembly (WASM)

**WebAssembly** is a portable **binary instruction format** for a stack machine, designed as a compilation target (C/C++/Rust/Zig, etc.) with **near-native** speed for numeric workloads and sandboxed execution in browsers and Node.

### Basics

- Modules are **validated** and **instantiated** with **imports** (host functions, memory) and expose **exports** (functions, memory, tables).
- Linear **Memory** is a resizable `ArrayBuffer` viewed from JS and WASM.

### JavaScript interop

```javascript
async function loadWasm(bytes) {
  const memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });

  const importObject = {
    env: {
      memory,
      log: (ptr, len) => {
        const buf = new Uint8Array(memory.buffer, ptr, len);
        console.log(new TextDecoder().decode(buf));
      },
    },
  };

  const { instance } = await WebAssembly.instantiate(bytes, importObject);
  return instance;
}

// Typical flow: fetch wasm file
// const res = await fetch('app.wasm');
// const bytes = await res.arrayBuffer();
// const instance = await loadWasm(bytes);
// instance.exports.run();
```

```javascript
// Compiling separately (reuse)
const compiled = await WebAssembly.compileStreaming(fetch('module.wasm'));
const instance1 = await WebAssembly.instantiate(compiled, imports);
const instance2 = await WebAssembly.instantiate(compiled, imports);
```

### Use cases

- Image/video codecs, cryptography, physics engines, games, CAD, ML inference (often via ONNX/WASM runtimes).

### Performance comparisons (rules of thumb)

- WASM shines for **tight numeric loops** and **predictable** code; JS can be faster for **small** glue logic after JIT optimizes hot paths.
- **Boundary crossing** (JS ↔ WASM) has cost — batch work inside WASM when possible.

---

## 5. Streams API

Streams process data **incrementally** instead of buffering entire bodies in memory. The platform exposes **ReadableStream**, **WritableStream**, and **TransformStream**.

### Readable stream (consumer side)

```javascript
async function readAll(reader) {
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((acc, u8) => acc + u8.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const u8 of chunks) {
    out.set(u8, offset);
    offset += u8.length;
  }
  return out;
}

// Fetch body as stream
const res = await fetch('/large.bin');
const reader = res.body.getReader();
// await readAll(reader);
```

### Writable stream

```javascript
const encoder = new TextEncoder();
const writable = new WritableStream({
  write(chunk) {
    console.log('writing', chunk.byteLength);
  },
  close() {
    console.log('closed');
  },
  abort(err) {
    console.error('aborted', err);
  },
});

const writer = writable.getWriter();
await writer.write(encoder.encode('hello'));
await writer.write(encoder.encode(' world'));
await writer.close();
```

### Transform stream

```javascript
const upperCaseTransform = new TransformStream({
  transform(chunk, controller) {
    const text = new TextDecoder().decode(chunk);
    controller.enqueue(new TextEncoder().encode(text.toUpperCase()));
  },
});
```

### Piping and backpressure

**Backpressure:** downstream signals “slow down” so upstream does not overwhelm memory. The streams implementation coordinates this when you **pipe**.

```javascript
// Browser: pipe fetch body through a transform to a writable (e.g. file sink in supporting envs)
const res = await fetch('/data.txt');
await res.body.pipeThrough(new TextDecoderStream()).pipeTo(/* writable */);
```

```javascript
const { readable, writable } = new TransformStream();
const writer = writable.getWriter();
writer.write('a');
// readable.getReader() consumes — pairing both ends completes the pipeline
```

---

## 6. Internationalization (i18n)

The **`Intl`** namespace provides locale-aware formatting and comparison without shipping huge locale tables yourself (engines ship CLDR-backed data).

### Intl.DateTimeFormat

```javascript
const d = new Date('2025-03-25T14:30:00Z');

console.log(new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(d));
console.log(new Intl.DateTimeFormat('de-DE', { dateStyle: 'full' }).format(d));
console.log(
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  }).format(d)
);
```

### Intl.NumberFormat

```javascript
const n = 1234567.89;

console.log(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n));
console.log(new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n));
console.log(new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n));

const percent = 0.867;
console.log(new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(percent));
```

### Intl.Collator

```javascript
const words = ['éclair', 'eclair', 'apple', 'Äpfel'];

const collator = new Intl.Collator('sv', { sensitivity: 'base' });
words.sort(collator.compare);
console.log(words);

console.log(collator.compare('Straße', 'Strasse')); // locale-dependent
```

### Intl.PluralRules

```javascript
const pr = new Intl.PluralRules('en-US');
for (const n of [0, 1, 1.5, 2, 5]) {
  console.log(n, pr.select(n)); // zero | one | two | few | many | other
}

const prAr = new Intl.PluralRules('ar');
console.log(prAr.select(0), prAr.select(1), prAr.select(2));
```

### Intl.RelativeTimeFormat

```javascript
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
console.log(rtf.format(-1, 'day')); // yesterday
console.log(rtf.format(3, 'week')); // in 3 weeks

const rtfEs = new Intl.RelativeTimeFormat('es');
console.log(rtfEs.format(-2, 'hour'));
```

### Locale-specific formatting tips

```javascript
// Resolve effective locale
const fmt = new Intl.NumberFormat('fr-FR');
console.log(fmt.resolvedOptions().locale, fmt.resolvedOptions().numberingSystem);

// List formatting (Intl.ListFormat)
const lf = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
console.log(lf.format(['HTML', 'CSS', 'JavaScript']));
```

---

## 7. Advanced Design Patterns

Patterns are reusable shapes for collaboration between objects/modules. Below are concise **intent** + **sketches** in modern JS.

### Dependency injection (DI)

**Intent:** Depend on **abstractions** (interfaces) supplied from outside instead of hard-coding concrete classes — easier testing and swapping.

```javascript
class UserService {
  constructor(deps) {
    this.http = deps.http;
    this.logger = deps.logger;
  }
  async getUser(id) {
    this.logger.info(`fetch ${id}`);
    return this.http.get(`/users/${id}`);
  }
}

const service = new UserService({
  http: { get: (url) => fetch(url).then((r) => r.json()) },
  logger: { info: console.log },
});
```

### Mediator

**Intent:** Objects talk through a **mediator** to avoid tight many-to-many coupling.

```javascript
class ChatRoom {
  constructor() {
    this.users = new Map();
  }
  register(user) {
    this.users.set(user.name, user);
    user.room = this;
  }
  send(from, message) {
    for (const u of this.users.values()) {
      if (u.name !== from.name) u.receive(from.name, message);
    }
  }
}

class User {
  constructor(name) {
    this.name = name;
  }
  send(msg) {
    this.room.send(this, msg);
  }
  receive(from, msg) {
    console.log(`${this.name} ← ${from}: ${msg}`);
  }
}
```

### Command

**Intent:** Encapsulate a request as an object — supports undo, queues, logging.

```javascript
class AddTextCommand {
  constructor(doc, text) {
    this.doc = doc;
    this.text = text;
    this.prev = '';
  }
  execute() {
    this.prev = this.doc.content;
    this.doc.content += this.text;
  }
  undo() {
    this.doc.content = this.prev;
  }
}

const doc = { content: '' };
const cmd = new AddTextCommand(doc, 'hello');
cmd.execute();
console.log(doc.content);
cmd.undo();
```

### State

**Intent:** Object behavior changes when **internal state** changes; isolate state-specific logic.

```javascript
class TrafficLight {
  constructor() {
    this.state = new RedState(this);
  }
  setState(state) {
    this.state = state;
  }
  tick() {
    this.state.tick();
  }
}

class RedState {
  constructor(light) {
    this.light = light;
  }
  tick() {
    console.log('Red → Green');
    this.light.setState(new GreenState(this.light));
  }
}
class GreenState {
  constructor(light) {
    this.light = light;
  }
  tick() {
    console.log('Green → Yellow');
    this.light.setState(new YellowState(this.light));
  }
}
class YellowState {
  constructor(light) {
    this.light = light;
  }
  tick() {
    console.log('Yellow → Red');
    this.light.setState(new RedState(this.light));
  }
}
```

### Iterator (and iterable protocol)

**Intent:** Sequential access without exposing internals.

```javascript
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) yield i;
  }
}

console.log([...new Range(2, 5)]); // [2, 3, 4, 5]
```

```javascript
const iter = {
  data: ['a', 'b'],
  i: 0,
  next() {
    if (this.i < this.data.length) {
      return { value: this.data[this.i++], done: false };
    }
    return { done: true };
  },
  [Symbol.iterator]() {
    return this;
  },
};
```

### Proxy pattern (structural)

**Intent:** Place a **surrogate** in front of another object to control access (often implemented with `Proxy` or a wrapper class).

```javascript
function createLazy(getter) {
  let cached;
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (!cached) cached = getter();
        return cached[prop];
      },
    }
  );
}

const expensive = createLazy(() => ({ id: 1, load: 'done' }));
console.log(expensive.id); // triggers getter once
```

---

## 8. Compilers and Transpilers

### Babel: presets and plugins

**Babel** parses JS → **AST**, transforms with **plugins**, generates code. **Presets** bundle plugins (e.g. `@babel/preset-env` targets browsers via `browserslist`).

```json
{
  "presets": [
    ["@babel/preset-env", { "targets": "> 0.5%, not dead" }]
  ],
  "plugins": [["@babel/plugin-proposal-decorators", { "legacy": true }]]
}
```

```javascript
// Input using optional chaining (older targets)
const x = obj?.nested?.value;
// Babel may emit helper calls + logical checks in output
```

### TypeScript overview

TypeScript is a **superset** that adds **static types**, emits JavaScript. The compiler (`tsc`) checks types, strips annotations, and can downlevel syntax.

```typescript
interface User {
  id: string;
  name: string;
}

function greet(u: User): string {
  return `Hi, ${u.name}`;
}
```

```json
// tsconfig.json (illustrative)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "outDir": "dist"
  }
}
```

### AST basics

An **abstract syntax tree** represents program structure. Tools use **parsers** (`@babel/parser`, `typescript`, `acorn`) and **visitors** to find/replace nodes.

```javascript
// Conceptual: expression `a + b` might parse to something like:
// { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: {...} }
```

```javascript
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ast = parser.parse('const x = 1 + 2;', { sourceType: 'module' });
traverse(ast, {
  BinaryExpression(path) {
    if (path.node.operator === '+') {
      // inspect or replace subtree
    }
  },
});
```

### Source maps

**Source maps** map generated code back to original sources for debugging. Build tools emit `.map` files; devtools load them to show TypeScript/Babel **original** lines.

```javascript
// //# sourceMappingURL=bundle.js.map at end of bundle
```

---

## 9. Node.js Specific Topics

### Event emitters

```javascript
const EventEmitter = require('node:events');

class JobQueue extends EventEmitter {
  enqueue(job) {
    this.emit('job', job);
  }
}

const q = new JobQueue();
q.on('job', (job) => console.log('got', job));
q.once('job', () => console.log('first only'));
q.enqueue({ id: 1 });
```

```javascript
const ee = new EventEmitter();
ee.on('error', (err) => console.error('handled', err));
ee.emit('error', new Error('oops'));
```

### Streams (Node)

```javascript
const fs = require('node:fs');
const { pipeline } = require('node:stream/promises');
const zlib = require('node:zlib');

async function gzipFile(inPath, outPath) {
  await pipeline(
    fs.createReadStream(inPath),
    zlib.createGzip(),
    fs.createWriteStream(outPath)
  );
}
```

```javascript
const { Readable, Writable } = require('node:stream');

const r = Readable.from(['chunk1', 'chunk2', 'chunk3']);
const w = new Writable({
  write(chunk, enc, cb) {
    console.log(chunk.toString());
    cb();
  },
});
r.pipe(w);
```

### Buffer

```javascript
const buf = Buffer.from([0x48, 0x69]); // 'Hi'
const utf8 = Buffer.from('hello', 'utf8');
console.log(utf8.toString('hex'));

const sliced = utf8.subarray(1, 3); // view, not copy
console.log(sliced.toString());

Buffer.alloc(8); // zero-filled
Buffer.allocUnsafe(8); // faster, uninitialized — overwrite before exposing
```

### fs module

```javascript
const fs = require('node:fs/promises');
const path = require('node:path');

async function demo() {
  const dir = await fs.mkdtemp(path.join(require('node:os').tmpdir(), 'demo-'));
  const file = path.join(dir, 'note.txt');
  await fs.writeFile(file, 'hello', 'utf8');
  const data = await fs.readFile(file, 'utf8');
  console.log(data);
  await fs.rm(dir, { recursive: true });
}
```

```javascript
const fs = require('node:fs');
fs.stat('package.json', (err, st) => {
  if (err) throw err;
  console.log(st.isFile(), st.size);
});
```

### Child processes

```javascript
const { spawn, execFile } = require('node:child_process');

const child = spawn('node', ['-e', "console.log('child')"], { stdio: 'inherit' });
child.on('exit', (code) => console.log('exit', code));
```

```javascript
const { promisify } = require('node:util');
const execFileAsync = promisify(require('node:child_process').execFile);

async function gitVersion() {
  const { stdout } = await execFileAsync('git', ['--version']);
  return stdout.trim();
}
```

```javascript
const fork = require('node:child_process').fork;
// const cp = fork('./worker.js');
// cp.on('message', (m) => console.log(m));
// cp.send({ hello: 'world' });
```

---

## Best Practices

- Prefer **`Reflect`** when implementing **Proxy** traps so you preserve default semantics and invariants.
- Use **`WeakMap`/`WeakSet`** for metadata tied to object identity without preventing GC.
- Profile **before** optimizing; fix **algorithmic** complexity and **I/O** first, then micro-optimize hot paths.
- For workers, **minimize message churn**; batch work and use **transferables** for large binary data.
- With streams, always **handle errors** on piped streams (`pipeline` helps propagate errors).
- Internationalize with **`Intl`** and store user **locale preferences**; avoid hard-coded format strings for dates/numbers.
- In Node, prefer **`fs/promises`**, **`stream/promises.pipeline`**, and **`once`**/`AbortController` for lifecycle control.
- Keep **service worker** caches **versioned** and delete old caches in `activate`.
- When using WASM, reduce **JS↔WASM** round trips; expose **coarse-grained** exports.

---

## Common Mistakes to Avoid

- Returning **`undefined`** from a Proxy `get` trap for **non-configurable** properties that are not undefined — violates invariants (**TypeError**).
- Assuming **`postMessage`** clones **functions** or **symbols** meaningfully — structured clone has limits.
- **Transferring** an `ArrayBuffer` and then **reading** it in the sender — length becomes 0; ownership moved.
- Ignoring **backpressure** by manually pushing to streams without awaiting `drain` — memory spikes.
- Using **`Object.keys`** for “all properties” — misses non-enumerable and symbol keys; use **`Reflect.ownKeys`** when you truly need everything own.
- **Leaking** listeners on `EventEmitter` — remove with **`off`** or use **`once`**; handle **`error`** events.
- **`Buffer.allocUnsafe`** without filling before sending to untrusted parties — can leak old memory contents.
- **`exec`** with **user-controlled** strings — shell injection; prefer **`execFile`** with argument array.
- Shipping **massive** polyfills for **`Intl`** without checking target environments — bundle bloat.
- Treating micro-benchmarks in **`console`** as proof — JIT warmup and GC noise distort one-shot timings.

---

*Document length targets advanced study; verify APIs against MDN and your runtime version for production use.*
