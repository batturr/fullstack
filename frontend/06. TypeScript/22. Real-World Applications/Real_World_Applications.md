# TypeScript Real-World Applications

Production-oriented TypeScript: shared contracts, libraries, services, Redux, forms, and fetching — each topic uses **Beginner → Intermediate → Expert → Real-Time** examples.

---

## 📑 Table of Contents

1. [Full-Stack Application](#1-full-stack-application)
2. [Library Development](#2-library-development)
3. [Microservices](#3-microservices)
4. [State Management (Redux)](#4-state-management-redux)
5. [Form Handling](#5-form-handling)
6. [Data Fetching](#6-data-fetching)
7. [Best Practices](#best-practices)

---

## 1. Full-Stack Application

**Principles:** One source of truth across the wire; schema-first validation with inferred types; branded IDs and discriminated API errors; separate **claims**, **tokens**, and **session** user views.

### 🟢 Beginner Example

```typescript
// packages/shared/src/types.ts — consumed by frontend and backend

/** User as stored or returned by the API (no password). */
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string; // ISO 8601 from JSON
}

export interface ApiErrorBody {
  code: string;
  message: string;
}

/** Compile-time check: login response shape matches what UI expects. */
export type LoginResponse =
  | { ok: true; user: User; token: string }
  | { ok: false; error: ApiErrorBody };

// Backend handler (Express-style) — return type documents the contract
import type { Request, Response } from "express";
import type { LoginResponse } from "@app/shared";

export function loginHandler(_req: Request, res: Response<LoginResponse>) {
  const body: LoginResponse = {
    ok: true,
    user: {
      id: "u_1",
      email: "a@b.com",
      displayName: "Ada",
      createdAt: new Date().toISOString(),
    },
    token: "jwt-here",
  };
  res.json(body);
}

// Frontend — `data` is narrowed after checking `ok`
async function consumeLogin(): Promise<User | null> {
  const res = await fetch("/api/login", { method: "POST" });
  const data = (await res.json()) as LoginResponse;
  if (data.ok) return data.user;
  console.error(data.error.message);
  return null;
}
```

### 🟡 Intermediate Example

```typescript
// Schema-first: Zod validates at runtime; TypeScript stays in sync.
import { z } from "zod";

export const UserRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string(),
  display_name: z.string().min(1),
  created_at: z.coerce.date(),
});

export type UserRow = z.infer<typeof UserRowSchema>;

/** Public API shape — omit secrets, rename to camelCase */
export const UserPublicSchema = UserRowSchema.pick({
  id: true,
  email: true,
  display_name: true,
  created_at: true,
}).transform((row) => ({
  id: row.id,
  email: row.email,
  displayName: row.display_name,
  createdAt: row.created_at.toISOString(),
}));

export type UserPublic = z.infer<typeof UserPublicSchema>;

/** HTTP contract for POST /users */
export const CreateUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  displayName: z.string().min(1).max(80),
});

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;

export const CreateUserResponseSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), user: UserPublicSchema }),
  z.object({
    ok: z.literal(false),
    error: z.object({ code: z.string(), message: z.string() }),
  }),
]);

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;

// Backend: parse + type-safe handler
function createUser(body: unknown): CreateUserResponse {
  const parsed = CreateUserBodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.message },
    };
  }
  const row: UserRow = {
    id: crypto.randomUUID(),
    email: parsed.data.email,
    password_hash: "hashed",
    display_name: parsed.data.displayName,
    created_at: new Date(),
  };
  const user = UserPublicSchema.parse(row);
  return { ok: true, user };
}
// Frontend imports CreateUserBody / schemas from the same package — keys stay aligned.
```

### 🔴 Expert Example

```typescript
// Branded IDs + JWT claims + route-level method/path typing

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, "UserId">;
export type OrgId = Brand<string, "OrgId">;

export function toUserId(id: string): UserId {
  if (!/^usr_[a-z0-9]+$/.test(id)) throw new Error("Invalid UserId");
  return id as UserId;
}

/** Decoded JWT — separate from DB row and from public profile */
export interface AccessTokenClaims {
  sub: UserId;
  orgId: OrgId;
  roles: readonly ("admin" | "member")[];
  exp: number;
  iat: number;
}

/** API errors: exhaustive handling in clients */
export type ApiError =
  | { tag: "UNAUTHORIZED"; realm?: string }
  | { tag: "FORBIDDEN"; requiredRole: string }
  | { tag: "NOT_FOUND"; resource: "user" | "org" | "invoice" }
  | { tag: "CONFLICT"; field: "email" }
  | { tag: "RATE_LIMIT"; retryAfterSeconds: number };

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError; requestId: string };

/** Typed REST map: wrong path or method is a compile error */
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Routes = {
  "/v1/users/:userId": {
    GET: { params: { userId: UserId }; res: ApiResult<{ user: UserPublic }> };
    PATCH: {
      params: { userId: UserId };
      body: Partial<Pick<UserPublic, "displayName">>;
      res: ApiResult<{ user: UserPublic }>;
    };
  };
};

type UserPublic = {
  id: UserId;
  email: string;
  displayName: string;
  createdAt: string;
};

type PathParams<P extends string> = P extends `${infer _}:${infer Param}/${infer Rest}`
  ? Record<Param, string> & PathParams<`/${Rest}`>
  : P extends `${infer _}:${infer Param}`
    ? Record<Param, string>
    : {};

// Client helper preserves method + path correlation
async function apiCall<M extends HttpMethod, P extends keyof Routes & string>(
  method: M,
  path: P,
  ...args: M extends keyof Routes[P]
    ? Routes[P][M] extends { body: infer B }
      ? [opts: { params: PathParams<P>; body: B }]
      : [opts: { params: PathParams<P> }]
    : never
): Promise<Routes[P][M] extends { res: infer R } ? R : never> {
  void method;
  void path;
  void args;
  return { ok: false, error: { tag: "UNAUTHORIZED" }, requestId: "r1" } as never;
}

// Usage: TypeScript enforces params shape
declare const uid: UserId;
void apiCall("GET", "/v1/users/:userId", { params: { userId: uid } });
```

### 🌍 Real-Time Example

```typescript
/** WebSocket / SSE message contract shared by server and browser */

export type ClientToServerMessage =
  | { type: "subscribe"; channel: `org:${string}` }
  | { type: "unsubscribe"; channel: string }
  | { type: "ping"; nonce: number };

export type ServerToClientMessage =
  | { type: "pong"; nonce: number }
  | {
      type: "notification";
      id: string;
      payload:
        | { kind: "user_joined"; userId: string; orgId: string }
        | { kind: "invoice_paid"; invoiceId: string; amountCents: number };
    }
  | { type: "error"; code: "BAD_CHANNEL" | "AUTH"; message: string };

function isServerMessage(raw: unknown): raw is ServerToClientMessage {
  if (typeof raw !== "object" || raw === null || !("type" in raw)) return false;
  const t = (raw as { type: unknown }).type;
  return t === "pong" || t === "notification" || t === "error";
}

export class TypedWebSocket {
  constructor(private ws: WebSocket) {}

  send(msg: ClientToServerMessage): void {
    this.ws.send(JSON.stringify(msg));
  }

  onMessage(handler: (msg: ServerToClientMessage) => void): () => void {
    const fn = (ev: MessageEvent) => {
      try {
        const data: unknown = JSON.parse(String(ev.data));
        if (isServerMessage(data)) handler(data);
      } catch {
        /* ignore */
      }
    };
    this.ws.addEventListener("message", fn);
    return () => this.ws.removeEventListener("message", fn);
  }
}

// Reducer-style handler: exhaustiveness on notification payloads
function handleRealtime(msg: ServerToClientMessage): void {
  switch (msg.type) {
    case "pong":
      return;
    case "error":
      console.warn(msg.code, msg.message);
      return;
    case "notification":
      if (msg.payload.kind === "user_joined") {
        console.log("join", msg.payload.userId);
      } else {
        console.log("paid", msg.payload.invoiceId, msg.payload.amountCents);
      }
      return;
    default: {
      const _n: never = msg;
      void _n;
    }
  }
}
```

## 2. Library Development

**Principles:** Export explicit public types; generics with constraints; plugins via small core + **module augmentation**; avoid breaking narrowing in minors (`@deprecated`, overloads); ship `.d.ts` and verify with **attw** / **publint**.

### 🟢 Beginner Example

```typescript
/** @package my-logger — explicit public surface */
export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}
export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}
const order: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
export function createLogger(options: LoggerOptions = {}): Logger {
  const min = order[options.level ?? "info"];
  const p = options.prefix ? `[${options.prefix}] ` : "";
  const log =
    (level: LogLevel, fn: typeof console.log) =>
    (...args: unknown[]) => {
      if (order[level] >= min) fn(p, ...args);
    };
  return {
    debug: log("debug", console.debug),
    info: log("info", console.info),
    warn: log("warn", console.warn),
    error: log("error", console.error),
  };
}
createLogger({ level: "debug", prefix: "app" }).info("started");
```

### 🟡 Intermediate Example

```typescript
/** Generic storage — app supplies `T`; library stays agnostic */
export interface Serializer<T> {
  parse(raw: string): T;
  stringify(value: T): string;
}
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface TypedStorageOptions<T> {
  key: string;
  adapter?: StorageAdapter;
  serializer?: Serializer<T>;
  fallback: T;
}
const json = <T>(): Serializer<T> => ({
  parse: (raw) => JSON.parse(raw) as T,
  stringify: (v) => JSON.stringify(v),
});
export function createTypedStorage<T>(options: TypedStorageOptions<T>) {
  const adapter = options.adapter ?? globalThis.localStorage;
  const ser = options.serializer ?? json<T>();
  return {
    read(): T {
      const raw = adapter.getItem(options.key);
      if (raw === null) return options.fallback;
      try {
        return ser.parse(raw);
      } catch {
        return options.fallback;
      }
    },
    write(value: T) {
      adapter.setItem(options.key, ser.stringify(value));
    },
    clear() {
      adapter.removeItem(options.key);
    },
  };
}
interface Session {
  userId: string;
  theme: "light" | "dark";
}
createTypedStorage<Session>({ key: "session", fallback: { userId: "", theme: "light" } }).read()
  .theme;
```

### 🔴 Expert Example

```typescript
/**
 * Plugin registry: core stays small; plugins extend via declaration merging.
 */

// --- core/types.ts (published) ---
export interface PluginContext {
  version: string;
}

export interface Plugin<TOptions = unknown> {
  name: string;
  apply: (ctx: PluginContext, options: TOptions) => void;
}

export interface PluginRegistry {
  register<P extends Plugin>(plugin: P, options?: unknown): void;
}

export function createRegistry(): PluginRegistry {
  const plugins: Plugin[] = [];
  return {
    register(plugin, options) {
      plugin.apply({ version: "1.0.0" }, options);
      plugins.push(plugin);
    },
  };
}

// --- consumer augments optional channel (module augmentation) ---
declare module "./core/types" {
  interface PluginContext {
    /** Added when @my-kit/analytics is installed */
    analytics?: { track: (e: string) => void };
  }
}

// Plugin with typed options
const metricsPlugin: Plugin<{ sampleRate: number }> = {
  name: "metrics",
  apply(ctx, options) {
    ctx.analytics?.track(`sample:${options.sampleRate}`);
  },
};

const registry = createRegistry();
registry.register(metricsPlugin, { sampleRate: 0.1 });
```

### 🌍 Real-Time Example

```typescript
/** package.json: "types", "exports"; tsconfig: declaration + declarationMap */
export type { Config } from "./config";
export { createClient } from "./client";

export interface Config {
  /** @deprecated Use baseUrl (removed in v2) */
  endpoint?: string;
  baseUrl: string;
  timeoutMs?: number;
}

/** @deprecated */ export function normalizeConfig(endpoint: string): Config;
export function normalizeConfig(cfg: Config): Config;
export function normalizeConfig(cfgOrEndpoint: Config | string): Config {
  if (typeof cfgOrEndpoint === "string") {
    return { baseUrl: cfgOrEndpoint, endpoint: cfgOrEndpoint };
  }
  return {
    ...cfgOrEndpoint,
    baseUrl: cfgOrEndpoint.baseUrl ?? cfgOrEndpoint.endpoint ?? "",
  };
}
```

## 3. Microservices

**Principles:** Versioned contracts (OpenAPI/Proto/JSON Schema) in a shared package; queues carry **idempotency keys**; events carry **correlationId**, **occurredAt**, discriminated **type**; narrow DTOs per service.

### 🟢 Beginner Example

```typescript
// packages/contracts/src/orders.ts

/** HTTP sync call between Order and Inventory services */
export interface ReserveStockRequest {
  orderId: string;
  sku: string;
  quantity: number;
}

export type ReserveStockResponse =
  | { status: "reserved"; reservationId: string }
  | { status: "out_of_stock"; available: number }
  | { status: "invalid_sku" };

// Inventory service implements; Order service imports the same types
async function callInventory(
  body: ReserveStockRequest
): Promise<ReserveStockResponse> {
  const res = await fetch("http://inventory.internal/reserve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as ReserveStockResponse;
}
```

### 🟡 Intermediate Example

```typescript
/** Queue jobs: union of payloads + shared envelope */

export interface JobEnvelope<TType extends string, TPayload> {
  jobId: string;
  type: TType;
  payload: TPayload;
  enqueuedAt: string;
  attempt: number;
  /** For idempotent consumers */
  idempotencyKey: string;
}

export type EmailJob = JobEnvelope<
  "send_email",
  { to: string; templateId: string; data: Record<string, string> }
>;

export type IndexJob = JobEnvelope<
  "reindex_search",
  { entity: "product" | "user"; id: string }
>;

export type AnyJob = EmailJob | IndexJob;

function processJob(job: AnyJob): void {
  switch (job.type) {
    case "send_email":
      console.log(job.payload.templateId, job.payload.to);
      return;
    case "reindex_search":
      console.log(job.payload.entity, job.payload.id);
      return;
    default: {
      const _: never = job;
      void _;
    }
  }
}
```

### 🔴 Expert Example

```typescript
/** Domain events + cloud-events style metadata for event bus */

export interface EventMeta {
  eventId: string;
  correlationId: string;
  causationId?: string;
  occurredAt: string; // ISO
  producer: string;
  schemaVersion: 1 | 2;
}

export type DomainEvent =
  | (EventMeta & {
      type: "OrderPlaced";
      data: { orderId: string; customerId: string; totalCents: number };
    })
  | (EventMeta & { type: "OrderCancelled"; data: { orderId: string; reason: string } });

/** Mapped handlers: one function per `type` literal */
type HandlerMap = {
  [E in DomainEvent as E["type"]]: (e: Extract<DomainEvent, { type: E["type"] }>) => Promise<void>;
};

const handlers: Partial<HandlerMap> = {
  async OrderPlaced(e) {
    console.log(e.data.orderId, e.correlationId);
  },
  async OrderCancelled(e) {
    console.log(e.data.reason);
  },
};

async function dispatch(event: DomainEvent): Promise<void> {
  const h = handlers[event.type];
  if (h) await h(event as never);
}
```

### 🌍 Real-Time Example

```typescript
export interface OutboxRow {
  id: string;
  aggregateType: "order" | "invoice";
  aggregateId: string;
  /** Serialized DomainEvent or protobuf bytes reference */
  payload: string;
  createdAt: Date;
  publishedAt: Date | null;
}

export type MessageBusPublishResult =
  | { ok: true; messageId: string }
  | { ok: false; error: "TIMEOUT" | "BROKER_DOWN"; retryable: boolean };

/** Consumer side: at-least-once delivery => handler must be idempotent */
export interface ConsumedMessage {
  deliveryTag: string;
  body: Uint8Array;
  headers: Record<string, string | undefined>;
}

type OutboxPayload = { type: string; [k: string]: unknown };

export async function handleWithIdempotency(
  msg: ConsumedMessage,
  store: { seen(key: string): Promise<boolean>; mark(key: string): Promise<void> },
  handler: (body: OutboxPayload) => Promise<void>
): Promise<void> {
  const key = msg.headers["idempotency-key"];
  if (!key) throw new Error("missing idempotency-key");
  if (await store.seen(key)) return;
  const parsed = JSON.parse(new TextDecoder().decode(msg.body)) as OutboxPayload;
  await handler(parsed);
  await store.mark(key);
}
```

## 4. State Management (Redux)

**Principles:** Single **RootState** / **AppDispatch** + typed hooks; unions or **PayloadAction** for exhaustive reducers; colocate selectors (**Reselect** `createSelector`); middleware typed for `getState` / custom `dispatch`.

### 🟢 Beginner Example

```typescript
import { createStore } from "redux";

type CounterAction =
  | { type: "counter/increment" }
  | { type: "counter/decrement" }
  | { type: "counter/set"; payload: number };

interface CounterState {
  value: number;
}

const initialState: CounterState = { value: 0 };

function counterReducer(
  state = initialState,
  action: CounterAction
): CounterState {
  switch (action.type) {
    case "counter/increment":
      return { value: state.value + 1 };
    case "counter/decrement":
      return { value: state.value - 1 };
    case "counter/set":
      return { value: action.payload };
    default:
      return state;
  }
}

export const store = createStore(counterReducer);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed selector helper (pattern used with react-redux)
import { useSelector, TypedUseSelectorHook } from "react-redux";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function selectCount(state: RootState): number {
  return state.value;
}

// Component: useAppSelector(selectCount) — `state` is RootState
```

### 🟡 Intermediate Example

```typescript
import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

type UserId = string;

interface User {
  id: UserId;
  name: string;
}

interface UsersState {
  byId: Record<UserId, User | undefined>;
  ids: UserId[];
  loading: boolean;
}

const usersSlice = createSlice({
  name: "users",
  initialState: {
    byId: {},
    ids: [],
    loading: false,
  } as UsersState,
  reducers: {
    usersLoading(state) {
      state.loading = true;
    },
    usersReceived(state, action: PayloadAction<User[]>) {
      state.loading = false;
      for (const u of action.payload) {
        state.byId[u.id] = u;
        if (!state.ids.includes(u.id)) state.ids.push(u.id);
      }
    },
  },
});

const store = configureStore({
  reducer: { users: usersSlice.reducer },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

const { usersLoading, usersReceived } = usersSlice.actions;

// Thunk: typed dispatch + getState
export function fetchUsers(): (dispatch: AppDispatch, getState: () => RootState) => Promise<void> {
  return async (dispatch, getState) => {
    if (getState().users.loading) return;
    dispatch(usersLoading());
    const res = await fetch("/api/users");
    const data = (await res.json()) as User[];
    dispatch(usersReceived(data));
  };
}
```

### 🔴 Expert Example

```typescript
import {
  configureStore,
  createListenerMiddleware,
  createSlice,
  type ListenerEffectAPI,
  type PayloadAction,
  type TypedStartListening,
} from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as { sku: string; qty: number }[] },
  reducers: {
    itemAdded(state, action: PayloadAction<{ sku: string; qty: number }>) {
      state.items.push(action.payload);
    },
  },
});

const uiSlice = createSlice({
  name: "ui",
  initialState: { toast: null as string | null },
  reducers: {
    toastShown(state, action: PayloadAction<string>) {
      state.toast = action.payload;
    },
  },
});

const listenerMiddleware = createListenerMiddleware();

type RootState = {
  cart: ReturnType<typeof cartSlice.reducer>;
  ui: ReturnType<typeof uiSlice.reducer>;
};
type AppDispatch = ReturnType<typeof makeStore>["dispatch"];

const startAppListening =
  listenerMiddleware.startListening as TypedStartListening<RootState, AppDispatch>;

startAppListening({
  actionCreator: cartSlice.actions.itemAdded,
  effect: async (
    action,
    api: ListenerEffectAPI<RootState, AppDispatch>
  ) => {
    api.dispatch(uiSlice.actions.toastShown(`Added ${action.payload.sku}`));
  },
});

function makeStore() {
  return configureStore({
    reducer: {
      cart: cartSlice.reducer,
      ui: uiSlice.reducer,
    },
    middleware: (gDM) => gDM().prepend(listenerMiddleware.middleware),
  });
}

export const store = makeStore();
```

### 🌍 Real-Time Example

```typescript
import type { Middleware } from "redux";

type WsAction =
  | { type: "ws/connected" }
  | { type: "ws/disconnected"; code: number }
  | { type: "ws/message"; payload: { topic: string; data: unknown } };

type WsState = { status: "idle" | "open" | "closed"; lastCode: number | null };

function wsReducer(state: WsState = { status: "idle", lastCode: null }, action: WsAction): WsState {
  switch (action.type) {
    case "ws/connected":
      return { ...state, status: "open" };
    case "ws/disconnected":
      return { status: "closed", lastCode: action.code };
    default:
      return state;
  }
}

type RootState = { ws: WsState };

export const wsMiddleware: Middleware<object, RootState, (a: WsAction) => WsAction> =
  () => (next) => (action) => next(action);
```

## 5. Form Handling

**Principles:** One `FormValues` generic; errors as `path → message`; RHF `useForm` + **Resolver**; Formik **`FormikProps<Values>`**; be consistent on `undefined` vs `null` for optionals.

### 🟢 Beginner Example

```typescript
/** Plain form state — no library, full typing */

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  submitting: boolean;
}

function validateLogin(values: LoginFormValues): Partial<
  Record<keyof LoginFormValues, string>
> {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {};
  if (!values.email.includes("@")) errors.email = "Invalid email";
  if (values.password.length < 8) errors.password = "Too short";
  return errors;
}

function createInitialFormState(): FormState<LoginFormValues> {
  return {
    values: { email: "", password: "", remember: false },
    errors: {},
    touched: {},
    submitting: false,
  };
}

// Compile-time: cannot set errors for unknown keys
function setFieldError<K extends keyof LoginFormValues>(
  state: FormState<LoginFormValues>,
  key: K,
  message: string
): FormState<LoginFormValues> {
  return { ...state, errors: { ...state.errors, [key]: message } };
}
```

### 🟡 Intermediate Example

```typescript
/**
 * React Hook Form + Zod — schema drives both runtime and FormValues
 * deps: react-hook-form, @hookform/resolvers/zod, zod
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ProfileSchema = z.object({
  username: z.string().min(2),
  age: z.coerce.number().min(18),
  website: z.string().url().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

export function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { username: "", age: 18, website: "" },
  });

  const onValid = (data: ProfileFormValues) => {
    // `data` matches schema — safe to send to API
    console.log(data.username, data.age);
  };

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <input {...register("username")} />
      {errors.username && <span>{errors.username.message}</span>}
      <input type="number" {...register("age")} />
      <input {...register("website")} />
      <button type="submit">Save</button>
    </form>
  );
}
```

### 🔴 Expert Example

```typescript
/**
 * Nested / array fields with typed path helpers
 */

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

interface Address {
  line1: string;
  city: string;
}

interface OrderFormValues extends FieldValues {
  customer: { name: string; email: string };
  addresses: Address[];
}

function registerAddressFields(form: UseFormReturn<OrderFormValues>, index: number) {
  const base = `addresses.${index}` as const;
  const line1: FieldPath<OrderFormValues> = `${base}.line1`;
  const city: FieldPath<OrderFormValues> = `${base}.city`;
  return { line1: form.register(line1), city: form.register(city) };
}

type WizardValues =
  | { step: 1; account: { email: string } }
  | { step: 2; profile: { bio: string } };

function bioIfStep2(v: WizardValues): string | undefined {
  return v.step === 2 ? v.profile.bio : undefined;
}
```

### 🌍 Real-Time Example

```typescript
import type { FormikProps } from "formik";

interface RealtimeCommentValues {
  body: string;
  optimisticId: string;
}

type CommentFieldBag = Pick<
  FormikProps<RealtimeCommentValues>,
  "values" | "handleChange" | "handleSubmit" | "errors" | "isSubmitting"
>;

function mergeServerAck(
  local: RealtimeCommentValues,
  server: { id: string; body: string }
): RealtimeCommentValues {
  if (server.body !== local.body) return local;
  return { ...local, optimisticId: server.id };
}
// CommentFieldBag = props passed into <form> / fields for realtime comments
```

## 6. Data Fetching

**Principles:** Discriminated API success/error; typed query objects → `URLSearchParams`; TanStack **query key factories** (readonly tuples); SWR `useSWR<Data, Err>`; parse JSON as `unknown` then narrow.

### 🟢 Beginner Example

```typescript
type HttpMethod = "GET" | "POST";

async function httpJson<T>(
  url: string,
  init?: { method?: HttpMethod; body?: unknown }
): Promise<T> {
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

interface Product {
  id: string;
  name: string;
  priceCents: number;
}

/** Query params typed at call site */
function productsQuery(params: { q?: string; page: number }): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  sp.set("page", String(params.page));
  return `/api/products?${sp.toString()}`;
}

async function loadProducts(params: { q?: string; page: number }) {
  return httpJson<{ items: Product[] }>(productsQuery(params));
}
```

### 🟡 Intermediate Example

```typescript
import type { QueryKey } from "@tanstack/react-query";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: { userId: string }) => [...todoKeys.lists(), filters] as const,
} satisfies Record<string, unknown>;

async function fetchTodoList(filters: { userId: string }): Promise<Todo[]> {
  const res = await fetch(`/api/todos?userId=${encodeURIComponent(filters.userId)}`);
  if (!res.ok) throw new Error("list failed");
  return (await res.json()) as Todo[];
}

declare function useQuery<TQueryFnData, TQueryKey extends QueryKey>(opts: {
  queryKey: TQueryKey;
  queryFn: () => Promise<TQueryFnData>;
}): { data: TQueryFnData | undefined; isLoading: boolean };

function useTodos(userId: string) {
  return useQuery({
    queryKey: todoKeys.list({ userId }),
    queryFn: () => fetchTodoList({ userId }),
  });
}
```

### 🔴 Expert Example

```typescript
/** Discriminated API result + error taxonomy */

export type ApiOk<T> = { ok: true; status: number; data: T };
export type ApiErr =
  | { ok: false; kind: "network"; message: string }
  | { ok: false; kind: "http"; status: number; body: unknown }
  | { ok: false; kind: "decode"; message: string };

export type ApiResult<T> = ApiOk<T> | ApiErr;

export async function safeJson<T>(
  input: RequestInfo,
  init: RequestInit | undefined,
  decode: (raw: unknown) => T
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (e) {
    return {
      ok: false,
      kind: "network",
      message: e instanceof Error ? e.message : "unknown",
    };
  }
  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    return { ok: false, kind: "decode", message: "invalid json" };
  }
  if (!res.ok) return { ok: false, kind: "http", status: res.status, body: raw };
  try {
    return { ok: true, status: res.status, data: decode(raw) };
  } catch (e) {
    return {
      ok: false,
      kind: "decode",
      message: e instanceof Error ? e.message : "decode",
    };
  }
}

interface Invoice {
  id: string;
  totalCents: number;
}

function isInvoice(u: unknown): u is Invoice {
  if (typeof u !== "object" || u === null) return false;
  const o = u as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.totalCents === "number";
}

async function loadInvoice(id: string): Promise<ApiResult<Invoice>> {
  return safeJson(`/api/invoices/${id}`, undefined, (raw) => {
    if (!isInvoice(raw)) throw new Error("shape");
    return raw;
  });
}
```

### 🌍 Real-Time Example

```typescript
import type { Key } from "swr";

interface Message {
  id: string;
  text: string;
  sentAt: string;
}

async function fetcher(url: string): Promise<Message[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch");
  return (await res.json()) as Message[];
}

declare function useSWR<Data, Err = Error>(
  key: Key,
  fetcher: (key: string) => Promise<Data>
): {
  data: Data | undefined;
  error: Err | undefined;
  mutate: (data?: Data | Promise<Data>, opts?: { revalidate: boolean }) => Promise<Data | undefined>;
};

function useThreadMessages(threadId: string) {
  const key = `/api/threads/${threadId}/messages` as const;
  return useSWR<Message[]>(key, fetcher);
}

/** After sending a message via WebSocket, merge into SWR cache */
function applyRealtimePatch(
  prev: Message[] | undefined,
  incoming: Message
): Message[] {
  const list = prev ?? [];
  if (list.some((m) => m.id === incoming.id)) return list;
  return [...list, incoming].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );
}

// useThreadMessages(id).mutate(applyRealtimePatch(msg), { revalidate: false });
```

## Best Practices

1. **Single source of truth:** Infer types from Zod / OpenAPI / Prisma — do not fork DTOs per tier.
2. **Boundaries:** `unknown` at HTTP/queue edges; validate before domain types.
3. **Versioning:** Additive events, **schemaVersion**, JSDoc `@deprecated`, overloads for migrations.
4. **Redux:** One `RootState` / typed hooks; serializable actions; side effects in thunks or listeners.
5. **Forms:** Tie `FormValues` to a schema resolver; `FieldPath` for nested keys.
6. **Fetching:** Query-key factories; discriminated errors (network / HTTP / decode).
7. **Realtime:** Shared message unions + receive validation + idempotent consumers.
8. **CI:** `tsc --noEmit`, type-aware eslint, **attw** on packages.
