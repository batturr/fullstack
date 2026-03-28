# Directives

## 📑 Table of Contents

- [11.1 Directive Basics](#111-directive-basics)
  - [11.1.1 Directive Syntax](#1111-directive-syntax)
  - [11.1.2 Directive Arguments](#1112-directive-arguments)
  - [11.1.3 Directive Locations](#1113-directive-locations)
  - [11.1.4 Built-in Directives](#1114-built-in-directives)
  - [11.1.5 Custom Directives](#1115-custom-directives)
- [11.2 Built-in Directives](#112-built-in-directives)
  - [11.2.1 @include Directive](#1121-include-directive)
  - [11.2.2 @skip Directive](#1122-skip-directive)
  - [11.2.3 @deprecated Directive](#1123-deprecated-directive)
  - [11.2.4 @specifiedBy Directive](#1124-specifiedby-directive)
  - [11.2.5 @oneOf Directive](#1125-oneof-directive)
- [11.3 Custom Directives](#113-custom-directives)
  - [11.3.1 Defining Custom Directives](#1131-defining-custom-directives)
  - [11.3.2 Directive Resolvers](#1132-directive-resolvers)
  - [11.3.3 Schema Directives](#1133-schema-directives)
  - [11.3.4 Execution Directives](#1134-execution-directives)
  - [11.3.5 Validation Directives](#1135-validation-directives)
- [11.4 Directive Use Cases](#114-directive-use-cases)
  - [11.4.1 Conditional Field Inclusion](#1141-conditional-field-inclusion)
  - [11.4.2 Authentication/Authorization](#1142-authenticationauthorization)
  - [11.4.3 Caching Directives](#1143-caching-directives)
  - [11.4.4 Formatting Directives](#1144-formatting-directives)
  - [11.4.5 Validation Directives](#1145-validation-directives)
- [11.5 Advanced Directive Patterns](#115-advanced-directive-patterns)
  - [11.5.1 Stacked Directives](#1151-stacked-directives)
  - [11.5.2 Directive Composition](#1152-directive-composition)
  - [11.5.3 Meta-Programming with Directives](#1153-meta-programming-with-directives)
  - [11.5.4 Schema Modification](#1154-schema-modification)
  - [11.5.5 Performance Directives](#1155-performance-directives)

---

## 11.1 Directive Basics

### 11.1.1 Directive Syntax

#### Beginner

A **directive** annotates part of a GraphQL document or schema with metadata or behavior. Syntax: `@directiveName` or `@directiveName(arg: value)`. Directives appear after the thing they modify: fields, fragments, operations, or schema definitions depending on **location** rules.

Examples: `name @include(if: true)`, `cost @deprecated(reason: "use y")`.

#### Intermediate

Directive names are identifiers. Arguments use the same literal rules as field arguments. Multiple directives can stack on the same location when allowed.

The **schema SDL** can declare custom directives with `directive @name on FIELD_DEFINITION | ...`.

#### Expert

The **GraphQL specification** defines a fixed set of locations (enum `DirectiveLocation`). Parsers produce `Directive` AST nodes; validators enforce locations and argument types per schema definition of each directive.

```graphql
query Show($withEmail: Boolean!) {
  me {
    name
    email @include(if: $withEmail)
  }
}
```

```javascript
import { parse, print } from "graphql";

const doc = parse(`
  query Show($withEmail: Boolean!) {
    me { name email @include(if: $withEmail) }
  }
`);
console.log(print(doc));
```

#### Key Points

- `@name` attaches to a language construct.
- Arguments are optional depending on directive.
- Locations constrain where directives may appear.

#### Best Practices

- Keep directive usage readable; avoid long argument lists inline.
- Document custom directives in schema SDL.

#### Common Mistakes

- Placing directives where the spec forbids (validation error).
- Typos in directive names (some servers are case-sensitive).

---

### 11.1.2 Directive Arguments

#### Beginner

Directives accept **arguments** like fields: `@skip(if: $flag)`. Arguments can be literals or variables (for execution directives, variables must be declared on the operation).

`@deprecated` takes `reason: String` optionally in schema SDL.

#### Intermediate

Built-in `@include` and `@skip` require **`if: Boolean!`**—non-null boolean. Coercion applies like field arguments.

#### Expert

Custom directives can define complex input types as arguments in SDL `directive @auth(roles: [String!]!) on FIELD_DEFINITION`. Execution engines must wire argument coercion for schema directives consistently.

```graphql
directive @auth(roles: [String!]!) on FIELD_DEFINITION

type Query {
  adminUsers: [User!]! @auth(roles: ["ADMIN"])
}
```

#### Key Points

- Directive args use GraphQL value syntax.
- `if` must be Boolean for include/skip.
- Schema directives can carry metadata for tools.

#### Best Practices

- Prefer enums over strings for role-like args when defining custom directives.
- Default values in directive definitions reduce verbosity.

#### Common Mistakes

- Passing nullable Boolean to `@include(if: ...)` without ensuring non-null.
- Using variables in schema directive definitions where only literals are valid in SDL.

---

### 11.1.3 Directive Locations

#### Beginner

**Locations** specify where a directive may appear: `FIELD`, `FRAGMENT_SPREAD`, `INLINE_FRAGMENT`, `QUERY`, `MUTATION`, `SUBSCRIPTION`, `SCHEMA`, `FIELD_DEFINITION`, `ARGUMENT_DEFINITION`, and many more in the spec.

A directive declared `on FIELD` cannot be placed on an `OBJECT` definition unless allowed.

#### Intermediate

**Executable** directives (`@include`, `@skip`) target query documents. **Type system** directives (`@deprecated`, `@specifiedBy`) target schema SDL.

#### Expert

Frameworks like **Apollo** extend locations for federation (`@key` on `OBJECT`). Linters can enforce allowed combinations per your style guide.

```graphql
directive @upper on FIELD_DEFINITION

type User {
  name: String @upper
}
```

#### Key Points

- Executable vs type-system locations differ by phase (execution vs schema build).
- Mismatched location is a validation error.
- Federation adds vendor-specific locations.

#### Best Practices

- Declare `on` lists explicitly for custom directives.
- Avoid over-broad locations that confuse tooling.

#### Common Mistakes

- Assuming `@deprecated` works on queries (it belongs on schema definitions).

---

### 11.1.4 Built-in Directives

#### Beginner

Every spec-compliant server supports **`@include`**, **`@skip`**, and **`@deprecated`**. Newer specs add **`@specifiedBy`** (custom scalar URL) and **`@oneOf`** (input union semantics).

These are defined in the spec; you do not redeclare them for basic usage.

#### Intermediate

`@include(if:)` and `@skip(if:)` are mutually exclusive logically—if both would remove a field, understand evaluation order: if either hides, the field is skipped.

#### Expert

**Default** directive definitions are injected by reference implementations. Custom servers must register built-ins to pass compatibility suites.

```graphql
scalar Long @specifiedBy(url: "https://spec.graphql.org/draft/scalars/Long/")
```

#### Key Points

- Built-ins are part of the contract.
- `@specifiedBy` documents scalar semantics.
- `@oneOf` shapes input validation (when enabled).

#### Best Practices

- Prefer built-ins over reinventing conditional inclusion.
- Add `@specifiedBy` for public custom scalars.

#### Common Mistakes

- Using `@deprecated` on operations instead of fields/types in SDL.
- Expecting `@oneOf` support on older servers.

---

### 11.1.5 Custom Directives

#### Beginner

**Custom directives** extend GraphQL for auth, caching, tracing, or codegen hints. You declare them in SDL and implement behavior in your server framework (Apollo plugins, `graphql-tools` schema directives, Yoga).

Clients must send documents containing directives the server understands.

#### Intermediate

**Schema directives** transform SDL at build time (e.g., add auth wrapper resolvers). **Execution directives** influence runtime field inclusion or resolver behavior.

#### Expert

**Portable** custom directives should be documented; non-portable ones tie clients to one vendor. **GraphQL spec** does not define auth directives—those are conventions.

```graphql
directive @dateFormat(format: String!) on FIELD_DEFINITION

type Query {
  now: String @dateFormat(format: "ISO")
}
```

#### Key Points

- Custom = declared + implemented.
- Clarify schema-time vs execution-time semantics.
- Document for client authors.

#### Best Practices

- Namespace-like prefixes (`@acmeCache`) for public APIs.
- Version directives if behavior changes.

#### Common Mistakes

- Declaring directives in SDL without server implementation (no-op or error).
- Breaking clients by removing directive support abruptly.

---

## 11.2 Built-in Directives

### 11.2.1 @include Directive

#### Beginner

**`@include(if: Boolean!)`** keeps the field **only if** `if` is `true`. If `if` is `false`, the field is excluded from execution as if it were not in the document.

Variables commonly drive `if` for feature flags.

#### Intermediate

Included fields still validate statically—types must be valid even when skipped at runtime. Variables must be provided regardless in strict tooling.

#### Expert

**Partial null** behavior: parent selection may still execute; skipped fields do not run resolvers or appear in `data`.

```graphql
query User($withOrders: Boolean!) {
  me {
    name
    orders @include(if: $withOrders) {
      id
    }
  }
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  type Query { me: User }
  type User { name: String, orders: [Order!]! }
  type Order { id: ID! }
`);

const root = {
  me: () => ({
    name: "Ada",
    orders: [{ id: "1" }],
  }),
};

const r = await graphql({
  schema,
  source: `query User($w: Boolean!) { me { name orders @include(if: $w) { id } } }`,
  variableValues: { w: false },
  rootValue: root,
});
console.log(r.data.me.orders === undefined);
```

#### Key Points

- Runtime conditional inclusion.
- Static validation still applies.
- Works on fields, fragment spreads, inline fragments.

#### Best Practices

- Use for optional heavy fields to save resolver work.
- Pair with codegen boolean variables for type safety.

#### Common Mistakes

- Expecting skipped fields to return `null`—they are absent from the map.

---

### 11.2.2 @skip Directive

#### Beginner

**`@skip(if: Boolean!)`** removes the field when `if` is **true** (inverse of `@include`). Handy when `true` means “hide” in domain language.

#### Intermediate

**Combining** `@skip` and `@include` on the same field is allowed; if `@skip` activates, the field is skipped regardless of `@include`.

#### Expert

Reference `graphql-js` follows spec algorithms for directive precedence; verify in your framework docs when mixing directives.

```graphql
query {
  publicProfile {
    name
    ssn @skip(if: true)
  }
}
```

#### Key Points

- Inverse logic to `@include`.
- Useful for “hide when” flags.
- Interaction rules matter when stacked.

#### Best Practices

- Choose one style per codebase (`include` vs `skip`) for readability.
- Document flag semantics for API consumers.

#### Common Mistakes

- Double negations (`@skip(if: $hide)`) confusing readers—prefer `@include`.

---

### 11.2.3 @deprecated Directive

#### Beginner

**`@deprecated(reason: String)`** marks schema fields, enum values, arguments, and input fields as deprecated. Introspection exposes `isDeprecated` and `deprecationReason`.

Does not remove anything—signals migration path.

#### Intermediate

Place on **SDL** definitions, not client queries. Clients continue requesting deprecated fields until removal.

#### Expert

**Tooling** can fail CI if new usages of deprecated fields appear (`graphql-eslint` rule `no-deprecated`).

```graphql
type User {
  login: String @deprecated(reason: "Use handle")
  handle: String!
}
```

#### Key Points

- Schema-only lifecycle signal.
- Introspection surfaces metadata.
- Plan removal with telemetry.

#### Best Practices

- Always give a reason and replacement.
- Set timelines in the reason string.

#### Common Mistakes

- Deprecating without communicating to client teams.
- Removing without prior deprecation.

---

### 11.2.4 @specifiedBy Directive

#### Beginner

**`@specifiedBy(url: String!)`** on **scalar** definitions links to a specification URL documenting serialization (e.g., JSON Schema, RFC).

Improves interoperability for custom scalars.

#### Intermediate

Appears in **introspection** for scalars; clients and doc generators can surface the link.

#### Expert

Use canonical URLs; avoid ephemeral links. Pair with human descriptions in docstrings.

```graphql
"""Milliseconds since Unix epoch"""
scalar Timestamp
  @specifiedBy(
    url: "https://example.com/scalars/timestamp"
  )
```

#### Key Points

- Documents wire format for scalars.
- Part of modern GraphQL scalar best practices.
- Visible via introspection.

#### Best Practices

- Host stable scalar spec pages.
- Keep description and URL aligned.

#### Common Mistakes

- Broken URLs in committed schemas.
- Using for non-scalar types.

---

### 11.2.5 @oneOf Directive

#### Beginner

**`@oneOf`** on **input object** types enforces that **exactly one** field is provided—modeling discriminated unions at the input layer without ambiguity.

Supported in newer GraphQL versions and tooling; verify server compatibility.

#### Intermediate

Clients send one key in the input object JSON; servers reject multi-key or zero-key inputs at validation.

#### Expert

Replaces some patterns that misused nullable fields or sentinel strings. Pairs well with codegen for exhaustive handling.

```graphql
input FindUserInput @oneOf {
  byId: ID
  byEmail: String
}

type Query {
  findUser(input: FindUserInput!): User
}
```

```javascript
// Valid variables JSON: { "input": { "byId": "1" } }
// Invalid: { "input": { "byId": "1", "byEmail": "a@b.com" } }
console.log(JSON.stringify({ input: { byId: "1" } }));
```

#### Key Points

- Input exclusivity enforcement.
- Cleaner than multiple nullable fields without constraint.
- Check library support before adoption.

#### Best Practices

- Prefer `@oneOf` for new polymorphic inputs when available.
- Document invalid combinations for pre-`@oneOf` clients if migrating.

#### Common Mistakes

- Using on output types (invalid).
- Assuming support on all gateways without testing.

---

## 11.3 Custom Directives

### 11.3.1 Defining Custom Directives

#### Beginner

Define in SDL:

```graphql
directive @log(label: String) on FIELD_DEFINITION
```

Then register implementation in your server so annotated resolvers wrap logging.

Without registration, the directive is inert or rejected depending on validation settings.

#### Intermediate

**Apollo Server** older `schemaDirectives` or **`@graphql-tools/schema`** `mapSchema` transforms attach behavior. **Yoga** uses plugins.

#### Expert

**Federation** has reserved directive names; avoid collisions. **AST visitors** can implement transforms generically.

```javascript
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver } from "graphql";

function logDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const dir = getDirective(schema, fieldConfig.astNode, directiveName)?.[0];
      if (!dir) return fieldConfig;
      const { resolve = defaultFieldResolver } = fieldConfig;
      return {
        ...fieldConfig,
        resolve: async (source, args, context, info) => {
          const labelArg = dir.arguments?.find((a) => a.name.value === "label");
          console.log(labelArg?.value?.value ?? labelArg?.value?.kind);
          return resolve(source, args, context, info);
        },
      };
    },
  });
}
```

#### Key Points

- SDL declaration + code transformation/execution hook.
- Framework-specific wiring differs.
- Avoid reserved names in federation.

#### Best Practices

- Start with one pilot directive; expand gradually.
- Test transformed schema with `validateSchema`.

#### Common Mistakes

- Mapping directives on wrong `MapperKind`.
- Forgetting to apply transformer after building schema.

---

### 11.3.2 Directive Resolvers

#### Beginner

Unlike field resolvers, directives do not have “directive resolvers” in the core spec—frameworks emulate them by **wrapping** field resolvers when building the schema.

The wrapper reads directive arguments from the AST or extension metadata.

#### Intermediate

**Context** can carry user roles checked inside the wrapper before calling `defaultFieldResolver`.

#### Expert

**Performance**: wrappers add overhead per field; keep checks cheap or cache metadata at schema build time.

```javascript
import { GraphQLError } from "graphql";

function authDirective(directiveName, getUser) {
  return {
    visitFieldDefinition(field) {
      const dirs = field.astNode.directives?.filter((d) => d.name.value === directiveName) ?? [];
      if (!dirs.length) return;
      const next = field.resolve;
      field.resolve = async (parent, args, ctx, info) => {
        const user = await getUser(ctx);
        if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTH" } });
        return next ? next(parent, args, ctx, info) : null;
      };
    },
  };
}
```

#### Key Points

- Emulated via wrapper functions.
- Access directive args from AST during schema build.
- Auth is a common use case.

#### Best Practices

- Throw `GraphQLError` with extensions, not generic `Error`.
- Avoid async work in wrappers if sync auth suffices.

#### Common Mistakes

- Not preserving default field resolver when `resolve` was undefined.

---

### 11.3.3 Schema Directives

#### Beginner

**Schema directives** annotate SDL element definitions (`FIELD_DEFINITION`, `OBJECT`, etc.) and are processed when the schema is **built**—before handling requests.

They transform the schema or attach metadata consumed by tools.

#### Intermediate

Examples: `@auth`, `@constraint`, `@cacheControl` (Apollo), `@contact` (federation).

#### Expert

**Printer** may strip unknown directives unless configured; preserve directives in SDL artifacts used by registries.

```graphql
directive @entity(key: String!) on OBJECT

type User @entity(key: "id") {
  id: ID!
}
```

#### Key Points

- Apply at schema construction time.
- Power codegen and federation.
- May not appear in client queries.

#### Best Practices

- Keep schema directives in shared `.graphql` files.
- Document semantics for subgraph owners.

#### Common Mistakes

- Clients expecting runtime behavior from schema directives that only affect composition.

---

### 11.3.4 Execution Directives

#### Beginner

**Execution directives** appear in **operations** sent by clients (`@include`, `@skip`, custom ones if supported). They influence per-request execution paths.

Server must understand them; unknown executable directives are validation errors.

#### Intermediate

Custom execution directives need integration into the **execution engine** or pre-execution transforms—rarer than schema directives because spec limits portable execution directives.

#### Expert

Some servers implement **`@defer`/`@stream`** (incremental delivery) as experimental execution directives.

```graphql
query {
  me {
    name
    heavyField
  }
}
```

#### Key Points

- Client-sent; request-scoped.
- Beyond include/skip, portability drops.
- Experimental streaming directives emerging.

#### Best Practices

- Prefer `@include/@skip` for portability.
- Gate experimental directives behind feature flags.

#### Common Mistakes

- Sending vendor directives to incompatible servers.

---

### 11.3.5 Validation Directives

#### Beginner

**Validation directives** (community patterns) annotate inputs or arguments to enforce min/max length, formats, etc., often implemented as **schema transforms** that add runtime checks or use `graphql-constraint-directive`.

Not in the core spec—third-party.

#### Intermediate

Works well with **Envelop** plugins or **Yoga** validation middleware.

#### Expert

Balance **declarative** constraints in SDL vs imperative checks in resolvers—complex rules may still need code.

```graphql
# Illustrative community pattern (package-specific)
directive @length(max: Int!) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
```

#### Key Points

- Extend validation without scattering magic numbers.
- Requires library support.
- Complements GraphQL’s structural validation.

#### Best Practices

- Keep constraints visible in SDL for reviewers.
- Mirror constraints in client forms for UX.

#### Common Mistakes

- Assuming directives execute if the library is not installed (no-ops or errors).

---

## 11.4 Directive Use Cases

### 11.4.1 Conditional Field Inclusion

#### Beginner

Use **`@include` / `@skip`** to fetch expensive fields only when needed (admin panels, debug modes).

Reduces resolver and database load dynamically per request.

#### Intermediate

Combine with **variables** from UI toggles; cache keys must include those variables in clients like Apollo.

#### Expert

For **mobile** low-bandwidth modes, ship operation variants or use directives with persisted operations registered for each variant.

```graphql
query Dashboard($admin: Boolean!) {
  me {
    name
    auditLog @include(if: $admin) {
      id
      action
    }
  }
}
```

#### Key Points

- Runtime savings for heavy subtrees.
- Variables affect inclusion.
- Client caches account for variables.

#### Best Practices

- Default variables for common case to maximize cache hits.
- Monitor resolver latency with/without heavy fields.

#### Common Mistakes

- Including secrets in fields gated only client-side—enforce auth server-side too.

---

### 11.4.2 Authentication/Authorization

#### Beginner

**Auth directives** (custom) express “this field requires login” declaratively. Implementation wraps resolvers to check `context.user`.

This documents security expectations in SDL.

#### Intermediate

**Role-based** checks read directive arguments `roles: [String!]!` and compare to JWT claims.

#### Expert

**Field-level auth** complements **object-level** and **resolver-level** checks; defense in depth still required—directives are not a substitute for data-layer ACLs.

```graphql
directive @requiresAuth on FIELD_DEFINITION

type Query {
  me: User @requiresAuth
}
```

#### Key Points

- Declarative policy hints + enforcement code.
- JWT/session context drives decisions.
- Layer with database checks.

#### Best Practices

- Use `GraphQLError` with `FORBIDDEN` extensions.
- Log denials with correlation IDs.

#### Common Mistakes

- Trusting client-sent claims without verification.
- Omitting auth on mutation payloads that leak data.

---

### 11.4.3 Caching Directives

#### Beginner

**Apollo `@cacheControl`** and similar directives annotate **maxAge** and **scope** for HTTP CDN caching of responses or field-level cache policies in Apollo Server and gateways.

They let you say “this subtree is public and stable for 60 seconds” without hard-coding that logic only in resolvers.

#### Intermediate

**Entity caching** uses hints to split public vs private fields: a query mixing `me` and `publicSettings` might inherit `PRIVATE` scope from the user branch while still allowing short-lived caching of the public branch in some setups.

**Automatic Persisted Queries (APQ)** plus CDN `GET` caching relies on consistent cache headers derived from these hints.

#### Expert

**Federation** routers merge hints from subgraphs; a single field marked `PUBLIC` under a mostly private query can still leak if the whole response is cached at the edge. Prefer **default `maxAge: 0`** for authenticated graphs and opt in explicitly for public marketing content.

```graphql
# Illustrative Apollo-style SDL (check your server version for exact directive shape)
type Query {
  publicPost(id: ID!): Post
  me: User
}
```

```javascript
// Conceptual Node middleware: honor Cache-Control from GraphQL response metadata
import { ApolloServer } from "@apollo/server";

// In Apollo 4, cache hints often attach via plugins / schema extensions.
// Always verify private fields never emit s-maxage at a shared CDN.
const server = new ApolloServer({
  typeDefs: `#graphql
    type Query { health: String }
  `,
  resolvers: { Query: { health: () => "ok" } },
});
```

#### Key Points

- Hints influence HTTP/CDN behavior and client normalized caches.
- Vendor-specific (Apollo ecosystem and similar).
- Misconfiguration can expose personalized payloads at the edge.

#### Best Practices

- Default to private / non-cacheable for user-specific fields.
- Review CDN and proxy rules with your security team.
- Test `curl -I` on responses for unexpected `Cache-Control`.

#### Common Mistakes

- Caching `POST /graphql` responses that include session-specific data at a shared CDN.
- Marking parent fields `PUBLIC` while children contain PII.

---

### 11.4.4 Formatting Directives

#### Beginner

Custom directives like **`@dateFormat`** or **`@currency`** (implemented by wrapping resolvers) transform scalar outputs for presentation—for example formatting cents as `"$12.34"` or timestamps as localized date strings.

Use sparingly: browsers and mobile apps often handle **i18n** better with raw canonical values plus client-side formatting.

#### Intermediate

**Internationalization** at the server helps legacy clients that cannot run modern formatting libraries, or when you must match a regulatory print format exactly across channels.

Directive arguments can carry locale or timezone: `@dateFormat(tz: "America/New_York")`.

#### Expert

**Performance**: formatting inside resolvers runs per field per request; hot paths with hundreds of rows should return raw values and let the client batch-format. If you must format server-side, memoize expensive locale work and avoid allocating new `Intl` objects inside tight loops.

```graphql
directive @money(currency: String!) on FIELD_DEFINITION

type Invoice {
  totalCents: Int @money(currency: "USD")
}
```

```javascript
function formatMoney(cents, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

// Resolver wrapper reads directive args from field AST at schema build time, then:
const totalCents = 1999;
console.log(formatMoney(totalCents, "USD"));
```

#### Key Points

- Server-side formatting is a trade-off versus client i18n.
- Directive-wrapped resolvers should still expose raw fields when needed.
- Performance and testability matter for list-heavy APIs.

#### Best Practices

- Expose canonical raw fields (`totalCents`, `occurredAt`) alongside formatted ones if both are needed.
- Document locale, timezone, and rounding rules in field descriptions.

#### Common Mistakes

- Returning only formatted strings when clients need to recompute or sort numerically.
- Inconsistent rounding between GraphQL formatting and payment provider rules.

---

### 11.4.5 Validation Directives

#### Beginner

As in 11.3.5, **validation directives** mark arguments or input fields with constraints (length, regex, range) enforced in one place instead of duplicating checks across every resolver.

GraphQL already validates types; these directives express **extra** rules declaratively in SDL.

#### Intermediate

Pair with **Zod** or **Joi** on the server (and optionally on the client) so the same constraints appear in forms and in API validation. Some teams generate Zod from SDL metadata emitted by a custom codegen plugin.

#### Expert

Walk the **schema AST** at startup to attach validator functions to `GraphQLInputObjectType` fields or wrap `parseValue` for custom scalars. For hot paths, avoid re-parsing regex strings per request—compile them once when the schema builds.

```graphql
input SignUpInput {
  email: String!
  password: String!
}
```

```javascript
import { z } from "zod";

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function validateSignUp(input) {
  return SignUpSchema.safeParse(input);
}

console.log(validateSignUp({ email: "a@b.com", password: "short" }).success);
```

#### Key Points

- Centralize simple, cross-cutting constraints.
- Domain rules (“email must be unique”) still belong in services or resolvers.
- Combine SDL hints with shared validator modules where possible.

#### Best Practices

- Keep regexes readable, tested, and documented.
- Return structured validation errors (`UserError` lists) for expected failures.

#### Common Mistakes

- Declaring constraint directives in SDL without wiring an implementation.
- Contradicting the same rule in SDL directives and imperative code.

---

## 11.5 Advanced Directive Patterns

### 11.5.1 Stacked Directives

#### Beginner

**Stacking** means multiple directives on one element: `field @deprecated(reason: "...") @cacheControl(maxAge: 0)` or `user @auth @log`. Each directive supplies a separate concern: lifecycle, caching, auth, or observability.

Order can matter when transforms wrap resolvers in sequence.

#### Intermediate

**Apollo** cache control plus custom auth: ensure **authorization runs** before you emit cacheable responses; otherwise you might describe a field as cacheable while it still requires credentials—usually you want `PRIVATE` scope or `maxAge: 0` for authenticated data.

#### Expert

Document **evaluation order** for your schema transformers (outer vs inner wrappers). Integration tests should cover stacks: deprecated + auth, auth + cost weighting, etc., to catch regressions when directive visitors reorder.

```graphql
type Query {
  report: String @deprecated(reason: "Use analyticsExport") 
}

query GetReport {
  report @skip(if: false)
}
```

```javascript
// Illustrative: compose wrappers explicitly in Node
function compose(...fns) {
  return (base) => fns.reduceRight((acc, fn) => fn(acc), base);
}

const withLog = (next) => async (...args) => {
  console.log("before");
  const v = await next(...args);
  console.log("after");
  return v;
};

const withAuth = (next) => async (...args) => {
  const [, , ctx] = args;
  if (!ctx.user) throw new Error("auth");
  return next(...args);
};

const baseResolver = async () => "ok";
const wrappedResolver = compose(withLog, withAuth)(baseResolver);
```

#### Key Points

- Multiple directives compose concerns on one schema or operation node.
- Wrapper order affects behavior—treat as part of your public contract for maintainers.
- Readability drops as stacks grow; refactor into one well-named directive when noisy.

#### Best Practices

- Limit stacks to a small number; prefer composed helpers in code.
- Add tests for directive interaction whenever you add a new wrapper.

#### Common Mistakes

- Applying `@skip` and `@include` in ways that confuse readers—pick one style.
- Letting cache hints and auth directives contradict each other silently.

---

### 11.5.2 Directive Composition

#### Beginner

**Composition** combines small directives into higher-level policies: `@public`, `@staffOnly` implemented as compositions of `@auth` args in transformer code—not necessarily GraphQL syntax composition.

#### Intermediate

**GraphQL** itself cannot alias directives; composition is a **code** concern in schema builders.

#### Expert

**DSL** in monorepos can generate SDL snippets applying standard directive bundles to categories of fields.

```javascript
const staffDirectiveSDL = `
  directive @staffOnly on FIELD_DEFINITION
`;

function applyStaffOnly(schemaSDL) {
  return `${staffDirectiveSDL}\n${schemaSDL}`;
}
```

#### Key Points

- Compose behavior in implementation layer.
- Standardize bundles for consistency.
- Reduce copy-paste SDL.

#### Best Practices

- Codegen SDL fragments for repeated directive sets.
- Review composed SDL in PRs.

#### Common Mistakes

- Divergent copies of “the same” policy with different directive args.

---

### 11.5.3 Meta-Programming with Directives

#### Beginner

**Meta-programming** uses directives to drive **code generation**: GraphQL Codegen plugins read directive metadata to emit hooks, OpenAPI bridges, or ORM mappings.

SDL becomes the single source of truth.

#### Intermediate

**Relay** `@connection` helpers generate pagination boilerplate.

#### Expert

**Custom codegen** visits SDL AST, collects directives, emits TypeScript—powerful but increases toolchain complexity.

```graphql
type User {
  id: ID!
  """Marker consumed by a custom codegen plugin (not executed by the server)."""
  name: String! @clientOnly
}
```

```javascript
// Example: a tiny codegen hook concept—scan ObjectTypeDefinitionNode for directives
import { parse, visit, Kind } from "graphql";

const doc = parse(`
  type User { id: ID! name: String! @clientOnly }
`);

visit(doc, {
  [Kind.FIELD_DEFINITION](node) {
    const marked = node.directives?.some((d) => d.name.value === "clientOnly");
    if (marked) console.log("generate client stub for", node.name.value);
  },
});
```

#### Key Points

- Directives as markers for tools.
- Not always executed by GraphQL server.
- Tight coupling between SDL and codegen versions.

#### Best Practices

- Namespace tool-only directives clearly (`@codegen_*`).
- Fail CI if unknown tool directives appear.

#### Common Mistakes

- Stripping directives during schema merge unintentionally.

---

### 11.5.4 Schema Modification

#### Beginner

**Schema modification** via directives means build-time transforms: add fields, wrap resolvers, rename arguments internally—without changing the published SDL clients see (sometimes).

Use carefully to avoid surprising consumers.

#### Intermediate

**Prisma** / **Nexus** ecosystems generate GraphQL from models; directives annotate ORM hints.

#### Expert

**Federation** `@external`, `@requires`, `@provides` materially change composition output—master these for subgraph design.

```graphql
extend type User @key(fields: "id") {
  id: ID! @external
  email: String @requires(fields: "id")
}
```

#### Key Points

- Directives reshape supergraphs.
- Federation relies heavily on schema directives.
- Understand gateway validation errors.

#### Best Practices

- Run `rover supergraph compose` in CI.
- Keep subgraph directive cheat sheets for teams.

#### Common Mistakes

- Mismatched `@key` fields across subgraphs.

---

### 11.5.5 Performance Directives

#### Beginner

**Performance-related** directives include cache hints, **complexity cost** markers, or tracing toggles (`@trace`). They guide middleware to measure or limit work.

#### Intermediate

**Query cost** directives may assign weights consumed by a custom validation rule before execution.

#### Expert

Integrate with **OpenTelemetry**: directive-triggered spans around expensive fields.

```graphql
directive @cost(weight: Int!) on FIELD_DEFINITION

type Query {
  allUsers: [User!]!
}
```

```javascript
function estimateCost(doc) {
  let total = 0;
  // Pseudocode: sum @cost weights in AST
  return total;
}
```

#### Key Points

- Directives annotate cost for static analysis.
- Combine with depth limits.
- Helps prevent DoS queries.

#### Best Practices

- Calibrate weights using production traces.
- Reject queries exceeding budget before execution.

#### Common Mistakes

- Setting all weights to 1 (useless signal).
- Ignoring variables that multiply list sizes.

---
