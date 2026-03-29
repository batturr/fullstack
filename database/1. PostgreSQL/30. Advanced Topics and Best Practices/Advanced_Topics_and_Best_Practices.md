# Advanced Topics and Best Practices

**PostgreSQL learning notes (March 2026). Topic aligned with README topic 30.**

## 📑 Table of Contents

- [1. Database Design Principles](#1-database-design-principles)
- [2. Scalability Strategies](#2-scalability-strategies)
- [3. Disaster Recovery Planning (RTO/RPO)](#3-disaster-recovery-planning-rtorpo)
- [4. Security Hardening](#4-security-hardening)
- [5. Performance Benchmarking](#5-performance-benchmarking)
- [6. Capacity Planning](#6-capacity-planning)
- [7. Multi-Tenant Architecture](#7-multi-tenant-architecture)
- [8. Data Archival & Retention](#8-data-archival--retention)
- [9. Version Upgrade Strategy](#9-version-upgrade-strategy)
- [10. Incident Management](#10-incident-management)
- [11. Documentation & Runbooks](#11-documentation--runbooks)
- [12. Community & Support](#12-community--support)
- [13. Future Features & Roadmap](#13-future-features--roadmap)
- [14. Industry Best Practices](#14-industry-best-practices)

---

## 1. Database Design Principles

<a id="1-database-design-principles"></a>

### Beginner

Relational design organizes data into tables with keys and relationships. Normalization reduces redundancy (1NF–3NF and beyond). Primary keys uniquely identify rows; foreign keys express relationships. Good names, consistent conventions, and constraints at the database layer protect data quality.

### Intermediate

Balance normalization with query patterns: sometimes controlled denormalization (cached columns, materialized views) improves read performance at write cost. Use domains, check constraints, and enums thoughtfully. Prefer surrogate keys when natural keys are unstable.

### Expert

Experts model aggregates and invariants explicitly, choose partitioning up front for huge tables, and design for operational concerns (vacuum, index bloat, logical replication limitations). They document access patterns and expected cardinalities.

```sql
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_format CHECK (email LIKE '%@%')
);
```

```sql
CREATE TABLE orders (
  id bigserial PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id),
  total_cents int NOT NULL CHECK (total_cents >= 0)
);
```

```sql
-- Controlled denormalization example: store balance with triggers maintained externally
ALTER TABLE accounts ADD COLUMN balance_cents bigint NOT NULL DEFAULT 0;
```

### Key Points

- Constraints are documentation that executes.
- Over-normalization can harm latency for read-heavy dashboards.
- Under-normalization invites update anomalies.
- UUID vs bigint keys trade insertion locality vs global uniqueness.
- Partial unique indexes encode business rules elegantly.
- Soft deletes complicate uniqueness—model carefully.
- Time zones should be `timestamptz` at boundaries.

### Best Practices

- Schema review checklist for every new table.
- ER diagrams checked into Git.
- Naming conventions for keys, indexes, constraints.

### Common Mistakes

- Nullable unique keys with unintended multiple NULL behavior misunderstandings.
- Storing money as float.

---

## 2. Scalability Strategies

<a id="2-scalability-strategies"></a>

### Beginner

Vertical scaling upgrades CPU/RAM/disk on one server. Horizontal scaling adds nodes: read replicas for reads, sharding/partitioning for very large datasets, or distributed extensions (Citus) for multi-node scale.

### Intermediate

Partition large tables by time or key ranges to prune scans. Use read replicas with explicit staleness policies. Cache at app layer for hot keys. Consider connection poolers to support many app instances.

### Expert

Experts measure bottlenecks before sharding—often indexing and query fixes suffice. They design shard keys to avoid hotspots, plan cross-shard queries carefully, and evaluate consistency models under partitions.

```sql
CREATE TABLE events (
  id bigserial,
  created_at date not null,
  payload jsonb not null,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
```

```sql
CREATE TABLE events_2026_01 PARTITION OF events
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

```yaml
scale:
  reads: replicas_and_cache
  writes: partition_or_shard_or_scale_up
```

### Key Points

- Sharding is a last resort complexity-wise for many teams.
- Hot partitions undermine partition benefits—choose keys wisely.
- Replicas scale reads, not writes on primary.
- Connection storms masquerade as DB CPU limits.
- CQRS patterns separate read models for scale.
- Event-driven architectures reduce synchronous DB coupling.
- Global sequences don’t exist across shards—plan IDs.

### Best Practices

- Load test at 2–3× expected peak annually.
- Maintain architecture decision records for scale choices.

### Common Mistakes

- Premature sharding without metrics.
- Using OFFSET pagination at scale.

---

## 3. Disaster Recovery Planning (RTO/RPO)

<a id="3-disaster-recovery-planning-rtorpo"></a>

### Beginner

RPO is maximum acceptable data loss time; RTO is maximum acceptable downtime. Backups and replication reduce RPO; runbooks and automation reduce RTO. DR is untested until restores succeed.

### Intermediate

Combine logical backups (`pg_dump`), physical backups (base backup + WAL), and replication. Test restores quarterly. Document who declares disasters and who promotes replicas.

### Expert

Experts run game days, validate checksums, measure end-to-end client recovery, and align multi-region networking. They map control failures (credentials, DNS) into DR exercises.

```bash
pg_dump -Fc -d app > app-$(date -u +%F).dump
pg_restore --jobs=4 -d app_new app.dump
```

```yaml
dr:
  rpo_minutes: 15
  rto_minutes: 60
  last_restore_test: "YYYY-MM-DD"
```

### Key Points

- Backups without tested restores are wishful thinking.
- Replication ≠ backup (logical errors replicate).
- WAL archiving enables PITR with proper base backups.
- Cross-region latency affects sync replication feasibility.
- Runbooks must include communication templates.
- Legal/compliance may dictate retention minimums.
- Partial restores need dependency ordering.

### Best Practices

- Automate restore verification queries.
- Store backups immutably when ransomware is a threat model.

### Common Mistakes

- Assuming cloud snapshots alone satisfy all restore scenarios.

---

## 4. Security Hardening

<a id="4-security-hardening"></a>

### Beginner

Use least privilege roles, strong passwords or IAM auth, TLS for connections, and restrict network access. Disable unnecessary extensions. Keep Postgres patched.

### Intermediate

Implement Row-Level Security for multi-tenant data. Rotate credentials. Use `pg_hba.conf` or cloud equivalents to enforce TLS and IP allowlists. Audit with logging/pgAudit where required.

### Expert

Experts integrate vaults, enforce MFA for human access paths, scan for public exposure, and run periodic permission reviews. They threat-model lateral movement from compromised apps.

```sql
CREATE ROLE app_rw NOLOGIN;
GRANT CONNECT ON DATABASE app TO app_rw;
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
```

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON invoices
USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Key Points

- Superuser should be rare and audited.
- RLS is not a replacement for app auth bugs—defense in depth.
- TLS without verification is weak.
- `search_path` attacks are real—pin schemas.
- Extensions increase attack surface—curate allow lists.
- Column privileges can refine sensitive fields.
- Secrets belong in managers, not repos.

### Best Practices

- Quarterly access reviews with automated role exports.
- Separate break-glass accounts with extra monitoring.

### Common Mistakes

- Granting ALL to application roles “to save time”.

---

## 5. Performance Benchmarking

<a id="5-performance-benchmarking"></a>

### Beginner

Use `pgbench` for synthetic tests. Define goals (TPS, p95 latency). Keep environments stable while measuring. Record Postgres version and settings with results.

### Intermediate

Build custom workloads mirroring critical queries. Use `EXPLAIN ANALYZE` on candidates. Track WAL, checkpoints, and replication lag during tests.

### Expert

Experts regression-test planner changes across upgrades, use flame graphs on hosts for CPU stalls, and integrate benchmarks into release gates for critical services.

```bash
pgbench -i -s 100 pgbench
pgbench -M prepared -c 32 -j 8 -T 600 -P 5 pgbench
```

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM pgbench_accounts WHERE aid = 42;
```

### Key Points

- Benchmarks without latency percentiles mislead.
- Cold vs warm cache results differ massively.
- Client driver and pool settings affect outcomes.
- Long tests reveal checkpoint interactions.
- Compare like hardware; normalize vCPU classes.
- Record dataset size explicitly.
- Noise exists—repeat and average.

### Best Practices

- Store results in a time-series DB or spreadsheet history.
- Tag results with Git SHAs of schema migrations.

### Common Mistakes

- Benchmarking on laptops with thermal throttling.

---

## 6. Capacity Planning

<a id="6-capacity-planning"></a>

### Beginner

Forecast growth in data size, query volume, and connection counts. Monitor disk trending, table bloat, and peak CPU. Plan purchases or cloud resizing before emergencies.

### Intermediate

Model headroom with quarterly reviews. Include WAL, backups, indexes, and temp space. Evaluate when to partition or archive.

### Expert

Experts simulate marketing events, incorporate seasonality, and tie capacity to finance forecasts. They automate “days until disk full” estimates.

```sql
SELECT pg_size_pretty(sum(pg_database_size(datname))::bigint) FROM pg_database;
```

```sql
SELECT relname, pg_size_pretty(pg_total_relation_size(oid))
FROM pg_class WHERE relkind='r' ORDER BY pg_total_relation_size(oid) DESC LIMIT 20;
```

### Key Points

- Indexes and TOAST inflate storage needs.
- Autovacuum and maintenance need CPU headroom too.
- Network egress can dominate cost at scale.
- Read replicas duplicate storage costs.
- Connection limits can cap scale before CPU.
- Managed services have SKU ceilings—plan migrations early.
- Cold data archival changes growth curves.

### Best Practices

- Dashboard 30/60/90-day disk forecasts.
- Document scale triggers (when to shard, when to resize).

### Common Mistakes

- Planning only for average load, ignoring peak weekends.

---

## 7. Multi-Tenant Architecture

<a id="7-multi-tenant-architecture"></a>

### Beginner

Tenants share software; isolation can be per-database, per-schema, or shared schema with a `tenant_id` column. Isolation requirements drive the choice.

### Intermediate

RLS enforces tenant boundaries in shared schema designs. Separate schemas simplify backups per tenant but complicate migrations. Connection pooling still centralizes resources.

### Expert

Experts evaluate noisy neighbor performance, per-tenant restore needs, compliance boundaries, and cost allocation. They may shard largest tenants.

```sql
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_records ON records
USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Key Points

- Isolation failures are security incidents.
- Migration scripts must be multi-tenant safe.
- Large tenants may need dedicated resources.
- Backup/restore per tenant differs by model.
- Search paths and views can leak data if sloppy.
- Testing should include cross-tenant negative tests.
- Billing metrics often come from tenant-scoped aggregates.

### Best Practices

- Automated tests that attempt cross-tenant access.
- Clear onboarding/offboarding runbooks (export data).

### Common Mistakes

- Relying only on app middleware without DB enforcement.

---

## 8. Data Archival & Retention

<a id="8-data-archival--retention"></a>

### Beginner

Retention policies define how long data lives. Archival moves cold rows to cheaper storage (S3, separate tables) while keeping schema online. Deletes must respect foreign keys.

### Intermediate

Partition by time and detach/drop old partitions for efficient removal. Batch deletes in transactions with throttling to avoid long locks. Legal holds override deletion.

### Expert

Experts implement temporal tables or status columns, use background jobs with checkpoints, and verify restores from archives independently.

```sql
ALTER TABLE events DETACH PARTITION events_2023_01;
-- archive externally, then drop table when legally allowed
```

```sql
DELETE FROM logs WHERE created_at < now() - interval '365 days' AND tenant_id = $1;
```

### Key Points

- Bulk deletes can bloat tables—follow with vacuum planning.
- Regulatory regimes differ (GDPR, HIPAA)—consult experts.
- Archival without indexes on archive stores complicates retrieval.
- Cryptographic erasure may be required for secrets.
- Replication carries deletes—coordinate cutovers.
- Soft-delete tables grow forever without pruning.
- Audit who can bypass retention tooling.

### Best Practices

- Legal/compliance sign-off on retention matrices.
- Periodic restore drills from archive media.

### Common Mistakes

- Hard-deleting without backups during code bugs.

---

## 9. Version Upgrade Strategy

<a id="9-version-upgrade-strategy"></a>

### Beginner

Major upgrades can use `pg_upgrade` or dump/restore/logical replication. Minor upgrades often package manager updates. Always read release notes.

### Intermediate

Test in staging with production snapshots. Run `ANALYZE` after upgrades. Check extension compatibility matrices. Plan downtime windows or logical replication cutovers.

### Expert

Experts automate verification queries, capture planner diffs, and maintain rollback positions when feasible. They schedule upgrades with global timezone empathy.

```bash
pg_upgrade --check
```

```sql
SELECT extname, extversion FROM pg_extension ORDER BY 1;
```

### Key Points

- Extensions can block upgrades—check early.
- Statistics may need rebuild—plan time.
- Replication slots complicate transitions—inventory them.
- Client drivers may need updates for new auth methods.
- Parallel `pg_upgrade` reduces downtime on large clusters.
- Logical replication may help cross-major with minimal downtime.
- Deprecated features may break apps—grep codebases.

### Best Practices

- Maintain an upgrade playbook with owners and timelines.
- Snapshot configs pre-upgrade.

### Common Mistakes

- Skipping extension upgrades until production day.

---

## 10. Incident Management

<a id="10-incident-management"></a>

### Beginner

Declare severity, assign incident commander, communicate status, and log timeline events. Focus on mitigation before root cause when users are down.

### Intermediate

Use structured updates (“what we know”, “what we don’t”, “next update time”). Pair DB metrics with app metrics. Capture SQL and `pg_stat_activity` snapshots early.

### Expert

Experts run blameless postmortems, update runbooks with discovered gaps, and track action items to completion. They integrate incidents with SRE error budgets.

```yaml
incident:
  roles: [incident_commander, communications, db_owner]
  severity_levels: [SEV1, SEV2, SEV3]
```

### Key Points

- Panic increases human error—use checklists.
- Long incidents need shift rotation.
- Customer comms should avoid speculative promises.
- Preserve evidence (logs, metrics snapshots) before TTL expiry.
- Rollbacks are valid mitigations.
- Security incidents have distinct workflows.
- Practice makes response calmer.

### Best Practices

- Timeboxed debugging steps to avoid rabbit holes.
- Automatic staging of “break glass” credentials access logs.

### Common Mistakes

- Debugging in production without a safety buddy.

---

## 11. Documentation & Runbooks

<a id="11-documentation--runbooks"></a>

### Beginner

Document architecture diagrams, connection info (via secret references), common queries, and on-call expectations. Runbooks are step lists for repeated operations.

### Intermediate

Store docs near code (README, ADRs). Include rollback for each change. Keep environment parity notes. Add troubleshooting trees for replication lag, disk full, and connection exhaustion.

### Expert

Experts treat documentation as code: reviewed in PRs, tested via game days, and audited for stale endpoints. They auto-generate schema docs where possible.

```markdown
## Failover runbook (outline)
1. Confirm severity and customer impact
2. Snapshot replication lag metrics
3. Promote standby via <tool>
4. Repoint apps via <DNS/Terraform>
5. Rebuild old primary as new replica
6. Post-incident review scheduled
```

### Key Points

- Stale docs harm more than no docs if trusted wrongly.
- Runbooks should include verification queries.
- Ownership fields prevent ambiguity.
- Link dashboards directly.
- Include vendor console deep links.
- Version-control changes to infra alongside apps.
- Onboarding should consume docs in <1 day.

### Best Practices

- Monthly “doc freshness” review ticket.
- Require runbook updates when incidents reveal gaps.

### Common Mistakes

- Storing secrets inside runbooks.

---

## 12. Community & Support

<a id="12-community--support"></a>

### Beginner

PostgreSQL has a global open-source community: mailing lists, IRC/Slack bridges, conferences (PGConf), and local meetups. Respect community norms; provide reproducible examples when asking questions.

### Intermediate

Search archives before asking. Share `EXPLAIN`, version, and schema when requesting help. Consider professional support vendors for production SLAs.

### Expert

Experts contribute patches, write blog posts with reproducible benchmarks, and mentor juniors via pair debugging. They understand release management and security reporting channels.

```text
Minimum bug report ingredients:
- PostgreSQL version (SELECT version();)
- OS and hardware class
- Minimal schema + query reproducer
- EXPLAIN (ANALYZE, BUFFERS) if plan-related
```

### Key Points

- Community time is voluntary—make questions easy to answer.
- CVE fixes land in supported versions—stay current.
- Conferences accelerate learning curves.
- Local user groups build hiring pipelines.
- Commercial support complements internal SRE teams.
- Licensing is liberal but respect trademarks appropriately.
- Toxic behavior harms everyone—be kind.

### Best Practices

- Maintain an internal knowledge base linking to canonical upstream docs.
- Sponsor Postgres events if your company benefits heavily.

### Common Mistakes

- Sharing production data in public forums.

---

## 13. Future Features & Roadmap

<a id="13-future-features--roadmap"></a>

### Beginner

PostgreSQL evolves with yearly major releases (historically ~September). Deprecations and new features appear in release notes. Planning upgrades requires reading “E.20” style sections.

### Intermediate

Track commit fests and RFC discussions for upcoming planner improvements, parallelism, JSON enhancements, and replication features. Test beta releases in disposable clusters only.

### Expert

Experts participate in beta testing for workloads they represent, provide reproducible regressions, and maintain internal roadmaps aligned with Postgres timelines plus extension ecosystems.

```sql
SELECT current_setting('server_version_num')::int AS server_version_num;
```

```yaml
roadmap:
  track: postgresql_release_notes
  extensions: [pg_stat_statements, pgaudit]
  revisit: quarterly
```

### Key Points

- Future features are not promises until released—validate on GA.
- Extension authors may lag major releases—plan buffer time.
- SQL standard alignment continues—syntax may evolve.
- Some features start experimental—read docs carefully.
- Cloud vendors cherry-pick versions—know your effective roadmap.
- Deprecations may start as warnings—grep logs after upgrades.
- Performance improvements can change planner choices silently.

### Best Practices

- Subscribe to release announcement lists.
- Maintain an internal compatibility matrix for drivers and extensions.

### Common Mistakes

- Shipping beta features to production without support plans.

---

## 14. Industry Best Practices

<a id="14-industry-best-practices"></a>

### Beginner

Use transactions correctly, index thoughtfully, monitor basics, and backup regularly. Write readable SQL and code-review database changes.

### Intermediate

Adopt migration tooling, automated tests for constraints, and performance budgets in CI. Enforce style guides (SQLFluff or similar). Instrument apps with traces.

### Expert

Experts implement SLOs, error budgets, chaos testing for failovers, and continuous cost optimization. They align DB design with product analytics needs without compromising integrity.

```sql
BEGIN;
SET LOCAL statement_timeout = '2s';
-- critical OLTP statement
COMMIT;
```

```yaml
engineering_practices:
  code_review: required_for_schema_changes
  load_tests: before_black_friday
  backups: tested_restores_quarterly
```

### Key Points

- Best practices evolve—revisit annually.
- Culture beats tools alone (blameless reviews).
- Security and performance are everyone’s job, not only DBAs.
- Small, frequent releases reduce risk.
- Documentation and automation compound over years.
- Diversity of perspectives improves schema design reviews.
- Sustainable on-call requires actionable alerts only.

### Best Practices

- Treat databases as products with owners and roadmaps.
- Invest in onboarding simulations using sanitized prod snapshots.

### Common Mistakes

- Hero culture where only one person can touch production.

---

## Appendix: Advanced SQL Patterns for Healthy Operations

```sql
-- Health: connections by state
SELECT state, count(*) FROM pg_stat_activity GROUP BY 1 ORDER BY 2 DESC;
```

```sql
-- Health: oldest idle-in-transaction
SELECT pid, now()-xact_start AS xact_age, left(query,200)
FROM pg_stat_activity
WHERE state ILIKE 'idle in transaction%'
ORDER BY xact_age DESC LIMIT 20;
```

```sql
-- Health: top sequential scans
SELECT relname, seq_scan, idx_scan FROM pg_stat_user_tables ORDER BY seq_scan DESC LIMIT 20;
```

### Key Points (Appendix Health)

- Operational health queries should be saved as views or monitoring checks.

### Best Practices (Appendix Health)

- Run health queries from a read-only monitoring role.

### Common Mistakes (Appendix Health)

- Running heavy catalog scans on tiny instances during peak.

---

## Extended Appendix: Governance, Quality, and Delivery

### Governance — schema change approval template

```yaml
change:
  id: CHG-12345
  author: team-payments
  risk: medium
  rollback: "revert migration v77; restore replica if needed"
  metrics:
    - p95_checkout_latency
    - db_cpu
    - replication_lag
```

### Key Points (Governance)

- Risk classification should map to approval tiers.

### Best Practices (Governance)

- Require metrics links in change tickets.

### Common Mistakes (Governance)

- “Low risk” labels used to bypass review habitually.

---

### Quality — SQL style snippet

```sql
SELECT
  o.id,
  o.created_at,
  c.name AS customer_name
FROM orders AS o
JOIN customers AS c
  ON c.id = o.customer_id
WHERE o.created_at >= timestamptz '2026-01-01'
ORDER BY o.created_at DESC
LIMIT 100;
```

### Key Points (Style)

- Consistent formatting aids diffs in code review.

### Best Practices (Style)

- Adopt SQLFluff or similar in CI for large teams.

### Common Mistakes (Style)

- Inconsistent alias naming obscuring join logic.

---

### Delivery — blue/green database pattern (conceptual)

```text
Deploy app v2 against schema compatible with v1 and v2 (expand phase), migrate traffic, then contract schema after v1 drained.
```

### Key Points (Blue/Green)

- Contract too early breaks old binaries still running.

### Best Practices (Blue/Green)

- Feature flags coordinate schema usage across versions.

### Common Mistakes (Blue/Green)

- Deploying app and schema changes in a single atomic step without compatibility window.

---

### Reliability — idempotency keys

```sql
CREATE TABLE idempotency_keys (
  key text PRIMARY KEY,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### Key Points (Idempotency)

- Protects against duplicate charges on retries.

### Best Practices (Idempotency)

- TTL or partition old keys to control growth.

### Common Mistakes (Idempotency)

- Storing full PAN/PII in idempotency payloads.

---

### Reliability — outbox + consumer

```sql
UPDATE outbox SET processed_at = now() WHERE id = $1 AND processed_at IS NULL;
```

### Key Points (Outbox consumer)

- Process rows in `FOR UPDATE SKIP LOCKED` batches for concurrency.

### Best Practices (Outbox consumer)

- Dead-letter queues for poison messages.

### Common Mistakes (Outbox consumer)

- Consumers assuming exactly-once delivery without dedupe.

---

### Security — column-level grants

```sql
REVOKE ALL ON TABLE users FROM PUBLIC;
GRANT SELECT (id, display_name) ON users TO app_reporting;
```

### Key Points (Column grants)

- Useful for analytics roles with limited PII exposure.

### Best Practices (Column grants)

- Pair with views for complex projections.

### Common Mistakes (Column grants)

- Forgetting that some access paths bypass column grants via SECURITY DEFINER views.

---

### Security — `search_path` hardening

```sql
ALTER ROLE app SET search_path = public, pg_temp;
```

### Key Points (search_path)

- Reduces object hijack risks in untrusted schemas.

### Best Practices (search_path)

- Schema-qualify security-sensitive object references anyway.

### Common Mistakes (search_path)

- Assuming ORMs always schema-qualify.

---

### Performance — partial index example

```sql
CREATE INDEX CONCURRENTLY orders_open_due_idx
ON orders (due_at)
WHERE status = 'open';
```

### Key Points (Partial)

- Smaller indexes, faster writes, targeted queries.

### Best Practices (Partial)

- Ensure query predicates match index predicate exactly.

### Common Mistakes (Partial)

- Predicate mismatch causing sequential scans.

---

### Performance — BRIN for huge time series

```sql
CREATE INDEX events_created_brin ON events USING brin (created_at);
```

### Key Points (BRIN)

- Great for append-mostly time series with correlation.

### Best Practices (BRIN)

- Validate with `EXPLAIN` on realistic ranges.

### Common Mistakes (BRIN)

- Using BRIN for random-access lookups.

---

### Scalability — connection budget worksheet (text)

```text
pods = 50
pool_max_per_pod = 20
raw_max = 1000
postgres_max_connections = 300
=> oversubscribed; reduce pool_max or pods or add pooler.
```

### Key Points (Budget)

- Math beats intuition for connection storms.

### Best Practices (Budget)

- Add to service templates in internal developer portal.

### Common Mistakes (Budget)

- Forgetting admin and replication connections in totals.

---

### DR — RPO/RTO table template

| Scenario | RPO | RTO | Mechanism |
|---------|-----|-----|-----------|
| Accidental delete | 5m | 30m | PITR |
| AZ loss | 0* | 15m | HA failover |
| Region loss | hours | hours | cross-region replica |

*0 only with sync replication and successful failover—validate claims.

### Key Points (RPO table)

- Star claims require footnotes and tests.

### Best Practices (RPO table)

- Review quarterly with product/legal.

### Common Mistakes (RPO table)

- Advertising RPO=0 with async replication.

---

### Compliance — audit trail columns

```sql
ALTER TABLE contracts
  ADD COLUMN created_by text,
  ADD COLUMN updated_by text,
  ADD COLUMN updated_at timestamptz;
```

### Key Points (Audit columns)

- Triggers or app layers maintain values consistently.

### Best Practices (Audit columns)

- Pair with append-only event tables for high assurance.

### Common Mistakes (Audit columns)

- Trusting client-supplied user ids without authentication binding.

---

### Multi-tenant — connection setting discipline

```sql
BEGIN;
SET LOCAL app.tenant_id = '...';
-- queries
COMMIT;
```

### Key Points (SET LOCAL)

- Must be paired with RLS policies using `current_setting`.

### Best Practices (SET LOCAL)

- Centralize in middleware; forbid ad hoc per-query forgetfulness.

### Common Mistakes (SET LOCAL)

- Poolers reusing sessions without resetting GUCs—use transaction pooling carefully.

---

### Archival — partition detach automation sketch

```sql
-- Monthly job (pseudologic): detach old partition, export, drop when approved
-- ALTER TABLE events DETACH PARTITION events_2024_01;
```

### Key Points (Automation)

- Approvals should be automated gates with human sign-off for legal holds.

### Best Practices (Automation)

- Store exported files with checksum manifests.

### Common Mistakes (Automation)

- Dropping partitions before verifying export integrity.

---

### Upgrade — extension version check

```sql
SELECT extname, extversion FROM pg_extension ORDER BY 1;
```

### Key Points (Extensions)

- Pin extension versions in migration notes.

### Best Practices (Extensions)

- Test `ALTER EXTENSION ... UPDATE` paths in staging.

### Common Mistakes (Extensions)

- Assuming extensions auto-upgrade during `pg_upgrade`.

---

### Incident comms template

```markdown
Status: investigating
Impact: checkout errors for ~10% users
Mitigation: scaled API pods; DB connections stabilizing
Next update: 15 minutes
```

### Key Points (Comms)

- Brevity and honesty build trust.

### Best Practices (Comms)

- Link to status page; avoid blame in initial updates.

### Common Mistakes (Comms)

- Promising ETAs without evidence.

---

### Postmortem template (outline)

```markdown
## Summary
## Timeline (UTC)
## Root cause
## What went well
## What went poorly
## Action items (owner, date)
```

### Key Points (Postmortem)

- Action items need owners and deadlines.

### Best Practices (Postmortem)

- Track completion in ticketing system.

### Common Mistakes (Postmortem)

- Skipping follow-through after the meeting.

---

### Interview prompts — internal leveling

### Key Points (Interviews)

- Ask candidates to explain MVCC trade-offs and vacuum impact.

### Best Practices (Interviews)

- Use real `EXPLAIN` artifacts from sanitized workloads.

### Common Mistakes (Interviews)

- Only asking trivia about SQL keywords.

---

### Career development — learning plan

```yaml
quarterly_goals:
  - complete_one_contribution_to_docs_or_tests
  - run_one_failover_drill
  - optimize_one_top_query_with_measured_impact
```

### Key Points (Career)

- Depth in Postgres pairs well with breadth in systems engineering.

### Best Practices (Career)

- Present learnings internally via lunch talks.

### Common Mistakes (Career)

- Only learning via production incidents (high stress, narrow lessons).

---

### Ethics & data minimization

```text
Store the minimum fields necessary. Delete aggressively when legal. Log carefully.
```

### Key Points (Ethics)

- Databases are long-lived; mistakes persist.

### Best Practices (Ethics)

- Privacy reviews for new tables with PII.

### Common Mistakes (Ethics)

- Dumping production to laptops without encryption.

---

### Final synthesis — “definition of healthy Postgres”

```yaml
healthy_postgres:
  backups_tested: true
  replication_lag_within_slo: true
  vacuum_keep_up: true
  top_queries_reviewed_monthly: true
  access_least_privilege: true
  upgrades_planned: true
```

### Key Points (Synthesis)

- Health is multidimensional; no single metric suffices.

### Best Practices (Synthesis)

- Scorecard monthly in engineering leadership reviews.

### Common Mistakes (Synthesis)

- Declaring health because CPU is low today.

---

## Extended Appendix: Additional SQL & Checklists

```sql
-- Constraint hygiene: find tables missing primary keys (public schema example)
SELECT c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i WHERE i.indrelid = c.oid AND i.indisprimary
  )
ORDER BY 1;
```

```sql
-- Foreign keys without supporting indexes (common join performance issue)
SELECT c.conname, rel.relname AS table_name
FROM pg_constraint c
JOIN pg_class rel ON rel.oid = c.conrelid
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_index i
    WHERE i.indrelid = c.conrelid
      AND (c.conkey::int[] <@ i.indkey::int[] OR i.indkey::int[] @> c.conkey::int[])
  )
ORDER BY 1
LIMIT 50;
```

```sql
-- Quick lock overview
SELECT mode, granted, count(*) FROM pg_locks GROUP BY 1,2 ORDER BY 3 DESC;
```

```sql
-- Unused index candidates (zero idx scans since stats reset)
SELECT relname AS table_name, indexrelname AS index_name, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 30;
```

```bash
# Sanity: confirm data checksums enabled (if cluster was initialized with checksums)
psql -X -Atqc "SHOW data_checksums;"
```

```yaml
engineering_checklist:
  schema:
    - primary_keys_present
    - fk_indexes_reviewed
    - rls_policies_tested
  operations:
    - backups_restored_quarterly
    - failover_drilled_semiannually
  security:
    - tls_enforced
    - least_privilege_roles
```

### Key Points (Additional SQL)

- FK index checks are heuristics—validate with real query plans.

### Best Practices (Additional SQL)

- Reset stats intentionally before long observation windows.

### Common Mistakes (Additional SQL)

- Dropping “unused” indexes used by monthly reports only.

---

## Extended Appendix: Reading List & Habit Stack

```text
Habit stack:
1) Monday: review slow query log / pg_stat_statements top 5
2) Wednesday: review disk forecast + replication lag trends
3) Friday: review access changes + pending migrations
```

### Key Points (Habit stack)

- Small weekly habits prevent big incidents.

### Best Practices (Habit stack)

- Calendar-block 30 minutes for DB hygiene.

### Common Mistakes (Habit stack)

- Doing hygiene only during incidents.

### Official docs anchor

```text
Start at https://www.postgresql.org/docs/current/ and bookmark release notes for your major version.
```

### Key Points (Docs)

- Always read the version-matched page, not a random blog’s summary.

### Best Practices (Docs)

- Teach teams to cite doc sections in ADRs.

### Common Mistakes (Docs)

- Following tutorials written for Postgres 9 on Postgres 16 clusters.

---

