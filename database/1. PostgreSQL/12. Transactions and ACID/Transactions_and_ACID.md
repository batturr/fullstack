# Transactions & ACID

**PostgreSQL learning notes (March 2026). Aligned with README topic 12.**

---

## 📑 Table of Contents

- [1. Transaction Basics (ACID)](#1-transaction-basics-acid)
- [2. BEGIN & COMMIT](#2-begin--commit)
- [3. ROLLBACK](#3-rollback)
- [4. Savepoints](#4-savepoints)
- [5. Isolation Levels](#5-isolation-levels)
- [6. Read Phenomena](#6-read-phenomena)
- [7. Transaction Locks](#7-transaction-locks)
- [8. Deadlocks](#8-deadlocks)
- [9. Long-Running Transactions](#9-long-running-transactions)
- [10. Concurrency Control](#10-concurrency-control)
- [11. Transaction Logs (WAL)](#11-transaction-logs-wal)
- [12. Transaction Management Best Practices](#12-transaction-management-best-practices)

---

## 1. Transaction Basics (ACID)

<a id="1-transaction-basics-acid"></a>

### Beginner

A transaction groups statements into one unit: all succeed (`COMMIT`) or none persist (`ROLLBACK`). ACID: Atomicity, Consistency, Isolation, Durability.

### Intermediate

Atomicity: all-or-nothing. Consistency: constraints hold after commit (application invariants too). Isolation: concurrent transactions don’t see each other’s partial work per level rules. Durability: committed data survives crashes via WAL.

### Expert

PostgreSQL uses MVCC for reads; writers coordinate with row-level locks and predicate protections depending on isolation. Serializable uses SSI techniques to detect anomalies.

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### Key Points

- Transactions define durability boundaries.

### Best Practices

- Keep business invariants enforced with constraints, not only app logic.

### Common Mistakes

- Assuming read committed prevents all anomalies.

---

## 2. BEGIN & COMMIT

<a id="2-begin--commit"></a>

### Beginner

`BEGIN` (or `START TRANSACTION`) opens a transaction. `COMMIT` makes changes visible and durable.

### Intermediate

`BEGIN ISOLATION LEVEL ...` sets isolation for the transaction. `COMMIT AND CHAIN` continues a new txn in same session (PostgreSQL feature).

### Expert

Deferred constraints may validate at commit time.

```sql
BEGIN;
INSERT INTO a VALUES (1);
COMMIT;
```

### Key Points

- Autocommit mode sends implicit commit per statement in many clients unless wrapped.

### Best Practices

- Explicit transactions for multi-step operations.

### Common Mistakes

- Forgetting `COMMIT` in ad hoc sessions.

---

## 3. ROLLBACK

<a id="3-rollback"></a>

### Beginner

`ROLLBACK` aborts the transaction and discards changes since `BEGIN`.

### Intermediate

`ROLLBACK TO SAVEPOINT` partial rollback.

### Expert

Errors in PL/pgSQL may trigger rollback of a subtransaction; understand exception blocks.

```sql
BEGIN;
UPDATE t SET v = v + 1 WHERE bad;
ROLLBACK;
```

### Key Points

- After rollback, session is ready for new work.

### Best Practices

- On error paths in apps, issue `ROLLBACK` on the connection before reuse.

### Common Mistakes

- Reusing a failed connection without clearing aborted state (`ROLLBACK`).

---

## 4. Savepoints

<a id="4-savepoints"></a>

### Beginner

`SAVEPOINT sp;` marks a point; `ROLLBACK TO SAVEPOINT sp;` undoes work after it without ending full transaction.

### Intermediate

`RELEASE SAVEPOINT` removes marker; nested savepoints possible.

### Expert

Savepoints create subtransactions with overhead; avoid deep nesting in hot paths.

```sql
BEGIN;
INSERT INTO t VALUES (1);
SAVEPOINT after_first;
INSERT INTO t VALUES (2);
ROLLBACK TO SAVEPOINT after_first;
COMMIT;
```

### Key Points

- Outer transaction still commits/rolls back entirely.

### Best Practices

- Use for large batch partial failure recovery.

### Common Mistakes

- Expecting savepoint release to commit work independently.

---

## 5. Isolation Levels

<a id="5-isolation-levels"></a>

### Beginner

Levels: `READ UNCOMMITTED` (mapped to read committed in PostgreSQL), `READ COMMITTED` (default), `REPEATABLE READ`, `SERIALIZABLE`.

### Intermediate

Higher levels reduce anomalies but increase serialization failures (`SQLSTATE 40001`).

### Expert

`SERIALIZABLE` uses Serializable Snapshot Isolation—conflicts may appear only at commit.

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT sum(balance) FROM accounts;
COMMIT;
```

### Key Points

- PostgreSQL does not implement dirty reads.

### Best Practices

- Default is fine for most OLTP; escalate when needed.

### Common Mistakes

- Using `SERIALIZABLE` without retry logic.

---

## 6. Read Phenomena

<a id="6-read-phenomena"></a>

### Beginner

Dirty read: see uncommitted data (not in PG). Non-repeatable read: row values change between reads. Phantom read: new rows appear due to inserts.

### Intermediate

Repeatable read prevents non-repeatable reads for existing rows; phantoms possible unless prevented. Serializable aims to prevent all.

### Expert

Write skew is subtle: two txns read disjoint rows and update based on invariants—serializable detects some patterns.

```sql
-- Illustrative: two concurrent transactions adjusting shared budget constraints
```

### Key Points

- Isolation defines which phenomena can occur.

### Best Practices

- Model critical invariants with constraints + correct isolation + retries.

### Common Mistakes

- Ignoring `40001` retry requirement.

---

## 7. Transaction Locks

<a id="7-transaction-locks"></a>

### Beginner

Locks coordinate writes: row-level exclusive locks on update/delete, share locks for some reads in Serializable. Table-level locks for DDL, `LOCK TABLE`.

### Intermediate

`SELECT ... FOR UPDATE` locks selected rows. `FOR SHARE`/`FOR NO KEY UPDATE` variants exist.

### Expert

Lock queues can block; `lock_timeout` prevents indefinite waits.

```sql
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = balance - 10 WHERE id = 1;
COMMIT;
```

### Key Points

- Locks protect write consistency.

### Best Practices

- Keep lock scope minimal and time short.

### Common Mistakes

- Locking wide row sets unnecessarily.

---

## 8. Deadlocks

<a id="8-deadlocks"></a>

### Beginner

Deadlock: cycle of transactions waiting on each other’s locks. PostgreSQL detects and aborts one txn.

### Intermediate

Error `40P01` on victim; app should retry.

### Expert

Consistent lock ordering (always lock account ids ascending) prevents many deadlocks.

```sql
-- App logic: always lock rows in deterministic order
```

### Key Points

- Retries are normal under concurrency.

### Best Practices

- Avoid long transactions holding locks.

### Common Mistakes

- Swallowing deadlock errors without retry.

---

## 9. Long-Running Transactions

<a id="9-long-running-transactions"></a>

### Beginner

Long txns hold back xmin horizons, blocking vacuum, causing bloat and WAL retention.

### Intermediate

Hot standby conflicts can occur with long queries on replicas.

### Expert

Break reporting queries into snapshots or use repeatable read snapshots cautiously with monitoring.

### Key Points

- Time and locks correlate with operational pain.

### Best Practices

- Set `idle_in_transaction_session_timeout`.

### Common Mistakes

- Open transactions over HTTP keep-alive debugging sessions.

---

## 10. Concurrency Control

<a id="10-concurrency-control"></a>

### Beginner

MVCC lets readers not block writers; writers still coordinate.

### Intermediate

Optimistic: commit and retry on conflict. Pessimistic: `SELECT FOR UPDATE` up front.

### Expert

Choose per use case: financial transfers often pessimistic; low-contention counters optimistic.

```sql
-- Optimistic update pattern
UPDATE counters SET v = v + 1 WHERE id = 1 AND version = $old RETURNING version;
```

### Key Points

- Strategy depends on contention and correctness needs.

### Best Practices

- Use row `version` columns for optimistic locking when appropriate.

### Common Mistakes

- Optimistic updates without handling zero rowcount.

---

## 11. Transaction Logs (WAL)

<a id="11-transaction-logs-wal"></a>

### Beginner

WAL is write-ahead log ensuring durability. Commits flush WAL before acknowledging.

### Intermediate

Replication streams WAL. Checkpoints balance recovery time vs flush cost.

### Expert

Tune `wal_level`, `max_wal_size`, `checkpoint_timeout` for workload; archiving for PITR.

### Key Points

- Crash recovery replays WAL.

### Best Practices

- Monitor WAL generation spikes during bulk loads.

### Common Mistakes

- Disabling fsync except in disposable environments.

---

## 12. Transaction Management Best Practices

<a id="12-transaction-management-best-practices"></a>

### Beginner

Keep transactions short; handle errors with rollback; use retries for serialization/deadlock.

### Intermediate

Set timeouts: `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout`.

### Expert

Use monitoring views (`pg_stat_activity`, `pg_locks`) and logs for stuck txns.

```sql
SHOW transaction_isolation;
```

### Key Points

- Operational hygiene matters as much as SQL correctness.

### Best Practices

- Explicit boundaries, timeouts, retries, observability.

### Common Mistakes

- Unbounded retries without backoff.

---

## Appendix A. Workshops mapped to subtopics

### A.1 ACID transfer

```sql
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;
```

### A.2 Explicit isolation

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT * FROM inventory WHERE product_id = 10 FOR UPDATE;
UPDATE inventory SET qty = qty - 1 WHERE product_id = 10;
COMMIT;
```

### A.3 Rollback on violation

```sql
BEGIN;
INSERT INTO ledger(amount) VALUES (-5); -- violates check
ROLLBACK;
```

### A.4 Savepoint partial failure

```sql
BEGIN;
INSERT INTO batches(id) VALUES (1);
SAVEPOINT b1;
INSERT INTO items(batch_id) VALUES (999); -- fails FK
ROLLBACK TO SAVEPOINT b1;
COMMIT;
```

### A.5 Read committed default behavior

Each statement sees latest committed snapshot.

### A.6 Repeatable read snapshot

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM t;
-- concurrent insert happens elsewhere
SELECT count(*) FROM t; -- same snapshot count
COMMIT;
```

### A.7 Serializable anomaly handling (app pseudo)

Retry on `40001`.

### A.8 Row lock

```sql
BEGIN;
SELECT * FROM seats WHERE id = 12 FOR UPDATE;
UPDATE seats SET reserved = TRUE WHERE id = 12;
COMMIT;
```

### A.9 Deadlock reproduction note

Cross-order updates on two rows in two sessions—observe `40P01`.

### A.10 Long txn hazard

`SELECT pg_sleep(3600);` in txn—observe autovacuum issues in training only.

### A.11 Optimistic locking update

```sql
UPDATE docs SET body = $2, version = version + 1
WHERE id = $1 AND version = $3
RETURNING version;
```

### A.12 WAL concept

Commits wait for WAL flush depending on `synchronous_commit` settings.

---

## Appendix B. Session settings cheat sheet

```sql
SET lock_timeout = '2s';
SET statement_timeout = '30s';
SET idle_in_transaction_session_timeout = '10s';
```

---

## Appendix C. Observability queries

### C.1 Who blocks whom

Use `pg_blocking_pids` in modern versions:

```sql
SELECT pid, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE state <> 'idle';
```

### C.2 Locks

```sql
SELECT * FROM pg_locks WHERE NOT granted;
```

---

## Appendix D. Patterns: idempotent retries

### D.1 Insert with natural key

Combine with `ON CONFLICT` for safe retries.

### D.2 Transfer with ledger entries

Always insert double-entry lines in same transaction.

---

## Appendix E. MVCC and VACUUM

Updates/deletes leave dead tuples; autovacuum reclaims space. Long txns delay cleanup.

---

## Appendix F. Isolation quick comparison

- Read committed: minimal protection, fewer retries.
- Repeatable read: stable reads, may still serialize failures.
- Serializable: strongest, more `40001`.

---

## Appendix G. Large SQL / psql drill list

### G.1

```sql
BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT 1;
COMMIT;
```

### G.2

```sql
BEGIN;
SAVEPOINT a;
INSERT INTO t VALUES (1);
RELEASE SAVEPOINT a;
COMMIT;
```

### G.3

```sql
BEGIN;
LOCK TABLE t IN SHARE MODE;
COMMIT;
```

### G.4

```sql
SELECT * FROM t WHERE id = 1 FOR SHARE;
```

### G.5

```sql
SELECT * FROM t WHERE id = 1 FOR NO KEY UPDATE;
```

### G.6

```sql
BEGIN;
SET LOCAL lock_timeout = '500ms';
SELECT * FROM t WHERE id = 1 FOR UPDATE;
COMMIT;
```

### G.7

```sql
SHOW transaction_read_only;
```

### G.8

```sql
BEGIN READ ONLY;
SELECT count(*) FROM big;
COMMIT;
```

### G.9

```sql
BEGIN;
PREPARE TRANSACTION 'xid_demo'; -- two-phase commit demo only
-- ROLLBACK PREPARED 'xid_demo';
```

### G.10

```sql
SELECT txid_current();
```

### G.11

```sql
SELECT xmin, xmax, * FROM t LIMIT 1; -- system columns exploration
```

### G.12

```sql
COMMIT AND CHAIN; -- starts new txn immediately
```

### G.13

```sql
BEGIN;
SET TRANSACTION SNAPSHOT '000003A1-1'; -- advanced snapshot import
COMMIT;
```

### G.14

```sql
SELECT now(), clock_timestamp(), transaction_timestamp();
```

### G.15

```sql
SELECT isolation_level FROM pg_stat_activity WHERE pid = pg_backend_pid();
```

### G.16

```sql
SELECT * FROM pg_prepared_xacts;
```

### G.17

```sql
SELECT datname, xact_commit, xact_rollback FROM pg_stat_database WHERE datname = current_database();
```

### G.18

```sql
SELECT * FROM pg_stat_wal;
```

### G.19

```sql
SELECT * FROM pg_current_wal_lsn();
```

### G.20

```sql
SELECT pg_is_in_recovery();
```

### G.21

```sql
SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();
```

### G.22

```sql
SELECT pg_sleep(0.01);
```

### G.23

```sql
SELECT pg_advisory_lock(12345);
SELECT pg_advisory_unlock(12345);
```

### G.24

```sql
BEGIN;
SELECT pg_advisory_xact_lock(42);
COMMIT;
```

### G.25

```sql
SELECT * FROM pg_stat_progress_vacuum;
```

### G.26

```sql
VACUUM (VERBOSE, ANALYZE) t;
```

### G.27

```sql
CHECKPOINT;
```

### G.28

```sql
SELECT * FROM pg_stat_database_conflicts WHERE datname = current_database();
```

### G.29

```sql
SELECT * FROM pg_stat_subscription; -- logical repl conflicts context
```

### G.30

```sql
SELECT pg_current_snapshot();
```

---

## Appendix H. Failure handling in apps

Map `40001`, `40P01`, `23505` (unique) to retry with backoff jitter.

---

## Appendix I. Design guidelines

- Keep invariants in DB constraints.
- Minimize cross-service two-phase commits.
- Prefer single-database transactions for local consistency.

---

## Appendix J. Read phenomena expanded

### J.1 Non-repeatable read example narrative

Txn A reads balance 100; txn B updates to 80 and commits; txn A reads again under read committed—sees 80.

### J.2 Phantom example

Txn A counts rows matching filter; txn B inserts matching row; txn A counts again under read committed—count changes.

### J.3 Write skew sketch

Two doctors on call: each checks count >=1 and tries to go off duty—both succeed—violates invariant unless serializable/locking.

---

## Appendix K. Lock modes (conceptual)

- `ACCESS SHARE` vs `ACCESS EXCLUSIVE` for DDL operations.
- Row-level `FOR UPDATE` conflicts with writers.

---

## Appendix L. Benchmarking transactions

Use `pgbench` with custom scripts including `BEGIN/COMMIT` boundaries.

---

## Appendix M. Testing transactions

Use isolated databases; concurrent pytest/xdist sessions against same rows to surface races.

---

## Appendix N. Disaster recovery tie-in

WAL + base backups enable PITR; transactions define durability points.

---

## Appendix O. Common mistakes list

- Swallowing aborted transaction state.
- No retry for serialization.
- Long transactions in ORM “session”.
- Locking tables unnecessarily.
- Using serializable everywhere.

---

## Appendix P. Interview questions

### P.1 Difference READ COMMITTED vs REPEATABLE READ

Snapshot duration per statement vs transaction.

### P.2 What is MVCC

Row versions, xmin/xmax, visibility rules.

### P.3 How deadlocks resolved

Detector kills one txn.

---

## Appendix Q. Extra narrative practices

### Q.1 Financial systems

Use constraints + short transactions + `FOR UPDATE` on hot rows + retries.

### Q.2 Inventory

Beware oversell under read committed—use appropriate isolation or row locks.

### Q.3 Analytics

Use read-only transactions or replicas; avoid long write txns.

### Q.4 Migrations

Prefer online migrations: additive schema, backfill, swap, no giant locking rewrite when possible.

### Q.5 Multi-tenant

RLS interacts with transactions normally—test per tenant concurrency.

### Q.6 Queue workers

`SKIP LOCKED` for work acquisition (pattern) reduces lock contention.

### Q.7 Event sourcing

Append-only inserts with transactional outbox pattern.

### Q.8 Saga vs 2PC

Sagas compensate; 2PC strong but operationally heavy.

### Q.9 Cursors

Hold transactions open—dangerous for duration.

### Q.10 ORMs

Understand flush/commit boundaries; avoid implicit long sessions.

---

## Appendix R. SQL: SKIP LOCKED pattern sketch

```sql
BEGIN;
SELECT * FROM jobs
WHERE status = 'queued'
ORDER BY id
FOR UPDATE SKIP LOCKED
LIMIT 1;
-- mark processing
COMMIT;
```

---

## Appendix S. SQL: NOWAIT pattern sketch

```sql
SELECT * FROM t WHERE id = 1 FOR UPDATE NOWAIT;
```

---

## Appendix T. Final checklist

- [ ] Retry serialization/deadlock  
- [ ] Timeouts configured  
- [ ] Avoid idle in txn  
- [ ] Lock ordering discipline  
- [ ] Monitor WAL and bloat  

---

## Appendix U. Extended exercises (SQL + operations)

### U.1 Simulate serialization failure handling (pseudo)

1. `BEGIN ISOLATION LEVEL SERIALIZABLE;`
2. Read/write pattern that conflicts in another session.
3. On commit failure `40001`, `ROLLBACK` and retry with exponential backoff.

### U.2 `pg_stat_activity` fields to watch

`state`, `wait_event_type`, `wait_event`, `xact_start`, `query_start`, `backend_type`.

### U.3 Find oldest xmin

Long transactions show up as old `xmin` horizons—use monitoring queries tailored to your platform (RDS, self-hosted).

### U.4 `synchronous_commit` tradeoff

Turning off for a session speeds commits but risks losing recent transactions on crash—document risk.

### U.5 `fsync` and durability

Never disable `fsync` outside disposable environments.

### U.6 Prepared transactions caution

Two-phase prepared transactions can linger—monitor `pg_prepared_xacts`.

### U.7 Logical replication conflicts

Different failure modes vs physical replication—transactions still central.

### U.8 Read-only replicas

Offload heavy selects; still respect snapshot visibility and replication lag.

### U.9 Hot standby conflicts

Long queries on replica can conflict with WAL apply— tune `max_standby_streaming_delay`.

### U.10 Vacuum blocked by long txn

Symptom: bloat grows; autovacuum cannot remove dead rows—terminate offending sessions carefully.

### U.11 `lock_timeout` in migrations

Set during `CREATE INDEX CONCURRENTLY` companion operations carefully—know lock queue behavior.

### U.12 `DEALLOCATE ALL` / prepared statements

Connection poolers interact with prepared statements—test transaction boundaries.

### U.13 JDBC autocommit

Understand when driver batches and when implicit commits occur.

### U.14 psycopg transactions

Use context managers to ensure `commit`/`rollback`.

### U.15 Node pg transactions

`BEGIN` via `client.query('BEGIN')` then explicit `COMMIT`.

### U.16 ORM flush vs commit

Know when SQL is emitted.

### U.17 Testing deadlock

Script two sessions with staggered `FOR UPDATE` order.

### U.18 Testing serialization

Concurrent increment counters under serializable—observe retries.

### U.19 Benchmarking with contention

`pgbench` custom scripts with hotspot row updates.

### U.20 Monitoring lock waits

Alert on sustained `wait_event = 'Lock'`.

### U.21 `pg_locks` join to activity

Correlate blocked and blocking sessions.

### U.22 `idle in transaction` alarms

Critical operational metric.

### U.23 `statement_timeout` for ad hoc tools

Protect analysts from accidental full-table scans in writable txns.

### U.24 `transaction_timeout` (if used)

Newer settings may appear—verify version-specific docs.

### U.25 Backup during heavy writes

WAL archiving rate spikes—ensure disk capacity.

### U.26 PITR recovery

Transactions define recoverable points—WAL replay respects commit records.

### U.27 Crash recovery narrative

After crash, PostgreSQL replays WAL from last checkpoint.

### U.28 Split brain note

Not transaction-level, but HA failover interacts with durability guarantees.

### U.29 `COPY FREEZE` nuance

Advanced bulk load interactions with visibility map—study docs before use.

### U.30 `TRUNCATE` transactionality

`TRUNCATE` is transactional but different lock profile than `DELETE`.

---

## Appendix V. Extra SQL snippets

### V.1

```sql
SELECT pg_backend_pid();
```

### V.2

```sql
SELECT pg_blocking_pids(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid();
```

### V.3

```sql
SELECT relation::regclass, mode, granted FROM pg_locks WHERE relation IS NOT NULL LIMIT 50;
```

### V.4

```sql
BEGIN;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT 1;
COMMIT;
```

### V.5

```sql
BEGIN;
SET LOCAL synchronous_commit = OFF;
INSERT INTO noncritical_log VALUES ('x');
COMMIT;
```

### V.6

```sql
SELECT txid_status(txid_current());
```

### V.7

```sql
SELECT * FROM pg_stat_activity WHERE backend_xmin IS NOT NULL ORDER BY xact_start NULLS LAST LIMIT 20;
```

### V.8

```sql
SELECT age(now(), xact_start) AS txn_age, query FROM pg_stat_activity WHERE state = 'idle in transaction';
```

### V.9

```sql
SELECT * FROM pg_stat_database WHERE datname = current_database();
```

### V.10

```sql
SELECT * FROM pg_stat_wal;
```

### V.11

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) FROM pg_replication_slots;
```

### V.12

```sql
SELECT * FROM pg_replication_slots;
```

### V.13

```sql
SELECT * FROM pg_stat_replication;
```

### V.14

```sql
SELECT now(), statement_timestamp(), timeofday();
```

### V.15

```sql
BEGIN;
SELECT txid_current_if_assigned();
COMMIT;
```

### V.16

```sql
SELECT * FROM pg_stat_progress_cluster;
```

### V.17

```sql
SELECT * FROM pg_stat_progress_create_index;
```

### V.18

```sql
SELECT * FROM pg_stat_progress_basebackup;
```

### V.19

```sql
SELECT * FROM pg_stat_slru;
```

### V.20

```sql
SELECT * FROM pg_stat_checkpointer;
```

### V.21

```sql
SELECT * FROM pg_stat_io;
```

### V.22

```sql
SELECT * FROM pg_stat_bgwriter;
```

### V.23

```sql
SELECT * FROM pg_stat_archiver;
```

### V.24

```sql
SELECT * FROM pg_stat_subscription_stats;
```

### V.25

```sql
SELECT pg_reload_conf();
```

### V.26

```sql
SHOW max_connections;
```

### V.27

```sql
SHOW shared_buffers;
```

### V.28

```sql
SHOW wal_buffers;
```

### V.29

```sql
SHOW checkpoint_timeout;
```

### V.30

```sql
SHOW log_lock_waits;
```

---

## Appendix W. Closing guidance

These transaction notes are intentionally operations-heavy: durability and concurrency are as much about configuration and client behavior as about SQL keywords.

---

*End of notes.*
