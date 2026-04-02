# TypeScript Interview Questions — Mid-Level (4+ Years Experience)

100 in-depth questions with detailed answers for experienced TypeScript developers.

---

## 1. What are conditional types, and how do they enable type-level programming?

Conditional types use the `T extends U ? X : Y` syntax to select between two types based on a condition. They are evaluated lazily and distribute over unions by default. Combined with `infer`, they become a powerful tool for extracting, transforming, and computing types at compile time—effectively enabling pattern matching at the type level.

```typescript
type IsArray<T> = T extends any[] ? true : false;

type A = IsArray<string[]>;   // true
type B = IsArray<number>;     // false

// Distributive behavior over unions
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]

// Non-distributive (wrapped in tuple)
type ToArrayND<T> = [T] extends [any] ? T[] : never;
type Result2 = ToArrayND<string | number>; // (string | number)[]
```

---

## 2. How does the `infer` keyword work in conditional types?

`infer` introduces a type variable that TypeScript infers from the position where it appears within a conditional type's `extends` clause. It can extract return types, parameter types, promise resolutions, array elements, and more. Multiple `infer` sites can be used in a single conditional type.

```typescript
type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
type A = UnwrapPromise<Promise<string>>; // string

type Head<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type First = Head<[1, 2, 3]>; // 1

type FunctionInfo<T> = T extends (...args: infer P) => infer R
  ? { params: P; returnType: R }
  : never;

type Info = FunctionInfo<(a: string, b: number) => boolean>;
// { params: [a: string, b: number]; returnType: boolean }
```

---

## 3. What are mapped types, and how do modifier operations work?

Mapped types iterate over the keys of a type using `in keyof` and transform each property. You can add or remove modifiers using `+` (add) and `-` (remove) prefixes on `readonly` and `?`. The built-in utility types `Partial`, `Required`, `Readonly`, and their negations are all implemented with mapped types.

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type Concrete<T> = {
  [K in keyof T]-?: T[K];
};

interface Config {
  readonly host: string;
  readonly port: number;
  debug?: boolean;
}

type MutableConfig = Mutable<Config>;
// { host: string; port: number; debug?: boolean }

type RequiredConfig = Concrete<Config>;
// { readonly host: string; readonly port: number; debug: boolean }
```

---

## 4. What is key remapping in mapped types?

TypeScript 4.1 introduced key remapping using `as` within mapped types. This lets you rename, filter, or compute new key names from existing keys using template literal types and conditional types.

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }

// Filtering keys
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

interface Mixed {
  id: number;
  name: string;
  greet(): void;
}

type DataOnly = RemoveMethods<Mixed>;
// { id: number; name: string }
```

---

## 5. What are template literal types, and how do they compose?

Template literal types use backtick syntax to construct string literal types from other types. They distribute over unions, producing every combination. Combined with intrinsic string manipulation types (`Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`), they enable compile-time string transformations.

```typescript
type EventName = "click" | "scroll" | "mousemove";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onScroll" | "onMousemove"

type CSSProperty = "margin" | "padding";
type CSSDirection = "top" | "right" | "bottom" | "left";
type CSSRule = `${CSSProperty}-${CSSDirection}`;
// 8 combinations: "margin-top" | "margin-right" | ... | "padding-left"

type KebabToCamel<S extends string> =
  S extends `${infer Head}-${infer Tail}`
    ? `${Head}${Capitalize<KebabToCamel<Tail>>}`
    : S;

type Result = KebabToCamel<"background-color">; // "backgroundColor"
```

---

## 6. How does TypeScript handle variance (covariance and contravariance)?

Variance describes how subtype relationships between complex types relate to subtype relationships between their component types. TypeScript checks variance depending on the position of the type parameter. Return types and property reads are covariant (subtypes flow out), function parameters are contravariant (supertypes flow in under `strictFunctionTypes`), and mutable properties are invariant (must be exact). TypeScript 4.7 introduced explicit variance annotations with `in` and `out` keywords.

```typescript
interface Producer<out T> {  // covariant — T flows out
  produce(): T;
}

interface Consumer<in T> {   // contravariant — T flows in
  consume(value: T): void;
}

interface ReadWrite<in out T> { // invariant
  get(): T;
  set(value: T): void;
}

// Covariance: Producer<Dog> is assignable to Producer<Animal>
// Contravariance: Consumer<Animal> is assignable to Consumer<Dog>
// Invariance: ReadWrite<Dog> is NOT assignable to ReadWrite<Animal>
```

---

## 7. What are discriminated unions, and how do you ensure exhaustiveness?

Discriminated unions use a common literal property (discriminant) to distinguish between members. Exhaustiveness checking ensures every possible case is handled. The `never` type is the key tool—in the `default` branch of a switch, if all cases are covered, the narrowed type is `never`; if a case is missing, assigning to `never` produces a compile error.

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default:
      return assertNever(shape); // compile error if a case is missing
  }
}
```

---

## 8. How do you create branded/opaque types in TypeScript?

Because TypeScript uses structural typing, two types with the same structure are interchangeable. Branded types use an intersection with a phantom property (a unique symbol or literal) to make structurally identical types incompatible, simulating nominal typing.

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

function getUser(id: UserId) { /* ... */ }

const userId = createUserId("user-123");
const orderId = createOrderId("order-456");

getUser(userId);   // ✔
// getUser(orderId); // ✘ — OrderId is not assignable to UserId
```

---

## 9. What is the `satisfies` operator, and when should you use it over type annotation?

`satisfies` (TypeScript 4.9) validates that a value conforms to a type without overriding the inferred type. With a type annotation (`: Type`), you lose narrow inference—every property widens to the declared type. With `satisfies`, the compiler checks conformance but preserves the precise literal or narrow type for downstream use. Use `satisfies` when you want both conformance checking and narrow inference.

```typescript
type Theme = Record<string, string | string[]>;

// With annotation — loses specificity
const theme1: Theme = {
  primary: "#000",
  secondary: ["#111", "#222"]
};
// theme1.primary is string | string[] — can't call .toUpperCase()

// With satisfies — preserves narrow types
const theme2 = {
  primary: "#000",
  secondary: ["#111", "#222"]
} satisfies Theme;
// theme2.primary is string — .toUpperCase() works
// theme2.secondary is string[] — .map() works
```

---

## 10. How do you use the `using` declaration for explicit resource management?

TypeScript 5.2 introduced the `using` declaration (based on the TC39 Explicit Resource Management proposal). Variables declared with `using` must implement `Symbol.dispose` (synchronous) or `Symbol.asyncDispose` (asynchronous). When the scope ends, the dispose method is called automatically, similar to `try/finally` but cleaner.

```typescript
class DatabaseConnection implements Disposable {
  constructor(private url: string) {
    console.log(`Connected to ${url}`);
  }

  query(sql: string): string[] {
    return ["result"];
  }

  [Symbol.dispose](): void {
    console.log(`Disconnected from ${this.url}`);
  }
}

function runQuery() {
  using db = new DatabaseConnection("postgres://localhost/mydb");
  const results = db.query("SELECT * FROM users");
  console.log(results);
  // db is automatically disposed when scope exits
}
```

---

## 11. What are recursive conditional types?

Recursive conditional types reference themselves in their definition, allowing you to iterate over types, transform strings character by character, manipulate tuples element by element, or unwrap deeply nested structures. TypeScript limits recursion depth to prevent infinite loops.

```typescript
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

interface Nested {
  a: { b: { c: string } };
  d: number[];
}

type ReadonlyNested = DeepReadonly<Nested>;
// { readonly a: { readonly b: { readonly c: string } }; readonly d: readonly number[] }

type TrimLeft<S extends string> = S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;
type Trimmed = TrimLeft<"   hello">; // "hello"
```

---

## 12. What is the `NoInfer` utility type?

`NoInfer<T>` (TypeScript 5.4) prevents a type parameter from being used as an inference site. This forces TypeScript to infer the type from other positions, avoiding ambiguous or incorrect inference when multiple positions contribute to the same type variable.

```typescript
function createStreetLight<C extends string>(
  colors: C[],
  defaultColor: NoInfer<C>
) {
  // ...
}

createStreetLight(["red", "yellow", "green"], "red");     // ✔
// createStreetLight(["red", "yellow", "green"], "blue"); // ✘ without NoInfer, "blue" would widen C
```

---

## 13. What are variadic tuple types?

Variadic tuple types (TypeScript 4.0) allow generic spread elements within tuple types. This enables typing functions that concatenate, split, or transform tuples of arbitrary length while preserving exact type information.

```typescript
type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];

type Result = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]

function concat<A extends unknown[], B extends unknown[]>(
  a: [...A],
  b: [...B]
): [...A, ...B] {
  return [...a, ...b];
}

const result = concat([1, "two"] as const, [true, 4] as const);
// Type: [1, "two", true, 4]
```

---

## 14. How do you type higher-order functions and function composition?

Higher-order functions take or return other functions. Typing them requires careful use of generics to preserve parameter and return types through the composition chain.

```typescript
function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): (a: A) => D;
function pipe(...fns: Function[]) {
  return (input: any) => fns.reduce((acc, fn) => fn(acc), input);
}

const transform = pipe(
  (s: string) => s.length,       // string → number
  (n: number) => n > 5,          // number → boolean
  (b: boolean) => (b ? "long" : "short") // boolean → string
);

transform("hello world"); // "long"
```

---

## 15. What are declaration files, and how do you write them for untyped libraries?

Declaration files (`.d.ts`) describe the types of JavaScript code without implementing it. When a library lacks types and no `@types` package exists, you write your own. The `declare` keyword introduces types without generating code. Module declarations use `declare module`, and global declarations use `declare global`.

```typescript
// untyped-lib.d.ts
declare module "untyped-lib" {
  export interface Config {
    apiKey: string;
    timeout?: number;
  }

  export function initialize(config: Config): void;
  export function fetchData<T>(endpoint: string): Promise<T>;

  export default class Client {
    constructor(config: Config);
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body: unknown): Promise<T>;
  }
}
```

---

## 16. How does module augmentation work in TypeScript?

Module augmentation lets you add new declarations to existing modules without modifying their source. You use `declare module "module-name"` with the additional types. For global augmentation, use `declare global`. This is how libraries like Express add custom properties to `Request`.

```typescript
// Augmenting Express Request
import "express";

declare module "express" {
  interface Request {
    userId?: string;
    sessionToken?: string;
  }
}

// Now in your middleware:
import { Request, Response, NextFunction } from "express";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  req.userId = "user-123"; // ✔ TypeScript recognizes this
  next();
}
```

---

## 17. What are assertion functions vs type guard functions?

Type guard functions return `boolean` and use the `param is Type` predicate, allowing both branches of a conditional to have narrowed types. Assertion functions return `void` and use `asserts param is Type`—they either succeed (narrowing the type for all subsequent code) or throw. Use type guards for branching logic and assertion functions for fail-fast validation.

```typescript
// Type guard — returns boolean, enables if/else branching
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Assertion function — throws or narrows for all subsequent code
function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`Expected string, got ${typeof value}`);
  }
}

function process(input: unknown) {
  if (isString(input)) {
    input.toUpperCase(); // narrowed in this block only
  }

  assertString(input);
  input.toUpperCase(); // narrowed for all code after this line
}
```

---

## 18. How do you type the `Proxy` and `Reflect` APIs?

Typing proxies requires defining the handler with strongly-typed traps. The `ProxyHandler<T>` interface provides trap signatures. Since proxies can intercept any operation, careful typing ensures the proxy contract matches the target.

```typescript
interface User {
  name: string;
  age: number;
}

function createLoggingProxy<T extends object>(target: T): T {
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      console.log(`Accessing ${String(prop)}`);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      console.log(`Setting ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    }
  };

  return new Proxy(target, handler);
}

const user = createLoggingProxy<User>({ name: "Alice", age: 30 });
user.name; // logs "Accessing name"
```

---

## 19. What are abstract construct signatures?

Abstract construct signatures define that a type must be a constructor for an abstract class (or its subclass). They use `abstract new (...args) => Type` syntax. This is useful in factory patterns where you want to accept any concrete subclass of an abstract base.

```typescript
abstract class Component {
  abstract render(): string;
}

class Button extends Component {
  render() { return "<button>Click</button>"; }
}

class Input extends Component {
  render() { return "<input />"; }
}

function createComponent(
  Ctor: abstract new () => Component
): Component {
  // Cannot instantiate abstract class directly,
  // but concrete subclasses work
  return new (Ctor as new () => Component)();
}
```

---

## 20. How do you implement the Builder pattern with TypeScript's type system?

The Builder pattern benefits from TypeScript's ability to track which properties have been set using phantom types or mapped types. This enables compile-time enforcement that all required fields are provided before building.

```typescript
type BuilderState = Record<string, boolean>;

class RequestBuilder<State extends BuilderState = {}> {
  private config: Record<string, unknown> = {};

  url(url: string): RequestBuilder<State & { url: true }> {
    this.config.url = url;
    return this as any;
  }

  method(method: string): RequestBuilder<State & { method: true }> {
    this.config.method = method;
    return this as any;
  }

  body(body: unknown): RequestBuilder<State & { body: true }> {
    this.config.body = body;
    return this as any;
  }

  build(
    this: RequestBuilder<{ url: true; method: true }>
  ): Record<string, unknown> {
    return { ...this.config };
  }
}

new RequestBuilder()
  .url("/api/users")
  .method("POST")
  .body({ name: "Alice" })
  .build(); // ✔

// new RequestBuilder().method("GET").build(); // ✘ missing url
```

---

## 21. What is the `const` type parameter modifier?

TypeScript 5.0 introduced the `const` modifier for type parameters. When applied, it tells TypeScript to infer the narrowest (literal) type for the argument, equivalent to using `as const` at the call site. This eliminates the need for callers to remember `as const`.

```typescript
function routes<const T extends readonly string[]>(paths: T): T {
  return paths;
}

const r = routes(["home", "about", "contact"]);
// Type: readonly ["home", "about", "contact"]
// Without const modifier: string[]
```

---

## 22. How does control flow analysis work in TypeScript?

Control flow analysis (CFA) tracks how types narrow through code paths based on assignments, type guards, return/throw statements, and exhaustiveness. TypeScript's CFA is flow-sensitive—meaning the type of a variable can differ between different code locations based on preceding conditions.

```typescript
function process(value: string | number | null) {
  // value: string | number | null
  if (value === null) {
    return; // early return narrows below
  }
  // value: string | number (null eliminated)

  if (typeof value === "string") {
    value.toUpperCase(); // value: string
    return;
  }
  // value: number (string eliminated)
  value.toFixed(2);
}
```

---

## 23. What are `extends` constraints with multiple bounds?

TypeScript doesn't support `T extends A & B` as separate constraints but achieves multiple bounds through intersection. This requires the type parameter to satisfy all parts of the intersection simultaneously.

```typescript
interface Serializable {
  serialize(): string;
}

interface Identifiable {
  id: string;
}

function save<T extends Serializable & Identifiable>(entity: T): void {
  console.log(`Saving ${entity.id}: ${entity.serialize()}`);
}

class User implements Serializable, Identifiable {
  constructor(public id: string, public name: string) {}
  serialize() { return JSON.stringify({ id: this.id, name: this.name }); }
}

save(new User("1", "Alice")); // ✔
```

---

## 24. How do you type event emitters with strict typing?

A strongly typed event emitter uses a type map to associate event names with their payload types, ensuring listeners receive correctly typed arguments.

```typescript
type EventMap = {
  connect: { url: string };
  disconnect: { reason: string };
  message: { content: string; sender: string };
};

class TypedEmitter<T extends Record<string, unknown>> {
  private listeners: Partial<Record<keyof T, Function[]>> = {};

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    (this.listeners[event] ??= []).push(listener);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    this.listeners[event]?.forEach(fn => fn(payload));
  }
}

const emitter = new TypedEmitter<EventMap>();
emitter.on("message", (payload) => {
  console.log(payload.content); // ✔ TypeScript knows payload shape
});
emitter.emit("message", { content: "Hello", sender: "Alice" });
// emitter.emit("message", { wrong: true }); // ✘ Error
```

---

## 25. What is the difference between `declare module` and `declare namespace`?

`declare module "name"` augments or defines types for an ES module (with quoted string). `declare namespace Name` defines a globally accessible namespace (without quotes). In modern TypeScript, `declare module` is used for module augmentation and ambient module declarations, while `declare namespace` is for global type scoping in declaration files.

```typescript
// Module declaration — for imports
declare module "analytics" {
  export function track(event: string, data: object): void;
}

// Namespace — global scope
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
  }
}
```

---

## 26. How do you implement generic factories with constraints?

Generic factories create instances of classes while maintaining type safety. The key is typing the constructor function with constraints to ensure only valid classes are accepted.

```typescript
interface Entity {
  id: string;
  validate(): boolean;
}

type Constructor<T> = new (...args: any[]) => T;

class EntityFactory {
  static create<T extends Entity>(
    EntityClass: Constructor<T>,
    ...args: ConstructorParameters<Constructor<T>>
  ): T {
    const instance = new EntityClass(...args);
    if (!instance.validate()) {
      throw new Error(`Invalid ${EntityClass.name}`);
    }
    return instance;
  }
}
```

---

## 27. What are `const` assertions vs `Object.freeze`?

`as const` is a compile-time-only mechanism that makes TypeScript infer narrow literal types and adds `readonly` modifiers. It produces no runtime code. `Object.freeze` is a runtime operation that makes an object's properties non-writable and non-configurable but only shallowly and does not affect the TypeScript type (unless combined with `Readonly`). For full compile-time immutability, use `as const`; for runtime immutability, use `Object.freeze`. For both, combine them.

```typescript
const config = {
  host: "localhost",
  port: 3000
} as const;
// Compile-time: { readonly host: "localhost"; readonly port: 3000 }
// Runtime: still mutable! (though TS won't let you)

const frozen = Object.freeze({ host: "localhost", port: 3000 });
// Runtime: frozen, properties can't be changed
// Compile-time: Readonly<{ host: string; port: number }>
```

---

## 28. How do you type mixins in TypeScript?

Mixins are classes that provide reusable functionality to be composed into other classes. TypeScript types mixins using constructor functions that extend a generic base class.

```typescript
type GConstructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends GConstructor>(Base: TBase) {
  return class Timestamped extends Base {
    createdAt = new Date();
    updatedAt = new Date();

    touch() {
      this.updatedAt = new Date();
    }
  };
}

function Tagged<TBase extends GConstructor>(Base: TBase) {
  return class Tagged extends Base {
    tags: string[] = [];

    addTag(tag: string) {
      this.tags.push(tag);
    }
  };
}

class BaseEntity {
  id: string = crypto.randomUUID();
}

class Document extends Tagged(Timestamped(BaseEntity)) {
  title: string = "";
}

const doc = new Document();
doc.addTag("important");    // from Tagged
doc.touch();                // from Timestamped
console.log(doc.id);        // from BaseEntity
```

---

## 29. What is the `Awaited` type, and how does it handle nested promises?

`Awaited<T>` recursively unwraps `Promise`-like types until it reaches a non-thenable. It handles nested promises, `PromiseLike`, and union types. It is the type used internally to type `await` expressions.

```typescript
type A = Awaited<Promise<string>>;                // string
type B = Awaited<Promise<Promise<number>>>;       // number (recursively unwrapped)
type C = Awaited<string | Promise<boolean>>;      // string | boolean
type D = Awaited<Promise<Promise<Promise<Date>>>>; // Date
```

---

## 30. How do you use generic defaults in TypeScript?

Generic type parameters can have default types, specified with `= DefaultType`. When the caller does not provide an explicit type argument and TypeScript cannot infer it, the default is used. Defaults must satisfy any constraints on the parameter.

```typescript
interface ApiResponse<T = unknown, E = Error> {
  data: T | null;
  error: E | null;
  status: number;
}

const response1: ApiResponse = { data: null, error: null, status: 200 };
// T = unknown, E = Error

const response2: ApiResponse<User> = {
  data: { id: 1, name: "Alice" },
  error: null,
  status: 200
};
// T = User, E = Error (default)

interface User { id: number; name: string; }
```

---

## 31. What are distributive conditional types, and how do you prevent distribution?

By default, conditional types distribute over naked type parameters in unions: `T extends U ? X : Y` is applied to each union member individually. To prevent distribution, wrap both sides of `extends` in a tuple.

```typescript
// Distributive
type ToArray<T> = T extends any ? T[] : never;
type D = ToArray<string | number>; // string[] | number[]

// Non-distributive
type ToArrayND<T> = [T] extends [any] ? T[] : never;
type ND = ToArrayND<string | number>; // (string | number)[]

// Practical: filtering unions
type ExtractStrings<T> = T extends string ? T : never;
type Result = ExtractStrings<"a" | 1 | "b" | true>; // "a" | "b"
```

---

## 32. How do you type a generic middleware pipeline?

Middleware pipelines (as in Express or Koa) can be strongly typed to track context transformations through each middleware layer.

```typescript
type Middleware<TIn, TOut> = (context: TIn) => TOut;

function compose<A, B>(m1: Middleware<A, B>): Middleware<A, B>;
function compose<A, B, C>(
  m1: Middleware<A, B>,
  m2: Middleware<B, C>
): Middleware<A, C>;
function compose<A, B, C, D>(
  m1: Middleware<A, B>,
  m2: Middleware<B, C>,
  m3: Middleware<C, D>
): Middleware<A, D>;
function compose(...middlewares: Middleware<any, any>[]) {
  return (context: any) =>
    middlewares.reduce((ctx, mw) => mw(ctx), context);
}

interface BaseCtx { url: string }
interface AuthCtx extends BaseCtx { userId: string }
interface DataCtx extends AuthCtx { data: unknown }

const pipeline = compose(
  (ctx: BaseCtx): AuthCtx => ({ ...ctx, userId: "user-1" }),
  (ctx: AuthCtx): DataCtx => ({ ...ctx, data: { items: [] } })
);

const result = pipeline({ url: "/api" });
// result: DataCtx — fully typed
```

---

## 33. What are indexed access types with generics?

Indexed access types use bracket notation to look up the type of a property. Combined with generics and `keyof`, they create type-safe getter/setter patterns where the return type depends on the key.

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

function setProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): void {
  obj[key] = value;
}

interface Settings {
  theme: "light" | "dark";
  fontSize: number;
  notifications: boolean;
}

const settings: Settings = { theme: "light", fontSize: 14, notifications: true };

const theme = getProperty(settings, "theme"); // "light" | "dark"
setProperty(settings, "fontSize", 16);        // ✔
// setProperty(settings, "fontSize", "big");  // ✘ string not assignable to number
```

---

## 34. How do you type a state machine with TypeScript?

TypeScript can model state machines using discriminated unions for states and conditional types or mapped types for valid transitions, catching invalid state transitions at compile time.

```typescript
type State =
  | { status: "idle" }
  | { status: "loading"; startTime: number }
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

type Transitions = {
  idle: "loading";
  loading: "success" | "error";
  success: "idle";
  error: "idle" | "loading";
};

function transition<
  S extends State,
  Target extends Transitions[S["status"]]
>(
  current: S,
  nextStatus: Target
): Extract<State, { status: Target }> {
  switch (nextStatus) {
    case "loading":
      return { status: "loading", startTime: Date.now() } as any;
    case "success":
      return { status: "success", data: "result" } as any;
    case "error":
      return { status: "error", error: new Error("fail") } as any;
    case "idle":
      return { status: "idle" } as any;
    default:
      throw new Error(`Invalid transition`);
  }
}

const s1: State = { status: "idle" };
const s2 = transition(s1, "loading"); // ✔ idle → loading
// transition(s1, "success");         // ✘ idle → success not valid
```

---

## 35. What are module resolution strategies in TypeScript?

TypeScript supports multiple module resolution strategies configured via `moduleResolution` in `tsconfig.json`. The main strategies are `node16`/`nodenext` (for modern Node.js with ESM support), `bundler` (for bundler-based setups like Vite/webpack), `node` (legacy CommonJS), and `classic` (legacy, rarely used). Each strategy determines how TypeScript resolves import paths to files and declaration files.

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ESNext"
  }
}
```

---

## 36. How does the `moduleResolution: "bundler"` mode work?

The `bundler` resolution mode (TypeScript 5.0) mimics how bundlers like Vite, webpack, and esbuild resolve modules. It supports extensionless imports, `package.json` `exports` field, and conditional exports without requiring file extensions in imports—unlike `node16`/`nodenext` which mandates extensions for ESM.

---

## 37. What are path mapping and `baseUrl` in TypeScript?

Path mapping (`paths`) and `baseUrl` in `tsconfig.json` create import aliases, allowing cleaner imports instead of long relative paths. `baseUrl` sets the root for non-relative imports, and `paths` defines mappings from alias patterns to actual locations.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

```typescript
// Instead of: import { Button } from "../../../components/Button"
import { Button } from "@components/Button";
```

---

## 38. What is project references (`composite` and `references`)?

Project references let you structure a TypeScript monorepo into multiple projects that reference each other. Each project has its own `tsconfig.json` with `composite: true`, and the root config uses `references`. This enables incremental builds, where changing one project only recompiles its dependents.

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "declaration": true
  }
}

// packages/app/tsconfig.json
{
  "compilerOptions": { "outDir": "./dist" },
  "references": [{ "path": "../shared" }]
}
```

---

## 39. How do you type React components with TypeScript?

React components are typed using generic interfaces from `@types/react`. Function components use `React.FC` (discouraged in modern codebases) or explicit prop types with return annotations. Props, state, context, refs, and hooks all benefit from TypeScript's type system.

```typescript
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

function Button({ label, variant = "primary", disabled, onClick, children }: ButtonProps) {
  return (
    <button className={variant} disabled={disabled} onClick={onClick}>
      {children ?? label}
    </button>
  );
}

// Typing hooks
const [count, setCount] = useState<number>(0);
const inputRef = useRef<HTMLInputElement>(null);
```

---

## 40. How do you type custom React hooks?

Custom hooks are regular functions with typed parameters and return values. They can return tuples, objects, or single values. Using `as const` on tuple returns preserves the exact types.

```typescript
interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, error, loading, refetch };
}

// Usage
const { data, loading } = useFetch<User[]>("/api/users");
```

---

## 41. What is the `Extract` utility type, and how does it differ from type narrowing?

`Extract<T, U>` is a compile-time operation that filters a union type `T` to keep only members assignable to `U`. It operates purely at the type level and produces no runtime code. Type narrowing, by contrast, uses runtime checks (typeof, instanceof, in) to refine types within code blocks. Use `Extract` for type manipulation; use narrowing for runtime logic.

```typescript
type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number };

type CircleOnly = Extract<Shape, { kind: "circle" }>;
// { kind: "circle"; r: number }
```

---

## 42. How do you create a deep partial type?

The built-in `Partial<T>` only makes top-level properties optional. A deep partial recursively makes all nested properties optional, which is useful for update/patch operations on deeply nested objects.

```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface Config {
  server: {
    host: string;
    port: number;
    ssl: {
      cert: string;
      key: string;
    };
  };
  logging: {
    level: string;
  };
}

function updateConfig(config: Config, updates: DeepPartial<Config>): Config {
  return mergeDeep(config, updates);
}

updateConfig(defaultConfig, {
  server: { ssl: { cert: "new-cert.pem" } } // only update nested cert
});
```

---

## 43. What are `import` type expressions?

Import type expressions use `import("module")` syntax to reference types from other modules without adding a runtime import. They are useful in declaration files, type annotations, and when you want to reference a type from a module without creating a module dependency.

```typescript
// Reference a type without runtime import
type Config = import("./config").AppConfig;

// In a .d.ts file
declare function loadModule(): Promise<typeof import("./heavy-module")>;

// In type annotations
function process(data: import("./types").DataPayload): void {
  // ...
}
```

---

## 44. How do you handle generic type parameter defaults with constraints?

When combining constraints and defaults, the default must satisfy the constraint. This creates flexible APIs where callers can customize types but get sensible defaults.

```typescript
interface Pagination<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TError extends Error = Error
> {
  data: TData[];
  error: TError | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Uses defaults
const page1: Pagination = {
  data: [{ key: "value" }],
  error: null,
  page: 1,
  totalPages: 10,
  hasMore: true
};

// Custom types
interface User { id: number; name: string; }
class ApiError extends Error { constructor(public code: number, message: string) { super(message); } }

const page2: Pagination<User, ApiError> = {
  data: [{ id: 1, name: "Alice" }],
  error: null,
  page: 1,
  totalPages: 5,
  hasMore: true
};
```

---

## 45. What is `ThisType<T>` and how is it used?

`ThisType<T>` is a special utility type that defines the type of `this` inside object literal methods without affecting the type of the object itself. It is used in factory functions and configuration objects where methods need access to a specific `this` context. Requires `noImplicitThis`.

```typescript
type ObjectDescriptor<D, M> = {
  data: D;
  methods: M & ThisType<D & M>;
};

function createApp<D, M>(descriptor: ObjectDescriptor<D, M>): D & M {
  const result = { ...descriptor.data, ...descriptor.methods } as D & M;
  return result;
}

const app = createApp({
  data: {
    x: 0,
    y: 0
  },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx; // this is typed as { x: number; y: number; moveBy: ... }
      this.y += dy;
    }
  }
});
```

---

## 46. How do you type a generic repository pattern?

The repository pattern abstracts data access. Generics make it reusable across entity types while maintaining type safety for queries and mutations.

```typescript
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, data: Partial<Omit<T, "id">>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

interface User extends Entity {
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> { /* ... */ return null; }
  async findAll(filter?: Partial<User>): Promise<User[]> { return []; }
  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    return { id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date(), ...data };
  }
  async update(id: string, data: Partial<Omit<User, "id">>): Promise<User> { /* ... */ return {} as User; }
  async delete(id: string): Promise<boolean> { return true; }
}
```

---

## 47. What are const enums vs regular enums vs union types for performance?

`const enum` members are inlined at compile time—no runtime object is created, so there's zero overhead. Regular `enum` creates a JavaScript object at runtime, adding to bundle size but allowing reverse mapping and iteration. Union literal types are fully erased at compile time and have zero runtime cost but cannot be iterated at runtime. For most cases, union types are the modern best practice.

---

## 48. How does the `extends` keyword behave differently in different contexts?

`extends` has three distinct meanings in TypeScript: (1) class inheritance (`class Dog extends Animal`), (2) interface extension (`interface Admin extends User`), and (3) generic constraint (`T extends string`). In conditional types, it acts as a type-level condition (`T extends string ? X : Y`). Understanding context is crucial because the semantics differ significantly.

---

## 49. What is a phantom type parameter?

A phantom type parameter is a generic parameter that appears in the type definition but is not used in the runtime structure. It exists solely to carry type-level information—commonly used for branded types, units of measure, or type-state patterns.

```typescript
type Currency<T extends string> = number & { readonly __currency: T };

type USD = Currency<"USD">;
type EUR = Currency<"EUR">;

function usd(amount: number): USD {
  return amount as USD;
}

function eur(amount: number): EUR {
  return amount as EUR;
}

function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

const price = usd(100);
const tax = usd(10);
addUSD(price, tax); // ✔
// addUSD(price, eur(10)); // ✘ EUR is not assignable to USD
```

---

## 50. How do you type an event-driven architecture?

Event-driven systems benefit from a typed event map that connects event names to their payload types, ensuring producers and consumers agree on the data shape.

```typescript
interface EventMap {
  "user:created": { id: string; name: string; email: string };
  "user:updated": { id: string; changes: Partial<{ name: string; email: string }> };
  "user:deleted": { id: string };
  "order:placed": { orderId: string; userId: string; total: number };
}

class EventBus<T extends Record<string, unknown>> {
  private handlers = new Map<keyof T, Set<Function>>();

  subscribe<K extends keyof T>(event: K, handler: (payload: T[K]) => void): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  publish<K extends keyof T>(event: K, payload: T[K]): void {
    this.handlers.get(event)?.forEach(fn => fn(payload));
  }
}

const bus = new EventBus<EventMap>();
bus.subscribe("user:created", (payload) => {
  console.log(payload.name); // ✔ type-safe
});
```

---

## 51. What are intersection types with function overloads?

When intersecting function types, TypeScript treats the result as overloads. Each constituent function type becomes an overload signature, and the call must match at least one of them.

```typescript
type A = ((x: string) => string) & ((x: number) => number);

declare const fn: A;
fn("hello"); // string
fn(42);      // number
// fn(true); // ✘ no matching overload
```

---

## 52. How do you use `infer` with multiple positions?

When `infer` appears in multiple positions for the same variable, TypeScript uses co-variant inference for return/output positions and contra-variant inference for parameter/input positions. If they conflict, the result is an intersection or union depending on variance.

```typescript
type GetBoth<T> = T extends {
  a: (x: infer U) => void;
  b: (x: infer U) => void;
} ? U : never;

type Result = GetBoth<{
  a: (x: string) => void;
  b: (x: number) => void;
}>;
// string & number = never (contravariant → intersection)
```

---

## 53. What is the `NoInfer` intrinsic and why was it needed?

Before `NoInfer` (TypeScript 5.4), inference sites could cause unexpected widening. For example, a function with two parameters of the same generic type would infer from both, potentially widening the type. `NoInfer` blocks inference from specific positions, forcing the compiler to infer from the other positions only.

```typescript
function foo<T extends string>(values: T[], defaultValue: NoInfer<T>): T {
  return values[0] ?? defaultValue;
}

foo(["a", "b"], "a"); // ✔ — T inferred from values only
// foo(["a", "b"], "c"); // ✘ — "c" is not in "a" | "b"
```

---

## 54. How do you type recursive data structures like trees?

Recursive types naturally model hierarchical data like file systems, organizational charts, and menu structures.

```typescript
interface FileSystemNode {
  name: string;
  type: "file" | "directory";
  children?: FileSystemNode[];
  size?: number;
}

function totalSize(node: FileSystemNode): number {
  if (node.type === "file") {
    return node.size ?? 0;
  }
  return (node.children ?? []).reduce(
    (sum, child) => sum + totalSize(child),
    0
  );
}

const root: FileSystemNode = {
  name: "src",
  type: "directory",
  children: [
    { name: "index.ts", type: "file", size: 1024 },
    {
      name: "utils",
      type: "directory",
      children: [
        { name: "helpers.ts", type: "file", size: 512 }
      ]
    }
  ]
};
```

---

## 55. What are type-safe string template parsers?

TypeScript's template literal types can parse strings at the type level, extracting segments and building structured types from string patterns.

```typescript
type ParseRoute<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ParseRoute<Rest>]: string }
    : S extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

type Params = ParseRoute<"/users/:userId/posts/:postId">;
// { userId: string; postId: string }
```

---

## 56. How do you handle type-safe configuration objects?

Configuration objects benefit from const assertions and strict typing to prevent typos and ensure valid combinations.

```typescript
const logLevels = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof logLevels)[number];

interface AppConfig {
  readonly environment: "development" | "staging" | "production";
  readonly server: {
    readonly host: string;
    readonly port: number;
  };
  readonly logging: {
    readonly level: LogLevel;
    readonly format: "json" | "text";
  };
}

function defineConfig(config: AppConfig): Readonly<AppConfig> {
  return Object.freeze(config);
}

const config = defineConfig({
  environment: "production",
  server: { host: "0.0.0.0", port: 8080 },
  logging: { level: "info", format: "json" }
});
```

---

## 57. What is `declare global` and when is it used?

`declare global` augments the global scope from within a module file. Without it, declarations in a module file are scoped to that module. It is commonly used to add properties to `Window`, `globalThis`, or `NodeJS.ProcessEnv`.

```typescript
export {};

declare global {
  interface Window {
    analytics: {
      track(event: string, data: Record<string, unknown>): void;
    };
  }

  interface Array<T> {
    customMethod(): T[];
  }
}
```

---

## 58. How do you type GraphQL operations in TypeScript?

GraphQL code generation tools (like `graphql-codegen`) generate TypeScript types from your schema and operations. You can also manually type them using generics for type-safe query/mutation patterns.

```typescript
interface GraphQLResponse<T> {
  data: T | null;
  errors?: Array<{
    message: string;
    path?: string[];
    locations?: Array<{ line: number; column: number }>;
  }>;
}

async function gqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables })
  });
  return response.json();
}

interface UsersQuery {
  users: Array<{ id: string; name: string }>;
}

const result = await gqlQuery<UsersQuery>(`
  query { users { id name } }
`);
result.data?.users.forEach(u => console.log(u.name));
```

---

## 59. What are self-referencing types and how are they useful?

Self-referencing types (where a type refers to itself) are essential for modeling linked lists, trees, JSON, recursive UI components, and similar structures. TypeScript resolves them lazily, avoiding infinite expansion.

```typescript
interface LinkedListNode<T> {
  value: T;
  next: LinkedListNode<T> | null;
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

interface MenuItem {
  label: string;
  url?: string;
  children?: MenuItem[];
}
```

---

## 60. How do you create a type-safe Redux-like store?

A typed store uses discriminated unions for actions and mapped types for reducers, ensuring every action type is handled and payloads match.

```typescript
type Action =
  | { type: "INCREMENT"; payload: number }
  | { type: "DECREMENT"; payload: number }
  | { type: "RESET" };

interface State {
  count: number;
}

type Reducer<S, A> = (state: S, action: A) => S;

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + action.payload };
    case "DECREMENT":
      return { count: state.count - action.payload };
    case "RESET":
      return { count: 0 };
  }
};

function createStore<S, A>(reducer: Reducer<S, A>, initialState: S) {
  let state = initialState;
  return {
    getState: () => state,
    dispatch: (action: A) => { state = reducer(state, action); }
  };
}

const store = createStore(reducer, { count: 0 });
store.dispatch({ type: "INCREMENT", payload: 5 });
```

---

## 61. What are overloaded constructor signatures?

TypeScript allows classes to have overloaded constructors, providing multiple ways to instantiate the same class with different argument combinations while maintaining type safety.

```typescript
class DateTime {
  private date: Date;

  constructor(timestamp: number);
  constructor(dateString: string);
  constructor(year: number, month: number, day: number);
  constructor(yearOrTimestampOrString: number | string, month?: number, day?: number) {
    if (typeof yearOrTimestampOrString === "string") {
      this.date = new Date(yearOrTimestampOrString);
    } else if (month !== undefined && day !== undefined) {
      this.date = new Date(yearOrTimestampOrString, month - 1, day);
    } else {
      this.date = new Date(yearOrTimestampOrString);
    }
  }
}

new DateTime(1234567890);           // from timestamp
new DateTime("2024-01-15");         // from string
new DateTime(2024, 1, 15);          // from components
```

---

## 62. How do you implement exhaustive type checking for complex unions?

For complex unions where switch statements become unwieldy, you can use record-based dispatch or mapped types to enforce exhaustiveness.

```typescript
type Shape = "circle" | "rectangle" | "triangle" | "pentagon";

const areaCalculators: Record<Shape, (params: any) => number> = {
  circle: ({ r }: { r: number }) => Math.PI * r ** 2,
  rectangle: ({ w, h }: { w: number; h: number }) => w * h,
  triangle: ({ b, h }: { b: number; h: number }) => 0.5 * b * h,
  pentagon: ({ s }: { s: number }) => (Math.sqrt(5 * (5 + 2 * Math.sqrt(5))) / 4) * s ** 2
};
// If you add a new Shape member, TypeScript will error until you add it here
```

---

## 63. What are `Symbol.hasInstance` and typing `instanceof`?

The `Symbol.hasInstance` well-known symbol allows classes to customize the behavior of `instanceof`. TypeScript respects this for type narrowing when properly typed.

```typescript
class Range {
  constructor(private min: number, private max: number) {}

  static [Symbol.hasInstance](value: unknown): value is number {
    return typeof value === "number";
  }

  contains(value: number): boolean {
    return value >= this.min && value <= this.max;
  }
}
```

---

## 64. How do you use `WeakRef` and `FinalizationRegistry` in TypeScript?

`WeakRef<T>` holds a weak reference that doesn't prevent garbage collection. `FinalizationRegistry` provides cleanup callbacks when objects are collected. Both are typed generically in TypeScript.

```typescript
class Cache<K, V extends object> {
  private refs = new Map<K, WeakRef<V>>();
  private registry = new FinalizationRegistry<K>((key) => {
    this.refs.delete(key);
  });

  set(key: K, value: V): void {
    this.refs.set(key, new WeakRef(value));
    this.registry.register(value, key);
  }

  get(key: K): V | undefined {
    return this.refs.get(key)?.deref();
  }
}
```

---

## 65. What are assertion signatures for class methods?

Assertion signatures can be applied to class methods, allowing instance methods to narrow the type of `this` or parameters. This is useful for validation methods in domain models.

```typescript
class Form {
  private values: Record<string, unknown> = {};
  private validated = false;

  setValue(key: string, value: unknown): void {
    this.values[key] = value;
    this.validated = false;
  }

  assertValid(): asserts this is Form & { validated: true } {
    if (!this.values["name"]) {
      throw new Error("Name is required");
    }
    this.validated = true;
  }

  submit(this: Form & { validated: true }): void {
    console.log("Submitting", this.values);
  }
}

const form = new Form();
form.setValue("name", "Alice");
form.assertValid();
form.submit(); // ✔ — only callable after assertValid
```

---

## 66. How do you type dynamic property access patterns?

When properties are accessed dynamically (via variables), TypeScript needs indexable types or generic lookup patterns to maintain safety.

```typescript
type Translations = {
  en: { greeting: string; farewell: string };
  es: { greeting: string; farewell: string };
  fr: { greeting: string; farewell: string };
};

function translate<
  L extends keyof Translations,
  K extends keyof Translations[L]
>(translations: Translations, lang: L, key: K): Translations[L][K] {
  return translations[lang][key];
}
```

---

## 67. What is `Symbol.iterator` typing in TypeScript?

TypeScript types iterables and iterators using the `Iterable<T>`, `Iterator<T>`, `IterableIterator<T>`, and `Generator<T>` interfaces. Custom iterable classes implement `[Symbol.iterator]()`.

```typescript
class Range implements Iterable<number> {
  constructor(private start: number, private end: number) {}

  *[Symbol.iterator](): IterableIterator<number> {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}

for (const n of new Range(1, 5)) {
  console.log(n); // 1, 2, 3, 4, 5
}

const arr = [...new Range(10, 15)]; // [10, 11, 12, 13, 14, 15]
```

---

## 68. How do you type decorator factories?

Decorator factories are functions that return decorators. They accept configuration parameters and produce a decorator function with the appropriate signature.

```typescript
function Throttle(ms: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    let lastCall = 0;

    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      if (now - lastCall >= ms) {
        lastCall = now;
        return original.apply(this, args);
      }
    };
  };
}

class Api {
  @Throttle(1000)
  fetchData() {
    console.log("Fetching...");
  }
}
```

---

## 69. What are `abstract` methods with generics in abstract classes?

Abstract classes can define abstract methods with generic type parameters, allowing concrete subclasses to provide specific implementations while the base class defines the contract.

```typescript
abstract class Transformer<TInput, TOutput> {
  abstract transform(input: TInput): TOutput;

  transformAll(inputs: TInput[]): TOutput[] {
    return inputs.map(input => this.transform(input));
  }
}

class StringToNumber extends Transformer<string, number> {
  transform(input: string): number {
    return parseFloat(input);
  }
}

const transformer = new StringToNumber();
transformer.transformAll(["1.5", "2.7", "3.14"]); // [1.5, 2.7, 3.14]
```

---

## 70. How do you type curried functions?

Curried functions take arguments one at a time, returning a new function for each. Typing them requires nested generic signatures to preserve type flow.

```typescript
function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

const add = curry((a: number, b: number) => a + b);
const add5 = add(5);
add5(3); // 8

// More general curry type
type Curry<F> = F extends (a: infer A, ...rest: infer R) => infer Ret
  ? R extends []
    ? (a: A) => Ret
    : (a: A) => Curry<(...args: R) => Ret>
  : never;
```

---

## 71. What is the `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` intrinsic types?

These are compiler-intrinsic string manipulation types that transform string literal types at the character level. They are essential building blocks for template literal type manipulation.

```typescript
type U = Uppercase<"hello">;       // "HELLO"
type L = Lowercase<"HELLO">;       // "hello"
type C = Capitalize<"hello">;      // "Hello"
type UC = Uncapitalize<"Hello">;   // "hello"

type EventHandler<T extends string> = `on${Capitalize<T>}`;
type ClickHandler = EventHandler<"click">; // "onClick"
```

---

## 72. How do you type `Map`, `Set`, `WeakMap`, and `WeakSet`?

These collections are generic in TypeScript. You specify key and value types as type parameters for full type safety.

```typescript
const userMap = new Map<string, { name: string; age: number }>();
userMap.set("alice", { name: "Alice", age: 30 });

const tags = new Set<string>();
tags.add("typescript");

const privateData = new WeakMap<object, { secret: string }>();
const obj = {};
privateData.set(obj, { secret: "hidden" });

const processed = new WeakSet<HTMLElement>();
```

---

## 73. What is declaration merging with functions and namespaces?

TypeScript allows a function and a namespace with the same name to merge, adding properties to the function. This pattern is used by libraries like jQuery and Express.

```typescript
function validator(value: string): boolean {
  return value.length > 0;
}

namespace validator {
  export const minLength = 1;
  export function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}

validator("hello");           // function call
validator.isEmail("a@b.com"); // namespace property
validator.minLength;           // 1
```

---

## 74. How do you type method chaining (fluent interfaces)?

Fluent interfaces return `this` from methods to enable chaining. TypeScript's polymorphic `this` type ensures that chains preserve the correct subclass type.

```typescript
class QueryBuilder {
  private parts: string[] = [];

  select(fields: string[]): this {
    this.parts.push(`SELECT ${fields.join(", ")}`);
    return this;
  }

  from(table: string): this {
    this.parts.push(`FROM ${table}`);
    return this;
  }

  where(condition: string): this {
    this.parts.push(`WHERE ${condition}`);
    return this;
  }

  build(): string {
    return this.parts.join(" ");
  }
}

const query = new QueryBuilder()
  .select(["name", "email"])
  .from("users")
  .where("active = true")
  .build();
// "SELECT name, email FROM users WHERE active = true"
```

---

## 75. What are the `resolveJsonModule` and `allowJs` compiler options?

`resolveJsonModule` allows importing `.json` files directly and types them based on their content. `allowJs` allows TypeScript to process `.js` files alongside `.ts` files, useful during migration. Both are configured in `tsconfig.json`.

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": true
  }
}
```

```typescript
import config from "./config.json";
// config is typed based on the JSON structure
console.log(config.version); // ✔ auto-typed
```

---

## 76. How do you type error boundaries and fallback patterns?

Error handling types ensure that error states, fallback values, and recovery logic are type-safe. The Result pattern is a popular approach.

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

const result = tryCatch(() => JSON.parse('{"valid": true}'));
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.message);
}
```

---

## 77. What is the `verbatimModuleSyntax` flag?

`verbatimModuleSyntax` (TypeScript 5.0) replaces `importsNotUsedAsValues` and `preserveValueImports`. It enforces that `import type` and `export type` are used explicitly for type-only imports/exports. Any import that doesn't use `type` is emitted as-is in the output. This makes the relationship between TypeScript and output modules transparent and predictable.

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

```typescript
import type { User } from "./types";   // erased — type only
import { fetchUsers } from "./api";     // preserved in output
```

---

## 78. How do you type an async generator?

Async generators yield values asynchronously and are typed with `AsyncGenerator<Yield, Return, Next>` or using the `async function*` syntax with typed yields.

```typescript
async function* paginate<T>(
  fetchPage: (page: number) => Promise<T[]>
): AsyncGenerator<T[], void, undefined> {
  let page = 0;
  while (true) {
    const results = await fetchPage(page);
    if (results.length === 0) return;
    yield results;
    page++;
  }
}

async function processAllPages() {
  const fetcher = (page: number) =>
    fetch(`/api/items?page=${page}`).then(r => r.json());

  for await (const pageItems of paginate<{ id: string }>(fetcher)) {
    pageItems.forEach(item => console.log(item.id));
  }
}
```

---

## 79. What is the `exactOptionalPropertyTypes` compiler flag?

When enabled, `exactOptionalPropertyTypes` distinguishes between a property being absent and a property being explicitly set to `undefined`. Without it, optional properties accept `undefined` as a valid value. With it, you must use `| undefined` explicitly if you want to allow setting a property to `undefined`.

```json
{ "compilerOptions": { "exactOptionalPropertyTypes": true } }
```

```typescript
interface User {
  name: string;
  nickname?: string;  // optional — can be absent, but NOT set to undefined
}

const user1: User = { name: "Alice" };                   // ✔ absent
// const user2: User = { name: "Bob", nickname: undefined }; // ✘ Error

interface User2 {
  name: string;
  nickname?: string | undefined; // explicitly allows undefined
}
```

---

## 80. How do you type a dependency injection container?

A typed DI container uses generics and a token/key system to associate types with their implementations, ensuring type-safe resolution.

```typescript
type Token<T> = { readonly __type: T; readonly name: string };

function createToken<T>(name: string): Token<T> {
  return { name } as Token<T>;
}

class Container {
  private bindings = new Map<string, unknown>();

  bind<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token.name, factory);
  }

  resolve<T>(token: Token<T>): T {
    const factory = this.bindings.get(token.name) as (() => T) | undefined;
    if (!factory) throw new Error(`No binding for ${token.name}`);
    return factory();
  }
}

interface Logger { log(msg: string): void; }
const LoggerToken = createToken<Logger>("Logger");

const container = new Container();
container.bind(LoggerToken, () => ({
  log: (msg: string) => console.log(msg)
}));

const logger = container.resolve(LoggerToken); // Logger type
logger.log("Hello"); // ✔
```

---

## 81. What is narrowing with `asserts` in control flow?

When an assertion function is called, TypeScript narrows the type for all code after the assertion in the same scope. This enables a validation-first coding style where you validate all assumptions upfront, then work with narrowed types.

```typescript
function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value == null) throw new Error(`${name} must be defined`);
}

function processOrder(orderId: string | null, userId: string | undefined) {
  assertDefined(orderId, "orderId");
  assertDefined(userId, "userId");

  // Both are now narrowed to string
  console.log(orderId.toUpperCase(), userId.toLowerCase());
}
```

---

## 82. How do you use `Readonly` deeply for immutable data structures?

The built-in `Readonly<T>` is shallow. For deeply immutable structures, create a recursive `DeepReadonly` type. This is essential for Redux-like state management where immutability is a core principle.

```typescript
type DeepReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer U>
    ? ReadonlySet<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;
```

---

## 83. What is the difference between `structuredClone` typing and spread typing?

`structuredClone` is typed to return the same type as its input (it deep clones). Spread (`...`) is typed structurally but is a shallow operation. TypeScript reflects this difference in their type signatures.

```typescript
interface User {
  name: string;
  address: { city: string };
}

const user: User = { name: "Alice", address: { city: "NYC" } };

const clone = structuredClone(user); // User — deep clone
const spread = { ...user };          // { name: string; address: { city: string } }

clone.address.city = "LA";  // doesn't affect original
spread.address.city = "LA"; // affects original (shallow copy)
```

---

## 84. How do you type a plugin architecture?

Plugin systems use interfaces for plugin contracts and generic registration for type-safe plugin management.

```typescript
interface Plugin<TContext> {
  name: string;
  setup(context: TContext): void | Promise<void>;
  teardown?(): void | Promise<void>;
}

interface AppContext {
  router: { addRoute(path: string, handler: Function): void };
  config: Record<string, unknown>;
}

class PluginManager<TContext> {
  private plugins: Plugin<TContext>[] = [];

  register(plugin: Plugin<TContext>): void {
    this.plugins.push(plugin);
  }

  async initialize(context: TContext): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.setup(context);
    }
  }
}

const authPlugin: Plugin<AppContext> = {
  name: "auth",
  setup(ctx) {
    ctx.router.addRoute("/login", () => {});
  }
};
```

---

## 85. What are `accessor` keyword decorators (TypeScript 5.0+)?

TypeScript 5.0 introduced the `accessor` keyword for auto-accessor class fields, aligning with the TC39 decorators proposal. An `accessor` field automatically generates a getter and setter backed by a private storage slot.

```typescript
class Person {
  accessor name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

## 86. How do you type environment variables safely?

Environment variables are always strings at runtime but may be undefined. A type-safe approach validates and parses them at startup.

```typescript
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getEnvNumber(name: string): number {
  const value = getEnvVar(name);
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`${name} must be a number, got: ${value}`);
  }
  return num;
}

const config = {
  port: getEnvNumber("PORT"),
  databaseUrl: getEnvVar("DATABASE_URL"),
  nodeEnv: getEnvVar("NODE_ENV") as "development" | "production" | "test"
} as const;
```

---

## 87. What is the `using` keyword for async disposal?

`await using` works with `Symbol.asyncDispose` for asynchronous cleanup. When the scope exits, the async dispose method is awaited automatically.

```typescript
class DatabasePool implements AsyncDisposable {
  async connect(): Promise<void> { console.log("Connected"); }

  async [Symbol.asyncDispose](): Promise<void> {
    console.log("Closing pool...");
    // await pool.close();
  }
}

async function main() {
  await using pool = new DatabasePool();
  await pool.connect();
  // pool is automatically disposed when scope exits
}
```

---

## 88. How do you type function overloads with generics?

Combining overloads with generics allows functions to have different return types based on input patterns while remaining type-safe.

```typescript
function parse<T = unknown>(input: string): T;
function parse<T>(input: string, schema: { parse(data: unknown): T }): T;
function parse(input: string, schema?: { parse(data: unknown): unknown }): unknown {
  const data = JSON.parse(input);
  return schema ? schema.parse(data) : data;
}
```

---

## 89. What is structural vs nominal typing in TypeScript?

TypeScript uses structural typing: two types are compatible if their structures match. Most other typed languages use nominal typing: two types are compatible only if they share the same declaration. You can simulate nominal typing in TypeScript with branded types (phantom properties).

---

## 90. How do you type callback-to-promise conversions?

Converting callback APIs to promises requires typing both the callback signature and the resulting promise.

```typescript
type CallbackFn<T> = (error: Error | null, result: T) => void;

function promisify<T>(
  fn: (callback: CallbackFn<T>) => void
): () => Promise<T>;
function promisify<T, A>(
  fn: (arg: A, callback: CallbackFn<T>) => void
): (arg: A) => Promise<T>;
function promisify(fn: Function) {
  return (...args: any[]) =>
    new Promise((resolve, reject) => {
      fn(...args, (err: Error | null, result: unknown) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
}
```

---

## 91. What is `@ts-expect-error` vs `@ts-ignore`?

`@ts-ignore` suppresses the next line's errors unconditionally. `@ts-expect-error` suppresses the next line's errors but errors itself if there is no error to suppress—making it self-documenting and safer. Always prefer `@ts-expect-error` because it alerts you when the underlying issue is fixed and the suppression is no longer needed.

```typescript
// @ts-expect-error — errors if no problem exists (preferred)
const value: string = 42;

// @ts-ignore — always silent, even when suppression is unnecessary (avoid)
const value2: string = "valid"; // no error here, but no warning either
```

---

## 92. How do you handle type narrowing in closures?

TypeScript's control flow analysis does not cross function boundaries. A variable narrowed in an outer scope loses its narrowing inside a closure because the closure might execute later when the variable has changed. The solution is to capture the narrowed value in a `const`.

```typescript
function process(value: string | null) {
  if (value !== null) {
    // value is string here

    // Capture the narrowed value
    const definiteValue = value;

    setTimeout(() => {
      console.log(definiteValue.toUpperCase()); // ✔ safe
    }, 100);
  }
}
```

---

## 93. What are `unknown` function types?

When typing callbacks or higher-order functions where you don't know the parameter types, `(...args: unknown[]) => unknown` is safer than `Function` or `(...args: any[]) => any`. It forces callers to narrow arguments before use.

```typescript
type SafeCallback = (...args: unknown[]) => unknown;

function executeWithLogging(fn: SafeCallback, ...args: unknown[]): unknown {
  console.log("Executing with args:", args);
  return fn(...args);
}
```

---

## 94. How do you type the Abstract Factory pattern?

The Abstract Factory pattern creates families of related objects. TypeScript's generics and interfaces make the family relationships type-safe.

```typescript
interface Button { render(): string; }
interface Input { render(): string; }

interface UIFactory {
  createButton(label: string): Button;
  createInput(placeholder: string): Input;
}

class DarkThemeFactory implements UIFactory {
  createButton(label: string): Button {
    return { render: () => `<button class="dark">${label}</button>` };
  }
  createInput(placeholder: string): Input {
    return { render: () => `<input class="dark" placeholder="${placeholder}" />` };
  }
}

function buildUI(factory: UIFactory) {
  const btn = factory.createButton("Submit");
  const input = factory.createInput("Enter name");
  return `${input.render()} ${btn.render()}`;
}
```

---

## 95. What is the `isolatedModules` flag?

`isolatedModules` ensures each file can be transpiled independently (without knowledge of other files). This is required by single-file transpilers like Babel, SWC, and esbuild. It disallows features that require cross-file analysis: `const enum`, namespace merging across files, and re-exporting types without `export type`.

---

## 96. How do you type a function that returns different types based on input?

Function overloads and conditional return types allow a single function to have input-dependent return types.

```typescript
function processValue(input: string): string[];
function processValue(input: number): number;
function processValue(input: boolean): string;
function processValue(input: string | number | boolean): string[] | number | string {
  if (typeof input === "string") return input.split(",");
  if (typeof input === "number") return input * 2;
  return input ? "yes" : "no";
}

const a = processValue("a,b,c"); // string[]
const b = processValue(42);       // number
const c = processValue(true);     // string
```

---

## 97. What is the `moduleDetection` option?

`moduleDetection` (TypeScript 4.7) controls how TypeScript determines whether a file is a module or a script. `"auto"` (default) treats files with `import`/`export` as modules and others as scripts. `"force"` treats all files as modules. `"legacy"` matches pre-4.7 behavior. In modern projects, `"force"` avoids surprises where a file without imports is accidentally treated as a global script.

---

## 98. How do you type higher-kinded types (approximation)?

TypeScript does not natively support higher-kinded types (types parameterized by other type constructors). However, you can approximate them using interface merging and lookup patterns.

```typescript
interface TypeRegistry {
  Array: unknown[];
  Set: Set<unknown>;
  Promise: Promise<unknown>;
}

type Apply<F extends keyof TypeRegistry, A> =
  F extends "Array" ? A[]
  : F extends "Set" ? Set<A>
  : F extends "Promise" ? Promise<A>
  : never;

type StringArray = Apply<"Array", string>; // string[]
type NumberSet = Apply<"Set", number>;      // Set<number>
type BoolPromise = Apply<"Promise", boolean>; // Promise<boolean>
```

---

## 99. What is `import.meta` typing?

`import.meta` provides module-level metadata. Its type depends on the environment (Vite, Node.js, etc.) and can be augmented via declaration merging.

```typescript
// For Vite projects
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const apiUrl = import.meta.env.VITE_API_URL; // typed string
```

---

## 100. How do you implement a type-safe event system with generic constraints and inference?

A production-grade typed event system combines generics, mapped types, and inference to provide fully type-safe subscriptions and emissions.

```typescript
type EventMap = Record<string, unknown>;
type EventKey<T extends EventMap> = string & keyof T;
type EventHandler<T> = (payload: T) => void;

class TypeSafeEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: Set<EventHandler<T[K]>> } = {};

  on<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): () => void {
    const set = (this.listeners[event] ??= new Set()) as Set<EventHandler<T[K]>>;
    set.add(handler);
    return () => set.delete(handler);
  }

  once<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): void {
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe();
      handler(payload);
    });
  }

  emit<K extends EventKey<T>>(event: K, payload: T[K]): void {
    (this.listeners[event] as Set<EventHandler<T[K]>> | undefined)?.forEach(
      fn => fn(payload)
    );
  }
}

interface AppEvents {
  "auth:login": { userId: string; timestamp: number };
  "auth:logout": { userId: string };
  "data:sync": { count: number; duration: number };
}

const emitter = new TypeSafeEmitter<AppEvents>();

emitter.on("auth:login", ({ userId, timestamp }) => {
  console.log(`${userId} logged in at ${timestamp}`);
});

emitter.emit("auth:login", { userId: "user-1", timestamp: Date.now() });
```

---
