# Database Integration

FastAPI does not mandate an ORM, but **SQLAlchemy 2.x** with **Alembic** is the most common stack for relational data. This chapter connects **async** drivers, **session** lifecycle, **models**, **relationships**, **queries**, **migrations**, and **operational** practices to idiomatic FastAPI dependencies.

**How to use these notes:** Treat each Python block as a **pattern** to adapt—replace placeholder engines/sessions, align DSNs with your cloud provider, and run **`EXPLAIN ANALYZE`** on anything that touches large tables. Async examples assume **`AsyncSession`** and an **`async def`** route; sync stacks swap in **`Session`** and **`def`** handlers with the same structural ideas.

**Stack reference (typical):**

- `fastapi`, `uvicorn[standard]`
- `sqlalchemy>=2.0`, `alembic`
- Postgres: `psycopg[binary]` (sync) or `asyncpg` / `psycopg` async; SQLite dev: `aiosqlite`

**Operational checklist (before prod):**

- Backups and **restore drills** are automated and monitored.
- **Connection limits** at the DB are aligned with **`pool_size` × workers** across all services.
- **Migrations** run in CI against a DB that matches **prod** major version.
- **PII** columns are classified; **encryption** and **access** policies extend to replicas and backups.
- **Runbooks** exist for **failover**, **restore**, and **schema rollback** decisions (not just app rollback).

## 📑 Table of Contents

- [16.1 Database Basics](#161-database-basics)
  - [16.1.1 Choosing a Database](#1611-choosing-a-database)
  - [16.1.2 SQL vs NoSQL](#1612-sql-vs-nosql)
  - [16.1.3 Database Connection](#1613-database-connection)
  - [16.1.4 Connection Pooling](#1614-connection-pooling)
  - [16.1.5 Async Databases](#1615-async-databases)
- [16.2 SQLAlchemy Integration](#162-sqlalchemy-integration)
  - [16.2.1 SQLAlchemy Installation](#1621-sqlalchemy-installation)
  - [16.2.2 Database URL Configuration](#1622-database-url-configuration)
  - [16.2.3 Engine Creation](#1623-engine-creation)
  - [16.2.4 Session Management](#1624-session-management)
  - [16.2.5 Async SQLAlchemy](#1625-async-sqlalchemy)
- [16.3 Models and ORM](#163-models-and-orm)
  - [16.3.1 Declarative Models](#1631-declarative-models)
  - [16.3.2 Table Definition](#1632-table-definition)
  - [16.3.3 Columns and Types](#1633-columns-and-types)
  - [16.3.4 Primary Keys](#1634-primary-keys)
  - [16.3.5 Foreign Keys](#1635-foreign-keys)
- [16.4 Relationships](#164-relationships)
  - [16.4.1 One-to-Many Relationships](#1641-one-to-many-relationships)
  - [16.4.2 Many-to-One Relationships](#1642-many-to-one-relationships)
  - [16.4.3 Many-to-Many Relationships](#1643-many-to-many-relationships)
  - [16.4.4 One-to-One Relationships](#1644-one-to-one-relationships)
  - [16.4.5 Relationship Configuration](#1645-relationship-configuration)
- [16.5 Query Operations](#165-query-operations)
  - [16.5.1 Create (INSERT)](#1651-create-insert)
  - [16.5.2 Read (SELECT)](#1652-read-select)
  - [16.5.3 Update (UPDATE)](#1653-update-update)
  - [16.5.4 Delete (DELETE)](#1654-delete-delete)
  - [16.5.5 Query Chaining](#1655-query-chaining)
- [16.6 Advanced Queries](#166-advanced-queries)
  - [16.6.1 Filtering](#1661-filtering)
  - [16.6.2 Ordering](#1662-ordering)
  - [16.6.3 Pagination](#1663-pagination)
  - [16.6.4 Joins](#1664-joins)
  - [16.6.5 Aggregation](#1665-aggregation)
- [16.7 Database Migrations](#167-database-migrations)
  - [16.7.1 Alembic Installation](#1671-alembic-installation)
  - [16.7.2 Migration Creation](#1672-migration-creation)
  - [16.7.3 Migration Application](#1673-migration-application)
  - [16.7.4 Migration Rollback](#1674-migration-rollback)
  - [16.7.5 Schema Management](#1675-schema-management)
- [16.8 Database Best Practices](#168-database-best-practices)
  - [16.8.1 Connection Management](#1681-connection-management)
  - [16.8.2 Query Optimization](#1682-query-optimization)
  - [16.8.3 Transaction Management](#1683-transaction-management)
  - [16.8.4 Error Handling](#1684-error-handling)
  - [16.8.5 Performance Tuning](#1685-performance-tuning)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 16.1 Database Basics

Choosing and operating a database affects **latency**, **consistency**, **scaling**, and **developer ergonomics**. FastAPI sits at the edge; the data tier must match your **consistency** and **query** requirements.

### 16.1.1 Choosing a Database

#### Beginner

Start from **access patterns**: need **joins** and **transactions** → relational (Postgres, MySQL, SQLite). Need **flexible documents** and **horizontal scale** for simple lookups → document (MongoDB) or key-value (Redis) for caching.

```python
# FastAPI stays agnostic — you inject a client or session via Depends
from fastapi import Depends, FastAPI

app = FastAPI()


def get_db():
    yield {"kind": "postgres"}


@app.get("/health/db")
def db_health(db: dict = Depends(get_db)) -> dict[str, str]:
    return {"backend": db["kind"]}
```

#### Intermediate

Evaluate **managed** services (RDS, Cloud SQL, Aurora) for backups, patching, and HA. For **multi-region**, plan **replication lag** and **conflict** resolution early.

#### Expert

Model **RPO/RTO**, **encryption** (at rest, in transit), **private networking**, and **compliance** (HIPAA, PCI). Consider **CQRS** or **read replicas** when read load dominates.

**Key Points (16.1.1)**

- Pick the store for **workload**, not hype.
- **SQLite** is fine for tests/small tools; use **WAL** and avoid NFS for concurrency.

**Best Practices (16.1.1)**

- Document **non-functional** requirements (QPS, p99 latency, data size growth).

**Common Mistakes (16.1.1)**

- Using a **cache** (Redis) as the **system of record** without persistence strategy.

---

### 16.1.2 SQL vs NoSQL

#### Beginner

**SQL** databases expose **structured** tables with **ACID** transactions and **ad hoc** queries. **NoSQL** families (document, wide-column, graph, KV) relax some constraints for **scale** or **schema flexibility**.

```python
# SQLAlchemy ORM — SQL family
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
```

#### Intermediate

**Polyglot persistence** is normal: Postgres + Redis + object storage (S3). Keep **boundaries** clear which service owns which data.

#### Expert

**Jepsen**-style reasoning: understand **isolation levels**, **leader election**, and **split-brain** behaviors for your chosen NoSQL system.

**Key Points (16.1.2)**

- ORMs map well to **SQL**; for NoSQL use **native** drivers or ODMs (Beanie, Motor).
- **Migrations** are first-class in SQL ecosystems (Alembic).

**Best Practices (16.1.2)**

- Avoid **cross-database joins** in application code without **clear** consistency semantics.

**Common Mistakes (16.1.2)**

- Forcing **relational** schemas into **document** stores without embedding vs referencing analysis.

---

### 16.1.3 Database Connection

#### Beginner

A **connection** is a TCP session authenticated to the DB. You typically create an **engine** (factory) and borrow connections from a **pool** per request or task.

```python
from sqlalchemy import create_engine

DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
```

#### Intermediate

Use **environment variables** for URLs; never commit **credentials**. For **SSL**, pass `connect_args` or query params (`sslmode=require` on Postgres).

#### Expert

Use **IAM database authentication** on cloud providers with **short-lived** tokens refreshed by a sidecar or SDK hook.

**Key Points (16.1.3)**

- **Engines** are process-wide singletons in most apps.
- **Connections** are **not** thread-safe across concurrent tasks unless using async drivers correctly.

**Best Practices (16.1.3)**

- Validate connectivity at **startup** with a **health** check that does not hammer the DB.

**Common Mistakes (16.1.3)**

- Opening a **new** engine per request (connection storms).

---

### 16.1.4 Connection Pooling

#### Beginner

**Pooling** reuses connections to avoid **TCP+auth** overhead. SQLAlchemy’s default **QueuePool** maintains a bounded set of open connections.

```python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg://user:pass@localhost/db",
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)
```

#### Intermediate

Set **`pool_pre_ping=True`** to drop **stale** connections after idle timeouts at the LB or DB. Tune **`pool_size`** to match **worker count × concurrent requests** expectations.

#### Expert

For **serverless** or **high churn**, consider **NullPool** or external poolers (**PgBouncer**) in **transaction** vs **session** pooling modes—ORMs care about **prepared statements** and **temp tables**.

**Key Points (16.1.4)**

- Pool exhaustion surfaces as **timeouts**—monitor **pool checked out** metrics.
- **Async** engines use **`AsyncAdaptedQueuePool`** internally.

**Best Practices (16.1.4)**

- Load test **pool** settings under realistic **concurrency**.

**Common Mistakes (16.1.4)**

- **`max_overflow` too low** for burst traffic; **`pool_size` too high** overwhelming the DB.

---

### 16.1.5 Async Databases

#### Beginner

**Async** drivers (`asyncpg`, `aiosqlite`, `psycopg` async) let coroutines **await** I/O without blocking the event loop. Use **`create_async_engine`** and **`AsyncSession`**.

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

DATABASE_URL = "sqlite+aiosqlite:///./async.db"
engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
```

#### Intermediate

Do **not** mix **sync** SQLAlchemy calls inside async routes without **`run_in_threadpool`**—prefer **fully async** stack or **fully sync** with thread workers.

#### Expert

Tune **`poolclass`** for async; watch **connection** acquisition time under load; coalesce **N+1** patterns with **`selectinload`**.

**Key Points (16.1.5)**

- Async fits **FastAPI**’s model when your DB driver is async end-to-end.
- **CPU-bound** work still needs **workers** or **processes**.

**Best Practices (16.1.5)**

- Use **`async with session.begin()`** for concise transactions.

**Common Mistakes (16.1.5)**

- Using **blocking** `time.sleep` or sync DB in async def handlers.

---

## 16.2 SQLAlchemy Integration

### 16.2.1 SQLAlchemy Installation

#### Beginner

Install **SQLAlchemy 2.x** and a **DBAPI** driver: `pip install "sqlalchemy>=2" psycopg[binary]` or `asyncpg` / `aiosqlite` as needed.

```bash
# Examples (pick one driver stack)
pip install "sqlalchemy>=2.0" "psycopg[binary]"
pip install "sqlalchemy>=2.0" asyncpg aiosqlite
```

#### Intermediate

Pin **minor** versions in `requirements.txt` or **Poetry**; test upgrades in CI with **migration** dry runs.

#### Expert

Audit **driver** capabilities: **prepared statements**, **server-side cursors**, **COPY**, **LISTEN/NOTIFY**—choose per workload.

**Key Points (16.2.1)**

- SQLAlchemy is **two-layer**: Core (SQL expressions) and ORM (mapped classes).
- Driver package is **separate** from SQLAlchemy itself.

**Best Practices (16.2.1)**

- Use **optional** dependency groups in monorepos for different deploy targets.

**Common Mistakes (16.2.1)**

- Installing **`psycopg2`** and **`psycopg3`** together without intent.

---

### 16.2.2 Database URL Configuration

#### Beginner

URLs follow `dialect+driver://user:password@host:port/dbname?params`. Store in **`DATABASE_URL`** env var; load with **Pydantic `Settings`**.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    database_url: str = "sqlite+aiosqlite:///./app.db"


settings = Settings()
```

#### Intermediate

For **special characters** in passwords, **URL-encode** or use **DSN** construction APIs instead of manual string building.

#### Expert

Support **read replica** URLs: separate **`DATABASE_URL_PRIMARY`** and **`DATABASE_URL_REPLICA`**; route **SELECT** to replicas with **lag** awareness.

**Key Points (16.2.2)**

- **Dialect** string must match installed driver (`postgresql+psycopg`, not `postgresql+psycopg2` unless installed).
- **SQLite** relative paths are relative to the **process** cwd unless absolute.

**Best Practices (16.2.2)**

- Validate URL **scheme** at startup; fail fast on **typos**.

**Common Mistakes (16.2.2)**

- Committing **`.env`** with production credentials to git.

---

### 16.2.3 Engine Creation

#### Beginner

`create_engine` / `create_async_engine` returns an **Engine** used to create connections and sessions. Pass **`echo=True`** in dev for SQL logging.

```python
from sqlalchemy import create_engine

engine = create_engine("sqlite:///./sync.db", echo=False, future=True)
```

#### Intermediate

Use **`poolclass=NullPool`** for **serverless** lambdas with very short lifetimes; otherwise prefer pooling.

#### Expert

Attach **event listeners** for **slow query** logging, **SET** session parameters (`statement_timeout`), or **RLS** context (`SET app.tenant_id`).

**Key Points (16.2.3)**

- **`future=True`** is default in SQLAlchemy 2; prefer 2.0-style APIs everywhere.
- **Dispose** engine on **config reload** in long-running processes carefully.

**Best Practices (16.2.3)**

- Create **one** engine per process; **fork** after engine creation is a known footgun—recreate in child.

**Common Mistakes (16.2.3)**

- Creating engines inside **request** handlers.

---

### 16.2.4 Session Management

#### Beginner

A **Session** tracks ORM objects and emits **SQL** on **flush/commit**. In FastAPI, yield a session per request and **close** it in **`finally`**.

```python
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

SessionLocal = async_sessionmaker(..., class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


from fastapi import Depends, FastAPI

app = FastAPI()


@app.get("/demo")
async def demo(session: AsyncSession = Depends(get_session)) -> dict[str, str]:
    return {"closed": str(session.is_active)}
```

#### Intermediate

Use **`async with session.begin():`** for **one** transaction block; exceptions **rollback** automatically.

```python
from sqlalchemy.ext.asyncio import AsyncSession

# async def transfer_credits(session: AsyncSession, a: int, b: int, amt: int) -> None:
#     async with session.begin():
#         ua = await session.get(User, a, with_for_update=True)
#         ub = await session.get(User, b, with_for_update=True)
#         ua.balance -= amt
#         ub.balance += amt
#     # commit on successful exit; rollback on exception
```

#### Expert

For **read-only** routes, open sessions with **`execution_options(isolation_level="READ COMMITTED")`** and **routing** to replicas; consider **`sessionmaker(bind=replica_engine)`**.

**Key Points (16.2.4)**

- **Session per request** avoids cross-request state leaks.
- **`expire_on_commit=False`** helps when returning **ORM** objects after commit in APIs.

**Best Practices (16.2.4)**

- Keep sessions **short**—do not hold open across **slow** external API calls.

**Common Mistakes (16.2.4)**

- Sharing a **global** session across concurrent requests.

---

### 16.2.5 Async SQLAlchemy

#### Beginner

Use **`AsyncSession.execute`** with **`select()`**; **`await`** all I/O. Relationships lazy-load **synchronously** by default—prefer **`selectinload`** in async code.

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# async def list_items(session: AsyncSession):
#     result = await session.execute(select(Item))
#     return result.scalars().all()
```

#### Intermediate

Use **`greenlet_spawn`**-enabled lazy load only when you understand **implicit IO** risks; otherwise **eager** load explicitly.

#### Expert

Instrument **`sqlalchemy`** with **OpenTelemetry**; trace **DB time** vs **app time** per route.

**Key Points (16.2.5)**

- Async sessions are **not** interchangeable with sync sessions in the same call stack without bridges.
- **`run_sync`** exists for advanced **migration** or **legacy** code paths.

**Best Practices (16.2.5)**

- Use **`stream_scalars`** for **large** result sets to **backpressure**.

**Common Mistakes (16.2.5)**

- Calling **sync** `.all()` on **async** result objects without **`await`**.

---

## 16.3 Models and ORM

### 16.3.1 Declarative Models

#### Beginner

**Declarative** classes map Python attributes to **columns**. In 2.0 style, inherit **`DeclarativeBase`** and use **`Mapped[]` annotations**.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
```

#### Intermediate

Split **`Base`** metadata across modules but **import** all models before **`create_all`** so tables register.

#### Expert

Use **abstract bases** for **mixins** (`TimestampMixin`, `SoftDeleteMixin`) with careful **`__mapper_args__`** and **naming conventions**.

**Key Points (16.3.1)**

- **Type hints** drive **Mapped** column definitions in 2.0.
- **`__tablename__`** is required unless using **imperative** mapping.

**Best Practices (16.3.1)**

- Keep **domain** invariants in **Pydantic schemas** for I/O; ORM for **persistence**.

**Common Mistakes (16.3.1)**

- Circular **imports** between models—use **`TYPE_CHECKING`** or late imports.

---

### 16.3.2 Table Definition

#### Beginner

**`__table__`** is available after class creation; you can also use **`Table`** imperatively for advanced cases.

```python
from sqlalchemy import Integer, String, Table, Column, MetaData

metadata = MetaData()
legacy = Table(
    "legacy_items",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(64), nullable=False),
)
```

#### Intermediate

Use **`__table_args__`** for **indexes**, **constraints**, and **schema** names (`{"schema": "billing"}`).

#### Expert

Partition tables (**Postgres declarative partitioning**) often require **raw** migrations in Alembic rather than full ORM autogenerate fidelity.

**Key Points (16.3.2)**

- **Imperative** vs **declarative** mapping can **coexist** in one app during migrations.

**Best Practices (16.3.2)**

- Name **constraints** explicitly for **portable** migrations.

**Common Mistakes (16.3.2)**

- Relying on **autogenerate** for **complex** partial indexes without manual review.

---

### 16.3.3 Columns and Types

#### Beginner

Map Python types: **`str` → String/Text**, **`int` → Integer/BigInteger**, **`datetime` → DateTime**, **`bool` → Boolean**, **`bytes` → LargeBinary**.

```python
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column


class Event:
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

#### Intermediate

Use **`JSON`** / **`JSONB`** (dialect-specific) for semi-structured fields; index with **GIN** on Postgres where needed.

#### Expert

For **money**, prefer **integer minor units** or **`NUMERIC`**; never **`float`**.

**Key Points (16.3.3)**

- **`timezone=True`** on **DateTime** avoids naive/aware confusion.
- **`server_default`** keeps DB and ORM aligned for **inserts** bypassing ORM.

**Best Practices (16.3.3)**

- Choose **`Text`** vs **`String(n)`** based on **validation** and **index** needs.

**Common Mistakes (16.3.3)**

- Storing **datetimes** without timezone when users span **regions**.

---

### 16.3.4 Primary Keys

#### Beginner

**Surrogate integer** keys are simple. **UUID** keys reduce **enumeration** risk for public IDs.

```python
import uuid

from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column


class Document:
    __tablename__ = "documents"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
```

#### Intermediate

Use **`Identity()`** for **BIGSERIAL**-style autoincrement on Postgres; understand **`SERIAL`** vs **`IDENTITY`** migration nuances.

#### Expert

**Composite primary keys** for **association** objects—ensure **foreign keys** reference full composite where required.

**Key Points (16.3.4)**

- **Natural keys** (email) as PK complicate **changes**—usually add surrogate.
- **UUIDv7** (time-sortable) improves **index locality** vs random UUIDv4.

**Best Practices (16.3.4)**

- If exposing IDs in URLs, prefer **non-sequential** identifiers.

**Common Mistakes (16.3.4)**

- Mixing **`autoincrement=True`** with **manual** inserts incorrectly.

---

### 16.3.5 Foreign Keys

#### Beginner

**`ForeignKey`** enforces **referential integrity** at the database. In ORM, pair with **`relationship()`** for navigation.

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Post:
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    author: Mapped["User"] = relationship(back_populates="posts")
```

#### Intermediate

Choose **`ondelete`** behavior (`CASCADE`, `SET NULL`, `RESTRICT`) explicitly; match **business** rules, not ORM defaults you did not notice.

#### Expert

**Circular** FK dependencies may require **`use_alter=True`** in migrations or **deferred** constraints.

**Key Points (16.3.5)**

- **DB-level** FKs protect data even if **buggy** app code bypasses ORM.
- **SQLite** FK enforcement requires **`PRAGMA foreign_keys=ON`**.

**Best Practices (16.3.5)**

- Index **FK columns** used in **JOIN** and **filter** predicates.

**Common Mistakes (16.3.5)**

- **`ondelete="CASCADE"`** accidentally wiping **large** subgraphs.

---

## 16.4 Relationships

### 16.4.1 One-to-Many Relationships

#### Beginner

One **parent** has many **children**; children store **`parent_id`**. Define **`relationship(..., back_populates=...)`**.

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


class User:
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    posts: Mapped[list["Post"]] = relationship(back_populates="author")


class Post:
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author: Mapped[User] = relationship(back_populates="posts")
```

#### Intermediate

Control **cascade** with **`cascade="all, delete-orphan"`** only when **lifecycle** ownership is clear.

#### Expert

Use **`passive_deletes=True`** to let the database **CASCADE** without ORM loading all children.

**Key Points (16.4.1)**

- **One-to-many** is the most common relationship shape.
- Avoid **lazy** defaults in **async** without **`selectinload`**.

**Best Practices (16.4.1)**

- Prefer **`list[]` annotations** with **`Mapped`** for collections in 2.0.

**Common Mistakes (16.4.1)**

- **Bidirectional** `back_populates` mismatch causing **silent** broken links.

---

### 16.4.2 Many-to-One Relationships

#### Beginner

**Many-to-one** is the **inverse** view: many **posts** → one **author**. Model on the **many** side with **`ForeignKey`** and **`relationship`**.

```python
# Same Post.author / User.posts example — perspective is API ergonomics
```

#### Intermediate

Use **`foreign()`** hints in complex **self-referential** or **multiple FK** to same table scenarios.

#### Expert

**Aliased** joins for **multiple** relationships to the same target (e.g. **`created_by`**, **`updated_by`**).

**Key Points (16.4.2)**

- Many-to-one is implemented with a **FK** on the **many** side.
- **`uselist=False`** on `relationship` clarifies **scalar** side.

**Best Practices (16.4.2)**

- Name relationships **`items` vs `item`** consistently for readability.

**Common Mistakes (16.4.2)**

- Forgetting **`nullable=False`** on required FKs.

---

### 16.4.3 Many-to-Many Relationships

#### Beginner

Use an **association table** with two **FKs**, or an **association object** if you need extra columns (role, joined_at).

```python
from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


association = Table(
    "user_group",
    Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("group_id", ForeignKey("groups.id"), primary_key=True),
)
```

#### Intermediate

Prefer **`secondary=association`** on `relationship` for **simple** M2M; use **explicit association class** when adding **payload**.

#### Expert

**Break M2M** into two **1-many** relationships through **association entity** for complex **authorization** on links.

**Key Points (16.4.3)**

- **Pure** M2M tables have **composite PK** of both FKs.
- **Ordering** may require **extra** column beyond PK.

**Best Practices (16.4.3)**

- Index **both** FK columns in association table.

**Common Mistakes (16.4.3)**

- Trying to store **M2M-only** data on one side’s **relationship** without association object.

---

### 16.4.4 One-to-One Relationships

#### Beginner

Model as **1-many** with **`uselist=False`** and a **unique** FK, or share **PK** (`id` FK to parent).

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Profile:
    __tablename__ = "profiles"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    bio: Mapped[str] = mapped_column(default="")
    user: Mapped["User"] = relationship(back_populates="profile")
```

#### Intermediate

Enforce **1:1** at DB with **`UniqueConstraint`** on **`user_id`** when `user_id` is not the PK.

#### Expert

**Vertical partitioning** of **PII** into **profile** table with stricter **access** controls and **encryption**.

**Key Points (16.4.4)**

- **Shared PK** guarantees **at most one** child row per parent.
- **`uselist=False`** affects **ORM** loading behavior.

**Best Practices (16.4.4)**

- Lazy-load **profile** only when needed to reduce **join** weight.

**Common Mistakes (16.4.4)**

- Allowing **multiple** profile rows due to missing **unique** constraint.

---

### 16.4.5 Relationship Configuration

#### Beginner

Key kwargs: **`back_populates`**, **`cascade`**, **`lazy`**, **`foreign_keys`**, **`primaryjoin`**. Start with **`lazy="selectin"`** for async-friendly loading.

```python
from sqlalchemy.orm import relationship

items = relationship("Item", back_populates="owner", lazy="selectin")
```

#### Intermediate

Use **`viewonly=True`** for **read-only** relationships built from **complex** joins.

#### Expert

Customize **`primaryjoin`** + **`foreign()`** for **polymorphic** associations and **discriminator** patterns.

**Key Points (16.4.5)**

- **`lazy="dynamic"`** returns **query-like** objects—use carefully in async.
- **`cascade`** settings are **easy** to overshoot—test **deletes**.

**Best Practices (16.4.5)**

- Document **loading strategy** choices per aggregate root.

**Common Mistakes (16.4.5)**

- **`lazy="subquery"`** causing **unexpected** query multiplication.

---
## 16.5 Query Operations

CRUD maps to **`session.add`**, **`select`**, **`update`**, **`delete`**. Prefer **SQLAlchemy 2.0** `select()` style over legacy `query()` API.

### 16.5.1 Create (INSERT)

#### Beginner

Construct ORM instances, **`session.add`**, then **`await session.commit()`** (async) or **`session.commit()`** (sync).

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# async def create_item(session: AsyncSession, title: str) -> Item:
#     item = Item(title=title)
#     session.add(item)
#     await session.commit()
#     await session.refresh(item)
#     return item
```

#### Intermediate

Use **`session.add_all`** for batches; tune **bulk insert** patterns (`session.execute(insert(...))`) for **ETL** scale.

#### Expert

For **high throughput**, use **`COPY`** / **`executemany`** with **raw** connections outside ORM unit-of-work.

**Key Points (16.5.1)**

- **`flush()`** sends SQL but does not **commit** transaction.
- **`refresh()`** reloads **defaults** from DB (`server_default`, triggers).

**Best Practices (16.5.1)**

- Wrap multi-step creates in **`async with session.begin()`**.

**Common Mistakes (16.5.1)**

- **Committing** in a dependency while the route still mutates the same session unexpectedly.

---

### 16.5.2 Read (SELECT)

#### Beginner

`result = await session.execute(select(Item).where(Item.id == item_id))` then **`scalar_one_or_none()`**.

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# async def get_item(session: AsyncSession, item_id: int) -> Item | None:
#     res = await session.execute(select(Item).where(Item.id == item_id))
#     return res.scalar_one_or_none()
```

#### Intermediate

Use **`options(selectinload(Item.owner))`** to avoid **lazy** IO in async.

#### Expert

**Identity map**: repeated **`get`** by PK may hit **session** cache—understand **stale** reads after external writers.

**Key Points (16.5.2)**

- **`scalars()`** vs **`mappings()`** for different result shapes.
- **`stream_scalars`** for **memory**-bounded iteration.

**Best Practices (16.5.2)**

- Project **columns** with **`select(Item.id, Item.title)`** when full entities are unnecessary.

**Common Mistakes (16.5.2)**

- Using **`scalar_one()`** when zero rows are possible—raises **NoResultFound**.

---

### 16.5.3 Update (UPDATE)

#### Beginner

**ORM track**: mutate attributes, **`commit`**. **Bulk**: `await session.execute(update(Item).where(...).values(title=new))`.

```python
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

# await session.execute(update(Item).where(Item.id == 1).values(title="new title"))
# await session.commit()
```

#### Intermediate

**`synchronize_session=False`** for bulk updates when ORM instances should **not** be refreshed automatically.

#### Expert

**Optimistic locking** with **`version_id`** column and **`WHERE version_id = :v`** pattern.

**Key Points (16.5.3)**

- Bulk **`update`** bypasses **ORM** events unless configured.
- **Partial** updates in APIs map well to **`stmt.values(**patch)`**.

**Best Practices (16.5.3)**

- Return **updated row** via **`RETURNING`** on supported dialects.

**Common Mistakes (16.5.3)**

- Updating **without** `WHERE` clause in dynamic builders—**table wipe** bugs.

---

### 16.5.4 Delete (DELETE)

#### Beginner

**`session.delete(obj)`** for ORM cascade semantics; **`delete(Item).where(...)`** for bulk.

```python
from sqlalchemy import delete

# await session.execute(delete(Item).where(Item.id == item_id))
```

#### Intermediate

Prefer **soft delete** (`deleted_at`) for **audit** and **recovery** when product requires it.

#### Expert

**Partition** drops or **batch** deletes with **keyset** pagination to avoid **long locks**.

**Key Points (16.5.4)**

- **FK ON DELETE** interacts with ORM **`cascade`**—test both paths.
- **Soft deletes** complicate **unique** constraints—use **partial** indexes.

**Best Practices (16.5.4)**

- Archive **critical** rows before hard delete.

**Common Mistakes (16.5.4)**

- Deleting **parents** without understanding **orphan** behavior.

---

### 16.5.5 Query Chaining

#### Beginner

Build **`select`** statements incrementally: `stmt = select(Item); stmt = stmt.where(...); stmt = stmt.order_by(...)`.

```python
from sqlalchemy import Select, select

def filter_active(stmt: Select[tuple[Item]]) -> Select[tuple[Item]]:
    return stmt.where(Item.is_active.is_(True))


# stmt = filter_active(select(Item))
```

#### Intermediate

Extract **repository** functions returning **compiled** statements for reuse across **CLI** and **API**.

#### Expert

Use **`with_only_columns`** and **`lateral`** subqueries for **reporting** pipelines while keeping **type safety** where possible.

**Key Points (16.5.5)**

- Immutability-style **chaining** reduces **mutation** bugs in dynamic filters.
- Always **label** ambiguous columns in **joins** for **mapping** clarity.

**Best Practices (16.5.5)**

- Log **final** SQL in dev with **`echo`** or **engine events**.

**Common Mistakes (16.5.5)**

- Accidentally **reusing** a statement object that was already **executed** with **stale** bound parameters.

---

## 16.6 Advanced Queries

### 16.6.1 Filtering

#### Beginner

Use **`where`**, **`and_` / `or_`**, **`in_`**, **`like`**, **`between`**. Combine with **Pydantic** query models.

```python
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

# stmt = select(Item).where(or_(Item.title.ilike("%foo%"), Item.sku == "X-1"))
```

#### Intermediate

**JSON** path filters on Postgres: **`Item.data['k'].as_string() == 'v'`** with proper indexing.

#### Expert

**Full-text search** (`to_tsvector`, `websearch_to_tsquery`) vs external **Elasticsearch**—choose based on ranking needs.

**Key Points (16.6.1)**

- **`None` comparison**: use **`is_(None)`**, not `== None`.
- **User input** in `like` still needs **sanitization** for **wildcards**.

**Best Practices (16.6.1)**

- Push **filters** into SQL—avoid **Python** filtering of huge lists.

**Common Mistakes (16.6.1)**

- **SQL injection** via **`order_by`** built from raw strings.

---

### 16.6.2 Ordering

#### Beginner

**`order_by(Item.created_at.desc())`**. For **stable** sorts, add **tie-breaker** PK.

```python
from sqlalchemy import select

stmt = select(Item).order_by(Item.created_at.desc(), Item.id.desc())
```

#### Intermediate

**Nullable** columns: decide **`NULLS FIRST/LAST`** explicitly for consistent UX.

#### Expert

**Locale-specific** sorting may require **`collate`** or **application-side** sort for small sets. When you expose **sort** query parameters to clients, treat them as **untrusted** input: map allowed fields through a **`dict[str, ColumnElement]`** and **reject** unknown keys. For **nullable** timestamps used in sorting, document whether **`NULL`** rows appear first or last and test both directions—different databases default differently unless you add **`nulls_first()` / `nulls_last()`**.

```python
from sqlalchemy import ColumnElement, asc, desc, nulls_last

SORTABLE: dict[str, ColumnElement] = {
    "created_at": Item.created_at,
    "title": Item.title,
}


def order_clause(field: str, direction: str = "desc") -> ColumnElement:
    col = SORTABLE[field]
    o = asc(col) if direction.lower() == "asc" else desc(col)
    return nulls_last(o)  # explicit policy for NULL timestamps
```

**Key Points (16.6.2)**

- **Unstable** ordering breaks **pagination**—always include **unique** key.

**Best Practices (16.6.2)**

- Index columns used in **`ORDER BY`** for large tables.

**Common Mistakes (16.6.2)**

- Ordering by **unindexed** expression scanning **millions** of rows per request.

---

### 16.6.3 Pagination

#### Beginner

**Offset/limit** is simple but slows on deep pages. Prefer **keyset** (`WHERE id > :cursor ORDER BY id LIMIT :n`).

```python
from sqlalchemy import select

stmt = select(Item).where(Item.id > 42).order_by(Item.id).limit(20)
```

#### Intermediate

Expose **cursor** tokens encoding **sort keys**; document **cannot jump to page 999** tradeoff.

#### Expert

**Seek** pagination with **compound** cursors `(created_at, id)` for **non-unique** sort fields.

**Key Points (16.6.3)**

- **`count(*)`** for total pages is **expensive**—consider **approximate** counts or **no totals**.

**Best Practices (16.6.3)**

- Cap **`limit`** server-side to prevent **DoS**.

**Common Mistakes (16.6.3)**

- Using **offset** pagination on **high-traffic** APIs with large offsets.

---

### 16.6.4 Joins

#### Beginner

**`select(Item, User).join(Item.owner)`** or **`joinedload`** for eager loading paths.

```python
from sqlalchemy import select
from sqlalchemy.orm import joinedload

stmt = select(Item).options(joinedload(Item.owner)).where(Item.id == 1)
```

#### Intermediate

**Outerjoin** for optional relations; mind **duplicate rows** when not using **`contains_eager`**.

#### Expert

**Lateral joins** for **top-N per group** queries; **CTEs** for **readable** complex reports.

**Key Points (16.6.4)**

- **`joinedload`** uses **LEFT OUTER JOIN**—can multiply rows if collections are not **careful**; often prefer **`selectinload`** for collections.

**Best Practices (16.6.4)**

- **`explain analyze`** slow endpoints in staging with **production-like** data volume.

**Common Mistakes (16.6.4)**

- **N+1** queries from **lazy** loading in loops.

---

### 16.6.5 Aggregation

#### Beginner

**`func.count()`, `func.sum()`, `func.avg()`** with **`group_by`**.

```python
from sqlalchemy import func, select

stmt = select(Item.category, func.count()).group_by(Item.category)
```

#### Intermediate

**`having`** for post-aggregate filters; **window functions** (`over(partition_by=...)`) for rankings.

```python
from sqlalchemy import func, select, desc

# Window function: newest row per category by created_at (tie-break on id)
stmt = select(
    Item.category,
    Item.id,
    func.row_number()
    .over(partition_by=Item.category, order_by=(desc(Item.created_at), desc(Item.id)))
    .label("rn"),
)
```

#### Expert

**Materialized views** refreshed on schedule for **heavy** aggregates powering dashboards.

**Key Points (16.6.5)**

- Mixing **ORM** entities and aggregates in one query needs **`add_columns`** discipline.
- **Decimal** types for monetary **`sum`**.

**Best Practices (16.6.5)**

- Precompute **daily rollups** for **analytics** to protect OLTP.

**Common Mistakes (16.6.5)**

- **Floating point** sums for **money**.

---

## 16.7 Database Migrations

### 16.7.1 Alembic Installation

#### Beginner

**`pip install alembic`**, then **`alembic init alembic`**. Point **`sqlalchemy.url`** in `alembic.ini` or override in `env.py` from env vars.

```bash
pip install alembic
alembic init migrations
```

#### Intermediate

Use **`alembic revision --autogenerate`** against **staging** schema, never blindly against **prod**.

#### Expert

Split **teams**: app engineers propose migrations; **DBA** reviews **lock** risk and **backfill** strategy.

**Key Points (16.7.1)**

- Alembic tracks **revision chain** in DB table **`alembic_version`**.
- **`env.py`** imports **all models** for **autogenerate** metadata.

**Best Practices (16.7.1)**

- Commit **migrations** alongside **code** that depends on them.

**Common Mistakes (16.7.1)**

- **Autogenerate** missing tables because models were not **imported**.

---

### 16.7.2 Migration Creation

#### Beginner

**`alembic revision -m "add items table"`** for manual; **`--autogenerate`** for diffs.

```bash
alembic revision --autogenerate -m "create users"
```

#### Intermediate

Always **review** autogen: it misses **renames** (drop+add), **data backfills**, and some **constraints**.

`alembic/env.py` must expose SQLAlchemy **`MetaData`** for autogenerate to “see” your models. A typical pattern imports `Base` from your models module and assigns **`target_metadata = Base.metadata`**, then uses the same **`DATABASE_URL`** your app uses (often from environment variables loaded in `env.py`).

```python
# alembic/env.py (illustrative fragments — merge with your generated file)
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# from myapp.models import Base  # noqa: F401 — registers all model modules
# target_metadata = Base.metadata

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)  # type: ignore[name-defined]
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)  # type: ignore[name-defined]
        with context.begin_transaction():
            context.run_migrations()
```

Uncomment and wire **`target_metadata = Base.metadata`** in your real `env.py` so the `# type: ignore` placeholders above are not needed.

#### Expert

For **zero-downtime** deploys, use **expand/contract** pattern: add column **nullable**, **backfill**, then **enforce**, then **remove old**.

**Key Points (16.7.2)**

- **Data migrations** belong in same revision **carefully** or **separate** online jobs.
- **Naming** revisions with ticket IDs aids **traceability**.

**Best Practices (16.7.2)**

- Add **`down_revision`** chain integrity checks in CI.

**Common Mistakes (16.7.2)**

- Destructive **`drop_column`** without **backup** or **dual-write** period.

---

### 16.7.3 Migration Application

#### Beginner

**`alembic upgrade head`** applies pending revisions. Run in **deploy pipeline** before or during **rolling** release per strategy.

```bash
alembic upgrade head
```

#### Intermediate

**Online DDL** tools (pt-online-schema-change, gh-ost) for **large** MySQL tables outside Alembic’s simple `ALTER`.

#### Expert

**Postgres**: many alters are **fast** vs rewrite—still **validate** lock durations on **big** tables.

**Key Points (16.7.3)**

- **Order**: migrate **schema** before **code** that requires it, or use **feature flags** for compatibility layers.

**Best Practices (16.7.3)**

- Take **backup/snapshot** before major migrations.

**Common Mistakes (16.7.3)**

- Running **`upgrade`** concurrently from **multiple** instances without **locking** coordination.

---

### 16.7.4 Migration Rollback

#### Beginner

**`alembic downgrade -1`** steps back one revision. Implement **`downgrade()``** when feasible.

```bash
alembic downgrade -1
```

#### Intermediate

Some **data-losing** operations cannot be safely reversed—**restore from backup** may be the real rollback.

#### Expert

Maintain **forward-fix** migrations instead of **downgrade** for prod when **downgrade** risks **data loss**.

**Key Points (16.7.4)**

- **`downgrade`** is a **best-effort** tool, not a guaranteed undo for all data migrations.

**Best Practices (16.7.4)**

- Test **downgrade** in **staging** when your runbooks depend on stepping back one revision.

**Common Mistakes (16.7.4)**

- Assuming **`downgrade`** is **lossless** after **data transforms**.

---

### 16.7.5 Schema Management

#### Beginner

**Single source of truth** is **migrations**, not **`create_all`** in prod (okay for **tests**).

```python
# tests only
# Base.metadata.create_all(bind=engine)
```

#### Intermediate

**Branching** migrations: merge revisions with **`alembic merge`**.

#### Expert

**Per-tenant schemas** in Postgres require **dynamic** `search_path` or **schema translate** maps—complex in Alembic; script carefully.

**Key Points (16.7.5)**

- **`create_all`** does not **alter** existing tables—migrations do.
- **Seed data** via **idempotent** scripts or **migration** steps with **guards**.

**Best Practices (16.7.5)**

- **Lock** migration ownership in teams to reduce **merge** conflicts.

**Common Mistakes (16.7.5)**

- Drift between **staging** and **prod** from **manual** hotfixes.

---

## 16.8 Database Best Practices

### 16.8.1 Connection Management

#### Beginner

One **engine** per process, **sessions per request**, **close** promptly. Monitor **open connections** vs **DB max_connections**.

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

# Assume `engine` is your global AsyncEngine / Engine from create_async_engine / create_engine.


@asynccontextmanager
async def lifespan(app: FastAPI):
    # async with engine.connect() as conn: await conn.execute(text("SELECT 1"))
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)
```

#### Intermediate

**PgBouncer** **transaction pooling** mode: avoid **prepared statements** that span transactions incorrectly.

#### Expert

**Circuit breakers** when DB unhealthy—fail fast to protect **cascading** outages.

**Key Points (16.8.1)**

- **Dispose** engines on **SIGTERM** during **graceful shutdown** in K8s.

**Best Practices (16.8.1)**

- Expose **`/health/ready`** separate from **`/health/live`**.

**Common Mistakes (16.8.1)**

- **Leaking** connections from **unclosed** generators in **tests**.

---

### 16.8.2 Query Optimization

#### Beginner

**`EXPLAIN`**, add **indexes** for **WHERE/JOIN/ORDER BY**, avoid **`SELECT *`** in hot paths.

```python
# Prefer column projection
from sqlalchemy import select

stmt = select(Item.id, Item.title).where(Item.is_active.is_(True))
```

#### Intermediate

**Partial indexes** for **boolean** flags with low **selectivity** on huge tables.

#### Expert

**Partition** pruning, **BRIN** indexes for **append-only** time series, **vacuum** tuning on Postgres.

**Key Points (16.8.2)**

- **ORM** convenience can hide **expensive** queries—profile with **APM**.

**Best Practices (16.8.2)**

- Set **`statement_timeout`** at DB or session level.

**Common Mistakes (16.8.2)**

- **Indexes** without **monitoring** become **write** overhead with no read benefit.

---

### 16.8.3 Transaction Management

#### Beginner

One **business operation** = one **transaction** when possible. **ACID** ensures **all-or-nothing** commits.

```python
async def transfer(session, from_id, to_id, amount):
    async with session.begin():
        # load rows FOR UPDATE, adjust balances, insert ledger
        ...
```

#### Intermediate

Choose **isolation level** consciously: **`READ COMMITTED`** default on Postgres; **`SERIALIZABLE`** for rare race-sensitive ops.

#### Expert

**Sagas** / **outbox pattern** for **distributed** transactions across **Kafka** and DB.

**Key Points (16.8.3)**

- **Nested** transactions via **savepoints** for **partial** rollback inside a larger transaction.

**Best Practices (16.8.3)**

- Keep transactions **short** to reduce **lock** contention.

**Common Mistakes (16.8.3)**

- **Long** transactions holding locks while calling **external HTTP** APIs.

---

### 16.8.4 Error Handling

#### Beginner

Map **`IntegrityError`** (unique violations) to **409** responses; **`OperationalError`** to **503** with retry guidance.

```python
from sqlalchemy.exc import IntegrityError

from fastapi import HTTPException, status

try:
    ...
except IntegrityError:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate")
```

#### Intermediate

Use **retry** with **exponential backoff** only for **transient** errors (deadlock, serialization failure).

#### Expert

**Global exception middleware** logs **statement** + **bind params** carefully (**redact** secrets).

**Key Points (16.8.4)**

- Do not **leak** raw SQL errors to clients in **prod**.

**Best Practices (16.8.4)**

- Attach **request id** to DB **application_name** or **comment** hints for correlation.

**Common Mistakes (16.8.4)**

- Catching **`Exception`** and still **committing** partial work.

---

### 16.8.5 Performance Tuning

#### Beginner

**Horizontal**: more **Uvicorn workers** + **DB pool** tuning. **Vertical**: faster disks, **read replicas**.

```python
# Uvicorn: uvicorn main:app --workers 4
# Match pool_size * workers to DB capacity
```

#### Intermediate

**Cache** read-heavy endpoints with **Redis**; **invalidate** on writes with **version** keys.

#### Expert

**Read/write splitting** with **lag** measurement; **CQRS** for **heavy** dashboards.

**Key Points (16.8.5)**

- **Profile** before optimizing—measure **p95** SQL latency per route.
- **Queue depth** at the database (waiting connections) often predicts incidents earlier than CPU graphs.
- For **Postgres**, watch **bloat**, **autovacuum**, **checkpoint** spikes, and **disk IO** saturation together—not in isolation.

**Best Practices (16.8.5)**

- Load test **migrations** + **bulk** operations on **snapshots**.
- Define **SLOs** for API routes that include **budget** for DB time (e.g. 30 ms of 120 ms total).
- Use **synthetic** canary queries in **cron** jobs to detect **slow regression** after deploys.

**Common Mistakes (16.8.5)**

- Increasing **workers** without increasing **DB pool** or **max_connections**, causing **stalls**.
- Turning on **aggressive** client-side retries on **5xx** without **jitter**, amplifying **thundering herd** against the database.
- Caching **ORM objects** directly in Redis—serialize **DTOs** instead to avoid **stale graph** and **pickle** risks.

---

**Reference sketch — async engine, lifespan, and `Depends`:** the following ties together **`create_async_engine`**, **`async_sessionmaker`**, schema creation (use **Alembic** in production instead of `create_all`), and a read route. Swap the DSN for Postgres when you outgrow SQLite.

```python
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy import String, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Widget(Base):
    __tablename__ = "widgets"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64))


DATABASE_URL = "sqlite+aiosqlite:///./widgets.db"
engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


@app.get("/widgets")
async def list_widgets(session: AsyncSession = Depends(get_session)) -> list[dict[str, int | str]]:
    res = await session.execute(select(Widget).order_by(Widget.id))
    rows = res.scalars().all()
    return [{"id": w.id, "name": w.name} for w in rows]
```

---

Sections **16.1** through **16.8** each include **five** subtopics (**forty** subtopics total), covering the full path from choosing a database through migration discipline and production tuning.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- FastAPI **depends** on you to wire **sessions** safely: **per-request** lifecycle, **no globals**.
- **SQLAlchemy 2.0** `select()` + **`AsyncSession`** matches **async** FastAPI handlers when using **async** drivers.
- **Relationships** require explicit **loading** strategies in async apps to avoid **implicit IO**.
- **Alembic** is the **production** mechanism for **schema evolution**—avoid ad hoc `ALTER` drift.
- **Performance** and **correctness** come from **indexes**, **transactions**, **pagination**, and **observability**, not ORM magic.
- **Declarative models** are not your **public API**—use **Pydantic** response models to control serialization and avoid leaking internal columns.
- **Dialect** differences (SQLite vs Postgres) surface in **DDL**, **locking**, and **types**—test migrations against the **same** engine family you run in production.
- **Read replicas** introduce **replication lag**; any logic that **writes** then immediately **reads** the same aggregate may need **primary** routing or **client** tolerance of **eventual** consistency.

### Chapter Best Practices

- Use **environment-based** DSNs, **`pool_pre_ping`**, and **timeouts**.
- Add **indexes** for **FK** and **filter/sort** columns; verify with **`EXPLAIN ANALYZE`**.
- Prefer **keyset** pagination for **large** collections; cap **limits**.
- Handle **`IntegrityError`** with **clear** HTTP semantics (409).
- **Expand/contract** migrations for **zero-downtime** when tables are large.
- Add **database tests** in CI using **transaction rollbacks** or **ephemeral** containers so migrations and queries stay **green**.
- Set **`application_name`** (or equivalent) per service so **slow query** logs and **pg_stat_activity** identify the owning **API** quickly.
- Document **expected row counts** and **hot paths** for each endpoint so reviewers can spot **accidental** full table scans early.

### Chapter Common Mistakes

- **N+1** queries from default **lazy** loading in **async** contexts.
- **Unbounded** `offset` pagination and **missing** stable **sort** keys.
- **Leaking** sessions/connections in **tests** and **background tasks**.
- **Autogenerate** migrations applied without **human** review.
- Using **`float`** for **currency** and **unbounded** JSON blobs without **query** strategy.
- Running **`create_all`** against **production** instead of letting **Alembic** own the schema.
- Sharing one **global** `Session` or `AsyncSession` across **concurrent** requests (race conditions on the identity map).
- Omitting **`pool_pre_ping`** and then blaming “random” disconnect errors after **idle** timeouts at the load balancer.
- Issuing **`SELECT *`** via ORM for **wide** tables when the API only needs **two** columns—paying IO and cache cost for unused fields.
- Deploying **code** that expects a **new** column before the **migration** has finished across **all** replicas (ordering and compatibility gaps).

---
