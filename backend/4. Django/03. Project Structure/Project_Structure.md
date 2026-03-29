# Project Structure (Django 6.0.3)

Django organizes code into a **project** (settings, root URLconf, WSGI/ASGI) and one or more **apps** (models, views, templates). This reference explains layout, settings splits, file boundaries, and cross-cutting configuration so e-commerce, social, and SaaS codebases stay maintainable as they grow.

---

## 📑 Table of Contents

1. [3.1 Django Project Layout](#31-django-project-layout)
2. [3.2 Creating Projects and Apps](#32-creating-projects-and-apps)
3. [3.3 Settings Organization](#33-settings-organization)
4. [3.4 File Organization](#34-file-organization)
5. [3.5 Project Configuration](#35-project-configuration)
6. [Best Practices](#best-practices)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
8. [Comparison Tables](#comparison-tables)

---

## 3.1 Django Project Layout

### Project vs App

A **project** is the deployment unit (settings, URLs entry). An **app** is a reusable feature module (`shop`, `accounts`). Multiple apps compose a product.

#### 🟢 Beginner Example — Mental model

```text
myproject/          ← project (config)
  myproject/
    settings.py
    urls.py
shop/               ← app (feature)
  models.py
  views.py
```

#### 🟡 Intermediate Example — `AppConfig` name

```python
# shop/apps.py
from django.apps import AppConfig

class ShopConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "shop"
    verbose_name = "Shop"
```

#### 🔴 Expert Example — Optional `default_app_config` removal (Django 3.2+)

```text
Use `ShopConfig` in INSTALLED_APPS as `shop.apps.ShopConfig` when you need `ready()`.
```

#### 🌍 Real-Time Example — SaaS modules

```text
`billing`, `tenants`, `analytics` apps owned by different teams; shared `core` app for utilities.
```

---

### Directory Structure

Common layout: project package beside apps, `manage.py` at repo root.

#### 🟢 Beginner Example — `startproject` default

```text
manage.py
myproject/
  __init__.py
  asgi.py
  settings.py
  urls.py
  wsgi.py
```

#### 🟡 Intermediate Example — `src` layout (optional)

```text
manage.py
src/
  myproject/
  shop/
```

> Adjust `PYTHONPATH` or install editable package so `myproject` imports resolve.

#### 🔴 Expert Example — Monorepo with packages

```text
services/web/   ← Django
services/worker/← Celery
packages/common/
```

#### 🌍 Real-Time Example — E-commerce

```text
`catalog`, `cart`, `checkout`, `fulfillment` apps; `templates/` per app + global overrides.
```

---

### manage.py

Thin wrapper setting **`DJANGO_SETTINGS_MODULE`** and delegating to **django.core.management**.

#### 🟢 Beginner Example — Run server

```bash
python manage.py runserver
```

#### 🟡 Intermediate Example — Custom command discovery

```bash
python manage.py help | grep mycommand
```

#### 🔴 Expert Example — Programmatic execution

```python
from django.core.management import execute_from_command_line

execute_from_command_line(["manage.py", "migrate"])
```

#### 🌍 Real-Time Example — Docker entrypoint

```bash
#!/bin/sh
python manage.py migrate --noinput
exec gunicorn myproject.wsgi:application
```

---

### settings.py Location

Default: **`myproject/settings.py`**. Larger projects use **`settings/`** package.

#### 🟢 Beginner Example — Single file

```python
# myproject/settings.py
DEBUG = True
```

#### 🟡 Intermediate Example — Package

```text
myproject/settings/
  __init__.py   # imports dev or prod
  base.py
  dev.py
  prod.py
```

#### 🔴 Expert Example — `__init__.py` selector

```python
import os

env = os.environ.get("DJANGO_ENV", "dev")
if env == "prod":
    from .prod import *  # noqa
else:
    from .dev import *  # noqa
```

#### 🌍 Real-Time Example — SaaS

```text
`prod.py` enables caching, security headers; `dev.py` enables toolbar.
```

---

### urls.py Organization

**Root URLconf** includes app URLconfs; keep **namespaces** for reverse lookups.

#### 🟢 Beginner Example — Root urls

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("shop/", include("shop.urls")),
]
```

#### 🟡 Intermediate Example — Versioned API

```python
urlpatterns += [
    path("api/v1/", include(("api.v1.urls", "api_v1"), namespace="v1")),
]
```

#### 🔴 Expert Example — Optional feature flags

```python
from django.conf import settings

if settings.ENABLE_BETA:
    urlpatterns += [path("beta/", include("beta.urls"))]
```

#### 🌍 Real-Time Example — Social app

```text
`/` web, `/api/` JSON, `/internal/` staff-only includes.
```

---

## 3.2 Creating Projects and Apps

### startproject

Creates project skeleton; **`.`** places it in current directory.

#### 🟢 Beginner Example

```bash
django-admin startproject myproject .
```

#### 🟡 Intermediate Example — Custom template (advanced)

```bash
django-admin startproject myproject . --template=https://example.com/template.zip
```

#### 🔴 Expert Example — CI scaffold test

```bash
django-admin startproject ci_test_project /tmp/ci_test_project
```

#### 🌍 Real-Time Example — E-commerce greenfield

```bash
django-admin startproject commerce .
python manage.py startapp catalog
python manage.py startapp checkout
```

---

### startapp

Creates app folder with default files.

#### 🟢 Beginner Example

```bash
python manage.py startapp shop
```

#### 🟡 Intermediate Example — Target directory

```bash
python manage.py startapp shop apps/shop
```

#### 🔴 Expert Example — App template with tests layout

```bash
python manage.py startapp shop --template ./templates/django_app_template
```

#### 🌍 Real-Time Example — SaaS feature squad

```text
`startapp notifications` in `services/web/notifications` with team ownership in CODEOWNERS.
```

---

### App Registration

Add app to **`INSTALLED_APPS`** as `"shop"` or `"shop.apps.ShopConfig"`.

#### 🟢 Beginner Example

```python
INSTALLED_APPS = [
    # ...
    "shop",
]
```

#### 🟡 Intermediate Example — Explicit config

```python
INSTALLED_APPS = [
    "shop.apps.ShopConfig",
]
```

#### 🔴 Expert Example — Lazy imports in `ready()`

```python
class ShopConfig(AppConfig):
    def ready(self):
        import shop.signals  # noqa: F401
```

#### 🌍 Real-Time Example — E-commerce plugin style

```text
Optional `promotions` app toggled via env: `if ENABLE_PROMOS: INSTALLED_APPS += [...]`
```

---

### Multiple Apps

Split by **bounded context**: accounts, billing, catalog—not “utils mega-app”.

#### 🟢 Beginner Example

```python
INSTALLED_APPS += ["accounts", "shop", "blog"]
```

#### 🟡 Intermediate Example — Cross-app imports

```python
from django.contrib.auth import get_user_model

User = get_user_model()

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
```

#### 🔴 Expert Example — `apps.py` with `label` care

```text
Avoid model label clashes: unique `app_label` per app.
```

#### 🌍 Real-Time Example — Social network

```text
`posts`, `graphs` (follow), `chat`, `moderation` apps; shared `core` permissions.
```

---

### Reusable Apps

Design apps to be **pip-installable** with clear public API and minimal project coupling.

#### 🟢 Beginner Example — `pyproject.toml` package

```toml
[project]
name = "django-simple-reviews"
version = "0.1.0"
dependencies = ["django>=6.0,<7"]
```

#### 🟡 Intermediate Example — Template tags namespaced

```python
# reviews/templatetags/review_tags.py
from django import template
register = template.Library()
```

#### 🔴 Expert Example — Settings hook via `AppConf` pattern

```python
from django.conf import settings

REVIEWS_SETTINGS = getattr(settings, "REVIEWS", {"PAGE_SIZE": 20})
```

#### 🌍 Real-Time Example — Internal PyPI

```text
Company publishes `company_auth` package; projects pin semver ranges.
```

---

## 3.3 Settings Organization

### Base Settings

Shared defaults: **`INSTALLED_APPS`**, **`MIDDLEWARE`**, **`TEMPLATES`**, **`AUTH_PASSWORD_VALIDATORS`**.

#### 🟢 Beginner Example — `base.py` excerpt

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "shop",
]
```

#### 🟡 Intermediate Example — Import split

```python
from .base import *  # noqa
from .logging import LOGGING  # noqa
```

#### 🔴 Expert Example — Dataclass-style grouping (optional pattern)

```python
class DatabaseConfig:
    ENGINE = "django.db.backends.postgresql"
    NAME = os.environ["POSTGRES_DB"]
```

#### 🌍 Real-Time Example — SaaS

```text
`base.py` holds 80% of config; env files only override secrets and flags.
```

---

### Environment-specific

**dev**, **staging**, **prod** differ in `DEBUG`, hosts, email backend, logging.

#### 🟢 Beginner Example — `dev.py`

```python
from .base import *  # noqa

DEBUG = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
```

#### 🟡 Intermediate Example — `prod.py`

```python
from .base import *  # noqa

DEBUG = False
ALLOWED_HOSTS = ["app.example.com"]
SECURE_SSL_REDIRECT = True
```

#### 🔴 Expert Example — Feature flags from env

```python
ENABLE_SIGNUP_BONUS = env_bool("ENABLE_SIGNUP_BONUS", False)
```

#### 🌍 Real-Time Example — E-commerce

```text
Staging uses real payment provider test keys; prod uses live keys from vault.
```

---

### Development

Enable **toolbar**, verbose logging, local DB, fast password hashers in tests.

#### 🟢 Beginner Example — Console email

```python
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
```

#### 🟡 Intermediate Example — `django-debug-toolbar`

```python
if DEBUG:
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")
```

#### 🔴 Expert Example — Fast tests

```python
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
```

#### 🌍 Real-Time Example — Social local

```text
MinIO for S3-compatible media; Mailpit for SMTP capture.
```

---

### Production

Security middleware order, caching, static manifest storage, structured logs.

#### 🟢 Beginner Example — Security flags

```python
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
```

#### 🟡 Intermediate Example — `ManifestStaticFilesStorage`

```python
STORAGES = {
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.ManifestStaticFilesStorage",
    },
}
```

#### 🔴 Expert Example — JSON logging

```python
LOGGING = {
    "version": 1,
    "formatters": {
        "json": {"format": '{"level":"%(levelname)s","msg":"%(message)s"}'},
    },
    "handlers": {"stdout": {"class": "logging.StreamHandler", "formatter": "json"}},
    "root": {"handlers": ["stdout"], "level": "INFO"},
}
```

#### 🌍 Real-Time Example — SaaS on Kubernetes

```text
Collect static to object storage; serve via CDN; Gunicorn behind ingress.
```

---

### Best Practices (settings)

- One **`base`** plus thin overlays.
- **Never** import prod settings from dev files accidentally.
- Use **`django-environ`** or similar for typed parsing.
- Document **required env vars** in README.

#### 🟢 Beginner Example — `README` snippet

```markdown
Required env: `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`
```

#### 🟡 Intermediate Example — `.env.example`

```env
DJANGO_DEBUG=0
SECRET_KEY=change-me
DATABASE_URL=postgres://user:pass@localhost:5432/db
```

#### 🔴 Expert Example — Startup check

```python
REQUIRED_ENV = ["SECRET_KEY", "POSTGRES_DB"]

for name in REQUIRED_ENV:
    if not os.environ.get(name):
        raise RuntimeError(f"Missing {name}")
```

#### 🌍 Real-Time Example — Compliance

```text
Separate AWS accounts per env; no shared secrets across prod/staging.
```

---

## 3.4 File Organization

### models.py

Default home for models; split into **`models/`** package when large.

#### 🟢 Beginner Example — Single file

```python
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=120)
```

#### 🟡 Intermediate Example — Package

```text
shop/models/
  __init__.py   # re-exports
  product.py
  category.py
```

```python
# shop/models/__init__.py
from .product import Product
from .category import Category
```

#### 🔴 Expert Example — Circular import guard

```python
# use string references: ForeignKey("shop.Product", ...)
```

#### 🌍 Real-Time Example — E-commerce

```text
`catalog/models/`, `inventory/models/` subpackages; migrations still one app label.
```

---

### views.py

Split **`views/`** with `__init__.py` re-export or explicit imports in `urls.py`.

#### 🟢 Beginner Example

```python
from django.http import HttpResponse

def home(request):
    return HttpResponse("OK")
```

#### 🟡 Intermediate Example — Package

```text
shop/views/
  __init__.py
  product.py
  cart.py
```

#### 🔴 Expert Example — CBV modules

```python
# shop/views/product.py
from django.views.generic import ListView
from shop.models import Product

class ProductListView(ListView):
    model = Product
```

#### 🌍 Real-Time Example — SaaS admin vs user views

```text
`views/staff/` vs `views/customer/`; different permission mixins.
```

---

### urls.py

Keep URL modules small; use **`include()`** liberally.

#### 🟢 Beginner Example — `shop/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
]
```

#### 🟡 Intermediate Example — Split by area

```python
from django.urls import path, include

urlpatterns = [
    path("products/", include("shop.urls.products")),
    path("cart/", include("shop.urls.cart")),
]
```

#### 🔴 Expert Example — Optional includes with same namespace pattern

```python
urlpatterns += [path("reports/", include(("reports.urls", "reports"), namespace="reports"))]
```

#### 🌍 Real-Time Example — Social

```text
`urls/feed.py`, `urls/profile.py`; API router separate from SSR urls.
```

---

### forms.py

ModelForms and validation; split like views when needed.

#### 🟢 Beginner Example

```python
from django import forms
from .models import Product

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ["name", "price_cents"]
```

#### 🟡 Intermediate Example — Cross-field validation

```python
class DiscountForm(forms.Form):
    percent = forms.DecimalField(max_digits=5, decimal_places=2)
    code = forms.CharField(max_length=40)

    def clean(self):
        data = super().clean()
        if data["percent"] > 50 and not data["code"].startswith("VIP"):
            raise forms.ValidationError("High discounts require VIP code.")
        return data
```

#### 🔴 Expert Example — Dynamic fields

```python
class CheckoutForm(forms.Form):
    def __init__(self, *args, required_fields=None, **kwargs):
        super().__init__(*args, **kwargs)
        for name in required_fields or []:
            self.fields[name] = forms.CharField(required=True)
```

#### 🌍 Real-Time Example — E-commerce address form

```text
Country-aware fields; integrate SmartyStreets/Loqate in `clean_postal_code`.
```

---

### Splitting Large Modules

Use packages, **lazy imports**, and **domain folders**—avoid 3k-line god files.

#### 🟢 Beginner Example — Extract helpers

```python
# shop/utils/pricing.py
def cents_to_display(cents: int) -> str:
    return f"${cents / 100:.2f}"
```

#### 🟡 Intermediate Example — Selectors/services pattern

```python
# shop/selectors.py
def list_active_products():
    return Product.objects.filter(is_active=True)

# shop/services.py
def deactivate_product(product_id: int) -> None:
    Product.objects.filter(pk=product_id).update(is_active=False)
```

#### 🔴 Expert Example — `TYPE_CHECKING` imports

```python
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from shop.models import Product

def serialize_product(p: "Product") -> dict:
    return {"id": p.pk, "name": p.name}
```

#### 🌍 Real-Time Example — SaaS modular monolith

```text
Enforce module boundaries with import-linter or ruff per-package rules.
```

---

## 3.5 Project Configuration

### Middleware Config

**Order matters**: security, sessions, auth, messages, clickjacking, etc.

#### 🟢 Beginner Example — Default stack awareness

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

#### 🟡 Intermediate Example — Custom middleware

```python
class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = resolve_tenant(request)
        return self.get_response(request)
```

#### 🔴 Expert Example — ASGI middleware layering

```text
Wrap ASGI app with observability middleware outside Django for trace IDs.
```

#### 🌍 Real-Time Example — SaaS

```text
Tenant middleware after SecurityMiddleware; before auth for subdomain routing.
```

---

### Template Config

**`DIRS`** for global templates; **`APP_DIRS`** for app templates.

#### 🟢 Beginner Example

```python
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]
```

#### 🟡 Intermediate Example — Custom processor

```python
def branding(request):
    return {"BRAND_NAME": "Acme SaaS"}
```

#### 🔴 Expert Example — Cached loader in prod

```python
if not DEBUG:
    TEMPLATES[0]["OPTIONS"]["loaders"] = [
        ("django.template.loaders.cached.Loader", [
            "django.template.loaders.filesystem.Loader",
            "django.template.loaders.app_directories.Loader",
        ]),
    ]
```

#### 🌍 Real-Time Example — E-commerce

```text
Override `checkout/base.html` in global `templates/` for seasonal skin.
```

---

### Static / Media Setup

**Static**: CSS/JS. **Media**: user uploads. Use **WhiteNoise** or CDN in prod.

#### 🟢 Beginner Example

```python
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"
```

#### 🟡 Intermediate Example — `STORAGES` (Django 4.2+ style)

```python
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
```

#### 🔴 Expert Example — S3 via django-storages

```python
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {"bucket_name": "myapp-media"},
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3.S3StaticStorage",
        "OPTIONS": {"bucket_name": "myapp-static"},
    },
}
```

#### 🌍 Real-Time Example — Social avatars

```text
Private bucket + signed URLs; virus scan on upload via async task.
```

---

### Logging Config

Use **`dictConfig`**; log **request IDs** in middleware.

#### 🟢 Beginner Example

```python
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {"django": {"handlers": ["console"], "level": "INFO"}},
}
```

#### 🟡 Intermediate Example — App logger

```python
LOGGING["loggers"]["shop"] = {"handlers": ["console"], "level": "DEBUG"}
```

#### 🔴 Expert Example — Correlation id

```python
import logging
import uuid

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = getattr(record, "request_id", str(uuid.uuid4()))
        return True
```

#### 🌍 Real-Time Example — SaaS incident response

```text
Ship JSON logs to ELK/Datadog; alert on 5xx rate; trace checkout failures.
```

---

### Cache Backend

**LocMem** for dev; **Redis/Memcached** for prod session/cache.

#### 🟢 Beginner Example — LocMem

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}
```

#### 🟡 Intermediate Example — Redis

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
```

#### 🔴 Expert Example — Versioned cache keys

```python
from django.core.cache import cache

def homepage_html():
    key = "homepage:v3"
    hit = cache.get(key)
    if hit:
        return hit
    html = render_homepage()
    cache.set(key, html, timeout=300)
    return html
```

#### 🌍 Real-Time Example — E-commerce pricing

```text
Cache category listing; invalidate on `post_save` signal for `Product`.
```

---

## Best Practices

- Treat **apps** as bounded contexts with clear dependencies.
- Split **settings** into base + environment overlays; document env vars.
- Prefer **explicit imports** in `urls.py` to large star-import `views` modules.
- Use **selectors/services** to keep views thin.
- Plan **static/media** early; never serve user uploads from the same path as static in prod without controls.
- Add **logging + request IDs** before scaling traffic.

---

## Common Mistakes to Avoid

- **Circular imports** between `models.py` files—use string FK targets and lazy imports.
- **God settings file** with hundreds of unrelated toggles and no env separation.
- Putting **business logic in templates**—compute in views/selectors.
- **Wrong middleware order** (e.g., auth before session).
- **MEDIA_ROOT** inside `STATIC_ROOT` confusion—keep uploads separate.
- **Cache keys** without namespacing causing stale cross-tenant data in SaaS.
- **Including apps twice** or typo in `INSTALLED_APPS` leading to subtle migration issues.

---

## Comparison Tables

### Single settings file vs package

| Approach   | Pros              | Cons                 |
| ---------- | ----------------- | -------------------- |
| Single     | Simple            | Harder at scale      |
| Package    | Clear env split   | Requires discipline  |

### Function views vs class views file layout

| Style        | Organization tip                          |
| ------------ | ------------------------------------------- |
| FBV          | Group by `views/cart.py`, `views/admin.py`  |
| CBV          | One class per file for large classes        |

### Cache backends

| Backend   | Use case              |
| --------- | --------------------- |
| LocMem    | Dev/tests             |
| Redis     | Prod cache + sessions |
| Memcached | Prod cache clusters   |

### Static vs media

| Type   | Typical source   | Served by            |
| ------ | ---------------- | -------------------- |
| Static | Repo / build     | CDN / WhiteNoise     |
| Media  | User-generated   | Object storage + ACL |

---

*Django **6.0.3** with Python **3.12–3.14**. Adjust third-party package versions to match your deployment platform.*
