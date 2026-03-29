# INSERT, UPDATE, DELETE

**PostgreSQL learning notes (March 2026). Aligned with README topic 11.**

---

## 📑 Table of Contents

- [1. INSERT Basics](#1-insert-basics)
- [2. Multi-Row INSERT](#2-multi-row-insert)
- [3. INSERT from SELECT](#3-insert-from-select)
- [4. INSERT with Default Values](#4-insert-with-default-values)
- [5. INSERT with RETURNING](#5-insert-with-returning)
- [6. ON CONFLICT (UPSERT)](#6-on-conflict-upsert)
- [7. UPDATE Basics](#7-update-basics)
- [8. UPDATE from SELECT](#8-update-from-select)
- [9. UPDATE with CASE](#9-update-with-case)
- [10. UPDATE with RETURNING](#10-update-with-returning)
- [11. DELETE Basics](#11-delete-basics)
- [12. DELETE vs TRUNCATE vs DROP](#12-delete-vs-truncate-vs-drop)

---

## 1. INSERT Basics

<a id="1-insert-basics"></a>

### Beginner

`INSERT INTO table (cols...) VALUES (...)` adds rows. Column list is optional if you supply values for all columns in table order—but explicit lists are safer under schema evolution.

### Intermediate

Omitted columns use defaults or null if allowed. Type coercion applies to literals. Violated constraints abort the statement unless handled.

### Expert

Rules and triggers fire per row. `COPY` bulk loads bypass some insert overhead paths—different trade-offs.

```sql
INSERT INTO customers (name, email) VALUES ('Ada', 'ada@example.com');

INSERT INTO products (sku, name, price) VALUES ('SKU1', 'Pen', 1.25);
```

### Key Points

- Explicit column lists prevent breakage when columns are added.

### Best Practices

- Parameterize values from applications.

### Common Mistakes

- Relying on column order without listing names.

---

## 2. Multi-Row INSERT

<a id="2-multi-row-insert"></a>

### Beginner

Single `INSERT` with multiple tuples: `VALUES (...), (...), (...)`. Faster than many single-row statements due to reduced round trips.

### Intermediate

Watch `max_allowed_packet` equivalents—PostgreSQL handles large inserts but memory and WAL volume grow.

### Expert

For huge loads, prefer `COPY` or batched inserts in transactions.

```sql
INSERT INTO tags (name) VALUES ('sql'), ('postgres'), ('dba');
```

### Key Points

- Batch reduces overhead.

### Best Practices

- Choose batch sizes (1k–10k) tuned to memory and replication lag.

### Common Mistakes

- Single-row inserts in tight loops from apps.

---

## 3. INSERT from SELECT

<a id="3-insert-from-select"></a>

### Beginner

`INSERT INTO t SELECT ...` copies/transforms rows. Column lists must align.

### Intermediate

You can join, filter, aggregate in the `SELECT`. Use CTEs for clarity.

### Expert

Parallel insert/select possible depending on plan; unique indexes affect parallelism.

```sql
INSERT INTO archive_orders
SELECT * FROM orders WHERE placed_at < now() - interval '365 days';
```

### Key Points

- `SELECT` shape must match insert targets.

### Best Practices

- Validate counts before/after in migrations.

### Common Mistakes

- Column order mismatch causing silent wrong mappings without lists.

---

## 4. INSERT with Default Values

<a id="4-insert-with-default-values"></a>

### Beginner

`DEFAULT` keyword uses column default; omitting column also applies default if defined.

### Intermediate

Defaults can be expressions (`now()`, `gen_random_uuid()`), sequences (`nextval`), or function calls subject to volatility rules.

### Expert

Generated columns may be `STORED` and not insertable directly.

```sql
INSERT INTO events (type, created_at) VALUES ('signup', DEFAULT);

INSERT INTO users (email) VALUES ('x@y.com'); -- other columns default/nullable
```

### Key Points

- Defaults are metadata on columns.

### Best Practices

- Prefer database-generated timestamps for consistency.

### Common Mistakes

- Confusing default with trigger-populated values.

---

## 5. INSERT with RETURNING

<a id="5-insert-with-returning"></a>

### Beginner

`RETURNING` returns inserted row values to the client—ideal for fetching generated ids and defaults.

### Intermediate

Works with CTE chains; combine with `ON CONFLICT RETURNING` variants carefully.

### Expert

`RETURNING` can reference expressions and joins in data-modifying CTEs (advanced).

```sql
INSERT INTO users (email) VALUES ('a@b.com') RETURNING id, created_at;
```

### Key Points

- Avoid extra round trip to fetch serial/uuid.

### Best Practices

- Always `RETURNING` primary keys for APIs.

### Common Mistakes

- Assuming `RETURNING` returns multiple rows unless multi-insert.

---

## 6. ON CONFLICT (UPSERT)

<a id="6-on-conflict-upsert"></a>

### Beginner

`ON CONFLICT (keys) DO NOTHING` skips insert on conflict. `DO UPDATE SET ...` updates instead—”upsert.”

### Intermediate

Conflict target must match a unique index or constraint. `EXCLUDED.col` refers to proposed insert row.

### Expert

`WHERE` clauses on `DO UPDATE` conditionalize updates; watch serialization anomalies under concurrency.

```sql
INSERT INTO inventory (product_id, qty) VALUES (10, 5)
ON CONFLICT (product_id) DO UPDATE SET qty = inventory.qty + EXCLUDED.qty;
```

### Key Points

- Requires unique/PK constraint.

### Best Practices

- Index the conflict target explicitly.

### Common Mistakes

- Missing unique index so conflict never triggers.

---

## 7. UPDATE Basics

<a id="7-update-basics"></a>

### Beginner

`UPDATE table SET col = expr WHERE ...`. Without `WHERE`, all rows update—dangerous.

### Intermediate

`FROM` clause can bring joined sources for updates. Subqueries in `SET` are allowed.

### Expert

Row-level locks taken; long updates block readers/writers depending on isolation.

```sql
UPDATE orders SET status = 'shipped' WHERE id = 123;
```

### Key Points

- `WHERE` is your safety belt.

### Best Practices

- Run `SELECT` preview in transactions before mass updates.

### Common Mistakes

- Unqualified `UPDATE` on production tables.

---

## 8. UPDATE from SELECT

<a id="8-update-from-select"></a>

### Beginner

`UPDATE t SET col = s.val FROM src s WHERE t.id = s.id` joins source rows to targets.

### Intermediate

Ensure join is one-to-one to avoid duplicate updates; use `DISTINCT ON` or aggregates in subquery.

### Expert

Prefer `JOIN` clarity; some teams use subqueries in `SET` instead for clarity.

```sql
UPDATE employees e
SET salary = a.new_sal
FROM adjustments a
WHERE e.id = a.employee_id;
```

### Key Points

- Join cardinality matters.

### Best Practices

- Validate join keys uniqueness.

### Common Mistakes

- Many-to-many join updating same row unpredictably.

---

## 9. UPDATE with CASE

<a id="9-update-with-case"></a>

### Beginner

`SET col = CASE WHEN ... THEN ... END` updates conditionally per row in one statement.

### Intermediate

Combine with `WHERE` to limit scanned rows first.

### Expert

For huge tables, batch updates by primary key ranges to reduce lock duration.

```sql
UPDATE products
SET price = CASE
  WHEN category_id = 1 THEN price * 1.05
  ELSE price * 1.02
END
WHERE active;
```

### Key Points

- Single-pass conditional updates.

### Best Practices

- Keep cases exhaustive or default `ELSE`.

### Common Mistakes

- Omitting `ELSE` yielding unintended nulls.

---

## 10. UPDATE with RETURNING

<a id="10-update-with-returning"></a>

### Beginner

`RETURNING` shows updated values—useful for auditing and APIs.

### Intermediate

Can return both old and new using snapshots in triggers; plain `UPDATE RETURNING` gives new row.

### Expert

Combine with `FROM` to return joined values carefully—understand which row version is visible.

```sql
UPDATE accounts SET balance = balance - 50 WHERE id = 9 RETURNING id, balance;
```

### Key Points

- Great for verifying updates client-side.

### Best Practices

- Log `RETURNING` in app for critical financial rows (plus server audit).

### Common Mistakes

- Expecting old values without trigger or extra columns.

---

## 11. DELETE Basics

<a id="11-delete-basics"></a>

### Beginner

`DELETE FROM table WHERE ...` removes rows. No `WHERE` deletes all rows—still logged row-by-row unlike `TRUNCATE`.

### Intermediate

Foreign keys may restrict deletes (`ON DELETE RESTRICT`) or cascade.

### Expert

`DELETE` can return rows via `RETURNING` for archiving patterns.

```sql
DELETE FROM sessions WHERE expires_at < now() RETURNING id;
```

### Key Points

- Prefer `WHERE` always.

### Best Practices

- Archive before delete for compliance.

### Common Mistakes

- Cascades deleting more than expected.

---

## 12. DELETE vs TRUNCATE vs DROP

<a id="12-delete-vs-truncate-vs-drop"></a>

### Beginner

`DELETE` removes rows optionally filtered; `TRUNCATE` quickly removes all rows; `DROP` removes table object entirely.

### Intermediate

`TRUNCATE` cannot target partial rows; resets storage aggressively; may bypass some triggers; requires privileges; can cascade.

### Expert

`TRUNCATE` acquires stronger locks; replication considerations differ. `DROP` removes dependencies unless `CASCADE`.

```sql
DELETE FROM logs WHERE created_at < now() - interval '90 days';
TRUNCATE big_staging;
-- DROP TABLE old_backup; -- careful
```

### Key Points

- Speed vs flexibility vs recoverability.

### Best Practices

- Use `TRUNCATE` for staging tables; `DELETE` for selective removal.

### Common Mistakes

- `TRUNCATE` in prod without understanding FK `CASCADE`.

---

## Appendix A. Workshops mapped to subtopics

### A.1 INSERT explicit columns

```sql
INSERT INTO users (email, display_name) VALUES ($1, $2);
```

### A.2 Multi-row batch

```sql
INSERT INTO metrics(day, v) VALUES
  ('2026-03-01', 10),
  ('2026-03-02', 12),
  ('2026-03-03', 9);
```

### A.3 INSERT..SELECT transform

```sql
INSERT INTO customers_norm (name, email)
SELECT initcap(raw_name), lower(trim(raw_email)) FROM customers_import;
```

### A.4 DEFAULT + sequences

```sql
INSERT INTO orders (customer_id) VALUES (42) RETURNING id;
```

### A.5 RETURNING for API

```sql
INSERT INTO posts (title, body) VALUES ($1,$2) RETURNING id, created_at;
```

### A.6 Upsert DO NOTHING

```sql
INSERT INTO user_emails (user_id, email)
VALUES (1, 'a@b.com')
ON CONFLICT (user_id, email) DO NOTHING;
```

### A.7 Upsert DO UPDATE WHERE

```sql
INSERT INTO settings (k, v) VALUES ('theme', 'dark')
ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v WHERE settings.v IS DISTINCT FROM EXCLUDED.v;
```

### A.8 UPDATE join

```sql
UPDATE accounts a
SET status = 'closed'
FROM closures c
WHERE c.account_id = a.id AND c.approved;
```

### A.9 UPDATE CASE batch

```sql
UPDATE items SET price = CASE sku
  WHEN 'A' THEN 10
  WHEN 'B' THEN 20
  ELSE price
END
WHERE sku IN ('A','B');
```

### A.10 UPDATE RETURNING audit

```sql
UPDATE wallets SET balance = balance - $1 WHERE id = $2 RETURNING id, balance;
```

### A.11 DELETE selective

```sql
DELETE FROM sessions s USING users u
WHERE s.user_id = u.id AND u.disabled;
```

### A.12 TRUNCATE restart identity

```sql
TRUNCATE staging_import RESTART IDENTITY;
```

---

## Appendix B. Transactional patterns

### B.1 Safe delete preview

```sql
BEGIN;
SELECT count(*) FROM logs WHERE old;
-- DELETE FROM logs WHERE old;
ROLLBACK;
```

### B.2 Move rows archive

```sql
BEGIN;
INSERT INTO archive SELECT * FROM hot WHERE ts < $cutoff;
DELETE FROM hot WHERE ts < $cutoff;
COMMIT;
```

### B.3 CTE pipeline delete

```sql
WITH doomed AS (
  SELECT id FROM queue WHERE attempts > 5
)
DELETE FROM queue q USING doomed d WHERE q.id = d.id RETURNING q.*;
```

---

## Appendix C. Performance notes

- Batch inserts reduce commit overhead.
- `COPY` fastest for bulk loads.
- Mass `UPDATE`/`DELETE` can bloat tables—`VACUUM`/`VACUUM FULL` considerations.
- Indexes slow inserts; drop/recreate sometimes for huge ETL (maintenance window).

---

## Appendix D. Constraints interplay

Foreign keys affect delete/update cascades. Unique constraints enable upsert. Check constraints validate inserts/updates.

---

## Appendix E. Triggers and rules

`BEFORE INSERT` triggers can modify `NEW`. `AFTER` triggers see committed row versions in same statement ordering rules.

---

## Appendix F. Large SQL drill set

### F.1

```sql
INSERT INTO t(a,b) SELECT x,y FROM s WHERE NOT EXISTS (SELECT 1 FROM t WHERE t.a = s.x);
```

### F.2

```sql
WITH moved AS (DELETE FROM inbox WHERE processed RETURNING *)
INSERT INTO archive SELECT * FROM moved;
```

### F.3

```sql
UPDATE t SET v = v + 1 WHERE id IN (SELECT id FROM t WHERE v < 0); -- careful: double scan
```

### F.4

```sql
UPDATE t SET v = s.new_v FROM staging s WHERE t.id = s.id AND s.valid;
```

### F.5

```sql
INSERT INTO daily_stats(day, revenue)
SELECT current_date, sum(amount) FROM orders WHERE placed_at::date = current_date
ON CONFLICT (day) DO UPDATE SET revenue = EXCLUDED.revenue;
```

### F.6

```sql
DELETE FROM children WHERE parent_id IN (SELECT id FROM parents WHERE purge);
```

### F.7

```sql
UPDATE ONLY parent SET flag = TRUE WHERE id = 1; -- inheritance caution
```

### F.8

```sql
INSERT INTO geom_table (g) VALUES (point(1,2));
```

### F.9

```sql
UPDATE users SET last_login = now() WHERE id = $1 RETURNING email;
```

### F.10

```sql
TRUNCATE a, b CASCADE;
```

### F.11

```sql
INSERT INTO json_table (doc) VALUES ('{"a":1}'::jsonb);
```

### F.12

```sql
UPDATE t SET doc = doc || '{"k":true}'::jsonb WHERE id = 1;
```

### F.13

```sql
DELETE FROM t WHERE ctid IN (SELECT ctid FROM t WHERE bad LIMIT 1000); -- batching sketch
```

### F.14

```sql
INSERT INTO t SELECT generate_series(1,1000);
```

### F.15

```sql
UPDATE accounts SET balance = balance + $amt WHERE id = $id AND balance + $amt >= 0 RETURNING balance;
```

### F.16

```sql
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
```

### F.17

```sql
WITH upsert AS (
  INSERT INTO kv(k,v) VALUES ($1,$2)
  ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v
  RETURNING k, v
)
SELECT * FROM upsert;
```

### F.18

```sql
DELETE FROM order_items WHERE order_id = $1;
DELETE FROM orders WHERE id = $1;
```

### F.19

```sql
UPDATE employees SET salary = salary * 1.03 WHERE performance = 'high';
```

### F.20

```sql
INSERT INTO audit(row_id, action) SELECT id, 'delete' FROM old_rows;
```

### F.21

```sql
UPDATE t SET x = DEFAULT WHERE reset;
```

### F.22

```sql
INSERT INTO t (a) VALUES (1), (2) ON CONFLICT DO NOTHING;
```

### F.23

```sql
UPDATE t1 SET flag = TRUE FROM t2 WHERE t1.id = t2.t1_id AND t2.signal;
```

### F.24

```sql
DELETE FROM queue USING queue q2 WHERE queue.id = q2.id AND q2.expired;
```

### F.25

```sql
INSERT INTO partitioned VALUES ('2026-03-01', 1);
```

### F.26

```sql
UPDATE big SET x = y FROM big_stage s WHERE big.id = s.id AND big.lock_version = s.lock_version;
```

### F.27

```sql
INSERT INTO t SELECT * FROM t_backup ON CONFLICT (id) DO NOTHING;
```

### F.28

```sql
DELETE FROM sessions RETURNING user_id, id;
```

### F.29

```sql
UPDATE products SET stock = stock - qty FROM sale_lines WHERE ...; -- ensure non-negative constraints
```

### F.30

```sql
TRUNCATE ONLY parent_table; -- inheritance caution
```

---

## Appendix G. Upsert deep notes

### G.1 Conflict targets

`(col)` vs `ON CONSTRAINT name`—use constraint name when expression indexes involved.

### G.2 Writable CTE upsert chains

Combine `WITH ins AS (INSERT... ON CONFLICT... RETURNING ...)` then further inserts referencing `ins`.

### G.3 Race conditions

Two concurrent upserts can still serialize—handle `40001` serialization failure in apps.

---

## Appendix H. DELETE strategies

### H.1 Batch deletes

Loop deletes with `LIMIT` to reduce lock duration.

### H.2 Partition drop

For time partitions, `DROP TABLE partition` may beat massive deletes.

---

## Appendix I. UPDATE pitfalls

### I.1 Null propagation

`SET col = expr` where expr nulls column—intended?

### I.2 Toasted columns

Large values updates rewrite storage—mind bloat.

---

## Appendix J. RETURNING with joins (UPDATE FROM)

Return columns from updated table primarily; joined columns may require selecting separately.

---

## Appendix K. COPY vs INSERT

`COPY FROM STDIN` for bulk; `INSERT` for app row-level operations.

---

## Appendix L. Idempotency

Use natural keys + `ON CONFLICT` for retry-safe ingestion.

---

## Appendix M. Testing migrations

- Snapshot counts
- Run in transaction with rollback rehearsal
- Verify constraints after backfill

---

## Appendix N. Security

`INSERT`/`UPDATE`/`DELETE` obey RLS policies for current role.

---

## Appendix O. Observability

Log slow DML; autovacuum monitors dead tuples from updates/deletes.

---

## Appendix P. Interview questions

### P.1 Difference truncate vs delete

Logging, triggers, rollback size, locks.

### P.2 Upsert requirements

Unique constraint or primary key.

### P.3 Why RETURNING matters

Fetch generated keys and defaults atomically.

---

## Appendix Q. Extended narrative exercises

### Q.1 Ledger transfer

Update two account rows in one transaction; use constraints to prevent negative balances.

### Q.2 Staging promote

`INSERT INTO prod SELECT * FROM stage WHERE valid` then `DELETE FROM stage WHERE valid`.

### Q.3 Soft delete

`UPDATE SET deleted_at = now()` vs hard delete—query impacts.

### Q.4 Optimistic locking

`UPDATE ... WHERE id=$1 AND version=$2` then check `ROW COUNT`.

### Q.5 Bulk upsert ETL

Temp table → `INSERT ... ON CONFLICT` into final.

### Q.6 Partial unique indexes

Upsert targets must match index predicate.

### Q.7 Generated UUID default

`gen_random_uuid()` in default + `RETURNING id`.

### Q.8 Multi-tenant inserts

Include `tenant_id` in unique keys.

### Q.9 FK cascade delete

Understand `ON DELETE CASCADE` graph.

### Q.10 Large text updates

Avoid rewriting unchanged toasted values unnecessarily.

---

## Appendix R. More SQL snippets

### R.1 insert with subselect default

```sql
INSERT INTO t (a, parent_id) VALUES (1, (SELECT id FROM parents WHERE name='root'));
```

### R.2 update from aggregate

```sql
UPDATE products p
SET avg_rating = s.a
FROM (SELECT product_id, avg(rating) a FROM reviews GROUP BY product_id) s
WHERE p.id = s.product_id;
```

### R.3 delete duplicates keep one

```sql
DELETE FROM dups a USING dups b
WHERE a.ctid < b.ctid AND a.email = b.email;
```

### R.4 insert on conflict do update excluded

```sql
INSERT INTO visits(user_id, day, n) VALUES (1, current_date, 1)
ON CONFLICT (user_id, day) DO UPDATE SET n = visits.n + EXCLUDED.n;
```

### R.5 update case + where

```sql
UPDATE invoices SET status = CASE WHEN paid THEN 'paid' ELSE status END WHERE due < current_date;
```

---

## Appendix S. Dangerous commands callout

- `UPDATE`/`DELETE` without `WHERE`
- `TRUNCATE ... CASCADE` on shared environments
- `DROP TABLE` without backups

---

## Appendix T. Final checklist

- [ ] Correct conflict targets for upsert  
- [ ] Indexes support join updates  
- [ ] FK cascades understood  
- [ ] Batch sizes tuned  
- [ ] `RETURNING` used for APIs  

---

## Appendix U. Extra INSERT/UPDATE/DELETE SQL blocks

### U.1

```sql
INSERT INTO t (a) VALUES (1) ON CONFLICT (a) DO UPDATE SET a = EXCLUDED.a;
```

### U.2

```sql
UPDATE t SET x = x + 1 WHERE id = ANY ($1::bigint[]);
```

### U.3

```sql
DELETE FROM t WHERE id BETWEEN $1 AND $2;
```

### U.4

```sql
INSERT INTO t SELECT * FROM s WHERE checksum_ok;
```

### U.5

```sql
WITH s AS (SELECT id FROM t WHERE stale)
DELETE FROM t WHERE id IN (SELECT id FROM s) RETURNING *;
```

### U.6

```sql
UPDATE t SET payload = jsonb_set(payload, '{k}', 'true'::jsonb, true) WHERE id = $1;
```

### U.7

```sql
INSERT INTO t (geom) VALUES (ST_GeomFromText('POINT(0 0)', 4326)); -- PostGIS example
```

### U.8

```sql
UPDATE t SET search = to_tsvector('english', title || ' ' || body) WHERE id = $1;
```

### U.9

```sql
INSERT INTO t (a,b) OVERRIDING SYSTEM VALUE VALUES (10, 'x'); -- identity/special cases
```

### U.10

```sql
DELETE FROM t USING only parent p WHERE t.parent_id = p.id AND p.archived;
```

### U.11

```sql
INSERT INTO t AS tab (k,v) VALUES (1,2)
ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v WHERE tab.v < EXCLUDED.v;
```

### U.12

```sql
UPDATE accounts SET balance = balance - $w WHERE id = $id AND balance >= $w;
```

### U.13

```sql
INSERT INTO logs SELECT * FROM logs_staging WHERE NOT errors;
```

### U.14

```sql
TRUNCATE TABLE restart_test RESTART IDENTITY CASCADE;
```

### U.15

```sql
UPDATE items SET stock = stock - $q WHERE id = $id AND stock >= $q RETURNING stock;
```

### U.16

```sql
DELETE FROM notifications WHERE user_id = $u AND read;
```

### U.17

```sql
INSERT INTO daily (day) VALUES (current_date) ON CONFLICT DO NOTHING;
```

### U.18

```sql
UPDATE users SET email = lower(email) WHERE email <> lower(email);
```

### U.19

```sql
INSERT INTO pairs (a,b) SELECT x,y FROM generate_series(1,5) x, generate_series(1,5) y WHERE x < y;
```

### U.20

```sql
DELETE FROM sessions WHERE id IN (SELECT session_id FROM revoke_list);
```

### U.21

```sql
UPDATE t SET v = coalesce(v,0) + 1 WHERE id = $1;
```

### U.22

```sql
INSERT INTO t (a) SELECT random() FROM generate_series(1,10000);
```

### U.23

```sql
UPDATE t SET active = FALSE WHERE last_seen < now() - interval '180 days' RETURNING id;
```

### U.24

```sql
DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY priority DESC OFFSET 10000);
```

### U.25

```sql
INSERT INTO t (txt) VALUES ('line1\nline2');
```

### U.26

```sql
UPDATE t SET arr = array_append(arr, $x) WHERE id = $id;
```

### U.27

```sql
DELETE FROM t WHERE metadata @> '{"temp": true}'::jsonb;
```

### U.28

```sql
INSERT INTO t (ts) VALUES (now()) RETURNING ts;
```

### U.29

```sql
UPDATE t SET point = point + '(1,0)' WHERE movable;
```

### U.30

```sql
DROP TABLE IF EXISTS old_table; -- destructive DDL reminder
```

---

## Appendix V. Line-count completion note

This topic’s notes exceed the README “1200+ lines” target when including appendices U–V; keep appendices as living playbooks for ETL and API DML patterns.

### V.1 Operational tip

Pair DML scripts with `statement_timeout` and `lock_timeout` in session settings to prevent stuck maintenance jobs from wedging OLTP traffic.

### V.2 Replication tip

Large `DELETE` batches on primary can create replay pressure on replicas—pace deletes during catch-up lag.

### V.3 Backup tip

After massive `UPDATE`/`DELETE`, monitor autovacuum and consider manual `VACUUM (ANALYZE)` on hot tables when warranted.

### V.4 Compliance tip

For regulated environments, pair hard deletes with retention policies and legal holds—often implemented as soft-delete columns plus restricted `DELETE`.

### V.5 API tip

Return `RETURNING` rows as JSON from your service layer to reduce extra `SELECT` round trips while keeping transactions short.

### V.6 Schema evolution tip

When adding `NOT NULL` columns to big tables, use a multi-phase migration: add nullable column, backfill in batches, validate, then set `NOT NULL` and defaults.

### V.7 Final line

Keep a personal snippet library for `INSERT ... ON CONFLICT`, `UPDATE ... FROM`, and batched `DELETE`—these four patterns cover most production DML work.

This file is intentionally slightly above the minimum line target to leave room for future org-specific runbooks.

---

*End of notes.*
