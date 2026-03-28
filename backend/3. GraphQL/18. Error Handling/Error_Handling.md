# GraphQL Error Handling

## 📑 Table of Contents

- [18.1 Error Basics](#181-error-basics)
  - [18.1.1 GraphQL Errors](#1811-graphql-errors)
  - [18.1.2 Error Structure](#1812-error-structure)
  - [18.1.3 Error Messages](#1813-error-messages)
  - [18.1.4 Error Extensions](#1814-error-extensions)
  - [18.1.5 Error Codes](#1815-error-codes)
- [18.2 Error Types](#182-error-types)
  - [18.2.1 Syntax Errors](#1821-syntax-errors)
  - [18.2.2 Type Errors](#1822-type-errors)
  - [18.2.3 Query Errors](#1823-query-errors)
  - [18.2.4 Resolver Errors](#1824-resolver-errors)
  - [18.2.5 Validation Errors](#1825-validation-errors)
- [18.3 Error Handling Patterns](#183-error-handling-patterns)
  - [18.3.1 Try-Catch Pattern](#1831-try-catch-pattern)
  - [18.3.2 Result Pattern (Success/Failure Union)](#1832-result-pattern-successfailure-union)
  - [18.3.3 Either Pattern](#1833-either-pattern)
  - [18.3.4 Observable Pattern](#1834-observable-pattern)
  - [18.3.5 Callback Pattern](#1835-callback-pattern)
- [18.4 Error Responses](#184-error-responses)
  - [18.4.1 Error Response Format](#1841-error-response-format)
  - [18.4.2 Multiple Errors](#1842-multiple-errors)
  - [18.4.3 Partial Results](#1843-partial-results)
  - [18.4.4 Field Errors](#1844-field-errors)
  - [18.4.5 Root Errors](#1845-root-errors)
- [18.5 Error Processing](#185-error-processing)
  - [18.5.1 Error Formatting](#1851-error-formatting)
  - [18.5.2 Error Logging](#1852-error-logging)
  - [18.5.3 Error Tracking](#1853-error-tracking)
  - [18.5.4 Error Reporting](#1854-error-reporting)
  - [18.5.5 Error Recovery](#1855-error-recovery)
- [18.6 Advanced Error Handling](#186-advanced-error-handling)
  - [18.6.1 Custom Error Classes](#1861-custom-error-classes)
  - [18.6.2 Error Middleware](#1862-error-middleware)
  - [18.6.3 Error Masking](#1863-error-masking)
  - [18.6.4 Sensitive Data Protection](#1864-sensitive-data-protection)
  - [18.6.5 Client Error Handling](#1865-client-error-handling)

---

## 18.1 Error Basics

### 18.1.1 GraphQL Errors

#### Beginner

A **GraphQL error** is a problem reported in the response’s top-level `errors` array. Unlike many REST APIs, GraphQL often returns HTTP **200 OK** even when some fields fail—clients must inspect `errors` alongside `data`.

#### Intermediate

Errors can occur during **parsing**, **validation**, or **execution**. Each error includes at least a `message`. Execution errors may include `locations`, `path`, and `extensions`. The server may still return partial `data` for successful branches.

#### Expert

The [GraphQL specification](https://spec.graphql.org/) defines the response shape but not transport mapping. **Incremental delivery** (@defer/@stream) and **subscriptions** extend error semantics on the wire. Gateways may aggregate subgraph errors with metadata about origin services.

```json
{
  "data": { "me": null },
  "errors": [
    {
      "message": "Not authenticated",
      "path": ["me"],
      "extensions": { "code": "UNAUTHENTICATED" }
    }
  ]
}
```

#### Key Points

- GraphQL errors are first-class response members.
- HTTP status alone is insufficient for correctness.
- Partial success is possible and common.

#### Best Practices

- Teach client teams the `data + errors` contract early.
- Use stable `extensions.code` values for branching.
- Log correlation ids with every error server-side.

#### Common Mistakes

- Treating HTTP 200 as “no errors.”
- Ignoring `errors` when `data` is non-null.
- Returning stack traces to browsers in production.

---

### 18.1.2 Error Structure

#### Beginner

Each error object typically has:

- **`message`**: string for humans (and sometimes machines).
- **`locations`**: optional array of `{ line, column }` for document issues.
- **`path`**: optional array of strings/numbers pointing to the response field path.
- **`extensions`**: optional map for arbitrary metadata (codes, reasons).

#### Intermediate

**Parser** errors include `locations` but not `path`. **Resolver** errors include `path` from the executor’s current field stack. **Custom** servers may add `extensions.exception` (Apollo legacy) or tracing ids.

#### Expert

**Federation** and **stitching** may prefix or nest extensions (`serviceName`). **Union** result types model domain errors as data instead of transport errors—different structural choice with trade-offs.

```javascript
import { GraphQLError } from "graphql";

throw new GraphQLError("Item unavailable", {
  path: ["cart", "addItem"],
  extensions: { code: "OUT_OF_STOCK", sku: "ABC" },
});
```

#### Key Points

- Structure enables tooling (GraphiQL, clients) to highlight issues.
- `path` mirrors the response, not the AST.
- Extensions are the extension point for APIs.

#### Best Practices

- Document your extensions schema.
- Avoid breaking extension keys without notice.
- Keep `message` stable enough for support, not for parsing logic.

#### Common Mistakes

- Putting large nested objects in `extensions` bloating payloads.
- Inconsistent `path` shapes across similar failures.
- Relying on `locations` for runtime resolver failures (usually absent).

---

### 18.1.3 Error Messages

#### Beginner

**Messages** explain what went wrong: “User not found,” “Invalid credentials.” They should be **safe** for end users when exposed publicly—no stack traces, secrets, or internal hostnames.

#### Intermediate

Pair messages with **`extensions.code`** for programmatic handling. **i18n**: clients translate using codes; messages may remain English for logs. **Validation** messages can include hints (“use yyyy-mm-dd”).

#### Expert

**Security**: user enumeration attacks use subtle message differences—consider uniform messages for auth failures. **Legal**: some industries require specific denial wording. **Versioning**: changing messages is usually non-breaking; changing codes is breaking.

```javascript
throw new GraphQLError("Could not complete sign-in", {
  extensions: { code: "AUTH_FAILED" },
});
```

#### Key Points

- Messages are human-facing; codes are machine-facing.
- Uniformity can be a security feature.
- Product and engineering should align on tone.

#### Best Practices

- Curate messages in one module or catalog.
- Log detailed internal reasons separately from client message.
- Snapshot-test critical error messages if they are contractual.

#### Common Mistakes

- Clients `switch` on `message` text.
- Leaking SQL or validation internals in messages.
- Different messages for the same `code` across endpoints.

---

### 18.1.4 Error Extensions

#### Beginner

**Extensions** carry structured metadata: `{ code: "BAD_USER_INPUT", field: "email" }`. Clients use them for branching; servers log them for analytics.

#### Intermediate

Apollo-style **`extensions.exception`** may include `stacktrace` in development—disable in production. **OpenTelemetry** trace ids can live in extensions for support tickets.

#### Expert

**Rate limiting** can attach `retryAfter`. **Partial errors** in mutations may include `suberrors` arrays—document shapes carefully to avoid unbounded growth. **PII** in extensions is as sensitive as in `data`.

```javascript
throw new GraphQLError("Validation failed", {
  extensions: {
    code: "BAD_USER_INPUT",
    issues: [
      { path: ["input", "age"], rule: "min", min: 18 },
    ],
  },
});
```

#### Key Points

- Extensions are the contract for machine-readable detail.
- They must be curated and documented.
- Treat them as part of security review.

#### Best Practices

- Publish TypeScript types or JSON Schema for extensions.
- Redact in `formatError` centrally.
- Limit array lengths and nesting depth.

#### Common Mistakes

- Using extensions as a dump of arbitrary `error.cause`.
- Breaking clients by renaming keys casually.
- Including passwords or tokens in issues arrays.

---

### 18.1.5 Error Codes

#### Beginner

**Error codes** are short stable strings in `extensions.code` (`NOT_FOUND`, `UNAUTHENTICATED`). They let clients handle failures without parsing natural language.

#### Intermediate

Align with **ecosystem** conventions where helpful (Apollo `UNAUTHENTICATED`, `FORBIDDEN`). Namespace codes for your product (`BILLING_INSUFFICIENT_FUNDS`) to avoid collisions with libraries.

#### Expert

Maintain a **registry** with semantics, HTTP mapping (if any), retry guidance, and ownership. **Deprecation** applies to codes too—support old codes during migration windows.

```javascript
const ErrorCodes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL: "INTERNAL",
};

throw new GraphQLError("Sign in required", {
  extensions: { code: ErrorCodes.UNAUTHENTICATED },
});
```

#### Key Points

- Codes are API surface—version them thoughtfully.
- They power client UX and observability dashboards.
- Consistency beats clever naming.

#### Best Practices

- Enum-like constants in server code.
- Changelog entries for new/changed codes.
- Map unknown errors to `INTERNAL` in production.

#### Common Mistakes

- Reusing one code for unrelated failures.
- No registry → drift and duplicates.
- Exposing raw third-party codes without mapping.

---

## 18.2 Error Types

### 18.2.1 Syntax Errors

#### Beginner

**Syntax errors** mean the query document is not valid GraphQL text: missing braces, stray commas, invalid string escapes. The parser fails before validation or execution.

#### Intermediate

Returned with **`locations`** pointing to the token. Fix by correcting the source string or query builder. Code generators usually prevent these in typed clients.

#### Expert

**Injection** of raw text into queries is dangerous—use variables and parameterized documents. **Persisted queries** store only hashes client-side, eliminating many syntax issues in production clients.

```graphql
query { user { id  # missing closing braces -> syntax error
```

```javascript
import { parse } from "graphql";
try {
  parse(`query { broken`);
} catch (e) {
  console.log(e.locations);
}
```

#### Key Points

- Syntax errors are entirely client or tooling bugs (usually).
- They never reach resolvers.
- Locations help IDEs and GraphiQL.

#### Best Practices

- Lint GraphQL documents in CI.
- Prefer codegen over string concatenation.
- Log syntax errors with operation source hash, not full text in prod if large.

#### Common Mistakes

- Dynamic string building of selections from untrusted input.
- Hiding syntax errors behind generic HTTP 400 without body details.

---

### 18.2.2 Type Errors

#### Beginner

**Type errors** come from **validation**: wrong argument types, selecting fields that do not exist, fragment type mismatches. The schema says what is legal; validation enforces it.

#### Intermediate

Distinguish from **resolver** type mismatches (resolver returns a string for an `Int` field)—those are execution errors with different messages. Fix type errors by updating client queries or schema consistently.

#### Expert

**Custom scalars** can throw `GraphQLError` during coercion—those surface as execution errors, not validation, depending on stage. Understand **literal vs variable** coercion paths.

```graphql
query { user(id: 123) { name } }  # if id is ID! may still coerce; if wrong type -> error
```

#### Key Points

- Type errors are static relative to schema.
- They protect resolvers from inconsistent inputs.
- Schema evolution must track client updates.

#### Best Practices

- Run `graphql-codegen` with strict config.
- Schema diff in CI.
- Communicate deprecations with dates.

#### Common Mistakes

- Deploying schema changes without updating mobile clients.
- Using `JSON` scalar to bypass all type safety.

---

### 18.2.3 Query Errors

#### Beginner

**Query errors** is an umbrella for **validation** failures and sometimes **complexity/depth** limits implemented as validation rules. The query is rejected wholesale—no execution.

#### Intermediate

Custom **validation rules** (no introspection, banned fields) also produce query errors. **Persisted query** mismatches return errors before execution.

#### Expert

**Query planning** layers in some servers may reject queries for resource reasons—still typically surfaced as GraphQL errors with extensions indicating reason.

```javascript
// depth limit validation -> query error array, no data
```

#### Key Points

- Query errors prevent side effects—good for safety.
- They should include actionable messages for developers.
- Differentiate user-facing vs developer-facing policies.

#### Best Practices

- Track rates of query errors by rule name.
- Provide docs for limits (depth, complexity).
- Consider separate introspection policies.

#### Common Mistakes

- Conflating query errors with auth failures (confusing DX).
- No metrics on rejected queries (silent client pain).

---

### 18.2.4 Resolver Errors

#### Beginner

**Resolver errors** occur during execution when a resolver throws or rejects. GraphQL places an error in `errors` and nulls affected fields per nullability rules.

#### Intermediate

**Async** rejections behave like throws if not caught. **Scalar** serialization can throw (for example invalid Date). **Database** driver errors should be mapped, not leaked raw.

#### Expert

**Partial results**: sibling fields may still succeed. **Non-null** violations bubble nulls upward until a nullable boundary—potentially dropping large subtrees. **Dataloader** batch functions must handle per-key errors carefully.

```javascript
const resolvers = {
  Query: {
    boom: () => {
      throw new Error("resolver failure");
    },
    ok: () => "fine",
  },
};
// query { ok boom } -> data.ok present, data.boom null, errors includes boom path
```

#### Key Points

- Resolver errors are the main runtime error class.
- Nullability defines blast radius.
- Mapping domain failures improves UX and security.

#### Best Practices

- Use `GraphQLError` with codes for expected failures.
- Central `formatError` for unexpected exceptions.
- Test non-null bubbling behavior for critical queries.

#### Common Mistakes

- Throwing raw DB errors to clients.
- Using non-null everywhere, amplifying single-field failures.
- Unhandled promise rejections in async resolvers.

---

### 18.2.5 Validation Errors

#### Beginner

Spec **validation errors** are static (section 18.2.2). Colloquially teams also say “validation error” for **input** failures thrown from resolvers with `BAD_USER_INPUT`—clarify which layer you mean.

#### Intermediate

Input validation should use consistent **`extensions`** (`issues`, `fieldPath`). **Zod** `.flatten()` maps nicely to structured issues.

#### Expert

**GraphQL** will not validate arbitrary business rules—your **domain** validation errors are execution-time. Combine with **union** payloads if you want errors as data instead of top-level `errors`.

```javascript
throw new GraphQLError("Invalid input", {
  extensions: { code: "BAD_USER_INPUT", issues: [...] },
});
```

#### Key Points

- Distinguish spec validation vs app input validation.
- Structure app validation errors for forms.
- Unify patterns across mutations.

#### Best Practices

- Single helper `badInput(issues)` for throw sites.
- Document issue schema.
- Integration tests for each rule.

#### Common Mistakes

- Mixing terminology across teams (confusion in incidents).
- Unstructured string-only validation feedback.

---

## 18.3 Error Handling Patterns

### 18.3.1 Try-Catch Pattern

#### Beginner

Wrap resolver bodies in `try/catch`. Map known failures to `GraphQLError`; log unknowns; rethrow or replace with generic messages.

#### Intermediate

Extract **`runResolver(fn)`** wrapper to standardize logging and metrics. Preserve `cause` in Node for chained errors.

#### Expert

**AsyncLocalStorage** can attach context for catch blocks. Beware **try/finally** with open transactions—always release resources.

```javascript
async function safeResolve(fn, ctx) {
  try {
    return await fn();
  } catch (e) {
    ctx.log.error(e);
    throw toGraphqlError(e, ctx.isDev);
  }
}
```

#### Key Points

- Try/catch is baseline for imperative Node code.
- Central mapping reduces duplication.
- Do not swallow errors silently.

#### Best Practices

- Narrow `catch` where possible.
- Use `GraphQLError` with originalError in dev only.
- Test both happy and failure paths.

#### Common Mistakes

- Empty catch blocks.
- Rethrowing without logging.
- Losing stack by wrapping poorly.

---

### 18.3.2 Result Pattern (Success/Failure Union)

#### Beginner

Model operations as **union** types: `CreatePostResult = Post | ValidationError | AuthError`. Clients select `__typename` and handle each case in data, not only `errors`.

#### Intermediate

This moves **expected** failures into `data`, reserving top-level `errors` for unexpected issues. Requires schema design buy-in and client handling.

#### Expert

**Relay** patterns and **GraphQL errors** discussions often compare unions vs errors. Unions complicate caching slightly but improve typed client flows. **Nullability** on payload fields still matters.

```graphql
union CreatePostResult = Post | ValidationError

type ValidationError {
  message: String!
  field: String
}

type Mutation {
  createPost(input: PostInput!): CreatePostResult!
}
```

```javascript
const resolvers = {
  CreatePostResult: {
    __resolveType(obj) {
      if (obj.__typename) return obj.__typename;
      if (obj.id) return "Post";
      return "ValidationError";
    },
  },
  Mutation: {
    createPost: (_p, { input }) => {
      if (!input.title) return { __typename: "ValidationError", message: "Title required", field: "title" };
      return { __typename: "Post", id: "1", title: input.title };
    },
  },
};
```

#### Key Points

- Unions make expected failures explicit in the schema.
- They reduce reliance on string matching in `errors`.
- They need disciplined `__resolveType`.

#### Best Practices

- Use for domain validation, not for every generic failure.
- Document each variant’s meaning.
- Codegen discriminated unions on the client.

#### Common Mistakes

- Forgetting `__resolveType` → runtime resolution errors.
- Putting sensitive details in union error objects.
- Mixing union errors and duplicate top-level errors redundantly.

---

### 18.3.3 Either Pattern

#### Beginner

In functional style, **`Either<Left, Right>`** represents failure (`Left`) or success (`Right`). In JavaScript, libraries like **fp-ts** provide `Either`; at execution boundary, convert `Left` to thrown `GraphQLError` or union value.

#### Intermediate

Keep **domain layer** in `Either` or `Result` types; **adapter** layer (resolver) unwraps. This separates pure validation from GraphQL concerns.

#### Expert

**Railway-oriented programming** composes `map`, `chain`, `alt` on results. Avoid throwing inside pure core—throw only at edges.

```javascript
function resultFromEither(either, mapOk) {
  if (either.tag === "left") {
    throw new GraphQLError(either.value.message, {
      extensions: { code: either.value.code },
    });
  }
  return mapOk(either.value);
}
```

#### Key Points

- Either/Result encourages explicit error handling.
- GraphQL resolvers are imperative edges—bridge carefully.
- Improves testability of domain code.

#### Best Practices

- Small composable validators returning Result.
- One place converting Result → GraphQL.
- TypeScript discriminated unions for Result.

#### Common Mistakes

- Mixing throws inside Either chains inconsistently.
- Over-engineering trivial resolvers.
- Forgetting to convert Left at boundary (errors leak as values).

---

### 18.3.4 Observable Pattern

#### Beginner

For **subscriptions**, event streams may emit **errors** on the async iterator or close the stream. Libraries map transport errors (WebSocket) separately from GraphQL payload errors.

#### Intermediate

Use **`AsyncIterableIterator`** with `throw` to signal fatal errors; some servers send `{ type: "error", payload: [...] }` over WebSocket per protocol.

#### Expert

**graphql-ws** protocol defines message types for `error`, `complete`, `next`. **Partial delivery** may interleave data and errors—clients should handle incremental frames.

```javascript
async function* subscribeToMetrics() {
  try {
    for await (const v of broker.metrics()) {
      yield { metricsUpdated: v };
    }
  } catch (e) {
    throw new GraphQLError("Subscription failed", { originalError: e });
  }
}
```

#### Key Points

- Subscriptions have transport + GraphQL error layers.
- Observable/async iteration patterns apply.
- Reconnection strategies belong on the client.

#### Best Practices

- Heartbeats and ping/pong for connection health.
- Clear separation of auth errors vs data errors.
- Log subscription ids with user context carefully.

#### Common Mistakes

- Assuming subscription errors behave exactly like query HTTP errors.
- No client backoff on repeated connection failures.
- Leaking internal stream errors verbatim.

---

### 18.3.5 Callback Pattern

#### Beginner

Legacy Node APIs use **callbacks** `(err, result) =>`. In GraphQL resolvers, prefer **promises**; if you must wrap callbacks, use `util.promisify` or `new Promise` to avoid unhandled errors.

#### Intermediate

**EventEmitter** error events need listeners or they throw in Node—do not expose raw emitters through resolvers without bridging.

#### Expert

**Stream** error handling: `stream.on('error', ...)` must reject the promise your resolver returns if you pipeline streams into HTTP responses (non-GraphQL) or file uploads.

```javascript
import { promisify } from "util";
import fs from "fs";

const readFile = promisify(fs.readFile);

const resolvers = {
  Query: {
    fileSnippet: async (_p, { path }) => {
      const buf = await readFile(path, "utf8"); // errors become rejections
      return buf.slice(0, 200);
    },
  },
};
```

#### Key Points

- Callbacks are rare inside modern GraphQL resolvers—promisify them.
- Unhandled errors crash or warn depending on Node version.
- Streams need explicit error listeners.

#### Best Practices

- Prefer promise-native libraries.
- Centralize promisify helpers.
- Never fire-and-forget async callbacks in resolvers.

#### Common Mistakes

- Mixing callback and async without awaiting.
- Double callbacks.
- Ignoring `stream.on('error')`.

---

## 18.4 Error Responses

### 18.4.1 Error Response Format

#### Beginner

Standard GraphQL HTTP response JSON:

```json
{
  "data": { ... },
  "errors": [ { "message": "...", "path": [...], "extensions": { ... } } ]
}
```

`data` may be omitted entirely for some failures (parse/validate).

#### Intermediate

**Batched** requests may return an array of such objects. **Multipart** uploads wrap GraphQL JSON with file parts—errors still in JSON body.

#### Expert

**GraphQL over GET** is discouraged; errors still JSON. **CDN** caching must never cache personalized error responses. **gzip** responses still follow the same shape.

```javascript
// graphql-http / express style
res.json(result); // { data, errors? }
```

#### Key Points

- Format is spec-defined at the GraphQL layer.
- Transport may wrap (batch, subscription messages).
- Clients must parse JSON bodies, not only HTTP codes.

#### Best Practices

- Consistent `Content-Type: application/json`.
- Include `requestId` in response headers for support.
- Document whether you use batch arrays.

#### Common Mistakes

- Custom wrappers that drop `errors` array.
- Non-JSON error bodies confusing clients.
- Caching error responses at edge.

---

### 18.4.2 Multiple Errors

#### Beginner

GraphQL can return **multiple errors** in one response: parallel fields each fail, or validation reports many issues. Iterate `errors` array on the client.

#### Intermediate

Order is not guaranteed to match field order—use **`path`** and **`extensions`** to correlate. **Apollo Client** merges by path for UI.

#### Expert

**Limit** the number of validation issues returned to prevent huge payloads. **Prioritize** blocking errors first in custom validators if you truncate.

```json
{
  "errors": [
    { "message": "a failed", "path": ["a"] },
    { "message": "b failed", "path": ["b"] }
  ]
}
```

#### Key Points

- Multi-error is normal, not exceptional.
- Clients need robust merging logic.
- Servers should cap issue lists.

#### Best Practices

- Stable ordering for tests (sort by path if needed).
- Document max issue count.
- Log all errors server-side even if truncated to client.

#### Common Mistakes

- Assuming only one error.
- UI showing only `errors[0]`.
- Unbounded validation issue arrays.

---

### 18.4.3 Partial Results

#### Beginner

**Partial results** mean `data` contains successful fields while `errors` lists failures elsewhere. This is core GraphQL semantics—handle both together.

#### Intermediate

**Nullable** parents become `null` when non-null children fail—data may shrink. Clients should use **null-safe** rendering and show inline field errors when libraries support it.

#### Expert

**@defer** (where available) streams incremental patches—errors may arrive in later chunks. **Transactionality** is not guaranteed across fields unless you design mutations accordingly.

```javascript
// query { ok broken } where broken throws -> data: { ok: "yes", broken: null }, errors: [...]
```

#### Key Points

- Partial success is a feature for resilience.
- UI must not assume all-or-nothing without checking `errors`.
- Mutations may need explicit payload unions for atomicity semantics.

#### Best Practices

- Apollo `errorPolicy: all` to read partial data.
- Design nullable boundaries thoughtfully.
- E2E tests for partial failure UX.

#### Common Mistakes

- Discarding `data` when `errors` present.
- Using non-null everywhere preventing partial views.
- Assuming sibling mutations are atomic without transactions.

---

### 18.4.4 Field Errors

#### Beginner

**Field errors** include a `path` like `["user", "posts", 3, "title"]` identifying which field failed in the response tree.

#### Intermediate

**List indices** in `path` pinpoint element failures. **Aliases** do not appear in path—field names do. This affects debugging when multiple same-name fields exist under different aliases (path still uses response keys).

#### Expert

**Interfaces** and **unions** can complicate mental models—path follows the executed response shape. **Tracing** tools overlay path on resolver spans.

```javascript
throw new GraphQLError("nope", { path: ["post", "author", "email"] });
```

#### Key Points

- Path ties errors to UI components in many apps.
- Understand list index semantics.
- Aliases affect client keys, not path field names oddly—verify with tests.

#### Best Practices

- Include `path` when throwing manually for clarity.
- Client component map keyed by path segments where helpful.
- Log path in structured logs.

#### Common Mistakes

- Assuming path includes operation name always (it does not).
- Misinterpreting paths with fragments.
- Client ignores path and shows generic banner only.

---

### 18.4.5 Root Errors

#### Beginner

**Root errors** fail entire operations: parse failures, validation failures, or root non-null fields (`Query` field) throwing—may nullify the whole `data`.

#### Intermediate

If **`data` is null** and only errors exist, the UI should show a global error state. Distinguish **401/403** HTTP from GraphQL auth errors inside 200.

#### Expert

**Custom** executors might attach errors without `path`—treat as global. **Rate limits** might be HTTP 429 without GraphQL body—client must handle both layers.

```json
{ "data": null, "errors": [{ "message": "Unauthorized" }] }
```

#### Key Points

- Root-level failures often block the entire view.
- HTTP and GraphQL layers both matter.
- Retry policies differ for network vs auth.

#### Best Practices

- Global error boundary in SPAs for `data === null`.
- Map auth errors to login flows.
- Include `requestId` header for support on root failures.

#### Common Mistakes

- Spinner forever when `data` null.
- Retrying non-idempotent mutations blindly on root errors.

---

## 18.5 Error Processing

### 18.5.1 Error Formatting

#### Beginner

Use **`formatError`** (or server equivalent) to transform errors before sending to clients: strip stacks, map codes, redact extensions.

#### Intermediate

Apollo Server `formatError: (err) => ({ message, extensions: { code } })`. Keep **`originalError`** server-side only. Development may include stacks in logs, not responses.

#### Expert

**Plugin** chains may run multiple formatters—order matters. **Internationalization** could swap messages by locale header at format time (less common than client-side).

```javascript
function formatError(err) {
  const isDev = process.env.NODE_ENV !== "production";
  return {
    message: err.message,
    path: err.path,
    locations: err.locations,
    extensions: {
      code: err.extensions?.code ?? "INTERNAL",
      ...(isDev ? { stack: err.stack } : {}),
    },
  };
}
```

#### Key Points

- Formatting is the last line of defense for leakage.
- Centralize; do not ad hoc per resolver.
- Dev/prod differences belong here.

#### Best Practices

- Snapshot formatted errors in tests.
- Whitelist extension keys for clients.
- Never send `originalError.stack` in prod responses.

#### Common Mistakes

- Inconsistent formatters across microservices.
- Returning entire `err` object JSON.stringified.
- Removing `path` accidentally during mapping.

---

### 18.5.2 Error Logging

#### Beginner

Log errors with **level**, **message**, **stack**, **requestId**, **operationName**, and **user id** (if safe). Use structured JSON in production.

#### Intermediate

**Sample** high-volume expected errors (validation) at lower levels. **Aggregate** by `extensions.code` in metrics.

#### Expert

**PII scrubbing** in log pipelines. **Correlation** across microservices via trace ids. **GDPR**: logging full queries may include personal data—redact variables.

```javascript
logger.error({
  msg: "graphql_resolver_error",
  err,
  requestId: ctx.requestId,
  operationName: ctx.operationName,
  path: err.path,
  code: err.extensions?.code,
});
```

#### Key Points

- Logs are for operators, not end users.
- Structure enables search and alerting.
- Sampling controls cost.

#### Best Practices

- One logging schema for GraphQL across services.
- Alert on spikes of `INTERNAL` codes.
- Never log tokens or passwords from variables.

#### Common Mistakes

- Logging at `error` for benign validation.
- Unstructured printf logs hard to query.
- Logging full documents with PII in production.

---

### 18.5.3 Error Tracking

#### Beginner

Send unexpected errors to **Sentry**, **Rollbar**, or similar with breadcrumbs: operation name, variables (sanitized), release version.

#### Intermediate

**Fingerprint** issues by `code` + resolver path to avoid noise. **Ignore** known client-caused validation errors if they flood the project.

#### Expert

**OpenTelemetry** spans should record `graphql.operation.name` and status `ERROR` with exception events. **Sampling** in tracing for high QPS.

```javascript
Sentry.captureException(err, {
  tags: { graphql_operation: ctx.operationName },
  extra: { path: err.path, code: err.extensions?.code },
});
```

#### Key Points

- Tracking finds regressions and hotspots.
- Tuning noise is ongoing work.
- Link traces, logs, and errors with shared ids.

#### Best Practices

- Environment and release tags on every event.
- Scrub PII in beforeSend hooks.
- Dashboards by operation and code.

#### Common Mistakes

- Every validation error creating a Sentry event.
- No release mapping (cannot regress pinpoint).
- Missing user context opt-in for privacy.

---

### 18.5.4 Error Reporting

#### Beginner

**Report** errors to clients via GraphQL `errors` and optionally HTTP status (some servers set 401 for auth). **Report** to operators via logs/metrics/traces.

#### Intermediate

**SLIs**: error rate per operation, latency. **SLAs**: communicate expected error shapes to API consumers.

#### Expert

**Status page** integration for systemic failures. **Customer support** playbooks using `requestId` lookup across systems.

```javascript
res.setHeader("x-request-id", requestId);
// body still GraphQL JSON; support asks user for x-request-id
```

#### Key Points

- Reporting spans client, operator, and business stakeholders.
- `requestId` bridges support and engineering.
- Metrics drive reliability investments.

#### Best Practices

- Public status for major outages.
- Internal runbooks linked from alerts.
- Postmortems for SEV incidents with GraphQL specifics.

#### Common Mistakes

- No request id on GraphQL responses.
- Only client-side error reporting (missing server truth).
- Vanity metrics ignoring partial failure rates.

---

### 18.5.5 Error Recovery

#### Beginner

**Recovery** strategies: **retry** idempotent queries on network failure, **refetch** after mutation failure, **fallback UI** when non-critical fields error.

#### Intermediate

**Mutations** need **idempotency keys** before blind retries. **Stale-while-revalidate** caches may show old data with banners when fresh load errors.

#### Expert

**Circuit breakers** stop hammering failing dependencies. **Graceful degradation** returns partial schema via feature flags when a subgraph is down (federation patterns).

```javascript
// Client pseudo-code with Apollo
const { data, error } = useQuery(QUERY, { errorPolicy: "all" });
if (error && !data) return <Retry onRetry={() => refetch()} />;
```

#### Key Points

- Recovery is client + server + infra concern.
- Retries without idempotency risk duplicates.
- Degraded mode beats total outage when acceptable.

#### Best Practices

- Exponential backoff with jitter.
- Mark idempotent operations in docs.
- Test chaos scenarios for subgraph failures.

#### Common Mistakes

- Infinite retry loops on 401.
- Retrying mutations that are not idempotent.
- Hiding errors without any user feedback.

---

## 18.6 Advanced Error Handling

### 18.6.1 Custom Error Classes

#### Beginner

Subclass **`Error`** with `code` and optional `extensions`. Throw from services; map to `GraphQLError` in one place.

#### Intermediate

Use **`instanceof`** checks in `toGraphQLError`. Avoid relying on `name` strings across bundles/minification—use `Symbol` or explicit `kind` field if needed.

#### Expert

**Cause** chaining (`new Error('wrap', { cause: orig })`) preserves stacks in Node 16+. Map causes in logs while keeping client messages generic.

```javascript
class AppError extends Error {
  constructor(message, { code, status = 500, extensions = {} } = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.extensions = extensions;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, { code: "NOT_FOUND", status: 404 });
  }
}
```

#### Key Points

- Custom classes encode domain semantics.
- Central mapping keeps resolvers clean.
- Preserve causes for debugging.

#### Best Practices

- Flat hierarchy (not dozens of subclasses) unless needed.
- Serializable fields only on errors crossing process boundaries thoughtfully.
- Unit test mapping table exhaustively.

#### Common Mistakes

- Throwing plain strings everywhere.
- Different class hierarchies in each microservice without shared package.
- Leaking `status` as HTTP without consistency.

---

### 18.6.2 Error Middleware

#### Beginner

**Middleware** wraps HTTP or GraphQL execution to catch unhandled errors, set status codes, and log. Express `err` middleware is classic; GraphQL servers expose plugins.

#### Intermediate

Distinguish **auth errors** (maybe HTTP 401) from generic GraphQL errors (often still 200). Be consistent to avoid confusing clients.

#### Expert

**Envelop** `useErrorHandler` can replace errors or add extensions. **Order** plugins so auth runs before execution. **Double handling** if both resolver and middleware log—coordinate levels.

```javascript
app.use((err, req, res, next) => {
  if (err.extensions?.code === "UNAUTHENTICATED") {
    res.status(401);
  }
  res.json({ errors: [{ message: err.message, extensions: err.extensions }] });
});
```

#### Key Points

- Middleware is safety net for uncaught errors.
- HTTP status policy is product/contract specific.
- Avoid duplicate logging noise.

#### Best Practices

- Single ownership of HTTP status mapping.
- Pass through `requestId` in error JSON if helpful.
- Test middleware with supertest.

#### Common Mistakes

- Setting 500 for all GraphQL errors blindly.
- Swallowing errors without response.
- Middleware assuming GraphQL only (REST routes differ).

---

### 18.6.3 Error Masking

#### Beginner

**Masking** replaces internal error details with generic messages for clients: “Something went wrong” while logs retain the truth.

#### Intermediate

**Whitelist** codes safe to expose; everything else becomes `INTERNAL`. **Apollo** `debug` flag toggles verbosity.

#### Expert

**Fingerprinting** attacks use error text—masking helps. **GraphiQL** in prod should be disabled or auth-protected to avoid exposing schema + verbose errors.

```javascript
function maskError(err) {
  if (err.extensions?.code && SAFE_CODES.has(err.extensions.code)) {
    return err;
  }
  return new GraphQLError("Internal error", {
    path: err.path,
    extensions: { code: "INTERNAL", requestId: err.extensions?.requestId },
  });
}
```

#### Key Points

- Masking protects internals and reduces attack surface.
- Operators still need full detail in logs.
- Balance with DX for trusted consumers.

#### Best Practices

- Explicit allowlist of public codes.
- Always log unmasked server-side.
- Periodic red-team review of error responses.

#### Common Mistakes

- Masking removes `path` making client debugging impossible.
- Forgetting to mask third-party library messages.
- Same verbose errors in prod GraphiQL.

---

### 18.6.4 Sensitive Data Protection

#### Beginner

Never put **passwords**, **tokens**, **credit card numbers**, or **PII** in `message` or `extensions` sent to clients. Redact variable logs.

#### Intermediate

**formatError** should strip `extensions.exception` in production. **Sentry** `beforeSend` scrubbing. **Tests** that assert no secret substrings in formatted errors.

#### Expert

**Legal**: HIPAA/GDPR implications of error telemetry—minimize data collection. **GraphQL variables** may appear in persisted query manifests—treat as sensitive storage.

```javascript
const SENSITIVE = ["password", "token", "card"];

function redactVariables(vars) {
  if (!vars) return vars;
  const out = { ...vars };
  for (const k of SENSITIVE) delete out[k];
  return out;
}
```

#### Key Points

- Errors are part of your data exfiltration surface.
- Redaction must be systematic, not ad hoc.
- Third-party errors are untrusted strings—never forward raw.

#### Best Practices

- Automated secret scanning in CI on sample error JSON.
- Minimal extensions by default; opt-in verbose for admins.
- Train support staff on safe log sharing.

#### Common Mistakes

- Logging `Authorization` headers on error paths.
- Including SQL with bound values containing PII in messages.
- Client `console.log` entire error objects in mobile apps.

---

### 18.6.5 Client Error Handling

#### Beginner

GraphQL clients (**Apollo Client**, **urql**, **Relay**) expose `error`, `errors` array, and partial `data`. Choose **`errorPolicy`** consciously (`none`, `ignore`, `all`).

#### Intermediate

**Retry links** for network errors only. **Cache updates** on mutation errors should not corrupt store—rollback optimistic updates.

#### Expert

**Normalized caches** need field-level error policies; not all libraries support fine-grained field errors equally. **SSR** must serialize errors safely to HTML without leaking stacks.

```javascript
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const e of graphQLErrors) {
      if (e.extensions?.code === "UNAUTHENTICATED") {
        // trigger logout / refresh
      }
    }
  }
  if (networkError) {
    // toast, retry, offline mode
  }
});

const client = new ApolloClient({
  link: from([errorLink, new HttpLink({ uri: "/graphql" })]),
  cache: new InMemoryCache(),
});
```

#### Key Points

- Clients must handle network + GraphQL layers.
- Policies affect UX significantly.
- Optimistic UI needs explicit rollback paths.

#### Best Practices

- Central link/middleware for auth errors.
- User-visible toasts for unexpected failures.
- E2E tests for error states.

#### Common Mistakes

- Ignoring `networkError` when `errors` empty.
- Optimistic updates without rollback on failure.
- Caching responses that include sensitive errors.

---
