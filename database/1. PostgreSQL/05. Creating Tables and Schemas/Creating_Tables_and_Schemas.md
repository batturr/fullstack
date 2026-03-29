# Creating Tables and Schemas

Schemas organize objects; tables store your rows. This module connects naming, constraints, relationships, lifecycle operations (alter/drop/truncate), statistics, inheritance, partitioning, unlogged tables, and storage options—each with beginner, intermediate, and expert lenses plus SQL you can run in a scratch database.

## 📑 Table of Contents

- [1. Schema Concepts](#1-schema-concepts)
- [2. Table Creation Basics](#2-table-creation-basics)
- [3. Table Structure Design](#3-table-structure-design)
- [4. Constraints (Overview in Table Creation)](#4-constraints-overview-in-table-creation)
- [5. Primary Keys](#5-primary-keys)
- [6. Foreign Keys](#6-foreign-keys)
- [7. Table Relationships](#7-table-relationships)
- [8. Altering Tables](#8-altering-tables)
- [9. Dropping and Truncating](#9-dropping-and-truncating)
- [10. Table Statistics](#10-table-statistics)
- [11. Table Inheritance (Advanced)](#11-table-inheritance-advanced)
- [12. Partitioning (Range, List, Hash)](#12-partitioning-range-list-hash)
- [13. Unlogged Tables](#13-unlogged-tables)
- [14. Table Options and Settings](#14-table-options-and-settings)

---

## 1. Schema Concepts

### Beginner

A **schema** is a namespace inside a database. The default `public` schema holds many tutorial objects. Qualify names as `schema.table`.

```sql
CREATE SCHEMA app AUTHORIZATION current_user;
CREATE TABLE app.users (id bigserial PRIMARY KEY, email text NOT NULL);
SELECT * FROM app.users;
```

### Intermediate

**search_path** controls implicit schema resolution:

```sql
SHOW search_path;
SET search_path TO app, public;
```

Permissions: grant `USAGE` on schema, then table privileges.

```sql
GRANT USAGE ON SCHEMA app TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_rw;
```

### Expert

Schema boundaries often map to **service boundaries** in modular monoliths—coordinate migrations to avoid cyclic dependencies. `pg_namespace` catalogs schemas.

```sql
SELECT nspname FROM pg_namespace ORDER BY 1;
```

### Key Points

- Schema is not the same as database—no cross-database joins.
- Always qualify names in application SQL for stability.

### Best Practices

- One schema per bounded context is a workable pattern when paired with disciplined migrations.

### Common Mistakes

- Creating duplicate object names across schemas then relying on ambiguous `search_path`.

---

## 2. Table Creation Basics

### Beginner

```sql
CREATE TABLE app.orders (
  id          bigserial PRIMARY KEY,
  user_id     bigint NOT NULL,
  total_cents bigint NOT NULL CHECK (total_cents >= 0),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

### Intermediate

**Temporary** tables:

```sql
CREATE TEMP TABLE tmp_import (LIKE app.orders INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
```

### Expert

`IF NOT EXISTS` avoids errors in idempotent scripts:

```sql
CREATE TABLE IF NOT EXISTS app.audit_log (
  id bigserial PRIMARY KEY,
  event text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now()
);
```

### Key Points

- Table creation is easy; evolving tables safely is the hard part.

### Best Practices

- Co-locate `NOT NULL` with defaults when the domain requires presence.

### Common Mistakes

- Omitting `NOT NULL` on columns that every query assumes present.

---

## 3. Table Structure Design

### Beginner

Choose types deliberately (`bigint` ids, `timestamptz` times, `numeric` money).

Column order is mostly cosmetic but can affect human readability and some physical layout expectations—do not micro-optimize prematurely.

### Intermediate

**fillfactor** leaves space for HOT updates:

```sql
CREATE TABLE app.hot_counters (
  id int PRIMARY KEY,
  v bigint NOT NULL
) WITH (fillfactor=90);
```

### Expert

Very wide rows may push large values to TOAST—profile with `pg_column_size`. Partitioning and archiving reduce bloat pressure on monolithic tables.

### Key Points

- Design for **query patterns**, not only entity diagrams.

### Best Practices

- Document natural vs surrogate key choices in the schema comment.

### Common Mistakes

- Adding many nullable columns “just in case,” creating sparse, confusing schemas.

---

## 4. Constraints (Overview in Table Creation)

### Beginner

Inline constraints:

```sql
CREATE TABLE app.items (
  sku text PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price > 0)
);
```

### Intermediate

Named constraints ease migrations:

```sql
CREATE TABLE app.items2 (
  sku text,
  name text NOT NULL,
  CONSTRAINT items2_pkey PRIMARY KEY (sku),
  CONSTRAINT items2_price_pos CHECK (price > 0),
  price numeric(10,2) NOT NULL
);
```

### Expert

Deferrable constraints appear in the constraints module—declare when transactions must temporarily violate rules.

### Key Points

- Constraints are executable documentation—prefer them over app-only checks for invariants.

### Best Practices

- Name constraints when referencing them in ON CONFLICT or error handling.

### Common Mistakes

- Unnamed constraints that differ across environments, breaking diff tools.

---

## 5. Primary Keys

### Beginner

Primary key implies unique + not null; creates a btree index automatically.

```sql
CREATE TABLE app.customers (
  id bigserial PRIMARY KEY,
  email text NOT NULL UNIQUE
);
```

### Intermediate

Composite keys:

```sql
CREATE TABLE app.order_lines (
  order_id bigint NOT NULL,
  line_no smallint NOT NULL,
  qty int NOT NULL,
  PRIMARY KEY (order_id, line_no)
);
```

### Expert

Surrogate keys simplify ORM mapping; natural keys (e.g., ISO codes) suit reference tables. Avoid wide primary keys as referenced foreign keys many times—index bloat propagates.

### Key Points

- Every table should usually have a primary key unless you have a rare, deliberate exception.

### Best Practices

- Prefer `bigint` or `uuid` surrogates for high-churn fact tables.

### Common Mistakes

- Using `serial` without owning sequence linkage properly when renaming tables.

---

## 6. Foreign Keys

### Beginner

Foreign keys enforce **referential integrity**.

```sql
CREATE TABLE app.orders (
  id bigserial PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES app.customers (id)
);
```

### Intermediate

Actions:

```sql
CREATE TABLE app.order_notes (
  order_id bigint PRIMARY KEY REFERENCES app.orders (id) ON DELETE CASCADE,
  note text NOT NULL
);
```

### Expert

Indexing the referencing column is critical for join performance and efficient cascades.

```sql
CREATE INDEX orders_customer_id_idx ON app.orders (customer_id);
```

### Key Points

- `ON DELETE RESTRICT` is common for financial records; `CASCADE` for owned child rows.

### Best Practices

- Decide delete semantics with product/legal counsel—cannot be pure tech default.

### Common Mistakes

- Missing indexes on FK columns—joins scan whole child tables.

---

## 7. Table Relationships

### Beginner

- **1:N** — customers to orders (`orders.customer_id`)
- **1:1** — share primary key or unique FK
- **M:N** — junction table with two FKs

```sql
CREATE TABLE app.tags (id smallserial PRIMARY KEY, name text UNIQUE);
CREATE TABLE app.item_tags (
  item_sku text REFERENCES app.items (sku) ON DELETE CASCADE,
  tag_id int REFERENCES app.tags (id) ON DELETE CASCADE,
  PRIMARY KEY (item_sku, tag_id)
);
```

### Intermediate

**Self-references** model trees:

```sql
CREATE TABLE app.org_unit (
  id bigserial PRIMARY KEY,
  parent_id bigint REFERENCES app.org_unit (id),
  name text NOT NULL
);
```

### Expert

**Polymorphic** associations (comment/discussion targets) sacrifice FK enforcement unless modeled with separate link tables per type or supertype tables.

### Key Points

- If you skip FKs for polymorphism, enforce integrity in a disciplined service layer.

### Best Practices

- Junction tables include their own surrogate key only when needed—composite PK is fine.

### Common Mistakes

- Encoding many-to-many as comma-separated lists instead of a junction table.

---

## 8. Altering Tables

### Beginner

```sql
ALTER TABLE app.orders ADD COLUMN currency char(3) NOT NULL DEFAULT 'USD';
ALTER TABLE app.orders DROP COLUMN currency;
```

### Intermediate

Type changes may need `USING`:

```sql
ALTER TABLE app.orders ALTER COLUMN total_cents TYPE numeric(14,2)
  USING (total_cents::numeric / 100);
```

### Expert

Some operations rewrite tables—check lock duration and disk space. Use `CONCURRENTLY` for indexes, not for all DDL.

```sql
ALTER TABLE app.orders RENAME TO purchases;
```

### Key Points

- DDL on hot tables is a scheduling concern—communicate with SRE/DBA.

### Best Practices

- Multi-step migrations: add column → backfill → constraints → cutover.

### Common Mistakes

- Dropping columns still referenced by views—use `DROP ... CASCADE` only intentionally.

---

## 9. Dropping and Truncating

### Beginner

`DROP TABLE` removes structure + data. `TRUNCATE` removes rows quickly, preserving structure.

```sql
TRUNCATE app.tmp_import;
DROP TABLE IF EXISTS app.tmp_import;
```

### Intermediate

`TRUNCATE ... RESTART IDENTITY` resets serials—dangerous if assumptions leak across environments.

```sql
TRUNCATE app.tmp_import RESTART IDENTITY;
```

### Expert

`TRUNCATE` cannot target tables with FK references unless `CASCADE`—understand cascade graphs.

```sql
TRUNCATE parent, child; -- or CASCADE where appropriate
```

### Key Points

- `DELETE` logs row-level changes; `TRUNCATE` is bulk and has different locking semantics.

### Best Practices

- Prefer `TRUNCATE` for staging tables; prefer `DELETE` when triggers/row-level policies must fire per row (depends on config).

### Common Mistakes

- `TRUNCATE ... CASCADE` nuking unexpected dependent tables.

---

## 10. Table Statistics

### Beginner

The query planner uses **statistics** to estimate row counts and selectivity.

```sql
ANALYZE app.orders;
```

### Intermediate

Check last analyze:

```sql
SELECT relname, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY relname;
```

### Expert

Increase targets on skewed columns:

```sql
ALTER TABLE app.orders ALTER COLUMN customer_id SET STATISTICS 1000;
ANALYZE app.orders;
```

### Key Points

- Bad stats cause bad plans—monitor autoanalyze health.

### Best Practices

- After bulk loads, run `ANALYZE` on affected tables.

### Common Mistakes

- Disabling autovacuum/autanalyze globally to “save CPU.”

---

## 11. Table Inheritance (Advanced)

### Beginner

Child tables inherit columns from parents—queries can target parent to scan all children.

```sql
CREATE TABLE app.vehicle (id serial PRIMARY KEY, make text NOT NULL);
CREATE TABLE app.car (doors int NOT NULL) INHERITS (app.vehicle);
CREATE TABLE app.truck (tonnage numeric NOT NULL) INHERITS (app.vehicle);
INSERT INTO app.car (make, doors) VALUES ('Toyota', 4);
SELECT * FROM ONLY app.vehicle;
```

### Intermediate

**ONLY** restricts scans to just that table, excluding children.

### Expert

Declarative **partitioning** replaced many inheritance partitioning patterns—prefer it unless you have legacy reasons.

### Key Points

- Unique constraints do not automatically unify across inheritance children the way beginners expect—verify docs for your use case.

### Best Practices

- Avoid inheritance for new designs unless you understand constraint/index behavior deeply.

### Common Mistakes

- Expecting foreign keys to parent to “just work” across all child rows without careful modeling.

---

## 12. Partitioning (Range, List, Hash)

### Beginner

Partitioned table + child partitions:

```sql
CREATE TABLE app.events (
  id bigserial,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE app.events_2026_q1 PARTITION OF app.events
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
```

### Intermediate

List partitioning for discrete regions:

```sql
CREATE TABLE app.sales (
  id bigserial PRIMARY KEY,
  region text NOT NULL,
  amount numeric NOT NULL
) PARTITION BY LIST (region);

CREATE TABLE app.sales_us PARTITION OF app.sales FOR VALUES IN ('US');
CREATE TABLE app.sales_eu PARTITION OF app.sales FOR VALUES IN ('DE','FR');
```

### Expert

Hash partitioning spreads rows when no natural range key exists:

```sql
CREATE TABLE app.shards (
  id bigint NOT NULL,
  data text,
  PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE app.shards_p0 PARTITION OF app.shards FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE app.shards_p1 PARTITION OF app.shards FOR VALUES WITH (MODULUS 4, REMAINDER 1);
```

### Key Points

- Partition pruning requires predicates to match partition keys.

### Best Practices

- Automate partition creation/retention (pg_partman or equivalent).

### Common Mistakes

- Missing default partition (where applicable) causing insert failures.

---

## 13. Unlogged Tables

### Beginner

Unlogged tables skip WAL for writes—faster, but data is not durable across crashes.

```sql
CREATE UNLOGGED TABLE app.staging (
  id bigserial PRIMARY KEY,
  raw text
);
```

### Intermediate

Use for scratch/intermediate pipelines—not for business-critical facts.

### Expert

Replication behavior: unlogged tables are not replicated like logged tables—verify standby access patterns.

### Key Points

- Speed vs durability trade-off is explicit.

### Best Practices

- Name staging tables clearly; schedule truncates.

### Common Mistakes

- Storing payment state in unlogged tables.

---

## 14. Table Options and Settings

### Beginner

**TABLESPACE** placement:

```sql
CREATE TABLE app.big_fact (...) TABLESPACE pg_default;
```

### Intermediate

**autovacuum** per-table tuning:

```sql
ALTER TABLE app.big_fact SET (autovacuum_vacuum_scale_factor = 0.02);
```

### Expert

**Access method** defaults to heap—advanced storage engines appear rarely in typical apps.

```sql
SELECT relname, reloptions
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'app' AND c.relkind = 'r';
```

### Key Points

- Per-table settings should be exceptions with documented reasons.

### Best Practices

- Capture reloptions in infra docs when changed.

### Common Mistakes

- Tuning autovacuum aggressively without measuring bloat and wraparound risk.

---

## Appendix A — Schema Permission Recipe

### Beginner

```sql
CREATE SCHEMA app;
CREATE ROLE app_ro NOLOGIN;
GRANT USAGE ON SCHEMA app TO app_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO app_ro;
```

### Intermediate

```sql
CREATE ROLE app_migrator WITH LOGIN PASSWORD '...';
GRANT ALL ON SCHEMA app TO app_migrator;
```

### Expert

Separate migration role from runtime role—critical for least privilege.

### Key Points

- Default privileges apply only to future objects—retrofit grants when needed.

### Best Practices

- Add CI check that runtime role cannot `DROP SCHEMA`.

### Common Mistakes

- Granting `ALL` to application users.

---

## Appendix B — Table Design Checklist

### Beginner

Primary key? Needed `NOT NULL`? Types sane?

### Intermediate

FK indexes? `ON DELETE` semantics documented?

### Expert

Partitioning key matches queries? Retention strategy? Statistics targets?

```sql
SELECT conname, contype FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname='app' AND t.relname='orders';
```

### Key Points

- Checklists prevent repeating the same production incident.

### Best Practices

- Attach checklist to PR template for schema changes.

### Common Mistakes

- Reviewing ER diagrams without reviewing migration SQL.

---

## Appendix C — Safe Column Addition Pattern

### Beginner

```sql
ALTER TABLE app.orders ADD COLUMN notes text;
```

### Intermediate

```sql
ALTER TABLE app.orders ADD COLUMN priority smallint NOT NULL DEFAULT 0;
```

### Expert

For huge tables, consider adding nullable column, backfilling in batches, then enforcing `NOT NULL` with a check constraint first—details depend on version and downtime budget.

### Key Points

- Large table DDL is a product decision, not only a SQL task.

### Best Practices

- Measure row count and table size before promising “instant” migrations.

### Common Mistakes

- Adding volatile `DEFAULT` expressions that evaluate per row painfully on old versions—read release notes.

---

## Appendix D — Truncate vs Delete Decision Matrix

### Beginner

Staging reset → `TRUNCATE`.

### Intermediate

Need row-level triggers → consider `DELETE` or special trigger setup.

### Expert

FK graphs may force ordering or `CASCADE`.

```sql
-- sketch only
BEGIN;
DELETE FROM app.child;
DELETE FROM app.parent;
COMMIT;
```

### Key Points

- Understand locks generated in production traffic.

### Best Practices

- Test on a snapshot database with realistic concurrency.

### Common Mistakes

- Using `DELETE` without `WHERE` thinking it is “safer”—it locks and logs heavily.

---

## Appendix E — Partition Maintenance SQL Sketches

### Beginner

Create next month partition ahead of time.

### Intermediate

Detach/drop old partitions for retention.

### Expert

Exchange partition for bulk load validation.

```sql
-- Conceptual: verify exact syntax for your version/workflow
-- ALTER TABLE app.events ATTACH PARTITION app.events_2026_q2 FOR VALUES FROM (...) TO (...);
```

### Key Points

- Partition ops should be scripted, not manual calendar reminders.

### Best Practices

- Monitor for **insert into non-existent partition** errors.

### Common Mistakes

- Forgetting primary key must include partition key.

---

## Appendix F — Table Inheritance vs Partitioning

### Beginner

Partitioning is first-class for pruning; inheritance is legacy/advanced.

### Intermediate

Inheritance can still appear in older codebases—learn `ONLY` and constraint behavior.

### Expert

Choose declarative partitioning for new range/list/hash designs.

### Key Points

- Migration from inheritance to declarative partitioning is a project.

### Best Practices

- Inventory inheritance usage before major upgrades.

### Common Mistakes

- Mixing inheritance with foreign keys without validation tests.

---

## Appendix G — Fillfactor Guidance

### Beginner

Default fillfactor 100—tight packing.

### Intermediate

Lower fillfactor can reduce index churn for update-heavy narrow rows.

### Expert

Measure HOT update rates before tuning—incorrect fillfactor wastes space.

```sql
CREATE TABLE app.demo_ff (id int PRIMARY KEY, v int) WITH (fillfactor=90);
```

### Key Points

- Space vs update amplification trade-off.

### Best Practices

- Validate with `pg_stat_all_tables` n_tup_hot_upd metrics over time.

### Common Mistakes

- Setting fillfactor low everywhere “just in case.”

---

## Appendix H — OID Column Legacy

### Beginner

`WITH OIDS` is largely historical—avoid for new tables.

### Intermediate

Modern designs use explicit keys.

### Expert

If you encounter OIDs in legacy DBs, plan explicit PK migration.

### Key Points

- OIDs are not suitable as stable application identifiers.

### Best Practices

- Document legacy tables explicitly in runbooks.

### Common Mistakes

- Assuming OID presence implies primary key correctness.

---

## Appendix I — Temporary vs Unlogged

### Beginner

Temp tables die at session end; unlogged persist until dropped but are not crash-safe.

### Intermediate

Temp tables are session-scoped; unlogged are cluster-local shared objects.

### Expert

Security: temp tables still obey permissions—do not store secrets carelessly.

### Key Points

- Pick based on lifetime and durability needs.

### Best Practices

- Use temp for ETL transforms per session; unlogged for shared staging (carefully).

### Common Mistakes

- Expecting temp data to survive connection pool reuse without namespacing.

---

## Appendix J — Commenting Large Models

### Beginner

```sql
COMMENT ON SCHEMA app IS 'Core commerce bounded context.';
```

### Intermediate

```sql
COMMENT ON TABLE app.orders IS 'Orders are immutable financial events; use adjustments table for refunds.';
```

### Expert

Link comments to architecture decision records (ADR IDs) in your wiki.

### Key Points

- Comments augment constraints—they do not enforce them.

### Best Practices

- Review comments during schema reviews like code comments.

### Common Mistakes

- Stale comments worse than none—update with migrations.

---

## Appendix K — Table Size Inspection

### Beginner

```sql
SELECT pg_size_pretty(pg_total_relation_size('app.orders')) AS total;
```

### Intermediate

```sql
SELECT pg_size_pretty(pg_relation_size('app.orders')) AS heap_only;
```

### Expert

```sql
SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) AS idx_sz
FROM pg_stat_user_indexes
WHERE relname = 'orders';
```

### Key Points

- Size drives vacuum, backup, and disk planning.

### Best Practices

- Track top 10 tables by total size weekly.

### Common Mistakes

- Ignoring index size in capacity planning.

---

## Appendix L — Primary Key as Partition Key Reminder

### Beginner

For partitioned tables, PK/unique constraints must include partition key.

### Intermediate

Design IDs accordingly—composite keys are common.

### Expert

UUID PK without partition key cannot be sole PK across partitions—add `created_at` etc.

### Key Points

- This constraint surprises teams migrating from non-partitioned tables.

### Best Practices

- Model time-based IDs or composite keys early.

### Common Mistakes

- Creating unique constraints on `id` alone across time partitions.

---

## Appendix M — Foreign Key Cascade Graph Auditing

### Beginner

Draw FK graph on paper for small schemas.

### Intermediate

Query catalogs:

```sql
SELECT
  c.conname,
  tf.relname AS from_table,
  cf.relname AS to_table,
  pg_get_constraintdef(c.oid) AS def
FROM pg_constraint c
JOIN pg_class tf ON tf.oid = c.conrelid
JOIN pg_class cf ON cf.oid = c.confrelid
WHERE c.contype = 'f'
ORDER BY 1;
```

### Expert

Automate graph exports for incident response—know what `ON DELETE CASCADE` will hit.

### Key Points

- Cascades are multi-table transactions—can be slow and locky.

### Best Practices

- Prefer explicit application deletes for sensitive subgraphs.

### Common Mistakes

- Accidental `CASCADE` on org chart tables.

---

## Appendix N — Table Template with Standard Audit Columns

### Beginner

```sql
CREATE TABLE app.example (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  updated_by text
);
```

### Intermediate

Use triggers to maintain `updated_at` (covered in later modules).

### Expert

Consider database vs application ownership of audit columns—compliance may mandate DB triggers.

### Key Points

- Standard templates reduce review friction.

### Best Practices

- Keep templates in one migration snippet file.

### Common Mistakes

- Inconsistent timestamp types (`timestamp` vs `timestamptz`) across tables.

---

## Appendix O — Search Path Hardening

### Beginner

```sql
ALTER DATABASE current_database() SET search_path TO app, public;
```

### Intermediate

Remove `public` create privileges for untrusted users.

### Expert

Use `search_path` pinning in security definer functions (later module).

### Key Points

- `search_path` attacks are real—do not ignore in SECURITY DEFINER contexts.

### Best Practices

- Set explicit schema in all app queries regardless.

### Common Mistakes

- Relying on `public` as dumping ground in multi-tenant systems.

---

## Appendix P — Declarative Partitioning: Default Partition

### Beginner

A **default partition** catches rows that do not map to any explicit partition—useful to prevent hard failures during data drift.

### Intermediate

Monitor default partition growth—if it grows, your partition map is incomplete or upstream data is dirty.

### Expert

Operational alert when inserts hit default partition—often a paging event.

```sql
-- Illustrative only: adapt names and bounds to your model
-- CREATE TABLE app.events_default PARTITION OF app.events DEFAULT;
```

### Key Points

- Default partitions are safety nets, not primary storage targets.

### Best Practices

- Regularly reconcile default partition rows into proper children.

### Common Mistakes

- Letting default partition become the largest partition silently.

---

## Appendix Q — Hash Partitioning: MODULUS/REMAINDER Arithmetic

### Beginner

`MODULUS` is the number of partitions; `REMAINDER` picks the bucket for each partition.

### Intermediate

All remainders from `0` to `MODULUS-1` must be covered exactly once.

### Expert

Rebalancing hash partitions requires logical migration—plan for downtime or dual-write strategies.

```sql
-- Sanity check idea: count rows per partition in a lab
SELECT tableoid::regclass AS partition, COUNT(*) FROM app.shards GROUP BY 1 ORDER BY 1;
```

### Key Points

- Hash partitioning helps uniform spread when range/list keys do not exist.

### Best Practices

- Choose a stable high-cardinality key for hashing (often surrogate `bigint`).

### Common Mistakes

- Hashing on low-cardinality columns (e.g., boolean), creating skew.

---

## Appendix R — Table Rewrite Indicators (Conceptual)

### Beginner

Some `ALTER TABLE` operations rewrite the whole heap—expect locks and IO.

### Intermediate

Consult PostgreSQL docs per version for rewrite vs metadata-only changes.

### Expert

Use `pg_stat_progress_*` views on supported operations to monitor long DDL.

### Key Points

- “Online” is not automatic—verify per statement.

### Best Practices

- Run risky DDL during maintenance windows first time.

### Common Mistakes

- Running type changes on multi-terabyte tables during peak traffic.

---

## Appendix S — `INCLUDING` Clauses for `LIKE` Tables

### Beginner

```sql
CREATE TABLE app.orders_archive (LIKE app.orders INCLUDING INDEXES INCLUDING CONSTRAINTS);
```

### Intermediate

Choose includes deliberately—constraints may not make sense on archives.

### Expert

`INCLUDING GENERATED` copies generated columns when appropriate—verify behavior on your version.

### Key Points

- `LIKE` accelerates staging/archive table creation.

### Best Practices

- Strip foreign keys on archives if they reference hot tables.

### Common Mistakes

- Copying FK constraints into temp staging and failing inserts.

---

## Appendix T — Table Rename and View Dependencies

### Beginner

```sql
ALTER TABLE app.orders RENAME TO purchases;
```

### Intermediate

Views and functions may reference old names—use `pg_depend` tooling or IDE refactors.

### Expert

For zero-downtime renames, sometimes create synonym views—plan carefully.

### Key Points

- Renames are simple; dependency updates are not.

### Best Practices

- Search codebase and BI tools for table name strings.

### Common Mistakes

- Breaking nightly reports with silent rename.

---

## Appendix U — Bloat and Design (Forward Pointer)

### Beginner

Heavy updates/deletes create dead tuples—**VACUUM** reclaims space.

### Intermediate

Table design (wide rows, hot indexes) affects bloat rate.

### Expert

Partitioning + archiving reduces vacuum pressure on monolith tables.

```sql
SELECT relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE schemaname = 'app'
ORDER BY n_dead_tup DESC
LIMIT 10;
```

### Key Points

- Schema design and operational health are linked.

### Best Practices

- Track dead tuple ratios as early warning metrics.

### Common Mistakes

- Assuming `DELETE` immediately frees disk to OS.

---

**Next module:** `06. Constraints and Relationships` deepens integrity mechanics beyond table creation basics.

