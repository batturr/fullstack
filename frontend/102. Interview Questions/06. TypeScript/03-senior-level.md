# TypeScript Interview Questions — Senior (7+ Years Experience)

100 advanced questions with detailed answers for senior/staff-level TypeScript engineers covering type-system internals, architecture, performance, compiler design, and complex patterns.

---

## 1. How does TypeScript's structural type system differ from nominal typing, and what are the practical implications?

TypeScript uses structural typing where compatibility is determined by the shape (properties and methods) of types rather than their declared name or lineage. Two independently defined types are compatible if their structures match. This contrasts with nominal typing (Java, C#, Rust) where types must share an explicit declaration hierarchy. The practical implications are: (1) easier integration with JavaScript's duck-typed ecosystem, (2) types from different libraries can be compatible without shared declarations, (3) structural typing makes patterns like dependency injection natural since any object matching an interface is accepted, and (4) it introduces the challenge of accidental compatibility—two unrelated concepts with the same shape (e.g., `UserId` and `OrderId` both being `string`) are interchangeable, which is solved through branded/opaque types.

```typescript
// Accidental compatibility — structural typing doesn't prevent this
type UserId = string;
type OrderId = string;

function getUser(id: UserId) { /* ... */ }
getUser("order-123" as OrderId); // ✔ — no error, both are string

// Solution: branded types for nominal simulation
type BrandedUserId = string & { readonly __brand: unique symbol };
type BrandedOrderId = string & { readonly __brand: unique symbol };

function getUserSafe(id: BrandedUserId) { /* ... */ }
// getUserSafe("order-123" as BrandedOrderId); // ✘ Error
```

---

## 2. Explain TypeScript's type inference algorithm and where it breaks down.

TypeScript uses bidirectional type inference: it flows types both "downward" (from expected types to expressions, called contextual typing) and "upward" (from expressions to declarations). The algorithm works through several phases: (1) collect type constraints from annotations, assignments, and control flow, (2) resolve generic type parameters by unifying inference sites, (3) apply contextual typing from expected positions (return types, parameter types of callbacks). It breaks down in several scenarios: deeply nested generics with multiple inference sites, where TypeScript may infer `unknown` instead of the expected type; circular inference where type depends on itself; complex mapped/conditional types that exceed recursion limits; and variance inference where co-variant and contra-variant positions create `never` types. The `NoInfer` utility (5.4) and explicit type arguments are tools to guide inference when it fails.

```typescript
// Inference breaks: multiple inference sites for same type variable
declare function broken<T>(items: T[], transform: (item: T) => T): T[];

// T is inferred from both `items` and `transform` — may conflict
broken([1, 2, 3], (x) => x.toString());
// Without annotation, this may fail or produce `never`

// Fix: use NoInfer or separate type params
declare function fixed<T>(items: T[], transform: (item: NoInfer<T>) => NoInfer<T>): T[];
```

---

## 3. What is the role of the TypeScript compiler's checker phase, and how does it interact with the emitter?

The TypeScript compiler has four main phases: (1) **Scanner** tokenizes source text into a stream of tokens, (2) **Parser** builds an Abstract Syntax Tree (AST) from tokens, (3) **Binder** creates symbols and establishes scopes, connecting declarations to their symbols, (4) **Checker** performs type checking—the most complex phase, responsible for type inference, structural compatibility checks, control flow analysis, overload resolution, and generic instantiation, and (5) **Emitter** generates JavaScript output and declaration files. The checker and emitter are decoupled: the emitter only needs the AST and does not depend on type information (which is why tools like Babel and SWC can transpile TypeScript without type checking). This architecture enables `transpileOnly` mode where checking is skipped for faster builds in development, while CI runs the full checker.

---

## 4. How do you implement type-safe route parameter parsing using template literal types?

Template literal types with recursive conditional types can parse URL patterns at compile time, extracting parameter names and building typed parameter objects automatically.

```typescript
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type ParamRecord<T extends string> = {
  [K in ExtractParams<T>]: string;
};

type Params = ParamRecord<"/users/:userId/posts/:postId/comments/:commentId">;
// { userId: string; postId: string; commentId: string }

function createRouter<const Routes extends readonly string[]>(
  routes: Routes
) {
  return {
    navigate<R extends Routes[number]>(
      route: R,
      params: ParamRecord<R>
    ): string {
      return Object.entries(params).reduce(
        (path, [key, value]) => path.replace(`:${key}`, value as string),
        route as string
      );
    }
  };
}

const router = createRouter([
  "/users/:userId",
  "/posts/:postId/comments/:commentId"
] as const);

router.navigate("/users/:userId", { userId: "123" }); // ✔
// router.navigate("/users/:userId", { postId: "456" }); // ✘
```

---

## 5. How does control flow narrowing work at the implementation level, and what are its limitations?

TypeScript's control flow analysis (CFA) builds a control flow graph (CFG) of the program. At each node, it tracks a "type facts" set—a mapping of variables to their narrowed types. Narrowing occurs through: `typeof` checks, `instanceof`, `in` operator, equality (`===`/`!==`), truthiness, discriminant property checks, type predicate functions, and assertion functions. The CFA merges facts at join points (after if/else, try/catch). Limitations include: (1) CFA does not cross function boundaries—closures lose narrowing because the variable may change between the narrowing check and the closure's execution, (2) CFA cannot narrow through indirect patterns like storing a type guard result in a variable and checking it later (though TypeScript 5.5 improved this with inferred type predicates), (3) array methods like `.filter()` don't narrow without explicit type predicates, and (4) CFA resets on assignment, so `value = otherValue` drops all narrowing.

```typescript
// Limitation: narrowing lost in closure
function example(x: string | number) {
  if (typeof x === "string") {
    setTimeout(() => {
      // x is string | number here — narrowing lost
      // because x could be reassigned before timeout fires
    });
  }
}

// TypeScript 5.5: inferred type predicates
const strings = ["a", null, "b", undefined].filter(
  (x): x is string => x != null
);
// strings: string[]
```

---

## 6. What is the difference between `Declaration Space` and `Value Space` in TypeScript?

TypeScript has three declaration spaces: **Value space** (variables, functions, classes, enum members—things that exist at runtime), **Type space** (interfaces, type aliases, type parameters—things that exist only at compile time), and **Namespace space** (namespaces). Some declarations occupy multiple spaces: `class` occupies both value and type space (the constructor function and the instance type), `enum` occupies value and type space, `namespace` can merge with functions or classes. Understanding this is crucial for: (1) knowing what `typeof ClassName` gives you (the constructor type, not the instance type), (2) understanding why `import type` only imports from the type space, and (3) comprehending declaration merging rules.

```typescript
class Foo { x = 1; }

type A = Foo;          // type space — instance type { x: number }
type B = typeof Foo;   // type space — constructor type: new () => Foo
const f: A = new Foo(); // value space — creating instance

// interface + variable with same name — different spaces, no conflict
interface Config { host: string }
const Config = { host: "localhost" };

type C = Config;       // the interface
const c = Config;      // the variable
```

---

## 7. How do you design a type-safe, extensible plugin system with dependency resolution?

A production plugin system needs typed hooks, dependency ordering, and type-safe context augmentation where each plugin can extend the shared context.

```typescript
interface PluginContext {
  config: Record<string, unknown>;
}

interface PluginHooks<TContext extends PluginContext> {
  onInit?(ctx: TContext): void | Promise<void>;
  onReady?(ctx: TContext): void | Promise<void>;
  onDestroy?(ctx: TContext): void | Promise<void>;
}

interface PluginDefinition<
  TName extends string,
  TContext extends PluginContext,
  TProvides extends Record<string, unknown> = {}
> extends PluginHooks<TContext & TProvides> {
  name: TName;
  dependencies?: string[];
  provide?: (ctx: TContext) => TProvides;
}

class PluginSystem<TContext extends PluginContext = PluginContext> {
  private plugins: PluginDefinition<string, any, any>[] = [];

  register<TName extends string, TProvides extends Record<string, unknown>>(
    plugin: PluginDefinition<TName, TContext, TProvides>
  ): PluginSystem<TContext & TProvides> {
    this.plugins.push(plugin);
    return this as unknown as PluginSystem<TContext & TProvides>;
  }

  async boot(initialContext: TContext): Promise<TContext> {
    let ctx = { ...initialContext };
    const sorted = this.topologicalSort();

    for (const plugin of sorted) {
      if (plugin.provide) {
        Object.assign(ctx, plugin.provide(ctx));
      }
      await plugin.onInit?.(ctx);
    }

    for (const plugin of sorted) {
      await plugin.onReady?.(ctx);
    }

    return ctx as TContext;
  }

  private topologicalSort() {
    // Kahn's algorithm for dependency resolution
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const pluginMap = new Map(this.plugins.map(p => [p.name, p]));

    for (const p of this.plugins) {
      graph.set(p.name, []);
      inDegree.set(p.name, 0);
    }

    for (const p of this.plugins) {
      for (const dep of p.dependencies ?? []) {
        graph.get(dep)?.push(p.name);
        inDegree.set(p.name, (inDegree.get(p.name) ?? 0) + 1);
      }
    }

    const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([n]) => n);
    const result: typeof this.plugins = [];

    while (queue.length > 0) {
      const name = queue.shift()!;
      result.push(pluginMap.get(name)!);
      for (const neighbor of graph.get(name) ?? []) {
        const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    if (result.length !== this.plugins.length) {
      throw new Error("Circular dependency detected in plugins");
    }
    return result;
  }
}
```

---

## 8. What are the performance implications of complex TypeScript types, and how do you diagnose slow compilation?

Complex types (deeply recursive conditional types, large union distributions, mapped types over massive interfaces) can exponentially increase compilation time. TypeScript's type checker must evaluate every branch of conditional types, distribute over every union member, and instantiate generics for each unique combination. Diagnosis tools include: (1) `tsc --generateTrace ./trace` to produce Chrome DevTools-compatible trace files showing where time is spent, (2) `tsc --extendedDiagnostics` for high-level timing, (3) `@typescript/analyze-trace` to identify the slowest type instantiations, and (4) the TypeScript Playground's "Show Emit" to see expanded types. Mitigation strategies include: caching intermediate types with type aliases (TypeScript caches named types), using `interface` over `type` for object types (interfaces are cached by name), limiting recursion depth with counter parameters, avoiding distributing conditional types over large unions, and preferring simpler overloads over complex conditional return types.

```typescript
// Slow: recursive with large union distribution
type Slow<T> = T extends infer U ? (U extends string ? `prefix_${U}` : U) : never;

// Fast: cached via interface and bounded recursion
type Fast<T, Depth extends number[] = []> =
  Depth["length"] extends 10 ? T :
  T extends object ? { [K in keyof T]: Fast<T[K], [...Depth, 0]> } : T;
```

---

## 9. How do you implement type-level arithmetic in TypeScript?

TypeScript's type system is Turing-complete, allowing arithmetic through tuple length manipulation. You represent numbers as tuples and use tuple operations for addition, subtraction, comparison, and more.

```typescript
type BuildTuple<N extends number, T extends unknown[] = []> =
  T["length"] extends N ? T : BuildTuple<N, [...T, unknown]>;

type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"] & number;

type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
    ? Rest["length"] & number
    : never;

type LessThan<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer _] ? false : true;

type Sum = Add<3, 4>;         // 7
type Diff = Subtract<10, 3>;  // 7
type IsLess = LessThan<3, 5>; // true
```

---

## 10. Explain TypeScript's module resolution algorithm in depth for `node16`/`nodenext`.

Under `node16`/`nodenext`, TypeScript mirrors Node.js's dual ESM/CJS resolution. Whether a file is ESM or CJS depends on: (1) `.mts`/`.cts` extensions force ESM/CJS respectively, (2) `.ts` files follow the nearest `package.json`'s `"type"` field (`"module"` = ESM, `"commonjs"` or absent = CJS). For ESM resolution: relative imports must include file extensions (`.js` for `.ts` files), bare specifiers use `package.json` `exports` field with condition matching (`import` condition for ESM, `require` for CJS), `index.js` is not auto-resolved. For CJS resolution: extensions are optional, `index.js` is auto-resolved, `main` field in `package.json` is used. The `exports` field takes precedence over `main`/`types` when present. TypeScript resolves `.js` extensions in imports to the corresponding `.ts` source file during compilation.

```json
{
  "name": "my-lib",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

---

## 11. How do you implement a type-safe ORM query builder with TypeScript?

A type-safe query builder uses the schema definition to enforce valid column names, correct value types, and proper join relationships at compile time.

```typescript
interface Schema {
  users: {
    id: number;
    name: string;
    email: string;
    departmentId: number;
  };
  departments: {
    id: number;
    name: string;
    budget: number;
  };
}

type TableName = keyof Schema;
type ColumnName<T extends TableName> = keyof Schema[T] & string;
type ColumnType<T extends TableName, C extends ColumnName<T>> = Schema[T][C];

class TypedQuery<T extends TableName, Selected = Schema[T]> {
  private _table: T;
  private _wheres: string[] = [];
  private _selected: string[] = [];

  constructor(table: T) {
    this._table = table;
  }

  select<C extends ColumnName<T>[]>(
    ...columns: C
  ): TypedQuery<T, Pick<Schema[T], C[number]>> {
    this._selected = columns;
    return this as any;
  }

  where<C extends ColumnName<T>>(
    column: C,
    op: "=" | ">" | "<" | ">=" | "<=" | "!=",
    value: ColumnType<T, C>
  ): this {
    this._wheres.push(`${column} ${op} ${JSON.stringify(value)}`);
    return this;
  }

  async execute(): Promise<Selected[]> {
    const cols = this._selected.length ? this._selected.join(", ") : "*";
    const where = this._wheres.length ? ` WHERE ${this._wheres.join(" AND ")}` : "";
    const sql = `SELECT ${cols} FROM ${this._table}${where}`;
    console.log(sql);
    return [] as Selected[];
  }
}

function from<T extends TableName>(table: T) {
  return new TypedQuery(table);
}

// Usage
const result = await from("users")
  .select("name", "email")
  .where("departmentId", "=", 5)
  .execute();
// result: Pick<Schema["users"], "name" | "email">[]
// result[0].name  ✔
// result[0].id    ✘ — not selected
```

---

## 12. What are the internals of TypeScript's generic instantiation cache?

When TypeScript encounters a generic type like `Array<string>`, it creates an instantiation by substituting the type parameter. To avoid recomputation, the checker maintains an instantiation cache keyed by the generic type + substituted type arguments. Named types (interfaces) are cached more efficiently than structural/anonymous types. This is why `interface` is generally faster than `type` for object shapes in large codebases—the cache hit rate is higher. Excessive unique instantiations (e.g., generics parameterized by large unions or deeply nested literal types) can blow up memory and compilation time. Understanding this helps when profiling: if `generateTrace` shows time spent in `getTypeOfSymbol` or `getRelationCacheSizes`, excessive instantiation is likely the cause.

---

## 13. How do you implement the Visitor pattern with full exhaustiveness checking?

The Visitor pattern combined with discriminated unions provides double dispatch with compile-time exhaustiveness guarantees.

```typescript
interface ASTNode {
  accept<R>(visitor: ASTVisitor<R>): R;
}

class NumberLiteral implements ASTNode {
  readonly kind = "NumberLiteral" as const;
  constructor(public value: number) {}
  accept<R>(visitor: ASTVisitor<R>): R { return visitor.visitNumber(this); }
}

class StringLiteral implements ASTNode {
  readonly kind = "StringLiteral" as const;
  constructor(public value: string) {}
  accept<R>(visitor: ASTVisitor<R>): R { return visitor.visitString(this); }
}

class BinaryExpr implements ASTNode {
  readonly kind = "BinaryExpr" as const;
  constructor(public left: ASTNode, public op: string, public right: ASTNode) {}
  accept<R>(visitor: ASTVisitor<R>): R { return visitor.visitBinary(this); }
}

interface ASTVisitor<R> {
  visitNumber(node: NumberLiteral): R;
  visitString(node: StringLiteral): R;
  visitBinary(node: BinaryExpr): R;
}

class Evaluator implements ASTVisitor<number | string> {
  visitNumber(node: NumberLiteral) { return node.value; }
  visitString(node: StringLiteral) { return node.value; }
  visitBinary(node: BinaryExpr): number | string {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    if (typeof left === "number" && typeof right === "number") {
      switch (node.op) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        default: throw new Error(`Unknown op: ${node.op}`);
      }
    }
    return `${left}${right}`;
  }
}
```

---

## 14. How does TypeScript handle declaration emit and what are its constraints?

Declaration emit (`declaration: true`) generates `.d.ts` files from `.ts` sources. The emitter must produce valid declaration files that contain only type information—no implementation code. Constraints include: (1) all public API types must be expressible without implementation details, (2) `isolatedDeclarations` (TypeScript 5.5) requires explicit return type annotations on exported functions to enable parallel declaration emit, (3) private/protected class members are emitted but with visibility markers, (4) `const enum` members are inlined in declarations when `preserveConstEnums` is false, (5) `declaration` requires `declarationDir` or `outDir`, and (6) complex inferred types may produce extremely verbose declarations, impacting downstream compile time. The `stripInternal` option removes `@internal`-tagged members from declarations.

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./types",
    "declarationMap": true,
    "stripInternal": true,
    "isolatedDeclarations": true
  }
}
```

---

## 15. What is the `isolatedDeclarations` flag and why was it introduced?

`isolatedDeclarations` (TypeScript 5.5) requires that all exported declarations have explicit enough type annotations for a tool to generate `.d.ts` files without running the full type checker. This enables parallel declaration emit by tools like `oxc`, `swc`, and build systems that process files independently. Without it, generating declarations requires cross-file type inference. With it, each file is self-contained for declaration purposes. In practice, you must annotate return types of exported functions, exported `const` declarations with complex expressions, and class method return types.

```typescript
// ✘ Error with isolatedDeclarations — inferred return type not explicit
export function getConfig() {
  return { host: "localhost", port: 3000 };
}

// ✔ Explicit return type
export function getConfig(): { host: string; port: number } {
  return { host: "localhost", port: 3000 };
}
```

---

## 16. How do you design type-safe API clients with automatic request/response typing?

A type-safe API client maps route definitions to their request/response types, providing compile-time validation for every API call.

```typescript
interface ApiRoutes {
  "GET /users": { response: User[]; query: { page?: number; limit?: number } };
  "GET /users/:id": { response: User; params: { id: string } };
  "POST /users": { response: User; body: CreateUserDto };
  "PUT /users/:id": { response: User; params: { id: string }; body: UpdateUserDto };
  "DELETE /users/:id": { response: void; params: { id: string } };
}

interface User { id: string; name: string; email: string; }
interface CreateUserDto { name: string; email: string; }
interface UpdateUserDto { name?: string; email?: string; }

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ExtractMethod<R extends string> = R extends `${infer M} ${string}` ? M : never;
type ExtractPath<R extends string> = R extends `${string} ${infer P}` ? P : never;

type RouteConfig<R extends keyof ApiRoutes> =
  ApiRoutes[R] extends { params: infer P; body: infer B; query: infer Q }
    ? { params: P; body: B; query: Q }
    : ApiRoutes[R] extends { params: infer P; body: infer B }
      ? { params: P; body: B }
      : ApiRoutes[R] extends { params: infer P; query: infer Q }
        ? { params: P; query: Q }
        : ApiRoutes[R] extends { params: infer P }
          ? { params: P }
          : ApiRoutes[R] extends { body: infer B }
            ? { body: B }
            : ApiRoutes[R] extends { query: infer Q }
              ? { query: Q }
              : {};

type ResponseType<R extends keyof ApiRoutes> = ApiRoutes[R]["response"];

class ApiClient {
  async request<R extends keyof ApiRoutes>(
    route: R,
    ...args: keyof RouteConfig<R> extends never ? [] : [config: RouteConfig<R>]
  ): Promise<ResponseType<R>> {
    // Implementation: build URL, attach body/query/params, fetch
    return {} as ResponseType<R>;
  }
}

const api = new ApiClient();
const users = await api.request("GET /users", { query: { page: 1 } });
// users: User[]
const user = await api.request("GET /users/:id", { params: { id: "123" } });
// user: User
```

---

## 17. Explain how TypeScript's excess property checking differs from assignability.

Assignability in TypeScript is structural: `{a: 1, b: 2}` is assignable to `{a: number}` because it has all required properties plus extras. Excess property checking (EPC) is a special, stricter check that only applies to fresh object literals at their creation site. EPC flags properties that don't exist in the target type, catching typos and unintended fields. EPC does not apply when: (1) the object is assigned via a variable, (2) the object is cast with `as`, (3) the target has an index signature, or (4) the type is intersected with a type that has an index signature. Understanding this distinction is important for API design—if you want to reject unknown properties at runtime, you need runtime validation (Zod, io-ts) because EPC is compile-time only and easily bypassed.

```typescript
interface Config { host: string; port: number; }

// EPC applies — fresh literal
// const c: Config = { host: "x", port: 3000, debug: true }; // ✘

// EPC does NOT apply — via variable
const data = { host: "x", port: 3000, debug: true };
const c2: Config = data; // ✔ — extra properties ignored
```

---

## 18. How do you implement type-safe dependency injection using TypeScript decorators and metadata?

DI containers use decorators to mark injectable classes and `reflect-metadata` to capture constructor parameter types, enabling automatic resolution.

```typescript
import "reflect-metadata";

const INJECTABLE_KEY = Symbol("injectable");

function Injectable(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(INJECTABLE_KEY, true, target);
  };
}

function Inject(token: symbol): ParameterDecorator {
  return (target, _, paramIndex) => {
    const existing = Reflect.getMetadata("custom:inject", target) || [];
    existing.push({ index: paramIndex, token });
    Reflect.defineMetadata("custom:inject", existing, target);
  };
}

class Container {
  private bindings = new Map<symbol | Function, () => any>();

  register<T>(token: symbol | (new (...args: any[]) => T), factory: () => T): void {
    this.bindings.set(token, factory);
  }

  resolve<T>(token: symbol | (new (...args: any[]) => T)): T {
    const factory = this.bindings.get(token);
    if (!factory) throw new Error(`No binding for ${String(token)}`);
    return factory();
  }

  autoResolve<T>(target: new (...args: any[]) => T): T {
    const paramTypes = Reflect.getMetadata("design:paramtypes", target) || [];
    const customInjects = Reflect.getMetadata("custom:inject", target) || [];

    const args = paramTypes.map((type: Function, index: number) => {
      const custom = customInjects.find((i: any) => i.index === index);
      return custom ? this.resolve(custom.token) : this.resolve(type);
    });

    return new target(...args);
  }
}
```

---

## 19. What are the trade-offs between TypeScript's `enum`, `const enum`, union types, and `as const` objects?

| Feature | Runtime Cost | Tree-Shakeable | Reverse Mapping | Iterable | Type Narrowing |
|---|---|---|---|---|---|
| `enum` | Object emitted | No | Numeric only | `Object.values` | Switch/guard |
| `const enum` | Zero (inlined) | N/A | No | No | Switch/guard |
| Union types | Zero (erased) | N/A | No | No | Built-in |
| `as const` object | Object emitted | Yes | Manual | `Object.values` | Via typeof |

For modern codebases: prefer union types for simple sets of constants, `as const` objects when you need both runtime iteration and type safety, `enum` when interfacing with APIs expecting numeric codes, and avoid `const enum` in libraries (since `isolatedModules` and bundlers don't support them well). Union types have the best IDE support and compose naturally with other type features.

---

## 20. How does TypeScript's relationship cache work, and how does it affect performance?

The type checker maintains a relationship cache that memoizes the results of type compatibility checks (assignability, subtype, identity). Each check result is stored keyed by the pair of types being compared. The cache has three possible states: `True`, `False`, and `Maybe` (used during recursive checks to handle circular types). Performance implications: (1) the first compatibility check between two complex types is expensive, but subsequent checks are O(1), (2) the cache is invalidated when the checker creates new type instances (e.g., new generic instantiations), (3) large codebases with many unique type combinations can exhaust the cache, leading to repeated expensive checks, and (4) structural typing means the cache must consider the full shape of types, not just names. You can observe cache behavior via `tsc --extendedDiagnostics` which reports relationship cache sizes.

---

## 21. How do you implement type-level validation for complex business rules?

TypeScript's type system can encode business rules that are checked at compile time, preventing invalid states from being constructed.

```typescript
type ValidEmail = `${string}@${string}.${string}`;

type PhoneDigits = `${number}${number}${number}${number}${number}${number}${number}${number}${number}${number}`;

interface ValidatedUser {
  name: string;
  email: ValidEmail;
}

function createUser<E extends ValidEmail>(
  name: string,
  email: E
): ValidatedUser {
  return { name, email };
}

createUser("Alice", "alice@example.com"); // ✔
// createUser("Bob", "invalid-email");    // ✘ Compile error

// Type-level state validation
type OrderState = "draft" | "submitted" | "paid" | "shipped" | "delivered";

type ValidTransitions = {
  draft: "submitted";
  submitted: "paid" | "draft";
  paid: "shipped";
  shipped: "delivered";
  delivered: never;
};

interface Order<S extends OrderState> {
  id: string;
  state: S;
  items: string[];
}

function transitionOrder<
  S extends OrderState,
  Next extends ValidTransitions[S]
>(order: Order<S>, nextState: Next): Order<Next> {
  return { ...order, state: nextState };
}

declare const draftOrder: Order<"draft">;
const submitted = transitionOrder(draftOrder, "submitted"); // ✔
// transitionOrder(draftOrder, "shipped"); // ✘ invalid transition
```

---

## 22. What is the `Symbol.dispose` protocol and how does it interact with TypeScript's type system?

The explicit resource management proposal (implemented in TypeScript 5.2) introduces `Disposable` and `AsyncDisposable` interfaces. `Symbol.dispose` is a well-known symbol that defines synchronous cleanup. `Symbol.asyncDispose` defines async cleanup. The `using` and `await using` declarations call these symbols automatically when the scope exits. TypeScript models this with built-in interfaces: `Disposable { [Symbol.dispose](): void }` and `AsyncDisposable { [Symbol.asyncDispose](): Promise<void> }`. `DisposableStack` and `AsyncDisposableStack` aggregate multiple disposables.

```typescript
class ManagedResource implements Disposable {
  private acquired = true;

  use(): void {
    if (!this.acquired) throw new Error("Resource already disposed");
    console.log("Using resource");
  }

  [Symbol.dispose](): void {
    if (this.acquired) {
      console.log("Cleaning up resource");
      this.acquired = false;
    }
  }
}

function processWithResources() {
  using stack = new DisposableStack();

  const res1 = stack.use(new ManagedResource());
  const res2 = stack.use(new ManagedResource());

  res1.use();
  res2.use();
  // Both resources are disposed in reverse order when scope exits
}
```

---

## 23. How do you architect large-scale TypeScript monorepos?

Large monorepos require careful TypeScript configuration for build performance, dependency management, and consistent developer experience. Key architectural decisions include: (1) project references (`composite: true`) for incremental builds with `tsc --build`, (2) shared `tsconfig.base.json` with package-specific overrides, (3) path aliases via `paths` or `package.json` `exports` for cross-package imports, (4) consistent `moduleResolution` strategy across packages (typically `bundler` for app packages, `node16` for library packages), (5) declaration maps for source navigation, (6) `isolatedDeclarations` for parallel declaration emit in large repos, and (7) build tool choice (turborepo, nx, or custom) for caching and task orchestration.

```json
// tsconfig.base.json (root)
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "isolatedDeclarations": true,
    "skipLibCheck": true
  }
}

// packages/shared/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "node16"
  },
  "include": ["src"]
}

// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "references": [{ "path": "../shared" }],
  "include": ["src"]
}
```

---

## 24. How does TypeScript's `strictFunctionTypes` affect callback typing?

With `strictFunctionTypes` enabled, function types are checked contra-variantly for their parameter positions. This means a callback expecting `(animal: Animal) => void` cannot be satisfied by `(dog: Dog) => void` because the callback might be called with a `Cat` (which is an `Animal` but not a `Dog`). Without `strictFunctionTypes`, parameters are checked bi-variantly—allowing both narrower and broader types—which is unsound but was the historical default. Note: methods (declared with short-hand syntax in interfaces) are always checked bi-variantly for compatibility with the DOM and existing patterns.

```typescript
class Animal { name = "animal"; }
class Dog extends Animal { breed = "unknown"; }

type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

declare let animalFn: AnimalHandler;
declare let dogFn: DogHandler;

// With strictFunctionTypes:
animalFn = dogFn; // ✘ — Dog parameter is narrower than Animal
dogFn = animalFn; // ✔ — Animal parameter is wider (contravariant)

// Methods are still bivariant:
interface Events {
  handle(animal: Animal): void; // method syntax — bivariant
}
```

---

## 25. What is the `extends infer` pattern for intermediate type computations?

The `extends infer` pattern introduces a temporary type variable that captures an intermediate computation result, enabling step-by-step type transformations within a single conditional type. It acts like a `let` binding at the type level.

```typescript
type Transform<T> =
  T extends Record<string, unknown>
    ? keyof T extends infer Keys
      ? Keys extends string
        ? `get_${Keys}` | `set_${Keys}`
        : never
      : never
    : never;

type Result = Transform<{ name: string; age: number }>;
// "get_name" | "set_name" | "get_age" | "set_age"
```

---

## 26. How do you implement type-safe internationalization (i18n)?

Type-safe i18n uses template literal types and recursive key extraction to ensure translation keys exist and interpolation parameters match.

```typescript
interface Translations {
  greeting: "Hello, {name}!";
  farewell: "Goodbye, {name}. See you {time}!";
  items: "{count} item(s) in your cart";
  simple: "No parameters here";
}

type ExtractParams<S extends string> =
  S extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractParams<Rest>
    : never;

type TranslateArgs<K extends keyof Translations> =
  ExtractParams<Translations[K]> extends never
    ? []
    : [params: Record<ExtractParams<Translations[K]>, string | number>];

function t<K extends keyof Translations>(
  key: K,
  ...args: TranslateArgs<K>
): string {
  let template: string = key; // lookup from translations
  if (args.length > 0) {
    const params = args[0] as Record<string, string | number>;
    for (const [k, v] of Object.entries(params)) {
      template = template.replace(`{${k}}`, String(v));
    }
  }
  return template;
}

t("greeting", { name: "Alice" }); // ✔ requires { name }
t("simple");                       // ✔ no params required
// t("farewell", { name: "Bob" }); // ✘ missing { time }
t("farewell", { name: "Bob", time: "tomorrow" }); // ✔
```

---

## 27. How does TypeScript handle `this` typing in complex inheritance hierarchies?

The polymorphic `this` type represents the type of the current instance, which changes in subclasses. TypeScript's `this` type enables fluent interfaces that work correctly across inheritance chains. However, `this` typing has nuances: it only works in instance methods (not static), it interacts with `strictBindCallApply`, and it can produce unexpected results with destructured methods. The `ThisParameterType` utility extracts the `this` type from a function, and `OmitThisParameter` removes it.

```typescript
class Collection<T> {
  protected items: T[] = [];

  add(item: T): this {
    this.items.push(item);
    return this;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

class SortedCollection<T> extends Collection<T> {
  sort(compareFn: (a: T, b: T) => number): this {
    this.items.sort(compareFn);
    return this;
  }
}

new SortedCollection<number>()
  .add(3)    // returns SortedCollection<number>, not Collection<number>
  .add(1)
  .sort((a, b) => a - b)
  .add(2)
  .toArray(); // [1, 3, 2]
```

---

## 28. What are the implications of TypeScript's `isolatedModules` flag for project architecture?

`isolatedModules` enforces that each file can be transpiled independently, which is required by tools like Babel, SWC, esbuild, and Vite. Implications: (1) `const enum` across files is forbidden (use regular `enum` or union types), (2) re-exports must use `export type` for type-only exports, (3) namespace merging across files is forbidden, (4) files without imports/exports are flagged (must be modules), and (5) it effectively forbids any feature that requires cross-file knowledge during emit. For senior architects, this flag represents a fundamental design constraint: it forces a module-per-file architecture that aligns with modern build tools and enables parallel transpilation.

---

## 29. How do you implement type-safe error handling with a Result monad?

A Result monad encapsulates success/failure states and provides chainable operations that short-circuit on error, eliminating try/catch spaghetti while maintaining full type safety.

```typescript
class Result<T, E extends Error = Error> {
  private constructor(
    private readonly value: T | null,
    private readonly error: E | null
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(value, null) as Result<T, never>;
  }

  static err<E extends Error>(error: E): Result<never, E> {
    return new Result(null, error) as Result<never, E>;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.error) return Result.err(this.error);
    return Result.ok(fn(this.value!));
  }

  flatMap<U, E2 extends Error>(fn: (value: T) => Result<U, E2>): Result<U, E | E2> {
    if (this.error) return Result.err(this.error);
    return fn(this.value!) as Result<U, E | E2>;
  }

  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R {
    if (this.error) return handlers.err(this.error);
    return handlers.ok(this.value!);
  }

  unwrap(): T {
    if (this.error) throw this.error;
    return this.value!;
  }

  unwrapOr(defaultValue: T): T {
    return this.error ? defaultValue : this.value!;
  }
}

class ValidationError extends Error { name = "ValidationError" as const; }
class NotFoundError extends Error { name = "NotFoundError" as const; }

function parseAge(input: string): Result<number, ValidationError> {
  const age = parseInt(input, 10);
  if (isNaN(age) || age < 0 || age > 150) {
    return Result.err(new ValidationError(`Invalid age: ${input}`));
  }
  return Result.ok(age);
}

const result = parseAge("25")
  .map(age => age * 365)
  .match({
    ok: days => `You've lived ~${days} days`,
    err: e => `Error: ${e.message}`
  });
```

---

## 30. How does TypeScript handle generic variance annotations (`in`, `out`)?

TypeScript 4.7 introduced explicit variance annotations: `out` marks a type parameter as covariant (used only in output positions), `in` marks it as contravariant (used only in input positions), and `in out` marks it as invariant. These annotations serve as both documentation and optimization—they let the compiler skip expensive structural variance checks and instead rely on the declared variance. Incorrect annotations cause compile errors.

```typescript
interface Producer<out T> {
  produce(): T;
  // consume(value: T): void; // ✘ Error: T used in input position
}

interface Consumer<in T> {
  consume(value: T): void;
  // produce(): T; // ✘ Error: T used in output position
}

interface Mutable<in out T> {
  get(): T;
  set(value: T): void;
}
```

---

## 31. What are the performance characteristics of different type constructs?

Different type constructs have varying compilation performance costs. From fastest to slowest: (1) **Primitive types** and **literal types** — essentially free, (2) **Interfaces** — efficiently cached by name, fast structural comparison, (3) **Type aliases for objects** — slightly slower than interfaces, (4) **Union types** — cost grows linearly with members, (5) **Intersection types** — flattened at creation, similar to union cost, (6) **Mapped types** — cost proportional to key count, (7) **Conditional types** — can be expensive, especially distributive over unions, (8) **Recursive types** — most expensive, limited by recursion depth. Best practice: use interfaces for object shapes, cache complex computed types in named aliases, avoid deeply recursive types in hot paths, and use `tsc --generateTrace` to identify bottlenecks.

---

## 32. How do you implement compile-time type branding for units of measurement?

Branded types can prevent mixing incompatible units (meters vs feet, USD vs EUR) at compile time with zero runtime overhead.

```typescript
declare const brand: unique symbol;

type Branded<T, B> = T & { readonly [brand]: B };

type Meters = Branded<number, "meters">;
type Feet = Branded<number, "feet">;
type Kilograms = Branded<number, "kg">;
type Pounds = Branded<number, "lbs">;

function meters(value: number): Meters { return value as Meters; }
function feet(value: number): Feet { return value as Feet; }

function addMeters(a: Meters, b: Meters): Meters {
  return (a + b) as Meters;
}

function metersToFeet(m: Meters): Feet {
  return (m * 3.28084) as Feet;
}

const distance1 = meters(100);
const distance2 = meters(50);
addMeters(distance1, distance2); // ✔
// addMeters(distance1, feet(50)); // ✘ — type error
```

---

## 33. How do you handle circular type references and their impact on the type checker?

Circular type references occur when type A references type B which references type A. TypeScript handles them through lazy evaluation—types are not fully expanded until needed. However, circular types can cause: (1) infinite recursion in conditional types (TypeScript limits depth to ~50), (2) `Type instantiation is excessively deep` errors, (3) performance degradation when the checker repeatedly encounters the cycle. Solutions include: adding recursion depth counters as type parameters, using interfaces instead of type aliases (interfaces are inherently lazy), and restructuring types to break the cycle.

```typescript
// Circular but handled by lazy evaluation
interface TreeNode {
  value: string;
  children: TreeNode[]; // self-referential
}

// Circular conditional type — needs depth limit
type DeepPartial<T, Depth extends number[] = []> =
  Depth["length"] extends 10
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K], [...Depth, 0]> }
      : T;
```

---

## 34. What is the role of `skipLibCheck` and when should you disable it?

`skipLibCheck: true` tells TypeScript to skip type checking of declaration files (`.d.ts`), including those in `node_modules/@types`. This dramatically speeds up compilation but masks type errors in third-party libraries. Disable it (`false`) when: (1) you publish a library and want to ensure your declarations are valid, (2) you write custom `.d.ts` files and want them checked, (3) you need to verify compatibility between different `@types` packages. Keep it `true` for application development where build speed matters more than validating library types.

---

## 35. How do you implement type-safe middleware chains with context augmentation?

Each middleware adds properties to the context, and subsequent middleware sees the augmented context type. The chain preserves the cumulative type.

```typescript
type Middleware<TIn, TOut> = (ctx: TIn, next: () => Promise<void>) => TOut | Promise<TOut>;

type ChainContext<
  TMiddlewares extends Middleware<any, any>[],
  TBase = {}
> = TMiddlewares extends [Middleware<infer In, infer Out>, ...infer Rest]
  ? Rest extends Middleware<any, any>[]
    ? ChainContext<Rest, TBase & Out>
    : TBase & Out
  : TBase;

interface BaseContext {
  request: { url: string; method: string };
  response: { status: number; body: unknown };
}

function createApp() {
  type AugmentedContext = BaseContext;
  const middlewares: Function[] = [];

  return {
    use<TAdded extends Record<string, unknown>>(
      middleware: (ctx: AugmentedContext & TAdded, next: () => Promise<void>) => void | Promise<void>
    ) {
      middlewares.push(middleware);
      return this as any; // In production, use proper type accumulation
    },

    async handle(ctx: BaseContext) {
      let index = 0;
      const next = async () => {
        if (index < middlewares.length) {
          await middlewares[index++](ctx, next);
        }
      };
      await next();
    }
  };
}
```

---

## 36. How does TypeScript handle intersection of function types vs union of function types?

Intersecting function types creates overloads—the result accepts calls matching any constituent. Unioning function types creates a type that only accepts calls matching all constituents (parameters become an intersection, return type becomes a union). This is counter-intuitive and stems from function contravariance.

```typescript
type FnA = (x: string) => string;
type FnB = (x: number) => number;

type Intersection = FnA & FnB;
// Overloaded: can call with string OR number

type Union = FnA | FnB;
// Can only call with string & number (= never) safely
// Must narrow before calling
```

---

## 37. What are the challenges of typing higher-kinded types in TypeScript?

TypeScript lacks native higher-kinded types (HKTs)—the ability to abstract over type constructors (e.g., "any container type" rather than a specific `Array` or `Set`). This limits functional programming patterns like Functors, Monads, and Applicatives. Workarounds include: (1) interface merging with a global type registry, (2) defunctionalization using type-level lookup tables, and (3) encoding via type families. Libraries like `fp-ts` and `effect` use these techniques extensively.

```typescript
// Defunctionalization approach
interface TypeMap {
  Array: unknown[];
  Promise: Promise<unknown>;
  Set: Set<unknown>;
}

type Kind<F extends keyof TypeMap, A> = {
  Array: A[];
  Promise: Promise<A>;
  Set: Set<A>;
}[F];

interface Functor<F extends keyof TypeMap> {
  map<A, B>(fa: Kind<F, A>, f: (a: A) => B): Kind<F, B>;
}

const arrayFunctor: Functor<"Array"> = {
  map: (fa, f) => fa.map(f)
};
```

---

## 38. How do you design type-safe database migrations?

Type-safe migrations use TypeScript's type system to track schema changes over time and ensure queries are valid against the current schema version.

```typescript
interface MigrationStep<TBefore, TAfter> {
  up(schema: TBefore): TAfter;
  down(schema: TAfter): TBefore;
}

type ApplyMigrations<
  TSchema,
  TMigrations extends MigrationStep<any, any>[]
> = TMigrations extends [MigrationStep<TSchema, infer Next>, ...infer Rest]
  ? Rest extends MigrationStep<any, any>[]
    ? ApplyMigrations<Next, Rest>
    : Next
  : TSchema;

// Schema evolution tracked at type level
interface SchemaV1 {
  users: { id: number; name: string };
}

interface SchemaV2 extends SchemaV1 {
  users: { id: number; name: string; email: string };
}

interface SchemaV3 extends Omit<SchemaV2, "users"> {
  users: { id: number; name: string; email: string; role: string };
  posts: { id: number; userId: number; title: string };
}
```

---

## 39. What is the `--incremental` flag and how does TypeScript's build cache work?

`--incremental` enables TypeScript to save build information to a `.tsbuildinfo` file. On subsequent compilations, TypeScript reads this file to determine which files have changed and only rechecks affected files and their dependents. The build info contains: (1) file version hashes, (2) the dependency graph between files, (3) signature information (the public API shape of each file), and (4) semantic diagnostics cache. A file is rechecked only if its content changed or the signature of one of its dependencies changed. This dramatically reduces rebuild times in large projects—typically from minutes to seconds. Combined with `composite` and project references, it enables per-package incremental builds in monorepos.

---

## 40. How do you implement compile-time validated SQL queries?

Template literal types can parse SQL-like strings at compile time, extracting table references and parameter placeholders for type-safe query building.

```typescript
type ExtractTableName<Q extends string> =
  Q extends `${string}FROM ${infer Table} ${string}` ? Table :
  Q extends `${string}FROM ${infer Table}` ? Table :
  never;

type ExtractPlaceholders<Q extends string> =
  Q extends `${string}$${infer Param} ${infer Rest}`
    ? Param | ExtractPlaceholders<Rest>
    : Q extends `${string}$${infer Param}`
      ? Param
      : never;

interface Schema {
  users: { id: number; name: string; email: string };
  posts: { id: number; userId: number; title: string; content: string };
}

function query<
  Q extends string,
  T extends ExtractTableName<Q> & keyof Schema
>(
  sql: Q,
  params: Record<ExtractPlaceholders<Q>, unknown>
): Promise<Schema[T][]> {
  return Promise.resolve([]);
}

// Usage
const result = query(
  "SELECT * FROM users WHERE id = $id AND name = $name",
  { id: 1, name: "Alice" } // ✔ matches extracted placeholders
);
```

---

## 41. How does TypeScript's `exactOptionalPropertyTypes` change type behavior?

This flag distinguishes between "property is absent" and "property is present but set to `undefined`". Without it, `{x?: string}` accepts both omission and explicit `undefined`. With it, `{x?: string}` only accepts omission; to allow explicit `undefined`, you must write `{x?: string | undefined}`. This is important for API correctness—many APIs distinguish between "not sending a field" (keep current value) and "sending null/undefined" (clear the value).

---

## 42. What are TypeScript's built-in compiler APIs, and how do you use them programmatically?

TypeScript exposes its compiler as a Node.js library via `typescript` package. Key APIs include: `ts.createProgram()` for batch compilation, `ts.createLanguageService()` for IDE-like features, `ts.transform()` for AST transformations, and `ts.createWatchProgram()` for file watching. The compiler API enables: custom linting rules, code generation tools, documentation generators, and build plugins.

```typescript
import * as ts from "typescript";

function analyzeFile(filePath: string) {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  });

  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filePath);

  if (sourceFile) {
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) {
          const type = checker.getTypeOfSymbolAtLocation(symbol, node);
          console.log(
            `Function: ${symbol.getName()}, Type: ${checker.typeToString(type)}`
          );
        }
      }
      ts.forEachChild(node, visit);
    });
  }
}
```

---

## 43. How do you implement type-safe feature flags with exhaustive handling?

Feature flags benefit from TypeScript's union types and exhaustiveness checking to ensure all flags are handled and no dead code accumulates.

```typescript
const FEATURES = {
  DARK_MODE: true,
  NEW_DASHBOARD: false,
  BETA_API: true,
} as const;

type FeatureFlag = keyof typeof FEATURES;
type EnabledFeatures = {
  [K in FeatureFlag]: (typeof FEATURES)[K] extends true ? K : never;
}[FeatureFlag];

type DisabledFeatures = Exclude<FeatureFlag, EnabledFeatures>;

function isEnabled<F extends FeatureFlag>(flag: F): (typeof FEATURES)[F] {
  return FEATURES[flag];
}

function requireFeature<F extends EnabledFeatures>(flag: F): void {
  if (!FEATURES[flag]) {
    throw new Error(`Feature ${flag} is not enabled`);
  }
}

requireFeature("DARK_MODE");    // ✔ — enabled
// requireFeature("NEW_DASHBOARD"); // ✘ — not in EnabledFeatures
```

---

## 44. What is the difference between `interface` caching and `type` caching in the checker?

Interfaces are cached by identity (their declaration symbol) in the checker's internal structures. When TypeScript compares two uses of the same interface, it quickly determines identity-based compatibility. Type aliases for object shapes create anonymous structural types that must be compared structurally—checking each property individually. In practice, this means: (1) interfaces are faster for repeated compatibility checks, (2) interfaces produce cleaner error messages (the interface name is shown, not the expanded structure), (3) type aliases are necessary for unions, intersections, and computed types where interface syntax doesn't apply. The recommendation for large codebases: use `interface` for object shapes, `type` for everything else.

---

## 45. How do you implement type-safe dependency graphs?

A dependency graph with compile-time cycle detection and ordering can be modeled using mapped types and recursive type computations.

```typescript
interface DependencyGraph {
  moduleA: [];
  moduleB: ["moduleA"];
  moduleC: ["moduleA", "moduleB"];
  moduleD: ["moduleC"];
}

type Module = keyof DependencyGraph;

type DependenciesOf<M extends Module> = DependencyGraph[M][number];

type AllDependencies<M extends Module, Visited extends Module = never> =
  M extends Visited
    ? never
    : DependenciesOf<M> extends infer Deps
      ? Deps extends Module
        ? Deps | AllDependencies<Deps, Visited | M>
        : never
      : never;

type ModuleDDeps = AllDependencies<"moduleD">;
// "moduleC" | "moduleA" | "moduleB"

function loadModule<M extends Module>(
  module: M,
  loaded: Set<AllDependencies<M> | M>
): void {
  console.log(`Loading ${module} with dependencies`);
}
```

---

## 46. How does TypeScript handle `this` in the context of generic method chaining?

When a generic class returns `this` from methods, TypeScript preserves the exact generic instantiation. This is crucial for builder patterns and fluent APIs where the chain must remember the accumulated type state.

```typescript
class Pipeline<TInput, TOutput = TInput> {
  private transforms: Function[] = [];

  pipe<TNext>(
    transform: (value: TOutput) => TNext
  ): Pipeline<TInput, TNext> {
    const next = new Pipeline<TInput, TNext>();
    next.transforms = [...this.transforms, transform];
    return next;
  }

  execute(input: TInput): TOutput {
    return this.transforms.reduce(
      (value, fn) => fn(value),
      input as unknown
    ) as TOutput;
  }
}

const pipeline = new Pipeline<string>()
  .pipe(s => s.length)           // Pipeline<string, number>
  .pipe(n => n > 5)              // Pipeline<string, boolean>
  .pipe(b => b ? "long" : "short"); // Pipeline<string, string>

pipeline.execute("hello world"); // "long"
```

---

## 47. What are the implications of TypeScript's `moduleResolution: "bundler"` for library authors?

Library authors must consider that consumers may use `bundler` resolution, which: (1) does not require file extensions in imports, (2) uses `package.json` `exports` field for entry point resolution, (3) supports `import` and `require` condition exports, (4) does not enforce Node.js ESM rules. Libraries should: provide both ESM and CJS builds, include `types` condition in `exports`, use `typesVersions` for backwards compatibility, ensure `moduleResolution: "node16"` works for Node.js consumers while `bundler` works for bundler consumers, and test with both resolution modes.

---

## 48. How do you implement a type-safe pattern matching library?

Pattern matching provides exhaustive, type-safe conditional logic as an alternative to switch statements, with the compiler verifying all cases are handled.

```typescript
type Pattern<T> = T extends string ? string | RegExp | ((v: string) => boolean) :
                  T extends number ? number | ((v: number) => boolean) :
                  T extends boolean ? boolean :
                  Partial<T> | ((v: T) => boolean);

class Matcher<T, R = never> {
  private cases: Array<{ pattern: any; handler: Function }> = [];

  constructor(private value: T) {}

  with<P extends T, TReturn>(
    pattern: P | ((v: T) => v is P),
    handler: (value: P) => TReturn
  ): Matcher<Exclude<T, P>, R | TReturn> {
    this.cases.push({ pattern, handler });
    return this as any;
  }

  exhaustive(): R {
    for (const { pattern, handler } of this.cases) {
      if (typeof pattern === "function") {
        if (pattern(this.value)) return handler(this.value) as any;
      } else if (this.value === pattern) {
        return handler(this.value) as any;
      }
    }
    throw new Error("Non-exhaustive match");
  }

  otherwise<TReturn>(handler: (value: T) => TReturn): R | TReturn {
    for (const { pattern, handler: h } of this.cases) {
      if (typeof pattern === "function") {
        if (pattern(this.value)) return h(this.value) as any;
      } else if (this.value === pattern) {
        return h(this.value) as any;
      }
    }
    return handler(this.value);
  }
}

function match<T>(value: T): Matcher<T> {
  return new Matcher(value);
}
```

---

## 49. What is `satisfies` with `as const` and when do you combine them?

Combining `as const` and `satisfies` gives you the best of both worlds: `as const` infers the narrowest literal types, and `satisfies` validates the value conforms to a broader type. The result is a value that is both validated and precisely typed.

```typescript
type Route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  auth: boolean;
};

const routes = {
  getUsers: { path: "/users", method: "GET", auth: true },
  createUser: { path: "/users", method: "POST", auth: true },
  health: { path: "/health", method: "GET", auth: false }
} as const satisfies Record<string, Route>;

// routes.getUsers.method is "GET" (not "GET" | "POST" | "PUT" | "DELETE")
// AND the whole object is validated against Record<string, Route>
```

---

## 50. How do you handle type erasure and its implications for runtime behavior?

TypeScript's types are completely erased during compilation—they produce zero runtime artifacts. This means: (1) you cannot use `typeof` at runtime to check TypeScript types (only JavaScript types), (2) generic type parameters are not available at runtime, (3) interfaces don't exist at runtime, (4) type guards must use runtime JavaScript checks, not TypeScript-only constructs. To bridge the gap, use: runtime validation libraries (Zod, io-ts, Valibot) that generate both types and validators, class-based patterns where `instanceof` works, discriminant properties for tagged unions, and `reflect-metadata` for decorator-based reflection.

---

## 51. How do you type complex recursive type transformations with depth limits?

Deeply recursive types can hit TypeScript's recursion limit (~50 levels). Adding a depth counter as a tuple length provides controlled termination.

```typescript
type DeepRequired<T, Depth extends number[] = []> =
  Depth["length"] extends 8
    ? T
    : T extends object
      ? { [K in keyof T]-?: DeepRequired<NonNullable<T[K]>, [...Depth, 0]> }
      : T;

type DeepNullable<T, Depth extends number[] = []> =
  Depth["length"] extends 8
    ? T | null
    : T extends object
      ? { [K in keyof T]: DeepNullable<T[K], [...Depth, 0]> | null }
      : T | null;
```

---

## 52. What are TypeScript project references and composite projects for build performance?

Project references split a large codebase into smaller TypeScript projects that reference each other. Each project has `composite: true` in its `tsconfig.json`, which requires `declaration: true` and ensures the project can be built independently. `tsc --build` (or `-b`) uses the project graph to: (1) build dependencies before dependents, (2) skip up-to-date projects using `.tsbuildinfo` files, and (3) enable parallel builds. This can reduce build times from minutes to seconds in large monorepos by avoiding redundant work.

---

## 53. How do you implement a type-safe FSM (Finite State Machine) that prevents invalid transitions at compile time?

A compile-time FSM uses phantom types and conditional types to encode valid transitions, making invalid state changes impossible to express.

```typescript
type States = "idle" | "loading" | "loaded" | "error";

type TransitionMap = {
  idle: { FETCH: "loading" };
  loading: { SUCCESS: "loaded"; FAILURE: "error" };
  loaded: { REFRESH: "loading"; RESET: "idle" };
  error: { RETRY: "loading"; RESET: "idle" };
};

type ValidEvents<S extends States> = keyof TransitionMap[S];
type NextState<S extends States, E extends ValidEvents<S>> = TransitionMap[S][E];

class FSM<S extends States> {
  constructor(public readonly state: S) {}

  transition<E extends ValidEvents<S>>(
    event: E
  ): FSM<NextState<S, E> & States> {
    const transitions = {
      idle: { FETCH: "loading" },
      loading: { SUCCESS: "loaded", FAILURE: "error" },
      loaded: { REFRESH: "loading", RESET: "idle" },
      error: { RETRY: "loading", RESET: "idle" }
    } as const;

    const nextState = (transitions as any)[this.state][event] as NextState<S, E> & States;
    return new FSM(nextState);
  }
}

const machine = new FSM("idle" as const);
const loading = machine.transition("FETCH");     // FSM<"loading">
const loaded = loading.transition("SUCCESS");    // FSM<"loaded">
// loading.transition("RESET");                  // ✘ "RESET" not valid from "loading"
```

---

## 54. How does TypeScript's `noUncheckedIndexedAccess` change safety guarantees?

When enabled, `noUncheckedIndexedAccess` adds `| undefined` to the return type of index signature access and array indexing. Without it, `arr[n]` returns `T`; with it, `arr[n]` returns `T | undefined`. This catches a common source of runtime errors—assuming an array index or dictionary key exists without checking.

```typescript
// With noUncheckedIndexedAccess: true
const arr: string[] = ["a", "b", "c"];
const item = arr[5]; // string | undefined — must check

const dict: Record<string, number> = { a: 1 };
const val = dict["b"]; // number | undefined — must check

// Narrowing required
if (item !== undefined) {
  item.toUpperCase(); // ✔ safe
}
```

---

## 55. What is the TypeScript Language Service Protocol and how do IDE features work?

The TypeScript Language Service (LS) provides IDE features: completions, hover information, diagnostics, refactorings, go-to-definition, find references, and more. It communicates via `tsserver` (a Node.js process) using a JSON-based protocol. The LS maintains an in-memory project state (program, checker, file watchers) and responds to requests incrementally. In VSCode/Cursor, the TypeScript extension spawns a `tsserver` instance and communicates over stdio. For large projects, performance depends on: (1) project size and `tsconfig.json` scope, (2) complexity of types (affects completion and hover speed), (3) file exclusions via `exclude`, and (4) the `disableAutomaticTypeAcquisition` setting.

---

## 56. How do you implement type-safe serialization/deserialization boundaries?

At system boundaries (API, localStorage, WebSocket), data enters as `unknown`. Type-safe serialization uses schema definitions that produce both runtime validators and static types.

```typescript
// Schema definition that produces both types and validators
type Schema<T> = {
  parse(data: unknown): T;
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: Error };
};

function string(): Schema<string> {
  return {
    parse(data) {
      if (typeof data !== "string") throw new Error("Expected string");
      return data;
    },
    safeParse(data) {
      if (typeof data !== "string") return { success: false, error: new Error("Expected string") };
      return { success: true, data };
    }
  };
}

function object<T extends Record<string, Schema<any>>>(
  shape: T
): Schema<{ [K in keyof T]: ReturnType<T[K]["parse"]> }> {
  return {
    parse(data) {
      if (typeof data !== "object" || data === null) throw new Error("Expected object");
      const result: any = {};
      for (const [key, schema] of Object.entries(shape)) {
        result[key] = schema.parse((data as any)[key]);
      }
      return result;
    },
    safeParse(data) {
      try { return { success: true, data: this.parse(data) }; }
      catch (e) { return { success: false, error: e instanceof Error ? e : new Error(String(e)) }; }
    }
  };
}

const UserSchema = object({
  name: string(),
  email: string()
});

type User = ReturnType<typeof UserSchema["parse"]>;
// { name: string; email: string }
```

---

## 57. What are the implications of `strictPropertyInitialization` for class design?

`strictPropertyInitialization` requires that class properties declared with a type must be initialized in the constructor or have a definite assignment assertion (`!`). This catches common bugs where properties are used before being set. The implications for class design are: (1) all properties must be initialized in the constructor, (2) properties initialized in lifecycle methods (like React's `componentDidMount`) need `!` or be made optional, (3) dependency injection patterns must use constructor injection or `!`, and (4) lazy initialization patterns need redesign. The `!` escape hatch should be used sparingly and documented.

```typescript
class Service {
  private connection: Connection; // ✘ not initialized

  private connection!: Connection; // ✔ definite assignment assertion

  private connection: Connection | undefined; // ✔ explicitly optional

  constructor(private readonly config: Config) {
    this.connection = createConnection(config); // ✔ initialized in constructor
  }
}
```

---

## 58. How do you design a type-safe event sourcing system?

Event sourcing captures state changes as a sequence of events. TypeScript ensures events are correctly structured and reducers handle all event types.

```typescript
interface BaseEvent {
  id: string;
  timestamp: number;
  aggregateId: string;
}

interface UserCreated extends BaseEvent {
  type: "UserCreated";
  payload: { name: string; email: string };
}

interface UserUpdated extends BaseEvent {
  type: "UserUpdated";
  payload: { name?: string; email?: string };
}

interface UserDeleted extends BaseEvent {
  type: "UserDeleted";
  payload: {};
}

type UserEvent = UserCreated | UserUpdated | UserDeleted;

interface UserState {
  id: string;
  name: string;
  email: string;
  deleted: boolean;
  version: number;
}

type EventHandler<TState, TEvent extends BaseEvent> = (
  state: TState,
  event: TEvent
) => TState;

type EventHandlers<TState, TEvents extends BaseEvent> = {
  [E in TEvents as E["type"]]: EventHandler<TState, E>;
};

const userHandlers: EventHandlers<UserState, UserEvent> = {
  UserCreated: (state, event) => ({
    ...state,
    id: event.aggregateId,
    name: event.payload.name,
    email: event.payload.email,
    version: state.version + 1
  }),
  UserUpdated: (state, event) => ({
    ...state,
    ...event.payload,
    version: state.version + 1
  }),
  UserDeleted: (state) => ({
    ...state,
    deleted: true,
    version: state.version + 1
  })
};

function applyEvent<TState>(
  state: TState,
  event: UserEvent,
  handlers: EventHandlers<TState, UserEvent>
): TState {
  const handler = handlers[event.type] as EventHandler<TState, typeof event>;
  return handler(state, event);
}
```

---

## 59. What is the impact of `target` and `lib` options on available types?

`target` determines the JavaScript version emitted (ES5, ES2022, ESNext). `lib` determines which built-in type declarations are available. They are independent: you can target ES5 but include ES2022 lib types if you provide polyfills. Common `lib` values include `DOM` (browser APIs), `ES2022` (Promise.allSettled, String.replaceAll), `ESNext` (latest proposals), and `WebWorker`. Missing `lib` entries cause type errors for modern APIs; incorrect `target` produces incompatible JavaScript output. For modern applications: set `target` to your minimum supported runtime and `lib` to the features you use (with polyfills for any gap).

---

## 60. How do you implement a type-level parser combinator?

Parser combinators at the type level can parse and validate string formats at compile time using recursive template literal types.

```typescript
type ParseResult<T, Rest extends string> = { value: T; rest: Rest };
type ParseError = never;

type ParseDigit<S extends string> =
  S extends `${infer D extends number}${infer Rest}`
    ? ParseResult<D, Rest>
    : ParseError;

type ParseDigits<S extends string, Acc extends string = ""> =
  S extends `${infer D extends number}${infer Rest}`
    ? ParseDigits<Rest, `${Acc}${D}`>
    : Acc extends ""
      ? ParseError
      : ParseResult<Acc, S>;

type ParseSemver<S extends string> =
  ParseDigits<S> extends ParseResult<infer Major, infer R1>
    ? R1 extends `.${infer R2}`
      ? ParseDigits<R2> extends ParseResult<infer Minor, infer R3>
        ? R3 extends `.${infer R4}`
          ? ParseDigits<R4> extends ParseResult<infer Patch, infer R5>
            ? { major: Major; minor: Minor; patch: Patch; rest: R5 }
            : ParseError
          : ParseError
        : ParseError
      : ParseError
    : ParseError;

type V = ParseSemver<"1.2.3">;
// { major: "1"; minor: "2"; patch: "3"; rest: "" }
```

---

## 61. How does TypeScript handle contravariance in generic container types?

Generic container types exhibit different variance depending on how the type parameter is used. A `Readonly<T>` container is covariant (output-only), a write-only container is contravariant (input-only), and a mutable container is invariant (both input and output). Understanding this is crucial for designing type-safe collection hierarchies and ensuring assignability works correctly across related generic types.

---

## 62. What are the best practices for publishing TypeScript libraries?

Publishing TypeScript libraries requires careful configuration for maximum consumer compatibility. Best practices include: (1) emit both ESM and CJS using dual-package setup, (2) include source maps and declaration maps, (3) set `package.json` `exports` with `types` conditions first, (4) use `moduleResolution: "node16"` for testing library resolution, (5) avoid `const enum` (breaks `isolatedModules`), (6) test with `skipLibCheck: false` on your declarations, (7) specify `peerDependencies` correctly, (8) include `types` or `typings` field for backwards compatibility, and (9) use `typesVersions` for multi-version TypeScript support.

```json
{
  "name": "my-lib",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.mts",
        "default": "./dist/esm/index.mjs"
      },
      "require": {
        "types": "./dist/cjs/index.d.cts",
        "default": "./dist/cjs/index.cjs"
      }
    }
  },
  "types": "./dist/esm/index.d.mts",
  "files": ["dist"]
}
```

---

## 63. How do you implement a type-safe observer/reactive system?

A reactive system tracks dependencies between computed values and source signals, with TypeScript ensuring type consistency through the dependency chain.

```typescript
class Signal<T> {
  private subscribers = new Set<(value: T) => void>();

  constructor(private value: T) {}

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.subscribers.forEach(fn => fn(newValue));
    }
  }

  subscribe(fn: (value: T) => void): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }
}

class Computed<T> {
  private cachedValue: T;
  private dirty = true;

  constructor(private compute: () => T, deps: Signal<any>[]) {
    this.cachedValue = compute();
    deps.forEach(dep => dep.subscribe(() => { this.dirty = true; }));
  }

  get(): T {
    if (this.dirty) {
      this.cachedValue = this.compute();
      this.dirty = false;
    }
    return this.cachedValue;
  }
}

const count = new Signal(0);
const doubled = new Computed(() => count.get() * 2, [count]);

count.set(5);
doubled.get(); // 10
```

---

## 64. What is `erasableSyntaxOnly` and when was it introduced?

TypeScript 5.8 introduced `erasableSyntaxOnly` to enforce that only TypeScript syntax that can be erased (removed) to produce valid JavaScript is used. This means: no `enum` (generates runtime code), no `namespace` with runtime members, no parameter properties, and no `import =` / `export =`. This aligns with Node.js's `--experimental-strip-types` flag which performs simple type erasure without full TypeScript compilation. The flag is useful for projects that want to ensure compatibility with lightweight TypeScript processing tools.

---

## 65. How do you handle covariant and contravariant type parameters in practice?

In practice, understanding variance helps you design correct APIs. Producers (functions returning T, readonly properties) are covariant—subtype substitution is safe. Consumers (function parameters, setter-only properties) are contravariant—supertype substitution is safe. Mutable containers are invariant—exact type match required. This knowledge prevents subtle bugs in collection hierarchies, event systems, and dependency injection containers.

---

## 66. How do you implement type-safe lens composition?

Lenses provide composable, immutable access to nested data structures. TypeScript can type lenses to ensure path validity and correct value types at each level.

```typescript
interface Lens<S, A> {
  get(source: S): A;
  set(value: A, source: S): S;
}

function prop<S, K extends keyof S>(key: K): Lens<S, S[K]> {
  return {
    get: (source) => source[key],
    set: (value, source) => ({ ...source, [key]: value })
  };
}

function compose<A, B, C>(outer: Lens<A, B>, inner: Lens<B, C>): Lens<A, C> {
  return {
    get: (source) => inner.get(outer.get(source)),
    set: (value, source) => outer.set(inner.set(value, outer.get(source)), source)
  };
}

interface State {
  user: {
    profile: {
      name: string;
      settings: { theme: "light" | "dark" };
    };
  };
}

const userLens = prop<State, "user">("user");
const profileLens = prop<State["user"], "profile">("profile");
const nameLens = prop<State["user"]["profile"], "name">("name");

const deepNameLens = compose(compose(userLens, profileLens), nameLens);

const state: State = {
  user: { profile: { name: "Alice", settings: { theme: "light" } } }
};

deepNameLens.get(state);                    // "Alice"
deepNameLens.set("Bob", state);             // new state with name = "Bob"
```

---

## 67. What is the `@typescript-eslint` parser and how does it work with ESLint?

`@typescript-eslint` provides a TypeScript parser for ESLint that generates an AST compatible with ESLint's expectations while preserving TypeScript-specific nodes. It consists of: (1) `@typescript-eslint/parser` — converts TypeScript AST to ESTree AST, (2) `@typescript-eslint/eslint-plugin` — TypeScript-specific lint rules, and (3) type-aware linting that uses the TypeScript compiler's type checker for rules requiring type information. Type-aware rules are slower because they instantiate a full TypeScript program but can catch errors that purely syntactic rules cannot (e.g., `no-floating-promises`, `no-misused-promises`, `strict-boolean-expressions`).

---

## 68. How does TypeScript handle intersection of discriminated unions?

Intersecting discriminated unions creates a type where the discriminant must satisfy both unions simultaneously. If the discriminant values are incompatible, the result is `never`. This is a common source of confusion and incorrect types.

```typescript
type A = { type: "a"; value: string } | { type: "b"; count: number };
type B = { type: "a"; name: string } | { type: "c"; flag: boolean };

type AB = A & B;
// Distributes to:
// ({ type: "a"; value: string } & { type: "a"; name: string })  → { type: "a"; value: string; name: string }
// | ({ type: "a"; value: string } & { type: "c"; flag: boolean }) → { type: "a" & "c" → never } → never
// | ({ type: "b"; count: number } & { type: "a"; name: string }) → never
// | ({ type: "b"; count: number } & { type: "c"; flag: boolean }) → never
// Result: { type: "a"; value: string; name: string }
```

---

## 69. What are the security implications of TypeScript's type system?

TypeScript's type system is not a security boundary. Key implications: (1) types are erased—runtime validation is still required for any untrusted input, (2) `as` assertions can bypass type safety, creating a false sense of security, (3) `any` silently disables checking, potentially hiding injection vulnerabilities, (4) structural typing means a malicious object with extra properties passes type checks, (5) prototype pollution is not prevented by types alone. Security-critical code should: use runtime validation (Zod, io-ts) at every boundary, avoid `any` and `as`, enable `strict` mode, use `noUncheckedIndexedAccess`, and treat the type system as documentation assistance, not a security guarantee.

---

## 70. How do you implement a type-safe CQRS (Command Query Responsibility Segregation) pattern?

CQRS separates read and write operations with distinct models. TypeScript can enforce this separation at the type level.

```typescript
interface Command<TName extends string, TPayload> {
  readonly type: "command";
  readonly name: TName;
  readonly payload: TPayload;
}

interface Query<TName extends string, TResult> {
  readonly type: "query";
  readonly name: TName;
  readonly _result: TResult;
}

type CommandMap = {
  CreateUser: { name: string; email: string };
  UpdateUser: { id: string; changes: Partial<{ name: string; email: string }> };
  DeleteUser: { id: string };
};

type QueryMap = {
  GetUser: { params: { id: string }; result: { id: string; name: string; email: string } };
  ListUsers: { params: { page: number }; result: Array<{ id: string; name: string }> };
};

interface CommandBus {
  dispatch<K extends keyof CommandMap>(
    name: K,
    payload: CommandMap[K]
  ): Promise<void>;
}

interface QueryBus {
  execute<K extends keyof QueryMap>(
    name: K,
    params: QueryMap[K]["params"]
  ): Promise<QueryMap[K]["result"]>;
}

class AppBus implements CommandBus, QueryBus {
  async dispatch<K extends keyof CommandMap>(name: K, payload: CommandMap[K]) {
    console.log(`Command: ${name}`, payload);
  }

  async execute<K extends keyof QueryMap>(name: K, params: QueryMap[K]["params"]) {
    console.log(`Query: ${name}`, params);
    return {} as QueryMap[K]["result"];
  }
}

const bus = new AppBus();
bus.dispatch("CreateUser", { name: "Alice", email: "a@b.com" }); // ✔
bus.execute("GetUser", { id: "123" }); // ✔ returns { id, name, email }
```

---

## 71. How do you optimize TypeScript compilation in CI pipelines?

CI optimization strategies include: (1) use `--incremental` with cached `.tsbuildinfo` files between builds, (2) use project references with `--build` for selective recompilation, (3) run type checking (`tsc --noEmit`) separately from transpilation (use SWC/esbuild for emit), (4) parallelize type checking across packages, (5) cache `node_modules` and TypeScript's internal caches, (6) use `skipLibCheck: true` to skip declaration file checking, (7) scope the `include` patterns to avoid checking test files in production builds, and (8) use `isolatedDeclarations` to enable parallel declaration generation.

---

## 72. What are the patterns for type-safe API versioning?

API versioning with TypeScript can track schema changes across versions, ensuring clients and servers agree on the contract for each version.

```typescript
interface ApiVersions {
  v1: {
    "GET /users": { response: { id: number; name: string }[] };
    "POST /users": { body: { name: string }; response: { id: number } };
  };
  v2: {
    "GET /users": { response: { id: string; name: string; email: string }[] };
    "POST /users": { body: { name: string; email: string }; response: { id: string } };
    "GET /users/:id": { response: { id: string; name: string; email: string } };
  };
}

type Version = keyof ApiVersions;

function createClient<V extends Version>(version: V) {
  return {
    async request<R extends keyof ApiVersions[V] & string>(
      route: R
    ): Promise<ApiVersions[V][R] extends { response: infer Resp } ? Resp : never> {
      return {} as any;
    }
  };
}

const v1Client = createClient("v1");
const users = await v1Client.request("GET /users");
// users: { id: number; name: string }[]

const v2Client = createClient("v2");
const usersV2 = await v2Client.request("GET /users");
// usersV2: { id: string; name: string; email: string }[]
```

---

## 73. How does TypeScript handle `WeakRef` and garbage collection types?

`WeakRef<T>` creates a reference that doesn't prevent garbage collection. `FinalizationRegistry<T>` calls a callback when a referenced object is collected. TypeScript types these correctly with generics. The constraint is that `T` must extend `object` for `WeakRef`—primitives cannot be weakly referenced. These APIs are useful for caches, leak detection, and resource cleanup.

---

## 74. What is the `--watch` mode implementation and how does it optimize rebuilds?

TypeScript's watch mode (`tsc --watch`) uses file system watchers to detect changes. On change, it: (1) invalidates the changed file and its dependents, (2) re-parses only changed files, (3) performs incremental type checking using cached symbols and types from unchanged files, (4) emits only affected output files. The watch mode uses polling or native FS events depending on the platform. For large projects, `watchOptions` in `tsconfig.json` can configure the polling interval, fallback behavior, and file watching strategy for optimal performance.

---

## 75. How do you implement type-safe command pattern with undo support?

The command pattern with undo uses TypeScript to ensure each command's execute and undo operations are typed consistently.

```typescript
interface Command<TState> {
  execute(state: TState): TState;
  undo(state: TState): TState;
  description: string;
}

class CommandHistory<TState> {
  private history: Command<TState>[] = [];
  private position = -1;
  private state: TState;

  constructor(initialState: TState) {
    this.state = initialState;
  }

  execute(command: Command<TState>): TState {
    this.history = this.history.slice(0, this.position + 1);
    this.state = command.execute(this.state);
    this.history.push(command);
    this.position++;
    return this.state;
  }

  undo(): TState | null {
    if (this.position < 0) return null;
    this.state = this.history[this.position].undo(this.state);
    this.position--;
    return this.state;
  }

  redo(): TState | null {
    if (this.position >= this.history.length - 1) return null;
    this.position++;
    this.state = this.history[this.position].execute(this.state);
    return this.state;
  }

  getState(): TState {
    return this.state;
  }
}

interface DocumentState {
  content: string;
  cursor: number;
}

class InsertTextCommand implements Command<DocumentState> {
  description: string;
  constructor(private text: string, private position: number) {
    this.description = `Insert "${text}" at ${position}`;
  }

  execute(state: DocumentState): DocumentState {
    const before = state.content.slice(0, this.position);
    const after = state.content.slice(this.position);
    return { content: before + this.text + after, cursor: this.position + this.text.length };
  }

  undo(state: DocumentState): DocumentState {
    const before = state.content.slice(0, this.position);
    const after = state.content.slice(this.position + this.text.length);
    return { content: before + after, cursor: this.position };
  }
}
```

---

## 76. What are the design patterns for type-safe API middleware stacking?

Middleware stacking requires that each layer can augment the context type, and the final handler sees the accumulated type from all middleware.

---

## 77. How do you profile and optimize TypeScript language service performance?

Language service performance (IDE responsiveness) is profiled using: (1) TypeScript's built-in performance tracing (`tsserver` log files), (2) the `typescript.tsserver.log` setting in VSCode for detailed server logs, (3) `--generateTrace` for compilation traces, (4) `--extendedDiagnostics` for timing data, (5) Chrome DevTools profiling of the `tsserver` process. Common optimization strategies: reduce `include` scope, split large files, simplify complex generic types, use `skipLibCheck`, avoid circular project references, and consider `disableAutomaticTypeAcquisition` for projects not using `@types`.

---

## 78. What is TypeScript 5.x's support for decorators (TC39 standard)?

TypeScript 5.0 implements the TC39 Stage 3 decorators proposal, which differs from the legacy `experimentalDecorators`. Key differences: (1) no `reflect-metadata` dependency, (2) decorators receive a `context` object with metadata about the decorated element, (3) different decorator kinds (class, method, accessor, field, getter, setter), (4) `@init:` accessor decorators for initialization hooks, (5) no parameter decorators in the standard proposal.

```typescript
function logged<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  return function (this: This, ...args: Args): Return {
    console.log(`Calling ${String(context.name)}`);
    return target.call(this, ...args);
  };
}

class MyClass {
  @logged
  greet(name: string) {
    return `Hello, ${name}`;
  }
}
```

---

## 79. How does TypeScript's type widening and narrowing interact with generic constraints?

Type widening expands literal types to their base types (e.g., `"hello"` → `string`). Narrowing refines broad types to specific ones. In generic contexts, widening applies to inferred type arguments unless prevented by `const` type parameters, `as const`, or explicit annotations. Constraints limit widening to the constraint boundary. Understanding this interaction is key for designing APIs that infer the right level of specificity.

```typescript
function identity<T>(value: T): T { return value; }
identity("hello"); // T = "hello" (literal inferred)

function loose<T extends string>(value: T): T { return value; }
loose("hello"); // T = "hello" (literal preserved within constraint)

function widened(value: string): string { return value; }
widened("hello"); // return type is string (literal lost)

function constGeneric<const T>(value: T): T { return value; }
constGeneric({ x: 1, y: [2, 3] });
// T = { readonly x: 1; readonly y: readonly [2, 3] }
```

---

## 80. What are the patterns for type-safe multi-tenant architectures?

Multi-tenant systems use branded types and generic context to ensure tenant isolation at the type level, preventing cross-tenant data access.

```typescript
declare const tenantBrand: unique symbol;
type TenantId<T extends string = string> = string & { readonly [tenantBrand]: T };

interface TenantContext<T extends string> {
  tenantId: TenantId<T>;
}

interface TenantScoped<T extends string> {
  tenantId: TenantId<T>;
}

class TenantRepository<T extends string> {
  constructor(private context: TenantContext<T>) {}

  async find<D extends TenantScoped<T>>(
    collection: string,
    query: Partial<D>
  ): Promise<D[]> {
    const scopedQuery = { ...query, tenantId: this.context.tenantId };
    return [] as D[];
  }
}
```

---

## 81. How do you implement type-safe pub/sub across microservices?

Cross-service pub/sub uses shared type definitions to ensure message producers and consumers agree on payload shapes.

```typescript
interface MessageSchemas {
  "user.created": { userId: string; email: string; timestamp: number };
  "user.updated": { userId: string; changes: Record<string, unknown> };
  "order.placed": { orderId: string; userId: string; items: Array<{ sku: string; qty: number }> };
  "order.shipped": { orderId: string; trackingNumber: string };
}

type Topic = keyof MessageSchemas;

interface Publisher {
  publish<T extends Topic>(
    topic: T,
    message: MessageSchemas[T]
  ): Promise<void>;
}

interface Subscriber {
  subscribe<T extends Topic>(
    topic: T,
    handler: (message: MessageSchemas[T], metadata: { topic: T; timestamp: number }) => Promise<void>
  ): () => void;
}

class MessageBroker implements Publisher, Subscriber {
  private handlers = new Map<string, Set<Function>>();

  async publish<T extends Topic>(topic: T, message: MessageSchemas[T]) {
    const metadata = { topic, timestamp: Date.now() };
    this.handlers.get(topic)?.forEach(fn => fn(message, metadata));
  }

  subscribe<T extends Topic>(
    topic: T,
    handler: (message: MessageSchemas[T], metadata: { topic: T; timestamp: number }) => Promise<void>
  ) {
    if (!this.handlers.has(topic)) this.handlers.set(topic, new Set());
    this.handlers.get(topic)!.add(handler);
    return () => this.handlers.get(topic)?.delete(handler);
  }
}
```

---

## 82. What is the `--noEmit` flag and when should you use separate type checking and transpilation?

`--noEmit` runs the type checker without producing output files. This is used when transpilation is handled by a faster tool (SWC, esbuild, Babel). The architecture is: (1) SWC/esbuild transpiles `.ts` → `.js` quickly (no type checking), (2) `tsc --noEmit` runs in parallel or in CI for type safety. Benefits: 10-100x faster builds, hot reload is nearly instant, type checking still catches errors. Trade-offs: two tools to maintain, potential for configuration drift between `tsconfig.json` and the transpiler's config.

---

## 83. How do you implement type-safe configuration validation with custom error messages?

Using conditional types and template literals, you can produce human-readable compile-time error messages when configuration is invalid.

```typescript
type ValidateConfig<T> =
  T extends { port: number }
    ? T extends { host: string }
      ? T extends { database: { url: string } }
        ? T
        : "Error: Config must include database.url as string"
      : "Error: Config must include host as string"
    : "Error: Config must include port as number";

function defineConfig<const T>(
  config: ValidateConfig<T> extends string ? ValidateConfig<T> : T
): T {
  return config as T;
}

// Usage
defineConfig({
  host: "localhost",
  port: 3000,
  database: { url: "postgres://..." }
}); // ✔

// defineConfig({ host: "localhost" });
// ✘ "Error: Config must include port as number"
```

---

## 84. What is the relationship between TypeScript's `lib` and polyfills?

TypeScript's `lib` option controls which built-in type definitions are available—it tells the compiler what APIs exist. But `lib` does not provide runtime implementations; those must come from polyfills. This creates a gap: if you include `ES2023` in `lib`, TypeScript assumes `Array.prototype.findLast()` exists, but older runtimes don't have it. You must: (1) set `lib` to match what your polyfills provide, (2) test with your target runtime, and (3) consider `lib` as a contract—"these APIs will be available at runtime."

---

## 85. How do you design type-safe GraphQL resolvers?

GraphQL resolvers benefit from generated types that ensure field resolvers return the correct types and receive the correct parent and argument types.

```typescript
interface ResolverContext {
  userId: string | null;
  dataSources: {
    users: { findById(id: string): Promise<User | null> };
    posts: { findByUserId(userId: string): Promise<Post[]> };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

type Resolvers = {
  Query: {
    user: (parent: {}, args: { id: string }, ctx: ResolverContext) => Promise<User | null>;
    users: (parent: {}, args: {}, ctx: ResolverContext) => Promise<User[]>;
  };
  User: {
    posts: (parent: User, args: {}, ctx: ResolverContext) => Promise<Post[]>;
  };
};

const resolvers: Resolvers = {
  Query: {
    user: (_, { id }, ctx) => ctx.dataSources.users.findById(id),
    users: async () => []
  },
  User: {
    posts: (parent, _, ctx) => ctx.dataSources.posts.findByUserId(parent.id)
  }
};
```

---

## 86. What is `Symbol.metadata` and how does it work with TypeScript 5.2+ decorators?

`Symbol.metadata` is part of the TC39 decorators proposal. Each class with decorators gets a `[Symbol.metadata]` property—a prototype-chained object where decorators can store arbitrary metadata. In TypeScript, decorator context objects provide a `metadata` property for this purpose, replacing the need for `reflect-metadata` in many cases.

```typescript
function meta(key: string, value: unknown) {
  return function (_target: any, context: ClassMethodDecoratorContext) {
    context.metadata[key] = value;
  };
}

class Router {
  @meta("route", "/users")
  @meta("method", "GET")
  getUsers() { return []; }
}

const metadata = Router[Symbol.metadata];
// { route: "/users", method: "GET" }
```

---

## 87. How do you handle backward compatibility when evolving TypeScript library APIs?

Evolving library APIs while maintaining backward compatibility requires: (1) `typesVersions` in `package.json` for TypeScript version-specific declarations, (2) overloads that preserve old signatures while adding new ones, (3) deprecated types/functions marked with `@deprecated` JSDoc, (4) optional parameters and defaults for new features, (5) re-exports of renamed items, and (6) a clear semver policy for type-level breaking changes (which are often non-obvious).

---

## 88. What are `unique symbol` types and when are they necessary?

`unique symbol` creates a type that is unique to a specific symbol declaration. Regular `symbol` is too broad—any symbol is assignable. `unique symbol` enables: (1) branded types that are truly distinct, (2) module-level constants with precise types, (3) type-safe symbol-keyed properties.

```typescript
declare const userId: unique symbol;
declare const orderId: unique symbol;

interface User {
  [userId]: string;
}

interface Order {
  [orderId]: string;
}

// The symbol types are incompatible even though both are symbols
```

---

## 89. How does TypeScript's `emitDecoratorMetadata` work under the hood?

`emitDecoratorMetadata` (legacy decorators only) instructs TypeScript to emit calls to `Reflect.metadata()` that store design-time type information. For each decorated element, it emits three metadata keys: `design:type` (property type), `design:paramtypes` (constructor/method parameter types), and `design:returntype` (method return type). This enables runtime type inspection used by DI containers (Angular, NestJS, TypeORM). The emitted types are JavaScript constructor references (e.g., `String`, `Number`, `Object`, `Boolean`), not TypeScript types—union types, generics, and interfaces lose information.

---

## 90. What is the TypeScript compiler's approach to soundness and where does it deliberately sacrifice soundness for usability?

TypeScript's type system is intentionally unsound in several areas for practical usability: (1) bivariant method parameter checking (methods in interfaces/classes check parameters bidirectionally, not contravariantly), (2) `enum` assignability (numeric enums are assignable to `number` and vice versa), (3) `any` propagation (any value is assignable to and from `any`), (4) function parameter bivariance without `strictFunctionTypes`, (5) unchecked index access (without `noUncheckedIndexedAccess`), (6) type assertions (`as`) bypass safety, and (7) declaration merging can create impossible types. These trade-offs were made because a fully sound type system would reject too many valid JavaScript patterns, making adoption impractical. The `strict` flag family progressively adds more soundness guarantees.

---

## 91. How do you design a type-safe effect system?

Effect systems track computational effects (async, errors, dependencies) at the type level, ensuring effects are handled before execution.

```typescript
type Effect<R, E, A> = {
  readonly _tag: "Effect";
  readonly _R: (_: R) => void;
  readonly _E: () => E;
  readonly _A: () => A;
};

type EffectOf<Deps, Err, Value> = Effect<Deps, Err, Value>;

interface DatabaseService {
  query(sql: string): Promise<unknown[]>;
}

interface LoggerService {
  log(message: string): void;
}

type GetUsers = EffectOf<DatabaseService & LoggerService, Error, User[]>;

function provideDatabase<R, E, A>(
  effect: Effect<R & DatabaseService, E, A>,
  db: DatabaseService
): Effect<Exclude<R, DatabaseService>, E, A> {
  return effect as any;
}
```

---

## 92. What are the patterns for type-safe worker thread communication?

Worker threads communicate via `postMessage`. Type-safe communication uses discriminated unions for message types and generic wrappers to ensure the main thread and worker agree on the protocol.

```typescript
type MainToWorker =
  | { type: "process"; data: number[] }
  | { type: "cancel"; taskId: string }
  | { type: "config"; settings: { threads: number } };

type WorkerToMain =
  | { type: "result"; taskId: string; data: number[] }
  | { type: "progress"; taskId: string; percent: number }
  | { type: "error"; taskId: string; message: string };

interface TypedWorker<TSend, TReceive> {
  postMessage(message: TSend): void;
  addEventListener(type: "message", listener: (event: MessageEvent<TReceive>) => void): void;
}

function createTypedWorker(url: string): TypedWorker<MainToWorker, WorkerToMain> {
  return new Worker(url) as TypedWorker<MainToWorker, WorkerToMain>;
}

const worker = createTypedWorker("./worker.js");
worker.postMessage({ type: "process", data: [1, 2, 3] }); // ✔
worker.addEventListener("message", (event) => {
  switch (event.data.type) {
    case "result": console.log(event.data.data); break;
    case "progress": console.log(`${event.data.percent}%`); break;
    case "error": console.error(event.data.message); break;
  }
});
```

---

## 93. How do you implement a type-safe module federation system?

Module federation (used in micro-frontends) requires shared type contracts between independently deployed applications.

```typescript
interface FederatedModules {
  "@app/auth": {
    LoginForm: React.ComponentType<{ onSuccess: () => void }>;
    useAuth: () => { user: User | null; login: (creds: Credentials) => Promise<void> };
  };
  "@app/dashboard": {
    DashboardPage: React.ComponentType<{ userId: string }>;
  };
}

interface User { id: string; name: string; }
interface Credentials { email: string; password: string; }

type ModuleName = keyof FederatedModules;
type ModuleExports<M extends ModuleName> = FederatedModules[M];

async function loadModule<M extends ModuleName>(
  name: M
): Promise<ModuleExports<M>> {
  const module = await import(/* webpackIgnore: true */ name);
  return module as ModuleExports<M>;
}

// Usage
const auth = await loadModule("@app/auth");
const LoginForm = auth.LoginForm;  // ✔ typed as React.ComponentType<{onSuccess: () => void}>
```

---

## 94. What is the role of `declaration: true` with `emitDeclarationOnly` for library builds?

`emitDeclarationOnly` produces only `.d.ts` files without `.js` output. This is used when TypeScript generates declarations while a faster tool (SWC, esbuild) generates JavaScript. This hybrid approach gives you: (1) fast JavaScript emit from SWC/esbuild, (2) correct declaration files from TypeScript's checker, (3) declaration maps for source navigation. The trade-off is maintaining two tool configurations and ensuring they agree on output paths.

---

## 95. How do you handle type-safe polymorphic component props in React?

Polymorphic components accept an `as` prop that changes the rendered element and adjusts the accepted props accordingly. This requires advanced TypeScript generics.

```typescript
type PolymorphicProps<E extends React.ElementType, P = {}> = P &
  Omit<React.ComponentPropsWithoutRef<E>, keyof P | "as"> & {
    as?: E;
  };

type PolymorphicRef<E extends React.ElementType> =
  React.ComponentPropsWithRef<E>["ref"];

type PolymorphicPropsWithRef<E extends React.ElementType, P = {}> =
  PolymorphicProps<E, P> & { ref?: PolymorphicRef<E> };

interface ButtonOwnProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

type ButtonProps<E extends React.ElementType = "button"> =
  PolymorphicPropsWithRef<E, ButtonOwnProps>;

function Button<E extends React.ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps<E>) {
  const Component = as || "button";
  return <Component className={`btn-${variant} btn-${size}`} {...props} />;
}

// Usage
<Button>Click me</Button>                    // renders <button>
<Button as="a" href="/page">Link</Button>    // renders <a>, href is valid
// <Button as="a" onClick={...}>Link</Button>  // ✔ onClick from HTMLAnchorElement
```

---

## 96. What is the `allowImportingTsExtensions` flag?

TypeScript 5.0 introduced `allowImportingTsExtensions` which allows importing `.ts`, `.mts`, and `.tsx` files with their TypeScript extensions. It requires `noEmit` or `emitDeclarationOnly` because TypeScript cannot rewrite import specifiers. This is useful in Deno-style workflows and bundler setups where the bundler handles resolution.

---

## 97. How do you design compile-time validated configuration schemas?

Using recursive mapped types and conditional types, you can create configuration schemas that produce compile-time errors with descriptive messages when values are invalid.

```typescript
type ConfigSchema = {
  server: {
    port: { type: "number"; min: 1; max: 65535 };
    host: { type: "string" };
  };
  database: {
    connectionString: { type: "string"; pattern: "postgres://" };
    maxConnections: { type: "number"; min: 1 };
  };
};

type InferConfigType<S> = {
  [K in keyof S]: S[K] extends { type: "string" }
    ? string
    : S[K] extends { type: "number" }
      ? number
      : S[K] extends { type: "boolean" }
        ? boolean
        : S[K] extends object
          ? InferConfigType<S[K]>
          : never;
};

type AppConfig = InferConfigType<ConfigSchema>;
// {
//   server: { port: number; host: string };
//   database: { connectionString: string; maxConnections: number };
// }
```

---

## 98. How does TypeScript handle re-exports and barrel files for tree-shaking?

Barrel files (`index.ts` that re-exports everything from a directory) can harm tree-shaking because bundlers may not be able to determine which exports are used. TypeScript's role: (1) `sideEffects: false` in `package.json` tells bundlers the package has no side effects, (2) `isolatedModules` ensures each file is independently processable, (3) `export type` re-exports ensure type-only exports don't create runtime dependencies. For optimal tree-shaking: use `export type` for type re-exports, avoid barrel files for large libraries (use direct imports instead), and mark packages with `sideEffects` appropriately.

```typescript
// Barrel file — can harm tree-shaking
export { UserService } from "./UserService";
export { OrderService } from "./OrderService";
export type { User } from "./types"; // type-only — no runtime impact
```

---

## 99. What are the emerging TypeScript features in the 5.x series and beyond?

Key TypeScript 5.x features include: `const` type parameters (5.0), TC39 decorators (5.0), `moduleResolution: "bundler"` (5.0), `using`/`await using` for resource management (5.2), `NoInfer` utility (5.4), inferred type predicates (5.5), `isolatedDeclarations` (5.5), region-based narrowing improvements (5.6+), `erasableSyntaxOnly` (5.8), and ongoing improvements to inference, performance, and error messages. The trajectory is toward: better integration with build tools (SWC, esbuild, oxc), reduced need for TypeScript-specific syntax (preferring erasable annotations), and improved performance through parallel processing and caching.

---

## 100. What architectural principles should guide TypeScript adoption at scale?

Adopting TypeScript at scale requires thoughtful architectural decisions: (1) **Strict from day one**—enable `strict: true` in all new projects; retrofitting strictness is much harder, (2) **Type boundaries, not type everything**—focus typing effort on module boundaries, API contracts, and data models; internal implementation can rely more on inference, (3) **Centralize shared types**—use a shared package for domain types in monorepos, (4) **Runtime validation at system boundaries**—use Zod/io-ts/Valibot where external data enters your system; types alone are not sufficient, (5) **Invest in tooling**—custom ESLint rules, build caching (turborepo/nx), and CI type-checking pipelines pay dividends at scale, (6) **Avoid type gymnastics in application code**—complex conditional and mapped types belong in libraries and utilities, not business logic, (7) **Version your types**—treat type changes as API changes with proper semver, (8) **Monitor compilation performance**—use `generateTrace` regularly; complex types can silently degrade IDE and CI performance, (9) **Educate the team**—TypeScript skill varies widely; invest in training on variance, inference, and design patterns, and (10) **Prefer simplicity**—the best TypeScript code is code where the types are so natural they're barely noticeable.

---
