# GraphQL Interview Questions — Mid Level (4+ Years)

100 advanced questions covering schema design, resolvers, performance, architecture, security, and production operations.

---

## Q1. How do you design a scalable GraphQL schema?

**Answer:**

A scalable schema favors **bounded fan-out**, **stable contracts**, and **domain boundaries** that match how your organization ships software. Start by modeling the graph around **nouns (types)** and **capabilities (fields)** that clients actually need, not every database column. Use **pagination** (connections) for lists that can grow, **non-null** judiciously so breaking changes are explicit, and **interfaces/unions** where polymorphism reduces duplication.

Split large domains with **namespacing** (prefixes or separate subgraphs in federation) so teams can evolve independently. Avoid “god” root types: keep `Query` thin and push detail into types reachable by ID. Document **performance characteristics** (N+1 risks, expensive fields) in schema descriptions and enforce limits at the gateway.

**Trade-offs:** A “perfect” normalized schema can over-fetch for UIs; sometimes **payload-oriented** fields (e.g., `viewerDashboard`) are justified for mobile—at the cost of more bespoke server logic.

```graphql
type Query {
  node(id: ID!): Node
  searchProducts(filter: ProductFilter!, after: String, first: Int): ProductConnection!
}
```

```typescript
// Bound list growth at the type level
const ProductConnection = new GraphQLObjectType({
  name: "ProductConnection",
  fields: {
    edges: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProductEdge))) },
    pageInfo: { type: new GraphQLNonNull(PageInfo) },
  },
});
```

---

## Q2. What are the best practices for GraphQL schema design?

**Answer:**

**Best practices** include: use **verbs on mutations** (`createOrder`), **nouns on types** (`Order`); prefer **input objects** over long argument lists; use **enums** for closed sets; default **lists to empty** (`[]`) rather than null when “no items” is valid; mark **IDs as opaque** `ID!` and resolve globally when possible.

Expose **errors as union payloads** or **field errors** consistently; avoid leaking stack traces. Version **behavior** via new fields and deprecations, not URL paths. Co-locate **authorization hints** (directives or schema metadata) with fields teams own.

**Trade-offs:** Strict non-null everywhere improves client ergonomics but increases breaking-change frequency; nullable fields add defensive coding on clients.

```graphql
enum OrderStatus { PENDING PAID SHIPPED }
type Mutation {
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
}
```

---

## Q3. How do you handle schema versioning in GraphQL?

**Answer:**

GraphQL typically uses **continuous schema evolution** instead of `/v2` URLs. You **add** fields, **deprecate** old ones with `deprecated` reasons and sunset dates, and **avoid removing** until clients migrate. For incompatible changes, introduce **parallel fields** (`priceV2`) or **new types** (`LegacyInvoice` vs `Invoice`).

**Registry tooling** (Apollo Studio, Hive, GraphQL Hive) tracks **field usage** so you know when a deprecation is safe to remove. Gate **breaking deploys** with CI checks (`graphql-inspector`, `graphql-breaking-change-check`).

**Trade-offs:** No URL versioning means **strong governance** is mandatory; without analytics, you accumulate dead schema surface.

```graphql
type Product {
  price: Money! @deprecated(reason: "Use pricing { list } — remove after 2026-06-01")
  pricing: ProductPricing!
}
```

---

## Q4. What is schema evolution and how does it differ from REST versioning?

**Answer:**

**Schema evolution** is the practice of changing a GraphQL API **additively** (new fields, optional args, new types) while clients **select only what they need**, so many client versions coexist on one endpoint. **REST versioning** often duplicates routes (`/v1/users`, `/v2/users`) or uses headers; each version is a **separate contract surface**.

GraphQL shifts complexity to **schema discipline** and **tooling** rather than parallel deployments of entire resource shapes. Breaking changes in GraphQL still happen—they are managed via deprecations, usage metrics, and coordinated releases—not implicit version bumps.

**Trade-offs:** REST versioning can isolate blast radius per route; GraphQL requires **strong deprecation culture** and **client query audits**.

---

## Q5. How do you deprecate fields in a GraphQL schema?

**Answer:**

Use the **`@deprecated` directive** with a **reason** and optionally **migration guidance**. Track **telemetry** on resolver execution or persisted-query hashes to see who still requests the field. Communicate **timelines** in the reason string and internal runbooks.

After usage hits zero (or policy threshold), remove in a **major release** or coordinated window. For SDL-first stacks, `graphql-js` supports `deprecationReason` on field configs.

**Trade-offs:** Long deprecation periods reduce churn but **increase schema clutter**; short periods risk breaking slow-moving clients.

```graphql
extend type User {
  legacyRank: Int @deprecated(reason: "Use reputation.score — removal Q3 2026")
}
```

```typescript
legacyRank: {
  type: GraphQLInt,
  deprecationReason: "Use reputation.score",
  resolve: (user) => user.reputation?.score ?? user.legacyRank,
},
```

---

## Q6. What are abstract types and when should you use them?

**Answer:**

GraphQL has **interfaces** and **unions**. **Interfaces** define shared fields implementations must provide—ideal for “things with an ID and title.” **Unions** represent “one of several object types” without shared fields—use when variants differ structurally.

Use interfaces for **polymorphic cores** (`Node`, `Actor`); unions for **event payloads** or **search hits** where overlap is minimal. Resolvers must return concrete object types; the engine dispatches fields based on `__typename`.

**Trade-offs:** Interfaces ease client fragments but require **schema-wide consistency**; unions need **inline fragments** and can complicate caching keys.

```graphql
interface Node { id: ID! }
type User implements Node { id: ID! name: String! }
union SearchResult = User | Post | Comment
```

---

## Q7. How do you model polymorphic relationships in GraphQL?

**Answer:**

Model **shared behavior** with **interfaces** (`Commentable`), **distinct shapes** with **unions**, and **references** with a **generic `Node`** or **Relay `Node`**. For “owner” patterns, `owner: Party!` where `Party` is interface implemented by `User`, `Organization`.

Ensure **resolver returns** match declared types and use **`__resolveType`** (or `isTypeOf`) for unions/interfaces. In federation, **entity interfaces** (Apollo 2+) require careful `@interfaceObject` usage.

**Trade-offs:** Deep interface hierarchies mirror OOP pitfalls—prefer **small graphs** and **composition** (`metadata: JSON` is sometimes worse than explicit fields).

```typescript
const Party = new GraphQLInterfaceType({
  name: "Party",
  fields: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolveType: (value) => (value.orgId ? "Organization" : "User"),
});
```

---

## Q8. What is the Relay specification and its requirements?

**Answer:**

**Relay** is a client framework with a **server specification** for predictable pagination, refetching, and caching. Common server requirements: globally unique **`ID`** encoding (`base64(type:id)`), the **`Node` interface** with `node(id: ID!)` for refetch, **`Connection`** shapes for lists, and **mutation payloads** with `clientMutationId` (optional in modern Relay).

The spec pushes **cursor-based pagination** and **stable edge cursors** so incremental rendering works. Not every API must be Relay-compliant, but following **connections + node** pays dividends for large SPAs.

**Trade-offs:** Relay conventions add **boilerplate**; skipping them simplifies small apps but hurts **client cache normalization** at scale.

```graphql
type Query {
  node(id: ID!): Node
}
interface Node { id: ID! }
```

---

## Q9. What is the Node interface in Relay?

**Answer:**

The **`Node` interface** requires a stable **`id: ID!`** and pairs with a root **`node(id:)`** field so clients can **refetch any object** by ID without knowing its parent query. IDs should be **opaque and globally unique** (often composite encoding).

Implement `Node` on types you want addressable; resolve `Query.node` by decoding the ID or looking up in a registry.

**Trade-offs:** Global IDs complicate **debugging** unless you document decoding; they excel for **cache normalization** and **BFF aggregation**.

```graphql
type User implements Node {
  id: ID!
  name: String!
}
```

```typescript
Query: {
  node: async (_, { id }, ctx) => {
    const { type, pk } = decodeGlobalId(id);
    return ctx.loaders.byType[type].load(pk);
  },
},
```

---

## Q10. What is the Connection pattern in GraphQL?

**Answer:**

A **Connection** wraps paginated lists as **`edges`** (each with **`cursor`** + **`node`**) plus **`pageInfo`** (`hasNextPage`, `endCursor`, etc.). It standardizes pagination metadata and works with **cursor-based** DB queries (seek pagination).

Clients paginate with `after` + `first` (or `before` + `last`). This avoids **offset** pitfalls on large tables and plays well with **real-time** updates where offsets shift.

**Trade-offs:** More verbose than bare arrays; worth it for **unbounded** or **live** data.

```graphql
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}
type UserEdge { cursor: String! node: User! }
```

---

## Q11. How do you implement the Connection specification (edges, nodes, pageInfo)?

**Answer:**

**Resolvers** fetch `limit + 1` rows to infer `hasNextPage`. Each row becomes an **edge**: **`cursor`** is often an opaque encoding of sort keys (e.g., `(createdAt, id)`), **`node`** is the entity. **`pageInfo.endCursor`** mirrors the last edge’s cursor.

Use **stable sorts**; document tie-breakers (`order by created_at, id`). For **bidirectional** paging, implement `hasPreviousPage` with analogous `before` logic.

**Trade-offs:** Cursor encoding must stay **backward compatible**; changing sort keys is a **breaking** pagination change.

```typescript
async function usersConnection(_: unknown, args: ConnectionArgs, ctx: Ctx) {
  const { nodes, pageInfo } = await ctx.db.users.seekPaginate({
    after: args.after,
    first: args.first ?? 20,
  });
  const edges = nodes.map((n) => ({
    cursor: encodeCursor({ createdAt: n.createdAt, id: n.id }),
    node: n,
  }));
  return { edges, pageInfo };
}
```

---

## Q12. What are best practices for designing Input types?

**Answer:**

**Group** related mutation arguments into **single input objects** (`CreateUserInput`) for forward compatibility (add optional fields without breaking callers). Prefer **explicit enums** over stringly-typed statuses. Use **`ID!` for references**, not raw ints scattered across args.

Validate at **schema** (non-null) and **business** layers (cross-field rules with libraries like `zod`/`yup`). Avoid **huge** inputs—split workflows (`draft` vs `publish`). Document **idempotency** keys in input when needed.

**Trade-offs:** Big inputs are flexible but **harder to reason about**; consider **state machines** for complex domains.

```graphql
input CreateOrderInput {
  customerId: ID!
  lines: [OrderLineInput!]!
  idempotencyKey: String
}
```

---

## Q13. How do you handle recursive types in GraphQL?

**Answer:**

GraphQL allows **self-referential object types** (e.g., `Category { children: [Category!]! }`). Prevent **unbounded recursion** in queries via **depth limits** and optionally **complexity analysis**. In resolvers, use **DataLoader** or **iterative** DB queries instead of naive recursion that explodes round-trips.

For **trees**, consider **materialized paths** or **nested sets** at the DB layer; expose **lazy children** fields rather than deep nesting by default.

**Trade-offs:** Deep trees are **DoS vectors**; expose **`depth`/`maxDepth`** args or dedicated `descendants(limit:)` fields.

```graphql
type Comment {
  id: ID!
  replies(first: Int = 10, after: String): CommentConnection!
}
```

---

## Q14. What is the difference between nullable and non-nullable design strategies?

**Answer:**

**Non-null (`!`)** promises the field always returns a value—great for invariants but **any resolver failure nullifies the parent** in GraphQL’s bubbling rules (unless handled). **Nullable** is safer when **partial failures** (federated subgraph down, optional feature flags) should not break entire queries.

Common pattern: **`User!` for logged-in viewer**, nullable `friend` when missing is normal. Lists: `[Item!]` vs `[Item]!` vs `[Item!]!` communicate **null elements** vs **null list**.

**Trade-offs:** Aggressive `!` improves **TypeScript/codegen** strictness; operational incidents may require **nullable escape hatches**.

---

## Q15. How do you design error types in a GraphQL schema?

**Answer:**

GraphQL has **top-level errors** (`errors[]`) and **partial data**. For domain failures, many teams use **union payloads** (`MutationResult = Success | ValidationError | AuthError`) or **nullable fields + `UserError` lists** on payloads.

Align with **HTTP** only at transport: mutations may still return `200` with structured errors—**consistency** matters more than REST dogma. Log **correlation IDs** server-side; expose **safe codes** to clients.

**Trade-offs:** Unions are **explicit** but verbose; `errors` array on payload duplicates GraphQL’s `errors`—pick **one style** per API.

```graphql
union CheckoutResult = CheckoutSuccess | CardDeclined | OutOfStock
type CheckoutSuccess { order: Order! }
type CardDeclined { message: String! retryAfter: Int }
```

---

## Q16. What are payload types for mutations and why are they important?

**Answer:**

**Payload types** wrap mutation results (`CreateUserPayload { user, errors }`) so you can return **multiple artifacts** (record + warnings + `clientMutationId`). They future-proof **field additions** without breaking callers.

They also clarify **nullability**: `user` may be null on failure while `errors` populated. This beats boolean “success” flags that hide **why** something failed.

**Trade-offs:** More boilerplate than returning bare `User`; essential for **mature** APIs and **codegen** clarity.

```graphql
type CreateUserPayload {
  user: User
  userErrors: [UserError!]!
}
```

---

## Q17. How do you handle unions vs interfaces in practice?

**Answer:**

Use **interfaces** when clients need **shared selections** (`{ id name }` across types). Use **unions** when shapes diverge and clients branch with **inline fragments**. Implementation-wise, **interfaces** need `resolveType`/`isTypeOf`; **unions** require exhaustive handling in UIs.

**Federation note:** returning unions across subgraphs has constraints—often model as **view-specific** queries in the gateway.

**Trade-offs:** Unions push **complexity to clients**; interfaces can force **lowest-common-denominator** fields.

```graphql
union Notification = Mention | SystemAlert
query {
  inbox { ... on Mention { byUser { id } } ... on SystemAlert { severity } }
}
```

---

## Q18. What is schema composition?

**Answer:**

**Schema composition** merges multiple GraphQL schemas into one **supergraph**. In **Apollo Federation**, subgraphs expose types merged by **entities** and **`@key`**. In **stitching**, you combine remote schemas and add **resolvers** that join types.

Composition validates **name collisions**, **value type compatibility**, and **field merge rules**. CI should run **`supergraph compose`** on every PR.

**Trade-offs:** Composition enables **team autonomy** but requires **schema review** to avoid **type explosions** and **ambiguous merges**.

```graphql
# Subgraph A
type User @key(fields: "id") { id: ID! name: String }

# Subgraph B
extend type User @key(fields: "id") { id: ID! orders: [Order!]! }
```

---

## Q19. How do you handle multi-tenant schemas?

**Answer:**

**Tenant context** flows from **JWT**, **header**, or **subdomain**, attached to `context` per request. **Never** trust client-provided `tenantId` without verification. Scope **DataLoader** and **DB queries** with `WHERE tenant_id = $1`.

Options: **one schema, row-level security** (Postgres RLS), **separate DBs** per tenant (strong isolation, harder ops), or **schema-per-tenant** (rare in GraphQL servers). **Federation:** subgraphs carry tenant in headers for downstream calls.

**Trade-offs:** Shared schema is **cost-efficient**; **noisy neighbor** and **data leaks** are risks without strict middleware.

```typescript
export const tenantGuard: Middleware = async (resolve, parent, args, ctx, info) => {
  if (!ctx.tenantId) throw new GraphQLError("TENANT_REQUIRED");
  return resolve(parent, args, ctx, info);
};
```

---

## Q20. What are naming conventions for GraphQL schemas?

**Answer:**

Use **`PascalCase`** types/enums, **`camelCase`** fields/arguments, **`UPPER_SNAKE`** enum values (community split—pick one standard). Mutations **`verbObject`** (`updateProfile`). Inputs **`VerbObjectInput`**. Booleans **`is`/`has`** (`isActive`).

Avoid **type prefixes** unless namespacing (`BillingInvoice` vs `ShippingInvoice`). **Global uniqueness** matters in federation—prefix domain-specific enums if needed.

**Trade-offs:** Strict naming improves **discoverability**; retrofitting **legacy** names may require aliases and deprecations.

```graphql
enum PaymentProvider { STRIPE ADYEN }
input UpdateProfileInput { displayName: String }
type Mutation { updateProfile(input: UpdateProfileInput!): UpdateProfilePayload! }
```

---

## Q21. How does the resolver execution algorithm work internally?

**Answer:**

Execution is **tree-shaped**: starting at `Query`/`Mutation`/`Subscription`, the engine **coerces variables**, **validates** selection sets, then **invokes resolvers** field-by-field. **Default resolvers** read parent properties matching field names.

For lists, resolvers run **per element**; for parallel fields at the same level, implementations often run **concurrently** (graphql-js uses `Promise.all` patterns in execution). **Errors** bubble: if a non-null field throws, parent becomes `null` until a nullable boundary.

Understanding this explains **N+1** (per-item resolver calls) and why **middleware** wraps each field.

**Trade-offs:** Parallel execution is fast but can **overload** downstream systems without **batching limits**.

```typescript
// Simplified default resolution
function defaultResolve(source: any, args: any, ctx: any, info: GraphQLResolveInfo) {
  if (typeof source?.[info.fieldName] === "function") return source[info.fieldName](args, ctx);
  return source?.[info.fieldName];
}
```

---

## Q22. What is the N+1 problem and how do you solve it with DataLoader?

**Answer:**

**N+1** happens when fetching a list of `N` parents triggers **1 query for the list** plus **N queries** for a child field (e.g., `users { posts }` loads posts per user). **DataLoader** batches requests in a **tick** of the event loop and **deduplicates** keys, turning many calls into **one batched query**.

Create **one DataLoader per request** (not singleton) to avoid cross-user cache leaks. Batch functions should return **results aligned** with keys (same order, handle missing).

**Trade-offs:** Batching adds **latency equal to one microtask**; wrong batch scope causes **stale** or **over-sharing** data.

```typescript
const userLoader = new DataLoader(async (ids: readonly string[]) => {
  const rows = await db.users.findMany({ where: { id: { in: [...ids] } } });
  const map = new Map(rows.map((u) => [u.id, u]));
  return ids.map((id) => map.get(id) ?? new Error(`User ${id} not found`));
});
```

---

## Q23. How do you implement DataLoader from scratch?

**Answer:**

A minimal DataLoader stores **pending keys** in a queue, schedules a **flush** (`process.nextTick`/`queueMicrotask`), then calls **`batchLoadFn(keys)`** once. It caches **Promise** results per key for the request lifetime.

Implement **`load(key)`** to enqueue and return a shared promise; **`prime(key, value)`** for warm-cache; **`clear(key)`** if mutations invalidate.

**Trade-offs:** Homemade loaders are **error-prone** (ordering, cache poisoning); prefer **`dataloader`** package in production.

```typescript
class NaiveLoader<K, V> {
  private pending = new Set<K>();
  private promises = new Map<K, Promise<V>>();
  constructor(private batch: (keys: K[]) => Promise<V[]>) {}
  load(key: K) {
    if (!this.promises.has(key)) {
      this.pending.add(key);
      const p = new Promise<V>((resolve, reject) => {
        queueMicrotask(async () => {
          const keys = [...this.pending];
          this.pending.clear();
          const vals = await this.batch(keys);
          keys.forEach((k, i) => this.promises.set(k, Promise.resolve(vals[i])));
          resolve(vals[keys.indexOf(key as K)] as V);
        });
      });
      this.promises.set(key, p);
    }
    return this.promises.get(key)!;
  }
}
```

---

## Q24. What is batching and caching in DataLoader?

**Answer:**

**Batching** collapses multiple `load()` calls into **one** `batchLoadFn` invocation per frame. **Caching** memoizes `load(key)` results **for the request** so duplicate fetches hit memory, not the DB.

**Caching** is not a replacement for **HTTP caching** or **Redis**—it’s **request-scoped deduplication**. Use **`cacheKeyFn`** if keys need normalization (stringify objects).

**Trade-offs:** Long-lived caches break **real-time** correctness—**disable** or **`clear`** after writes.

```typescript
new DataLoader(batchUsers, { cacheKeyFn: (key: string) => key.toLowerCase() });
```

---

## Q25. How do you handle resolver middleware?

**Answer:**

**Middleware** wraps resolvers to cross-cut concerns: **auth**, **logging**, **metrics**, **timeouts**, **experiment flags**. In Node, `graphql-middleware` composes a **middleware chain**; each function receives `(resolve, parent, args, context, info)` and calls `resolve(...)`.

Order matters: **auth before business logic**, **metrics around** execution. For **field-level** control, inspect `info.path`/`info.fieldName`.

**Trade-offs:** Heavy middleware per field can add **CPU**; prefer **gateway-level** checks when coarse-grained.

```typescript
const authMiddleware = {
  Mutation: {
    createPost: async (resolve, parent, args, ctx, info) => {
      if (!ctx.user) throw new GraphQLError("UNAUTHENTICATED");
      return resolve(parent, args, ctx, info);
    },
  },
};
```

---

## Q26. What is the graphql-middleware library and how does it work?

**Answer:**

`graphql-middleware` lets you apply **middleware maps** shaped like resolvers (`Query`, `Mutation`, or per-field) and **composes** them with `applyMiddleware(schema, middleware1, middleware2)`. Internally it **wraps** the schema’s resolvers (similar to **graphql-shield** patterns).

It supports **fragment middleware** and **schema middleware** variants depending on version—always check **compatibility** with your `graphql` major version.

**Trade-offs:** Magic indirection can make **debugging** harder—log **middleware order** explicitly.

```typescript
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";

const schema = makeExecutableSchema({ typeDefs, resolvers });
export const schemaWithMiddleware = applyMiddleware(schema, loggerMiddleware, permissions);
```

---

## Q27. How do you implement field-level permissions in resolvers?

**Answer:**

Encode rules **next to resolvers**: fetch **roles/scopes** once in context, then **guard** sensitive fields. For reusable logic, use **directives** (`@auth(requires: ADMIN)`) implemented with `schemaTransformer` or `graphql-tools`.

Fine-grained checks often need **parent data** (owner id)—compute in resolver after **lightweight** auth check. **Deny by default** for admin fields.

**Trade-offs:** Field guards scatter policy—**central RBAC** tables + **policy engine** help at scale.

```typescript
User: {
  salary: async (user, _args, ctx) => {
    if (!ctx.user || (ctx.user.id !== user.id && !ctx.user.roles.includes("HR"))) {
      throw new ForbiddenError("NO_ACCESS");
    }
    return user.salary;
  },
},
```

---

## Q28. What is the difference between resolver-level and directive-level authorization?

**Answer:**

**Resolver-level** auth is explicit TypeScript/JavaScript in each resolver—flexible, easy to debug, but **repetitive**. **Directive-level** auth declaratively annotates schema and **transforms** resolvers or wraps execution—DRY, great for **consistent** rules.

Directives shine for **simple role checks**; resolvers remain better for **contextual** rules (resource ownership). Combine both: directive for **authentication**, resolver for **authorization nuance**.

**Trade-offs:** Directives hide logic—ensure **tests** cover transformed schema.

```graphql
directive @requiresAuth on FIELD_DEFINITION
```

---

## Q29. How do you implement complex filtering and sorting in GraphQL?

**Answer:**

Expose **structured filter inputs** mirroring DB capabilities (`filter: { price: { gte, lte }, tags: { any: [] } }`). Avoid arbitrary SQL fragments from clients. Encode **sort** as **enum** or **orderBy** lists with **whitelist** fields.

Use **DataLoader** carefully—filters may **break batching**; sometimes **dataloader-per-filter-key** or **single SQL join** queries outperform naive patterns.

**Trade-offs:** Rich filters complicate **caching** and **index planning**—document supported combinations.

```graphql
input ProductFilter {
  query: String
  priceRange: RangeInput
  brands: [ID!]
  sort: [ProductSort!] = [{ field: RELEVANCE, direction: DESC }]
}
```

```typescript
function buildWhere(filter: ProductFilter): SQLFragment {
  const clauses = [];
  if (filter.priceRange) clauses.push(priceBetween(filter.priceRange));
  return combine(clauses);
}
```

---

## Q30. How do you handle database transactions across multiple resolvers?

**Answer:**

GraphQL does **not** give you a transaction automatically across fields. **Lift transactions** to **mutation resolvers** that orchestrate repositories with **`db.transaction(async (trx) => { ... })`**.

Avoid starting transactions in **child field resolvers**—commit boundaries become unclear. For **nested mutations** (input trees), process in **one service method** inside a transaction.

**Trade-offs:** Long transactions hurt **throughput**—keep mutations **short**, retry on **serialization failures**.

```typescript
createOrder: async (_p, { input }, ctx) => {
  return ctx.db.transaction(async (trx) => {
    const order = await ordersRepo.create(trx, input);
    await inventoryRepo.reserve(trx, order.lines);
    return { order };
  });
},
```

---

## Q31. What is the deferred execution pattern in resolvers?

**Answer:**

**Deferred execution** usually refers to **`@defer`/`@stream`** (incremental delivery) or **lazy promises** in resolvers. In everyday Node servers, it can mean **not awaiting** unrelated work—though GraphQL execution still **awaits** field promises before responding unless using **incremental** transports.

With **defer/stream** (where supported), the server sends **patches** as slow fields resolve. Without them, optimize via **prioritization** at query planning or **split queries** on the client.

**Trade-offs:** Incremental responses complicate **proxies/CDNs**; great for **large** or **slow** fields behind stable shells.

```graphql
query {
  hero { name }
  ... @defer { recommendations { title } }
}
```

---

## Q32. How do you optimize resolver performance?

**Answer:**

**Batch** with DataLoader, **deduplicate** with request caches, **limit** list sizes, **project** DB columns based on `info.fieldNodes`, and **move expensive work** to **async jobs** with **field-level** loading states (`jobStatus`). Use **`graphql-parse-resolve-info`** to translate GraphQL selections into **SQL projections**.

Add **timeouts** and **circuit breakers** around flaky integrations. **Profile** with OpenTelemetry spans per resolver.

**Trade-offs:** Aggressive projection adds **complexity**—balance with **maintainability**.

```typescript
import { parseResolveInfo } from "graphql-parse-resolve-info";

User: {
  async posts(user, _args, ctx, info) {
    const parsed = parseResolveInfo(info) as ResolveTree;
    const wantsComments = Boolean(parsed.fieldsByTypeName.Post?.comments);
    return ctx.postsRepo.forUser(user.id, { includeComments: wantsComments });
  },
},
```

---

## Q33. What are resolver maps and how do you structure them?

**Answer:**

A **resolver map** is the `{ Query, Mutation, Type }` object passed to `makeExecutableSchema`. Structure by **domain module** (`userResolvers`, `billingResolvers`) and **merge** with `@graphql-tools/merge` or **code-first** equivalents.

Keep **thin resolvers** delegating to **services** (`userService.getById`). Attach **scalar resolvers** and **enum resolvers** alongside types.

**Trade-offs:** Monolithic maps become **merge conflicts**—module-per-domain scales better.

```typescript
export const resolvers = mergeResolvers([userResolvers, postResolvers, scalarResolvers]);
```

---

## Q34. How do you handle file uploads in GraphQL?

**Answer:**

Common pattern: **`multipart/form-data`** request with **GraphQL multipart request spec**—variables reference **`null` placeholders** replaced by file streams. Server uses **`graphql-upload`** (or framework integrations) to expose **`Upload`** scalars to resolvers.

Stream files to **object storage** (S3/GCS), store **metadata** in DB, return **URLs**. **Never** base64 huge files in JSON.

**Trade-offs:** Multipart breaks **some** CDNs and **pure JSON** tooling—document client requirements.

```graphql
scalar Upload
type Mutation { uploadAvatar(image: Upload!): UrlPayload! }
```

```typescript
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";

new GraphQLScalarType({ name: "Upload", ...GraphQLUpload });
```

---

## Q35. What is the graphql-upload specification?

**Answer:**

The **GraphQL multipart request** spec defines how to encode **operations + map + files** in a single HTTP request so GraphQL variables can include **binary parts**. It’s widely implemented by **`apollo-server`**, **`graphql-yoga`**, and clients like **`apollo-upload-client`**.

**Map** JSON ties **file parts** to variable paths (`variables.file`).

**Trade-offs:** Not part of the **GraphQL spec** itself—**interop** test early between client/server libraries.

```http
POST /graphql
Content-Type: multipart/form-data; boundary=----boundary
------boundary
Content-Disposition: form-data; name="operations"
{ "query": "mutation($f: Upload!){ upload(f:$f) }", "variables": { "f": null } }
------boundary
Content-Disposition: form-data; name="map"
{ "0": ["variables.f"] }
------boundary
Content-Disposition: form-data; name="0"; filename="a.png"
...
```

---

## Q36. How do you implement real-time features with GraphQL subscriptions?

**Answer:**

Define **`Subscription` root fields** with **async iterators** (`AsyncIterable`) yielding payloads. Transport is often **WebSocket** (`graphql-ws` or `subscriptions-transport-ws`). **Filter** events server-side with **`withFilter`** so clients only receive permitted events.

Bridge **domain events** (Redis pub/sub, Kafka) to subscription iterators. **Authenticate** during connection `onConnect`.

**Trade-offs:** Stateful connections complicate **horizontal scaling**—use **shared pub/sub** backplane.

```typescript
Subscription: {
  commentAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(["COMMENT_ADDED"]),
      (payload, variables, ctx) => payload.commentAdded.postId === variables.postId
    ),
  },
},
```

---

## Q37. What is the PubSub pattern in GraphQL subscriptions?

**Answer:**

**PubSub** abstracts **publish/subscribe** so resolvers can `publish(TOPIC, payload)` and subscription resolvers `asyncIterator(TOPIC)`. In-memory `PubSub` works for **single instance**; **RedisPubSub** scales out.

**Pattern:** mutation **writes DB**, then **publishes** event; subscribers **receive** updates—similar to **domain events**.

**Trade-offs:** In-memory loses events on **restart** and doesn’t **fan-out** across nodes.

```typescript
const pubsub = new PubSub();
await pubsub.publish("COMMENT_ADDED", { commentAdded: comment });
```

---

## Q38. How do you scale GraphQL subscriptions?

**Answer:**

Use a **distributed pub/sub** (Redis, NATS, Kafka) so **any instance** publishing reaches all subscribers. **Shard** connections with **sticky sessions** or **connection managers**. **Authenticate** early; **authorize** each message.

**Backpressure:** drop, sample, or **queue** if clients lag. **Monitor** connection counts and **memory**.

**Trade-offs:** Stronger scale often means **higher latency** and **ops burden**.

```typescript
import { RedisPubSub } from "graphql-redis-subscriptions";
const pubsub = new RedisPubSub({ connection: redisOptions });
```

---

## Q39. What are the transport protocols for subscriptions (WebSocket, SSE)?

**Answer:**

**WebSockets** (`graphql-ws`) are **bidirectional**—ideal for **subscriptions** and often **ping/pong** heartbeats. **SSE** is **HTTP one-way** (server→client), simpler through some proxies, good for **live queries** or **simple streams**; mutations stay regular HTTP/GraphQL.

**HTTP/2** streaming and **multipart incremental delivery** are emerging patterns for **queries**, distinct from classic subscriptions.

**Trade-offs:** Corporate proxies sometimes block WebSockets—**fallback** strategies matter.

```typescript
// graphql-ws usage with Apollo Server — pseudo
useServer({ schema, context: async (ctx) => ({ user: await auth(ctx) }) }, wsServer);
```

---

## Q40. How do you handle subscription authentication?

**Answer:**

Authenticate on **connection init** (`connectionParams` JWT) and attach **user to context**. **Revalidate** tokens periodically; **close** connection on expiry. **Authorize** subscriptions using the same rules as queries—**topic filters** must enforce **row-level** access.

Avoid trusting **client-provided IDs** without server-side checks.

**Trade-offs:** Long-lived connections conflict with **short-lived tokens**—use **refresh** flows or **opaque session ids**.

```typescript
onConnect: async (ctx) => {
  const token = ctx.connectionParams?.authorization?.replace("Bearer ", "");
  return { user: await verifyJwt(token) };
},
```

---

## Q41. What is query complexity analysis?

**Answer:**

**Complexity analysis** assigns **cost weights** to fields (and multiplies by list sizes) to reject **expensive** queries before execution. It counters **DoS** where deep nesting explodes work.

Implement with **`graphql-query-complexity`** or custom **validation rules** walking the AST. Tune weights using **production metrics**.

**Trade-offs:** Static costs may **mismatch** actual DB cost—**iterate** weights with profiling.

```typescript
import { getComplexity } from "graphql-query-complexity";

const complexity = getComplexity({
  estimators: [simpleEstimator({ defaultComplexity: 1 })],
  schema,
  query: document,
  variables,
  defaultComplexity: 1,
});
if (complexity > 1000) throw new GraphQLError("QUERY_TOO_COMPLEX");
```

---

## Q42. How do you implement query depth limiting?

**Answer:**

**Depth limiting** restricts **nested selections** (e.g., `user { friends { friends { ... }}}`). Implement via **`graphql-depth-limit`** providing a validation rule with **per-fragment** awareness.

Combine with **complexity**—depth alone misses **wide** queries.

**Trade-offs:** Legitimate UIs may need **tunable limits** per role or persisted operation allowlists.

```typescript
import depthLimit from "graphql-depth-limit";

const validationRules = [depthLimit(7)];
graphql({ schema, source, variableValues, validationRules });
```

---

## Q43. What is query cost analysis and how do you implement it?

**Answer:**

**Cost analysis** estimates resource usage—CPU, DB rows, external API calls—often via **field weights**, **multipliers for lists**, and **context-aware** costs (e.g., `search` costs more than `node`).

**Persisted queries** pair well: known operations get **precomputed** costs. Dynamic queries need **AST analysis** at runtime.

**Trade-offs:** Misconfigured costs either **block valid** traffic or **allow abuse**—measure continuously.

```typescript
const CostEstimator: ComplexityEstimator = (options) => {
  const fieldName = options.field.name;
  if (fieldName === "search") return 50;
  return 1;
};
```

---

## Q44. How do you implement rate limiting in GraphQL?

**Answer:**

Rate limit by **IP**, **API key**, or **user id** using **token bucket** / **leaky bucket** in Redis. GraphQL-specific: also limit **cost per minute** using complexity scores, not just **request count** (since one request can be huge).

Return **`429`** with **`Retry-After`**; include **rate limit headers** (`X-RateLimit-Remaining`).

**Trade-offs:** Per-request limits **penalize** batched legitimate clients—offer **higher tiers** with **persisted operations**.

```typescript
const key = `rl:${ctx.user?.id ?? ctx.ip}`;
const allowed = await redis.incrWithExpire(key, windowSec);
if (allowed > LIMIT) throw new GraphQLError("RATE_LIMITED", { extensions: { code: "RATE_LIMITED" } });
```

---

## Q45. What is persisted queries and how do they work?

**Answer:**

**Persisted queries** store **query text server-side** (or in a registry) keyed by **hash**; clients send **hash + variables** only. Benefits: **smaller payloads**, **whitelist enforcement**, **CDN caching** by key, reduced **attack surface** for arbitrary queries.

Apollo implements **persisted query manifests** loaded at deploy.

**Trade-offs:** **Developer friction** without tooling; dynamic clients (ad-hoc GraphiQL) need **exceptions**.

```json
{ "extensions": { "persistedQuery": { "version": 1, "sha256Hash": "ecf4edb46db..." } } }
```

---

## Q46. What is Automatic Persisted Queries (APQ)?

**Answer:**

**APQ** lets clients send a **hash** first; if the server **doesn’t know** it yet, client **retries** with full query text once, then subsequent requests use **hash only**. This blends **persisted** benefits without **pre-deploy** manifests.

Implemented in **Apollo Client/Server** via `persistedQueries` plugins.

**Trade-offs:** First query still exposes text; secure deployments often combine APQ with **auth** and **operation safelists** for sensitive APIs.

```typescript
// ApolloServer automatic persisted queries — illustrative
ApolloServerPluginUsageReporting({ generateClientAwarenessHeaders: true });
```

---

## Q47. How does response caching work in GraphQL?

**Answer:**

Unlike REST URLs, GraphQL POST bodies **aren’t naturally cacheable**. Caching uses **normalized caches** on clients (Apollo Client) and **HTTP/CDN** caches with **GET + persisted queries** or **cache-control** hints at field level (**Apollo `@cacheControl`**).

**Server-side** Redis caches can key by **operationId + variables** with **TTL** and **invalidation** on mutations.

**Trade-offs:** Field-level TTL requires **understanding staleness**—**mutations** must **evict** related keys.

```typescript
const responseCachePlugin = responseCachePlugin({
  sessionId: (requestContext) => requestContext.request.http.headers.get("session-id") ?? null,
});
```

---

## Q48. What are the different levels of caching in GraphQL?

**Answer:**

**Client normalized cache** (Apollo/Relay), **CDN HTTP** (GET persisted queries), **server application** (Redis per operation), **database** caches, and **DataLoader** request memoization. **Federation** adds **entity caching** in gateways (careful with **staleness**).

Each layer addresses **different TTLs** and **invalidation** semantics.

**Trade-offs:** More layers → **harder debugging**—propagate **cache tags** or **entity versions**.

---

## Q49. How do you implement CDN caching with GraphQL?

**Answer:**

Use **GET** requests with **persisted query hash + variables** as query params (or **POST** with CDN-specific setups—less common). Set **`Cache-Control`** headers from **`@cacheControl`** directives. **Vary** on `Authorization` only when user-specific.

**Shared caches** must not serve **private** data—separate **public** operations.

**Trade-offs:** **Personalized** graphs rarely CDN-cache; **public catalog** queries benefit most.

```http
GET /graphql?queryId=abc123&variables=%7B%22id%22%3A%221%22%7D
Cache-Control: public, max-age=60
```

---

## Q50. What is the @cacheControl directive?

**Answer:**

Apollo’s **`@cacheControl(maxAge, scope)`** annotates fields with **HTTP cache hints** consumed by **Apollo Server** plugins to emit **`Cache-Control`**. `scope: PUBLIC | PRIVATE` aligns with **CDN vs browser** semantics.

Works best with **response caching** plugins and **APQ/GET** patterns.

**Trade-offs:** Mis-set **`PUBLIC`** on private data is a **security incident**—review with **security**.

```graphql
type Post @cacheControl(maxAge: 120) {
  id: ID!
  title: String!
  body: String @cacheControl(maxAge: 0)
}
```

---

## Q51. How do you handle large result sets in GraphQL?

**Answer:**

**Never** return unbounded lists—use **connections**, **default `first` caps**, **server-enforced max** (`Math.min(args.first ?? 20, 100)`). Provide **filtering** to narrow data. For **exports**, use **separate async jobs** + **download links**.

**Trade-offs:** Pagination adds **round trips**—offer **reasonable defaults** and **bulk** endpoints when appropriate (non-GraphQL or dedicated REST).

```typescript
resolve: async (_, args) => {
  const first = Math.min(args.first ?? 20, 100);
  return ctx.repo.items({ take: first + 1, after: args.after });
},
```

---

## Q52. What is query batching?

**Answer:**

**HTTP batching** sends **multiple GraphQL operations** in one HTTP request (array of bodies). Server processes them serially or concurrently depending on implementation.

**DataLoader batching** is different—**field-level** batching inside one operation.

**Trade-offs:** HTTP batching reduces **mobile chattiness** but can **head-of-line block** and complicate **per-operation metrics**—instrument carefully.

```json
[
  { "query": "query A { me { id } }" },
  { "query": "query B { settings { theme } }" }
]
```

---

## Q53. How do you implement pagination efficiently (cursor vs offset)?

**Answer:**

**Offset** (`LIMIT/OFFSET`) is simple but **degrades** on large offsets and **breaks** with live inserts. **Cursor** pagination uses **indexed seek** (`WHERE (created_at, id) > ($cursor)`), stable under inserts, ideal for **infinite scroll**.

Expose **opaque cursors**; document **sort order**.

**Trade-offs:** Cursors are **harder** to jump to arbitrary pages (**SEO**, admin UIs may still need offset).

```sql
SELECT * FROM posts
WHERE (created_at, id) > (:c_at, :id)
ORDER BY created_at, id
LIMIT :limit;
```

---

## Q54. What is the Relay-style cursor pagination implementation?

**Answer:**

Implement **`first`/`after`** with **edges** containing **cursors** encoding composite sort keys. Determine **`hasNextPage`** via **`fetch n+1`** rows. Decode `after` to **resume** seek.

**pageInfo** includes **`startCursor`/`endCursor`** and **`hasPreviousPage`** when using `last`/`before`.

**Trade-offs:** Requires **consistent encoding**—changing indexes may **invalidate** old cursors.

```typescript
const rows = await db.query(sql, { after: decodeCursor(args.after), limit: first + 1 });
const hasNextPage = rows.length > first;
const nodes = hasNextPage ? rows.slice(0, first) : rows;
```

---

## Q55. How do you monitor and profile GraphQL performance?

**Answer:**

Instrument **per resolver** spans with **OpenTelemetry**, tag **`graphql.operation.name`**, **`field.path`**. Track **error rates**, **p50/p95 latency**, **complexity scores**, and **slow query logs** (with **variable scrubbing**).

Use **Apollo Studio** or **Grafana** dashboards; **sample** high-cardinality paths.

**Trade-offs:** Fine-grained field metrics are **cardinality-heavy**—**aggregate** judiciously.

```typescript
const span = tracer.startSpan("graphql.resolve", { attributes: { "graphql.field.name": info.fieldName } });
try { return await resolve(); } finally { span.end(); }
```

---

## Q56. What is Apollo Federation and how does it work?

**Answer:**

**Federation** composes **multiple subgraphs** into a **supergraph** via a **gateway/router**. Subgraphs declare **entities** with **`@key`**; the **router** plans queries across services, issuing **`_entities` representations** to resolve references.

It enables **domain ownership** with **one unified graph** for clients.

**Trade-offs:** Operational **complexity**—needs **schema registry**, **CI composition checks**, and **SLAs** between teams.

```graphql
type User @key(fields: "id") { id: ID! }
```

---

## Q57. What are the key concepts in Federation (entities, references, keys)?

**Answer:**

**Entities** are types split across subgraphs, identified by **`@key` fields**. **References** are fields returning entities another subgraph extends. **`@requires`**/`@provides`** (v2)** optimize data needs across subgraph boundaries.

**Router** stitches execution using **`Query._entities(representations:)`** batch calls.

**Trade-offs:** Incorrect **keys** cause **N+1 subgraph hops**—model **keys** on stable natural IDs.

```graphql
# Orders subgraph
type Order @key(fields: "id") { id: ID! productId: ID! }

# Products subgraph
extend type Product @key(fields: "id") { id: ID! title: String! }
```

---

## Q58. How does schema composition work in Federation?

**Answer:**

Subgraphs publish SDL to **Apollo Studio/Uplink**; **`rover supergraph compose`** merges into a **supergraph SDL** with **join directives** (`@join__graph`). The **router** consumes this artifact to **route** fields to subgraphs.

CI validates **composition errors** (key mismatches, impossible merges).

**Trade-offs:** **Breaking** subgraph changes can **block** composition—use **contracts** and **backward compatible** edits.

```bash
rover supergraph compose --config supergraph.yaml
```

---

## Q59. What is the difference between Federation v1 and v2?

**Answer:**

**Federation 2** adds **`@shareable`**, **`@interfaceObject`**, **`@override`**, **`@inaccessible`**, improved **validation**, and **more ergonomic** composition. It uses **updated join spec** and requires **router**/`gateway` versions that understand v2 directives.

Teams migrate by **incremental** subgraph upgrades following Apollo guides.

**Trade-offs:** v2 features fix **real pain** (interface across subgraphs) but increase **learning curve**.

```graphql
type User @key(fields: "id", resolvable: false) { id: ID! }
```

---

## Q60. What is schema stitching and how does it differ from Federation?

**Answer:**

**Schema stitching** (GraphQL Tools) **merges remote schemas** and lets you add **custom resolvers** to connect types—**centralized** integration in the gateway. **Federation** is **declarative** across **autonomous subgraphs** with standardized **`@key`** mechanics.

Stitching suits **integrating legacy** graphs; federation suits **greenfield microservices** with **consistent entity model**.

**Trade-offs:** Stitching can become a **big ball of glue** without governance.

```typescript
import { stitchSchemas } from "@graphql-tools/stitch";

export const schema = stitchSchemas({
  subschemas: [{ schema: await introspectSchema(executorA), executor: executorA }],
  typeMerging: { User: { selectionSet: "{ id }", fieldName: "user", key: (user) => user.id } },
});
```

---

## Q61. When should you use Federation vs schema stitching?

**Answer:**

Choose **Federation** when teams **own subgraphs** with **shared entity** model and you want **router-native** query planning. Choose **stitching** for **ad-hoc** integration, **third-party** schemas, or **smaller** teams without federation ops maturity.

**Hybrid** exists but **avoid** duplicating concepts—pick **one primary** integration style.

**Trade-offs:** Federation needs **investment**; stitching is **flexible** but can **centralize bottlenecks**.

---

## Q62. What is a GraphQL gateway?

**Answer:**

A **gateway** is the **public-facing** GraphQL endpoint that **routes** to subgraphs (federation), **stitches** schemas, handles **auth**, **rate limits**, **telemetry**, and **policy**. It’s the **BFF aggregation** point for clients.

**Apollo Router/Gateway** are common implementations; **custom** Node gateways exist.

**Trade-offs:** Gateways add **hop latency**—optimize with **batching** and **caching** carefully.

---

## Q63. How do you implement a BFF (Backend for Frontend) with GraphQL?

**Answer:**

Expose a **client-specific** graph (mobile vs web) or **slice** of the supergraph via **contracts**/**scopes**. Co-locate **UI-driven** fields (`homeFeed`) implemented by **aggregating** downstream services.

**Context** carries **device**, **feature flags**, and **auth** to shape responses.

**Trade-offs:** Too many BFFs **duplicate** logic—balance with **shared domain services**.

```typescript
homeFeed: async (_p, _a, ctx) => {
  const recs = await ctx.recService.forUser(ctx.user.id, { surface: ctx.clientName });
  return { sections: layoutFor(ctx.clientName, recs) };
},
```

---

## Q64. How do you integrate GraphQL with microservices?

**Answer:**

Use a **gateway** pattern: **subgraphs** wrap each service domain; **synchronous** GraphQL resolves call **gRPC/HTTP** clients with **timeouts/retries**. **Async** workflows use **events** to **invalidate caches** or **feed subscriptions**.

**SLA-aware** fallbacks prevent one slow service from stalling the whole graph (**partial responses** with `@defer` or nullable fields).

**Trade-offs:** **Chatty** subgraph calls cause **latency**—**batch entity resolution** via federation.

---

## Q65. How do you handle GraphQL with event-driven architecture?

**Answer:**

**Mutations** commit and **emit events**; **projections** update **read models** optimized for GraphQL queries. **Subscriptions** broadcast **domain events** after persistence.

**CQRS** fits: **write model** simple, **read model** tailored. **Idempotency** keys on mutations align with **at-least-once** consumers.

**Trade-offs:** **Eventual consistency** surfaces in **UI**—expose **`status`** fields and **polling** where needed.

```typescript
await db.order.create(data);
await bus.publish("order.created", { orderId: order.id });
```

---

## Q66. What is the CQRS pattern with GraphQL?

**Answer:**

**CQRS** splits **commands** (mutations) from **queries** (read models). GraphQL maps naturally: **mutations** append events/update write DB; **queries** read **denormalized** views maintained by workers.

Use **separate resolvers/services** so **complex joins** live in the read side.

**Trade-offs:** More **infrastructure**; **strong consistency** requires careful **read-your-writes** handling.

---

## Q67. How do you implement GraphQL over gRPC?

**Answer:**

Common approach: **internal services speak gRPC**; **subgraph** resolvers translate GraphQL→gRPC via **typed clients**. Alternatively, **grpc-graphql-gateway** generates GraphQL from **protobuf** for **internal** tooling.

Focus on **deadlines**, **metadata** propagation (tracing), and **error mapping** (`grpc status` → GraphQL errors).

**Trade-offs:** **JSON vs protobuf** impedance—**custom scalars** for `Timestamp`, `Decimal`.

```typescript
const user = await usersGrpc.getUser({ id }, { deadline: Date.now() + 500 });
```

---

## Q68. How do you handle GraphQL with REST APIs as data sources?

**Answer:**

Wrap REST with **typed clients**, **normalize errors**, and **batch** where the REST API supports **bulk endpoints**. Use **DataLoader** keyed by resource id; **cache** GETs with **ETags** if available.

**Avoid** chatty REST from per-field resolvers without batch endpoints—consider **aggregator** services.

**Trade-offs:** **REST pagination** may not match GraphQL cursors—**adapt** carefully.

```typescript
new DataLoader(async (ids) => {
  const res = await restClient.get("/users", { query: { ids: ids.join(",") } });
  return ids.map((id) => res.data.find((u: any) => u.id === id));
});
```

---

## Q69. What is a GraphQL mesh?

**Answer:**

**GraphQL Mesh** generates a **unified GraphQL** layer from **OpenAPI/gRPC/PostgreSQL** sources using **handlers** and **transforms**. It’s powerful for **rapid integration** of legacy APIs.

**Transforms** rename types, **filter** fields, and **link** types across sources.

**Trade-offs:** Generated graphs can be **noisy**—invest in **SDL transforms** and **documentation**.

```yaml
sources:
  - name: Petstore
    handler:
      openapi:
        source: ./petstore.yaml
```

---

## Q70. How do you implement a GraphQL API gateway?

**Answer:**

Deploy **Apollo Router** or **custom Express/Yoga** with **plugins** for **auth**, **rate limiting**, **metrics**, **field-level logging**, and **request ID** propagation. **Compose** subgraphs or **proxy** to a monolith initially.

Use **TLS termination** at the edge; **validate** introspection policy.

**Trade-offs:** Custom gateways **increase maintenance**—prefer **managed/router** where possible.

---

## Q71. What is Apollo Router and how does it differ from Apollo Gateway?

**Answer:**

**Apollo Router** is a **Rust**-based **high-performance** graph router; **Apollo Gateway** is **Node.js**. Router focuses on **low latency**, **resource efficiency**, and **enterprise** hardening; Gateway has a longer history in **ecosystem examples**.

Both consume **supergraph** SDL from **Uplink**/**file**.

**Trade-offs:** **Plugin ecosystem** differs—evaluate **Wasm plugins** (Router) vs **JS** (Gateway).

---

## Q72. How do you handle distributed tracing in GraphQL?

**Answer:**

Create a **root span** per HTTP request, **child spans** per resolver (sampled). Propagate **W3C `traceparent`** to subgraphs/gRPC **metadata**. Tag spans with **`operationName`**, **`service.name`**, **`graphql.field.path`**.

**Federation:** ensure **subgraph requests** include trace context.

**Trade-offs:** **Per-field** tracing is **noisy**—**sample** and **aggregate**.

```typescript
context: ({ req }) => {
  const ctx = propagation.extract(context.active(), req.headers);
  return { traceContext: ctx };
};
```

---

## Q73. What is OpenTelemetry integration with GraphQL?

**Answer:**

**OpenTelemetry** provides **vendor-neutral** traces/metrics/logs. Use **`@opentelemetry/instrumentation-graphql`** to auto-instrument resolver spans; combine with **HTTP** and **DB** instrumentations for **end-to-end** traces.

Export to **Jaeger**, **Tempo**, **Honeycomb**, etc.

**Trade-offs:** Auto instrumentation may **miss business attributes**—add **manual** span attributes for **domain** IDs.

```typescript
registerInstrumentations({ instrumentations: [new GraphQLInstrumentation()] });
```

---

## Q74. How do you implement health checks in a GraphQL server?

**Answer:**

Expose **`GET /healthz`** (liveness) and **`/readyz`** (readiness) **outside** GraphQL or as **`Query._health`** excluded from public schema. Readiness checks **DB**, **Redis**, **subgraph** reachability.

**Kubernetes** uses probes—keep them **fast** and **non-spammy**.

**Trade-offs:** Deep checks in liveness can **restart** pods during transient blips—**separate** concerns.

```typescript
app.get("/readyz", async (_req, res) => {
  try {
    await db.ping();
    res.send("ok");
  } catch {
    res.status(503).send("not ready");
  }
});
```

---

## Q75. How do you handle graceful shutdown in GraphQL servers?

**Answer:**

On **SIGTERM**, stop accepting new connections, **close WebSocket** servers with **drain** period, await **in-flight** requests with a **timeout**, then **dispose** DB pools and **flush** telemetry.

**Kubernetes** `terminationGracePeriodSeconds` must exceed **drain + max request** time.

**Trade-offs:** Hard kills lose **in-flight** work—**idempotent** mutations help.

```typescript
async function shutdown() {
  server.close();
  await subscriptionServer.dispose();
  await closeHttpServerWithTimeout(httpServer, 30_000);
  await pool.end();
}
process.on("SIGTERM", shutdown);
```

---

## Q76. What are the main security concerns in GraphQL?

**Answer:**

Key risks: **introspection** leakage, **arbitrary deep/costly queries** (DoS), **authorization gaps** (field-level), **batching attacks**, **CSRF** on cookie-based auth, **information disclosure** via verbose errors, and **resolver injection** into downstream SQL/NoSQL.

**Defense in depth:** gateway limits, **authn/z**, **input validation**, **least privilege** data sources, **logging** without secrets.

**Trade-offs:** Strict limits impact **DX**—provide **trusted** paths (persisted queries) for first-party apps.

---

## Q77. How do you prevent GraphQL injection attacks?

**Answer:**

**Never** concatenate user input into **SQL/Cypher/Gremlin**—use **parameterized queries**. For **dynamic order** fields, **whitelist** columns. Sanitize **file paths** for uploads.

Treat GraphQL **arguments** as **untrusted** like any HTTP input.

**Trade-offs:** Whitelists require **updates** when schema evolves—encode in **tests**.

```typescript
const SORTABLE = new Set(["created_at", "id"]);
if (!SORTABLE.has(args.sortBy)) throw new UserInputError("INVALID_SORT");
```

---

## Q78. What is introspection and should you disable it in production?

**Answer:**

**Introspection** lets clients query **`__schema`** to discover types—essential for **GraphiQL** and **codegen**. In **public** APIs, attackers can map the **attack surface**.

Many teams **disable introspection** outside trusted networks or **gate** it behind **auth/admin**. **Note:** skilled attackers can still infer fields via **errors/timing**—introspection is not your only risk.

**Trade-offs:** Disabling breaks **some** client tooling—provide **SDL** via **secure CI** channels.

```typescript
const introspectionAllowed = process.env.NODE_ENV !== "production" || ctx.user?.isAdmin;
if (!introspectionAllowed) throw new GraphQLError("INTROSPECTION_DISABLED");
```

---

## Q79. How do you implement authentication in GraphQL?

**Answer:**

Authenticate **once per request** (JWT in `Authorization`, cookies with **CSRF** protections) in **HTTP middleware**, attach **`user`**/`scopes` to **context**. Avoid per-field token parsing unless **multi-identity** patterns.

**Subscriptions:** authenticate at **connection**.

**Trade-offs:** **Context** must be **immutable** per request—**no global** user state.

```typescript
context: async ({ req }) => {
  const user = await authenticateBearer(req.headers.authorization);
  return { user, loaders: createLoaders(user) };
},
```

---

## Q80. How do you implement field-level authorization?

**Answer:**

Combine **schema directives** with **central policy** functions. Resolvers call **`authorize(ctx.user, "post:read", post)`** using **ABAC/RBAC**. Hide **fields** entirely vs returning **errors**—GraphQL often uses **redaction** (`null`) for lists to avoid leaking existence.

**Federation:** enforce at **subgraph** that owns the data.

**Trade-offs:** **Partial nulls** can confuse clients—document **behavior**.

```typescript
if (!can(ctx.user, "view:salary", user)) return null;
```

---

## Q81. What is the @auth directive pattern?

**Answer:**

Define **`directive @auth(roles: [Role!]) on FIELD_DEFINITION`**, transform schema to **wrap resolvers** checking **roles** before execution. Alternatively use **`graphql-shield`** rule objects mapped to types/fields.

Keeps authorization **declarative** and **reviewable** in SDL.

**Trade-offs:** Directives may **hide** imperative edge cases—**escape hatch** to custom rules.

```graphql
type Mutation {
  deleteUser(id: ID!): Boolean! @auth(roles: [ADMIN])
}
```

---

## Q82. How do you prevent denial-of-service through expensive queries?

**Answer:**

Apply **depth limits**, **complexity/cost limits**, **timeouts**, **pagination caps**, and **persisted/allowed queries** for public APIs. Monitor **p95** resolver times and **auto-block** abusive keys.

**Rate limit** by **complexity units**, not only request count.

**Trade-offs:** Aggressive defaults **break** legitimate power users—**tiered** limits.

---

## Q83. What is query whitelisting?

**Answer:**

**Whitelisting** allows only **pre-registered** operations (often via **persisted queries** or **manual manifests**). Unknown query strings are **rejected**. Strongest protection against **ad-hoc** query bombs.

**Trade-offs:** **Blocks** ad-hoc GraphiQL in prod—use **separate** admin endpoints.

```typescript
if (!allowedHashes.has(hash)) throw new GraphQLError("OPERATION_NOT_ALLOWED");
```

---

## Q84. How do you handle CORS in GraphQL?

**Answer:**

Configure **CORS** at the HTTP server: restrict **`Access-Control-Allow-Origin`** to known web apps; **`credentials: true`** requires **non-wildcard** origins. Preflight **OPTIONS** must succeed for browser clients.

**GraphQL** typically uses **single endpoint**—CORS rules are standard HTTP concerns.

**Trade-offs:** Misconfigured CORS breaks **web clients** or **opens** APIs—test with **browser** preflights.

```typescript
app.use(cors({ origin: ["https://app.example.com"], credentials: true }));
```

---

## Q85. How do you implement CSRF protection in GraphQL?

**Answer:**

For **cookie-based** sessions, require **CSRF tokens** on **state-changing** requests or use **`SameSite=strict/lax`** cookies appropriately. **Double-submit cookie** or **synchronizer token** patterns apply.

Avoid **GET** mutations; ensure **CORS** + **credentials** policies align.

**Trade-offs:** **JWT in Authorization header** avoids CSRF but shifts risks to **XSS**—**HttpOnly** cookies vs tokens is a broader trade-off.

```typescript
if (ctx.session && !validCsrf(req)) throw new GraphQLError("CSRF");
```

---

## Q86. What is schema masking?

**Answer:**

**Schema masking** removes **internal** types/fields from **public** introspection or **separate** schema views per client role (**contracts**). Tools can **filter** SDL based on **tags** (`@inaccessible`, `@deprecated` internal).

Helps **partner APIs** where full schema shouldn’t leak.

**Trade-offs:** **Dual schema** maintenance—**automate** with **federation `@inaccessible`** (internal fields).

```graphql
type User {
  id: ID!
  email: String! @inaccessible
}
```

---

## Q87. How do you handle sensitive data in GraphQL responses?

**Answer:**

**Minimize** exposed fields, **redact** logs, **encrypt** at rest/in transit, and **mask** errors (no stack traces to clients). Use **field auth** and **audit** access to PII.

**Avoid** returning **secrets** even when authenticated—**clients leak**.

**Trade-offs:** **Verbose** debugging vs **privacy**—use **internal trace IDs** only.

```typescript
formatError: (err) => {
  logger.error({ err, requestId: ctx.id });
  return new GraphQLError("INTERNAL_ERROR", { extensions: { requestId: ctx.id } });
},
```

---

## Q88. What are security best practices for GraphQL subscriptions?

**Answer:**

**Authenticate** connection; **authorize** each event; **filter** topics; **rate limit** connection attempts; **validate** payload sizes; **avoid** exposing internal IDs in subscription variables without checks.

Assume **long-lived** sessions can be **stolen**—**rotate** tokens.

**Trade-offs:** **Topic explosion** if every user subscribes uniquely—**design** channel granularity carefully.

---

## Q89. How do you implement API key authentication for GraphQL?

**Answer:**

Accept **`x-api-key`** header or **`Authorization: ApiKey ...`**, validate against **hashed keys** in DB/Redis, attach **scopes** to context. **Rotate** keys; **monitor** usage per key.

**Rate limit** per key more aggressively than **user auth**.

**Trade-offs:** API keys are **long-lived secrets**—prefer **OAuth** for third-party **user** delegation.

```typescript
const key = req.headers["x-api-key"];
const client = await apiKeys.verify(key);
if (!client) throw new AuthenticationError();
```

---

## Q90. How do you audit and log GraphQL operations?

**Answer:**

Log **`operationName`**, **hashed** query text, **variables** (scrub secrets), **`user.id`**, **IP**, **`requestId`**, **duration**, and **error codes**. Ship to **SIEM**; **sample** high volume.

**Avoid** logging **full** credit card numbers or **passwords** even in variables.

**Trade-offs:** **PII** in logs creates **compliance** debt—**structured** logging with **redaction** pipelines.

```typescript
plugins: [
  {
    requestDidStart: async () => ({
      willSendResponse: async (ctx) => {
        logger.info({
          op: ctx.request.operationName,
          dur: ctx.response.http?.extensions?.tracing?.duration,
          user: ctx.contextValue.user?.id,
        });
      },
    }),
  },
],
```

---

## Q91. How do you unit test GraphQL resolvers?

**Answer:**

**Isolate** resolver functions and call them with **mocked context** and **parent objects**. Use **`graphql`’s `execute`** against a **small schema** snippet for integration-ish tests.

**Mock** DataLoader with **manual** `load` implementations per test.

**Trade-offs:** Over-mocking hides **schema wiring** bugs—add **narrow integration** tests.

```typescript
import { graphql } from "graphql";

test("user email redacted", async () => {
  const res = await graphql({
    schema,
    source: `query { user(id:"1"){ email } }`,
    contextValue: { user: { id: "2", role: "USER" }, loaders: mockLoaders },
  });
  expect(res.errors?.[0]?.message).toMatch(/FORBIDDEN/);
});
```

---

## Q92. How do you integration test a GraphQL API?

**Answer:**

Spin **test DB** or **Testcontainers**, boot **HTTP server** on random port, issue **real HTTP** GraphQL requests with **supertest**/**fetch**. Assert **data** and **errors** JSON.

**Seed** minimal fixtures; **truncate** between tests or use **transactions**.

**Trade-offs:** Slower than unit tests—run in **CI parallel** shards.

```typescript
const res = await request(app)
  .post("/graphql")
  .send({ query: `mutation { login(input:{...}){ token } }` })
  .expect(200);
expect(res.body.data.login.token).toBeTruthy();
```

---

## Q93. What is schema validation testing?

**Answer:**

**Schema validation tests** ensure SDL changes are **backward compatible**, **lint rules** pass, and **federation composition** succeeds. Tools: **`graphql-inspector` diff**, **`@graphql-eslint`**, **`rover subgraph check`**.

CI fails on **breaking** changes unless **intentional** with **migrations**.

**Trade-offs:** **False positives** on harmless changes—tune **rules** and **exceptions**.

```bash
graphql-inspector diff "git:origin/master:schema.graphql" "schema.graphql"
```

---

## Q94. How do you mock GraphQL APIs for frontend testing?

**Answer:**

Use **MSW** to intercept HTTP and return **fixture** GraphQL responses; **MockedProvider** (Apollo) for **component** tests; **schema-based mocking** with **`@graphql-tools/mock`** for **randomized** data shaped by schema.

Ensure mocks match **production errors** and **pagination** shapes.

**Trade-offs:** Overly **optimistic** mocks hide **real latency** and **errors**—add **error** scenarios.

```typescript
const mocks = {
  Query: () => ({ me: () => ({ id: "1", name: "Ada" }) }),
};
addMocksToSchema({ schema, mocks });
```

---

## Q95. What is the Apollo testing library?

**Answer:**

**`@apollo/client/testing`** provides **`MockedProvider`** that supplies a **mocked Apollo cache/link** for React tests. You declare **`request`/`result`** pairs to assert components **issue** expected operations.

**Trade-offs:** Tests **Apollo-specific** behavior—pair with **MSW** for **transport** realism.

```tsx
<MockedProvider mocks={[{ request: { query: MeQuery }, result: { data: { me: { id: "1" } } } }]}>
  <Profile />
</MockedProvider>
```

---

## Q96. How do you implement CI/CD for GraphQL APIs?

**Answer:**

Pipeline stages: **lint SDL**, **run unit/integration tests**, **`graphql-inspector` diff** against **production** schema, **`rover subgraph publish`**, **compose supergraph**, **deploy** with **canary**, **smoke test** persisted operations, **rollback** if error rates spike.

Store **artifacts**: schema, **operation manifests**, **migration** scripts.

**Trade-offs:** **Schema checks** add time—**cache** dependencies and **parallelize**.

---

## Q97. What are schema linting tools?

**Answer:**

**`graphql-eslint`** applies **style and safety rules** (`require-description`, `no-anonymous-operations`, `strict-id-in-types`). Integrates with **ESLint** for **developer feedback** and **CI**.

**Custom rules** can encode **org policies** (e.g., mutations must return payloads).

**Trade-offs:** **Lint debt** if rules too strict—**incremental** adoption.

```json
{
  "overrides": [{ "files": ["*.graphql"], "parser": "@graphql-eslint/eslint-plugin", "plugins": ["@graphql-eslint"], "rules": { "@graphql-eslint/require-description": "error" } }]
}
```

---

## Q98. How do you handle database migrations with GraphQL?

**Answer:**

GraphQL is **not** your migration tool—use **SQL migration frameworks** (Flyway, Prisma Migrate, Liquibase). Coordinate **schema deploys**: **expand** DB (new nullable columns) → deploy **GraphQL** reading both → **backfill** → **contract** (remove old fields) in **lockstep** with clients.

**Feature flags** gate **new resolvers** reading new columns.

**Trade-offs:** **Expand/contract** requires **discipline**—avoid **big bang** DB cuts.

---

## Q99. How do you implement blue-green deployments for GraphQL servers?

**Answer:**

Run **two** identical environments; switch **load balancer** traffic after **health/readiness** checks. Ensure **shared** dependencies (DB migrations **backward compatible**, **Redis**) support both versions.

**Persisted queries** should exist on **both** sides; **router** config must match.

**Trade-offs:** **WebSocket** sessions may **stick**—**drain** old color before cut.

```text
LB ──► Blue (vN)   /   Green (vN+1)
         ▲ switch when green healthy
```

---

## Q100. What are the best monitoring tools and practices for GraphQL in production?

**Answer:**

Use **APM** (Datadog, New Relic, Honeycomb) with **OpenTelemetry**, **Apollo Studio** for **operation metrics** and **field usage**, and **SLOs** on **latency**, **error budget**, and **subscription connection churn**. Dashboard **p95** by **`operationName`**, **top slow fields**, and **gateway→subgraph** spans.

Alert on **error rate spikes**, **complexity rejections**, and **saturation** (CPU, event loop lag). **Runbooks** for **disable introspection**, **tighten limits**, and **rollback** router config.

**Trade-offs:** **High-cardinality** fields explode costs—**aggregate** and **sample**.

```yaml
# Example SLO sketch
objectives:
  - name: graphql-availability
    target: 99.9%
    sli: successful_operations / total_operations
```

---

*End of document — 100 questions.*
