# TypeScript Modules

TypeScript uses **ES module** syntax plus type-aware tooling: `import`/`export`, declaration merging, ambient declarations, and **module resolution**. This guide covers resolution, namespaces, augmentation, ambient modules, and advanced imports—with beginner through production-style examples.

## 📑 Table of Contents

1. [ES6 Modules in TypeScript](#1-es6-modules-in-typescript)
2. [Module Resolution](#2-module-resolution)
3. [Namespaces](#3-namespaces)
4. [Module Augmentation](#4-module-augmentation)
5. [Ambient Modules](#5-ambient-modules)
6. [Import Tricks](#6-import-tricks)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

## 1. ES6 Modules in TypeScript

A file with a top-level `import` or `export` is a **module**; otherwise it is a **script** (globals)—avoid scripts in apps. The compiler maps syntax to your `module` target while types are erased at emit.

### 1.1 Named exports and imports

**Named exports** expose specific bindings from a module. Consumers import them by the same name (or rename with `as`).

#### 🟢 Beginner Example
```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}
export const PI = 3.14159;

// app.ts
import { add, PI } from "./math.js";
console.log(add(2, PI));
```

#### 🟡 Intermediate Example
```typescript
// users.ts — mix types and values; consumers pick what they need
export type UserId = string;
export interface User { id: UserId; name: string }
export const isAdmin = (u: User) => u.id.startsWith("admin:");
// report.ts
import { type User, isAdmin } from "./users.js";
const line = (u: User) => `${u.name}${isAdmin(u) ? " (admin)" : ""}`;
```

#### 🔴 Expert Example
```typescript
// api.ts — explicit export list keeps public API small
function internalToken(): string {
  return crypto.randomUUID();
}

export { internalToken as getRequestId }; // rename on export

export type { ApiError } from "./errors.js"; // re-export type only (see export type)

// consumer.ts
import { getRequestId, type ApiError } from "./api.js";
```

#### 🌍 Real-Time Example
```typescript
// features/billing/plans.ts + checkout.ts — const plans + typed imports
export const PLAN_PRO = "pro" as const;
export type PlanId = "free" | typeof PLAN_PRO;
export const priceForPlan = (p: PlanId) => (p === PLAN_PRO ? 29 : 0);
import { priceForPlan, type PlanId } from "./plans.js";
export const quote = (plan: PlanId) => `Total: $${priceForPlan(plan)}`;
```

### 1.2 Default exports and imports

A module may have **at most one** default export. It pairs with `import name from "..."` (any local name is allowed).

#### 🟢 Beginner Example
```typescript
// greeter.ts
export default function greet(name: string): string {
  return `Hello, ${name}`;
}

// main.ts
import greet from "./greeter.js";
greet("World");
```

#### 🟡 Intermediate Example
```typescript
// config.ts
const settings = {
  apiUrl: "https://api.example.com",
  timeoutMs: 10_000,
} as const;

export default settings;

// client.ts
import cfg from "./config.js";
fetch(cfg.apiUrl, { signal: AbortSignal.timeout(cfg.timeoutMs) });
```

#### 🔴 Expert Example
```typescript
// createStore.ts — default factory + exported types
export type Store = { getState(): { count: number }; dispatch(n: number): void };
export default function createStore(initial: number): Store {
  let count = initial;
  return { getState: () => ({ count }), dispatch: (n) => { count += n; } };
}
// app.ts
import createStore, { type Store } from "./createStore.js";
```

#### 🌍 Real-Time Example
```typescript
// plugins/analytics.ts
export type AnalyticsPlugin = { track(e: string, p?: Record<string, unknown>): void };
const analytics: AnalyticsPlugin = { track: (e, p) => console.debug(e, p) };
export default analytics;
// bootstrap.ts
import analytics from "./plugins/analytics.js";
analytics.track("app_started");
```

### 1.3 Re-exporting (barrel patterns and aggregation)

**Re-exports** let a single entry file surface symbols from other modules—useful for package `index.ts` or feature folders.

#### 🟢 Beginner Example
```typescript
// strings/index.ts
export { capitalize } from "./capitalize.js";
export { slugify } from "./slugify.js";
```

#### 🟡 Intermediate Example
```typescript
// models/index.ts
export { User, type UserDTO } from "./user.js";
export { Post, type PostDTO } from "./post.js";
```

#### 🔴 Expert Example
```typescript
// public-api.ts
export { parse } from "./parse.js";
export { serialize } from "./serialize.js";
export type { AstNode } from "./ast.js";
export { walk as astWalk } from "./walker.js";
```

#### 🌍 Real-Time Example
```typescript
// packages/ui/src/index.ts — library entry
export { Button } from "./components/Button.js";
export { Modal } from "./components/Modal.js";
export type { ButtonProps } from "./components/Button.js";
// Consumers: import { Button, type ButtonProps } from "@acme/ui";
```

### 1.4 `import type` and `export type`

Type-only imports/exports are **erased** at emit: they enforce compile-time-only dependencies, avoid accidental runtime imports, and work well with `isolatedModules` and bundlers.

#### 🟢 Beginner Example
```typescript
// types.ts
export type Point = { x: number; y: number };

// draw.ts
import type { Point } from "./types.js";

export function draw(p: Point): void {
  console.log(p.x, p.y);
}
```

#### 🟡 Intermediate Example
```typescript
export type ClickEvent = { type: "click"; x: number; y: number };
export function isClick(e: unknown): e is ClickEvent {
  return typeof e === "object" && e !== null && (e as ClickEvent).type === "click";
}
import { isClick, type ClickEvent } from "./events.js";
export function handle(raw: unknown) { if (isClick(raw)) console.log(raw.x, raw.y); }
```

#### 🔴 Expert Example
```typescript
export class A { readonly kind = "A" as const }
export type AInstance = InstanceType<typeof A>;
import type { AInstance } from "./a.js"; // no runtime import of A
import { type A, type AInstance } from "./a.js"; // inline type + value in one statement
```

#### 🌍 Real-Time Example
```typescript
// Infra imports only domain *types* — breaks no runtime cycle to domain
export type OrderId = string;
export interface Order { id: OrderId; total: number }
import type { Order, OrderId } from "../domain/order.js";
export async function findById(_id: OrderId): Promise<Order | null> { return null; }
```

Also supported: `export *`, `export * as ns`, `export { x as y }`, `export type { T }`, `export default`.

## 2. Module Resolution

TypeScript resolves `import "specifier"` to a file using **moduleResolution** (and related options). Correct settings align with your runtime (Node, bundler) and avoid duplicate types or “module not found” errors.

### 2.1 Classic vs Node resolution

- **Classic** (legacy): older algorithm, largely obsolete; avoid for new projects.
- **Node10** (`moduleResolution: "node"`): mimics Node’s CommonJS-style resolution (`node_modules`, `package.json` `main`).
- **Node16 / NodeNext**: respect **package.json `exports`**, **`.mjs`/`.cjs`**, and **type** in `package.json`—required for accurate ESM in Node.
- **Bundler**: assumes a bundler resolves packages (more permissive); good for Vite/Webpack apps when not publishing a library.

#### 🟢 Beginner Example
```typescript
import { clamp } from "./utils";
```

#### 🟡 Intermediate Example
```jsonc
{ "compilerOptions": { "module": "NodeNext", "moduleResolution": "NodeNext", "strict": true } }
```

```typescript
import { run } from "./worker.js";
```

#### 🔴 Expert Example
```jsonc
// Published library: NodeNext + declarations
{ "compilerOptions": { "module": "NodeNext", "moduleResolution": "NodeNext", "declaration": true, "outDir": "dist" } }
```

#### 🌍 Real-Time Example
```jsonc
// Vite app: bundler resolution + verbatim imports
{ "compilerOptions": { "module": "ESNext", "moduleResolution": "bundler", "verbatimModuleSyntax": true } }
```

### 2.2 Relative vs non-relative specifiers

- **Relative**: `./foo`, `../bar` — resolved from the importing file’s directory.
- **Non-relative**: `lodash`, `@scope/pkg` — resolved via `node_modules` and `paths` / package exports.

#### 🟢 Beginner Example
```typescript
import { x } from "./local.js";
import pick from "lodash/pick.js";
```

#### 🟡 Intermediate Example
```typescript
import { z } from "zod";
```

#### 🔴 Expert Example
```typescript
import type { Schema } from "zod";
```

#### 🌍 Real-Time Example
```typescript
import { logger } from "@app/core/logging";
```

### 2.3 `baseUrl` and path mapping

**baseUrl** sets the root for non-relative module lookup. **paths** map patterns to physical locations (common in monorepos).

#### 🟢 Beginner Example
```jsonc
{ "compilerOptions": { "baseUrl": "./src", "paths": { "@/*": ["./*"] } } }
```

```typescript
import { theme } from "@/styles/theme";
```

#### 🟡 Intermediate Example
```jsonc
{ "compilerOptions": { "baseUrl": ".", "paths": { "@acme/utils": ["packages/utils/src/index.ts"], "@acme/utils/*": ["packages/utils/src/*"] } } }
```

#### 🔴 Expert Example

`paths` are compile-time only unless Jest/Vite/etc. mirror them.

```jsonc
{ "compilerOptions": { "baseUrl": ".", "paths": { "effect": ["./vendor/effect/src/index.ts"] } } }
```

#### 🌍 Real-Time Example
```jsonc
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "baseUrl": ".", "paths": { "@/components/*": ["src/components/*"] } }, "include": ["src"] }
```

## 3. Namespaces

**Namespaces** (`namespace X { ... }`) group values and types under a single name. They predate widespread ES modules; today, **modules are preferred** for file boundaries, but namespaces remain useful for declaration merging and ambient typings.

### 3.1 Declaration and usage

#### 🟢 Beginner Example
```typescript
namespace Geometry {
  export function areaRect(w: number, h: number): number {
    return w * h;
  }
}

Geometry.areaRect(3, 4);
```

#### 🟡 Intermediate Example
```typescript
namespace App {
  export const version = "1.0.0";

  export namespace Config {
    export const theme = "dark";
  }
}

console.log(App.version, App.Config.theme);
```

#### 🔴 Expert Example
```typescript
namespace Models {
  export interface User {
    id: string;
  }
  export function isUser(x: unknown): x is User {
    return typeof x === "object" && x !== null && "id" in x;
  }
}

const u: Models.User = { id: "1" };
```

#### 🌍 Real-Time Example
```typescript
declare namespace MyLib {
  function init(options: { apiKey: string }): void;
}

MyLib.init({ apiKey: process.env.KEY! });
```

### 3.2 Nested namespaces and merging

#### 🟢 Beginner Example
```typescript
namespace A {
  export namespace B {
    export const v = 1;
  }
}
console.log(A.B.v);
```

#### 🟡 Intermediate Example
```typescript
namespace N {
  export const a = 1;
}
namespace N {
  export const b = 2;
}
```

#### 🔴 Expert Example
```typescript
namespace API {
  export interface Request {}
}
namespace API {
  export interface Response {}
}
```

#### 🌍 Real-Time Example
```typescript
declare namespace AppRuntime {
  interface Env {
    NODE_ENV: string;
  }
}
declare namespace AppRuntime {
  interface Env {
    FEATURE_FLAGS: string;
  }
}
```

### 3.3 Aliasing namespaces

#### 🟢 Beginner Example
```typescript
namespace VeryLongName {
  export const x = 1;
}
import V = VeryLongName;
console.log(V.x);
```

#### 🟡 Intermediate Example
```typescript
namespace Outer {
  export namespace Inner {
    export type T = string;
  }
}
import I = Outer.Inner;
const s: I.T = "ok";
```

#### 🔴 Expert Example
```typescript
import * as fs from "node:fs";
```

#### 🌍 Real-Time Example
```typescript
import R = MyCompany.GeneratedApi.V1.Resources;
type UserResource = R.User;
```

### 3.4 Namespaces vs modules

| Aspect | ES module file | Namespace |
|--------|----------------|-----------|
| Scope | File is boundary | Logical grouping inside file or across declarations |
| Runtime | Native JS modules | Erased / emitted as objects (if not ambient) |
| Tooling | Tree-shaking friendly | Often global or bundled manually |
| Recommendation | Default for apps | Use for `.d.ts`, legacy globals, controlled merging |

#### 🌍 Real-Time Example
```typescript
// stats/mean.ts — prefer modules
export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
```

## 4. Module Augmentation

**Augmentation** adds declarations to existing modules or `globalThis` without editing library source.

### 4.1 Global augmentation

#### 🟢 Beginner Example
```typescript
// global.d.ts — `export {}` makes this a module so `declare global` works
export {};
declare global { interface Window { __APP_VERSION__: string } }
// app.ts
console.log(window.__APP_VERSION__);
```

#### 🟡 Intermediate Example
```typescript
import type { User } from "./user.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
```

#### 🔴 Expert Example
```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      OPTIONAL_FLAG?: "0" | "1";
    }
  }
}
export {};
```

#### 🌍 Real-Time Example
```typescript
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
    log: import("pino").Logger;
  }
}
```

### 4.2 Module augmentation

#### 🟢 Beginner Example
```typescript
declare module "my-plugin" {
  interface PluginOptions {
    verbose?: boolean;
  }
}
```

#### 🟡 Intermediate Example
```typescript
declare module "some-db" {
  interface Connection {
    readonly tenantId: string;
  }
}
```

#### 🔴 Expert Example
```typescript
declare module "zod" {
  interface ZodTypeDef {
    __brand?: unknown;
  }
}
```

#### 🌍 Real-Time Example
```typescript
import type { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface Session { user: DefaultSession["user"] & { id: string; role: "admin" | "user" } }
}
declare module "next-auth/jwt" { interface JWT { role?: "admin" | "user" } }
```

### 4.3 Extending third-party modules

Ship augmentations in **`.d.ts`** (or type-only TS in `include`); merge **interfaces**; document for the team.

#### 🌍 Real-Time Example
```typescript
import "@aws-sdk/client-s3";

declare module "@aws-sdk/client-s3" {
  interface GetObjectCommandOutput {
    checksumSHA256?: string;
  }
}
```

### 4.4 Declaration merging with modules

Interfaces merge; type aliases do not. Augment with **interfaces** inside `declare module`.

#### 🔴 Expert Example
```typescript
declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}
```

## 5. Ambient Modules

**Ambient** declarations describe JS or globals that TypeScript does not compile.

### 5.1 Ambient module declaration

#### 🟢 Beginner Example
```typescript
// legacy-lib.d.ts
declare module "legacy-counter" { export function increment(): number }
// app.ts
import { increment } from "legacy-counter";
```

#### 🟡 Intermediate Example
```typescript
declare module "virtual:*" {
  const src: string;
  export default src;
}
```

#### 🔴 Expert Example
```typescript
declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
```

#### 🌍 Real-Time Example
```typescript
/// <reference types="vite/client" />

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

### 5.2 Wildcard module declarations

#### 🟢 Beginner Example
```typescript
declare module "*.png" {
  const url: string;
  export default url;
}
```

#### 🟡 Intermediate Example
```typescript
declare module "@company/icons/*" {
  import type { SVGAttributes } from "react";
  const Icon: (props: SVGAttributes<SVGElement>) => JSX.Element;
  export default Icon;
}
```

#### 🔴 Expert Example
```typescript
declare module "https://*" {
  const text: string;
  export default text;
}
```

#### 🌍 Real-Time Example
```typescript
declare module "*.graphql" {
  import type { DocumentNode } from "graphql";
  const doc: DocumentNode;
  export default doc;
}
```

### 5.3 UMD module pattern

Libraries may attach to **global**, **CommonJS**, and **AMD**. Typings often use `export as namespace`:

#### 🟢 Beginner Example
```typescript
export function render(): void;
export as namespace MyUmdLib;
```

#### 🟡 Intermediate Example
```typescript
import { render } from "my-umd-lib";
render();
// or global: MyUmdLib.render();
```

#### 🔴 Expert Example
```typescript
declare namespace MyPlugin {
  function register(options: { key: string }): void;
}

export = MyPlugin;
export as namespace MyPlugin;
```

#### 🌍 Real-Time Example
```typescript
declare const gtag: (...args: unknown[]) => void;
```

## 6. Import Tricks

### 6.1 Dynamic `import()`

#### 🟢 Beginner Example
```typescript
async function load() {
  const { add } = await import("./math.js");
  console.log(add(1, 2));
}
```

#### 🟡 Intermediate Example
```typescript
function loadLocale(lang: string) {
  return import(`./locales/${lang}.js`) as Promise<{ default: Record<string, string> }>;
}
```

#### 🔴 Expert Example
```typescript
type ChartModule = typeof import("./charts/line.js");

async function getChart(kind: "line" | "bar"): Promise<ChartModule> {
  switch (kind) {
    case "line":
      return import("./charts/line.js");
    case "bar":
      return import("./charts/bar.js");
  }
}
```

#### 🌍 Real-Time Example
```typescript
import { lazy, Suspense } from "react";
const AdminPanel = lazy(() => import("./AdminPanel.js"));
export function App() {
  return <Suspense fallback={<div>Loading…</div>}><AdminPanel /></Suspense>;
}
```

### 6.2 Import assertions / attributes (JSON, CSS)

Syntax evolved from `assert` to `with` depending on TypeScript and runtime version. Enable **`resolveJsonModule`** for JSON.

#### 🟢 Beginner Example
```typescript
import pkg from "../package.json" with { type: "json" };
console.log(pkg.name satisfies string);
```

#### 🟡 Intermediate Example
```typescript
import data from "./config.json" assert { type: "json" };
```

#### 🔴 Expert Example
```typescript
import styles from "./page.module.css" with { type: "css" };
```

#### 🌍 Real-Time Example
```typescript
import flags from "../../config/flags.json" with { type: "json" };
export const isEnabled = (key: keyof typeof flags) => Boolean(flags[key]);
```

### 6.3 Side-effect imports

#### 🟢 Beginner Example
```typescript
import "./instrumentation.js";
```

#### 🟡 Intermediate Example
```typescript
import "reflect-metadata";
```

#### 🔴 Expert Example
```typescript
import "./i18n/registerLocales.js";
```

#### 🌍 Real-Time Example
```typescript
import "./sentry.bootstrap.js";
```

### 6.4 Type-only imports

#### 🟢 Beginner Example
```typescript
import type { Props } from "./props.js";
export function render(_p: Props) {}
```

#### 🟡 Intermediate Example
```jsonc
{ "compilerOptions": { "verbatimModuleSyntax": true } }
```

```typescript
import { type User, findUser } from "./users.js";
```

#### 🔴 Expert Example
```typescript
import { findUser } from "./users.js";
import type { User } from "./users.js";
```

#### 🌍 Real-Time Example
```typescript
import type { Order } from "../domain/order.js";
import { db } from "./db.js";
export async function loadOrder(id: string): Promise<Order | null> {
  return (await db.query(id)) as Order | null;
}
```

### 6.5 Import elision

TypeScript **removes** imports used only as types (unless `verbatimModuleSyntax`, `importsNotUsedAsValues`, or `preserveValueImports` change behavior). Side-effect imports are **never** elided.

#### 🟢 Beginner Example
```typescript
import { Foo } from "./foo.js";
type X = Foo;
```

#### 🟡 Intermediate Example
```jsonc
{ "compilerOptions": { "importsNotUsedAsValues": "error" } }
```

```typescript
import type { Foo } from "./foo.js";
```

#### 🔴 Expert Example
```jsonc
{ "compilerOptions": { "verbatimModuleSyntax": true, "preserveValueImports": true, "isolatedModules": true } }
```

#### 🌍 Real-Time Example
```typescript
import { SomeClass } from "./SomeClass.js";
```

## Best Practices

1. Use top-level `import`/`export` in app code so every file is a **module**.
2. Align **`module` / `moduleResolution`** with Node or your bundler; publish libraries with **NodeNext** when targeting Node ESM.
3. Prefer **named exports** for APIs; default exports for React.lazy targets and plugin singletons are fine.
4. Use **`import type` / `export type`** and **`verbatimModuleSyntax`** to separate types from runtime imports.
5. Mirror **`paths`** in Jest/Vite/etc.; Node does not read `paths` at runtime.
6. Keep **augmentations** in `types/*.d.ts` and mention them in the project README.
7. Avoid **deep barrels** that re-export huge trees (cycles and slow builds).
8. Use **`import()`** for heavy optional routes or admin-only code.
9. Re-check **wildcard `declare module`** when upgrading deps.
10. Use **namespaces** for globals and merging, not for new feature folders.

## Common Mistakes to Avoid

1. Missing **`.js` extensions** in relative imports under **NodeNext** when Node requires them.
2. Expecting **`paths`** aliases to work in Node without a bundler or loader.
3. **Circular value imports** via barrels → `undefined` exports at runtime.
4. Augmenting with **`type` aliases** instead of **interfaces** (types do not merge).
5. **`declare global`** in a file without **`export {}`** (file stays a script).
6. Mixing **`require`** and ESM without proper `types` / `module` setup.
7. **`declare module "*"`** — hides missing modules until runtime.
8. **Subpath imports** disallowed by dependency **`exports`** under NodeNext.
9. Assuming a module **runs** when its import was **elided** (only types used) — use side-effect import if you need execution.
10. Structuring new apps with **namespaces** instead of **files as modules**.

*TypeScript 5.x–style options and ECMAScript module features. See the [TypeScript Handbook — Modules](https://www.typescriptlang.org/docs/handbook/modules.html).*
