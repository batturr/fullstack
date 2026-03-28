# N+1 Query Problem and Optimization

## 📑 Table of Contents

- [19.1 N+1 Problem](#191-n1-problem)
  - [19.1.1 Problem Definition](#1911-problem-definition)
  - [19.1.2 Impact on Performance](#1912-impact-on-performance)
  - [19.1.3 Real-World Examples](#1913-real-world-examples)
  - [19.1.4 Identifying N+1 Issues](#1914-identifying-n1-issues)
  - [19.1.5 Measurement Tools](#1915-measurement-tools)
- [19.2 DataLoader Pattern](#192-dataloader-pattern)
  - [19.2.1 DataLoader Basics](#1921-dataloader-basics)
  - [19.2.2 Batch Loading](#1922-batch-loading)
  - [19.2.3 Cache Management](#1923-cache-management)
  - [19.2.4 Async Batching](#1924-async-batching)
  - [19.2.5 DataLoader Usage](#1925-dataloader-usage)
- [19.3 Database Optimization](#193-database-optimization)
  - [19.3.1 Query Joins](#1931-query-joins)
  - [19.3.2 Eager Loading](#1932-eager-loading)
  - [19.3.3 Lazy Loading](#1933-lazy-loading)
  - [19.3.4 Select Query Optimization](#1934-select-query-optimization)
  - [19.3.5 Index Strategy](#1935-index-strategy)
- [19.4 Caching Strategy](#194-caching-strategy)
  - [19.4.1 Application-Level Caching](#1941-application-level-caching)
  - [19.4.2 Database Query Caching](#1942-database-query-caching)
  - [19.4.3 Redis Integration](#1943-redis-integration)
  - [19.4.4 Cache Invalidation](#1944-cache-invalidation)
  - [19.4.5 Distributed Caching](#1945-distributed-caching)
- [19.5 Query Planning](#195-query-planning)
  - [19.5.1 Query Analysis](#1951-query-analysis)
  - [19.5.2 Execution Planning](#1952-execution-planning)
  - [19.5.3 Cost Estimation](#1953-cost-estimation)
  - [19.5.4 Optimization Strategies](#1954-optimization-strategies)
  - [19.5.5 Monitoring](#1955-monitoring)
- [19.6 Advanced Optimization](#196-advanced-optimization)
  - [19.6.1 Query Parallelization](#1961-query-parallelization)
  - [19.6.2 Streaming Large Results](#1962-streaming-large-results)
  - [19.6.3 Pagination Strategy](#1963-pagination-strategy)
  - [19.6.4 Partial Query Loading](#1964-partial-query-loading)
  - [19.6.5 Progressive Loading](#1965-progressive-loading)

---

## 19.1 N+1 Problem

### 19.1.1 Problem Definition

#### Beginner

The **N+1 problem** happens when your server runs **one query** to load a list (the “1”) and then **N additional queries**—one per item—to load related data. In GraphQL this often appears when a list field resolver fetches parents, and a nested field resolver fetches each child row separately.

#### Intermediate

GraphQL executes a resolver per field. If `posts` returns 100 posts and `Post.author` runs a DB lookup per post, you get **1 + 100** database round-trips unless you batch or join. The problem is not GraphQL itself but **how resolvers map to data access**.

#### Expert

N+1 is a **resolver granularity** issue: independent field resolvers compose well for modularity but default to **per-object IO** unless you introduce batching, lookahead, or SQL-level eager loading. The same pattern exists in REST ORMs (lazy associations); GraphQL makes it visible because clients can request arbitrary shapes.

```graphql
query Feed {
  posts {
    id
    title
    author {
      id
      name
    }
  }
}
```

```javascript
// Naive pattern: N+1 on authors
const resolvers = {
  Query: {
    posts: () => db.query("SELECT id, title, author_id FROM posts LIMIT 100"),
  },
  Post: {
    author: (post) =>
      db.query("SELECT * FROM authors WHERE id = $1", [post.author_id]),
  },
};
```

#### Key Points

- “1” query for the collection, “N” queries for each related entity.
- Occurs when child resolvers fetch one row at a time.
- Fixing it means batching, joining, or prefetching—not removing GraphQL.

#### Best Practices

- Assume every list field can return many rows; design data access accordingly.
- Document which fields are “expensive” for internal teams.
- Prefer batch APIs in resolvers over per-row ORM lazy loads.

#### Common Mistakes

- Blaming GraphQL instead of resolver data access.
- Using ORM lazy relations inside field resolvers without `DataLoader`.
- Returning huge lists without pagination, amplifying N+1 cost.

---

### 19.1.2 Impact on Performance

#### Beginner

Each extra database round-trip adds **latency** (network + DB). With 100 nested lookups, total time grows roughly with **N × per-query latency**, and your database may run out of connections under load.

#### Intermediate

N+1 inflates **QPS to the database**, increases **CPU** for query parsing, and can trigger **connection pool exhaustion**. p95 latency spikes when a popular query asks for a deep graph over many list items.

#### Expert

At scale, N+1 changes **tail latency** more than averages: a single client document can fan out to thousands of SQL statements. **Head-of-line blocking** in pools, **lock contention**, and **cache stampede** on shared hot keys compound the issue. Cost models should include DB statements per request, not just resolver count.

```javascript
// Rough timing model (illustrative)
async function naiveResolveMs(postCount, dbRoundTripMs) {
  return (1 + postCount) * dbRoundTripMs;
}

// Example: 200 posts, 2ms RTT → ~402ms DB wait alone
console.log(naiveResolveMs(200, 2));
```

```javascript
import { performance } from "node:perf_hooks";

function wrapDb(db) {
  let statements = 0;
  return {
    async query(sql, params) {
      statements += 1;
      const t0 = performance.now();
      const rows = await db.query(sql, params);
      return { rows, _ms: performance.now() - t0, _statements: statements };
    },
    getStatementCount() {
      return statements;
    },
  };
}
```

#### Key Points

- Cost scales with list size × nested fetches.
- Connection pools and DB CPU become bottlenecks.
- Tail latency dominates user experience for large graphs.

#### Best Practices

- Track **SQL count per GraphQL operation** in dev/staging.
- Set **pagination defaults** on list fields.
- Load-test with realistic selection sets, not only trivial queries.

#### Common Mistakes

- Optimizing JS CPU while ignoring DB round-trips.
- Measuring only average latency on small datasets.
- Allowing unbounded list fields in public APIs.

---

### 19.1.3 Real-World Examples

#### Beginner

**Social feed:** `posts { comments { author } }` can explode into many queries if each comment loads its author separately. **E‑commerce:** `orders { lineItems { product } }` repeats product lookups.

#### Intermediate

**BFF-to-GraphQL:** a mobile app requests a rich screen in one operation; without batching, the gateway triggers one query per entity. **Microservices:** federated subgraphs may call REST upstreams per field—another form of N+1 over HTTP.

#### Expert

**GraphQL over SQL views** without dataloader still N+1s if views hide joins. **Prisma/TypeORM** lazy relations in resolvers are a frequent source. **Subscription payloads** that re-resolve fields can replay N+1 for every event unless cached or denormalized.

```graphql
query OrderScreen($id: ID!) {
  order(id: $id) {
    id
    lineItems {
      id
      quantity
      product {
        id
        name
        price
      }
    }
  }
}
```

```javascript
// Microservice-style N+1 over HTTP
const resolvers = {
  LineItem: {
    product: async (line) => {
      const res = await fetch(`https://catalog/products/${line.productId}`);
      return res.json();
    },
  },
};
```

#### Key Points

- Deep selection sets multiply resolver calls.
- HTTP and DB both suffer from per-item fetches.
- Federation and microservices do not remove the pattern.

#### Best Practices

- Co-locate product/order access patterns in integration tests.
- Use **bulk catalog** endpoints behind a single batch loader.
- Prefer **DataLoader** per request for cross-service fan-out.

#### Common Mistakes

- Caching GraphQL responses without fixing per-field fan-out.
- Sharing singleton loaders across requests (wrong cache scope).
- Ignoring N+1 in background jobs that reuse schema code.

---

### 19.1.4 Identifying N+1 Issues

#### Beginner

Watch **SQL logs** while running a query in GraphiQL: if you see the same `SELECT` repeated with different IDs, you likely have N+1. Add temporary **counters** in dev resolvers.

#### Intermediate

Use **APM** (OpenTelemetry, Datadog) with DB instrumentation; compare **span count** to result size. **GraphQL plugins** can log resolver counts and field paths. **EXPLAIN** plans show repeated index lookups.

#### Expert

**Resolver tracing** (Apollo Studio, graphql-ws with custom metrics) attributes time per field. **Statement pipelining** in drivers can hide latency but not query count—always measure **statements executed**. For Prisma, enable query logging; for Knex, use `debug: true` in staging.

```javascript
function createN1DetectorPlugin() {
  const counts = new Map();
  return {
    requestDidStart() {
      return {
        willResolveField({ info }) {
          const path = info.path.key;
          counts.set(path, (counts.get(path) ?? 0) + 1);
        },
        async willSendResponse() {
          console.table(Object.fromEntries(counts));
        },
      };
    },
  };
}
```

```javascript
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
let queryCount = 0;
const orig = pool.query.bind(pool);
pool.query = (...args) => {
  queryCount += 1;
  return orig(...args);
};

export { pool, queryCount };
```

#### Key Points

- Repeated similar SQL with varying parameters is the smoking gun.
- Resolver invocation counts should correlate with graph shape, not row count.
- Staging should mirror production query patterns.

#### Best Practices

- Add CI checks that fail when a test exceeds a **max SQL count**.
- Log `operationName` + SQL count on slow requests.
- Review new list fields in code review with data-access notes.

#### Common Mistakes

- Relying on production logs without representative queries.
- Confusing GraphQL field count with SQL count.
- Disabling query logging in environments where you debug performance.

---

### 19.1.5 Measurement Tools

#### Beginner

**Database logs**, **ORM debug mode**, and simple **timers** around resolvers are enough to start. GraphQL Playground/Apollo Sandbox shows execution time for the whole operation, not per field—use server plugins for detail.

#### Intermediate

**OpenTelemetry** + **Jaeger** traces show parallel vs sequential DB calls. **pg_stat_statements** aggregates expensive queries. **clinic.js** helps find event-loop stalls when resolvers await many sequential IOs.

#### Expert

**Automatic query complexity** plugins estimate cost before execution; pair with **field-level tracing** and **sampling** in prod. For **DataLoader**, expose batch sizes and cache hit rates. Use **slo-based alerts** on p95 operation latency and DB query count per operation.

```javascript
import { ApolloServer } from "@apollo/server";
import { usageReportingPlugin } from "@apollo/server/plugin/usageReporting";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    usageReportingPlugin({
      sendVariableValues: { none: true },
      sendHeaders: { none: true },
    }),
  ],
});
```

```javascript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

#### Key Points

- Combine GraphQL-level tracing with DB-level stats.
- Production needs sampling to control overhead.
- DataLoader metrics validate that batching works.

#### Best Practices

- Define SLOs for “max DB statements per operation” per endpoint class.
- Dashboard SQL count vs. operation name.
- Reproduce production operations in load tests.

#### Common Mistakes

- Measuring only wall time without statement count.
- Turning on full resolver tracing at 100% traffic.
- Ignoring batch size (too large batches hurt too).

---

## 19.2 DataLoader Pattern

### 19.2.1 DataLoader Basics

#### Beginner

**DataLoader** batches many individual `load(id)` calls into **one function** that receives **all IDs** and returns **values in the same order**. It is the standard Node pattern to cure N+1 in GraphQL.

#### Intermediate

Create **one DataLoader instance per request** so caches do not leak between users. Each loader wraps a `batchFn(keys)` that must return a `Promise` of an array with the same length as `keys`, with `null`/`Error` for missing entries as designed.

#### Expert

DataLoader uses **microtask queue dispatch**: calls in the same tick batch together. Custom **`cacheKeyFn`** supports composite keys. For **unordered stores**, map results back to keys explicitly. Watch **error handling**: throwing in batch fails the whole batch unless you split per-key errors with `Promise.allSettled` patterns.

```javascript
import DataLoader from "dataloader";

function createUserLoader(db) {
  return new DataLoader(async (ids) => {
    const rows = await db.query(
      "SELECT * FROM users WHERE id = ANY($1::int[])",
      [ids],
    );
    const map = new Map(rows.map((r) => [r.id, r]));
    return ids.map((id) => map.get(id) ?? new Error(`User ${id} not found`));
  });
}
```

```javascript
// Per-request context (Express-style)
app.use((req, res, next) => {
  req.loaders = {
    user: createUserLoader(db),
    post: createPostLoader(db),
  };
  next();
});
```

#### Key Points

- Batch function receives many keys at once.
- Per-request instances avoid cross-user cache bleed.
- Order of results must align with order of keys.

#### Best Practices

- One loader per entity type per request.
- Use primary keys as loader keys.
- Document loader scope in your GraphQL context factory.

#### Common Mistakes

- Reusing loaders across requests (stale or leaked data).
- Returning wrong length from batch function.
- Using non-unique keys without `cacheKeyFn`.

---

### 19.2.2 Batch Loading

#### Beginner

Batch loading means **one SQL `WHERE id IN (...)`** (or a join) instead of N separate queries. DataLoader collects IDs until the end of the current event loop tick, then calls your batch function once.

#### Intermediate

Choose **chunk sizes** for very large batches (e.g., 500 IDs) to avoid oversized SQL packets. For **multi-column keys**, serialize keys or use tuple `IN` syntax supported by your DB. Handle **duplicates**: DataLoader dedupes keys before batching.

#### Expert

**Prime** loaders after a parent query that already fetched children: `loader.prime(id, row)` avoids duplicate work. For **heterogeneous fetches**, sometimes multiple loaders or a **single batch table** with a type discriminator is simpler than overloading one loader.

```javascript
import DataLoader from "dataloader";

function createPostLoader(db) {
  return new DataLoader(async (ids) => {
    const unique = [...new Set(ids)];
    const { rows } = await db.query(
      "SELECT * FROM posts WHERE id = ANY($1::uuid[])",
      [unique],
    );
    const map = new Map(rows.map((r) => [r.id, r]));
    return ids.map((id) => map.get(id));
  });
}
```

```javascript
// Prime after list query
const posts = await db.query("SELECT * FROM posts WHERE author_id = $1", [aid]);
const loader = context.loaders.post;
for (const p of posts) loader.prime(p.id, p);
```

#### Key Points

- Deduplication happens before your batch runs.
- Prime when you already have entities in memory.
- Chunk huge batches for driver/DB limits.

#### Best Practices

- Index columns used in `IN` clauses.
- Keep batch SQL parameterized.
- Log batch sizes during performance tuning.

#### Common Mistakes

- Selecting `SELECT *` inside huge batches.
- Forgetting to handle missing rows (null vs error policy).
- Batching across unrelated types in one opaque loader.

---

### 19.2.3 Cache Management

#### Beginner

DataLoader caches each `load(key)` result **for the lifetime of that loader instance**. If data changes mid-request, call **`clear(key)`** or **`clearAll()`** before reloading.

#### Intermediate

Use **`cache: false`** for highly volatile reads or when memory is tight—batching still works, caching does not. Replace global memoization with **request-scoped** loaders to prevent stale cross-request data.

#### Expert

For **mutations** in the same request, update caches: `prime` new values, `clear` on deletes. In **subscriptions**, use separate loader scope per event or disable cache. **LRU** loaders can be built by wrapping DataLoader or using short-lived contexts.

```javascript
const loader = new DataLoader(batchFn, { cache: false });
```

```javascript
async function updateUserEmail(loader, db, userId, email) {
  const row = await db.query(
    "UPDATE users SET email = $2 WHERE id = $1 RETURNING *",
    [userId, email],
  );
  loader.clear(userId);
  loader.prime(userId, row.rows[0]);
  return row.rows[0];
}
```

#### Key Points

- Default in-memory cache is per loader instance.
- `clear`/`prime` keep cache coherent with writes.
- `cache: false` still batches within a tick.

#### Best Practices

- Clear affected keys after mutations.
- Avoid long-lived loaders in workers unless you accept staleness.
- Document cache semantics for each loader.

#### Common Mistakes

- Expecting cache to survive across HTTP requests.
- Never clearing after updates (stale reads in same request).
- Using `clearAll` excessively (defeats batching benefits).

---

### 19.2.4 Async Batching

#### Beginner

DataLoader batches **synchronous calls in the same tick**; `await` between `load` calls still often batches if they occur before dispatch—understand that **tick boundaries** flush the batch.

#### Intermediate

**Nested async** resolvers: multiple `await` levels can split batches if timers or `setImmediate` interleave. Avoid **unnecessary awaits** before finishing all `load` calls for a given object graph level when possible.

#### Expert

**graphql-js** executes sibling fields in parallel; DataLoader merges loads across concurrent resolvers in the same tick. For **streaming** or **@defer**, batch boundaries differ—validate loader behavior with tracing. Custom **dispatchBatch** scheduling is rarely needed but possible via forked patterns.

```javascript
async function resolveFriends(user, _, ctx) {
  const ids = user.friendIds;
  return Promise.all(ids.map((id) => ctx.loaders.user.load(id)));
}
```

```javascript
// Anti-pattern: serial awaits can reduce batching opportunity
async function resolveFriendsSerial(user, _, ctx) {
  const out = [];
  for (const id of user.friendIds) {
    out.push(await ctx.loaders.user.load(id));
  }
  return out;
}
```

#### Key Points

- Same-tick loads batch; artificial delays split batches.
- Parallel field execution helps batching.
- Serial `await` in loops may still batch within each iteration’s tick—profile it.

#### Best Practices

- Prefer `Promise.all` over serial loops when order does not matter.
- Avoid `setTimeout` between loads in the same resolver chain.
- Test batch sizes under concurrent resolver load.

#### Common Mistakes

- Assuming one resolver call equals one batch flush.
- Adding sleeps for “optimization.”
- Mixing sync and async DataLoader implementations incorrectly.

---

### 19.2.5 DataLoader Usage

#### Beginner

In GraphQL context, expose `loaders` and use them in type resolvers: `Post: { author: (p, _, ctx) => ctx.loaders.user.load(p.authorId) }`.

#### Intermediate

Wire DataLoader in **Apollo Server** `context: ({ req }) => ({ loaders: makeLoaders(db, req) })`. For **NestJS**, use request-scoped providers. For **schema stitching**, ensure subgraphs use loaders toward databases, not toward gateway per row.

#### Expert

**Federation**: resolve references with bulk entity fetchers (`entities(representations)`) where possible. **dataloader** with **read replicas**: route batches to replicas, writes to primary. Combine with **query complexity** limits to cap batch sizes from malicious queries.

```javascript
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

const server = new ApolloServer({ typeDefs, resolvers });

await server.start();
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({
      loaders: {
        user: createUserLoader(req.db),
        post: createPostLoader(req.db),
      },
    }),
  }),
);
```

```graphql
type Post {
  id: ID!
  author: User!
}

extend type User @key(fields: "id") {
  id: ID! @external
}
```

#### Key Points

- Context factory is the right place to instantiate loaders.
- Framework integration should preserve per-request scope.
- Federation benefits from bulk entity resolvers.

#### Best Practices

- Factory `makeLoaders(db)` keeps tests simple.
- Type resolvers stay thin: delegate to loaders.
- Review loader coverage in PRs for new relations.

#### Common Mistakes

- Passing DB pools without per-request loaders.
- Missing loaders on subscription contexts.
- Using REST calls inside loaders without timeouts/retries.

---

## 19.3 Database Optimization

### 19.3.1 Query Joins

#### Beginner

A **JOIN** fetches related rows in **one round-trip**. For `posts` + `authors`, `SELECT ... FROM posts JOIN authors ON ...` avoids N separate author queries.

#### Intermediate

Be careful with **join fan-out**: joining one-to-many can duplicate parent rows; use **subqueries**, **`json_agg`**, or **two queries** (posts, then authors by ID list) instead of huge duplicated joins.

#### Expert

**GraphQL query** shape may not match one join tree. **Lookahead** (`graphql-parse-resolve-info`, `graphql-fields`) inspects the requested fields to build dynamic SQL. **ORMs** like Prisma `include` generate joins or batched queries—verify with logging.

```sql
SELECT p.id, p.title, a.id AS author_id, a.name
FROM posts p
JOIN authors a ON a.id = p.author_id
WHERE p.published = true
LIMIT 50;
```

```javascript
import graphqlFields from "graphql-fields";

const resolvers = {
  Query: {
    posts: (parent, args, ctx, info) => {
      const fields = graphqlFields(info);
      const needAuthor = Boolean(fields.author);
      if (needAuthor) {
        return ctx.db.query(`
          SELECT p.*, row_to_json(a.*) AS author
          FROM posts p
          JOIN authors a ON a.id = p.author_id
          LIMIT 50
        `);
      }
      return ctx.db.query(`SELECT * FROM posts LIMIT 50`);
    },
  },
};
```

#### Key Points

- Joins reduce round-trips but can multiply rows.
- Dynamic SQL from field inspection aligns SQL with GraphQL.
- ORM includes must still be checked for hidden N+1.

#### Best Practices

- Prefer explicit SQL plans for hot paths.
- Use aggregation for nested lists when appropriate.
- Index join columns.

#### Common Mistakes

- Huge `SELECT *` joins over wide tables.
- Joining without `LIMIT` on inner lists.
- Assuming ORM magic fixes all graphs.

---

### 19.3.2 Eager Loading

#### Beginner

**Eager loading** prefetches relations when loading the parent, so nested GraphQL fields are served from memory or a single batched query.

#### Intermediate

In **Prisma**: `prisma.post.findMany({ include: { author: true } })`. Pair with **pagination**. In raw SQL, use `WHERE id IN (...)` after fetching parents.

#### Expert

**DataLoader** is eager across keys in a tick; **join** is eager in SQL. Choose eager loading when you know the client **almost always** asks for the relation; use lazy batching when shapes vary. Watch **memory**: eager loading large trees can bloat Node heap.

```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function postsWithAuthors() {
  return prisma.post.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });
}
```

```javascript
export async function postsWithAuthorsKnex(knex) {
  return knex("posts")
    .select("posts.*", knex.ref("authors.name").as("author_name"))
    .leftJoin("authors", "authors.id", "posts.author_id")
    .limit(50);
}
```

#### Key Points

- Eager loading trades upfront cost for fewer round-trips.
- ORM `include`/`with` is a common implementation.
- Memory and row duplication are the downsides.

#### Best Practices

- Align eager includes with common client fragments.
- Measure row width when selecting many columns.
- Combine eager fetch with DataLoader for rare fields.

#### Common Mistakes

- Always eager-loading huge binary columns.
- Including deep trees by default.
- Duplicating eager load and DataLoader fetch.

---

### 19.3.3 Lazy Loading

#### Beginner

**Lazy loading** defers related data until accessed—convenient but **risky** in GraphQL if each access triggers a query (classic N+1).

#### Intermediate

Lazy loading is fine behind **batched** abstractions (DataLoader) or when relations are **rarely** selected. Pure ORM lazy getters per field resolver are usually wrong.

#### Expert

**Transaction-scoped** lazy load in some stacks keeps consistency but still N+1s. Prefer **explicit service methods** that load subgraphs based on `info` or known operation names. **Cursor-based** pagination encourages lazy next-page loads at the client, not arbitrary lazy SQL per row.

```javascript
// Lazy behind DataLoader = OK
const resolvers = {
  Post: {
    author: (p, _, ctx) => ctx.loaders.user.load(p.authorId),
  },
};
```

```javascript
// ORM lazy getter in resolver = usually N+1
const badResolvers = {
  Post: {
    author: async (p) => {
      const post = await orm.Post.findByPk(p.id);
      return post.getAuthor();
    },
  },
};
```

#### Key Points

- Lazy without batching causes N+1.
- DataLoader makes lazy patterns safe.
- Explicit data services beat hidden ORM magic.

#### Best Practices

- Ban raw lazy getters in GraphQL resolvers in style guides.
- Use lazy loading for on-demand expensive fields with rate limits.
- Document which fields trigger IO.

#### Common Mistakes

- Confusing client-side lazy UI with server lazy SQL.
- Mixing lazy and eager inconsistently across code paths.
- Using lazy load in tight loops without batching.

---

### 19.3.4 Select Query Optimization

#### Beginner

Fetch **only columns** you need. `SELECT *` pulls extra data and blocks **covering indexes**.

#### Intermediate

GraphQL exposes many fields; map selected columns to **requested fields** using `info` or static profiles (`PUBLIC_POST`, `ADMIN_POST` selections).

#### Expert

**Column projection** reduces network and memory. **Partial indexes** align with filtered queries (`WHERE published`). **TOAST** heavy columns (large text) should be omitted unless requested. **Prepared statements** + proper types avoid implicit casts that defeat indexes.

```javascript
function postsFields(info) {
  const fields = graphqlFields(info);
  const cols = ["id", "created_at"];
  if (fields.title) cols.push("title");
  if (fields.body) cols.push("body");
  return cols;
}
```

```javascript
import knex from "knex";
const db = knex({ client: "pg" });

export function postsQuery(info) {
  const cols = postsFields(info);
  return db("posts").select(cols).limit(50);
}
```

#### Key Points

- Narrow `SELECT` lists improve index usage and throughput.
- Field-level SQL projection matches GraphQL flexibility with cost control.
- Heavy columns deserve guards.

#### Best Practices

- Create field-to-column mapping tables for hot types.
- Avoid serializing large blobs by default.
- Re-run `EXPLAIN` after schema changes.

#### Common Mistakes

- Always selecting large text/json columns.
- Ignoring `info` and over-fetching for simple queries.
- Projecting incorrectly when aliases/fragments change names.

---

### 19.3.5 Index Strategy

#### Beginner

Index foreign keys (`author_id`) and columns in **`WHERE`**, **`ORDER BY`**, and **join** predicates. Without indexes, batch queries devolve to sequential scans.

#### Intermediate

Composite indexes match **multi-column filters** (`(tenant_id, created_at)`). Use **partial indexes** for boolean flags like `published = true`.

#### Expert

**Index-only scans** require including columns in indexes thoughtfully. **Write amplification** from too many indexes hurts mutation throughput—balance read-heavy GraphQL vs write rate. **Analyze**/`VACUUM` schedules matter for planner choices. For **UUID PKs**, consider **time-ordered** UUIDs or clustering strategies to reduce index bloat fragmentation.

```sql
CREATE INDEX CONCURRENTLY idx_posts_author ON posts (author_id);
CREATE INDEX CONCURRENTLY idx_posts_pub_created
  ON posts (created_at DESC)
  WHERE published = true;
```

```javascript
// Batch loader should use indexed column
await db.query("SELECT * FROM users WHERE id = ANY($1::uuid[])", [ids]);
```

#### Key Points

- Batching without indexes still scans.
- Composite indexes match real filter patterns.
- Too many indexes slow writes.

#### Best Practices

- Index every FK used in loaders.
- Monitor slow query logs for seq scans.
- Revisit indexes after new GraphQL fields add sorts/filters.

#### Common Mistakes

- Indexing low-cardinality columns alone.
- Missing multi-tenant prefix in composite indexes.
- Copying indexes from tutorials without workload analysis.

---

## 19.4 Caching Strategy

### 19.4.1 Application-Level Caching

#### Beginner

Cache **resolver results** or **entity records** in memory (per process) to skip repeated DB hits for identical keys within TTL.

#### Intermediate

Use **request-level** caches (loaders) first, then **short TTL** Redis for hot entities. Namespace keys by **schema version** and **tenant**.

#### Expert

**Stampede protection** with locks or `x-fetch` patterns; **probabilistic early expiration**; **consistent hashing** for multi-node. Watch **serialization cost** for large objects. For **personalized** fields, avoid shared caches unless keys include user id.

```javascript
import NodeCache from "node-cache";
const userCache = new NodeCache({ stdTTL: 30 });

export async function getUserCached(id, fetcher) {
  const hit = userCache.get(id);
  if (hit) return hit;
  const row = await fetcher(id);
  userCache.set(id, row);
  return row;
}
```

```javascript
const cache = new Map();

export async function cachedResolver(key, ttlMs, load) {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && now - entry.t < ttlMs) return entry.v;
  const v = await load();
  cache.set(key, { v, t: now });
  return v;
}
```

#### Key Points

- Application cache reduces DB load for hot keys.
- Key design must include all dimensions of variance.
- Stampede control matters at scale.

#### Best Practices

- Prefer request-scoped caching before global caches.
- Set TTLs based on freshness requirements.
- Metrics on hit rate and eviction.

#### Common Mistakes

- Caching user-specific data under global keys.
- No TTL (unbounded memory).
- Caching without invalidation on writes.

---

### 19.4.2 Database Query Caching

#### Beginner

Some databases/proxies cache **query results** or **prepared plans**. This is **not** a substitute for application design but can shave latency.

#### Intermediate

**PgBouncer** in transaction mode does not cache results—pool only. **ORM second-level cache** (Hibernate-style) is rare in Node; use Redis instead. **Materialized views** cache aggregates explicitly.

#### Expert

**Read replicas** serve scaled reads; **routing** by staleness tolerance. **UNION ALL** materializations refreshed on schedule. **Logical decoding** can feed caches on change—overlap with event systems. Mind **consistency**: GraphQL clients may assume read-your-writes.

```sql
CREATE MATERIALIZED VIEW popular_posts AS
SELECT post_id, COUNT(*) AS likes
FROM likes
GROUP BY post_id;

REFRESH MATERIALIZED VIEW CONCURRENTLY popular_posts;
```

```javascript
export async function popularPosts(db) {
  return db.query("SELECT * FROM popular_posts ORDER BY likes DESC LIMIT 20");
}
```

#### Key Points

- DB-level caches are infrastructure-dependent.
- Materialized views are explicit result caches.
- Consistency semantics must match product expectations.

#### Best Practices

- Refresh materialized views on a schedule or trigger.
- Route read-mostly GraphQL queries to replicas when acceptable.
- Document staleness in API docs.

#### Common Mistakes

- Expecting connection poolers to cache query data.
- Stale materialized views without monitoring.
- Reading from replicas immediately after a write mutation.

---

### 19.4.3 Redis Integration

#### Beginner

**Redis** stores key-value caches shared across Node processes. Typical pattern: `GET cache:key`, on miss query DB, `SETEX`.

#### Intermediate

Use **hashes** for field subsets, **pipelining** for bulk reads, **Redis Cluster** for scale. Serialize with **JSON** or **msgpack**.

#### Expert

**Cache-aside** vs **read-through**; **write-through** on mutations; **pub/sub** or **streams** for invalidation messages across nodes. Handle **fail-open** (degrade to DB) when Redis is down. **TLS** and **ACLs** for security.

```javascript
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export async function getPostCached(id, loadFromDb) {
  const key = `post:${id}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const row = await loadFromDb(id);
  await redis.set(key, JSON.stringify(row), { EX: 60 });
  return row;
}
```

```javascript
export async function invalidatePost(id) {
  await redis.del(`post:${id}`);
}
```

#### Key Points

- Redis enables cross-instance cache sharing.
- Pipelining improves batch reads.
- Invalidation must accompany writes.

#### Best Practices

- Namespaced keys with version prefix.
- Circuit-break Redis failures to DB.
- Use TTL as a safety net.

#### Common Mistakes

- Caching large graphs as one key (poor granularity).
- Forgetting invalidation paths in mutations.
- Storing secrets in Redis without encryption at rest.

---

### 19.4.4 Cache Invalidation

#### Beginner

When data changes, **delete or update** cache entries. “There are only two hard problems…”—plan explicit invalidation per mutation.

#### Intermediate

**Tag-based** invalidation (cache key lists) vs **key** invalidation. **TTL-only** is simpler but stale longer. **Version** keys (`user:3:v12`) bump on writes.

#### Expert

**Event sourcing** or **CDC** drives invalidation streams. **Probabilistic** TTL jitter reduces thundering herds. **GraphQL-specific**: `@cacheControl` hints (Apollo) coordinate CDN and client—but server resolver caches still need rules.

```javascript
const VERSION = 7;

export function userCacheKey(id) {
  return `v${VERSION}:user:${id}`;
}
```

```javascript
export async function updateUser(redis, db, id, patch) {
  const row = await db.query(
    "UPDATE users SET name = $2 WHERE id = $1 RETURNING *",
    [id, patch.name],
  );
  await redis.del(userCacheKey(id));
  return row.rows[0];
}
```

#### Key Points

- Mutations must trigger invalidation or version bumps.
- TTL alone is not enough for strong consistency.
- Tags help when one write touches many derived keys.

#### Best Practices

- Centralize invalidation helpers per entity.
- Log cache misses after writes (signals bugs).
- Integration tests that mutate then read through cache.

#### Common Mistakes

- Partial invalidation missing derived keys.
- Relying only on infinite TTL.
- Double-fetch storms after mass invalidation.

---

### 19.4.5 Distributed Caching

#### Beginner

Multiple Node servers share **Redis** so cache hits are global, not per-process.

#### Intermediate

Watch **latency** to Redis vs local L1; use **two-tier** caches (in-process + Redis) carefully to avoid incoherence.

#### Expert

**Consistent hashing** minimizes resharding pain. **Hazelcast/Memcached** alternatives; **near-cache** patterns with TTL and event invalidation. **Split-brain** and **clock skew** affect TTL expiry—prefer server-side time where possible.

```javascript
import QuickLRU from "quick-lru";

const local = new QuickLRU({ maxSize: 5000, maxAge: 5000 });

export async function twoTierGet(key, redis, loader) {
  const l = local.get(key);
  if (l) return l;
  const r = await redis.get(key);
  if (r) {
    const v = JSON.parse(r);
    local.set(key, v);
    return v;
  }
  const v = await loader();
  local.set(key, v);
  await redis.set(key, JSON.stringify(v), { EX: 30 });
  return v;
}
```

#### Key Points

- Distributed cache aligns multiple app instances.
- Multi-tier needs coherence strategy.
- Redis cluster adds operational complexity.

#### Best Practices

- Monitor Redis memory and eviction policy.
- Use `volatile-lru` or `allkeys-lru` consciously.
- Load test with cache warm vs cold.

#### Common Mistakes

- L1 cache without TTL causing stale reads across servers.
- Single Redis instance as SPOF without fallback.
- Huge values saturating network bandwidth.

---

## 19.5 Query Planning

### 19.5.1 Query Analysis

#### Beginner

**Analyze** incoming GraphQL documents: depth, number of fields, aliases, and variables. Reject or log abusive patterns early.

#### Intermediate

Use **`graphql`’s `visit`** to traverse AST; compute **max depth** and **field counts**. Combine with **allowlists** for public APIs.

#### Expert

**Query cost** plugins assign weights per field and sum over the AST. **Persisted queries** remove arbitrary ad-hoc documents. **APQ** hashes bodies client-side. Analysis should be **O(n)** in AST size and cached for repeated hashes.

```javascript
import { getOperationAST, parse, visit, Kind } from "graphql";

export function maxDepth(doc) {
  let max = 0;
  visit(doc, {
    SelectionSet: {
      enter(_, _key, _parent, path) {
        const depth = path.filter((p) => p === "selections").length;
        max = Math.max(max, depth);
      },
    },
  });
  return max;
}

const doc = parse(`query { a { b { c } } }`);
console.log(maxDepth(doc));
```

```javascript
const op = getOperationAST(doc, "Q");
// further analysis on op.selectionSet
```

#### Key Points

- Static AST analysis catches many abuse patterns.
- Depth alone is insufficient (wide queries matter).
- Persisted queries shift trust to clients you control.

#### Best Practices

- Fail fast before resolver execution.
- Return helpful errors for developers, generic for public APIs.
- Log analysis metrics by operation name.

#### Common Mistakes

- Counting only depth and ignoring breadth.
- No bypass for trusted internal tools (with auth).
- Re-parsing documents on every request without cache.

---

### 19.5.2 Execution Planning

#### Beginner

GraphQL execution walks the **operation** tree: root fields, then subfields. **Sibling fields** may run concurrently (graphql-js default).

#### Intermediate

Plan **data dependencies**: some fields need others first—use **extensions** or redesign schema to avoid sequential waterfalls when possible.

#### Expert

**@defer/@stream** (when supported) changes delivery semantics. **Federation** plans across subgraphs with query plans generated by the router. **Tracing** shows actual vs theoretical parallelism.

```javascript
import { graphql } from "graphql";

const result = await graphql({
  schema,
  source: `{ posts { title author { name } } }`,
  contextValue: ctx,
});
```

#### Key Points

- Execution order is defined by the spec for mutations; queries parallelize siblings.
- Schema design affects planning waterfalls.
- Federation introduces multi-step plans.

#### Best Practices

- Avoid resolver chains that always await a sibling’s side effect.
- Use dataloaders to collapse parallel sibling fetches.
- Measure waterfall depth with tracing.

#### Common Mistakes

- Assuming sequential execution for queries.
- Hidden dependencies via shared mutable context.
- Overusing global singletons in concurrent resolvers.

---

### 19.5.3 Cost Estimation

#### Beginner

Assign a **cost** to each field (e.g., `posts` = 10 × child cost). Reject queries above a **threshold**.

#### Intermediate

Multiply by **argument multipliers** (`first` on connections). Use **introspection** to attach `cost` directives via schema extensions.

#### Expert

**Dynamic cost** based on user role and **complexity** of variables. **Precomputed** costs for persisted queries. Calibrate costs using **production traces**; avoid static costs that do not match DB reality.

```javascript
const costs = { "Query.posts": 5, "Post.author": 1 };

export function estimateCost(doc) {
  let total = 0;
  visit(doc, {
    Field(node) {
      total += costs[node.name.value] ?? 1;
    },
  });
  return total;
}
```

```graphql
directive @cost(weight: Int!) on FIELD_DEFINITION

type Query {
  posts: [Post!]! @cost(weight: 10)
}
```

#### Key Points

- Cost limits protect servers from expensive documents.
- Must reflect real backend work, not arbitrary numbers.
- Combine with pagination limits.

#### Best Practices

- Revisit costs when resolvers change.
- Provide devtools feedback on expensive queries.
- Use different thresholds per API key tier.

#### Common Mistakes

- Uniform cost for all fields.
- Ignoring list sizes from arguments.
- Costs that block legitimate rich queries without alternatives.

---

### 19.5.4 Optimization Strategies

#### Beginner

**Pagination**, **field limits**, **DataLoader**, **caching**, and **SQL tuning** are the big levers—apply in that order based on profiling.

#### Intermediate

**Denormalize** read models for hot screens. **Precompute** aggregates. **Split** types into `PublicUser` vs `AdminUser` to simplify auth and fetch cost.

#### Expert

**Schema slicing** per client; **BFF** GraphQL per app; **persisted operations**; **partial preaggregation** via materialized views. **CDN** caching for `GET` GraphQL (careful). **Node cluster** scaling with shared Redis.

```javascript
export const resolvers = {
  Query: {
    feed: async (_, { cursor }, ctx) => {
      return ctx.db.query(
        `SELECT * FROM feed_items WHERE id < $1 ORDER BY id DESC LIMIT 20`,
        [cursor ?? 2 ** 31],
      );
    },
  },
};
```

#### Key Points

- Optimize from measurement, not guesses.
- Product and schema shape drive technical options.
- Combine server and client strategies.

#### Best Practices

- Maintain a performance checklist for new fields.
- Load test before launch of new mobile screens.
- Document tradeoffs of denormalization.

#### Common Mistakes

- Premature denormalization without staleness plan.
- Micro-optimizing JS while SQL dominates.
- Removing fields instead of paginating.

---

### 19.5.5 Monitoring

#### Beginner

Log **operation name**, **duration**, and **error** count. Track **p95/p99** latency.

#### Intermediate

Export **Prometheus** metrics: `graphql_operation_duration_seconds`, `graphql_resolver_errors_total`, **DB query count** per operation via hooks.

#### Expert

**SLO dashboards** with burn rates; **tail sampling** of traces; **anomaly detection** on field latency; **per-tenant** quotas visible in metrics. Alert on **growth in operation cardinality** (indicates clients out of control).

```javascript
import client from "prom-client";

const histogram = new client.Histogram({
  name: "graphql_op_seconds",
  help: "GraphQL operation duration",
  labelNames: ["operationName"],
});

export function metricsPlugin() {
  return {
    async requestDidStart() {
      const end = histogram.startTimer();
      return {
        async willSendResponse(rc) {
          end({
            operationName: rc.request.operationName ?? "anonymous",
          });
        },
      };
    },
  };
}
```

#### Key Points

- Monitoring connects product SLAs to GraphQL operations.
- High-cardinality labels need restraint.
- Traces show N+1 visually.

#### Best Practices

- Always require `operationName` in production clients.
- Dashboard SQL count vs latency.
- Review slow operations weekly.

#### Common Mistakes

- Logging full GraphQL documents with PII.
- Metrics without operationName (unusable).
- No alerts until customers complain.

---

## 19.6 Advanced Optimization

### 19.6.1 Query Parallelization

#### Beginner

graphql-js runs **independent sibling fields** in parallel `Promise` execution—use this by avoiding unnecessary dependencies.

#### Intermediate

Split heavy unrelated root fields into one query instead of many HTTP calls—**one round-trip**, parallel resolvers.

#### Expert

**Worker threads** for CPU-heavy resolvers (rare); **connection pool sizing** must match parallel DB queries—too much parallelism **contends** pools. **Bulkhead** patterns limit concurrency per downstream.

```javascript
const resolvers = {
  Query: {
    me: (_, __, ctx) => ctx.loaders.user.load(ctx.userId),
    notifications: (_, __, ctx) => ctx.db.query(
      "SELECT * FROM notifications WHERE user_id = $1 LIMIT 20",
      [ctx.userId],
    ),
  },
};
```

```javascript
import pLimit from "p-limit";

const limit = pLimit(10);

export function batchWithConcurrency(items, fn) {
  return Promise.all(items.map((item) => limit(() => fn(item))));
}
```

#### Key Points

- Parallel resolvers help when IO-bound.
- Too much DB parallelism can hurt.
- p-limit style backpressure is useful.

#### Best Practices

- Right-size DB pool vs CPU cores.
- Avoid global unbounded `Promise.all` to microservices.
- Trace concurrent resolver fan-out.

#### Common Mistakes

- Serializing everything with `await` in one resolver.
- Pool size << parallel queries (timeouts).
- CPU-bound work on main thread at scale.

---

### 19.6.2 Streaming Large Results

#### Beginner

For huge lists, avoid materializing **all rows** in memory—use **cursors**, **pagination**, or **streams** from the DB driver.

#### Intermediate

Node `pg.Query` with **row** events streams results. GraphQL spec traditionally returns one JSON—**@stream** (defer/stream proposals) helps when available in your stack.

#### Expert

**Relay connections** spec: `edges { node }`, `pageInfo`. **Keyset pagination** scales better than `OFFSET`. For **exports**, use separate **REST download** or **job + signed URL** rather than giant GraphQL responses.

```javascript
import pg from "pg";

export async function streamPostIds(pool, onRow) {
  const q = new pg.Query("SELECT id FROM posts");
  const stream = pool.query(q);
  for await (const row of stream) onRow(row.id);
}
```

```graphql
query {
  posts(first: 50, after: "cursor") {
    edges {
      cursor
      node {
        id
        title
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

#### Key Points

- Streaming reduces memory spikes.
- GraphQL response models may limit native streaming.
- Keyset pagination avoids OFFSET cost.

#### Best Practices

- Cap `first` aggressively on public schemas.
- Use dedicated endpoints for bulk exports.
- Monitor memory during large operations.

#### Common Mistakes

- Returning 100k nodes in one GraphQL response.
- Using OFFSET for deep pages.
- Holding streams open without timeouts.

---

### 19.6.3 Pagination Strategy

#### Beginner

Use **`limit`/`offset`** only for small datasets; prefer **cursors** for large feeds.

#### Intermediate

**Relay cursor spec** encodes opaque cursors; **stable sort** columns required. **Dual-column** `(created_at, id)` handles ties.

#### Expert

**Seek method** (`WHERE (created_at, id) < ($ts,$id)`) with composite index. **Total count** queries are expensive—expose `hasNextPage` without full counts when possible.

```javascript
export async function postsAfter(db, cursor) {
  const [ts, id] = decodeCursor(cursor);
  return db.query(
    `SELECT * FROM posts
     WHERE (created_at, id) < ($1::timestamptz, $2::uuid)
     ORDER BY created_at DESC, id DESC
     LIMIT 21`,
    [ts, id],
  );
}
```

```javascript
function decodeCursor(c) {
  const [ts, id] = Buffer.from(c, "base64url").toString().split(":");
  return [ts, id];
}
```

#### Key Points

- Cursors need deterministic ordering.
- Avoid OFFSET for deep pages.
- Expose enough pageInfo for clients.

#### Best Practices

- Index sort columns.
- Document cursor stability guarantees.
- Test duplicate timestamps.

#### Common Mistakes

- Encoding primary key only without sort key.
- Unstable sorts (non-unique ORDER BY).
- Leaking internal DB row order assumptions.

---

### 19.6.4 Partial Query Loading

#### Beginner

Clients can request **only needed fields**—smaller payloads and less resolver work if you project to SQL.

#### Intermediate

**Fragments** encourage reuse and predictability. **@include/@skip** vary shapes without multiple documents when using variables.

#### Expert

**@defer** (where supported) returns initial payload fast, later patches—requires client support. **Field-level authorization** can short-circuit expensive fields when denied.

```graphql
query UserCard($id: ID!, $withEmail: Boolean!) {
  user(id: $id) {
    id
    name
    email @include(if: $withEmail)
  }
}
```

```javascript
export const resolvers = {
  User: {
    email: (u, _, ctx) => {
      if (!ctx.viewer?.isAdmin) return null;
      return u.email;
    },
  },
};
```

#### Key Points

- GraphQL’s flexibility helps partial loading.
- Directives parameterize selection sets.
- Server should still enforce auth, not only hide fields.

#### Best Practices

- Co-locate fragments with UI components.
- Use variables instead of string-built queries.
- Measure payload sizes mobile vs web.

#### Common Mistakes

- Over-fetching “just in case” on clients.
- Relying on `@include` for security.
- Huge polymorphic unions without limits.

---

### 19.6.5 Progressive Loading

#### Beginner

**Progressive** means showing **something** quickly—clients fetch a small query first, then follow-up queries for details (or use UI skeletons).

#### Intermediate

**Apollo** `@defer`, **multiple queries** in parallel on client, or **suspense** patterns. Server-side, prioritize **cheap fields** first via separate operations rather than one giant document if caching layers differ.

#### Expert

**HTTP/2 multiplexing** helps multiple GraphQL POSTs—watch **server concurrency**. **Stale-while-revalidate** on clients pairs with **partial cache**. For **mobile**, prefetch next screen fields in idle time.

```javascript
// Client pseudo-flow with two operations
async function loadProfile(userId) {
  const basic = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: `query ($id:ID!){ user(id:$id){ id name } }`,
      variables: { id: userId },
    }),
  }).then((r) => r.json());

  const details = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: `query ($id:ID!){ user(id:$id){ id bio posts(first:5){ id title } } }`,
      variables: { id: userId },
    }),
  }).then((r) => r.json());

  return { basic, details };
}
```

#### Key Points

- Progressive loading improves perceived latency.
- Multiple operations trade simplicity for control.
- Server caching and CDN policies may vary per operation.

#### Best Practices

- Align operations with UI states.
- Dedupe network with client cache when possible.
- Measure first meaningful paint, not only TTFB.

#### Common Mistakes

- Waterfall requests due to strict UI coupling.
- Duplicating auth overhead on each small query.
- Ignoring battery/network on mobile prefetch spam.

---
