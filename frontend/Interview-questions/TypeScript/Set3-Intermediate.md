# TypeScript 5.9 MCQ - Set 3 (Intermediate Level)

**1. What is the type of `R`?**

```typescript
type R = ReturnType<(x: number) => string>;
```

a) `number`
b) `string`
c) `void`
d) `unknown`

**Answer: b) `string`**

---

**2. Will this compile under `strictNullChecks`?**

```typescript
function f(s: string | undefined) {
  return s.length;
}
```

a) Yes, `s` is always a string at runtime
b) No, `s` might be `undefined`
c) Yes, because optional chaining is implied
d) Yes, if `noImplicitAny` is off

**Answer: b) No, `s` might be `undefined`**

---

**3. What does this conditional type resolve to?**

```typescript
type X = string extends number ? 1 : 0;
```

a) `1`
b) `0`
c) `never`
d) `boolean`

**Answer: b) `0`**

---

**4. What is the type of `Keys`?**

```typescript
type Keys = keyof { a: 1; b: 2 };
```

a) `"a" | "b"`
b) `string`
c) `number`
d) `"a" & "b"`

**Answer: a) `"a" | "b"`**

---

**5. What is `T` after this mapped type?**

```typescript
type T = { readonly [K in "x" | "y"]: number };
```

a) `{ x: number; y: number }` with mutable properties
b) `{ readonly x: number; readonly y: number }`
c) `{ x?: number; y?: number }`
d) `Record<string, number>`

**Answer: b) `{ readonly x: number; readonly y: number }`**

---

**6. What is `U`?**

```typescript
type U = Uppercase<"ts">;
```

a) `"ts"`
b) `"TS"`
c) `string`
d) `never`

**Answer: b) `"TS"`**

---

**7. What is `P`?**

```typescript
type P = Parameters<(a: string, b: number) => void>;
```

a) `[string, number]`
b) `(string | number)[]`
c) `string`
d) `[a: string, b: number]` only as labels, tuple is wrong

**Answer: a) `[string, number]`**

---

**8. Does `satisfies` widen this literal type?**

```typescript
const cfg = { mode: "prod" } satisfies { mode: "prod" | "dev" };
type M = typeof cfg["mode"];
```

a) Yes, `M` becomes `string`
b) No, `M` stays `"prod"`
c) `M` is `unknown`
d) This is a compile error

**Answer: b) No, `M` stays `"prod"`**

---

**9. What is `V`?**

```typescript
const v = [1, 2] as const;
type V = typeof v;
```

a) `number[]`
b) `readonly [1, 2]`
c) `[number, number]`
d) `readonly number[]`

**Answer: b) `readonly [1, 2]`**

---

**10. After exhaustive `switch` on discriminant `kind`, what should the default branch use for typing?**

```typescript
type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };
function area(x: Shape): number {
  switch (x.kind) {
    case "circle": return Math.PI * x.r * x.r;
    case "square": return x.s * x.s;
    default: {
      const _exhaustive: never = x;
      return _exhaustive;
    }
  }
}
```

a) `any` to silence errors
b) `unknown` for the leftover variable
c) `never` to prove all variants handled
d) `void` because default never runs

**Answer: c) `never` to prove all variants handled**

---

**11. What is `E`?**

```typescript
type E = Extract<"a" | "b" | 1, string>;
```

a) `"a" | "b"`
b) `"a" | "b" | 1`
c) `never`
d) `string`

**Answer: a) `"a" | "b"`**

---

**12. What is `N`?**

```typescript
type N = NonNullable<string | null | undefined>;
```

a) `string | null`
b) `string`
c) `null | undefined`
d) `unknown`

**Answer: b) `string`**

---

**13. Will this overload resolution compile?**

```typescript
function id(x: string): string;
function id(x: number): number;
function id(x: string | number) {
  return x;
}
const r = id("hi");
```

a) No, overloads cannot share one implementation
b) Yes, `r` is `string`
c) Yes, `r` is `string | number`
d) No, `const` inference breaks overloads

**Answer: b) Yes, `r` is `string`**

---

**14. What is `T["b"]`?**

```typescript
type T = { a: string; b: { c: number } };
type X = T["b"];
```

a) `number`
b) `{ c: number }`
c) `string`
d) `unknown`

**Answer: b) `{ c: number }`**

---

**15. What is `K`?**

```typescript
const user = { name: "Ada", age: 36 };
type K = keyof typeof user;
```

a) `string`
b) `"name" | "age"`
c) `number`
d) `keyof object`

**Answer: b) `"name" | "age"`**

---

**16. After merging, what is `U`?**

```typescript
interface U { a: string }
interface U { b: number }
type Keys = keyof U;
```

a) `"a"`
b) `"b"`
c) `"a" | "b"`
d) `never` because duplicate interface name errors

**Answer: c) `"a" | "b"`**

---

**17. What is `Awaited` of a `Promise`?**

```typescript
type X = Awaited<Promise<number>>;
```

a) `Promise<number>`
b) `number`
c) `unknown`
d) `void`

**Answer: b) `number`**

---

**18. What does `infer R` extract here?**

```typescript
type FnRet<T> = T extends (...args: any) => infer R ? R : never;
type Z = FnRet<(n: number) => boolean>;
```

a) `number`
b) `boolean`
c) `any`
d) `void`

**Answer: b) `boolean`**

---

**19. What is `C`?**

```typescript
class Box {
  constructor(public value: number) {}
}
type C = ConstructorParameters<typeof Box>;
```

a) `[number]`
b) `[]`
c) `[value: number]`
d) `any`

**Answer: a) `[number]`**

---

**20. What is `I`?**

```typescript
class Box {
  constructor(public value: number) {}
}
type I = InstanceType<typeof Box>;
```

a) `typeof Box`
b) `Box`
c) `{ value: number }`
d) `never`

**Answer: b) `Box`**

---

**21. What is `X`?**

```typescript
type X = Exclude<"a" | "b" | "c", "a">;
```

a) `"a"`
b) `"b" | "c"`
c) `never`
d) `string`

**Answer: b) `"b" | "c"`**

---

**22. With `strictFunctionTypes`, is this assignment safe?**

```typescript
type Animal = { name: string };
type Dog = { name: string; bark(): void };
let f: (d: Dog) => void = (a: Animal) => {};
```

a) Yes, dogs are animals
b) No, parameter positions are checked contravariantly for function types
c) Yes, structural typing allows it always
d) Only with `any`

**Answer: b) No, parameter positions are checked contravariantly for function types**

---

**23. With `strictBindCallApply`, will this error?**

```typescript
function add(a: number, b: number) { return a + b; }
add.call(null, "1", 2);
```

a) No, `call` accepts any arguments
b) Yes, arguments must match parameter types
c) Only if `noImplicitAny` is on
d) No, strings coerce to numbers

**Answer: b) Yes, arguments must match parameter types**

---

**24. What does `-readonly` do in a mapped type?**

```typescript
type RO = { readonly x: number };
type RW = { -readonly [K in keyof RO]: RO[K] };
```

a) Makes properties optional
b) Removes `readonly` from properties
c) Adds `readonly` to properties
d) Converts keys to `string`

**Answer: b) Removes `readonly` from properties**

---

**25. What is `Cap`?**

```typescript
type Cap = Capitalize<"hello">;
```

a) `"HELLO"`
b) `"Hello"`
c) `"hello"`
d) `string`

**Answer: b) `"Hello"`**

---

**26. Will this compile with `strictPropertyInitialization`?**

```typescript
class C {
  n: number;
  constructor() {}
}
```

a) Yes, numbers default to 0
b) No, `n` is not definitely assigned
c) Yes, if `strictNullChecks` is off
d) Only with `declare`

**Answer: b) No, `n` is not definitely assigned**

---

**27. What is the safer replacement for `any` when the type is unknown?**

a) `object`
b) `unknown`
c) `{}`
d) `never`

**Answer: b) `unknown`**

---

**28. After narrowing, what is `x` in the branch?**

```typescript
function f(x: string | number) {
  if (typeof x === "string") {
    return x;
  }
}
```

a) Still `string | number`
b) `number`
c) `string`
d) `never`

**Answer: c) `string`**

---

**29. With `noUncheckedIndexedAccess`, what is `t`?**

```typescript
type Row = { id: string };
const row: Row = { id: "1" };
const t = row["id"];
```

a) `string`
b) `string | undefined`
c) `unknown`
d) `any`

**Answer: b) `string | undefined`**

---

**30. What is `L`?**

```typescript
type L = Lowercase<"TS">;
```

a) `"TS"`
b) `"ts"`
c) `string`
d) `never`

**Answer: b) `"ts"`**

---

**31. What is `U`?**

```typescript
type U = Uncapitalize<"Hello">;
```

a) `"hello"`
b) `"Hello"`
c) `"HELLO"`
d) `string`

**Answer: a) `"hello"`**

---

**32. Generic default: what is `Box` without type args?**

```typescript
type Box<T = string> = { value: T };
type B = Box;
```

a) `{ value: unknown }`
b) `{ value: string }`
c) `{ value: any }`
d) Error: type arguments required

**Answer: b) `{ value: string }`**

---

**33. Constraint with `keyof`: will this compile?**

```typescript
function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const n = pick({ a: 1, b: "x" }, "a");
```

a) No, `T[K]` cannot be returned
b) Yes, `n` is `number`
c) Yes, `n` is `string`
d) No, `keyof` cannot be used in constraints

**Answer: b) Yes, `n` is `number`**

---

**34. What is `O`?**

```typescript
type O = { [K in "a" | "b"]?: number };
```

a) `{ a: number; b: number }`
b) `{ a?: number; b?: number }`
c) `{ readonly a?: number; readonly b?: number }`
d) `Record<string, number | undefined>`

**Answer: b) `{ a?: number; b?: number }`**

---

**35. Ambient declaration: what does `declare function` mean?**

```typescript
declare function fetchUser(id: string): Promise<{ name: string }>;
```

a) Emits JavaScript for `fetchUser` at compile time
b) Describes a shape that exists at runtime without emitting implementation
c) Creates a global class
d) Replaces `export`

**Answer: b) Describes a shape that exists at runtime without emitting implementation**

---

**36. `.d.ts` files are primarily used to:**

a) Run unit tests faster
b) Provide type information for JavaScript or external modules
c) Enable decorators only
d) Replace `tsconfig.json`

**Answer: b) Provide type information for JavaScript or external modules**

---

**37. Module augmentation typically uses which pattern?**

```typescript
declare module "some-lib" {
  interface Options { extra?: boolean }
}
```

a) `namespace` merging only
b) Opening an existing module and merging declarations
c) Replacing the entire module type
d) Runtime patching

**Answer: b) Opening an existing module and merging declarations**

---

**38. Assertion function return type: what does `asserts v is string` express?**

```typescript
function assertString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new Error();
}
```

a) The function always returns a string value
b) After a successful call, `v` is narrowed to `string` in control flow
c) `v` must be `string` before the call
d) It is equivalent to `: string`

**Answer: b) After a successful call, `v` is narrowed to `string` in control flow**

---

**39. What is `M`?**

```typescript
type M = { +readonly [K in "x"]: number };
```

a) `{ x: number }` mutable
b) `{ readonly x: number }`
c) `{ x?: number }`
d) Error: `+readonly` invalid

**Answer: b) `{ readonly x: number }`**

---

**40. Will this `satisfies` expression error?**

```typescript
const x = { n: 1, extra: true } satisfies { n: number };
```

a) Yes, `extra` is not a known property of `{ n: number }`
b) No, `satisfies` ignores unknown keys on object literals
c) Only if `noImplicitAny` is enabled
d) No, excess property checks do not apply to `satisfies`

**Answer: a) Yes, `extra` is not a known property of `{ n: number }`**

---

**41. `typeof` on a value in type position gives:**

```typescript
const flag = true;
type F = typeof flag;
```

a) `"boolean"`
b) `true`
c) `Boolean`
d) `0 | 1`

**Answer: b) `true`**

---

**42. Multiple type parameters: what is `R`?**

```typescript
type Pair<A, B> = { first: A; second: B };
type R = Pair<number, string>["second"];
```

a) `number`
b) `string`
c) `Pair<number, string>`
d) `unknown`

**Answer: b) `string`**

---

**43. What is `Z` when a distributive conditional is instantiated with `never`?**

```typescript
type IsStr<T> = T extends string ? true : false;
type Z = IsStr<never>;
```

a) `true`
b) `false`
c) `never`
d) `boolean`

**Answer: c) `never`**

---

**44. What is `Z`? (Non-distributive conditional — `T` wrapped in a tuple)**

```typescript
type Bar<T> = [T] extends [string] ? 1 : 0;
type Z = Bar<string | number>;
```

a) `1`
b) `0`
c) `never`
d) `1 | 0`

**Answer: b) `0`**

---

**45. Namespace merging: can `namespace N` merge with `function N()`?**

```typescript
function N() {}
namespace N {
  export const x = 1;
}
```

a) No, duplicate identifiers are always errors
b) Yes, declaration merging allows it
c) Only with `export as namespace`
d) Only inside `.d.ts` files

**Answer: b) Yes, declaration merging allows it**

---

**46. Will this compile?**

```typescript
type S = `${"foo" | "bar"}_${1 | 2}`;
```

a) No, template literals cannot union string and number
b) Yes, `S` is `"foo_1" | "foo_2" | "bar_1" | "bar_2"`
c) Yes, `S` is `string`
d) No, numeric unions are not allowed in templates

**Answer: b) Yes, `S` is `"foo_1" | "foo_2" | "bar_1" | "bar_2"`**

---

**47. What is `Z`?**

```typescript
type Id<T> = { [K in keyof T]: T[K] };
type Z = Id<{ a: string; readonly b: number }>["b"];
```

a) `string`
b) `number`
c) `readonly number`
d) `unknown`

**Answer: b) `number`**

---

**48. With `any`, is this assignment allowed?**

```typescript
let x: any = 1;
let y: string = x;
```

a) No, `any` is not assignable to `string`
b) Yes, `any` disables checking on both directions in practice
c) Only with `as string`
d) No, unless `strictNullChecks` is off

**Answer: b) Yes, `any` disables checking on both directions in practice**

---

**49. What is `Z`?**

```typescript
type Z = (() => number) extends (...args: infer A) => infer R ? [A, R] : never;
```

a) `[never, number]`
b) `[[], number]`
c) `[any, any]`
d) `never`

**Answer: b) `[[], number]`**

---

**50. `infer` in `Parameters` style — what is `Z`?**

```typescript
type FirstArg<T> = T extends (a: infer A, ...rest: any) => any ? A : never;
type Z = FirstArg<(x: boolean, y: string) => void>;
```

a) `string`
b) `boolean`
c) `boolean | string`
d) `unknown`

**Answer: b) `boolean`**
