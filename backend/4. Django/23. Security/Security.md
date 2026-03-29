# Django Security

Security in Django **6.0.3** spans the framework stack: CSRF for session-backed forms, the ORM and disciplined raw SQL for injection resistance, template auto-escaping and CSP for XSS, strong password hashing, TLS for transport, hardened sessions, authentication abuse controls, and API-specific token and rate-limit patterns. This reference mirrors a TypeScript handbook: progressive examples from toy snippets to production policies, with e-commerce, social, and SaaS scenarios throughout.

---

## 📑 Table of Contents

1. [23.1 CSRF Protection](#231-csrf-protection)
2. [23.2 SQL Injection Prevention](#232-sql-injection-prevention)
3. [23.3 XSS Prevention](#233-xss-prevention)
4. [23.4 Password Security](#234-password-security)
5. [23.5 HTTPS and TLS](#235-https-and-tls)
6. [23.6 Session Security](#236-session-security)
7. [23.7 Authentication Security](#237-authentication-security)
8. [23.8 API Security](#238-api-security)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 23.1 CSRF Protection

### 23.1.1 CSRF Token Concept

Cross-Site Request Forgery tricks a logged-in browser into submitting a state-changing request. Django issues a per-session (or per-use) secret token and verifies it on unsafe HTTP methods when using cookie session auth.

**🟢 Beginner Example — form POST**

```html
<form method="post">
  {% csrf_token %}
  <input name="title" />
  <button type="submit">Save</button>
</form>
```

**🟡 Intermediate Example — reading token in JS for AJAX**

```javascript
function getCookie(name) {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? decodeURIComponent(m.pop()) : "";
}
fetch("/api/cart/add/", {
  method: "POST",
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": getCookie("csrftoken"),
  },
  body: JSON.stringify({ sku: "ABC" }),
});
```

**🔴 Expert Example — double-submit cookie pattern discussion**

```python
# Django's default: CSRF cookie + hidden field / header match.
# For SPA on same site, ensure CSRF_TRUSTED_ORIGINS includes your frontend origin
# when using cross-subdomain XHR with credentials.
```

**🌍 Real-Time Example — SaaS dashboard (e-commerce admin)**

```python
# Staff users edit catalog via HTMX + JSON hybrid:
# Every mutating request from the browser includes X-CSRFToken from cookie.
```

### 23.1.2 `csrf_token` Template Tag

**🟢 Beginner Example**

```django
{% csrf_token %}
<input type="hidden" name="csrfmiddlewaretoken" value="{{ csrf_token }}">
```

**🟡 Intermediate Example — inline in a partial**

```django
{# components/comment_form.html #}
<form hx-post="{% url 'comments:add' %}" hx-headers='{"X-CSRFToken": "{{ csrf_token }}"}'>
```

**🔴 Expert Example — caching fragments**

```django
{# Never cache pages containing {% csrf_token %} globally without Vary: Cookie #}
```

**🌍 Real-Time Example — social: comment box on cached post page**

```python
# Load comment form via uncached sub-request or embed token from separate lightweight endpoint
```

### 23.1.3 CSRF Middleware

**🟢 Beginner Example — default stack**

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # ...
]
```

**🟡 Intermediate Example — trusted origins for HTTPS proxy**

```python
CSRF_TRUSTED_ORIGINS = [
    "https://app.example.com",
    "https://admin.example.com",
]
```

**🔴 Expert Example — subdomain cookie scope**

```python
CSRF_COOKIE_DOMAIN = ".example.com"
CSRF_COOKIE_HTTPONLY = False  # JS must read token for SPA header pattern
CSRF_COOKIE_SAMESITE = "Lax"
```

**🌍 Real-Time Example — multi-tenant SaaS custom domains**

```python
# Dynamically validate Host + Origin against Tenant.domain_allowlist in middleware
```

### 23.1.4 CSRF Exempt

**🟢 Beginner Example**

```python
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@csrf_exempt
def legacy_ping(request):
    return JsonResponse({"ok": True})
```

**🟡 Intermediate Example — webhook (prefer signature instead)**

```python
@csrf_exempt
def stripe_webhook(request):
    # MUST verify Stripe-Signature header — CSRF exempt is dangerous without it
    ...
```

**🔴 Expert Example — DRF session auth still needs CSRF for unsafe methods**

```python
# Do not blanket csrf_exempt your REST API; use token/JWT or ensure CSRF header from SPA
```

**🌍 Real-Time Example — payment provider callback**

```python
# Exempt only after HMAC/signature validation at the edge or first line of view
```

### 23.1.5 CSRF Failure Handling

**🟢 Beginner Example — default 403 page**

```python
# LOGGING: django.security.csrf logs failures
```

**🟡 Intermediate Example — custom view**

```python
CSRF_FAILURE_VIEW = "myapp.views.csrf_failure"
```

```python
from django.shortcuts import render

def csrf_failure(request, reason=""):
    return render(request, "403_csrf.html", {"reason": reason}, status=403)
```

**🔴 Expert Example — JSON API friendly message**

```python
def csrf_failure(request, reason=""):
    if request.headers.get("Accept") == "application/json":
        from django.http import JsonResponse
        return JsonResponse({"detail": "CSRF verification failed"}, status=403)
    return render(request, "403_csrf.html", {"reason": reason}, status=403)
```

**🌍 Real-Time Example — mobile WebView hybrid**

```python
# Instrument CSRF failures in Sentry with request.path + user id (no token values)
```

---

## 23.2 SQL Injection Prevention

### 23.2.1 Parameterized Queries

**🟢 Beginner Example — ORM is parameterized**

```python
User.objects.filter(username=user_input)
```

**🟡 Intermediate Example — extra() discouraged; use ORM lookups**

```python
Product.objects.filter(sku__exact=cleaned_sku)
```

**🔴 Expert Example — raw with params tuple**

```python
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM shop_product WHERE sku = %s", [sku])
```

**🌍 Real-Time Example — SaaS reporting query**

```python
cursor.execute(
    "SELECT date, sum(amount_cents) FROM billing_charge WHERE org_id = %s AND date >= %s GROUP BY 1",
    [org_id, start_date],
)
```

### 23.2.2 ORM Protection

**🟢 Beginner Example**

```python
Order.objects.filter(user=request.user)
```

**🟡 Intermediate Example — never format strings into `.extra()`**

```python
# BAD: .extra(where=[f"id = {pk}"])  # injection risk
```

**🔴 Expert Example — dynamic field names whitelist**

```python
ALLOWED = {"created_at", "-created_at", "total"}
order = request.GET.get("sort", "created_at")
if order.lstrip("-") not in ALLOWED:
    order = "created_at"
qs = Order.objects.order_by(order)
```

**🌍 Real-Time Example — e-commerce faceted search**

```python
# Build Q objects from validated filter dict, not raw SQL concatenation
```

### 23.2.3 Raw SQL Safety

**🟢 Beginner Example**

```python
Product.objects.raw("SELECT * FROM shop_product WHERE id = %s", [product_id])
```

**🟡 Intermediate Example — identifiers cannot be bound; whitelist**

```python
def safe_order_column(name):
    if name not in ("price", "name"):
        raise ValueError("Invalid order")
    return name

sql = f"SELECT * FROM shop_product ORDER BY {safe_order_column(col)}"
```

**🔴 Expert Example — database-specific functions behind adapter**

```python
# Keep vendor-specific SQL in repository layer with tests
```

**🌍 Real-Time Example — analytics rollup on PostgreSQL**

```python
cursor.execute(
    """
    INSERT INTO daily_sales (day, sku, units)
    SELECT date_trunc('day', o.created_at), l.sku, sum(l.qty)
    FROM shop_order o JOIN shop_line l ON l.order_id = o.id
    WHERE o.org_id = %s
    GROUP BY 1, 2
    ON CONFLICT DO NOTHING
    """,
    [org_id],
)
```

### 23.2.4 Input Validation

**🟢 Beginner Example — Form.clean**

```python
from django import forms

class QuantityForm(forms.Form):
    qty = forms.IntegerField(min_value=1, max_value=99)
```

**🟡 Intermediate Example — DRF serializer**

```python
class SkuSerializer(serializers.Serializer):
    sku = serializers.RegexField(r"^[A-Z0-9-]{3,32}$")
```

**🔴 Expert Example — allowlist for JSON operator paths**

```python
ALLOWED_PATHS = {"profile.theme", "profile.notifications.email"}
def set_user_pref(path, value):
    if path not in ALLOWED_PATHS:
        raise ValidationError("Unknown preference path")
```

**🌍 Real-Time Example — social bio field**

```python
# Max length + strip + optional bleach for rich text if you allow HTML
```

### 23.2.5 Escaping (Context)

**🟢 Beginner Example — ORM returns Python values, not SQL string concatenation**

```python
Tag.objects.create(name=cleaned_name)
```

**🟡 Intermediate Example — LIKE wildcards**

```python
from django.db.models import Value
from django.db.models.functions import Replace

q = Replace(Value(user_input), Value("%"), Value("\\%"))
```

**🔴 Expert Example — full-text search vector input sanitization**

```python
# Use SearchQuery with plain text config rather than pasting user strings into to_tsquery
```

**🌍 Real-Time Example — SaaS saved filters**

```python
# Store structured filter JSON; validate against schema before applying to ORM
```

---

## 23.3 XSS Prevention

### 23.3.1 Template Auto-escaping

**🟢 Beginner Example**

```django
<p>{{ user_comment }}</p>
```

**🟡 Intermediate Example — disable only with extreme care**

```django
{% autoescape off %}
  {{ trusted_html }}
{% endautoescape %}
```

**🔴 Expert Example — JSON in script (use `json_script`)**

```django
{{ data|json_script:"app-data" }}
<script>
  const data = JSON.parse(document.getElementById("app-data").textContent);
</script>
```

**🌍 Real-Time Example — e-commerce product description from CMS**

```python
# If HTML allowed, sanitize server-side (bleach) before save; still escape in templates by default
```

### 23.3.2 `mark_safe`

**🟢 Beginner Example**

```python
from django.utils.safestring import mark_safe

def colored_status(obj):
    if obj.status == "ok":
        return mark_safe('<span class="ok">OK</span>')
    return "Bad"
```

**🟡 Intermediate Example — never on user input**

```python
# BAD: mark_safe(request.POST["note"])
```

**🔴 Expert Example — wrap only static trusted fragments**

```python
mark_safe('<abbr title="Stock Keeping Unit">SKU</abbr>')
```

**🌍 Real-Time Example — SaaS admin column renderers**

```python
# Compose from escaped pieces or use format_html
```

### 23.3.3 User Input Sanitization

**🟢 Beginner Example — strip tags on save**

```python
import bleach

def clean_html(html):
    return bleach.clean(html, tags=["b", "i", "a"], attributes={"a": ["href"]})
```

**🟡 Intermediate Example — URL validation**

```python
from django.core.validators import URLValidator

v = URLValidator()
v.clean(user_url)
```

**🔴 Expert Example — file upload content-type sniffing**

```python
# Use python-magic or pillow to verify image uploads; never trust Content-Type header alone
```

**🌍 Real-Time Example — social post with @mentions**

```python
# Store plain text; linkify mentions at render with escaped URLs
```

### 23.3.4 Content Security Policy

**🟢 Beginner Example — header middleware**

```python
class CSPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Content-Security-Policy"] = "default-src 'self'"
        return response
```

**🟡 Intermediate Example — nonce for inline scripts**

```python
# django-csp or manual: script-src 'nonce-{nonce}'
```

**🔴 Expert Example — strict-dynamic for modern bundles**

```python
# Coordinate with frontend build (hashes for inline bootstraps)
```

**🌍 Real-Time Example — SaaS embeddable widget**

```python
# Separate CSP for widget subdomain; frame-ancestors directive
```

### 23.3.5 JavaScript Escaping

**🟢 Beginner Example — avoid embedding user data in JS strings**

**🟡 Intermediate Example — `json_script` pattern (see above)**

**🔴 Expert Example — URL encoding for redirects**

```python
from django.utils.http import url_has_allowed_host_and_scheme
from urllib.parse import quote

next_url = request.GET.get("next", "/")
if not url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
    next_url = "/"
```

**🌍 Real-Time Example — OAuth redirect_uri validation**

```python
# Exact match against registered URIs — never substring match user input
```

---

## 23.4 Password Security

### 23.4.1 Password Hashing

**🟢 Beginner Example — Django hashes automatically**

```python
user.set_password("correct horse battery staple")
user.save()
```

**🟡 Intermediate Example — check_password**

```python
from django.contrib.auth.hashers import check_password

check_password("plain", user.password)
```

**🔴 Expert Example — identify hasher upgrades**

```python
from django.contrib.auth.hashers import identify_hasher

identify_hasher(encoded_password)
```

**🌍 Real-Time Example — SaaS imports bcrypt hashes from legacy system**

```python
# Custom hasher or migrate on login: if check with legacy, rehash with Django hasher
```

### 23.4.2 PBKDF2

**🟢 Beginner Example — default settings**

```python
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    # ...
]
```

**🟡 Intermediate Example — increase iterations (trade CPU)**

```python
PBKDF2_ITERATIONS = 600_000  # follow OWASP guidance for your Django version docs
```

**🔴 Expert Example — rolling upgrade**

```python
# After raising iterations, users rehash on successful login when needs_update is True
```

**🌍 Real-Time Example — e-commerce PCI-adjacent hygiene**

```python
# Strong passwords + MFA for staff; never store recoverable passwords
```

### 23.4.3 Argon2

**🟢 Beginner Example**

```bash
pip install argon2-cffi
```

```python
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]
```

**🟡 Intermediate Example — tune time/memory**

```python
ARGON2_TIME_COST = 3
ARGON2_MEMORY_COST = 64 * 1024
```

**🔴 Expert Example — side-channel aware deployment**

```python
# Run password checks in consistent-time code paths; avoid early returns leaking timing
```

**🌍 Real-Time Example — high-security SaaS**

```python
# Argon2 preferred where libsodium/argon2 available on platform
```

### 23.4.4 bcrypt

**🟢 Beginner Example**

```python
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]
```

**🟡 Intermediate Example — password length limit**

```python
# bcrypt truncates at 72 bytes — Django's BCryptSHA256PasswordHasher pre-hashes with SHA256
```

**🔴 Expert Example — interoperability with Node bcrypt**

```python
# Document rounds and pepper strategy if shared user store
```

**🌍 Real-Time Example — social login hybrid**

```python
# Local password optional; OAuth primary; still hash if present
```

### 23.4.5 Password Validation

**🟢 Beginner Example**

```python
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
]
```

**🟡 Intermediate Example — custom validator**

```python
from django.core.exceptions import ValidationError
import re

class SpecialCharValidator:
    def validate(self, password, user=None):
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise ValidationError("Include a special character.")

    def get_help_text(self):
        return "Include a special character."
```

**🔴 Expert Example — breach password list (Have I Been Pwned)**

```python
# Integrate k-anonymity API or local bloom filter in validator
```

**🌍 Real-Time Example — enterprise SSO fallback local passwords**

```python
# Stricter validators for break-glass accounts only
```

---

## 23.5 HTTPS and TLS

### 23.5.1 SSL/TLS Configuration

**🟢 Beginner Example — terminate TLS at reverse proxy**

```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```

**🟡 Intermediate Example — Django behind proxy**

```python
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
```

**🔴 Expert Example — TLS 1.2+ only, modern cipher suites**

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
```

**🌍 Real-Time Example — e-commerce checkout**

```python
# HSM or cloud KMS for key material; automated cert renewal (ACME)
```

### 23.5.2 HTTPS Redirect

**🟢 Beginner Example**

```python
SECURE_SSL_REDIRECT = True
```

**🟡 Intermediate Example — exempt health checks**

```python
# Use middleware ordering or separate internal port without redirect
```

**🔴 Expert Example — CDN flexible SSL**

```python
# Ensure origin still validates correct Host and forwarded proto headers
```

**🌍 Real-Time Example — SaaS custom domains**

```python
# ACME DNS-01 for wildcard certs per tenant subdomain
```

### 23.5.3 HSTS Headers

**🟢 Beginner Example**

```python
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

**🟡 Intermediate Example — staging shorter max-age**

```python
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
else:
    SECURE_HSTS_SECONDS = 0
```

**🔴 Expert Example — first deploy caution**

```python
# Start with short HSTS during cutover, then increase after validation
```

**🌍 Real-Time Example — social mobile PWA**

```python
# Preload list inclusion for apex domain
```

### 23.5.4 Certificate Management

**🟢 Beginner Example — Let's Encrypt certbot**

```bash
certbot certonly --webroot -w /var/www/html -d example.com
```

**🟡 Intermediate Example — Kubernetes cert-manager**

```yaml
# ClusterIssuer + Certificate CRD
```

**🔴 Expert Example — mutual TLS service mesh**

```python
# Sidecar validates client cert; Django trusts X-Client-Cert-DN from mesh only
```

**🌍 Real-Time Example — multi-region SaaS**

```python
# Global load balancer managed certs; origin cert pinning optional
```

### 23.5.5 Secure Cookies

**🟢 Beginner Example**

```python
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

**🟡 Intermediate Example**

```python
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
```

**🔴 Expert Example — `__Host-` prefix requirements**

```python
# SESSION_COOKIE_NAME = "__Host-sessionid"
# Requires Secure, Path=/, no Domain attribute
```

**🌍 Real-Time Example — e-commerce cart cookie**

```python
# Short-lived session; no sensitive PII in cookie payload
```

---

## 23.6 Session Security

### 23.6.1 Session Configuration

**🟢 Beginner Example**

```python
SESSION_ENGINE = "django.contrib.sessions.backends.db"
```

**🟡 Intermediate Example — cache/redis**

```python
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "sessions"
```

**🔴 Expert Example — signed cookie sessions (stateless trade-offs)**

```python
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
```

**🌍 Real-Time Example — SaaS horizontal scale**

```python
# Redis session store with TTL aligned to idle timeout
```

### 23.6.2 Session Timeout

**🟢 Beginner Example**

```python
SESSION_COOKIE_AGE = 60 * 60 * 2  # 2 hours
```

**🟡 Intermediate Example — sliding expiration middleware**

```python
request.session.set_expiry(60 * 30)  # 30 min idle on each request
```

**🔴 Expert Example — sensitive action re-auth**

```python
# Store last_sensitive_action_at; require password for payments if > 10 min
```

**🌍 Real-Time Example — banking-style SaaS**

```python
SESSION_COOKIE_AGE = 900
```

### 23.6.3 Secure Session Cookies

(Covered in 23.5.5; reinforce.)

**🟢 Beginner Example**

```python
SESSION_COOKIE_SECURE = True
```

**🟡 Intermediate Example**

```python
SESSION_COOKIE_SAMESITE = "Strict"  # stricter; may break some OAuth flows
```

**🔴 Expert Example — rotate session key on privilege change**

```python
from django.contrib.auth import login

def elevate_to_staff(request, user):
    login(request, user)
    request.session.cycle_key()
```

**🌍 Real-Time Example — impersonation feature**

```python
# Distinct session flag; clear on exit; audit log
```

### 23.6.4 Session Invalidation

**🟢 Beginner Example**

```python
from django.contrib.auth import logout

logout(request)
```

**🟡 Intermediate Example — invalidate all sessions for user**

```python
from django.contrib.sessions.models import Session
from django.utils import timezone

for s in Session.objects.filter(expire_date__gte=timezone.now()):
    data = s.get_decoded()
    if data.get("_auth_user_id") == str(user.id):
        s.delete()
```

**🔴 Expert Example — token version column**

```python
# user.session_version += 1; middleware rejects older sessions
```

**🌍 Real-Time Example — social account compromise**

```python
# User clicks "sign out everywhere" after suspected breach
```

### 23.6.5 Session Fixation Prevention

**🟢 Beginner Example — Django rotates session key on login**

```python
from django.contrib.auth import login

login(request, user)  # cycles session key by default
```

**🟡 Intermediate Example — explicit cycle**

```python
request.session.cycle_key()
```

**🔴 Expert Example — avoid session id in URL**

```python
# Never ?sessionid= — use cookies only
```

**🌍 Real-Time Example — e-commerce login before checkout**

```python
# Fresh session key after authentication success
```

---

## 23.7 Authentication Security

### 23.7.1 Brute Force Prevention

**🟢 Beginner Example — rate limit login view**

```python
from django.core.cache import cache

def login_throttled(request, username):
    key = f"loginfail:{username}"
    if cache.get(key, 0) >= 5:
        return True
    return False
```

**🟡 Intermediate Example — django-axes or similar**

```python
INSTALLED_APPS += ["axes"]
```

**🔴 Expert Example — exponential backoff per IP+user tuple**

```python
cache.set(f"lock:{ip}:{user}", True, timeout=2 ** failures)
```

**🌍 Real-Time Example — SaaS public login**

```python
# CAPTCHA after N failures; notify security channel
```

### 23.7.2 Account Lockout

**🟢 Beginner Example — manual flag**

```python
user.is_active = False
user.save(update_fields=["is_active"])
```

**🟡 Intermediate Example — timed lockout**

```python
cache.set(f"locked:{user.id}", True, timeout=3600)
```

**🔴 Expert Example — admin unlock workflow**

```python
# Support tool with audit + MFA verification
```

**🌍 Real-Time Example — e-commerce fraud spike**

```python
# Geo-velocity anomaly triggers step-up challenge, not permanent lock
```

### 23.7.3 Rate Limiting

**🟢 Beginner Example — DRF throttle**

```python
throttle_classes = [AnonRateThrottle]
```

**🟡 Intermediate Example — nginx limit_req**

```nginx
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
```

**🔴 Expert Example — per-tenant API buckets**

```python
# Token bucket in Redis keyed by org_id
```

**🌍 Real-Time Example — social signup burst**

```python
# SMS OTP endpoints heavily throttled per phone number
```

### 23.7.4 Login Alerts

**🟢 Beginner Example — signal on login**

```python
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

@receiver(user_logged_in)
def notify_login(sender, request, user, **kwargs):
    send_email.delay(user.email, "New login from {ip}".format(ip=request.META.get("REMOTE_ADDR")))
```

**🟡 Intermediate Example — new device fingerprint**

```python
# Compare user_agent hash; alert on mismatch
```

**🔴 Expert Example — risk-based step-up**

```python
# If impossible travel, require MFA
```

**🌍 Real-Time Example — SaaS enterprise SSO**

```python
# Alert on IdP login from new country
```

### 23.7.5 Session Monitoring

**🟢 Beginner Example — list active sessions (db backend)**

```python
# Iterate Session table for user id
```

**🟡 Intermediate Example — store device metadata**

```python
request.session["device_id"] = signed_device_id
```

**🔴 Expert Example — anomaly detection pipeline**

```python
# Stream session events to SIEM
```

**🌍 Real-Time Example — e-commerce admin**

```python
# Show concurrent staff sessions; force logout on credential change
```

---

## 23.8 API Security

### 23.8.1 API Key Management

**🟢 Beginner Example — hashed keys at rest**

```python
import hashlib
import secrets

raw = secrets.token_urlsafe(32)
digest = hashlib.sha256(raw.encode()).hexdigest()
# Store digest; show raw once to user
```

**🟡 Intermediate Example — prefix for support lookup**

```python
# live_sk_xxxx... store HMAC(sk_live_...)
```

**🔴 Expert Example — rotation without downtime**

```python
# Accept old key for grace window; dual-hash verification
```

**🌍 Real-Time Example — SaaS developer portal**

```python
# Per-environment keys; scoped to sandbox vs production
```

### 23.8.2 Token Security

**🟢 Beginner Example — short-lived JWT**

```python
ACCESS_TOKEN_LIFETIME = timedelta(minutes=15)
```

**🟡 Intermediate Example — refresh rotation**

```python
ROTATE_REFRESH_TOKENS = True
BLACKLIST_AFTER_ROTATION = True
```

**🔴 Expert Example — binding token to client cert or DPoP**

```python
# Financial APIs: demonstrate proof-of-possession
```

**🌍 Real-Time Example — mobile refresh in Keychain**

```python
# No tokens in query strings; Authorization header only
```

### 23.8.3 Scope Limitations

**🟢 Beginner Example — OAuth-style scopes list on token**

```python
token["scopes"] = ["orders:read"]
```

**🟡 Intermediate Example — DRF permission per scope**

```python
class ScopeRequired(permissions.BasePermission):
    def has_permission(self, request, view):
        needed = getattr(view, "required_scope", None)
        if not needed:
            return True
        return needed in request.auth.get("scopes", [])
```

**🔴 Expert Example — row-level scope**

```python
# Token tied to org_id; queryset always filtered
```

**🌍 Real-Time Example — e-commerce partner API**

```python
# read_inventory vs place_order scopes
```

### 23.8.4 Endpoint Security

**🟢 Beginner Example — `IsAuthenticated` default**

**🟡 Intermediate Example — IP allowlist middleware for `/internal/`**

```python
class InternalIPMiddleware:
    ALLOWED = {"10.0.0.0/8"}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith("/internal/"):
            ip = request.META.get("REMOTE_ADDR")
            if ip not in self.ALLOWED:  # use ipaddress module in real code
                return HttpResponseForbidden()
        return self.get_response(request)
```

**🔴 Expert Example — WAF + bot management in front of Django**

**🌍 Real-Time Example — SaaS webhook ingress separate from public API**

```python
# Different subdomain, stricter body size limits, signature auth
```

### 23.8.5 API Rate Limiting

**🟢 Beginner Example — DRF `DEFAULT_THROTTLE_RATES`**

**🟡 Intermediate Example — per-key limits**

```python
class KeyThrottle(SimpleRateThrottle):
    scope = "apikey"

    def get_cache_key(self, request, view):
        key = request.headers.get("X-API-Key")
        if not key:
            return None
        return self.cache_format % {"scope": self.scope, "ident": hashlib.sha256(key.encode()).hexdigest()}
```

**🔴 Expert Example — adaptive throttling under load**

```python
# Reduce burst when DB latency high
```

**🌍 Real-Time Example — social public graph API**

```python
# Tiered pricing: different throttle classes per subscription
```

---

## Best Practices

- Keep **`CsrfViewMiddleware`** enabled; exempt only with **strong alternative auth** (signatures, mTLS).
- Treat **all user input** as hostile until validated; prefer **ORM** and **bound parameters** for SQL.
- Default to **template auto-escaping**; use **`json_script`** for embedding JSON in HTML.
- Prefer **Argon2** or **PBKDF2** with modern parameters; **never** store reversible passwords.
- Enforce **HTTPS** end-to-end; set **HSTS** after verifying TLS works everywhere.
- Use **secure, HttpOnly, SameSite** cookies; **rotate session keys** on login and privilege changes.
- Combine **rate limiting**, **lockout**, and **monitoring** for authentication endpoints.
- For APIs, use **scoped tokens/keys**, **hash stored secrets**, and **separate** webhook ingress from user traffic.

---

## Common Mistakes to Avoid

- **`@csrf_exempt` on user-facing POST** without compensating controls.
- **String formatting** into SQL or dynamic ORM fragments.
- **`mark_safe` on user HTML** without sanitization.
- **Disabling CSP** because inline scripts are convenient.
- **Weak `SECRET_KEY` rotation** story (sessions invalidation plan missing).
- **SESSION_COOKIE_SECURE=False** in production behind HTTPS-only proxy misconfiguration.
- **Putting JWTs in URLs** or localStorage without XSS hardening.
- **Single global API key** per customer without rotation or audit.

---

## Comparison Tables

| Control | Protects against | Layer |
|---------|------------------|--------|
| CSRF token | Forged browser requests | Application |
| ORM / params | SQL injection | Data access |
| Auto-escape | Reflected/stored XSS | Template |
| CSP | XSS, some injection | Browser policy |
| TLS | MITM, credential theft | Transport |

| Hasher | Notes |
|--------|--------|
| PBKDF2 | Built-in; tune iterations |
| Argon2 | Memory-hard; needs package |
| bcrypt | 72-byte limit; Django wraps with SHA256 |

| Session backend | Pros | Cons |
|-----------------|------|------|
| Database | Simple | DB load |
| Cache/Redis | Fast, TTL | Infra dependency |
| Signed cookies | Stateless server | Size limits, revocation harder |

| API auth | Use when |
|----------|----------|
| Session + CSRF | Same-site browser client |
| Token / JWT | Mobile, SPAs with XSS care |
| mTLS | Service-to-service high trust |

---

*Django **6.0.3** security reference — verify settings with `python manage.py check --deploy` before go-live.*
