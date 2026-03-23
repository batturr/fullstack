# TypeScript 5.9 MCQ - Set 2 (Beginner Level)

**1. In a TypeScript class, what does the `public` access modifier mean for a member?**

a) The member is visible only in subclasses
b) The member is accessible from anywhere the instance is accessible
c) The member is stripped from emitted JavaScript
d) The member can only be read, not written

**Answer: b) The member is accessible from anywhere the instance is accessible**

---

**2. What is true about `private` class members in TypeScript?**

a) They are enforced only at compile time and compile away to public in the emit
b) They are enforced at runtime by the JavaScript engine
c) They are visible to any function in the same file automatically
d) They must be declared `static`

**Answer: a) They are enforced only at compile time and compile away to public in the emit**

---

**3. Which access modifier allows access in the class and its subclasses, but not from outside?**

a) `public`
b) `private`
c) `protected`
d) `internal`

**Answer: c) `protected`**

---

**4. What does `super()` do inside a derived class constructor?**

a) Imports the superclass from a module
b) Calls the base class constructor
c) Copies all static fields to the subclass
d) Marks the class as abstract

**Answer: b) Calls the base class constructor**

---

**5. Given this code, what is printed?**

```typescript
class Base {
  greet() {
    return "base";
  }
}
class Derived extends Base {
  greet() {
    return super.greet() + "-derived";
  }
}
console.log(new Derived().greet());
```

a) `base`
b) `derived`
c) `base-derived`
d) It throws at runtime

**Answer: c) `base-derived`**

---

**6. What does `implements` do for a class?**

a) Copies interface methods into the class prototype at runtime
b) Checks at compile time that the class structurally matches the interface
c) Creates a private module scope for the class
d) Makes all interface properties `readonly`

**Answer: b) Checks at compile time that the class structurally matches the interface**

---

**7. Which class declaration correctly implements this interface?**

```typescript
interface Runnable {
  run(): void;
}
```

a) `class Bot implements Runnable { run() {} }`
b) `class Bot extends Runnable { run() {} }`
c) `class Bot implements Runnable { run: string; }`
d) `class Bot implements Runnable { }`

**Answer: a) `class Bot implements Runnable { run() {} }`**

---

**8. What is true about an `abstract` class?**

a) It can be instantiated directly like `new Abstract()`
b) It can contain abstract methods without bodies and cannot be instantiated directly
c) It must not have constructors
d) It cannot have `public` fields

**Answer: b) It can contain abstract methods without bodies and cannot be instantiated directly**

---

**9. What must a concrete subclass do about an inherited abstract method?**

a) Ignore it; abstract methods are optional
b) Implement it with a method body
c) Re-declare it as `abstract` again
d) Mark it `private`

**Answer: b) Implement it with a method body**

---

**10. What is the return type of this generic function when called as `identity(123)`?**

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

a) `unknown`
b) `number`
c) `T extends number ? T : never`
d) `any`

**Answer: b) `number`**

---

**11. Which snippet declares a generic interface for a key-value box?**

a) `interface Box<T> { value: T }`
b) `interface Box T { value: T }`
c) `generic interface Box(T) { value: T }`
d) `interface Box<> { value: unknown }`

**Answer: a) `interface Box<T> { value: T }`**

---

**12. What does this class’s `item` type become when instantiated as `new Basket<string>()`?**

```typescript
class Basket<T> {
  item!: T;
}
```

a) `unknown`
b) `string`
c) `T | undefined`
d) `any`

**Answer: b) `string`**

---

**13. What does `T extends HasLength` mean in `<T extends HasLength>`?**

a) `T` must be exactly the type `HasLength`, not a subtype
b) `T` is constrained to types assignable to `HasLength`
c) `T` inherits runtime prototype from `HasLength`
d) `T` must be a string literal

**Answer: b) `T` is constrained to types assignable to `HasLength`**

---

**14. Why might this function fail to compile without a constraint?**

```typescript
function printLen<T>(x: T) {
  console.log(x.length);
}
```

a) `length` is a reserved keyword
b) Not every `T` is guaranteed to have `length`
c) Generics cannot be used with `console.log`
d) `T` defaults to `void`

**Answer: b) Not every `T` is guaranteed to have `length`**

---

**15. What is `keyof User` for `interface User { id: number; name: string }`?**

a) `"User"`
b) `string`
c) `"id" | "name"`
d) `number | string`

**Answer: c) `"id" | "name"`**

---

**16. What is `P`?**

```typescript
const point = { x: 1, y: 2 };
type P = typeof point;
```

a) `{ x: 1; y: 2 }`
b) `{ x: number; y: number }`
c) `object`
d) `[number, number]`

**Answer: b) `{ x: number; y: number }`**

---

**17. Which interface allows any string key mapping to a number value?**

a) `interface Dict { key: string; value: number }`
b) `interface Dict { [key: string]: number }`
c) `interface Dict { [string]: number }`
d) `interface Dict extends Record<number> {}`

**Answer: b) `interface Dict { [key: string]: number }`**

---

**18. What do function overload signatures express?**

a) Multiple runtime implementations selected by `switch`
b) Multiple call shapes for one implementation, checked at compile time
c) A way to mark functions as `async`
d) Automatic generic inference from return statements only

**Answer: b) Multiple call shapes for one implementation, checked at compile time**

---

**19. What is the type of `rest` inside the function?**

```typescript
function sum(...rest: number[]) {
  return rest.reduce((a, b) => a + b, 0);
}
```

a) `number`
b) `number[]`
c) `[number, ...number[]]`
d) `unknown[]`

**Answer: b) `number[]`**

---

**20. If `a` is `number[]` and `b` is `number[]`, what is a sound inferred type for `[...a, ...b]`?**

a) `[number, number]`
b) `number[]`
c) `never[]`
d) `unknown`

**Answer: b) `number[]`**

---

**21. What does `A & B` mean for object types?**

a) A value must satisfy both types simultaneously (intersection)
b) A value may satisfy either type (union)
c) It removes overlapping properties
d) It converts both types to `any`

**Answer: a) A value must satisfy both types simultaneously (intersection)**

---

**22. Which property makes this union easy to narrow with `switch`?**

```typescript
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; s: number };
```

a) `r`
b) `s`
c) `kind`
d) `shape`

**Answer: c) `kind`**

---

**23. After this narrowing, what is `x`?**

```typescript
let x: string | number = "hi";
if (typeof x === "string") {
  // inside here
}
```

a) Still `string | number`
b) `string`
c) `number`
d) `never`

**Answer: b) `string`**

---

**24. What does `value instanceof Date` commonly enable?**

a) Narrowing `value` to `Date` in the true branch
b) Converting strings to ISO dates automatically
c) Declaring a generic constraint on `Date`
d) Making `value` readonly

**Answer: a) Narrowing `value` to `Date` in the true branch**

---

**25. In this code, what happens inside the `if` block to `obj`?**

```typescript
type A = { a: number; b?: string };
type B = { b: string; c: boolean };
declare const obj: A | B;
if ("c" in obj) {
  // here
}
```

a) `obj` is narrowed toward the branch that must have `c`
b) `obj` becomes `never`
c) `obj` becomes `A`
d) No narrowing occurs

**Answer: a) `obj` is narrowed toward the branch that must have `c`**

---

**26. What does truthiness narrowing achieve for `string | null | undefined`?**

a) Inside `if (s)`, `s` is narrowed away from falsy nullish/`""` possibilities where applicable
b) It converts `undefined` to `0`
c) It widens `s` to `any`
d) It enforces `s` is a `number`

**Answer: a) Inside `if (s)`, `s` is narrowed away from falsy nullish/`""` possibilities where applicable**

---

**27. What does `x is string` signify in a return type position?**

```typescript
function isString(x: unknown): x is string {
  return typeof x === "string";
}
```

a) The function always returns a string value
b) The function is a user-defined type guard for callers
c) It declares a generic type parameter `x`
d) It marks `x` as definitely not null

**Answer: b) The function is a user-defined type guard for callers**

---

**28. What does `a ?? b` evaluate to when `a` is `0`?**

a) `b`, because `0` is nullish
b) `0`, because `0` is not `null` or `undefined`
c) It is a compile error in TypeScript
d) `undefined`

**Answer: b) `0`, because `0` is not `null` or `undefined`**

---

**29. What is the type of `len`?**

```typescript
declare const s: string | null;
const len = s?.length;
```

a) `number`
b) `number | undefined`
c) `number | null`
d) `string`

**Answer: b) `number | undefined`**

---

**30. What does the postfix `!` after an expression assert to TypeScript?**

a) That the value is `null`
b) That the value is non-null and non-undefined from the compiler’s perspective
c) That the value is a `boolean`
d) That the expression should throw

**Answer: b) That the value is non-null and non-undefined from the compiler’s perspective**

---

**31. What is a key benefit of `satisfies` compared to a widening annotation?**

```typescript
const theme = {
  fg: "#111",
  bg: "#fff",
} satisfies Record<string, `#${string}`>;
```

a) It erases literal types completely
b) It checks the value matches the type while preserving inferred literal types where applicable
c) It disables excess property checks
d) It requires `as const`

**Answer: b) It checks the value matches the type while preserving inferred literal types where applicable**

---

**32. When should you typically use `import type`?**

a) To import values that exist only at runtime
b) To import only types under settings like `verbatimModuleSyntax`, avoiding runtime import emit
c) To polyfill missing modules
d) To import JSON assets

**Answer: b) To import only types under settings like `verbatimModuleSyntax`, avoiding runtime import emit**

---

**33. Which re-export forms are valid for a type-only export from `./user.js` in TypeScript 5.9?**

a) Only `export type { User } from "./user.js";`
b) Only `export { type User } from "./user.js";`
c) Both `export type { User } from "./user.js";` and `export { type User } from "./user.js";`
d) Neither; types must use `require()`

**Answer: c) Both `export type { User } from "./user.js";` and `export { type User } from "./user.js";`**

---

**34. What does `as const` on an object literal do to its property types?**

a) Widens all properties to `string | number | boolean`
b) Makes properties deeply readonly and preserves literal types where inferred
c) Removes readonly modifiers
d) Converts the object into a `Map`

**Answer: b) Makes properties deeply readonly and preserves literal types where inferred**

---

**35. What strings are assignable to this template literal type?**

```typescript
type Greet = `hello ${string}`;
```

a) Only the exact string `hello string`
b) Any string that starts with `hello ` followed by any string
c) Only `"hello world"` and `"hello TS"`
d) Only lowercase ASCII strings

**Answer: b) Any string that starts with `hello ` followed by any string**

---

**36. What does `Partial<T>` do?**

a) Makes every property of `T` required
b) Makes every property of `T` optional
c) Removes all properties from `T`
d) Converts `T` into a tuple

**Answer: b) Makes every property of `T` optional**

---

**37. What does `Required<T>` do?**

a) Removes optionality from properties of `T`
b) Makes all properties optional
c) Deletes readonly modifiers
d) Maps all values to `unknown`

**Answer: a) Removes optionality from properties of `T`**

---

**38. What is `Readonly<T>`?**

a) A mapped type that makes properties of `T` readonly
b) A runtime deep-freeze utility
c) A type that removes methods from `T`
d) An alias for `const enum`

**Answer: a) A mapped type that makes properties of `T` readonly**

---

**39. What does `Pick<T, K>` produce?**

a) `T` minus keys `K`
b) A type with only the keys `K` from `T`
c) A union of `T` and `K`
d) A string template of all keys

**Answer: b) A type with only the keys `K` from `T`**

---

**40. What does `Omit<T, K>` produce?**

a) Only keys `K` from `T`
b) `T` without the keys `K`
c) `T & K`
d) `T[keyof T]`

**Answer: b) `T` without the keys `K`**

---

**41. What is `Record<K, V>`?**

a) An object type with keys `K` mapping to values `V`
b) A readonly array of `V`
c) A function from `K` to `V`
d) A mapped conditional removing `V`

**Answer: a) An object type with keys `K` mapping to values `V`**

---

**42. What is the type of `Name`?**

```typescript
type User = { id: number; name: string };
type Name = User["name"];
```

a) `User`
b) `string`
c) `number`
d) `"name"`

**Answer: b) `string`**

---

**43. Which generic constraint pairs `keyof` with an object type?**

```typescript
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

a) `K extends string`
b) `K extends keyof T`
c) `T extends K`
d) `keyof K extends T`

**Answer: b) `K extends keyof T`**

---

**44. If `u` is `{ a: number }` and `v` is `{ b: string }`, what is `{ ...u, ...v }` typed as?**

a) `never`
b) `{ a: number; b: string }`
c) `{ a: number } | { b: string }`
d) `[number, string]`

**Answer: b) `{ a: number; b: string }`**

---

**45. Inside the `if` block, what is the narrowed type of `mode`?**

```typescript
type Mode = "on" | "off";
declare const mode: Mode;
if (mode === "off") {
  mode;
}
```

a) `"on"`
b) `"off"`
c) `"on" | "off"`
d) `never`

**Answer: b) `"off"`**

---

**46. Why are discriminated unions helpful for exhaustiveness checking?**

a) They guarantee no union members exist
b) A `switch` on the discriminant can narrow to each member, enabling `never` checks for missing cases
c) They remove the need for `return` types
d) They convert unions into intersections

**Answer: b) A `switch` on the discriminant can narrow to each member, enabling `never` checks for missing cases**

---

**47. What does optional chaining short-circuit on?**

a) Only `null`
b) Only `undefined`
c) `null` and `undefined`
d) Any falsy value including `0` and `""`

**Answer: c) `null` and `undefined`**

---

**48. Which expression is most type-safe when you must narrow an `unknown` value?**

a) `value as any`
b) `typeof` / `instanceof` checks, custom type guards, or validation libraries
c) `value!`
d) `value ?? value`

**Answer: b) `typeof` / `instanceof` checks, custom type guards, or validation libraries**

---

**49. What is the inferred type of `tuple`?**

```typescript
const tuple = [1, "a"] as const;
```

a) `(string | number)[]`
b) `readonly [1, "a"]`
c) `[number, string]` (mutable)
d) `never`

**Answer: b) `readonly [1, "a"]`**

---

**50. Which value matches this union of template literals?**

```typescript
type Id = `id-${number}`;
```

a) `"id-abc"`
b) `"id-42"`
c) `"42-id"`
d) `"id-"`

**Answer: b) `"id-42"`**

---

</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read