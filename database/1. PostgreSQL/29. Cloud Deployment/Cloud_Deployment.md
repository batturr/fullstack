# Cloud Deployment

**PostgreSQL learning notes (March 2026). Topic aligned with README topic 29.**

## 📑 Table of Contents

- [1. AWS RDS PostgreSQL](#1-aws-rds-postgresql)
- [2. Azure Database for PostgreSQL](#2-azure-database-for-postgresql)
- [3. Google Cloud SQL PostgreSQL](#3-google-cloud-sql-postgresql)
- [4. DigitalOcean Managed Databases](#4-digitalocean-managed-databases)
- [5. Heroku PostgreSQL](#5-heroku-postgresql)
- [6. Self-Managed Cloud Deployment](#6-self-managed-cloud-deployment)
- [7. Container Deployment (Docker)](#7-container-deployment-docker)
- [8. Kubernetes Deployment (StatefulSet, PV)](#8-kubernetes-deployment-statefulset-pv)
- [9. Cloud-Specific Features](#9-cloud-specific-features)
- [10. Cost Optimization](#10-cost-optimization)

---

## 1. AWS RDS PostgreSQL

<a id="1-aws-rds-postgresql"></a>

### Beginner

Amazon RDS for PostgreSQL is a managed database service. You choose instance class, storage type, and engine version. AWS handles patching, backups, and failover for Multi-AZ deployments. You connect using endpoints, security groups, and SSL.

### Intermediate

Use DB parameter groups to tune Postgres settings allowed by RDS. Enable automated backups with a retention window. Read replicas scale reads and can be promoted. Performance Insights helps find wait events and SQL.

### Expert

Experts design subnet groups across AZs, integrate with Secrets Manager rotation, and use IAM database authentication where appropriate. They plan major version upgrades with blue/green (feature availability varies) and test failover regularly.

```bash
# Example CLI create call (illustrative; replace subnets/security)
aws rds create-db-instance \
  --db-instance-identifier app-pg \
  --db-instance-class db.m7g.large \
  --engine postgres \
  --engine-version 16.3 \
  --allocated-storage 200 \
  --storage-type gp3 \
  --master-username appadmin \
  --master-user-password 'use-secrets-manager' \
  --vpc-security-group-ids sg-0123456789abcdef0 \
  --db-subnet-group-name my-db-subnets \
  --backup-retention-period 7 \
  --multi-az
```

```yaml
# CloudFormation fragment (illustrative)
Resources:
  DbSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: app
      SubnetIds: [subnet-a, subnet-b]
```

```sql
-- After connecting
SHOW ssl;
SELECT version();
```

### Key Points

- Not every `postgresql.conf` knob is exposed—check AWS docs per version.
- Multi-AZ increases availability cost; replicas add read scaling cost.
- gp3 allows IOPS/throughput tuning separate from size.
- Parameter group changes may require reboot.
- Enhanced monitoring adds OS-level metrics.
- RDS snapshots feed DR and cloning workflows.
- Cross-region replicas exist for DR patterns (product feature evolution).

### Best Practices

- Use private subnets + bastion or VPN for admin access.
- Tag instances for cost allocation.
- Test restore from snapshot quarterly.

### Common Mistakes

- Publicly accessible RDS with weak password policies.
- Assuming `rds_superuser` equals bare-metal superuser for all operations.

---

## 2. Azure Database for PostgreSQL

<a id="2-azure-database-for-postgresql"></a>

### Beginner

Azure offers PostgreSQL managed services (Flexible Server is the modern choice; legacy Single Server was retired—plan migrations). You pick compute tier, storage size, HA options, and networking (VNet integration).

### Intermediate

Configure server parameters via Azure portal/CLI/arm templates. Use automated backups, geo-redundant backup when required. Monitor with Azure Monitor metrics and query store features where available.

### Expert

Experts integrate Entra ID (Azure AD) authentication, private endpoints, and key vault secrets. They tune connection pooling at app and optionally use PgBouncer patterns supported by the platform.

```bash
az postgres flexible-server create \
  --resource-group rg-app \
  --name app-pg \
  --location eastus \
  --admin-user appadmin \
  --admin-password 'use-key-vault' \
  --sku-name Standard_D4ds_v4 \
  --tier GeneralPurpose \
  --storage-size 256 \
  --version 16
```

```yaml
# Bicep/ARM style conceptual fragment
resource pg 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: 'app-pg'
  location: 'eastus'
  sku: { name: 'Standard_D4ds_v4', tier: 'GeneralPurpose' }
  properties: { version: '16', storage: { storageSizeGB: 256 } }
}
```

### Key Points

- Networking models differ—VNet vs public access decisions are security critical.
- Flexible Server exposes many tuning knobs but not all Postgres internals.
- Read replicas and HA have regional constraints—verify SKUs.
- Backup retention and PITR windows are contractual for RPO.
- Diagnostic logs should feed Log Analytics for correlation.
- Entra auth changes connection string patterns—train teams.
- Major upgrades may require downtime windows—plan.

### Best Practices

- Use private endpoints for production data planes.
- Enforce TLS minimum versions via policy.
- Automate server parameter drift detection.

### Common Mistakes

- Confusing Flexible vs legacy documentation in search results.
- Opening firewall to `0.0.0.0` for convenience.

---

## 3. Google Cloud SQL PostgreSQL

<a id="3-google-cloud-sql-postgresql"></a>

### Beginner

Cloud SQL provides managed PostgreSQL with instance tiers, storage autoresize options, and automated backups. Connectivity via private IP or authorized networks. IAM database authentication can integrate with Google identities.

### Intermediate

Tune flags analogous to Postgres settings via the Cloud SQL API/console. Use read replicas for scaling reads and cross-region replicas for DR. Monitor Query Insights for latency hotspots.

### Expert

Experts design VPC peering and Private Service Connect carefully for multi-project setups. They evaluate disk types (SSD vs HDD rarely for OLTP) and CPU always-on vs serverless profiles (where offered) against workload burstiness.

```bash
gcloud sql instances create app-pg \
  --database-version=POSTGRES_16 \
  --tier=db-custom-4-16384 \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=200GB \
  --availability-type=REGIONAL \
  --backup-start-time=03:00
```

```yaml
# Terraform google_sql_database_instance sketch
resource "google_sql_database_instance" "pg" {
  name             = "app-pg"
  database_version = "POSTGRES_16"
  region           = "us-central1"
  settings {
    tier = "db-custom-4-16384"
    availability_type = "REGIONAL"
    disk_size = 200
    disk_type = "PD_SSD"
    backup_configuration { enabled = true }
  }
}
```

### Key Points

- Maintenance windows apply patches—coordinate with SLOs.
- Replica promotion changes topology—update apps.
- Connection limits depend on tier—watch with microservices.
- SSL/TLS modes must match client drivers.
- Export/import operations may use `gcloud sql export` patterns.
- Observability integrates with Cloud Monitoring dashboards.
- Label instances for FinOps chargeback.

### Best Practices

- Use private IP for production; avoid authorized networks open to world.
- Test failover in non-prod matching prod networking.

### Common Mistakes

- Undersizing disk IOPS for write-heavy workloads despite “enough GB”.

---

## 4. DigitalOcean Managed Databases

<a id="4-digitalocean-managed-databases"></a>

### Beginner

DigitalOcean offers managed Postgres clusters with primary and standby nodes in HA layouts depending on plan. You receive connection URIs, CA certs for TLS, and read-only nodes on higher tiers.

### Intermediate

Use connection pools (DO provides pool ports on some offerings) to protect `max_connections`. Configure trusted sources (firewall) carefully. Take manual backups before major migrations.

### Expert

Experts integrate DO databases with Kubernetes (DOKS) via private networking. They evaluate when self-managed Droplets + Postgres outperform managed for specialized extensions not allowed.

```yaml
# Conceptual: trusted sources as code in Terraform DO provider
resource "digitalocean_database_cluster" "pg" {
  name       = "app-pg"
  engine     = "pg"
  version    = "16"
  size       = "db-s-4vcpu-8gb"
  region     = "nyc3"
  node_count = 2
}
```

```bash
psql "postgresql://user:pass@host:25060/db?sslmode=require"
```

### Key Points

- Feature surface evolves—verify extension support lists.
- Read-only URIs help scale analytics queries with staleness acceptance.
- Network trust sources should be minimal CIDRs.
- Maintenance updates require planning—subscribe to DO status.
- Pricing bundles vCPU/RAM/storage—compare apples-to-apples with AWS/GCP.
- TLS CA files must be distributed to clients securely.
- Observability may be less rich than hyperscalers—add app metrics.

### Best Practices

- Store credentials in DO secrets or external vaults.
- Load test pool ports before launch.

### Common Mistakes

- Using primary URI for batch jobs that should hit read nodes.

---

## 5. Heroku PostgreSQL

<a id="5-heroku-postgresql"></a>

### Beginner

Heroku Postgres is an add-on with plans (tiered RAM, connections, features). Apps receive `DATABASE_URL` config vars. Credentials rotate via `heroku pg:credentials`.

### Intermediate

Use connection pooling add-ons or built-in pooler endpoints on higher tiers. Understand row limits on hobby tiers. Schedule upgrades and maintenance via Heroku tooling.

### Expert

Experts migrate off Heroku Postgres to RDS/Cloud SQL with minimal downtime using logical replication or dual-writes when necessary. They watch connection limits with many dynos.

```bash
heroku addons:create heroku-postgresql:standard-0 -a myapp
heroku config:get DATABASE_URL -a myapp
```

```yaml
# app.json style (illustrative)
addons:
  - plan: heroku-postgresql:standard-0
```

### Key Points

- `DATABASE_URL` changes on credential rotation—apps must reload.
- Extensions may be limited compared to self-managed Postgres.
- Fork/follow features support testing and DR patterns.
- Metrics available in Heroku dashboards—augment with APM.
- Plan for egress if moving data out to other clouds.
- PgBouncer may be required for connection-heavy Rails apps.
- Compliance requirements may mandate dedicated plans or migration.

### Best Practices

- Pin major version upgrade windows with stakeholders.
- Use Standard/Private tiers for production SLOs.

### Common Mistakes

- Running production on hobby tier expecting HA.

---

## 6. Self-Managed Cloud Deployment

<a id="6-self-managed-cloud-deployment"></a>

### Beginner

You install PostgreSQL on cloud VMs (EC2, GCE, Azure VM) and manage everything: patching, backups, replication, monitoring. This offers maximum control at maximum operational burden.

### Intermediate

Use IaC (Terraform) for instances, EBS/GCE disks with defined IOPS, and security groups. Automate backups to object storage. Configure time sync (chrony) and kernel settings per Postgres guidance cautiously.

### Expert

Experts implement Patroni/etcd (or similar) for HA, use dedicated WAL and data volumes, and tune filesystem mount options (e.g., noatime). They evaluate Nitro/local NVMe instances for extreme performance.

```bash
# Illustrative cloud-init snippet header only
#packages:
#  - postgresql-16
```

```yaml
terraform:
  module: ec2_pg
  root_volume_gb: 500
  iops: 12000
  throughput_mbps: 500
```

### Key Points

- You own backups, security patching, and failover drills.
- Disk throughput ceilings dominate many cloud performance issues.
- Snapshots are not a substitute for logical backups for all cases.
- Network placement affects latency—same AZ for app and DB when possible.
- Licensing is Postgres OSS; support contracts optional.
- Monitoring must be self-built (Prometheus, Datadog).
- OS hardening is your responsibility.

### Best Practices

- Immutable infrastructure images for Postgres nodes.
- Separate volumes for data, WAL (advanced), logs when justified.
- Automate restore tests.

### Common Mistakes

- Single AZ deployment calling itself “HA”.
- EBS burst balance surprises during index builds.

---

## 7. Container Deployment (Docker)

<a id="7-container-deployment-docker"></a>

### Beginner

Official `postgres` images run `postgres` as PID 1 with data in `/var/lib/postgresql/data`. Mount volumes for persistence. Pass `POSTGRES_PASSWORD` env vars for dev; use secrets in prod.

### Intermediate

Tune `shm_size` for larger `shared_buffers` contexts. Use healthchecks with `pg_isready`. For production, prefer orchestrators or managed DB; containers excel for dev/test and edge patterns.

### Expert

Experts build custom images with extensions baked in, use multi-stage builds for tools, and scan images for CVEs. They configure `ulimits` and cgroup memory limits compatible with Postgres expectations.

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data
    shm_size: "1gb"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 10s
      timeout: 5s
      retries: 5
volumes:
  pgdata: {}
```

```bash
docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres:16
```

### Key Points

- Ephemeral containers without volumes lose data.
- Port publishing exposes DB publicly—dangerous if misconfigured.
- Init scripts in `/docker-entrypoint-initdb.d` seed dev schemas.
- Resource limits should leave headroom for OS page cache behavior.
- Windows/Mac Docker Desktop networking differs from Linux—test paths.
- TLS termination often happens outside the container (proxy).
- Logs go to stdout/stderr—configure drivers for retention.

### Best Practices

- Use `.env` files locally but never commit secrets.
- Pin image digests in production pipelines.

### Common Mistakes

- `chmod 777` data volumes to “fix” permissions unsafely.

---

## 8. Kubernetes Deployment (StatefulSet, PV)

<a id="8-kubernetes-deployment-statefulset-pv"></a>

### Beginner

StatefulSets give stable network IDs and persistent volumes for databases. A `PersistentVolumeClaim` templates per pod. Running Postgres on Kubernetes is feasible but operationally demanding compared to managed services.

### Intermediate

Use `volumeClaimTemplates` for data PVCs. Configure `PodDisruptionBudgets` and anti-affinity to spread pods across nodes/AZs. Prefer operators (CloudNativePG, Zalando, Percona) for replication/failover automation.

### Expert

Experts tune `fsGroup`/`securityContext`, handle WAL archiving to object storage, and integrate backup sidecars (WAL-G). They understand etcd latency impacts for operators using Kubernetes as DCS vs external etcd.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels: {app: postgres}
  template:
    metadata:
      labels: {app: postgres}
    spec:
      containers:
        - name: postgres
          image: postgres:16
          ports: [{containerPort: 5432}]
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          env:
            - name: POSTGRES_PASSWORD
              valueFrom: {secretKeyRef: {name: pg-secret, key: password}}
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 200Gi
```

### Key Points

- Single-replica StatefulSet is not HA—add operator or external replication.
- Storage class choice (EBS CSI, GCE PD) affects failover time.
- Backups must integrate with volume snapshots + logical dumps.
- Upgrades require careful rollout ordering.
- Network policies should restrict DB access to namespaces.
- Resource requests/limits need tuning—avoid memory OOM kills mid-transaction.
- Running HA Postgres on Kubernetes is a specialty—staff accordingly.

### Best Practices

- Use operators for anything beyond dev clusters.
- Automate backup restore drills.

### Common Mistakes

- Losing PVCs by deleting namespaces without backups.
- Using ReadWriteMany volumes incorrectly for Postgres data.

---

## 9. Cloud-Specific Features

<a id="9-cloud-specific-features"></a>

### Beginner

Each cloud maps Postgres tuning to “parameter groups”, “flags”, or “server parameters”. Features like automated failover, read replicas, PITR, and encryption at rest vary in implementation.

### Intermediate

Compare IAM/Entra ID database authentication models. Evaluate private networking (PrivateLink, Private Service Connect, Private Endpoints). Understand differences in extension allow-lists.

### Expert

Experts build decision matrices: when to use RDS Performance Insights vs Cloud SQL Query Insights vs self-hosted pg_stat_statements. They evaluate cross-cloud DR with logical replication costs.

```sql
-- Feature probe queries (examples)
SHOW rds.extensions; -- AWS RDS specific
SELECT * FROM pg_available_extensions ORDER BY name;
```

```yaml
feature_matrix:
  iam_db_auth: [aws, azure, gcp]
  parameter_groups: [aws]
  flags: [gcp]
  server_params: [azure_flexible]
```

### Key Points

- Names differ; concepts overlap—translate carefully in runbooks.
- Some features require specific editions/SKUs.
- Extension support is a common migration blocker.
- Encryption at rest should be mandatory for regulated data.
- Cross-region replication costs money and latency.
- Observability integrations differ—standardize on app traces regardless.
- Quotas and API rate limits affect automation.

### Best Practices

- Maintain a single internal wiki page mapping vendor names to Postgres concepts.
- Test extension compatibility in staging clones early.

### Common Mistakes

- Assuming feature parity across clouds after reading one vendor doc.

---

## 10. Cost Optimization

<a id="10-cost-optimization"></a>

### Beginner

Database costs include compute, storage, IOPS/throughput, backups, replicas, data transfer, and licensing/support. Right-sizing instances saves money; over-provisioning wastes it.

### Intermediate

Use reserved instances/savings plans where steady state exists. Reduce backup retention to business-required minimums. Delete unused replicas and snapshots. Schedule non-prod shutdowns.

### Expert

Experts attribute costs per tenant using tags/labels, tune autovacuum to reduce IO churn, and move cold data to cheaper storage tiers via archival strategies. They evaluate Graviton/ARM SKUs when drivers and extensions support them.

```yaml
finops:
  tags:
    - cost-center
    - environment
    - service
  policies:
    - enforce_gp3_over_gp2_where_cheaper
    - delete_dev_snapshots_older_than_14d
```

```sql
-- Identify huge tables driving storage IO
SELECT relnamespace::regnamespace AS schema, relname,
       pg_size_pretty(pg_total_relation_size(oid)) AS total
FROM pg_class
WHERE relkind = 'r'
ORDER BY pg_total_relation_size(oid) DESC
LIMIT 20;
```

### Key Points

- Storage grows monotonically without vacuum/archival discipline.
- IOPS costs can exceed compute for write-heavy apps.
- Cross-AZ traffic adds up microscopically but materially at scale.
- Idle HA pairs still bill fully.
- Monitoring storage autogrow prevents surprises but can hide inefficiency.
- Developer environments should auto-stop.
- Cost optimization must not break RPO/RTO commitments.

### Best Practices

- Monthly review top drivers: storage, replicas, unused snapshots.
- Put non-prod in smaller tiers with guardrails.
- Align instance family with CPU/memory profile measured.

### Common Mistakes

- Paying for Multi-AZ on dev clusters unnecessarily.
- Keeping years of logical backups without lifecycle rules.

---

## Appendix: Cloud Connectivity & Security Snippets

```bash
# Test TLS connectivity (client must trust CA bundle provided by vendor)
psql "host=mydb.xxxxx.us-east-1.rds.amazonaws.com dbname=app user=app sslmode=verify-full"
```

```yaml
network:
  enforce_private_connectivity: true
  deny_public_ip: true
```

```sql
SELECT inet_server_addr(), inet_server_port();
```

### Key Points (Appendix)

- Always verify you landed on intended endpoint (prod vs staging).

### Best Practices (Appendix)

- Store CA files in secret managers; rotate with provider guidance.

### Common Mistakes (Appendix)

- Disabling TLS verification “temporarily” for months.

---

## Extended Appendix: Multi-Cloud Runbook Fragments

### Fragment — Environment parity checklist

```yaml
parity:
  postgres_major_version: match
  timezone: UTC
  extensions: match_list
  locale: match
  parameters:
    log_min_duration_statement: aligned
    statement_timeout: aligned
```

### Key Points (Parity)

- Staging should reproduce planner behavior, not only schema.

### Best Practices (Parity)

- Automate extension version checks in CI.

### Common Mistakes (Parity)

- Testing on empty tables while production is huge.

---

### Fragment — Secrets rotation

```bash
# Illustrative only: cloud CLIs differ
aws secretsmanager rotate-secret --secret-id prod/app/db
```

```yaml
rotation:
  dual_password_window: true
  app_supports: hot_reload_dsn
```

### Key Points (Rotation)

- Apps must support credential rotation without full restarts when possible.

### Best Practices (Rotation)

- Practice rotation in staging monthly.

### Common Mistakes (Rotation)

- Rotating DSN without updating connection pools.

---

### Fragment — Read replica routing

```yaml
app:
  primary_url: ${PRIMARY_DSN}
  replica_url: ${REPLICA_DSN}
  replica_max_lag_ms: 30000
```

### Key Points (Replica routing)

- Stale reads require product acceptance.

### Best Practices (Replica routing)

- Measure lag continuously; circuit-break to primary if exceeded.

### Common Mistakes (Replica routing)

- Sending writes to read endpoints due to DNS typos.

---

### Fragment — Backup validation SQL

```sql
SELECT count(*) FROM critical_table;
SELECT min(created_at), max(created_at) FROM critical_table;
```

### Key Points (Backup validation)

- Count + time bounds catch empty restores.

### Best Practices (Backup validation)

- Automate checks after every restore test.

### Common Mistakes (Backup validation)

- Opening backup files manually without querying.

---

### Fragment — Parameter drift detection

```sql
SELECT name, setting
FROM pg_settings
WHERE source NOT IN ('default','override')
ORDER BY name;
```

### Key Points (Drift)

- Export settings after each production change.

### Best Practices (Drift)

- Store exports in versioned object storage.

### Common Mistakes (Drift)

- Relying on human memory for “what changed last Tuesday”.

---

### Fragment — Docker Compose prod-like (lab)

```yaml
services:
  db:
    image: postgres:16
    command:
      - postgres
      - -c
      - shared_buffers=2GB
      - -c
      - max_connections=200
    mem_limit: 8g
```

### Key Points (Compose prod-like)

- Still not cloud HA—use for perf experiments only.

### Best Practices (Compose prod-like)

- Mirror major version and key parameters only.

### Common Mistakes (Compose prod-like)

- Assuming compose networking equals VPC latency.

---

### Fragment — Kubernetes NetworkPolicy sketch

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-app-to-postgres
spec:
  podSelector:
    matchLabels: {app: postgres}
  ingress:
    - from:
        - podSelector:
            matchLabels: {app: api}
      ports:
        - port: 5432
```

### Key Points (NetPol)

- Default deny environments need explicit policies.

### Best Practices (NetPol)

- Test policies in staging with chaos drills.

### Common Mistakes (NetPol)

- Forgetting DNS/kube-apiserver paths while debugging.

---

### Fragment — Cost tagging standards

```text
owner=payments-team env=prod cost-center=1234
```

### Key Points (Tagging)

- Tags enable chargeback and cleanup automation.

### Best Practices (Tagging)

- Enforce required tags via policy-as-code.

### Common Mistakes (Tagging)

- Inconsistent key spelling across teams.

---

### Fragment — Major upgrade rehearsal

```yaml
upgrade:
  steps:
    - clone_prod_to_staging
    - run_provider_upgrade_tooling
    - run_analyze
    - run_app_regression_suite
    - rehearse_rollback
```

### Key Points (Upgrade)

- Rollback stories differ per cloud—read the fine print.

### Best Practices (Upgrade)

- Capture planner diffs with saved `EXPLAIN` sets.

### Common Mistakes (Upgrade)

- Upgrading Friday without coverage.

---

### Fragment — Observability minimum viable

```yaml
metrics:
  - cpu
  - memory
  - disk_used_percent
  - db_connections
  - replication_lag
  - slow_query_rate
logs:
  - error_rate
  - deadlock_count
```

### Key Points (Observability)

- Minimum viable still needs SLO linkage.

### Best Practices (Observability)

- Dashboard per environment with the same layout.

### Common Mistakes (Observability)

- Alerting only on CPU without lag and disk.

---

### Fragment — Data residency notes

```yaml
data_residency:
  primary_region: eu-west-1
  backups: same_region
  replicas: documented_exceptions_only
```

### Key Points (Residency)

- Legal requirements may forbid cross-border replicas.

### Best Practices (Residency)

- Involve legal/compliance early in architecture reviews.

### Common Mistakes (Residency)

- Accidentally enabling global reads without noticing.

---

### Fragment — Connection limits math

```text
instances * pool_max <= max_connections - admin_reserve
```

### Key Points (Limits)

- Kubernetes pod scale events multiply connections quickly.

### Best Practices (Limits)

- Add connection budgets to service templates.

### Common Mistakes (Limits)

- Scaling pods horizontally without lowering per-pod pool max.

---

### Fragment — SSL CA bundle handling (Java)

```text
Import cloud provider CA into JVM truststore or use explicit sslrootcert in JDBC URL where supported.
```

### Key Points (Java SSL)

- JVM truststores are a frequent source of handshake failures.

### Best Practices (Java SSL)

- Automate truststore updates in image builds.

### Common Mistakes (Java SSL)

- Disabling verification globally in `Datasource`.

---

### Fragment — SSL CA bundle handling (Node)

```javascript
import fs from "fs";
import pg from "pg";
const ssl = { ca: fs.readFileSync("/secrets/rds-ca.pem").toString(), rejectUnauthorized: true };
```

### Key Points (Node SSL)

- Mount CA PEM via secrets volume in Kubernetes.

### Best Practices (Node SSL)

- Rotate CA files with rolling pod restarts.

### Common Mistakes (Node SSL)

- Hardcoding CA strings in git.

---

### Fragment — Private DNS pitfalls

```text
Ensure VPC private hosted zones resolve DB endpoints inside the VPC; split-horizon DNS mistakes cause “works on my laptop”.
```

### Key Points (DNS)

- DNS is a production dependency.

### Best Practices (DNS)

- Add synthetic checks from CI VPC test runners.

### Common Mistakes (DNS)

- Caching stale DNS after failover events.

---

### Fragment — Object storage archival

```bash
aws s3 cp dump.dump s3://backup-bucket/pg/$(date -u +%F).dump
```

### Key Points (Archival)

- Lifecycle policies move objects to cheaper tiers.

### Best Practices (Archival)

- Encrypt with KMS and restrict IAM.

### Common Mistakes (Archival)

- Public buckets “just for internal dumps”.

---

### Fragment — Postgres extensions allow-list process

```yaml
process:
  - propose_extension_in_adr
  - test_in_staging_clone
  - verify_license
  - enable_in_prod_change_window
```

### Key Points (Extensions)

- Managed clouds gate extensions—plan migrations early.

### Best Practices (Extensions)

- Keep a running compatibility matrix per environment.

### Common Mistakes (Extensions)

- Using extension-only features without DR plan.

---

### Fragment — Synthetic canary query

```sql
SELECT 1;
```

```yaml
canary:
  interval: 30s
  alert_on: 3_consecutive_failures
```

### Key Points (Canary)

- Cheap but catches auth, networking, and overload blackholes.

### Best Practices (Canary)

- Run from the same network path as real apps.

### Common Mistakes (Canary)

- Running only inside the DB host (not realistic).

---

