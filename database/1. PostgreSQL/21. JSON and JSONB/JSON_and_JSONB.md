# JSON and JSONB

**PostgreSQL learning notes (March 2026). Aligned with README topic 21.**

---

## 📑 Table of Contents

- [1. JSON Data Type](#1-json-data-type)
- [2. JSONB Data Type](#2-jsonb-data-type)
- [3. JSON Operators (`->`, `->>`, `#>`, `#>>`, `@>`, `?`, `?|`, `?&`, `||`, `-`, `#-`)](#3-json-operators)
- [4. JSON Functions (`json_build_object`, `json_each`, `json_array_elements`, …)](#4-json-functions)
- [5. JSON Path Queries (`jsonpath`)](#5-json-path-queries-jsonpath)
- [6. JSONB Indexing (GIN)](#6-jsonb-indexing-gin)
- [7. JSONB Update Operations](#7-jsonb-update-operations)
- [8. Converting To/From JSON (`to_json`, `row_to_json`, casts)](#8-converting-to-from-json)
- [9. JSON Aggregation (`json_agg`, `jsonb_agg`, `json_object_agg`, …)](#9-json-aggregation)
- [10. JSON Validation & Constraints](#10-json-validation)
- [11. JSONB vs Relational Modeling](#11-jsonb-vs-relational)
- [12. JSON in Full-Text Search](#12-json-in-full-text-search)
- [13. Real-World JSON Patterns](#13-real-world-json-patterns)
- [14. JSON Best Practices](#14-json-best-practices)

---

## 1. JSON Data Type

<a id="1-json-data-type"></a>

### Beginner

`json` stores text conforming to JSON with minimal processing on insert; useful when exact textual fidelity matters. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`json` stores text conforming to JSON with minimal processing on insert; useful when exact textual fidelity matters. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`json` stores text conforming to JSON with minimal processing on insert; useful when exact textual fidelity matters. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT '{"k":1, "k":2}'::json AS duplicate_keys_allowed;
SELECT pg_typeof('{"a":true}'::json) AS t;
```


```bash
psql -X -c "SELECT typname, typlen FROM pg_type WHERE typname = 'json';"
```
### Key Points

- `json` preserves input whitespace and key ordering semantics per storage.
- Validation errors abort the statement like other invalid casts.
- Prefer `jsonb` for most query/index use cases.
- Cast text to `json` only after validating upstream producers.

### Best Practices

- Use `json` when you must preserve exact payload text for auditing.
- Combine with `CHECK (jsonb_typeof(...))` patterns when downcasting to jsonb.
- Document charset expectations at the application boundary.

### Common Mistakes

- Assuming `json` equality behaves like `jsonb` normalization.

#### Hands-On Lab Walkthrough

        1. Create a disposable database for exercises related to “JSON type”.
2. Install required extensions in the lab before running advanced examples.
3. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
4. Practice safe `SET statement_timeout` when experimenting with heavy queries.
5. Keep a scratchpad of sample documents/events matching your product domain.
6. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
7. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
8. Document collation/encoding settings; they affect text search and sorting.
9. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
10. Pair SQL exercises with application driver tests (params, JSON serialization).
11. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
12. Practice reading `pg_stat_user_indexes` before/after creating indexes.
13. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
14. Archive lab commands into a personal snippet library for interviews.
15. Write a short postmortem template for query regressions you trigger intentionally.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON type)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON type” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 2. JSONB Data Type

<a id="2-jsonb-data-type"></a>

### Beginner

`jsonb` stores a binary decomposition of JSON enabling efficient containment queries and GIN indexing. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`jsonb` stores a binary decomposition of JSON enabling efficient containment queries and GIN indexing. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`jsonb` stores a binary decomposition of JSON enabling efficient containment queries and GIN indexing. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT '{"b":2,"a":1}'::jsonb AS canonical_storage_demo;
SELECT '{"x":10}'::jsonb @> '{"x":1}'::jsonb AS contains_wrong;
```


```bash
psql -X -c "SELECT '{"hi":true}'::jsonb;"
```
### Key Points

- `jsonb` normalizes key order and whitespace compared to `json`.
- Rich operator set (`@>`, `?`, path ops) targets `jsonb`.
- Index with GIN when predicates justify the write overhead.

### Best Practices

- Pick `jsonb` for new schemas unless textual fidelity is required.
- Size large documents carefully; TOAST still applies.
- Use partial indexes for hot keys to save space.

### Common Mistakes

- Storing huge blobs in hot rows without considering TOAST and vacuum costs.

#### Hands-On Lab Walkthrough

        1. Install required extensions in the lab before running advanced examples.
2. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
3. Practice safe `SET statement_timeout` when experimenting with heavy queries.
4. Keep a scratchpad of sample documents/events matching your product domain.
5. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
6. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
7. Document collation/encoding settings; they affect text search and sorting.
8. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
9. Pair SQL exercises with application driver tests (params, JSON serialization).
10. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
11. Practice reading `pg_stat_user_indexes` before/after creating indexes.
12. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
13. Archive lab commands into a personal snippet library for interviews.
14. Write a short postmortem template for query regressions you trigger intentionally.
15. Create a disposable database for exercises related to “JSONB type”.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSONB type)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSONB type” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 3. JSON Operators (`->`, `->>`, `#>`, `#>>`, `@>`, `?`, `?|`, `?&`, `||`, `-`, `#-`)

<a id="3-json-operators"></a>

### Beginner

Operators navigate documents (`->` returns json/jsonb; `->>` returns text), test containment (`@>`), key existence (`?` family), concatenate (`||`), delete (`-`, `#-`). Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Operators navigate documents (`->` returns json/jsonb; `->>` returns text), test containment (`@>`), key existence (`?` family), concatenate (`||`), delete (`-`, `#-`). Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Operators navigate documents (`->` returns json/jsonb; `->>` returns text), test containment (`@>`), key existence (`?` family), concatenate (`||`), delete (`-`, `#-`). At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT '{"a":{"b":1}}'::jsonb #>> '{a,b}' AS path_text;
SELECT '{"tags":["x","y"]}'::jsonb ? 'tags' AS key_exists;
SELECT '{"a":1}'::jsonb || '{"b":2}'::jsonb AS merged;
```


```bash
psql -X -c "SELECT opname FROM pg_operator WHERE oprname IN ('->','->>','@>');"
```
### Key Points

- `->` vs `->>` impacts types downstream in expressions.
- Path ops `#>`/`#>>` reduce nested `->` chains.
- Containment requires understanding object vs array semantics.

### Best Practices

- Wrap volatile paths in immutable functions before certain index expressions.
- Prefer `@>` for structural containment when possible.

### Common Mistakes

- Chaining `->` without handling NULL intermediate results.

#### Hands-On Lab Walkthrough

        1. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
2. Practice safe `SET statement_timeout` when experimenting with heavy queries.
3. Keep a scratchpad of sample documents/events matching your product domain.
4. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
5. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
6. Document collation/encoding settings; they affect text search and sorting.
7. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
8. Pair SQL exercises with application driver tests (params, JSON serialization).
9. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
10. Practice reading `pg_stat_user_indexes` before/after creating indexes.
11. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
12. Archive lab commands into a personal snippet library for interviews.
13. Write a short postmortem template for query regressions you trigger intentionally.
14. Create a disposable database for exercises related to “JSON operators”.
15. Install required extensions in the lab before running advanced examples.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON operators)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON operators” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 4. JSON Functions (`json_build_object`, `json_each`, `json_array_elements`, …)

<a id="4-json-functions"></a>

### Beginner

Functions construct JSON (`json_build_object`, `jsonb_build_array`), expand (`json_each`, `jsonb_array_elements`), and transform documents set-at-a-time in SQL. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Functions construct JSON (`json_build_object`, `jsonb_build_array`), expand (`json_each`, `jsonb_array_elements`), and transform documents set-at-a-time in SQL. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Functions construct JSON (`json_build_object`, `jsonb_build_array`), expand (`json_each`, `jsonb_array_elements`), and transform documents set-at-a-time in SQL. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT json_build_object('user', 'ada', 'score', 99) AS obj;
SELECT * FROM jsonb_each('{"a":1,"b":2}'::jsonb);
SELECT * FROM jsonb_array_elements('[1,2,3]'::jsonb) AS t(x);
```


```bash
psql -X -c "\df jsonb_*" | head
```
### Key Points

- Set-returning functions pair naturally with `LATERAL`.
- `jsonb_*` variants are usually preferred.
- Mind NULL handling in builders.

### Best Practices

- Use `jsonb_agg`/`json_agg` for structured reporting endpoints.
- Materialize expensive expansions in CTEs for readability.

### Common Mistakes

- Exploding arrays without dedupe logic when cardinality explodes.

#### Hands-On Lab Walkthrough

        1. Practice safe `SET statement_timeout` when experimenting with heavy queries.
2. Keep a scratchpad of sample documents/events matching your product domain.
3. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
4. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
5. Document collation/encoding settings; they affect text search and sorting.
6. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
7. Pair SQL exercises with application driver tests (params, JSON serialization).
8. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
9. Practice reading `pg_stat_user_indexes` before/after creating indexes.
10. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
11. Archive lab commands into a personal snippet library for interviews.
12. Write a short postmortem template for query regressions you trigger intentionally.
13. Create a disposable database for exercises related to “JSON functions”.
14. Install required extensions in the lab before running advanced examples.
15. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON functions)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON functions” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 5. JSON Path Queries (`jsonpath`)

<a id="5-json-path-queries-jsonpath"></a>

### Beginner

SQL/JSON `jsonpath` expressions filter and map JSON with standard predicates; functions like `jsonb_path_query`/`jsonb_path_exists` integrate into SQL. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

SQL/JSON `jsonpath` expressions filter and map JSON with standard predicates; functions like `jsonb_path_query`/`jsonb_path_exists` integrate into SQL. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

SQL/JSON `jsonpath` expressions filter and map JSON with standard predicates; functions like `jsonb_path_query`/`jsonb_path_exists` integrate into SQL. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT jsonb_path_exists('{"a":[1,2,3]}'::jsonb, '$.a[*] ? (@ >= 2)');
SELECT jsonb_path_query('{"items":[{"id":1},{"id":2}]}'::jsonb, '$.items[*].id');
```


```bash
psql -X -c "SELECT jsonb_path_query('[1,2,3]'::jsonb, '$[*] ? (@ > 1)');"
```
### Key Points

- `jsonpath` can express complex filters beyond `@>`.
- Strict/lax modes affect errors vs empty results.
- Great for semi-structured analytics in-SQL.

### Best Practices

- Index-friendly paths may still need functional GIN for hot predicates.
- Validate paths in application tests; typos fail silently as empty sets.

### Common Mistakes

- Confusing SQL `LIKE` semantics with `jsonpath` string matching.

#### Hands-On Lab Walkthrough

        1. Keep a scratchpad of sample documents/events matching your product domain.
2. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
3. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
4. Document collation/encoding settings; they affect text search and sorting.
5. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
6. Pair SQL exercises with application driver tests (params, JSON serialization).
7. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
8. Practice reading `pg_stat_user_indexes` before/after creating indexes.
9. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
10. Archive lab commands into a personal snippet library for interviews.
11. Write a short postmortem template for query regressions you trigger intentionally.
12. Create a disposable database for exercises related to “jsonpath”.
13. Install required extensions in the lab before running advanced examples.
14. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
15. Practice safe `SET statement_timeout` when experimenting with heavy queries.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (jsonpath)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “jsonpath” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 6. JSONB Indexing (GIN)

<a id="6-jsonb-indexing-gin"></a>

### Beginner

GIN indexes accelerate containment/existence predicates. Choose `jsonb_ops` vs `jsonb_path_ops` tradeoffs (size vs operator support). Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

GIN indexes accelerate containment/existence predicates. Choose `jsonb_ops` vs `jsonb_path_ops` tradeoffs (size vs operator support). Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

GIN indexes accelerate containment/existence predicates. Choose `jsonb_ops` vs `jsonb_path_ops` tradeoffs (size vs operator support). At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE TABLE IF NOT EXISTS events (id bigserial PRIMARY KEY, body jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS events_body_gin ON events USING gin (body jsonb_path_ops);
SELECT indexrelid::regclass, pg_size_pretty(pg_relation_size(indexrelid)) AS ix_size
FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid WHERE c.relname = 'events';
```


```bash
psql -X -c "\d+ events"
```
### Key Points

- `jsonb_path_ops` supports `@>` but not all operators.
- GIN indexes are heavier on writes than B-tree.
- Partial GIN can target one hot key.

### Best Practices

- Rebuild indexes after major JSON shape changes.
- Measure index bloat if payloads churn heavily.

### Common Mistakes

- Creating GIN without matching predicates in queries.

#### Hands-On Lab Walkthrough

        1. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
2. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
3. Document collation/encoding settings; they affect text search and sorting.
4. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
5. Pair SQL exercises with application driver tests (params, JSON serialization).
6. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
7. Practice reading `pg_stat_user_indexes` before/after creating indexes.
8. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
9. Archive lab commands into a personal snippet library for interviews.
10. Write a short postmortem template for query regressions you trigger intentionally.
11. Create a disposable database for exercises related to “JSONB GIN”.
12. Install required extensions in the lab before running advanced examples.
13. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
14. Practice safe `SET statement_timeout` when experimenting with heavy queries.
15. Keep a scratchpad of sample documents/events matching your product domain.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSONB GIN)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSONB GIN” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 7. JSONB Update Operations

<a id="7-jsonb-update-operations"></a>

### Beginner

Updates combine `jsonb_set`, `||`, `-`, and `#-` to mutate documents; prefer single-statement updates to reduce round trips. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Updates combine `jsonb_set`, `||`, `-`, and `#-` to mutate documents; prefer single-statement updates to reduce round trips. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Updates combine `jsonb_set`, `||`, `-`, and `#-` to mutate documents; prefer single-statement updates to reduce round trips. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
UPDATE events SET body = jsonb_set(body, '{status}', '"done"', true) WHERE id = 1;
UPDATE events SET body = body - 'temp' || '{"reviewed":true}'::jsonb WHERE id = 1;
```


```bash
psql -X -c "EXPLAIN UPDATE events SET body = body || '{\"x\":1}' WHERE id=1;"
```
### Key Points

- Immutable patterns ease reasoning about row-level triggers.
- Large in-place documents increase HOT update constraints.
- Consider normalized columns for scalars you filter often.

### Best Practices

- Batch updates in transactions with appropriate `work_mem`.
- Use `RETURNING` to verify mutations.

### Common Mistakes

- Using `jsonb_set` with wrong path types causing silent NULL branches.

#### Hands-On Lab Walkthrough

        1. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
2. Document collation/encoding settings; they affect text search and sorting.
3. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
4. Pair SQL exercises with application driver tests (params, JSON serialization).
5. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
6. Practice reading `pg_stat_user_indexes` before/after creating indexes.
7. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
8. Archive lab commands into a personal snippet library for interviews.
9. Write a short postmortem template for query regressions you trigger intentionally.
10. Create a disposable database for exercises related to “JSONB updates”.
11. Install required extensions in the lab before running advanced examples.
12. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
13. Practice safe `SET statement_timeout` when experimenting with heavy queries.
14. Keep a scratchpad of sample documents/events matching your product domain.
15. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSONB updates)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSONB updates” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 8. Converting To/From JSON (`to_json`, `row_to_json`, casts)

<a id="8-converting-to-from-json"></a>

### Beginner

Aggregate and row constructors map relational tuples to JSON for APIs and ETL. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Aggregate and row constructors map relational tuples to JSON for APIs and ETL. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Aggregate and row constructors map relational tuples to JSON for APIs and ETL. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT to_json(now());
SELECT row_to_json(t) FROM (SELECT 1 AS a, 'x' AS b) t;
```


```bash
psql -X -c "SELECT row_to_json(s) FROM pg_settings s WHERE name='server_version';"
```
### Key Points

- Type casts drive JSON output shapes.
- Arrays need careful aggregation order.

### Best Practices

- Use `json_strip_nulls` when clients dislike null keys.
- Control numeric formatting with casts to `text`/`numeric` as needed.

### Common Mistakes

- Assuming `row_to_json` includes desired column aliases without explicit subselect.

#### Hands-On Lab Walkthrough

        1. Document collation/encoding settings; they affect text search and sorting.
2. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
3. Pair SQL exercises with application driver tests (params, JSON serialization).
4. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
5. Practice reading `pg_stat_user_indexes` before/after creating indexes.
6. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
7. Archive lab commands into a personal snippet library for interviews.
8. Write a short postmortem template for query regressions you trigger intentionally.
9. Create a disposable database for exercises related to “JSON conversion”.
10. Install required extensions in the lab before running advanced examples.
11. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
12. Practice safe `SET statement_timeout` when experimenting with heavy queries.
13. Keep a scratchpad of sample documents/events matching your product domain.
14. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
15. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON conversion)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON conversion” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 9. JSON Aggregation (`json_agg`, `jsonb_agg`, `json_object_agg`, …)

<a id="9-json-aggregation"></a>

### Beginner

Aggregates build arrays/objects per `GROUP BY`—ideal for nested API payloads directly from SQL. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Aggregates build arrays/objects per `GROUP BY`—ideal for nested API payloads directly from SQL. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Aggregates build arrays/objects per `GROUP BY`—ideal for nested API payloads directly from SQL. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT coalesce(body->>'customer_id','unknown') AS customer_id,
       jsonb_agg(body ORDER BY id) AS items
FROM events
GROUP BY 1;
```


```bash
psql -X -c "SELECT jsonb_object_agg('a',1) AS o;"
```
### Key Points

- `ORDER BY` inside aggregates controls array ordering.
- NULL inputs affect aggregate behavior—use `FILTER`.

### Best Practices

- Spill risk grows with large groups—watch `work_mem`.
- Consider two-step aggregates for huge fanout.

### Common Mistakes

- Omitting `GROUP BY` keys leading to unintended global aggregates.

#### Hands-On Lab Walkthrough

        1. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
2. Pair SQL exercises with application driver tests (params, JSON serialization).
3. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
4. Practice reading `pg_stat_user_indexes` before/after creating indexes.
5. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
6. Archive lab commands into a personal snippet library for interviews.
7. Write a short postmortem template for query regressions you trigger intentionally.
8. Create a disposable database for exercises related to “JSON aggregation”.
9. Install required extensions in the lab before running advanced examples.
10. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
11. Practice safe `SET statement_timeout` when experimenting with heavy queries.
12. Keep a scratchpad of sample documents/events matching your product domain.
13. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
14. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
15. Document collation/encoding settings; they affect text search and sorting.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON aggregation)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON aggregation” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 10. JSON Validation & Constraints

<a id="10-json-validation"></a>

### Beginner

Combine `CHECK` constraints, `jsonb_typeof`, and `jsonschema` patterns (via extensions or app validation) to guard payloads. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Combine `CHECK` constraints, `jsonb_typeof`, and `jsonschema` patterns (via extensions or app validation) to guard payloads. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Combine `CHECK` constraints, `jsonb_typeof`, and `jsonschema` patterns (via extensions or app validation) to guard payloads. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
ALTER TABLE events ADD CONSTRAINT body_is_object
  CHECK (jsonb_typeof(body) = 'object');
```


```bash
psql -X -c "SELECT jsonb_typeof('[]'::jsonb);"
```
### Key Points

- Database constraints complement—not replace—API validation.
- Lightweight checks prevent catastrophic shapes.

### Best Practices

- Document allowed schemas for producers and consumers.
- Use `NOT VALID` + validate when adding to big tables.

### Common Mistakes

- Overly rigid constraints blocking legitimate backward-compatible extensions.

#### Hands-On Lab Walkthrough

        1. Pair SQL exercises with application driver tests (params, JSON serialization).
2. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
3. Practice reading `pg_stat_user_indexes` before/after creating indexes.
4. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
5. Archive lab commands into a personal snippet library for interviews.
6. Write a short postmortem template for query regressions you trigger intentionally.
7. Create a disposable database for exercises related to “JSON validation”.
8. Install required extensions in the lab before running advanced examples.
9. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
10. Practice safe `SET statement_timeout` when experimenting with heavy queries.
11. Keep a scratchpad of sample documents/events matching your product domain.
12. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
13. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
14. Document collation/encoding settings; they affect text search and sorting.
15. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON validation)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON validation” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 11. JSONB vs Relational Modeling

<a id="11-jsonb-vs-relational"></a>

### Beginner

Use `jsonb` for flexible/evolving attributes; normalize hot filter columns for index-friendly B-tree access and FK integrity. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Use `jsonb` for flexible/evolving attributes; normalize hot filter columns for index-friendly B-tree access and FK integrity. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Use `jsonb` for flexible/evolving attributes; normalize hot filter columns for index-friendly B-tree access and FK integrity. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
-- Hybrid pattern sketch
CREATE TABLE orders (id bigint PRIMARY KEY, status text NOT NULL, attrs jsonb NOT NULL);
CREATE INDEX ON orders (status);
```


```bash
psql -X -c "SELECT 1;"
```
### Key Points

- Hybrid models are common at scale.
- Foreign keys cannot target keys inside `jsonb` without generated columns/triggers.

### Best Practices

- Promote stable keys to columns with generated stored columns when needed.
- Revisit design as query patterns stabilize.

### Common Mistakes

- Storing everything in `jsonb` then complaining indexes cannot keep up.

#### Hands-On Lab Walkthrough

        1. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
2. Practice reading `pg_stat_user_indexes` before/after creating indexes.
3. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
4. Archive lab commands into a personal snippet library for interviews.
5. Write a short postmortem template for query regressions you trigger intentionally.
6. Create a disposable database for exercises related to “JSONB vs relational”.
7. Install required extensions in the lab before running advanced examples.
8. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
9. Practice safe `SET statement_timeout` when experimenting with heavy queries.
10. Keep a scratchpad of sample documents/events matching your product domain.
11. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
12. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
13. Document collation/encoding settings; they affect text search and sorting.
14. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
15. Pair SQL exercises with application driver tests (params, JSON serialization).

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSONB vs relational)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSONB vs relational” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 12. JSON in Full-Text Search

<a id="12-json-in-full-text-search"></a>

### Beginner

Extract text fields with `->>` and wrap `to_tsvector`/`to_tsquery`; index `tsvector` generated columns for performance. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Extract text fields with `->>` and wrap `to_tsvector`/`to_tsquery`; index `tsvector` generated columns for performance. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Extract text fields with `->>` and wrap `to_tsvector`/`to_tsquery`; index `tsvector` generated columns for performance. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT to_tsvector('english', body->>'title') ||
       to_tsvector('english', coalesce(body->>'desc','')) AS doc
FROM events;
```


```bash
psql -X -c "SELECT to_tsvector('english', '{"t":"hello world"}'::jsonb->>'t');"
```
### Key Points

- Compose multiple fields with weights using `setweight`.
- Language config should match user-facing search.

### Best Practices

- Generated stored `tsvector` columns keep indexes maintainable.
- Refresh statistics after changing extraction logic.

### Common Mistakes

- Passing entire `jsonb` blobs to `to_tsvector` without narrowing fields.

#### Hands-On Lab Walkthrough

        1. Practice reading `pg_stat_user_indexes` before/after creating indexes.
2. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
3. Archive lab commands into a personal snippet library for interviews.
4. Write a short postmortem template for query regressions you trigger intentionally.
5. Create a disposable database for exercises related to “JSON + FTS”.
6. Install required extensions in the lab before running advanced examples.
7. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
8. Practice safe `SET statement_timeout` when experimenting with heavy queries.
9. Keep a scratchpad of sample documents/events matching your product domain.
10. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
11. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
12. Document collation/encoding settings; they affect text search and sorting.
13. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
14. Pair SQL exercises with application driver tests (params, JSON serialization).
15. Time queries at realistic concurrency using `pgbench` custom scripts when possible.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON + FTS)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON + FTS” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 13. Real-World JSON Patterns

<a id="13-real-world-json-patterns"></a>

### Beginner

Common uses: event logs, feature flags, flexible product attributes, API response caching, and mobile sync documents. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Common uses: event logs, feature flags, flexible product attributes, API response caching, and mobile sync documents. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Common uses: event logs, feature flags, flexible product attributes, API response caching, and mobile sync documents. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
INSERT INTO events (body) VALUES ('{"type":"signup","user_id":42,"props":{"plan":"pro"}}'::jsonb)
ON CONFLICT DO NOTHING;
```


```bash
psql -X -c "SELECT body->>'type' AS type, count(*) FROM events GROUP BY 1;"
```
### Key Points

- Version documents if clients evolve independently.
- Partition large event tables by time when appropriate.

### Best Practices

- Use TTL/archival policies for observability JSON volume.
- Redact PII at ingestion boundaries.

### Common Mistakes

- Storing PCI/PII in unencrypted `jsonb` without classification.

#### Hands-On Lab Walkthrough

        1. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
2. Archive lab commands into a personal snippet library for interviews.
3. Write a short postmortem template for query regressions you trigger intentionally.
4. Create a disposable database for exercises related to “JSON patterns”.
5. Install required extensions in the lab before running advanced examples.
6. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
7. Practice safe `SET statement_timeout` when experimenting with heavy queries.
8. Keep a scratchpad of sample documents/events matching your product domain.
9. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
10. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
11. Document collation/encoding settings; they affect text search and sorting.
12. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
13. Pair SQL exercises with application driver tests (params, JSON serialization).
14. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
15. Practice reading `pg_stat_user_indexes` before/after creating indexes.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON patterns)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON patterns” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 14. JSON Best Practices

<a id="14-json-best-practices"></a>

### Beginner

Prefer `jsonb`, constrain shapes, index consciously, measure bloat, and plan migrations with generated columns or background backfills. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Prefer `jsonb`, constrain shapes, index consciously, measure bloat, and plan migrations with generated columns or background backfills. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Prefer `jsonb`, constrain shapes, index consciously, measure bloat, and plan migrations with generated columns or background backfills. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT relname, n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'events';
```


```bash
psql -X -c "VACUUM (ANALYZE) events;"
```
### Key Points

- Treat JSON columns like APIs: schema + SLAs.
- Re-evaluate indexes as predicates shift.

### Best Practices

- Automate vacuum tuning for high-churn JSON tables.
- Load test writes—GIN indexes magnify update costs.

### Common Mistakes

- Blindly adding GIN everywhere without workload proof.

#### Hands-On Lab Walkthrough

        1. Archive lab commands into a personal snippet library for interviews.
2. Write a short postmortem template for query regressions you trigger intentionally.
3. Create a disposable database for exercises related to “JSON best practices”.
4. Install required extensions in the lab before running advanced examples.
5. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
6. Practice safe `SET statement_timeout` when experimenting with heavy queries.
7. Keep a scratchpad of sample documents/events matching your product domain.
8. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
9. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
10. Document collation/encoding settings; they affect text search and sorting.
11. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
12. Pair SQL exercises with application driver tests (params, JSON serialization).
13. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
14. Practice reading `pg_stat_user_indexes` before/after creating indexes.
15. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON best practices)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “JSON best practices” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

