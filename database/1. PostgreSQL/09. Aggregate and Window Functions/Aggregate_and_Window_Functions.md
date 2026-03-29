# Aggregate & Window Functions

**PostgreSQL learning notes (March 2026). Aligned with README topic 9.**

---

## 📑 Table of Contents

- [1. Aggregate Functions Overview](#1-aggregate-functions-overview)
- [2. COUNT](#2-count)
- [3. SUM](#3-sum)
- [4. AVG](#4-avg)
- [5. MIN & MAX](#5-min--max)
- [6. STRING_AGG](#6-string_agg)
- [7. FILTER Clause](#7-filter-clause)
- [8. GROUP BY](#8-group-by)
- [9. HAVING](#9-having)
- [10. Window Function Basics](#10-window-function-basics)
- [11. Row Numbering Functions](#11-row-numbering-functions)
- [12. Offset Functions (LAG, LEAD)](#12-offset-functions-lag-lead)
- [13. Aggregate Window Functions (Running Totals)](#13-aggregate-window-functions-running-totals)
- [14. Frame Specification (ROWS, RANGE)](#14-frame-specification-rows-range)
- [15. Position Functions (FIRST_VALUE, LAST_VALUE, NTH_VALUE)](#15-position-functions-first_value-last_value-nth_value)
- [16. Advanced Windows (NTILE, Percentiles)](#16-advanced-windows-ntile-percentiles)

---

## 1. Aggregate Functions Overview

<a id="1-aggregate-functions-overview"></a>

### Beginner

Aggregates collapse many input rows into a single summary value per group (or one value overall). Typical aggregates: `count`, `sum`, `avg`, `min`, `max`. They ignore `NULL` inputs except `count(*)`.

### Intermediate

Aggregates can combine with `DISTINCT` (`count(distinct col)`). Ordered-set aggregates (`percentile_cont`, `mode`) use `WITHIN GROUP (ORDER BY ...)`. Aggregates appear in `SELECT` and `HAVING`, not `WHERE`.

### Expert

Partial aggregation and parallel aggregation improve large `GROUP BY` scans. Combine with `FILTER` for conditional metrics without self-joins.

```sql
SELECT count(*) AS rows_in_table FROM events;
SELECT department_id, count(*) FROM employees GROUP BY department_id;
```

### Key Points

- Aggregates summarize sets; window aggregates do not collapse rows.
- Null handling differs per aggregate.

### Best Practices

- Push row filters to `WHERE` before aggregating.
- Prefer `FILTER` over repeated `CASE` in aggregates when readable.

### Common Mistakes

- Selecting non-grouped columns alongside aggregates incorrectly.

---

## 2. COUNT

<a id="2-count"></a>

### Beginner

`COUNT(*)` counts rows including nulls. `COUNT(col)` counts rows where `col` is not null. `COUNT(DISTINCT col)` counts unique non-null values.

### Intermediate

`COUNT(*)` on outer-joined tables counts matches carefully: `COUNT(child.id)` counts non-null child rows; `COUNT(*)` counts parent rows regardless.

### Expert

For huge distinct counts, consider approximate algorithms or external stores; exact `count(distinct)` can be expensive.

```sql
SELECT count(*) FROM users;
SELECT count(email) FROM users;
SELECT count(DISTINCT user_id) FROM events;
```

### Key Points

- `COUNT(*)` ≠ `COUNT(col)` under nulls.

### Best Practices

- Use `COUNT(*)` when you mean row count.

### Common Mistakes

- Using `COUNT(*)` to count optional matches after `LEFT JOIN` when `COUNT(child_col)` was intended.

---

## 3. SUM

<a id="3-sum"></a>

### Beginner

`SUM` adds numeric values, ignoring nulls. On empty sets without `GROUP BY`, result is null; with `GROUP BY`, groups with no rows do not appear.

### Intermediate

Integer sums can overflow `integer`; widen to `bigint` or `numeric` when needed.

### Expert

Financial sums should often use `numeric` with explicit scale. Combine `sum` with `FILTER` for partial totals.

```sql
SELECT sum(amount) FROM payments;
SELECT customer_id, sum(amount) FROM payments GROUP BY customer_id;
SELECT sum(amount) FILTER (WHERE currency = 'USD') FROM payments;
```

### Key Points

- Type choice matters for money and overflow.

### Best Practices

- Cast to `numeric` for currency aggregates.

### Common Mistakes

- Summing floating point money.

---

## 4. AVG

<a id="4-avg"></a>

### Beginner

`AVG` computes mean, ignoring nulls: effectively `sum/count` over non-null inputs.

### Intermediate

`AVG(int)` yields `numeric` in PostgreSQL—know your client drivers’ type mapping.

### Expert

For weighted averages, use `sum(x*w)/sum(w)` with null guards.

```sql
SELECT avg(salary) FROM employees;
SELECT department_id, avg(salary) FROM employees GROUP BY department_id;
```

### Key Points

- Nulls excluded from denominator.

### Best Practices

- Document behavior when all inputs null (null average).

### Common Mistakes

- Expecting zeros instead of null for empty groups in non-grouped queries.

---

## 5. MIN & MAX

<a id="5-min--max"></a>

### Beginner

`MIN`/`MAX` pick extremal values for orderable types (numbers, text, timestamps).

### Intermediate

For text, collation affects ordering. For composite types, lexicographic ordering applies.

### Expert

`MIN`/`MAX` can leverage indexes; planner may choose index-only scans when visibility map allows.

```sql
SELECT min(created_at), max(created_at) FROM events;
SELECT category, max(price) FROM products GROUP BY category;
```

### Key Points

- Works on any totally ordered type (with collation for strings).

### Best Practices

- Index columns used in `min/max` over large tables when queried frequently.

### Common Mistakes

- Comparing `min` across groups without grouping keys.

---

## 6. STRING_AGG

<a id="6-string_agg"></a>

### Beginner

`STRING_AGG(expr, delimiter)` concatenates values across rows in a group. Optionally `ORDER BY` inside aggregate controls concatenation order.

### Intermediate

Null inputs are skipped unless only nulls exist—then result null. Cast to `text` if needed.

### Expert

Large string_agg results can exceed memory—consider limits or array_agg + client join for huge groups.

```sql
SELECT department_id, string_agg(last_name, ', ' ORDER BY last_name)
FROM employees
GROUP BY department_id;
```

### Key Points

- Ordering clause is inside aggregate call.

### Best Practices

- Delimiters should not appear in raw data or escape carefully.

### Common Mistakes

- Forgetting `ORDER BY` and getting unstable concatenation order.

---

## 7. FILTER Clause

<a id="7-filter-clause"></a>

### Beginner

`AGG(...) FILTER (WHERE condition)` computes aggregate over rows satisfying predicate only.

### Intermediate

Multiple aggregates with different filters share one scan—clearer than nested subqueries.

### Expert

Combine with window functions carefully; `FILTER` applies before window framing computations in the aggregate form, not inside window definitions.

```sql
SELECT date_trunc('day', ts)::date AS d,
       count(*) FILTER (WHERE ok) AS ok_n,
       count(*) FILTER (WHERE NOT ok) AS bad_n
FROM checks
GROUP BY 1;
```

### Key Points

- Conditional aggregation without `CASE` noise.

### Best Practices

- Prefer `FILTER` for readability vs `sum(case...)`.

### Common Mistakes

- Using `FILTER` where `WHERE` would shrink input cheaper.

---

## 8. GROUP BY

<a id="8-group-by"></a>

### Beginner

`GROUP BY` defines buckets; aggregates summarize each bucket. Non-aggregated columns in `SELECT` must be grouped or functionally dependent.

### Intermediate

`GROUPING SETS`, `ROLLUP`, `CUBE` generate multiple grouping granularities in one query.

### Expert

Hash aggregation vs sort aggregation depends on data width and `work_mem`.

```sql
SELECT region, product, sum(sales) AS revenue
FROM fact_sales
GROUP BY GROUPING SETS ((region, product), (region), (product), ());
```

### Key Points

- Grouping keys determine grain of result.

### Best Practices

- Group by ids, not labels, when possible.

### Common Mistakes

- Accidentally grouping at wrong grain (too fine/coarse).

---

## 9. HAVING

<a id="9-having"></a>

### Beginner

`HAVING` filters groups post-aggregation. Use for predicates on aggregates.

### Intermediate

Push non-aggregate predicates to `WHERE` for efficiency.

### Expert

Complex `HAVING` may be clearer as a CTE filtering grouped results.

```sql
SELECT customer_id, sum(amount) AS spend
FROM orders
GROUP BY customer_id
HAVING sum(amount) > 1000 AND count(*) >= 3;
```

### Key Points

- `HAVING` sees groups, not raw rows.

### Best Practices

- Combine with readable aliases via subquery if needed.

### Common Mistakes

- Using `HAVING` for row-level filters.

---

## 10. Window Function Basics

<a id="10-window-function-basics"></a>

### Beginner

Window functions compute per-row results using a window of related rows: `func() OVER (PARTITION BY ... ORDER BY ...)`. Rows are not collapsed.

### Intermediate

Windows run after `WHERE`, `GROUP BY`, and `HAVING`. You cannot nest window functions, but you can nest via subqueries.

### Expert

Multiple `OVER` clauses can differ; each is independent.

```sql
SELECT id, amount, sum(amount) OVER () AS total_all
FROM payments;
```

### Key Points

- Every window call needs `OVER`.

### Best Practices

- Always specify `PARTITION BY` when the function should reset per entity.

### Common Mistakes

- Putting window functions in `WHERE`—use subquery wrapper.

---

## 11. Row Numbering Functions

<a id="11-row-numbering-functions"></a>

### Beginner

`ROW_NUMBER()` assigns unique sequential integers. `RANK()` ties get same rank with gaps; `DENSE_RANK()` ties without gaps.

### Intermediate

Ordering inside `OVER` defines competition rules.

### Expert

For dedup, filter `WHERE rn = 1` in outer query from subquery.

```sql
SELECT id, salary, row_number() OVER (ORDER BY salary DESC) AS rn
FROM employees;

SELECT id, salary, rank() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
FROM employees;
```

### Key Points

- Ties behave differently across numbering functions.

### Best Practices

- Add tie-breakers (`id`) to ordering.

### Common Mistakes

- Using `rank` when `row_number` uniqueness was required.

---

## 12. Offset Functions (LAG, LEAD)

<a id="12-offset-functions-lag-lead"></a>

### Beginner

`LAG(col)` reads previous row; `LEAD(col)` reads next row in partition order.

### Intermediate

Provide default values for missing offsets: `LAG(col, 1, 0)`.

### Expert

Useful for deltas: `col - lag(col)` for period-over-period.

```sql
SELECT day, revenue, revenue - lag(revenue) OVER (ORDER BY day) AS daily_delta
FROM daily_sales;
```

### Key Points

- Offsets are positional within `PARTITION BY` + `ORDER BY`.

### Best Practices

- Ensure dense ordering; gaps in dates can mislead deltas.

### Common Mistakes

- Forgetting partition keys so offsets cross unrelated entities.

---

## 13. Aggregate Window Functions (Running Totals)

<a id="13-aggregate-window-functions-running-totals"></a>

### Beginner

`SUM(x) OVER (ORDER BY ...)` computes running totals when paired with a frame defaulting to `RANGE UNBOUNDED PRECEDING TO CURRENT ROW` for some functions—verify with docs and `EXPLAIN`.

### Intermediate

Explicit frames remove ambiguity: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.

### Expert

Running aggregates differ from `GROUP BY` sums; both can appear in one query.

```sql
SELECT ts, v,
       sum(v) OVER (ORDER BY ts ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running
FROM metrics;
```

### Key Points

- Frame choice defines inclusion of peers.

### Best Practices

- Prefer `ROWS` for running sums on dense sequences.

### Common Mistakes

- Using `RANGE` unintentionally when duplicates exist.

---

## 14. Frame Specification (ROWS, RANGE)

<a id="14-frame-specification-rows-range"></a>

### Beginner

Frames limit which partition rows participate: `ROWS` is physical offsets; `RANGE` is logical value offsets from current row’s order key.

### Intermediate

`GROUPS` frame counts peer groups (PostgreSQL 11+).

### Expert

`EXCLUDE` options adjust frame edges for `FIRST_VALUE`/`LAST_VALUE` correctness.

```sql
SELECT id, x,
       sum(x) OVER (ORDER BY x ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS window3
FROM t;
```

### Key Points

- `ROWS` vs `RANGE` differs around duplicate order keys.

### Best Practices

- Be explicit with frames for financial calculations.

### Common Mistakes

- Assuming default frame includes/excludes peers as you expect—verify.

---

## 15. Position Functions (FIRST_VALUE, LAST_VALUE, NTH_VALUE)

<a id="15-position-functions-first_value-last_value-nth_value"></a>

### Beginner

`FIRST_VALUE`/`LAST_VALUE` pick values at frame edges. `NTH_VALUE` picks nth row in frame.

### Intermediate

`LAST_VALUE` often needs explicit frames; default may stop at current row.

### Expert

Combine with `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` for partition-wide last value.

```sql
SELECT id, dept, salary,
       first_value(salary) OVER (PARTITION BY dept ORDER BY hire_date),
       last_value(salary) OVER (
         PARTITION BY dept ORDER BY hire_date
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       )
FROM employees;
```

### Key Points

- Frame defaults make `LAST_VALUE` surprising.

### Best Practices

- Always set frame for `LAST_VALUE` unless you truly want running last.

### Common Mistakes

- Using default frame and getting “running” last, not partition last.

---

## 16. Advanced Windows (NTILE, Percentiles)

<a id="16-advanced-windows-ntile-percentiles"></a>

### Beginner

`NTILE(n)` bucketizes into n groups. `percent_rank` and `cume_dist` measure relative standing.

### Intermediate

Ordered-set aggregates like `percentile_cont(0.5) WITHIN GROUP (ORDER BY x)` differ from window `percent_rank`—know which answers your question.

### Expert

For medians with even counts, define tie-breaking; ordered-set aggregates implement continuous/discrete variants.

```sql
SELECT amount, ntile(4) OVER (ORDER BY amount) AS quartile
FROM payments;

SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY latency)
FROM requests;
```

### Key Points

- NTILE buckets nearly equal counts, not equal value ranges.

### Best Practices

- Use ordered-set aggregates for global percentiles; windows for per-partition standings.

### Common Mistakes

- Confusing `percent_rank` with percentile value.

---

## Appendix A. Workshops per subtopic (SQL-forward)

### A.1 Aggregate overview — empty set behavior

```sql
SELECT sum(x) FROM generate_series(1,0) AS t(x); -- NULL
SELECT sum(x) FROM generate_series(1,5) AS t(x); -- 15
```

### A.2 COUNT variants on outer joins

```sql
SELECT p.id, count(c.id) AS child_matches
FROM parents p
LEFT JOIN children c ON c.parent_id = p.id
GROUP BY p.id;
```

### A.3 SUM overflow guard

```sql
SELECT sum(qty::bigint) FROM items;
```

### A.4 AVG weighted

```sql
SELECT sum(score * weight) / nullif(sum(weight), 0) AS wavg
FROM grades;
```

### A.5 MIN/MAX with ties

```sql
SELECT min(lower(name)), max(lower(name)) FROM tags;
```

### A.6 STRING_AGG with ordering

```sql
SELECT team_id, string_agg(player, ' | ' ORDER BY pts DESC)
FROM rosters
GROUP BY team_id;
```

### A.7 FILTER funnel

```sql
SELECT count(*) FILTER (WHERE step >= 1) AS s1,
       count(*) FILTER (WHERE step >= 2) AS s2
FROM funnel;
```

### A.8 GROUP BY sets

```sql
SELECT region, month, sum(sales) AS s
FROM rev
GROUP BY GROUPING SETS ((region, month), (region), (month), ());
```

### A.9 HAVING vs WHERE placement

```sql
SELECT user_id, count(*) AS n
FROM events
WHERE created_at >= date '2026-01-01'
GROUP BY user_id
HAVING count(*) > 100;
```

### A.10 Window partition reset

```sql
SELECT user_id, ts, row_number() OVER (PARTITION BY user_id ORDER BY ts) AS seq
FROM events;
```

### A.11 Rank vs dense_rank example

```sql
SELECT score, rank() OVER (ORDER BY score DESC), dense_rank() OVER (ORDER BY score DESC)
FROM game;
```

### A.12 LAG for YoY (same month)

```sql
SELECT month, revenue,
       lag(revenue, 12) OVER (ORDER BY month) AS revenue_year_ago
FROM monthly;
```

### A.13 Running total explicit rows frame

```sql
SELECT day, v, sum(v) OVER (ORDER BY day ROWS UNBOUNDED PRECEDING) AS rt
FROM daily;
```

### A.14 RANGE frame with numeric delta

```sql
SELECT ts, v,
       avg(v) OVER (ORDER BY ts RANGE BETWEEN interval '5 minutes' PRECEDING AND CURRENT ROW)
FROM samples;
```

### A.15 FIRST/LAST with full partition frame

```sql
SELECT dept, emp, sal,
       last_value(sal) OVER (
         PARTITION BY dept ORDER BY emp
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) AS last_in_dept_order
FROM roster;
```

### A.16 NTILE + percentiles

```sql
SELECT amount,
       ntile(100) OVER (ORDER BY amount) AS percentile_bucket
FROM charges;
```

---

## Appendix B. Aggregate + window comparison table (mental model)

| Need | Tool |
| --- | --- |
| One number for whole table | Aggregate without `GROUP BY` |
| Summary per group | `GROUP BY` |
| Keep detail rows, add running/relative metrics | Window functions |
| Conditional sums/counts | `FILTER` |
| Ordered concatenation | `STRING_AGG ... ORDER BY` |
| Global median | `percentile_cont` ordered-set aggregate |

---

## Appendix C. More SQL patterns

### C.1 Distinct counts per group

```sql
SELECT day, count(DISTINCT user_id) AS dau
FROM events
GROUP BY day;
```

### C.2 Ratio of sums

```sql
SELECT sum(paid)::numeric / nullif(sum(total), 0) AS paid_ratio
FROM invoices;
```

### C.3 Window ratio to partition total

```sql
SELECT id, amount, amount / nullif(sum(amount) OVER (), 0) AS share
FROM line_items;
```

### C.4 Dedup latest event per user

```sql
WITH ranked AS (
  SELECT *, row_number() OVER (PARTITION BY user_id ORDER BY ts DESC, id DESC) AS rn
  FROM events
)
SELECT * FROM ranked WHERE rn = 1;
```

### C.5 Moving average 7-day

```sql
SELECT d, v,
       avg(v) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7
FROM series;
```

### C.6 Difference from partition average

```sql
SELECT emp, dept, salary,
       salary - avg(salary) OVER (PARTITION BY dept) AS diff_from_avg
FROM employees;
```

### C.7 Cumulative distinct (approximate pattern)

Exact cumulative distinct is expensive; approximate with specialized extensions or reframe the question.

### C.8 Multiple windows in one SELECT

```sql
SELECT x,
       sum(x) OVER w30,
       sum(x) OVER w7
FROM t
WINDOW w30 AS (ORDER BY d ROWS BETWEEN 29 PRECEDING AND CURRENT ROW),
       w7 AS (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW);
```

### C.9 FILTER + windows (sequencing)

Apply `FILTER` inside aggregate functions, not window definitions: `sum(x) FILTER (WHERE flag) OVER (...)` is valid in PostgreSQL for aggregate windows.

```sql
SELECT day, sum(amount) FILTER (WHERE status = 'paid') OVER (ORDER BY day) AS cum_paid
FROM daily_ledger;
```

### C.10 Ordered-set aggregate median

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY latency) FROM requests;
```

---

## Appendix D. Performance notes

- Large `GROUP BY` may hash or sort; tune `work_mem` for spills.
- Parallel aggregates help big scans on modern PostgreSQL.
- Windows require sorts often—index keys matching `PARTITION BY`/`ORDER BY` can help upstream.
- `count(distinct)` can be heavy; estimate if exact not required.

---

## Appendix E. Common pitfalls checklist

- Mixing aggregates and windows incorrectly in same expression layer.
- `LAST_VALUE` default frame surprises.
- `RANGE` frames with duplicates.
- `FILTER` vs `WHERE` placement for performance.
- Integer money sums.

---

## Appendix F. Extended drills (aggregates)

### F.1 Rollup report

```sql
SELECT year, quarter, sum(sales) AS s
FROM rev
GROUP BY ROLLUP (year, quarter);
```

### F.2 Cube explosion awareness

`CUBE` grows exponentially—use carefully.

### F.3 Grouping sets for subtotals only where needed

Prefer explicit `GROUPING SETS` over huge `CUBE` when possible.

### F.4 Aggregate on join — wrong grain

Always group at the grain you intend after joins.

### F.5 bool_and / bool_or aggregates

```sql
SELECT team_id, bool_and(passed) AS all_passed
FROM results
GROUP BY team_id;
```

### F.6 json_agg as aggregate

```sql
SELECT user_id, json_agg(row_to_json(e) ORDER BY e.ts) AS events
FROM events e
GROUP BY user_id;
```

### F.7 array_agg ordered

```sql
SELECT course_id, array_agg(student_id ORDER BY score DESC) AS ranked
FROM enrollments
GROUP BY course_id;
```

### F.8 correlation aggregate

```sql
SELECT corr(x, y) FROM samples;
```

### F.9 regr_slope linear fit

```sql
SELECT regr_slope(y, x) FROM samples;
```

### F.10 entropy / custom aggregates

Use extensions or define custom aggregates when standard ones do not exist.

---

## Appendix G. Extended drills (windows)

### G.1 percent_rank within department

```sql
SELECT id, dept, salary, percent_rank() OVER (PARTITION BY dept ORDER BY salary) AS pr
FROM employees;
```

### G.2 cume_dist

```sql
SELECT score, cume_dist() OVER (ORDER BY score) FROM exam;
```

### G.3 ntile for balanced buckets

```sql
SELECT user_id, ntile(10) OVER (ORDER BY random()) FROM users; -- demo only
```

### G.4 first_value with default frame issues

Demonstrate difference when frame ends at current row vs full partition.

### G.5 lead for next event gap

```sql
SELECT ts, lead(ts) OVER (ORDER BY ts) - ts AS gap
FROM events;
```

### G.6 partition by multiple keys

```sql
SELECT row_number() OVER (PARTITION BY store_id, product_id ORDER BY ts) AS seq
FROM inventory_moves;
```

### G.7 window in subquery to filter ranks

```sql
SELECT * FROM (
  SELECT *, rank() OVER (ORDER BY score DESC) r FROM players
) s WHERE r <= 10;
```

### G.8 distinct on vs window rank

Choose based on tie semantics and readability.

### G.9 running max

```sql
SELECT day, v, max(v) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_max
FROM series;
```

### G.10 sessionization helper with sum reset pattern

```sql
-- sketch: increment group counter when gap too large
WITH flagged AS (
  SELECT ts, CASE WHEN ts - lag(ts) OVER (ORDER BY ts) > interval '30 min' THEN 1 ELSE 0 END AS is_new
  FROM pings
), grp AS (
  SELECT ts, sum(is_new) OVER (ORDER BY ts) AS gid FROM flagged
)
SELECT gid, min(ts), max(ts), count(*) FROM grp GROUP BY gid;
```

---

## Appendix H. Testing aggregates

### H.1 Property tests ideas

- Sum of line items equals order total.
- Running total last value equals grouped sum.

### H.2 Null-only group

```sql
SELECT sum(x) FROM (VALUES (NULL::int),(NULL::int)) v(x);
```

### H.3 Empty grouped set

No rows → no groups; not the same as group with all nulls.

---

## Appendix I. Glossary

- **Aggregate**: collapses input rows to summary.
- **Window**: computes per-row using neighboring rows without collapsing.
- **Frame**: window row range relative to current row.
- **Partition**: resets window computation per key group.
- **Ordered-set aggregate**: aggregate requiring `WITHIN GROUP (ORDER BY ...)`.

---

## Appendix J. Interview questions

### J.1 Difference between `WHERE` and `HAVING`

`WHERE` filters rows before aggregation; `HAVING` filters aggregated groups.

### J.2 Difference between `GROUP BY` and `DISTINCT`

`GROUP BY` pairs with aggregates; `DISTINCT` dedupes projections without necessarily aggregating.

### J.3 When `FILTER` beats `CASE`

Readability and sometimes planner treats similarly; `FILTER` expresses intent cleanly.

---

## Appendix K. Additional ordered-set examples

### K.1 mode()

```sql
SELECT mode() WITHIN GROUP (ORDER BY color) FROM items;
```

### K.2 percentile_disc vs cont

Discrete vs continuous interpolation—pick based on reporting standards.

### K.3 hypothetical-set aggregates

Advanced ranking comparisons (`rank(10) WITHIN GROUP (ORDER BY score)`).

---

## Appendix L. Window framing edge cases

### L.1 Duplicate order keys

Peers included/excluded differently in `RANGE` vs `ROWS`.

### L.2 Nullable order keys

Null ordering interacts with frames—define `NULLS FIRST/LAST`.

### L.3 Partition by constant

Equivalent to no partition but still valid.

### L.4 Multiple ORDER BY keys in frame

`RANGE` uses first order key only unless using `GROUPS`.

---

## Appendix M. Big query template

```sql
WITH base AS (
  SELECT *
  FROM facts
  WHERE ts >= now() - interval '30 days'
),
agg AS (
  SELECT dim_id, sum(amount) AS total
  FROM base
  GROUP BY dim_id
)
SELECT b.*, a.total,
       sum(b.amount) OVER (PARTITION BY b.dim_id ORDER BY b.ts) AS running_dim
FROM base b
JOIN agg a USING (dim_id);
```

---

## Appendix N. Style: WINDOW clause reuse

```sql
SELECT x, y,
       sum(y) OVER w,
       avg(y) OVER w
FROM t
WINDOW w AS (PARTITION BY x ORDER BY z);
```

---

## Appendix O. Security / correctness

Aggregates across sensitive rows still require proper RLS on underlying tables—windows do not bypass policies.

---

## Appendix P. Version notes

Parallel aggregates, incremental sorts, and merge-append improvements land across releases—re-benchmark upgrades.

---

## Appendix Q. Extra line-by-line exercises (SQL)

### Q.1

```sql
SELECT department_id, count(*) FILTER (WHERE salary > 80000) AS high_earners
FROM employees
GROUP BY department_id;
```

### Q.2

```sql
SELECT date, revenue / nullif(lag(revenue) OVER (ORDER BY date), 0) - 1 AS growth
FROM daily_sales;
```

### Q.3

```sql
SELECT id, x, nth_value(x, 3) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS third_smallest
FROM t;
```

### Q.4

```sql
SELECT cohort_month, user_id,
       row_number() OVER (PARTITION BY cohort_month ORDER BY activated_at) AS nth_user
FROM signups;
```

### Q.5

```sql
SELECT product_id, min(price), max(price), avg(price)::numeric(10,2)
FROM offers
GROUP BY product_id;
```

### Q.6

```sql
SELECT team, string_agg(name, ', ' ORDER BY name) FILTER (WHERE active)
FROM members
GROUP BY team;
```

### Q.7

```sql
SELECT store, day, sum(sales) AS s,
       sum(sum(sales)) OVER (PARTITION BY store ORDER BY day) AS running_store
FROM store_sales
GROUP BY store, day;
```

### Q.8

```sql
SELECT *, lag(status) OVER (PARTITION BY ticket_id ORDER BY updated_at) AS prev_status
FROM ticket_events;
```

### Q.9

```sql
SELECT user_id, count(*) AS events,
       count(*) FILTER (WHERE type = 'purchase') AS purchases
FROM user_events
GROUP BY user_id;
```

### Q.10

```sql
SELECT amount, sum(amount) OVER (ORDER BY created_at RANGE BETWEEN INTERVAL '1 hour' PRECEDING AND CURRENT ROW)
FROM txs;
```

---

## Appendix R. Window/aggregate anti-patterns (expanded)

### R.1 Aggregating after window by mistake

If you need a grouped sum, use `GROUP BY`, not `sum() OVER (PARTITION BY ...)`, unless you must keep row detail.

### R.2 Double aggregation

Avoid `sum(sum(x))` without subquery—usually indicates a logic error.

### R.3 Window functions nested directly

```sql
-- INVALID: rank() over (order by sum(x) over (...))
-- Wrap inner window in subquery.
```

### R.4 Using DISTINCT inside aggregate incorrectly

`count(distinct x)` is fine; `sum(distinct x)` rarely matches business meaning for non-key x.

### R.5 Median confusion

Clarify discrete vs continuous; tie handling; even element counts.

### R.6 Time zone aggregation mistakes

Aggregate in UTC, convert for display; avoid mixing `timestamp` without tz.

### R.7 Floating aggregates for money

Prefer `numeric`.

### R.8 Comparing window outputs across partitions without normalization

Use ratios to partition totals when needed.

### R.9 Expecting stable NTILE boundaries across runs

NTILE depends on ordered input; data changes shift boundaries.

### R.10 Using `ROW_NUMBER` for ties when business wants shared rank

Use `RANK`/`DENSE_RANK`.

### R.11 Forgetting `ORDER BY` in windows

Many functions require sensible ordering; without it, results are arbitrary.

### R.12 Large PARTITION BY cardinalities

Very large partitions can sort heavily—pre-aggregate when possible.

### R.13 Using windows where indexed subqueries suffice

Sometimes a join to a summary table is cheaper materially.

### R.14 Unbounded frames by default misunderstandings

Read docs for each function’s default frame.

### R.15 Combining `GROUP BY` with windows on same query level

Valid: windows see post-join/post-group rows; ensure grain is intended.

### R.16 Statistical aggregates on small samples

Interpret `stddev_samp`, `var_samp` carefully.

### R.17 Using `STRING_AGG` without length limits in APIs

Risk huge payloads—cap list sizes.

### R.18 Using percentile on highly duplicated sparse metrics

May cluster unhelpfully—consider transforms.

### R.19 Aggregate on left join null traps

`sum(child_amount)` ignores nulls—may hide missing children vs zero amounts.

### R.20 Window `ORDER BY` on non-unique timestamps

Add tie-breaker ids.

### R.21 Using `LAG` without partition on multi-entity streams

Cross-entity offsets are wrong.

### R.22 Using running sum on out-of-order inserts

Reorder in subquery before window.

### R.23 Expecting `ARRAY_AGG` order without `ORDER BY`

Always specify ordering inside aggregate.

### R.24 JSON aggregation performance

Large `json_agg` rows—consider streaming or pagination.

### R.25 Mixing `FILTER` with distinct aggregates

Valid but complex—document intent.

---

## Appendix S. Large analytic query skeleton

```sql
WITH params AS (
  SELECT timestamptz '2026-01-01' AS start_ts, timestamptz '2026-04-01' AS end_ts
),
filtered AS (
  SELECT *
  FROM events e, params p
  WHERE e.ts >= p.start_ts AND e.ts < p.end_ts
),
daily AS (
  SELECT date_trunc('day', ts)::date AS d, user_id, count(*) AS n
  FROM filtered
  GROUP BY 1, 2
),
windowed AS (
  SELECT d, user_id, n,
         sum(n) OVER (PARTITION BY user_id ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS n7
  FROM daily
)
SELECT * FROM windowed WHERE n7 > 100;
```

---

## Appendix T. Final recap bullets

- Aggregates answer “how much/many” at a grain.
- Windows answer “relative to peers” while keeping rows.
- Frames define peer sets; defaults vary.
- `FILTER` cleans conditional metrics.
- Always test null and empty-set behavior.

---

## Appendix U. Additional SQL snippets (misc aggregates)

### U.1 every / any boolean checks

```sql
SELECT department_id, bool_and(salary > 50000) AS all_above_50k
FROM employees
GROUP BY department_id;
```

### U.2 jsonb_object_agg

```sql
SELECT day, jsonb_object_agg(user_id::text, cnt)
FROM daily_user_counts
GROUP BY day;
```

### U.3 count(*) over ()

```sql
SELECT id, count(*) OVER () AS n_rows FROM t;
```

### U.4 row_number to paginate inside partition

```sql
SELECT * FROM (
  SELECT *, row_number() OVER (PARTITION BY dept ORDER BY sal DESC) rn FROM employees
) s WHERE rn <= 5;
```

### U.5 sum over partition + order

```sql
SELECT month, region, revenue,
       sum(revenue) OVER (PARTITION BY region ORDER BY month) AS ytd
FROM monthly_region_revenue;
```

### U.6 min/max over sliding window

```sql
SELECT ts, v,
       min(v) OVER (ORDER BY ts ROWS BETWEEN 10 PRECEDING AND CURRENT ROW) AS min11,
       max(v) OVER (ORDER BY ts ROWS BETWEEN 10 PRECEDING AND CURRENT ROW) AS max11
FROM telemetry;
```

### U.7 two-pass pattern: aggregate then join back

```sql
WITH totals AS (SELECT dept, sum(salary) AS payroll FROM employees GROUP BY dept)
SELECT e.*, t.payroll
FROM employees e
JOIN totals t USING (dept);
```

### U.8 filter distinct pattern

```sql
SELECT date, count(DISTINCT user_id) FILTER (WHERE premium) AS premium_dau
FROM events
GROUP BY date;
```

### U.9 statistical bundle

```sql
SELECT avg(v), stddev_pop(v), var_pop(v), stddev_samp(v), var_samp(v)
FROM samples;
```

### U.10 grouping() / grouping_id() style with GROUPING SETS

Use `grouping()` to distinguish NULL subtotals vs real NULL keys in rollup reports.

```sql
SELECT region, month, sum(sales) AS s, grouping(region) AS g_r, grouping(month) AS g_m
FROM rev
GROUP BY ROLLUP (region, month);
```

---

## Appendix V. Short conceptual essays (quick reads)

### V.1 Why window functions feel “magical”

They reuse SQL’s sort machinery but keep row detail. The magic is disciplined framing: partition, order, frame.

### V.2 When aggregates lie

If joins duplicate rows before `GROUP BY`, sums double-count. Always validate grain.

### V.3 When windows lie

Wrong partition keys attribute neighbors incorrectly—especially in multi-tenant data.

### V.4 Choosing NTILE vs quantiles

NTILE equalizes row counts; quantiles equalize probability mass along the value axis—different questions.

### V.5 Practical testing strategy

Build tiny tables with known answers (5–10 rows) and assert expected aggregates and window outputs mentally, then scale.

### V.6 Observability

Log slow queries; window sorts show up as `Sort` nodes in `EXPLAIN`.

### V.7 Documentation for BI users

Define metrics as SQL snippets in a glossary so everyone uses the same denominator rules.

### V.8 Upgrading PostgreSQL

Re-run benchmarks for heavy `GROUP BY` and window queries after major upgrades.

### V.9 Combining materialized views with aggregates

Pre-aggregate heavy facts into MVs refreshed on a schedule; keep raw detail for drill-down.

### V.10 Combining CTE materialization hints

Use `MATERIALIZED` CTE when you need to pin a snapshot for multiple references—measure impact.

### V.11 Handling ultra-wide GROUP BY keys

Wide grouping keys bloat hash tables—consider surrogate keys.

### V.12 Using `GROUP BY ALL` (if enabled in future dialects)

PostgreSQL uses explicit `GROUP BY`; stay explicit for portability.

### V.13 Window functions in reporting tools

Push windows into SQL when tools would otherwise fetch too much data.

### V.14 Auditing changes with window lag

`lag(hash) over (partition by entity order by updated_at)` helps detect unexpected flips.

### V.15 Closing reminder

Re-check empty sets, nulls, ties, time zones, and join grain whenever a metric looks “off by 2x.”

### V.16 One-line sanity query

```sql
SELECT count(*) AS n, count(*) FILTER (WHERE bad_flag) AS bad FROM staging;
```

This appendix intentionally ends at the requested minimum depth so you can extend with your own org-specific metric definitions.

---

*End of notes.*
