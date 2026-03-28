# Database Programming in Python

Python connects to relational engines (SQLite, PostgreSQL, MySQL) and document stores (MongoDB) for APIs, ETL, analytics, and microservices. This guide balances raw SQL literacy with ORM patterns and production connection handling.

---

## 📑 Table of Contents

1. [28.1 SQL Basics](#281-sql-basics)
   - [28.1.1 Core concepts](#2811-core-concepts)
   - [28.1.2 `SELECT` and projections](#2812-select-and-projections)
   - [28.1.3 `WHERE` and filtering](#2813-where-and-filtering)
   - [28.1.4 `JOIN` patterns](#2814-join-patterns)
   - [28.1.5 Aggregations](#2815-aggregations)
   - [28.1.6 `ORDER BY`, limits, paging](#2816-order-by-limits-paging)
2. [28.2 SQLite](#282-sqlite)
   - [28.2.1 The `sqlite3` module](#2821-the-sqlite3-module)
   - [28.2.2 Connecting](#2822-connecting)
   - [28.2.3 Creating tables](#2823-creating-tables)
   - [28.2.4 Inserting data](#2824-inserting-data)
   - [28.2.5 Querying](#2825-querying)
   - [28.2.6 Updating and deleting](#2826-updating-and-deleting)
   - [28.2.7 Transactions](#2827-transactions)
3. [28.3 SQLAlchemy ORM](#283-sqlalchemy-orm)
   - [28.3.1 Setup and engine](#2831-setup-and-engine)
   - [28.3.2 Declarative base](#2832-declarative-base)
   - [28.3.3 Table mapping](#2833-table-mapping)
   - [28.3.4 Relationships](#2834-relationships)
   - [28.3.5 Sessions](#2835-sessions)
   - [28.3.6 Query interface](#2836-query-interface)
   - [28.3.7 Eager loading](#2837-eager-loading)
   - [28.3.8 Lazy loading](#2838-lazy-loading)
4. [28.4 PostgreSQL](#284-postgresql)
   - [28.4.1 `psycopg2` / `psycopg`](#2841-psycopg2--psycopg)
   - [28.4.2 Connection management](#2842-connection-management)
   - [28.4.3 Queries and cursors](#2843-queries-and-cursors)
   - [28.4.4 Prepared statements](#2844-prepared-statements)
   - [28.4.5 Transactions](#2845-transactions)
   - [28.4.6 Connection pooling](#2846-connection-pooling)
5. [28.5 MySQL](#285-mysql)
   - [28.5.1 `mysql-connector-python`](#2851-mysql-connector-python)
   - [28.5.2 `PyMySQL`](#2852-pymysql)
   - [28.5.3 Connection](#2853-connection)
   - [28.5.4 CRUD operations](#2854-crud-operations)
   - [28.5.5 Transactions](#2855-transactions)
   - [28.5.6 Error handling](#2856-error-handling)
6. [28.6 MongoDB](#286-mongodb)
   - [28.6.1 `pymongo`](#2861-pymongo)
   - [28.6.2 Connecting](#2862-connecting)
   - [28.6.3 Insert](#2863-insert)
   - [28.6.4 Query](#2864-query)
   - [28.6.5 Update and delete](#2865-update-and-delete)
   - [28.6.6 Aggregation pipelines](#2866-aggregation-pipelines)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 28.1 SQL Basics

### 28.1.1 Core concepts

**Beginner Level:** A **relational database** stores rows in **tables** with **columns** and types. **Primary keys** uniquely identify rows; **foreign keys** reference other tables—like `orders.customer_id` → `customers.id` in an **e-commerce** schema.

```python
# Beginner: conceptual tables (not executable SQL in Python)
TABLES = {
    "customers": ["id", "email", "created_at"],
    "orders": ["id", "customer_id", "total_cents", "status"],
}
```

**Intermediate Level:** **ACID** transactions group statements that succeed or fail together. **Isolation levels** affect phantom reads in **payment** systems. **Indexes** speed lookups but slow writes.

```python
# Intermediate: pseudo workflow for a checkout service
# BEGIN -> INSERT order -> INSERT items -> UPDATE inventory -> COMMIT
STEPS = ["BEGIN", "INSERT_ORDER", "INSERT_ITEMS", "UPDATE_STOCK", "COMMIT"]
```

**Expert Level:** **MVCC** (PostgreSQL) vs **locking** models, **partitioning** for **time-series** telemetry, and **read replicas** for **reporting** workloads—choose engines and schemas with **SLOs** in mind.

```python
# Expert: configuration knobs as data (illustrative)
DB_CONFIG = {
    "isolation": "READ_COMMITTED",
    "pool_size": 20,
    "max_overflow": 10,
    "statement_timeout_ms": 5000,
}
```

#### Key Points — core concepts

- **Schema** defines tables, constraints, indexes.
- **Normalization** reduces duplication; **denormalization** speeds reads.
- **Migrations** version schema changes—never hand-edit prod without process.

---

### 28.1.2 `SELECT` and projections

**Beginner Level:** `SELECT` chooses columns (projection). Fetch only what your **mobile API** needs to save bandwidth.

```sql
-- Beginner: minimal columns
SELECT id, title FROM posts WHERE published = 1;
```

**Intermediate Level:** **Expressions** and **aliases** shape **analytics** exports.

```sql
-- Intermediate: computed column
SELECT
  order_id,
  total_cents / 100.0 AS total_usd
FROM orders;
```

**Expert Level:** **Window functions** (`ROW_NUMBER`, `PARTITION BY`) power **leaderboards** without N+1 queries in Python.

```sql
-- Expert: top N per group
SELECT * FROM (
  SELECT
    user_id,
    score,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY score DESC) AS rn
  FROM game_scores
) t
WHERE rn <= 3;
```

#### Key Points — `SELECT`

- Avoid `SELECT *` in hot paths.
- Use **`LIMIT`** during exploration to protect shared dev DBs.
- Name columns explicitly in **INSERT...SELECT**.

---

### 28.1.3 `WHERE` and filtering

**Beginner Level:** `WHERE` filters rows before aggregation—like showing **open tickets** only.

```sql
WHERE status = 'open' AND priority >= 2;
```

**Intermediate Level:** **`IN`**, **`BETWEEN`**, **`LIKE`**, and **`NULL` handling** (`IS NULL`) matter for **search** endpoints.

```sql
WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31'
  AND email IS NOT NULL;
```

**Expert Level:** **Sargable** predicates use indexed columns without wrapping them in functions (`WHERE created_at >= :start` beats `WHERE DATE(created_at) = :d` on many engines).

```sql
-- Expert: parameter-friendly
WHERE tenant_id = :tenant_id AND sku = :sku;
```

#### Key Points — `WHERE`

- **Bind parameters**—never interpolate user strings into SQL in apps.
- **`OR`** across different columns can defeat indexes—consider **UNION**.
- **`EXPLAIN`** plans reveal full scans.

---

### 28.1.4 `JOIN` patterns

**Beginner Level:** **`INNER JOIN`** keeps rows that match both tables—**orders** with **customers**.

```sql
SELECT o.id, c.email
FROM orders o
JOIN customers c ON c.id = o.customer_id;
```

**Intermediate Level:** **`LEFT JOIN`** preserves left rows even without matches—useful for **optional** profiles.

```sql
SELECT u.id, p.bio
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id;
```

**Expert Level:** **`LATERAL`** (Postgres) or **subqueries** for **per-row** top-K; watch **cardinality explosion** with **many-to-many** join tables in **marketplace** listings.

```sql
-- Expert: many-to-many join table
SELECT l.title, t.name
FROM listings l
JOIN listing_tags lt ON lt.listing_id = l.id
JOIN tags t ON t.id = lt.tag_id
WHERE l.id = :listing_id;
```

#### Key Points — `JOIN`

- Qualify columns with **aliases** to avoid ambiguity.
- **Join order** hints are rarely needed—trust the optimizer after indexing.
- **Anti-join** patterns (`NOT EXISTS`) often beat `NOT IN` with NULLs.

---

### 28.1.5 Aggregations

**Beginner Level:** `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` collapse rows—**daily sales** dashboards.

```sql
SELECT DATE(created_at) AS day, SUM(total_cents) AS revenue
FROM orders
GROUP BY DATE(created_at);
```

**Intermediate Level:** **`HAVING`** filters **groups** after aggregation (unlike `WHERE` on raw rows).

```sql
SELECT customer_id, COUNT(*) AS n
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 5;
```

**Expert Level:** Combine with **window aggregates** for **running totals** in **billing** without round trips.

```sql
SELECT
  month,
  revenue,
  SUM(revenue) OVER (ORDER BY month) AS cumulative
FROM monthly_revenue;
```

#### Key Points — aggregations

- **`COUNT(*)`** vs **`COUNT(column)`** differs on NULLs.
- **Group by** all non-aggregated selected columns (SQL standard).
- Large **`GROUP BY`** may need **approximate** algorithms elsewhere (HyperLogLog in Redis, etc.).

---

### 28.1.6 `ORDER BY`, limits, paging

**Beginner Level:** `ORDER BY created_at DESC` shows **newest first**; `LIMIT 20` caps page size.

```sql
SELECT * FROM events
ORDER BY created_at DESC
LIMIT 20;
```

**Intermediate Level:** **Keyset pagination** (`WHERE id < :cursor ORDER BY id DESC LIMIT 20`) scales better than **`OFFSET`** for **infinite scroll** feeds.

```sql
-- Intermediate: keyset (tie-break with id)
WHERE (created_at, id) < (:ts, :id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

**Expert Level:** **Stable sort** requires unique tie-breakers; **replica lag** may reorder pages—design **UX** accordingly for **social** apps.

```python
# Expert: API handler returns next cursor tuple
def page_events(cursor_ts, cursor_id, limit=20):
    # execute SQL with keyset parameters
    return {"rows": [], "next": (cursor_ts, cursor_id)}
```

#### Key Points — `ORDER BY`

- **Indexes** should match `ORDER BY` + `WHERE` patterns.
- **`OFFSET` large values** are expensive on big tables.
- Document **sort fields** in **public API** contracts.

---

## 28.2 SQLite

### 28.2.1 The `sqlite3` module

**Beginner Level:** **SQLite** is a file-backed SQL engine in the standard library—ideal for **CLI tools**, **embedded** configs, and **tests**.

```python
import sqlite3

print(sqlite3.sqlite_version)
```

**Intermediate Level:** SQLite suits **read-mostly** **edge** gateways; avoid high concurrent **writers** on network filesystems.

```python
# Intermediate: in-memory DB for unit tests
conn = sqlite3.connect(":memory:")
```

**Expert Level:** Enable **`WAL`** mode, tune **`busy_timeout`**, and use **`PRAGMA foreign_keys=ON`** for **referential integrity** in **mobile sync** clients.

```python
# Expert: pragmas after connect
conn = sqlite3.connect("app.db")
conn.execute("PRAGMA journal_mode=WAL")
conn.execute("PRAGMA foreign_keys=ON")
```

#### Key Points — `sqlite3`

- Threading: use **`check_same_thread=False`** only with locks or connection-per-thread.
- **Types** are flexible—enforce in app layer if needed.
- **Backup API** (`conn.backup`) for online copies.

---

### 28.2.2 Connecting

**Beginner Level:** `sqlite3.connect("file.db")` opens (or creates) a database file.

```python
import sqlite3

conn = sqlite3.connect("inventory.db")
cur = conn.cursor()
cur.execute("SELECT 1")
print(cur.fetchone())
conn.close()
```

**Intermediate Level:** Use **context managers** for commits/rollbacks; set **`row_factory`** for dict-like rows.

```python
import sqlite3


def connect_db(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn
```

**Expert Level:** **`uri=True`** connections support **`mode=ro`**, shared cache, and **immutable** DBs for **CDN**-distributed static datasets.

```python
# Expert: read-only URI
import sqlite3

conn = sqlite3.connect("file:inventory.db?mode=ro", uri=True)
```

#### Key Points — connecting

- One connection per **request** is simple but slow—pool externally if needed.
- Always **close** or use context managers.
- Store DB paths in **config**, not hard-coded strings.

---

### 28.2.3 Creating tables

**Beginner Level:** `CREATE TABLE` defines schema—**products** with SKU and price.

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute(
    """
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      price_cents INTEGER NOT NULL
    )
    """
)
conn.commit()
```

**Intermediate Level:** **Foreign keys** + **`ON DELETE CASCADE`** model **order lines** lifecycle.

```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL
);
```

**Expert Level:** **Migrations** (Alembic, custom scripts) version DDL; avoid destructive changes without **backfill** plans in **zero-downtime** services.

```python
# Expert: idempotent migration sketch
DDL = [
    "ALTER TABLE users ADD COLUMN last_login TEXT",
    "CREATE INDEX idx_users_email ON users(email)",
]
```

#### Key Points — creating tables

- Choose **`INTEGER PRIMARY KEY`** for rowids in SQLite.
- Index **foreign keys** and frequent filters.
- Document **charset** expectations (UTF-8 text).

---

### 28.2.4 Inserting data

**Beginner Level:** `INSERT INTO` adds rows; use **placeholders** `?` for values.

```python
conn.execute(
    "INSERT INTO products(sku, price_cents) VALUES (?, ?)",
    ("SKU-1", 1999),
)
conn.commit()
```

**Intermediate Level:** **`executemany`** batches **ETL** inserts efficiently.

```python
rows = [("SKU-%d" % i, 100 + i) for i in range(1000)]
conn.executemany(
    "INSERT INTO products(sku, price_cents) VALUES (?, ?)", rows
)
conn.commit()
```

**Expert Level:** Wrap large loads in **transactions**; tune **`synchronous`** pragma tradeoffs for **bulk import** jobs.

```python
# Expert: transaction boundary
with conn:
    conn.executemany(
        "INSERT INTO events(ts, kind) VALUES (?, ?)", event_batch
    )
```

#### Key Points — inserting

- Handle **`UNIQUE`** violations with **app-level** retry or upsert patterns.
- **`INSERT OR REPLACE`** vs **`ON CONFLICT`**—know SQLite version support.
- Validate **types** before insert to avoid silent coercion surprises.

---

### 28.2.5 Querying

**Beginner Level:** `cursor.execute` + `fetchall`/`fetchone` retrieves rows.

```python
cur = conn.execute("SELECT sku, price_cents FROM products WHERE price_cents < ?", (500,))
for row in cur.fetchall():
    print(row)
```

**Intermediate Level:** **`Row` factory** enables **named** access—cleaner in **Flask** views.

```python
conn.row_factory = sqlite3.Row
row = conn.execute("SELECT * FROM products WHERE sku = ?", ("SKU-1",)).fetchone()
print(row["sku"], row["price_cents"])
```

**Expert Level:** For **analytics**, stream with **`fetchmany`** to bound memory on huge result sets.

```python
# Expert: chunked reads
cur = conn.execute("SELECT * FROM big_table")
while True:
    chunk = cur.fetchmany(1000)
    if not chunk:
        break
    process_chunk(chunk)
```

#### Key Points — querying

- Parameterize **all** external input.
- Use **indexes** to support frequent `WHERE` clauses.
- **`EXPLAIN QUERY PLAN`** in SQLite for debugging.

---

### 28.2.6 Updating and deleting

**Beginner Level:** `UPDATE` changes columns; `DELETE` removes rows—always constrain with **`WHERE`**.

```python
conn.execute(
    "UPDATE products SET price_cents = ? WHERE sku = ?",
    (1499, "SKU-1"),
)
conn.execute("DELETE FROM products WHERE sku = ?", ("SKU-999",))
conn.commit()
```

**Intermediate Level:** **`RETURNING`** (SQLite 3.35+) captures changed rows—handy for **audit** logs.

```sql
UPDATE inventory SET qty = qty - 1
WHERE sku = :sku AND qty > 0
RETURNING sku, qty;
```

**Expert Level:** **Soft deletes** (`deleted_at`) preserve **compliance** history; pair with **partial indexes** `WHERE deleted_at IS NULL`.

```python
# Expert: soft delete pattern
conn.execute(
    "UPDATE users SET deleted_at = datetime('now') WHERE id = ?",
    (user_id,),
)
```

#### Key Points — update/delete

- Accidental **missing WHERE** is catastrophic—use **safe tooling** in prod.
- Consider **row-level security** at app layer if engine lacks RLS.
- **Cascade** rules must be tested.

---

### 28.2.7 Transactions

**Beginner Level:** `conn.commit()` persists changes; `rollback()` undoes since last commit.

```python
conn.execute("BEGIN")
try:
    conn.execute("INSERT INTO orders(id, total) VALUES (1, 1000)")
    conn.execute("INSERT INTO order_items(order_id, sku, qty) VALUES (1,'A',1)")
    conn.commit()
except Exception:
    conn.rollback()
    raise
```

**Intermediate Level:** Python 3.12+ **`connection.begin()`** context or SQLite **`with conn:`** auto-commits on success.

```python
with conn:
    conn.execute("UPDATE accounts SET balance = balance - 10 WHERE id = 1")
    conn.execute("UPDATE accounts SET balance = balance + 10 WHERE id = 2")
```

**Expert Level:** **Isolation** anomalies matter for **double-spend** prevention—use **appropriate** locking or **serializable** transactions when the business requires it.

```python
# Expert: retry on SQLITE_BUSY with backoff (sketch)
import time
import sqlite3


def with_retry(fn, retries=5):
    for i in range(retries):
        try:
            return fn()
        except sqlite3.OperationalError as e:
            if "locked" not in str(e).lower() or i == retries - 1:
                raise
            time.sleep(0.05 * (2**i))
```

#### Key Points — SQLite transactions

- SQLite **defaults** vary—be explicit with **`BEGIN IMMEDIATE`** for writers when needed.
- Keep transactions **short** to reduce lock contention.
- Test **concurrent** access patterns early.

---

## 28.3 SQLAlchemy ORM

### 28.3.1 Setup and engine

**Beginner Level:** Install **`sqlalchemy`**, create an **`Engine`**—your **connection factory** to PostgreSQL/SQLite.

```python
# Beginner: pip install sqlalchemy
from sqlalchemy import create_engine

engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)
```

**Intermediate Level:** Use **URL** env vars for **12-factor** apps; set **`pool_pre_ping`** for **cloud** DBs.

```python
import os
from sqlalchemy import create_engine

engine = create_engine(
    os.environ["DATABASE_URL"],
    pool_pre_ping=True,
    pool_size=10,
)
```

**Expert Level:** Split **read/write** engines with **routing** sessionmakers or **CQRS** services; monitor **pool overflow** with metrics.

```python
# Expert: separate URLs (illustrative)
from sqlalchemy import create_engine

write_engine = create_engine(os.environ["DB_PRIMARY"])
read_engine = create_engine(os.environ["DB_REPLICA"])
```

#### Key Points — setup

- Prefer **`2.0` style** (`select()`, `Session` patterns).
- **`echo=True`** only in dev—logs SQL noise and secrets risk.
- **`future=True`** flags were migration aids in 1.4—on 2.x defaults differ.

---

### 28.3.2 Declarative base

**Beginner Level:** Subclass **`DeclarativeBase`** to declare models as Python classes.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
```

**Intermediate Level:** **Mixins** add **`created_at`** timestamps across **microservice** models.

```python
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, func


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
```

**Expert Level:** **Abstract bases** (`__abstract__ = True`) share columns without tables; watch **mypy** plugins (`sqlalchemy2-stubs`).

```python
class Base(DeclarativeBase):
    pass


class SoftDeleteMixin:
    __abstract__ = True
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
```

#### Key Points — declarative base

- **Mapped[]** annotations improve IDE and **mypy** support.
- Keep **models** aligned with **migrations**.
- Avoid circular imports—use **`TYPE_CHECKING`** for relationships.

---

### 28.3.3 Table mapping

**Beginner Level:** **`__tablename__`** and **`mapped_column`** map to SQL types.

```python
class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True)
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
```

**Intermediate Level:** **Composite** keys, **enums**, and **JSON** columns model **flexible** **catalog** attributes.

```python
from sqlalchemy import Enum
import enum


class Status(enum.Enum):
    active = "active"
    archived = "archived"


class Listing(Base):
    __tablename__ = "listings"
    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[Status] = mapped_column(Enum(Status))
```

**Expert Level:** **`hybrid_property`** and **database-generated** columns bridge **derived** fields; use **server defaults** for **clock** consistency.

```python
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Numeric, Computed


class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[int] = mapped_column(primary_key=True)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2))
    tax: Mapped[float] = mapped_column(Numeric(12, 2))
    # Some databases support generated columns; fallback to app logic if not
```

#### Key Points — table mapping

- Match **DB constraints** (`UniqueConstraint`, `CheckConstraint`).
- Choose **Numeric** for money, not binary floats.
- **Large text**/`BYTEA`—stream when needed.

---

### 28.3.4 Relationships

**Beginner Level:** **`relationship()`** links models—**Customer** has many **Orders**.

```python
from sqlalchemy.orm import relationship


class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(primary_key=True)
    orders: Mapped[list["Order"]] = relationship(back_populates="customer")


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    customer: Mapped[Customer] = relationship(back_populates="orders")
```

**Intermediate Level:** **`cascade`** options control deletes; **`lazy` strategies** trade **N+1** vs memory.

```python
orders: Mapped[list["Order"]] = relationship(
    back_populates="customer", cascade="all, delete-orphan"
)
```

**Expert Level:** **Association objects** model **join tables** with extra columns (**subscription** features per **tenant**).

```python
from sqlalchemy import Table, Column, ForeignKey

subscription_features = Table(
    "subscription_features",
    Base.metadata,
    Column("subscription_id", ForeignKey("subscriptions.id")),
    Column("feature_id", ForeignKey("features.id")),
    Column("quota", Integer, nullable=False),
)
```

#### Key Points — relationships

- Always define **`ForeignKey`** on the **many** side.
- Prefer **`back_populates`** for explicit symmetry.
- Test **delete** cascades in **staging** with realistic data.

---

### 28.3.5 Sessions

**Beginner Level:** **`Session`** tracks objects and issues **`INSERT`/`UPDATE`** on flush/commit.

```python
from sqlalchemy.orm import Session

with Session(engine) as session:
    u = User(email="a@example.com")
    session.add(u)
    session.commit()
```

**Intermediate Level:** **`session.merge`**, **`expire_on_commit`**, and **detached** instances matter in **Celery** tasks passing IDs not ORM instances.

```python
def reattach(session: Session, user_id: int) -> User:
    return session.get(User, user_id)
```

**Expert Level:** **Scoped sessions** per request in **WSGI**; **`async_sessionmaker`** in **FastAPI** async stacks.

```python
# Expert: async session pattern (SQLAlchemy 2)
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

async_engine = create_async_engine("sqlite+aiosqlite:///:memory:")
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)

async with AsyncSessionLocal() as session:
    await session.execute(select(User).where(User.email == "x@y.com"))
```

#### Key Points — sessions

- One session per **unit of work**—avoid long-lived global sessions.
- **`rollback()`** clears failed transaction state.
- Do not share ORM objects across **threads** without care.

---

### 28.3.6 Query interface

**Beginner Level:** **`select(Model)`** builds queries; **`session.scalars`** returns ORM rows.

```python
from sqlalchemy import select

with Session(engine) as session:
    stmt = select(User).where(User.email == "a@example.com")
    user = session.scalars(stmt).first()
```

**Intermediate Level:** **Joins**, **`order_by`**, **`limit`**, and **`options`** compose **service-layer** queries.

```python
stmt = (
    select(Order)
    .join(Order.customer)
    .where(Customer.email.endswith("@corp.com"))
    .order_by(Order.created_at.desc())
    .limit(50)
)
```

**Expert Level:** **CTEs**, **`lateral`**, and **Core** expressions embed **complex** **reporting** SQL while returning ORM entities selectively.

```python
from sqlalchemy import func

stmt = (
    select(Customer.id, func.count(Order.id))
    .join(Order, Order.customer_id == Customer.id)
    .group_by(Customer.id)
    .having(func.count(Order.id) > 10)
)
```

#### Key Points — query interface

- Prefer **`2.0` select** over legacy `session.query`.
- Use **`session.execute`** for **Core** result rows.
- **`unique()`** needed when joining collections cause duplicates.

---

### 28.3.7 Eager loading

**Beginner Level:** **`selectinload`** batches load **collections**—fixes **N+1** when returning **orders + lines** in an API.

```python
from sqlalchemy.orm import selectinload

stmt = select(Order).options(selectinload(Order.items))
```

**Intermediate Level:** **`joinedload`** uses SQL joins—good for **many-to-one**, can **duplicate** rows for **one-to-many**.

```python
from sqlalchemy.orm import joinedload

stmt = select(Order).options(joinedload(Order.customer))
```

**Expert Level:** **`contains_eager`** when you manually join for **filtering** but still want **ORM** population—advanced **search** endpoints.

```python
from sqlalchemy.orm import contains_eager

stmt = select(Order).join(Order.customer).options(contains_eager(Order.customer))
```

#### Key Points — eager loading

- Profile **N+1** with **SQL logging** or **Sentry** integrations.
- **`raise_on_sql`** testing hooks catch accidental lazy loads in **CI**.
- Balance **payload size** vs round trips.

---

### 28.3.8 Lazy loading

**Beginner Level:** Default **`lazy="select"`** loads relationships on attribute access—simple but risky in **loops**.

```python
for o in orders:  # each o.items triggers a query if not eager-loaded
    print(len(o.items))
```

**Intermediate Level:** **`lazy="raise"`** or **`noload`** in performance-critical paths to **fail fast**.

```python
items: Mapped[list["Item"]] = relationship(lazy="raise")
```

**Expert Level:** **Async** ORM requires **`selectinload`/`joinedload`** upfront—lazy IO is **not implicit** in async.

```python
# Expert: async must preload
stmt = select(Order).options(selectinload(Order.items))
result = await session.scalars(stmt)
orders = result.all()
```

#### Key Points — lazy loading

- Explicit loading strategy per **endpoint**.
- **Serialization** layers (`Pydantic`) may trigger lazy loads—control with **schemas**.
- Document **async** constraints for contributors.

---

## 28.4 PostgreSQL

### 28.4.1 `psycopg2` / `psycopg`

**Beginner Level:** **`psycopg`** (v3) and **`psycopg2`** are common PostgreSQL drivers—install via pip.

```bash
pip install "psycopg[binary]"  # v3
# or
pip install psycopg2-binary
```

**Intermediate Level:** Choose **v3** for **async** (`psycopg_pool`) and modern **types**; **v2** still widespread in **legacy** services.

```python
# Intermediate: psycopg3 connect
import psycopg

conn = psycopg.connect("dbname=app user=app host=localhost password=secret")
```

**Expert Level:** **Binary parameters**, **`COPY`**, and **LISTEN/NOTIFY** integrate with **event-driven** **pipelines**.

```python
# Expert: server-side cursor (psycopg3)
with conn.cursor(name="big") as cur:
    cur.execute("SELECT * FROM huge")
    for row in cur:
        process(row)
```

#### Key Points — drivers

- Pin **driver** versions in **lockfiles**.
- Use **`sslmode=require`** in cloud **RDS**.
- Prefer **`with conn:`** context managers.

---

### 28.4.2 Connection management

**Beginner Level:** Open connection, run queries, close—wrap in **functions** for **CLI** scripts.

```python
import psycopg

def main():
    with psycopg.connect("dbname=app user=app host=localhost") as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            print(cur.fetchone())

main()
```

**Intermediate Level:** **Pool** connections in **web** apps; avoid per-request **TCP** handshakes to **RDS**.

```python
from psycopg_pool import ConnectionPool

pool = ConnectionPool("dbname=app user=app host=localhost", min_size=1, max_size=20)
```

**Expert Level:** **Pgbouncer** in **transaction** pooling mode changes **session** semantics—avoid **prepared statements** that span transactions incorrectly.

```python
# Expert: health check query
def ping(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT 1")
```

#### Key Points — connection management

- **Timeouts** (`connect_timeout`, `options=-c statement_timeout=...`).
- **Rotate passwords** with **secrets manager** integration.
- **IAM auth** on cloud providers—use vendor docs.

---

### 28.4.3 Queries and cursors

**Beginner Level:** Parameterized queries with **`%s`** placeholders (psycopg style).

```python
with conn.cursor() as cur:
    cur.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    print(cur.fetchone())
```

**Intermediate Level:** **`RealDictCursor`** (psycopg2) / **`row_factory=dict_row`** (psycopg3) for **JSON** APIs.

```python
from psycopg.rows import dict_row

conn.row_factory = dict_row
```

**Expert Level:** **Server-side cursors** stream **ETL** without loading **millions** of rows into Python memory.

```python
# Expert: named cursor for chunked reads (psycopg2 example)
import psycopg2

conn = psycopg2.connect("dbname=app")
cur = conn.cursor(name="server_side")
cur.execute("SELECT * FROM events")
while True:
    rows = cur.fetchmany(5000)
    if not rows:
        break
    publish(rows)
cur.close()
conn.close()
```

#### Key Points — queries/cursors

- Never **format** SQL with f-strings for **user** input.
- Use **`EXPLAIN (ANALYZE, BUFFERS)`** for slow queries.
- **Binary** protocols for **bulk** loads.

---

### 28.4.4 Prepared statements

**Beginner Level:** Drivers **prepare** statements automatically for repeated **executions**—speeds **OLTP** APIs.

```python
# Repeated insert with same shape
SQL = "INSERT INTO events(kind, payload) VALUES (%s, %s::jsonb)"
with conn.cursor() as cur:
    for kind, payload in batch:
        cur.execute(SQL, (kind, payload))
```

**Intermediate Level:** **`PREPARE`** in SQL scripts for **DBA** workflows; apps rely on driver **binary** execution.

```sql
PREPARE upsert_user AS
INSERT INTO users(email) VALUES ($1)
ON CONFLICT (email) DO UPDATE SET last_seen = now();
```

**Expert Level:** **Pgbouncer** pooling modes impact **named prepared statements**—use **simple protocol** or **session** pooling when needed.

```python
# Expert: document deployment constraint
DEPLOY_NOTES = "Use session pooling if named prepared statements required"
```

#### Key Points — prepared statements

- Great for **hot** repeated queries.
- Watch **plan cache** bloat with **ad-hoc** dynamic SQL.
- **Parameter sniffing** can hurt—**statistics** tuning matters.

---

### 28.4.5 Transactions

**Beginner Level:** `conn.commit()` / `rollback()` demarcate **ACID** units—**wallet** transfers.

```python
with conn:
    with conn.cursor() as cur:
        cur.execute("UPDATE wallets SET balance = balance - %s WHERE id=%s", (10, 1))
        cur.execute("UPDATE wallets SET balance = balance + %s WHERE id=%s", (10, 2))
```

**Intermediate Level:** **Isolation levels** `READ COMMITTED` vs `REPEATABLE READ` vs `SERIALIZABLE`—pick based on **financial** **invariants**.

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- critical section
COMMIT;
```

**Expert Level:** **`SAVEPOINT`** for partial rollbacks in **multi-step** provisioning **workflows**.

```python
with conn:
    cur = conn.cursor()
    cur.execute("SAVEPOINT a")
    try:
        risky_operation(cur)
    except Exception:
        cur.execute("ROLLBACK TO SAVEPOINT a")
        raise
```

#### Key Points — Postgres transactions

- Keep transactions **short**; avoid **user think time** inside transactions.
- **Deadlocks** happen—**retry** with backoff idempotency keys.
- **`FOR UPDATE SKIP LOCKED`** for **job queues**.

---

### 28.4.6 Connection pooling

**Beginner Level:** Pools reuse TCP connections—**Gunicorn** workers each may need a **sized** pool.

```python
from psycopg_pool import ConnectionPool

pool = ConnectionPool(conninfo="dbname=app", min_size=2, max_size=10)

with pool.connection() as conn:
    ...
```

**Intermediate Level:** **SQLAlchemy `QueuePool`** integrates ORM + Postgres; tune **`pool_recycle`** below **idle timeouts** of **managed** DBs.

```python
engine = create_engine(url, pool_size=5, max_overflow=10, pool_recycle=280)
```

**Expert Level:** **RDS Proxy** / **PgBouncer** for **thousands** of **Lambda** invocations—watch **prepared statement** limitations and **credentials** rotation.

```python
# Expert: metrics to export
POOL_METRICS = ["pool.size", "pool.checked_out", "pool.overflow"]
```

#### Key Points — pooling

- **`pool_pre_ping`** avoids stale sockets after **network blips**.
- Do not **oversubscribe** total pool slots across **workers**.
- **Circuit breakers** when DB unhealthy.

---

## 28.5 MySQL

### 28.5.1 `mysql-connector-python`

**Beginner Level:** Official Oracle **connector**—`pip install mysql-connector-python`.

```python
import mysql.connector

conn = mysql.connector.connect(user="app", password="secret", host="127.0.0.1", database="shop")
cur = conn.cursor()
cur.execute("SELECT VERSION()")
print(cur.fetchone())
conn.close()
```

**Intermediate Level:** **Dictionary cursor** for **JSON** responses in **Flask**.

```python
conn = mysql.connector.connect(user="app", password="secret", host="127.0.0.1", database="shop")
cur = conn.cursor(dictionary=True)
cur.execute("SELECT id, email FROM users LIMIT 1")
print(cur.fetchone())
```

**Expert Level:** **C extension** vs pure Python builds affect **performance**—benchmark **batch** inserts for **ingestion** services.

```python
# Expert: executemany for batches
cur.executemany(
    "INSERT INTO events(ts, kind) VALUES (%s, %s)", [(1, "a"), (2, "b")]
)
conn.commit()
```

#### Key Points — mysql-connector

- **SSL** options for **cloud** **Aurora**/RDS.
- **Auth plugins** (`caching_sha2_password`)—match server config.
- Handle **`mysql.connector.Error`** explicitly.

---

### 28.5.2 `PyMySQL`

**Beginner Level:** Pure-Python driver—easy install, good for **Lambda**-like environments.

```bash
pip install pymysql
```

```python
import pymysql

conn = pymysql.connect(host="127.0.0.1", user="app", password="secret", database="shop")
```

**Intermediate Level:** **`DictCursor`** mirrors **dict** rows.

```python
import pymysql.cursors

conn = pymysql.connect(
    host="127.0.0.1",
    user="app",
    password="secret",
    database="shop",
    cursorclass=pymysql.cursors.DictCursor,
)
```

**Expert Level:** **`SSCursor`** streams large result sets—**ETL** from **legacy** **MySQL** warehouses.

```python
import pymysql.cursors

conn = pymysql.connect(
    host="127.0.0.1",
    user="app",
    password="secret",
    database="shop",
    cursorclass=pymysql.cursors.SSCursor,
)
with conn.cursor() as cur:
    cur.execute("SELECT * FROM big_table")
    for row in cur:
        process(row)
```

#### Key Points — PyMySQL

- Often paired with **SQLAlchemy** `mysql+pymysql://`.
- **Thread safety**—one connection per thread typically.
- Charset **`utf8mb4`** for full Unicode.

---

### 28.5.3 Connection

**Beginner Level:** Parameters: **host**, **user**, **password**, **database**, **port**.

```python
import pymysql

conn = pymysql.connect(host="db", port=3306, user="app", password="secret", database="shop")
```

**Intermediate Level:** **SSL** dict, **`connect_timeout`**, **`read_timeout`** for **resilient** **Kubernetes** services.

```python
conn = pymysql.connect(
    host="db",
    user="app",
    password="secret",
    database="shop",
    connect_timeout=5,
    read_timeout=10,
    write_timeout=10,
)
```

**Expert Level:** **IAM** or **vault**-issued credentials—**rotate** without restarts using **short-lived** passwords + **reconnect** logic.

```python
# Expert: reconnect helper
def get_conn():
    creds = fetch_creds_from_vault()
    return pymysql.connect(host="db", user=creds.user, password=creds.password, database="shop")
```

#### Key Points — MySQL connection

- Use **connection pools** (`SQLAlchemy`) in **web** stacks.
- **`AUTOCOMMIT`** behavior differs—be explicit.
- **`sql_mode`** strictness affects inserts.

---

### 28.5.4 CRUD operations

**Beginner Level:** Standard **`SELECT/INSERT/UPDATE/DELETE`** with `%s` placeholders.

```python
with conn.cursor() as cur:
    cur.execute("INSERT INTO products(sku, price) VALUES (%s, %s)", ("SKU1", 19.99))
    conn.commit()
```

**Intermediate Level:** **`LAST_INSERT_ID()`** retrieves auto-increment keys for **dependent** rows.

```python
with conn.cursor() as cur:
    cur.execute("INSERT INTO orders(customer_id, total) VALUES (%s, %s)", (1, 9.99))
    cur.execute("SELECT LAST_INSERT_ID()")
    order_id = cur.fetchone()[0]
```

**Expert Level:** **`INSERT ... ON DUPLICATE KEY UPDATE`** for **idempotent** **ingestion** APIs.

```python
sql = """
INSERT INTO inventory(sku, qty) VALUES (%s, %s)
ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)
"""
```

#### Key Points — CRUD

- **Transactions** around multi-row business operations.
- Validate **rowcount** after **`UPDATE`**/`DELETE`**.
- **Batch** operations where driver allows.

---

### 28.5.5 Transactions

**Beginner Level:** `conn.commit()` / `rollback()`; **`autocommit=False`** default in many drivers.

```python
conn.begin()
try:
    cur.execute("UPDATE accounts SET balance = balance - 10 WHERE id=1")
    cur.execute("UPDATE accounts SET balance = balance + 10 WHERE id=2")
    conn.commit()
except Exception:
    conn.rollback()
    raise
```

**Intermediate Level:** **Isolation** via `SET SESSION TRANSACTION ISOLATION LEVEL ...` for **reporting** snapshots.

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

**Expert Level:** **Deadlock** retries with **exponential backoff**—common in **high-contention** **inventory** systems.

```python
import time
import pymysql


def debit_with_retry(conn, tries=5):
    for i in range(tries):
        try:
            with conn.cursor() as cur:
                cur.execute("BEGIN")
                cur.execute("UPDATE wallets SET balance = balance - %s WHERE id=%s", (5, 1))
                conn.commit()
            return
        except pymysql.err.OperationalError as e:
            if "Deadlock" in str(e) and i < tries - 1:
                conn.rollback()
                time.sleep(0.05 * (2**i))
            else:
                raise
```

#### Key Points — MySQL transactions

- **InnoDB** vs **MyISAM**—use **InnoDB** for transactions.
- **Gap locks** in **REPEATABLE READ**—understand **phantoms**.
- **Read-only** transactions for **replicas**.

---

### 28.5.6 Error handling

**Beginner Level:** Catch **`mysql.connector.Error`** or **`pymysql.MySQLError`** and map to **HTTP** codes.

```python
import mysql.connector

try:
    conn = mysql.connector.connect(user="bad", password="bad", host="127.0.0.1")
except mysql.connector.Error as e:
    print("connect failed", e)
```

**Intermediate Level:** **`errno`** discrimination—**duplicate key** vs **lock wait timeout**.

```python
import pymysql

try:
    ...
except pymysql.err.IntegrityError as e:
    if e.args[0] == 1062:
        handle_duplicate()
    else:
        raise
```

**Expert Level:** Central **DB exception** middleware logs **statement id**, **tenant**, **request_id**—never log **passwords** or **PAN**.

```python
# Expert: structured logging sketch
def log_db_error(exc, ctx):
    logger.error("db_error", extra={"errno": getattr(exc, "args", [None])[0], **ctx})
```

#### Key Points — error handling

- **Retry** only **transient** errors.
- **Idempotency keys** for **POST** retries.
- **Alert** on **connection pool** exhaustion.

---

## 28.6 MongoDB

### 28.6.1 `pymongo`

**Beginner Level:** **`pip install pymongo`**—official driver for **document** storage.

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["shop"]
```

**Intermediate Level:** **TLS**, **SCRAM**, **Atlas SRV** URIs for **cloud**.

```python
client = MongoClient(
    "mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority"
)
```

**Expert Level:** **`MongoClient`** is **thread-safe** and **pools**; tune **`maxPoolSize`**, **`serverSelectionTimeoutMS`**.

```python
client = MongoClient(host="localhost", maxPoolSize=50, serverSelectionTimeoutMS=5000)
```

#### Key Points — pymongo

- **BSON** types—**Decimal128** vs Python **float**.
- **Write concern** and **read concern** for **consistency**.
- **Indexes** still critical despite schemaless marketing.

---

### 28.6.2 Connecting

**Beginner Level:** Get **database** and **collection** handles.

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
coll = client["shop"]["products"]
print(coll.find_one())
```

**Intermediate Level:** **Read preferences** for **secondaries** in **analytics** dashboards.

```python
from pymongo.read_preferences import ReadPreference

client = MongoClient("mongodb://localhost:27017", read_preference=ReadPreference.SECONDARY_PREFERRED)
```

**Expert Level:** **Multi-region** **Atlas** clusters—handle **retryable writes** and **causal consistency** session options when needed.

```python
with client.start_session(causal_consistency=True) as session:
    coll.insert_one({"_id": 1, "x": 1}, session=session)
```

#### Key Points — connecting

- **SRV** DNS for **Atlas**.
- **AuthSource** admin vs database users.
- **Network** security groups/VPC peering in **prod**.

---

### 28.6.3 Insert

**Beginner Level:** **`insert_one`**, **`insert_many`**.

```python
from pymongo import MongoClient

coll = MongoClient()["shop"]["events"]
coll.insert_one({"kind": "signup", "user_id": "u1"})
coll.insert_many([{"kind": "login", "user_id": "u1"}, {"kind": "login", "user_id": "u2"}])
```

**Intermediate Level:** **Ordered=False** for parallel **ingestion** with partial success semantics.

```python
from pymongo import InsertOne

requests = [InsertOne({"sku": "a"}), InsertOne({"sku": "b"})]
coll.bulk_write(requests, ordered=False)
```

**Expert Level:** **Idempotent** writes with **natural keys** or **application-generated** **ObjectIds**; **change streams** react to inserts for **pipelines**.

```python
# Expert: unique business key
coll.create_index("event_id", unique=True)
coll.insert_one({"event_id": "evt-123", "payload": {}})
```

#### Key Points — insert

- Handle **`DuplicateKeyError`**.
- **Shard keys** matter in **sharded** clusters.
- **BSON size** limit 16MB per document.

---

### 28.6.4 Query

**Beginner Level:** **`find_one`**, **`find`** with **dict** filters.

```python
coll.find_one({"sku": "ABC"})
for doc in coll.find({"price": {"$lte": 20}}).sort("price").limit(10):
    print(doc)
```

**Intermediate Level:** **Projection** to reduce **network** payload in **mobile** sync.

```python
for doc in coll.find({"active": True}, {"sku": 1, "price": 1, "_id": 0}):
    print(doc)
```

**Expert Level:** **Text indexes** for **search**, **`hint`** to force index use, **`explain`** for **slow** **SLAs**.

```python
coll.find({"$text": {"$search": "laptop"}}, {"score": {"$meta": "textScore"}}).sort(
    [("score", {"$meta": "textScore"})]
)
```

#### Key Points — query

- **Indexes** match **filter/sort** shapes.
- **`limit`** + **`sort`** on indexed fields.
- Avoid **unbounded** scans in **request handlers**.

---

### 28.6.5 Update and delete

**Beginner Level:** **`update_one`/`update_many`** with **`$set`**.

```python
coll.update_one({"sku": "ABC"}, {"$set": {"price": 21.99}})
coll.delete_many({"deleted": True})
```

**Intermediate Level:** **Atomic** **`find_one_and_update`** for **counters** and **job leasing**.

```python
doc = coll.find_one_and_update(
    {"status": "queued"},
    {"$set": {"status": "running", "worker": "w1"}},
    sort=[("priority", -1)],
)
```

**Expert Level:** **Array filters** for **nested** **cart** line updates; **retry** **write concern** errors.

```python
coll.update_one(
    {"_id": 1},
    {"$set": {"items.$[i].qty": 3}},
    array_filters=[{"i.sku": "SKU1"}],
)
```

#### Key Points — update/delete

- **`multi`** deprecated—use **`update_many`**.
- **`upsert=True`** for **idempotent** materialization.
- **Validators** at collection level (JSON schema).

---

### 28.6.6 Aggregation pipelines

**Beginner Level:** **`aggregate([{...}, {...}])`** processes documents server-side—**sales** summaries.

```python
pipeline = [
    {"$match": {"kind": "order"}},
    {"$group": {"_id": "$region", "total": {"$sum": "$amount"}}},
    {"$sort": {"total": -1}},
]
list(coll.aggregate(pipeline))
```

**Intermediate Level:** **`$lookup`** joins collections—**users** + **orders**.

```python
pipeline = [
    {"$lookup": {"from": "orders", "localField": "_id", "foreignField": "user_id", "as": "orders"}},
]
```

**Expert Level:** **`$facet`** for **dashboard** multi-metric queries; **`allowDiskUse`** for large sorts; **Atlas** **Search** stage for **full-text**.

```python
pipeline = [
    {
        "$facet": {
            "by_region": [{"$group": {"_id": "$region", "n": {"$sum": 1}}}],
            "totals": [{"$group": {"_id": None, "rev": {"$sum": "$amount"}}}],
        }
    }
]
```

#### Key Points — aggregation

- Push **filters** early (`$match` before heavy stages).
- **Explain** pipeline stages in **Compass**/**Atlas**.
- Watch **memory** limits without **`allowDiskUse`**.

---

## Best Practices

- **Parameterize** SQL; treat **ORM** as SQL with guardrails, not magic.
- **Migrations** are code—review like app logic.
- **Index** for real query shapes; re-**EXPLAIN** after data growth.
- **Pool** connections; set **timeouts** and **retries** for transient failures.
- **Secrets** from **vault/env**, never committed **`.env`** in **public** repos.
- **Test** with production-like **dataset sizes** before launch.
- **MongoDB**: design **document** boundaries for **access patterns**, not arbitrary nesting.
- **Postgres/MySQL**: choose **numeric** types for **money**; document **timezone** handling (`timestamptz`).

---

## Common Mistakes to Avoid

- **String-concatenated SQL** → **injection** vulnerabilities.
- **`SELECT *`** in **hot** endpoints → **overfetching** and brittle schemas.
- **Implicit commits** / **partial failures** without **transactions** where needed.
- **N+1 queries** in ORMs without **eager** loading strategy.
- **SQLite on NFS** for **high write** concurrency → **corruption** risk.
- **Missing indexes** on **foreign keys** and **filter** columns.
- **Pooling misconfiguration** → **too many** DB connections exhausting **RDS**.
- **Assuming lazy loads** work in **async** SQLAlchemy without **preload**.
- **MongoDB**: unbounded **`find()`** without **`limit`** in **API** handlers.
- **MySQL**: mixing **engines** or **charset** pitfalls (`utf8` vs **`utf8mb4`**).

---

*Database programming ties directly to reliability, security, and cost—profile queries as you would profile application code.*
