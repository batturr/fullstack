# TypeScript Tooling and Ecosystem

TypeScript’s value comes not only from the type system but from the **toolchain** around it: the compiler (`tsc`), bundlers and transpilers, linters, formatters, test runners, doc generators, and migration helpers. This guide ties those pieces together with practical examples from beginner setups to expert automation, plus real-world patterns you can drop into CI and editor workflows.

---

## 📑 Table of Contents

1. [TypeScript Compiler (`tsc`)](#1-typescript-compiler-tsc)
2. [Build Tools Integration](#2-build-tools-integration)
3. [Linting](#3-linting)
4. [Formatting](#4-formatting)
5. [Testing Tools](#5-testing-tools)
6. [Documentation](#6-documentation)
7. [Migration Tools](#7-migration-tools)
8. [Best Practices](#8-best-practices)
9. [Common Mistakes](#9-common-mistakes)

---

## 1. TypeScript Compiler (`tsc`)

The **TypeScript compiler** (`tsc`) parses `.ts`/`.tsx`, performs type checking, and **emits** JavaScript according to `tsconfig.json`. You can run it as a CLI, in **watch** mode for local dev, in **build** mode for monorepos with project references, or **programmatically** via the Compiler API for custom tooling.

**CLI highlights**

| Flag / mode | Role |
|-------------|------|
| `tsc` | Type-check + emit using nearest `tsconfig.json` |
| `tsc --noEmit` | Type-check only (CI, pre-commit) |
| `tsc --watch` / `-w` | Recompile on file changes |
| `tsc -b` / `--build` | Build mode: ordered builds, incremental `.tsbuildinfo` |
| `tsc --showConfig` | Print resolved config (debugging) |
| `tsc --init` | Scaffold `tsconfig.json` |
| `tsc -p path` | Use a specific `tsconfig` path |
| `tsc --pretty` | Colorized, context-rich diagnostics (default in TTY) |
| `tsc --incremental` | Write `.tsbuildinfo` for faster rebuilds |
| `tsc -b --clean` | Remove outputs for referenced projects |
| `tsc --listFiles` | Print input files (debug resolution) |
| `tsc --traceResolution` | Verbose module resolution trace |

**Emit vs check-only**

| Goal | Typical command |
|------|-----------------|
| Ship JS to `dist/` | `tsc -p tsconfig.build.json` |
| PR / gate | `tsc --noEmit` |
| IDE parity in CI | Same `tsconfig` path as local |

**Build mode** (`tsc -b`) shines with **`composite`** projects and **`references`**: TypeScript builds dependency graphs, supports **incremental** compilation, and can run **`--clean`**. The **Compiler API** (`typescript` package) exposes `createProgram`, `emit`, transformers, and the language service hooks used by IDEs.

### 🟢 Beginner Example

Compile a small project: install TypeScript, add a config, run `tsc`.

```typescript
// src/greet.ts — input
export function greet(name: string): string {
  return `Hello, ${name}`;
}
```

```typescript
// Typical workflow (commands shown as comments — run in terminal):
// npm init -y
// npm install -D typescript
// npx tsc --init
// npx tsc
// Output: emits .js next to .ts unless "outDir" is set
```

A minimal `tsconfig.json` often includes `"strict": true`, `"module"`, `"target"`, and `"outDir"`.

### 🟡 Intermediate Example

**Watch mode** for local development and **`--noEmit`** in CI so you fail on type errors without writing files.

```typescript
// package.json scripts (conceptual — JSON structure):
// "scripts": {
//   "build": "tsc -p tsconfig.build.json",
//   "typecheck": "tsc --noEmit -p tsconfig.json",
//   "watch": "tsc -w -p tsconfig.json"
// }
```

**Build mode** with project references (simplified pattern):

```typescript
// tsconfig.base.json — shared options
// {
//   "compilerOptions": {
//     "composite": true,
//     "declaration": true,
//     "declarationMap": true,
//     "incremental": true,
//     "strict": true,
//     "module": "NodeNext",
//     "moduleResolution": "NodeNext",
//     "skipLibCheck": true
//   }
// }
```

```typescript
// packages/core/tsconfig.json
// {
//   "extends": "../../tsconfig.base.json",
//   "compilerOptions": { "outDir": "dist", "rootDir": "src" },
//   "include": ["src"]
// }
```

```typescript
// packages/app/tsconfig.json
// {
//   "extends": "../../tsconfig.base.json",
//   "references": [{ "path": "../core" }],
//   "compilerOptions": { "outDir": "dist", "rootDir": "src" },
//   "include": ["src"]
// }
// Build from repo root: tsc -b packages/core packages/app
```

### 🔴 Expert Example

**Compiler API**: create a program, emit, or inspect diagnostics programmatically (custom linters, codegen, migration scripts).

```typescript
import * as ts from "typescript";

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(message);
    }
  });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Emit ${emitResult.emitSkipped ? "skipped" : "completed"}, exit ${exitCode}`);
}

// compile(["src/index.ts"], { noEmitOnError: true, target: ts.ScriptTarget.ES2022 });
```

**Language service building blocks** (used by editors and some tools): `createLanguageService`, `getSemanticDiagnostics`, `getCompletionEntryDetails`. Third-party tools wrap these for custom IDEs or in-browser playgrounds.

Custom **transformers** (via `ts.transform` or wrapping `emit`) can rewrite ASTs—for example stripping experimental syntax or injecting runtime metadata—though many teams prefer Babel/esbuild/SWC for transform speed and use `tsc` only for types.

### 🌍 Real-Time Example

**CI typecheck** without emit: `tsc --noEmit` in GitHub Actions (or similar) on every PR. **Watch** locally: `tsc -w` alongside a dev server, or delegate type-checking to **fork-ts-checker** (see §2) so the bundler stays fast. **Monorepo**: `tsc -b` at the root with `references` so shared packages build in order and incremental `.tsbuildinfo` caches speed up repeated builds.

---

## 2. Build Tools Integration

Modern apps rarely use **only** `tsc` for production bundles. Bundlers (**Webpack**, **Rollup**, **Vite**) and fast transpilers (**esbuild**, **SWC**) strip types or compile TS to JS while you optionally keep **`tsc --noEmit`** for authoritative type checking.

**Integration patterns**

| Tool | Typical TS integration | Type checking |
|------|------------------------|---------------|
| **Webpack** | `ts-loader` or `babel-loader` + `@babel/preset-typescript` | Often `fork-ts-checker-webpack-plugin` |
| **Rollup** | `@rollup/plugin-typescript` or `rollup-plugin-esbuild` | Separate `tsc` or rollup plugin |
| **Vite** | esbuild (transpile) + optional `tsc` in CI | `vue-tsc` / `tsc` for full check |
| **esbuild** | Native TS parse (types erased) | Run `tsc --noEmit` separately |
| **SWC** | `@swc/core` or loader | Same: parallel typecheck |

**`ts-loader` vs `babel-loader` (with `@babel/preset-typescript`)**

| Aspect | `ts-loader` | Babel + preset-typescript |
|--------|-------------|---------------------------|
| Type checking | Can use `transpileOnly` + external checker | Babel does not type-check |
| Speed | Slower if checking in-process | Usually faster transpile |
| Syntax | Full TS as supported by `tsc` | TS syntax Babel understands (gaps possible) |
| Emit | Delegates to TypeScript | Babel’s output rules |

**`fork-ts-checker-webpack-plugin`** runs the TypeScript checker in a **child process** so Webpack’s main thread stays responsive—standard for large apps.

**Vite + TypeScript**: Vite uses **esbuild** to transpile TS (types stripped). For Vue SFCs, **`vue-tsc`** runs the Vue compiler + `tsc` for template type checking. React projects often rely on **`tsc --noEmit`** in CI for full coverage.

**Choosing a pipeline**

| Priority | Favor |
|----------|--------|
| Fastest dev feedback | Vite or esbuild/SWC + background `tsc -w` |
| Max Webpack ecosystem | Webpack + fork-ts-checker |
| Library dual packages | Rollup or tsup (esbuild) + `tsc` for `.d.ts` |

### 🟢 Beginner Example

**Vite** project: TypeScript works out of the box; add `"strict": true` in `tsconfig.json` and run `npm run build` (uses esbuild under the hood for transpilation).

```typescript
// src/main.ts
import { createApp } from "vue"; // or react-dom/client, etc.

const app = document.querySelector<HTMLDivElement>("#app");
if (app) app.textContent = "Ready";
```

### 🟡 Intermediate Example

**Webpack** with `ts-loader` in `transpileOnly` mode plus **Fork TS Checker** (conceptual config shape):

```typescript
// webpack.config snippet (JavaScript/TS hybrid — illustrative)
// module.exports = {
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         loader: "ts-loader",
//         options: { transpileOnly: true },
//       },
//     ],
//   },
//   plugins: [new ForkTsCheckerWebpackPlugin()],
// };
```

**Rollup** with TypeScript plugin: enables declaration emit and integrates with `tsconfig`.

### 🔴 Expert Example

**esbuild** for bundling libraries with external types: no type errors from esbuild—enforce types in CI.

```typescript
// scripts/build.mts (conceptual — esbuild API is JS; shown as TS-style types)
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/index.js",
  sourcemap: true,
  external: ["typescript"], // do not bundle deps
});
// CI also runs: tsc --noEmit
```

**SWC** in Next.js or custom loaders: configure `.swcrc` for JSX + TS; align `jsc.parser.syntax` with your syntax needs.

### 🌍 Real-Time Example

A **large SPA**: Webpack + `ts-loader` (`transpileOnly: true`) + **Fork TS Checker** + ESLint in CI. A **library**: **Rollup** + `rollup-plugin-typescript2` or **esbuild** for fast ESM/CJS dual builds, **`tsc -d`** or `vite build` with `dts` plugin for `.d.ts`. A **greenfield app**: **Vite** + **Vitest** + `tsc --noEmit` on PRs—simple and fast.

---

## 3. Linting

**ESLint** is the standard linter for TypeScript today. Use **`@typescript-eslint/parser`** to parse TS/TSX and **`@typescript-eslint/eslint-plugin`** for TypeScript-aware rules. **Type-aware linting** enables rules that use the TypeScript program (e.g. `no-floating-promises`, `no-unsafe-*`)—these require **`parserOptions.project`** pointing at your `tsconfig`.

**TSLint** is **deprecated**; migrate to ESLint with **`typescript-eslint`** (the unified `@typescript-eslint` project). The old `tslint.json` rules map to `@typescript-eslint/*` and core ESLint rules; use the official migration guide when modernizing legacy repos.

**Packages to install (npm)**

```typescript
// devDependencies (conceptual — pin versions in real projects)
// "eslint", "@eslint/js", "typescript-eslint", "typescript"
// Optional: "eslint-plugin-import", "eslint-plugin-react", etc.
```

**Rule categories (conceptual)**

| Kind | Examples |
|------|----------|
| Style | `semi`, `@typescript-eslint/naming-convention` (with care) |
| Correctness | `no-unused-vars`, `@typescript-eslint/no-unused-vars` |
| Type-aware | `@typescript-eslint/await-thenable`, `strict-boolean-expressions` |

### 🟢 Beginner Example

Basic ESLint flat config consuming recommended TypeScript rules (ESLint v9+ style, conceptual):

```typescript
// eslint.config.mjs (illustrative structure)
// import eslint from "@eslint/js";
// import tseslint from "typescript-eslint";
// export default tseslint.config(
//   eslint.configs.recommended,
//   ...tseslint.configs.recommended,
//   { languageOptions: { parserOptions: { projectService: true } } }
// );
```

```typescript
// src/utils.ts — lint catches obvious issues
export function double(n: number): number {
  return n * 2;
}
// Unused variable, missing await, etc., surface in editor and `eslint .`
```

### 🟡 Intermediate Example

**Type-aware** setup: extend `recommendedTypeChecked` and tune noisy rules.

```typescript
// typescript-eslint — type-checked recommended (concept)
// ...tseslint.configs.recommendedTypeChecked,
// {
//   rules: {
//     "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
//     "@typescript-eslint/require-await": "off",
//   },
// },
```

```typescript
// Code that only a type-aware rule catches well:
async function maybeAsync(): Promise<void> {
  return Promise.resolve();
}

// Floating promise if you call without await — type-aware ESLint can flag patterns
// void maybeAsync();
```

### 🔴 Expert Example

**Monorepo**: `parserOptions.project` with **`projectService`** (typescript-eslint v8+) or explicit `project: ['./tsconfig.eslint.json']` that **only includes files you lint** (faster). Override rules per package using ESLint `overrides` for tests (`*.test.ts`) vs `src`.

```typescript
// tsconfig.eslint.json — include test files and tooling
// {
//   "extends": "./tsconfig.json",
//   "include": ["src", "test", "scripts", "eslint.config.mjs"]
// }
```

Custom **ESLint rules** with `@typescript-eslint/utils` and `ESLintUtils.getParserServices` inspect TypeScript types—useful for banning internal APIs or enforcing module boundaries.

### 🌍 Real-Time Example

**Pre-commit**: `lint-staged` runs `eslint --fix` on changed files. **CI**: `eslint .` + `tsc --noEmit`. **IDE**: ESLint extension shows squiggles; **type-aware** rules catch async mistakes before runtime. **TSLint legacy**: run codemods (`tslint-to-eslint-config`) once, delete `tslint.json`, and lock ESLint versions in `package.json`.

**Type-aware rules worth evaluating** (team-dependent): `@typescript-eslint/no-floating-promises`, `@typescript-eslint/no-misused-promises`, `@typescript-eslint/strict-boolean-expressions`, `@typescript-eslint/switch-exhaustiveness-check`. Each adds CPU cost; enable where they prevent real incidents.

```typescript
async function save(): Promise<void> {
  await fetch("/api/save", { method: "POST" });
}

// Without await — runtime fire-and-forget; type-aware ESLint can flag:
// save();
```

---

## 4. Formatting

**Prettier** is an opinionated formatter; with **`@prettier/plugin-typescript`** (bundled in Prettier) it formats `.ts`/`.tsx` consistently. **EditorConfig** (`indent_style`, `end_of_line`, etc.) aligns editors before Prettier runs. **Format on save** in VS Code: `"editor.formatOnSave": true` + `"editor.defaultFormatter": "esbenp.prettier-vscode"`.

### 🟢 Beginner Example

```typescript
// .prettierrc — JSON is common; shown as TS-style comment block for copy-paste:
// { "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
```

```typescript
const user = {
  id: 1,
  name: "Ada",
  roles: ["admin", "editor"],
};
// Prettier normalizes quotes, commas, and line breaks team-wide.
```

### 🟡 Intermediate Example

**`.prettierignore`**: exclude generated `dist/`, `coverage/`, lockfiles if needed. **npm scripts**: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`.

```typescript
// package.json scripts (conceptual)
// "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\""
```

**EditorConfig**

```typescript
// .editorconfig (INI format — shown as comment for clarity)
// root = true
// [*]
// indent_style = space
// indent_size = 2
// end_of_line = lf
// insert_final_newline = true
```

### 🔴 Expert Example

Integrate **Prettier with ESLint** using **`eslint-config-prettier`** (turns off stylistic ESLint rules that fight Prettier) and optionally **`eslint-plugin-prettier`** (runs Prettier as a rule—can be slower; many teams use Prettier separately).

```typescript
// eslint flat config merge (illustrative)
// import eslintConfigPrettier from "eslint-config-prettier";
// export default [ ...tseslint.configs.recommended, eslintConfigPrettier ];
```

**VS Code workspace settings** per repo: recommend extensions, enforce format on save, and set `typescript.tsdk` for workspace TypeScript.

### 🌍 Real-Time Example

On save: Prettier formats; ESLint fixes import order if using `eslint-plugin-simple-import-sort`. **CI** fails `prettier --check` so formatting never drifts. **Onboarding**: one `.editorconfig` + Prettier means no bike-shedding about semicolons.

**VS Code `settings.json` (workspace)**

```typescript
// .vscode/settings.json — conceptual keys
// {
//   "editor.formatOnSave": true,
//   "editor.defaultFormatter": "esbenp.prettier-vscode",
//   "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
//   "typescript.tsdk": "node_modules/typescript/lib"
// }
```

---

## 5. Testing Tools

**Jest** historically used **`ts-jest`** or **`babel-jest`** to compile TS; config lives in `jest.config` / `package.json`. **Vitest** is Vite-native, fast, and Jest-compatible for many APIs. **Mocha** + **`ts-node`** (or precompiled output) remains common for Node libraries.

**Type testing** verifies types without executing code: **`tsd`** checks `.d.ts` against usage; **`expect-type`** (or Vitest’s `expectTypeOf`) asserts compile-time types in tests.

### 🟢 Beginner Example

**Vitest** minimal test:

```typescript
import { describe, it, expect } from "vitest";
import { add } from "./math";

describe("add", () => {
  it("sums numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

```typescript
// src/math.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

### 🟡 Intermediate Example

**Mocha** with **`ts-node`** for on-the-fly compile (good for smaller Node tools):

```typescript
// test/setup.ts — run with: mocha -r ts-node/register 'test/**/*.test.ts'
import { expect } from "chai";
import { double } from "../src/math";

describe("double", () => {
  it("multiplies by two", () => {
    expect(double(4)).to.equal(8);
  });
});
```

```typescript
// src/math.ts
export function double(n: number): number {
  return n * 2;
}
```

**Jest** with **ts-jest** (simplified `jest.config.ts`):

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!**/*.d.ts"],
};

export default config;
```

```typescript
// Alternative: babel-jest + @babel/preset-typescript for faster transpile;
// typecheck separately with tsc --noEmit
```

### 🔴 Expert Example

**expect-type** for compile-time assertions:

```typescript
import { expectTypeOf } from "expect-type";
import type { Result } from "./api";

type Ok = Extract<Result, { ok: true }>;

expectTypeOf<Ok>().toHaveProperty("value");
expectTypeOf<Result>().toMatchTypeOf<{ ok: boolean }>();
```

**tsd** runs against declaration files:

```typescript
// index.test-d.ts (tsd convention)
import { expectType } from "tsd";
import type { Parse } from ".";

expectType<string>({} as Parse<"hello">);
```

**Vitest** type utilities:

```typescript
import { expectTypeOf } from "vitest";

expectTypeOf<string>().toEqualTypeOf<string>();
```

### 🌍 Real-Time Example

**Library**: dual **Mocha** + **`ts-node`** for dev tests, **`tsd`** in CI for public types. **App**: **Vitest** + **Testing Library** + **`tsc --noEmit`**. **Monorepo**: Jest **projects** or Nx/Vitest **workspace** configs per package; shared `tsconfig.spec.json` for tests only.

**Coverage**: `vitest --coverage` (via `@vitest/coverage-v8` or istanbul) and Jest’s `--coverage` both work with TS source maps when configured; ensure `tsconfig` **`sourceMap`** is on for readable reports.

```typescript
// vitest.config.ts (illustrative)
// import { defineConfig } from "vitest/config";
// export default defineConfig({ test: { globals: true, environment: "node" } });
```

---

## 6. Documentation

**TSDoc** is a convention for doc comments (`/** ... */`) with tags like `@param`, `@returns`, `@example`, `@deprecated`, `@public`, `@internal`. Tools parse TSDoc to generate HTML or markdown docs.

**TypeDoc** converts TypeScript projects into documentation sites by reading types and TSDoc. **API Extractor** (Rush Stack) rolls `.d.ts` into a **public API surface**, produces **API reports** for review, and can generate doc models for **API Documenter**.

**TSDoc tags (subset)**

| Tag | Use |
|-----|-----|
| `@param` | Parameter description |
| `@returns` / `@return` | Return value |
| `@remarks` | Extra detail |
| `@example` | Runnable or illustrative snippet |
| `@see` | Related symbol or URL |
| `@deprecated` | Migration hint |
| `@public` / `@internal` | Visibility for API Extractor / consumers |

### 🟢 Beginner Example

```typescript
/**
 * Greets a user by name.
 * @param name - Display name (non-empty).
 * @returns A friendly string.
 * @example
 * greet("Ada"); // "Hello, Ada"
 */
export function greet(name: string): string {
  return `Hello, ${name}`;
}
```

### 🟡 Intermediate Example

**TypeDoc** `typedoc.json` (conceptual):

```typescript
// typedoc.json
// {
//   "entryPoints": ["src/index.ts"],
//   "tsconfig": "tsconfig.json",
//   "readme": "README.md",
//   "out": "docs/api"
// }
// CLI: npx typedoc
```

```typescript
/**
 * @packageDocumentation
 * Core utilities for the Foo SDK.
 */
export * from "./client";
export * from "./types";
```

### 🔴 Expert Example

**API Extractor** workflow: `api-extractor run` produces `etc/foo.api.md` for PR review; **API Documenter** generates markdown from the model. **@internal** stripped from published `.d.ts` via **`.d.ts` rollup** and **trimming**—ensures consumers only see supported surface.

```typescript
/**
 * Internal helper — not part of the public API.
 * @internal
 */
export function normalizeToken(t: string): string {
  return t.trim().toLowerCase();
}
```

```typescript
// api-extractor.json (high level)
// {
//   "mainEntryPointFilePath": "<projectFolder>/dist/index.d.ts",
//   "dtsRollup": { "enabled": true, "untrimmedFilePath": "<projectFolder>/dist/foo.d.ts" },
//   "docModel": { "enabled": true, "apiJsonFilePath": "<projectFolder>/temp/foo.api.json" }
// }
```

### 🌍 Real-Time Example

Open source packages publish **TypeDoc** sites to GitHub Pages; **changesets** + **API Extractor** gate breaking API changes. Internal monorepos link TypeDoc into a **portal**; VS Code shows TSDoc on hover when the language service reads your comments.

**CI doc generation**: run `typedoc` or `api-documenter generate` on `main` and upload artifacts; fail the job if **API Extractor** reports **new** exported symbols without docs (custom script) when your bar for quality is high.

```typescript
/**
 * @public
 */
export interface ClientOptions {
  /** Base URL for all requests. @example "https://api.example.com" */
  baseUrl: string;
  /** Optional timeout in milliseconds. */
  timeoutMs?: number;
}
```

---

## 7. Migration Tools

Moving from **JavaScript to TypeScript** is usually **gradual**: enable **`allowJs`**, rename files incrementally, add **`// @ts-check`** or JSDoc types in `.js`, then switch to `.ts`. **`checkJs`** type-checks JS files. **Type acquisition** via **`@types/*`** packages or **`typeRoots`** supplies ambient types for untyped dependencies.

**Strategies**

| Strategy | When |
|----------|------|
| **Bottom-up** | Start with leaf modules, typed utilities |
| **Top-down** | Define interfaces at boundaries (API, props) |
| **Strangler** | New code in TS; wrap legacy JS behind typed facades |

### 🟢 Beginner Example

Rename `utils.js` → `utils.ts`, add types, fix errors locally. Enable in `tsconfig.json`: `"allowJs": true`, `"checkJs": false` until ready.

```typescript
// Former JS function, now typed
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
```

### 🟡 Intermediate Example

**`// @ts-check`** in a `.js` file for lightweight typing without renaming:

```typescript
// legacy.js — @ts-check uses TypeScript as a checker for JSDoc
// @ts-check

/**
 * @param {string} id
 * @returns {Promise<{ name: string }>}
 */
export async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}
```

**Gradual strictness**: start with `strict: false`, then enable `strictNullChecks`, `noImplicitAny`, etc., over sprints.

### 🔴 Expert Example

**Path-mapped imports** and **`allowJs`** during hybrid phase; **`skipLibCheck: true`** to focus on app code. **Codemods** (jscodeshift) rename `.js` → `.ts` and fix extension imports. **Type acquisition**:

```typescript
// tsconfig.json (excerpt)
// "compilerOptions": {
//   "allowJs": true,
//   "checkJs": true,
//   "maxNodeModuleJsDepth": 1
// },
// "typeAcquisition": { "enable": true }
```

**DefinitelyTyped**: `npm i -D @types/lodash` for untyped or older packages. For **custom** untyped modules, add **`declarations.d.ts`**:

```typescript
declare module "legacy-cms-sdk" {
  export function loadPage(slug: string): Promise<{ html: string }>;
}
```

### 🌍 Real-Time Example

A **product team** ships `allowJs` + incremental `.ts` conversion with **CI `tsc --noEmit`** on both. **Libraries** publish **`.d.ts`** and use **`declaration: true`** so JS consumers get types. **Large codebases** track “strictness score” per package and ratchet **`strict`** in eslint/tsconfig **overrides** per folder.

**`@ts-nocheck`** disables checking for a whole file—use sparingly during migration and remove with a tracked follow-up. **`@ts-expect-error`** documents a single line you know is wrong today; prefer over `@ts-ignore` because TS errors if the line becomes valid.

```typescript
// @ts-expect-error — legacy JS interop until ticket PROJ-442 lands
const raw = legacyApi.getData() as SomeNewType;
```

---

## 8. Best Practices

1. **Separate transpilation from type checking when needed** — esbuild/SWC/Webpack for speed; **`tsc --noEmit`** (or fork-ts-checker) for correctness.
2. **Treat `tsc` in CI as non-negotiable** for teams that care about types; bundlers alone do not replace the checker.
3. **Enable `typescript-eslint` type-aware rules** selectively; start with recommended, then add strict rules where performance allows.
4. **Run Prettier independently** of ESLint for clarity; use `eslint-config-prettier` to avoid duplicate style rules.
5. **Pin TypeScript and typescript-eslint versions** together per [compatibility table](https://typescript-eslint.io/users/dependency-versions/).
6. **Use project references** for monorepos to get incremental builds and clear build order.
7. **Document public APIs** with TSDoc; generate TypeDoc or API Extractor output as part of release checks.
8. **Test types** for libraries (`tsd`, `expect-type`) especially for complex generics.
9. **Migration**: prefer **`@ts-check`** + JSDoc before big-bang renames when risk is high.
10. **Editor**: workspace TypeScript version (`typescript.tsdk`) matches CI to avoid “works on my machine” type diffs.
11. **Cache CI**: store `.tsbuildinfo` and `node_modules/.cache` when safe to cut minutes off `tsc -b` and ESLint.
12. **Lock Node version** (`.nvmrc` / `engines`) so native tooling (SWC, esbuild) behaves the same locally and in pipelines.
13. **Split `tsconfig.json`**: `tsconfig.json` for editor + check, `tsconfig.build.json` for emit-only stricter `include`—avoids emitting tests.
14. **Prefer `moduleResolution: "bundler"`** (TS 5+) when using Vite/esbuild if it matches your bundler; align with official TS docs for your runtime.
15. **Review `types` field** in `package.json` for libraries so consumers resolve your entry `.d.ts` correctly.

---

## 9. Common Mistakes

1. **Assuming Babel or esbuild “type-checked” your code** — they transpile; only `tsc` (or tooling that invokes it) reports type errors.
2. **Enabling heavy type-aware ESLint on huge `include` globs** — slows IDE and CI; narrow `project`/`projectService` scope.
3. **Running `tsc` and bundler with different `tsconfig` paths** — mismatched `paths` or `moduleResolution` causes false confidence or spurious errors.
4. **Omitting `fork-ts-checker` when using `ts-loader` in `transpileOnly` mode** — you lose type errors in dev.
5. **Using deprecated TSLint** on new projects — migrate to ESLint; security and ecosystem support have moved.
6. **Prettier + conflicting ESLint style rules** — without `eslint-config-prettier`, teams fight endless autofix loops.
7. **Publishing packages without `.d.ts`** (when shipping TS source is not the goal) — consumers lose autocomplete and safety.
8. **`skipLibCheck: true` without understanding tradeoffs** — hides issues in `.d.ts` dependencies; sometimes necessary, but not a substitute for fixing broken types.
9. **Mass `any` during migration** without a plan to pay down — creates blind spots; prefer `unknown` + narrowing or scoped `@ts-expect-error` with tickets.
10. **Ignoring `tsconfig.eslint.json` includes** — type-aware lint fails or skips files unexpectedly when tests or scripts are excluded from the program.
11. **Using `@ts-ignore` instead of `@ts-expect-error`** — suppressions linger silently after the underlying bug is fixed.
12. **Forgetting `isolatedModules`** when Babel/esbuild transpiles per file — patterns that need full-program analysis may break at emit time.
13. **Duplicating path aliases** in Webpack/Vite **and** `tsconfig` incorrectly — runtime resolves but types fail or vice versa; keep them in sync.
14. **Running tests against emitted JS without source maps** — stack traces point at `dist/`; enable maps in test configs.
15. **Over-customizing Prettier** — fighting defaults reduces benefit from community defaults and examples.

---

## Toolchain at a glance

| Layer | Representative tools |
|-------|----------------------|
| Type checker | `tsc`, `vue-tsc`, fork-ts-checker |
| Transpile / bundle | Vite, Webpack, Rollup, esbuild, SWC |
| Lint | ESLint + `typescript-eslint` |
| Format | Prettier, EditorConfig |
| Test | Vitest, Jest + ts-jest, Mocha + ts-node |
| Type tests | tsd, expect-type, Vitest `expectTypeOf` |
| Docs | TSDoc, TypeDoc, API Extractor + Documenter |
| Migration | `allowJs`, `checkJs`, `@ts-check`, `@types` |

---

## Quick reference: sample `package.json` scripts

```typescript
// "scripts": {
//   "build": "tsc -p tsconfig.build.json",
//   "dev": "vite",
//   "typecheck": "tsc --noEmit",
//   "lint": "eslint .",
//   "lint:fix": "eslint . --fix",
//   "format": "prettier --write .",
//   "test": "vitest",
//   "test:types": "tsd",
//   "docs": "typedoc"
// }
```

This toolchain stack—**tsc** for truth, **bundler/transpiler** for delivery, **ESLint** for correctness/style, **Prettier** for format, **tests + type tests** for safety, and **docs/migration** discipline—keeps TypeScript projects maintainable at scale.
