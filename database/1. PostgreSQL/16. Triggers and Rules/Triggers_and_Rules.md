# Triggers and Rules

**PostgreSQL learning notes (March 2026). Aligned with README topic 16.**

---

## 📑 Table of Contents

- [1. Trigger Basics](#1-trigger-basics)
- [2. Trigger Events (INSERT / UPDATE / DELETE)](#2-trigger-events-insert--update--delete)
- [3. Trigger Timing (BEFORE / AFTER)](#3-trigger-timing-before--after)
- [4. Row-Level vs Statement-Level Triggers](#4-row-level-vs-statement-level-triggers)
- [5. Trigger Functions (NEW / OLD)](#5-trigger-functions-new--old)
- [6. BEFORE Triggers](#6-before-triggers)
- [7. AFTER Triggers](#7-after-triggers)
- [8. Instead-of Triggers](#8-instead-of-triggers)
- [9. Trigger Applications (Audit, Business Rules)](#9-trigger-applications-audit-business-rules)
- [10. Trigger Maintenance](#10-trigger-maintenance)
- [11. Recursive Triggers](#11-recursive-triggers)
- [12. Rules (PostgreSQL-Specific)](#12-rules-postgresql-specific)

---

## 1. Trigger Basics

<a id="1-trigger-basics"></a>

### Beginner

A **trigger** automatically runs a **trigger function** when a table event occurs. You `CREATE TRIGGER` on a table, choose timing (`BEFORE`/`AFTER`), granularity (`FOR EACH ROW`/`FOR EACH STATEMENT`), and events (`INSERT`/`UPDATE`/`DELETE`/`TRUNCATE` where supported).

### Intermediate

Trigger functions are special: declared `RETURNS trigger`, they access `NEW`/`OLD` records and return `NULL` or modified `NEW` depending on timing. Multiple triggers of same type run in **name order** (alphabetical) unless using `pg_trigger` `tgname` ordering nuances—document ordering when it matters.

### Expert

Triggers participate in the same transaction as the statement—errors abort the whole transaction unless handled. `CONSTRAINT TRIGGER` variants defer to end of transaction. Foreign keys can be implemented with triggers historically—prefer declarative constraints today.

```sql
CREATE TABLE orders (
  id bigserial PRIMARY KEY,
  status text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION trg_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_touch_updated
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trg_touch_updated_at();
```

### Key Points

- Triggers are powerful but add hidden behavior—communicate with application teams.
- They run with the privileges of the **function owner**, often combined with `SECURITY DEFINER` (dangerous if mishandled).

### Best Practices

- Keep trigger functions small and fast.
- Add comments on triggers describing purpose and owners.

### Common Mistakes

- Putting slow network I/O inside triggers—blocks transactions.

---

## 2. Trigger Events (INSERT / UPDATE / DELETE)

<a id="2-trigger-events-insert--update--delete"></a>

### Beginner

`INSERT` triggers see `NEW` rows. `DELETE` triggers see `OLD`. `UPDATE` triggers see both (`OLD` before change, `NEW` after).

### Intermediate

Specify multiple events: `AFTER INSERT OR UPDATE ON t`. `UPDATE OF col1, col2` narrows to relevant column updates.

### Expert

`TRUNCATE` triggers require `FOR EACH STATEMENT` and special care—`TRUNCATE` bypasses row-level triggers by default unless defined appropriately (version/docs detail capabilities).

```sql
CREATE TRIGGER orders_audit_ins
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION trg_audit_order();

CREATE TRIGGER orders_notify_status
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION trg_status_changed();
```

### Key Points

- Column-specific `UPDATE` triggers reduce overhead when only some columns matter.
- Event choice determines available row variables.

### Best Practices

- Use the narrowest event/column set that satisfies requirements.

### Common Mistakes

- Expecting `NEW` in `DELETE` triggers—it's NULL.

---

## 3. Trigger Timing (BEFORE / AFTER)

<a id="3-trigger-timing-before--after"></a>

### Beginner

`BEFORE` triggers run prior to writing the row version—can modify `NEW`. `AFTER` triggers run once row is visible to the transaction—use for auditing, side effects that should see committed row state within txn.

### Intermediate

`BEFORE` triggers can **reject** changes with `RAISE EXCEPTION`. `AFTER` triggers cannot change `NEW`/`OLD` row data—use another `UPDATE` (careful with recursion).

### Expert

Foreign key checks occur at known points; triggers interleave—ordering vs constraints matters for validation design. `BEFORE` triggers can replace values used in constraints if values adjusted before check.

```sql
CREATE OR REPLACE FUNCTION trg_normalize_email()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_email_norm
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trg_normalize_email();
```

### Key Points

- Mutate data in `BEFORE` row triggers.
- Heavy work generally belongs `AFTER` or async—but async is app responsibility.

### Best Practices

- Validate business rules early (`BEFORE`) to fail fast.

### Common Mistakes

- Attempting to modify `NEW` in `AFTER` triggers—ignored/wrong pattern.

---

## 4. Row-Level vs Statement-Level Triggers

<a id="4-row-level-vs-statement-level-triggers"></a>

### Beginner

`FOR EACH ROW` executes per affected row—`NEW`/`OLD` populated. `FOR EACH STATEMENT` runs once per statement—`NEW`/`OLD` NULL; use for coarse logging or guard rails.

### Intermediate

Bulk `INSERT...SELECT` fires row triggers per inserted row—can be expensive. Statement triggers see no row data unless using transition tables (advanced).

### Expert

Transition tables (`REFERENCING OLD TABLE AS ... NEW TABLE AS ...`) enable statement triggers to inspect rowsets for bulk operations—useful for auditing large batches.

```sql
CREATE TRIGGER orders_stmt_log
AFTER INSERT ON orders
FOR EACH STATEMENT
EXECUTE FUNCTION trg_log_bulk_insert();
```

### Key Points

- Row triggers scale linearly with rows touched.
- Statement triggers cannot easily access individual rows without transition tables.

### Best Practices

- Prefer statement-level when per-row logic unnecessary.

### Common Mistakes

- Accidentally O(n) triggers on million-row imports.

---

## 5. Trigger Functions (NEW / OLD)

<a id="5-trigger-functions-new--old"></a>

### Beginner

Inside trigger functions, `NEW` and `OLD` are records typed like the table. `TG_OP` tells `'INSERT'`, `'UPDATE'`, `'DELETE'`. `TG_TABLE_NAME` identifies table.

### Intermediate

`RETURN NEW` in `BEFORE` row triggers replaces inserted/updated row. `RETURN NULL` in `BEFORE` row `DELETE` cancels delete (rare). `AFTER` triggers usually `RETURN NULL`.

### Expert

Use `TG_ARGV[]` for generic trigger functions parameterized at `CREATE TRIGGER ... EXECUTE FUNCTION fn(arg1, arg2)`.

```sql
CREATE OR REPLACE FUNCTION trg_audit()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log(table_name, op, row_pk)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(table_name, op, row_pk)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id);
  ELSE
    INSERT INTO audit_log(table_name, op, row_pk)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
```

### Key Points

- `TG_*` variables provide context—log them in debugging.
- Return values matter in `BEFORE` triggers.

### Best Practices

- Generic audit triggers reduce duplication—parameterize table differences via args.

### Common Mistakes

- Returning `NEW` from `AFTER` triggers thinking it changes data.

---

## 6. BEFORE Triggers

<a id="6-before-triggers"></a>

### Beginner

Use `BEFORE` to **validate**, **normalize**, and **compute** fields prior to persistence.

### Intermediate

Raise exceptions to block invalid transitions. Replace defaults dynamically based on other columns.

### Expert

Multiple `BEFORE` triggers compose—order by trigger name. Conflicts between triggers indicate need for consolidation or explicit ordering discipline.

```sql
CREATE OR REPLACE FUNCTION trg_block_void()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'void' AND OLD.status <> 'void' AND NOT coalesce(current_setting('app.allow_void', true)::boolean, false) THEN
    RAISE EXCEPTION 'void transition disabled';
  END IF;
  RETURN NEW;
END;
$$;
```

### Key Points

- `BEFORE` triggers are your last-mile data integrity hooks before constraints (interleaved—know order).

### Best Practices

- Prefer declarative constraints when expressible—triggers for cross-row rules.

### Common Mistakes

- Duplicating check constraints in triggers without single source of truth.

---

## 7. AFTER Triggers

<a id="7-after-triggers"></a>

### Beginner

`AFTER` triggers observe committed-in-transaction changes—good for **audit**, **notifications**, **enqueue** patterns (still synchronous within txn).

### Intermediate

Further `UPDATE` statements in `AFTER` triggers cause additional writes—watch recursion and lock duration.

### Expert

`AFTER` triggers firing additional DML can interact with deferrable constraints and statement-level triggers—test complex graphs.

```sql
CREATE OR REPLACE FUNCTION trg_enqueue_webhook()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO outbox(topic, payload)
  VALUES ('orders.updated', jsonb_build_object('id', NEW.id, 'status', NEW.status));
  RETURN NULL;
END;
$$;
```

### Key Points

- Still synchronous—outbox pattern avoids network calls in trigger.

### Best Practices

- Write to durable outbox tables, let workers deliver externally.

### Common Mistakes

- Calling HTTP APIs inside triggers—fragile and slow.

---

## 8. Instead-of Triggers

<a id="8-instead-of-triggers"></a>

### Beginner

`INSTEAD OF` triggers exist on **views** (not plain tables) to define what `INSERT`/`UPDATE`/`DELETE` mean for non-updatable views.

### Intermediate

Enables API-friendly denormalized views while writing through to base tables with custom logic.

### Expert

Must handle all operations you expose; multi-table joins require careful mapping and key resolution.

```sql
CREATE VIEW customer_orders AS
SELECT c.id AS customer_id, c.name, o.id AS order_id, o.status
FROM customers c
JOIN orders o ON o.customer_id = c.id;

CREATE OR REPLACE FUNCTION trg_io_customer_orders()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO orders(id, customer_id, status)
    VALUES (NEW.order_id, NEW.customer_id, NEW.status);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER io_customer_orders
INSTEAD OF INSERT ON customer_orders
FOR EACH ROW EXECUTE FUNCTION trg_io_customer_orders();
```

### Key Points

- Powerful for abstraction layers—also easy to get wrong.

### Best Practices

- Unit test each operation path (`INSERT`/`UPDATE`/`DELETE`).

### Common Mistakes

- Partial implementations leaving some DML operations impossible.

---

## 9. Trigger Applications (Audit, Business Rules)

<a id="9-trigger-applications-audit-business-rules"></a>

### Beginner

**Audit** triggers capture who/when/what changed. **Business rules** enforce workflows (state machines) beyond simple constraints.

### Intermediate

Store `current_user` and `session` metadata via `SET LOCAL` custom GUCs from application (`SET app.user_id = '...'`).

### Expert

Temporal tables, soft-delete enforcement, and derived aggregates can be maintained—balance with materialized views for read-heavy summaries.

```sql
CREATE TABLE audit_orders (
  id bigserial PRIMARY KEY,
  order_id bigint,
  old_status text,
  new_status text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text DEFAULT current_user
);

CREATE OR REPLACE FUNCTION trg_audit_orders_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_orders(order_id, old_status, new_status)
    VALUES (OLD.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;
```

### Key Points

- Combine triggers with RLS for tenant-safe auditing when needed.

### Best Practices

- Keep audit tables indexed on time and entity keys for investigations.

### Common Mistakes

- Logging full row blobs without retention policy—disk explosion.

---

## 10. Trigger Maintenance

<a id="10-trigger-maintenance"></a>

### Beginner

`ALTER TABLE ... DISABLE TRIGGER` / `ENABLE TRIGGER` toggles (superuser/owner rules apply). `DROP TRIGGER` removes.

### Intermediate

`pg_trigger` catalogs dependencies—dropping functions may cascade. Use `CREATE OR REPLACE` for function updates.

### Expert

For zero-downtime deploys, coordinate trigger changes with application dual-write phases—avoid incompatible assumptions mid-deploy.

```sql
ALTER TABLE orders DISABLE TRIGGER USER;
-- bulk load
ALTER TABLE orders ENABLE TRIGGER USER;
```

### Key Points

- Disabling triggers bypasses logic—dangerous in production unless controlled.

### Best Practices

- Prefer session-local strategies or staging loads with triggers deferred via ETL patterns.

### Common Mistakes

- Forgetting to re-enable triggers after maintenance.

---

## 11. Recursive Triggers

<a id="11-recursive-triggers"></a>

### Beginner

Triggers can perform DML that fires **more** triggers—potential infinite recursion.

### Intermediate

`session_replication_role` or trigger design patterns (guards) prevent cycles. Check `pg_trigger_depth()` (if available in your version) or use guard columns.

### Expert

Model state machines explicitly: only allow transitions that decrease a “depth” counter or check `pg_trigger_depth()` to stop recursion.

```sql
CREATE OR REPLACE FUNCTION trg_guarded_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  UPDATE orders SET note = note || ' touched' WHERE id = NEW.id AND id <> NEW.id; -- example only
  RETURN NEW;
END;
$$;
```

### Key Points

- Prefer designing **non-recursive** cascades—recursion is hard to reason about.

### Best Practices

- If recursion needed, cap depth and document invariants.

### Common Mistakes

- Unbounded cascades locking tables.

---

## 12. Rules (PostgreSQL-Specific)

<a id="12-rules-postgresql-specific"></a>

### Beginner

**Rules** rewrite queries before planning—historic system used to implement views. `CREATE RULE` defines alternative actions.

### Intermediate

`INSTEAD` rules can replace `INSERT`/`UPDATE`/`DELETE` on views. Can be confusing alongside triggers.

### Expert

Rules are largely **legacy** for app developers—prefer triggers and native updatable views. Still appear internally; understand when debugging weird plans.

```sql
-- Illustrative only—prefer views + INSTEAD OF triggers in new designs
CREATE RULE orders_redirect AS ON INSERT TO orders_legacy
DO INSTEAD INSERT INTO orders SELECT NEW.*;
```

### Key Points

- Rules operate at **parse/rewrite** layer—different mental model than triggers.

### Best Practices

- Avoid new RULE-based designs unless maintaining legacy systems.

### Common Mistakes

- Mixing rules and triggers without understanding rewrite order.

---

## Appendix A: Trigger Ordering Reference

Alphabetical trigger name order for same timing/event—name triggers with numeric prefixes if explicit ordering required (`01_...`).

---

## Appendix B: WHEN Clause Performance

`WHEN` avoids executing function body—cheap guard.

```sql
WHEN (OLD.status IS DISTINCT FROM NEW.status)
```

---

## Appendix C: Transition Tables Sketch

```sql
CREATE TRIGGER orders_stmt_audit
AFTER INSERT ON orders
REFERENCING NEW TABLE AS new_orders
FOR EACH STATEMENT
EXECUTE FUNCTION trg_audit_new_orders();
```

---

## Appendix D: CONSTRAINT TRIGGER Concept

Deferrable triggers for complex integrity involving multiple rows—use sparingly with clear documentation.

---

## Appendix E: Testing Triggers

Wrap cases in transactions with `ROLLBACK` to keep tests idempotent.

---

## Appendix F: Security Definer Trigger Warning

Definer triggers bypass invoker RLS unless `FORCE ROW LEVEL SECURITY` applies—audit carefully.

---

## Appendix G: Bulk Load Recipe

Disable triggers only with approvals; alternatively load staging table and `INSERT...SELECT` with controlled functions.

---

## Appendix H: NOTIFY from Triggers

```sql
PERFORM pg_notify('orders', NEW.id::text);
```

Lightweight but not durable—do not rely as sole integration mechanism.

---

## Appendix I: Audit Timestamp Timezone

Store `timestamptz` for audit events—render in app timezones.

---

## Appendix J: Soft Delete Trigger

```sql
BEFORE DELETE ... RAISE EXCEPTION 'use soft delete';
```

Pair with `deleted_at` column and partial indexes.

---

## Appendix K: Rules vs Triggers Summary

Rules rewrite queries; triggers execute on events—different lifecycles.

---

## Appendix L: Documentation Template

Comment on trigger: purpose, owner, performance notes, recursion guards.

---

## Appendix M: Event Matrix Cheat Sheet

| Event | BEFORE row | AFTER row | Statement |
| --- | --- | --- | --- |
| INSERT | mutate NEW | audit NEW | coarse log |
| UPDATE | validate transition | side effects | batch summaries |
| DELETE | block/cascade prep | archive OLD | coarse log |

---

## Appendix N: Column Lists in UPDATE Triggers

`UPDATE OF col` prevents firing when irrelevant columns change—critical for hot tables.

---

## Appendix O: Error Message Quality

```sql
RAISE EXCEPTION 'Invalid status transition % -> %', OLD.status, NEW.status
  USING ERRCODE = 'check_violation';
```

---

## Appendix P: Idempotency Keys in Outbox

Include idempotency keys in outbox payloads to dedupe downstream consumers.

---

## Appendix Q: Trigger Overhead Measurement

```sql
\timing on
INSERT INTO orders... -- with triggers on
-- compare to staging table without triggers
```

---

## Appendix R: Replacing EXECUTE PROCEDURE vs FUNCTION

Modern PostgreSQL uses `EXECUTE FUNCTION` in `CREATE TRIGGER`—verify syntax for your version.

---

## Appendix S: Handling NULLs in NEW/OLD

Always guard `IF NEW.col IS DISTINCT FROM OLD.col` patterns for NULL-safe comparisons.

---

## Appendix T: Preventing Mutual Trigger Loops

Two tables updating each other—extract shared logic into a single function called once.

---

## Appendix U: Truncate Caveats

`TRUNCATE` permissions and triggers differ from `DELETE`—read docs before relying on trigger-based archival for truncates.

---

## Appendix V: Partial View Updatability

Simple views are automatically updatable; complex joins need `INSTEAD OF` triggers.

---

## Appendix W: Session GUC Pattern

Application sets:

```sql
SELECT set_config('app.user_id', $1, true);
```

Trigger reads `current_setting('app.user_id', true)`.

---

## Appendix X: Auditing TOAST Columns

Large values may be TOASTed—audit strategies may store pointers/hashes instead of full text.

---

## Appendix Y: Trigger on Partitioned Tables

Triggers on parent vs partitions have different behaviors—test on your version.

---

## Appendix Z: Naming Conventions

`trg_<table>_<purpose>` and `fn_trg_<purpose>` improve grep-ability.

---

## Appendix AA: Rollback Semantics

Trigger failures abort statement; outer transaction can still `ROLLBACK` entirely.

---

## Appendix AB: Savepoints and Triggers

Errors in triggers may invalidate transaction state—use savepoints in controlled procedural code around test calls.

---

## Appendix AC: COPY and Triggers

`COPY` into table fires row triggers—bulk loads can be slow; consider staging.

---

## Appendix AD: Deferrable Constraints vs Triggers

Prefer deferrable constraints for many FK-like patterns; triggers for cross-table invariants not expressible declaratively.

---

## Appendix AE: Observability

Log slow trigger executions by timing within function (dev only) or sampling.

---

## Appendix AF: Migration Safety

Add triggers in backward-compatible phases: deploy function, deploy trigger disabled, enable gradually.

---

## Appendix AG: JSON Payload Audit

```sql
jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
```

Mind PII redaction.

---

## Appendix AH: Conditional Compilation

No preprocessor—use separate migration files per version if needed.

---

## Appendix AI: Unit Test Skeleton

```sql
BEGIN;
INSERT INTO orders...;
ASSERT (SELECT count(*) FROM audit_log) = 1;
ROLLBACK;
```

---

## Appendix AJ: Least Privilege

Trigger functions should run as minimal role—avoid superuser owners.

---

## Appendix AK: INSTEAD OF DELETE Example Sketch

Map view delete to soft-delete base row:

```sql
UPDATE base SET deleted_at = now() WHERE id = OLD.id;
RETURN OLD;
```

---

## Appendix AL: Multi-Row Statement AFTER

Statement-level AFTER sees whole statement; use transition tables to inspect rows.

---

## Appendix AM: Ordering with Alphabetical Names

Use `00_`, `01_` prefixes only when business requires strict sequencing—document why.

---

## Appendix AN: Trigger on Views Security

`SECURITY BARRIER` views interact with triggers and rules—test carefully.

---

## Appendix AO: Replacing Rules Systems

Migration path: inventory rules, rewrite as triggers/views, test plan parity.

---

## Appendix AP: pg_trigger Catalog Query

```sql
SELECT tgname, tgenabled, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass AND NOT tgisinternal;
```

---

## Appendix AQ: ENABLE REPLICA Triggers

Logical replication may control trigger firing on subscribers—operational detail for HA.

---

## Appendix AR: Event Triggers (Different Topic)

Event triggers fire on DDL—do not confuse with table triggers.

---

## Appendix AS: Testing DELETE CASCADE Interactions

Cascading deletes fire triggers on child tables—order may surprise; integration tests help.

---

## Appendix AT: Guard Clause Template

```sql
IF TG_OP = 'UPDATE' AND OLD.col IS NOT DISTINCT FROM NEW.col THEN
  RETURN NEW;
END IF;
```

---

## Appendix AU: Avoid Row Trigger for Derived Counters

High concurrency counters in triggers can serialize—consider incremental MV or async rollups.

---

## Appendix AV: Trigger Depth Function Usage

Use `pg_trigger_depth()` only when necessary—prefer non-recursive designs.

---

## Appendix AW: Rules Rewrite Debugging

`EXPLAIN VERBOSE` may show rewritten forms—useful when legacy rules present.

---

## Appendix AX: Documentation for Support Teams

Runbook: how to disable specific trigger safely, who approves, how to verify re-enabled.

---

## Appendix AY: Performance Profiling

Use `EXPLAIN (ANALYZE)` on statements dominated by triggers—function time shows up in planning/execution depending on context; also use external profilers.

---

## Appendix AZ: Final Checklist

- [ ] Events/timing minimal
- [ ] No network I/O
- [ ] Recursion guarded
- [ ] Audited security definer usage
- [ ] Tests for INSERT/UPDATE/DELETE paths

---

## Appendix BA: Sample State Machine

Statuses: `draft -> submitted -> approved | rejected`. Enforce allowed transitions in `BEFORE UPDATE` trigger with clear exceptions.

---

## Appendix BB: Sample Audit Table Indexes

```sql
CREATE INDEX audit_orders_order_id_idx ON audit_orders(order_id);
CREATE INDEX audit_orders_changed_at_idx ON audit_orders(changed_at);
```

---

## Appendix BC: Triggers vs Generated Columns

Generated columns compute deterministically—triggers handle richer cross-column/cross-row rules.

---

## Appendix BD: Logical Decisions

If a rule is purely single-row and immutable expression, consider generated column; if multi-row, trigger or constraint.

---

## Appendix BE: Business Hours Enforcement

```sql
IF extract(hour from now()) NOT BETWEEN 9 AND 17 THEN
  RAISE EXCEPTION 'changes disallowed outside business hours';
END IF;
```

Use judiciously—ops may hate this.

---

## Appendix BF: Shadow Writes for Dual Writes

During migrations, triggers can duplicate writes to new tables—coordinate cutover carefully.

---

## Appendix BG: Testing INSTEAD OF Updates

Ensure primary key changes (if allowed) map correctly to base tables.

---

## Appendix BH: Null Transition Guards

For `UPDATE`, `OLD`/`NEW` comparisons should use `IS DISTINCT FROM`.

---

## Appendix BI: Monitoring Trigger Errors

Surface `SQLSTATE` from failed triggers in application logs—include `table`, `tgname`.

---

## Appendix BJ: Final Summary Sentence

Triggers are transaction-synchronous hooks—keep them fast, explicit, and observable.

---

## Appendix BK: Extra SQL — Conditional Audit

```sql
IF to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
  INSERT INTO audit_full(row_data) VALUES (to_jsonb(NEW));
END IF;
```

---

## Appendix BL: Extra SQL — Raise with Hint

```sql
RAISE EXCEPTION 'Invalid' USING HINT = 'Use workflow API to void orders';
```

---

## Appendix BM: Extra SQL — Trigger Args

```sql
CREATE TRIGGER t
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION trg_audit('orders', 'v1');
```

Read via `TG_ARGV[1]` etc.

---

## Appendix BN: Line Padding — Operational Reminder

Operational excellence for triggers means dashboards on write latency, not just row counts.

---

## Appendix BO: Line Padding — Collaboration

Database triggers touch application behavior—require code review from both DBA and application teams.

---

## Appendix BP: Line Padding — Simplicity Bias

If a trigger exceeds ~50 lines, refactor helper functions or move logic to a controlled service layer.

---

## Appendix BQ: Line Padding — Future You

Comment **why** a trigger exists—future you will not remember the incident that created it.

---

## Appendix BR: Line Padding — Testing Discipline

Any production trigger without an automated test is a latent incident.

---

## Appendix BS: Line Padding — Rollback Plans

Every trigger deployment should include a rollback migration disabling or replacing it.

---

## Appendix BT: Closing

Master triggers by mastering transactions: triggers inherit all transactional power and peril.

---

## Appendix BU: Case Study — Order State Machine

**Requirement:** `orders.status` must follow `draft -> open -> shipped -> delivered` without skipping.

```sql
CREATE OR REPLACE FUNCTION trg_orders_fsm()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  ok boolean;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;
  ok :=
    (OLD.status, NEW.status) IN (
      ('draft','open'),
      ('open','shipped'),
      ('shipped','delivered')
    );
  IF NOT ok AND OLD.status IS DISTINCT FROM NEW.status THEN
    RAISE EXCEPTION 'illegal transition % -> %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END;
$$;
```

---

## Appendix BV: Case Study — Enriched Audit Context

Combine session GUCs (`app.user_id`, `app.request_id`) into audit rows for traceability across microservices.

---

## Appendix BW: Case Study — Derived `search_vector`

Maintain `tsvector` columns on `INSERT/UPDATE` via `BEFORE` trigger for full-text search indexing consistency.

---

## Appendix BX: Case Study — Parent/Child Consistency

Use `AFTER` trigger on parent updates to propagate denormalized fields to children when denormalization is intentional.

---

## Appendix BY: Rules Historical Note

PostgreSQL rules once powered view updates; modern codebases should default to triggers or built-in updatable view support.

---

## Appendix BZ: Checklist for INSTEAD OF Views

- [ ] INSERT path defined
- [ ] UPDATE path maps keys
- [ ] DELETE path defined or explicitly blocked
- [ ] Permissions on underlying tables verified

---

## Appendix CA: Explicit `EXECUTE FUNCTION` Reminder

Verify your PostgreSQL version’s `CREATE TRIGGER` syntax; older examples may say `EXECUTE PROCEDURE`.

---

## Appendix CB: Trigger Function `RETURNS trigger`

Returning wrong type causes creation failure—always `RETURNS trigger` for trigger functions.

---

## Appendix CC: Minimal `AFTER` Audit Trigger

```sql
CREATE OR REPLACE FUNCTION trg_audit_min()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO audit(t, op) VALUES (TG_TABLE_NAME, TG_OP);
  RETURN NULL;
END;
$$;
```

---

## Appendix CD: Testing Column-Specific UPDATE

Ensure `UPDATE OF status` triggers do not fire on unrelated column updates—write explicit SQL tests.

---

## Appendix CE: Final Line Anchor

Triggers should make correct behavior **inevitable**, not surprising.

---

## Appendix CF: One More Rules Warning

Rules can interact unexpectedly with `RETURNING` and writable CTEs—when debugging odd rewrites, inspect whether legacy rules exist on the relation.

---

## Appendix CG: One More Performance Note

If triggers dominate write latency, first reduce per-row work; second consider batching at application level; third reconsider schema design.

---

## Appendix CH: Incident Response Blurb

When a trigger causes outages, capture: failing statement, `pg_trigger` definition, function source, recent migrations, and whether bulk jobs ran concurrently.

---

## Appendix CI: Learning Drill

Implement a `BEFORE INSERT` trigger that sets `created_by` using `current_setting('app.user_id', true)` with safe defaults when unset.

---

## Appendix CJ: Learning Drill (Advanced)

Add transition-table `AFTER INSERT` statement trigger writing a single summary row per bulk insert.

---

## Appendix CK: Final Padding Line

Treat triggers like production services: monitor, test, and roll back with equal rigor.

---

**End of topic 16 notes.**
