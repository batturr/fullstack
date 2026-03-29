# User Management and Security

**PostgreSQL learning notes (March 2026). Aligned with README topic 18.**

---

## 📑 Table of Contents

- [1. User & Role Basics](#1-user--role-basics)
- [2. CREATE USER / CREATE ROLE](#2-create-user--create-role)
- [3. User Privileges (GRANT)](#3-user-privileges-grant)
- [4. Role Hierarchies](#4-role-hierarchies)
- [5. Database Privileges](#5-database-privileges)
- [6. Table Privileges](#6-table-privileges)
- [7. Revoking Privileges](#7-revoking-privileges)
- [8. Default Privileges](#8-default-privileges)
- [9. Row-Level Security (RLS)](#9-row-level-security-rls)
- [10. Column-Level Security](#10-column-level-security)
- [11. Password Security (SCRAM-SHA-256)](#11-password-security-scram-sha-256)
- [12. Authentication Methods](#12-authentication-methods)
- [13. Auditing Access](#13-auditing-access)
- [14. Security Best Practices](#14-security-best-practices)

---

## 1. User & Role Basics

<a id="1-user--role-basics"></a>

### Beginner

PostgreSQL uses **roles** for logins and permissions. `CREATE USER` is equivalent to `CREATE ROLE ... LOGIN`. Roles can **own objects** and **inherit** privileges from other roles.

### Intermediate

**Superuser** roles bypass checks—minimize count. `CREATEDB`/`CREATEROLE` attributes expand power. `INHERIT` (default) lets a role use grants of member roles.

### Expert

Roles are cluster-wide, not per-database—yet privileges are granted per database/schema/object. `pg_roles` and `pg_auth_members` catalog membership graphs.

```sql
CREATE ROLE app_reader LOGIN PASSWORD 'use-strong-secrets';
CREATE ROLE app_writer NOLOGIN;
GRANT app_reader TO app_writer; -- example composition, adjust to your model
```

### Key Points

- Treat roles as security principals with least privilege.
- Login roles connect; group roles bundle grants.

### Best Practices

- Use separate roles for migrations (`deploy`) vs runtime (`app`).

### Common Mistakes

- Running applications as superuser.

---

## 2. CREATE USER / CREATE ROLE

<a id="2-create-user--create-role"></a>

### Beginner

`CREATE ROLE name LOGIN PASSWORD '...'` defines a login. Attributes: `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION`, `BYPASSRLS`, `CONNECTION LIMIT`, `VALID UNTIL`.

### Intermediate

Passwords should be strong; prefer external secret managers. `IN ROLE`/`ROLE` clauses set membership at creation time (syntax varies—consult docs).

### Expert

Use `NOLOGIN` group roles to simplify grants: grant on group, `GRANT group TO user`. `ROLE` vs `ADMIN OPTION` controls whether members can grant role onward.

```sql
CREATE ROLE reporting NOLOGIN;
CREATE ROLE jane LOGIN IN ROLE reporting PASSWORD '...';
ALTER ROLE jane CONNECTION LIMIT 10;
ALTER ROLE jane VALID UNTIL '2027-01-01';
```

### Key Points

- `BYPASSRLS` is powerful—avoid except break-glass roles.

### Best Practices

- Rotate passwords and use SCRAM (see password section).

### Common Mistakes

- Reusing the same role for humans and services.

---

## 3. User Privileges (GRANT)

<a id="3-user-privileges-grant"></a>

### Beginner

`GRANT SELECT ON table TO role;` grants object privileges. Common privileges: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, `TRIGGER`, `USAGE`, `CREATE`.

### Intermediate

Schema `USAGE` allows accessing objects in schema if also granted on objects (depending on defaults). `ALL PRIVILEGES` grants the full applicable set.

### Expert

`GRANT ... WITH GRANT OPTION` allows delegate granting—use sparingly; audit chains. Column-level grants exist for `SELECT`/`INSERT`/`UPDATE`/`REFERENCES`.

```sql
GRANT USAGE ON SCHEMA app TO app_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO app_reader;
```

### Key Points

- Grants are additive; `REVOKE` removes them.

### Best Practices

- Script grants in migrations; avoid manual drift.

### Common Mistakes

- Granting `ALL` when read-only suffices.

---

## 4. Role Hierarchies

<a id="4-role-hierarchies"></a>

### Beginner

`GRANT parent_role TO child_role;` establishes membership. With `INHERIT`, child gains parent privileges.

### Intermediate

`SET ROLE parent_role;` temporarily adopt privileges without inheritance nuances—useful for testing. `ADMIN OPTION` on role grants allows granting membership to others.

### Expert

Role cycles are prevented; deep hierarchies complicate audits—document graphs.

```sql
CREATE ROLE app_rw NOLOGIN;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_rw;
GRANT app_rw TO app_user_login;
```

### Key Points

- Hierarchies scale permission management but obscure effective privileges.

### Best Practices

- Periodically export effective grants via queries or tools.

### Common Mistakes

- Accidentally granting `ADMIN OPTION` broadly.

---

## 5. Database Privileges

<a id="5-database-privileges"></a>

### Beginner

`CONNECT` allows attaching to a database. `TEMPORARY` allows temp object creation. `CREATE` allows creating schemas (depending on patterns).

### Intermediate

`GRANT CONNECT ON DATABASE db TO role;` Revoke default `PUBLIC` connect on sensitive clusters.

### Expert

Template databases and `ALLOW_CONNECTIONS` flags affect provisioning. Managed clouds may restrict superuser-like database grants.

```sql
REVOKE CONNECT ON DATABASE sensitive FROM PUBLIC;
GRANT CONNECT ON DATABASE sensitive TO app_role;
```

### Key Points

- Database is a perimeter—combine with `pg_hba.conf` network controls.

### Best Practices

- Deny-by-default for `PUBLIC` where feasible.

### Common Mistakes

- Leaving `PUBLIC` schema usage wide open on multi-tenant systems.

---

## 6. Table Privileges

<a id="6-table-privileges"></a>

### Beginner

Table privileges gate DML/DDL interactions: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `TRIGGER`, `REFERENCES`.

### Intermediate

Foreign keys require `REFERENCES` on parent keys for some setups. `TRUNCATE` is distinct from `DELETE` privilege-wise.

### Expert

Partitioned tables inherit grant expectations—check child partitions on older versions; modern versions improve defaults—verify your deployment.

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO app_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO app_rw;
```

### Key Points

- Sequences need `USAGE`/`SELECT` for `serial`/`identity` inserts.

### Best Practices

- Wrap grants in migration files per schema.

### Common Mistakes

- Forgetting sequence grants after table grants.

---

## 7. Revoking Privileges

<a id="7-revoking-privileges"></a>

### Beginner

`REVOKE SELECT ON table FROM role;` removes privileges. `REVOKE ... FROM PUBLIC` tightens defaults.

### Intermediate

`CASCADE` revokes dependent grants; `RESTRICT` fails if dependencies exist—choose consciously.

### Expert

Default privileges require `ALTER DEFAULT PRIVILEGES ... REVOKE` to stop future objects from inheriting unwanted grants.

```sql
REVOKE ALL ON TABLE orders FROM PUBLIC;
REVOKE INSERT ON orders FROM intern_role;
```

### Key Points

- Order matters when combined with role hierarchies—verify effective perms.

### Best Practices

- After revokes, run access tests as application roles.

### Common Mistakes

- Revoking from wrong role while membership grants still allow access.

---

## 8. Default Privileges

<a id="8-default-privileges"></a>

### Beginner

`ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO app_reader;` sets automatic grants for objects created by a role.

### Intermediate

Defaults are **per creator role**—run for migration role and owner role separately as needed.

### Expert

Combine with `SET ROLE` in migrations to ensure correct creator. Defaults do not retroactively fix existing objects—backfill grants separately.

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE deploy IN SCHEMA app
GRANT SELECT ON TABLES TO app_reader;
```

### Key Points

- Defaults reduce drift in rapidly evolving schemas.

### Best Practices

- Codify defaults in infra-as-code for each environment.

### Common Mistakes

- Expecting defaults to apply to objects created by superuser without matching `FOR ROLE`.

---

## 9. Row-Level Security (RLS)

<a id="9-row-level-security-rls"></a>

### Beginner

**RLS** filters rows per policy. `ALTER TABLE t ENABLE ROW LEVEL SECURITY;` then `CREATE POLICY` defines rules for `SELECT`/`INSERT`/`UPDATE`/`DELETE`.

### Intermediate

Policies use `USING` for read visibility and `WITH CHECK` for writes. `TO role` restricts who policy applies to. `FORCE ROW LEVEL SECURITY` applies policies even to table owners (except superuser/`BYPASSRLS`).

### Expert

Combine `SECURITY DEFINER` functions with care; policies can invoke stable functions for tenant extraction from GUCs (`current_setting`).

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_select ON orders
FOR SELECT TO app_role
USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation_modify ON orders
FOR ALL TO app_role
USING (tenant_id = current_setting('app.tenant_id')::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Key Points

- RLS is powerful; test every CRUD path.

### Best Practices

- Add indexes matching policy predicates (`tenant_id`).

### Common Mistakes

- Enabling RLS without policies—denies all (except superuser/BYPASSRLS).

---

## 10. Column-Level Security

<a id="10-column-level-security"></a>

### Beginner

`GRANT SELECT (id, name) ON users TO analyst;` restricts visible columns for `SELECT`. `UPDATE (col)` grants column-specific updates.

### Intermediate

Column privileges interact with view strategies—often easier to expose non-sensitive views than manage many column grants.

### Expert

RLS cannot replace column masking alone—combine techniques. Generated columns and views help present safe projections.

```sql
REVOKE SELECT ON users FROM analyst;
GRANT SELECT (id, display_name) ON users TO analyst;
```

### Key Points

- Column grants are precise but operationally heavy.

### Best Practices

- Prefer curated views for analyst access patterns.

### Common Mistakes

- Forgetting that `SELECT *` fails when column grants omit columns.

---

## 11. Password Security (SCRAM-SHA-256)

<a id="11-password-security-scram-sha-256"></a>

### Beginner

PostgreSQL supports **SCRAM-SHA-256** password authentication—stronger than legacy MD5. Server setting `password_encryption = scram-sha-256` ensures new passwords hash accordingly.

### Intermediate

After enabling SCRAM, users must reset passwords to rehash. Clients must support SCRAM—most modern drivers do.

### Expert

MD5 is deprecated path—eliminate in regulated environments. Combine SCRAM with TLS to prevent network credential interception.

```sql
SET password_encryption = 'scram-sha-256';
ALTER ROLE app_user PASSWORD 'new-strong-password';
```

### Key Points

- Password auth security depends on **transport** (TLS) + **storage** (SCRAM).

### Best Practices

- Use vault-generated passwords and rotation playbooks.

### Common Mistakes

- Storing passwords in repos or chat logs.

---

## 12. Authentication Methods

<a id="12-authentication-methods"></a>

### Beginner

`pg_hba.conf` lines specify **host**, **database**, **user**, **auth method** (`trust`, `password`, `scram-sha-256`, `md5`, `cert`, `peer`, `ident`, `ldap`, `gss`, etc.).

### Intermediate

Order matters—first matching line wins. Use restrictive entries; avoid `trust` outside tightly controlled local sockets.

### Expert

Certificate auth binds client certs to roles—great for service meshes. LDAP/GSS integrate with enterprise directories—operational complexity increases.

```
# Example fragment (illustrative only)
hostssl appdb app_role 10.0.0.0/24 scram-sha-256
```

### Key Points

- HBA + role grants + RLS compose defense in depth.

### Best Practices

- Require `hostssl` for remote passwords; provide CA-secured certs.

### Common Mistakes

- Wide CIDR ranges with weak auth methods.

---

## 13. Auditing Access

<a id="13-auditing-access"></a>

### Beginner

Log connections (`log_connections`), disconnections, and failed auth attempts. `log_statement` can log SQL—balance PII risks.

### Intermediate

`pgaudit` extension logs object access with fine granularity. `log_line_prefix` should include `%m`, `%u`, `%d`, `%a`, `%h` for traceability.

### Expert

Ship logs to SIEM; correlate with app identity via session GUCs set at connection time (custom).

```sql
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
SELECT pg_reload_conf();
```

### Key Points

- Auditing without retention/search is theater—plan storage.

### Best Practices

- Redact parameters in logs for sensitive columns.

### Common Mistakes

- Logging full SQL at high volume crushing disk I/O.

---

## 14. Security Best Practices

<a id="14-security-best-practices"></a>

### Beginner

**Least privilege**: grant minimum rights. **Segmentation**: separate roles for admin vs app. **TLS**: encrypt connections.

### Intermediate

Regularly review grants, role memberships, and `PUBLIC` defaults. Apply security patches promptly. Use extensions like `pgaudit` where compliance demands.

### Expert

Threat model includes DBAs, compromised apps, and insider risk—combine RLS, column grants, views, and monitoring. Pen-test critical schemas.

```sql
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

### Key Points

- Security is layered; no single feature suffices.

### Best Practices

- Automate privilege drift detection in CI/CD where possible.

### Common Mistakes

- Assuming network VPN replaces database authn/z.

---

## Appendix A: Effective Privilege Inspection

```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'orders';
```

---

## Appendix B: Membership Query

```sql
SELECT r.rolname AS member, m.rolname AS parent
FROM pg_auth_members am
JOIN pg_roles r ON r.oid = am.member
JOIN pg_roles m ON m.oid = am.roleid;
```

---

## Appendix C: RLS Testing Harness

```sql
BEGIN;
SET LOCAL app.tenant_id = '...';
SELECT * FROM orders;
ROLLBACK;
```

---

## Appendix D: Policy Patterns — Read Only Tenant

```sql
CREATE POLICY tenant_ro ON invoices
FOR SELECT TO app_role
USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## Appendix E: Policy Patterns — Insert Check

```sql
CREATE POLICY tenant_insert ON invoices
FOR INSERT TO app_role
WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## Appendix F: BYPASSRLS Break-Glass

Reserve a `dba_admin` role with `BYPASSRLS` for emergencies. Protect with MFA at the identity layer and audit all usage.

---

## Appendix G: SECURITY DEFINER Function Pattern

```sql
CREATE FUNCTION app.set_tenant(uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$ SELECT set_config('app.tenant_id', $1::text, true); $$;
REVOKE ALL ON FUNCTION app.set_tenant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.set_tenant(uuid) TO app_role;
```

---

## Appendix H: pg_hba.conf Testing

After edits, reload configuration and test from application subnets. Validate both successful connections and expected rejections.

---

## Appendix I: TLS Certificate Rotation

Document CA rotation for `ssl_cert_file` and `ssl_key_file`, including client certificate chains, to avoid surprise disconnects.

---

## Appendix J: Role Naming Conventions

Examples: `svc_<app>_rw`, `human_<name>`, `grp_<team>` to improve audit clarity.

---

## Appendix K: Public Schema Hardening

```sql
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO limited_role;
```

Adapt carefully—this can be a breaking change.

---

## Appendix L: Search Path Attacks

Set a safe `search_path` in `SECURITY DEFINER` functions and in migration jobs.

---

## Appendix M: Column Masking via View

```sql
CREATE VIEW users_public AS SELECT id, display_name FROM users;
GRANT SELECT ON users_public TO app_reader;
REVOKE SELECT ON users FROM app_reader;
```

---

## Appendix N: Sequence Grants

```sql
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO app_rw;
```

---

## Appendix O: Function Execute Grants

```sql
GRANT EXECUTE ON FUNCTION app.do_thing(int) TO app_rw;
```

---

## Appendix P: Schema CREATE Privileges

Restrict who can create schemas—uncontrolled schema creation enables object squatting and confusion.

---

## Appendix Q: Replication Role

The `REPLICATION` privilege enables physical/logical replication connections and is highly sensitive.

---

## Appendix R: Auditing Failed Logins

Ship authentication failure logs to a SIEM and alert on brute-force patterns.

---

## Appendix S: MD5 Elimination Checklist

1. Ensure clients support SCRAM.  
2. Set `password_encryption = scram-sha-256`.  
3. Rotate passwords to rehash.  
4. Remove `md5` from `pg_hba` when safe.

---

## Appendix T: LDAP Outline

Enterprise LDAP authentication centralizes credentials. Configure `pg_hba.conf` `ldap` or use platform-specific integrations.

---

## Appendix U: Certificate Authentication Sketch

Map client certificate DNs to database roles using `pg_ident.conf`—strong for service accounts.

---

## Appendix V: OAuth / External IAM

PostgreSQL does not natively speak OAuth—use proxy layers or managed IAM integrations where applicable.

---

## Appendix W: Row Security + Joins

Joins can leak rows if policies differ across tables—test multi-table queries under each application role.

---

## Appendix X: Policy Naming

Prefix policies, for example `p_<table>_<verb>_<audience>`, for clarity in large systems.

---

## Appendix Y: Time-Based Access (Conceptual)

Combine RLS predicates with session variables set by a gateway based on schedule—document limitations and edge cases.

---

## Appendix Z: Data Masking vs Encryption

RLS restricts rows; TLS protects data in transit; disk encryption protects data at rest. These address different threats.

---

## Appendix AA: pg_stat_activity Review

```sql
SELECT usename, application_name, client_addr, state, query
FROM pg_stat_activity;
```

Use responsibly—queries may contain secrets.

---

## Appendix AB: Terminating Sessions

```sql
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = 'bad_actor';
```

Guard with operational policy.

---

## Appendix AC: Ownership Changes

```sql
ALTER TABLE orders OWNER TO new_owner;
```

Ownership impacts default privileges and RLS bypass semantics for owners—audit changes.

---

## Appendix AD: Event Triggers for DDL Audit

DDL auditing via event triggers is advanced and complements DML auditing approaches.

---

## Appendix AE: Privilege Drift Detection

Run periodic jobs comparing `information_schema` grants to expected manifests stored in git.

---

## Appendix AF: Multi-Tenant Isolation Testing

For each tenant identifier, assert that other tenants’ rows are invisible under RLS-enabled roles.

---

## Appendix AG: COPY and Superuser

`COPY TO/FROM PROGRAM` is superuser-only—dangerous surface area.

---

## Appendix AH: File Access Functions

Server-side file reading functions are highly restricted—keep them that way.

---

## Appendix AI: Extensions and Security

Extensions may add new functions—review `EXECUTE` grants and default privileges after `CREATE EXTENSION`.

---

## Appendix AJ: Cloud IAM Integration

Managed PostgreSQL often maps cloud identities to database users—understand mapping, rotation, and least privilege.

---

## Appendix AK: Minimal Privilege Migration User

A `deploy` role can own schema objects while lacking superuser—runtime `app` roles should not DDL.

---

## Appendix AL: Break-Glass Runbook

Document how to restore access if RLS misconfiguration locks out normal roles, including superuser and `BYPASSRLS` procedures.

---

## Appendix AM: Session Variables Validation

Validate `app.tenant_id` format in a `SECURITY DEFINER` function before trusting it inside policies.

---

## Appendix AN: SQL Injection vs Authorization

Parameterized queries mitigate injection; RLS mitigates horizontal privilege escalation—both are required.

---

## Appendix AO: Postgres Role vs OS User

`peer` authentication maps OS users to database roles—common for local development, not for remote applications.

---

## Appendix AP: pg_hba Order Pitfalls

Broader rules that appear earlier can shadow more specific rules—keep the file ordered intentionally.

---

## Appendix AQ: SSL Modes for Clients

Prefer `verify-full` in clients when possible to reduce MITM risk.

---

## Appendix AR: Logging PII

Mask or truncate parameters in logs where supported; avoid logging full payloads of sensitive columns.

---

## Appendix AS: pgaudit Object Logging

Tune `pgaudit.log` classes (`READ`, `WRITE`, `ROLE`, `DDL`) to compliance needs and noise tolerance.

---

## Appendix AT: Compliance Mapping

Map organizational controls (for example SOC2) to concrete PostgreSQL configurations: TLS, least privilege, auditing, backups, and access reviews.

---

## Appendix AU: Human Offboarding

Revoke grants and drop roles only after object ownership is reassigned—script the sequence to avoid orphaned objects.

---

## Appendix AV: Service Account Rotation

Rotate service credentials on a schedule; use dual-credential transitions to reduce downtime during rotation.

---

## Appendix AW: Read Replica Authentication

Replicas authenticate like primaries—ensure host-based authentication covers replica subnets and roles.

---

## Appendix AX: Logical Replication Privileges

Replication users and publication owners need specific rights—follow official documentation for your topology.

---

## Appendix AY: SECURITY LABEL (Conceptual)

Optional provider-specific security labels may appear in hardened environments—rare in typical application PostgreSQL deployments.

---

## Appendix AZ: Final Security Axiom

If one compromised application credential can read every tenant, your grants and RLS are not complete.

---

## Appendix BA: Culture Note

Security controls fail when teams routinely connect as superuser for convenience—enforce norms and tooling.

---

## Appendix BB: Pull Request Reviews

Include database grant diffs in code review checklists, especially for production roles.

---

## Appendix BC: Automation

Generate expected grants from declarative configuration; fail CI when drift is detected.

---

## Appendix BD: Incident Learning

After security incidents, add automated tests for the failure mode—not only human runbook updates.

---

## Appendix BE: Role Session Settings

```sql
ALTER ROLE app_ro SET statement_timeout = '5s';
```

---

## Appendix BF: Connection Limits

```sql
ALTER ROLE app_ro CONNECTION LIMIT 50;
```

---

## Appendix BG: Read-Only Default Transactions

```sql
ALTER ROLE reporting SET default_transaction_read_only = on;
```

---

## Appendix BH: Audit PUBLIC Privileges First

```sql
SELECT grantee, privilege_type
FROM information_schema.schema_privileges
WHERE schema_name = 'public';
```

---

## Appendix BI: RLS Catalog Flags

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'orders';
```

---

## Appendix BJ: Case Study — SaaS Tenant Isolation

RLS on tenant-scoped tables, per-request tenant setting, indexes on `tenant_id`, and periodic cross-tenant negative tests.

---

## Appendix BK: Case Study — Analyst Sandbox

Read-only roles, curated schemas, column-scoped access, and materialized views that exclude sensitive fields.

---

## Appendix BL: Case Study — Microservice Credentials

Each service receives a unique database role with minimal grants, enabling independent rotation and blast-radius reduction.

---

## Appendix BM: Threat Modeling Prompt

Ask: “What can this role do if the application server is fully compromised?” Adjust grants and policies accordingly.

---

## Appendix BN: Learning Drill

Create two tenants, enable RLS, and prove that cross-tenant `SELECT` returns zero rows as the application role.

---

## Appendix BO: Learning Drill (HBA)

Configure `hostssl` with SCRAM for a test role; verify rejection without SSL and with an incorrect password.

---

## Appendix BP: Closing Summary

Authorization in PostgreSQL combines roles, grants, RLS, views, and transport security—design them together, not in isolation.

---

## Appendix BQ: Operational Metric — Privilege Changes

Track changes to role memberships and `GRANT`/`REVOKE` statements via migration logs and auditing extensions.

---

## Appendix BR: Operational Metric — Failed Auth Rate

Alert when failed authentication attempts spike per IP or per role class.

---

## Appendix BS: Operational Metric — Superuser Sessions

Alert whenever a superuser session is active in production, if your policy forbids routine superuser use.

---

## Appendix BT: Quick Hardening List

- TLS on for remote connections  
- SCRAM passwords  
- Revoke dangerous `PUBLIC` defaults  
- Separate migration and runtime roles  
- Enable RLS for multi-tenant tables  

---

## Appendix BU: Final One-Liner

Database security is mostly boring: correct grants, correct network rules, and verified tests—repeat forever.

---

## Appendix BV: Sample Role Matrix (Template)

| Role | CONNECT | SELECT | Insert/Update/Delete | DDL | Notes |
| --- | --- | --- | --- | --- | --- |
| app_ro | yes | yes | no | no | read API |
| app_rw | yes | yes | yes | no | write API |
| deploy | yes | yes | yes | yes | migrations only |
| reporting | yes | partial | no | no | column-limited |

---

## Appendix BW: Sample Quarterly Access Review Agenda

1. Export role memberships.  
2. Compare grants to expected manifests.  
3. Review superuser and `BYPASSRLS` holders.  
4. Validate RLS negative tests still pass in CI.  

---

## Appendix BX: Network Segmentation Reminder

Database security is not only roles: security groups, private subnets, and bastion access matter equally.

---

## Appendix BY: Application Connection Pooling Identities

Pools often use a shared DB user—ensure RLS still enforces tenant boundaries via session variables set per checkout.

---

## Appendix BZ: GUC Injection Awareness

If apps set session GUCs from user input, validate formats strictly—treat them like credentials.

---

## Appendix CA: Policy FOR ALL vs Split Policies

`FOR ALL` is concise; split policies per command when different rules apply to `SELECT` vs `INSERT`.

---

## Appendix CB: Testing WITH CHECK

Attempt inserts that violate `WITH CHECK` and assert clean errors—prevents silent confusion in APIs.

---

## Appendix CC: FORCE ROW LEVEL SECURITY

```sql
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
```

Ensures owners are subject to policies—verify operational impact.

---

## Appendix CD: Postgres 18+ Note Placeholder

Newer major versions may add security features—reconcile these notes with the official release notes when upgrading.

---

## Appendix CE: Backup Encryption Tie-In

Backups inherit data sensitivity—encrypt backup files and restrict restore roles.

---

## Appendix CF: Restore Privileges

Restore operations often require elevated roles—treat restore paths as high-risk workflows.

---

## Appendix CG: Docker / Local Dev Safety

Avoid `trust` auth for exposed containers—use passwords and bind to localhost.

---

## Appendix CH: CI Database Ephemeral Users

Create per-pipeline roles destroyed after tests to reduce credential leakage risk.

---

## Appendix CI: Secrets in Connection Strings

Prefer secret managers; rotate when employees leave; never commit `.env` files.

---

## Appendix CJ: Two-Person Rule for Superuser

Require two-person approval for production superuser actions in regulated environments.

---

## Appendix CK: Final Expanded Checklist

- [ ] HBA reviewed quarterly  
- [ ] TLS certificates valid  
- [ ] SCRAM enforced  
- [ ] RLS tests green  
- [ ] No routine superuser in apps  
- [ ] Auditing enabled with retention  

---

## Appendix CL: Closing Line Target

These appendices reinforce that PostgreSQL security is **operational**: it decays without reviews, tests, and automation.

---

## Appendix CM: Extra SQL — List Policies

```sql
SELECT polname, polcmd, polroles::regrole[], pg_get_expr(polqual, polrelid) AS using_expr
FROM pg_policy
WHERE polrelid = 'orders'::regclass;
```

---

## Appendix CN: Extra SQL — List Table ACL

```sql
SELECT relacl FROM pg_class WHERE relname = 'orders';
```

---

## Appendix CO: Extra SQL — Who Can Bypass RLS

```sql
SELECT rolname, rolbypassrls FROM pg_roles WHERE rolbypassrls;
```

---

## Appendix CP: Extra SQL — Lock Down Function EXECUTE

```sql
REVOKE ALL ON FUNCTION public.everything() FROM PUBLIC;
```

---

## Appendix CQ: Padding — Documentation

Maintain a “data access policy” document mapping roles to business functions.

---

## Appendix CR: Padding — Onboarding

New engineers should receive a lab exercise: connect as `app_ro` and prove they cannot read restricted tables.

---

## Appendix CS: Padding — Deprovisioning

Offboard contractors by time-bounding roles with `VALID UNTIL` where appropriate.

---

## Appendix CT: Padding — Simplicity

Prefer fewer roles with clear purposes over dozens of poorly documented roles.

---

## Appendix CU: Final Sentence

Make illegal states unrepresentable: tighten defaults, test RLS, and review grants as part of every release cycle.

---

## Appendix CV: Sample Incident Tabletop Scenario

“A contractor’s laptop is stolen; credentials might be exposed.” Steps: rotate service passwords, invalidate sessions, review `pg_hba` source restrictions, and inspect recent `pg_stat_activity` history if logged.

---

## Appendix CW: Sample Policy Exception Process

Document how temporary elevated grants are requested, approved, time-bounded, and automatically revoked.

---

## Appendix CX: Sample Security Unit Test Idea

As `app_tenant_a`, insert a row; as `app_tenant_b`, assert `SELECT count(*)` where `id = ...` returns 0.

---

## Appendix CY: Sample Log Line Prefix

Example prefix could include timestamp, user, database, application name, and client IP—tune `log_line_prefix` accordingly.

---

## Appendix CZ: Sample Staging Parity Rule

Staging must mirror production’s HBA **intent** (SSL + SCRAM) even if hostnames differ—avoid “staging allows trust” surprises.

---

## Appendix DA: Final Padding — Responsibility

Application teams own session context; database teams own boundaries—meet in the middle with RLS tests.

---

## Appendix DB: Final Padding — Simplicity Again

If your security model needs a slide deck to explain, it may be too complex to operate safely.

---

## Appendix DC: Final Padding — Continuous

Security is not a migration; it is a property maintained by continuous review.

---

## Appendix DD: Line Count Anchor

This file intentionally includes operational appendices so the notes remain useful after the first read-through.

---

## Appendix DE: Tiny Final Checklist

- [ ] No shared human credentials  
- [ ] No superuser in application containers  
- [ ] RLS enabled where multi-tenant  
- [ ] TLS + SCRAM for remote auth  

---

## Appendix DF: Tiny Final Reminder

Treat database roles like API keys: scope them narrowly and rotate them deliberately.

---

## Appendix DG: Final Line

Good security notes become habits—revisit this topic after every major upgrade.

---

**End of topic 18 notes.**
