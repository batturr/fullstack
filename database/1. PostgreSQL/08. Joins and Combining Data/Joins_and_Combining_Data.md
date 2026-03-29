# Joins & Combining Data

**PostgreSQL learning notes (March 2026). Aligned with README topic 8.**

---

## 📑 Table of Contents

- [1. INNER JOIN](#1-inner-join)
- [2. LEFT JOIN / LEFT OUTER JOIN](#2-left-join--left-outer-join)
- [3. RIGHT JOIN / RIGHT OUTER JOIN](#3-right-join--right-outer-join)
- [4. FULL OUTER JOIN](#4-full-outer-join)
- [5. CROSS JOIN](#5-cross-join)
- [6. Self-Join](#6-self-join)
- [7. Natural Join](#7-natural-join)
- [8. Join Conditions (ON, USING, Complex)](#8-join-conditions-on-using-complex)
- [9. Multiple Table Joins](#9-multiple-table-joins)
- [10. Join Performance (Hash, Nested Loop, Merge)](#10-join-performance-hash-nested-loop-merge)
- [11. UNION & UNION ALL](#11-union--union-all)
- [12. INTERSECT & EXCEPT](#12-intersect--except)
- [13. Complex Join Queries](#13-complex-join-queries)
- [14. Join Optimization (Lateral Joins, Index Usage)](#14-join-optimization-lateral-joins-index-usage)

---

## 1. INNER JOIN

<a id="1-inner-join"></a>

### Beginner

`INNER JOIN` returns only rows where the join condition matches in both tables. Unmatched rows from either side disappear from the result. This is the default join people mean when they say “join two tables.”

### Intermediate

Join conditions usually equate foreign keys: `FROM orders o JOIN customers c ON c.id = o.customer_id`. You can join on expressions, but indexability matters. Multiple `INNER JOIN`s chain left-to-right conceptually; the planner picks an order.

### Expert

For inner joins, placing filters in `ON` vs `WHERE` is often equivalent, but style guides differ. With outer joins, placement matters critically (see LEFT JOIN). Semi-join patterns can sometimes replace joins to distinct parent rows.

```sql
SELECT o.id, o.placed_at, c.name
FROM orders o
INNER JOIN customers c ON c.id = o.customer_id
WHERE o.placed_at >= date '2026-01-01';

SELECT p.name, c.name AS category
FROM products p
JOIN categories c ON c.id = p.category_id;
```

### Key Points

- Inner join = intersection of matching keys.
- Duplicate keys on either side multiply rows (fan-out).

### Best Practices

- Index foreign keys used in join predicates.
- Prefer explicit `INNER JOIN` for readability.

### Common Mistakes

- Forgetting join predicates and creating accidental cross products.
- Joining on wrong columns (similar names, wrong FK).

---

## 2. LEFT JOIN / LEFT OUTER JOIN

<a id="2-left-join--left-outer-join"></a>

### Beginner

`LEFT JOIN` keeps every row from the left table. When no match exists on the right, right-side columns come back as `NULL`. Use this for optional relationships (“customers and their latest order, if any”).

### Intermediate

Filters on the right table belong in the `ON` clause if you want to preserve left rows; putting them in `WHERE` can convert the join to an inner join effect (`WHERE right.id IS NOT NULL`).

### Expert

Null-intolerant predicates on outer-joined tables are a classic correctness bug. Use `COUNT(inner.col)` vs `COUNT(*)` carefully when counting matches.

```sql
SELECT c.id, c.name, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;

SELECT c.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.placed_at >= date '2026-01-01'
WHERE o.id IS NULL; -- customers with no qualifying orders in 2026
```

### Key Points

- Left preserve, right optional.
- `WHERE` vs `ON` changes semantics for outer joins.

### Best Practices

- Be explicit about whether you want “no match” or “match filtered out.”
- Use `NOT EXISTS` when testing absence; sometimes clearer than `LEFT JOIN ... IS NULL`.

### Common Mistakes

- Filtering outer-joined tables in `WHERE` unintentionally.

---

## 3. RIGHT JOIN / RIGHT OUTER JOIN

<a id="3-right-join--right-outer-join"></a>

### Beginner

`RIGHT JOIN` mirrors `LEFT JOIN` but preserves the right-hand side. Many teams rewrite `RIGHT JOIN` as `LEFT JOIN` by swapping table order for consistent reading.

### Intermediate

Consistency matters more than correctness here—choose one style across a codebase. Some generated SQL emits `RIGHT JOIN`; learn to read it.

### Expert

Optimizer treats inner joins symmetrically; outer joins are not symmetric. Rewriting right to left does not change results if you swap roles carefully.

```sql
SELECT c.name, o.id
FROM orders o
RIGHT JOIN customers c ON c.id = o.customer_id;
```

### Key Points

- `A RIGHT JOIN B` ≡ `B LEFT JOIN A` with columns swapped conceptually.

### Best Practices

- Prefer left joins for uniformity unless tooling emits otherwise.

### Common Mistakes

- Mixing left and right joins in one query without clear commentary—hard to read.

---

## 4. FULL OUTER JOIN

<a id="4-full-outer-join"></a>

### Beginner

`FULL OUTER JOIN` returns matches plus unmatched rows from both sides, filling nulls for the non-matching side. Useful for diffs: “in A but not B” and “in B but not A” in one pass.

### Intermediate

Often combined with `WHERE a.key IS NULL OR b.key IS NULL` to isolate mismatches. For large tables, full joins can be expensive; anti-join patterns sometimes win.

### Expert

Execution may require hashing both inputs or combining left/right outer plans. Statistics on join keys matter.

```sql
SELECT coalesce(a.id, b.id) AS id, a.payload AS a_payload, b.payload AS b_payload
FROM table_a a
FULL OUTER JOIN table_b b ON a.id = b.id;
```

### Key Points

- Preserves both sides’ non-matches.
- `coalesce` helps build unified keys in diffs.

### Best Practices

- Consider `UNION ALL` of anti-joins when full join cardinality explodes.

### Common Mistakes

- Expecting full join to dedupe rows without understanding key uniqueness.

---

## 5. CROSS JOIN

<a id="5-cross-join"></a>

### Beginner

`CROSS JOIN` is the Cartesian product: every left row pairs with every right row. Rare in business queries except small dimension tables (all colors × all sizes).

### Intermediate

Comma-separated `FROM a, b` without `WHERE` is an implicit cross join—avoid. Prefer explicit `CROSS JOIN` to signal intent.

### Expert

`CROSS JOIN LATERAL` with a limiting subquery can be intentional; bare cross joins on large tables risk runaway memory.

```sql
SELECT d.day, s.store_id
FROM generate_series(date '2026-03-01', date '2026-03-07', interval '1 day') AS d(day)
CROSS JOIN stores s;
```

### Key Points

- Cardinality multiplies: |A|×|B| rows.

### Best Practices

- Only cross join small sets, or add predicates immediately.

### Common Mistakes

- Accidental cross products from missing join clause.

---

## 6. Self-Join

<a id="6-self-join"></a>

### Beginner

Join a table to itself with aliases (`employees e1 JOIN employees e2`). Common for manager/employee relationships or pairing rows.

### Intermediate

Ensure join predicates relate the correct roles (`e1.manager_id = e2.id`). Indexes on `manager_id` help.

### Expert

Graph-like traversals deeper than one hop often need recursive CTEs instead of chained self-joins.

```sql
SELECT e.first_name || ' ' || e.last_name AS employee,
       m.first_name || ' ' || m.last_name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

### Key Points

- Aliases are mandatory for self-join readability.

### Best Practices

- Name aliases by role (`emp`, `mgr`).

### Common Mistakes

- Forgetting aliases causes ambiguous column errors or wrong joins.

---

## 7. Natural JOIN

<a id="7-natural-join"></a>

### Beginner

`NATURAL JOIN` joins tables on all columns with the same names. It saves typing but hides join keys—generally discouraged in production schemas.

### Intermediate

Renaming columns breaks `NATURAL JOIN` silently in subtle ways. Prefer explicit `USING` or `ON`.

### Expert

`NATURAL` can collide unexpectedly when views add columns. It also interacts oddly with inheritance and `SELECT *` expansion.

```sql
-- Illustration only (avoid in production)
SELECT *
FROM sales NATURAL JOIN regions;
```

### Key Points

- Implicit join keys = maintenance hazard.

### Best Practices

- Avoid `NATURAL JOIN` in application SQL.

### Common Mistakes

- Assuming only one pair of matching column names exists.

---

## 8. Join Conditions (ON, USING, Complex)

<a id="8-join-conditions-on-using-complex"></a>

### Beginner

`ON` takes arbitrary boolean expressions. `USING (col)` is shorthand when both sides share `col` name and equality is intended: `JOIN b USING (customer_id)`.

### Intermediate

Non-equi joins (`ON a.start < b.end AND a.end > b.start`) express range overlaps. Multiple predicates combine with `AND`.

### Expert

Null-safe joins may need `IS NOT DISTINCT FROM` in `ON`. For time ranges, half-open intervals reduce edge bugs.

```sql
SELECT *
FROM reservations r
JOIN rooms rm ON rm.id = r.room_id
WHERE r.during && rm.available_range; -- range types example sketch

SELECT *
FROM assignments a
JOIN shifts s ON a.employee_id = s.employee_id AND a.work_date = s.work_date;
```

### Key Points

- `USING` projects one copy of the join column.
- Complex `ON` predicates are still sargable per operand.

### Best Practices

- Prefer `ON` for clarity when names differ or predicates are non-trivial.

### Common Mistakes

- Using `=` instead of null-safe operators when null keys must match null keys.

---

## 9. Multiple Table Joins

<a id="9-multiple-table-joins"></a>

### Beginner

Chain joins: `FROM a JOIN b ON ... JOIN c ON ...`. Each new join can reference prior tables in its `ON` clause.

### Intermediate

Parent-child-grandchild joins fan out if child tables are one-to-many. Aggregate early in CTEs to control cardinality.

### Expert

Join order is optimizer-chosen; statistics and selectivity drive bushy vs left-deep plans. Star schema queries benefit from fact table selective filters first.

```sql
SELECT o.id, c.name, p.name AS product
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.placed_at >= now() - interval '7 days';
```

### Key Points

- Cardinality multiplies through one-to-many links.

### Best Practices

- Filter early; reduce rows before heavy joins.
- Document assumed cardinality (1:1 vs 1:N).

### Common Mistakes

- Joining facts before filtering, exploding intermediate row counts.

---

## 10. Join Performance (Hash, Nested Loop, Merge)

<a id="10-join-performance-hash-nested-loop-merge"></a>

### Beginner

PostgreSQL joins via nested loop (row-by-row probe), hash join (build hash table on one side), or merge join (sorted inputs). `EXPLAIN` shows which.

### Intermediate

Small tables often nested-loop; large equi-joins hash; pre-sorted inputs merge. `work_mem` bounds hash tables—spills to disk if exceeded.

### Expert

Enable/disable strategies with `SET enable_hashjoin = off` only for debugging, not production. Parallel hash joins appear for large equi-joins.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.placed_at >= date '2026-01-01';
```

### Key Points

- Indexes support nested loops and merge joins.
- Statistics must reflect data skew.

### Best Practices

- Index join keys and filter columns.
- Use `ANALYZE` after bulk loads.

### Common Mistakes

- Assuming join order in SQL text matches execution.

---

## 11. UNION & UNION ALL

<a id="11-union--union-all"></a>

### Beginner

`UNION` concatenates query results and removes duplicates. `UNION ALL` keeps duplicates and is faster.

### Intermediate

Column counts/types must align. `ORDER BY` applies to the combined result and usually references output column names from the first branch.

### Expert

Duplicate removal may sort/hash large sets. Prefer `UNION ALL` with upstream uniqueness guarantees.

```sql
SELECT id, email, 'users' AS src FROM users
UNION ALL
SELECT id, email, 'legacy' FROM legacy_users;
```

### Key Points

- Set ops are vertical combines, unlike joins.

### Best Practices

- Default to `UNION ALL` unless dedupe is required.

### Common Mistakes

- Type mismatches between branches.

---

## 12. INTERSECT & EXCEPT

<a id="12-intersect--except"></a>

### Beginner

`INTERSECT` returns rows present in both queries. `EXCEPT` returns rows in the first not in the second. Null-aware equality rules apply.

### Intermediate

Rewriting with joins/anti-joins can be faster and clearer (`INNER JOIN` on keys vs `INTERSECT` on wide rows).

### Expert

`EXCEPT` is not always the best anti-join under nulls—compare with `NOT EXISTS`.

```sql
SELECT product_id FROM warehouse_a
INTERSECT
SELECT product_id FROM warehouse_b;

SELECT email FROM subscribers
EXCEPT
SELECT email FROM bounces;
```

### Key Points

- `INTERSECT`/`EXCEPT` dedupe like `DISTINCT` semantics in combination.

### Best Practices

- Prefer semi/anti joins for keyed relationships.

### Common Mistakes

- Using wide `INTERSECT` when only keys should match.

---

## 13. Complex Join Queries

<a id="13-complex-join-queries"></a>

### Beginner

Mixing join types is normal: `FROM a LEFT JOIN b ... JOIN c ...` requires understanding which join sees which null-extended rows.

### Intermediate

Use CTEs to stage joins and aggregates. `OR` join conditions often hurt index use—consider rewriting to `UNION ALL` of simpler joins.

### Expert

Outer join reordering is limited; planner constraints differ from inner joins. Check plans when refactoring outer join chains.

```sql
WITH recent AS (
  SELECT * FROM orders WHERE placed_at >= now() - interval '30 days'
)
SELECT c.name, count(o.id) AS n_orders, sum(oi.qty) AS items
FROM customers c
LEFT JOIN recent o ON o.customer_id = c.id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id, c.name;
```

### Key Points

- Break complex joins into named stages for readability.

### Best Practices

- Test with nulls and empty tables.

### Common Mistakes

- Aggregating across outer joins without grasping null multiplication.

---

## 14. Join Optimization (Lateral Joins, Index Usage)

<a id="14-join-optimization-lateral-joins-index-usage"></a>

### Beginner

Indexes on join columns let PostgreSQL probe efficiently. Foreign keys should be indexed (Postgres does not auto-index FK on referencing side).

### Intermediate

`LATERAL` subqueries can replace correlated subqueries for top-N per key. Combine with `ORDER BY ... LIMIT` inside lateral for index-friendly patterns.

### Expert

Partial indexes can accelerate joins on hot subsets. Join elimination relies on uniqueness constraints and foreign keys.

```sql
SELECT u.id, lp.last_order_id
FROM users u
LEFT JOIN LATERAL (
  SELECT id AS last_order_id
  FROM orders o
  WHERE o.user_id = u.id
  ORDER BY placed_at DESC, id DESC
  FETCH FIRST 1 ROW ONLY
) lp ON TRUE;
```

### Key Points

- Index the referencing side of FK joins.
- Lateral + limit exploits indexes per outer row.

### Best Practices

- Verify plans after schema changes.
- Keep statistics fresh on joined columns.

### Common Mistakes

- Missing indexes on join keys (especially FK columns).
- Using lateral without supporting sort/limit indexes on big tables.

---

## Appendix A. Join workshops (one per subtopic)

> Each block adds scenario notes, extra SQL, and a short checklist. Run against sample schemas with realistic cardinalities.

### A.1 INNER JOIN — fan-out drill

When joining `orders` to `order_items`, expect one order to produce many rows. Aggregate before joining back to customers if you need one row per customer.

```sql
SELECT o.customer_id, sum(oi.qty * oi.unit_price) AS order_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.customer_id;
```

Checklist: confirm uniqueness assumptions; use `EXPLAIN` to see join width.

### A.2 LEFT JOIN — ON vs WHERE

```sql
SELECT c.id, o.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.placed_at >= date '2026-01-01'
WHERE c.country = 'US';
```

Checklist: decide whether filters belong in `ON` (preserve outer rows) vs `WHERE`.

### A.3 RIGHT JOIN rewrite

```sql
-- Prefer this
SELECT c.name, o.id
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id;

-- Instead of RIGHT JOIN customers c ... (when possible)
```

### A.4 FULL OUTER diff

```sql
SELECT *
FROM invoices i
FULL OUTER JOIN payments p ON p.invoice_id = i.id
WHERE i.id IS NULL OR p.id IS NULL;
```

### A.5 CROSS JOIN calendar

```sql
SELECT s.id AS store_id, d.day
FROM stores s
CROSS JOIN generate_series(date '2026-03-01', date '2026-03-31', interval '1 day') AS d(day);
```

### A.6 Self-join pairing

```sql
SELECT a.id, b.id AS peer_id
FROM nodes a
JOIN nodes b ON b.group_id = a.group_id AND b.id > a.id;
```

### A.7 NATURAL JOIN caution

Document why teams ban `NATURAL JOIN`: silent coupling to column names.

### A.8 USING vs ON

```sql
SELECT *
FROM a JOIN b USING (id);
```

### A.9 Multi-join cardinality

Sketch a join graph on paper: 1:N edges multiply rows.

### A.10 Plan shapes

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM fact f
JOIN dim d ON d.id = f.dim_id
WHERE f.ts >= timestamptz '2026-01-01';
```

### A.11 UNION ALL ETL

```sql
SELECT * FROM staging_202601
UNION ALL
SELECT * FROM staging_202602;
```

### A.12 INTERSECT vs INNER JOIN

Prefer `JOIN` on keys instead of intersecting wide rows.

### A.13 Complex outer + inner

Stage with CTE to keep null semantics testable.

### A.14 Lateral top-N index pattern

Ensure `(user_id, placed_at DESC, id DESC)` index exists for lateral order/limit inside `orders`.

---

## Appendix B. Join recipes

### B.1 Latest row per key (left join lateral)

```sql
SELECT d.id, lp.payload
FROM devices d
LEFT JOIN LATERAL (
  SELECT payload
  FROM readings r
  WHERE r.device_id = d.id
  ORDER BY r.ts DESC
  FETCH FIRST 1 ROW ONLY
) lp ON TRUE;
```

### B.2 Exclude customers with any open ticket (NOT EXISTS)

```sql
SELECT c.*
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM tickets t WHERE t.customer_id = c.id AND t.status = 'open'
);
```

### B.3 At least one paid order (EXISTS)

```sql
SELECT c.*
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid'
);
```

### B.4 Join + dedupe with DISTINCT ON

```sql
SELECT DISTINCT ON (o.customer_id) o.customer_id, o.id AS latest_order_id, o.placed_at
FROM orders o
ORDER BY o.customer_id, o.placed_at DESC, o.id DESC;
```

### B.5 Anti-join for missing FK targets

```sql
SELECT oi.*
FROM order_items oi
LEFT JOIN products p ON p.id = oi.product_id
WHERE p.id IS NULL;
```

### B.6 Range overlap join

```sql
SELECT r.id, b.id
FROM reservations r
JOIN bookings b
  ON r.room_id = b.room_id
 AND r.during && b.during;
```

### B.7 Many-to-many through bridge

```sql
SELECT u.name, r.name
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id;
```

### B.8 Conditional join path (two left joins + coalesce)

```sql
SELECT a.id, coalesce(b1.val, b2.val) AS val
FROM a
LEFT JOIN b1 ON b1.a_id = a.id AND a.kind = 'x'
LEFT JOIN b2 ON b2.a_id = a.id AND a.kind = 'y';
```

---

## Appendix C. Debugging join explosions

### C.1 Count rows per stage

```sql
SELECT count(*) FROM orders;
SELECT count(*) FROM orders o JOIN order_items i ON i.order_id = o.id;
```

### C.2 Distinct key checks

```sql
SELECT customer_id, count(*) FROM orders GROUP BY 1 HAVING count(*) > 1000;
```

### C.3 Nullable join keys

Expect unexpected fan-out or dropped rows when keys are null.

---

## Appendix D. Planner notes (hash / merge / nested loop)

Nested loops shine when the outer side is tiny or inner side is index-backed. Hash joins handle large equi-joins. Merge joins need sorted inputs—sometimes from indexes.

Avoid “hinting” by disabling join types in production; fix statistics and indexes instead.

---

## Appendix E. Style and review checklist

- Name aliases for roles, not single letters in large queries.
- One join condition per line in code review.
- Verify every outer join with tests for “no match” cases.

---

## Appendix F. Extended SQL join drills

### F.1 Semi-join with IN vs EXISTS

```sql
-- EXISTS is usually clearer for existence checks
SELECT *
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

### F.2 Anti-join three ways

```sql
-- LEFT JOIN null test
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- NOT EXISTS
SELECT c.*
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- EXCEPT on keys
SELECT id FROM customers
EXCEPT
SELECT customer_id FROM orders;
```

### F.3 Join order illustration (logical vs physical)

SQL text order ≠ execution order. Trust `EXPLAIN`, not intuition.

### F.4 Partial outer join via aggregation

```sql
SELECT c.id, count(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;
```

### F.5 Double join same table (aliases)

```sql
SELECT a.city AS from_city, b.city AS to_city, r.distance_km
FROM routes r
JOIN cities a ON a.id = r.from_city_id
JOIN cities b ON b.id = r.to_city_id;
```

### F.6 Joining on expressions (functional)

```sql
SELECT *
FROM users u
JOIN domains d ON split_part(u.email, '@', 2) = d.name;
-- Consider storing domain_id or indexing expression if hot.
```

### F.7 Partition-wise join (partitioned tables)

When both sides partition on join key, partition pruning can enable partition-wise joins—verify with `EXPLAIN`.

### F.8 Star schema join

```sql
SELECT dt.d_date, p.brand, sum(f.sales_amount) AS revenue
FROM fact_sales f
JOIN dim_date dt ON dt.d_date_key = f.d_date_key
JOIN dim_product p ON p.d_product_key = f.d_product_key
GROUP BY 1, 2;
```

### F.9 Chaining many left joins

Each step can introduce nulls—test final `WHERE` carefully.

### F.10 Replace OR join with UNION ALL

```sql
SELECT a.id, b.id
FROM a JOIN b ON a.x = b.x
UNION ALL
SELECT a.id, b.id
FROM a JOIN b ON a.y = b.y;
```

---

## Appendix G. Interview / practical scenarios

### G.1 Find orphan rows

```sql
SELECT oi.*
FROM order_items oi
LEFT JOIN orders o ON o.id = oi.order_id
WHERE o.id IS NULL;
```

### G.2 Customers with first order in last 30 days

```sql
SELECT c.*
FROM customers c
JOIN LATERAL (
  SELECT min(placed_at) AS first_at
  FROM orders o
  WHERE o.customer_id = c.id
) f ON TRUE
WHERE f.first_at >= now() - interval '30 days';
```

### G.3 Employees earning more than their manager (self-join)

```sql
SELECT e.id
FROM employees e
JOIN employees m ON m.id = e.manager_id
WHERE e.salary > m.salary;
```

### G.4 Match products bought together (self-join on order)

```sql
SELECT oi1.product_id AS p1, oi2.product_id AS p2, count(*) AS times
FROM order_items oi1
JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id < oi2.product_id
GROUP BY 1, 2
ORDER BY times DESC
LIMIT 20;
```

---

## Appendix H. Combining data without joins

Sometimes `UNION ALL` plus grouping beats wide joins when sources are heterogeneous but structurally aligned.

```sql
SELECT date, 'mobile' AS channel, revenue FROM mobile_daily
UNION ALL
SELECT date, 'web' AS channel, revenue FROM web_daily;
```

---

## Appendix I. Foreign key indexing policy

Create indexes on referencing columns (`orders.customer_id`) even though PostgreSQL does not require them for correctness—join and delete performance usually demands it.

---

## Appendix J. Read-only replica joins

On replicas, long join queries are fine for reporting; still avoid Cartesian products that swamp memory. Use `statement_timeout` guardrails.

---

## Appendix K. Additional mini exercises

### K.1 One-to-one optional extension table

```sql
SELECT u.*, p.bio
FROM users u
LEFT JOIN user_profiles p ON p.user_id = u.id;
```

### K.2 Soft-delete aware joins

```sql
SELECT o.*
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE NOT c.deleted AND NOT o.deleted;
```

### K.3 Join through time (SCD type-2 sketch)

Join facts to dimension rows valid for `fact_date` using range predicates—often non-equi joins.

### K.4 Join visibility with security barriers

Row-level security applies per table; joins still enforce policies independently—test combined results per role.

### K.5 Join cardinalities cheat sheet

- 1:1 — rare; enforce with unique constraints on both sides.
- 1:N — typical parent/child.
- M:N — bridge table required.

### K.6 Use of parentheses in `ON`

```sql
SELECT *
FROM a
JOIN b ON (a.x = b.x OR a.y = b.y) AND a.kind = b.kind;
```

### K.7 `JOIN LATERAL` with guard flag

```sql
SELECT t.id, s.val
FROM tasks t
LEFT JOIN LATERAL (
  SELECT val FROM task_steps s WHERE s.task_id = t.id ORDER BY s.step_no LIMIT 1
) s ON TRUE;
```

### K.8 Combine join + window without collapsing detail

```sql
SELECT o.*, sum(oi.qty) OVER (PARTITION BY o.id) AS items_in_order
FROM orders o
JOIN order_items oi ON oi.order_id = o.id;
```

### K.9 Join elimination opportunity

If you select only from `orders` but join `customers` solely to filter on `customers.country`, consider `WHERE customer_id IN (...)` or semi-join that can be optimized away when constraints exist.

### K.10 Document assumed uniqueness in views

```sql
CREATE VIEW order_totals AS
SELECT o.id, sum(oi.qty * oi.unit_price) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;
```

---

## Appendix L. Deep-dive notes (join semantics)

### L.1 Associativity and outer joins

Inner joins associate freely; outer joins do not. Reordering outer joins can change results unless equivalences hold.

### L.2 Null columns from outer joins in aggregates

`count(*)` counts rows; `count(foreign_col)` counts non-null matches—critical difference after `LEFT JOIN`.

### L.3 Duplicate elimination in set operations

`UNION` sorts/hashes for dedupe; know your row width cost.

### L.4 Join + group-by correctness

Every non-aggregated selected column must be functionally dependent on group keys—prefer grouping by primary keys.

### L.5 Join filters and selective estimates

Stale statistics can make nested loops look cheaper than hash joins incorrectly—refresh stats after bulk changes.

### L.6 Joining JSON keys (sketch)

```sql
SELECT u.id, j.elem
FROM users u
JOIN LATERAL jsonb_array_elements(u.badges) AS j(elem) ON TRUE;
```

### L.7 Joining arrays (unnest)

```sql
SELECT u.id, x.tag
FROM users u
JOIN LATERAL unnest(u.tags) AS x(tag) ON TRUE;
```

### L.8 Joining geospatial (conceptual)

PostGIS joins often use `ST_Intersects`/`ST_DWithin` in `ON`—index with GiST.

### L.9 Joining text fuzzy (pg_trgm)

Similarity joins are expensive; prefilter with `%` operator when possible.

### L.10 Joining partitioned tables

Ensure partition keys appear in predicates so pruning happens before join.

### L.11 Joining materialized views

Refresh cadence defines staleness; join MVs like tables but document lag.

### L.12 Joining CTEs (optimization)

PostgreSQL 12+ may inline CTEs; older versions might materialize—check plans if performance regresses.

### L.13 Joining with DISTINCT ON

Sometimes replace join explosion with `DISTINCT ON` subquery feeding a smaller join.

### L.14 Joining security definer views

Know whose privileges execute—joining views can hide row filters; test as real roles.

### L.15 Joining across schemas

Qualify names (`sales.orders`) to avoid `search_path` surprises.

### L.16 Joining with enums

Cast consistently; mismatched enum types require explicit casts.

### L.17 Joining UUID vs text keys

Avoid implicit casts; compare types directly.

### L.18 Joining on composite keys

```sql
SELECT *
FROM a
JOIN b ON (a.x, a.y) = (b.x, b.y);
```

### L.19 Joining with generated columns

Join keys can be stored generated columns to make expressions indexable.

### L.20 Joining read models

CQRS read models denormalize to reduce joins—trade storage for latency.

### L.21 Joining in BI tools

Push joins to SQL when possible; avoid client-side merges of huge extracts.

### L.22 Joining streaming + batch (pattern)

Use staging tables and `JOIN` in SQL rather than dual cursors in app code when feasible.

### L.23 Joining with sampling

```sql
SELECT *
FROM big_a TABLESAMPLE BERNOULLI (1)
JOIN big_b USING (id);
```

### L.24 Joining under heavy updates

Long transactions + joins can block—keep reporting queries snapshot-friendly with `REPEATABLE READ` only when needed.

### L.25 Join documentation template

Document for each join edge: cardinality, nullability, indexes, expected row multiplier.

---

## Appendix M. Copy/paste join patterns (extra SQL)

### M.1 Inner join with nullable FK guarded

```sql
SELECT o.*
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.customer_id IS NOT NULL;
```

### M.2 Left join + aggregate without losing customers

```sql
SELECT c.id, coalesce(sum(o.amount), 0) AS spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
GROUP BY c.id;
```

### M.3 Full outer on keys with coalesce

```sql
SELECT coalesce(a.k, b.k) AS k, a.v AS a_v, b.v AS b_v
FROM a
FULL OUTER JOIN b ON a.k = b.k;
```

### M.4 Join + filter pushdown

```sql
SELECT *
FROM big_fact f
JOIN dim_date d ON d.d_date_key = f.d_date_key
WHERE d.d_date >= date '2026-01-01';
```

### M.5 Join elimination check

If unique constraint proves at most one match, planner may skip joins—verify with `EXPLAIN`.

### M.6 Join on boolean flags (sparse)

```sql
SELECT *
FROM events e
JOIN rare_flags rf ON rf.event_id = e.id AND rf.is_vip;
```

### M.7 Join two facts through bridge

```sql
SELECT f1.id, f2.id
FROM fact_a f1
JOIN bridge b ON b.a_id = f1.id
JOIN fact_c f2 ON f2.id = b.c_id;
```

### M.8 Join with `USING` + renaming

```sql
SELECT *
FROM a JOIN b USING (id);
```

### M.9 Join + window to flag first purchase

```sql
WITH x AS (
  SELECT o.*, row_number() OVER (PARTITION BY customer_id ORDER BY placed_at, id) AS rn
  FROM orders o
)
SELECT * FROM x JOIN customers c ON c.id = x.customer_id WHERE x.rn = 1;
```

### M.10 Join under RLS (conceptual)

Test joins as each role; policies apply per underlying table.

### M.11 Join large temp table

```sql
CREATE TEMP TABLE tmp_keys (id bigint PRIMARY KEY) ON COMMIT DROP;
INSERT INTO tmp_keys VALUES (1),(2),(3);
SELECT t.*
FROM big_table t
JOIN tmp_keys k ON k.id = t.id;
```

### M.12 Join with `VALUES` drivers

```sql
SELECT *
FROM orders o
JOIN (VALUES (1001),(1002),(1003)) AS v(id) ON o.id = v.id;
```

### M.13 Join + sort merge hint (conceptual)

Sorted inputs help merge joins—clustered indexes or `ORDER BY` feeding CTE rarely helps unless materialized sorted.

### M.14 Join with parallel workers

Large scans may parallelize; join behavior depends on cost settings—benchmark.

### M.15 Join cardinality estimator checks

```sql
SELECT tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('orders','order_items');
```

### M.16 Join-friendly surrogate keys

Surrogate integer/bigint keys usually outperform text natural keys for join width and index size.

### M.17 Join on expressions with index

```sql
CREATE INDEX ON users ((lower(email)));
SELECT *
FROM users u
JOIN signup_events s ON lower(s.email) = lower(u.email);
```

### M.18 Join + limit per user (lateral)

```sql
SELECT u.id, o.id
FROM users u
JOIN LATERAL (
  SELECT id FROM orders o WHERE o.user_id = u.id ORDER BY placed_at DESC LIMIT 3
) o ON TRUE;
```

### M.19 Join vs subquery in SELECT list

Prefer joins or lateral for performance when correlated scalars multiply work.

### M.20 Join review snippet for PR template

- [ ] Predicates in correct clause (`ON` vs `WHERE`) for outer joins  
- [ ] Indexes on join keys  
- [ ] Cardinality assumptions documented  
- [ ] `EXPLAIN (ANALYZE, BUFFERS)` attached for hot queries  

---

*End of notes.*
