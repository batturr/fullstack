# GraphQL Interview Questions — Freshers Level (0–2 Years)

This document contains 100 foundational GraphQL interview questions with detailed answers suitable for candidates with zero to two years of experience.

---

## Q1. What is GraphQL?

**Answer:**

GraphQL is a **query language for APIs** and a **runtime** for executing those queries against your data. Unlike a database language, GraphQL describes *what* data a client needs, not *how* to fetch it from storage. A client sends a single document (often over HTTP POST) to a GraphQL server, which validates the request against a **schema** and returns JSON shaped exactly like the query.

GraphQL was designed so front-end and mobile teams can request nested, related data in one round trip without hand-writing many REST endpoints. The server exposes a **typed graph** of objects and fields; clients pick subgraphs they care about.

```graphql
query {
  user(id: "1") {
    name
    posts {
      title
    }
  }
}
```

---

## Q2. Who developed GraphQL and when?

**Answer:**

GraphQL was developed internally at **Facebook** (now Meta) and was first publicly described around **2015**. The motivation was to support Facebook’s mobile apps with flexible, efficient data loading across many product surfaces. In **2015**, Facebook open-sourced a reference implementation and began community adoption.

The project is now stewarded under the **GraphQL Foundation** (hosted by the Linux Foundation), which governs the specification and ecosystem. Knowing the origin helps interviewers see you understand GraphQL’s roots in large-scale product engineering, not only as a “REST replacement.”

---

## Q3. What problems does GraphQL solve?

**Answer:**

GraphQL addresses several common API pain points: **over-fetching** (downloading fields the UI does not need), **under-fetching** (needing multiple REST calls to assemble one screen), **rigid versioning** (many fixed endpoints per use case), and **weak typing** in ad-hoc JSON APIs.

By exposing one **schema** and letting clients specify fields, teams reduce chatter between client and server and evolve APIs with additive changes more safely. GraphQL also standardizes **errors**, **introspection**, and a **single endpoint** model, which simplifies client tooling.

```graphql
# One request can replace several REST calls for a profile page
query {
  me { id name email }
  notifications(first: 5) { id message }
}
```

---

## Q4. How is GraphQL different from REST?

**Answer:**

**REST** typically models resources with URLs and HTTP verbs (`GET /users/1`, `GET /users/1/posts`). Clients receive fixed response shapes per endpoint and often need multiple requests or custom “BFF” aggregators.

**GraphQL** uses usually **one URL** and **POST** for queries/mutations; the **shape of the response is driven by the query**, not by a fixed endpoint contract. REST is an architectural style; GraphQL is a **query language + schema**. REST can cache well on URLs; GraphQL caching is usually **smarter on the client** (normalized caches) or at the gateway.

| Aspect        | REST (typical)     | GraphQL (typical)        |
|---------------|--------------------|--------------------------|
| Data shape    | Server-defined     | Client-selected          |
| Endpoints     | Many resources     | Often one `/graphql`     |
| Versioning    | `/v1`, `/v2`       | Schema evolution         |

---

## Q5. What is a GraphQL schema?

**Answer:**

A GraphQL **schema** is the formal contract that describes **what** can be queried: **types**, **fields**, **arguments**, and **entry points** (`Query`, `Mutation`, `Subscription`). It is strongly typed; every field has a type, and nullability is explicit (`String` vs `String!`).

The schema is usually written in **SDL** (Schema Definition Language) or generated from code. Servers **reject** invalid queries at validation time. Tools and IDEs use the schema for autocomplete and codegen.

```graphql
type Query {
  book(id: ID!): Book
}

type Book {
  id: ID!
  title: String!
}
```

---

## Q6. What is a GraphQL query?

**Answer:**

A **query** is a **read-only** operation that asks the server for data. It mirrors the shape of the response: you list fields you want; the server returns JSON with the same structure. Queries are **idempotent** in spirit (they should not change server state), though the spec does not enforce HTTP caching semantics.

Queries can include **arguments**, **aliases**, **fragments**, and **variables**. The server executes resolvers field-by-field and assembles the result tree.

```graphql
query GetBook($id: ID!) {
  book(id: $id) {
    title
    author { name }
  }
}
```

---

## Q7. What is a mutation in GraphQL?

**Answer:**

A **mutation** is an operation intended to **change server-side state** (create, update, delete). Like queries, mutations are shaped like the response you want back, but they are **not** assumed to be side-effect free.

Mutations are defined under the root `Mutation` type. The server may execute fields in a defined order within a mutation (unlike parallelizable query fields—implementation-dependent). You typically return the changed object and related data so the client can update caches.

```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
  }
}
```

---

## Q8. What is a subscription in GraphQL?

**Answer:**

A **subscription** is a long-lived operation for **push updates** when data changes—often implemented over **WebSockets** or **SSE**. The client subscribes to events (e.g., `commentAdded(postId: "1")`), and the server streams payloads when events occur.

Subscriptions require **transport** and **pub/sub** infrastructure beyond a simple HTTP request/response. Not every deployment uses them; many apps still use polling or separate real-time channels.

```graphql
subscription OnMessage($roomId: ID!) {
  messageAdded(roomId: $roomId) {
    id
    text
  }
}
```

---

## Q9. What are the main components of a GraphQL system?

**Answer:**

A typical GraphQL system includes: (1) a **schema** defining types and operations; (2) a **GraphQL server** that parses, validates, and executes requests; (3) **resolvers** that fetch each field’s data; (4) **data sources** (databases, REST APIs, microservices); (5) a **client** that sends queries and caches results; and (6) optional **gateways** or **federation** for composing multiple subgraphs.

**Tooling** (GraphiQL, Apollo Sandbox, codegen) sits around this core. Understanding this split helps debug whether a bug is in validation, resolution, or the backing service.

---

## Q10. What is the GraphQL specification?

**Answer:**

The **GraphQL specification** is the authoritative document that defines the language (SDL), execution algorithm, introspection, and validation rules. Implementations in JavaScript, Java, Go, etc. **conform** to this spec so clients and servers interoperate.

The spec is versioned and maintained by the GraphQL working group. It describes *behavior*, not *transport*—HTTP mapping is a separate concern (commonly described in community best practices). When features differ between servers, checking spec compliance clarifies what is standard vs vendor-specific.

---

## Q11. What is a GraphQL endpoint?

**Answer:**

A GraphQL **endpoint** is the URL where the client sends GraphQL operations—commonly `POST https://api.example.com/graphql` with a JSON body `{ "query": "...", "variables": { } }`. Unlike REST, you rarely have one endpoint per resource; **one endpoint** serves many operations.

Some setups expose **GET** for queries (with query string) for caching/CDN scenarios, but **POST** is universal for mutations and large queries. Gateways may expose multiple endpoints for different subgraphs or environments (dev/staging/prod).

```http
POST /graphql HTTP/1.1
Content-Type: application/json

{"query":"query { __typename }"}
```

---

## Q12. What is the role of a GraphQL server?

**Answer:**

The GraphQL **server** accepts a document, **parses** it into an AST, **validates** it against the schema, **executes** the operation using resolvers, and **serializes** the result to JSON. It centralizes concerns like **authentication**, **rate limiting**, **depth/complexity limits**, and **logging**.

The server does not mandate a database; resolvers can call SQL, NoSQL, REST, or other microservices. The server’s job is orchestration and enforcing the **contract** defined by the schema.

---

## Q13. What is a GraphQL client?

**Answer:**

A GraphQL **client** is library code on the browser, mobile app, or server that **builds**, **sends**, and often **caches** GraphQL operations. Examples include **Apollo Client**, **Relay**, **urql**, and lightweight fetch wrappers.

Clients add value with **normalized caches** (store entities by ID), **deduplication** of in-flight requests, **pagination helpers**, and **devtools**. For simple cases, `fetch` + manual state is enough; for rich SPAs, a full client reduces boilerplate.

```javascript
const { data } = await client.query({
  query: GET_USER,
  variables: { id: "1" },
});
```

---

## Q14. What are the advantages of GraphQL?

**Answer:**

Key advantages include: **flexible queries** (clients request only needed fields), **fewer round trips** for nested data, **strong typing** and **introspection** for tooling, **schema-first collaboration** between teams, and **evolution** through additive schema changes.

Product teams can ship features without waiting for N new REST endpoints. Code generators can produce **types** and **hooks** from the schema, improving DX and reducing bugs.

---

## Q15. What are the disadvantages of GraphQL?

**Answer:**

Disadvantages include: **complexity** on the server (resolvers, N+1 risks), **caching** is harder than URL-based HTTP caching, **misuse** can cause expensive queries (deep trees), **learning curve** for SDL and mental model, and **file uploads** need extra specs or multipart handling.

Operations and security require **limits** (depth, cost analysis). For very simple CRUD APIs, REST may be simpler to operate.

---

## Q16. What is the Schema Definition Language (SDL)?

**Answer:**

**SDL** is GraphQL’s concise syntax for declaring **types**, **fields**, **interfaces**, **unions**, **enums**, **inputs**, and **directives**. It is human-readable and is the usual way teams **author** schemas in schema-first workflows.

SDL is declarative: you describe the shape of the API, not implementation. Servers load SDL into an internal schema object; tools use the same text for docs and codegen.

```graphql
type User {
  id: ID!
  email: String!
  profile: Profile
}
```

---

## Q17. What are scalar types in GraphQL?

**Answer:**

**Scalars** are leaf types that represent a single value: strings, numbers, booleans, or opaque custom values. They cannot have sub-selections in queries (you cannot request fields *inside* a scalar).

The spec defines built-in scalars; servers can add **custom scalars** (e.g., `Date`, `JSON`) with custom serialization rules.

```graphql
type Product {
  name: String
  price: Float
  inStock: Boolean
}
```

---

## Q18. List the built-in scalar types in GraphQL.

**Answer:**

The GraphQL specification defines these **built-in scalars**: **`Int`** (signed 32-bit integer), **`Float`** (signed double-precision fractional values), **`String`** (UTF-8 text), **`Boolean`** (`true` or `false`), and **`ID`** (serialized as a `String`; intended for unique identifiers).

Clients and servers must coerce literals and variables to these types according to the spec. Custom scalars extend this set when you need dates, URLs, or structured blobs without exposing JSON shape in every field.

---

## Q19. What is an Object type in GraphQL?

**Answer:**

An **Object type** is a named collection of **fields**, each with a type (scalar, enum, interface, union, or another object). Object types are the main building blocks of your graph: `User`, `Post`, `Comment`, etc.

Object types can implement **interfaces** and appear as return types for fields. In queries, you **select fields** from objects; the schema defines which fields exist.

```graphql
type Post {
  id: ID!
  title: String!
  author: User!
}
```

---

## Q20. What is an Input type in GraphQL?

**Answer:**

An **input object type** (`input`) bundles arguments for **mutations** or field arguments. Unlike output `type` objects, **inputs** have separate type namespaces and stricter rules: e.g., you cannot have fields that are interfaces/unions in the same way as outputs.

Inputs are **only** for variable/input positions—never returned as query results. This keeps mutation payloads structured and validatable.

```graphql
input CreateUserInput {
  email: String!
  password: String!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

---

## Q21. What is the difference between Object type and Input type?

**Answer:**

**Object types (`type`)** describe **output** data clients can query with field selections. **Input types (`input`)** describe **structured arguments** clients send in; they cannot be queried with subfields in the response tree the same way (they are not part of the response).

Inputs and outputs are **distinct** in GraphQL: you cannot use an `input` as a field return type, and `type` cannot be used where an `input` is required. Often you duplicate shape (`User` vs `UserInput`) because the create/update payload differs from the full model.

---

## Q22. What is an Enum type in GraphQL?

**Answer:**

An **enum** restricts a field to a **fixed set of string values** known at schema time. This improves validation and makes UIs and codegen clearer than free-form strings.

Enums are serialized as strings in JSON responses. Servers map internal constants to enum values consistently.

```graphql
enum OrderStatus {
  PENDING
  SHIPPED
  DELIVERED
}

type Order {
  status: OrderStatus!
}
```

---

## Q23. What is a Union type in GraphQL?

**Answer:**

A **union** represents “one of several object types” at the same field, when the concrete type varies at runtime (e.g., `SearchResult = Book | Movie`). Clients **must** use **inline fragments** or fragment spreads with type conditions to select fields, because the union itself has no fields.

Unions are useful for polymorphic lists without a shared interface beyond `__typename`.

```graphql
union SearchResult = Book | Author

query {
  search(q: "graphql") {
    ... on Book { title }
    ... on Author { name }
  }
}
```

---

## Q24. What is an Interface type in GraphQL?

**Answer:**

An **interface** defines a **contract** of fields that implementing object types must provide. For example, `Node { id: ID! }` might be implemented by `User`, `Post`, etc.

Clients can query **common fields** on the interface and use **inline fragments** for type-specific fields. Interfaces support structured polymorphism unlike unions, which are untyped bags until you narrow.

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
}
```

---

## Q25. What is the difference between Union and Interface?

**Answer:**

An **interface** declares **shared fields** all implementors must have; queries can select those fields without knowing the concrete type. A **union** only declares **possible types** but **no common fields** on the union itself—you always narrow with `... on Type`.

Interfaces are ideal for shared behavior (`Node`, `Timestamped`); unions are ideal when types are unrelated except through search or polymorphic containers. Both require **type conditions** for type-specific fields.

---

## Q26. What are non-nullable types in GraphQL?

**Answer:**

A type marked with **`!`** is **non-null**: the server promises not to return `null` for that field (for object fields) or that the argument/variable may not be null. Nullable types may return `null` when data is missing.

Non-nullability composes: `[String!]!` means a non-null list whose items are non-null strings. Violating non-null in a resolver often **bubbles** an error and may null the parent if the parent is nullable—per spec error handling rules.

```graphql
type User {
  id: ID!      # must not be null
  bio: String   # may be null
}
```

---

## Q27. What are list types in GraphQL?

**Answer:**

**Lists** are denoted with **`[T]`** or **`[T!]!`**, meaning an array of elements of type `T`. Lists can be nullable at the outer level, inner level, or both, which matters for partial failures.

Lists power collections (`posts: [Post!]`), pagination wrappers, and batch fields. Resolvers return arrays/iterables that the executor serializes to JSON arrays.

```graphql
type User {
  friends: [User!]!
}
```

---

## Q28. What is the root Query type?

**Answer:**

The **`Query`** type is the **entry point** for read operations. Fields on `Query` are top-level fields clients request: `user`, `posts`, `node`, etc.

Every conforming GraphQL schema must define a `Query` type (unless using a custom root configuration in some advanced setups, but standard schemas always have it). Execution starts at `Query` for query operations.

```graphql
type Query {
  me: User
  post(id: ID!): Post
}
```

---

## Q29. What is the root Mutation type?

**Answer:**

The **`Mutation`** type is the entry for **writes**. Each mutation field is a top-level operation (e.g., `createPost`). Servers often document that mutations run **sequentially** in document order, but you should confirm your server’s guarantees.

If there is no `Mutation` type, the schema may only allow queries (read-only API).

```graphql
type Mutation {
  likePost(id: ID!): Post!
}
```

---

## Q30. What is the root Subscription type?

**Answer:**

The **`Subscription`** type is the entry for **streaming** operations. Each subscription field establishes a stream of events. Implementation requires a transport that supports long-lived connections.

Some schemas omit `Subscription` entirely if real-time features are not offered.

```graphql
type Subscription {
  commentAdded(postId: ID!): Comment!
}
```

---

## Q31. What are custom scalar types?

**Answer:**

**Custom scalars** extend GraphQL beyond built-ins for domain concepts: `DateTime`, `Email`, `URL`, `JSON`, `BigInt`, etc. You define them in SDL and provide **serialization**, **parsing**, and **validation** in the server runtime.

Clients see them as opaque values in JSON (usually strings or custom structures). Misconfigured scalars can break interoperability, so document formats clearly.

```graphql
scalar DateTime

type Event {
  startsAt: DateTime!
}
```

---

## Q32. What is type introspection in GraphQL?

**Answer:**

**Introspection** lets clients query the schema **itself**: types, fields, args, and directives. Tools like GraphiQL use it for autocomplete; codegen uses it to generate TypeScript types.

Introspection can be **disabled in production** for security (reduces attack surface). The introspection system uses special fields like `__schema` and `__type`.

```graphql
query {
  __type(name: "User") {
    name
    fields { name type { name kind } }
  }
}
```

---

## Q33. What is the `__schema` field?

**Answer:**

`__schema` is a **meta field** available on the query root that returns a **`__Schema`** object describing the entire schema: types, query/mutation/subscription types, and directives.

It powers **schema exploration** and **documentation UIs**. Restricting introspection limits how much anonymous users can learn about your API surface.

```graphql
query {
  __schema {
    types { name }
    queryType { name }
  }
}
```

---

## Q34. What is the `__type` field?

**Answer:**

`__type(name: String!)` returns metadata about a **named type** in the schema: kind (`OBJECT`, `INTERFACE`, etc.), fields, interfaces, enum values, and possible types for unions/interfaces.

It is finer-grained than scanning all types from `__schema`. Tools use it to drill into a specific type definition.

```graphql
query {
  __type(name: "Post") {
    kind
    fields { name args { name } }
  }
}
```

---

## Q35. What is a directive in GraphQL?

**Answer:**

**Directives** annotate parts of a document or schema to change execution or validation behavior: built-ins include **`@include`** and **`@skip`**; schemas may define **`@deprecated`**. Custom directives (e.g., `@auth`, `@cacheControl`) are server-specific extensions.

Directives appear in queries (`@include(if: $withFriends)`) or in SDL (`field: String @deprecated`). They are a controlled extension point compared to arbitrary strings.

```graphql
directive @deprecated(reason: String) on FIELD_DEFINITION | ENUM_VALUE
```

---

## Q36. How do you write a basic GraphQL query?

**Answer:**

Start with the `query` keyword (optional if only one operation), add **field selections** in braces, and match the schema’s entry `Query` fields. You can name the operation for logs and tooling.

Send the document as a string to the server (often with variables). Indentation is cosmetic; only structure matters.

```graphql
query {
  books {
    title
  }
}
```

```json
{ "query": "{ books { title } }" }
```

---

## Q37. What are fields in GraphQL queries?

**Answer:**

**Fields** are the unit of selection: each field corresponds to a property on an object type or an entry point. Scalar fields return JSON leaves; object fields require a **subselection** of nested fields.

Field names match the schema; aliases let you rename outputs. Arguments appear in parentheses after the field name.

```graphql
{
  user(id: "7") {
    name
    email
  }
}
```

---

## Q38. What are arguments in GraphQL?

**Answer:**

**Arguments** are named parameters on fields, defined in the schema with types and optional defaults. They filter, paginate, or configure behavior (`posts(limit: 10)`).

Unlike REST query strings, GraphQL arguments are **typed** and validated before execution. Variables pass runtime values into arguments safely.

```graphql
type Query {
  posts(tag: String, limit: Int = 10): [Post!]!
}
```

```graphql
query($tag: String) {
  posts(tag: $tag) { id title }
}
```

---

## Q39. What are aliases in GraphQL?

**Answer:**

**Aliases** rename the **response key** for a field using `alias: fieldName`. They let you query the **same field twice** with different arguments or clarify names.

The JSON keys in the response match aliases, not field names.

```graphql
query {
  smallImage: image(width: 100) { url }
  largeImage: image(width: 800) { url }
}
```

---

## Q40. What are fragments in GraphQL?

**Answer:**

**Fragments** are reusable sets of fields on a **specific type**, declared once and spread into queries with `...FragmentName`. They reduce duplication and keep UI components aligned with data needs.

Fragment spreads must be valid for the object type at that selection set (type conditions apply for interfaces/unions).

```graphql
fragment UserParts on User {
  id
  name
}

query {
  me { ...UserParts }
}
```

---

## Q41. What is an inline fragment?

**Answer:**

An **inline fragment** narrows a union/interface with `... on TypeName { fields }` without naming a reusable fragment. It is the way to select type-specific fields in polymorphic contexts.

Inline fragments can include directives and can be unnamed; named fragments are better when reused.

```graphql
query {
  node(id: "1") {
    id
    ... on User { name }
    ... on Post { title }
  }
}
```

---

## Q42. What are operation names in GraphQL?

**Answer:**

An **operation name** labels a query/mutation/subscription (`query GetUser`). Names help with **server logs**, **metrics**, **Apollo Studio** traces, and **client codegen**.

If a document has multiple operations, each must be named, and the request specifies which to run via the `operationName` field.

```graphql
query GetUser {
  me { id }
}
```

```json
{ "query": "query GetUser { me { id } }", "operationName": "GetUser" }
```

---

## Q43. What are variables in GraphQL?

**Answer:**

**Variables** let you parameterize queries without string concatenation. Declare them after the operation (`query($id: ID!)`) and use `$id` in arguments; pass values in a separate JSON `variables` map.

This prevents injection bugs and enables query **caching** on the client by keeping the document static.

```graphql
query UserById($id: ID!) {
  user(id: $id) { name }
}
```

```json
{ "variables": { "id": "42" } }
```

---

## Q44. What is the default value for variables?

**Answer:**

Variables may specify **default values** in the declaration: `query($size: Int = 10)`. If the client omits the variable, the default applies; if provided, the client value wins.

Defaults help keep common pagination sizes DRY. Non-null variables (`Int!`) cannot default to null unless the variable itself is nullable.

```graphql
query Posts($first: Int = 20) {
  posts(first: $first) { id }
}
```

---

## Q45. What are GraphQL directives `@skip` and `@include`?

**Answer:**

**`@skip(if: Boolean)`** omits a field when `true`; **`@include(if: Boolean)`** includes a field only when `true`. They are evaluated during execution to **conditionally** shape responses without separate query strings.

If both apply, `@skip` takes precedence per spec. Use them for lightweight A/B or feature toggles in a single document.

```graphql
query($withBio: Boolean!) {
  me {
    name
    bio @include(if: $withBio)
  }
}
```

---

## Q46. How does nested querying work in GraphQL?

**Answer:**

Nested querying means selecting **fields of related objects** in one tree: follow edges on your graph (`user { posts { comments { author { name } } } }`). Each object field triggers **child resolvers** (or batching) depth-first in the execution model.

This replaces chained REST calls with one HTTP request, but can increase **resolver work**—mitigate with batching (`DataLoader`) and depth limits.

```graphql
query {
  post(id: "1") {
    title
    comments {
      text
      author { name }
    }
  }
}
```

---

## Q47. What is the difference between query and mutation?

**Answer:**

**Queries** are for **reads**; **mutations** are for **writes**. Semantically, queries should avoid side effects; mutations are expected to change data.

HTTP-wise, both are often POSTed to GraphQL. Servers may execute query fields in parallel where safe, while mutation fields are often **sequential** to preserve order. Tooling and caches treat them differently (e.g., Apollo updates cache after mutations).

---

## Q48. What is a named query?

**Answer:**

A **named query** is a query operation with an explicit name (`query GetBooks`). Naming improves observability and is required when multiple operations exist in one document.

Anonymous queries (`query { books { title } }`) are fine for quick tests but named operations are preferred in production apps.

```graphql
query GetBooks {
  books { title author { name } }
}
```

---

## Q49. How do you pass arguments to a query?

**Answer:**

Pass **literal** arguments in the field (`user(id: "1")`) or bind **variables** (`user(id: $id)` with `"variables": {"id":"1"}`). The schema defines which arguments exist and their types.

Prefer **variables** from application code for dynamic values; literals are convenient in GraphiQL.

```graphql
query($id: ID!) {
  user(id: $id) { name }
}
```

---

## Q50. What is query depth?

**Answer:**

**Query depth** is the maximum **nesting level** of selections in a document (e.g., `a { b { c { d } } }` has depth 4). Deep queries can stress databases through **exponential resolver fan-out**.

Production servers often enforce a **max depth** rule to block abusive queries. Depth limits complement **complexity/cost** analysis.

---

## Q51. What is query complexity?

**Answer:**

**Complexity** estimates how “expensive” a query is—by field weights, list sizes, or resolver cost. Unlike depth alone, complexity can penalize **wide** queries (many fields or large lists).

Servers may reject queries above a **complexity threshold** or use **persisted queries** to whitelist known operations.

```javascript
// Pseudocode: assign cost per field and sum
// cost = 1 + 5*friends.length
```

---

## Q52. How do you handle errors in GraphQL?

**Answer:**

GraphQL responses may include **`data`** (possibly partial) and **`errors`**, an array of error objects with `message`, `locations`, `path`, and optional `extensions` (e.g., codes). **Non-null violations** and resolver throws can null parent fields per spec rules.

Clients should **not** assume HTTP 200 means full success—always check `errors`. For mutations, use **transactional** patterns in resolvers when partial updates are unacceptable.

```json
{
  "data": { "user": null },
  "errors": [{ "message": "Not found", "path": ["user"] }]
}
```

---

## Q53. What is partial data in GraphQL responses?

**Answer:**

**Partial data** means some fields succeeded while others failed; `data` contains as much as possible, and `errors` lists problems. This happens when nullable fields error independently or list items fail individually.

Clients must render **gracefully**—show spinners only where needed, surface field-level errors. For financial operations, design mutations to avoid partial business outcomes unless acceptable.

---

## Q54. What is the structure of a GraphQL response?

**Answer:**

A typical JSON response has **`data`**: mirrors the query shape with nulls where applicable; **`errors`**: optional array of GraphQL errors; **`extensions`**: optional server metadata (tracing, rate limit info).

HTTP status may be 200 even with errors (common for partial results). Some clients treat any `errors` as failure depending on policy.

```json
{
  "data": { "me": { "name": "Ada" } },
  "errors": []
}
```

---

## Q55. What is a GraphQL document?

**Answer:**

A **document** is the full UTF-8 text containing **operations** and **fragments**: one or more definitions separated by whitespace. The server parses the whole document, then executes one operation (named by `operationName`).

Documents can be **persisted** (send an ID instead of text) to save bandwidth and lock down allowed operations.

```graphql
query A { me { id } }
query B { books { title } }
fragment F on User { name }
```

---

## Q56. What is a resolver in GraphQL?

**Answer:**

A **resolver** is a function that **produces the value** for a single field. For each selected field, the execution engine calls the field’s resolver (or a default), passing parent object, arguments, context, and info.

Resolvers decouple the schema from data sources: the same schema can swap backends without changing client queries.

```javascript
const resolvers = {
  Query: {
    user: (_parent, args) => db.users.findById(args.id),
  },
};
```

---

## Q57. What are the four arguments of a resolver function?

**Answer:**

Typical Node GraphQL signatures are **`(parent, args, context, info)`**. **`parent`**: the resolved object containing this field (or root for top-level). **`args`**: field arguments per schema. **`context`**: per-request shared services (auth user, loaders). **`info`**: AST and execution metadata (`GraphQLResolveInfo`).

Not every language names them identically, but the concepts map across implementations.

```javascript
fieldName: (parent, args, context, info) => { /* ... */ }
```

---

## Q58. What is the root/parent argument in a resolver?

**Answer:**

For **top-level** fields (`Query`, `Mutation`), `parent` is often unused or `null`/root value. For **nested** fields (`Post.author`), `parent` is the object returned by the parent resolver (the `Post` instance).

Use `parent` to read foreign keys or embedded data without refetching everything.

```javascript
Post: {
  author: (post, _args, ctx) => ctx.loaders.user.load(post.authorId),
}
```

---

## Q59. What is the `args` argument in a resolver?

**Answer:**

`args` is an object of **argument name → coerced value** matching the schema for that field. Scalars are parsed/validated; `null` handling follows nullable modifiers.

Use `args` for filters, IDs, pagination cursors—anything declared in the schema after the field name.

```javascript
(_parent, { id, first }) => dao.listComments(id, first)
```

---

## Q60. What is the `context` argument in a resolver?

**Answer:**

**Context** is a **per-request** object built once and passed to every resolver—ideal for **current user**, **db connections**, **DataLoader** instances, **request IDs**, and **feature flags**.

Avoid storing mutable per-field state on context unless you know what you are doing; prefer immutability for safety.

```javascript
const server = new ApolloServer({
  context: ({ req }) => ({
    user: authenticate(req),
    loaders: createLoaders(),
  }),
});
```

---

## Q61. What is the `info` argument in a resolver?

**Answer:**

`info` (`GraphQLResolveInfo`) exposes the **field AST**, **return type**, **path**, **variable values**, and **fragments**. Advanced uses include **lookahead** (optimize DB projections based on selected subfields) and custom tracing.

Beginners rarely touch `info`, but middleware and performance tooling rely on it heavily.

```javascript
import { parseResolveInfo } from "graphql-parse-resolve-info";
// Use info to know which child fields were requested
```

---

## Q62. What is resolver chaining?

**Answer:**

**Chaining** means the output of one resolver becomes the `parent` for child field resolvers, building the response **tree** bottom-up through the graph. `Query.post` returns a `Post`; `Post.title` then runs with that `Post` as parent.

Understanding chaining clarifies **execution order** and why lazy fields can trigger extra queries if each child resolver hits the DB.

---

## Q63. What is a default resolver?

**Answer:**

If you do not define a resolver for an object field, GraphQL uses a **default resolver** that looks up a **property** on `parent` matching the field name (e.g., `parent.title` for `title`).

This is why simple schemas need few explicit resolvers when parent objects already look like the GraphQL model.

```javascript
// Default-like behavior
(parent) => parent[fieldName]
```

---

## Q64. How do resolvers work with nested types?

**Answer:**

The executor resolves the tree **field by field**. Parent resolvers return objects (or Promises); child resolvers receive those objects. For lists, the parent resolver returns an array; the executor runs the child resolver **per element** unless batched.

This model is powerful but causes **N+1** if each child resolver queries the DB independently—use batching.

```javascript
User: {
  posts: (user) => db.posts.byAuthorId(user.id),
}
```

---

## Q65. What is a trivial resolver?

**Answer:**

A **trivial resolver** is a simple mapping from parent property to field with no async work—often relying on the **default resolver** or a one-liner. Complex resolvers add IO, auth checks, or transformations.

Refactoring to trivial resolvers after batch-fetching in the parent can reduce duplicate work.

---

## Q66. Can a resolver return a promise?

**Answer:**

Yes—resolvers may be **`async`** or return **Promises** (in JS) / awaitables. The executor **awaits** them so GraphQL works naturally with asynchronous IO (DB, HTTP).

Be mindful of **parallelism**: sibling fields may run concurrently depending on the runtime and resolver design.

```javascript
user: async (_p, { id }) => await db.users.findById(id)
```

---

## Q67. How do you handle errors in resolvers?

**Answer:**

Throwing an `Error` (or returning `GraphQLError`) marks the field failed; GraphQL adds to `errors` and applies nullability rules. For **expected** failures (not found), some APIs return **`null`** with a **nullable** field instead of throwing.

Use `extensions` for error codes; **mask** internal details in production. Centralize logging in middleware wrapping resolvers.

```javascript
if (!user) throw new GraphQLError("NOT_FOUND", { extensions: { code: "NOT_FOUND" } });
```

---

## Q68. What is the execution order of resolvers?

**Answer:**

The spec executes selections in a **predictable tree walk**; sibling scalar/object fields may be scheduled **concurrently** by many engines. **Mutation** fields are often executed **serially** in document order on servers like Apollo—verify docs.

Understanding this matters when order-dependent side effects must be guaranteed—group them in one mutation field or use server-side transactions.

---

## Q69. What is a field-level resolver?

**Answer:**

A **field-level resolver** is attached to a **specific field** on a type (`User.email`). It runs only when that field is requested, enabling **lazy loading** of expensive columns.

This contrasts with always fetching all columns in the parent resolver—field resolvers enable finer-grained data access patterns.

```javascript
User: {
  email: (user, _args, ctx) => ctx.auth.canSeeEmail(ctx.viewer, user) ? user.email : null,
}
```

---

## Q70. What is a type-level resolver?

**Answer:**

People often mean **`__resolveType`** on interfaces/unions: a function that decides **which concrete type** a value represents at runtime. In Apollo this lives under `Type` resolvers for `BookOrMovie`.

Alternatively, some use “type-level” loosely for **all resolvers grouped under a type** in the resolver map (`User: { ... }`). Clarify in interviews which meaning is intended.

```javascript
SearchResult: {
  __resolveType(obj) {
    return obj.kind === "BOOK" ? "Book" : "Movie";
  },
}
```

---

## Q71. What is GraphiQL?

**Answer:**

**GraphiQL** is an **in-browser IDE** for writing GraphQL queries with **syntax highlighting**, **autocomplete** (via introspection), and **documentation** panels. It is great for learning and debugging against a dev server.

Many frameworks embed GraphiQL at `/graphql` in development. It is distinct from **GraphQL Playground** (now largely legacy) and **Apollo Sandbox**.

---

## Q72. What is Apollo Server?

**Answer:**

**Apollo Server** is a popular **Node.js GraphQL server** library that integrates with Express, Fastify, Lambda, etc. It handles HTTP, subscriptions (with extra setup), **plugins**, **metrics**, **landing pages**, and **federation** as a gateway.

You provide **typeDefs + resolvers** or a **schema** object; Apollo wires execution and middleware concerns.

```javascript
import { ApolloServer } from "@apollo/server";
const server = new ApolloServer({ typeDefs, resolvers });
```

---

## Q73. What is Apollo Client?

**Answer:**

**Apollo Client** is a **GraphQL client** for browsers and RN with **normalized caching**, **mutations**, **optimistic UI**, **pagination helpers**, and **React hooks** (`useQuery`, `useMutation`).

It tracks entities by `__typename`+`id` when possible, reducing redundant network usage and keeping UI consistent.

```javascript
const { data, loading, error } = useQuery(GET_DOG, { variables: { name: "Buck" } });
```

---

## Q74. What is the difference between Apollo Client and Relay?

**Answer:**

**Relay** (Facebook) is highly **opinionated** and optimized for React with **compile-time** transforms, **fragments colocated** with components, and strong **normalization** rules—it shines at very large apps with discipline.

**Apollo Client** is **more flexible**, easier onboarding, wider framework support, and a larger plugin ecosystem. Choose Relay for strict GraphQL+React patterns at scale; Apollo for versatility and faster starts.

---

## Q75. How do you set up a basic GraphQL server with Node.js?

**Answer:**

Install `graphql`, `@apollo/server`, and an HTTP adapter (e.g., `@as-integrations/express5` or built-in `startStandaloneServer`). Define **SDL** and **resolvers**, create `ApolloServer`, `start()` it, and listen on a port.

For learning, `startStandaloneServer` avoids framework wiring; for production, integrate with your web framework and add auth, CORS, and body limits.

```javascript
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
  type Query { hello: String }
`;
const resolvers = { Query: { hello: () => "world" } };

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(url);
```

---

## Q76. What is graphql-js?

**Answer:**

**graphql-js** is Facebook’s **reference JavaScript implementation** of the GraphQL spec: parsing, validation, execution, and introspection. Most Node GraphQL servers build on it under the hood.

You can use it directly for low-level control, but most apps prefer higher-level frameworks that handle HTTP and ergonomics.

```javascript
import { graphql } from "graphql";
const result = await graphql({ schema, source: "{ hello }", rootValue: { hello: "hi" } });
```

---

## Q77. What is express-graphql?

**Answer:**

**express-graphql** was a middleware to mount a GraphQL HTTP handler on **Express**. It historically powered many tutorials; maintenance shifted and **Apollo Server** or **graphql-http** are common choices today.

Conceptually it connected Express `req/res` to the `graphql` executor—similar to how modern integrations work.

---

## Q78. What is GraphQL Playground?

**Answer:**

**GraphQL Playground** was a GraphQL IDE (fork/evolution of GraphiQL) with a distinct UI, often bundled by **Prisma** tools. It supported **multiple tabs**, **HTTP headers**, and **subscriptions**.

Many projects now use **GraphiQL** or **Apollo Sandbox** instead; know Playground as legacy but still seen in older repos.

---

## Q79. What is Postman's GraphQL support?

**Answer:**

**Postman** can send GraphQL requests with a **query body**, **variables**, and **authorization headers**—useful for QA and manual testing without a browser. It may fetch schemas for **autocomplete** if introspection is enabled.

Teams standardize collections for regression testing alongside automated tests in code.

---

## Q80. What is schema-first vs code-first approach?

**Answer:**

**Schema-first** writes **SDL** first, then implements resolvers to match—great for collaboration and codegen. **Code-first** defines types in programming language constructs (classes, decorators, builder APIs) and **emits** or directly builds a schema—great for strongly typed backends and refactoring tools.

Neither is universally superior; large orgs often mix (SDL + generated resolvers stubs).

---

## Q81. What is the `makeExecutableSchema` function?

**Answer:**

From **`@graphql-tools/schema`**, **`makeExecutableSchema({ typeDefs, resolvers })`** combines SDL strings and resolver maps into an executable **`GraphQLSchema`** object usable by Apollo or `graphql-js`.

It enables **schema stitching** modules, **directives**, and **merging** multiple typeDefs cleanly.

```javascript
import { makeExecutableSchema } from "@graphql-tools/schema";
export const schema = makeExecutableSchema({ typeDefs, resolvers });
```

---

## Q82. What is `gql` template literal tag?

**Answer:**

The **`gql` tag** (from `graphql-tag` or GraphQL libraries) parses a template string into an **AST DocumentNode** at build time. Bundlers/plugins can optimize and strip unused fragments.

It enables **syntax highlighting** in editors when paired with extensions, and keeps queries as static artifacts for tooling.

```javascript
import gql from "graphql-tag";
const GET_USERS = gql`
  query GetUsers {
    users { id name }
  }
`;
```

---

## Q83. What is the Apollo Sandbox?

**Answer:**

**Apollo Sandbox** is Apollo’s **web-based GraphQL IDE** for exploring APIs, similar to GraphiQL, with Apollo-specific features and integrations to **Apollo Studio**. It can connect to local or remote endpoints with custom headers.

It is commonly shown on Apollo Server’s default landing page in development.

---

## Q84. How do you test GraphQL queries?

**Answer:**

Test by executing the **schema** in-process with **`graphql()`** or an Apollo test client, passing **fixtures** for context. Assert on **`data`/`errors`** JSON and resolver side effects (DB mocks).

Use **snapshot testing** cautiously; prefer explicit assertions. Integration tests hit HTTP with **supertest**; e2e tests use Playwright/Cypress.

```javascript
import { graphql } from "graphql";
const res = await graphql({ schema, source: `query { hello }` });
expect(res.data.hello).toBe("world");
```

---

## Q85. What are GraphQL code generators?

**Answer:**

**Codegen** tools (e.g., **GraphQL Code Generator**) read your **schema** and **operations** to emit **TypeScript types**, **React hooks**, **mock data**, and **validators**. This closes the gap between client and server contracts.

CI can fail builds when operations drift from the schema, catching bugs before runtime.

```bash
graphql-codegen --config codegen.yml
```

---

## Q86. How does GraphQL handle authentication?

**Answer:**

GraphQL itself is **agnostic**; authentication happens in **transport** and **context**. Common pattern: validate **JWT**/session in HTTP middleware, attach `user` to **`context`**, and read it in resolvers or **auth directives**.

Avoid putting tokens inside GraphQL strings; use **headers**. For web, use **HttpOnly cookies** or secure header patterns; for mobile, secure storage + bearer tokens.

```javascript
context: ({ req }) => ({ user: parseJwt(req.headers.authorization) })
```

---

## Q87. How does GraphQL handle authorization?

**Answer:**

**Authorization** is **business rules**: can this user see `email`? Delete `post`? Implement in **resolvers**, **custom directives**, **field policies**, or **gateway** layers. Schema design can expose **separate** fields for admin vs user views.

Centralize policy to avoid scattered checks; log denials consistently. **Federation** requires careful **subgraph** trust boundaries.

```javascript
Post: {
  viewerCanEdit: (post, _a, ctx) => post.authorId === ctx.user.id,
}
```

---

## Q88. What is over-fetching and how does GraphQL solve it?

**Answer:**

**Over-fetching** means downloading **more fields** than the UI needs, wasting bandwidth and CPU. Fixed REST payloads often include unused columns.

GraphQL lets the client **select only requested fields**, shrinking responses. Combine with **persisted queries** and **field-level metrics** to track actual usage.

```graphql
# Only fetch title, not huge body
query { post(id: "1") { title } }
```

---

## Q89. What is under-fetching and how does GraphQL solve it?

**Answer:**

**Under-fetching** means **one endpoint doesn’t have enough** data, forcing **multiple round trips** (user, posts, comments). Mobile networks suffer most.

GraphQL **nests** related data in one request, reducing chatty sequences. Trade-off: complexity moves server-side; mitigate with **DataLoader** and **query cost** limits.

```graphql
query { user(id: "1") { name posts { title } } }
```

---

## Q90. What is the N+1 problem in GraphQL?

**Answer:**

The **N+1** problem occurs when a **list resolver** returns N parents, and a **child resolver** runs a **separate DB query per item** (N queries) plus the initial query (1)—hence N+1.

It appears easily with ORMs and naive per-field resolvers. **Batching** and **joins** or **DataLoader** collapse many calls into few.

```javascript
// Naive: each post triggers a query for author
posts.map((p) => db.user.find(p.authorId)) // bad at scale
```

---

## Q91. What is DataLoader?

**Answer:**

**DataLoader** is a **batching and caching** library by Facebook. You provide a batch function `keys => Promise<values>`; per request, many `load(id)` calls coalesce into **one batched query** with deduplication.

It is the standard fix for **N+1** in GraphQL Node servers. Create **one DataLoader instance per request** to avoid cross-user cache leaks.

```javascript
const userLoader = new DataLoader(async (ids) => {
  const users = await db.users.whereIn(ids);
  return ids.map((id) => users.find((u) => u.id === id));
});
```

---

## Q92. What is batching in GraphQL?

**Answer:**

**Batching** combines multiple **loads of the same type** (e.g., user IDs) into a **single database round trip** or microservice call. **DataLoader** implements per-key batching; some ORMs support `IN` queries explicitly.

Batching reduces latency and database load dramatically on list+relation screens.

---

## Q93. What is caching in GraphQL?

**Answer:**

Caching happens at layers: **HTTP** caching is tricky for POST; **CDN** caching often uses **GET**+persisted queries or **automatic persisted queries** (APQ). **Client-side**, **normalized caches** (Apollo/Relay) cache by entity ID.

**Server-side**, use **Redis** for resolver results cautiously due to fine-grained keys; **entity caching** with TTL works when invalidation is clear.

---

## Q94. How is pagination done in GraphQL?

**Answer:**

Common patterns: **offset/limit** (`skip/take`), **cursor-based** (`first/after` with opaque cursors), and **relay-style connections** (`edges { node cursor } pageInfo`). Choose cursors for **stable** large lists; offsets can skip/duplicate rows when data mutates.

Expose pagination args on list fields and return **page metadata** appropriate to the style.

```graphql
type Query {
  posts(first: Int!, after: String): PostConnection!
}
```

---

## Q95. What is cursor-based pagination?

**Answer:**

**Cursor pagination** uses an **opaque pointer** (often base64 of an ID+sort key) to fetch the **next page** relative to a position in a stable ordering. It handles **live datasets** better than offsets.

Clients pass `after` with `first`; servers return `endCursor` in `pageInfo`. Requires **indexed ordering** in the database.

```graphql
query {
  users(first: 10, after: "eyJpZCI6MTB9") {
    pageInfo { endCursor hasNextPage }
    edges { node { name } }
  }
}
```

---

## Q96. What is offset-based pagination?

**Answer:**

**Offset pagination** uses **`offset`/`limit`** (or `skip`/`take`) to slice results. It is simple but **slow** for deep pages (large offsets scan many rows) and **unstable** if rows insert/delete during paging.

Fine for admin tools and small tables; avoid for infinite scroll on huge, mutating feeds.

```graphql
type Query {
  posts(limit: Int = 10, offset: Int = 0): [Post!]!
}
```

---

## Q97. How does file upload work in GraphQL?

**Answer:**

GraphQL has **no file type in the core spec**. Common approach: **multipart request** (`graphql-multipart-request-spec`) sending operations + map + files over HTTP, handled by middleware (e.g., `graphql-upload`).

Alternatives: upload to **S3** with pre-signed URLs via a **mutation** that returns upload policy, then send only metadata to GraphQL.

```javascript
// Conceptually: multipart form with operations + file blob
// Server middleware injects file streams into mutation args
```

---

## Q98. What is a GraphQL gateway?

**Answer:**

A **gateway** is a **single GraphQL entry** that **routes** to underlying services (REST, gRPC, subgraphs). It can handle **auth**, **rate limits**, **caching**, and **composition**.

In **federation**, the gateway orchestrates **subgraphs** and merges them into one supergraph for clients.

---

## Q99. What is schema stitching?

**Answer:**

**Schema stitching** combines **multiple GraphQL schemas** into one API using **type merging**, **remote executables**, and **linking** types across services (older approach predating federation maturity).

Tools like **GraphQL Tools** help stitch schemas; careful **naming** and **conflict resolution** are required to avoid type collisions.

```javascript
// Pseudocode: stitch Book schema from svc A and User schema from svc B
```

---

## Q100. What is Apollo Federation?

**Answer:**

**Apollo Federation** lets teams own **independent subgraphs** (each a GraphQL service) while a **router/gateway** composes them into one **supergraph**. Subgraphs declare **`@key`** entities and **`@external`** fields; the router plans queries across services.

It replaces monolithic graphs at scale with **clear ownership** and **incremental rollout**, at the cost of **operational complexity** and **distributed systems** concerns.

```graphql
# Subgraph A
type User @key(fields: "id") {
  id: ID!
  name: String!
}
```

---

*End of document — 100 questions.*
