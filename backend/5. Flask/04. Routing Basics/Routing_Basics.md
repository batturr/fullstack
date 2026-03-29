# Routing Basics

**Routing** maps URLs and HTTP methods to Python functions (view callables). In Flask 3.1.3, `@app.route` is the everyday API; under the hood **Werkzeug**’s routing matches paths, applies **converters**, and names **endpoints** for `url_for`. This chapter covers simple and **dynamic** routes, **HTTP methods**, **URL building** and redirects, **route management** at scale, **advanced** patterns (hosts, subdomains, query strings), and **documentation** strategies including OpenAPI/Swagger. Examples span **e-commerce** catalogs, **social** feeds, and **SaaS** multi-tenant APIs.

---

## 📑 Table of Contents

1. [Simple Routes](#1-simple-routes)
   - 1.1 `@app.route` decorator
   - 1.2 Route registration
   - 1.3 URL patterns
   - 1.4 Root route
   - 1.5 Multiple routes
2. [Dynamic Routes](#2-dynamic-routes)
   - 2.1 Path parameters
   - 2.2 Variable rules
   - 2.3 Type converters (`int`, `float`, `path`, `uuid`)
   - 2.4 Custom converters
   - 2.5 Optional path segments
3. [HTTP Methods](#3-http-methods)
   - 3.1 GET
   - 3.2 POST
   - 3.3 PUT
   - 3.4 DELETE
   - 3.5 PATCH
   - 3.6 HEAD and OPTIONS
4. [URL Building](#4-url-building)
   - 4.1 `url_for()`
   - 4.2 Building URLs dynamically
   - 4.3 Anchor tags
   - 4.4 Redirects
   - 4.5 External URLs
5. [Route Management](#5-route-management)
   - 5.1 `methods` parameter
   - 5.2 Endpoint names
   - 5.3 `add_url_rule`
   - 5.4 Route debugging
   - 5.5 Route organization
6. [Advanced Routing](#6-advanced-routing)
   - 6.1 URL converters
   - 6.2 Regex in routes
   - 6.3 Host matching
   - 6.4 Subdomain routing
   - 6.5 Query parameters
7. [Route Documentation](#7-route-documentation)
   - 7.1 Docstring documentation
   - 7.2 Method documentation
   - 7.3 Route listing
   - 7.4 API documentation integration
   - 7.5 Swagger
8. [Best Practices](#8-best-practices)
9. [Common Mistakes to Avoid](#9-common-mistakes-to-avoid)
10. [Comparison Tables](#10-comparison-tables)

---

## 1. Simple Routes

### 1.1 `@app.route` decorator

```python
@app.route("/about")
def about():
    return "About"
```

### 1.2 Route registration

Decorators call `app.add_url_rule` with inferred endpoint (function name by default).

### 1.3 URL patterns

Static segments: `/help`, `/legal/privacy`.

### 1.4 Root route

```python
@app.route("/")
def index():
    return "Home"
```

### 1.5 Multiple routes

```python
@app.route("/")
@app.route("/index")
def home():
    return "Home"
```

#### Concept: Static pages

### 🟢 Beginner Example

```python
from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "Welcome"


@app.route("/contact")
def contact():
    return "Contact us"
```

### 🟡 Intermediate Example

```python
from flask import Blueprint

bp = Blueprint("site", __name__)


@bp.route("/pricing")
def pricing():
    return "Plans"
```

### 🔴 Expert Example

```python
from flask import Flask

app = Flask(__name__)
app.add_url_rule("/", endpoint="index", view_func=lambda: "ok")
```

### 🌍 Real-Time Example

**SaaS** marketing site: `/`, `/pricing`, `/security` as static routes behind CDN.

```python
@app.route("/security")
def security():
    return render_template("security.html")  # Jinja in later chapter
```

---

## 2. Dynamic Routes

### 2.1 Path parameters

```python
@app.route("/users/<username>")
def profile(username):
    return f"User {username}"
```

### 2.2 Variable rules

Syntax: `<converter:name>` with optional defaults via other techniques (see optional segments).

### 2.3 Type converters

Built-ins include **`string`** (default), **`int`**, **`float`**, **`path`**, **`uuid`**.

```python
@app.route("/items/<int:item_id>")
def item(item_id):
    return str(item_id)
```

### 2.4 Custom converters

Subclass `BaseConverter` and register on `app.url_map.converters`.

### 2.5 Optional path segments

Flask/Werkzeug do not have first-class optional segments; use **two rules**, **query args**, or **defaults**.

#### Concept: Product pages by slug

### 🟢 Beginner Example

```python
@app.route("/product/<slug>")
def product(slug):
    return {"slug": slug}
```

### 🟡 Intermediate Example

```python
import uuid
from flask import Flask

app = Flask(__name__)


@app.route("/orders/<uuid:order_id>")
def order(order_id: uuid.UUID):
    return {"order_id": str(order_id)}
```

### 🔴 Expert Example

```python
from werkzeug.routing import BaseConverter, ValidationError


class SKUConverter(BaseConverter):
    regex = r"[A-Z0-9-]{3,32}"

    def to_python(self, value: str) -> str:
        if "--" in value:
            raise ValidationError()
        return value

    def to_url(self, value: str) -> str:
        return value.upper()


app = Flask(__name__)
app.url_map.converters["sku"] = SKUConverter


@app.route("/inventory/<sku:code>")
def sku(code: str):
    return {"sku": code}
```

### 🌍 Real-Time Example

**E-commerce** SEO: `/p/<slug>` plus canonical checks.

```python
@app.route("/p/<slug>")
def product_page(slug: str):
    return {"canonical_slug": slug, "price_cents": 1999}
```

---

## 3. HTTP Methods

### 3.1 GET

Default when `methods` omitted.

### 3.2 POST

Forms, commands, non-idempotent actions.

### 3.3 PUT

Replace resource representations.

### 3.4 DELETE

Remove resources.

### 3.5 PATCH

Partial updates (define semantics in your API).

### 3.6 HEAD and OPTIONS

Automatically handled for many routes; customize if needed.

#### Concept: REST-style item resource

### 🟢 Beginner Example

```python
@app.route("/echo", methods=["POST"])
def echo():
    return "posted"
```

### 🟡 Intermediate Example

```python
from flask import Flask, request, jsonify

app = Flask(__name__)
ITEMS = {1: {"title": "Mug"}}


@app.route("/items/<int:item_id>", methods=["GET", "PUT", "DELETE"])
def item(item_id):
    if request.method == "GET":
        return jsonify(ITEMS.get(item_id, {})), 200 if item_id in ITEMS else 404
    if request.method == "PUT":
        ITEMS[item_id] = request.get_json(force=True)
        return jsonify(ITEMS[item_id])
    ITEMS.pop(item_id, None)
    return "", 204
```

### 🔴 Expert Example

```python
from flask.views import MethodView


class ItemView(MethodView):
    def get(self, item_id):
        return {"id": item_id}

    def patch(self, item_id):
        return {"id": item_id, "patched": True}, 200


app.add_url_rule("/v2/items/<int:item_id>", view_func=ItemView.as_view("item_v2"))
```

### 🌍 Real-Time Example

**Social** “follow” action: `POST` to create, `DELETE` to unfollow.

```python
@app.route("/users/<int:user_id>/follow", methods=["POST", "DELETE"])
def follow(user_id: int):
    return {"user_id": user_id, "action": "ok"}
```

---

## 4. URL Building

### 4.1 `url_for()`

```python
from flask import url_for

with app.test_request_context():
    url_for("profile", username="ada")
```

### 4.2 Building URLs dynamically

Pass path parameters as kwargs; unknown keys can become query string depending on usage—prefer explicit `url_for` args matching the rule.

### 4.3 Anchor tags

```python
url_for("docs", _anchor="install")
```

### 4.4 Redirects

```python
from flask import redirect, url_for

return redirect(url_for("index"))
```

### 4.5 External URLs

```python
url_for("profile", username="ada", _external=True)
```

#### Concept: Safe navigation after login

### 🟢 Beginner Example

```python
from flask import Flask, redirect, url_for

app = Flask(__name__)


@app.route("/")
def home():
    return redirect(url_for("hello"))


@app.route("/hello")
def hello():
    return "hi"
```

### 🟡 Intermediate Example

```python
from flask import Blueprint, url_for

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/login")
def login():
    return "login"


# url_for('auth.login')
```

### 🔴 Expert Example

```python
from urllib.parse import urlparse, urljoin
from flask import abort, redirect, request, url_for


def safe_redirect(target: str, default: str = "/"):
    host_url = request.host_url.rstrip("/")
    test_url = urljoin(host_url, target)
    if urlparse(test_url).netloc != urlparse(host_url).netloc:
        return redirect(default)
    return redirect(test_url)
```

### 🌍 Real-Time Example

**SaaS** email links: `_external=True` + correct `SERVER_NAME`/proxy trust.

```python
invite_link = url_for("accept_invite", token=tok, _external=True)
```

---

## 5. Route Management

### 5.1 `methods` parameter

```python
@app.route("/submit", methods=["GET", "POST"])
def submit():
    ...
```

### 5.2 Endpoint names

```python
@app.route("/x", endpoint="alpha")
def bravo():
    return "ok"
# url_for('alpha')
```

### 5.3 `add_url_rule`

```python
def show_post(post_id):
    return str(post_id)

app.add_url_rule("/post/<int:post_id>", endpoint="show_post", view_func=show_post)
```

### 5.4 Route debugging

```bash
flask routes
```

Or iterate `app.url_map.iter_rules()`.

### 5.5 Route organization

Use **blueprints** and consistent `url_prefix` per feature.

#### Concept: Central registration table

### 🟢 Beginner Example

```python
for path, name in [("/a", "a"), ("/b", "b")]:
    app.add_url_rule(path, endpoint=name, view_func=lambda: name)
```

Note: careful with lambdas in loops—use factories.

### 🟡 Intermediate Example

```python
def make_handler(msg: str):
    def handler():
        return msg

    return handler


app.add_url_rule("/ok", view_func=make_handler("ok"))
```

### 🔴 Expert Example

```python
def register_versioned_api(app, version: str):
    prefix = f"/{version}"

    def ping():
        return {"v": version}

    app.add_url_rule(f"{prefix}/ping", endpoint=f"api_{version}_ping", view_func=ping)


register_versioned_api(app, "v1")
register_versioned_api(app, "v2")
```

### 🌍 Real-Time Example

**E-commerce** admin vs storefront separation:

```python
from flask import Blueprint

admin = Blueprint("admin", __name__, url_prefix="/admin")
store = Blueprint("store", __name__, url_prefix="/shop")
```

---

## 6. Advanced Routing

### 6.1 URL converters

See custom `SKUConverter` example; built-ins cover most cases.

### 6.2 Regex in routes

Use **`string`** with custom converter or Werkzeug `Rule` with regex (advanced); often clearer to validate in view.

### 6.3 Host matching

Pass `host=` to `@app.route` or rules (subdomain/host routing).

### 6.4 Subdomain routing

```python
app = Flask(__name__, subdomain_matching=True)
app.config["SERVER_NAME"] = "example.test:5000"
```

### 6.5 Query parameters

Not part of the rule; read via `request.args`.

#### Concept: Multi-tenant by subdomain

### 🟢 Beginner Example

```python
from flask import Flask, request

app = Flask(__name__)


@app.route("/search")
def search():
    q = request.args.get("q", "")
    return {"q": q}
```

### 🟡 Intermediate Example

```python
@app.route("/feed")
def feed():
    page = request.args.get("page", default="1", type=int)
    return {"page": page}
```

### 🔴 Expert Example

```python
app = Flask(__name__, subdomain_matching=True)
app.config["SERVER_NAME"] = "app.local:5000"


@app.route("/", subdomain="<tenant>")
def tenant_home(tenant: str):
    return {"tenant": tenant}
```

### 🌍 Real-Time Example

**SaaS** `acme.app.com` resolves tenant; add caching and security checks.

```python
@app.before_request
def resolve_tenant():
    pass  # set g.tenant from subdomain + DB
```

---

## 7. Route Documentation

### 7.1 Docstring documentation

```python
@app.get("/health")
def health():
    """Liveness probe for orchestrators."""
    return {"ok": True}
```

### 7.2 Method documentation

Document idempotency, status codes, and error shapes in docstrings or external specs.

### 7.3 Route listing

```python
from flask import current_app

@app.get("/internal/routes")
def list_routes():
    return [
        {"rule": str(r), "methods": sorted(r.methods - {"HEAD", "OPTIONS"})}
        for r in current_app.url_map.iter_rules()
    ]
```

Guard in production.

### 7.4 API documentation integration

Tools: **apispec**, **flask-smorest**, **flask-openapi3**, or generate OpenAPI separately.

### 7.5 Swagger

Serve **Swagger UI** static assets pointing at `openapi.json`.

#### Concept: Minimal OpenAPI-shaped JSON (manual)

### 🟢 Beginner Example

```python
@app.get("/api.json")
def api_stub():
    return {
        "openapi": "3.1.0",
        "info": {"title": "Demo", "version": "1.0.0"},
        "paths": {"/health": {"get": {"summary": "health"}}},
    }
```

### 🟡 Intermediate Example

Use **marshmallow** schemas + **apispec** to generate paths (pseudo-structure).

### 🔴 Expert Example

**flask-smorest** blueprint with `@blp.response` decorators—generates OpenAPI from code.

### 🌍 Real-Time Example

**Social** public API: publish docs at `https://api.example.com/docs` with OAuth2 security schemes.

---

## 8. Best Practices

1. Name endpoints explicitly when function names might change.
2. Prefer **`url_for`** over hard-coded paths.
3. Validate **redirect** targets to prevent open redirects.
4. Use **`int`/`uuid` converters** instead of manual parsing when possible.
5. Keep **version prefixes** (`/v1`) stable for public APIs.
6. Split **blueprints** by bounded context (billing, auth, catalog).
7. Document **error formats** consistently (`problem+json`, etc.).
8. Avoid **overloading** one URL with too many methods without `MethodView` clarity.
9. Test routes with **`test_client`** including trailing slash behavior.
10. Configure **trusted proxies** correctly when using `_external` URLs behind TLS termination.

---

## 9. Common Mistakes to Avoid

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Hard-coded URLs | Broken links after refactors | `url_for` |
| Open redirects | Phishing risk | Allowlist hosts/paths |
| Wrong HTTP method | 405 errors | Specify `methods` / use `@app.get` |
| Duplicate endpoints | AssertionError / ambiguous `url_for` | Unique endpoint names |
| Subdomain routes without `SERVER_NAME` | Surprising matches | Set config in dev |
| Regex soup in routes | Unreadable rules | Validate in view/services |
| Leaking `/internal/routes` | Information disclosure | Auth + env gating |

---

## 10. Comparison Tables

### `@app.route` vs `add_url_rule`

| API | Pros | Cons |
|-----|------|------|
| **`@app.route`** | Readable, idiomatic | Less dynamic |
| **`add_url_rule`** | Programmatic registration | Verbose |

### Converters cheat sheet

| Converter | Matches |
|-----------|---------|
| `string` | Any text except `/` (default) |
| `int` | Positive integers |
| `float` | Positive floats |
| `path` | Text including `/` |
| `uuid` | UUID strings |

---

### Supplementary — **OPTIONS/HEAD behavior**

### 🟢 Beginner Example

```python
@app.route("/x", methods=["GET"])
def x():
    return "ok"
# Flask/Werkzeug provides automatic HEAD/OPTIONS as appropriate
```

### 🟡 Intermediate Example

```python
@app.route("/x", methods=["OPTIONS"])
def x_options():
    return "", 204
```

### 🔴 Expert Example

Custom CORS preflight integration (often via **Flask-CORS** extension).

### 🌍 Real-Time Example

**SaaS** API gateway handles OPTIONS; Flask app still documents allowed methods.

---

### Supplementary — **Trailing slashes**

### 🟢 Beginner Example

```python
@app.route("/users/")
def users():
    return "ok"
```

### 🟡 Intermediate Example

```python
@app.route("/users", strict_slashes=False)
def users2():
    return "ok"
```

### 🔴 Expert Example

Enforce canonical URLs with redirects middleware.

### 🌍 Real-Time Example

**E-commerce** SEO: choose slash policy sitewide.

---

### Supplementary — **URL defaults**

### 🟢 Beginner Example

```python
@app.route("/lang/<any(en,es):lang>")
def localized(lang):
    return lang
```

### 🟡 Intermediate Example

Use `defaults={"page": 1}` in `add_url_rule` for paginated views.

### 🔴 Expert Example

```python
app.add_url_rule(
    "/items",
    defaults={"page": 1},
    endpoint="items",
    view_func=lambda page: str(page),
)
app.add_url_rule("/items/<int:page>", endpoint="items", view_func=lambda page: str(page))
```

### 🌍 Real-Time Example

**Social** timeline: `/feed` and `/feed/<int:page>` share handler.

---

### Supplementary — **Endpoint collisions across blueprints**

### 🟢 Beginner Example

Blueprints prefix endpoints: `auth.login`.

### 🟡 Intermediate Example

```python
bp = Blueprint("auth", __name__, url_prefix="/auth")
```

### 🔴 Expert Example

```python
app.register_blueprint(bp, name="auth_v2")  # unique blueprint name
```

### 🌍 Real-Time Example

**SaaS** migration: parallel `/v1` and `/v2` blueprints with distinct names.

---

### Supplementary — **Building URLs in templates**

### 🟢 Beginner Example

```jinja2
<a href="{{ url_for('index') }}">Home</a>
```

### 🟡 Intermediate Example

```jinja2
<a href="{{ url_for('product', slug=item.slug) }}">{{ item.title }}</a>
```

### 🔴 Expert Example

Pass `_external=True` only when needed (emails, OG tags).

### 🌍 Real-Time Example

**E-commerce** transactional email uses `_external=True` with configured server name.

---

### Supplementary — **HTTP method semantics**

| Method | Typical semantics | Safe | Idempotent |
|--------|-------------------|------|------------|
| GET | Read | Yes | Yes |
| POST | Create / act | No | No |
| PUT | Replace | No | Yes |
| PATCH | Partial update | No | Sometimes |
| DELETE | Remove | No | Yes |

### 🟢 Beginner Example

Use GET for reads only.

### 🟡 Intermediate Example

Use POST for checkout creation.

### 🔴 Expert Example

Use PATCH with JSON Merge Patch semantics documented.

### 🌍 Real-Time Example

**SaaS** billing: POST invoice, PATCH line items with audit log.

---

### Supplementary — **Route testing patterns**

### 🟢 Beginner Example

```python
assert client.get("/").status_code == 200
```

### 🟡 Intermediate Example

```python
assert client.post("/echo", data={"a": "1"}).status_code == 200
```

### 🔴 Expert Example

```python
assert client.open("/items/1", method="DELETE").status_code == 204
```

### 🌍 Real-Time Example

**E-commerce** load test script hits hot paths: `/p/<slug>`, `/cart`, `/checkout`.

---

### Supplementary — **Regex converter sketch**

### 🟢 Beginner Example

Prefer validating `slug` in Python:

```python
import re

SLUG = re.compile(r"^[a-z0-9-]+$")


@app.route("/blog/<slug>")
def post(slug):
    if not SLUG.match(slug):
        abort(404)
    return {"slug": slug}
```

### 🟡 Intermediate Example

Custom converter encapsulates regex.

### 🔴 Expert Example

```python
from werkzeug.routing import BaseConverter


class RegexConverter(BaseConverter):
    def __init__(self, map, *items):
        super().__init__(map)
        self.regex = items[0]


app.url_map.converters["re"] = RegexConverter
```

### 🌍 Real-Time Example

**Social** `@handle` route with strict charset.

---

### Supplementary — **Host-only routes**

### 🟢 Beginner Example

Single host in dev: ignore host matching.

### 🟡 Intermediate Example

```python
@app.route("/", host="api.local")
def api_root():
    return "api"
```

### 🔴 Expert Example

Combine with `SERVER_NAME` and split apps per host in integration tests.

### 🌍 Real-Time Example

**SaaS** `api.` vs `app.` hostnames behind same codebase.

---

### Supplementary — **Query parameter validation**

### 🟢 Beginner Example

```python
limit = request.args.get("limit", default="20", type=int)
```

### 🟡 Intermediate Example

Clamp values:

```python
limit = max(1, min(request.args.get("limit", default=20, type=int) or 20, 100))
```

### 🔴 Expert Example

Use **marshmallow** or **Pydantic** for query schema validation.

### 🌍 Real-Time Example

**E-commerce** search: facet params validated before SQL.

---

### Supplementary — **Swagger UI static mount**

### 🟢 Beginner Example

Serve OpenAPI JSON only; use external Swagger UI.

### 🟡 Intermediate Example

```python
from flask import send_from_directory

@app.route("/docs")
def docs():
    return send_from_directory("static", "swagger.html")
```

### 🔴 Expert Example

Use CDN-hosted Swagger UI with `url=/openapi.json`.

### 🌍 Real-Time Example

**SaaS** docs site separate from API cluster.

---

### Supplementary — **Route organization anti-patterns**

### 🟢 Beginner Example

500-line `app.py` with every route.

### 🟡 Intermediate Example

Split by file without blueprints—still workable.

### 🔴 Expert Example

Circular imports—fix with factory + late imports.

### 🌍 Real-Time Example

**Enterprise** modules owned by teams—blueprint per team.

---

### Extended four-level — **Catalog browse + filter**

### 🟢 Beginner Example

```python
@app.route("/products")
def products():
    return {"items": []}
```

### 🟡 Intermediate Example

```python
@app.route("/products")
def products():
    category = request.args.get("category")
    return {"category": category, "items": []}
```

### 🔴 Expert Example

```python
@app.route("/products/<slug>")
def product_detail(slug: str):
    return {"slug": slug}


@app.route("/products")
def product_list():
    return {"q": request.args.get("q")}
```

### 🌍 Real-Time Example

**E-commerce** faceted navigation: many query keys mapped to search service.

---

### Extended four-level — **Soft delete vs hard delete**

### 🟢 Beginner Example

```python
@app.delete("/items/<int:item_id>")
def delete_item(item_id):
    return "", 204
```

### 🟡 Intermediate Example

```python
@app.post("/items/<int:item_id>/archive")
def archive(item_id):
    return {"archived": True}
```

### 🔴 Expert Example

Idempotency-Key header handling for DELETE in payment APIs.

### 🌍 Real-Time Example

**SaaS** GDPR: DELETE triggers async purge pipeline.

---

### Deep dive — **`url_for` with Blueprint**

### 🟢 Beginner Example

```python
url_for("auth.login")
```

### 🟡 Intermediate Example

```python
url_for("billing.invoice", invoice_id=12)
```

### 🔴 Expert Example

```python
url_for(".details", id=3)  # relative endpoints in templates/helpers
```

### 🌍 Real-Time Example

**Multi-module** SaaS: namespaced endpoints in emails.

---

### Deep dive — **405 Method Not Allowed**

### 🟢 Beginner Example

```python
rv = client.delete("/read-only")
assert rv.status_code == 405
```

### 🟡 Intermediate Example

Return `Allow` header awareness in API clients.

### 🔴 Expert Example

Custom error handler renders problem+json for 405.

### 🌍 Real-Time Example

**Public API** clients rely on consistent error schema.

---

*End of Routing Basics — Flask 3.1.3 learning notes.*
