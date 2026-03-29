# Backup and Recovery

**PostgreSQL learning notes (March 2026). Aligned with README topic 19.**

---

## 📑 Table of Contents

- [1. Backup Fundamentals](#1-backup-fundamentals)
- [2. Logical Backups (pg_dump)](#2-logical-backups-pg-dump)
- [3. Physical Backups (WAL Archiving & Base Backup)](#3-physical-backups-wal-archiving-base-backup)
- [4. pg_dump Options](#4-pg-dump-options)
- [5. Restore from pg_dump (psql & pg_restore)](#5-restore-from-pg-dump-psql-pg-restore)
- [6. Point-in-Time Recovery (PITR)](#6-point-in-time-recovery-pitr)
- [7. Replication Backups](#7-replication-backups)
- [8. Backup Validation](#8-backup-validation)
- [9. Backup Scheduling](#9-backup-scheduling)
- [10. Backup Storage](#10-backup-storage)
- [11. Disaster Recovery Planning](#11-disaster-recovery-planning)
- [12. Backup Tools (pgBackRest, WAL-G, Barman)](#12-backup-tools-pgbackrest-wal-g-barman)

---

## 1. Backup Fundamentals

<a id="1-backup-fundamentals"></a>

### Beginner

Backups are copies of database state (logical SQL, physical files, or WAL) used to recover from mistakes, corruption, hardware loss, or disasters. Recovery is restoring service to an acceptable point in time.

### Intermediate

Strategy balances RPO (how much data you can lose) and RTO (how fast you must be back). Combine full backups, WAL archiving, and tested restores. Document who approves restore and where backups live.

### Expert

PostgreSQL recovery uses WAL replay from a consistent base (data directory snapshot or `pg_basebackup`) plus archived WAL segments. Timelines handle multiple recovery attempts. Understand `restore_command`, `recovery_target_*`, and promotion semantics on standbys.


```sql
CREATE TABLE IF NOT EXISTS backup_log (
  id bigserial PRIMARY KEY,
  kind text NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT now(),
  path text,
  notes text
);

INSERT INTO backup_log (kind, path, notes)
VALUES ('logical', '/backups/app_20260329.dump', 'nightly pg_dump -Fc');
```


```sql
-- Estimate database footprint for backup planning
SELECT sum(pg_database_size(oid)) AS total_bytes,
       pg_size_pretty(sum(pg_database_size(oid))) AS total_pretty
FROM pg_database;
```


```bash
psql -X -Atqc "SHOW data_directory;"
```


```bash
# Export a concise cluster info bundle (safe, read-only)
psql -X -c "\conninfo"
psql -X -Atqc "SHOW config_file; SHOW hba_file; SHOW data_directory;"
```
### Key Points

- Backups are worthless without verified restore drills.
- WAL is the bridge between backup age and point-in-time precision.
- Logical backups capture schema+data; physical backups capture cluster files.
- Retention must meet compliance, not just disk convenience.
- Test restores on non-production hardware that mirrors production scale.
- Separate backup failure alerts from delayed maintenance alerts.
- Document the authoritative clock source for time-based recovery targets.
- Treat backup encryption keys as part of the disaster recovery boundary.

### Best Practices

- Automate backups and restores; calendar quarterly game days.
- Encrypt backups at rest and restrict object-store IAM narrowly.
- Keep backup credentials separate from production DB credentials.
- Version-control runbooks and `postgresql.conf` snippets used during recovery.
- Monitor backup size growth and duration trends.
- Pair backup metrics with replication lag metrics for holistic risk visibility.
- Run restore drills after major version upgrades or extension upgrades.
- Use immutable storage or versioning for ransomware resilience.

### Common Mistakes

- Assuming `pg_dump` alone satisfies HA (it does not).
- Never storing backups off-site or in another account/region.
- Skipping checksum verification or restore smoke tests.
- Using only superuser-owned paths without documenting permissions.
- Confusing PITR targets across time zones (always use timestamptz discipline).
- Treating snapshots as guaranteed crash-consistent without vendor guidance.
- Letting backup jobs run unbounded on OLTP primaries during peak traffic.

#### Hands-On Lab Walkthrough

        1. Create an isolated lab cluster or database for exercises related to “Backup Fundamentals”.
2. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
3. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
4. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
5. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
6. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
7. Restore to a new database name first; only then consider cutover or rename operations.
8. Run `ANALYZE` after large restores before comparing plans to production expectations.
9. Document extension versions (`pg_extension`) whenever backups cross environments.
10. Peer-review runbooks: ensure two engineers can execute restores without the author present.
11. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
12. Validate application login paths, roles, and `search_path` after any restore drill.
13. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
14. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
15. Close the loop: file tickets for any confusing error messages encountered during labs.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Backup Fundamentals)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Backup Fundamentals” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 2. Logical Backups (pg_dump)

<a id="2-logical-backups-pg-dump"></a>

### Beginner

`pg_dump` exports database objects as SQL or archive formats. It runs against a live server, uses MVCC snapshots for consistency within one database, and is ideal for portability and selective restores.

### Intermediate

Formats: plain (`-Fp`, `.sql`), custom (`-Fc`), directory (`-Fd`, parallel friendly), tar (`-Ft`). Custom/directory support parallel dump (`-j`) and selective restore with `pg_restore`.

### Expert

Logical dumps do not include roles/tablespaces globals unless `pg_dumpall` or separate dumps. Large objects, extensions, and security labels need explicit inclusion. Heavy dumps increase load—schedule during low traffic or use replicas with caution.


```sql
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY 1, 2;
```


```sql
-- Find top relations by size to plan dump/restore windows
SELECT n.nspname AS schema, c.relname AS name, c.relkind,
       pg_size_pretty(pg_total_relation_size(c.oid)) AS total
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog','information_schema')
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 25;
```


```bash
pg_dump -h localhost -p 5432 -U postgres -d appdb -Fc -Z6 -j 4 -f appdb_$(date +%Y%m%d).dump
pg_dump -d appdb -s -f appdb_schema.sql
```
### Key Points

- Custom format (`-Fc`) is the default professional choice for flexibility.
- `pg_dump` is consistent for one database at dump start.
- Use `pg_dumpall --globals-only` for roles/tablespaces.
- Parallel directory format scales throughput on large schemas.
- Plain SQL is human-diffable; custom format is machine-efficient.
- Always record server version alongside dump artifacts.
- Large tables may need partition-wise strategies or excludes.

### Best Practices

- Dump from a replica when acceptable—verify replication lag first.
- Use `sslmode=require` (or stricter) for cloud endpoints.
- Store dumps with immutable object-locking when possible.
- Label dumps with extension versions and locale settings.
- Throttle parallelism if CPU becomes the bottleneck on small instances.
- Keep retention aligned with compliance, not only with disk free space.

### Common Mistakes

- Restoring a plain SQL dump to the wrong database.
- Omitting `-n`/`-N` and dumping more than intended.
- Assuming dump includes sequences reset logic incorrectly.
- Running huge dumps without monitoring I/O saturation.
- Ignoring dependency ordering for extensions during restore.

#### Hands-On Lab Walkthrough

        1. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
2. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
3. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
4. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
5. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
6. Restore to a new database name first; only then consider cutover or rename operations.
7. Run `ANALYZE` after large restores before comparing plans to production expectations.
8. Document extension versions (`pg_extension`) whenever backups cross environments.
9. Peer-review runbooks: ensure two engineers can execute restores without the author present.
10. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
11. Validate application login paths, roles, and `search_path` after any restore drill.
12. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
13. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
14. Close the loop: file tickets for any confusing error messages encountered during labs.
15. Create an isolated lab cluster or database for exercises related to “Logical pg_dump”.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Logical pg_dump)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Logical pg_dump” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 3. Physical Backups (WAL Archiving & Base Backup)

<a id="3-physical-backups-wal-archiving-base-backup"></a>

### Beginner

Physical backup copies data directory files at the storage layer. A base backup plus continuous WAL archiving enables crash-consistent recovery and PITR.

### Intermediate

`archive_mode=on` and `archive_command` ship completed WAL segments to durable storage. `pg_basebackup` creates a base backup over the replication protocol with optional WAL streaming.

### Expert

Use `pg_verifybackup` on base backups when available. Understand timeline history files. For cloud disks, snapshots plus WAL may replace traditional tar base backups—still validate ordering and snapshot semantics.


```sql
SHOW archive_mode;
SHOW wal_level;
SHOW max_wal_senders;
```


```bash
pg_basebackup -h primary.internal -D /backup/base_20260329 -U replicator -Fp -Xs -P -R
```


```bash
# Example: list WAL archive directory (adjust path)
ls -lah /wal_archive | tail
```
### Key Points

- Physical backups capture cluster state tied to a backup label.
- WAL archives close the gap between backup time and later moments.
- `pg_basebackup -R` prepares standby signaling for replicas.
- Snapshots must be IO-consistent with PostgreSQL guidance.
- Monitor `archive_command` failures as P0 signals.
- Never point replicas at mixed WAL from different clusters.

### Best Practices

- Monitor archive failures aggressively; backlog can fill disk and stall writes.
- Use `archive_timeout` for low-traffic systems needing fresher WAL files.
- Separate WAL archive buckets per environment.
- Document OS ownership for restore hosts.
- Test `restore_command` paths independently of production mounts.

### Common Mistakes

- `archive_command` that reports success without copying.
- Mixing WAL from different clusters or major versions.
- Deleting WAL still needed for replicas or PITR.
- Filesystem copy without coordinated backup API (unsafe hot copies).

#### Hands-On Lab Walkthrough

        1. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
2. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
3. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
4. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
5. Restore to a new database name first; only then consider cutover or rename operations.
6. Run `ANALYZE` after large restores before comparing plans to production expectations.
7. Document extension versions (`pg_extension`) whenever backups cross environments.
8. Peer-review runbooks: ensure two engineers can execute restores without the author present.
9. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
10. Validate application login paths, roles, and `search_path` after any restore drill.
11. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
12. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
13. Close the loop: file tickets for any confusing error messages encountered during labs.
14. Create an isolated lab cluster or database for exercises related to “Physical WAL basebackup”.
15. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Physical WAL basebackup)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Physical WAL basebackup” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 4. pg_dump Options

<a id="4-pg-dump-options"></a>

### Beginner

Options filter schemas, tables, blobs, and output. Learn `-n`/`-N`, `-t`/`-T`, `--section=pre-data|data|post-data`, and verbosity.

### Intermediate

Parallel directory dumps (`-Fd -j`) speed large databases. `--inserts` vs COPY changes restore characteristics. `--exclude-table-data` helps large append-only partitions.

### Expert

For migrations, combine logical replication with schema-only dumps. Use `--snapshot` for synchronized multi-step exports when coordinating with other tools.


```sql
SELECT relnamespace::regnamespace AS schema,
       relname,
       pg_size_pretty(pg_total_relation_size(oid)) AS total
FROM pg_class
WHERE relkind = 'r'
ORDER BY pg_total_relation_size(oid) DESC
LIMIT 20;
```


```bash
pg_dump -d appdb -Fc -n app -a -f app_data_only.dump
pg_dump -d appdb -Fc --no-owner --no-privileges -f appdb_portable.dump
```
### Key Points

- `--section` splits DDL vs data for blue/green cutovers.
- `-O` and `-x` ease cross-environment restores.
- Filenames should encode format to avoid confusion.
- Long options improve automation readability.
- Parallelism must match CPU and disk capabilities.

### Best Practices

- Keep canonical `pg_dump` invocations in infrastructure-as-code.
- Log stderr to centralized logging with retention.
- Diff schema-only dumps in CI when feasible.
- Client `pg_dump` should be same major or newer than server.

### Common Mistakes

- Old `pg_dump` against newer servers without compatibility checks.
- Forgetting `pg_dump` is per-database, not whole-cluster.
- Omitting large objects when applications depend on them.
- Ignoring collation/locale differences across environments.

#### Hands-On Lab Walkthrough

        1. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
2. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
3. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
4. Restore to a new database name first; only then consider cutover or rename operations.
5. Run `ANALYZE` after large restores before comparing plans to production expectations.
6. Document extension versions (`pg_extension`) whenever backups cross environments.
7. Peer-review runbooks: ensure two engineers can execute restores without the author present.
8. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
9. Validate application login paths, roles, and `search_path` after any restore drill.
10. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
11. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
12. Close the loop: file tickets for any confusing error messages encountered during labs.
13. Create an isolated lab cluster or database for exercises related to “pg_dump options”.
14. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
15. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: pg_dump options)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “pg_dump options” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 5. Restore from pg_dump (psql & pg_restore)

<a id="5-restore-from-pg-dump-psql-pg-restore"></a>

### Beginner

Plain SQL restores with `psql -f`. Custom/tar/directory restores use `pg_restore` with listing (`-l`) and selective items (`-t`, `-n`, `-I`).

### Intermediate

`pg_restore -j` parallelizes data load for directory format. Use `--single-transaction` for small atomic loads. Role ownership may need pre-created roles.

### Expert

For partial restores into existing schemas, watch dependency order (`pre-data` then `data` then `post-data`). Use `pg_restore -L` to craft TOC files for repeatable pipelines.


```sql
CREATE DATABASE appdb_restore TEMPLATE template0 ENCODING 'UTF8';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```


```bash
psql -d appdb_restore -v ON_ERROR_STOP=1 -f appdb.sql
pg_restore -l appdb.dump > toc.list
pg_restore -d appdb_restore -j 8 --no-owner --role=app_role appdb.dump
```
### Key Points

- `ON_ERROR_STOP` aborts early on errors in `psql`.
- `pg_restore` can create DB with `-C` when dump includes it.
- Directory format + `-j` accelerates large restores.
- Verify extensions and privileges after restore.
- Compare checksums/counts against source when possible.

### Best Practices

- Restore to fresh DB first; cut over via connection pools or DNS.
- Pre-create tablespaces or remap paths when they differ.
- Capture logs and compare row counts vs source.
- Run `ANALYZE` before re-enabling aggressive autovac tuning.

### Common Mistakes

- Restoring objects owned by missing roles.
- Restoring into production without coordination.
- Assuming `-c` clean is always safe with extensions.
- Ignoring FK errors when doing partial restores.

#### Hands-On Lab Walkthrough

        1. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
2. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
3. Restore to a new database name first; only then consider cutover or rename operations.
4. Run `ANALYZE` after large restores before comparing plans to production expectations.
5. Document extension versions (`pg_extension`) whenever backups cross environments.
6. Peer-review runbooks: ensure two engineers can execute restores without the author present.
7. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
8. Validate application login paths, roles, and `search_path` after any restore drill.
9. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
10. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
11. Close the loop: file tickets for any confusing error messages encountered during labs.
12. Create an isolated lab cluster or database for exercises related to “Restore pg_restore”.
13. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
14. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
15. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Restore pg_restore)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Restore pg_restore” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 6. Point-in-Time Recovery (PITR)

<a id="6-point-in-time-recovery-pitr"></a>

### Beginner

PITR replays WAL to a target time, LSN, transaction ID, or named restore point. Requires archived WAL and a base backup.

### Intermediate

Configure `recovery_target_time`, `recovery_target_xid`, `recovery_target_lsn`, or `recovery_target_name`. Use `recovery_target_action=promote` or `pause` for inspection.

### Expert

Multiple recovery attempts create new timelines; `recovery_target_timeline` controls which to follow. Managed services expose different APIs but the conceptual WAL chain remains.


```sql
SELECT pg_create_restore_point('before_bulk_delete');
```


```bash
# recovery.signal + postgresql.auto.conf entries (illustrative)
pg_ctl start -D /var/lib/postgresql/data
```


```bash
# After recovery pause, inspect recovery status in logs for 'recovery paused' messages
grep -i recovery /var/log/postgresql/postgresql-*-main.log | tail -n 50
```
### Key Points

- PITR precision requires WAL through the target.
- Named restore points pair with operational change windows.
- Promotion creates a writable timeline—rebuild replicas deliberately.
- Prefer UTC in documentation and targets.

### Best Practices

- Quarterly PITR drills with production-equivalent tooling.
- Immutable WAL storage for compliance scenarios.
- Automate locating the backup closest before a target timestamp.
- After promote, re-bootstrap replicas or reclone from the new primary.

### Common Mistakes

- Targets without complete WAL chain.
- Accidental promotion of the wrong node.
- Incomplete cleanup of old timeline files.
- Ambiguous local time without offset notation.

#### Hands-On Lab Walkthrough

        1. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
2. Restore to a new database name first; only then consider cutover or rename operations.
3. Run `ANALYZE` after large restores before comparing plans to production expectations.
4. Document extension versions (`pg_extension`) whenever backups cross environments.
5. Peer-review runbooks: ensure two engineers can execute restores without the author present.
6. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
7. Validate application login paths, roles, and `search_path` after any restore drill.
8. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
9. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
10. Close the loop: file tickets for any confusing error messages encountered during labs.
11. Create an isolated lab cluster or database for exercises related to “PITR”.
12. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
13. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
14. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
15. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: PITR)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “PITR” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 7. Replication Backups

<a id="7-replication-backups"></a>

### Beginner

Taking backups from a standby shifts load off the primary. Streaming replicas can serve `pg_basebackup` sources.

### Intermediate

Replication slots prevent WAL removal while consumers lag—monitor disk. Logical replication does not clone all objects; understand DDL and sequence caveats.

### Expert

Long `pg_dump` on replicas can intersect with DDL races; coordinate migrations. Managed services may restrict certain operations on replicas.


```sql
SELECT application_name, state, sync_state,
       pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS byte_lag
FROM pg_stat_replication;
```


```bash
pg_basebackup -h standby.internal -D /backup/standby_base -U replicator -Fp -Xs -P
```
### Key Points

- Replica backups still need WAL continuity for PITR.
- Slots protect WAL but can fill disks if consumers fail.
- Logical replicas may lack some indexes—validate restore goals.
- Object storage agents integrate with WAL-G/pgBackRest patterns.

### Best Practices

- Alert on replication lag before heavy backup jobs.
- Dedicated backup replicas reduce operational surprise.
- Document logical vs physical backup per tier.
- Update backup source selection after failover events.

### Common Mistakes

- Orphan replication slots after decommissioned consumers.
- Assuming identical schemas when logical DDL drift exists.
- Ignoring hot_standby_feedback interactions with vacuum.

#### Hands-On Lab Walkthrough

        1. Restore to a new database name first; only then consider cutover or rename operations.
2. Run `ANALYZE` after large restores before comparing plans to production expectations.
3. Document extension versions (`pg_extension`) whenever backups cross environments.
4. Peer-review runbooks: ensure two engineers can execute restores without the author present.
5. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
6. Validate application login paths, roles, and `search_path` after any restore drill.
7. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
8. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
9. Close the loop: file tickets for any confusing error messages encountered during labs.
10. Create an isolated lab cluster or database for exercises related to “Replication backups”.
11. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
12. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
13. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
14. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
15. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Replication backups)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Replication backups” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 8. Backup Validation

<a id="8-backup-validation"></a>

### Beginner

Validation proves integrity and recoverability: checksums, restore to scratch, and application smoke tests.

### Intermediate

Automate `pg_restore -l` parsing, size baselines, and periodic full restores with `pgbench` or app suites. Physical backups may use `pg_verifybackup`.

### Expert

Correlate measured RTO with SLAs. Some teams restore to ephemeral containers for speed.


```sql
SELECT COUNT(*) AS bad_rows FROM orders WHERE created_at IS NULL;
SELECT conname FROM pg_constraint WHERE convalidated = false;
```


```bash
pg_restore --list appdb.dump | head
# pgbackrest --stanza=main verify
```
### Key Points

- Untested backups are Schrodinger backups.
- Schema diffs catch silent drift.
- Application checks catch logical corruption.
- Record drill owners and timestamps.

### Best Practices

- Monthly full restore drills for tier-1 systems.
- Randomize targets (locales, collations) occasionally.
- Integrate disposable clones into CI for migrations.
- Track trendlines for restore duration and data volume.

### Common Mistakes

- Only verifying remote object existence.
- Assuming snapshots are DB-consistent without vendor validation.
- Skipping extension version checks post-restore.

#### Hands-On Lab Walkthrough

        1. Run `ANALYZE` after large restores before comparing plans to production expectations.
2. Document extension versions (`pg_extension`) whenever backups cross environments.
3. Peer-review runbooks: ensure two engineers can execute restores without the author present.
4. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
5. Validate application login paths, roles, and `search_path` after any restore drill.
6. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
7. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
8. Close the loop: file tickets for any confusing error messages encountered during labs.
9. Create an isolated lab cluster or database for exercises related to “Backup validation”.
10. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
11. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
12. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
13. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
14. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
15. Restore to a new database name first; only then consider cutover or rename operations.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Backup validation)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Backup validation” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 9. Backup Scheduling

<a id="9-backup-scheduling"></a>

### Beginner

Schedules align backup frequency with RPO. Combine full, incremental (tool-dependent), and continuous WAL.

### Intermediate

`cron`, systemd timers, Kubernetes CronJobs, or cloud schedulers trigger dumps. Watch clock skew and DST; stagger heavy jobs.

### Expert

For pgBackRest/WAL-G, define retention policies with full/diff/incr mixes. Avoid colliding with major vacuum or index rebuild windows.


```sql
SELECT pid, now() - query_start AS runtime, query
FROM pg_stat_activity
WHERE query ILIKE '%pg_dump%' OR application_name ILIKE '%backup%';
```


```bash
15 2 * * * pg_dump -Fc -d appdb -f /backups/appdb_$(date -u +\%F).dump
```
### Key Points

- WAL archiving narrows exposure between full backups.
- Retention may require legal holds independent of default policy.
- Prefer UTC scheduling to avoid DST ambiguity.
- Expose last-success metrics to dashboards.

### Best Practices

- Alert quickly on missed schedules.
- Use versioned object keys in object storage.
- Document owner on-call for backup failures.
- Backoff retries to avoid hammering a sick cluster.

### Common Mistakes

- Overlapping dumps saturating CPU.
- Repeated failures filling disks with partial files.
- Forgetting global role dumps (`pg_dumpall -g`).

#### Hands-On Lab Walkthrough

        1. Document extension versions (`pg_extension`) whenever backups cross environments.
2. Peer-review runbooks: ensure two engineers can execute restores without the author present.
3. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
4. Validate application login paths, roles, and `search_path` after any restore drill.
5. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
6. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
7. Close the loop: file tickets for any confusing error messages encountered during labs.
8. Create an isolated lab cluster or database for exercises related to “Backup scheduling”.
9. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
10. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
11. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
12. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
13. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
14. Restore to a new database name first; only then consider cutover or rename operations.
15. Run `ANALYZE` after large restores before comparing plans to production expectations.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Backup scheduling)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Backup scheduling” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 10. Backup Storage

<a id="10-backup-storage"></a>

### Beginner

Store backups on separate fault domains: another AZ/region/account, immutable buckets, and encrypted volumes.

### Intermediate

Lifecycle policies tier cold storage. Use SSE-KMS/SSE-S3 and deny-delete policies where appropriate. Air-gapped copies for highest assurance.

### Expert

Cross-cloud replication increases resilience; weigh egress costs and legal jurisdiction. Multipart uploads help huge objects.


```sql
INSERT INTO backup_log (kind, path, notes)
VALUES ('logical', 's3://prod-backups/app/2026/03/29.dump', 'S3 IA, SSE-KMS');
```


```bash
aws s3 cp appdb.dump s3://prod-backups/appdb.dump --storage-class STANDARD_IA --sse aws:kms
```
### Key Points

- 3-2-1 copies remain a useful mnemonic.
- Immutability counters ransomware.
- KMS keys must survive DR events themselves.

### Best Practices

- Separate prod backup access from general developer access.
- Enable versioning/MFA delete for critical buckets.
- Test restores from cold tiers to learn latency.
- Monitor spend vs retention growth.

### Common Mistakes

- Single-region storage for regulated multi-region mandates.
- Shared bucket prefixes between prod and staging without guardrails.
- Losing encryption keys and rendering archives unreadable.

#### Hands-On Lab Walkthrough

        1. Peer-review runbooks: ensure two engineers can execute restores without the author present.
2. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
3. Validate application login paths, roles, and `search_path` after any restore drill.
4. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
5. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
6. Close the loop: file tickets for any confusing error messages encountered during labs.
7. Create an isolated lab cluster or database for exercises related to “Backup storage”.
8. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
9. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
10. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
11. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
12. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
13. Restore to a new database name first; only then consider cutover or rename operations.
14. Run `ANALYZE` after large restores before comparing plans to production expectations.
15. Document extension versions (`pg_extension`) whenever backups cross environments.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Backup storage)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Backup storage” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 11. Disaster Recovery Planning

<a id="11-disaster-recovery-planning"></a>

### Beginner

DR planning defines scenarios (AZ loss, region loss, operator error, ransomware), roles, communications, and dependencies.

### Intermediate

Quantify RTO/RPO per application. Maintain runbooks: contacts, backup locations, promotion steps, DNS cutover, secrets rotation.

### Expert

Game days simulate partial failures. Map dependencies (Kafka, identity, object storage). Align with insurance and regulatory reporting.


```sql
SELECT extname, extversion FROM pg_extension ORDER BY 1;
```


```bash
# patronictl failover --candidate other-node cluster-name
```
### Key Points

- People/process are as important as tooling.
- Undrilled DR is theoretical DR.
- Clear authority prevents destructive improvisation.

### Best Practices

- Emergency break-glass procedures for credentials.
- Customer comms templates prepared ahead.
- Lower DNS TTL proactively before risky changes.
- Know managed vendor incident SLAs.

### Common Mistakes

- Treating synchronous replication as a backup substitute.
- Runbooks living only in chat.
- Forgetting app-tier recovery (queues, caches, search indexes).

#### Hands-On Lab Walkthrough

        1. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.
2. Validate application login paths, roles, and `search_path` after any restore drill.
3. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
4. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
5. Close the loop: file tickets for any confusing error messages encountered during labs.
6. Create an isolated lab cluster or database for exercises related to “Disaster recovery”.
7. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
8. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
9. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
10. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
11. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
12. Restore to a new database name first; only then consider cutover or rename operations.
13. Run `ANALYZE` after large restores before comparing plans to production expectations.
14. Document extension versions (`pg_extension`) whenever backups cross environments.
15. Peer-review runbooks: ensure two engineers can execute restores without the author present.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Disaster recovery)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Disaster recovery” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

## 12. Backup Tools (pgBackRest, WAL-G, Barman)

<a id="12-backup-tools-pgbackrest-wal-g-barman"></a>

### Beginner

Enterprise tools add compression, encryption, parallel transfer, incremental backups, and cataloging beyond raw scripts.

### Intermediate

pgBackRest emphasizes robust incremental physical backups. WAL-G targets cloud object storage. Barman focuses on WAL management and retention orchestration.

### Expert

Compare push vs pull, deduplication, KMS integration, and Kubernetes operator patterns. Regulated industries may require vendor support contracts.


```sql
SELECT setting AS data_directory FROM pg_settings WHERE name = 'data_directory';
```


```bash
# pgbackrest --stanza=main info
# wal-g backup-push /var/lib/postgresql/data
# barman list-backups srv1
```
### Key Points

- Standardize on one toolchain per environment when possible.
- Incremental physical backups reduce time and bandwidth.
- Encryption and verification hooks are non-negotiable for remote repos.

### Best Practices

- Store tool configuration in git; inject secrets at runtime.
- Schedule verify jobs against the backup repository.
- Cross-train restores across engineers.
- Align retention with independent compliance requirements.

### Common Mistakes

- Competing agents writing the same archive paths.
- Tooling/server major version skew after upgrades.
- Ignoring non-zero exit codes without paging.

#### Hands-On Lab Walkthrough

        1. Validate application login paths, roles, and `search_path` after any restore drill.
2. For PITR topics, practice converting local wall times to UTC explicitly in runbooks.
3. For replication topics, verify `pg_stat_replication` or `pg_stat_wal_receiver` during drills.
4. Close the loop: file tickets for any confusing error messages encountered during labs.
5. Create an isolated lab cluster or database for exercises related to “Backup tools”.
6. Record your PostgreSQL major version, OS, and filesystem type; restore behavior can differ.
7. Write a one-page RPO/RTO table for a fictional e-commerce company; justify backup frequency.
8. Practice locating `postgresql.conf`, `pg_hba.conf`, and the data directory on your platform.
9. Capture `pg_controldata` output before and after a controlled restore test (read-only inspection).
10. Automate a backup job in your scheduler; verify non-zero exit codes raise alerts.
11. Restore to a new database name first; only then consider cutover or rename operations.
12. Run `ANALYZE` after large restores before comparing plans to production expectations.
13. Document extension versions (`pg_extension`) whenever backups cross environments.
14. Peer-review runbooks: ensure two engineers can execute restores without the author present.
15. Measure wall-clock restore time; compare to SLA and network/disk throughput estimates.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental session diagnostics (topic anchor: Backup tools)
SELECT current_setting('server_version') AS server_version,
       current_setting('data_directory') AS data_directory,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, client_addr, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        # Inspect cluster uptime and recovery mode quickly
psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"

# Show last few lines of PostgreSQL log (path varies by install)
# tail -n 200 /var/log/postgresql/postgresql-*-main.log
        ```

        #### Discussion & Interview Prompts

        - How does “Backup tools” interact with managed Postgres restrictions (superuser, WAL, extensions)?
- When is logical backup preferable to physical backup for your workload shape?
- What evidence proves a backup is restorable beyond file size and timestamps?
- How do you prevent backup credentials from becoming the weakest security link?
- Which monitoring signals predict backup/restore failure before data loss?
- How do you coordinate schema migrations with ongoing backup schedules?
- What runbook details are commonly missing during on-call handoffs?
- How do you test partial restores without contaminating production namespaces?
- How do major version upgrades change your backup/restore toolchain assumptions?
- Where do object-storage lifecycle rules conflict with long PITR retention goals?

---

