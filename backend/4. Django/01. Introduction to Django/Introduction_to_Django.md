# Introduction to Django (Django 6.0.3)

This guide introduces **Django 6.0.3** (released December 2025) in the style of a language or framework reference: clear sectioning, progressive examples, and production-minded patterns. Django is a high-level Python web framework that encourages rapid development, clean design, and secure defaults. These notes assume **Python 3.12–3.14**, which Django 6.0 officially supports. You will see short snippets for e-commerce, social, and SaaS-style applications so concepts map to real products, not toy demos.

---

## 📑 Table of Contents

1. [1.1 What is Django?](#11-what-is-django)
2. [1.2 Django Ecosystem](#12-django-ecosystem)
3. [1.3 Key Features](#13-key-features)
4. [1.4 Getting Started](#14-getting-started)
5. [Best Practices](#best-practices)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
7. [Comparison Tables](#comparison-tables)

---

## 1.1 What is Django?

### Overview

Django is a **full-stack** web framework for building database-backed sites and APIs. It ships with an ORM, authentication, routing, templating, migrations, and an optional admin UI so you can ship features without assembling dozens of libraries first.

#### 🟢 Beginner Example — “Hello, Django”

```python
# myproject/urls.py
from django.http import HttpResponse
from django.urls import path

def home(request):
    return HttpResponse("Hello from Django 6")

urlpatterns = [
    path("", home),
]
```

#### 🟡 Intermediate Example — Named route + simple view

```python
# shop/views.py
from django.http import HttpResponse
from django.urls import reverse

def storefront(request):
    url = reverse("home")
    return HttpResponse(f"Storefront. Home URL resolves to: {url}")
```

#### 🔴 Expert Example — Class-based view with method dispatch

```python
# shop/views.py
from django.views import View
from django.http import JsonResponse

class HealthView(View):
    http_method_names = ["get", "head", "options"]

    def get(self, request, *args, **kwargs):
        return JsonResponse({"status": "ok", "framework": "django", "version": "6.0"})
```

#### 🌍 Real-Time Example — E-commerce landing hit counter (conceptual)

```python
# A SaaS storefront might track campaign landings in Redis or DB;
# Django view stays thin and delegates to services.
from django.http import HttpResponse
from django.shortcuts import render

def campaign_landing(request, slug: str):
    # In production: enqueue analytics, personalize by segment, etc.
    return render(request, "shop/campaign.html", {"slug": slug})
```

---

### Philosophy

Django favors **explicit over implicit** configuration where it matters (settings, URLs), **DRY** (don’t repeat yourself) via reusable apps, and **separation of concerns** (models, views, templates, URLs).

#### 🟢 Beginner Example — One responsibility per module

```python
# models in models.py, views in views.py — the default layout teaches boundaries.
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=120)
    price_cents = models.PositiveIntegerField()
```

#### 🟡 Intermediate Example — Service layer for business rules

```python
# catalog/services.py
from django.db import transaction
from .models import Product, InventoryItem

@transaction.atomic
def reserve_stock(product_id: int, qty: int) -> None:
    item = InventoryItem.objects.select_for_update().get(product_id=product_id)
    if item.on_hand < qty:
        raise ValueError("insufficient stock")
    item.on_hand -= qty
    item.save(update_fields=["on_hand"])
```

#### 🔴 Expert Example — Pluggable backends behind a stable API

```python
# notifications/backends.py — swap email/SMS/push without touching views
from typing import Protocol

class Notifier(Protocol):
    def send(self, user_id: int, message: str) -> None: ...

class EmailNotifier:
    def send(self, user_id: int, message: str) -> None:
        ...
```

#### 🌍 Real-Time Example — Social feed ranking delegated to a module

```python
# feeds/ranking.py — team can A/B test ranking without rewriting views
def score_post(post, viewer):
    base = post.like_count * 2 + post.comment_count
    if post.author_id in viewer.followed_ids:
        base += 50
    return base
```

---

### History / Evolution

Django began at a newspaper (Lawrence Journal-World) in 2003–2005, open-sourced in 2005, and has evolved through **major releases** with deprecation paths, async additions, and modern Python typing support. Django 6.x continues the trend of **secure defaults**, **migration tooling**, and **ORM improvements** while aligning with current Python releases.

#### 🟢 Beginner Example — Check your runtime version

```python
import django
import sys

print(sys.version_info)  # (3, 12, x, 'final', 0)
print(django.get_version())  # '6.0.3'
```

#### 🟡 Intermediate Example — Feature discovery via `django.setup()` in scripts

```python
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
print(User.objects.count())
```

#### 🔴 Expert Example — Conditional code paths across Django versions

```python
import django
from packaging.version import Version

DJANGO_V = Version(django.get_version())

def supports_feature_x() -> bool:
    return DJANGO_V >= Version("6.0")
```

#### 🌍 Real-Time Example — Upgrade runbook item (SaaS)

```text
1. Pin django==6.0.3 in requirements.
2. Run tests in CI matrix: Python 3.12, 3.13, 3.14.
3. Run `python manage.py migrate` on staging with production-like data.
4. Deploy canary → full rollout; monitor 5xx and query latency.
```

---

### Why Django?

Teams choose Django for **speed of delivery**, **batteries included**, **strong security track record**, and **excellent documentation**. It scales from MVPs to large content and SaaS products when paired with caching, async workers, and a solid deployment story.

#### 🟢 Beginner Example — Admin in minutes

```python
# After `python manage.py createsuperuser`, register models:
from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price_cents")
```

#### 🟡 Intermediate Example — Built-in user model extension

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    display_name = models.CharField(max_length=80, blank=True)
```

#### 🔴 Expert Example — Custom authentication backend

```python
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None
        try:
            user = User.objects.get(email__iexact=username)
        except User.DoesNotExist:
            return None
        if user.check_password(password):
            return user
        return None
```

#### 🌍 Real-Time Example — Multi-tenant SaaS (conceptual)

```python
# Middleware sets request.tenant from subdomain; views query scoped data.
# django-tenants or custom schema routing are common in production.
def get_queryset(self):
    return super().get_queryset().filter(tenant_id=self.request.tenant.id)
```

---

### Use Cases

Django fits **content sites**, **internal tools**, **e-commerce**, **social platforms** (with async tasks for notifications), **APIs** (often with Django REST Framework), and **data-heavy dashboards**.

#### 🟢 Beginner Example — Blog post model

```python
from django.db import models
from django.conf import settings

class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    body = models.TextField()
```

#### 🟡 Intermediate Example — Order + line items (e-commerce)

```python
class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderLine(models.Model):
    order = models.ForeignKey(Order, related_name="lines", on_delete=models.CASCADE)
    product = models.ForeignKey("catalog.Product", on_delete=models.PROTECT)
    quantity = models.PositiveSmallIntegerField()
```

#### 🔴 Expert Example — Soft-delete pattern for compliance

```python
from django.db import models
from django.utils import timezone

class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        return super().update(deleted_at=timezone.now())

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(deleted_at__isnull=True)

class Customer(models.Model):
    name = models.CharField(max_length=120)
    deleted_at = models.DateTimeField(null=True, blank=True)
    objects = SoftDeleteManager()
    all_objects = models.Manager()
```

#### 🌍 Real-Time Example — Social “follow” graph

```python
class Follow(models.Model):
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="following", on_delete=models.CASCADE)
    followed = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="followers", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["follower", "followed"], name="uniq_follow_pair"),
        ]
```

---

### Django vs Other Frameworks

#### 🟢 Beginner Example — Flask-style minimal vs Django batteries

```python
# Flask (conceptual): you add ORM, auth, forms yourself.
# Django: `startproject` gives you settings, urls, WSGI/ASGI entrypoints.
```

#### 🟡 Intermediate Example — FastAPI for JSON APIs; Django for full product

```python
# FastAPI shines at typed OpenAPI-first APIs.
# Django + DRF is common when you need admin, sessions, and server-rendered pages together.
```

#### 🔴 Expert Example — Hybrid deployments

```text
Some teams run Django for web + admin and a separate FastAPI service for
high-throughput ingestion, sharing PostgreSQL and Redis.
```

#### 🌍 Real-Time Example — Enterprise SaaS

```text
Django: billing portal, user management, audit logs, reports.
Celery/RQ: background jobs for emails and webhooks.
Next.js SPA: optional front-end consuming DRF JSON.
```

---

## 1.2 Django Ecosystem

### Core

The **django** package includes the ORM, forms, auth, sessions, static files, internationalization, testing tools, and the development server.

#### 🟢 Beginner Example — `INSTALLED_APPS`

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

#### 🟡 Intermediate Example — Split settings import

```python
# settings/__init__.py loads environment-specific module
from .base import *  # noqa
```

#### 🔴 Expert Example — Custom app config hooks

```python
from django.apps import AppConfig

class ShopConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "shop"

    def ready(self):
        from . import signals  # noqa: F401
```

#### 🌍 Real-Time Example — SaaS observability

```text
Core Django + structlog/json logging + OpenTelemetry middleware in ASGI stack.
```

---

### REST Framework

**Django REST Framework (DRF)** is the de facto toolkit for JSON APIs: serializers, viewsets, routers, authentication classes, and browsable API during development.

#### 🟢 Beginner Example — Serializer sketch

```python
from rest_framework import serializers
from shop.models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "price_cents"]
```

#### 🟡 Intermediate Example — ViewSet + router

```python
from rest_framework import viewsets
from rest_framework.routers import DefaultRouter

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
```

#### 🔴 Expert Example — Per-action permissions + throttling

```python
from rest_framework.permissions import IsAuthenticated, AllowAny

class ProductViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]
```

#### 🌍 Real-Time Example — Mobile app + web admin

```text
DRF exposes `/api/v1/` for iOS/Android; Django admin manages catalog and refunds.
```

---

### ORM

The **ORM** maps Python classes to SQL tables, generates migrations, and provides a chainable `QuerySet` API.

#### 🟢 Beginner Example — Create rows

```python
Product.objects.create(name="Mug", price_cents=999)
```

#### 🟡 Intermediate Example — `select_related` / `prefetch_related`

```python
Order.objects.select_related("user").prefetch_related("lines__product")
```

#### 🔴 Expert Example — Conditional expressions

```python
from django.db.models import Case, When, Value, CharField

Product.objects.annotate(
    tier=Case(
        When(price_cents__gte=5000, then=Value("premium")),
        default=Value("standard"),
        output_field=CharField(),
    )
)
```

#### 🌍 Real-Time Example — E-commerce search facet

```python
# Annotate counts per category for filter UI
from django.db.models import Count
Category.objects.annotate(product_count=Count("product")).order_by("name")
```

---

### Admin Interface

The **admin** is auto-generated CRUD for staff users, customizable with `ModelAdmin`, inlines, filters, and actions.

#### 🟢 Beginner Example — Register model

```python
admin.site.register(Product)
```

#### 🟡 Intermediate Example — Custom list filters

```python
class ProductAdmin(admin.ModelAdmin):
    list_filter = ("is_active", "category")
    search_fields = ("name", "sku")
```

#### 🔴 Expert Example — Bulk action

```python
@admin.action(description="Mark selected as inactive")
def deactivate(modeladmin, request, queryset):
    queryset.update(is_active=False)

class ProductAdmin(admin.ModelAdmin):
    actions = [deactivate]
```

#### 🌍 Real-Time Example — Ops workflow

```text
Support team uses admin to issue credits and reset MFA flags without SQL.
```

---

### Related Technologies

Common companions: **PostgreSQL**, **Redis** (cache/sessions), **Celery** or **Django-Q** (tasks), **Gunicorn/Uvicorn** (servers), **nginx** (reverse proxy), **S3-compatible storage** for media.

#### 🟢 Beginner Example — Cache API

```python
from django.core.cache import cache

cache.set("homepage:featured", product_ids, timeout=300)
```

#### 🟡 Intermediate Example — Redis channel layer (conceptual)

```text
django-channels + Redis for WebSockets in a social app.
```

#### 🔴 Expert Example — Idempotent webhook handler

```python
from django.db import transaction

@transaction.atomic
def handle_stripe_event(event_id: str, payload: dict):
    if WebhookEvent.objects.filter(provider_event_id=event_id).exists():
        return
    WebhookEvent.objects.create(provider_event_id=event_id, payload=payload)
    # process payload...
```

#### 🌍 Real-Time Example — SaaS billing

```text
Stripe webhooks → Django view → Celery task → update Subscription rows → email receipt.
```

---

## 1.3 Key Features

### Batteries Included

Django reduces integration work: **auth**, **sessions**, **messages**, **forms**, **CSRF**, **password hashing**, **i18n**, **sitemaps**, **feeds**, and **testing client**.

#### 🟢 Beginner Example — Messages framework

```python
from django.contrib import messages

messages.success(request, "Profile updated.")
```

#### 🟡 Intermediate Example — LoginRequiredMixin

```python
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard.html"
```

#### 🔴 Expert Example — Custom password validator

```python
from django.core.exceptions import ValidationError

class NoCompromisedPasswordValidator:
    def validate(self, password, user=None):
        # integrate with HIBP API or internal denylist
        if password.lower() in {"password", "123456"}:
            raise ValidationError("This password is too common.", code="too_common")
```

#### 🌍 Real-Time Example — SaaS onboarding checklist

```text
Use auth + sessions + messages + Celery reminders to nudge users to verify email.
```

---

### Admin Interface

(See 1.2; emphasize **rapid internal tooling**.)

#### 🟢 Beginner Example — `list_display`

```python
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at", "total_cents")
```

#### 🟡 Intermediate Example — Readonly fields for audit

```python
class AuditAdmin(admin.ModelAdmin):
    readonly_fields = ("created_at", "created_by")
```

#### 🔴 Expert Example — Override `get_queryset` for row-level security

```python
class OrderAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
```

#### 🌍 Real-Time Example — E-commerce refunds

```text
Staff uses admin inlines for OrderLine adjustments with logged actions.
```

---

### ORM

Emphasize **migrations**, **constraints**, and **database portability** (with PostgreSQL as the production default for many teams).

#### 🟢 Beginner Example — Migration workflow

```bash
python manage.py makemigrations shop
python manage.py migrate
```

#### 🟡 Intermediate Example — DB constraint in Meta

```python
class Meta:
    constraints = [
        models.CheckConstraint(check=models.Q(price_cents__gte=0), name="price_non_negative"),
    ]
```

#### 🔴 Expert Example — Functional indexes (PostgreSQL)

```text
Use RunSQL in migrations for pg_trgm indexes on search-heavy columns.
```

#### 🌍 Real-Time Example — Social notifications fan-out

```text
ORM for relational data; Celery tasks for fan-out; Redis for unread counts.
```

---

### Authentication System

Built-in **User** model, **groups/permissions**, **sessions**, **password reset**, and pluggable **backends**.

#### 🟢 Beginner Example — `login`

```python
from django.contrib.auth import authenticate, login

user = authenticate(request, username="ada", password="secret")
if user:
    login(request, user)
```

#### 🟡 Intermediate Example — Permission check in view

```python
from django.contrib.auth.decorators import permission_required

@permission_required("shop.change_product", raise_exception=True)
def restock(request, pk):
    ...
```

#### 🔴 Expert Example — OAuth2 social login (conceptual)

```text
Use django-allauth or a dedicated IdP integration; keep Django sessions for web.
```

#### 🌍 Real-Time Example — SaaS roles

```text
Owner, Admin, Member, Billing — map to groups and object-level rules in views.
```

---

### Security Features

CSRF protection, clickjacking middleware, XSS escaping in templates, SQL parameterization in ORM, password hashers (PBKDF2 by default), and security headers.

#### 🟢 Beginner Example — CSRF in forms

```html
<form method="post">
  {% csrf_token %}
  ...
</form>
```

#### 🟡 Intermediate Example — Secure cookies in production

```python
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
```

#### 🔴 Expert Example — Content Security Policy (via middleware package)

```text
Use django-csp or proxy headers from nginx to enforce CSP in production.
```

#### 🌍 Real-Time Example — E-commerce checkout

```text
HTTPS everywhere, HSTS, rate limiting at edge, idempotent payment intents server-side.
```

---

## 1.4 Getting Started

### Django Versions

Pin **django==6.0.3** in production; follow the [release notes](https://docs.djangoproject.com/en/stable/releases/) for deprecations.

#### 🟢 Beginner Example — Version check

```bash
python -m django --version
```

#### 🟡 Intermediate Example — `requirements.txt`

```text
Django==6.0.3
psycopg[binary]>=3.2,<4
```

#### 🔴 Expert Example — PEP 621 `pyproject.toml` (Poetry/pip-tools)

```toml
[project]
dependencies = [
  "django==6.0.3",
]
requires-python = ">=3.12,<3.15"
```

#### 🌍 Real-Time Example — CI matrix

```yaml
# Test on py312, py313, py314 with the same Django pin
```

---

### Python Compatibility

Django 6.0 supports **Python 3.12, 3.13, and 3.14**. Use the newest stable Python your hosting supports.

#### 🟢 Beginner Example — Virtual environment

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install "Django==6.0.3"
```

#### 🟡 Intermediate Example — `asgiref` and async views

```python
from django.http import JsonResponse

async def ping(request):
    return JsonResponse({"ok": True})
```

#### 🔴 Expert Example — Typing models (Django stubs)

```text
Use django-stubs / mypy for larger codebases.
```

#### 🌍 Real-Time Example — Container base image

```dockerfile
FROM python:3.13-slim
```

---

### Prerequisites

Comfort with **Python**, **HTTP basics**, **HTML**, **SQL concepts**, and **Git**. Frontend frameworks are optional if you use server-rendered templates.

#### 🟢 Beginner Example — Project skeleton

```bash
django-admin startproject myproject .
python manage.py startapp shop
```

#### 🟡 Intermediate Example — Environment variables

```python
import os

SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"
```

#### 🔴 Expert Example — Structured settings

```python
from pathlib import Path
import environ

env = environ.Env()
BASE_DIR = Path(__file__).resolve().parent.parent
environ.Env.read_env(BASE_DIR / ".env")
```

#### 🌍 Real-Time Example — SaaS secrets

```text
Load from AWS Secrets Manager / GCP Secret Manager in production entrypoint.
```

---

### Community and Support

Official docs, forum, Discord, mailing lists, conferences (DjangoCon), and thousands of third-party packages. Prefer **LTS** awareness for long-lived projects (check Django’s support timeline for your series).

#### 🟢 Beginner Example — Run tests

```bash
python manage.py test
```

#### 🟡 Intermediate Example — `django-extensions` shell_plus

```bash
pip install django-extensions
python manage.py shell_plus
```

#### 🔴 Expert Example — Contributing back

```text
Reproduce bugs on main, write regression test, open ticket with minimal project.
```

#### 🌍 Real-Time Example — Internal guild

```text
Brown-bag sessions on ORM profiling and safe migrations for your org’s monolith.
```

---

## Best Practices

- **Pin dependencies** (`Django==6.0.3`) and upgrade deliberately with release notes.
- **Use PostgreSQL** in production for most non-trivial products; SQLite is fine for local dev and tiny tools.
- **Never commit `SECRET_KEY`**; load secrets from the environment.
- **Keep views thin**; push domain logic into services/selectors.
- **Use migrations** for every schema change; avoid manual prod DDL except in emergencies.
- **Enable HTTPS** and secure cookie flags before going live.
- **Test critical paths**: auth, payments, permissions, and data integrity constraints.

---

## Common Mistakes to Avoid

- Running **`DEBUG = True`** in production or exposing tracebacks.
- Putting **secrets in Git** (keys, DB passwords, API tokens).
- **N+1 queries** in templates and APIs (missing `select_related` / `prefetch_related`).
- **Unbounded QuerySets** (`Model.objects.all()` in admin/API without pagination).
- **Ignoring database transactions** around multi-step money/stock operations.
- **Skipping `makemigrations`** reviews—bad defaults can lock large tables in prod.
- **Mixing sync and async** incorrectly (blocking ORM in async views without `sync_to_async`).

---

## Comparison Tables

### Django vs Flask vs FastAPI (typical roles)

| Concern            | Django                         | Flask                     | FastAPI                  |
| ------------------ | ------------------------------ | ------------------------- | ------------------------ |
| Admin UI           | Built-in                       | Add-on / custom           | Custom                   |
| ORM                | Built-in                       | SQLAlchemy (add)          | SQLAlchemy/Tortoise/etc. |
| Full-stack SSR     | Strong                         | Manual                    | Usually API-first        |
| Learning curve     | Moderate (many concepts)       | Low start, build up       | Moderate + typing      |
| Async-first        | Improving; choose patterns     | Via extensions            | Strong default story     |

### When Django shines

| Use case              | Why Django                                       |
| --------------------- | ------------------------------------------------ |
| E-commerce back office| Admin + ORM + auth accelerate operations         |
| Social (web + API)    | Sessions + DRF + task queues fit common architecture |
| SaaS billing portal   | Auth, permissions, forms, and audit-friendly patterns |

### Python version vs Django 6.0

| Python | Supported by Django 6.0 |
| ------ | ----------------------- |
| 3.12   | Yes                     |
| 3.13   | Yes                     |
| 3.14   | Yes                     |
| 3.11   | No (use Django 5.x LTS) |

---

*These notes target Django **6.0.3** and Python **3.12–3.14**. Verify details against the official documentation for your exact point release.*
