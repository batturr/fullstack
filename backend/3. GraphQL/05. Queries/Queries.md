# GraphQL Queries

## 📑 Table of Contents

- [5.1 Query Basics](#51-query-basics)
  - [5.1.1 Query Operations](#511-query-operations)
  - [5.1.2 Query Syntax](#512-query-syntax)
  - [5.1.3 Field Selection](#513-field-selection)
  - [5.1.4 Nested Queries](#514-nested-queries)
  - [5.1.5 Query Naming](#515-query-naming)
- [5.2 Query Patterns](#52-query-patterns)
  - [5.2.1 Single Entity Query](#521-single-entity-query)
  - [5.2.2 Multiple Entities Query](#522-multiple-entities-query)
  - [5.2.3 List Query](#523-list-query)
  - [5.2.4 Filtered Query](#524-filtered-query)
  - [5.2.5 Paginated Query](#525-paginated-query)
- [5.3 Query Arguments](#53-query-arguments)
  - [5.3.1 Simple Arguments](#531-simple-arguments)
  - [5.3.2 Multiple Arguments](#532-multiple-arguments)
  - [5.3.3 Complex Arguments](#533-complex-arguments)
  - [5.3.4 Argument Defaults](#534-argument-defaults)
  - [5.3.5 Argument Validation](#535-argument-validation)
- [5.4 Query Features](#54-query-features)
  - [5.4.1 Aliases](#541-aliases)
  - [5.4.2 Fragments](#542-fragments)
  - [5.4.3 Operation Names](#543-operation-names)
  - [5.4.4 Multiple Operations](#544-multiple-operations)
  - [5.4.5 Query Comments](#545-query-comments)
- [5.5 Performance Optimization](#55-performance-optimization)
  - [5.5.1 Field Selection Optimization](#551-field-selection-optimization)
  - [5.5.2 Query Depth Limiting](#552-query-depth-limiting)
  - [5.5.3 Query Cost Analysis](#553-query-cost-analysis)
  - [5.5.4 Batching](#554-batching)
  - [5.5.5 Parallel Requests](#555-parallel-requests)
- [5.6 Query Complexity](#56-query-complexity)
  - [5.6.1 Complexity Analysis](#561-complexity-analysis)
  - [5.6.2 Complexity Metrics](#562-complexity-metrics)
  - [5.6.3 Rate Limiting](#563-rate-limiting)
  - [5.6.4 Query Throttling](#564-query-throttling)
  - [5.6.5 DoS Protection](#565-dos-protection)
- [5.7 Advanced Query Patterns](#57-advanced-query-patterns)
  - [5.7.1 Connection Pattern (Relay)](#571-connection-pattern-relay)
  - [5.7.2 Filtering Strategy](#572-filtering-strategy)
  - [5.7.3 Search Implementation](#573-search-implementation)
  - [5.7.4 Sorting Implementation](#574-sorting-implementation)
  - [5.7.5 Full-Text Search](#575-full-text-search)

---

## 5.1 Query Basics

### 5.1.1 Query Operations

#### Beginner

In GraphQL, a **query** is a read-only operation. You send a query document to a single HTTP (or WebSocket) endpoint, and the server returns JSON shaped exactly like your selection set. Unlike REST, you do not pick different URLs for each resource; you describe the tree of data you want in one request.

Every GraphQL request has an **operation type**: `query`, `mutation`, or `subscription`. Query operations never change server state by convention—they only fetch data. The GraphQL specification treats queries as parallel-safe: sibling fields may be resolved concurrently.

#### Intermediate

The execution engine walks your query tree, calling **resolvers** for each field. Root query fields map to your schema’s `Query` type. Understanding operation boundaries matters for caching (CDNs, Apollo normalized cache), persisted queries, and logging. Tools like GraphiQL and Apollo Sandbox send `query` operations with optional `operationName` and `variables`.

#### Expert

Implementations may use **query planning** (federation, stitching) where sub-queries route to multiple subgraphs. The `__typename` field and introspection power polymorphic clients. For security, treat the query document as untrusted input: validate depth, cost, and directives before execution.

```graphql
query GetViewer {
  viewer {
    id
    email
  }
}
```

```javascript
// Node.js: express + graphql-http — execute a query string
import { createHandler } from "graphql-http/lib/use/express";
import express from "express";
import { buildSchema } from "graphql";

const schema = buildSchema(`
  type Query {
    viewer: User
  }
  type User {
    id: ID!
    email: String
  }
`);

const rootValue = {
  viewer: () => ({ id: "1", email: "ada@example.com" }),
};

const app = express();
app.all("/graphql", createHandler({ schema, rootValue }));
app.listen(4000);
```

#### Key Points

- Queries are read operations and should be side-effect free in well-designed APIs.
- One endpoint typically serves all query shapes.
- The response mirrors the query structure (no over-fetching of unused fields).

#### Best Practices

- Keep root fields resource-oriented (`user`, `post`, `orders`) for discoverability.
- Use `operationName` in production for metrics and debugging.
- Document which fields are expensive in your schema descriptions.

#### Common Mistakes

- Performing writes inside query resolvers (breaks caching and client expectations).
- Exposing internal database shapes directly as GraphQL types without a domain layer.
- Assuming field order in the response matches resolver completion order (only selection order is guaranteed).

---

### 5.1.2 Query Syntax

#### Beginner

A GraphQL document is text: keywords, braces, names, strings, numbers, and punctuation. Curly braces `{ }` define **selection sets**. You request **fields** on types; arguments go in parentheses. Strings use double quotes. Commas are optional between fields (many style guides omit them).

#### Intermediate

The grammar distinguishes **operations** (optional `query` keyword), **variable definitions** (`$id: ID!`), **directives** (`@include`, `@skip`), and **fragments**. Names must not start with `__` except for introspection. Lists use `[Type!]`; non-null is `!`.

#### Expert

Parsers produce an AST; validators enforce the GraphQL spec (e.g., leaf fields must be scalar or enum). Custom directives extend the language but require server support. Lexical details (Unicode, escape sequences) matter when accepting queries from browsers and CLIs.

```graphql
query UserCard($userId: ID!) {
  user(id: $userId) {
    name
    posts(limit: 3) {
      title
    }
  }
}
```

```javascript
import { parse, validate } from "graphql";
import { buildSchema } from "graphql";

const schema = buildSchema(`
  type Query { user(id: ID!): User }
  type User { name: String, posts(limit: Int): [Post!]! }
  type Post { title: String }
`);

const doc = parse(`
  query UserCard($userId: ID!) {
    user(id: $userId) { name posts(limit: 3) { title } }
  }
`);

const errors = validate(schema, doc);
if (errors.length) console.error(errors);
```

#### Key Points

- Selection sets nest to form a tree; the schema constrains valid fields.
- Variables keep queries static for caching and avoid string concatenation.
- Validation catches many errors before execution.

#### Best Practices

- Run `validate()` server-side on every document (or use a framework that does).
- Prefer variables over embedding user input in the query string.
- Format documents consistently (Prettier, `graphql-eslint`).

#### Common Mistakes

- Missing `!` on variables that must be provided, leading to runtime null errors.
- Using single-quoted strings (invalid in GraphQL).
- Confusing argument syntax with JSON (GraphQL has its own input grammar).

---

### 5.1.3 Field Selection

#### Beginner

You only receive fields you ask for. If you query `user { name }`, you do not get `email` unless listed. This is the core GraphQL value proposition for mobile and web clients: minimal payloads.

#### Intermediate

Each selected field may have arguments and its own sub-selection (for object types). Scalar fields return JSON primitives; object fields require a nested selection (or you get a validation error). Lists are homogeneous in type.

#### Expert

Field collection drives **resolver fan-out** and N+1 risks. DataLoader and batching patterns exist because selection sets imply work per field. For federation, `@key` fields and **entity representations** tie selections across services.

```graphql
query {
  product(id: "sku-42") {
    sku
    price {
      amount
      currency
    }
  }
}
```

```javascript
// graphql-js style resolvers: field-level functions
const resolvers = {
  Query: {
    product: (_, { id }) => db.products.findById(id),
  },
  Product: {
    price: (parent) => pricingService.getPrice(parent.sku),
  },
};
```

#### Key Points

- Field selection is the contract between client and server for response shape.
- Nested fields imply nested resolver calls (unless batched or joined).
- Introspection can list available fields for tooling.

#### Best Practices

- Ask for stable identifiers (`id`, `globalId`) for caching.
- Co-locate fragments with UI components in larger apps.
- Avoid selecting huge blobs when a summary type suffices.

#### Common Mistakes

- Selecting every field “just in case,” defeating bandwidth savings.
- Forgetting sub-selections on object types.
- Relying on fields that are deprecated without migration.

---

### 5.1.4 Nested Queries

#### Beginner

Nesting means asking for related data in one round trip: `user { posts { comments { body } } }`. The client expresses relationships; the server resolves each level.

#### Intermediate

Depth increases latency and load. Some APIs limit nesting depth. Resolvers receive `parent`, `args`, `context`, and `info`—use `parent` to walk from user to posts. **Resolver chains** compose small functions per field.

#### Expert

**GraphQL execution** resolves sibling fields concurrently but parent before children (per value). For SQL, you might use JOINs, DataLoader, or lookahead (`graphql-parse-resolve-info`) to fetch nested data in fewer queries. Cyclic types (`User` → `friends` → `User`) need termination via limits or pagination.

```graphql
query {
  me {
    id
    teams {
      id
      members {
        id
        displayName
      }
    }
  }
}
```

```javascript
async function members(team, _args, ctx) {
  return ctx.loaders.teamMembers.load(team.id);
}

const resolvers = {
  Team: { members },
};
```

#### Key Points

- Nesting models graph relationships without multiple HTTP calls.
- Each level is a potential database or service hop.
- Pagination at nested lists is often required for production APIs.

#### Best Practices

- Cap list sizes or use cursor pagination on nested collections.
- Use DataLoader keyed by parent id to batch nested loads.
- Instrument slow nested paths in tracing (OpenTelemetry, Apollo Studio).

#### Common Mistakes

- Unbounded nesting enabling expensive “deep” queries (DoS).
- N+1 queries when each child resolver hits the DB independently.
- Returning null for a non-nullable parent field, bubbling errors.

---

### 5.1.5 Query Naming

#### Beginner

You can write anonymous queries (`query { me { id } }`), but naming helps humans and tools. A **name** follows the `query` keyword: `query Me { ... }`.

#### Intermediate

**Operation names** pair with **operationName** in JSON bodies so servers know which operation to run when the document contains several. Names should describe intent: `GetCheckoutCart`, not `Query1`.

#### Expert

Persisted queries map hashes to documents; names still appear in analytics. Code generators (GraphQL Code Generator) use operation names for TypeScript types. Lint rules can enforce PascalCase or a prefix convention.

```graphql
query CheckoutSummary {
  cart {
    itemCount
    totalCents
  }
}
```

```javascript
// Typical POST body from a client
const body = JSON.stringify({
  query: `
    query CheckoutSummary { cart { itemCount totalCents } }
  `,
  operationName: "CheckoutSummary",
});
```

#### Key Points

- Names improve logs, errors, and client codegen.
- Required when sending multiple operations in one document (with operationName).
- Anonymous operations are fine for quick tests but weak for production observability.

#### Best Practices

- Use verb-noun or domain phrases consistent across your org.
- Align operation names with UI routes or features when practical.
- Forbid anonymous operations in production if you rely on metrics by name.

#### Common Mistakes

- Duplicate operation names in the same document (invalid).
- Mismatch between `operationName` and the actual operation selected.
- Extremely long names that clutter dashboards.

---

## 5.2 Query Patterns

### 5.2.1 Single Entity Query

#### Beginner

Fetch one record by a unique key, often `id`. The query returns a single object or `null` if not found (depending on schema).

#### Intermediate

Nullable vs non-nullable return types communicate “missing” vs “error.” Use `ID!` arguments for primary keys. Consider **global IDs** (base64 of `Type:id`) for Relay-style clients.

#### Expert

**Node** interface and `node(id: ID!)` unify refetching. For multi-tenant systems, inject tenant scope in context and enforce it in the root resolver to prevent cross-tenant access.

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    handle
    createdAt
  }
}
```

```javascript
// Resolver with not-found as null
async function user(_, { id }, ctx) {
  const row = await ctx.db.users.findById(id);
  return row ?? null;
}
```

#### Key Points

- Single-entity queries are the simplest root pattern.
- Nullability is part of your API contract.
- Authorization should run even when the id is guessable.

#### Best Practices

- Return `null` for hidden resources vs forbidden—choose a consistent policy.
- Avoid leaking existence of private entities via different errors if that matters.
- Index database columns used in lookup arguments.

#### Common Mistakes

- Throwing for “not found” when the schema says the field is nullable.
- Using integers in APIs that later need opaque IDs.
- Skipping auth checks on public-looking UUIDs.

---

### 5.2.2 Multiple Entities Query

#### Beginner

Request several unrelated root fields in one query: `{ userA: user(id:"1") { name } userB: user(id:"2") { name } }`. You need **aliases** when field names repeat (see 5.4.1).

#### Intermediate

The server may resolve root fields in parallel. This reduces HTTP overhead versus two REST calls. Watch total cost: more roots mean more work in one request.

#### Expert

In subgraphs, multiple entities might hit different services behind a gateway. **Query planners** optimize fetches; duplicate representations may dedupe. Use **@defer** / subscriptions (where supported) for progressive loading.

```graphql
query Dashboard($orgId: ID!, $meId: ID!) {
  organization(id: $orgId) {
    name
  }
  me: user(id: $meId) {
    displayName
  }
}
```

```javascript
const resolvers = {
  Query: {
    organization: (_, { id }, ctx) => ctx.orgs.byId(id),
    user: (_, { id }, ctx) => ctx.users.byId(id),
  },
};
```

#### Key Points

- One round trip can hydrate a dashboard with several roots.
- Aliases disambiguate repeated fields.
- Parallel resolution improves latency when I/O bound.

#### Best Practices

- Split huge dashboards into smaller operations if complexity limits bite.
- Use field-level authorization per root.
- Trace each root field separately in APM.

#### Common Mistakes

- Omitting aliases when querying the same field twice.
- Blocking parallel roots accidentally with a shared mutex in context.
- One failure mode taking down unrelated roots (isolate errors per field where spec allows).

---

### 5.2.3 List Query

#### Beginner

A field returns a list: `[User!]`. You select subfields applied to each element. Empty lists are usually `[]`, not `null`, if the list is non-nullable.

#### Intermediate

Decide between **nullable lists** (`[User]`) vs **non-null elements** (`[User!]`). Common pattern: `[User!]!`—always a list, never null, no null members. Sort order should be documented (default sort).

#### Expert

Large lists need **pagination** (5.2.5) or **windowing**. For SQL, avoid `SELECT *` without `LIMIT`. Stream-based or cursor APIs help for exports; GraphQL responses are still one JSON document unless using defer/stream.

```graphql
query RecentComments {
  recentComments {
    id
    body
    author {
      handle
    }
  }
}
```

```javascript
const typeDefs = `#graphql
  type Query {
    recentComments: [Comment!]!
  }
`;

async function recentComments(_root, _args, ctx) {
  return ctx.db.comments.findRecent({ limit: 50 });
}
```

#### Key Points

- List fields are where APIs without limits become dangerous.
- Element nullability encodes partial batch failures if ever needed.
- Default ordering must be stable if clients paginate naively.

#### Best Practices

- Document max length or enforce it in resolvers.
- Prefer cursor pagination for stable, large datasets.
- Use DataLoader for `author` on each comment.

#### Common Mistakes

- Returning `null` instead of `[]` for “no results” on `[T!]!`.
- Unstable sort causing duplicate/missing rows across pages.
- Loading `author` per row without batching.

---

### 5.2.4 Filtered Query

#### Beginner

Pass **arguments** to narrow a list: `users(role: ADMIN)`, `searchProducts(tag: "coffee")`. Filters map to SQL `WHERE`, search indexes, or service parameters.

#### Intermediate

Use **input objects** for many optional filters (`UserFilter`). Validate combinations (e.g., date range start ≤ end). Expose enums for fixed sets instead of free strings when possible.

#### Expert

**Filter injection** is a risk if raw strings hit SQL—use parameterized queries. For OpenSearch/Elasticsearch, translate GraphQL inputs to a bool query. Consider **allowlists** of sortable fields to prevent expensive sorts.

```graphql
query FilteredProducts($filter: ProductFilter!) {
  products(filter: $filter) {
    sku
    name
  }
}
```

```graphql
input ProductFilter {
  categoryIn: [String!]
  priceMin: Float
  priceMax: Float
  inStock: Boolean
}
```

```javascript
function products(_root, { filter }, ctx) {
  return ctx.db.products.search({
    categories: filter.categoryIn,
    minPrice: filter.priceMin,
    maxPrice: filter.priceMax,
    inStock: filter.inStock,
  });
}
```

#### Key Points

- Input objects scale better than long argument lists.
- Filters should be documented and validated.
- Backend must enforce indexes matching hot filters.

#### Best Practices

- Reject unknown filter combinations that are too broad without pagination.
- Log slow filter patterns for index tuning.
- Version filters when semantics change.

#### Common Mistakes

- Accepting arbitrary sort field names from clients.
- Building SQL with string concat from GraphQL args.
- No upper bound on result set size.

---

### 5.2.5 Paginated Query

#### Beginner

**Offset pagination**: `users(limit: 10, offset: 20)`. Simple but unstable under inserts/deletes. **Cursor pagination**: `after: "cursor", first: 10`—better for live data.

#### Intermediate

Relay’s **Connection** spec defines `edges { cursor node }`, `pageInfo { hasNextPage endCursor }`. Cursors should be opaque. Encode stable sort keys (e.g., `(createdAt, id)`).

#### Expert

**Keyset pagination** uses `WHERE (sortField, id) > (?, ?)` for performance at scale. Avoid `OFFSET` for large offsets. For federated graphs, ensure cursor encoding is service-local or globally meaningful.

```graphql
query UsersPage($first: Int!, $after: String) {
  users(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        handle
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
function encodeCursor(row) {
  return Buffer.from(
    JSON.stringify({ c: row.createdAt, i: row.id })
  ).toString("base64url");
}
```

#### Key Points

- Cursor pagination pairs with a defined sort order.
- `pageInfo` tells clients when to stop.
- Offset pagination is acceptable for admin tools with small datasets.

#### Best Practices

- Document whether cursors expire.
- Include tie-breaker id in cursors.
- Cap `first` / `last` aggressively.

#### Common Mistakes

- Using database row ids as cursors without sort context.
- Returning `hasNextPage` wrong when exactly `first` rows returned.
- Exposing internal DB offsets in cursors unintentionally.

---

## 5.3 Query Arguments

### 5.3.1 Simple Arguments

#### Beginner

Scalars as arguments: `Int`, `Float`, `String`, `Boolean`, `ID`. Example: `post(id: "x")`.

#### Intermediate

Literals in the query vs variables: prefer `$id: ID!` and `"variables": { "id": "x" }` for safety and caching.

#### Expert

Coercion rules: Int literals must fit in 32-bit signed range. Custom scalars (DateTime, JSON) parse in `parseValue`/`parseLiteral`. Serialize consistently for responses.

```graphql
query PostById($id: ID!) {
  post(id: $id) {
    title
  }
}
```

```javascript
import { graphql } from "graphql";

const result = await graphql({
  schema,
  source: "query($id:ID!){ post(id:$id){ title } }",
  variableValues: { id: "p1" },
  rootValue,
});
```

#### Key Points

- Simple arguments cover most lookups and toggles.
- Variables prevent injection via query text.
- Scalars validate at the GraphQL layer before resolvers.

#### Best Practices

- Use `ID` for identifiers even if stored as UUID strings.
- Coerce and validate again in resolvers for business rules.
- Document units (cents vs dollars, seconds vs ms).

#### Common Mistakes

- Using `String` for everything, losing type clarity.
- Mixing client formats (number vs string) for IDs.
- Relying on GraphQL Int for 64-bit database ids.

---

### 5.3.2 Multiple Arguments

#### Beginner

Separate with spaces or commas: `events(from: "2024-01-01", to: "2024-12-31")`.

#### Intermediate

Order of arguments does not matter. Optional args can be omitted; required ones must appear in the operation or variables.

#### Expert

Resolver function receives a single `args` object. Consider **argument groups** via input types when arity grows. For performance, avoid redundant args that imply the same filter twice.

```graphql
query Events($from: Date!, $to: Date!, $city: String) {
  events(from: $from, to: $to, city: $city) {
    id
    name
  }
}
```

```javascript
async function events(_root, { from, to, city }, ctx) {
  return ctx.db.events.inRange({ from, to, city });
}
```

#### Key Points

- Multiple arguments compose filters and options.
- Input objects scale better than many positional parameters at call sites.
- Defaults can reduce client burden (5.3.4).

#### Best Practices

- Name arguments descriptively (`from`/`to` not `a`/`b`).
- Validate cross-field rules in a shared function.
- Keep resolver signatures thin—delegate to services.

#### Common Mistakes

- Too many primitive args on one field (hard to evolve).
- Inconsistent naming (`start` vs `from` across types).
- Nullable ranges without documented semantics.

---

### 5.3.3 Complex Arguments

#### Beginner

**Input objects** group fields: `updateUser(input: { name: "Ada" })`. Inputs cannot contain cycles and are not polymorphic like object types (unions/interfaces are not allowed as input in standard GraphQL).

#### Intermediate

**Lists of inputs** model batches: `createItems(items: [ItemInput!]!)`. Use **enums** for mode switches. **Nested inputs** represent trees (menus, org charts) with size limits.

#### Expert

Custom scalars (e.g., `JSONObject`) bypass structure but weaken type safety. **OneOf** input (newer spec) enforces exactly one field set. Federation passes representations as structured inputs.

```graphql
query Search($q: SearchInput!) {
  search(input: $q) {
    id
    score
  }
}
```

```graphql
input SearchInput {
  text: String
  filters: [FilterInput!]
  boostTags: [String!]
}

input FilterInput {
  field: String!
  op: FilterOp!
  value: String!
}

enum FilterOp {
  EQ
  CONTAINS
  GT
  LT
}
```

```javascript
function search(_root, { input }, ctx) {
  return ctx.searchEngine.query(input);
}
```

#### Key Points

- Input types are the primary tool for structured arguments.
- They version more cleanly than exploding scalar parameter lists.
- Deep inputs need depth/size guards.

#### Best Practices

- Prefer enums over stringly-typed modes.
- Sanitize `field` names in generic filters against an allowlist.
- Limit array lengths in validation.

#### Common Mistakes

- Using `String` JSON blobs instead of structured inputs.
- Allowing unbounded recursion in nested input trees.
- Breaking clients by renaming input fields without deprecation path.

---

### 5.3.4 Argument Defaults

#### Beginner

SDL default values: `limit: Int = 10`. If the client omits the argument, the default applies.

#### Intermediate

Variable defaults: `query ($limit: Int = 10) { items(limit: $limit) }`. Defaults must be compile-time literals in GraphQL, not dynamic server logic (unless your framework extends this).

#### Expert

Defaults interact with **nullable vs non-null**. A default can make a nullable argument effectively optional. Document defaults in descriptions; codegen surfaces them to clients.

```graphql
type Query {
  feed(limit: Int = 20, sort: SortOrder = NEWEST): [Post!]!
}

enum SortOrder {
  NEWEST
  OLDEST
}
```

```javascript
async function feed(_root, args) {
  const limit = args.limit ?? 20;
  const sort = args.sort ?? "NEWEST";
  return db.posts.list({ limit, sort });
}
```

#### Key Points

- SDL defaults are visible in introspection.
- Resolver-level `??` duplicates SDL—prefer one source of truth.
- Changing defaults is a behavioral API change.

#### Best Practices

- Keep defaults conservative for performance.
- Announce default changes in release notes.
- Test clients that omit optional args explicitly.

#### Common Mistakes

- SDL says default 10 but resolver uses 50.
- Non-null args with defaults confusing client authors.
- Relying on undefined vs null inconsistently in JS resolvers.

---

### 5.3.5 Argument Validation

#### Beginner

GraphQL validates types and required fields before resolvers run. Business validation (email format, ownership) belongs in resolvers or domain layer.

#### Intermediate

Use **custom scalars** (Email, PositiveInt) for reusable checks. Libraries like **Zod** or **Joi** can validate `args` inside services. Return `GraphQLError` with extensions (`code`, `field`).

#### Expert

Directive-based validation (`@constraint`) exists in some servers. For multi-field rules, validate in a parent resolver or use **rules engines**. Persisted queries reduce arbitrary client shapes.

```javascript
import { GraphQLError } from "graphql";

function assertRange(from, to) {
  if (from > to) {
    throw new GraphQLError("`from` must be <= `to`", {
      extensions: { code: "BAD_USER_INPUT", fields: ["from", "to"] },
    });
  }
}

async function bookings(_root, { from, to }, ctx) {
  assertRange(from, to);
  return ctx.db.bookings.inRange(from, to);
}
```

#### Key Points

- Layer 1: spec validation; Layer 2: domain validation.
- Good errors help clients fix requests.
- Do not leak internal stack traces to clients.

#### Best Practices

- Use `BAD_USER_INPUT` or domain codes in extensions.
- Map validation failures to user-visible messages.
- Log validation failures with request id, not PII.

#### Common Mistakes

- Returning `null` silently when validation fails.
- Throwing generic errors with no field context.
- Duplicating validation only on the client.

---

## 5.4 Query Features

### 5.4.1 Aliases

#### Beginner

Rename a field in the response key: `east: warehouse(code: "EAST") { id }` → JSON has `east`, not `warehouse`.

#### Intermediate

Aliases enable querying the same field with different arguments twice. Required for comparing variants or fetching two nodes of the same type.

#### Expert

Aliases affect only response keys, not resolver behavior. **Apollo** caches by entity id, not alias names. For analytics, record both field name and alias if needed.

```graphql
query Compare {
  ada: user(id: "1") {
    handle
  }
  grace: user(id: "2") {
    handle
  }
}
```

```javascript
// Response shape matches aliases
// { "data": { "ada": { "handle": "..." }, "grace": { "handle": "..." } } }
```

#### Key Points

- Aliases disambiguate duplicate fields in one selection.
- They are a client-side naming tool for JSON ergonomics.
- They do not change server-side field definitions.

#### Best Practices

- Use meaningful alias names tied to UI intent.
- Combine with fragments for DRY selections on aliased fields.
- Teach newcomers—aliases confuse readers at first.

#### Common Mistakes

- Forgetting the alias and getting “Fields conflict” validation errors.
- Using aliases that shadow real field names confusingly.
- Expecting aliases to affect authorization (they do not).

---

### 5.4.2 Fragments

#### Beginner

A **fragment** is a reusable selection set on a concrete type: `fragment UserParts on User { name avatarUrl }`.

#### Intermediate

**Inline fragments** support unions/interfaces: `... on AdminUser { auditLog }`. **Fragment spreads** (`...UserParts`) must be valid on the current type.

#### Expert

**Fragment colocation** with components (Relay, Apollo) enables composition. **Fragment masking** hides unused fields. Beware fragment cycles and explosion of combinations; lint with `graphql-eslint`.

```graphql
fragment UserCard on User {
  id
  handle
  avatarUrl
}

query UserPage($id: ID!) {
  user(id: $id) {
    ...UserCard
  }
}
```

```javascript
import { parse } from "graphql";
const doc = parse(`
  fragment UserCard on User { id handle }
  query Q { me { ...UserCard } }
`);
```

#### Key Points

- Fragments reduce duplication in large queries.
- Type conditions enforce safe polymorphic selections.
- All spreads are merged into one effective selection set per runtime type.

#### Best Practices

- Name fragments `ComponentName_fields` or domain-oriented.
- Avoid mega-fragments shared everywhere (over-fetching).
- Use `@include`/`@skip` for conditional fragments.

#### Common Mistakes

- Spreading a fragment on the wrong type (validation error).
- Putting fragments on `Query` that belong on `User`.
- Duplicating conflicting fields with different sub-selections.

---

### 5.4.3 Operation Names

#### Beginner

`query NameHere { ... }` identifies the operation for humans and for the `operationName` transport field.

#### Intermediate

Required when multiple operations exist in one document. Servers use it for allowlists, persisted query registration, and Apollo Studio operation signatures.

#### Expert

**APQ (automatic persisted queries)** sends a hash; operation name still helps tracing. **Federation** gateways log operation names per subgraph query plan.

```graphql
query OrderDetails($id: ID!) {
  order(id: $id) {
    id
    status
    lines {
      sku
      qty
    }
  }
}
```

```javascript
fetch("/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    query: `query OrderDetails($id:ID!){ order(id:$id){ id status lines{ sku qty } } }`,
    variables: { id: "o-9" },
    operationName: "OrderDetails",
  }),
});
```

#### Key Points

- Operation names are the primary key for client observability.
- They must be unique within a document.
- They do not affect GraphQL semantics beyond identification.

#### Best Practices

- Always set `operationName` in production clients.
- Align with OpenTelemetry span names.
- Avoid PII in names.

#### Common Mistakes

- Multiple named operations without passing `operationName`.
- Typos between name in document and `operationName` string.
- Using anonymous operations in codegen workflows that require names.

---

### 5.4.4 Multiple Operations

#### Beginner

A document may contain `query A { ... } query B { ... }` but the client must specify which runs via `operationName`.

#### Intermediate

Batching multiple operations in one HTTP request differs: some clients send an **array** of bodies. GraphQL over HTTP spec describes batching behavior where supported.

#### Expert

**Persisted query lists** often register each operation separately. **Query batching** with DataLoader works across operations only if your server merges contexts carefully—usually one operation per request is simpler.

```graphql
query LightUser($id: ID!) {
  user(id: $id) {
    id
    handle
  }
}

query HeavyUser($id: ID!) {
  user(id: $id) {
    id
    handle
    posts {
      title
    }
  }
}
```

```javascript
JSON.stringify({
  query: documentContainingBoth,
  operationName: "HeavyUser",
  variables: { id: "1" },
});
```

#### Key Points

- One request, one executed operation (typical servers).
- Multiple operations aid colocation and codegen, not parallel execution.
- Batching arrays are a transport concern, not core spec.

#### Best Practices

- Split rarely used heavy queries into separate documents if size matters.
- Document server support for batching.
- Test variable compatibility across operations.

#### Common Mistakes

- Sending two operation names at once (invalid).
- Expecting both operations to run in one round trip without batch support.
- Huge documents slowing parser startup.

---

### 5.4.5 Query Comments

#### Beginner

GraphQL supports `#` line comments. They are stripped by the parser and do not affect execution.

#### Intermediate

Use comments for dev notes, TODOs, and temporary disables during debugging. Block comments are not in the spec—only `#`.

#### Expert

Some tools preserve comments in SDL; query documents lose comments in AST round trips. Do not put secrets in comments (queries may log). **graphql-print** may omit comments.

```graphql
# Fetches public profile fields only
query PublicProfile($id: ID!) {
  user(id: $id) {
    handle
    # email intentionally omitted for privacy mode
    bio
  }
}
```

```javascript
import { parse, print } from "graphql";
const ast = parse(`
  # header comment
  query Q { __typename }
`);
console.log(print(ast));
```

#### Key Points

- Comments aid readability in hand-written queries.
- They are not documentation for schema consumers (use descriptions).
- Log scrubbing should still treat whole query text as sensitive.

#### Best Practices

- Explain non-obvious field omissions.
- Remove noisy comments before committing generated giant queries.
- Use schema `description` for API contracts.

#### Common Mistakes

- Using `//` comments (invalid).
- Embedding credentials in comments.
- Relying on comments for security decisions.

---

## 5.5 Performance Optimization

### 5.5.1 Field Selection Optimization

#### Beginner

Ask only for fields the UI needs. Smaller selections mean less resolver work and smaller JSON.

#### Intermediate

**Persisted queries** lock allowed shapes. **AST analysis** tools flag over-fetching. For mobile, strip unused fragments at build time.

#### Expert

**@defer** (incremental delivery) returns critical fields first where supported. **Field usage analytics** (Apollo) prunes schema over time. Join strategies: SQL SELECT lists matching selection (`graphql-parse-resolve-info`).

```javascript
function selectedFields(selectionSet) {
  const names = [];
  for (const sel of selectionSet.selections) {
    if (sel.kind === "Field") names.push(sel.name.value);
  }
  return names;
}
```

#### Key Points

- Selection drives cost—optimize at the GraphQL boundary.
- Product discipline matters as much as engineering.
- Server can log heavy selections by operation name.

#### Best Practices

- Review top operations by byte size monthly.
- Add `complexity` costs to expensive fields.
- Teach frontend teams the cost model.

#### Common Mistakes

- Copy-pasting admin queries into mobile clients.
- Selecting large HTML/markdown bodies by default.
- Ignoring N+1 because the query “looks small.”

---

### 5.5.2 Query Depth Limiting

#### Beginner

Limit how deep selections can nest (e.g., max depth 7) to block abusive queries.

#### Intermediate

Implement with **validation rules** walking the AST, or middleware like `graphql-depth-limit`. Weight introspection separately.

#### Expert

Depth alone is insufficient (wide queries at shallow depth). Combine with **complexity** and **cost** limits. Tune limits per client role if needed.

```javascript
import depthLimit from "graphql-depth-limit";
import { createHandler } from "graphql-http/lib/use/express";

createHandler({
  schema,
  validationRules: [depthLimit(10)],
});
```

#### Key Points

- Depth limiting is a cheap first line of defense.
- It does not cap fan-out at a single level.
- Introspection queries can be deep—allow or block explicitly.

#### Best Practices

- Log rejected queries with hash, not full text in production if large.
- Provide clear errors (`MAX_DEPTH_EXCEEDED`).
- Revisit limits when schema grows.

#### Common Mistakes

- Setting depth so low legitimate apps break.
- Only limiting depth while allowing `first: 10000`.
- Forgetting aliases multiply paths.

---

### 5.5.3 Query Cost Analysis

#### Beginner

Assign **cost** per field (static or dynamic) and reject queries exceeding a budget.

#### Intermediate

**graphql-validation-complexity** or custom visitors sum costs with multipliers for lists. Dynamic cost uses arguments (`first * childCost`).

#### Expert

Calibrate against production traces. **Federated** graphs may estimate per subgraph. Combine with rate limits keyed by cost, not just request count.

```javascript
import { createComplexityLimitRule } from "graphql-validation-complexity";

const rule = createComplexityLimitRule(1000, {
  scalarCost: 1,
  objectCost: 5,
  listFactor: 10,
});
```

#### Key Points

- Cost models approximate actual work better than depth alone.
- They require maintenance when schema/resolvers change.
- Dynamic multipliers align limits with `first`/`limit` args.

#### Best Practices

- Start simple, refine with data.
- Document how clients should paginate under budgets.
- Exclude health checks from complexity if needed.

#### Common Mistakes

- Underestimating list fan-out.
- Static costs that ignore resolver caching effects.
- Hiding errors—clients need actionable messages.

---

### 5.5.4 Batching

#### Beginner

**Request batching**: multiple GraphQL operations in one HTTP round trip (client feature). **DataLoader batching**: collapse many resolver calls into one DB query inside one operation.

#### Intermediate

DataLoader batches within a single tick/request. For HTTP batching, watch timeouts and error isolation—one failure semantics vary.

#### Expert

**Apollo Router** and gateways may batch subgraph requests. **@export** (rare) and **defer** change delivery. Consider **stitching** batch planners for N subgraph hits.

```javascript
import DataLoader from "dataloader";

function createLoaders(db) {
  return {
    userById: new DataLoader(async (ids) => {
      const rows = await db.users.findByIds(ids);
      const map = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}
```

#### Key Points

- DataLoader solves N+1 within one GraphQL execution.
- HTTP batching reduces network chatter but complicates caching headers.
- Batch functions must return results in input order.

#### Best Practices

- One DataLoader instance per request (attach to context).
- Use caching option carefully across auth boundaries.
- Prime loaders after mutations when needed.

#### Common Mistakes

- Sharing DataLoader across requests (data leaks).
- Forgetting to handle missing keys (undefined holes).
- Batching without deduplication when ids repeat.

---

### 5.5.5 Parallel Requests

#### Beginner

From the browser, `Promise.all` several `fetch` calls to the same GraphQL endpoint for independent screens—works but increases connection count.

#### Intermediate

Prefer **one query** with multiple root fields when possible. HTTP/2 multiplexing reduces head-of-line blocking. Respect browser connection limits.

#### Expert

**Link chains** (Apollo) can split operations or use `@defer`. For SSR, parallelize independent queries across workers carefully to avoid thundering herd on cold DB.

```javascript
async function loadDashboard() {
  const [user, stats] = await Promise.all([
    gqlFetch({ query: QUERY_ME }),
    gqlFetch({ query: QUERY_STATS }),
  ]);
  return { user, stats };
}
```

#### Key Points

- Single merged query reduces HTTP overhead and auth checks once.
- Parallel fetches help when merging would create an oversized document.
- Server-side, root fields already resolve concurrently when independent.

#### Best Practices

- Measure TTFB vs JSON parse costs before splitting.
- Use APQ for repeated query shapes.
- Coalesce on the server when clients hammer the same data.

#### Common Mistakes

- Duplicating auth middleware work across parallel calls.
- Race conditions updating shared client cache without normalization.
- Too many parallel heavy queries saturating the DB pool.

---

## 5.6 Query Complexity

### 5.6.1 Complexity Analysis

#### Beginner

**Complexity** estimates how “heavy” a query is by counting fields, list sizes, and custom weights—used to block expensive queries before execution.

#### Intermediate

Analysis is static (AST + variable values) or dynamic (resolver hints). It complements depth limits.

#### Expert

Tune with **p95** latencies. For **federation**, sum subgraph estimates or use router plugins. Machine learning–based scoring is rare; rule-based dominates.

```javascript
function fieldCost(nodeName, args) {
  if (nodeName === "comments" && args.first) {
    return 1 + 3 * args.first;
  }
  return 1;
}
```

#### Key Points

- Complexity analysis is policy-as-code for GraphQL traffic.
- It requires ongoing calibration.
- Combine with real profiling—models lie.

#### Best Practices

- Version your cost function with the schema.
- Alert when legitimate queries approach limits (schema smell).
- Test complexity in CI with representative operations.

#### Common Mistakes

- Shipping defaults that block introspection in dev only in prod.
- Ignoring variable defaults in cost calculation.
- One global limit for mobile and admin clients.

---

### 5.6.2 Complexity Metrics

#### Beginner

Metrics might include **field count**, **max depth**, **estimated rows**, or **resolver count**.

#### Intermediate

Export Prometheus metrics: `graphql_operation_complexity`, `graphql_rejected_queries_total`. Tag with `operationName` cardinality cautiously.

#### Expert

**Distributed tracing** spans per resolver show real cost vs estimates. **SLOs** on p99 operation time per operation name. **Adaptive limits** are advanced (risky).

```javascript
import client from "prom-client";

const complexityHistogram = new client.Histogram({
  name: "graphql_estimated_complexity",
  help: "Estimated complexity per operation",
  labelNames: ["operationName"],
});
```

#### Key Points

- Metrics bridge estimated vs actual cost gaps.
- High-cardinality labels can crash metrics backends.
- Use histograms for latency, counters for rejects.

#### Best Practices

- Sample full query text logging; hash for high volume.
- Dashboard rejects vs successes.
- Correlate complexity spikes with deployments.

#### Common Mistakes

- Logging full variables containing secrets.
- Unbounded operationName labels.
- Measuring only depth after investing in complexity rules.

---

### 5.6.3 Rate Limiting

#### Beginner

Cap requests per IP/user/key per minute to protect the API from abuse.

#### Intermediate

**Token bucket** or **sliding window** in Redis. GraphQL-specific: weight by complexity or field cost, not just request count.

#### Expert

**GraphQL-specific rate limits** use persisted query hashes. **User-based** limits respect auth; **IP-based** for anonymous. **Burst** allowances improve UX.

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  keyGenerator: (req) => req.user?.id ?? req.ip,
});

app.use("/graphql", limiter);
```

#### Key Points

- Per-request limits punish legitimate GraphQL (single request, big query).
- Combine IP and user dimensions.
- Return `429` with `Retry-After` when possible.

#### Best Practices

- Whitelist health checks and internal subnets carefully.
- Document limits for API consumers.
- Use Redis for multi-instance fairness.

#### Common Mistakes

- Rate limiting only at CDN without seeing POST bodies.
- Identical limits for anonymous vs paying tiers.
- No bypass for trusted server-to-server callers.

---

### 5.6.4 Query Throttling

#### Beginner

**Throttling** slows or queues traffic when load is high—softer than hard rejects.

#### Intermediate

Adaptive concurrency limits on the Node event loop, **backpressure** on subscription sinks, or queue wait timeouts for DB-heavy resolvers.

#### Expert

**Load shedding**: drop lowest-priority operations first (e.g., analytics queries). **Priority headers** (custom) for tiered QoS. Coordinate with **circuit breakers** downstream.

```javascript
import pLimit from "p-limit";

const graphqlConcurrency = pLimit(50);

app.use("/graphql", (req, res, next) => {
  graphqlConcurrency(() => new Promise((resolve) => handler(req, res, resolve))).catch(
    next
  );
});
```

#### Key Points

- Throttling protects tail latency under overload.
- It interacts with client timeouts—tune together.
- Prefer shedding over cascading failures.

#### Best Practices

- Emit metrics when throttled.
- Fail fast with clear errors.
- Load test with realistic GraphQL mix.

#### Common Mistakes

- Unlimited queue growth (OOM).
- Throttling without distinguishing query types.
- Hiding throttling behind generic 500s.

---

### 5.6.5 DoS Protection

#### Beginner

**Denial of Service**: attackers send queries that exhaust CPU, memory, or DB connections. GraphQL’s flexibility increases attack surface.

#### Intermediate

Layer **depth**, **complexity**, **rate limits**, **timeouts**, **max body size**, **disable introspection** in production, **persisted queries**.

#### Expert

**Query allowlists** for mobile apps. **WAF** rules for suspicious patterns. **Separate read replicas** for heavy reporting queries. **Federation** per-subgraph circuit breaking.

```javascript
app.use(express.json({ limit: "200kb" }));

app.use("/graphql", (req, res, next) => {
  req.setTimeout(10_000);
  next();
});
```

#### Key Points

- Defense in depth—no single knob fixes all.
- Introspection and `__schema` enable reconnaissance.
- Timeouts protect against pathological resolvers.

#### Best Practices

- Run chaos tests on GraphQL path.
- Monitor connection pool saturation.
- Review new schema fields for Cartesian explosions.

#### Common Mistakes

- Public introspection on internet APIs without other guards.
- No request body size limit (huge AST parse).
- Assuming CDN caching helps POST GraphQL (usually does not).

---

## 5.7 Advanced Query Patterns

### 5.7.1 Connection Pattern (Relay)

#### Beginner

Relay’s **cursor connections** standardize pagination: `friends(first:2 after:$c){ edges{ node{ name } cursor } pageInfo{...}}`.

#### Intermediate

Arguments `first`/`after` (forward) and `last`/`before` (backward) with rules: cannot mix directions; require `first` or `last`. Global IDs via `Node` interface.

#### Expert

**Custom edges** add fields like `friendshipSince`. **PageInfo** must be consistent with server sort. **Federation**: encode subgraph type in global ids. **Compliance** audits may require export of all edges—batch jobs bypass GraphQL cursors sometimes.

```graphql
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  cursor: String!
  node: User!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}
```

```javascript
function buildPage(rows, encodeCursor, hasExtra) {
  const edges = rows.map((row) => ({
    cursor: encodeCursor(row),
    node: row,
  }));
  return {
    edges,
    pageInfo: {
      hasNextPage: hasExtra,
      endCursor: edges.length ? edges[edges.length - 1].cursor : null,
    },
  };
}
```

#### Key Points

- Connections decouple pagination from raw lists.
- Cursors should encode sort state.
- Relay clients expect this shape for `usePaginationFragment`.

#### Best Practices

- Implement both `hasNextPage` and stable cursors.
- Document max `first`.
- Test empty pages and single-page results.

#### Common Mistakes

- Incorrect `hasNextPage` when using LIMIT n+1 pattern wrong.
- Encoding cursors that break when data updates mid-pagination.
- Exposing raw SQL offsets as cursors.

---

### 5.7.2 Filtering Strategy

#### Beginner

Centralize filters in **input types**; map to DB or search indexes. Avoid ad-hoc string query params duplicated across fields.

#### Intermediate

**Composable filters**: AND/OR trees (`BooleanExpression`). **Full-text** separate from facet filters. **Saved views** might be stored server-side and referenced by id.

#### Expert

**Search-after** patterns for Elasticsearch; **predicate pushdown** for SQL. **Multi-tenant** filters injected from context, not client args. **GraphQL caching** struggles with highly variable filters—prefer CDN for public read models sparingly.

```graphql
input UserFilter {
  and: [UserFilter!]
  or: [UserFilter!]
  roleEq: Role
  createdAfter: DateTime
}
```

```javascript
function compileUserFilter(f) {
  if (!f) return {};
  if (f.and) return { $and: f.and.map(compileUserFilter) };
  if (f.or) return { $or: f.or.map(compileUserFilter) };
  return { role: f.roleEq, createdAt: { $gte: f.createdAfter } };
}
```

#### Key Points

- Structured filters are safer than raw strings.
- Boolean trees need depth limits.
- Tenant scoping belongs in the service layer.

#### Best Practices

- Index fields matching equality filters.
- Offer `sort` enums, not arbitrary strings.
- Version filters when semantics change.

#### Common Mistakes

- Allowing OR trees without complexity caps.
- Trusting client-provided tenant ids.
- Filters that bypass authorization shortcuts.

---

### 5.7.3 Search Implementation

#### Beginner

Expose `searchPosts(query: String!): [Post!]!` backed by SQL `ILIKE`, trigram, or a search engine.

#### Intermediate

Debounce client input; **highlight** snippets via additional fields; **typo tolerance** from OpenSearch fuzzy queries.

#### Expert

**Faceted search** returns aggregates in extensions or sibling fields. **Personalization** reranks with feature stores. **Security**: row-level security applied after search hits.

```graphql
type SearchResult {
  posts: [Post!]!
  facets: [FacetBucket!]!
}

type FacetBucket {
  tag: String!
  count: Int!
}
```

```javascript
async function searchPosts(_root, { query }, ctx) {
  const hits = await ctx.opensearch.search({
    index: "posts",
    q: query,
    size: 25,
  });
  return hits.ids.map((id) => ctx.loaders.postById.load(id));
}
```

#### Key Points

- Search is part query language, part ranking problem.
- GraphQL should return domain objects, not raw Lucene hits.
- Pagination on search often uses cursors tied to scores (tricky).

#### Best Practices

- Sanitize and length-limit query strings.
- Timeout upstream search calls.
- Return consistent empty states.

#### Common Mistakes

- SQL LIKE on unindexed columns at scale.
- Returning huge highlight HTML without escaping.
- No pagination on search results.

---

### 5.7.4 Sorting Implementation

#### Beginner

Argument `sort: PostSort = NEWEST` enum. Map to `ORDER BY` columns.

#### Intermediate

**Multi-column sort** via input: `sort: [{ field: CREATED_AT, dir: DESC }, { field: ID, dir: ASC }]`.

#### Expert

**Allowlist** columns to prevent SQL injection via sort keys. **Stable sorts** mandatory for pagination. **Index alignment**: sort fields must match composite indexes.

```graphql
enum PostSortField {
  CREATED_AT
  TITLE
  VIEWS
}
enum SortDirection {
  ASC
  DESC
}

input PostSort {
  field: PostSortField!
  direction: SortDirection!
}
```

```javascript
const ALLOWED = {
  CREATED_AT: "created_at",
  TITLE: "title",
  VIEWS: "views",
};

function orderByClause(sort) {
  return sort.map((s) => ({
    column: ALLOWED[s.field],
    dir: s.direction === "ASC" ? "asc" : "desc",
  }));
}
```

#### Key Points

- Never pass client sort keys directly to SQL.
- Tie-break with primary key.
- Document default order.

#### Best Practices

- Add DB indexes for popular sorts.
- Keep enums updated with schema migrations.
- Test ascending/descending boundary rows.

#### Common Mistakes

- Dynamic `ORDER BY ${userInput}`.
- Unstable sort causing pagination bugs.
- Sorting on computed fields without DB support.

---

### 5.7.5 Full-Text Search

#### Beginner

Dedicated fields or root query using inverted indexes (Postgres `tsvector`, Elasticsearch).

#### Intermediate

GraphQL can expose `searchScore: Float` on a wrapper type. **Stemming**, **stop words**, and **language** parameters as arguments.

#### Expert

**Highlighting** fragments, **suggest** APIs (`didYouMean`), **synonym sets** maintained offline. **Access control** filtering search results post-query.

```graphql
type ScoredPost {
  score: Float!
  post: Post!
}

type Query {
  fullTextPosts(q: String!, lang: String = "en"): [ScoredPost!]!
}
```

```javascript
async function fullTextPosts(_root, { q, lang }, ctx) {
  return ctx.db.query(
    `
    SELECT p.*, ts_rank_cd(search_vector, plainto_tsquery($1, $2)) AS score
    FROM posts p
    WHERE search_vector @@ plainto_tsquery($1, $2)
    ORDER BY score DESC
    LIMIT 50
  `,
    [lang, q]
  );
}
```

#### Key Points

- Full-text differs from substring `LIKE` in relevance ranking.
- Language settings affect tokenization.
- Scores are approximate—clients should not rely on exact values long-term.

#### Best Practices

- Rebuild indexes on content updates (async jobs).
- Offer minimal q length (e.g., 2+ chars) to avoid heavy scans.
- Monitor slow queries.

#### Common Mistakes

- Mixing fuzzy search expectations with exact SQL filters.
- Not updating search vectors on edits.
- Leaking private posts into public indexes.

---

*End of GraphQL Queries notes (Topic 5).*
