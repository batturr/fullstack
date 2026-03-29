# Indexes and Performance

**PostgreSQL learning notes (March 2026). Aligned with README topic 13.**

---

## 📑 Table of Contents

- [1. Index Basics](#1-index-basics)
- [2. B-Tree Indexes](#2-b-tree-indexes)
- [3. Index Types (Unique, Non-Unique, Implicit)](#3-index-types-unique-non-unique-implicit)
- [4. Hash Indexes](#4-hash-indexes)
- [5. GiST Indexes](#5-gist-indexes)
- [6. GIN Indexes](#6-gin-indexes)
- [7. BRIN Indexes](#7-brin-indexes)
- [8. Multi-Column Indexes](#8-multi-column-indexes)
- [9. Partial Indexes](#9-partial-indexes)
- [10. Expression Indexes](#10-expression-indexes)
- [11. Index Statistics](#11-index-statistics)
- [12. Index Maintenance (REINDEX, VACUUM, Bloat)](#12-index-maintenance-reindex-vacuum-bloat)
- [13. Index Selection](#13-index-selection)
- [14. Index Performance (Scan Types & Planner)](#14-index-performance-scan-types--planner)
- [15. Covering Indexes (INCLUDE)](#15-covering-indexes-include)
- [16. Index Monitoring & Optimization](#16-index-monitoring--optimization)

---

## 1. Index Basics

<a id="1-index-basics"></a>

### Beginner

An index is a separate data structure that helps PostgreSQL find rows quickly without scanning every page of a table. Think of a book index: you jump to the right page instead of reading cover to cover. PostgreSQL stores indexes on disk alongside tables; they speed up `WHERE`, `JOIN`, and `ORDER BY` when the planner chooses to use them.

### Intermediate

Indexes trade **extra disk space** and **write overhead** (every `INSERT`/`UPDATE`/`DELETE` may touch index pages) for faster reads on matching patterns. The default access method for many types is **B-tree**. The planner compares estimated costs of sequential scan vs index paths using statistics. Indexes do not change query results—only performance characteristics (and uniqueness enforcement when defined as `UNIQUE`).

### Expert

Internally, indexes are **relation files** with their own storage (forks), WAL records, and visibility interactions. Heap tuples carry `ctid`; index entries point to heap locations (except for some special cases). **Index-only scans** require the visibility map to confirm all-visible pages. Partial bloat, **fillfactor**, and **deduplication** (modern versions) affect page density and split behavior.

```sql
-- Simple table and B-tree index on a filter column
CREATE TABLE orders (
  id          bigserial PRIMARY KEY,
  customer_id bigint NOT NULL,
  status      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_customer_id_idx ON orders (customer_id);

-- Typical selective lookup (often uses index)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42 AND status = 'open';

-- Index also helps some ORDER BY / JOIN patterns on indexed keys
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 50;
```

### Key Points

- Indexes accelerate access paths the planner can legally apply to your predicates.
- Every index adds maintenance cost on writes and uses disk and cache.
- Primary keys and unique constraints create backing indexes automatically.
- Wrong or redundant indexes can slow workloads without helping reads.
- Index usage depends on **selectivity**, **statistics**, and **cost parameters**.

### Best Practices

- Index columns that appear in **highly selective** `WHERE` clauses and join keys.
- Start with foreign keys and obvious filter columns; measure with `EXPLAIN (ANALYZE)`.
- Keep the number of indexes proportional to read/write mix; OLTP often needs fewer, narrower indexes.
- Document why each index exists (runbook or migration comment).

### Common Mistakes

- Creating indexes “just in case” without profiling real queries.
- Expecting indexes to help `WHERE lower(email)` when the index is only on `email` (needs expression index or matching predicate).
- Ignoring **correlation** and **stale statistics**, then misreading “why no index?”.

### Additional SQL Patterns & Scenarios (Basics)

```sql
-- Verify existing indexes on a table
SELECT c.relname AS table_name, i.relname AS index_name, am.amname AS access_method,
       pg_get_indexdef(i.oid) AS definition
FROM pg_class c
JOIN pg_index ix ON c.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_am am ON i.relam = am.oid
WHERE c.relname = 'orders' AND c.relkind = 'r';
```

When prototyping, use `EXPLAIN` without `ANALYZE` for quick plan shape checks; add `ANALYZE` on representative environments to see real timings.

---

## 2. B-Tree Indexes

<a id="2-b-tree-indexes"></a>

### Beginner

A **B-tree** index orders values so PostgreSQL can binary-search through tree levels down to a leaf page. It supports equality and range comparisons (`=`, `<`, `>`, `BETWEEN`, `ORDER BY` compatible sorts) for the indexed data type’s btree operator class.

### Intermediate

Leaves contain index tuples pointing to heap `ctid`s (or include columns for covering scans). Splits and merges keep the tree balanced. **Duplicates** are allowed in non-unique btree indexes; uniqueness is enforced by unique indexes. **NULLs** are indexable and sort to one side per version/operator class behavior—be explicit in queries involving `NULL`.

### Expert

B-tree is the **workhorse** access method: GiST/GIN/BRIN serve specialized domains. Planner choices include **bitmap index scans** combining multiple btree-compatible conditions. **Dedup** reduces redundancy for duplicate-heavy indexes. Tuning `fillfactor` on indexes can reduce page splits on append-heavy patterns at the cost of space.

```sql
-- Range scan friendly btree
CREATE INDEX orders_created_at_idx ON orders (created_at);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE created_at >= timestamptz '2026-01-01'
  AND created_at <  timestamptz '2026-02-01';

-- Composite btree: leftmost prefix rule
CREATE INDEX orders_cust_created_idx ON orders (customer_id, created_at);

-- Can use index for customer_id alone OR (customer_id, created_at) patterns
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 99;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 99 AND created_at > now() - interval '7 days';
```

### Key Points

- B-tree supports **sorting and range** predicates for standard scalar types.
- Composite btree indexes require careful **column order** for prefix usage.
- Unique btree indexes enforce uniqueness and speed lookups simultaneously.
- High churn tables may suffer **index bloat**; monitor and maintain.

### Best Practices

- Choose btree unless documentation clearly points to GiST/GIN/BRIN/hash for your workload.
- For mixed predicates, put the **most selective** leading column when using equality prefixes.
- Rebuild or reindex after bulk loads if bloat is severe (test concurrent options in production).

### Common Mistakes

- Assuming btree helps `LIKE '%foo'` leading wildcard (it generally does not).
- Using wrong column order then wondering why the second column filter alone never uses the index.

### Additional SQL Patterns & Scenarios (B-Tree)

```sql
-- Prefix vs non-prefix usage on composite btree
CREATE INDEX demo_ab_idx ON orders (customer_id, status);
EXPLAIN SELECT * FROM orders WHERE customer_id = 1;
EXPLAIN SELECT * FROM orders WHERE status = 'open';
```

If you need both patterns independently, you may maintain **separate** indexes, but measure write amplification before doing so.

---

## 3. Index Types (Unique, Non-Unique, Implicit)

<a id="3-index-types-unique-non-unique-implicit"></a>

### Beginner

**Unique** indexes enforce that indexed values (or combinations) appear at most once (with `NULL` uniqueness rules per SQL semantics). **Non-unique** indexes speed lookups without enforcing uniqueness. **Implicit** indexes are created automatically for primary keys and unique constraints.

### Intermediate

`CREATE UNIQUE INDEX` vs `ALTER TABLE ... ADD CONSTRAINT UNIQUE` both create unique indexes; constraints add catalog metadata for relational integrity. **Partial unique** indexes enforce uniqueness only for a subset (`WHERE` clause). **Expression** and **multicolumn** uniqueness are common for business keys (for example `lower(email)`).

### Expert

PostgreSQL represents constraints using indexes internally for many cases. **Exclude constraints** use GiST typically. When migrating, you may replace unique constraints with partial unique indexes for soft-delete patterns (`WHERE deleted_at IS NULL`).

```sql
-- Non-unique helper index
CREATE INDEX orders_status_idx ON orders (status);

-- Unique constraint (implicit unique index)
ALTER TABLE orders ADD CONSTRAINT orders_ext_unique UNIQUE (customer_id, external_ref);

-- Partial unique: one open order per customer
CREATE UNIQUE INDEX one_open_order_per_customer
ON orders (customer_id)
WHERE status = 'open';

-- Expression uniqueness for case-insensitive email
CREATE UNIQUE INDEX users_email_lower_uidx ON users ((lower(email)));
```

### Key Points

- Unique indexes are both **constraint enforcement** and **access accelerators**.
- Partial unique indexes enable powerful **conditional uniqueness** rules.
- Implicit indexes from PK/UNIQUE show up in `\d` and `pg_indexes`.

### Best Practices

- Prefer **constraints** when the rule is part of your data model (documentation, portability).
- Use partial unique indexes for **sparse** uniqueness (active flags, non-deleted rows).

### Common Mistakes

- Multiple redundant unique indexes on the same columns from repeated migrations.
- Forgetting that **multiple NULLs** are allowed in unique indexes per SQL standard (unless you add tricks).

### Additional SQL Patterns & Scenarios (Index Types)

```sql
-- Attach a UNIQUE constraint name for clearer errors
ALTER TABLE orders ADD CONSTRAINT orders_customer_ext_key UNIQUE (customer_id, external_ref);
```

For data migrations, consider creating a **unique index** `CONCURRENTLY` first, then attaching the constraint to reduce locking on large tables (exact steps depend on PostgreSQL version).

---

## 4. Hash Indexes

<a id="4-hash-indexes"></a>

### Beginner

**Hash** indexes are intended for **equality** comparisons only (`=`). They are less general than btree for typical workloads. Historically they had caveats; modern PostgreSQL has improved hash index reliability, but btree still dominates.

### Intermediate

Hash indexes cannot help ordering or range predicates. The planner picks hash paths when appropriate operator class exists and costs favor it. Write amplification and bucket splits occur as data grows.

### Expert

In practice, btree equality is often competitive; hash shines in narrower scenarios. Test both with realistic data and `EXPLAIN ANALYZE`. Monitor duplication and bucket chains if you adopt hash for specialized equality-heavy paths at scale.

```sql
CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id bigint NOT NULL,
  token_hash bytea NOT NULL
);

CREATE INDEX sessions_token_hash_hash ON sessions USING hash (token_hash);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM sessions WHERE token_hash = decode('abcd', 'hex');
```

### Key Points

- Hash indexes support **=** only for compatible types/opclasses.
- Lack of range support limits applicability.
- Always validate with benchmarks; btree may still win.

### Best Practices

- Default to btree unless you have measured proof hash wins on hot equality paths.
- Pair hash indexes with **very selective** equality filters to reduce heap fetches.

### Common Mistakes

- Creating hash indexes expecting `IN` lists or ranges to benefit broadly.
- Ignoring maintenance and bloat considerations unique to write-heavy equality tables.

### Additional SQL Patterns & Scenarios (Hash)

```sql
-- Compare plans: btree vs hash on equality (test both in your environment)
CREATE INDEX IF NOT EXISTS demo_eq_bt ON sessions (token_hash);
EXPLAIN ANALYZE SELECT * FROM sessions WHERE token_hash = decode('00ff', 'hex');
```

---

## 5. GiST Indexes

<a id="5-gist-indexes"></a>

### Beginner

**GiST** (Generalized Search Tree) supports **many data types** and query predicates: geometry, full text in some configurations, ranges, and custom extensions. It is a flexible “framework” index type.

### Intermediate

GiST supports **lossy** scans: the index may return extra candidates that need recheck against the heap or operator. Performance depends on pick/split strategies and data clustering. Common extensions: `btree_gist`, PostGIS geometry/geography.

### Expert

**Exclusion constraints** (`EXCLUDE USING gist`) prevent overlapping reservations (time ranges with `&&`). Custom GiST opclasses exist for specialized domains. Tune page density and consider operator-specific limitations.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE room_bookings (
  room_id int NOT NULL,
  during tsrange NOT NULL,
  EXCLUDE USING gist (room_id WITH =, during WITH &&)
);

CREATE INDEX bookings_room_gist ON room_bookings USING gist (room_id, during);

SELECT * FROM room_bookings WHERE room_id = 3 AND during && tsrange(now(), now() + interval '1 hour');
```

### Key Points

- GiST enables **non-scalar** reasoning (ranges, geometry, exclusion).
- Lossiness implies **extra filtering** work after index fetch.
- Powerful for scheduling and spatial patterns.

### Best Practices

- Use GiST when btree cannot represent the predicate class (ranges, spatial).
- Read extension docs (PostGIS) for recommended index types (GiST vs BRIN vs SP-GiST).

### Common Mistakes

- Using GiST without understanding **recheck** overhead.
- Expecting btree-like behavior on simple integers—usually unnecessary.

### Additional SQL Patterns & Scenarios (GiST)

```sql
-- GiST-friendly range overlap reporting
SELECT room_id, count(*) FROM room_bookings
WHERE during && tsrange(date '2026-03-01', date '2026-03-02')
GROUP BY 1;
```

---

## 6. GIN Indexes

<a id="6-gin-indexes"></a>

### Beginner

**GIN** (Generalized Inverted Index) excels when one row contains **many elements** (arrays, `jsonb` keys/values, full-text `tsvector`). It speeds up containment and overlap style queries.

### Intermediate

GIN indexes can be **large** and **expensive to update** because posting lists grow with cardinality. `jsonb_path_ops` opclass trades flexibility for smaller/faster containment paths. `fastupdate` and `gin_pending_list_limit` affect bulk ingest behavior (see maintenance docs for your version).

### Expert

Combine **partial GIN** with targeted predicates to cut size. For FTS, often store a `tsvector` generated column and index it with GIN. Understand `@@` vs `@>` operator plans and bitmap heap phases.

```sql
CREATE TABLE articles (
  id int PRIMARY KEY,
  title text,
  body text,
  tags text[]
);

CREATE INDEX articles_tags_gin ON articles USING gin (tags);

SELECT * FROM articles WHERE tags @> ARRAY['postgres'];

CREATE INDEX articles_body_fts ON articles USING gin (to_tsvector('english', body));

SELECT * FROM articles WHERE to_tsvector('english', body) @@ plainto_tsquery('english', 'index tuning');
```

### Key Points

- GIN shines for **multi-value** columns and FTS vectors.
- Writes to GIN can be heavier than btree on same column churn.
- Choose opclass (`jsonb_ops` vs `jsonb_path_ops`) deliberately.

### Best Practices

- Batch loads: consider dropping GIN temporarily in controlled migrations (windowed), then rebuild—only with tested procedures.
- For FTS, normalize language configs and document dictionary choice.

### Common Mistakes

- GIN-indexing `jsonb` without analyzing which operators you actually use.
- Ignoring index size growth on high-cardinality nested structures.

### Additional SQL Patterns & Scenarios (GIN)

```sql
-- jsonb containment example
CREATE TABLE docs (id serial PRIMARY KEY, data jsonb);
CREATE INDEX docs_data_gin ON docs USING gin (data jsonb_path_ops);
SELECT * FROM docs WHERE data @> '{"env":"prod"}';
```

---

## 7. BRIN Indexes

<a id="7-brin-indexes"></a>

### Beginner

**BRIN** (Block Range INdex) stores min/max summaries for ranges of table pages. It is **tiny** compared to btree and suits **very large** tables where row order correlates with the indexed column (time-series append-only is the classic).

### Intermediate

BRIN needs **correlation** between physical order and key order to be effective; otherwise many ranges match and scans degrade. `pages_per_range` tunes summary granularity (default often 128). `REINDEX` or `BRIN` auto-summarization policies depend on configuration and version.

### Expert

Pair BRIN with **clustering** strategies or partition layouts that preserve locality. Compare **bitmap** scans over BRIN vs partial btree for selective time windows. Watch autovacuum and bulk loads affecting range summaries.

```sql
CREATE TABLE events (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL,
  payload jsonb
);

CREATE INDEX events_created_brin ON events USING brin (created_at);

EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM events
WHERE created_at BETWEEN timestamptz '2026-03-01' AND timestamptz '2026-03-02';
```

### Key Points

- BRIN is for **big**, **append-ordered** data with locality.
- Misapplied BRIN on random-insert patterns performs poorly.
- Extremely low storage overhead vs btree.

### Best Practices

- Validate with `EXPLAIN ANALYZE` on realistic time filters.
- Consider table partitioning **plus** BRIN as architecture evolves.

### Common Mistakes

- BRIN on columns with no physical correlation to storage order.
- Expecting BRIN to behave like btree for highly selective point lookups.

### Additional SQL Patterns & Scenarios (BRIN)

```sql
-- Tune pages_per_range for very large append-only tables
CREATE INDEX events_brin_32 ON events USING brin (created_at) WITH (pages_per_range = 32);
```

---

## 8. Multi-Column Indexes

<a id="8-multi-column-indexes"></a>

### Beginner

A **multicolumn** (composite) btree index lists multiple keys in order: `(a, b, c)`. PostgreSQL can use it when your query has predicates matching a **leftmost prefix** (equality on `a` for range on `b`, etc.), subject to planner costs.

### Intermediate

Column order determines usability: `WHERE b = 1` alone may **not** use `(a,b)` efficiently. Combining `ORDER BY` with `WHERE` can sometimes be satisfied from the same index. **INCLUDE** columns (covered indexes) extend utility without affecting btree key ordering rules for uniqueness.

### Expert

Consider **correlated** predicates and **extended statistics** (`CREATE STATISTICS ... dependencies`) when the planner misestimates combinations. For mixed low/high selectivity, placing the most selective **equality** prefix first often helps.

```sql
CREATE INDEX orders_cust_status_created_idx
ON orders (customer_id, status, created_at DESC);

-- Good prefix usage
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE customer_id = 7 AND status = 'shipped'
ORDER BY created_at DESC
LIMIT 20;

-- May not use composite efficiently (no customer_id predicate)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE status = 'open';
```

### Key Points

- Composite indexes are **not** “supersets” that always beat single-column indexes.
- Order columns for **real query shapes**, not alphabetical names.
- More columns often mean **larger** indexes and **slower** writes.

### Best Practices

- Model composite indexes after top slow queries; verify with `EXPLAIN`.
- Avoid duplicating left-prefix indexes (`(a)` and `(a,b)`) unless measurements justify.

### Common Mistakes

- Reversing column order vs actual filters, nullifying index usage.
- One giant composite index “for everything” that helps nothing.

### Additional SQL Patterns & Scenarios (Multi-Column)

```sql
-- Sorting alignment: matching ORDER BY direction per column
CREATE INDEX demo_sort ON orders (customer_id ASC, created_at DESC);
SELECT * FROM orders WHERE customer_id = 5 ORDER BY created_at DESC LIMIT 10;
```

---

## 9. Partial Indexes

<a id="9-partial-indexes"></a>

### Beginner

A **partial** index indexes only rows satisfying a `WHERE` predicate. It is smaller and faster to maintain when your queries target the same subset (for example only `active` rows or `status = 'open'`).

### Intermediate

The planner uses partial indexes when query predicates **imply** the index condition (logical entailment). Great for **soft-delete** patterns: index `WHERE deleted_at IS NULL`. Combine with **unique** partial indexes for conditional uniqueness.

### Expert

Watch **constraint exclusion** interactions with partitions. Partial indexes reduce WAL during updates to excluded rows. Document partial predicates clearly—application changes that broaden filters can silently stop using the index.

```sql
CREATE INDEX active_users_login_idx ON users (last_login)
WHERE is_active;

CREATE UNIQUE INDEX uniq_username_active ON users (username)
WHERE deleted_at IS NULL;

SELECT * FROM users WHERE is_active AND last_login < now() - interval '90 days';
```

### Key Points

- Partial indexes match **subset workloads** with big wins.
- Predicate must align with query filters.
- Excellent for soft-delete and status-gated columns.

### Best Practices

- Mirror partial conditions with **CHECK** constraints when they define table invariants.
- Name indexes to reflect the predicate (`_active_only`, `_not_deleted`).

### Common Mistakes

- Partial index predicate too narrow vs evolving queries → unused index.
- Assuming planner will use partial index when OR conditions prevent implication.

### Additional SQL Patterns & Scenarios (Partial)

```sql
-- Partial index for a hot status
CREATE INDEX orders_open_partial ON orders (created_at) WHERE status = 'open';
SELECT * FROM orders WHERE status = 'open' AND created_at > now() - interval '1 day';
```

---

## 10. Expression Indexes

<a id="10-expression-indexes"></a>

### Beginner

An **expression** (functional) index indexes the result of an expression, such as `lower(email)` or `(col1 || col2)`. Queries must use the **same expression** (after immutable rules) for the planner to apply it.

### Intermediate

Expressions must be **immutable** for reliable index use (`CREATE INDEX` will error otherwise unless marked carefully). Functional indexes help **case-insensitive** search, computed keys, and JSON path extractions that are stable.

### Expert

Consider **generated columns** storing the expression, then index the column—clearer for ORMs and statistics. Watch volatility: `now()` is not immutable; don’t index volatile calls. For complex expressions, verify planner proofs with `EXPLAIN`.

```sql
CREATE INDEX users_lower_email_idx ON users ((lower(email)));

SELECT * FROM users WHERE lower(email) = lower('User@Example.com');

-- Generated column alternative (PostgreSQL 12+)
ALTER TABLE users ADD COLUMN email_lower text GENERATED ALWAYS AS (lower(email)) STORED;
CREATE INDEX users_email_lower_idx ON users (email_lower);
```

### Key Points

- Expression indexes require **matching** query shapes.
- Immutability is a hard requirement for correctness.
- Generated columns can simplify application queries.

### Best Practices

- Prefer STORED generated columns when teams struggle with functional predicates in ORMs.
- Add comments in migrations explaining paired query form.

### Common Mistakes

- Indexing `lower(email)` but querying `email ILIKE`—not equivalent plans.
- Using non-immutable functions in index definitions.

### Additional SQL Patterns & Scenarios (Expression)

```sql
-- Expression index on immutable text transform
CREATE INDEX users_handle_idx ON users ((regexp_replace(handle, '^@', '')));
```

Ensure application queries mirror the expression **exactly** (parentheses and function names).

---

## 11. Index Statistics

<a id="11-index-statistics"></a>

### Beginner

The planner uses **statistics** (row counts, distinct values, histograms) to guess how many rows match predicates. **ANALYZE** samples tables and updates stats used for index vs seq scan choices.

### Intermediate

`default_statistics_target` and per-column targets adjust sample depth. **Extended statistics** capture **dependencies** and **ndistinct** for column groups—important for composite filters the planner underestimates.

### Expert

For large tables, use **scheduled ANALYZE** after bulk changes. Inspect `pg_stats`, `pg_stat_all_indexes`, and `EXPLAIN` estimates vs actuals. When estimates drift, consider raising targets or using `ALTER TABLE ... ALTER COLUMN ... SET STATISTICS`.

```sql
ANALYZE orders;

CREATE STATISTICS orders_cust_status_deps (dependencies)
ON customer_id, status FROM orders;

ANALYZE orders;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 123 AND status = 'open';
```

### Key Points

- Bad stats → wrong index choices → slow plans.
- ANALYZE is cheap compared to catastrophic misplans.
- Extended stats help multicolumn correlations.

### Best Practices

- After bulk ETL, run **ANALYZE** targeted tables or whole DB in maintenance windows.
- Investigate systematic bad estimates with `EXPLAIN ANALYZE` comparisons.

### Common Mistakes

- Disabling autovacuum/autanalyze without replacement strategy.
- Creating many indexes but never validating **actual rows** vs estimates.

### Additional SQL Patterns & Scenarios (Statistics)

```sql
-- Increase statistics target for skewed columns
ALTER TABLE orders ALTER COLUMN status SET STATISTICS 1000;
ANALYZE orders;
```

---

## 12. Index Maintenance (REINDEX, VACUUM, Bloat)

<a id="12-index-maintenance-reindex-vacuum-bloat"></a>

### Beginner

Indexes **bloat** as versions accumulate and pages fragment. **VACUUM** reclaims dead tuple space in tables and marks index entries dead; it is routine hygiene. **REINDEX** rebuilds an index from scratch to compact structure.

### Intermediate

Use `REINDEX INDEX CONCURRENTLY` on production when supported to avoid long blocking (version-dependent capabilities—check docs). **pg_stat_user_indexes** shows usage; **bloat estimates** often come from SQL recipes or extensions like `pgstattuple`. High churn → more frequent maintenance.

### Expert

Understand **amcheck** for corruption detection. For very large indexes, plan **concurrent** rebuilds during low traffic. Partitioning can localize rebuild costs. Combine autovacuum tuning with **fillfactor** adjustments for append/update patterns.

```sql
-- Routine vacuum (often autovacuum handles)
VACUUM (ANALYZE) orders;

-- Rebuild one index concurrently (syntax availability depends on version)
REINDEX INDEX CONCURRENTLY orders_customer_id_idx;

-- Full table reindex (disruptive; use carefully)
REINDEX TABLE orders;
```

### Key Points

- Bloat raises I/O and cache pressure; it harms both seq and index scans.
- CONCURRENTLY reduces locking but takes longer and uses more resources.
- VACUUM is essential for MVCC health, not optional tuning trivia.

### Best Practices

- Monitor autovacuum lag on busy tables.
- Test maintenance commands in staging with production-like sizes.

### Common Mistakes

- Running non-concurrent `REINDEX` on hot giant indexes during peak.
- Assuming `REINDEX` fixes all performance issues without fixing query logic.

### Additional SQL Patterns & Scenarios (Maintenance)

```sql
-- Optional: pgstattuple extension for deeper inspections
-- SELECT * FROM pgstatindex('orders_customer_id_idx');
```

Schedule maintenance windows for `REINDEX` on systems with aggressive update workloads.

---

## 13. Index Selection

<a id="13-index-selection"></a>

### Beginner

**Index selection** is the design discipline of choosing which indexes to create. Criteria: query frequency, selectivity, write cost, and disk budget.

### Intermediate

Use **workload capture** (`pg_stat_statements`) to rank expensive queries, then design indexes for top offenders. Apply **Knuth-style** tradeoffs: each index speeds some reads and taxes all writes touching those columns.

### Expert

Employ **index consolidation** via composites and INCLUDE rather than many overlapping singles—measure both ways. For OLAP, lean on aggregates/MVs; for OLTP, narrow indexes. Simulate **cardinality changes** as data grows; an index helpful at 1M rows may be useless at 1k.

```sql
-- Before adding a new index, inspect existing indexes on table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders'
ORDER BY indexname;
```

### Key Points

- Let **measured pain** drive index creation, not speculation.
- Consolidate thoughtfully; over-consolidation can block useful single-column paths.
- Revisit indexes after schema/query changes.

### Best Practices

- Maintain a **checklist**: query shape, frequency, write impact, size estimate.
- Drop **unused** indexes found in production stats (after validation).

### Common Mistakes

- Copying index recipes from blogs without your data distribution.
- Keeping duplicate indexes that differ only by name.

### Additional SQL Patterns & Scenarios (Selection)

```sql
-- Heuristic: list indexes for a table with sizes
SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) AS sz, idx_scan
FROM pg_stat_user_indexes WHERE relname = 'orders' ORDER BY pg_relation_size(indexrelid) DESC;
```

Always compare full `indexdef` including predicates and INCLUDE lists before dropping anything.

---

## 14. Index Performance (Scan Types & Planner)

<a id="14-index-performance-scan-types--planner"></a>

### Beginner

PostgreSQL may scan rows via **sequential scan** (read all pages) or **index** paths: **Index Scan**, **Index Only Scan**, **Bitmap Index Scan** + **Bitmap Heap Scan**. The planner picks based on costs.

### Intermediate

**Bitmap** scans combine multiple indexes or handle moderate selectivity by building TID bitmaps. **Index Only Scan** avoids heap lookups when indexed columns suffice and visibility map allows. **Parallel** workers may accelerate scans of large relations.

### Expert

Tuning knobs like `random_page_cost` vs `seq_page_cost` influence SSD vs HDD assumptions. **OR** expansion and **JOIN** order interact with index availability. Use `EXPLAIN (ANALYZE, BUFFERS, WAL)` responsibly in staging to see real buffer hits.

```sql
SET enable_seqscan = off; -- ONLY in dev experiments—never as permanent “fix”

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 123 OR status = 'priority';
```

### Key Points

- Bitmap scans are normal and often optimal—don’t panic when you see them.
- Index Only Scan is a strong signal your covering strategy works.
- Forcing scans off is a diagnostic tool, not production policy.

### Best Practices

- Compare plans before/after index changes on representative data volumes.
- Align cost constants with storage technology.

### Common Mistakes

- Labeling sequential scans “bad” without selectivity context.
- Chasing “Index Only Scan” everywhere when heap access cost is negligible.

### Additional SQL Patterns & Scenarios (Performance)

```sql
-- Parallel workers may appear for large scans (depends on costs and settings)
SET max_parallel_workers_per_gather = 4;
EXPLAIN ANALYZE SELECT count(*) FROM orders;
```

---

## 15. Covering Indexes (INCLUDE)

<a id="15-covering-indexes-include"></a>

### Beginner

**INCLUDE** adds non-key columns to an index payload so queries fetching only key + included columns can use **Index Only Scans** more often. Unique indexes can `INCLUDE` extra columns without widening uniqueness semantics.

### Intermediate

INCLUDE columns are not part of the btree key ordering for uniqueness checks but are available on leaf pages. Great for **lookup + projection** patterns like `SELECT status FROM orders WHERE id = ?` with index `(id) INCLUDE (status)`.

### Expert

Over-INCLUDE bloats indexes and slows writes—treat as cache extension, not duplicate table. Pair with selective predicates and visibility map health. For wide payloads, consider **materialized views** or **denormalized columns** instead.

```sql
CREATE UNIQUE INDEX orders_id_uidx ON orders (id) INCLUDE (status, created_at);

EXPLAIN (ANALYZE, BUFFERS)
SELECT status, created_at FROM orders WHERE id = 1001;
```

### Key Points

- INCLUDE enables covering without altering uniqueness key shape.
- Trade write amplification vs heap fetches avoided.
- Still subject to visibility/recheck rules for Index Only Scans.

### Best Practices

- INCLUDE columns that appear in **SELECT lists** of hot key lookups.
- Avoid including wide text/json blobs unless proven necessary.

### Common Mistakes

- INCLUDE lists that duplicate the whole row—almost a second table.
- Expecting INCLUDE to help queries that filter on included-only columns inefficiently.

### Additional SQL Patterns & Scenarios (INCLUDE)

```sql
-- INCLUDE helps narrow index-only paths for key lookups
CREATE INDEX orders_customer_inc ON orders (customer_id) INCLUDE (id, status);
SELECT id, status FROM orders WHERE customer_id = 42;
```

---

## 16. Index Monitoring & Optimization

<a id="16-index-monitoring--optimization"></a>

### Beginner

Monitor indexes with catalog views: `pg_stat_user_indexes` shows **idx_scan**, **idx_tup_read/fetch**. Low `idx_scan` on large indexes suggests **unused** candidates for removal (after checking reporting/monthly jobs).

### Intermediate

Identify **duplicate** indexes (same columns/opclass/predicate). Use `pg_stat_statements` + `EXPLAIN` to connect indexes to queries. Track **bloat** and **cache hit** ratios at instance level; bad cache behavior can make indexes “feel” slow.

### Expert

Automate **continuous profiling**: slow query logs, statement stats, periodic reviews. For multi-tenant systems, index needs may differ per tenant—consider **partitioning** or **partial** patterns. Use **hypothetical** index tools in extensions (where allowed) to simulate gains before building.

```sql
SELECT relname AS table_name, indexrelname AS index_name, idx_scan, pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
JOIN pg_class ON pg_class.oid = relid
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

### Key Points

- Optimization is iterative: measure → change → re-measure.
- Unused indexes harm writes and backups.
- Monitoring ties indexes to **business-critical queries**.

### Best Practices

- Schedule quarterly index reviews with stats snapshots.
- Coordinate index drops with ORM migrations and BI tools.

### Common Mistakes

- Dropping rarely used indexes that exist for **monthly compliance** reports.
- Only looking at `idx_scan` without considering **size** and **write** costs together.

### Additional SQL Patterns & Scenarios (Monitoring)

```sql
-- Top indexes by size
SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) AS sz, idx_scan
FROM pg_stat_user_indexes ORDER BY pg_relation_size(indexrelid) DESC LIMIT 15;
```

---

---

## Appendix A: Planner-Friendly Predicate Cookbook

### Equality and IN lists

```sql
SELECT * FROM orders WHERE status IN ('open','pending','hold');
```

Keep `IN` lists moderately sized; very large lists can hurt planning time.

### Range predicates

```sql
SELECT * FROM orders WHERE created_at >= now() - interval '24 hours';
```

Ensure types match the indexed column to avoid implicit casts that block index usage.

### NULL handling

```sql
SELECT * FROM users WHERE deleted_at IS NULL;
```

Partial indexes pair naturally with `IS NULL` filters for soft deletes.

### Text search pitfalls

Leading wildcards and complex functions on columns typically prevent plain btree usage unless you add expression indexes or trigram/GiST/GIN strategies.

---

## Appendix B: Index Build Operations

### Standard build (locks writes)

```sql
CREATE INDEX orders_brin_created_at ON orders USING brin (created_at);
```

### Concurrent build (safer for production)

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_customer_id_idx2 ON orders (customer_id);
```

Concurrent builds may fail and leave an **invalid** index—monitor and `REINDEX` or `DROP` + recreate as appropriate.

---

## Appendix C: Case Study — E-Commerce Order Search

**Workload:** Frequent queries by `customer_id`, date range, and `status`. Writes include inserts and status updates.

**Design:**

```sql
CREATE INDEX orders_query_path ON orders (customer_id, status, created_at DESC);
CREATE INDEX orders_open_partial ON orders (created_at) WHERE status = 'open';
```

**Validation:**

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE customer_id = $1 AND status = 'shipped'
  AND created_at BETWEEN $2 AND $3
ORDER BY created_at DESC
LIMIT 50;
```

**Review quarterly:** `pg_stat_user_indexes`, `pg_stat_statements`, autovacuum health.

---

## Appendix D: Case Study — Event Logging at Scale

**Workload:** Billions of rows, mostly append by time; queries by narrow time windows.

**Design:**

```sql
CREATE INDEX events_time_brin ON events USING brin (created_at) WITH (pages_per_range = 128);
```

**Caveat:** If events are inserted in random time order, BRIN effectiveness drops—consider btree on time, clustering, or partitioning.

---

## Appendix E: Interview-Style Questions (with Hints)

1. **Why might PostgreSQL choose a sequential scan despite an index?**  
   Hint: selectivity, cost parameters, small table, parallel sequential scan, visibility map effects.

2. **When is INCLUDE better than adding a column to the btree key?**  
   Hint: ordering and uniqueness semantics vs payload width and write amplification.

3. **What evidence should exist before dropping an index?**  
   Hint: low `idx_scan`, no dependent constraints, ORM/report queries audited, staging replay of workloads.

---

## Appendix F: Operator Classes and Collations

```sql
CREATE INDEX users_email_idx ON users (email varchar_pattern_ops);
```

Some `LIKE` patterns can use indexes with appropriate **operator classes**—consult documentation for your data type.

---

## Appendix G: Fillfactor on Indexes

```sql
CREATE INDEX orders_customer_ff ON orders (customer_id) WITH (fillfactor = 90);
```

Lower fillfactor reserves page space for future inserts—use sparingly and measure.

---

## Appendix H: Checklist Before Creating an Index

1. Capture the exact SQL and parameters from `pg_stat_statements`.
2. Run `EXPLAIN (ANALYZE, BUFFERS)` on production-like data volume.
3. Estimate size after building on a clone when possible.
4. Evaluate write-rate impact on hot tables.
5. Add monitoring for index scans and bloat.

---

## Appendix I: Anti-Patterns Recap

- Indexing every column “just in case.”
- Applying volatile functions in predicates without matching design.
- Relying on default stats after massive bulk loads.
- Running non-concurrent `REINDEX` on hot giant indexes during peak traffic.

---

## Appendix J: Reference Queries (Catalogs)

```sql
SELECT * FROM pg_index WHERE indrelid = 'orders'::regclass;
SELECT * FROM pg_stat_all_indexes WHERE relname = 'orders';
```

---

## Appendix K: SSD vs HDD Cost Parameters (Conceptual)

On SSD-backed storage, lowering `random_page_cost` toward `seq_page_cost` often reflects reality better than legacy HDD defaults. Always change one knob at a time and measure end-to-end query latency and throughput.

---

## Appendix L: Index-Only Scan Preconditions (Checklist)

- Query projects only columns present in the index (including INCLUDE payloads when applicable).
- Visibility map indicates pages are all-visible, or the planner accepts partial heap fetches.
- Statistics and autovacuum keep visibility information reasonably fresh for your SLA.

---

## Appendix M: Partial Index Predicate Entailment

Partial indexes require queries to **imply** the index predicate. Broadening application filters (for example removing `is_active`) can silently stop partial index usage—retest plans after feature changes.

---

## Appendix N: Duplicate Detection for Index Definitions

```sql
SELECT indexdef, array_agg(indexname) AS names
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'orders'
GROUP BY indexdef
HAVING count(*) > 1;
```

---

## Appendix O: BRIN Summarization Runbook (High Level)

1. Confirm physical correlation between column order and heap insertion order.
2. Choose `pages_per_range` based on chunkiness of queries and table width.
3. Validate with `EXPLAIN (ANALYZE, BUFFERS)` on representative windows.
4. Revisit after major ETL reordering or clustering changes.

---

## Appendix P: GIN Fast Update Considerations

Bulk loads into GIN-indexed columns can create large pending lists depending on configuration. Plan maintenance (vacuum/analyze) and batching strategies for ingestion-heavy pipelines.

---

## Appendix Q: Real-Time Dashboards — What to Plot

- Top queries by total time (`pg_stat_statements`).
- Index hit rate and sequential scan rates (`pg_statio_user_tables`).
- Autovacuum lag and dead tuple ratios (`pg_stat_all_tables`).
- Largest indexes by size (`pg_relation_size` on `indexrelid`).

---

## Appendix R: When NOT to Index

- Tiny tables where sequential scans are cheaper.
- Columns with extremely low selectivity (for example boolean flags) unless partial predicates help.
- Write-only buffers where read latency is irrelevant.

---

## Appendix S: Soft Deletes + Unique Constraints Pattern

```sql
CREATE UNIQUE INDEX users_username_active_uidx ON users (username)
WHERE deleted_at IS NULL;
```

This preserves uniqueness among active rows while allowing reused usernames across deleted accounts if business rules permit.

---

## Appendix T: Covering Strategy vs Denormalization

INCLUDE indexes reduce heap fetches but still store redundant copies of column values in the index. For very wide payloads, consider controlled denormalization or materialized views with refresh policies.

---

## Appendix U: Read/Write Amplification Mental Model

Every non-partial secondary index on a table adds WAL and buffer work for row versions that touch indexed columns. For hot update columns (for example `updated_at` on wide rows), consider whether indexing that column is worth constant write amplification.

---

## Appendix V: Index Scans and OR Predicates

OR conditions sometimes prevent clean index usage unless the planner can use bitmap OR combinations or rewrite the query. Consider `UNION ALL` of selective branches when OR predicates are killing plans.

```sql
-- Sometimes clearer as UNION ALL of selective queries
SELECT * FROM orders WHERE customer_id = 1 AND status = 'open'
UNION ALL
SELECT * FROM orders WHERE customer_id = 1 AND priority = true;
```

Validate equivalence with your constraints and NULL semantics before rewriting.

---

## Appendix W: Correlation and Physical Clustering

If a query always filters `created_at` between bounds and rows are inserted time-ordered, sequential scans can become surprisingly efficient due to heap locality. Indexes still help selective point lookups. Measure both.

---

## Appendix X: Indexing Foreign Keys

PostgreSQL does not automatically index referencing columns. For join and delete/update performance on the child table, index foreign key columns unless you have proven they are unused.

```sql
CREATE INDEX order_items_order_id_idx ON order_items (order_id);
```

---

## Appendix Y: Partitioning Interaction

Partitioned tables can prune partitions when constraints match. Indexes then live **per partition**; design parent templates and monitor each child’s stats and bloat.

---

## Appendix Z: Version Notes Discipline

Index features evolve (for example `INCLUDE`, concurrent reindex behaviors). When your notes reference syntax, align verification steps with your deployed PostgreSQL major version’s official documentation.

---

## Appendix AA: Worked EXPLAIN Reading Pattern

1. Start at the bottom node: it is the first execution step.
2. Compare **actual rows** vs **estimated rows** at each layer.
3. Look for **Buffers: shared hit/read** spikes and unexpected **Seq Scan** on large relations.
4. Check whether **Heap Fetches** are high on what you expected to be index-only.

---

## Appendix AB: Safe Experimentation in psql

```sql
BEGIN;
SET LOCAL enable_seqscan = off;
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 1;
ROLLBACK;
```

`SET LOCAL` scopes to the transaction—good for experiments without permanently harming session defaults.

---

## Appendix AC: Index Naming Conventions

Use consistent prefixes/suffixes: table name, column names, `_idx`, optional `_uniq`, `_partial`, `_gin`, `_brin`. Good names reduce operational mistakes during incidents.

---

## Appendix AD: Multi-Tenant Considerations

Tenant-scoped queries often need leading `tenant_id` in composite indexes. Without it, indexes may scan large portions of a shared table per tenant.

```sql
CREATE INDEX events_tenant_time ON events (tenant_id, created_at DESC);
```

---

## Appendix AE: Read Replica Index Strategy

Replicas typically carry the same indexes as primaries. If a replica serves special read workloads, you still usually keep indexes aligned to avoid replay bottlenecks and divergence complexity unless you use advanced architectures.

---

## Appendix AF: ORM-Generated SQL Auditing

ORMs may add `ORDER BY` columns or `SELECT *` that block index-only scans. Capture SQL at the database layer periodically to ensure the ORM matches your indexing strategy.

---

## Appendix AG: Bulk Load Recipe (Conceptual)

1. Drop or defer non-essential indexes for huge one-time loads (maintenance window).
2. Load data with tuned `work_mem` / `maintenance_work_mem` as appropriate.
3. Build indexes `CONCURRENTLY` or rebuild in parallel where safe.
4. Run `ANALYZE`.

Always test on a clone first—dropping indexes can break unique enforcement if mishandled.

---

## Appendix AH: Selectivity Quick Estimate

```sql
SELECT status, count(*) * 100.0 / sum(count(*)) OVER () AS pct
FROM orders GROUP BY status ORDER BY pct DESC;
```

Skewed distributions confuse planners unless stats and extended statistics are aligned.

---

## Appendix AI: Partial Index for Archived Rows

If most queries exclude archived data, partial indexes targeting `NOT archived` can shrink index size dramatically compared to indexing the whole table.

---

## Appendix AJ: Logging Slow Queries with Indexes in Mind

Pair `log_min_duration_statement` with `auto_explain` (where appropriate) in lower environments to correlate slow statements with missing or unused indexes.

---

## Appendix AK: Index Access Method Summary Table (Conceptual)

| Access method | Typical use | Predicates | Write cost |
| --- | --- | --- | --- |
| btree | General OLTP | `=`, range, sortable | moderate |
| hash | Rare equality specialization | `=` | moderate |
| gist | Ranges, geometry, exclusion | overlap, distance | moderate/high |
| gin | Arrays, jsonb, tsvector | containment, fts | often higher |
| brin | very large correlated data | range | low index size |

---

## Appendix AL: Index Tuple Width and Bloat

Wide index keys increase page splits and cache pressure. Prefer narrower types (`bigint` vs `uuid` when both work) when designing high-churn indexes, without sacrificing domain correctness.

---

## Appendix AM: Unique Indexes vs Primary Keys

Primary keys are unique and `NOT NULL` by definition. You can model the same uniqueness with `UNIQUE` constraints, but PKs carry semantic expectations for join graphs and ORM defaults.

---

## Appendix AN: Covering Sort + Filter

When queries filter on `a` and order by `b`, a composite `(a,b)` index can avoid extra sorts. Validate with `EXPLAIN` that sort nodes disappear or shrink.

---

## Appendix AO: Index Scans with Low Selectivity

If a predicate returns a large fraction of the table, bitmap index scans or sequential scans may win. This is normal optimizer behavior—treat it as economics, not failure.

---

## Appendix AP: Prepared Statements and Plan Stability

Parameter sniffing can interact with index choices. When plans flip at certain parameter values, investigate extended statistics, `PREPARE` plans, and whether generic vs custom plans are in play (PostgreSQL version dependent).

---

## Appendix AQ: Column Order in INCLUDE

INCLUDE columns do not participate in key ordering; they only add payload. They can still widen the index substantially—include only what you repeatedly project after key lookup.

---

## Appendix AR: Index Usage in JOINs

Join keys should be indexed on the **filtered** side when selective. Star-schema fact tables may index dimension foreign keys depending on query shapes.

---

## Appendix AS: Time-Series Composite Patterns

```sql
CREATE INDEX metrics_device_time ON metrics (device_id, ts DESC);
```

Pairs device-scoped time navigation with btree strengths; BRIN may complement at huge scale.

---

## Appendix AT: Partial Index for Role-Based Queries

```sql
CREATE INDEX admin_audit_recent ON audit_log (created_at)
WHERE actor_role = 'admin';
```

Ensure application queries always constrain `actor_role` compatibly or the index will not apply.

---

## Appendix AU: Index Explosion in Microservices

Many services hitting the same database can each “add an index” for convenience. Centralize indexing decisions with schema owners to avoid redundant indexes.

---

## Appendix AV: Testing Index Drops Safely

Use transactions to test plan changes, or create a staging fork with restored backups. Drop index `CONCURRENTLY` is not a thing—drops take locks; plan windows.

```sql
BEGIN;
DROP INDEX IF EXISTS orders_status_idx;
EXPLAIN ANALYZE SELECT ...;
ROLLBACK;
```

---

## Appendix AW: Visibility Map and Vacuum

Index-only scans depend on heap visibility knowledge. Aggressive autovacuum settings on append-heavy tables help keep visibility maps fresh enough for optimization.

---

## Appendix AX: Index Size Monitoring Query

```sql
SELECT relname, pg_size_pretty(pg_relation_size(oid))
FROM pg_class
WHERE relkind = 'i' AND relnamespace = 'public'::regnamespace
ORDER BY pg_relation_size(oid) DESC
LIMIT 25;
```

---

## Appendix AY: Combining BRIN and Btree

Some systems use BRIN for coarse pruning and btree for selective follow-up in specialized architectures; validate complexity vs gains before adopting multi-layer strategies.

---

## Appendix AZ: Final Review Checklist

- [ ] Every production index has an owner and rationale documented.
- [ ] Slow query reviews include `EXPLAIN (ANALYZE, BUFFERS)` artifacts stored with tickets.
- [ ] Autovacuum/autanalyze healthy on indexed high-churn tables.
- [ ] Quarterly review of largest indexes by size and scan counts.

---

## Appendix BA: Sample Staging Benchmark Script Outline

```sql
\timing on
SELECT count(*) FROM orders WHERE customer_id = 123;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE customer_id = 123 AND status = 'open';
```

Run before and after index changes on a restored production snapshot for comparable timings.

---

## Appendix BB: Index DDL in Migrations

When using migration tools, prefer `CREATE INDEX CONCURRENTLY` outside a transaction block if your toolchain allows—standard `CREATE INDEX` inside a transaction can lock writers longer.

---

## Appendix BC: JSONB Partial GIN

```sql
CREATE INDEX docs_tenant_gin ON docs USING gin (payload)
WHERE tenant_id = 'alpha';
```

Use when a subset of tenants or environments dominates query volume—avoid overfitting unless stable.

---

## Appendix BD: Statistics Targets per Column

Raise targets on columns that drive critical plans with skewed distributions; avoid raising everywhere indiscriminately (analyze time cost grows).

---

## Appendix BE: Index-Only Scan Verification

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, status FROM orders WHERE id = 10;
```

Look for `Index Only Scan` and inspect heap fetches; nonzero fetches imply visibility rechecks.

---

## Appendix BF: Repacking vs Reindex

`REINDEX` rebuilds index structure; table rewrite extensions (for example `pg_repack`) address heap bloat differently. Choose based on whether the pain is index bloat, heap bloat, or both.

---

## Appendix BG: Shadow Index Testing

Build a new index concurrently, compare plans, then drop old index after validation—reduces risk on large tables.

---

## Appendix BH: Cloud-Managed PostgreSQL Caveats

Managed services may restrict some parameters and maintenance windows. Index builds still compete for IOPS—schedule heavy index creation carefully.

---

## Appendix BI: Read-Your-Writes and Index Visibility

Application-level caching layers may mask index benefits or staleness. Ensure caches respect transaction boundaries when debugging perceived index issues.

---

## Appendix BJ: Documentation Strings

```sql
COMMENT ON INDEX orders_customer_id_idx IS 'Supports customer portal order history list view; reviewed 2026-03.';
```

---

**End of topic 13 notes.**
