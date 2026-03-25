# JavaScript Modules and Bundlers

JavaScript did not ship with a native module system for browsers for many years, so the ecosystem grew **CommonJS**, **AMD**, **UMD**, and eventually **ES Modules (ESM)**. Today, **ESM** is the standard for both modern browsers and Node.js (with configuration), while **bundlers** and **build tools** turn many small files—and often TypeScript, CSS, and assets—into optimized output for production. This guide ties together **module formats**, **ESM mechanics**, **popular bundlers**, and **core bundling concepts** with practical examples.

---

## 📑 Table of Contents

1. [Module Systems: CommonJS, ESM, AMD, UMD](#1-module-systems-commonjs-esm-amd-umd)
2. [ES6 Module Features](#2-es6-module-features)
3. [Build Tools: Webpack, Rollup, Parcel, Vite, esbuild, Snowpack](#3-build-tools-webpack-rollup-parcel-vite-esbuild-snowpack)
4. [Module Bundling Concepts](#4-module-bundling-concepts)
5. [Best Practices](#best-practices)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Module Systems: CommonJS, ESM, AMD, UMD

### 1.1 CommonJS (Node.js)

**CommonJS** loads modules **synchronously** at runtime. Each file is a module; `module.exports` (or `exports`) exposes a public API, and `require()` imports other modules. Node.js historically used CommonJS by default; it is still widely used in older codebases and tooling.

```javascript
// math.js — exporting
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };

// Alternative: attach to exports
// exports.add = add;
// exports.subtract = subtract;
```

```javascript
// app.js — importing
const { add, subtract } = require('./math');
const path = require('path'); // built-in / node_modules

console.log(add(2, 3)); // 5
```

```javascript
// default-style single export in CommonJS
// logger.js
module.exports = function log(msg) {
  console.log('[app]', msg);
};

// main.js
const log = require('./logger');
log('started');
```

**Characteristics:** synchronous I/O-friendly on the server, **no static analysis** for imports (paths can be computed), **one module object per file**, circular dependencies are possible but fragile.

---

### 1.2 ES6 Modules (ESM)

**ES Modules** use **`import`** and **`export`**. The module graph is **parsed** before execution; **top-level `import` is hoisted** and runs in a strict mode module scope. Browsers load ESM via `<script type="module">`; Node supports `.mjs` or `"type": "module"` in `package.json`.

```javascript
// utils.js
export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const VERSION = '1.0.0';
```

```javascript
// main.js
import { capitalize, VERSION } from './utils.js';

console.log(capitalize('hello'), VERSION);
```

```javascript
// default export
// greet.js
export default function greet(name) {
  return `Hello, ${name}`;
}

// app.js
import greet from './greet.js';
console.log(greet('Ada'));
```

**Characteristics:** **static structure** (enables tree shaking), **live bindings** for exports, **strict mode** always, async loading in browsers, official standard for JS.

---

### 1.3 AMD (Asynchronous Module Definition) — e.g. RequireJS

**AMD** was designed for **browsers**: modules and dependencies load **asynchronously**. The `define` factory receives dependencies and returns the module value.

```javascript
// legacy AMD style (RequireJS)
define(['./math'], function (math) {
  return {
    run: function () {
      console.log(math.add(1, 2));
    },
  };
});
```

```javascript
// math.js as AMD module
define(function () {
  return {
    add: (a, b) => a + b,
  };
});
```

**When it mattered:** SPAs before widespread bundlers and before native ESM. **Today:** mostly legacy; new projects use ESM + a bundler or native ESM.

---

### 1.4 UMD (Universal Module Definition)

**UMD** is a **wrapper pattern** that tries to support **AMD**, **CommonJS**, and **global** browser variables so one file works in multiple environments.

```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof module === 'object' && module.exports) {
    factory(module.exports);
  } else {
    root.MyLib = factory({});
  }
})(typeof self !== 'undefined' ? self : this, function (exports) {
  exports.version = '1.0.0';
  exports.hello = function () {
    return 'hi';
  };
  return exports;
});
```

**When to use:** publishing **libraries** that must run in Node, AMD loaders, and `<script>` tags without a build step. Many older libraries on npm still ship UMD builds.

---

### 1.5 Comparison Table

| Aspect | CommonJS | ESM | AMD | UMD |
|--------|----------|-----|-----|-----|
| **Primary environment** | Node.js (historically default) | Browser + Node (modern) | Browser (async loaders) | Library authors (multi-target) |
| **Loading** | Synchronous `require` | Static `import`; async `import()` | Async `require` in `define` | Depends on detected environment |
| **Syntax** | `require` / `module.exports` | `import` / `export` | `define([deps], factory)` | IIFE + branching |
| **Static analysis** | Limited (dynamic `require`) | Strong (top-level structure) | Moderate | Varies |
| **Tree shaking** | Generally poor | Good (with bundler) | Limited | Limited |
| **Browser native** | No | Yes (`type="module"`) | Via loader | Often global attach |
| **Typical era** | 2009–present (Node) | 2015+ standard | ~2010–2015 peak | Libraries bridging gaps |

---

## 2. ES6 Module Features

### 2.1 Named Exports and Imports

```javascript
// stats.js
export const mean = (nums) => nums.reduce((a, n) => a + n, 0) / nums.length;
export const median = (nums) => {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
```

```javascript
// report.js
import { mean, median } from './stats.js';

console.log(mean([1, 2, 3])); // 2
```

```javascript
// Rename on import
import { mean as average } from './stats.js';
```

---

### 2.2 Default Exports and Imports

Only **one default export** per module; importers can choose any local name.

```javascript
// createStore.js
export default function createStore(initialState) {
  let state = initialState;
  return {
    getState: () => state,
    setState: (next) => {
      state = typeof next === 'function' ? next(state) : next;
    },
  };
}
```

```javascript
// app.js
import makeStore from './createStore.js';

const store = makeStore({ count: 0 });
```

---

### 2.3 Mixed Default and Named Exports

```javascript
// api.js
export const API_URL = 'https://api.example.com';

export function fetchUser(id) {
  return fetch(`${API_URL}/users/${id}`).then((r) => r.json());
}

export default class ApiClient {
  constructor(base = API_URL) {
    this.base = base;
  }
}
```

```javascript
// consumer.js
import ApiClient, { API_URL, fetchUser } from './api.js';

const client = new ApiClient();
```

---

### 2.4 Re-exporting

**Barrel files** aggregate exports from several modules (use carefully for tree shaking).

```javascript
// internal/a.js
export const a = 1;

// internal/b.js
export const b = 2;

// index.js — namespace re-export
export * from './internal/a.js';
export * from './internal/b.js';

// selective re-export with rename
export { a as alpha } from './internal/a.js';
```

```javascript
// main.js
import { a, b, alpha } from './index.js';
```

```javascript
// re-export default from another module
export { default as MyComponent } from './MyComponent.js';
```

---

### 2.5 Dynamic Imports: `import()`

**`import()`** returns a **Promise** to a module namespace. Enables **code splitting** and **conditional loading**.

```javascript
async function loadLocale(lang) {
  if (lang === 'es') {
    const mod = await import('./locales/es.js');
    return mod.default;
  }
  const mod = await import('./locales/en.js');
  return mod.default;
}

loadLocale('es').then((messages) => console.log(messages.welcome));
```

```javascript
// lazy route in a conceptual SPA
async function navigateTo(page) {
  switch (page) {
    case 'dashboard': {
      const { renderDashboard } = await import('./pages/dashboard.js');
      renderDashboard();
      break;
    }
    case 'settings': {
      const { renderSettings } = await import('./pages/settings.js');
      renderSettings();
      break;
    }
    default:
      console.warn('Unknown page');
  }
}
```

---

### 2.6 `import.meta`

**`import.meta`** exposes **module-specific metadata**. In browsers, **`import.meta.url`** is the module’s URL; bundlers may rewrite it.

```javascript
// Resolve an asset relative to this module (browser ESM)
const imageUrl = new URL('./assets/logo.png', import.meta.url).href;
console.log(imageUrl);
```

```javascript
// Vite exposes env via import.meta.env (build-time replacement)
if (import.meta.env?.DEV) {
  console.log('development build');
}
```

```javascript
// Node ESM: path to current module file
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

### 2.7 Tree Shaking

**Tree shaking** removes **unused exports** from the final bundle when the bundler can prove code is unreachable. It relies on **static `import`/`export`** and **side-effect-free** modules.

```javascript
// lib/math.js
export function used(x) {
  return x * 2;
}

export function unused(x) {
  return x ** 10; // may be dropped if never imported
}
```

```javascript
// app.js
import { used } from './lib/math.js';
console.log(used(3));
```

**Package hint:** in `package.json`, `"sideEffects": false` (or an array of files that do have side effects) helps bundlers drop more code safely.

```json
{
  "sideEffects": ["./src/polyfill.js"]
}
```

---

## 3. Build Tools: Webpack, Rollup, Parcel, Vite, esbuild, Snowpack

### 3.1 Webpack

**Webpack** is a highly configurable **module bundler**. It builds a **dependency graph** from an **entry** point, applies **loaders** (transform files) and **plugins** (broader lifecycle hooks), and emits **chunks**.

**When to use:** Large apps needing **fine-grained control**, custom pipelines, or legacy migrations; extensive ecosystem.

```javascript
// webpack.config.cjs (CommonJS config example)
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env', '@babel/preset-react'] },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' })],
  devServer: { hot: true, port: 8080 },
};
```

**Loaders** transform **per file** (e.g. TS → JS, CSS → JS string). **Plugins** hook compilation (e.g. HTML injection, define env vars, bundle analysis).

---

### 3.2 Rollup

**Rollup** emphasizes **ESM-first** output and **efficient tree shaking**, producing **small libraries** and apps. Often used to build **npm packages** (multiple output formats).

**When to use:** **Libraries** (especially with `export` granularity), when minimal bundle size and clean ESM/CJS dual packages matter.

```javascript
// rollup.config.js (ESM config)
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/bundle.cjs', format: 'cjs' },
    { file: 'dist/bundle.mjs', format: 'es' },
    { file: 'dist/bundle.min.mjs', format: 'es', plugins: [terser()] },
  ],
  plugins: [resolve(), commonjs()],
};
```

---

### 3.3 Parcel

**Parcel** aims for **zero-config** defaults: HTML entry, automatic transforms, and fast caching. Good for **prototypes** and teams that want less configuration.

**When to use:** Quick starts, **minimal config**, small-to-medium apps where convention-over-configuration fits.

```javascript
// src/index.js — Parcel resolves CSS, images, etc. from imports
import './styles.css';
import { init } from './app.js';

init();
```

---

### 3.4 Vite

**Vite** uses **native ESM in dev** (esbuild pre-bundling dependencies) and **Rollup for production** builds. Extremely fast cold start and HMR.

**When to use:** **Modern SPAs** (Vue/React/Svelte), when **dev speed** and simple config matter; production builds align with Rollup’s strengths.

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
      },
    },
  },
});
```

---

### 3.5 esbuild

**esbuild** is an extremely fast **bundler and minifier** written in Go. Often used **under the hood** (Vite dependency pre-bundle) or directly for **scripts** and **libraries**.

**When to use:** **Speed-critical** builds, simple bundling, TypeScript/JSX transpile without a heavy plugin ecosystem.

```javascript
// build.mjs — programmatic esbuild
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/out.js',
  minify: true,
  sourcemap: true,
  loader: { '.png': 'file' },
});
```

---

### 3.6 Snowpack (historical note)

**Snowpack** pioneered **unbundled development** with **native ESM** and **esbuild**-powered transforms; the project **migrated toward Vite**-like workflows and is largely **superseded** by Vite and native tooling.

**When it was relevant:** ESM-first dev servers before Vite’s dominance. **Today:** prefer **Vite** or **Webpack 5** for new projects unless maintaining legacy Snowpack apps.

---

### 3.7 Quick “When to use” Summary

| Tool | Sweet spot |
|------|------------|
| **Webpack** | Complex apps, maximum plugin/control |
| **Rollup** | Libraries, tree-shakeable ESM outputs |
| **Parcel** | Zero-config, fast onboarding |
| **Vite** | Modern frameworks, fast DX + Rollup prod |
| **esbuild** | Raw speed, simple pipelines, tooling glue |
| **Snowpack** | Legacy; migrate to Vite/Webpack |

---

## 4. Module Bundling Concepts

### 4.1 Code Splitting

**Code splitting** breaks the bundle into **multiple chunks** loaded on demand, reducing **initial load**. Dynamic `import()` is the primary JS-level mechanism.

```javascript
// router.js — each page in its own async chunk (conceptual)
const pages = {
  home: () => import('./pages/home.js'),
  admin: () => import('./pages/admin.js'),
};

export async function showPage(name) {
  const loader = pages[name];
  if (!loader) throw new Error('Unknown page');
  const mod = await loader();
  mod.mount(document.getElementById('app'));
}
```

Webpack/Vite/Rollup map dynamic imports to **separate output files**.

---

### 4.2 Lazy Loading

**Lazy loading** defers fetching or executing code until needed—often the same dynamic `import()` pattern, or deferring non-critical scripts.

```javascript
// Load a heavy chart library only when the tab is opened
document.getElementById('charts-tab').addEventListener('click', async () => {
  const { renderChart } = await import('./charts/heavy.js');
  renderChart('#chart-root', window.__DATA__);
});
```

---

### 4.3 Dead Code Elimination (DCE)

**DCE** removes code that **cannot run**. Minifiers (Terser, esbuild) apply **syntax-level** DCE; **tree shaking** removes **unused modules/exports** when static analysis allows.

```javascript
if (false) {
  console.log('never emitted in an optimized build');
}

function pick(mode) {
  if (mode === 'prod') {
    return productionHandler;
  }
  return devHandler;
}
```

Bundlers may also strip `process.env.NODE_ENV === 'production'` branches when replaced at build time.

---

### 4.4 Minification

**Minification** shrinks JS by removing whitespace, shortening names, and applying safe transforms. Usually paired with **mangling** of local identifiers.

```javascript
// Before minification (readable)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// After minification (conceptually — not exact output)
function calculateTotal(n){return n.reduce((n,t)=>n+t.price,0)}
```

Configure via `build.minify: 'terser' | 'esbuild'` (Vite), `optimization.minimize` (Webpack), or Rollup plugins.

---

### 4.5 Source Maps

**Source maps** map **compiled/bundled** code back to **original sources** for debugging. Enable in dev always; in production, use **hidden** or **upload-to-error-tracker** strategies to avoid exposing sources publicly.

```javascript
// webpack (conceptual)
// devtool: 'source-map' | 'eval-source-map' | 'hidden-source-map'

// esbuild
await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  sourcemap: true, // emits bundle.js.map
});
```

---

### 4.6 Hot Module Replacement (HMR)

**HMR** updates **modules in place** without a full page reload, preserving **application state** where possible. Framework integrations (e.g. `react-refresh`) hook into the **module graph**.

```javascript
// conceptual HMR API (Webpack-style)
if (import.meta.hot) {
  import.meta.hot.accept('./render.js', (newModule) => {
    newModule.rerender();
  });

  import.meta.hot.dispose(() => {
    // cleanup timers, listeners
  });
}
```

**Vite** exposes `import.meta.hot` with a similar mental model. **Benefit:** faster feedback during UI development.

---

## Best Practices

- **Prefer ESM** for new application and library code; align `package.json` with `"type": "module"` or explicit `.mjs`/`.cjs` when publishing dual packages.
- **Use named exports** for libraries when consumers should import only what they need; reserve **default exports** for a single primary concept per file.
- **Avoid barrel file abuse**—deep barrels can harm tree shaking and slow IDE resolution; re-export only what matters.
- **Mark side effects** honestly in `package.json` (`sideEffects`) so bundlers can optimize safely.
- **Split by route or feature** with dynamic `import()` to keep initial bundles small.
- **Enable source maps in development**; plan production map strategy (hidden maps + error monitoring).
- **Lock down versions** of loaders/plugins and document the **minimum Node** version for tooling.
- **Run production builds** with minification and content hashes for long-term caching of static assets.

---

## Common Mistakes to Avoid

- **Mixing CJS and ESM incorrectly** in Node (e.g. `require()` of a pure ESM package, or default interop surprises); read the package’s `"exports"` field.
- **Using dynamic paths** that bundlers cannot analyze (`import(variable)`) without care—can **bloat** bundles or fail unless patterns are constrained (e.g. ``import(`./locales/${lang}.json`)`` with a known set).
- **Mutating imported bindings** in ESM—live bindings are **read-only** to importers for exported bindings; use getters or functions for mutable state.
- **Assuming `this` at top level** of a module matches a script file; ESM top-level `this` is **`undefined`** (or `globalThis` patterns differ); use explicit imports instead of relying on globals.
- **Disabling minification or skipping treeshake** “for debugging” in production builds—fix with **source maps** and separate **dev/prod** configs.
- **Over-splitting chunks** so users pay many small HTTP requests—balance with **HTTP/2**, **prefetch**, and **merge strategies** (`manualChunks` in Rollup/Vite).
- **Treating Snowpack as the default** for greenfield work in the 2020s ecosystem—prefer actively maintained stacks (**Vite**, **Webpack 5**, or framework defaults).
- **Forgetting HMR cleanup**—event listeners and timers leak across hot updates if `dispose` handlers are omitted.

---

*This note set is a study companion: verify tool-specific options against current official docs when you pin versions in a real project.*
