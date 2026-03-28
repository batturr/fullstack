# TypeScript 5.9 MCQ - Set 4 (Intermediate Level)

**1. What does `NoInfer<T>` primarily prevent?**

a) Widening of `T` to `unknown`
b) TypeScript from using a position to infer `T` when other inference candidates exist
c) Recursive type expansion
d) Distribution over conditional unions

**Answer: b) TypeScript from using a position to infer `T` when other inference candidates exist**

---

**2. With `const` type parameters, what is `typeof xs` typically inferred as?**

```typescript
function tuple<const T extends readonly unknown[]>(xs: T) {
  return xs;
}
const xs = tuple([1, 2, 3]);
```

a) `number[]`
b) `readonly [1, 2, 3]`
c) `[number, number, number]`
d) `unknown[]`

**Answer: b) `readonly [1, 2, 3]`**

---

**3. TC39 stage 3 class decorators (TypeScript 5.0+) are invoked with:**

a) Only a property descriptor tuple like legacy method decorators
b) The class value plus a `context` object (for example `context.kind === "class"`)
c) No arguments; they are purely compile-time macros
d) The same `(target, propertyKey, descriptor)` triple as legacy field decorators

**Answer: b) The class value plus a `context` object (for example `context.kind === "class"`)**

---

**4. What is `Z`?**

```typescript
type Z = object extends {} ? 1 : 0;
```

a) `0`
b) `1`
c) `never`
d) `boolean`

**Answer: b) `1`**

---

**5. `Object` (uppercase) in the type system is best described as:**

a) The same as `object`
b) A non-primitive type including nearly everything except `null` and `undefined` in older typings
c) Identical to `{}`
d) The type of plain object literals only

**Answer: b) A non-primitive type including nearly everything except `null` and `undefined` in older typings**

---

**6. What is the key difference between a user-defined type guard and an assertion function?**

a) Type guards return `boolean`; assertion functions narrow by `asserts` and may throw instead of returning `false`
b) Assertion functions cannot narrow unions
c) Type guards run only at compile time
d) There is no difference

**Answer: a) Type guards return `boolean`; assertion functions narrow by `asserts` and may throw instead of returning `false`**

---

**7. Will this assertion function compile?**

```typescript
function ok(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("bad");
}
```

a) No, `asserts` requires a `boolean` return type
b) Yes, successful completion narrows `x` to `string`
c) Only with `strictNullChecks` off
d) No, use `: x is string` instead

**Answer: b) Yes, successful completion narrows `x` to `string`**

---

**8. What does `asserts condition` (without `is`) express?**

```typescript
function mustBeTrue(b: unknown): asserts b {
  if (!b) throw new Error();
}
```

a) After success, `b` is narrowed to `true` literal
b) After success, `b` is narrowed to `true` (truthy narrowing in control flow)
c) `b` must already be `true` before the call
d) The function returns `void` only and never narrows

**Answer: b) After success, `b` is narrowed to `true` (truthy narrowing in control flow)**

---

**9. `import type` ensures that:**

a) The imported symbol exists at runtime in every bundler
b) The import is erased from emitted JavaScript and is type-only
c) `verbatimModuleSyntax` is disabled automatically
d) The module runs side effects eagerly

**Answer: b) The import is erased from emitted JavaScript and is type-only**

---

**10. With `verbatimModuleSyntax: true`, which is required for a type-only named import?**

```typescript
import { type SomeType } from "./mod";
```

a) `import SomeType from "./mod"`
b) `import { type SomeType }` or `import type { SomeType }`
c) `import * as T from "./mod"`
d) `require("./mod")`

**Answer: b) `import { type SomeType }` or `import type { SomeType }`**

---

**11. `isolatedModules: true` implies each file should be compilable in isolation mainly because:**

a) TypeScript skips `.d.ts` generation
b) Tools like Babel or esbuild transpile per-file without full program type info
c) It disables all generics
d) It forces `module: CommonJS`

**Answer: b) Tools like Babel or esbuild transpile per-file without full program type info**

---

**12. With `isolatedModules`, which pattern is commonly problematic?**

a) `namespace` merging across files
b) `const enum` exports that expect cross-file inlining by `tsc`
c) `import type` usage
d) `as const` on arrays

**Answer: b) `const enum` exports that expect cross-file inlining by `tsc`**

---

**13. `moduleDetection: "force"` makes TypeScript treat files as modules even when:**

a) They only contain `interface` declarations
b) They have no `import`/`export` statements
c) They use `require`
d) They are `.d.ts` only

**Answer: b) They have no `import`/`export` statements**

---

**14. For Node.js ESM resolution with modern settings, which `module` mode aligns with `"node16"` / `"nodenext"`?**

a) Legacy script output without extension resolution
b) Emit and resolution rules that follow Node’s ESM/CJS interop
c) AMD modules
d) SystemJS only

**Answer: b) Emit and resolution rules that follow Node’s ESM/CJS interop**

---

**15. TypeScript 5.9 adds `module: "node20"` primarily to:**

a) Remove support for `import.meta`
b) Track Node 20+ module resolution and emit conventions beyond `"nodenext"`
c) Disable ECMAScript modules entirely
d) Replace `package.json` with `tsconfig.json`

**Answer: b) Track Node 20+ module resolution and emit conventions beyond `"nodenext"`**

---

**16. In `tsconfig.json`, `"extends"` is used to:**

a) Merge multiple entry points at runtime
b) Inherit compiler options from another JSON file
c) Import `.d.ts` files automatically
d) Enable project references only

**Answer: b) Inherit compiler options from another JSON file**

---

**17. Project references (`references` + `composite`) help with:**

a) Faster incremental builds split across dependent projects
b) Disabling type checking in libraries
c) Replacing `npm` workspaces
d) Runtime module federation only

**Answer: a) Faster incremental builds split across dependent projects**

---

**18. For a referenced project, `composite: true` typically requires:**

a) `declaration: true` so dependents can consume `.d.ts` outputs
b) `noEmit: true`
c) `allowJs: false` always
d) `isolatedModules: false` always

**Answer: a) `declaration: true` so dependents can consume `.d.ts` outputs**

---

**19. What is `R`?**

```typescript
type Box<T extends string = "x"> = { tag: T };
type R = Box;
```

a) `{ tag: unknown }`
b) `{ tag: "x" }`
c) `{ tag: string }`
d) Error: invalid default

**Answer: b) `{ tag: "x" }`**

---

**20. Recursive type — what does `Json` include at a high level?**

```typescript
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
```

a) Only JSON primitives
b) Arbitrarily nested JSON-like structures
c) Functions and symbols
d) `bigint` only

**Answer: b) Arbitrarily nested JSON-like structures**

---

**21. What is `Z`?**

```typescript
type Last<T extends readonly any[]> = T extends [...infer _, infer L] ? L : never;
type Z = Last<[1, 2, 3]>;
```

a) `1 | 2 | 3`
b) `3`
c) `never`
d) `number`

**Answer: b) `3`**

---

**22. Branded nominal pattern — why is `UserId` harder to mix up with plain `string`?**

```typescript
type UserId = string & { __brand: "UserId" };
```

a) Runtime throws on assignment
b) TypeScript rejects assigning arbitrary `string` without assertion/cast
c) It becomes a numeric type
d) It removes structural typing entirely for all types

**Answer: b) TypeScript rejects assigning arbitrary `string` without assertion/cast**

---

**23. Template literal inference — what is `Evt`?**

```typescript
type Evt<T extends string> = `on${Capitalize<T>}`;
type X = Evt<"click">;
```

a) `"onclick"`
b) `"onClick"`
c) `"Onclick"`
d) `string`

**Answer: b) `"onClick"`**

---

**24. Distributive conditional — what is `Z`?**

```typescript
type ToArr<T> = T extends any ? T[] : never;
type Z = ToArr<"a" | "b">;
```

a) `("a" | "b")[]`
b) `"a"[] | "b"[]`
c) `never`
d) `string[]`

**Answer: b) `"a"[] | "b"[]`**

---

**25. What is `Z`? (Wrapped parameter — no distribution)**

```typescript
type F<T> = [T] extends ["a" | "b"] ? T : never;
type Z = F<"a" | "b">;
```

a) `"a" | "b"`
b) `never`
c) `"a"`
d) `"b"`

**Answer: a) `"a" | "b"`**

---

**26. The `never` type is the:**

a) Top type assignable from everything
b) Bottom type with no inhabitants, often used for impossible branches
c) Same as `void`
d) Same as `unknown`

**Answer: b) Bottom type with no inhabitants, often used for impossible branches**

---

**27. What is `keys`’s type?**

```typescript
type Empty = {};
type keys = keyof Empty;
```

a) `never`
b) `string | number | symbol` (string index signature keyspace for unconstrained empty object)
c) `undefined`
d) `"__proto__"` only

**Answer: b) `string | number | symbol` (string index signature keyspace for unconstrained empty object)**

---

**28. `{}` as a type (empty object type) allows:**

a) Only object literals with no properties
b) Any non-nullish value except `null` and `undefined` in many contexts
c) Only functions
d) Nothing; it is equivalent to `never`

**Answer: b) Any non-nullish value except `null` and `undefined` in many contexts**

---

**29. Type predicate vs assertion — after `if (isFoo(x))`, `x` is narrowed by:**

a) Assertion function only
b) A type guard returning `x is Foo`
c) `as Foo` cast
d) `satisfies`

**Answer: b) A type guard returning `x is Foo`**

---

**30. With `exactOptionalPropertyTypes: true`, assigning `undefined` to an optional property:**

```typescript
type Opt = { x?: number };
const o: Opt = { x: undefined };
```

a) Is always allowed
b) May error because `x?: number` means absent or `number`, not explicitly `undefined`, unless widened with `| undefined`
c) Forces `x` to become required
d) Only errors if `strictNullChecks` is off

**Answer: b) May error because `x?: number` means absent or `number`, not explicitly `undefined`, unless widened with `| undefined`**

---

**31. `noUncheckedIndexedAccess: true` affects property access like `obj[k]` by:**

a) Removing all index signatures
b) Adding `undefined` to the result type when indexing is not proven safe
c) Banning bracket notation
d) Converting keys to `any`

**Answer: b) Adding `undefined` to the result type when indexing is not proven safe**

---

**32. `noUncheckedSideEffectImports` (TypeScript 5.9) primarily causes an error when:**

a) A side-effect-only import (`import "./mod"`) cannot resolve to a module, instead of being silently ignored
b) Any imported symbol is unused
c) `import type` is mixed with value imports in one statement
d) Dynamic `import()` returns `any`

**Answer: a) A side-effect-only import (`import "./mod"`) cannot resolve to a module, instead of being silently ignored**

---

**33. `skipLibCheck: true` primarily:**

a) Skips emitting `.js` for libraries
b) Skips type checking of declaration files in `node_modules`, improving speed at the cost of less safety
c) Disables `strict` mode
d) Removes the need for `types` field

**Answer: b) Skips type checking of declaration files in `node_modules`, improving speed at the cost of less safety**

---

**34. Method decorator (stage 3) receives context including:**

a) Only the class constructor
b) `kind`, `name`, access, and for methods a `value` reference (API shape per TS decorator design)
c) Property descriptor always in the first argument
d) Nothing; decorators are macros

**Answer: b) `kind`, `name`, access, and for methods a `value` reference (API shape per TS decorator design)**

---

**35. Field decorator on a class field can be used to:**

a) Replace the field type with `any` only
b) Wrap or replace the initializer / accessor behavior via returned replacement functions (per decorator semantics)
c) Delete the field at runtime in all engines
d) Add JSX automatically

**Answer: b) Wrap or replace the initializer / accessor behavior via returned replacement functions (per decorator semantics)**

---

**36. Accessor decorators target:**

a) Only public static fields
b) Getters and/or setters as a paired accessor declaration
c) `import` statements
d) Enum members only

**Answer: b) Getters and/or setters as a paired accessor declaration**

---

**37. Explicit Resource Management: `using` requires the value to be:**

a) A `Promise`
b) `Disposable` (or `Symbol.dispose` for disposal semantics)
c) A `function`
d) A `WeakRef`

**Answer: b) `Disposable` (or `Symbol.dispose` for disposal semantics)**

---

**38. For async cleanup, which symbol is used alongside `await using`?**

a) `Symbol.iterator`
b) `Symbol.asyncDispose`
c) `Symbol.toStringTag`
d) `Symbol.species`

**Answer: b) `Symbol.asyncDispose`**

---

**39. `DisposableStack` is useful to:**

a) Serialize promises
b) Register multiple disposable resources and dispose them in LIFO order
c) Replace `try/catch`
d) Type-check JSX props

**Answer: b) Register multiple disposable resources and dispose them in LIFO order**

---

**40. `AsyncDisposableStack` differs from `DisposableStack` by:**

a) Supporting asynchronous disposal via `Symbol.asyncDispose`
b) Disallowing any resources
c) Running synchronously only
d) Requiring `composite: true`

**Answer: a) Supporting asynchronous disposal via `Symbol.asyncDispose`**

---

**41. Variance: `type RO<out T>` means `T` appears in:**

a) Only input positions (contravariant)
b) Only output positions (covariant)
c) Both in and out positions invariantly
d) Nowhere

**Answer: b) Only output positions (covariant)**

---

**42. Variance: `type Sink<in T>` models:**

a) A producer of `T`
b) A consumer of `T` (contravariant in `T`)
c) An invariant box
d) A constant type

**Answer: b) A consumer of `T` (contravariant in `T`)**

---

**43. `in out T` on a generic parameter indicates:**

a) Covariant only
b) Contravariant only
c) Invariant — both input and output occurrences
d) Optional type parameter

**Answer: c) Invariant — both input and output occurrences**

---

**44. What is `Z`?**

```typescript
type Join<A extends string, B extends string> = `${A}.${B}`;
type Z = Join<"ns", "key">;
```

a) `"ns" | "key"`
b) `"ns.key"`
c) `string`
d) `never`

**Answer: b) `"ns.key"`**

---

**45. `tsc --init` defaults in recent TypeScript versions increasingly enable stricter options; which pair is commonly emphasized for safer indexing and optional props?**

a) `noImplicitAny` and `noEmit`
b) `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`
c) `allowJs` and `checkJs`
d) `module: UMD` and `verbatimModuleSyntax`

**Answer: b) `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`**

---

**46. What is `Z`?**

```typescript
type All<T> = true extends T ? "yes" : "no";
type Z = All<boolean>;
```

a) `"yes"`
b) `"no"`
c) `never`
d) `"yes" | "no"`

**Answer: a) `"yes"`**

---

**47. A function `isString(x: unknown): x is string` is a:**

a) Assertion function
b) User-defined type guard
c) Method decorator
d) Module augmentation

**Answer: b) User-defined type guard**

---

**48. `export type { Foo }` with `verbatimModuleSyntax` is used because:**

a) It forces runtime re-export of values
b) It marks a type-only re-export that can be erased
c) It enables `const enum` inlining
d) It replaces `namespace`

**Answer: b) It marks a type-only re-export that can be erased**

---

**49. What is `Z`?**

```typescript
type Flat<T> = T extends ReadonlyArray<infer U> ? U : T;
type Z = Flat<readonly [1, 2]>;
```

a) `readonly [1, 2]`
b) `1 | 2`
c) `[1, 2]`
d) `number`

**Answer: b) `1 | 2`**

---

**50. `never` in a union `string | never` simplifies to:**

a) `never`
b) `string`
c) `unknown`
d) `void`

**Answer: b) `string`**

---
