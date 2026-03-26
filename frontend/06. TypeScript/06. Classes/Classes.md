# TypeScript Classes

TypeScript **classes** are syntactic sugar over JavaScript prototypes: they bundle state (fields), behavior (methods), construction (`constructor`), visibility (`public` / `private` / `protected` / `#`), inheritance (`extends` / `super`), and advanced patterns (generics, `abstract`, static blocks, decorators when enabled). Classes emit real JavaScript at runtime (unlike interfaces), so they are ideal for modeling entities, services, and frameworks while still benefiting from static typing, refactoring safety, and structural checks against interfaces. This guide moves from everyday syntax through access control, inheritance, generics, decorator metadata, and production-minded tradeoffs—with examples at every level.

---

## 📑 Table of Contents

1. [Class Basics](#1-class-basics)
2. [Class Members](#2-class-members)
3. [Access Modifiers](#3-access-modifiers)
4. [Getters and Setters](#4-getters-and-setters)
5. [Static Members](#5-static-members)
6. [Class Inheritance](#6-class-inheritance)
7. [Abstract Classes](#7-abstract-classes)
8. [Generic Classes](#8-generic-classes)
9. [Class Types](#9-class-types)
10. [Parameter Properties](#10-parameter-properties)
11. [Class Decorators](#11-class-decorators)
12. [Best Practices](#12-best-practices)
13. [Common Mistakes to Avoid](#13-common-mistakes-to-avoid)

---

## 1. Class Basics

A **class declaration** introduces a constructor function and a prototype. The **`constructor`** runs when you call `new`. **Instance properties** and **methods** live on each instance (for fields) or the prototype chain (for ordinary methods). **`this`** refers to the instance in methods when called as `obj.method()`; binding can differ for callbacks unless you use arrow functions or explicit `bind`. **Class expressions** (`const C = class { ... }`) are like function expressions: they can be anonymous, assigned, and passed around.

### 🟢 Beginner Example

```typescript
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet(): string {
    return `Hello, ${this.greeting}`;
  }
}

const g = new Greeter("world");
console.log(g.greet()); // Hello, world
```

### 🟡 Intermediate Example

```typescript
// Class expression + implementing a simple interface
interface Serializable {
  toJSON(): string;
}

const Box = class implements Serializable {
  constructor(public label: string) {}

  toJSON(): string {
    return JSON.stringify({ label: this.label });
  }
};

const b = new Box("inbox");
console.log(b.toJSON());

// `this` in a method depends on call site
class Counter {
  count = 0;
  inc() {
    this.count += 1;
  }
}

const c = new Counter();
const loose = c.inc;
// loose(); // Runtime: `this` is undefined (strict) or global — avoid

c.inc(); // OK: `this` is c
```

### 🔴 Expert Example

```typescript
// Callable class pattern: class + interface merging for dual typing (advanced)
interface Command {
  (argv: string[]): void;
  readonly name: string;
}

const Run = class implements Command {
  readonly name = "run";

  constructor(public readonly script: string) {}

  call(argv: string[]): void {
    console.log(this.script, argv);
  }
} as unknown as { new (script: string): Command } & Command;

// Usage requires careful typing; prefer composition for new code
```

### 🌍 Real-Time Example

```typescript
// Domain entity in an e-commerce module
class CartLine {
  sku: string;
  quantity: number;
  unitPriceCents: number;

  constructor(sku: string, quantity: number, unitPriceCents: number) {
    this.sku = sku;
    this.quantity = quantity;
    this.unitPriceCents = unitPriceCents;
  }

  lineTotalCents(): number {
    return this.quantity * this.unitPriceCents;
  }
}

const line = new CartLine("SKU-42", 2, 1999);
console.log(line.lineTotalCents());
```

---

## 2. Class Members

**Fields** hold per-instance state. **`readonly`** fields can be assigned in the declaration, in the constructor body, or via parameter properties—but not afterward. **Optional properties** (`?`) on classes are allowed in TypeScript 4.0+ for instances typed structurally; on the class body they mean the property may be missing initially (you are responsible for initialization). The **definite assignment assertion** (`name!: string`) tells TypeScript “I will assign this before use,” silencing `--strictPropertyInitialization` checks—use sparingly. **Field initializers** run before the constructor body. **Constructor parameters** can be promoted to fields with parameter properties (covered in section 10).

### 🟢 Beginner Example

```typescript
class User {
  id: number;
  name: string;
  readonly createdAt: Date;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.createdAt = new Date();
  }
}

const u = new User(1, "Lee");
// u.createdAt = new Date(); // Error: readonly
```

### 🟡 Intermediate Example

```typescript
class Buffer {
  // Field initializer
  chunks: string[] = [];

  // Definite assignment: set in constructor paths TypeScript cannot prove
  capacity!: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  // Optional field (may be undefined until set)
  description?: string;
}
```

### 🔴 Expert Example

```typescript
// `--strictPropertyInitialization` interaction with subclass constructors
class Base {
  protected seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
}

class Derived extends Base {
  // If you add own properties, ensure they're assigned before super returns
  // or use definite assignment where appropriate
  doubled!: number;

  constructor(seed: number) {
    super(seed);
    this.doubled = seed * 2;
  }
}
```

### 🌍 Real-Time Example

```typescript
class HttpClientConfig {
  baseUrl: string;
  timeoutMs = 30_000;
  readonly maxRetries: number;
  headers: Record<string, string> = { "Accept": "application/json" };

  constructor(baseUrl: string, maxRetries = 3) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.maxRetries = maxRetries;
  }
}
```

---

## 3. Access Modifiers

TypeScript provides **`public`** (default), **`private`**, and **`protected`**. **`private`** and **`protected`** are *compile-time* visibility: they disappear in emitted JavaScript (ES2015 target uses WeakMap-like patterns only when downleveling private fields is not used). **ECMAScript private fields** use **`#name`**: they are *true* runtime privacy, not visible outside the class body, and cannot be accessed from subclasses. **Guidelines**: use `#` when you need hard encapsulation or to avoid name clashes in subclasses; use `private` for ergonomic compile-time privacy and framework patterns; use `protected` for extension points in inheritance hierarchies—avoid exposing large protected surfaces in public libraries.

### 🟢 Beginner Example

```typescript
class BankAccount {
  public owner: string;
  private balanceCents: number;

  constructor(owner: string, openingDepositCents: number) {
    this.owner = owner;
    this.balanceCents = openingDepositCents;
  }

  public deposit(cents: number): void {
    if (cents > 0) this.balanceCents += cents;
  }

  public getBalanceCents(): number {
    return this.balanceCents;
  }
}

const acct = new BankAccount("Morgan", 1000);
acct.deposit(500);
// acct.balanceCents; // Error: private
```

### 🟡 Intermediate Example

```typescript
class Shape {
  protected readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Circle extends Shape {
  constructor(name: string, public radius: number) {
    super(name);
  }

  describe(): string {
    return `${this.name} r=${this.radius}`;
  }
}

const c = new Circle("wheel", 7);
// c.name; // Error: protected
```

### 🔴 Expert Example

```typescript
class SecureToken {
  #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  // Subclasses cannot access #value — by design
  reveal(): string {
    return this.#value;
  }
}

class AttemptedChild extends SecureToken {
  // constructor(v: string) { super(v); }
  // broken(): string { return this.#value; } // Error: Property '#value' is not accessible
}
```

### 🌍 Real-Time Example

```typescript
class RateLimiter {
  #maxPerMinute: number;
  #hits: number[] = [];

  constructor(maxPerMinute: number) {
    this.#maxPerMinute = maxPerMinute;
  }

  tryConsume(): boolean {
    const now = Date.now();
    const windowStart = now - 60_000;
    this.#hits = this.#hits.filter((t) => t > windowStart);
    if (this.#hits.length >= this.#maxPerMinute) return false;
    this.#hits.push(now);
    return true;
  }
}
```

---

## 4. Getters and Setters

**Accessors** (`get` / `set`) let you expose computed or validated properties. TypeScript **infers** a property type from getters when no setter exists; with both, the **setter parameter type** must be assignable to the getter’s return type unless you use distinct types with careful unions. You can intentionally use **different types** for get vs set (uncommon) by typing the broader property—document this clearly because it surprises readers.

### 🟢 Beginner Example

```typescript
class Rectangle {
  constructor(public width: number, public height: number) {}

  get area(): number {
    return this.width * this.height;
  }
}

const r = new Rectangle(3, 4);
console.log(r.area); // 12
```

### 🟡 Intermediate Example

```typescript
class CelsiusSensor {
  private _c = 0;

  get celsius(): number {
    return this._c;
  }

  set celsius(value: number) {
    if (value < -273.15) throw new Error("Below absolute zero");
    this._c = value;
  }

  get fahrenheit(): number {
    return this._c * (9 / 5) + 32;
  }

  set fahrenheit(f: number) {
    this.celsius = (f - 32) * (5 / 9);
  }
}
```

### 🔴 Expert Example

```typescript
// Different get/set types (advanced): string in, normalized string out
class EmailBox {
  private _raw = "";

  get email(): string {
    return this._raw.trim().toLowerCase();
  }

  set email(value: string | null | undefined) {
    this._raw = value == null ? "" : String(value);
  }
}

const e = new EmailBox();
e.email = "  User@Example.COM ";
console.log(e.email); // "user@example.com"
```

### 🌍 Real-Time Example

```typescript
class Money {
  constructor(private cents: number) {}

  get amount(): string {
    return (this.cents / 100).toFixed(2);
  }

  set amount(display: string) {
    const n = Number(display);
    if (!Number.isFinite(n)) throw new Error("Invalid amount");
    this.cents = Math.round(n * 100);
  }
}
```

---

## 5. Static Members

**Static properties** and **static methods** belong to the constructor function, not instances. **Static blocks** (`static { ... }`) run once when the class is evaluated—useful for initialization that would otherwise run at module top level. Inside static methods, **`this`** refers to the **constructor** (the subclass constructor when inherited methods are not involved the same way—see expert example). Static members are inherited on the subclass constructor.

### 🟢 Beginner Example

```typescript
class MathUtil {
  static readonly PI2 = Math.PI * 2;

  static clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
  }
}

console.log(MathUtil.clamp(12, 0, 10));
```

### 🟡 Intermediate Example

```typescript
class IdGenerator {
  static #seq = 0;

  static next(): string {
    this.#seq += 1;
    return `id-${this.#seq}`;
  }

  static {
    // one-time setup
    this.#seq = Number(process.env.START_ID ?? 0);
  }
}
```

### 🔴 Expert Example

```typescript
class BaseRepo {
  static table = "base";

  static findAll(): string[] {
    // `this` is the constructor that was called (BaseRepo or subclass)
    return [`SELECT * FROM ${this.table}`];
  }
}

class UserRepo extends BaseRepo {
  static override table = "users";
}

console.log(UserRepo.findAll()); // uses UserRepo.table
```

### 🌍 Real-Time Example

```typescript
class FeatureFlags {
  private static cache: Record<string, boolean> | null = null;

  static {
    // Load once per evaluation (in real apps, fetch remote config here)
    this.cache = { darkMode: true, betaCheckout: false };
  }

  static isOn(flag: string): boolean {
    return Boolean(this.cache?.[flag]);
  }
}
```

---

## 6. Class Inheritance

**`extends`** creates a subclass whose prototype chain includes the superclass. **`super(...)`** must be called before accessing `this` in the subclass constructor. **Method overriding** uses `override` (recommended with `noImplicitOverride`) to catch renames in the base class. **`protected`** members are visible in subclasses. **Constructor inheritance**: if the base has no written constructor, the default passes arguments through; otherwise the subclass must call `super` with compatible arguments.

### 🟢 Beginner Example

```typescript
class Animal {
  constructor(public name: string) {}

  speak(): string {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  speak(): string {
    return `${this.name} barks`;
  }
}

const d = new Dog("Rex");
console.log(d.speak());
```

### 🟡 Intermediate Example

```typescript
class Person {
  constructor(public readonly id: string, public name: string) {}
}

class Employee extends Person {
  constructor(id: string, name: string, public department: string) {
    super(id, name);
  }
}

const e = new Employee("e-1", "Sam", "Engineering");
console.log(e.department);
```

### 🔴 Expert Example

```typescript
class Component {
  constructor(public props: Record<string, unknown>) {}
  render(): string {
    return "";
  }
}

class Button extends Component {
  override render(): string {
    const label = String(this.props["label"] ?? "");
    return `<button>${label}</button>`;
  }
}
```

### 🌍 Real-Time Example

```typescript
class BaseRepository<T> {
  constructor(protected readonly resourcePath: string) {}

  protected buildUrl(id: string): string {
    return `${this.resourcePath}/${encodeURIComponent(id)}`;
  }
}

class OrderRepository extends BaseRepository<{ id: string }> {
  constructor() {
    super("/api/orders");
  }

  urlFor(id: string): string {
    return this.buildUrl(id);
  }
}
```

---

## 7. Abstract Classes

The **`abstract`** modifier marks a class that **cannot be instantiated** directly. **Abstract methods** declare signatures without bodies; concrete subclasses **must implement** them. **Abstract properties** (TypeScript 4.3+) declare accessors or fields that subclasses must provide. **Abstract construct signatures** appear in *types*, not on classes: you can type “something constructable that returns an abstract type” using intersection types, but you still cannot `new` an abstract class. **Abstract classes vs interfaces**: abstract classes exist at runtime (shared behavior, default implementations, construction); interfaces are erased and describe shapes only—prefer interfaces for public API contracts and abstract classes for shared code with optional protected hooks.

### 🟢 Beginner Example

```typescript
abstract class Animal {
  constructor(public name: string) {}
  abstract makeSound(): string;

  describe(): string {
    return `${this.name} says ${this.makeSound()}`;
  }
}

class Cat extends Animal {
  makeSound(): string {
    return "meow";
  }
}

const c = new Cat("Whiskers");
console.log(c.describe());
// const a = new Animal("x"); // Error
```

### 🟡 Intermediate Example

```typescript
abstract class Parser {
  abstract parse(input: string): unknown;

  protected trim(s: string): string {
    return s.trim();
  }
}

class JsonParser extends Parser {
  parse(input: string): unknown {
    return JSON.parse(this.trim(input));
  }
}
```

### 🔴 Expert Example

```typescript
abstract class Model {
  abstract get id(): string;
  abstract serialize(): Record<string, unknown>;

  toJSON(): string {
    return JSON.stringify(this.serialize());
  }
}

class UserModel extends Model {
  constructor(public readonly id: string, public name: string) {
    super();
  }

  serialize(): Record<string, unknown> {
    return { id: this.id, name: this.name };
  }
}

// Typing constructors of abstract classes (type-level)
type AbstractCtor<T> = abstract new (...args: any[]) => T;
```

### 🌍 Real-Time Example

```typescript
abstract class PaymentGateway {
  abstract charge(amountCents: number, currency: string): Promise<string>;

  protected validateCurrency(currency: string): void {
    if (currency.length !== 3) throw new Error("ISO 4217 expected");
  }
}

class StripeGateway extends PaymentGateway {
  async charge(amountCents: number, currency: string): Promise<string> {
    this.validateCurrency(currency);
    // call Stripe SDK...
    return "pi_mock";
  }
}
```

---

## 8. Generic Classes

**Generic classes** declare type parameters on the class name: `class Box<T> { ... }`. Instances fix `T` at construction. **Generic constraints** use `extends` on the type parameter. **Static members** cannot reference the class’s instance type parameters (a static belongs to the constructor, not a particular `T`). **`this` types** (polymorphic `this`) let methods return the concrete subclass type for fluent APIs.

### 🟢 Beginner Example

```typescript
class Box<T> {
  constructor(private value: T) {}

  get(): T {
    return this.value;
  }

  set(value: T): void {
    this.value = value;
  }
}

const numBox = new Box<number>(42);
const strBox = new Box("hi"); // inferred Box<string>
```

### 🟡 Intermediate Example

```typescript
interface HasId {
  id: string;
}

class Store<T extends HasId> {
  private map = new Map<string, T>();

  upsert(entity: T): void {
    this.map.set(entity.id, entity);
  }

  get(id: string): T | undefined {
    return this.map.get(id);
  }
}
```

### 🔴 Expert Example

```typescript
class FluentQuery<T> {
  constructor(private items: readonly T[]) {}

  where(predicate: (x: T) => boolean): this {
    return new (this.constructor as new (items: readonly T[]) => this)(
      this.items.filter(predicate),
    );
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// Static side cannot use the class's instance type parameter `T`:
class BadExample<T> {
  constructor(private items: readonly T[]) {}

  // static make(): T { return null as T; }
  // Error: Static members cannot reference class type parameters.
}

// Correct pattern: static generic method declares its own type parameter
class GoodExample<T> {
  constructor(private items: readonly T[]) {}

  static empty<U>(): GoodExample<U> {
    return new GoodExample<U>([]);
  }
}
```

### 🌍 Real-Time Example

```typescript
class PaginatedResult<TItem> {
  constructor(
    public readonly items: TItem[],
    public readonly page: number,
    public readonly pageSize: number,
    public readonly total: number,
  ) {}

  hasNext(): boolean {
    return this.page * this.pageSize < this.total;
  }
}
```

---

## 9. Class Types

A **class declaration** introduces *two* things in the type system: the **instance type** (`InstanceType<typeof MyClass>`) and the **constructor type** (`typeof MyClass`). **`instanceof`** narrows at runtime when the value’s constructor matches; combine with type guards for discriminated unions. **Constructor types** are written `new (...args) => T` or `abstract new (...args) => T`. **Heritage checking** ensures `implements` and `extends` relationships are structurally compatible where required.

### 🟢 Beginner Example

```typescript
class FileRef {
  constructor(public path: string) {}
}

function useFile(f: FileRef) {
  console.log(f.path);
}

const x: FileRef = new FileRef("/tmp/a.txt");
useFile(x);
```

### 🟡 Intermediate Example

```typescript
class Cat {
  readonly kind = "cat" as const;
  constructor(public name: string) {}
}

class Dog {
  readonly kind = "dog" as const;
  constructor(public name: string) {}
}

type Pet = Cat | Dog;

function isCat(p: Pet): p is Cat {
  return p instanceof Cat;
}

function greet(pet: Pet) {
  if (isCat(pet)) {
    console.log(p.name, pet.kind);
  } else {
    console.log(p.name, pet.kind);
  }
}
```

### 🔴 Expert Example

```typescript
class Service {
  constructor(public name: string) {}
}

type ServiceConstructor = new (name: string) => Service;

function create(Ctor: ServiceConstructor, name: string): Service {
  return new Ctor(name);
}

type ServiceInstance = InstanceType<ServiceConstructor>;

// Heritage: class must satisfy interface shape
interface Named {
  name: string;
}

class Account implements Named {
  constructor(public name: string) {}
}
```

### 🌍 Real-Time Example

```typescript
class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new HttpError(res.statusText, res.status);
  return res.json();
}
```

---

## 10. Parameter Properties

**Parameter properties** are a shorthand: placing an access modifier (`public`, `private`, `protected`, or `readonly`) on a constructor parameter **declares and assigns** an instance field automatically. You can combine `readonly` with `private` / `protected` / `public`. This reduces boilerplate for data-carrying classes (DTOs, entities, services with injected dependencies).

### 🟢 Beginner Example

```typescript
class Point {
  constructor(public x: number, public y: number) {}
}

const p = new Point(1, 2);
console.log(p.x, p.y);
```

### 🟡 Intermediate Example

```typescript
class UserService {
  constructor(
    private readonly apiBase: string,
    public readonly tenantId: string,
    protected logger: { info: (m: string) => void },
  ) {}

  profileUrl(userId: string): string {
    this.logger.info("build profile url");
    return `${this.apiBase}/tenants/${this.tenantId}/users/${userId}`;
  }
}
```

### 🔴 Expert Example

```typescript
// Mixing normal params with parameter properties
class Session {
  constructor(
    public readonly id: string,
    private refresh: () => Promise<void>,
    expiresAt: Date, // not a property — local only
  ) {
    void expiresAt; // could validate expiry
  }
}
```

### 🌍 Real-Time Example

```typescript
class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly sku: string,
    public readonly qty: number,
    private readonly idempotencyKey: string,
  ) {}

  headers(): Record<string, string> {
    return { "Idempotency-Key": this.idempotencyKey };
  }
}
```

---

## 11. Class Decorators

> **Note:** Decorators are **experimental** in TypeScript unless you use the **Stage 3 ECMAScript decorators** proposal (TS 5.0+ with `experimentalDecorators: false` in some configurations). Typical setups use `experimentalDecorators: true` in `tsconfig.json`. **`emitDecoratorMetadata`** adds design-time type metadata for frameworks like NestJS (requires `reflect-metadata` at runtime).

**Class decorators** receive the constructor. **Method / accessor / property / parameter decorators** receive different arguments. **Decorator factories** return the actual decorator: `@log()` expands to a function that wraps the target. **Composition**: with legacy decorators, multiple decorators on one member are applied **inside-out** (closest to the member runs first); decorator **factories** run **top-to-bottom** when reading `@A() @B() m()`. **Metadata**: with `emitDecoratorMetadata: true`, TypeScript emits `design:type`, `design:paramtypes`, and `design:returntype` keys consumed by `reflect-metadata` (add `import "reflect-metadata"` once at app entry).

**Legacy decorator signatures (summary):**

| Kind | Arguments (simplified) |
|------|-------------------------|
| Class | `constructor` |
| Method / accessor | `target`, `propertyKey`, `descriptor` |
| Property | `target`, `propertyKey` |
| Parameter | `target`, `propertyKey`, `parameterIndex` |

### 🟢 Beginner Example

```typescript
// tsconfig: "experimentalDecorators": true
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting = "hello";
}
```

### 🟡 Intermediate Example

```typescript
function logClass<T extends { new (...args: any[]): object }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      console.log("constructed", constructor.name);
    }
  };
}

@logClass
class Demo {
  constructor(public n: number) {}
}
```

### 🔴 Expert Example

```typescript
function MethodTimer() {
  return function (
    _target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
  ) {
    const original = descriptor.value;
    if (!original) return;

    descriptor.value = function (this: unknown, ...args: any[]) {
      const start = performance.now();
      try {
        return original.apply(this, args);
      } finally {
        const ms = performance.now() - start;
        console.log(`${String(propertyKey)} took ${ms.toFixed(2)}ms`);
      }
    };
  };
}

class Worker {
  @MethodTimer()
  run(n: number): number {
    let x = 0;
    for (let i = 0; i < n; i++) x += i;
    return x;
  }
}
```

### 🌍 Real-Time Example

```typescript
// import "reflect-metadata"; // required at runtime for Reflect metadata APIs
// Simplified Nest-style pattern (framework handles most wiring in real apps)
const Injectable = (): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata("injectable", true, target);
  };
};

@Injectable()
class OrdersRepository {
  // In Nest, constructor params get injected via metadata + DI container
  constructor(private readonly http: { get: (u: string) => Promise<unknown> }) {}
}
```

**Property, parameter, and factory composition (legacy decorators):**

```typescript
function Column(name: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata("column", name, target, propertyKey);
  };
}

function Inject(_token: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existing: number[] =
      Reflect.getMetadata("inject:indexes", target, propertyKey as string) ?? [];
    existing.push(parameterIndex);
    Reflect.defineMetadata("inject:indexes", existing, target, propertyKey as string);
  };
}

function Audited() {
  return function (
    _target: object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => unknown>,
  ) {
    const orig = descriptor.value;
    if (!orig) return;
    descriptor.value = function (...args: unknown[]) {
      console.log("audit: enter");
      return orig.apply(this, args);
    };
  };
}

function Tagged(tag: string): MethodDecorator {
  return (_target, _key, descriptor) => {
    Reflect.defineMetadata("tag", tag, descriptor.value!);
    return descriptor;
  };
}

class Row {
  @Column("user_id")
  userId = "";

  save(@Inject("DB") _db: unknown): void {
    void _db;
  }
}

class Service {
  @Audited()
  @Tagged("critical") // outer factory runs first; inner decorator wraps closer to the method
  work(): void {
    /* ... */
  }
}
```

---

## 12. Best Practices

- **Composition over inheritance**: prefer small interfaces and delegation (`has-a`) over deep `extends` trees; inheritance is powerful but brittle across package boundaries.
- **When to use `abstract`**: use for shared implementation + enforced overrides in a *known* hierarchy; prefer interfaces for consumer-facing contracts that multiple unrelated classes satisfy.
- **Member initialization**: favor definite values in field initializers or the constructor; avoid `!` unless interfacing with framework lifecycle or external initialization you truly control.
- **Method vs arrow function properties**: ordinary methods are on the prototype (memory efficient); arrow properties capture `this` per instance (use for callbacks); choose deliberately.
- **`private` vs `#`**: use `#` for strong encapsulation and subclass safety; use `private` for simpler compile-time checks and legacy interop.
- **`override` keyword**: enable `noImplicitOverride` to catch base-class renames that silently break subclasses.
- **Static state**: treat static mutable state as global state—initialize carefully in modules, consider dependency injection for testability.
- **Decorators**: isolate framework-specific decorators at the edges of your domain model; keep core business logic decorator-free when possible.

### 🟢 Beginner Example

```typescript
// Composition: EmailSender uses a transport, not extends it
class ConsoleTransport {
  send(body: string) {
    console.log(body);
  }
}

class EmailSender {
  constructor(private transport: ConsoleTransport) {}

  notify(user: string) {
    this.transport.send(`Hello ${user}`);
  }
}
```

### 🟡 Intermediate Example

```typescript
abstract class Repository<T> {
  constructor(protected readonly table: string) {}
  abstract findById(id: string): Promise<T | null>;
}

// Concrete implementations stay small; shared SQL helpers live in abstract base
```

### 🔴 Expert Example

```typescript
class ApiClient {
  constructor(private baseUrl: string) {}

  // Method: shared on prototype
  get(path: string) {
    return fetch(`${this.baseUrl}${path}`);
  }
}

class Component2 {
  // Arrow: stable `this` when passed as callback
  onClick = () => {
    console.log("clicked", this);
  };
}
```

### 🌍 Real-Time Example

```typescript
// Domain service + interface for ports (composition)
interface Clock {
  now(): Date;
}

class SystemClock implements Clock {
  now() {
    return new Date();
  }
}

class OrderService {
  constructor(private clock: Clock) {}

  placeOrder() {
    const placedAt = this.clock.now();
    return { placedAt };
  }
}
```

---

## 13. Common Mistakes to Avoid

- **Using `this` before `super()`** in subclass constructors—TypeScript errors usually catch this; fix by calling `super` first.
- **Assuming `private` is runtime-safe**—it is not; use `#` for real privacy.
- **Forgetting that optional class fields can be `undefined`**—narrow before use.
- **Overusing definite assignment (`!`)**—masks real uninitialized bugs; prefer defaults or constructors.
- **Static methods referencing class type parameters**—not allowed; use static generic methods with their own type params.
- **Decorators without understanding emit**: metadata and legacy experimental decorators differ; align `tsconfig` with your framework.
- **Deep inheritance for reuse**—leads to fragile base class problems; extract behaviors or use composition.
- **Getters with heavy side effects**—surprising for readers; keep getters cheap or name them as methods (`computeX()`).

### 🟢 Beginner Example

```typescript
// Mistake: calling method before fields ready — use constructor body order carefully
class Bad {
  name: string;
  constructor(name: string) {
    this.log(); // may run before assignment if mis-ordered
    this.name = name;
  }
  log() {
    console.log(this.name);
  }
}

// Fix: assign first
class Good {
  name: string;
  constructor(name: string) {
    this.name = name;
    this.log();
  }
  log() {
    console.log(this.name);
  }
}
```

### 🟡 Intermediate Example

```typescript
// Mistake: expecting private to hide from arbitrary objects
class Secret {
  private code = 123;
}
const s = new Secret() as any;
console.log(s.code); // Runtime: accessible — TS private is not enforced at runtime
```

### 🔴 Expert Example

```typescript
// Mistake: returning wrong `this` type from fluent subclass
class BaseFluent {
  setA(_v: number): this {
    return this;
  }
}

class ChildFluent extends BaseFluent {
  setB(_v: string): this {
    return this;
  }
}

const c = new ChildFluent().setA(1).setB("x"); // OK: polymorphic `this`
```

### 🌍 Real-Time Example

```typescript
// Mistake: fat getters hitting network/DB
class Product {
  constructor(public id: string) {}

  // Bad: hidden IO in getter
  get details() {
    // return await fetch(...) // can't even be async getter easily — design smell
    return { id: this.id };
  }
}

// Better: explicit async method
class Product2 {
  constructor(public id: string) {}
  async loadDetails() {
    return { id: this.id };
  }
}
```

---

## Quick Reference

| Topic | Syntax / idea |
|-------|----------------|
| Class declaration | `class Name { }` |
| Class expression | `const C = class { }` |
| Constructor | `constructor(...) { }` |
| Readonly field | `readonly x: T` |
| Definite assignment | `x!: T` |
| Public / protected / private | access modifiers on members |
| True private | `#field` |
| Inheritance | `class D extends B` |
| Super call | `super()` / `super.method()` |
| Abstract | `abstract class`, `abstract method()` |
| Generic class | `class Box<T> { }` |
| Static block | `static { }` |
| Parameter properties | `constructor(public x: number) {}` |
| Decorators | `@dec` (experimental / stage-dependent) |

---

*This note aligns with common TypeScript compiler options (`strict`, `noImplicitOverride` recommended). Verify decorator-related flags against your TypeScript version and framework documentation.*
