# Schema Definition Language

## 📑 Table of Contents

- [3.1 SDL Syntax](#31-sdl-syntax)
  - [3.1.1 Type Definitions](#311-type-definitions)
  - [3.1.2 Field Definitions](#312-field-definitions)
  - [3.1.3 Arguments](#313-arguments)
  - [3.1.4 Nullable and Non-Nullable Fields](#314-nullable-and-non-nullable-fields)
  - [3.1.5 List Types](#315-list-types)
- [3.2 Root Types](#32-root-types)
  - [3.2.1 Query Root Type](#321-query-root-type)
  - [3.2.2 Mutation Root Type](#322-mutation-root-type)
  - [3.2.3 Subscription Root Type](#323-subscription-root-type)
  - [3.2.4 Multiple Root Types](#324-multiple-root-types)
  - [3.2.5 Schema Definition](#325-schema-definition)
- [3.3 Comments and Documentation](#33-comments-and-documentation)
  - [3.3.1 Description Strings](#331-description-strings)
  - [3.3.2 Single-line Comments](#332-single-line-comments)
  - [3.3.3 Multi-line Comments](#333-multi-line-comments)
  - [3.3.4 Markdown in Descriptions](#334-markdown-in-descriptions)
  - [3.3.5 Documentation Best Practices](#335-documentation-best-practices)
- [3.4 Schema Design](#34-schema-design)
  - [3.4.1 Naming Conventions](#341-naming-conventions)
  - [3.4.2 Field Organization](#342-field-organization)
  - [3.4.3 Type Organization](#343-type-organization)
  - [3.4.4 Schema Modularity](#344-schema-modularity)
  - [3.4.5 Backward Compatibility](#345-backward-compatibility)
- [3.5 SDL Tools](#35-sdl-tools)
  - [3.5.1 Schema Stitching](#351-schema-stitching)
  - [3.5.2 Schema Merging](#352-schema-merging)
  - [3.5.3 Schema Validation](#353-schema-validation)
  - [3.5.4 Schema Printing](#354-schema-printing)
  - [3.5.5 Schema Generation](#355-schema-generation)
- [3.6 Advanced SDL Features](#36-advanced-sdl-features)
  - [3.6.1 Directives in SDL](#361-directives-in-sdl)
  - [3.6.2 Custom Scalars in SDL](#362-custom-scalars-in-sdl)
  - [3.6.3 Extensions](#363-extensions)
  - [3.6.4 Federation Schema](#364-federation-schema)
  - [3.6.5 Composition Patterns](#365-composition-patterns)

---

## 3.1 SDL Syntax

### 3.1.1 Type Definitions

**Beginner:** In SDL you define **types** with the `type` keyword: `type User { ... }`. There are also `interface`, `union`, `enum`, `input`, and `scalar` definitions.

**Intermediate:** **Object types** describe output shapes; **input types** describe argument shapes (no unions/interfaces on inputs in classic GraphQL). **Interfaces** abstract shared fields; **unions** represent “one of several types.”

**Expert:** SDL can be **extended** with `extend type` and **directives** like `@shareable` (federation). **Schema** may omit explicit `schema { }` when default type names `Query`/`Mutation`/`Subscription` are used.

```graphql
scalar DateTime

enum Role {
  USER
  ADMIN
}

interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  handle: String!
  role: Role!
}

input CreateUserInput {
  handle: String!
  role: Role = USER
}
```

```javascript
const { buildSchema } = require("graphql");

const sdl = `
  type Query { me: User }
  type User { id: ID! name: String }
`;

const schema = buildSchema(sdl);
console.log(schema.getType("User").getFields().id.type.toString());
```

#### Key Points

- **SDL** is a **language** for describing schema, distinct from query documents.
- **Input types** cannot contain fields with arguments (except via nested inputs).
- **Circular** types are allowed through **lazy** references.

#### Best Practices

- One **primary object** per **domain noun** (`Order`, not `OrderDTO`).
- Keep **inputs** separate from **outputs** even when shapes look similar.
- **Export** SDL as **`schema.graphql`** in VCS.

#### Common Mistakes

- Using **input** types in **output** positions or vice versa.
- **Duplicating** the same conceptual type under **different names**.
- **Missing** `!` on IDs that must always exist when resolved.

---

### 3.1.2 Field Definitions

**Beginner:** Fields go inside type braces: `name: String`. Functions on the graph are just **fields with arguments** on `Query`/`Mutation`.

**Intermediate:** Field **arguments** use parentheses: `user(id: ID!): User`. **Lists** and **non-null** modifiers apply to return types and args.

**Expert:** **Field deprecation** uses `@deprecated(reason:)`. **Federation** adds **entity fields** resolved across services. **Resolver maps** in code align to **field names** case-sensitively.

```graphql
type Query {
  """Fetch a user by opaque ID."""
  user(id: ID!): User
  users(first: Int! = 20, after: String): UserConnection!
}

type User {
  id: ID!
  email: String @deprecated(reason: "Use maskedEmail for partners")
  maskedEmail: String
}
```

```javascript
// graphql-js style resolvers mirror SDL field names
const resolvers = {
  Query: {
    user: (_p, args, ctx) => ctx.users.findById(args.id),
  },
  User: {
    maskedEmail: (parent) => mask(parent.email),
  },
};
```

#### Key Points

- **Arguments** belong to the **field**, not the type.
- **Default values** appear only on **input fields** and **arguments** (not output fields).
- **Descriptions** attach to fields for **documentation** UIs.

#### Best Practices

- **Verb-noun** naming for mutations (`createOrder`), **nouns** for types.
- Prefer **payload types** over **boolean-only** mutation results for growth.
- **Group** related args into **input types** when arity grows.

#### Common Mistakes

- **CamelCase** inconsistency between **SDL** and **DB columns** without mapping.
- **Huge** argument lists instead of **input** objects.
- **Deprecated** fields without **migration timeline** in reason string.

---

### 3.1.3 Arguments

**Beginner:** Arguments are **`name: Type`** inside parentheses, comma-separated: `post(id: ID!)`.

**Intermediate:** **Default values** use `=`: `limit: Int = 10`. **Lists** and **non-null** apply: `tags: [String!]!`.

**Expert:** **Order of arguments** is irrelevant to clients; **validation** ensures literals/variables match types. **Custom scalars** parse argument values at execution.

```graphql
type Query {
  feed(
    filter: FeedFilter
    orderBy: FeedSort = NEWEST_FIRST
    first: Int! = 20
  ): PostConnection!
}
```

```javascript
function feedResolver(_parent, args) {
  const first = args.first;
  const orderBy = args.orderBy ?? "NEWEST_FIRST";
  return db.posts.feed({ ...args.filter, first, orderBy });
}
```

#### Key Points

- **Required** args use `!` on the **type**, not a keyword.
- **Defaults** must be **valid** for the type/coercion rules.
- **Null** passed explicitly may **override** defaults (per spec rules for variables).

#### Best Practices

- **Cap** numeric limits with **validation** even if type allows large `Int`.
- Use **enums** instead of **magic strings** for modes.
- Document **interaction** between args (`after` requires `first`).

#### Common Mistakes

- **Non-null** args with **defaults** (allowed but confusing—prefer nullable or document).
- **Inconsistent** naming (`userId` vs `id`) across similar fields.
- **Encoding** complex filters as **String** without a **grammar**.

---

### 3.1.4 Nullable and Non-Nullable Fields

**Beginner:** `String` means **maybe null**. `String!` means **must not be null** if the parent object exists.

**Intermediate:** If a **non-null** child resolver throws or returns null, GraphQL **bubbles null** to the nearest **nullable** parent per spec.

**Expert:** Designing **`User.email: String`** vs `String!` signals **privacy/optional** vs **guaranteed**. **Partial errors** interact with **non-null** boundaries—plan **error bars** around expensive fields.

```graphql
type User {
  id: ID!
  name: String!
  phone: String
}

type Query {
  me: User
}
```

```javascript
// If phone resolver fails and User.phone is nullable -> null with error path
// If phone were String! -> parent User may become null up the tree
```

#### Key Points

- **`!` on outputs** is a **contract** about resolver success.
- **Nullable lists** vs **non-null lists** mean different things: `[User]!` vs `[User!]!`.
- **Non-null** at **root** (`User!`) changes **error severity** for failures.

#### Best Practices

- Use **`ID!`** for identifiers returned to clients.
- Keep **expensive/fragile** fields **nullable** unless truly invariant.
- **Integration test** failure modes for **non-null** chains.

#### Common Mistakes

- Marking **everything** `!` then returning **partial** data incorrectly.
- **Nullable** `ID` fields that are **always** present when object exists.
- Ignoring **null bubbling** in **UI** state machines.

---

### 3.1.5 List Types

**Beginner:** Lists use brackets: `[String]` is a list of nullable strings; `[String!]` is a list where each element cannot be null.

**Intermediate:** **`[String]!`** means the **list itself** cannot be null but may contain null elements (if type allows). **`[String!]!`** is the strictest common form for “array of strings.”

**Expert:** **List sizing** limits belong in **server validation** and **query cost** analysis. **Ordered vs unordered** lists are a **semantic** contract—document it.

```graphql
type Post {
  id: ID!
  tags: [String!]!
  mentions: [User!]
}
```

```javascript
// Resolver must return arrays matching nullability contract
const post = {
  id: "p1",
  tags: ["graphql", "api"],
  mentions: [userA, null], // invalid if schema says [User!]
};
```

#### Key Points

- **Three positions** of `!` matter: element, list, or both.
- **Empty lists** `[]` satisfy **non-null list** types.
- **Pagination** often replaces **raw huge lists**.

#### Best Practices

- Prefer **`[T!]!`** for **clean** client typings when null elements are meaningless.
- **Paginate** instead of returning **unbounded** `[T!]!`.
- **Document** ordering guarantees (`ORDER BY`).

#### Common Mistakes

- Allowing **`null`** list where **empty array** is the right semantics.
- **Mixing** connection types and **raw lists** inconsistently for the same entity.
- **Returning** sparse arrays with **null holes** without schema support.

---

## 3.2 Root Types

### 3.2.1 Query Root Type

**Beginner:** The **`Query`** type holds all **read** entry points: `type Query { me: User }`.

**Intermediate:** **Every** schema must have **exactly one** query root unless using custom `schema { query: MyQuery }`. **Introspection** hangs off the schema’s query type.

**Expert:** **Federation** `Query` may be **thin**; **entities** are fetched via `_entities`. **BFF** graphs often expose **viewer-centric** queries.

```graphql
type Query {
  node(id: ID!): Node
  me: User
  shop(slug: String!): Shop
}
```

```javascript
const resolvers = {
  Query: {
    node: (_p, { id }, ctx) => ctx.nodes.loadByGlobalId(id),
    me: (_p, _a, ctx) => ctx.auth.requireUser(),
    shop: (_p, { slug }, ctx) => ctx.shops.bySlug(slug),
  },
};
```

#### Key Points

- **Query fields** should be **side-effect free** by convention.
- **Global node** APIs aid **caching** clients (Relay).
- **Auth** context typically required for **`me`**.

#### Best Practices

- **Namespace** rarely needed; **field names** should be **specific**.
- Avoid **mega** `Query` files—**split** resolvers by domain module.
- Provide **`health`** or **`version`** fields for ops (non-sensitive).

#### Common Mistakes

- **Writes** hidden inside **query** resolvers.
- **Unbounded** `allUsers` without **pagination**.
- **Throwing** auth errors inconsistently between **root** fields.

---

### 3.2.2 Mutation Root Type

**Beginner:** **`Mutation`** type lists **write** operations: `createPost(input: PostInput!): PostPayload`.

**Intermediate:** **Sibling mutation fields** execute **serially** in order (per spec). **Idempotency** keys may be modeled as arguments.

**Expert:** **Transactional** semantics are **application-defined**—use **one** mutation field wrapping a **service** call for atomic DB transactions.

```graphql
type Mutation {
  createPost(input: CreatePostInput!): CreatePostPayload!
  deletePost(id: ID!): DeletePostPayload!
}
```

```javascript
const resolvers = {
  Mutation: {
    createPost: async (_p, { input }, ctx) => {
      const post = await ctx.posts.create(input, ctx.user);
      return { post, userErrors: [] };
    },
  },
};
```

#### Key Points

- **Naming** verbs help **discoverability** (`updateProfile`).
- **Payload** pattern carries **`userErrors`** + **`resource`** together.
- **Order matters** for **multiple** fields in one mutation document.

#### Best Practices

- Return **`userErrors`** for **validation** instead of only throwing when UX needs inline errors.
- **Audit** mutations with **structured logs**.
- **Document** **retry** semantics for **network** failures.

#### Common Mistakes

- **Splitting** one business action across **multiple** sibling mutations expecting **atomicity**.
- Using **boolean** only results that **cannot** evolve.
- **Forgetting** authorization checks on **nested** mutations via **inputs**.

---

### 3.2.3 Subscription Root Type

**Beginner:** **`Subscription`** type defines **push** operations: `messageAdded(roomId: ID!): Message`.

**Intermediate:** **Return types** are like queries. **AsyncIterators** yield payloads matching the selection set.

**Expert:** **Filtering** arguments should be **narrow** to reduce fan-out. **Authorization** must be checked **per event**, not only at subscribe time.

```graphql
type Subscription {
  messageAdded(roomId: ID!): Message!
  presenceChanged(orgId: ID!): PresenceEvent!
}
```

```javascript
// Illustrative: map pub/sub to async iterator
const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: (_p, { roomId }, ctx) => ctx.pubsub.subscribe(`room:${roomId}`),
      resolve: (payload) => payload.message,
    },
  },
};
```

#### Key Points

- **Subscriptions** are **long-lived**; schema must reflect **event** shapes.
- **Payload** types should be **minimal**; clients can **refetch** heavy data.
- **Topics** naming is an **operational** concern tied to SDL args.

#### Best Practices

- **Scope** topics by **tenant** IDs to prevent **cross-talk**.
- **Heartbeat** and **reconnect** guidance in API docs.
- **Rate limit** subscription **creation** per user.

#### Common Mistakes

- **Leaking** events across **users** via **overbroad** channels.
- **Omitting** `resolve` when payload shape != GraphQL field return type.
- Treating **subscriptions** as **RPC** streams without **backpressure** plan.

---

### 3.2.4 Multiple Root Types

**Beginner:** GraphQL has **three conceptual roots**: Query, Mutation, Subscription. Each is a **distinct** named type in SDL.

**Intermediate:** You can rename them in **`schema { query: Q mutation: M subscription: S }`** for legacy reasons, but **tooling** expects defaults.

**Expert:** **Federation** subgraphs may **omit** roots not implemented; **composition** merges **fields** onto supergraph roots.

```graphql
schema {
  query: QueryRoot
  mutation: MutationRoot
}

type QueryRoot {
  ping: String
}

type MutationRoot {
  pong: Boolean
}
```

```javascript
// When using non-default names, frameworks still wire resolvers to those types
const resolvers = {
  QueryRoot: { ping: () => "pong" },
  MutationRoot: { pong: () => true },
};
```

#### Key Points

- **Renaming** roots is **rare**; prefer **`Query`/`Mutation`/`Subscription`**.
- **Libraries** may assume default names—verify **framework** support.
- **Composition** must not create **duplicate** root field names.

#### Best Practices

- **Stick to defaults** unless integrating **legacy** naming constraints.
- **Document** non-default schema entry types **prominently**.
- **Test** introspection after **renaming** roots.

#### Common Mistakes

- **Partial** schema blocks forgetting **subscription** when subscriptions exist.
- **Typos** in `schema { }` leading to **parse** errors.
- **Merging** tools **duplicating** `Query` definitions incorrectly.

---

### 3.2.5 Schema Definition

**Beginner:** Optional `schema { query: Query mutation: Mutation }` wires **entry points**. If omitted, GraphQL assumes those **default names**.

**Intermediate:** **Only one** `schema` definition is allowed in a **document**. **Extensions** can extend types but not duplicate `schema` blocks incorrectly.

**Expert:** **Directive definitions** (`directive @auth on FIELD_DEFINITION`) live alongside schema SDL. **Federation** injects **`@link`** and **`@key`** definitions.

```graphql
directive @auth(role: Role!) on FIELD_DEFINITION

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
```

```javascript
const { buildSchema } = require("graphql");

// buildSchema may ignore unknown directives unless configured
// For custom directives, use makeExecutableSchema from @graphql-tools/schema
```

#### Key Points

- **`schema`** block is **small** but **critical** for non-default wiring.
- **Directives** must be **defined** before use in **some** tooling pipelines.
- **SDL order** generally **insensitive** for type definitions.

#### Best Practices

- **Centralize** `schema.graphql` **imports** in monorepos.
- **Validate** composed SDL with **`graphql`** or **Rover**.
- **Pin** directive definitions to **versioned** spec extensions.

#### Common Mistakes

- Declaring **`subscription`** in schema without **implementing** transport.
- **Duplicate** `schema` blocks when **concatenating** SDL strings.
- **Missing** directive definitions in **code-first** to **SDL** exports.

---

## 3.3 Comments and Documentation

### 3.3.1 Description Strings

**Beginner:** Descriptions use **triple-quoted strings** before a type/field: `""" ... """`.

**Intermediate:** Descriptions appear in **introspection** as `description` on types and fields. Tools render them as **markdown** often.

**Expert:** **Apollo Federation** uses descriptions for **subgraph** docs in Studio. **Codegen** can embed descriptions as **TSDoc** in some plugins.

```graphql
"""
Represents an authenticated end-user account.
"""
type User {
  """Opaque stable identifier."""
  id: ID!
}
```

```javascript
const { buildSchema, printSchema } = require("graphql");
const schema = buildSchema(`
  """A user"""
  type User { id: ID! }
  type Query { me: User }
`);
console.log(printSchema(schema));
```

#### Key Points

- **Descriptions** are **first-class** metadata, not informal comments.
- **Block strings** can be **multi-line** without `#` per line.
- **Introspection** exposes descriptions to **public** consumers if enabled.

#### Best Practices

- Write descriptions for **every** **public** mutation.
- Include **examples** of **IDs** and **formats** (`ULID`, `UUID`).
- **Review** descriptions in **schema** PRs like code comments.

#### Common Mistakes

- **Duplicating** descriptions across **synonym** types inconsistently.
- **Sensitive** implementation details in **public** descriptions.
- **Empty** descriptions on **complex** financial fields.

---

### 3.3.2 Single-line Comments

**Beginner:** `# comment to end of line` works in SDL files like many languages.

**Intermediate:** `#` comments are **ignored** by parsers and **do not** appear in introspection (unlike descriptions).

**Expert:** **Codegen** and **printers** may **strip** `#` comments when round-tripping SDL—**do not** rely on `#` for public API docs.

```graphql
# Internal note: revisit when billing v2 ships
type Invoice {
  id: ID!
  totalCents: Int!
}
```

```javascript
// Node: strip or preserve comments depends on printer; prefer descriptions for API docs
```

#### Key Points

- **`#` comments** are for **authors**, not **consumers**.
- Use for **TODOs**, **migration notes**, and **review hints**.
- **Never** substitute **`#` for `"""`** on published fields.

#### Best Practices

- **Ticket IDs** in `#` comments (`# TODO GRAPH-123`).
- **Remove** stale `#` notes during **schema cleanup** sprints.
- **Lint** disallow `#` in **generated** SDL (noise).

#### Common Mistakes

- Expecting **GraphiQL** to show **`#` comments** in Docs pane.
- **Committing** **rude** or **blame** language in shared SDL.

---

### 3.3.3 Multi-line Comments

**Beginner:** GraphQL SDL **does not** have C-style `/* */` comments—use **repeated `#` lines** or **`"""` descriptions**.

**Intermediate:** **Block strings `"""`** outside definitions are **invalid**; they must attach to **definitions**.

**Expert:** Some **preprocessors** or **custom tools** inject banners—ensure **`graphql`** parser compatibility before preprocessing.

```graphql
# Multi-line via repeated hash lines
# Line 2 of internal commentary
# Line 3
type Product {
  id: ID!
}
```

```javascript
// If you need banners in emitted SDL, prefix with # in build scripts
const banner = `# Code-generated file — do not edit\n`;
```

#### Key Points

- **`/* */` is not valid** in spec GraphQL SDL.
- **`"""`** is for **descriptions**, not arbitrary **comment blocks** mid-file.
- Use **`#`** for **unlimited** lines of internal notes.

#### Best Practices

- **Standardize** internal comment style in **style guide**.
- **Automate** file headers in **codegen** with `#`.
- **Avoid** huge `#` blocks—link to **docs** instead.

#### Common Mistakes

- Pasting **C-style** comments into `.graphql` files (parse errors).
- Using **`"""` floating** strings (invalid attachment).

---

### 3.3.4 Markdown in Descriptions

**Beginner:** Many UIs render descriptions as **markdown**: use `` `backticks` ``, lists, and links.

**Intermediate:** **Security**: markdown renderers can **link** externally—avoid **untrusted** description sources in **multi-tenant** SDL authoring.

**Expert:** **Studio** and **GraphiQL** may **sanitize** differently—test **rendering** for **XSS** if descriptions are **user-generated** (rare).

```graphql
"""
Fetch active cart.

- Requires session cookie
- See [Checkout guide](https://docs.example.com/checkout)
"""
type Query {
  cart: Cart
}
```

```javascript
// descriptions flow through introspection JSON -> documentation UIs
```

#### Key Points

- **Markdown** improves **readability** for humans.
- **Links** should be **stable** and **versioned**.
- **Do not** embed **secrets** even in markdown code fences in descriptions.

#### Best Practices

- Use **headings sparingly** (some UIs flatten poorly).
- Prefer **relative** wiki links if your doc host supports them.
- **Spell-check** descriptions in **CI** optionally.

#### Common Mistakes

- **Broken links** after **docs migration**.
- **Over-formatting** descriptions that should be **short**.
- **HTML** in markdown that **breaks** older renderers.

---

### 3.3.5 Documentation Best Practices

**Beginner:** Treat SDL descriptions as **product documentation**: who, what, constraints.

**Intermediate:** Pair SDL with **ADR**s for **cross-cutting** flows (checkout, refunds). **Changelog** entries reference **field deprecations**.

**Expert:** **Schema registry** enforces **description presence** via **lint rules**. **Ownership** tags (`@contact` patterns) appear in some enterprises.

```graphql
type Mutation {
  """
  Refund a captured charge.

  Errors:
  - `FORBIDDEN` — caller lacks finance role
  - `INVALID_STATE` — charge not refundable
  """
  refundCharge(input: RefundInput!): RefundPayload!
}
```

```javascript
// graphql-eslint rule example: require-descriptions on Mutation fields
// extends plugin:graphql/recommended with rules configured in .eslintrc
```

#### Key Points

- **Descriptions** + **deprecation reasons** = **migration** story.
- **Lint** documentation like **code quality**.
- **Examples** reduce **support** tickets.

#### Best Practices

- **Template** for mutation docs: **auth**, **idempotency**, **side effects**.
- **Link** **error codes** tables from **descriptions** or central docs.
- **Review** docs with **PM** for **customer-facing** APIs.

#### Common Mistakes

- **Undocumented** **error codes** in extensions.
- **Copy-paste** docs with **wrong** field names.
- **No** **deprecation** timeline in **reason** strings.

---

## 3.4 Schema Design

### 3.4.1 Naming Conventions

**Beginner:** Use **`PascalCase`** for types and **`camelCase`** for fields and arguments. **Enums** are often **`SCREAMING_SNAKE_CASE`** or **`PascalCase`**—pick one.

**Intermediate:** **Inputs** often end with **`Input`**; **payloads** with **`Payload`**. **Connections** use **`*Connection`**, **`*Edge`**.

**Expert:** **Global IDs** (`base64(type:id)`) hide **internal** serial ints. **Federation** types may include **service-specific** naming—**compose** carefully.

```graphql
enum OrderStatus {
  PLACED
  FULFILLED
}

input PlaceOrderInput {
  lineItems: [LineItemInput!]!
}

type PlaceOrderPayload {
  order: Order
  userErrors: [UserError!]!
}
```

```javascript
// Enforce naming via eslint-plugin or graphql-eslint
```

#### Key Points

- **Consistency** beats personal taste across **large** teams.
- **Avoid** abbreviations **opaque** to new hires (`SvcAddr`).
- **Match** **client** codegen conventions (TypeScript types).

#### Best Practices

- Publish a **one-page** GraphQL style guide.
- **Automate** checks with **`@graphql-eslint/naming-convention`**.
- **Rename** carefully—prefer **deprecation** over breaking renames.

#### Common Mistakes

- **Mixed** enum styles in **one** API.
- **Plural** type names for **single** objects (`Users` type representing one user).
- **Leaking** **DB table** names (`tbl_orders`) into **public** schema.

---

### 3.4.2 Field Organization

**Beginner:** Group **related** fields together; put **identity** fields first (`id`), then **core attributes**, then **associations**.

**Intermediate:** **Alphabetical** vs **domain** grouping—choose per type size. **Large** types may split via **interfaces** or **viewer** patterns.

**Expert:** **GraphQL Voyager** readability improves with **consistent** ordering. **Printer** tools may **reorder**—use **lint** to enforce.

```graphql
type Order {
  id: ID!
  createdAt: DateTime!
  status: OrderStatus!
  buyer: User!
  lineItems: [OrderLineItem!]!
  shipments: [Shipment!]!
}
```

```javascript
// Resolvers file split: Order/{index.js} re-exports field resolvers matching field groups
```

#### Key Points

- **Organization** signals **mental model** to consumers.
- **Hot** fields first can help **humans** skim SDL.
- **Generated** SDL may need **post-sort** for **diff** stability.

#### Best Practices

- **Sort** fields in **printer** pipeline for **stable** git diffs.
- **Extract** **cross-cutting** groups (`timestamps`) via **interfaces** if repeated.
- **Avoid** **100+** fields on one type—**split** by **subresource** queries.

#### Common Mistakes

- **Random** field order causing **noisy** PR diffs.
- **Hiding** **important** fields below **rarely used** ones without docs.
- **Circular** **navigation** without **pagination** on **both** sides.

---

### 3.4.3 Type Organization

**Beginner:** **One type per concern**: `User`, `Organization`, `Membership`. Avoid **god objects**.

**Intermediate:** **Shared primitives** (`Money`, `DateRange`) reduce duplication. **Errors** as **`UserError` type** unify mutation UX.

**Expert:** **Bounded contexts** from DDD map to **modules** each exporting SDL slices. **Federation** maps **subgraphs** to **teams**.

```graphql
type Money {
  amount: String!
  currencyCode: String!
}

type UserError {
  code: String!
  message: String!
  field: [String!]
}
```

```javascript
// modules/user/types.graphql, modules/billing/types.graphql merged at build
```

#### Key Points

- **Reusable** value types **cut** duplication and **bugs**.
- **Error** modeling is part of **type design**, not an afterthought.
- **Cross-module** **cycles** need **interfaces** or **query** navigation.

#### Best Practices

- **Centralize** **scalar** definitions (`DateTime`, `URL`).
- **Version** **shared** types carefully—they **fan out**.
- **UML** sketches optional; **SDL** is the **source of truth**.

#### Common Mistakes

- **Copy-paste** `Money` variants with **inconsistent** fields.
- **Stringly** error codes without **enum** or **docs**.
- **Too many** **tiny** types causing **navigation** fatigue.

---

### 3.4.4 Schema Modularity

**Beginner:** Split SDL into **multiple `.graphql` files** and **concatenate** or **import** with tools.

**Intermediate:** **`@graphql-tools/load-files`** and **`mergeTypeDefs`** combine modules. **Code-first** schemas export **SDL** for tooling.

**Expert:** **Monorepo** packages expose **`schema.graphql` artifacts** for **client** codegen. **CI** validates **merge** produces **identical** introspection to **running server**.

```javascript
const { loadFilesSync } = require("@graphql-tools/load-files");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const typeDefs = mergeTypeDefs(
  loadFilesSync(`${__dirname}/modules/**/*.graphql`)
);

const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports = schema;
```

```graphql
# modules/user/User.graphql
type User {
  id: ID!
}
```

#### Key Points

- **Modules** align with **team** ownership boundaries.
- **Merge** order rarely matters for **type** extensions but **matters** for **directives** tooling.
- **Single artifact** for **consumers** reduces **drift**.

#### Best Practices

- **Barrel** export **`schema`** from one package in monorepo.
- **Test** that **merge** fails on **conflicts** early.
- **Document** **module** map in **README**.

#### Common Mistakes

- **Duplicate** type definitions across **files** silently **overwriting** in bad merge configs.
- **Circular** **imports** between modules.
- **Drift** between **server** schema and **committed** SDL.

---

### 3.4.5 Backward Compatibility

**Beginner:** **Additive** changes are safe: **new optional** fields, **new types**, **new enum values** (careful with **exhaustive** switches).

**Intermediate:** **Removing** fields or changing types is **breaking**. Use **`@deprecated`** and **sunset** timelines.

**Expert:** **GraphQL Inspector** or **Apollo** checks **breaking** diffs against **historical operations**. **Field usage** metrics guide removals.

```graphql
type User {
  id: ID!
  username: String! @deprecated(reason: "Use handle; removal 2026-12-01")
  handle: String!
}
```

```javascript
// CI: graphql-inspector diff OLD.graphql NEW.graphql --fail-on-breaking
```

#### Key Points

- **Never** break **without** telemetry showing **low/zero** usage.
- **Deprecation** is a **promise**—track it like **tech debt**.
- **Clients** using **codegen** need **time** to **migrate**.

#### Best Practices

- **Semantic versioning** for **registry artifacts** if applicable.
- **Communicate** deprecations in **release notes** and **Slack**.
- Provide **dual** fields during **migration** windows.

#### Common Mistakes

- **Renaming** without **deprecation** period.
- **Tightening** nullability (`String` → `String!`) without **analysis**.
- **Removing** **enum** values **breaking** **unknown** handling in clients.

---

## 3.5 SDL Tools

### 3.5.1 Schema Stitching

**Beginner:** **Stitching** combines **multiple GraphQL APIs** into one **gateway schema** by **linking** types across services.

**Intermediate:** Uses **`@graphql-tools/stitch`** with **remote executors** and **type merges**. **Transforms** rename/conflict-resolve collisions.

**Expert:** **Stitching** overlaps with **federation**—federation is **opinionated** with **`@key`/`@requires`**. Stitching is **flexible** but can become **fragile** without governance.

```javascript
const { stitchSchemas } = require("@graphql-tools/stitch");
const { schemaFromExecutor } = require("@graphql-tools/wrap");
const { fetch } = require("cross-fetch");
const { print, introspectionFromSchema, buildClientSchema } = require("graphql");

async function remoteSchema(url) {
  const executor = async ({ document, variables }) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: print(document), variables }),
    });
    return res.json();
  };
  const intro = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: introspectionFromSchema ? "..." : "" }),
  });
  // In practice use schemaFromExecutor with subschema config
  return { schema: await schemaFromExecutor({ schema: /* built */, executor }), executor };
}
```

```graphql
# Stitching often adds SDL extensions merging types across subgraphs
```

#### Key Points

- **Stitching** is a **gateway** pattern, not a **database** feature.
- **Conflicts** in **type names** need **prefixing** or **namespacing**.
- **Performance** depends on **query planning** and **batching** to subservices.

#### Best Practices

- **Document** **ownership** of **merged** fields clearly.
- **Monitor** **N+1** calls from gateway to **subschemas**.
- **Evaluate** **federation** if **many** teams contribute **subgraphs**.

#### Common Mistakes

- **Silent** **type collisions** producing **wrong** merges.
- **Exposing** **internal** subgraph **details** accidentally.
- **No** **authz** at **gateway** layer.

---

### 3.5.2 Schema Merging

**Beginner:** **Merging** combines **typeDefs** strings or documents into **one** schema AST.

**Intermediate:** **`mergeTypeDefs`** from **`@graphql-tools/merge`** handles **extensions** and **directives** accumulation.

**Expert:** **Conflicts** detection: duplicate **fields** on same type must be **identical** or **error**. **Federation composition** is a **specialized** merge with **validation rules**.

```javascript
const { mergeTypeDefs } = require("@graphql-tools/merge");

const merged = mergeTypeDefs([
  /* A */ `
    type User { id: ID! }
    type Query { user: User }
  `,
  /* B */ `
    extend type User { email: String }
  `,
]);
console.log(typeof merged); // string or DocumentNode depending on version/config
```

```graphql
extend type User {
  avatarUrl: String
}
```

#### Key Points

- **`extend type`** is the **primary** modularity tool in SDL.
- **Order** of merges should not **duplicate** base definitions.
- **Printing** merged schema aids **review**.

#### Best Practices

- **Snapshot** merged SDL in **CI artifacts**.
- **Unit test** **merge** with **fixture** modules.
- **Ban** **duplicate** `type User` **full** definitions across modules.

#### Common Mistakes

- **`extend`** without **base** type (merge order wrong).
- **Incompatible** **field** types on **accidental** duplicate definitions.
- **Losing** **descriptions** when **concatenating** strings naively.

---

### 3.5.3 Schema Validation

**Beginner:** **Invalid SDL** won’t build a schema: **syntax** and **reference** checks (unknown type names).

**Intermediate:** **graphql-js** `buildSchema` / `validateSchema` catches many issues. **Custom rules** enforce **naming**, **descriptions**, **complexity**.

**Expert:** **Rover subgraph check** validates **federation** **composition**. **Hive**/**Apollo** **schema checks** compare against **live traffic** operations.

```javascript
const { buildSchema, validateSchema, parse, buildASTSchema } = require("graphql");

const sdl = `
  type Query { me: User }
  type User { id: ID! }
`;

const schema = buildASTSchema(parse(sdl));
const errors = validateSchema(schema);
console.log(errors.map((e) => e.message));
```

```graphql
# Validation catches unknown field types
type Broken {
  x: DoesNotExist
}
```

#### Key Points

- **Validation** is **static** analysis of **schema**, separate from **queries**.
- **Federation** adds **extra** composition validations.
- **CI validation** prevents **bad deploys**.

#### Best Practices

- Run **`validateSchema`** after **code-first** schema builds.
- Add **`graphql-eslint`** for **policy** rules.
- **Block** deploy on **breaking** changes without **approval**.

#### Common Mistakes

- **Skipping** validation on **dynamically** built schemas.
- **Ignoring** **warnings** from **composition** tools.
- **Testing** only **happy-path** SDL slices.

---

### 3.5.4 Schema Printing

**Beginner:** **`printSchema`** converts an in-memory **schema** to **SDL string**.

**Intermediate:** **`print`** prints **AST** documents. **Sorting** options may exist via **`lexicographicSortSchema`** from `graphql`.

**Expert:** **Diff-friendly** printing uses **sorted** types for **stable** outputs in **CI**. **Redaction** may strip **internal** directives before publishing.

```javascript
const { buildSchema, printSchema, lexicographicSortSchema } = require("graphql");

const schema = buildSchema(`
  type Query { z: String a: String }
`);

console.log(printSchema(lexicographicSortSchema(schema)));
```

```graphql
# Printed SDL used in docs sites and registries
```

#### Key Points

- **Printing** is **lossy** for **some** custom directives unless configured.
- **Sorting** reduces **merge noise**.
- **Artifacts** should be **committed** or **published** per release.

#### Best Practices

- **Automate** `schema.graphql` **generation** in **release** job.
- **Compare** printed schema to **committed** file in **CI**.
- **Strip** **secrets** from **descriptions** before **public** print.

#### Common Mistakes

- **Manual** SDL edits **fighting** **generated** prints.
- **Unsorted** prints causing **noisy** diffs.
- **Assuming** print order matches **author** order.

---

### 3.5.5 Schema Generation

**Beginner:** **Code-first** frameworks **generate** schema objects from **resolvers** + **type definitions** in JS/TS.

**Intermediate:** **Prisma**/**TypeGraphQL**/**Pothos** emit SDL or schema objects. **Databases** should not **dictate** public schema **one-to-one**.

**Expert:** **SDL-first** vs **code-first** is a **team** choice; **hybrids** export SDL from code for **tooling**. **Codegen** from SDL produces **client** types.

```javascript
// Pothos / TypeGraphQL patterns are TS-first; illustrative minimal code-first:
const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID } = require("graphql");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      me: { type: UserType, resolve: () => ({ id: "1", name: "Ada" }) },
    },
  }),
});

const { printSchema } = require("graphql");
console.log(printSchema(schema));
```

```graphql
# Generated SDL snapshot checked into repo
```

#### Key Points

- **Generation** must be **deterministic** for **CI**.
- **Review** generated SDL in PRs like **handwritten** SDL.
- **Bi-directional** sync (DB → API) risks **leaking** internals.

#### Best Practices

- **Export** SDL on **build**; **fail** CI if **git dirty**.
- **Wrap** ORM models behind **domain** types.
- **Test** **representative** operations against **generated** schema.

#### Common Mistakes

- **Non-deterministic** ordering in **generated** fields.
- **Exposing** **all** DB columns via **reflection**.
- **No** **human review** of **first** generated **public** schema.

---

## 3.6 Advanced SDL Features

### 3.6.1 Directives in SDL

**Beginner:** Built-in directives include **`@include(if: Boolean!)`** and **`@skip(if: Boolean!)`**. SDL can declare **`@deprecated`** on fields.

**Intermediate:** **Custom directives** are declared with `directive @name(args) on LOCATION | LOCATION`.

**Expert:** **Federation** directives (`@key`, `@external`, `@requires`, `@provides`, `@shareable`, `@inaccessible`) control **composition**. **Apollo** client directives (`@client`) are **strip**ped by servers.

```graphql
directive @auth(role: String!) on FIELD_DEFINITION

type Query {
  adminStats: Stats @auth(role: "admin")
}
```

```javascript
const { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");
// Transform schema to enforce @auth in middleware / schema wrapper
```

#### Key Points

- **Directive locations** constrain where they may appear.
- **Servers** must **implement** semantics for **custom** directives.
- **Clients** may use **directives** unknown to server if **stripped** by **link**—be careful.

#### Best Practices

- **Document** custom directive **semantics** in **README**.
- **Limit** directive **proliferation** (readability cost).
- **Test** queries **with** and **without** directives.

#### Common Mistakes

- Declaring directives **never enforced**.
- Using directives for **auth** **without** **central** enforcement (easy to **miss** fields).
- **Typos** in **`on FIELD_DEFINITION`** locations.

---

### 3.6.2 Custom Scalars in SDL

**Beginner:** Declare with `scalar DateTime`. Implement **parseValue**, **parseLiteral**, **serialize** in server.

**Intermediate:** **`@specifiedBy(url:)`** links to **scalar specification** for interoperability.

**Expert:** **Validation** errors should map to **`GraphQLError`** with **clear codes**. **JSON** serialization must be **unambiguous** (DateTime often **ISO-8601 string**).

```graphql
"""ISO-8601 instant in UTC"""
scalar DateTime @specifiedBy(url: "https://scalars.graphql.org/andimarek/datetime.html")

type Event {
  id: ID!
  startsAt: DateTime!
}
```

```javascript
const { GraphQLScalarType, Kind } = require("graphql");

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

module.exports = { DateTimeScalar };
```

#### Key Points

- **Custom scalars** are **contracts** about **string encoding** on the wire.
- **Literal** vs **variable** parsing paths **both** must be **correct**.
- **`specifiedBy`** improves **cross-language** consistency.

#### Best Practices

- **Prefer** **standard** scalars from **community** libs when mature.
- **Unit-test** **invalid** literals and **variables**.
- **Document** **timezone** assumptions **explicitly**.

#### Common Mistakes

- **Forgetting** `parseLiteral` (queries with **inline** literals break).
- **Serializing** **invalid** types that **JSON.stringify** cannot handle.
- **Changing** wire format **without** **versioning** strategy.

---

### 3.6.3 Extensions

**Beginner:** `extend type User { ... }` **adds** fields to an existing type definition across **files**.

**Intermediate:** **`extend`** works for **enums** (add values in some tools with care), **interfaces**, **unions**, and **schema** (rare).

**Expert:** **Federation** uses **extensions** to **declare** entity keys on types in **each subgraph**. **Merge** tools must respect **extension** ordering.

```graphql
type User {
  id: ID!
}

extend type User {
  friends: [User!]!
}
```

```javascript
// mergeTypeDefs combines base + extensions into cohesive schema
```

#### Key Points

- **Extensions** enable **modular** SDL without **editing** core type **source**.
- **Cannot** **remove** fields via extension—use **deprecation** instead.
- **Composition** tools validate **consistency** across **extensions**.

#### Best Practices

- **One module** **owns** the **base** type; others **extend**.
- **Review** **extensions** in **PRs** touching **same** type.
- **Avoid** **circular** extension **dependencies**.

#### Common Mistakes

- **Multiple** **conflicting** **base** definitions + extensions.
- **Extending** **wrong** type name due to **typo**.
- **Enum** extensions **unsupported** or **risky**—check **tooling**.

---

### 3.6.4 Federation Schema

**Beginner:** **Apollo Federation** splits **one supergraph** across **subgraphs** each with its own SDL. **Entities** link via **`@key`**.

**Intermediate:** Subgraph SDL includes **`extend schema @link(...)`** importing federation **v2** definitions. **`@shareable`** marks fields **resolved** in multiple subgraphs.

**Expert:** **Composition** validates **key** **ownership**, **`@requires`/`@provides`**, and **inaccessible** fields. **Router** **plans** operation **across** subgraphs.

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable"])

type User @key(fields: "id") {
  id: ID!
  name: String! @shareable
}
```

```javascript
// Subgraph servers expose SDL to rover for composition
// const { buildSubgraphSchema } = require('@apollo/subgraph');
```

#### Key Points

- **Federation** is **not** just stitching—it has **formal** **composition** rules.
- **`@key`** **selection sets** must be **fetchable** in **that** subgraph.
- **Router** **caching** and **authorization** are **cross-cutting**.

#### Best Practices

- Run **`rover subgraph check`** in **CI**.
- **Minimize** **`@requires`** fan-out **complexity**.
- **Document** **entity** **ownership** per **team**.

#### Common Mistakes

- **Duplicate** **`@key`** **mistakes** leading to **composition errors**.
- **Referencing** **external** fields without **`@external`** properly.
- **Leaking** **internal** fields without **`@inaccessible`** when needed.

---

### 3.6.5 Composition Patterns

**Beginner:** **Composition** means **building** one **API** from **parts**: merge modules, stitch services, or federate subgraphs.

**Intermediate:** **Schema modules** per **domain** + **gateway** for **cross-cutting** concerns (auth, rate limits).

**Expert:** **Strangler pattern**: **new** GraphQL **front** delegates to **legacy REST** resolvers until **migration** completes. **BFF per client** vs **one supergraph** is an **org** tradeoff.

```javascript
// Strangler: GraphQL resolver calls legacy REST
async function orderResolver(_p, { id }, ctx) {
  const res = await ctx.legacyRest.get(`/v1/orders/${id}`);
  return mapOrderDtoToGraphql(res.data);
}
```

```graphql
type Query {
  order(id: ID!): Order
}
```

#### Key Points

- **Composition** patterns **decouple** **delivery** from **domain** services.
- **Anti-corruption** layers **translate** legacy **DTOs** to **clean** graph types.
- **Operational** complexity rises with **more** composed **services**.

#### Best Practices

- **Measure** **latency** **per** **subgraph** hop.
- **Cache** **identity** lookups **centrally** when safe.
- **Plan** **sunset** of **translation** layers.

#### Common Mistakes

- **Chaining** **sync** HTTP calls **deeply** without **timeouts**.
- **Inconsistent** **authorization** between **legacy** and **graph** layers.
- **Composing** **too early** before **domain** boundaries are **stable**.

---

## Summary: SDL Module

SDL is the **lingua franca** of GraphQL APIs: **types**, **fields**, **arguments**, **roots**, **documentation**, **modularity**, **tooling**, and **advanced directives/scalars/federation** together define how clients and servers agree on **shape** and **semantics**. Master SDL alongside **execution** and **resolver** patterns to ship **evolvable**, **safe** graphs.
