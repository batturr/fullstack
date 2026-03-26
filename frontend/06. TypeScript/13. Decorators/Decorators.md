# TypeScript Decorators

Decorators (TC39 stage 3; TypeScript’s **legacy experimental** model with `experimentalDecorators`) attach behavior and metadata via `@expr` on classes, methods, accessors, properties, and parameters—common in NestJS, Angular, and ORMs. This note covers setup, each decorator kind, factories, composition, and `reflect-metadata`.

## 📑 Table of Contents

1. [Decorator Basics](#1-decorator-basics)
2. [Class Decorators](#2-class-decorators)
3. [Method Decorators](#3-method-decorators)
4. [Property Decorators](#4-property-decorators)
5. [Accessor Decorators](#5-accessor-decorators)
6. [Parameter Decorators](#6-parameter-decorators)
7. [Decorator Factories](#7-decorator-factories)
8. [Decorator Composition](#8-decorator-composition)
9. [Reflect Metadata API](#9-reflect-metadata-api)
- [Best Practices](#best-practices)
- [Common Mistakes](#common-mistakes)

## 1. Decorator Basics

**Design-time calls:** decorators run when the class is **defined**, not on each `new`, unless you wrap the constructor/method. **Syntax:** `@Dec` or `@Factory("x")` before the declaration. **Order:** factories evaluate **top → bottom**; returned decorators on the same member run **bottom → top**. **Compiler:** `experimentalDecorators`; optional `emitDecoratorMetadata` + `import "reflect-metadata"` once at entry for `design:*` keys.

```typescript
// tsconfig.json (excerpt)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 🟢 Beginner Example

```typescript
function LogClass(constructor: Function) {
  console.log(`Class defined: ${constructor.name}`);
}
@LogClass
class Greeter {
  greet() { return "hello"; }
}
```

### 🟡 Intermediate Example

```typescript
let definitionCount = 0;

function CountDefinitions(_constructor: Function) {
  definitionCount++;
}

@CountDefinitions
class A {}

@CountDefinitions
class B {}

console.log(definitionCount); // 2 — not tied to instances
```

### 🔴 Expert Example

```typescript
import "reflect-metadata";

function Injectable(_constructor: Function) {
  // Marker decorator; real frameworks read metadata here
}

@Injectable
class HttpClient {
  constructor(private baseUrl: string) {}
}

// With emitDecoratorMetadata, Reflect.getMetadata exists for design:paramtypes, etc.
const paramTypes = Reflect.getMetadata("design:paramtypes", HttpClient);
// [String] — best-effort; erases to Object for interfaces/unions
```

### 🌍 Real-Time Example

```typescript
const IS_PROD = process.env.NODE_ENV === "production";

function ProdOnly(constructor: Function) {
  if (!IS_PROD) {
    console.warn(`[dev] Skipping heavy implementation: ${constructor.name}`);
  }
}

@ProdOnly
class PaymentGateway {
  charge(amount: number) {
    return { ok: true, amount };
  }
}
```

## 2. Class Decorators

**Signature (legacy TS / stage-2 style):**

```typescript
type ClassDecorator = <TFunction extends Function>(
  target: TFunction
) => TFunction | void;
```

Return `void` or a **new constructor**; when replacing, preserve prototype/static shape for `instanceof`.

### 🟢 Beginner Example

```typescript
function Sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@Sealed
class Config {
  static readonly apiVersion = "v1";
}
```

### 🟡 Intermediate Example

```typescript
function Timestamped<T extends { new (...args: any[]): object }>(constructor: T) {
  return class extends constructor {
    static readonly registeredAt = new Date().toISOString();
  };
}

@Timestamped
class Service {}

console.log((Service as typeof Service & { registeredAt: string }).registeredAt);
```

### 🔴 Expert Example

```typescript
function WithSingleton<T extends { new (...args: any[]): object }>(ctor: T) {
  let instance: InstanceType<T>;
  const NewCtor = function (...args: any[]) {
    return (instance ??= new ctor(...args) as InstanceType<T>);
  } as unknown as T;
  NewCtor.prototype = ctor.prototype;
  return Object.assign(NewCtor, ctor);
}
@WithSingleton
class DbConnection {
  constructor(public id: number) { console.log("connecting…"); }
}
console.log(new DbConnection(1) === new DbConnection(2));
```

### 🌍 Real-Time Example

```typescript
const registry = new Map<string, Function>();

function Register(name: string) {
  return function (constructor: Function) {
    registry.set(name, constructor);
  };
}

@Register("UserRepository")
class UserRepository {
  findById(id: string) {
    return { id, name: "Ada" };
  }
}

function resolve<T>(key: string): T {
  const Ctor = registry.get(key);
  if (!Ctor) throw new Error(`Unknown ${key}`);
  return new (Ctor as new () => T)();
}

const repo = resolve<UserRepository>("UserRepository");
```

## 3. Method Decorators

**Signature:**

```typescript
type MethodDecorator = <T>(
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
```

Mutate `descriptor.value` or return a new descriptor; for instance methods `target` is usually `prototype`.

### 🟢 Beginner Example

```typescript
function Deprecated(_: object, key: string | symbol, d: PropertyDescriptor) {
  const orig = d.value as (...a: unknown[]) => unknown;
  d.value = function (this: unknown, ...a: unknown[]) {
    console.warn(`${String(key)} deprecated`);
    return orig.apply(this, a);
  };
}
class Api {
  @Deprecated
  legacyPing() { return "pong"; }
}
```

### 🟡 Intermediate Example

```typescript
function Timed(_: object, key: string | symbol, d: PropertyDescriptor) {
  const m = d.value as (...a: unknown[]) => unknown;
  d.value = function (this: unknown, ...a: unknown[]) {
    const label = `${this?.constructor?.name ?? "?"}.${String(key)}`;
    console.time(label);
    try { return m.apply(this, a); } finally { console.timeEnd(label); }
  };
}
class ReportService {
  @Timed
  build() { return "report"; }
}
```

### 🔴 Expert Example

```typescript
function ProfileAsync(_: object, key: string | symbol, d: PropertyDescriptor) {
  const orig = d.value as (...a: any[]) => Promise<unknown>;
  d.value = async function (this: unknown, ...args: any[]) {
    const t0 = performance.now();
    try {
      return await orig.apply(this, args);
    } catch (e) {
      (e as Error & { method?: string }).method = String(key);
      throw e;
    } finally {
      console.debug(`[async] ${String(key)} ${(performance.now() - t0).toFixed(2)}ms`);
    }
  };
}
class Jobs {
  @ProfileAsync
  async run() {
    await new Promise((r) => setTimeout(r, 10));
    return "done";
  }
}
```

### 🌍 Real-Time Example

```typescript
const routes: { method: string; path: string; handlerKey: string | symbol }[] = [];

function Get(path: string) {
  return function (
    _target: object,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    routes.push({ method: "GET", path, handlerKey: propertyKey });
  };
}

class UserController {
  @Get("/users/:id")
  getById(_id: string) {
    return { id: _id };
  }
}

console.log(routes);
```

## 4. Property Decorators

**Signature:**

```typescript
type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
```

Legacy **property** decorators get `(target, key)` only—often **no descriptor** for class fields; pair with accessors or side maps.

### 🟢 Beginner Example

```typescript
const formatMetadata = new WeakMap<object, Map<string | symbol, string>>();

function Format(mask: string) {
  return function (target: object, propertyKey: string | symbol) {
    let map = formatMetadata.get(target);
    if (!map) {
      map = new Map();
      formatMetadata.set(target, map);
    }
    map.set(propertyKey, mask);
  };
}

class Invoice {
  @Format("currency")
  amount = 0;
}
```

### 🟡 Intermediate Example

```typescript
type Rule = { min?: number; max?: number; required?: boolean };
const validationRules = new WeakMap<Function, Map<string | symbol, Rule>>();

function Validated(rule: Rule) {
  return function (target: object, propertyKey: string | symbol) {
    const ctor = target.constructor as Function;
    let map = validationRules.get(ctor);
    if (!map) {
      map = new Map();
      validationRules.set(ctor, map);
    }
    map.set(propertyKey, rule);
  };
}

class SignupDto {
  @Validated({ required: true, min: 3 })
  username = "";

  @Validated({ min: 8 })
  password = "";
}

function validate(instance: object): string[] {
  const map = validationRules.get(instance.constructor as Function);
  if (!map) return [];
  const errors: string[] = [];
  for (const [key, rule] of map) {
    const value = (instance as Record<string | symbol, unknown>)[key];
    if (rule.required && (value === "" || value == null)) errors.push(`${String(key)} required`);
    if (typeof value === "string" && rule.min && value.length < rule.min) errors.push(`${String(key)} too short`);
  }
  return errors;
}
```

### 🔴 Expert Example

```typescript
const SCHEMA = new WeakMap<Function, Record<string, unknown>>();

function SchemaField(meta: Record<string, unknown>): PropertyDecorator {
  return (target, key) => {
    const C = target.constructor as Function;
    SCHEMA.set(C, { ...(SCHEMA.get(C) ?? {}), [String(key)]: meta });
  };
}

class ProductDto {
  @SchemaField({ kind: "uuid" })
  id = "";
}
```

### 🌍 Real-Time Example

```typescript
type ColumnMeta = { name: string; type: "string" | "number" };
const columns = new WeakMap<Function, ColumnMeta[]>();

function Column(meta: ColumnMeta) {
  return function (target: object, propertyKey: string | symbol) {
    const ctor = target.constructor as Function;
    const list = columns.get(ctor) ?? [];
    list.push({ ...meta, name: meta.name || String(propertyKey) });
    columns.set(ctor, list);
  };
}

class UserRow {
  @Column({ name: "user_id", type: "string" })
  id = "";

  @Column({ name: "age", type: "number" })
  age = 0;
}
```

## 5. Accessor Decorators

Same triple as method decorators; decorate `get` and/or `set` separately if needed.

### 🟢 Beginner Example

```typescript
function LogAccess(_: object, __: string | symbol, d: PropertyDescriptor) {
  const g = d.get;
  if (!g) return;
  d.get = function (this: object) {
    console.log("read");
    return g.call(this);
  };
}
class Box {
  private _v = 0;
  @LogAccess
  get value() { return this._v; }
  set value(v: number) { this._v = v; }
}
```

### 🟡 Intermediate Example

```typescript
function Clamp(min: number, max: number) {
  return function (
    _target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalSet = descriptor.set;
    if (!originalSet) return;
    descriptor.set = function (this: object, v: number) {
      const next = Math.min(max, Math.max(min, v));
      originalSet.call(this, next);
    };
  };
}

class Volume {
  private _level = 50;

  @Clamp(0, 100)
  set level(v: number) {
    this._level = v;
  }
  get level() {
    return this._level;
  }
}
```

### 🔴 Expert Example

```typescript
function MemoizeBy(keyFn: (self: any) => unknown) {
  return function (
    _target: object,
    prop: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const get = descriptor.get;
    if (!get) return;
    const cache = new WeakMap<object, { dep: unknown; val: unknown }>();

    descriptor.get = function (this: object) {
      const dep = keyFn(this);
      let slot = cache.get(this);
      if (!slot || slot.dep !== dep) {
        slot = { dep, val: get.call(this) };
        cache.set(this, slot);
      }
      return slot.val;
    };
  };
}

class PricedCart {
  items: { price: number }[] = [];

  @MemoizeBy((self: PricedCart) => self.items.length)
  get total() {
    return this.items.reduce((s, i) => s + i.price, 0);
  }
}
```

### 🌍 Real-Time Example

```typescript
function Masked() {
  return function (
    _target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const get = descriptor.get;
    if (!get) return;
    descriptor.get = function (this: object) {
      const raw = get.call(this) as string;
      return raw.replace(/.(?=.{4})/g, "*");
    };
  };
}

class Account {
  private _pan = "1234567812345678";

  @Masked()
  get panDisplay() {
    return this._pan;
  }
}
```

## 6. Parameter Decorators

**Signature:**

```typescript
type ParameterDecorator = (
  target: Object,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;
```

`propertyKey` is `undefined` on the constructor. Common for DI (`@Inject`) and pipes.

### 🟢 Beginner Example

```typescript
const paramMarkers = new WeakMap<Function, Map<number, string>>();
function PathParam(name: string) {
  return (target: object, _k: string | symbol | undefined, i: number) => {
    const ctor =
      _k === undefined ? (target as Function) : (target as { constructor: Function }).constructor;
    const map = paramMarkers.get(ctor) ?? new Map<number, string>();
    map.set(i, name);
    paramMarkers.set(ctor, map);
  };
}
class Handler {
  getUser(@PathParam("id") id: string) { return id; }
}
```

### 🟡 Intermediate Example

```typescript
const INJECTIONS = new WeakMap<Function, (string | symbol)[]>();
function Inject(token: string | symbol) {
  return (target: object, _k: undefined, i: number) => {
    const ctor = target as unknown as Function;
    const arr = INJECTIONS.get(ctor) ?? [];
    arr[i] = token;
    INJECTIONS.set(ctor, arr);
  };
}
const T = { Logger: Symbol("Logger") };
class Logger { log(m: string) { console.log(m); } }
const providers = new Map([[T.Logger, new Logger()]]);
class AppService {
  constructor(@Inject(T.Logger) private log: Logger) {}
  run() { this.log.log("ok"); }
}
function create<C>(Ctor: new (...a: any[]) => C) {
  const tokens = INJECTIONS.get(Ctor) ?? [];
  return new Ctor(...tokens.map((t) => providers.get(t)));
}
create(AppService).run();
```

### 🔴 Expert Example

```typescript
import "reflect-metadata";
const PARAM_TOKENS = Symbol("param:tokens");
function TypedInject(token?: string | symbol) {
  return (target: object, _k: undefined, i: number) => {
    const ctor = target as unknown as Function;
    const row = Reflect.getMetadata(PARAM_TOKENS, ctor) ?? [];
    row[i] = token;
    Reflect.defineMetadata(PARAM_TOKENS, row, ctor);
  };
}
class HttpClient {}
class UserService {
  constructor(@TypedInject() public http: HttpClient) {}
}
// Resolve token i: (Reflect.getMetadata(PARAM_TOKENS, UserService)[i] ?? Reflect.getMetadata("design:paramtypes", UserService)[i])
```

### 🌍 Real-Time Example

```typescript
const SCHEMAS = new WeakMap<object, Map<number, (v: unknown) => string[]>>();

function ValidateWith(parse: (v: unknown) => string[]) {
  return function (target: object, key: string | symbol, index: number) {
    const map = SCHEMAS.get(target) ?? new Map();
    map.set(index, parse);
    SCHEMAS.set(target, map);
  };
}

function isEmail(v: unknown) {
  return typeof v === "string" && v.includes("@") ? [] : ["bad email"];
}

class AuthController {
  login(@ValidateWith(isEmail) email: string) {
    return { email };
  }
}
```

## 7. Decorator Factories

Factories return the real decorator: factories **top → bottom**, decorators **bottom → top**.

### 🟢 Beginner Example

```typescript
function Tag(label: string) {
  console.log(`factory ${label}`);
  return function (constructor: Function) {
    console.log(`decorator ${label} on ${constructor.name}`);
  };
}

@Tag("a")
@Tag("b")
class Demo {}
// factory a, factory b, decorator b, decorator a
```

### 🟡 Intermediate Example

```typescript
function Retry(n: number) {
  return (_: object, __: string | symbol, d: PropertyDescriptor) => {
    const fn = d.value as (...a: any[]) => Promise<unknown>;
    d.value = async function (this: unknown, ...args: any[]) {
      let last: unknown;
      for (let i = 0; i <= n; i++) {
        try { return await fn.apply(this, args); } catch (e) { last = e; }
      }
      throw last;
    };
  };
}
class Unstable {
  @Retry(2)
  async call() {
    if (Math.random() < 0.9) throw new Error("fail");
    return "ok";
  }
}
```

### 🔴 Expert Example

```typescript
const policyFor = new WeakMap<Function, { roles: string[] }>();
function Roles(...roles: string[]) {
  return (target: object, key?: string | symbol) => {
    const ctor = (key ? target.constructor : target) as Function;
    const prev = policyFor.get(ctor)?.roles ?? [];
    policyFor.set(ctor, { roles: [...prev, ...roles] });
  };
}
@Roles("admin")
class AdminApi {
  @Roles("billing")
  refund() { return "refunded"; }
}
```

### 🌍 Real-Time Example

```typescript
function FeatureFlag(flag: string, fb?: () => unknown) {
  const on = process.env[flag] === "1";
  return (_: object, __: string | symbol, d: PropertyDescriptor) => {
    const orig = d.value as (...a: unknown[]) => unknown;
    d.value = function (this: unknown, ...a: unknown[]) {
      return on ? orig.apply(this, a) : fb?.();
    };
  };
}
class Search {
  @FeatureFlag("AI_ASSIST", () => ({ mode: "classic" }))
  assistQuery(q: string) { return { mode: "ai", q }; }
}
```

## 8. Decorator Composition

Stacking repeats the factory/decorate order rules.

### 🟢 Beginner Example

```typescript
function A() {
  console.log("A factory");
  return () => console.log("A decorate");
}
function B() {
  console.log("B factory");
  return () => console.log("B decorate");
}

@A()
@B()
class C {}
// A factory, B factory, B decorate, A decorate
```

### 🟡 Intermediate Example

```typescript
function Log(label: string) {
  return function (_: object, __: string | symbol, d: PropertyDescriptor) {
    const m = d.value;
    d.value = function (this: unknown, ...args: unknown[]) {
      console.log(`[${label}] in`);
      const r = m.apply(this, args);
      console.log(`[${label}] out`);
      return r;
    };
  };
}

class Ops {
  @Log("outer")
  @Log("inner")
  work() {
    return 1;
  }
}
```

### 🔴 Expert Example

```typescript
import "reflect-metadata";

function Use(...fns: MethodDecorator[]) {
  return (target: object, key: string | symbol, d: PropertyDescriptor) => {
    for (const dec of fns) Object.assign(d, dec(target, key, d) ?? d);
  };
}

function meta(k: string, v: string): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(k, v, target, propertyKey);
  };
}

class Gateway {
  @Use(meta("role", "public"))
  ping() {
    return "pong";
  }
}
```

### 🌍 Real-Time Example

```typescript
function Guard(ok: boolean) {
  return (_: object, __: string | symbol, d: PropertyDescriptor) => {
    const m = d.value as (...a: unknown[]) => unknown;
    d.value = function (this: unknown, ...a: unknown[]) {
      if (!ok) throw new Error("Forbidden");
      return m.apply(this, a);
    };
  };
}
function Trace(tag: string) {
  return (_: object, __: string | symbol, d: PropertyDescriptor) => {
    const m = d.value as (...a: unknown[]) => unknown;
    d.value = function (this: unknown, ...a: unknown[]) {
      console.log(`${tag} before`);
      const r = m.apply(this, a);
      console.log(`${tag} after`);
      return r;
    };
  };
}
class OrderController {
  @Guard(true)
  @Trace("tx")
  place() { return { id: "o1" }; }
}
```

## 9. Reflect Metadata API

`reflect-metadata` polyfills `Reflect.defineMetadata` / `getMetadata`. With `emitDecoratorMetadata`, TS emits **`design:type`**, **`design:paramtypes`**, **`design:returntype`**. Prefer `Symbol` or namespaced strings for your own keys.

### 🟢 Beginner Example

```typescript
import "reflect-metadata";

const ROLE_KEY = "roles";

function Role(...roles: string[]) {
  return function (target: object) {
    Reflect.defineMetadata(ROLE_KEY, roles, target);
  };
}

@Role("user", "editor")
class Profile {}

console.log(Reflect.getMetadata(ROLE_KEY, Profile)); // ['user','editor']
```

### 🟡 Intermediate Example

```typescript
import "reflect-metadata";

const CACHE_TTL = Symbol("cache:ttl");

function CacheTtl(ms: number): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(CACHE_TTL, ms, target, propertyKey);
  };
}

class Quotes {
  @CacheTtl(60_000)
  getRandom() { return Math.random(); }
}
Reflect.getMetadata(CACHE_TTL, Quotes.prototype, "getRandom"); // 60000
```

### 🔴 Expert Example

```typescript
import "reflect-metadata";

function serializable(_: unknown, __: string, d: PropertyDescriptor) {
  return d;
}
class Point {
  constructor(public x: number, public y: number) {}
}
class ShapeDto {
  @serializable
  origin!: Point;
}
const T = Reflect.getMetadata("design:type", ShapeDto.prototype, "origin");
console.log(T === Point); // true when emitDecoratorMetadata is on
```

### 🌍 Real-Time Example

```typescript
import "reflect-metadata";
type MW = (req: unknown, next: () => unknown) => unknown;
const MIDDLEWARES = Symbol("http:mws");
function UseMiddleware(...mw: MW[]) {
  return (target: object) => {
    const prev = (Reflect.getMetadata(MIDDLEWARES, target) as MW[] | undefined) ?? [];
    Reflect.defineMetadata(MIDDLEWARES, [...prev, ...mw], target);
  };
}
const auth: MW = (req, next) => { console.log("auth", req); return next(); };
@UseMiddleware(auth)
class Server {}
(Reflect.getMetadata(MIDDLEWARES, Server) as MW[]).length;
```

## Best Practices

1. Document `experimentalDecorators` and only enable `emitDecoratorMetadata` when you need `design:*` at runtime.
2. Prefer **decorator factories** for configuration; keep decorator bodies small and delegate to plain functions.
3. Wrap methods with **`function`**, not arrows, when `this` must be the receiver.
4. Store decorator state in **`WeakMap`** / **Symbol** keys to avoid prototype pollution and key clashes with `design:*`.
5. **Test** stacked decorator order; **import `reflect-metadata` once** at app entry when metadata emission is on.
6. Track **TypeScript / TC39** changes—legacy experimental decorators differ from the standard decorators track.

## Common Mistakes

1. Assuming decorators run on **every `new`** instead of mostly at **class definition** time.
2. Expecting a **property descriptor** from legacy **field** decorators—use accessors or method wrappers instead.
3. Replacing a class constructor without preserving **prototype** / **static** members correctly.
4. Using **`design:paramtypes`** or `design:type` for **security**; they are lossy hints only.
5. Omitting **`reflect-metadata`** while calling `Reflect.getMetadata`.
6. Misreading **composition order** (factories top→bottom, decorators bottom→top on the same member).

**References:** [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html), [TC39 proposal](https://github.com/tc39/proposal-decorators), [`reflect-metadata`](https://www.npmjs.com/package/reflect-metadata).
