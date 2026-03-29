# Extensions and Modules

**PostgreSQL learning notes (March 2026). Aligned with README topic 24.**

---

## 📑 Table of Contents

- [1. Extension System](#1-extension-system)
- [2. Built-in Extensions (`pg_stat_statements`, `pg_trgm`, `uuid-ossp`, `hstore`, `intarray`, `ltree`, `pg_repack`, `pg_buffercache`)](#2-built-in-extensions)
- [3. PostGIS Extension](#3-postgis-extension)
- [4. `pgvector` Extension](#4-pgvector-extension)
- [5. `citext` Extension](#5-citext-extension)
- [6. Full-Text Search Extensions (`unaccent`, dictionaries, `pg_trgm`)](#6-full-text-search-extensions)
- [7. JSON Extensions & SQL/JSON Evolution](#7-json-extensions)
- [8. Performance Monitoring Extensions (`pg_stat_statements`, `pg_stat_monitor`)](#8-performance-monitoring-extensions)
- [9. Buffer & Memory Management (`pg_buffercache`)](#9-buffer-memory-management)
- [10. UUID Generation (`uuid-ossp` / built-in `gen_random_uuid`)](#10-uuid-generation)
- [11. Job Scheduling (`pg_cron`)](#11-job-scheduling-pg-cron)
- [12. Partition Management (`pg_partman`)](#12-partition-management-pg-partman)
- [13. TimescaleDB](#13-timescaledb)
- [14. Citus (Distributed PostgreSQL)](#14-citus)
- [15. Array Extensions (`intarray`)](#15-array-extensions-intarray)
- [16. Compatibility & Procedural Language Extensions](#16-compatibility-extensions)
- [17. Foreign Data Wrappers (FDW)](#17-foreign-data-wrapper-fdw)
- [18. Audit & Compliance (`pgaudit`)](#18-audit-compliance-pgaudit)
- [19. Security Extensions (`pgcrypto`)](#19-security-extensions-pgcrypto)
- [20. Tree Extensions (`ltree`), Custom Development & External Search (Elasticsearch)](#20-tree-custom-external-search)

---

## 1. Extension System

<a id="1-extension-system"></a>

### Beginner

Extensions package SQL objects and libraries into versioned bundles managed via `CREATE EXTENSION`. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Extensions package SQL objects and libraries into versioned bundles managed via `CREATE EXTENSION`. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Extensions package SQL objects and libraries into versioned bundles managed via `CREATE EXTENSION`. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT name, default_version, installed_version FROM pg_available_extensions ORDER BY name LIMIT 15;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```


```bash
psql -X -c "\dx"
```
### Key Points

- `pg_extension` records installed modules.
- Upgrades use `ALTER EXTENSION ... UPDATE`.
- Dependencies order installs.

### Best Practices

- Pin extension versions in migrations.
- Review `COMMENT` and ownership.

### Common Mistakes

- Installing from untrusted paths without review.

#### Hands-On Lab Walkthrough

        1. Create a disposable database for exercises related to “extensions”.
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
        -- Supplemental diagnostics (extensions)
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

        - Where does “extensions” show up in `EXPLAIN` plans and system catalogs?
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

## 2. Built-in Extensions (`pg_stat_statements`, `pg_trgm`, `uuid-ossp`, `hstore`, `intarray`, `ltree`, `pg_repack`, `pg_buffercache`)

<a id="2-built-in-extensions"></a>

### Beginner

These modules cover stats, fuzzy text, UUID helpers, k-v maps, integer array ops, hierarchical labels, online reorganize, and buffer inspection. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

These modules cover stats, fuzzy text, UUID helpers, k-v maps, integer array ops, hierarchical labels, online reorganize, and buffer inspection. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

These modules cover stats, fuzzy text, UUID helpers, k-v maps, integer array ops, hierarchical labels, online reorganize, and buffer inspection. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 5;
```


```bash
psql -X -c "SELECT extname FROM pg_extension;"
```
### Key Points

- `pg_stat_statements` needs `shared_preload_libraries` + restart.
- `pg_repack` is operational tooling with locks discipline.

### Best Practices

- Read each extension’s README in official docs.
- Automate extension inventory in CMDB.

### Common Mistakes

- Assuming extensions auto-upgrade across major PG versions.

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
15. Create a disposable database for exercises related to “built-in extensions”.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (built-in extensions)
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

        - Where does “built-in extensions” show up in `EXPLAIN` plans and system catalogs?
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

## 3. PostGIS Extension

<a id="3-postgis-extension"></a>

### Beginner

PostGIS adds spatial types, predicates, measurements, and reprojection utilities for GIS workloads. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

PostGIS adds spatial types, predicates, measurements, and reprojection utilities for GIS workloads. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

PostGIS adds spatial types, predicates, measurements, and reprojection utilities for GIS workloads. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT ST_Area(ST_GeomFromText('POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))'));
```


```bash
psql -X -c "SELECT postgis_full_version();"
```
### Key Points

- SRIDs must be explicit in serious apps.
- Raster/3D features are optional subsets.

### Best Practices

- Tune `shared_buffers` and parallel for heavy spatial joins.
- Index selectivity matters.

### Common Mistakes

- Mixing lat/lon order inconsistently.

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
14. Create a disposable database for exercises related to “PostGIS”.
15. Install required extensions in the lab before running advanced examples.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (PostGIS)
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

        - Where does “PostGIS” show up in `EXPLAIN` plans and system catalogs?
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

## 4. `pgvector` Extension

<a id="4-pgvector-extension"></a>

### Beginner

`pgvector` stores embeddings and supports ANN indexes (IVFFlat/HNSW) for semantic search and recommendations. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`pgvector` stores embeddings and supports ANN indexes (IVFFlat/HNSW) for semantic search and recommendations. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`pgvector` stores embeddings and supports ANN indexes (IVFFlat/HNSW) for semantic search and recommendations. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS items (id bigserial PRIMARY KEY, emb vector(3));
CREATE INDEX ON items USING hnsw (emb vector_cosine_ops);
```


```bash
psql -X -c "SELECT * FROM pg_am WHERE amname IN ('hnsw','ivfflat');"
```
### Key Points

- Pick distance ops matching training loss.
- Index build times can be substantial.

### Best Practices

- Version your embedding model with the column.
- Use reranking for top-K quality.

### Common Mistakes

- Oversizing vectors dimension without storage planning.

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
13. Create a disposable database for exercises related to “pgvector”.
14. Install required extensions in the lab before running advanced examples.
15. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pgvector)
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

        - Where does “pgvector” show up in `EXPLAIN` plans and system catalogs?
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

## 5. `citext` Extension

<a id="5-citext-extension"></a>

### Beginner

`citext` provides case-insensitive text type—handy for emails/usernames with simpler indexes than functional lower(). Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`citext` provides case-insensitive text type—handy for emails/usernames with simpler indexes than functional lower(). Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`citext` provides case-insensitive text type—handy for emails/usernames with simpler indexes than functional lower(). At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS citext;
CREATE TABLE IF NOT EXISTS users (email citext PRIMARY KEY);
INSERT INTO users VALUES ('Ada@EXAMPLE.com') ON CONFLICT DO NOTHING;
```


```bash
psql -X -c "SELECT 'Foo'::citext = 'fOO'::citext;"
```
### Key Points

- Collation still matters for some comparisons.
- Not a substitute for normalization rules.

### Best Practices

- Pair with constraints preventing homoglyph attacks when needed.
- Document uniqueness semantics.

### Common Mistakes

- Assuming citext solves all Unicode normalization issues.

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
12. Create a disposable database for exercises related to “citext”.
13. Install required extensions in the lab before running advanced examples.
14. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
15. Practice safe `SET statement_timeout` when experimenting with heavy queries.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (citext)
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

        - Where does “citext” show up in `EXPLAIN` plans and system catalogs?
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

## 6. Full-Text Search Extensions (`unaccent`, dictionaries, `pg_trgm`)

<a id="6-full-text-search-extensions"></a>

### Beginner

FTS ecosystem includes `unaccent`, custom dictionaries, snowball configs, and trigram helpers for fuzzy matching alongside `tsvector`. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

FTS ecosystem includes `unaccent`, custom dictionaries, snowball configs, and trigram helpers for fuzzy matching alongside `tsvector`. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

FTS ecosystem includes `unaccent`, custom dictionaries, snowball configs, and trigram helpers for fuzzy matching alongside `tsvector`. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
SELECT unaccent('Résumé');
```


```bash
psql -X -c "SELECT cfgname FROM pg_ts_config;"
```
### Key Points

- Combine `unaccent` with immutable wrappers for indexes.
- Test stemming per language.

### Best Practices

- Keep dictionary assets in version control.
- Measure ranking changes when altering configs.

### Common Mistakes

- Indexing `unaccent(lower(col))` without marking immutable carefully.

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
11. Create a disposable database for exercises related to “FTS extensions”.
12. Install required extensions in the lab before running advanced examples.
13. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
14. Practice safe `SET statement_timeout` when experimenting with heavy queries.
15. Keep a scratchpad of sample documents/events matching your product domain.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FTS extensions)
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

        - Where does “FTS extensions” show up in `EXPLAIN` plans and system catalogs?
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

## 7. JSON Extensions & SQL/JSON Evolution

<a id="7-json-extensions"></a>

### Beginner

Core PostgreSQL now ships rich JSON/SQL JSON; some distros package extras—track `jsonpath`, functions, and performance patches per version. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Core PostgreSQL now ships rich JSON/SQL JSON; some distros package extras—track `jsonpath`, functions, and performance patches per version. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Core PostgreSQL now ships rich JSON/SQL JSON; some distros package extras—track `jsonpath`, functions, and performance patches per version. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT jsonb_path_exists('{"x":1}'::jsonb, '$.x');
```


```bash
psql -X -c "SELECT * FROM pg_extension WHERE extname LIKE 'json%';"
```
### Key Points

- Prefer core functions before external JSON engines.
- GIN still primary index access.

### Best Practices

- Track release notes for SQL/JSON additions.
- Test driver serialization.

### Common Mistakes

- Assuming ORM JSON equals database JSON validation.

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
10. Create a disposable database for exercises related to “JSON extensions”.
11. Install required extensions in the lab before running advanced examples.
12. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
13. Practice safe `SET statement_timeout` when experimenting with heavy queries.
14. Keep a scratchpad of sample documents/events matching your product domain.
15. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (JSON extensions)
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

        - Where does “JSON extensions” show up in `EXPLAIN` plans and system catalogs?
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

## 8. Performance Monitoring Extensions (`pg_stat_statements`, `pg_stat_monitor`)

<a id="8-performance-monitoring-extensions"></a>

### Beginner

Track normalized query stats, plan samples, and time buckets; essential for optimization workflows. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Track normalized query stats, plan samples, and time buckets; essential for optimization workflows. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Track normalized query stats, plan samples, and time buckets; essential for optimization workflows. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT queryid, calls, mean_exec_time, rows FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
```


```bash
psql -X -c "SELECT pg_stat_statements_reset();"
```
### Key Points

- Reset windows intentionally for A/B tests.
- Protect sensitive query text in logs.

### Best Practices

- Export top-N to dashboards.
- Correlate with OS metrics.

### Common Mistakes

- Enabling without disk/memory planning for high-cardinality workloads.

#### Hands-On Lab Walkthrough

        1. Document collation/encoding settings; they affect text search and sorting.
2. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
3. Pair SQL exercises with application driver tests (params, JSON serialization).
4. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
5. Practice reading `pg_stat_user_indexes` before/after creating indexes.
6. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
7. Archive lab commands into a personal snippet library for interviews.
8. Write a short postmortem template for query regressions you trigger intentionally.
9. Create a disposable database for exercises related to “monitoring extensions”.
10. Install required extensions in the lab before running advanced examples.
11. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
12. Practice safe `SET statement_timeout` when experimenting with heavy queries.
13. Keep a scratchpad of sample documents/events matching your product domain.
14. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
15. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (monitoring extensions)
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

        - Where does “monitoring extensions” show up in `EXPLAIN` plans and system catalogs?
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

## 9. Buffer & Memory Management (`pg_buffercache`)

<a id="9-buffer-memory-management"></a>

### Beginner

`pg_buffercache` exposes shared buffer contents for hot relation debugging—use on privileged sessions only. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`pg_buffercache` exposes shared buffer contents for hot relation debugging—use on privileged sessions only. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`pg_buffercache` exposes shared buffer contents for hot relation debugging—use on privileged sessions only. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS pg_buffercache;
SELECT count(*) AS buffers_in_cache FROM pg_buffercache;
```


```bash
psql -X -c "SELECT * FROM pg_buffercache LIMIT 1;"
```
### Key Points

- Sampling can be expensive—limit queries.
- Interpret results with context.

### Best Practices

- Pair with `pg_stat_io` (modern versions) for deeper signals.
- Avoid running on tiny instances during peaks.

### Common Mistakes

- Misreading buffer hits as business KPIs.

#### Hands-On Lab Walkthrough

        1. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
2. Pair SQL exercises with application driver tests (params, JSON serialization).
3. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
4. Practice reading `pg_stat_user_indexes` before/after creating indexes.
5. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
6. Archive lab commands into a personal snippet library for interviews.
7. Write a short postmortem template for query regressions you trigger intentionally.
8. Create a disposable database for exercises related to “pg_buffercache”.
9. Install required extensions in the lab before running advanced examples.
10. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
11. Practice safe `SET statement_timeout` when experimenting with heavy queries.
12. Keep a scratchpad of sample documents/events matching your product domain.
13. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
14. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
15. Document collation/encoding settings; they affect text search and sorting.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pg_buffercache)
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

        - Where does “pg_buffercache” show up in `EXPLAIN` plans and system catalogs?
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

## 10. UUID Generation (`uuid-ossp` / built-in gen_random_uuid)

<a id="10-uuid-generation"></a>

### Beginner

Use `gen_random_uuid()` when available; `uuid-ossp` provides v1/v4 helpers and namespace UUIDs. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Use `gen_random_uuid()` when available; `uuid-ossp` provides v1/v4 helpers and namespace UUIDs. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Use `gen_random_uuid()` when available; `uuid-ossp` provides v1/v4 helpers and namespace UUIDs. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT gen_random_uuid();
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT uuid_generate_v4();
```


```bash
psql -X -Atqc "SELECT oid::regprocedure FROM pg_proc WHERE proname='gen_random_uuid';"
```
### Key Points

- UUID indexes behave differently than sequential ints.
- Consider `uuidv7` patterns externally if needed.

### Best Practices

- Monitor insert fragmentation on btree.
- Use `uuid` vs `text` deliberately.

### Common Mistakes

- Assuming UUIDs remove all collision risks without version discipline.

#### Hands-On Lab Walkthrough

        1. Pair SQL exercises with application driver tests (params, JSON serialization).
2. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
3. Practice reading `pg_stat_user_indexes` before/after creating indexes.
4. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
5. Archive lab commands into a personal snippet library for interviews.
6. Write a short postmortem template for query regressions you trigger intentionally.
7. Create a disposable database for exercises related to “UUID generation”.
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
        -- Supplemental diagnostics (UUID generation)
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

        - Where does “UUID generation” show up in `EXPLAIN` plans and system catalogs?
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

## 11. Job Scheduling (`pg_cron`)

<a id="11-job-scheduling-pg-cron"></a>

### Beginner

`pg_cron` schedules SQL/command jobs inside the database—great for maintenance windows when external schedulers are undesirable. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`pg_cron` schedules SQL/command jobs inside the database—great for maintenance windows when external schedulers are undesirable. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`pg_cron` schedules SQL/command jobs inside the database—great for maintenance windows when external schedulers are undesirable. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
-- Illustrative; actual catalog differs by install
SELECT * FROM cron.job LIMIT 5;
```


```bash
psql -X -c "SELECT name, default_version FROM pg_available_extensions WHERE name='pg_cron';"
```
### Key Points

- Jobs run as defined roles—least privilege.
- Watch concurrency with autovacuum.

### Best Practices

- Log job outputs centrally.
- Prefer external orchestration for complex DAGs.

### Common Mistakes

- Embedding secrets inside cron command text.

#### Hands-On Lab Walkthrough

        1. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
2. Practice reading `pg_stat_user_indexes` before/after creating indexes.
3. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
4. Archive lab commands into a personal snippet library for interviews.
5. Write a short postmortem template for query regressions you trigger intentionally.
6. Create a disposable database for exercises related to “pg_cron”.
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
        -- Supplemental diagnostics (pg_cron)
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

        - Where does “pg_cron” show up in `EXPLAIN` plans and system catalogs?
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

## 12. Partition Management (`pg_partman`)

<a id="12-partition-management-pg-partman"></a>

### Beginner

`pg_partman` automates creation/retention of time/serial partitions—reduces human error in large tables. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`pg_partman` automates creation/retention of time/serial partitions—reduces human error in large tables. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`pg_partman` automates creation/retention of time/serial partitions—reduces human error in large tables. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT schemaname, tablename FROM pg_tables WHERE tablename LIKE '%_p2026%';
```


```bash
psql -X -c "SELECT * FROM pg_available_extensions WHERE name='pg_partman';"
```
### Key Points

- Still requires monitoring free space and statistics per child.
- Test detach/attach procedures.

### Best Practices

- Document naming conventions.
- Align with archival pipelines.

### Common Mistakes

- Expecting magic performance without query pruning-friendly predicates.

#### Hands-On Lab Walkthrough

        1. Practice reading `pg_stat_user_indexes` before/after creating indexes.
2. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
3. Archive lab commands into a personal snippet library for interviews.
4. Write a short postmortem template for query regressions you trigger intentionally.
5. Create a disposable database for exercises related to “pg_partman”.
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
        -- Supplemental diagnostics (pg_partman)
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

        - Where does “pg_partman” show up in `EXPLAIN` plans and system catalogs?
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

## 13. TimescaleDB

<a id="13-timescaledb"></a>

### Beginner

TimescaleDB extends PostgreSQL for time-series with hypertables, compression, and continuous aggregates—operational model differs from vanilla partitions. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

TimescaleDB extends PostgreSQL for time-series with hypertables, compression, and continuous aggregates—operational model differs from vanilla partitions. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

TimescaleDB extends PostgreSQL for time-series with hypertables, compression, and continuous aggregates—operational model differs from vanilla partitions. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS timescaledb;
```


```bash
psql -X -c "SELECT default_version FROM pg_available_extensions WHERE name='timescaledb';"
```
### Key Points

- Understand license/edition features you rely on.
- Compression interacts with updates.

### Best Practices

- Plan chunk intervals to match query filters.
- Use continuous aggregates for rollups.

### Common Mistakes

- Treating hypertables as normal tables without chunk-aware queries.

#### Hands-On Lab Walkthrough

        1. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
2. Archive lab commands into a personal snippet library for interviews.
3. Write a short postmortem template for query regressions you trigger intentionally.
4. Create a disposable database for exercises related to “TimescaleDB”.
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
        -- Supplemental diagnostics (TimescaleDB)
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

        - Where does “TimescaleDB” show up in `EXPLAIN` plans and system catalogs?
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

## 14. Citus (Distributed PostgreSQL)

<a id="14-citus"></a>

### Beginner

Citus shards tables across workers, distributing storage and query execution with coordinator planning. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Citus shards tables across workers, distributing storage and query execution with coordinator planning. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Citus shards tables across workers, distributing storage and query execution with coordinator planning. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT * FROM pg_available_extensions WHERE name='citus';
```


```bash
psql -X -c "SHOW citus.version;"
```
### Key Points

- Distribution column choice is architectural.
- Some SQL constructs have limitations.

### Best Practices

- Test failover of coordinator/workers.
- Monitor rebalancing jobs.

### Common Mistakes

- Choosing poor shard keys causing hotspots.

#### Hands-On Lab Walkthrough

        1. Archive lab commands into a personal snippet library for interviews.
2. Write a short postmortem template for query regressions you trigger intentionally.
3. Create a disposable database for exercises related to “Citus”.
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
        -- Supplemental diagnostics (Citus)
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

        - Where does “Citus” show up in `EXPLAIN` plans and system catalogs?
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

## 15. Array Extensions (`intarray`)

<a id="15-array-extensions-intarray"></a>

### Beginner

`intarray` provides integer array operators/index support useful for tag sets and ACL lists. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`intarray` provides integer array operators/index support useful for tag sets and ACL lists. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`intarray` provides integer array operators/index support useful for tag sets and ACL lists. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS intarray;
SELECT ARRAY[1,2,3] @> ARRAY[2] AS contains;
```


```bash
psql -X -c "SELECT extname FROM pg_available_extensions WHERE name='intarray';"
```
### Key Points

- Specialized—benchmark vs native arrays for your ops.
- GiST/GIN choices matter.

### Best Practices

- Document expected cardinality.
- Pair with exclusion patterns cautiously.

### Common Mistakes

- Using intarray operators without reading compatibility notes.

#### Hands-On Lab Walkthrough

        1. Write a short postmortem template for query regressions you trigger intentionally.
2. Create a disposable database for exercises related to “intarray”.
3. Install required extensions in the lab before running advanced examples.
4. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
5. Practice safe `SET statement_timeout` when experimenting with heavy queries.
6. Keep a scratchpad of sample documents/events matching your product domain.
7. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
8. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
9. Document collation/encoding settings; they affect text search and sorting.
10. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
11. Pair SQL exercises with application driver tests (params, JSON serialization).
12. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
13. Practice reading `pg_stat_user_indexes` before/after creating indexes.
14. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
15. Archive lab commands into a personal snippet library for interviews.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (intarray)
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

        - Where does “intarray” show up in `EXPLAIN` plans and system catalogs?
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

## 16. Compatibility & Procedural Language Extensions

<a id="16-compatibility-extensions"></a>

### Beginner

Oracle/MySQL compatibility extensions and language handlers (`plpython3u`, `plperl`, etc.) enable migration and embedded logic—mind security definer and untrusted languages. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Oracle/MySQL compatibility extensions and language handlers (`plpython3u`, `plperl`, etc.) enable migration and embedded logic—mind security definer and untrusted languages. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Oracle/MySQL compatibility extensions and language handlers (`plpython3u`, `plperl`, etc.) enable migration and embedded logic—mind security definer and untrusted languages. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT lanname FROM pg_language WHERE lanpltrusted = false;
```


```bash
psql -X -c "SELECT * FROM pg_available_extensions WHERE name LIKE 'oracle%' OR name LIKE 'mysql%';"
```
### Key Points

- Untrusted languages can bypass protections—restrict roles.
- Patch diligently.

### Best Practices

- Sandbox ETL scripts.
- Prefer core SQL when possible.

### Common Mistakes

- Granting PUBLIC execute on unsafe wrappers.

#### Hands-On Lab Walkthrough

        1. Create a disposable database for exercises related to “compatibility”.
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
        -- Supplemental diagnostics (compatibility)
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

        - Where does “compatibility” show up in `EXPLAIN` plans and system catalogs?
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

## 17. Foreign Data Wrappers (FDW)

<a id="17-foreign-data-wrapper-fdw"></a>

### Beginner

FDW access remote tables via `postgres_fdw`, `mysql_fdw`, file FDWs, etc.—pushdown and connection costs dominate performance. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

FDW access remote tables via `postgres_fdw`, `mysql_fdw`, file FDWs, etc.—pushdown and connection costs dominate performance. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

FDW access remote tables via `postgres_fdw`, `mysql_fdw`, file FDWs, etc.—pushdown and connection costs dominate performance. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
CREATE SERVER IF NOT EXISTS remote_pg FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'db2', dbname 'app');
```


```bash
psql -X -c "\des"
```
### Key Points

- Use materialized caches for heavy joins.
- Secure credentials with vault integration.

### Best Practices

- Set `use_remote_estimate` options thoughtfully.
- Watch idle connections.

### Common Mistakes

- Scanning remote giants without filters.

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
15. Create a disposable database for exercises related to “FDW”.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FDW)
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

        - Where does “FDW” show up in `EXPLAIN` plans and system catalogs?
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

## 18. Audit & Compliance (`pgaudit`)

<a id="18-audit-compliance-pgaudit"></a>

### Beginner

`pgaudit` augments logging for object/session auditing—configure classes carefully to balance verbosity vs compliance. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`pgaudit` augments logging for object/session auditing—configure classes carefully to balance verbosity vs compliance. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`pgaudit` augments logging for object/session auditing—configure classes carefully to balance verbosity vs compliance. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SHOW log_line_prefix;
SHOW pgaudit.log;
```


```bash
psql -X -c "SELECT * FROM pg_available_extensions WHERE name='pgaudit';"
```
### Key Points

- Coordinate with centralized log storage.
- Redact secrets in statements.

### Best Practices

- Test performance impact of full object logging.
- Map to regulatory controls.

### Common Mistakes

- Logging everything without retention policy.

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
14. Create a disposable database for exercises related to “pgaudit”.
15. Install required extensions in the lab before running advanced examples.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pgaudit)
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

        - Where does “pgaudit” show up in `EXPLAIN` plans and system catalogs?
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

## 19. Security Extensions (`pgcrypto`)

<a id="19-security-extensions-pgcrypto"></a>

### Beginner

`pgcrypto` supplies digest/hmac/symmetric/asymmetric crypto primitives in-database—prefer application-side crypto when possible. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`pgcrypto` supplies digest/hmac/symmetric/asymmetric crypto primitives in-database—prefer application-side crypto when possible. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`pgcrypto` supplies digest/hmac/symmetric/asymmetric crypto primitives in-database—prefer application-side crypto when possible. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT encode(digest('hello','sha256'),'hex');
SELECT pgp_sym_encrypt('secret','passphrase');
```


```bash
psql -X -c "SELECT extname FROM pg_available_extensions WHERE name='pgcrypto';"
```
### Key Points

- Key management is the hard part.
- Avoid storing long-term private keys in DB without HSM.

### Best Practices

- Use parameterized keys via vault.
- Understand FIPS requirements.

### Common Mistakes

- Rolling your own encryption modes.

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
13. Create a disposable database for exercises related to “pgcrypto”.
14. Install required extensions in the lab before running advanced examples.
15. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pgcrypto)
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

        - Where does “pgcrypto” show up in `EXPLAIN` plans and system catalogs?
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

## 20. Tree Extensions (`ltree`), Custom Development & External Search (Elasticsearch)

<a id="20-tree-custom-external-search"></a>

### Beginner

`ltree` models hierarchical paths with rich operators; custom C/SQL extensions ship via PGXN; Elasticsearch/OpenSearch complements Postgres for specialized search/analytics. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`ltree` models hierarchical paths with rich operators; custom C/SQL extensions ship via PGXN; Elasticsearch/OpenSearch complements Postgres for specialized search/analytics. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`ltree` models hierarchical paths with rich operators; custom C/SQL extensions ship via PGXN; Elasticsearch/OpenSearch complements Postgres for specialized search/analytics. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS ltree;
SELECT 'Top.Country.City'::ltree @> 'Top.Country'::ltree AS is_descendant;
```


```bash
# Dual-write pattern sketch: app -> Postgres (source of truth) -> outbox/CDC -> indexer
curl -s http://localhost:9200/_cat/indices?v | head
```
### Key Points

- ltree shines for materialized paths; adjacency lists differ.
- Custom extensions need CI across PG majors.

### Best Practices

- For ES, design idempotent indexing and reconciliation jobs.
- Document schema mapping.

### Common Mistakes

- Letting ltree paths diverge from FK-enforced hierarchies without governance.

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
12. Create a disposable database for exercises related to “ltree + custom + ES”.
13. Install required extensions in the lab before running advanced examples.
14. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
15. Practice safe `SET statement_timeout` when experimenting with heavy queries.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (ltree + custom + ES)
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

        - Where does “ltree + custom + ES” show up in `EXPLAIN` plans and system catalogs?
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

