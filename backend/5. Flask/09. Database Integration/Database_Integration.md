# Database Integration with Flask 3.1.3

Flask is unopinionated about persistence: you choose SQLite, PostgreSQL, MySQL, or other engines, then integrate via drivers or extensions like **Flask-SQLAlchemy**. This document maps **database fundamentals** to **Flask 3.1.3** application patterns (Python **3.9+**), from connection strings and pooling to raw SQL and lifecycle management in factories and production (e‑commerce orders, SaaS multi-tenant data, social activity feeds).

---

## 📑 Table of Contents

1. [9.1 Database Basics](#91-database-basics)
2. [9.2 SQLite Setup](#92-sqlite-setup)
3. [9.3 PostgreSQL Setup](#93-postgresql-setup)
4. [9.4 MySQL Setup](#94-mysql-setup)
5. [9.5 Flask-SQLAlchemy Setup](#95-flask-sqlalchemy-setup)
6. [9.6 Raw SQL Queries](#96-raw-sql-queries)
7. [9.7 Connection Management](#97-connection-management)
8. [Best Practices](#best-practices)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Comparison Tables](#comparison-tables)

---

## 9.1 Database Basics

### 9.1.1 Choosing a Database

Pick based on **consistency**, **scale**, **ops maturity**, and **team skills**.

**🟢 Beginner Example** — heuristic:

```text
Prototype / local dev  → SQLite
Production web app     → PostgreSQL (default recommendation)
Existing MySQL org     → MySQL / MariaDB
```

**🟡 Intermediate Example** — SaaS tenant metadata in PostgreSQL JSONB for flexible plans:

```python
# Conceptual: feature flags per tenant stored as JSONB in Postgres
FEATURES = {"sso": True, "audit_log": False}
```

**🔴 Expert Example** — polyglot persistence: PostgreSQL for transactional core, Redis for cache, object storage for blobs; Flask only talks to each via dedicated clients.

**🌍 Real-Time Example** — e‑commerce: PostgreSQL for orders/inventory; Elasticsearch later for catalog search (out of band).

---

### 9.1.2 SQL vs NoSQL

**SQL** = relational, ACID transactions, joins. **NoSQL** = document, key-value, wide-column, graph—different consistency models.

**🟢 Beginner Example** — when SQL wins: user accounts, payments, inventory.

**🟡 Intermediate Example** — when document store fits: ephemeral session documents, CMS-like flexible content (still often SQL + JSONB).

**🔴 Expert Example** — CQRS: write model in SQL, read model materialized to Redis or a search index.

**🌍 Real-Time Example** — social graph features may use a graph DB; Flask calls microservice, not the graph driver directly in hot paths.

---

### 9.1.3 Database Drivers

Drivers implement DB-API 2.0 (`sqlite3` stdlib, `psycopg2`, `psycopg` v3, `pymysql`, `mysqlclient`).

**🟢 Beginner Example** — SQLite needs no pip package:

```python
import sqlite3
conn = sqlite3.connect("app.db")
```

**🟡 Intermediate Example** — PostgreSQL:

```bash
pip install "psycopg[binary]>=3.1"
```

**🔴 Expert Example** — choose `psycopg` (v3) for modern async if you adopt async stack; Flask 3 remains largely WSGI/sync unless using async views carefully.

**🌍 Real-Time Example** — enterprise: approved wheelhouse mirrors only certain driver versions.

---

### 9.1.4 Connection Strings

Strings encode dialect, credentials, host, port, database name, and options.

**🟢 Beginner Example** — SQLite file URL for SQLAlchemy:

```text
sqlite:///instance/app.db
```

**🟡 Intermediate Example** — PostgreSQL:

```text
postgresql+psycopg://user:pass@db.internal:5432/myapp
```

**🔴 Expert Example** — SSL modes as query args:

```text
postgresql+psycopg://user:pass@host:5432/db?sslmode=require
```

**🌍 Real-Time Example** — SaaS on RDS: credentials from Secrets Manager rotated monthly; app reads env `DATABASE_URL`.

---

### 9.1.5 Database Configuration

Centralize in `app.config` or environment variables; never commit secrets.

**🟢 Beginner Example**

```python
import os
from flask import Flask

app = Flask(__name__)
app.config["DATABASE_PATH"] = os.path.join(app.instance_path, "app.db")
```

**🟡 Intermediate Example**

```python
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
```

**🔴 Expert Example** — split read replica URI:

```python
app.config["SQLALCHEMY_BINDS"] = {
    "analytics": os.environ["ANALYTICS_DATABASE_URL"],
}
```

**🌍 Real-Time Example** — e‑commerce: primary for checkout, replica for reporting dashboards (read-only user).

---

## 9.2 SQLite Setup

### 9.2.1 SQLite Basics

Serverless, file-based, great for tests and prototypes.

**🟢 Beginner Example**

```python
import sqlite3
conn = sqlite3.connect("demo.db")
conn.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)")
conn.commit()
conn.close()
```

**🟡 Intermediate Example** — row factory:

```python
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT * FROM users").fetchall()
dict_rows = [dict(r) for r in rows]
```

**🔴 Expert Example** — `check_same_thread=False` only when you manage threading (e.g. some pools); prefer one connection per request pattern.

**🌍 Real-Time Example** — embedded kiosk app: SQLite + Flask on device.

---

### 9.2.2 Database Location

Use `instance/` folder (gitignored) for writable DB files.

**🟢 Beginner Example**

```python
import os
from flask import Flask

app = Flask(__name__, instance_relative_config=True)
os.makedirs(app.instance_path, exist_ok=True)
db_path = os.path.join(app.instance_path, "app.db")
```

**🟡 Intermediate Example** — Docker volume mount at `/data/app.db`.

**🔴 Expert Example** — read-only container filesystem: DB on attached volume only.

**🌍 Real-Time Example** — single-node small SaaS MVP on a VM with nightly file backup.

---

### 9.2.3 Connection Management

Open short-lived connections per request or use SQLAlchemy pooling (even for SQLite, with caveats).

**🟢 Beginner Example**

```python
from flask import g
import sqlite3

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect("app.db")
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()
```

**🟡 Intermediate Example** — `before_request` / `teardown_request` on blueprints.

**🔴 Expert Example** — WAL mode for better concurrent readers:

```python
conn.execute("PRAGMA journal_mode=WAL;")
```

**🌍 Real-Time Example** — low-traffic admin tool: SQLite acceptable with WAL + backups.

---

### 9.2.4 Simple Queries

Always use **bound parameters** to prevent SQL injection.

**🟢 Beginner Example**

```python
def user_by_id(conn, user_id):
    return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
```

**🟡 Intermediate Example** — insert returning id:

```python
cur = conn.execute(
    "INSERT INTO users (name) VALUES (?)",
    ("Ada",),
)
conn.commit()
new_id = cur.lastrowid
```

**🔴 Expert Example** — batch insert with `executemany`.

**🌍 Real-Time Example** — import catalog SKUs from CSV in admin job.

---

### 9.2.5 Transactions

Use transactions for multi-step writes (all-or-nothing).

**🟢 Beginner Example**

```python
conn = sqlite3.connect("app.db")
try:
    conn.execute("UPDATE accounts SET balance = balance - 10 WHERE id = 1")
    conn.execute("UPDATE accounts SET balance = balance + 10 WHERE id = 2")
    conn.commit()
except Exception:
    conn.rollback()
    raise
finally:
    conn.close()
```

**🟡 Intermediate Example** — context manager:

```python
with conn:
    conn.execute("...")
    conn.execute("...")
```

**🔴 Expert Example** — isolation level tuning (SQLite limited vs Postgres).

**🌍 Real-Time Example** — e‑commerce: decrement stock + create order line in one transaction.

---

## 9.3 PostgreSQL Setup

### 9.3.1 PostgreSQL Installation

Platform-specific; production often uses managed RDS, Cloud SQL, or Azure Database.

**🟢 Beginner Example** — macOS Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
```

**🟡 Intermediate Example** — Docker:

```bash
docker run --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:16
```

**🔴 Expert Example** — Helm chart on Kubernetes with persistent volume claims.

**🌍 Real-Time Example** — SaaS: multi-AZ Postgres with automated failover.

---

### 9.3.2 psycopg2 Driver

Legacy widely deployed; `psycopg2-binary` for dev; compile `psycopg2` in prod for some orgs.

**🟢 Beginner Example**

```bash
pip install psycopg2-binary
```

```python
import psycopg2
conn = psycopg2.connect("dbname=myapp user=u password=p host=localhost")
```

**🟡 Intermediate Example** — dictionary cursor:

```python
from psycopg2.extras import RealDictCursor
conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)
```

**🔴 Expert Example** — server-side cursor for large exports:

```python
cur = conn.cursor(name="export_cur")
cur.itersize = 1000
cur.execute("SELECT * FROM huge_table")
for row in cur:
    ...
```

**🌍 Real-Time Example** — nightly GDPR export job streaming rows to S3.

---

### 9.3.3 Connection String

SQLAlchemy style:

```text
postgresql+psycopg2://user:pass@host:5432/dbname
```

**🟢 Beginner Example** — local:

```text
postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/flask_learning
```

**🟡 Intermediate Example** — URL-encode password with special characters.

**🔴 Expert Example** — `options=-csearch_path%3Dtenant_a` for schema per tenant.

**🌍 Real-Time Example** — connection limits per service user (`myapp_web`, `myapp_migrator`).

---

### 9.3.4 Connection Pooling

SQLAlchemy `QueuePool` (default for Postgres) reuses connections.

**🟢 Beginner Example** — Flask-SQLAlchemy default pool:

```python
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_size": 5,
    "max_overflow": 10,
    "pool_pre_ping": True,
}
```

**🟡 Intermediate Example** — PgBouncer in transaction mode in front of app.

**🔴 Expert Example** — tune `pool_recycle` below server `idle_session_timeout`.

**🌍 Real-Time Example** — Black Friday: scale web replicas; each has bounded pool to avoid exhausting Postgres `max_connections`.

---

### 9.3.5 Advanced Features

JSONB, full text search, partial indexes, LISTEN/NOTIFY.

**🟢 Beginner Example** — JSONB column read in SQLAlchemy as Python dict (when mapped).

**🟡 Intermediate Example** — GIN index on JSONB path for SaaS feature flags.

**🔴 Expert Example** — exclusion constraints for non-overlapping booking ranges.

**🌍 Real-Time Example** — e‑commerce promotions: valid date ranges enforced in DB.

---

## 9.4 MySQL Setup

### 9.4.1 MySQL Installation

**🟢 Beginner Example** — Docker:

```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=pass -e MYSQL_DATABASE=myapp -p 3306:3306 -d mysql:8
```

**🟡 Intermediate Example** — managed Aurora MySQL.

**🔴 Expert Example** — read replicas + binlog for CDC.

**🌍 Real-Time Example** — org standardized on MySQL; Flask app follows enterprise HA playbook.

---

### 9.4.2 pymysql Driver

Pure Python driver, easy install.

**🟢 Beginner Example**

```bash
pip install pymysql
```

```text
mysql+pymysql://user:pass@127.0.0.1:3306/myapp?charset=utf8mb4
```

**🟡 Intermediate Example** — SQLAlchemy engine:

```python
from sqlalchemy import create_engine
engine = create_engine("mysql+pymysql://u:p@localhost/myapp", pool_pre_ping=True)
```

**🔴 Expert Example** — compare `mysqlclient` (C extension) for throughput at high QPS.

**🌍 Real-Time Example** — SaaS on shared hosting with only pymysql wheels allowed.

---

### 9.4.3 Connection String

**🟢 Beginner Example**

```text
mysql+pymysql://app:secret@db.internal:3306/prod
```

**🟡 Intermediate Example** — SSL:

```text
mysql+pymysql://u:p@host/db?ssl_ca=%2Fetc%2Fssl%2Fcerts%2Fca.pem
```

**🔴 Expert Example** — RDS IAM auth token as password (rotating).

**🌍 Real-Time Example** — multi-region DR: different host in `DATABASE_URL` after failover DNS update.

---

### 9.4.4 Connection Options

`pool_size`, `max_overflow`, `connect_args` for SSL.

**🟢 Beginner Example**

```python
engine = create_engine(
    url,
    pool_pre_ping=True,
    pool_recycle=280,
)
```

**🟡 Intermediate Example** — `connect_args={"init_command": "SET sql_mode='STRICT_TRANS_TABLES'"}`.

**🔴 Expert Example** — session `transaction_isolation` per connection hook.

**🌍 Real-Time Example** — strict mode to catch silent truncation bugs in e‑commerce product titles.

---

### 9.4.5 Charset Handling

Use **`utf8mb4`** for full Unicode (emoji).

**🟢 Beginner Example**

```sql
CREATE DATABASE myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**🟡 Intermediate Example** — SQLAlchemy URL `charset=utf8mb4`.

**🔴 Expert Example** — verify column collation for index length limits.

**🌍 Real-Time Example** — social posts with emoji; avoid `utf8` (3-byte) truncation.

---

## 9.5 Flask-SQLAlchemy Setup

### 9.5.1 Installing Flask-SQLAlchemy

**🟢 Beginner Example**

```bash
pip install Flask-SQLAlchemy
```

**🟡 Intermediate Example** — pin compatible with SQLAlchemy 2.x style.

**🔴 Expert Example** — optional `Flask-Migrate` for Alembic (see Relationships & Migrations notes).

**🌍 Real-Time Example** — lockfile includes `greenlet` where needed for async extensions.

---

### 9.5.2 Configuration

**🟢 Beginner Example**

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
db = SQLAlchemy(app)
```

**🟡 Intermediate Example** — application factory:

```python
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    db.init_app(app)
    return app
```

**🔴 Expert Example** — binds for multiple databases:

```python
app.config["SQLALCHEMY_BINDS"] = {"warehouse": "sqlite:///warehouse.db"}
```

**🌍 Real-Time Example** — SaaS: single DB per region environment variable.

---

### 9.5.3 Database URI

Same as SQLAlchemy URL; Flask-SQLAlchemy reads `SQLALCHEMY_DATABASE_URI`.

**🟢 Beginner Example** — `sqlite:///:memory:` for fast tests.

**🟡 Intermediate Example** — `postgresql+psycopg2://...`

**🔴 Expert Example** — read replica custom session routing (advanced pattern with binds or manual engines).

**🌍 Real-Time Example** — blue/green deploy: URI swapped at cutover.

---

### 9.5.4 Creating db Instance

`db = SQLAlchemy()` without app, then `init_app` in factory is the scalable pattern.

**🟢 Beginner Example** — single file tutorial style with `db = SQLAlchemy(app)`.

**🟡 Intermediate Example** — avoid circular imports: `models.py` imports `db` from `extensions.py`.

**🔴 Expert Example** — lazy table reflection for legacy DB.

**🌍 Real-Time Example** — large codebase: `extensions.py` holds `db`, `migrate`, `login_manager`.

---

### 9.5.5 Session Management

`db.session` is the Unit of Work; commit/rollback per request or explicit service boundaries.

**🟢 Beginner Example**

```python
@app.post("/items")
def create_item():
    item = Item(name=request.form["name"])
    db.session.add(item)
    db.session.commit()
    return "ok"
```

**🟡 Intermediate Example** — rollback on error:

```python
try:
    db.session.add(order)
    db.session.commit()
except Exception:
    db.session.rollback()
    raise
```

**🔴 Expert Example** — `session.begin_nested()` savepoints.

**🌍 Real-Time Example** — payment capture + order state update in nested transaction.

---

## 9.6 Raw SQL Queries

### 9.6.1 Executing Raw SQL

**🟢 Beginner Example** — SQLAlchemy 2 style:

```python
from sqlalchemy import text

result = db.session.execute(text("SELECT id, name FROM users WHERE id = :id"), {"id": 1})
row = result.mappings().first()
```

**🟡 Intermediate Example** — multiple rows:

```python
rows = db.session.execute(text("SELECT * FROM products WHERE active = true")).mappings().all()
```

**🔴 Expert Example** — `execution_options` for isolation level on statement.

**🌍 Real-Time Example** — complex reporting query tuned by DBA, kept as raw SQL in repo.

---

### 9.6.2 Query Results

**🟢 Beginner Example** — tuples:

```python
result = db.session.execute(text("SELECT count(*) FROM orders"))
count = result.scalar_one()
```

**🟡 Intermediate Example** — `mappings()` for dict-like rows.

**🔴 Expert Example** — stream with `yield_per` for large selects in SQLAlchemy ORM/raw hybrid.

**🌍 Real-Time Example** — export 1M rows without loading all to RAM.

---

### 9.6.3 Parameterized Queries

Never interpolate user input into SQL strings.

**🟢 Beginner Example**

```python
sql = text("SELECT * FROM users WHERE email = :email")
db.session.execute(sql, {"email": user_email})
```

**🟡 Intermediate Example** — IN clauses:

```python
sql = text("SELECT * FROM users WHERE id IN :ids")
# bindparam expanding for SA versions — often build dynamic safely with expanding=True
```

**🔴 Expert Example** — whitelist column names for dynamic ORDER BY:

```python
allowed = {"created_at", "id"}
order_col = allowed.intersection({sort_by}).pop() if sort_by in allowed else "id"
```

**🌍 Real-Time Example** — public API sort parameters hardened against injection.

---

### 9.6.4 Transaction Management

**🟢 Beginner Example**

```python
with db.session.begin():
    db.session.execute(text("UPDATE accounts SET balance = balance - :a WHERE id = :id"), {"a": 10, "id": 1})
    db.session.execute(text("UPDATE accounts SET balance = balance + :a WHERE id = :id"), {"a": 10, "id": 2})
```

**🟡 Intermediate Example** — explicit `begin_nested()` for partial rollback.

**🔴 Expert Example** — two-phase commit across resources (rare in simple Flask monoliths).

**🌍 Real-Time Example** — inventory reservation + payment authorization coordination.

---

### 9.6.5 Connection Handling

Prefer Flask-SQLAlchemy’s scoped session; don’t stash connections on `g` unless you bypass the extension.

**🟢 Beginner Example** — use `db.session` only.

**🟡 Intermediate Example** — `get_engine(bind="warehouse")` for secondary bind.

**🔴 Expert Example** — separate engine for long-running analytics with its own pool.

**🌍 Real-Time Example** — isolate heavy reporting from OLTP pool.

---

## 9.7 Connection Management

### 9.7.1 Application Factory Pattern

**🟢 Beginner Example**

```python
from flask import Flask
from extensions import db

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    db.init_app(app)

    with app.app_context():
        db.create_all()

    return app
```

**🟡 Intermediate Example** — blueprints registered after `db.init_app`.

**🔴 Expert Example** — CLI commands with app context for migrations.

**🌍 Real-Time Example** — Gunicorn workers each load `create_app()` independently.

---

### 9.7.2 Connection Pooling

**🟢 Beginner Example** — defaults + `pool_pre_ping` to avoid stale connections.

**🟡 Intermediate Example** — `NullPool` for serverless-style short processes (advanced).

**🔴 Expert Example** — PgBouncer + SQLAlchemy: disable `pool_pre_ping` conflicts depending on mode—consult driver docs.

**🌍 Real-Time Example** — 50 pods × pool_size 5 = 250 conns; tune global limits.

---

### 9.7.3 Database Connection Testing

Health check endpoint executes `SELECT 1`.

**🟢 Beginner Example**

```python
@app.get("/health/db")
def health_db():
    try:
        db.session.execute(text("SELECT 1"))
        return {"db": "ok"}, 200
    except Exception as e:
        return {"db": "error", "detail": str(e)}, 500
```

**🟡 Intermediate Example** — Kubernetes liveness vs readiness: DB failure → readiness only.

**🔴 Expert Example** — separate checks for primary vs replica.

**🌍 Real-Time Example** — deploy orchestrator waits for readiness before traffic shift.

---

### 9.7.4 Connection Cleanup

Flask-SQLAlchemy removes session at end of request; ensure no global long-lived sessions.

**🟢 Beginner Example** — rely on teardown.

**🟡 Intermediate Example** — manual `db.session.remove()` in background threads (must push app context).

**🔴 Expert Example** — Celery tasks: `with app.app_context():` around DB work.

**🌍 Real-Time Example** — SaaS email worker processes jobs with proper context per task.

---

### 9.7.5 Error Handling

Map DB errors to user-safe messages; log internals.

**🟢 Beginner Example**

```python
from sqlalchemy.exc import IntegrityError

try:
    db.session.add(user)
    db.session.commit()
except IntegrityError:
    db.session.rollback()
    return "Email already exists", 409
```

**🟡 Intermediate Example** — unique violation parsing by DB driver error codes.

**🔴 Expert Example** — retry serialization failures with exponential backoff.

**🌍 Real-Time Example** — checkout race: second request gets friendly “item just sold out”.

---

## Best Practices

1. **Use parameterized SQL** everywhere (ORM or `text()` binds).
2. **Store secrets in environment** or secret managers, not code.
3. **Enable `pool_pre_ping`** for long-lived workers against managed DBs.
4. **Use transactions** for multi-step business operations.
5. **Choose utf8mb4** for MySQL; **UTF8** everywhere for Postgres text.
6. **Separate migration user** from app runtime user when possible.
7. **Monitor connection counts** and slow queries.
8. **Test against production-like engine** (avoid SQLite-only tests if you ship Postgres).
9. **Instance folder** for local SQLite; backups for file DB.
10. **Document failover** behavior (read-only mode, degraded features).

**🟢 Beginner Example** — `.env` + `python-dotenv` loading `DATABASE_URL`.

**🟡 Intermediate Example** — read-only SQL user for reporting routes.

**🔴 Expert Example** — shard key strategy documented for future scale.

**🌍 Real-Time Example** — e‑commerce: stock decrements only inside DB transaction with row locking.

---

## Common Mistakes to Avoid

1. **String formatting SQL** with user input → injection.
2. **Forgetting `commit()`** after writes.
3. **Using SQLite in multi-writer production** without understanding locking.
4. **Oversized connection pools** exhausting the database.
5. **Sharing mutable global session** across threads.
6. **Ignoring charset/collation** → mojibake in social content.
7. **Running migrations manually in prod** without backups.
8. **Storing credentials in git** even for “dev” databases.
9. **Long transactions** holding locks during external API calls.
10. **Using `echo=True` in production** leaking SQL in logs.

**🟢 Beginner Example** — fix: always `db.session.rollback()` on exception path before re-raise.

**🟡 Intermediate Example** — move Stripe API call after DB commit or use outbox pattern.

**🔴 Expert Example** — avoid N+1 queries when replacing ORM with raw SQL without joins.

**🌍 Real-Time Example** — payment webhook: idempotent handler + unique constraint on event id.

---

## Comparison Tables

### SQLite vs PostgreSQL vs MySQL (Flask context)

| Concern | SQLite | PostgreSQL | MySQL/MariaDB |
|--------|--------|------------|---------------|
| Setup | Easiest | Managed/common | Very common |
| Concurrency | Single writer | Strong | Strong with tuning |
| JSON | JSON1 | JSONB (rich) | JSON types |
| Extensions | Few | Many | Ecosystem varies |
| Flask tutorial fit | Excellent | Excellent | Good |

### Driver choice (PostgreSQL)

| Driver | Notes |
|--------|--------|
| psycopg (v3) | Modern, maintained |
| psycopg2 | Widely deployed legacy |
| asyncpg | Async drivers (non-Flask-core) |

### When to use raw SQL vs ORM

| Situation | Prefer |
|-----------|--------|
| CRUD + relations | SQLAlchemy ORM |
| Highly tuned report | Raw SQL / views |
| Legacy schema quirks | Raw + reflection |
| Rapid prototype | ORM |

---

*End of Database Integration notes — Flask 3.1.3, Python 3.9+.*
