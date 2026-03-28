# Caching Strategies

## 📑 Table of Contents

- [20.1 HTTP Caching](#201-http-caching)
  - [20.1.1 Cache-Control Headers](#2011-cache-control-headers)
  - [20.1.2 ETag Headers](#2012-etag-headers)
  - [20.1.3 Last-Modified Headers](#2013-last-modified-headers)
  - [20.1.4 Conditional Requests](#2014-conditional-requests)
  - [20.1.5 Cache Expiration](#2015-cache-expiration)
- [20.2 Application-Level Caching](#202-application-level-caching)
  - [20.2.1 In-Memory Caching](#2021-in-memory-caching)
  - [20.2.2 Redis Caching](#2022-redis-caching)
  - [20.2.3 Memcached](#2023-memcached)
  - [20.2.4 Cache Invalidation](#2024-cache-invalidation)
  - [20.2.5 Cache Strategies](#2025-cache-strategies)
- [20.3 Query Result Caching](#203-query-result-caching)
  - [20.3.1 Result Memoization](#2031-result-memoization)
  - [20.3.2 Cache Keys](#2032-cache-keys)
  - [20.3.3 TTL Management](#2033-ttl-management)
  - [20.3.4 Cache Busting](#2034-cache-busting)
  - [20.3.5 Partial Caching](#2035-partial-caching)
- [20.4 Persistent Caching](#204-persistent-caching)
  - [20.4.1 Database Caching](#2041-database-caching)
  - [20.4.2 Query Result Persistence](#2042-query-result-persistence)
  - [20.4.3 Snapshot Storage](#2043-snapshot-storage)
  - [20.4.4 Cache Warming](#2044-cache-warming)
  - [20.4.5 Cache Replication](#2045-cache-replication)
- [20.5 Client-Side Caching](#205-client-side-caching)
  - [20.5.1 Apollo Client Cache](#2051-apollo-client-cache)
  - [20.5.2 Cache Normalization](#2052-cache-normalization)
  - [20.5.3 Cache Updates](#2053-cache-updates)
  - [20.5.4 Cache Persistence](#2054-cache-persistence)
  - [20.5.5 Offline Support](#2055-offline-support)
- [20.6 Advanced Caching](#206-advanced-caching)
  - [20.6.1 Multi-Layer Caching](#2061-multi-layer-caching)
  - [20.6.2 Cache Coherence](#2062-cache-coherence)
  - [20.6.3 Distributed Caching](#2063-distributed-caching)
  - [20.6.4 Cache Warming Strategies](#2064-cache-warming-strategies)
  - [20.6.5 Performance Impact](#2065-performance-impact)

---

## 20.1 HTTP Caching

### 20.1.1 Cache-Control Headers

#### Beginner

**Cache-Control** tells browsers and CDNs whether a response can be stored and for how long. For GraphQL **POST** responses, intermediaries often **do not cache** by default; **GET** with query params can be cached if policies allow.

#### Intermediate

Directives include **`public`**, **`private`**, **`max-age`**, **`s-maxage`**, **`no-store`**, **`no-cache`**, **`must-revalidate`**. GraphQL APIs usually return **`private`** or **`no-store`** when responses are **user-specific** or contain **sensitive** data.

#### Expert

**CDN caching GraphQL** requires stable URLs, **GET** semantics, **APQ** or persisted queries, and **Vary** headers for auth dimensions—often impractical for highly personalized graphs. **Stale-while-revalidate** can smooth traffic for **anonymous** read-mostly operations.

```javascript
import express from "express";

const app = express();

app.post("/graphql", (req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  next();
});
```

```javascript
app.get("/graphql", (req, res, next) => {
  if (req.header("authorization")) {
    res.set("Cache-Control", "private, max-age=0, must-revalidate");
  } else {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
  }
  next();
});
```

#### Key Points

- Cache-Control governs shared vs private caches.
- POST GraphQL rarely benefits from HTTP cache without careful design.
- Personalized data should use `private` or `no-store`.

#### Best Practices

- Set explicit Cache-Control on every GraphQL route.
- Document which operations (if any) are CDN-cacheable.
- Pair with auth and vary headers thoughtfully.

#### Common Mistakes

- Allowing `public` caching of authenticated responses.
- Assuming CDN will cache POST bodies.
- Omitting headers and relying on browser defaults for sensitive data.

---

### 20.1.2 ETag Headers

#### Beginner

An **ETag** is an opaque validator for a response version. Clients send **`If-None-Match`**; servers return **304 Not Modified** if unchanged—saving bandwidth.

#### Intermediate

For GraphQL, ETags typically apply to **GET** endpoints or **whole-response** caching layers, not individual fields. Strong ETags require **byte-identical** bodies; weak ETags (`W/"..."`) allow semantically equivalent compression variants.

#### Expert

Compute ETags from **canonical serialized JSON** (sorted keys) or **content hashes** of normalized results. For **personalized** graphs, ETags must incorporate **user identity** and **schema version** in the hash input to avoid cache leaks.

```javascript
import crypto from "node:crypto";

function etagOfBody(obj) {
  const json = JSON.stringify(obj);
  return `"${crypto.createHash("sha256").update(json).digest("hex").slice(0, 16)}"`;
}

app.use("/graphql", (req, res, next) => {
  const orig = res.json.bind(res);
  res.json = (body) => {
    const tag = etagOfBody(body);
    if (req.get("If-None-Match") === tag) {
      res.status(304).end();
      return res;
    }
    res.set("ETag", tag);
    return orig(body);
  };
  next();
});
```

#### Key Points

- ETags enable conditional fetches for cacheable transports.
- Hashing must include all variance dimensions.
- Weak vs strong ETags affect interoperability.

#### Best Practices

- Use stable serialization before hashing.
- Short-circuit 304 only when safe for GraphQL errors shape.
- Log ETag hits for CDN tuning.

#### Common Mistakes

- ETags that ignore auth context (data leak).
- Changing whitespace breaking strong ETags unnecessarily.
- 304 responses without matching caching semantics.

---

### 20.1.3 Last-Modified Headers

#### Beginner

**Last-Modified** provides a timestamp validator. Clients use **`If-Modified-Since`** to receive **304** when data is not newer.

#### Intermediate

GraphQL aggregates many resources—**single timestamp** is hard. Use **max(updated_at)** from involved rows or **version counters** for coarse freshness.

#### Expert

**Clock skew** between servers breaks comparisons—prefer **ETags** for correctness. If using Last-Modified, use **HTTP-date** formatting and **GMT**. For **federated** graphs, choose **monotonic** versions rather than wall clock.

```javascript
function lastModifiedHeader(date) {
  return date.toUTCString();
}

app.use("/graphql", async (req, res, next) => {
  const lm = await maxUpdatedAt();
  res.set("Last-Modified", lastModifiedHeader(lm));
  next();
});
```

#### Key Points

- Last-Modified is coarse-grained compared to ETag.
- Good when data has clear temporal bounds.
- Federation complicates a single modified time.

#### Best Practices

- Prefer ETags for GraphQL JSON payloads.
- If using timestamps, define what “modified” means.
- Document resolution for aggregated types.

#### Common Mistakes

- Per-row timestamps exposed without aggregation strategy.
- Using local timezone strings.
- 304 when errors array changed but data did not (inconsistent).

---

### 20.1.4 Conditional Requests

#### Beginner

**Conditional requests** send validators (`If-None-Match`, `If-Modified-Since`) so the server can skip body transmission.

#### Intermediate

Works best with **GET + APQ** or **persisted query IDs** where URL or headers uniquely identify the operation and variables are stable or hashed.

#### Expert

For **POST**, intermediaries may strip or ignore validators—**application-level** short-circuit inside resolver pipeline is more reliable. Combine with **Redis** storing response hashes keyed by `(userId, operationHash, variablesHash)`.

```javascript
app.get("/graphql", async (req, res) => {
  const key = cacheKey(req);
  const cached = await redis.get(key);
  const inm = req.get("If-None-Match");
  if (cached && inm && inm === cached.etag) {
    return res.status(304).end();
  }
  const body = await executeGraphql(req);
  const etag = etagOfBody(body);
  await redis.set(key, JSON.stringify({ etag, body }), { EX: 30 });
  res.set("ETag", etag);
  res.json(body);
});
```

#### Key Points

- HTTP conditionals are transport-level; app cache may be easier for POST.
- Keys must include auth and variables.
- 304 must omit body per spec.

#### Best Practices

- Implement conditionals only for safe, cacheable operations.
- Test with CDNs (Fastly/CloudFront behavior).
- Fall back to full response on validator mismatch.

#### Common Mistakes

- Same ETag for different users.
- Caching GraphQL errors as success.
- Ignoring `Vary: Authorization`.

---

### 20.1.5 Cache Expiration

#### Beginner

**max-age** sets freshness lifetime in seconds. After expiry, caches **revalidate** (with `no-cache`) or **refetch** (with `must-revalidate`).

#### Intermediate

**s-maxage** targets **shared** caches (CDN) distinct from browser **max-age**. **stale-if-error** can serve stale on upstream failure—use carefully with GraphQL error semantics.

#### Expert

**Heuristic expiration** may apply if no Cache-Control—avoid by always setting explicit policy. **GraphQL multipart** uploads should be **`no-store`**. Align **CDN TTL** with **server resolver TTL** to prevent inconsistent layers.

```javascript
res.set("Cache-Control", "public, s-maxage=60, max-age=0, stale-while-revalidate=300");
```

```graphql
# Typically paired with GET persisted query URLs on edge
query PopularTags {
  tags(first: 20) {
    id
    name
  }
}
```

#### Key Points

- Expiration balances freshness vs load.
- Different layers may need different TTLs.
- GraphQL errors complicate shared caching.

#### Best Practices

- Short TTL for near-real-time data.
- Longer TTL only for anonymous aggregates.
- Monitor CDN hit ratio.

#### Common Mistakes

- Long `max-age` on personalized JSON.
- Forgetting to shorten TTL after schema changes.
- Stale content served on mutations without purge.

---

## 20.2 Application-Level Caching

### 20.2.1 In-Memory Caching

#### Beginner

Store hot data in **process memory** (`Map`, **lru-cache**, **node-cache**) for microsecond access. Scoped **per server instance**.

#### Intermediate

**TTL** and **max size** prevent unbounded growth. **Cluster mode** duplicates entries per worker—accept or use **shared Redis** for consistency.

#### Expert

**GC pressure** from large cached objects; prefer **shared buffers** or compact representations. **Thundering herd**: combine with **singleflight**/`async-mutex` for in-flight deduplication.

```javascript
import { LRUCache } from "lru-cache";

const schemaCache = new LRUCache({
  max: 1,
  ttl: 1000 * 60 * 60,
  allowStale: false,
});

export function getSchemaCached(build) {
  const hit = schemaCache.get("schema");
  if (hit) return hit;
  const s = build();
  schemaCache.set("schema", s);
  return s;
}
```

```javascript
const inflight = new Map();

export async function singleflight(key, fn) {
  if (inflight.has(key)) return inflight.get(key);
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
```

#### Key Points

- Fast but not shared across instances.
- Needs eviction and TTL discipline.
- Singleflight reduces duplicate work.

#### Best Practices

- Cache immutable or versioned artifacts (schema, feature flags).
- Cap entries and monitor RSS.
- Invalidate on deploy via version keys.

#### Common Mistakes

- Caching user-specific objects globally.
- No eviction (memory leaks).
- Stale schema after deploy without bumping key.

---

### 20.2.2 Redis Caching

#### Beginner

**Redis** is an in-memory data store shared by all app servers. Use **`GET`/`SETEX`** around expensive resolvers or full operation results.

#### Intermediate

**Pipelines** batch commands; **hashes** model objects; **RedisJSON** module optional. Configure **maxmemory-policy** (`allkeys-lru`) for eviction under pressure.

#### Expert

**RediSearch** secondary indexes; **Streams** for invalidation fan-out; **TLS** and **ACL users** for least privilege. Handle **fail-open** paths and **timeouts** to protect the GraphQL event loop.

```javascript
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export async function cachedOp(key, ttl, compute) {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const value = await compute();
  await redis.set(key, JSON.stringify(value), { EX: ttl });
  return value;
}
```

```javascript
await redis.sendCommand([
  "MGET",
  "post:1",
  "post:2",
  "post:3",
]);
```

#### Key Points

- Shared cache aligns multiple Node processes.
- Pipelines improve batching.
- Policies must handle memory limits.

#### Best Practices

- Namespace keys (`app:v2:post:id`).
- Use connection pooling via client library.
- Set command timeouts.

#### Common Mistakes

- Blocking commands (`KEYS *`) in prod.
- Storing huge JSON blobs.
- No backoff when Redis is down.

---

### 20.2.3 Memcached

#### Beginner

**Memcached** is a simple distributed memory cache: **key-value**, **LRU eviction**, **no persistence** (by default). Clients use **consistent hashing** across nodes.

#### Intermediate

Unlike Redis, memcached has **no rich data structures**—store serialized strings. Good for **pure cache** use cases without pub/sub needs.

#### Expert

**Slab allocator** nuances: large values waste slabs. **Multiget** reduces round-trips. **TLS** via proxies (e.g., **mcrouter**). Compare **Redis** when you need **replication**, **streams**, or **transactions**.

```javascript
import Memcached from "memcached";

const mc = new Memcached(process.env.MEMCACHED_URL ?? "localhost:11211");

export function memcGet(key) {
  return new Promise((resolve, reject) => {
    mc.get(key, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

export function memcSet(key, value, ttl) {
  return new Promise((resolve, reject) => {
    mc.set(key, value, ttl, (err) => (err ? reject(err) : resolve()));
  });
}
```

#### Key Points

- Simple, fast, horizontally shardable.
- No built-in persistence or structures.
- Multiget helps batch reads.

#### Best Practices

- Serialize with JSON/msgpack consistently.
- Avoid very large items.
- Monitor evictions and hit rate.

#### Common Mistakes

- Treating memcached as a database.
- Unbounded keyspace without TTL.
- Single node without HA story.

---

### 20.2.4 Cache Invalidation

#### Beginner

When underlying data changes, **delete** or **overwrite** cache entries. This is the hardest part of caching—define **which keys** each mutation touches.

#### Intermediate

**Write-through** updates cache on write; **write-around** writes DB only and invalidates cache; **write-back** is rare for GraphQL APIs serving authoritative DB data.

#### Expert

**Transactional outbox** emits events consumed by cache workers to invalidate derived keys. **Versioned keys** (`resource:id:v`) avoid deletes. **Bloom filters** not typical here—prefer explicit **dependency maps**.

```javascript
const deps = {
  post: new Set(),
};

export async function invalidatePost(redis, postId) {
  await redis.del(`post:${postId}`);
  await redis.del(`post:${postId}:comments`);
}

export async function createComment(redis, db, input) {
  await db.query("INSERT INTO comments ...", [input]);
  await invalidatePost(redis, input.postId);
}
```

#### Key Points

- Mutations must drive invalidation or versioning.
- Derived aggregates need dependency tracking.
- Event-driven invalidation scales team-wise.

#### Best Practices

- Central invalidation helpers per entity type.
- Integration tests: mutate → read through cache.
- Metrics on stale reads.

#### Common Mistakes

- TTL-only with strict freshness requirements.
- Missing invalidation for secondary indices keys.
- Race between read repopulate and invalidation.

---

### 20.2.5 Cache Strategies

#### Beginner

Common patterns: **cache-aside** (app manages Redis), **read-through** (loader pulls through cache), **CDN** for static, **browser** for GET assets.

#### Intermediate

For GraphQL: **resolver-level** cache-aside for entities; **DataLoader** for per-request dedupe; **full-response** cache only for anonymous stable operations.

#### Expert

**Negative caching** short TTL for misses to protect DB. **Request coalescing** at edge. **Tiered**: L1 memory + L2 Redis + L3 CDN. **Feature flags** toggle caching for risky deploys.

```javascript
export async function cacheAside(redis, key, ttl, load) {
  const cached = await redis.get(key);
  if (cached !== null) {
    if (cached === "__null__") return null;
    return JSON.parse(cached);
  }
  const value = await load();
  await redis.set(
    key,
    value === null ? "__null__" : JSON.stringify(value),
    { EX: ttl },
  );
  return value;
}
```

#### Key Points

- Choose strategy based on consistency needs.
- GraphQL often combines several strategies.
- Negative caching reduces attack surface.

#### Best Practices

- Document per-entity strategy in runbooks.
- Measure hit rate and DB QPS delta.
- Use feature flags for cache rollouts.

#### Common Mistakes

- Caching errors indefinitely.
- Double caching same data at every layer identically.
- No observability on which strategy is active.

---

## 20.3 Query Result Caching

### 20.3.1 Result Memoization

#### Beginner

**Memoization** stores the return value of a pure function for repeated inputs. In Node, wrap resolver computations with a **Map** keyed by arguments.

#### Intermediate

**Per-request** memoization avoids cross-request leaks. **LRU** caps memory. **JSON.stringify** of variables as key—watch key stability (sorted keys).

#### Expert

**Hermetic tests** for memoized resolvers; **cache poisoning** if keys omit auth dimensions. **Partial memoization** for deterministic subtrees (e.g., public reference data).

```javascript
function memoizeAsync(fn, { max = 500 } = {}) {
  const cache = new Map();
  return async (key) => {
    if (cache.has(key)) return cache.get(key);
    const p = fn(key).finally(() => {
      if (cache.size > max) {
        const first = cache.keys().next().value;
        cache.delete(first);
      }
    });
    cache.set(key, p);
    return p;
  };
}
```

```javascript
const getTag = memoizeAsync((id) => db.query("SELECT * FROM tags WHERE id=$1", [id]));
```

#### Key Points

- Memoization helps repeated identical work.
- Keys must include all inputs that affect output.
- Async memoization should dedupe in-flight promises.

#### Best Practices

- Scope memoization to request or immutable data.
- Bound cache size.
- Include tenant and auth in keys when needed.

#### Common Mistakes

- Global memo of user-specific results.
- Unstable serialization of objects as keys.
- Memoizing non-deterministic functions.

---

### 20.3.2 Cache Keys

#### Beginner

A **cache key** uniquely identifies a cached value. Typical pattern: colon-delimited segments `tenant:entity:id`.

#### Intermediate

For GraphQL operations, keys often include **`operationName` or hash**, **variables hash**, **user or role id**, **schema version**.

#### Expert

**Canonical JSON** (`json-stable-stringify`) for variables. **SHA-256** of document + variables for APQ-like keys. **Salting** keys on security incidents. **Avoid PII** in plaintext keys in logs.

```javascript
import crypto from "node:crypto";
import stableStringify from "json-stable-stringify";

export function graphqlCacheKey({ operationName, query, variables, userId }) {
  const body = stableStringify({ operationName, query, variables });
  const h = crypto.createHash("sha256").update(body).digest("hex");
  return `gql:${userId ?? "anon"}:${h}`;
}
```

#### Key Points

- Keys must be deterministic and complete.
- Hashing long queries keeps keys small.
- Separate keys per auth context.

#### Best Practices

- Version-prefix keys on breaking schema changes.
- Redact logs of key material if sensitive.
- Unit test key stability.

#### Common Mistakes

- Keys missing `locale` or `currency` when they affect data.
- Using raw query strings with whitespace drift.
- Shared key between admin and public roles.

---

### 20.3.3 TTL Management

#### Beginner

**TTL** (time-to-live) expires cache entries automatically. Short TTL = fresher data, more DB load. Long TTL = risk of staleness.

#### Intermediate

**Per-type TTL**: static tags long, user profiles short. **Jitter** expirations to prevent synchronized expiries.

#### Expert

**Adaptive TTL** based on observed change frequency. **Sliding expiration** on access (Redis `EXPIRE` refresh). **Legal/compliance** TTL for PII caches.

```javascript
function ttlWithJitter(baseSeconds, jitterRatio = 0.2) {
  const jitter = baseSeconds * jitterRatio * Math.random();
  return Math.floor(baseSeconds + jitter);
}

await redis.set(key, payload, { EX: ttlWithJitter(60) });
```

#### Key Points

- TTL is a safety net, not a full invalidation story.
- Jitter reduces thundering herds.
- Different entities need different TTLs.

#### Best Practices

- Document TTL tables per entity.
- Monitor eviction rates.
- Short TTL for highly dynamic social feeds.

#### Common Mistakes

- Infinite TTL without invalidation.
- Same TTL for all types.
- Ignoring timezone effects in “daily” TTL math.

---

### 20.3.4 Cache Busting

#### Beginner

**Bust** caches by changing URLs, keys, or versions so clients fetch fresh data—common for **static assets** (`app.js?v=2`).

#### Intermediate

For APIs, bump **`schema version`** prefix in keys or send **`Clear-Cache`** via operational tools/CDN purge APIs on deploy.

#### Expert

**Surrogate-Keys** (Fastly) tie responses to tags; purge by tag on mutation bursts. **GraphQL** `@cacheControl(maxAge: 0)` hints for Apollo CDN integration.

```javascript
export const CACHE_VERSION = process.env.CACHE_VERSION ?? "1";

export function versionedKey(k) {
  return `v${CACHE_VERSION}:${k}`;
}
```

```javascript
// On deploy hook
await fetch(`https://api.fastly.com/service/${SID}/purge/${tag}`, {
  method: "POST",
  headers: { "Fastly-Key": process.env.FASTLY_KEY },
});
```

#### Key Points

- Busting must propagate through all layers.
- Version prefixes are simplest for app caches.
- CDN tag purges help coarse invalidation.

#### Best Practices

- Automate purge/version bump in CI/CD.
- Test cache bust paths in staging.
- Keep rollback plan if purge too aggressive.

#### Common Mistakes

- Purging entire CDN during minor fix.
- Forgetting mobile app local caches.
- Clients hardcoding old persisted query IDs.

---

### 20.3.5 Partial Caching

#### Beginner

Cache **fragments** of a response (e.g., `User:123` entity) instead of the **entire operation** so mixed freshness is possible.

#### Intermediate

**Normalized client caches** (Apollo) are partial by nature. Server-side, cache **per-type resolvers** with entity keys.

#### Expert

**Field-level `@cacheControl`** (Apollo Server) sets hints per field; **CDN** may still struggle with POST—use **GET** persisted queries at edge for public fields only.

```javascript
import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [responseCachePlugin()],
});
```

```graphql
type Query {
  book(isbn: String!): Book
}

type Book @cacheControl(maxAge: 3600) {
  isbn: ID!
  title: String!
}
```

#### Key Points

- Partial caching improves reuse across operations.
- Field hints require gateway/CDN support to matter at edge.
- Server entity caches pair well with DataLoader.

#### Best Practices

- Cache stable reference data aggressively.
- Keep personalized fields uncached or private.
- Validate security implications of field TTL.

#### Common Mistakes

- Caching partial trees without invalidation edges.
- Mixing public/private TTL on same type incorrectly.
- Assuming response-cache plugin secures by itself.

---

## 20.4 Persistent Caching

### 20.4.1 Database Caching

#### Beginner

Databases cache **pages** in memory (buffer pool) and use **query plan caches**. You benefit automatically but can still overwhelm with bad queries.

#### Intermediate

**Materialized views** persist precomputed results. **Read replicas** scale read caching across instances.

#### Expert

**UNLOGGED tables** for scratch caches (PostgreSQL) trade durability for speed—use only for regenerable data. **Timescale/aggregation** policies refresh continuous aggregates.

```sql
CREATE MATERIALIZED VIEW daily_sales AS
SELECT date_trunc('day', created_at) AS d, SUM(amount) AS total
FROM orders
GROUP BY 1;
```

```javascript
export async function dailySales(db) {
  return db.query("SELECT * FROM daily_sales ORDER BY d DESC LIMIT 30");
}
```

#### Key Points

- DB internal caches help until working set exceeds RAM.
- Materialized views are explicit persistent cache.
- Refresh strategy defines freshness.

#### Best Practices

- Size DB instances to working set when affordable.
- Use `CONCURRENTLY` refresh when supported.
- Monitor bloat and vacuum needs.

#### Common Mistakes

- Relying on DB cache instead of fixing N+1.
- Stale materialized views in user-facing paths without labels.
- Unlogged tables for critical financial data.

---

### 20.4.2 Query Result Persistence

#### Beginner

Store **serialized GraphQL results** in **S3**, **Redis on disk (AOF/RDB)**, or **tables** for replay, auditing, or offline analytics.

#### Intermediate

**Snapshot tables** keyed by `operationHash` + day for dashboards. **Privacy**: encrypt at rest, TTL rows.

#### Expert

**Lakehouse** pipelines consume persisted results—watch **PII**. **GDPR** deletion must cascade to snapshots. **Compression** (`gzip`) reduces storage costs.

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});

export async function persistResult(key, body) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: `gql-results/${key}.json.gz`,
      Body: Buffer.from(JSON.stringify(body)),
      ServerSideEncryption: "AES256",
    }),
  );
}
```

#### Key Points

- Persistence aids analytics and debugging.
- Strong governance for personal data.
- Compression and lifecycle policies save money.

#### Best Practices

- Redact fields before persistence.
- Automate retention policies.
- Access control on snapshot buckets.

#### Common Mistakes

- Logging full GraphQL variables with passwords.
- No retention → compliance risk.
- Immutable snapshots without deletion path.

---

### 20.4.3 Snapshot Storage

#### Beginner

**Snapshots** are point-in-time copies—useful for **reports** and **rollback** of read models.

#### Intermediate

**Blue/green** deploys can warm new caches from snapshots. **ZFS/Btrfs** snapshots at infra layer are orthogonal to app design.

#### Expert

**Event-sourced** projections rebuild from events; snapshots accelerate catch-up. **Checksum** snapshots; verify restore drills.

```javascript
import fs from "node:fs/promises";

export async function writeSnapshot(name, data) {
  const path = `./snapshots/${name}.json`;
  await fs.mkdir("./snapshots", { recursive: true });
  await fs.writeFile(path, JSON.stringify(data));
}
```

#### Key Points

- Snapshots trade disk for rebuild time.
- Must be consistent with schema version.
- Test restore procedures.

#### Best Practices

- Timestamp and version snapshot names.
- Store outside app container ephemeral FS.
- Encrypt snapshots with KMS.

#### Common Mistakes

- Restoring incompatible schema snapshots.
- Partial snapshots missing dependent entities.
- No integrity verification.

---

### 20.4.4 Cache Warming

#### Beginner

**Warm** caches by preloading popular keys after deploy or before peak traffic.

#### Intermediate

Run **cron jobs** or **init containers** that execute common GraphQL operations against internal endpoints.

#### Expert

**Traffic replay** from access logs; **ML** popularity forecasts; **tiered warming** (global vs regional). Avoid **stampede** on cold Redis—use **probabilistic early refresh**.

```javascript
export async function warmPopularTags(redis, db) {
  const { rows } = await db.query(
    "SELECT * FROM tags ORDER BY usage_count DESC LIMIT 100",
  );
  for (const row of rows) {
    await redis.set(`tag:${row.id}`, JSON.stringify(row), { EX: 3600 });
  }
}
```

#### Key Points

- Warming reduces cold-start latency spikes.
- Must respect auth boundaries (don’t warm private user caches globally).
- Combine with invalidation on updates.

#### Best Practices

- Automate warming in deploy pipeline.
- Measure hit rate before/after.
- Cap concurrency to protect DB.

#### Common Mistakes

- Warming with production traffic patterns in staging only.
- Warming PII globally.
- Warming keys that immediately invalidate.

---

### 20.4.5 Cache Replication

#### Beginner

**Redis replicas** serve read scaling and failover. **Memcached** clients replicate via client-side consistent hashing across nodes—not full replication.

#### Intermediate

**Active-active** Redis is complex; often **single primary** with replicas and **sentinel**/**Redis Cluster** for HA.

#### Expert

**Cross-region replication** adds latency and consistency concerns—**CRDT** not typical for GraphQL cache values; prefer **regional caches** with **sticky routing**.

```javascript
// Read preferring replica URL (pseudo — driver-specific)
const redisPrimary = createClient({ url: process.env.REDIS_PRIMARY });
const redisReplica = createClient({ url: process.env.REDIS_REPLICA });

export async function getCached(key) {
  try {
    const v = await redisReplica.get(key);
    if (v) return v;
  } catch {
    // fall back
  }
  return redisPrimary.get(key);
}
```

#### Key Points

- Replication improves availability and read scale.
- Replica lag causes transient staleness.
- Write path still goes to primary.

#### Best Practices

- Monitor replication lag.
- Failover drills regularly.
- Document staleness tolerance.

#### Common Mistakes

- Reading from lagging replica right after write.
- Split-brain writes across regions.
- No authentication between replicas in cloud VPC gaps.

---

## 20.5 Client-Side Caching

### 20.5.1 Apollo Client Cache

#### Beginner

**Apollo Client** stores query results in an **in-memory normalized cache** so repeat queries are instant and updates can propagate.

#### Intermediate

Configure **`InMemoryCache`** with **`typePolicies`** merging rules, **`keyFields`** for entity identity, and **`possibleTypes`** for unions/interfaces.

#### Expert

**Local state** (`@client`) mixes remote and local fields—watch bundle size and mental model. **`fetchPolicy`** (`cache-first`, `network-only`, `cache-and-network`) controls behavior per query.

```javascript
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Post: { keyFields: ["id"] },
    },
  }),
});

const FEED = gql`
  query Feed {
    posts {
      id
      title
    }
  }
`;

await client.query({ query: FEED, fetchPolicy: "cache-first" });
```

#### Key Points

- Client cache reduces network and improves UX.
- Policies define identity and merge semantics.
- fetchPolicy must match freshness needs.

#### Best Practices

- Always set `keyFields` for stable IDs.
- Use fragments for reusable shapes.
- Audit sensitive data in persisted cache.

#### Common Mistakes

- Missing `id` fields preventing normalization.
- `cache-first` after mutations without updates.
- Storing secrets in `@client` fields.

---

### 20.5.2 Cache Normalization

#### Beginner

**Normalization** stores each entity once keyed by `__typename` + `id`, merging overlapping query results.

#### Intermediate

**Custom cache IDs** via `dataIdFromObject` when IDs are not globally unique—prefix with type or scope.

#### Expert

**Relay** compiler enforces stronger conventions; **Apollo** is flexible but requires discipline. **Polymorphism** needs `possibleTypes` for fragment matching.

```javascript
const cache = new InMemoryCache({
  dataIdFromObject(responseObject) {
    if (responseObject.__typename === "Photo" && responseObject.key) {
      return `Photo:${responseObject.key}`;
    }
    return undefined;
  },
});
```

```graphql
fragment PostFields on Post {
  id
  title
}
```

#### Key Points

- Normalization deduplicates graph data.
- IDs must be stable and unique in the graph.
- Polymorphic types need extra config.

#### Best Practices

- Ensure every normalized object exposes its id in queries.
- Use `keyFields: false` for singletons only when intended.
- Test cache.merge behavior for paginated lists.

#### Common Mistakes

- Duplicate logical entities with different IDs.
- Paginated lists merging incorrectly.
- Omitting `__typename` in development tools.

---

### 20.5.3 Cache Updates

#### Beginner

After **mutations**, update the cache with **`update`**, **`refetchQueries`**, or **`cache.modify`** so UI stays consistent.

#### Intermediate

**Optimistic responses** render immediately, rollback on error. **`evict`** removes stale nodes.

#### Expert

**Fragment colocation** + generated types improves safety. **Relay** updaters are more structured; Apollo `typePolicies` with **`merge`** functions handle infinite scroll lists.

```javascript
import { gql } from "@apollo/client";

const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $text: String!) {
    addComment(postId: $postId, text: $text) {
      id
      text
    }
  }
`;

await client.mutate({
  mutation: ADD_COMMENT,
  variables: { postId: "1", text: "hi" },
  update(cache, { data }) {
    const newComment = data.addComment;
    cache.modify({
      id: cache.identify({ __typename: "Post", id: "1" }),
      fields: {
        comments(existing = []) {
          return [...existing, newComment];
        },
      },
    });
  },
});
```

#### Key Points

- Mutations should define how cache evolves.
- refetchQueries is simpler but more network.
- Optimistic UI needs careful error handling.

#### Best Practices

- Prefer targeted cache updates over blanket refetch.
- Write integration tests for list mutations.
- Keep mutation selection sets aligned with cache shape.

#### Common Mistakes

- Returning too little from mutation selections.
- Forgetting paginated list edge cases.
- Optimistic IDs colliding with server IDs.

---

### 20.5.4 Cache Persistence

#### Beginner

**Persist** Apollo cache to **`localStorage`**, **IndexedDB**, or **AsyncStorage** (React Native) for faster cold starts.

#### Intermediate

Use **`apollo3-cache-persist`** with **encryption** for sensitive apps. **Throttle** writes to avoid jank.

#### Expert

**Hydration mismatches** in SSR—separate server/client caches. **Quota** limits on browsers; **purge** on logout. **Version** persisted payload with schema migrations.

```javascript
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";

const cache = new InMemoryCache();

await persistCache({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
  debounce: 500,
});
```

#### Key Points

- Persistence improves startup UX.
- Security risk if tokens or PII cached.
- Needs invalidation on logout.

#### Best Practices

- Encrypt or avoid persisting secrets.
- Debounce writes.
- Bump storage key on breaking changes.

#### Common Mistakes

- Persisting entire cache including auth headers.
- No migration path on schema change.
- Large caches slowing mobile apps.

---

### 20.5.5 Offline Support

#### Beginner

**Offline** means queued operations and cached reads when the network drops. **Apollo** `@apollo/client` links can use retry policies; full offline needs a queue.

#### Intermediate

**Service workers** intercept GraphQL calls; **Workbox** for strategies. **Mutation queues** replay on reconnect—handle **idempotency**.

#### Expert

**CRDT** or **event log** merge strategies for collaborative apps. **Conflict resolution** UX. **Secure** offline storage and **wipe** on remote lock.

```javascript
import { ApolloLink, Observable } from "@apollo/client";

const retryLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const attempt = (n) => {
      const sub = forward(operation).subscribe({
        next: observer.next.bind(observer),
        error: (err) => {
          if (n < 3) setTimeout(() => attempt(n + 1), 500 * 2 ** n);
          else observer.error(err);
        },
        complete: observer.complete.bind(observer),
      });
      return () => sub.unsubscribe();
    };
    return attempt(0);
  });
});
```

#### Key Points

- Offline requires read cache + mutation strategy.
- Idempotency keys prevent duplicate side effects.
- Security extends to device storage.

#### Best Practices

- Clear UX for pending/failed mutations.
- Test airplane mode flows.
- Server supports deduplication.

#### Common Mistakes

- Replaying mutations without idempotency.
- Stale cache presented as authoritative.
- No logout wipe of offline queue.

---

## 20.6 Advanced Caching

### 20.6.1 Multi-Layer Caching

#### Beginner

Stack **browser → CDN → app memory → Redis → DB**. Each layer has different TTL and scope.

#### Intermediate

**Thundering herd** mitigation: stagger TTLs, singleflight, request coalescing at edge.

#### Expert

**Coherence** protocols between layers—**surrogate keys** at CDN, **Redis pub/sub** to app for invalidation. **Measure** each layer’s hit ratio independently.

```javascript
async function readThroughLayers(key, loaders) {
  const l1 = memory.get(key);
  if (l1) return l1;
  const l2 = await redis.get(key);
  if (l2) {
    const v = JSON.parse(l2);
    memory.set(key, v);
    return v;
  }
  const v = await loaders.db(key);
  memory.set(key, v);
  await redis.set(key, JSON.stringify(v), { EX: 30 });
  return v;
}
```

#### Key Points

- Layers trade latency vs complexity.
- Invalidation must cascade or use TTL fallbacks.
- Independent metrics per layer.

#### Best Practices

- Document layer responsibilities.
- Use versioned keys to sync busting.
- Load test with cold caches.

#### Common Mistakes

- Inconsistent TTL causing confusing bugs.
- L1 stale while L2 fresh without plan.
- Debugging without layer tracing.

---

### 20.6.2 Cache Coherence

#### Beginner

**Coherence** means all caches agree on values after writes—hard with multiple layers and async replicas.

#### Intermediate

Strategies: **immediate invalidation**, **short TTL**, **version tokens** embedded in responses clients must send back.

#### Expert

**Strong consistency** rarely needed for all fields—**session stickiness** + **read-your-writes** via primary reads briefly after mutation. **Vector clocks** overkill for most GraphQL APIs—prefer simpler rules.

```javascript
export async function mutateAndBust(redis, mc, key, writer) {
  const v = await writer();
  await Promise.all([redis.del(key), mc.del?.(key)]);
  return v;
}
```

#### Key Points

- Perfect coherence is costly; define acceptable staleness.
- User expectations drive read-your-writes needs.
- Invalidation + TTL hybrid is common.

#### Best Practices

- Product docs state freshness SLOs.
- Critical flows bypass cache briefly.
- Monitor stale bug reports vs cache TTL.

#### Common Mistakes

- Assuming Redis invalidation updates CDN instantly.
- Ignoring mobile disk caches.
- No coherence plan for blue/green.

---

### 20.6.3 Distributed Caching

#### Beginner

**Distributed** caches span processes/hosts—**Redis Cluster**, **Memcached** pools, **CDN**.

#### Intermediate

**Partitioning** by key hash; **replication** for HA; **client** timeouts and retries with jitter.

#### Expert

**Hot key** problems: **local in-process** shard for super-hot keys; **read replicas**; **application-level sharding** of counter keys. **Quorum** NWR not typical for cache—focus on **eventual** acceptance.

```javascript
function shardKey(base, shards) {
  const h = hashCode(base) % shards;
  return `${base}:s${h}`;
}
```

#### Key Points

- Distribution enables scale and resilience.
- Hot keys need special treatment.
- Network partitions → fail open or closed explicitly.

#### Best Practices

- Hash tags in Redis cluster for related keys.
- Chaos test Redis failover.
- Rate limit origin when cache fails.

#### Common Mistakes

- One giant key for “homepage.”
- Unbounded MGET fan-out.
- No backoff causing retry storms.

---

### 20.6.4 Cache Warming Strategies

#### Beginner

**Proactive** warming vs **reactive** population on first miss—proactive smooths spikes.

#### Intermediate

Warm **top-N** keys from analytics; **time-based** warming before business hours; **dependency-ordered** warming (parents before children).

#### Expert

**ML-based** prediction; **regional** warming at PoPs; **synthetic transactions** with canary accounts. Coordinate with **feature flags** for new fields.

```javascript
export async function warmFromAnalytics(redis, db, keys) {
  await Promise.all(
    keys.map((k) =>
      singleflight(`warm:${k}`, async () => {
        const v = await db.load(k);
        await redis.set(`ent:${k}`, JSON.stringify(v), { EX: 300 });
      }),
    ),
  );
}
```

#### Key Points

- Warming strategies depend on traffic predictability.
- Must avoid violating privacy/auth.
- Combine with rate limits.

#### Best Practices

- Use analytics exports sanitized of PII.
- Limit parallelism.
- Measure post-deploy latency.

#### Common Mistakes

- Warming unauthenticated data into shared keys incorrectly.
- Warming before DB migrations complete.
- Ignoring regional differences.

---

### 20.6.5 Performance Impact

#### Beginner

Good caching **cuts latency** and **DB cost**; bad caching causes **stale bugs** and **memory bloat**.

#### Intermediate

Measure **p95 latency**, **origin QPS**, **hit rate**, **memory**, **evictions**, **errors** during outages.

#### Expert

**Cost modeling**: Redis memory $ vs RDS $; **SLO error budgets** for staleness incidents; **Game days** simulating Redis failure.

```javascript
import client from "prom-client";

const hits = new client.Counter({ name: "cache_hits_total", help: "hits" });
const misses = new client.Counter({
  name: "cache_misses_total",
  help: "misses",
});

export function recordHit(isHit) {
  (isHit ? hits : misses).inc();
}
```

#### Key Points

- Quantify impact with metrics tied to product KPIs.
- Caching shifts complexity to operations.
- Failure modes must be tested.

#### Best Practices

- Dashboard hit ratio per namespace.
- Alert on sudden miss spikes.
- Review cache costs quarterly.

#### Common Mistakes

- Optimizing hit rate without freshness KPIs.
- No runbook for cache outages.
- Ignoring client battery/cpu from aggressive prefetch.

---
