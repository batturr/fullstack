# Introspection

## 📑 Table of Contents

- [10.1 Introspection Basics](#101-introspection-basics)
  - [10.1.1 __schema Query](#1011-__schema-query)
  - [10.1.2 __type Query](#1012-__type-query)
  - [10.1.3 Schema Inspection](#1013-schema-inspection)
  - [10.1.4 Type Information](#1014-type-information)
  - [10.1.5 Field Information](#1015-field-information)
- [10.2 Introspection Features](#102-introspection-features)
  - [10.2.1 Querying Type Names](#1021-querying-type-names)
  - [10.2.2 Querying Field Types](#1022-querying-field-types)
  - [10.2.3 Querying Arguments](#1023-querying-arguments)
  - [10.2.4 Querying Possible Types](#1024-querying-possible-types)
  - [10.2.5 Querying Interfaces](#1025-querying-interfaces)
- [10.3 Introspection Use Cases](#103-introspection-use-cases)
  - [10.3.1 Schema Discovery](#1031-schema-discovery)
  - [10.3.2 Code Generation](#1032-code-generation)
  - [10.3.3 Documentation Generation](#1033-documentation-generation)
  - [10.3.4 Client Validation](#1034-client-validation)
  - [10.3.5 API Exploration](#1035-api-exploration)
- [10.4 Introspection Tools](#104-introspection-tools)
  - [10.4.1 GraphQL Introspection Queries](#1041-graphql-introspection-queries)
  - [10.4.2 Schema Download](#1042-schema-download)
  - [10.4.3 Schema Comparison](#1043-schema-comparison)
  - [10.4.4 Schema Versioning](#1044-schema-versioning)
  - [10.4.5 Breaking Changes Detection](#1045-breaking-changes-detection)
- [10.5 Advanced Introspection](#105-advanced-introspection)
  - [10.5.1 Directive Introspection](#1051-directive-introspection)
  - [10.5.2 Deprecation Information](#1052-deprecation-information)
  - [10.5.3 Custom Type Information](#1053-custom-type-information)
  - [10.5.4 Introspection Performance](#1054-introspection-performance)
  - [10.5.5 Introspection Security](#1055-introspection-security)

---

## 10.1 Introspection Basics

### 10.1.1 __schema Query

#### Beginner

GraphQL servers expose a built-in **introspection** system that lets clients ask the server about its own schema. The entry point is typically the `__schema` field on the root `query` type (via the special `__Type` and `__Schema` types in the introspection system).

A minimal introspection query fetches `__schema { types { name } }` to list type names. This powers GraphiQL’s documentation pane and most tooling.

#### Intermediate

`__schema` returns `__Schema!` with fields like `queryType`, `mutationType`, `subscriptionType`, `types`, `directives`. The full set is defined in the GraphQL specification’s “Introspection” section.

Introspection is a normal query but may be **disabled in production** for security (discussed in 10.5.5).

#### Expert

Implementations materialize introspection resolvers automatically from the schema object. Custom schemas built programmatically still introspect correctly if types are registered. Federation **supergraph** SDL may differ from subgraph introspection—use router introspection for the public contract.

```graphql
query IntrospectionSchema {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
  }
}
```

```javascript
import { buildSchema, graphql } from "graphql";

const schema = buildSchema(`
  type Query { hello: String }
  type Mutation { noop: Boolean }
`);

const res = await graphql({
  schema,
  source: `{ __schema { queryType { name } mutationType { name } } }`,
});
console.log(res.data.__schema);
```

#### Key Points

- `__schema` is the top-level introspection anchor.
- Drives IDEs and codegen.
- May be restricted by policy.

#### Best Practices

- Cache introspection results in CI, not on every dev keystroke hitting prod.
- Use `getIntrospectionQuery()` from `graphql` package for complete introspection.

#### Common Mistakes

- Assuming `__schema` exists when introspection is disabled (errors return).
- Confusing supergraph schema with subgraph introspection in federation.

---

### 10.1.2 __type Query

#### Beginner

The **`__type(name: String!)`** field on the root `Query` type (special introspection field) fetches metadata for a single type by name. Example: `{ __type(name: "User") { kind name fields { name } } }`.

Use this when you need details about one type without scanning the entire `types` list.

#### Intermediate

`__type` returns `__Type` or `null` if the name does not exist. `kind` is an enum: `OBJECT`, `INTERFACE`, `UNION`, `ENUM`, `SCALAR`, `INPUT_OBJECT`, `LIST`, `NON_NULL`.

For `LIST` and `NON_NULL`, you traverse `ofType` recursively to reach named types.

#### Expert

Circular references in types mean introspection clients must guard against infinite `ofType` loops—always terminate at `kind` not `LIST`/`NON_NULL`.

```graphql
query UserType {
  __type(name: "User") {
    name
    kind
    fields {
      name
      type {
        kind
        name
        ofType {
          kind
          name
        }
      }
    }
  }
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  type Query { me: User }
  type User { id: ID!, name: String }
`);

const r = await graphql({
  schema,
  source: `{ __type(name: "User") { name kind fields { name } } }`,
});
console.log(r.data.__type);
```

#### Key Points

- Targeted introspection per type name.
- `kind` + `ofType` unravel wrappers.
- Returns null for unknown names.

#### Best Practices

- Helper functions to flatten `ofType` chains in tooling code.
- Case-sensitive name matching.

#### Common Mistakes

- Forgetting `NON_NULL`/`LIST` wrapping when reading field types.
- Using wrong type name spelling.

---

### 10.1.3 Schema Inspection

#### Beginner

**Schema inspection** is the general process of reading the schema via introspection or by loading SDL files. Teams inspect schemas to understand fields, build clients, and review changes.

`__schema.types` enumerates all named types in the schema, including internal introspection types unless filtered.

#### Intermediate

Tools filter out types starting with `__` when presenting human docs. The **introspection JSON** is often saved as `schema.json` for codegen pipelines.

#### Expert

**Schema registry** services (Apollo Studio, Hive) store schema history from introspection or SDL upload. **Rover** CLI can fetch subgraph schemas in federation workflows.

```graphql
query AllTypes {
  __schema {
    types {
      name
      kind
    }
  }
}
```

#### Key Points

- Full type enumeration via `__schema.types`.
- Filter `__` types for UX.
- Registries centralize inspection history.

#### Best Practices

- Automate schema export on every deploy.
- Tag schemas with git SHA or version.

#### Common Mistakes

- Treating introspection output as the same ordering across releases (order not guaranteed to be stable).

---

### 10.1.4 Type Information

#### Beginner

**Type information** from introspection includes name, kind, description, and type-specific data: `enumValues` for enums, `inputFields` for input objects, `possibleTypes` for unions/interfaces.

This maps closely to how you read SDL, but in JSON form.

#### Intermediate

For `OBJECT` and `INTERFACE`, `fields(includeDeprecated: true)` lists fields with args and return types. `interfaces` lists implemented interfaces for objects.

#### Expert

**Default values** for arguments appear as introspection strings representing GraphQL literals. Clients must parse carefully.

```graphql
query EnumInfo {
  __type(name: "Role") {
    enumValues {
      name
      description
      isDeprecated
    }
  }
}
```

#### Key Points

- Rich per-kind metadata in `__Type`.
- `includeDeprecated` surfaces deprecated fields/values.
- Default value strings are GraphQL literal text.

#### Best Practices

- Surface descriptions in generated docs.
- Respect deprecation in codegen output.

#### Common Mistakes

- Ignoring `isDeprecated` and shipping dead enums to new code.

---

### 10.1.5 Field Information

#### Beginner

**Field introspection** returns each field’s `name`, `description`, `args`, `type`, and `isDeprecated`. This is how GraphiQL shows argument lists and return types in the explorer.

Arguments include `name`, `type`, `defaultValue`, and `description`.

#### Intermediate

For **subscriptions**, field introspection looks the same as queries; tooling groups by root type. Connection/Relay fields show `cursor`, `pageInfo` child fields through normal nesting.

#### Expert

**Tracing** can correlate expensive fields identified via introspection with runtime metrics. **Cost directives** (custom) may appear in introspection if registered on the schema.

```graphql
query QueryFields {
  __schema {
    queryType {
      fields {
        name
        args {
          name
          type {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
        type {
          kind
          name
          ofType {
            kind
            name
          }
        }
      }
    }
  }
}
```

```javascript
import { getIntrospectionQuery, graphql } from "graphql";
import { buildSchema } from "graphql";

const schema = buildSchema(`type Query { ping(msg: String = "hi"): String }`);
const intro = await graphql({ schema, source: getIntrospectionQuery() });
const fields = intro.data.__schema.queryType.fields;
console.log(fields.find((f) => f.name === "ping").args);
```

#### Key Points

- Fields carry args and return `__Type` graphs.
- `getIntrospectionQuery()` is the standard full query.
- Useful for automated tooling.

#### Best Practices

- Strip descriptions in production if leaking internals.
- Index fields by name in tooling for O(1) lookup.

#### Common Mistakes

- Hand-writing partial introspection queries that miss `ofType` depth needed for codegen.

---

## 10.2 Introspection Features

### 10.2.1 Querying Type Names

#### Beginner

Listing **type names** is the simplest introspection: `__schema { types { name kind } }`. Filter to `OBJECT` and `INPUT_OBJECT` for domain-focused catalogs.

Helps new developers scan the API surface quickly.

#### Intermediate

**Built-in scalars** (`Int`, `String`, etc.) appear as types with `kind: SCALAR`. Custom scalars show up with their chosen names.

#### Expert

Federation may inject **entity** types and `_Entity` union—introspection reflects the composed supergraph, not individual services’ private types.

```graphql
query Names {
  __schema {
    types {
      name
      kind
    }
  }
}
```

#### Key Points

- Names + kinds categorize the type graph.
- Includes scalars and introspection types unless filtered.
- Federation supergraph shapes differ from subgraphs.

#### Best Practices

- Present grouped views (Queries, Mutations, Models).
- Hide implementation-only types via naming conventions.

#### Common Mistakes

- Showing raw `__*` types to end users.

---

### 10.2.2 Querying Field Types

#### Beginner

Each field’s `type` in introspection is a nested object describing **wrappers** (`NON_NULL`, `LIST`) and inner named types. Tooling “prints” this as `String!` or `[User!]!`.

Learn to read the recursion: unwrap until `name` is non-null.

#### Intermediate

**Codegen** uses this graph to generate TypeScript types with correct optional modifiers and arrays.

#### Expert

Some tools cache **type reference** graphs for diffing. **Semantic non-null** debates (client nullability) start from introspected field types.

```javascript
function printTypeRef(t) {
  if (!t) return "";
  if (t.kind === "NON_NULL") return `${printTypeRef(t.ofType)}!`;
  if (t.kind === "LIST") return `[${printTypeRef(t.ofType)}]`;
  return t.name || "";
}

const fieldType = {
  kind: "NON_NULL",
  ofType: { kind: "LIST", ofType: { kind: "NON_NULL", ofType: { kind: "OBJECT", name: "User" } } },
};
console.log(printTypeRef(fieldType));
```

#### Key Points

- Recursive `ofType` models GraphQL type modifiers.
- Pretty-printing matches SDL notation.
- Critical for generators.

#### Best Practices

- Unit-test pretty-printers against known SDL examples.
- Handle circular `ofType` safely.

#### Common Mistakes

- Stopping unwrap too early and mislabeling nullability.

---

### 10.2.3 Querying Arguments

#### Beginner

Introspection lists **arguments** per field with types and default values. This is how GraphiQL builds argument editors with correct types.

`defaultValue` is a string or null.

#### Intermediate

**Input object** arguments show as `INPUT_OBJECT` kinds; drill `inputFields` on that type for nested forms in UI generators.

#### Expert

**Validation** tools compare argument nullability across schema versions to flag breaking changes when args become required.

```graphql
query Args {
  __type(name: "Query") {
    fields {
      name
      args {
        name
        defaultValue
        type {
          kind
          name
          ofType {
            kind
            name
          }
        }
      }
    }
  }
}
```

#### Key Points

- Args are first-class in introspection.
- Defaults are literal strings.
- Input types need separate `__type` lookups.

#### Best Practices

- Pretty-print default values next to SDL equivalents in docs.
- Mark risky args (unbounded lists) in extensions if you add them.

#### Common Mistakes

- Parsing `defaultValue` as JSON (it is GraphQL literal syntax).

---

### 10.2.4 Querying Possible Types

#### Beginner

For **interfaces** and **unions**, `possibleTypes` on `__Type` lists implementations or union members. Clients use this to know which `__typename` values can appear.

Essential for polymorphic UIs and safe fragment coverage checks.

#### Intermediate

Some schemas are large—**pagination** of possible types is not built-in; you fetch all at once.

#### Expert

**Apollo Federation** `__resolveReference` entities rely on consistent `__typename` in results; introspection guides client union handling.

```graphql
query Possible {
  __type(name: "SearchResult") {
    kind
    possibleTypes {
      name
    }
  }
}
```

#### Key Points

- Unions/interfaces expose `possibleTypes`.
- Drives exhaustive switch generation.
- Ties to runtime `__typename`.

#### Best Practices

- Codegen exhaustive checks for union handling in TypeScript.
- Test each member type in integration tests.

#### Common Mistakes

- Forgetting new union members in client switches after schema evolution.

---

### 10.2.5 Querying Interfaces

#### Beginner

**Object** types list `interfaces { name }` in introspection. **Interface** types list `possibleTypes` and their own `fields`.

This mirrors SDL `implements` clauses.

#### Intermediate

**Schema diff** tools highlight when objects start/stop implementing interfaces—often breaking for clients relying on polymorphism.

#### Expert

**Federation `@interfaceObject`** and advanced patterns may affect how interfaces appear in supergraph introspection—consult vendor docs when using previews.

```graphql
query Iface {
  __type(name: "Node") {
    name
    kind
    fields {
      name
    }
    possibleTypes {
      name
    }
  }
}
```

#### Key Points

- Interfaces bridge objects in introspection.
- `possibleTypes` + interface fields define contracts.
- Schema evolution must respect implementors.

#### Best Practices

- Document required fields on shared interfaces.
- Use interface introspection in GraphQL routers for polymorphic routing.

#### Common Mistakes

- Querying `possibleTypes` on object kinds (wrong—use `interfaces`).

---

## 10.3 Introspection Use Cases

### 10.3.1 Schema Discovery

#### Beginner

**Discovery** means learning what an API offers without external docs. Introspection is the machine-readable discovery channel; GraphiQL is the human UI.

Onboarding developers run introspection or open Sandbox.

#### Intermediate

**Public APIs** sometimes publish SDL on a website instead of open introspection for control. Private APIs often allow introspection only on VPN.

#### Expert

**GraphQL Hive** / **Apollo** can expose schema explorer UIs backed by stored introspection results rather than live production introspection.

```javascript
import fetch from "node-fetch";
import { getIntrospectionQuery } from "graphql";

async function discover(endpoint) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });
  return res.json();
}
```

#### Key Points

- Introspection = live schema discovery.
- Alternatives: published SDL, registries.
- Access control varies by environment.

#### Best Practices

- Provide SDL artifact for partners if introspection is off.
- Version discovery snapshots.

#### Common Mistakes

- Scraping prod without rate limits (load introspection once).

---

### 10.3.2 Code Generation

#### Beginner

**Codegen** tools (`graphql-codegen`) consume `schema.json` from introspection or `.graphql` SDL files to generate TypeScript types, React hooks, and validators.

CI often runs introspection against a staging endpoint to refresh types.

#### Intermediate

**Near-operation-file** preset types each operation + fragments. **Schema-ast** plugin outputs SDL from introspection JSON.

#### Expert

**Persisted operations** still need schema for validation; introspection JSON is cached in CI with checksum verification.

```bash
npx graphql-codegen --config codegen.yml
```

#### Key Points

- Introspection JSON feeds codegen.
- CI integration prevents drift.
- Operations validated against schema snapshot.

#### Best Practices

- Pin schema artifact to git for reproducible builds.
- Fail CI on introspection fetch errors.

#### Common Mistakes

- Generating from prod schema that differs from local services.

---

### 10.3.3 Documentation Generation

#### Beginner

**Docs** generators (`graphdoc`, SpectaQL) render HTML/Markdown from introspection, including descriptions and deprecation notices.

Good for internal portals.

#### Intermediate

**MDX** integration embeds live schema components in Docusaurus sites.

#### Expert

**Access control** for docs sites may redact internal types by post-processing introspection JSON before generation.

```javascript
// Filter internal types from introspection result before doc gen
function stripInternalTypes(intro) {
  const types = intro.__schema.types.filter((t) => !t.name.startsWith("Internal"));
  return { ...intro, __schema: { ...intro.__schema, types } };
}
```

#### Key Points

- Descriptions become prose docs.
- Automate on release.
- Post-process for redaction.

#### Best Practices

- Encourage engineers to write SDL descriptions.
- Link docs to version tags.

#### Common Mistakes

- Publishing docs with introspection from experimental branches.

---

### 10.3.4 Client Validation

#### Beginner

Clients validate operations **against** the schema using introspection-derived artifacts. Editor extensions use the same.

Invalid field names fail before runtime.

#### Intermediate

**graphql-eslint** lints `.graphql` files in VS Code using schema path or introspection endpoint.

#### Expert

**Apollo schema checks** validate operations against registered graphs in CI with composition rules for federation.

```javascript
import { buildClientSchema, validate, parse } from "graphql";

function validateDoc(introspectionResult, docString) {
  const schema = buildClientSchema(introspectionResult);
  return validate(schema, parse(docString));
}
```

#### Key Points

- `buildClientSchema` reconstructs executable schema from introspection.
- Enables offline validation.
- Used in tests and CLIs.

#### Best Practices

- Store minimal introspection needed for client validation to reduce file size.
- Run validate in pre-commit hooks.

#### Common Mistakes

- Using partial introspection missing types referenced by operations.

---

### 10.3.5 API Exploration

#### Beginner

**Exploration** is interactive trial in GraphiQL/Playground: autocomplete from introspection, run queries, see errors.

Essential learning path for GraphQL APIs.

#### Intermediate

**Postman** and **Insomnia** import GraphQL endpoints and issue introspection for autocomplete.

#### Expert

**Security**: exploration tools should not bypass auth; use scoped tokens with read-only data in shared environments.

```graphql
# Explorer-friendly small query
query Explore {
  __type(name: "Query") {
    fields {
      name
      description
    }
  }
}
```

#### Key Points

- IDEs use introspection for autocomplete.
- Exploration complements written docs.
- Auth still applies.

#### Best Practices

- Seed exploration environments with realistic data masks.
- Reset sandboxes periodically.

#### Common Mistakes

- Using production admin tokens in GraphiQL.

---

## 10.4 Introspection Tools

### 10.4.1 GraphQL Introspection Queries

#### Beginner

The **`graphql` npm package** exports `getIntrospectionQuery()` returning the canonical large introspection document string. Use it instead of hand-writing.

Options may include `descriptions: false` in some helpers to shrink payload.

#### Intermediate

**Custom** introspection queries fetch only subsets (e.g., type names) for lightweight monitoring.

#### Expert

**Apollo Rover** `graph introspect` emits introspection to stdout. **GraphQL Inspector** consumes introspection JSON for diff reports.

```javascript
import { getIntrospectionQuery, graphql } from "graphql";
import { buildSchema } from "graphql";

const schema = buildSchema(`type Query { x: Int }`);
const { data } = await graphql({ schema, source: getIntrospectionQuery() });
console.log(Object.keys(data));
```

#### Key Points

- Prefer standard helpers over bespoke queries when full schema is needed.
- Subset queries for bandwidth-sensitive polls.
- CLIs wrap the same mechanism.

#### Best Practices

- Parameterize endpoint URL in scripts.
- gzip HTTP bodies for large introspection.

#### Common Mistakes

- Omitting `__schema` fragments required by downstream tools.

---

### 10.4.2 Schema Download

#### Beginner

**Download** introspection JSON in CI: POST introspection query, save `data` to `schema.json`. Commit or upload to artifact storage.

Enables offline codegen and diffing.

#### Intermediate

**SDL download** uses `printSchema` server-side or tools like `rover graph fetch` to get `.graphql` files.

#### Expert

**Multi-service** repos may download multiple subgraph schemas then **compose** locally with `rover supergraph compose`.

```bash
# Illustrative curl (escape carefully in real scripts)
curl -s -X POST http://localhost:4000/graphql \
  -H "content-type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' > schema-lite.json
```

#### Key Points

- Automate downloads in pipelines.
- Store artifacts with version metadata.
- SDL vs JSON choice depends on toolchain.

#### Best Practices

- Verify HTTP status and GraphQL errors before saving.
- Sign artifacts if tampering is a concern.

#### Common Mistakes

- Saving entire HTTP response instead of `data` field only.

---

### 10.4.3 Schema Comparison

#### Beginner

**Compare** two introspection results or SDL files to see added/removed types and fields. Used in PR review.

GraphQL Inspector provides `diff` command with human-readable output.

#### Intermediate

**Breaking vs dangerous vs safe** change classifications guide semver for GraphQL schemas.

#### Expert

**Federation composition** compares subgraphs for compatibility at build time; incompatible changes fail the gateway build.

```bash
npx graphql-inspector diff old_schema.json new_schema.json
```

#### Key Points

- Diff introspection JSON or SDL.
- Classify changes for release notes.
- Federation adds composition checks.

#### Best Practices

- Block merges on unexpected breaking diffs to main.
- Notify consumers via changelog.

#### Common Mistakes

- Comparing introspection from different environments with different feature flags.

---

### 10.4.4 Schema Versioning

#### Beginner

GraphQL favors **continuous evolution** over `/v1` URLs, but teams still **version** schema artifacts (git tags, registry versions) for clients.

Introspection snapshots are versioned alongside server releases.

#### Intermediate

**@deprecated** fields bridge versions; introspection exposes deprecation reason and version hints if encoded in reason strings.

#### Expert

**Contract testing** pins consumer operations against specific schema versions in CI.

```graphql
type User {
  login: String @deprecated(reason: "Use handle instead; removal after 2026-06-01")
  handle: String!
}
```

#### Key Points

- Version artifacts, not necessarily the HTTP path.
- Deprecation metadata is introspectable.
- Contract tests stabilize mobile clients.

#### Best Practices

- Publish deprecation timelines in reasons.
- Track schema version per mobile app build.

#### Common Mistakes

- Removing fields without deprecation period for mobile apps.

---

### 10.4.5 Breaking Changes Detection

#### Beginner

**Breaking changes** include removing fields, changing field types, adding required arguments, removing enum values. Detect them by diffing schemas.

Tools label such diffs prominently.

#### Intermediate

**GraphQL Inspector** and **Apollo** schema checks integrate with GitHub Actions.

#### Expert

**Field usage analytics** (Apollo) can tell if anyone still calls a field before removal—data-driven deprecation.

```yaml
# .github/workflows/schema.yml (conceptual)
# - fetch prod schema
# - compare to PR schema
# - fail on breaking
```

#### Key Points

- Automate breaking detection in CI.
- Combine static diff with usage telemetry.
- Document policy for exceptions.

#### Best Practices

- Run checks on both SDL and composed supergraphs in federation.
- Require reviewer approval for breaking labels.

#### Common Mistakes

- Treating adding optional fields as breaking (it is not).

---

## 10.5 Advanced Introspection

### 10.5.1 Directive Introspection

#### Beginner

`__schema { directives { name locations args { name type { name } } } }` lists **directives** supported by the server, including `@include`, `@skip`, `@deprecated`, `@specifiedBy`, and custom directives.

Clients learn where directives may appear.

#### Intermediate

Custom directive **args** introspect like field args. Execution semantics are not fully described by introspection—read server docs.

#### Expert

**Federation directives** (`@key`, `@external`) appear in supergraph SDL; introspection reflects them if present in the published schema.

```graphql
query Directives {
  __schema {
    directives {
      name
      locations
      args {
        name
      }
    }
  }
}
```

#### Key Points

- Directives are part of the schema contract.
- Locations are enums in introspection.
- Custom directives need human docs for behavior.

#### Best Practices

- Describe custom directives in SDL.
- Lint unknown directives in operations.

#### Common Mistakes

- Assuming directive presence implies enforcement (verify server).

---

### 10.5.2 Deprecation Information

#### Beginner

Introspection exposes `isDeprecated` and `deprecationReason` on fields and enum values. UIs can strikethrough deprecated items in explorers.

#### Intermediate

Codegen can **omit** deprecated fields or mark TypeScript as `@deprecated` JSDoc.

#### Expert

**Sunset headers** are HTTP-level; GraphQL deprecation is schema-level—use both for external APIs if needed.

```graphql
query DeprecatedFields {
  __type(name: "User") {
    fields(includeDeprecated: true) {
      name
      isDeprecated
      deprecationReason
    }
  }
}
```

#### Key Points

- `includeDeprecated: true` reveals hidden values.
- Reasons should be actionable.
- Pair with analytics before removal.

#### Best Practices

- Standardize reason format (`replacement: X, removeAfter: Y`).
- Track deprecated usage in metrics.

#### Common Mistakes

- Deprecating without a replacement path.

---

### 10.5.3 Custom Type Information

#### Beginner

**Custom scalars** introspect as `SCALAR` with `name` and `description` only—no runtime validation rules are exposed unless you encode hints in descriptions or directive metadata.

#### Intermediate

Some schemas add **spec extensions** or **federation tags** in descriptions for tooling.

#### Expert

**JSON Schema** bridges can attach external metadata files keyed by type name alongside introspection.

```graphql
"""ISO-8601 datetime string"""
scalar DateTime
```

#### Key Points

- Introspection is limited for scalar constraints.
- Descriptions carry human rules.
- External metadata can extend.

#### Best Practices

- Document wire format examples for custom scalars.
- Provide validation regex in description if needed.

#### Common Mistakes

- Expecting clients to infer `parseValue` rules automatically.

---

### 10.5.4 Introspection Performance

#### Beginner

Full introspection queries are **large** and CPU-heavy for huge schemas. Do not run them on every hot path request.

Cache results at the edge or in development tools.

#### Intermediate

**Partial introspection** reduces payload. Some servers implement **lazy** type loading internally but still return full introspection JSON.

#### Expert

**Rate limit** introspection separately from normal operations. Monitor p99 latency spikes from GraphiQL refreshes.

```javascript
let cached;
function getCachedSchemaResponse(schema) {
  if (cached) return cached;
  cached = graphql({ schema, source: getIntrospectionQuery() });
  return cached;
}
```

#### Key Points

- Introspection scales with schema size.
- Cache aggressively in dev proxies.
- Rate limit in prod if enabled.

#### Best Practices

- Disable introspection in high-security prod or serve cached read-only SDL.
- Use incremental schema exploration tools for huge APIs.

#### Common Mistakes

- Allowing unauthenticated full introspection on internet-facing APIs without review.

---

### 10.5.5 Introspection Security

#### Beginner

**Risk**: introspection reveals entire API surface to attackers, aiding crafted queries for DoS or probing hidden fields.

Many teams **disable** introspection in production or require authentication.

#### Intermediate

**Apollo Server** `introspection: false` in production config. **Helmet** and WAF rules alone do not replace disabling.

#### Expert

**Allow-listed persisted queries** eliminate ad hoc introspection from browsers while keeping dev tools enabled on admin hosts.

```javascript
import { ApolloServer } from "@apollo/server";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});
```

#### Key Points

- Introspection aids attackers and legitimate clients alike.
- Environment-based toggles are common.
- Auth + rate limits mitigate residual risk.

#### Best Practices

- Publish public SDL separately if introspection is off.
- Audit who can download schema artifacts.

#### Common Mistakes

- Assuming security through obscurity without query cost limits.
- Leaking internal admin mutations via introspection to anonymous users.

---
