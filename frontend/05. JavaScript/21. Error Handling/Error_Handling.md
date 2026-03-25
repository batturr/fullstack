# JavaScript Error Handling

**Error handling** is how your code detects failures, reports them clearly, and keeps applications stable. JavaScript uses the `Error` type family, `try…catch…finally` for synchronous control flow, and `throw` to signal exceptional conditions. Understanding built-in error types, custom errors, and consistent patterns helps you debug faster and build more reliable front-end and Node.js programs.

---

## 📑 Table of Contents

1. [Error Basics](#1-error-basics)
2. [Try-Catch-Finally](#2-try-catch-finally)
3. [Throwing Errors](#3-throwing-errors)
4. [Built-in Error Types](#4-built-in-error-types)
5. [Custom Error Classes](#5-custom-error-classes)
6. [Error Handling Best Practices](#6-error-handling-best-practices)
7. [Best Practices (Quick Reference)](#7-best-practices-quick-reference)
8. [Common Mistakes to Avoid](#8-common-mistakes-to-avoid)

---

## 1. Error Basics

### 1.1 Error types overview

Errors in JavaScript broadly fall into these categories:

| Category | When it happens | Typical handling |
|----------|-----------------|------------------|
| **Syntax errors** | Before/during parsing invalid code | Fix source; often not catchable at runtime in the same file |
| **Runtime errors** | While code executes (invalid operation, missing reference) | `try…catch`, validation, guards |
| **Logical errors** | Code runs but behavior is wrong | Tests, logging, assertions |
| **Developer-thrown errors** | You `throw` when a contract is violated | Callers use `try…catch` or check return values |

The **standard way** to represent a runtime failure in JavaScript is an **`Error` object** (or a subclass). These objects carry a human-readable `message`, a `name` identifying the error type, and often a `stack` trace for debugging.

### 1.2 The `Error` object

The built-in `Error` constructor creates an error instance. You can create one explicitly or receive one from the engine (e.g. `TypeError` when you call something that is not a function).

```javascript
const err = new Error("Something went wrong");
console.log(err instanceof Error); // true
```

### 1.3 Error properties: `name`, `message`, `stack`

- **`name`**: String identifying the error constructor (e.g. `"Error"`, `"TypeError"`).
- **`message`**: Description of what went wrong.
- **`stack`**: Non-standard but universally available in engines: a string showing the call stack at throw time (useful for logs; do not show raw stacks to end users in production UIs).

```javascript
function inner() {
  throw new Error("Demo");
}

function outer() {
  inner();
}

try {
  outer();
} catch (e) {
  console.log(e.name);    // "Error"
  console.log(e.message); // "Demo"
  console.log(e.stack);   // multi-line string with file/line info (engine-specific)
}
```

### 1.4 Creating errors

Use `new Error(message)` for generic errors. For more specific cases, prefer the appropriate subclass (covered in [Built-in Error Types](#4-built-in-error-types)).

```javascript
function divide(a, b) {
  if (b === 0) {
    throw new RangeError("Division by zero is not allowed");
  }
  return a / b;
}

try {
  console.log(divide(10, 0));
} catch (e) {
  console.error(e.message);
}
```

You can also attach extra data on a plain `Error` (or use a custom class—see [Custom Error Classes](#5-custom-error-classes)).

```javascript
const err = new Error("User not found");
err.code = "USER_NOT_FOUND";
err.userId = 42;
throw err;
```

---

## 2. Try-Catch-Finally

### 2.1 The `try` block

Code that might throw should run inside `try`. Only errors thrown **while executing** the `try` block (synchronously) are caught by the matching `catch` in the same statement.

```javascript
try {
  const data = JSON.parse('{"ok":true}');
  console.log(data.ok);
} catch (e) {
  console.error("Parse failed", e.message);
}
```

**Note:** Errors inside **asynchronous** callbacks (e.g. `setTimeout`, promise `.then`) are **not** caught by an outer `try…catch` unless you `await` the promise or handle rejection inside the async path.

```javascript
try {
  setTimeout(() => {
    throw new Error("This escapes try/catch");
  }, 0);
} catch (e) {
  // Does NOT run for the setTimeout callback throw
}
```

### 2.2 The `catch` block

`catch` receives the thrown value. In modern JavaScript it is almost always an `Error` instance, but **`throw` can throw any value** (see [Throwing Errors](#3-throwing-errors)).

```javascript
try {
  maybeFail();
} catch (e) {
  if (e instanceof Error) {
    console.error(e.stack);
  } else {
    console.error("Non-Error thrown:", e);
  }
}

function maybeFail() {
  throw new TypeError("not a function");
}
```

**Optional catch binding (ES2019):** If you do not need the error object, you can omit the binding:

```javascript
try {
  riskyOperation();
} catch {
  console.log("Operation failed (details omitted)");
}
```

### 2.3 The `finally` block

`finally` runs **whether** the `try` completes, `catch` runs, or a `return`/`throw` occurs in `try` or `catch`. Use it for cleanup (closing resources, resetting flags).

```javascript
function readWithCleanup() {
  let resource = { open: true };
  try {
    if (Math.random() > 0.5) throw new Error("random failure");
    return "success";
  } catch (e) {
    console.error(e.message);
    return "recovered";
  } finally {
    resource.open = false;
    console.log("cleanup always runs");
  }
}
```

If `try` has a `return`, `finally` still runs first (e.g. `try { return 1; } finally { console.log("cleanup"); }` logs before the caller sees `1`).

### 2.4 Nested try-catch and propagation

Inner `try…catch` handles errors locally; uncaught errors **bubble** to an outer `catch` or become an **uncaught exception** (browsers: `window.onerror`; promises: `unhandledrejection`).

```javascript
function nested() {
  try {
    try {
      throw new Error("inner");
    } catch (innerErr) {
      console.log("Inner:", innerErr.message);
      throw new Error("rethrown");
    }
  } catch (outerErr) {
    console.log("Outer:", outerErr.message);
  }
}
const chain = () => {
  const b = () => {
    throw new Error("from b");
  };
  try {
    b();
  } catch (e) {
    console.log("c caught:", e.message);
  }
};
nested(); // Inner: inner → Outer: rethrown
chain();  // c caught: from b
```

---

## 3. Throwing Errors

### 3.1 The `throw` statement

`throw` halts the current execution path and passes a value to the nearest enclosing `catch`.

```javascript
function requirePositive(n) {
  if (n <= 0) {
    throw new Error("n must be positive");
  }
  return n;
}

try {
  requirePositive(-1);
} catch (e) {
  console.log(e.message);
}
```

You can throw **any expression** (not recommended for consistency):

```javascript
throw "string error";
throw 404;
throw { code: "E_FAIL", detail: "oops" };
```

Prefer **`Error` or subclasses** so callers get `stack` and `instanceof` checks work predictably.

### 3.2 Throwing custom errors

Use a specific `Error` subclass or a custom class extending `Error` to communicate intent.

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function saveUser(user) {
  if (!user.email) {
    throw new ValidationError("Email is required", "email");
  }
}

try {
  saveUser({});
} catch (e) {
  if (e instanceof ValidationError) {
    console.log("Invalid field:", e.field);
  }
}
```

### 3.3 Rethrowing errors

Sometimes you log or enrich an error, then **rethrow** so upstream code can still handle it—or so the process still fails visibly.

```javascript
function loadConfig() {
  try {
    return JSON.parse("{bad json");
  } catch (e) {
    console.error("Config parse error", e);
    throw e; // same error, same stack (usually)
  }
}
```

You can wrap errors while preserving the original with **`cause`** (ES2022):

```javascript
try {
  loadConfig();
} catch (original) {
  throw new Error("Application cannot start", { cause: original });
}
```

### 3.4 When to throw

**Throw** when:

- A **precondition** is violated and the function cannot proceed meaningfully.
- An **unexpected** state occurs that callers should not ignore (e.g. corrupt invariant).
- You are writing **library code** where returning `null` for every failure obscures the reason.

**Avoid throwing** for ordinary **expected** outcomes when a return value is clearer (e.g. `find()` returning `undefined`). Use throw for exceptional paths.

```javascript
// Good: throw for impossible state after validation already passed
function assertReady(state) {
  if (!state.initialized) {
    throw new Error("Service not initialized");
  }
}

// Often better as return value: "not found" is expected
function findUser(id) {
  const user = db.get(id);
  return user ?? null;
}
```

---

## 4. Built-in Error Types

All of these inherit from `Error`. Use the most specific type that matches the failure.

### 4.1 `Error`

Generic errors. Default `name` is `"Error"`.

```javascript
throw new Error("Generic failure");
```

### 4.2 `SyntaxError`

Invalid JavaScript syntax when evaluated dynamically (e.g. `eval`, `Function`, `JSON.parse` throws regular `SyntaxError` from JSON API).

```javascript
try {
  JSON.parse("{");
} catch (e) {
  console.log(e instanceof SyntaxError); // true
}
```

### 4.3 `ReferenceError`

Accessing an undeclared variable, or temporal dead zone for `let`/`const`.

```javascript
try {
  console.log(undefinedVariable);
} catch (e) {
  console.log(e instanceof ReferenceError); // true
}
```

### 4.4 `TypeError`

Value is not of the expected type: calling non-functions, reading properties of `null`/`undefined`, wrong operand types for an operation.

```javascript
try {
  const x = null;
  x.toString();
} catch (e) {
  console.log(e instanceof TypeError); // true — not an object
}
try {
  (42)();
} catch (e) {
  console.log(e.name); // "TypeError" — not a function
}
```

### 4.5 `RangeError`

Numeric value outside allowed range (e.g. invalid `toFixed` digits, bad `Array` length).

```javascript
try {
  (1).toFixed(101);
} catch (e) {
  console.log(e instanceof RangeError); // true
}
```

### 4.6 `URIError`

Global URI handling functions (`encodeURI`, `decodeURI`, etc.) fail on malformed sequences.

```javascript
try {
  decodeURIComponent("%");
} catch (e) {
  console.log(e instanceof URIError); // true
}
```

### 4.7 `EvalError`

Historically used for `eval` errors. In modern engines it **rarely** appears; `SyntaxError` and `TypeError` are more common for `eval`-related issues. It remains in the spec for compatibility.

```javascript
// EvalError exists but is uncommon in practice
console.log(typeof EvalError); // "function"
```

### 4.8 `AggregateError` (ES2021)

Represents **multiple errors at once**. Famously used by **`Promise.any`** when **all** promises reject.

```javascript
const p1 = Promise.reject(new Error("a"));
const p2 = Promise.reject(new Error("b"));

Promise.any([p1, p2]).catch((err) => {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors.length);           // 2
  err.errors.forEach((e) => console.log(e.message));
});
```

You can also construct it manually:

```javascript
const errs = [new Error("first"), new TypeError("second")];
const agg = new AggregateError(errs, "Several things failed");
console.log(agg.message); // "Several things failed"
console.log(agg.errors);  // Array of errors
```

### 4.9 Quick instanceof checks

```javascript
function describe(err) {
  if (err instanceof TypeError) return "type problem";
  if (err instanceof ReferenceError) return "bad reference";
  if (err instanceof SyntaxError) return "syntax problem";
  if (err instanceof RangeError) return "out of range";
  if (err instanceof URIError) return "URI problem";
  if (err instanceof AggregateError) return `aggregate (${err.errors.length})`;
  return "other";
}
```

---

## 5. Custom Error Classes

### 5.1 Extending `Error`

Subclass `Error`, set `name`, and call `super(message)`. For correct prototype chain in transpiled or older environments, some codebases explicitly set `Object.setPrototypeOf(this, MyError.prototype)`—with modern class syntax in current engines, `extends Error` is usually enough.

```javascript
class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

try {
  throw new HttpError("Not Found", 404);
} catch (e) {
  if (e instanceof HttpError) {
    console.log(e.statusCode, e.message);
  }
}
```

### 5.2 Custom properties

Add fields your application needs: `code`, `statusCode`, `field`, `retryable`, etc.

```javascript
class ApiError extends Error {
  constructor(message, { code, endpoint, status } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.endpoint = endpoint;
    this.status = status;
  }
}

throw new ApiError("Rate limited", {
  code: "RATE_LIMIT",
  endpoint: "/v1/data",
  status: 429,
});
```

### 5.3 Error factory functions

Factories centralize message formatting and keep constructors consistent.

```javascript
function createValidationError(field, reason) {
  const err = new Error(`${field}: ${reason}`);
  err.name = "ValidationError";
  err.field = field;
  err.reason = reason;
  return err;
}

function validateAge(age) {
  if (age < 0) throw createValidationError("age", "must be non-negative");
}

try {
  validateAge(-1);
} catch (e) {
  console.log(e.field, e.reason);
}

class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}
function appError(code, message) {
  return new AppError(code, message);
}
try {
  throw appError("E_AUTH", "Invalid token");
} catch (e) {
  console.log(e.code);
}
```

### 5.4 Chaining with `cause`

When wrapping lower-level errors, use `cause` so tools and logs retain the original stack/context.

```javascript
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  } catch (e) {
    if (e.status) throw e; // already an HTTP error from above
    throw new Error(`Network failure for user ${id}`, { cause: e });
  }
}
```

---

## 6. Error Handling Best Practices

### 6.1 Fail fast principle

Validate inputs and preconditions **early** and throw (or return a clear error) before doing heavy work. This keeps bugs close to their source and avoids partial side effects.

```javascript
function processOrder(order) {
  if (!order || !order.id) {
    throw new Error("order.id is required");
  }
  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("order must contain items");
  }
  // ... safe to proceed
}
```

Avoid silently swallowing errors: empty `catch` blocks hide failures and make production issues nearly impossible to diagnose.

```javascript
// Bad: silent failure
try {
  save();
} catch (e) {}

// Better: log and rethrow, or handle explicitly
try {
  save();
} catch (e) {
  console.error("save failed", e);
  throw e;
}
```

### 6.2 Error logging

Log **enough context** to debug (message, stack, user/session id if appropriate, request id) but avoid logging secrets (passwords, tokens, full credit card numbers).

```javascript
function logError(context, err) {
  const payload = {
    time: new Date().toISOString(),
    context,
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
  };
  console.error(JSON.stringify(payload));
}

try {
  doWork();
} catch (e) {
  logError("doWork", e);
}
```

Async: use `try { await ... } catch` or `.catch()` on the promise—plain `try` around an async callback body does not catch rejections from un-awaited promises.

```javascript
async function run() {
  try {
    await mightReject();
  } catch (e) {
    logError("run", e);
  }
}
```

### 6.3 Error boundaries (concept and React)

**Contain failures** so one broken subtree does not tear down the whole app: boundaries show fallback UI and log/report. In **React 16+**, a class component with `getDerivedStateFromError` / `componentDidCatch` (or `react-error-boundary`) catches errors in **render**, **lifecycle**, and **child constructors**—not in event handlers, async code, or Server Components (use `try/catch` there). Non-React apps use the same idea via top-level handlers or isolated modules.

```javascript
import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }
  render() {
    return this.state.hasError ? <p>Something went wrong.</p> : this.props.children;
  }
}
```

```javascript
window.addEventListener("error", (e) => console.error("Global:", e.error));
window.addEventListener("unhandledrejection", (e) =>
  console.error("Unhandled promise:", e.reason)
);
```

---

## 7. Best Practices (Quick Reference)

1. **Use `Error` subclasses** for thrown values; include clear `message` strings.
2. **Catch at boundaries** (UI layer, API layer) and **let errors propagate** inside pure utilities when appropriate.
3. **Never use empty `catch`** without a documented reason; at minimum log.
4. **Separate expected failures** (return values) from **exceptional failures** (`throw`).
5. **Use `finally`** for cleanup that must run regardless of success or failure.
6. **Handle promise rejections** with `await` + `try/catch` or `.catch()`.
7. **Log with context**; scrub sensitive data before sending logs to third parties.
8. **Use `cause`** when wrapping errors to preserve the original failure.
9. **Fail fast** on invalid input before mutations or I/O.
10. **Test error paths**—not only the happy path.

---

## 8. Common Mistakes to Avoid

1. **Assuming `try/catch` around async callbacks works** — it does not for plain callbacks; use promises/`async-await` with proper rejection handling.
2. **Throwing strings or plain objects** — breaks `stack` and consistent `instanceof` checks.
3. **Catching and ignoring** — leads to silent data corruption and “nothing happened” UX.
4. **Over-using `try/catch` inside tight loops** — can hurt performance; validate once before the loop when possible.
5. **Exposing raw `stack` traces to end users** — security and UX issue; show a friendly message internally and log details server-side.
6. **Using the wrong built-in type** — e.g. `throw new Error("not a number")` when `TypeError` is more accurate.
7. **Not rethrowing after partial handling** — if you only log and swallow, callers think the operation succeeded.
8. **Relying on `EvalError` in new code** — it is rarely thrown; prefer specific errors for your domain.
9. **Forgetting `AggregateError` when aggregating failures** — use it when multiple errors should travel together (e.g. all batch items failed).
10. **Missing global handlers** in long-running apps — add `unhandledrejection` handling for promises so rejections are visible.

---

*These notes focus on core JavaScript. For framework-specific patterns (Express error middleware, React Server Components, etc.), follow that stack’s recommended error handling guides in addition to the principles above.*
