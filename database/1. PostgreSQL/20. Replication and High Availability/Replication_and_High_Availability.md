# Replication and High Availability

**PostgreSQL learning notes (March 2026). Aligned with README topic 20.**

---

## 📑 Table of Contents

- [1. Replication Basics](#1-replication-basics)
- [2. Physical Replication (Streaming, Synchronous & Asynchronous)](#2-physical-replication-streaming-sync-async)
- [3. Logical Replication (Publication / Subscription)](#3-logical-replication-publication-subscription)
- [4. Setting Up a Standby](#4-setting-up-a-standby)
- [5. Failover (Manual & Automatic)](#5-failover-manual-automatic)
- [6. Replication Monitoring](#6-replication-monitoring)
- [7. Read Replicas](#7-read-replicas)
- [8. High Availability Solutions (Patroni & Peers)](#8-high-availability-solutions-patroni)
- [9. Patroni Framework](#9-patroni-framework)
- [10. PgBouncer & Connection Pooling](#10-pgbouncer-connection-pooling)
- [11. Replication Conflicts](#11-replication-conflicts)
- [12. Replication Testing](#12-replication-testing)
- [13. Replication Slots & WAL Retention](#13-replication-slots-wal-retention)

---

## 1. Replication Basics

<a id="1-replication-basics"></a>

### Beginner

Replication copies changes from a primary to one or more standbys. Physical replication ships WAL; logical replication ships decoded row changes. Read scaling and DR are common goals.

### Intermediate

Primary/standby is the common topology. Understand lag, slots, timelines, and promotion. Terminology varies (leader/follower) but PostgreSQL catalogs remain the source of truth.

### Expert

Hot standby replays WAL and can serve reads. Recovery min apply delay, conflict resolution, and cascading replicas add operational nuance. Managed services may hide some knobs but expose lag metrics.


```sql
SELECT pg_is_in_recovery() AS standby;
```


```bash
psql -X -c "SELECT inet_server_addr(), inet_server_port();"
```
### Key Points

- Physical replication is WAL-based; logical replication is table/column selective.
- Replication is not a substitute for tested backups.
- Lag is normal; unbounded lag is an incident.
- Promotion changes who generates new timelines.
- Client apps must handle DNS/pool failover behavior.
- Extensions and DDL can complicate logical replication.

### Best Practices

- Draw a topology diagram and keep it version-controlled.
- Expose replication lag to dashboards with thresholds.
- Use replication slots intentionally; monitor retained WAL.
- Standardize promotion runbooks and access controls.
- Test connection string failover with realistic timeouts.

### Common Mistakes

- Assuming synchronous replication eliminates all data loss risk without understanding modes.
- Ignoring disk pressure from lagging slots.
- Failing to rehearse application behavior on read-only standbys.

#### Hands-On Lab Walkthrough

        1. Create a lab cluster or database for exercises related to “Replication basics”.
2. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
3. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
4. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
5. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
6. Automate a health query script and wire it to your monitoring stack.
7. Rehearse promotion/switchover on disposable nodes before production.
8. Run `ANALYZE` after large data copies before trusting plans.
9. Document extension versions whenever clusters move between environments.
10. Peer-review runbooks: two engineers should execute steps without the author.
11. Measure end-to-end client impact during replication failovers (timeouts, pools).
12. Validate roles, `search_path`, and default privileges after topology changes.
13. Practice UTC time conversions for PITR and incident timelines.
14. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
15. File tickets for confusing replication errors to improve future runbooks.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Replication basics)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Replication basics” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 2. Physical Replication (Streaming, Synchronous & Asynchronous)

<a id="2-physical-replication-streaming-sync-async"></a>

### Beginner

Standby streams WAL records over the network. Asynchronous mode commits on primary without waiting for remote flush; synchronous modes wait for configured standbys up to `synchronous_standby_names` rules.

### Intermediate

`wal_level=replica` (or higher) enables physical replication. Tune `max_wal_senders`, `wal_keep_size`, and replication slots. Multiple synchronous standbys support quorum and priority rules in newer versions.

### Expert

Expert operators combine quorum sync rules, slot lifecycles, cascading topologies, and network/OS tuning while planning major upgrades via `pg_upgrade` or controlled logical switchovers.


```sql
SHOW wal_level;
SHOW max_wal_senders;
SHOW synchronous_standby_names;
```


```bash
psql -X -Atqc "SHOW primary_conninfo"   # on standby, when available via settings views
```
### Key Points

- Synchronous replication reduces commit latency tail risk at a latency cost.
- Slots prevent WAL removal but require monitoring.
- Network partitions interact badly with aggressive sync settings.
- Cascading replicas reduce primary fan-out.

### Best Practices

- Start with async; add sync only with measured latency budgets.
- Alert on `write_lag`, `flush_lag`, `replay_lag` where available.
- Capacity-plan network for peak WAL generation.

### Common Mistakes

- Setting synchronous_standby_names without standbys that actually match.
- Letting wal_keep_size be too small without slots (risk of broken replication).

#### Hands-On Lab Walkthrough

        1. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
2. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
3. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
4. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
5. Automate a health query script and wire it to your monitoring stack.
6. Rehearse promotion/switchover on disposable nodes before production.
7. Run `ANALYZE` after large data copies before trusting plans.
8. Document extension versions whenever clusters move between environments.
9. Peer-review runbooks: two engineers should execute steps without the author.
10. Measure end-to-end client impact during replication failovers (timeouts, pools).
11. Validate roles, `search_path`, and default privileges after topology changes.
12. Practice UTC time conversions for PITR and incident timelines.
13. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
14. File tickets for confusing replication errors to improve future runbooks.
15. Create a lab cluster or database for exercises related to “Physical streaming replication”.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Physical streaming replication)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Physical streaming replication” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 3. Logical Replication (Publication / Subscription)

<a id="3-logical-replication-publication-subscription"></a>

### Beginner

Publications define what to publish; subscriptions pull changes on the subscriber. Good for upgrades, selective replication, and integrating external analytics stores.

### Intermediate

Replication identity (`DEFAULT`, `FULL`, indexes) affects update/delete matching. Initial copy may be heavy. DDL is not replicated—manage schema changes explicitly.

### Expert

Conflict handling, parallel apply workers, and row filters evolve by version. Decode plugins power CDC integrations beyond built-in logical replication.


```sql
CREATE PUBLICATION sales_pub FOR TABLE sales, customers;

CREATE SUBSCRIPTION sales_sub
CONNECTION 'host=subscriber dbname=app user=repl password=secret'
PUBLICATION sales_pub;
```


```bash
psql -X -c "SELECT subname, subenabled FROM pg_subscription;"
```
### Key Points

- Logical replication is not a full cluster clone.
- DDL must be coordinated; sequences need special care.
- Replication identity matters for update/delete.
- Initial sync can contend with production I/O.

### Best Practices

- Automate schema drift checks between publisher and subscriber.
- Use filters to limit blast radius where appropriate.
- Monitor apply worker errors in logs and `pg_stat_subscription_stats`.

### Common Mistakes

- Assuming TRUNCATE/DDL replicate magically.
- Using inadequate replication identity and getting mysterious conflicts.

#### Hands-On Lab Walkthrough

        1. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
2. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
3. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
4. Automate a health query script and wire it to your monitoring stack.
5. Rehearse promotion/switchover on disposable nodes before production.
6. Run `ANALYZE` after large data copies before trusting plans.
7. Document extension versions whenever clusters move between environments.
8. Peer-review runbooks: two engineers should execute steps without the author.
9. Measure end-to-end client impact during replication failovers (timeouts, pools).
10. Validate roles, `search_path`, and default privileges after topology changes.
11. Practice UTC time conversions for PITR and incident timelines.
12. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
13. File tickets for confusing replication errors to improve future runbooks.
14. Create a lab cluster or database for exercises related to “Logical replication”.
15. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Logical replication)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Logical replication” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 4. Setting Up a Standby

<a id="4-setting-up-a-standby"></a>

### Beginner

Create a base backup with `pg_basebackup`, configure standby signals, set `primary_conninfo`, start Postgres. The standby enters recovery and streams WAL.

### Intermediate

Use replication slots for reliable retention. Secure replication users with minimal privileges. TLS for replication links is standard in cloud environments.

### Expert

For cascading replicas, chain `primary_conninfo` through intermediates. Understand `hot_standby` and `max_standby_streaming_delay` for long queries vs replication health.


```sql
-- On primary: create replication role (example)
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'change-me';
```


```bash
pg_basebackup -h primary -D /var/lib/postgresql/standby -U replicator -R -Fp -Xs -P
pg_ctl -D /var/lib/postgresql/standby start
```
### Key Points

- `pg_basebackup -R` writes connection hints for streaming recovery.
- Standby must match major version (upgrade paths are deliberate).
- Replication auth uses `pg_hba.conf` rules.

### Best Practices

- Use certificates for replication in untrusted networks.
- Document timeline promotion steps before you need them.
- Keep `primary_slot_name` aligned with actual slot strategy.

### Common Mistakes

- Opening replication without TLS on public networks.
- Forgetting `pg_hba.conf` entries for replication connections.

#### Hands-On Lab Walkthrough

        1. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
2. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
3. Automate a health query script and wire it to your monitoring stack.
4. Rehearse promotion/switchover on disposable nodes before production.
5. Run `ANALYZE` after large data copies before trusting plans.
6. Document extension versions whenever clusters move between environments.
7. Peer-review runbooks: two engineers should execute steps without the author.
8. Measure end-to-end client impact during replication failovers (timeouts, pools).
9. Validate roles, `search_path`, and default privileges after topology changes.
10. Practice UTC time conversions for PITR and incident timelines.
11. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
12. File tickets for confusing replication errors to improve future runbooks.
13. Create a lab cluster or database for exercises related to “Standby setup”.
14. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
15. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Standby setup)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Standby setup” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 5. Failover (Manual & Automatic)

<a id="5-failover-manual-automatic"></a>

### Beginner

Failover promotes a standby to primary after an old primary fails. Manual failover uses `pg_ctl promote` or `SELECT pg_promote()`. Automatic failover uses coordination tools (Patroni) and a DCS.

### Intermediate

Split-brain is the cardinal risk: fencing, STONITH, or cloud APIs prevent dual writers. DNS/VIP updates must align with pooler behavior.

### Expert

Synchronous commit settings influence potential data loss windows. After failover, rebuild old primaries as replicas carefully (reclone often safest).


```sql
SELECT pg_promote(wait => true);
```


```bash
pg_ctl promote -D /var/lib/postgresql/data
```
### Key Points

- Failover is a distributed systems problem, not only a database command.
- Applications must retry and reconnect.
- Old primary must be prevented from accepting writes.

### Best Practices

- Rehearse failover quarterly with realistic load.
- Automate checks that only one primary accepts writes.
- Document RPO achieved vs designed for each scenario.

### Common Mistakes

- Promoting without fencing the old primary.
- Ignoring connection pool caches pointing at dead endpoints.

#### Hands-On Lab Walkthrough

        1. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
2. Automate a health query script and wire it to your monitoring stack.
3. Rehearse promotion/switchover on disposable nodes before production.
4. Run `ANALYZE` after large data copies before trusting plans.
5. Document extension versions whenever clusters move between environments.
6. Peer-review runbooks: two engineers should execute steps without the author.
7. Measure end-to-end client impact during replication failovers (timeouts, pools).
8. Validate roles, `search_path`, and default privileges after topology changes.
9. Practice UTC time conversions for PITR and incident timelines.
10. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
11. File tickets for confusing replication errors to improve future runbooks.
12. Create a lab cluster or database for exercises related to “Failover”.
13. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
14. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
15. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Failover)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Failover” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 6. Replication Monitoring

<a id="6-replication-monitoring"></a>

### Beginner

Use `pg_stat_replication` on primary and `pg_stat_wal_receiver` on standby. Track byte lag, state, and sync state.

### Intermediate

Expose metrics to Prometheus/Datadog/CloudWatch. Correlate with disk, network, and checkpoints. Watch replication slot lag and WAL directory growth.

### Expert

Deep dives include `pg_stat_io`, backend wait events, and log analysis for disconnect loops.


```sql
SELECT application_name, client_addr, state, sync_state,
       pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn) AS send_lag_bytes,
       pg_wal_lsn_diff(sent_lsn, write_lsn) AS write_lag_bytes,
       pg_wal_lsn_diff(write_lsn, flush_lsn) AS flush_lag_bytes,
       pg_wal_lsn_diff(flush_lsn, replay_lsn) AS replay_lag_bytes
FROM pg_stat_replication;
```


```bash
psql -X -c "SELECT * FROM pg_stat_wal_receiver;"
```
### Key Points

- Lag is multidimensional: send/write/flush/replay.
- Slots add retention visibility requirements.
- Logs often contain the root cause when SQL views look healthy.

### Best Practices

- Alert on sustained lag slopes, not single spikes only.
- Dashboard replication alongside checkpoint spikes.

### Common Mistakes

- Monitoring only primary-side views and missing subscriber apply health.

#### Hands-On Lab Walkthrough

        1. Automate a health query script and wire it to your monitoring stack.
2. Rehearse promotion/switchover on disposable nodes before production.
3. Run `ANALYZE` after large data copies before trusting plans.
4. Document extension versions whenever clusters move between environments.
5. Peer-review runbooks: two engineers should execute steps without the author.
6. Measure end-to-end client impact during replication failovers (timeouts, pools).
7. Validate roles, `search_path`, and default privileges after topology changes.
8. Practice UTC time conversions for PITR and incident timelines.
9. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
10. File tickets for confusing replication errors to improve future runbooks.
11. Create a lab cluster or database for exercises related to “Replication monitoring”.
12. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
13. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
14. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
15. Inspect `pg_controldata` output before/after controlled failover tests (read-only).

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Replication monitoring)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Replication monitoring” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 7. Read Replicas

<a id="7-read-replicas"></a>

### Beginner

Physical standbys can serve read-only queries when `hot_standby=on`. Useful for reporting and read scaling with eventual consistency.

### Intermediate

Application must tolerate stale reads. Use separate connection endpoints or pool routing. `SET default_transaction_read_only = on` patterns appear in some routers.

### Expert

Vacuum and long queries interact with `max_standby_streaming_delay`—balance BI workloads vs replication health.


```sql
SET default_transaction_read_only = on;
SELECT now(), pg_is_in_recovery();
```


```bash
# Route reporting user to replica DSN in environment variables
echo "$REPORTING_DATABASE_URL"
```
### Key Points

- Replica reads are stale relative to primary commits.
- Heavy analytics can impact WAL apply if not tuned.
- Replica promotion changes read/write roles.

### Best Practices

- Label connection pools clearly (RW vs RO).
- Measure typical lag for UX decisions (search, dashboards).

### Common Mistakes

- Sending writes to a hot standby (will error).
- Assuming read-your-writes across replicas without session stickiness.

#### Hands-On Lab Walkthrough

        1. Rehearse promotion/switchover on disposable nodes before production.
2. Run `ANALYZE` after large data copies before trusting plans.
3. Document extension versions whenever clusters move between environments.
4. Peer-review runbooks: two engineers should execute steps without the author.
5. Measure end-to-end client impact during replication failovers (timeouts, pools).
6. Validate roles, `search_path`, and default privileges after topology changes.
7. Practice UTC time conversions for PITR and incident timelines.
8. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
9. File tickets for confusing replication errors to improve future runbooks.
10. Create a lab cluster or database for exercises related to “Read replicas”.
11. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
12. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
13. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
14. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
15. Automate a health query script and wire it to your monitoring stack.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Read replicas)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Read replicas” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 8. High Availability Solutions (Patroni & Peers)

<a id="8-high-availability-solutions-patroni"></a>

### Beginner

HA stacks combine Postgres with leader election, health checks, and failover orchestration. Patroni is a popular open-source framework using etcd/ZooKeeper/Consul/Kubernetes.

### Intermediate

VIP/DNS updates and load balancers integrate into the stack. Always understand fencing and bootstrap order.

### Expert

Kubernetes operators (Zalando, Crunchy, CloudNativePG) embed overlapping concerns—learn their failure domains.


```sql
SELECT inet_server_addr(), inet_server_port();
```


```bash
# Illustrative Patroni member list (cluster-specific)
# patronictl list
```
### Key Points

- HA software does not remove need for backups and tested restores.
- DCS availability affects failover decisions.
- Understand who can call promote APIs.

### Best Practices

- Restrict Patroni REST endpoints with network policy.
- Keep small, tested `bootstrap`/`initdb` scripts in git.

### Common Mistakes

- Running HA without staging drills.
- Misconfigured DCS ACLs allowing accidental demotion.

#### Hands-On Lab Walkthrough

        1. Run `ANALYZE` after large data copies before trusting plans.
2. Document extension versions whenever clusters move between environments.
3. Peer-review runbooks: two engineers should execute steps without the author.
4. Measure end-to-end client impact during replication failovers (timeouts, pools).
5. Validate roles, `search_path`, and default privileges after topology changes.
6. Practice UTC time conversions for PITR and incident timelines.
7. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
8. File tickets for confusing replication errors to improve future runbooks.
9. Create a lab cluster or database for exercises related to “HA solutions”.
10. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
11. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
12. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
13. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
14. Automate a health query script and wire it to your monitoring stack.
15. Rehearse promotion/switchover on disposable nodes before production.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (HA solutions)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “HA solutions” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 9. Patroni Framework

<a id="9-patroni-framework"></a>

### Beginner

Patroni manages Postgres lifecycle: start/stop, replication, failover. It stores cluster state in DCS and exposes a REST API for orchestration.

### Intermediate

Customizable `bootstrap`, `initdb`, `pg_hba`, and `postgresql` parameters. Callbacks integrate with load balancers for demotion/promotion hooks.

### Expert

Advanced: synchronous mode management, scheduled switchovers, and major upgrades workflows paired with tooling.


```sql
SELECT pg_current_wal_lsn();
```


```bash
# patronictl switchover --master current-leader --candidate other-node
```
### Key Points

- Patroni config should be versioned like application code.
- Understand timeline changes after failovers.
- REST security is critical.

### Best Practices

- Use staging clusters mirroring production topology.
- Automate `patronictl` operations behind break-glass IAM.

### Common Mistakes

- Editing DCS keys manually without understanding side effects.

#### Hands-On Lab Walkthrough

        1. Document extension versions whenever clusters move between environments.
2. Peer-review runbooks: two engineers should execute steps without the author.
3. Measure end-to-end client impact during replication failovers (timeouts, pools).
4. Validate roles, `search_path`, and default privileges after topology changes.
5. Practice UTC time conversions for PITR and incident timelines.
6. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
7. File tickets for confusing replication errors to improve future runbooks.
8. Create a lab cluster or database for exercises related to “Patroni”.
9. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
10. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
11. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
12. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
13. Automate a health query script and wire it to your monitoring stack.
14. Rehearse promotion/switchover on disposable nodes before production.
15. Run `ANALYZE` after large data copies before trusting plans.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Patroni)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Patroni” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 10. PgBouncer & Connection Pooling

<a id="10-pgbouncer-connection-pooling"></a>

### Beginner

PgBouncer multiplexes many clients onto fewer server connections. Modes: session, transaction, statement (rare for Postgres).

### Intermediate

Transaction pooling breaks session-scoped features (`SET`, temp tables, advisory locks). Session pooling is safest for ORMs that rely on session state.

### Expert

Pool sizing interacts with `max_connections` and memory. HA requires pooler awareness of failover endpoints.


```sql
SHOW max_connections;
SHOW superuser_reserved_connections;
```


```bash
# PgBouncer admin (example)
# psql -p 6432 -U pgbouncer pgbouncer -c "SHOW POOLS;"
```
### Key Points

- Poolers hide server connection storms.
- Transaction pooling requires application discipline.
- Credential rotation must update pooler configs safely.

### Best Practices

- Size pools from measured server memory and query concurrency.
- Use separate pools for OLTP vs admin tasks.

### Common Mistakes

- Using transaction pooling with unprepared session features.
- Pointing all pools at primary when read scaling intended.

#### Hands-On Lab Walkthrough

        1. Peer-review runbooks: two engineers should execute steps without the author.
2. Measure end-to-end client impact during replication failovers (timeouts, pools).
3. Validate roles, `search_path`, and default privileges after topology changes.
4. Practice UTC time conversions for PITR and incident timelines.
5. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
6. File tickets for confusing replication errors to improve future runbooks.
7. Create a lab cluster or database for exercises related to “PgBouncer pooling”.
8. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
9. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
10. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
11. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
12. Automate a health query script and wire it to your monitoring stack.
13. Rehearse promotion/switchover on disposable nodes before production.
14. Run `ANALYZE` after large data copies before trusting plans.
15. Document extension versions whenever clusters move between environments.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (PgBouncer pooling)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “PgBouncer pooling” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 11. Replication Conflicts

<a id="11-replication-conflicts"></a>

### Beginner

Hot standby conflicts occur when queries block replay (e.g., pinned rows). Logical replication conflicts include duplicate keys and missing rows depending on configuration.

### Intermediate

Tune `max_standby_streaming_delay`, `hot_standby_feedback`, and vacuum strategies. Logical replication may `skip` or error based on settings.

### Expert

Expert debugging correlates `pg_stat_database_conflicts` with long-running reports.


```sql
SELECT datname, confl_tablespace, confl_lock, confl_snapshot, confl_bufferpin, confl_deadlock
FROM pg_stat_database_conflicts;
```


```bash
grep -i "canceling statement" /var/log/postgresql/*.log | tail
```
### Key Points

- Conflicts are often BI/reporting vs replication tension.
- Logical conflicts need operational policies.

### Best Practices

- Route heavy reports to delayed replicas with care.
- Document acceptable cancelation of long queries.

### Common Mistakes

- Leaving `hot_standby_feedback` on without monitoring bloat tradeoffs.

#### Hands-On Lab Walkthrough

        1. Measure end-to-end client impact during replication failovers (timeouts, pools).
2. Validate roles, `search_path`, and default privileges after topology changes.
3. Practice UTC time conversions for PITR and incident timelines.
4. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
5. File tickets for confusing replication errors to improve future runbooks.
6. Create a lab cluster or database for exercises related to “Replication conflicts”.
7. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
8. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
9. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
10. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
11. Automate a health query script and wire it to your monitoring stack.
12. Rehearse promotion/switchover on disposable nodes before production.
13. Run `ANALYZE` after large data copies before trusting plans.
14. Document extension versions whenever clusters move between environments.
15. Peer-review runbooks: two engineers should execute steps without the author.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Replication conflicts)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Replication conflicts” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 12. Replication Testing

<a id="12-replication-testing"></a>

### Beginner

Test replication by writing data on primary and reading on replica, injecting network loss, and measuring catch-up time.

### Intermediate

Chaos experiments: partition primary/replica, kill -9 postgres, fill disks. Validate client reconnect behavior.

### Expert

Load tests should include checkpoint spikes, bulk loads, and vacuum concurrently with replication.


```sql
SELECT pg_current_wal_insert_lsn(), pg_current_wal_lsn();
```


```bash
# tc/netem examples are environment-specific; practice in lab only
sudo sysctl net.ipv4.tcp_retries2
```
### Key Points

- Untested failover is technical debt with interest.
- Measure end-user-visible downtime, not only SQL promote time.

### Best Practices

- Automate synthetic write/read checks continuously.
- Record baseline lag distributions seasonally.

### Common Mistakes

- Testing only happy-path insert/select without failure injection.

#### Hands-On Lab Walkthrough

        1. Validate roles, `search_path`, and default privileges after topology changes.
2. Practice UTC time conversions for PITR and incident timelines.
3. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
4. File tickets for confusing replication errors to improve future runbooks.
5. Create a lab cluster or database for exercises related to “Replication testing”.
6. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
7. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
8. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
9. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
10. Automate a health query script and wire it to your monitoring stack.
11. Rehearse promotion/switchover on disposable nodes before production.
12. Run `ANALYZE` after large data copies before trusting plans.
13. Document extension versions whenever clusters move between environments.
14. Peer-review runbooks: two engineers should execute steps without the author.
15. Measure end-to-end client impact during replication failovers (timeouts, pools).

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Replication testing)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Replication testing” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

## 13. Replication Slots & WAL Retention

<a id="13-replication-slots-wal-retention"></a>

### Beginner

Slots pin WAL for consumers (physical or logical). Prevents removal needed for catch-up but risks disk exhaustion if consumers fail.

### Intermediate

`pg_replication_slots` shows active state and retained WAL. Monitor `pg_database_size` of pg_wal indirectly via OS and alerts.

### Expert

Safely drop unused slots. For cloud, understand vendor equivalents and metrics.


```sql
SELECT slot_name, slot_type, active, restart_lsn, confirmed_flush_lsn
FROM pg_replication_slots;
```


```bash
# Example drop (dangerous if still needed)
# psql -c "SELECT pg_drop_replication_slot('my_slot');"
```
### Key Points

- Slots are promises; broken promises fill disks.
- Inactive slots deserve paging alerts.
- Logical slots have `confirmed_flush_lsn` semantics.

### Best Practices

- Name slots clearly with owner/on-call mapping.
- Automate orphan slot detection after deploys.

### Common Mistakes

- Creating slots without retention monitoring.

#### Hands-On Lab Walkthrough

        1. Practice UTC time conversions for PITR and incident timelines.
2. Compare `pg_stat_replication` vs `pg_stat_wal_receiver` depending on node role.
3. File tickets for confusing replication errors to improve future runbooks.
4. Create a lab cluster or database for exercises related to “Replication slots”.
5. Record PostgreSQL major version, OS, and filesystem; replication paths differ by platform.
6. Draft RPO/RTO notes for a sample SaaS and map them to replication/backup choices.
7. Locate `postgresql.conf`, `pg_hba.conf`, and the data directory on your install.
8. Inspect `pg_controldata` output before/after controlled failover tests (read-only).
9. Automate a health query script and wire it to your monitoring stack.
10. Rehearse promotion/switchover on disposable nodes before production.
11. Run `ANALYZE` after large data copies before trusting plans.
12. Document extension versions whenever clusters move between environments.
13. Peer-review runbooks: two engineers should execute steps without the author.
14. Measure end-to-end client impact during replication failovers (timeouts, pools).
15. Validate roles, `search_path`, and default privileges after topology changes.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (Replication slots)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT pg_is_in_recovery();"
        ```

        #### Discussion & Interview Prompts

        - How does “Replication slots” differ between self-managed Postgres and RDS/Aurora-style services?
- What failure modes invalidate an otherwise healthy replication stream?
- How do connection pools change observed behavior during failover?
- Which metrics best predict impending replication saturation?
- How do you test HA without risking split-brain in production subnets?
- What are safe guardrails for automated failover?
- How do schema migrations interact with logical replication?
- How do you document and audit topology changes over time?
- How do you validate read-your-writes expectations when using read replicas?
- What happens to in-flight transactions during a timed switchover drill?

---

