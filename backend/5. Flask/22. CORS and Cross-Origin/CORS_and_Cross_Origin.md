# Flask 3.1.3 — CORS and Cross-Origin

This guide explains how browsers enforce the **Same-Origin Policy**, how **Cross-Origin Resource Sharing (CORS)** relaxes that policy safely, and how to configure **Flask 3.1.3** APIs (Python 3.9+) for single-page apps, mobile clients, and partner integrations. You will see patterns from **e-commerce checkouts**, **social feeds**, and **SaaS dashboards** so the theory maps directly to production APIs.

---

## 📑 Table of Contents

1. [22.1 CORS Basics](#221-cors-basics)
2. [22.2 Flask-CORS Extension](#222-flask-cors-extension)
3. [22.3 CORS Configuration](#223-cors-configuration)
4. [22.4 Advanced CORS](#224-advanced-cors)
5. [Best Practices](#best-practices)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
7. [Comparison Tables](#comparison-tables)

---

## 22.1 CORS Basics

### Same-Origin Policy

Browsers treat documents as **same-origin** only when **scheme**, **host**, and **port** match. `https://shop.example.com` and `https://api.shop.example.com` are **different origins**; JavaScript on the shop page cannot read responses from the API unless CORS allows it.

**🟢 Beginner Example — two “sites” on paper**

```python
# Conceptual: these URLs are different origins
SHOP_ORIGIN = "https://shop.example.com"      # port 443 implied
API_ORIGIN = "https://api.example.com:443"    # same port, different host → cross-origin
```

**🟡 Intermediate Example — Flask JSON API consumed by another subdomain**

```python
# api.example.com serves JSON; app.example.com runs React.
# Without CORS headers, fetch() from the browser fails after the response returns.
from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/api/health")
def health():
    return jsonify(ok=True)
```

**🔴 Expert Example — custom `Vary` and origin reflection pitfalls**

```python
# Never reflect arbitrary Origin into Access-Control-Allow-Origin without validation.
# Browsers cache preflight; wrong Vary can serve stale CORS to the wrong client.
from flask import Flask, request, jsonify

app = Flask(__name__)

ALLOWED = {"https://app.example.com", "https://admin.example.com"}

@app.get("/api/me")
def me():
    origin = request.headers.get("Origin")
    resp = jsonify(user="alice")
    if origin in ALLOWED:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    return resp
```

**🌍 Real-Time Example — SaaS embeddable widget**

A SaaS vendor hosts `widget.vendor.com` embedded in `customer.com` via iframe + `postMessage`, while API calls go to `api.vendor.com`. Same-origin policy blocks silent cross-origin reads; CORS explicitly whitelists `https://customer.com` for `fetch` from the widget bundle.

### Cross-Origin Requests

**Simple requests** (limited methods/headers) may proceed without preflight. **Non-simple** requests trigger an **OPTIONS preflight** the browser sends first.

**🟢 Beginner Example — “why did my fetch fail?”**

```text
Browser console: CORS policy: No 'Access-Control-Allow-Origin' header
```

**🟡 Intermediate Example — JSON POST from SPA**

```javascript
// From https://app.example.com calling https://api.example.com/v1/cart
fetch("https://api.example.com/v1/cart", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({sku: "SKU-1", qty: 2}),
});
```

**🔴 Expert Example — credentialed cross-site XHR**

```javascript
fetch("https://api.example.com/v1/orders", {
  credentials: "include", // sends cookies if allowed
});
```

**🌍 Real-Time Example — e-commerce mobile web + API**

Checkout on `m.shop.com` posts payment tokens to `payments.shop.com`. CORS must allow the storefront origin, expose any custom headers the PSP returns, and coordinate `credentials` with cookie `SameSite` policy.

### CORS Headers

Key response headers:

| Header | Role |
|--------|------|
| `Access-Control-Allow-Origin` | Which origin may read the response |
| `Access-Control-Allow-Methods` | Allowed verbs for preflight |
| `Access-Control-Allow-Headers` | Allowed request headers for preflight |
| `Access-Control-Allow-Credentials` | Whether cookies/Authorization may be sent |
| `Access-Control-Expose-Headers` | Which response headers JS may read |
| `Access-Control-Max-Age` | Preflight cache duration |

**🟢 Beginner Example — minimal allow-all (dev only)**

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.after_request
def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp

@app.get("/ping")
def ping():
    return jsonify(ping="pong")
```

**🟡 Intermediate Example — echo allowed methods**

```python
@app.after_request
def cors_methods(resp):
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp
```

**🔴 Expert Example — expose rate-limit headers to SPA**

```python
@app.after_request
def expose_headers(resp):
    resp.headers["Access-Control-Expose-Headers"] = "X-RateLimit-Remaining, X-Request-Id"
    return resp
```

**🌍 Real-Time Example — social media API**

A social client reads `X-RateLimit-Remaining` and `X-Request-Id` for UX and support tickets; without `Expose-Headers`, those values are invisible to `fetch().headers` in the browser.

### Preflight Requests

Preflight is an **OPTIONS** request with:

- `Access-Control-Request-Method`
- `Access-Control-Request-Headers` (if non-simple headers)

Your server must answer **200** with matching allow headers.

**🟢 Beginner Example — manual OPTIONS**

```python
from flask import Flask, request, make_response

app = Flask(__name__)

@app.route("/api/posts", methods=["OPTIONS"])
def posts_preflight():
    if request.method == "OPTIONS":
        r = make_response("", 204)
        r.headers["Access-Control-Allow-Origin"] = "https://feed.example.com"
        r.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        r.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return r
```

**🟡 Intermediate Example — Flask route sharing GET/POST + OPTIONS**

```python
@app.route("/api/posts", methods=["GET", "POST", "OPTIONS"])
def posts():
    if request.method == "OPTIONS":
        return ("", 204)
    # ... real handlers
```

**🔴 Expert Example — caching preflight aggressively**

```python
r.headers["Access-Control-Max-Age"] = "600"  # 10 minutes; tune per deployment
```

**🌍 Real-Time Example — SaaS admin with custom headers**

Admin UI sends `X-Tenant-Id` and `Authorization: Bearer ...`. Preflight lists both in `Access-Control-Request-Headers`; API must allow them or the browser blocks the real request.

### CORS Errors

Typical causes: missing allow origin, `credentials: true` with `*`, wrong preflight response, redirects stripping CORS, mismatched `Vary`.

**🟢 Beginner Example — wildcard + credentials**

```text
Error: credentialed requests cannot use '*'
```

**🟡 Intermediate Example — redirect chain**

```python
# HTTP→HTTPS redirect on API can drop CORS on the first hop if proxy misconfigured
```

**🔴 Expert Example — CDN caching anonymous ACAO**

```text
CDN caches response with ACAO for site A; site B receives wrong ACAO → browser error
```

**🌍 Real-Time Example — e-commerce partner portal**

Partner `portal.partner.com` calls `api.retailer.com`. Misconfigured nginx adds CORS only on `200`, not on `4xx`, so error JSON is unreadable by JS—fix by applying CORS headers on all API responses.

---

## 22.2 Flask-CORS Extension

### Installing Flask-CORS

```bash
pip install flask-cors
```

Pin versions in production (`requirements.txt`).

**🟢 Beginner Example — requirements snippet**

```text
Flask==3.1.3
flask-cors>=5.0.0
```

**🟡 Intermediate Example — virtualenv**

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install Flask==3.1.3 flask-cors
```

**🔴 Expert Example — reproducible lock**

```bash
pip install pip-tools
# compile locked deps for CI
```

**🌍 Real-Time Example — Docker image**

Multi-stage build installs deps in builder; runtime image only contains wheels—CORS extension version pinned for supply-chain audit.

### CORS Configuration

**🟢 Beginner Example — enable for entire app**

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # development convenience; tighten in production

@app.get("/api/items")
def items():
    return {"items": []}
```

**🟡 Intermediate Example — specific origins**

```python
CORS(app, resources={r"/api/*": {"origins": ["https://app.example.com"]}})
```

**🔴 Expert Example — per-resource options**

```python
CORS(
    app,
    resources={
        r"/api/public/*": {"origins": "*"},
        r"/api/private/*": {
            "origins": ["https://app.example.com"],
            "supports_credentials": True,
        },
    },
)
```

**🌍 Real-Time Example — SaaS multi-tenant admin**

Public marketing site uses open read-only endpoints; tenant consoles use credentialed CORS only for verified tenant subdomains.

### Route-Level CORS

**🟢 Beginner Example — decorator**

```python
from flask_cors import cross_origin

@app.get("/api/status")
@cross_origin(origins=["https://status.example.com"])
def status():
    return {"up": True}
```

**🟡 Intermediate Example — blueprint**

```python
from flask import Blueprint

bp = Blueprint("public", __name__, url_prefix="/public")

@bp.get("/announcements")
@cross_origin(origins=["*"])
def announcements():
    return {"msg": "sale"}
```

**🔴 Expert Example — combining app + route CORS**

```python
# App-level defaults; sensitive routes override stricter
```

**🌍 Real-Time Example — social “embed” endpoint**

`/embed/oembed` allows `*` for publishers; `/api/user` stays locked to first-party SPA.

### Application-Level CORS

**🟢 Beginner Example — `CORS(app)` after factory**

```python
def create_app():
    app = Flask(__name__)
    CORS(app, origins=["https://app.example.com"])
    return app
```

**🟡 Intermediate Example — config-driven**

```python
app.config["CORS_ORIGINS"] = ["https://app.example.com"]

def create_app():
    app = Flask(__name__)
    CORS(app, origins=app.config["CORS_ORIGINS"])
    return app
```

**🔴 Expert Example — lazy init with extensions pattern**

```python
from flask_cors import CORS

cors = CORS()

def create_app():
    app = Flask(__name__)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    return app
```

**🌍 Real-Time Example — e-commerce monolith**

Single Flask app serves BFF for web, mobile, and POS tablets; CORS origins loaded from secrets manager per environment.

### Custom Configuration

**🟢 Beginner Example — allow headers**

```python
CORS(app, allow_headers=["Content-Type", "Authorization"])
```

**🟡 Intermediate Example — methods + max age**

```python
CORS(app, methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
     max_age=600)
```

**🔴 Expert Example — automatic options + manual hooks**

```python
CORS(app, automatic_options=True)
```

**🌍 Real-Time Example — enterprise API gateway**

Flask behind gateway still emits CORS for direct browser hits; custom `expose_headers` lists observability headers approved by security.

---

## 22.3 CORS Configuration

### allowed_origins

**🟢 Beginner Example**

```python
CORS(app, origins="https://app.example.com")
```

**🟡 Intermediate Example — list**

```python
CORS(app, origins=[
    "https://app.example.com",
    "https://staging-app.example.com",
])
```

**🔴 Expert Example — environment split**

```python
import os

ORIGINS = os.environ["CORS_ORIGINS"].split(",")
CORS(app, origins=ORIGINS)
```

**🌍 Real-Time Example — e-commerce regional storefronts**

`https://us.shop.com`, `https://eu.shop.com` share one API; origins list maintained in infra-as-code.

### allowed_methods

**🟢 Beginner Example**

```python
CORS(app, methods=["GET", "POST"])
```

**🟡 Intermediate Example — RESTful SaaS**

```python
CORS(app, methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
```

**🔴 Expert Example — read-only partner API**

```python
CORS(app, resources={r"/partner/*": {"methods": ["GET", "OPTIONS"]}})
```

**🌍 Real-Time Example — social read replicas**

Public feed CDN hits `GET` only; write endpoints on separate subdomain with stricter CORS.

### allowed_headers

**🟢 Beginner Example**

```python
CORS(app, allow_headers=["Content-Type"])
```

**🟡 Intermediate Example — API keys + tenant**

```python
CORS(app, allow_headers=["Content-Type", "Authorization", "X-Tenant-Id"])
```

**🔴 Expert Example — regex / dynamic allow list**

```python
# flask-cors supports vary; validate custom headers in app logic too
CORS(app, allow_headers=["X-Requested-With", "X-CSRF-Token"])
```

**🌍 Real-Time Example — SaaS feature flags header**

Clients send `X-Feature-Flags`; preflight must list it explicitly.

### allow_credentials

**🟢 Beginner Example**

```python
CORS(app, supports_credentials=True, origins=["https://app.example.com"])
```

**🟡 Intermediate Example — Flask session cookie**

```python
# Session cookie + fetch(..., credentials: 'include')
from flask import session

@app.post("/api/login")
def login():
    session["uid"] = 1
    return {"ok": True}
```

**🔴 Expert Example — `SameSite=None; Secure` requirement**

```python
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_HTTPONLY=True,
)
```

**🌍 Real-Time Example — e-commerce saved carts**

Cross-subdomain session for `shop` and `checkout` requires coordinated cookie attributes **and** credentialed CORS—not `*`.

### expose_headers

**🟢 Beginner Example**

```python
CORS(app, expose_headers=["X-Request-Id"])
```

**🟡 Intermediate Example — pagination**

```python
CORS(app, expose_headers=["X-Total-Count", "Link"])
```

**🔴 Expert Example — custom warning headers**

```python
CORS(app, expose_headers=["Deprecation", "Sunset", "X-RateLimit-Reset"])
```

**🌍 Real-Time Example — SaaS API deprecation**

SPAs read `Sunset` to show banners; must be exposed.

---

## 22.4 Advanced CORS

### Regex Patterns

**🟢 Beginner Example — conceptual**

```python
# Match *.example.com in logic before setting ACAO
import re

ORIGIN_RE = re.compile(r"^https://[a-z0-9-]+\.example\.com$")
```

**🟡 Intermediate Example — dynamic validation**

```python
from flask import request, jsonify

def allow_origin(origin: str) -> bool:
    return bool(ORIGIN_RE.match(origin)) if origin else False

@app.get("/api/data")
def data():
    origin = request.headers.get("Origin", "")
    resp = jsonify(data=[])
    if allow_origin(origin):
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    return resp
```

**🔴 Expert Example — combine regex + cache**

```python
# Cache per-tenant subdomain validation in Redis with TTL
```

**🌍 Real-Time Example — SaaS customer subdomains**

`https://acme.saas.com`, `https://contoso.saas.com` validated by regex against registered tenant hostnames.

### Dynamic Origins

**🟢 Beginner Example — config reload**

```python
def get_origins():
    return app.config["CORS_ORIGINS"]

CORS(app, origins=get_origins)  # if supported by version; else wrap init_app
```

**🟡 Intermediate Example — database-backed**

```python
# Pseudocode: load allowed partner origins from DB on startup + refresh job
```

**🔴 Expert Example — signed registration**

```python
# Partners register callback origins; admin approves; audit log entry
```

**🌍 Real-Time Example — e-commerce affiliate widgets**

Each affiliate subdomain whitelisted after KYC; dynamic list avoids static deploy per partner.

### Credential Sharing

**🟢 Beginner Example — cannot use `*` with credentials**

```python
CORS(app, supports_credentials=True, origins=["https://app.example.com"])
```

**🟡 Intermediate Example — token in HttpOnly cookie**

```python
# Prefer HttpOnly cookies over localStorage for XSS resilience
```

**🔴 Expert Example — double cookie submit pattern**

```python
# CSRF token cookie + header; SameSite=Lax/Strict where possible
```

**🌍 Real-Time Example — social SSO**

OIDC callback on API domain sets session; SPA on another subdomain uses credentialed `fetch`.

### Custom Headers

**🟢 Beginner Example**

```python
CORS(app, allow_headers=["X-Client-Version"])
```

**🟡 Intermediate Example — tracing**

```python
CORS(app, allow_headers=["traceparent", "tracestate"])
```

**🔴 Expert Example — W3C trace context + baggage**

```python
CORS(app, allow_headers=["traceparent", "tracestate", "baggage"])
```

**🌍 Real-Time Example — distributed SaaS**

Browser sends `traceparent`; API propagates to workers; support correlates user session with traces.

### Monitoring CORS Issues

**🟢 Beginner Example — log preflight**

```python
@app.before_request
def log_preflight():
    if request.method == "OPTIONS":
        app.logger.info("preflight %s %s", request.path, request.headers.get("Origin"))
```

**🟡 Intermediate Example — metrics**

```python
# Increment counter: cors_preflight_total{path="/api/orders"}
```

**🔴 Expert Example — RUM correlation**

```python
# Frontend reports CORS failures with X-Request-Id from gateway if any
```

**🌍 Real-Time Example — e-commerce Black Friday**

Spike in failed preflights from typo’d staging origin caught via alerts; rollback bad CDN config.

---

## Best Practices

1. **Never use `Access-Control-Allow-Origin: *` with credentials** in production.
2. **Prefer explicit origin lists** or validated dynamic origins over wildcards.
3. **Set `Vary: Origin`** when reflecting origins to avoid cache poisoning.
4. **Apply CORS on error responses** (4xx/5xx) so clients can parse JSON errors.
5. **Keep preflight fast**—avoid heavy middleware on `OPTIONS`.
6. **Document required headers** for API consumers (OpenAPI).
7. **Align cookie `SameSite`/`Secure`** with your CORS and subdomain layout.
8. **Test with real browsers**—curl alone does not run SOP/CORS logic.

---

## Common Mistakes to Avoid

| Mistake | Why it hurts |
|---------|----------------|
| Reflecting raw `Origin` header | Opens cross-origin data theft |
| Forgetting `OPTIONS` on blueprints | Random 405/404 preflight failures |
| CORS only on success paths | Clients cannot read validation errors |
| Assuming Postman behavior == browser | Postman ignores SOP |
| Using `*` for private APIs | Any site can read responses in the browser |
| Ignoring CDN caches | Stale ACAO headers across tenants |
| Mixing HTTP/HTTPS origins in prod | Cookies and mixed content break flows |

---

## Comparison Tables

### Simple vs Preflight Request

| Aspect | Simple | Preflight |
|--------|--------|-----------|
| Methods | GET, HEAD, POST (limited) | PUT, PATCH, DELETE, custom |
| Headers | Limited set | Custom auth, JSON content-type often triggers |
| Browser sends OPTIONS | No | Yes |
| Server must allow methods/headers | Less strict | Must match |

### Manual CORS vs Flask-CORS

| Approach | Pros | Cons |
|----------|------|------|
| Manual headers | Full control, minimal deps | Easy to get wrong, repetitive |
| Flask-CORS | Fast setup, patterns | Must understand what it generates |

### Credential Modes

| Mode | Cookies sent | ACAO |
|------|--------------|------|
| `omit` | No | can be `*` |
| `same-origin` | Only same origin | N/A for cross-origin |
| `include` | If allowed | Specific origin + `Allow-Credentials: true` |

---

## Further Reading (Flask 3.1.3 + ecosystem)

- Flask 3.x continues Werkzeug’s request/response model; CORS remains **pure HTTP headers**—framework agnostic.
- Pair CORS with **CSRF** strategies when using cookies across sites.
- For **server-to-server** calls, CORS does not apply—use mTLS or API keys instead.

---

## Appendix A — End-to-End E-Commerce Checkout CORS

**🟢 Beginner Example — single SPA + API**

```text
Origin: https://shop.example.com
API:    https://api.example.com
Need:   ACAO = https://shop.example.com on all /v1/checkout/* responses
```

**🟡 Intermediate Example — Flask blueprint**

```python
from flask import Blueprint
from flask_cors import CORS

checkout_bp = Blueprint("checkout", __name__, url_prefix="/v1/checkout")

@checkout_bp.post("/session")
def create_session():
    return {"client_secret": "sec_..."}
```

```python
# In app factory
CORS(checkout_bp, origins=["https://shop.example.com"], supports_credentials=True)
app.register_blueprint(checkout_bp)
```

**🔴 Expert Example — split read/write CORS**

```python
CORS(
    app,
    resources={
        r"/v1/checkout/session": {
            "origins": ["https://shop.example.com"],
            "methods": ["POST", "OPTIONS"],
            "supports_credentials": True,
            "allow_headers": ["Content-Type", "X-Idempotency-Key"],
            "expose_headers": ["X-Request-Id"],
        },
        r"/v1/catalog/*": {"origins": "*", "methods": ["GET", "OPTIONS"]},
    },
)
```

**🌍 Real-Time Example — 3DS and payment redirects**

Payment flows bounce through issuer pages; returning to `shop` must still call `api` with same session cookie. Cookie domain `.example.com`, `Secure`, `SameSite=None`, strict CORS on `api`, and **no** `*` ACAO.

---

## Appendix B — Social Feed: Media Uploads and CORS

**🟢 Beginner Example**

```javascript
// Upload from https://app.social.com to https://uploads.social.com
const fd = new FormData();
fd.append("file", fileInput.files[0]);
fetch("https://uploads.social.com/v1/media", {method: "POST", body: fd});
```

**🟡 Intermediate Example — Flask presigned URL (no CORS on API)**

```python
# Often better: browser PUTs directly to object storage; CORS on bucket CORS policy
@app.post("/v1/media/upload-url")
def upload_url():
    return {"url": "https://storage.example/bucket/key?sig=...", "method": "PUT"}
```

**🔴 Expert Example — dual CORS surfaces**

```text
API CORS for JSON metadata; S3 CORS for binary PUT; align AllowedOrigin lists.
```

**🌍 Real-Time Example — abuse prevention**

Rate limit by IP + user; block origins not belonging to verified apps; log rejected preflights.

---

## Appendix C — SaaS Multi-Region and CDN

**🟢 Beginner Example**

```text
CDN edge caches GET /v1/plans — include Vary: Origin or disable cache for personalized JSON
```

**🟡 Intermediate Example — CloudFront behavior**

```text
Forward Origin header; cache key includes Origin when ACAO varies
```

**🔴 Expert Example — stale ACAO incident runbook**

```text
1) Purge CDN path /v1/*
2) Verify Flask emits Vary: Origin
3) Validate surrogate-key purges on tenant allowlist changes
```

**🌍 Real-Time Example**

Enterprise customers with IP allowlists still use browsers from corporate proxies; CORS remains origin-based—do not conflate with network ACLs.

---

## Appendix D — Security Checklist (CORS + Related Controls)

| Control | CORS relation |
|---------|----------------|
| CSP `connect-src` | Limits which APIs fetch/XHR may call |
| CSRF tokens | Needed when cookies authenticate cross-site writes |
| OIDC implicit vs code flow | Impacts token storage and CORS surfaces |
| Subresource Integrity | Protects CDN-delivered JS that performs fetch |

**🟢 Beginner Example — CSP header**

```python
@app.after_request
def csp(resp):
    resp.headers["Content-Security-Policy"] = "default-src 'self'; connect-src 'self' https://api.example.com"
    return resp
```

**🟡 Intermediate Example — tighten over time**

```python
# Start report-only, then enforce
resp.headers["Content-Security-Policy-Report-Only"] = "connect-src 'self'"
```

**🔴 Expert Example — nonce-based CSP for inline**

```python
# Prefer hashes/nonce; avoid unsafe-inline for script-src
```

**🌍 Real-Time Example — SaaS embed SDK**

Third-party sites load `sdk.js` from `cdn.vendor.com` calling `api.vendor.com`; CSP on host page must allow both or SDK fails—document required directives for customers.

---

## Appendix E — Flask 3.1.3 Notes

Flask 3.1.3 builds on Werkzeug 3.x and continues the **application context** and **blueprint** model unchanged for CORS purposes. Use **application factories** so tests can swap `TESTING` config and disable CORS or restrict origins. The **typed** view improvements in modern Flask do not alter CORS—headers remain on `Response` objects.

**🟢 Beginner Example — testing without CORS**

```python
import pytest
from myapp import create_app

@pytest.fixture()
def client():
    app = create_app({"TESTING": True, "CORS_ORIGINS": []})
    return app.test_client()
```

**🟡 Intermediate Example — assert ACAO**

```python
def test_orders_cors(client):
    r = client.get("/api/orders", headers={"Origin": "https://app.example.com"})
    assert r.headers.get("Access-Control-Allow-Origin") == "https://app.example.com"
```

**🔴 Expert Example — preflight integration test**

```python
def test_preflight_cart(client):
    r = client.open(
        "/api/cart",
        method="OPTIONS",
        headers={
            "Origin": "https://app.example.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert r.status_code in (200, 204)
    assert "POST" in r.headers.get("Access-Control-Allow-Methods", "")
```

**🌍 Real-Time Example — contract tests in CI**

Pact or OpenAPI-backed tests verify browser clients see required CORS headers on every documented path.

---

## Appendix F — Quick Reference: Header Cookbook

```python
from flask import make_response, jsonify

def cors_json(data, *, origin: str, credentials: bool = False):
    resp = make_response(jsonify(data), 200)
    resp.headers["Access-Control-Allow-Origin"] = origin
    if credentials:
        resp.headers["Access-Control-Allow-Credentials"] = "true"
    resp.headers["Vary"] = "Origin"
    return resp
```

**🟢 Beginner Example — use**

```python
return cors_json({"ok": True}, origin="https://app.example.com")
```

**🟡 Intermediate Example — error JSON with CORS**

```python
def error_json(code, message, origin):
    resp = make_response(jsonify(error=message), code)
    resp.headers["Access-Control-Allow-Origin"] = origin
    resp.headers["Vary"] = "Origin"
    return resp
```

**🔴 Expert Example — wrap `abort()`**

```python
from werkzeug.exceptions import HTTPException

@app.errorhandler(HTTPException)
def handle_http(e):
    origin = request.headers.get("Origin", "")
    resp = e.get_response()
    # attach JSON body + CORS if API path
    return resp
```

**🌍 Real-Time Example — unified error envelope**

SaaS APIs return `{code, message, request_id}` for all errors with consistent CORS so SPAs can show toasts.

---

*Notes version: Flask **3.1.3**, Python **3.9+**, February 2026 release line.*
