# Flask 3.1.3 — Advanced Topics and Best Practices

This capstone guide deepens **routing**, the **request/response lifecycle**, **Jinja2 power features**, **hooks and error handling**, **real-time WebSockets**, **GraphQL**, **API design**, and **code quality** practices. Examples reference **e-commerce**, **social**, and **SaaS** contexts on **Flask 3.1.3** with **Python 3.9+**.

---

## 📑 Table of Contents

1. [28.1 Advanced Routing](#281-advanced-routing)
2. [28.2 Request/Response Cycle](#282-requestresponse-cycle)
3. [28.3 Template Advanced](#283-template-advanced)
4. [28.4 Middleware and Hooks](#284-middleware-and-hooks)
5. [28.5 WebSockets](#285-websockets)
6. [28.6 GraphQL Integration](#286-graphql-integration)
7. [28.7 API Design Best Practices](#287-api-design-best-practices)
8. [28.8 Code Quality](#288-code-quality)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)
12. [Appendix — Cheat Sheets](#appendix--cheat-sheets)

---

## 28.1 Advanced Routing

### Dynamic Routes

**🟢 Beginner Example**

```python
from flask import Flask

app = Flask(__name__)

@app.get("/users/<username>")
def profile(username: str):
    return {"user": username}
```

**🟡 Intermediate Example — multiple variables**

```python
@app.get("/repos/<owner>/<repo>/issues/<int:number>")
def issue(owner: str, repo: str, number: int):
    return {"owner": owner, "repo": repo, "number": number}
```

**🔴 Expert Example — optional trailing slash policy consistency**

```python
app.url_map.strict_slashes = False  # understand SEO/cache implications
```

**🌍 Real-Time Example — e-commerce**

`/products/<slug>` for SEO-friendly catalog URLs.

### Route Converters

**🟢 Beginner Example — `int`**

```python
@app.get("/orders/<int:order_id>")
def order(order_id: int):
    return {"order_id": order_id}
```

**🟡 Intermediate Example — `path`**

```python
@app.get("/files/<path:filepath>")
def file(filepath: str):
    return {"filepath": filepath}
```

**🔴 Expert Example — `uuid`**

```python
@app.get("/invoices/<uuid:invoice_id>")
def invoice(invoice_id):
    return {"invoice_id": str(invoice_id)}
```

**🌍 Real-Time Example — SaaS**

UUID primary keys in URLs reduce enumeration.

### Custom Converters

**🟢 Beginner Example — `BaseConverter` subclass**

```python
import re
from werkzeug.routing import BaseConverter, ValidationError

class SKUConverter(BaseConverter):
    regex = r"[A-Z0-9_-]{3,32}"

    def to_python(self, value: str) -> str:
        if not re.fullmatch(self.regex, value):
            raise ValidationError()
        return value

    def to_url(self, value: str) -> str:
        return value

app = Flask(__name__)
app.url_map.converters["sku"] = SKUConverter

@app.get("/items/<sku:code>")
def item(code: str):
    return {"sku": code}
```

**🟡 Intermediate Example — locale converter**

**🔴 Expert Example — converter with DB lookup cache (careful with cold starts)**

**🌍 Real-Time Example — social**

`@handle` converter validates allowed characters.

### Route Registration

**🟢 Beginner Example — decorators**

**🟡 Intermediate Example — `app.add_url_rule`**

```python
def stats():
    return {"rps": 123}

app.add_url_rule("/internal/stats", endpoint="stats", view_func=stats, methods=["GET"])
```

**🔴 Expert Example — lazy registration in blueprint `record` callbacks**

**🌍 Real-Time Example — e-commerce**

Feature-flagged routes registered at startup based on license.

### URL Building

**🟢 Beginner Example — `url_for`**

```python
from flask import url_for

with app.test_request_context():
    url_for("profile", username="alice")
```

**🟡 Intermediate Example — `_external=True` behind proxy**

```python
# Requires ProxyFix and PREFERRED_URL_SCHEME="https"
with app.test_request_context(base_url="https://example.com"):
    url_for("profile", username="alice", _external=True)
```

**🔴 Expert Example — blueprint endpoints**

```python
url_for("checkout.review", _external=True)
```

**🌍 Real-Time Example — SaaS**

Email links built with correct tenant subdomain.

---

## 28.2 Request/Response Cycle

### Request Hooks

**🟢 Beginner Example — `before_request` auth sketch**

```python
from flask import g, request, abort

@app.before_request
def load_user():
    token = request.headers.get("Authorization", "")
    g.user = parse_token(token)  # or None
```

**🟡 Intermediate Example — skip for static**

```python
@app.before_request
def skip_static():
    if request.endpoint and request.endpoint.startswith("static"):
        return
```

**🔴 Expert Example — ordered hooks via blueprint registration order**

**🌍 Real-Time Example — e-commerce**

Attach `request_id` and `cart_id` for tracing.

### before_request

**🟢 Beginner Example — timing**

```python
import time
from flask import g

@app.before_request
def t0():
    g._t0 = time.perf_counter()
```

**🟡 Intermediate Example — tenant resolution**

```python
@app.before_request
def tenant():
    host = request.host.split(":")[0]
    g.tenant = resolve_tenant(host)
    if g.tenant is None:
        abort(404)
```

**🔴 Expert Example — short-circuit OPTIONS if custom CORS**

**🌍 Real-Time Example — SaaS**

Load tenant feature flags into `g`.

### after_request

**🟢 Beginner Example — add headers**

```python
@app.after_request
def nosniff(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp
```

**🟡 Intermediate Example — log duration**

```python
@app.after_request
def log_duration(resp):
    dt = (time.perf_counter() - g._t0) * 1000
    app.logger.info("%s ms", dt)
    return resp
```

**🔴 Expert Example — mutate JSON body rarely—prefer headers**

**🌍 Real-Time Example — social**

Add `Server-Timing` hints for RUM.

### teardown_request

**🟢 Beginner Example — cleanup**

```python
@app.teardown_request
def teardown(exc):
    # close per-request resources
    pass
```

**🟡 Intermediate Example — SQLAlchemy session remove**

```python
@app.teardown_request
def teardown_session(exc):
    db.session.remove()
```

**🔴 Expert Example — context vars reset**

**🌍 Real-Time Example — e-commerce**

Release distributed locks if request failed mid-flight.

### Context Processing

**🟢 Beginner Example — `g` for request-scoped state**

**🟡 Intermediate Example — `session` for user-scoped state**

**🔴 Expert Example — `copy_current_request_context` for threads**

```python
from flask import copy_current_request_context
import threading

def async_job():
    @copy_current_request_context
    def worker():
        app.logger.info("still have request context: %s", request.path)
    threading.Thread(target=worker, daemon=True).start()
```

**🌍 Real-Time Example — SaaS**

Fire-and-forget audit log with request metadata (prefer queue in prod).

---

## 28.3 Template Advanced

### Custom Filters

**🟢 Beginner Example**

```python
@app.template_filter("money")
def money_filter(cents: int) -> str:
    return f"${cents / 100:.2f}"
```

```jinja
<p>Total: {{ order_total|money }}</p>
```

**🟡 Intermediate Example — filter with arguments**

```python
@app.template_filter("currency")
def currency(amount_cents: int, code: str = "USD") -> str:
    ...
```

**🔴 Expert Example — async-unfriendly: keep filters pure and fast**

**🌍 Real-Time Example — e-commerce**

Locale-aware formatting via Babel.

### Custom Tests

**🟢 Beginner Example**

```python
@app.template_test("even")
def is_even(n: int) -> bool:
    return n % 2 == 0
```

```jinja
{% if n is even %}...{% endif %}
```

**🟡 Intermediate Example — role test**

**🔴 Expert Example — avoid heavy logic in templates—move to view/service**

**🌍 Real-Time Example — SaaS**

`is plan 'enterprise'` test backed by simple flag.

### Template Caching

**🟢 Beginner Example — Jinja bytecode cache**

```python
app.jinja_env.bytecode_cache = jinja2.FileSystemBytecodeCache("/tmp/jinja-cache")
```

**🟡 Intermediate Example — precompile in build step**

**🔴 Expert Example — LRU cache for expensive includes**

**🌍 Real-Time Example — e-commerce**

High-traffic product template compilation amortized.

### Jinja2 Extensions

**🟢 Beginner Example — enable `do` extension**

```python
app.jinja_env.add_extension("jinja2.ext.do")
```

**🟡 Intermediate Example — `loopcontrols`**

**🔴 Expert Example — custom extension for i18n hooks**

**🌍 Real-Time Example — SaaS**

Custom tags for feature-gated blocks.

### Template Performance

**🟢 Beginner Example — `{% include %}` vs macros wisely**

**🟡 Intermediate Example — cache fragments (server-side)**

**🔴 Expert Example — move heavy aggregation out of templates**

**🌍 Real-Time Example — social**

Server renders skeleton; client hydrates for interactivity.

---

## 28.4 Middleware and Hooks

### Custom Middleware

**🟢 Beginner Example — WSGI wrapper**

```python
class PrefixMiddleware:
    def __init__(self, app, prefix: str):
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):
        if environ["PATH_INFO"].startswith(self.prefix):
            environ["PATH_INFO"] = environ["PATH_INFO"][len(self.prefix):]
            environ["SCRIPT_NAME"] = self.prefix
        return self.app(environ, start_response)

app.wsgi_app = PrefixMiddleware(app.wsgi_app, "/api")
```

**🟡 Intermediate Example — `ProxyFix`**

**🔴 Expert Example — OpenTelemetry WSGI middleware**

**🌍 Real-Time Example — e-commerce**

Mount legacy app under subpath.

### Request Hooks

**🟢 Beginner Example — already covered**

**🟡 Intermediate Example — blueprint `before_request`**

```python
bp = Blueprint("api", __name__, url_prefix="/api")

@bp.before_request
def require_json():
    if request.method in ("POST", "PUT", "PATCH") and not request.is_json:
        return {"error": "json_required"}, 415
```

**🔴 Expert Example — hook execution order documentation**

**🌍 Real-Time Example — SaaS**

API blueprint enforces version header.

### Response Hooks

**🟢 Beginner Example — `after_request`**

**🟡 Intermediate Example — gzip at middleware vs nginx decision**

**🔴 Expert Example — transform streaming responses carefully**

**🌍 Real-Time Example — social**

Add `X-RateLimit-Remaining` consistently.

### Teardown Handlers

**🟢 Beginner Example — `teardown_appcontext`**

```python
@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()
```

**🟡 Intermediate Example — per-request pools**

**🔴 Expert Example — distinguish teardown_request vs appcontext**

**🌍 Real-Time Example — e-commerce**

Return connections to pool.

### Error Handlers

**🟢 Beginner Example — 404 JSON**

```python
from werkzeug.exceptions import HTTPException

@app.errorhandler(404)
def not_found(e):
    return {"error": "not_found"}, 404
```

**🟡 Intermediate Example — HTTPException handler**

```python
@app.errorhandler(HTTPException)
def http_error(e):
    return {"error": e.name, "description": e.description}, e.code
```

**🔴 Expert Example — map domain errors to problem+json**

**🌍 Real-Time Example — SaaS**

Consistent `{type, title, status, detail, instance}` errors.

---

## 28.5 WebSockets

### Flask-SocketIO

**🟢 Beginner Example — install**

```bash
pip install flask-socketio
```

```python
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="https://app.example.com")

@socketio.on("ping")
def handle_ping():
    return {"ok": True}

if __name__ == "__main__":
    socketio.run(app)
```

**🟡 Intermediate Example — message payload validation**

**🔴 Expert Example — redis message queue for multi-worker**

```python
socketio = SocketIO(app, message_queue="redis://localhost:6379/0")
```

**🌍 Real-Time Example — e-commerce**

Live order status updates for merchant dashboard.

### Real-Time Communication

**🟢 Beginner Example — emit to sender**

```python
from flask_socketio import emit

@socketio.on("join")
def on_join(data):
    emit("joined", {"room": data.get("room")})
```

**🟡 Intermediate Example — broadcast**

```python
emit("announce", {"msg": "sale"}, broadcast=True)
```

**🔴 Expert Example — backpressure and payload size limits**

**🌍 Real-Time Example — social**

Typing indicators and presence.

### Rooms and Namespaces

**🟢 Beginner Example — join_room**

```python
from flask_socketio import join_room, leave_room

@socketio.on("enter")
def enter(data):
    join_room(data["room"])
```

**🟡 Intermediate Example — namespaces for admin vs user**

**🔴 Expert Example — authorization before join**

**🌍 Real-Time Example — SaaS**

Per-tenant namespace or room naming convention.

### Broadcasting

**🟢 Beginner Example — server broadcast**

**🟡 Intermediate Example — redis bridge across nodes**

**🔴 Expert Example — fanout limits + rate per room**

**🌍 Real-Time Example — social live events**

Shard rooms by event id.

### Event Handling

**🟢 Beginner Example — `@socketio.on`**

**🟡 Intermediate Example — ack callbacks**

**🔴 Expert Example — idempotent event processing**

**🌍 Real-Time Example — e-commerce**

Stock updates idempotent by `event_id`.

---

## 28.6 GraphQL Integration

### Graphene with Flask

**🟢 Beginner Example**

```bash
pip install graphene flask-graphql
```

```python
import graphene
from flask_graphql import GraphQLView

class Query(graphene.ObjectType):
    hello = graphene.String()

    def resolve_hello(self, info):
        return "world"

schema = graphene.Schema(query=Query)

app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True),
)
```

**🟡 Intermediate Example — disable GraphiQL in prod**

**🔴 Expert Example — DataLoader batching for N+1**

**🌍 Real-Time Example — SaaS admin explorer**

Internal GraphiQL only behind VPN.

### Schema Definition

**🟢 Beginner Example — ObjectType**

**🟡 Intermediate Example — interfaces + unions**

**🔴 Expert Example — schema stitching/federation (platform-specific)**

**🌍 Real-Time Example — e-commerce**

`Product`, `Variant`, `Inventory` types.

### Query Resolution

**🟢 Beginner Example — resolve methods**

**🟡 Intermediate Example — context with current user**

```python
def get_context():
    return {"user": g.user}

app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view("graphql", schema=schema, get_context=get_context),
)
```

**🔴 Expert Example — field-level auth directives pattern**

**🌍 Real-Time Example — social**

Friends-only fields check ACL in resolvers.

### Mutation Handling

**🟢 Beginner Example — `graphene.Mutation`**

**🟡 Intermediate Example — input objects validated**

**🔴 Expert Example — transactional mutations**

**🌍 Real-Time Example — SaaS**

`createSubscription` mutation coordinates billing service.

### Integration

**🟢 Beginner Example — mount at `/graphql`**

**🟡 Intermediate Example — batching POST + persisted queries**

**🔴 Expert Example — APQ allowlist**

**🌍 Real-Time Example — mobile app**

Persisted queries reduce attack surface.

---

## 28.7 API Design Best Practices

### RESTful Design

**🟢 Beginner Example — nouns + HTTP verbs**

```text
GET    /orders
POST   /orders
GET    /orders/{id}
PATCH  /orders/{id}
DELETE /orders/{id}
```

**🟡 Intermediate Example — subresources**

```text
GET /orders/{id}/lines
```

**🔴 Expert Example — avoid RPC-ish URLs unless pragmatic**

**🌍 Real-Time Example — e-commerce**

`POST /carts/{id}/checkout` as documented exception with idempotency.

### Versioning Strategy

**🟢 Beginner Example — URL prefix `/api/v1`**

**🟡 Intermediate Example — header `Accept-Version`**

**🔴 Expert Example — sunset headers + deprecation policy**

**🌍 Real-Time Example — SaaS**

12-month deprecation window with changelog.

### Rate Limiting

**🟢 Beginner Example — Flask-Limiter**

```python
limiter = Limiter(get_remote_address, app=app)

@app.get("/api/search")
@limiter.limit("30/minute")
def search():
    return {"q": request.args["q"]}
```

**🟡 Intermediate Example — per API key**

**🔴 Expert Example — sliding window Redis**

**🌍 Real-Time Example — social**

Stricter limits on expensive endpoints.

### Pagination Design

**🟢 Beginner Example — `page` + `per_page`**

**🟡 Intermediate Example — cursor pagination**

```json
{"items": [], "next_cursor": "eyJpZCI6MTIzfQ=="}
```

**🔴 Expert Example — stable ordering documented**

**🌍 Real-Time Example — SaaS audit log export**

Cursor + time range.

### Error Response Design

**🟢 Beginner Example — JSON `{error, message}`**

**🟡 Intermediate Example — `request_id` field**

**🔴 Expert Example — RFC 9457 Problem Details**

**🌍 Real-Time Example — e-commerce**

PCI-friendly errors without leaking internals.

---

## 28.8 Code Quality

### Code Style PEP 8

**🟢 Beginner Example — `ruff check` or `flake8`**

**🟡 Intermediate Example — `ruff format` aligned with black**

**🔴 Expert Example — import sorting + typing rules**

**🌍 Real-Time Example — SaaS**

Pre-commit hooks block commits.

### Type Hints

**🟢 Beginner Example**

```python
def total_cents(lines: list[tuple[int, int]]) -> int:
    return sum(price * qty for price, qty in lines)
```

**🟡 Intermediate Example — `TypedDict` for JSON bodies**

**🔴 Expert Example — `mypy --strict` gradually**

**🌍 Real-Time Example — e-commerce**

Typed service layer prevents currency unit mistakes.

### Documentation

**🟢 Beginner Example — docstrings on public functions**

**🟡 Intermediate Example — Sphinx autodoc**

**🔴 Expert Example — OpenAPI from code**

**🌍 Real-Time Example — social**

Public API docs generated in CI.

### Testing Coverage

**🟢 Beginner Example — `pytest --cov=myapp`**

**🟡 Intermediate Example — branch coverage thresholds**

**🔴 Expert Example — mutation testing selectively**

**🌍 Real-Time Example — SaaS**

Critical billing module 95% coverage gate.

### Refactoring Patterns

**🟢 Beginner Example — extract function**

**🟡 Intermediate Example — introduce service class**

**🔴 Expert Example — strangler fig for legacy module**

**🌍 Real-Time Example — e-commerce**

Extract `payments/` from monolith file by file.

---

## Best Practices

1. **Name endpoints** predictably; document breaking changes.
2. **Prefer explicit converters** over manual parsing in views.
3. **Keep middleware thin**—heavy logic belongs in services/workers.
4. **Validate WebSocket events** like HTTP bodies.
5. **GraphQL**: enforce **depth/complexity limits** and auth in context.
6. **Use `url_for`** to avoid broken links and ease refactors.
7. **Centralize error envelopes** for JSON APIs.
8. **Automate formatting, linting, typing, tests** in CI.

---

## Common Mistakes to Avoid

| Mistake | Why |
|---------|-----|
| Using `threading` with request context | Undefined behavior; use queues |
| Giant GraphQL resolvers | N+1, slow, untestable |
| WebSocket without auth | open channel abuse |
| `strict_slashes` mismatch | duplicate routes/caches |
| Returning ORM objects directly in GraphQL | Over-exposure |
| No rate limits on search | DoS vector |
| Skipping teardown cleanup | connection leaks |

---

## Comparison Tables

### REST vs GraphQL

| Topic | REST | GraphQL |
|-------|------|---------|
| Caching | HTTP-friendly | Harder at edge |
| Over-fetching | common | reduced |
| Learning curve | lower | higher |

### SocketIO Transports

| Transport | Notes |
|-----------|-------|
| websocket | preferred |
| polling | fallback |

### Hooks Order (typical)

| Hook | Purpose |
|------|---------|
| `before_request` | auth, setup |
| view | work |
| `after_request` | headers |
| `teardown_request` | cleanup |

---

## Appendix — Cheat Sheets

### A. Route Snippets

**🟢 Beginner Example — `methods`**

```python
@app.route("/item", methods=["GET", "POST"])
```

**🟡 Intermediate Example — `subdomain`**

```python
app.register_blueprint(tenant_bp, subdomain="<tenant>")
```

**🔴 Expert Example — `host` matching**

**🌍 Real-Time Example — SaaS `acme.app.com`**

### B. Error JSON Template

**🟢 Beginner Example**

```python
return {"error": {"code": "VALIDATION_ERROR", "fields": {"email": "invalid"}}}, 422
```

**🟡 Intermediate Example — problem+json `type` URI**

**🔴 Expert Example — i18n `title` per locale**

**🌍 Real-Time Example — e-commerce checkout**

### C. Jinja Layout Pattern

**🟢 Beginner Example**

```jinja
{% extends "base.html" %}
{% block content %}{% endblock %}
```

**🟡 Intermediate Example — `super()`**

**🔴 Expert Example — nested blocks for SaaS themes**

**🌍 Real-Time Example — white-label**

### D. SocketIO Auth

**🟢 Beginner Example — token in handshake query (prefer secure patterns)**

**🟡 Intermediate Example — session cookie with SameSite**

**🔴 Expert Example — short-lived ticket exchanged server-side**

**🌍 Real-Time Example — social**

Block joins to rooms user cannot access.

### E. GraphQL Depth Limit

**🟢 Beginner Example — conceptual**

```text
Disallow queries deeper than N
```

**🟡 Intermediate Example — library middleware**

**🔴 Expert Example — cost analysis**

**🌍 Real-Time Example — SaaS public API**

### F. API Version Sunset

**🟢 Beginner Example — `Deprecation` header**

**🟡 Intermediate Example — `Sunset` + link to migration guide**

**🔴 Expert Example — automated usage dashboard per version**

**🌍 Real-Time Example — e-commerce mobile apps**

### G. PEP 585 Types

**🟢 Beginner Example — `list[str]`**

**🟡 Intermediate Example — `from __future__ import annotations`**

**🔴 Expert Example — `Protocol` for clients**

**🌍 Real-Time Example — test doubles**

### H. pytest Flask Fixtures

**🟢 Beginner Example**

```python
def test_health(client):
    assert client.get("/healthz").status_code == 200
```

**🟡 Intermediate Example — auth header fixture**

**🔴 Expert Example — factory_boy models**

**🌍 Real-Time Example — e-commerce order flows**

### I. OpenAPI Metadata

**🟢 Beginner Example — flask-smorest / APISpec integration idea**

**🟡 Intermediate Example — document pagination params**

**🔴 Expert Example — generate Postman collection in CI**

**🌍 Real-Time Example — partner integrations**

### J. Performance Sanity

**🟢 Beginner Example — avoid sync sleep in requests**

**🟡 Intermediate Example — offload with Celery**

**🔴 Expert Example — profile before micro-optimizing**

**🌍 Real-Time Example — social viral day**

---

*Notes version: Flask **3.1.3**, Python **3.9+**, February 2026 release line.*
