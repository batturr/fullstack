# Tuning and Configuration

**PostgreSQL learning notes (March 2026). Topic aligned with README topic 26.**

## 📑 Table of Contents

- [1. PostgreSQL Configuration File (`postgresql.conf`)](#1-postgresql-configuration-file-postgresqlconf)
- [2. Memory Configuration](#2-memory-configuration)
- [3. Connection Settings](#3-connection-settings)
- [4. Query Planner Settings](#4-query-planner-settings)
- [5. WAL Configuration](#5-wal-configuration)
- [6. Logging Configuration](#6-logging-configuration)
- [7. Autovacuum Configuration](#7-autovacuum-configuration)
- [8. Background Writer Configuration](#8-background-writer-configuration)
- [9. Checkpoint Configuration](#9-checkpoint-configuration)
- [10. Lock Configuration](#10-lock-configuration)
- [11. Index Configuration](#11-index-configuration)
- [12. Performance Testing Configuration](#12-performance-testing-configuration)
- [13. Configuration Presets (dev/prod/OLTP/OLAP)](#13-configuration-presets-devprodoltpolap)
- [14. Configuration Documentation](#14-configuration-documentation)

---

## 1. PostgreSQL Configuration File (`postgresql.conf`)

<a id="1-postgresql-configuration-file-postgresqlconf"></a>

### Beginner

`postgresql.conf` is the primary server configuration file. It sets memory limits, planner costs, WAL behavior, logging, autovacuum, and hundreds of other parameters. You can view the active file path with `SHOW config_file;`. Many parameters accept `ALTER SYSTEM` which writes to `postgresql.auto.conf`, overriding `postgresql.conf` without manual editing.

### Intermediate

Parameters have contexts: some reload with `pg_reload_conf()`, others need a restart (`pending_restart` in `pg_settings`). Use `pg_settings` to inspect units, min/max, and sources. Include files via `include` or `include_if_exists` help modularize cloud and environment-specific snippets.

### Expert

Experts track configuration as code (Ansible/Terraform/Kubernetes Operators), validate with automated `pg_ctl configtest` or package equivalents, and diff effective settings across replicas. They understand GUC inheritance order and protect against drift between fail-over members.

```sql
SHOW config_file;
SHOW data_directory;
SHOW hba_file;
SELECT pg_reload_conf();
```

```sql
SELECT name, setting, unit, source, sourcefile, sourceline, pending_restart
FROM pg_settings
WHERE name IN ('shared_buffers','max_connections','work_mem','wal_level')
ORDER BY name;
```

```bash
# Offline syntax check (paths vary)
pg_ctl -D /var/lib/postgresql/16/main configtest
```

```yaml
# Helm-style values: centralize postgresql.conf fragments
postgresql:
  parameters:
    max_connections: "200"
    shared_buffers: "2GB"
```

### Key Points

- Effective configuration merges defaults, `postgresql.conf`, `auto.conf`, and command-line.
- `ALTER SYSTEM` persists changes for restarts and reloads appropriately.
- Always verify `pending_restart` after changes.
- Include files reduce merge conflicts in GitOps workflows.
- Some managed databases hide direct file access but expose parameter groups.
- Version upgrades add or change defaults; read release notes.
- Document non-default settings with justification comments.

### Best Practices

- Store configuration templates per environment in version control.
- Automate diffs after incident-related hotfixes.
- Run reload smoke tests in staging with production-like load.
- Restrict who can `ALTER SYSTEM` in production.
- Pair config changes with monitoring dashboards and rollback steps.
- Keep a “golden image” parameter set for new replicas.

### Common Mistakes

- Editing only `postgresql.conf` while `postgresql.auto.conf` overrides silently.
- Restarting unnecessarily when reload would suffice—or the reverse.
- Copying tuning blogs verbatim without measuring your workload.
- Losing track of vendor-specific parameter name mappings.

---

## 2. Memory Configuration

<a id="2-memory-configuration"></a>

### Beginner

`shared_buffers` caches relation pages in PostgreSQL’s buffer pool. `effective_cache_size` hints how much OS cache is available for planning (not allocation). `work_mem` caps per-sort/hash memory per operation before spilling to disk. `maintenance_work_mem` raises limits for vacuum, index builds, and similar maintenance.

### Intermediate

Rule-of-thumb starting points: `shared_buffers` often 25% of RAM on dedicated DB hosts (not universal). `effective_cache_size` often 50–75% of RAM including OS page cache. `work_mem` must be multiplied by concurrent operations—high global values risk OOM. `maintenance_work_mem` can be large but still bounded by RAM and concurrent autovacuum workers.

### Expert

Experts measure buffer hit ratios with context, watch for double-buffering with small `shared_buffers` on cloud disks, and tune `work_mem` using peak concurrent sorts derived from logs. They set autovacuum worker memory thoughtfully and validate cgroup/memory limits in containers.

```sql
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW work_mem;
SHOW maintenance_work_mem;
```

```sql
SELECT name, setting, unit, boot_val, reset_val
FROM pg_settings
WHERE name IN ('shared_buffers','effective_cache_size','work_mem','maintenance_work_mem','temp_buffers');
```

```bash
# Host memory snapshot (Linux)
free -h
grep -E 'MemTotal|MemAvailable' /proc/meminfo
```

```yaml
postgresql:
  parameters:
    shared_buffers: "8GB"
    effective_cache_size: "24GB"
    work_mem: "32MB"
    maintenance_work_mem: "1GB"
```

### Key Points

- Memory settings interact; never tune one in isolation forever.
- `work_mem` is per operation node, not per statement globally.
- Spill to disk shows up as temp files and latency—often `work_mem` related.
- Containers need limits aligned with Kubernetes `resources.limits.memory`.
- Huge pages (optional) may help on large `shared_buffers` systems.
- Overcommit policies on Linux affect OOM killer behavior.
- Cloud instances may throttle based on RAM class.

### Best Practices

- Build a small matrix: RAM size → candidate `shared_buffers`/`work_mem` caps.
- Load test after memory changes; watch for swap and eviction.
- Document rationale for non-default memory values in YAML comments.
- Use session-level `SET work_mem` for known heavy batch jobs.
- Monitor `pg_stat_database.temp_bytes` after memory tuning.

### Common Mistakes

- Setting enormous `work_mem` because one query needed it once.
- Ignoring connection count when estimating worst-case memory.
- Setting `effective_cache_size` near zero or absurdly high without meaning.
- Running DB + JVM giants on the same host without reservations.

---

## 3. Connection Settings

<a id="3-connection-settings"></a>

### Beginner

`max_connections` caps concurrent client backends. Superuser reserved connections protect admin access. Timeouts like `statement_timeout`, `lock_timeout`, and `idle_in_transaction_session_timeout` protect against runaway clients. Poolers (PgBouncer) reduce raw connection count to Postgres.

### Intermediate

Each connection consumes memory for buffers and state. Raising `max_connections` without pooling often hurts performance. Set timeouts at role or database level for application roles. Combine with OS `ulimit` and cloud security group realities.

### Expert

Experts model connection arrival rates vs pool sizing, use circuit breakers in apps, and differentiate OLTP microservices from batch ETL roles. They tune `tcp_keepalives_*` for network pathologies and validate SSL handshake costs under churn.

```sql
SHOW max_connections;
SHOW superuser_reserved_connections;
ALTER DATABASE appdb SET statement_timeout = '30s';
ALTER ROLE app_rw SET lock_timeout = '5s';
```

```sql
SELECT rolname, rolconnlimit FROM pg_roles WHERE rolcanlogin ORDER BY rolname;
```

```bash
# Show approximate connection counts
psql -X -Atqc "SELECT count(*) FROM pg_stat_activity;"
```

```yaml
pgbouncer:
  max_client_conn: 2000
  default_pool_size: 50
  pool_mode: transaction
```

### Key Points

- More connections ≠ more throughput beyond a point.
- Reserved superuser slots prevent total lockout during storms.
- Timeouts should be staged (lock shorter than statement).
- Pool mode changes SQL semantics (use transaction pooling carefully).
- Some drivers dislike prepared statements with transaction pooling.
- Auth latency multiplies with connection churn.
- Read-only replicas still need sane connection limits.

### Best Practices

- Prefer external pooling for many stateless app instances.
- Alert at 80% of `max_connections`.
- Use separate roles for admin vs application with different timeouts.
- Document why `rolconnlimit` deviates from defaults per user.
- Test failover behavior with pools (session vs transaction).

### Common Mistakes

- Setting `max_connections` to thousands without measuring memory impact.
- Using session pooling where idle transactions hold server connections.
- Omitting `idle_in_transaction_session_timeout` for ORM-heavy apps.
- Blaming Postgres for app retry loops that amplify connects.

---

## 4. Query Planner Settings

<a id="4-query-planner-settings"></a>

### Beginner

The planner estimates costs using parameters like `seq_page_cost`, `random_page_cost`, and CPU-related costs. SSD/NVMe systems often lower `random_page_cost` toward `seq_page_cost`. These settings influence index vs sequential scan choices.

### Intermediate

Adjust costs when storage is remote or networked (higher random access penalty sometimes). Always validate with `EXPLAIN` on real queries. Keep `effective_cache_size` sane so index scans look attractive when data is cached.

### Expert

Experts avoid global cost hacks when per-query fixes exist. They use partial indexes, better statistics (`CREATE STATISTICS`), and partition pruning. They document cost tweaks with A/B plan captures and revert if regressions appear.

```sql
SHOW seq_page_cost;
SHOW random_page_cost;
SHOW cpu_tuple_cost;
SHOW cpu_index_tuple_cost;
SHOW cpu_operator_cost;
```

```sql
SET random_page_cost = 1.1;
SET effective_io_concurrency = 200; -- for SSD RAID; platform dependent
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM big WHERE skewed_col = 42;
RESET random_page_cost;
```

```yaml
postgresql:
  parameters:
    random_page_cost: "1.1"
    effective_io_concurrency: "200"
```

### Key Points

- Cost settings are relative, not milliseconds.
- NVMe vs SAN vs EBS changes plausible `random_page_cost`.
- Mis-tuned costs can hide missing statistics problems.
- Parallel query knobs (`max_parallel_*`) interact with costs.
- JIT settings affect CPU-heavy analytical queries.
- Planner hints are not native; avoid external hint hacks unless necessary.
- Upgrades may change planner behavior—retest cost tweaks.

### Best Practices

- Capture `EXPLAIN` before/after cost adjustments.
- Limit cost tweaks to specific databases or sessions when possible.
- Investigate stats and indexing before global cost changes.
- Revisit cost assumptions after storage migrations.

### Common Mistakes

- Setting `random_page_cost` extremely low on HDD systems erroneously.
- Using cost tweaks to mask data model problems indefinitely.
- Ignoring correlation by relying only on single-column stats.

---

## 5. WAL Configuration

<a id="5-wal-configuration"></a>

### Beginner

Write-Ahead Logging (WAL) guarantees durability. `wal_level` controls how much information is logged; `replica` or `logical` is needed for replication. `max_wal_size` and `min_wal_size` influence checkpoint frequency and WAL retention. Archiving supports PITR.

### Intermediate

Tune WAL for replication slots and standby lag. `wal_compression` reduces I/O at CPU cost. `full_page_writes` protects against partial page writes after crash. Understand trade-offs when syncing to remote storage.

### Expert

Experts correlate WAL generation with checkpoint spikes, tune `checkpoint_timeout` vs `max_wal_size`, and monitor `pg_stat_wal`. They plan logical decoding disk usage and slot retention. Cloud disks may hide fsync latency until saturation.

```sql
SHOW wal_level;
SHOW max_wal_senders;
SHOW max_wal_size;
SHOW min_wal_size;
SHOW wal_compression;
```

```sql
SELECT * FROM pg_stat_wal;
```

```bash
# WAL directory size snapshot
du -sh "$(psql -X -Atqc "SHOW data_directory;")/pg_wal"
```

```yaml
postgresql:
  parameters:
    wal_level: "replica"
    max_wal_size: "4GB"
    min_wal_size: "1GB"
    wal_compression: "on"
```

### Key Points

- Higher `wal_level` increases WAL volume.
- Checkpoints flush dirty buffers; aggressive checkpoints cause IO spikes.
- Replication depends on WAL retention; slots prevent removal at cost of disk.
- Archiving must keep pace with generation or backlog grows.
- `synchronous_commit` interacts with durability and latency.
- Standby feedback can reduce query-cancel issues but has trade-offs.
- Major version upgrades may change WAL formats.

### Best Practices

- Graph WAL generation rate vs time of day.
- Ensure monitoring on `pg_wal` disk free space.
- Test PITR restores when changing archive commands.
- Document slot owners and max retention policies.
- Align checkpoint tuning with storage latency profiles.

### Common Mistakes

- Setting `wal_level=minimal` while attempting replication.
- Undersizing WAL disk during bulk loads.
- Ignoring slot-induced disk fill on primaries.

---

## 6. Logging Configuration

<a id="6-logging-configuration"></a>

### Beginner

Logging parameters include `log_min_messages`, `log_min_error_statement`, `log_min_duration_statement`, and `log_line_prefix`. They shape verbosity, which statements appear with errors, and slow-query capture. Logging impacts IO and security (sensitive data).

### Intermediate

Balance forensic value with volume. Use `jsonlog`/`csvlog` when centralized parsers exist. Rotate aggressively on small instances. Separate audit logging (pgAudit) from performance logging.

### Expert

Experts implement dynamic logging profiles during incidents, integrate sampling at the collector, and redact PII at ingest. They benchmark logging overhead on write-heavy primaries.

```sql
ALTER SYSTEM SET log_min_messages TO warning;
ALTER SYSTEM SET log_min_error_statement TO error;
SELECT pg_reload_conf();
```

```bash
grep -E '^log_' /var/lib/postgresql/16/main/postgresql.conf | head -n 50
```

```yaml
postgresql:
  parameters:
    log_destination: "stderr"
    logging_collector: "on"
    log_directory: "log"
    log_filename: "postgresql-%Y-%m-%d_%H%M%S.log"
    log_rotation_age: "1d"
    log_rotation_size: "100MB"
```

### Key Points

- Logging and replication WAL are different subsystems with different disks risks.
- Error statement logging can leak sensitive literals—govern accordingly.
- CSV/JSON aids SIEM; stderr aids humans tailing files.
- `log_checkpoints` helps diagnose spikes.
- `log_lock_waits` surfaces blocking at INFO-ish verbosity depending on version.
- Managed services may fix certain log parameters.
- Central log pipeline lag is an operational risk.

### Best Practices

- Define logging baselines per environment.
- Test parser schemas when switching formats.
- Add runbook links in alert annotations referencing log fields.
- Periodically review who can change logging settings.

### Common Mistakes

- Turning everything to DEBUG during peak without rollback timer.
- Logging secrets from parameterized queries incorrectly assumed safe.
- Filling disks due to unchecked rotation misconfiguration.

---

## 7. Autovacuum Configuration

<a id="7-autovacuum-configuration"></a>

### Beginner

Autovacuum reclaims dead tuples, updates planner statistics via autoanalyze, and helps prevent transaction ID wraparound. Global settings include `autovacuum`, `autovacuum_max_workers`, `autovacuum_naptime`, and scale factors for vacuum/analyze thresholds per table.

### Intermediate

Heavy write tables may need per-table `autovacuum_vacuum_scale_factor` reductions or more aggressive triggers. Long transactions block vacuum progress. Monitor `last_autovacuum` and `n_dead_tup` from `pg_stat_user_tables`.

### Expert

Experts tune freeze settings (`autovacuum_freeze_*`) for churny tables, use `pg_stat_progress_vacuum`, and schedule manual vacuums for bulk loads. They validate autovacuum throttling vs IO capacity on cloud disks.

```sql
SHOW autovacuum;
SHOW autovacuum_max_workers;
SHOW autovacuum_naptime;
```

```sql
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 25;
```

```sql
ALTER TABLE big_events SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.05
);
```

```yaml
postgresql:
  parameters:
    autovacuum_max_workers: "5"
    autovacuum_naptime: "15s"
    autovacuum_vacuum_scale_factor: "0.1"
```

### Key Points

- Autovacuum is not optional for healthy OLTP.
- Per-table settings beat global brute-force changes.
- Freeze failures are existential; monitor age metrics.
- Bulk loads may need manual `VACUUM (ANALYZE)` afterwards.
- High dead tuple ratios hurt index efficiency and bloat.
- Autovacuum IO can contend with checkpoints.
- Long idle transactions are vacuum enemies.

### Best Practices

- Dashboard dead tuples for top tables weekly.
- Add indexes only after verifying vacuum health.
- Document per-table autovacuum exceptions with reasons.
- Educate developers about transaction boundaries.

### Common Mistakes

- Disabling autovacuum to “reduce load” without a replacement plan.
- Ignoring toast tables and wide rows in bloat analysis.
- Expecting autovacuum to fix bad application transaction patterns.

---

## 8. Background Writer Configuration

<a id="8-background-writer-configuration"></a>

### Beginner

The background writer (bgwriter) smooths checkpoint IO by writing dirty buffers gradually. Key settings include `bgwriter_delay`, `bgwriter_lru_maxpages`, and `bgwriter_lru_multiplier`. These influence how aggressively dirty pages move to disk between checkpoints.

### Intermediate

Tuning bgwriter attempts to reduce checkpoint spikes. However, over-aggressive settings may increase steady-state IO. Always interpret alongside `pg_stat_bgwriter` counters and storage latency metrics.

### Expert

Experts evaluate bgwriter effectiveness after storage class changes (e.g., HDD to SSD). They correlate `buffers_clean` with checkpoint-related `buffers_checkpoint` and may adjust checkpoint parameters instead of solely pushing bgwriter.

```sql
SELECT * FROM pg_stat_bgwriter;
```

```sql
SHOW bgwriter_delay;
SHOW bgwriter_lru_maxpages;
SHOW bgwriter_lru_multiplier;
```

```yaml
postgresql:
  parameters:
    bgwriter_delay: "50ms"
    bgwriter_lru_maxpages: "1000"
    bgwriter_lru_multiplier: "2.0"
```

### Key Points

- bgwriter is a smoothing tool, not a replacement for adequate IO capacity.
- Misconfiguration shows up as checkpoint-heavy write bursts.
- Stats must be observed as deltas, not one-off snapshots.
- Cloud volumes may mask issues until credit exhaustion.
- bgwriter interacts with `shared_buffers` dirty ratio behavior.
- Large batch jobs can overwhelm smoothing temporarily.
- Always measure end-user latency, not only backend metrics.

### Best Practices

- Capture `pg_stat_bgwriter` before/after storage migrations.
- Pair bgwriter review with `checkpoint_timeout`/`max_wal_size` tuning.
- Document rationale when deviating from defaults.
- Use staging load tests with realistic WAL volume.

### Common Mistakes

- Extreme bgwriter settings without observing write amplification.
- Ignoring checkpoints while obsessing over bgwriter only.
- Reading absolute counters without time deltas.

---

## 9. Checkpoint Configuration

<a id="9-checkpoint-configuration"></a>

### Beginner

Checkpoints flush dirty data pages and truncate WAL segments eligible for recycling (subject to replication/archiving). `checkpoint_timeout` sets a time cap; `max_wal_size` influences how much WAL can accumulate before a checkpoint. `checkpoint_completion_target` spreads writes across the checkpoint interval.

### Intermediate

Tuning goals: avoid sub-minute spikes that stall queries while maintaining recovery bounds. Increase `max_wal_size` when checkpoints are too frequent due to WAL volume. Watch `checkpoint_req` vs `checkpoint_timed` in `pg_stat_bgwriter`.

### Expert

Experts align checkpoint tuning with replication lag SLAs and backup windows. They monitor `checkpoint_write_time` and `checkpoint_sync_time`. On remote storage, `checkpoint_warning` logs help catch spikes early.

```sql
SHOW checkpoint_timeout;
SHOW max_wal_size;
SHOW min_wal_size;
SHOW checkpoint_completion_target;
```

```sql
SELECT checkpoints_timed, checkpoints_req, checkpoint_write_time, checkpoint_sync_time
FROM pg_stat_bgwriter;
```

```yaml
postgresql:
  parameters:
    checkpoint_timeout: "15min"
    max_wal_size: "8GB"
    checkpoint_completion_target: "0.9"
```

### Key Points

- Frequent `checkpoints_req` suggests WAL pressure or low `max_wal_size`.
- Spreading checkpoint IO reduces p99 latency outliers.
- Recovery time after crash relates to checkpoint recency.
- Replication slots can retain WAL beyond naive expectations.
- Storage fsync latency dominates `checkpoint_sync_time` often.
- NVMe reduces but does not eliminate checkpoint sensitivity at scale.
- Cloud burst IOPS limits interact badly with aggressive checkpoints.

### Best Practices

- Plot checkpoint frequency daily on write-heavy systems.
- Correlate checkpoint spikes with autovacuum and bulk loads.
- Document checkpoint policy changes in change tickets.
- Test disaster recovery after major checkpoint tuning.

### Common Mistakes

- Setting enormous `max_wal_size` without monitoring disk headroom.
- Assuming SSD eliminates all checkpoint visibility issues.
- Ignoring `checkpoint_completion_target` on latency-sensitive OLTP.

---

## 10. Lock Configuration

<a id="10-lock-configuration"></a>

### Beginner

`deadlock_timeout` controls how quickly Postgres checks for deadlocks. Session-level `lock_timeout` aborts lock waits early. Design and indexing reduce lock contention more than tuning alone.

### Intermediate

Use `lock_timeout` in migrations to avoid indefinite waits. Pair with retries in DDL automation. Monitor `deadlocks` in `pg_stat_database`—nonzero trends warrant code review.

### Expert

Experts analyze lock graphs, use `pg_blocking_pids`, and sequence migrations to avoid table-wide ACCESS EXCLUSIVE locks. They tune statement timeouts for ETL vs OLTP roles separately.

```sql
SHOW deadlock_timeout;
SET lock_timeout = '2s';
-- DDL example (be careful)
BEGIN;
ALTER TABLE orders ADD COLUMN fulfillment text;
COMMIT;
```

```sql
SELECT deadlocks FROM pg_stat_database WHERE datname = current_database();
```

```yaml
postgresql:
  parameters:
    deadlock_timeout: "1s"
```

### Key Points

- Deadlock detection is not a substitute for good transaction design.
- `lock_timeout` helps bounded maintenance windows.
- SERIALIZABLE workloads need different monitoring patterns.
- Advisory locks require application discipline.
- Foreign keys and triggers can extend lock durations unexpectedly.
- Autovacuum can block DDL briefly—schedule carefully.
- Row locks vs predicate locks differ under SERIALIZABLE.

### Best Practices

- Standardize migration playbooks with lock expectations.
- Add integration tests for concurrent updates on hot rows.
- Dashboard deadlock counts with low-rate alerting.
- Document retry strategies for transient lock failures.

### Common Mistakes

- Setting `lock_timeout` without teaching apps to retry safely.
- Running migrations during peak without `SET lock_timeout`.
- Ignoring long-running `idle in transaction` sessions holding locks.

---

## 11. Index Configuration

<a id="11-index-configuration"></a>

### Beginner

Index builds can use parallelism (`max_parallel_maintenance_workers`) and memory (`maintenance_work_mem`). `CREATE INDEX CONCURRENTLY` reduces locking but takes longer and has caveats. Planner settings influence index scan choices (see planner section).

### Intermediate

Schedule large index builds off-peak. Monitor progress via `pg_stat_progress_create_index`. Rebuild bloated indexes with `REINDEX` strategies appropriate to version (concurrently where supported).

### Expert

Experts automate index validation in CI using `EXPLAIN` plans on critical queries. They track unused indexes via `pg_stat_user_indexes` and remove carefully after observation windows.

```sql
SHOW max_parallel_maintenance_workers;
SHOW maintenance_work_mem;
```

```sql
-- Example concurrent build (may not be allowed inside all transaction blocks)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders (created_at);
```

```sql
SELECT * FROM pg_stat_progress_create_index;
```

```yaml
postgresql:
  parameters:
    max_parallel_maintenance_workers: "4"
    maintenance_work_mem: "2GB"
```

### Key Points

- Concurrent index builds cannot run inside all transaction wrappers.
- Failed concurrent builds may leave invalid indexes—check `pg_index.indisvalid`.
- Parallel maintenance increases CPU and IO simultaneously.
- Index bloat is not solved by configuration alone—vacuum discipline matters.
- Covering indexes (`INCLUDE`) reduce heap access when applicable.
- Partial indexes require matching predicates in queries.
- Too many indexes slow writes—balance read/write SLOs.

### Best Practices

- Maintain an index catalog with owners and purposes.
- Capture `EXPLAIN` before/after index changes.
- Use staging clones to estimate build durations.
- Revalidate index usage quarterly.

### Common Mistakes

- Building duplicate indexes with different names.
- Assuming `CONCURRENTLY` is always faster wall-clock.
- Dropping indexes still used by occasional but critical reports.

---

## 12. Performance Testing Configuration

<a id="12-performance-testing-configuration"></a>

### Beginner

Use `pgbench` for synthetic benchmarks. Configure clients, threads, duration, and scaling factor. Disable unstable background load during baseline captures. Record Postgres settings alongside results.

### Intermediate

Script benchmarks with warm-up phases. Compare using the same `shared_buffers`, `work_mem`, and disk types. Capture `pg_stat_statements` reset before controlled runs for clarity.

### Expert

Experts model application workloads with custom scripts, not only pgbench defaults. They track WAL bytes/sec, checkpoint behavior, and CPU steal time on cloud VMs. They store results in time-series databases for regression tracking.

```bash
pgbench -i -s 50 pgbench
pgbench -c 32 -j 8 -T 300 -P 5 pgbench
```

```sql
SELECT pg_stat_statements_reset();
-- run workload
SELECT calls, mean_exec_time, left(query,120) FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
```

```yaml
# docker-compose for isolated benchmark env
services:
  pg:
    image: postgres:16
    command: ["postgres", "-c", "shared_buffers=2GB", "-c", "max_connections=200"]
```

### Key Points

- Microbenchmarks lie if data fits entirely in cache unrealistically.
- Always disclose hardware and dataset size when sharing numbers.
- Throughput without latency percentiles is incomplete.
- Client-side driver settings affect results materially.
- JIT and parallel query settings shift results between versions.
- Cold-cache vs warm-cache scenarios need explicit labeling.
- Repeat tests to reduce noise; report variance.

### Best Practices

- Version-control benchmark scripts and parameters.
- Snapshot `pg_settings` with each result file.
- Run pre/post for tuning changes with identical scripts.
- Include power-user queries from production (sanitized).

### Common Mistakes

- Benchmarking on shared dev laptops with background apps.
- Changing multiple parameters simultaneously without isolation.
- Ignoring initialization steps (`pgbench -i`) when comparing scale.

---

## 13. Configuration Presets (dev/prod/OLTP/OLAP)

<a id="13-configuration-presets-devprodoltpolap"></a>

### Beginner

Development clusters favor convenience: lower durability trade-offs in sandboxes only, more verbose logs, smaller memory. Production prioritizes stability, monitored autovacuum, sane timeouts, and restrained logging.

### Intermediate

OLTP presets emphasize connection pooling, short statements, low `random_page_cost` on SSD, and aggressive vacuum on hot tables. OLAP presets may raise `work_mem` for sessions running large sorts, enable parallelism, and tune JIT selectively.

### Expert

Experts codify presets as named profiles in GitOps, enforce review, and test failovers under each profile. They avoid running dev presets in staging if staging must mimic prod behavior.

```yaml
profiles:
  dev:
    log_min_messages: "info"
    log_statement: "all"
    shared_buffers: "256MB"
  oltp_prod:
    log_statement: "ddl"
    shared_buffers: "8GB"
    effective_cache_size: "24GB"
    work_mem: "16MB"
    random_page_cost: "1.1"
  olap_session:
    work_mem: "256MB"
    max_parallel_workers_per_gather: "4"
```

```sql
-- Apply session OLAP-like settings for a dedicated role (example)
ALTER ROLE analytics SET work_mem = '256MB';
ALTER ROLE analytics SET max_parallel_workers_per_gather = 4;
```

### Key Points

- Staging should mirror production cardinality more than literal data.
- OLAP session settings beat global OLAP bias for mixed workloads.
- Never disable fsync in production.
- Presets must include backup/replication alignment.
- Cloud SKUs may cap some parameters regardless of preset.
- Document exceptions per database or tenant.
- Revisit presets after major version upgrades.

### Best Practices

- Maintain a decision log: why each non-default value exists.
- Automate compliance checks that fail if dev flags appear in prod.
- Pair presets with instance sizing guidelines.
- Train engineers on how to request temporary deviations.

### Common Mistakes

- Using production presets in CI integration tests causing flakes.
- Applying OLAP `work_mem` globally on OLTP primaries.
- Copying cloud vendor “max performance” templates without cost review.

---

## 14. Configuration Documentation

<a id="14-configuration-documentation"></a>

### Beginner

Document every non-default setting with: owner, date, reason, expected impact, and rollback. Store beside infrastructure code. Include links to dashboards that validate the change.

### Intermediate

Use tickets and architecture decision records (ADRs). For regulated environments, map settings to controls. Automate `pg_settings` exports nightly for drift detection.

### Expert

Experts build diff alerts comparing replicas and primary, detect unexpected `ALTER SYSTEM`, and integrate with approval workflows. They redact secrets while exporting configs.

```sql
COPY (
  SELECT name, setting, unit, source, sourcefile
  FROM pg_settings
  WHERE source <> 'default'
  ORDER BY name
) TO STDOUT WITH CSV HEADER;
```

```bash
psql -X -Atqc "SELECT name||'='||setting FROM pg_settings ORDER BY 1;" > settings-$(date -u +%F).txt
```

```yaml
documentation:
  required_fields:
    - change_id
    - author
    - rationale
    - metrics_to_watch
    - rollback_command
```

### Key Points

- Undocumented settings become tribal knowledge and on-call risk.
- Drift between HA members can cause subtle planner differences.
- Auto.conf can surprise auditors if not tracked.
- Some changes are benign-looking but alter replication behavior.
- Version upgrades require re-baselining documentation.
- Managed services still need application-level documentation.
- Good docs shorten incidents measurably.

### Best Practices

- Attach `EXPLAIN` or metrics graphs to change tickets.
- Schedule quarterly config reviews with SRE and DBA stakeholders.
- Keep a “last incident lessons” section updated.
- Use infrastructure as code review rules for Postgres blocks.

### Common Mistakes

- Documenting only the intended change, not the observed side effects.
- Letting personal home directories hold the only copy of tuned configs.
- Failing to update docs after emergency hotfixes.

---

## Appendix: Tuning Safety Checklist & SQL

```sql
-- Effective non-default settings
SELECT name, setting, unit, pending_restart, source
FROM pg_settings
WHERE source NOT IN ('default','override')
ORDER BY source, name;
```

```sql
-- Memory-related quick view
SELECT name, setting, unit
FROM pg_settings
WHERE name IN (
 'shared_buffers','effective_cache_size','work_mem','maintenance_work_mem',
 'temp_buffers','max_connections'
);
```

```sql
-- Planner-related quick view
SELECT name, setting
FROM pg_settings
WHERE name LIKE '%parallel%' OR name LIKE '%jit%' OR name IN (
 'random_page_cost','seq_page_cost','cpu_tuple_cost','cpu_index_tuple_cost','cpu_operator_cost'
)
ORDER BY name;
```

```sql
-- WAL quick view
SELECT name, setting, unit
FROM pg_settings
WHERE name LIKE 'wal%' OR name IN ('max_wal_size','min_wal_size','checkpoint_timeout','checkpoint_completion_target')
ORDER BY name;
```

```bash
# Post-change smoke: reload and show pending restart
psql -X -c "SELECT pg_reload_conf(); SELECT name FROM pg_settings WHERE pending_restart ORDER BY 1;"
```

### Key Points (Appendix)

- Always check `pending_restart` after changes.
- Export settings before upgrades for comparison.
- Combine SQL views with host memory and disk reality.

### Best Practices (Appendix)

- Automate nightly exports to object storage with retention policies.
- Tag exports with cluster ID and Postgres version.
- Practice rollbacks in staging regularly.

### Common Mistakes (Appendix)

- Forgetting that some parameters need full restart, not reload.
- Comparing settings across major versions without reading release notes.

## Extended Appendix: Parameter Playbooks by Scenario

### Playbook A — “p99 latency regressed after deploy”

```sql
SHOW work_mem;
SHOW random_page_cost;
SHOW effective_cache_size;
SELECT name, setting FROM pg_settings WHERE name LIKE 'jit%';
```

```sql
SELECT pid, wait_event_type, wait_event, state, left(query,200)
FROM pg_stat_activity
WHERE state <> 'idle' ORDER BY query_start;
```

```bash
# Capture settings artifact for the ticket
psql -X -c "\\conninfo"
psql -X -Atqc "SELECT version();"
```

### Key Points (Playbook A)

- Deploys can change session defaults via role `ALTER ROLE ... SET`.
- JIT or parallel settings may flip plan shapes on boundary queries.
- Wait events distinguish planner/config issues from lock issues.

### Best Practices (Playbook A)

- Attach `EXPLAIN` of top regressed queries to the change ticket.
- Compare `pg_stat_statements` means pre/post for the same `queryid` when possible.

### Common Mistakes (Playbook A)

- Blaming Postgres when connection pool sizes changed in the app deploy bundle.

---

### Playbook B — “WAL disk growing faster than expected”

```sql
SHOW max_wal_size;
SHOW wal_level;
SHOW archive_mode;
SELECT * FROM pg_stat_wal;
```

```sql
SELECT slot_name, active, restart_lsn, confirmed_flush_lsn, wal_status
FROM pg_replication_slots;
```

```yaml
archive_command: "test ! -f /backup/wal/%f && cp %p /backup/wal/%f"
```

### Key Points (Playbook B)

- Slots retain WAL; monitor `wal_status` and disk.
- Logical decoding can increase CPU and WAL read overhead.
- Bulk loads generate large WAL unless strategies (UNLOGGED, etc.) are carefully chosen.

### Best Practices (Playbook B)

- Graph WAL rate vs business events (sales, imports).
- Alert on `pg_wal` mount crossing 75% for sustained periods.

### Common Mistakes (Playbook B)

- Deleting WAL files manually while replication depends on them.

---

### Playbook C — “Autovacuum cannot keep up”

```sql
SELECT autovacuum_count, autoanalyze_count, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC LIMIT 30;
```

```sql
SELECT * FROM pg_stat_progress_vacuum;
```

```sql
ALTER TABLE hot_table SET (
  autovacuum_vacuum_cost_delay = '2ms',
  autovacuum_vacuum_cost_limit = 2000
);
```

### Key Points (Playbook C)

- Per-table cost limits can throttle or accelerate autovacuum IO.
- Long transactions block cleanup—fix applications first.
- Manual `VACUUM (VERBOSE, ANALYZE)` may be needed after anomalies.

### Best Practices (Playbook C)

- Schedule heavy ETL during windows with explicit post-load vacuum.
- Track `autovacuum_count` deltas weekly.

### Common Mistakes (Playbook C)

- Raising `autovacuum_max_workers` without IO capacity.

---

### Playbook D — “Checkpoint storms hurting latency”

```sql
SELECT checkpoints_timed, checkpoints_req,
       checkpoint_write_time, checkpoint_sync_time,
       buffers_checkpoint
FROM pg_stat_bgwriter;
```

```sql
SHOW checkpoint_timeout;
SHOW max_wal_size;
SHOW checkpoint_completion_target;
```

```yaml
postgresql:
  parameters:
    max_wal_size: "16GB"
    checkpoint_timeout: "20min"
    checkpoint_completion_target: "0.9"
```

### Key Points (Playbook D)

- Frequent required checkpoints usually mean WAL volume or low `max_wal_size`.
- Spreading writes helps p99 but does not fix insufficient disk throughput.

### Best Practices (Playbook D)

- Correlate storms with bulk load jobs in the incident timeline.
- Validate storage burst credits on cloud disks.

### Common Mistakes (Playbook D)

- Increasing `max_wal_size` without ensuring `pg_wal` disk capacity.

---

### Playbook E — “Too many connections / intermittent ‘too many clients’”

```sql
SHOW max_connections;
SELECT datname, usename, count(*) FROM pg_stat_activity GROUP BY 1,2 ORDER BY 3 DESC;
```

```yaml
pgbouncer:
  pool_mode: transaction
  default_pool_size: "40"
  max_client_conn: "2000"
```

### Key Points (Playbook E)

- Fix the client storm before raising `max_connections` blindly.
- Reserved superuser slots matter during incidents.

### Best Practices (Playbook E)

- Graph connection counts per service role.
- Add backoff in apps on connection errors.

### Common Mistakes (Playbook E)

- Using session pooling semantics with transaction-pooled PgBouncer.

---

### Playbook F — “Mixed OLTP + reporting on one cluster”

```sql
ALTER ROLE reporting SET work_mem = '256MB';
ALTER ROLE reporting SET statement_timeout = '10min';
ALTER ROLE oltp_app SET statement_timeout = '2s';
```

```sql
SELECT rolname, rolconfig FROM pg_roles WHERE rolconfig IS NOT NULL ORDER BY 1;
```

### Key Points (Playbook F)

- Role-level settings isolate risky reporting defaults from OLTP defaults.
- Resource groups (extensions/cloud) may add another layer.

### Best Practices (Playbook F)

- Prefer read replicas for heavy reporting when possible.
- Enforce statement timeouts for ad hoc SQL users.

### Common Mistakes (Playbook F)

- Granting superuser to reporting tools for convenience.

---

### Reference Table: Common Parameters by Class

| Class | Examples | Reload? |
|------|----------|---------|
| Memory | `shared_buffers`, `work_mem` | Mixed; many need restart |
| Connections | `max_connections` | Restart |
| Planner | `random_page_cost`, parallel | Mostly reload |
| WAL | `wal_level`, `max_wal_size` | Mixed |
| Autovacuum | `autovacuum_max_workers` | Reload (verify docs) |
| Logging | `log_min_messages` | Reload |

```sql
SELECT name, context FROM pg_settings WHERE name IN (
 'shared_buffers','max_connections','wal_level','random_page_cost','log_min_messages'
);
```

### Key Points (Reference Table)

- `context` column in `pg_settings` indicates reload vs restart requirements.
- Always verify with your exact major version documentation.

### Best Practices (Reference Table)

- Print a laminated cheat sheet for on-call rookies (update quarterly).

### Common Mistakes (Reference Table)

- Assuming all parameters behave like older versions after upgrades.

---

## Extended Appendix: Version Upgrade Configuration Review

When upgrading major versions, defaults move. Treat configuration as a re-certification exercise, not a file copy.

```sql
-- After upgrade, list settings that differ from boot defaults
SELECT name, setting, boot_val
FROM pg_settings
WHERE setting IS DISTINCT FROM boot_val
ORDER BY name
LIMIT 200;
```

```sql
-- JIT defaults changed across versions; validate explicitly
SHOW jit;
SHOW jit_above_cost;
```

```bash
# Compare two setting dumps (illustrative)
diff -u settings-pre-upgrade.txt settings-post-upgrade.txt | head -n 80
```

```yaml
upgrade_checklist:
  - export_pg_settings_before
  - run_pg_upgrade_or_logical
  - reapply_intentional_deviations_only
  - rerun_benchmark_suite
  - refresh_statistics: "ANALYZE"
```

### Key Points (Upgrade Review)

- New parameters may appear with better defaults than your old overrides.
- Deprecated parameters should be removed to reduce confusion.
- Statistics are not carried the same way across all methods—plan regrowth.

### Best Practices (Upgrade Review)

- Keep a spreadsheet mapping old→new with owner sign-off.
- Revisit autovacuum and checkpoint tuning after workload replay.

### Common Mistakes (Upgrade Review)

- Blindly preserving obsolete tuning from a decade-old blog post.
- Skipping `ANALYZE` before declaring performance regressions.

### Supplemental: Container & cgroup Notes

```yaml
resources:
  limits:
    memory: "16Gi"
  requests:
    memory: "16Gi"
```

```sql
-- Inside container, ensure Postgres memory settings leave headroom for OS and extras
SHOW shared_buffers;
SHOW max_connections;
```

### Key Points (Containers)

- Kubernetes limits enforce OOM kills—size `shared_buffers` + connections conservatively.
- Ephemeral storage limits can surprise WAL/log directories if misplaced.

### Best Practices (Containers)

- Separate PVCs for data vs WAL when IO classes differ.
- Set `shm` sizes appropriately for shared memory needs.

### Common Mistakes (Containers)

- Running with default tiny `shm` on Docker Desktop causing startup failures.

---

