# First Flask Application

After installation, the fastest way to learn Flask 3.1.3 is to **run a real app**: import `Flask`, create an application instance, register a route with `@app.route`, and return a response. This chapter goes beyond “Hello World” by explaining **application factories**, **application and request contexts**, the **`g`** object, **configuration** (including secrets and environment variables), and **project layout** patterns from single-file scripts to packages ready for production. Examples progress from beginner to real-world **e-commerce**, **social**, and **SaaS** scenarios.

---

## 📑 Table of Contents

1. [Creating Your First App](#1-creating-your-first-app)
   - 1.1 Importing Flask
   - 1.2 Creating Flask instance
   - 1.3 First route `@app.route`
   - 1.4 Running application
   - 1.5 Testing with browser
2. [Understanding Flask Structure](#2-understanding-flask-structure)
   - 2.1 Application factory pattern
   - 2.2 Application context
   - 2.3 Request context
   - 2.4 `g` object
   - 2.5 Current app and request globals
3. [Application Configuration](#3-application-configuration)
   - 3.1 Configuration object
   - 3.2 Environment variables
   - 3.3 Secret key setup
   - 3.4 Debug/testing flags
   - 3.5 Custom configuration
4. [Project Organization](#4-project-organization)
   - 4.1 Single-file apps
   - 4.2 Multi-file apps
   - 4.3 Package structure
   - 4.4 Configuration files
   - 4.5 Layout best practices
5. [Best Practices](#5-best-practices)
6. [Common Mistakes to Avoid](#6-common-mistakes-to-avoid)
7. [Comparison Tables](#7-comparison-tables)

---

## 1. Creating Your First App

### 1.1 Importing Flask

```python
from flask import Flask
```

### 1.2 Creating Flask instance

```python
app = Flask(__name__)
```

`__name__` helps Flask locate resources relative to your package.

### 1.3 First route `@app.route`

```python
@app.route("/")
def index():
    return "<h1>Hello</h1>"
```

### 1.4 Running application

```bash
export FLASK_APP=app:app
flask run
```

### 1.5 Testing with browser

Open `http://127.0.0.1:5000/`. Use browser devtools Network tab to inspect status codes and headers.

#### Concept: Minimal runnable app

### 🟢 Beginner Example

```python
from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "Hello, World!"
```

### 🟡 Intermediate Example

```python
from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/api/ping")
def ping():
    return jsonify(message="pong")
```

### 🔴 Expert Example

```python
from flask import Flask


def create_app():
    app = Flask(__name__)

    @app.get("/healthz")
    def healthz():
        return {"status": "ok"}, 200

    return app


app = create_app()
```

### 🌍 Real-Time Example

**SaaS** status endpoint for load balancers:

```python
from flask import Flask, jsonify
import os

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify(
        ok=True,
        version=os.environ.get("APP_VERSION", "dev"),
    )
```

---

## 2. Understanding Flask Structure

### 2.1 Application factory pattern

```python
def create_app():
    app = Flask(__name__)
    # register blueprints, extensions
    return app
```

Factories simplify **testing** (multiple app instances) and **configuration** injection.

### 2.2 Application context

Code that needs `current_app` must run inside an **app context**:

```python
with app.app_context():
    print(app.name)
```

### 2.3 Request context

During a request, `request`, `session`, and `g` are available. Test with `test_request_context()`.

### 2.4 `g` object

`flask.g` stores data **for the duration of one request** (per worker).

### 2.5 Current app and request globals

- `current_app` — active application proxy.
- `request` — incoming HTTP data.

#### Concept: Using `g` for per-request state

### 🟢 Beginner Example

```python
from flask import Flask, g, jsonify, request

app = Flask(__name__)


@app.before_request
def set_user():
    g.user_id = request.headers.get("X-User-Id", "anonymous")


@app.get("/me")
def me():
    return jsonify(user_id=g.user_id)
```

### 🟡 Intermediate Example

```python
from flask import Flask, g
from functools import wraps

app = Flask(__name__)


def db_conn():
    if "db" not in g:
        g.db = {"connected": True}  # replace with real pool
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        pass  # close handles


@app.get("/query")
def query():
    return {"db": db_conn()}
```

### 🔴 Expert Example

```python
from flask import Flask, g, has_request_context

app = Flask(__name__)


def actor():
    if not has_request_context():
        return None
    return getattr(g, "actor", None)


@app.get("/debug/actor")
def debug_actor():
    return {"actor": actor()}
```

### 🌍 Real-Time Example

**E-commerce** request: attach `g.cart_id` after session lookup.

```python
from flask import Flask, g, jsonify, session

app = Flask(__name__)
app.secret_key = "change-me"


@app.before_request
def load_cart():
    g.cart_id = session.get("cart_id")


@app.get("/cart/summary")
def cart_summary():
    return jsonify(cart_id=g.cart_id, items=[])
```

---

## 3. Application Configuration

### 3.1 Configuration object

`app.config` is a dict-like object:

```python
app.config["DEBUG"] = True
```

### 3.2 Environment variables

```python
import os

app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]
```

### 3.3 Secret key setup

Required for signing sessions:

```python
app.secret_key = os.environ.get("SECRET_KEY", "dev-only")
```

### 3.4 Debug/testing flags

```python
app.config["TESTING"] = True  # in tests
app.config["DEBUG"] = False  # production
```

### 3.5 Custom configuration

```python
class Config:
    JSON_SORT_KEYS = False


class ProdConfig(Config):
    SESSION_COOKIE_SECURE = True


app.config.from_object(ProdConfig)
```

#### Concept: 12-factor style config

### 🟢 Beginner Example

```python
import os
from flask import Flask

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev")
```

### 🟡 Intermediate Example

```python
import os
from flask import Flask

app = Flask(__name__)
app.config.from_prefixed_env()  # maps FLASK_*, verify Flask version docs for exact behavior
```

Note: `from_prefixed_env` exists in modern Flask; consult Flask 3.1 docs for full prefix rules.

### 🔴 Expert Example

```python
from flask import Flask


class Base:
    JSON_SORT_KEYS = False


class Dev(Base):
    DEBUG = True


class Prod(Base):
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"


def create_app(env: str) -> Flask:
    app = Flask(__name__)
    cfg = Prod if env == "prod" else Dev
    app.config.from_object(cfg)
    return app
```

### 🌍 Real-Time Example

**Social** app: feature flags from env.

```python
import os
from flask import Flask, jsonify

app = Flask(__name__)
app.config["REACTIONS_ENABLED"] = os.environ.get("FEATURE_REACTIONS") == "1"


@app.get("/features")
def features():
    return jsonify(reactions=app.config["REACTIONS_ENABLED"])
```

---

## 4. Project Organization

### 4.1 Single-file apps

Fine for learning and tiny tools. Keep under ~300 lines or split.

### 4.2 Multi-file apps

Split `routes.py`, `models.py`, `extensions.py`; import into factory.

### 4.3 Package structure

```
myapp/
  __init__.py   # create_app()
  routes.py
  templates/
  static/
wsgi.py         # app = create_app()
```

### 4.4 Configuration files

`config.py` with classes per environment; optionally `instance/config.py` for local overrides (gitignored).

### 4.5 Layout best practices

- **`instance/`** for secrets and local config.
- **`tests/`** mirroring package names.
- **Blueprints** per feature area.

#### Concept: Package layout with factory

### 🟢 Beginner Example

`app.py` only:

```python
from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "ok"
```

### 🟡 Intermediate Example

`myapp/__init__.py`:

```python
from flask import Flask


def create_app():
    app = Flask(__name__)
    from . import routes

    routes.init_app(app)
    return app
```

`myapp/routes.py`:

```python
def init_app(app):
    @app.get("/")
    def home():
        return "ok"
```

### 🔴 Expert Example

`wsgi.py`:

```python
import os
from myapp import create_app

app = create_app(os.environ.get("FLASK_ENV", "development"))
```

### 🌍 Real-Time Example

**SaaS** modular monolith:

```
billing/
  __init__.py
  views.py
auth/
  __init__.py
  views.py
shared/
  extensions.py
```

Register blueprints in `create_app`.

---

## 5. Best Practices

1. Prefer **`create_app()`** over global module side effects.
2. Keep **secrets out of git**; use `instance/` or env vars.
3. Use **`app.config.from_object`** for clear environment classes.
4. Set **`TESTING=True`** in pytest fixtures.
5. Avoid storing large objects on **`g`** unnecessarily.
6. Document **`FLASK_APP`** for `flask run`.
7. Use **type hints** on factory and config helpers in larger teams.
8. Add **`@app.teardown_request`** or context managers for external resources.
9. Separate **domain logic** from view functions (service layer).
10. Plan **blueprint** boundaries early for medium apps.

---

## 6. Common Mistakes to Avoid

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using `current_app` outside context | Runtime error | `with app.app_context():` |
| Mutable default on `g` | Leaks across requests | Initialize in `before_request` |
| Hard-coded prod secrets | Security incident | Env + secret manager |
| Circular imports with factory | Import errors | Late imports inside factory |
| Giant single file | Unmaintainable | Package + blueprints |
| `debug=True` in WSGI prod | RCE risk | Config per environment |

---

## 7. Comparison Tables

### Single-file vs package

| Aspect | Single-file | Package |
|--------|-------------|---------|
| Onboarding | Fastest | Slightly slower |
| Testing | Awkward | Clean with factory |
| Growth | Painful | Scales |
| Imports | Simple | Needs discipline |

### Application vs request context

| Context | Provides | Typical use |
|---------|----------|-------------|
| **App** | `current_app`, extensions | CLI, background tasks tied to app |
| **Request** | `request`, `g`, `session` | Per-HTTP lifecycle |

---

### Supplementary — **`test_client` basics**

### 🟢 Beginner Example

```python
from flask import Flask

app = Flask(__name__)


@app.get("/")
def home():
    return "hi"

client = app.test_client()
assert client.get("/").data == b"hi"
```

### 🟡 Intermediate Example

```python
with app.test_client() as c:
    rv = c.get("/", headers={"X-Debug": "1"})
    assert rv.status_code == 200
```

### 🔴 Expert Example

```python
with app.test_request_context("/checkout", method="POST", json={"sku": "A1"}):
    from flask import request

    assert request.is_json
```

### 🌍 Real-Time Example

**E-commerce** integration test: POST checkout returns 402 when payment fails (illustrative).

```python
rv = client.post("/checkout", json={"payment_token": "bad"})
assert rv.status_code == 402
```

---

### Supplementary — **Browser testing checklist**

1. Status code 200 for happy path.
2. Correct `Content-Type` (`text/html` vs `application/json`).
3. Cookies set with `HttpOnly`/`Secure` in prod.
4. Redirect chains (`302` → `200`).

### 🟢 Beginner Example

Visit `/` → see HTML.

### 🟡 Intermediate Example

Use `curl -i http://127.0.0.1:5000/api/ping`.

### 🔴 Expert Example

Use **Playwright** against local Flask for E2E.

### 🌍 Real-Time Example

**Social** feed: verify `ETag` or `Cache-Control` headers for CDN behavior.

---

### Supplementary — **`app.route` methods**

### 🟢 Beginner Example

```python
@app.route("/item", methods=["GET", "POST"])
def item():
    return "ok"
```

### 🟡 Intermediate Example

```python
@app.get("/search")
def search():
    return "ok"


@app.post("/search")
def search_post():
    return "ok", 201
```

### 🔴 Expert Example

```python
from flask.views import MethodView


class ItemAPI(MethodView):
    def get(self, item_id):
        return {"id": item_id}

    def delete(self, item_id):
        return "", 204


app.add_url_rule("/items/<int:item_id>", view_func=ItemAPI.as_view("item_api"))
```

### 🌍 Real-Time Example

**SaaS** REST resource with MethodView for CRUD on `/v1/tenants/<id>`.

---

### Supplementary — **Configuration from file**

### 🟢 Beginner Example

```python
app.config.from_pyfile("settings.cfg")
```

### 🟡 Intermediate Example

```python
app.config.from_json("config.json")
```

### 🔴 Expert Example

```python
app.config.from_mapping(
    SECRET_KEY=os.environ["SECRET_KEY"],
    DATABASE_URL=os.environ["DATABASE_URL"],
)
```

### 🌍 Real-Time Example

**Multi-region** SaaS: `config/eu.py` vs `config/us.py` selected by `REGION` env.

---

### Supplementary — **`instance` folder pattern**

### 🟢 Beginner Example

```python
app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile("config.py", silent=True)
```

### 🟡 Intermediate Example

Place `instance/config.py` (gitignored) with local DB URL.

### 🔴 Expert Example

Load instance config after object config to override selectively.

### 🌍 Real-Time Example

**E-commerce** staging: ops drops `instance/oauth_secrets.py` on VM at deploy.

---

### Supplementary — **Blueprints preview (organization)**

### 🟢 Beginner Example

```python
from flask import Blueprint

bp = Blueprint("shop", __name__, url_prefix="/shop")


@bp.route("/")
def index():
    return "shop"
```

### 🟡 Intermediate Example

```python
app.register_blueprint(bp)
```

### 🔴 Expert Example

Blueprint with template folder:

```python
bp = Blueprint("admin", __name__, template_folder="templates")
```

### 🌍 Real-Time Example

**Marketplace**: `seller_bp`, `buyer_bp`, `admin_bp` in separate modules.

---

### Supplementary — **Globals and testing**

### 🟢 Beginner Example

```python
assert app.name == "flask_app"
```

### 🟡 Intermediate Example

```python
with app.app_context():
    assert current_app.name == app.name  # after import
```

### 🔴 Expert Example

```python
from flask import has_app_context

def util():
    return has_app_context()
```

### 🌍 Real-Time Example

**SaaS** telemetry: tag logs with `tenant_id` from `g` only if request context exists.

---

### Supplementary — **Secret key rotation**

### 🟢 Beginner Example

```python
app.secret_key = "new-key"
```

### 🟡 Intermediate Example

Dual-key validation during rotation window (pseudo):

```python
VALID_KEYS = [os.environ["SECRET_KEY"], os.environ.get("SECRET_KEY_PREV", "")]
```

### 🔴 Expert Example

Use server-side sessions (Redis) to reduce cookie secret coupling.

### 🌍 Real-Time Example

**Social** platform: rotate keys monthly via secrets manager + gradual session invalidation.

---

### Supplementary — **Debug vs testing config**

### 🟢 Beginner Example

```python
app.config["DEBUG"] = True
```

### 🟡 Intermediate Example

```python
app.config["TESTING"] = True
```

### 🔴 Expert Example

```python
app.config["PROPAGATE_EXCEPTIONS"] = True  # testing edge cases
```

### 🌍 Real-Time Example

**E-commerce** load test: `TESTING` off, `DEBUG` off, separate metrics endpoint.

---

### Supplementary — **Importing Flask submodules**

### 🟢 Beginner Example

```python
from flask import Flask, redirect, url_for
```

### 🟡 Intermediate Example

```python
from flask import abort, make_response
```

### 🔴 Expert Example

```python
from flask import stream_with_context, Response
```

### 🌍 Real-Time Example

**SaaS** export: stream CSV with `stream_with_context`.

---

### Supplementary — **WSGI entrypoint**

### 🟢 Beginner Example

```python
# wsgi.py
from app import app
```

### 🟡 Intermediate Example

```python
from myapp import create_app

app = create_app()
```

### 🔴 Expert Example

```python
application = create_app()  # some hosts expect "application"
```

### 🌍 Real-Time Example

**Kubernetes** + Gunicorn: `gunicorn wsgi:app`.

---

### Supplementary — **Multi-file without package (not ideal)**

### 🟢 Beginner Example

`views.py` defines functions; `app.py` imports and registers.

### 🟡 Intermediate Example

Use `import views` then `views.register(app)`.

### 🔴 Expert Example

Migrate to package once import cycles appear.

### 🌍 Real-Time Example

**Legacy social** codebase: gradual move to `src/` layout.

---

### Extended examples — **Application context in CLI**

### 🟢 Beginner Example

```bash
flask shell
```

### 🟡 Intermediate Example

```python
@app.cli.command("list-routes")
def list_routes():
    for rule in current_app.url_map.iter_rules():
        print(rule)
```

### 🔴 Expert Example

```python
with app.app_context():
    # run one-off DB migration script logic
    pass
```

### 🌍 Real-Time Example

**SaaS** nightly job: Celery task pushes app context before DB queries.

---

### Extended examples — **Request context in tests**

### 🟢 Beginner Example

```python
client.get("/")
```

### 🟡 Intermediate Example

```python
with app.test_request_context("/?q=flask"):
    from flask import request

    assert request.args["q"] == "flask"
```

### 🔴 Expert Example

Simulate JSON:

```python
with app.test_request_context("/api", method="POST", json={"a": 1}):
    from flask import request

    assert request.get_json() == {"a": 1}
```

### 🌍 Real-Time Example

**E-commerce** tax calculation unit test without HTTP server.

---

### Deep dive — **Config inheritance**

### 🟢 Beginner Example

```python
class Dev(Config):
    DEBUG = True
```

### 🟡 Intermediate Example

```python
class Staging(Prod):
    LOG_LEVEL = "DEBUG"
```

### 🔴 Expert Example

```python
def from_object_chain(app, *objects):
    for obj in objects:
        app.config.from_object(obj)
```

### 🌍 Real-Time Example

**Enterprise SaaS**: base + customer-specific overrides loaded from DB at boot (cache carefully).

---

### Deep dive — **`g` vs session**

| Store | Lifetime | Visibility |
|-------|----------|------------|
| **`g`** | Single request | Server memory |
| **`session`** | Multiple requests | Signed cookie (default) |

### 🟢 Beginner Example

```python
session["user"] = "ada"
```

### 🟡 Intermediate Example

```python
g.db_user = lookup(session["user"])
```

### 🔴 Expert Example

```python
# Avoid storing ORM entities on g across threads — use ids
g.user_id = session.get("user_id")
```

### 🌍 Real-Time Example

**Social**: `session` holds opaque token id; `g` holds resolved profile for the request.

---

### Final four-level — **Project README essentials**

### 🟢 Beginner Example

Document: Python version, `pip install -r`, `flask run`.

### 🟡 Intermediate Example

Add `FLASK_APP`, `pytest`, pre-commit.

### 🔴 Expert Example

Add architecture diagram, ADRs, deployment runbook.

### 🌍 Real-Time Example

**SaaS** onboarding: README links to OpenAPI, Postman, and incident runbooks.

---

*End of First Flask Application — Flask 3.1.3 learning notes.*
