# GraphQL Input Types

## 📑 Table of Contents

- [12.1 Input Type Fundamentals](#121-input-type-fundamentals)
  - [12.1.1 Input Type Definition](#1211-input-type-definition)
  - [12.1.2 Input Fields](#1212-input-fields)
  - [12.1.3 Input Type Usage](#1213-input-type-usage)
  - [12.1.4 vs Object Types](#1214-vs-object-types)
  - [12.1.5 Input Type Naming](#1215-input-type-naming)
- [12.2 Input Type Features](#122-input-type-features)
  - [12.2.1 Nested Input Types](#1221-nested-input-types)
  - [12.2.2 List Input Fields](#1222-list-input-fields)
  - [12.2.3 Optional Input Fields](#1223-optional-input-fields)
  - [12.2.4 Default Values](#1224-default-values)
  - [12.2.5 Input Validation](#1225-input-validation)
- [12.3 Input Patterns](#123-input-patterns)
  - [12.3.1 Mutation Input Pattern](#1231-mutation-input-pattern)
  - [12.3.2 Filter Input Pattern](#1232-filter-input-pattern)
  - [12.3.3 Sort Input Pattern](#1233-sort-input-pattern)
  - [12.3.4 Pagination Input](#1234-pagination-input)
  - [12.3.5 Search Input](#1235-search-input)
- [12.4 Input Type Validation](#124-input-type-validation)
  - [12.4.1 Type Validation](#1241-type-validation)
  - [12.4.2 Field Validation](#1242-field-validation)
  - [12.4.3 Custom Validators](#1243-custom-validators)
  - [12.4.4 Error Handling](#1244-error-handling)
  - [12.4.5 Validation Messages](#1245-validation-messages)
- [12.5 Advanced Input Types](#125-advanced-input-types)
  - [12.5.1 Input Type Inheritance](#1251-input-type-inheritance)
  - [12.5.2 Input Type Composition](#1252-input-type-composition)
  - [12.5.3 Polymorphic Inputs](#1253-polymorphic-inputs)
  - [12.5.4 Input Type Versioning](#1254-input-type-versioning)
  - [12.5.5 Dynamic Inputs](#1255-dynamic-inputs)

---

## 12.1 Input Type Fundamentals

### 12.1.1 Input Type Definition

#### Beginner

An **input type** is a GraphQL type used only as an argument value. You declare it with the `input` keyword. Input types group related fields (like a form) so mutations and queries stay readable: one argument instead of many loose scalars.

#### Intermediate

The GraphQL specification restricts input types: fields must be **input types** (scalars, enums, or other input types). You cannot put `Object` types or fields with arguments inside `input`. This keeps values JSON-serializable and validation predictable before resolvers run.

#### Expert

Input types are part of the type system, not runtime objects. Introspection exposes `__Type.kind` as `INPUT_OBJECT`. Code-first frameworks map classes or builder APIs to SDL `input`. Circular input references are forbidden in the spec; implementations should reject self-referential input definitions.

```graphql
input CreateUserInput {
  email: String!
  displayName: String
}
```

```javascript
import { buildSchema } from "graphql";

const schemaSDL = `
  input CreateUserInput {
    email: String!
    displayName: String
  }
  type Mutation {
    createUser(input: CreateUserInput!): User!
  }
  type User {
    id: ID!
    email: String!
    displayName: String
  }
`;

const schema = buildSchema(schemaSDL);
console.log(schema.getType("CreateUserInput").getFields().email.type.toString());
// String!
```

#### Key Points

- `input` types exist only for argument positions.
- Fields on inputs cannot be resolved; they are plain data carriers.
- SDL `input` is the contract between client variables and server validation.

#### Best Practices

- Name inputs with a domain noun plus `Input` (for example `UpdatePostInput`).
- Keep one primary input per mutation when the action is cohesive.
- Document inputs with string descriptions in SDL for tools like GraphiQL.

#### Common Mistakes

- Declaring the same shape as both `type` and `input` and drifting them out of sync.
- Trying to reuse an `Object` type where an `input` is required.
- Omitting `!` on required fields and then validating manually in every resolver.

---

### 12.1.2 Input Fields

#### Beginner

**Input fields** are the named properties inside an `input`. Each has a type, which can be a scalar (`String`, `Int`), an enum, a nested `input`, or lists of those. Required fields use `!`; optional fields omit it.

#### Intermediate

Field order in SDL is not semantically meaningful, but tooling may display fields in declaration order. Lists can be non-null elements (`[String!]!`) or allow nulls (`[String]`) with different coercion rules. Default values attach to the field, not the type.

#### Expert

Coercion: if a client omits an optional field, the variable value is `undefined` at the resolver boundary; with a default, the coerced value appears before your resolver. For `INPUT_OBJECT`, absent keys versus explicit `null` behave per GraphQL coercion rules for that field’s nullability.

```graphql
input AddressInput {
  line1: String!
  line2: String
  postalCode: String!
}
```

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  input AddressInput {
    line1: String!
    line2: String
    postalCode: String!
  }
  type Query {
    _noop: Boolean
  }
`);

async function run() {
  const result = await graphql({
    schema,
    source: `query Q($a: AddressInput!) { _noop }`,
    variableValues: { a: { line1: "1 Main", postalCode: "90210" } },
  });
  console.log(result.errors ?? "ok");
}

run();
```

#### Key Points

- Nullability on input fields controls client and coercion behavior.
- Nested inputs model structured data without JSON blobs (unless you add a custom scalar).
- Lists and scalars follow the same `!` rules as output types.

#### Best Practices

- Prefer smaller inputs over “god objects” with dozens of optional fields.
- Align field names with your persistence layer or DTO naming consistently.
- Use enums for closed sets instead of free `String` when possible.

#### Common Mistakes

- Using `[String!]` when you meant `[String!]!` and getting unexpected `null` lists.
- Duplicating field names with different casing across REST and GraphQL.
- Allowing `String` for dates instead of a dedicated scalar or ISO convention.

---

### 12.1.3 Input Type Usage

#### Beginner

You use input types as **argument types** on fields, most often on `Mutation` fields. The client sends variables: `mutation M($in: MyInput!) { create(in: $in) }`. The server receives a plain JavaScript object in the resolver’s `args`.

#### Intermediate

The same input type can be reused across multiple fields (`createPost`, `draftPost`) if the shape matches. Query fields may also take inputs (filters, pagination). Subscription fields can accept inputs for topic selection, depending on your transport and library.

#### Expert

Variable definitions use input types; inline objects in the document must still conform. For polymorphic APIs, GraphQL does not allow true input unions in the spec; patterns include separate optional fields, `String` + validation, or distinct mutations per variant.

```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
  }
}
```

```javascript
const resolvers = {
  Mutation: {
    createPost: async (_parent, { input }, ctx) => {
      const { title, body, authorId } = input;
      return ctx.db.posts.insert({ title, body, authorId });
    },
  },
};
```

#### Key Points

- Inputs travel as JSON in the `variables` map of the HTTP body.
- Resolver `args.input` is already coerced to the shape implied by the schema.
- Reuse inputs to avoid schema duplication.

#### Best Practices

- Pass the whole `input` object to a service layer; avoid destructuring-only resolvers for complex flows.
- Version heavy payloads via new input types or fields, not silent behavior changes.
- Log validation failures with field paths, not full PII payloads.

#### Common Mistakes

- Expecting class instances in resolvers; you get plain objects.
- Using stringified JSON in a `String` field instead of structured inputs.
- Forgetting `!` on the argument so clients can omit the entire input object incorrectly.

---

### 12.1.4 vs Object Types

#### Beginner

**Object types** (`type User`) describe what you can **read** from the API: fields may have resolvers and arguments. **Input types** describe what you can **send in**: no resolvers, no field arguments, only input-typed fields.

#### Intermediate

You often mirror similar names (`User` vs `UserInput`) but they are unrelated types in the schema. Adding a computed field on `User` does not affect `UserInput`. This separation keeps write payloads smaller and avoids exposing internal implementation fields on inputs.

#### Expert

Some code-first tools let you share TypeScript types; at the GraphQL layer they still compile to distinct SDL. Federation and schema stitching must align input names across subgraphs if the same operation is merged; collisions require renaming or namespaces.

```graphql
type User {
  id: ID!
  email: String!
  createdAt: String!
}

input RegisterUserInput {
  email: String!
  password: String!
}
```

```javascript
// Object type field can have args; input fields cannot.
const typeDefs = `#graphql
  type User {
    id: ID!
    posts(limit: Int = 10): [Post!]!
  }
  input UserFilterInput {
    emailContains: String
  }
`;
```

#### Key Points

- Output types: resolvers, arguments on fields, interfaces.
- Input types: data-only, nestable, JSON-friendly.
- Naming similarity is convention, not inheritance.

#### Best Practices

- Do not expose database primary keys on create inputs if the server generates them.
- Return rich `User` objects from mutations while accepting slim `UserInput`.
- Document why output-only fields (for example `fullName`) are not on the input.

#### Common Mistakes

- Using `type` in an argument position (invalid SDL).
- Assuming `UserInput` automatically implements or extends `User`.
- Putting resolver logic on “input resolvers” (not a GraphQL concept).

---

### 12.1.5 Input Type Naming

#### Beginner

Common convention: **`VerbNounInput`** or **`NounActionInput`** (`CreateUserInput`, `UserUpdateInput`). The suffix `Input` signals GraphQL clients and reviewers that the type is for arguments only.

#### Intermediate

For filters, names like `UserFilter`, `UserWhereInput`, or `UserSearchCriteria` are common in different ecosystems (Hasura-style `where`, Prisma-style filters). Pick one style per API and document it in your style guide.

#### Expert

In large organizations, prefix with domain (`BillingInvoiceInput`) to avoid clashes when schemas are merged. Avoid version numbers in type names unless you support parallel major API versions (`CreateUserV2Input`).

```graphql
input CreateOrderInput {
  lineItems: [OrderLineInput!]!
}

input OrderLineInput {
  sku: String!
  quantity: Int!
}
```

```javascript
// eslint-plugin-graphql or custom lint: enforce *Input suffix
const forbidden = /^[A-Z][a-zA-Z0-9]*$/; // without Input — flag in CI
```

#### Key Points

- Consistent naming improves codegen (Relay, Apollo) and discoverability.
- Group related inputs with shared prefixes (`PostCreate`, `PostUpdate`).
- Avoid abbreviations that are unclear outside your team.

#### Best Practices

- Match mutation name to input role: `updateUser(input: UpdateUserInput!)`.
- Use singular nouns for the entity inside the input name.
- Run schema lint (graphql-eslint) for naming rules.

#### Common Mistakes

- Naming inputs `User` or `UserDTO` and confusing them with output types.
- Inconsistent past tense (`CreatedUserInput` vs `CreateUserInput`).
- Overly generic names (`PayloadInput`, `DataInput`).

---

## 12.2 Input Type Features

### 12.2.1 Nested Input Types

#### Beginner

Inputs can contain **other inputs** as fields. That lets you model addresses, metadata, or line items as reusable structures instead of flattening (`shippingLine1`, `billingLine1`).

#### Intermediate

Nesting depth is unlimited in principle, but deep trees hurt readability and validation errors. Some teams cap depth in lint rules. Each nested input follows the same coercion and nullability rules as the parent.

#### Expert

Circular references (`input A { b: B } input B { a: A }`) are invalid in GraphQL. If you need graphs, use IDs and validate relationships in resolvers, or use a JSON scalar with a JSON Schema validator (trade-offs apply).

```graphql
input ShippingInput {
  address: AddressInput!
  method: DeliveryMethod!
}

input AddressInput {
  city: String!
  country: String!
}
```

```javascript
function validateShipping(input) {
  if (!input.address?.city) {
    throw new Error("address.city required");
  }
  return input;
}
```

#### Key Points

- Nested inputs compose like value objects.
- Still no cycles in the input type graph.
- Good fit for “rich” create/update payloads.

#### Best Practices

- Extract repeated nested shapes into named inputs.
- Keep nesting aligned with your domain model, not your ORM graph.
- Unit-test coercion with partial variables.

#### Common Mistakes

- Mirroring ORM relation graphs one-to-one into inputs (over-fetching write complexity).
- Using nested inputs for polymorphic variants without a clear discriminator.

---

### 12.2.2 List Input Fields

#### Beginner

A field can be a **list** of scalars or inputs: `[ID!]`, `[TagInput!]`. Order may matter for operations like “reorder steps”; document semantics in the field description.

#### Intermediate

`[String!]!` means the list itself cannot be null and no element may be null. `[String]!` allows null elements but not a null list. Clients using variables must send JSON arrays.

#### Expert

Empty lists `[]` are valid when the list is not required to be non-empty; business rules (“at least one tag”) belong in resolver or directive validation. For large batches, consider dedicated bulk mutations with pagination or streaming.

```graphql
input BulkArchiveInput {
  ids: [ID!]!
}
```

```javascript
const resolvers = {
  Mutation: {
    bulkArchivePosts: async (_, { input }, ctx) => {
      const { ids } = input;
      if (ids.length === 0) {
        throw new Error("ids must not be empty");
      }
      await ctx.db.posts.archiveMany(ids);
      return { archivedCount: ids.length };
    },
  },
};
```

#### Key Points

- List nullability is independent from element nullability.
- JSON arrays map directly to GraphQL lists.
- Validate min/max length when the domain requires it.

#### Best Practices

- Cap maximum list size to prevent abuse.
- Return per-item errors for partial failures in bulk operations.
- Use `ID` lists for referencing existing entities.

#### Common Mistakes

- Allowing unbounded arrays from public clients.
- Using lists for maps; prefer keyed inputs or JSON with clear schema.

---

### 12.2.3 Optional Input Fields

#### Beginner

Fields **without** `!` are optional: the client may omit them. Optional often means “do not change this attribute” on updates (PATCH-style semantics) when you interpret absence that way in code.

#### Intermediate

Distinguish **omitted** versus **explicit null** when using variables: for optional nullable fields, `null` can mean “clear the value” if your resolver implements that. Document the behavior per field.

#### Expert

Optional fields complicate caching and codegen defaults. Some APIs use a wrapper input or sentinel to express three states: unset, set-to-null, set-to-value. GraphQL alone does not encode “unset” inside a scalar.

```graphql
input UpdateProfileInput {
  displayName: String
  bio: String
}
```

```javascript
async function updateProfile(userId, input) {
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(input, "displayName")) {
    patch.displayName = input.displayName;
  }
  if (Object.prototype.hasOwnProperty.call(input, "bio")) {
    patch.bio = input.bio;
  }
  return db.users.update(userId, patch);
}
```

#### Key Points

- Optional does not mean “nullable output”; it is about input presence.
- PATCH semantics need explicit handling in resolvers.
- Use descriptions to clarify null vs omit.

#### Best Practices

- Use `hasOwnProperty` or a small helper to detect omitted keys after coercion.
- Consider `UpdateUserInput` with required `id` and optional other fields.
- Integration-test all three states for critical fields.

#### Common Mistakes

- Treating missing field as “clear to null” without documenting it.
- Using `undefined` in manual JSON posts inconsistently with variables.

---

### 12.2.4 Default Values

#### Beginner

Input fields may specify **defaults** in SDL: `pageSize: Int = 20`. When the client omits the field, the server uses the default during coercion.

#### Intermediate

Defaults apply per field inside an input object when that input is provided. If the entire input object is omitted, field defaults may not apply unless the argument itself has a default or the input is required—check coercion rules for your server version and tests.

#### Expert

Variable default values in operations (`$size: Int = 10`) are separate from schema defaults on input fields. Combining both requires mental clarity: operation defaults apply when the variable is not provided; schema defaults apply when the field is missing inside a provided input object.

```graphql
input ListUsersInput {
  page: Int = 1
  pageSize: Int = 20
  sort: UserSort = CREATED_AT_DESC
}
```

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  enum UserSort { CREATED_AT_DESC NAME_ASC }
  input ListUsersInput {
    page: Int = 1
    pageSize: Int = 20
    sort: UserSort = CREATED_AT_DESC
  }
  type Query {
    users(input: ListUsersInput): Int
  }
`);

// Resolver receives coerced input with defaults filled
```

#### Key Points

- Defaults reduce boilerplate for clients.
- Enums and scalars can have defaults.
- Document breaking changes when changing defaults.

#### Best Practices

- Prefer safe defaults (reasonable page size, stable sort).
- Regression-test default changes; they alter behavior for existing clients.
- Align defaults with database indexes for performance.

#### Common Mistakes

- Assuming defaults apply when the parent `input` argument was never passed.
- Using defaults to fix validation holes instead of explicit validation.

---

### 12.2.5 Input Validation

#### Beginner

**Validation** ensures the data is sensible: email format, positive quantity, allowed enum value. GraphQL guarantees types and required fields; business rules run in middleware, directives, or resolvers.

#### Intermediate

Validate as early as possible: custom scalars (for example `Email`), schema directives (`@constraint` in some servers), or a shared function per mutation. Returning `GraphQLError` with `extensions` improves client UX.

#### Expert

Consider a validation pipeline: parse → variable coercion → auth → domain validation → persistence. For Node, libraries like `zod` or `joi` map well from coerced input objects. Align error codes with your API’s error catalog.

```javascript
import { GraphQLError } from "graphql";
import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(130).optional(),
});

function validateCreateUser(input) {
  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) {
    throw new GraphQLError("Invalid input", {
      extensions: { code: "BAD_USER_INPUT", issues: parsed.error.issues },
    });
  }
  return parsed.data;
}
```

#### Key Points

- Type validation is automatic; domain validation is your code.
- Rich `extensions` help clients show field-level errors.
- Keep validation logic testable outside resolvers.

#### Best Practices

- One validator module per bounded context.
- Never trust client input for authorization; validate permissions separately.
- Rate-limit expensive validation paths.

#### Common Mistakes

- Duplicating the same regex in ten resolvers.
- Returning generic “Bad Request” without structured details.
- Validating only in the database and leaking DB errors to clients.

---

## 12.3 Input Patterns

### 12.3.1 Mutation Input Pattern

#### Beginner

The dominant pattern is a single **`input` argument** per mutation: `createUser(input: CreateUserInput!)`. It scales when you add optional fields without changing the positional argument list.

#### Intermediate

Return a **payload type** (`CreateUserPayload`) with `user`, `errors`, or a union for result/error. The input pattern pairs cleanly with Relay-style mutations and Apollo codegen.

#### Expert

For idempotency, add `clientMutationId` or a dedicated `idempotencyKey` field inside the input. Document transaction boundaries: one mutation field should map to one business transaction when possible.

```graphql
type Mutation {
  createComment(input: CreateCommentInput!): CreateCommentPayload!
}

input CreateCommentInput {
  postId: ID!
  body: String!
}

type CreateCommentPayload {
  comment: Comment
  query: Query
}
```

```javascript
const resolvers = {
  Mutation: {
    createComment: async (_, { input }, ctx) => {
      const comment = await ctx.comments.create(input);
      return { comment, query: {} };
    },
  },
  CreateCommentPayload: {
    query: () => ({}),
  },
};
```

#### Key Points

- Single `input` argument is the industry default.
- Payload types support flexible responses and client cache updates.
- Keys inside input support tracing and deduplication.

#### Best Practices

- Name mutation and input consistently (`archiveOrder` / `ArchiveOrderInput`).
- Return the modified object and any useful metadata.
- Avoid many top-level scalar arguments on new APIs.

#### Common Mistakes

- Splitting create APIs across ten root arguments.
- Omitting payload wrapper and blocking cache normalization patterns.

---

### 12.3.2 Filter Input Pattern

#### Beginner

**Filter inputs** describe how to narrow a list query: status, date range, owner. They are ordinary `input` types used as query arguments.

#### Intermediate

Model filters as optional fields combined with AND semantics by default. For OR/NOT, nested `input` types (`BooleanFilter`, `DateRangeFilter`) keep the schema explicit.

#### Expert

Large filter surfaces risk performance issues. Add server-side limits, require indexes for high-cardinality filters, and log slow queries. Consider cursor-based pagination instead of deep offset filters.

```graphql
input PostFilterInput {
  published: Boolean
  authorId: ID
  tagSlugs: [String!]
  createdAfter: String
  createdBefore: String
}

type Query {
  posts(filter: PostFilterInput, first: Int, after: String): PostConnection!
}
```

```javascript
function buildPostWhere(filter = {}) {
  const where = {};
  if (filter.published !== undefined) where.published = filter.published;
  if (filter.authorId) where.authorId = filter.authorId;
  if (filter.tagSlugs?.length) where.tags = { hasSome: filter.tagSlugs };
  return where;
}
```

#### Key Points

- Filters compose with pagination arguments.
- Explicit SDL beats opaque `JSON` for discoverability.
- AND-composition is easiest for clients to reason about.

#### Best Practices

- Document whether filters are case-sensitive.
- Whitelist filterable fields to avoid arbitrary column access.
- Add integration tests for combined filters.

#### Common Mistakes

- Accepting raw SQL fragments or unbounded `String` filters.
- Implicit OR across all fields without documentation.

---

### 12.3.3 Sort Input Pattern

#### Beginner

Sorting can be an **enum** (`SortOrder: ASC, DESC`) plus a field enum (`UserSortField`), or a list of sort keys for multi-key sorts.

#### Intermediate

A single input `orderBy: [UserOrderBy!]` where `input UserOrderBy { field: UserSortField!, direction: SortOrder! }` supports stable sorts (for example `createdAt DESC, id ASC`).

#### Expert

Ensure sort fields map to indexed columns. Expose only safe fields—no sorting by unindexed JSON blobs on huge tables. For keyset pagination, sort inputs must align with the cursor encoding.

```graphql
enum PostOrderField {
  CREATED_AT
  TITLE
  VIEWS
}

enum OrderDirection {
  ASC
  DESC
}

input PostOrderInput {
  field: PostOrderField!
  direction: OrderDirection!
}
```

```javascript
const ORDER_COLUMN = {
  CREATED_AT: "created_at",
  TITLE: "title",
  VIEWS: "view_count",
};

function orderClause(order) {
  const col = ORDER_COLUMN[order.field];
  const dir = order.direction === "ASC" ? "ASC" : "DESC";
  return { column: col, direction: dir };
}
```

#### Key Points

- Enums prevent arbitrary sort strings.
- Multi-field order improves determinism.
- Sort and cursor pagination must stay consistent.

#### Best Practices

- Add a deterministic tie-breaker (often `id`).
- Reject deprecated sort fields with clear errors.
- Monitor queries using expensive sorts.

#### Common Mistakes

- Allowing `String` sort keys from clients (injection risk in bad adapters).
- Changing default sort without versioning (surprising UI ordering).

---

### 12.3.4 Pagination Input

#### Beginner

Pagination inputs often include **`first`/`after`** (cursor) or **`limit`/`offset`**. GraphQL Cursor Connections Specification uses `first`, `after`, `last`, `before` with a `Connection` type.

#### Intermediate

Combine pagination with filter and sort inputs. Document maximum `first`. Cursor values should be opaque base64 strings encoding sort keys and id.

#### Expert

Offset pagination degrades on large tables; cursors with keyset queries scale better. If you must support offset for legacy clients, gate it and warn in docs.

```graphql
input PageInput {
  first: Int = 20
  after: String
}
```

```javascript
function decodeCursor(cursor) {
  if (!cursor) return null;
  const json = Buffer.from(cursor, "base64url").toString("utf8");
  return JSON.parse(json);
}

function encodeCursor(row) {
  return Buffer.from(
    JSON.stringify({ createdAt: row.createdAt, id: row.id }),
    "utf8"
  ).toString("base64url");
}
```

#### Key Points

- Cursor + consistent sort avoids skipped/duplicate rows when data changes.
- Cap `first` to protect the database.
- Connection pattern is widely understood by GraphQL clients.

#### Best Practices

- Return `PageInfo` with `hasNextPage` and `endCursor`.
- Validate `first` <= max in one shared helper.
- Test pagination with concurrent writes.

#### Common Mistakes

- Using offset for chat or live feeds.
- Cursors that omit tie-breaker fields (unstable pages).

---

### 12.3.5 Search Input

#### Beginner

**Search inputs** carry a query string, optional language, facets, and mode (`FUZZY`, `EXACT`). They are still structured `input` types, not only a single `String`.

#### Intermediate

Debounce search on the client; on the server, enforce minimum query length and use full-text engines (Elasticsearch, Postgres `tsvector`) behind the resolver.

#### Expert

Highlighting, typo tolerance, and ranking are implementation details—return a stable result type (`SearchHit` with `score`, `highlights`). Rate-limit anonymous search; log queries without storing PII if policy requires.

```graphql
input SearchPostsInput {
  query: String!
  locale: String = "en"
  facets: [String!]
}

type SearchPostsResult {
  edges: [SearchPostEdge!]!
  totalCount: Int!
}

type SearchPostEdge {
  node: Post!
  score: Float!
}
```

```javascript
async function searchPosts(input, ctx) {
  if (input.query.trim().length < 2) {
    return { edges: [], totalCount: 0 };
  }
  const hits = await ctx.search.searchPosts(input);
  return hits;
}
```

#### Key Points

- Treat search as its own domain with inputs and result types.
- Combine with pagination for large result sets.
- Sanitize query strings before logging.

#### Best Practices

- Return empty results for trivial queries instead of errors.
- Use consistent ranking explanations in documentation.
- Cache popular searches if safe.

#### Common Mistakes

- Running `LIKE '%term%'` on huge tables without indexes.
- Exposing raw search engine errors to clients.

---

## 12.4 Input Type Validation

### 12.4.1 Type Validation

#### Beginner

**Type validation** happens automatically: `Int` must be a number, `Boolean` true/false, enums must match a known value. Wrong types produce GraphQL errors before your resolver runs.

#### Intermediate

Custom scalars extend type validation with `parseValue` and `parseLiteral`. Lists and non-null modifiers add further checks (`null` not allowed for `String!`).

#### Expert

Coercion rules are in the GraphQL spec; edge cases include large integers beyond JS safe integer range—consider `String` IDs or custom scalars for 64-bit integers.

```graphql
input ExampleInput {
  count: Int!
  flag: Boolean!
}
```

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  input ExampleInput { count: Int!, flag: Boolean! }
  type Query { ex(i: ExampleInput!): String }
`);

graphql({
  schema,
  source: `query Q($i: ExampleInput!) { ex(i: $i) }`,
  variableValues: { i: { count: "5", flag: true } },
}).then((r) => console.log(r.errors?.[0]?.message));
// Int cannot represent non-integer value: "5"
```

#### Key Points

- Type errors are standardized GraphQL errors.
- Resolvers receive coerced types when validation passes.
- Custom scalars tighten domain validity.

#### Best Practices

- Prefer `ID` for identifiers even if they are numeric in the database.
- Add custom scalars for money, dates, and URLs.
- Test invalid variable payloads in CI.

#### Common Mistakes

- Relying on `Int` for 64-bit Twitter-style IDs in JavaScript without string encoding.
- Swallowing type errors in middleware and returning 500.

---

### 12.4.2 Field Validation

#### Beginner

**Field validation** checks individual fields: min/max length, ranges, formats. GraphQL does not ship built-in min/max for strings; you implement these in code or directives.

#### Intermediate

Map validation errors to GraphQL paths (`["input", "email"]`) using `GraphQLError`’s `path` and `extensions.suberrors` patterns your clients understand.

#### Expert

For multi-field constraints (“endDate after startDate”), validate at the object level after per-field checks. Consider a small DSL or shared schema between OpenAPI and GraphQL for parity.

```javascript
function validateDateRange(input) {
  if (input.start && input.end && input.end < input.start) {
    throw new GraphQLError("end must be >= start", {
      extensions: { code: "BAD_USER_INPUT", fields: ["end", "start"] },
    });
  }
}
```

#### Key Points

- Field-level errors are easiest for UI forms.
- Cross-field rules need explicit tests.
- Align error shape with frontend form libraries.

#### Best Practices

- Centralize string length limits with constants.
- Use ICU or validators for internationalized formats.
- Never leak stack traces in production errors.

#### Common Mistakes

- Validating only in the browser.
- Different error shapes per mutation.

---

### 12.4.3 Custom Validators

#### Beginner

A **custom validator** is a function `(input) => void` or returns a result type, invoked from resolver or middleware. It keeps resolvers thin.

#### Intermediate

Compose validators: `pipe(validateShape, validateBusinessRules)`. Pure validators are easy to unit test without spinning up GraphQL.

#### Expert

Integrate with schema directives: a directive `@email` on input field definitions can attach metadata that a wrapping resolver or `graphql-middleware` uses to run the right checks.

```javascript
const validators = {
  createUser(input) {
    if (input.password.length < 10) {
      throw new GraphQLError("Password too short", {
        extensions: { field: "password", code: "WEAK_PASSWORD" },
      });
    }
  },
};

const resolvers = {
  Mutation: {
    createUser: async (_, { input }, ctx) => {
      validators.createUser(input);
      return ctx.users.create(input);
    },
  },
};
```

#### Key Points

- Validators encode domain rules once.
- Directive-driven validation keeps SDL declarative.
- Test validators independently.

#### Best Practices

- Return structured issues for bulk operations.
- Version validators with feature flags when rolling out stricter rules.
- Document which errors are retryable.

#### Common Mistakes

- Throwing string errors instead of `GraphQLError`.
- Validators that hit the database without batching (N+1 validation).

---

### 12.4.4 Error Handling

#### Beginner

Throw **`GraphQLError`** (or your framework’s equivalent) with a message clients can show. Put machine-readable codes in `extensions`.

#### Intermediate

Distinguish **user errors** (4xx-like, bad input) from **system errors** (5xx-like). Log the latter with correlation IDs; sanitize messages for clients.

#### Expert

Apollo Federation and gateways may aggregate errors from subgraphs; preserve `extensions` and `path` for tracing. For mutations, consider returning a union or errors array in the payload for partial success patterns.

```javascript
import { GraphQLError } from "graphql";

function badInput(message, extensions) {
  throw new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT", ...extensions },
  });
}
```

#### Key Points

- One request can yield multiple errors in the `errors` array.
- `path` ties errors to document locations.
- Extensions carry codes for client branching.

#### Best Practices

- Standardize `extensions.code` across the API.
- Use internationalization keys in extensions, not hard-coded English in apps.
- Monitor error rates by code.

#### Common Mistakes

- Returning validation messages with internal SQL details.
- Using HTTP 200 with errors (valid in GraphQL) but forgetting clients must read `errors`.

---

### 12.4.5 Validation Messages

#### Beginner

**Messages** should be short, actionable, and safe to display (“Email already registered”). Avoid blaming the user; state what to fix.

#### Intermediate

Pair messages with **stable codes** (`EMAIL_TAKEN`) so clients translate or map to UI. Include `field` or `argument` in extensions for form binding.

#### Expert

For public APIs, document the error catalog. Consider RFC 7807-style problem details inside `extensions` for consistency with REST gateways.

```javascript
throw new GraphQLError("Email is already in use", {
  extensions: {
    code: "EMAIL_TAKEN",
    field: "email",
    hint: "Try signing in or use password reset.",
  },
});
```

#### Key Points

- Humans read messages; machines read codes.
- Consistency across mutations reduces client complexity.
- Localization belongs in the client when possible.

#### Best Practices

- Avoid leaking whether an email exists if policy requires ambiguity.
- Keep messages under a reasonable length for mobile toasts.
- Snapshot-test error payloads for critical flows.

#### Common Mistakes

- Changing message text every deploy (breaks client string matching).
- No codes, only free-form English.

---

## 12.5 Advanced Input Types

### 12.5.1 Input Type Inheritance

#### Beginner

GraphQL **does not support** `input` inheritance (`extends`) in the specification. You cannot declare `input B extends A`.

#### Intermediate

Workarounds: **composition** (embed `A` as a field inside `B`), codegen templates, or duplicate fields with lint to keep copies synchronized.

#### Expert

Some tools or experimental specs discuss input unions or spread syntax; rely only on what your production server implements. For shared “base” fields, use a shared nested `input` (`input AuditedInput { createdBy: ID }` nested in others).

```graphql
input BaseAuditInput {
  reason: String
}

input DeleteCommentInput {
  id: ID!
  audit: BaseAuditInput
}
```

```javascript
function mergeAudit(target, audit) {
  return { ...target, reason: audit?.reason ?? null };
}
```

#### Key Points

- No `extends` for inputs in standard GraphQL.
- Composition and nesting replace inheritance.
- Codegen can reduce duplication pain.

#### Best Practices

- Name nested base inputs clearly (`AuditMetadataInput`).
- Document why fields repeat if you must duplicate.
- Avoid macros that obscure the public schema.

#### Common Mistakes

- Assuming parity with TypeScript `extends` in SDL.
- Deep nesting without flattening at the service boundary.

---

### 12.5.2 Input Type Composition

#### Beginner

**Composition** means building bigger inputs from smaller ones: `OrderInput { customer: CustomerInput!, lines: [LineInput!]! }`. Each piece is reusable and testable.

#### Intermediate

Align composition boundaries with bounded contexts: billing inputs separate from shipping inputs, composed in `CheckoutInput`.

#### Expert

For optional composition, use nullable nested inputs or empty objects. Watch for validation order: validate children before parent aggregates (totals, taxes).

```graphql
input CustomerInput {
  name: String!
  email: String!
}

input CheckoutInput {
  customer: CustomerInput!
  shippingAddress: AddressInput!
  billingAddress: AddressInput
}
```

```javascript
async function checkout(input) {
  await validateCustomer(input.customer);
  await validateAddress(input.shippingAddress);
  if (input.billingAddress) {
    await validateAddress(input.billingAddress);
  }
  // ...
}
```

#### Key Points

- Composition improves reuse and clarity.
- Validates cleanly in layers.
- Matches domain language well.

#### Best Practices

- Keep nested inputs shallow enough for GraphiQL users.
- Reuse the same `AddressInput` everywhere addresses appear.
- Version composed inputs as a unit when semantics change.

#### Common Mistakes

- Different `AddressInput` variants across the API for the same concept.
- Validating parent before child (worse error messages).

---

### 12.5.3 Polymorphic Inputs

#### Beginner

GraphQL has no first-class **input union** in the widely deployed spec. Polymorphic “one of several shapes” inputs use optional fields with validation (“exactly one must be set”) or separate mutations.

#### Intermediate

The **tagged union pattern**: fields `type: Enum!` plus a payload field per variant, only one populated—validated in code. Another approach: multiple mutations (`payWithCard`, `payWithWallet`).

#### Expert

Using `JSON` scalar for polymorphic payloads sacrifices type safety and introspection—use only with strong runtime schema (JSON Schema) and trust boundaries.

```graphql
input PaymentInput {
  method: PaymentMethod!
  card: CardPaymentInput
  wallet: WalletPaymentInput
}

enum PaymentMethod {
  CARD
  WALLET
}
```

```javascript
function validatePayment(input) {
  if (input.method === "CARD" && !input.card) {
    throw new GraphQLError("card required for CARD method");
  }
  if (input.method === "WALLET" && !input.wallet) {
    throw new GraphQLError("wallet required for WALLET method");
  }
}
```

#### Key Points

- Discriminator enums are the common GraphQL pattern.
- Validate mutually exclusive fields explicitly.
- Document invalid combinations clearly.

#### Best Practices

- Prefer separate mutations when variants have little overlap.
- Keep discriminator values stable for mobile clients.
- Add tests for each branch.

#### Common Mistakes

- Allowing silent precedence when multiple variant fields are set.
- Using untyped JSON for payments or PII.

---

### 12.5.4 Input Type Versioning

#### Beginner

When behavior changes, add **new fields** or **new input types** (`CreateUserInputV2`) rather than breaking existing clients. GraphQL favors evolution.

#### Intermediate

Deprecate old fields with SDL `deprecation` on arguments if your server supports it, or document sunset timelines. Track usage via analytics on operation names.

#### Expert

For strict enterprises, run multiple endpoints or gateway routing by `X-API-Version` while sharing resolvers internally. Avoid silent semantic changes to the same field name.

```graphql
input CreateUserInput {
  email: String!
  fullName: String! @deprecated(reason: "Use givenName and familyName")
  givenName: String
  familyName: String
}
```

```javascript
function normalizeCreateUser(input) {
  if (input.fullName && !input.givenName) {
    const [first, ...rest] = input.fullName.split(" ");
    return {
      ...input,
      givenName: first,
      familyName: rest.join(" ") || first,
    };
  }
  return input;
}
```

#### Key Points

- Additive changes are safe; removals are breaking.
- Deprecation warns before removal.
- Normalize legacy fields in one place.

#### Best Practices

- Communicate deprecations in release notes.
- Monitor client operations still using deprecated fields.
- Use integration tests for both old and new shapes during migration.

#### Common Mistakes

- Renaming input types without alias support in gateways.
- Breaking mobile apps that ship old queries.

---

### 12.5.5 Dynamic Inputs

#### Beginner

**Dynamic inputs** mean shapes that vary by configuration or tenant (custom fields on CRM entities). GraphQL schemas are usually static, so “dynamic” is often modeled as key-value maps or JSON.

#### Intermediate

Patterns: `[CustomFieldValueInput!]!` with `{ key, value }`, or a `JSON` scalar validated against per-tenant JSON Schema. Another pattern: introspection-driven forms backed by metadata types.

#### Expert

Balance safety versus flexibility: arbitrary JSON is powerful but weakly typed. Consider `scalar JSONObject` with server-side allowlists per key. Cache metadata queries aggressively.

```graphql
input CustomFieldValueInput {
  key: String!
  value: String
}

input UpdateRecordInput {
  id: ID!
  customFields: [CustomFieldValueInput!]
}
```

```javascript
async function validateCustomFields(tenantId, fields) {
  const allowed = await metadata.allowedKeys(tenantId);
  for (const f of fields ?? []) {
    if (!allowed.has(f.key)) {
      throw new GraphQLError(`Unknown custom field: ${f.key}`);
    }
  }
}
```

#### Key Points

- Truly dynamic user-defined fields rarely map to static SDL per tenant.
- Metadata + validated maps is the pragmatic approach.
- Allowlists prevent arbitrary key injection into storage.

#### Best Practices

- Expose metadata queries listing keys, types, and constraints.
- Version custom field definitions per tenant.
- Audit changes to definitions for compliance.

#### Common Mistakes

- Storing unchecked JSON in SQL without schema.
- Generating thousands of SDL types per tenant (operational pain).

---
