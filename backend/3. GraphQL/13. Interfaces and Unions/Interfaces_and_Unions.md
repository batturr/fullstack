# GraphQL Interfaces and Unions

## 📑 Table of Contents

- [13.1 Interfaces](#131-interfaces)
  - [13.1.1 Interface Definition](#1311-interface-definition)
  - [13.1.2 Interface Fields](#1312-interface-fields)
  - [13.1.3 Implementing Interfaces](#1313-implementing-interfaces)
  - [13.1.4 Multiple Interfaces](#1314-multiple-interfaces)
  - [13.1.5 Interface Usage in Queries](#1315-interface-usage-in-queries)
- [13.2 Interface Implementation](#132-interface-implementation)
  - [13.2.1 Object Implementing Interface](#1321-object-implementing-interface)
  - [13.2.2 Shared Fields](#1322-shared-fields)
  - [13.2.3 Additional Fields](#1323-additional-fields)
  - [13.2.4 Type Resolution](#1324-type-resolution)
  - [13.2.5 Fragment Spreading](#1325-fragment-spreading)
- [13.3 Interface Patterns](#133-interface-patterns)
  - [13.3.1 Node Interface Pattern](#1331-node-interface-pattern)
  - [13.3.2 Timestamped Interface](#1332-timestamped-interface)
  - [13.3.3 Entity Interface](#1333-entity-interface)
  - [13.3.4 Hierarchical Interfaces](#1334-hierarchical-interfaces)
  - [13.3.5 Composition Over Inheritance](#1335-composition-over-inheritance)
- [13.4 Unions](#134-unions)
  - [13.4.1 Union Type Definition](#1341-union-type-definition)
  - [13.4.2 Union Members](#1342-union-members)
  - [13.4.3 Querying Unions](#1343-querying-unions)
  - [13.4.4 Inline Fragments with Unions](#1344-inline-fragments-with-unions)
  - [13.4.5 Type Resolution](#1345-type-resolution)
- [13.5 Union Patterns](#135-union-patterns)
  - [13.5.1 Error Unions (Result Pattern)](#1351-error-unions-result-pattern)
  - [13.5.2 Search Result Union](#1352-search-result-union)
  - [13.5.3 Notification Union](#1353-notification-union)
  - [13.5.4 Response Union](#1354-response-union)
  - [13.5.5 Payload Union](#1355-payload-union)
- [13.6 Advanced Patterns](#136-advanced-patterns)
  - [13.6.1 Interface Extending](#1361-interface-extending)
  - [13.6.2 Recursive Interfaces](#1362-recursive-interfaces)
  - [13.6.3 Generic Interfaces](#1363-generic-interfaces)
  - [13.6.4 Typed Nodes](#1364-typed-nodes)
  - [13.6.5 Protocol Pattern](#1365-protocol-pattern)

---

## 13.1 Interfaces

### 13.1.1 Interface Definition

#### Beginner

An **interface** in GraphQL is an abstract type that declares a set of fields. Concrete `type` definitions **implement** the interface by providing those fields (and may add more). Clients can query through the interface when they only care about the shared shape.

#### Intermediate

Interfaces enable polymorphism on the **output** side of the schema. Unlike inputs, interfaces can participate in unions only indirectly (objects that implement interfaces may be union members). SDL uses `interface Name { ... }` and `implements` on object types.

#### Expert

The GraphQL type system requires implementing types to expose interface fields with **covariant** return types where applicable (subtype rules per spec). Field arguments on implementing types must be compatible with the interface’s field definitions (contravariance for arguments). Servers validate this at schema build time.

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  email: String!
}
```

```javascript
const { buildSchema } = require("graphql");

const sdl = `
  interface Node { id: ID! }
  type User implements Node { id: ID! email: String! }
  type Query { me: Node }
`;

const schema = buildSchema(sdl);
const nodeType = schema.getType("Node");
console.log(Object.keys(nodeType.getFields()));
```

#### Key Points

- Interfaces describe required fields for implementors.
- Only output types implement interfaces (objects).
- Schema must be consistent with GraphQL subtype rules.

#### Best Practices

- Name interfaces after roles (`Node`, `Commentable`) not single implementations.
- Document which types implement an interface in descriptions.
- Keep interface surface minimal and stable.

#### Common Mistakes

- Trying to implement interfaces on `input` types (invalid).
- Drifting field types between interface and implementors.

---

### 13.1.2 Interface Fields

#### Beginner

**Interface fields** are the shared properties every implementor must provide. They can use scalars, enums, lists, object types, or other interfaces as return types.

#### Intermediate

Fields on interfaces may have **arguments**. Implementing types must define the same field with arguments that accept at least the same inputs (wider is not always allowed—follow your server’s validation). Nullable vs non-null must align per spec rules.

#### Expert

Resolvers for interface fields can live on the interface type resolver map (`Node: { __resolveType }` is separate) or be inherited from concrete types. Many frameworks resolve interface fields by delegating to the concrete type’s resolver.

```graphql
interface Payable {
  amountCents: Int!
  currency: String!
  description: String
}
```

```javascript
const resolvers = {
  Payable: {
    __resolveType(obj) {
      if (obj.invoiceNumber) return "Invoice";
      if (obj.subscriptionId) return "SubscriptionCharge";
      return null;
    },
  },
};
```

#### Key Points

- Interface fields define the contract for queries.
- Arguments are part of the contract.
- `__resolveType` (or `isTypeOf`) identifies concrete types at runtime.

#### Best Practices

- Prefer stable field names over frequent renames.
- Use enums instead of free strings for discriminating lightly when needed.
- Add descriptions for fields whose semantics vary by implementor.

#### Common Mistakes

- Omitting `__resolveType` when returning interface types from resolvers.
- Adding interface fields without updating all implementors.

---

### 13.1.3 Implementing Interfaces

#### Beginner

A concrete type **implements** an interface with `type User implements Node { ... }`. It must list every interface field with compatible types.

#### Intermediate

A type can implement **multiple** interfaces: `type Post implements Node & Commentable`. The SDL lists all `implements` clauses; order is not semantically significant.

#### Expert

Circular interface hierarchies (interfaces extending interfaces) are allowed in modern GraphQL; objects must still implement the full transitive set of fields. Build tools may flatten required fields for validation.

```graphql
interface Timestamped {
  createdAt: String!
}

type Article implements Timestamped {
  createdAt: String!
  slug: String!
}
```

```javascript
// graphql-js: schema validation catches missing fields
const typeDefs = `
  interface Timestamped { createdAt: String! }
  type Article implements Timestamped {
    createdAt: String!
    slug: String!
  }
`;
```

#### Key Points

- `implements` wires objects to abstractions.
- All interface fields are mandatory on the object (with nullability rules).
- Multiple interfaces compose capabilities.

#### Best Practices

- Run `graphql-schema-linter` or CI validation on every PR.
- Generate TypeScript types from schema to catch drift.
- When adding a new interface field, ship a deprecation period if needed.

#### Common Mistakes

- Forgetting to implement new interface fields on one object type.
- Using weaker return types than the interface allows.

---

### 13.1.4 Multiple Interfaces

#### Beginner

Objects may implement **more than one interface** to mix behaviors: identifiable plus commentable, for example. Clients query the intersection of fields via each interface fragment.

#### Intermediate

Introspection lists `interfaces` on `__Type` for object kinds. Tools like Relay use `Node` alongside domain interfaces (`Sale`, `Purchasable`).

#### Expert

`__resolveType` still returns a single concrete typename. Multiple interfaces do not mean multiple runtime types—they are views on the same object. Federation may use interfaces across subgraphs with careful composition rules.

```graphql
interface Node {
  id: ID!
}

interface Likable {
  likeCount: Int!
}

type Photo implements Node & Likable {
  id: ID!
  likeCount: Int!
  url: String!
}
```

```graphql
query {
  photo(id: "1") {
    ... on Node {
      id
    }
    ... on Likable {
      likeCount
    }
  }
}
```

#### Key Points

- One object, many interface “views.”
- Fragments target specific interfaces or types.
- Useful for shared pagination or audit fields.

#### Best Practices

- Avoid dozens of interfaces on one type (schema noise).
- Group cross-cutting concerns (`Auditable`, `Node`).
- Document which operations return which interface.

#### Common Mistakes

- Assuming interfaces create inheritance trees like OOP subclasses.
- Conflicting field definitions across two interfaces the same type implements.

---

### 13.1.5 Interface Usage in Queries

#### Beginner

When a field returns an **interface**, the client does not know the concrete type until runtime. You select common fields directly, and use **inline fragments** (`... on User`) or named fragments for type-specific fields.

#### Intermediate

If you only query interface fields, you never need fragments. As soon as you need `User.email` vs `Organization.slug`, add `... on User` and `... on Organization`.

#### Expert

Query planners and DataLoader batching should key on concrete types and IDs. For polymorphic lists, N+1 risks rise—use `__resolveType` efficiently and batch loads by typename.

```graphql
query Feed {
  stories {
    title
    author {
      name
      ... on User {
        handle
      }
      ... on Bot {
        model
      }
    }
  }
}
```

```javascript
const resolvers = {
  Query: {
    stories: () => db.stories.latest(),
  },
  Author: {
    __resolveType(author) {
      return author.kind === "BOT" ? "Bot" : "User";
    },
  },
};
```

#### Key Points

- Interfaces drive conditional selection sets.
- Fragments are required for type-specific data.
- `__typename` in queries helps client caches.

#### Best Practices

- Always request `id` (or `__typename` + `id`) for cache normalization.
- Keep interface-level fields cheap to resolve.
- Test queries with every implementor type.

#### Common Mistakes

- Querying type-specific fields without a fragment (validation error).
- Forgetting `__resolveType`, leading to runtime errors.

---

## 13.2 Interface Implementation

### 13.2.1 Object Implementing Interface

#### Beginner

An **object type** lists `implements InterfaceName` and defines all interface fields. Extra fields belong only to that object.

#### Intermediate

In code-first schemas, classes may `implements` GraphQL interface types via decorators or builders. SDL-first uses string schema with explicit `implements`.

#### Expert

Subgraph composition: two subgraphs might define the same interface; the supergraph must merge compatible field definitions. Mismatched arguments or types break composition.

```graphql
interface Account {
  id: ID!
  balance: Float!
}

type CheckingAccount implements Account {
  id: ID!
  balance: Float!
  overdraftLimit: Float!
}
```

```javascript
import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = `#graphql
  interface Account { id: ID! balance: Float! }
  type CheckingAccount implements Account {
    id: ID!
    balance: Float!
    overdraftLimit: Float!
  }
`;

const resolvers = {
  Account: {
    __resolveType(obj) {
      return obj.type === "CHECKING" ? "CheckingAccount" : "SavingsAccount";
    },
  },
};

makeExecutableSchema({ typeDefs, resolvers });
```

#### Key Points

- Objects are the only interface implementors.
- Concrete fields extend the contract.
- Runtime type identification is mandatory for interface returns.

#### Best Practices

- Co-locate interface and implementors in documentation.
- Use enums on the backing model to drive `__resolveType`.
- Unit-test schema with `graphql`’s `validate`.

#### Common Mistakes

- Returning plain objects without a discriminant for `__resolveType`.
- Implementing partially in federated subgraphs.

---

### 13.2.2 Shared Fields

#### Beginner

**Shared fields** live on the interface and appear on every implementor with the same meaning: `id`, `createdAt`, `title`.

#### Intermediate

Shared fields should be **semantically consistent** across types. If `title` means different things, prefer narrower interfaces or separate fields.

#### Expert

For fields expensive to compute, consider moving them behind a nested type or using DataLoader at the interface field resolver if your framework supports interface-level resolvers.

```graphql
interface Content {
  id: ID!
  title: String!
  publishedAt: String
}

type BlogPost implements Content {
  id: ID!
  title: String!
  publishedAt: String
  slug: String!
}

type Video implements Content {
  id: ID!
  title: String!
  publishedAt: String
  durationSeconds: Int!
}
```

#### Key Points

- Shared fields define polymorphic queries.
- Semantic drift confuses API consumers.
- Performance still matters for shared fields.

#### Best Practices

- Name fields consistently with your domain ubiquitous language.
- Add descriptions when semantics differ slightly but share a name.
- Measure resolver cost for list+interface fields.

#### Common Mistakes

- Overloading one field name with unrelated meanings.
- Returning different JSON shapes for the “same” field.

---

### 13.2.3 Additional Fields

#### Beginner

**Additional fields** exist only on concrete types (`Video.durationSeconds`). Clients must use inline fragments to read them.

#### Intermediate

Additional fields are how interfaces stay small while types stay expressive. Avoid duplicating the same additional field on many types without abstraction—consider a new interface.

#### Expert

Client codegen generates discriminated unions for interface returns. Additional fields drive helpful autocomplete when `__typename` is queried.

```graphql
type PullRequest implements Node {
  id: ID!
  title: String!
  diffStat: DiffStat!
}

type Issue implements Node {
  id: ID!
  title: String!
  labels: [String!]!
}
```

```graphql
query {
  workItem(id: "42") {
    ... on Node {
      id
      title
    }
    ... on PullRequest {
      diffStat {
        additions
        deletions
      }
    }
    ... on Issue {
      labels
    }
  }
}
```

#### Key Points

- Concrete-only fields need fragments.
- Keeps interface contracts minimal.
- Enables type-specific UX.

#### Best Practices

- Prefer reusing nested types for repeated additional clusters.
- Document which types implement which optional capabilities.
- Avoid leaking internal columns as additional fields.

#### Common Mistakes

- Putting type-specific fields on the interface “for convenience.”
- Breaking clients by moving fields between interface and concrete types without deprecation.

---

### 13.2.4 Type Resolution

#### Beginner

**Type resolution** picks the concrete GraphQL type for a value when the schema type is an interface or union. In `graphql-js`, implement `__resolveType(obj, context, info)` on the interface resolver map.

#### Intermediate

Alternative: `isTypeOf` on each concrete type resolver. `__resolveType` is usually simpler when one function can inspect discriminants.

#### Expert

Federation uses `__resolveReference` and entity keys; still, interface resolution in subgraphs must agree on typenames. Misconfigured resolution yields “Abstract type X must resolve to an Object type” errors.

```javascript
const resolvers = {
  SearchResult: {
    __resolveType(hit) {
      if (hit.__typename) return hit.__typename;
      if (hit.username) return "UserHit";
      if (hit.repoName) return "RepoHit";
      return null;
    },
  },
};
```

#### Key Points

- Every abstract type needs a resolver strategy.
- Return GraphQL type **names as strings**, not objects.
- Fast branches (tags, enums) beat deep inspection.

#### Best Practices

- Store `type` or `__typename` on objects at rest layer when possible.
- Default `__resolveType` to fail loudly in development if unknown.
- Log unknown shapes with safe sampling.

#### Common Mistakes

- Returning `undefined` or wrong strings from `__resolveType`.
- Relying on `instanceof` across service boundaries (serialized JSON loses classes).

---

### 13.2.5 Fragment Spreading

#### Beginner

**Fragments** let clients reuse selections. **Spreading** on interfaces: `fragment NodeFields on Node { id }` works wherever `Node` is returned.

#### Intermediate

Named fragments must be on concrete types or interfaces that the selection validates against. Inline fragments `... on User` specialize within an interface field.

#### Expert

Fragment colocation (Relay) keeps UI components tied to GraphQL fragments. Beware fragment cycles and conflicting field arguments—GraphQL forbids ambiguous selections.

```graphql
fragment NodeId on Node {
  id
}

query {
  me {
    ...NodeId
    ... on User {
      email
    }
  }
}
```

```javascript
// graphql-tag/Apollo: compose fragments in UI
// Server: no special handling — validation only
```

#### Key Points

- Fragments reduce duplication and encourage consistency.
- Interface-targeted fragments apply to all implementors.
- Combine with `__typename` for client normalization.

#### Best Practices

- Name fragments with component or domain names.
- Keep fragments small and composable.
- Validate operations in CI with the same schema as production.

#### Common Mistakes

- Defining fragments on concrete types but forgetting them when adding new implementors.
- Conflicting fields with different arguments in merged fragments.

---

## 13.3 Interface Patterns

### 13.3.1 Node Interface Pattern

#### Beginner

The **Node** interface (Relay-style) exposes `id: ID!` as a **global object identifier**. Clients refetch any node by `id` via `node(id:)` root field.

#### Intermediate

Global IDs are often base64-encoded `TypeName:localId` strings. The server parses them in `node` resolver to load the correct entity.

#### Expert

Relay compiler relies on `Node` for pagination and store updates. If you adopt `Node`, implement `fromGlobalId`/`toGlobalId` helpers and enforce type safety when decoding.

```graphql
interface Node {
  id: ID!
}

type Query {
  node(id: ID!): Node
}
```

```javascript
function toGlobalId(type, id) {
  return Buffer.from(`${type}:${id}`).toString("base64");
}

function fromGlobalId(globalId) {
  const [type, id] = Buffer.from(globalId, "base64").toString().split(":");
  return { type, id };
}
```

#### Key Points

- Global IDs decouple client cache from table primary keys.
- `node` enables refetch and tooling.
- Encode type to disambiguate numeric IDs.

#### Best Practices

- Document whether IDs are opaque or parseable.
- Use URL-safe base64 encodings.
- Rate-limit `node` to prevent enumeration attacks if sensitive.

#### Common Mistakes

- Exposing raw database integers as `Node` IDs without type prefix.
- Forgetting to implement `Node` for some entities but exposing them elsewhere.

---

### 13.3.2 Timestamped Interface

#### Beginner

A **Timestamped** interface groups `createdAt` and `updatedAt` fields for audit display. Many record types implement it.

#### Intermediate

Use a `DateTime` scalar instead of `String` when available. Ensure time zone semantics are documented (UTC vs local).

#### Expert

For soft deletes, extend with `deletedAt` on a `SoftDeletable` interface rather than overloading `Timestamped`. Row-level security and resolvers should respect deleted flags consistently.

```graphql
interface Timestamped {
  createdAt: String!
  updatedAt: String!
}

type Comment implements Timestamped {
  id: ID!
  body: String!
  createdAt: String!
  updatedAt: String!
}
```

#### Key Points

- Cross-cutting audit fields fit interfaces well.
- Scalar choice matters for clients.
- Split concerns (`Deletable`, `Timestamped`) cleanly.

#### Best Practices

- Store UTC; format at the edge if needed.
- Use server-set timestamps on writes, not client-supplied.
- Index `createdAt` for common sorts.

#### Common Mistakes

- Inconsistent precision (some rows milliseconds, some seconds).
- Client clocks setting `createdAt`.

---

### 13.3.3 Entity Interface

#### Beginner

An **Entity** interface captures shared identity and naming: `id`, `name`, `slug`. Useful for search results and admin UIs.

#### Intermediate

Pair with a union of concrete entities if search returns heterogeneous rows, or return an interface list if all implementors share enough fields.

#### Expert

In federation, `extend type` and `@key` define entities; interface patterns still apply within a subgraph for local polymorphism.

```graphql
interface NamedEntity {
  id: ID!
  name: String!
}

type Product implements NamedEntity {
  id: ID!
  name: String!
  sku: String!
}

type Brand implements NamedEntity {
  id: ID!
  name: String!
  logoUrl: String
}
```

#### Key Points

- Entity interfaces simplify generic UI components.
- Still need fragments for SKU vs logo.
- Good for autocomplete result rows.

#### Best Practices

- Keep `name` human-readable; use `slug` for URLs.
- Avoid overloading `name` with HTML.
- Localize display names at the presentation layer when needed.

#### Common Mistakes

- Using `Entity` as a catch-all with too many unrelated types.
- Missing slug uniqueness constraints in the database.

---

### 13.3.4 Hierarchical Interfaces

#### Beginner

**Hierarchical interfaces** model refinement: `Animal` → `Pet` → `Dog` is expressed in GraphQL by interfaces extending interfaces (`Pet implements Animal` conceptually via `interface Pet implements Animal` in SDL).

#### Intermediate

GraphQL allows `interface Pet implements Animal`. Objects implement the leaf interfaces and must satisfy the entire chain.

#### Expert

Deep hierarchies can confuse API explorers; prefer shallow interfaces plus composition (nested objects) when the hierarchy is mostly internal to your domain model.

```graphql
interface Animal {
  species: String!
}

interface Pet implements Animal {
  species: String!
  name: String!
}

type Dog implements Pet & Animal {
  species: String!
  name: String!
  breed: String!
}
```

#### Key Points

- Interface extension chains express refinement.
- Objects list all implemented interfaces explicitly in SDL.
- Validation ensures transitive fields match.

#### Best Practices

- Prefer two-level hierarchies in public APIs.
- Document which queries return which abstraction level.
- Test objects at the leaf types thoroughly.

#### Common Mistakes

- Assuming Java-style subclass polymorphism on the wire.
- Breaking implementors when extending a parent interface.

---

### 13.3.5 Composition Over Inheritance

#### Beginner

GraphQL favors **composition**: embed `Author` or `AuditInfo` types rather than deep interface trees. Interfaces should stay thin.

#### Intermediate

When two types share structure but not identity, use a shared **object type** referenced by field instead of forcing an interface.

#### Expert

Over-interface-ization hurts evolution: adding a field to an interface touches every implementor. Nested `metadata` objects or feature-specific interfaces reduce blast radius.

```graphql
type AuditInfo {
  createdAt: String!
  createdBy: ID!
}

type Order {
  id: ID!
  audit: AuditInfo!
}

type Invoice {
  id: ID!
  audit: AuditInfo!
}
```

#### Key Points

- Composition uses fields, not `implements`.
- Reduces forced changes across many types.
- Clearer for partial data loading.

#### Best Practices

- Reach for composition first; add interfaces when polymorphic queries are real.
- Use DataLoader to batch nested `audit` loads.
- Keep shared value objects versioned carefully.

#### Common Mistakes

- Creating interfaces for one-off sharing.
- Duplicating `AuditInfo` fields inline on ten types.

---

## 13.4 Unions

### 13.4.1 Union Type Definition

#### Beginner

A **union** type represents **one of several object types**. Unlike interfaces, unions do not declare fields—members are object types only. Clients use fragments to select fields per member.

#### Intermediate

Syntax: `union SearchResult = User | Post | Comment`. Unions cannot include interfaces or scalars directly as members in standard GraphQL.

#### Expert

Unions are useful for heterogenous collections without a shared interface, or when shared fields are too weak to justify an interface. Schema stitching must align union definitions across merged schemas.

```graphql
union CheckoutResult = SuccessfulCheckout | PaymentFailed
```

```javascript
const { buildSchema } = require("graphql");
const schema = buildSchema(`
  type SuccessfulCheckout { orderId: ID! }
  type PaymentFailed { reason: String! }
  union CheckoutResult = SuccessfulCheckout | PaymentFailed
  type Mutation {
    checkout: CheckoutResult!
  }
`);
```

#### Key Points

- Unions are abstract like interfaces but member-based, not field-based.
- No fields on the union itself.
- Great for success/failure variants.

#### Best Practices

- Name unions by role (`CheckoutResult`, `Notification`).
- Prefer small unions (2–5 members) for clarity.
- Document exclusivity (exactly one outcome).

#### Common Mistakes

- Trying to put `String` or `interface` in a union.
- Using unions where a single object with nullable fields would be simpler.

---

### 13.4.2 Union Members

#### Beginner

**Members** are object types listed after `=`, separated by `|`. Each member should be mutually exclusive in meaning (success vs error, different notification kinds).

#### Intermediate

The same object type cannot appear twice. Member names must be unique object types in the schema.

#### Expert

In federation, unions may reference types from the same subgraph or require composition support; conflicting member types across subgraphs need resolution at the gateway.

```graphql
union MessageContent = TextMessage | ImageMessage | SystemEvent
```

```graphql
query {
  message(id: "1") {
    content {
      __typename
      ... on TextMessage {
        body
      }
      ... on ImageMessage {
        url
      }
      ... on SystemEvent {
        code
      }
    }
  }
}
```

#### Key Points

- Each member is a full object type elsewhere in the schema.
- `__typename` disambiguates in results.
- Members should not overlap confusingly.

#### Best Practices

- Add a short description on the union explaining when each member appears.
- Keep member fields orthogonal to reduce fragment duplication.
- Version new members additively.

#### Common Mistakes

- Two members with nearly identical fields confusing clients.
- Returning a member not declared in the schema (resolution bug).

---

### 13.4.3 Querying Unions

#### Beginner

You cannot select fields directly on a union without knowing the member. Start with `__typename`, then **inline fragments** per member.

#### Intermediate

If members implement a **common interface**, you can query interface fields on the union field **only if** the union is replaced by that interface in your design—standard GraphQL does not allow querying interface fields on a union directly unless the field return type is the interface.

#### Expert

Some schemas model polymorphism as `union X = A | B` where `A` and `B` implement `I`; the field return type should often be `I` instead of `union` to allow shared selections. Choose union vs interface deliberately.

```graphql
union Result = Ok | Err

type Query {
  result: Result!
}

type Ok {
  value: Int!
}

type Err {
  message: String!
}
```

```graphql
query {
  result {
    ... on Ok {
      value
    }
    ... on Err {
      message
    }
  }
}
```

#### Key Points

- Unions force explicit handling per member.
- Helps exhaustive handling in typed clients.
- `__typename` is essential for client switches.

#### Best Practices

- Generate TypeScript discriminated unions from operations.
- Handle unknown future members gracefully in UIs if possible.
- Test all members in CI with fixture queries.

#### Common Mistakes

- Selecting a field that exists on only one member without a fragment.
- Assuming a union inherits fields from a similar interface.

---

### 13.4.4 Inline Fragments with Unions

#### Beginner

**Inline fragments** `... on MemberType { fields }` specialize the selection set. They are required for union field subselections.

#### Intermediate

You can combine multiple inline fragments at the same level; directives (`@include`) can wrap fragments for conditional fetching.

#### Expert

Fragment spreads can target union members if the spread’s type condition is valid for the parent selection type. Validate with `graphql` in CI to catch invalid spreads.

```graphql
query Notifications {
  inbox {
    items {
      ... on FollowNotification {
        actor {
          login
        }
      }
      ... on MentionNotification {
        postId
        snippet
      }
    }
  }
}
```

```javascript
const resolvers = {
  InboxItem: {
    __resolveType(n) {
      return n.kind;
    },
  },
};
```

#### Key Points

- Inline fragments are the primary union querying tool.
- Named fragments can also target member types.
- Directives work inside fragments.

#### Best Practices

- Colocate fragments with UI components per member.
- Prefer exhaustive fragments in admin tools; minimal fragments in mobile.
- Use eslint-plugin-graphql to validate operations.

#### Common Mistakes

- Nesting fragments that contradict type conditions.
- Duplicating large selections across members—extract nested types.

---

### 13.4.5 Type Resolution

#### Beginner

Union **type resolution** is identical in spirit to interfaces: implement `__resolveType` on the union’s resolver map to return the member type name.

#### Intermediate

Alternatively `isTypeOf` on each member type’s resolver. Ensure every possible value maps to a declared union member.

#### Expert

When values come from external systems, normalize them into discriminated objects before GraphQL execution. Consider zod parsing at the boundary.

```javascript
const resolvers = {
  CheckoutResult: {
    __resolveType(value) {
      if (value.success) return "SuccessfulCheckout";
      return "PaymentFailed";
    },
  },
};
```

#### Key Points

- Unions cannot be resolved without a strategy.
- Returning a typename outside the union is invalid.
- Keep mapping logic centralized.

#### Best Practices

- Store `kind` or `__typename` in databases when feasible.
- Unit-test resolver with each branch.
- Fail fast in dev on unknown discriminants.

#### Common Mistakes

- Defaulting to a member type incorrectly on ambiguous data.
- Case-sensitive string mismatches (`"user"` vs `"User"`).

---

## 13.5 Union Patterns

### 13.5.1 Error Unions (Result Pattern)

#### Beginner

Return a **union** of success and error types instead of only throwing exceptions for expected failures (card declined, validation). This keeps errors **typed** in the schema.

#### Intermediate

Clients use fragments to show UI per error kind. Still use top-level GraphQL `errors` for truly exceptional cases (bugs, auth system down).

#### Expert

Align with your observability: log business errors inside resolvers, attach `extensions` when you also surface GraphQL errors for hybrid models.

```graphql
union RegisterResult = RegisteredUser | EmailTaken | WeakPassword

type RegisteredUser {
  user: User!
}

type EmailTaken {
  email: String!
}

type WeakPassword {
  rules: [String!]!
}
```

```javascript
async function register(input) {
  const taken = await db.users.findByEmail(input.email);
  if (taken) return { __typename: "EmailTaken", email: input.email };
  const pw = validatePassword(input.password);
  if (!pw.ok) return { __typename: "WeakPassword", rules: pw.rules };
  const user = await db.users.create(input);
  return { __typename: "RegisteredUser", user };
}
```

#### Key Points

- Typed errors improve client UX and codegen.
- Not a replacement for auth failures at the HTTP/gateway layer.
- Document which outcomes are retryable.

#### Best Practices

- Keep error members stable; add fields additively.
- Include machine-readable codes inside error members.
- Monitor rates per member type.

#### Common Mistakes

- Putting stack traces inside union error types.
- Using unions for every validation while ignoring `errors` array patterns your clients expect.

---

### 13.5.2 Search Result Union

#### Beginner

**Search** returns heterogeneous hits: users, repos, issues. A `union SearchHit = User | Repo | Issue` models that explicitly.

#### Intermediate

Add a shared `score: Float` on each member or an interface if all hits share fields—often `SearchHit` interface is better than union if overlap is high.

#### Expert

For large indices, return a lightweight `SearchHitPreview` union members with `id` and `snippet`, then client refetches detail via `node` or dedicated queries.

```graphql
union GlobalSearchResult = UserSearchHit | ArticleSearchHit

type UserSearchHit {
  user: User!
  score: Float!
}

type ArticleSearchHit {
  article: Article!
  score: Float!
  highlights: [String!]!
}
```

#### Key Points

- Unions express diverse search rows clearly.
- Score and highlights differ per type—fragments help.
- Good fit when overlap is small.

#### Best Practices

- Paginate search unions with cursors.
- Sanitize highlight HTML/snippets.
- Cap result counts and query complexity.

#### Common Mistakes

- Returning full documents for every hit (payload bloat).
- Missing `__resolveType` for search engine JSON rows.

---

### 13.5.3 Notification Union

#### Beginner

**Notifications** vary by kind: follow, mention, billing alert. `union Notification = Follow | Mention | Billing` matches product mental models.

#### Intermediate

Each member carries different payloads (`actor`, `postId`, `invoiceId`). Deep-link URLs can be fields on each member.

#### Expert

Push notification serialization can mirror GraphQL members for mobile clients; keep a mapping table from `kind` to template IDs.

```graphql
union Notification = NewFollowerNotification | PostLikedNotification

type NewFollowerNotification {
  id: ID!
  follower: User!
  read: Boolean!
}

type PostLikedNotification {
  id: ID!
  liker: User!
  post: Post!
  read: Boolean!
}
```

#### Key Points

- Unions model polymorphic feeds well.
- `read`, `id` can repeat—consider interface `ReadableNotification`.
- Align with event sourcing types internally.

#### Best Practices

- Use cursor pagination for notification lists.
- Mark deprecated notification kinds before removal.
- Test mark-as-read mutations per kind.

#### Common Mistakes

- Duplicating `read` without an interface when many fields repeat.
- Returning stale nested objects without batching.

---

### 13.5.4 Response Union

#### Beginner

A **response union** wraps operation outcomes beyond mutations—queries that may return permission-denied vs data, for example—using union members instead of nullable everything.

#### Intermediate

This pattern trades nullable fields for explicit branches. Use sparingly on queries to avoid surprising clients expecting simple nulls.

#### Expert

For authorization, many APIs prefer `null` + extensions or partial errors; response unions shine when multiple distinct “no data” reasons need rich typing.

```graphql
union ProfileView = PublicProfile | PrivateProfile | NotFound

type PublicProfile {
  user: User!
  stats: UserStats!
}

type PrivateProfile {
  reason: String!
}

type NotFound {
  id: ID!
}
```

```javascript
async function profileView(id, viewer) {
  const user = await db.users.byId(id);
  if (!user) return { __typename: "NotFound", id };
  if (!canView(viewer, user)) {
    return { __typename: "PrivateProfile", reason: "FRIENDS_ONLY" };
  }
  return { __typename: "PublicProfile", user, stats: await statsFor(user) };
}
```

#### Key Points

- Makes authorization outcomes explicit.
- Increases query verbosity—worth it for sensitive UIs.
- Combine with audit logging per branch.

#### Best Practices

- Document privacy implications per member.
- Avoid leaking existence when policy requires ambiguity—shape responses accordingly.
- Keep members minimal for mobile bandwidth.

#### Common Mistakes

- Using response unions for every nullable query (schema bloat).
- Exposing sensitive reasons in `PrivateProfile`.

---

### 13.5.5 Payload Union

#### Beginner

**Payload unions** wrap mutation results: `CreatePostResult = PostCreated | ValidationError`. This extends the Relay payload idea with typed variants.

#### Intermediate

Include a `query: Query` field on success members if using Relay cache refresh patterns; error members may omit it.

#### Expert

For transactions, return a union that includes `ConcurrencyConflict` with `baseVersion` and `currentVersion` fields for optimistic locking.

```graphql
union UpdateTitleResult = TitleUpdated | ConcurrentModification

type TitleUpdated {
  post: Post!
}

type ConcurrentModification {
  currentTitle: String!
  expectedVersion: Int!
  actualVersion: Int!
}
```

#### Key Points

- Payload unions clarify mutation stories.
- Good for optimistic concurrency.
- Pair with UI retry flows.

#### Best Practices

- Keep success member first in docs/examples.
- Add `clientMutationId` echo on success members if using Relay.
- Log conflicts at info level, not error, if expected.

#### Common Mistakes

- Returning both union error and throwing GraphQL error for the same case.
- Omitting `actualVersion` so clients cannot merge.

---

## 13.6 Advanced Patterns

### 13.6.1 Interface Extending

#### Beginner

Interfaces can **extend** other interfaces: `interface Node { id }` then `interface Resource implements Node { id url }`. Implementing objects must satisfy all fields.

#### Intermediate

This models refinement without duplicating field lists. SDL order: `interface Child implements Parent { ... }`.

#### Expert

Transitive closure is validated by the reference implementation. When merging schemas, parent and child interfaces must be compatible across sources.

```graphql
interface Node {
  id: ID!
}

interface Resource implements Node {
  id: ID!
  url: String!
}

type Document implements Resource {
  id: ID!
  url: String!
  mimeType: String!
}
```

#### Key Points

- Interface extension reduces duplication.
- Objects implement leaf interfaces but must include all inherited fields.
- Different from OOP class extension semantics.

#### Best Practices

- Prefer shallow extension chains.
- Document inherited fields once on the parent interface.
- Update all implementors when parent interfaces evolve.

#### Common Mistakes

- Forgetting inherited fields when reading SDL quickly.
- Incompatible argument definitions on overridden fields (invalid).

---

### 13.6.2 Recursive Interfaces

#### Beginner

**Recursion** appears when an interface or type references itself indirectly, for example `interface Category { children: [Category!]! }`—actually `Category` must be an object or interface with a field whose type involves `Category`.

#### Intermediate

Typical pattern: `type TreeNode { value: String!, children: [TreeNode!]! }`. Interfaces can participate if `TreeNode implements Node`.

#### Expert

Depth limits are not enforced by GraphQL—your resolvers must guard against unbounded traversal (stack overflow, DoS). Use `maxDepth` arguments or pagination on children.

```graphql
interface CommentThread {
  id: ID!
  replies: [CommentThread!]!
}

type Comment implements CommentThread {
  id: ID!
  body: String!
  replies: [CommentThread!]!
}
```

```javascript
async function replies(parent, args, ctx, info) {
  const depth = getDepth(info);
  if (depth > 20) throw new GraphQLError("Max thread depth exceeded");
  return ctx.loaders.replies.load(parent.id);
}
```

#### Key Points

- Recursion is expressive for trees and threads.
- Server must enforce depth and breadth limits.
- DataLoader helps avoid N+1 per level.

#### Best Practices

- Add `totalReplyCount` on parent for UI without loading all children.
- Use cursor pagination for large reply lists.
- Test cyclic graphs in data (malformed imports).

#### Common Mistakes

- Infinite resolver recursion on accidental self-parent rows.
- No limits on `replies` fanout.

---

### 13.6.3 Generic Interfaces

#### Beginner

GraphQL has **no generics** in the spec. “Generic interface” means a **documentation/codegen pattern**: `Edge<Node>` in TypeScript maps to concrete `UserEdge`, `PostEdge` SDL types.

#### Intermediate

Relay’s Connection spec is a **convention** that repeats `PageInfo`, `edges`, `cursor` fields per node type—not true generics.

#### Expert

Code-first tools may generate interfaces from generic TS types, but emitted SDL is always monomorphic. Plan for many similarly named types.

```graphql
type UserEdge {
  cursor: String!
  node: User!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type PostEdge {
  cursor: String!
  node: Post!
}
```

```javascript
// TypeScript helper type — not in GraphQL schema
/** @template T */
function createEdgeTypeSDL(name, nodeName) {
  return `
    type ${name}Edge {
      cursor: String!
      node: ${nodeName}!
    }
  `;
}
```

#### Key Points

- SDL repetition replaces generics.
- Conventions (Connection) reduce design fatigue.
- Codegen can hide duplication for authors.

#### Best Practices

- Follow Relay Connection spec for lists when using Relay.
- Name `{Type}Edge` and `{Type}Connection` consistently.
- Share `PageInfo` type across connections.

#### Common Mistakes

- Expecting `interface Edge<T>` in raw SDL.
- Diverging connection field names from the spec without reason.

---

### 13.6.4 Typed Nodes

#### Beginner

**Typed nodes** combine `Node` with `__typename` usage so clients normalize caches and route UI by type. Often paired with global IDs encoding type.

#### Intermediate

Expose `node(id:)` returning `Node` and optionally `nodes(ids:)` for batch refetch. Ensure `__resolveType` matches encoded type in `fromGlobalId`.

#### Expert

For Apollo Client, include `__typename` in selections; configure `possibleTypes` or `fragmentMatcher` for polymorphic data when using cache policies.

```graphql
query {
  node(id: "VXNlcjox") {
    __typename
    id
    ... on User {
      handle
    }
    ... on Organization {
      orgLogin
    }
  }
}
```

```javascript
const Node = {
  __resolveType(obj, _ctx, info) {
    const { type } = fromGlobalId(obj.id);
    return type;
  },
};
```

#### Key Points

- Typed nodes unify refetch and polymorphism.
- Global IDs must decode reliably.
- Client caches rely on `__typename`.

#### Best Practices

- Always query `__typename` on abstract fields.
- Test refetch queries for each implementor.
- Rotate encoding if needed with dual-read periods.

#### Common Mistakes

- Global IDs that omit type prefix.
- Mismatch between DB type rename and encoded typename.

---

### 13.6.5 Protocol Pattern

#### Beginner

The **protocol pattern** defines an interface as a **contract** for plugin-like features: `Runnable { run(input: RunInput!): RunResult! }` that multiple types implement.

#### Intermediate

Useful for workflows, integrations, or actions exposed uniformly in admin tools. Clients iterate `availableActions` returning `[Action!]!` where `Action` is an interface.

#### Expert

Back the protocol with a registry map in code: `handlers[typeName](ctx, input)`. Validate permissions per handler before execution.

```graphql
interface AdminAction {
  id: ID!
  label: String!
}

type BanUserAction implements AdminAction {
  id: ID!
  label: String!
  userId: ID!
}

type RefundOrderAction implements AdminAction {
  id: ID!
  label: String!
  orderId: ID!
}
```

```javascript
const handlers = {
  BanUserAction(ctx, payload) {
    return ctx.moderation.ban(payload.userId);
  },
  RefundOrderAction(ctx, payload) {
    return ctx.billing.refund(payload.orderId);
  },
};

async function executeAdminAction(ctx, action) {
  const fn = handlers[action.__typename];
  if (!fn) throw new GraphQLError("Unknown action");
  return fn(ctx, action);
}
```

#### Key Points

- Interfaces model open sets of behaviors.
- Server-side registry dispatches execution.
- Good for extensible admin APIs.

#### Best Practices

- Strong authz checks per action type.
- Audit log action executions with actor id.
- Version actions when payloads change.

#### Common Mistakes

- Exposing dangerous actions to insufficiently privileged roles.
- No server-side allowlist (trusting client typename).

---
