# SQLAlchemy ORM with Flask 3.1.3

The **SQLAlchemy ORM** maps Python classes to database tables and provides a rich query API. With **Flask-SQLAlchemy**, models integrate cleanly into Flask application contexts and sessions. These notes target **SQLAlchemy 2.x** declarative style with Flask **3.1.3** and **Python 3.9+**, illustrating patterns for **SaaS** entities, **e‑commerce** catalogs, and **social** content models.

---

## 📑 Table of Contents

1. [10.1 Models Basics](#101-models-basics)
2. [10.2 Data Types](#102-data-types)
3. [10.3 Column Constraints](#103-column-constraints)
4. [10.4 Creating and Dropping Tables](#104-creating-and-dropping-tables)
5. [10.5 CRUD Operations](#105-crud-operations)
6. [10.6 Querying](#106-querying)
7. [10.7 Advanced Queries](#107-advanced-queries)
8. [10.8 Session Management](#108-session-management)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 10.1 Models Basics

### 10.1.1 Creating Models

Models are Python classes inheriting from `db.Model` (Flask-SQLAlchemy) which extends SQLAlchemy’s declarative base.

**🟢 Beginner Example**

```python
from extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
```

**🟡 Intermediate Example** — timestamps mixin:

```python
from datetime import datetime

class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Post(db.Model, TimestampMixin):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
```

**🔴 Expert Example** — abstract base for shared columns:

```python
class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)

class Customer(BaseModel):
    name = db.Column(db.String(120), nullable=False)
```

**🌍 Real-Time Example** — SaaS `Organization` + `User` models sharing audit columns via mixin.

---

### 10.1.2 Model Definition

Use `db.Column(type, **kwargs)` for each attribute; relationships added in §11 (separate notes).

**🟢 Beginner Example**

```python
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    price_cents = db.Column(db.Integer, nullable=False)
```

**🟡 Intermediate Example** — computed in Python property (not a column):

```python
class Product(db.Model):
    price_cents = db.Column(db.Integer, nullable=False)

    @property
    def price(self):
        return self.price_cents / 100
```

**🔴 Expert Example** — hybrid properties with `hybrid_property` for SQL expressions (advanced).

**🌍 Real-Time Example** — e‑commerce: `price_cents` avoids float issues.

---

### 10.1.3 Table Names

Default `__tablename__` is snake_case of class name; set explicitly for legacy DBs.

**🟢 Beginner Example**

```python
class User(db.Model):
    __tablename__ = "users"
```

**🟡 Intermediate Example** — schema-qualified in Postgres via `__table_args__`:

```python
class LedgerEntry(db.Model):
    __tablename__ = "ledger_entries"
    __table_args__ = {"schema": "finance"}
```

**🔴 Expert Example** — multi-tenant schema search_path vs explicit schema per model.

**🌍 Real-Time Example** — integrating with existing `shop_orders` table from ERP.

---

### 10.1.4 Column Definition

Columns declare type, constraints, defaults, indexes.

**🟢 Beginner Example**

```python
email = db.Column(db.String(255), unique=True, nullable=False, index=True)
```

**🟡 Intermediate Example** — composite index:

```python
class Follow(db.Model):
    __table_args__ = (db.Index("ix_follow_pair", "follower_id", "followed_id", unique=True),)
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, nullable=False)
    followed_id = db.Column(db.Integer, nullable=False)
```

**🔴 Expert Example** — partial index (Postgres) via `__table_args__` with `postgresql_where`.

**🌍 Real-Time Example** — social: unique follow pair constraint prevents duplicates.

---

### 10.1.5 Model Inheritance

Joined-table, single-table, or concrete inheritance patterns.

**🟢 Beginner Example** — shared mixin (no polymorphic queries):

```python
class HasUUID:
    public_id = db.Column(db.String(36), unique=True, nullable=False)
```

**🟡 Intermediate Example** — joined-table inheritance:

```python
class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))
    __mapper_args__ = {"polymorphic_on": type, "polymorphic_identity": "person"}

class Employee(Person):
    __mapper_args__ = {"polymorphic_identity": "employee"}
    desk = db.Column(db.String(20))
```

**🔴 Expert Example** — performance implications: joins per subtype query.

**🌍 Real-Time Example** — SaaS billing: `PaymentMethod` subclasses for card vs ACH.

---

## 10.2 Data Types

### 10.2.1 Integer

**🟢 Beginner Example**

```python
stock = db.Column(db.Integer, default=0, nullable=False)
```

**🟡 Intermediate Example** — `BigInteger` for high-volume counters.

**🔴 Expert Example** — sequence-backed PK on Oracle/legacy (rare in Flask tutorials).

**🌍 Real-Time Example** — inventory units in warehouse.

---

### 10.2.2 String

**🟢 Beginner Example**

```python
slug = db.Column(db.String(120), unique=True, nullable=False)
```

**🟡 Intermediate Example** — `Unicode` vs `String` in SA 2: typically `String` with UTF8 DB.

**🔴 Expert Example** — `String(50)` length matches UI + DB index limits.

**🌍 Real-Time Example** — product slug in URL.

---

### 10.2.3 Boolean

**🟢 Beginner Example**

```python
is_active = db.Column(db.Boolean, default=True, nullable=False)
```

**🟡 Intermediate Example** — tri-state with `nullable=True` for “unknown”.

**🔴 Expert Example** — DB without native bool: `SmallInteger` 0/1.

**🌍 Real-Time Example** — SaaS feature gate `sso_enabled`.

---

### 10.2.4 DateTime

**🟢 Beginner Example**

```python
from datetime import datetime

created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
```

**🟡 Intermediate Example** — timezone-aware: store UTC, use `datetime.now(timezone.utc)` on Python 3.11+.

**🔴 Expert Example** — server-side `func.now()` default.

**🌍 Real-Time Example** — order placed_at for e‑commerce analytics.

---

### 10.2.5 Float

**🟢 Beginner Example**

```python
rating_avg = db.Column(db.Float, default=0.0)
```

**🟡 Intermediate Example** — prefer `Numeric(10,2)` for money.

**🔴 Expert Example** — statistical aggregates may still return floats; round at boundary.

**🌍 Real-Time Example** — social post engagement rate (display only).

---

### 10.2.6 Text

**🟢 Beginner Example**

```python
body = db.Column(db.Text, nullable=False)
```

**🟡 Intermediate Example** — large content: consider offloading to object storage, store URL.

**🔴 Expert Example** — full-text index external to ORM.

**🌍 Real-Time Example** — blog/markdown body.

---

### 10.2.7 JSON

**🟢 Beginner Example**

```python
settings = db.Column(db.JSON, nullable=False, default=dict)
```

**🟡 Intermediate Example** — Postgres `JSONB` via `db.JSON` dialect capabilities.

**🔴 Expert Example** — schema validation in application layer (pydantic).

**🌍 Real-Time Example** — SaaS tenant theme JSON.

---

### 10.2.8 Enum

**🟢 Beginner Example**

```python
import enum

class OrderStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"

class Order(db.Model):
    status = db.Column(db.Enum(OrderStatus), nullable=False, default=OrderStatus.pending)
```

**🟡 Intermediate Example** — native enum vs string storage tradeoffs.

**🔴 Expert Example** — Alembic migrations when enum values change.

**🌍 Real-Time Example** — e‑commerce fulfillment states.

---

## 10.3 Column Constraints

### 10.3.1 Primary Key

**🟢 Beginner Example**

```python
id = db.Column(db.Integer, primary_key=True)
```

**🟡 Intermediate Example** — composite primary key:

```python
class Membership(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, primary_key=True)
```

**🔴 Expert Example** — UUID primary keys for public identifiers.

**🌍 Real-Time Example** — SaaS: internal int PK + external UUID.

---

### 10.3.2 Unique Constraint

**🟢 Beginner Example**

```python
email = db.Column(db.String(255), unique=True)
```

**🟡 Intermediate Example** — composite unique:

```python
__table_args__ = (db.UniqueConstraint("tenant_id", "slug", name="uq_tenant_slug"),)
```

**🔴 Expert Example** — partial unique index for soft-deleted rows (Postgres).

**🌍 Real-Time Example** — multi-tenant slug uniqueness per org.

---

### 10.3.3 Not Null

**🟢 Beginner Example**

```python
name = db.Column(db.String(120), nullable=False)
```

**🟡 Intermediate Example** — optional profile fields `nullable=True`.

**🔴 Expert Example** — check `nullable=False` matches migration defaults to avoid deploy failures.

**🌍 Real-Time Example** — legal acceptance timestamp non-null after GDPR flow.

---

### 10.3.4 Default Values

**🟢 Beginner Example**

```python
role = db.Column(db.String(20), nullable=False, default="member")
```

**🟡 Intermediate Example** — callable default `default=dict` caution: use `default=lambda: {}` or `default=dict` only if SQLAlchemy handles mutable (prefer `default=dict` with JSON type carefully).

**🔴 Expert Example** — `server_default` for DB-enforced defaults.

**🌍 Real-Time Example** — `created_at` default now() at DB level for consistency across app versions.

---

### 10.3.5 Server Defaults

**🟢 Beginner Example**

```python
from sqlalchemy import text

created_at = db.Column(db.DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False)
```

**🟡 Intermediate Example** — `server_default` for boolean false.

**🔴 Expert Example** — database-generated UUID:

```python
from sqlalchemy.dialects.postgresql import UUID
import uuid

public_id = db.Column(UUID(as_uuid=True), default=uuid.uuid4)
```

**🌍 Real-Time Example** — microservices writing same table: trust server clock for `updated_at`.

---

### 10.3.6 Check Constraints

**🟢 Beginner Example**

```python
from sqlalchemy import CheckConstraint

class Coupon(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    percent_off = db.Column(db.Integer, nullable=False)
    __table_args__ = (CheckConstraint("percent_off BETWEEN 1 AND 90", name="ck_percent"),)
```

**🟡 Intermediate Example** — enforce non-negative inventory.

**🔴 Expert Example** — cross-row checks often require triggers; keep simple checks in DB.

**🌍 Real-Time Example** — e‑commerce discount rules enforced at DB for safety.

---

## 10.4 Creating and Dropping Tables

### 10.4.1 db.create_all()

Creates tables for all models registered on metadata; **does not** migrate existing schema.

**🟢 Beginner Example**

```python
from extensions import db
from flask import Flask

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db.init_app(app)

with app.app_context():
    db.create_all()
```

**🟡 Intermediate Example** — tests:

```python
@pytest.fixture()
def app():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
```

**🔴 Expert Example** — `create_all(bind="warehouse")` for binds.

**🌍 Real-Time Example** — dev bootstrap only; production uses Alembic.

---

### 10.4.2 db.drop_all()

**🟢 Beginner Example**

```python
with app.app_context():
    db.drop_all()
```

**🟡 Intermediate Example** — destructive tests fixture.

**🔴 Expert Example** — FK dependency order; drop_all may fail if circular—use migrations in prod.

**🌍 Real-Time Example** — never call in production except DR drills with backups.

---

### 10.4.3 Table Creation

Under the hood `metadata.create_all(engine)`.

**🟢 Beginner Example** — single engine.

**🟡 Intermediate Example** — create specific tables:

```python
from sqlalchemy import MetaData
# Usually prefer migrations; programmatic for dynamic plugins
```

**🔴 Expert Example** — separate metadata for plugin isolation.

**🌍 Real-Time Example** — SaaS customer-specific auxiliary tables (advanced; often avoid).

---

### 10.4.4 Table Dropping

**🟢 Beginner Example** — `drop_all()`.

**🟡 Intermediate Example** — `DROP TABLE` via migration downgrade.

**🔴 Expert Example** — archive data to cold storage before drop.

**🌍 Real-Time Example** — retire legacy `legacy_invoices` after dual-write period.

---

### 10.4.5 Conditional Creation

**🟢 Beginner Example**

```python
from sqlalchemy import inspect

with app.app_context():
    insp = inspect(db.engine)
    if not insp.has_table("users"):
        db.create_all()
```

**🟡 Intermediate Example** — feature-flagged optional modules.

**🔴 Expert Example** — race conditions in multi-worker startup—prefer migrations.

**🌍 Real-Time Example** — one-off script in k8s Job, not web workers.

---

## 10.5 CRUD Operations

### 10.5.1 Create Records

**🟢 Beginner Example**

```python
u = User(username="ada")
db.session.add(u)
db.session.commit()
```

**🟡 Intermediate Example** — `db.session.add_all([u1, u2])`.

**🔴 Expert Example** — `session.flush()` to get PK before commit in same transaction.

**🌍 Real-Time Example** — signup creates `User` + `Profile` rows atomically.

---

### 10.5.2 Read Records

**🟢 Beginner Example**

```python
user = db.session.get(User, 1)
```

**🟡 Intermediate Example** — `db.session.execute(select(User).where(User.email == email)).scalar_one_or_none()`.

**🔴 Expert Example** — `options(selectinload(User.posts))` to avoid N+1.

**🌍 Real-Time Example** — product detail page loads product + images.

---

### 10.5.3 Update Records

**🟢 Beginner Example**

```python
user = db.session.get(User, 1)
user.username = "ada_lovelace"
db.session.commit()
```

**🟡 Intermediate Example** — bulk update:

```python
from sqlalchemy import update
db.session.execute(update(User).where(User.is_active.is_(False)).values(deleted_at=datetime.utcnow()))
db.session.commit()
```

**🔴 Expert Example** — optimistic locking with version column.

**🌍 Real-Time Example** — inventory decrement with `WHERE stock >= :qty`.

---

### 10.5.4 Delete Records

**🟢 Beginner Example**

```python
user = db.session.get(User, 1)
db.session.delete(user)
db.session.commit()
```

**🟡 Intermediate Example** — soft delete:

```python
user.deleted_at = datetime.utcnow()
db.session.commit()
```

**🔴 Expert Example** — cascade rules via relationships (see Relationships notes).

**🌍 Real-Time Example** — GDPR: anonymize instead of hard delete social content.

---

### 10.5.5 Bulk Operations

**🟢 Beginner Example** — `add_all`.

**🟡 Intermediate Example** — `session.bulk_insert_mappings(User, dict_rows)`.

**🔴 Expert Example** — `bulk_save_objects` bypasses some ORM events—know tradeoffs.

**🌍 Real-Time Example** — nightly catalog import from supplier CSV.

---

## 10.6 Querying

### 10.6.1 Basic Queries

SQLAlchemy 2 style with `select()`.

**🟢 Beginner Example**

```python
from sqlalchemy import select

stmt = select(User).where(User.username == "ada")
user = db.session.execute(stmt).scalar_one_or_none()
```

**🟡 Intermediate Example** — legacy `User.query.filter_by(username="ada").first()` still seen in Flask-SQLAlchemy 3 docs; prefer `select` for new code.

**🔴 Expert Example** — `execution_options(populate_existing=True)` for cache coherence patterns.

**🌍 Real-Time Example** — SaaS admin user lookup by email.

---

### 10.6.2 Filtering filter / filter_by

**🟢 Beginner Example**

```python
stmt = select(User).filter_by(username="ada")
```

**🟡 Intermediate Example**

```python
stmt = select(User).where(User.created_at >= datetime(2026, 1, 1))
```

**🔴 Expert Example** — composable filters:

```python
stmt = select(Product)
if category:
    stmt = stmt.where(Product.category == category)
if min_price is not None:
    stmt = stmt.where(Product.price_cents >= min_price)
```

**🌍 Real-Time Example** — e‑commerce faceted search parameters.

---

### 10.6.3 Ordering

**🟢 Beginner Example**

```python
stmt = select(Post).order_by(Post.created_at.desc())
```

**🟡 Intermediate Example** — multi-column:

```python
stmt = select(Order).order_by(Order.placed_at.desc(), Order.id.desc())
```

**🔴 Expert Example** — `nulls_last()` dialect-specific.

**🌍 Real-Time Example** — social feed by `published_at`, tie-break `id`.

---

### 10.6.4 Limiting / Offsetting

**🟢 Beginner Example**

```python
stmt = select(Post).order_by(Post.id.desc()).limit(20)
```

**🟡 Intermediate Example** — pagination:

```python
page = 3
per = 20
stmt = stmt.offset((page - 1) * per).limit(per)
```

**🔴 Expert Example** — keyset pagination on `(created_at, id)` for large datasets.

**🌍 Real-Time Example** — infinite scroll API without deep offsets.

---

### 10.6.5 Query Methods

`where`, `join`, `outerjoin`, `group_by`, `having`, `distinct`, `count`.

**🟢 Beginner Example**

```python
count = db.session.scalar(select(func.count()).select_from(User))
```

**🟡 Intermediate Example**

```python
stmt = select(func.count(Order.id)).where(Order.status == "paid")
```

**🔴 Expert Example** — `lateral` joins for complex recommendations.

**🌍 Real-Time Example** — dashboard KPIs.

---

## 10.7 Advanced Queries

### 10.7.1 Joins

**🟢 Beginner Example**

```python
stmt = select(Order, Customer).join(Customer, Order.customer_id == Customer.id)
```

**🟡 Intermediate Example** — relationship-driven:

```python
stmt = select(Order).join(Order.customer).where(Customer.country == "US")
```

**🔴 Expert Example** — `selectinload` / `joinedload` loading strategies.

**🌍 Real-Time Example** — e‑commerce packing list: orders + line items + SKUs.

---

### 10.7.2 Subqueries

**🟢 Beginner Example**

```python
subq = select(func.count(Post.id)).where(Post.author_id == User.id).scalar_subquery()
stmt = select(User).where(subq > 5)
```

**🟡 Intermediate Example** — derived table for top spenders.

**🔴 Expert Example** — correlated subquery performance tuning with indexes.

**🌍 Real-Time Example** — SaaS “power users” segment.

---

### 10.7.3 Aggregation

**🟢 Beginner Example**

```python
stmt = select(func.sum(Order.total_cents)).where(Order.user_id == 1)
```

**🟡 Intermediate Example**

```python
stmt = select(Order.user_id, func.sum(Order.total_cents)).group_by(Order.user_id)
```

**🔴 Expert Example** — window functions:

```python
from sqlalchemy import over
stmt = select(Order.user_id, Order.total_cents, func.rank().over(order_by=Order.total_cents.desc()))
```

**🌍 Real-Time Example** — sales leaderboard.

---

### 10.7.4 Grouping

**🟢 Beginner Example** — see aggregation.

**🟡 Intermediate Example** — `HAVING`:

```python
stmt = (
    select(Product.category, func.count(Product.id))
    .group_by(Product.category)
    .having(func.count(Product.id) > 10)
)
```

**🔴 Expert Example** — cube/rollup via raw SQL for BI.

**🌍 Real-Time Example** — e‑commerce category performance report.

---

### 10.7.5 Complex Filters

**🟢 Beginner Example** — `and_`, `or_`:

```python
from sqlalchemy import and_, or_

stmt = select(User).where(and_(User.is_active.is_(True), or_(User.role == "admin", User.role == "staff")))
```

**🟡 Intermediate Example** — `in_`:

```python
stmt = select(Product).where(Product.sku.in_(skus))
```

**🔴 Expert Example** — full-text `match` dialect-specific.

**🌍 Real-Time Example** — moderation queue filters.

---

## 10.8 Session Management

### 10.8.1 Session Lifecycle

Session begins on first use, flushed before queries as needed, committed or rolled back.

**🟢 Beginner Example**

```python
with db.session.begin():
    db.session.add(user)
```

**🟡 Intermediate Example** — explicit `begin_nested()` for savepoint.

**🔴 Expert Example** — `session.expire_all()` after bulk updates.

**🌍 Real-Time Example** — request-scoped session in Flask-SQLAlchemy.

---

### 10.8.2 Session States

Objects transition: transient → pending → persistent → detached.

**🟢 Beginner Example**

```python
u = User(username="x")  # transient
db.session.add(u)       # pending -> persistent after flush
db.session.commit()     # persistent in DB; still attached
```

**🟡 Intermediate Example** — `db.session.close()` detaches in some configurations.

**🔴 Expert Example** — `make_transient()` for cloning patterns.

**🌍 Real-Time Example** — returning ORM objects from service layer to view—watch detached access.

---

### 10.8.3 Committing Changes

**🟢 Beginner Example**

```python
db.session.commit()
```

**🟡 Intermediate Example** — commit once per request after all work succeeds.

**🔴 Expert Example** — split read-only requests: no commit.

**🌍 Real-Time Example** — webhook handler: commit after idempotency key insert.

---

### 10.8.4 Rolling Back

**🟢 Beginner Example**

```python
try:
    db.session.add(order)
    db.session.commit()
except Exception:
    db.session.rollback()
    raise
```

**🟡 Intermediate Example** — nested rollback to savepoint.

**🔴 Expert Example** — retry only for serialization errors.

**🌍 Real-Time Example** — checkout failure restores cart transaction.

---

### 10.8.5 Session Cleanup

Flask-SQLAlchemy removes session at teardown; in scripts use `app.app_context()`.

**🟢 Beginner Example**

```python
with app.app_context():
    do_work()
```

**🟡 Intermediate Example** — Celery: push app context per task.

**🔴 Expert Example** — `scoped_session` custom (rare with Flask-SQLAlchemy).

**🌍 Real-Time Example** — management commands running batch jobs.

---

## Best Practices

1. Prefer **SQLAlchemy 2.0** `select()` style for new projects.
2. Use **transactions** around use-case operations, not per single row ad hoc.
3. Model **money** as integer cents or `Numeric`, not `Float`.
4. Add **DB constraints** matching ORM constraints (unique, check).
5. Avoid **mutable default** pitfalls (`default=list` vs `default=lambda: []` for columns—use `default=dict` carefully with JSON).
6. **Index** foreign keys and frequent filter columns.
7. Profile **N+1** queries; use eager loading intentionally.
8. Keep **models thin**; domain logic in services.
9. **UTC** timestamps in DB; convert in UI.
10. Use **migrations** for production schema (see Relationships & Migrations notes).

**🟢 Beginner Example** — simple service function wrapping commit.

**🟡 Intermediate Example** — repository pattern per aggregate.

**🔴 Expert Example** — outbox table for reliable side effects.

**🌍 Real-Time Example** — e‑commerce: never commit order without payment idempotency record.

---

## Common Mistakes to Avoid

1. **Implicit commits** scattered across views (hard to reason).
2. **DetachedInstanceError** when accessing unloaded relations outside session.
3. **Race conditions** on read-modify-write counters—use SQL `UPDATE ... SET x = x + 1`.
4. **Missing indexes** on FK columns.
5. **Using `merge()`** without understanding identity map semantics.
6. **Large `limit` offsets** on big tables.
7. **Storing floats for currency**.
8. **Relying on `create_all()`** in production.
9. **Catching broad exceptions** and swallowing rollback needs.
10. **Global session** misuse in threads.

**🟢 Beginner Example** — fix float: `Numeric(12, 2)`.

**🟡 Intermediate Example** — fix counter: `update(Product).values(stock=Product.stock - 1)`.

**🔴 Expert Example** — pessimistic locking `with_for_update()` for hot SKU.

**🌍 Real-Time Example** — flash sale: row-level lock on inventory row.

---

## Comparison Tables

### `get` vs `select().where().first()`

| Method | Use |
|--------|-----|
| `session.get(Model, pk)` | Primary key lookup |
| `select().where(...).limit(1)` | Arbitrary predicates |

### Loading strategies

| Strategy | Pros | Cons |
|----------|------|------|
| lazy load | Simple | N+1 risk |
| joinedload | Single query join | Wide rows/cartesian |
| selectinload | Second query IN list | Extra round trip |

### CRUD via ORM vs Core

| Layer | Best for |
|-------|----------|
| ORM | Domain objects, relations |
| SQLAlchemy Core | Bulk, reporting, tight SQL |

---

*End of SQLAlchemy ORM notes — Flask 3.1.3, Python 3.9+.*
