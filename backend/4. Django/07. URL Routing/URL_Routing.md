# URL Routing (Django 6.0.3)

Django maps URL paths to views with **`path()`**, **`re_path()`**, **`include()`**, path **converters**, and optional **namespaces**. Clean URL design improves SEO, security (predictable routes), and maintainability across e-commerce, social, and SaaS products. These notes target **Python 3.12–3.14** alongside **Django 6.0.3**.

---

## 📑 Table of Contents

1. [7.1 URL Patterns](#71-url-patterns)
2. [7.2 Namespace Organization](#72-namespace-organization)
3. [7.3 Reverse URL Resolution](#73-reverse-url-resolution)
4. [7.4 URL Parameters](#74-url-parameters)
5. [7.5 URL Organization](#75-url-organization)
6. [7.6 Advanced URL Features](#76-advanced-url-features)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 7.1 URL Patterns

### `path()`

Primary API: **`path(route, view, kwargs=None, name=None)`**. Use angle-bracket **converters**.

#### 🟢 Beginner Example

```python
from django.urls import path
from shop import views

urlpatterns = [
    path("", views.home, name="home"),
    path("products/", views.product_list, name="product_list"),
]
```

#### 🟡 Intermediate Example — Captured parameter

```python
path("products/<int:pk>/", views.product_detail, name="product_detail"),
```

#### 🔴 Expert Example — Nested includes with consistent trailing slashes

```python
from django.urls import path, include

urlpatterns = [
    path("shop/", include("shop.urls")),
]
```

#### 🌍 Real-Time Example — E-commerce storefront

```python
urlpatterns = [
    path("", include("catalog.urls")),
    path("cart/", include("cart.urls")),
    path("checkout/", include("checkout.urls")),
]
```

---

### `re_path()` for Regex

Use when **`path()`** converters are insufficient—still prefer **`path()`** for readability.

#### 🟢 Beginner Example

```python
from django.urls import re_path
from blog import views

urlpatterns = [
    re_path(r"^articles/(?P<year>[0-9]{4})/$", views.year_archive, name="articles_by_year"),
]
```

#### 🟡 Intermediate Example — Careful anchoring

```python
re_path(r"^profile/(?P<username>[\w.@+-]+)/$", views.profile, name="profile"),
```

#### 🔴 Expert Example — Legacy URL compatibility

```python
re_path(r"^item\.php$", views.legacy_item_redirect, name="legacy_item"),
```

#### 🌍 Real-Time Example — Social legacy deep links

```text
Return HTTP 301 from legacy regex routes to canonical `path()` URLs for SEO.
```

---

### `include()`

Mount another **`URLconf`** module at a prefix.

#### 🟢 Beginner Example

```python
from django.urls import path, include

urlpatterns = [
    path("accounts/", include("django.contrib.auth.urls")),
]
```

#### 🟡 Intermediate Example — Tuple include with application namespace

```python
urlpatterns = [
    path("api/v1/", include(("api.v1.urls", "api_v1"), namespace="v1")),
]
```

#### 🔴 Expert Example — Static includes only

```text
Do not build `include()` targets from untrusted user input.
```

#### 🌍 Real-Time Example — SaaS optional plugin routes

```python
from django.conf import settings

if settings.ENABLE_ANALYTICS_APP:
    urlpatterns += [path("analytics/", include("analytics.urls"))]
```

---

### Converters: `str`, `int`, `slug`, `uuid`

Built-in converters validate and cast captured segments.

#### 🟢 Beginner Example — `slug` and `int`

```python
path("u/<slug:username>/", views.user_profile, name="user_profile"),
path("p/<int:id>/", views.by_int_id, name="by_int_id"),
```

#### 🟡 Intermediate Example — `uuid`

```python
urlpatterns = [
    path("files/<uuid:file_id>/", views.file_detail, name="file_detail"),
]
```

#### 🔴 Expert Example — Invalid UUID returns 404 at match time

```text
Malformed UUIDs never reach the view—good for safety; document for API clients.
```

#### 🌍 Real-Time Example — E-commerce shareable cart

```python
path("shared-cart/<uuid:token>/", views.shared_cart, name="shared_cart"),
```

---

### Custom Path Converters

Register a class with **`register_converter()`**.

#### 🟢 Beginner Example

```python
from django.urls import register_converter, path

class FourDigitYearConverter:
    regex = "[0-9]{4}"

    def to_python(self, value):
        return int(value)

    def to_url(self, value):
        return f"{value:04d}"

register_converter(FourDigitYearConverter, "yyyy")

urlpatterns = [
    path("archive/<yyyy:year>/", views.year_archive, name="year_archive"),
]
```

#### 🟡 Intermediate Example — SKU pattern

```python
class SkuConverter:
    regex = "[A-Z0-9-]{3,32}"

    def to_python(self, value):
        return value.upper()

    def to_url(self, value):
        return str(value)

register_converter(SkuConverter, "sku")

urlpatterns = [
    path("p/<sku:code>/", views.product_by_sku, name="product_by_sku"),
]
```

#### 🔴 Expert Example — Tight regex performance

```text
Avoid catastrophic backtracking in custom converters; prefer simple character classes.
```

#### 🌍 Real-Time Example — SaaS public resource codes

```python
register_converter(SkuConverter, "public_code")
path("r/<public_code:code>/", views.resolve_code, name="resolve_code"),
```

---

## 7.2 Namespace Organization

### URL Namespaces

Avoid name collisions between apps using **`namespace`** with **`include()`**.

#### 🟢 Beginner Example — Project urls

```python
from django.urls import path, include

urlpatterns = [
    path("blog/", include(("blog.urls", "blog"), namespace="blog")),
]
```

#### 🟡 Intermediate Example — `app_name` in app urls

```python
# blog/urls.py
app_name = "blog"

urlpatterns = [
    path("posts/<slug:slug>/", views.detail, name="post_detail"),
]
```

#### 🔴 Expert Example — Reverse with namespace

```python
from django.urls import reverse

reverse("blog:post_detail", kwargs={"slug": "hello"})
```

#### 🌍 Real-Time Example — E-commerce `catalog:` vs `cart:`

```python
# catalog/urls.py
app_name = "catalog"
```

---

### Application Namespaces

Set with **`app_name`** in the included module.

#### 🟢 Beginner Example

```python
app_name = "shop"

urlpatterns = [
    path("", views.home, name="home"),
]
```

#### 🟡 Intermediate Example — Reverse

```python
reverse("shop:home")
```

#### 🔴 Expert Example — Same `name` in different apps

```text
`shop:detail` vs `blog:detail` prevents accidental cross-linking.
```

#### 🌍 Real-Time Example — SaaS `settings:` vs `billing:`

```python
reverse("billing:invoice", kwargs={"pk": 12})
```

---

### Instance Namespaces

Include the **same URLconf** twice with different **instance** namespaces.

#### 🟢 Beginner Example

```python
urlpatterns = [
    path("help/en/", include(("help.urls", "help"), namespace="help_en")),
    path("help/es/", include(("help.urls", "help"), namespace="help_es")),
]
```

#### 🟡 Intermediate Example — Reverse to instance

```python
reverse("help_en:topic", kwargs={"slug": "shipping"})
```

#### 🔴 Expert Example — Requires tuple form

```text
When passing `namespace=` to `include()`, use the `(urlconf_module, app_name)` tuple.
```

#### 🌍 Real-Time Example — Social localized help centers

```text
Same `help.urls` mounted per locale with distinct instance namespaces.
```

---

### Nested Namespaces

Multiple **`:`** segments, e.g. **`admin:index`**.

#### 🟢 Beginner Example

```python
reverse("admin:app_list", kwargs={"app_label": "shop"})
```

#### 🟡 Intermediate Example — API nesting

```python
reverse("v1:accounts:me")
```

#### 🔴 Expert Example — Keep depth reasonable

```text
Prefer `v1:account-detail` over four-level namespaces for readability.
```

#### 🌍 Real-Time Example — SaaS partner API surface

```python
reverse("partner:v1:delivery_status", kwargs={"id": delivery_id})
```

---

### Reverse URLs

Use **`{% url %}`** or **`reverse()`** instead of hardcoding paths.

#### 🟢 Beginner Example — Template

```django
<a href="{% url 'catalog:product' slug=product.slug %}">{{ product.name }}</a>
```

#### 🟡 Intermediate Example — Python

```python
from django.urls import reverse

url = reverse("checkout:confirm", kwargs={"order_id": order.id})
```

#### 🔴 Expert Example — Absolute URI

```python
def absolute(request, name, **kwargs):
    return request.build_absolute_uri(reverse(name, kwargs=kwargs))
```

#### 🌍 Real-Time Example — E-commerce transactional email

```python
link = request.build_absolute_uri(reverse("orders:detail", kwargs={"pk": order.pk}))
```

---

## 7.3 Reverse URL Resolution

### `reverse()`

Resolves **name + kwargs/args** to a path string.

#### 🟢 Beginner Example

```python
from django.urls import reverse

reverse("blog:post_detail", kwargs={"slug": "django-6"})
```

#### 🟡 Intermediate Example — Query string separate

```python
from urllib.parse import urlencode

base = reverse("search:results")
url = f"{base}?{urlencode({'q': 'mug'})}"
```

#### 🔴 Expert Example — `NoReverseMatch` diagnostics

```text
Log `args`, `kwargs`, and active URLconf when debugging reverses in tests.
```

#### 🌍 Real-Time Example — SaaS email verification

```python
reverse("accounts:verify", kwargs={"uidb64": uid, "token": token})
```

---

### `reverse_lazy()`

Use where **`reverse()`** would run at **import** time (e.g. **`success_url`** on CBVs).

#### 🟢 Beginner Example

```python
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView

class TagCreateView(CreateView):
    model = Tag
    fields = ["name"]
    success_url = reverse_lazy("tags:list")
```

#### 🟡 Intermediate Example — Model `get_absolute_url` not lazy

```text
Inside model methods, plain `reverse` is fine—models load after URLconf.
```

#### 🔴 Expert Example — Why lazy matters

```text
Import order: settings → urls → views; `reverse_lazy` defers until access.
```

#### 🌍 Real-Time Example — E-commerce post-checkout redirect

```python
success_url = reverse_lazy("cart:detail")
```

---

### `get_absolute_url()`

Canonical object URL for templates and admin “View on site”.

#### 🟢 Beginner Example

```python
from django.db import models
from django.urls import reverse

class Article(models.Model):
    slug = models.SlugField(unique=True)

    def get_absolute_url(self):
        return reverse("blog:detail", kwargs={"slug": self.slug})
```

#### 🟡 Intermediate Example — Template usage

```django
<a href="{{ article.get_absolute_url }}">Read more</a>
```

#### 🔴 Expert Example — Keep relative path only

```text
Use `request.build_absolute_uri()` when you need fully qualified URLs.
```

#### 🌍 Real-Time Example — Social profile

```python
def get_absolute_url(self):
    return reverse("profiles:detail", kwargs={"handle": self.handle})
```

---

### URL Names

Each **`path(..., name="x")`** registers a name in the active namespace.

#### 🟢 Beginner Example

```python
path("about/", views.about, name="about"),
```

#### 🟡 Intermediate Example — CRUD naming convention

```text
`product_list`, `product_detail`, `product_create`, `product_update`, `product_delete`.
```

#### 🔴 Expert Example — Collisions without namespaces

```text
Last-loaded duplicate `name` wins—hard-to-debug reverses in large projects.
```

#### 🌍 Real-Time Example — SaaS HTMX partials

```python
path("invoices/<int:pk>/_row/", views.invoice_row, name="invoice_row"),
```

---

### Named URL Patterns

Decouple templates and serializers from hardcoded paths.

#### 🟢 Beginner Example

```django
<form action="{% url 'accounts:login' %}" method="post">
```

#### 🟡 Intermediate Example — `redirect()` by name

```python
from django.shortcuts import redirect

return redirect("catalog:list")
```

#### 🔴 Expert Example — Test `resolve` + `reverse` roundtrip

```python
from django.urls import resolve, reverse

def test_product_roundtrip():
    url = reverse("catalog:product", kwargs={"slug": "mug"})
    match = resolve(url)
    assert match.url_name == "product"
```

#### 🌍 Real-Time Example — E-commerce sitemap

```python
urls = [
    request.build_absolute_uri(reverse("catalog:product", kwargs={"slug": p.slug}))
    for p in Product.objects.filter(is_active=True)
]
```

---

## 7.4 URL Parameters

### Positional Parameters

Captured groups passed as **positional args** to the view.

#### 🟢 Beginner Example

```python
path("archive/<int:year>/<int:month>/", views.month_archive, name="month_archive"),
```

```python
def month_archive(request, year: int, month: int):
    ...
```

#### 🟡 Intermediate Example — `reverse` with args

```python
reverse("blog:month_archive", args=[2026, 3])
```

#### 🔴 Expert Example — Signature mismatch

```text
`TypeError` if view parameters don’t match captures and `**kwargs`.
```

#### 🌍 Real-Time Example — SaaS fiscal periods

```python
path("reports/<int:year>/<int:quarter>/", views.quarter, name="quarter"),
```

---

### Keyword Parameters

Named captures map to view **kwargs**.

#### 🟢 Beginner Example

```python
path("users/<slug:username>/", views.profile, name="profile"),
```

#### 🟡 Intermediate Example

```python
reverse("accounts:profile", kwargs={"username": "ada"})
```

#### 🔴 Expert Example — Static kwargs in `path()`

```python
path("internal/", views.dashboard, {"section": "ops"}, name="internal_ops"),
```

#### 🌍 Real-Time Example — E-commerce vendor storefront

```python
path("vendors/<slug:slug>/", views.vendor_storefront, name="vendor"),
```

---

### Type Conversion

Converters coerce values before the view runs.

#### 🟢 Beginner Example

```python
def order_detail(request, order_id: int):
    assert isinstance(order_id, int)
```

#### 🟡 Intermediate Example — UUID objects

```python
def file_detail(request, file_id):
    # uuid.UUID
    ...
```

#### 🔴 Expert Example — Custom converter errors

```text
Invalid values become 404 during resolution—not `ValidationError` in the view.
```

#### 🌍 Real-Time Example — Social invite links

```python
path("join/<uuid:invite_id>/", views.accept_invite, name="accept_invite"),
```

---

### Optional Parameters

`path()` has no optional segments—use **multiple routes** or **query strings**.

#### 🟢 Beginner Example — Two routes to same view

```python
urlpatterns = [
    path("search/", views.search, name="search"),
    path("search/<slug:category>/", views.search, name="search_category"),
]
```

#### 🟡 Intermediate Example — Query params

```python
def search(request):
    category = request.GET.get("category")
```

#### 🔴 Expert Example — Prefer query for filters

```text
`/products/?color=blue` scales better than exploding combinatoric path patterns.
```

#### 🌍 Real-Time Example — E-commerce category + filters

```python
path("c/<slug:slug>/", views.category, name="category"),
```

---

### Multiple Parameters

Several captures in one pattern.

#### 🟢 Beginner Example

```python
path("org/<slug:org_slug>/team/<slug:team_slug>/", views.team, name="team"),
```

#### 🟡 Intermediate Example

```python
reverse("orgs:team", kwargs={"org_slug": "acme", "team_slug": "payments"})
```

#### 🔴 Expert Example — Descriptive names

```text
Avoid generic `slug` repeated twice—name them `org_slug` and `team_slug`.
```

#### 🌍 Real-Time Example — SaaS nested resources

```python
path("w/<slug:workspace>/projects/<slug:project>/", views.project, name="project"),
```

---

## 7.5 URL Organization

### Project-level `urls.py`

Root **`urlpatterns`** wire admin, APIs, and site sections.

#### 🟢 Beginner Example

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("shop.urls")),
]
```

#### 🟡 Intermediate Example — Ops endpoints

```python
urlpatterns += [path("healthz", health), path("readyz", ready)]
```

#### 🔴 Expert Example — Split root urls package

```text
`myproject/urls/__init__.py` aggregates `public.py`, `staff.py`, `api.py`.
```

#### 🌍 Real-Time Example — E-commerce

```python
urlpatterns = [
    path("api/v1/", include("api.v1.urls")),
    path("", include("storefront.urls")),
]
```

---

### App-level `urls.py`

Feature routes live beside the app; export **`app_name`**.

#### 🟢 Beginner Example

```python
app_name = "cart"
urlpatterns = [
    path("", views.detail, name="detail"),
    path("add/<int:product_id>/", views.add, name="add"),
]
```

#### 🟡 Intermediate Example — Further split

```python
urlpatterns = [
    path("products/", include("catalog.urls.products")),
]
```

#### 🔴 Expert Example — Avoid import-time DB access

```text
URL modules should import views lazily if imports are heavy—rare, but important.
```

#### 🌍 Real-Time Example — Social `feed/urls.py`

```python
app_name = "feed"
urlpatterns = [
    path("", views.home, name="home"),
    path("following/", views.following, name="following"),
]
```

---

### Nested URL Includes

Build trees: **`api/` → `v1/` → `users/`**.

#### 🟢 Beginner Example

```python
urlpatterns = [
    path("api/", include("api.urls")),
]
```

```python
# api/urls.py
urlpatterns = [path("v1/", include("api.v1.urls"))]
```

#### 🟡 Intermediate Example — Document full names

```text
Public docs list `GET /api/v1/users/`; code uses consistent `reverse()` naming.
```

#### 🔴 Expert Example — Version sunset

```text
Keep v1 URLs redirecting to v2 with 308 for safe method retention where appropriate.
```

#### 🌍 Real-Time Example — SaaS internal vs partner API

```python
path("api/internal/", include("internal_api.urls")),
path("api/partner/", include("partner_api.urls")),
```

---

### URL Prefixing

Mount apps under stable prefixes.

#### 🟢 Beginner Example

```python
path("shop/", include("shop.urls")),
```

#### 🟡 Intermediate Example — `i18n_patterns`

```python
from django.conf.urls.i18n import i18n_patterns

urlpatterns += i18n_patterns(path("about/", views.about, name="about"))
```

#### 🔴 Expert Example — Trailing slash consistency

```text
Match marketing links to `APPEND_SLASH` behavior to avoid duplicate URLs.
```

#### 🌍 Real-Time Example — E-commerce localized paths

```text
`/en/cart/` and `/fr/cart/` using translation-aware URL configuration.
```

---

### Dynamic URL Patterns

Generate **`urlpatterns`** from settings **safely**.

#### 🟢 Beginner Example — Feature flags

```python
from django.conf import settings

urlpatterns = [path("", views.home, name="home")]
if settings.ENABLE_BETA:
    urlpatterns += [path("beta/", include("beta.urls"))]
```

#### 🟡 Intermediate Example — Audit routes in dev

```bash
python manage.py show_urls
```

#### 🔴 Expert Example — Never from request data

```text
Runtime URL registration from user input is unsafe and unpredictable.
```

#### 🌍 Real-Time Example — SaaS custom domains

```text
Host-based routing in middleware; path patterns remain shared across tenants.
```

---

## 7.6 Advanced URL Features

### URL Middleware (path handling)

There is no separate “URL middleware” API—**middleware** can alter requests/responses around routing, and **`CommonMiddleware`** affects slash behavior.

#### 🟢 Beginner Example — `APPEND_SLASH`

```python
APPEND_SLASH = True
```

```text
`/about` may redirect to `/about/` when a valid trailing-slash route exists.
```

#### 🟡 Intermediate Example — `CommonMiddleware`

```text
Also interacts with `PREPEND_WWW` settings; understand redirect chains in prod.
```

#### 🔴 Expert Example — `LocaleMiddleware` + `i18n_patterns`

```text
Language prefix changes effective path; reverse URLs with the active language context.
```

#### 🌍 Real-Time Example — E-commerce global storefront

```text
CDN caches per `Vary: Accept-Language` when using locale-prefixed URLs.
```

---

### 404 Handling

Unmatched routes trigger **404**; use **`get_object_or_404`** in views.

#### 🟢 Beginner Example

```python
from django.shortcuts import get_object_or_404

product = get_object_or_404(Product, pk=pk, is_active=True)
```

#### 🟡 Intermediate Example — `handler404`

```python
handler404 = "myproject.views.custom_404"
```

#### 🔴 Expert Example — JSON vs HTML 404

```text
Return `application/json` 404 bodies for `/api/*` via separate handler or middleware.
```

#### 🌍 Real-Time Example — Social private content

```python
if not post.visible_to(request.user):
    raise Http404()
```

---

### 500 Error Handling

Uncaught exceptions become **500**; set **`handler500`**.

#### 🟢 Beginner Example

```python
handler500 = "myproject.views.custom_500"
```

#### 🟡 Intermediate Example — `500.html` template

```text
User-friendly copy; no stack traces in production responses.
```

#### 🔴 Expert Example — Observability

```text
Log exceptions with request IDs; integrate Sentry/OpenTelemetry server-side.
```

#### 🌍 Real-Time Example — SaaS checkout

```text
Alert on elevated 500 rate on `/checkout/confirm/` after deploys.
```

---

### Custom Error Views

Brand errors and return correct **status codes** (`404`, `403`, `410`).

#### 🟢 Beginner Example

```python
from django.shortcuts import render

def custom_404(request, exception):
    return render(request, "errors/404.html", status=404)
```

#### 🟡 Intermediate Example — JSON error

```python
from django.http import JsonResponse

def api_404(request, exception):
    return JsonResponse({"error": "not_found"}, status=404)
```

#### 🔴 Expert Example — `handler403` for paywalls

```python
handler403 = "myproject.views.paywall_403"
```

#### 🌍 Real-Time Example — E-commerce discontinued product (410)

```python
def product_gone(request, exception):
    return render(request, "errors/product_gone.html", status=410)
```

---

### Django Debug Toolbar (development)

Inspect SQL, templates, and signals—**disable in production**.

#### 🟢 Beginner Example — Settings snippet

```python
if DEBUG:
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")
    INTERNAL_IPS = ["127.0.0.1"]
```

#### 🟡 Intermediate Example — URLs include

```python
from django.conf import settings
from django.urls import path, include

if settings.DEBUG:
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]
```

#### 🔴 Expert Example — Restrict to staff

```python
def show_toolbar(request):
    return settings.DEBUG and request.user.is_superuser

DEBUG_TOOLBAR_CONFIG = {"SHOW_TOOLBAR_CALLBACK": show_toolbar}
```

#### 🌍 Real-Time Example — Social feed optimization

```text
SQL panel exposes N+1; add `prefetch_related` and re-measure TTFB.
```

---

## Best Practices

- Prefer **`path()`** + converters; reserve **`re_path()`** for legacy/edge cases.
- Set **`app_name`** in every reusable app’s `urls.py`.
- Reverse with **`{% url %}`** / **`reverse()`**; document public routes.
- Keep URLconf imports **side-effect free** (no DB queries at import).
- Test **`resolve()`** for critical routes in CI.
- Align **trailing slash** policy with `APPEND_SLASH` and marketing links.
- Separate **HTML** and **JSON** error handling for hybrid apps.

---

## Common Mistakes to Avoid

- Using **`reverse()`** at module import in settings-sensitive modules—use **`reverse_lazy`**.
- Omitting **namespaces** and getting `NoReverseMatch` in large codebases.
- **Hardcoded URLs** in emails, PDFs, and mobile deep links.
- Over-complex **`re_path`** patterns that are hard to test and secure.
- Exposing **debug toolbar** via misconfigured `INTERNAL_IPS` behind proxies.
- Confusing **404** vs **403** for authorization—pick a consistent policy.
- **Duplicate `name`** values across includes without namespaces.

---

## Comparison Tables

### `path` vs `re_path`

| API       | Prefer when                          |
| --------- | ------------------------------------ |
| `path`    | Normal routes; built-in converters   |
| `re_path` | Legacy patterns, advanced regex needs |

### Namespace building blocks

| Piece           | Role                          |
| --------------- | ----------------------------- |
| `app_name`      | Application namespace anchor  |
| `namespace=`    | Instance namespace (optional) |
| `include(tuple)`| Pair module with `app_name`   |

### Error handlers

| Setting       | Typical use                 |
| ------------- | --------------------------- |
| `handler404`  | Branded not found           |
| `handler500`  | Branded server error        |
| `handler403`  | Permission denied pages     |
| `handler400`  | Bad request (e.g., CSRF)    |

### Middleware touching URLs (conceptual)

| Middleware          | URL/path effect                         |
| ------------------- | --------------------------------------- |
| `CommonMiddleware`  | Slash redirects, `PREPEND_WWW`          |
| `LocaleMiddleware`  | Language prefix routing with i18n       |
| `SecurityMiddleware`| Security headers (not route matching)   |

---

## Supplement: extended examples (depth)

### E-commerce checkout URL map (conceptual)

```python
# checkout/urls.py
app_name = "checkout"

urlpatterns = [
    path("start/<int:cart_id>/", views.start, name="start"),
    path("confirm/<int:order_id>/", views.confirm, name="confirm"),
    path("receipt/<uuid:token>/", views.receipt, name="receipt"),
]
```

#### 🟢 Beginner Example — Reverse receipt link

```python
reverse("checkout:receipt", kwargs={"token": order.public_token})
```

#### 🟡 Intermediate Example — Guard token leakage

```text
Use UUID or signed tokens; rate-limit receipt endpoints; log access anomalies.
```

#### 🔴 Expert Example — Idempotent confirm POST

```text
Use POST + PRG; store idempotency keys for payment provider callbacks.
```

#### 🌍 Real-Time Example — SaaS + mobile deep link

```text
`myapp://checkout/receipt/{token}` mapped to same backend resource as HTTPS.
```

---

### Social graph URLs

```python
app_name = "social"

urlpatterns = [
    path("u/<slug:handle>/", views.profile, name="profile"),
    path("u/<slug:handle>/followers/", views.followers, name="followers"),
    path("u/<slug:handle>/following/", views.following, name="following"),
]
```

#### 🟢 Beginner Example

```python
reverse("social:profile", kwargs={"handle": "ada"})
```

#### 🟡 Intermediate Example — Reserved handles

```text
Block handles like `admin`, `api`, `static` at signup validation.
```

#### 🔴 Expert Example — Case normalization

```text
Store canonical lowercase handle; use `iexact` lookups where needed.
```

#### 🌍 Real-Time Example — CDN cache keys

```text
Cache profile HTML at edge with short TTL for semi-public pages.
```

---

### SaaS multi-workspace paths

```python
urlpatterns = [
    path("w/<slug:workspace>/", include("workspace.urls", namespace="ws")),
]
```

#### 🟢 Beginner Example — Reverse inside workspace

```python
reverse("ws:dashboard", kwargs={"workspace": "acme-corp"})
```

#### 🟡 Intermediate Example — Authorization

```text
Middleware loads workspace; views enforce membership via queryset scoping.
```

#### 🔴 Expert Example — Cross-tenant isolation tests

```python
def test_cannot_resolve_other_workspace(client):
    assert client.get("/w/other-ws/secret/").status_code == 404
```

#### 🌍 Real-Time Example — Custom domains

```text
`acme.com/` serves same views as `app.com/w/acme/` with host-based tenant resolution.
```

---

*URLs are part of your public API—version them, redirect thoughtfully, and test reverses like you test serializers.*
