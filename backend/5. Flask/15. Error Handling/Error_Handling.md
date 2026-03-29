# Flask 3.1.3 — Error Handling

This guide explains how to handle failures in Flask 3.1.3 applications (Python 3.9+) in a way that keeps users informed, operators alerted, and systems recoverable. You will learn Python-level exception control, HTTP semantics with `abort()`, centralized `@app.errorhandler` routes, polished error templates, recovery patterns for databases and networks, and how to test and monitor errors in production for e-commerce, social, and SaaS workloads.

---

## 📑 Table of Contents

1. [15.1 Exception Handling](#151-exception-handling)
2. [15.2 HTTP Error Handling](#152-http-error-handling)
3. [15.3 Error Handlers](#153-error-handlers)
4. [15.4 Custom Error Pages](#154-custom-error-pages)
5. [15.5 Error Recovery](#155-error-recovery)
6. [15.6 Best Practices](#156-best-practices-production-and-operations)
7. [Best Practices (Summary)](#best-practices-summary)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 15.1 Exception Handling

Exception handling in Flask is ordinary Python first: uncaught exceptions bubble out of view functions and can be turned into 500 responses by Werkzeug unless you register handlers. Master **try/except**, **types**, **custom errors**, **propagation**, and **finally** so business logic stays clean and predictable.

### 15.1.1 Try-Except Blocks

Use `try`/`except` around code that can fail (parsing, I/O, external APIs). Catch the narrowest exception you can handle; re-raise or wrap when you cannot recover.

#### 🟢 Beginner Example

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.get("/divide")
def divide():
    try:
        a = int(request.args.get("a", "1"))
        b = int(request.args.get("b", "1"))
        return jsonify(result=a / b)
    except ZeroDivisionError:
        return jsonify(error="Cannot divide by zero"), 400
```

#### 🟡 Intermediate Example

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/cart/apply-coupon")
def apply_coupon():
    try:
        payload = request.get_json(force=True, silent=False)
        code = payload["code"]
    except (TypeError, KeyError, ValueError):
        return jsonify(message="Invalid JSON or missing 'code'"), 422
    # ... validate coupon in DB
    return jsonify(applied=True, discount_percent=10)
```

#### 🔴 Expert Example

```python
class DomainError(Exception):
    """Base for expected business-rule failures."""

class InsufficientStock(DomainError):
    pass

def reserve_line_items(order_id: str) -> None:
    raise InsufficientStock("SKU-42")

from flask import Flask, jsonify

app = Flask(__name__)

@app.post("/checkout/<order_id>")
def checkout(order_id: str):
    try:
        reserve_line_items(order_id)
    except InsufficientStock as e:
        return jsonify(code="INSUFFICIENT_STOCK", detail=str(e)), 409
    except DomainError as e:
        return jsonify(code="DOMAIN_ERROR", detail=str(e)), 400
    except Exception:
        app.logger.exception("checkout_failed order_id=%s", order_id)
        return jsonify(code="INTERNAL"), 500
```

#### 🌍 Real-Time Example (E-Commerce)

```python
# Payment gateway call with timeouts and typed errors
import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.post("/payments/charge")
def charge():
    try:
        r = requests.post(
            "https://api.payment-provider.example/v1/charges",
            json=request.get_json(),
            timeout=(2, 10),
        )
        r.raise_for_status()
        return jsonify(r.json())
    except requests.Timeout:
        return jsonify(code="GATEWAY_TIMEOUT", user_message="Please try again."), 504
    except requests.HTTPError as e:
        return jsonify(code="GATEWAY_DECLINED", detail=str(e)), 402
```

### 15.1.2 Exception Types

Catch **`ValueError`**, **`KeyError`**, **`TypeError`** for bad input; **`OSError`**/subclasses for I/O; library-specific types (`sqlalchemy.exc.SQLAlchemyError`, `requests.RequestException`) for infrastructure.

#### 🟢 Beginner Example

```python
try:
    n = int("x")
except ValueError:
    n = None
```

#### 🟡 Intermediate Example

```python
from werkzeug.exceptions import BadRequest
from flask import Flask, request

app = Flask(__name__)

@app.post("/profile")
def profile():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise BadRequest("JSON object required")
    return {"ok": True}
```

#### 🔴 Expert Example

```python
from sqlalchemy.exc import IntegrityError, OperationalError
from flask import Flask, jsonify

app = Flask(__name__)

def create_user(email: str):
    # ORM insert ...
    pass

@app.post("/users")
def users():
    try:
        create_user(request.json["email"])  # noqa: F821
    except IntegrityError:
        return jsonify(code="DUPLICATE_EMAIL"), 409
    except OperationalError:
        app.logger.exception("db_down")
        return jsonify(code="SERVICE_UNAVAILABLE"), 503
```

#### 🌍 Real-Time Example (SaaS)

```python
# Multi-tenant SaaS: distinguish auth vs validation vs infra
from werkzeug.exceptions import Unauthorized
from flask import g, jsonify

@app.get("/tenants/<tid>/usage")
def usage(tid: str):
    try:
        assert g.tenant_id == tid  # set by before_request
    except AssertionError:
        raise Unauthorized("Wrong tenant context")
    try:
        rows = fetch_usage_rows(tid)  # noqa: F821
    except TimeoutError:
        return jsonify(code="USAGE_BACKEND_TIMEOUT"), 504
    return jsonify(rows=rows)
```

### 15.1.3 Custom Exceptions

Define hierarchy under one base (`AppError`) with optional `http_status` and `payload` for consistent JSON errors.

#### 🟢 Beginner Example

```python
class NegativeQuantityError(Exception):
    pass

def parse_qty(q: int):
    if q < 0:
        raise NegativeQuantityError("qty must be >= 0")
```

#### 🟡 Intermediate Example

```python
class AppError(Exception):
    def __init__(self, message: str, status: int = 400, code: str = "APP_ERROR"):
        super().__init__(message)
        self.status = status
        self.code = code

class NotFoundAppError(AppError):
    def __init__(self, message: str = "Not found"):
        super().__init__(message, status=404, code="NOT_FOUND")
```

#### 🔴 Expert Example

```python
from dataclasses import dataclass
from typing import Any, Optional

@dataclass
class ErrorDetail:
    code: str
    message: str
    field: Optional[str] = None
    meta: Optional[dict[str, Any]] = None

class StructuredAppError(Exception):
    def __init__(self, detail: ErrorDetail, status: int = 400):
        self.detail = detail
        self.status = status
        super().__init__(detail.message)

# In a view: raise StructuredAppError(ErrorDetail("INVALID_HANDLE", "Taken", field="handle"))
```

#### 🌍 Real-Time Example (Social Media)

```python
# Content moderation pipeline
class ModerationRejected(StructuredAppError):
    def __init__(self, reason: str):
        super().__init__(
            ErrorDetail("MODERATION_REJECTED", reason, meta={"appeal_url": "/appeals"}),
            status=422,
        )
```

### 15.1.4 Exception Propagation

Let exceptions propagate when a layer cannot add context; catch at boundaries (views, CLI, tasks). Use `raise ... from e` to preserve chains.

#### 🟢 Beginner Example

```python
def inner():
    raise ValueError("bad")

def outer():
    inner()  # propagates to caller
```

#### 🟡 Intermediate Example

```python
try:
    risky()
except ValueError as e:
    raise RuntimeError("wrapped") from e
```

#### 🔴 Expert Example

```python
from flask import Flask
from werkzeug.exceptions import HTTPException

app = Flask(__name__)

@app.errorhandler(Exception)
def fallback(exc: BaseException):
    if isinstance(exc, HTTPException):
        return exc
    app.logger.exception("unhandled")
    return {"error": "internal"}, 500
```

#### 🌍 Real-Time Example

```python
# Celery task calls Flask service: map remote 4xx without losing cause
def call_internal_api():
    try:
        ...
    except requests.HTTPError as e:
        raise ServiceError("upstream failed") from e
```

### 15.1.5 Finally Blocks

Use `finally` for cleanup (close files, release locks) regardless of success or failure.

#### 🟢 Beginner Example

```python
f = open("log.txt", "a")
try:
    f.write("event")
finally:
    f.close()
```

#### 🟡 Intermediate Example

```python
from contextlib import contextmanager

@contextmanager
def db_transaction(conn):
    tx = conn.begin()
    try:
        yield tx
        tx.commit()
    except Exception:
        tx.rollback()
        raise
    finally:
        conn.close()
```

#### 🔴 Expert Example

```python
import threading

_lock = threading.Lock()

def process_job(job_id: str):
    _lock.acquire()
    try:
        run_critical_section(job_id)
    finally:
        _lock.release()
```

#### 🌍 Real-Time Example (E-Commerce Inventory)

```python
def reserve_with_ledger(sku: str, qty: int):
    ledger = open_ledger()
    try:
        write_hold(ledger, sku, qty)
        commit_inventory(sku, qty)
    finally:
        ledger.flush()
        ledger.close()
```

---

## 15.2 HTTP Error Handling

Flask maps HTTP semantics through **Werkzeug exceptions** and **`abort()`**. Consistent **status codes**, **messages**, and **response bodies** keep clients and CDNs predictable.

### 15.2.1 abort() Function

`abort(code)` or `abort(HTTPException)` stops the request and triggers error handlers.

#### 🟢 Beginner Example

```python
from flask import abort

@app.get("/item/<int:item_id>")
def item(item_id: int):
    if item_id < 1:
        abort(400)
    return {"id": item_id}
```

#### 🟡 Intermediate Example

```python
from werkzeug.exceptions import NotFound

@app.get("/users/<int:user_id>")
def user(user_id: int):
    u = User.query.get(user_id)
    if u is None:
        abort(NotFound(description="User not found"))
    return u.to_dict()
```

#### 🔴 Expert Example

```python
from werkzeug.exceptions import HTTPException

class PaymentRequired(HTTPException):
    code = 402
    description = "Subscription required"

@app.get("/premium/report")
def premium_report():
    if not g.user.is_paid:  # noqa: F821
        abort(PaymentRequired())
    return {"report": True}
```

#### 🌍 Real-Time Example (SaaS Entitlements)

```python
from werkzeug.exceptions import Forbidden

@app.post("/api/v1/export")
def export_data():
    if not g.tenant.plan_allows_export:
        abort(Forbidden(description="Upgrade plan to export"))
    return {"job_id": "exp_123"}
```

### 15.2.2 Error Status Codes

Use **4xx** for client mistakes, **5xx** for server/network/dependency failures. Reserve **401** vs **403** carefully.

#### 🟢 Beginner Example

| Situation        | Code |
|-----------------|------|
| Bad input       | 400  |
| Auth missing    | 401  |
| Not allowed     | 403  |
| Missing route   | 404  |

#### 🟡 Intermediate Example

```python
return jsonify(errors=[{"field": "email", "msg": "invalid"}]), 422
```

#### 🔴 Expert Example

```python
# 409 Conflict for duplicate resource creation
return jsonify(code="SLUG_TAKEN"), 409
```

#### 🌍 Real-Time Example (Social)

```python
# 410 Gone for deleted public profiles (SEO + clients)
return jsonify(message="Profile removed"), 410
```

### 15.2.3 Error Messages

Separate **developer detail** (logs) from **user-safe text** (response). Avoid leaking stack traces in production JSON.

#### 🟢 Beginner Example

```python
return jsonify(error="Invalid password"), 400
```

#### 🟡 Intermediate Example

```python
return jsonify(
    error={"code": "VALIDATION_ERROR", "fields": {"email": "required"}}
), 422
```

#### 🔴 Expert Example

```python
app.config["PROPAGATE_EXCEPTIONS"] = False  # production
# Log full exception; return generic body
```

#### 🌍 Real-Time Example (E-Commerce)

```python
return jsonify(
    user_message="We could not process your card.",
    support_id="chk_9f3a",
), 402
```

### 15.2.4 Custom Error Pages

Pair `abort()` with `@app.errorhandler` and Jinja templates for HTML clients; JSON for API `Accept` headers.

#### 🟢 Beginner Example

```python
@app.errorhandler(404)
def not_found(e):
    return "<h1>Not found</h1>", 404
```

#### 🟡 Intermediate Example

```python
from flask import render_template

@app.errorhandler(404)
def not_found_html(e):
    return render_template("errors/404.html", title="Missing page"), 404
```

#### 🔴 Expert Example

```python
from flask import request, jsonify, render_template

@app.errorhandler(404)
def not_found_smart(e):
    if request.path.startswith("/api/"):
        return jsonify(error="not_found"), 404
    return render_template("errors/404.html"), 404
```

#### 🌍 Real-Time Example

```python
# CDN-friendly static error page for marketing site
@app.errorhandler(503)
def maintenance(e):
    return render_template("errors/503.html"), 503
```

### 15.2.5 Error Response Format

Standardize `{ "error": { "code", "message", "details" } }` for APIs; Problem Details (RFC 9457) style for interoperability.

#### 🟢 Beginner Example

```python
{"error": "not_found"}
```

#### 🟡 Intermediate Example

```python
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "fields": {"bio": "max 500 chars"}
  }
}
```

#### 🔴 Expert Example

```python
def problem(status: int, title: str, detail: str, type_uri: str):
    return jsonify(type=type_uri, title=title, detail=detail, status=status), status
```

#### 🌍 Real-Time Example (SaaS Public API)

```python
return jsonify(
    type="https://api.example.com/problems/rate-limit",
    title="Rate limit exceeded",
    status=429,
    retry_after=60,
), 429
```

---

## 15.3 Error Handlers

Register handlers with **`@app.errorhandler`** (or `register_error_handler`) for HTTP exceptions, status codes, or arbitrary exception classes.

### 15.3.1 @app.errorhandler Decorator

```python
@app.errorhandler(ValueError)
def value_error(e: ValueError):
    return jsonify(msg=str(e)), 400
```

#### 🟢 Beginner Example

```python
@app.errorhandler(500)
def server_error(e):
    return "Server error", 500
```

#### 🟡 Intermediate Example

```python
from werkzeug.exceptions import HTTPException

@app.errorhandler(HTTPException)
def http_exception(e: HTTPException):
    return jsonify(message=e.description, code=e.code), e.code
```

#### 🔴 Expert Example

```python
def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(SQLAlchemyError)
    def db_errors(e):
        app.logger.exception("db")
        return jsonify(code="DB_ERROR"), 503
```

#### 🌍 Real-Time Example

```python
# Blueprint-level handler (Flask 2.3+ patterns still apply in 3.1)
bp = Blueprint("api", __name__, url_prefix="/api")

@bp.errorhandler(404)
def api_404(e):
    return jsonify(error="not_found"), 404
```

### 15.3.2 404 Handler

Return helpful navigation for HTML; stable machine codes for JSON.

#### 🟢 Beginner Example

```python
@app.errorhandler(404)
def four_oh_four(e):
    return "404", 404
```

#### 🟡 Intermediate Example

```python
@app.errorhandler(404)
def four_oh_four(e):
    return render_template("404.html", path=request.path), 404
```

#### 🔴 Expert Example

```python
@app.errorhandler(404)
def four_oh_four(e):
    app.logger.info("404 path=%s", request.path)
    return jsonify(code="NOT_FOUND", path=request.path), 404
```

#### 🌍 Real-Time Example (E-Commerce)

```python
# Suggest categories when product missing
@app.errorhandler(404)
def product_gone(e):
    if request.path.startswith("/p/"):
        return render_template("errors/product_404.html", suggestions=top_categories()), 404
    return render_template("errors/404.html"), 404
```

### 15.3.3 500 Handler

Never expose internals; log with correlation IDs.

#### 🟢 Beginner Example

```python
@app.errorhandler(500)
def five_hundred(e):
    return "Error", 500
```

#### 🟡 Intermediate Example

```python
@app.errorhandler(500)
def five_hundred(e):
    app.logger.exception("unhandled_500")
    return render_template("errors/500.html"), 500
```

#### 🔴 Expert Example

```python
@app.errorhandler(500)
def five_hundred(e):
    rid = g.get("request_id", "-")
    app.logger.exception("500 rid=%s", rid)
    return jsonify(code="INTERNAL", request_id=rid), 500
```

#### 🌍 Real-Time Example (SaaS)

```python
# Notify on-call for spike of 500s (metrics hook)
@app.errorhandler(500)
def five_hundred(e):
    metrics.increment("http_500_total")  # noqa: F821
    return jsonify(code="INTERNAL"), 500
```

### 15.3.4 Custom Error Handlers

Map domain exceptions to HTTP without `try` in every view.

#### 🟢 Beginner Example

```python
class AppBadRequest(Exception):
    pass

@app.errorhandler(AppBadRequest)
def bad_app_request(e):
    return str(e), 400
```

#### 🟡 Intermediate Example

```python
@app.errorhandler(StructuredAppError)
def structured(e: StructuredAppError):
    d = e.detail
    body = {"code": d.code, "message": d.message}
    if d.field:
        body["field"] = d.field
    return jsonify(error=body), e.status
```

#### 🔴 Expert Example

```python
# Chain: specific before generic
@app.errorhandler(IntegrityError)
def integrity(e):
    return jsonify(code="CONFLICT"), 409

@app.errorhandler(SQLAlchemyError)
def sqlalchemy_generic(e):
    return jsonify(code="DB_ERROR"), 503
```

#### 🌍 Real-Time Example (Social Moderation)

```python
@app.errorhandler(ModerationRejected)
def mod_rejected(e: ModerationRejected):
    return jsonify(
        error=e.detail.message,
        appeal=e.detail.meta.get("appeal_url"),
    ), e.status
```

### 15.3.5 Handler Priority

More **specific** handlers win over bases. Register **HTTPException** after **NotFound** if you need special cases. Test order when subclassing.

#### 🟢 Beginner Example

```python
@app.errorhandler(404)
def a(e): ...
# Registered second handler for 404 overrides first in some versions — use one handler per code per app
```

#### 🟡 Intermediate Example

Flask merges handlers: last registration wins for same key.

#### 🔴 Expert Example

```python
# Register subclass before superclass
app.register_error_handler(NotFound, handle_not_found)
app.register_error_handler(HTTPException, handle_http)
```

#### 🌍 Real-Time Example

```python
# API vs HTML split inside single 404 handler avoids priority fights
```

| Approach              | Pros              | Cons           |
|-----------------------|-------------------|----------------|
| One handler + branch  | Predictable       | Slightly wider |
| Multiple registrations| Risk override     | Can duplicate  |

---

## 15.4 Custom Error Pages

Polished **templates**, contextual **copy**, **logging**, and optional **reporting** (Sentry) complete the user experience.

### 15.4.1 Error Page Templates

```html
<!-- templates/errors/404.html -->
{% extends "base.html" %}
{% block content %}
  <h1>We could not find that page.</h1>
  <a href="{{ url_for('home') }}">Home</a>
{% endblock %}
```

#### 🟢 Beginner Example

`errors/404.html` with static text only.

#### 🟡 Intermediate Example

Pass `request.path`, `g.user`, and support email into template.

#### 🔴 Expert Example

Theme per tenant: `render_template(f"errors/{g.theme}/404.html")`.

#### 🌍 Real-Time Example (E-Commerce)

Show order lookup form on 404 for `/orders/...` mistypes.

### 15.4.2 Error Information Display

Show **safe** hints; hide stack traces from browsers.

#### 🟢 Beginner Example

```jinja2
<p>Reference: {{ request_id }}</p>
```

#### 🟡 Intermediate Example

```python
g.request_id = str(uuid.uuid4())
```

#### 🔴 Expert Example

Feature-flag verbose errors for staff IPs only.

#### 🌍 Real-Time Example (SaaS)

```python
if g.user and g.user.is_staff:
    detail = repr(exc)
else:
    detail = None
```

### 15.4.3 User-Friendly Messages

Plain language, next steps, and links beat error codes alone.

#### 🟢 Beginner Example

"Something went wrong. Please try again."

#### 🟡 Intermediate Example

"Your session expired. Sign in again."

#### 🔴 Expert Example

Localized strings via Flask-Babel.

#### 🌍 Real-Time Example (Social)

"We removed this post for community guidelines."

### 15.4.4 Logging Errors

Use `app.logger.exception` inside handlers; attach **request_id**, **user_id**, **tenant_id**.

#### 🟢 Beginner Example

```python
app.logger.error("failed")
```

#### 🟡 Intermediate Example

```python
app.logger.exception("checkout_failed user=%s", g.user_id)
```

#### 🔴 Expert Example

Structured JSON logs with `python-json-logger`.

#### 🌍 Real-Time Example (E-Commerce)

Log SKU, warehouse, and payment intent id on failure.

### 15.4.5 Error Reporting

Integrate Sentry, Rollbar, or OpenTelemetry for traces + exceptions.

#### 🟢 Beginner Example

Email on 500 via logging `SMTPHandler`.

#### 🟡 Intermediate Example

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(dsn="...", integrations=[FlaskIntegration()])
```

#### 🔴 Expert Example

Sample 10% of transactions; full capture on 5xx.

#### 🌍 Real-Time Example (SaaS)

Attach release git SHA and tenant tier to Sentry scope.

---

## 15.5 Error Recovery

Design **degradation**, **fallbacks**, and resilient **database** / **validation** / **connection** handling.

### 15.5.1 Graceful Degradation

Serve cached or partial data when dependencies fail.

#### 🟢 Beginner Example

```python
try:
    recs = live_recommendations()
except Exception:
    recs = []
return render_template("home.html", recs=recs)
```

#### 🟡 Intermediate Example

```python
if not redis_available():
    use_in_process_rate_limiter()
```

#### 🔴 Expert Example

Circuit breaker around payment provider with half-open probes.

#### 🌍 Real-Time Example (E-Commerce)

Show PDP without cross-sell if recommendation API is down.

### 15.5.2 Fallback Routes

Redirect unknown legacy URLs to search.

#### 🟢 Beginner Example

```python
@app.errorhandler(404)
def fallback(e):
    return redirect(url_for("search", q=request.path))
```

#### 🟡 Intermediate Example

```python
# try static file, then SPA index
```

#### 🔴 Expert Example

Edge CDN serves stale product JSON while origin recovers.

#### 🌍 Real-Time Example (Social)

Deep links to renamed handles resolve via lookup table.

### 15.5.3 Database Error Handling

Retry transient errors; map integrity errors to 409.

#### 🟢 Beginner Example

```python
try:
    db.session.commit()
except IntegrityError:
    db.session.rollback()
    return jsonify(msg="duplicate"), 409
```

#### 🟡 Intermediate Example

```python
@contextmanager
def db_session_scope():
    try:
        yield db.session
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
```

#### 🔴 Expert Example

Exponential backoff on `OperationalError` for read replica failover.

#### 🌍 Real-Time Example (SaaS)

Queue write on primary failure; return 202 with job id.

### 15.5.4 Validation Error Handling

Centralize Marshmallow/Pydantic/WTF errors to 422 JSON.

#### 🟢 Beginner Example

```python
errors = form.errors
return jsonify(errors=errors), 422
```

#### 🟡 Intermediate Example

```python
try:
    data = UserSchema().load(payload)
except ValidationError as e:
    return jsonify(errors=e.messages), 422
```

#### 🔴 Expert Example

i18n error messages per locale header.

#### 🌍 Real-Time Example (E-Commerce)

Return field-level errors for checkout address form.

### 15.5.5 Connection Error Handling

Timeouts, retries, and friendly 502/504 for upstream HTTP, DB, Redis.

#### 🟢 Beginner Example

```python
except requests.ConnectionError:
    return jsonify(msg="Upstream offline"), 502
```

#### 🟡 Intermediate Example

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def fetch():
    ...
```

#### 🔴 Expert Example

Health endpoints per dependency with substatus in JSON.

#### 🌍 Real-Time Example (SaaS)

Degrade analytics ingestion if broker is unreachable.

---

## 15.6 Best Practices (Production and Operations)

### 15.6.1 Error Logging Strategy

Levels: **DEBUG** dev-only, **INFO** business events, **WARNING** recoverable, **ERROR** failed requests, **CRITICAL** data loss. Include correlation IDs.

#### 🟢 Beginner Example

Use `app.logger` not `print`.

#### 🟡 Intermediate Example

```python
@app.before_request
def req_id():
    g.request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
```

#### 🔴 Expert Example

Log sampling + dynamic log level via admin API.

#### 🌍 Real-Time Example (E-Commerce)

PCI: never log full PAN; mask tokens.

### 15.6.2 Error Monitoring

Dashboards on 4xx/5xx rates, latency, saturation. Alert on SLO burn.

#### 🟢 Beginner Example

UptimeRobot ping `/health`.

#### 🟡 Intermediate Example

Prometheus `http_requests_total{status="500"}`.

#### 🔴 Expert Example

Synthetic canaries posting real (sandbox) checkout.

#### 🌍 Real-Time Example (SaaS)

Per-tenant error budget for enterprise SLAs.

### 15.6.3 Error Documentation

Document API error codes in OpenAPI `responses` with examples.

#### 🟢 Beginner Example

README table of codes.

#### 🟡 Intermediate Example

OpenAPI 3.1 `components.responses`.

#### 🔴 Expert Example

Auto-generated SDKs from schema.

#### 🌍 Real-Time Example

Partner portal with searchable error catalog.

### 15.6.4 Testing Error Handlers

Use test client `assert response.status_code == 404` and JSON body.

#### 🟢 Beginner Example

```python
def test_404(client):
    r = client.get("/nope")
    assert r.status_code == 404
```

#### 🟡 Intermediate Example

```python
def test_api_problem(client):
    r = client.get("/api/missing")
    assert r.json["code"] == "NOT_FOUND"
```

#### 🔴 Expert Example

Snapshot tests for HTML error pages.

#### 🌍 Real-Time Example (Social)

Contract tests that moderation errors match client parsers.

### 15.6.5 Production Error Handling

`DEBUG=False`, `TESTING=False`, trusted proxies configured, generic 500 bodies, rich server logs.

#### 🟢 Beginner Example

```python
app.config["DEBUG"] = False
```

#### 🟡 Intermediate Example

```python
app.config["PROPAGATE_EXCEPTIONS"] = False
```

#### 🔴 Expert Example

WAF + rate limit + bot challenge on repeated 4xx.

#### 🌍 Real-Time Example (SaaS)

Feature flag to disable risky endpoints during incident.

---

## Best Practices (Summary)

- Prefer **narrow** `except` clauses and **domain** exception types.
- Use **`abort()`** for HTTP-shaped failures; **`errorhandler`** for mapping to responses.
- **Never** return stack traces to clients in production APIs.
- Log **structured** context and **correlate** across services.
- **Test** handlers and **document** machine-readable error codes.

---

## Common Mistakes to Avoid

| Mistake | Why it hurts | Better approach |
|--------|----------------|-----------------|
| `except:` bare | Hides bugs, breaks `KeyboardInterrupt` | Catch specific types |
| Duplicate JSON/HTML logic in every view | Drift and inconsistency | Central error handlers |
| Logging secrets | Compliance breach | Redact tokens/passwords |
| Using 500 for validation | Wrong client semantics | 422/400 with fields |
| Relying on Flask debug in prod | RCE risk | Disable debug, use monitoring |
| Swallowing exceptions | Silent data loss | Log and re-raise or translate |

---

## Comparison Tables

| Tool | When to use |
|------|-------------|
| `try/except` | Recoverable logic in services and views |
| `abort()` | Immediate HTTP failure from view |
| `@app.errorhandler` | Uniform responses / cross-cutting mapping |
| Custom templates | HTML UX for browsers |
| JSON problem details | Public APIs and mobile clients |

| Status | Typical meaning |
|--------|------------------|
| 400 | Malformed request |
| 401 | Not authenticated |
| 403 | Authenticated but forbidden |
| 404 | Missing resource |
| 409 | Conflict (unique constraint) |
| 422 | Validation failed |
| 429 | Rate limited |
| 502 | Bad gateway |
| 503 | Unavailable / maintenance |

| Layer | Responsibility |
|-------|------------------|
| View | Translate to HTTP |
| Service | Raise domain errors |
| Repository | Map DB errors |
| Infrastructure | Retries, timeouts |

---

*Flask 3.1.3 (February 2026), Python 3.9+. Patterns align with Werkzeug HTTP exceptions and Flask application error handling APIs.*
