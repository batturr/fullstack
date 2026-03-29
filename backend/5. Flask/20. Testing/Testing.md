# Flask 3.1.3 — Testing

Automated tests give confidence when shipping e-commerce checkouts, social feeds, and SaaS APIs. This guide covers **pytest** structure, Flask’s **test client**, **route** and **auth** testing, **database** strategies, **mocks/fixtures**, and **advanced** integration, E2E, load, coverage, and CI patterns for Flask 3.1.3 applications on Python 3.9+.

---

## 📑 Table of Contents

1. [20.1 Testing Basics](#201-testing-basics)
2. [20.2 Flask Test Client](#202-flask-test-client)
3. [20.3 Testing Routes](#203-testing-routes)
4. [20.4 Testing Authentication](#204-testing-authentication)
5. [20.5 Database Testing](#205-database-testing)
6. [20.6 Mocking and Fixtures](#206-mocking-and-fixtures)
7. [20.7 Advanced Testing](#207-advanced-testing)
8. [Best Practices](#best-practices-summary)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Comparison Tables](#comparison-tables)

---

## 20.1 Testing Basics

### 20.1.1 pytest Framework

**pytest** discovers `test_*.py` and `*_test.py`; rich assertions and plugins.

#### 🟢 Beginner Example

```python
# tests/test_math.py
def test_add():
    assert 1 + 1 == 2
```

#### 🟡 Intermediate Example

```python
# pytest.ini
[pytest]
testpaths = tests
pythonpath = .
```

#### 🔴 Expert Example

```python
# pyproject.toml
[tool.pytest.ini_options]
addopts = "-q --strict-markers"
markers = [
    "integration: hits real network/db",
]
```

#### 🌍 Real-Time Example (SaaS Monorepo)

```python
# tests/apps/billing/test_invoices.py
```

### 20.1.2 Test Structure

**Arrange–Act–Assert**; one behavior per test name.

#### 🟢 Beginner Example

```python
def test_health_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
```

#### 🟡 Intermediate Example

```python
def test_create_post_requires_login(client):
    r = client.post("/posts", json={"title": "x"})
    assert r.status_code in (401, 302)
```

#### 🔴 Expert Example

```python
# Given/When/Then comments for complex flows
```

#### 🌍 Real-Time Example (E-Commerce)

```python
def test_coupon_does_not_stack_with_sale_price(cart_factory):
    cart = cart_factory(sale_item=True)
    r = apply_coupon(cart, "EXTRA10")
    assert r.json["ok"] is False
```

### 20.1.3 Test Cases

Group related checks; avoid giant tests.

#### 🟢 Beginner Example

```python
@pytest.mark.parametrize("path,expected", [("/", 200), ("/missing", 404)])
def test_status(client, path, expected):
    assert client.get(path).status_code == expected
```

#### 🟡 Intermediate Example

```python
class TestCheckout:
    def test_happy_path(self, client): ...
    def test_out_of_stock(self, client): ...
```

#### 🔴 Expert Example

```python
# Hypothesis property tests for parsers
```

#### 🌍 Real-Time Example (Social Permissions)

```python
@pytest.mark.parametrize("role,status", [("member", 403), ("mod", 200)])
def test_delete_comment(client, role, status): ...
```

### 20.1.4 Test Organization

**`tests/`** mirror package; **conftest.py** for fixtures.

#### 🟢 Beginner Example

```
project/
  app.py
  tests/
    test_app.py
```

#### 🟡 Intermediate Example

```
tests/
  conftest.py
  unit/
  integration/
```

#### 🔴 Expert Example

```python
# Namespace packages for large teams
```

#### 🌍 Real-Time Example (SaaS)

```python
tests/contract/  # consumer-driven contracts
```

### 20.1.5 Running Tests

```bash
pytest
pytest tests/test_api.py::test_ping -q
pytest -k "checkout"
```

#### 🟢 Beginner Example

```bash
pytest -q
```

#### 🟡 Intermediate Example

```bash
pytest --maxfail=1 --disable-warnings
```

#### 🔴 Expert Example

```bash
pytest -n auto  # pytest-xdist
```

#### 🌍 Real-Time Example (CI)

```yaml
# GitHub Actions
- run: pytest --cov=app --cov-report=xml
```

---

## 20.2 Flask Test Client

### 20.2.1 Test Client Creation

**`app.test_client()`** with request context; use **`TESTING=True`**.

#### 🟢 Beginner Example

```python
import pytest
from app import create_app

@pytest.fixture()
def app():
    app = create_app()
    app.config.update(TESTING=True)
    return app

@pytest.fixture()
def client(app):
    return app.test_client()
```

#### 🟡 Intermediate Example

```python
@pytest.fixture()
def runner(app):
    return app.test_cli_runner()
```

#### 🔴 Expert Example

```python
with app.test_client() as c:
    with c.session_transaction() as sess:
        sess["user_id"] = "1"
    r = c.get("/me")
```

#### 🌍 Real-Time Example (E-Commerce)

```python
# Separate app factory for tests with in-memory SQLite
```

### 20.2.2 Making Requests

**`get/post/put/delete/patch`**, **`follow_redirects`**.

#### 🟢 Beginner Example

```python
def test_home(client):
    assert client.get("/").status_code == 200
```

#### 🟡 Intermediate Example

```python
r = client.post("/login", data={"email": "a@b.com", "password": "x"}, follow_redirects=True)
```

#### 🔴 Expert Example

```python
r = client.open("/api/v1/items", method="PATCH", json={"name": "n"})
```

#### 🌍 Real-Time Example (SaaS)

```python
r = client.get("/api/v1/tenants/t1/users", headers={"Authorization": "Bearer t"})
```

### 20.2.3 Request Methods

Exercise **OPTIONS** for CORS preflight if custom.

#### 🟢 Beginner Example

```python
assert client.post("/items", json={"sku": "1"}).status_code == 201
```

#### 🟡 Intermediate Example

```python
client.delete("/items/1")
```

#### 🔴 Expert Example

```python
resp = client.options("/api/upload", headers={"Origin": "https://app.example"})
assert "Access-Control-Allow-Methods" in resp.headers
```

#### 🌍 Real-Time Example (Social)

```python
# PUT idempotent follow graph sync
```

### 20.2.4 Response Checking

**`status_code`**, **`json`**, **`data`**, **`headers`**.

#### 🟢 Beginner Example

```python
r = client.get("/api/ping")
assert r.is_json
assert r.json["ok"] is True
```

#### 🟡 Intermediate Example

```python
assert r.headers["Content-Type"].startswith("application/json")
```

#### 🔴 Expert Example

```python
assert r.headers.get("ETag")
```

#### 🌍 Real-Time Example (E-Commerce)

```python
assert r.json["cart"]["lines"][0]["sku"] == "MUG-01"
```

### 20.2.5 Status Code Testing

Table-driven expectations for API contracts.

#### 🟢 Beginner Example

```python
assert client.get("/nope").status_code == 404
```

#### 🟡 Intermediate Example

```python
assert client.post("/users", json={}).status_code == 422
```

#### 🔴 Expert Example

```python
# Snapshot stable error JSON bodies
```

#### 🌍 Real-Time Example (SaaS)

```python
assert client.get("/v1/admin", headers=anon).status_code == 401
```

---

## 20.3 Testing Routes

### 20.3.1 Route Testing

Hit **endpoints**; assert body and side effects.

#### 🟢 Beginner Example

```python
def test_create_item(client):
    r = client.post("/items", json={"name": "Pen"})
    assert r.status_code == 201
```

#### 🟡 Intermediate Example

```python
def test_list_items_paginated(client, seed_items):
    r = client.get("/items?page=2&per=10")
    assert len(r.json["items"]) == 10
```

#### 🔴 Expert Example

```python
# Time-freeze for expiring tokens
```

#### 🌍 Real-Time Example (E-Commerce)

```python
def test_cart_merge_on_login(client):
    ...
```

### 20.3.2 URL Parameters

**Path** variables `<int:id>`.

#### 🟢 Beginner Example

```python
assert client.get("/users/99").status_code == 404
```

#### 🟡 Intermediate Example

```python
r = client.get("/users/1")
assert r.json["id"] == 1
```

#### 🔴 Expert Example

```python
# Unicode slugs
```

#### 🌍 Real-Time Example (Social)

```python
client.get("/@handle")
```

### 20.3.3 Query Parameters

**`query_string=dict`** or URL.

#### 🟢 Beginner Example

```python
r = client.get("/search?q=mug")
```

#### 🟡 Intermediate Example

```python
r = client.get("/search", query_string={"q": "mug", "sort": "price"})
```

#### 🔴 Expert Example

```python
# Repeated keys
r = client.get("/tags?tag=a&tag=b")
```

#### 🌍 Real-Time Example (SaaS Reports)

```python
client.get("/reports/sales", query_string={"from": "2026-01-01", "to": "2026-01-31"})
```

### 20.3.4 Form Data

**`data=dict`**, **`content_type=multipart/form-data`** implicit with files.

#### 🟢 Beginner Example

```python
r = client.post("/contact", data={"name": "A", "msg": "Hi"})
```

#### 🟡 Intermediate Example

```python
r = client.post(
    "/upload",
    data={"title": "x"},
    content_type="multipart/form-data",
    follow_redirects=True,
)
```

#### 🔴 Expert Example

```python
from io import BytesIO

client.post(
    "/upload",
    data={"file": (BytesIO(b"abc"), "a.txt")},
    content_type="multipart/form-data",
)
```

#### 🌍 Real-Time Example (E-Commerce Returns)

```python
data = {"order_id": "o1", "reason": "damaged"}
```

### 20.3.5 JSON Data

**`json=dict`** sets **`application/json`**.

#### 🟢 Beginner Example

```python
client.post("/api/items", json={"sku": "1"})
```

#### 🟡 Intermediate Example

```python
client.post("/api/items", data="not-json", content_type="application/json")
# expect 400
```

#### 🔴 Expert Example

```python
# Large JSON via stream simulation
```

#### 🌍 Real-Time Example (SaaS Webhooks)

```python
payload = {"type": "invoice.paid", "id": "evt_1"}
sig = sign(payload)
client.post("/hooks/stripe", json=payload, headers={"Stripe-Signature": sig})
```

---

## 20.4 Testing Authentication

### 20.4.1 Login Testing

POST credentials; follow session cookie.

#### 🟢 Beginner Example

```python
def login(client, email, password):
    return client.post("/login", data={"email": email, "password": password})

def test_login_ok(client):
    r = login(client, "u@example.com", "pw")
    assert r.status_code in (200, 302)
```

#### 🟡 Intermediate Example

```python
with client:
    login(client, "u@example.com", "pw")
    r = client.get("/account")
    assert r.status_code == 200
```

#### 🔴 Expert Example

```python
# Time-limited OTP step-up
```

#### 🌍 Real-Time Example (E-Commerce)

```python
def test_checkout_requires_address(client, logged_in):
    r = client.post("/checkout")
    assert r.status_code == 400
```

### 20.4.2 Protected Routes

**401/302** when anonymous.

#### 🟢 Beginner Example

```python
assert client.get("/account").status_code in (302, 401)
```

#### 🟡 Intermediate Example

```python
@pytest.fixture
def logged_in_client(client):
    login(client, "u@example.com", "pw")
    return client
```

#### 🔴 Expert Example

```python
# API returns JSON 401, HTML returns redirect — branch tests
```

#### 🌍 Real-Time Example (SaaS)

```python
assert client.get("/v1/me").status_code == 401
```

### 20.4.3 Permission Testing

Roles **admin** vs **user**.

#### 🟢 Beginner Example

```python
def test_admin_only(client, admin_session):
    assert client.get("/admin").status_code == 200
```

#### 🟡 Intermediate Example

```python
def test_user_forbidden(client, user_session):
    assert client.delete("/admin/users/1").status_code == 403
```

#### 🔴 Expert Example

```python
# ABAC: tenant boundary tests
```

#### 🌍 Real-Time Example (Social Mod Tools)

```python
assert mod_client.delete("/comments/9").status_code == 204
```

### 20.4.4 Token Testing

**`Authorization` header** with test JWTs.

#### 🟢 Beginner Example

```python
token = create_access_token(identity="1")  # test util
r = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
```

#### 🟡 Intermediate Example

```python
assert client.get("/api/me", headers={"Authorization": "Bearer bad"}).status_code == 422
```

#### 🔴 Expert Example

```python
# RS256 with test keypair; jwks rotation simulation
```

#### 🌍 Real-Time Example (Mobile API)

```python
refresh_flow(client)
```

### 20.4.5 Session Testing

**`session_transaction`** to seed.

#### 🟢 Beginner Example

```python
with client.session_transaction() as sess:
    sess["user_id"] = "42"
assert client.get("/me").status_code == 200
```

#### 🟡 Intermediate Example

```python
# Flask-Login: login_user in request context
from flask_login import login_user

with app.test_request_context():
    login_user(user)
```

#### 🔴 Expert Example

```python
# Secure cookie session signed — use real login for integration
```

#### 🌍 Real-Time Example (E-Commerce)

```python
# Guest cart id in session before merge
```

---

## 20.5 Database Testing

### 20.5.1 Test Database Setup

**SQLite `:memory:`** or **transactional** PostgreSQL schema.

#### 🟢 Beginner Example

```python
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
```

#### 🟡 Intermediate Example

```python
@pytest.fixture(scope="session")
def engine():
    e = create_engine(os.environ["TEST_DATABASE_URL"])
    Base.metadata.create_all(e)
    yield e
    Base.metadata.drop_all(e)
```

#### 🔴 Expert Example

```python
# Testcontainers Postgres for parity
```

#### 🌍 Real-Time Example (SaaS)

```python
# Per-worker schema via pytest-xdist naming
```

### 20.5.2 Database Fixtures

**Session-scoped engine** + **function-scoped session**.

#### 🟢 Beginner Example

```python
@pytest.fixture
def db_session(app):
    with app.app_context():
        db.create_all()
        yield db.session
        db.drop_all()
```

#### 🟡 Intermediate Example

```python
@pytest.fixture
def user_factory(db_session):
    def _make(email="a@b.com"):
        u = User(email=email)
        db_session.add(u)
        db_session.commit()
        return u
    return _make
```

#### 🔴 Expert Example

```python
# SQLAlchemy 2.0 session.begin_nested() savepoints per test
```

#### 🌍 Real-Time Example (E-Commerce)

```python
@pytest.fixture
def product_catalog(db_session):
    seed_skus(["MUG", "HAT"])
```

### 20.5.3 Data Seeding

**Factories** (factory_boy) or **fixtures**.

#### 🟢 Beginner Example

```python
db.session.add(Order(id="o1", total=1000))
db.session.commit()
```

#### 🟡 Intermediate Example

```python
import factory

class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = db.session
    email = factory.Sequence(lambda n: f"user{n}@example.com")
```

#### 🔴 Expert Example

```python
# Deterministic seeds via faker seed
```

#### 🌍 Real-Time Example (Social)

```python
seed_graph(followers=1000, depth=2)  # perf test dataset
```

### 20.5.4 Database Cleanup

**Truncate** or **drop/create** per test.

#### 🟢 Beginner Example

```python
db.drop_all(); db.create_all()
```

#### 🟡 Intermediate Example

```python
for table in reversed(Base.metadata.sorted_tables):
    db.session.execute(table.delete())
db.session.commit()
```

#### 🔴 Expert Example

```python
# Template DB clone for speed (postgres)
```

#### 🌍 Real-Time Example (SaaS)

```python
# Tenant isolation tests wipe tenant rows only
```

### 20.5.5 Transaction Rollback

**Connection + transaction** per test; rollback for speed.

#### 🟢 Beginner Example

```python
@pytest.fixture
def db_session(app):
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        options = dict(bind=connection, binds={})
        session = db.create_scoped_session(options=options)
        db.session = session
        yield session
        transaction.rollback()
        connection.close()
        session.remove()
```

#### 🟡 Intermediate Example

```python
# Flask-SQLAlchemy 3 patterns — consult current docs for your version
```

#### 🔴 Expert Example

```python
# Nested transactions for partial commits in test
```

#### 🌍 Real-Time Example (E-Commerce)

```python
# Assert no rows leaked after rollback on payment failure
```

---

## 20.6 Mocking and Fixtures

### 20.6.1 pytest Fixtures

**`@pytest.fixture`** with **scope** `function`/`module`/`session`.

#### 🟢 Beginner Example

```python
@pytest.fixture
def app():
    return create_app(testing=True)

@pytest.fixture
def client(app):
    return app.test_client()
```

#### 🟡 Intermediate Example

```python
@pytest.fixture(scope="module")
def app_module():
    ...
```

#### 🔴 Expert Example

```python
@pytest.fixture(autouse=True)
def reset_clock():
    ...
```

#### 🌍 Real-Time Example (SaaS)

```python
@pytest.fixture
def tenant_ctx(app):
    with set_tenant("t1"):
        yield
```

### 20.6.2 Fixture Scope

Balance **speed** vs **isolation**.

#### 🟢 Beginner Example

```python
# function default — safest
```

#### 🟡 Intermediate Example

```python
@pytest.fixture(scope="session")
def docker_redis():
    ...
```

#### 🔴 Expert Example

```python
# module-scoped app with function-scoped db rollback
```

#### 🌍 Real-Time Example (Load Tests)

```python
session-scoped shared dataset
```

### 20.6.3 Mock Objects

**`unittest.mock.Mock`**, **`MagicMock`**.

#### 🟢 Beginner Example

```python
from unittest.mock import Mock

payment = Mock()
payment.charge.return_value = {"id": "ch_1"}
```

#### 🟡 Intermediate Example

```python
with patch("app.services.mail.send", autospec=True) as m:
    client.post("/notify")
    m.assert_called_once()
```

#### 🔴 Expert Example

```python
# Mock httpx.AsyncClient with respx
```

#### 🌍 Real-Time Example (E-Commerce)

```python
patch("stripe.Charge.create", return_value=fake_charge)
```

### 20.6.4 Patching

**`patch.object`**, **`where`** string path.

#### 🟢 Beginner Example

```python
from unittest.mock import patch

@patch("app.views.time.time", return_value=123)
def test_token_expiry(mock_time, client):
    ...
```

#### 🟡 Intermediate Example

```python
with patch.dict(os.environ, {"FEATURE_X": "1"}):
    ...
```

#### 🔴 Expert Example

```python
# patch as decorator order (bottom-up application)
```

#### 🌍 Real-Time Example (SaaS Feature Flags)

```python
patch("app.flags.is_enabled", return_value=True)
```

### 20.6.5 Dependency Injection

Pass **ports** into services for test doubles.

#### 🟢 Beginner Example

```python
def notify(user, mailer):
    mailer.send(user.email, "hi")

def test_notify():
    m = Mock()
    notify(User(email="a@b.com"), m)
    m.send.assert_called_once()
```

#### 🟡 Intermediate Example

```python
app.extensions["mailer"] = test_mailer
```

#### 🔴 Expert Example

```python
# Protocol-typed interfaces (PEP 544)
```

#### 🌍 Real-Time Example (Social Push)

```python
class FakePushGateway:
    def send(self, token, msg):
        self.out.append((token, msg))
```

---

## 20.7 Advanced Testing

### 20.7.1 Integration Testing

Real **DB/Redis** in Docker; no mocks for critical paths.

#### 🟢 Beginner Example

```python
@pytest.mark.integration
def test_order_flow(client, db_ready):
    ...
```

#### 🟡 Intermediate Example

```python
# docker-compose -f docker-compose.test.yml up -d
```

#### 🔴 Expert Example

```python
# Testcontainers lifecycle in fixture
```

#### 🌍 Real-Time Example (E-Commerce)

```python
full checkout with payment sandbox
```

### 20.7.2 End-to-End Testing

**Playwright/Selenium** against running server.

#### 🟢 Beginner Example

```python
# pytest-playwright
def test_home_title(page, live_server):
    page.goto(live_server.url)
    assert page.title().startswith("Shop")
```

#### 🟡 Intermediate Example

```python
@pytest.fixture(scope="session")
def live_server(app):
    ...
```

#### 🔴 Expert Example

```python
# Visual regression with percy
```

#### 🌍 Real-Time Example (SaaS Onboarding)

```python
signup -> verify email stub -> create workspace
```

### 20.7.3 Load Testing

**Locust**, **k6**, **`wrk`**.

#### 🟢 Beginner Example

```python
# locustfile.py snippet
from locust import HttpUser, task

class APIUser(HttpUser):
    @task
    def ping(self):
        self.client.get("/health")
```

#### 🟡 Intermediate Example

```python
# token pool for authenticated load
```

#### 🔴 Expert Example

```python
# soak test 8h for memory leaks
```

#### 🌍 Real-Time Example (Social Trending Endpoint)

```python
# spike test during simulated viral event
```

### 20.7.4 Test Coverage

**`pytest-cov`**; aim for **meaningful** lines, not 100% blindly.

#### 🟢 Beginner Example

```bash
pytest --cov=myapp
```

#### 🟡 Intermediate Example

```ini
[coverage:run]
branch = True
omit = */migrations/*
```

#### 🔴 Expert Example

```python
# diff-cover against main for PR gating
```

#### 🌍 Real-Time Example (SaaS)

```python
# Cover error handlers and webhooks
```

### 20.7.5 Continuous Testing

**CI matrix** Python 3.9–3.13; **lint** + **types** + **tests**.

#### 🟢 Beginner Example

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: "3.12"
- run: pip install -r requirements-dev.txt
- run: pytest
```

#### 🟡 Intermediate Example

```yaml
strategy:
  matrix:
    python-version: ["3.10", "3.12"]
```

#### 🔴 Expert Example

```yaml
# Merge queue + flaky test quarantine job
```

#### 🌍 Real-Time Example (E-Commerce Peak Prep)

```python
# Synthetic canary pipeline post-deploy
```

---

## Best Practices (Summary)

- Prefer **app factory** + **`TESTING=True`** configuration.
- Use **transactions** or **fresh DB** strategies that match production engine.
- Test **error handlers** and **edge HTTP** cases, not only happy paths.
- **Isolate time** and **randomness** for deterministic tests.
- Mark **slow/integration** tests; run fast suite locally.
- Keep **secrets** out of tests; use **fakes** for external APIs.

---

## Common Mistakes to Avoid

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Sharing mutable global state | Flaky tests | Fixtures + rollback |
| No `app_context` | Runtime errors | Push context in fixtures |
| Over-mocking ORM | False confidence | Integration tests for queries |
| Testing implementation details | Brittle suite | Test behavior/HTTP contract |
| Production `SECRET_KEY` in tests | Accidents | Dedicated test secrets |

---

## Comparison Tables

| Tool | Purpose |
|------|---------|
| pytest | Runner + fixtures |
| Flask test client | In-process HTTP |
| Playwright | Browser E2E |
| Locust | Load |
| coverage.py | Line/branch coverage |
| Testcontainers | Real dependencies |

| DB strategy | Speed | Fidelity |
|-------------|-------|----------|
| SQLite memory | Fastest | Lower |
| PG + rollback | Fast | High |
| Shared PG + truncate | Medium | High |

---

*Flask 3.1.3 (February 2026), Python 3.9+. Test client behavior follows Werkzeug; verify details when upgrading dependencies.*
