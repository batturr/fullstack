# Requests and Responses

Flask wraps the WSGI **environ** in the **`request`** proxy and turns your view’s return value into a **Response**. Mastering **request data** (query string, forms, JSON, raw body, uploads), **headers**, and **response** construction (status, headers, cookies) is essential for **REST APIs**, **HTML forms**, and **webhook** integrations. This chapter aligns with **Flask 3.1.3** and uses Python examples from **e-commerce checkouts**, **social clients**, and **SaaS** multi-tenant APIs.

---

## 📑 Table of Contents

1. [Request Object](#1-request-object)
   - 1.1 Flask request object
   - 1.2 Request methods
   - 1.3 Request properties
   - 1.4 URL information
   - 1.5 Client information
2. [Request Data](#2-request-data)
   - 2.1 Query parameters `request.args`
   - 2.2 Form data `request.form`
   - 2.3 JSON data `request.json` / `get_json()`
   - 2.4 Request body `request.data` / `get_data()`
   - 2.5 File data `request.files`
3. [Request Headers](#3-request-headers)
   - 3.1 Reading headers
   - 3.2 User-Agent
   - 3.3 Authorization headers
   - 3.4 Custom headers
   - 3.5 Header validation
4. [Response Object](#4-response-object)
   - 4.1 Creating responses
   - 4.2 Status codes
   - 4.3 Response headers
   - 4.4 Response body
   - 4.5 Response objects
5. [Return Types](#5-return-types)
   - 5.1 String responses
   - 5.2 Dictionary / JSON responses
   - 5.3 Tuple responses
   - 5.4 List responses
   - 5.5 `Response` object returns
6. [JSON Handling](#6-json-handling)
   - 6.1 `jsonify()`
   - 6.2 JSON serialization
   - 6.3 Deserialization
   - 6.4 Custom JSON encoders
   - 6.5 JSONP (legacy)
7. [Cookies](#7-cookies)
   - 7.1 Setting cookies
   - 7.2 Reading cookies
   - 7.3 Cookie parameters
   - 7.4 Cookie deletion
   - 7.5 Secure cookies
8. [Best Practices](#8-best-practices)
9. [Common Mistakes to Avoid](#9-common-mistakes-to-avoid)
10. [Comparison Tables](#10-comparison-tables)

---

## 1. Request Object

### 1.1 Flask request object

```python
from flask import request
```

### 1.2 Request methods

`request.method` — `GET`, `POST`, etc.

### 1.3 Request properties

`request.path`, `request.full_path`, `request.script_root`, `request.url`, `request.base_url`.

### 1.4 URL information

`request.view_args`, `request.args` (query), routing values from converters.

### 1.5 Client information

`request.remote_addr`, `request.headers`, `request.user_agent`.

#### Concept: Inspecting incoming requests

### 🟢 Beginner Example

```python
from flask import Flask, request

app = Flask(__name__)


@app.get("/whoami")
def whoami():
    return {
        "method": request.method,
        "path": request.path,
    }
```

### 🟡 Intermediate Example

```python
@app.get("/debug/url")
def debug_url():
    return {
        "url": request.url,
        "base_url": request.base_url,
        "query_string": request.query_string.decode(),
    }
```

### 🔴 Expert Example

```python
from flask import Flask, request

app = Flask(__name__)


@app.before_request
def log_request_id():
    rid = request.headers.get("X-Request-Id")
    # attach to g for logging in real apps
    return None


@app.get("/trace")
def trace():
    return {"request_id": request.headers.get("X-Request-Id")}
```

### 🌍 Real-Time Example

**SaaS** API: propagate `X-Request-Id` to downstream services for distributed tracing.

```python
@app.get("/v1/accounts/<int:aid>")
def account(aid: int):
    return {"id": aid, "trace": request.headers.get("X-Request-Id")}
```

---

## 2. Request Data

### 2.1 Query parameters `request.args`

```python
q = request.args.get("q", "")
```

### 2.2 Form data `request.form`

```python
name = request.form.get("name")
```

### 2.3 JSON data `request.json` / `get_json()`

Prefer `request.get_json(silent=True)` for APIs.

### 2.4 Request body `request.data` / `get_data()`

Raw bytes—for webhooks, binary payloads.

### 2.5 File data `request.files`

```python
f = request.files.get("avatar")
```

#### Concept: Search endpoint

### 🟢 Beginner Example

```python
@app.get("/search")
def search():
    return {"q": request.args.get("q", "")}
```

### 🟡 Intermediate Example

```python
@app.post("/contact")
def contact():
    email = request.form.get("email", "")
    message = request.form.get("message", "")
    return {"email": email, "len": len(message)}
```

### 🔴 Expert Example

```python
@app.post("/webhooks/payments")
def payments():
    raw = request.get_data(cache=False, as_text=False)
    sig = request.headers.get("X-Signature", "")
    # verify HMAC over raw bytes
    return {"bytes": len(raw), "sig_present": bool(sig)}
```

### 🌍 Real-Time Example

**E-commerce** product image upload:

```python
@app.post("/admin/products/<int:pid>/image")
def upload(pid: int):
    file = request.files.get("file")
    if not file:
        return {"error": "file_required"}, 400
    return {"product_id": pid, "filename": file.filename}
```

---

## 3. Request Headers

### 3.1 Reading headers

```python
request.headers.get("Accept")
```

Headers are case-insensitive.

### 3.2 User-Agent

```python
ua = request.user_agent
```

### 3.3 Authorization headers

```python
auth = request.headers.get("Authorization", "")
```

### 3.4 Custom headers

`X-Api-Key`, `X-Tenant-Id`, etc.

### 3.5 Header validation

Reject missing/invalid headers early in `before_request` or decorators.

#### Concept: Bearer token parsing

### 🟢 Beginner Example

```python
@app.get("/private")
def private():
    token = request.headers.get("Authorization", "")
    return {"auth": token[:20]}
```

### 🟡 Intermediate Example

```python
def parse_bearer() -> str | None:
    h = request.headers.get("Authorization", "")
    if h.startswith("Bearer "):
        return h.removeprefix("Bearer ").strip()
    return None


@app.get("/me")
def me():
    tok = parse_bearer()
    if not tok:
        return {"error": "unauthorized"}, 401
    return {"token_len": len(tok)}
```

### 🔴 Expert Example

```python
from functools import wraps
from flask import abort

def require_api_key(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.headers.get("X-Api-Key") != "secret":
            abort(401)
        return fn(*args, **kwargs)

    return wrapper
```

### 🌍 Real-Time Example

**Social** mobile clients: require `App-Version` header for gradual feature rollout.

```python
@app.before_request
def check_version():
    if request.path.startswith("/v1/"):
        ver = request.headers.get("App-Version")
        if not ver:
            return {"error": "upgrade_required"}, 426
```

---

## 4. Response Object

### 4.1 Creating responses

```python
from flask import make_response

resp = make_response("ok", 200)
```

### 4.2 Status codes

```python
return "created", 201
```

### 4.3 Response headers

```python
resp.headers["X-Frame-Options"] = "DENY"
```

### 4.4 Response body

Strings, iterators, bytes.

### 4.5 Response objects

`from werkzeug.wrappers import Response` for full control.

#### Concept: Custom headers for caching

### 🟢 Beginner Example

```python
from flask import make_response

@app.get("/hello")
def hello():
    resp = make_response("hello")
    resp.headers["Cache-Control"] = "public, max-age=60"
    return resp
```

### 🟡 Intermediate Example

```python
from flask import Response

@app.get("/robots.txt")
def robots():
    return Response("User-agent: *\nDisallow:\n", mimetype="text/plain")
```

### 🔴 Expert Example

```python
from werkzeug.wrappers import Response

@app.get("/download.csv")
def download():
    data = "sku,price\nA1,10\n"
    return Response(
        data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=skus.csv"},
    )
```

### 🌍 Real-Time Example

**SaaS** export: streaming CSV with chunked transfer.

```python
def gen_rows():
    yield "id\n"
    for i in range(3):
        yield f"{i}\n"


@app.get("/export")
def export():
    return Response(gen_rows(), mimetype="text/csv")
```

---

## 5. Return Types

### 5.1 String responses

```python
return "<h1>Hi</h1>"
```

### 5.2 Dictionary / JSON responses

Flask 2.2+ often serializes dict/list to JSON automatically; **`jsonify`** remains explicit and flexible.

### 5.3 Tuple responses

```python
return jsonify(ok=True), 201, {"Location": "/items/1"}
```

### 5.4 List responses

```python
return [{"id": 1}], 200
```

### 5.5 `Response` object returns

Return `make_response(...)` or `Response(...)`.

#### Concept: Tuple unpacking rules

### 🟢 Beginner Example

```python
@app.get("/a")
def a():
    return "text", 200
```

### 🟡 Intermediate Example

```python
from flask import jsonify

@app.post("/b")
def b():
    return jsonify(id=1), 201
```

### 🔴 Expert Example

```python
@app.get("/c")
def c():
    return {"x": 1}, 200, [("X-Custom", "1")]
```

### 🌍 Real-Time Example

**E-commerce** cart: return 409 with JSON body on inventory conflict.

```python
from flask import jsonify

@app.post("/cart/add")
def add():
    return jsonify(error="out_of_stock", sku="MUG-01"), 409
```

---

## 6. JSON Handling

### 6.1 `jsonify()`

```python
from flask import jsonify

return jsonify(message="ok")
```

### 6.2 JSON serialization

Uses Flask’s JSON provider (defaults suitable for most types).

### 6.3 Deserialization

```python
body = request.get_json(silent=True) or {}
```

### 6.4 Custom JSON encoders

Customize via `app.json` provider (Flask 2.2+).

### 6.5 JSONP (legacy)

Avoid for new apps; prefer CORS.

#### Concept: Custom JSON for `datetime`

### 🟢 Beginner Example

```python
from flask import jsonify
from datetime import datetime, timezone

@app.get("/time")
def time():
    return jsonify(now=datetime.now(timezone.utc).isoformat())
```

### 🟡 Intermediate Example

```python
from datetime import date

from flask import Flask
from flask.json.provider import DefaultJSONProvider

app = Flask(__name__)


class CustomJSONProvider(DefaultJSONProvider):
    def default(self, o):
        if isinstance(o, date):
            return o.isoformat()
        return super().default(o)


app.json = CustomJSONProvider(app)
```

### 🔴 Expert Example

```python
from decimal import Decimal

from flask import Flask
from flask.json.provider import DefaultJSONProvider

app = Flask(__name__)


class MoneyJSONProvider(DefaultJSONProvider):
    def default(self, o):
        if isinstance(o, Decimal):
            return str(o)
        return super().default(o)


app.json = MoneyJSONProvider(app)
```

### 🌍 Real-Time Example

**SaaS** ledger API returns `Decimal` as strings for precision.

```python
@app.get("/balances")
def balances():
    return {"amount": "19.99"}
```

---

## 7. Cookies

### 7.1 Setting cookies

```python
from flask import make_response

resp = make_response("ok")
resp.set_cookie("session_id", "abc", httponly=True, samesite="Lax")
return resp
```

### 7.2 Reading cookies

```python
request.cookies.get("session_id")
```

### 7.3 Cookie parameters

`max_age`, `expires`, `path`, `domain`, `secure`, `httponly`, `samesite`.

### 7.4 Cookie deletion

```python
resp.delete_cookie("session_id")
```

### 7.5 Secure cookies

`secure=True` in production (HTTPS only).

#### Concept: Preference cookie

### 🟢 Beginner Example

```python
from flask import Flask, make_response, request

app = Flask(__name__)


@app.get("/theme")
def theme():
    t = request.cookies.get("theme", "light")
    return {"theme": t}
```

### 🟡 Intermediate Example

```python
@app.post("/theme")
def set_theme():
    body = request.get_json(silent=True) or {}
    theme = body.get("theme", "light")
    resp = make_response({"theme": theme})
    resp.set_cookie("theme", theme, max_age=60 * 60 * 24 * 365, samesite="Lax")
    return resp
```

### 🔴 Expert Example

```python
@app.route("/logout", methods=["POST"])
def logout():
    resp = make_response({"ok": True})
    resp.delete_cookie("session_id", path="/", samesite="Lax")
    return resp
```

### 🌍 Real-Time Example

**E-commerce** affiliate tracking: short-lived cookie + server-side attribution.

```python
@app.get("/click")
def click():
    ref = request.args.get("ref", "")
    resp = make_response({"tracked": True})
    resp.set_cookie("ref", ref, max_age=60 * 60 * 24 * 30, httponly=True, samesite="Lax")
    return resp
```

---

## 8. Best Practices

1. Prefer **`get_json(silent=True)`** and validate schemas for APIs.
2. Use **`request.args.get(..., type=int)`** for typed query parsing.
3. Never trust **raw** `Authorization` parsing alone—use established JWT/OAuth libs.
4. Set **`Content-Type`** explicitly when returning non-JSON text.
5. Use **`make_response`** when mixing cookies, headers, and bodies.
6. Avoid storing secrets in **cookies** without encryption—sessions sign payloads, not encrypt by default.
7. Configure **`MAX_CONTENT_LENGTH`** to limit upload sizes.
8. For webhooks, verify signatures on **raw bytes** before JSON parsing when required.
9. Return **consistent error JSON** across routes.
10. Prefer **Response streaming** for large downloads to bound memory.

---

## 9. Common Mistakes to Avoid

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using `request.json` on invalid body | 415/400 surprises | `silent=True` + validation |
| Parsing JSON before signature verify | Security | Read raw bytes first |
| Ignoring charset | Mojibake | Specify encoding explicitly if needed |
| Huge uploads | DoS | `MAX_CONTENT_LENGTH` |
| Open CORS + cookies | CSRF/token issues | Thoughtful CORS, SameSite |
| Returning tuples with wrong arity | Type errors | `(body, status, headers)` order |
| Trusting `User-Agent` | Spoofable | Never for security decisions alone |

---

## 10. Comparison Tables

### `request.data` vs `get_json()`

| API | When |
|-----|------|
| **`get_data()`/`data`** | Webhooks/HMAC, binary |
| **`get_json()`** | JSON APIs |

### `jsonify` vs raw dict return

| Approach | Notes |
|----------|-------|
| **`jsonify`** | Explicit, adds mimetype, handles headers easily |
| **dict return** | Concise in modern Flask; ensure client expects JSON |

---

### Supplementary — **Content negotiation**

### 🟢 Beginner Example

```python
@app.get("/doc")
def doc():
    if "application/json" in request.accept_mimetypes:
        return {"format": "json"}
    return "<html>doc</html>"
```

### 🟡 Intermediate Example

Use `request.accept_mimetypes.best_match(["application/json", "text/html"])`.

### 🔴 Expert Example

Vendor-specific Accept headers for versioned APIs.

### 🌍 Real-Time Example

**SaaS** public API returns JSON; browser users get HTML help page.

---

### Supplementary — **415 Unsupported Media Type**

### 🟢 Beginner Example

```python
@app.post("/only-json")
def only_json():
    if not request.is_json:
        return {"error": "json_required"}, 415
    return {"ok": True}
```

### 🟡 Intermediate Example

Check `request.mimetype == "application/json"`.

### 🔴 Expert Example

Strict `Content-Type` for webhooks.

### 🌍 Real-Time Example

**Payment** provider sends `application/json`—reject others.

---

### Supplementary — **File uploads validation**

### 🟢 Beginner Example

```python
f = request.files.get("file")
if not f or f.filename == "":
    return {"error": "file_required"}, 400
```

### 🟡 Intermediate Example

```python
ALLOWED = {".png", ".jpg"}

def allowed(name: str) -> bool:
    return any(name.lower().endswith(ext) for ext in ALLOWED)
```

### 🔴 Expert Example

Inspect magic bytes, virus scan async, store in object storage.

### 🌍 Real-Time Example

**Social** avatars: resize + CDN upload in worker.

---

### Supplementary — **Request entity too large**

### 🟢 Beginner Example

```python
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024
```

### 🟡 Intermediate Example

Return JSON error handler for 413.

### 🔴 Expert Example

Per-route limits via reverse proxy (nginx `client_max_body_size`).

### 🌍 Real-Time Example

**E-commerce** bulk import: large uploads only on dedicated endpoint behind auth.

---

### Supplementary — **Immutable dicts**

### 🟢 Beginner Example

`request.args` is immutable—copy to mutate.

### 🟡 Intermediate Example

```python
params = request.args.to_dict()
params["page"] = "2"
```

### 🔴 Expert Example

Use `MultiDict` patterns for repeated keys: `request.args.getlist("tag")`.

### 🌍 Real-Time Example

**E-commerce** filters: `?tag=red&tag=cotton`.

---

### Supplementary — **JSON Merge vs full replace**

### 🟢 Beginner Example

Document API semantics in OpenAPI.

### 🟡 Intermediate Example

PATCH handler merges shallow keys only.

### 🔴 Expert Example

RFC 7396 JSON Merge Patch with dedicated library.

### 🌍 Real-Time Example

**SaaS** tenant settings PATCH with audit trail.

---

### Supplementary — **Response `mimetype` vs `content_type`**

### 🟢 Beginner Example

```python
resp.mimetype = "text/plain"
```

### 🟡 Intermediate Example

```python
resp.headers["Content-Type"] = "text/plain; charset=utf-8"
```

### 🔴 Expert Example

Avoid conflicting charset declarations.

### 🌍 Real-Time Example

**Social** RSS feed: `application/rss+xml`.

---

### Supplementary — **ETag / conditional requests**

### 🟢 Beginner Example

```python
from flask import make_response

@app.get("/version")
def version():
    resp = make_response("v1")
    resp.set_etag("v1")
    return resp.make_conditional(request)
```

### 🟡 Intermediate Example

Combine with `Last-Modified`.

### 🔴 Expert Example

Cache static JSON catalogs at CDN with strong ETags.

### 🌍 Real-Time Example

**E-commerce** product catalog JSON behind CDN.

---

### Supplementary — **CORS (conceptual)**

### 🟢 Beginner Example

Use **Flask-CORS** in real apps rather than hand-rolling for every header.

### 🟡 Intermediate Example

```python
@app.after_request
def add_header(resp):
    resp.headers["Access-Control-Allow-Origin"] = "https://app.example"
    return resp
```

### 🔴 Expert Example

Credential requests require explicit origin, not `*`.

### 🌍 Real-Time Example

**SaaS** SPA on separate domain uses credentialed CORS for cookies.

---

### Supplementary — **JSONP warning**

### 🟢 Beginner Example

Avoid JSONP; use CORS.

### 🟡 Intermediate Example

If legacy requires JSONP, validate callback name charset strictly.

### 🔴 Expert Example

Rate-limit JSONP endpoints heavily.

### 🌍 Real-Time Example

**Old social widgets**—migrate to CORS fetch.

---

### Supplementary — **Request stream**

### 🟢 Beginner Example

```python
@app.post("/stream")
def stream_in():
    chunk = request.stream.read(1024)
    return {"read": len(chunk)}
```

### 🟡 Intermediate Example

Iterate without loading all into memory.

### 🔴 Expert Example

Line-delimited JSON ingestion.

### 🌍 Real-Time Example

**Analytics** ingestion endpoint.

---

### Supplementary — **Host header validation**

### 🟢 Beginner Example

Trust proxy headers only behind verified proxies.

### 🟡 Intermediate Example

```python
if request.host.split(":", 1)[0] not in {"api.example.com"}:
    return {"error": "bad_host"}, 400
```

### 🔴 Expert Example

Use `ProxyFix` middleware with careful `x_for` settings.

### 🌍 Real-Time Example

**SaaS** custom domains: validate Host against tenant mapping.

---

### Extended — **Multi-part form**

### 🟢 Beginner Example

```python
name = request.form.get("name")
avatar = request.files.get("avatar")
```

### 🟡 Intermediate Example

Validate both fields present.

### 🔴 Expert Example

Stream large files to disk/temp with `save()` and background processing.

### 🌍 Real-Time Example

**Social** post composer: text + media attachments.

---

### Extended — **Duplicate query keys**

### 🟢 Beginner Example

```python
tags = request.args.getlist("tag")
```

### 🟡 Intermediate Example

Normalize duplicates.

### 🔴 Expert Example

Cap list length to prevent abuse.

### 🌍 Real-Time Example

**E-commerce** search facets.

---

### Deep dive — **Custom JSON provider registration**

### 🟢 Beginner Example

Subclasses shown in section 6.

### 🟡 Intermediate Example

Register once in `create_app`.

### 🔴 Expert Example

Separate provider for admin vs public if needed (two apps).

### 🌍 Real-Time Example

**SaaS** redacts fields in public JSON provider.

---

### Deep dive — **Error handlers returning JSON**

### 🟢 Beginner Example

```python
@app.errorhandler(404)
def not_found(e):
    return {"error": "not_found"}, 404
```

### 🟡 Intermediate Example

```python
@app.errorhandler(400)
def bad_request(e):
    return {"error": "bad_request", "description": str(e)}, 400
```

### 🔴 Expert Example

RFC 7807 `application/problem+json`.

### 🌍 Real-Time Example

**Public API** clients parse stable error codes.

---

### Final four-level — **Webhook idempotency**

### 🟢 Beginner Example

```python
@app.post("/hooks")
def hooks():
    return {"received": True}
```

### 🟡 Intermediate Example

```python
@app.post("/hooks")
def hooks():
    key = request.headers.get("Idempotency-Key")
    return {"key": key}
```

### 🔴 Expert Example

Store idempotency keys in Redis with TTL.

### 🌍 Real-Time Example

**E-commerce** Stripe webhooks: dedupe by event id.

---

*End of Requests and Responses — Flask 3.1.3 learning notes.*
