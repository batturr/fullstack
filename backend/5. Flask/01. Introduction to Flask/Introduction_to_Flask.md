# Introduction to Flask

**Flask 3.1.3** is a lightweight **Python web framework** for building HTTP services and full-stack applications. It follows a **microframework** philosophy: the core ships with routing, request/response handling, templating integration, and a development server—while databases, authentication, admin panels, and other features are added via extensions or your own code. Flask sits on top of **Werkzeug** (WSGI), **Jinja2** (templates), **Click** (CLI), and **ItsDangerous** (signing). This chapter explains what Flask is, how its ecosystem fits together, how to reason about versions and Python support, and how Flask compares to Django and FastAPI so you can choose tools and plan a learning path.

---

## 📑 Table of Contents

1. [What is Flask?](#1-what-is-flask)
   - 1.1 Overview
   - 1.2 Microframework philosophy
   - 1.3 Why Flask
   - 1.4 Flask vs Django
   - 1.5 Use cases
   - 1.6 Community
2. [Flask Ecosystem](#2-flask-ecosystem)
   - 2.1 Werkzeug WSGI toolkit
   - 2.2 Jinja2 template engine
   - 2.3 Click CLI kit
   - 2.4 ItsDangerous data signing
   - 2.5 Popular extensions
3. [Getting Started](#3-getting-started)
   - 3.1 Flask versions
   - 3.2 Python requirements
   - 3.3 Virtual environments
   - 3.4 Installation methods
4. [Comparison and Context](#4-comparison-and-context)
   - 4.1 Flask vs Django vs FastAPI
   - 4.2 When to use Flask
   - 4.3 Learning curve
   - 4.4 Career path
5. [Best Practices](#5-best-practices)
6. [Common Mistakes to Avoid](#6-common-mistakes-to-avoid)
7. [Comparison Tables](#7-comparison-tables)

---

## 1. What is Flask?

### 1.1 Overview

Flask is a **WSGI** web application framework. A minimal Flask program creates an application object, registers URL routes, and returns responses. Unlike “batteries-included” frameworks that prescribe project layout and ORM usage, Flask emphasizes **composition**: you import what you need, structure the project as it grows, and adopt extensions (for example **Flask-SQLAlchemy**, **Flask-Login**) when requirements appear.

**Core ideas:**

- **Application object** (`Flask(__name__)`) holds configuration and URL map.
- **Routes** map URLs and HTTP methods to Python callables.
- **Request and response** abstractions wrap WSGI environ and return values.
- **Contexts** (`app`, `request`) make dependencies available during a request.

### 1.2 Microframework philosophy

A **microframework** provides a **small, stable core** and avoids bundling every possible feature. You are not forced into a single ORM, user model, or deployment story. The trade-off is **more decisions**: you choose libraries, patterns (blueprints, factories), and operational tooling.

### 1.3 Why Flask

Teams pick Flask for **speed of iteration**, **flexibility**, **readable code**, and **Pythonic APIs**. It fits prototypes, internal tools, JSON APIs behind SPAs, and traditional server-rendered sites. The ecosystem is mature; many third-party packages integrate cleanly.

### 1.4 Flask vs Django

**Django** is full-stack and opinionated: ORM, admin, auth, migrations, and template language are first-class. **Flask** is minimal; you assemble the stack. Django often wins for **large CRUD-heavy** products with uniform patterns; Flask often wins when you need **lightweight services** or **unusual architecture**.

### 1.5 Use cases

- **REST/JSON backends** for React, Vue, or mobile apps.
- **Server-rendered** marketing sites and dashboards with Jinja2.
- **Webhooks** and **integration** endpoints (payments, Slack, GitHub).
- **Internal tools** and **data APIs** where SQLAlchemy or raw SQL is enough.
- **Microservices** behind a gateway (each service stays small).

### 1.6 Community

Flask is **open source** (BSD-style license), documented at [flask.palletsprojects.com](https://flask.palletsprojects.com/), and maintained as part of the **Pallets** project (alongside Werkzeug and Jinja2). Extensions vary in maintenance quality—prefer widely used, documented packages and pin versions in production.

#### Concept: Your first mental model of a Flask app

### 🟢 Beginner Example

The smallest Flask 3.x application: one route returns plain text.

```python
from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "Hello, Flask 3.1!"


if __name__ == "__main__":
    app.run(debug=True)
```

### 🟡 Intermediate Example

Separate concerns slightly: a health route and a JSON “about” payload—typical for a small API.

```python
from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/health")
def health():
    return jsonify(status="ok", version="3.1.3")


@app.route("/api/info")
def info():
    return jsonify(
        service="catalog-api",
        framework="flask",
        docs="/docs",
    )
```

### 🔴 Expert Example

**Application factory** pattern (recommended for tests and multiple environments): configuration is injected, no module-level side effects.

```python
from flask import Flask


def create_app(config_object: str | None = None) -> Flask:
    app = Flask(__name__)
    if config_object:
        app.config.from_object(config_object)
    app.config.setdefault("JSON_SORT_KEYS", False)

    @app.get("/ready")
    def ready():
        return {"ready": True}, 200

    return app


app = create_app("config.ProductionConfig")
```

### 🌍 Real-Time Example

**SaaS product** skeleton: versioned API namespace, structured JSON errors, no secrets in code (read from environment in real deployments).

```python
import os
from flask import Flask, jsonify, g, request


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-change-me")

    @app.before_request
    def attach_tenant():
        g.tenant_id = request.headers.get("X-Tenant-Id", "public")

    @app.get("/v1/status")
    def tenant_status():
        return jsonify(
            tenant=g.tenant_id,
            plan="pro",
            region=os.environ.get("AWS_REGION", "local"),
        )

    return app


app = create_app()
```

---

## 2. Flask Ecosystem

### 2.1 Werkzeug WSGI toolkit

**Werkzeug** implements HTTP primitives: routing data structures, request/response wrappers, utilities for cookies, URLs, and security helpers. Flask builds its `Request` and `Response` behavior on Werkzeug. Understanding WSGI helps when you deploy behind **Gunicorn**, **uWSGI**, or **mod_wsgi**.

### 2.2 Jinja2 template engine

**Jinja2** provides `render_template`, inheritance (`{% extends %}`), macros, filters, and autoescaping for HTML. Flask configures a default template search path (`templates/`).

### 2.3 Click CLI kit

**Click** powers `flask` CLI commands (`flask run`, `flask shell`, custom commands via `app.cli`). Flask 3.x continues to integrate Click for developer workflows.

### 2.4 ItsDangerous data signing

**ItsDangerous** signs and serializes data (for example **session cookies**). Tampering is detected; payloads are not encryption—do not store sensitive secrets in signed cookies without additional protection.

### 2.5 Popular extensions

| Extension | Role |
|-----------|------|
| Flask-SQLAlchemy | ORM integration |
| Flask-Migrate | Alembic migrations |
| Flask-Login | Session-based auth |
| Flask-JWT-Extended | JWT APIs |
| Flask-RESTful / marshmallow | API structuring and validation |
| Flask-CORS | Cross-origin headers |
| Flask-Limiter | Rate limiting |
| Flask-Caching | Cache backends |

#### Concept: Using Werkzeug types alongside Flask

### 🟢 Beginner Example

Import a Werkzeug helper for a safe redirect target (conceptual; validate open redirects in production).

```python
from flask import Flask, redirect, request
from werkzeug.urls import url_parse

app = Flask(__name__)


@app.route("/go")
def go():
    nxt = request.args.get("next", "/")
    if url_parse(nxt).netloc != "":
        nxt = "/"
    return redirect(nxt)
```

### 🟡 Intermediate Example

Return a **Werkzeug Response** when you need low-level control (headers, iterables).

```python
from flask import Flask
from werkzeug.wrappers import Response

app = Flask(__name__)


@app.route("/stream.txt")
def stream_txt():
    def gen():
        yield "line1\n"
        yield "line2\n"

    return Response(gen(), mimetype="text/plain")
```

### 🔴 Expert Example

Custom **URL map** behavior: register rules programmatically with `endpoint` names for `url_for`.

```python
from flask import Flask, url_for

app = Flask(__name__)


def page(name: str):
    return f"Page: {name}"


app.add_url_rule("/pages/<name>", endpoint="page", view_func=page)


with app.test_request_context():
    assert url_for("page", name="about") == "/pages/about"
```

### 🌍 Real-Time Example

**E-commerce** service: signed cart cookie (ItsDangerous-style usage is often via `flask.session`; here illustrating signed payloads conceptually with `URLSafeSerializer`).

```python
import os
from flask import Flask, jsonify, request
from itsdangerous import URLSafeSerializer, BadSignature

app = Flask(__name__)
_ser = URLSafeSerializer(os.environ.get("SECRET_KEY", "dev-secret"))


@app.get("/cart")
def cart():
    raw = request.cookies.get("cart")
    if not raw:
        return jsonify(items=[])
    try:
        data = _ser.loads(raw)
    except BadSignature:
        return jsonify(error="invalid_cart"), 400
    return jsonify(items=data.get("items", []))
```

---

## 3. Getting Started

### 3.1 Flask versions

**Flask 3.1.3** (February 2026 per release notes you are aligning with) builds on modern Python features where appropriate. Pin **exact versions** in production (`flask==3.1.3`) and read the [changelog](https://flask.palletsprojects.com/changes/) when upgrading.

### 3.2 Python requirements

Flask 3.x targets **Python 3.9+**. Use the same Python series locally, in CI, and in containers. Avoid mixing system Python with project dependencies.

### 3.3 Virtual environments

Use **`venv`** (stdlib), **Conda**, or **Poetry** so `pip install flask` does not pollute global site-packages. Activate the environment before running `flask run`.

### 3.4 Installation methods

- `pip install flask` (latest compatible).
- `pip install "flask==3.1.3"` for reproducible builds.
- **Poetry** / **pip-tools** for lockfiles.
- **Docker** base images with pinned Python and `requirements.txt`.

#### Concept: Environment-specific configuration loading

### 🟢 Beginner Example

Install and verify in a fresh venv.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install "flask==3.1.3"
python -c "import flask; print(flask.__version__)"
```

### 🟡 Intermediate Example

`requirements.txt` with hashes (conceptual—generate with `pip-compile` in real projects).

```text
flask==3.1.3
werkzeug>=3.0.0
jinja2>=3.1.0
itsdangerous>=2.2.0
click>=8.1.0
```

### 🔴 Expert Example

**Poetry** `pyproject.toml` fragment pinning Flask for a library that depends on Flask as optional extra.

```toml
[tool.poetry.dependencies]
python = "^3.11"
flask = { version = "3.1.3", optional = true }

[tool.poetry.extras]
web = ["flask"]
```

### 🌍 Real-Time Example

**CI pipeline** (GitHub Actions style): matrix Python 3.10–3.12, install deps, run tests.

```yaml
# .github/workflows/ci.yml (illustrative)
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -r requirements.txt
      - run: pytest
```

---

## 4. Comparison and Context

### 4.1 Flask vs Django vs FastAPI

- **Flask**: WSGI-first, flexible, sync by default; async experimental patterns exist via ASGI bridges or other servers depending on stack.
- **Django**: Batteries-included, admin, ORM, migrations, auth; strong for traditional web apps.
- **FastAPI**: ASGI, automatic OpenAPI, `async`/`await` first; excellent for high-concurrency JSON APIs when team adopts async I/O.

### 4.2 When to use Flask

Choose Flask when you want **incremental complexity**, **Jinja2** server rendering, **mature extension** ecosystem, or a **WSGI** deployment you already operate (Gunicorn + nginx).

### 4.3 Learning curve

Flask is **easy to start**, harder to **scale in structure** without learning factories, blueprints, and testing patterns. Django front-loads concepts; FastAPI front-loads type annotations and async.

### 4.4 Career path

Flask appears in **startups**, **Python-heavy** backends, and **data** organizations. Complement Flask with **SQLAlchemy**, **pytest**, **Docker**, and **OpenAPI** (via extensions or separate tools) for strong backend profiles.

#### Concept: Choosing a stack for three product shapes

### 🟢 Beginner Example

**Personal blog**—Flask + Jinja2 + SQLite is enough.

```python
# Single-file blog prototype (illustrative)
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    posts = [{"title": "Hello", "slug": "hello"}]
    return render_template("index.html", posts=posts)
```

### 🟡 Intermediate Example

**Social feed API**—Flask returns JSON; mobile clients consume `/v1/posts`.

```python
from flask import Flask, jsonify

app = Flask(__name__)
POSTS = [{"id": 1, "user": "ada", "text": "Shipped v1"}]


@app.get("/v1/posts")
def list_posts():
    return jsonify(POSTS)
```

### 🔴 Expert Example

**Multi-tenant SaaS**—factories, config profiles, and blueprint registration per domain module.

```python
from flask import Flask


def create_app() -> Flask:
    app = Flask(__name__)
    from .blueprints.billing import bp as billing_bp
    from .blueprints.auth import bp as auth_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(billing_bp, url_prefix="/billing")
    return app
```

### 🌍 Real-Time Example

**E-commerce** hybrid: HTML checkout pages + JSON catalog for SPA—Flask can serve both from one app with clear URL prefixes.

```python
from flask import Flask, jsonify, render_template

app = Flask(__name__)


@app.route("/checkout")
def checkout_page():
    return render_template("checkout.html")


@app.get("/api/products")
def products():
    return jsonify([{"sku": "TSHIRT-01", "price_cents": 2500}])
```

---

## 5. Best Practices

1. **Use an application factory** (`create_app`) for tests and multiple configs.
2. **Never commit secrets**; load `SECRET_KEY` and DB URLs from the environment.
3. **Pin dependencies** in production (`requirements.txt` lock or Poetry lockfile).
4. **Enable debug only in development**; never expose `debug=True` on the public internet.
5. **Structure early**: move routes into **blueprints** before files become unwieldy.
6. **Test with `app.test_client()`** and **pytest** fixtures wrapping `create_app`.
7. **Read security guidance** for cookies, CSRF (when using sessions/forms), and SSRF when calling external URLs.
8. **Monitor extension compatibility** when upgrading Flask major/minor versions.
9. **Use type hints** in larger codebases for clarity and tooling.
10. **Document your architecture** choices (why Flask over alternatives) for onboarding.

---

## 6. Common Mistakes to Avoid

| Mistake | Why it hurts | Better approach |
|---------|----------------|-----------------|
| Global `app` with imports that run side effects | Circular imports, brittle tests | Factory + late imports inside factory |
| `debug=True` in production | Remote code execution risk | Env-gated debug, proper logging |
| Storing secrets in source | Credential leaks | Env vars / secret manager |
| Ignoring WSGI server in production | Dev server is not hardened | Gunicorn, Waitress, etc. |
| Unbounded extension sprawl | Unmaintained deps | Curate extensions, review licenses |
| Skipping CSRF for session forms | Cross-site attacks | Flask-WTF or token strategy |
| Trusting user-controlled redirect URLs | Open redirects | Allowlist hosts/paths |
| No tests around routes | Regressions ship | pytest + test client |

---

## 7. Comparison Tables

### Flask vs Django (feature emphasis)

| Topic | Flask | Django |
|------|-------|--------|
| **Default ORM** | None (choose SQLAlchemy, etc.) | Django ORM |
| **Admin UI** | Via extensions / custom | Built-in admin |
| **Project layout** | You decide | `startproject` structure |
| **Template engine** | Jinja2 (default) | Django Template Language |
| **Auth** | Extensions / custom | `django.contrib.auth` |
| **Learning path** | Gradual, assemble stack | Steeper upfront, cohesive docs |

### Flask vs FastAPI (API-focused)

| Topic | Flask | FastAPI |
|------|-------|---------|
| **Protocol** | WSGI (typical) | ASGI |
| **Async** | Sync idioms; async varies by server/setup | Native async |
| **Validation** | Manual / marshmallow / Pydantic in app | Pydantic integration |
| **OpenAPI** | Via extensions/tools | Built-in |
| **Use case fit** | Mixed HTML+JSON, long-lived WSGI | High-performance JSON APIs |

### When Flask shines

| Scenario | Rationale |
|----------|-----------|
| **Jinja2-heavy sites** | First-class template story |
| **Existing WSGI ops** | Drop-in with Gunicorn |
| **Gradual complexity** | Start tiny, grow with blueprints |
| **Python team preference** | Simple, readable patterns |

---

### Supplementary examples (four levels) — **Community and documentation**

### 🟢 Beginner Example

Read version and doc link at runtime during diagnostics.

```python
import flask

print(flask.__version__)
print(flask.__doc__[:80])
```

### 🟡 Intermediate Example

Expose `/meta` for internal tooling (framework version, git sha from env).

```python
import os
import flask
from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/meta")
def meta():
    return jsonify(
        flask=flask.__version__,
        commit=os.environ.get("GIT_COMMIT", "unknown"),
    )
```

### 🔴 Expert Example

Custom **CLI command** via Click for operational tasks (Flask 3 + Click integration).

```python
import click
from flask import Flask

app = Flask(__name__)


@app.cli.command("create-admin")
@click.argument("email")
def create_admin(email: str):
    """Illustrative CLI hook — wire to your user store."""
    click.echo(f"Would create admin for {email}")


if __name__ == "__main__":
    app.run()
```

### 🌍 Real-Time Example

**Social platform** moderation tool: internal-only route listing build info for on-call engineers.

```python
import os
from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/internal/build-info")
def build_info():
    if os.environ.get("ENV") != "production":
        return jsonify(error="not_found"), 404
    return jsonify(
        service="moderation-api",
        flask="3.1.3",
        region=os.environ.get("REGION"),
    )
```

---

### Supplementary examples — **Microframework philosophy in code**

### 🟢 Beginner Example

No ORM: a hard-coded list demonstrates “bring your own data layer.”

```python
from flask import Flask, jsonify

app = Flask(__name__)
USERS = [{"id": 1, "name": "Sam"}]


@app.get("/users")
def users():
    return jsonify(USERS)
```

### 🟡 Intermediate Example

Swap storage behind a function—framework stays unaware of SQL vs API.

```python
from flask import Flask, jsonify

app = Flask(__name__)


def load_users():
    return [{"id": 1, "name": "Sam"}]


@app.get("/users")
def users():
    return jsonify(load_users())
```

### 🔴 Expert Example

**Plugin-style** registration: routes added by modules without editing core `create_app` heavily.

```python
from flask import Flask

REGISTRY = []


def route(path: str):
    def deco(fn):
        REGISTRY.append((path, fn))
        return fn

    return deco


def create_app():
    app = Flask(__name__)
    for path, fn in REGISTRY:
        app.add_url_rule(path, view_func=fn)
    return app
```

### 🌍 Real-Time Example

**SaaS billing**: Flask only handles HTTP; Stripe webhooks validated in a dedicated module.

```python
from flask import Flask, request, jsonify

app = Flask(__name__)


@app.post("/webhooks/stripe")
def stripe():
    payload = request.get_data()
    sig = request.headers.get("Stripe-Signature", "")
    # Verify signature with Stripe SDK in real code
    if not sig:
        return jsonify(error="missing_signature"), 400
    return jsonify(received=True)
```

---

### Supplementary examples — **Flask vs Django mental model**

### 🟢 Beginner Example

Flask: you define the URL and the view in one place explicitly.

```python
from flask import Flask

app = Flask(__name__)


@app.get("/hello")
def hello():
    return "hello"
```

### 🟡 Intermediate Example

Flask **blueprint** approximates Django `urls.py` modularity.

```python
from flask import Blueprint, jsonify

bp = Blueprint("api", __name__, url_prefix="/api")


@bp.get("/ping")
def ping():
    return jsonify(ping="pong")
```

### 🔴 Expert Example

**Multiple apps** under one process is uncommon; instead use **DispatcherMiddleware** (Werkzeug) to mount sub-apps (advanced deployment pattern).

```python
from flask import Flask
from werkzeug.middleware.dispatcher import DispatcherMiddleware

api = Flask("api")
web = Flask("web")


@api.get("/v1/ok")
def ok():
    return {"ok": True}


@web.get("/")
def home():
    return "web"

app = DispatcherMiddleware(web, {"/api": api})
```

### 🌍 Real-Time Example

**E-commerce** catalog service stays Flask-sized; **Django** might own CMS elsewhere—communicate via HTTP events.

```python
from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/v1/products/<product_id>")
def product(product_id: str):
    # Fetch from DB or upstream CMS API
    return jsonify(id=product_id, title="Example", price_cents=999)
```

---

### Deep dive snippets — **Python requirements and packaging**

### 🟢 Beginner Example

Check Python version before running (simple guard).

```python
import sys

assert sys.version_info >= (3, 9), "Python 3.9+ required"
```

### 🟡 Intermediate Example

Use `python -m pip install flask` to ensure pip matches the interpreter.

```bash
python3.11 -m pip install "flask==3.1.3"
```

### 🔴 Expert Example

**Manylinux** wheel compatibility is handled by pip; pin **compatible** Werkzeug with Flask’s metadata in lockfiles, not by hand when possible.

```bash
pip install "flask==3.1.3"
pip freeze > requirements.txt
```

### 🌍 Real-Time Example

**Docker** multi-stage build: builder installs deps, runtime image is slim.

```dockerfile
FROM python:3.12-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=wsgi:app
CMD ["gunicorn", "-b", "0.0.0.0:8000", "wsgi:app"]
```

---

### Deep dive snippets — **Career path: testing competency**

### 🟢 Beginner Example

```python
from flask import Flask

app = Flask(__name__)


@app.get("/add")
def add():
    return "ok"


client = app.test_client()
assert client.get("/add").status_code == 200
```

### 🟡 Intermediate Example

```python
import pytest
from myapp import create_app


@pytest.fixture()
def client():
    app = create_app("config.TestingConfig")
    with app.test_client() as c:
        yield c


def test_health(client):
    rv = client.get("/health")
    assert rv.status_code == 200
```

### 🔴 Expert Example

```python
def test_openapi_stub(client):
    rv = client.get("/v1/openapi.json")
    assert rv.is_json
    assert "openapi" in rv.get_json()
```

### 🌍 Real-Time Example

```python
def test_checkout_csrf(client):
    # Illustrative: assert CSRF token flow when using Flask-WTF forms
    rv = client.get("/checkout")
    assert rv.status_code in (200, 302)
```

---

### Extended comparison — **Learning curve milestones**

| Week (illustrative) | Flask focus |
|---------------------|-------------|
| 1 | Routes, templates, forms |
| 2 | Blueprints, config, sessions |
| 3 | SQLAlchemy + migrations |
| 4 | Auth, tests, packaging |
| 5+ | Deployment, observability, security hardening |

---

### Final reinforcement — **Use cases across domains**

### 🟢 Beginner Example

Static marketing page served with template.

```python
from flask import Flask, render_template_string

app = Flask(__name__)


@app.get("/")
def home():
    return render_template_string("<h1>Welcome</h1>")
```

### 🟡 Intermediate Example

Webhook receiver for **Slack** slash command (verify signature in production).

```python
from flask import Flask, request, jsonify

app = Flask(__name__)


@app.post("/slack/command")
def slack_command():
    text = request.form.get("text", "")
    return jsonify(response_type="ephemeral", text=f"You said: {text}")
```

### 🔴 Expert Example

Feature-flagged route registration.

```python
import os
from flask import Flask, jsonify

app = Flask(__name__)


if os.environ.get("ENABLE_BETA") == "1":

    @app.get("/beta/feature")
    def beta_feature():
        return jsonify(enabled=True)
```

### 🌍 Real-Time Example

**Media upload** gatekeeper: JSON API for presigned URL workflow (actual S3 logic omitted).

```python
from flask import Flask, jsonify, request

app = Flask(__name__)


@app.post("/v1/uploads")
def uploads():
    body = request.get_json(silent=True) or {}
    filename = body.get("filename")
    if not filename:
        return jsonify(error="filename_required"), 400
    return jsonify(upload_url="https://storage.example/presigned", fields={})
```

---

*End of Introduction to Flask — Flask 3.1.3 learning notes.*
