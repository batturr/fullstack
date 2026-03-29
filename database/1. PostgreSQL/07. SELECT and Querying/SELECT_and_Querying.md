# SELECT & Querying

**PostgreSQL learning notes (March 2026). Aligned with README topics 7–12.**

---

## 📑 Table of Contents

- [1. SELECT Statement Basics](#1-select-statement-basics)
- [2. FROM Clause](#2-from-clause)
- [3. WHERE Clause](#3-where-clause)
- [4. Pattern Matching](#4-pattern-matching)
- [5. ORDER BY Clause](#5-order-by-clause)
- [6. LIMIT & OFFSET](#6-limit--offset)
- [7. DISTINCT](#7-distinct)
- [8. Grouping Data (GROUP BY)](#8-grouping-data-group-by)
- [9. HAVING Clause](#9-having-clause)
- [10. Aggregate Functions](#10-aggregate-functions)
- [11. ORDER BY with Aggregates](#11-order-by-with-aggregates)
- [12. Complex SELECT Expressions](#12-complex-select-expressions)
- [13. Set Operations](#13-set-operations)
- [14. Scalar Subqueries](#14-scalar-subqueries)
- [15. Multi-row Subqueries](#15-multi-row-subqueries)
- [16. Column Expressions](#16-column-expressions)
- [17. Window Functions](#17-window-functions)
- [18. Null Handling in SELECT](#18-null-handling-in-select)

---

## 1. SELECT Statement Basics

<a id="1-select-statement-basics"></a>

### Beginner

`SELECT` is how you read data from tables and views. The smallest useful query names a list of columns (or `*` for all columns) and a `FROM` clause that identifies where rows come from. Column aliases (`AS`) rename outputs for readability in reports or application code. `DISTINCT` removes duplicate rows from the final result set. `LIMIT` and `OFFSET` control how many rows you return and where to start, which is the usual pattern for simple pagination.

Beginners should practice reading queries top-to-bottom as “pick columns, pick source, filter, sort, page,” even though PostgreSQL’s internal evaluation order differs slightly (for example, you cannot use a `SELECT` alias inside `WHERE`).

### Intermediate

PostgreSQL follows SQL’s conceptual evaluation order: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → window functions → `SELECT` list → `DISTINCT` → `ORDER BY` → `LIMIT/OFFSET`. That ordering explains common surprises: expressions in the `SELECT` list can reference columns after grouping only with correct aggregation rules; aliases from `SELECT` are visible in `ORDER BY` but not in `WHERE` or `GROUP BY` unless you repeat the expression or use a subquery/CTE.

`FETCH FIRST n ROWS ONLY` and `OFFSET ... ROWS` are standard-SQL spelling for top-N and pagination. For stable paging, always pair `LIMIT/OFFSET` with a deterministic `ORDER BY`.

### Expert

The planner may reorder joins and scans while preserving semantics. Volatility categories (`IMMUTABLE`, `STABLE`, `VOLATILE`) on functions used in the `SELECT` list affect optimization and index use. Security-wise, never concatenate untrusted input into SQL; bind parameters for values and validate identifiers separately when building dynamic SQL.

When exposing generic query builders, prefer allow-lists of columns and explicit projections instead of `SELECT *` to reduce I/O, cache pressure, and accidental data leaks.

```sql
-- Explicit projection (preferred in applications)
SELECT id, email, created_at
FROM users
WHERE active = TRUE;

-- DISTINCT removes duplicate rows from the full selected shape
SELECT DISTINCT department_id
FROM employees;

-- Aliases + pagination + deterministic order
SELECT first_name || ' ' || last_name AS full_name
FROM employees
ORDER BY last_name ASC, first_name ASC
LIMIT 25 OFFSET 50;

-- SQL-standard fetch
SELECT product_id, name
FROM products
ORDER BY name
FETCH FIRST 10 ROWS ONLY;
```

### Key Points

- `SELECT` defines the shape of each result row (expressions and column references).
- `FROM` supplies rows; without it, you can still `SELECT` constants (`SELECT now();`).
- `DISTINCT` applies to the entire row as projected, not “one column only,” unless you use `DISTINCT ON` (PostgreSQL extension; covered in the DISTINCT section).

### Best Practices

- Prefer listing columns explicitly instead of `*` in application queries.
- Always combine pagination with `ORDER BY` for repeatable pages.
- Use meaningful aliases (`total_amount` not `t1`).

### Common Mistakes

- Using `SELECT *` in hot paths and then ignoring most columns.
- Paginating without `ORDER BY`, assuming insertion order.
- Expecting `DISTINCT email` while also selecting many non-distinct columns without `DISTINCT ON` or grouping.

---

## 2. FROM Clause

<a id="2-from-clause"></a>

### Beginner

`FROM` names the row sources: base tables, views, set-returning functions, or subqueries wrapped as derived tables. A derived table in PostgreSQL must have an alias: `FROM (SELECT ...) AS daily_stats`. You combine multiple sources using joins (explicit `JOIN` syntax is clearer than comma-separated `FROM a, b`).

### Intermediate

`LATERAL` lets a subquery or function on the right-hand side reference columns from preceding `FROM` items row-by-row. This is how you correlate a set-returning function or a “top-N per key” pattern cleanly. Table functions such as `generate_series`, `jsonb_each`, and `unnest` behave like row sources when placed in `FROM`.

### Expert

`ONLY` restricts inheritance scans when querying parent tables in legacy inheritance models. `TABLESAMPLE` provides block-level sampling for approximate analytics. Partitioned tables still appear as a single logical relation in `FROM`; pruning depends on partition keys appearing in `WHERE`.

```sql
SELECT o.id, c.name
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id;

SELECT d, n
FROM (
  SELECT date_trunc('day', created_at) AS d, count(*)::bigint AS n
  FROM events
  GROUP BY 1
) AS daily
WHERE n > 100;

SELECT u.id, recent.order_id
FROM users AS u
LEFT JOIN LATERAL (
  SELECT id AS order_id
  FROM orders o
  WHERE o.user_id = u.id
  ORDER BY o.placed_at DESC
  FETCH FIRST 3 ROWS ONLY
) AS recent ON TRUE;

SELECT *
FROM generate_series(1, 5) AS g(n);
```

### Key Points

- Every column reference must be traceable to some item in `FROM` (or outer query in subqueries).
- Derived tables need aliases; column names come from inner `SELECT` unless renamed.

### Best Practices

- Prefer explicit `JOIN` with `ON` or `USING` over comma joins.
- Use `LATERAL` for correlated unnests and per-row top-N, instead of scalar subqueries per column when set-oriented solutions exist.

### Common Mistakes

- Omitting the alias on a subquery in `FROM`.
- Accidental Cartesian products from missing join predicates.
- Overusing `LATERAL` without indexes on correlated predicates (can become nested-loop heavy).

---

## 3. WHERE Clause

<a id="3-where-clause"></a>

### Beginner

`WHERE` filters rows before aggregation. Use comparison operators (`=`, `<>`, `<`, `>`, `<=`, `>=`), boolean combinations (`AND`, `OR`, `NOT`), and parentheses for clarity. `BETWEEN low AND high` is inclusive on both ends. `IN (list)` tests membership. For nulls, always use `IS NULL` / `IS NOT NULL`.

### Intermediate

SQL uses three-valued logic (`TRUE`, `FALSE`, `UNKNOWN`). Comparisons involving `NULL` yield `UNKNOWN`, which is filtered out by `WHERE`. Do not rely on short-circuit evaluation across SQL expressions for correctness with side effects. For time ranges, half-open intervals (`ts >= start AND ts < end`) avoid boundary bugs across types and time zones.

### Expert

Write sargable predicates when you need indexes: `WHERE col = $1` is index-friendly; `WHERE lower(col) = lower($1)` typically requires a functional index on `lower(col)`. Row-level security policies transparently add predicates to `WHERE` for qualifying roles.

```sql
SELECT *
FROM invoices
WHERE status = 'open'
  AND amount BETWEEN 100 AND 500
  AND country IN ('US', 'CA')
  AND canceled_at IS NULL;

SELECT *
FROM events
WHERE created_at >= timestamptz '2026-03-01'
  AND created_at <  timestamptz '2026-04-01';

SELECT *
FROM employees
WHERE (department_id = 10 OR department_id = 20)
  AND NOT is_contractor;
```

### Key Points

- `WHERE` cannot reference aggregate results; use `HAVING` after grouping.
- `NULL` never equals `NULL` in SQL; use `IS NULL`.

### Best Practices

- Parameterize dynamic values from application code.
- Keep OR chains sargable when possible; sometimes rewrite to `IN` or `UNION ALL` branches for planner friendliness.

### Common Mistakes

- Writing `WHERE col = NULL` instead of `IS NULL`.
- Mixing `OR` without parentheses and changing intended logic.
- Applying non-immutable functions to indexed columns without matching indexes.

---

## 4. Pattern Matching

<a id="4-pattern-matching"></a>

### Beginner

`LIKE` matches text patterns: `%` matches any substring, `_` matches a single character. `ILIKE` is case-insensitive `LIKE` in PostgreSQL. Escape special characters with `ESCAPE` or standard `SIMILAR TO` / regex operators for richer patterns.

### Intermediate

POSIX regular expressions use `~` (case-sensitive), `~*` (case-insensitive), `!~`, `!~*`. `SIMILAR TO` is SQL-standard but awkward; most teams prefer regex operators or `LIKE` for simple suffix/prefix tests. Leading-wildcard `LIKE '%foo'` usually cannot use a normal B-tree index; consider `pg_trgm` or full-text search.

### Expert

Collation affects `LIKE` comparisons for non-ASCII data. Pattern-heavy workloads need deliberate indexing (`pg_trgm` GiST/GIN) or constrained patterns (prefix queries: `LIKE 'abc%'`). For extraction and validation, prefer `substring`, `regexp_match`, or check constraints at write time.

```sql
SELECT email
FROM users
WHERE email ILIKE '%@company.com';

SELECT phone
FROM contacts
WHERE phone LIKE '+1-___-___-____' ESCAPE '\';

SELECT path
FROM routes
WHERE path ~ '^/[a-z0-9]+(/[a-z0-9]+)*$';

SELECT code
FROM products
WHERE code SIMILAR TO '(A|B)[0-9]{3}';
```

### Key Points

- `LIKE` is simple wildcard matching; regex is far more expressive.
- Case sensitivity differs: `LIKE` respects collation; `ILIKE` ignores case for basic Latin in typical locales.

### Best Practices

- Anchor patterns when possible (`prefix%`) to enable index range scans.
- Push complex pattern checks to constraints or generated columns when they are stable business rules.

### Common Mistakes

- Expecting `LIKE` to behave like `=` for empty patterns without understanding `%` and `_`.
- Using `%` at the start on huge tables without supporting indexes.
- Confusing `SIMILAR TO` underscore rules with `LIKE` underscore rules.

---

## 5. ORDER BY Clause

<a id="5-order-by-clause"></a>

### Beginner

`ORDER BY` sorts rows for presentation. Specify one or more keys; default direction is `ASC`. Use `DESC` for reverse order. You can sort by column position (`ORDER BY 2`) but naming columns is clearer and safer under schema changes.

### Intermediate

`NULLS FIRST` and `NULLS LAST` control null placement; defaults depend on `ASC`/`DESC`. You may sort by expressions and `SELECT` aliases because `ORDER BY` runs after the projection step. `COLLATE` chooses a collation for string ordering.

### Expert

Large sorts spill to disk (`work_mem`). Supporting indexes can yield incremental or index-only ordered scans. When combining `DISTINCT ON` with `ORDER BY`, PostgreSQL requires the leading `ORDER BY` keys to match the `DISTINCT ON` expressions (covered again under DISTINCT).

```sql
SELECT last_name, first_name, hire_date
FROM employees
ORDER BY hire_date DESC NULLS LAST, last_name ASC;

SELECT id, lower(email) AS norm_email
FROM users
ORDER BY norm_email COLLATE "C";

SELECT *
FROM sales
ORDER BY amount * (1 - discount) DESC;
```

### Key Points

- Without `ORDER BY`, row order is not guaranteed.
- `ORDER BY` can see output column aliases; `GROUP BY`/`WHERE` generally cannot.

### Best Practices

- Always sort paginated queries.
- Prefer explicit `NULLS FIRST/LAST` in APIs where null ordering matters to clients.

### Common Mistakes

- Relying on “natural” physical order for correctness.
- Using ordinal positions in `ORDER BY` in production views and then altering `SELECT` lists.

---

## 6. LIMIT & OFFSET

<a id="6-limit--offset"></a>

### Beginner

`LIMIT n` returns at most n rows. `OFFSET m` skips the first m rows after sorting. Together they implement classic offset-based pagination. Always pair with `ORDER BY` so pages are stable as data changes.

### Intermediate

`OFFSET` scans and discards rows; deep pages get progressively slower. For large datasets, keyset pagination (`WHERE (sort_key, id) > ($last_sort, $last_id)`) scales better. `FETCH FIRST` syntax is portable and reads well in standards-focused teams.

### Expert

Cursors (`DECLARE c CURSOR`) and server-side pagination differ from ad hoc `LIMIT/OFFSET` loops. For volatile feeds, keyset pagination avoids duplicates/skips that happen when rows shift between offset pages.

```sql
SELECT id, title, published_at
FROM articles
WHERE published_at IS NOT NULL
ORDER BY published_at DESC, id DESC
LIMIT 20 OFFSET 40;

-- Keyset-style (example pattern)
SELECT id, title, published_at
FROM articles
WHERE published_at IS NOT NULL
  AND (published_at, id) < (timestamptz '2026-03-01', 12345)
ORDER BY published_at DESC, id DESC
LIMIT 20;
```

### Key Points

- `LIMIT` does not define which rows; `ORDER BY` does.
- `OFFSET` cost grows with page depth.

### Best Practices

- Prefer keyset pagination for large, stable sort keys.
- Return a stable tie-breaker column (often primary key) in `ORDER BY`.

### Common Mistakes

- Deep `OFFSET` in production APIs on huge tables.
- Changing `ORDER BY` between requests and seeing “jumping” rows.

---

## 7. DISTINCT

<a id="7-distinct"></a>

### Beginner

`DISTINCT` deduplicates result rows after projection. If you select many columns, uniqueness is determined by the whole tuple. `COUNT(DISTINCT col)` counts unique non-null values of that column inside an aggregate.

### Intermediate

PostgreSQL’s `DISTINCT ON (expr, ...)` keeps the first row of each group according to `ORDER BY`. This is powerful for “pick one row per key” patterns but is easy to misuse if `ORDER BY` is incomplete. Prefer window functions when you need explicit ranking rules. `DISTINCT ON` requires that the leftmost `ORDER BY` keys match the `DISTINCT ON` expressions (possibly followed by additional sort keys).

### Expert

Deduplication at read time can hide data model issues; sometimes normalization or constraints are the real fix. For large DISTINCT sorts, consider hash aggregates vs sort-based plans (`EXPLAIN ANALYZE`).

```sql
SELECT DISTINCT department_id, location_id
FROM employees;

SELECT DISTINCT ON (customer_id) customer_id, id AS latest_order_id, placed_at
FROM orders
ORDER BY customer_id, placed_at DESC;

SELECT date_trunc('day', created_at) AS d, count(DISTINCT user_id) AS dau
FROM events
GROUP BY 1;
```

### Key Points

- `DISTINCT` is not a grouping mechanism; it removes duplicate rows from a projection.
- `DISTINCT ON` is PostgreSQL-specific and tightly coupled to `ORDER BY`.

### Best Practices

- Use `DISTINCT ON` only when you can justify the ordering semantics.
- For complex “one row per group,” compare `DISTINCT ON`, grouped subqueries, and window functions.

### Common Mistakes

- Expecting `DISTINCT` on one column while projecting others without defining which row “wins.”
- Forgetting that `COUNT(*)` counts rows while `COUNT(DISTINCT col)` ignores `NULL` in `col`.

---

## 8. Grouping Data (GROUP BY)

<a id="8-grouping-data-group-by"></a>

### Beginner

`GROUP BY` collapses rows sharing the same grouping key values into one row per group. Typically you combine it with aggregates (`count`, `sum`) to summarize data. Every non-aggregated column in `SELECT` must appear in `GROUP BY` (or be functionally dependent—PostgreSQL is permissive with primary keys under certain rules).

### Intermediate

You can group by expressions (`date_trunc('day', ts)`), output column ordinals (`GROUP BY 1`), or alias-like positions—prefer explicit expressions for maintainability. `GROUPING SETS`, `ROLLUP`, and `CUBE` generate multiple grouping combinations in one query.

### Expert

When `GROUP BY` keys are highly selective, hash aggregation may dominate; when many groups exist, memory and `work_mem` matter. Partial aggregations with indexes can speed selective group-by patterns on huge tables.

```sql
SELECT department_id, job_title, count(*) AS headcount, avg(salary) AS avg_sal
FROM employees
WHERE active
GROUP BY department_id, job_title
ORDER BY department_id, headcount DESC;

SELECT date_trunc('month', order_date) AS m, sum(amount) AS revenue
FROM orders
GROUP BY 1
ORDER BY m;

SELECT department_id, job_title, count(*)
FROM employees
GROUP BY GROUPING SETS ((department_id), (job_title), ());
```

### Key Points

- Aggregates summarize groups; non-aggregated columns must be grouped (with caveats).
- `FILTER` and `HAVING` refine aggregates differently (row-level vs group-level).

### Best Practices

- Group by stable keys (ids) rather than display names when possible.
- Use `GROUPING SETS` for report subtotals instead of many separate queries.

### Common Mistakes

- Selecting a bare column not in `GROUP BY` (SQL error) or relying on ambiguous functional dependency.
- Grouping by a highly volatile expression that prevents index use.

---

## 9. HAVING Clause

<a id="9-having-clause"></a>

### Beginner

`HAVING` filters groups after aggregation, similar to how `WHERE` filters rows before aggregation. Typical use: keep only groups with `count(*) > 1` or `sum(amount) > 1000`.

### Intermediate

`HAVING` can reference aggregate expressions and grouping keys. It cannot replace `WHERE` for row-level filters—push predicates to `WHERE` whenever they do not depend on aggregates to shrink input early.

### Expert

The planner may still compute aggregates for groups discarded by `HAVING`; rewriting with semijoins or pre-filters can help. For complex conditions, a CTE that pre-aggregates can be clearer and sometimes faster.

```sql
SELECT customer_id, count(*) AS orders, sum(amount) AS spend
FROM orders
GROUP BY customer_id
HAVING count(*) >= 5 AND sum(amount) > 500;

SELECT department_id, avg(salary) AS avg_sal
FROM employees
WHERE active
GROUP BY department_id
HAVING avg(salary) > 70000;
```

### Key Points

- `WHERE` filters rows; `HAVING` filters groups.
- Aggregates referenced in `HAVING` should match the grouped query’s logic.

### Best Practices

- Maximize selective filters in `WHERE` before aggregation.
- Keep `HAVING` readable; move complex logic to CTEs when needed.

### Common Mistakes

- Putting non-aggregate row filters in `HAVING` unnecessarily.
- Forgetting that `HAVING` cannot reference ungrouped, non-aggregate columns.

---

## 10. Aggregate Functions

<a id="10-aggregate-functions"></a>

### Beginner

Aggregates summarize many rows into one value per group (or one value for the whole table if there is no `GROUP BY`). Common aggregates: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. `COUNT(*)` counts rows; `COUNT(col)` counts non-null values in `col`. `COUNT(DISTINCT col)` counts unique non-null values.

### Intermediate

Most aggregates ignore `NULL` inputs except `COUNT(*)`. `FILTER` lets you compute conditional aggregates without scanning the table multiple times. Combining aggregates with `GROUP BY` produces per-group metrics; combining with window `OVER()` produces running metrics (see the Window section).

### Expert

Ordered-set aggregates (`percentile_cont`, `mode`) and hypothetical-set aggregates answer advanced statistical questions. Custom aggregates can be defined in SQL/C; partial aggregation parallelism depends on planner choices and `enable_partitionwise_aggregate`.

```sql
SELECT count(*) AS rows_cnt,
       count(email) AS non_null_email,
       count(DISTINCT department_id) AS dept_cnt
FROM employees;

SELECT department_id,
       sum(salary) AS payroll,
       avg(salary) AS avg_sal,
       min(salary) AS min_sal,
       max(salary) AS max_sal
FROM employees
GROUP BY department_id;

SELECT order_date::date AS d,
       sum(amount) FILTER (WHERE status = 'paid') AS paid_total,
       sum(amount) FILTER (WHERE status = 'refunded') AS refund_total
FROM orders
GROUP BY 1;
```

### Key Points

- Aggregates collapse many rows into fewer rows (per group or total).
- `FILTER` is often clearer and faster than repeated `CASE` expressions inside aggregates.

### Best Practices

- Use `COUNT(*)` when you mean “number of rows.”
- Push predicates to `WHERE` when they do not depend on aggregates.

### Common Mistakes

- Using `AVG` on nullable columns without understanding skipped nulls.
- Mixing bare columns with aggregates incorrectly in `SELECT`.

---

## 11. ORDER BY with Aggregates

<a id="11-order-by-with-aggregates"></a>

### Beginner

After computing aggregates with `GROUP BY`, sort the grouped result with `ORDER BY` using either grouping columns or aggregate expressions (`ORDER BY sum(amount) DESC`). This is how you build “top departments by spend” reports.

### Intermediate

You can order by alias if it is unambiguous in PostgreSQL for `ORDER BY`. When ordering by aggregates, consider indexes on grouping keys for merge-style plans or pre-sorting. `NULLS FIRST/LAST` applies to aggregate outputs too.

### Expert

For large grouped sorts, increasing `work_mem` can avoid external sort spills. Compare with window functions (`rank() over (order by ...)`) when you need ranking within groups without collapsing detail rows.

```sql
SELECT department_id, sum(amount) AS revenue
FROM orders
GROUP BY department_id
ORDER BY revenue DESC NULLS LAST;

SELECT customer_id, count(*) AS n, max(placed_at) AS last_order
FROM orders
GROUP BY customer_id
ORDER BY n DESC, last_order DESC
LIMIT 50;
```

### Key Points

- Sorting happens after aggregation for grouped queries.
- Tie-break with stable keys (for example, id) when rankings matter.

### Best Practices

- Index foreign keys used as group keys when joins plus group-by are common.
- Use `LIMIT` only after you have the correct `ORDER BY`.

### Common Mistakes

- Ordering grouped queries by a non-grouped, non-aggregate column.
- Expecting `ORDER BY` inside an aggregate list (that belongs in `ORDER BY` for `string_agg` or window frames).

---

## 12. Complex SELECT Expressions

<a id="12-complex-select-expressions"></a>

### Beginner

`CASE` chooses among values using conditions. The searched form (`CASE WHEN cond THEN ... END`) is most common. `COALESCE(a,b,c)` returns the first non-null argument. `NULLIF(a,b)` returns null when `a = b`, else returns `a`—handy to avoid divide-by-zero or to map sentinels to null.

### Intermediate

`CASE` expressions are scalar and can nest; keep them readable with formatting. `COALESCE` is not a substitute for business-default rules unless null truly means “missing.” `GREATEST`/`LEAST` handle extremal picks across scalars.

### Expert

`CASE` evaluation is generally safe for short-circuiting in PostgreSQL for simple conditions, but do not rely on side effects. For type consistency, cast branches to a common type. Generated columns can offload repeated `CASE` expressions when stable and deterministic.

```sql
SELECT amount,
       CASE
         WHEN amount < 0 THEN 'credit'
         WHEN amount = 0 THEN 'zero'
         ELSE 'debit'
       END AS kind,
       coalesce(notes, '') AS notes_safe,
       nullif(trim(code), '') AS code_or_null
FROM ledger_entries;

SELECT salary,
       CASE department_id
         WHEN 10 THEN salary * 1.10
         ELSE salary
       END AS adjusted
FROM employees;
```

### Key Points

- `CASE` returns a single value per row; it is not control flow for SQL batches.
- `COALESCE` filters nulls; `NULLIF` maps specific values to null.

### Best Practices

- Prefer explicit `ELSE NULL` or `ELSE` with a default when exhaustiveness matters.
- Keep `CASE` shallow; refactor to joins or lookup tables when logic explodes.

### Common Mistakes

- Mixing incompatible result types across `CASE` branches without casts.
- Using `COALESCE` to hide data quality problems instead of fixing sources.

---

## 13. Set Operations

<a id="13-set-operations"></a>

### Beginner

`UNION` combines queries vertically and removes duplicates unless you use `UNION ALL`. `INTERSECT` returns rows present in both results. `EXCEPT` returns rows in the first query not present in the second. Column counts and types must align across branches.

### Intermediate

`ORDER BY` applies to the combined result and typically uses column positions or output names from the first branch. Set operations often sort and hash heavily; `UNION ALL` is cheaper when duplicates are acceptable or impossible by construction.

### Expert

`INTERSECT`/`EXCEPT` can be rewritten as joins or anti-joins for performance. With nullable columns, duplicates and equality semantics follow SQL’s null rules (`NULL = NULL` is unknown, not true).

```sql
SELECT email FROM customers
UNION
SELECT email FROM newsletter_subscribers;

SELECT email FROM customers
UNION ALL
SELECT email FROM leads;

SELECT product_id
FROM warehouse_a
INTERSECT
SELECT product_id
FROM warehouse_b;

SELECT product_id
FROM catalog
EXCEPT
SELECT product_id
FROM discontinued;
```

### Key Points

- Set ops combine whole row shapes, not “cells.”
- `UNION` implies duplicate removal cost.

### Best Practices

- Prefer `UNION ALL` when uniqueness is already guaranteed.
- Cast branches to identical types when literals would otherwise infer differently.

### Common Mistakes

- Mismatched column counts or types between branches.
- Using `UNION` when `UNION ALL` would be correct, causing unnecessary sorts.

---

## 14. Scalar Subqueries

<a id="14-scalar-subqueries"></a>

### Beginner

A scalar subquery returns at most one column and one row. It can appear in `SELECT`, `WHERE`, or `ORDER BY`. If it returns zero rows, the result is `NULL`; if more than one row, PostgreSQL errors at runtime.

### Intermediate

Correlated scalar subqueries reference outer query columns. They often execute as nested loops unless the planner decorrelates them. For existence checks, `EXISTS` is usually clearer than `= (SELECT ... LIMIT 1)`.

### Expert

Decorrelation and “initplan” optimization can make scalar subqueries cheap. For volatile functions inside scalar subqueries, understand evaluation counts. Use lateral joins or window functions when you need multiple correlated scalar values efficiently.

```sql
SELECT name,
       (SELECT max(o.placed_at) FROM orders o WHERE o.customer_id = c.id) AS last_order
FROM customers c;

SELECT *
FROM products p
WHERE p.price > (SELECT avg(price) FROM products);

SELECT e.id
FROM employees e
WHERE e.salary > (SELECT avg(salary) FROM employees m WHERE m.department_id = e.department_id);
```

### Key Points

- Scalar subqueries must return ≤1 row.
- Zero rows → `NULL` result for the subquery expression.

### Best Practices

- Add `LIMIT 1` with `ORDER BY` only when you explicitly want one row—but still ensure uniqueness logically.
- Consider joins or lateral for performance-critical correlated scalars.

### Common Mistakes

- Assuming a scalar subquery always returns a row.
- Using scalar subqueries that can return multiple rows without enforcement.

---

## 15. Multi-row Subqueries

<a id="15-multi-row-subqueries"></a>

### Beginner

`IN (subquery)` tests membership. `NOT IN (subquery)` is tricky with nulls: if the subquery yields any null, results can become empty unexpectedly. `EXISTS` tests for row presence and stops early; `NOT EXISTS` is the usual negated pattern. `ANY`/`ALL` compare a value to a set using operators.

### Intermediate

`IN` vs `EXISTS`: `EXISTS` often wins for correlated patterns when the inner side is indexed on the correlation key. `NOT IN` vs `NOT EXISTS`: prefer `NOT EXISTS` almost always when negating membership under nullable columns.

### Expert

Semi-join and anti-join plans implement `EXISTS`/`NOT EXISTS` efficiently. Row comparison forms `(a,b) IN (SELECT x,y ...)` are supported and useful for composite keys.

```sql
SELECT *
FROM orders
WHERE customer_id IN (SELECT id FROM customers WHERE vip);

SELECT c.*
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

SELECT *
FROM products p
WHERE p.price > ALL (SELECT price FROM products WHERE category_id = p.category_id);

SELECT *
FROM employees e
WHERE e.salary > ANY (SELECT threshold FROM pay_bands WHERE department_id = e.department_id);
```

### Key Points

- `EXISTS` cares about row presence, not values (select `1` or `NULL`—same effect).
- `NOT IN` and nulls are a classic footgun.

### Best Practices

- Default to `NOT EXISTS` instead of `NOT IN` for nullable sets.
- Ensure supporting indexes on join/exists correlation keys.

### Common Mistakes

- Using `NOT IN` over a subquery that can return nulls.
- Confusing `ANY` vs `ALL` threshold semantics.

---

## 16. Column Expressions

<a id="16-column-expressions"></a>

### Beginner

The `SELECT` list can contain arithmetic (`amount * qty`), string concatenation (`||`), casts (`amount::numeric`), and function calls (`lower(email)`). You can name results with `AS`.

### Intermediate

Watch operator precedence and parentheses. Mixed types coerce per PostgreSQL casting rules—surprise truncations can occur between `integer` and `numeric`. Immutability of functions affects indexing and partial indexes on expressions.

### Expert

Generated columns (stored) can persist deterministic expressions. For JSON/text pipelines, prefer explicit casts at boundaries. Expression indexes match only when the expression text matches exactly (including casts and collation).

```sql
SELECT first_name || ' ' || last_name AS full_name,
       qty * unit_price * (1 - coalesce(discount, 0)) AS line_total
FROM order_items;

SELECT avg((stats->>'score')::numeric) AS avg_score
FROM player_matches;

SELECT date_trunc('hour', created_at) AS hour_bucket, count(*)
FROM events
GROUP BY 1;
```

### Key Points

- Expressions are evaluated per row (unless grouped/aggregated).
- Type casts change behavior and performance characteristics.

### Best Practices

- Cast once in CTE/subquery if reused many times.
- Keep client-facing expression names stable for API contracts.

### Common Mistakes

- Integer division when `numeric` was intended.
- Concatenating nulls without `coalesce` (null propagates with `||`).

---

## 17. Window Functions

<a id="17-window-functions"></a>

### Beginner

Window functions compute a value for each row using neighboring rows defined by `OVER (...)`. `PARTITION BY` splits the dataset into groups; `ORDER BY` inside `OVER` defines neighbor ordering. Unlike `GROUP BY`, window functions do not collapse rows.

### Intermediate

`ROW_NUMBER()` assigns unique sequential numbers. `RANK()` and `DENSE_RANK()` handle ties differently. `LAG`/`LEAD` access prior/next rows. Aggregate functions with `OVER` compute running totals when paired with a frame (`ROWS BETWEEN ...`).

### Expert

Frames (`ROWS` vs `RANGE`) differ around ties and peers. `RANGE` with `CURRENT ROW` on numeric/orderable types uses value-based peers. `exclude` options and `GROUPS` frames (PostgreSQL 11+) refine behavior. Beware accidental full-window sorts on huge partitions.

```sql
SELECT order_id, customer_id, amount,
       sum(amount) OVER (PARTITION BY customer_id ORDER BY placed_at) AS running_total
FROM orders;

SELECT id, department_id, salary,
       rank() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_rank,
       lag(salary) OVER (PARTITION BY department_id ORDER BY hire_date) AS prev_hire_sal
FROM employees;

SELECT event_id, user_id, created_at,
       row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM events;
```

### Key Points

- Windows happen after `WHERE`/`GROUP BY`/`HAVING` in the conceptual pipeline.
- Every window function requires an `OVER` clause.

### Best Practices

- Always specify `PARTITION BY` when the function should reset per key.
- Choose `ROWS` vs `RANGE` deliberately for running calculations.

### Common Mistakes

- Putting window functions in `WHERE` (wrap with subquery/CTE).
- Using `ORDER BY` in `OVER` inconsistently with ranking intent.

---

## 18. Null Handling in SELECT

<a id="18-null-handling-in-select"></a>

### Beginner

`NULL` means “unknown” or “missing.” Arithmetic with `NULL` usually yields `NULL`. Concatenation with `NULL` yields `NULL` unless you use `concat()` or `coalesce`. Comparisons return `UNKNOWN`, filtered out by `WHERE`.

### Intermediate

Aggregates like `sum` ignore nulls; `count(*)` counts rows regardless of nulls in columns. Sort order for nulls is controllable with `NULLS FIRST/LAST`. Use `IS DISTINCT FROM` for null-safe inequality/equality comparisons.

### Expert

Left joins introduce nulls for non-matching rows—distinguish “missing join” from “present but null” with care. For boolean logic under nulls, use explicit `CASE` or `IS TRUE` patterns when tri-state logic leaks into APIs.

```sql
SELECT *
FROM profiles
WHERE phone IS NULL;

SELECT coalesce(nickname, first_name, 'anonymous') AS display
FROM users;

SELECT a.id, b.id
FROM a
LEFT JOIN b ON a.id = b.id
WHERE b.id IS NULL;  -- rows in a with no match in b

SELECT x, y, (x IS NOT DISTINCT FROM y) AS null_safe_equal
FROM vals;
```

### Key Points

- `NULL` is not equal to `NULL` in ordinary comparisons.
- `IS NULL`, `IS NOT NULL`, `IS DISTINCT FROM` are your precision tools.

### Best Practices

- Document whether APIs treat null and empty string differently.
- Prefer `concat_ws`/`concat` when you want null-tolerant string building.

### Common Mistakes

- Using `= NULL` in `WHERE`.
- Misinterpreting nulls produced by `LEFT JOIN` filters placed in `WHERE` instead of `ON`.

---

## Appendix A. Extended Workshops (Extra SQL per subtopic)

The following sections deepen each subtopic with scenario notes and additional `sql` examples. Treat them as drills you can run in a scratch database with representative data volumes.

### A.1 Workshop — SELECT Statement Basics

#### Scenario notes

Build a projection-first mindset: name only the columns your application needs, and treat every query as a small contract.

Re-run the same query with `EXPLAIN (ANALYZE, BUFFERS)` in development to see whether you are scanning more than you intended.

#### Additional SQL

```sql
-- Workshop: projection + pagination stability
WITH page AS (
  SELECT id, email, created_at
  FROM users
  WHERE active
  ORDER BY created_at DESC, id DESC
  LIMIT 25 OFFSET 0
)
SELECT * FROM page;

-- Workshop: DISTINCT vs GROUP BY for uniqueness checks
SELECT DISTINCT lower(email) AS norm_email FROM users;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.2 Workshop — FROM Clause

#### Scenario notes

Practice rewriting comma-joins into explicit joins; it prevents accidental cross products and makes join order obvious to readers.

Try `LEFT JOIN LATERAL` when you would otherwise run a correlated subquery that returns multiple rows.

#### Additional SQL

```sql
-- Workshop: derived table with grouping
SELECT d, n
FROM (
  SELECT date_trunc('day', ts)::date AS d, count(*) AS n
  FROM events
  GROUP BY 1
) s
WHERE n BETWEEN 10 AND 1000;

-- Workshop: unnest arrays as rows
SELECT u.id, x.tag
FROM users u
CROSS JOIN LATERAL unnest(u.tags) AS x(tag);
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.3 Workshop — WHERE Clause

#### Scenario notes

Normalize time filters to half-open ranges. This avoids inclusive/exclusive endpoint bugs when data uses `timestamptz`.

When combining `OR`, test both branches with representative data to ensure indexes can still be used where possible.

#### Additional SQL

```sql
-- Workshop: half-open month filter
SELECT *
FROM orders
WHERE placed_at >= date_trunc('month', timestamptz '2026-03-15')
  AND placed_at <  date_trunc('month', timestamptz '2026-03-15') + interval '1 month';

-- Workshop: safe search list
SELECT *
FROM products
WHERE sku = ANY ($1::text[]);  -- bind $1 from app
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.4 Workshop — Pattern Matching

#### Scenario notes

If you need suffix or contains searches on text columns at scale, plan indexing (`pg_trgm`) early rather than bolting it on after production pain.

Prefer regex only when `LIKE` becomes unreadable; regex can be expensive without careful anchoring.

#### Additional SQL

```sql
-- Workshop: prefix-friendly LIKE for index range scans
SELECT * FROM customers WHERE lower(last_name) LIKE 'van%';

-- Workshop: extract with regex
SELECT id, substring(email from '^[^@]+') AS local_part
FROM users;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.5 Workshop — ORDER BY

#### Scenario notes

When sorting strings for machine uniqueness (not human display), a binary collation like `"C"` can be faster and more predictable.

For mixed-case natural names, document your collation choice because it affects equality and uniqueness in indexes.

#### Additional SQL

```sql
-- Workshop: deterministic tie-breakers
SELECT id, score, created_at
FROM leaderboard
ORDER BY score DESC, created_at ASC, id ASC;

-- Workshop: sort by expression safely
SELECT * FROM items ORDER BY (price * (1 - discount)) DESC;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.6 Workshop — LIMIT & OFFSET

#### Scenario notes

Benchmark deep pages: `OFFSET 100000` often reads and discards 100000 rows. Keyset pagination keeps latency flat.

If you must use offsets, consider caching popular first pages separately.

#### Additional SQL

```sql
-- Workshop: keyset on (created_at, id)
SELECT id, created_at, payload
FROM events
WHERE (created_at, id) < ($1::timestamptz, $2::bigint)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.7 Workshop — DISTINCT

#### Scenario notes

Use `COUNT(DISTINCT)` for uniques, but remember it can be memory-heavy; approximate counts may use HyperLogLog in extensions for huge datasets.

`DISTINCT ON` is powerful; document the ordering rule because it defines which row “wins.”

#### Additional SQL

```sql
-- Workshop: DISTINCT ON pick latest row per key
SELECT DISTINCT ON (user_id) user_id, id, created_at, body
FROM messages
ORDER BY user_id, created_at DESC, id DESC;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.8 Workshop — GROUP BY

#### Scenario notes

Prefer grouping on surrogate keys (ids) rather than display strings to avoid accidental merges when labels change.

Use `GROUPING SETS` to compute subtotals without multiple round trips from the application.

#### Additional SQL

```sql
-- Workshop: monthly revenue by region with subtotals
SELECT coalesce(region, 'ALL') AS region,
       date_trunc('month', d)::date AS month,
       sum(amount) AS revenue
FROM sales
GROUP BY GROUPING SETS ((region, month), (region), (month), ());
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.9 Workshop — HAVING

#### Scenario notes

Move any predicate that does not reference aggregates from `HAVING` to `WHERE` to shrink grouped input.

Combine `HAVING` with `FILTER` aggregates when you need both per-condition totals and group filters.

#### Additional SQL

```sql
-- Workshop: heavy buyers
SELECT customer_id,
       count(*) FILTER (WHERE status = 'paid') AS paid_orders,
       sum(amount) AS total
FROM orders
GROUP BY customer_id
HAVING count(*) FILTER (WHERE status = 'paid') >= 3
   AND sum(amount) > 250;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.10 Workshop — Aggregate Functions

#### Scenario notes

Combine `FILTER` with multiple aggregates in one pass instead of self-joining summary tables.

For percentiles on large datasets, explore `percentile_cont` within ordered-set aggregates.

#### Additional SQL

```sql
-- Workshop: funnel metrics in one SELECT
SELECT date_trunc('day', created_at) AS d,
       count(*) AS opened,
       count(*) FILTER (WHERE clicked) AS clicked,
       count(*) FILTER (WHERE purchased) AS purchased
FROM funnel_events
GROUP BY 1;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.11 Workshop — ORDER BY with Aggregates

#### Scenario notes

When reporting “top N groups,” use `ORDER BY` on aggregates then `LIMIT`. If ties matter, add extra sort keys.

If you need ties included fully, window functions with `rank()` may be better than `LIMIT`.

#### Additional SQL

```sql
-- Workshop: top categories by revenue with ties considered via rank
SELECT category_id, sum(amount) AS revenue,
       rank() OVER (ORDER BY sum(amount) DESC) AS rnk
FROM order_items
GROUP BY category_id;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.12 Workshop — Complex SELECT Expressions

#### Scenario notes

Use `NULLIF` before division to turn zero denominators into NULL, then `coalesce` if you need a sentinel.

Keep business rules out of mega-`CASE` when a lookup table models the rule set better.

#### Additional SQL

```sql
-- Workshop: safe ratio
SELECT a, b,
       CASE WHEN b = 0 THEN NULL ELSE a::numeric / b END AS ratio,
       a / nullif(b, 0) AS ratio_alt
FROM samples;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.13 Workshop — Set Operations

#### Scenario notes

Prefer `UNION ALL` plus outer `DISTINCT` only if you truly need global dedupe; often you can dedupe in one step with clearer logic.

When aligning types, cast literals explicitly to the column type of the first branch.

#### Additional SQL

```sql
-- Workshop: combine active sources
SELECT id, email, 'crm' AS source FROM crm_contacts
UNION ALL
SELECT id, email, 'web' AS source FROM web_users;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.14 Workshop — Scalar Subqueries

#### Scenario notes

If a scalar subquery is uncorrelated, PostgreSQL may evaluate it once as an initplan—check `EXPLAIN`.

Correlated scalars can explode cost; try joins or `LATERAL`.

#### Additional SQL

```sql
-- Workshop: department average via join instead of scalar
SELECT e.id, e.salary, d.avg_dept_sal
FROM employees e
JOIN (
  SELECT department_id, avg(salary) AS avg_dept_sal
  FROM employees
  GROUP BY department_id
) d USING (department_id);
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.15 Workshop — Multi-row Subqueries

#### Scenario notes

Rewrite `IN (SELECT ...)` as `EXISTS` when you only need existence and the inner side is large.

For anti-patterns, `NOT EXISTS` almost always beats `NOT IN` under nulls.

#### Additional SQL

```sql
-- Workshop: customers with no orders (anti-join)
SELECT c.*
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.16 Workshop — Column Expressions

#### Scenario notes

Cast JSON fields once in a subquery, then aggregate—repeat casts in five aggregates may prevent optimization and clutter plans.

Use parentheses liberally when mixing `AND`/`OR`.

#### Additional SQL

```sql
-- Workshop: numeric JSON field
SELECT (payload->>'qty')::int * (payload->>'price')::numeric AS line_total
FROM json_orders;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.17 Workshop — Window Functions

#### Scenario notes

For deduping while keeping rows, `row_number()` partitions are common; filter `WHERE rn = 1` in an outer query.

Running totals should specify frames explicitly when you mean “up to current row” vs “whole partition.”

#### Additional SQL

```sql
-- Workshop: de-duplicate keep latest
WITH ranked AS (
  SELECT id, user_id, created_at,
         row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM events
)
SELECT id, user_id, created_at FROM ranked WHERE rn = 1;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

### A.18 Workshop — Null Handling

#### Scenario notes

Document tri-state booleans: `WHERE flag` filters differently than `WHERE flag IS TRUE`.

Use `IS DISTINCT FROM` in constraints comparisons when you need null-aware uniqueness patterns (often paired with unique indexes on expressions).

#### Additional SQL

```sql
-- Workshop: null-safe compare
SELECT *
FROM a JOIN b ON a.key IS NOT DISTINCT FROM b.key;

-- Workshop: count missing vs present
SELECT count(*) FILTER (WHERE phone IS NULL) AS missing_phone,
       count(*) FILTER (WHERE phone IS NOT NULL) AS has_phone
FROM contacts;
```

#### Checklist

- Re-run with `EXPLAIN (ANALYZE, BUFFERS)` and compare plans when you change joins or aggregates.
- Test with NULL-heavy samples and empty tables (zero-row groups behave differently in aggregates).
- Verify collation and timezone settings if your results look right in staging but wrong in production.

## Appendix B. SELECT Query Recipes (Copy-Paste Starters)

### B.1 Safe pagination wrapper

```sql
-- Parameters: :page_size, :after_created_at, :after_id
SELECT id, created_at, payload
FROM events
WHERE created_at IS NOT NULL
  AND (created_at, id) < (:after_created_at::timestamptz, :after_id::bigint)
ORDER BY created_at DESC, id DESC
LIMIT :page_size;
```

### B.2 Distinct users per day (DAU pattern)

```sql
SELECT date_trunc('day', created_at)::date AS day,
       count(DISTINCT user_id) AS dau
FROM events
GROUP BY 1
ORDER BY 1;
```

### B.3 Top-N per group with windows

```sql
WITH ranked AS (
  SELECT department_id, id, salary,
         rank() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT * FROM ranked WHERE rnk <= 3;
```

### B.4 Conditional aggregates vs CASE inside SUM

```sql
SELECT customer_id,
       sum(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid_sum,
       sum(amount) FILTER (WHERE status = 'paid') AS paid_sum_filter
FROM orders
GROUP BY customer_id;
```

### B.5 Set difference with anti-join alternative

```sql
-- EXCEPT version
SELECT email FROM all_subscribers
EXCEPT
SELECT email FROM unsubscribed;

-- NOT EXISTS version (often clearer with indexes)
SELECT a.email
FROM all_subscribers a
WHERE NOT EXISTS (
  SELECT 1 FROM unsubscribed u WHERE u.email = a.email
);
```

### B.6 Generate gaps report (anti-join pattern)

```sql
SELECT s.id AS expected_id
FROM generate_series(
  (SELECT min(id) FROM tickets),
  (SELECT max(id) FROM tickets)
) AS s(id)
LEFT JOIN tickets t ON t.id = s.id
WHERE t.id IS NULL;
```

### B.7 Running balance with windows

```sql
SELECT id, posted_at, delta,
       sum(delta) OVER (ORDER BY posted_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance
FROM ledger_lines;
```

### B.8 Null-safe join key

```sql
SELECT *
FROM a
JOIN b ON a.ext_ref IS NOT DISTINCT FROM b.ext_ref;
```

### B.9 Distinct counts under grouping (HLL note)

For extreme cardinalities, consider the `hll` extension or approximate distinct algorithms; pure `count(distinct)` can be heavy.

```sql
-- Exact distinct (fine at moderate sizes)
SELECT date_trunc('day', ts)::date AS d,
       count(DISTINCT user_id) AS approx_dau_exact
FROM events
GROUP BY 1;
```

### B.10 Correlated scalar vs lateral top-N

```sql
-- Lateral is often best for top-N per anchor
SELECT u.id, o.id AS latest_order_id
FROM users u
LEFT JOIN LATERAL (
  SELECT id
  FROM orders o
  WHERE o.user_id = u.id
  ORDER BY placed_at DESC, id DESC
  FETCH FIRST 1 ROW ONLY
) o ON TRUE;
```

---

## Appendix C. Debugging Checklist for SELECT Queries

### C.1 Wrong row counts

- Check join fan-out: a one-to-many join multiplies rows unless aggregated or deduped.
- Check outer joins: filters on outer tables belong in `ON` vs `WHERE` deliberately.

### C.2 Surprising NULLs

- Inspect left joins and optional relationships.
- Remember aggregate null behavior and `FILTER`.

### C.3 Slow sorts and limits

- Confirm `ORDER BY` columns are indexed or that sort keys match query needs.
- Replace deep `OFFSET` with keyset pagination when latency grows linearly.

### C.4 Planner surprises

- Run `EXPLAIN (ANALYZE, BUFFERS)` on production-like data.
- Check for function calls on indexed columns and implicit casts.

---

## Appendix D. Mini glossary (SELECT-focused)

- **Projection**: choosing columns/expressions in `SELECT`.
- **Predicate**: boolean filter in `WHERE`/`HAVING`.
- **Relation**: table, view, or derived table in `FROM`.
- **Correlation**: subquery references outer query columns.
- **Sargable**: predicate shape that can use an index well.
- **Frame**: row window for window functions.
- **Semi-join**: `EXISTS` style logic; stops at first match.

---

## Appendix E. Version notes (PostgreSQL)

Modern versions continue to improve parallel aggregation, partition pruning, and incremental sorts. When you adopt newer features (`GROUPING SETS`, better parallel plans), re-benchmark old queries rather than assuming prior hints still apply.

---

## Appendix F. More SQL drills (performance-shaped)

### F.1 Covering sort + limit with indexes

```sql
-- If you frequently run:
SELECT id, created_at FROM events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50;
-- Consider an index on (user_id, created_at DESC, id DESC) for index-friendly sorts.
```

### F.2 Partial aggregates with FILTER vs boolean columns

```sql
SELECT date_trunc('day', ts)::date AS d,
       avg(latency_ms) FILTER (WHERE ok) AS avg_ok,
       avg(latency_ms) FILTER (WHERE NOT ok) AS avg_err
FROM http_logs
GROUP BY 1;
```

### F.3 Moving average (window frame)

```sql
SELECT ts, value,
       avg(value) OVER (ORDER BY ts ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7
FROM metrics;
```

### F.4 Percent rank and ntile reporting bands

```sql
SELECT id, amount,
       ntile(10) OVER (ORDER BY amount) AS decile,
       percent_rank() OVER (ORDER BY amount) AS pct_rank
FROM payments;
```

### F.5 Row vs range frames (ties)

```sql
SELECT id, grp, score,
       sum(score) OVER (PARTITION BY grp ORDER BY score ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_rows,
       sum(score) OVER (PARTITION BY grp ORDER BY score RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_range
FROM contest_scores;
```

### F.6 ANY / ALL with arrays from the app

```sql
SELECT *
FROM products
WHERE category_id = ANY ($1::int[]);
```

### F.7 Splitting responsibilities: CTE readability

```sql
WITH paid AS (
  SELECT customer_id, sum(amount) AS paid_total
  FROM orders
  WHERE status = 'paid'
  GROUP BY customer_id
),
counts AS (
  SELECT customer_id, count(*) AS n
  FROM orders
  GROUP BY customer_id
)
SELECT c.customer_id, c.n, coalesce(p.paid_total, 0) AS paid_total
FROM counts c
LEFT JOIN paid p USING (customer_id)
WHERE c.n >= 5;
```

### F.8 Guardrails: never delete without WHERE pattern

```sql
-- SELECT-first workflow (example)
SELECT count(*) FROM big_table WHERE created_at < now() - interval '365 days';
-- Only after validating, run DELETE/CTAS archival in a transaction.
```

### F.9 Using `VALUES` as an inline lookup table

```sql
SELECT u.id, u.score, v.band
FROM users u
JOIN (
  VALUES
    (0, 49, 'low'),
    (50, 79, 'mid'),
    (80, 100, 'high')
) AS v(min_s, max_s, band)
  ON u.score BETWEEN v.min_s AND v.max_s;
```

### F.10 `LATERAL` jsonb expansion

```sql
SELECT o.id, e.elem
FROM orders o
JOIN LATERAL jsonb_array_elements_text(o.tags) AS e(elem) ON TRUE;
```

---

## Appendix G. Interview-style questions with SQL sketches

### G.1 Find duplicates

```sql
SELECT email, count(*) AS n
FROM users
GROUP BY email
HAVING count(*) > 1;
```

### G.2 Second highest salary per department

```sql
SELECT DISTINCT ON (department_id) department_id, salary
FROM (
  SELECT department_id, salary,
         dense_rank() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dr
  FROM employees
) s
WHERE dr = 2
ORDER BY department_id;
```

### G.3 Sessions: gap-and-islands (sketch)

```sql
-- Pattern: assign a group id with sum() over flags of new session starts.
WITH ordered AS (
  SELECT user_id, event_at,
         CASE
           WHEN event_at - lag(event_at) OVER (PARTITION BY user_id ORDER BY event_at) > interval '30 minutes'
             OR lag(event_at) OVER (PARTITION BY user_id ORDER BY event_at) IS NULL
           THEN 1 ELSE 0
         END AS is_new_session
  FROM events
),
grp AS (
  SELECT user_id, event_at,
         sum(is_new_session) OVER (PARTITION BY user_id ORDER BY event_at) AS session_grp
  FROM ordered
)
SELECT user_id, session_grp, min(event_at) AS session_start, max(event_at) AS session_end
FROM grp
GROUP BY user_id, session_grp;
```

---

## Appendix H. Style guide snippets

- Prefer leading commas vs trailing? Pick one team style; PostgreSQL accepts both.
- Always specify `JOIN` type: `INNER JOIN` vs `JOIN` (same) — be explicit in teaching materials.
- Prefer `<>` or `!=` consistently; PostgreSQL supports both for inequality.

---

## Appendix I. Readability patterns for large SELECT lists

Long `SELECT` lists are hard to review in code review. Break lines one column per line, align `AS` aliases, and group columns into logical sections with comments. When the same expression repeats, lift it into a CTE column to avoid drift.

```sql
WITH enriched AS (
  SELECT
    id,
    user_id,
    created_at,
    date_trunc('day', created_at AT TIME ZONE 'UTC')::date AS day_utc
  FROM events
)
SELECT
  user_id,
  day_utc,
  count(*) AS events_per_day
FROM enriched
GROUP BY user_id, day_utc
ORDER BY user_id, day_utc;
```

### I.1 Commenting conventions

Use block comments above groups of columns, not end-of-line noise, so `psql` copy/paste stays clean.

### I.2 Consistent casting

Pick one style (`::type` vs `CAST(x AS type)`) per codebase. Mixed styles make grep-based refactors harder.

### I.3 Testing queries

Keep a `WHERE FALSE` or `LIMIT 0` variant while prototyping shapes, then remove once predicates are correct—never ship `WHERE FALSE` to production jobs.

### I.4 Explain workflow

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...
;
```

Run on realistic volumes; micro-benchmarks on empty tables mislead about sort and hash costs.

### I.5 Transaction discipline in ad hoc sessions

Wrap exploratory `UPDATE`/`DELETE` rehearsals in `BEGIN; ... ROLLBACK;` so you can validate counts before committing.

### I.6 Result shape discipline

When a query feeds an API, keep column order and names stable across releases. Prefer views or named columns over relying on ordinal positions in clients.

### I.7 Time zone reminder

Timestamps without time zone (`timestamp`) do not store an offset; `timestamptz` does. Prefer `timestamptz` for event data, then convert at the presentation layer.

---

*End of notes.*

