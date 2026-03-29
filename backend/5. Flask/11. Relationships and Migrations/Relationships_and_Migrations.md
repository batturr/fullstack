# Relationships and Migrations (SQLAlchemy + Alembic) with Flask 3.1.3

Relational data is shaped by **foreign keys** and **relationships** between models. **Alembic** (via **Flask-Migrate**) evolves your schema safely across environments. This guide ties ORM relationships to migration workflows for **Flask 3.1.3** and **Python 3.9+**, with examples from **e‑commerce** (orders and items), **social** (follows, posts), and **SaaS** (tenants, roles).

---

## 📑 Table of Contents

1. [11.1 Relationships](#111-relationships)
2. [11.2 Foreign Keys](#112-foreign-keys)
3. [11.3 Advanced Relationships](#113-advanced-relationships)
4. [11.4 Alembic Migrations](#114-alembic-migrations)
5. [11.5 Migration Operations](#115-migration-operations)
6. [11.6 Database Schema Changes](#116-database-schema-changes)
7. [11.7 Migration Best Practices](#117-migration-best-practices)
8. [Best Practices](#best-practices)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Comparison Tables](#comparison-tables)

---

## 11.1 Relationships

### 11.1.1 One-to-Many

Parent has many children; child holds FK to parent.

**🟢 Beginner Example**

```python
from extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    posts = db.relationship("Post", back_populates="author")

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    author = db.relationship("User", back_populates="posts")
```

**🟡 Intermediate Example** — cascade deletes:

```python
posts = db.relationship("Post", back_populates="author", cascade="all, delete-orphan")
```

**🔴 Expert Example** — `passive_deletes=True` with DB-level ON DELETE.

**🌍 Real-Time Example** — e‑commerce: `Customer` → many `Order`.

---

### 11.1.2 Many-to-One

Inverse naming of one-to-many; many `Order` rows point to one `Customer`.

**🟢 Beginner Example**

```python
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"))
    customer = db.relationship("Customer", back_populates="orders")

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    orders = db.relationship("Order", back_populates="customer")
```

**🟡 Intermediate Example** — required vs optional FK (`nullable=False` for required).

**🔴 Expert Example** — `foreign_keys=[Order.customer_id]` when multiple FKs to same table.

**🌍 Real-Time Example** — SaaS: many `Invoice` → one `Organization`.

---

### 11.1.3 One-to-One

Use `uselist=False` on the “many” side (conceptually one).

**🟢 Beginner Example**

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    profile = db.relationship("Profile", back_populates="user", uselist=False)

class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), unique=True)
    user = db.relationship("User", back_populates="profile")
```

**🟡 Intermediate Example** — `unique=True` on FK enforces 1:1 at DB.

**🔴 Expert Example** — split read-heavy profile to separate table for caching strategies.

**🌍 Real-Time Example** — social extended bio + settings in `Profile`.

---

### 11.1.4 Many-to-Many

Association table connects two entities.

**🟢 Beginner Example**

```python
followers = db.Table(
    "followers",
    db.Column("follower_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
    db.Column("followed_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    following = db.relationship(
        "User",
        secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref("followers", lazy="dynamic"),
    )
```

**🟡 Intermediate Example** — prefer explicit `back_populates` over `backref` for clarity.

**🔴 Expert Example** — association object when extra columns needed (§11.3).

**🌍 Real-Time Example** — social graph follow relationships.

---

### 11.1.5 Relationship Configuration

Key args: `lazy`, `cascade`, `foreign_keys`, `primaryjoin`, `order_by`.

**🟢 Beginner Example**

```python
posts = db.relationship("Post", lazy="select", order_by="desc(Post.created_at)")
```

**🟡 Intermediate Example**

```python
posts = db.relationship("Post", lazy="dynamic")  # returns query object
```

**🔴 Expert Example** — `viewonly=True` for complex read-only joins.

**🌍 Real-Time Example** — SaaS audit log relationship `lazy="dynamic"` for paginated admin UI.

---

## 11.2 Foreign Keys

### 11.2.1 Foreign Key Definition

**🟢 Beginner Example**

```python
user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
```

**🟡 Intermediate Example** — composite FK:

```python
db.ForeignKey(["parent.id", "parent.version"])
```

**🔴 Expert Example** — self-referential FK for tree structures.

**🌍 Real-Time Example** — e‑commerce `order_item.product_id` → `product.id`.

---

### 11.2.2 Constraints

DB enforces referential integrity; match ON DELETE/UPDATE with ORM cascade.

**🟢 Beginner Example**

```python
db.ForeignKey("user.id", ondelete="CASCADE")
```

**🟡 Intermediate Example** — `ondelete="SET NULL"` for optional parent removal.

**🔴 Expert Example** — deferrable constraints (Postgres) for complex bulk loads.

**🌍 Real-Time Example** — retain `Order` if `Product` archived—use soft delete instead of hard FK break.

---

### 11.2.3 Cascading Actions

**🟢 Beginner Example** — ORM `cascade="all, delete-orphan"` on parent→children.

**🟡 Intermediate Example** — DB `ON DELETE CASCADE` on association table.

**🔴 Expert Example** — avoid double-delete conflicts between ORM and DB cascades—pick a single source of truth.

**🌍 Real-Time Example** — user deletion GDPR: anonymize orders, restrict hard delete.

---

### 11.2.4 Relationship Loading

**🟢 Beginner Example** — default lazy load.

**🟡 Intermediate Example**

```python
db.relationship("LineItem", lazy="selectinload")
```

**🔴 Expert Example** — customize per-query with `options(selectinload(Order.items))`.

**🌍 Real-Time Example** — checkout summary: load order + items + product SKUs efficiently.

---

### 11.2.5 Back References

**🟢 Beginner Example** — `back_populates` symmetric.

**🟡 Intermediate Example** — `backref` convenience adds reverse side automatically.

**🔴 Expert Example** — rename backrefs for API clarity in large codebases.

**🌍 Real-Time Example** — admin panel uses `user.organizations` vs `organization.users`.

---

## 11.3 Advanced Relationships

### 11.3.1 Polymorphic

Single table or joined inheritance (see SQLAlchemy ORM notes); relationships can point to base.

**🟢 Beginner Example** — `polymorphic_identity` on base class.

**🟡 Intermediate Example** — `with_polymorphic` loading all subtypes.

**🔴 Expert Example** — query performance: avoid wide joins when only one subtype needed.

**🌍 Real-Time Example** — SaaS notification types (`EmailNotification`, `PushNotification`).

---

### 11.3.2 Self-Referential

**🟢 Beginner Example** — employee manager chain:

```python
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    manager_id = db.Column(db.Integer, db.ForeignKey("employee.id"))
    manager = db.relationship("Employee", remote_side=[id], backref="reports")
```

**🟡 Intermediate Example** — threaded comments `parent_id`.

**🔴 Expert Example** — materialized path or closure table for deep trees at scale.

**🌍 Real-Time Example** — social nested comments with depth limits.

---

### 11.3.3 Association Objects

**🟢 Beginner Example**

```python
class Enrollment(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), primary_key=True)
    enrolled_at = db.Column(db.DateTime, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    enrollments = db.relationship("Enrollment", back_populates="user")

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    enrollments = db.relationship("Enrollment", back_populates="course")
```

**🟡 Intermediate Example** — expose `courses` via `association_proxy` (advanced).

**🔴 Expert Example** — integrity: unique composite on enrollment.

**🌍 Real-Time Example** — SaaS seat assignments with `role_on_team`.

---

### 11.3.4 Dynamic Relationships

`lazy="dynamic"` returns `AppenderQuery` / query-like interface.

**🟢 Beginner Example**

```python
posts = db.relationship("Post", lazy="dynamic")

# user.posts.filter(Post.published.is_(True)).limit(10)
```

**🟡 Intermediate Example** — combine with `.count()` efficiently (still SQL).

**🔴 Expert Example** — cannot append same as list—use `.append()` on relationship nuances.

**🌍 Real-Time Example** — large social followers list: never load all into memory.

---

### 11.3.5 Relationship Options

`single_parent`, `enable_typechecks`, `overlaps` (SA 1.4+).

**🟢 Beginner Example** — defaults suffice for most apps.

**🟡 Intermediate Example** — `overlaps` to silence warnings in complex graphs.

**🔴 Expert Example** — split read/write paths with different loading options.

**🌍 Real-Time Example** — GraphQL resolver batching replaces naive lazy loads.

---

## 11.4 Alembic Migrations

### 11.4.1 Installing Alembic

Typically via Flask-Migrate.

**🟢 Beginner Example**

```bash
pip install Flask-Migrate
```

**🟡 Intermediate Example** — versions aligned with SQLAlchemy 2.x.

**🔴 Expert Example** — Alembic standalone without Flask for libraries.

**🌍 Real-Time Example** — CI image includes `flask db` CLI.

---

### 11.4.2 Initializing

**🟢 Beginner Example**

```python
from flask_migrate import Migrate

migrate = Migrate(app, db)
```

**🟡 Intermediate Example** — factory:

```python
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    db.init_app(app)
    migrate.init_app(app, db)
    return app
```

**🔴 Expert Example** — multiple binds with `Migrate(app, db, compare_type=True)`.

**🌍 Real-Time Example** — `migrations/` committed to git.

---

### 11.4.3 Migration Scripts

Python files in `migrations/versions/` with `upgrade()` and `downgrade()`.

**🟢 Beginner Example** — autogen skeleton:

```python
def upgrade():
    op.add_column("user", sa.Column("last_login", sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column("user", "last_login")
```

**🟡 Intermediate Example** — data backfill inside upgrade.

**🔴 Expert Example** — batched updates to avoid long locks.

**🌍 Real-Time Example** — SaaS: populate new `tenant_id` from legacy `org_slug` map table.

---

### 11.4.4 Auto-Generating

**🟢 Beginner Example**

```bash
export FLASK_APP=wsgi:app
flask db migrate -m "add last_login"
```

**🟡 Intermediate Example** — review autogen: it misses some renames—manual edit.

**🔴 Expert Example** — `compare_server_default`, `include_object` hooks in `env.py`.

**🌍 Real-Time Example** — e‑commerce: autogen detects new `discount_code` table; DBA reviews indexes.

---

### 11.4.5 Manual Migrations

**🟢 Beginner Example**

```bash
flask db revision -m "custom sql"
```

**🟡 Intermediate Example** — raw SQL for extension enable:

```python
def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS citext;")
```

**🔴 Expert Example** — online DDL using external tools (pt-online-schema-change) documented in migration comments.

**🌍 Real-Time Example** — large table rewrite scheduled in maintenance window.

---

## 11.5 Migration Operations

### 11.5.1 Creating Migrations

**🟢 Beginner Example** — `flask db migrate` after model edit.

**🟡 Intermediate Example** — split migrations: schema vs data.

**🔴 Expert Example** — feature-flag dual-write migration in multiple steps.

**🌍 Real-Time Example** — social: add `post.published_at`, backfill, then add NOT NULL.

---

### 11.5.2 Upgrading Database

**🟢 Beginner Example**

```bash
flask db upgrade
```

**🟡 Intermediate Example** — target revision:

```bash
flask db upgrade head
```

**🔴 Expert Example** — k8s init container runs `flask db upgrade` before rolling web pods.

**🌍 Real-Time Example** — blue/green: migrate shared DB once, deploy both colors compatible.

---

### 11.5.3 Downgrading

**🟢 Beginner Example**

```bash
flask db downgrade -1
```

**🟡 Intermediate Example** — downgrade to revision id.

**🔴 Expert Example** — destructive downgrade prohibited—replace with forward-fix migration.

**🌍 Real-Time Example** — production rollback usually forward migration, not down.

---

### 11.5.4 Viewing History

**🟢 Beginner Example**

```bash
flask db history
```

**🟡 Intermediate Example** — `alembic current` shows head on DB.

**🔴 Expert Example** — annotate migrations with ticket IDs.

**🌍 Real-Time Example** — compliance audit of schema changes.

---

### 11.5.5 Downgrade Path

Ensure `downgrade()` mirrors `upgrade()` for dev environments.

**🟢 Beginner Example** — drop column in downgrade.

**🟡 Intermediate Example** — data loss warnings in comments.

**🔴 Expert Example** — for prod, maintain **expand/contract** phases instead of relying on downgrades.

**🌍 Real-Time Example** — remove column only after dual-read period ends.

---

## 11.6 Database Schema Changes

### 11.6.1 Adding Columns

**🟢 Beginner Example**

```python
def upgrade():
    op.add_column("product", sa.Column("weight_grams", sa.Integer(), nullable=True))
```

**🟡 Intermediate Example** — add nullable, backfill, set NOT NULL in follow-up migration.

**🔴 Expert Example** — Postgres `ADD COLUMN ... DEFAULT` lock implications—use phases.

**🌍 Real-Time Example** — e‑commerce: add `tax_code` nullable, populate from service, then enforce.

---

### 11.6.2 Removing Columns

**🟢 Beginner Example**

```python
def upgrade():
    op.drop_column("user", "legacy_points")
```

**🟡 Intermediate Example** — deploy code that stops reading column before drop migration.

**🔴 Expert Example** — archive column data to warehouse before drop.

**🌍 Real-Time Example** — GDPR: drop PII column after retention policy.

---

### 11.6.3 Modifying Columns

**🟢 Beginner Example**

```python
def upgrade():
    op.alter_column("user", "username", existing_type=sa.String(length=80), type_=sa.String(length=120))
```

**🟡 Intermediate Example** — change type with `postgresql_using` cast.

**🔴 Expert Example** — rewrite table when ORM + DB disagree on enum.

**🌍 Real-Time Example** — lengthen SKU field for new supplier format.

---

### 11.6.4 Creating Tables

**🟢 Beginner Example** — autogen `op.create_table`.

**🟡 Intermediate Example** — explicit indexes in same migration.

**🔴 Expert Example** — partition large tables (Postgres declarative partitioning) via raw ops.

**🌍 Real-Time Example** — event store table for analytics pipeline.

---

### 11.6.5 Dropping Tables

**🟢 Beginner Example**

```python
op.drop_table("old_audit")
```

**🟡 Intermediate Example** — drop FKs first or use cascade carefully.

**🔴 Expert Example** — snapshot to S3 before drop.

**🌍 Real-Time Example** — retire deprecated social feature tables after telemetry shows zero reads.

---

## 11.7 Migration Best Practices

### 11.7.1 Version Control

Commit `migrations/` directory; never edit applied migrations—add new ones.

**🟢 Beginner Example** — PR includes migration file + model change.

**🟡 Intermediate Example** — linear history; avoid branching migrations long-term.

**🔴 Expert Example** — merge heads with `flask db merge`.

**🌍 Real-Time Example** — release checklist: migration tested on staging clone.

---

### 11.7.2 Testing Migrations

**🟢 Beginner Example** — CI: create DB, `upgrade head`, run tests.

**🟡 Intermediate Example** — test `upgrade` + `downgrade` + `upgrade` on fresh DB.

**🔴 Expert Example** — property tests for data migrations on sampled production-like dataset.

**🌍 Real-Time Example** — e‑commerce: verify order totals unchanged after backfill.

---

### 11.7.3 Production Migrations

**🟢 Beginner Example** — run during deploy window with monitoring.

**🟡 Intermediate Example** — backups/snapshots before DDL.

**🔴 Expert Example** — online schema change tools for zero-downtime.

**🌍 Real-Time Example** — SaaS: announce maintenance if unavoidable.

---

### 11.7.4 Rollback Strategies

Prefer **forward-fix** migrations; keep feature flags.

**🟢 Beginner Example** — add new column instead of rename in-place.

**🟡 Intermediate Example** — dual-write compatibility across two deploys.

**🔴 Expert Example** — SRE playbook for failed migration (restore snapshot, redeploy).

**🌍 Real-Time Example** — payment table migration failure: abort deploy, no split-brain writes.

---

### 11.7.5 Data Migration

**🟢 Beginner Example**

```python
def upgrade():
    conn = op.get_bind()
    conn.execute(sa.text("UPDATE user SET role = 'member' WHERE role IS NULL"))
```

**🟡 Intermediate Example** — batch with `WHERE id BETWEEN`.

**🔴 Expert Example** — idempotent migrations (`WHERE migrated_at IS NULL`).

**🌍 Real-Time Example** — normalize phone numbers in background job + checkpoint column.

---

## Best Practices

1. **Model and DB constraints** should agree (FK, unique, check).
2. **Expand/contract** for zero-downtime: add → backfill → switch reads → switch writes → remove old.
3. **Review autogenerated** migrations; Alembic is not infallible.
4. **Test on copy** of production statistics (indexes matter).
5. **Separate** huge data migrations from quick DDL when possible.
6. **Document** risky migrations in team channel + runbook.
7. **Use transactions** where supported for DDL batches (dialect dependent).
8. **Indexing** in same migration as column if queries go live immediately.
9. **Avoid** lazy loading in migration scripts—use bulk SQL.
10. **Track heads**—merge migration branches before release.

**🟢 Beginner Example** — always `flask db migrate` after model edits in dev.

**🟡 Intermediate Example** — naming convention in `metadata` for consistent constraint names.

**🔴 Expert Example** — enforce naming in `env.py` `target_metadata`.

**🌍 Real-Time Example** — social: add index concurrently (Postgres `CONCURRENTLY`) via manual migration.

---

## Common Mistakes to Avoid

1. **Editing old migrations** after they’ve run in shared environments.
2. **Dropping columns** still read by old app versions during rolling deploy.
3. **Renaming columns** without deploy coordination (breaks old code).
4. **Missing downgrade** causing dev DB drift (less critical than prod mistakes).
5. **Data migration without batches** locking huge tables.
6. **Assuming SQLite behavior matches Postgres** for migrations.
7. **Circular imports** in `models.py` when autogenerate imports all models—use single registry pattern.
8. **Forgetting indexes** on new FK columns.
9. **Running migrations from multiple places** concurrently without locks.
10. **Storing migration secrets** in `env.py`.

**🟢 Beginner Example** — fix: add compatibility view for renamed table during transition.

**🟡 Intermediate Example** — fix: `op.batch_alter_table` for SQLite limitations.

**🔴 Expert Example** — fix: use `include_schemas` correctly for multi-schema Postgres.

**🌍 Real-Time Example** — e‑commerce: failed migration left NOT NULL without default—restore + forward migration with default.

---

## Comparison Tables

### Relationship loading strategies

| lazy value | Behavior |
|------------|----------|
| select | Load on access (default) |
| joined | JOIN in parent query |
| selectin | IN query for collection |
| subquery | subquery load (less common) |
| dynamic | Query object, not list |

### Alembic autogen vs manual

| Aspect | Autogenerate | Manual |
|--------|--------------|--------|
| Speed | Fast | Slower |
| Accuracy | Good, not perfect | Exact |
| Data steps | Often missing | You add |
| Learning | Easier | Steeper |

### ON DELETE choices

| Option | When |
|--------|------|
| CASCADE | Strong ownership (order lines) |
| SET NULL | Optional parent |
| RESTRICT | Prevent accidental deletes |
| NO ACTION | DB default behavior |

---

## Supplement: Expanded Examples by Domain

### E‑commerce order aggregate (One-to-Many + association discipline)

**🟢 Beginner Example** — model sketch only:

```python
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    items = db.relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    order = db.relationship("Order", back_populates="items")
```

**🟡 Intermediate Example** — migration adding `order_item` composite unique `(order_id, product_id)` to prevent duplicate lines.

**🔴 Expert Example** — optimistic concurrency on `order.version` with `UPDATE ... WHERE id=:id AND version=:v`.

**🌍 Real-Time Example** — flash sale: DB constraint + application idempotency key on `checkout_session_id`.

---

### SaaS tenant scoping (Many-to-One + migrations)

**🟢 Beginner Example** — every row carries `tenant_id`:

```python
class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenant.id"), nullable=False, index=True)
```

**🟡 Intermediate Example** — Alembic data migration: `UPDATE invoice SET tenant_id = org.tenant_id FROM org WHERE invoice.org_id = org.id`.

**🔴 Expert Example** — Postgres RLS policies aligned with `tenant_id` (defense in depth beyond Flask).

**🌍 Real-Time Example** — cross-tenant access attempts return 404 to avoid existence leaks.

---

### Social graph performance (Many-to-Many + dynamic)

**🟢 Beginner Example** — simple association table without extra columns.

**🟡 Intermediate Example** — `lazy="dynamic"` on `followers` for “load page of followers”.

**🔴 Expert Example** — materialized follower counts updated by triggers or async workers.

**🌍 Real-Time Example** — celebrity accounts: never `select * from followers where followed_id=:id` unbounded.

---

### Polymorphic notifications (Advanced + migrations)

**🟢 Beginner Example** — single table `notifications` with `type` string discriminator.

**🟡 Intermediate Example** — add `payload JSONB` via migration; backfill defaults `{}`.

**🔴 Expert Example** — split hot/cold storage: recent rows in primary table, archive to partitioned table.

**🌍 Real-Time Example** — mobile push vs email preference matrices per user.

---

### Self-referential org chart (Self-FK + integrity)

**🟢 Beginner Example** — `manager_id` nullable for CEO row.

**🟡 Intermediate Example** — application check preventing cycles (tree validation on write).

**🔴 Expert Example** — periodic SQL job detecting cycles if bad data imported.

**🌍 Real-Time Example** — SaaS billing: roll up usage charges along org tree.

---

### Association object for team roles (Many-to-Many enriched)

**🟢 Beginner Example** — `Membership` with `role` enum column.

**🟡 Intermediate Example** — migration adds `role` with server default `member`, then tightens NOT NULL.

**🔴 Expert Example** — partial unique index: one `owner` per team using Postgres partial unique.

**🌍 Real-Time Example** — enterprise SSO: map IdP groups into `Membership.role`.

---

### Migration operations cheat sheet (operations depth)

**🟢 Beginner Example** — create index:

```python
def upgrade():
    op.create_index("ix_invoice_tenant", "invoice", ["tenant_id"])
```

**🟡 Intermediate Example** — rename table with `op.rename_table("old", "new")` + update ORM `__tablename__` in same release train.

**🔴 Expert Example** — `op.execute` with `CONCURRENTLY` for Postgres index builds outside transaction—requires Alembic `autocommit_block`.

**🌍 Real-Time Example** — 500M-row social `likes` table: index build staged off-peak with monitoring.

---

### Downgrade path realism (production stance)

**🟢 Beginner Example** — dev-only downgrade to wipe dev DB quickly.

**🟡 Intermediate Example** — staging validates `upgrade → downgrade → upgrade` on disposable DB.

**🔴 Expert Example** — production policy: **no downgrades**; write `fix_*` forward migrations.

**🌍 Real-Time Example** — payment ledger: immutable schema changes only additive.

---

### Data migration idempotency (best practice drill)

**🟢 Beginner Example** — run update once blindly in dev.

**🟡 Intermediate Example** — `WHERE migrated_at IS NULL` marker column.

**🔴 Expert Example** — checksum verification comparing old vs derived columns on sample.

**🌍 Real-Time Example** — e‑commerce catalog: re-run safe after partial failure.

---

### Testing relationships (integration patterns)

**🟢 Beginner Example** — create parent + child in test, assert FK.

**🟡 Intermediate Example** — assert cascade delete removes children when configured.

**🔴 Expert Example** — simulate DB ON DELETE behavior in SQLite vs Postgres parity tests.

**🌍 Real-Time Example** — CI matrix runs migrations on target dialect docker service.

---

### Flask-Migrate CLI quick reference

| Command | Purpose |
|---------|---------|
| `flask db init` | Create migrations env (once) |
| `flask db migrate -m "msg"` | Autogenerate revision |
| `flask db upgrade` | Apply migrations |
| `flask db downgrade` | Revert (dev/stage) |
| `flask db history` | Show revisions |
| `flask db merge -m "msg" heads` | Merge multiple heads |

---

*End of Relationships and Migrations notes — Flask 3.1.3, Python 3.9+.*
