# GraphQL Interview Questions — Senior Level (7+ Years)

Senior/staff-focused questions on GraphQL internals, architecture, scale, security, subscriptions, and platform leadership. Each answer assumes production experience and architectural judgment.

---

## Q1. Explain the GraphQL execution algorithm in detail (parsing, validation, execution phases).

**Answer:**

GraphQL request handling is a pipeline: **parse → validate → execute**. In **parsing**, the server turns the query string into a **Document** AST using the grammar in the GraphQL spec; invalid syntax fails before any schema logic runs. **Validation** walks the AST against the schema: field existence, argument types, fragment rules, variable compatibility, and directive locations—this is purely static and does not call resolvers. **Execution** then runs **ExecuteRequest**: for queries it may run fields in parallel where the spec allows; for mutations it runs top-level fields **serially** in definition order. Each field selection invokes the resolver for its type/field, passes coerced arguments, and builds the response tree; errors are collected per path and merged into the `errors` array while partial data may still appear under `data`.

```graphql
query UserPosts($id: ID!) {
  user(id: $id) {
    name
    posts { title }
  }
}
```

```typescript
// Conceptual execution: resolve "user", then nested "name" and "posts" in parallel
// (sibling fields), then "title" for each post.
async function executeField(parent, fieldNodes, path) {
  const resolver = getFieldResolver(parentType, fieldName);
  const args = coerceArgumentValues(fieldDef, variableValues, fieldNode);
  return resolver(parent, args, context, info);
}
```

**Trade-offs:** Strict validation upfront prevents ambiguous runtime failures but adds CPU per request; caching parsed/validated documents (APQ, persisted queries) amortizes cost. **Tools:** `graphql-js`, Apollo Server, Strawberry, Hot Chocolate—all implement this pipeline. **Real-world:** High-traffic APIs combine APQ with normalized caches so the hot path skips full parse/validate for known operations.

---

## Q2. How does the GraphQL type system ensure type safety at runtime?

**Answer:**

The schema defines **possible types** for each position; **validation** ensures the query only asks for fields that exist and uses variables of correct types. At **runtime**, **value coercion** applies: scalars use `parseValue`/`parseLiteral`, enums must be valid members, inputs are checked field-by-field against `InputObject` definitions, and lists/non-null wrappers enforce structure. Output coercion uses field return types: if a resolver returns something invalid, the executor can error or coerce per scalar rules. This is **not** compile-time safety for resolver implementations—bugs in resolvers can still leak wrong shapes until runtime checks or tests catch them.

```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
}
input CreateUserInput {
  email: String!
  age: Int
}
```

```typescript
// Resolver still must return shape matching User; TS helps if you codegen types.
const resolvers = {
  Mutation: {
    createUser: (_p, { input }, ctx) => {
      // Runtime: input.email is string; input.age optional Int
      return ctx.users.create(input);
    },
  },
};
```

**Trade-offs:** Strong schema contracts help clients and gateways; server teams often add **codegen** (GraphQL Code Generator) or **Pothos** for compile-time alignment. **Tools:** `graphql`, `zod` + custom scalars for extra validation. **Scenario:** A mobile app sends `Int` for `age` as string—coercion rules reject or coerce per spec.

---

## Q3. What is the Abstract Syntax Tree (AST) in GraphQL and how is it used?

**Answer:**

The **AST** is the structured tree representation of a GraphQL **Document** after parsing: `Document` → `OperationDefinition` or `FragmentDefinition` → `SelectionSet` → `Field`, `FragmentSpread`, `InlineFragment`, etc. Each node carries **location** information for errors. The executor and validator walk this tree recursively; **GraphQL.js** exposes `visit()` for transforms (strip directives, complexity analysis). **Tools** like persisted-query registration hash the **printed** or **canonical** form of the document; linters use AST for naming rules.

```javascript
import { parse, visit, Kind } from "graphql";

const doc = parse(`query { user { id name } }`);
visit(doc, {
  Field(node) {
    if (node.name.value === "user") {
      // inspect or rewrite
    }
  },
});
```

**Trade-offs:** AST transforms enable powerful middleware (auth stripping, field-level policies) but add maintenance burden when spec adds new node kinds. **Real-world:** Federation routers parse subgraph SDL and compose supergraph ASTs; gateways may rewrite `__typename` or inject `@defer` handling.

---

## Q4. How does field resolution ordering work in the GraphQL specification?

**Answer:**

For **Query** and **Subscription** root fields, **sibling fields** may execute **concurrently**—the spec does not mandate order among them. For **Mutation**, the spec requires **serial** execution of top-level mutation fields in **document order** so side effects compose predictably. Nested fields under a mutation or query are typically parallelized among siblings unless implementation chooses otherwise (GraphQL.js runs parallel for object fields). **Subscriptions** resolve the initial subscription field; subsequent events are implementation-defined.

```graphql
mutation {
  a  # runs first
  b  # runs after a completes
}
```

```graphql
query {
  x  # may run in parallel with y
  y
}
```

**Trade-offs:** Serial mutations protect workflows like "create then link" but increase latency; some teams split into multiple HTTP requests instead of one mutation with two fields. **Tools:** Apollo documents this; tests should not assume parallel order for queries.

---

## Q5. What are the rules for fragment spreading and how does the spec prevent cycles?

**Answer:**

Fragments must be **on composite types** where spread; **type conditions** must be possible (`... on User` only if `User` appears in union/interface possible types). **Fragment spread must not form cycles:** a fragment cannot transitively include itself (directly or through other fragments). The validator builds a dependency graph and rejects cycles. **Fragment uniqueness** in selection sets (same type condition + name) and **fragment definition** scope are also validated.

```graphql
fragment F on User { id ...G }
fragment G on User { name ...F } # INVALID: cycle
```

**Trade-offs:** These rules keep execution finite and predictable; complex UIs sometimes duplicate small fragments to avoid cycles. **Tools:** `graphql-eslint`, schema IDE plugins catch this at authoring time.

---

## Q6. How does GraphQL handle serial vs parallel execution of mutations?

**Answer:**

Per the spec, **Mutation** root fields execute **sequentially** in source order. This ensures **ordering of side effects** (payments, inventory). **Query** root fields may run in parallel. Implementations must not reorder mutation fields for "optimization" without breaking spec compliance. **Batch HTTP** (multiple operations in one request) is separate: each operation is typically independent unless your server defines custom behavior.

```graphql
mutation {
  transferFunds(from: "A", to: "B", amount: 10)
  notifyUser(id: "u1")
}
```

**Trade-offs:** Long mutation documents increase latency; architects often expose **workflow APIs** or **sagas** at the service layer instead of dozens of mutation fields. **Real-world:** Payment processors wrap multi-step flows in one mutation calling an orchestrator synchronously.

---

## Q7. What is the specification's approach to error handling and the errors array format?

**Answer:**

Responses may include **`data`** (nullable if errors prevent meaningful data) and **`errors`**, an array of **GraphQLError**-shaped objects: **`message`** (required), **`locations`**, **`path`**, and **`extensions`** (implementation-specific). Errors can be **field-level** (resolver threw) or **request-level** (validation). Partial success is allowed: some branches null with errors while others succeed. **Non-null** violations bubble: parent fields become null until a nullable boundary.

```json
{
  "data": { "user": null },
  "errors": [
    {
      "message": "User not found",
      "path": ["user"],
      "extensions": { "code": "NOT_FOUND" }
    }
  ]
}
```

**Trade-offs:** Rich errors help debugging but can leak internals—production often maps internal errors to stable codes in `extensions`. **Tools:** Apollo Server `formatError`, Sentry integration for `path` + trace IDs.

---

## Q8. How do custom directives work at the schema and execution level?

**Answer:**

**Schema directives** extend SDL with `@directive(args)` on types, fields, arguments, etc.; they are **introspectable** if not `@specifiedBy` only. **Executable directives** (`@include`, `@skip`, `@deprecated`, `@oneOf`, experimental `@defer`/`@stream`) appear in **queries** and affect execution. **Custom** executable directives require server support: the executor must **visit** the AST and honor semantics (e.g., `@auth`, `@rateLimit`). **Schema directives** often drive codegen (Apollo Federation `@key`, `@external`) or static analysis rather than runtime unless the framework interprets them.

```graphql
directive @auth(roles: [String!]!) on FIELD_DEFINITION

type Query {
  adminPanel: String @auth(roles: ["ADMIN"])
}
```

```typescript
function authDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
      const auth = getDirective(schema, fieldConfig, "auth")?.[0];
      if (!auth) return fieldConfig;
      const { resolve = defaultFieldResolver } = fieldConfig;
      fieldConfig.resolve = async (source, args, context, info) => {
        assertRoles(context.auth, auth.roles);
        return resolve(source, args, context, info);
      };
      return fieldConfig;
    },
  });
}
```

**Trade-offs:** Directives centralize cross-cutting concerns but obscure control flow—document them and test heavily. **Tools:** `@graphql-tools/schema`, Apollo Server plugins.

---

## Q9. What are executable definitions vs type system definitions in the spec?

**Answer:**

A **Document** combines **executable definitions** (`query`, `mutation`, `subscription`, and `fragment` definitions) that describe **what to run**, with optional **type system definitions** (`schema`, `type`, `input`, `enum`, `scalar`, `directive`, `extend`) that define the **schema SDL**. Clients send executable documents; servers expose type system as **schema**. **Introspection** queries are executable against a served schema. **Tools** split these: codegen consumes schema (type system) + operations (executable).

```graphql
# Type system (typically server-owned)
type Query { me: User }

# Executable (client-owned)
query GetMe { me { id } }
```

**Trade-offs:** Mixing both in one file is used in tests or schema-first setups; production often separates `.graphql` operations from `.graphqls` schema.

---

## Q10. How does the introspection system work internally?

**Answer:**

Introspection is a **meta-schema**: types like `__Schema`, `__Type`, `__Field`, `__InputValue`, `__EnumValue`, `__Directive` exposed under `queryType` fields `__schema` and field `__type(name:)`. The executor **reflects** the live schema object: listing types, fields, args, and default values. **Security:** many production APIs **disable introspection** in public environments or gate it by role to reduce attack surface (schema extraction). **Federation** uses introspection (or SDL upload) to compose subgraphs.

```graphql
query IntrospectionQuery {
  __schema {
    types { name kind }
    queryType { name }
  }
}
```

**Trade-offs:** Essential for tooling; dangerous if exposed to attackers. **Tools:** GraphQL Playground, Insomnia, Rover CLI use introspection; Apollo Studio uses registered schemas instead in enterprise flows.

---

## Q11. What is the __typename meta-field and how is it used for runtime type resolution?

**Answer:**

Every **composite type** (object, interface, union) can query **`__typename`**, returning the **concrete** type name as a string. Clients use it for **cache normalization** (Apollo Client, Relay) as stable keys with `id`. For **unions/interfaces**, it disambiguates which fragment applies. Servers resolve it without custom resolvers—it is built into the executor.

```graphql
query {
  node(id: "1") {
    __typename
    ... on User { handle }
    ... on Post { title }
  }
}
```

```typescript
// Apollo cache key: User:123
const id = `${result.__typename}:${result.id}`;
```

**Trade-offs:** Extra payload; some teams strip `__typename` from public logs. **Real-world:** Essential for polymorphic lists and client store consistency.

---

## Q12. How does GraphQL handle coercion of input values?

**Answer:**

**Input coercion** maps JSON/variables to GraphQL values: **scalars** use parsing rules (Int bounds, String unicode, Boolean strictness); **enums** accept defined names; **lists** wrap single values if not list-wrapped per spec rules; **non-null** rejects null; **input objects** coerce each field, reject unknown fields unless configured, apply defaults. **Output coercion** maps resolver results to types (e.g., `ID` stringifies). Mismatch yields **validation error** before execution or **field error** at runtime.

```graphql
input Filter { limit: Int = 10 }
```

```json
{ "limit": "20" }
```

If `Int` coercion fails, validation errors. **Trade-offs:** Strict coercion prevents subtle bugs but surprises REST migrators; document scalar behavior. **Tools:** `graphql-scalars` for branded types.

---

## Q13. What is the role of the isTypeOf and resolveType functions?

**Answer:**

For **interfaces and unions**, when resolving a field whose static type is abstract, the runtime must pick a concrete **Object** type. **`resolveType(obj, context, info)`** on the interface/union returns a type name or `GraphQLObjectType`. Alternatively, each object type may define **`isTypeOf(value, context)`** returning boolean. GraphQL.js tries `resolveType` first; if absent, it may iterate `isTypeOf` implementations—**performance** matters at scale (prefer `resolveType` with O(1) discriminator).

```typescript
const NodeUnion = new GraphQLUnionType({
  name: "Node",
  types: [UserType, PostType],
  resolveType(value) {
    if ("handle" in value) return "User";
    if ("title" in value) return "Post";
    return null;
  },
});
```

**Trade-offs:** Discriminator columns in DB (`kind` enum) make `resolveType` fast; reflection-based `isTypeOf` is simpler but slower. **Scenario:** Federation `@interfaceObject` complicates resolution—follow Apollo docs for entity boundaries.

---

## Q14. How do you extend the GraphQL specification with custom features?

**Answer:**

Official extensions include **new directives** (registered or community patterns), **custom scalars** with explicit serialization/parsing, **schema extensions** (`extend type`), and **proposals** like `@oneOf`, `@defer`, `@stream`. **Unofficial** extensions: transport-level (subscriptions over WebSocket), **Federation** directives (`@key`, `@requires`), **multipart** uploads. **Interop:** avoid breaking clients—version gateways, use **feature flags** in router. Contributing goes through **GraphQL Working Group** RFC process.

```graphql
scalar DateTime
scalar JSON

directive @cost(weight: Int!) on FIELD_DEFINITION
```

**Trade-offs:** Custom scalars improve domain modeling but complicate clients without shared codegen. **Tools:** Apollo Federation, GraphQL Hive for schema governance.

---

## Q15. What are the latest changes in the GraphQL specification (2021+)?

**Answer:**

Notable additions include **`@oneOf` input objects** (exactly one field set—discriminated unions for inputs), **`@deprecated`** on arguments and input fields, **`specifiedByURL`** for scalar documentation, **`extend schema`**, incremental delivery work (**`@defer` / `@stream`**) as experimental in implementations, and ongoing **subscriptions** clarifications. **October2021** and **June2018** reference versions matter for tooling. **Apply** `@oneOf` for safer input unions; use **incremental delivery** in clients that support multipart responses (Apollo Client 3.8+).

```graphql
input Result @oneOf {
  ok: OkPayload
  err: ErrPayload
}
```

**Trade-offs:** Adopting bleeding-edge spec features fragments the ecosystem until libraries catch up—gate by client capabilities. **Tools:** Check `graphql` release notes, Apollo Router feature matrix.

---

## Q16. How do you design a GraphQL architecture for a company with 50+ microservices?

**Answer:**

Avoid a single monolithic schema implemented by one BFF unless teams are tiny. Prefer **domain-aligned subgraphs** behind a **router/gateway**, each owning schema slices. Establish **schema registry**, **ownership** (SME per subgraph), **SLAs** for schema review, and **contract testing** between subgraphs and router. Use **event-driven** sync where reads span services—Federation entities reference by `@key`. For **non-GraphQL** legacy, use **GraphQL Mesh** or subgraph wrappers. **Observability:** distributed tracing with `graphql.operation.name` on all services.

```text
Clients → Global Router → Subgraph A (Orders), Subgraph B (Users), Subgraph C (Inventory)
                ↓
         Message bus for async projections
```

**Trade-offs:** Federation adds ops complexity vs. one server; wins **team autonomy** and **independent deploys**. **Real-world:** Netflix/Uber-scale patterns combine gateway with strong governance and automated checks in CI.

---

## Q17. What is the Federated GraphQL architecture and how do you implement it at scale?

**Answer:**

**Federation** splits one **supergraph** across **subgraphs**; the **router** composes **query plans** that fetch from multiple services. **Apollo Federation v2** uses directives like `@key`, `@requires`, `@provides`, `@external`, `@shareable`, `@interfaceObject`. At scale: **Apollo Router** (Rust) or **Hive Gateway**, **managed federation** with schema uplink, **Redis**-backed query plan caching, **rate limits** at router, **persisted queries**, and **canary** subgraph rollouts. **Entity** references are resolved by `@key` fields; router batches **Query._entities**.

```graphql
extend type User @key(fields: "id") {
  id: ID! @external
  orders: [Order!]! @requires(fields: "id")
}
```

**Trade-offs:** N+1 across subgraphs is solved by planner batching, not magic—monitor **fan-out**. **Tools:** Rover, Apollo Studio, GraphQL Hive, Cosmo.

---

## Q18. How do you handle schema governance in a large organization?

**Answer:**

Define a **Schema Working Group**, **naming conventions**, **deprecation policy**, and **review SLAs**. Enforce **linting** (`graphql-eslint`), **breaking change detection** (GraphQL Inspector, Apollo checks), **ownership** in CODEOWNERS per subgraph. **Version** supergraph with **release trains**; document **consumer impact** for changes. **Contracts** (consumer-driven) prevent teams from breaking specific clients. **Communication:** changelog, Slack announcements for `DEPRECATED` fields with sunset dates.

```yaml
# Example CI: graphql-inspector
- graphql-inspector diff ./schema-main.graphql ./schema-pr.graphql --rule suppressRemovalOfDeprecatedFields
```

**Trade-offs:** Process slows velocity—balance with **automation** (bots, not meetings). **Scenario:** A mobile app on old version needs 12-month deprecation window.

---

## Q19. What is a schema registry and how does it prevent breaking changes?

**Answer:**

A **schema registry** stores **versioned** GraphQL schemas (supergraph + subgraphs), metadata, and **validation history**. On publish, it runs **composition** (Federation) and **compatibility checks** against **previous** schema and **registered clients** (operations). It **blocks** publishes that break **named operations** or **schema contracts**. **Apollo Studio**, **GraphQL Hive**, **Cosmo** provide this. **Benefit:** single source of truth for "what is in prod."

```bash
rover subgraph publish my-graph@prod --schema ./schema.graphql --name orders
```

**Trade-offs:** Requires discipline to register operations; **trusted documents** tighten this. **Real-world:** Failed CI on `FIELD_REMOVED` saves mobile rollbacks.

---

## Q20. How do you implement a supergraph with Apollo Federation v2?

**Answer:**

Run **Apollo Router** with a **supergraph SDL** (composed from subgraphs). Each subgraph is a GraphQL server implementing **federation subgraph spec** (`_service { sdl }`, `_entities`). Use **Rover** `supergraph compose` locally; in prod, **managed federation** uplinks subgraphs and composes centrally. Mark **entities** with `@key`, use **`@shareable`** for fields resolved in multiple subgraphs intentionally. Configure **dataloader** per subgraph, not globally across subgraphs.

```graphql
# Subgraph: users
type User @key(fields: "id") {
  id: ID!
  name: String!
}
```

```graphql
# Subgraph: reviews
type Review {
  id: ID!
  author: User!
}
extend type User @key(fields: "id") {
  id: ID! @external
  reviews: [Review!]!
}
```

**Trade-offs:** Composition errors are common—**Rover checks** in CI are mandatory. **Tools:** Apollo Router 1.x, OpenTelemetry exporters.

---

## Q21. What are the entity resolution strategies in Federation?

**Answer:**

Entities are identified by **`@key(fields)`**; the **originating** subgraph defines the entity; others **extend** with `@key` + `@external` for foreign keys. **Reference resolvers:** router sends `_entities(representations: [{__typename, id}])` to the owning subgraph. **Composite keys** use multiple fields; **`@requires`** fetches extra fields before resolving a field. **Batching:** router batches representations per subgraph call. **Routing:** ownership determines which subgraph resolves which fields—**overrides** require careful `@override` (Fed v2).

```graphql
type Product @key(fields: "sku locale") {
  sku: String!
  locale: String!
  title: String!
}
```

**Trade-offs:** Wrong `@key` causes **resolution failures** or **duplicate** entities—model keys like **DDD aggregates**. **Tools:** Apollo Studio entity visualization.

---

## Q22. How do you handle cross-service data relationships in Federation?

**Answer:**

Model relationships as **entity references** or **foreign keys** in subgraphs. **Avoid** synchronous deep graphs that fan out 20 services—use **materialized views**, **BFF aggregators**, or **GraphQL @defer** for progressive loading. **`@requires`** chains prerequisite fields from same or other subgraphs (with performance cost). **Event-driven** projections denormalize read models. **Pagination** at subgraph boundaries with **cursor** specs consistent in supergraph.

**Trade-offs:** Elegant graph vs. latency—**SLA per tier** (router adds 1–5ms; each subgraph adds network). **Scenario:** Social feed uses single subgraph with precomputed feed items.

---

## Q23. What is the @key directive and how do you handle composite keys?

**Answer:**

`@key(fields: "a b")` declares **entity identity** across subgraphs; the **selection set** must be fetchable from that subgraph. **Composite keys** suit natural keys (warehouse + sku). All key fields must be **available** when resolving references—often **`@external`** in extending subgraphs for FK pieces. **Normalization:** router passes full representation objects to `_entities`.

```graphql
type Shipment @key(fields: "id") {
  id: ID!
}
# Composite:
type LineItem @key(fields: "orderId lineNo") {
  orderId: ID!
  lineNo: Int!
}
```

**Trade-offs:** Composite keys complicate client caching—ensure **stable serialization** in representations. **Tools:** Federation validation warns if `@external` misuse.

---

## Q24. How do you implement a shared types strategy across federated services?

**Answer:**

Use **composition-friendly** patterns: **`@shareable`** for fields intentionally duplicated; **scalar** and **enum** definitions must **match** across subgraphs (same name and structure). **Extract** shared SDL to **npm packages** (`@org/graphql-common`) published and imported into each subgraph build. **Avoid** drift with **CI** that diffs shared types. **Interfaces** can span subgraphs with **`@interfaceObject`** (advanced) for gradual migration.

```graphql
scalar DateTime
enum Currency { USD EUR }
```

**Trade-offs:** Shared packages create **release coordination**—use **semver** and automated bumps. **Alternative:** codegen from single **source of truth** schema fragment.

---

## Q25. What is the Router/Gateway pattern and how do you optimize query planning?

**Answer:**

The **router** is the **GraphQL entry** that **plans** operations into **sub-queries** per subgraph. **Optimize** by: minimizing **depth** and **fan-out**, **caching** query plans (Apollo Router), **APQ** to skip parser load, **persisted queries** only, **CDN** at edge for GET (careful with auth). **Prefetch** hot operations; **shard** subgraphs by domain to reduce planner complexity. **Profiling:** router spans show **fetch** timings per subgraph.

```yaml
# apollo-router.yaml (conceptual)
supergraph:
  listen: 0.0.0.0:4000
traffic_shaping:
  subgraphs:
    orders:
      deduplicate_query: true
```

**Trade-offs:** Router is a **SPOF**—deploy **multi-region** with anycast. **Tools:** Apollo Router coprocessors (Rust plugins), Rhai scripts.

---

## Q26. How do you handle schema evolution in a federated environment?

**Answer:**

Use **expand-contract**: **add** nullable fields first, **migrate** clients, **deprecate**, **remove** after window. **Federation-specific:** add fields in **one** subgraph first; use **`@inaccessible`** to hide from public API until ready. **Coordinate** **composition**—subgraph removals may break supergraph; **CI** composes all branches. **Version** mobile clients with **min supported** schema age.

**Trade-offs:** **Parallel changes** across 10 teams need **registry** gates. **Scenario:** Renaming `userId` to `ownerId` uses `@deprecated(reason: "Use ownerId")` plus dual field period.

---

## Q27. What are contract schemas and how do you use them?

**Answer:**

**Contract (filter) schemas** are **views** of the supergraph **tagged** for specific audiences—e.g., `public` vs `partner` vs `internal`. Implement with **`@tags`** + **contracts** in Apollo Studio or **Hive**; the router serves **different filtered schemas** per API key/channel. **Use** when **partners** must not see internal fields without separate deployments.

```graphql
type Query {
  publicField: String @tag(name: "public")
  secretField: String @tag(name: "internal")
}
```

**Trade-offs:** Operational overhead—multiple schemas to test; **mis-tagged** fields leak or disappear. **Governance:** mandatory tag review in CI.

---

## Q28. How do you implement a GraphQL API platform for internal and external consumers?

**Answer:**

Offer **tiered** access: **internal** full supergraph in VPC; **external** filtered contract with **stricter rate limits**, **OAuth**, **allowlisted** persisted queries. **Developer portal** with **keys**, **docs**, **changelog**. **SLOs** differ (external 99.9%). **Multi-tenant** auth at router **coprocessor**. **Analytics** per consumer ID.

**Trade-offs:** One platform vs. **two stacks**—unified reduces duplication but increases **blast radius**; isolate **noisy neighbor** with quotas.

---

## Q29. How do you design a multi-region GraphQL deployment?

**Answer:**

Deploy **routers** in each region; **route** users to nearest region (GeoDNS). **Subgraphs** regional where data is local; **global** subgraphs behind **replicated** DBs. **Cache** at region (Redis) with **TTL** and **invalidation** events (Kafka). **Subscriptions** sticky to region or use **global pub/sub** (Redis Enterprise, Ably). **Consistency:** accept **read-your-writes** trade-offs or route writes to **home** region.

**Trade-offs:** **Supergraph composition** is global—**data** placement drives latency more than GraphQL. **Tools:** Apollo Router **prioritized** subgraph URLs per region if supported; custom **service discovery**.

---

## Q30. What is the difference between Apollo Router, Apollo Gateway, and custom gateways?

**Answer:**

**Apollo Router** is **Rust**, high-performance, **recommended** for Federation v2; supports **coprocessors**, **YAML** config, **hot reload** for some settings. **Apollo Gateway** is **Node.js**, older, still works but **not** preferred for new large-scale deployments. **Custom gateways** might use **GraphQL Mesh**, **Apollo Server** as gateway, or **in-house**—flexible but you own **composition**, **security**, **perf**. **Choose Router** unless you need Node-only plugins.

**Trade-offs:** Custom = control; Router = **maintained** planner and **perf**. **Migration:** Gateway → Router is common with parallel testing.

---

## Q31. How do you implement GraphQL in a domain-driven design (DDD) context?

**Answer:**

Align **subgraphs** (or schema modules) with **bounded contexts**—**Orders**, **Billing**, **Catalog**. **Aggregates** map to **mutation** design: one mutation per **application service** method, not per table. **Avoid** leaking **infrastructure types** (DB rows) into API—use **application DTOs**. **Ubiquitous language** in type names. **Anti-corruption layers** translate legacy services behind resolvers.

```graphql
type Order {  # aggregate root
  id: ID!
  status: OrderStatus!
  lineItems: [OrderLine!]!
}
```

**Trade-offs:** Strict DDD may **fragment** graphs—use **Federation** to stitch **contexts** at API layer.

---

## Q32. How do you handle eventual consistency in GraphQL with event sourcing?

**Answer:**

Expose **version** or **read models** that may lag; document **staleness** in field descriptions or **extensions**. **Mutations** append **events**; **queries** read **projections**—clients see **eventual** updates. Use **subscriptions** or **polling** for critical UX. **Resolver** returns **timestamps** (`asOf`). **Conflict:** optimistic UI with **mutation** response including **expectedVersion**.

```graphql
type Book {
  id: ID!
  title: String!
  revision: Int!
}
```

**Trade-offs:** GraphQL does not solve **consistency**—**architecture** does; APIs must be **honest** about guarantees.

---

## Q33. What is the saga pattern and how does it interact with GraphQL mutations?

**Answer:**

A **saga** coordinates **multiple local transactions** with **compensating actions**. In GraphQL, expose **orchestrated mutations** (`placeOrder`) that call saga **workflow engine** (Temporal, Camunda) **asynchronously**, returning **job ID**; client polls `orderStatus` or subscribes. **Avoid** one mutation doing 5 sync RPCs with partial failure—use **idempotency keys** and **state machines**.

```graphql
type Mutation {
  placeOrder(input: PlaceOrderInput!): PlaceOrderResult!
}
type PlaceOrderResult {
  workflowId: ID!
  status: WorkflowStatus!
}
```

**Trade-offs:** **Async** UX complexity vs. **reliability**; GraphQL is just the **front door**.

---

## Q34. How do you design a GraphQL API for real-time collaboration features?

**Answer:**

Combine **subscriptions** (presence, edits) with **mutations** (save). **CRDT** or **OT** on client; server **broadcasts** via **pub/sub** (Redis, Kafka). **Authorize** per **document** ID in subscription filter. **Rate-limit** subscription payloads. **Use** `graphql-ws` with **auth** in `connectionParams`. **Scale** with **horizontally** scaled socket servers + Redis adapter.

**Trade-offs:** Subscriptions **don’t** guarantee ordering across shards—**partition** by document. **Tools:** Liveblocks, Socket.io patterns with GraphQL.

---

## Q35. How do you implement a plugin architecture for GraphQL servers?

**Answer:**

Use **envelop** (generic GraphQL plugin system), **Apollo Server plugins** (`requestDidStart`), or **Yoga** plugins. Plugins wrap **parse**, **validate**, **execute**, **subscribe** for **auth**, **metrics**, **logging**, **error masking**. **Order** matters—document **dependency** between plugins. **Federation subgraphs** use **plugins** per service; **router** uses **coprocessors** / **Rhai**.

```typescript
const getEnveloped = envelop({
  plugins: [
    useSchema(schema),
    useAuth0({ domain: process.env.AUTH0_DOMAIN! }),
    useOpenTelemetry(),
  ],
});
```

**Trade-offs:** Deep plugin stacks obscure **latency**—benchmark **each** plugin. **Scenario:** PII redaction plugin before logging.

---

## Q36. How do you handle GraphQL performance at 100K+ requests per second?

**Answer:**

**Horizontal scale** stateless servers behind **load balancers**; **CPU** profile parsing—use **APQ** / **persisted queries** to skip parse. **Router** tier separately from subgraphs. **Cache** at **CDN** (GET+APQ), **Redis** for **response** fragments, **in-memory** for **hot** keys. **Avoid** resolver storms with **batching** (DataLoader), **look-ahead** SQL, **read replicas**. **Tune** **Node** `--max-old-space-size`, use **Rust/Go** routers. **Backpressure** with **queues** and **load shedding**.

```typescript
// APQ: client sends hash only
// { "extensions": { "persistedQuery": { "version": 1, "sha256Hash": "..." } } }
```

**Trade-offs:** **Caching** vs **freshness**; **strong consistency** paths may not hit 100k RPS on hot fields without **architecture** change.

---

## Q37. What is query planning and how do optimizers like the Apollo query planner work?

**Answer:**

In **Federation**, **query planning** splits an operation into **nodes** fetching from subgraphs in **dependency order**, **merging** fields where possible, **batching** `_entities`. The **planner** analyzes **fragments**, **@requires** chains, and **keys**. **Optimizations:** **deduplicate** identical fetches, **parallel** independent branches, **minimize** round-trips. **Apollo Router** caches **plans** keyed by operation + schema ID.

**Trade-offs:** Planner upgrades can **change** plans—**regression test** critical operations with **golden** traces. **Tools:** Router **query plan** JSON in dev, **Apollo Studio** performance insights.

---

## Q38. How do you implement query normalization?

**Answer:**

**Normalization** canonicalizes queries for **cache keys**: sort fields, flatten fragments, remove redundancies. **Libraries:** `@apollo/persisted-query-lists` with **automatic** hashing; **Relay compiler** normalizes for store. **Server-side:** store **AST** hashes for APQ. **Benefit:** same logical query hits one cache entry.

```javascript
import { sortAST } from "some-normalizer"; // conceptual
const key = hash(print(sortAST(parse(query))));
```

**Trade-offs:** Normalization **cost** CPU—do **once** per request or on registration. **Scenario:** CDN cache keyed by normalized hash + auth scope.

---

## Q39. What is the look-ahead pattern and how do you use it for database query optimization?

**Answer:**

**Look-ahead** means inspecting **`GraphQLResolveInfo`** (`fieldNodes`, `fragments`) to **predict** nested selections and **fetch** everything in **one** SQL/ORM query (e.g., **JOIN** or **DataLoader** batch with selected columns). **Prisma**, **Hasura**, **PostGraphile** automate this; hand-written resolvers use **`graphql-fields`** or custom walkers.

```typescript
import graphqlFields from "graphql-fields";

const User = {
  async posts(parent, args, ctx, info) {
    const projections = graphqlFields(info);
    // if projections only needs { id, title } -> SELECT id, title
    return ctx.db.post.findMany({ where: { userId: parent.id }, select: pick(projections.posts) });
  },
};
```

**Trade-offs:** Tight **coupling** to query shape; **schema changes** need resolver updates. **Win:** removes **N+1** when done right.

---

## Q40. How do you implement request-level and field-level caching strategies?

**Answer:**

**Request-level:** HTTP cache **GET** (short ops), **CDN** with **Vary: Authorization** carefully—or **no-store** for personalized data. **Application:** **Redis** full response cache keyed by `operationName` + variables + user scope. **Field-level:** **Apollo Server** cache **inside** resolvers (`cacheControl` directives), **entity** cache with **TTL** per type. **Invalidation:** **event-driven** on writes (cache purge by key pattern).

```graphql
type Post @cacheControl(maxAge: 60) {
  title: String
}
```

**Trade-offs:** **Field** caches **complex** to invalidate; **request** cache simpler but **coarse**. **Tools:** Apollo **responseCachePlugin**, **Stellate** edge caching.

---

## Q41. What is Automatic Persisted Queries (APQ) and how does it reduce bandwidth?

**Answer:**

**APQ** sends a **SHA-256** hash of the query instead of the full body on **most** requests; first request may send **full query** to **register** hash server-side. **Reduces** payload size on mobile networks. **Pairs** with **GET** caching. **Security:** combine with **allowlist** in high-trust APIs.

```json
{
  "extensions": {
    "persistedQuery": { "version": 1, "sha256Hash": "ecf4edb46db..." }
  }
}
```

**Trade-offs:** **Cache miss** round trip; **CDN** must support APQ flow. **Tools:** Apollo Client `createPersistedQueryLink`.

---

## Q42. How do you implement a distributed cache for GraphQL?

**Answer:**

Use **Redis Cluster** or **Memcached** with **consistent hashing**; **namespace** keys by **schema version** to avoid stale shape. **Serialize** cached **JSON** responses or **normalized entities**. **Pub/sub** for **multi-region** invalidation. **Stamps** (`updatedAt`) for **optimistic** TTL overlap.

```typescript
const cacheKey = `gql:v${schemaVersion}:${operationHash}:${stableStringify(variables)}:${userId}`;
await redis.set(cacheKey, JSON.stringify(payload), "EX", ttlSeconds);
```

**Trade-offs:** **Stampede** mitigation with **singleflight** or **probabilistic** early expiration. **GDPR:** user-scoped keys for **deletion**.

---

## Q43. What are the strategies for connection pooling with GraphQL?

**Answer:**

GraphQL **bursts** concurrency—size **DB pools** larger than naive web apps but **bound** by DB limits; use **PgBouncer** **transaction** or **statement** pooling. **Per-request** context should **not** create new pools. **Serverless:** **RDS Proxy**, **Neon** pooler. **Subgraph** isolation: **each** service owns pool to **fault** isolate.

**Trade-offs:** **Big pools** hide **slow queries** until DB melts—**monitor** wait times. **Scenario:** 200 Lambda invocations × pool = **too many** connections → **proxy** mandatory.

---

## Q44. How do you handle memory management and garbage collection in high-throughput GraphQL servers?

**Answer:**

**Avoid** huge **arrays** in single resolver responses—**pagination**. **Stream** large lists (`@stream` where supported). **Reuse** buffers; **limit** **depth** and **cost**. **Node:** tune **GC** flags sparingly; prefer **multiple** smaller processes (**cluster**) over one **giant** heap. **Profile** **heap** snapshots for **AST** retention leaks (caches without eviction).

**Trade-offs:** **Complexity** limits vs. **UX**; **cursor** pagination is industry default at scale.

---

## Q45. What is the @defer directive and how does it enable streaming responses?

**Answer:**

**`@defer`** marks **fragments** or fields **non-critical**; the server **streams** initial response **fast**, then **incremental** patches (**multipart** HTTP or chunked). **Improves** TTFB for slow subtrees. **Requires** **spec**-aligned server (graphql-http incremental) and **client** (Apollo Client **@defer** support).

```graphql
query {
  hero {
    name
    ... @defer {
      friends { name }
    }
  }
}
```

**Trade-offs:** **Client** complexity, **CDN** caching harder, **proxies** must not buffer. **Status:** Production adoption growing (2024–2026).

---

## Q46. What is the @stream directive and how does it work?

**Answer:**

**`@stream`** on **list fields** delivers **items incrementally** instead of waiting for full list resolution—great for **large** feeds when ordering allows. Server sends **initial** response with **partial list**, then **patches**. **Back-pressure** and **ordering** semantics must match product requirements.

```graphql
query {
  feed @stream(initialCount: 5) {
    id
    title
  }
}
```

**Trade-offs:** **UI** flicker vs. **latency**; **caching** per-chunk is hard. **Tools:** graphql-js experimental, Apollo Router roadmap—verify version.

---

## Q47. How do incremental delivery and multipart responses work in GraphQL?

**Answer:**

**Incremental delivery** uses **multipart MIME** (`multipart/mixed`) or **HTTP chunked** framing: first part contains **initial** `data`, subsequent parts **incremental** payloads with **path** + **data** merging rules. **Clients** merge into single **result**. **Spec** drafts define **boundary** format and **content-type**.

**Trade-offs:** **Middleware** must **forward** streams; **WAFs** may buffer—configure carefully. **Testing:** harder than single JSON.

---

## Q48. How do you implement edge caching for GraphQL?

**Answer:**

Use **GET** + **APQ** + **CDN** (Cloudflare, Fastly) with **cache keys** from **hash** + **optional** auth scope. **Stellate**, **Apollo** **embed** strategies. **Private** data: **no edge** or **per-user** edge with **short TTL** and **Vary** headers—often **avoid** caching personalized graphs at edge **entirely**.

```http
GET /graphql?extensions={"persistedQuery":{"version":1,"sha256Hash":"abc"}}
```

**Trade-offs:** **Stale** public content acceptable; **financial** data not. **Scenario:** Marketing site **global** FAQ query cached worldwide.

---

## Q49. What are the strategies for database query optimization in GraphQL resolvers?

**Answer:**

**DataLoader** batch+cache, **look-ahead** select columns, **indexes** on FK used in lists, **avoid** `SELECT *`, **limit** joins depth, **explain analyze** slow operations. **Separate** **read models** for heavy dashboards. **Connection** spec **pagination** with **indexed** cursors.

```typescript
const userLoader = new DataLoader(async (ids: string[]) => {
  const rows = await db.user.findMany({ where: { id: { in: ids } } });
  return ids.map((id) => rows.find((r) => r.id === id));
});
```

**Trade-offs:** **Premature** batching **everywhere** adds complexity—profile first.

---

## Q50. How do you implement query cost analysis that accounts for database joins?

**Answer:**

Assign **weights** to fields (`@cost` custom directive) and **multiply** by **arguments** (e.g., `first`). **Static** analysis sums **max** cost before execute. **Join-aware:** resolver **hints** add **DB cost** when `friends` triggers **heavy** join—**middleware** adds penalty. **Reject** above threshold with **429** or **GraphQL error**.

```typescript
function calculateCost(ast, variables) {
  let cost = 0;
  visit(ast, {
    Field(node) {
      cost += fieldWeights[node.name.value] ?? 1;
    },
  });
  if (cost > MAX_COST) throw new GraphQLError("Query too expensive");
}
```

**Trade-offs:** **Tuning** weights is ongoing; **false positives** anger devs—provide **dev** bypass with **auth**.

---

## Q51. How do you profile and trace GraphQL queries in production?

**Answer:**

OpenTelemetry **spans** per **operation**, **resolver** spans optional (sampled). **Attributes:** `graphql.operation.name`, `graphql.document`, **subgraph** names in federation. **Apollo Studio** traces, **Datadog** APM GraphQL integration. **Log** **slow** operations **>500ms** with **variables** redacted.

```typescript
const server = new ApolloServer({
  plugins: [
    {
      async requestDidStart() {
        return {
          async willSendResponse({ request }) {
            const span = trace.getActiveSpan();
            span?.setAttribute("graphql.operation.name", request.operationName ?? "");
          },
        };
      },
    },
  ],
});
```

**Trade-offs:** **Per-resolver** tracing **high cardinality** cost—**sample** 1–5%.

---

## Q52. What is the role of DataLoader at scale and its limitations?

**Answer:**

**DataLoader** **batches** requests in one **tick** and **caches** per request—solves **N+1** for **single** key lookups. **Limitations:** **not cross-request** (unless you accept stale—usually **don’t**); **wrong** batching if keys **order** inconsistent; **doesn’t** help **nested** filters without careful API. **Prime** loaders after **bulk** fetches.

```typescript
context.loaders.user = new DataLoader((ids) => db.users.byIds(ids));
```

**Trade-offs:** **Global** loader cache = **hard** invalidation—**per-request** is default. **At scale:** **many** loaders per request—**monitor** memory.

---

## Q53. How do you handle hot paths and cold paths in GraphQL query execution?

**Answer:**

**Identify** top operations via **metrics**; **optimize** hot paths with **caching**, **denormalization**, **APQ**. **Cold paths** (rare admin reports) get **stricter** timeouts, **async** jobs, **separate** **endpoint** or **role** routing. **Router** **prioritization** queues possible.

**Trade-offs:** **Splitting** APIs increases **ops** burden; **SLO-based** routing is **staff-level** pattern.

---

## Q54. What are the strategies for horizontal scaling of GraphQL servers?

**Answer:**

**Stateless** nodes behind **LB**; **sticky sessions** only for **subscriptions**. **Auto-scale** on **CPU** and **p95 latency**. **Separate** **websocket** fleet. **Federation:** scale **subgraphs** independently per **load**. **Cache** **shared** state in **Redis**.

**Trade-offs:** **WebSocket** scaling needs **pub/sub** bridge; **avoid** in-memory **rate limit** state without **Redis**.

---

## Q55. How do you implement load shedding and circuit breaking in GraphQL?

**Answer:**

**Router** **timeouts** per subgraph, **retry** with **jitter**, **circuit breaker** when **error rate** high (Apollo Router traffic shaping). **Server:** **queue** limits, **503** with **Retry-After**. **Cost** analysis rejects **expensive** queries early.

```yaml
traffic_shaping:
  subgraphs:
    inventory:
      timeout: 2s
```

**Trade-offs:** **Shedding** loses **revenue** vs. **outage**—**business** rules define **priority** mutations.

---

## Q56. How do you implement a comprehensive security model for a GraphQL API?

**Answer:**

**Defense in depth:** **TLS**, **authn** (OAuth2/OIDC), **authz** at **router** and **resolver**, **input validation**, **rate limiting**, **depth/cost** limits, **introspection** off in prod, **error** sanitization, **audit** logs, **CORS** lockdown. **Federation:** **coprocessor** for **central** policy. **Regular** **pentests** focused on **batching** and **alias** attacks.

```typescript
const depthLimit = depthLimitPlugin({ maxDepth: 7 });
const costLimit = /* custom */;
```

**Trade-offs:** **Security** vs **DX**—**staging** mirrors prod controls for **real** testing.

---

## Q57. What is the persisted queries security model and trusted documents?

**Answer:**

**Persisted queries** allow **only** **pre-registered** operations—**no ad-hoc** queries from clients. **Trusted documents** (Apollo) **tie** builds to **allowed** operations—**CI** uploads manifest. **Stops** **probing** attacks and **large** query DOS. **Mobile** apps ship **manifest**; **web** uses **build-time** extraction.

```bash
rover persisted-queries publish --manifest operations.json
```

**Trade-offs:** **Ops** overhead; **breaks** **ad-hoc** GraphiQL in prod (good for public API).

---

## Q58. How do you implement row-level security through GraphQL?

**Answer:**

Propagate authenticated **auth context** (`userId`, `tenantId`, claims) into every resolver and database call. DataLoader batch functions must apply the same tenant filters as direct queries. Use Postgres **RLS** policies as a defense-in-depth layer so even a buggy resolver cannot exfiltrate another tenant’s rows when `SET app.tenant_id` is applied per request. Never trust client-supplied `id` arguments as proof of ownership—always verify against the authenticated principal. Integration tests should assert cross-tenant access returns `null` or forbidden errors, not empty success.

```sql
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

```typescript
resolve: async (_p, { id }, ctx) => {
  return ctx.db.order.findFirst({ where: { id, tenantId: ctx.auth.tenantId } });
};
```

**Trade-offs:** RLS adds planner constraints—index `tenant_id` on large tables. Combine RLS with application checks for clearer error messages than raw policy violations.

---

## Q59. How do you handle PII and data masking in GraphQL responses?

**Answer:**

Apply **field middleware** or resolver wrappers so email, phone, and government IDs are redacted unless the caller has an elevated role. Use logging plugins that **redact** PII from error messages and stack traces before they reach centralized logs. Maintain separate **internal** vs **partner** schema views with Federation’s `@inaccessible` or contract tags so sensitive fields never appear in public supergraphs. Review every new field in schema review for accidental PII exposure.

```typescript
maskPII: (value, role) => (role === "ADMIN" ? value : redactEmail(value));
```

**Trade-offs:** Masking in resolvers is easy to bypass with a new field—governance and automated schema audits matter as much as code.

---

## Q60. What is the security implication of GraphQL batching attacks?

**Answer:**

HTTP **batching** sends many named operations in one request, multiplying work while consuming only one rate-limit token. **Aliases** repeat the same expensive field hundreds of times with different arguments, amplifying cost and database load. Mitigate with query **cost** analysis, **alias limits**, **per-operation** quotas, persisted or allowlisted queries, and WAF rules that understand GraphQL bodies. Combine with authenticated tiers so trusted internal tools get higher limits than anonymous traffic.

```graphql
query {
  a1: user(id:1) { passwordHash }
  a2: user(id:2) { passwordHash }
  # ... hundreds
}
```

**Trade-offs:** Strict defaults may frustrate legitimate bulk admin tools—offer higher quotas behind strong auth and separate endpoints.

---

## Q61. How do you implement OAuth 2.0 / OIDC with GraphQL?

**Answer:**

Send **Bearer** access tokens in the `Authorization` header; validate JWTs at the gateway using **JWKS** rotation and short lifetimes. Map claims into `context` for resolvers and DataLoader. For **subscriptions**, pass tokens in `graphql-ws` `connectionParams` and validate on `connect`; handle refresh out-of-band (mobile) or via a **BFF** that keeps refresh tokens off the browser. Use opaque tokens at the edge if introspection cost is a concern, resolving to session context at the router.

```typescript
const server = new ApolloServer({
  context: async ({ req }) => {
    const user = await verifyJwt(req.headers.authorization);
    return { user };
  },
});
```

**Trade-offs:** Long-lived JWTs increase replay risk—prefer short access tokens plus refresh, or session cookies with CSRF protections for cookie-based flows.

---

## Q62. How do you handle API gateway security with GraphQL Federation?

**Answer:**

Terminate **TLS** at the router; use **mTLS** between router and subgraphs in zero-trust meshes. Validate JWTs **once** at the router and forward **signed internal** headers or mTLS identity to subgraphs—avoid re-parsing JWTs in every subgraph unless required for defense in depth. Never pass secrets from clients through GraphQL variables; inject service credentials in the router **coprocessor** or sidecar when calling subgraphs. Document the trust boundary: what subgraphs may assume about forwarded headers.

**Trade-offs:** Double validation in every subgraph adds latency—standardize on one model (router trust vs mutual verification).

---

## Q63. What are the OWASP GraphQL security considerations?

**Answer:**

The OWASP **GraphQL Cheat Sheet** highlights introspection abuse, batching and alias amplification, deep queries, broken object-level authorization, and verbose errors that leak stack traces. Mitigations include disabling or gating introspection, enforcing depth and cost limits, per-field authorization, avoiding GET for state-changing operations, and CSRF defenses for cookie sessions (SameSite, double-submit cookies). Automate checks in CI with `graphql-eslint` and DAST against staging.

**Trade-offs:** Checklists without automation drift—encode policies in router config and tests, not wiki pages alone.

---

## Q64. How do you implement request signing for GraphQL?

**Answer:**

Partners sign a **canonical string** (HTTP method, path, SHA-256 of body, timestamp, optional nonce) with **HMAC-SHA256** using a shared secret or asymmetric keys. The server verifies the signature, rejects stale timestamps outside a small skew window, and stores nonces to prevent replay within the window. AWS **SigV4** is a common pattern for B2B APIs. Rotate keys via KMS and support overlapping validity periods during rotation.

```typescript
const sig = hmac(secret, `${timestamp}\n${sha256(body)}`);
headers["X-Signature"] = sig;
```

**Trade-offs:** Clock skew breaks clients—document tolerance; use NTP on servers and clients where possible.

---

## Q65. How do you handle rate limiting per field/type in GraphQL?

**Answer:**

Implement **Envelop** plugins or custom directives that increment **Redis** counters keyed by `userId:Operation.field` or similar. Give expensive fields (`search`, `recommendations`) lower budgets than cheap ones (`node`). Return HTTP 429 or GraphQL errors with stable `extensions.code` for client backoff. Start with **operation-level** limits to keep cardinality low, then refine to hot fields identified in metrics.

```typescript
if (await rateLimiter.consume(`${userId}:Query.search`, 10)) {
  throw new GraphQLError("Rate limit exceeded", { extensions: { code: "RATE_LIMIT" } });
}
```

**Trade-offs:** Per-field keys multiply Redis cardinality—monitor memory and use TTL aggressively.

---

## Q66. What is query allowlisting and how do you implement it in production?

**Answer:**

**Allowlisting** means only **pre-registered** operations (hashes or IDs) execute in production; ad-hoc query strings are rejected. CI publishes a manifest to the router (Rover persisted queries, Apollo safelist). Store an emergency hash override in secure configuration for break-glass incidents. Pair with APQ so clients send hashes while the server retains the document store.

**Trade-offs:** Hotfixes require manifest updates—define an on-call runbook and automated publish pipeline so outages are not blocked by process.

---

## Q67. How do you prevent schema extraction attacks?

**Answer:**

Disable **introspection** on public endpoints; if tooling needs it, expose introspection only on authenticated staging or VPN. Rate-limit introspection-like patterns and alert on unusually large introspection queries. Returning fake schemas to unauthenticated users is brittle—prefer HTTP 401 without introspection. Legitimate consumers should pull SDL from the **schema registry** or authenticated export endpoints.

**Trade-offs:** Developer experience suffers without introspection—compensate with Studio, exported SDL, and good documentation.

---

## Q68. How do you implement audit logging for GraphQL operations?

**Answer:**

Log **operation name**, stable **hash** of the query document, authenticated user id, client IP / device id, success vs error, and duration. **Never** log raw variables that contain passwords or PII—use redaction lists. Ship structured JSON to your SIEM; emit OpenTelemetry events for denied authorization. Sample successful logs at high volume but retain 100% of failures and denials for investigations.

```typescript
logger.info({
  event: "graphql.execute",
  operationName: request.operationName,
  userId: ctx.user?.id,
  durationMs,
});
```

**Trade-offs:** Full logging is expensive—tune sampling by route and operation criticality.

---

## Q69. What is the security model for GraphQL subscriptions at scale?

**Answer:**

At scale, subscriptions combine **long-lived transport security** with **application-level authorization on every payload**. You must authorize both the **subscription selection** (can this principal subscribe to this topic?) and **each published event** (does this event belong to this subscriber?). Enforce TLS end-to-end; restrict WebSocket origins; rate-limit connection attempts per IP, per user, and per API key. If you use Redis Pub/Sub or a broker between app servers and socket nodes, ensure **tenant filters** are applied before data hits the bus—never rely on “obscure” topic names alone. Mitigate DDoS on connection storms with authenticated connections, CAPTCHA only where appropriate, and autoscaling with sensible max connection limits per instance.

**Trade-offs:** Stateful connections complicate capacity planning; permissive subscription APIs increase blast radius. Prefer explicit topic contracts and integration tests that prove cross-tenant leakage cannot occur.

---

## Q70. How do you handle multi-tenant authorization in GraphQL?

**Answer:**

Carry a **tenant identifier** (and roles) in the authenticated context from JWT/OIDC claims—never accept `tenantId` from the client as authoritative. Every resolver that loads data must scope queries by tenant (or rely on Postgres **RLS** with `SET app.tenant_id` per request). Cache keys in Redis must include tenant; DataLoader batch functions must partition by tenant to avoid cross-tenant batch mixing. In Federation, the router should forward tenant context via **trusted headers** to subgraphs; subgraphs must not trust headers from the public internet without verification. Add lint rules or codegen checks so resolvers cannot compile without receiving `ctx.auth`.

```typescript
if (resource.tenantId !== ctx.auth.tenantId) {
  throw new ForbiddenError();
}
```

**Trade-offs:** One missed check leaks data across tenants—automate verification with RLS plus code review for new fields. Federation adds complexity: standardize header names and rotate subgraph trust boundaries with mTLS.

---

## Q71. How do you architect GraphQL subscriptions for millions of concurrent connections?

**Answer:**

Scale **horizontally**: dedicated WebSocket/process fleets behind a load balancer with **sticky sessions** (or consistent hashing by user id). Use **Redis Pub/Sub**, NATS, or Kafka to fan out events to all nodes that hold active sockets; partition topics by shard key (e.g., `tenantId:documentId`) to cap fan-out per channel. Implement **back-pressure**: drop slow consumers, bound per-connection queues, and monitor memory. Separate subscription infrastructure from HTTP GraphQL to isolate failure and scaling curves. For geo-distribution, consider regional clusters with event replication—global ordering is usually unnecessary; design for per-channel causal consistency instead.

**Trade-offs:** Millions of connections imply significant RAM and OS tuning (file descriptors, kernel buffers); synthetic load tests are mandatory before launch.

---

## Q72. What is the difference between WebSocket, SSE, and HTTP streaming for subscriptions?

**Answer:**

**WebSockets** (`graphql-ws` protocol) are **bidirectional**, low-latency, and ideal for subscriptions and client-initiated messages; they require sticky routing and careful idle/keep-alive handling. **Server-Sent Events (SSE)** are **one-way** (server → client), simpler over standard HTTP, with automatic reconnection in browsers, but limited by per-origin connection limits and no binary framing. **HTTP streaming** (chunked responses, multipart incremental delivery) suits **@defer/@stream** and some subscription implementations over a single HTTP request/response lifecycle. Corporate proxies sometimes block WebSockets—plan SSE or long-poll fallbacks for constrained networks.

**Trade-offs:** WebSockets maximize flexibility; SSE maximizes simplicity for push-only; choose based on firewall reality and client capabilities.

---

## Q73. How do you implement subscription filtering and topic-based routing?

**Answer:**

Clients subscribe with variables (e.g., `postId`); the server maps each connection to **topics** such as `COMMENT_ADDED:${postId}`. Publishers emit only to relevant topics after authorization. Filter at publish time (cheap) or delivery time (flexible but more CPU). For large channels, use an external broker with consumer groups rather than in-process fan-out.

```typescript
pubsub.subscribe(`COMMENT_ADDED:${postId}`, (payload) =>
  filterForUser(payload, userId)
);
```

**Trade-offs:** Fine-grained topics reduce wasted delivery but increase memory for subscription maps; very high cardinality may require sharded brokers or Kafka partitions per domain aggregate.

---

## Q74. How do you handle subscription lifecycle management (connect, disconnect, keep-alive)?

**Answer:**

Use **`graphql-ws`**: structured `connection_init`, `ping`/`pong` keep-alives, and explicit **disconnect** handling. Authenticate in `onConnect` from `connectionParams`; tear down internal topic subscriptions in `onDisconnect` to prevent leaks. Set maximum connection duration and idle timeouts; mobile apps need longer tolerances than web. Monitor reconnect storms after deploys—clients should use exponential backoff with jitter.

```typescript
useServer({
  schema,
  onConnect: async (ctx) => {
    await auth(ctx.connectionParams);
  },
  onDisconnect: async () => {
    /* unsubscribe internal bus */
  },
});
```

**Trade-offs:** Aggressive timeouts drop backgrounded mobile clients; tune per platform and measure churn metrics.

---

## Q75. What is the graphql-ws protocol and how does it differ from subscriptions-transport-ws?

**Answer:**

**`graphql-ws`** (package name `graphql-ws`) implements the **graphql-transport-ws** subprotocol: clear message types (`connection_init`, `subscribe`, `next`, `complete`, `ping`, `pong`), strong guidance on authentication and error handling, and active maintenance. The older **`subscriptions-transport-ws`** is **legacy**, has inconsistent ping behavior, and is deprecated for new projects. Apollo Client and most modern servers recommend `graphql-ws`. Migration involves updating both client `GraphQLWsLink` and server `useServer` from `ws`.

**Trade-offs:** Legacy mobile or third-party clients may still speak the old protocol—run parallel endpoints during migration or provide a compatibility shim with a sunset date.

---

## Q76. How do you implement subscription scalability with Redis PubSub or Kafka?

**Answer:**

After a database commit, workers publish events to **Redis** channels or **Kafka** topics. Each GraphQL node subscribes to patterns it needs and forwards to matching WebSocket clients. Redis Pub/Sub is fast but **not durable**—subscribers miss messages if offline. Kafka gives **replay** and ordering within a partition; you add a consumer service that bridges to WebSocket nodes via Redis or gRPC fan-out. Choose Kafka when you need audit trails, replay, or very high throughput; Redis when simplicity and latency dominate.

```typescript
await redis.publish(`events:${tenantId}`, JSON.stringify(payload));
```

**Trade-offs:** Bridging layers add operational depth; monitor lag and consumer health as part of subscription SLOs.

---

## Q77. How do you handle subscription reconnection and state recovery?

**Answer:**

Clients should resume with a **cursor** or **last event id** after reconnect; the server sends a **snapshot** (current state) plus live updates if the gap is too large. Implement exponential backoff in the `graphql-ws` client. Make event handling **idempotent** on the client (dedupe by event id). For collaborative editing, CRDT/OT layers reconcile after gaps. Product teams decide between **poll for recovery** vs **gap healing** from a history store—subscriptions alone are not a durable log.

**Trade-offs:** Snapshot endpoints add read load; balance with caching and short retention event logs for hot documents.

---

## Q78. What is live queries and how do they differ from subscriptions?

**Answer:**

**Live queries** re-execute (or incrementally refresh) a **query** when underlying data changes, pushing an updated **full query result**—mental model: “pull that updates like push.” **Subscriptions** push **discrete events** (often smaller payloads) that the client merges. Implementations (experimental in various stacks) differ: some use invalidation graphs, others database triggers. Relay “live” features and tools like WunderGraph explore this space.

**Trade-offs:** Live queries can be expensive to scale (re-run or diff large selections); explicit event subscriptions are easier to reason about for very large graphs.

---

## Q79. How do you implement presence detection with GraphQL subscriptions?

**Answer:**

Expose a `presence(channelId)` subscription that receives join/leave and heartbeat events. Heartbeats can be lightweight mutations or subscription pings that update “last seen” in Redis with TTL. Broadcast presence deltas to other subscribers in the channel; for large rooms, sample or aggregate presence (e.g., show counts instead of every user). Optional CRDT layers help with concurrent presence state on the client.

**Trade-offs:** Presence generates high churn traffic—rate-limit updates and collapse frequent toggles server-side.

---

## Q80. How do you test subscriptions in production environments?

**Answer:**

Run **synthetic probes** from canary regions that open authenticated WebSocket connections, subscribe to test topics, publish events, and assert latency and error rates. Use **feature flags** to shadow traffic or test new subscription handlers. Perform **chaos** disconnects to validate reconnection behavior. Alert on subscription error rates per operation and on connection count anomalies. Prefer a dedicated **test tenant** or synthetic accounts to avoid polluting real user metrics.

**Trade-offs:** Production tests can create noise; isolate accounts and label telemetry clearly; mirror critical paths in staging with production-like load.

---

## Q81. How do you evaluate and choose a GraphQL framework for your organization?

**Answer:**

Score candidates on: **Federation** subgraph compatibility, **performance** under your expected RPS and resolver depth, **plugin** ecosystem (Envelop, Apollo plugins), **observability** (OpenTelemetry first-class), **license** and long-term maintenance, hiring pool, and **interop** with your language stack. Node: Apollo Server, GraphQL Yoga, Mercurius; JVM: Netflix DGS, Spring GraphQL; Go: gqlgen; .NET: Hot Chocolate. Run **POCs** with the same schemas, tracing, and load tests; measure p99 latency and memory for representative operations including N+1 scenarios.

**Trade-offs:** “Best” framework is contextual—enterprise often picks DGS or Apollo for docs and support; startups may favor Yoga or Mercurius for speed and bundle size.

---

## Q82. What is GraphQL Mesh and when would you use it?

**Answer:**

**GraphQL Mesh** composes REST, gRPC, SOAP, and other sources into one GraphQL schema via **YAML** configuration and **handlers**—ideal for **strangler** migrations and rapid unification without rewriting backends. You get a unified developer experience while legacy services remain authoritative. At scale, Mesh adds latency and operational surface area; many teams migrate hot paths to **native subgraphs** or direct resolvers once domains stabilize.

```yaml
sources:
  - name: LegacyREST
    handler:
      openapi:
        source: ./openapi.json
```

**Trade-offs:** Great for speed of integration; plan an exit strategy for performance-critical domains.

---

## Q83. How do you implement custom code generation for GraphQL?

**Answer:**

Use **GraphQL Code Generator** with custom plugins or **custom codegen** scripts that walk the schema AST: emit TypeScript types, MSW handlers, mock factories, or internal SDKs. In CI, parse schema + operations, write outputs to versioned packages, and fail on drift. For proprietary patterns (e.g., federation entity stubs), write a plugin that visits `ObjectTypeDefinition` nodes with `@key`.

```yaml
generates:
  src/generated/types.ts:
    plugins:
      - typescript
      - typescript-operations
```

**Trade-offs:** CI time grows—cache codegen outputs keyed by schema hash; split packages so apps only rebuild when their operations change.

---

## Q84. What is the role of GraphQL in a Design System's component library?

**Answer:**

Pure **presentational** components should not import GraphQL directly; **container** components or page-level modules execute operations. GraphQL still adds value through **generated types** for Storybook fixtures, MSW mocks, and prop contracts. Relay-style **colocated fragments** next to UI modules work well when the design system and data layer evolve together—otherwise keep the UI kit transport-agnostic for portability.

**Trade-offs:** Coupling the component library to GraphQL types improves safety but reduces reuse in non-GraphQL apps—draw a hard line between “dumb” and “smart” components.

---

## Q85. How do you implement end-to-end type safety from database to frontend?

**Answer:**

Use a single **source of truth** chain: Prisma or SQL schema → generated DB types → **Pothos** or **Nexus** code-first GraphQL schema → GraphQL Code Generator → typed React hooks (or Relay). Enforce **CI checks** so schema changes cannot merge without updated clients in the monorepo. For TypeScript-only internal APIs, **tRPC** is an alternative when you do not need GraphQL’s multi-client flexibility.

```typescript
// Pothos + Prisma example sketch
builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
  }),
});
```

**Trade-offs:** Tooling is heavy upfront; payoff is fewer production type mismatches and faster refactors across the stack.

---

## Q86. What is Pothos (formerly GiraphQL) and the code-first approach at scale?

**Answer:**

**Pothos** is a TypeScript **code-first** schema builder with strong inference and plugins (Prisma, Relay, errors, tracing). Teams split schemas into modules and test resolver logic without merging giant SDL files. Contrast with **schema-first**, where `.graphqls` is the source of truth and resolvers are hand-wired. Export SDL via `printSchema` for non-TypeScript consumers and registry upload.

```typescript
const builder = new SchemaBuilder({ plugins: [PrismaPlugin] });
builder.queryType({
  fields: (t) => ({
    me: t.prismaField({ type: "User", resolve: /* ... */ }),
  }),
});
```

**Trade-offs:** Code review happens in TypeScript—not SDL—so invest in readable builder patterns and occasional SDL snapshots in PRs for stakeholders.

---

## Q87. How do you implement GraphQL with edge computing (Cloudflare Workers, Lambda@Edge)?

**Answer:**

Deploy a **thin BFF or cache layer** at the edge for JWT validation, APQ lookup, and response caching; forward to origin subgraphs for heavy work. Use the **Fetch API** and avoid Node-only APIs unsupported in Workers. Persisted queries and GET caching shine at the edge; **subscriptions** and long-lived WebSockets generally do not run on Workers—you terminate those at origin or a dedicated realtime tier.

```typescript
export default {
  async fetch(request: Request) {
    if (request.method === "GET") {
      // APQ cache lookup (KV or cache API)
    }
    return fetch(originGraphQL, request);
  },
};
```

**Trade-offs:** CPU and wall-clock limits on edge—keep logic minimal; origin remains source of truth for authoritative data.

---

## Q88. What are the trade-offs between GraphQL, gRPC, and REST for different use cases?

**Answer:**

**GraphQL** fits **product APIs** with diverse clients and flexible selection sets; cost analysis and caching are harder than REST. **gRPC** excels at **service-to-service** RPC with streaming, binary efficiency, and strong codegen—poor fit for browsers without grpc-web and proxies. **REST** maximizes **HTTP caching**, CDN friendliness, and tooling simplicity; versioning and over-fetching hurt large mobile apps. **Hybrid** architectures are common: Federation over gRPC-backed subgraphs, REST for static assets and webhooks.

**Trade-offs:** Pick per boundary—public BFF GraphQL, internal gRPC, partner REST with strict OpenAPI contracts.

---

## Q89. How do you migrate a large REST API to GraphQL?

**Answer:**

Apply the **strangler fig**: introduce a GraphQL layer that delegates to existing REST endpoints via resolvers (Mesh or hand-written HTTP clients). Migrate **read** paths first (lower risk), then **writes** with idempotency keys. Run REST and GraphQL in parallel behind feature flags; measure per-resolver latency and error budgets. Train teams on DataLoader, N+1, and security (batching, aliases). Gradually move business logic from controllers into domain services consumed by both transports.

**Trade-offs:** Temporary duplication of validation logic until domain services absorb rules—track and pay down debt explicitly.

---

## Q90. What is the strangler fig pattern for GraphQL migration?

**Answer:**

Incrementally route traffic through a new **GraphQL facade** while the legacy system remains behind it. Expand coverage field by field or domain by domain until legacy endpoints can be retired. Governance prevents two divergent sources of truth: one **domain model** should back both until cutover.

**Trade-offs:** Long transitions require versioning discipline and consumer communication; without it, teams ship inconsistent behavior across REST and GraphQL.

---

## Q91. How do you establish GraphQL governance and standards in a large engineering org?

**Answer:**

Publish an **RFC template** for schema changes, a **style guide** (pagination, errors, naming, nullable conventions), mandatory **registry** checks, `graphql-eslint` in CI, and review SLAs. Run **office hours** for Federation design questions. Delegate review to **domain experts** per subgraph to avoid central bottlenecks while keeping global rules (auth, pagination) consistent.

**Trade-offs:** Process without automation frustrates teams—invest in bots that comment on PRs with composition and breaking-change results.

---

## Q92. How do you train teams on GraphQL adoption?

**Answer:**

Run hands-on workshops on execution model, resolvers, N+1, security (aliases, batching), and Federation basics. Provide a **sandbox** graph, golden-path examples, and pairing sessions with the platform team. Document router setup, CI pipelines, and how to register operations. Measure adoption via subgraph count, time-to-first successful deploy, and reduced repeated questions in support channels.

**Trade-offs:** One-off training decays—maintain internal docs and recorded sessions; tie training to template repos that encode best practices.

---

## Q93. What metrics should you track for GraphQL API health?

**Answer:**

Track **p50/p95/p99 latency** per named operation, **error rate** by extension code, **query depth** and **cost** distributions, **cache hit rate** (CDN and application), **subgraph fan-out** and per-subgraph latency in Federation, saturation of databases behind hot resolvers, schema **publish frequency**, and **breaking changes caught in CI** vs production. Alert on SLO burn rates rather than raw averages.

**Trade-offs:** High-cardinality per-resolver metrics explode cost—aggregate by operation name first; sample resolver spans in production.

---

## Q94. How do you implement observability (metrics, traces, logs) for GraphQL?

**Answer:**

Instrument the **router** and each **subgraph** with **OpenTelemetry**: spans for parse/validate/execute, attributes like `graphql.operation.name`, and propagated trace context over HTTP to subgraphs. Use structured logs with `trace_id` and redacted variables. Dashboards per SLO; Apollo Studio or Hive for operation insights if you use those stacks. Envelop’s OpenTelemetry plugin works well for Node servers.

```typescript
import { useOpenTelemetry } from "@envelop/opentelemetry";
```

**Trade-offs:** Full resolver tracing is expensive—sample aggressively (1–5%) and always capture errors.

---

## Q95. What is the future of GraphQL (composite schemas, @defer/@stream, trusted documents)?

**Answer:**

Expect **composite / federated schemas** to remain the enterprise standard for multi-team APIs. **`@defer` and `@stream`** will move toward broader interoperability as incremental delivery over HTTP matures—improving TTFB for large graphs. **Trusted documents** and **persisted queries** will become baseline for public APIs alongside router-native **cost analysis** and rate limiting. Follow the **GraphQL over HTTP** and **incremental delivery** specs and your vendor’s roadmap (Apollo Router, Hive, Cosmo).

**Trade-offs:** Adopt spec features when your clients and gateways both support them—feature-detect or negotiate capabilities.

---

## Q96. How do you handle GraphQL API deprecation lifecycle?

**Answer:**

Mark fields with `@deprecated(reason: "...")` (and `deprecationDate` where your tooling supports it). Communicate via **changelog**, email to registered API consumers, and Studio/Registry analytics showing usage decay. Remove only after traffic hits zero for an agreed window; for breaking renames, ship **dual fields** during migration. Mobile clients need longer sunsets than web—align deprecation windows with app store release cycles.

```graphql
type User {
  name: String @deprecated(reason: "Use displayName")
  displayName: String
}
```

**Trade-offs:** Long tails on old app versions delay removal—use min-version checks and server-side feature flags where possible.

---

## Q97. How do you implement A/B testing through GraphQL?

**Answer:**

Read experiment flags from context (LaunchDarkly, Split, Statsig) in the router coprocessor or in resolvers; branch to **variant implementations** or downstream services. Log **exposures** with operation name and variant for analysis. Prefer **stable schema shapes** and internal branching over proliferating experimental fields—reduces client complexity and cache fragmentation.

```typescript
if (ctx.experiments.check("newRanking")) {
  return rankingServiceV2();
}
return rankingServiceV1();
```

**Trade-offs:** Schema proliferation per experiment hurts governance—keep the public contract stable and hide variants behind resolvers.

---

## Q98. How do you design GraphQL for offline-first mobile applications?

**Answer:**

Use **normalized caches** (Apollo/Relay), **optimistic updates** on mutations, **persisted cache** to disk, and **queued mutations** with **idempotency keys** when offline. Resolve conflicts with server **version** or **updatedAt** fields; subscriptions or polling for re-sync after connectivity returns. Avoid huge initial queries that block first paint; split into critical and deferred fragments where supported.

**Trade-offs:** Offline merge logic is inherently complex; GraphQL’s typed fields and stable IDs (`__typename` + `id`) make client normalization tractable.

---

## Q99. How do you handle GraphQL schema in a monorepo vs polyrepo setup?

**Answer:**

**Monorepos** benefit from a shared SDL package, atomic PRs across clients and servers, and unified codegen—use Nx/Bazel when the repo grows. **Polyrepos** rely on a **schema registry** as truth, independent subgraph releases, and semver for shared `@org/graphql-types` packages. Federation aligns well with **autonomous teams** in polyrepo; enforce compatibility via CI checks and consumer operation validation.

**Trade-offs:** Monorepos need build tooling at scale; polyrepos need strict semver discipline and automated breaking-change detection.

---

## Q100. What are your recommendations for building a world-class GraphQL API platform?

**Answer:**

Invest in **governance**: schema registry, linting, composition checks, and consumer **operation** validation. Run a **high-performance router** (e.g., Apollo Router) with mTLS to subgraphs, rate limits, OTel, and APQ/persisted queries. Provide **golden-path templates** for subgraphs (auth context, logging, DataLoader, tests) so teams do not reinvent security or observability. Measure latency, errors, and consumer satisfaction continuously; iterate on **cost limits** and caching as load grows. Treat the **schema as a product**: clear documentation, predictable deprecation, and incident playbooks for gateway and subgraph failures. Offer a **developer portal** (keys, docs, changelog, SLAs) and on-call ownership for the platform team.

```text
World-class platform checklist:
- Schema registry + CI composition + consumer checks
- Router with mTLS, rate limits, OTel, APQ
- Subgraph templates (auth, logging, DataLoader, tests)
- Incident playbooks for gateway and subgraph failures
- Developer portal: keys, docs, changelog, SLAs
```

---

*End of document — 100 senior-level GraphQL questions.*
