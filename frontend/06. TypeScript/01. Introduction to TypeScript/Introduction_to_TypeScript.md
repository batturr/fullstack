# Introduction to TypeScript

TypeScript is a **typed superset of JavaScript** that compiles to plain JavaScript. You write `.ts` (or `.tsx` with JSX) source code, get fast feedback from the type checker during development, and ship JavaScript that runs anywhere JS runs—browsers, Node.js, Deno, Bun, and edge runtimes. This guide introduces what TypeScript is, how the compiler fits together, and how to install and run it with practical examples at every level.

---

## 📑 Table of Contents

1. [What is TypeScript?](#1-what-is-typescript)
   - 1.1 History and background
   - 1.2 TypeScript vs JavaScript
   - 1.3 Why TypeScript?
   - 1.4 TypeScript adoption in industry
   - 1.5 TypeScript versioning
2. [TypeScript Architecture](#2-typescript-architecture)
   - 2.1 TypeScript Compiler (`tsc`)
   - 2.2 Compilation process
   - 2.3 Type checking vs transpilation
   - 2.4 `tsc` vs Babel vs esbuild vs SWC
3. [Setting Up TypeScript](#3-setting-up-typescript)
   - 3.1 Installing TypeScript
   - 3.2 IDE setup (VS Code, WebStorm)
   - 3.3 TypeScript Playground
   - 3.4 Running TypeScript files (`tsc`, `ts-node`, `tsx`)
   - 3.5 `ts-node` for development
   - 3.6 First program, compile, run, and annotations
4. [Best Practices](#4-best-practices)
5. [Common Mistakes to Avoid](#5-common-mistakes-to-avoid)
6. [Comparison Tables](#6-comparison-tables)

---

## 1. What is TypeScript?

### 1.1 History and background

TypeScript was created at **Microsoft**, led by **Anders Hejlsberg** (also known for C# and Delphi). The language was **first announced in October 2012** as a way to scale JavaScript development with optional static types, better tooling, and safer refactors. Early versions focused on classes and modules aligned with where ECMAScript was heading; over time TypeScript became the **de facto standard** for large front-end and full-stack codebases.

**Milestones (high level):**

| Period | Notes |
|--------|--------|
| 2012 | Public preview; structural typing on top of JS |
| 2014 | TypeScript 1.0 stable release |
| 2015–2016 | ES6 alignment, union types, `async`/`await` typing |
| 2018 | Project references, conditional types groundwork |
| 2020+ | Template literal types, variadic tuples, performance work |
| 2023+ | TypeScript 5.x: decorators (modern), `const` type parameters, ongoing inference improvements |

TypeScript is **open source** ([typescriptlang.org](https://www.typescriptlang.org/)) and evolves through the [TypeScript roadmap](https://github.com/microsoft/TypeScript/wiki/Roadmap) and yearly releases.

### 1.2 TypeScript vs JavaScript

**JavaScript** is the runtime language engines execute. **TypeScript** is JavaScript **plus** a static type layer that is **erased** when you compile—types do not exist at runtime unless you add explicit checks or use libraries that validate data.

**At a glance — TypeScript vs JavaScript**

| Aspect | JavaScript | TypeScript |
|--------|------------|------------|
| **Relationship to JS** | The language runtimes execute | Superset: valid JS is (almost always) valid TS |
| **Typing** | Dynamic; types inferred at runtime | Static types + inference; checked before run |
| **Syntax** | Standard ECMAScript | ECMAScript + type annotations, interfaces, enums, etc. |
| **Compilation** | Usually none (interpreted/JIT) | `tsc` or another tool strips types / emits JS |
| **Errors** | Often surface at runtime | Many logic/API mistakes caught while editing or in CI |
| **Tooling** | Good debugging, profilers | Rich autocomplete, refactor, “find all references” |
| **Learning curve** | Gentler start | Extra concepts: generics, `strict`, module resolution |
| **Typical use** | Scripts, small sites, quick prototypes | Apps, libraries, teams, long-lived codebases |
| **Gradual adoption** | N/A | `allowJs`, `// @ts-check`, JSDoc types in `.js` files |

**Concept:** Writing the same idea in JS vs TS

### 🟢 Beginner Example

Plain JavaScript allows any value; mistakes show up at runtime.

```javascript
// Plain .js — the engine accepts this until you call greet(42):
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
// greet(42); // runtime error: name.toUpperCase is not a function
```

With TypeScript, you annotate so the mistake is caught **before** you run.

```typescript
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}
// greet(42); // Error: Argument of type 'number' is not assignable to 'string'
```

### 🟡 Intermediate Example

Modeling a small domain with interfaces and unions—still valid JS after emit, but TS guides you.

```typescript
type Status = "pending" | "paid" | "failed";

interface Invoice {
  id: string;
  amountCents: number;
  status: Status;
}

function summarize(invoice: Invoice): string {
  return `${invoice.id}: ${invoice.status} (${invoice.amountCents / 100} USD)`;
}
```

### 🔴 Expert Example

Using `satisfies` (TS 4.9+) to keep **literal** types for keys while still checking shape—useful for config maps and API route tables.

```typescript
const routes = {
  home: "/",
  profile: "/me",
  settings: "/settings",
} as const satisfies Record<string, `/${string}`>;

type RouteKey = keyof typeof routes; // "home" | "profile" | "settings"
```

### 🌍 Real-Time Example

In production, shared **DTO** (data transfer object) types between a Node API and a web app prevent drift when fields are renamed or optional fields change.

```typescript
// Shared package or monorepo type used by server + client
export type CreateOrderRequest = {
  customerId: string;
  lineItems: ReadonlyArray<{ sku: string; qty: number }>;
  currency: "USD" | "EUR" | "GBP";
};

// Server handler: wrong property names fail at compile time
declare function parseBody(): unknown;
function isCreateOrderRequest(v: unknown): v is CreateOrderRequest {
  // In real code use Zod/io-ts; here we illustrate the intent
  return typeof v === "object" && v !== null;
}

export function handleCreateOrder(raw: unknown) {
  if (!isCreateOrderRequest(raw)) throw new Error("Invalid body");
  const body: CreateOrderRequest = raw;
  return { ok: true as const, received: body.lineItems.length };
}
```

### 1.3 Why TypeScript?

- **Type safety:** Catch invalid states, wrong arguments, and impossible branches early.
- **IDE support:** Autocomplete, jump to definition, rename symbol across files.
- **Refactoring:** Rename APIs and imports with confidence in large codebases.
- **Documentation:** Types act as inline contracts for functions and modules.
- **Large-scale apps:** Teams coordinate through explicit shapes and stricter compiler options (`strict`).

**Concept:** Benefits in everyday code

### 🟢 Beginner Example

Catch typos on object property access.

```typescript
const user = { firstName: "Ada", lastName: "Lovelace" };
// user.fstName; // Error: Property 'fstName' does not exist
```

### 🟡 Intermediate Example

Exhaustive checking with `never` in a `switch` so new enum/union members force updates.

```typescript
type Theme = "light" | "dark";

function themeClass(theme: Theme): string {
  switch (theme) {
    case "light":
      return "theme-light";
    case "dark":
      return "theme-dark";
    default: {
      const _exhaustive: never = theme;
      return _exhaustive;
    }
  }
}
```

### 🔴 Expert Example

Branded types to avoid mixing IDs of the same underlying primitive.

```typescript
type UserId = string & { readonly __brand: unique symbol };
type OrderId = string & { readonly __brand: unique symbol };

function toUserId(id: string): UserId {
  return id as UserId;
}

function getOrder(userId: UserId, orderId: OrderId) {
  return { userId, orderId };
}

// getOrder(orderId, userId); // compile error if argument order flips
```

### 🌍 Real-Time Example

Feature flags or experiment keys as **string literal unions** prevent deploying references to removed flags.

```typescript
type FeatureFlag = "newCheckout" | "betaDashboard" | "searchV2";

function isEnabled(flag: FeatureFlag, ctx: { flags: ReadonlySet<FeatureFlag> }): boolean {
  return ctx.flags.has(flag);
}
```

### 1.4 TypeScript adoption in industry

TypeScript is widely used in **open-source** and **enterprise** stacks. Examples (non-exhaustive):

- **Meta:** Heavy use of Flow historically; much of the ecosystem uses TypeScript today for libraries and tooling.
- **Google:** Angular is TypeScript-first; internal tooling and libraries often use TS.
- **Microsoft:** TypeScript itself, VS Code ecosystem, Azure SDKs.
- **Airbnb, Slack, Asana, Shopify:** Large TS frontends and/or Node services (public engineering posts and repos).
- **Startups and agencies:** Default choice for React/Next.js, NestJS, and tRPC-style full-stack typing.

**Takeaway:** Learning TypeScript aligns with how modern **React**, **Vue 3 + TS**, **Angular**, **Next.js**, **NestJS**, and many **npm** libraries are authored and consumed.

**Concept:** How industry adoption changes the way you write and consume code

### 🟢 Beginner Example

Install a popular library and notice that your editor suggests typed methods because the package ships types or uses **`@types/<package>`** from DefinitelyTyped.

```typescript
// After: npm install express && npm install -D @types/express
import express from "express";
const app = express();
app.get("/", (_req, res) => {
  res.send("OK"); // res is typed — autocomplete for .json(), .status(), etc.
});
```

### 🟡 Intermediate Example

Consume an internal REST client where response shapes are shared as **`interface`** definitions—onboarding developers discover the API by reading types instead of only PDF docs.

```typescript
interface UserDto {
  id: string;
  displayName: string;
  role: "admin" | "member";
}

declare function fetchUser(id: string): Promise<UserDto>;

async function showUser(id: string) {
  const user = await fetchUser(id);
  return user.displayName.toUpperCase();
}
```

### 🔴 Expert Example

Monorepo **`paths`** aliases and a **`@acme/types`** package publish **versioned** DTOs so frontend, BFF, and workers never disagree on field names.

```typescript
// packages/types/src/order.ts
export type OrderId = string;
export interface OrderSummary {
  id: OrderId;
  totalCents: number;
  placedAt: string; // ISO-8601
}
```

### 🌍 Real-Time Example

A **Next.js** app and a **NestJS** API in the same repo import identical types for query params and payloads; CI runs **`tsc --noEmit`** in both packages so a breaking API change fails the build before deploy.

### 1.5 TypeScript versioning

TypeScript uses **semantic-style** major.minor releases (e.g. `5.8.x`). You typically pin **`typescript`** in `devDependencies` per project.

**Major versions and representative features:**

| Version | Era | Notable themes |
|---------|-----|----------------|
| **1.x** | 2014+ | Core language, ES6 emit alignment |
| **2.x** | 2016+ | Strict null checks, control flow analysis |
| **3.x** | 2018+ | Project references, `unknown`, improved tuples |
| **4.x** | 2020+ | Variadic tuples, template literal types, `satisfies` |
| **5.x** | 2023+ | Decorators (standard direction), performance, `const` type parameters, ongoing refinements |

**Practical rule:** Match your **TypeScript** version to what your **framework** and **@types/\*** packages support. Upgrade in small steps and read the [Release Notes](https://devblogs.microsoft.com/typescript/).

**Concept:** Choosing and upgrading the compiler for your team or library

### 🟢 Beginner Example

Check what you are running locally:

```bash
npx tsc --version
```

### 🟡 Intermediate Example

Pin **`typescript`** in **`devDependencies`** and use the same major.minor in every service in a repo (or document allowed range in `README`).

```json
{
  "devDependencies": {
    "typescript": "~5.8.0"
  }
}
```

### 🔴 Expert Example

Library authors test against **multiple** TypeScript versions in CI (e.g. current + previous minor) to avoid shipping `.d.ts` files that break consumers on older compilers.

```typescript
// Public API must use syntax supported by your stated peer dependency range
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

### 🌍 Real-Time Example

Enterprise platforms align TypeScript upgrades with **Angular** or **Next.js** LTS support matrices; release trains include a dedicated “compiler bump” sprint to fix new **`strict`** diagnostics.

---

## 2. TypeScript Architecture

### 2.1 TypeScript Compiler (`tsc`) — how it works

The **`tsc`** program is the official compiler CLI and API. At a high level it:

1. **Reads** your program (entry files + imports), `tsconfig.json`, and type definitions (`.d.ts`).
2. **Parses** source into an AST (abstract syntax tree).
3. **Binds** symbols (what name refers to what declaration).
4. **Checks** types according to the rules you enabled (`strict`, `noImplicitAny`, etc.).
5. **Transforms** (lowers) modern syntax to your **`target`** (e.g. ES2020 → ES5 if configured).
6. **Emits** JavaScript (and optionally `.d.ts`, source maps, declarations maps).

You can use **`tsc --noEmit`** to type-check only (common in CI).

**Concept:** mental model of the pipeline

### 🟢 Beginner Example

```typescript
// file: hello.ts
const msg: string = "Hello, TypeScript";
console.log(msg);
```

Run:

```bash
npx tsc hello.ts
```

You get `hello.js` next to it (default options) containing `console.log(...)` without `: string`.

### 🟡 Intermediate Example

`tsconfig.json` controls **where** output goes and **how** strict checking is.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### 🔴 Expert Example

**Project references** split a monorepo into buildable units; `tsc -b` orchestrates dependency order and incremental `.tsbuildinfo` files for faster rebuilds.

```json
// tsconfig.packages.json (illustrative fragment)
{
  "files": [],
  "references": [{ "path": "./packages/core" }, { "path": "./packages/app" }]
}
```

### 🌍 Real-Time Example

In CI, teams often run:

```bash
npx tsc -p tsconfig.json --noEmit
```

This validates **all** project files without writing JS—emit stays with **Vite**, **esbuild**, or **SWC** in many setups.

### 2.2 Compilation process (TS → type checking → JS output)

End-to-end flow:

```text
.ts / .tsx sources
        │
        ▼
   Parse & bind
        │
        ▼
   Type check  ──► errors reported (blocks emit if configured)
        │
        ▼
   Transform (downlevel + module format)
        │
        ▼
   Emit .js (+ .map, .d.ts optional)
```

**Important:** Type errors can still allow emit if **`noEmitOnError`** is `false` (default). For safety, CI should treat type errors as failures regardless.

**Concept:** Separating “will it run?” from “is it correct?”

### 🟢 Beginner Example

```typescript
const n: number = "oops"; // Type error
```

Even if JS were emitted, the logic is wrong—TypeScript surfaces that immediately.

### 🟡 Intermediate Example

```typescript
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("division by zero");
  return a / b;
}
```

Types do not prevent **all** runtime issues; they complement tests and validation.

### 🔴 Expert Example

`isolatedModules` (required by **Babel** / **esbuild**-style transpilers) restricts patterns that need cross-file analysis to emit safely per file.

```typescript
// Avoid const enum in isolated transpilation pipelines; prefer union literals or regular enums
type Role = "admin" | "member";
```

### 🌍 Real-Time Example

Build pipeline:

1. **`tsc --noEmit`** or **`eslint`** with type-aware rules for correctness.
2. **`vite build`** or **`esbuild`** for fast bundling and minification.

### 2.3 Type checking vs transpilation

| Concern | Type checking | Transpilation |
|--------|----------------|---------------|
| **Goal** | Prove consistency of types | Rewrite syntax to a target JS version |
| **Output** | Diagnostics (errors/warnings) | JavaScript (and maps) |
| **Runtime** | Types erased; no runtime types | Changes what engines execute (e.g. `async`, JSX) |
| **Who** | TypeScript checker | `tsc`, Babel, esbuild, SWC |

**JSX example:** TypeScript understands `.tsx` and emits `React.createElement` (or new JSX runtime calls) depending on `jsx` settings—that is **transpile** work **plus** type checking for props.

**Concept:** JSX, props, and type checking

### 🟢 Beginner Example

Use a `.tsx` file with `"jsx": "react-jsx"` (or `"react"`) in `tsconfig` and `react` + `@types/react` installed. TypeScript checks that `title` is a string.

```typescript
// Heading.tsx
type Props = { title: string };

export function Heading(props: Props) {
  return <h1>{props.title}</h1>;
}
```

### 🟡 Intermediate Example

```typescript
type ButtonProps = {
  variant?: "primary" | "secondary";
  onClick?: () => void;
};

declare function Button(props: ButtonProps): JSX.Element;
```

### 🔴 Expert Example

Discriminated props for a compound component API—`title` exists only when `open` is true (common in design systems).

```typescript
type ModalProps =
  | { open: true; title: string; children: unknown }
  | { open: false };

function describeModal(props: ModalProps): string {
  if (!props.open) return "closed";
  return `open: ${props.title}`;
}
```

### 🌍 Real-Time Example

**Design systems** ship `.d.ts` so consumers get prop checking and deprecated prop warnings via JSDoc/`@deprecated`.

### 2.4 `tsc` vs Babel vs esbuild vs SWC

See [Comparison Tables](#6-comparison-tables) for a grid; here is how you **choose** in practice:

- **`tsc`:** Official, full type program, great for libraries emitting `.d.ts`, and for `tsc -b` references.
- **Babel (`@babel/preset-typescript`):** Strips types; **does not** type-check—pair with `tsc --noEmit` or IDE.
- **esbuild:** Extremely fast transpile; **no** full type checking—pair with `tsc` or editor diagnostics.
- **SWC (Speedy Web Compiler):** Same category as esbuild for many workflows (e.g. Next.js); still pair with **`tsc`** when you need a standalone type-check step.

**Concept:** Same source file, different tool responsibilities

### 🟢 Beginner Example

```typescript
const x: number = 1;
```

- **esbuild:** strips `: number`, emits `const x = 1;` quickly.
- **tsc:** checks and emits according to `target`.

### 🟡 Intermediate Example

Monorepo script pattern:

```json
{
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "build": "vite build"
  }
}
```

### 🔴 Expert Example

**Path mapping** (`paths` in `tsconfig`) is understood by `tsc` and editors; bundlers need **aliases mirrored** in `vite.config.ts` / `webpack` resolve.

### 🌍 Real-Time Example

Large apps: **SWC** in Next.js for speed + **TypeScript** for types; CI runs `next build` which fails on type errors when configured.

---

## 3. Setting Up TypeScript

### 3.1 Installing TypeScript

**Global install (quick experiments):**

```bash
npm install -g typescript
tsc --version
```

**Per-project (recommended):**

```bash
mkdir my-ts-app && cd my-ts-app
npm init -y
npm install -D typescript
npx tsc --init
```

This creates a starter **`tsconfig.json`**. Prefer **local** `typescript` so the whole team uses the same version.

**Concept:** Pinning the TypeScript compiler version

### 🟢 Beginner Example

```bash
npm install -D typescript@5.8
```

### 🟡 Intermediate Example

Use **`engines`** in `package.json` or Volta/asdf to pin Node + npm versions alongside TS.

### 🔴 Expert Example

**pnpm** / **Yarn** workspaces hoist `typescript` once; packages reference the same compiler for consistent `tsserver` behavior.

### 🌍 Real-Time Example

Lockfile + `npm ci` in CI guarantees reproducible builds.

### 3.2 IDE setup (VS Code, WebStorm)

**Visual Studio Code**

- Built-in TypeScript support uses the workspace version when you select **“Use Workspace Version”** (Command Palette: “TypeScript: Select TypeScript Version”).
- Helpful extensions: ESLint (`dbaeumer.vscode-eslint`), optional Prettier.

**WebStorm / IntelliJ**

- First-class TS support: inspections, refactorings, test runner integration.
- Point the IDE to the project’s `typescript` package in settings if needed.

**Concept:** Editor feedback loop (IntelliSense and refactors)

### 🟢 Beginner Example

Hover a variable to see inferred type `string`.

### 🟡 Intermediate Example

Use **rename symbol** on an interface field; all usages update.

### 🔴 Expert Example

Enable **`strict`** and **`noUncheckedIndexedAccess`** for stricter indexing—editor shows extra `undefined` possibilities.

### 🌍 Real-Time Example

Shared **`tsconfig.eslint.json`** for type-aware lint rules catches issues `tsc` might not flag depending on config.

### 3.3 TypeScript Playground

The **[TypeScript Playground](https://www.typescriptlang.org/play)** runs the compiler in the browser. Use it to:

- Share repros with options in the URL.
- Compare **nightly** vs **stable** behavior.
- Prototype types without a local project.

**Concept:** Quick experiments without a local project

### 🟢 Beginner Example

Paste a function and watch red squiggles when arguments mismatch.

### 🟡 Intermediate Example

Toggle **`strictNullChecks`** in the options sidebar and observe flow narrowing changes.

### 🔴 Expert Example

Test **recursive conditional types** with instant feedback (mind performance in real repos).

### 🌍 Real-Time Example

Paste a simplified API response and iterate on `type`/`interface` until `satisfies` matches real JSON.

### 3.4 Running TypeScript files (`tsc`, `ts-node`, `tsx`)

| Tool | Role |
|------|------|
| **`tsc`** | Compile `.ts` → `.js`, then run with `node dist/app.js` |
| **`ts-node`** | REPL / on-the-fly transpile + type check options for scripts |
| **`tsx`** | Fast Node runner using esbuild; great for scripts (verify typecheck separately) |

**Compile then run:**

```bash
npx tsc
node dist/index.js
```

**One-shot compile single file:**

```bash
npx tsc src/index.ts --outDir dist --target ES2022 --module CommonJS
```

**Concept:** Choosing a dev workflow (compile vs on-the-fly)

### 🟢 Beginner Example

```bash
npx ts-node src/hello.ts
```

### 🟡 Intermediate Example

```bash
npx tsx watch src/server.ts
```

### 🔴 Expert Example

`ts-node` with **`ts-node/esm`** loader for ESM in Node, aligned with `"type": "module"`—requires coherent `moduleResolution` settings.

### 🌍 Real-Time Example

**Docker** images run compiled JS (`node dist/main.js`) for smaller surface and faster cold start; TS stays a dev dependency.

### 3.5 `ts-node` for development (setup and usage)

Install:

```bash
npm install -D ts-node @types/node
```

**`tsconfig.json` snippet:**

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node10",
    "esModuleInterop": true,
    "strict": true
  },
  "ts-node": {
    "transpileOnly": true
  }
}
```

- **`transpileOnly: true`:** fastest; skips type checking (rely on `tsc --noEmit` elsewhere).
- Omit `transpileOnly` when you want **`ts-node`** to type-check each run (slower).

**Concept:** npm scripts with `ts-node`

### 🟢 Beginner Example

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts"
  }
}
```

### 🟡 Intermediate Example

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "dev": "ts-node --transpile-only src/index.ts"
  }
}
```

### 🔴 Expert Example

Use **`NODE_OPTIONS='--loader ts-node/esm'`** (Node 18+) for ESM + `ts-node` in advanced setups; validate against your Node LTS.

### 🌍 Real-Time Example

**Ad-hoc migrations** and **one-off admin scripts** in `scripts/` folder, executed with `ts-node`, while production uses compiled output.

---

### First TypeScript program (end-to-end)

**`src/hello.ts`**

```typescript
function main(): void {
  const message: string = "Hello from TypeScript";
  console.log(message);
}

main();
```

**Compile and run**

```bash
npx tsc src/hello.ts --outDir dist --target ES2022 --module ES2022
node dist/hello.js
```

### Basic type annotations vs JavaScript

**JavaScript (dynamic):**

```javascript
function add(a, b) {
  return a + b;
}
add("1", 2); // "12" — silent logic bug
```

**TypeScript (annotated):**

```typescript
function add(a: number, b: number): number {
  return a + b;
}
// add("1", 2); // compile-time error
```

Inference still works—annotations are not always required:

```typescript
const title = "Learning TS"; // inferred as string
const scores = [95, 88, 76]; // inferred as number[]
```

**Concept:** When to add explicit type annotations

### 🟢 Beginner Example

Annotate function boundaries (parameters/returns) for clarity.

### 🟡 Intermediate Example

Let TS infer locals; annotate **public** APIs and **complex** returns.

### 🔴 Expert Example

Use **`satisfies`** and **helper generics** to avoid widening literals in config objects.

### 🌍 Real-Time Example

**OpenAPI** or **GraphQL codegen** generates types—annotate hand-written glue code only where inference fails.

---

## 4. Best Practices

- **Enable `strict`** (or progressively adopt strict flags) for new projects.
- **Pin `typescript` locally**; use the workspace TS version in VS Code.
- **Treat type errors as build failures** in CI (`tsc --noEmit` or framework equivalent).
- **Separate concerns:** fast transpiler for dev builds + `tsc` for truth (or unified `tsc` if simple).
- **Prefer `unknown` over `any`** at boundaries (JSON, user input) and narrow with guards.
- **Document public APIs** with explicit types and short examples in TSDoc where helpful.
- **Keep `tsconfig` lean**—use community bases (e.g. `@tsconfig/node-lts`) as starting points.

---

## 5. Common Mistakes to Avoid

- **Assuming types exist at runtime** — they do not; validate external data with schemas.
- **Using `any` to silence errors** — hides bugs; use precise types, `unknown`, or targeted assertions.
- **Relying on Babel/esbuild alone** for safety — remember they do not replace **`tsc`** checks unless you run checker separately.
- **Ignoring `tsconfig` `include`/`exclude`** — accidentally compiling huge folders slows IDEs and builds.
- **Global install only** — teammates drift across TS versions; prefer devDependency.
- **`noEmitOnError: false` surprises** — emitted JS may be wrong; gate releases on clean typecheck.
- **Mixing ESM/CJS** without aligned **`module`**, **`moduleResolution`**, and **`package.json` `type`** — leads to painful import errors.

---

## 6. Comparison Tables

### TypeScript vs JavaScript

| Aspect | JavaScript | TypeScript |
|--------|------------|------------|
| **Execution** | Runs directly in engines | Compiled/transpiled to JS before run (or via tooling) |
| **Types** | Dynamic; optional JSDoc | Static type layer; erased at emit |
| **Tooling** | Good | Rich: safer refactors, inline docs |
| **Learning curve** | Lower initially | Moderate: types + compiler options |
| **Typical use** | Scripts, small tools | Apps, libraries, large teams |
| **Interop** | N/A | Can adopt gradually in `.js` with `// @ts-check` and JSDoc |

### `tsc` vs Babel vs esbuild vs SWC

| Capability | `tsc` | Babel + TS preset | esbuild | SWC |
|------------|-------|-------------------|---------|-----|
| **Full type checking** | Yes | No (strip-only) | No | No |
| **Emit speed** | Moderate | Moderate | Very fast | Very fast |
| **JSX** | Yes | Yes | Yes | Yes |
| **Declaration `.d.ts`** | Excellent | Via `tsc` usually | Limited / often paired with `tsc` | Often paired with `tsc` |
| **Typical pairing** | Libraries, `tsc -b` | Older pipelines | Vite, scripts, bundling | Next.js, Jest (`babel-jest` replacement), Rust-based toolchains |

**Rule of thumb:** If a tool only **transpiles**, run **`tsc --noEmit`** (or equivalent) somewhere in CI unless your framework already enforces type errors on build.

---

**Further reading:** [TypeScript Handbook — The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html), [TSConfig Reference](https://www.typescriptlang.org/tsconfig/), and your next module in this course: **TypeScript Basics** (`tsconfig`, primitives, inference).
