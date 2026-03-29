# Flask 3.1.3 — Cookies and Sessions

Cookies and sessions are how Flask applications remember browsers across requests. This guide covers **client-side cookies** (`response.set_cookie`, `request.cookies`), **configuration** (lifetime, domain, path, `HttpOnly`, `Secure`), **server-side session** (`session` dict backed by signing), **security** (fixation, CSRF, encryption patterns), and **advanced storage** (Redis, databases, custom interfaces) for e-commerce carts, social logins, and multi-tenant SaaS.

---

## 📑 Table of Contents

1. [16.1 Cookies](#161-cookies)
2. [16.2 Cookie Configuration](#162-cookie-configuration)
3. [16.3 Session Management](#163-session-management)
4. [16.4 Session Security](#164-session-security)
5. [16.5 Advanced Session Features](#165-advanced-session-features)
6. [Best Practices](#best-practices-summary)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
8. [Comparison Tables](#comparison-tables)

---

## 16.1 Cookies

Flask exposes cookies through **`response.set_cookie`** and **`request.cookies`**. Cookies are sent by the browser on subsequent requests that match domain, path, and scheme rules.

### 16.1.1 Creating Cookies

Attach cookies on the **Response** object returned from the view (or `make_response`).

#### 🟢 Beginner Example

```python
from flask import Flask, make_response

app = Flask(__name__)

@app.get("/welcome")
def welcome():
    resp = make_response("OK")
    resp.set_cookie("visited", "yes")
    return resp
```

#### 🟡 Intermediate Example

```python
from flask import Flask, jsonify, make_response

app = Flask(__name__)

@app.post("/preferences/theme")
def set_theme():
    data = jsonify(ok=True)
    resp = make_response(data, 200)
    resp.set_cookie("theme", "dark", max_age=60 * 60 * 24 * 365)
    return resp
```

#### 🔴 Expert Example

```python
from flask import Flask, Response

app = Flask(__name__)

def attach_anon_id(resp: Response) -> Response:
    if not request.cookies.get("anon_id"):  # noqa: F821
        resp.set_cookie(
            "anon_id",
            value=secrets.token_urlsafe(16),
            max_age=60 * 60 * 24 * 400,
            secure=True,
            httponly=True,
            samesite="Lax",
        )
    return resp
```

#### 🌍 Real-Time Example (E-Commerce A/B Segment)

```python
from flask import Flask, redirect, url_for

app = Flask(__name__)

@app.get("/experiments/assign")
def assign():
    variant = pick_variant_for_user()  # noqa: F821
    resp = redirect(url_for("home"))
    resp.set_cookie("exp_checkout", variant, max_age=86400 * 30, samesite="Lax")
    return resp
```

### 16.1.2 Reading Cookies

Use **`request.cookies.get("name", default)`** to avoid `KeyError`.

#### 🟢 Beginner Example

```python
from flask import Flask, request

app = Flask(__name__)

@app.get("/hello")
def hello():
    name = request.cookies.get("name", "Guest")
    return f"Hello, {name}"
```

#### 🟡 Intermediate Example

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.get("/api/context")
def context():
    return jsonify(
        theme=request.cookies.get("theme", "light"),
        locale=request.cookies.get("locale", "en"),
    )
```

#### 🔴 Expert Example

```python
from werkzeug.http import parse_cookie

@app.get("/debug/cookies")
def debug_cookies():
    # Rarely needed; prefer request.cookies
    raw = request.headers.get("Cookie", "")
    return {"raw_len": len(raw), "parsed": dict(request.cookies)}
```

#### 🌍 Real-Time Example (Social Media: Referral Attribution)

```python
@app.before_request
def capture_ref():
    ref = request.args.get("ref")
    if ref:
        g.pending_ref = ref  # noqa: F821

@app.after_request
def persist_ref(resp):
    if getattr(g, "pending_ref", None):
        resp.set_cookie("ref_code", g.pending_ref, max_age=86400 * 14, samesite="Lax")
    return resp
```

### 16.1.3 Cookie Parameters

Key parameters: **`key`**, **`value`**, **`max_age`**, **`expires`**, **`path`**, **`domain`**, **`secure`**, **`httponly`**, **`samesite`**.

#### 🟢 Beginner Example

```python
resp.set_cookie("flag", "1", path="/")
```

#### 🟡 Intermediate Example

```python
resp.set_cookie(
    "session_token",
    token,
    max_age=3600,
    path="/app",
    httponly=True,
    secure=True,
    samesite="Strict",
)
```

#### 🔴 Expert Example

```python
# Partitioned attribute (CHIPS) for embedded contexts — set via Werkzeug if supported
resp.set_cookie(
    "widget_state",
    state,
    samesite="None",
    secure=True,
    path="/",
)
```

#### 🌍 Real-Time Example (SaaS Embedded Widget)

```python
# Third-party iframe: SameSite=None; Secure required
resp.set_cookie("embed_ctx", signed_blob, samesite="None", secure=True, httponly=True)
```

### 16.1.4 Cookie Deletion

Set **`max_age=0`** or **`expires` in the past** with the same **path** and **domain** as creation.

#### 🟢 Beginner Example

```python
resp.set_cookie("temp", "", expires=0)
```

#### 🟡 Intermediate Example

```python
resp.delete_cookie("session_token", path="/app", domain=".example.com")
```

#### 🔴 Expert Example

```python
from datetime import datetime, timezone

resp.set_cookie(
    "legacy_auth",
    "",
    expires=datetime(1970, 1, 1, tzinfo=timezone.utc),
    path="/",
    domain="app.example.com",
)
```

#### 🌍 Real-Time Example (E-Commerce Logout)

```python
@app.post("/logout")
def logout():
    resp = redirect(url_for("home"))
    resp.delete_cookie("cart_hint", path="/")
    session.clear()
    return resp
```

### 16.1.5 Secure Cookies

Always use **`Secure`** on HTTPS; prefer **`HttpOnly`** for tokens that JS must not read; choose **`SameSite`** based on cross-site needs.

#### 🟢 Beginner Example

```python
app.config["SESSION_COOKIE_SECURE"] = True  # production HTTPS
```

#### 🟡 Intermediate Example

```python
resp.set_cookie("csrf_token", value, httponly=False, samesite="Lax", secure=True)
```

#### 🔴 Expert Example

```python
# __Host- prefix cookies: path=/, Secure, no Domain — strongest for session IDs
resp.set_cookie(
    "__Host-sid",
    session_id,
    secure=True,
    httponly=True,
    path="/",
    samesite="Strict",
)
```

#### 🌍 Real-Time Example (Banking / High-Assurance SaaS)

```python
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Strict",
    PERMANENT_SESSION_LIFETIME=timedelta(minutes=15),
)
```

---

## 16.2 Cookie Configuration

Tune **expiration**, **domain** scoping, **path** visibility, **HttpOnly**, and **Secure** to balance UX and security.

### 16.2.1 Expiration Time

**`max_age`** (seconds from now) is easier than **`expires`** (absolute HTTP-date).

#### 🟢 Beginner Example

```python
resp.set_cookie("remember", "1", max_age=60 * 60 * 24 * 7)
```

#### 🟡 Intermediate Example

```python
from datetime import datetime, timedelta, timezone

expires = datetime.now(timezone.utc) + timedelta(days=30)
resp.set_cookie("newsletter", "subscribed", expires=expires)
```

#### 🔴 Expert Example

```python
# Sliding expiration: refresh on activity
@app.before_request
def touch_session():
    session.modified = True
```

#### 🌍 Real-Time Example (SaaS “Remember this device”)

```python
if form.remember_device:
    resp.set_cookie("device_trust", trust_token, max_age=86400 * 90, secure=True, httponly=True)
```

### 16.2.2 Domain

**`domain=".example.com"`** shares cookies across subdomains; omit for host-only cookies (stricter).

#### 🟢 Beginner Example

```python
# Host-only (default): visible only to exactly www.example.com
resp.set_cookie("host_only", "1")
```

#### 🟡 Intermediate Example

```python
resp.set_cookie("sso", token, domain=".example.com", secure=True)
```

#### 🔴 Expert Example

```python
# Never set Domain for public suffixes; browsers reject invalid domains
# Validate against PSL in multi-tenant custom domains
```

#### 🌍 Real-Time Example (E-Commerce Multi-Subdomain)

```python
# `www.` and `api.` share `cart_id` cookie
resp.set_cookie("cart_id", cid, domain=".shop.example", path="/", samesite="Lax")
```

### 16.2.3 Path

Restrict cookies to **`/api/`** vs **`/`** to limit exposure.

#### 🟢 Beginner Example

```python
resp.set_cookie("admin_pref", "compact", path="/admin")
```

#### 🟡 Intermediate Example

```python
# Marketing site at / and app at /app — separate cookies
resp.set_cookie("app_beta", "on", path="/app")
```

#### 🔴 Expert Example

```python
# Deleting cookie must match path
resp.delete_cookie("app_beta", path="/app")
```

#### 🌍 Real-Time Example (Social: Separate API Cookie)

```python
resp.set_cookie("api_csrf", csrf, path="/api", samesite="Strict")
```

### 16.2.4 HTTP Only

**`httponly=True`** blocks `document.cookie` access — mitigates XSS token theft.

#### 🟢 Beginner Example

```python
resp.set_cookie("sid", session_id, httponly=True)
```

#### 🟡 Intermediate Example

```python
# CSRF double-submit cookie often MUST be readable by JS — httponly=False
resp.set_cookie("csrf", csrf, httponly=False, samesite="Strict")
```

#### 🔴 Expert Example

```python
# Split: HttpOnly refresh + non-HttpOnly CSRF is common in SPAs with caution
```

#### 🌍 Real-Time Example (SaaS SPA + Flask API)

```python
resp.set_cookie("refresh", refresh_jwt, httponly=True, secure=True, path="/api/auth")
```

### 16.2.5 Secure Flag

**`secure=True`** sends cookie only over HTTPS.

#### 🟢 Beginner Example

```python
if not app.debug:
    kwargs["secure"] = True
```

#### 🟡 Intermediate Example

```python
from werkzeug.middleware.proxy_fix import ProxyFix

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1)
# Trust X-Forwarded-Proto so url_for/_scheme correct behind TLS terminator
```

#### 🔴 Expert Example

```python
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("FLASK_ENV") == "production"
```

#### 🌍 Real-Time Example (E-Commerce Behind CDN)

```python
# Ensure Flask sees HTTPS so Secure cookies work
app.config["PREFERRED_URL_SCHEME"] = "https"
```

---

## 16.3 Session Management

Flask’s **`session`** is a **signed** cookie serializer by default (not encrypted). It requires **`SECRET_KEY`**.

### 16.3.1 Session Basics

Import **`session`** from Flask; it behaves like a dict.

#### 🟢 Beginner Example

```python
from flask import Flask, session

app = Flask(__name__)
app.secret_key = "change-me"

@app.get("/count")
def count():
    session["n"] = session.get("n", 0) + 1
    return str(session["n"])
```

#### 🟡 Intermediate Example

```python
from flask import Flask, session, redirect, url_for, request

app = Flask(__name__)
app.secret_key = "dev"

@app.post("/login")
def login():
    session["user_id"] = authenticate(request.form)  # noqa: F821
    return redirect(url_for("home"))
```

#### 🔴 Expert Example

```python
from flask import Flask, session
from datetime import timedelta

app = Flask(__name__)
app.secret_key = os.environ["SECRET_KEY"]
app.permanent_session_lifetime = timedelta(hours=8)

@app.post("/login")
def login():
    session.permanent = True
    session["user_id"] = uid
    return {"ok": True}
```

#### 🌍 Real-Time Example (Social: Onboarding State)

```python
session["onboarding_step"] = session.get("onboarding_step", 0) + 1
```

### 16.3.2 Session Storage

Default: **client cookie** via `SecureCookieSessionInterface`. Alternatives: **server-side** with Redis/DB.

#### 🟢 Beginner Example

```python
# Default — data in cookie, signed with SECRET_KEY
print(app.session_interface)  # SecureCookieSessionInterface
```

#### 🟡 Intermediate Example

```python
# Flask-Session: SERVER_SIDE session store
# SESSION_TYPE = "redis"
```

#### 🔴 Expert Example

```python
from flask.sessions import SecureCookieSessionInterface

class LenLimitedSessionInterface(SecureCookieSessionInterface):
    def open_session(self, app, request):
        s = super().open_session(app, request)
        # enforce max serialized size
        return s
```

#### 🌍 Real-Time Example (SaaS Large Tenant Context)

```python
# Store only ids in cookie session; load heavy ACL from Redis per request
session["tenant_id"] = tid
```

### 16.3.3 Session Creation

Session starts when **`session`** is modified; cookie set on response.

#### 🟢 Beginner Example

```python
session["cart"] = []
```

#### 🟡 Intermediate Example

```python
if "csrf" not in session:
    session["csrf"] = secrets.token_hex(16)
```

#### 🔴 Expert Example

```python
@app.before_request
def ensure_session():
    session.setdefault("device_fingerprint_checked", False)
```

#### 🌍 Real-Time Example (E-Commerce Guest Cart)

```python
if "guest_cart_id" not in session:
    session["guest_cart_id"] = str(uuid.uuid4())
```

### 16.3.4 Session Modification

Flask detects mutation of **mutable** values only if you reassign or set **`session.modified = True`**.

#### 🟢 Beginner Example

```python
session["role"] = "admin"
```

#### 🟡 Intermediate Example

```python
cart = session.get("cart", [])
cart.append(item_id)
session["cart"] = cart
```

#### 🔴 Expert Example

```python
d = session.get("flags", {})
d["beta"] = True
session["flags"] = d
session.modified = True
```

#### 🌍 Real-Time Example (Social Notification Preferences)

```python
prefs = session.get("notif_prefs", {})
prefs["mentions"] = False
session["notif_prefs"] = prefs
```

### 16.3.5 Session Destruction

**`session.clear()`** removes keys; **`logout`** should also rotate identifiers.

#### 🟢 Beginner Example

```python
session.clear()
```

#### 🟡 Intermediate Example

```python
session.pop("user_id", None)
session.pop("csrf", None)
```

#### 🔴 Expert Example

```python
# Regenerate session id server-side when using server-side stores
# flask-session: session.clear() + new sid
```

#### 🌍 Real-Time Example (SaaS Account Switch)

```python
session.clear()
session["user_id"] = new_user_id
session["tenant_id"] = new_tenant_id
```

---

## 16.4 Session Security

Protect **integrity** (signing), **confidentiality** (encryption if needed), **CSRF**, **fixation**, and **lifecycle**.

### 16.4.1 Session Signing

Default interface **signs** with `itsdangerous`; changing **`SECRET_KEY`** invalidates all sessions.

#### 🟢 Beginner Example

```python
app.secret_key = os.environ["SECRET_KEY"]
```

#### 🟡 Intermediate Example

```python
app.config["SECRET_KEY_FALLBACKS"] = [old_key]  # rotate keys gracefully when configured
```

#### 🔴 Expert Example

```python
# Key rotation: accept old signatures briefly via SECRET_KEY_FALLBACKS (Flask supports)
```

#### 🌍 Real-Time Example (E-Commerce Zero-Downtime Rotate)

```python
# Deploy with new SECRET_KEY + old in FALLBACKS; next deploy drop old
```

### 16.4.2 Session Encryption

Cookie sessions are **not encrypted** — anyone with cookie can read payload (but not forge without key). Put secrets server-side only.

#### 🟢 Beginner Example

```python
# BAD: session["credit_card"] = "4111..."
```

#### 🟡 Intermediate Example

```python
session["payment_method_id"] = "pm_abc"  # opaque id only
```

#### 🔴 Expert Example

```python
# Use server-side session store + TLS for confidentiality in transit
```

#### 🌍 Real-Time Example (SaaS PII)

```python
session["user_id"] = user.id  # never store raw PII in client session blob
```

### 16.4.3 CSRF Protection

Use **Flask-WTF** `CSRFProtect` or **double-submit** cookie + header for state-changing requests.

#### 🟢 Beginner Example

```python
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect(app)
```

#### 🟡 Intermediate Example

```python
<form method="post">
  {{ csrf_token() }}
</form>
```

#### 🔴 Expert Example

```python
@app.route("/api/action", methods=["POST"])
def api_action():
    validate_csrf_header()  # noqa: F821
```

#### 🌍 Real-Time Example (Social Post Create)

```python
# SPA sends X-CSRF-Token matching cookie
```

### 16.4.4 Session Fixation Prevention

**Regenerate** session id after login; clear old keys.

#### 🟢 Beginner Example

```python
session.clear()
session["user_id"] = user.id
```

#### 🟡 Intermediate Example

```python
# Server-side store: new sid after privilege change
```

#### 🔴 Expert Example

```python
from flask import session
from flask_login import login_user

@app.post("/login")
def login():
    session.clear()
    login_user(user, remember=form.remember.data)
    return redirect(url_for("dashboard"))
```

#### 🌍 Real-Time Example (E-Commerce Post-Checkout)

```python
# New session after payment to unlink guest cart
session.clear()
session["user_id"] = customer.id
```

### 16.4.5 Secure Session Management

Short lifetimes, idle timeouts, IP binding (careful with mobile), anomaly detection.

#### 🟢 Beginner Example

```python
app.permanent_session_lifetime = timedelta(minutes=30)
```

#### 🟡 Intermediate Example

```python
session["last_active"] = time.time()

@app.before_request
def idle_timeout():
    last = session.get("last_active")
    if last and time.time() - last > 1800:
        session.clear()
    session["last_active"] = time.time()
```

#### 🔴 Expert Example

```python
# Bind session to user-agent hash; invalidate on mismatch (may annoy legitimate changes)
```

#### 🌍 Real-Time Example (SaaS Admin)

```python
# Step-up auth: separate short-lived admin flag in session
session["admin_ok_until"] = time.time() + 300
```

---

## 16.5 Advanced Session Features

### 16.5.1 Custom Session Interfaces

Subclass **`SessionInterface`** / **`SecureCookieSessionInterface`** for custom serialization.

#### 🟢 Beginner Example

Read Flask docs for `open_session` / `save_session` hooks.

#### 🟡 Intermediate Example

```python
from flask.sessions import SecureCookieSessionInterface

class JSONSessionInterface(SecureCookieSessionInterface):
    pass  # customize serializer
```

#### 🔴 Expert Example

Compress session payload before signing when size-bound.

#### 🌍 Real-Time Example (SaaS Feature Flags in Session)

```python
# Store compact bitfield instead of large dict
```

### 16.5.2 Server-Side Sessions

**Flask-Session** stores session dict in Redis/filesystem/Memcached.

#### 🟢 Beginner Example

```python
# pip install flask-session
from flask_session import Session

app.config["SESSION_TYPE"] = "filesystem"
Session(app)
```

#### 🟡 Intermediate Example

```python
app.config.update(
    SESSION_TYPE="redis",
    SESSION_REDIS="redis://localhost:6379/0",
)
```

#### 🔴 Expert Example

Shard Redis by tenant id in key prefix: `session:{tenant}:{sid}`.

#### 🌍 Real-Time Example (E-Commerce High Traffic)

```python
# Redis with TTL = PERMANENT_SESSION_LIFETIME
```

### 16.5.3 Database Sessions

Store serialized blob in SQL table keyed by session id.

#### 🟢 Beginner Example

```python
# Custom SessionInterface writing to `sessions` table
```

#### 🟡 Intermediate Example

```python
# SQLAlchemy model SessionRecord(id, data, expires_at)
```

#### 🔴 Expert Example

Periodic job deletes `expires_at < now()`.

#### 🌍 Real-Time Example (SaaS Compliance)

```python
# Audit trail: who changed session row (rare — prefer server state in main tables)
```

### 16.5.4 Redis Sessions

Low latency, TTL support, horizontal scale.

#### 🟢 Beginner Example

```python
SESSION_TYPE = "redis"
```

#### 🟡 Intermediate Example

```python
import redis
app.config["SESSION_REDIS"] = redis.from_url(os.environ["REDIS_URL"])
```

#### 🔴 Expert Example

Use **Redisson-style** namespacing + **SCAN** for invalidation on user ban.

#### 🌍 Real-Time Example (Social Real-Time)

```python
# Pub/sub notify devices to logout when session revoked
```

### 16.5.5 Session Persistence

**`session.permanent = True`** respects **`PERMANENT_SESSION_LIFETIME`**.

#### 🟢 Beginner Example

```python
session.permanent = True
```

#### 🟡 Intermediate Example

```python
from datetime import timedelta
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
```

#### 🔴 Expert Example

Different lifetimes for remember-me vs session cookie via custom flags.

#### 🌍 Real-Time Example (SaaS Mobile “Stay signed in”)

```python
if device_trusted:
    session.permanent = True
    app.permanent_session_lifetime = timedelta(days=90)
```

---

## Best Practices (Summary)

- Use **long random `SECRET_KEY`** from environment; rotate with fallbacks.
- Prefer **`HttpOnly` + `Secure` + appropriate `SameSite`** for auth cookies.
- **Never** store secrets or large objects in default signed cookie sessions.
- **Regenerate** session after authentication elevation.
- Combine **CSRF** protection with cookie-based sessions for form posts.
- For **multi-tenant** apps, scope data by `tenant_id` in session and verify each request.

---

## Common Mistakes to Avoid

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Hard-coded `secret_key` | Forgery of sessions | Env + secrets manager |
| Storing PII in session cookie | Disclosure | Server-side references only |
| Mutating nested dict without `modified` | Lost updates | Assign back or `session.modified=True` |
| `SameSite=Lax` for embedded cross-site flows | Broken auth | `None` + `Secure` where required |
| Wrong path/domain on delete | Zombie cookies | Match creation attributes |
| Trusting session alone for auth | Stolen cookie = access | HttpOnly, rotation, optional binding |

---

## Comparison Tables

| Mechanism | Storage | Size limit | Confidentiality |
|-----------|---------|------------|-----------------|
| Flask `session` (default) | Cookie | ~4KB practical | Signed, not encrypted |
| Redis session | Server | Large | Yes (server) |
| Raw `set_cookie` | Cookie | Small | Depends on value |

| SameSite | Behavior |
|----------|----------|
| Strict | No cross-site send |
| Lax | Top-level GET cross-site OK |
| None | Cross-site; requires Secure |

| Use case | Recommendation |
|----------|------------------|
| Cart id | Cookie or session id + server cart |
| JWT access | Memory or short cookie; refresh HttpOnly |
| CSRF token | Cookie + header or form hidden field |
| Theme | Non-sensitive cookie OK |

---

*Flask 3.1.3 (February 2026), Python 3.9+. Session defaults use Werkzeug secure cookie serialization; always verify current Flask/Werkzeug docs for interface details.*
