# Performance Optimization

FastAPI applications usually become **slow** for reasons that have little to do with the framework itself: **blocking I/O**, **chatty databases**, **missing caches**, **oversized responses**, and **poor observability**. This chapter maps **monitoring**, **caching**, **database tuning**, **async discipline**, **response shaping**, and **distributed patterns** to practical Python you can drop into a service and iterate in production.

**How to use these notes:** Pick one bottleneck class at a time; measure before and after; keep changes **small** and **reversible**.


## 📑 Table of Contents

- [24.1 Performance Monitoring](#241-performance-monitoring)
  - [24.1.1 Benchmarking](#2411-benchmarking)
  - [24.1.2 Load Testing](#2412-load-testing)
  - [24.1.3 Profiling](#2413-profiling)
  - [24.1.4 Metrics Collection](#2414-metrics-collection)
  - [24.1.5 Monitoring Tools](#2415-monitoring-tools)
- [24.2 Caching Strategies](#242-caching-strategies)
  - [24.2.1 Response Caching](#2421-response-caching)
  - [24.2.2 HTTP Caching Headers](#2422-http-caching-headers)
  - [24.2.3 ETag and Last-Modified](#2423-etag-and-last-modified)
  - [24.2.4 Conditional Requests](#2424-conditional-requests)
  - [24.2.5 Cache Invalidation](#2425-cache-invalidation)
- [24.3 Database Optimization](#243-database-optimization)
  - [24.3.1 Query Optimization](#2431-query-optimization)
  - [24.3.2 Indexing Strategies](#2432-indexing-strategies)
  - [24.3.3 Connection Pooling](#2433-connection-pooling)
  - [24.3.4 Query Caching](#2434-query-caching)
  - [24.3.5 N+1 Problem](#2435-n1-problem)
- [24.4 Async Optimization](#244-async-optimization)
  - [24.4.1 Concurrent Operations](#2441-concurrent-operations)
  - [24.4.2 Resource Pooling](#2442-resource-pooling)
  - [24.4.3 Rate Limiting](#2443-rate-limiting)
  - [24.4.4 Backpressure Handling](#2444-backpressure-handling)
  - [24.4.5 Memory Management](#2445-memory-management)
- [24.5 Response Optimization](#245-response-optimization)
  - [24.5.1 Response Compression](#2451-response-compression)
  - [24.5.2 Minification](#2452-minification)
  - [24.5.3 Pagination](#2453-pagination)
  - [24.5.4 Lazy Loading](#2454-lazy-loading)
  - [24.5.5 Streaming](#2455-streaming)
- [24.6 Advanced Optimization](#246-advanced-optimization)
  - [24.6.1 CDN Integration](#2461-cdn-integration)
  - [24.6.2 Edge Caching](#2462-edge-caching)
  - [24.6.3 Distributed Caching](#2463-distributed-caching)
  - [24.6.4 Message Queues](#2464-message-queues)
  - [24.6.5 Microservices Architecture](#2465-microservices-architecture)
- [Chapter Key Points, Best Practices, and Common Mistakes (24)](#chapter-key-points-best-practices-and-common-mistakes-24)

---

## 24.1 Performance Monitoring

Observability is the **feedback loop** for performance work: you need stable **baselines**, **regression detection**, and **traces** that explain latency—not only averages.

### 24.1.1 Benchmarking

        #### Beginner

        Benchmarking answers: **how fast is this code path on my machine**, isolated from network variance. For APIs, micro-benchmarks of pure functions complement **end-to-end** timings of HTTP handlers.


```python
            import time
            from statistics import mean

            from fastapi import FastAPI

            app = FastAPI()


            def fib(n: int) -> int:
                return n if n < 2 else fib(n - 1) + fib(n - 2)


            @app.get("/bench")
            def bench() -> dict[str, float]:
                samples: list[float] = []
                for _ in range(50):
                    t0 = time.perf_counter()
                    _ = fib(28)
                    samples.append(time.perf_counter() - t0)
                return {"mean_s": mean(samples), "samples": len(samples)}

```

        #### Intermediate

        Prefer **`time.perf_counter()`** for durations. For statistical rigor, use **`pytest-benchmark`** or **`timeit`** on hot loops—but remember HTTP adds ASGI server, middleware, and serialization costs.

        #### Expert

        Treat benchmarks as **hypothesis generators**. Validate in staging with realistic payloads and concurrency; watch **warmup** effects and **JIT** (if using PyPy) or **GC** noise in CPython.

        **Key Points (24.1.1)**

        - Benchmarks measure **one** configuration; production traffic is **messier**.
- Use **`perf_counter`**, not **`time.time`**, for intervals.

        **Best Practices (24.1.1)**

        - Warm caches and **JIT** before recording steady-state numbers.
- Record **hardware**, **Python version**, and **dependency versions** with results.

        **Common Mistakes (24.1.1)**

        - Micro-benchmarking **`async`** routes without driving real concurrent load.
- Reporting only **mean** latency—report **p95/p99** for APIs.



### 24.1.2 Load Testing

        #### Beginner

        Load testing simulates **many users** hitting your API to find **throughput ceilings**, **error rates**, and **saturation** (CPU, DB pool, file descriptors).


```python
            # Example: Locust file (locustfile.py) hitting FastAPI
            from locust import HttpUser, between, task


            class ApiUser(HttpUser):
                wait_time = between(0.05, 0.2)

                @task(3)
                def health(self) -> None:
                    self.client.get("/health")

                @task(1)
                def items(self) -> None:
                    self.client.get("/items?limit=50")

```

        #### Intermediate

        Model **think time**, **payload sizes**, and **authentication** realistically. Ramp **VUs** gradually to observe **queueing** before the system collapses.

        #### Expert

        Combine load tests with **metrics** (saturation) and **traces** (where time goes). Chaos-style tests (slow DB, flaky downstream) reveal **degradation** not visible in happy-path load.

        **Key Points (24.1.2)**

        - Load tests validate **capacity planning**, not just peak RPS.
- Steady-state errors often mean **pool exhaustion** or **timeouts**.

        **Best Practices (24.1.2)**

        - Test **authenticated** routes with token refresh behavior if applicable.
- Include **POST**/write paths—reads-only tests lie about write contention.

        **Common Mistakes (24.1.2)**

        - Hammering **dev** laptops and blaming FastAPI.
- Ignoring **cold start** vs **warm** behavior in autoscaling environments.



### 24.1.3 Profiling

        #### Beginner

        Profiling shows **where CPU time** is spent. For FastAPI, you profile **Python code**, but also check **I/O wait** separately (async gaps are invisible to pure CPU profilers).


```python
            import cProfile
            import pstats
            from io import StringIO

            from fastapi import FastAPI

            app = FastAPI()


            @app.get("/profiled")
            def profiled() -> dict[str, str]:
                pr = cProfile.Profile()
                pr.enable()
                total = sum(range(50_000))
                pr.disable()
                buf = StringIO()
                pstats.Stats(pr, stream=buf).sort_stats("cumtime").print_stats(10)
                return {"sum_tail": str(total), "top": buf.getvalue()[:2000]}

```

        #### Intermediate

        Use **`cProfile`** for quick views; **`py-spy`** for low-overhead sampling in production-like environments; **`yappi`** when you need async-aware wall/CPU stats.

        #### Expert

        Line-level profilers (**`line_profiler`**) help hot loops. For ASGI, pair Python profiling with **OpenTelemetry** spans around DB/HTTP client calls to see **async stall** sources.

        **Key Points (24.1.3)**

        - CPU profiling ≠ **latency** profiling for I/O-heavy APIs.
- Always profile **representative** inputs.

        **Best Practices (24.1.3)**

        - Profile **middleware** stacks—sometimes logging or auth dominates.

        **Common Mistakes (24.1.3)**

        - Optimizing **`json` serialization** before fixing **N+1 queries**.



### 24.1.4 Metrics Collection

        #### Beginner

        Metrics are **time-series numbers** (counters, gauges, histograms) that answer operational questions: error rate, queue depth, saturation. FastAPI emits nothing by default—you add instrumentation.


```python
            import time

            from fastapi import FastAPI, Request
            from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
            from starlette.responses import Response

            app = FastAPI()
            REQ_LATENCY = Histogram("http_request_latency_seconds", "Latency", ["route"])
            REQ_ERRORS = Counter("http_request_errors_total", "Errors", ["route"])


            @app.middleware("http")
            async def metrics_mw(request: Request, call_next):
                route = request.url.path
                t0 = time.perf_counter()
                try:
                    response = await call_next(request)
                    if response.status_code >= 500:
                        REQ_ERRORS.labels(route=route).inc()
                    return response
                finally:
                    REQ_LATENCY.labels(route=route).observe(time.perf_counter() - t0)


            @app.get("/metrics")
            def metrics() -> Response:
                return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

```

        #### Intermediate

        Expose a **`/metrics`** endpoint for **Prometheus** or push to **OTLP**. Histogram buckets should match **SLO** thresholds (e.g., 100ms, 500ms).

        #### Expert

        Use **RED** (Rate, Errors, Duration) for services; **USE** (Utilization, Saturation, Errors) for resources. High-cardinality labels (raw `user_id`) explode **time-series** cost—bucket carefully.

        **Key Points (24.1.4)**

        - Histograms power **SLO** dashboards and **alerting**.
- Middleware-based timing captures **total** request time.

        **Best Practices (24.1.4)**

        - Keep **label cardinality** low; aggregate in app logic when needed.

        **Common Mistakes (24.1.4)**

        - Measuring only **average** latency in metrics backends.



### 24.1.5 Monitoring Tools

        #### Beginner

        Monitoring stacks combine **metrics**, **logs**, and **traces**—the **three pillars**. For FastAPI, you typically run **Uvicorn/Gunicorn** behind a reverse proxy and scrape metrics or ship OTLP.


```python
            # Minimal structured log with trace correlation idea
            import logging
            import uuid

            from fastapi import FastAPI, Request

            logging.basicConfig(level=logging.INFO)
            log = logging.getLogger("api")

            app = FastAPI()


            @app.middleware("http")
            async def trace_mw(request: Request, call_next):
                rid = str(uuid.uuid4())
                request.state.request_id = rid
                log.info("start", extra={"request_id": rid, "path": request.url.path})
                response = await call_next(request)
                response.headers["X-Request-ID"] = rid
                return response

```

        #### Intermediate

        Grafana + Prometheus is common self-hosted. Cloud vendors offer **APM** with auto-instrumentation. Choose tools your team can **operate** (on-call runbooks matter).

        #### Expert

        Advanced setups use **SLOs**, **burn rate alerts**, and **eBPF** node metrics. Correlate **trace_id** in logs for incident response.

        **Key Points (24.1.5)**

        - Tooling should **reduce MTTR**, not only store data.
- Unified **request_id/trace_id** links logs and traces.

        **Best Practices (24.1.5)**

        - Start with **health + RED metrics + error logs** before exotic tooling.

        **Common Mistakes (24.1.5)**

        - Collecting **everything** with no retention or **dashboard** strategy.



## 24.2 Caching Strategies

Caching trades **freshness** for **speed** and **cost**. HTTP caches, reverse proxies, and application caches each have different **invalidation** semantics—plan explicitly.

### 24.2.1 Response Caching

        #### Beginner

        Response caching stores **serialized representations** of successful responses (often JSON) keyed by route + parameters + auth context. It reduces repeated expensive work.


```python
            import time
            from functools import lru_cache

            from fastapi import FastAPI

            app = FastAPI()


            @lru_cache(maxsize=1024)
            def expensive_report_key(day: str) -> str:
                time.sleep(0.01)  # pretend work
                return f"report:{day}"


            @app.get("/report/{day}")
            def report(day: str) -> dict[str, str]:
                return {"key": expensive_report_key(day)}

```

        #### Intermediate

        In-app caches use **`functools.lru_cache`** for pure functions, **`cachetools.TTLCache`** for time-bound keys, or **Redis** for shared caches across workers.

        #### Expert

        Expert designs separate **authoritative** data from **derived** cache entries, use **versioned** keys, and apply **probabilistic early expiration** to prevent **thundering herds**.

        **Key Points (24.2.1)**

        - Cache keys must include **every input** that affects output.
- TTL is a simple **staleness** contract.

        **Best Practices (24.2.1)**

        - Never cache **personalized** responses under shared keys.

        **Common Mistakes (24.2.1)**

        - Caching **401/403** responses as if they were public data.



### 24.2.2 HTTP Caching Headers

        #### Beginner

        `Cache-Control`, `Expires`, and related headers tell browsers and CDNs **who** may cache, **for how long**, and whether **revalidation** is required.


```python
            from fastapi import FastAPI
            from fastapi.responses import JSONResponse

            app = FastAPI()


            @app.get("/public-config")
            def public_config() -> JSONResponse:
                payload = {"theme": "dark"}
                headers = {"Cache-Control": "public, max-age=60"}
                return JSONResponse(payload, headers=headers)

```

        #### Intermediate

        `public` vs `private`, `max-age`, `s-maxage`, `no-store` for sensitive APIs. For authenticated JSON, **`private`** or **`no-store`** is often correct.

        #### Expert

        Use **`stale-while-revalidate`** patterns at CDN when UX tolerates slightly stale content while refreshing asynchronously.

        **Key Points (24.2.2)**

        - Headers are contracts with **clients and intermediaries**.
- `no-store` protects **PII** from accidental caching.

        **Best Practices (24.2.2)**

        - Document cache semantics in **OpenAPI descriptions** for API consumers.

        **Common Mistakes (24.2.2)**

        - Setting **`public, max-age` forever** on user-specific JSON.



### 24.2.3 ETag and Last-Modified

        #### Beginner

        **ETag** is an opaque validator for a representation; **`Last-Modified`** is a weaker time-based validator. Clients send **`If-None-Match`** / **`If-Modified-Since`** for **conditional GETs**.


```python
            import hashlib
            import json

            from fastapi import FastAPI, Request
            from fastapi.responses import JSONResponse
            from starlette.responses import Response

            app = FastAPI()


            @app.get("/doc/{doc_id}")
            def doc(doc_id: str, request: Request) -> Response | JSONResponse:
                body = {"id": doc_id, "title": "Hello"}
                raw = json.dumps(body, sort_keys=True).encode()
                etag = hashlib.sha256(raw).hexdigest()
                inm = request.headers.get("if-none-match")
                if inm == etag:
                    return Response(status_code=304)
                return JSONResponse(body, headers={"ETag": etag})

```

        #### Intermediate

        Starlette/FastAPI can set validators manually. Strong ETags are ideal when byte-identical responses are cheap to compare; weak ETags allow semantically equivalent variants.

        #### Expert

        Combine ETags with **content hashing** of canonical JSON (sorted keys) for stable validators. Watch **serialization cost** if bodies are huge.

        **Key Points (24.2.3)**

        - 304 responses save **bandwidth** and **serialization**.
- ETags must change when **meaningful** content changes.

        **Best Practices (24.2.3)**

        - Prefer **strong** ETags unless intermediaries require weak semantics.

        **Common Mistakes (24.2.3)**

        - ETags derived from **unordered** dict JSON that changes serialization.



### 24.2.4 Conditional Requests

        #### Beginner

        Conditional requests avoid sending a full body when nothing changed. Beyond GET, **`If-Match`** supports optimistic concurrency for **PUT/PATCH**.


```python
            from fastapi import FastAPI, Header, HTTPException

            app = FastAPI()
            DB = {"1": ("v1", {"name": "Ada"})}


            @app.patch("/users/1")
            def patch_user(if_match: str | None = Header(default=None)) -> dict:
                ver, row = DB["1"]
                if if_match is None:
                    raise HTTPException(status_code=428, detail="If-Match required")
                if if_match.strip('"') != ver:
                    raise HTTPException(status_code=412, detail="version conflict")
                new_ver = "v2"
                DB["1"] = (new_ver, {**row, "name": "Grace"})
                return {"ok": True, "etag": new_ver}

```

        #### Intermediate

        Implement ETag checks in handlers; return **412 Precondition Failed** when `If-Match` mismatches for safe updates.

        #### Expert

        For large downloads, **`Range`** requests interact with caching—ensure proxies preserve semantics.

        **Key Points (24.2.4)**

        - Conditional updates prevent **lost updates** in concurrent editors.

        **Best Practices (24.2.4)**

        - Return **`ETag`** on successful writes for the next round-trip.

        **Common Mistakes (24.2.4)**

        - Ignoring **`If-Match`** on state-changing endpoints that need safety.



### 24.2.5 Cache Invalidation

        #### Beginner

        **Invalidation** removes or refreshes stale entries. It is famously hard because **many layers** may cache (browser, CDN, app, DB).


```python
            from cachetools import TTLCache

            from fastapi import FastAPI

            app = FastAPI()
            CACHE: TTLCache[str, str] = TTLCache(maxsize=10_000, ttl=30)


            @app.post("/invalidate/{key}")
            def invalidate(key: str) -> dict[str, bool]:
                CACHE.pop(key, None)
                return {"cleared": True}


            @app.get("/value/{key}")
            def value(key: str) -> dict[str, str]:
                hit = CACHE.get(key)
                if hit is None:
                    hit = f"computed-{key}"
                    CACHE[key] = hit
                return {"key": key, "value": hit}

```

        #### Intermediate

        Patterns: **TTL**, **event-driven purge** (message on write), **versioned keys** (`cache:v3:...`), and **single-flight** regeneration.

        #### Expert

        For CDNs, use **purge APIs** or **surrogate keys** (Fastly) to invalidate groups of objects atomically.

        **Key Points (24.2.5)**

        - Prefer **explicit** invalidation on writes for strong consistency needs.
- TTL is **eventual** consistency by design.

        **Best Practices (24.2.5)**

        - Log **cache bust** events** during incidents for traceability.

        **Common Mistakes (24.2.5)**

        - Assuming **one** cache layer—forgetting CDN still serves old assets.



## 24.3 Database Optimization

Databases dominate latency in many FastAPI services. Optimization starts with **fewer round trips**, **better indexes**, and **right-sized pools**—not fancier ORM tricks alone.

### 24.3.1 Query Optimization

        #### Beginner

        Query optimization means returning **only needed columns/rows**, using **efficient joins**, and avoiding **accidental full scans**.


```python
            # SQLAlchemy 2.0 style: fetch columns explicitly
            from sqlalchemy import Select, create_engine, select
            from sqlalchemy.orm import Session, declarative_base, mapped_column
            from sqlalchemy.orm import Mapped

            Base = declarative_base()


            class User(Base):
                __tablename__ = "users"
                id: Mapped[int] = mapped_column(primary_key=True)
                email: Mapped[str]
                bio: Mapped[str]


            engine = create_engine("sqlite:///:memory:")
            Base.metadata.create_all(engine)

            with Session(engine) as session:
                stmt: Select[tuple[int, str]] = select(User.id, User.email).where(User.id == 1)
                row = session.execute(stmt).one_or_none()

```

        #### Intermediate

        Use **`EXPLAIN ANALYZE`** (Postgres) on slow queries. ORMs hide SQL—log statements in dev with **`echo=True`** or middleware.

        #### Expert

        Expert teams maintain **query budgets** per endpoint (max rows, max joins) and add **guardrails** in code reviews.

        **Key Points (24.3.1)**

        - Smaller rows reduce **memory** and **network** costs.
- Indexes enable **seek** instead of **scan**.

        **Best Practices (24.3.1)**

        - Add **pagination** to every list endpoint touching large tables.

        **Common Mistakes (24.3.1)**

        - Using **`SELECT *`** in hot paths for wide tables.



### 24.3.2 Indexing Strategies

        #### Beginner

        Indexes speed **lookups** and **joins** but slow **writes** and consume **disk**. Match indexes to **real filter/sort** patterns.


```python
            # Illustrative DDL (run in migrations, not at runtime)
            DDL = '''
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created
              ON orders (user_id, created_at DESC);
            '''
            print(DDL)

```

        #### Intermediate

        Composite indexes follow **left-prefix** rules—order columns by selectivity and query shape. Partial indexes help **sparse** predicates.

        #### Expert

        Expert: monitor **index bloat**, **unused indexes**, and **write amplification** during migrations.

        **Key Points (24.3.2)**

        - Index the **WHERE/JOIN/ORDER BY** shape, not guessed columns.

        **Best Practices (24.3.2)**

        - Validate with **`EXPLAIN`** after data growth, not only on empty tables.

        **Common Mistakes (24.3.2)**

        - Adding indexes to every column **just in case**.



### 24.3.3 Connection Pooling

        #### Beginner

        Pools reuse DB connections to avoid **TCP + auth** overhead. Too small a pool causes **queueing**; too large overwhelms the DB.


```python
            from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

            engine = create_async_engine(
                "sqlite+aiosqlite:///:memory:",
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
            )
            SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

```

        #### Intermediate

        SQLAlchemy **`QueuePool`**; async stacks use **`AsyncEngine`** pools. Size pools using **(workers × expected concurrent requests per worker)** with headroom.

        #### Expert

        Expert: enforce **statement timeouts** and **pool pre-ping**; watch **`pool overflow`** metrics during spikes.

        **Key Points (24.3.3)**

        - One **engine/pool per process**—not per request.

        **Best Practices (24.3.3)**

        - Tune **`pool_timeout`** to fail fast instead of hanging.

        **Common Mistakes (24.3.3)**

        - Creating a **new engine** for every FastAPI request.



### 24.3.4 Query Caching

        #### Beginner

        Query caching stores **result sets** (or ORM rows) to skip repeated identical queries. It overlaps with app caching but sits closer to data access.


```python
            import json

            from fastapi import FastAPI

            app = FastAPI()
            REDIS: dict[str, str] = {}


            def cache_get(key: str) -> dict | None:
                raw = REDIS.get(key)
                return None if raw is None else json.loads(raw)


            def cache_set(key: str, value: dict, ttl_hint: int = 30) -> None:
                REDIS[key] = json.dumps(value)
                _ = ttl_hint


            @app.get("/stats")
            def stats() -> dict:
                key = "stats:v1"
                hit = cache_get(key)
                if hit is not None:
                    return hit
                payload = {"users": 12345}
                cache_set(key, payload)
                return payload

```

        #### Intermediate

        Use Redis with **short TTL** for read-heavy dashboards. Invalidate on writes or use **version stamps** in keys.

        #### Expert

        Expert: beware **consistency** with transactional boundaries—cache outside the transaction commit window carefully.

        **Key Points (24.3.4)**

        - Cache keys must include **schema/version** and filter params.

        **Best Practices (24.3.4)**

        - Prefer **short TTL** over complex invalidation for low-risk reads.

        **Common Mistakes (24.3.4)**

        - Caching **non-deterministic** queries (e.g., `RANDOM()`) accidentally.



### 24.3.5 N+1 Problem

        #### Beginner

        N+1 means **one query** for a list plus **N queries** for related objects—classic ORM pitfall. It explodes latency under load.


```python
            # Conceptual SQLAlchemy relationship loading
            from sqlalchemy import select
            from sqlalchemy.orm import selectinload

            # users = session.scalars(select(User).options(selectinload(User.posts))).all()
            _ = (selectinload,)

```

        #### Intermediate

        Fix with **`selectinload`**, **`joinedload`**, or manual **JOIN** queries returning DTOs.

        #### Expert

        Expert: detect via SQL logs, ORM profilers, or **`assert_num_queries`** in tests.

        **Key Points (24.3.5)**

        - Batch-load **collections** eagerly when serializing lists.

        **Best Practices (24.3.5)**

        - Add **integration tests** that count queries for list endpoints.

        **Common Mistakes (24.3.5)**

        - Returning ORM models from list endpoints with **lazy** defaults.



## 24.4 Async Optimization

FastAPI's async model excels when you **await** I/O concurrently and avoid **blocking** the event loop. Optimization is often about **structure**, not micro-optimizations.

### 24.4.1 Concurrent Operations

        #### Beginner

        Concurrent operations run **overlapping waits**—multiple HTTP calls, DB calls, or sleeps—without blocking threads. `asyncio.gather` is the workhorse.


```python
            import asyncio

            import httpx
            from fastapi import FastAPI

            app = FastAPI()


            @app.get("/aggregate")
            async def aggregate() -> dict[str, int]:
                async with httpx.AsyncClient() as client:
                    urls = ["https://httpbin.org/delay/1" for _ in range(3)]
                    sem = asyncio.Semaphore(10)

                    async def fetch(u: str) -> int:
                        async with sem:
                            r = await client.get(u, timeout=5.0)
                            return r.status_code

                    codes = await asyncio.gather(*(fetch(u) for u in urls))
                return {"codes": sum(codes)}

```

        #### Intermediate

        Use **`return_exceptions=True`** when partial success is acceptable. Cap concurrency with **`Semaphore`** for fragile downstreams.

        #### Expert

        Expert: prefer **`TaskGroup`** (3.11+) for structured fan-out with automatic cancellation propagation on failures.

        **Key Points (24.4.1)**

        - `gather` overlaps **I/O waits**, not CPU work.

        **Best Practices (24.4.1)**

        - Always set **timeouts** on external calls.

        **Common Mistakes (24.4.1)**

        - Unbounded **`gather`** on user-supplied URL lists (SSRF + DoS).



### 24.4.2 Resource Pooling

        #### Beginner

        Pools apply to **HTTP clients**, **DB connections**, and **thread executors**. Creating clients per request wastes **sockets** and **TLS handshakes**.


```python
            from contextlib import asynccontextmanager

            import httpx
            from fastapi import FastAPI

            clients: dict[str, httpx.AsyncClient] = {}


            @asynccontextmanager
            async def lifespan(app: FastAPI):
                clients["http"] = httpx.AsyncClient(timeout=5.0)
                yield
                await clients["http"].aclose()


            app = FastAPI(lifespan=lifespan)


            @app.get("/pooled")
            async def pooled() -> dict[str, str]:
                r = await clients["http"].get("https://httpbin.org/get")
                return {"status": str(r.status_code)}

```

        #### Intermediate

        Store **`httpx.AsyncClient`** and DB engine in **`lifespan`** context and inject via dependencies.

        #### Expert

        Expert: tune **HTTP/2** multiplexer limits and **keep-alive** to match upstreams.

        **Key Points (24.4.2)**

        - Shared clients amortize **connection setup**.

        **Best Practices (24.4.2)**

        - Close resources on **shutdown** to avoid FD leaks.

        **Common Mistakes (24.4.2)**

        - Instantiating **`AsyncClient`** inside every request handler.



### 24.4.3 Rate Limiting

        #### Beginner

        Rate limiting protects your API and **downstream dependencies** from abuse or accidental storms. It can be **global**, **per user**, or **per IP**.


```python
            import time

            from fastapi import FastAPI, Request
            from starlette.responses import JSONResponse

            app = FastAPI()
            BUCKET: dict[str, tuple[float, float]] = {}


            def allow(key: str, rate_per_s: float, burst: float) -> bool:
                now = time.monotonic()
                refill, tokens = BUCKET.get(key, (now, burst))
                elapsed = now - refill
                tokens = min(burst, tokens + elapsed * rate_per_s)
                if tokens < 1.0:
                    BUCKET[key] = (now, tokens)
                    return False
                BUCKET[key] = (now, tokens - 1.0)
                return True


            @app.middleware("http")
            async def rl(request: Request, call_next):
                ip = request.client.host if request.client else "unknown"
                if not allow(f"ip:{ip}", rate_per_s=5.0, burst=10.0):
                    return JSONResponse({"detail": "Too Many Requests"}, status_code=429)
                return await call_next(request)

```

        #### Intermediate

        In-process token buckets are simple; **Redis** enables distributed limits across workers.

        #### Expert

        Expert: add **retry-after** headers and **priority** tiers for paid vs free usage.

        **Key Points (24.4.3)**

        - Rate limits are a **product** and **reliability** control.

        **Best Practices (24.4.3)**

        - Prefer **central** stores for multi-instance fairness.

        **Common Mistakes (24.4.3)**

        - Token buckets **without** synchronization in multi-threaded workers.



### 24.4.4 Backpressure Handling

        #### Beginner

        Backpressure signals **overload**: slow down producers, shed load, or queue with bounds. Without it, memory and latency explode.


```python
            import asyncio

            from fastapi import FastAPI, HTTPException

            app = FastAPI()
            SEM = asyncio.Semaphore(50)


            @app.get("/limited")
            async def limited() -> dict[str, str]:
                try:
                    await asyncio.wait_for(SEM.acquire(), timeout=0.0)
                except TimeoutError:
                    raise HTTPException(status_code=503, detail="overloaded")
                try:
                    await asyncio.sleep(0.01)
                    return {"ok": "true"}
                finally:
                    SEM.release()

```

        #### Intermediate

        Use **`Semaphore`** around downstream calls, limit **upload sizes**, and return **503** with **`Retry-After`** when saturated.

        #### Expert

        Expert: implement **adaptive concurrency** (AIMD) or **circuit breakers** for flaky dependencies.

        **Key Points (24.4.4)**

        - Bounded queues protect **memory** under spikes.

        **Best Practices (24.4.4)**

        - Combine **timeouts** with **concurrency limits**.

        **Common Mistakes (24.4.4)**

        - Unbounded **`asyncio.Queue`** fed by fast producers.



### 24.4.5 Memory Management

        #### Beginner

        Async apps can still **OOM** from large responses, buffering uploads, or unbounded caches. Memory is a **performance** and **stability** concern.


```python
            from fastapi import FastAPI
            from fastapi.responses import StreamingResponse

            app = FastAPI()


            def big_lines():
                for i in range(1_000_000):
                    yield f"line {i}
".encode()


            @app.get("/stream")
            def stream() -> StreamingResponse:
                return StreamingResponse(big_lines(), media_type="text/plain")

```

        #### Intermediate

        Stream large downloads/uploads; paginate lists; evict caches. Monitor **RSS** and **GC** pauses.

        #### Expert

        Expert: use **`__slots__`** sparingly for huge object graphs; profile with **`tracemalloc`** for leaks.

        **Key Points (24.4.5)**

        - Streaming avoids **materializing** giant bodies.

        **Best Practices (24.4.5)**

        - Set **max upload** limits at proxy and app layers.

        **Common Mistakes (24.4.5)**

        - Building **giant** `list[dict]` responses for export endpoints.



## 24.5 Response Optimization

Smaller, faster responses reduce **bandwidth**, **client CPU**, and **server serialization** time. Shape payloads for **clients** and **network realities**.

### 24.5.1 Response Compression

        #### Beginner

        Compression (gzip, brotli) shrinks text payloads dramatically. ASGI servers or reverse proxies often handle it—avoid double compression.


```python
            # Usually configure at Nginx:
            NGINX_SNIPPET = '''
            gzip on;
            gzip_types application/json text/plain;
            gzip_min_length 256;
            '''
            print(NGINX_SNIPPET)

```

        #### Intermediate

        Enable gzip at **Nginx** or Uvicorn proxy layers. JSON benefits; images/PDFs usually do not.

        #### Expert

        Expert: CPU cost rises—measure **p99** on small payloads where compression overhead dominates.

        **Key Points (24.5.1)**

        - Compress **text**, not already compressed **binary**.

        **Best Practices (24.5.1)**

        - Respect **`Accept-Encoding`** negotiation.

        **Common Mistakes (24.5.1)**

        - Compressing **tiny** JSON—overhead exceeds savings.



### 24.5.2 Minification

        #### Beginner

        Minification removes whitespace in HTML/CSS/JS. APIs rarely minify JSON (not standard), but **field naming** and **omit nulls** reduce size.


```python
            from typing import Optional

            from fastapi import FastAPI
            from pydantic import BaseModel

            app = FastAPI()


            class M(BaseModel):
                a: int
                b: Optional[str] = None


            @app.get("/m", response_model=M, response_model_exclude_none=True)
            def m() -> M:
                return M(a=1, b=None)

```

        #### Intermediate

        Use **`response_model_exclude_none`** and compact schemas for mobile clients.

        #### Expert

        Expert: consider **binary** formats (Protobuf, MessagePack) for internal high-throughput services.

        **Key Points (24.5.2)**

        - Smaller JSON lowers **mobile** costs and parse time.

        **Best Practices (24.5.2)**

        - Prefer **meaningful** field names over cryptic min keys unless versioning allows.

        **Common Mistakes (24.5.2)**

        - Breaking clients by renaming fields for **cosmetic** savings without versioning.



### 24.5.3 Pagination

        #### Beginner

        Pagination limits rows per response using **`limit`/`offset`**, **cursors**, or **keyset** pagination. It protects DB and clients.


```python
            from fastapi import FastAPI, Query

            app = FastAPI()
            ROWS = [{"id": i, "v": i * 2} for i in range(1000)]


            @app.get("/items")
            def items(limit: int = Query(50, le=200), after: int | None = None) -> dict:
                data = ROWS if after is None else [r for r in ROWS if r["id"] > after]
                page = data[:limit]
                nxt = page[-1]["id"] if len(page) == limit else None
                return {"items": page, "next_after": nxt}

```

        #### Intermediate

        Offset pagination is simple but slows on deep pages; keyset uses **`WHERE id > ? ORDER BY id LIMIT`** for stable performance.

        #### Expert

        Expert: expose **`next_cursor`** and stable sort keys; document **tie-breakers**.

        **Key Points (24.5.3)**

        - Always cap **`limit`** to prevent abuse.

        **Best Practices (24.5.3)**

        - Use **keyset** for large tables and feeds.

        **Common Mistakes (24.5.3)**

        - Unbounded **`SELECT *` without `LIMIT`**.



### 24.5.4 Lazy Loading

        #### Beginner

        Lazy loading defers expensive work until needed. In APIs, it often means **field masks**, **sparse fieldsets**, or separate **detail** endpoints.


```python
            from fastapi import FastAPI, Query

            app = FastAPI()


            @app.get("/users/{user_id}")
            def user(user_id: int, fields: str | None = Query(default=None)) -> dict:
                base = {"id": user_id, "name": "Ada", "bio": "long" * 1000}
                if fields:
                    keep = {f.strip() for f in fields.split(",")}
                    return {k: v for k, v in base.items() if k in keep}
                return base

```

        #### Intermediate

        GraphQL solves lazy shapes but adds complexity; REST uses **`fields=`** query params or **JSON:API sparse fieldsets** patterns.

        #### Expert

        Expert: avoid **N+1** when lazy loading related resources—batch internal fetches.

        **Key Points (24.5.4)**

        - Lazy loading reduces **payload** for list views.

        **Best Practices (24.5.4)**

        - Document **allowed fields** to keep responses stable.

        **Common Mistakes (24.5.4)**

        - Per-field lazy loading that triggers **hidden** DB queries per field.



### 24.5.5 Streaming

        #### Beginner

        Streaming sends bytes as they become available—ideal for **SSE**, **large CSV**, or **proxying** upstream bodies.


```python
            import asyncio

            from fastapi import FastAPI
            from fastapi.responses import StreamingResponse

            app = FastAPI()


            async def gen():
                for i in range(3):
                    await asyncio.sleep(0.2)
                    yield f"data: tick {i}

".encode()


            @app.get("/sse")
            async def sse() -> StreamingResponse:
                return StreamingResponse(
                    gen(),
                    media_type="text/event-stream",
                    headers={"Cache-Control": "no-cache"},
                )

```

        #### Intermediate

        Use **`StreamingResponse`** or **`EventSourceResponse`** patterns; set **`Cache-Control: no-cache`** for live streams.

        #### Expert

        Expert: handle **client disconnects** to stop upstream work promptly.

        **Key Points (24.5.5)**

        - Streaming improves **TTFB** for large outputs.

        **Best Practices (24.5.5)**

        - For SSE, send **heartbeats** through proxies with idle timeouts.

        **Common Mistakes (24.5.5)**

        - Buffering entire streams in memory **before** responding.



## 24.6 Advanced Optimization

Distributed patterns move work **closer to users** or **out of the request path**. They add **operational** complexity—adopt when metrics justify it.

### 24.6.1 CDN Integration

        #### Beginner

        CDNs cache static assets and cacheable API responses at **edge PoPs**, reducing latency and origin load.


```python
            # CloudFront-style pseudo config as data
            CDN_RULE = {
                "behaviors": [
                    {"path": "/static/*", "ttl": 86400},
                    {"path": "/api/public/*", "ttl": 60},
                ]
            }
            print(CDN_RULE)

```

        #### Intermediate

        Configure **Origin** headers, **TLS**, and **purge** workflows. Authenticated APIs usually bypass CDN or use **private** caching rules.

        #### Expert

        Expert: use **signed URLs** for protected downloads; **stale-while-revalidate** for semi-static JSON.

        **Key Points (24.6.1)**

        - CDNs excel at **immutable** assets with hashed filenames.

        **Best Practices (24.6.1)**

        - Never cache **OAuth token** exchanges at shared caches.

        **Common Mistakes (24.6.1)**

        - Forgetting to **invalidate** after deployments.



### 24.6.2 Edge Caching

        #### Beginner

        Edge caching stores responses geographically close to users—sub-10ms RTT versus round trips to a central region.


```python
            # Worker pseudo-code (JavaScript shown as comment) — Python origin stays thin
            EDGE = "// add Cache-Control at edge based on route pattern"
            print(EDGE)

```

        #### Intermediate

        Use **Varnish**, **Cloudflare Workers**, or **Lambda@Edge** for logic near users. Keep edge code **simple** and **auditable**.

        #### Expert

        Expert: watch **consistency**—edge caches are **eventually consistent** by nature.

        **Key Points (24.6.2)**

        - Edge is for **latency** and **offload**, not all business logic.

        **Best Practices (24.6.2)**

        - Minimize **secret** exposure in edge code.

        **Common Mistakes (24.6.2)**

        - Caching **personalized** HTML at shared edge without `Vary` awareness.



### 24.6.3 Distributed Caching

        #### Beginner

        Distributed caches (**Redis**, **Memcached**) share state across app instances: sessions, rate limits, computed aggregates.


```python
            import json

            import redis

            r = redis.Redis(host="localhost", port=6379, decode_responses=True)


            def get_user_cached(user_id: int) -> dict | None:
                raw = r.get(f"user:{user_id}")
                return None if raw is None else json.loads(raw)

```

        #### Intermediate

        Use **TTL**, **namespacing**, and **serialization** formats (JSON, msgpack). Plan for **eviction** and **hot keys**.

        #### Expert

        Expert: employ **read-through** and **write-through** patterns; consider **Redis Cluster** for scale.

        **Key Points (24.6.3)**

        - Shared cache aligns behavior across **horizontal** scale.

        **Best Practices (24.6.3)**

        - Use **connection pooling** for Redis clients.

        **Common Mistakes (24.6.3)**

        - Storing **large** blobs in Redis—use object storage instead.



### 24.6.4 Message Queues

        #### Beginner

        Queues decouple **request latency** from **slow work**: send a job, return **202 Accepted**, process asynchronously.


```python
            from fastapi import BackgroundTasks, FastAPI

            app = FastAPI()


            def send_email(user_id: int) -> None:
                print("sending", user_id)


            @app.post("/signup")
            async def signup(user_id: int, tasks: BackgroundTasks) -> dict[str, str]:
                tasks.add_task(send_email, user_id)
                return {"status": "accepted"}

```

        #### Intermediate

        Brokers: **Redis streams**, **RabbitMQ**, **SQS**, **Kafka** (log). Choose based on ordering, durability, and ops maturity.

        #### Expert

        Expert: implement **idempotent** consumers and **dead-letter queues**.

        **Key Points (24.6.4)**

        - Queues smooth **spiky** write workloads.

        **Best Practices (24.6.4)**

        - For heavy workloads, prefer **durable brokers** over in-process only.

        **Common Mistakes (24.6.4)**

        - Losing jobs on **process crash** with only `BackgroundTasks`.



### 24.6.5 Microservices Architecture

        #### Beginner

        Microservices split domains into **independently deployable** services. They can improve **team scaling** but worsen **latency** and **complexity** if overused.


```python
            # Two FastAPI apps as separate deployables (conceptual)
            USERS_APP = "uvicorn users_service:app --port 8001"
            ORDERS_APP = "uvicorn orders_service:app --port 8002"
            print(USERS_APP, ORDERS_APP)

```

        #### Intermediate

        FastAPI is a great **per-service** framework; use **API gateways**, **service mesh** cautiously, and **synchronous** chains sparingly.

        #### Expert

        Expert: invest in **contract tests**, **SLOs per service**, and **observability** before splitting monoliths.

        **Key Points (24.6.5)**

        - Services should map to **team** and **deployment** boundaries.

        **Best Practices (24.6.5)**

        - Prefer **async messaging** over deep **sync RPC** chains.

        **Common Mistakes (24.6.5)**

        - Creating **10** services before **one** is stable and measured.



        ---

        ## Chapter Key Points, Best Practices, and Common Mistakes (24)

        ### Key Points

        - Measure **before** optimizing; watch **p95/p99** and saturation.
- Caches and CDNs need explicit **contracts** (`Cache-Control`, keys, TTL).
- Database issues dominate many FastAPI bottlenecks—**indexes**, **pooling**, **N+1**.
- Async wins come from **non-blocking I/O** and **bounded** concurrency.
- Distributed patterns trade **complexity** for **scale**—justify with data.

        ### Best Practices

        - Add **metrics + structured logs + tracing** early.
- Use **keyset pagination** and **streaming** for large payloads.
- Share **HTTP/DB clients** via lifespan and pools.
- Rate limit and apply **backpressure** at overload.
- Invalidate caches on **writes** when correctness requires it.

        ### Common Mistakes

        - Micro-benchmarking while production fails on **DB pool** exhaustion.
- Caching authenticated responses as **public**.
- Unbounded `gather` and **per-request clients**.
- Ignoring **ETag/conditional** opportunities on hot reads.
- Splitting into microservices without **observability** maturity.

