# GraphQL Resolvers

## 📑 Table of Contents

- [16.1 Resolver Fundamentals](#161-resolver-fundamentals)
  - [16.1.1 Resolver Definition](#1611-resolver-definition)
  - [16.1.2 Resolver Parameters (parent, args, context, info)](#1612-resolver-parameters-parent-args-context-info)
  - [16.1.3 Resolver Return Values](#1613-resolver-return-values)
  - [16.1.4 Async Resolvers](#1614-async-resolvers)
  - [16.1.5 Resolver Chaining](#1615-resolver-chaining)
- [16.2 Field Resolvers](#162-field-resolvers)
  - [16.2.1 Default Field Resolvers](#1621-default-field-resolvers)
  - [16.2.2 Custom Field Resolvers](#1622-custom-field-resolvers)
  - [16.2.3 Object Field Resolvers](#1623-object-field-resolvers)
  - [16.2.4 Root Query Resolvers](#1624-root-query-resolvers)
  - [16.2.5 Mutation Resolvers](#1625-mutation-resolvers)
- [16.3 Resolver Context](#163-resolver-context)
  - [16.3.1 Context Usage](#1631-context-usage)
  - [16.3.2 Database Connections](#1632-database-connections)
  - [16.3.3 Authentication Info](#1633-authentication-info)
  - [16.3.4 Request Data](#1634-request-data)
  - [16.3.5 Custom Context Values](#1635-custom-context-values)
- [16.4 Resolver Optimization](#164-resolver-optimization)
  - [16.4.1 Batching (DataLoader)](#1641-batching-dataloader)
  - [16.4.2 Caching Results](#1642-caching-results)
  - [16.4.3 Lazy Loading](#1643-lazy-loading)
  - [16.4.4 N+1 Prevention](#1644-n1-prevention)
  - [16.4.5 Performance Monitoring](#1645-performance-monitoring)
- [16.5 Resolver Patterns](#165-resolver-patterns)
  - [16.5.1 Simple Resolver](#1651-simple-resolver)
  - [16.5.2 Database Resolver](#1652-database-resolver)
  - [16.5.3 External API Resolver](#1653-external-api-resolver)
  - [16.5.4 Computed Field Resolver](#1654-computed-field-resolver)
  - [16.5.5 Aggregation Resolver](#1655-aggregation-resolver)
- [16.6 Error Handling in Resolvers](#166-error-handling-in-resolvers)
  - [16.6.1 Try-Catch Patterns](#1661-try-catch-patterns)
  - [16.6.2 Error Propagation](#1662-error-propagation)
  - [16.6.3 Custom Error Types](#1663-custom-error-types)
  - [16.6.4 Error Messages](#1664-error-messages)
  - [16.6.5 Error Logging](#1665-error-logging)
- [16.7 Advanced Resolver Techniques](#167-advanced-resolver-techniques)
  - [16.7.1 Higher-Order Resolvers](#1671-higher-order-resolvers)
  - [16.7.2 Middleware in Resolvers](#1672-middleware-in-resolvers)
  - [16.7.3 Conditional Resolvers](#1673-conditional-resolvers)
  - [16.7.4 Dynamic Resolvers](#1674-dynamic-resolvers)
  - [16.7.5 Resolver Composition](#1675-resolver-composition)

---

## 16.1 Resolver Fundamentals

### 16.1.1 Resolver Definition

#### Beginner

A **resolver** is a function that tells GraphQL how to produce a value for a field when a client asks for it. Your schema declares *what* exists; resolvers implement *how* to fetch or compute each field. Without a custom resolver, GraphQL.js uses a **default resolver** that reads a property with the same name from the parent object.

#### Intermediate

Resolvers are organized in a tree-shaped map that mirrors your schema: `Query`, `Mutation`, `Subscription`, and type names map to objects whose keys are field names. Each resolver is invoked during the **execution** phase after parsing and validation. The return value must be compatible with the field’s declared GraphQL type (scalar, object, list, or null).

#### Expert

Under the hood, `graphql-js` walks the selection set and calls resolvers in a defined order. Root fields on `Query` receive `parent` as `undefined` (or a custom root value). For abstract types (`interface` / `union`), `__resolveType` (or `isTypeOf`) participates in runtime type resolution. Resolver maps can be merged from modules using tools like `@graphql-tools/merge` or code-first frameworks.

```graphql
type Query {
  me: User
}

type User {
  id: ID!
  name: String!
}
```

```javascript
import { graphql } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = `#graphql
  type Query {
    me: User
  }
  type User {
    id: ID!
    name: String!
  }
`;

// Resolver map: field name -> function
const resolvers = {
  Query: {
    me: () => ({ id: "1", name: "Ada" }),
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const result = await graphql({
  schema,
  source: `{ me { id name } }`,
});
console.log(result.data); // { me: { id: '1', name: 'Ada' } }
```

#### Key Points

- Resolvers bridge the schema to your data layer or business logic.
- One resolver per field when you need custom behavior; otherwise defaults apply.
- The map structure matches `Type.field` in the schema.

#### Best Practices

- Keep resolvers thin: delegate heavy work to services or repositories.
- Co-locate related resolvers with their type for readability.
- Use TypeScript or JSDoc to document expected `parent` shapes for object fields.

#### Common Mistakes

- Putting unrelated business rules deep inside unrelated type resolvers.
- Returning raw database rows without aligning field names to the schema.
- Forgetting that resolver functions are per field, not per HTTP request file.

---

### 16.1.2 Resolver Parameters (parent, args, context, info)

#### Beginner

Every resolver receives **four arguments** in order: `parent` (the object returned by the parent field), `args` (arguments from the query), `context` (shared per-request object you build), and `info` (execution metadata). In JavaScript you often name them `(_, args, ctx, info)` when `parent` is unused.

#### Intermediate

- **parent**: For `User.posts`, `parent` is the `User` object from the `me` or `user` resolver.
- **args**: Already coerced to the types declared in the schema (strings, ints, custom scalars).
- **context**: Ideal place for `db`, `userId`, loaders, and request headers—created once per GraphQL operation.
- **info**: Contains `fieldName`, `path`, `variableValues`, `operation`, and the AST; used for logging, permissions, and DataLoader keys.

#### Expert

`info` exposes `GraphQLResolveInfo` including `fragments` and the field AST node. Use `graphql-fields` or `graphql-parse-resolve-info` to inspect nested selections for query-aware resolvers (for example, only `JOIN` tables the client asked for). Be careful: overusing `info` couples resolvers to query text and complicates testing.

```graphql
query UserPosts($userId: ID!, $limit: Int) {
  user(id: $userId) {
    id
    posts(limit: $limit) {
      title
    }
  }
}
```

```javascript
const resolvers = {
  Query: {
    user: (_parent, { id }, ctx) => ctx.db.users.findById(id),
  },
  User: {
    posts: (parent, { limit = 10 }, ctx, info) => {
      console.log(info.fieldNodes[0].name.value); // posts
      return ctx.db.posts.findByAuthorId(parent.id, { limit });
    },
  },
};
```

#### Key Points

- Argument order is fixed by the GraphQL execution engine.
- Context is the supported way to pass request-scoped dependencies.
- `info` is powerful but increases coupling if misused.

#### Best Practices

- Destructure `args` for clarity and to document the API.
- Type your context object in TypeScript (`interface GqlContext { db: Db; user?: User }`).
- Log `info.path` when debugging “which resolver failed?”

#### Common Mistakes

- Mutating `context` in a way that leaks state across unrelated fields unintentionally.
- Treating `parent` as always defined (root resolvers get `undefined` parent).
- Ignoring `args` validation that belongs in the schema (non-null, input types).

---

### 16.1.3 Resolver Return Values

#### Beginner

A resolver must return a value that GraphQL can **serialize** according to the field type: a string for `String`, a number for `Int`/`Float`, a boolean, an enum string, a custom scalar’s internal representation, an object for object types, or an array for lists. Returning `null` is only valid if the field is nullable.

#### Intermediate

For **lists**, return a JavaScript array (or a Promise of one). For **non-null** (`!`) fields, returning `null` or throwing causes an error that bubbles according to nullability. For **unions/interfaces**, return a value that `__resolveType` or `isTypeOf` can classify. You may return a **Promise**; GraphQL awaits promises depth-first in the execution tree.

#### Expert

AsyncIterable returns are used for subscriptions in some setups. For fields that resolve to another object type, you may return a “thin” parent (for example `{ id: '7' }`) and let child field resolvers load the rest (**resolver chaining**). Be mindful of `Promise.all` behavior inside lists: one rejection can fail the whole list unless handled.

```graphql
type Post {
  id: ID!
  title: String!
  author: User!
}
```

```javascript
const resolvers = {
  Query: {
    post: () => ({ id: "p1", title: "GraphQL", authorId: "u1" }),
  },
  Post: {
    // Return shape can differ from schema: delegate to User resolvers
    author: (parent, _args, ctx) => ctx.db.users.findById(parent.authorId),
  },
};
```

#### Key Points

- Return types must align with schema nullability and list modifiers.
- Promises are first-class; use `async`/`await` for readability.
- Partial parent objects are valid when child resolvers complete the graph.

#### Best Practices

- Return consistent object shapes from the same field across code paths.
- Use database projections that match the fields you will need in child resolvers.
- Prefer explicit `null` for “not found” only when the schema allows it.

#### Common Mistakes

- Returning `undefined` (often treated differently from `null` in tooling).
- Returning a single object where a list type was declared.
- Swallowing errors and returning `null` for non-null fields.

---

### 16.1.4 Async Resolvers

#### Beginner

Most real resolvers are **asynchronous** because they talk to databases or HTTP APIs. You can mark the function `async` and `await` promises, or return a Promise directly. GraphQL waits for the promise before continuing to child fields that depend on that value.

#### Intermediate

Parallelism happens naturally when two sibling fields both return promises: the executor can run them concurrently. Nested async work stacks up; avoid awaiting sequentially when independent queries could run in parallel inside a single resolver (for example `Promise.all` for unrelated lookups).

#### Expert

Watch **backpressure** and **connection pool** usage when many async resolvers fire at once. Combine with DataLoader batching to avoid thundering herds. For Node.js, prefer structured concurrency patterns and timeouts on external calls (`AbortSignal`). Tracing tools (OpenTelemetry) attach spans well to async resolver boundaries.

```javascript
import { setTimeout as delay } from "timers/promises";

const resolvers = {
  Query: {
    slowField: async () => {
      await delay(50);
      return "done";
    },
    dashboard: async (_p, _a, ctx) => {
      const [user, stats] = await Promise.all([
        ctx.db.users.current(ctx.auth.userId),
        ctx.db.analytics.summary(ctx.auth.userId),
      ]);
      return { user, stats };
    },
  },
};
```

#### Key Points

- `async` resolvers are the norm in Node.js GraphQL servers.
- Independent async work should use `Promise.all` where appropriate.
- Too much parallel fan-out without batching can overload dependencies.

#### Best Practices

- Set per-request timeouts on outbound HTTP from resolvers.
- Use repository methods that return promises; avoid mixing callback APIs without promisify.
- Measure p95 latency per field in staging.

#### Common Mistakes

- Sequential `await` in a loop when batching or `Promise.all` would scale better.
- Forgetting to catch and map errors to user-safe GraphQL errors.
- Holding transactions open across `await` points unnecessarily.

---

### 16.1.5 Resolver Chaining

#### Beginner

**Chaining** means the result of one resolver becomes the `parent` for its child field resolvers. You do not call child resolvers yourself; GraphQL does after your parent field returns. For example, `user` returns a user object, then `user.email` runs with that object as `parent`.

#### Intermediate

This enables **lazy loading**: a `User` resolver might return only `{ id }`, and `User.email` loads email when requested. The downside is multiple round-trips unless you batch or use dataloaders. Root `Query` fields chain into type fields, which chain into further nested selections.

#### Expert

Chaining interacts with **fragments** and **inline fragments**: the executor still walks the merged selection set. For polymorphic fields, resolving the abstract type happens before fields on concrete types. Authorization middleware sometimes wraps the chain to enforce rules at each level.

```javascript
const resolvers = {
  Query: {
    user: (_p, { id }) => ({ id }), // minimal parent
  },
  User: {
    name: async (parent, _a, ctx) => {
      const row = await ctx.db.users.findById(parent.id);
      return row.name;
    },
    posts: (parent, _a, ctx) => ctx.db.posts.byUserId(parent.id),
  },
};
```

#### Key Points

- Parent/child resolver flow mirrors the query shape.
- Minimal parents plus field resolvers trade simplicity for potential N+1.
- Chaining is the core mechanism behind GraphQL’s flexible data graph.

#### Best Practices

- Document which fields expect a “full” vs “id-only” parent.
- Combine chaining with DataLoader for referenced entities.
- Avoid redundant fetches when parent already included the data.

#### Common Mistakes

- Assuming child resolvers run if the parent returned `null` (they do not).
- Duplicating the same fetch in both parent and child resolvers.
- Returning arrays from a field that should be a single object parent.

---

## 16.2 Field Resolvers

### 16.2.1 Default Field Resolvers

#### Beginner

If you do not define a resolver for a field, GraphQL.js uses the **default field resolver**: for field name `title`, it returns `parent["title"]` (or `parent.title`). That is why a root resolver can return a plain object whose keys match schema fields without extra code.

#### Intermediate

Default resolution applies to **every** output type field unless overridden. It does not magically traverse foreign keys: if your parent has `authorId` but the schema exposes `author`, you need a custom resolver (or rename/transform in the parent). Subscriptions and plugins may still wrap default behavior.

#### Expert

You can replace the default field resolver globally via `defaultFieldResolver` in custom executors or middleware, useful for tracing, masking fields, or internationalization. Libraries like Apollo Server expose hooks around resolution; understand ordering when stacking defaults and wrappers.

```javascript
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString } from "graphql";

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    name: { type: GraphQLString },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      user: {
        type: UserType,
        resolve: () => ({ name: "Grace" }), // child uses default resolver
      },
    },
  }),
});
```

#### Key Points

- Defaults map field names to parent properties.
- They reduce boilerplate for simple DTOs.
- They do not infer relations from IDs alone.

#### Best Practices

- Shape API responses (snake_case → camelCase) once at the repository edge.
- Rely on defaults when the parent is already a complete view model.
- Override explicitly when the field is computed or renamed.

#### Common Mistakes

- Expecting defaults to call the database.
- Mismatch between GraphQL field names and parent object keys.
- Hiding missing custom resolvers behind vague “null” results.

---

### 16.2.2 Custom Field Resolvers

#### Beginner

A **custom field resolver** overrides the default for one field: you implement `User.avatarUrl` to build a CDN URL from `parent.imageKey`, or format a date scalar. It lives in the resolver map under the type name and field name.

#### Intermediate

Custom resolvers can be synchronous or async, read `args` for field arguments, and use `ctx` for configuration. They should stay **pure** relative to unrelated fields when possible—side effects belong in mutations or dedicated services with clear transactions.

#### Expert

Field-level directives (with schema transforms) can attach metadata consumed by generic resolver factories, reducing duplication. Custom scalars also use internal `parseValue`/`serialize` but object field resolvers remain the right place for composite formatting logic.

```javascript
const resolvers = {
  User: {
    displayName: (parent) => parent.name || parent.email || "Anonymous",
    avatarUrl: (parent, { size = "md" }, ctx) =>
      ctx.cdn.buildUrl(parent.imageKey, { size }),
  },
};
```

#### Key Points

- One function per field that needs non-trivial logic.
- Custom resolvers are how you expose computed or derived columns.
- They compose naturally with parent objects from upstream resolvers.

#### Best Practices

- Unit test field resolvers with minimal parent fixtures.
- Avoid N+1 by batching related loads (DataLoader).
- Keep formatting (currency, dates) consistent with client expectations.

#### Common Mistakes

- Performing writes inside query field resolvers.
- Duplicating logic that belongs in a shared domain function.
- Heavy computation on hot fields without caching.

---

### 16.2.3 Object Field Resolvers

#### Beginner

**Object field resolvers** are resolvers attached to **output object types** like `User`, `Post`, or `Comment`—not only to `Query`/`Mutation`. They run when the query selects fields on that type. Each selected field runs its resolver (or default).

#### Intermediate

Object resolvers receive the parent instance produced by the parent field. For lists, the executor maps over the array and runs object field resolvers per element. This is where N+1 appears: `posts { author { name } }` may call `author` once per post unless batched.

#### Expert

Interfaces and unions resolve concrete types first; object field resolvers then run on the concrete type’s fields. With **federation**, object resolvers may be split across subgraphs; the gateway stitches results. Consider `__resolveReference` in Apollo Federation as a specialized object resolver entry point.

```javascript
const resolvers = {
  Post: {
    excerpt: (parent, { maxLength = 140 }) =>
      parent.body.length > maxLength
        ? `${parent.body.slice(0, maxLength)}…`
        : parent.body,
  },
};
```

#### Key Points

- Object resolvers define how each property of a type is materialized.
- They are invoked per list item when fields are selected under a list.
- They are central to performance tuning.

#### Best Practices

- Prefer stable keys on parents for DataLoader batching (`id` fields).
- Co-locate object resolvers with type definitions in larger codebases.
- Use integration tests for nested selection sets.

#### Common Mistakes

- Putting root-query logic on object types by mistake.
- Returning wrong types for list fields (array vs single object).
- Ignoring list size limits at the API layer.

---

### 16.2.4 Root Query Resolvers

#### Beginner

**Root query resolvers** implement fields on the `Query` type. They are entry points for read operations: `users`, `post`, `search`. Their `parent` is usually `undefined` (unless you pass a custom `rootValue` to `graphql()`).

#### Intermediate

List pagination arguments (`first`, `after`, `filter`) are typically handled here. This is a good layer to enforce **authorization** (“can this viewer run `adminUsers`?”) before hitting the database. Return values become parents for nested selections.

#### Expert

For **schema stitching** or **federation**, root queries may be delegated to remote schemas. Batching remote root fields is harder than local SQL; tools like GraphQL Mesh use batching strategies or caching. Rate limiting and complexity analysis often attach at root field granularity.

```javascript
const resolvers = {
  Query: {
    posts: (_p, { status = "PUBLISHED" }, ctx) =>
      ctx.db.posts.list({ status, viewerId: ctx.user?.id }),
    post: (_p, { id }, ctx) => ctx.db.posts.findById(id),
  },
};
```

#### Key Points

- Root queries start every read operation tree.
- They are natural authorization gates.
- Pagination and filtering arguments belong here.

#### Best Practices

- Use cursor-based pagination for large lists.
- Validate role/scope before expensive queries.
- Return `null` or empty connections consistently for “not found” policies.

#### Common Mistakes

- Exposing unbounded list fields without limits.
- Encoding business rules only in nested resolvers where root checks are skipped.
- Using mutations for idempotent reads.

---

### 16.2.5 Mutation Resolvers

#### Beginner

**Mutation resolvers** implement fields on the `Mutation` type. They perform creates, updates, deletes, and other state changes. GraphQL does not enforce side effects; conventionally you perform writes in mutation resolvers only.

#### Intermediate

Return **payload objects** that include the changed entity and `userErrors` or a union for domain failures—patterns vary by API style. Run validation on `input` types before persisting. Use database transactions for multi-table updates.

#### Expert

Consider **outbox patterns** or event publishing after commit. For file uploads, mutations often accept multipart context alongside GraphQL. Idempotency keys stored in context help deduplicate retries from mobile clients.

```javascript
const resolvers = {
  Mutation: {
    createPost: async (_p, { input }, ctx) => {
      if (!ctx.user) throw new Error("UNAUTHENTICATED");
      const post = await ctx.db.posts.create({
        ...input,
        authorId: ctx.user.id,
      });
      return { post };
    },
  },
};
```

#### Key Points

- Mutations should own transactional boundaries when possible.
- Return data the client needs to update caches.
- Authentication checks belong early in the resolver.

#### Best Practices

- Use input object types for arity and clarity.
- Log mutation name with correlation IDs, not full payloads with secrets.
- Document error shapes for clients.

#### Common Mistakes

- Performing writes inside query resolvers.
- Forgetting to validate permissions on nested resources affected by the mutation.
- Returning sensitive internal fields without schema review.

---

## 16.3 Resolver Context

### 16.3.1 Context Usage

#### Beginner

**Context** is an object you create per GraphQL operation and pass into `graphql()` or your HTTP handler. Resolvers use it to access shared things: the database, the current user, loaders, and feature flags. It avoids global singletons for request-specific data.

#### Intermediate

In Express with `graphql-http`, build context from `req`/`res` in the `context` callback. The same context object is passed to every resolver in that request. It is **not** shared across HTTP requests unless you mistakenly reuse one object (do not).

#### Expert

Context factories can be async (for example, refresh session from Redis). Some frameworks use **weak maps** or ALS (AsyncLocalStorage) to augment context implicitly—use sparingly for debuggability. For subscriptions, context is built per connection or per message depending on the transport.

```javascript
import { createHandler } from "graphql-http/lib/use/express";

const handler = createHandler({
  schema,
  context: async (req) => ({
    db: appDb,
    user: await authenticate(req.headers.get("authorization")),
    loaders: createLoaders(appDb),
  }),
});
```

#### Key Points

- Context is the blessed dependency-injection mechanism in GraphQL.js.
- One logical context per operation execution.
- Put cross-cutting services here, not in global variables.

#### Best Practices

- Freeze or document which context keys are read-only.
- Create DataLoaders fresh per request to preserve batching invariants.
- Type context in TypeScript for autocompletion.

#### Common Mistakes

- Reusing a single DataLoader instance across requests (cache poisoning).
- Storing large mutable state on context without discipline.
- Building context synchronously when you need async auth.

---

### 16.3.2 Database Connections

#### Beginner

Pass a **database handle** (pool, Prisma client, Knex instance) on context so resolvers call `ctx.db`. Use connection **pools** in Node.js to avoid opening a new TCP connection per query.

#### Intermediate

For **transactions**, start the transaction in a mutation resolver (or service) and pass a transactional client on context for nested calls—some teams use `ctx.db.tx` for the duration of the mutation only. Avoid long-held transactions across unrelated fields.

#### Expert

With **Prisma**, attach `prisma` to context; consider middleware for metrics. For raw `pg`, use `pool.query` with parameterized statements. Read replicas can be selected via context based on operation type (`query` vs `mutation`) at the HTTP layer.

```javascript
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const context = () => ({ db: pool });

const resolvers = {
  Query: {
    users: async (_p, _a, ctx) => {
      const r = await ctx.db.query("SELECT id, name FROM users LIMIT 50");
      return r.rows;
    },
  },
};
```

#### Key Points

- Pooling is critical for throughput under concurrent resolvers.
- Transactions should match business operations, not arbitrary fields.
- Parameterized queries prevent SQL injection.

#### Best Practices

- Close pools on server shutdown.
- Set pool `max` based on load tests.
- Use repository modules instead of raw SQL scattered in resolvers.

#### Common Mistakes

- Creating a new pool per request.
- Sharing one transaction object across concurrent operations incorrectly.
- String-concatenating SQL with user input.

---

### 16.3.3 Authentication Info

#### Beginner

Put the **current user** or session on context after parsing a JWT or session cookie in middleware. Resolvers check `ctx.user` to allow or deny access. Authentication answers “who is this?” not “what may they do?” (authorization).

#### Intermediate

Decode JWTs in one place; verify signatures and `exp` there. Attach roles/scopes as a small object. For OAuth, store opaque session IDs server-side and resolve user records per request. Avoid trusting client-sent `userId` arguments without verification.

#### Expert

Use **short-lived access tokens** and refresh flows; consider rotating refresh tokens. For fine-grained authorization, combine auth info with policy engines (OPA, CASL) keyed by `ctx.user` and field `info.path`. Propagate trace and user ids to downstream RPCs.

```javascript
async function contextFromRequest(req) {
  const token = parseBearer(req.headers.authorization);
  const payload = token ? await verifyJwt(token) : null;
  return {
    user: payload ? { id: payload.sub, roles: payload.roles ?? [] } : null,
  };
}

const resolvers = {
  Query: {
    me: (_p, _a, ctx) => {
      if (!ctx.user) return null;
      return ctx.db.users.findById(ctx.user.id);
    },
  },
};
```

#### Key Points

- Auth belongs in context construction, not duplicated in every resolver.
- Distinguish anonymous, authenticated, and forbidden states clearly.
- Never expose raw tokens in GraphQL responses.

#### Best Practices

- Centralize “requireUser” helpers used by resolvers.
- Log auth failures with minimal PII.
- Test unauthenticated and wrong-role paths.

#### Common Mistakes

- Checking API keys only at the HTTP edge but not for internal callers.
- Storing permissions only in the client.
- Throwing generic errors that leak whether an email exists.

---

### 16.3.4 Request Data

#### Beginner

**Request data** includes headers, IP address, user-agent, and locale—useful for auditing, geolocation, or content negotiation. Attach a sanitized snapshot to context (for example `ctx.requestId`, `ctx.ip`).

#### Intermediate

Do not put entire `req` objects on context unless you trust all resolver authors not to misuse them. Prefer explicit fields. For **dataloaders**, you may need the request id for logging correlated batches.

#### Expert

With **AsyncLocalStorage**, you can access request context deep in repositories without threading parameters—trade-offs include test complexity. For GraphQL over CDN, some headers are stripped; design fallbacks.

```javascript
const context = (req) => ({
  requestId: req.headers["x-request-id"] ?? crypto.randomUUID(),
  ip: req.ip,
  locale: req.headers["accept-language"]?.split(",")[0] ?? "en",
});
```

#### Key Points

- Explicit context fields beat dumping raw HTTP objects.
- Request IDs improve log correlation across services.
- Respect privacy regulations when logging IPs or headers.

#### Best Practices

- Forward `x-request-id` to downstream services.
- Redact sensitive headers in logs.
- Document which request fields resolvers may use.

#### Common Mistakes

- Logging full `Authorization` headers.
- Relying on IP for strong security without understanding NAT/proxies.
- Mutating `req` from resolvers.

---

### 16.3.5 Custom Context Values

#### Beginner

Beyond db and user, add **feature flags**, **experiment assignments**, **tenant id**, or **impersonation** metadata to context. Any cross-resolver dependency that varies per request is a candidate.

#### Intermediate

Version your context shape when multiple teams contribute resolvers. Consider `ctx.services.billing` facades rather than raw clients everywhere. For multi-tenant apps, `ctx.tenantId` should drive repository scoping.

#### Expert

**GraphQL modules** sometimes merge partial contexts; define precedence rules. For testing, inject mock context factories. Avoid cyclic imports between context builders and resolvers by depending on interfaces.

```javascript
const buildContext = ({ req, flags }) => ({
  db: pool,
  user: req.user,
  flags: {
    newEditor: flags.bool("new-editor", req.user?.id),
  },
  tenantId: req.headers["x-tenant-id"],
});
```

#### Key Points

- Context is your per-request service locator—use with discipline.
- Tenant and flags often belong in context for consistent enforcement.
- Keep context serializable-safe (no huge buffers by accident).

#### Best Practices

- Document all context keys in one module.
- Unit test resolvers with minimal custom context objects.
- Feature-flag dangerous code paths centrally.

#### Common Mistakes

- Putting request-unscoped caches on context.
- Different context shapes between HTTP and subscription transports.
- Hidden global state alongside context (double source of truth).

---

## 16.4 Resolver Optimization

### 16.4.1 Batching (DataLoader)

#### Beginner

**DataLoader** batches multiple loads that happen in the same tick of the event loop into one query (for example `WHERE id IN (...)`). You create one DataLoader **instance per request** and pass keys to `.load(id)` from field resolvers.

#### Intermediate

Implement `batchFn` to fetch many keys at once and return results in the **same order** as keys, using maps to align rows. Use `cacheKeyFn` for non-string keys. Call `loader.clear(id)` after mutations that invalidate cache within the request.

#### Expert

Nested DataLoaders (per type) prevent cross-type cache collisions. For **prime** caches, use `loader.prime(id, value)` when parent resolvers already fetched data. Watch for **ordering bugs** when duplicates or missing keys break alignment—use tests.

```javascript
import DataLoader from "dataloader";

function createUserLoader(db) {
  return new DataLoader(async (ids) => {
    const rows = await db.users.findByIds([...ids]);
    const byId = new Map(rows.map((r) => [r.id, r]));
    return ids.map((id) => byId.get(id) ?? new Error(`User ${id} not found`));
  });
}

const context = () => ({ loaders: { user: createUserLoader(db) } });

const resolvers = {
  Post: {
    author: (parent, _a, ctx) => ctx.loaders.user.load(parent.authorId),
  },
};
```

#### Key Points

- DataLoader solves per-request batching and deduplication.
- Batch functions must return parallel arrays aligned to keys.
- Never share one loader across concurrent requests.

#### Best Practices

- Add DataLoader metrics (batch size, batch count).
- Use SQL `IN` or `ANY` with sane limits; chunk huge batches.
- Document that loaders are request-scoped.

#### Common Mistakes

- Returning rows in database order without mapping to key order.
- Using one global DataLoader (stale cross-user cache).
- Throwing inside batch function instead of per-key errors when appropriate.

---

### 16.4.2 Caching Results

#### Beginner

**Caching** stores resolver or database results to avoid repeat work. Use HTTP caching for GET+persisted queries sparingly; most GraphQL is POST. In-process LRU caches or Redis are common for hot fields.

#### Intermediate

Cache keys should include **tenant**, **user role bucket**, and **arguments**. Prefer short TTLs for frequently changing data. For private data, avoid shared CDN caches—use private Redis namespaces or no cache.

#### Expert

**Partial caching** interacts badly with arbitrary queries; consider normalized caches on the client (Apollo) and server-side entity caches keyed by type/id. Stampede protection (single-flight) matters for popular keys. Invalidate on mutation via events or version counters.

```javascript
import { createHash } from "crypto";

function cacheKey(prefix, args) {
  return `${prefix}:${createHash("sha256")
    .update(JSON.stringify(args))
    .digest("hex")}`;
}

const resolvers = {
  Query: {
    trendingPosts: async (_p, args, ctx) => {
      const key = cacheKey("trending", args);
      const hit = await ctx.redis.get(key);
      if (hit) return JSON.parse(hit);
      const posts = await ctx.db.posts.trending(args);
      await ctx.redis.set(key, JSON.stringify(posts), "EX", 30);
      return posts;
    },
  },
};
```

#### Key Points

- Server resolver caching must account for auth and tenant isolation.
- TTL and explicit invalidation are both valid strategies.
- Stale data is a product decision, not only a technical one.

#### Best Practices

- Add cache hit/miss metrics.
- Document which fields are cacheable.
- Use consistent serialization for cache keys.

#### Common Mistakes

- Caching user-specific data under a shared key.
- Ignoring mutation invalidation.
- Unbounded in-memory caches in long-lived Node processes.

---

### 16.4.3 Lazy Loading

#### Beginner

**Lazy loading** means fetching related data only when the client selects that field. It keeps root queries fast when clients do not need heavy joins. Field resolvers naturally implement lazy loading.

#### Intermediate

Balance lazy loading with **overfetching** at the DB layer: sometimes a root resolver should `JOIN` when certain child fields are requested—use `info` or lookahead libraries to optimize. Without hints, lazy loading can cause N+1.

#### Expert

**Deferred fragments** (when available in your stack) shift some lazy loading to the protocol. For REST-backed subgraphs, lazy loading may mean extra HTTP calls—batching at the gateway becomes important.

```javascript
const resolvers = {
  Order: {
    lineItems: (parent, _a, ctx) => ctx.db.orderItems.byOrderId(parent.id),
  },
};
```

#### Key Points

- Lazy loading improves average latency for sparse queries.
- It risks N+1 without batching.
- Lookahead can convert lazy to eager when beneficial.

#### Best Practices

- Combine lazy field resolvers with DataLoader.
- Monitor per-field resolver counts in production traces.
- Set max limits on list fields.

#### Common Mistakes

- Always lazy loading even when every client always asks for the same join.
- No limits on nested lists loaded lazily.
- Hidden latency in deep object graphs.

---

### 16.4.4 N+1 Prevention

#### Beginner

The **N+1 problem** happens when resolving a list runs one query per item (N queries) plus one original query. It blows up latency and database load. DataLoader and strategic joins are the main cures.

#### Intermediate

Identify N+1 with SQL logs or tracing: repeated similar queries during one GraphQL request. Sometimes a **JOIN** in the parent resolver plus default field resolvers is simplest. For heterogeneous fetches, batch loaders win.

#### Expert

ORMs like Prisma offer relation loaders; understand whether they batch per request. For **dataloader** + **SQL**, use `WHERE fk IN (...)` and map back. For **caching**, ensure batch keys do not explode cardinality.

```javascript
// Anti-pattern (N+1):
const bad = {
  Post: {
    author: (p, _a, ctx) => ctx.db.users.findById(p.authorId), // per post query
  },
};

// With DataLoader: many author.load calls -> one batched query
```

#### Key Points

- N+1 is the default risk of naive field resolvers over lists.
- Fixing it requires batching, joins, or prefetch strategies.
- Measure before optimizing cold paths.

#### Best Practices

- Add integration tests that count queries for representative operations.
- Use tracing spans per resolver to spot hotspots.
- Document batching assumptions for new resolvers.

#### Common Mistakes

- Assuming ORMs always batch automatically.
- Batching without deduplicating duplicate IDs in a list.
- Joining too aggressively and returning huge rows for sparse queries.

---

### 16.4.5 Performance Monitoring

#### Beginner

**Monitor** how long resolvers take and how often they run. Use logs, metrics, or APM (Datadog, New Relic) to see p95 latency per field. This tells you where batching or indexes help.

#### Intermediate

OpenTelemetry spans around each resolver give waterfall views. Export metrics like `graphql_resolver_duration_seconds` labeled by `field` and `type`. Combine with database slow-query logs.

#### Expert

**Field usage analytics** (Apollo Studio, in-house) reveal dead schema areas. **Query complexity** scoring prevents abusive documents. Sample traces in high traffic to control cost. Correlate resolver latency with pool saturation.

```javascript
function wrapResolversWithTiming(resolvers, logger) {
  const out = {};
  for (const [typeName, fields] of Object.entries(resolvers)) {
    out[typeName] = {};
    for (const [fieldName, fn] of Object.entries(fields)) {
      if (typeof fn !== "function") {
        out[typeName][fieldName] = fn;
        continue;
      }
      out[typeName][fieldName] = async (...args) => {
        const start = performance.now();
        try {
          return await fn(...args);
        } finally {
          logger.info("resolver", {
            type: typeName,
            field: fieldName,
            ms: performance.now() - start,
          });
        }
      };
    }
  }
  return out;
}
```

#### Key Points

- You cannot optimize what you do not measure.
- Per-field metrics expose N+1 and hot paths.
- Tracing links GraphQL to SQL and HTTP children.

#### Best Practices

- Use consistent span names (`GraphQL/resolve/User.email`).
- Alert on error rate and latency SLOs.
- Exclude health checks from GraphQL metrics noise.

#### Common Mistakes

- Logging full GraphQL documents on every request at info level in production.
- Aggregating only HTTP status 200 while resolver errors hide inside 200 responses.
- Missing cardinality limits on metric labels (explosion of series).

---

## 16.5 Resolver Patterns

### 16.5.1 Simple Resolver

#### Beginner

A **simple resolver** returns a literal, maps an argument to a lookup, or forwards to a synchronous function. No async, no side effects—ideal for demos and static configuration.

#### Intermediate

Even simple resolvers benefit from shared helpers (`requireAuth`) and typed args. Keep them in the map for consistency rather than inlining magic in schema directives only.

#### Expert

Simple resolvers are often composed later via higher-order functions or generated code from SDL. They still appear in traces; avoid doing synchronous CPU-heavy work without offloading.

```javascript
const resolvers = {
  Query: {
    version: () => "1.0.0",
    ping: () => "pong",
  },
};
```

#### Key Points

- Simple resolvers are the baseline building block.
- They should remain easy to test and read.
- Complexity usually moves to services, not here.

#### Best Practices

- Use for constants and trivial forwarding.
- Still validate auth for non-public data.

#### Common Mistakes

- Growing “simple” resolvers into god functions over time.
- Skipping tests because they look trivial.

---

### 16.5.2 Database Resolver

#### Beginner

A **database resolver** calls `ctx.db` to read or write rows. It maps GraphQL arguments to queries and returns rows or DTOs. Use parameterized queries or ORM methods.

#### Intermediate

Push query construction into **repository** modules (`userRepo.byId`). Resolvers orchestrate: auth check → repo call → return shape. Transactions wrap multi-step mutations.

#### Expert

For **read models**, you might query dedicated views or search engines (Elasticsearch) from resolvers. Consider **CQRS**: thin read resolvers vs command handlers for mutations. Index strategy follows access patterns from your most frequent operations.

```javascript
const resolvers = {
  Query: {
    user: (_p, { id }, ctx) => ctx.repos.users.findById(id),
  },
  Mutation: {
    renameUser: (_p, { id, name }, ctx) =>
      ctx.repos.users.updateName(id, name),
  },
};
```

#### Key Points

- Keep SQL/ORM details out of raw resolver bodies when possible.
- Repositories simplify testing and reuse.
- Transactions belong around use cases.

#### Best Practices

- Use consistent error mapping from DB to GraphQL errors.
- Limit list queries with default and max page sizes.
- Use explain/analyze in staging for new queries.

#### Common Mistakes

- Raw SQL string building with user input.
- Leaking DB errors verbatim to clients.
- Missing indexes for new access patterns.

---

### 16.5.3 External API Resolver

#### Beginner

An **external API resolver** calls another HTTP or gRPC service to fetch data. Use `fetch` or clients like `axios` with timeouts. Map third-party JSON to your schema types.

#### Intermediate

**Circuit breakers** and retries belong around outbound calls—avoid unbounded retries in resolvers. Cache stable third-party reads when terms allow. Propagate correlation ids in headers.

#### Expert

For **schema stitching**, remote fields may resolve via delegated queries. Normalize errors: map vendor codes to extensions. Consider **bulk endpoints** on the remote side to match your batching.

```javascript
const resolvers = {
  Query: {
    weather: async (_p, { city }, ctx) => {
      const res = await fetch(`${ctx.env.WEATHER_URL}?q=${encodeURIComponent(city)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error("WEATHER_UNAVAILABLE");
      return res.json();
    },
  },
};
```

#### Key Points

- External calls dominate latency—set timeouts and budgets.
- Map external failures to stable GraphQL error extensions.
- Respect rate limits and API keys via context secrets.

#### Best Practices

- Use structured clients with types generated from OpenAPI.
- Log vendor error codes, not secrets.
- Feature-flag new integrations.

#### Common Mistakes

- No timeout (hanging resolvers).
- Calling external APIs from hot fields without caching or batching.
- Leaking API keys in errors or logs.

---

### 16.5.4 Computed Field Resolver

#### Beginner

**Computed fields** derive values not stored as columns: `fullName`, `isOwner`, `priceWithTax`. Implement as field resolvers reading sibling data from `parent`.

#### Intermediate

Keep computations **deterministic** given the parent object. If computation needs extra data, fetch in the resolver with batching. For heavy math, consider materialized views updated asynchronously.

#### Expert

**Authorization-sensitive** computed fields (for example `canEdit`) should use `ctx.user` and central policy functions. Beware leaking information through computed booleans on hidden objects—enforce auth at the parent level too.

```javascript
const resolvers = {
  Cart: {
    subtotal: (parent) =>
      parent.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    tax: (parent, _a, ctx) => ctx.tax.compute(parent.items, parent.zip),
  },
};
```

#### Key Points

- Computed fields keep storage normalized while API stays ergonomic.
- They run whenever selected—keep them efficient.
- Auth rules may apply to derived data too.

#### Best Practices

- Share formulas with client if both must match (or document server source of truth).
- Unit test edge cases (empty lists, rounding).
- Use decimals library for money, not IEEE floats alone.

#### Common Mistakes

- Inconsistent rounding between invoice and cart fields.
- Computing sensitive aggregates without checking viewer permissions.
- Re-fetching the whole entity inside a computed resolver unnecessarily.

---

### 16.5.5 Aggregation Resolver

#### Beginner

An **aggregation resolver** returns summaries: counts, sums, averages (`postCount`, `revenueThisMonth`). Often backed by SQL `COUNT`, `SUM`, or analytics stores.

#### Intermediate

Precompute heavy aggregations with **scheduled jobs** and read from summary tables for OLTP APIs. For on-the-fly aggregates, ensure indexes match `WHERE` and `GROUP BY` patterns.

#### Expert

**Approximate** aggregates (HyperLogLog, sampling) may suffice for feeds at scale. For multi-tenant data, partition keys in aggregations prevent cross-tenant leaks. Consider **cursor-based** pagination on aggregated lists when exposing drill-down.

```javascript
const resolvers = {
  User: {
    stats: async (parent, _a, ctx) => {
      const [postCount, followerCount] = await Promise.all([
        ctx.db.posts.countByAuthor(parent.id),
        ctx.db.follows.countFollowers(parent.id),
      ]);
      return { postCount, followerCount };
    },
  },
};
```

#### Key Points

- Aggregations can be expensive—index and cache consciously.
- They are common targets for read replicas.
- Expose only aggregates your product truly needs.

#### Best Practices

- Use database-native aggregation, not loading all rows into Node.
- Add timeouts and query cost limits.
- Recompute or invalidate summaries on relevant mutations.

#### Common Mistakes

- Loading entire collections into memory to count.
- Missing composite indexes for filtered counts.
- Returning precise counts when rate-limited sampling would do.

---

## 16.6 Error Handling in Resolvers

### 16.6.1 Try-Catch Patterns

#### Beginner

Wrap **async** resolver bodies in `try/catch` to map thrown exceptions to `GraphQLError` with extensions. Uncaught errors become GraphQL errors with possibly generic messages to clients.

#### Intermediate

Re-throw **operational** errors you recognize; convert unknown errors to safe messages in production. In `catch`, log stack traces server-side with request id.

#### Expert

Use **error classes** (`AppError`, `AuthError`) and central `formatError` to normalize. Avoid catching `AbortError` as a generic failure if you use cancellation. For Node 16+, `cause` chaining preserves root errors.

```javascript
import { GraphQLError } from "graphql";

const resolvers = {
  Mutation: {
    transfer: async (_p, args, ctx) => {
      try {
        return await ctx.payments.transfer(args);
      } catch (e) {
        if (e.code === "INSUFFICIENT_FUNDS") {
          throw new GraphQLError("Insufficient funds", {
            extensions: { code: "INSUFFICIENT_FUNDS" },
          });
        }
        ctx.logger.error(e);
        throw new GraphQLError("Transfer failed");
      }
    },
  },
};
```

#### Key Points

- Try/catch is the basic control flow for async resolver failures.
- Map domain failures to structured GraphQL errors.
- Log unexpected errors; do not expose internals.

#### Best Practices

- Narrow catch handling—avoid empty catches.
- Use typed errors from your domain layer.
- Keep messages user-safe; put details in extensions behind flags.

#### Common Mistakes

- Swallowing errors and returning `null` for non-null fields.
- Duplicating try/catch in every resolver instead of helpers/wrappers.
- Throwing strings instead of Error/GraphQLError.

---

### 16.6.2 Error Propagation

#### Beginner

When a resolver throws, GraphQL adds an entry to the `errors` array and may set parts of `data` to `null` according to nullability. **Bubbling** follows the nearest nullable field.

#### Intermediate

Non-null violations convert parent nulls upward until a nullable boundary. Multiple field errors can appear in one response. Subscription resolvers propagate errors on the stream channel depending on implementation.

#### Expert

**Partial data** is a feature: some branches succeed while others fail. Clients should handle `errors` + `data` together. For **federation**, subgraph errors merge with rules defined by the gateway.

```graphql
type Query {
  ok: String
  bad: String!
}
```

```javascript
// If `bad` throws, and both are selected, `ok` may still resolve while `bad` errors.
```

#### Key Points

- Nullability shapes how errors affect the response tree.
- Multiple errors are normal in GraphQL.
- Understand partial success semantics for your UI.

#### Best Practices

- Design nullable boundaries where isolation is needed.
- Return `UserError` unions for expected domain failures when clients need typed handling.
- Document error codes for clients.

#### Common Mistakes

- Making everything non-null and losing partial results.
- Clients ignoring `errors` when `data` is non-null.
- Assuming HTTP status reflects GraphQL field errors (often 200).

---

### 16.6.3 Custom Error Types

#### Beginner

Define **custom error classes** extending `Error` with `code` and `httpStatus` properties. Throw them from services; map them to `GraphQLError` in a central place.

#### Intermediate

Include **extensions** like `{ code, field, constraint }` for client logic. Keep a registry of stable codes (`USER_NOT_FOUND`). Avoid reusing codes for different meanings over time.

#### Expert

Integrate with **i18n**: store message keys in extensions, let clients translate. For security, separate `debugMessage` logged server-side from `message` sent to clients.

```javascript
class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
    this.code = "NOT_FOUND";
    this.resource = resource;
    this.id = id;
  }
}

function toGraphQLError(err) {
  if (err instanceof NotFoundError) {
    return new GraphQLError(err.message, {
      extensions: { code: err.code, resource: err.resource },
    });
  }
  return new GraphQLError("Internal error");
}
```

#### Key Points

- Custom types encode domain meaning beyond strings.
- Central mapping keeps resolvers clean.
- Extensions power client branching logic.

#### Best Practices

- Subclass from a base `AppError` with common fields.
- Document codes in API reference.
- Snapshot-test error shapes.

#### Common Mistakes

- Too many one-off string errors without codes.
- Leaking stack traces via extensions.
- Inconsistent naming (`NOT_FOUND` vs `NotFound`).

---

### 16.6.4 Error Messages

#### Beginner

The `message` field in GraphQL errors is a string for humans (and sometimes clients). Make it **clear but safe**: avoid SQL fragments, file paths, or secrets.

#### Intermediate

Use **consistent phrasing** for the same failure mode. Pair messages with **extensions.code** for programmatic handling. Validation messages may include field paths via `extensions`.

#### Expert

**Mask** internal details in production via `formatError`. For debugging, allow verbose messages only with admin scope or dev mode. Consider RFC7807-style problem details in extensions for REST bridges.

```javascript
throw new GraphQLError("Invalid email format", {
  extensions: { code: "BAD_USER_INPUT", field: "email" },
});
```

#### Key Points

- Messages are part of your API contract—treat them seriously.
- Codes beat substring matching on messages.
- Localization often belongs on the client using codes.

#### Best Practices

- Never include raw `err.message` from third-party libs to clients blindly.
- Keep messages short; put details in logs.
- Align with product copy guidelines.

#### Common Mistakes

- Different messages for the same error across resolvers.
- Exposing database constraint names verbatim.
- Using messages as the only client branching mechanism.

---

### 16.6.5 Error Logging

#### Beginner

**Log** unexpected resolver errors with level `error`, include `requestId`, user id (if any), operation name, and stack. Do not log passwords or tokens.

#### Intermediate

Structured JSON logs integrate with ELK, CloudWatch, or Datadog. Correlate with **OpenTelemetry** trace ids. Sample verbose logs in high QPS environments.

#### Expert

**PII scrubbing** middleware on loggers prevents accidental leakage from variables. Use **error reporting** (Sentry) with beforeSend hooks to redact. Aggregate by `extensions.code` to spot trends.

```javascript
const formatError = (err, ctx) => {
  ctx.logger.error({
    msg: "graphql_error",
    requestId: ctx.requestId,
    path: err.path,
    code: err.extensions?.code,
    err,
  });
  return err;
};
```

#### Key Points

- Logs are for operators; responses are for clients.
- Structure enables search and metrics.
- Redaction is non-negotiable for auth and payment flows.

#### Best Practices

- Log `operationName` and sanitized variables.
- Use one logging pattern across resolvers (middleware).
- Alert on error rate spikes per operation.

#### Common Mistakes

- Logging full `variables` including passwords.
- No correlation between HTTP logs and GraphQL errors.
- Overlogging expected validation failures as errors.

---

## 16.7 Advanced Resolver Techniques

### 16.7.1 Higher-Order Resolvers

#### Beginner

A **higher-order resolver** is a function that returns a resolver function. Use it to inject cross-cutting behavior: authentication, timing, or retry—without duplicating code in every field.

#### Intermediate

`const auth = (resolver) => (parent, args, ctx, info) => { if (!ctx.user) throw …; return resolver(parent, args, ctx, info); }` patterns compose. Combine multiple HOFs in a clear order (auth before logging).

#### Expert

Libraries like **graphql-shield** generate rule trees that compile to wrapped resolvers. TypeScript types for HOFs need generics to preserve resolver signatures. Mind performance: wrappers add stack depth but should avoid async overhead when no-op.

```javascript
function authenticated(resolve) {
  return function secured(parent, args, ctx, info) {
    if (!ctx.user) {
      throw new Error("UNAUTHENTICATED");
    }
    return resolve(parent, args, ctx, info);
  };
}

const resolvers = {
  Query: {
    me: authenticated((_p, _a, ctx) => ctx.db.users.findById(ctx.user.id)),
  },
};
```

#### Key Points

- HOFs factor out repeated resolver prelude/postlude.
- Order of composition matters.
- They pair well with permission checks.

#### Best Practices

- Keep HOFs small and test them in isolation.
- Preserve `this` semantics—use regular functions if needed.
- Document composition order conventions for the team.

#### Common Mistakes

- Composing so many layers that stacks become hard to debug.
- Losing `info` when wrapping incorrectly.
- Auth HOF only on some fields while others stay exposed.

---

### 16.7.2 Middleware in Resolvers

#### Beginner

**Middleware** runs around resolver execution: before (setup), after (teardown), or on error. GraphQL servers like Apollo expose plugin hooks (`willResolveField`) that behave like middleware.

#### Intermediate

Implement field middleware as chains: `compose([m1, m2], resolver)`. Use middleware for metrics, authz, and argument sanitization. Avoid long middleware chains on every field if perf-sensitive.

#### Expert

**Envelop** (GraphQL gateway toolkit) composes plugins around parse/validate/execute phases. Understand the difference between **request middleware** (HTTP) and **field middleware** (GraphQL execution). Some security validations belong before execution (query depth), not per field.

```javascript
function compose(middlewares, resolver) {
  return middlewares.reduceRight(
    (next, mw) => mw(next),
    resolver
  );
}

const logMw = (next) => async (p, a, c, i) => {
  console.log("enter", i.fieldName);
  return next(p, a, c, i);
};
```

#### Key Points

- Middleware centralizes cross-cutting concerns.
- Server plugins vs manual compose are both valid.
- Do not duplicate work already done at HTTP layer unless needed.

#### Best Practices

- Measure overhead of middleware in benchmarks.
- Use plugins for vendor integrations (tracing, caching).
- Keep middleware pure of business rules when possible.

#### Common Mistakes

- Doing authorization only in middleware without schema-level clarity.
- Throwing non-GraphQLError without formatting.
- Ordering middleware contrary to expectations (auth after cache).

---

### 16.7.3 Conditional Resolvers

#### Beginner

**Conditional resolvers** choose logic based on `ctx.user`, feature flags, or arguments. Example: return public profile fields for anonymous viewers and extra fields for self.

#### Intermediate

Keep conditions **explicit** and tested. For multi-tenant rules, branch on `ctx.tenantId` and policies. Avoid deep nesting—extract decision functions (`visibilityFor(user, parent)`).

#### Expert

**GraphQL Shield** rules express boolean logic on fields. For **field-level authorization**, conditions may consult external policy services—watch latency. Consider schema splitting (public vs admin schema) when conditions explode.

```javascript
const resolvers = {
  User: {
    email: (parent, _a, ctx) => {
      if (!ctx.user) return null;
      if (ctx.user.id === parent.id || ctx.user.roles.includes("admin")) {
        return parent.email;
      }
      return null;
    },
  },
};
```

#### Key Points

- Conditional resolvers encode access rules close to data.
- They must stay consistent with mutations and other entry points.
- Too much branching hints at schema or service redesign.

#### Best Practices

- Centralize permission helpers.
- Test each role matrix path.
- Return `null` vs forbidden errors per product policy.

#### Common Mistakes

- Different rules for the same field in different resolvers.
- Leaking existence via error vs null differences.
- Heavy policy RPCs per field without caching.

---

### 16.7.4 Dynamic Resolvers

#### Beginner

**Dynamic resolvers** are chosen at runtime based on configuration, tenant, or schema version. Example: plugin registers extra `Query` fields by merging resolver maps at startup.

#### Intermediate

Use `makeExecutableSchema` with merged resolvers from modules. For **runtime** dynamism, map field names to functions stored in a registry—useful for CMS-like schemas with guardrails.

#### Expert

Fully dynamic schemas risk **security** and **performance** issues; validate dynamic SDL. Some frameworks generate resolvers from database metadata—cache aggressively and audit changes. Hot-reloading resolver maps in dev speeds iteration but needs isolation in prod.

```javascript
function buildResolvers(featureFlags) {
  return {
    Query: {
      ...(featureFlags.newSearch ? { search: searchResolver } : {}),
    },
  };
}
```

#### Key Points

- Dynamic maps support modularity and feature flags.
- They complicate static analysis and typing.
- Strong validation is required when SDL is dynamic.

#### Best Practices

- Freeze resolver map after startup in production.
- Integration test all flag combinations that matter.
- Document which modules register which fields.

#### Common Mistakes

- Runtime schema changes without migrations or versioning.
- Unvalidated dynamic SDL allowing new types unexpectedly.
- Race conditions when reloading maps without proper synchronization.

---

### 16.7.5 Resolver Composition

#### Beginner

**Composition** combines small resolver functions or maps into a larger whole: merge `userResolvers`, `postResolvers`, and `baseResolvers` with object spread or deep merge utilities.

#### Intermediate

`lodash.merge` or `@graphql-tools/merge` handles nested types. **Schema modules** pattern: each module exports `typeDefs` + `resolvers`. Order merges when the same field appears twice—last wins unless using specialized merge strategies.

#### Expert

**Federation** composes subgraph resolver maps at the gateway with references. Conflicting resolvers across modules indicate ownership problems—resolve with code review rules. For **interfaces**, ensure merged maps include shared interface field resolvers consistently.

```javascript
import { mergeResolvers } from "@graphql-tools/merge";

const resolvers = mergeResolvers([
  userResolvers,
  postResolvers,
  commonResolvers,
]);
```

#### Key Points

- Composition scales teams working on one graph.
- Merge strategy must be explicit to avoid silent overrides.
- Works well with modular monoliths and gateways.

#### Best Practices

- One module owns each root field name.
- Use tests that load the merged schema and smoke-test operations.
- Codegen from merged schema for clients.

#### Common Mistakes

- Shallow merges dropping nested type keys.
- Duplicate field implementations diverging silently.
- Circular imports between resolver modules.

---
