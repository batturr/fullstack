# Basic SQL Commands

This module focuses on the commands you use every day: creating databases, connecting with `psql`, inspecting objects, running and timing queries, performing DDL/DML, documenting schema objects, scripting batches, moving data with `COPY`, interpreting errors, and keeping SQL readable.

## 📑 Table of Contents

- [1. Database Operations](#1-database-operations)
- [2. Connecting to Databases](#2-connecting-to-databases)
- [3. Help and Information Commands](#3-help-and-information-commands)
- [4. Basic Query Execution](#4-basic-query-execution)
- [5. Command-Line Tools (psql)](#5-command-line-tools-psql)
- [6. Basic DDL Commands](#6-basic-ddl-commands)
- [7. Basic DML Commands](#7-basic-dml-commands)
- [8. Comment and Documentation](#8-comment-and-documentation)
- [9. Batch Operations](#9-batch-operations)
- [10. Export and Import (COPY and CSV)](#10-export-and-import-copy-and-csv)
- [11. Error Handling Basics](#11-error-handling-basics)
- [12. Query Formatting and Style](#12-query-formatting-and-style)

---

## 1. Database Operations

### Beginner

A **database** is a named container of schemas and objects. Creating one isolates applications or environments (dev/test).

```sql
CREATE DATABASE appdb
  WITH
  OWNER = app_owner
  ENCODING 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  TEMPLATE = template0;
```

List databases from `psql` with `\l` or SQL:

```sql
SELECT datname FROM pg_database ORDER BY 1;
```

### Intermediate

`ALTER DATABASE` sets runtime session defaults for connections to that database:

```sql
ALTER DATABASE appdb SET timezone TO 'UTC';
ALTER DATABASE appdb SET jit TO off;
```

Inspect size:

```sql
SELECT pg_size_pretty(pg_database_size('appdb')) AS appdb_size;
```

Drop safely: ensure no sessions are connected, or use `WITH (FORCE)` on newer versions where supported for termination policies—always read docs for your exact version.

```sql
-- DANGER: destructive
DROP DATABASE IF EXISTS scratchdb;
```

### Expert

**Database cloning** (same cluster) historically used `CREATE DATABASE ... TEMPLATE otherdb`—requires no active connections to the template. For logical duplication across clusters, use `pg_dump`/`pg_restore`.

Connection limits and allowed roles can be managed at the database level in some workflows; most teams enforce with roles and `pg_hba.conf`.

```sql
CREATE DATABASE reportingdb TEMPLATE appdb OWNER report_owner;
```

### Key Points

- Encoding and locale choices are painful to change later—decide early.
- `DROP DATABASE` is irreversible without backups.

### Best Practices

- One database per application environment is a common pattern; avoid dozens of tiny databases without automation.

### Common Mistakes

- Creating databases with default `template1` while `template1` has been polluted with objects.

---

## 2. Connecting to Databases

### Beginner

`psql` connects with `-h -p -U -d`:

```bash
psql -h localhost -p 5432 -U app -d appdb
```

### Intermediate

`.pgpass` file format:

```
hostname:port:database:username:password
```

Use `*` wildcards carefully—prefer minimal scope.

Connection pooling (conceptual): clients connect to **PgBouncer**, which multiplexes to Postgres. Your app may see lower latency to open sessions but must avoid features incompatible with pooling modes.

Timeouts exist on server and client—set `statement_timeout` for safety in ad hoc environments:

```sql
SET statement_timeout = '5s';
SELECT pg_sleep(10); -- should cancel if enforced
```

### Expert

`application_name` helps correlate logs:

```sql
SET application_name = 'migration:2026-03-29';
SELECT current_setting('application_name');
```

SSL parameters are usually in the connection string (`sslmode`).

### Key Points

- Connection parameters are a stack: DNS, TLS, auth, role defaults.
- Pooling is not transparent—know session semantics.

### Best Practices

- Use non-superuser roles for applications.
- Rotate credentials and update `.pgpass` with automation.

### Common Mistakes

- Storing overly broad `.pgpass` entries with `*:*:*:*:password`.

---

## 3. Help and Information Commands

### Beginner

Inside `psql`:

- `\?` help for psql meta-commands
- `\h CREATE TABLE` SQL help

### Intermediate

Describe relations:

```sql
\d app.users        -- psql meta-command, not SQL
```

SQL equivalents via catalogs:

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
ORDER BY 1,2;

SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND a.attnum > 0 AND NOT a.attisdropped
ORDER BY c.relname, a.attnum;
```

### Expert

`pg_catalog` joins power introspection tools—ORMs and migration frameworks rely on these patterns.

```sql
SELECT rolname, rolsuper, rolcanlogin
FROM pg_roles
ORDER BY rolname;
```

### Key Points

- `information_schema` is portable; `pg_catalog` is Postgres-powerful.

### Best Practices

- Learn `\d+` for storage and description columns in psql.

### Common Mistakes

- Pasting `\d` into GUI tools that only accept SQL.

---

## 4. Basic Query Execution

### Beginner

SQL statements end with `;`. `psql` sends the buffer when it sees a terminator.

### Intermediate

Timing in `psql`:

```
\timing on
SELECT COUNT(*) FROM big_table;
```

Plans:

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM orders WHERE customer_id = 42;
```

### Expert

`EXPLAIN` without `ANALYZE` is the planner’s estimate; `ANALYZE` executes the query—be careful on mutating statements. Use transactions or replicas for risky introspection.

```sql
BEGIN;
EXPLAIN ANALYZE DELETE FROM staging WHERE imported_at < now() - interval '7 days';
ROLLBACK;
```

### Key Points

- Timing measures round trip + execution; interpret carefully on tiny queries.

### Best Practices

- Standardize on one `EXPLAIN` shape for team reviews.

### Common Mistakes

- Running `EXPLAIN ANALYZE` on production `DELETE` without a transaction rollback plan.

---

## 5. Command-Line Tools (psql)

### Beginner

Common flags:

```bash
psql -U app -d appdb -c "SELECT 1"
psql -f script.sql
```

### Intermediate

Output formats:

```
\x on            -- expanded display
\pset format csv
\pset footer off
```

### Expert

`psql` variables and `\gset`:

```sql
SELECT current_database() AS db \gset
\echo :db
```

### Key Points

- `psql` is a scripting environment, not only an interactive shell.

### Best Practices

- Use `-v ON_ERROR_STOP=1` in CI scripts.

### Common Mistakes

- Assuming default `NULL` display behavior matches CSV consumers—set formats explicitly.

---

## 6. Basic DDL Commands

### Beginner

DDL defines structure:

```sql
CREATE TABLE orders (
  id bigserial PRIMARY KEY,
  customer_id bigint NOT NULL,
  total numeric(12,2) NOT NULL
);

ALTER TABLE orders ADD COLUMN note text;

DROP TABLE IF EXISTS scratch;
```

### Intermediate

Rename columns safely:

```sql
ALTER TABLE orders RENAME COLUMN note TO customer_note;
```

### Expert

Concurrent index creation avoids long write locks (indexes covered deeply later):

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);
```

### Key Points

- DDL takes locks—plan maintenance windows for hot tables.

### Best Practices

- Wrap destructive DDL in migrations with review.

### Common Mistakes

- `ADD COLUMN` with volatile defaults on huge tables without considering rewrite behavior—check version notes.

---

## 7. Basic DML Commands

### Beginner

```sql
INSERT INTO orders (customer_id, total) VALUES (1, 19.99) RETURNING id;

UPDATE orders SET total = total + 5 WHERE id = 42;

DELETE FROM orders WHERE id = 42;
```

### Intermediate

Transactions:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = 1;
UPDATE accounts SET balance = balance + 10 WHERE id = 2;
COMMIT;
```

### Expert

`RETURNING` captures generated values and old/new states in updates/deletes—useful for auditing pipelines.

```sql
UPDATE orders SET total = total * 1.1 WHERE customer_id = 7 RETURNING id, total;
```

### Key Points

- DML errors roll back only what the current transaction includes.

### Best Practices

- Scope `DELETE`/`UPDATE` with keys, never unqualified on production shells.

### Common Mistakes

- Forgetting `WHERE`—`DELETE FROM orders;` is a resume-generating event.

---

## 8. Comment and Documentation

### Beginner

SQL comments:

```sql
-- line comment
/* block comment */
```

### Intermediate

Object comments:

```sql
COMMENT ON TABLE orders IS 'Customer purchase orders; monetary totals include tax when tax_included is true.';
COMMENT ON COLUMN orders.total IS 'Order total in USD.';
```

Extract:

```sql
SELECT obj_description('public.orders'::regclass);
```

### Expert

Documentation complements constraints—do not store business rules only in comments.

```sql
COMMENT ON SCHEMA app IS 'Application-owned objects; no manual DDL outside migrations.';
```

### Key Points

- Comments are metadata—use them for intent, not secret configuration.

### Best Practices

- Comment **why**, not what, when the SQL is self-explanatory.

### Common Mistakes

- Treating comments as a substitute for `CHECK` constraints.

---

## 9. Batch Operations

### Beginner

Run files:

```bash
psql -v ON_ERROR_STOP=1 -U app -d appdb -f batch.sql
```

### Intermediate

Transactional batches:

```sql
BEGIN;
-- many statements
COMMIT;
```

### Expert

`\if` constructs exist in newer psql—use for conditional migrations with care.

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app') THEN
    RAISE NOTICE 'role exists';
  END IF;
END $$;
```

### Key Points

- Idempotent scripts reduce rerun pain in CI.

### Best Practices

- Use `ON_ERROR_STOP` for automation.

### Common Mistakes

- Partial batches committing due to missing explicit transactions.

---

## 10. Export and Import (COPY and CSV)

### Beginner

Server-side `COPY` requires filesystem rights on the server or `PROGRAM` privileges—often restricted. Client-side `\copy` in `psql` streams through the client.

```sql
\copy orders TO '/tmp/orders.csv' CSV HEADER
\copy orders_staging FROM '/tmp/orders.csv' CSV HEADER
```

### Intermediate

SQL `COPY` (superuser or privileged roles):

```sql
COPY orders TO STDOUT WITH (FORMAT csv, HEADER true);
```

### Expert

NULL handling and quoting:

```sql
COPY orders TO STDOUT WITH (FORMAT csv, HEADER true, NULL '');

COPY orders FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');
-- paste rows, end with \. in psql
```

### Key Points

- `\copy` vs `COPY` is a security and performance boundary.

### Best Practices

- Fix locale/number formats before importing financial CSVs.

### Common Mistakes

- Importing with wrong `ENCODING` producing mojibake.

---

## 11. Error Handling Basics

### Beginner

Postgres errors include **SQLSTATE** codes—ORMs map them to exceptions.

```sql
-- Example: unique violation (23505)
CREATE TABLE t(id int PRIMARY KEY);
INSERT INTO t VALUES (1);
INSERT INTO t VALUES (1);
```

### Intermediate

`WARNING` and `NOTICE` surface in `psql`—do not ignore if they indicate data truncation or implicit casts.

### Expert

Use `EXCEPTION` blocks in PL/pgSQL functions for controlled handling (covered later)—in plain SQL scripts, rely on transaction boundaries.

```sql
BEGIN;
SAVEPOINT sp1;
-- statement that might fail
ROLLBACK TO SAVEPOINT sp1;
COMMIT;
```

### Key Points

- Understand a few common SQLSTATEs: `23505` unique, `23503` foreign key, `40001` serialization.

### Best Practices

- Log parameters (safely) in app layers when surfacing DB errors.

### Common Mistakes

- Retrying every error blindly—some errors are deterministic bugs.

---

## 12. Query Formatting and Style

### Beginner

Readable SQL uses consistent indentation and leading commas or trailing commas—pick one team style.

```sql
SELECT
  o.id,
  o.customer_id,
  o.total
FROM orders AS o
WHERE o.customer_id = 42
ORDER BY o.id DESC
LIMIT 50;
```

### Intermediate

Naming conventions:

- `snake_case` identifiers
- suffix `_id` for keys
- plural table names (common, not universal)

### Expert

Use **CTEs** to name sub-expressions—improves planner readability and reviewer comprehension.

```sql
WITH recent AS (
  SELECT * FROM orders WHERE created_at > now() - interval '7 days'
)
SELECT customer_id, COUNT(*) FROM recent GROUP BY 1;
```

### Key Points

- Consistency beats personal preference in shared repos.

### Best Practices

- Add `sqlfluff` or `pgFormatter` in CI for autoformatting.

### Common Mistakes

- `SELECT *` in production views without documenting dependency expectations.

---

## Appendix A — Database Operations Drill

### Beginner

Practice create/list/size/drop on scratch names only.

### Intermediate

Try `ALTER DATABASE ... SET` and reconnect to see defaults apply.

### Expert

Script database creation with locale choices identical to production to catch collation issues early.

```sql
CREATE DATABASE scratch_template TEMPLATE template0;
CREATE DATABASE scratchdb TEMPLATE scratch_template;
DROP DATABASE scratchdb;
DROP DATABASE scratch_template;
```

### Key Points

- Templates are powerful and footgun-prone.

### Best Practices

- Keep `template1` pristine.

### Common Mistakes

- Creating new DBs from a polluted template.

---

## Appendix B — psql Productivity Shortcuts

### Beginner

- `\e` edit query in editor
- `\s` show history

### Intermediate

- `\watch` repeatedly execute a query (use cautiously)

### Expert

- `\set ECHO_HIDDEN` for debugging meta-commands

```sql
SELECT 1 AS ok \watch 2
```

### Key Points

- `psql` rewards muscle memory investment.

### Best Practices

- Create `~/.psqlrc` for `\timing on` and safe prompts.

### Common Mistakes

- Leaving `\watch` running against expensive queries.

---

## Appendix C — Catalog Queries for Permissions

### Beginner

List tables you can see:

```sql
SELECT table_schema, table_name
FROM information_schema.table_privileges
WHERE grantee = current_user
GROUP BY 1,2
ORDER BY 1,2;
```

### Intermediate

```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'orders';
```

### Expert

Deep dives use `has_table_privilege`, `aclitem` parsing—usually wrapped by admin tools.

```sql
SELECT has_table_privilege(current_user, 'public.orders', 'SELECT') AS can_select;
```

### Key Points

- Permission debugging is faster with SQL than guesswork.

### Best Practices

- Prefer schema-qualified names in privilege checks.

### Common Mistakes

- Granting on table but forgetting `USAGE` on schema.

---

## Appendix D — EXPLAIN Mini Workbook

### Beginner

Read top node type: `Seq Scan` vs `Index Scan`.

### Intermediate

Compare `rows` estimates vs actual when using `ANALYZE`.

### Expert

`BUFFERS` reveals cache hits—essential for IO debugging.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42;
```

### Key Points

- Plans tell stories about statistics and indexes.

### Best Practices

- Capture plans before/after index changes.

### Common Mistakes

- Optimizing based on cold-cache timings alone.

---

## Appendix E — COPY Performance Notes

### Beginner

Bulk load prefers `COPY` over huge multi-row `INSERT`.

### Intermediate

Drop indexes/constraints only with a written plan—often unnecessary with `COPY` into staging then `INSERT ... SELECT`.

### Expert

Use `TEMP` staging tables for transformations:

```sql
CREATE TEMP TABLE stg (LIKE orders INCLUDING DEFAULTS);
\copy stg FROM 'orders.csv' CSV HEADER
INSERT INTO orders SELECT * FROM stg ON CONFLICT DO NOTHING;
```

### Key Points

- Staging tables decouple ingest from integrity checks.

### Best Practices

- Validate row counts and checksums post-load.

### Common Mistakes

- Loading into prod tables directly without quarantine.

---

## Appendix F — Safe Update/Delete Patterns

### Beginner

Always preview with `SELECT` first.

### Intermediate

Use `RETURNING` to capture affected keys.

### Expert

For large deletes, batch by key ranges to reduce lock duration:

```sql
DELETE FROM logs
WHERE id IN (
  SELECT id FROM logs WHERE created_at < now() - interval '90 days' LIMIT 10000
);
-- repeat until 0 rows
```

### Key Points

- Chunking reduces long transactions and bloat risk.

### Best Practices

- Automate batching with monitoring on rowcounts per iteration.

### Common Mistakes

- One giant delete locking the table for minutes.

---

## Appendix G — SQLSTATE Cheat Sheet (Starter List)

### Beginner

Memorize: `23505` unique violation, `23503` FK violation.

### Intermediate

Add: `23502` not null violation, `22P02` invalid text representation.

### Expert

Serialization: `40001`, deadlock: `40P01`—often retryable with backoff.

```sql
SELECT errcode, message FROM (
  VALUES
    ('23505','unique_violation'),
    ('23503','foreign_key_violation')
) v(errcode, message);
```

### Key Points

- Map SQLSTATE to application error taxonomy.

### Best Practices

- Unit test ORM mapping for common constraints.

### Common Mistakes

- Showing raw SQL errors to end users.

---

## Appendix H — Transaction Playground

### Beginner

```sql
BEGIN;
INSERT INTO t VALUES (2);
ROLLBACK;
```

### Intermediate

Savepoints for partial rollback.

### Expert

Isolation level experiments (later module ties in deeply).

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT 1;
COMMIT;
```

### Key Points

- Transactions are the atomic boundary for mixed DDL/DML scripts.

### Best Practices

- Use `BEGIN` at start of migration files when appropriate.

### Common Mistakes

- DDL autocommit surprises—some statements commit implicit transactions.

---

## Appendix I — Naming & Aliasing Conventions

### Beginner

Alias tables for clarity:

```sql
SELECT c.name, o.id
FROM customers c
JOIN orders o ON o.customer_id = c.id;
```

### Intermediate

Avoid reserved keywords as identifiers; quote only when necessary.

### Expert

Stable names for views exposed to analytics (`mv_*`, `v_*` prefixes).

### Key Points

- Predictable names reduce join bugs in large teams.

### Best Practices

- Document exceptions to naming guides.

### Common Mistakes

- Using ambiguous aliases (`a`, `b`) in wide joins.

---

## Appendix J — Multi-Statement Scripts in CI

### Beginner

One file, many statements, `ON_ERROR_STOP`.

### Intermediate

Emit notices for progress:

```sql
DO $$ BEGIN RAISE NOTICE 'step 1'; END $$;
```

### Expert

Use session variables to parameterize:

```sql
\set batch_size 10000
-- interpolate carefully; prefer SQL functions for complex logic
```

### Key Points

- CI should fail fast on first SQL error.

### Best Practices

- Log `application_name` to identify migration job sessions.

### Common Mistakes

- Silent failures when `ON_ERROR_STOP` omitted.

---

## Appendix K — Information Schema vs pg_catalog Decision Tree

### Beginner

Use `information_schema` when writing portable introspection.

### Intermediate

Use `pg_catalog` when you need Postgres-specific details (tablespaces, reloptions).

### Expert

Combine both in tooling that targets multiple engines with a Postgres fast path.

```sql
SELECT c.oid
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'orders';
```

### Key Points

- Pick the catalog based on portability requirements.

### Best Practices

- Cache introspection results in codegen tools—do not query catalogs per row.

### Common Mistakes

- Joining catalogs incorrectly and missing `relkind` filters.

---

## Appendix L — CSV Import Validation SQL

### Beginner

After `\copy`, compare counts:

```sql
SELECT COUNT(*) FROM staging_import;
```

### Intermediate

Check for duplicates before merge:

```sql
SELECT key, COUNT(*) FROM staging_import GROUP BY key HAVING COUNT(*) > 1;
```

### Expert

Foreign key quarantine pattern:

```sql
SELECT s.customer_id
FROM staging_orders s
LEFT JOIN customers c ON c.id = s.customer_id
WHERE c.id IS NULL
LIMIT 50;
```

### Key Points

- Treat imports as untrusted until validated.

### Best Practices

- Keep raw files immutable in object storage for audit.

### Common Mistakes

- Merging before addressing NULL primary keys.

---

## Appendix M — `psql` Output for Reporting

### Beginner

Align output for humans:

```
\pset linestyle unicode
\pset border 2
```

### Intermediate

Generate HTML or LaTeX for quick reports (tools vary by version/features—verify locally).

### Expert

Prefer `COPY ... CSV` for machine consumers, not human pretty printing.

```sql
\copy (SELECT date_trunc('day', created_at) d, COUNT(*) FROM orders GROUP BY 1 ORDER BY 1) TO 'daily.csv' CSV HEADER
```

### Key Points

- Match output format to the consumer.

### Best Practices

- For large extracts, stream—do not paste million-row results.

### Common Mistakes

- Using tabs in data that will later become TSV without escaping discipline.

---

## Appendix N — Common DDL Snippets for Scratch Schema

### Beginner

```sql
CREATE SCHEMA scratch;
SET search_path TO scratch, public;
CREATE TABLE demo (id serial PRIMARY KEY, v int NOT NULL);
```

### Intermediate

```sql
ALTER TABLE demo ADD CONSTRAINT demo_v_nonneg CHECK (v >= 0);
```

### Expert

```sql
DROP SCHEMA scratch CASCADE;
```

### Key Points

- `CASCADE` drops dependent objects—double-check schema name.

### Best Practices

- Name scratch schemas per developer or ticket.

### Common Mistakes

- Running `CASCADE` on `public` by typo.

---

## Appendix O — ORM-Adjacent SQL You Should Still Know

### Beginner

Migrations generate DDL—know what `ADD COLUMN` implies.

### Intermediate

Use SQL to verify what ORM created:

```sql
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'orders';
```

### Expert

Detect drift between migration history and live DB with schema diff tools.

### Key Points

- ORMs are force multipliers, not replacements for fundamentals.

### Best Practices

- Review generated SQL in PRs for lock risks.

### Common Mistakes

- Blindly accepting destructive auto-migrations.

---

## Appendix P — Timing Interpretation Lab

### Beginner

Run the same query twice—second may be faster due to cache.

### Intermediate

Use `EXPLAIN (ANALYZE)` to separate planning vs execution.

### Expert

Correlate with `pg_stat_statements` mean time once enabled.

```sql
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 5;
```

### Key Points

- Hot caches distort micro-benchmarks.

### Best Practices

- Establish a standard “cold-ish” test procedure for regressions.

### Common Mistakes

- Concluding index uselessness from one cached run.

---

**Next module:** `04. Data Types` for precise column typing and casting rules.

Revisit this file whenever you change roles or tools: the `psql` meta-commands and catalog queries stay relevant even as GUIs evolve.
