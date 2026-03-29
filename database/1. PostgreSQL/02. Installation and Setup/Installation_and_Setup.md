# Installation and Setup

This guide walks through installing PostgreSQL on common operating systems, containerizing it, connecting managed cloud instances, configuring authentication, and troubleshooting the failures beginners hit most often. Shell snippets illustrate commands; SQL snippets show how to validate a healthy instance.

## 📑 Table of Contents

- [1. Windows Installation](#1-windows-installation)
- [2. macOS Installation](#2-macos-installation)
- [3. Linux Installation](#3-linux-installation)
- [4. Development Environment Setup](#4-development-environment-setup)
- [5. Docker and Container Setup](#5-docker-and-container-setup)
- [6. Cloud Environment Setup](#6-cloud-environment-setup)
- [7. Configuration and Initialization](#7-configuration-and-initialization)
- [8. Connection and Authentication](#8-connection-and-authentication)
- [9. Troubleshooting Installation and Connectivity](#9-troubleshooting-installation-and-connectivity)
- [10. Version Management Tools](#10-version-management-tools)

---

## 1. Windows Installation

### Beginner

On Windows, the common path is the **EDB installer** (EnterpriseDB packaging) or **winget/chocolatey** for scripted installs. You need local administrator rights, enough disk space for the data directory, and a plan for the **superuser** password (`postgres` role).

Typical steps:

1. Download the installer matching your CPU architecture (x64).
2. Run the wizard; include **Command Line Tools** so `psql` exists on PATH.
3. Choose port **5432** unless it conflicts.
4. Complete stack setup (optional) if you want pgAdmin bundled.

### Intermediate

Windows services run PostgreSQL as a service account. Know how to start/stop via **Services** (`services.msc`) or `pg_ctl` if you installed that way. Firewall rules may be required for LAN access—**do not** expose Postgres broadly without `pg_hba.conf` hardening.

PowerShell verification:

```powershell
# After install, confirm version
psql --version

# Connect locally (will prompt for password depending on pg_hba.conf)
psql -h localhost -p 5432 -U postgres -d postgres
```

### Expert

For production-like Windows deployments, consider:

- relocating `data_directory` to fast durable storage (NVMe)
- separating WAL and data only when you understand IO implications (often unnecessary on Windows workstations)
- using **SSL** for remote clients and restricting listen addresses

Postgres on Windows is fully supported, but many teams deploy Linux in production; keep dev/prod OS differences in mind when testing extensions and file paths.

```sql
-- Validate the instance after install
SELECT version();
SHOW data_directory;
SHOW config_file;
SHOW hba_file;
```

### Key Points

- Include CLI tools during setup to avoid “Postgres works but I have no psql” confusion.
- The Windows service account and firewall dictate remote access—not just passwords.

### Best Practices

- Store the superuser password in a **password manager**, not a sticky note.
- Install the latest **minor** release for your major version from a trusted source.

### Common Mistakes

- Installing without CLI tools, then struggling to follow tutorials.
- Opening port 5432 to the entire internet while `trust` or weak passwords exist.

---

## 2. macOS Installation

### Beginner

Three common approaches:

1. **Homebrew**: `brew install postgresql@<major>`—great for developers.
2. **Postgres.app**: friendly GUI for local development.
3. **Source builds**: rare for beginners; used when you need custom compile flags.

Homebrew typically runs Postgres as a background service via `brew services`.

### Intermediate

Apple Silicon vs Intel mostly affects extension builds (some gems/wheels compile differently). Use **native** Homebrew paths (`/opt/homebrew` vs `/usr/local`).

Typical commands:

```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
```

Connect:

```bash
psql postgres
```

### Expert

Multiple versions side-by-side: Homebrew keg-only installs let you pin paths. Be careful with **shared memory** settings on laptops—defaults are usually fine, but large `shared_buffers` can be constrained by OS limits.

For SSL local dev, you can generate self-signed certs, but many teams skip TLS on `localhost` and enforce TLS only for remote hosts.

```sql
SHOW listen_addresses;
SHOW port;
SELECT name, setting FROM pg_settings WHERE name IN ('max_connections','shared_buffers');
```

### Key Points

- Homebrew is the default developer path on macOS; Postgres.app is excellent for GUI-first learners.
- PATH issues are the #1 macOS support question—verify `which psql`.

### Best Practices

- Match your laptop major version to staging when feasible.
- Use a dedicated database user per project rather than superuser daily work.

### Common Mistakes

- Starting Postgres twice (Homebrew service + Postgres.app) causing port conflicts.
- Editing the wrong `postgresql.conf` after multiple installs.

---

## 3. Linux Installation

### Beginner

Package managers install PostgreSQL and register a `systemd` service.

**Ubuntu/Debian** (illustrative):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

**RHEL/CentOS/Rocky** flavors often use `dnf/yum` with module streams.

### Intermediate

Linux installs create a cluster data directory (commonly under `/var/lib/postgresql/<version>/main` on Debian). The OS user `postgres` owns files; you `sudo -u postgres psql` for initial admin.

Service control:

```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Expert

**Source compilation** gives control over `--prefix`, ICU, LLVM JIT, and readline. It increases operational burden—use when packaging constraints demand it.

Tuning at the OS level matters for production: `vm.overcommit_memory`, huge pages (optional), filesystem choice (`xfs`/`ext4`), and **transparent huge pages** recommendations vary—validate against official docs for your version.

```sql
-- Confirm packaging paths from SQL when connected
SHOW data_directory;
SHOW hba_file;
SHOW config_file;
```

### Key Points

- `systemctl` is the operational interface for server lifecycle on systemd distros.
- File ownership must remain correct—avoid `chmod -R` experiments in the data directory.

### Best Practices

- Pin major versions in production using distro mechanisms you understand (APT pinning, modules).
- Automate installs with Ansible/Chef—document deviations from defaults.

### Common Mistakes

- Editing configs as root with wrong permissions, preventing startup.
- Mixing upstream PGDG packages with distro packages without purging conflicts.

---

## 4. Development Environment Setup

### Beginner

Install:

- **psql** (CLI)
- a GUI (**pgAdmin**, **DBeaver**, or IDE plugin)

Create a personal dev database and user:

```sql
CREATE ROLE devuser WITH LOGIN PASSWORD 'replace-me';
CREATE DATABASE devdb OWNER devuser;
GRANT ALL PRIVILEGES ON DATABASE devdb TO devuser;
```

### Intermediate

IDE tips:

- VS Code: PostgreSQL extensions can run queries and show results inline.
- JetBrains: DataGrip provides excellent refactoring and plan visualization.

Environment variables:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=devuser
export PGDATABASE=devdb
```

### Expert

Adopt **migrations** early (Flyway, Liquibase, Sqitch, Alembic, Prisma migrate). The payoff is reproducible schema evolution matching application releases.

For local SSL to mimic production, terminate TLS at a proxy or use stunnel—many teams accept non-TLS locally with strict remote policies.

```sql
\c devdb
CREATE SCHEMA app AUTHORIZATION devuser;
SET search_path TO app, public;
SHOW search_path;
```

### Key Points

- Developer ergonomics (`PG*` env vars, GUI) reduce friction and errors.
- Non-superuser daily roles prevent accidental cluster damage.

### Best Practices

- Never commit real passwords; use `.env` excluded from git.
- Create **one schema per service** only if your migration story supports it.

### Common Mistakes

- Developing as superuser and shipping SQL that requires privileged operations.

---

## 5. Docker and Container Setup

### Beginner

Official image: `postgres:<major>` on Docker Hub. You must set `POSTGRES_PASSWORD` (or related secrets) and publish port 5432.

```bash
docker run --name pgdev \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_USER=app \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 \
  -d postgres:16
```

### Intermediate

Persist data with a **volume**:

```bash
docker volume create pgdata
docker run --name pgdev \
  -e POSTGRES_PASSWORD=devpass \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  -d postgres:16
```

Docker Compose example (conceptual):

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### Expert

Networking: in Compose, apps use service DNS name `db` on the internal network. For production Kubernetes, use **StatefulSets**, persistent volumes, and **pod disruption budgets**—operators like CloudNativePG automate much of this.

Custom `postgresql.conf` can be injected via config maps; ensure reload vs restart behavior is understood.

```sql
-- Inside container
SELECT inet_server_addr(), inet_server_port();
SHOW listen_addresses;
```

### Key Points

- Containers are ephemeral unless volumes back the data directory.
- Compose simplifies multi-service dev stacks (app + db + cache).

### Best Practices

- Use secrets managers for passwords in real deployments.
- Pin image digests in production CI/CD.

### Common Mistakes

- Recreating containers without volumes and losing all data.
- Binding 5432 on shared laptops where another Postgres already listens.

---

## 6. Cloud Environment Setup

### Beginner

Managed Postgres (AWS RDS, Azure Flexible Server, Google Cloud SQL, DigitalOcean, Heroku Postgres) provides backups, patching, and HA options. You receive:

- host, port, database name, user, password (or IAM token)
- TLS requirement flags

### Intermediate

**AWS RDS** highlights:

- parameter groups for server settings
- security groups for network access
- multi-AZ for HA

**Azure** highlights:

- flexible server vs legacy single server (migration paths exist—verify docs)
- private endpoints/VNet integration

**GCP Cloud SQL**:

- instance sizing and storage autoscaling policies
- high availability configuration

**DigitalOcean** and **Heroku** optimize for simpler UX; Heroku rotates credentials and uses connection URLs.

Connection string (URI style):

```
postgresql://app:secret@db.example.com:5432/appdb?sslmode=require
```

### Expert

Design **network paths** before credentials: private subnets, bastion hosts, VPN, or zero-trust proxies. For IAM auth (cloud-specific), rotation and token lifetime become application concerns.

Read replica lag affects reporting queries—expose lag metrics to your app if you route reads to replicas.

```sql
-- After connecting with sslmode=require (client side), inspect SSL in session
SELECT ssl, version, cipher
FROM pg_stat_ssl
WHERE pid = pg_backend_pid();
```

### Key Points

- Cloud Postgres is still Postgres—your SQL and schema discipline remain central.
- Network topology is the primary security layer; passwords alone are insufficient.

### Best Practices

- Enforce TLS for remote connections.
- Use least-privilege DB roles per application component.

### Common Mistakes

- Storing connection strings in plaintext repos.
- Opening databases to `0.0.0.0/0` without IP allowlists or private networking.

---

## 7. Configuration and Initialization

### Beginner

Initialization creates a new database cluster:

```bash
initdb -D /path/to/data
```

Packages usually run this for you. Core files:

- `postgresql.conf`: runtime parameters
- `pg_hba.conf`: host-based authentication rules
- `PG_VERSION` inside the data directory identifies the major

### Intermediate

Common `postgresql.conf` knobs for beginners to **avoid** tuning prematurely: `shared_buffers`, `work_mem`, `effective_cache_size`. Still, set obvious globals:

```conf
listen_addresses = 'localhost'        # or '*' if remote needed + firewall
port = 5432
max_connections = 100
```

SSL example outline:

```conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

Reload vs restart: many parameters allow `pg_ctl reload` or `SELECT pg_reload_conf();`, others require restart.

```sql
SELECT pg_reload_conf();
```

### Expert

`pg_hba.conf` order matters—first match wins. Typical secure remote entry:

```
# TYPE  DATABASE        USER            ADDRESS           METHOD
hostssl all             all             10.0.0.0/24       scram-sha-256
```

Use **cert auth** for service-to-service when platforms support mTLS.

```sql
SHOW ssl;
SHOW ssl_cert_file;
SHOW hba_file;
```

### Key Points

- Treat `pg_hba.conf` as security policy code—review changes in PRs.
- Understand SIGHUP reload semantics before claiming zero-downtime config edits.

### Best Practices

- Keep config under version control (minus secrets) with comments explaining intent.
- Snapshot `postgresql.auto.conf` awareness (ALTER SYSTEM writes there).

### Common Mistakes

- Setting `listen_addresses='*'` without firewall and strong auth.
- Using `trust` for remote subnets.

---

## 8. Connection and Authentication

### Beginner

`psql` connection flags:

```bash
psql "host=localhost port=5432 dbname=appdb user=app password=secret"
```

Password file `~/.pgpass` (chmod 600):

```
localhost:5432:appdb:app:secret
```

### Intermediate

`pg_hba.conf` methods:

- `peer` (maps OS user to DB user—common locally on Linux)
- `scram-sha-256` (recommended password auth)
- `md5` (legacy)
- `cert` (client certificates)

Connection pooling (PgBouncer) changes session characteristics—avoid per-session temp tables unless using transaction pooling carefully.

### Expert

SCRAM negotiation details matter for drivers; ensure JDBC/ORM versions support SCRAM. For LDAP/Kerberos integrations, failures often trace to DNS, clock skew, or TLS interception.

```sql
-- Who am I, really?
SELECT session_user, current_user, inet_client_addr(), inet_client_port();
```

### Key Points

- Authentication is a stack: network allowlist → TLS → `pg_hba` method → role password/IAM.
- Pooling is mandatory at scale; understand pool modes.

### Best Practices

- Rotate passwords with `ALTER ROLE ... PASSWORD`.
- Use separate roles for migrations vs runtime.

### Common Mistakes

- Checking `.pgpass` permissions too late (`FATAL: could not open ~/.pgpass`).
- Using session pooling with unprepared statement assumptions that break.

---

## 9. Troubleshooting Installation and Connectivity

### Beginner

Symptom: **connection refused**

- Is the server running?
- Correct port?
- Correct host?

Symptom: **password authentication failed**

- Wrong user/password
- Wrong `pg_hba.conf` method

### Intermediate

Logs:

- Linux: `journalctl -u postgresql` (distro-dependent)
- macOS Homebrew: `log show` or log files per brew formula docs
- Windows: Event Viewer + Postgres logs directory

Use SQL to see activity:

```sql
SELECT pid, usename, datname, client_addr, state, query
FROM pg_stat_activity
ORDER BY pid;
```

### Expert

**Port conflicts**: `ss -lntp | grep 5432` (Linux) to find competing processes.

**SSL errors**: mismatch between client `sslmode` and server SSL configuration.

**Too many connections**: tune pooling or raise `max_connections` cautiously with memory math.

```sql
SHOW max_connections;
SELECT count(*) FROM pg_stat_activity;
```

### Key Points

- Start from “process up?” then “routing?” then “auth?”—order reduces thrash.

### Best Practices

- Keep a **playbook** snippet for local reset: restart service, tail logs, test `psql`.

### Common Mistakes

- Editing config files that are not loaded by the running instance (wrong path).

---

## 10. Version Management Tools

### Beginner

Developers often need **multiple majors** for client compatibility testing. Tools:

- **asdf** plugin `asdf-postgres`
- **pgenv** / **pgxman** ecosystems (evaluate freshness and support)

Conceptually, each installed major is a separate binary and often separate data directory.

### Intermediate

`asdf` flow (illustrative):

```bash
asdf plugin add postgres
asdf install postgres 16.3
asdf global postgres 16.3
```

Ensure your shell uses the shimmed `psql` and `pg_config` when building extensions.

### Expert

Containers can replace local version managers: one repo defines the supported Postgres version; developers run tasks inside that container. This reduces “works on my machine” drift.

For CI matrices, use service containers with explicit image tags.

```sql
-- Always print version in CI logs
SELECT version();
```

### Key Points

- Pin versions in **project** docs and CI, not only on individual laptops.

### Best Practices

- Automate `CREATE EXTENSION` tests in CI for the versions you claim to support.

### Common Mistakes

- Mixing `pg_dump` from a newer major against an older server without compatibility flags—know `pg_dump` version rules.

---

## Appendix A — Post-Install SQL Smoke Test

### Beginner

Run a harmless checklist after install.

### Intermediate

Include extensions you expect in production to fail fast if missing.

### Expert

Capture `EXPLAIN` plans for a canonical query and store as artifacts to detect planner regressions after upgrades.

```sql
BEGIN;
CREATE SCHEMA IF NOT EXISTS smoke;
CREATE TABLE smoke.checks (id int primary key, note text);
INSERT INTO smoke.checks VALUES (1, 'ok');
SELECT * FROM smoke.checks;
ROLLBACK;
```

### Key Points

- Smoke tests catch PATH issues, permissions, and corrupt packaging early.

### Best Practices

- Make smoke tests **idempotent** or run in transactions that roll back.

### Common Mistakes

- Creating permanent junk tables in shared clusters without cleanup.

---

## Appendix B — Minimal Secure Remote Checklist

### Beginner

- Firewall allowlist
- Strong passwords or IAM
- TLS on

### Intermediate

- Ban `trust` remotely
- Separate admin and app roles

### Expert

- Certificate pinning or CA-managed client certs for service accounts
- Auditing (`pgaudit`) where compliance requires

```sql
CREATE ROLE app_ro WITH LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE appdb TO app_ro;
GRANT USAGE ON SCHEMA app TO app_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_ro;
```

### Key Points

- Security is layered; database roles are the innermost layer.

### Best Practices

- Default deny at network; least privilege at database.

### Common Mistakes

- Read-only roles missing `USAGE` on schema—queries fail mysteriously.

---

## Appendix C — Environment Parity Matrix (Dev / Staging / Prod)

### Beginner

Track: major version, extensions, `max_connections`, locale/encoding.

### Intermediate

Track: replication presence, backup tooling, PgBouncer, TLS endpoints.

### Expert

Track: planner-related settings, autovacuum policies, statistics targets, and hardware ratios (RAM/CPU).

```sql
SELECT name, setting, unit, source
FROM pg_settings
WHERE name IN ('server_version','shared_buffers','work_mem','effective_cache_size','random_page_cost')
ORDER BY name;
```

### Key Points

- Drift is inevitable; **documented** drift is manageable.

### Best Practices

- Store non-secret settings in infra-as-code with review workflows.

### Common Mistakes

- Tuning prod aggressively while dev remains stock—surprises during incident repro.

---

## Appendix D — When to Prefer Managed Postgres

### Beginner

If your team lacks 24/7 DBA coverage and you need automated backups, patching, and failover, managed services reduce toil.

### Intermediate

Evaluate lock-in: extensions supported, parameter group limits, superuser access restrictions.

### Expert

Plan egress costs, HA pricing, and restore drills—managed does not remove **your** responsibility for backups testing.

```sql
-- Example: confirm you can at least read backup metadata interfaces (cloud-specific tables/functions vary)
SELECT pg_is_in_recovery();
```

### Key Points

- Managed shifts **who** operates the OS, not **what** application correctness means.

### Best Practices

- Quarterly restore test from backup to a scratch instance.

### Common Mistakes

- Assuming point-in-time recovery works without ever attempting a restore.

---

## Appendix E — Local Port Conflict Resolution Playbook

### Beginner

If port 5432 is busy, pick 5433 in Docker `-p 5433:5432` or change `port` in `postgresql.conf`.

### Intermediate

Identify the owning process before killing anything.

### Expert

On shared developer machines, standardize per-user ports or use Docker networks exclusively.

```sql
-- After reconnecting on a new port, verify
SHOW port;
```

### Key Points

- Port conflicts look like database outages but are OS routing issues.

### Best Practices

- Document the canonical dev port in the README for each repo.

### Common Mistakes

- Killing system Postgres on a teammate’s machine without coordination.

---

## Appendix F — Initialization Parameters You Should Recognize

### Beginner

`listen_addresses`, `port`, `max_connections`

### Intermediate

`shared_buffers`, `work_mem`, `maintenance_work_mem`, `effective_cache_size`

### Expert

`wal_level`, `max_wal_senders`, `archive_mode`, `hot_standby`, `synchronous_commit`

```sql
SELECT name, setting, short_desc
FROM pg_settings
WHERE name IN ('listen_addresses','port','max_connections','shared_buffers')
ORDER BY name;
```

### Key Points

- Knowing **names** helps you search docs quickly during incidents.

### Best Practices

- Change few knobs at once; measure.

### Common Mistakes

- Setting `work_mem` huge globally—memory multiplies per node per operation.

---

## Appendix G — `pg_hba.conf` Patterns Cookbook (Commented)

### Beginner

Think of each line as: **who** can connect, **from where**, **to which DB**, using **which auth**.

### Intermediate

Prefer `scram-sha-256` for password auth on supported versions. Use `hostssl` to require TLS for TCP connections.

### Expert

Combine `pg_hba.conf` with `pg_ident.conf` only when you fully understand identity mapping risks.

Example study file (do not copy blindly to production):

```
# local connections via Unix socket for admin
local   all             postgres                                peer

# TLS-only for app subnet
hostssl all             all             10.10.0.0/16            scram-sha-256

# reject everything else explicitly (some teams prefer firewall-only denial)
# host all all 0.0.0.0/0 reject
```

```sql
-- After changes, reload when possible
SELECT pg_reload_conf();
```

### Key Points

- First matching rule wins—order is security-critical.

### Best Practices

- Test `pg_hba` changes from a second session before closing your admin session.

### Common Mistakes

- Locking yourself out by reloading restrictive rules without a shell path to fix files.

---

## Appendix H — Docker Networking Scenarios

### Beginner

**Bridge mode** with published ports maps container 5432 to host 5432 (or another host port).

### Intermediate

Custom networks allow containers to resolve each other by name (`db`, `api`).

### Expert

In Kubernetes, prefer **ClusterIP** services and sidecars for TLS; avoid publishing Postgres publicly via LoadBalancer unless heavily gated.

```sql
-- From another container on the same user-defined bridge
SELECT inet_server_addr(), inet_client_addr();
```

### Key Points

- DNS names and networks are part of the connection string—debug accordingly.

### Best Practices

- Use internal networks without public ports for multi-tier compose stacks when possible.

### Common Mistakes

- Hardcoding `localhost` inside a container when the DB is another service name.

---

## Appendix I — Cloud Connection Strings: Parsing Practice

### Beginner

A URI has scheme, userinfo, host, port, dbname, and query params like `sslmode`.

### Intermediate

`sslmode=require` encrypts; `verify-full` also validates certificates (stronger).

### Expert

Some platforms rotate passwords—applications must reload DSNs or use secret injection.

```sql
-- Sanity check after connect
SHOW ssl;
SELECT current_setting('application_name');
```

### Key Points

- `application_name` helps correlate DB sessions with app instances in logs.

### Best Practices

- Set `application_name` from every service component (with version tags).

### Common Mistakes

- Using `sslmode=disable` against internet-facing endpoints.

---

## Appendix J — Upgrade Readiness Snapshot (Install-Time Habit)

### Beginner

Even on day one, note your major version and where binaries live.

### Intermediate

Record extensions and non-default settings in a team wiki.

### Expert

Automate a weekly job that dumps settings and extension versions to an artifact store.

```sql
SELECT extname, extversion FROM pg_extension ORDER BY 1;
SELECT name, setting, sourcefile, sourceline
FROM pg_settings
WHERE source <> 'default'
ORDER BY name
LIMIT 50;
```

### Key Points

- Upgrade friction is predictable when inventory is current.

### Best Practices

- Treat `ALTER SYSTEM` changes as code-reviewed infrastructure changes.

### Common Mistakes

- Letting `postgresql.auto.conf` drift without documentation.

---

## Appendix K — One-Minute Health Signals

### Beginner

If `SELECT 1;` works, your server accepts queries—basic but meaningful.

### Intermediate

Check `pg_is_in_recovery()` to know primary vs standby in replication setups.

### Expert

Correlate `pg_stat_activity` with OS metrics during suspected saturation events.

```sql
SELECT now() AS server_now, pg_postmaster_start_time() AS started_at;
SELECT pg_is_in_recovery();
```

### Key Points

- Health checks should be cheap and automatable.

### Best Practices

- Add synthetic probes that mirror application connection patterns (pooler included).

### Common Mistakes

- Using heavy queries as “health checks” and causing needless load.

---

**Next module:** `03. Basic SQL Commands` for daily `psql` and DDL/DML workflows.
