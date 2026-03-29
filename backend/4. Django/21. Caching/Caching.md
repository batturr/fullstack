# Django Caching — Reference Notes (Django 6.0.3)

Django’s **cache framework** abstracts multiple **backends** behind a consistent **cache API**, with helpers for **per-view**, **template fragment**, and **low-level** caching patterns. **Django 6.0.3** on **Python 3.12–3.14** supports Redis via the built-in Redis cache backend (with the `redis` package) or Memcached via `PyMemcache`, plus **dummy**, **locmem**, and **file-based** backends. QuerySets are **lazy**; “QuerySet caching” in these notes means **caching query results** and **invalidation** discipline. This document follows a TypeScript-style reference: TOC, exhaustive subtopics, and four example levels per major concept.

---

## 📑 Table of Contents

1. [21.1 Cache Backends](#211-cache-backends)
2. [21.2 Cache Configuration](#212-cache-configuration)
3. [21.3 Cache API](#213-cache-api)
4. [21.4 View Caching](#214-view-caching)
5. [21.5 Template Caching](#215-template-caching)
6. [21.6 QuerySet Caching](#216-queryset-caching)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 21.1 Cache Backends

### 21.1.1 Dummy Cache

**Concept:** Implements API but stores nothing — useful for dev/tests disabling cache without code branches.

#### 🟢 Beginner Example (simple, foundational)

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}
```

#### 🟡 Intermediate Example (practical patterns)

```python
from django.core.cache import cache
from django.test import TestCase, override_settings

@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}})
class NoCacheTests(TestCase):
    def test_without_cache(self):
        self.assertIsNone(cache.get("x"))
```

#### 🔴 Expert Example (advanced usage)

```python
CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"},
    "real": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    },
}
```

#### 🌍 Real-Time Example (production / SaaS)

Feature flag forces dummy cache in staging to reproduce “cold” behavior.

### 21.1.2 Locmem Cache

**Concept:** In-process dict cache — not shared across workers; fast for single-process dev.

#### 🟢 Beginner Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}
```

#### 🟡 Intermediate Example

```python
CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "one"},
    "sessions": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "two"},
}
```

#### 🔴 Expert Example

Not suitable for Gunicorn multi-worker consistency — each worker has separate memory.

#### 🌍 Real-Time Example

Local docker-compose without Redis: locmem for dev only.

### 21.1.3 Memcached

**Concept:** Distributed memory cache; use `PyMemcacheCache` or `PyLibMCCache` backend.

#### 🟢 Beginner Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.memcached.PyMemcacheCache",
        "LOCATION": "127.0.0.1:11211",
    }
}
```

#### 🟡 Intermediate Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.memcached.PyMemcacheCache",
        "LOCATION": ["10.0.0.1:11211", "10.0.0.2:11211"],
    }
}
```

#### 🔴 Expert Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.memcached.PyMemcacheCache",
        "LOCATION": "127.0.0.1:11211",
        "OPTIONS": {"no_delay": True, "connect_timeout": 0.5},
    }
}
```

#### 🌍 Real-Time Example

E-commerce flash sale: session cart fragments in Memcached with TTL.

### 21.1.4 Redis Cache

**Concept:** Django includes `django.core.cache.backends.redis.RedisCache` when the `redis` package is installed.

#### 🟢 Beginner Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
```

#### 🟡 Intermediate Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://:password@redis:6379/0",
    }
}
```

#### 🔴 Expert Example

```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/0",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_KWARGS": {"max_connections": 50},
        },
    }
}
```

#### 🌍 Real-Time Example

SaaS: Redis with `KEY_PREFIX` per tenant.

### 21.1.5 File-based Cache

**Concept:** Stores pickled values on disk — shared across processes on same machine.

#### 🟢 Beginner Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.filebased.FileBasedCache",
        "LOCATION": "/var/tmp/django_cache",
    }
}
```

#### 🟡 Intermediate Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.filebased.FileBasedCache",
        "LOCATION": "/var/tmp/django_cache",
        "OPTIONS": {"MAX_ENTRIES": 10000},
    }
}
```

#### 🔴 Expert Example

Ensure permissions and disk monitoring; not for multi-server horizontal scale.

#### 🌍 Real-Time Example

Small self-hosted SaaS single VM: file cache for expensive report fragments.

---

## 21.2 Cache Configuration

### 21.2.1 CACHES Setting

**Concept:** Dict of named caches; `default` required for `cache` alias.

#### 🟢 Beginner Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique",
    }
}
```

#### 🟡 Intermediate Example

```python
CACHES = {
    "default": {...},
    "metadata": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/2",
    },
}
```

#### 🔴 Expert Example

```python
import os

REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/0")

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}
```

#### 🌍 Real-Time Example

Separate `sessions` cache backend from `default` object cache.

### 21.2.2 Multiple Caches

**Concept:** `caches["name"]` via `django.core.cache.caches`.

#### 🟢 Beginner Example

```python
from django.core.cache import caches

caches["default"].set("k", 1)
caches["sessions"].set("sid", session_blob, timeout=3600)
```

#### 🟡 Intermediate Example

```python
CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.redis.RedisCache", "LOCATION": "redis://localhost:6379/0"},
    "throttle": {"BACKEND": "django.core.cache.backends.redis.RedisCache", "LOCATION": "redis://localhost:6379/2"},
}
```

#### 🔴 Expert Example

Read-heavy vs write-heavy separation with different TTL policies.

#### 🌍 Real-Time Example

SaaS: rate-limit cache isolated from page cache.

### 21.2.3 Cache Keys

**Concept:** Django prefixes keys with `KEY_PREFIX`, `VERSION`, and optional `KEY_FUNCTION`.

#### 🟢 Beginner Example

```python
CACHES = {
    "default": {
        "BACKEND": "...",
        "KEY_PREFIX": "shop",
        "VERSION": 2,
    }
}
```

#### 🟡 Intermediate Example

```python
def make_key(key, key_prefix, version):
    return f"{key_prefix}:{version}:{key}"

CACHES["default"]["KEY_FUNCTION"] = make_key
```

#### 🔴 Expert Example

```python
def tenant_key(key, key_prefix, version):
    tenant = get_current_tenant_id()
    return f"{key_prefix}:{version}:t{tenant}:{key}"
```

#### 🌍 Real-Time Example

Deploy bump: increment `VERSION` to invalidate all prior keys cheaply.

### 21.2.4 Cache Timeout

**Concept:** `timeout` in seconds; default `TIMEOUT` in `CACHES` entry.

#### 🟢 Beginner Example

```python
from django.core.cache import cache

cache.set("user:1", profile, timeout=300)
```

#### 🟡 Intermediate Example

```python
CACHES = {
    "default": {
        "BACKEND": "...",
        "TIMEOUT": 600,
    }
}
```

#### 🔴 Expert Example

```python
cache.set("feature_flags", flags, timeout=None)  # backend-specific semantics
```

#### 🌍 Real-Time Example

E-commerce: short TTL for stock hints; long TTL for category tree.

### 21.2.5 Cache Options

**Concept:** Backend-specific `OPTIONS` dict (pooling, serializers, compression).

#### 🟢 Beginner Example

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "x",
        "OPTIONS": {"MAX_ENTRIES": 1000},
    }
}
```

#### 🟡 Intermediate Example

```python
"OPTIONS": {"COMPRESSOR": "django_redis.compressors.zlib.ZlibCompressor"}
```

#### 🔴 Expert Example

```python
"OPTIONS": {"SERIALIZER": "django_redis.serializers.json.JSONSerializer"}
```

#### 🌍 Real-Time Example

SaaS: JSON-only serializers for security.

---

## 21.3 Cache API

### 21.3.1 cache.get()

**Concept:** Returns value or `None` if missing.

#### 🟢 Beginner Example

```python
from django.core.cache import cache

v = cache.get("homepage_html")
if v is None:
    v = render_homepage()
    cache.set("homepage_html", v, 60)
```

#### 🟡 Intermediate Example

```python
data = cache.get("report:weekly")
```

#### 🔴 Expert Example

```python
from django_redis import get_redis_connection

con = get_redis_connection("default")
```

#### 🌍 Real-Time Example

SaaS dashboard tiles: `get` per tile key.

### 21.3.2 cache.set()

**Concept:** Store serializable value.

#### 🟢 Beginner Example

```python
cache.set("user:1:cart", cart_dict, timeout=120)
```

#### 🟡 Intermediate Example

```python
cache.set("fx:USD:EUR", rate, 300)
```

#### 🔴 Expert Example

```python
cache.set("lock:job:42", "1", timeout=30)
```

#### 🌍 Real-Time Example

E-commerce: idempotency metadata cache (avoid storing PII).

### 21.3.3 cache.delete()

**Concept:** Remove key.

#### 🟢 Beginner Example

```python
cache.delete("user:1:permissions")
```

#### 🟡 Intermediate Example

```python
def bust_user(u_id):
    cache.delete(f"user:{u_id}:profile")
```

#### 🔴 Expert Example

```python
cache.delete_many([f"product:{pk}" for pk in pks])
```

#### 🌍 Real-Time Example

Product update: delete detail key + list facet keys.

### 21.3.4 cache.clear()

**Concept:** Flush cache namespace — dangerous in shared Redis DB.

#### 🟢 Beginner Example

```python
cache.clear()
```

#### 🟡 Intermediate Example

Dev management command only.

#### 🔴 Expert Example

Use separate Redis logical DB or key versioning instead of global clear in prod.

#### 🌍 Real-Time Example

Staging reset script after seed import.

### 21.3.5 cache.get_or_set()

**Concept:** Fetch or compute and store.

#### 🟢 Beginner Example

```python
def expensive():
    return compute()

value = cache.get_or_set("expensive_key", expensive, 60)
```

#### 🟡 Intermediate Example

```python
value = cache.get_or_set(f"tax:{country}", lambda: load_rates(country), 3600)
```

#### 🔴 Expert Example

```python
def factory():
    return list(Model.objects.values("id", "slug"))

cache.get_or_set("all_slugs", factory, 300)
```

#### 🌍 Real-Time Example

SaaS: feature flag snapshot per tenant with 30s TTL.

---

## 21.4 View Caching

### 21.4.1 @cache_page Decorator

**Concept:** Caches full response by URL + vary headers.

#### 🟢 Beginner Example

```python
from django.views.decorators.cache import cache_page
from django.shortcuts import render

@cache_page(60 * 15)
def about(request):
    return render(request, "about.html")
```

#### 🟡 Intermediate Example

```python
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

@method_decorator(cache_page(60), name="dispatch")
class HomeView(TemplateView):
    template_name = "home.html"
```

#### 🔴 Expert Example

```python
@cache_page(60, key_prefix="site1")
def promo(request):
    return render(request, "promo.html")
```

#### 🌍 Real-Time Example

E-commerce marketing landing pages cached at CDN + origin.

### 21.4.2 Cache Key Prefix

**Concept:** `key_prefix` argument to `cache_page` / `CACHE_MIDDLEWARE_KEY_PREFIX`.

#### 🟢 Beginner Example

```python
@cache_page(120, key_prefix="v2")
def landing(request):
    ...
```

#### 🟡 Intermediate Example

```python
CACHE_MIDDLEWARE_KEY_PREFIX = f"v{DEPLOY_VERSION}"
```

#### 🔴 Expert Example

Per-tenant prefix often easier with low-level cache than `cache_page`.

#### 🌍 Real-Time Example

SaaS: separate namespaces per tenant subdomain.

### 21.4.3 Timeout per View

**Concept:** First arg to `cache_page` is seconds.

#### 🟢 Beginner Example

```python
@cache_page(10)
def status_board(request):
    ...
```

#### 🟡 Intermediate Example

```python
SHORT = 30
LONG = 3600
```

#### 🔴 Expert Example

Dynamic timeout from DB-driven cache policy service.

#### 🌍 Real-Time Example

Sports scores: 5s TTL; rules page: 1h TTL.

### 21.4.4 Conditional Caching

**Concept:** Cache only anonymous users; vary on auth; custom decorators.

#### 🟢 Beginner Example

```python
def maybe_cache(view_fn):
    def _wrapped(request, *args, **kwargs):
        if request.user.is_authenticated:
            return view_fn(request, *args, **kwargs)
        return cache_page(60)(view_fn)(request, *args, **kwargs)
    return _wrapped
```

#### 🟡 Intermediate Example

```python
from django.views.decorators.vary import vary_on_cookie

@vary_on_cookie
@cache_page(60)
def feed(request):
    ...
```

#### 🔴 Expert Example

ETag / `Last-Modified` + `cache_page` — avoid stale personalized content.

#### 🌍 Real-Time Example

Social: public posts cached; private posts not.

### 21.4.5 Cache Vary Headers

**Concept:** `vary_on_headers`, `Vary` response header affects cache key.

#### 🟢 Beginner Example

```python
from django.views.decorators.vary import vary_on_headers

@vary_on_headers("Accept-Language")
@cache_page(600)
def docs(request):
    ...
```

#### 🟡 Intermediate Example

Avoid caching authenticated HTML with `Authorization` vary without privacy review.

#### 🔴 Expert Example

```python
@vary_on_headers("HX-Request")
def fragment(request):
    ...
```

#### 🌍 Real-Time Example

E-commerce: `Accept-Language` + `Currency` vary for localized fragments.

---

## 21.5 Template Caching

### 21.5.1 cache Tag

**Concept:** `{% load cache %}{% cache timeout fragment_name obj.pk %}...{% endcache %}`.

#### 🟢 Beginner Example

```django
{% load cache %}
{% cache 500 sidebar %}
  {% include "blog/sidebar.html" %}
{% endcache %}
```

#### 🟡 Intermediate Example

```django
{% cache 600 product_gallery product.id %}
  ...
{% endcache %}
```

#### 🔴 Expert Example

```django
{% cache 600 hero_banner request.LANGUAGE_CODE %}
  ...
{% endcache %}
```

#### 🌍 Real-Time Example

E-commerce: cache related-products partial.

### 21.5.2 Cache Key in Templates

**Concept:** Fragment name + optional variables form key; use unique names.

#### 🟢 Beginner Example

```django
{% cache 60 homepage_stats %}
```

#### 🟡 Intermediate Example

```django
{% cache 120 user_tabs request.user.id %}
```

#### 🔴 Expert Example

```django
{% cache 600 promo_banner request.LANGUAGE_CODE tenant.id %}
```

#### 🌍 Real-Time Example

SaaS: include `tenant.id` in fragment variables.

### 21.5.3 Timeout in Templates

**Concept:** First positional argument is seconds.

#### 🟢 Beginner Example

```django
{% cache 30 ticker %}
```

#### 🟡 Intermediate Example

```django
{% cache ttl fragment %}...{% endcache %}
```

#### 🔴 Expert Example

Very low TTL for near-real-time leaderboards.

#### 🌍 Real-Time Example

Social: 10s cache on “trending” sidebar.

### 21.5.4 Nested Caching

**Concept:** Outer and inner fragments with different TTLs — mind invalidation complexity.

#### 🟢 Beginner Example

```django
{% cache 600 outer %}
  {% cache 60 inner %}
    ...
  {% endcache %}
{% endcache %}
```

#### 🟡 Intermediate Example

Prefer single fragment if inner changes rarely relative to outer.

#### 🔴 Expert Example

Document invalidation matrix for nested keys.

#### 🌍 Real-Time Example

E-commerce: outer layout vs inner price — prefer versioned keys for consistency.

### 21.5.5 Cache Invalidation

**Concept:** Bump version in fragment name or delete keys from signals.

#### 🟢 Beginner Example

```django
{% cache 600 product_detail product.id CACHE_VERSION %}
```

#### 🟡 Intermediate Example

Bump `CACHE_VERSION` in settings on deploy.

#### 🔴 Expert Example

```python
from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Product)
def bust_product(sender, instance, **kwargs):
    cache.delete(f"product:{instance.pk}")
```

#### 🌍 Real-Time Example

SaaS: admin “purge CDN + bump fragment version” button.

---

## 21.6 QuerySet Caching

### 21.6.1 Evaluating QuerySets

**Concept:** QuerySet evaluated on iteration, `list()`, etc.; ORM keeps **result cache** for same instance reuse.

#### 🟢 Beginner Example

```python
qs = Product.objects.filter(is_active=True)
list(qs)  # hits DB
list(qs)  # uses queryset result cache
```

#### 🟡 Intermediate Example

```python
qs = Product.objects.all()
print(qs[0])
print(qs[1])  # uses cache
```

#### 🔴 Expert Example

```python
qs = Product.objects.iterator()
```

#### 🌍 Real-Time Example

SaaS export: `iterator()` avoids caching millions of rows.

### 21.6.2 Caching Query Results

**Concept:** Wrap ORM results in `cache.get_or_set` with stable keys.

#### 🟢 Beginner Example

```python
def top_products():
    return list(Product.objects.order_by("-sales")[:10])

products = cache.get_or_set("top_products", top_products, 300)
```

#### 🟡 Intermediate Example

```python
key = f"category:{cat_id}:products"
data = cache.get_or_set(key, lambda: list(qs.values("id", "title")), 60)
```

#### 🔴 Expert Example

```python
from django.core.serializers import serialize

cache.set("feed.json", serialize("json", qs), 120)
```

#### 🌍 Real-Time Example

E-commerce API: cache JSON list for mobile home feed.

### 21.6.3 Cache Invalidation Patterns

**Concept:** Delete keys on write; TTL; versioning; tag-based (redis modules).

#### 🟢 Beginner Example

```python
from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Product)
def bust_product(sender, instance, **kwargs):
    cache.delete(f"product:{instance.pk}")
```

#### 🟡 Intermediate Example

```python
from django.core.cache import cache

cache.delete_many(
    [f"product:{instance.pk}", "top_products", f"category:{instance.category_id}:products"]
)
```

#### 🔴 Expert Example

Redis sets tracking keys per tag; delete tag set members.

#### 🌍 Real-Time Example

SaaS: event consumer invalidates dashboard caches.

### 21.6.4 Cache Warming

**Concept:** Precompute hot keys after deploy or on schedule.

#### 🟢 Beginner Example

```python
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    def handle(self, *args, **options):
        cache.set("homepage:stats", compute_stats(), 3600)
```

#### 🟡 Intermediate Example

Celery beat refreshes `trending:*` every 5 minutes.

#### 🔴 Expert Example

Warm per-shard in multi-region with region-local keys.

#### 🌍 Real-Time Example

E-commerce: warm category menus before peak traffic.

### 21.6.5 Cache Busting

**Concept:** Version query strings for static assets; for API, bump `KEY_PREFIX` or path version.

#### 🟢 Beginner Example

```html
<script src="{% static 'app.js' %}?v={{ DEPLOY_VERSION }}"></script>
```

#### 🟡 Intermediate Example

Manifest with hashed filenames via `ManifestStaticFilesStorage`.

#### 🔴 Expert Example

API `Cache-Control: no-store` for authenticated mutations.

#### 🌍 Real-Time Example

CDN purge + version increment for HTML snippets.

---

## Best Practices

- Treat cache as **ephemeral** — always code paths that rebuild on miss.
- Never cache personalized pages without `Vary` or user-specific keys.
- Prefer TTL + explicit invalidation over infinite-lived keys.
- Use separate Redis DB or key prefixes for different subsystems.
- Monitor hit rate, memory, and eviction.
- Avoid caching sensitive PII unless encrypted and justified.
- For `cache_page`, understand interaction with CSRF, sessions, and messages framework.
- Document key naming conventions (`entity:id:facet`).

---

## Common Mistakes to Avoid

- Caching authenticated HTML without varying on user → data leaks.
- `cache.clear()` on shared Redis wiping sessions/throttles.
- Storing unpickleable or huge objects → memory pressure.
- Assuming `get_or_set` prevents thundering herd under extreme load (use lock or single-flight).
- Template `{% cache %}` without tenant/user dimensions on multi-tenant apps.
- Ignoring timezone/locale in cache keys for localized content.
- Using locmem in multi-worker production → inconsistent behavior.
- Caching ORM model instances in shared cache — prefer serializable dicts.

---

## Comparison Tables

| Backend | Shared across processes | Durability | Typical env |
|---------|-------------------------|------------|-------------|
| Dummy | N/A | None | Tests |
| Locmem | No | Process | Dev single process |
| File | Yes (same host) | Disk | Small single server |
| Memcached | Yes | Memory | Distributed cache |
| Redis | Yes | Memory (optional persistence) | Distributed cache |

| API | Use |
|-----|-----|
| `get` / `set` | General key-value |
| `get_or_set` | Stampede-prone expensive compute |
| `delete_many` | Bulk bust |
| `clear` | Nuclear — rarely prod |

| Strategy | Invalidation |
|----------|--------------|
| TTL only | Simple; stale windows |
| Event delete | Fresher; more code |
| Version prefix | Mass bust on deploy |

| Layer | Granularity |
|-------|-------------|
| `cache_page` | Whole response |
| Template `cache` | HTML fragment |
| Low-level cache | Arbitrary blob |

---

*Reference notes for **Django 6.0.3** caching. Verify built-in `RedisCache` options and `TIMEOUT` semantics in the official docs for your exact point release.*
