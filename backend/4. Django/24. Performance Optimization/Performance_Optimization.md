# Django Performance Optimization

Performance work in Django **6.0.3** is mostly about **doing less per request**: fewer queries, smaller rows, smarter caching, lean middleware, efficient static delivery, compressed responses, async where it helps, and observability to find regressions. This document follows a TypeScript-reference style with four example tiers per major idea and scenarios from **e-commerce catalogs**, **social feeds**, and **multi-tenant SaaS** workloads.

---

## 📑 Table of Contents

1. [24.1 Database Optimization](#241-database-optimization)
2. [24.2 QuerySet Optimization](#242-queryset-optimization)
3. [24.3 Caching Strategy](#243-caching-strategy)
4. [24.4 Middleware Optimization](#244-middleware-optimization)
5. [24.5 Static File Optimization](#245-static-file-optimization)
6. [24.6 Response Optimization](#246-response-optimization)
7. [24.7 Async Views](#247-async-views)
8. [24.8 Profiling and Monitoring](#248-profiling-and-monitoring)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 24.1 Database Optimization

### 24.1.1 Query Profiling

**🟢 Beginner Example — `connection.queries` in DEBUG**

```python
from django.conf import settings
from django.db import connection

def debug_queries():
    if settings.DEBUG:
        print(len(connection.queries))
```

**🟡 Intermediate Example — `assertNumQueries` in tests**

```python
from django.test import TestCase

class ProductPageTests(TestCase):
    def test_list_query_count(self):
        with self.assertNumQueries(3):
            list(ProductViewSet().get_queryset())
```

**🔴 Expert Example — `EXPLAIN ANALYZE` in PostgreSQL**

```python
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("EXPLAIN ANALYZE SELECT ...")
    print("\n".join(row[0] for row in cursor.fetchall()))
```

**🌍 Real-Time Example — SaaS slow query log**

```python
# Enable rds.log_min_duration_statement or pg_stat_statements; alert p95 > 200ms
```

### 24.1.2 `select_related()`

**🟢 Beginner Example**

```python
Order.objects.select_related("user", "shipping_address")
```

**🟡 Intermediate Example — e-commerce order list**

```python
Order.objects.select_related("user").prefetch_related("lines__product")
```

**🔴 Expert Example — nullable FK**

```python
Comment.objects.select_related("author", "parent")
```

**🌍 Real-Time Example — admin order fulfillment screen**

```python
Shipment.objects.select_related("order__user", "warehouse")
```

### 24.1.3 `prefetch_related()`

**🟢 Beginner Example**

```python
Post.objects.prefetch_related("tags")
```

**🟡 Intermediate Example — custom Prefetch**

```python
from django.db.models import Prefetch

active_comments = Comment.objects.filter(deleted=False)
Post.objects.prefetch_related(Prefetch("comments", queryset=active_comments))
```

**🔴 Expert Example — M2M through table**

```python
User.objects.prefetch_related("groups__permissions")
```

**🌍 Real-Time Example — social notifications with actors**

```python
Notification.objects.prefetch_related("actor", "target_content_type")
```

### 24.1.4 N+1 Problem

**🟢 Beginner Example — anti-pattern**

```python
for order in Order.objects.all():
    print(order.user.email)  # N queries
```

**🟡 Intermediate Example — fix**

```python
for order in Order.objects.select_related("user"):
    print(order.user.email)
```

**🔴 Expert Example — serializer nested N+1**

```python
# ListSerializer with depth without prefetch → disaster; override to_prefetch in viewset
```

**🌍 Real-Time Example — e-commerce category tree**

```python
# prefetch children recursively or use closure table / materialized path with one query
```

### 24.1.5 Indexing Strategy

**🟢 Beginner Example — `db_index=True`**

```python
class Product(models.Model):
    sku = models.CharField(max_length=64, db_index=True)
```

**🟡 Intermediate Example — composite index**

```python
class Meta:
    indexes = [
        models.Index(fields=["org", "status", "-created_at"]),
    ]
```

**🔴 Expert Example — partial index (PostgreSQL)**

```python
from django.contrib.postgres.indexes import BrinIndex

class Meta:
    indexes = [
        models.Index(fields=["published_at"], name="pub_nonnull", condition=models.Q(deleted_at__isnull=True)),
    ]
```

**🌍 Real-Time Example — SaaS audit table**

```python
# BRIN on created_at for append-only logs; btree on (org_id, created_at)
```

---

## 24.2 QuerySet Optimization

### 24.2.1 `only()` / `defer()`

**🟢 Beginner Example**

```python
User.objects.only("id", "username")
```

**🟡 Intermediate Example — large text column**

```python
Article.objects.defer("body_html")
```

**🔴 Expert Example — avoid defer + attribute access churn**

```python
# Accessing deferred fields triggers extra queries per row — profile carefully
```

**🌍 Real-Time Example — social timeline cards**

```python
Post.objects.only("id", "author_id", "snippet", "created_at")
```

### 24.2.2 `values()` / `values_list()`

**🟢 Beginner Example**

```python
list(Product.objects.values("id", "name"))
```

**🟡 Intermediate Example — flat list of ids**

```python
ids = Product.objects.values_list("id", flat=True)
```

**🔴 Expert Example — annotate then values**

```python
from django.db.models import Count

User.objects.annotate(post_count=Count("posts")).values("username", "post_count")
```

**🌍 Real-Time Example — SaaS dashboard aggregates**

```python
Invoice.objects.filter(org=org).values("status").annotate(total=Sum("amount_cents"))
```

### 24.2.3 Bulk Operations

**🟢 Beginner Example — `bulk_create`**

```python
Product.objects.bulk_create([Product(name="A"), Product(name="B")])
```

**🟡 Intermediate Example — `bulk_update`**

```python
products = list(Product.objects.filter(id__in=ids))
for p in products:
    p.stock = new_stock
Product.objects.bulk_update(products, ["stock"])
```

**🔴 Expert Example — batch size tuning**

```python
Product.objects.bulk_create(batch, batch_size=500)
```

**🌍 Real-Time Example — e-commerce inventory sync**

```python
# Nightly feed: bulk_update SKUs; avoid per-row save signals if not needed
```

### 24.2.4 Exists Optimization

**🟢 Beginner Example**

```python
if Product.objects.filter(sku=sku).exists():
    ...
```

**🟡 Intermediate Example — avoid `count()` for boolean**

```python
# BAD if Product.objects.filter(...).count() > 0
```

**🔴 Expert Example — `Exists` subquery**

```python
from django.db.models import Exists, OuterRef

has_line = LineItem.objects.filter(order_id=OuterRef("pk"))
Order.objects.annotate(has_items=Exists(has_line)).filter(has_items=True)
```

**🌍 Real-Time Example — SaaS feature gate**

```python
Subscription.objects.filter(org_id=org, plan__features__contains={"api": True}).exists()
```

### 24.2.5 Query Caching

**🟢 Beginner Example — queryset is lazy**

```python
qs = Product.objects.filter(active=True)
# No DB hit until evaluated
```

**🟡 Intermediate Example — same queryset reused**

```python
qs = Product.objects.filter(active=True)
list(qs)
list(qs)  # hits DB again unless cached at higher layer
```

**🔴 Expert Example — `QuerySet._result_cache` awareness**

```python
# Slicing can bypass cache; use iterator() for huge sets
```

**🌍 Real-Time Example — social hot posts**

```python
# Redis cache JSON for 30s; stampede protection with single-flight lock
```

---

## 24.3 Caching Strategy

### 24.3.1 Template Fragment Caching

**🟢 Beginner Example**

```django
{% load cache %}
{% cache 600 sidebar request.user.id %}
  ... expensive sidebar ...
{% endcache %}
```

**🟡 Intermediate Example — vary on language**

```django
{% cache 600 hero_banner LANGUAGE_CODE %}
```

**🔴 Expert Example — cache key versioning on deploy**

```python
# settings.CACHE_MIDDLEWARE_KEY_PREFIX = RELEASE_GIT_SHA
```

**🌍 Real-Time Example — e-commerce category nav**

```python
# Invalidate fragment when Category M2M changes via signal + version bump
```

### 24.3.2 View Caching

**🟢 Beginner Example**

```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)
def product_list(request):
    ...
```

**🟡 Intermediate Example — `never_cache` for sensitive**

```python
from django.views.decorators.cache import never_cache

@never_cache
def account_settings(request):
    ...
```

**🔴 Expert Example — `cache_control` for CDN**

```python
from django.views.decorators.cache import cache_control

@cache_control(public=True, max_age=3600)
def public_asset_manifest(request):
    ...
```

**🌍 Real-Time Example — SaaS marketing pricing page**

```python
# Edge cache HTML; purge on plan change webhook
```

### 24.3.3 QuerySet Result Caching

**🟢 Beginner Example — low-level cache API**

```python
from django.core.cache import cache

def get_top_products():
    key = "top_products_v1"
    data = cache.get(key)
    if data is None:
        data = list(Product.objects.filter(featured=True)[:20].values())
        cache.set(key, data, timeout=300)
    return data
```

**🟡 Intermediate Example — stampede lock**

```python
import time
from django.core.cache import cache

def get_with_lock(key, factory, ttl=300):
    data = cache.get(key)
    if data is not None:
        return data
    lock = cache.add(f"lock:{key}", 1, timeout=10)
    if lock:
        try:
            data = factory()
            cache.set(key, data, ttl)
            return data
        finally:
            cache.delete(f"lock:{key}")
    time.sleep(0.05)
    return get_with_lock(key, factory, ttl)
```

**🔴 Expert Example — cache versioning**

```python
VERSION = cache.get_or_set("catalog:version", 1)
cache.get(f"catalog:{VERSION}:facet:brand")
```

**🌍 Real-Time Example — social trending hashtags**

```python
# Short TTL + background Celery refresh
```

### 24.3.4 Cache Invalidation

**🟢 Beginner Example — signal on save**

```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Product)
def bust_product_cache(sender, instance, **kwargs):
    cache.delete(f"product:{instance.pk}")
```

**🟡 Intermediate Example — pattern delete (Redis)**

```python
# SCAN + DEL keys matching catalog:*
```

**🔴 Expert Example — event-driven invalidation**

```python
# Outbox table → worker purges CDN + app cache
```

**🌍 Real-Time Example — e-commerce price change**

```python
# Bump catalog version; all composite keys include version
```

### 24.3.5 Cache Warming

**🟢 Beginner Example — management command**

```python
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    def handle(self, *args, **options):
        warm_top_products()
```

**🟡 Intermediate Example — Celery beat periodic warm**

```python
@app.task
def warm_homepage():
    ...
```

**🔴 Expert Example — probabilistic early refresh**

```python
# If key TTL < 10% remaining, async refresh
```

**🌍 Real-Time Example — SaaS Monday morning traffic**

```python
# Pre-warm dashboards at 6am local per region
```

---

## 24.4 Middleware Optimization

### 24.4.1 Ordering

**🟢 Beginner Example — SecurityMiddleware first**

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    # ...
]
```

**🟡 Intermediate Example — custom auth before business middleware**

```python
# Place tenant resolution after AuthenticationMiddleware
```

**🔴 Expert Example — short-circuit early**

```python
class HealthCheckBypassMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/healthz":
            return HttpResponse("ok")
        return self.get_response(request)
```

**🌍 Real-Time Example — e-commerce bot scoring**

```python
# Run cheap checks first; expensive scoring only for suspicious IPs
```

### 24.4.2 Performance

**🟢 Beginner Example — disable unused locale middleware if monolingual**

**🟡 Intermediate Example — GZipMiddleware**

```python
MIDDLEWARE += ["django.middleware.gzip.GZipMiddleware"]
```

**🔴 Expert Example — conditional middleware class**

```python
if not DEBUG:
    MIDDLEWARE.append("myapp.middleware.CompressionMiddleware")
```

**🌍 Real-Time Example — SaaS API-only deployment**

```python
# Strip SessionMiddleware, CommonMiddleware extras not needed for pure JSON
```

### 24.4.3 Conditional Middleware

**🟢 Beginner Example**

```python
class DebugToolbarMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)
```

**🟡 Intermediate Example — path prefix**

```python
def __call__(self, request):
    if not request.path.startswith("/api/"):
        return self.get_response(request)
    ...
```

**🔴 Expert Example — feature flag**

```python
if not waffle.flag_is_active(request, "new_tenant_middleware"):
    return self.get_response(request)
```

**🌍 Real-Time Example — social gradual rollout**

```python
# 5% traffic runs experimental middleware with metrics
```

### 24.4.4 Middleware Caching

**🟢 Beginner Example — attach cache hit to request**

```python
request._geo = cache.get_or_set(f"geo:{ip}", lambda: lookup_geo(ip), 3600)
```

**🟡 Intermediate Example — memoize per-request**

```python
class RequestCache:
    def __init__(self):
        self.data = {}

def get_org(request):
    if not hasattr(request, "_org_cache"):
        request._org_cache = {}
    ...
```

**🔴 Expert Example — avoid caching user-specific data without keying**

**🌍 Real-Time Example — SaaS IP allowlist**

```python
# Cache CIDR evaluation results per /24 for 1 hour
```

### 24.4.5 Middleware Profiling

**🟢 Beginner Example — timing log**

```python
import time
import logging

log = logging.getLogger(__name__)

class TimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        duration = (time.perf_counter() - start) * 1000
        log.info("path=%s ms=%.2f", request.path, duration)
        return response
```

**🟡 Intermediate Example — OpenTelemetry span**

```python
# tracer.start_as_current_span("django.request")
```

**🔴 Expert Example — percentile metrics to Prometheus**

**🌍 Real-Time Example — e-commerce checkout funnel**

```python
# Tag spans with cart_id hash; alert if p99 > 2s
```

---

## 24.5 Static File Optimization

### 24.5.1 CSS Minification

**🟢 Beginner Example — build pipeline**

```bash
npx cssnano styles.css -o styles.min.css
```

**🟡 Intermediate Example — Django `ManifestStaticFilesStorage`**

```python
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
```

**🔴 Expert Example — critical CSS inline + async rest**

**🌍 Real-Time Example — SaaS marketing site**

```python
# CI builds hashed assets; CDN immutable caching
```

### 24.5.2 JS Minification

**🟢 Beginner Example — esbuild**

```bash
esbuild app.js --bundle --minify --outfile=dist/app.js
```

**🟡 Intermediate Example — split chunks for admin vs storefront**

**🔴 Expert Example — tree shaking unused exports**

**🌍 Real-Time Example — e-commerce checkout bundle < 200KB gzip**

### 24.5.3 Image Optimization

**🟢 Beginner Example — `ImageField` with resized variants**

```python
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

def make_thumbnail(fieldfile, size=(300, 300)):
    img = Image.open(fieldfile)
    img.thumbnail(size)
    buf = BytesIO()
    img.save(buf, format="WEBP")
    return ContentFile(buf.getvalue())
```

**🟡 Intermediate Example — responsive `srcset` in template**

**🔴 Expert Example — object storage + CDN image optimizer**

**🌍 Real-Time Example — social photo uploads**

```python
# Virus scan async; generate blurhash; strip EXIF
```

### 24.5.4 CDN Integration

**🟢 Beginner Example — `STATIC_URL` on CDN domain**

```python
STATIC_URL = "https://cdn.example.com/static/"
```

**🟡 Intermediate Example — signed URLs for private media**

**🔴 Expert Example — stale-while-revalidate headers**

**🌍 Real-Time Example — global e-commerce**

```python
# Edge POP near users; origin shield layer
```

### 24.5.5 Compression

**🟢 Beginner Example — GZipMiddleware**

**🟡 Intermediate Example — Brotli at nginx**

```nginx
brotli on;
brotli_types text/css application/javascript application/json;
```

**🔴 Expert Example — precompressed static files served with `Content-Encoding`**

**🌍 Real-Time Example — SaaS JSON API**

```python
# gzip + small payloads; avoid compressing already compressed uploads
```

---

## 24.6 Response Optimization

### 24.6.1 gzip Compression

(See 24.5.5 / GZipMiddleware.)

**🟢 Beginner Example**

```python
MIDDLEWARE = ["django.middleware.gzip.GZipMiddleware", ...]
```

**🟡 Intermediate Example — threshold skip tiny bodies**

**🔴 Expert Example — streaming gzip careful with sync iterators**

**🌍 Real-Time Example**

### 24.6.2 Response Streaming

**🟢 Beginner Example — `StreamingHttpResponse`**

```python
from django.http import StreamingHttpResponse

def rows():
    for row in huge_queryset.iterator():
        yield f"{row.id},{row.name}\n"

def export_csv(request):
    return StreamingHttpResponse(rows(), content_type="text/csv")
```

**🟡 Intermediate Example — chunked encoding behind nginx**

**🔴 Expert Example — backpressure with async generator (ASGI)**

**🌍 Real-Time Example — SaaS large export**

```python
# User downloads 10M rows without loading all in RAM
```

### 24.6.3 Pagination for Large Data

**🟢 Beginner Example — DRF `PageNumberPagination`**

**🟡 Intermediate Example — cursor pagination for feeds**

**🔴 Expert Example — keyset pagination raw SQL**

**🌍 Real-Time Example — social infinite scroll**

### 24.6.4 Lazy Loading

**🟢 Beginner Example — template `{% include %}` deferred via HTMX**

**🟡 Intermediate Example — GraphQL-style field selection in DRF (sparse fieldsets)**

```python
fields_param = request.query_params.get("fields", "")
only = fields_param.split(",") if fields_param else None
```

**🔴 Expert Example — on-demand serializer method fields**

**🌍 Real-Time Example — e-commerce product tabs (reviews loaded async)**

### 24.6.5 Partial Responses

**🟢 Beginner Example — `?fields=` whitelist**

**🟡 Intermediate Example — HTTP Range for files (FileResponse)**

**🔴 Expert Example — PATCH semantics vs JSON Merge Patch**

**🌍 Real-Time Example — mobile sync API returns deltas since `updated_after`**

```python
Change.objects.filter(org=org, updated_at__gt=since).values("id", "op", "payload")
```

---

## 24.7 Async Views

### 24.7.1 Async View Handlers

**🟢 Beginner Example**

```python
from django.http import JsonResponse

async def ping(request):
    return JsonResponse({"ok": True})
```

**🟡 Intermediate Example — mix sync ORM carefully**

```python
from asgiref.sync import sync_to_async

get_user = sync_to_async(lambda uid: User.objects.get(pk=uid))

async def profile(request, uid):
    user = await get_user(uid)
    return JsonResponse({"username": user.username})
```

**🔴 Expert Example — async middleware**

```python
class AsyncTimingMiddleware:
    async def __call__(self, scope, receive, send):
        ...
```

**🌍 Real-Time Example — SaaS webhook receiver**

```python
# Fast ack + queue to worker; async view returns 202 quickly
```

### 24.7.2 `async` / `await` Syntax

**🟢 Beginner Example — parallel HTTP fetches with httpx**

```python
import httpx

async def aggregate(request):
    async with httpx.AsyncClient() as client:
        a, b = await asyncio.gather(
            client.get("https://api.a/status"),
            client.get("https://api.b/status"),
        )
    return JsonResponse({"a": a.json(), "b": b.json()})
```

**🟡 Intermediate Example — timeout + cancel**

**🔴 Expert Example — structured concurrency patterns**

**🌍 Real-Time Example — social enrich post with oEmbed + preview**

### 24.7.3 Async ORM Operations

**🟢 Beginner Example — Django async ORM (when enabled for your version/path)**

```python
async def get_product(request, pk):
    product = await Product.objects.aget(pk=pk)
    return JsonResponse({"name": product.name})
```

**🟡 Intermediate Example — `async for` iteration**

```python
async def stream_ids(request):
    async for p in Product.objects.all().aiterator():
        yield f"{p.id}\n"
```

**🔴 Expert Example — transaction.atomic in async context**

**🌍 Real-Time Example — high-concurrency read-mostly SaaS status page**

### 24.7.4 Concurrent Operations

**🟢 Beginner Example — `asyncio.gather`**

**🟡 Intermediate Example — semaphores limiting external API concurrency**

**🔴 Expert Example — task groups (Python 3.11+)**

**🌍 Real-Time Example — e-commerce cart validation calling inventory + fraud services**

### 24.7.5 Performance Benefits

**🟢 Beginner Example — release GIL during I/O waits**

**🟡 Intermediate Example — fewer worker processes needed for I/O bound**

**🔴 Expert Example — CPU-bound still needs processes/sync views**

**🌍 Real-Time Example — edge function style aggregations in Django ASGI behind uvicorn**

---

## 24.8 Profiling and Monitoring

### 24.8.1 Django Debug Toolbar

**🟢 Beginner Example**

```python
if DEBUG:
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]
    INTERNAL_IPS = ["127.0.0.1"]
```

**🟡 Intermediate Example — SQL panel + profiling**

**🔴 Expert Example — disable in staging with IP tunnel only**

**🌍 Real-Time Example — never enable in production publicly**

### 24.8.2 django-silk

**🟢 Beginner Example**

```python
INSTALLED_APPS += ["silk"]
MIDDLEWARE += ["silk.middleware.SilkyMiddleware"]
```

**🟡 Intermediate Example — sampling**

```python
SILKY_INTERCEPT_PERCENT = 10
```

**🔴 Expert Example — sensitive data masking**

**🌍 Real-Time Example — SaaS staging mirrors prod load tests**

### 24.8.3 APM Tools

**🟢 Beginner Example — Sentry performance**

```python
import sentry_sdk
sentry_sdk.init(traces_sample_rate=0.2)
```

**🟡 Intermediate Example — OpenTelemetry exporter**

**🔴 Expert Example — custom spans around ORM-heavy service functions**

**🌍 Real-Time Example — e-commerce payment capture span linked to order id**

### 24.8.4 Performance Metrics

**🟢 Beginner Example — `/metrics` for Prometheus**

```python
from prometheus_client import Counter
REQUESTS = Counter("django_requests_total", "Total", ["method", "path"])
```

**🟡 Intermediate Example — histogram of view latency**

**🔴 Expert Example — SLO error budget burn rate alerts**

**🌍 Real-Time Example — SaaS API latency SLO p99 < 300ms**

### 24.8.5 Monitoring Dashboards

**🟢 Beginner Example — Grafana + Loki logs**

**🟡 Intermediate Example — RED metrics (Rate, Errors, Duration)**

**🔴 Expert Example — correlation IDs across Celery + HTTP**

**🌍 Real-Time Example — social incident response runbook tied to dashboards**

---

## Best Practices

- **Measure first** with realistic data volumes; optimize hot paths shown by profiling.
- Prefer **`select_related` / `prefetch_related`** before raw SQL; keep queryset logic in one place.
- Use **caching with a clear invalidation** story (version keys often simplest).
- Keep **middleware minimal** on API-only stacks; order from cheapest to expensive.
- Ship **hashed static files** via **CDN** with long cache lifetimes.
- Use **pagination + streaming** for large responses; never load unbounded lists in memory.
- Use **async** for I/O-bound fan-out; keep **CPU-bound** work in workers.
- **Production observability**: traces, logs, and metrics with tenant-safe labels.

---

## Common Mistakes to Avoid

- Fixing “slow pages” by adding **`select_related` everywhere** without measuring (over-fetching).
- Using **`len(queryset)`** instead of **`count()`** or **`exists()`** when appropriate.
- **Caching without keys** tied to tenant/user, causing data leaks.
- **GzipMiddleware** on already compressed binary responses.
- **`iterator()`** without **`server_side_cursor`** awareness on PostgreSQL for huge queries.
- Running **Debug Toolbar** or **Silk** wide open in production.
- **Async views** calling **blocking ORM** without `sync_to_async` (stalls event loop).
- **Pagination without stable ordering** causing duplicate/missing rows.

---

## Comparison Tables

| Technique | Reduces | Cost |
|-----------|---------|------|
| `select_related` | Join queries into 1 | May widen rows |
| `prefetch_related` | N queries to 2 | Memory for prefetch |
| `only`/`defer` | Bytes over wire | Extra queries if misused |
| `iterator` | Memory | Still time for full scan |

| Cache layer | TTL typical | Invalidation |
|-------------|-------------|--------------|
| Fragment | minutes–hours | template version |
| View | seconds–minutes | URL + headers |
| Query result | seconds | domain events |

| Deployment mode | Good for |
|-------------------|----------|
| Sync WSGI + workers | CPU + traditional ORM |
| ASGI + async | I/O heavy, websockets |

| Tool | Dev | Staging | Prod |
|------|-----|---------|------|
| Debug Toolbar | Yes | Optional | No |
| Silk | Yes | Sampled | Rarely |
| APM | Optional | Yes | Yes |

---

*Django **6.0.3** performance notes — re-benchmark after ORM and async capability upgrades in your exact stack.*
