# JavaScript Performance Optimization

JavaScript runs in browsers and on servers (Node.js, Deno, Bun) where CPU time, memory, layout, paint, and network all affect perceived speed. This guide ties **how engines execute code** to **what you write in JS**, **how you touch the DOM**, **how you load assets**, and **how you measure** so you can optimize deliberately instead of guessing.

---

## 📑 Table of Contents

1. [JavaScript Engine & Runtime Behavior](#1-javascript-engine--runtime-behavior)
2. [Code-Level Optimization](#2-code-level-optimization)
3. [DOM Performance](#3-dom-performance)
4. [Rendering & Main Thread](#4-rendering--main-thread)
5. [Network & Delivery](#5-network--delivery)
6. [Measuring Performance](#6-measuring-performance)
7. [Memory Management](#7-memory-management)
8. [Best Practices](#best-practices)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. JavaScript Engine & Runtime Behavior

Modern engines (V8 in Chrome/Node, JavaScriptCore in Safari, SpiderMonkey in Firefox) parse source, build an internal representation, and apply **optimizing compilers** on hot code paths.

### 1.1 V8 pipeline (conceptual)

Roughly: **parse → bytecode (Ignition) → profiling → optimized machine code (TurboFan)**. Cold code stays interpreted; frequently executed “hot” functions get JIT-compiled. Deoptimization happens when assumptions break (e.g. type changes).

```javascript
// Hot loop: engine may JIT-compile add() after many calls with stable types
function add(a, b) {
  return a + b;
}

for (let i = 0; i < 1_000_000; i++) {
  add(i, 1); // mostly numbers → predictable
}
```

```javascript
// Polymorphic calls inside a hot loop can prevent aggressive inlining
function use(x) {
  return typeof x === 'number' ? x * 2 : String(x).toUpperCase();
}

for (let i = 0; i < 500_000; i++) {
  use(i % 2 === 0 ? i : `v${i}`); // alternates types → harder to specialize
}
```

JIT also means **machine code is generated at runtime** from observed behavior. Stable shapes and types help; constant shape changes force guards and bailouts.

```javascript
// Consistent property access on a stable shape
const p = { x: 1, y: 2 };
for (let i = 0; i < 1_000_000; i++) {
  p.x += 1;
}
```

### 1.2 Hidden classes (shapes)

Objects with the **same creation order and property set** share a hidden class (shape). Adding properties in different orders or deleting properties can create many shapes.

```javascript
// Same shape: add a, then b, in the same order every time
function makePointA() {
  const o = {};
  o.x = 0;
  o.y = 0;
  return o;
}

// Different shape from makePointA if you ever did: o.y first, then o.x
function makePointB() {
  const o = {};
  o.y = 0;
  o.x = 0;
  return o;
}

const a = makePointA();
const b = makePointB(); // may not share hidden class with a

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const points = Array.from({ length: 1_000_000 }, (_, i) => new Point(i, i));

const user = { id: 1, name: 'Ada' };
delete user.name; // occasional ok; avoid in hot loops
```

### 1.3 Inline caching (IC)

Property access sites cache **where** to read a property for a given object shape. Monomorphic (one shape) is fastest; megamorphic (many shapes) is slowest.

```javascript
function readX(o) {
  return o.x;
}
const a = { x: 1 };
const b = { x: 2 };
const c = { x: 3 };
for (let i = 0; i < 1_000_000; i++) readX(i % 3 === 0 ? a : i % 3 === 1 ? b : c);

function sumProps(arr) {
  let s = 0;
  for (const o of arr) s += o.value; // many shapes → megamorphic risk
  return s;
}

const xs = new Float64Array(1_000_000);
for (let i = 0; i < xs.length; i++) xs[i] = i;
```

---

## 2. Code-Level Optimization

Optimize **algorithms first**, then **micro-optimizations** where profiling shows cost.

### 2.1 Loop optimization

```javascript
const items = new Array(10_000).fill(0).map((_, i) => i);
for (let i = 0, n = items.length; i < n; i++) items[i] += 1;

const matrix = Array.from({ length: 1000 }, () => new Array(1000).fill(1));
let acc = 0;
for (let r = 0; r < matrix.length; r++) {
  const row = matrix[r];
  for (let c = 0; c < row.length; c++) acc += row[c];
}

const ids = [/* large */];
const idSet = new Set(ids);
const exists = (id) => idSet.has(id);
```

### 2.2 Function optimization

```javascript
const TAX = 0.08;
function priceWithTax(base) {
  return base * (1 + TAX);
}
const bases = new Array(1_000_000).fill(10);
for (let i = 0; i < bases.length; i++) bases[i] = priceWithTax(bases[i]);

function makeMultiplier(factor) {
  return (x) => x * factor;
}
[1, 2, 3].map(makeMultiplier(2));
```

If profiling shows a tiny hot function as costly, try inlining or fewer allocations; otherwise prefer clarity—the JIT often inlines.

### 2.3 Object creation

```javascript
// Reuse objects where it improves allocation churn (measure first)
const rect = { x: 0, y: 0, w: 0, h: 0 };
function setRect(x, y, w, h) {
  rect.x = x;
  rect.y = y;
  rect.w = w;
  rect.h = h;
  return rect;
}

for (let i = 0; i < 100_000; i++) {
  setRect(i, i, 10, 10);
}
```

```javascript
// Object pooling pattern (games, simulations) — only when profiling demands it
function createPool(factory, size) {
  const pool = Array.from({ length: size }, factory);
  return {
    acquire() {
      return pool.pop() ?? factory();
    },
    release(obj) {
      pool.push(obj);
    },
  };
}
```

### 2.4 String concatenation

```javascript
// Many small += in a loop allocates repeatedly
let s = '';
for (let i = 0; i < 10_000; i++) {
  s += `${i},`;
}
```

```javascript
// Prefer array join for large builds
const parts = [];
for (let i = 0; i < 10_000; i++) {
  parts.push(String(i));
}
const s2 = parts.join(',');
// Template literals are fine for moderate string work: `Hello, ${name}!`
```

### 2.5 Avoiding memory leaks (application-level)

```javascript
// Leak: huge closure captured by listener
function attachBad() {
  const huge = new Array(1_000_000).fill(1);
  document.getElementById('btn').addEventListener('click', () => {
    console.log(huge.length);
  });
}

function attachGood(btn, neededValue) {
  const handler = () => console.log(neededValue);
  btn.addEventListener('click', handler);
  return () => btn.removeEventListener('click', handler);
}

const timerId = setInterval(() => {}, 1000);
clearInterval(timerId);

const cache = new Map();
cache.set('k', 1);
cache.delete('k');
```

### 2.6 Garbage collection (GC) awareness

GC reclaims unreachable objects. **Short-lived allocations** in tight loops increase GC pressure.

```javascript
function f() {
  return { t: Date.now() };
}
for (let i = 0; i < 1_000_000; i++) f(); // many short-lived objects → GC pressure

const state = { t: 0 };
for (let i = 0; i < 1_000_000; i++) state.t = Date.now(); // reuse one object
```

---

## 3. DOM Performance

The DOM bridges JS and the browser’s layout/paint pipeline. **Crossing that boundary is expensive** compared to pure JS.

### 3.1 Minimizing DOM access

```javascript
// Bad: query and read layout repeatedly
function slow() {
  const el = document.getElementById('box');
  for (let i = 0; i < 1000; i++) {
    el.style.left = `${i}px`;
    console.log(el.offsetLeft); // forces layout each iteration
  }
}
```

```javascript
// Better: batch writes; read layout once if needed
function faster() {
  const el = document.getElementById('box');
  for (let x = 0; x < 1000; x++) {
    el.style.transform = `translateX(${x}px)`;
  }
  void el.offsetLeft;
}

const app = document.getElementById('app');
const list = app.querySelector('ul'); // cache queries
```

### 3.2 Batch DOM updates and DocumentFragment

```javascript
function renderItems(items) {
  document.getElementById('list').innerHTML = items.map((i) => `<li>${i}</li>`).join(''); // sanitize if untrusted
}

function appendMany(parent, count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.textContent = String(i);
    frag.appendChild(li);
  }
  parent.appendChild(frag);
}

const frag = document.createDocumentFragment();
['a', 'b', 'c'].forEach((t) => {
  const s = document.createElement('span');
  s.textContent = t;
  frag.appendChild(s);
});
document.body.appendChild(frag);
```

### 3.3 Avoiding layout thrashing (read/write interleaving)

```javascript
const boxes = document.querySelectorAll('.box');

// Thrashing (avoid): read layout, write, read again in the same loop
// boxes.forEach((box) => {
//   const h = box.offsetHeight;
//   box.style.height = `${h + 10}px`;
// });

const heights = Array.from(boxes, (box) => box.offsetHeight);
boxes.forEach((box, i) => {
  box.style.height = `${heights[i] + 10}px`;
});
```

Pair visual updates with `requestAnimationFrame` (see section 4).

### 3.4 Virtual scrolling

Mount only visible rows (and a small buffer); production lists reuse row nodes instead of clearing `innerHTML` each scroll.

```javascript
function mountVirtualList(container, { itemHeight, total, renderRow }) {
  const inner = document.createElement('div');
  inner.style.position = 'relative';
  inner.style.minHeight = `${total * itemHeight}px`;
  container.appendChild(inner);

  function draw() {
    const start = Math.floor(container.scrollTop / itemHeight);
    const end = Math.min(total, start + Math.ceil(container.clientHeight / itemHeight) + 2);
    const frag = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
      const row = renderRow(i);
      row.style.cssText = `position:absolute;top:${i * itemHeight}px;height:${itemHeight}px`;
      frag.appendChild(row);
    }
    inner.replaceChildren(frag);
  }

  container.addEventListener('scroll', draw, { passive: true });
  draw();
}
```

---

## 4. Rendering & Main Thread

Keep **animation and input** smooth by staying off the critical path where possible and scheduling work appropriately.

### 4.1 requestAnimationFrame

```javascript
let x = 0;
function tick() {
  x += 1;
  document.getElementById('ball').style.transform = `translateX(${x}px)`;
  if (x < 500) requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

let pending = false;
function onData() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    updateDomFromState();
  });
}
```

### 4.2 Debouncing and throttling

```javascript
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function throttle(fn, wait) {
  let last = 0;
  let trailingTimer;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        last = Date.now();
        trailingTimer = undefined;
        fn(...args);
      }, remaining);
    }
  };
}

window.addEventListener('resize', debounce(() => console.log(window.innerWidth), 200));
window.addEventListener('scroll', throttle(() => console.log(window.scrollY), 100), { passive: true });
```

### 4.3 Lazy loading

```javascript
// <img src="hero.jpg" loading="lazy" alt="..." />
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        loadHeavyWidget(e.target);
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: '200px' },
);
document.querySelectorAll('[data-lazy]').forEach((el) => io.observe(el));
```

### 4.4 Image optimization (conceptual + JS hooks)

Use `<picture>` / `srcset` in HTML for formats and sizes. In JS, decode before revealing to avoid jank.

```javascript
async function showImage(img, src) {
  img.src = src;
  if (img.decode) {
    try {
      await img.decode();
    } catch {
      /* fallback */
    }
  }
  img.hidden = false;
}
```

### 4.5 Critical rendering path (browser-level mental model)

Defer scripts (`<script src="app.js" defer></script>`), avoid `document.write`, keep CSS selectors cheap, and split long JS work so the main thread can handle input.

```javascript
function yieldToMain() {
  return new Promise((r) => setTimeout(r, 0));
}

function processSlice(items, from, to) {
  for (let i = from; i < to; i++) {
    /* work on items[i] */
  }
}

async function bigJob(items) {
  const chunk = 500;
  for (let i = 0; i < items.length; i += chunk) {
    processSlice(items, i, Math.min(i + chunk, items.length));
    await yieldToMain();
  }
}
```

---

## 5. Network & Delivery

Perceived performance is often **bytes and latency**, not raw JS speed.

### 5.1 Resource minification

```javascript
// Build tools (esbuild, terser, swc) minify identifiers and whitespace
// Production bundle excerpt conceptually becomes:
function a(b){return b+1}
```

### 5.2 Compression (Gzip, Brotli)

Configured on the server / CDN (`Content-Encoding: br` or `gzip`). No JS required; ensure **compressible text types** (JS, CSS, HTML, JSON, SVG).

```javascript
// fetch automatically decompresses for you
const res = await fetch('/api/data');
const json = await res.json();
```

### 5.3 Code splitting (dynamic import)

```javascript
button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart.js');
  renderChart(document.getElementById('chart'));
});

async function go(path) {
  if (path === '/reports') {
    const mod = await import('./routes/reports.js');
    mod.mount();
  }
}
```

### 5.4 Caching strategies

```javascript
// Service worker cache (simplified pattern)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open('v1').then((cache) => cache.put(event.request, copy));
        return res;
      });
    }),
  );
});
```

For static hashed assets, servers often send `Cache-Control: public, max-age=31536000, immutable`.

### 5.5 CDN

Static assets served from **edge nodes** closer to users. In JS, use **absolute URLs** to the CDN for assets built with content hashes.

```javascript
const ASSET_BASE = 'https://cdn.example.com/app/v3/';
const script = document.createElement('script');
script.src = `${ASSET_BASE}chunk.4f2a1.js`;
document.head.appendChild(script);
```

### 5.6 HTTP/2 and HTTP/3

Multiplexing reduces head-of-line blocking; HTTP/3 (QUIC) improves lossy networks. You mostly benefit from server/CDN config; in HTML use hints like `<link rel="preconnect" href="https://api.example.com">`. Prefer a small number of well-sized bundles—many tiny files still add request overhead even with HTTP/2+.

---

## 6. Measuring Performance

**Measure, then optimize.** Use the right tool for the question: main thread? network? memory?

### 6.1 Performance API (high resolution time)

Use `performance.now()` for durations (monotonic, sub-millisecond). Use `Date.now()` for wall-clock timestamps only.

```javascript
const t0 = performance.now();
for (let i = 0; i < 1e6; i++) {
  /* work */
}
console.log(`${(performance.now() - t0).toFixed(3)} ms`);

window.addEventListener('load', () => {
  const [nav] = performance.getEntriesByType('navigation');
  if (nav) {
    console.log(nav.domContentLoadedEventEnd, nav.loadEventEnd);
  }
});

console.log(performance.getEntriesByName('https://example.com/app.js')[0]?.duration);
```

### 6.2 Chrome DevTools Performance tab

Record a session while reproducing jank. Look for **long tasks**, **forced reflow**, and **layout/paint** cost. Use **Bottom-Up** and **Call Tree** to find hot JS functions.

```javascript
// Add manual labels that appear in Performance recordings
performance.mark('work-start');
/* ... */
performance.mark('work-end');
performance.measure('work', 'work-start', 'work-end');
console.table(performance.getEntriesByName('work'));
```

### 6.3 Lighthouse

Runs audits for performance, accessibility, best practices, and SEO. Automate in CI with **Lighthouse CI** or **Playwright**; programmatic runs use the `lighthouse` npm package with a launched Chrome instance.

### 6.4 Web Vitals (LCP, FID, CLS, INP)

- **LCP**: largest contentful paint (loading performance).
- **FID** / **INP**: interactivity (FID first input delay; **INP** broader interaction latency).
- **CLS**: visual stability.

```javascript
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const last = entries[entries.length - 1];
  console.log('LCP', last.renderTime || last.loadTime, last.id);
}).observe({ type: 'largest-contentful-paint', buffered: true });

let clsScore = 0;
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.hadRecentInput) clsScore += e.value;
  }
  console.log('CLS total', clsScore);
}).observe({ type: 'layout-shift', buffered: true });
```

**INP** needs Event Timing + presentation data; use the official `web-vitals` package in production rather than hand-rolling.

### 6.5 console.time() / console.timeEnd()

```javascript
console.time('sort');
const xs = Array.from({ length: 200_000 }, () => Math.random());
xs.sort((a, b) => a - b);
console.timeEnd('sort');
```

### 6.6 PerformanceObserver

```javascript
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.entryType, entry.name, entry.duration);
  }
});
obs.observe({ entryTypes: ['measure', 'mark', 'resource', 'navigation'] });

// Long Animation Frames (LoAF): find slow requestAnimationFrame work (Chromium, when supported)
try {
  new PerformanceObserver((list) => console.log(list.getEntries())).observe({
    type: 'long-animation-frame',
    buffered: true,
  });
} catch {
  /* unsupported */
}
```

---

## 7. Memory Management

Understanding **stack vs heap** helps interpret profiles and leaks.

### 7.1 Heap and stack (conceptual)

- **Stack**: frames for function calls, primitive locals (implementation details vary).
- **Heap**: objects, closures, arrays — **GC-managed**.

```javascript
function outer() {
  const localPrimitive = 42; // typically stack-associated
  const localObject = { x: 1 }; // object on heap; reference may be stack-held
  return () => localObject; // closure keeps heap object alive
}
const f = outer();
```

### 7.2 Memory profiling (DevTools)

Take **heap snapshots**, compare **Shallow** vs **Retained** size, and look for **detached DOM trees** and unexpected **closure** retention.

```javascript
// Force a named constructor for easier snapshot identification (dev only)
function User(id) {
  this.id = id;
}
const u = new User(1);
```

### 7.3 Detecting memory leaks

```javascript
// Leak pattern: global cache grows forever
const GLOBAL_CACHE = new Map();
function leakEveryCall(key, val) {
  GLOBAL_CACHE.set(key, val);
}
```

```javascript
// Fix: LRU eviction or TTL
class LRU {
  constructor(max) {
    this.max = max;
    this.map = new Map();
  }
  set(k, v) {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.max) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
  }
}
```

```javascript
// Event listener leak fix: always pair add with remove
function mount(el) {
  const onClick = () => {};
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
}
```

### 7.4 WeakMap / WeakSet for optimization

Keys are held **weakly** — they do not prevent GC of key objects. Great for **metadata** or **deduplication** without extending foreign objects.

```javascript
const metadata = new WeakMap();
function tagObject(obj, info) {
  metadata.set(obj, info);
}
let thing = { id: 1 };
tagObject(thing, { note: 'temp' });
thing = null; // key collectible → entry disappears

const processed = new WeakSet();
function processOnce(obj) {
  if (processed.has(obj)) return;
  processed.add(obj);
}

const strong = new Map();
let k = { id: 1 };
strong.set(k, 'data');
k = null; // object kept alive until map.delete(k) or map.clear()
```

---

## Best Practices

1. **Profile first** with DevTools Performance, Memory, and Lighthouse; confirm bottlenecks before rewriting code.
2. **Prefer stable object shapes** and consistent types on hot paths; avoid random `delete` and property order churn on critical objects.
3. **Batch DOM reads and writes**; avoid interleaving layout reads with style mutations.
4. **Use `requestAnimationFrame`** for visual updates; **debounce** expensive handlers (resize, search) and **throttle** high-frequency scroll handlers.
5. **Split bundles** and **lazy-load** routes and heavy widgets; serve compressed assets with **long cache** for hashed filenames.
6. **Track Web Vitals** in the field (RUM) — lab scores alone miss real networks and devices.
7. **Manage listeners and timers** on teardown; avoid accidental global retention and unbounded caches.
8. **Use `WeakMap`/`WeakSet`** for auxiliary data tied to object identity when you do not want to extend the object or block GC.

---

## Common Mistakes to Avoid

1. **Micro-optimizing without measurement**, sacrificing readability for hypothetical engine behavior.
2. **Reading layout in a loop** (`offsetWidth`, `getBoundingClientRect`) after each style write — causes **layout thrashing**.
3. **Attaching anonymous listeners** you can never remove, or forgetting **`clearInterval` / `clearTimeout`**.
4. **Unbounded `Map`/`Set` caches** keyed by ever-growing inputs (URLs, IDs) — classic **memory leak**.
5. **Huge string concatenation with `+=`** in hot loops — prefer **`join`** or template strategies when building large text.
6. **Loading all JS upfront** for rarely used features — misses **code-splitting** wins.
7. **Ignoring main-thread long tasks** — even “fast” algorithms can jank if they monopolize the thread; **chunk work** and yield.
8. **Treating `WeakMap` keys as any value** — only **objects** can be keys; primitives are invalid.

