# Monitoring and Logging

**PostgreSQL learning notes (March 2026). Topic aligned with README topic 25.**

## 📑 Table of Contents

- [1. PostgreSQL Logs (Location, Naming, Levels)](#1-postgresql-logs-location-naming-levels)
- [2. Log Configuration](#2-log-configuration)
- [3. Query Logging](#3-query-logging)
- [4. Connection Logging](#4-connection-logging)
- [5. Statistics Collection (`pg_stat_statements`)](#5-statistics-collection-pg_stat_statements)
- [6. Performance Views](#6-performance-views)
- [7. Wait Events](#7-wait-events)
- [8. Monitoring Tools (pgAdmin, DBeaver)](#8-monitoring-tools-pgadmin-dbeaver)
- [9. Slow Query Analysis](#9-slow-query-analysis)
- [10. Performance Metrics (CPU, Memory, Disk, Cache Hit Ratio)](#10-performance-metrics-cpu-memory-disk-cache-hit-ratio)
- [11. Alert Configuration](#11-alert-configuration)
- [12. Audit Logging (pgAudit)](#12-audit-logging-pgaudit)

---

## 1. PostgreSQL Logs (Location, Naming, Levels)

<a id="1-postgresql-logs-location-naming-levels"></a>

### Beginner

PostgreSQL emits diagnostic messages from the postmaster and backends. When `logging_collector` is enabled, logs are typically written under the configured `log_directory`, often inside or beside the data directory. File names are controlled by `log_filename` and may include strftime patterns such as `%Y-%m-%d_%H%M%S`. Message severities include DEBUG, INFO, NOTICE, WARNING, ERROR, FATAL, and PANIC; `log_min_messages` filters which severities are written to the server log.

### Intermediate

Use `SHOW data_directory;` and `SHOW log_directory;` to locate logs in any environment. Rotation is governed by `log_rotation_age`, `log_rotation_size`, and `log_truncate_on_rotation`. `log_destination` can include `stderr`, `csvlog`, or `jsonlog` (version-dependent). Container and managed services often surface logs via stdout or a cloud logging agent rather than local files.

### Expert

Production teams correlate Postgres logs with pgbouncer, application, and load balancer logs using a shared timestamp baseline (UTC) and `application_name`. They validate that log volume under peak WAL generation still fits network and storage budgets. For regulated workloads, they map severities to retention tiers and prove chain-of-custody. Kernel and filesystem settings (e.g., `vm.dirty_ratio`, SSD queue depth) interact with log I/O latency.

```sql
-- Locate configuration and logging paths
SHOW data_directory;
SHOW config_file;
SHOW log_directory;
SHOW log_destination;
SHOW logging_collector;

-- Effective settings snapshot
SELECT name, setting, unit, pending_restart
FROM pg_settings
WHERE name IN (
  'log_destination','logging_collector','log_directory','log_filename',
  'log_rotation_age','log_rotation_size','log_truncate_on_rotation',
  'log_min_messages','log_line_prefix','client_min_messages'
)
ORDER BY name;
```

```sql
-- Tag sessions for downstream log correlation
SET application_name = 'api:checkout:v2';
SELECT pg_backend_pid() AS backend_pid, inet_client_addr() AS client_ip;
```

```bash
# Discover data directory and list log directory (Linux examples)
sudo -u postgres psql -X -Atqc "SHOW data_directory;"
DDIR="$(sudo -u postgres psql -X -Atqc 'SHOW data_directory;')"
ls -la "$DDIR/log" 2>/dev/null || echo "No log/ under data directory — check stderr/journald"
# systemd journal
journalctl -u postgresql -n 300 --no-pager
```

```yaml
# docker-compose: persist log directory when logging_collector writes under data/log
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: "change-me"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./host-logs:/var/lib/postgresql/data/log
volumes:
  pgdata: {}
```

### Key Points

- Log location is configuration-driven; never assume a single universal path.
- Rotation prevents disk exhaustion; pair Postgres rotation with archival retention.
- Severity filtering is server-side (`log_min_messages`) and distinct from client notices.
- `log_line_prefix` is the main hook for operability fields (time, db, user, app).
- Managed platforms may remap destinations; verify in provider docs.
- JSON/CSV logs simplify parsing but increase volume; plan capacity.
- ERROR lines should tie back to SQLSTATE in application telemetry.
- Time zones in logs must be explicit for multi-region teams.

### Best Practices

- Document canonical log paths per environment in a runbook.
- Standardize `log_line_prefix` across staging and production.
- Centralize logs with immutable or WORM storage when compliance requires it.
- Alert on sustained ERROR rate spikes and on log pipeline lag.
- Test rotation behavior after major upgrades.
- Keep a “logging change” checklist (who approves, how to roll back).
- Use `application_name` from apps for end-to-end tracing.

### Common Mistakes

- Enabling verbose logging without disk and SIEM capacity planning.
- Parsing unstructured logs with brittle regular expressions.
- Ignoring permission errors on `log_directory` after restoring backups.
- Mixing local time zones across regions without conversion discipline.
- Storing secrets or full row payloads in logs unintentionally.

---

## 2. Log Configuration

<a id="2-log-configuration"></a>

### Beginner

Core logging parameters live in `postgresql.conf` (or ALTER SYSTEM) and include `log_statement`, `log_duration`, `log_min_duration_statement`, and `log_connections`. These control whether SQL text appears, whether timings print, which statements exceed a duration threshold, and whether connects/disconnects print. Many settings reload with `SELECT pg_reload_conf();` without restarting the server.

### Intermediate

`log_statement` accepts `none`, `ddl`, `mod`, or `all`. DDL logging captures schema changes; `mod` includes INSERT/UPDATE/DELETE and related commands. `log_min_duration_statement` logs statements running longer than the threshold; `-1` disables. Combine selective `log_statement` with duration thresholds to limit noise while preserving forensic value.

### Expert

Operators differentiate performance telemetry (duration sampling, auto_explain) from compliance auditing (pgAudit). They measure overhead with representative workloads when enabling aggressive logging on write-heavy primaries. Some teams use role-based session settings for targeted debugging instead of global `log_statement=all`.

```sql
-- Example runtime changes (superuser / appropriate role)
ALTER SYSTEM SET log_connections TO on;
ALTER SYSTEM SET log_disconnections TO on;
ALTER SYSTEM SET log_duration TO on;
ALTER SYSTEM SET log_min_duration_statement TO '500ms';
ALTER SYSTEM SET log_statement TO 'ddl';
ALTER SYSTEM SET log_line_prefix TO '%m [%p] %u@%d %a ';
SELECT pg_reload_conf();
```

```sql
SELECT name, setting, source, pending_restart
FROM pg_settings
WHERE name LIKE 'log_%'
ORDER BY name;
```

```bash
# Validate config file syntax (offline)
postgres -C data -D /var/lib/postgresql/16/main 2>/dev/null || true
pg_ctl -D /var/lib/postgresql/16/main configtest 2>/dev/null || true
```

```yaml
# Illustrative Helm values fragment for Postgres chart (chart-specific)
config:
  log_connections: "on"
  log_disconnections: "on"
  log_min_duration_statement: "1000"
  log_statement: "ddl"
  log_line_prefix: "%m [%p] %u@%d %a "
```

### Key Points

- Reload applies many logging params; some require restart (`pending_restart`).
- `log_statement=all` is rarely appropriate 24/7 on busy OLTP.
- Duration-based logging is the first line of slow-query visibility.
- Connection logs help diagnose pool misconfiguration and auth storms.
- Prefix tokens must be chosen for parser compatibility downstream.
- DDL logging supports change auditing but is not a full compliance solution.
- `log_min_error_statement` controls which statement text accompanies errors.

### Best Practices

- Start with `log_min_duration_statement` in the hundreds of milliseconds.
- Enable DDL logging if schema changes are controlled and infrequent.
- Document approved logging profiles (baseline vs incident vs forensic).
- Automate detection of logging parameter drift across clusters.
- Separate security log streams from performance streams at ingestion.
- Review disk growth after enabling new log classes.

### Common Mistakes

- Setting `log_min_duration_statement = 0` indefinitely in production.
- Confusing `log_duration` with `EXPLAIN ANALYZE` output.
- Forgetting bound parameters are not shown in statement logs by default.
- Omitting reload after ALTER SYSTEM changes.
- Logging PII-heavy statements without redaction policies.

---

## 3. Query Logging

<a id="3-query-logging"></a>

### Beginner

Query logging reveals what SQL ran, sometimes with duration. You can log all queries with `log_statement=all` or `log_min_duration_statement=0`, but that is heavy. More common is logging slow queries above a threshold. Logs show the query string as seen by the server (often without bind values unless additional settings/extensions capture them).

### Intermediate

Pair `log_min_duration_statement` with application-level trace IDs via `application_name` or custom GUCs (where allowed). For deeper analysis, `auto_explain` (extension) logs plans for slow statements. Sampling can be approximated by dynamic threshold changes during incidents, or by using external tools that tail logs selectively.

### Expert

Teams implement tiered logging: baseline duration threshold, temporary lower threshold during incidents, and extension-based plan capture for top offenders. They watch log-induced I/O contention on small instances and may offload heavy diagnostics to replicas. Sensitive workloads use column masking and avoid logging full statements for certain roles.

```sql
-- Temporarily lower threshold in-session for one backend (illustrative pattern)
SET log_min_duration_statement = 0; -- session-level where permitted
-- Prefer ALTER SYSTEM + reload for cluster-wide changes
```

```sql
-- Identify currently running long queries (live view, not historical log)
SELECT pid, now() - query_start AS running_for,
       usename, datname, wait_event_type, wait_event, left(query, 200) AS q
FROM pg_stat_activity
WHERE state = 'active' AND pid <> pg_backend_pid()
ORDER BY running_for DESC;
```

```bash
# Tail rotated logs (adjust path)
tail -F /var/lib/postgresql/16/main/log/postgresql-*.log | grep -E "duration:|ERROR:"
```

```yaml
# logrotate example for host-collected Postgres logs
/var/lib/postgresql/*/log/*.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
  copytruncate
}
```

### Key Points

- Duration logging is coarse but cheap compared to full statement capture.
- Bind parameters usually require `log_parameter_max_length` (newer versions) or app tracing.
- Heavy query logging competes with WAL and checkpoint I/O.
- ORMs generate repetitive SQL; aggregate before tuning indexes.
- Logs lack wait-event nuance; combine with `pg_stat_activity` and `pg_wait_events`.
- auto_explain adds clarity at the cost of volume and CPU.
- Read-only workloads on replicas can be logged for safer experimentation.

### Best Practices

- Establish a default slow threshold aligned with SLO latency.
- Create dashboards from parsed logs or from `pg_stat_statements`.
- Redact or hash literals where privacy policies require it.
- Rehearse “logging escalation” steps during game days.
- Archive representative slow queries for regression tests.
- Close the loop: every recurring slow log should become a ticket or index change.

### Common Mistakes

- Logging all queries on small cloud instances until disk fills.
- Ignoring that identical SQL with different plans needs `EXPLAIN` context.
- Treating log timestamps as transaction commit order.
- Failing to attribute queries to services (missing `application_name`).

---

## 4. Connection Logging

<a id="4-connection-logging"></a>

### Beginner

`log_connections` prints a line when a client connects; `log_disconnections` prints when a session ends. These lines help you see connection storms, misconfigured pools, and unexpected hosts. Authentication failures may appear as FATAL messages separate from connect/disconnect lines depending on logging and auth method.

### Intermediate

Correlate connection logs with `pg_stat_activity` and `max_connections` metrics. PgBouncer in transaction pooling mode creates many short server connections; logs can explode if every connect is printed. You may tune logging during incidents or filter at ingestion. Use `pg_hba.conf` comments and host rules deliberately to avoid surprise rejections.

### Expert

Operators rate-limit or sample connection logs at the collector when necessary. They monitor connection latency and TLS handshake failures alongside Postgres logs. For zero-downtime cutovers, they track connection churn during DNS swaps. Advanced setups integrate with IAM-based auth proxies (managed offerings) where connection logs include cloud principal metadata.

```sql
SHOW max_connections;
SHOW superuser_reserved_connections;
SELECT count(*) FILTER (WHERE state = 'active')   AS active,
       count(*) FILTER (WHERE state = 'idle')     AS idle,
       count(*)                                   AS total
FROM pg_stat_activity;
```

```sql
SELECT datname, usename, client_addr, application_name, backend_type, state
FROM pg_stat_activity
ORDER BY backend_start NULLS LAST
LIMIT 50;
```

```bash
# Example: count recent connection lines in a log file
grep -c "connection received" /var/lib/postgresql/16/main/log/postgresql-*.log | tail -n 1
```

```yaml
# pgbouncer.ini fragment (connections != app sessions)
[databases]
appdb = host=127.0.0.1 port=5432 dbname=appdb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
log_connections = 1
log_disconnections = 1
```

### Key Points

- Connection logs are high-volume behind mis-sized pools.
- `max_connections` exhaustion is a distinct incident from CPU saturation.
- Short-lived connections increase TLS and auth overhead; logs expose the pattern.
- Superuser reserved slots exist for break-glass access.
- Some cloud proxies prepend additional connection metadata in provider logs.
- IPv6 vs IPv4 affects `client_addr` appearance in stats and logs.
- FATAL auth errors should feed security monitoring.

### Best Practices

- Right-size pools (app side and PgBouncer) before tightening timeouts.
- Alert on connection count approaching `max_connections`.
- Document expected connection sources (CIDRs, service accounts).
- Use dedicated roles per service for attribution.
- During incidents, temporarily enable verbose connection logging with a rollback timebox.
- Integrate auth failure monitoring with account lockout policies carefully.

### Common Mistakes

- Enabling connection logs without adjusting retention on busy pools.
- Blaming Postgres for connection storms caused by retry loops in apps.
- Omitting TLS expiry monitoring alongside connection logs.
- Using a single shared database role for all microservices.

---

## 5. Statistics Collection (`pg_stat_statements`)

<a id="5-statistics-collection-pg_stat_statements"></a>

### Beginner

The `pg_stat_statements` extension accumulates per-query statistics such as call count, total time, and I/O timings (depending on version and settings). It is the standard starting point for finding hot queries. Install with `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;` and ensure `shared_preload_libraries` includes it (requires restart).

### Intermediate

Query the view `pg_stat_statements` joined to `pg_database` for context. Reset stats with `pg_stat_statements_reset()` for controlled experiments. Understand that entries are normalized (constants replaced) and may aggregate dissimilar plans if literals differ in shape. Use `mean_time`, `stddev_time`, and `rows` to prioritize tuning targets.

### Expert

Teams capture periodic snapshots into history tables for trend analysis. They combine `pg_stat_statements` with `EXPLAIN (ANALYZE, BUFFERS)` on representative texts. They watch for bloat in the shared memory segment and plan for upgrades when fields expand. Some environments pair with `pg_stat_monitor` for bucketed time-series stats.

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT queryid, calls, total_exec_time, mean_exec_time, rows,
       shared_blks_hit, shared_blks_read, wal_records
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

```sql
SELECT d.datname, s.queryid, s.calls, s.mean_exec_time, left(s.query, 120) AS q
FROM pg_stat_statements s
JOIN pg_database d ON d.oid = s.dbid
WHERE d.datname = current_database()
ORDER BY s.total_exec_time DESC
LIMIT 25;
```

```sql
SELECT pg_stat_statements_reset(); -- use with care in shared environments
```

```bash
# Confirm shared_preload_libraries (requires restart to take effect)
psql -X -Atqc "SHOW shared_preload_libraries;"
```

```yaml
# postgresql.conf / Kubernetes config snippet
shared_preload_libraries: "pg_stat_statements"
pg_stat_statements.max: "10000"
pg_stat_statements.track: "all"
```

### Key Points

- Requires `shared_preload_libraries` and a restart to function fully.
- Normalization hides literal-specific plans; validate with EXPLAIN.
- `total_exec_time` finds heavy aggregate cost; `mean_exec_time` finds user latency pain.
- Frequent resets erase baselines; schedule resets intentionally.
- I/O fields help distinguish cache misses from CPU-heavy queries.
- Multi-tenant workloads may need pairing with `application_name` elsewhere.
- Upgrade major versions to unlock richer `pg_stat_statements` fields over time.

### Best Practices

- Keep `pg_stat_statements` enabled in production with bounded memory settings.
- Snapshot top-N weekly into a table for regressions.
- Build a “top queries” dashboard for on-call.
- Tie each top query to an owning team in documentation.
- After large data loads, run `ANALYZE` before trusting stats comparisons.
- Use roles to restrict who can reset global statistics.

### Common Mistakes

- Expecting bind values in `pg_stat_statements.query` text.
- Ignoring that parallel workers skew per-query accounting (version-dependent nuances).
- Resetting stats during incidents without capturing a sample first.
- Leaving `track` too narrow and missing utility command issues.

---

## 6. Performance Views

<a id="6-performance-views"></a>

### Beginner

PostgreSQL exposes cumulative statistics through `pg_stat_*` views. Common starting points: `pg_stat_database` (cluster-wide per-DB counters), `pg_stat_user_tables` (heap access), and `pg_stat_user_indexes` (index usage). These views help you see sequential scans, index scans, tuple counts, and cache hits at a coarse level.

### Intermediate

Use `pg_stat_database` fields like `blks_read`, `blks_hit`, `xact_commit`, `xact_rollback`, `deadlocks`, `temp_files`, and `temp_bytes` to spot anomalies. Table stats include `seq_scan`, `idx_scan`, `n_live_tup`, `n_dead_tup`, and `last_autovacuum`. Index stats reveal whether an index is unused or dominates scans.

### Expert

Experts diff stats before/after releases, compute cache hit ratios per database, and correlate `temp_bytes` growth with work_mem issues. They understand stats are cumulative until reset and schedule periodic snapshots. They combine with `pg_statio_*` for block-level insight and with wait events for holistic diagnosis.

```sql
SELECT datname, numbackends, xact_commit, xact_rollback, deadlocks,
       blks_read, blks_hit,
       CASE WHEN blks_read + blks_hit = 0 THEN NULL
            ELSE 100.0 * blks_hit / (blks_read + blks_hit)
       END AS cache_hit_pct_approx,
       temp_files, temp_bytes, conflicts
FROM pg_stat_database
WHERE datname IS NOT NULL
ORDER BY datname;
```

```sql
SELECT relname, seq_scan, idx_scan, n_live_tup, n_dead_tup,
       last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY seq_scan DESC
LIMIT 25;
```

```sql
SELECT indexrelname AS index_name, relname AS table_name,
       idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC
LIMIT 25;
```

```bash
watch -n 5 'psql -X -Atqc "SELECT datname, numbackends FROM pg_stat_database WHERE datname IS NOT NULL;"'
```

### Key Points

- Cumulative counters require deltas over time for incident analysis.
- High `seq_scan` on large tables warrants index or query review.
- `n_dead_tup` growth signals vacuum pressure.
- Unused indexes (`idx_scan = 0`) still cost writes and storage.
- Cache hit ratio is informative but not a universal SLA metric.
- `temp_files` implicates sorts/hash operations spilling to disk.
- Database-level stats include replication conflict counters where applicable.

### Best Practices

- Snapshot stats after deploys and schema changes.
- Maintain a “known good” baseline dashboard per service.
- Pair table stats with `EXPLAIN` on the top sequential scans.
- Review autovacuum timestamps when dead tuples rise.
- Prune unused indexes after verifying with representative workloads.
- Reset stats only with documentation and communication.

### Common Mistakes

- Judging indexes on dev workloads that do not mirror production traffic.
- Ignoring that heavy `seq_scan` on tiny tables is benign.
- Using hit ratio alone while latency issues are lock-bound.
- Forgetting stats reset after failover or restore changes OIDs/context.

---

## 7. Wait Events

<a id="7-wait-events"></a>

### Beginner

Wait events describe what a backend is doing when not actively on CPU, such as waiting for a lock, disk read, or client input. `pg_stat_activity.wait_event_type` and `wait_event` expose the current wait for active sessions. PostgreSQL also documents wait events in the manual, grouped into categories like `IO`, `Lock`, `LWLock`, and `Client`.

### Intermediate

During incidents, query `pg_stat_activity` filtered by non-null `wait_event` to see bottlenecks. Combine with `state`, `query`, and `now() - query_start`. For historical analysis, logging and external profilers capture samples. `pg_wait_events` (newer versions) enumerates event names and descriptions for deeper study.

### Expert

Experts build wait-event heatmaps over time, correlate `IO` waits with storage latency metrics, and distinguish transient `LWLock` contention during checkpoints from chronic lock chains. They tune checkpoint, `shared_buffers`, and autovacuum when `IO` and `Vacuum` waits dominate. They validate that connection pool waits are not misread as database internal waits.

```sql
SELECT wait_event_type, wait_event, count(*) AS sessions
FROM pg_stat_activity
WHERE wait_event IS NOT NULL
GROUP BY 1, 2
ORDER BY sessions DESC;
```

```sql
SELECT pid, usename, datname, state,
       wait_event_type, wait_event,
       now() - state_change AS in_state_for,
       left(query, 160) AS q
FROM pg_stat_activity
WHERE wait_event IS NOT NULL
ORDER BY in_state_for DESC;
```

```sql
-- When available: catalog of wait events
SELECT * FROM pg_wait_events ORDER BY type, name LIMIT 50;
```

```bash
# Sample activity every 2s during an incident (simple loop)
for i in {1..30}; do
  date -u
  psql -X -c "SELECT wait_event_type, wait_event, count(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL GROUP BY 1,2 ORDER BY 3 DESC;"
  sleep 2
done
```

### Key Points

- Absence of `wait_event` often means on-CPU work or idle states depending on version semantics.
- Lock waits point to transaction design or migration practices.
- Client waits may indicate slow application or network.
- Checkpoint-related waits may imply aggressive checkpoint settings or storage limits.
- Sampling beats staring at one-off snapshots during volatile incidents.
- Wait events complement `EXPLAIN (ANALYZE)` but are not a substitute.
- Some cloud metrics rename or aggregate waits; map carefully.

### Best Practices

- Create a saved query pack for on-call wait-event triage.
- Snapshot wait-event distributions before and after tuning changes.
- Correlate with `pg_stat_database.blks_read` spikes when IO waits rise.
- Teach developers the difference between row locks and advisory locks.
- Use controlled load tests to reproduce lock hotspots.
- Document known seasonal wait patterns (batch windows).

### Common Mistakes

- Killing sessions without identifying the lock root holder.
- Assuming all `IO` waits mean Postgres needs more RAM.
- Ignoring `Client` waits while blaming the database.
- Using single snapshots during rapid state changes.

---

## 8. Monitoring Tools (pgAdmin, DBeaver)

<a id="8-monitoring-tools-pgadmin-dbeaver"></a>

### Beginner

pgAdmin provides a GUI for server connection, SQL editing, and dashboards for activity and logs (depending on version). DBeaver is a universal SQL client with PostgreSQL support, session viewers, and ER diagrams. Both help beginners inspect `pg_stat_activity` without memorizing catalog joins.

### Intermediate

Use these tools to graphically browse roles, schemas, and statistics. Prefer read-only connections for monitoring personas. Combine GUI inspection with saved SQL for repeatability. Enterprise teams often centralize monitoring in Prometheus/Grafana or cloud-native monitors while still using GUIs for ad hoc investigation.

### Expert

Experts automate everything critical and treat GUIs as optional lenses. They secure tool access with SSO, vault-managed passwords, and network segmentation. They integrate pgAdmin/DBeaver-derived insights into runbooks (which view, which filter) so knowledge is not locked in clicks.

```sql
-- Minimal health panel query usable from any GUI SQL window
SELECT version() AS pg_version,
       pg_postmaster_start_time() AS started_at,
       current_setting('server_version_num')::int AS version_num;
```

```sql
SELECT * FROM pg_stat_activity WHERE pid = pg_backend_pid();
```

```bash
# Launch psql alongside GUI for reproducible scripts
psql "postgresql://user@host:5432/dbname?sslmode=require"
```

```yaml
# Example: pgAdmin server definition fields (conceptual; usually stored in GUI DB)
Name: prod-readonly
Host: db.example.com
Port: 5432
MaintenanceDB: postgres
Username: readonly_monitor
SSLMode: require
```

### Key Points

- GUIs differ by version; verify feature availability before training staff.
- Read-only roles reduce risk for dashboards.
- Heavy GUI metadata queries can add load; throttle refreshes.
- Session lists may truncate SQL text; copy pid for deeper queries.
- ER diagrams help onboarding but may drift from migrations.
- Credential storage in GUI wallets must meet org security policy.
- GUI tools are not a replacement for centralized alerting.

### Best Practices

- Standardize a “monitoring SQL snippet library” shared across tools.
- Enforce MFA and vault integration for human connections to prod.
- Log GUI access to sensitive environments where required.
- Prefer dedicated bastions or VPN paths to databases.
- Train engineers on `EXPLAIN` from the same tool they use daily.
- Periodically audit who has superuser GUI access.

### Common Mistakes

- Running auto-refresh dashboards at sub-second intervals on busy systems.
- Storing production passwords in plaintext connection files on laptops.
- Using GUI “kill” buttons without capturing query context.
- Mixing admin tasks with exploratory queries in the same superuser session.

---

## 9. Slow Query Analysis

<a id="9-slow-query-analysis"></a>

### Beginner

Slow query analysis starts with identifying candidates: `log_min_duration_statement`, `pg_stat_statements`, or live `pg_stat_activity`. Next, capture the plan with `EXPLAIN` (estimate) or `EXPLAIN ANALYZE` (actual timings, runs the query). Look for sequential scans on large tables, nested loops with huge row counts, or sort/hash spills.

### Intermediate

Use `EXPLAIN (ANALYZE, BUFFERS)` on non-destructive SELECTs. Compare estimated vs actual rows to detect stale statistics. Re-run `ANALYZE` on affected tables. Consider partial indexes, better predicates, or schema adjustments. Track before/after metrics in `pg_stat_statements` snapshots.

### Expert

Experts reproduce production plans using recorded parameters and `SET` commands (e.g., `SET enable_seqscan = off` only as a diagnostic, not a fix). They evaluate parallel plans, JIT effects, and partition pruning. They integrate auto_explain with thresholds and log sampling. They close loops with automated regression tests using recorded query shapes.

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at > now() - interval '7 days'
LIMIT 100;
```

```sql
-- After changes, compare normalized statement stats
SELECT calls, mean_exec_time, stddev_exec_time, rows, left(query, 200)
FROM pg_stat_statements
WHERE query ILIKE '%FROM orders%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

```bash
# Save plans during incidents
psql -X -f analyze_slow.sql > plan_$(date -u +%Y%m%dT%H%M%SZ).txt
```

### Key Points

- `EXPLAIN ANALYZE` executes DML unless you take precautions; prefer transactions or copies.
- Bad row estimates often trace to missing stats or correlated columns.
- High buffer reads implicate cache footprint and index choice.
- Spill to disk appears in plans as external sort/hash batches.
- ORMs generate patterns; fix the pattern, not one literal SQL string.
- Some functions prevent index usage; rewrite or index expressions.
- Plan stability changes across major versions; re-benchmark upgrades.

### Best Practices

- Maintain a slow-query register with owner, status, and fix type.
- Capture plans as artifacts linked to tickets.
- Add composite indexes only with measured selectivity gains.
- Revisit “fixed” queries after data volume grows an order of magnitude.
- Pair SQL tuning with application caching decisions explicitly.
- Use statement timeouts during ad hoc `EXPLAIN ANALYZE` on heavy queries.

### Common Mistakes

- Creating indexes for every sequential scan without considering write amplification.
- Running `EXPLAIN ANALYZE` on destructive statements in production.
- Ignoring maintenance (vacuum/analyze) while tuning queries.
- Chasing microsecond gains on queries that are network-bound.

---

## 10. Performance Metrics (CPU, Memory, Disk, Cache Hit Ratio)

<a id="10-performance-metrics-cpu-memory-disk-cache-hit-ratio"></a>

### Beginner

Database performance ties to host resources: CPU saturation, memory available for cache, disk latency and throughput, and Postgres buffer cache effectiveness. A simple cache hit ratio uses `pg_stat_database` blocks hit vs read. OS tools show CPU and RAM; cloud consoles add disk queue depth and IOPS limits.

### Intermediate

Correlate Postgres `temp_bytes` and `work_mem` settings with disk spikes. Watch checkpoint frequency via logs and `pg_stat_bgwriter`. For memory, distinguish RSS of postmaster from OS page cache effects—`effective_cache_size` informs the planner. Track replication lag if reads hit standbys.

### Expert

Experts build a layered signal stack: hypervisor metrics, EBS/Persistent Disk latency, WAL generation rate, checkpoint timing, bloat-driven vacuum cost, and query-layer stats. They simulate failures to observe metric behavior. They tune autovacuum and checkpoint targets when disk latency correlates with bgwriter/checkpoint events.

```sql
SELECT datname,
       blks_hit, blks_read,
       CASE WHEN blks_hit + blks_read = 0 THEN NULL
            ELSE round(100.0 * blks_hit / (blks_hit + blks_read), 3)
       END AS buffer_cache_hit_pct
FROM pg_stat_database
WHERE datname IS NOT NULL;
```

```sql
SELECT checkpoints_timed, checkpoints_req, checkpoint_write_time, checkpoint_sync_time,
       buffers_checkpoint, buffers_clean, buffers_backend
FROM pg_stat_bgwriter;
```

```bash
# OS snapshots (Linux examples; flags vary)
uptime
vmstat 1 5
iostat -xz 1 5
```

```yaml
# Prometheus postgres_exporter (conceptual scrape config fragment)
scrape_configs:
  - job_name: postgres
    static_configs:
      - targets: ["postgres-exporter:9187"]
```

### Key Points

- Cache hit ratio is contextual; small databases may show 100% trivially.
- Disk saturation shows up in IO wait events and checkpoint delays.
- CPU spikes may be vacuum, index builds, or parallel queries.
- Memory pressure increases kernel paging and noisy neighbor effects.
- WAL volume affects replication and backup windows.
- Network metrics matter for remote storage and replicas.
- Single-metric alerts cause false positives; combine signals.

### Best Practices

- Dashboard the top six: connections, tps, latency, IO wait, hit ratio, replication lag.
- Set SLOs at the application layer, map them to DB metrics.
- Review instance size after schema growth, not only QPS changes.
- Use canary queries to detect planner regressions early.
- Document vendor-specific metric names (RDS, Cloud SQL).
- Schedule synthetic full-table count sanity checks only off-peak.

### Common Mistakes

- Optimizing hit ratio while p95 latency is acceptable and stable.
- Ignoring EBS burst balance or disk type limits.
- Blaming Postgres for CPU used by misconfigured backups on the same VM.
- Setting `shared_buffers` arbitrarily without measurement.

---

## 11. Alert Configuration

<a id="11-alert-configuration"></a>

### Beginner

Alerts turn metrics into action. Typical starting alerts: replication lag above threshold, connection count high, disk free space low, ERROR rate spike, and sustained CPU. Each alert should have a runbook link, severity, and owner on-call rotation.

### Intermediate

Use multi-window alerts to avoid flapping (e.g., lag high for N minutes). Separate warning from critical thresholds. Route database alerts to the DBA channel and dependent services to product channels when SLOs break. Include context templates with cluster name, region, and top wait events.

### Expert

Experts implement SLO-based alerting (error budget burn) where feasible. They simulate alert storms and tune deduplication. They maintain “silence policy” governance to prevent alert fatigue abuse. For global fleets, they shard alert rules per environment to reduce false positives from dev traffic.

```sql
-- Example values to embed in alert tickets
SELECT pg_is_in_recovery() AS is_replica,
       pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn(),
       pg_wal_lsn_diff(pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn()) AS replay_lag_bytes
;
```

```sql
SELECT datname, deadlocks, temp_files, temp_bytes
FROM pg_stat_database
WHERE datname = current_database();
```

```yaml
# Alertmanager route sketch (illustrative)
route:
  receiver: dba-oncall
  routes:
    - matchers:
        - alertname =~ "Postgres.*"
      receiver: dba-oncall
receivers:
  - name: dba-oncall
    pagerduty_configs:
      - service_key: "<secret>"
```

### Key Points

- Alerts need actionable text; “CPU high” is insufficient without hints.
- Lag alerts differ for sync vs async topologies.
- Disk alerts should include WAL and log directories, not only data.
- Deadlocks should be rare; trending matters.
- Connection alerts should account for admin reservations.
- Test alert delivery after credential rotations.
- On-call runbooks must include rollback steps.

### Best Practices

- Add “cause candidates” sections to runbooks (locks, vacuum, checkpoints).
- Automate periodic alert rule review calendar reminders.
- Correlate deploy timelines with alert annotations.
- Keep staging alerts enabled with different thresholds.
- Practice game days that trigger synthetic alerts safely.
- Measure MTTR improvements quarter over quarter.

### Common Mistakes

- Alerting on hit ratio alone with tight thresholds.
- Missing replica-specific alerts after topology changes.
- Overlapping redundant alerts without deduplication.
- Silencing production alerts during maintenance without expiry.

---

## 12. Audit Logging (pgAudit)

<a id="12-audit-logging-pgaudit"></a>

### Beginner

pgAudit extends PostgreSQL logging to record audit events for sessions, objects, and statements in detail. It helps meet compliance requirements by producing structured audit trails beyond basic `log_statement`. Installation typically requires adding `pgaudit` to `shared_preload_libraries` and setting `pgaudit.log` parameters (exact names depend on version).

### Intermediate

Configure which classes to log (e.g., READ, WRITE, DDL, ROLE, MISC). Use role-based settings to target privileged users rather than logging all traffic. Combine with log destinations appropriate for SIEM ingestion. Test performance impact on OLTP before broad READ logging.

### Expert

Experts scope audits to least-necessary surface area, integrate with centralized tamper-evident storage, and map events to compliance controls (who accessed what, when, from where). They separate audit logs from operational logs at collection time. They review upgrade notes when pgAudit behavior changes across Postgres major versions.

```sql
-- After extension is available in the cluster
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Example session-level class toggles (if permitted by policy)
SET pgaudit.log = 'write, ddl, role';
SET pgaudit.log_relation = on;
```

```sql
-- Identify roles used by humans vs apps for targeted auditing
SELECT rolname, rolcanlogin, rolsuper
FROM pg_roles
ORDER BY rolname;
```

```bash
# postgresql.conf fragments (illustrative; requires restart for shared_preload)
# shared_preload_libraries = 'pgaudit'
# pgaudit.log = 'ddl, role'
# pgaudit.log_catalog = off
```

```yaml
# Kubernetes / Helm style: enforce audit config via ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-audit-conf
data:
  postgresql.conf: |
    shared_preload_libraries = 'pgaudit'
    pgaudit.log = 'ddl, role, write'
    pgaudit.log_catalog = off
```

### Key Points

- pgAudit is powerful; over-logging can harm performance and privacy.
- READ auditing generates large volumes; scope carefully.
- Role-based auditing aligns with least-privilege operational models.
- Audit configuration belongs in change-managed infrastructure as code.
- Retention and access controls for audit logs are compliance-critical.
- Not all managed providers allow arbitrary shared_preload entries.
- Pair technical auditing with periodic access reviews.

### Best Practices

- Start with DDL and ROLE classes, expand only with sign-off.
- Document the mapping from audit events to compliance clauses.
- Redact or avoid capturing sensitive column values where illegal to retain.
- Test SIEM parsers whenever Postgres or pgAudit versions change.
- Assign an owner for audit log integrity checks.
- Rehearse forensic queries under time pressure annually.

### Common Mistakes

- Enabling READ logging globally on high-QPS systems without capacity planning.
- Storing audit logs on the same volume without immutability guarantees.
- Confusing pgAudit with full application-level audit trails.
- Forgetting that superuser activity still needs governance and monitoring.

---

## Appendix: Monitoring SQL & Shell Cookbook

This appendix provides additional copy-paste diagnostics that complement the twelve subtopics above. Run against non-production first when in doubt.

```sql
-- Long-running idle transactions (bloat and lock risk)
SELECT pid, usename, datname, xact_start, now() - xact_start AS xact_age, state, left(query, 200)
FROM pg_stat_activity
WHERE xact_start IS NOT NULL AND state ILIKE 'idle in transaction%'
ORDER BY xact_start;
```

```sql
-- Blocking tree (simplified)
WITH blockers AS (
  SELECT pid, pg_blocking_pids(pid) AS waiters
  FROM pg_stat_activity
)
SELECT * FROM blockers WHERE waiters <> '{}';
```

```sql
-- Table bloat indicators (rough; validate with pgstattuple or external tools)
SELECT schemaname, relname, n_live_tup, n_dead_tup,
       round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 30;
```

```sql
-- Index usage vs sequential scans per table
SELECT relname, seq_scan, idx_scan,
       CASE WHEN seq_scan + idx_scan = 0 THEN NULL
            ELSE round(100.0 * idx_scan / (seq_scan + idx_scan), 2)
       END AS idx_scan_pct
FROM pg_stat_user_tables
ORDER BY seq_scan DESC
LIMIT 30;
```

```sql
-- Function hot spots
SELECT funcname, calls, total_time, self_time
FROM pg_stat_user_functions
ORDER BY total_time DESC
LIMIT 25;
```

```sql
-- Checkpoint and bgwriter snapshot
SELECT * FROM pg_stat_bgwriter;
```

```sql
-- Replication sender view (on primary)
SELECT application_name, client_addr, state, sync_state,
       write_lag, flush_lag, replay_lag
FROM pg_stat_replication;
```

```sql
-- WAL receiver view (on standby)
SELECT status, receive_start_lag, write_lag, flush_lag, replay_lag
FROM pg_stat_wal_receiver;
```

```sql
-- Database age (transaction id) awareness
SELECT datname, age(datfrozenxid) AS dat_age
FROM pg_database
ORDER BY age(datfrozenxid) DESC;
```

```sql
-- Locks: heavy hitters
SELECT locktype, relation::regclass, mode, granted, count(*)
FROM pg_locks
WHERE relation IS NOT NULL
GROUP BY 1,2,3,4
ORDER BY count(*) DESC;
```

```bash
# Disk space triage around a Linux data directory
df -h
du -sh /var/lib/postgresql/* 2>/dev/null | sort -h
find /var/lib/postgresql -name "*.log" -mtime -1 -ls 2>/dev/null | head
```

```bash
# Quick TLS clarity from psql (if ssl in use)
psql -X -c "SHOW ssl; SHOW ssl_min_protocol_version;"
```

```yaml
# Example Grafana dashboard variables (conceptual)
dashboard:
  templating:
    list:
      - name: datname
        type: query
        query: "label_values(pg_stat_database_datname)"
```

### Key Points (Appendix)

- Cookbook queries should be adapted to your monitoring user permissions.
- Blocking queries require careful interpretation during transient bursts.
- Dead tuple ratios are hints, not ground-truth bloat measures.
- Replication views differ between primary and standby roles.
- XID age monitoring helps prevent wraparound emergencies.

### Best Practices (Appendix)

- Version-control your SQL snippets next to infrastructure code.
- Snapshot outputs to tickets for post-incident reviews.
- Avoid running wide scans on huge catalogs during peak hours.
- Pair SQL diagnostics with host-level metrics for completeness.

### Common Mistakes (Appendix)

- Killing autovacuum without understanding what it was doing.
- Reading replication lag metrics on the wrong node role.
- Assuming `pg_stat_*` zeros mean “no problem” right after a restart.

### Extended Drill: Log-Linear Regression of Latency Signals

Use this sequence when leadership asks whether the database or the network caused a latency spike. The steps intentionally mirror observability maturity models.

```sql
-- 1) Session pressure
SELECT state, count(*) FROM pg_stat_activity GROUP BY 1 ORDER BY 2 DESC;

-- 2) Top wait events
SELECT wait_event_type, wait_event, count(*)
FROM pg_stat_activity
WHERE wait_event IS NOT NULL
GROUP BY 1,2 ORDER BY 3 DESC;

-- 3) Temp spill footprint (database level)
SELECT datname, temp_files, temp_bytes
FROM pg_stat_database
WHERE datname IS NOT NULL
ORDER BY temp_bytes DESC;

-- 4) Checkpoint pressure proxy
SELECT checkpoints_timed, checkpoints_req, buffers_checkpoint
FROM pg_stat_bgwriter;

-- 5) Cache effectiveness snapshot
SELECT sum(blks_hit) AS hits, sum(blks_read) AS reads
FROM pg_stat_database
WHERE datname IS NOT NULL;
```

```sql
-- Correlate pg_stat_statements I/O with mean latency
SELECT queryid, calls, mean_exec_time,
       shared_blks_hit, shared_blks_read, shared_blks_dirtied,
       left(query, 160) AS q
FROM pg_stat_statements
WHERE calls > 1000
ORDER BY shared_blks_read DESC
LIMIT 30;
```

```sql
-- Autovacuum progress (when available)
SELECT * FROM pg_stat_progress_vacuum;
```

```sql
-- Autovacuum progress for analyze (when available)
SELECT * FROM pg_stat_progress_analyze;
```

```sql
-- Cluster-wide non-idle backends
SELECT count(*) FILTER (WHERE state = 'active') AS active,
       count(*) FILTER (WHERE wait_event IS NOT NULL) AS waiting,
       count(*) AS total
FROM pg_stat_activity;
```

```bash
# Sample ss/netstat style (OS dependent) during client storms
# macOS:
netstat -an | grep 5432 | wc -l
# Linux:
ss -tan state established '( sport = :5432 )' | wc -l
```

```yaml
# Example Loki/Promtail scrape labels for Postgres JSON logs
clients:
  - url: http://loki:3100/loki/api/v1/push
    external_labels:
      job: postgres
      env: production
```

### Key Points (Extended Drill)

- Spikes often have multiple contributing factors; resist single-cause narratives.
- Temp bytes rising implicates sorts/hashes and work_mem budgeting.
- Checkpoint counters rising quickly may correlate with WAL spikes.
- Network connection counts should be compared against pool limits.
- Progress views help explain “mysterious” CPU during vacuum/analyze.

### Best Practices (Extended Drill)

- Capture the five-query bundle above in a single saved script for incidents.
- Annotate timelines with deploy, batch job, and backup schedules.
- Store outputs with UTC timestamps in incident channels.
- Re-run after mitigation to prove recovery, not just assume it.

### Common Mistakes (Extended Drill)

- Declaring victory after one snapshot shows improvement.
- Ignoring batch windows that repeat daily and look like regressions.
- Comparing hit ratios across databases with wildly different sizes.

### Quick Reference: What To Check First

| Symptom | First Postgres queries | First host metrics |
|--------|-------------------------|--------------------|
| Slow API p95 | `pg_stat_activity`, waits | CPU, IO wait |
| Connection errors | `pg_stat_activity`, `max_connections` | SYN backlog, file descriptors |
| Disk full | log dir, WAL dir, temp files | `df`, inode usage |
| Replica lag | `pg_stat_replication` / receiver | network, disk on replica |
| Spiky CPU | `pg_stat_progress_*`, top queries | steal time (cloud), run queue |

```sql
-- One-liner: backends grouped by database
SELECT datname, count(*) FROM pg_stat_activity GROUP BY 1 ORDER BY 2 DESC;
```

```sql
-- One-liner: oldest running query
SELECT pid, now() - query_start AS age, left(query, 200)
FROM pg_stat_activity
WHERE state = 'active' AND pid <> pg_backend_pid()
ORDER BY age DESC LIMIT 5;
```

```bash
# Archive last hour of logs safely (example path)
ts=$(date -u +%Y%m%dT%H%M%SZ)
tar czf "pglogs-$ts.tgz" /var/lib/postgresql/16/main/log 2>/dev/null || true
```

### Key Points (Quick Reference)

- Tables accelerate onboarding; customize for your platform’s metric names.
- Always record cluster identity (name, region, version) in incident notes.
- Pair database checks with load balancer and app thread pool health.

### Best Practices (Quick Reference)

- Print this table in onboarding docs for new engineers.
- Link each row to a detailed runbook section within two clicks.
- Update the table after major topology changes.

### Common Mistakes (Quick Reference)

- Treating symptoms in isolation without time correlation.
- Using production paths in examples without adjusting versions.

---

