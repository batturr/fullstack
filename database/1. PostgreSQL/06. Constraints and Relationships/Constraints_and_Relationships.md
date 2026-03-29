# Constraints and Relationships

Constraints turn business rules into database-enforced guarantees. Relationships express how rows in different tables connect. This module covers constraint categories, each major constraint type, foreign key actions, naming and management, modeling one-to-one/one-to-many/many-to-many/polymorphic patterns, deferrable constraints, validation workflows, violation handling, integrity monitoring, and advanced patterns like soft deletes and temporal rules.

## 📑 Table of Contents

- [1. Constraint Types Overview](#1-constraint-types-overview)
- [2. PRIMARY KEY Constraints](#2-primary-key-constraints)
- [3. UNIQUE Constraints](#3-unique-constraints)
- [4. NOT NULL Constraints](#4-not-null-constraints)
- [5. CHECK Constraints](#5-check-constraints)
- [6. FOREIGN KEY Constraints](#6-foreign-key-constraints)
- [7. Constraint Naming and Management](#7-constraint-naming-and-management)
- [8. Relationships Design Patterns](#8-relationships-design-patterns)
- [9. Deferred Constraints](#9-deferred-constraints)
- [10. Constraint Validation on Existing Data](#10-constraint-validation-on-existing-data)
- [11. Handling Constraint Violations](#11-handling-constraint-violations)
- [12. Relationship Integrity and Advanced Patterns](#12-relationship-integrity-and-advanced-patterns)

---

## 1. Constraint Types Overview

### Beginner

PostgreSQL constraints ensure rows obey declared rules:

- **PRIMARY KEY**: unique identifier
- **UNIQUE**: alternate uniqueness
- **NOT NULL**: forbids unknowns in a column
- **CHECK**: boolean expression must hold
- **FOREIGN KEY**: references another row

Constraints can be **column-level** (next to a column) or **table-level** (multi-column).

```sql
CREATE TABLE app.account (
  id bigserial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  balance_cents bigint NOT NULL CHECK (balance_cents >= 0),
  plan text NOT NULL CHECK (plan IN ('free','pro','enterprise'))
);
```

### Intermediate

**Exclusion constraints** (with GiST/SP-GiST) prevent overlapping ranges—scheduling modules revisit these.

**Domain types** carry constraints reusable across columns (see Data Types module).

### Expert

**Assertion-like** patterns use triggers when pure declarative constraints cannot express a rule—keep triggers thin and tested.

```sql
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'app.account'::regclass;
```

### Key Points

- Prefer declarative constraints; escalate to triggers only when necessary.

### Best Practices

- Name constraints for stable error handling and migrations.

### Common Mistakes

- Encoding invariants only in application code—data imports bypass apps.

---

## 2. PRIMARY KEY Constraints

### Beginner

A primary key is `NOT NULL` + `UNIQUE` and creates a btree index by default.

```sql
CREATE TABLE app.customer (
  id bigint PRIMARY KEY,
  name text NOT NULL
);
```

### Intermediate

Composite PK:

```sql
CREATE TABLE app.rating (
  customer_id bigint NOT NULL,
  sku text NOT NULL,
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  PRIMARY KEY (customer_id, sku)
);
```

### Expert

Surrogate vs natural keys: natural keys (email, ISBN) can change—surrogates stabilize references. If you expose natural keys as unique alternates, FKs still reference stable surrogate IDs.

```sql
ALTER TABLE app.customer ADD CONSTRAINT customer_pkey PRIMARY KEY (id);
```

### Key Points

- PK defines the default target for foreign keys.

### Best Practices

- Keep referenced PKs narrow (`bigint` better than many-column composites when possible).

### Common Mistakes

- Wide composite PKs propagated across many child tables—index bloat.

---

## 3. UNIQUE Constraints

### Beginner

Unique ensures no two rows share the same combination (NULLs are distinct in unique indexes except non-standard partial cases—be careful).

```sql
CREATE TABLE app.user_account (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL,
  provider text NOT NULL,
  external_id text NOT NULL,
  UNIQUE (provider, external_id)
);
```

### Intermediate

**Partial unique index** (not exactly `UNIQUE` constraint but common):

```sql
CREATE UNIQUE INDEX ON app.user_account (user_id) WHERE provider = 'internal';
```

### Expert

Uniqueness interacts with **ON CONFLICT** in inserts—must reference a unique index/constraint.

```sql
INSERT INTO app.user_account (user_id, provider, external_id)
VALUES (1, 'oauth', 'abc')
ON CONFLICT (provider, external_id) DO NOTHING;
```

### Key Points

- Unique is not a replacement for PK—tables still benefit from a single row handle.

### Best Practices

- Use partial unique indexes for conditional uniqueness (“one active subscription”).

### Common Mistakes

- Expecting `UNIQUE` to treat NULLs as equal—they do not collide in default unique indexes.

---

## 4. NOT NULL Constraints

### Beginner

`NOT NULL` forbids `NULL` in a column.

```sql
CREATE TABLE app.profile (
  user_id bigint PRIMARY KEY,
  display_name text NOT NULL
);
```

### Intermediate

Adding `NOT NULL` to existing columns requires cleaning data first or using phased migrations.

```sql
ALTER TABLE app.profile ALTER COLUMN display_name SET NOT NULL;
```

### Expert

`NOT NULL` interacts with `ALTER ... SET DEFAULT`—defaults do not backfill without update strategies.

```sql
UPDATE app.profile SET display_name = '' WHERE display_name IS NULL; -- usually pick a better sentinel
ALTER TABLE app.profile ALTER COLUMN display_name SET NOT NULL;
```

### Key Points

- NULL means unknown—do you mean unknown or “not applicable”? Model accordingly.

### Best Practices

- Prefer defaults only when semantically valid—not `0` for “missing.”

### Common Mistakes

- Using NULL and empty string interchangeably in text fields.

---

## 5. CHECK Constraints

### Beginner

`CHECK` enforces a boolean expression per row.

```sql
CREATE TABLE app.shift (
  id bigserial PRIMARY KEY,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  CHECK (end_at > start_at)
);
```

### Intermediate

Multi-column checks:

```sql
CREATE TABLE app.price (
  id bigserial PRIMARY KEY,
  currency char(3) NOT NULL,
  amount numeric(12,2) NOT NULL,
  CHECK (currency ~ '^[A-Z]{3}$'),
  CHECK (amount > 0)
);
```

### Expert

Checks cannot reference other rows—use triggers or exclusion constraints for cross-row rules.

```sql
ALTER TABLE app.price ADD CONSTRAINT price_currency_upper
  CHECK (currency = upper(currency));
```

### Key Points

- Checks are fast, declarative, and hard to bypass accidentally.

### Best Practices

- Keep expressions deterministic; avoid volatile functions in checks when possible.

### Common Mistakes

- Putting subqueries in `CHECK`—not allowed.

---

## 6. FOREIGN KEY Constraints

### Beginner

FK ensures child values exist in parent.

```sql
CREATE TABLE app.parent (id bigint PRIMARY KEY);
CREATE TABLE app.child (
  id bigserial PRIMARY KEY,
  parent_id bigint NOT NULL REFERENCES app.parent (id)
);
```

### Intermediate

`ON DELETE` / `ON UPDATE` actions:

- `NO ACTION` / `RESTRICT`: block parent delete/update if children exist (subtle timing differences with deferral)
- `CASCADE`: delete/update children automatically
- `SET NULL`: nullifies child column (must be nullable)
- `SET DEFAULT`: sets child to default

```sql
CREATE TABLE app.child_cascade (
  id bigserial PRIMARY KEY,
  parent_id bigint NOT NULL REFERENCES app.parent (id) ON DELETE CASCADE
);
```

### Expert

Self-referential FK for trees:

```sql
CREATE TABLE app.folder (
  id bigserial PRIMARY KEY,
  parent_id bigint REFERENCES app.folder (id) ON DELETE CASCADE,
  name text NOT NULL
);
```

### Key Points

- Index child FK columns—Postgres does not auto-create non-PK indexes on the child side.

### Best Practices

- Document cascade graphs—on-call engineers need a map.

### Common Mistakes

- `ON DELETE SET NULL` on `NOT NULL` columns—invalid definition.

---

## 7. Constraint Naming and Management

### Beginner

Name constraints explicitly:

```sql
CREATE TABLE app.invoice (
  id bigserial CONSTRAINT invoice_pkey PRIMARY KEY,
  number text CONSTRAINT invoice_number_key UNIQUE NOT NULL
);
```

### Intermediate

Rename:

```sql
ALTER TABLE app.invoice RENAME CONSTRAINT invoice_number_key TO invoice_number_uq;
```

### Expert

Drop:

```sql
ALTER TABLE app.invoice DROP CONSTRAINT invoice_number_uq;
```

### Key Points

- Stable names help ORMs and migration diffs.

### Best Practices

- Adopt a naming convention (`<table>_<cols>_fkey`).

### Common Mistakes

- Relying on auto-generated names that differ across environments.

---

## 8. Relationships Design Patterns

### Beginner

**1:N** — classic FK on many side.

**1:1** — share PK or unique FK:

```sql
CREATE TABLE app.user (
  id bigint PRIMARY KEY,
  handle text UNIQUE NOT NULL
);

CREATE TABLE app.user_prefs (
  user_id bigint PRIMARY KEY REFERENCES app.user (id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light'
);
```

### Intermediate

**M:N** — junction:

```sql
CREATE TABLE app.student (id serial PRIMARY KEY);
CREATE TABLE app.course (id serial PRIMARY KEY);
CREATE TABLE app.enrollment (
  student_id int REFERENCES app.student (id),
  course_id int REFERENCES app.course (id),
  PRIMARY KEY (student_id, course_id)
);
```

### Expert

**Polymorphic** association (comment on arbitrary target) without supertype table:

```sql
CREATE TABLE app.comment (
  id bigserial PRIMARY KEY,
  target_type text NOT NULL CHECK (target_type IN ('post','video')),
  target_id bigint NOT NULL,
  body text NOT NULL,
  UNIQUE (target_type, target_id, id)
);
-- NOTE: no FK to both targets—integrity enforced in app or via triggers
```

### Key Points

- Polymorphic models trade FK enforcement for flexibility—decide consciously.

### Best Practices

- Prefer supertype tables or separate link tables per type when integrity is paramount.

### Common Mistakes

- Storing both `user_id` and `team_id` nullable with a check “one non-null” without robust constraints/triggers.

---

## 9. Deferred Constraints

### Beginner

Deferrable constraints wait until **COMMIT** to validate—useful for circular FK inserts in one transaction.

```sql
CREATE TABLE app.a (
  id int PRIMARY KEY,
  b_id int
);

CREATE TABLE app.b (
  id int PRIMARY KEY,
  a_id int
);

ALTER TABLE app.a ADD CONSTRAINT a_b_fk FOREIGN KEY (b_id) REFERENCES app.b (id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE app.b ADD CONSTRAINT b_a_fk FOREIGN KEY (a_id) REFERENCES app.a (id) DEFERRABLE INITIALLY DEFERRED;
```

### Intermediate

Per-transaction control:

```sql
BEGIN;
SET CONSTRAINTS ALL DEFERRED;
-- insert rows that temporarily violate order
COMMIT;
```

### Expert

Not all constraints can be deferred in all ways—verify definitions. Deferred unique/PK constraints help bulk ETL ordering.

### Key Points

- Deferral is powerful and easy to misuse—default immediate checking for app queries.

### Best Practices

- Limit deferral scope to migrations/ETL jobs with explicit `SET CONSTRAINTS`.

### Common Mistakes

- Leaving constraints deferred unexpectedly due to session settings leaks in pooling.

---

## 10. Constraint Validation on Existing Data

### Beginner

Adding a `CHECK` or `NOT VALID` FK can avoid immediate full validation in some workflows—PostgreSQL supports `NOT VALID` + `VALIDATE CONSTRAINT`.

```sql
ALTER TABLE app.invoice ADD CONSTRAINT invoice_total_nonneg CHECK (total_cents >= 0) NOT VALID;
ALTER TABLE app.invoice VALIDATE CONSTRAINT invoice_total_nonneg;
```

### Intermediate

Find violators before adding constraints:

```sql
SELECT id FROM app.invoice WHERE total_cents < 0 LIMIT 50;
```

### Expert

For large tables, validate during low traffic; monitor locks. Pair with batch fixes:

```sql
BEGIN;
UPDATE app.invoice SET total_cents = 0 WHERE total_cents < 0;
COMMIT;
ALTER TABLE app.invoice ADD CONSTRAINT invoice_total_nonneg CHECK (total_cents >= 0);
```

### Key Points

- `VALIDATE CONSTRAINT` scans table—plan capacity.

### Best Practices

- Always preview violating keys in staging with production-like data.

### Common Mistakes

- Adding strict constraints without communicating downtime/lock expectations.

---

## 11. Handling Constraint Violations

### Beginner

Applications should map SQLSTATE `23505` (unique) and `23503` (FK) to user-friendly errors.

```sql
INSERT INTO app.user_account (user_id, provider, external_id) VALUES (1,'oauth','dup');
-- duplicate → 23505
```

### Intermediate

Identify problematic rows:

```sql
SELECT * FROM app.child c WHERE NOT EXISTS (SELECT 1 FROM app.parent p WHERE p.id = c.parent_id) LIMIT 100;
```

### Expert

For FK additions, temporarily create quarantine tables:

```sql
CREATE TABLE app.bad_child AS
SELECT * FROM app.child c WHERE NOT EXISTS (SELECT 1 FROM app.parent p WHERE p.id = c.parent_id);
```

### Key Points

- Violations are data quality signals—fix upstream, not only retry.

### Best Practices

- Log constraint name and table to accelerate debugging.

### Common Mistakes

- Swallowing DB errors in ORMs without preserving the SQLSTATE.

---

## 12. Relationship Integrity and Advanced Patterns

### Beginner

**Referential integrity** means child rows always point to existing parents (unless nullable and explicitly null).

### Intermediate

**Orphans** break reports and joins—detect them regularly.

```sql
SELECT COUNT(*) AS orphan_children
FROM app.child c
LEFT JOIN app.parent p ON p.id = c.parent_id
WHERE p.id IS NULL;
```

### Expert

**Soft deletes**: add `deleted_at` and stop hard-deleting parents while children exist, or cascade soft-delete via triggers.

```sql
CREATE TABLE app.customer_soft (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  deleted_at timestamptz
);

CREATE TABLE app.order_soft (
  id bigserial PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES app.customer_soft (id),
  placed_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT EXISTS (
    SELECT 1 FROM app.customer_soft c WHERE c.id = customer_id AND c.deleted_at IS NOT NULL
  )) -- INVALID pattern: subquery not allowed in CHECK
);
-- Practical approach: trigger or restrict deletes + partial unique indexes
```

Use triggers for complex conditional FK-like rules:

```sql
CREATE FUNCTION app.enforce_customer_active() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM app.customer_soft c WHERE c.id = NEW.customer_id AND c.deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'inactive customer';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_customer_active
BEFORE INSERT OR UPDATE ON app.order_soft
FOR EACH ROW EXECUTE PROCEDURE app.enforce_customer_active();
```

### Key Points

- Advanced patterns mix constraints, partial indexes, and triggers—keep complexity visible in docs.

### Best Practices

- Prefer partial unique indexes for “soft unique active email” patterns.

### Common Mistakes

- Attempting forbidden subqueries inside `CHECK` when triggers are the correct tool.

---

## Appendix A — Constraint Catalog Cheat Sheet

### Beginner

```sql
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'app.invoice'::regclass;
```

### Intermediate

`contype`: p primary, u unique, f foreign, c check.

### Expert

```sql
SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'invoice_pkey';
```

### Key Points

- Catalog queries belong in DBA playbooks.

### Best Practices

- Export constraints as part of schema snapshots.

### Common Mistakes

- Forgetting `pg_constraint` vs `pg_indexes`—different stories.

---

## Appendix B — Partial Unique for Soft Deletes

### Beginner

Enforce uniqueness only among active rows:

```sql
-- CREATE EXTENSION IF NOT EXISTS citext;
CREATE TABLE app.user_email (
  id bigserial PRIMARY KEY,
  email citext NOT NULL,
  deleted_at timestamptz
);

CREATE UNIQUE INDEX user_email_active_uq ON app.user_email (email) WHERE deleted_at IS NULL;
```

### Intermediate

Requires careful handling of re-signup flows.

### Expert

Pair with triggers to normalize email casing if not using `citext`.

### Key Points

- Partial unique indexes are constraints in practice—document them.

### Best Practices

- Name indexes clearly (`..._active_uq`).

### Common Mistakes

- Expecting `UNIQUE CONSTRAINT` syntax instead of unique index for partial predicates (Postgres uses unique indexes).

---

## Appendix C — ON UPDATE Scenarios

### Beginner

If parent surrogate keys never change, `ON UPDATE` is moot.

### Intermediate

Natural keys as PKs may change—`ON UPDATE CASCADE` propagates.

```sql
CREATE TABLE app.sku_old (
  sku text PRIMARY KEY,
  name text
);

CREATE TABLE app.item_ref (
  id bigserial PRIMARY KEY,
  sku text NOT NULL REFERENCES app.sku_old (sku) ON UPDATE CASCADE
);
```

### Expert

Changing PKs under load is hazardous—prefer immutable surrogates.

### Key Points

- Design away from updatable keys when possible.

### Best Practices

- If keys must change, script ordered updates in one transaction with deferral.

### Common Mistakes

- Cascading updates unintentionally across huge graphs.

---

## Appendix D — Relationship Integrity Queries

### Beginner

FK violations before adding constraint:

```sql
SELECT c.parent_id, COUNT(*) FROM app.child c
LEFT JOIN app.parent p ON p.id = c.parent_id
WHERE p.id IS NULL
GROUP BY 1;
```

### Intermediate

Duplicate detection for unique constraints:

```sql
SELECT email, COUNT(*) FROM app.user_email WHERE deleted_at IS NULL GROUP BY 1 HAVING COUNT(*) > 1;
```

### Expert

Graph cycles in FKs—defer or reorder inserts.

### Key Points

- Data fixes precede constraint enforcement.

### Best Practices

- Keep SQL fix scripts in version control.

### Common Mistakes

- Running `DELETE` fixes without `LIMIT`/`RETURNING` preview.

---

## Appendix E — Deferrable Constraints and ORMs

### Beginner

ORMs may split operations across transactions—deferral won’t help.

### Intermediate

Use explicit transactions in services for circular creates.

### Expert

Connection poolers can break session assumptions—test deferral under pool modes.

### Key Points

- Application transaction boundaries must align with deferral intent.

### Best Practices

- Encapsulate circular creates in one service method with one transaction.

### Common Mistakes

- Using `@Transactional(propagation=REQUIRES_NEW)` patterns that fragment work.

---

## Appendix F — Polymorphic Integrity with Supertype Table

### Beginner

```sql
CREATE TABLE app.entity (
  id bigserial PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('post','video'))
);

CREATE TABLE app.post (
  entity_id bigint PRIMARY KEY REFERENCES app.entity (id) ON DELETE CASCADE,
  title text NOT NULL
);

CREATE TABLE app.video (
  entity_id bigint PRIMARY KEY REFERENCES app.entity (id) ON DELETE CASCADE,
  length_seconds int NOT NULL
);

CREATE TABLE app.comment_poly (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL REFERENCES app.entity (id) ON DELETE CASCADE,
  body text NOT NULL
);
```

### Intermediate

Triggers ensure `entity.kind` matches subtable.

### Expert

This pattern restores FK integrity at the cost of joins.

### Key Points

- There is no free lunch—pick your complexity location.

### Best Practices

- Encode `kind` checks in triggers with clear error messages.

### Common Mistakes

- Creating supertype rows without subtype rows—orphaned kinds.

---

## Appendix G — Temporal Constraints (Simple)

### Beginner

Ensure end after start—already a `CHECK`.

### Intermediate

As-of queries belong in SQL views; constraints enforce row-local rules.

### Expert

Range exclusion constraints for non-overlapping ownership windows:

```sql
CREATE TABLE app.license (
  id bigserial PRIMARY KEY,
  customer_id bigint NOT NULL,
  valid daterange NOT NULL,
  EXCLUDE USING gist (customer_id WITH =, valid WITH &&)
);
```

### Key Points

- Temporal modeling often combines range types and exclusion constraints.

### Best Practices

- Use half-open date ranges for clarity.

### Common Mistakes

- Using `timestamp` without time zones for contractual periods spanning DST.

---

## Appendix H — Surrogate vs Natural Key FKs

### Beginner

Surrogate: stable integer/UUID. Natural: email, tax id.

### Intermediate

Expose natural keys as unique constraints; FK internally uses surrogate.

### Expert

Privacy regulations may require hashing natural keys—still use surrogates internally.

### Key Points

- Surrogates simplify relationships; natural keys remain searchable.

### Best Practices

- Document PII columns and encryption policies separately.

### Common Mistakes

- Changing natural keys without a migration path for external integrations.

---

## Appendix I — Constraint + Row-Level Security (Forward Pointer)

### Beginner

RLS policies filter rows; constraints still enforce invariants on visible writes.

### Intermediate

Test policies with roles, not superuser sessions.

### Expert

Combine constraints for data shape, RLS for authorization—do not duplicate poorly.

### Key Points

- Security layers compose; they do not replace each other.

### Best Practices

- Integration tests with least-privilege roles.

### Common Mistakes

- Testing only as superuser and missing RLS gaps.

---

## Appendix J — Bulk Load and FK Checks

### Beginner

Load parent before child.

### Intermediate

Use deferral or disable triggers only with extreme caution (triggers, not constraints lightly).

### Expert

Use `COPY` into staging, validate, then insert ordered.

```sql
BEGIN;
SET CONSTRAINTS ALL DEFERRED;
-- bulk inserts
COMMIT;
```

### Key Points

- Ordering and deferral are ETL design tools.

### Best Practices

- Keep staging schemas unprivileged for runtime apps.

### Common Mistakes

- Leaving deferred constraints unresolved due to failed commits mid-batch.

---

## Appendix K — Error Messages: What to Log

### Beginner

Log: SQLSTATE, message, table, constraint name, query id (if available).

### Intermediate

Avoid logging PII in parameters.

### Expert

Correlate with `pg_stat_statements` on server side for hot failures.

### Key Points

- Good logs shorten incidents.

### Best Practices

- Map `23505` to “duplicate” UX copy without leaking competitor existence if sensitive.

### Common Mistakes

- Showing raw SQL to end users.

---

## Appendix L — Self-Referential FK and NULL

### Beginner

Top-level nodes use `parent_id IS NULL`.

### Intermediate

Combine `CHECK (parent_id IS DISTINCT FROM id)` to prevent trivial cycles on single-row level (not sufficient for deep cycles).

### Expert

Cycle detection requires recursive queries or triggers.

```sql
CREATE TABLE app.tree (
  id bigserial PRIMARY KEY,
  parent_id bigint REFERENCES app.tree (id),
  CHECK (parent_id IS DISTINCT FROM id)
);
```

### Key Points

- Trees are easy to insert, tricky to validate fully.

### Best Practices

- Application-layer invariants plus occasional audits.

### Common Mistakes

- Accidental parent pointing to descendant—data corruption.

---

## Appendix M — Many-to-Many Payload Columns

### Beginner

Junction tables can carry relationship attributes:

```sql
CREATE TABLE app.enrollment (
  student_id int REFERENCES app.student (id),
  course_id int REFERENCES app.course (id),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  grade text,
  PRIMARY KEY (student_id, course_id)
);
```

### Intermediate

Consider surrogate key if relationship rows gain heavy one-to-many children.

### Expert

Index foreign columns and query patterns (`student_id`, `course_id`).

### Key Points

- M:N is not only two columns—often temporal and status metadata exists.

### Best Practices

- Name junction tables by domain (`enrollment` not `student_course` when that reads better).

### Common Mistakes

- Missing indexes on one FK direction, hurting lookups.

---

## Appendix N — CHECK vs ENUM vs Lookup Table

### Beginner

`CHECK (col IN (...))` is quick for stable small sets.

### Intermediate

ENUM adds ordered type; lookup table adds FK and extensibility.

### Expert

High-churn vocabularies belong in tables; stable protocols in CHECK/ENUM.

### Key Points

- Evolution frequency drives the choice.

### Best Practices

- If non-engineers edit vocab, use lookup tables + admin UI.

### Common Mistakes

- ENUM for rapidly changing marketing campaign codes.

---

## Appendix O — Foreign Keys and Partitioning Notes

### Beginner

Partitioned tables can be referenced with care—verify version-specific rules for PK/unique shapes.

### Intermediate

FK from child to partitioned parent may require unique constraints including partition key.

### Expert

Test migrations on staging clones—this area evolves across releases.

### Key Points

- Partitioning interacts with uniqueness and references.

### Best Practices

- Read release notes when combining partitioning + FK heavily.

### Common Mistakes

- Assuming non-partitioned FK wisdom applies unchanged.

---

## Appendix P — Relationship Testing SQL Kit

### Beginner

```sql
BEGIN;
INSERT INTO app.parent (id) VALUES (1);
INSERT INTO app.child (parent_id) VALUES (1);
ROLLBACK;
```

### Intermediate

```sql
DELETE FROM app.parent WHERE id = 1; -- should fail if child exists and ON DELETE restricts
```

### Expert

Property-based tests generating random graphs—use with scaled-down schema.

### Key Points

- Tests should exercise `ON DELETE` semantics explicitly.

### Best Practices

- Add CI job that rebuilds schema from migrations and runs integrity suite.

### Common Mistakes

- Only testing happy-path inserts.

---

## Appendix Q — Documentation Template for Cascading Deletes

### Beginner

For each parent table, write one sentence: “Deleting a parent does X to children (block/cascade/set null).”

### Intermediate

Link to the exact constraint names from `pg_constraint` exports in your internal wiki.

### Expert

Attach ER diagrams with cascade arrows and mark high-risk subgraphs (financial, legal hold).

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'f' AND confrelid = 'app.parent'::regclass;
```

### Key Points

- Operations runbooks and schema truth should match—regenerate exports on every migration.

### Best Practices

- Review cascade maps during incident postmortems where deletes surprised the team.

### Common Mistakes

- Assuming `ON DELETE` defaults without reading `pg_get_constraintdef` output.

---

**Continue your path:** proceed to Topic 7 (`SELECT & Querying`) in the main README index for expressive data retrieval.

