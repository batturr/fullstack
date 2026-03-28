# Aliases and Fragments

## 📑 Table of Contents

- [9.1 Aliases](#91-aliases)
  - [9.1.1 Alias Syntax](#911-alias-syntax)
  - [9.1.2 Field Aliasing](#912-field-aliasing)
  - [9.1.3 Multiple Aliases](#913-multiple-aliases)
  - [9.1.4 Nested Aliases](#914-nested-aliases)
  - [9.1.5 Alias Use Cases](#915-alias-use-cases)
- [9.2 Alias Patterns](#92-alias-patterns)
  - [9.2.1 Field Renaming](#921-field-renaming)
  - [9.2.2 Multiple Similar Queries](#922-multiple-similar-queries)
  - [9.2.3 Conditional Aliasing](#923-conditional-aliasing)
  - [9.2.4 Performance Patterns](#924-performance-patterns)
  - [9.2.5 Data Transformation](#925-data-transformation)
- [9.3 Fragments](#93-fragments)
  - [9.3.1 Fragment Syntax](#931-fragment-syntax)
  - [9.3.2 Named Fragments](#932-named-fragments)
  - [9.3.3 Fragment Reuse](#933-fragment-reuse)
  - [9.3.4 Fragment Composition](#934-fragment-composition)
  - [9.3.5 Nested Fragments](#935-nested-fragments)
- [9.4 Fragment Patterns](#94-fragment-patterns)
  - [9.4.1 Shared Field Selection](#941-shared-field-selection)
  - [9.4.2 Type-Specific Fragments](#942-type-specific-fragments)
  - [9.4.3 Conditional Fragments](#943-conditional-fragments)
  - [9.4.4 Fragment Inheritance](#944-fragment-inheritance)
  - [9.4.5 Dynamic Fragments](#945-dynamic-fragments)
- [9.5 Advanced Fragment Usage](#95-advanced-fragment-usage)
  - [9.5.1 Inline Fragments](#951-inline-fragments)
  - [9.5.2 Fragment Spread](#952-fragment-spread)
  - [9.5.3 Fragment Composition](#953-fragment-composition)
  - [9.5.4 Fragment Variables](#954-fragment-variables)
  - [9.5.5 Performance Optimization](#955-performance-optimization)

---

## 9.1 Aliases

### 9.1.1 Alias Syntax

#### Beginner

An **alias** renames a field in the **response JSON** without changing the schema field name. Syntax: `aliasName: fieldName` or `aliasName: fieldName(args)`. The left side is the key clients see in `data`; the right side is the actual schema field being resolved.

Aliases solve the JSON object key collision problem: duplicate keys are illegal in JSON, so you cannot request `user(id: "1")` and `user(id: "2")` side by side without aliases.

#### Intermediate

Aliases apply per **selection** in the query document. They do not affect resolver behavior—only the shape of the output map. The `responsePath` in errors uses aliases where present, which helps debugging.

Parser AST nodes are `Field` with `alias` optional property. Tools like Prettier preserve alias spacing consistently.

#### Expert

**Defer/stream** (when available) and tracing spans often label nodes by alias or field name. Federation gateways rewrite selections; aliases must remain stable for client caches to match.

```graphql
query TwoUsers {
  first: user(id: "1") {
    name
  }
  second: user(id: "2") {
    name
  }
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  type Query { user(id: ID!): User }
  type User { name: String }
`);

const res = await graphql({
  schema,
  source: `query TwoUsers {
    first: user(id: "1") { name }
    second: user(id: "2") { name }
  }`,
  rootValue: {
    user: ({ id }) => ({ name: `User-${id}` }),
  },
});
console.log(res.data);
```

#### Key Points

- Alias is client-side naming for the response; schema field name stays the same.
- Required when the same field appears twice with different arguments.
- Errors’ `path` arrays include alias names.

#### Best Practices

- Use meaningful alias names (`viewer`, `assignee`) not `x`, `y`.
- Keep aliases stable across app versions when persisted in caches.

#### Common Mistakes

- Thinking aliases rename schema fields (they do not).
- Using invalid GraphQL names for aliases (must match `Name` token rules).

---

### 9.1.2 Field Aliasing

#### Beginner

**Field aliasing** means attaching an alias to a single field selection: `fullName: name` if the schema field is `name` but your UI component expects `fullName`. This is a presentation-layer rename without server changes.

It is especially useful when migrating UIs or aligning GraphQL responses with existing TypeScript interfaces.

#### Intermediate

Aliasing works for **any field** on any type, including root fields and nested object fields. You can alias a list field: `open: issues(state: OPEN)`.

Nested selections go inside braces after the aliased field as usual.

#### Expert

**GraphQL codegen** can map aliases to property names in generated types if configured; otherwise TypeScript types follow schema field names and you rename in client mapping. Some teams avoid aliases for this reason and use client-side mappers instead.

```graphql
query Profile {
  me {
    display: name
    handle: login
  }
}
```

#### Key Points

- Rename at query time for client ergonomics.
- Works at any depth in the tree.
- Codegen defaults may ignore alias preferences—configure carefully.

#### Best Practices

- Prefer schema naming that matches product language when possible.
- Document when aliases exist for backwards compatibility.

#### Common Mistakes

- Aliasing only the outer field but expecting inner fields to rename (they do not).
- Creating confusing aliases that hide the real domain name.

---

### 9.1.3 Multiple Aliases

#### Beginner

You can apply **many aliases** in one selection set: each line `alias: field` adds another key to the parent object. There is no hard GraphQL limit; practical limits are payload size and human readability.

This pattern fetches several slices of the same collection with different filters.

#### Intermediate

Each aliased field is **independent** for execution: the spec treats sibling fields as parallelizable. Ten aliases to the same resolver still mean ten logical units of work unless batched internally.

#### Expert

**Query cost** analyzers should count each aliased field separately. N+1 batching via DataLoader keys on parent+args; identical resolvers with different args produce different cache keys.

```graphql
query IssueCounts {
  open: issues(state: OPEN) { totalCount }
  closed: issues(state: CLOSED) { totalCount }
}
```

```javascript
const root = {
  issues: ({ state }) => ({ totalCount: state === "OPEN" ? 3 : 10 }),
};
```

#### Key Points

- Many aliases = many sibling fields in one object.
- Execution may parallelize per spec.
- Cost and batching scale with alias count.

#### Best Practices

- Collapse repeated shapes into fragments (topic 9.3).
- Cap alias fan-out for the same expensive field.

#### Common Mistakes

- Assuming aliases dedupe network calls automatically—they do not without batching.
- Generating unbounded aliases from user input (DoS risk).

---

### 9.1.4 Nested Aliases

#### Beginner

Aliases can appear on **nested** fields, not only the root. Each level builds nested JSON keys under the parent alias or field.

Structure mirrors the query tree: `user { a: posts { ... } b: followers { ... } }`.

#### Intermediate

Path arrays in errors drill through aliases at each level: `["user", "a", 0, "title"]`. Client caches (Apollo) use paths that incorporate aliases for normalized stores when configured.

#### Expert

**Max depth** limits count nested levels regardless of aliases. Complex nested alias trees complicate persisted query allow lists—lint for readability.

```graphql
query {
  user(id: "1") {
    written: posts { id title }
    liked: likedPosts { id title }
  }
}
```

#### Key Points

- Aliases nest naturally with selection sets.
- Error paths reflect alias names at each level.
- Deep nesting increases validation and execution work.

#### Best Practices

- Extract repeated nested groups into fragments.
- Keep nesting depth within team lint rules.

#### Common Mistakes

- Omitting sub-selection on object fields after an alias (validation error).
- Confusing parent alias scope with child field names.

---

### 9.1.5 Alias Use Cases

#### Beginner

Common **use cases**: comparing two entities side by side, fetching two configurations, legacy JSON shape compatibility, and A/B feature flags where two similar fields are requested once.

Aliases also clarify intent in large queries (`assignee`, `reporter` both `user` fields).

#### Intermediate

**Relay** connections often use aliases when querying the same connection with different arguments. Pagination cursors are per field occurrence.

#### Expert

**Schema stitching** might expose the same underlying field through different gateway names; aliases help client-side normalization. For **subscriptions**, aliases distinguish multiple root subscription fields in one document if your server allows.

```graphql
query Ticket($id: ID!) {
  ticket(id: $id) {
    reporter: user(idField: reporterId) { name }
    assignee: user(idField: assigneeId) { name }
  }
}
```

#### Key Points

- Use cases center on disambiguation and response shaping.
- Pair with variables for dynamic IDs.
- Consider fragments when the pattern repeats.

#### Best Practices

- Name aliases after domain roles, not implementation.
- Review alias-heavy queries in code review.

#### Common Mistakes

- Overusing aliases instead of improving schema clarity.
- Breaking mobile clients by renaming aliases without coordination.

---

## 9.2 Alias Patterns

### 9.2.1 Field Renaming

#### Beginner

**Field renaming** via alias lets the client adopt new vocabulary (`sku: productCode`) while the schema stays stable during migration windows.

This is a reversible client-side change—no server deploy required.

#### Intermediate

When the schema **does** rename a field, use `@deprecated` on the old field and update clients; aliases cannot fix a removed schema field.

#### Expert

**Versioned** mobile apps may ship queries with aliases mapping old UI labels to new schema names across releases.

```graphql
query Product {
  product(id: "1") {
    sku: code
    title: name
  }
}
```

#### Key Points

- Alias rename is client-only; schema rename is server-side.
- Deprecated fields + new fields is the migration path for APIs.
- Aliases help bridge UI/schema mismatches temporarily.

#### Best Practices

- Track alias usage; remove after schema catches up.
- Prefer schema `description` to teach the canonical name.

#### Common Mistakes

- Aliasing to hide a poorly named schema field forever.
- Inconsistent aliases across platforms.

---

### 9.2.2 Multiple Similar Queries

#### Beginner

**Multiple similar queries** in one round trip use aliases on repeated root fields: `usd: price(currency: USD)`, `eur: price(currency: EUR)`. One HTTP POST returns both.

This reduces chattiness versus two separate HTTP calls.

#### Intermediate

**HTTP/2** multiplexing reduces sequential call pain, but a single GraphQL document still shares auth context, middleware, and tracing root span cleanly.

#### Expert

Watch **resolver** deduplication: some frameworks cache identical field+args pairs within a request; differing args disable dedupe. Measure before micro-optimizing.

```graphql
query Rates {
  usd: exchangeRate(pair: USD_EUR)
  gbp: exchangeRate(pair: GBP_EUR)
}
```

```javascript
import fetch from "node-fetch";

await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `query Rates { usd: exchangeRate(pair: USD_EUR) gbp: exchangeRate(pair: GBP_EUR) }`,
  }),
});
```

#### Key Points

- One operation, multiple parallel-like selections.
- Shared middleware and auth context.
- Resolver caching may or may not dedupe.

#### Best Practices

- Combine only related slices to keep documents readable.
- Use `operationName` for logging these multi-fetch patterns.

#### Common Mistakes

- Creating megabytes of aliased selections in one request.
- Assuming automatic batching to the database layer.

---

### 9.2.3 Conditional Aliasing

#### Beginner

GraphQL has **no conditional alias syntax**—you cannot `if (foo) alias: field` in the language. **Directives** `@include`/`@skip` (topic 11) conditionally include fields; the alias, if present, applies when the field is included.

So “conditional aliasing” in practice means pairing aliases with directives on the same field.

#### Intermediate

Client frameworks may **strip** unused fields at build time; ensure directives’ variables are still sent for server-side evaluation.

#### Expert

**Persisted queries** plus dynamic directives still validate statically; variables control runtime inclusion only.

```graphql
query UserCard($withEmail: Boolean!) {
  me {
    name
    contact: email @include(if: $withEmail)
  }
}
```

#### Key Points

- Aliases are static names; inclusion is dynamic via directives.
- Combine `$flags` with `@include` for feature gating.
- Document variable-driven shapes for API consumers.

#### Best Practices

- Prefer `@include` over sending different raw documents when using allow lists.
- Keep default variable values explicit for predictable caching.

#### Common Mistakes

- Expecting aliases to disappear when skipped—they are absent with the whole field.
- Forgetting to declare variables used by `@include`.

---

### 9.2.4 Performance Patterns

#### Beginner

Aliases do not inherently **slow** or **speed** GraphQL—they change response keys. Performance depends on resolver work per aliased field.

Using aliases to batch logical requests into one HTTP call often **improves** perceived latency versus many round trips.

#### Intermediate

**Over-fetching** risk grows if each alias pulls large subtrees. Profile field timings with Apollo tracing or OpenTelemetry GraphQL instrumentation.

#### Expert

**Dataloader** caches `(parentId, fieldName, args)`; aliases do not change parent but args differ per alias, so separate batches may still occur.

```javascript
// Simplified timing wrapper in Node
function timedResolve(name, fn) {
  return async (...a) => {
    const t = Date.now();
    const v = await fn(...a);
    console.log(`${name} ${Date.now() - t}ms`);
    return v;
  };
}
```

#### Key Points

- Measure resolver cost, not alias count alone.
- One HTTP call helps; duplicate work does not vanish.
- Instrument per-field for alias-heavy operations.

#### Best Practices

- Limit alias fan-out on expensive fields.
- Use query complexity limits that count each alias.

#### Common Mistakes

- Assuming one HTTP request means one database query.
- Ignoring N+1 when aliases multiply list fields.

---

### 9.2.5 Data Transformation

#### Beginner

Aliases perform **lightweight transformation** at the JSON level: renaming keys. They do not compute derived values (`fullName` from `firstName`+`lastName`) unless the schema exposes such a field.

Heavier transformation belongs in resolvers or the client view layer.

#### Intermediate

**GraphQL aliases** cannot reorder array elements or filter list contents—that requires schema arguments or client-side processing.

#### Expert

**BFF** layers sometimes expose convenience fields to avoid client transformation; prefer schema evolution over fragile alias-only patterns.

```graphql
query {
  repo {
    prCount: pullRequestCount
    issueCount: openIssueCount
  }
}
```

#### Key Points

- Aliases rename; they do not compute.
- Business logic stays server-side or in UI mappers.
- Schema fields express true derivations.

#### Best Practices

- Add resolver fields for repeated derivations.
- Use selectors (Reselect, Zustand) on the client when appropriate.

#### Common Mistakes

- Expecting aliases to merge or split fields.
- Shipping huge client transforms that belong in the API.

---

## 9.3 Fragments

### 9.3.1 Fragment Syntax

#### Beginner

A **fragment** is a reusable piece of a GraphQL query: a set of fields on a type. **Named fragment** syntax:

```graphql
fragment Name on TypeName {
  field1
  field2
}
```

You **spread** it into a selection with `...Name`. Fragments reduce duplication when many operations need the same field shape.

#### Intermediate

Fragments must specify **on TypeName** (the type condition). Spreads are only valid where that type applies (or is a subtype via interfaces/unions—use inline fragments for polymorphism).

Fragments live in the same document as operations or are imported by tooling that concatenates documents.

#### Expert

The AST contains `FragmentDefinition` and `FragmentSpread` nodes. Validation enforces **fragment spreads** cannot form cycles and must not violate type conditions.

```graphql
fragment UserParts on User {
  id
  name
  email
}

query {
  me {
    ...UserParts
  }
}
```

```javascript
import { parse, validate, buildSchema } from "graphql";

const schema = buildSchema(`
  type Query { me: User }
  type User { id: ID!, name: String, email: String }
`);

const doc = parse(`
  fragment UserParts on User { id name email }
  query { me { ...UserParts } }
`);

console.log(validate(schema, doc).length === 0);
```

#### Key Points

- Named fragments declare `fragment Name on Type { ... }`.
- Spreads `...Name` inline the fragment’s fields.
- Type conditions constrain where spreads may appear.

#### Best Practices

- Colocate fragments with UI components in modular GraphQL files.
- Name fragments after the component (`UserAvatar_user` in Relay conventions).

#### Common Mistakes

- Forgetting `on TypeName` (syntax error).
- Spreading a fragment on incompatible selection types.

---

### 9.3.2 Named Fragments

#### Beginner

**Named fragments** have an identifier and can be reused across multiple operations in the same document. They are the primary mechanism for deduplicating field lists.

Unlike inline fragments, named fragments are defined once at document scope.

#### Intermediate

**Fragment name uniqueness** is per document. Two fragments with the same name is a validation error. Tools like Apollo Client merge documents from multiple modules—ensure build step dedupes or namespaces.

#### Expert

**Relay compiler** generates opaque fragment names and enforces colocation. **Codegen** plugins emit typed fragment masks matching components.

```graphql
fragment PostCard on Post {
  id
  title
  author {
    name
  }
}

query Feed {
  posts {
    ...PostCard
  }
}
```

#### Key Points

- One definition, many spreads.
- Names must be unique in the document.
- Toolchains rely on stable fragment names.

#### Best Practices

- Prefix fragments with domain (`Blog_PostCard`).
- Export fragments from `.graphql` files next to React components.

#### Common Mistakes

- Duplicate fragment names when concatenating files.
- Huge “god fragments” that over-fetch everywhere.

---

### 9.3.3 Fragment Reuse

#### Beginner

**Reuse** means importing or copying the same fragment into many operations so `User { id name avatar }` stays DRY. Change the fragment once, update all operations using it.

This is essential for large front-end codebases.

#### Intermediate

**GraphQL Code Generator** `near-operation-file` preset maps fragments to TypeScript types shared by hooks. **ESLint** `graphql-eslint` can require fragments for large selections.

#### Expert

**Persisted query** registries hash full documents including fragments; ensure CI bundles fragments consistently.

```javascript
// pseudo: compose documents in Node build script
import fs from "fs";

const userFrag = fs.readFileSync("UserFrag.graphql", "utf8");
const query = `
  ${userFrag}
  query Home { me { ...UserFields } }
`;
```

#### Key Points

- Reuse reduces drift between screens.
- Build pipelines must concatenate fragment definitions before send.
- Hashing includes all definitions in the document.

#### Best Practices

- Centralize shared fragments in a `fragments/` directory.
- Version fragments alongside components.

#### Common Mistakes

- Sending operations without embedding referenced fragments (server parse errors).
- Partial updates when one copy of a fragment is edited manually.

---

### 9.3.4 Fragment Composition

#### Beginner

**Composing** fragments means one fragment’s selection includes spreads of other fragments: `fragment A on T { ...B ...C }`. This builds larger shapes from smaller building blocks.

Composition mirrors UI composition: parent components spread child fragments.

#### Intermediate

Validation ensures composed fragments’ type conditions are compatible on `T`. **Fragment cycles** (A spreads B spreads A) are forbidden.

#### Expert

**Relay** `@relay(mask: true)` and masking hide fields not requested by child fragments; understand your toolchain’s composition semantics.

```graphql
fragment UserAvatar on User {
  id
  avatarUrl
}

fragment UserName on User {
  id
  name
}

fragment UserHeader on User {
  ...UserAvatar
  ...UserName
}
```

#### Key Points

- Nest spreads to compose field sets.
- No cyclic fragment graphs.
- Align composition with UI hierarchy.

#### Best Practices

- Keep leaf fragments small and focused.
- Share `id` for cache normalization where applicable.

#### Common Mistakes

- Accidental cycles when two fragments reference each other.
- Overlapping conflicting sub-selections on the same field (validation errors).

---

### 9.3.5 Nested Fragments

#### Beginner

**Nested fragments** are spreads placed inside nested selection sets, not only at the top level of a field. Example: `user { posts { ...PostFields } }` where `PostFields` is on `Post`.

This scopes reuse to the correct type level.

#### Intermediate

Type conditions must match the nested type: `fragment PostFields on Post`. You cannot spread `User` fragments inside `Post` selections.

#### Expert

**Inline fragments** (`... on CommentAuthor { ... }`) handle polymorphic nested fields; named fragments can still be used inside inline fragments when the condition matches.

```graphql
fragment PostWithComments on Post {
  title
  comments {
    ...CommentBody
  }
}

fragment CommentBody on Comment {
  id
  body
}
```

#### Key Points

- Nest spreads where the type matches.
- Polymorphic lists may need inline fragments first.
- Keeps large queries structured.

#### Best Practices

- Name nested fragments after the nested type.
- Avoid duplicating `id` fields unnecessarily deep.

#### Common Mistakes

- Wrong `on Type` for the nested selection.
- Missing sub-selection on object fields inside fragments.

---

## 9.4 Fragment Patterns

### 9.4.1 Shared Field Selection

#### Beginner

**Shared selection** extracts identical field lists used in list views, detail views, and mutations’ return payloads (`mutation { createPost { post { ...PostCard } } }`).

One fragment ensures the UI shape is consistent everywhere.

#### Intermediate

**Apollo cache** benefits when fragments include `id` and `__typename` for normalization across queries and mutations.

#### Expert

**Entity caches** rely on stable keys; shared fragments should include key fields to avoid cache duplication.

```graphql
mutation Create($input: PostInput!) {
  createPost(input: $input) {
    post {
      ...PostCard
    }
  }
}
```

#### Key Points

- One fragment, many operations.
- Include `id`/`__typename` for client caches.
- Mutations should return fragment-shaped entities.

#### Best Practices

- Define a “card” and “detail” fragment per entity.
- Document which operations must return which fragments.

#### Common Mistakes

- Divergent hand-written selections that drift from fragments.
- Omitting `__typename` when using polymorphic caches.

---

### 9.4.2 Type-Specific Fragments

#### Beginner

**Type-specific** fragments declare `on ConcreteType` and include only fields valid for that type. Use when components render one concrete type.

This avoids trying to query interface fields not backed by all implementors incorrectly—though interface fields are fine on the interface fragment.

#### Intermediate

For **interfaces**, you can fragment on the interface for common fields, then add inline fragments for each implementation’s extra fields.

#### Expert

**Union** return types almost always need inline fragments per member type; named fragments still attach to each member type condition.

```graphql
fragment DroidParts on Droid {
  id
  primaryFunction
}

fragment HumanParts on Human {
  id
  homePlanet
}
```

#### Key Points

- Tie fragments to concrete types when possible.
- Combine with inline fragments for unions/interfaces.
- Keeps validation strict and clear.

#### Best Practices

- Generate union/exhaustiveness checks in TypeScript from fragments when possible.
- Prefer interface fields for truly shared data.

#### Common Mistakes

- Querying concrete fields on the wrong fragment type.
- Forgetting spreads for all union variants the UI needs.

---

### 9.4.3 Conditional Fragments

#### Beginner

**Conditional** inclusion uses directives on fields *inside* fragments or on the spread: `...Frag @include(if: $show)`. The entire spread is included or omitted based on the variable.

There is no `if` expression inside GraphQL itself beyond directives.

#### Intermediate

Variables used in directives must be declared at the **operation** level. Fragment definitions cannot declare variables—only operations can.

#### Expert

**Static analysis** still validates conditional fragments even when skipped at runtime; types must remain valid.

```graphql
fragment Extra on User {
  phone @include(if: $withPhone)
}

query User($withPhone: Boolean!) {
  me {
    name
    ...Extra
  }
}
```

#### Key Points

- Directives gate fragments or fields.
- Variables live on operations, not fragments.
- Validation is static.

#### Best Practices

- Default `$withPhone` carefully for cache predictability.
- Prefer fewer operations over combinatorial directive explosions.

#### Common Mistakes

- Putting variable definitions on fragments (invalid).
- Using directives unsupported by the server.

---

### 9.4.4 Fragment Inheritance

#### Beginner

GraphQL fragments **do not inherit** OO-style from each other. “Inheritance” in guides usually means **composition**: fragment A spreads B and C to reuse pieces.

There is no `extends` keyword for fragments.

#### Intermediate

**Interfaces** in the schema let multiple object types share fields; fragments on the interface mimic inheritance of field shape across implementors.

#### Expert

**Schema design** inheritance (interfaces) + **query** fragment composition together model extensibility cleanly.

```graphql
interface Node {
  id: ID!
}

fragment NodeId on Node {
  id
}

fragment UserNode on User {
  ...NodeId
  name
}
```

#### Key Points

- Reuse via composition, not fragment subclassing.
- Interface types enable shared fragment bases.
- Schema and query layers work together.

#### Best Practices

- Put shared interface fields in `on Node` fragments.
- Document which concrete types implement the interface.

#### Common Mistakes

- Expecting automatic field inclusion without spreads.
- Using interface fragments where selection type is a concrete supertype mismatch.

---

### 9.4.5 Dynamic Fragments

#### Beginner

**Dynamic fragments** usually means the client **chooses** which fragment strings to include based on runtime flags—built as template strings or AST manipulation in JS.

The server always receives a concrete document at request time; GraphQL is not dynamically interpreted like SQL `EXEC`.

#### Intermediate

Use **codegen** or **graphql-tag** pluck to keep dynamic assembly type-safe. Avoid raw string concatenation without validation.

#### Expert

**Persisted queries** disallow arbitrary dynamic assembly unless you register all variants. Feature flags should toggle `@include` variables instead of generating new documents when possible.

```javascript
import { print } from "graphql";
import { parse } from "graphql";

function buildQuery(includeBio) {
  const extra = includeBio ? "bio" : "";
  return parse(`query { me { name ${extra} } }`);
}

console.log(print(buildQuery(true)));
```

#### Key Points

- Dynamism is client build-time or request-time string selection.
- Prefer directives over unbounded document variants.
- Persisted ops need finite document set.

#### Best Practices

- Validate dynamically built documents with `validate()` in tests.
- Prefer variables + `@include` for simple toggles.

#### Common Mistakes

- Injecting user input into GraphQL strings (unsafe).
- Exploding persisted query cardinality with flags.

---

## 9.5 Advanced Fragment Usage

### 9.5.1 Inline Fragments

#### Beginner

**Inline fragments** have no separate name: `... on Type { fields }`. They select fields when the runtime type matches `Type`, critical for **unions** and **interfaces**.

Syntax can include directives: `... on Photo @include(if: $ok) { url }`.

#### Intermediate

**Spreading** named fragments inside inline fragments is common: `... on Comment { ...CommentParts }`.

#### Expert

**Fragment type conditions** on named fragments behave similarly; inline fragments are just anonymous type conditions inline.

```graphql
query Search {
  search {
    ... on Book {
      title
    }
    ... on Movie {
      title
      runtime
    }
  }
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  union SearchResult = Book | Movie
  type Book { title: String }
  type Movie { title: String, runtime: Int }
  type Query { search: [SearchResult!]! }
`);

await graphql({
  schema,
  source: `query Search {
    search {
      ... on Book { title }
      ... on Movie { title runtime }
    }
  }`,
  rootValue: { search: [{ title: "GQL", runtime: 120 }] },
});
```

#### Key Points

- Inline `on Type` handles polymorphism.
- Works with unions/interfaces.
- Combines with directives.

#### Best Practices

- Cover all union members you render.
- Factor repeated inline blocks into named fragments.

#### Common Mistakes

- Missing `on Type` after `...` (syntax error).
- Not handling all union variants (runtime null data).

---

### 9.5.2 Fragment Spread

#### Beginner

A **fragment spread** `...FragmentName` inlines the fragment’s selection at that point. Multiple spreads compose; order with respect to resolution is not guaranteed for siblings (parallel fields).

Spreads cannot pass arguments—arguments belong on fields inside the fragment or use **directive variables** at the spread site if supported patterns exist.

#### Intermediate

**Unused fragments** in a document are allowed if validation passes? Actually fragments must be used somewhere or some linters warn—spec allows unused fragment definitions? GraphQL spec: fragment definitions need not be used—wait, validation has `NoUnusedFragments` rule in graphql-js.

#### Expert

**GraphQL-js** `NoUnusedFragments` and `OverlappingFieldsCanBeMerged` catch conflicting selections from spreads.

```graphql
fragment A on User { name }
fragment B on User { email }

query {
  me {
    ...A
    ...B
  }
}
```

#### Key Points

- Spreads compose field sets.
- Validation ensures merges are legal.
- Unused fragments fail validation in graphql-js.

#### Best Practices

- Run ESLint with `graphql-eslint` unused fragment rules.
- Merge small fragments when spreads proliferate.

#### Common Mistakes

- Selecting the same field with different arguments via two spreads (merge conflict).
- Defining fragments never spread (lint error).

---

### 9.5.3 Fragment Composition

#### Beginner

**Composition** at advanced level means designing a **graph of fragments** matching UI trees: page fragment spreads section fragments, which spread card fragments.

This scales GraphQL front-ends similarly to component trees.

#### Intermediate

**Colocation** (Relay) enforces each component declares its data dependency fragment; the compiler assembles the full query.

#### Expert

**Babel** or **SWC** plugins extract `gql` tagged templates; monorepos share fragments via package imports.

```javascript
// Conceptual React + JS template literals
import { gql } from "@apollo/client";

export const USER_AVATAR = gql`
  fragment UserAvatar on User {
    id
    avatarUrl
  }
`;

export const USER_ROW = gql`
  fragment UserRow on User {
    name
    ...UserAvatar
  }
  ${USER_AVATAR}
`;
```

#### Key Points

- Mirror UI hierarchy in fragment hierarchy.
- Apollo concatenates with template interpolation.
- Relay uses compiler instead of manual interpolation.

#### Best Practices

- One fragment per component that needs data.
- Avoid cross-feature fragment dependencies.

#### Common Mistakes

- Circular imports between fragment modules.
- Missing interpolation of dependency fragments in Apollo.

---

### 9.5.4 Fragment Variables

#### Beginner

Fragments **cannot** declare variables—only operations can. Fragments can still **use** variables in field arguments or directives because variables are in scope for the whole operation.

This is a common interview question: “fragment variables” really means **operation variables referenced inside fragments**.

#### Intermediate

**Relay** `@arguments` / `@argumentDefinitions` extend fragments with local argument definitions—Relay-specific, not core GraphQL spec.

#### Expert

Understand whether your stack is **spec GraphQL** or **Relay extended** before teaching “fragment variables.”

```graphql
query User($id: ID!, $thumb: Boolean!) {
  user(id: $id) {
    ...UserProfile
  }
}

fragment UserProfile on User {
  name
  avatar(large: $thumb)
}
```

#### Key Points

- Spec: variables are operation-scoped; fragments reference them.
- Relay: additional fragment argument machinery.
- Document which dialect your API targets.

#### Best Practices

- Name variables clearly when used deep in fragments.
- Prefer Relay extensions only when using Relay compiler end-to-end.

#### Common Mistakes

- Trying `fragment F($x: Int)` in standard GraphQL (invalid).
- Forgetting to thread variables through wrapper operations.

---

### 9.5.5 Performance Optimization

#### Beginner

Fragments help **avoid duplicate text**, not magic performance. Optimization comes from selecting fewer fields, batching resolvers, and caching.

Still, one composed query with fragments often beats ad hoc multiple queries.

#### Intermediate

**Persisted queries** shrink wire size; fragments inline before hashing. **Automatic persisted queries** (APQ) hash without whitespace differences if normalized.

#### Expert

**Query planning** for federation deduplicates requests to subgraphs when selections overlap; fragments that expand to identical fields help planners recognize overlap.

```javascript
// Normalize document before hashing (illustrative)
import { parse, print, visit } from "graphql";

function stripLoc(doc) {
  return visit(doc, {
    enter(node) {
      if (node.loc) return { ...node, loc: undefined };
    },
  });
}

const ast = stripLoc(parse(`query { me { ...User } } fragment User on User { id name }`));
console.log(print(ast));
```

#### Key Points

- Fragments aid maintainability; perf is field-level.
- Normalized printing stabilizes APQ hashes.
- Federation benefits from consistent fragment expansion.

#### Best Practices

- Profile slow fields, not fragment count.
- Include only fields the UI needs in each fragment.

#### Common Mistakes

- Giant fragments shared everywhere causing over-fetch.
- Assuming fragments reduce resolver invocations automatically.

---
