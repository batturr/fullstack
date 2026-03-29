# Flask 3.1.3 — Caching

Caching stores **expensive computation or I/O** results so repeat requests complete faster. In **Flask 3.1.3** (Python 3.9+), caching appears in view layers, data access, and infrastructure. This guide ties **Flask-Caching** patterns to **e-commerce catalog performance**, **social feed hot keys**, and **SaaS tenant dashboards** while keeping invalidation and consistency explicit.

---

## 📑 Table of Contents

1. [23.1 Caching Basics](#231-caching-basics)
2. [23.2 Flask-Caching Extension](#232-flask-caching-extension)
3. [23.3 View Caching](#233-view-caching)
4. [23.4 Advanced Caching](#234-advanced-caching)
5. [Best Practices](#best-practices)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
7. [Comparison Tables](#comparison-tables)
8. [Appendix — Patterns and Recipes](#appendix--patterns-and-recipes)

---

## 23.1 Caching Basics

### Caching Concept

A **cache** is a faster, smaller memory layer in front of a slower system (database, HTTP upstream, template render). **Hit** means reuse; **miss** means compute/fetch then store.

**🟢 Beginner Example — mental model**

```python
def expensive(n: int) -> int:
    # pretend this is slow
    return sum(range(n))

# Without cache: call expensive(10_000_000) twice → work twice
```

**🟡 Intermediate Example — memoize in-process**

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def tax_rate(region: str) -> float:
    return {"US": 0.07, "EU": 0.20}.get(region, 0.0)
```

**🔴 Expert Example — stampede sketch**

```python
# Many workers miss simultaneously → thundering herd on DB
# Mitigation: single-flight lock, early expiration, request coalescing
```

**🌍 Real-Time Example — e-commerce flash sale**

Product detail pages spike; CDN caches HTML; API caches price snapshots with short TTL and event-driven purge when inventory changes.

### Cache Types

| Type | Typical layer | Lifetime |
|------|---------------|----------|
| Browser | Client | Headers (`Cache-Control`) |
| CDN/Reverse proxy | Edge | URL-based |
| Application | Flask process | In-memory, Redis |
| Database | Query cache | Engine-specific |

**🟢 Beginner Example — HTTP cache header**

```python
from flask import Flask, Response

app = Flask(__name__)

@app.get("/static/pricing.json")
def pricing():
    r = Response('{"plan":"pro","price":29}', mimetype="application/json")
    r.headers["Cache-Control"] = "public, max-age=60"
    return r
```

**🟡 Intermediate Example — private cache for user data**

```python
r.headers["Cache-Control"] = "private, no-store"
```

**🔴 Expert Example — `ETag` + conditional GET**

```python
import hashlib
from flask import request, make_response

@app.get("/api/profile/<int:user_id>")
def profile(user_id: int):
    payload = f'{{"id":{user_id}}}'.encode()
    etag = hashlib.sha256(payload).hexdigest()
    if request.headers.get("If-None-Match") == etag:
        return ("", 304)
    resp = make_response(payload, 200)
    resp.headers["ETag"] = etag
    return resp
```

**🌍 Real-Time Example — SaaS report export**

Heavy CSV generation cached in object storage; browser never caches; signed URL TTL aligns with compliance.

### Cache Storage

**🟢 Beginner Example — Python dict (dev only)**

```python
_CACHE: dict[str, str] = {}

def get_banner():
    if "banner" in _CACHE:
        return _CACHE["banner"]
    html = "<strong>Sale</strong>"
    _CACHE["banner"] = html
    return html
```

**🟡 Intermediate Example — filesystem cache**

```python
from pathlib import Path

def file_cached(key: str, factory):
    p = Path("/tmp/flask-cache") / key
    if p.exists():
        return p.read_text()
    val = factory()
    p.write_text(val)
    return val
```

**🔴 Expert Example — Redis with namespacing**

```python
# key: app:{env}:catalog:product:{id}
```

**🌍 Real-Time Example — social trending topics**

Redis sorted sets store trending scores; Flask reads via cache layer; writes batched from stream consumers.

### Cache Keys

Keys must encode **what** is cached and **version** or **tenant** scope.

**🟢 Beginner Example**

```python
key = f"product:{product_id}"
```

**🟡 Intermediate Example — tenant isolation**

```python
key = f"tenant:{tenant_id}:dashboard:summary"
```

**🔴 Expert Example — key with schema version**

```python
key = f"v3:tenant:{tenant_id}:invoice:{invoice_id}"
```

**🌍 Real-Time Example — e-commerce regional pricing**

```python
key = f"sku:{sku}:price:region:{region}:currency:{currency}"
```

### Cache Expiration

**TTL** (time-to-live) trades freshness for load. **LRU** evicts least-recently-used when memory-bound.

**🟢 Beginner Example — TTL in seconds**

```python
TTL = 300  # 5 minutes
```

**🟡 Intermediate Example — stale-while-revalidate idea**

```python
# Serve stale up to 60s while one worker refreshes
```

**🔴 Expert Example — probabilistic early expiration**

```python
# Spread refreshes: expire at TTL - random jitter
import random

def jitter_ttl(base: int) -> int:
    return max(1, base - random.randint(0, int(base * 0.1)))
```

**🌍 Real-Time Example — SaaS usage meters**

Billable aggregates cached 1 minute; fraud pipeline bypasses cache for specific accounts.

---

## 23.2 Flask-Caching Extension

### Installing Flask-Caching

```bash
pip install Flask-Caching
```

**🟢 Beginner Example — requirements**

```text
Flask==3.1.3
Flask-Caching>=2.3.0
```

**🟡 Intermediate Example — optional Redis backend**

```text
redis>=5.0.0
```

**🔴 Expert Example — extras in Docker**

```dockerfile
RUN pip install --no-cache-dir Flask==3.1.3 Flask-Caching redis
```

**🌍 Real-Time Example — private index**

Internal devpi mirrors wheels for reproducible CI.

### Cache Configuration

**🟢 Beginner Example — SimpleCache (single process)**

```python
from flask import Flask
from flask_caching import Cache

app = Flask(__name__)
app.config["CACHE_TYPE"] = "SimpleCache"
cache = Cache(app)
```

**🟡 Intermediate Example — Redis URL from env**

```python
app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/0"
app.config["CACHE_DEFAULT_TIMEOUT"] = 300
cache = Cache(app)
```

**🔴 Expert Example — cluster Redis + key prefix**

```python
app.config["CACHE_KEY_PREFIX"] = "saas_prod_"
```

**🌍 Real-Time Example — e-commerce multi-AZ**

ElastiCache Redis with TLS; URL uses `rediss://` and connection pooling tuned for Gunicorn workers.

### Cache Initialization

**🟢 Beginner Example — bind to app**

```python
cache = Cache()
cache.init_app(app)
```

**🟡 Intermediate Example — factory pattern**

```python
def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    cache.init_app(app)
    return app
```

**🔴 Expert Example — multiple cache instances**

```python
page_cache = Cache(config={"CACHE_KEY_PREFIX": "page:"})
api_cache = Cache(config={"CACHE_KEY_PREFIX": "api:"})
page_cache.init_app(app)
api_cache.init_app(app)
```

**🌍 Real-Time Example — SaaS per-tenant tuning**

Some tenants pay for “near real-time” analytics—lower TTL via feature flag without separate deploy.

### Different Cache Backends

| Backend | Use case |
|---------|----------|
| SimpleCache | Dev/tests, single worker |
| FileSystemCache | Single server, moderate speed |
| RedisCache | Multi-worker, distributed |
| MemcachedCache | Large object churn, simple eviction |

**🟢 Beginner Example — FileSystemCache**

```python
app.config["CACHE_TYPE"] = "FileSystemCache"
app.config["CACHE_DIR"] = "/tmp/flask-cache-fs"
```

**🟡 Intermediate Example — Memcached**

```python
app.config["CACHE_TYPE"] = "MemcachedCache"
app.config["CACHE_MEMCACHED_SERVERS"] = ["127.0.0.1:11211"]
```

**🔴 Expert Example — custom backend**

```python
# Subclass flask_caching.backends.base.BaseCache for corporate gatewayed storage
```

**🌍 Real-Time Example — social graph**

Memcached for hot friend lists; Redis for richer structures (sorted sets) beside Flask.

### Cache Methods

Core API: `get`, `set`, `delete`, `cached`, `memoize`.

**🟢 Beginner Example — get/set**

```python
@app.get("/api/promo")
def promo():
    key = "promo:active"
    hit = cache.get(key)
    if hit is not None:
        return hit
    data = {"title": "Spring Sale"}
    cache.set(key, data, timeout=60)
    return data
```

**🟡 Intermediate Example — `add` for locks**

```python
# NX semantics if backend supports (Redis)
```

**🔴 Expert Example — `cache.memoize` on pure functions**

```python
@cache.memoize(timeout=120)
def compute_recommendations(user_id: int) -> list[int]:
    return list(range(10))
```

**🌍 Real-Time Example — SaaS plan features**

Feature matrix memoized 10 minutes; admin toggle deletes keys `plan_features:*`.

---

## 23.3 View Caching

### @cache.cached Decorator

**🟢 Beginner Example — cache full response**

```python
from flask import Flask
from flask_caching import Cache

app = Flask(__name__)
app.config["CACHE_TYPE"] = "SimpleCache"
cache = Cache(app)

@app.get("/public/announcement")
@cache.cached(timeout=60, key_prefix="announce")
def announcement():
    return {"msg": "We ship worldwide"}
```

**🟡 Intermediate Example — vary by query string**

```python
@app.get("/search")
@cache.cached(timeout=30, query_string=True)
def search():
    return {"q": __import__("flask").request.args.get("q")}
```

**🔴 Expert Example — unless callback**

```python
def skip_if_staff():
    from flask import g
    return getattr(g, "is_staff", False)

@app.get("/stats/public")
@cache.cached(timeout=120, unless=skip_if_staff)
def public_stats():
    return {"users": 12_345}
```

**🌍 Real-Time Example — e-commerce category listing**

Cache HTML fragment or JSON for anonymous users; bypass for staff reviewing drafts.

### Cache Parameters

**🟢 Beginner Example — timeout**

```python
@cache.cached(timeout=300)
```

**🟡 Intermediate Example — key_prefix**

```python
@cache.cached(timeout=60, key_prefix="home")
```

**🔴 Expert Example — `make_cache_key`**

```python
def make_key():
    from flask import request
    return f"cart:{request.cookies.get('session','anon')}"

@app.get("/api/cart")
@cache.cached(timeout=10, make_cache_key=make_key)
def cart():
    return {"items": []}
```

**🌍 Real-Time Example — SaaS dashboard**

Key includes `tenant_id` from resolver; never rely on URL alone for tenant isolation.

### Cache Invalidation

**🟢 Beginner Example — delete by key**

```python
cache.delete("announce")
```

**🟡 Intermediate Example — delete memoized**

```python
compute_recommendations.delete_memoized(compute_recommendations, 42)
```

**🔴 Expert Example — tag-based (custom)**

```python
# Maintain Redis sets mapping tag -> keys; on product update, purge tag 'product:SKU1'
```

**🌍 Real-Time Example — e-commerce inventory**

Webhook from WMS deletes `product:{sku}` and `category:{cat}` keys.

### Conditional Caching

**🟢 Beginner Example — only GET**

```python
# Flask-Caching defaults often cache only GET; verify version docs
```

**🟡 Intermediate Example — user-specific guard**

```python
@cache.cached(timeout=30, unless=lambda: flask.request.cookies.get("beta") == "1")
```

**🔴 Expert Example — feature flag**

```python
def cache_enabled():
    return app.config.get("ENABLE_VIEW_CACHE", True)
```

**🌍 Real-Time Example — social A/B experiment**

Control bucket sees uncached feed composition; treatment bucket cached.

### Cache Keys (View Layer)

**🟢 Beginner Example**

```python
key_prefix = "product_detail"
```

**🟡 Intermediate Example — include language**

```python
def lang_key():
    from flask import request
    return f"article:{request.args.get('lang','en')}"
```

**🔴 Expert Example — signed key segments**

```python
# Avoid user tampering of cache key inputs by normalizing server-side
```

**🌍 Real-Time Example — SaaS white-label**

Key includes `brand_id` resolved from host header, not client-supplied string alone.

---

## 23.4 Advanced Caching

### Redis Caching

**🟢 Beginner Example — connection string**

```python
app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/1"
```

**🟡 Intermediate Example — pooled client reuse**

```python
# Flask-Caching manages connections; tune worker count vs Redis maxclients
```

**🔴 Expert Example — read replicas**

```python
# Custom backend: writes to primary, reads from replica with bounded staleness
```

**🌍 Real-Time Example — e-commerce session cart**

Redis holds cart JSON 24h; checkout merges with inventory service.

### Memcached Integration

**🟢 Beginner Example**

```python
app.config["CACHE_TYPE"] = "MemcachedCache"
app.config["CACHE_MEMCACHED_SERVERS"] = ["memcached.internal:11211"]
```

**🟡 Intermediate Example — JSON serialization**

```python
# Ensure values are pickle/json compatible; avoid ORM instances in cache
```

**🔴 Expert Example — consistent hashing client**

```python
# pylibmc vs pymemcache options in production
```

**🌍 Real-Time Example — social hot keys**

Memcached absorbs 100k RPS for `trending:global`; separate key for each locale.

### Cache Warming

**🟢 Beginner Example — startup job**

```python
def warm():
    cache.set("home:hero", load_hero(), timeout=600)

warm()
```

**🟡 Intermediate Example — Celery periodic**

```python
@celery.task
def warm_dashboards():
    for tenant in top_tenants():
        cache.set(f"dash:{tenant}", build_dash(tenant), timeout=120)
```

**🔴 Expert Example — coordinated warm after deploy**

```python
# Blue/green: warm new stack before traffic shift
```

**🌍 Real-Time Example — SaaS morning peak**

Cron warms Eastern timezone tenants before business hours.

### Cache Stampede Prevention

**🟢 Beginner Example — single-flight lock**

```python
import time
import threading

_locks: dict[str, threading.Lock] = {}
_locks_guard = threading.Lock()

def get_lock(k: str) -> threading.Lock:
    with _locks_guard:
        return _locks.setdefault(k, threading.Lock())

def get_or_load(key, loader, ttl):
    v = cache.get(key)
    if v is not None:
        return v
    with get_lock(key):
        v = cache.get(key)
        if v is not None:
            return v
        data = loader()
        cache.set(key, data, timeout=ttl)
        return data
```

**🟡 Intermediate Example — request coalescing in asyncio worker**

```python
# Quart/async Flask patterns: asyncio.Lock per key
```

**🔴 Expert Example — probabilistic early refresh**

```python
# If TTL remaining < random threshold, one request refreshes
```

**🌍 Real-Time Example — e-commerce pricing API**

Black Friday: without single-flight, Redis + DB catch fire from thundering herd.

### Distributed Caching

**🟢 Beginner Example — shared Redis for all Gunicorn workers**

```text
Workers → same Redis → consistent cache
```

**🟡 Intermediate Example — cache aside pattern**

```python
def get_product(sku):
    k = f"product:{sku}"
    p = cache.get(k)
    if p:
        return p
    p = db.load_product(sku)
    cache.set(k, p, timeout=300)
    return p
```

**🔴 Expert Example — write-through vs write-behind**

```python
# Write-through: update DB then cache
# Write-behind: update cache fast, async persist (risky; needs queue)
```

**🌍 Real-Time Example — SaaS global app**

Redis Cluster per region; async replication for non-critical analytics cache.

---

## Best Practices

1. **Never cache personalized responses** without tenant/user in the key.
2. **Prefer explicit TTL** over infinite caches unless strong invalidation exists.
3. **Serialize plain dicts/lists**, not ORM objects, unless your pickler is safe and versioned.
4. **Instrument hit ratio**—blind caching hides bugs until traffic spikes.
5. **Purge on write** for domain events you control (inventory, permissions).
6. **Use `Vary` and key design** instead of caching wrong variants.
7. **Test cache behavior** in CI with Redis test container.
8. **Document cache namespaces** for on-call engineers.

---

## Common Mistakes to Avoid

| Mistake | Symptom |
|---------|---------|
| SimpleCache in multi-worker prod | Different workers, different cache |
| Key without tenant | Data leaks across customers |
| Caching POST responses | Incorrect semantics, stale writes |
| Ignoring invalidation | Stale prices, wrong entitlements |
| Storing secrets in cache | Exposure via debug endpoints |
| Huge pickled objects | Memory pressure, slow Redis |
| No timeout on external loaders | Hung requests pile up |

---

## Comparison Tables

### Cache-Aside vs Read-Through

| Pattern | Who loads on miss | Complexity |
|---------|-------------------|------------|
| Cache-aside | Application | Flexible, common |
| Read-through | Cache layer plugin | Tighter coupling |

### Redis vs Memcached (Flask context)

| Topic | Redis | Memcached |
|-------|-------|-----------|
| Data structures | Rich | Key/value blob |
| Durability options | AOF/RDB | Ephemeral |
| Typical Flask use | General | Pure KV speed |

### TTL Strategies

| Strategy | Freshness | Load |
|----------|-----------|------|
| Fixed TTL | Predictable | Spiky expiries |
| TTL + jitter | Smoother | Slightly staler |
| Event purge | Best | Requires plumbing |

---

## Appendix — Patterns and Recipes

### A. E-Commerce Product Detail JSON

**🟢 Beginner Example**

```python
@cache.cached(timeout=60, key_prefix="product_json")
```

**🟡 Intermediate Example**

```python
@app.get("/api/products/<sku>")
def product_json(sku: str):
    k = f"product:json:{sku}"
    data = cache.get(k)
    if data:
        return data
    data = build_product(sku)
    cache.set(k, data, timeout=120)
    return data
```

**🔴 Expert Example**

```python
# On inventory event: cache.delete(f"product:json:{sku}")
```

**🌍 Real-Time Example**

Flash sale: shorten TTL to 5s; rely on queue invalidation for oversell protection.

### B. Social Feed Page (Anonymous)

**🟢 Beginner Example — CDN handles static assets**

**🟡 Intermediate Example — fragment cache in Redis**

```python
cache.set(f"feed:anon:{cursor}", payload, timeout=15)
```

**🔴 Expert Example — hybrid**

Edge caches public GET; authenticated API never cached at CDN.

**🌍 Real-Time Example**

Moderation removes post—pub/sub triggers key deletion `post:{id}` and dependent feed keys.

### C. SaaS Tenant Config

**🟢 Beginner Example**

```python
cache.set(f"tenant_cfg:{tid}", cfg, timeout=600)
```

**🟡 Intermediate Example — version bump**

```python
cfg = {**row, "v": row["config_version"]}
```

**🔴 Expert Example — optimistic locking**

```python
# Serve stale cfg while background refresh; include version in API for clients
```

**🌍 Real-Time Example**

Feature flag service updates—webhook bumps version; Flask evicts `tenant_cfg:*`.

### D. Flask 3.1.3 + Typed Views Note

Flask 3.x view functions may use type annotations; caching decorators remain compatible. Keep **pure JSON-serializable** return types when relying on response caching middleware that inspects payloads.

**🟢 Beginner Example**

```python
@app.get("/api/health")
def health() -> tuple[dict, int]:
    return {"ok": True}, 200
```

**🟡 Intermediate Example**

```python
# Prefer consistent return shapes for cached JSON endpoints
```

**🔴 Expert Example**

```python
# Streaming responses: avoid @cache.cached unless you buffer fully (usually bad)
```

**🌍 Real-Time Example**

Large SaaS exports: cache pointer to S3 object, not the file bytes, in Redis.

### E. Testing Checklist

**🟢 Beginner Example**

```python
app.config["CACHE_TYPE"] = "NullCache"
```

**🟡 Intermediate Example**

```python
@pytest.fixture()
def app():
    app = create_app({"CACHE_TYPE": "SimpleCache"})
    return app
```

**🔴 Expert Example**

```python
# Integration test with fakeredis
```

**🌍 Real-Time Example**

Load test in staging with production-sized Redis to find connection leaks.

### F. Observability

**🟢 Beginner Example — log misses**

```python
app.logger.debug("cache miss %s", key)
```

**🟡 Intermediate Example — Prometheus counters**

```python
CACHE_HIT.labels(name="product").inc()
```

**🔴 Expert Example — tracing**

```python
# Span around loader() on miss
```

**🌍 Real-Time Example**

On-call correlates Redis latency spike with deploy that changed serialization.

### G. Security

**🟢 Beginner Example — do not cache authenticated HTML with generic keys**

**🟡 Intermediate Example — `private` Cache-Control on sensitive JSON**

**🔴 Expert Example — cache poisoning defense**

Normalize `Accept-Encoding` and `Vary` at CDN; reject weird `Host` headers.

**🌍 Real-Time Example**

SaaS admin pages: `Cache-Control: no-store` + server-side Redis only for computed fragments with strict keys.

### H. Long-form Scenario — Multi-Level Caching

**🟢 Beginner Example**

Browser → CDN → Flask → Redis → DB

**🟡 Intermediate Example**

```python
# L1: process LRU for config
# L2: Redis for shared
# L3: DB
```

**🔴 Expert Example**

```python
# Invalidation cascade: message bus fans out deletes to L1/L2
```

**🌍 Real-Time Example**

Global e-commerce: edge caches prices with short TTL; origin Flask uses Redis; DB authoritative.

### I. Additional Snippets — Invalidation API

**🟢 Beginner Example**

```python
@app.post("/internal/purge/<key>")
def purge(key: str):
    cache.delete(key)
    return {"ok": True}
```

**🟡 Intermediate Example — protect with mTLS or internal network**

**🔴 Expert Example — HMAC-signed purge requests**

**🌍 Real-Time Example**

CMS publish hook calls internal purge endpoint over VPC.

### J. Memcached Serialization Reminder

**🟢 Beginner Example — JSON bytes**

```python
import json
cache.set("x", json.dumps({"a": 1}).encode())
```

**🟡 Intermediate Example — msgpack**

**🔴 Expert Example — compression for large values**

**🌍 Real-Time Example**

Social “who viewed” aggregates compressed blobs in Memcached.

---

*Notes version: Flask **3.1.3**, Python **3.9+**, February 2026 release line.*
