# TypeScript 5.9 MCQ - Set 6 (Expert Level)

**1. The TypeScript team’s native compiler port (often discussed as “TypeScript 7” direction) targets which primary benefit?**

a) Smaller `npm` download size only
b) Order-of-magnitude faster compilation via a native implementation (e.g., Go) while preserving the type system
c) Removing `.ts` file support
d) Replacing JavaScript output with WASM-only bundles

**Answer: b) Order-of-magnitude faster compilation via a native implementation (e.g., Go) while preserving the type system**

---

**2. TypeScript 6.0 is best understood as:**

a) The first release with no type checker
b) A transition release aligning deprecations and tooling paths ahead of the native compiler era
c) The version that removed `strict` flags
d) The version that made `any` illegal

**Answer: b) A transition release aligning deprecations and tooling paths ahead of the native compiler era**

---

**3. A decorator factory is:**

```typescript
function Log(prefix: string) {
  return <T, C>(target: T, ctx: C) => {
    /* ... */
  };
}
```

a) A decorator applied only to enums
b) A function returning a decorator: `(...args) => (target, context) => { ... }`
c) Synonymous with `using`
d) A Babel plugin name

**Answer: b) A function returning a decorator: `(...args) => (target, context) => { ... }`**

---

**4. With the modern decorators proposal model, metadata (e.g., `reflect-metadata`) is:**

a) Always emitted by TypeScript without configuration
b) Not automatically emitted; you typically rely on polyfills/transforms or explicit metadata APIs
c) Forbidden in `.ts` files
d) Only available under `--target es3`

**Answer: b) Not automatically emitted; you typically rely on polyfills/transforms or explicit metadata APIs**

---

**5. Class field initialization relative to decorators depends on:**

a) Alphabetical order of method names
b) ECMAScript evaluation order for fields and the stage of decorator application (TS tracks the standard semantics for the enabled decorator mode)
c) `tsconfig` `module` only
d) Whether the file uses CRLF

**Answer: b) ECMAScript evaluation order for fields and the stage of decorator application (TS tracks the standard semantics for the enabled decorator mode)**

---

**6. `using` statements require the value to be:**

```typescript
using stack = acquireResource();
```

a) A `Promise`
b) `Disposable` (or boxed) per the ECMAScript resource-management proposal typing
c) A `Generator`
d) A `symbol`

**Answer: b) `Disposable` (or boxed) per the ECMAScript resource-management proposal typing**

---

**7. `await using` is appropriate when:**

```typescript
async function run() {
  await using db = await openDb();
}
```

a) You only use synchronous iterators
b) The resource’s cleanup is async (`AsyncDisposable`)
c) You want to skip `finally` blocks
d) You compile to `--module amd`

**Answer: b) The resource’s cleanup is async (`AsyncDisposable`)**

---

**8. A custom disposable type can integrate with `using` by:**

a) Returning `null` from `[Symbol.dispose]`
b) Implementing `Symbol.dispose` (or being a boxed disposable object) matching the runtime contract
c) Declaring `dispose(): string`
d) Extending `Error` only

**Answer: b) Implementing `Symbol.dispose` (or being a boxed disposable object) matching the runtime contract**

---

**9. Combining `as const` with `satisfies`:**

```typescript
const cfg = { mode: "strict" } as const satisfies { mode: "strict" | "loose" };
```

What is the inferred type of `cfg.mode`?

a) `string`
b) `"strict"`
c) `"strict" | "loose"`
d) `never`

**Answer: b) `"strict"`**

---

**10. Generic `satisfies` patterns often aim to:**

```typescript
declare function check<T>(v: T): T;
const x = { n: 1 } satisfies Record<string, number>;
```

a) Force widening to `unknown`
b) Validate a value against a generic shape `T` while preserving inference for other type parameters
c) Replace namespaces
d) Disable `readonly` tuples

**Answer: b) Validate a value against a generic shape `T` while preserving inference for other type parameters**

---

**11. Prefer a type annotation over `satisfies` when:**

a) You want the variable’s type to be the wider declared type and literals may widen intentionally
b) You never want excess property checks
c) You need `import defer`
d) You compile with `allowJs` only

**Answer: a) You want the variable’s type to be the wider declared type and literals may widen intentionally**

---

**12. CFA after assignment:**

```typescript
let x: string | number = "a";
x = 1;
const y = x;
```

What is `y`’s type?

a) `string | number`
b) `number`
c) `string`
d) `1`

**Answer: b) `number`**

---

**13. Narrowing inside a callback scheduled later often fails because:**

```typescript
let x: string | number = "hi";
x = Math.random() > 0.5 ? 1 : "hi";
setTimeout(() => {
  if (typeof x === "string") {
    x.length;
  }
}, 0);
```

a) Callbacks cannot use generics
b) TypeScript assumes intervening code may mutate captured variables, resetting narrowings
c) `strictFunctionTypes` disables narrowing
d) `void` is not a valid return type

**Answer: b) TypeScript assumes intervening code may mutate captured variables, resetting narrowings**

---

**14. A standard workaround for stale narrowing across async boundaries is:**

a) Assign the narrowed value to a `const` binding before the async boundary
b) Use `as any` on the callback parameter only
c) Set `noImplicitAny` to false
d) Replace callbacks with labels

**Answer: a) Assign the narrowed value to a `const` binding before the async boundary**

---

**15. Emulating pattern matching exhaustiveness uses:**

```typescript
type Ev = { t: "a"; n: number } | { t: "b"; s: string };
function handle(e: Ev) {
  switch (e.t) {
    case "a":
      return e.n;
    case "b":
      return e.s.length;
    default: {
      const _x: never = e;
      return _x;
    }
  }
}
```

a) `if (typeof x === "symbol")` for every union
b) Discriminated unions plus `switch`/`if` chains and a final `assertNever(x)` branch
c) `eval` on the discriminant
d) `namespace` merging

**Answer: b) Discriminated unions plus `switch`/`if` chains and a final `assertNever(x)` branch**

---

**16. Type-safe event emitter typing often starts with:**

```typescript
type Events = { tick: [n: number]; stop: [] };
declare const emitter: {
  on<K extends keyof Events>(e: K, fn: (...a: Events[K]) => void): void;
  emit<K extends keyof Events>(e: K, ...a: Events[K]): void;
};
```

a) `Map<any, any>`
b) A mapped type from event name strings to payload tuples, and generic `on<E>(name, handler: (...args: Events[E]) => void)`
c) Only `string` events with `unknown` payloads always
d) `Object` as the handler type

**Answer: b) A mapped type from event name strings to payload tuples, and generic `on<E>(name, handler: (...args: Events[E]) => void)`**

---

**17. `NoInfer<T>` is used to:**

a) Force `T` to become `never`
b) Block inference from a particular position so other type parameters resolve as intended
c) Speed up `tsc` by skipping checks
d) Mark a type as deprecated

**Answer: b) Block inference from a particular position so other type parameters resolve as intended**

---

**18. For `declare function createList<T>(items: T[], compare: (a: NoInfer<T>, b: NoInfer<T>) => number): T[];`, `NoInfer` helps when:**

a) You want `T` inferred from `compare` instead of `items`
b) You want `T` inferred from `items` and not from unrelated parameter positions
c) You want to disallow arrays
d) You want `compare` to return `boolean` only

**Answer: b) You want `T` inferred from `items` and not from unrelated parameter positions**

---

**19. A `Path<T>` type for dot-paths typically:**

a) Only supports depth 1
b) Recursively builds string unions of `"a"`, `"a.b"`, ... for object keys
c) Requires runtime `Proxy`
d) Is impossible without HKTs

**Answer: b) Recursively builds string unions of `"a"`, `"a.b"`, ... for object keys**

---

**20. `PathValue<T, P>` pairs with `Path<T>` by:**

a) Returning `unknown` always
b) Indexing into `T` repeatedly according to the segments inferred from `P`
c) Converting `T` to `JSON`
d) Mapping arrays to tuples only

**Answer: b) Indexing into `T` repeatedly according to the segments inferred from `P`**

---

**21. The `Result<T, E>` pattern models errors as:**

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

a) Thrown exceptions only
b) Tagged values like `{ ok: true; value: T } | { ok: false; error: E }`
c) `Promise` rejection reasons always
d) `console.error` strings

**Answer: b) Tagged values like `{ ok: true; value: T } | { ok: false; error: E }`**

---

**22. Tagged errors improve on plain `string` messages by:**

a) Removing stack traces
b) Carrying discriminants and structured payloads at the type level
c) Forcing `try/catch` removal
d) Making all errors `any`

**Answer: b) Carrying discriminants and structured payloads at the type level**

---

**23. `declare module "pkg"` in a `.d.ts` file:**

a) Emits JavaScript for `pkg`
b) Augments or introduces typings for imports of `"pkg"` without runtime code
c) Replaces `package.json`
d) Runs at runtime in Node

**Answer: b) Augments or introduces typings for imports of `"pkg"` without runtime code**

---

**24. `declare global` is used to:**

```typescript
export {};
declare global {
  interface Window {
    __APP_VER__: string;
  }
}
```

a) Declare tree-shakable ESM entrypoints
b) Add names to the global scope typing (e.g., browser globals) from a module file
c) Import CSS modules
d) Enable `isolatedModules`

**Answer: b) Add names to the global scope typing (e.g., browser globals) from a module file**

---

**25. `/// <reference types="..." />` primarily:**

a) Imports runtime values
b) Pulls in ambient declaration packages for typechecking this file
c) Sets `moduleResolution`
d) Disables `strict`

**Answer: b) Pulls in ambient declaration packages for typechecking this file**

---

**26. `// @ts-expect-error` differs from `// @ts-ignore` because:**

a) `expect-error` is slower
b) `expect-error` errors if the next line is already type-correct (prevents silent fixes)
c) `ignore` is forbidden
d) `expect-error` only works in `.tsx`

**Answer: b) `expect-error` errors if the next line is already type-correct (prevents silent fixes)**

---

**27. `// @ts-nocheck` at file top:**

a) Typechecks the file twice
b) Disables semantic diagnostics for that file broadly (escape hatch)
c) Emits `.d.ts` only
d) Enables `strict` mode

**Answer: b) Disables semantic diagnostics for that file broadly (escape hatch)**

---

**28. Ambient module declarations for assets often look like:**

```typescript
declare module "*.svg" {
  const src: string;
  export default src;
}
```

What does this declare for `import icon from "./x.svg"`?

a) SVG files execute as scripts
b) The default import is typed as `string` (or your chosen type) at compile time
c) Bundlers must reject SVG
d) `moduleResolution` becomes `classic`

**Answer: b) The default import is typed as `string` (or your chosen type) at compile time**

---

**29. `declaration: true` causes `tsc` to emit:**

```typescript
// Emits companion .d.ts for each emitted .js output file
```

a) Source maps only
b) `.d.ts` alongside (or instead of, depending on other flags) JS outputs
c) WASM binaries
d) Test files

**Answer: b) `.d.ts` alongside (or instead of, depending on other flags) JS outputs**

---

**30. `declarationMap: true` is useful because:**

a) It removes the need for `sourceRoot`
b) Editors can jump from `.d.ts` usage to the original `.ts` implementation
c) It disables incremental builds
d) It inlines all types into JS

**Answer: b) Editors can jump from `.d.ts` usage to the original `.ts` implementation**

---

**31. `emitDeclarationOnly: true` means:**

a) Emit JS and not types
b) Emit only declaration files without emitting JS (often paired with another tool for transpilation)
c) Delete all `.ts` files
d) Skip typechecking

**Answer: b) Emit only declaration files without emitting JS (often paired with another tool for transpilation)**

---

**32. Project references (`references` in `tsconfig`) enable:**

a) Running `node` on multiple ports
b) Splitting a codebase into dependent projects built in order with `.d.ts` boundaries
c) Disallowing path aliases
d) Automatic `npm publish`

**Answer: b) Splitting a codebase into dependent projects built in order with `.d.ts` boundaries**

---

**33. `composite: true` is commonly required for referenced projects because:**

a) It enables `allowJs` only
b) It enforces settings suitable for incremental builds and declaration emit for consumers
c) It removes `strict`
d) It replaces `moduleResolution`

**Answer: b) It enforces settings suitable for incremental builds and declaration emit for consumers**

---

**34. `incremental: true` stores build info in:**

a) `node_modules/.cache` always
b) A file like `tsconfig.tsbuildinfo` or `tsBuildInfoFile` if overridden
c) Git objects
d) RAM only

**Answer: b) A file like `tsconfig.tsbuildinfo` or `tsBuildInfoFile` if overridden**

---

**35. Module federation typing challenges often involve:**

a) Guaranteed local types for remotely loaded modules without ambient shims
b) Declaring remote module shapes (e.g., `declare module "remote/App"`) and shared `import()` types
c) Removing all `export` keywords
d) Using only `require` in `.mts` files

**Answer: b) Declaring remote module shapes (e.g., `declare module "remote/App"`) and shared `import()` types**

---

**36. `Symbol.iterator` typing matters for:**

```typescript
const iterable: Iterable<number> = {
  *[Symbol.iterator]() {
    yield 1;
  },
};
```

a) `for-await-of` only
b) Making objects valid in `for...of` when they implement the iterator protocol
c) JSON serialization
d) `namespace` merging

**Answer: b) Making objects valid in `for...of` when they implement the iterator protocol**

---

**37. `Symbol.asyncIterator` is required for:**

a) Synchronous `for...of` on plain arrays
b) `for await...of` over async iterables
c) `Promise.all`
d) `using` statements

**Answer: b) `for await...of` over async iterables**

---

**38. `IterableIterator<T>` describes:**

a) Only async generators
b) Values iterable via `Symbol.iterator` where the iterator itself is also iterable
c) Functions returning `Promise<T>`
d) `ArrayBuffer` views only

**Answer: b) Values iterable via `Symbol.iterator` where the iterator itself is also iterable**

---

**39. `Generator<T, TReturn, TNext>` differs from `IterableIterator<T>` by:**

```typescript
function* gen(): Generator<number, string, boolean> {
  const x = yield 1;
  return "done";
}
```

a) Encoding `yield`, return, and next-argument types for generator functions
b) Being identical in all projects
c) Disallowing `throw`
d) Applying only to async generators

**Answer: a) Encoding `yield`, return, and next-argument types for generator functions**

---

**40. Typing `Proxy` targets is hard because:**

a) Proxies cannot exist in TypeScript
b) Interception can change apparent properties; structural types may not capture traps faithfully
c) `Reflect` is untyped
d) `Proxy` requires `import defer`

**Answer: b) Interception can change apparent properties; structural types may not capture traps faithfully**

---

**41. `Reflect` methods are typed, but full correctness often needs:**

a) Casting to `any` for dynamic keys only
b) Overloads or generics matching the target object’s key/value types at usage sites
c) Avoiding objects entirely
d) `// @ts-nocheck` per method

**Answer: b) Overloads or generics matching the target object’s key/value types at usage sites**

---

**42. Homomorphic mapped types preserve modifiers on properties of `T` when:**

a) The key mapping is `[K in keyof T]`
b) The key mapping is `[K in "x" | "y"]` unrelated to `T`
c) You use `as never`
d) You add an index signature only

**Answer: a) The key mapping is `[K in keyof T]`**

---

**43. Distributive object types (mapped types producing unions) can explode unions when:**

a) Input keys are a union; each variant produces a different object type, unioned together
b) You use `readonly` arrays
c) You set `exactOptionalPropertyTypes`
d) You use `namespace`

**Answer: a) Input keys are a union; each variant produces a different object type, unioned together**

---

**44. `new (abstract new () => X)` vs concrete constructor types matters for typing factories that:**

a) Should not treat abstract classes as constructable values
b) Must accept only values, not types
c) Only work with `import defer`
d) Require `emitDecoratorMetadata`

**Answer: a) Should not treat abstract classes as constructable values**

---

**45. A practical JSON value type is often:**

```typescript
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
```

Recursive aliases like this are allowed but:

a) Cannot be used in interfaces
b) May hit instantiation limits if over-mapped in huge unions
c) Are equivalent to `unknown`
d) Require `// @ts-ignore`

**Answer: b) May hit instantiation limits if over-mapped in huge unions**

---

**46. `as const` without `satisfies` on an object literal:**

```typescript
const p = { x: 1, y: [2, 3] } as const;
```

a) Always widens property types to primitives
b) Infers readonly tuple/narrow literal types for properties where applicable
c) Removes literal types
d) Forces `exactOptionalPropertyTypes`

**Answer: b) Infers readonly tuple/narrow literal types for properties where applicable**

---

**47. `as const satisfies SomeWideType` keeps:**

a) Only the wide type with no literals preserved
b) Narrow literals where valid while still checking assignability to `SomeWideType`
c) `any` everywhere
d) Only number literals

**Answer: b) Narrow literals where valid while still checking assignability to `SomeWideType`**

---

**48. Excess property checking applies when:**

```typescript
interface Opts {
  a: number;
}
const o: Opts = { a: 1, b: 2 }; // excess 'b' on fresh literal
```

a) Comparing any two variables of the same interface type
b) Assigning an object literal to a variable or parameter with a known object type
c) Using type assertions `as`
d) Importing types only

**Answer: b) Assigning an object literal to a variable or parameter with a known object type**

---

**49. Structural compatibility between variables (not fresh literals) may allow:**

```typescript
interface Opts {
  a: number;
}
const wide = { a: 1, b: 2 };
const narrow: Opts = wide; // often OK: excess b not checked here
```

a) Extra properties on the source object when assigning to a narrower target type in some cases
b) Never any extra properties
c) Only if the target is `unknown`
d) Only for `class` types with `private` fields

**Answer: a) Extra properties on the source object when assigning to a narrower target type in some cases**

---

**50. `exactOptionalPropertyTypes: true` makes optional properties:**

a) Always `undefined` at runtime
b) Distinct from explicitly including `undefined` in the property type union
c) Impossible to assign
d) Identical to required properties

**Answer: b) Distinct from explicitly including `undefined` in the property type union**

---
</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace