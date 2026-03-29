# Views and Materialized Views

**PostgreSQL learning notes (March 2026). Aligned with README topic 17.**

---

## 📑 Table of Contents

- [1. View Basics](#1-view-basics)
- [2. Simple Views](#2-simple-views)
- [3. Complex Views](#3-complex-views)
- [4. Updatable Views](#4-updatable-views)
- [5. View Creation Options (SECURITY, CHECK OPTION)](#5-view-creation-options-security-check-option)
- [6. Materialized Views](#6-materialized-views)
- [7. Materialized View Refreshing (Concurrent, Incremental Concepts)](#7-materialized-view-refreshing-concurrent-incremental-concepts)
- [8. Materialized View Performance](#8-materialized-view-performance)
- [9. View Maintenance](#9-view-maintenance)
- [10. View Optimization](#10-view-optimization)
- [11. Practical View Patterns (Security, Reporting, API)](#11-practical-view-patterns-security-reporting-api)

---

## 1. View Basics

<a id="1-view-basics"></a>

### Beginner

A **view** is a named `SELECT` query stored in the catalog. Querying a view runs its underlying SQL (usually **expanded** inline like a subquery) unless materialized separately.

### Intermediate

Views simplify access, enforce projections, and centralize joins. They do not store data (except **materialized views**). Permissions can be granted on views distinct from base tables.

### Expert

Views participate in **security_barrier** optimizations for `SECURITY DEFINER`-like protections when flagged—planner may prevent predicate pushdown to avoid leaks. Rules may still exist on legacy systems—prefer modern view patterns.

```sql
CREATE VIEW active_users AS
SELECT id, email, created_at
FROM users
WHERE deleted_at IS NULL;

SELECT * FROM active_users WHERE email LIKE '%@company.test';
```

### Key Points

- Views are primarily **logical**—no storage by default.
- Dependencies tracked: dropping columns in base tables can break views.

### Best Practices

- Schema-qualify base objects in view definitions for stability.

### Common Mistakes

- Assuming views improve performance magically—often they do not without indexes on base tables.

---

## 2. Simple Views

<a id="2-simple-views"></a>

### Beginner

**Simple** views map to one base table with selected columns/filters—often automatically updatable.

### Intermediate

Column aliases become view columns. `WITH [LOCAL | CASCADED] CHECK OPTION` can enforce insert/update constraints through the view window.

### Expert

Simple views are ideal for **column hiding** (exclude secrets) and **soft-delete** windows (`WHERE NOT archived`).

```sql
CREATE VIEW public_users AS
SELECT id, display_name
FROM users;

GRANT SELECT ON public_users TO app_reader;
REVOKE SELECT ON users FROM app_reader;
```

### Key Points

- Simple views underpin **least privilege** data exposure.

### Best Practices

- Document which views are contracts for external schemas/ETL.

### Common Mistakes

- Granting broad base table access while thinking the view “protects” data—privileges must be revoked on base.

---

## 3. Complex Views

<a id="3-complex-views"></a>

### Beginner

**Complex** views join/aggregate multiple tables—generally not automatically updatable without rules/triggers.

### Intermediate

Aggregations (`GROUP BY`), `DISTINCT`, window functions, unions, and certain joins block simple updatability rules.

### Expert

Complex views are great for **reporting interfaces** and **API projections**; pair with `INSTEAD OF` triggers for controlled writes.

```sql
CREATE VIEW order_totals AS
SELECT o.id AS order_id,
       o.customer_id,
       sum(i.qty * i.unit_price) AS total
FROM orders o
JOIN order_items i ON i.order_id = o.id
GROUP BY o.id, o.customer_id;
```

### Key Points

- Complex views shift computation to query time—can be expensive.

### Best Practices

- Index underlying join keys and filter columns aggressively.

### Common Mistakes

- Using complex views in hot OLTP paths without measuring plans.

---

## 4. Updatable Views

<a id="4-updatable-views"></a>

### Beginner

PostgreSQL can insert/update/delete through views that satisfy **updatable view rules** (single-table simple cases).

### Intermediate

`WITH CHECK OPTION` ensures inserted/updated rows remain visible through the view’s `WHERE` clause.

### Expert

For non-updatable views, use **`INSTEAD OF` triggers** on the view to define custom write semantics across multiple tables.

```sql
CREATE VIEW emea_customers AS
SELECT * FROM customers WHERE region = 'EMEA' WITH LOCAL CHECK OPTION;

INSERT INTO emea_customers(name, region) VALUES ('Acme', 'EMEA'); -- ok
-- INSERT INTO emea_customers(name, region) VALUES ('Bad', 'APAC'); -- fails check option
```

### Key Points

- Updatable views help legacy apps interact with refactored schemas.

### Best Practices

- Prefer declarative constraints on base tables; views enforce “window” rules.

### Common Mistakes

- Expecting updates through aggregated views without triggers.

---

## 5. View Creation Options (SECURITY, CHECK OPTION)

<a id="5-view-creation-options-security-check-option"></a>

### Beginner

`SECURITY INVOKER` (default) runs the view’s underlying query with **invoker** privileges. `SECURITY DEFINER` uses **owner** privileges—powerful, risky.

### Intermediate

`WITH CHECK OPTION` (local/cascaded) validates writes through view predicates. `security_barrier` option prevents unsafe predicate pushdown for definer views holding sensitive rows.

### Expert

Combine RLS on base tables with invoker views carefully—unexpected denials or leaks if misconfigured.

```sql
CREATE VIEW sensitive_notes
WITH (security_barrier = true) AS
SELECT id, note
FROM notes
WHERE NOT is_secret;

CREATE ROLE notes_admin NOLOGIN;
ALTER VIEW sensitive_notes OWNER TO notes_admin;

-- Newer PostgreSQL versions can mark views as invoker/definer-oriented via view options.
-- Exact syntax and defaults differ by major version—read the "CREATE VIEW" docs
-- before relying on elevated access through views; often a controlled function is clearer.
```

### Key Points

- `SECURITY DEFINER` views are a **privilege escalation** mechanism—harden `search_path`.

### Best Practices

- Default to invoker; use definer sparingly with barrier views.

### Common Mistakes

- Definer views leaking rows via planner pushdown—use `security_barrier`.

---

## 6. Materialized Views

<a id="6-materialized-views"></a>

### Beginner

**Materialized views (MV)** persist query results physically—fast reads, stale until **refreshed**.

### Intermediate

Create with `CREATE MATERIALIZED VIEW`. Indexes can be built on MVs. MVs are **not** auto-updated on base changes.

### Expert

Use MVs for expensive aggregates, denormalized dashboards, and search acceleration where some staleness is acceptable.

```sql
CREATE MATERIALIZED VIEW daily_sales AS
SELECT date_trunc('day', created_at) AS day, sum(amount) AS revenue
FROM orders
GROUP BY 1;

CREATE UNIQUE INDEX ON daily_sales (day);

SELECT * FROM daily_sales WHERE day = date '2026-03-01';
```

### Key Points

- MVs trade **freshness** for **read cost**.

### Best Practices

- Always consider refresh strategy before adopting MVs.

### Common Mistakes

- Treating MVs as source of truth for real-time operational state.

---

## 7. Materialized View Refreshing (Concurrent, Incremental Concepts)

<a id="7-materialized-view-refreshing-concurrent-incremental-concepts"></a>

### Beginner

`REFRESH MATERIALIZED VIEW mv;` rebuilds contents (locks access depending on mode/version).

### Intermediate

`REFRESH MATERIALIZED VIEW CONCURRENTLY mv;` allows concurrent selects during refresh **if** a unique index exists on MV—slower but safer for production.

### Expert

True **incremental** refresh is not automatic for arbitrary MVs—some products/extensions add capabilities; otherwise use manual delta tables or partial recomputation strategies.

```sql
REFRESH MATERIALIZED VIEW daily_sales;
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;
```

### Key Points

- Concurrent refresh requires **unique index** without `CONCURRENTLY` failure.

### Best Practices

- Schedule refreshes on business cadence (nightly/hourly) with monitoring.

### Common Mistakes

- Running non-concurrent refresh during peak—blocks readers/writers depending on lock mode.

---

## 8. Materialized View Performance

<a id="8-materialized-view-performance"></a>

### Beginner

Reads from MVs are like tables—seq/index scans apply. Writes happen only on refresh.

### Intermediate

Refresh cost grows with base table churn; consider partitioning base data or maintaining rolling MV windows.

### Expert

Use partial MVs (`WHERE` clause) for scoped dashboards. Combine with `BRIN`/`btree` indexes on MV keys for selective reads.

```sql
CREATE MATERIALIZED VIEW recent_open_orders AS
SELECT * FROM orders WHERE status = 'open' AND created_at > now() - interval '90 days';
```

### Key Points

- MV performance = **read pattern** + **refresh cost** + **staleness tolerance**.

### Best Practices

- Track refresh duration trends—degrading refresh hints growing base data or contention.

### Common Mistakes

- Missing unique index blocking concurrent refresh in HA setups.

---

## 9. View Maintenance

<a id="9-view-maintenance"></a>

### Beginner

`ALTER VIEW` renames columns or adjusts options (limited). `DROP VIEW` removes catalog entry—use `CASCADE` to drop dependents (dangerous).

### Intermediate

`pg_depend` tracks dependencies—dropping underlying columns may require `CREATE OR REPLACE VIEW` migrations.

### Expert

Use migration tools to version view definitions; avoid manual drift between environments.

```sql
ALTER VIEW active_users RENAME COLUMN email TO email_address;

DROP VIEW IF EXISTS legacy_report;
```

### Key Points

- View migrations are **code changes**—test dependent BI tools.

### Best Practices

- Store view definitions in git with review processes.

### Common Mistakes

- `CASCADE` drops without inventory—breaks unknown consumers.

---

## 10. View Optimization

<a id="10-view-optimization"></a>

### Beginner

PostgreSQL **inlines** simple views into outer queries—predicates can push down to base tables automatically.

### Intermediate

Complex views may block pushdown (aggregations, limits, security_barrier). `EXPLAIN` outer queries referencing views to see final plan.

### Expert

Consider **partitioned** base tables + simple views for pruning. Replace heavy views on hot paths with MVs or direct queries after measurement.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM order_totals WHERE customer_id = 123;
```

### Key Points

- Optimization target is usually **underlying tables’ indexes**, not the view object itself.

### Best Practices

- Name views to reflect usage (`reporting_*`, `api_*`) to communicate performance tier.

### Common Mistakes

- Adding `LIMIT` inside views unexpectedly changes outer query semantics when inlined—verify.

---

## 11. Practical View Patterns (Security, Reporting, API)

<a id="11-practical-view-patterns-security-reporting-api"></a>

### Beginner

**Security:** expose non-sensitive projections. **Reporting:** pre-join dimensions. **API:** stable column sets for microservices.

### Intermediate

Pair views with **RLS** for tenant isolation; MVs for heavy dashboards fed by dbt/ETL.

### Expert

For GraphQL/REST, views can represent **resolver-friendly** joins; beware N+1 patterns—application batching still matters.

```sql
CREATE VIEW tenant_orders AS
SELECT o.*
FROM orders o
WHERE o.tenant_id = current_setting('app.tenant_id')::uuid;

CREATE MATERIALIZED VIEW kpi_daily AS
SELECT day, revenue, orders_count FROM ...;
```

### Key Points

- Views articulate **contracts** between DB and consumers.

### Best Practices

- Document staleness SLAs for MV-backed endpoints.

### Common Mistakes

- Using security definer views without barrier and thorough testing.

---

## Appendix A: Replace View Pattern

```sql
CREATE OR REPLACE VIEW active_users AS ...;
```

---

## Appendix B: MV Unique Index Requirement

```sql
CREATE UNIQUE INDEX ON daily_sales (day);
```

---

## Appendix C: Grant on Views

```sql
GRANT SELECT ON active_users TO analyst;
```

---

## Appendix D: View Dependencies Query

```sql
SELECT * FROM pg_depend WHERE objid = 'active_users'::regclass;
```

---

## Appendix E: Reporting View with Time Buckets

```sql
CREATE VIEW revenue_by_week AS
SELECT date_trunc('week', created_at) AS week, sum(amount) AS revenue
FROM orders
GROUP BY 1;
```

---

## Appendix F: API Projection View

```sql
CREATE VIEW order_summary AS
SELECT o.id, o.status, o.created_at, c.name AS customer_name
FROM orders o
JOIN customers c ON c.id = o.customer_id;
```

---

## Appendix G: CHECK OPTION Local vs Cascaded

`LOCAL` checks only the view’s predicate; `CASCADED` checks underlying views too—pick based on layered view stacks.

---

## Appendix H: MV Staleness SLA Template

Document: refresh cadence, maximum acceptable lag, fallback behavior if refresh fails, monitoring alert thresholds.

---

## Appendix I: Refresh Job idempotency

Running refresh twice should be safe—ensure job locking to avoid concurrent conflicting refresh operations.

---

## Appendix J: Partitioned Base + View

Views over partitioned tables still benefit from partition pruning when predicates align.

---

## Appendix K: View + RLS

Invoker views respect RLS of the querying user—common for multi-tenant apps.

---

## Appendix L: INSTEAD OF Insert Pattern Recap

Use for multi-table logical inserts through a denormalized view—test all paths.

---

## Appendix M: Materialized View vs Summary Table

MV refresh replaces contents; summary tables allow incremental upserts—choose based on write patterns.

---

## Appendix N: Indexing MV for Dashboards

Index filter columns used in BI tools (`WHERE day BETWEEN ...`).

---

## Appendix O: EXPLAIN Through Views

Always `EXPLAIN` the **outer** query—view text is expanded; surprises often come from hidden joins.

---

## Appendix P: Column Renames Impact

Renaming base columns breaks `SELECT *` views—prefer explicit column lists in view definitions.

---

## Appendix Q: View Ownership Changes

Changing owner impacts security definer semantics—audit when rotating roles.

---

## Appendix R: Temporary Views

```sql
CREATE TEMP VIEW tmp AS SELECT 1 AS x;
```

Session-scoped—useful for ad hoc analysis.

---

## Appendix S: Recursive Views (UNION)

```sql
CREATE RECURSIVE VIEW nums(n) AS
SELECT 1
UNION ALL
SELECT n+1 FROM nums WHERE n < 10;
```

Use recursive CTE style carefully—termination conditions matter.

---

## Appendix T: View in COPY

Not all COPY patterns support views—verify for your workflow.

---

## Appendix U: BI Tool Caching + MV

BI tools may cache query results—align tool TTL with MV refresh to avoid double-stale confusion.

---

## Appendix V: Schema Binding

```sql
CREATE VIEW v AS SELECT * FROM public.orders;
```

Qualify schemas to avoid `search_path` surprises.

---

## Appendix W: MV Refresh Monitoring

Log refresh start/end durations; alert if duration exceeds historical p95 significantly.

---

## Appendix X: Partial MV for Hot Slice

```sql
CREATE MATERIALIZED VIEW open_orders AS
SELECT * FROM orders WHERE status = 'open';
```

---

## Appendix Y: Concurrent Refresh Failure Handling

If concurrent refresh fails, investigate invalid indexes or uniqueness violations—retry after repair.

---

## Appendix Z: View Testing Checklist

- [ ] SELECT plans acceptable
- [ ] Grants correct
- [ ] CHECK OPTION behaves as expected
- [ ] MV refresh within SLA

---

## Appendix AA: Deleting MV

```sql
DROP MATERIALIZED VIEW IF EXISTS daily_sales;
```

---

## Appendix AB: Replace MV Workflow

Often `DROP` + `CREATE` in migration with downtime, or create new MV, swap view name—plan cutover.

---

## Appendix AC: JSON API View

```sql
CREATE VIEW order_json AS
SELECT id, to_jsonb(o) AS payload FROM orders o;
```

Watch payload width.

---

## Appendix AD: Security Review Questions

Who owns the view? Who can select? Does definer bypass RLS? Is `security_barrier` set?

---

## Appendix AE: Stale MV User Messaging

If API reads MV data, expose `as_of` timestamp in responses when freshness matters.

---

## Appendix AF: Nested Views Performance

Deep stacks can confuse planners—flatten in hot paths if needed.

---

## Appendix AG: Column Defaults Through Views

Insert-through-view uses base defaults—verify not null constraints still satisfied.

---

## Appendix AH: Updatable View Limitations Recap

Aggregations, DISTINCT, GROUP BY, UNION, certain joins block auto updatability.

---

## Appendix AI: MV + UNIQUE for Concurrent Refresh

Unique index columns should be stable identifiers of MV rows—often time keys or composite keys.

---

## Appendix AJ: Read Replica Considerations

Refresh MV on primary; replicas receive WAL—understand replication lag affecting MV visibility.

---

## Appendix AK: Logical Replication

MV itself is a relation—publication/subscription behaviors may differ from base tables—test topology.

---

## Appendix AL: View Comments

```sql
COMMENT ON VIEW active_users IS 'Hides deleted users; used by app_reader role';
```

---

## Appendix AM: dbt + Views

Analytics engineering often models views as staging/intermediate layers—Postgres view rules still apply.

---

## Appendix AN: ORM Mapping

ORMs map views like tables—migrations must create views before granting app users access.

---

## Appendix AO: Performance Anti-Pattern

View selecting `*` from huge wide table used in list endpoint—project narrow columns instead.

---

## Appendix AP: Case Study — Compliance Projection

Expose `user_public_profile` view excluding PII columns; legal/compliance reviews focus on grants.

---

## Appendix AQ: Case Study — Nightly KPI MV

`kpi_daily` refreshed at 02:00; dashboards read MV only; alerts if refresh exceeds 30 minutes.

---

## Appendix AR: Case Study — API Versioning

`api_orders_v2` view preserves stable columns while base schema evolves—deprecate v1 deliberately.

---

## Appendix AS: Incremental Pipelines (Manual)

Maintain `orders_daily_delta` table via triggers/ETL; periodically merge into MV or summary table.

---

## Appendix AT: View Folding Concept

Planner **folds** views into outer queries—understand that some optimizations depend on simplicity.

---

## Appendix AU: Predicate Pushdown Example

```sql
CREATE VIEW big AS SELECT * FROM orders;
EXPLAIN SELECT * FROM big WHERE id = 1;
```

Often pushes `id = 1` to base table scan.

---

## Appendix AV: security_barrier Rationale

Prevents malicious predicates from executing before view filters leak rows—critical for definer patterns.

---

## Appendix AW: MV Index Build Timing

Create indexes after initial MV population for faster build—or concurrently in separate migration steps.

---

## Appendix AX: Refresh Exclusive Locks (Historical Note)

Non-concurrent refresh historically took stronger locks—always read current docs for your major version.

---

## Appendix AY: View Column Aliases for BI

Friendly names (`revenue_usd`) reduce semantic errors in dashboards.

---

## Appendix AZ: Final View Design Principle

Views should make **correct access patterns easy** and **dangerous access patterns impossible** via grants.

---

## Appendix BA: Padding — Collaboration

Treat views/MVs as API contracts: version them, document them, monitor them.

---

## Appendix BB: Padding — Operational Drift

Drift between view definitions across environments causes “works on my machine” BI incidents—use migrations.

---

## Appendix BC: Padding — Staleness Communication

If you do not communicate MV staleness, someone will treat it as real-time and build the wrong product.

---

## Appendix BD: Padding — Index Hygiene

An MV without supporting indexes is often just a slower table with extra refresh pain.

---

## Appendix BE: Padding — Refresh Failure Runbook

Include: who is paged, how to backfill, how to validate row counts, how to communicate downstream.

---

## Appendix BF: Padding — Limit Clause in Views

Putting `LIMIT` in a view definition permanently caps results—usually undesirable unless intentional.

---

## Appendix BG: Padding — Testing Grants

Automated tests should connect as application roles, not superuser, to validate view permissions realistically.

---

## Appendix BH: Padding — Observability

Track query time against MV-backed endpoints separately from OLTP endpoints.

---

## Appendix BI: Extra SQL — Replace MV

```sql
DROP MATERIALIZED VIEW IF EXISTS mv_old;
CREATE MATERIALIZED VIEW mv_new AS SELECT ...;
ALTER MATERIALIZED VIEW mv_new RENAME TO mv_main;
```

---

## Appendix BJ: Extra SQL — Refresh in Transaction

Depending on version/wrapper, refresh may not be transactionally combinable—test tooling.

---

## Appendix BK: Learning Drill

Create `SECURITY INVOKER` view hiding salary column; verify analyst role cannot access base table.

---

## Appendix BL: Learning Drill (MV)

Build MV for monthly revenue; add unique index; refresh concurrently; measure duration as data grows.

---

## Appendix BM: Closing Summary

Views shape access; MVs shape latency—design both with explicit freshness and privilege models.

---

## Appendix BN: MV Row Count Sanity Check

After refresh, compare `SELECT count(*)` from MV against expected aggregate query on base tables for reconciliation jobs.

---

## Appendix BO: View Column Explicitness

Prefer listing columns explicitly:

```sql
CREATE VIEW v AS
SELECT id, status, created_at FROM orders;
```

instead of `SELECT *`—reduces accidental breakage.

---

## Appendix BP: Combine MV with Partial Index

```sql
CREATE INDEX ON kpi_daily (day) WHERE revenue > 0;
```

---

## Appendix BQ: Read-Only Roles on MV

```sql
GRANT SELECT ON kpi_daily TO reporting_role;
```

Even if base tables are wider, reporting_role may have no base access.

---

## Appendix BR: Refresh Scheduling Patterns

- Cron/pg_cron calling `REFRESH MATERIALIZED VIEW CONCURRENTLY`
- Airflow task after ETL completion
- Application job with advisory locks

---

## Appendix BS: View Renames and Dependencies

Renaming views breaks dependent views—use migration ordering or `ALTER ... RENAME` with dependency checks.

---

## Appendix BT: Hot Path Decision Tree

1. Is query too slow live?  
2. Can indexes fix base tables?  
3. If not, is staleness acceptable?  
4. If yes, consider MV; else consider streaming/outbox patterns.

---

## Appendix BU: Explain Format JSON for Views

Capture JSON plans for BI queries hitting complex views—easier diffing in reviews.

---

## Appendix BV: Column-Level Grants vs Views

Sometimes views are simpler than column grants for broad tools; choose based on consumer capabilities.

---

## Appendix BW: Temporary MV (Uncommon)

Not standard—typically use temp tables; MVs are persistent relations.

---

## Appendix BX: Materialized View Statistics

Run `ANALYZE` on MV after large refresh if autovacuum doesn’t keep up—helps planner on MV selects.

---

## Appendix BY: View in Join Order

Complex view inlined inside big joins can explode plan search space—simplify or materialize.

---

## Appendix BZ: Final Checklist (Extended)

- [ ] Grants reviewed for least privilege  
- [ ] MV refresh monitored  
- [ ] Unique index exists for concurrent refresh  
- [ ] Security definer/barrier decisions documented  
- [ ] BI/ORM consumers notified on schema changes  

---

## Appendix CA: One-Line Summary

A view is a doorway; a materialized view is a photograph of what was behind it at refresh time—know which you need.

---

## Appendix CB: Sample Monitoring Query (MV Bloat)

Track MV size growth:

```sql
SELECT relname, pg_size_pretty(pg_total_relation_size(oid))
FROM pg_class
WHERE relname = 'kpi_daily';
```

---

## Appendix CC: Cross-Database Note

Views cannot span databases—use FDW for cross-DB projections if truly needed.

---

## Appendix CD: View + UNION ALL Reporting

```sql
CREATE VIEW all_events AS
SELECT 'order' AS type, id, created_at FROM orders
UNION ALL
SELECT 'return', id, created_at FROM returns;
```

Ensure indexes on each branch support common filters.

---

## Appendix CE: Materialized View Naming

Prefix `mv_` helps operators distinguish refresh targets in logs.

---

## Appendix CF: Developer Ergonomics

Views simplify onboarding—developers see curated schemas instead of raw table forests.

---

## Appendix CG: Incident Story Template

“When dashboards broke, root cause was MV refresh failure + missing unique index for concurrent mode.”

---

## Appendix CH: Padding — Contract Tests

Add automated checks that view columns match expected names/types for API consumers.

---

## Appendix CI: Padding — Cost Control

MV refresh can spike I/O—run during off-peak or throttle with resource groups if platform supports.

---

## Appendix CJ: Padding — Documentation

Link view/MV definitions to data dictionary pages describing semantics and freshness.

---

## Appendix CK: Padding — Human Factors

Good names beat clever SQL—optimize for readability in views used by analysts.

---

## Appendix CL: Padding — Final Reminder

If you cannot explain a view’s purpose in one sentence, split it into two views with clearer names.

---

## Appendix CM: MV Refresh Locking — Read the Docs

Locking behavior for `REFRESH MATERIALIZED VIEW` evolves—always verify the chapter for your major version before planning zero-downtime refreshes.

---

## Appendix CN: Tiny Final Appendix

Prefer measurable SLAs (refresh duration, staleness minutes) over vague “near real-time” descriptions in design docs.

---

## Appendix CO: Line Target Note

This topic emphasizes contracts: views for access shape, materialized views for time-shifted performance—keep both explicit in your architecture notes.

---

## Appendix CP: Final Padding

Document, monitor, refresh, repeat.

---

**End of topic 17 notes.**
