# Replication and Streaming

**PostgreSQL learning notes (March 2026). Topic aligned with README topic 27.**

## 📑 Table of Contents

- [1. Streaming Replication Setup](#1-streaming-replication-setup)
- [2. Replication Slots (Physical & Logical)](#2-replication-slots-physical--logical)
- [3. Synchronous Replication](#3-synchronous-replication)
- [4. Asynchronous Replication](#4-asynchronous-replication)
- [5. Logical Replication (Publication / Subscription)](#5-logical-replication-publication--subscription)
- [6. Logical Decoding](#6-logical-decoding)
- [7. Replication Lag Management](#7-replication-lag-management)
- [8. Cascading Replication](#8-cascading-replication)
- [9. Bidirectional Replication (pglogical, BDR)](#9-bidirectional-replication-pglogical-bdr)
- [10. Replication Monitoring & Debugging](#10-replication-monitoring--debugging)
- [11. Failover & Switchover Procedures](#11-failover--switchover-procedures)

---

## 1. Streaming Replication Setup

<a id="1-streaming-replication-setup"></a>

### Beginner

Streaming replication ships WAL records from a primary to one or more standbys over the network. The standby applies WAL continuously and can serve read-only queries when `hot_standby=on`. Setup typically involves a base backup (`pg_basebackup`), replication user, `pg_hba.conf` rules, and standby configuration (`primary_conninfo`, standby signal files in newer versions).

### Intermediate

Modern versions use `standby.signal` to mark a data directory as a standby. `primary_slot_name` ties the standby to a physical replication slot on the primary for predictable WAL retention. Ensure `wal_level` is at least `replica` and `max_wal_senders` is sufficient.

### Expert

Experts automate bootstrap with configuration management, secure replication with TLS (`sslmode` in conninfo), and validate timelines after promotion. They plan for cascading replicas to reduce primary fan-out and test network partitions with realistic TCP timeouts.

```sql
-- On primary: create replication user (example)
CREATE ROLE replicator WITH LOGIN REPLICATION PASSWORD 'use-strong-secret';
```

```sql
SHOW wal_level;
SHOW max_wal_senders;
SHOW max_replication_slots;
```

```bash
pg_basebackup -h primary.example -D /var/lib/postgresql/16/standby -U replicator -Fp -Xs -P -R
```

```yaml
# Patroni-style excerpt (illustrative; see Patroni docs for real manifests)
bootstrap:
  dcs:
    postgresql:
      parameters:
        wal_level: replica
        max_wal_senders: 10
        max_replication_slots: 10
```

### Key Points

- Replication is not backup; keep independent backups.
- TLS protects data in flight; also verify certificate rotation.
- Replication requires consistent networking and DNS hygiene.
- `pg_basebackup` flags differ by use case (tar vs plain format).
- Hot standby conflicts can cancel long queries on replicas.
- Major upgrades may use logical or physical strategies—plan ahead.
- Timezones and clock skew matter for lag interpretation, not WAL correctness.

### Best Practices

- Infrastructure-as-code for every replication parameter.
- Separate monitoring role with least privilege.
- Run quarterly failover drills on non-prod clusters.
- Document promotion steps including virtual IP or DNS swaps.

### Common Mistakes

- Missing `pg_hba.conf` entries for replication connections.
- Forgetting slot consumption on primary leading to disk fill.
- Promoting a standby without understanding timeline implications.

---

## 2. Replication Slots (Physical & Logical)

<a id="2-replication-slots-physical--logical"></a>

### Beginner

Replication slots guarantee the primary retains WAL until consumers confirm receipt/processing. Physical slots tie to streaming standbys; logical slots tie to logical decoding consumers. Slots prevent WAL removal that could break replication but risk disk exhaustion if consumers stall.

### Intermediate

Inspect `pg_replication_slots` for `active`, `restart_lsn`, `confirmed_flush_lsn`, and `wal_status`. Drop unused slots deliberately. For logical replication, `pgoutput` is the standard plugin.

### Expert

Experts monitor slot lag bytes, automate alerts on inactive slots, and integrate with HA managers (Patroni) to avoid orphaned slots after failovers. They understand differences between `max_slot_wal_keep_size` behavior and manual interventions.

```sql
SELECT slot_name, slot_type, active, restart_lsn, confirmed_flush_lsn, wal_status
FROM pg_replication_slots;
```

```sql
-- Drop a slot (dangerous if still needed)
-- SELECT pg_drop_replication_slot('my_slot');
```

```sql
SELECT pg_create_physical_replication_slot('standby_a', true, false);
```

```yaml
postgresql:
  parameters:
    max_replication_slots: "20"
    max_slot_wal_keep_size: "10GB"
```

### Key Points

- Slots shift responsibility from `wal_keep_size` guesses to explicit consumers.
- Inactive logical slots can halt WAL recycling catastrophically.
- `wal_status` helps identify risks (`extended`, `lost`, etc.—version dependent).
- Logical slots require adequate `wal_level=logical`.
- Physical slots pair with standby `primary_slot_name`.
- Cloud managed DBs may expose slots differently or restrict them.
- Slot names should be stable across automation restarts.

### Best Practices

- Name slots after consumers (hostname, replica id).
- Alert on rising lag bytes per slot.
- Document slot owners and escalation contacts.
- Clean up slots when decommissioning replicas.

### Common Mistakes

- Creating duplicate slots for the same consumer.
- Dropping active slots during incidents without a plan.
- Ignoring `max_slot_wal_keep_size` limits until WAL errors occur.

---

## 3. Synchronous Replication

<a id="3-synchronous-replication"></a>

### Beginner

Synchronous replication waits for standbys to confirm WAL flush (and optionally apply, depending on configuration/version) before committing. This reduces RPO at the cost of commit latency. `synchronous_standby_names` defines which standbys participate.

### Intermediate

Quorum and priority rules (newer versions) allow flexible trade-offs: wait for any N of M standbys, or prioritize closest replicas. Combine with application timeouts carefully—slow replicas stall commits.

### Expert

Experts model expected latency tails, test partition behavior, and document RPO claims versus actual sync mode semantics. They differentiate remote vs local sync replicas and may use synchronous only for critical subsystems via session-level settings where appropriate.

```sql
SHOW synchronous_commit;
SHOW synchronous_standby_names;
```

```sql
SELECT application_name, sync_state, sync_priority
FROM pg_stat_replication;
```

```yaml
postgresql:
  parameters:
    synchronous_commit: "on"
    synchronous_standby_names: "ANY 1 (standby_a, standby_b)"
```

### Key Points

- Synchronous reduces data loss risk; it does not remove operator errors.
- Misconfigured names can stall commits if no matching standby.
- Network partitions create painful trade-offs between availability and durability.
- Session `SET synchronous_commit = local` changes semantics for specific transactions.
- Managed services may expose sync options under different parameter names.
- Standby hardware must keep up or commits suffer.
- Failover with sync requires understanding last known sync state.

### Best Practices

- Start async; add sync with measured p99 commit latency budgets.
- Use ANY quorum for multi-AZ without single-replica fragility.
- Drill partition scenarios with leadership approval.

### Common Mistakes

- Setting synchronous to ALL without latency testing.
- Typos in `synchronous_standby_names` causing immediate outages.
- Confusing remote flush with remote apply guarantees.

---

## 4. Asynchronous Replication

<a id="4-asynchronous-replication"></a>

### Beginner

Asynchronous replication applies WAL on standbys after commit on the primary. Commits are fast; replicas may lag. RPO in a hard failover can be nonzero. This is the default pattern for many OLTP systems.

### Intermediate

Measure lag using `pg_stat_replication` on primary and `pg_stat_wal_receiver` on standby. Tune network, IO on replica, and `hot_standby_feedback` cautiously (can bloat primary if misused).

### Expert

Experts combine async replicas with PITR backups for layered DR strategies. They scale read traffic with load balancers aware of lag, using stale read policies where business rules allow.

```sql
SELECT application_name, state, write_lag, flush_lag, replay_lag
FROM pg_stat_replication;
```

```sql
-- On standby
SELECT status, receive_start_lag, replay_lag FROM pg_stat_wal_receiver;
```

```bash
psql -h standby -c "SELECT pg_is_in_recovery();"
```

### Key Points

- Async is simpler operationally but requires explicit RPO acceptance.
- Large batches on primary can create lag spikes on replicas.
- Read-your-writes is not guaranteed across async replicas.
- Cascading chains multiply lag end-to-end.
- WAL senders consume CPU and network on primary.
- Replica storage must keep pace with WAL apply.
- Logical replication lag semantics differ from physical lag.

### Best Practices

- Expose lag metrics to application teams with SLO documentation.
- Use connection routing that respects lag thresholds.
- Capacity-plan replicas for peak WAL generation, not average.

### Common Mistakes

- Routing critical reads to async replicas without staleness tolerance.
- Ignoring replica IO bottlenecks while primary looks healthy.

---

## 5. Logical Replication (Publication / Subscription)

<a id="5-logical-replication-publication--subscription"></a>

### Beginner

Logical replication copies table changes at logical level using publications on the publisher and subscriptions on the subscriber. It allows selective tables, different schema names, and cross-version upgrades in some scenarios. Requires `wal_level=logical` and a replication user with appropriate rights.

### Intermediate

Use `CREATE PUBLICATION` / `CREATE SUBSCRIPTION`. Initial copy may take locks and time; monitor `pg_stat_subscription_stats` (version-dependent) and worker errors in logs. REPLICA IDENTITY FULL may be needed for certain updates/deletes on tables without suitable keys.

### Expert

Experts handle DDL carefully—logical replication does not replay all DDL automatically. They design conflict-free topologies or use bidirectional tools when needed. They tune `max_logical_replication_workers` and `max_sync_workers_per_subscription`.

```sql
CREATE PUBLICATION pub_orders FOR TABLE orders, order_items;
```

```sql
CREATE SUBSCRIPTION sub_orders
CONNECTION 'host=publisher port=5432 dbname=app user=repl password=secret'
PUBLICATION pub_orders;
```

```sql
SELECT * FROM pg_publication_tables;
```

```yaml
postgresql:
  parameters:
    wal_level: logical
    max_logical_replication_workers: "8"
    max_sync_workers_per_subscription: "4"
```

### Key Points

- Logical replication is powerful but operationally nuanced.
- Sequence behavior and DDL are common footguns.
- Large initial sync stresses network and disk.
- Conflicts on subscriber require application-level strategies if multi-writer.
- Upgrades may use logical replication as a migration tool.
- Filtering options evolve by version—consult release notes.
- Security: subscriptions embed connection strings—protect catalogs.

### Best Practices

- Test DDL procedures with a documented playbook.
- Monitor apply worker errors aggressively.
- Use dedicated networks/VPC paths for replication traffic.

### Common Mistakes

- Expecting TRUNCATE/sequences to replicate intuitively without setup.
- Under-provisioning workers for many subscriptions.

---

## 6. Logical Decoding

<a id="6-logical-decoding"></a>

### Beginner

Logical decoding reads WAL and decodes changes into a logical stream consumed by plugins (`pgoutput`, `test_decoding`, etc.). It powers logical replication and CDC tools. Requires `wal_level=logical` and often a replication slot.

### Intermediate

Use `pg_logical_slot_get_changes` for testing. Understand snapshot semantics and the impact of long-running decoding sessions on WAL retention. Integrate with Kafka connectors (Debezium) or custom consumers.

### Expert

Experts write safe consumers that track LSN positions, handle schema changes, and back-pressure producers. They coordinate with vacuum and catalog bloat risks on busy systems.

```sql
SELECT * FROM pg_create_logical_replication_slot('cdc_slot', 'pgoutput');
```

```sql
-- Inspect changes (test only; volume can be huge)
SELECT * FROM pg_logical_slot_get_changes('cdc_slot', NULL, NULL, 'proto_version', '1', 'publication_names', 'pub_orders');
```

```bash
# Many teams consume via external tools rather than SQL alone
# Example: run consumer in Kubernetes with dedicated service account
kubectl -n data logs deploy/logical-consumer --tail=50
```

### Key Points

- Decoding slots must advance or WAL grows.
- Schema changes require consumer upgrades or compatibility layers.
- `test_decoding` is for learning—not production CDC design.
- High churn tables generate high decode volume.
- Security boundaries matter: decoded rows may be sensitive.
- Transaction boundaries affect batching in sinks.
- Failover of decoding infrastructure needs LSN continuity plans.

### Best Practices

- Store consumer offsets durably outside Postgres or via metadata tables with care.
- Contract tests between schema migrations and consumers.
- Rate-limit dangerous diagnostic SQL in production.

### Common Mistakes

- Creating slots without automated monitoring.
- Assuming DELETE events always carry full row images without REPLICA IDENTITY.

---

## 7. Replication Lag Management

<a id="7-replication-lag-management"></a>

### Beginner

Lag is the delay between primary generation and standby application of WAL. Visible as time-based lag or byte lag depending on view columns. Some lag is normal; sustained growth is an incident.

### Intermediate

Investigate replica IO, CPU, network, and conflicts on hot standbys. Large queries on replicas can delay replay if resources contend. Check for WAL send bottlenecks on primary.

### Expert

Experts build SLO dashboards with secondary indicators (checkpoint spikes, concurrent IO). They tune `max_standby_streaming_delay` and related parameters judiciously and understand when to shed load from replicas.

```sql
SELECT application_name, write_lag, flush_lag, replay_lag
FROM pg_stat_replication
ORDER BY replay_lag DESC NULLS LAST;
```

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS approx_lag_bytes
FROM pg_stat_replication;
```

```yaml
alerts:
  - name: PostgresReplicationLagHigh
    expr: pg_replication_lag_seconds > 300
    for: 10m
```

### Key Points

- Lag metrics differ by view and role; know which node you query.
- Bytes lag helps separate network from apply issues with practice.
- Long transactions on primary can interact with vacuum and WAL size.
- Read-only replica load can indirectly affect replay via resource contention.
- Cascading lag accumulates hop by hop.
- Automatic failovers should include lag guards.
- Cloud metrics may use different names—map explicitly.

### Best Practices

- Alert on trend derivatives, not only absolute lag.
- Provide replica sizing headroom for peak marketing events.
- Document acceptable lag per application feature.

### Common Mistakes

- Restarting replicas repeatedly without fixing root IO limits.
- Misinterpreting null lag fields during transient states.

---

## 8. Cascading Replication

<a id="8-cascading-replication"></a>

### Beginner

Cascading replication allows a standby to feed downstream standbys, reducing WAL sender load on the primary. The intermediate node acts as both receiver and sender.

### Intermediate

Configure downstream `primary_conninfo` to point to the upstream standby. Ensure `hot_standby=on` on intermediates and sufficient `max_wal_senders`. Monitor end-to-end lag across tiers.

### Expert

Experts design tier topologies for geo distribution and isolate failure domains. They validate promotion scenarios: promoting a downstream standby may require re-pointing cascades.

```sql
-- On intermediate standby, observe receivers
SELECT * FROM pg_stat_replication;
```

```sql
-- On primary, only direct standbys appear
SELECT application_name, client_addr FROM pg_stat_replication;
```

```yaml
topology:
  primary: eu-primary
  tier1:
    - eu-standby
  tier2:
    - us-standby-from-eu
```

### Key Points

- Cascading adds operational complexity and latency.
- WAL still originates from timeline history—understand promotions.
- Network between tiers must handle peak WAL fan-out.
- Slot usage must be planned per hop where applicable.
- Failover in middle tiers impacts multiple children.
- Monitoring must aggregate lag end-to-end.
- Some managed services restrict cascading patterns.

### Best Practices

- Draw topology diagrams with promotion arrows.
- Automate chain reconfiguration tests.
- Prefer at least one direct replica from primary for simpler DR.

### Common Mistakes

- Creating single points of failure in the middle tier without noticing.
- Forgetting to open replication firewall rules between tiers.

---

## 9. Bidirectional Replication (pglogical, BDR)

<a id="9-bidirectional-replication-pglogical-bdr"></a>

### Beginner

Native PostgreSQL does not provide simple multi-master for all workloads. Extensions/products like pglogical (historical) and EDB Postgres Distributed (BDR) implement multi-master or bidirectional patterns with conflict handling rules. Expect constraints: not all DDL/SQL patterns are safe.

### Intermediate

Design schemas to avoid conflicting primary keys, or use global UUID keys. Understand last-writer-wins vs custom conflict handlers. Monitor replication conflicts and apply queues.

### Expert

Experts evaluate whether CRDT-like patterns or single-writer partitions reduce complexity versus true multi-master. They run chaos tests with network partitions and measure data divergence windows.

```sql
-- Illustrative only: real BDR/pglogical commands depend on product docs
-- Always follow vendor manuals for your installed software.
SELECT version();
```

```yaml
# Conceptual: product-specific operator configuration
multi_master:
  enabled: true
  conflict_resolution: last_update_wins
```

### Key Points

- Multi-master increases application design burden massively.
- Conflicts are inevitable without careful data ownership boundaries.
- Upgrades require vendor-specific playbooks.
- Licensing and support contracts may apply.
- Not a replacement for sharding when write scalability limits hit.
- Observability must include conflict counters and DLQs if used.
- Testing must include simultaneous writes to the same row.

### Best Practices

- Prefer single-primary with read scaling unless requirements force multi-master.
- Document data ownership per table/tenant.
- Invest in automated conflict replay tooling if chosen.

### Common Mistakes

- Assuming synchronous-looking behavior from async multi-master.
- Underestimating DDL coordination overhead.

---

## 10. Replication Monitoring & Debugging

<a id="10-replication-monitoring--debugging"></a>

### Beginner

Monitor replication using `pg_stat_replication`, `pg_stat_wal_receiver`, logs, and lag metrics. Common errors include auth failures, `pg_hba.conf` rejections, missing slots, and network timeouts.

### Intermediate

Correlate replication errors with TLS handshake failures, DNS flaps, and disk full on primary or replica. Use `pg_receivewal` tests for network path validation in maintenance windows.

### Expert

Experts capture tcpdump pcaps sparingly under policy, tune `tcp_keepalives_*`, and integrate replication health into automated failover systems with hysteresis to prevent flapping.

```sql
SELECT * FROM pg_stat_replication;
```

```sql
SELECT * FROM pg_stat_wal_receiver;
```

```bash
pg_receivewal -h primary -U replicator -D /tmp/waltest --slot=testslot --create-slot
```

```yaml
monitoring:
  checks:
    - name: replication_lag
      interval: 30s
    - name: replication_state
      interval: 10s
```

### Key Points

- Logs on both ends tell different halves of the story.
- Replication breakages often present first as rising lag, not immediate errors.
- Disk space on primary affects WAL retention; on replica affects apply.
- Role passwords rotate—update standbys/subscriptions.
- Certificate expiry breaks TLS replication quietly until reconnect storms.
- Version mismatches may be allowed read-only—validate matrix.
- HA software adds another layer of health checks.

### Best Practices

- Maintain a replication troubleshooting decision tree.
- Save `pg_controldata` outputs when debugging timeline issues.
- Time-bound invasive network tests with change management.

### Common Mistakes

- Only looking at primary metrics while replica disk is full.
- Rotating certs without updating `primary_conninfo` everywhere.

---

## 11. Failover & Switchover Procedures

<a id="11-failover--switchover-procedures"></a>

### Beginner

Switchover is a planned promotion of a standby; failover is unplanned. Promotion makes the standby a new primary (`pg_ctl promote` or `SELECT pg_promote()`). Clients must reconnect; replication topology must be rewired.

### Intermediate

Use controlled switchovers to test DR. After promotion, recreate replication from new primary, rebuild slots, and validate backups. Beware split-brain if old primary comes back online—use STONITH or `recovery_target_timeline` discipline.

### Expert

Experts automate with Patroni/repmgr/orchestrators, integrate fencing, and verify backup schedules post-failover. They document timeline history and LSN checkpoints for forensic recovery.

```sql
-- Controlled promotion (version dependent availability)
SELECT pg_promote(wait_seconds => 60);
```

```bash
pg_ctl -D /var/lib/postgresql/16/main promote
```

```yaml
runbook:
  switchover:
    - verify_replication_lag_within_slo
    - pause_writes_at_lb
    - promote_standby
    - repoint_replicas
    - resume_traffic
```

### Key Points

- Failover without fencing risks two primaries.
- Application pools may need aggressive recycle after promotion.
- DNS TTLs affect client convergence speed.
- Sequences and logical replication require post-promotion checks.
- RPO/RTO claims must be rehearsed, not theorized.
- Some cloud APIs promote via clickops—codify via IaC where possible.
- After failover, rebuild missing replicas promptly.

### Best Practices

- Run switchovers during business-low windows first.
- Maintain a printed runbook for network partition scenarios.
- Validate backups from the new primary immediately after failover tests.

### Common Mistakes

- Promoting the wrong node due to stale documentation.
- Leaving old primary writable without isolation.

---

## Appendix: Replication SQL & Ops Snippets

```sql
SELECT pg_is_in_recovery() AS standby;
```

```sql
SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn(),
       pg_wal_lsn_diff(pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn()) AS recv_replay_diff;
```

```sql
SELECT slot_name, active, wal_status, safe_wal_size
FROM pg_replication_slots;
```

```bash
# Timeline and control data (read-only inspection)
pg_controldata /var/lib/postgresql/16/main | egrep 'Database cluster state|RECOVERY|Timeline'
```

```yaml
# Example HAProxy health check query via psql in xinetd script (conceptual)
# Prefer managed health endpoints from Patroni when available
```

### Key Points (Appendix)

- Always know whether you are connected to primary or standby before acting.
- Slot `safe_wal_size` helps anticipate primary WAL pressure (version dependent).

### Best Practices (Appendix)

- Version-control runbooks and example commands together.
- Redact secrets in copied connection strings.

### Common Mistakes (Appendix)

- Running write queries on a standby expecting success.

---

## Extended Appendix: End-to-End Replication Lab Notes

These notes condense common classroom labs into copy-paste friendly form. Adapt host paths and versions.

### Lab A — Inspect roles and replication connectivity

```sql
SELECT rolname, rolreplication FROM pg_roles WHERE rolreplication OR rolname = current_user;
```

```sql
SELECT * FROM pg_hba_file_rules WHERE type = 'host' AND database IN ('replication','all');
```

```bash
psql "host=primary dbname=postgres user=replicator sslmode=verify-full" -c "SELECT 1"
```

### Key Points (Lab A)

- `pg_hba_file_rules` helps validate rules without opening the raw file on disk.
- TLS modes should be `verify-full` in production when PKI is mature.

### Best Practices (Lab A)

- Use separate replication users per environment.
- Store passwords in vaults, not shell history.

### Common Mistakes (Lab A)

- Testing only with `trust` locally and assuming production will behave the same.

---

### Lab B — Measure lag under synthetic load

```sql
-- Primary: start a write load elsewhere, then:
SELECT application_name, write_lag, flush_lag, replay_lag
FROM pg_stat_replication;
```

```sql
-- Standby:
SELECT now(), pg_last_xact_replay_timestamp();
```

```bash
# Optional pgbench on primary during lag test
pgbench -M prepared -c 16 -j 4 -T 120 pgbench
```

### Key Points (Lab B)

- Synthetic load should mimic row width and index patterns of real tables when possible.
- `pg_last_xact_replay_timestamp()` can be null during idle periods.

### Best Practices (Lab B)

- Capture metrics at 1s or 5s granularity into a spreadsheet for class review.
- Note checkpoint times in the timeline.

### Common Mistakes (Lab B)

- Running pgbench on the standby and misattributing CPU saturation to replay.

---

### Lab C — Logical replication smoke test

```sql
-- Publisher
CREATE TABLE lr_demo(id int primary key, v text);
INSERT INTO lr_demo VALUES (1,'a');
CREATE PUBLICATION lr_pub FOR TABLE lr_demo;
```

```sql
-- Subscriber
CREATE TABLE lr_demo(id int primary key, v text);
CREATE SUBSCRIPTION lr_sub
CONNECTION 'host=publisher dbname=postgres user=repl password=secret'
PUBLICATION lr_pub;
```

```sql
-- Publisher: more rows
INSERT INTO lr_demo VALUES (2,'b');
```

```sql
-- Subscriber:
TABLE lr_demo;
```

### Key Points (Lab C)

- Initial sync requires table definitions compatible enough for copy.
- Errors appear in logs and `pg_stat_subscription_rel` (versions vary).

### Best Practices (Lab C)

- Drop subscriptions in reverse order in labs to practice safe teardown.
- Use `ALTER SUBSCRIPTION ... REFRESH PUBLICATION` when publication definitions change (version dependent).

### Common Mistakes (Lab C)

- Creating publication after large data load without noticing long copy times.

---

### Lab D — Slot safety drill

```sql
SELECT slot_name, active, restart_lsn, wal_status FROM pg_replication_slots;
```

```sql
-- Never run in prod without change control:
-- SELECT pg_drop_replication_slot('unused_slot');
```

### Key Points (Lab D)

- Dropping the wrong slot breaks replication or CDC permanently until rebuilt.

### Best Practices (Lab D)

- Practice slot lifecycle in disposable clusters only.

### Common Mistakes (Lab D)

- Confusing inactive with unused.

---

### Lab E — Promotion checklist (disposable cluster)

```bash
# On standby host
pg_ctl -D /path/to/data promote
```

```sql
SELECT pg_is_in_recovery();
```

```sql
INSERT INTO sanity_check(ts) VALUES (now());
```

### Key Points (Lab E)

- After promotion, update all replicas’ upstreams.
- Old primary must be isolated before it accepts writes.

### Best Practices (Lab E)

- Take a fresh backup from the new timeline after drills.

### Common Mistakes (Lab E)

- Forgetting to recreate physical replication from new primary.

---

### Reference: `primary_conninfo` fragments

```ini
# standby.signal present in data directory (v12+)
# postgresql.auto.conf may contain:
primary_conninfo = 'host=primary port=5432 user=replicator password=secret sslmode=verify-full'
primary_slot_name = 'standby_a'
```

### Key Points (Reference)

- Prefer `use_primary_slot_name` patterns from `pg_basebackup -R` over hand-editing when learning.

### Best Practices (Reference)

- Store conninfo consistently in secret managers for prod.

### Common Mistakes (Reference)

- Embedding passwords in world-readable config files.

---

### Reference: Timeline debugging hints

```bash
pg_controldata /var/lib/postgresql/16/main | grep -E 'Timeline|RECOVERY|state'
```

```sql
-- On a recovery/promoted node context-dependent queries may differ; consult version docs
SELECT timeline_id, redo_lsn FROM pg_control_checkpoint();
```

### Key Points (Timeline)

- Timelines help Postgres avoid applying unrelated WAL after branching events.

### Best Practices (Timeline)

- File timeline diagrams for every HA cluster annually.

### Common Mistakes (Timeline)

- Manually copying WAL files across unrelated timelines hoping it will “work”.

---

### Extended SQL: conflict and recovery hints (physical)

```sql
SELECT pid, usename, query_start, left(query,200)
FROM pg_stat_activity
WHERE wait_event ILIKE '%recovery%';
```

### Key Points (Extended SQL)

- Hot standby conflicts appear as canceled queries; tune thresholds carefully.

### Best Practices (Extended SQL)

- Route long reports away from replicas sensitive to replay delays.

### Common Mistakes (Extended SQL)

- Increasing `max_standby_streaming_delay` without understanding data staleness growth.

---

### YAML: Prometheus rule sketch for lag (illustrative)

```yaml
groups:
  - name: postgres_replication
    rules:
      - alert: PgReplicationLagHigh
        expr: pg_replication_lag > 300
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Postgres replication lag high"
```

### Key Points (Prometheus)

- Metric names depend on exporter version; validate before deploying.

### Best Practices (Prometheus)

- Include `application_name` labels via target metadata when possible.

### Common Mistakes (Prometheus)

- Alerting on instantaneous spikes without `for:` smoothing.

---

### Bash: quick replica identity audit for logical CDC tables

```bash
psql -X -Atqc "
SELECT c.relname, c.relreplident
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;
"
```

### Key Points (replident)

- `d` default uses primary key; `f` full; others see docs.
- UPDATE/DELETE decoding needs appropriate identity for consumers.

### Best Practices (replident)

- Standardize replident decisions in schema review checklists.

### Common Mistakes (replident)

- Using FULL without understanding WAL bloat implications.

---

### SQL: publication DDL guardrails

```sql
SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete, pubtruncate
FROM pg_publication;
```

### Key Points (publications)

- TRUNCATE replication behavior depends on publication options and versions.

### Best Practices (publications)

- Explicit table lists beat `FOR ALL TABLES` surprises for many teams.

### Common Mistakes (publications)

- Accidentally publishing entire schemas in regulated environments.

---

### Discussion prompts for teams

### Key Points (Discussion)

- Replication choices are really RPO/RTO and ops maturity choices.

### Best Practices (Discussion)

- Review quarterly with product owners, not only DBAs.

### Common Mistakes (Discussion)

- Treating replicas as backups without restore drills.

---

### Final checklist before production replication changes

```yaml
checklist:
  - backups_current_and_restorable: true
  - runbook_updated: true
  - monitoring_dashboards_updated: true
  - on_call_notified: true
  - rollback_window_agreed: true
```

### Key Points (Checklist)

- Human coordination beats perfect config if incidents occur.

### Best Practices (Checklist)

- Attach checklist completion links to change tickets.

### Common Mistakes (Checklist)

- Shipping Friday evening without coverage.

---

## Extended Appendix: Connection Strings & Security Hardening

```ini
# libpq keyword/value style (preferred in many tools)
host=db.prod.example port=5432 dbname=app user=app sslmode=verify-full target_session_attrs=read-write
```

```ini
# Read-only intent to standbys when supported by proxy/driver topology
host=db.ro.prod.example port=5432 dbname=app user=appro sslmode=verify-full target_session_attrs=read-only
```

```yaml
# Kubernetes secret (illustrative; use sealed secrets or external secrets operator)
apiVersion: v1
kind: Secret
metadata:
  name: pg-replication
stringData:
  primary_conninfo: "host=primary.db.svc.cluster.local port=5432 user=replicator sslmode=verify-full"
```

```sql
-- Validate SSL in use
SELECT ssl, version, cipher, bits FROM pg_stat_ssl WHERE pid = pg_backend_pid();
```

### Key Points (Security)

- `verify-full` ties hostname to certificate identity.
- Rotation requires coordinated updates across standbys and subscriptions.

### Best Practices (Security)

- Use short-lived credentials where managed providers allow.
- Separate replication CIDRs in `pg_hba.conf`.

### Common Mistakes (Security)

- Using `sslmode=require` without certificate verification indefinitely.

```sql
-- One-line health: am I on a standby?
SELECT pg_is_in_recovery() AS standby, inet_server_addr() AS server_ip;
```

---

