# TypeScript Error Handling

TypeScript improves JavaScript error handling by letting you model failures in the type system, narrow unknown errors safely, and express domain errors as discriminated unions or Result types. This guide moves from native `Error` objects through typed `catch`, functional patterns, API error shapes, and schema validation.

---

## 📑 Table of Contents

1. [Error Types](#1-error-types)
2. [Try-Catch with TypeScript](#2-try-catch-with-typescript)
3. [Result Types (Functional)](#3-result-types-functional)
4. [Error Type Patterns](#4-error-type-patterns)
5. [Validation and Parsing](#5-validation-and-parsing)
6. [Best Practices](#best-practices)
7. [Common Mistakes](#common-mistakes)

---

## 1. Error Types

JavaScript’s `Error` is the foundation. TypeScript adds **literal types**, **custom classes**, **unions of errors**, and **narrowing** so callers know what went wrong.

### 🟢 Beginner Example

Use the built-in `Error` and optional `cause` (ES2022) for chaining. TypeScript treats thrown values as `unknown` in strict `catch` (see section 2), but constructing errors is straightforward.

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

try {
  console.log(divide(10, 0));
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
```

Built-in subclasses include `TypeError`, `RangeError`, `SyntaxError`, and `ReferenceError`. Pick the one that best matches the failure mode.

```typescript
function parsePositiveInt(input: string): number {
  const n = Number(input);
  if (!Number.isInteger(n)) {
    throw new TypeError("Expected an integer string");
  }
  if (n <= 0) {
    throw new RangeError("Expected a positive integer");
  }
  return n;
}
```

### 🟡 Intermediate Example

**Custom error classes** carry typed fields (codes, HTTP status, metadata) while remaining `instanceof Error`.

```typescript
type AppErrorCode = "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION";

class AppError extends Error {
  readonly code: AppErrorCode;
  readonly statusCode: number;

  constructor(message: string, code: AppErrorCode, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function requireUser(id: string): { id: string; name: string } {
  if (id === "") {
    throw new AppError("User id required", "VALIDATION", 400);
  }
  throw new AppError("User not found", "NOT_FOUND", 404);
}
```

**Error unions** model multiple failure kinds. Consumers narrow with `instanceof` or discriminant properties.

```typescript
class NetworkError extends Error {
  readonly kind = "network" as const;
  constructor(message: string, readonly url: string) {
    super(message);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class TimeoutError extends Error {
  readonly kind = "timeout" as const;
  constructor(message: string, readonly ms: number) {
    super(message);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

type FetchFailure = NetworkError | TimeoutError;

function handleFetchFailure(err: FetchFailure): string {
  if (err instanceof NetworkError) {
    return `Network issue for ${err.url}`;
  }
  return `Timed out after ${err.ms}ms`;
}
```

### 🔴 Expert Example

**Branded or nominal typing** for error codes avoids accidental string mixing. Combine with a **closed set** of error classes and a type guard.

```typescript
declare const __errorCode: unique symbol;
type ErrorCode = string & { readonly [__errorCode]: true };

function errorCode<T extends string>(s: T): T & ErrorCode {
  return s as T & ErrorCode;
}

const Codes = {
  E_AUTH: errorCode("E_AUTH"),
  E_RATE: errorCode("E_RATE"),
} as const;

class DomainError extends Error {
  constructor(
    message: string,
    readonly code: ErrorCode,
    readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DomainError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function isDomainError(e: unknown): e is DomainError {
  return e instanceof DomainError;
}

function mapDomainError(e: DomainError): number {
  switch (e.code) {
    case Codes.E_AUTH:
      return 401;
    case Codes.E_RATE:
      return 429;
    default: {
      const _exhaustive: never = e.code;
      return _exhaustive;
    }
  }
}
```

**Error unions with payloads** (not necessarily `Error` subclasses) work well with exhaustive `switch` when every variant is a plain object.

```typescript
type RepoError =
  | { tag: "not_found"; id: string }
  | { tag: "conflict"; id: string; reason: string }
  | { tag: "db"; operation: string; cause: unknown };

function describeRepoError(e: RepoError): string {
  switch (e.tag) {
    case "not_found":
      return `Missing ${e.id}`;
    case "conflict":
      return `Conflict on ${e.id}: ${e.reason}`;
    case "db":
      return `DB failed during ${e.operation}`;
    default: {
      const _n: never = e;
      return _n;
    }
  }
}
```

### 🌍 Real-Time Example

In a **Node HTTP handler**, map known errors to status codes and log structured metadata. Unknown errors become 500 with a safe client message.

```typescript
import type { IncomingMessage, ServerResponse } from "node:http";

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function getOrderHandler(
  _req: IncomingMessage,
  res: ServerResponse,
  orderId: string
) {
  try {
    const order = await fetchOrder(orderId); // may throw AppError, etc.
    sendJson(res, 200, order);
  } catch (e) {
    if (e instanceof AppError) {
      sendJson(res, e.statusCode, { error: e.message, code: e.code });
      return;
    }
    console.error("Unhandled order error", { orderId, err: e });
    sendJson(res, 500, { error: "Internal server error" });
  }
}

declare function fetchOrder(id: string): Promise<{ id: string; total: number }>;
```

---

## 2. Try-Catch with TypeScript

In **`useUnknownInCatchVariables`** (TypeScript 4.0+, often enabled with `strict`), `catch` clause variables are **`unknown`**, not `any`. You must narrow before using properties.

### 🟢 Beginner Example

Always check `instanceof Error` before reading `.message`.

```typescript
function risky(): void {
  throw "oops"; // string throws are legal in JS
}

try {
  risky();
} catch (e: unknown) {
  if (e instanceof Error) {
    console.log(e.message);
  } else if (typeof e === "string") {
    console.log(e);
  } else {
    console.log("Unknown failure", e);
  }
}
```

### 🟡 Intermediate Example

**Reusable type guards** keep `catch` blocks small and consistent.

```typescript
function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function withLogging<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e: unknown) {
    console.error("Failure:", getErrorMessage(e));
    throw e;
  }
}
```

**Exhaustive handling** for a known union of error tags:

```typescript
type SaveError =
  | { kind: "validation"; fields: string[] }
  | { kind: "network"; retryAfter?: number }
  | { kind: "unknown" };

function isSaveError(e: unknown): e is SaveError {
  if (typeof e !== "object" || e === null) return false;
  if (!("kind" in e)) return false;
  const k = (e as { kind: unknown }).kind;
  return k === "validation" || k === "network" || k === "unknown";
}

function handleSaveError(e: SaveError): void {
  switch (e.kind) {
    case "validation":
      console.error("Invalid:", e.fields.join(", "));
      break;
    case "network":
      console.error("Network", e.retryAfter ?? "no retry hint");
      break;
    case "unknown":
      console.error("Unknown save error");
      break;
    default: {
      const _x: never = e;
      void _x;
    }
  }
}
```

### 🔴 Expert Example

**Asserting structured errors** from third-party code: validate shape at the boundary, then narrow.

```typescript
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isHttpLikeError(e: unknown): e is { status: number; body: unknown } {
  if (!isRecord(e)) return false;
  return typeof e.status === "number" && "body" in e;
}

async function callUpstream(): Promise<void> {
  try {
    await fetch("https://api.example.com/x");
  } catch (e: unknown) {
    if (isHttpLikeError(e)) {
      if (e.status === 429) {
        // backoff
      }
      return;
    }
    throw e;
  }
}
```

**Higher-order try/catch**: wrap `async` work in a function that takes `onError: (e: unknown) => never` (or returns `Result`) so every caller narrows errors in one place.

### 🌍 Real-Time Example

**React / async data**: isolate `unknown` in a data layer and expose typed errors to the UI.

```typescript
type UiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string; code?: string };

async function loadProfile(userId: string): Promise<UiState<{ name: string }>> {
  try {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as unknown;
      const message =
        isRecord(body) && typeof body.message === "string"
          ? body.message
          : `HTTP ${res.status}`;
      return { status: "error", message, code: String(res.status) };
    }
    const data = (await res.json()) as { name: string };
    return { status: "success", data };
  } catch (e: unknown) {
    return { status: "error", message: getErrorMessage(e) };
  }
}
```

---

## 3. Result Types (Functional)

Instead of exceptions, return **`Result<T, E>`**, **`Either<L, R>`**, or **`Option<T>`** so success and failure are explicit in the signature.

### 🟢 Beginner Example

Minimal **Result** as a discriminated union:

```typescript
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;

function divideResult(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

function demo(x: number, y: number) {
  const r = divideResult(x, y);
  if (r.ok) {
    console.log(r.value);
  } else {
    console.error(r.error);
  }
}
```

### 🟡 Intermediate Example

**Either** as `Left` / `Right` (by convention, `Right` is success):

```typescript
type Left<L> = { _tag: "Left"; left: L };
type Right<R> = { _tag: "Right"; right: R };
type Either<L, R> = Left<L> | Right<R>;

const left = <L, R>(l: L): Either<L, R> => ({ _tag: "Left", left: l });
const right = <L, R>(r: R): Either<L, R> => ({ _tag: "Right", right: r });

function parseEven(s: string): Either<string, number> {
  const n = Number(s);
  if (!Number.isInteger(n)) return left("not an integer");
  if (n % 2 !== 0) return left("not even");
  return right(n);
}

function fold<L, R, T>(e: Either<L, R>, onLeft: (l: L) => T, onRight: (r: R) => T): T {
  return e._tag === "Left" ? onLeft(e.left) : onRight(e.right);
}
```

**Option / Maybe** for absent values (distinct from “operation failed with a reason”):

```typescript
type Some<T> = { _tag: "Some"; value: T };
type None = { _tag: "None" };
type Option<T> = Some<T> | None;

const some = <T>(value: T): Option<T> => ({ _tag: "Some", value });
const none: Option<never> = { _tag: "None" };

function first<T>(arr: T[]): Option<T> {
  return arr.length > 0 ? some(arr[0]!) : none;
}
```

### 🔴 Expert Example

**Composable Result helpers** (map, flatMap) keep nesting flat and types precise:

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

const ok = <T, E>(value: T): Result<T, E> => ({ ok: true, value });
const err = <T, E>(error: E): Result<T, E> => ({ ok: false, error });

function map<T, U, E>(r: Result<T, E>, f: (t: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r;
}

function flatMap<T, U, E>(r: Result<T, E>, f: (t: T) => Result<U, E>): Result<U, E> {
  return r.ok ? f(r.value) : r;
}

type ParseErr = { tag: "parse"; detail: string };
type DbErr = { tag: "db"; detail: string };

function parseId(s: string): Result<number, ParseErr> {
  const n = Number(s);
  return Number.isInteger(n) && n > 0
    ? ok(n)
    : err({ tag: "parse", detail: "positive int required" });
}

function loadUser(id: number): Result<string, DbErr> {
  return id === 2 ? ok("alice") : err({ tag: "db", detail: "not found" });
}

function userNameFromParam(param: string): Result<string, ParseErr | DbErr> {
  return flatMap(parseId(param), (id) => loadUser(id));
}
```

**Discriminated union errors** as the `E` parameter unify domain failures:

```typescript
type AppFailure =
  | { kind: "auth"; reason: "expired" | "invalid" }
  | { kind: "quota"; remaining: number }
  | { kind: "internal"; id: string };

function useFeature(): Result<void, AppFailure> {
  return err({ kind: "quota", remaining: 0 });
}
```

### 🌍 Real-Time Example

**Pipeline** for validating input and calling an API without throwing across layers:

```typescript
type ApiError = { status: number; body: string };

async function postComment(
  text: string
): Result<{ id: string }, ParseErr | ApiError> {
  const trimmed = text.trim();
  if (trimmed.length < 3) {
    return err({ tag: "parse", detail: "comment too short" });
  }
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed }),
  });
  if (!res.ok) {
    return err({ status: res.status, body: await res.text() });
  }
  const json = (await res.json()) as { id: string };
  return ok(json);
}

async function submitUi(text: string): Promise<void> {
  const r = await postComment(text);
  if (!r.ok) {
    if ("tag" in r.error && r.error.tag === "parse") {
      console.warn(r.error.detail);
    } else {
      console.error("API error", r.error.status);
    }
    return;
  }
  console.log("created", r.value.id);
}
```

---

## 4. Error Type Patterns

Structured errors scale better than ad hoc strings: **literal error codes**, **tagged unions**, **hierarchies**, and **typed API responses**.

### 🟢 Beginner Example

**Literal union codes** for a small API surface:

```typescript
type ErrorCode = "INVALID_EMAIL" | "WEAK_PASSWORD" | "EMAIL_TAKEN";

type FieldError = { code: ErrorCode; field: "email" | "password" };

function validateSignup(email: string, password: string): FieldError | null {
  if (!email.includes("@")) {
    return { code: "INVALID_EMAIL", field: "email" };
  }
  if (password.length < 8) {
    return { code: "WEAK_PASSWORD", field: "password" };
  }
  return null;
}
```

### 🟡 Intermediate Example

**Tagged union errors** (single discriminant) for exhaustive UI handling:

```typescript
type UiError =
  | { type: "toast"; message: string }
  | { type: "inline"; field: string; message: string }
  | { type: "modal"; title: string; message: string };

function renderError(e: UiError): string {
  switch (e.type) {
    case "toast":
      return `Toast: ${e.message}`;
    case "inline":
      return `${e.field}: ${e.message}`;
    case "modal":
      return `${e.title} — ${e.message}`;
    default: {
      const _n: never = e;
      return _n;
    }
  }
}
```

**Error hierarchy** with a base class and specialized subclasses:

```typescript
abstract class PaymentError extends Error {
  abstract readonly code: string;
}

class CardDeclinedError extends PaymentError {
  readonly code = "CARD_DECLINED";
  constructor(readonly declineCode: string) {
    super(`Card declined: ${declineCode}`);
    this.name = "CardDeclinedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ProcessorTimeoutError extends PaymentError {
  readonly code = "PROCESSOR_TIMEOUT";
  constructor() {
    super("Processor timeout");
    this.name = "ProcessorTimeoutError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
```

### 🔴 Expert Example

**API error typing** with a discriminated `success` flag and shared metadata:

```typescript
type ApiSuccess<T> = {
  success: true;
  data: T;
  requestId: string;
};

type ApiFailure = {
  success: false;
  error: {
    code: "RATE_LIMIT" | "BAD_REQUEST" | "INTERNAL";
    message: string;
    details?: unknown;
  };
  requestId: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

function assertApiResponse<T>(x: unknown): ApiResponse<T> {
  if (typeof x !== "object" || x === null) throw new TypeError("bad response");
  if (!("success" in x)) throw new TypeError("bad response");
  return x as ApiResponse<T>;
}

function handleUserResponse(res: ApiResponse<{ id: string }>): string {
  if (res.success) return res.data.id;
  switch (res.error.code) {
    case "RATE_LIMIT":
      return "slow down";
    case "BAD_REQUEST":
      return "fix input";
    case "INTERNAL":
      return "try later";
    default: {
      const _e: never = res.error.code;
      return _e;
    }
  }
}
```

**Open-ended error codes**: derive a union from an `as const` map, then attach fields like `retryable` and `metadata` to a `PaymentFailure` type.

### 🌍 Real-Time Example

**Fetch wrapper** that returns a typed `Result` for HTTP + JSON parsing:

```typescript
type HttpErr = { tag: "http"; status: number; body: string };
type JsonErr = { tag: "json"; message: string };

async function apiGet<T>(url: string): Promise<Result<T, HttpErr | JsonErr>> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e: unknown) {
    return err({ tag: "http", status: 0, body: getErrorMessage(e) });
  }
  const text = await res.text();
  if (!res.ok) {
    return err({ tag: "http", status: res.status, body: text });
  }
  try {
    return ok(JSON.parse(text) as T);
  } catch (e: unknown) {
    return err({ tag: "json", message: getErrorMessage(e) });
  }
}
```

---

## 5. Validation and Parsing

Runtime validation bridges **untrusted data** (JSON, forms, env) to **TypeScript types**. Libraries like **Zod**, **Yup**, and **io-ts** encode schemas that both parse and infer types.

### 🟢 Beginner Example

**Manual type guards** for small shapes:

```typescript
type User = { id: number; name: string };

function isUser(x: unknown): x is User {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "number" && typeof o.name === "string";
}

function parseUserJson(raw: string): User | null {
  try {
    const v: unknown = JSON.parse(raw);
    return isUser(v) ? v : null;
  } catch {
    return null;
  }
}
```

### 🟡 Intermediate Example

**Zod** — schema + inferred type + safe parse:

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  age: z.number().int().min(0),
  role: z.enum(["admin", "member"]),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): Result<User, z.ZodError> {
  const r = UserSchema.safeParse(input);
  return r.success ? ok(r.data) : err(r.error);
}
```

**Yup** (similar idea, different API):

```typescript
import * as yup from "yup";

const ProductSchema = yup.object({
  sku: yup.string().required(),
  price: yup.number().positive().required(),
});

type Product = yup.InferType<typeof ProductSchema>;

async function parseProduct(input: unknown): Promise<Product> {
  return ProductSchema.validate(input, { abortEarly: false });
}
```

**io-ts** — types-first decoding:

```typescript
import * as t from "io-ts";
import { isRight } from "fp-ts/Either";

const Point = t.type({
  x: t.number,
  y: t.number,
});

type Point = t.TypeOf<typeof Point>;

function decodePoint(u: unknown): Result<Point, t.Errors> {
  const r = Point.decode(u);
  return isRight(r) ? ok(r.right) : err(r.left);
}
```

### 🔴 Expert Example

**Composable Zod schemas** and **transforms** for parsing + normalization:

```typescript
import { z } from "zod";

const Email = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .brand<"Email">();

const Signup = z
  .object({
    email: z.string(),
    password: z.string().min(8),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
    message: "Passwords must match",
    path: ["password2"],
  })
  .transform((d) => ({
    email: Email.parse(d.email),
    password: d.password,
  }));

type SignupPayload = z.infer<typeof Signup>;

function handleSignupBody(json: unknown): Result<SignupPayload, z.ZodError> {
  const r = Signup.safeParse(json);
  return r.success ? ok(r.data) : err(r.error);
}
```

**Schema-based API boundary**: validate once at the edge, then use typed data inside:

```typescript
import { z } from "zod";

const EventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("submit"), formId: z.string() }),
]);

type AppEvent = z.infer<typeof EventSchema>;

function routeEvent(raw: unknown): Result<void, z.ZodError> {
  const r = EventSchema.safeParse(raw);
  if (!r.success) return err(r.error);
  const e = r.data;
  switch (e.type) {
    case "click":
      console.log(e.x, e.y);
      break;
    case "submit":
      console.log(e.formId);
      break;
  }
  return ok(undefined);
}
```

### 🌍 Real-Time Example

**Express-style middleware** validating JSON body with Zod and returning typed errors:

```typescript
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

const CreatePost = z.object({
  title: z.string().min(3),
  tags: z.array(z.string()).max(10).default([]),
});

type CreatePost = z.infer<typeof CreatePost>;

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      res.status(400).json({
        error: "validation_failed",
        issues: r.error.flatten(),
      });
      return;
    }
    (req as Request & { validatedBody: z.infer<T> }).validatedBody = r.data;
    next();
  };
}

// Usage: validateBody(CreatePost) then read req.validatedBody as CreatePost
```

---

## Best Practices

- **Treat `catch` as `unknown`** and narrow with `instanceof`, type guards, or schema parsing before accessing properties.
- **Prefer specific error types** (`TypeError`, `RangeError`, domain subclasses) over generic `Error` when the distinction matters to callers.
- **Document what a function throws** in JSDoc or return `Result` / `Either` so failures appear in the type signature.
- **Centralize mapping** from domain errors to HTTP status codes, UI messages, and log severity at application boundaries.
- **Use discriminated unions** for structured errors so `switch` can be checked for exhaustiveness with `never`.
- **Validate at boundaries** (HTTP body, WebSocket messages, `localStorage`, third-party SDK callbacks) and keep internal modules working with trusted types.
- **Preserve `cause`** when wrapping errors to keep debugging context in logs and APM tools.
- **Avoid `catch (e: any)`** unless you have a compelling interop constraint; it disables safety.
- **Log structured metadata** (request id, user id, error code) rather than only string messages.

---

## Common Mistakes

- **Assuming `catch (e)` is an `Error`**: Thrown values may be strings, numbers, or plain objects; always narrow.
- **Swallowing errors** with empty `catch` blocks, which hides bugs and breaks observability.
- **Using exceptions for control flow** in hot paths (e.g., “not found” as throw) when a `Result` or nullable return is clearer.
- **Over-wide error types** like `Error | string | unknown` in public APIs without guards—callers cannot handle them safely.
- **Mismatching runtime and compile-time types** after `JSON.parse` or `fetch().json()` without validation; TypeScript does not verify at runtime.
- **Breaking `instanceof` with transpilation** targets that don’t preserve class inheritance correctly; use `Object.setPrototypeOf` in custom error constructors when targeting older emit.
- **Non-exhaustive `switch`** on error tags when new variants are added; use `default: const _n: never = e` to catch omissions.
- **Leaking internal details** in client-facing messages while underusing structured logs for operators.
