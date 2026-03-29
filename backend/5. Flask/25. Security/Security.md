# Flask 3.1.3 — Security

Web applications face **injection**, **cross-site scripting**, **cross-site request forgery**, **broken authentication**, and **misconfigured transport**. **Flask 3.1.3** gives you flexible request handling and Jinja2 templating; **security is mostly how you use those tools**. These notes anchor patterns to **e-commerce payments**, **social user-generated content**, and **SaaS RBAC** on Python 3.9+.

---

## 📑 Table of Contents

1. [25.1 Input Validation](#251-input-validation)
2. [25.2 SQL Injection Prevention](#252-sql-injection-prevention)
3. [25.3 XSS Prevention](#253-xss-prevention)
4. [25.4 CSRF Protection](#254-csrf-protection)
5. [25.5 Authentication Security](#255-authentication-security)
6. [25.6 HTTPS and SSL](#256-https-and-ssl)
7. [25.7 Authorization and Access Control](#257-authorization-and-access-control)
8. [Best Practices](#best-practices)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Comparison Tables](#comparison-tables)
11. [Appendix — Threat Walkthroughs](#appendix--threat-walkthroughs)

---

## 25.1 Input Validation

### Input Sanitization

**🟢 Beginner Example — strip whitespace**

```python
from flask import request

email = (request.form.get("email") or "").strip()
```

**🟡 Intermediate Example — HTML allowlist with Bleach**

```python
import bleach

def sanitize_bio(html: str) -> str:
    return bleach.clean(
        html,
        tags=["b", "i", "a", "p", "br"],
        attributes={"a": ["href", "title", "rel"]},
        protocols=["http", "https", "mailto"],
        strip=True,
    )
```

**🔴 Expert Example — contextual sanitization**

```python
# Rich text for profile ≠ filename for upload ≠ SQL literal (still use parameters)
```

**🌍 Real-Time Example — social “about me”**

Users paste from Word; Bleach removes `<script>`; still store escaped in DB if rendered carefully.

### Type Checking

**🟢 Beginner Example — `int()` with validation**

```python
page = request.args.get("page", default="1")
if not page.isdigit():
    abort(400)
page_i = int(page)
```

**🟡 Intermediate Example — Pydantic**

```python
from pydantic import BaseModel, Field, ValidationError

class Checkout(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    qty: int = Field(ge=1, le=99)

@app.post("/api/cart")
def add_cart():
    try:
        body = Checkout.model_validate(request.get_json(force=True, silent=True) or {})
    except ValidationError as e:
        return {"errors": e.errors()}, 422
    ...
```

**🔴 Expert Example — strict JSON schema in CI**

```python
# openapi spec generated from models; contract tests
```

**🌍 Real-Time Example — e-commerce quantity**

Reject floats, negatives, and huge ints that could break inventory logic.

### Range Validation

**🟢 Beginner Example — clamp discount percent**

```python
discount = max(0, min(50, int(request.args.get("discount", 0))))
```

**🟡 Intermediate Example — date window**

```python
from datetime import date, timedelta

def parse_date(s: str) -> date:
    y, m, d = map(int, s.split("-"))
    return date(y, m, d)

start = parse_date(request.args["start"])
end = parse_date(request.args["end"])
if end < start or (end - start) > timedelta(days=90):
    abort(400)
```

**🔴 Expert Example — monetary amounts in minor units**

```python
# Store cents as int; reject NaN/inf from broken clients
```

**🌍 Real-Time Example — SaaS seat counts**

Purchasing 1–10_000 seats with server-side plan caps.

### Format Validation

**🟢 Beginner Example — email regex (prefer library)**

```python
from email_validator import validate_email, EmailNotValidError

try:
    email = validate_email(request.form["email"]).email
except EmailNotValidError:
    abort(400)
```

**🟡 Intermediate Example — SKU pattern**

```python
import re

SKU_RE = re.compile(r"^[A-Z0-9_-]{3,32}$")
if not SKU_RE.match(sku):
    abort(400)
```

**🔴 Expert Example — international addresses**

```python
# Use specialized validators; avoid naive regex for global postal codes
```

**🌍 Real-Time Example — e-commerce gift card codes**

Alphanumeric with checksum validated server-side.

### Whitelist Validation

**🟢 Beginner Example — enum sort keys**

```python
SORT = {"new", "price_asc", "price_desc"}
sort = request.args.get("sort", "new")
if sort not in SORT:
    abort(400)
```

**🟡 Intermediate Example — content types for uploads**

```python
ALLOWED = {"image/png", "image/jpeg"}
if file.mimetype not in ALLOWED:
    abort(415)
```

**🔴 Expert Example — capability tokens**

```python
# Only allow operations explicitly granted in signed token claims
```

**🌍 Real-Time Example — SaaS feature flags**

Server maps `plan_tier` → allowed endpoints; ignore client-supplied “tier”.

---

## 25.2 SQL Injection Prevention

### Parameterized Queries

**🟢 Beginner Example — SQLAlchemy filters**

```python
User.query.filter_by(email=email).first()
```

**🟡 Intermediate Example — text with bind params**

```python
from sqlalchemy import text

db.session.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})
```

**🔴 Expert Example — dynamic WHERE with structure, not string concat**

```python
from sqlalchemy import select, and_

conds = [User.active.is_(True)]
if role:
    conds.append(User.role == role)
stmt = select(User).where(and_(*conds))
```

**🌍 Real-Time Example — e-commerce search**

Never `f"%{q}%"` inside raw SQL strings; use bound parameters.

### ORM Usage

**🟢 Beginner Example — `get` by id**

```python
Product.query.get_or_404(product_id)
```

**🟡 Intermediate Example — avoid raw SQL unless needed**

**🔴 Expert Example — ORM SQL logging in staging to catch unsafe patterns**

**🌍 Real-Time Example — SaaS multi-tenant**

`.filter(Model.tenant_id == g.tenant_id)` on every query via custom base/mixin.

### Escaping

**🟢 Beginner Example — prefer parameters over escaping**

**🟡 Intermediate Example — DB-specific escape only if unavoidable**

**🔴 Expert Example — identify legacy `execute("... %s" % user)` and remove**

**🌍 Real-Time Example — social search**

Full-text queries still use bound parameters for user literals.

### Input Validation

**🟢 Beginner Example — integer IDs only**

```python
if not str(user_id).isdigit():
    abort(404)
```

**🟡 Intermediate Example — UUID parsing**

```python
import uuid

try:
    uid = uuid.UUID(request.view_args["id"])
except ValueError:
    abort(404)
```

**🔴 Expert Example — reject null bytes in strings**

```python
if "\x00" in name:
    abort(400)
```

**🌍 Real-Time Example — e-commerce admin bulk actions**

Validate list of IDs length and type before `WHERE id = ANY(:ids)`.

### Testing for Injection

**🟢 Beginner Example — pytest with malicious input**

```python
def test_search_sql_injection(client):
    r = client.get("/api/search?q=" + "' OR 1=1 --")
    assert r.status_code in (200, 400)
    # assert no error leakage / unexpected row counts
```

**🟡 Intermediate Example — sqlmap against staging**

**🔴 Expert Example — SAST rules blocking `%` formatting in SQL strings**

**🌍 Real-Time Example — SaaS pen test**

Reported blind SQLi in legacy report endpoint → parameterized fix + regression test.

---

## 25.3 XSS Prevention

### Output Encoding

**🟢 Beginner Example — Jinja auto-escapes HTML**

```jinja
<p>{{ user.name }}</p>
```

**🟡 Intermediate Example — `|e` when building attributes**

```jinja
<div data-name="{{ user.name|e }}">
```

**🔴 Expert Example — JSON in `<script>` is dangerous**

```jinja
{# Avoid: var x = {{ data|tojson }}; if mixing contexts incorrectly #}
```

**🌍 Real-Time Example — e-commerce order confirmation**

Escape user-supplied shipping name in email templates.

### Template Auto-Escaping

**🟢 Beginner Example — default enabled in Flask/Jinja**

**🟡 Intermediate Example — `| safe` only for trusted HTML**

```jinja
{{ trusted_cms_html | safe }}
```

**🔴 Expert Example — never mark user content safe**

**🌍 Real-Time Example — SaaS admin CMS**

Only staff HTML is `safe`; tenant user HTML still sanitized.

### Bleach Library

**🟢 Beginner Example — clean before store**

```python
bio = bleach.clean(request.form["bio"])
```

**🟡 Intermediate Example — linkify with callbacks**

```python
def nofollow(attrs, new=False):
    attrs[(None, "rel")] = "nofollow"
    return attrs

text = bleach.linkify(text, callbacks=[nofollow], parse_email=True)
```

**🔴 Expert Example — CSS sanitization if allowing style (hard mode)**

**🌍 Real-Time Example — social comments**

Allow `@mentions` links after validating user IDs server-side.

### Content Security Policy

**🟢 Beginner Example — baseline CSP**

```python
@app.after_request
def csp(resp):
    resp.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "object-src 'none'; "
        "base-uri 'none'"
    )
    return resp
```

**🟡 Intermediate Example — nonce scripts**

```python
import secrets

@app.context_processor
def csp_nonce():
    n = secrets.token_urlsafe(16)
    g.csp_nonce = n
    return {"csp_nonce": n}
```

```jinja
<script nonce="{{ csp_nonce }}">...</script>
```

**🔴 Expert Example — strict-dynamic + hashes for inline**

**🌍 Real-Time Example — SaaS embed**

Document required CSP for customers embedding your widget.

### Testing for XSS

**🟢 Beginner Example — manual payload**

```text
<script>alert(1)</script>
```

**🟡 Intermediate Example — pytest on reflected contexts**

**🔴 Expert Example — DAST scanning in pipeline**

**🌍 Real-Time Example — e-commerce review text**

Stored XSS caught in staging; fix via Bleach + CSP.

---

## 25.4 CSRF Protection

### CSRF Tokens

**🟢 Beginner Example — Flask-WTF**

```python
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired

class PostForm(FlaskForm):
    title = StringField("title", validators=[DataRequired()])
```

```jinja
<form method="post">
  {{ form.hidden_tag() }}
  ...
</form>
```

**🟡 Intermediate Example — AJAX header token**

```javascript
fetch("/api/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": window.CSRF_TOKEN,
  },
  body: JSON.stringify({title: "hi"}),
});
```

**🔴 Expert Example — double-submit cookie pattern for SPA**

**🌍 Real-Time Example — e-commerce account email change**

Stateful form requires CSRF; API uses SameSite cookies + token for cross-origin SPA.

### Token Generation

**🟢 Beginner Example — Flask-WTF generates per session**

**🟡 Intermediate Example — rotate token on privilege change**

**🔴 Expert Example — encrypt stateless CSRF with HMAC**

**🌍 Real-Time Example — SaaS org switch**

New CSRF after switching `org_id` in session.

### Token Validation

**🟢 Beginner Example — `form.validate_on_submit()`**

**🟡 Intermediate Example — exempt safe methods**

```python
@app.before_request
def csrf_guard():
    if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
        return
    # validate token for session-auth POSTs
```

**🔴 Expert Example — split cookie vs header validation paths**

**🌍 Real-Time Example — social mobile web**

CSRF token delivered in meta tag; refreshed on login.

### Same-Site Cookies

**🟢 Beginner Example**

```python
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
)
```

**🟡 Intermediate Example — `None` for cross-site credentialed APIs**

```python
SESSION_COOKIE_SAMESITE="None"
```

**🔴 Expert Example — `__Host-` prefix cookies where applicable**

**🌍 Real-Time Example — e-commerce + payments iframe**

Strict cookie policy coordination with PSP.

### Double Submit Cookies

**🟢 Beginner Example — pattern sketch**

```python
# Cookie: csrf_token=random (not HttpOnly)
# Header: X-CSRF-Token must match cookie
```

**🟡 Intermediate Example — signed cookie variant**

**🔴 Expert Example — mitigate if attacker can set cookies (subdomain issues)**

**🌍 Real-Time Example — SaaS on `*.app.com`**

Avoid wildcard cookies that let tenant subdomains overwrite each other’s cookies.

---

## 25.5 Authentication Security

### Password Hashing

**🟢 Beginner Example — Werkzeug**

```python
from werkzeug.security import generate_password_hash, check_password_hash

pw_hash = generate_password_hash("correct horse battery staple")
assert check_password_hash(pw_hash, "correct horse battery staple")
```

**🟡 Intermediate Example — Argon2 via passlib**

```python
from passlib.hash import argon2

h = argon2.hash("secret")
argon2.verify("secret", h)
```

**🔴 Expert Example — tune Argon2 for server capacity**

**🌍 Real-Time Example — e-commerce**

Never store plaintext; breach dumps only contain slow hashes.

### Bcrypt Integration

**🟢 Beginner Example**

```python
import bcrypt

h = bcrypt.hashpw(b"secret", bcrypt.gensalt(rounds=12))
bcrypt.checkpw(b"secret", h)
```

**🟡 Intermediate Example — pepper from HSM/KMS (conceptual)**

**🔴 Expert Example — rehash on login when cost factor increases**

**🌍 Real-Time Example — SaaS enterprise SSO**

Local passwords rare; still hash well for break-glass accounts.

### Password Requirements

**🟢 Beginner Example — minimum length 12**

**🟡 Intermediate Example — check breach list (k-anonymity APIs)**

**🔴 Expert Example — passkeys/WebAuthn as primary**

**🌍 Real-Time Example — social app**

Discourage common passwords; show strength meter.

### Session Security

**🟢 Beginner Example — random secret key**

```python
app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]
```

**🟡 Intermediate Example — rotate session on login**

```python
from flask import session

@app.route("/login", methods=["POST"])
def login():
    session.clear()
    session["uid"] = user.id
    session.permanent = True
    return redirect("/")
```

**🔴 Expert Example — server-side sessions in Redis + fixation defense**

**🌍 Real-Time Example — SaaS**

Idle timeout 30m; absolute timeout 12h; IP/User-Agent binding optional.

### Login Rate Limiting

**🟢 Beginner Example — Flask-Limiter**

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day", "50 per hour"])

@app.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    ...
```

**🟡 Intermediate Example — lockout after N failures per account**

**🔴 Expert Example — proof-of-work or CAPTCHA after threshold**

**🌍 Real-Time Example — e-commerce**

Credential stuffing mitigated; log suspicious ASNs.

---

## 25.6 HTTPS and SSL

### SSL Certificate

**🟢 Beginner Example — Let’s Encrypt via certbot on nginx**

**🟡 Intermediate Example — ACM certificate on AWS ALB**

**🔴 Expert Example — mTLS for internal admin**

**🌍 Real-Time Example — SaaS**

Wildcard cert for `*.customerportal.com` with DNS validation.

### HTTPS Configuration

**🟢 Beginner Example — terminate TLS at reverse proxy**

**🟡 Intermediate Example — HSTS preload-ready headers**

```python
@app.after_request
def hsts(resp):
    resp.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    return resp
```

**🔴 Expert Example — TLS 1.2+ only; modern cipher suites at LB**

**🌍 Real-Time Example — e-commerce PCI**

TLS for all cardholder data environments.

### Force HTTPS

**🟢 Beginner Example — nginx redirect**

```nginx
if ($scheme != "https") { return 301 https://$host$request_uri; }
```

**🟡 Intermediate Example — Flask middleware (behind proxy)**

```python
from werkzeug.middleware.proxy_fix import ProxyFix

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)
```

**🔴 Expert Example — reject plaintext health checks accidentally exposed**

**🌍 Real-Time Example — SaaS**

`X-Forwarded-Proto` trusted only from known proxies.

### Secure Cookies

**🟢 Beginner Example**

```python
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
```

**🟡 Intermediate Example — `SESSION_COOKIE_NAME` not `session` if fingerprinting concern**

**🔴 Expert Example — `__Host-` session id cookie**

**🌍 Real-Time Example — social**

Refresh tokens in HttpOnly cookies; access tokens short-lived.

### HSTS Headers

**🟢 Beginner Example — shown above**

**🟡 Intermediate Example — includeSubDomains risk assessment**

**🔴 Expert Example — `preload` only after scanning all subdomains**

**🌍 Real-Time Example — e-commerce marketing on HTTP legacy subdomain breaks—fix before HSTS wide**

---

## 25.7 Authorization and Access Control

### RBAC

**🟢 Beginner Example — role in session**

```python
def require_role(role: str):
    def deco(f):
        def wrapper(*args, **kwargs):
            if session.get("role") != role:
                abort(403)
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return deco
```

**🟡 Intermediate Example — permissions list**

```python
PERMS = {"editor": {"post.write"}, "admin": {"post.write", "user.manage"}}

def require_perm(p: str):
    def deco(f):
        def wrapper(*args, **kwargs):
            role = session.get("role")
            if p not in PERMS.get(role, set()):
                abort(403)
            return f(*args, **kwargs)
        return wrapper
    return deco
```

**🔴 Expert Example — policy engine (OPA) sidecar**

**🌍 Real-Time Example — SaaS**

Tenant admin vs member vs billing-only roles.

### Object-Level Permissions

**🟢 Beginner Example — check owner**

```python
doc = Document.query.get_or_404(doc_id)
if doc.owner_id != session["uid"]:
    abort(403)
```

**🟡 Intermediate Example — shared workspace ACL table**

**🔴 Expert Example — Zanzibar-style tuples (conceptual)**

**🌍 Real-Time Example — social DMs**

User can read thread only if participant row exists.

### Permission Checking

**🟢 Beginner Example — central decorator**

**🟡 Intermediate Example — query filters enforce tenant**

```python
q = Order.query.filter(Order.tenant_id == g.tenant_id)
```

**🔴 Expert Example — deny by default OpenAPI security schemes**

**🌍 Real-Time Example — e-commerce**

Customer cannot fetch another user’s order by ID guessing—404 vs 403 policy documented.

### Audit Logging

**🟢 Beginner Example — log admin actions**

```python
app.logger.info("admin_action user=%s action=%s target=%s", admin_id, action, target_id)
```

**🟡 Intermediate Example — append-only store**

**🔴 Expert Example — sign logs / ship to SIEM**

**🌍 Real-Time Example — SaaS SOC2**

Who exported which tenant’s data and when.

### API Security

**🟢 Beginner Example — Bearer token in `Authorization`**

```python
def get_bearer_token() -> str | None:
    h = request.headers.get("Authorization", "")
    if h.startswith("Bearer "):
        return h.removeprefix("Bearer ").strip()
    return None
```

**🟡 Intermediate Example — scopes**

```python
# token claims include scopes: ["orders:read"]
```

**🔴 Expert Example — mTLS for B2B partners**

**🌍 Real-Time Example — e-commerce mobile**

Short-lived JWT + refresh with rotation; revoke on logout server-side.

---

## Best Practices

1. **Validate early** at boundaries; **trust nothing** from clients.
2. **Parameterize all SQL**; treat ORM as helper, not magic shield.
3. **Keep auto-escaping on**; `|safe` is a sharp tool.
4. **Use CSRF** for cookie-authenticated state-changing requests.
5. **Hash passwords** with modern algorithms and **unique salts** (built into bcrypt/argon2).
6. **HTTPS everywhere**; set **HSTS** when stable.
7. **Authorize on every route** that touches data, including nested resources.
8. **Log security-relevant events** without logging secrets.

---

## Common Mistakes to Avoid

| Mistake | Risk |
|---------|------|
| f-strings in SQL | SQL injection |
| Disabling Jinja escaping for convenience | XSS |
| `SameSite=None` without `Secure` | Cookie issues / insecurity |
| Trusting `X-Forwarded-For` from internet | IP spoofing |
| Storing JWTs in localStorage | XSS token theft |
| 403 vs 404 inconsistency | user enumeration leaks |
| Logging passwords/tokens | credential exposure |

---

## Comparison Tables

### Session vs JWT

| Aspect | Server session | JWT access token |
|--------|----------------|------------------|
| Revocation | Immediate | Harder without blocklist |
| Scale-out | needs shared store | stateless verify |
| XSS impact | HttpOnly cookie safer than localStorage JWT |

### RBAC vs ABAC

| Model | Simplicity | Expressiveness |
|-------|------------|----------------|
| RBAC | High | Medium |
| ABAC | Lower | High |

### Encoding Contexts

| Context | Safe approach |
|---------|----------------|
| HTML body | Jinja escape |
| HTML attribute | escape + quote |
| JS string | `json.dumps` into script carefully or avoid inline |
| CSS/url | strict allowlists |

---

## Appendix — Threat Walkthroughs

### A. E-Commerce — Checkout Manipulation

**🟢 Beginner Example — validate prices server-side from DB, not client JSON**

**🟡 Intermediate Example — idempotency keys on payment intents**

**🔴 Expert Example — webhook signature verification**

**🌍 Real-Time Example — attacker posts discounted `total`; server recomputes from line items**

### B. Social — Stored XSS in Comments

**🟢 Beginner Example — Bleach on input**

**🟡 Intermediate Example — CSP `script-src 'self'`**

**🔴 Expert Example — DOMPurify on client + server sanitize (defense in depth)**

**🌍 Real-Time Example — worm via shared link preview renderer**

### C. SaaS — IDOR on Documents

**🟢 Beginner Example — `doc.tenant_id == g.tenant_id` check**

**🟡 Intermediate Example — UUID ids + query filter**

**🔴 Expert Example — centralized authorization service**

**🌍 Real-Time Example — competitor guesses sequential ids—blocked by tenant scope**

### D. Flask 3.1.3 Configuration Hardening

**🟢 Beginner Example**

```python
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=True,
    PREFERRED_URL_SCHEME="https",
)
```

**🟡 Intermediate Example — `DEBUG=False` in prod**

**🔴 Expert Example — disable Werkzeug console in any exposed env**

**🌍 Real-Time Example — secret scanning blocks `SECRET_KEY` in repo**

### E. Dependency Supply Chain

**🟢 Beginner Example — pin versions**

**🟡 Intermediate Example — `pip-audit` in CI**

**🔴 Expert Example — SBOM export per image**

**🌍 Real-Time Example — SaaS customer asks for CVE attestation**

### F. File Upload Safety

**🟢 Beginner Example — validate extension + MIME**

**🟡 Intermediate Example — virus scan async**

**🔴 Expert Example — store outside web root; serve via signed URL**

**🌍 Real-Time Example — e-commerce seller portal image upload**

### G. Error Handling

**🟢 Beginner Example — generic message to users**

**🟡 Intermediate Example — `request_id` in JSON errors**

**🔴 Expert Example — no stack traces to clients**

**🌍 Real-Time Example — social API returns 404 for private posts to avoid existence leak**

### H. Rate Limiting Surfaces

**🟢 Beginner Example — `/login` limited**

**🟡 Intermediate Example — per API key**

**🔴 Expert Example — adaptive based on fraud score**

**🌍 Real-Time Example — SaaS scraping blocked**

### I. Secrets Management

**🟢 Beginner Example — `os.environ`**

**🟡 Intermediate Example — Vault agent sidecar**

**🔴 Expert Example — short-lived dynamic DB creds**

**🌍 Real-Time Example — e-commerce PSP keys rotated quarterly**

### J. Security Headers Bundle

**🟢 Beginner Example**

```python
@app.after_request
def security_headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    return resp
```

**🟡 Intermediate Example — `Permissions-Policy`**

**🔴 Expert Example — `Cross-Origin-Opener-Policy` for sensitive pages**

**🌍 Real-Time Example — SaaS admin isolation from third-party widgets**

---

*Notes version: Flask **3.1.3**, Python **3.9+**, February 2026 release line.*
