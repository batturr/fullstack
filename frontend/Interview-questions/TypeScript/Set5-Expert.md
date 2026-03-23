# TypeScript 5.9 MCQ - Set 5 (Expert Level)

**1. In TypeScript 5.9, which `import defer` form is valid?**

```typescript
// import defer * as mod from "./mod";
// mod.someExport; // triggers evaluation
```

a) `import defer { foo } from "./mod"`
b) `import defer * as mod from "./mod"`
c) `import defer default as d from "./mod"`
d) `import defer type { Foo } from "./mod"`

**Answer: b) `import defer * as mod from "./mod"`**

---

**2. Deferred imports in TS 5.9 are designed so that the module body runs when?**

a) At program startup, before `main`
b) Only when a property of the deferred namespace object is accessed
c) On every tick of the event loop
d) After all `import type` declarations are erased

**Answer: b) Only when a property of the deferred namespace object is accessed**

---

**3. Which module settings align with `import defer` as introduced in TS 5.9?**

a) `--module commonjs` only
b) `--module preserve` and `esnext`-style emit that preserves `import defer`
c) `--module amd` with `outFile`
d) `--module umd` for browser bundles

**Answer: b) `--module preserve` and `esnext`-style emit that preserves `import defer`**

---

**4. What is a key restriction of `import defer` compared to eager namespace imports?**

a) You cannot use `import defer` with JSON modules
b) Only namespace imports (`import defer * as ns`) are allowed; named/default deferred imports are not
c) Deferred modules must omit side effects
d) The namespace must be re-exported with `export *`

**Answer: b) Only namespace imports (`import defer * as ns`) are allowed; named/default deferred imports are not**

---

**5. With `--module node20` (TS 5.9), what is a documented implication for `target`?**

```typescript
// tsconfig compilerOptions: { "module": "node20" }
```

a) It forces `target` to `es5`
b) It implies a modern baseline such as `es2023` for emitted syntax expectations
c) It always emits ESM regardless of `package.json`
d) It disables `resolvePackageJsonExports`

**Answer: b) It implies a modern baseline such as `es2023` for emitted syntax expectations**

---

**6. Why is `--module node20` introduced relative to `nodenext`?**

a) To remove support for `package.json` `"exports"`
b) To model stable Node 20+ resolution and emit semantics without tracking every future Node minor
c) To compile exclusively to CommonJS
d) To disable `import defer`

**Answer: b) To model stable Node 20+ resolution and emit semantics without tracking every future Node minor**

---

**7. In TS 5.9 lib typing changes, why might code assigning a `Uint8Array` to `ArrayBuffer` break?**

```typescript
declare const u8: Uint8Array;
declare function useBuf(b: ArrayBuffer): void;
// useBuf(u8); // may error under stricter buffer typing
```

a) `Uint8Array` is now a subtype of `string`
b) `ArrayBuffer` is no longer treated as a common supertype of all `TypedArray` views
c) `ArrayBuffer` was removed from lib
d) `TypedArray` is now an alias for `unknown`

**Answer: b) `ArrayBuffer` is no longer treated as a common supertype of all `TypedArray` views**

---

**8. After the lib change, which pattern is type-correct for a function that needs the underlying buffer?**

a) Passing `Uint8Array` where `ArrayBuffer` is expected without conversion
b) Using `.buffer` on the view (noting possible slicing) or accepting `ArrayBufferLike` where appropriate
c) Casting with `as any` only
d) Replacing `Uint8Array` with `DataView` everywhere

**Answer: b) Using `.buffer` on the view (noting possible slicing) or accepting `ArrayBufferLike` where appropriate**

---

**9. Node's `Buffer` extends `Uint8Array`. After stricter separation of buffer-like types, what is a common typing pitfall?**

a) `Buffer` becomes identical to `string`
b) APIs expecting `ArrayBuffer` may reject `Buffer`/`Uint8Array` without overloads or widened parameter types
c) `Buffer` can no longer be used in `fs` APIs
d) `Buffer` is removed from `@types/node`

**Answer: b) APIs expecting `ArrayBuffer` may reject `Buffer`/`Uint8Array` without overloads or widened parameter types**

---

**10. TS 5.8 tightened checking of `return` expressions across branches. What class of bug does this catch?**

```typescript
function f(cond: boolean): { ok: true; v: number } | { ok: false } {
  if (cond) return { ok: true, v: 1 };
  return { ok: false, v: "oops" }; // branch consistency checked more strictly
}
```

a) Unused local variables
b) Inconsistent or impossible return types when different branches return incompatible expression types under contextual typing
c) Missing `await` in async functions
d) Implicit `any` in catch clauses

**Answer: b) Inconsistent or impossible return types when different branches return incompatible expression types under contextual typing**

---

**11. Under `--module nodenext`, what happens when TypeScript types `require()` of an ESM-only package?**

```typescript
// require("esm-only-pkg");
```

a) It always succeeds with `any`
b) It may error because `require` cannot load ESM in Node's model, matching runtime constraints
c) It rewrites `require` to dynamic `import()`
d) It forces `moduleResolution: bundler`

**Answer: b) It may error because `require` cannot load ESM in Node's model, matching runtime constraints**

---

**12. What does this type compute?**

```typescript
type Length<T extends readonly unknown[]> = T extends { length: infer L extends number }
  ? L
  : never;
type N = Length<[1, 2, 3]>;
```

a) `N` is `3`
b) `N` is `number`
c) `N` is `never`
d) `N` is a tuple type

**Answer: a) `N` is `3`**

---

**13. TypeScript lacks native HKTs. Which pattern most directly emulates `F<_>`?**

a) `type Id<T> = T`
b) A generic interface with an unconstrained type parameter `type Apply<F, X> = ...` where `F` carries its own type parameter slot via a helper interface
c) `namespace HKT { export type _ = unknown }`
d) Using `eval` at the type level

**Answer: b) A generic interface with an unconstrained type parameter `type Apply<F, X> = ...` where `F` carries its own type parameter slot via a helper interface**

---

**14. Key remapping in mapped types uses which syntax?**

```typescript
type Prefix<T> = { [K in keyof T as `p_${K & string}`]: T[K] };
```

a) `[K in keyof T]?: T[K]`
b) `[K in keyof T as NewKey]: T[K]`
c) `[K keyof T as NewKey]: T[K]`
d) `map K over T -> NewKey`

**Answer: b) `[K in keyof T as NewKey]: T[K]`**

---

**15. Given:**

```typescript
type FilterKeys<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
type T0 = { a: 1; b: "x"; c: 2 };
type R = FilterKeys<T0, number>;
```

What is `R`?

a) `{ a: 1; c: 2 }`
b) `{ b: "x" }`
c) `{}`
d) `T0`

**Answer: a) `{ a: 1; c: 2 }`**

---

**16. Why does `T extends any ? X : Y` distribute over union `T`?**

```typescript
type ToArr<T> = T extends any ? T[] : never;
type A = ToArr<1 | 2>; // 1[] | 2[]
```

a) Because `any` disables distribution
b) Because naked type parameters on the left of `extends` in conditional types distribute
c) Because `extends` always maps tuples
d) Because of `--strictNullChecks`

**Answer: b) Because naked type parameters on the left of `extends` in conditional types distribute**

---

**17. How do you prevent distributive conditional behavior for union `T`?**

```typescript
type ToArr2<T> = [T] extends [any] ? T[] : never;
type B = ToArr2<1 | 2>; // (1 | 2)[]
```

a) Wrap `T` in a tuple: `[T] extends [U] ? A : B`
b) Add `extends unknown` to every union member
c) Use `// @ts-expect-error`
d) Replace unions with enums

**Answer: a) Wrap `T` in a tuple: `[T] extends [U] ? A : B`**

---

**18. What is a valid pattern to infer both element and rest tuple parts?**

```typescript
type Split<T extends unknown[]> = T extends [...infer Head, infer Last]
  ? { init: Head; last: Last }
  : never;
type S = Split<[1, 2, 3]>;
```

What is `S["last"]`?

a) `3`
b) `number`
c) `unknown`
d) `never`

**Answer: a) `3`**

---

**19. Which template literal manipulation extracts `"id"` from `"/user/:id"` in the type system?**

```typescript
type Route = "/user/:id";
type IdParam = Route extends `/user/:${infer P}` ? P : never;
```

a) `` `/${string}` ``
b) `` T extends `/user/:${infer P}` ? P : never ``
c) `` T extends `${infer A}/${infer B}` ? B : never ``
d) `Extract<T, string>`

**Answer: b) `` T extends `/user/:${infer P}` ? P : never ``**

---

**20. Variadic tuples: what does `[...T, ...U]` require for soundness?**

```typescript
type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];
type C = Concat<[1], [2, 3]>; // [1, 2, 3]
```

a) `T` and `U` must be identical
b) `T` and `U` should be tuple or array types where spreading order matches desired concatenation
c) Only `T` may be optional
d) `U` must be a string union

**Answer: b) `T` and `U` should be tuple or array types where spreading order matches desired concatenation**

---

**21. Labeled tuple elements primarily affect:**

```typescript
type Point = [x: number, y: number];
```

a) Runtime performance of tuple access
b) Ergonomic errors and editor hints; they do not change the runtime shape
c) Nominal typing of tuples
d) Covariance of function return types

**Answer: b) Ergonomic errors and editor hints; they do not change the runtime shape**

---

**22. A fluent builder often returns `this` as `ReturnType` of chained methods. What generic trick preserves the concrete builder subtype?**

```typescript
class Builder<T extends Builder<T>> {
  set<K extends string>(k: K): T {
    return this as unknown as T;
  }
}
```

a) `this` types in classes, or F-bounded polymorphism `class B<T extends B<T>>`
b) `as any` on every method
c) Declaring all methods `static`
d) Using `namespace`

**Answer: a) `this` types in classes, or F-bounded polymorphism `class B<T extends B<T>>`**

---

**23. Exhaustive matching over discriminated unions in pure types can use:**

```typescript
function assertNever(x: never): never {
  throw new Error();
}
```

a) `switch (true)` only
b) `never` in the default branch with a value asserted to `never`
c) `JSON.parse`
d) `enum` without initializer

**Answer: b) `never` in the default branch with a value asserted to `never`**

---

**24. With `strictFunctionTypes: true`, are parameters checked covariantly or contravariantly for function types in typical positions?**

```typescript
type F = (x: string) => void;
type G = (x: "a") => void;
// Is F assignable to G, or G to F?
```

a) Covariantly
b) Contravariantly
c) Bivariantly always
d) Ignored

**Answer: b) Contravariantly**

---

**25. Method parameters in classes are treated bivariantly for compatibility with unsound-but-common patterns unless you use:**

a) `declare`
b) Property syntax with arrow fields or `strictFunctionTypes` nuances still leaving methods bivariant
c) `ReadonlyArray` only
d) `satisfies unknown`

**Answer: b) Property syntax with arrow fields or `strictFunctionTypes` nuances still leaving methods bivariant**

---

**26. `infer T extends string` (TS 4.7+) constrains inferred `T` to:**

```typescript
type First<S extends string> = S extends `${infer T extends string}-${infer R}`
  ? T
  : never;
```

a) `string | number`
b) `string` (inference fails or resolves to a subtype of `string` as specified)
c) `never`
d) `unknown` always

**Answer: b) `string` (inference fails or resolves to a subtype of `string` as specified)**

---

**27. Recursive type aliases are allowed, but the compiler enforces:**

a) No recursion ever
b) Depth/expansion limits to avoid non-termination
c) Only interfaces may recurse
d) Recursion only in `.d.ts` files

**Answer: b) Depth/expansion limits to avoid non-termination**

---

**28. Intersection `A & B` where `A` and `B` both declare property `x` with conflicting types becomes:**

```typescript
type A = { x: 1 };
type B = { x: 2 };
type AB = A & B;
```

a) `never` for `x` in many cases (unsatisfiable intersection)
b) The wider of the two types always
c) An anonymous symbol type
d) Equivalent to `A | B`

**Answer: a) `never` for `x` in many cases (unsatisfiable intersection)**

---

**29. Circular generic constraints like `T extends Foo<U>, U extends Bar<T>` are:**

```typescript
interface Foo<U> {
  u: U;
}
interface Bar<T> {
  t: T;
}
declare function f<T extends Foo<U>, U extends Bar<T>>(x: T, y: U): void;
```

a) Always rejected syntactically
b) Sometimes expressible but can stress inference and lead to errors or `any` escapes in edge cases
c) Required for mapped types
d) Equivalent to `unknown`

**Answer: b) Sometimes expressible but can stress inference and lead to errors or `any` escapes in edge cases**

---

**30. `moduleResolution: "bundler"` differs from `nodenext` mainly in that:**

```typescript
// { "moduleResolution": "bundler", "module": "esnext" }
```

a) `bundler` never reads `package.json`
b) `bundler` assumes a bundler resolves specifiers and may allow imports that Node would not
c) `bundler` disables ES modules
d) `bundler` implies `--module commonjs`

**Answer: b) `bundler` assumes a bundler resolves specifiers and may allow imports that Node would not**

---

**31. The `exports` field in `package.json` affects TypeScript when:**

```typescript
// package.json exports: "." -> types + import conditions
```

a) Never; only webpack reads it
b) `package.json` exports control which entrypoints and conditions exist for type resolution under modern resolution modes
c) Only if `typesVersions` is absent
d) Only for CSS imports

**Answer: b) `package.json` exports control which entrypoints and conditions exist for type resolution under modern resolution modes**

---

**32. Conditional exports like `"import"` vs `"require"` allow packages to expose:**

a) Duplicate global variables
b) Different module formats/entry files per consumer resolution condition
c) Only JSON
d) Only `.wasm`

**Answer: b) Different module formats/entry files per consumer resolution condition**

---

**33. Type instantiation depth errors occur when:**

```typescript
type N<Nest> = { v: Nest; next: N<Nest> }; // conceptual infinite expansion
```

a) You use `console.log`
b) Type expansion exceeds compiler limits, often from deep recursive types or mapped-type chains
c) You exceed 100 files in a project
d) `noImplicitAny` is false

**Answer: b) Type expansion exceeds compiler limits, often from deep recursive types or mapped-type chains**

---

**34. A common workaround for instantiation depth issues is:**

a) Remove all generics
b) Simplify recursion via tail aliases, intermediate named types, or reduce distributive chains
c) Set `target` to `es3`
d) Use `skipLibCheck: false` only

**Answer: b) Simplify recursion via tail aliases, intermediate named types, or reduce distributive chains**

---

**35. Expensive conditional types inside large unions can slow `tsc` because:**

a) The emitter writes larger JS
b) Type checking may re-evaluate large normal forms repeatedly during inference
c) Node.js runs type checks
d) Source maps grow quadratically

**Answer: b) Type checking may re-evaluate large normal forms repeatedly during inference**

---

**36. Which is a homomorphic mapped type over `T`?**

```typescript
type ReadonlyT<T> = { readonly [K in keyof T]: T[K] };
```

a) `{ [K in "a" | "b"]: T[K] }`
b) `{ [K in keyof T]: T[K] }`
c) `{ [K in string]: T[K] }`
d) `{ a: T["a"] }` only

**Answer: b) `{ [K in keyof T]: T[K] }`**

---

**37. Non-homomorphic mapped types may:**

a) Always preserve modifiers exactly
b) Fail to distribute modifiers like `readonly`/`?` as homomorphic mapping does
c) Be illegal in TS 5.9
d) Require `import defer`

**Answer: b) Fail to distribute modifiers like `readonly`/`?` as homomorphic mapping does**

---

**38. `abstract` construct signatures in a type position describe:**

```typescript
declare const Ctor: abstract new () => { x: number };
// new Ctor(); // invalid: abstract
```

a) Values that can be called like functions but not constructed
b) An abstract class constructor type that cannot be instantiated directly
c) Interfaces that extend `Function` only
d) `new () => void` exclusively

**Answer: b) An abstract class constructor type that cannot be instantiated directly**

---

**39. Given:**

```typescript
type Box<T> = { value: T };
type Unbox<U> = U extends Box<infer V> ? V : never;
type R = Unbox<Box<number> | Box<string>>;
```

What is `R`?

a) `number | string` (distribution)
b) `Box<number | string>`
c) `never`
d) `unknown`

**Answer: a) `number | string` (distribution)**

---

**40. To stop distribution in Q39 for unions, you should:**

a) Use `Unbox<U> = [U] extends [Box<infer V>] ? V : never`
b) Add `readonly` to `Box`
c) Make `Box` an interface
d) Use `satisfies`

**Answer: a) Use `Unbox<U> = [U] extends [Box<infer V>] ? V : never`**

---

**41. Tuple `readonly [number, string]` is assignable to `readonly [number, ...string[]]`?**

```typescript
type A = readonly [number, string];
type B = readonly [number, ...string[]];
declare const a: A;
declare const b: B;
```

a) Always
b) Never
c) Sometimes depending on variance and tuple rest rules
d) Only with `as const`

**Answer: c) Sometimes depending on variance and tuple rest rules**

---

**42. `const` context on a tuple literal without `as const` still can infer a tuple when:**

```typescript
declare function takeTuple(t: [number, string]): void;
takeTuple([1, "a"]);
```

a) Contextual typing expects a tuple type
b) It cannot; tuples never infer without `as const`
c) Only if every element is `any`
d) Only in `.d.ts` files

**Answer: a) Contextual typing expects a tuple type**

---

**43. `satisfies` differs from a type annotation primarily because:**

```typescript
const p = { x: 1, y: 2 } satisfies Record<string, number>;
// p.x is still literal 1
```

a) It widens literals always
b) It checks against a type but preserves a narrower inferred expression type where possible
c) It disables excess property checks
d) It implies `any`

**Answer: b) It checks against a type but preserves a narrower inferred expression type where possible**

---

**44. Structural compatibility between two object types with the same properties can still fail when:**

```typescript
class A {
  private x = 1;
}
class B {
  private x = 1;
}
declare const a: A;
declare const b: B;
// a = b; // error: different private fields
```

a) Properties are `private`/`protected` in classes across different declarations
b) Both are interfaces
c) All properties are `public` and identical
d) They are both `type` aliases

**Answer: a) Properties are `private`/`protected` in classes across different declarations**

---

**45. `noUncheckedIndexedAccess` changes:**

```typescript
type Keys = "a" | "b";
declare const o: Record<Keys, number>;
declare const k: Keys;
const v = o[k]; // includes undefined in the union
```

a) Only enums
b) Indexed access types like `T[K]` for arbitrary `K` to include `undefined` in the union where applicable
c) Function arity checking
d) Decorator evaluation order

**Answer: b) Indexed access types like `T[K]` for arbitrary `K` to include `undefined` in the union where applicable**

---

**46. `infer` cannot appear:**

a) Inside any conditional type
b) In arbitrary positions without `extends` clauses that support inference per grammar rules
c) Only in template literals
d) In mapped types always

**Answer: b) In arbitrary positions without `extends` clauses that support inference per grammar rules**

---

**47. For a type-level `Add` on small numeric literals, a common encoding uses:**

```typescript
type Tuple<N extends number, T extends unknown[] = []> = T["length"] extends N
  ? T
  : Tuple<N, [...T, unknown]>;
```

a) Only floating point types
b) Tuple length recursion: build tuples of length `N` and `M` and infer `N+M` via recursion depth tricks
c) `bigint` literals exclusively
d) `enum` numeric auto-increment only

**Answer: b) Tuple length recursion: build tuples of length `N` and `M` and infer `N+M` via recursion depth tricks**

---

**48. `import type` ensures:**

```typescript
import type { Foo } from "./mod";
```

a) Runtime emit of the import
b) Erasure at emit: no runtime module load solely from that statement
c) `require` is injected
d) `defer` semantics

**Answer: b) Erasure at emit: no runtime module load solely from that statement**

---

**49. `isolatedModules` implies constraints mainly relevant to:**

a) Declaration emit speed
b) Each file must typecheck in isolation as a transpiler would see it (e.g., const enum limitations, isolated re-export patterns)
c) Only `.vue` files
d) Disallowing `namespace`

**Answer: b) Each file must typecheck in isolation as a transpiler would see it (e.g., const enum limitations, isolated re-export patterns)**

---

**50. When comparing `--module node20` vs `nodenext` mentally, which statement is most accurate?**

a) They are byte-identical always
b) `node20` pins semantics to a stable Node generation; `nodenext` tracks Node's evolving `"moduleResolution"` behavior more closely over time
c) `nodenext` cannot resolve `exports`
d) `node20` forbids ESM

**Answer: b) `node20` pins semantics to a stable Node generation; `nodenext` tracks Node's evolving `"moduleResolution"` behavior more closely over time**

---
