# Application Integration

**PostgreSQL learning notes (March 2026). Topic aligned with README topic 28.**

## 📑 Table of Contents

- [1. Connection from Python (`psycopg2`)](#1-connection-from-python-psycopg2)
- [2. Connection from Node.js (`pg`)](#2-connection-from-nodejs-pg)
- [3. Connection from Java (JDBC, HikariCP)](#3-connection-from-java-jdbc-hikaricp)
- [4. Connection from PHP (PDO)](#4-connection-from-php-pdo)
- [5. ORMs & Query Builders](#5-orms--query-builders)
- [6. Parameter Binding](#6-parameter-binding)
- [7. Connection Pooling](#7-connection-pooling)
- [8. Transaction Management (Application-Level)](#8-transaction-management-application-level)
- [9. Error Handling](#9-error-handling)
- [10. Batch Operations](#10-batch-operations)
- [11. JSON Exchange](#11-json-exchange)
- [12. Caching Strategies](#12-caching-strategies)
- [13. API Integration (REST, GraphQL)](#13-api-integration-rest-graphql)
- [14. Performance Optimization](#14-performance-optimization)
- [15. Data Import/Export](#15-data-importexport)

---

## 1. Connection from Python (`psycopg2`)

<a id="1-connection-from-python-psycopg2"></a>

### Beginner

`psycopg2` is the widely used PostgreSQL driver for Python. You open a connection with a DSN or keyword arguments, create a cursor, execute SQL, and fetch rows. Connections should be closed or returned to a pool to avoid exhausting server `max_connections`.

### Intermediate

Use `with conn:` context managers and `conn.cursor()` for automatic transaction boundaries in many patterns. Prefer server-side parameterized queries via `%s` placeholders (not string formatting). For async workloads, teams often choose `asyncpg`, but `psycopg2` remains common in WSGI apps.

### Expert

Experts tune `connect_timeout`, SSL modes, and `application_name` for observability. They integrate with PgBouncer using session vs transaction pooling rules and avoid incompatible session features when pooled transactionally.

```python
import psycopg2

conn = psycopg2.connect(
    host="db.example.com",
    dbname="app",
    user="appuser",
    password="secret",
    sslmode="verify-full",
    application_name="checkout-api",
)
with conn:
    with conn.cursor() as cur:
        cur.execute("SELECT now(), %s::text AS msg", ("hello",))
        print(cur.fetchone())
```

```python
# Dictionary-style rows
import psycopg2.extras
with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
    cur.execute("SELECT id, email FROM users WHERE id = %s", (42,))
    row = cur.fetchone()
```

```bash
python -m pip install "psycopg2-binary==2.9.9"
```

```yaml
# docker-compose app service environment (illustrative)
services:
  api:
    environment:
      DATABASE_URL: postgresql://appuser:secret@db:5432/app?sslmode=prefer
```

### Key Points

- Never interpolate user input into SQL strings; bind parameters.
- `autocommit` mode changes transaction semantics—set explicitly when needed.
- Cursor types affect memory use for huge result sets; use server-side cursors for bulk reads when appropriate.
- Connection errors should be retried with backoff, not tight loops.
- `application_name` shows up in `pg_stat_activity`.
- SSL modes have security implications—prefer verify-full with proper CAs.
- UTF-8 client encoding is typical; watch legacy Windows clients.

### Best Practices

- Centralize DSN construction and secrets injection.
- Use connection pools in web servers (e.g., `psycopg2.pool`).
- Log `sqlstate` from `psycopg2.Error` for better triage.
- Set `statement_timeout` at the role level for safety nets.

### Common Mistakes

- Opening a new connection per HTTP request without pooling at scale.
- Using Python string `%` or f-strings for SQL values.
- Ignoring `conn.rollback()` on exceptions without context managers.

---

## 2. Connection from Node.js (`pg`)

<a id="2-connection-from-nodejs-pg"></a>

### Beginner

The `pg` package provides a PostgreSQL client for Node.js. A `Pool` manages multiple connections. You call `pool.query` with parameterized SQL using `$1`, `$2`, placeholders.

### Intermediate

Handle async/await correctly; always catch errors. Configure `idleTimeoutMillis`, `max`, and SSL options for cloud databases. Set `application_name` in connection config for traceability.

### Expert

Experts integrate `pg` with cluster workers carefully—each worker may need its own pool limits so aggregate connections do not exceed Postgres capacity. They validate prepared statement behavior with PgBouncer transaction pooling (often problematic).

```javascript
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "db.example.com",
  database: "app",
  user: "appuser",
  password: "secret",
  ssl: { rejectUnauthorized: true },
  application_name: "orders-service",
  max: 20,
});

const res = await pool.query("select now() as ts, $1::text as msg", ["hello"]);
console.log(res.rows[0]);
```

```bash
npm install pg
```

```yaml
# Kubernetes ConfigMap for non-secret bits
data:
  PGHOST: db.prod.svc.cluster.local
  PGDATABASE: app
  PGSSLMODE: verify-full
```

### Key Points

- Pools reduce handshake overhead but require sizing discipline.
- Event loop blocking can occur with huge synchronous loops—stream large results.
- `pg` returns strings for some numeric types by default—configure parsers if needed.
- LISTEN/NOTIFY requires dedicated connections.
- Connection storms during deploys happen—use backoff and readiness gates.
- TypeScript wrappers exist but underlying behavior remains libpq-like.
- Observability: pair DB metrics with Node runtime metrics.

### Best Practices

- Export a singleton pool per process.
- Use parameterized queries exclusively.
- Add query timeouts at client or DB role level.
- Gracefully drain pools on shutdown signals.

### Common Mistakes

- Creating a new Pool per request.
- Swallowing errors without correlating `code` fields to SQLSTATE.

---

## 3. Connection from Java (JDBC, HikariCP)

<a id="3-connection-from-java-jdbc-hikaricp"></a>

### Beginner

JDBC is Java’s API for relational databases. The PostgreSQL JDBC driver connects using a URL like `jdbc:postgresql://host:5432/db`. You obtain a `Connection`, create `PreparedStatement`, set parameters, and process `ResultSet`.

### Intermediate

HikariCP is a popular high-performance connection pool. Configure `maximumPoolSize`, `minimumIdle`, `connectionTimeout`, and `dataSourceProperties` including `ApplicationName`. Use try-with-resources to close JDBC objects reliably.

### Expert

Experts tune pool sizes vs Postgres `max_connections`, validate leak detection (`leakDetectionThreshold`), and align transaction boundaries with Spring `@Transactional` semantics. They understand LSN/prepared statement pitfalls with certain proxies.

```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:postgresql://db.example.com:5432/app");
cfg.setUsername("appuser");
cfg.setPassword("secret");
cfg.setMaximumPoolSize(20);
cfg.addDataSourceProperty("ApplicationName", "payments-jvm");
HikariDataSource ds = new HikariDataSource(cfg);

try (var conn = ds.getConnection();
     var ps = conn.prepareStatement("select now() where ? = ?")) {
    ps.setInt(1, 1);
    ps.setInt(2, 1);
    try (var rs = ps.executeQuery()) {
        rs.next();
        System.out.println(rs.getTimestamp(1));
    }
}
```

```xml
<!-- Maven coordinates (illustrative versions) -->
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <version>42.7.3</version>
</dependency>
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP</artifactId>
  <version>5.1.0</version>
</dependency>
```

### Key Points

- JDBC URL parameters map to libpq-like SSL and timeout options.
- Pool sizing must be multiplied across JVM instances.
- Auto-commit defaults can surprise batch workflows—manage transactions explicitly.
- Fetch size tuning matters for large scans.
- Batch APIs (`addBatch`) improve throughput for bulk inserts.
- ORMs still generate JDBC calls underneath—know the SQL.
- Metrics: expose pool active/idle counts to monitoring.

### Best Practices

- Always use `PreparedStatement` for dynamic predicates.
- Set sane network timeouts (`socketTimeout`, `loginTimeout`).
- Validate connection health with lightweight queries on borrow when needed.
- Use separate roles for admin tasks vs application runtime.

### Common Mistakes

- Giant pool sizes causing Postgres thrashing.
- Holding connections open across external API calls inside transactions.

---

## 4. Connection from PHP (PDO)

<a id="4-connection-from-php-pdo"></a>

### Beginner

PHP Data Objects (PDO) provide a database abstraction layer. For PostgreSQL, use the `pgsql` DSN. Prepared statements use `:name` or `?` placeholders depending on style; PostgreSQL PDO typically uses positional with `?` in many examples, but named params are supported with emulation considerations.

### Intermediate

Set attributes like `ATTR_ERRMODE => ERRMODE_EXCEPTION` for safer error handling. Configure SSL modes via DSN options when supported. Frameworks like Laravel use PDO under the hood with query builders.

### Expert

Experts watch for PDO emulation settings that affect parameter binding and performance. They tune persistent connections carefully (`PDO::ATTR_PERSISTENT`) because they can exhaust server resources if misused.

```php
<?php
$dsn = 'pgsql:host=db.example.com;port=5432;dbname=app;sslmode=verify-full';
$user = 'appuser';
$pass = 'secret';
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
$stmt = $pdo->prepare('SELECT now() AS ts, :msg AS msg');
$stmt->execute(['msg' => 'hello']);
print_r($stmt->fetch());
```

```bash
php -m | grep -i pdo
```

```yaml
# php-fpm pool note: persistent connections can surprise ops
php_fpm:
  env:
    DATABASE_DSN: pgsql:host=db;dbname=app
```

### Key Points

- ERRMODE exceptions prevent silent SQL failures.
- Transactions use `beginTransaction`, `commit`, `rollBack`.
- Large result sets may need cursor-style fetching depending on driver settings.
- ORMs (Eloquent) still require understanding SQL emitted.
- Prepared statements mitigate injection risks.
- Charset issues are less central in Postgres than MySQL but locale still matters.
- Application servers may reuse workers—reset session state if you `SET` GUCs.

### Best Practices

- Centralize PDO construction in a factory.
- Log SQLSTATE codes on failures.
- Use read replicas with separate DSNs when scaling reads.

### Common Mistakes

- Using persistent connections without monitoring server connection counts.
- Building SQL with string concatenation from `$_GET`.

---

## 5. ORMs & Query Builders

<a id="5-orms--query-builders"></a>

### Beginner

ORMs (SQLAlchemy, Hibernate, Sequelize, TypeORM) map tables to objects and generate SQL. Query builders (Knex, SQLAlchemy Core) compose SQL more explicitly. Both aim to reduce boilerplate but can hide inefficient queries.

### Intermediate

Learn to log emitted SQL during development. Use migrations (Alembic, Flyway, Prisma migrate) to version schemas. Understand N+1 query problems and eager loading options.

### Expert

Experts profile ORM-generated SQL in staging with realistic data sizes. They use hybrid approaches: ORM for CRUD, hand-tuned SQL for hot paths. They tune connection/session scopes (e.g., SQLAlchemy `sessionmaker` lifecycle).

```python
# SQLAlchemy 2.0 style sketch
from sqlalchemy import create_engine, text
engine = create_engine("postgresql+psycopg2://appuser:secret@db:5432/app", pool_size=20)
with engine.connect() as conn:
    print(conn.execute(text("select :x"), {"x": 1}).scalar())
```

```typescript
// TypeORM sketch
import { DataSource } from "typeorm";
export const AppDataSource = new DataSource({
  type: "postgres",
  host: "db",
  username: "appuser",
  password: "secret",
  database: "app",
  entities: [],
  synchronize: false,
});
```

### Key Points

- ORMs trade convenience for visibility—monitor SQL.
- Lazy loading can devastate latency under traffic.
- Migrations must be coordinated with zero-downtime deploy strategies.
- Database constraints remain the source of truth—do not rely only on ORM validation.
- Type mappings can surprise (numeric, timestamp tz).
- Second-level caches (Hibernate) interact badly with wrong boundaries.
- Query builders still need parameter binding discipline.

### Best Practices

- Add integration tests that assert query counts on critical endpoints.
- Use database transactions around logical units of work.
- Document “escape hatches” for raw SQL in coding standards.

### Common Mistakes

- Using `synchronize: true` against production databases.
- Fetching entire tables into memory via ORM list operations.

---

## 6. Parameter Binding

<a id="6-parameter-binding"></a>

### Beginner

Parameter binding passes values separately from SQL text so the server can parse once and execute safely. This prevents SQL injection and improves plan cache behavior.

### Intermediate

Different drivers use different placeholder styles (`$1`, `%s`, `?`). Cast types in SQL (`$1::uuid`) when needed. Avoid dynamic identifier injection—whitelist column/table names in application code.

### Expert

Experts audit ORMs for unsafe raw APIs (`text()` concatenation). They understand server-side prepared statements vs client-side binding and interactions with connection poolers.

```sql
PREPARE p AS SELECT * FROM users WHERE email = $1;
EXECUTE p USING 'user@example.com';
DEALLOCATE p;
```

```python
cur.execute("INSERT INTO t(v) VALUES (%s)", (value,))
```

```javascript
await pool.query("INSERT INTO t(v) VALUES ($1)", [value]);
```

### Key Points

- Binding values is not the same as binding identifiers.
- Dynamic ORDER BY requires careful whitelisting, not parameter binding alone.
- Some drivers send unnamed statements each time—performance varies.
- Arrays and JSON need driver-specific adaptations.
- Null vs undefined/null pointer semantics differ across languages.
- SQL injection remains possible through string-built identifiers.
- Explain plans should use production-like parameter types.

### Best Practices

- Code review checklist item: “No string SQL concatenation with user input.”
- Use UUID types consistently to avoid implicit casts.
- Add lint rules where available for risky raw query functions.

### Common Mistakes

- Interpolating table names from user input “with validation” that is incomplete.
- Using ORM `.where(`raw...`)` patterns without constants.

---

## 7. Connection Pooling

<a id="7-connection-pooling"></a>

### Beginner

Pools reuse TCP connections and backend sessions to reduce overhead. Application-side pools (Hikari, `pg.Pool`, SQLAlchemy) sit in front of Postgres. Server-side poolers (PgBouncer) multiplex many clients onto fewer server connections.

### Intermediate

Choose pool sizes based on `(app_instances * pool_max) <= max_connections - admin_headroom`. PgBouncer `pool_mode=transaction` increases density but restricts session features (`SET`, temp tables, prepared statements).

### Expert

Experts model queueing theory: too-small pools create latency; too-large pools create contention. They validate pool timeouts vs `statement_timeout` and watch `idle in transaction` sessions.

```yaml
pgbouncer:
  pool_mode: transaction
  max_client_conn: 5000
  default_pool_size: 50
  reserve_pool_size: 10
```

```sql
SELECT count(*) FROM pg_stat_activity;
```

```javascript
const pool = new Pool({ max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 });
```

### Key Points

- Pools do not remove the need for query tuning.
- Transaction pooling changes semantics—test carefully.
- Prepared statements + transaction pooling = common footgun.
- Pool metrics should be dashboarded (wait time, active, idle).
- Rolling deploys may temporarily double connections—plan for it.
- Read/write splitting needs driver or proxy support.
- Health checks should be lightweight (`SELECT 1`).

### Best Practices

- Load test pool settings before peak season.
- Document forbidden session features when using transaction pooling.
- Use separate pools/users for admin operations if needed.

### Common Mistakes

- Setting `max_connections` huge instead of fixing pool sizes.
- Holding pooled connections across `await` calls to unrelated slow APIs.

---

## 8. Transaction Management (Application-Level)

<a id="8-transaction-management-application-level"></a>

### Beginner

A transaction bundles operations with ACID guarantees. Applications should `BEGIN`, do work, then `COMMIT` or `ROLLBACK`. Many frameworks wrap routes/controllers in transactions.

### Intermediate

Keep transactions short—do not call external HTTP APIs inside transactions. Use isolation levels (`READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`) deliberately. Handle serialization failures with retry loops where appropriate.

### Experts

Experts design idempotent APIs to make retries safe, use `SELECT … FOR UPDATE` thoughtfully, and align DB transactions with outbox patterns for reliable messaging.

```python
with conn:
    with conn.cursor() as cur:
        cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (10, 1))
        cur.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (10, 2))
```

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT * FROM seats WHERE flight_id = 42 FOR UPDATE;
UPDATE seats SET held_by = $1 WHERE flight_id = 42 AND seat = $2;
COMMIT;
```

### Key Points

- Long transactions block vacuum and increase bloat risk.
- Retries must be limited and instrumented.
- Savepoints add complexity—use sparingly.
- ORMs may start implicit transactions—know defaults.
- Distributed transactions across unrelated databases are hard—avoid naive 2PC.
- Application errors should not leave connections idle in transaction.
- `READ COMMITTED` is default for good reasons but not always enough.

### Best Practices

- Add middleware hooks to log slow transactions.
- Use database constraints to enforce invariants—not only app checks.
- Document isolation level per use case (billing vs analytics).

### Common Mistakes

- Swallowing exceptions without rolling back.
- Using SERIALIZABLE everywhere without handling conflicts.

---

## 9. Error Handling

<a id="9-error-handling"></a>

### Beginner

Database errors map to SQLSTATE codes (e.g., `23505` unique violation). Applications should catch driver exceptions, log structured fields (`sqlstate`, message, query context), and translate user-facing errors carefully without leaking internals.

### Intermediate

Implement retries for transient errors (serialization failure, deadlocks) with exponential backoff and jitter. Do not blindly retry uniqueness violations. Map connection errors separately from SQL errors.

### Expert

Experts build standardized error taxonomies across services, correlate with Postgres logs using `application_name` and request IDs, and integrate with OpenTelemetry spans around DB calls.

```python
import psycopg2
try:
    cur.execute("INSERT INTO users(email) VALUES (%s)", (email,))
except psycopg2.errors.UniqueViolation:
    # handle conflict
    conn.rollback()
```

```javascript
import pg from "pg";
try {
  await pool.query("INSERT INTO users(email) VALUES ($1)", [email]);
} catch (e) {
  if (e.code === "23505") {
    // conflict
  }
  throw e;
}
```

```yaml
http_api:
  error_shape:
    code: string
    message: safe_for_client
    trace_id: uuid
```

### Key Points

- SQLSTATE is more stable than English error text.
- Timeouts manifest as distinct errors—treat as retriable sometimes.
- Constraint names help disambiguate duplicate conflicts.
- Serialization failures require business-level retry safety.
- Logging full SQL with literals may leak PII—scrub carefully.
- Connection pool exhaustion surfaces as client-side timeouts—monitor separately.
- ORMs wrap exceptions—unwrap for details when needed.

### Best Practices

- Centralize DB exception mapping in one module per service.
- Add integration tests for deadlock retry behavior.
- Document which endpoints are idempotent for safe retries.

### Common Mistakes

- Infinite retry loops on auth failures.
- Returning raw SQL error text to browsers.

---

## 10. Batch Operations

<a id="10-batch-operations"></a>

### Beginner

Batching reduces round trips: multi-row `INSERT VALUES`, JDBC batch APIs, or `COPY`. Choose batch sizes balancing memory and transaction duration.

### Intermediate

Use a single transaction for bulk loads but watch WAL and lock duration. `COPY FROM STDIN` is fastest for large imports when acceptable. For updates, consider staging tables plus `INSERT ... SELECT` patterns.

### Expert

Experts tune `synchronous_commit` off temporarily for specialized bulk loads (only with explicit risk acceptance). They partition batches to avoid long row-level locks on hot tables.

```sql
BEGIN;
INSERT INTO t(v) VALUES (1),(2),(3);
COMMIT;
```

```sql
COPY t(v) FROM STDIN WITH (FORMAT csv);
-- data lines then \.
```

```java
try (PreparedStatement ps = conn.prepareStatement("insert into t(v) values (?)")) {
  for (int v : values) {
    ps.setInt(1, v);
    ps.addBatch();
  }
  ps.executeBatch();
}
```

### Key Points

- Huge batches in one transaction risk long locks and replication lag.
- `COPY` usually beats row-by-row inserts for ingest.
- ORMs may not optimize batching—verify SQL.
- Triggers fire per row—batch loads interact with trigger costs.
- Unique index checks still apply—batch errors can be partial by statement.
- Replication applies batches as WAL—monitor standby apply.
- Use `UNLOGGED` tables only with full understanding of durability loss.

### Best Practices

- Choose batch sizes empirically (1k–10k often a starting range).
- Disable unnecessary indexes temporarily only with a written plan.
- Follow bulk load with `ANALYZE`.

### Common Mistakes

- One giant transaction importing millions of rows on OLTP primaries.
- Using ORM saves in tight loops without batch APIs.

---

## 11. JSON Exchange

<a id="11-json-exchange"></a>

### Beginner

PostgreSQL `json` and `jsonb` types store structured payloads. Applications often map JSON columns to native types (Python `dict`, JS objects). Use parameterized binding for JSON values.

### Intermediate

Prefer `jsonb` for indexing with GIN. Use `->`, `->>`, `@>` operators in SQL for server-side filtering. Validate JSON shape at the application boundary with schemas (JSON Schema, pydantic).

### Expert

Experts use generated columns and partial indexes for hot keys inside JSON. They understand write amplification and autovacuum interactions for wide JSON documents.

```sql
CREATE TABLE events(id bigserial primary key, payload jsonb not null);
INSERT INTO events(payload) VALUES ($1::jsonb);
```

```python
import json
cur.execute("INSERT INTO events(payload) VALUES (%s)", [json.dumps(obj)])
```

```typescript
await pool.query("insert into events(payload) values ($1::jsonb)", [payload]);
```

### Key Points

- Cast parameters to `jsonb` in SQL for correct typing.
- Index only extract paths you query—GIN indexes are not free.
- JSON storage is flexible but shifts validation burden to apps.
- Large JSON slows network I/O—project columns when possible.
- Updates rewrite JSON documents—consider normalization for hot fields.
- Use constraints and check clauses where feasible.
- Be careful logging JSON containing secrets.

### Best Practices

- Keep canonical business fields as relational columns when stable.
- Version event schemas for compatibility.
- Monitor table bloat for churny JSON rows.

### Common Mistakes

- Storing everything in JSON because migrations feel hard.
- Missing indexes leading to full table scans on JSON predicates.

---

## 12. Caching Strategies

<a id="12-caching-strategies"></a>

### Beginner

Caching reduces database load: browser caches, HTTP caches, application in-memory caches (Redis), and materialized views inside Postgres. Every cache needs an invalidation story.

### Intermediate

Use cache-aside: read cache, on miss query DB, populate cache with TTL. For read-heavy dashboards, consider materialized views refreshed on schedules. Avoid caching authenticated user-specific data without key scoping.

### Expert

Experts implement cache stampede protection, use transactional outbox for eventual consistency, and measure hit ratio vs staleness SLOs. They know ORM second-level caches are easy to misuse.

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY sales_daily;
```

```yaml
redis:
  default_ttl_seconds: 30
  key_prefix: "app:v1"
```

### Key Points

- Stale cache bugs are subtle—define acceptable staleness.
- TTL alone is not enough for strongly consistent reads.
- Postgres is not a memcached replacement—size workloads appropriately.
- Write-through caches complicate error handling.
- Invalidation on schema changes must be planned.
- Local in-process caches diverge across instances—prefer Redis for shared.
- Cache poisoning is a security concern for user-controlled keys.

### Best Practices

- Add metrics: hit/miss, latency, size.
- Document which endpoints are eventually consistent.
- Use versioned cache keys when deploying schema changes.

### Common Mistakes

- Caching entire table dumps on every instance boot.
- Forgetting to invalidate on admin updates.

---

## 13. API Integration (REST, GraphQL)

<a id="13-api-integration-rest-graphql"></a>

### Beginner

REST APIs expose resources mapped to tables via handlers. GraphQL resolvers query Postgres—often N+1 prone without dataloaders. Pagination uses `LIMIT/OFFSET` or keyset pagination (`WHERE id > $cursor`).

### Intermediate

Prefer keyset pagination for large datasets. Use `EXPLAIN` on resolver queries. For GraphQL, batch and cache per request to collapse queries.

### Expert

Experts enforce field-level authorization at SQL layers (RLS) rather than only in resolvers. They implement persisted queries and complexity limits to prevent abusive GraphQL patterns.

```sql
-- Keyset pagination example
SELECT id, title FROM posts WHERE id > $1 ORDER BY id ASC LIMIT 50;
```

```graphql
type Query {
  posts(after: ID): PostConnection
}
```

```yaml
api:
  pagination: keyset
  max_page_size: 100
```

### Key Points

- OFFSET pagination degrades linearly—avoid for big tables.
- GraphQL `filter` arguments tempt dynamic SQL—whitelist fields.
- OpenAPI/JSON schema docs should align with DB constraints.
- Rate limiting protects DB from abusive clients.
- Batch endpoints reduce chatter but increase payload complexity.
- Use read replicas for read-heavy endpoints when staleness ok.
- Observability: trace IDs across API and DB spans.

### Best Practices

- Add integration tests for pagination correctness.
- Use database constraints to enforce API invariants cheaply.
- Monitor p95 resolver latency per field in GraphQL.

### Common Mistakes

- Resolver-per-row queries without batching.
- Exposing raw SQL sort parameters.

---

## 14. Performance Optimization

<a id="14-performance-optimization"></a>

### Beginner

Optimize hot queries with indexes and better SQL. Measure with `EXPLAIN ANALYZE` in staging. Reduce selected columns and avoid `SELECT *` in APIs.

### Intermediate

Align connection pools, batch operations, and caching. Add covering indexes (`INCLUDE`) where helpful. Keep statistics fresh with `ANALYZE` after large changes.

### Expert

Experts profile end-to-end latency (DNS, TLS, pool wait, query time). They adopt read replicas, partition large tables, and consider sharding only when single-node limits are real.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20;
```

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cust_created
ON orders (customer_id, created_at DESC);
```

### Key Points

- Application changes can fix more than indexes alone.
- ORM logs are a first-class tuning source.
- Parallelism and JIT help analytics, not always OLTP.
- Schema design impacts write amplification—index count matters.
- Anti-patterns: functions on indexed columns in WHERE.
- Partial indexes match partial queries—powerful pattern.
- Monitor replication lag when offloading reads.

### Best Practices

- Maintain a top-10 slow queries review monthly.
- Add performance tests to CI for critical endpoints.
- Document SLOs and error budgets for DB dependencies.

### Common Mistakes

- Indexing every column mentioned in a slow query without measuring selectivity.
- Tuning queries in dev with tiny datasets.

---

## 15. Data Import/Export

<a id="15-data-importexport"></a>

### Beginner

`COPY` moves data quickly. Export CSV for spreadsheets; import CSV for migrations. `pg_dump`/`pg_restore` handle logical backups at schema + data level.

### Intermediate

For zero-downtime migrations, combine replication or dual-write strategies with validation jobs. Use foreign data wrappers for cross-db pulls when appropriate.

### Expert

Experts automate large cutovers with checksum validation, backoff plans, and feature flags. They tune `session_replication_role` only with extreme care during specialized loads.

```sql
COPY users(id, email) TO STDOUT WITH (FORMAT csv, HEADER true);
```

```sql
COPY staging_users(id, email) FROM STDIN WITH (FORMAT csv, HEADER true);
```

```bash
pg_dump -Fc -d app > app.dump
pg_restore -d app_new --jobs=4 app.dump
```

### Key Points

- CSV encoding and NULL markers must match (`\N`, etc.).
- Triggers and constraints affect import speed and correctness.
- Large imports should run in controlled windows with monitoring.
- Disk space must account for WAL and temporary files.
- Permissions: `COPY TO` needs select; `COPY FROM` needs insert.
- Cloud storage imports may use extensions or external loaders.
- Always validate row counts and hashes post-migration.

### Best Practices

- Stage imports into `UNLOGGED` or temp tables only with explicit risk notes.
- Build repeatable scripts stored in version control.
- Take backups before destructive imports.

### Common Mistakes

- Importing unsanitized CSV leading to constraint violations mid-file.
- Running `pg_restore` against prod without a transaction strategy.

---

## Appendix: Cross-Language Cheat Sheet

```sql
-- Safe parameter examples
SELECT * FROM users WHERE email = $1;
```

```python
cur.execute("select * from users where email = %s", (email,))
```

```javascript
await pool.query("select * from users where email = $1", [email]);
```

```java
ps.setString(1, email);
```

```php
$stmt->execute(['email' => $email]);
```

### Key Points (Cheat Sheet)

- Placeholder syntax differs; semantics are the same.

### Best Practices (Cheat Sheet)

- Pin dependency versions in services.

### Common Mistakes (Cheat Sheet)

- Mixing placeholder styles within one statement incorrectly.

---

## Extended Appendix: Integration Patterns & Templates

### Pattern — Repository with explicit transactions

```python
class UserRepo:
    def __init__(self, conn):
        self.conn = conn

    def create_user(self, email: str) -> int:
        with self.conn:
            with self.conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO users(email) VALUES (%s) RETURNING id",
                    (email,),
                )
                return cur.fetchone()[0]
```

### Key Points (Repository)

- Keeping transactions short aids correctness and performance.

### Best Practices (Repository)

- Inject connections for testability.

### Common Mistakes (Repository)

- Sharing one connection across threads without safety.

---

### Pattern — Node service shutdown

```javascript
async function shutdown() {
  await pool.end();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
```

### Key Points (Shutdown)

- Draining pools prevents abrupt disconnect storms during deploys.

### Best Practices (Shutdown)

- Add timeouts to forced exit paths.

### Common Mistakes (Shutdown)

- Ignoring SIGTERM in containers.

---

### Pattern — Java Spring @Transactional sketch

```java
// Pseudocode-level; real apps use Spring Data
@Transactional
public void transfer(long from, long to, BigDecimal amt) {
  jdbcTemplate.update("update accounts set balance = balance - ? where id = ?", amt, from);
  jdbcTemplate.update("update accounts set balance = balance + ? where id = ?", amt, to);
}
```

### Key Points (Spring)

- Transaction proxies only work on public methods invoked through Spring bean proxies—know the rules.

### Best Practices (Spring)

- Keep transactional methods small.

### Common Mistakes (Spring)

- Self-invocation bypassing transactional proxy.

---

### Pattern — PHP transaction

```php
$pdo->beginTransaction();
try {
    $pdo->prepare("UPDATE accounts SET balance = balance - :a WHERE id = :id")->execute(['a'=>10,'id'=>1]);
    $pdo->prepare("UPDATE accounts SET balance = balance + :a WHERE id = :id")->execute(['a'=>10,'id'=>2]);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}
```

### Key Points (PHP)

- Always roll back on exceptions.

### Best Practices (PHP)

- Use framework DB layers when available for consistency.

### Common Mistakes (PHP)

- Committing partial work accidentally.

---

### GraphQL DataLoader sketch

```javascript
const DataLoader = require("dataloader");
const userLoader = new DataLoader(async (ids) => {
  const res = await pool.query("select * from users where id = any($1::int[])", [ids]);
  const map = new Map(res.rows.map((u) => [u.id, u]));
  return ids.map((id) => map.get(id));
});
```

### Key Points (DataLoader)

- Batches per tick reduce N+1 queries dramatically.

### Best Practices (DataLoader)

- Scope loaders per request to avoid cache leaks.

### Common Mistakes (DataLoader)

- Reusing loaders across users without keying.

---

### OpenAPI + DB constraint alignment

```yaml
components:
  schemas:
    User:
      required: [email]
      properties:
        email:
          type: string
          format: email
          maxLength: 320
```

```sql
ALTER TABLE users ADD CONSTRAINT email_len CHECK (char_length(email) <= 320);
```

### Key Points (OpenAPI)

- Dual validation reduces bad rows early.

### Best Practices (OpenAPI)

- Generate migrations from schema reviews intentionally.

### Common Mistakes (OpenAPI)

- Letting API accept values DB rejects routinely.

---

### Observability: annotate SQL comments

```javascript
await pool.query("/* svc=orders route=POST_/v1/orders */ insert into orders(user_id) values ($1)", [userId]);
```

### Key Points (Comments)

- Helps correlate `pg_stat_activity` with HTTP routes.

### Best Practices (Comments)

- Standardize comment format to parse in logs.

### Common Mistakes (Comments)

- Including PII in comments.

---

### Read replica routing guardrails

```yaml
routing:
  default: primary
  reports:
    dsn: postgresql://ro@replica:5432/app
    max_lag_seconds: 30
```

### Key Points (Routing)

- Stale reads must be acceptable for routed traffic.

### Best Practices (Routing)

- Feature-flag replica usage per endpoint.

### Common Mistakes (Routing)

- Sending financial writes to replicas accidentally.

---

### Bulk export to S3 pattern (conceptual)

```bash
psql -c "\copy (select * from big_table where dt >= '2025-01-01') TO 'big.csv' WITH CSV HEADER"
aws s3 cp big.csv s3://bucket/exports/big.csv
```

### Key Points (S3)

- `\copy` runs client-side—run near data or accept transfer costs.

### Best Practices (S3)

- Encrypt objects and manage lifecycle policies.

### Common Mistakes (S3)

- OOM on huge exports without chunking.

---

### JSON Schema validation in API before insert

```typescript
import Ajv from "ajv";
const ajv = new Ajv();
const validate = ajv.compile(schema);
if (!validate(payload)) throw new Error("invalid payload");
await pool.query("insert into events(payload) values ($1::jsonb)", [payload]);
```

### Key Points (JSON Schema)

- Validate early to save DB work and give better errors.

### Best Practices (JSON Schema)

- Version schemas.

### Common Mistakes (JSON Schema)

- Validating in API but not enforcing constraints in DB.

---

### Caching key versioning

```text
cache:v2:user:123:profile
```

### Key Points (Keys)

- Bump versions during breaking schema changes.

### Best Practices (Keys)

- Include tenant identifiers in multi-tenant systems.

### Common Mistakes (Keys)

- Too-generic keys causing collisions.

---

### Rate limiting DB-heavy endpoints

```yaml
middleware:
  rate_limit:
    per_ip: 100rps
    per_user: 20rps
```

### Key Points (Rate limit)

- Protects shared DB from abusive traffic.

### Best Practices (Rate limit)

- Return 429 with Retry-After headers.

### Common Mistakes (Rate limit)

- Limiting only at edge while internal bypass exists.

---

### Migration compatibility: expand/contract

```yaml
phases:
  - expand: add_column_nullable
  - dual_write: app_writes_both
  - backfill: job_fills_old_column
  - contract: make_not_null_drop_old
```

### Key Points (Expand)

- Zero-downtime needs phased deploys.

### Best Practices (Expand)

- Automate backfill with resumable jobs.

### Common Mistakes (Expand)

- Adding NOT NULL without backfill.

---

### Final integration readiness checklist

```yaml
checklist:
  sql_injection: parameterized_only
  pooling: sized_and_monitored
  migrations: reviewed
  timeouts: statement_and_client
  observability: application_name_set
  secrets: not_in_repo
```

### Key Points (Checklist)

- Security and performance are linked at the integration layer.

### Best Practices (Checklist)

- Automate checklist in CI for new services.

### Common Mistakes (Checklist)

- Treating checklists as paperwork instead of gates.

---

## Extended Appendix: Security, SQLAlchemy, Sequelize, Hibernate Notes

### SQLAlchemy session scope (web requests)

```python
from sqlalchemy.orm import sessionmaker, Session
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Key Points (SQLAlchemy sessions)

- One session per request is a common pattern; avoid global singleton sessions.

### Best Practices (SQLAlchemy sessions)

- Use `expire_on_commit` settings thoughtfully for API JSON serialization.

### Common Mistakes (SQLAlchemy sessions)

- Leaving sessions open across streaming responses unintentionally.

---

### Sequelize: pool + retry sketch

```javascript
import { Sequelize } from "sequelize";
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  pool: { max: 20, min: 0, acquire: 2000, idle: 10000 },
  retry: { max: 3 },
});
```

### Key Points (Sequelize)

- ORM pool settings must align with process count.

### Best Practices (Sequelize)

- Disable sync in production; use migrations.

### Common Mistakes (Sequelize)

- Using raw queries without binding because “it’s faster”.

---

### Hibernate: second-level cache caution

```text
Second-level caching requires careful entity immutability assumptions and invalidation across instances.
Prefer explicit caching layers (Redis) for many web systems.
```

### Key Points (Hibernate cache)

- Distributed invalidation is hard—default to no second-level cache unless needed.

### Best Practices (Hibernate cache)

- Measure L2 hit ratio before relying on it.

### Common Mistakes (Hibernate cache)

- Caching entities that change frequently.

---

### TypeORM migrations

```bash
npx typeorm migration:run -d dist/data-source.js
```

### Key Points (TypeORM)

- Build step must be correct for `-d` path in production containers.

### Best Practices (TypeORM)

- Test rollback strategies.

### Common Mistakes (TypeORM)

- Running migrations without backups.

---

### PHP Doctrine DBAL parameter binding

```php
$conn->executeQuery('SELECT * FROM users WHERE email = ?', [$email]);
```

### Key Points (Doctrine)

- DBAL is closer to JDBC than full ORM—still parameterized.

### Best Practices (Doctrine)

- Prefer repositories with typed methods.

### Common Mistakes (Doctrine)

- Mixing native SQL without binding.

---

### Row-Level Security-aware connections

```sql
SET LOCAL app.tenant_id = 'tenant-uuid';
SELECT * FROM invoices; -- policies use current_setting
```

```python
with conn:
    with conn.cursor() as cur:
        cur.execute("SET LOCAL app.tenant_id = %s", (tenant_id,))
        cur.execute("SELECT * FROM invoices")
```

### Key Points (RLS)

- `SET LOCAL` ties setting to transaction scope—good for SaaS.

### Best Practices (RLS)

- Combine RLS with least-privilege DB roles.

### Common Mistakes (RLS)

- Setting tenant id in a pool without resetting—dangerous; use transaction boundaries.

---

### Secrets management patterns

```yaml
externalSecrets:
  provider: aws-secrets-manager
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: prod/app/db
```

### Key Points (Secrets)

- Prefer DSN strings from secret stores over assembling passwords in code.

### Best Practices (Secrets)

- Rotate credentials with dual-password windows when supported.

### Common Mistakes (Secrets)

- Logging DSNs during startup debug.

---

### Prepared statements + PgBouncer note

```text
Transaction pooling often breaks unnamed prepared statement reuse patterns.
Use pool modes and driver settings compatible with your pooler.
```

### Key Points (PgBouncer)

- Node `pg` prepared statements require session pooling or careful configuration.

### Best Practices (PgBouncer)

- Document forbidden features for app teams.

### Common Mistakes (PgBouncer)

- Enabling transaction pooling without testing all services.

---

### Outbox pattern SQL sketch

```sql
CREATE TABLE outbox (
  id bigserial primary key,
  topic text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
```

```python
with conn:
    with conn.cursor() as cur:
        cur.execute("INSERT INTO orders(user_id) VALUES (%s) RETURNING id", (user_id,))
        oid = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO outbox(topic, payload) VALUES (%s, %s::jsonb)",
            ("orders.created", json.dumps({"id": oid})),
        )
```

### Key Points (Outbox)

- Enables reliable async processing without dual-write races.

### Best Practices (Outbox)

- Add deduplication keys for consumers.

### Common Mistakes (Outbox)

- Letting outbox grow without compaction jobs.

---

### GraphQL complexity limits

```yaml
graphql:
  validation_rules:
    max_query_depth: 12
    max_query_complexity: 1000
```

### Key Points (Complexity)

- Prevents malicious queries from melting the DB.

### Best Practices (Complexity)

- Tune limits using production query histograms.

### Common Mistakes (Complexity)

- Setting limits so high they provide no protection.

---

### REST pagination metadata

```json
{
  "items": [],
  "next_cursor": "abc123"
}
```

### Key Points (REST)

- Cursors should be opaque, stable identifiers.

### Best Practices (REST)

- Avoid leaking internal row ids if security requires opaque tokens.

### Common Mistakes (REST)

- Using OFFSET for mobile infinite scroll at scale.

---

### COPY vs INSERT decision matrix

| Scenario | Prefer |
|---------|--------|
| Initial bulk load | COPY |
| Online app writes | parameterized INSERT |
| Cross-version migrate | pg_dump/pg_restore or logical replication |
| ETL staging | COPY into staging, then set-based transform |

### Key Points (matrix)

- Tool choice depends on downtime tolerance.

### Best Practices (matrix)

- Rehearse migrations on cloned data volumes.

### Common Mistakes (matrix)

- Using COPY for user-uploaded CSV without validation.

---

