# TypeScript Advanced Patterns

TypeScript’s static types shine when you model **architecture**: design patterns, functional idioms, domain boundaries, state machines, API contracts, data access, and extensible plugins. This guide ties each area to **progressive examples**—from small, readable snippets to production-shaped patterns—so you can recognize where types prevent whole classes of bugs.

---

## 📑 Table of Contents

1. [Design Patterns](#1-design-patterns)
2. [Functional Programming](#2-functional-programming)
3. [Domain-Driven Design](#3-domain-driven-design)
4. [State Machines](#4-state-machines)
5. [Type-Safe APIs](#5-type-safe-apis)
6. [Repository Pattern](#6-repository-pattern)
7. [Plugin Architecture](#7-plugin-architecture)
8. [Best Practices](#best-practices)
9. [Common Mistakes](#common-mistakes)

---

## 1. Design Patterns

Classic **Gang of Four** patterns map cleanly to TypeScript: interfaces for abstraction, generics for reuse, `private` constructors for singletons, and structural typing for adapters. The goal is not ceremony—it is **explicit contracts** and **safe substitution**.

Patterns covered here: **Singleton**, **Factory**, **Builder**, **Observer**, **Strategy**, **Decorator** (structural), **Adapter**, **Facade**.

### 🟢 Beginner Example

**Singleton** (one shared instance) and **Factory** (centralize object creation) in their simplest typed form.

```typescript
// Singleton — single global coordinator (use sparingly; prefer DI in large apps)
class ConfigService {
  private static instance: ConfigService | undefined;

  private constructor(public readonly apiBase: string) {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService("https://api.example.com");
    }
    return ConfigService.instance;
  }
}

type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  log(level: LogLevel, message: string): void;
}

// Factory — choose implementation without exposing constructors everywhere
function createLogger(kind: "console" | "silent"): Logger {
  if (kind === "silent") {
    return { log() {} };
  }
  return {
    log(level, message) {
      console[level === "error" ? "error" : "log"](`[${level}] ${message}`);
    },
  };
}

const logger = createLogger("console");
logger.log("info", "Server started");
```

**Observer** (one-to-many notifications) with a minimal typed API:

```typescript
type Unsubscribe = () => void;

class SimpleEventBus<EventMap extends Record<string, unknown>> {
  private listeners: {
    [K in keyof EventMap]?: Array<(payload: EventMap[K]) => void>;
  } = {};

  on<K extends keyof EventMap>(event: K, fn: (payload: EventMap[K]) => void): Unsubscribe {
    const arr = (this.listeners[event] ??= []);
    arr.push(fn);
    return () => {
      this.listeners[event] = arr.filter((x) => x !== fn);
    };
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    for (const fn of this.listeners[event] ?? []) fn(payload);
  }
}

type AppEvents = { userSignedIn: { userId: string }; cartUpdated: { count: number } };

const bus = new SimpleEventBus<AppEvents>();
bus.on("userSignedIn", ({ userId }) => console.log(userId));
bus.emit("userSignedIn", { userId: "u1" });
```

### 🟡 Intermediate Example

**Builder** for fluent configuration, **Strategy** for interchangeable algorithms, and **Decorator** (structural) for layering behavior.

```typescript
// Builder — stepwise construction with a final `build()`
class HttpRequestBuilder {
  private url = "";
  private method: "GET" | "POST" = "GET";
  private headers: Record<string, string> = {};
  private body: unknown;

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setMethod(method: "GET" | "POST"): this {
    this.method = method;
    return this;
  }

  addHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  setJsonBody(data: unknown): this {
    this.body = data;
    return this;
  }

  build(): Request {
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.method === "POST" ? JSON.stringify(this.body) : undefined,
    });
  }
}

// Strategy — family of algorithms behind one interface
interface PricingStrategy {
  compute(subtotal: number): number;
}

class StandardPricing implements PricingStrategy {
  compute(subtotal: number): number {
    return subtotal;
  }
}

class VipPricing implements PricingStrategy {
  compute(subtotal: number): number {
    return subtotal * 0.9;
  }
}

function checkoutTotal(subtotal: number, strategy: PricingStrategy): number {
  return strategy.compute(subtotal);
}

// Decorator — wrap a Logger without changing callers of the core interface
function withTimestamp(base: Logger): Logger {
  return {
    log(level, message) {
      base.log(level, `[${new Date().toISOString()}] ${message}`);
    },
  };
}
```

**Adapter** wraps an incompatible interface; **Facade** hides a subsystem behind one simple entry.

```typescript
// External legacy shape
type LegacyUser = { full_name: string; user_id: number };

// Your domain shape
type User = { id: string; name: string };

function adaptLegacyUser(u: LegacyUser): User {
  return { id: String(u.user_id), name: u.full_name };
}

// Facade — one function for “do the complicated thing”
class UserModuleFacade {
  constructor(
    private readonly db: { query(sql: string): LegacyUser[] },
    private readonly cache: { get(k: string): User | undefined; set(k: string, v: User): void },
  ) {}

  getUser(id: string): User | undefined {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const rows = this.db.query(`SELECT * FROM users WHERE user_id = ${id}`);
    const user = rows[0] ? adaptLegacyUser(rows[0]) : undefined;
    if (user) this.cache.set(id, user);
    return user;
  }
}
```

### 🔴 Expert Example

Compose **Strategy + Factory + DI-style constructor types** so strategies are discoverable and type-safe. Use **branded types** for IDs in entities passed through a Facade.

```typescript
declare const brand: unique symbol;
type Brand<B> = { readonly [brand]: B };
type UserId = string & Brand<"UserId">;
type OrderId = string & Brand<"OrderId">;

function userId(id: string): UserId {
  return id as UserId;
}

interface AuthorizationContext {
  userId: UserId;
  roles: ReadonlySet<"admin" | "user">;
}

type HandlerResult<T> = { ok: true; value: T } | { ok: false; reason: string };

interface CommandHandler<Cmd, Ok> {
  canHandle(cmd: Cmd): cmd is Cmd;
  handle(ctx: AuthorizationContext, cmd: Cmd): Promise<HandlerResult<Ok>>;
}

// Example command union
type Commands =
  | { type: "DeactivateUser"; target: UserId }
  | { type: "PlaceOrder"; orderId: OrderId };

class DeactivateUserHandler implements CommandHandler<Commands, void> {
  canHandle(cmd: Commands): cmd is Extract<Commands, { type: "DeactivateUser" }> {
    return cmd.type === "DeactivateUser";
  }

  async handle(
    ctx: AuthorizationContext,
    cmd: Extract<Commands, { type: "DeactivateUser" }>,
  ): Promise<HandlerResult<void>> {
    if (!ctx.roles.has("admin")) return { ok: false, reason: "forbidden" };
    void cmd.target;
    return { ok: true, value: undefined };
  }
}
```

Structural **Decorator** chains with preserved typing (generic `compose`):

```typescript
type Fn<A, B> = (a: A) => B;

function compose<A, B, C>(f: Fn<B, C>, g: Fn<A, B>): Fn<A, C> {
  return (a) => f(g(a));
}

function withCaching<A, B>(keyFn: (a: A) => string, inner: Fn<A, B>): Fn<A, B> {
  const cache = new Map<string, B>();
  return (a) => {
    const k = keyFn(a);
    if (cache.has(k)) return cache.get(k)!;
    const v = inner(a);
    cache.set(k, v);
    return v;
  };
}
```

### 🌍 Real-Time Example

**Singleton** event hub + **Observer** for live updates (e.g. collaborative UI). Types ensure only valid payloads per channel name.

```typescript
type ChannelPayload = {
  presence: { userId: string; online: boolean };
  message: { roomId: string; text: string; from: string };
  typing: { roomId: string; userId: string };
};

class RealtimeGateway {
  private static instance: RealtimeGateway | undefined;

  private readonly bus = new SimpleEventBus<ChannelPayload>();

  private constructor() {}

  static shared(): RealtimeGateway {
    return (RealtimeGateway.instance ??= new RealtimeGateway());
  }

  subscribe<K extends keyof ChannelPayload>(channel: K, fn: (p: ChannelPayload[K]) => void): Unsubscribe {
    return this.bus.on(channel, fn);
  }

  publish<K extends keyof ChannelPayload>(channel: K, payload: ChannelPayload[K]): void {
    this.bus.emit(channel, payload);
  }
}

// UI layer — cannot mistype payload keys
const rt = RealtimeGateway.shared();
rt.subscribe("message", ({ roomId, text }) => {
  console.log(roomId, text);
});
```

---

## 2. Functional Programming

Functional style in TypeScript uses **pure functions**, **immutability** (`Readonly`, `readonly` tuples), **composition**, **currying**, and occasionally **functor/monad**-like structures for safe sequencing. Types document effects at the boundary even when the runtime is still JavaScript.

### 🟢 Beginner Example

Pure functions and `Readonly` for shallow immutability at the type level.

```typescript
function add(a: number, b: number): number {
  return a + b;
}

type Point = Readonly<{ x: number; y: number }>;

function translate(p: Point, dx: number, dy: number): Point {
  return { x: p.x + dx, y: p.y + dy };
}

const origin: Point = { x: 0, y: 0 };

type ReadonlyPointTuple = readonly [number, number];

function sumCoords([x, y]: ReadonlyPointTuple): number {
  return x + y;
}
```

### 🟡 Intermediate Example

**Composition** and a typed **`pipe`** (left-to-right). **Currying** with explicit overloads or generics.

```typescript
type Unary<A, B> = (a: A) => B;

function pipe<A>(a: A): A;
function pipe<A, B>(a: A, f1: Unary<A, B>): B;
function pipe<A, B, C>(a: A, f1: Unary<A, B>, f2: Unary<B, C>): C;
function pipe<A, B, C, D>(a: A, f1: Unary<A, B>, f2: Unary<B, C>, f3: Unary<C, D>): D;
function pipe(a: unknown, ...fns: Unary<unknown, unknown>[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), a);
}

const trim = (s: string) => s.trim();
const upper = (s: string) => s.toUpperCase();

const label = pipe("  hello  ", trim, upper);

function curry2<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R {
  return (a) => (b) => fn(a, b);
}

const addCurried = curry2((a: number, b: number) => a + b);
const addFive = addCurried(5);
addFive(3); // 8
```

### 🔴 Expert Example

**Functor** (`map`) over a container type, and a **monad-like** `Result` for short-circuiting errors without exceptions.

```typescript
type Option<T> = { tag: "some"; value: T } | { tag: "none" };

const Option = {
  some<T>(value: T): Option<T> {
    return { tag: "some", value };
  },
  none<T = never>(): Option<T> {
    return { tag: "none" };
  },
  map<T, U>(o: Option<T>, f: (t: T) => U): Option<U> {
    return o.tag === "none" ? Option.none() : Option.some(f(o.value));
  },
  flatMap<T, U>(o: Option<T>, f: (t: T) => Option<U>): Option<U> {
    return o.tag === "none" ? Option.none() : f(o.value);
  },
};

type Result<E, T> = { ok: true; value: T } | { ok: false; error: E };

const Result = {
  ok<T, E = never>(value: T): Result<E, T> {
    return { ok: true, value };
  },
  err<E, T = never>(error: E): Result<E, T> {
    return { ok: false, error };
  },
  map<E, T, U>(r: Result<E, T>, f: (t: T) => U): Result<E, U> {
    return r.ok ? Result.ok(f(r.value)) : r;
  },
  flatMap<E, T, U>(r: Result<E, T>, f: (t: T) => Result<E, U>): Result<E, U> {
    return r.ok ? f(r.value) : r;
  },
};

function parseIntString(s: string): Result<string, number> {
  const n = Number(s);
  return Number.isInteger(n) ? Result.ok(n) : Result.err("not an int");
}

function divide(a: number, b: number): Result<string, number> {
  return b === 0 ? Result.err("div0") : Result.ok(a / b);
}

const chained = Result.flatMap(parseIntString("10"), (n) => divide(n, 2));
```

### 🌍 Real-Time Example

Compose pure **normalizers** in a pipeline for websocket frames: parse JSON → validate discriminant → map to domain event. Immutability keeps each step easy to test.

```typescript
type WsFrame =
  | { type: "ping" }
  | { type: "chat"; roomId: string; text: string }
  | { type: "unknown"; raw: string };

function parseJson(raw: string): Result<string, unknown> {
  try {
    return Result.ok(JSON.parse(raw));
  } catch {
    return Result.err("invalid json");
  }
}

function asRecord(v: unknown): Result<string, Record<string, unknown>> {
  return typeof v === "object" && v !== null ? Result.ok(v as Record<string, unknown>) : Result.err("not object");
}

function toFrame(rec: Record<string, unknown>): WsFrame {
  if (rec.type === "ping") return { type: "ping" };
  if (rec.type === "chat" && typeof rec.roomId === "string" && typeof rec.text === "string") {
    return { type: "chat", roomId: rec.roomId, text: rec.text };
  }
  return { type: "unknown", raw: JSON.stringify(rec) };
}

function handleIncoming(raw: string): Result<string, WsFrame> {
  return Result.map(
    Result.flatMap(parseJson(raw), asRecord),
    toFrame,
  );
}
```

---

## 3. Domain-Driven Design

**DDD** uses **value objects** (immutable, compared by value), **entities** (identity matters), **aggregates** (consistency boundaries), and **domain events** (facts that already happened). TypeScript can encode invariants and make illegal states unrepresentable—or at least harder to construct.

### 🟢 Beginner Example

**Value object**: email as a branded string that can only be created through a validated factory.

```typescript
declare const emailBrand: unique symbol;
type Email = string & { readonly [emailBrand]: true };

type Result<E, T> = { ok: true; value: T } | { ok: false; error: E };

function createEmail(input: string): Result<string, Email> {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  return ok ? Result.ok(input as Email) : Result.err("invalid email");
}
```

Money as a small value object with validation:

```typescript
type Currency = "USD" | "EUR";

type Money = Readonly<{ currency: Currency; amount: number }>;

function money(currency: Currency, amount: number): Result<string, Money> {
  if (!Number.isFinite(amount) || amount < 0) return { ok: false, error: "bad amount" };
  return { ok: true, value: { currency, amount: Math.round(amount * 100) / 100 } };
}
```

### 🟡 Intermediate Example

**Entity** with stable ID; **aggregate root** exposes the only mutation entry points.

```typescript
declare const orderIdBrand: unique symbol;
type OrderId = string & { readonly [orderIdBrand]: true };

function orderId(id: string): OrderId {
  return id as OrderId;
}

type MoneyVO = Readonly<{ currency: "USD" | "EUR"; amount: number }>;

class OrderLine {
  constructor(
    readonly sku: string,
    readonly qty: number,
    readonly unitPrice: MoneyVO,
  ) {}

  lineTotal(): MoneyVO {
    return { currency: this.unitPrice.currency, amount: this.unitPrice.amount * this.qty };
  }
}

class Order {
  private constructor(
    readonly id: OrderId,
    private lines: readonly OrderLine[],
    private _version: number,
  ) {}

  static create(id: OrderId): Order {
    return new Order(id, [], 0);
  }

  get version(): number {
    return this._version;
  }

  addLine(line: OrderLine): Order {
    return new Order(this.id, [...this.lines, line], this._version + 1);
  }

  total(): MoneyVO {
    if (this.lines.length === 0) {
      return { currency: "USD", amount: 0 };
    }
    const c = this.lines[0].unitPrice.currency;
    const amount = this.lines.reduce((sum, l) => {
      const lt = l.lineTotal();
      if (lt.currency !== c) throw new Error("mixed currency");
      return sum + lt.amount;
    }, 0);
    return { currency: c, amount };
  }
}
```

### 🔴 Expert Example

**Domain events** as a discriminated union; **type-safe domain model** ties aggregates to events they emit.

```typescript
type DomainEvent =
  | { type: "OrderCreated"; orderId: OrderId; at: string }
  | { type: "LineAdded"; orderId: OrderId; sku: string; qty: number }
  | { type: "OrderSubmitted"; orderId: OrderId };

type EventOfType<T extends DomainEvent["type"]> = Extract<DomainEvent, { type: T }>;

class OrderAggregate {
  private events: DomainEvent[] = [];

  private constructor(
    readonly id: OrderId,
    private lines: OrderLine[],
    private submitted: boolean,
  ) {}

  static hydrate(id: OrderId, lines: OrderLine[], submitted: boolean): OrderAggregate {
    return new OrderAggregate(id, lines, submitted);
  }

  static create(id: OrderId): OrderAggregate {
    const agg = new OrderAggregate(id, [], false);
    agg.record({ type: "OrderCreated", orderId: id, at: new Date().toISOString() });
    return agg;
  }

  private record(e: DomainEvent): void {
    this.events.push(e);
  }

  pullDomainEvents(): DomainEvent[] {
    const out = [...this.events];
    this.events = [];
    return out;
  }

  addLine(line: OrderLine): void {
    if (this.submitted) throw new Error("immutable after submit");
    this.lines = [...this.lines, line];
    this.record({ type: "LineAdded", orderId: this.id, sku: line.sku, qty: line.qty });
  }

  submit(): void {
    if (this.submitted) return;
    if (this.lines.length === 0) throw new Error("empty order");
    this.submitted = true;
    this.record({ type: "OrderSubmitted", orderId: this.id });
  }
}
```

### 🌍 Real-Time Example

Project domain events into a **read model** for a live dashboard (counts, recent activity). Types ensure handlers exist for every event variant.

```typescript
type Handlers = { [E in DomainEvent as E["type"]]: (e: E) => void };

const dashboardHandlers: Handlers = {
  OrderCreated: () => {
    /* bump counter */
  },
  LineAdded: () => {
    /* update SKU popularity */
  },
  OrderSubmitted: () => {
    /* mark funnel stage */
  },
};

function applyEvent(e: DomainEvent): void {
  dashboardHandlers[e.type](e as never);
}
```

---

## 4. State Machines

Model states as **discriminated unions**, transitions as **exhaustive maps**, and optional libraries like **XState** for runtime + visual tooling. Types should make **illegal transitions** a compile error where possible.

### 🟢 Beginner Example

Traffic-light style machine: state carries only valid data for that state.

```typescript
type TrafficLight =
  | { status: "red" }
  | { status: "yellow" }
  | { status: "green" };

function next(light: TrafficLight): TrafficLight {
  switch (light.status) {
    case "red":
      return { status: "green" };
    case "green":
      return { status: "yellow" };
    case "yellow":
      return { status: "red" };
  }
}
```

### 🟡 Intermediate Example

**Transition type safety** with a map from `State` to allowed `Event` and resulting state (typed reducer).

```typescript
type DoorState = { tag: "locked" } | { tag: "closed" } | { tag: "open" };
type DoorEvent = "unlock" | "open" | "close" | "lock";

type TransitionTable = {
  locked: Partial<Record<DoorEvent, DoorState>>;
  closed: Partial<Record<DoorEvent, DoorState>>;
  open: Partial<Record<DoorEvent, DoorState>>;
};

const transitions: TransitionTable = {
  locked: { unlock: { tag: "closed" } },
  closed: { open: { tag: "open" }, lock: { tag: "locked" } },
  open: { close: { tag: "closed" } },
};

function reduceDoor(state: DoorState, event: DoorEvent): DoorState {
  const row = transitions[state.tag];
  const next = row[event];
  return next ?? state;
}
```

### 🔴 Expert Example

**XState** with TypeScript: in real projects use `setup({ types: { context: ..., events: ... } })` so `assign` and guards infer correctly. Below is a **conceptual** mirror of that pattern without importing the library.

```typescript
type PlayerCtx = { position: number; lives: number };

type PlayerState =
  | { value: "idle"; context: PlayerCtx }
  | { value: "running"; context: PlayerCtx }
  | { value: "gameOver"; context: PlayerCtx };

type PlayerEvent =
  | { type: "START" }
  | { type: "TICK"; delta: number }
  | { type: "HIT" }
  | { type: "RESET" };

function reducePlayer(s: PlayerState, e: PlayerEvent): PlayerState {
  switch (s.value) {
    case "idle":
      return e.type === "START" ? { value: "running", context: s.context } : s;
    case "running":
      if (e.type === "TICK") {
        return { value: "running", context: { ...s.context, position: s.context.position + e.delta } };
      }
      if (e.type === "HIT") {
        const lives = s.context.lives - 1;
        return lives <= 0
          ? { value: "gameOver", context: { ...s.context, lives: 0 } }
          : { value: "running", context: { ...s.context, lives } };
      }
      return s;
    case "gameOver":
      return e.type === "RESET" ? { value: "idle", context: { position: 0, lives: 3 } } : s;
  }
}
```

### 🌍 Real-Time Example

**WebSocket connection** states: `connecting` → `open` → `reconnecting` | `closed`. Discriminated unions prevent sending on wrong status without a check.

```typescript
type Result<E, T> = { ok: true; value: T } | { ok: false; error: E };

type Conn =
  | { status: "idle" }
  | { status: "connecting"; attempt: number }
  | { status: "open"; socketId: string }
  | { status: "reconnecting"; backoffMs: number }
  | { status: "closed"; reason: string };

function send(conn: Conn, msg: string): Result<string, void> {
  if (conn.status !== "open") return { ok: false, error: `cannot send in ${conn.status}` };
  console.log(conn.socketId, msg);
  return { ok: true, value: undefined };
}
```

---

## 5. Type-Safe APIs

End-to-end typing for HTTP, GraphQL, or RPC reduces **contract drift**. Prefer **single source of truth**: OpenAPI → types, GraphQL schema → types, or **tRPC** routers inferred on the client.

### 🟢 Beginner Example

**REST**: define response DTOs and a small typed `fetch` wrapper.

```typescript
type UserDto = { id: string; name: string; email: string };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function fetchUser(id: string): Promise<UserDto> {
  return getJson<UserDto>(`/api/users/${encodeURIComponent(id)}`);
}
```

### 🟡 Intermediate Example

**API contract types**: path params + query + body + response as one type family.

```typescript
type UserRoutes = {
  "/users/:id": {
    GET: {
      params: { id: string };
      response: { 200: UserDto; 404: { message: string } };
    };
    PATCH: {
      params: { id: string };
      body: Partial<Pick<UserDto, "name" | "email">>;
      response: { 200: UserDto; 400: { message: string } };
    };
  };
};

type ExtractGetResponse<P extends keyof UserRoutes> = UserRoutes[P]["GET"] extends { response: infer R }
  ? R extends { 200: infer Ok }
    ? Ok
    : never
  : never;

type UserGetOk = ExtractGetResponse<"/users/:id">;
```

### 🔴 Expert Example

**tRPC**-style inference sketch (conceptual): procedure inputs/outputs inferred from router. **GraphQL codegen** generates types from operations.

```typescript
declare function router<R extends Record<string, { input: unknown; output: unknown }>>(r: R): R;

const appRouter = router({
  userById: {
    input: {} as { id: string },
    output: {} as UserDto | null,
  },
  updateUser: {
    input: {} as { id: string; patch: Partial<Pick<UserDto, "name">> },
    output: {} as UserDto,
  },
});

type Router = typeof appRouter;
type ProcedureKey = keyof Router;
type InferInput<K extends ProcedureKey> = Router[K]["input"];
type InferOutput<K extends ProcedureKey> = Router[K]["output"];

async function call<K extends ProcedureKey>(key: K, input: InferInput<K>): Promise<InferOutput<K>> {
  return await (
    await fetch(`/rpc/${String(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    })
  ).json();
}
```

GraphQL with codegen (illustrative types you might generate):

```typescript
type GetUserQueryVariables = { id: string };
type GetUserQuery = { user: Pick<UserDto, "id" | "name"> | null };
```

### 🌍 Real-Time Example

**OpenAPI / Swagger**: consume generated types for a live metrics endpoint.

```typescript
type paths = {
  "/metrics/live": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              schema: { activeUsers: number; requestsPerSec: number };
            };
          };
        };
      };
    };
  };
};

type LiveMetrics = paths["/metrics/live"]["get"]["responses"]["200"]["content"]["application/json"]["schema"];

async function fetchLiveMetrics(): Promise<LiveMetrics> {
  return getJson<LiveMetrics>("/metrics/live");
}
```

---

## 6. Repository Pattern

A **repository** hides persistence behind a domain-oriented interface. Generics model **entity types**, and the **specification pattern** composes query predicates in a type-safe way.

### 🟢 Beginner Example

Generic **CRUD** interface for an entity with a string id.

```typescript
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | undefined>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

type Product = { id: string; name: string; price: number };

class InMemoryProductRepo implements Repository<Product> {
  private readonly store = new Map<string, Product>();

  async findById(id: string): Promise<Product | undefined> {
    return this.store.get(id);
  }

  async save(entity: Product): Promise<void> {
    this.store.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
```

### 🟡 Intermediate Example

**Typed query builder** (fluent, immutable steps) for a subset of fields.

```typescript
type SortDir = "asc" | "desc";

class QueryBuilder<T> {
  private _where: Partial<T> | undefined;
  private _sort: { key: keyof T & string; dir: SortDir } | undefined;
  private _take: number | undefined;

  where(w: Partial<T>): this {
    const q = Object.create(this);
    q._where = w;
    return q;
  }

  sort<K extends keyof T & string>(key: K, dir: SortDir): this {
    const q = Object.create(this);
    q._sort = { key, dir };
    return q;
  }

  take(n: number): this {
    const q = Object.create(this);
    q._take = n;
    return q;
  }

  build(): { where?: Partial<T>; sort?: { key: keyof T & string; dir: SortDir }; take?: number } {
    return { where: this._where, sort: this._sort, take: this._take };
  }
}
```

### 🔴 Expert Example

**Specification pattern**: composable, reusable predicates; `and`/`or` preserve entity type.

```typescript
interface Specification<T> {
  isSatisfiedBy(entity: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
}

class BaseSpec<T> implements Specification<T> {
  constructor(private readonly pred: (entity: T) => boolean) {}

  isSatisfiedBy(entity: T): boolean {
    return this.pred(entity);
  }

  and(other: Specification<T>): Specification<T> {
    return new BaseSpec((e) => this.pred(e) && other.isSatisfiedBy(e));
  }

  or(other: Specification<T>): Specification<T> {
    return new BaseSpec((e) => this.pred(e) || other.isSatisfiedBy(e));
  }
}

const expensive = new BaseSpec<Product>((p) => p.price > 100);
const namedLike = (substr: string) => new BaseSpec<Product>((p) => p.name.includes(substr));

const spec = expensive.and(namedLike("Pro"));

interface ProductRepository {
  findBySpec(spec: Specification<Product>): Promise<Product[]>;
}
```

### 🌍 Real-Time Example

Repository method returns **domain + cursor** for live feeds (type-safe pagination).

```typescript
type Page<T> = { items: T[]; nextCursor: string | null };

interface Activity {
  id: string;
  at: string;
  text: string;
}

interface ActivityRepository {
  listSince(cursor: string | null, limit: number): Promise<Page<Activity>>;
}

class SqlActivityRepository implements ActivityRepository {
  async listSince(_cursor: string | null, _limit: number): Promise<Page<Activity>> {
    return { items: [], nextCursor: null };
  }
}
```

---

## 7. Plugin Architecture

**Plugins** extend core behavior through **interfaces**, **registries**, and **hooks**. TypeScript can enforce: required capabilities, event payload shapes, and registration order constraints (via types + tests).

### 🟢 Beginner Example

Minimal plugin interface and registration.

```typescript
interface EditorPlugin {
  name: string;
  activate(): void;
}

const plugins: EditorPlugin[] = [];

function registerPlugin(p: EditorPlugin): void {
  plugins.push(p);
}

registerPlugin({
  name: "spellcheck",
  activate() {
    console.log("spellcheck on");
  },
});
```

### 🟡 Intermediate Example

**Type-safe plugin system** with a map from plugin id → typed config.

```typescript
type PluginId = "analytics" | "seo";

type PluginConfig = {
  analytics: { trackingId: string };
  seo: { defaultTitle: string };
};

type PluginDefinition<K extends PluginId = PluginId> = {
  id: K;
  setup(config: PluginConfig[K]): void;
};

class PluginRegistry {
  private readonly defs = new Map<PluginId, PluginDefinition>();

  register<K extends PluginId>(def: PluginDefinition<K>): void {
    this.defs.set(def.id, def);
  }

  initAll(config: PluginConfig): void {
    for (const def of this.defs.values()) {
      def.setup(config[def.id]);
    }
  }
}
```

### 🔴 Expert Example

**Hook system types**: ordered hooks with contextual accumulator (plugin middleware).

```typescript
type HookName = "beforeSave" | "afterSave";

type HookPayload = {
  beforeSave: { draft: string };
  afterSave: { id: string };
};

type HookFn<N extends HookName> = (payload: HookPayload[N], next: () => void) => void;

class HookableCore {
  private readonly hooks: { [N in HookName]: HookFn<N>[] } = {
    beforeSave: [],
    afterSave: [],
  };

  on<N extends HookName>(name: N, fn: HookFn<N>): void {
    this.hooks[name].push(fn);
  }

  run<N extends HookName>(name: N, payload: HookPayload[N]): void {
    const stack = [...this.hooks[name]];
    const dispatch = (i: number): void => {
      if (i >= stack.length) return;
      stack[i](payload, () => dispatch(i + 1));
    };
    dispatch(0);
  }
}

const core = new HookableCore();
core.on("beforeSave", (p, next) => {
  p.draft = p.draft.trim();
  next();
});
```

**Plugin registry types** with `satisfies` for excess property checking:

```typescript
const analytics = {
  id: "analytics" as const,
  setup(cfg: PluginConfig["analytics"]) {
    console.log(cfg.trackingId);
  },
} satisfies PluginDefinition<"analytics">;
```

### 🌍 Real-Time Example

**Feature flags + plugins**: only load realtime plugin when enabled; types tie plugin API to socket events.

```typescript
interface RealtimePlugin {
  id: "realtime";
  connect(url: string): Promise<{ on(event: "tick", fn: (t: number) => void): void }>;
}

async function loadPlugins(flags: { realtime: boolean }): Promise<void> {
  const mods: RealtimePlugin[] = [];
  if (flags.realtime) {
    const mod: RealtimePlugin = {
      id: "realtime",
      async connect(url: string) {
        console.log("connect", url);
        return {
          on(_event, fn) {
            setInterval(() => fn(Date.now()), 1000);
          },
        };
      },
    };
    mods.push(mod);
  }
  for (const m of mods) {
    const client = await m.connect("wss://live.example.com");
    client.on("tick", (t) => console.log("server time", t));
  }
}
```

---

## Best Practices

- **Prefer composition over inheritance** for behavior reuse; use interfaces for contracts and small classes for lifecycle when needed.
- **Model illegal states as unrepresentable** (discriminated unions, branded types) especially for IDs, money, and connection status.
- **Keep domain types separate from DTOs**; map at boundaries (API, DB) with explicit functions.
- **Use exhaustive `switch`** with `never` checks when adding new union members so the compiler flags missing cases.
- **Single source of truth for APIs**: OpenAPI codegen, GraphQL codegen, or tRPC-style inference—avoid hand-copying response shapes.
- **Repositories return domain objects**, not ORM rows; keep query builders or specifications on the infrastructure side if they leak SQL concepts.
- **Version plugin interfaces** (`v1`, `v2`) or use optional capabilities objects when you evolve extension points.
- **Test pure reducers** for state machines (domain and UI) independently of I/O.
- **Document threading model** for singletons and event buses (main thread vs worker) to avoid hidden coupling.
- **Avoid `as` casts at system boundaries**; prefer validation libraries (zod, valibot, arktype) and typed narrowing.
- **Align DDD aggregates with transactions**—one aggregate per consistency boundary in typical relational designs.
- **Use readonly tuples and `ReadonlyArray`** when exposing internal collections from domain objects.
- **Keep functors/monads consistent**—if you expose `map`/`flatMap`, document laws or deviations your team relies on.

---

## Common Mistakes

- **Singleton abuse**: global mutable state makes testing and SSR hard; use DI or per-request scope in servers.
- **Decorator confusion**: TypeScript *decorators* (stage 3 proposal) differ from the *Decorator pattern*; mixing them in docs confuses readers.
- **Over-generic repositories**: `Repository<any>` erases benefits; constrain `T` and expose domain-specific methods when queries are specialized.
- **Anemic domain models**: types without behavior still allow invalid sequences; encapsulate invariants in methods or factories.
- **Missing `readonly` on DDD value objects**: shallow mutability breaks mental model and shared references.
- **Untyped JSON**: `as UserDto` without runtime validation fails silently when the API changes.
- **Hook pipelines without timeouts**: plugins can block `next()`; add deadlines or async patterns for production.
- **State machine stringly-typed events**: using plain `string` for event names loses exhaustiveness—use unions or const maps.
- **GraphQL `any` from resolvers**: disable implicit `any` and generate types for parent/args/context.
- **Plugin registry init order bugs**: typed configs help, but circular dependencies still need explicit dependency sorting or lazy `setup`.
- **Functor/map without laws**: ad-hoc `map` that ignores structure surprises consumers; keep helpers consistent or document deviations.
- **Leaking infrastructure into aggregates**: calling HTTP or SQL from `Order.submit` couples domains to IO—raise events and handle in application services.
- **Confusing Adapter vs Facade**: Adapter fixes *interface* mismatch; Facade simplifies *many* calls—do not use the names interchangeably.
- **XState context widening**: assigning `any` into context defeats inference—use `setup({ types: { ... } })` in real XState v5 projects.
- **Repository returning pagination as loosely typed tuples**—prefer named `Page<T>` or cursor types for clarity at call sites.

---
