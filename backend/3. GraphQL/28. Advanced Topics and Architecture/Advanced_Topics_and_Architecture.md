# Advanced Topics and Architecture

## 📑 Table of Contents

- [28.1 Schema Stitching](#281-schema-stitching)
  - [28.1.1 Schema Stitching Basics](#2811-schema-stitching-basics)
  - [28.1.2 Merging Schemas](#2812-merging-schemas)
  - [28.1.3 Type Extension](#2813-type-extension)
  - [28.1.4 Remote Schema Integration](#2814-remote-schema-integration)
  - [28.1.5 Schema Conflicts Resolution](#2815-schema-conflicts-resolution)
- [28.2 Apollo Federation](#282-apollo-federation)
  - [28.2.1 Federation Concepts](#2821-federation-concepts)
  - [28.2.2 Subgraph Definition](#2822-subgraph-definition)
  - [28.2.3 Apollo Gateway](#2823-apollo-gateway)
  - [28.2.4 Entity Resolution](#2824-entity-resolution)
  - [28.2.5 Cross-Service References](#2825-cross-service-references)
- [28.3 Microservices Architecture](#283-microservices-architecture)
  - [28.3.1 GraphQL Microservices](#2831-graphql-microservices)
  - [28.3.2 Service-to-Service Communication](#2832-service-to-service-communication)
  - [28.3.3 API Gateway Pattern](#2833-api-gateway-pattern)
  - [28.3.4 Service Discovery](#2834-service-discovery)
  - [28.3.5 Load Balancing](#2835-load-balancing)
- [28.4 API Composition](#284-api-composition)
  - [28.4.1 Schema Composition](#2841-schema-composition)
  - [28.4.2 Data Federation](#2842-data-federation)
  - [28.4.3 Service Integration](#2843-service-integration)
  - [28.4.4 Version Management](#2844-version-management)
  - [28.4.5 Backwards Compatibility](#2845-backwards-compatibility)
- [28.5 Performance Architecture](#285-performance-architecture)
  - [28.5.1 Query Optimization Architecture](#2851-query-optimization-architecture)
  - [28.5.2 Caching Architecture](#2852-caching-architecture)
  - [28.5.3 Database Optimization](#2853-database-optimization)
  - [28.5.4 Async Processing](#2854-async-processing)
  - [28.5.5 Load Distribution](#2855-load-distribution)
- [28.6 Monitoring and Observability](#286-monitoring-and-observability)
  - [28.6.1 Performance Monitoring](#2861-performance-monitoring)
  - [28.6.2 Query Analytics](#2862-query-analytics)
  - [28.6.3 Error Tracking](#2863-error-tracking)
  - [28.6.4 Distributed Tracing](#2864-distributed-tracing)
  - [28.6.5 Metrics Collection](#2865-metrics-collection)
- [28.7 Deployment Strategies](#287-deployment-strategies)
  - [28.7.1 Development Deployment](#2871-development-deployment)
  - [28.7.2 Staging Deployment](#2872-staging-deployment)
  - [28.7.3 Production Deployment](#2873-production-deployment)
  - [28.7.4 Blue-Green Deployment](#2874-blue-green-deployment)
  - [28.7.5 Canary Releases](#2875-canary-releases)
- [28.8 GraphQL Best Practices](#288-graphql-best-practices)
  - [28.8.1 Schema Design Patterns](#2881-schema-design-patterns)
  - [28.8.2 Naming Conventions](#2882-naming-conventions)
  - [28.8.3 API Documentation](#2883-api-documentation)
  - [28.8.4 Versioning Strategy](#2884-versioning-strategy)
  - [28.8.5 Evolution Patterns](#2885-evolution-patterns)

---

## 28.1 Schema Stitching

### 28.1.1 Schema Stitching Basics

#### Beginner

**Schema stitching** combines multiple GraphQL schemas into one **gateway schema** so clients call a **single endpoint**. Each underlying API may be a separate service or legacy monolith slice.

#### Intermediate

Classic stitching used **`@graphql-tools/stitch`** with **remote executors** and **type merging**. It predates **Apollo Federation** for some use cases but remains useful for **wrapping** existing graphs without federation primitives.

#### Expert

Stitching composes **executable schemas** vs federation’s **supergraph SDL**. Trade-offs: stitching can be **faster to adopt** for **third-party** graphs; federation gives **stronger ownership** boundaries and **entity keys** for distributed graphs at scale.

```javascript
import { stitchSchemas } from "@graphql-tools/stitch";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";

const usersExec = buildHTTPExecutor({ endpoint: "https://users.internal/graphql" });
const ordersExec = buildHTTPExecutor({ endpoint: "https://orders.internal/graphql" });

export const gatewaySchema = stitchSchemas({
  subschemas: [
    { schema: await fetchRemoteSchema(usersExec), executor: usersExec },
    { schema: await fetchRemoteSchema(ordersExec), executor: ordersExec },
  ],
});
```

```graphql
# Client sees a unified graph (conceptual)
type Query {
  me: User
  order(id: ID!): Order
}
```

#### Key Points

- Stitching merges multiple graphs at the gateway.
- Remote executors forward sub-queries.
- Different from monolithic single schema ownership.

#### Best Practices

- Document which team owns which root fields.
- Add timeouts and retries at the executor layer.
- Start with read-only stitching before cross-mutations.

#### Common Mistakes

- Hiding N+1 fan-out to subgraphs without batching.
- Circular delegation causing infinite loops.
- No auth propagation to subgraphs.

---

### 28.1.2 Merging Schemas

#### Beginner

**Merging** combines type definitions and resolver maps. **Conflicting names** must be renamed or namespaced.

#### Intermediate

**`mergeSchemas`** from GraphQL Tools can add **links** between types via **stitching resolvers** that call other executors.

#### Expert

**Pick** which side **wins** on field collisions. Use **`transformSchema`** to prefix types (`Orders_Order`) when integrating vendor APIs.

```javascript
import { mergeSchemas } from "@graphql-tools/merge";

export const merged = mergeSchemas({
  schemas: [usersSchema, billingSchema],
});
```

#### Key Points

- Pure merge works for non-overlapping types.
- Overlaps need explicit resolution strategies.
- Transforms are safer than ad-hoc string edits.

#### Best Practices

- Automate merge in CI with schema diff checks.
- Keep a registry of merged services.
- Test representative client operations end-to-end.

#### Common Mistakes

- Merging two `Query` types without a plan for fields.
- Losing description/metadata on merge.
- Assuming merge order is commutative for conflicts.

---

### 28.1.3 Type Extension

#### Beginner

**`extend type`** in SDL adds fields to a type defined elsewhere—useful when one service **extends** a user type with **profile** fields owned by another component.

#### Intermediate

In stitching, **type extensions** are resolved via **delegation** to the owning service or **local resolvers** that join data.

#### Expert

Align extensions with **authoritative data sources**—avoid two services mutating the same field without coordination. **GraphQL federation** uses **`extend type`** with **`@key`** instead for entities.

```graphql
extend type User {
  loyaltyTier: String
}
```

```javascript
export const resolvers = {
  User: {
    loyaltyTier: {
      selectionSet: "{ id }",
      resolve(user, _args, context, info) {
        return context.loyaltyApi.getTier(user.id);
      },
    },
  },
};
```

#### Key Points

- Extensions model cross-cutting concerns across services.
- `selectionSet` ensures required parent fields load first.
- Ownership and caching must be explicit.

#### Best Practices

- Prefer extension fields that are read-mostly.
- Batch cross-service fetches in DataLoader-like layers.
- Document SLOs for extended fields separately.

#### Common Mistakes

- Extension resolvers that refetch the entire parent object.
- Breaking changes when base type fields rename.
- Authz mismatch between base and extended fields.

---

### 28.1.4 Remote Schema Integration

#### Beginner

**Remote schemas** are introspected or provided as SDL, then executed via **HTTP** (or other transports) from the gateway.

#### Intermediate

**Schema polling** picks up partner updates; **version pins** prevent surprise breaking changes. **Introspection** may be disabled in prod—use **schema registry** artifacts instead.

#### Expert

**Signing** outbound requests (HMAC) and **mTLS** secure service meshes. **Partial schemas** with **federation-compatible** adapters ease migration paths.

```javascript
import { schemaFromExecutor } from "@graphql-tools/wrap";

export async function loadRemoteSchema(executor) {
  return schemaFromExecutor(executor, {
    handleFieldErrors: "ignore",
  });
}
```

#### Key Points

- Remote integration couples uptime of all subgraphs.
- Introspection vs checked-in SDL is a policy choice.
- Error handling must normalize partial failures.

#### Best Practices

- Cache SDL with TTL and manual invalidation hooks.
- Circuit-break repeated failing subgraphs.
- Propagate trace headers through executors.

#### Common Mistakes

- No timeouts on remote calls blocking the gateway.
- Trusting introspection from the public internet blindly.
- Logging full GraphQL errors with secrets.

---

### 28.1.5 Schema Conflicts Resolution

#### Beginner

Conflicts arise when **two schemas** define the same **type/field** differently.

#### Intermediate

Strategies: **rename**, **namespace**, **transform**, or **choose canonical** implementation and **delegate** the other.

#### Expert

**Semantic conflicts** (same field name, different meaning) are the worst—prefer **explicit prefixes** and **deprecation cycles**. **Contract tests** between teams catch drift.

```javascript
import { RenameTypes } from "@graphql-tools/wrap";

const wrapped = wrapSchema({
  schema: vendorSchema,
  transforms: [new RenameTypes((name) => `Vendor_${name}`)],
});
```

#### Key Points

- Not all conflicts are syntactic; semantics matter.
- Automated diffing in CI is essential.
- Prefixing is blunt but effective.

#### Best Practices

- Publish a compatibility matrix per integration.
- Use RFC process for shared types.
- Deprecate before removing merged fields.

#### Common Mistakes

- Silent coercion between incompatible scalar formats.
- Hiding conflicts behind gateway-only hacks.
- Clients depending on ambiguous merged behavior.

---

## 28.2 Apollo Federation

### 28.2.1 Federation Concepts

#### Beginner

**Federation** splits one **supergraph** across **subgraphs** each owned by a team. **Apollo Router/Gateway** plans a query and calls subgraphs as needed.

#### Intermediate

**Entities** are types with **`@key`** fields. **`@requires`**, **`@provides`**, and **`@external`** control field dependencies across subgraphs.

#### Expert

**Composition rules** validate the supergraph in CI. **@inaccessible** hides fields from public schema while retaining federation internals. **@tag**/`@override` support advanced rollout patterns (router version dependent).

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable"])
```

#### Key Points

- Federation is contract-driven distributed GraphQL.
- Entities are the join points between services.
- Composition errors block broken supergraphs from deploying.

#### Best Practices

- Run `rover subgraph check` in CI.
- Keep subgraphs independently deployable.
- Document entity keys as part of API reviews.

#### Common Mistakes

- Using federation without a registry discipline.
- Over-sharing entities leading to chatty plans.
- Ignoring composition errors in staging.

---

### 28.2.2 Subgraph Definition

#### Beginner

Each subgraph exposes normal GraphQL SDL plus **federation directives**. Tools like **`@apollo/subgraph`** assist in Node.

#### Intermediate

**Bootstrapping** uses `buildSubgraphSchema` with typeDefs and resolvers. **Entity resolvers** implement `__resolveReference`.

#### Expert

**Version federation spec** explicitly in `extend schema @link`. **Lint** subgraph SDL with **GraphQL ESLint** federation rules.

```javascript
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
    name: String!
  }
`;

const resolvers = {
  User: {
    __resolveReference(ref) {
      return { id: ref.id, name: "Ada" };
    },
  },
};

export const schema = buildSubgraphSchema({ typeDefs, resolvers });
```

#### Key Points

- Subgraphs are independently versioned services.
- `__resolveReference` hydrates entities by key.
- SDL must compose cleanly with others.

#### Best Practices

- Co-locate entity definitions with owning team.
- Snapshot subgraph SDL in CI artifacts.
- Use codegen for resolver typing.

#### Common Mistakes

- Missing `__resolveReference` for `@key` types.
- Key fields not actually fetchable from the subgraph DB.
- Mixing v1 and v2 directive sets incorrectly.

---

### 28.2.3 Apollo Gateway

#### Beginner

The **Gateway** (or **Apollo Router** in Rust) is the public-facing endpoint composing subgraphs.

#### Intermediate

**Managed federation** uses **Apollo Uplink** to fetch supergraph configs. **Polling** intervals and **secrets** must be secured.

#### Expert

**Router** offers **coprocessors**, **rhai scripting**, and **high-performance** query planning. **Subgraph traffic shaping** and **TLS** termination live at the edge.

```javascript
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "users", url: "http://localhost:4001/graphql" },
      { name: "orders", url: "http://localhost:4002/graphql" },
    ],
  }),
});

const server = new ApolloServer({ gateway, subscriptions: false });
await startStandaloneServer(server, { listen: { port: 4000 } });
```

#### Key Points

- Gateway owns query planning and execution fan-out.
- Router is the recommended production path long-term.
- Introspect-and-compose is dev-friendly; prod uses composed artifacts.

#### Best Practices

- Pin subgraph URLs via service discovery.
- Enforce authn/z at the router when possible.
- Load-test planner with worst-case operations.

#### Common Mistakes

- Running introspection compose against prod subgraphs without auth.
- No rate limits at the edge.
- Oversized supergraph configs without canarying.

---

### 28.2.4 Entity Resolution

#### Beginner

When a query needs fields from multiple subgraphs for the same entity, the **router** fetches **key fields** first, then **hydrates** via `__resolveReference`.

#### Intermediate

**Query plans** show sequential vs parallel fetches. **Dataloader inside subgraphs** still matters for internal DB efficiency.

#### Expert

**@requires** fields must be available from prior plan steps—misconfiguration fails composition or runtime. **Batch entity resolution** (`representations: [...]`) reduces round trips.

```graphql
type Review @key(fields: "id") {
  id: ID!
  product: Product @requires(fields: "productId")
  productId: ID! @external
}
```

#### Key Points

- Entity resolution is the federation join mechanism.
- `@external` marks fields owned elsewhere.
- Plans must be inspected for latency cliffs.

#### Best Practices

- Keep entity keys stable and minimal.
- Monitor entity fetch batch sizes.
- Test multi-subgraph operations in integration tests.

#### Common Mistakes

- Using wide keys (many fields) increasing chatter.
- `@requires` chains creating deep sequential plans.
- Forgetting `@external` on referenced foreign fields.

---

### 28.2.5 Cross-Service References

#### Beginner

Fields in one subgraph **reference** entities in another via **keys**—clients see a **single graph**.

#### Intermediate

**@provides** allows a subgraph to satisfy fields when it already has data, skipping another hop.

#### Expert

**@override** (federation 2) migrates field ownership with **fromSubgraph** labels—coordinate **blue/green** subgraph deploys with router awareness.

```graphql
type Order @key(fields: "id") {
  id: ID!
  buyer: User
}

type User @key(fields: "id", resolvable: false) {
  id: ID!
}
```

#### Key Points

- `resolvable: false` marks reference-only stubs.
- Cross-service references imply operational coupling.
- Override workflows need careful sequencing.

#### Best Practices

- Integration tests for each referenced entity path.
- Document which subgraph owns writes for nested fields.
- Use schema checks before deploy.

#### Common Mistakes

- Writable fields on non-owning subgraphs.
- Breaking key types during refactors.
- Assuming @provides always skips work (planner-dependent).

---

## 28.3 Microservices Architecture

### 28.3.1 GraphQL Microservices

#### Beginner

Each **microservice** may expose its own GraphQL API or REST; a **gateway** composes a unified graph for clients.

#### Intermediate

**Domain boundaries** (DDD bounded contexts) map to subgraphs. **Avoid chatty** synchronous chains by **BFF** or **event-driven** updates.

#### Expert

**Cell-based architectures** isolate failures—pair with **bulkheads** for subgraph connection pools. **GraphQL** at the edge does not remove **distributed system** realities (partial failures, retries).

```javascript
// Subgraph health middleware sketch
export function subgraphHealth(app) {
  app.get("/healthz", (_req, res) => res.json({ ok: true }));
}
```

```graphql
type Query {
  ping: String!
}
```

#### Key Points

- GraphQL is an interface; microservices are an organizational/runtime split.
- Clear ownership reduces merge conflicts.
- Partial outages need graceful degradation UX.

#### Best Practices

- Align subgraph boundaries with team topology.
- Feature flags for risky resolver changes.
- Chaos test subgraph failures at gateway.

#### Common Mistakes

- Distributed monolith with hidden shared databases.
- Too many subgraphs for small teams.
- No SLOs per subgraph.

---

### 28.3.2 Service-to-Service Communication

#### Beginner

Services call each other via **HTTP/gRPC** or **message brokers**. GraphQL gateway calls subgraphs over HTTP typically.

#### Intermediate

**Internal GraphQL** calls may skip HTTP and use **schema delegation** in-process for monorepo modularization.

#### Expert

**mTLS + SPIFFE** identities, **retry budgets**, and **hedging** protect tail latencies. **Idempotency keys** on internal mutations prevent duplicate side effects.

```javascript
import fetch from "node-fetch";

export async function callOrdersGql(query, variables, headers) {
  const res = await fetch(process.env.ORDERS_URL, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(5000),
  });
  return res.json();
}
```

#### Key Points

- Propagate correlation IDs and auth context intentionally.
- Timeouts are mandatory on every hop.
- Prefer async messaging for non-critical paths.

#### Best Practices

- Standardize internal error envelopes.
- Limit synchronous fan-out depth.
- Contract tests between producers/consumers.

#### Common Mistakes

- Infinite retries on 400-level errors.
- Missing auth between services in private networks.
- Chatty synchronous graphs for high QPS reads.

---

### 28.3.3 API Gateway Pattern

#### Beginner

The **gateway** is the single entry: **auth**, **rate limits**, **routing** to subgraphs or REST.

#### Intermediate

**GraphQL-aware gateways** enforce **depth/complexity**, **persisted queries**, and **field-level auth**.

#### Expert

**Kong/Envoy** plugins plus **Apollo Router** compose a layered edge. **WAF** rules differ for GraphQL POST bodies—tune **max body size**.

```javascript
import depthLimit from "graphql-depth-limit";
import { createComplexityLimitRule } from "graphql-validation-complexity";

export const gatewayValidationRules = [
  depthLimit(10),
  createComplexityLimitRule(1500),
];
```

#### Key Points

- Gateway centralizes cross-cutting policies.
- GraphQL needs specialized protections vs REST.
- Keep business logic out of the gateway when possible.

#### Best Practices

- JWT validation at edge; fine-grained auth in subgraphs.
- Structured logs with `operationName`.
- Canary configs at gateway first.

#### Common Mistakes

- Turning gateway into a god service with hidden business rules.
- No payload size limits.
- Logging full variables with PII.

---

### 28.3.4 Service Discovery

#### Beginner

**Service discovery** resolves **`orders.internal:4002`** dynamically via **DNS**, **Consul**, **Kubernetes Services**, etc.

#### Intermediate

Gateway polls **supergraph** updates when subgraph instances move. **Health checks** remove bad pods from load balancer pools.

#### Expert

**Client-side LB** with **xDS** (Envoy) vs **server-side** kube-proxy trade-offs. **Global traffic management** routes users to nearest cells.

```yaml
# Kubernetes Service (illustrative)
apiVersion: v1
kind: Service
metadata:
  name: users-subgraph
spec:
  selector:
    app: users-subgraph
  ports:
    - port: 80
      targetPort: 4001
```

#### Key Points

- Discovery decouples deploys from hard-coded IPs.
- Health/readiness must be subgraph-specific.
- Stale DNS caches cause flapping.

#### Best Practices

- Use readiness probes hitting `/graphql` or `/healthz`.
- Short TTLs for internal DNS where safe.
- Automate rover subgraph publish on deploy.

#### Common Mistakes

- Liveness probes that only check TCP, not app health.
- Gateway caching dead subgraph URLs.
- No regional failover strategy.

---

### 28.3.5 Load Balancing

#### Beginner

**Load balancers** spread traffic across subgraph replicas for **throughput** and **availability**.

#### Intermediate

**Least-request** algorithms help with uneven resolver costs. **Sticky sessions** rarely needed for stateless GraphQL servers—avoid unless using legacy WS setups poorly.

#### Expert

**Global load balancing** with **Anycast** and **latency-based routing**. **Retry** only on idempotent operations at the LB layer—GraphQL POST is not automatically idempotent.

```javascript
// App-level client-side round robin for dev only — production uses LB/Envoy
const endpoints = ["http://10.0.1.1:4001", "http://10.0.1.2:4001"];
let i = 0;
export function nextUsersUrl() {
  const url = endpoints[i % endpoints.length];
  i += 1;
  return url;
}
```

#### Key Points

- Stateless subgraphs simplify LB choices.
- Retry policies must understand GraphQL error semantics.
- WS subscriptions need connection-aware LB.

#### Best Practices

- Autoscale on CPU and p95 latency, not just RPS.
- Configure max connections per instance based on DB pools.
- Test thundering herd on cold start.

#### Common Mistakes

- Retrying mutations blindly at LB.
- Oversized instances without horizontal scale.
- Ignoring subgraph DB connection limits when scaling out.

---

## 28.4 API Composition

### 28.4.1 Schema Composition

#### Beginner

**Composition** builds one **supergraph SDL** from subgraphs (federation) or merges stitched schemas.

#### Intermediate

**Rover** (`rover supergraph compose`) validates **composition** locally in CI. **Breaking changes** fail checks against **historical operations**.

#### Expert

**Lint rules** enforce **naming**, **descriptions**, and **deprecation** policies before compose. **Multiple environments** (dev/stage/prod) have distinct supergraph variants.

```bash
rover supergraph compose --config ./supergraph.yaml
```

```yaml
# supergraph.yaml (illustrative)
federation_version: 2
subgraphs:
  users:
    routing_url: http://users:4001/graphql
    schema:
      file: ./users.graphql
  orders:
    routing_url: http://orders:4002/graphql
    schema:
      file: ./orders.graphql
```

#### Key Points

- Composition is a build-time safety gate.
- Config-as-code tracks routing URLs.
- CI should block broken graphs.

#### Best Practices

- Store supergraph configs in git.
- Pin federation versions across toolchain.
- Automate publish to registry on main branch.

#### Common Mistakes

- Composing with local introspection that differs from prod SDL.
- Manual YAML edits without validation.
- Skipping consumer operation checks.

---

### 28.4.2 Data Federation

#### Beginner

**Data federation** (Apollo sense) means joining **data** across services via **entities**, not duplicating databases.

#### Intermediate

**BFF pattern** vs **true federation**: BFF composes in code; federation composes declaratively with planning.

#### Expert

**Analytics federation** can join **warehouse** APIs with **OLTP** subgraphs—watch **latency** and **auth** boundaries.

```graphql
query {
  me {
    id
    orders {
      id
      total
    }
  }
}
```

#### Key Points

- Federation plans queries across services automatically.
- Still need anti-corruption layers at subgraph edges.
- Not a substitute for good domain modeling.

#### Best Practices

- Model entities around real business keys.
- Avoid database sharing between subgraphs.
- Cache at router/subgraph strategically.

#### Common Mistakes

- Exposing internal implementation types directly.
- Joining on non-stable keys (emails that can change).
- Ignoring partial failure modes in UIs.

---

### 28.4.3 Service Integration

#### Beginner

Integrate services with **contracts** (SDL + protobuf), **CI checks**, and **staging** environments mirroring prod topology.

#### Intermediate

**Consumer-driven contract tests** (Pact-style) for non-GraphQL dependencies still apply alongside **operation checks** for GraphQL.

#### Expert

**Event catalogs** (AsyncAPI) pair with **GraphQL subscriptions** for operational visibility. **Idempotent webhooks** bridge REST partners into your graph via **adapters**.

```javascript
export async function adaptStripeCustomer(stripeId) {
  const customer = await stripe.customers.retrieve(stripeId);
  return { id: customer.id, email: customer.email };
}
```

#### Key Points

- Adapters isolate third-party quirks from your schema.
- Contracts reduce cross-team thrash.
- Events and queries coexist in mature systems.

#### Best Practices

- Version adapter mappings independently.
- Sandbox external APIs in tests.
- Monitor adapter error budgets.

#### Common Mistakes

- Leaking vendor IDs without abstraction.
- No timeouts on partner HTTP calls.
- Schema exposes raw partner payloads.

---

### 28.4.4 Version Management

#### Beginner

GraphQL favors **evolution** without v2 URLs—use **additive changes** and **deprecations**.

#### Intermediate

**@deprecated** with **reasons** and **sunset dates** in descriptions. **Field usage metrics** from Apollo Studio inform removal.

#### Expert

**Federation @inaccessible** hides internal fields. **Registry** tracks **schema versions** per subgraph with **launch workflows**.

```graphql
type User {
  id: ID!
  name: String!
  username: String! @deprecated(reason: "Use `name` by 2026-09-01")
}
```

#### Key Points

- Versionless HTTP does not mean versionless governance.
- Deprecations need telemetry.
- Subgraphs version independently in federation.

#### Best Practices

- Communicate deprecations in changelogs.
- Provide codemods for internal clients.
- Keep deprecated fields for agreed intervals.

#### Common Mistakes

- Breaking clients by renaming without `@deprecated` period.
- Hiding deprecations from documentation.
- Removing fields still used by mobile apps.

---

### 28.4.5 Backwards Compatibility

#### Beginner

**Compatible** changes: add optional fields, add types, add enum values (careful), widen nullability rarely.

#### Intermediate

**Nullability narrowing** and **required field additions** are breaking—use **new fields** or **new types** instead.

#### Expert

**Two-phase migrations**: deploy server accepting old+new → migrate clients → remove old. **Federation** requires coordinated **composition** checks so router never sees impossible states.

```graphql
# Safer pattern — add v2 field alongside old
type Profile {
  displayName: String @deprecated(reason: "Use fullName")
  fullName: String
}
```

#### Key Points

- Think in terms of client impact, not server convenience.
- Mobile clients lag web—extend timelines.
- Federation composition adds multi-repo coordination.

#### Best Practices

- Run operation checks against real client corpora.
- Maintain compatibility shims in adapters.
- Feature-flag risky schema rollouts.

#### Common Mistakes

- Enum removals without analytics.
- Changing scalar serialization formats.
- Tight coupling between web and mobile release trains.

---

## 28.5 Performance Architecture

### 28.5.1 Query Optimization Architecture

#### Beginner

Architecture-level optimizations: **batch resolvers**, **limit lists**, **avoid over-fetching** SQL columns, **cache** hot reads.

#### Intermediate

Place **DataLoader** in **per-request context**. Add **query cost** and **depth** limits at the edge.

#### Expert

**Automatic persisted queries** + **CDN** for anonymous traffic. **@defer/@stream** (where supported) shift bytes over time. **Subgraph-level** **field tracing** identifies stragglers in federation plans.

```javascript
export function createContext({ req }) {
  return {
    loaders: createLoaders(),
    user: decodeUser(req),
  };
}
```

```graphql
query Home {
  featuredProducts(first: 10) {
    id
    title
    price
  }
}
```

#### Key Points

- Optimization spans edge, gateway, subgraph, DB.
- Per-request loaders are foundational.
- Measure before layering caches.

#### Best Practices

- SLO per operation in federation.
- Load test with top 10 client queries.
- Review plans for sequential bottlenecks.

#### Common Mistakes

- Caching authenticated responses at CDN incorrectly.
- Global loaders (wrong scope).
- Depth limits without breadth/cost limits.

---

### 28.5.2 Caching Architecture

#### Beginner

Layers: **browser**, **CDN**, **gateway**, **application**, **database**. GraphQL POST complicates HTTP caching—**GET+APQ** helps public reads.

#### Intermediate

**Redis** for **response** or **entity** caches with **tag-based invalidation** on mutations.

#### Expert

**Partial results caching** is risky—normalize by **entity keys** where possible. **Federation** may cache **query plans** in Router. **Stale-while-revalidate** for low-risk data.

```javascript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function cachedResolver(key, ttl, fn) {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const value = await fn();
  await redis.set(key, JSON.stringify(value), "EX", ttl);
  return value;
}
```

#### Key Points

- Cache keys must include auth/tenant dimensions.
- Mutation invalidation must be explicit.
- Router vs subgraph caching responsibilities differ.

#### Best Practices

- Document what is cacheable per operation.
- Use TTL + passive invalidation hybrid.
- Monitor hit rate and memory usage.

#### Common Mistakes

- Keying only by operation name ignoring variables.
- Cross-user cache leaks.
- Stale cart/checkout data confusing users.

---

### 28.5.3 Database Optimization

#### Beginner

**Indexes**, **pagination**, **avoid N+1**, **connection pool tuning**—same as monolith, but multiplied by subgraphs.

#### Intermediate

**Read replicas** for heavy list queries; **CQRS** for analytics paths.

#### Expert

**Partition** hot tables; **pin** workloads to replicas with **routing middleware**. **Subgraph isolation** prevents one bad query starving others’ pools—**bulkheads**.

```javascript
const readPrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_READ_URL });
const writePrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_WRITE_URL });

export function prismaFor(operation) {
  return operation === "Query" ? readPrisma : writePrisma;
}
```

#### Key Points

- Replicas introduce replication lag visibility.
- Separate pools per subgraph if needed.
- Schema design supports performant resolvers.

#### Best Practices

- Continuous index advisor runs in staging.
- Cap per-request DB time budgets.
- Alert on pool wait time per service.

#### Common Mistakes

- Reading your writes immediately from replicas incorrectly.
- One shared DB for all subgraphs without governance.
- Missing FK indexes.

---

### 28.5.4 Async Processing

#### Beginner

Offload **emails**, **reports**, **image processing** to **queues**; GraphQL mutation **enqueues** and returns **job IDs**.

#### Intermediate

**Subscriptions** or **polling fields** communicate progress. **Outbox pattern** ensures **at-least-once** publishing.

#### Expert

**Temporal/Sagas** coordinate long-running workflows across services with compensations. GraphQL stays thin—**domain services** own state machines.

```javascript
import { Queue } from "bullmq";

const reports = new Queue("reports", { connection: { host: "redis" } });

export const resolvers = {
  Mutation: {
    async requestReport(_, { range }) {
      const job = await reports.add("monthly", { range });
      return { jobId: job.id };
    },
  },
};
```

#### Key Points

- Async boundaries reduce tail latency on mutations.
- Clients need UX for pending states.
- Idempotent workers handle retries.

#### Best Practices

- Standardize job payload schemas.
- Dead-letter queues and alerts.
- Encrypt sensitive job data at rest.

#### Common Mistakes

- Doing heavy CPU work inside resolvers.
- No visibility into failed jobs.
- Duplicate side effects without idempotency keys.

---

### 28.5.5 Load Distribution

#### Beginner

**Horizontal scale** of stateless GraphQL nodes behind LB. **Shard** data only when necessary.

#### Intermediate

**Geo routing** sends users to nearest region. **Subgraph scaling** independent of gateway.

#### Expert

**Adaptive concurrency** limits in-flight work per instance based on **event loop lag**. **Global rate limits** protect shared dependencies (payments, search).

```javascript
import PQueue from "p-queue";

const queue = new PQueue({ concurrency: 50 });

export function enqueueResolverWork(fn) {
  return queue.add(fn);
}
```

#### Key Points

- Protect shared resources with backpressure.
- Scale subgraphs with their hottest dependencies.
- Measure saturation, not just CPU.

#### Best Practices

- Autoscaling policies per service.
- Shed load gracefully (429) before total collapse.
- Chaos test regional failovers.

#### Common Mistakes

- Unbounded in-memory queues on Node.
- Scaling gateway without scaling DB.
- Ignoring cold start times on serverless.

---

## 28.6 Monitoring and Observability

### 28.6.1 Performance Monitoring

#### Beginner

Track **latency**, **throughput**, **error rate** for GraphQL endpoints and downstream subgraphs.

#### Intermediate

**SLOs** per operation (`viewer`, `checkout`). **Apdex** or **p95/p99** dashboards.

#### Expert

**Synthetic transactions** probe multi-step flows. **RUM** correlates client device performance with backend metrics.

```javascript
import { performance } from "node:perf_hooks";

export function graphqlTimingPlugin() {
  return {
    async requestDidStart() {
      const start = performance.now();
      return {
        async willSendResponse() {
          const ms = performance.now() - start;
          // push to metrics backend
          console.info("request_ms", ms);
        },
      };
    },
  };
}
```

#### Key Points

- OperationName labels power useful dashboards.
- Subgraph timings explain gateway latency.
- Synthetics catch regressions before users.

#### Best Practices

- Redact variables in logs/metrics.
- Alert on SLO burn rates.
- Review slow operations weekly.

#### Common Mistakes

- High-cardinality labels (per user ID).
- Monitoring only the gateway, not subgraphs.
- No baseline before optimization work.

---

### 28.6.2 Query Analytics

#### Beginner

Log **`operationName`**, **client name**, **duration**, **error codes** per request.

#### Intermediate

**Apollo Studio** or **Grafana Loki** aggregates field usage. **Persisted query hashes** map to known operations.

#### Expert

**Shadow traffic** compares new planner/router versions. **Anomaly detection** on rare expensive operations spikes (abuse or new client bugs).

```javascript
export function analyticsExtension({ operationName, durationMs, errors }) {
  return {
    operationName,
    durationMs,
    errorCount: errors?.length ?? 0,
  };
}
```

#### Key Points

- Analytics drives safe deprecations.
- Hashing queries protects PII in logs.
- Field-level stats need tracing or resolver wrappers.

#### Best Practices

- Tag releases in analytics pipelines.
- Segment mobile vs web clients.
- Sample high-volume traffic if needed.

#### Common Mistakes

- Logging full query strings with auth tokens in URLs.
- No way to correlate spikes to deploys.
- Ignoring anonymous operations entirely.

---

### 28.6.3 Error Tracking

#### Beginner

Capture **exceptions** and **GraphQL errors** with **Sentry** or similar—group by **fingerprint** rules.

#### Intermediate

Attach **tags**: `operationName`, `federation.subgraph`, `release`. **Scrub** PII in `beforeSend`.

#### Expert

**Partial success** (`errors` + `data`) needs UX and monitoring nuance—decide which paths are **acceptable degraded states**.

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: process.env.SENTRY_DSN });

export function captureGqlError(err, ctx) {
  Sentry.captureException(err, {
    tags: { operationName: ctx.operationName ?? "anonymous" },
  });
}
```

#### Key Points

- GraphQL errors are not always 500s.
- Tagging enables actionable triage.
- Client and server error tracking should link via IDs.

#### Best Practices

- Normalize error extensions to stable codes.
- Page on elevated `INTERNAL` rates only.
- Provide support playbooks per code.

#### Common Mistakes

- Treating all GraphQL errors as fatal.
- Missing context on which subgraph failed.
- Over-grouping unrelated errors in Sentry.

---

### 28.6.4 Distributed Tracing

#### Beginner

**Traces** follow a request across **gateway → subgraphs → DB**. Use **OpenTelemetry** with **W3C traceparent** propagation.

#### Intermediate

**Spans** around resolver execution, HTTP calls, DB queries. **Baggage** sparingly for tenant IDs (privacy caution).

#### Expert

**Tail-based sampling** in collectors retains interesting traces (errors, slow). **Federation** should inject **subgraph attributes** on child spans.

```javascript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

#### Key Points

- Propagate context headers end-to-end.
- Sampling balances cost vs fidelity.
- Spans should map to user-visible operations.

#### Best Practices

- Standardize span names (`graphql.resolve User.posts`).
- Include `graphql.operation.name` attribute.
- Test trace continuity through mesh/Istio.

#### Common Mistakes

- Broken context after `setImmediate` misuse.
- Too many micro-spans overwhelming backends.
- Logging trace IDs without correlating to metrics.

---

### 28.6.5 Metrics Collection

#### Beginner

**Prometheus** `/metrics` scrape **counters/histograms** for requests, errors, durations.

#### Intermediate

**RED** method (Rate, Errors, Duration) per operation. **USE** for resources (saturation).

#### Expert

**Adaptive sampling** and **histogram buckets** tuned for SLOs. **Cardinality guards** drop expensive labels.

```javascript
import client from "prom-client";

const gqlDuration = new client.Histogram({
  name: "graphql_operation_duration_seconds",
  help: "GraphQL operation duration",
  labelNames: ["operationName", "status"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

export function observeOperation(operationName, status, seconds) {
  gqlDuration.labels(operationName || "anonymous", status).observe(seconds);
}
```

#### Key Points

- Histograms power SLO math and heatmaps.
- Labels must stay bounded.
- Federation adds labels for subgraph contributions if possible.

#### Best Practices

- Export standard Node/runtime metrics too.
- Dashboards per environment.
- Alert on burn rate, not instantaneous blips only.

#### Common Mistakes

- Unbounded `operationName` from arbitrary strings.
- Missing error status labels.
- Histogram buckets mismatched to actual latencies.

---

## 28.7 Deployment Strategies

### 28.7.1 Development Deployment

#### Beginner

Developers run **Docker Compose** with **subgraphs + DB + Redis**. Hot reload via **tsx watch** or **nodemon**.

#### Intermediate

**Tilt/DevSpace** orchestrates multi-service dev. **Seed scripts** populate data.

#### Expert

**Telepresence** connects laptop to cluster services. **Feature branches** deploy **preview environments** with **ephemeral supergraphs**.

```yaml
# docker-compose.yml (illustrative fragment)
services:
  gateway:
    build: ./gateway
    ports: ["4000:4000"]
    environment:
      USERS_URL: http://users:4001/graphql
  users:
    build: ./subgraphs/users
    ports: ["4001:4001"]
```

#### Key Points

- Parity with prod topology reduces surprises.
- Local supergraph compose mirrors CI.
- Fast feedback loops beat perfect fidelity early.

#### Best Practices

- Makefile/npm scripts for `dev up`.
- Document ports and env vars clearly.
- Use `.env.example` committed.

#### Common Mistakes

- Dev uses single monolith while prod is federated.
- Secrets committed to compose files.
- No resource limits causing laptop meltdown.

---

### 28.7.2 Staging Deployment

#### Beginner

**Staging** mirrors production **scale-down** with **anonymized data** or **synthetic** datasets.

#### Intermediate

Run **operation checks**, **load tests**, and **migrations** dry-run here. **Feature flags** default on for internal testers.

#### Expert

**Blue/green in staging** rehearses prod switches. **Chaos** experiments validate **fallbacks** when subgraphs fail.

```bash
rover subgraph publish users@staging --schema ./users.graphql --routing-url https://users.staging.internal/graphql
```

#### Key Points

- Staging should exercise federation composition paths.
- Data realism affects query performance validity.
- Gate promotions on automated checks.

#### Best Practices

- Refresh staging data on a schedule.
- Separate staging secrets rotation.
- Track schema versions deployed per env.

#### Common Mistakes

- Staging never gets migrations applied.
- Sharing one DB between dev and staging.
- Skipping load tests until prod incident.

---

### 28.7.3 Production Deployment

#### Beginner

**Rolling** deploys replace pods gradually. **Health checks** ensure only ready pods receive traffic.

#### Intermediate

**Database migrations** run with **expand/contract** and **backfills** off the critical path.

#### Expert

**GitOps** (Argo CD) manages manifests; **SLO-based rollbacks** automate on error budget burn. **Router and subgraph** deploy orders documented—sometimes **router first** when adding new fields safely.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: graphql-router
spec:
  project: default
  source:
    repoURL: https://github.com/org/platform.git
    path: k8s/router
  destination:
    server: https://kubernetes.default.svc
    namespace: graphql
```

#### Key Points

- Order matters in federated systems.
- Migrations and code deploys must coordinate.
- Observability gates promotion.

#### Best Practices

- Automate smoke tests post-deploy.
- Keep rollback one command away.
- Document blast radius per subgraph.

#### Common Mistakes

- Breaking composition deploying subgraph before router ready.
- Long-running migrations locking tables.
- No synthetic check after deploy.

---

### 28.7.4 Blue-Green Deployment

#### Beginner

**Blue-green** runs two identical environments; switch traffic **instantly** after validation.

#### Intermediate

For GraphQL, **duplicate gateways** and **subgraphs** behind LB; switch **DNS/LB** target. **Database** compatibility must span both colors during cutover.

#### Expert

**Session draining** on WebSocket subscriptions before cutover. **Federation** requires both colors to compose valid supergraphs—use **feature flags** to hide new fields until green stable.

```javascript
// Traffic switch often infra-level; app exposes version for verification
export const resolvers = {
  Query: {
    deploymentColor: () => process.env.COLOR ?? "blue",
  },
};
```

#### Key Points

- Double resource usage during transition.
- Schema compatibility across colors is critical.
- Draining prevents dropped WS clients abruptly.

#### Best Practices

- Automate synthetic checks against green before flip.
- Time-box parallel running period.
- Monitor error deltas during switch.

#### Common Mistakes

- Schema mismatch between colors causing client errors.
- Forgetting background jobs still on old color.
- Flipping with failing health checks.

---

### 28.7.5 Canary Releases

#### Beginner

**Canary** sends a **small percentage** of traffic to a new version, watches metrics, then ramps up.

#### Intermediate

**Header-based** routing (`x-canary: 1`) for internal testers; **percentage splits** via service mesh.

#### Expert

**Subgraph-level canaries** with **@override** migrations or **duplicate fields**—coordinate with **router** capabilities. **Auto rollback** on elevated error rates.

```text
# Envoy/Istio weighted route pseudo-config
routes:
  - destination: subgraph-v1
    weight: 90
  - destination: subgraph-v2
    weight: 10
```

#### Key Points

- Canary reduces blast radius.
- GraphQL needs metric sensitivity (partial errors).
- Subgraph canaries affect supergraph composition.

#### Best Practices

- Start with low traffic regions or internal users.
- Watch p99 latency and error budget.
- Plan rollback triggers ahead of time.

#### Common Mistakes

- Canary too small to detect issues statistically.
- Ignoring downstream DB differences between versions.
- Composing incompatible subgraph versions concurrently.

---

## 28.8 GraphQL Best Practices

### 28.8.1 Schema Design Patterns

#### Beginner

Model **nouns** as types, **verbs** as mutations, use **input types** for payloads, **non-null** intentionally.

#### Intermediate

**Connection spec** for pagination (`edges`, `pageInfo`). **Payload unions** express domain outcomes (`Success | ValidationError`).

#### Expert

**Aggregate roots** mirror DDD; **avoid god `Query`** with hundreds of unrelated fields—use **namespacing** or **split graphs**.

```graphql
type MutationPayload {
  user: User
  errors: [ValidationError!]!
}

type ValidationError {
  field: String!
  message: String!
}
```

#### Key Points

- Schema is the contract—design slowly, evolve safely.
- Input objects scale better than long argument lists.
- Error modeling is part of UX.

#### Best Practices

- Write SDL descriptions for public fields.
- Use enums instead of magic strings.
- Review schema changes in PR with consumers notified.

#### Common Mistakes

- Leaking implementation tables as 1:1 types without thought.
- Everything non-null leaving no room for partial errors.
- No pagination on large lists.

---

### 28.8.2 Naming Conventions

#### Beginner

Types **`PascalCase`**, fields/args **`camelCase`**, enums **`SCREAMING_SNAKE_CASE`** (common GraphQL style).

#### Intermediate

Mutations named **`verbObject`** (`createOrder`). Queries **`object` or `objects`** (`order`, `orders`).

#### Expert

Consistent **prefixes** for admin vs public fields (`adminUser`). Avoid **abbreviations** that confuse codegen across languages.

```graphql
enum OrderStatus {
  PENDING
  PAID
  CANCELLED
}

type Order {
  id: ID!
  status: OrderStatus!
}
```

#### Key Points

- Conventions aid discovery in large graphs.
- Enums should be closed sets with clear meaning.
- Consistency beats individual preference.

#### Best Practices

- Automate naming lint rules.
- Glossary for domain terms.
- Align JSON fields to camelCase in resolvers.

#### Common Mistakes

- Mixing snake_case and camelCase publicly.
- Identical names for different concepts (`status` overload).
- Overly generic names (`data`, `item`).

---

### 28.8.3 API Documentation

#### Beginner

**Descriptions** on types/fields power GraphiQL/Playground docs. Export **SDL** to a portal.

#### Intermediate

**Spectral/GraphQL ESLint** enforce description presence. **Examples** in directives or external portals (Apollo Studio).

#### Expert

**Operation collections** document recommended queries. **Postman/Insomnia** shares runnable examples for partners.

```graphql
"""Represents a customer-facing user account."""
type User {
  """Primary email used for login."""
  email: String!
}
```

#### Key Points

- Inline docs stay close to the source of truth.
- External docs drift without generation pipelines.
- Examples reduce support load.

#### Best Practices

- Require descriptions on public schema elements.
- Generate markdown docs in CI.
- Link SLAs and auth requirements in portal pages.

#### Common Mistakes

- Empty descriptions everywhere.
- Docs site manually edited away from schema.
- No changelog for API consumers.

---

### 28.8.4 Versioning Strategy

#### Beginner

Prefer **continuous evolution** with **deprecations** over `/v1` `/v2` endpoints.

#### Intermediate

If **breaking** change is unavoidable, run **parallel fields** or **separate graphs** temporarily for major shifts.

#### Expert

**Mobile long tail** may require **extended deprecation windows**. **Registry** tracks **schema tags** per environment and **launch approvals**.

```graphql
type Query {
  """Deprecated: use `viewer`"""
  me: User @deprecated(reason: "Use `viewer` by 2026-12-01")
  viewer: User
}
```

#### Key Points

- GraphQL versioning is mostly schema-time, not URL-time.
- Telemetry informs sunset timelines.
- Federation adds cross-service versioning coordination.

#### Best Practices

- Publish deprecation policy externally.
- Track client usage by operation hash.
- Coordinate mobile/web release cycles.

#### Common Mistakes

- Breaking schema for a single internal client.
- No communication channel for API consumers.
- Removing enums still referenced silently.

---

### 28.8.5 Evolution Patterns

#### Beginner

**Additive changes** first; **deprecate**; **remove** after clients migrate.

#### Intermediate

**Nullability changes** are dangerous—prefer new fields. **Input defaults** can surprise clients—document behavior.

#### Expert

**Feature flags** gate resolver behavior while schema remains stable. **Expand (API) → Migrate (clients) → Contract (remove)** is the durable pattern.

```javascript
export const resolvers = {
  User: {
    name(user, _args, ctx) {
      if (ctx.flags.newNameSource) {
        return user.fullName;
      }
      return user.legacyName;
    },
  },
};
```

#### Key Points

- Evolution is a process, not a single deploy.
- Flags decouple schema from behavior rollouts.
- Communication equals fewer incidents.

#### Best Practices

- Maintain internal RFCs for schema changes.
- Automate client operation checks on PR.
- Celebrate removals—less surface area.

#### Common Mistakes

- Big-bang renames without flags or dual fields.
- Undocumented default value changes on inputs.
- Assuming all clients update weekly.

---

