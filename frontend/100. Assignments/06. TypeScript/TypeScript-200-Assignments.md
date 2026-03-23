# 200 TypeScript 5.9 Real-Time Assignments

> TypeScript **5.9** (December 2025): `import defer`, `--module node20` / `"module": "node20"`, stricter `tsc --init` defaults, `satisfies`, `const` type parameters, decorators, `using` / `await using`, `NoInfer`, variance annotations (`in` / `out`), and related tooling.

---

## BEGINNER LEVEL (Assignments 1–70)

### Basic Types (1–10)

**Assignment 1:** Declare three variables with explicit annotations: `string`, `number`, and `boolean`.

**Assignment 2:** Show a variable where TypeScript infers the type from the initializer (no explicit annotation).

**Assignment 3:** Declare a typed array of numbers and push a value. Show that wrong element types are rejected at compile time.

**Assignment 4:** Create a tuple type `[string, number]` for a person’s name and age, assign a value, and access both positions.

**Assignment 5:** Define a numeric enum (e.g. `TaskStatus`) with `Pending`, `Done` and use it in a variable.

**Assignment 6:** Define a string enum `UserRole` with `Admin` and `User`; assign and compare.

**Assignment 7:** Use a `const` enum or `as const` object to model fixed string literals for HTTP methods.

**Assignment 8:** Create a union type `string | number` and narrow with `typeof`.

**Assignment 9:** Use literal types `"on" | "off"` for a toggle state.

**Assignment 10:** Contrast `any` vs `unknown`: show safe narrowing from `unknown` before use.

### Interfaces & Type Aliases (11–20)

**Assignment 11:** Declare an interface `User` with `id: number` and `email: string`.

**Assignment 12:** Extend `User` with optional `nickname?: string` and `readonly createdAt: string`.

**Assignment 13:** Create interface `Named` and `Timed`; use intersection `Named & Timed` for a type alias.

**Assignment 14:** Extend one interface from another (`extends`).

**Assignment 15:** Declare a type alias `ID` as `string` and use it in another alias.

**Assignment 16:** Explain by example: interface merging vs type alias (use two `interface TsPlugin` declarations that merge).

**Assignment 17:** Add an index signature `[key: string]: number` to a type for a string-to-number map.

**Assignment 18:** Put a call signature inside an interface `Logger` with `(msg: string) => void`.

**Assignment 19:** Use a type alias for a function type `(x: number, y: number) => number`.

**Assignment 20:** Model a dictionary with specific keys using `Record` vs index signature (use `Record` here).

### Functions (21–32)

**Assignment 21:** Write a function `greet` with typed parameters `name: string` and return type `string`.

**Assignment 22:** Add optional parameter `title?: string` and default `punctuation = "!"`.

**Assignment 23:** Use rest parameters `...nums: number[]` to sum numbers.

**Assignment 24:** Declare overloads for `format(value: string): string` and `format(value: number): string`; single implementation.

**Assignment 25:** Typed arrow function returning boolean.

**Assignment 26:** Function returning `void` vs function that never returns (`never`) — show both.

**Assignment 27:** Type a higher-order function that accepts `cb: (err: Error | null, data?: string) => void`.

**Assignment 28:** Write a generic function `identity<T>(x: T): T`.

**Assignment 29:** Write a user-defined type predicate `isString(x: unknown): x is string`.

**Assignment 30:** Constrain a generic: `function longest<T extends { length: number }>(a: T, b: T): T`.

**Assignment 31:** Use `keyof` in a generic function `get(obj, key)`.

**Assignment 32:** Demonstrate `typeof` in type position to derive a type from a value.

### Objects & Classes (33–46)

**Assignment 33:** Declare a class `Point` with `x` and `y` as numbers.

**Assignment 34:** Use `public`, `private`, and `protected` fields with a subclass.

**Assignment 35:** Add `readonly id: string` set in constructor.

**Assignment 36:** Implement a getter and setter for a private backing field.

**Assignment 37:** Use `implements` to satisfy an interface `Serializable`.

**Assignment 38:** Create an abstract class `Shape` with abstract `area(): number` and concrete subclass.

**Assignment 39:** Add static method `from` on a class.

**Assignment 40:** Use parameter properties: `constructor(public name: string, private age: number)`.

**Assignment 41:** Override a method in a subclass with compatible return type.

**Assignment 42:** Use a private `#field` (ECMAScript private) vs `private` keyword — show `#field`.

**Assignment 43:** Implement `interface` for instance + separate constructor interface pattern (simplified).

**Assignment 44:** Class with generic type parameter `class Container<T>`.

**Assignment 45:** Use `this` return type for fluent methods.

**Assignment 46:** Implement two interfaces on one class (`class C implements A, B`).

### Generics Basics (47–56)

**Assignment 47:** Generic function `pair<A, B>(a: A, b: B): [A, B]`.

**Assignment 48:** Generic interface `ApiResponse<T> { data: T; error?: string }`.

**Assignment 49:** Generic class `Stack<T>` with `push`/`pop`.

**Assignment 50:** Constrain with `extends` and default type parameter `create<T = string>()`.

**Assignment 51:** Multiple type parameters `map2<A,B,C>(a: A, b: B, f: (x:A,y:B)=>C): C`.

**Assignment 52:** Use `keyof` with generics to pick a property type.

**Assignment 53:** Combine `typeof` and indexed access for config keys.

**Assignment 54:** Generic `wrap` that preserves literal types (without widening).

**Assignment 55:** Show `extends keyof any` constraint for keys.

**Assignment 56:** Recursive generic: tree node `Tree<T>`.

### Utility Types (57–66)

**Assignment 57:** Use `Partial<User>` to build an update object.

**Assignment 58:** Use `Required` on a type with optional fields.

**Assignment 59:** Use `Readonly` on an array property.

**Assignment 60:** Use `Pick<User, "id" | "email">`.

**Assignment 61:** Use `Omit<User, "password">`.

**Assignment 62:** Use `Record<PowerState, number>`.

**Assignment 63:** Use `ReturnType<typeof fn>`.

**Assignment 64:** Use `Parameters<typeof fn>`.

**Assignment 65:** Use `Exclude<"a"|"b"|"c", "a">`.

**Assignment 66:** Use `Extract<"a"|"b", "a"|"c">`.

### Modules & Config (67–70)

**Assignment 67:** Show named `export` and `import` between two modules (single file example with comments).

**Assignment 68:** Use `import type` for type-only import (show the consumer line; types live in `./types` in a real project).

**Assignment 69:** Document what `tsc --init` sets in TS 5.9 (stricter defaults): mention `strict`, `noUncheckedSideEffectImports` in comments.

**Assignment 70:** List `compilerOptions` in a sample `tsconfig` comment: `strictNullChecks`, `noImplicitAny`, `skipLibCheck`.

---

## INTERMEDIATE LEVEL (Assignments 71–140)

### Advanced Generics (71–82)

**Assignment 71:** Write a conditional type `IsString<T>` that resolves to `true` if `T` is `string`, else `false`.

**Assignment 72:** Use `infer` to extract array element: `ElementOf<T>`.

**Assignment 73:** Mapped type `ReadonlyAll<T>` making every property readonly.

**Assignment 74:** Template literal type ``Hello ${Capitalize<Name>}``.

**Assignment 75:** Recursive type `Json` for JSON-like structures.

**Assignment 76:** Distributive conditional: `ToArray<T>` for unions.

**Assignment 77:** Constrain with `keyof` and map: `PickByType<T, U>`.

**Assignment 78:** Mapped modifiers: remove `readonly` (`-readonly`) and add optional (`?`).

**Assignment 79:** Key remapping with `as` to rename keys to `camelCase` prefix `prefixed`.

**Assignment 80:** Extract function return with conditional + infer.

**Assignment 81:** Tuple prepend type.

**Assignment 82:** `Flatten` tuple one level.

### Advanced Types (83–96)

**Assignment 83:** Discriminated union `kind: "circle" | "square"` with `switch` narrowing.

**Assignment 84:** Exhaustive check with `never` helper `assertNever(x: never)`.

**Assignment 85:** Branded type for `UserId` to avoid string mixing.

**Assignment 86:** Narrow with `typeof`, `instanceof`, `in`, and truthiness in one example.

**Assignment 87:** Assertion function `asserts value is string`.

**Assignment 88:** Advanced guard: `isObjectWithKey` generic.

**Assignment 89:** Use `satisfies` to keep literal types while checking structure.

**Assignment 90:** `as const` deep on config object.

**Assignment 91:** Const type parameter `function foo<const T>(x: T)` preserving tuple literal.

**Assignment 92:** Template literal filtering with `Exclude` on unions.

**Assignment 93:** Opaque error type pattern.

**Assignment 94:** Combine `satisfies` with `as const` for API version tuple.

**Assignment 95:** Indexed access on union of objects.

**Assignment 96:** Type-level optional chaining simulation with conditional types.

### Decorators & Modern (97–108)

**Assignment 97:** Class decorator (legacy experimental) logging constructor.

**Assignment 98:** Method decorator wrapping original.

**Assignment 99:** Field decorator (Stage 3 / TS 5.x) — show signature comment if runtime unavailable.

**Assignment 100:** Accessor decorator example (legacy `PropertyDescriptor` on setter; avoid shadowing DOM `Range`).

**Assignment 101:** Decorator factory `Throttle(ms)`.

**Assignment 102:** `using` for `Disposable` resource cleanup.

**Assignment 103:** `await using` with async disposable.

**Assignment 104:** `DisposableStack` pushing multiple disposables.

**Assignment 105:** Implement custom `Symbol.dispose` on a connection class.

**Assignment 106:** Compare legacy vs modern decorator metadata note in comment.

**Assignment 107:** Parameter decorator pattern (log argument index) — legacy experimental signature.

**Assignment 108:** Class decorator returning new constructor narrowing instance type.

### Advanced Patterns (109–120)

**Assignment 109:** Fluent builder with chained methods returning `this` typed.

**Assignment 110:** Factory function returning interface implementation.

**Assignment 111:** Strategy pattern with map of handlers.

**Assignment 112:** Observer pattern typed with `Set<Observer>`.

**Assignment 113:** Repository interface with generic `id`.

**Assignment 114:** Type-safe event emitter `on<K extends keyof E>(event: K, ...)`.

**Assignment 115:** Type-safe API client with endpoint map.

**Assignment 116:** Middleware chain `use` storing typed handlers.

**Assignment 117:** State machine with discriminated state and transition function.

**Assignment 118:** Dependency injection container interface.

**Assignment 119:** Builder with required final `build()` returning readonly product.

**Assignment 120:** Visitor pattern over a discriminated union with typed `visit` methods.

### Module System (121–130)

**Assignment 121:** Explain `verbatimModuleSyntax`: use `import type` / `export type` in example.

**Assignment 122:** `isolatedModules` constraint: type-only exports must use `export type`.

**Assignment 123:** `moduleDetection: "force"` comment and empty export.

**Assignment 124:** Sample `.d.ts` declaring a global `myLib`.

**Assignment 125:** `declare function` in ambient declaration.

**Assignment 126:** Module augmentation: extend `Express` Request (pattern).

**Assignment 127:** Global augmentation `global`.

**Assignment 128:** Ambient module for CSS imports (`*.css` wildcard belongs in a root `.d.ts` without other imports).

**Assignment 129:** `namespace` grouping (legacy interop).

**Assignment 130:** Barrel file re-export pattern.

### Strict Options (131–140)

**Assignment 131:** `strictNullChecks`: narrow before use on `string | null`.

**Assignment 132:** `exactOptionalPropertyTypes`: optional props differ from `| undefined` — use assertion when assigning `undefined` intentionally.

**Assignment 133:** `noUncheckedIndexedAccess`: array access returns `T | undefined`.

**Assignment 134:** `strictFunctionTypes`: contravariance in function parameters — demonstrate safer callback typing.

**Assignment 135:** `noUncheckedSideEffectImports` intent: import used only for side effects must be explicit `import "./setup"`.

**Assignment 136:** Use `NoInfer<T>` to prevent inference from an argument from widening another generic.

**Assignment 137:** Variance annotation `out` for covariant type parameter (TS 4.7+ / 5.x).

**Assignment 138:** Variance annotation `in` for contravariant type parameter.

**Assignment 139:** Combine `satisfies` with strict optional properties.

**Assignment 140:** Indexed access with `noUncheckedIndexedAccess` on `Record`.

---

## ADVANCED LEVEL (Assignments 141–200)

### Type-Level Programming (141–155)

**Assignment 141:** Parse string split by delimiter at type level (simple `Split<S, D>`).

**Assignment 142:** Type-level increment on digit union (simplified Peano-style using tuples).

**Assignment 143:** Tuple `Reverse` type.

**Assignment 144:** `DeepPartial<T>` one level + comment for recursion.

**Assignment 145:** `DeepReadonly<T>` recursive.

**Assignment 146:** Path types `Paths<T>` for dot notation (depth 2 demo).

**Assignment 147:** Type-safe router params extraction from path literal.

**Assignment 148:** `ParseQuery` style string to record (simplified).

**Assignment 149:** SQL-ish `Select<Cols, Row>` picking columns.

**Assignment 150:** Variadic tuple `Concat<A,B>`.

**Assignment 151:** HKT simulation with interface `Functor<F>` pattern.

**Assignment 152:** Type-level state machine transitions map.

**Assignment 153:** Advanced template: trim spaces (simple).

**Assignment 154:** JSON parse return typed as `unknown` then narrowed.

**Assignment 155:** Tuple zip type (same length).

### Advanced Utility Types (156–165)

**Assignment 156:** Implement `Prettify<T>` to expand intersections.

**Assignment 157:** `UnionToIntersection<U>`.

**Assignment 158:** `IsNever<T>`.

**Assignment 159:** `IsAny<T>` (careful).

**Assignment 160:** `TupleToUnion<T>`.

**Assignment 161:** `Merge<A,B>` with B overriding A.

**Assignment 162:** `RequireAtLeastOne<T>`.

**Assignment 163:** `MutableKeys<T>` / `ReadonlyKeys<T>` using mapping modifiers.

**Assignment 164:** `DeepPartial` + `Prettify` composition.

**Assignment 165:** `NonNullable` custom reimplementation.

### Real-World Typing (166–180)

**Assignment 166:** Type-safe `fetch` wrapper with JSON schema generic.

**Assignment 167:** Typed environment variables via schema type.

**Assignment 168:** Form field types `Form<T>` with keys.

**Assignment 169:** Typed event bus `on<E>(name, handler)`.

**Assignment 170:** Typed Express-style middleware `Request` extension.

**Assignment 171:** React-like component props typing `PropsWithChildren`.

**Assignment 172:** API response wrapper `ApiOk<T> | ApiErr`.

**Assignment 173:** Redux-like store `createStore<S, A extends { type: string }>`.

**Assignment 174:** Query builder `where<K extends keyof Row>(k: K, v: Row[K])`.

**Assignment 175:** Configuration manager with `get<K extends keyof C>(k: K): C[K]`.

**Assignment 176:** Type-safe i18n keys `TFunction<K extends string>`.

**Assignment 177:** CLI args parser types `ArgsSpec -> Parsed`.

**Assignment 178:** DI container `register<T>(token, impl)` with a typed service map.

**Assignment 179:** Plugin system: `ContextPlugin` with `apply(ctx: Context): void`.

**Assignment 180:** Pub/sub with topic map.

### Advanced Compiler (181–190)

**Assignment 181:** Project references comment: solution structure `references` array.

**Assignment 182:** `composite: true` for referenced project.

**Assignment 183:** `incremental: true` and `.tsbuildinfo`.

**Assignment 184:** `import defer` (TS 5.9): comment example for deferred module evaluation.

**Assignment 185:** `--module node20` / `module: "node20"` with `import.meta.dirname` note.

**Assignment 186:** Custom transformers concept (comment-only).

**Assignment 187:** `declarationMap` for go-to-definition in `.d.ts`.

**Assignment 188:** `sourceMap` for debugging.

**Assignment 189:** `extends` in tsconfig chain.

**Assignment 190:** `paths` mapping `@app/*`.

### Testing & Tooling (191–196)

**Assignment 191:** Type testing `Expect` and `Equal`.

**Assignment 192:** Assertion types for compile-time tests.

**Assignment 193:** Mock typing: `jest.MockedFunction` pattern simplified.

**Assignment 194:** Test utility `PartialExcept<T,K>`.

**Assignment 195:** Type coverage mention with `type-coverage` tool comment.

**Assignment 196:** Type-safe fixtures factory `fixture<T>(defaults: Partial<T>): T`.

### Capstone Projects (197–200)

**Assignment 197:** Capstone: type-safe REST client with method map and response types.

**Assignment 198:** Capstone: type-safe form library `Field<T>` + `values` inference.

**Assignment 199:** Capstone: type-safe state management `createSlice<S,A>`.

**Assignment 200:** Capstone: full-stack type sharing — `shared/types.ts` consumed by client/server (comment pattern).

