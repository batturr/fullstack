# Stored Procedures and Functions

**PostgreSQL learning notes (March 2026). Aligned with README topic 15.**

---

## 📑 Table of Contents

- [1. Function Basics](#1-function-basics)
- [2. SQL Functions](#2-sql-functions)
- [3. PL/pgSQL Functions](#3-plpgsql-functions)
- [4. PL/pgSQL Variables](#4-plpgsql-variables)
- [5. Control Structures (IF / CASE / LOOP / FOR)](#5-control-structures-if--case--loop--for)
- [6. Cursors](#6-cursors)
- [7. Error Handling (EXCEPTION, RAISE)](#7-error-handling-exception-raise)
- [8. Returning Data (RETURN NEXT / RETURN QUERY)](#8-returning-data-return-next--return-query)
- [9. Function Parameters (IN / OUT / INOUT / VARIADIC)](#9-function-parameters-in--out--inout--variadic)
- [10. Triggers & Trigger Functions](#10-triggers--trigger-functions)
- [11. Custom Aggregate Functions](#11-custom-aggregate-functions)
- [12. Custom Window Functions](#12-custom-window-functions)
- [13. Function Performance](#13-function-performance)
- [14. Transaction Control in Functions](#14-transaction-control-in-functions)
- [15. Stored Procedures (CREATE PROCEDURE, CALL)](#15-stored-procedures-create-procedure-call)
- [16. Advanced Techniques (Polymorphic, Dynamic SQL)](#16-advanced-techniques-polymorphic-dynamic-sql)

---

## 1. Function Basics

<a id="1-function-basics"></a>

### Beginner

A **function** is a named routine stored in the database. You call it from SQL (`SELECT myfunc()`), triggers, or other functions. It has a **language** (SQL, PL/pgSQL, etc.), arguments, and a return type (`RETURNS`).

### Intermediate

Functions run with the privileges of the **invoker** unless marked `SECURITY DEFINER` (elevated—use carefully). Functions can be **overloaded** (same name, different argument types). Volatility categories (`IMMUTABLE`, `STABLE`, `VOLATILE`) guide optimization.

### Expert

Functions can be **inlineable** when simple SQL functions meet criteria—then the planner folds them into outer queries. `PARALLEL` safety markers (`PARALLEL UNSAFE/RESTRICTED/SAFE`) affect parallel plans. `LEAKPROOF` matters for security-barrier views.

```sql
CREATE OR REPLACE FUNCTION add_ints(a int, b int)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT a + b;
$$;

SELECT add_ints(2, 3);

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid;
$$;
```

### Key Points

- Functions encapsulate logic close to data for reuse and consistency.
- `SECURITY DEFINER` requires hardening `search_path` and explicit schema qualification.
- Volatility must reflect truth—lying breaks optimizations and results.

### Best Practices

- Prefer `LANGUAGE sql` for simple expressions—often inlines cleanly.
- Document function contracts (NULL handling, errors, side effects).

### Common Mistakes

- Marking volatile functions as `IMMUTABLE` to “help” the optimizer.
- Using `SECURITY DEFINER` without locking down `search_path`.

---

## 2. SQL Functions

<a id="2-sql-functions"></a>

### Beginner

`LANGUAGE sql` functions contain one or more SQL statements separated by semicolons. The **last** `SELECT` defines the return value for scalar functions.

### Intermediate

SQL functions can reference tables and use subqueries. `STABLE`/`IMMUTABLE` allow inlining when other conditions hold. Multi-statement SQL functions execute statements sequentially.

### Expert

Inlining rules depend on presence of volatile calls, aggregates, subqueries with side effects, and return type. When not inlined, they behave like subqueries with planning boundaries.

```sql
CREATE OR REPLACE FUNCTION active_customer_count()
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT count(*) FROM customers WHERE active;
$$;

CREATE OR REPLACE FUNCTION customer_region(p_id bigint)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT region FROM customers WHERE id = p_id;
$$;
```

### Key Points

- SQL functions are often simplest and fastest for pure SQL logic.
- They integrate naturally with set-returning queries when defined as `RETURNS TABLE`/`SETOF`.

### Best Practices

- Keep them side-effect free when possible for predictability.

### Common Mistakes

- Expecting procedural control flow—use PL/pgSQL instead.

---

## 3. PL/pgSQL Functions

<a id="3-plpgsql-functions"></a>

### Beginner

`LANGUAGE plpgsql` adds procedural features: variables, loops, conditionals, exceptions. The function body is a block: `DECLARE ... BEGIN ... END;`.

### Intermediate

PL/pgSQL is bytecode-interpreted in the server. Assignments use `:=`. `PERFORM` executes SQL discarding results. `RETURN QUERY` executes SQL returning rows for set-returning functions.

### Expert

PL/pgSQL can open **cursors**, use **dynamic SQL** (`EXECUTE`), and handle **transactions** differently than plain SQL functions—especially inside procedures (`COMMIT`/`ROLLBACK` allowed in procedures, not in plain functions in traditional rules—see procedures section).

```sql
CREATE OR REPLACE FUNCTION bump_version(p_key text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE app_kv SET value = (value::int + 1)::text WHERE key = p_key;
  IF NOT FOUND THEN
    INSERT INTO app_kv(key, value) VALUES (p_key, '1');
  END IF;
END;
$$;
```

### Key Points

- PL/pgSQL is the default procedural workhorse in PostgreSQL.
- Use for branching, exception handling, and multi-step logic.

### Best Practices

- Keep functions short; extract helper functions for clarity.
- Qualify SQL object names with schema to avoid `search_path` attacks in definer functions.

### Common Mistakes

- Using `SELECT` into nothing—use `PERFORM` or `GET DIAGNOSTICS`.

---

## 4. PL/pgSQL Variables

<a id="4-plpgsql-variables"></a>

### Beginner

Declare variables in `DECLARE`: names, types (`int`, `text`, `%TYPE`, `%ROWTYPE`). Assign with `:=`. Variables are scoped to the block.

### Intermediate

`%TYPE` anchors to a column type; `%ROWTYPE` anchors to a composite row shape. **Records** are dynamic row types. Arrays and custom composites are supported.

### Expert

**Aliasing** bugs occur when PL/pgSQL variable names shadow table column names—qualify table columns with table aliases in SQL embedded in functions.

```sql
CREATE OR REPLACE FUNCTION describe_order(p_id bigint)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  r orders%ROWTYPE;
BEGIN
  SELECT * INTO r FROM orders o WHERE o.id = p_id;
  IF NOT FOUND THEN
    RETURN 'missing';
  END IF;
  RETURN format('order %s status=%s', r.id, r.status);
END;
$$;
```

### Key Points

- `%ROWTYPE` captures evolving table definitions—good for maintainability.
- Shadowing causes subtle bugs—use prefixes on variables (`v_`).

### Best Practices

- Prefer `v_` prefixes for variables in SQL-heavy blocks.

### Common Mistakes

- `SELECT id INTO id FROM orders WHERE ...` ambiguity—always alias tables.

---

## 5. Control Structures (IF / CASE / LOOP / FOR)

<a id="5-control-structures-if--case--loop--for"></a>

### Beginner

`IF ... THEN ... ELSIF ... ELSE ... END IF;` branches. `CASE` supports simple and searched forms. `LOOP` with `EXIT WHEN` repeats. `FOR i IN 1..10 LOOP` iterates numeric ranges.

### Intermediate

`FOR rec IN SELECT ... LOOP` iterates query results. `WHILE` loops test before entry. `CONTINUE`/`EXIT` control inner loops.

### Expert

`FOR ... EXECUTE` dynamic SQL loops require careful quoting and parameter passing via `USING`. Iterator queries should be selective to avoid long locks depending on isolation.

```sql
CREATE OR REPLACE FUNCTION sum_first_n(n int)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  i int;
  s bigint := 0;
BEGIN
  IF n < 0 THEN
    RAISE EXCEPTION 'n must be non-negative';
  END IF;
  FOR i IN 1..n LOOP
    s := s + i;
  END LOOP;
  RETURN s;
END;
$$;
```

### Key Points

- Use `ELSIF` (single word) not `ELSE IF`.
- `FOR` query loops are convenient but hide SQL—monitor performance.

### Best Practices

- Prefer set-based SQL over row-by-row loops when volumes grow.

### Common Mistakes

- Accidentally quadratic behavior by looping and issuing SQL per iteration.

---

## 6. Cursors

<a id="6-cursors"></a>

### Beginner

A **cursor** iterates query results row-by-row. In PL/pgSQL: `DECLARE c CURSOR FOR SELECT ...;` then `FETCH`.

### Intermediate

Cursors can be **bound** to parameters (`FOR ... IN EXECUTE`). Refcursors (`REFCURSOR`) allow passing cursors between functions.

### Expert

Holdable vs not, sensitivity to updates, and transaction boundaries matter. Long-lived cursors can interact with snapshots and bloat visibility. Prefer server-side streaming patterns judiciously.

```sql
CREATE OR REPLACE FUNCTION count_open_orders_cursor()
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  c CURSOR FOR SELECT id FROM orders WHERE status = 'open';
  n bigint := 0;
  rid bigint;
BEGIN
  OPEN c;
  LOOP
    FETCH c INTO rid;
    EXIT WHEN NOT FOUND;
    n := n + 1;
  END LOOP;
  CLOSE c;
  RETURN n;
END;
$$;
```

### Key Points

- Cursors help throttle memory for huge result sets—sometimes.
- Set-based `COUNT(*)` is usually simpler—use cursors when streaming required.

### Best Practices

- Always `CLOSE` cursors opened explicitly (or use `FOR` loops that manage automatically).

### Common Mistakes

- Leaving cursors open in exception paths—use exception handlers to close.

---

## 7. Error Handling (EXCEPTION, RAISE)

<a id="7-error-handling-exception-raise"></a>

### Beginner

`RAISE EXCEPTION 'msg %', param USING ERRCODE = '23505';` throws errors. `EXCEPTION WHEN ... THEN` catches errors in PL/pgSQL blocks.

### Intermediate

Catch specific `SQLSTATE` codes (`unique_violation`, `foreign_key_violation`). `RAISE NOTICE/WARNING/INFO/DEBUG` emits messages. `GET STACKED DIAGNOSTICS` reads error details in handlers.

### Expert

Re-raise with `RAISE` inside handlers. Some errors cannot be caught (e.g., certain internal failures). Transaction state becomes **aborted** until `ROLLBACK` to savepoint in outer scopes.

```sql
CREATE OR REPLACE FUNCTION safe_insert_user(p_name text)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  new_id bigint;
BEGIN
  INSERT INTO users(name) VALUES (p_name) RETURNING id INTO new_id;
  RETURN new_id;
EXCEPTION
  WHEN unique_violation THEN
    RETURN (SELECT id FROM users WHERE name = p_name);
END;
$$;
```

### Key Points

- Exception blocks have overhead—don’t use for control flow on hot paths.
- Map business errors to meaningful SQLSTATE and messages for apps.

### Best Practices

- Include context in `RAISE` messages (`USING HINT`, `DETAIL`).

### Common Mistakes

- Swallowing errors without logging—debugging becomes impossible.

---

## 8. Returning Data (RETURN NEXT / RETURN QUERY)

<a id="8-returning-data-return-next--return-query"></a>

### Beginner

Set-returning functions use `RETURNS TABLE (...)` or `RETURNS SETOF sometype`. In PL/pgSQL, `RETURN NEXT` emits a row; `RETURN QUERY` runs a `SELECT` and returns its rows.

### Intermediate

`RETURN QUERY EXECUTE` combines dynamic SQL with set return. `LANGUAGE sql` can `RETURNS TABLE` using a final `SELECT`.

### Expert

SRFs participate in planner **Function Scan** nodes. Volatility and row estimates affect joins. Consider `RETURNS SETOF` with stable composite types for API clarity.

```sql
CREATE OR REPLACE FUNCTION orders_for_customer(p_cid bigint)
RETURNS TABLE(order_id bigint, status text)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.status
  FROM orders o
  WHERE o.customer_id = p_cid
  ORDER BY o.created_at DESC;
END;
$$;
```

### Key Points

- `RETURN QUERY` is concise for SQL-driven sets.
- Ordering in SRFs is respected unless outer query reorders.

### Best Practices

- Mark `STABLE`/`IMMUTABLE` correctly for optimization.

### Common Mistakes

- Mixing `RETURN NEXT` and `RETURN QUERY` without clarity—pick one style per function.

---

## 9. Function Parameters (IN / OUT / INOUT / VARIADIC)

<a id="9-function-parameters-in--out--inout--variadic"></a>

### Beginner

Default mode is `IN`. `OUT` parameters let you return multiple scalars without a composite. `INOUT` combines both. Call with `SELECT * FROM func(...)`.

### Intermediate

Default values apply when arguments omitted. **Named notation** `func(a := 1)` clarifies calls. `VARIADIC` accepts arrays as last arg (`VARIADIC arr int[]`).

### Expert

Overloads differ by argument type lists—be careful with ambiguities around `numeric` vs `float`. `DEFAULT` expressions must be immutable-compatible when required.

```sql
CREATE OR REPLACE FUNCTION swap(INOUT a int, INOUT b int)
LANGUAGE plpgsql
AS $$
DECLARE
  t int;
BEGIN
  t := a; a := b; b := t;
END;
$$;

CREATE OR REPLACE FUNCTION sum_all(VARIADIC nums numeric[])
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT sum(x) FROM unnest(nums) AS t(x);
$$;
```

### Key Points

- `OUT`/`INOUT` enable multiple returns without defining composite types.
- Variadic functions help wrap flexible APIs—still validate inputs.

### Best Practices

- Document parameter defaults and null behavior.

### Common Mistakes

- Overloading functions where PostgreSQL cannot choose a unique signature.

---

## 10. Triggers & Trigger Functions

<a id="10-triggers--trigger-functions"></a>

### Beginner

**Trigger functions** run on table events (`INSERT`/`UPDATE`/`DELETE`) `BEFORE` or `AFTER`, row or statement level. They return `TRIGGER` type and access `NEW`/`OLD`.

### Intermediate

`WHEN` clauses filter trigger execution. `REFERENCING` names for transition tables exist for advanced statement-level cases (version dependent features).

### Expert

Mutating `NEW` in `BEFORE` row triggers changes inserted/updated row. Recursive triggers controlled via session settings—avoid infinite loops.

```sql
CREATE OR REPLACE FUNCTION trg_orders_touch()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_updated
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trg_orders_touch();
```

### Key Points

- Keep triggers lean—heavy logic slows all writes.
- Use triggers for cross-cutting concerns: auditing, derived fields.

### Best Practices

- Explicitly schema-qualify table names inside definer trigger functions.

### Common Mistakes

- Hidden side effects that surprise application developers.

---

## 11. Custom Aggregate Functions

<a id="11-custom-aggregate-functions"></a>

### Beginner

Custom aggregates combine a **state transition function** (`SFUNC`), optional **combine function** for parallel partial aggregates, and a **final function**.

### Intermediate

Define with `CREATE AGGREGATE`. Initial condition `INITCOND` seeds state. `PARALLEL = SAFE` enables parallel partial aggregation when functions marked safe.

### Expert

Ordered aggregates and hypothetical aggregates are advanced catalog definitions—use when built-ins insufficient (special statistical summaries).

```sql
CREATE OR REPLACE FUNCTION sumsq_sfunc(state numeric, val numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$ SELECT coalesce(state,0) + (val * val) $$;

CREATE OR REPLACE FUNCTION sumsq_ffunc(state numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$ SELECT coalesce(state,0) $$;

CREATE AGGREGATE sumsq(numeric) (
  SFUNC = sumsq_sfunc,
  STYPE = numeric,
  INITCOND = '0',
  FINALFUNC = sumsq_ffunc
);

SELECT sumsq(amount) FROM orders;
```

### Key Points

- Aggregates must be strict about NULL transitions—define behavior explicitly.
- Parallel combine functions must mirror transition semantics.

### Best Practices

- Test with `EXPLAIN (COSTS OFF)` for parallel partial nodes when enabled.

### Common Mistakes

- Missing `INITCOND` leading to NULL state surprises.

---

## 12. Custom Window Functions

<a id="12-custom-window-functions"></a>

### Beginner

PostgreSQL supports custom window functions via C extensions primarily. SQL-level windowing uses built-in window functions (`row_number`, `lag`, ...).

### Intermediate

In SQL extensions, a window function reads a **frame** of rows via windowing API. Most teams implement custom window behavior with `WINDOW` definitions and built-ins.

### Expert

If you need novel analytic functions, consider: composite `RANGE/ROWS` frames, `GROUPING SETS`, or moving to procedural generation with `LATERAL` and ordered subqueries—C extensions last resort.

```sql
SELECT customer_id,
       amount,
       sum(amount) OVER (PARTITION BY customer_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM orders;
```

### Key Points

- Pure SQL window solutions cover most analytics needs.
- C-level custom window functions are rare in application codebases.

### Best Practices

- Prefer readable window definitions with named `WINDOW w AS (...)` clauses.

### Common Mistakes

- Frames default to `RANGE` modes that surprise with duplicates—be explicit.

---

## 13. Function Performance

<a id="13-function-performance"></a>

### Beginner

SQL functions that inline avoid function call overhead. PL/pgSQL row loops can be slow compared to set-based SQL.

### Intermediate

`STABLE`/`IMMUTABLE` enable cache-friendly optimizations. Volatile functions block many optimizations. Use `EXPLAIN ANALYZE` on call sites.

### Expert

`PARALLEL SAFE` functions can run in parallel workers when embedded in parallel plans. Large `RETURN QUERY` materializations may spike `work_mem`.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT customer_id, active_customer_count() FROM customers LIMIT 10;
```

### Key Points

- Measure call sites, not just function bodies in isolation.
- Avoid per-row SQL inside loops when a join/aggregate suffices.

### Best Practices

- Use `LANGUAGE sql` for hot simple functions.

### Common Mistakes

- Marking functions stable when they read mutable configuration tables.

---

## 14. Transaction Control in Functions

<a id="14-transaction-control-in-functions"></a>

### Beginner

Traditional **functions** cannot issue transaction control (`COMMIT`/`ROLLBACK`)—a transaction wraps the outer statement. **Procedures** (`PROCEDURE`) can commit/rollback in PL/pgSQL (PostgreSQL 11+).

### Intermediate

Savepoints can be used in functions called within outer transactions (careful with semantics). Side-effect ordering matters with triggers.

### Expert

Design autonomous transactions carefully—partial commits inside procedures complicate error handling for callers using `CALL`.

```sql
CREATE OR REPLACE PROCEDURE archive_orders_batch()
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO orders_archive SELECT * FROM orders WHERE status = 'archived' AND archived_at < now() - interval '365 days';
  DELETE FROM orders WHERE status = 'archived' AND archived_at < now() - interval '365 days';
  COMMIT;
END;
$$;

CALL archive_orders_batch();
```

### Key Points

- Use procedures for multi-step batch workflows needing explicit commits.
- Functions remain atomic with the caller’s transaction unless special patterns.

### Best Practices

- Document transaction boundaries for API users.

### Common Mistakes

- Expecting commits inside functions—use procedures.

---

## 15. Stored Procedures (CREATE PROCEDURE, CALL)

<a id="15-stored-procedures-create-procedure-call"></a>

### Beginner

`CREATE PROCEDURE` defines a procedure invoked with `CALL proc(args)`. Unlike `SELECT func()`, procedures use `CALL` and may run transaction commands.

### Intermediate

`IN`/`OUT`/`INOUT` supported similar to functions. Procedures can `COMMIT`/`ROLLBACK` internally in PL/pgSQL. Permissions via `GRANT EXECUTE`.

### Expert

Procedures integrate with application batch jobs, ETL steps, and administrative tasks—ensure role separation and auditing.

```sql
CREATE OR REPLACE PROCEDURE reset_daily_counters()
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE counters SET value = 0 WHERE scope = 'daily';
  COMMIT;
END;
$$;

CALL reset_daily_counters();
```

### Key Points

- Procedures fit imperative operational scripts living in the database.
- Combine with `SECURITY DEFINER` only when necessary and hardened.

### Best Practices

- Log procedure actions to audit tables where compliance requires.

### Common Mistakes

- Using procedures where plain SQL batches in app code would be clearer.

---

## 16. Advanced Techniques (Polymorphic, Dynamic SQL)

<a id="16-advanced-techniques-polymorphic-dynamic-sql"></a>

### Beginner

**Polymorphic** types `anyelement`, `anyarray`, `anycompatible` let functions abstract over types. **Dynamic SQL** builds SQL strings at runtime executed via `EXECUTE`.

### Intermediate

`EXECUTE ... USING` binds parameters safely—avoid string concatenation of user input. `format()` with `%I`/`%L` helps identifier/literal quoting.

### Expert

Polymorphic aggregates/functions require consistent type resolution. Dynamic SQL interacts with plan caching differently—use session-prepared statements for hot paths when applicable.

```sql
CREATE OR REPLACE FUNCTION fetch_by_id(table_name text, id bigint)
RETURNS SETOF record
LANGUAGE plpgsql
AS $$
DECLARE
  q text;
BEGIN
  q := format('SELECT * FROM %I WHERE id = $1', table_name);
  RETURN QUERY EXECUTE q USING id;
END;
$$;
```

### Key Points

- Dynamic SQL is powerful and risky—sanitize identifiers, bind values.
- Polymorphism reduces duplication but complicates diagnostics.

### Best Practices

- Whitelist table names instead of accepting arbitrary `table_name`.

### Common Mistakes

- SQL injection via dynamic identifiers—never trust raw user strings.

---

## Appendix A: search_path Hardening Template

```sql
ALTER FUNCTION app.myfunc() SET search_path = pg_catalog, public;
```

Use for `SECURITY DEFINER` routines.

---

## Appendix B: Function Grants

```sql
GRANT EXECUTE ON FUNCTION add_ints(int, int) TO app_reader;
```

---

## Appendix C: Dependency Tracking

```sql
SELECT pg_get_functiondef('app.myfunc()'::regprocedure);
```

---

## Appendix D: IMMUTABLE vs STABLE vs VOLATILE

| Marker | Meaning | Example |
| --- | --- | --- |
| IMMUTABLE | Same inputs always same outputs for life of DB | `lower(text)` on immutable collation |
| STABLE | Fixed within a single query/table scan | `current_timestamp` in SQL is stable per statement |
| VOLATILE | Anything else | random(), updates, sequences |

Mislabeling breaks optimizations and can corrupt planner assumptions.

---

## Appendix E: SQL Function Inlining Checklist

- Language SQL, single SELECT (multi-statement may not inline).
- No volatile functions inside.
- No aggregates/subqueries with side effects.
- Honest volatility category.

---

## Appendix F: PL/pgSQL PERFORM vs SELECT INTO

```sql
PERFORM 1 FROM orders WHERE false; -- discard result
SELECT count(*) INTO v_cnt FROM orders; -- capture scalar
```

---

## Appendix G: GET DIAGNOSTICS

```sql
GET DIAGNOSTICS v_rowcount = ROW_COUNT;
```

Use after `INSERT`/`UPDATE`/`DELETE` in PL/pgSQL.

---

## Appendix H: RETURNING in Functions

```sql
INSERT INTO t(v) VALUES (1) RETURNING id INTO new_id;
```

Captures output values cleanly.

---

## Appendix I: Trigger WHEN Clause

```sql
CREATE TRIGGER t
BEFORE UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION trg_orders_touch();
```

Reduces trigger overhead.

---

## Appendix J: Transition Tables (Conceptual)

Statement-level triggers can reference `REFERENCING NEW TABLE AS new_rows` (where supported) for bulk operations—powerful for auditing batch inserts.

---

## Appendix K: Custom Aggregate Combine Function Sketch

For parallel aggregates, define `COMBINEFUNC` to merge partial states—must be associative like transition function semantics.

---

## Appendix L: Window Frame Defaults

When `ORDER BY` present without frame, default is often `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`—know your version semantics.

---

## Appendix M: Function Cost and Rows Hints

```sql
CREATE FUNCTION expensive() RETURNS int
LANGUAGE sql
STABLE
COST 5000
ROWS 100
AS $$ SELECT 1 $$;
```

Use sparingly—incorrect hints mislead planner.

---

## Appendix N: SETOF and Lateral

```sql
SELECT c.id, o.*
FROM customers c,
LATERAL orders_for_customer(c.id) o;
```

Combines SRFs with relational power.

---

## Appendix O: Procedures vs Functions Quick Rule

Need `COMMIT` inside? Procedure. Need to use inside `SELECT`/`WHERE`/expression? Function.

---

## Appendix P: Exception WHEN OTHERS

```sql
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'err: %', SQLERRM;
```

Use cautiously—log and re-raise in most apps.

---

## Appendix Q: SQL Injection Safe Dynamic SQL

```sql
EXECUTE format('SELECT count(*) FROM %I WHERE region = $1', tab) USING region;
```

`%I` identifier, `%L` literal.

---

## Appendix R: Polymorphic Example

```sql
CREATE OR REPLACE FUNCTION first_el(anyarray)
RETURNS anyelement
LANGUAGE sql
IMMUTABLE
AS $$ SELECT $1[1] $$;
```

---

## Appendix S: Batch Processing Anti-Pattern

Row-by-row updates in loops—prefer:

```sql
UPDATE orders SET status = 'archived' WHERE ...;
```

---

## Appendix T: Unit Testing Functions

Use transaction-wrapped tests in CI:

```sql
BEGIN;
SELECT tests.run_all();
ROLLBACK;
```

---

## Appendix U: Version Notes for PROCEDURE

Procedures and `CALL` arrived in PostgreSQL 11—verify target server version in heterogeneous environments.

---

## Appendix V: SECURITY DEFINER Checklist

- Set explicit `search_path`.
- Revoke excess privileges from owning role.
- Qualify object names.
- Audit who can execute.

---

## Appendix W: Function Volatility and Indexes

Index expressions must use immutable functions—parallel to planner requirements.

---

## Appendix X: RETURNS NULL ON NULL INPUT

```sql
CREATE FUNCTION safe_div(a numeric, b numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $$ SELECT a / b $$;
```

---

## Appendix Y: Stable Functions Reading Tables

If a function reads mutable tables, it cannot be `IMMUTABLE`—`STABLE` or `VOLATILE` accordingly.

---

## Appendix Z: Debugging with RAISE DEBUG

```sql
SET client_min_messages = debug1;
```

Pair with `RAISE DEBUG` for development diagnostics.

---

## Appendix AA: Cursor FOR Loop Auto Close

```sql
FOR r IN SELECT id FROM orders LOOP
  -- uses implicit cursor
END LOOP;
```

Cleaner than manual OPEN/FETCH/CLOSE for many cases.

---

## Appendix AB: OUT Parameters Style

```sql
CREATE FUNCTION dims(IN x int, OUT width int, OUT height int)
...
SELECT * FROM dims(4);
```

---

## Appendix AC: VARIADIC and ARRAY Coercion

Call variadic functions with listed args or pass array with `VARIADIC` keyword—know resolution rules.

---

## Appendix AD: Trigger Performance Testing

Measure write throughput with triggers on/off in staging—quantify overhead before shipping.

---

## Appendix AE: Function Body Dollar Quoting

```sql
AS $fn$
BEGIN
  -- can contain single quotes freely
END;
$fn$
```

---

## Appendix AF: sql vs plpgsql for Simple Guards

```sql
CREATE FUNCTION assert_positive(n numeric)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF n <= 0 THEN RAISE EXCEPTION 'must be positive'; END IF;
END $$;
```

---

## Appendix AG: RETURNS TABLE Column Names

```sql
RETURNS TABLE(order_id bigint, status text)
```

Acts like `OUT` parameters—refer as `order_id` variable in PL/pgSQL.

---

## Appendix AH: Set-Returning Functions in SELECT

SRFs can duplicate outer rows—use `LATERAL` carefully.

---

## Appendix AI: Memoization Pattern (Application Side)

For stable pure functions called frequently, application caching may outperform micro-optimizing SQL—measure.

---

## Appendix AJ: Auditing Procedure Calls

Log to `audit_log` with user, timestamp, arguments (redacted).

---

## Appendix AK: Immutable Mark on SQL Functions

```sql
LANGUAGE sql IMMUTABLE
```

Only when true.

---

## Appendix AL: Parallel Safety Markers

```sql
ALTER FUNCTION myfunc() PARALLEL SAFE;
```

Only if function truly safe—no session GUC side effects.

---

## Appendix AM: Nested Functions (Not Supported)

PostgreSQL has no nested function definitions—use separate functions or private schema namespaces.

---

## Appendix AN: Recursion in PL/pgSQL

Recursive CTEs in SQL often clearer than recursive PL/pgSQL—prefer SQL recursion for tree walks when possible.

---

## Appendix AO: COPY and Functions

Bulk load with `COPY` bypasses row-level triggers? **No**—normal triggers fire; rules may differ. Know difference between triggers and rules.

---

## Appendix AP: RETURNS VOID vs PROCEDURE

`RETURNS void` functions still invoked via `SELECT`; procedures via `CALL`.

---

## Appendix AQ: GRANT on Procedures

```sql
GRANT EXECUTE ON PROCEDURE archive_orders_batch() TO admin_role;
```

---

## Appendix AR: Dynamic ORDER BY Safe Pattern

Whitelist columns:

```sql
EXECUTE format('SELECT * FROM orders ORDER BY %I DESC', sort_col);
```

Validate `sort_col` against allowed set in PL/pgSQL.

---

## Appendix AS: Custom Window via SQL Pattern

```sql
SELECT x, sum(x) FILTER (WHERE flag) OVER (ORDER BY ts) FROM t;
```

Often replaces exotic custom window needs.

---

## Appendix AT: JSON Aggregation Inside Functions

```sql
RETURN QUERY SELECT jsonb_agg(row_to_json(r)) FROM (...) r;
```

Useful for API-shaped SRFs—watch performance.

---

## Appendix AU: SPI and C Functions

C functions use Server Programming Interface—out of scope for most app devs but powers many extensions.

---

## Appendix AV: plpgsql_check Extension (Optional)

External linters can catch shadowing, performance issues—use in CI when available.

---

## Appendix AW: Error Codes Reference Habit

Bookmark SQLSTATE list—use explicit codes in `RAISE` and handlers.

---

## Appendix AX: Function Immutability Tests

Property tests verifying same output for same inputs help catch accidental volatility.

---

## Appendix AY: Bulk Exception Handling

Savepoints around batches:

```sql
BEGIN;
-- batch
EXCEPTION WHEN OTHERS THEN
  ROLLBACK TO SAVEPOINT sp;
END;
```

---

## Appendix AZ: Named Notation Calls

```sql
SELECT add_ints(a := 2, b := 3);
```

Improves readability for boolean flags.

---

## Appendix BA: Default Args

```sql
CREATE FUNCTION f(a int, b int DEFAULT 0) ...
```

---

## Appendix BB: Overload Resolution Gotchas

Numeric literals may prefer `numeric` vs `integer`—cast explicitly in ambiguous calls.

---

## Appendix BC: RETURNS SETOF Composite

```sql
RETURNS SETOF orders
```

Ensures shape tracks table.

---

## Appendix BD: SQL Injection in Table Names

Never:

```sql
EXECUTE 'SELECT * FROM ' || user_input;
```

---

## Appendix BE: Performance: Inline SQL Function Example

```sql
CREATE FUNCTION disc_price(p numeric) RETURNS numeric
LANGUAGE sql IMMUTABLE AS $$ SELECT p * 0.9 $$;

EXPLAIN SELECT disc_price(amount) FROM orders;
```

Observe inlining in plan.

---

## Appendix BF: PL/pgSQL Assignment Pitfalls

`= ` vs `:=`—assignment uses `:=`.

---

## Appendix BG: NULL Results in SRFs

Decide whether to return zero rows vs NULL for not found—API contract matters.

---

## Appendix BH: Trigger Security Definer

Triggers run as definer if function is definer—audit carefully.

---

## Appendix BI: Function Ownership and SET ROLE

Owners impact privileges—use role separation.

---

## Appendix BJ: Testing Transactional Procedures

Use `CALL` inside explicit transactions in tests to validate partial commit behaviors.

---

## Appendix BK: Observability

`log_statement`, `auto_explain`, and application traces should include function names.

---

## Appendix BL: Documentation Comments

```sql
COMMENT ON FUNCTION add_ints(int,int) IS 'Adds two integers; NULL inputs handled by SQL + operator rules';
```

---

## Appendix BM: Migration Idempotency

Use `CREATE OR REPLACE` for functions; watch dependency invalidation.

---

## Appendix BN: Stable vs Volatile for `now()`

SQL using `now()` cannot be immutable—typically stable per statement semantics.

---

## Appendix BO: Row-Level Security and Functions

`SECURITY DEFINER` functions can bypass RLS of invoker depending on settings—understand `ALTER TABLE ... FORCE ROW LEVEL SECURITY` interactions.

---

## Appendix BP: Callable from Hibernate / SQLAlchemy

Map `CALL` for procedures; scalar functions as `SELECT func()` in native queries.

---

## Appendix BQ: Integer Division Gotchas

Use `numeric` when fractional results required.

---

## Appendix BR: RETURNS TABLE and OUT Duplication

Avoid mixing confusing `OUT` duplicates—pick one style.

---

## Appendix BS: Final Security Reminder

Database code execution is still code—review, test, and scan like application code.

---

## Appendix BT: Line Coverage for Learning

Re-read volatility + definer sections until boring—those two cause most production incidents.

---

## Appendix BU: Sample Test Matrix for Functions

| Case | Input | Expected | Notes |
| --- | --- | --- | --- |
| happy path | valid | output | baseline |
| NULL | NULL args | NULL or error | document |
| duplicates | conflict | exception or upsert | business rule |
| permissions | limited role | authorization error | RLS/definer |

---

## Appendix BV: Using STRICT

```sql
CREATE FUNCTION div_strict(a numeric, b numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT a / b $$;
```

`STRICT` short-circuits on NULL arguments.

---

## Appendix BW: Handling Division by Zero

Prefer guarded SQL or PL/pgSQL checks. `STRICT` does not catch zero divisors.

---

## Appendix BX: Callable Statement Timeouts

Set `statement_timeout` around `CALL` batches in job runners to prevent runaway maintenance.

---

## Appendix BY: Function-Based Defaults

```sql
ALTER TABLE orders ALTER COLUMN created_at SET DEFAULT now();
```

Prefer built-ins for defaults; functions are acceptable when immutability/stable rules are satisfied.

---

## Appendix BZ: Generated Columns + Functions

Generated columns may reference immutable expressions only, similar to index expressions.

---

## Appendix CA: Packaging Functions in Extensions

Extensions ship SQL files with `CREATE FUNCTION`. Version upgrade scripts must handle signature changes carefully.

---

## Appendix CB: Deprecation Strategy

Mark functions as deprecated in `COMMENT`, introduce new names, monitor `pg_stat_user_functions` usage before dropping.

---

## Appendix CC: Numeric Scale Issues

Functions returning `numeric` should document rounding expectations for financial domains.

---

## Appendix CD: Locale Dependent Functions

`lower()` immutability depends on collation. Be careful marking functions `IMMUTABLE` on locale-sensitive columns.

---

## Appendix CE: Final Practice Prompt

Implement `upsert_customer(email text, name text)` with unique violation handling, `SECURITY INVOKER`, and unit tests in a transaction rollback harness.

---

## Appendix CF: Additional PL/pgSQL Template

```sql
CREATE OR REPLACE FUNCTION noop_ok()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- validates compilation and grants
  RETURN;
END;
$$;
```

---

## Appendix CG: SQL Injection Review Checklist

- [ ] No raw concatenation of untrusted values into SQL strings
- [ ] Identifiers chosen from a whitelist when dynamic
- [ ] Values always passed via `USING` or `%L`

---

## Appendix CH: Closing Summary

Functions express logic close to data; procedures express controlled transaction workflows; both require security discipline identical to application code.

---

## Appendix CI: One-Sentence Rule

If you cannot state a function’s volatility honestly in one sentence, you do not understand its side effects yet.

---

**End of topic 15 notes.**
