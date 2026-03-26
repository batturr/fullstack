# TypeScript Declaration Files

Declaration files (`.d.ts`) tell the TypeScript compiler about the *shape* of JavaScript that exists at runtime—whether it is your own legacy JS, a third-party library, or globals injected by a bundler or browser. They contain **type information only**: no runnable implementation. Mastering them is essential for accurate editor tooling, safe refactors, and publishing typed npm packages.

## 📑 Table of Contents

1. [Declaration File Basics](#1-declaration-file-basics)
2. [Ambient Declarations](#2-ambient-declarations)
3. [Global Declarations](#3-global-declarations)
4. [Library Declaration Files](#4-library-declaration-files)
5. [Writing Declaration Files](#5-writing-declaration-files)
6. [Declaration File Templates](#6-declaration-file-templates)
7. [Publishing](#7-publishing)
8. [Do's and Don'ts](#8-dos-and-donts)
9. [Best Practices](#best-practices)
10. [Common Mistakes](#common-mistakes)

---

## 1. Declaration File Basics

A **declaration file** uses the `.d.ts` extension. The compiler emits them from `.ts` when `declaration: true`, or you author them by hand for untyped JavaScript. They describe types, interfaces, namespaces, and module shapes without emitting JavaScript (unless you mistakenly put value-level code in them—avoid that).

**When to write declaration files:**

- You consume plain JavaScript (or `.js` with JSDoc only) and want strong typing in TS consumers.
- You publish a library and want consumers to get types without reading your source.
- You augment existing types (e.g., adding fields to `Express.Request`).
- You document globals from script tags (`window.MyWidget`) or build tools.

**Structure:** Typically one entry `.d.ts` (or `index.d.ts`) plus optional `types` in `package.json`. Files can be **ambient** (no imports/exports → global scope) or **modules** (top-level `import`/`export` → file is a module).

**Declaration vs implementation:**

| Declaration (`.d.ts`) | Implementation (`.js` / `.ts`) |
|----------------------|--------------------------------|
| Types, interfaces, overload signatures | Actual runtime values and logic |
| `declare function foo(x: string): void;` | `function foo(x) { ... }` |
| Consumed by `tsc` and editors | Executed by Node or the browser |

### 🟢 Beginner Example

A minimal hand-written declaration for a single JS function your project uses:

```typescript
// math-helpers.d.ts
declare function add(a: number, b: number): number;
```

Your `tsconfig.json` should include this file (e.g., via `"include"`), and TypeScript will treat `add` as callable wherever the declaration is in scope.

### 🟡 Intermediate Example

Splitting **value** declarations from **types** and using a dedicated folder:

```typescript
// types/my-lib.d.ts
export interface User {
  id: string;
  name: string;
}

export declare function fetchUser(id: string): Promise<User>;
```

This file is a **module** because of `export`. Consumers import from the corresponding JS module path; the `.d.ts` sits alongside or is resolved via `package.json` `"types"`.

### 🔴 Expert Example

Using **`declare module`** to provide types when the runtime package has no types and you cannot change its source:

```typescript
// typings/cool-legacy-lib.d.ts
declare module "cool-legacy-lib" {
  interface CoolOptions {
    strict?: boolean;
    timeoutMs?: number;
  }

  class CoolClient {
    constructor(options?: CoolOptions);
    connect(): Promise<void>;
    on(event: "data", handler: (chunk: Buffer) => void): void;
    on(event: "error", handler: (err: Error) => void): void;
  }

  export = CoolClient;
}
```

Here `export =` matches a CommonJS-style `module.exports = function/class` pattern. Matching the real export shape avoids subtle import errors.

### 🌍 Real-Time Example

A React + Vite app loads a **CDN script** that attaches a global. You add a root-level `global.d.ts`:

```typescript
// global.d.ts
interface Window {
  dataLayer: Array<Record<string, unknown>>;
}

declare const gtag: (
  command: "config" | "event" | "js",
  targetId: string | Date,
  config?: Record<string, unknown>
) => void;
```

Analytics snippets and tag managers often rely on globals; declaration files keep `window` and `gtag` typed across your components without `any`.

---

## 2. Ambient Declarations

**Ambient** means “this exists in the environment; trust me.” You use the `declare` keyword so TypeScript does not expect a body. Ambient declarations can live in `.d.ts` files or, sparingly, at the top level of `.ts` files (usually only for quick local shims).

**Forms:**

- `declare var` / `let` / `const` — ambient variables
- `declare function` — callable, supports overloads
- `declare class` — constructable type (no implementation in `.d.ts`)
- `declare enum` — often `const enum` for inlining, or regular ambient enum
- `declare namespace` — nested organization (legacy; prefer modules for new code)

### 🟢 Beginner Example

Tell TypeScript that `API_URL` exists at runtime (e.g., injected by webpack DefinePlugin):

```typescript
// ambient-env.d.ts
declare const API_URL: string;
```

### 🟡 Intermediate Example

Ambient **function** with overloads for a small JS utility:

```typescript
declare function formatDate(d: Date): string;
declare function formatDate(iso: string): string;
declare function formatDate(ts: number): string;
```

### 🔴 Expert Example

Ambient **namespace** merging with an **interface** (pattern used by many older typings):

```typescript
declare namespace App {
  interface Config {
    apiBase: string;
  }

  function init(config: Config): void;
}

declare namespace App {
  interface Config {
    /** Optional feature flags */
    features?: Record<string, boolean>;
  }
}
```

Declaration merging combines the two `Config` interfaces; `init` remains a single ambient function in the namespace.

### 🌍 Real-Time Example

**Node.js** exposes `process`, `Buffer`, and module loaders. In modern TS you use `@types/node`, but the same idea applies to **custom** native addons:

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    readonly DATABASE_URL: string;
    readonly STRIPE_SECRET_KEY: string;
  }
}
```

Augmenting `ProcessEnv` gives autocomplete and exhaustiveness when reading `process.env` in server code.

---

## 3. Global Declarations

**Global** declarations are visible without `import` when the containing file is **not** a module (no top-level `import`/`export`). They are appropriate for script-tag libraries and app-wide augmentation.

**Global augmentation** uses `declare global { ... }` inside a **module** file to patch the global scope without losing module status.

### 🟢 Beginner Example

A non-module `.d.ts` that declares a global helper:

```typescript
// globals.d.ts
declare function __(key: string): string;
```

Any TS file in the project can call `__('save')` if the file is included in compilation.

### 🟡 Intermediate Example

Extending the **global `Window`** interface:

```typescript
// window-augment.d.ts
interface Window {
  __APP_VERSION__: string;
}
```

Now `window.__APP_VERSION__` is typed everywhere.

### 🔴 Expert Example

**Module file** that augments globals (e.g., adding a property to `Array.prototype` is discouraged at runtime, but typings for legacy code may need it):

```typescript
// array-extensions.d.ts
export {};

declare global {
  interface Array<T> {
    /**
     * Legacy helper from internal JS library
     */
    toChunked(size: number): T[][];
  }
}
```

The `export {}` turns the file into a module so `declare global` is legal.

### 🌍 Real-Time Example

**Express** request augmentation for `req.user` after authentication middleware:

```typescript
// express.d.ts
import type { User } from "./models/user";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
```

Middleware can set `req.user`, and route handlers get proper typing without casting.

---

## 4. Library Declaration Files

Libraries ship types in several ways:

1. **Bundled declarations** — `package.json` `"types"` or `"typings"` points to `.d.ts` next to JS.
2. **@types on DefinitelyTyped** — community-maintained `@types/<pkg>` on npm; installed as dev dependency.
3. **Types inside the package** — `"types": "./dist/index.d.ts"` with `declaration: true` in the build.

**Triple-slash directives** are legacy XML-style references at the top of a file:

- `/// <reference path="./other.d.ts" />` — include another declaration file.
- `/// <reference types="node" />` — pull in `@types/node` (or package’s types).
- `/// <reference lib="dom" />` — include built-in lib (like `dom` or `es2022`).

Prefer `tsconfig.json` `"types"`, `"lib"`, and normal `import type` in modern projects; triple-slashes remain useful in **ambient declaration** scenarios and some tooling pipelines.

### 🟢 Beginner Example

Installing community types for a JS-only library:

```bash
npm install --save-dev @types/lodash
```

TypeScript automatically discovers `@types` packages when `typeRoots` / `types` are not overly restrictive.

### 🟡 Intermediate Example

`package.json` pointing at bundled declarations:

```json
{
  "name": "my-utils",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

### 🔴 Expert Example

Triple-slash to pull DOM lib into an isolated declaration file used outside a normal `tsconfig`:

```typescript
/// <reference lib="dom" />

declare function mount(root: HTMLElement): void;
```

### 🌍 Real-Time Example

Monorepo package **A** depends on **B**’s compiled output. **B** publishes `dist/index.js` + `dist/index.d.ts`. In **A**’s `tsconfig`, `moduleResolution` `node` (or `node10`/`bundler`) resolves `import { x } from "b"` to `b/package.json` `"types"`. No `@types/b` package is needed when **B** ships its own `.d.ts`.

---

## 5. Writing Declaration Files

Patterns mirror how the library is **consumed** at runtime.

### 5.1 Global library pattern

Script tag exposes `MyLib` on `window`. Use a non-module `.d.ts`:

```typescript
declare const MyLib: {
  version: string;
  init(config: { region: string }): void;
};
```

### 5.2 Module library pattern

ESM/CJS package with `export` / `module.exports`. Use `export` in `.d.ts` or `declare module "pkg"`:

```typescript
export function ping(host: string): Promise<boolean>;
export type HealthStatus = "up" | "down";
```

### 5.3 UMD library pattern

Library supports AMD, CommonJS, and global. Typings often combine `export as namespace` with `export =`:

```typescript
export as namespace MyUmdLib;

interface MyUmdLibStatic {
  (selector: string): { show(): void };
  util: { noop(): void };
}

declare const MyUmdLib: MyUmdLibStatic;
export = MyUmdLib;
```

### 5.4 Class library pattern

Primary export is a class (constructable):

```typescript
export declare class Queue<T> {
  constructor(maxSize?: number);
  enqueue(item: T): void;
  dequeue(): T | undefined;
  readonly size: number;
}
```

### 5.5 Function library pattern

Callable export with properties (factory pattern):

```typescript
interface Formatter {
  (input: string): string;
  locale: string;
  reset(): void;
}

declare const createFormatter: (locale: string) => Formatter;
export = createFormatter;
```

### 🟢 Beginner Example

Global library:

```typescript
// awesome-slider.d.ts
interface AwesomeSliderInstance {
  next(): void;
  prev(): void;
}

interface AwesomeSlider {
  create(el: HTMLElement): AwesomeSliderInstance;
}

declare const AwesomeSlider: AwesomeSlider;
```

### 🟡 Intermediate Example

ES module library:

```typescript
// @my/sdk
export interface ClientOptions {
  token: string;
}

export declare class SdkClient {
  constructor(options: ClientOptions);
  listProjects(): Promise<string[]>;
}
```

### 🔴 Expert Example

UMD + namespace for optional global access:

```typescript
export as namespace Analytics;

export interface TrackPayload {
  event: string;
  properties?: Record<string, string | number | boolean>;
}

declare class AnalyticsClient {
  track(payload: TrackPayload): void;
}

export default AnalyticsClient;
```

### 🌍 Real-Time Example

Wrapping a **minified** vendor file you vendor into `public/vendor/foo.min.js` that sets `window.Foo`:

```typescript
declare namespace Foo {
  function openDialog(id: string): void;
}
```

Your app code stays typed while the implementation remains a black-box script.

---

## 6. Declaration File Templates

Use these as starting points; adjust `export` vs global to match real runtime behavior.

### 🟢 Beginner Example — Global variables

```typescript
declare const __BUILD_ID__: string;
declare const __DEV__: boolean;
```

### 🟡 Intermediate Example — Global functions

```typescript
declare function logMetric(name: string, value: number, tags?: string[]): void;
```

### 🔴 Expert Example — Object with properties

```typescript
declare namespace AppRuntime {
  const env: "development" | "production" | "test";
  const features: {
    darkMode: boolean;
    betaDashboard: boolean;
  };
  function reloadConfig(): Promise<void>;
}
```

### 🌍 Real-Time Example — Overloaded functions

```typescript
declare function route(name: "home"): "/";
declare function route(name: "user", id: string): `/user/${string}`;
declare function route(name: "settings", tab?: "profile" | "billing"): "/settings" | `/settings/${string}`;
```

### Reusable types in declaration files

```typescript
export type Brand<T, B extends string> = T & { readonly __brand: B };
export type UserId = Brand<string, "UserId">;
export type ISODateString = string;

export interface Paginated<T> {
  items: T[];
  nextCursor?: string;
}
```

---

## 7. Publishing

### `package.json` `types` field

Set `"types"` (or legacy `"typings"`) to your entry `.d.ts`:

```json
{
  "name": "@acme/core",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

Using `"exports"."types"` helps dual packages (CJS/ESM) resolve consistently in modern tooling.

### Bundling declarations

Tools like `tsc --declaration`, `rollup-plugin-dts`, or API Extractor can emit a **single** `.d.ts` or split `.d.ts` per public entry. Keep **public API** surface minimal: avoid leaking internal paths.

### Declaration maps (`declarationMap`)

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "composite": true
  }
}
```

`.d.ts.map` files let editors jump from a type definition to the **original** `.ts` source inside the package—valuable for monorepos and published source maps.

### API Extractor

**@microsoft/api-extractor** rolls declarations, trims beta/internal tags, and can produce **api-report** for review. It helps teams prevent accidental breaking changes in public types.

### 🟢 Beginner Example

Minimal publish layout:

```
dist/
  index.js
  index.d.ts
package.json   → "types": "./dist/index.d.ts"
```

### 🟡 Intermediate Example

`tsconfig` for a library:

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "stripInternal": true,
    "composite": true
  },
  "include": ["src"]
}
```

### 🔴 Expert Example

Conditional `exports` for subpaths:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./node": {
      "types": "./dist/node.d.ts",
      "default": "./dist/node.js"
    }
  }
}
```

Each subpath needs its own `.d.ts` (or re-export file).

### 🌍 Real-Time Example

Publishing **types-only** package (no JS runtime):

```json
{
  "name": "@acme/contracts",
  "types": "./index.d.ts",
  "files": ["index.d.ts"]
}
```

Consumers depend on it only for compile-time contracts (shared DTO shapes between frontend and backend).

---

## 8. Do's and Don'ts

### General types

**Do:** Prefer `interface` for object shapes that may merge; use `type` for unions, mapped types, and conditional types.

**Don't:** Use `any` in published `.d.ts`; use `unknown` and narrow at boundaries.

### Callbacks

**Do:** Use contextual typing-friendly signatures:

```typescript
export declare function readFile(
  path: string,
  encoding: "utf8",
  cb: (err: NodeJS.ErrnoException | null, data: string) => void
): void;
```

**Don't:** Forget `this` types when libraries invoke callbacks with a meaningful `this`.

### Overloads

**Do:** Order overloads from **most specific** to **least specific**; use a single implementation signature in `.ts` implementations. In `.d.ts`, list overloads without bodies.

**Don't:** Create redundant overloads that TypeScript could unify—reduces maintenance.

### Optional parameters

**Do:** Mark optional params with `?` and document defaults in JSDoc.

**Don't:** Mark a parameter optional if callers **must** pass it for correct behavior unless the runtime truly treats `undefined` as valid.

### 🟢 Beginner Example

```typescript
/** @default true */
export declare function enableTelemetry(enabled?: boolean): void;
```

### 🟡 Intermediate Example

Callback with discriminated result:

```typescript
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export declare function parseJson(text: string, cb: (r: Result<unknown>) => void): void;
```

### 🔴 Expert Example

Precise `this` for plugin registration:

```typescript
export interface PluginContext {
  id: string;
}

export declare function registerPlugin(
  this: void,
  name: string,
  setup: (this: PluginContext) => void
): void;
```

### 🌍 Real-Time Example

Avoid leaking internal implementation types in public callbacks:

```typescript
// Bad: exposes InternalParser
// export declare function onParse(cb: (p: InternalParser) => void): void;

// Good: minimal surface
export interface ParseEvent {
  readonly source: string;
  readonly line: number;
}

export declare function onParse(cb: (e: ParseEvent) => void): void;
```

---

## Best Practices

1. **Mirror runtime exports exactly.** Wrong `export =` vs `export default` vs named exports causes confusing errors at compile time or broken imports after build.
2. **Prefer `import type` in `.ts` implementation** and keep `.d.ts` either fully ambient module declarations or hand-maintained public facades—avoid circular type-only imports that pull in value modules unintentionally.
3. **Use `export {}` or real exports** to control whether a file pollutes the global scope; accidental globals are hard to trace.
4. **Document with JSDoc** on public declarations; editors surface these as IntelliSense for consumers.
5. **Version your typings** with the library; breaking JS API changes should accompany `.d.ts` updates.
6. **Enable `strict` family options** when authoring declarations—`strictNullChecks` often reveals incorrect optional/required choices.
7. **For `allowJs` + `checkJs`**, consider migrating hot paths to `.ts` or using JSDoc `@typedef` before maintaining large hand-written `.d.ts` mirrors.
8. **Test declarations** with a small consumer project or `dtslint` / `tsd`-style tests that assert assignability and error cases.
9. **Minimize `namespace` in new code**; ES modules scale better. Reserve namespaces for typing legacy patterns or declaration merging needs.
10. **Keep declaration files free of value implementations**—no `const x = 1` unless you truly intend ambient values (rare); use normal `.ts` for code.

---

## Common Mistakes

1. **Treating `.d.ts` as runnable code** — Implementations belong in `.ts`/`.js`; `declare` items have no runtime effect.
2. **Module vs script confusion** — Adding `import`/`export` makes the file a module; previous global declarations may no longer be global without `declare global`.
3. **Duplicate identifier errors** — Accidentally declaring the same global in multiple included `.d.ts` files without merging-compatible shapes.
4. **Wrong module target** — Typing `export default` when the package actually does `module.exports =` (Node CJS) leads to `import foo from "pkg"` failures or interop issues.
5. **Overusing `any` in callbacks** — Loses safety; prefer generics or `unknown` with well-typed results.
6. **Missing `readonly` where appropriate** — Consumers assume they can mutate objects that the library treats as immutable.
7. **Forgetting `undefined` in unions** — Under `strictNullChecks`, optional properties and APIs that return “missing” values must reflect `| undefined` when accurate.
8. **Relying on triple-slash instead of `tsconfig`** — Harder to maintain; team-wide settings should live in config.
9. **Publishing `.d.ts` that import private paths** — Exposes unstable module graph to consumers; re-export public types from a single entry.
10. **Ignoring `exports` map** — Modern Node resolves `exports` before `main`; missing `"types"` conditions break type resolution even when JS loads fine.

---

*Declaration files bridge untyped JavaScript and strict TypeScript. Invest in accurate exports, narrow public surfaces, and test typings like you test code—your future self and every consumer of your library will thank you.*
