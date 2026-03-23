# 200 TypeScript 5.9 Real-Time Assignments with Answers

> TypeScript **5.9** (December 2025): `import defer`, `--module node20` / `"module": "node20"`, stricter `tsc --init` defaults, `satisfies`, `const` type parameters, decorators, `using` / `await using`, `NoInfer`, variance annotations (`in` / `out`), and related tooling.

---

## BEGINNER LEVEL (Assignments 1–70)

### Basic Types (1–10)

**Assignment 1:** Declare three variables with explicit annotations: `string`, `number`, and `boolean`.

```typescript
const title: string = "TS 5.9";
const version: number = 5.9;
const stable: boolean = true;

export {};
```

---

**Assignment 2:** Show a variable where TypeScript infers the type from the initializer (no explicit annotation).

```typescript
const inferred = "hello"; // string
const n = 42; // number

export {};
```

---

**Assignment 3:** Declare a typed array of numbers and push a value. Show that wrong element types are rejected at compile time.

```typescript
const scores: number[] = [10, 20];
scores.push(30);
// scores.push("x"); // Error

export {};
```

---

**Assignment 4:** Create a tuple type `[string, number]` for a person’s name and age, assign a value, and access both positions.

```typescript
type PersonTuple = [string, number];
const p: PersonTuple = ["Ada", 36];
const fullName = p[0];
const age = p[1];

export {};
```

---

**Assignment 5:** Define a numeric enum (e.g. `TaskStatus`) with `Pending`, `Done` and use it in a variable.

```typescript
enum TaskStatus {
  Pending,
  Done,
}
const s: TaskStatus = TaskStatus.Pending;

export {};
```

---

**Assignment 6:** Define a string enum `UserRole` with `Admin` and `User`; assign and compare.

```typescript
enum UserRole {
  Admin = "ADMIN",
  User = "USER",
}
const r: UserRole = UserRole.Admin;
const isAdmin = r === UserRole.Admin;

export {};
```

---

**Assignment 7:** Use a `const` enum or `as const` object to model fixed string literals for HTTP methods.

```typescript
const HttpMethod = {
  GET: "GET",
  POST: "POST",
} as const;
type HttpMethodName = (typeof HttpMethod)[keyof typeof HttpMethod];
const m: HttpMethodName = HttpMethod.GET;

export {};
```

---

**Assignment 8:** Create a union type `string | number` and narrow with `typeof`.

```typescript
function formatId(id: string | number): string {
  return typeof id === "number" ? id.toFixed(0) : id;
}

export {};
```

---

**Assignment 9:** Use literal types `"on" | "off"` for a toggle state.

```typescript
type Toggle = "on" | "off";
let light: Toggle = "off";
light = "on";

export {};
```

---

**Assignment 10:** Contrast `any` vs `unknown`: show safe narrowing from `unknown` before use.

```typescript
function useAny(x: any) {
  return x.foo;
}
function useUnknown(x: unknown) {
  if (typeof x === "object" && x !== null && "foo" in x) {
    return (x as { foo: string }).foo;
  }
  return undefined;
}

export {};
```

---

### Interfaces & Type Aliases (11–20)

**Assignment 11:** Declare an interface `User` with `id: number` and `email: string`.

```typescript
interface User {
  id: number;
  email: string;
}

export {};
```

---

**Assignment 12:** Extend `User` with optional `nickname?: string` and `readonly createdAt: string`.

```typescript
interface User {
  id: number;
  email: string;
  nickname?: string;
  readonly createdAt: string;
}

export {};
```

---

**Assignment 13:** Create interface `Named` and `Timed`; use intersection `Named & Timed` for a type alias.

```typescript
interface Named {
  name: string;
}
interface Timed {
  at: number;
}
type Event = Named & Timed;
const e: Event = { name: "tick", at: Date.now() };

export {};
```

---

**Assignment 14:** Extend one interface from another (`extends`).

```typescript
interface Entity {
  id: string;
}
interface Product extends Entity {
  price: number;
}

export {};
```

---

**Assignment 15:** Declare a type alias `ID` as `string` and use it in another alias.

```typescript
type ID = string;
type UserRef = { userId: ID };

export {};
```

---

**Assignment 16:** Explain by example: interface merging vs type alias (use two `interface TsPlugin` declarations that merge).

```typescript
interface TsPlugin {
  name: string;
}
interface TsPlugin {
  version: string;
}
const p: TsPlugin = { name: "cache", version: "1" };

export {};
```

---

**Assignment 17:** Add an index signature `[key: string]: number` to a type for a string-to-number map.

```typescript
type Scores = { [key: string]: number };
const s: Scores = { a: 1, b: 2 };

export {};
```

---

**Assignment 18:** Put a call signature inside an interface `Logger` with `(msg: string) => void`.

```typescript
interface Logger {
  (msg: string): void;
}
const log: Logger = (m) => {
  console.log(m);
};

export {};
```

---

**Assignment 19:** Use a type alias for a function type `(x: number, y: number) => number`.

```typescript
type Binary = (x: number, y: number) => number;
const add: Binary = (a, b) => a + b;

export {};
```

---

**Assignment 20:** Model a dictionary with specific keys using `Record` vs index signature (use `Record` here).

```typescript
type Role = "admin" | "guest";
const perms: Record<Role, string[]> = {
  admin: ["*"],
  guest: ["read"],
};

export {};
```

---

### Functions (21–32)

**Assignment 21:** Write a function `greet` with typed parameters `name: string` and return type `string`.

```typescript
function greet(name: string): string {
  return `Hello, ${name}`;
}

export {};
```

---

**Assignment 22:** Add optional parameter `title?: string` and default `punctuation = "!"`.

```typescript
function greetFull(name: string, title?: string, punctuation: string = "!"): string {
  return title ? `${title} ${name}${punctuation}` : `${name}${punctuation}`;
}

export {};
```

---

**Assignment 23:** Use rest parameters `...nums: number[]` to sum numbers.

```typescript
function sum(...nums: number[]): number {
  return nums.reduce((a, n) => a + n, 0);
}

export {};
```

---

**Assignment 24:** Declare overloads for `format(value: string): string` and `format(value: number): string`; single implementation.

```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return String(value);
}

export {};
```

---

**Assignment 25:** Typed arrow function returning boolean.

```typescript
const isPositive = (n: number): boolean => n > 0;

export {};
```

---

**Assignment 26:** Function returning `void` vs function that never returns (`never`) — show both.

```typescript
function logVoid(msg: string): void {
  console.log(msg);
}
function fail(msg: string): never {
  throw new Error(msg);
}

export {};
```

---

**Assignment 27:** Type a higher-order function that accepts `cb: (err: Error | null, data?: string) => void`.

```typescript
type Callback = (err: Error | null, data?: string) => void;
function run(cb: Callback): void {
  cb(null, "ok");
}

export {};
```

---

**Assignment 28:** Write a generic function `identity<T>(x: T): T`.

```typescript
function identity<T>(x: T): T {
  return x;
}

export {};
```

---

**Assignment 29:** Write a user-defined type predicate `isString(x: unknown): x is string`.

```typescript
function isString(x: unknown): x is string {
  return typeof x === "string";
}

export {};
```

---

**Assignment 30:** Constrain a generic: `function longest<T extends { length: number }>(a: T, b: T): T`.

```typescript
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

export {};
```

---

**Assignment 31:** Use `keyof` in a generic function `get(obj, key)`.

```typescript
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export {};
```

---

**Assignment 32:** Demonstrate `typeof` in type position to derive a type from a value.

```typescript
const defaults = { host: "localhost", port: 3000 };
type Defaults = typeof defaults;

export {};
```

---

### Objects & Classes (33–46)

**Assignment 33:** Declare a class `Point` with `x` and `y` as numbers.

```typescript
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export {};
```

---

**Assignment 34:** Use `public`, `private`, and `protected` fields with a subclass.

```typescript
class Base {
  public a = 1;
  protected b = 2;
  private c = 3;
}
class Sub extends Base {
  show() {
    return this.a + this.b;
  }
}

export {};
```

---

**Assignment 35:** Add `readonly id: string` set in constructor.

```typescript
class Account {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export {};
```

---

**Assignment 36:** Implement a getter and setter for a private backing field.

```typescript
class Temp {
  private _c = 0;
  get c(): number {
    return this._c;
  }
  set c(v: number) {
    this._c = v;
  }
}

export {};
```

---

**Assignment 37:** Use `implements` to satisfy an interface `Serializable`.

```typescript
interface Serializable {
  toJSON(): string;
}
class Box implements Serializable {
  constructor(public value: number) {}
  toJSON(): string {
    return JSON.stringify({ value: this.value });
  }
}

export {};
```

---

**Assignment 38:** Create an abstract class `Shape` with abstract `area(): number` and concrete subclass.

```typescript
abstract class Shape {
  abstract area(): number;
}
class Square extends Shape {
  constructor(public side: number) {
    super();
  }
  area(): number {
    return this.side * this.side;
  }
}

export {};
```

---

**Assignment 39:** Add static method `from` on a class.

```typescript
class User {
  static from(id: string): User {
    return new User(id);
  }
  constructor(public id: string) {}
}

export {};
```

---

**Assignment 40:** Use parameter properties: `constructor(public name: string, private age: number)`.

```typescript
class Person {
  constructor(public name: string, private age: number) {}
  birthday(): void {
    this.age += 1;
  }
}

export {};
```

---

**Assignment 41:** Override a method in a subclass with compatible return type.

```typescript
class Animal {
  move(): string {
    return "go";
  }
}
class Bird extends Animal {
  override move(): string {
    return "fly";
  }
}

export {};
```

---

**Assignment 42:** Use a private `#field` (ECMAScript private) vs `private` keyword — show `#field`.

```typescript
class Counter {
  #n = 0;
  inc() {
    this.#n += 1;
    return this.#n;
  }
}

export {};
```

---

**Assignment 43:** Implement `interface` for instance + separate constructor interface pattern (simplified).

```typescript
interface ClockConstructor {
  new (hour: number, minute: number): ClockInstance;
}
interface ClockInstance {
  tick(): string;
}
class Clock implements ClockInstance {
  constructor(private h: number, private m: number) {}
  tick(): string {
    return `${this.h}:${this.m}`;
  }
}

export {};
```

---

**Assignment 44:** Class with generic type parameter `class Container<T>`.

```typescript
class Container<T> {
  constructor(private value: T) {}
  get(): T {
    return this.value;
  }
}

export {};
```

---

**Assignment 45:** Use `this` return type for fluent methods.

```typescript
class Fluent {
  private n = 0;
  add(x: number): this {
    this.n += x;
    return this;
  }
  value(): number {
    return this.n;
  }
}

export {};
```

---

**Assignment 46:** Implement two interfaces on one class (`class C implements A, B`).

```typescript
interface Flyer {
  fly(): string;
}
interface Swimmer {
  swim(): string;
}
class Duck implements Flyer, Swimmer {
  fly(): string {
    return "flap";
  }
  swim(): string {
    return "paddle";
  }
}

export {};
```

---

### Generics Basics (47–56)

**Assignment 47:** Generic function `pair<A, B>(a: A, b: B): [A, B]`.

```typescript
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

export {};
```

---

**Assignment 48:** Generic interface `ApiResponse<T> { data: T; error?: string }`.

```typescript
interface ApiResponse<T> {
  data: T;
  error?: string;
}

export {};
```

---

**Assignment 49:** Generic class `Stack<T>` with `push`/`pop`.

```typescript
class Stack<T> {
  private items: T[] = [];
  push(x: T): void {
    this.items.push(x);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
}

export {};
```

---

**Assignment 50:** Constrain with `extends` and default type parameter `create<T = string>()`.

```typescript
function create<T = string>(v: T): T {
  return v;
}
const s = create("hi");
const n = create<number>(1);

export {};
```

---

**Assignment 51:** Multiple type parameters `map2<A,B,C>(a: A, b: B, f: (x:A,y:B)=>C): C`.

```typescript
function map2<A, B, C>(a: A, b: B, f: (x: A, y: B) => C): C {
  return f(a, b);
}

export {};
```

---

**Assignment 52:** Use `keyof` with generics to pick a property type.

```typescript
type Prop<T, K extends keyof T> = T[K];
type U = { a: number; b: string };
type A = Prop<U, "a">;

export {};
```

---

**Assignment 53:** Combine `typeof` and indexed access for config keys.

```typescript
const config = { api: "x", timeout: 5000 } as const;
type ConfigKey = keyof typeof config;

export {};
```

---

**Assignment 54:** Generic `wrap` that preserves literal types (without widening).

```typescript
function wrap<const T>(x: T): { value: T } {
  return { value: x };
}
const w = wrap({ k: 1 } as const);

export {};
```

---

**Assignment 55:** Show `extends keyof any` constraint for keys.

```typescript
function keys<K extends keyof any>(o: Record<K, unknown>): K[] {
  return Object.keys(o) as K[];
}

export {};
```

---

**Assignment 56:** Recursive generic: tree node `Tree<T>`.

```typescript
type Tree<T> = { value: T; children?: Tree<T>[] };
const t: Tree<number> = { value: 1, children: [{ value: 2 }] };

export {};
```

---

### Utility Types (57–66)

**Assignment 57:** Use `Partial<User>` to build an update object.

```typescript
type User = { id: string; name: string; age: number };
type UserUpdate = Partial<User>;
const u: UserUpdate = { name: "Ada" };

export {};
```

---

**Assignment 58:** Use `Required` on a type with optional fields.

```typescript
type Opt = { a?: string; b?: number };
type AllReq = Required<Opt>;

export {};
```

---

**Assignment 59:** Use `Readonly` on an array property.

```typescript
type State = { tags: string[] };
type RO = Readonly<State>;

export {};
```

---

**Assignment 60:** Use `Pick<User, "id" | "email">`.

```typescript
type User = { id: string; email: string; age: number };
type PublicUser = Pick<User, "id" | "email">;

export {};
```

---

**Assignment 61:** Use `Omit<User, "password">`.

```typescript
type User = { id: string; password: string };
type Safe = Omit<User, "password">;

export {};
```

---

**Assignment 62:** Use `Record<PowerState, number>`.

```typescript
type PowerState = "on" | "off";
const counts: Record<PowerState, number> = { on: 1, off: 0 };

export {};
```

---

**Assignment 63:** Use `ReturnType<typeof fn>`.

```typescript
function makeId() {
  return crypto.randomUUID();
}
type Id = ReturnType<typeof makeId>;

export {};
```

---

**Assignment 64:** Use `Parameters<typeof fn>`.

```typescript
function join(a: string, b: number) {
  return a + b;
}
type Args = Parameters<typeof join>;

export {};
```

---

**Assignment 65:** Use `Exclude<"a"|"b"|"c", "a">`.

```typescript
type R = Exclude<"a" | "b" | "c", "a">;

export {};
```

---

**Assignment 66:** Use `Extract<"a"|"b", "a"|"c">`.

```typescript
type R = Extract<"a" | "b", "a" | "c">;

export {};
```

---

### Modules & Config (67–70)

**Assignment 67:** Show named `export` and `import` between two modules (single file example with comments).

```typescript
// math.ts
export const PI = 3.14;
export function add(a: number, b: number): number {
  return a + b;
}
// main.ts
// import { PI, add } from "./math";

export {};
```

---

**Assignment 68:** Use `import type` for type-only import (show the consumer line; types live in `./types` in a real project).

```typescript
// types.ts
//   export type User = { id: string };
// consumer.ts — type-only import (erased at emit with verbatimModuleSyntax):
//   import type { User } from "./types";
//   export type { User };
export type User = { id: string }; // single-file stand-in so this snippet typechecks

export {};
```

---

**Assignment 69:** Document what `tsc --init` sets in TS 5.9 (stricter defaults): mention `strict`, `noUncheckedSideEffectImports` in comments.

```typescript
// TS 5.9: tsc --init enables strict family by default in new projects.
// Typical defaults include: "strict": true, "target" ES20xx, module resolution bundler/node next.
// Also: "noUncheckedSideEffectImports": true — import side effects must be intentional.
export const _ = 0;

export {};
```

---

**Assignment 70:** List `compilerOptions` in a sample `tsconfig` comment: `strictNullChecks`, `noImplicitAny`, `skipLibCheck`.

```typescript
// tsconfig.json (excerpt)
// {
//   "compilerOptions": {
//     "strictNullChecks": true,
//     "noImplicitAny": true,
//     "skipLibCheck": true,
//     "module": "nodenext",
//     "moduleResolution": "nodenext"
//   }
// }
export {};
```

---

---

## INTERMEDIATE LEVEL (Assignments 71–140)

### Advanced Generics (71–82)

**Assignment 71:** Write a conditional type `IsString<T>` that resolves to `true` if `T` is `string`, else `false`.

```typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<string>;
type B = IsString<number>;

export {};
```

---

**Assignment 72:** Use `infer` to extract array element: `ElementOf<T>`.

```typescript
type ElementOf<T> = T extends (infer U)[] ? U : never;
type E = ElementOf<string[]>;

export {};
```

---

**Assignment 73:** Mapped type `ReadonlyAll<T>` making every property readonly.

```typescript
type ReadonlyAll<T> = { readonly [K in keyof T]: T[K] };

export {};
```

---

**Assignment 74:** Template literal type ``Hello ${Capitalize<Name>}``.

```typescript
type Name = "world";
type Greeting = `Hello ${Capitalize<Name>}`;

export {};
```

---

**Assignment 75:** Recursive type `Json` for JSON-like structures.

```typescript
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export {};
```

---

**Assignment 76:** Distributive conditional: `ToArray<T>` for unions.

```typescript
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<"a" | "b">;

export {};
```

---

**Assignment 77:** Constrain with `keyof` and map: `PickByType<T, U>`.

```typescript
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};
type O = { a: string; b: number; c: string };
type SOnly = PickByType<O, string>;

export {};
```

---

**Assignment 78:** Mapped modifiers: remove `readonly` (`-readonly`) and add optional (`?`).

```typescript
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Partialized<T> = { [K in keyof T]?: T[K] };

export {};
```

---

**Assignment 79:** Key remapping with `as` to rename keys to `camelCase` prefix `prefixed`.

```typescript
type Prefix<T extends string> = `prefixed${Capitalize<T>}`;
type Rename<T> = { [K in keyof T as Prefix<string & K>]: T[K] };
type X = Rename<{ foo: number }>;

export {};
```

---

**Assignment 80:** Extract function return with conditional + infer.

```typescript
type Return<T> = T extends (...args: any[]) => infer R ? R : never;

export {};
```

---

**Assignment 81:** Tuple prepend type.

```typescript
type Prepend<H, T extends any[]> = [H, ...T];
type T1 = Prepend<0, [1, 2]>;

export {};
```

---

**Assignment 82:** `Flatten` tuple one level.

```typescript
type Flatten<T extends any[]> = T extends [infer H, ...infer R]
  ? [...(H extends any[] ? H : [H]), ...(R extends any[] ? Flatten<R> : [])]
  : [];

export {};
```

---

### Advanced Types (83–96)

**Assignment 83:** Discriminated union `kind: "circle" | "square"` with `switch` narrowing.

```typescript
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; s: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.r * s.r;
    case "square":
      return s.s * s.s;
  }
}

export {};
```

---

**Assignment 84:** Exhaustive check with `never` helper `assertNever(x: never)`.

```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected ${x}`);
}
type T = "a" | "b";
function f(x: T): string {
  switch (x) {
    case "a":
      return "A";
    case "b":
      return "B";
    default:
      return assertNever(x);
  }
}

export {};
```

---

**Assignment 85:** Branded type for `UserId` to avoid string mixing.

```typescript
declare const brand: unique symbol;
type UserId = string & { readonly [brand]: typeof brand };
function toUserId(id: string): UserId {
  return id as UserId;
}

export {};
```

---

**Assignment 86:** Narrow with `typeof`, `instanceof`, `in`, and truthiness in one example.

```typescript
function narrow(x: string | Date | null) {
  if (!x) return "empty";
  if (typeof x === "string") return x.toUpperCase();
  if (x instanceof Date) return x.toISOString();
  return "unknown";
}

export {};
```

---

**Assignment 87:** Assertion function `asserts value is string`.

```typescript
function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new TypeError("string expected");
}

export {};
```

---

**Assignment 88:** Advanced guard: `isObjectWithKey` generic.

```typescript
function isObjectWithKey<K extends string>(
  v: unknown,
  k: K
): v is Record<K, unknown> {
  return typeof v === "object" && v !== null && k in v;
}

export {};
```

---

**Assignment 89:** Use `satisfies` to keep literal types while checking structure.

```typescript
const theme = {
  primary: "#111",
  secondary: "#222",
} satisfies Record<string, `#${string}`>;

export {};
```

---

**Assignment 90:** `as const` deep on config object.

```typescript
const routes = ["/", "/about"] as const;
type Route = (typeof routes)[number];

export {};
```

---

**Assignment 91:** Const type parameter `function foo<const T>(x: T)` preserving tuple literal.

```typescript
function tuple<const T extends readonly unknown[]>(x: T): T {
  return x;
}
const t = tuple([1, "a"] as const);

export {};
```

---

**Assignment 92:** Template literal filtering with `Exclude` on unions.

```typescript
type EventName = `on${Capitalize<"click" | "hover">}`;

export {};
```

---

**Assignment 93:** Opaque error type pattern.

```typescript
type Err = { readonly _tag: "Err"; message: string };
function err(m: string): Err {
  return { _tag: "Err", message: m };
}

export {};
```

---

**Assignment 94:** Combine `satisfies` with `as const` for API version tuple.

```typescript
const versions = ["v1", "v2"] as const;
const current = "v1" satisfies (typeof versions)[number];

export {};
```

---

**Assignment 95:** Indexed access on union of objects.

```typescript
type U = { t: "a"; x: number } | { t: "b"; y: string };
type TField = U["t"];

export {};
```

---

**Assignment 96:** Type-level optional chaining simulation with conditional types.

```typescript
type PropOr<T, K extends keyof T> = K extends keyof T ? T[K] : never;

export {};
```

---

### Decorators & Modern (97–108)

**Assignment 97:** Class decorator (legacy experimental) logging constructor.

```typescript
// tsconfig: "experimentalDecorators": true
function LogClass<T extends new (...args: any[]) => object>(ctor: T) {
  return class extends ctor {
    constructor(...args: any[]) {
      super(...args);
      console.log(ctor.name);
    }
  };
}
@LogClass
class Demo {}

export {};
```

---

**Assignment 98:** Method decorator wrapping original.

```typescript
function LogMethod(
  _target: object,
  key: string | symbol,
  desc: PropertyDescriptor
): void {
  const orig = desc.value as (...a: unknown[]) => unknown;
  desc.value = function (...args: unknown[]) {
    console.log(key, args);
    return orig.apply(this, args);
  };
}

export {};
```

---

**Assignment 99:** Field decorator (Stage 3 / TS 5.x) — show signature comment if runtime unavailable.

```typescript
// Stage 3 field decorator (enable in tsconfig per TS version):
// function LogField(value: undefined, context: ClassFieldDecoratorContext) { ... }
export const FIELD_DECORATOR_NOTE = "Use TS 5+ field decorators with correct lib/target";

export {};
```

---

**Assignment 100:** Accessor decorator example (legacy `PropertyDescriptor` on setter; avoid shadowing DOM `Range`).

```typescript
function BoundNumeric(min: number, max: number) {
  return function (_target: object, _key: string | symbol, desc: PropertyDescriptor): void {
    const origSet = desc.set;
    if (!origSet) return;
    desc.set = function (this: object, v: unknown) {
      const n = typeof v === "number" ? Math.min(max, Math.max(min, v)) : v;
      origSet.call(this, n);
    };
  };
}
class Cell {
  private _v = 0;
  get value(): number {
    return this._v;
  }
  @BoundNumeric(0, 100)
  set value(v: number) {
    this._v = v;
  }
}

export {};
```

---

**Assignment 101:** Decorator factory `Throttle(ms)`.

```typescript
function Throttle(ms: number) {
  return function (
    _target: object,
    _key: string | symbol,
    desc: PropertyDescriptor
  ): void {
    let last = 0;
    const orig = desc.value as (...a: unknown[]) => unknown;
    desc.value = function (...args: unknown[]) {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        return orig.apply(this, args);
      }
    };
  };
}

export {};
```

---

**Assignment 102:** `using` for `Disposable` resource cleanup.

```typescript
class Handle implements Disposable {
  [Symbol.dispose](): void {
    console.log("disposed");
  }
}
{
  using h = new Handle();
  // use h
}

export {};
```

---

**Assignment 103:** `await using` with async disposable.

```typescript
class AsyncHandle {
  async [Symbol.asyncDispose](): Promise<void> {
    await Promise.resolve();
  }
}
async function run() {
  await using _h = new AsyncHandle();
}
void run();

export {};
```

---

**Assignment 104:** `DisposableStack` pushing multiple disposables.

```typescript
{
  using stack = new DisposableStack();
  stack.use({ [Symbol.dispose]: () => console.log("a") });
  stack.use({ [Symbol.dispose]: () => console.log("b") });
}

export {};
```

---

**Assignment 105:** Implement custom `Symbol.dispose` on a connection class.

```typescript
class Conn implements Disposable {
  close() {}
  [Symbol.dispose](): void {
    this.close();
  }
}

export {};
```

---

**Assignment 106:** Compare legacy vs modern decorator metadata note in comment.

```typescript
export const DECO_NOTE =
  "Legacy: experimentalDecorators + emitDecoratorMetadata. Modern: stage 3 decorators in TS 5+.";

export {};
```

---

**Assignment 107:** Parameter decorator pattern (log argument index) — legacy experimental signature.

```typescript
// experimentalDecorators: true
function LogParam(_target: object, propertyKey: string | symbol, parameterIndex: number): void {
  console.log(propertyKey, parameterIndex);
}
class Demo {
  run(@LogParam _x: number): void {}
}

export {};
```

---

**Assignment 108:** Class decorator returning new constructor narrowing instance type.

```typescript
function Timestamped<Ctor extends new (...args: any[]) => object>(ctor: Ctor) {
  abstract class Inner extends ctor {
    created = Date.now();
  }
  return Inner as unknown as new (...args: ConstructorParameters<Ctor>) => InstanceType<Ctor> & {
    created: number;
  };
}

export {};
```

---

### Advanced Patterns (109–120)

**Assignment 109:** Fluent builder with chained methods returning `this` typed.

```typescript
class QueryBuilder {
  private parts: string[] = [];
  select(cols: string): this {
    this.parts.push(`SELECT ${cols}`);
    return this;
  }
  from(table: string): this {
    this.parts.push(`FROM ${table}`);
    return this;
  }
  build(): string {
    return this.parts.join(" ");
  }
}

export {};
```

---

**Assignment 110:** Factory function returning interface implementation.

```typescript
interface AppLogger {
  log(m: string): void;
}
function createLogger(prefix: string): AppLogger {
  return {
    log(m: string) {
      console.log(prefix, m);
    },
  };
}

export {};
```

---

**Assignment 111:** Strategy pattern with map of handlers.

```typescript
type Op = "add" | "mul";
const strategies: Record<Op, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  mul: (a, b) => a * b,
};

export {};
```

---

**Assignment 112:** Observer pattern typed with `Set<Observer>`.

```typescript
type Observer = (evt: string) => void;
class Subject {
  private obs = new Set<Observer>();
  subscribe(o: Observer): () => void {
    this.obs.add(o);
    return () => this.obs.delete(o);
  }
  emit(e: string) {
    for (const o of this.obs) o(e);
  }
}

export {};
```

---

**Assignment 113:** Repository interface with generic `id`.

```typescript
interface Repository<T, Id> {
  findById(id: Id): Promise<T | null>;
}
class MemRepo<T, Id extends string> implements Repository<T, Id> {
  private map = new Map<Id, T>();
  async findById(id: Id): Promise<T | null> {
    return this.map.get(id) ?? null;
  }
}

export {};
```

---

**Assignment 114:** Type-safe event emitter `on<K extends keyof E>(event: K, ...)`.

```typescript
type Events = { msg: [string]; err: [Error] };
class Emitter<E extends Record<string, unknown[]>> {
  private listeners = new Map<keyof E, Set<(...args: unknown[]) => void>>();
  on<K extends keyof E>(event: K, fn: (...args: E[K]) => void): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(fn as (...args: unknown[]) => void);
  }
  emit<K extends keyof E>(event: K, ...args: E[K]): void {
    for (const fn of this.listeners.get(event) ?? [])
      (fn as (...a: E[K]) => void)(...args);
  }
}

export {};
```

---

**Assignment 115:** Type-safe API client with endpoint map.

```typescript
type Endpoints = { "/users": { get: { res: { id: string }[] } } };
class Client {
  async get<P extends keyof Endpoints>(path: P): Promise<Endpoints[P]["get"]["res"]> {
    return fetch(String(path)).then((r) => r.json());
  }
}

export {};
```

---

**Assignment 116:** Middleware chain `use` storing typed handlers.

```typescript
type Ctx = { user?: string };
type Next = () => Promise<void>;
type MW = (ctx: Ctx, next: Next) => Promise<void>;
function compose(mw: MW[]): MW {
  return async (ctx, next) => {
    let i = 0;
    const run = async (): Promise<void> => {
      if (i >= mw.length) return next();
      await mw[i++](ctx, run);
    };
    await run();
  };
}

export {};
```

---

**Assignment 117:** State machine with discriminated state and transition function.

```typescript
type S = { tag: "idle" } | { tag: "run"; n: number } | { tag: "done" };
function step(s: S): S {
  switch (s.tag) {
    case "idle":
      return { tag: "run", n: 0 };
    case "run":
      return s.n >= 3 ? { tag: "done" } : { tag: "run", n: s.n + 1 };
    case "done":
      return s;
  }
}

export {};
```

---

**Assignment 118:** Dependency injection container interface.

```typescript
type Token<T> = abstract new (...args: any[]) => T;
class Container {
  private map = new Map<Token<unknown>, unknown>();
  register<T>(token: Token<T>, impl: T): void {
    this.map.set(token, impl);
  }
  resolve<T>(token: Token<T>): T {
    const v = this.map.get(token);
    if (!v) throw new Error("missing");
    return v as T;
  }
}

export {};
```

---

**Assignment 119:** Builder with required final `build()` returning readonly product.

```typescript
class UserBuilder {
  private name = "";
  private age = 0;
  setName(n: string): this {
    this.name = n;
    return this;
  }
  setAge(a: number): this {
    this.age = a;
    return this;
  }
  build(): Readonly<{ name: string; age: number }> {
    return { name: this.name, age: this.age };
  }
}

export {};
```

---

**Assignment 120:** Visitor pattern over a discriminated union with typed `visit` methods.

```typescript
type Expr =
  | { tag: "num"; value: number }
  | { tag: "add"; left: Expr; right: Expr };
interface ExprVisitor<R> {
  visitNum(e: Extract<Expr, { tag: "num" }>): R;
  visitAdd(e: Extract<Expr, { tag: "add" }>): R;
}
function walk<R>(e: Expr, v: ExprVisitor<R>): R {
  switch (e.tag) {
    case "num":
      return v.visitNum(e);
    case "add":
      return v.visitAdd(e);
  }
}

export {};
```

---

### Module System (121–130)

**Assignment 121:** Explain `verbatimModuleSyntax`: use `import type` / `export type` in example.

```typescript
// point.ts: export type Point = { x: number; y: number };
// index.ts (verbatimModuleSyntax — use type-only forms):
//   import type { Point } from "./point";
//   export type { Point };
//   export const ZERO: Point = { x: 0, y: 0 };
export type Point = { x: number; y: number };
export const ZERO: Point = { x: 0, y: 0 };

export {};
```

---

**Assignment 122:** `isolatedModules` constraint: type-only exports must use `export type`.

```typescript
// foo.ts: export type Foo = { x: number };
// index.ts (isolatedModules-friendly):
//   export type { Foo } from "./foo";
export type Foo = { x: number };

export {};
```

---

**Assignment 123:** `moduleDetection: "force"` comment and empty export.

```typescript
// tsconfig: "moduleDetection": "force" treats files as modules.
export {};
```

---

**Assignment 124:** Sample `.d.ts` declaring a global `myLib`.

```typescript
// myLib.d.ts
declare const myLib: { version: string };

export {};
```

---

**Assignment 125:** `declare function` in ambient declaration.

```typescript
declare function greet(name: string): string;

export {};
```

---

**Assignment 126:** Module augmentation: extend `Express` Request (pattern).

```typescript
// express.d.ts
// import "express-serve-static-core";
// declare module "express-serve-static-core" {
//   interface Request { userId?: string }
// }
export {};
```

---

**Assignment 127:** Global augmentation `global`.

```typescript
export {};
declare global {
  interface Array<T> {
    last(): T | undefined;
  }
}
```

---

**Assignment 128:** Ambient module for CSS imports (`*.css` wildcard belongs in a root `.d.ts` without other imports).

```typescript
// global.d.ts (or any .d.ts that is not a module):
// declare module "*.css" {
//   const src: string;
//   export default src;
// }
// app.ts:
//   import styles from "./app.css";
export const cssModuleTypings =
  "Keep wildcard declare module '*.css' in an ambient .d.ts; then default imports typecheck.";

export {};
```

---

**Assignment 129:** `namespace` grouping (legacy interop).

```typescript
namespace Geometry {
  export type Point = { x: number; y: number };
}
type P = Geometry.Point;

export {};
```

---

**Assignment 130:** Barrel file re-export pattern.

```typescript
// a.ts: export const a = 1;
// b.ts: export const b = 2;
// index.ts (barrel):
//   export { a } from "./a";
//   export { b } from "./b";
export const a = 1;
export const b = 2;

export {};
```

---

### Strict Options (131–140)

**Assignment 131:** `strictNullChecks`: narrow before use on `string | null`.

```typescript
function len(s: string | null): number {
  if (s === null) return 0;
  return s.length;
}

export {};
```

---

**Assignment 132:** `exactOptionalPropertyTypes`: optional props differ from `| undefined` — use assertion when assigning `undefined` intentionally.

```typescript
type T = { x?: string };
const a: T = {};
const b = { x: undefined } as T;

export {};
```

---

**Assignment 133:** `noUncheckedIndexedAccess`: array access returns `T | undefined`.

```typescript
const xs: number[] = [1];
const y = xs[0];
if (y !== undefined) console.log(y + 1);

export {};
```

---

**Assignment 134:** `strictFunctionTypes`: contravariance in function parameters — demonstrate safer callback typing.

```typescript
type F = (x: string) => void;
const g: F = (x: string) => console.log(x);

export {};
```

---

**Assignment 135:** `noUncheckedSideEffectImports` intent: import used only for side effects must be explicit `import "./setup"`.

```typescript
// import "./polyfill"; // intentional side-effect import
export {};
```

---

**Assignment 136:** Use `NoInfer<T>` to prevent inference from an argument from widening another generic.

```typescript
function choose<T>(items: T[], defaultItem: NoInfer<T>): T {
  return items[0] ?? defaultItem;
}
const x = choose([1, 2, 3], 0);

export {};
```

---

**Assignment 137:** Variance annotation `out` for covariant type parameter (TS 4.7+ / 5.x).

```typescript
type Producer<out T> = () => T;
const p: Producer<string> = () => "hi";
const q: Producer<unknown> = p;

export {};
```

---

**Assignment 138:** Variance annotation `in` for contravariant type parameter.

```typescript
type Consumer<in T> = (x: T) => void;
const c: Consumer<unknown> = (_x) => {};
const d: Consumer<string> = c;

export {};
```

---

**Assignment 139:** Combine `satisfies` with strict optional properties.

```typescript
const cfg = { mode: "dev" as const } satisfies { mode?: "dev" | "prod" };

export {};
```

---

**Assignment 140:** Indexed access with `noUncheckedIndexedAccess` on `Record`.

```typescript
const m: Record<string, number> = { a: 1 };
const v = m["a"];
if (typeof v === "number") console.log(v);

export {};
```

---

---

## ADVANCED LEVEL (Assignments 141–200)

### Type-Level Programming (141–155)

**Assignment 141:** Parse string split by delimiter at type level (simple `Split<S, D>`).

```typescript
type Split<S extends string, D extends string> = S extends `${infer A}${D}${infer B}`
  ? [A, ...Split<B, D>]
  : [S];
type P = Split<"a,b,c", ",">;

export {};
```

---

**Assignment 142:** Type-level increment on digit union (simplified Peano-style using tuples).

```typescript
type TupleLen<T extends readonly unknown[]> = T["length"];
type Inc<N extends number> = [...Array<N>, 0]["length"] extends number ? [...Array<N>, 0]["length"] : never;
// Practical: use a prebuilt map for small numbers
type NMap = [1, 2, 3, 4, 5];
type IncSmall<N extends 0 | 1 | 2 | 3 | 4> = NMap[N];

export {};
```

---

**Assignment 143:** Tuple `Reverse` type.

```typescript
type Reverse<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [
  infer H,
  ...infer R,
]
  ? R extends readonly unknown[]
    ? Reverse<R, readonly [H, ...Acc]>
    : Acc
  : Acc;

export {};
```

---

**Assignment 144:** `DeepPartial<T>` one level + comment for recursion.

```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

export {};
```

---

**Assignment 145:** `DeepReadonly<T>` recursive.

```typescript
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

export {};
```

---

**Assignment 146:** Path types `Paths<T>` for dot notation (depth 2 demo).

```typescript
type Join<K extends string, P extends string> = P extends "" ? K : `${K}.${P}`;
type Paths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? Join<Prefix, K> | Join<Prefix, Paths<T[K], K>>
    : Join<Prefix, K>;
}[keyof T & string];

export {};
```

---

**Assignment 147:** Type-safe router params extraction from path literal.

```typescript
type Param<S extends string> = S extends `${string}:${infer P}/${infer R}`
  ? P | Param<`/${R}`>
  : S extends `${string}:${infer P}`
    ? P
    : never;
type R = Param<"/user/:id/post/:pid">;

export {};
```

---

**Assignment 148:** `ParseQuery` style string to record (simplified).

```typescript
type QPair<S extends string> = S extends `${infer K}=${infer V}` ? { [k in K]: V } : never;
type Merge2<A, B> = A & B extends infer O ? { [K in keyof O]: O[K] } : never;

export {};
```

---

**Assignment 149:** SQL-ish `Select<Cols, Row>` picking columns.

```typescript
type Row = { id: string; name: string; age: number };
type Select<C extends keyof Row> = Pick<Row, C>;
type S = Select<"id" | "name">;

export {};
```

---

**Assignment 150:** Variadic tuple `Concat<A,B>`.

```typescript
type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B];
type T = Concat<[1, 2], [3]>;

export {};
```

---

**Assignment 151:** HKT simulation with interface `Functor<F>` pattern.

```typescript
interface TypeLambda {
  readonly A: unknown;
  readonly Out: unknown;
}
interface Functor<F extends TypeLambda> {
  map<A, B>(fa: Apply<F, A>, f: (a: A) => B): Apply<F, B>;
}
type Apply<F extends TypeLambda, T> = (F & { readonly A: T })["Out"];

export {};
```

---

**Assignment 152:** Type-level state machine transitions map.

```typescript
type States = "A" | "B" | "C";
type Transitions = { A: "B"; B: "C"; C: "A" };
type Next<S extends States> = Transitions[S];

export {};
```

---

**Assignment 153:** Advanced template: trim spaces (simple).

```typescript
type TrimLeft<S extends string> = S extends ` ${infer R}` ? TrimLeft<R> : S;
type TrimRight<S extends string> = S extends `${infer R} ` ? TrimRight<R> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

export {};
```

---

**Assignment 154:** JSON parse return typed as `unknown` then narrowed.

```typescript
function parseJson(s: string): unknown {
  return JSON.parse(s);
}

export {};
```

---

**Assignment 155:** Tuple zip type (same length).

```typescript
type Zip<A extends readonly unknown[], B extends readonly unknown[]> = {
  [K in keyof A]: K extends keyof B ? [A[K], B[K]] : never;
};

export {};
```

---

### Advanced Utility Types (156–165)

**Assignment 156:** Implement `Prettify<T>` to expand intersections.

```typescript
type Prettify<T> = { [K in keyof T]: T[K] } & {};

export {};
```

---

**Assignment 157:** `UnionToIntersection<U>`.

```typescript
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export {};
```

---

**Assignment 158:** `IsNever<T>`.

```typescript
type IsNever<T> = [T] extends [never] ? true : false;

export {};
```

---

**Assignment 159:** `IsAny<T>` (careful).

```typescript
type IsAny<T> = 0 extends 1 & T ? true : false;

export {};
```

---

**Assignment 160:** `TupleToUnion<T>`.

```typescript
type TupleToUnion<T extends readonly unknown[]> = T[number];

export {};
```

---

**Assignment 161:** `Merge<A,B>` with B overriding A.

```typescript
type Merge<A, B> = Omit<A, keyof B> & B;

export {};
```

---

**Assignment 162:** `RequireAtLeastOne<T>`.

```typescript
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export {};
```

---

**Assignment 163:** `MutableKeys<T>` / `ReadonlyKeys<T>` using mapping modifiers.

```typescript
type MutableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K, never>;
}[keyof T];
type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;
type ReadonlyKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }, K, never>;
}[keyof T];

export {};
```

---

**Assignment 164:** `DeepPartial` + `Prettify` composition.

```typescript
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
type P = Prettify<DeepPartial<{ a: { b: number } }>>;

export {};
```

---

**Assignment 165:** `NonNullable` custom reimplementation.

```typescript
type MyNonNullable<T> = T extends null | undefined ? never : T;

export {};
```

---

### Real-World Typing (166–180)

**Assignment 166:** Type-safe `fetch` wrapper with JSON schema generic.

```typescript
async function httpJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}

export {};
```

---

**Assignment 167:** Typed environment variables via schema type.

```typescript
type Env = { PORT: number; NODE_ENV: "dev" | "prod" };
function readEnv(e: Record<string, string | undefined>): Env {
  return {
    PORT: Number(e.PORT ?? "0"),
    NODE_ENV: (e.NODE_ENV === "prod" ? "prod" : "dev") as Env["NODE_ENV"],
  };
}

export {};
```

---

**Assignment 168:** Form field types `Form<T>` with keys.

```typescript
type Form<T> = { [K in keyof T]: { value: T[K]; error?: string } };
type UserForm = Form<{ name: string; age: number }>;

export {};
```

---

**Assignment 169:** Typed event bus `on<E>(name, handler)`.

```typescript
type AppEvents = { login: { userId: string }; logout: {} };
class Bus<E extends Record<string, object>> {
  emit<K extends keyof E>(k: K, p: E[K]): void {
    void k;
    void p;
  }
}

export {};
```

---

**Assignment 170:** Typed Express-style middleware `Request` extension.

```typescript
type Req = { headers: Record<string, string | undefined> };
type Res = { send: (b: string) => void };
type Next = () => void;
type MW = (req: Req, res: Res, next: Next) => void;

export {};
```

---

**Assignment 171:** React-like component props typing `PropsWithChildren`.

```typescript
type PropsWithChildren<P> = P & { children?: unknown };
type BtnProps = PropsWithChildren<{ title: string; onClick?: () => void }>;

export {};
```

---

**Assignment 172:** API response wrapper `ApiOk<T> | ApiErr`.

```typescript
type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };
type ApiRes<T> = ApiOk<T> | ApiErr;

export {};
```

---

**Assignment 173:** Redux-like store `createStore<S, A extends { type: string }>`.

```typescript
type Reducer<S, A extends { type: string }> = (s: S, a: A) => S;
function createStore<S, A extends { type: string }>(r: Reducer<S, A>, s0: S) {
  let s = s0;
  return {
    dispatch(a: A) {
      s = r(s, a);
    },
    getState(): S {
      return s;
    },
  };
}

export {};
```

---

**Assignment 174:** Query builder `where<K extends keyof Row>(k: K, v: Row[K])`.

```typescript
type Row = { id: string; age: number };
class QB<R> {
  private w: Partial<R> = {};
  where<K extends keyof R>(k: K, v: R[K]): this {
    this.w[k] = v;
    return this;
  }
  build(): Partial<R> {
    return this.w;
  }
}

export {};
```

---

**Assignment 175:** Configuration manager with `get<K extends keyof C>(k: K): C[K]`.

```typescript
class Config<C extends Record<string, unknown>> {
  constructor(private c: C) {}
  get<K extends keyof C>(k: K): C[K] {
    return this.c[k];
  }
}

export {};
```

---

**Assignment 176:** Type-safe i18n keys `TFunction<K extends string>`.

```typescript
const dict = { "hello.name": "Hello {name}" } as const;
type Key = keyof typeof dict;
function t<K extends Key>(_k: K, _params: Record<string, string>): string {
  return "…";
}

export {};
```

---

**Assignment 177:** CLI args parser types `ArgsSpec -> Parsed`.

```typescript
type Spec = { port: number; verbose: boolean };
type Parsed = { [K in keyof Spec]: Spec[K] };
function parse(_argv: string[]): Parsed {
  return { port: 3000, verbose: false };
}

export {};
```

---

**Assignment 178:** DI container `register<T>(token, impl)` with a typed service map.

```typescript
const UserServiceKey = "UserService" as const;
type Services = { [UserServiceKey]: { getName(): string } };
class Container2 {
  private m: Partial<Record<keyof Services, Services[keyof Services]>> = {};
  set<K extends keyof Services>(k: K, v: Services[K]): void {
    this.m[k] = v;
  }
  get<K extends keyof Services>(k: K): Services[K] {
    const v = this.m[k];
    if (!v) throw new Error("not registered");
    return v;
  }
}

export {};
```

---

**Assignment 179:** Plugin system: `ContextPlugin` with `apply(ctx: Context): void`.

```typescript
type Context = { register(h: () => void): void };
interface ContextPlugin {
  name: string;
  apply(ctx: Context): void;
}

export {};
```

---

**Assignment 180:** Pub/sub with topic map.

```typescript
type Topics = { news: string; alert: number };
class PubSub<T extends Record<string, unknown>> {
  private subs = new Map<keyof T, Set<(p: unknown) => void>>();
  subscribe<K extends keyof T>(k: K, fn: (p: T[K]) => void): void {
    let s = this.subs.get(k);
    if (!s) {
      s = new Set();
      this.subs.set(k, s);
    }
    s.add(fn as (p: unknown) => void);
  }
  publish<K extends keyof T>(k: K, p: T[K]): void {
    for (const fn of this.subs.get(k) ?? []) (fn as (x: T[K]) => void)(p);
  }
}

export {};
```

---

### Advanced Compiler (181–190)

**Assignment 181:** Project references comment: solution structure `references` array.

```typescript
// tsconfig.json (root)
// { "files": [], "references": [{ "path": "./packages/a" }, { "path": "./packages/b" }] }
export {};
```

---

**Assignment 182:** `composite: true` for referenced project.

```typescript
// { "compilerOptions": { "composite": true, "declaration": true, "declarationMap": true } }
export {};
```

---

**Assignment 183:** `incremental: true` and `.tsbuildinfo`.

```typescript
// "incremental": true speeds up subsequent builds via .tsbuildinfo
export {};
```

---

**Assignment 184:** `import defer` (TS 5.9): comment example for deferred module evaluation.

```typescript
// TS 5.9: import defer { heavy } from "./heavy";
// Usage: heavy is loaded only when referenced (see release notes for exact syntax support).
export const note = "Use import defer where your toolchain supports TS 5.9 emit.";

export {};
```

---

**Assignment 185:** `--module node20` / `module: "node20"` with `import.meta.dirname` note.

```typescript
// tsconfig: "module": "node20", "target": "es2022"
export const dirnameNote = "Node20 module mode aligns with modern Node ESM/CJS interop.";

export {};
```

---

**Assignment 186:** Custom transformers concept (comment-only).

```typescript
// tsc does not load user transformers without API; use ts-patch or build tools.
export {};
```

---

**Assignment 187:** `declarationMap` for go-to-definition in `.d.ts`.

```typescript
// "declarationMap": true emits .d.ts.map
export {};
```

---

**Assignment 188:** `sourceMap` for debugging.

```typescript
// "sourceMap": true
export {};
```

---

**Assignment 189:** `extends` in tsconfig chain.

```typescript
// { "extends": "./base.json" }
export {};
```

---

**Assignment 190:** `paths` mapping `@app/*`.

```typescript
// "paths": { "@app/*": ["src/*"] }
export {};
```

---

### Testing & Tooling (191–196)

**Assignment 191:** Type testing `Expect` and `Equal`.

```typescript
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;
type Expect<T extends true> = T;
type _t1 = Expect<Equal<string, string>>;

export {};
```

---

**Assignment 192:** Assertion types for compile-time tests.

```typescript
type Assert<T extends true> = T;

export {};
```

---

**Assignment 193:** Mock typing: `jest.MockedFunction` pattern simplified.

```typescript
type Fn = (x: number) => string;
type Mocked = { (...args: Parameters<Fn>): ReturnType<Fn> };

export {};
```

---

**Assignment 194:** Test utility `PartialExcept<T,K>`.

```typescript
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export {};
```

---

**Assignment 195:** Type coverage mention with `type-coverage` tool comment.

```typescript
// npm: type-coverage — measures typed vs any/unknown ratio
export {};
```

---

**Assignment 196:** Type-safe fixtures factory `fixture<T>(defaults: Partial<T>): T`.

```typescript
function fixture<T>(full: T, overrides: Partial<T>): T {
  return { ...full, ...overrides };
}

export {};
```

---

### Capstone Projects (197–200)

**Assignment 197:** Capstone: type-safe REST client with method map and response types.

```typescript
type Routes = {
  "/users": { GET: { res: { id: string }[] } };
  "/users/:id": { GET: { res: { id: string; name: string } } };
};
type HttpVerb = "GET";
class RestClient<R extends Record<string, Record<HttpVerb, { res: unknown }>>> {
  async get<P extends keyof R>(path: P): Promise<R[P]["GET"]["res"]> {
    return fetch(String(path)).then((x) => x.json());
  }
}

export {};
```

---

**Assignment 198:** Capstone: type-safe form library `Field<T>` + `values` inference.

```typescript
type Field<T> = { value: T; errors: string[] };
type FormModel<T> = { [K in keyof T]: Field<T[K]> };
function values<T>(f: FormModel<T>): T {
  return Object.fromEntries(
    (Object.keys(f) as (keyof T)[]).map((k) => [k, f[k].value])
  ) as T;
}

export {};
```

---

**Assignment 199:** Capstone: type-safe state management `createSlice<S,A>`.

```typescript
type Action<T extends string, P = void> = P extends void ? { type: T } : { type: T; payload: P };
function createSlice<S, A extends { type: string }>(r: (s: S, a: A) => S, s0: S) {
  return { reduce: r, initial: s0 };
}

export {};
```

---

**Assignment 200:** Capstone: full-stack type sharing — `shared/types.ts` consumed by client/server (comment pattern).

```typescript
// packages/shared/src/api.ts — exported types imported by frontend and backend.
export type UserDto = { id: string; email: string };
export type CreateUser = Pick<UserDto, "email">;

export {};
```

---

