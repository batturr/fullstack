# GraphQL Basics

## 📑 Table of Contents

- [2.1 Query Structure](#21-query-structure)
  - [2.1.1 Query Syntax](#211-query-syntax)
  - [2.1.2 Query Language Syntax](#212-query-language-syntax)
  - [2.1.3 Query Validation](#213-query-validation)
  - [2.1.4 Response Format](#214-response-format)
  - [2.1.5 JSON Response Structure](#215-json-response-structure)
- [2.2 HTTP and Transport](#22-http-and-transport)
  - [2.2.1 HTTP POST Requests](#221-http-post-requests)
  - [2.2.2 Query String Requests](#222-query-string-requests)
  - [2.2.3 Request Headers](#223-request-headers)
  - [2.2.4 Response Headers](#224-response-headers)
  - [2.2.5 Status Codes](#225-status-codes)
- [2.3 Single Endpoint](#23-single-endpoint)
  - [2.3.1 Endpoint Concept](#231-endpoint-concept)
  - [2.3.2 Query/Mutation/Subscription Routing](#232-querymutationsubscription-routing)
  - [2.3.3 Operation Names](#233-operation-names)
  - [2.3.4 Multiple Operations](#234-multiple-operations)
  - [2.3.5 Batch Queries](#235-batch-queries)
- [2.4 GraphQL Execution](#24-graphql-execution)
  - [2.4.1 Query Execution Flow](#241-query-execution-flow)
  - [2.4.2 Field Resolution](#242-field-resolution)
  - [2.4.3 Type Checking](#243-type-checking)
  - [2.4.4 Error Collection](#244-error-collection)
  - [2.4.5 Response Generation](#245-response-generation)
- [2.5 Developer Experience](#25-developer-experience)
  - [2.5.1 GraphQL IDE (GraphQL Playground, Insomnia)](#251-graphql-ide-graphql-playground-insomnia)
  - [2.5.2 Auto-completion](#252-auto-completion)
  - [2.5.3 Documentation Browser](#253-documentation-browser)
  - [2.5.4 Query History](#254-query-history)
  - [2.5.5 Schema Inspection](#255-schema-inspection)
- [2.6 Common Patterns](#26-common-patterns)
  - [2.6.1 Pagination Pattern](#261-pagination-pattern)
  - [2.6.2 Filtering Pattern](#262-filtering-pattern)
  - [2.6.3 Sorting Pattern](#263-sorting-pattern)
  - [2.6.4 Search Pattern](#264-search-pattern)
  - [2.6.5 Relationship Pattern](#265-relationship-pattern)

---

## 2.1 Query Structure

### 2.1.1 Query Syntax

**Beginner:** A GraphQL document starts with optional `query`, `mutation`, or `subscription`, then a **name**, then a **selection set** in `{ }`. Fields are separated by whitespace or newlines. Arguments use `(` `)` with `name: value`.

**Intermediate:** Strings use double quotes; enums are unquoted; booleans are `true`/`false`; lists are `[ ... ]`; objects for input types use `{ key: value }`. You can use **variables** declared at the top: `query Name($x: Int)`.

**Expert:** The **lexer** tokenizes the source; **parser** builds an AST. **Source locations** attach to nodes for error reporting. **Block strings** (`"""`) support descriptions in SDL, not typically in client queries unless tooling allows.

```graphql
query SyntaxDemo($limit: Int = 10) {
  users(limit: $limit) {
    id
    name
  }
}
```

```javascript
const { parse } = require("graphql");

const doc = parse(`
  query SyntaxDemo($limit: Int = 10) {
    users(limit: $limit) { id name }
  }
`);

console.log(doc.kind); // Document
```

#### Key Points

- **Curly braces** define selection sets; nesting mirrors the response tree.
- **Commas** are optional between fields (style guides vary).
- **Default variable values** live in the operation signature.

#### Best Practices

- Use **Prettier** with a GraphQL plugin for consistent formatting.
- Prefer **multi-line** queries in source for readable diffs.
- Name **every operation** in production client code.

#### Common Mistakes

- Using **single quotes** for strings (invalid in GraphQL query language).
- Forgetting **`$`** when referencing variables in the document body.
- Mixing **JSON** object syntax incorrectly inside argument lists.

---

### 2.1.2 Query Language Syntax

**Beginner:** Beyond fields, you have **fragments** (`fragment Name on Type { ... }`), **inline fragments** (`... on Type`), **spreads** (`...Name`), and **directives** (`@include(if: $flag)`).

**Intermediate:** **Aliases** rename a field in the response: `smallPic: image(maxWidth: 64)`. **Directives** can be custom (server-defined) or built-in. **Fragment composition** must not create cycles.

**Expert:** **Executable definitions** (operations) and **type system definitions** (SDL) share grammar roots but appear in different contexts. **Variable definitions** use `!` for required. **Union/interface** resolution requires type conditions in selection sets for concrete fields.

```graphql
query LangFull($withBio: Boolean!) {
  user(id: "1") {
    id
    name
    ...UserBio @include(if: $withBio)
  }
}

fragment UserBio on User {
  bio
}
```

```javascript
// Serialize variables with JSON types matching GraphQL scalars
const variables = { withBio: true };
// POST { query, variables: JSON.stringify(variables) } conceptually
console.log(JSON.stringify(variables));
```

#### Key Points

- **Spreads** reuse field sets; **inline fragments** handle polymorphism.
- **Directives** attach behavior without changing schema shape.
- **Aliases** solve same-field-with-different-args collisions.

#### Best Practices

- Keep **fragments** on **concrete types** or interfaces consistently.
- Limit **custom directives** to cross-cutting concerns (auth, caching hints).
- Document **directive semantics** in server README or schema extensions.

#### Common Mistakes

- **Fragment type** mismatch (`fragment F on Dog` used under `Cat` fields).
- **Recursive** fragment spreads (invalid).
- **Aliases** hiding critical field names from generic tooling.

---

### 2.1.3 Query Validation

**Beginner:** Before running, the server checks your query against the **schema**. If you ask for `user { age }` but `User` has no `age`, you get a **validation error**.

**Intermediate:** Validation includes **scalar leaf fields**, **argument types**, **variable types**, **fragment spread rules**, and **directives placement**. Validation failures typically return **400** (implementation-dependent) with no execution.

**Expert:** Implementations use the `graphql/validation` rule set. Custom rules can enforce **complexity**, **depth**, or **field allowlists**. **@specifiedBy** and custom scalars add **value** validation at coercion time.

```graphql
# Invalid: field does not exist on User (will fail validation)
query BadValidation {
  user(id: "1") {
    shoeSize
  }
}
```

```javascript
const { buildSchema, validate, parse } = require("graphql");

const schema = buildSchema(`
  type Query { user(id: ID!): User }
  type User { id: ID! name: String }
`);

const errors = validate(schema, parse(`query { user(id:"1") { shoeSize } }`));
console.log(errors.map((e) => e.message));
```

#### Key Points

- **Validation** is static; **resolver errors** happen later during execution.
- **Helpful messages** come from good schema descriptions and server config.
- **CI** can validate client operations against a schema artifact.

#### Best Practices

- Run **`graphql-codegen`** or **Apollo schema check** in CI.
- Return **clear validation errors** in development; sanitize in production if needed.
- Version **client operations** with schema hashes.

#### Common Mistakes

- Assuming **runtime** resolver checks replace **schema** correctness.
- **Skipping** CI checks for `.graphql` files.
- Treating **validation errors** as “server bugs.”

---

### 2.1.4 Response Format

**Beginner:** The standard response is JSON with **`data`** holding results and optional **`errors`** as an array. If the whole request fails early, `data` may be `null`.

**Intermediate:** **Partial data** is allowed: some fields succeed while others add to `errors`. **`extensions`** may include tracing, rate-limit metadata, or codes.

**Expert:** **Incremental delivery** (`@defer`) changes how responses arrive (multipart). **Subscriptions** often use a **message envelope** per event over WebSockets, still carrying `data`/`errors`.

```json
{
  "data": {
    "user": {
      "id": "1",
      "name": "Ada"
    }
  },
  "errors": [
    {
      "message": "Not authorized",
      "path": ["user", "email"],
      "locations": [{ "line": 3, "column": 5 }]
    }
  ]
}
```

```javascript
const express = require("express");
const app = express();

app.post("/graphql", express.json(), (req, res) => {
  res.json({
    data: { ping: "pong" },
    errors: undefined,
    extensions: { requestId: req.id },
  });
});
```

#### Key Points

- **`errors` is a list**, not a single object.
- **`path`** arrays pinpoint which field failed in the tree.
- **`data: null`** with errors often means root failure or forbidden operation.

#### Best Practices

- Standardize **`extensions.code`** values across your API.
- Teach clients to **merge** partial `data` with loading states carefully.
- Avoid leaking **stack traces** in `message` publicly.

#### Common Mistakes

- Clients assuming **`errors` absent** means full success without checking `path`.
- Servers returning **non-JSON** bodies for GraphQL errors inconsistently.
- Using **HTTP 200** for everything including transport failures (mixed practice—pick a policy).

---

### 2.1.5 JSON Response Structure

**Beginner:** Under `data`, keys match your **operation’s selection**. If you used an alias, the **alias name** appears in JSON, not the schema field name.

**Intermediate:** **Lists** become JSON arrays; **objects** become JSON objects; **scalars** map to JSON primitives (`null` for GraphQL `null`). **`__typename`** becomes a string property.

**Expert:** **Custom scalars** serialize to JSON types per server rules (often string for `DateTime`). **BigInt** may need string encoding. **Map**-like structures are not native—model explicitly.

```graphql
query JsonShape {
  me {
    id
    handle: username
    roles
  }
}
```

```javascript
// Illustrative response after execution
const exampleResponse = {
  data: {
    me: {
      id: "u_1",
      handle: "ada",
      roles: ["ADMIN", "USER"],
    },
  },
};

console.log(JSON.stringify(exampleResponse, null, 2));
```

#### Key Points

- Response keys follow **selection sets**, not the raw schema field names when aliased.
- **Order** of keys in JSON objects is not semantically meaningful.
- **Coercion** rules define how literals become runtime values.

#### Best Practices

- Keep **response size** small for mobile; prefer **pagination**.
- Use **consistent date formats** (ISO-8601 strings) for custom scalars.
- Document **non-standard** scalar JSON encodings.

#### Common Mistakes

- Expecting **ordered** map semantics from GraphQL list results incorrectly.
- Returning **non-JSON-serializable** values from resolvers (functions, BigInt without conversion).
- **Aliasing** away critical field names and breaking generic mappers.

---

## 2.2 HTTP and Transport

### 2.2.1 HTTP POST Requests

**Beginner:** The usual pattern is **POST** to `/graphql` with **JSON body** `{ "query": "...", "variables": { ... } }`.

**Intermediate:** **Content-Type: application/json** is standard. Some servers accept **application/graphql** with raw query string body. **Batched** requests may send an array of payloads.

**Expert:** **APQ (automatic persisted queries)** sends a **hash** instead of full query on repeat requests. **CDN** integration may require **GET persisted queries** with careful **allowlisting**.

```javascript
const fetch = require("node-fetch");

async function postGraphQL(endpoint, query, variables, operationName) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables, operationName }),
  });
  return res.json();
}
```

```graphql
query PostExample {
  health
}
```

#### Key Points

- **POST** avoids URL length limits for large queries.
- **Variables** should always travel as JSON, not string interpolation.
- **Operation name** helps server logs and APM tools.

#### Best Practices

- Enable **gzip/brotli** at reverse proxy for large responses.
- Set **reasonable body size limits** to mitigate abuse.
- Use **`fetch` keep-alive** in Node service-to-service calls.

#### Common Mistakes

- **String-concatenating** secrets into `query` instead of headers.
- **Double JSON encoding** the body.
- Missing **`await` on `.json()`** leading to race bugs.

---

### 2.2.2 Query String Requests

**Beginner:** Some servers support **GET** with `?query={...}&variables={...}` for **caching** at CDNs. The query must be **URL-encoded**.

**Intermediate:** **Variables** as query param are a **JSON string** encoded. Not all servers support GET; **mutations must not** use GET (unsafe caching).

**Expert:** **Persisted query IDs** as `extensions` or dedicated params reduce size. **RFC 9110** caching semantics interact with **Vary** headers and **auth**. **CSRF** risks differ for GET vs POST.

```javascript
const qs = require("querystring");

function buildGetUrl(endpoint, query, variables) {
  return `${endpoint}?${qs.stringify({
    query,
    variables: JSON.stringify(variables ?? {}),
  })}`;
}

// Only for queries, allowlisted, and safe caching policies
console.log(buildGetUrl("https://api.example.com/graphql", "{ ping }", {}));
```

```graphql
query GetPing {
  ping
}
```

#### Key Points

- **GET** is for **reads** only; never expose **mutations** over GET.
- **URL length** limits break large queries—use **persisted queries**.
- **Encoding** mistakes are a frequent source of 400s.

#### Best Practices

- **Allowlist** which operations may run via GET.
- Set **Cache-Control** explicitly when using GET for public data.
- Test **CDN** behavior with **authenticated** GET carefully (often avoid).

#### Common Mistakes

- **Caching private** user-specific GET GraphQL responses at shared caches.
- **Forgetting** to encode JSON variables.
- Using GET for **introspection** in production accidentally.

---

### 2.2.3 Request Headers

**Beginner:** Typical headers: **`Content-Type`**, **`Accept`**, **`Authorization: Bearer <jwt>`**.

**Intermediate:** Add **`apollographql-client-name`** / version headers for support. **B3/traceparent** for tracing. **`X-Request-ID`** for correlation.

**Expert:** **CSRF protection** for cookie-based auth may require **custom headers** or **double-submit tokens**. **APQ** uses `persistedQuery` extensions. **Federation** subgraph requests carry **`graphql-router`** metadata.

```javascript
function graphqlHeaders({ token, requestId }) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(requestId ? { "x-request-id": requestId } : {}),
  };
}
```

```graphql
query WithAuthContext {
  me {
    id
  }
}
```

#### Key Points

- Headers are **transport** concerns; **don’t duplicate** secrets in query text.
- **Correlation IDs** belong in headers for supportability.
- **CORS** must allow needed headers in browsers.

#### Best Practices

- Centralize **header building** in one client module.
- Redact **Authorization** in logs.
- Document **required** headers for partners.

#### Common Mistakes

- **Logging** full JWTs in access logs.
- **Browser** clients blocked by missing **CORS** preflight config.
- Using **cookies** without **SameSite** and **CSRF** strategy.

---

### 2.2.4 Response Headers

**Beginner:** Servers return **`Content-Type: application/json`**. **Caching** headers may appear for GET.

**Intermediate:** **`Cache-Control`** on GET queries can enable edge caching. **GraphQL** POST responses are often **`private, no-store`** unless designed otherwise.

**Expert:** **Tracing** extensions may pair with **server-timing** headers. **Rate limit** info sometimes appears as **`Retry-After`** or custom headers alongside `200` responses.

```javascript
const express = require("express");
const app = express();

app.post("/graphql", (req, res) => {
  res.set("X-GraphQL-Endpoint", "primary");
  res.json({ data: { ok: true } });
});
```

```graphql
query RespHeadersDemo {
  ok
}
```

#### Key Points

- **HTTP headers** and **GraphQL errors** are orthogonal layers.
- **Security headers** (CSP, etc.) apply at HTTP layer as usual.
- **Client** should not assume **specific** headers unless documented.

#### Best Practices

- Add **`requestId`** in response headers for **support** correlation.
- Document **rate limit** headers for API consumers.
- Use **ETag** rarely with GraphQL unless using **normalized GET** patterns.

#### Common Mistakes

- Expecting **`304 Not Modified`** semantics without a designed cache policy.
- **Leaking** internal cluster names via headers.
- **Inconsistent** `Content-Type` on error responses.

---

### 2.2.5 Status Codes

**Beginner:** Many GraphQL servers use **HTTP 200** even when `errors` is non-empty, because **partial success** is valid. Some use **400** for validation/syntax errors.

**Intermediate:** **Network errors** vs **GraphQL errors**: clients should branch on both. **401/403** may apply when **entire operation** is rejected before execution.

**Expert:** Pick a **documented policy**: e.g., syntax/validation → 400; auth at gateway → 401; field errors → 200 with `errors`. **Proxies** and **WAFs** behave differently—align with SRE.

```javascript
async function interpretStatus(response, body) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  if (body.errors?.length) {
    return { ok: false, partial: Boolean(body.data), body };
  }
  return { ok: true, body };
}
```

```graphql
query StatusDemo {
  ping
}
```

#### Key Points

- **GraphQL layer** errors live in **`errors`**; HTTP status is **transport**.
- **Clients** must handle **mixed** outcomes consistently.
- **Gateways** may normalize status codes—test end-to-end.

#### Best Practices

- Publish your **HTTP status** policy in API docs.
- Map **`UNAUTHENTICATED`** extension codes to login flows in UI.
- Monitor **ratio** of HTTP 4xx/5xx vs GraphQL `errors`.

#### Common Mistakes

- Treating **only HTTP status** as success/failure.
- Returning **500** for all resolver bugs without **structured** error codes.
- **Inconsistent** policies across **microservices** behind one gateway.

---

## 2.3 Single Endpoint

### 2.3.1 Endpoint Concept

**Beginner:** Clients configure **one URL** for GraphQL instead of many REST paths. All operations go there.

**Intermediate:** The endpoint is often **`/graphql`** or **`/api`**. **WebSocket** URL may differ for subscriptions (`/graphql` with upgrade).

**Expert:** **Supergraphs** expose one router endpoint; **subgraphs** are internal. **Multi-tenant** hosts may use **path-based** tenant routing still as “one endpoint per tenant.”

```javascript
const config = {
  httpEndpoint: process.env.GRAPHQL_HTTP_URL || "http://localhost:4000/graphql",
  wsEndpoint: process.env.GRAPHQL_WS_URL || "ws://localhost:4000/graphql",
};
module.exports = config;
```

```graphql
query EndpointPing {
  __typename
}
```

#### Key Points

- **Endpoint** simplifies client config; complexity moves to **schema**.
- **WS vs HTTP** may be separate URLs in practice.
- **Staging/prod** endpoints should be **environment-driven**.

#### Best Practices

- Use **reverse proxy** path normalization (`/graphql` vs `/graphql/`).
- Health checks on **`/health`**, not mixed into GraphQL unless intentional.
- Document **IPv6**, **TLS**, and **mTLS** requirements for partners.

#### Common Mistakes

- **Hardcoding** localhost URLs in committed client code.
- **Same endpoint** for **admin** and **public** without **authz** separation.
- **Missing** WebSocket **sticky sessions** behind load balancers.

---

### 2.3.2 Query/Mutation/Subscription Routing

**Beginner:** The **first keyword** in your document chooses the operation type. Server runs **queries** as reads, **mutations** as writes (conceptually), **subscriptions** as streams.

**Intermediate:** Spec does not mandate **side-effect** separation; **convention** says avoid side effects in queries. **Mutation root** fields run in **serial** order per spec (sibling fields), unlike query parallelization.

**Expert:** **Query planner** in some servers parallelizes independent fields. **Mutation** ordering matters for **transactional** semantics—group related writes in **one mutation field** if you need atomicity at application level.

```graphql
mutation RoutingDemo {
  updateProfile(name: "Ada") {
    ok
  }
}
```

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  type Mutation { updateProfile(name: String!): UpdatePayload }
  type UpdatePayload { ok: Boolean! }
`);

const root = {
  updateProfile: ({ name }) => {
    console.log("write:", name);
    return { ok: true };
  },
};

graphql({
  schema,
  source: "mutation { updateProfile(name: \"Ada\") { ok } }",
  rootValue: root,
}).then(console.log);
```

#### Key Points

- **Mutation field order** is significant for side-by-side fields.
- **Subscriptions** need a **transport** beyond typical HTTP request/response.
- **Naming** roots `Query`, `Mutation`, `Subscription` is convention in SDL.

#### Best Practices

- Implement **idempotent** mutations where possible.
- Use **Payload** types (`UpdateUserPayload`) for **errors + entity** patterns.
- Document **which** mutations must not be retried blindly.

#### Common Mistakes

- Performing **writes** inside **query** resolvers.
- Assuming **database transactions** span multiple root mutation fields automatically.
- **Mixing** subscription setup with HTTP middleware incorrectly.

---

### 2.3.3 Operation Names

**Beginner:** `query MyName { ... }` gives the operation a **name** for logs and UI lists.

**Intermediate:** **Anonymous** operations are allowed only if **one** operation exists in the document. **Named** operations are required for **multiple** operations in one document.

**Expert:** **Observability** tools bucket metrics by **operation name** + **schema tag**. **Persisted query** registries key by **hash** and optionally name.

```graphql
query UserDashboard {
  me {
    id
    notificationsUnreadCount
  }
}
```

```javascript
const body = {
  operationName: "UserDashboard",
  query: `
    query UserDashboard {
      me { id notificationsUnreadCount }
    }
  `,
};
console.log(JSON.stringify(body, null, 2));
```

#### Key Points

- **operationName** in JSON body must **match** one operation in the document if multiple exist.
- **Stable names** matter for **dashboards** and **SLOs**.
- **Codegen** often derives **hook names** from operation names.

#### Best Practices

- Use **PascalCase** operation names matching UI surface.
- Ban **anonymous** operations in production client bundles via lint rule.
- Align **operation name** with **OpenTelemetry** span names.

#### Common Mistakes

- **Renaming** operations without updating **alerts** tied to old names.
- Sending **wrong operationName** when batching multiple operations.
- **Duplicate** operation names across unrelated features.

---

### 2.3.4 Multiple Operations

**Beginner:** One **document** can define **several** named operations, but you execute **one at a time** by passing **`operationName`**.

**Intermediate:** Useful for **co-locating** related operations in one `.graphql` file for codegen. **Servers** reject execution if **operationName** missing when multiple exist.

**Expert:** **Apollo client** splits by operation at build time. **Router** may **dedupe** similar operations in **batch**—still specify **operationName** explicitly.

```graphql
query UsersLight {
  users {
    id
    name
  }
}

query UsersHeavy {
  users {
    id
    name
    auditLog {
      at
      action
    }
  }
}
```

```javascript
const doc = `
  query UsersLight { users { id name } }
  query UsersHeavy { users { id name auditLog { at action } } }
`;

const run = (operationName) =>
  fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: doc,
      operationName,
      variables: {},
    }),
  });

// run("UsersLight") vs run("UsersHeavy")
```

#### Key Points

- **operationName** selects which **executable definition** runs.
- **Tree shaking** in clients may drop unused operations from bundles.
- **Server** should **validate** only the selected operation.

#### Best Practices

- Group operations by **domain** file, not one mega-file.
- **CI** should ensure **unique** operation names repo-wide (optional rule).
- **Avoid** shipping **admin** operations in **mobile** bundles.

#### Common Mistakes

- **Forgetting operationName** and getting **400** responses.
- **Copy-paste** leading to **duplicate** operation names in one document.
- **Mixing** radically different **auth** requirements in one file without guards.

---

### 2.3.5 Batch Queries

**Beginner:** **Batching** means sending **multiple GraphQL requests** in one HTTP call (array of bodies) or using **DataLoader** to batch backend fetches—two different meanings.

**Intermediate:** **HTTP batching** reduces **network overhead** but complicates **caching** and **error handling**. **DataLoader** batches **resolver-level** calls within **one** operation.

**Expert:** **Apollo** historically supported batching links; many teams **disable** HTTP batching at CDN edges. Prefer **persisted queries** + **HTTP/2 multiplexing** for parallel operations.

```javascript
// Illustrative HTTP batch (server must explicitly support)
const batchPayload = [
  { query: "{ ping }" },
  { query: "{ pong }" },
];

fetch("/graphql/batch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(batchPayload),
});
```

```graphql
query BatchItemA { a }
query BatchItemB { b }
```

#### Key Points

- Clarify **HTTP batch** vs **resolver batch** in team vocabulary.
- **Batching** can **amplify** slow resolvers if not careful.
- **Timeouts** apply to the **whole** batch request.

#### Best Practices

- Prefer **single** well-designed operations over **many tiny** batched ones when possible.
- If batching HTTP, define **per-item error** shape clearly.
- Use **DataLoader** scoped **per request** to avoid cache leaks.

#### Common Mistakes

- **Global** DataLoader instances across requests (data leaks).
- **Batching** **mutations** without clear **ordering** semantics.
- **CDN** caching **batch** responses incorrectly.

---

## 2.4 GraphQL Execution

### 2.4.1 Query Execution Flow

**Beginner:** Server **reads** your string, **checks** it (**parse** + **validate**), then **runs** resolvers to build `data`.

**Intermediate:** Stages: **lex/parse → validate → analyze (optional) → execute**. **Coercion** applies to arguments and variables. **Middleware** may wrap context creation.

**Expert:** **Incremental execution** with `@defer` changes delivery; **cancellation** via `AbortSignal` in some frameworks. **Tracing** hooks into **field resolve** events.

```javascript
const { graphql, parse, validate, execute, buildSchema } = require("graphql");

const schema = buildSchema(`type Query { hello: String }`);

async function stages(source) {
  const ast = parse(source);
  const valErrs = validate(schema, ast);
  if (valErrs.length) return { stage: "validate", valErrs };
  const result = await execute({
    schema,
    document: ast,
    rootValue: { hello: "world" },
  });
  return { stage: "execute", result };
}

stages("{ hello }").then(console.log);
```

```graphql
query ExecFlow {
  hello
}
```

#### Key Points

- **Execution** only begins after **successful validation** (unless custom).
- **Context** is created once per operation in typical servers.
- **Async resolvers** are first-class in Node.

#### Best Practices

- Add **middleware** for auth **before** `execute`.
- Measure **time in validate** vs **execute** separately in APM.
- Use **`graphql()`** helper in tests to exercise full pipeline.

#### Common Mistakes

- Doing **heavy work** in validation plugins.
- **Sharing** mutable context across **concurrent** field resolutions unsafely.
- **Throwing strings** instead of `GraphQLError` for structured errors.

---

### 2.4.2 Field Resolution

**Beginner:** Each field has a **resolver** function. For `user { name }`, the `User.name` resolver returns a string (or a Promise).

**Intermediate:** **Default resolvers** read properties from parent objects if you omit explicit functions. **Root** resolvers (`Query.user`) fetch the parent object for child fields.

**Expert:** **Resolver parent** typing matters in TypeScript; **info** argument exposes **AST**, **variableValues**, and **path**. **Tracing** instruments each resolver call.

```javascript
const resolvers = {
  Query: {
    user: (_parent, args) => ({ id: args.id, _name: "Ada" }),
  },
  User: {
    name: (parent) => parent._name,
  },
};

// Pseudocode: passed to makeExecutableSchema or framework equivalent
module.exports = { resolvers };
```

```graphql
query ResolveDemo {
  user(id: "1") {
    name
  }
}
```

#### Key Points

- Resolvers are **per field**, not per type as a whole.
- **Parent** value flows down the tree.
- **Async** resolvers should **propagate** errors as `GraphQLError` when possible.

#### Best Practices

- Keep resolvers **thin**; push IO to services/repos.
- Use **DataLoader** in `User.friends`, not raw DB per row.
- Add **timeouts** around slow downstream HTTP calls.

#### Common Mistakes

- **Fat resolvers** with SQL string building inline.
- **Throwing** raw database errors to clients.
- **Accidentally** returning **undefined** for non-null fields.

---

### 2.4.3 Type Checking

**Beginner:** Arguments must match **types** (`Int` vs `String`). Variables must match **declared** types.

**Intermediate:** **Input objects** validate **recursively**. **Enums** reject unknown values. **Lists** validate element types.

**Expert:** **Custom scalars** parse **literal** and **variable** inputs separately. **Union/interface** resolution uses **runtime type** of returned object in reference implementations via `__resolveType` or explicit `__typename`.

```graphql
query TypeCheck($n: Int!) {
  twice(n: $n)
}
```

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query { twice(n: Int!): Int! }
`);

graphql({
  schema,
  source: "query ($n: Int!) { twice(n: $n) }",
  variableValues: { n: "2" }, // string literal may coerce to Int if valid
  rootValue: { twice: ({ n }) => n * 2 },
}).then(console.log);
```

#### Key Points

- **Coercion** follows spec rules (e.g., valid int strings → Int).
- **Invalid** coercion yields **argument errors** at execution or validation depending on case.
- **Non-null** violations bubble per **null propagation** rules.

#### Best Practices

- Prefer **strict** client codegen to catch type errors **pre-runtime**.
- Unit-test **custom scalars** with both **literals** and **variables**.
- Document **coercion** surprises for API consumers.

#### Common Mistakes

- Relying on **implicit** coercion instead of **clean** client types.
- **Mixed** `ID` types (number vs string) across services.
- **Union** return values missing **`__typename`** in implementation objects.

---

### 2.4.4 Error Collection

**Beginner:** When a field fails, GraphQL can still return **other fields** in `data` and put an error entry in `errors` with a **path**.

**Intermediate:** **Non-null** field failures may **null** parent nullable fields. Multiple errors **collect** for independent sibling fields when possible.

**Expert:** **`GraphQLError`** supports **`extensions`**, **`path`**, **`locations`**. **Masking** production errors while logging internals is a security pattern.

```javascript
const { GraphQLError } = require("graphql");

function friendlyError() {
  throw new GraphQLError("Could not load email", {
    path: ["user", "email"],
    extensions: { code: "INTERNAL", requestId: "abc" },
  });
}

// Resolver catches downstream errors and maps to GraphQLError
```

```graphql
query ErrorCollection {
  user(id: "1") {
    name
    email
  }
}
```

#### Key Points

- **Partial success** is a first-class scenario.
- **`path`** is essential for **UI** to show inline errors.
- **Never** expose **raw SQL** in public `message`.

#### Best Practices

- Standardize **`extensions.code`** enums (`UNAUTHENTICATED`, `FORBIDDEN`).
- Log **full** error details **server-side** only.
- Teach **clients** to render **field-level** errors for forms.

#### Common Mistakes

- Returning **500** only, losing **field paths**.
- **Swallowing** errors and returning **`null`** silently.
- **Inconsistent** error shapes across **subgraphs**.

---

### 2.4.5 Response Generation

**Beginner:** After resolvers run, the engine **assembles** a JSON object matching the **selection set**.

**Intermediate:** **Serialization** applies custom scalars. **Lists** preserve order. **Omitted** fields are not present in JSON (undefined vs null distinctions happen in resolver layer).

**Expert:** **@defer** streams **patches**; **subscriptions** push **message frames**. **Federation** **plans** queries across services then **merges** results.

```javascript
const { execute, parse, buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query { nums: [Int!]! }
`);

execute({
  schema,
  document: parse("{ nums }"),
  rootValue: { nums: [1, 2, 3] },
}).then((r) => console.log(JSON.stringify(r)));
```

```graphql
query GenResponse {
  nums
}
```

#### Key Points

- **Generation** respects **aliases** and **skip/include**.
- **Null propagation** shapes the final tree.
- **Extensions** may be added at **formatting** stage.

#### Best Practices

- **Benchmark** large list serialization for mobile clients.
- Avoid **huge strings** in memory—use **streaming** where appropriate at HTTP layer.
- **Test** snapshot of **canonical** JSON for golden responses in CI.

#### Common Mistakes

- Returning **circular** structures from resolvers.
- **Mutating** parent objects during response assembly.
- **Assuming** stable **key order** for **cryptographic** signing of responses.

---

## 2.5 Developer Experience

### 2.5.1 GraphQL IDE (GraphQL Playground, Insomnia)

**Beginner:** **GraphiQL** is the embeddable IDE; **Apollo Sandbox** provides hosted exploration. **Insomnia** and **Postman** support GraphQL with **variables** panes.

**Intermediate:** Configure **environments** (dev/stage/prod URLs) and **auth** templates. **Collections** help QA reproduce issues.

**Expert:** **GraphQL Voyager** visualizes schema graphs. **Router** UIs show **subgraph** health. **Disable** public IDE in production or protect via **SSO**.

```javascript
// Many frameworks mount GraphiQL at dev
// app.get("/ide", graphiqlExpress({ endpointURL: "/graphql" }));
```

```graphql
query IdeSmoke {
  __schema {
    queryType {
      name
    }
  }
}
```

#### Key Points

- **IDE** accelerates onboarding more than reading SDL alone.
- **Environment** separation prevents accidental **prod** writes.
- **Insomnia** GraphQL mode validates **variables JSON**.

#### Best Practices

- Commit **Insomnia/Postman** collections **without secrets**.
- Use **read-only** roles for **staging** exploration accounts.
- Pair IDE with **schema** changelog in PR descriptions.

#### Common Mistakes

- **Pasting** production tokens into **shared** screens.
- Using **Playground** tutorials that reference **deprecated** packages.
- **CORS** blocking IDE from **local** file origins.

---

### 2.5.2 Auto-completion

**Beginner:** IDEs query **introspection** (when enabled) to suggest **fields** and **arguments**.

**Intermediate:** **VS Code GraphQL** extension uses **`graphql-config`** to point at **schema SDL** or **endpoint**. **Codegen** uses the same schema for types.

**Expert:** **LSP** servers can work **offline** from committed `schema.graphql`. **Custom directives** appear in completion lists—teach teams their meanings.

```json
{
  "graphql-config": {
    "schema": "./schema.graphql",
    "documents": "./src/**/*.{graphql,js,ts,tsx}"
  }
}
```

```graphql
query CompleteMe {
  user(id: "1") {
    # cursor here gets field suggestions when schema is wired
    id
  }
}
```

#### Key Points

- **Committed schema** enables **offline** DX and CI.
- **Monorepos** should share **one** schema source of truth.
- **Fragment** spreads complete when **types** match.

#### Best Practices

- Add **`graphql-config`** at repo root.
- Run **`npm run codegen`** in **pre-commit** or CI.
- Keep **descriptions** in SDL for **hover docs**.

#### Common Mistakes

- **Multiple** conflicting schema files in different packages.
- **Pointing** IDE to **production** introspection unnecessarily.
- **Ignoring** `.graphqlrc` in **new** engineer setup docs.

---

### 2.5.3 Documentation Browser

**Beginner:** GraphiQL **Docs** pane shows **types**, **fields**, and **descriptions** from SDL.

**Intermediate:** **`"""` descriptions** in SDL render as markdown in many UIs. **Deprecation** reasons appear prominently.

**Expert:** **Apollo Studio** publishes **changelog** and **field usage**. **SpectaQL** generates **static** docs sites from SDL.

```graphql
"""A person using the product."""
type User {
  """Primary handle shown in UI."""
  username: String!
}
```

```javascript
// Generate static docs in CI (conceptual)
// npx spectaql spectaql-config.yml
```

#### Key Points

- **Descriptions** are part of the **public contract**.
- **Deprecation reasons** should link to **migration guides**.
- **Examples** in descriptions help **partner** integrations.

#### Best Practices

- Require **description** on **public** root fields in review checklist.
- Use **markdown links** to internal wiki for complex flows.
- **Version** docs with **schema tags** per release.

#### Common Mistakes

- **Empty** descriptions on **complex** financial or medical fields.
- Writing **novels** in descriptions instead of linking guides.
- **Leaking** internal codenames in **public** SDL.

---

### 2.5.4 Query History

**Beginner:** GraphiQL keeps a **history** of recent queries in **local storage**.

**Intermediate:** **Apollo Sandbox** can persist **operation collections**. **Insomnia** histories sync per workspace.

**Expert:** **Audit logs** on servers store **hashes** of queries for **security** reviews. **Avoid** storing **PII** in client history for regulated apps.

```javascript
// Optional: custom dev middleware logs sanitized operation text
function logOperation(req, _res, next) {
  if (process.env.NODE_ENV === "development") {
    console.log("operationName:", req.body?.operationName);
  }
  next();
}
```

```graphql
query HistoryExample {
  ping
}
```

#### Key Points

- **History** speeds debugging but risks **secret** leakage.
- **Teams** should agree on **clear history** policies for demos.
- **Server logs** should prefer **hashes** + **names** over full text at high volume.

#### Best Practices

- **Disable** persistent history for **shared** kiosks.
- **Scrub** tokens from saved **curl** copies.
- Use **named operations** so history entries are **readable**.

#### Common Mistakes

- **Screen sharing** with **sensitive** variables visible in history.
- **Logging** full credit card fields inside **query variables** (never).

---

### 2.5.5 Schema Inspection

**Beginner:** **Introspection** queries show **types** and **fields**. Tools use this to render **docs**.

**Intermediate:** **`__type(name:)`** fetches one type. **`__schema`** lists **queryType**, **mutationType**, **directives**.

**Expert:** **Rover**, **GraphQL Inspector**, and **Hive** diff schemas across **environments**. **Breaking change** detection compares **usage**-aware policies.

```graphql
query InspectQueryRoot {
  __schema {
    queryType {
      fields {
        name
        args {
          name
          type {
            name
            kind
          }
        }
      }
    }
  }
}
```

```javascript
const { getIntrospectionQuery } = require("graphql");
console.log(getIntrospectionQuery().slice(0, 80) + "...");
```

#### Key Points

- **Inspection** is how **ecosystem tooling** stays generic.
- **SDL export** is often better for **CI** than live introspection.
- **Custom directives** should appear consistently in **subgraphs**.

#### Best Practices

- Save **`schema.graphql`** on every **deploy**.
- Run **`graphql-inspector diff`** in CI against **main**.
- **Tag** schemas with **git sha** metadata via extensions or registry.

#### Common Mistakes

- **Relying** on prod introspection when **offline** CI is needed.
- **Ignoring** **deprecated** fields still in **heavy** client use.
- **Manual** schema edits without **review** from **consumers**.

---

## 2.6 Common Patterns

### 2.6.1 Pagination Pattern

**Beginner:** Avoid returning **unbounded** lists. Common GraphQL patterns: **`limit`/`offset`**, **cursor-based** `edges { cursor node }`, **Relay**-style **connections**.

**Intermediate:** **Connection spec** uses **`pageInfo { hasNextPage endCursor }`**. **Arguments** like `first`/`after` pair with **stable ordering**.

**Expert:** **Keyset pagination** performs better than **large offsets** on SQL. **Global IDs** (base64 of `Type:id`) support **node** refetch APIs.

```graphql
query PaginateUsers($first: Int!, $after: String) {
  users(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        name
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

```javascript
// Resolver sketch: decode cursor, query with WHERE id > ?
function usersResolver(_p, { first, after }) {
  const cursorId = after ? decodeCursor(after) : null;
  const rows = db.users.findMany({ afterId: cursorId, limit: first + 1 });
  const hasNextPage = rows.length > first;
  const nodes = hasNextPage ? rows.slice(0, first) : rows;
  return {
    edges: nodes.map((n) => ({ cursor: encodeCursor(n.id), node: n })),
    pageInfo: {
      hasNextPage,
      endCursor: nodes.length ? encodeCursor(nodes[nodes.length - 1].id) : null,
    },
  };
}
```

#### Key Points

- **Always** define **order** when paginating.
- **Cursors** should be **opaque** to clients.
- **first + last** mixing needs clear **server rules**.

#### Best Practices

- Prefer **cursor** pagination for **large** lists.
- **Cap** `first` with a **max** (e.g., 100).
- **Test** empty pages and **concurrent** inserts.

#### Common Mistakes

- **Offset** pagination on **huge** tables without **indexes**.
- **Unstable** sort causing **skipped/duplicate** rows.
- **Exposing** raw SQL offsets as **cursors**.

---

### 2.6.2 Filtering Pattern

**Beginner:** Add **filter arguments** on fields: `users(filter: { role: ADMIN })`.

**Intermediate:** Use **input types** for filters: `UserFilter { role, createdAfter }`. **Nullable** fields mean “no constraint.”

**Expert:** **Indexing** strategy must match **filter combos**. **Complex filters** may need **search engines** (OpenSearch) behind a `search` field.

```graphql
input UserFilter {
  role: Role
  createdAfter: String
}

type Query {
  users(filter: UserFilter): [User!]!
}
```

```javascript
function buildUserWhere(filter) {
  if (!filter) return {};
  return {
    ...(filter.role ? { role: filter.role } : {}),
    ...(filter.createdAfter ? { createdAt: { gte: new Date(filter.createdAfter) } } : {}),
  };
}
```

#### Key Points

- **Input objects** scale better than many **positional** args.
- **Document** which combinations are **supported**.
- **Validate** impossible filters **early**.

#### Best Practices

- **Limit** filter cardinality to prevent **slow** scans.
- Add **integration tests** for common **filter** queries.
- Consider **`filter` vs `filters`** naming consistency across API.

#### Common Mistakes

- **OR** semantics **implicit** without documentation.
- **SQL injection** via **raw** string filters (use **parameterized** queries).
- **Too many** optional filters with **no indexes**.

---

### 2.6.3 Sorting Pattern

**Beginner:** Add **`orderBy`** enum argument: `users(orderBy: CREATED_AT_DESC)`.

**Intermediate:** **Multi-sort** via **list of sort inputs**: `[{ field: NAME, direction: ASC }]`.

**Expert:** **Whitelist** sortable fields to prevent **resolver** access to **private** columns. **Default order** must be **stable** (tie-breaker id).

```graphql
enum UserSortField {
  CREATED_AT
  NAME
}

enum SortDirection {
  ASC
  DESC
}

input UserSort {
  field: UserSortField!
  direction: SortDirection!
}

type Query {
  users(sort: [UserSort!]): [User!]!
}
```

```javascript
const ALLOWED = { CREATED_AT: "createdAt", NAME: "name" };

function orderClause(sort) {
  if (!sort?.length) return [["id", "asc"]];
  return sort.map(({ field, direction }) => {
    const col = ALLOWED[field];
    if (!col) throw new Error("Invalid sort field");
    return [col, direction.toLowerCase()];
  });
}
```

#### Key Points

- **Never** pass **raw** client strings into **ORDER BY**.
- **Stable sorts** prevent **pagination bugs**.
- **Enums** > free-form **strings** for sort fields.

#### Best Practices

- **Index** columns used in **default** sorts.
- Document **locale** rules for **name** sorting.
- **Unit-test** SQL builder **thoroughly**.

#### Common Mistakes

- **Dynamic ORDER BY** from **unvalidated** input.
- **Non-deterministic** ordering under **DB** upgrades.
- **Mixing** sort with **cursor** pagination incorrectly.

---

### 2.6.4 Search Pattern

**Beginner:** Expose **`searchUsers(q: String!)`** returning a **list** or **connection**.

**Intermediate:** Delegate to **Elasticsearch/OpenSearch** or **Postgres full text**. Return **highlights** as custom fields if needed.

**Expert:** **Relevance scoring** may be **opaque**; provide **`explanation` debug** fields only in **non-prod**. **Rate limit** search heavily.

```graphql
type SearchHit {
  user: User!
  score: Float!
}

type Query {
  searchUsers(q: String!, first: Int!): [SearchHit!]!
}
```

```javascript
async function searchUsers(_p, { q, first }) {
  const results = await openSearch.search({
    index: "users",
    q,
    size: first,
  });
  return results.hits.map((h) => ({
    user: { id: h._id, ...h._source },
    score: h._score,
  }));
}
```

#### Key Points

- **Search** is not **filter**—different **SLAs** and **caching**.
- **Debounce** client input; **paginate** results.
- **Sanitize** query strings for **injection** into search DSL.

#### Best Practices

- **Cap** `first` aggressively for search.
- **Log** **slow** queries separately.
- Provide **empty** state UX for **no hits**.

#### Common Mistakes

- **Blocking** HTTP thread on **heavy** search without **timeouts**.
- Returning **stale** index data without **telling** clients.
- **Leaking** private fields from **search** documents.

---

### 2.6.5 Relationship Pattern

**Beginner:** Model **relations** as **nested fields**: `user { posts { title } }`.

**Intermediate:** Decide **belongs-to** vs **has-many** directions. Use **DataLoader** for **many-to-one** backrefs.

**Expert:** **Federation** uses **`@key`** and **entity references** to **span** services. **N+1** mitigation is **mandatory** at scale.

```graphql
type User {
  id: ID!
  posts: [Post!]!
}

type Post {
  id: ID!
  author: User!
}
```

```javascript
const { default: DataLoader } = require("dataloader");

function createLoaders() {
  return {
    userById: new DataLoader(async (ids) => {
      const rows = await db.users.findByIds(ids);
      const map = new Map(rows.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) || new Error(`User ${id} missing`));
    }),
  };
}

// Post.author resolver: (_post, _a, ctx) => ctx.loaders.userById.load(_post.authorId)
```

#### Key Points

- **Graph** modeling should mirror **product language**, not only **SQL joins**.
- **Bidirectional** navigation requires **clear** ownership rules.
- **Loaders** are **per-request** scoped.

#### Best Practices

- **Document** **max** fan-out per parent (e.g., **100 comments**).
- Use **`@deprecated`** on **bad** relationship shortcuts.
- **Integration test** nested queries with **realistic** counts.

#### Common Mistakes

- **Circular** fetches **without** depth limits (`user { friends { friends { ... } } }`).
- **Sharing** DataLoader caches across **users** (privacy/correctness bugs).
- **Exposing** internal **foreign keys** as the **only** way to traverse graphs.

---

## Summary: GraphQL Basics Module

You explored **query structure**, **HTTP transport**, **single-endpoint routing**, the **execution pipeline**, **developer tooling**, and **everyday API patterns** (pagination, filtering, sorting, search, relationships). These fundamentals underpin **schema design** in SDL and the **type system** topics that follow.
