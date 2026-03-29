# Flask 3.1.3 — Application Architecture

Sustainable **Flask 3.1.3** systems combine a clear **package layout**, an **application factory**, **blueprints**, a disciplined **data layer**, and often a **service layer** for business rules. This guide ties those pieces to **e-commerce order domains**, **social content graphs**, and **SaaS tenant isolation** on Python 3.9+.

---

## 📑 Table of Contents

1. [27.1 Project Structure](#271-project-structure)
2. [27.2 Application Factory](#272-application-factory)
3. [27.3 Blueprints Architecture](#273-blueprints-architecture)
4. [27.4 Database Architecture](#274-database-architecture)
5. [27.5 Service Layer](#275-service-layer)
6. [27.6 Advanced Patterns](#276-advanced-patterns)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)
10. [Appendix — Reference Layouts](#appendix--reference-layouts)

---

## 27.1 Project Structure

### Project Layout

**🟢 Beginner Example — minimal**

```text
myapp/
  __init__.py
  app.py
  templates/
  static/
```

**🟡 Intermediate Example — package app**

```text
myapp/
  __init__.py          # create_app()
  config.py
  extensions.py        # db, migrate, cache
  api/
    __init__.py
    routes.py
  models/
    __init__.py
    user.py
  services/
    __init__.py
    orders.py
  templates/
  tests/
```

**🔴 Expert Example — monorepo services sharing libs**

```text
repo/
  libs/common/
  services/catalog/
  services/checkout/
```

**🌍 Real-Time Example — e-commerce**

Split `catalog`, `cart`, `checkout` blueprints early to reduce merge conflicts.

### Directory Organization

**🟢 Beginner Example — `templates/` per feature subfolder**

```text
templates/
  checkout/
    review.html
```

**🟡 Intermediate Example — blueprint colocated templates**

```text
checkout/
  templates/checkout/review.html
```

**🔴 Expert Example — namespaced blueprint template folders**

```python
bp = Blueprint("checkout", __name__, template_folder="templates")
```

**🌍 Real-Time Example — SaaS white-label**

`themes/{tenant}/` overrides with safe fallback chain.

### Module Organization

**🟢 Beginner Example — one `routes.py`**

**🟡 Intermediate Example — `api/v1/users.py`, `api/v1/orders.py`**

**🔴 Expert Example — vertical slices**

```text
orders/
  routes.py
  schemas.py
  service.py
```

**🌍 Real-Time Example — social**

`feed/`, `media/`, `moderation/` slices owned by different teams.

### Package Structure

**🟢 Beginner Example — `pyproject.toml` + `myapp` package**

**🟡 Intermediate Example — `src/` layout**

```text
src/
  myapp/
    __init__.py
```

**🔴 Expert Example — namespace packages for plugins**

**🌍 Real-Time Example — SaaS extensibility**

Third-party plugins as separate wheels loaded dynamically (carefully).

### Configuration Management

**🟢 Beginner Example — `config.py` classes**

```python
class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProdConfig(BaseConfig):
    ENV = "production"
```

**🟡 Intermediate Example — `Config.from_mapping`**

```python
app.config.from_mapping(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SQLALCHEMY_DATABASE_URI=os.environ["DATABASE_URL"],
)
```

**🔴 Expert Example — feature flags service client**

**🌍 Real-Time Example — e-commerce**

Regional tax rules loaded from config service at boot + periodic refresh.

---

## 27.2 Application Factory

### Factory Pattern

**🟢 Beginner Example**

```python
from flask import Flask

def create_app():
    app = Flask(__name__)
    @app.get("/healthz")
    def healthz():
        return {"ok": True}
    return app
```

**🟡 Intermediate Example — register blueprints inside factory**

```python
def create_app():
    app = Flask(__name__)
    from .api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix="/api")
    return app
```

**🔴 Expert Example — conditional blueprints by config**

```python
def create_app():
    app = Flask(__name__)
    app.config.from_object("myapp.config.BaseConfig")
    if app.config.get("ENABLE_ADMIN"):
        from .admin import bp as admin_bp
        app.register_blueprint(admin_bp)
    return app
```

**🌍 Real-Time Example — SaaS**

Disable internal diagnostics blueprint in production.

### Creating Factory

**🟢 Beginner Example — `FLASK_APP=myapp:create_app`**

**🟡 Intermediate Example — pass test config**

```python
def create_app(test_config: dict | None = None):
    app = Flask(__name__, instance_relative_config=True)
    if test_config:
        app.config.update(test_config)
    return app
```

**🔴 Expert Example — instance folder for local overrides**

```python
app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile("config.py", silent=True)
```

**🌍 Real-Time Example — e-commerce**

`instance/` on server holds secrets not in image.

### Configuration Passing

**🟢 Beginner Example — `app.config["KEY"]`**

**🟡 Intermediate Example — `app.config.from_envvar("MYAPP_SETTINGS")`**

**🔴 Expert Example — typed settings object in `g` per request (careful)**

**🌍 Real-Time Example — social**

A/B experiment config injected at request start.

### Extension Initialization

**🟢 Beginner Example**

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
    db.init_app(app)
    return app
```

**🟡 Intermediate Example — `extensions.py` centralizes**

```python
# extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def init_extensions(app):
    db.init_app(app)
    migrate.init_app(app, db)
```

**🔴 Expert Example — teardown for custom pools**

**🌍 Real-Time Example — SaaS**

Init tracing, metrics, rate limiter once.

### Testing with Factory

**🟢 Beginner Example**

```python
import pytest
from myapp import create_app

@pytest.fixture()
def app():
    return create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})

@pytest.fixture()
def client(app):
    return app.test_client()
```

**🟡 Intermediate Example — app context for CLI tests**

**🔴 Expert Example — factory-bench for perf tests**

**🌍 Real-Time Example — e-commerce**

Contract tests spin app with stub payment client.

---

## 27.3 Blueprints Architecture

### Blueprint-Based Structure

**🟢 Beginner Example**

```python
from flask import Blueprint

bp = Blueprint("store", __name__, url_prefix="/store")

@bp.get("/items")
def items():
    return {"items": []}
```

**🟡 Intermediate Example — blueprint package**

```python
# store/__init__.py
from flask import Blueprint

bp = Blueprint("store", __name__, url_prefix="/store")

from . import routes  # noqa: E402,F401
```

**🔴 Expert Example — nested url_prefix composition**

**🌍 Real-Time Example — SaaS**

`/api/v1/tenants/<id>/...` blueprint with shared before_request tenant resolver.

### Modular Design

**🟢 Beginner Example — separate files per domain**

**🟡 Intermediate Example — each blueprint owns schemas**

**🔴 Expert Example — enforce module boundaries via import-linter**

**🌍 Real-Time Example — social**

`notifications` decoupled from `feed` via events.

### Shared Resources

**🟢 Beginner Example — import `db` from extensions**

**🟡 Intermediate Example — `current_app` config**

```python
from flask import current_app

def feature_enabled(name: str) -> bool:
    return bool(current_app.config.get("FEATURES", {}).get(name))
```

**🔴 Expert Example — service registry on `app.extensions`**

```python
app.extensions["audit"] = AuditLogger(...)
```

**🌍 Real-Time Example — e-commerce**

Shared pricing service client cached on app.

### Blueprint Composition

**🟢 Beginner Example — register multiple blueprints**

```python
app.register_blueprint(public_bp)
app.register_blueprint(api_bp, url_prefix="/api")
```

**🟡 Intermediate Example — blueprint imports sub-blueprints**

```python
from .account import bp as account_bp

def init_app(app):
    api_bp.register_blueprint(account_bp, url_prefix="/account")
```

**🔴 Expert Example — optional plugin blueprints**

**🌍 Real-Time Example — SaaS**

Enterprise module registers extra routes if license flag set.

### Circular Dependencies

**🟢 Beginner Example — symptom: ImportError on startup**

**🟡 Intermediate Example — move shared models to `models/` package**

**🔴 Expert Example — use TYPE_CHECKING imports**

```python
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from myapp.models import User
```

**🌍 Real-Time Example — social**

`user` ↔ `post` relationship imports deferred.

---

## 27.4 Database Architecture

### Database Connection

**🟢 Beginner Example — SQLAlchemy URI**

```python
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg://user:pass@db:5432/app"
```

**🟡 Intermediate Example — read/write engines**

```python
app.config["SQLALCHEMY_BINDS"] = {
    "analytics": os.environ["ANALYTICS_DATABASE_URL"],
}
```

**🔴 Expert Example — shard router by tenant**

**🌍 Real-Time Example — SaaS**

Large tenants on dedicated DB cluster.

### Session Management

**🟢 Beginner Example — `db.session.add/commit`**

```python
from myapp.extensions import db

def create_user(email: str) -> None:
    db.session.add(User(email=email))
    db.session.commit()
```

**🟡 Intermediate Example — try/except rollback**

```python
def create_user(email: str) -> None:
    try:
        db.session.add(User(email=email))
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
```

**🔴 Expert Example — unit-of-work per request teardown**

```python
@app.teardown_request
def teardown_session(exc):
    db.session.remove()
```

**🌍 Real-Time Example — e-commerce**

Transactional outbox pattern for order events.

### Model Organization

**🟢 Beginner Example — `models/user.py`**

**🟡 Intermediate Example — mixins `TimestampMixin`, `TenantMixin`**

**🔴 Expert Example — SQLAlchemy 2.0 mapped classes explicit**

**🌍 Real-Time Example — social**

`Post`, `MediaAttachment`, `ModerationState` separated.

### Repository Pattern

**🟢 Beginner Example — functions wrapping queries**

```python
class UserRepository:
    def __init__(self, session):
        self.session = session

    def get_by_email(self, email: str) -> User | None:
        return self.session.scalar(select(User).where(User.email == email))
```

**🟡 Intermediate Example — interface for testing fakes**

**🔴 Expert Example — specification objects for complex filters**

**🌍 Real-Time Example — SaaS**

Repositories enforce `tenant_id` filter centrally.

### Query Optimization

**🟢 Beginner Example — `limit`**

**🟡 Intermediate Example — `joinedload`**

**🔴 Expert Example — covering indexes + EXPLAIN in CI**

**🌍 Real-Time Example — e-commerce**

Avoid `SELECT *` on wide product tables.

---

## 27.5 Service Layer

### Business Logic Layer

**🟢 Beginner Example — `services/checkout.py`**

```python
def place_order(cart_id: int, user_id: int) -> int:
    # validate inventory, compute totals, persist order
    return 123
```

**🟡 Intermediate Example — pure functions + DB session param**

**🔴 Expert Example — domain events published after commit**

**🌍 Real-Time Example — e-commerce**

Promotions, tax, shipping rules centralized—not in views.

### Service Classes

**🟢 Beginner Example**

```python
class CartService:
    def __init__(self, db_session):
        self.db = db_session

    def add_item(self, cart_id: int, sku: str, qty: int) -> None:
        ...
```

**🟡 Intermediate Example — interface + impl for testing**

**🔴 Expert Example — command/handler split (CQRS-lite)**

**🌍 Real-Time Example — SaaS**

`BillingService` coordinates gateway + ledger.

### Dependency Injection

**🟢 Beginner Example — pass dependencies explicitly**

```python
@bp.post("/orders")
def create_order():
    svc = OrderService(db.session, PaymentClient())
    order_id = svc.place_order(...)
    return {"order_id": order_id}
```

**🟡 Intermediate Example — Flask `g` for request-scoped deps**

```python
def get_order_service() -> OrderService:
    if "order_service" not in g:
        g.order_service = OrderService(db.session)
    return g.order_service
```

**🔴 Expert Example — container (dependency-injector) for large apps**

**🌍 Real-Time Example — social**

Swap `RecommendationClient` stub in tests.

### Service Composition

**🟢 Beginner Example — `CheckoutService` uses `InventoryService`**

**🟡 Intermediate Example — saga-like orchestration with compensations**

**🔴 Expert Example — workflow engine for long-running SaaS onboarding**

**🌍 Real-Time Example — e-commerce**

`OrderService` calls `TaxService` + `ShippingService`.

### Error Handling

**🟢 Beginner Example — raise domain exception**

```python
class OutOfStock(Exception):
    pass
```

**🟡 Intermediate Example — map to HTTP in error handler**

```python
@app.errorhandler(OutOfStock)
def handle_oos(e):
    return {"error": "out_of_stock"}, 409
```

**🔴 Expert Example — structured error codes for clients**

**🌍 Real-Time Example — SaaS**

`INSUFFICIENT_SEATS` for license enforcement.

---

## 27.6 Advanced Patterns

### MVC Pattern

**🟢 Beginner Example — Model (ORM), View (Jinja), Controller (routes)**

**🟡 Intermediate Example — thin controllers call services**

**🔴 Expert Example — presenters/DTOs separate from ORM**

**🌍 Real-Time Example — e-commerce admin**

ORM models ≠ API JSON shape.

### Repository Pattern

**🟢 Beginner Example — already shown**

**🟡 Intermediate Example — pagination helper in repo**

**🔴 Expert Example — unit of work coordinates multiple repos**

**🌍 Real-Time Example — SaaS reporting**

Read models rebuilt by workers.

### Service Locator Pattern

**🟢 Beginner Example — `current_app.extensions['mail']`**

**🟡 Intermediate Example — discouraged globally; prefer explicit injection**

**🔴 Expert Example — if used, narrow interface + tests**

**🌍 Real-Time Example — legacy social codebase migration path**

### Observer Pattern

**🟢 Beginner Example — Flask signals**

```python
from blinker import Namespace

signals = Namespace()
order_placed = signals.signal("order-placed")

@order_placed.connect
def send_confirmation(sender, order_id: int, **kwargs):
    ...
```

**🟡 Intermediate Example — replace with message bus at scale**

**🔴 Expert Example — transactional outbox + consumer**

**🌍 Real-Time Example — e-commerce**

Email, analytics, search index subscribers.

### Adapter Pattern

**🟢 Beginner Example — `PaymentGateway` interface + `StripeAdapter`**

```python
class PaymentGateway(Protocol):
    def charge(self, amount_cents: int, token: str) -> str: ...

class StripeAdapter:
    def charge(self, amount_cents: int, token: str) -> str:
        ...
```

**🟡 Intermediate Example — mock adapter in tests**

**🔴 Expert Example — circuit breaker wrapper adapter**

**🌍 Real-Time Example — SaaS**

Swap PSP per region via adapter registry.

---

## Best Practices

1. **Use an application factory** for tests and multiple runtimes.
2. **Keep routes thin**; validate input, call services, return DTOs.
3. **One place for tenant scoping** (before_request or repository base).
4. **Colocate blueprint code** by domain when teams scale.
5. **Avoid circular imports** with package layout and `TYPE_CHECKING`.
6. **Version your public API** (`/api/v1`) even if monolith.
7. **Document boundaries** between layers for onboarding.
8. **Measure complexity**—refactor when files exceed team comfort.

---

## Common Mistakes to Avoid

| Mistake | Result |
|---------|--------|
| Global Flask app at import time | Hard to test, circular imports |
| SQL in views | Untestable, duplicated queries |
| God blueprint | Merge conflicts, slow reviews |
| Leaking ORM objects to templates/API | Over-fetching, accidental fields |
| No transactions | partial writes |
| Anemic domain model | logic scattered, inconsistent rules |

---

## Comparison Tables

### Fat Models vs Service Layer

| Style | Pros | Cons |
|-------|------|------|
| Fat models | Quick start | Hard for complex workflows |
| Services | Clear orchestration | More boilerplate |

### Monolith vs Modular Monolith vs Microservices

| Style | When |
|-------|------|
| Monolith | Early product |
| Modular monolith | Multiple teams, one deploy |
| Microservices | Independent scaling/ownership |

### Repository vs Active Record

| Pattern | Testability | Boilerplate |
|---------|-------------|-------------|
| Repository | High | Medium |
| Active Record (ORM) | Medium | Low |

---

## Appendix — Reference Layouts

### A. E-Commerce Modular Monolith

**🟢 Beginner Example**

```text
myshop/
  catalog/
  cart/
  checkout/
  payments/
  notifications/
```

**🟡 Intermediate Example — each domain: blueprint + service + schemas**

**🔴 Expert Example — domain events + outbox table per schema**

**🌍 Real-Time Example — peak traffic isolates `checkout` workers**

### B. Social Graph Service (within Flask)

**🟢 Beginner Example — `feed` blueprint**

**🟡 Intermediate Example — fanout workers separate package**

**🔴 Expert Example — read vs write path separation**

**🌍 Real-Time Example — celebrity fanout-on-write**

### C. SaaS Tenant Isolation

**🟢 Beginner Example — `TenantMixin.tenant_id` on rows**

**🟡 Intermediate Example — SQLAlchemy event listener enforces filter**

**🔴 Expert Example — row-level security in Postgres**

**🌍 Real-Time Example — compliance requires DB-enforced isolation**

### D. Flask 3.1.3 Typing in Views

**🟢 Beginner Example**

```python
@app.get("/users/<int:user_id>")
def user_detail(user_id: int):
    return {"id": user_id}
```

**🟡 Intermediate Example — return `tuple[Response, int]` consistently**

**🔴 Expert Example — `TypedDict` response shapes in docs**

**🌍 Real-Time Example — OpenAPI generator reads annotations**

### E. Testing Pyramid

**🟢 Beginner Example — lots of unit tests for services**

**🟡 Intermediate Example — fewer integration tests with real DB**

**🔴 Expert Example — handful of E2E smoke**

**🌍 Real-Time Example — e-commerce checkout happy path nightly**

### F. Extension Pattern

**🟢 Beginner Example — `init_app` on custom Flask extension**

**🟡 Intermediate Example — namespaced `app.extensions` keys**

**🔴 Expert Example — lifecycle hooks documented**

**🌍 Real-Time Example — SaaS audit extension reused across products**

### G. Configuration Environments

**🟢 Beginner Example — `dev`, `staging`, `prod` classes**

**🟡 Intermediate Example — dotenv only local**

**🔴 Expert Example — secrets never in config classes**

**🌍 Real-Time Example — e-commerce PCI separation**

### H. Data Migration Strategy

**🟢 Beginner Example — Flask-Migrate Alembic**

**🟡 Intermediate Example — backwards compatible migrations**

**🔴 Expert Example — multi-step deploy for column type changes**

**🌍 Real-Time Example — zero downtime rename column**

### I. API vs Server-Rendered

**🟢 Beginner Example — JSON blueprint + Jinja blueprint**

**🟡 Intermediate Example — shared services, different views**

**🔴 Expert Example — BFF for web, public API separate**

**🌍 Real-Time Example — SaaS marketing site SSR, app is SPA**

### J. Observability Hooks

**🟢 Beginner Example — `before_request` start timer**

**🟡 Intermediate Example — structlog context vars**

**🔴 Expert Example — OpenTelemetry spans around service calls**

**🌍 Real-Time Example — social trace across Flask + worker**

---

*Notes version: Flask **3.1.3**, Python **3.9+**, February 2026 release line.*
