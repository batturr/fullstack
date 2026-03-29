# Django Middleware (Django 6.0.3)

**Middleware** is Django’s **request/response pipeline**: a stack of callables that can short-circuit, mutate, or observe HTTP traffic. Conceptually it resembles **Express middleware**, **ASP.NET middleware**, or **interceptors**—ordered layers around the view. This guide documents **Django 6.0.3** middleware behavior on **Python 3.12–3.14**, covering **built-in security**, **sessions**, **auth**, **CSRF**, **messages**, and **custom** patterns for **e‑commerce**, **social**, and **SaaS** platforms.

---

## 📑 Table of Contents

- [13.1 Middleware Basics](#131-middleware-basics)
  - [13.1.1 Concept](#1311-concept)
  - [13.1.2 Order](#1312-order)
  - [13.1.3 Request Processing](#1313-request-processing)
  - [13.1.4 Response Processing](#1314-response-processing)
  - [13.1.5 Lifecycle](#1315-lifecycle)
- [13.2 Creating Middleware](#132-creating-middleware)
  - [13.2.1 Structure](#1321-structure)
  - [13.2.2 __init__()](#1322-__init__)
  - [13.2.3 __call__()](#1323-__call__)
  - [13.2.4 get_response()](#1324-get_response)
  - [13.2.5 Registration](#1325-registration)
- [13.3 Built-in Middleware](#133-built-in-middleware)
  - [13.3.1 SecurityMiddleware](#1331-securitymiddleware)
  - [13.3.2 SessionMiddleware](#1332-sessionmiddleware)
  - [13.3.3 AuthenticationMiddleware](#1333-authenticationmiddleware)
  - [13.3.4 CsrfViewMiddleware](#1334-csrfviewmiddleware)
  - [13.3.5 MessageMiddleware](#1335-messagemiddleware)
- [13.4 Request Middleware](#134-request-middleware)
  - [13.4.1 Request Modification](#1341-request-modification)
  - [13.4.2 Headers](#1342-headers)
  - [13.4.3 Attributes](#1343-attributes)
  - [13.4.4 User Detection](#1344-user-detection)
  - [13.4.5 Logging](#1345-logging)
- [13.5 Response Middleware](#135-response-middleware)
  - [13.5.1 Response Modification](#1351-response-modification)
  - [13.5.2 Headers](#1352-headers)
  - [13.5.3 Compression](#1353-compression)
  - [13.5.4 Content Type](#1354-content-type)
  - [13.5.5 Status Codes](#1355-status-codes)
- [13.6 Exception Middleware](#136-exception-middleware)
  - [13.6.1 Exception Handling](#1361-exception-handling)
  - [13.6.2 Error Responses](#1362-error-responses)
  - [13.6.3 Custom Error Handling](#1363-custom-error-handling)
  - [13.6.4 Logging Exceptions](#1364-logging-exceptions)
  - [13.6.5 Exception Chain](#1365-exception-chain)
- [Best Practices (Chapter Summary)](#best-practices-chapter-summary)
- [Common Mistakes (Chapter Summary)](#common-mistakes-chapter-summary)
- [Comparison Tables](#comparison-tables)

---

## 13.1 Middleware Basics

### 13.1.1 Concept

Each middleware wraps **`get_response`**: **inbound** code runs before the view, **outbound** after (on the way back). Middleware can return a response early without calling the view.

**🟢 Beginner Example**

```text
Request → M1.before → M2.before → VIEW → M2.after → M1.after → Response
```

**🟡 Intermediate Example**

```python
def simple_middleware(get_response):
    def middleware(request):
        print("before view")
        response = get_response(request)
        print("after view")
        return response
    return middleware
```

**🔴 Expert Example**

**ASGI** applications use a different stack; this chapter focuses on **WSGI** **`MIDDLEWARE`** setting.

**🌍 Real-Time Example**

SaaS: middleware injects **`request.tenant`** from subdomain before URLs resolve.

---

### 13.1.2 Order

**`MIDDLEWARE`** is **top-down** on request, **bottom-up** on response. **Security** and **session** order matters per Django docs.

**🟢 Beginner Example**

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
```

**🟡 Intermediate Example**

Custom **`TenantMiddleware`** after **`SessionMiddleware`** if tenant id stored in session.

**🔴 Expert Example**

**`LocaleMiddleware`** position affects **`i18n_patterns`** resolution.

**🌍 Real-Time Example**

E‑commerce: **`CartMiddleware`** after session so cart key exists.

---

### 13.1.3 Request Processing

Use middleware for **cross-cutting** concerns: locale, correlation IDs, feature flags snapshot.

**🟢 Beginner Example**

```python
def add_request_id(get_response):
    import uuid
    def middleware(request):
        request.request_id = str(uuid.uuid4())
        return get_response(request)
    return middleware
```

**🟡 Intermediate Example**

Attach **`request.start_time = time.perf_counter()`** for metrics.

**🔴 Expert Example**

OpenTelemetry span as context variable around **`get_response`**.

**🌍 Real-Time Example**

SaaS: resolve **`request.organization`** from header **`X-Org-Id`** validated against membership.

---

### 13.1.4 Response Processing

Add headers, cookies, or transform content (careful with streaming).

**🟢 Beginner Example**

```python
def middleware(request):
    response = get_response(request)
    response["X-Request-ID"] = getattr(request, "request_id", "")
    return response
```

**🟡 Intermediate Example**

```python
if response.get("Content-Type", "").startswith("text/html"):
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
```

**🔴 Expert Example**

**Content Security Policy** nonces require cooperation with template layer.

**🌍 Real-Time Example**

Social: **`Cache-Control`** for public profile pages vs private settings.

---

### 13.1.5 Lifecycle

One middleware instance per process; **`__call__`** per request.

**🟢 Beginner Example**

Stateless middleware only—no per-request mutable class attributes.

**🟡 Intermediate Example**

Use **`request`** attributes instead of **`self`** for per-request data.

**🔴 Expert Example**

Connection pooling lives outside middleware on **`self`** if thread-safe.

**🌍 Real-Time Example**

Worker recycling (Gunicorn) resets process-global caches periodically.

---

## 13.2 Creating Middleware

### 13.2.1 Structure

**Functional** or **class-based** (`MiddlewareMixin` optional for sync/async bridging patterns).

**🟢 Beginner Example**

```python
def my_middleware(get_response):
    def middleware(request):
        return get_response(request)
    return middleware
```

**🟡 Intermediate Example**

```python
class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)
```

**🔴 Expert Example**

```python
from django.utils.deprecation import MiddlewareMixin

class CompatibleMiddleware(MiddlewareMixin):
    def process_request(self, request):
        ...
    def process_response(self, request, response):
        return response
```

**🌍 Real-Time Example**

SaaS feature flag snapshot:

```python
class FeatureFlagsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.flags = flags_service.resolve(request.user)
        return self.get_response(request)
```

---

### 13.2.2 __init__()

Runs at **process start**; receives **`get_response`** callable.

**🟢 Beginner Example**

```python
def __init__(self, get_response):
    self.get_response = get_response
```

**🟡 Intermediate Example**

Parse settings once:

```python
def __init__(self, get_response):
    self.get_response = get_response
    self.trusted_proxies = settings.TRUSTED_PROXIES
```

**🔴 Expert Example**

Avoid heavy IO in **`__init__`**—defer to first request or app **`ready()`**.

**🌍 Real-Time Example**

Compile regexes for path exclusions once.

---

### 13.2.3 __call__()

**Per-request** entry.

**🟢 Beginner Example**

```python
def __call__(self, request):
    return self.get_response(request)
```

**🟡 Intermediate Example**

```python
def __call__(self, request):
    if request.path.startswith("/health"):
        return HttpResponse("ok")
    return self.get_response(request)
```

**🔴 Expert Example**

```python
def __call__(self, request):
    response = self.get_response(request)
    return response
```

**🌍 Real-Time Example**

Maintenance mode: return **503** for non-staff outside allowlist.

---

### 13.2.4 get_response()

Invokes **next** middleware or view.

**🟢 Beginner Example**

```python
response = self.get_response(request)
```

**🟡 Intermediate Example**

Wrap with **try/except** for logging (see exception section).

**🔴 Expert Example**

**StreamingHttpResponse**: middleware may not read **`content`** safely.

**🌍 Real-Time Example**

Measure **view duration** around **`get_response`**.

---

### 13.2.5 Registration

Add dotted path to **`MIDDLEWARE`**.

**🟢 Beginner Example**

```python
MIDDLEWARE = [
    "myapp.middleware.RequestIdMiddleware",
    ...
]
```

**🟡 Intermediate Example**

Different middleware stacks via **`settings` split** (dev vs prod).

**🔴 Expert Example**

Test settings strip security middleware for unit tests (carefully).

**🌍 Real-Time Example**

E‑commerce: **`GeoIPMiddleware`** near top after security.

---

## 13.3 Built-in Middleware

### 13.3.1 SecurityMiddleware

Sets **security headers**, **SSL redirect**, **HSTS** when configured.

**🟢 Beginner Example**

```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

**🟡 Intermediate Example**

```python
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

**🔴 Expert Example**

**`SECURE_PROXY_SSL_HEADER`** behind reverse proxy:

```python
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
```

**🌍 Real-Time Example**

SaaS multi-tenant subdomains behind **Cloudflare**.

---

### 13.3.2 SessionMiddleware

Adds **`request.session`**.

**🟢 Beginner Example**

```python
request.session["cart_id"] = cart.id
```

**🟡 Intermediate Example**

```python
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
```

**🔴 Expert Example**

**`SESSION_SAVE_EVERY_REQUEST`** interacts with **sliding expiration** semantics.

**🌍 Real-Time Example**

E‑commerce persistent cart across devices when logged in.

---

### 13.3.3 AuthenticationMiddleware

Sets **`request.user`** using **`SESSION_KEY`**.

**🟢 Beginner Example**

```python
if request.user.is_authenticated:
    ...
```

**🟡 Intermediate Example**

Custom user loaded lazily from token in **`AuthenticationMiddleware`** subclass (advanced).

**🔴 Expert Example**

**`AUTHENTICATION_BACKENDS`** order matters for **`authenticate`**.

**🌍 Real-Time Example**

SaaS: attach **`request.user.profile`** via separate middleware after auth.

---

### 13.3.4 CsrfViewMiddleware

Enforces CSRF on unsafe methods for protected views.

**🟢 Beginner Example**

```django
<form method="post">{% csrf_token %}
```

**🟡 Intermediate Example**

```python
from django.views.decorators.csrf import csrf_exempt  # use sparingly
```

**🔴 Expert Example**

**`CSRF_TRUSTED_ORIGINS`** for cross-subdomain SPA.

**🌍 Real-Time Example**

Payment gateway webhooks: **`csrf_exempt`** + **signature verification**.

---

### 13.3.5 MessageMiddleware

**`django.contrib.messages`** flash storage.

**🟢 Beginner Example**

```python
from django.contrib import messages
messages.success(request, "Saved.")
```

**🟡 Intermediate Example**

```python
MESSAGE_STORAGE = "django.contrib.messages.storage.session.SessionStorage"
```

**🔴 Expert Example**

**`MessageMiddleware`** must follow **`SessionMiddleware`**.

**🌍 Real-Time Example**

Social: toast notifications after post creation.

---

## 13.4 Request Middleware

### 13.4.1 Request Modification

Normalize paths, enforce canonical host.

**🟢 Beginner Example**

```python
def __call__(self, request):
    request.path_info = request.path_info.rstrip("/") or "/"
    return self.get_response(request)
```

**🟡 Intermediate Example**

Lowercase **`PATH_INFO`** for case-insensitive URLs (careful with media).

**🔴 Expert Example**

**`request.tenant = resolve_tenant(request)`** before URLconf selection (dynamic URLConf).

**🌍 Real-Time Example**

SaaS: **`acme.app.com`** vs path-based **`/t/acme/`** strategies.

---

### 13.4.2 Headers

Read **`request.headers`** (Django 2.2+) or **`META`**.

**🟢 Beginner Example**

```python
lang = request.headers.get("Accept-Language", "en")
```

**🟡 Intermediate Example**

```python
api_version = request.headers.get("X-API-Version", "1")
```

**🔴 Expert Example**

**`Authorization`** parsing for **optional** bearer on hybrid HTML/API site.

**🌍 Real-Time Example**

E‑commerce mobile app sends **`X-Device-Id`** for fraud scoring.

---

### 13.4.3 Attributes

Namespace custom attributes on **`request`** (`request.tenant`).

**🟢 Beginner Example**

```python
request.correlation_id = uuid.uuid4().hex
```

**🟡 Intermediate Example**

```python
request.is_impersonating = session.get("impersonator_id") is not None
```

**🔴 Expert Example**

Use **`SimpleLazyObject`** for expensive attributes:

```python
from django.utils.functional import SimpleLazyObject

def _user_org(user):
    ...

request.org = SimpleLazyObject(lambda: _user_org(request.user))
```

**🌍 Real-Time Example**

SaaS billing: **`request.billing_account`** lazy-loaded.

---

### 13.4.4 User Detection

Before **`AuthenticationMiddleware`**, **`user`** is **`SimpleLazyObject`** unresolved.

**🟢 Beginner Example**

Place custom middleware **after** **`AuthenticationMiddleware`** if needing **`request.user`**.

**🟡 Intermediate Example**

```python
class StaffAuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated and request.user.is_staff:
            logger.info("staff_hit", extra={"path": request.path, "user": request.user.pk})
        return response
```

**🔴 Expert Example**

Avoid DB in middleware for every request—sample or async log ship.

**🌍 Real-Time Example**

Social: mark **`last_seen_at`** throttled in cache.

---

### 13.4.5 Logging

Structured logs with **request context**.

**🟢 Beginner Example**

```python
import logging
logger = logging.getLogger(__name__)

def __call__(self, request):
    logger.info("request.start", extra={"path": request.path})
    return self.get_response(request)
```

**🟡 Intermediate Example**

Bind **`request_id`** in **`logging.LoggerAdapter`**.

**🔴 Expert Example**

OpenTelemetry **`trace.get_current_span()`** attributes.

**🌍 Real-Time Example**

SaaS SIEM: JSON logs with **`tenant_id`**, **`user_id`**, **`trace_id`**.

---

## 13.5 Response Middleware

### 13.5.1 Response Modification

Add cookies, vary headers.

**🟢 Beginner Example**

```python
response = self.get_response(request)
response.set_cookie("theme", request.COOKIES.get("theme", "light"), samesite="Lax")
return response
```

**🟡 Intermediate Example**

```python
response["Vary"] = "Accept-Language"
```

**🔴 Expert Example**

Post-process HTML with **django-compressor** or **template-level** partials instead of regex on full body.

**🌍 Real-Time Example**

E‑commerce: **`Set-Cookie`** for **A/B** assignment bucket.

---

### 13.5.2 Headers

Security headers beyond **`SecurityMiddleware`** defaults.

**🟢 Beginner Example**

```python
response["X-Content-Type-Options"] = "nosniff"
```

**🟡 Intermediate Example**

```python
response["Permissions-Policy"] = "camera=(), microphone=()"
```

**🔴 Expert Example**

**`Cross-Origin-Opener-Policy`** for isolated browsing contexts.

**🌍 Real-Time Example**

SaaS admin: stricter **CSP** than marketing site.

---

### 13.5.3 Compression

Prefer **gzip at reverse proxy** (nginx) over Python gzip middleware (removed from default stack).

**🟢 Beginner Example**

Enable **`gzip_static`** in nginx.

**🟡 Intermediate Example**

**`whitenoise.middleware.WhiteNoiseMiddleware`** serves compressed static if available.

**🔴 Expert Example**

**Brotli** at CDN edge.

**🌍 Real-Time Example**

Global SaaS: **CloudFront** compression.

---

### 13.5.4 Content Type

Ensure **`Content-Type`** for error handlers.

**🟢 Beginner Example**

```python
return HttpResponse("Error", status=500, content_type="text/plain")
```

**🟡 Intermediate Example**

**`JsonResponse`** for API errors.

**🔴 Expert Example**

**`Accept`** negotiation middleware returns **406** when unsupported.

**🌍 Real-Time Example**

Social API: always **`application/json; charset=utf-8`**.

---

### 13.5.5 Status Codes

Middleware may map exceptions to **4xx/5xx**.

**🟢 Beginner Example**

```python
from django.http import HttpResponseNotFound

if request.path in BLOCKED_PATHS:
    return HttpResponseNotFound()
```

**🟡 Intermediate Example**

Return **429** from rate-limit middleware.

**🔴 Expert Example**

**`Retry-After`** header on throttle.

**🌍 Real-Time Example**

E‑commerce flash sale: queue middleware returns **503** with **`Retry-After`**.

---

## 13.6 Exception Middleware

### 13.6.1 Exception Handling

**`try`/`except`** around **`get_response(request)`**.

**🟢 Beginner Example**

```python
def __call__(self, request):
    try:
        return self.get_response(request)
    except DatabaseError:
        return HttpResponseServerError("Please try again.")
```

**🟡 Intermediate Example**

```python
except PermissionDenied:
    return HttpResponseForbidden()
```

**🔴 Expert Example**

Re-raise after logging to let **`DEBUG`** handler show stack in dev.

**🌍 Real-Time Example**

SaaS: **`IntegrityError`** mapped to user-friendly **409** JSON.

---

### 13.6.2 Error Responses

Consistent JSON vs HTML based on **`Accept`**.

**🟢 Beginner Example**

```python
from django.http import JsonResponse

return JsonResponse({"error": "bad_request"}, status=400)
```

**🟡 Intermediate Example**

```python
def __call__(self, request):
    try:
        return self.get_response(request)
    except ValidationError as e:
        if request.headers.get("Accept", "").startswith("application/json"):
            return JsonResponse({"detail": e.messages}, status=422)
        raise
```

**🔴 Expert Example**

**RFC 7807** **`problem+json`**.

**🌍 Real-Time Example**

Mobile app expects structured error codes.

---

### 13.6.3 Custom Error Handling

**`handler404`**, **`handler500`** in **URLconf** root.

**🟢 Beginner Example**

```python
handler404 = "myapp.views.custom_404"
```

**🟡 Intermediate Example**

```python
def custom_500(request):
    return render(request, "500.html", status=500)
```

**🔴 Expert Example**

**Sentry** SDK captures exceptions in **`before_send`** filter.

**🌍 Real-Time Example**

E‑commerce branded error pages with **support** link.

---

### 13.6.4 Logging Exceptions

**`logger.exception`** includes traceback.

**🟢 Beginner Example**

```python
except Exception:
    logger.exception("unhandled_error")
    raise
```

**🟡 Intermediate Example**

```python
logger.error("payment_failed", exc_info=True, extra={"order_id": order_id})
```

**🔴 Expert Example**

Scrub **PII** from exception messages before external logging.

**🌍 Real-Time Example**

SaaS: alert on **5xx** rate spike via metrics middleware.

---

### 13.6.5 Exception Chain

Preserve **`__cause__`** / **`from e`** when wrapping.

**🟢 Beginner Example**

```python
except ValueError as e:
    raise Http404("Not found") from e
```

**🟡 Intermediate Example**

```python
except ExternalAPIError as e:
    raise ServiceUnavailable from e
```

**🔴 Expert Example**

**`MiddlewareNotUsed`** (deprecated patterns)—prefer explicit removal from **`MIDDLEWARE`**.

**🌍 Real-Time Example**

Payment provider timeout → **502** with internal correlation id, chained cause in logs only.

---

## Best Practices (Chapter Summary)

- Keep middleware **fast** and **stateless** per request; avoid synchronous external API calls.
- Place middleware according to **Django documentation**—order is security-critical.
- Prefer **view decorators** or **mixins** for localized logic; middleware for **global** concerns.
- Do not store **secrets** in middleware globals without thread safety considerations.
- Use **`request`** attributes with clear names to avoid collisions (`request._dont_use` anti-pattern).
- Test middleware with **`RequestFactory`** and integration tests.
- Behind proxies, configure **`SECURE_PROXY_SSL_HEADER`** and **`USE_X_FORWARDED_HOST`** carefully.
- For streaming responses, avoid reading **`response.content`** unless necessary.

---

## Common Mistakes (Chapter Summary)

- Middleware **before** **`SessionMiddleware`** trying to access **`request.session`**.
- **Mutating** immutable request fields incorrectly.
- Heavy **DB** work on every request killing latency.
- Swallowing exceptions silently without logging.
- **Ordering** mistakes: **`AuthenticationMiddleware`** before **`SessionMiddleware`** (invalid).
- Using middleware for **authorization** that should be **per-view** (hidden coupling).
- **CSRF exempt** applied too broadly.

---

## Comparison Tables

| Approach | Scope | Visibility |
|----------|-------|------------|
| Middleware | Global | Implicit |
| Mixin / decorator | View | Explicit |
| Template context processor | Templates only | Render time |

| Phase | When code runs |
|-------|----------------|
| Request half | Before view |
| Response half | After view |

| Middleware | Primary role |
|------------|--------------|
| `SecurityMiddleware` | HTTPS/HSTS/headers |
| `SessionMiddleware` | Session cookie |
| `AuthenticationMiddleware` | `request.user` |
| `CsrfViewMiddleware` | CSRF validation |
| `MessageMiddleware` | Flash messages |

| Error surface | Mechanism |
|---------------|-----------|
| `handler500` | Global 500 page |
| `try/except` in middleware | Convert exception |
| DRF exception handlers | API errors |

---

*Confirm **`MIDDLEWARE`** defaults and deprecations in the **Django 6.0.3** release notes; async middleware capabilities evolve—check official docs if you use **ASGI** throughout.*
