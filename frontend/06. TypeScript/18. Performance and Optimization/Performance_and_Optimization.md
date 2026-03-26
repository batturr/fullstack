# TypeScript Performance and Optimization

TypeScript adds a compile step and rich static analysis. That power comes with cost: slower builds, heavier IDE work, and sometimes larger or slower JavaScript output if settings are wrong. This guide maps **where** time and memory go, and **how** to tune the compiler, types, bundler, and editor for a fast feedback loop without giving up safety.

---

## 📑 Table of Contents

1. [Compilation Performance](#1-compilation-performance)
2. [Type Checking Performance](#2-type-checking-performance)
3. [Runtime Performance](#3-runtime-performance)
4. [Bundle Size](#4-bundle-size)
5. [IDE Performance](#5-ide-performance)
6. [Optimization Strategies](#6-optimization-strategies)
7. [Measuring Performance](#measuring-performance)
8. [Best Practices](#best-practices)
9. [Common Mistakes](#common-mistakes)

---

## 1. Compilation Performance

**What slows compilation:** parsing every file, resolving modules, loading `.d.ts` from `node_modules`, full type checking, and emitting JavaScript. **Project references**, **incremental** builds, **`composite`**, **`skipLibCheck`**, and **`--watch`** reduce repeated work.

### 🟢 Beginner Example

Use **`incremental`** and **`skipLibCheck`** in `tsconfig.json` for a quick win on local dev builds. Incremental stores graph state in `.tsbuildinfo` so unchanged files are skipped; `skipLibCheck` skips type checking of declaration files (faster, slightly less safety for buggy `.d.ts`).

```typescript
// tsconfig.json (snippet) — faster default for app projects
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["src/**/*"]
}
```

Run **`tsc --watch`** during development so the compiler reuses the program and only rechecks what changed.

```typescript
// package.json scripts (conceptual)
// "build": "tsc -p tsconfig.json"
// "watch": "tsc -p tsconfig.json --watch"
```

### 🟡 Intermediate Example

**`composite: true`** is required for project references. It enforces **`declaration: true`** and **`declarationMap: true`** (optional but useful) so dependent projects can build against emitted `.d.ts` without re-parsing source.

**Monorepo layout:** `packages/core` builds first; `packages/app` references `core` and only type-checks against `core`’s output, not all of `core`’s `.ts` files on every `app` build.

```typescript
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

```typescript
// packages/app/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "references": [{ "path": "../core" }],
  "include": ["src/**/*"]
}
```

Build with **`tsc -b`** (build mode): TypeScript orders projects by references and uses incremental info per project.

```bash
# From repo root — builds referenced projects in order
tsc -b packages/core packages/app
```

### 🔴 Expert Example

**Solution references** and **path mapping** interact with build mode: prefer **`references`** + **`composite`** over huge single `paths` umbrellas when you want **incremental boundaries**. Use **`--incremental`** (via `incremental: true`) together with **`-b`** so each composite project maintains its own `.tsbuildinfo`.

Split **`types`** / **`typeRoots`** to avoid pulling every `@types/*` package into every compilation unit.

```typescript
// tsconfig.build.json — library package: minimal ambient types
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": [],
    "stripInternal": true
  },
  "include": ["src/**/*.ts"]
}
```

Use **`assumeChangesOnlyAffectDirectDependencies`** (when acceptable) so `--watch` limits the scope of re-checks after a change.

```typescript
{
  "compilerOptions": {
    "incremental": true,
    "assumeChangesOnlyAffectDirectDependencies": true
  }
}
```

### 🌍 Real-Time Example

**CI pipeline:** cache `.tsbuildinfo` and `dist/` per package keyed by lockfile + `tsconfig` hash. On PRs, run **`tsc -b --verbose`** to see which projects rebuilt. For **Docker**, copy only manifests first, install deps, then copy sources so layer caching preserves `node_modules` and optional build caches.

```typescript
// Pseudocode: CI cache keys
// key = hash(package-lock.json, **/tsconfig*.json)
// restore: .tsbuildinfo, packages/*/dist
// run: npm run build  →  tsc -b
```

**Hot reload stacks** (Vite, esbuild): transpilation may bypass `tsc` for speed; run **`tsc --noEmit`** or **`tsc -b`** in parallel or in CI as the **source of truth** for type errors.

**`--build` / `--watch` together:** `tsc -b -w` rebuilds the solution graph incrementally; ideal for local work in monorepos.

```typescript
// package.json scripts — split emit vs typecheck when using Vite/esbuild for emit
const scripts = {
  dev: "vite",
  "typecheck": "tsc -p tsconfig.app.json --noEmit",
  "build:types": "tsc -b",
} as const;
```

**`declarationMap`:** larger artifacts, but **faster** and more accurate navigation for consumers; often worth it for libraries.

```typescript
// Library tsconfig fragment — consumers jump to .ts instead of guessing from .d.ts
const libCompilerOptions = {
  composite: true,
  declaration: true,
  declarationMap: true,
  sourceMap: true,
} as const;
```

---

## 2. Type Checking Performance

**Expensive types** force the checker to instantiate generics deeply, expand conditional types, or chase **circular** references. Symptoms: slow hover, “Type instantiation is excessively deep” errors, or long `tsc` times on a single file change.

### 🟢 Beginner Example

Prefer **simple annotations** on public APIs instead of forcing inference through huge generic chains.

```typescript
// Slower to infer at call sites (huge union from inference)
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}

// Explicit type arguments at the boundary — less work for the checker
const user = { id: 1, name: "Ada", email: "a@x.dev" };
const publicUser = pick<{ id: number; name: string; email: string }, "id" | "name">(
  user,
  ["id", "name"]
);
```

### 🟡 Intermediate Example

**Avoid mapping over large unions** in types that sit on hot paths (every prop of every component). **Precompute** with a **type alias** or **interface** so work happens once.

```typescript
type Keys = "a" | "b" | "c" | "d";

// Potentially expensive if Keys grows and this is reused everywhere
type OptionalRecord = { [K in Keys]?: string };

// Often cheaper: narrow at usage site
type ContactKeys = "email" | "phone";
type Contact = { [K in ContactKeys]?: string };
```

Detect **circular** types: `interface A { b: B }` / `interface B { a: A }` can make inference and display blow up. Break cycles with **`type`** aliases or **`unknown`** / base interfaces at the cycle edge.

```typescript
interface Node {
  id: string;
  parent: Node | null;
  children: Node[]; // OK — homogeneous structure
}

// Risky: mutual expansion A ↔ B on every property access in tooling
// Prefer: one direction holds a weak ref type (e.g. id) in hot types
```

### 🔴 Expert Example

**Tail-recursive conditional types** and **`infer`** in deeply nested conditionals multiply instantiation depth. **Factor** recursion into **helper aliases** with **intermediate named types** so the checker can short-circuit.

```typescript
// Heavy: deeply nested instantiations on large tuples
type BadTupleMap<T extends readonly unknown[]> = T extends readonly [
  infer H,
  ...infer R
]
  ? [H extends string ? Uppercase<H> : H, ...BadTupleMap<R>]
  : [];

// Lighter: shallow recursion + alias; cap depth in practice by tuple size
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]]
  ? H
  : never;
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : [];

type MapStrings<T extends readonly unknown[]> = T extends readonly []
  ? []
  : [
      Head<T> extends string ? Uppercase<Head<T> & string> : Head<T>,
      ...MapStrings<Tail<T>>
    ];
```

Use **`// @ts-expect-error`** sparingly; prefer **simpler** types or **runtime validation** (zod, etc.) for extremely dynamic data instead of **impossible** compile-time proofs.

### 🌍 Real-Time Example

**Redux / large store typing:** a single `RootState` mapped through dozens of selectors can stress hover. **Split** slice types, use **`ReturnType<typeof slice.getState>`** per feature, and **compose** at the root **once** in `store.ts`.

```typescript
import { combineReducers } from "@reduxjs/toolkit";
import { userReducer } from "./userSlice";
import { cartReducer } from "./cartSlice";

const rootReducer = combineReducers({ user: userReducer, cart: cartReducer });
export type RootState = ReturnType<typeof rootReducer>;
// Avoid: mapping over every key of RootState in a mega mapped type for each component
```

**`Awaited<T>` and built-in utility chains:** deeply nesting **`Promise<Promise<...>>`** in generics can stress inference. **Normalize** with **`Awaited`** once at the API boundary.

```typescript
type Json = Record<string, unknown>;

async function load(): Promise<Json> {
  return { ok: true };
}

// Boundary: one level of Promise unwrapping for callers
type Loaded = Awaited<ReturnType<typeof load>>;
```

**Template literal types** on **large unions** (`${Foo}-${Bar}`) multiply cardinality — keep unions **small** or move validation to **runtime**.

```typescript
type HttpMethod = "GET" | "POST";
type Route = "/users" | "/posts";
// 4 variants — fine. If each union has 50 members → 2500 variants (slow)
type Endpoint = `${HttpMethod} ${Route}`;
```

---

## 3. Runtime Performance

TypeScript **erases types** at emit time; **runtime** cost usually comes from **emit choices**: **`enum`**, **`namespace`**, downlevel **`async`**, and **target** / **module** settings.

### 🟢 Beginner Example

**Numeric enums** emit a reverse lookup object → extra bytes and indirection. **`const enum`** inlines members (no object) but **disappears** at compile time — do not export `const enum` from libraries if consumers might use **isolatedModules** / Babel without inlining.

```typescript
enum Status {
  Idle,
  Running,
}

// Prefer for zero runtime object (values inlined where used):
const enum ConstStatus {
  Idle = 0,
  Running = 1,
}

const s = ConstStatus.Idle; // emitted as numeric literal where allowed
```

**Union of string literals** + `as const` has predictable runtime: only the values you use exist.

```typescript
const Status2 = {
  Idle: "idle",
  Running: "running",
} as const;
type Status2 = (typeof Status2)[keyof typeof Status2];
```

### 🟡 Intermediate Example

**Type assertions** (`as`, `<>`) have **zero runtime cost** — they are erased. The risk is **wrong assumptions**, not CPU.

```typescript
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

// No runtime effect; only tells the compiler to trust you
const data = parseJson('{"x":1}') as { x: number };
```

**`target`:** older targets (e.g. ES5) emit more helpers and verbose loops. **`ES2020`+** (when your runtime allows) reduces emitted code size and can improve speed.

```typescript
const modernEmit = {
  compilerOptions: {
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "bundler",
  },
} as const;
```

### 🔴 Expert Example

**Module format:** **`module: "CommonJS"`** can prevent **tree shaking** in bundlers and add wrapper overhead. For apps, prefer **ESM** + a bundler. **`verbatimModuleSyntax`** (TS 5+) helps avoid accidental emit of type-only imports as runtime imports.

```typescript
import type { Config } from "./config"; // erased with `verbatimModuleSyntax` / `import type`
import { init } from "./runtime";

export function start(c: Config) {
  init(c);
}
```

**Downlevel iteration:** `for..of` on non-arrays may emit helpers if target is low. Raise target or polyfill consciously.

**Namespaces** (`namespace Foo { }`) emit **IIFE**-style wrappers in some configurations; prefer **ES modules** for tree shaking and clearer output.

```typescript
// Emits runtime structure; avoid in new app code
namespace Legacy {
  export const VERSION = 1;
}

// Prefer
export const VERSION = 1;
```

**`import()` type-only:** dynamic `import()` for types still participates in module graph analysis; use **`import type()`** where supported for purely type-only dynamic splits (TS 4.5+).

```typescript
type LazyConfig = typeof import("./config").default;
```

### 🌍 Real-Time Example

**Node microservice:** set **`"module": "NodeNext"`**, **`"target"`** to your LTS baseline, and avoid **`const enum`** in shared internal packages if some tools transpile with **`preserveConstEnum: false`**. Measure cold start: fewer emitted enums and smaller `dist/` often improve load time.

```typescript
// server.ts — string unions + satisfies for config (no enum object)
const LogLevel = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof LogLevel)[number];

const env = {
  LOG_LEVEL: "info",
} as const satisfies { LOG_LEVEL: LogLevel };
```

---

## 4. Bundle Size

Types are **stripped** from emitted JS when using **`tsc`** or TS-aware bundlers. **Bundle size** is driven by **what runs**: runtime imports, side effects, **barrel files**, and **declaration** surface for libraries.

### 🟢 Beginner Example

**Type-only imports** ensure no runtime `require`/`import` of types-only modules.

```typescript
import type { UserDTO } from "./api-types";

export function formatUser(u: UserDTO): string {
  return `${u.name} <${u.email}>`;
}
```

### 🟡 Intermediate Example

**Tree shaking** needs **ESM** and **pure** modules. Avoid **default export** mega-objects if consumers pull one function — prefer **named exports**.

```typescript
// Easier to shake unused exports
export function formatDate(d: Date): string {
  return d.toISOString();
}
export function parseIso(s: string): Date {
  return new Date(s);
}
```

**Barrel files** (`index.ts` re-exporting everything) can defeat shaking if the bundler pulls the whole barrel. Prefer **direct imports** or **package `exports`** maps in libraries.

```typescript
// packages/ui/src/index.ts — re-exports (consumers may bundle more than needed)
export { Button } from "./Button";
export { Modal } from "./Modal";
// Better for app bundles: import { Button } from "@ui/Button" if package exports allow
```

### 🔴 Expert Example

**Declaration emit** (`.d.ts`) size affects **consumers’** parse/check time, not browser bundle. Use **`stripInternal`** + **`@internal`** JSDoc to omit internal APIs from `.d.ts`.

```typescript
/** @internal */
export function _implDetail(): void {}

export function publicApi(): void {
  _implDetail();
}
```

**`isolatedModules`** and **`importsNotUsedAsValues: "remove"`** (legacy) / **`verbatimModuleSyntax`** align TS with transpilers that compile per file.

### 🌍 Real-Time Example

**Frontend app:** configure bundler **analyze** (e.g. rollup-plugin-visualizer). Duplicate **lodash**? Use **`lodash-es`** + named imports or **`babel-plugin-lodash`**. TypeScript **`paths`** aliases do not shrink bundles — the **bundler** resolves real files.

```typescript
// Prefer
import { debounce } from "lodash-es";
// Over
import _ from "lodash";
```

**Side effects:** `package.json` **`"sideEffects": false`** (or an array of files **with** side effects) helps bundlers drop unused modules — TypeScript does not set this; **author** must declare accurately.

```typescript
// package.json field (conceptual) — valid JSON shape in comments
// "sideEffects": false
// or "sideEffects": ["./src/polyfills.ts"]
```

**Dynamic `import()`** for code splitting: types should stay **`import type`** at top level where possible so the **typechecker** does not confuse **value** vs **type** elision.

```typescript
export async function loadFeature(): Promise<void> {
  const { run } = await import("./feature"); // value import — stays in bundle
  run();
}
```

---

## 5. IDE Performance

The language service (**tsserver**) loads **projects**, follows **references**, computes **completions** and **quick info**. Large **`include`**, huge **`node_modules` typings**, and **pathological types** increase memory and latency.

### 🟢 Beginner Example

Narrow **`include`** / **`exclude`** so the IDE does not scan `dist`, `build`, or generated folders.

```typescript
// Mirrors tsconfig include/exclude — keep generated folders out of the program
const projectScope = {
  include: ["src/**/*.ts", "src/**/*.tsx"],
  exclude: ["node_modules", "dist", "coverage", "**/*.spec.ts"],
} as const;
```

### 🟡 Intermediate Example

**Multiple `tsconfig` files:** use **`tsconfig.app.json`** / **`tsconfig.node.json`** (Vite-style) so tooling for scripts does not type-check the whole browser app together unnecessarily.

```typescript
// Solution-style root tsconfig — "files": [] + references only
const rootSolution = {
  files: [] as string[],
  references: [
    { path: "./tsconfig.app.json" },
    { path: "./tsconfig.node.json" },
  ],
} as const;
```

**`disableSourceOfProjectReferenceRedirect`** — advanced; when `true`, the IDE may use **declaration files** from references instead of source, which can speed **very large** solutions at the cost of jump-to-definition going to `.d.ts`.

### 🔴 Expert Example

**Memory:** split packages, enable **project references**, avoid **10k+** file single projects. **Generated types** (GraphQL, OpenAPI): commit or cache **split** files, not one megabyte **`.ts`** type dump if possible.

**`skipLibCheck: true`** reduces work for both `tsc` and tsserver when processing buggy third-party `.d.ts`.

**`jsx` / `jsxImportSource`:** switching JSX factories (React vs Preact) changes type paths loaded by tsserver; **pin** one factory per project in **`tsconfig.app.json`** to avoid duplicate React type trees.

```typescript
const reactJsxConfig = {
  jsx: "react-jsx",
  jsxImportSource: "react",
} as const;
```

### 🌍 Real-Time Example

**VS Code / Cursor:** **`typescript.tsserver.maxTsServerMemory`** (e.g. 8192) on huge repos. Use **“TypeScript: Restart TS Server”** after bulk codegen. Prefer **workspace version** of TypeScript (**`typescript.tsdk`**) matching CI.

```typescript
// .vscode/settings.json values (apply as JSON in editor settings)
const editorTsSettings = {
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.tsserver.maxTsServerMemory": 8192,
} as const;
```

**Opening only a subfolder** of a monorepo without **workspace** `tsconfig` references can make tsserver miss project boundaries — open the **repo root** or use a **multi-root** workspace file.

---

## 6. Optimization Strategies

Cross-cutting tactics: **cap generic depth**, **alias repeated types**, **flatten nesting**, **scope checking** with configs, **`.tsbuildinfo`**, and **parallel** typecheck in CI.

### 🟢 Beginner Example

**Type alias** repeated object shapes — one resolution site for the checker and clearer errors.

```typescript
type ApiError = { code: string; message: string };

function toError1(e: unknown): ApiError {
  return { code: "unknown", message: String(e) };
}
function toError2(e: unknown): ApiError {
  return { code: "wrap", message: String(e) };
}
```

### 🟡 Intermediate Example

**Selective checking:** `tsconfig.json` for **`tsc --noEmit`** in CI with full `strict`; **`tsconfig.eslint.json`** or path filters for ESLint typed rules on **subset** of files.

```typescript
// tsconfig.ci.json — faster path for eslint typed lint without stories/tests
const ciTypeAwareLint = {
  extends: "./tsconfig.json",
  include: ["src/**/*.ts"],
  exclude: ["**/*.stories.ts", "**/*.test.ts"],
} as const;
```

**Limit deep nesting** in both **code** and **types** — prefer **early returns** and **flat discriminated unions**.

```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(r.error);
  return r.value;
}
```

### 🔴 Expert Example

**Limiting generic complexity:** avoid **`T extends any`** unless needed; constrain with **`extends`** to **minimal** shapes.

```typescript
// T constrained to object with id — less instantiation explosion than unconstrained T
function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((i) => [i.id, i]));
}
```

**Parallel type checking in CI:** run **`tsc -b`** per **project graph** shard or use tools that split by project references; combine with **build caching**.

**`.tsbuildinfo`:** commit **do not** usually — add to **`.gitignore`** but **cache in CI**. Local dev keeps incremental builds fast.

**`singleFile`** / **`disableReferencedProjectLoad`:** rare `tsserver` options for **massive** solutions; discuss with team before toggling — they change how cross-project types resolve.

```typescript
// .vscode/settings.json — only when profiling proves benefit
const advancedTsserver = {
  "typescript.disableReferencedProjectLoad": true,
} as const;
```

### 🌍 Real-Time Example

**Nx / Turborepo:** cache **`tsc` outputs** and **`.tsbuildinfo`** per task hash. **Affected-only** builds run **`tsc -b`** on changed projects + dependents. **Pre-commit:** run **`tsc -p tsconfig.json --noEmit --incremental false`** only on staged files via **`tsc-files`** or **lint-staged** with a **project** that includes those paths — trade correctness vs speed consciously.

```typescript
// turbo.json pipeline (conceptual)
// "tasks": { "typecheck": { "dependsOn": ["^typecheck"], "outputs": [] } }
```

**Parallelism:** `tsc` itself is largely **single-threaded** per invocation; **parallelize at the task level** (multiple packages, `npm run -ws`, Nx targets) rather than expecting one `tsc` process to use all cores.

```typescript
// npm workspaces — typecheck packages in parallel (separate processes)
const workspaceScripts = {
  "typecheck:all": "npm run typecheck --workspaces --if-present",
} as const;
```

---

## Measuring Performance

Before changing ten flags, **measure** where time goes: **parse**, **bind**, **check**, **emit**, and **I/O** show up in diagnostics and traces.

### Compiler diagnostics (CLI)

```typescript
// Run from terminal — not TypeScript source, but the commands you script in CI
// tsc -p tsconfig.json --extendedDiagnostics
// tsc -p tsconfig.json --generateTrace ./trace && npx @typescript/analyze-trace trace
```

**`--extendedDiagnostics`** prints counts: files, lines, identifiers, types, cache hits. **Regressions** often show up as **type count** or **memory** spikes before wall clock doubles.

### 🟢 Beginner Example

```typescript
// After a refactor, compare diagnostics output saved to a file in CI artifacts
const baseline = {
  Files: 420,
  Lines: 120000,
  Memory_used: "450MB",
} as const;
// If "Types" or "Instantiations" jumps 3× while lines grew 10% — simplify generics
```

### 🟡 Intermediate Example

**Trace analysis:** `--generateTrace` produces Chrome **about:tracing** compatible data; **`@typescript/analyze-trace`** highlights **hot types** and **long checks**.

```typescript
// package.json devDependency for occasional deep dives
const devDeps = {
  "@typescript/analyze-trace": "^0.10.0",
} as const;
```

### 🔴 Expert Example

**Split programs:** if trace shows one **barrel** file pulling half the graph, **remove** the barrel from critical paths or **replace** with direct imports — both **tsc** and **tsserver** benefit.

```typescript
// anti-pattern for trace size: export * from every module
// export * from "./a";
// export * from "./b";
// ... 200 modules — every consumer parses the universe

// prefer explicit public API surface
export { createClient } from "./client";
export type { ClientOptions } from "./types";
```

### 🌍 Real-Time Example

**Weekly budget:** track **`tsc --noEmit`** duration in CI; alert when **p95** exceeds **N minutes**. Pair with **LOC** and **dependency** growth to decide **project split** vs **type simplification**.

```typescript
// GitHub Actions (conceptual step)
// - run: time npx tsc -p tsconfig.json --noEmit
// - upload extendedDiagnostics log as artifact on main
```

---

## Best Practices

- **Turn on `incremental`** and **cache `.tsbuildinfo`** in CI for composite or medium/large projects.
- **Use `skipLibCheck: true`** for app repos unless you maintain problematic typings yourself.
- **Prefer `const` object + `as const` + union types** over runtime enums when you do not need reverse maps.
- **Use `import type`** and **`verbatimModuleSyntax`** to keep type imports from becoming runtime imports.
- **Split monolith TS projects** with **project references** and **`tsc -b`** for scalable builds.
- **Tighten `include`/`exclude`** for faster IDE and CLI; keep generated output out of the program.
- **Raise `target`/`module`** to match deployment when possible to reduce emit size and helpers.
- **Simplify public types**; push complex conditional types to **type utilities** used sparingly.
- **Align editor TypeScript version** with CI and **`package.json`**.
- **Measure**: `tsc --extendedDiagnostics`, `tsc --generateTrace`, bundler analyzers — optimize what the trace proves is slow.
- **Prefer `tsc -b`** in monorepos so **dependency order** and **incremental** state stay consistent across packages.
- **Document** which packages are **`composite`** and **consumers of `.d.ts`** so new code does not accidentally import **src** across boundaries.
- **Keep `node_modules` deduplicated** — duplicate `@types` trees inflate parse time; fix with **overrides** / **resolutions** when needed.
- **Use `rootDir` / `outDir` explicitly** in libraries to avoid accidental inclusion of stray `.ts` files under the package root.
- **Run typecheck in CI on every PR** even when dev uses **swc/esbuild** for bundling — emit speed must not hide **type errors**.
- **Review `types` field** in tsconfig: empty **`types: []`** for libraries avoids accidental global `@types/node` leakage into browser code.
- **Prefer discriminated unions** over **excessive overload sets** — overload resolution can be hot in large APIs.

---

## Common Mistakes

- **Giant single `tsconfig`** spanning apps, tests, stories, and scripts — slows **every** IDE action.
- **Barrel exports** that re-export half the library — accidental **bundle bloat** and slower resolution.
- **`const enum` in published libraries** — breaks or surprises consumers using **Babel/swc** without const inlining.
- **Assuming `paths` aliases** shrink or organize runtime bundles — only the **bundler** tree-shakes; wrong alias patterns can duplicate modules.
- **Over-using mapped types and deep recursion** on **hot** component props — triggers “excessively deep” errors and sluggish hover.
- **Omitting `composite` / `declaration`** on referenced projects — breaks **`tsc -b`** assumptions and forces full re-checks.
- **`skipLibCheck: false`** everywhere for “maximum safety” on **thousands** of `.d.ts` files — often **pays** little vs the time cost.
- **Low `target` “for compatibility”** without polyfill strategy — larger, slower JS than necessary.
- **Checking in stale `.tsbuildinfo`** or mixing **stale `dist/`** with **incremental** — confusing incremental state; prefer **clean** + **cache** in CI.
- **Relying only on IDE transpile** and never **`tsc --noEmit` / `tsc -b`** in CI — **ship** broken types while editing feels fine.
- **Importing values from `dist/`** of workspace packages during development — bypasses **references** and can double-compile or confuse **source maps**.
- **`any` or `// @ts-ignore` to silence slow types** — hides bugs; **narrow** or **refactor** the type instead.
- **Huge `extends` chains** across ten shared tsconfig packages — hard to reason about **final** options; **flatten** or **document** the effective config.
- **Checking in generated `.ts` files** (10k+ lines) into the same project that also generates them — tsserver thrashes on regen; **exclude** or **separate project**.
- **Using `preserveValueImports` / mixed emit** without understanding bundler — can leave **type-only** imports as runtime if misconfigured.
- **Ignoring `moduleResolution`** when upgrading TS — wrong resolution pulls **more** files into the program than necessary.
- **Circular file imports** (not just types) — runtime hazard and often **more** graph work for the checker.

---

*TypeScript performance is a stack concern: compiler flags, type design, emit target, bundler, and editor all interact. Tune the bottleneck you measure, not every knob at once.*
