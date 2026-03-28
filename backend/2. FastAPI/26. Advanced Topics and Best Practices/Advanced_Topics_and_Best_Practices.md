# Advanced Topics and Best Practices

This chapter connects **day-one** FastAPI skills to **long-lived** systems: how to **structure** large apps, **version** APIs safely, **shape** OpenAPI documentation, **throttle** fairly, **observe** deeply, **integrate** gateways and GraphQL where appropriate, and adopt **engineering standards** that keep teams fast without breaking clients.

**How to use these notes:** Treat each subsection as a **checklist** you can apply incrementally—structure first, then versioning, then cross-cutting concerns like rate limits and docs.


## 📑 Table of Contents

- [26.1 Application Structure](#261-application-structure)
  - [26.1.1 Project Layout](#2611-project-layout)
  - [26.1.2 Modular Architecture](#2612-modular-architecture)
  - [26.1.3 Blueprint/Router Organization](#2613-blueprintrouter-organization)
  - [26.1.4 Configuration Management](#2614-configuration-management)
  - [26.1.5 Application Factory Pattern](#2615-application-factory-pattern)
- [26.2 API Versioning](#262-api-versioning)
  - [26.2.1 URL-Based Versioning](#2621-url-based-versioning)
  - [26.2.2 Header-Based Versioning](#2622-header-based-versioning)
  - [26.2.3 Query Parameter Versioning](#2623-query-parameter-versioning)
  - [26.2.4 Version Deprecation](#2624-version-deprecation)
  - [26.2.5 Backward Compatibility](#2625-backward-compatibility)
- [26.3 OpenAPI and Documentation](#263-openapi-and-documentation)
  - [26.3.1 OpenAPI Schema Generation](#2631-openapi-schema-generation)
  - [26.3.2 Custom Schemas](#2632-custom-schemas)
  - [26.3.3 Documentation Customization](#2633-documentation-customization)
  - [26.3.4 ReDoc Integration](#2634-redoc-integration)
  - [26.3.5 Custom Documentation UI](#2635-custom-documentation-ui)
- [26.4 Rate Limiting and Throttling](#264-rate-limiting-and-throttling)
  - [26.4.1 Simple Rate Limiting](#2641-simple-rate-limiting)
  - [26.4.2 User-Based Rate Limiting](#2642-user-based-rate-limiting)
  - [26.4.3 IP-Based Rate Limiting](#2643-ip-based-rate-limiting)
  - [26.4.4 Sliding Window Algorithm](#2644-sliding-window-algorithm)
  - [26.4.5 Rate Limit Headers](#2645-rate-limit-headers)
- [26.5 Logging and Monitoring](#265-logging-and-monitoring)
  - [26.5.1 Logging Configuration](#2651-logging-configuration)
  - [26.5.2 Structured Logging](#2652-structured-logging)
  - [26.5.3 Log Aggregation](#2653-log-aggregation)
  - [26.5.4 Application Monitoring](#2654-application-monitoring)
  - [26.5.5 Health Checks](#2655-health-checks)
- [26.6 API Gateway Integration](#266-api-gateway-integration)
  - [26.6.1 API Gateway Concepts](#2661-api-gateway-concepts)
  - [26.6.2 Kong Integration](#2662-kong-integration)
  - [26.6.3 AWS API Gateway](#2663-aws-api-gateway)
  - [26.6.4 Authentication at Gateway](#2664-authentication-at-gateway)
  - [26.6.5 Rate Limiting at Gateway](#2665-rate-limiting-at-gateway)
- [26.7 GraphQL Integration](#267-graphql-integration)
  - [26.7.1 GraphQL Basics](#2671-graphql-basics)
  - [26.7.2 Graphene with FastAPI](#2672-graphene-with-fastapi)
  - [26.7.3 Query Resolution](#2673-query-resolution)
  - [26.7.4 Mutation Handling](#2674-mutation-handling)
  - [26.7.5 Subscription Support](#2675-subscription-support)
- [26.8 Best Practices](#268-best-practices)
  - [26.8.1 Code Organization](#2681-code-organization)
  - [26.8.2 Error Handling Strategy](#2682-error-handling-strategy)
  - [26.8.3 Security Best Practices](#2683-security-best-practices)
  - [26.8.4 Documentation Standards](#2684-documentation-standards)
  - [26.8.5 Testing Standards](#2685-testing-standards)
- [Chapter Key Points, Best Practices, and Common Mistakes (26)](#chapter-key-points-best-practices-and-common-mistakes-26)

---

## 26.1 Application Structure

Structure is the **pressure relief valve** for complexity: clear modules, routers, and configuration make refactors **safe** and onboarding **fast**.

### 26.1.1 Project Layout

        #### Beginner

        Beginners benefit from a **flat** layout (`main.py`, `routers/`, `models/`). As features grow, group by **domain** (users, billing) rather than technical layer only.


```python
            # Suggested layout (conceptual)
            LAYOUT = '''
            app/
              main.py
              core/config.py
              api/deps.py
              domains/users/router.py
              domains/users/schemas.py
              domains/users/service.py
            '''
            print(LAYOUT)

```

        #### Intermediate

        Separate **dependencies**, **settings**, and **db session** factories into dedicated modules to avoid circular imports.

        #### Expert

        Expert: adopt **bounded contexts** from DDD—each package owns models, schemas, services, and router; cross-context calls go through explicit **facades** or events.

        **Key Points (26.1.1)**

        - Colocate **router + schemas + service** per domain when practical.
- Keep **`main.py`** thin—wire routers and lifespan only.

        **Best Practices (26.1.1)**

        - Use **`__init__.py`** exports sparingly to avoid import cycles.

        **Common Mistakes (26.1.1)**

        - One giant **`routes.py`** with thousands of lines.



### 26.1.2 Modular Architecture

        #### Beginner

        Modules are Python's natural **encapsulation** tool. Each module should expose a **small public surface**.


```python
            from typing import Protocol


            class Notifier(Protocol):
                def send(self, user_id: int, msg: str) -> None: ...


            class LogNotifier:
                def send(self, user_id: int, msg: str) -> None:
                    print(user_id, msg)

```

        #### Intermediate

        Use **protocols** / **ABC** for swappable implementations (e.g., email sender, storage backend).

        #### Expert

        Expert: enforce module boundaries with **import-linter** or **ruff** rules in CI.

        **Key Points (26.1.2)**

        - Depend on **interfaces**, not concrete vendors, at domain boundaries.

        **Best Practices (26.1.2)**

        - Test modules in **isolation** with fakes implementing protocols.

        **Common Mistakes (26.1.2)**

        - **Circular imports** between `models` and `schemas`—extract shared types.



### 26.1.3 Blueprint/Router Organization

        #### Beginner

        Flask uses **Blueprints**; FastAPI uses **`APIRouter`** with **`prefix`** and **`tags`**. Compose routers in `main.py` or an **`include_routers`** function.


```python
            from fastapi import APIRouter, Depends, FastAPI

            app = FastAPI()
            users = APIRouter(prefix="/users", tags=["users"])


            @users.get("/")
            def list_users() -> list[dict]:
                return []


            app.include_router(users)

```

        #### Intermediate

        Share **dependencies** via `Depends` in `api/deps.py`. Name routers after **resources** or **use cases**.

        #### Expert

        Expert: attach **OpenAPI tags metadata** for richer docs grouping; use **`dependencies=[]`** on routers for common auth.

        **Key Points (26.1.3)**

        - `APIRouter` is the idiomatic **composition** unit.

        **Best Practices (26.1.3)**

        - Keep **prefix** consistent with versioning strategy.

        **Common Mistakes (26.1.3)**

        - Duplicating the same **`prefix`** across nested includes accidentally.



### 26.1.4 Configuration Management

        #### Beginner

        Centralize settings with **Pydantic Settings**; avoid scattered `os.getenv` calls.


```python
            from pydantic_settings import BaseSettings, SettingsConfigDict


            class Settings(BaseSettings):
                model_config = SettingsConfigDict(env_prefix="APP_")
                jwt_audience: str = "api"


            settings = Settings()

```

        #### Intermediate

        Support **multiple env files** only in dev; prod uses platform injection.

        #### Expert

        Expert: **config schema versioning** and **feature flags** service for dynamic toggles beyond static env.

        **Key Points (26.1.4)**

        - Validate types at startup—catch **`int` port** errors early.

        **Best Practices (26.1.4)**

        - Document **`APP_` prefix** conventions for operators.

        **Common Mistakes (26.1.4)**

        - Silent defaults that **disable security** (e.g., `auth_required=False`).



### 26.1.5 Application Factory Pattern

        #### Beginner

        The factory pattern builds **`FastAPI()`** inside `create_app()` to customize config per tests or CLI contexts.


```python
            from fastapi import FastAPI


            def create_app() -> FastAPI:
                app = FastAPI(title="Orders API")
                return app


            app = create_app()

```

        #### Intermediate

        Tests call `create_app()` with **overrides**; avoid mutating a global `app` singleton.

        #### Expert

        Expert: factories enable **multi-tenant** mode switches or **plugin** registration based on settings.

        **Key Points (26.1.5)**

        - Factories simplify **dependency override** in tests.

        **Best Practices (26.1.5)**

        - Register **routers** inside the factory for one import side effect.

        **Common Mistakes (26.1.5)**

        - Global **`app.state`** mutated at import time—hard to test.

## 26.2 API Versioning

Public APIs **live longer** than internal code. Versioning is how you **evolve** without breaking clients unexpectedly.

### 26.2.1 URL-Based Versioning

        #### Beginner

        Prefix routes with **`/v1`**, **`/v2`**. This is obvious in logs and easy for humans to reason about.


```python
            from fastapi import APIRouter, FastAPI

            app = FastAPI()
            v1 = APIRouter(prefix="/v1")
            v2 = APIRouter(prefix="/v2")


            @v1.get("/items")
            def items_v1() -> dict:
                return {"version": 1, "items": []}


            app.include_router(v1)
            app.include_router(v2)

```

        #### Intermediate

        Mount version routers separately; share **services** underneath to avoid duplicating business logic.

        #### Expert

        Expert: combine URL versions with **deprecation headers** and **sunset** dates in docs.

        **Key Points (26.2.1)**

        - URL versions are **cache-friendly** and visible in support tickets.

        **Best Practices (26.2.1)**

        - Avoid duplicating **Pydantic models**—compose shared base models.

        **Common Mistakes (26.2.1)**

        - Breaking changes **without** bumping version—silent client breakage.



### 26.2.2 Header-Based Versioning

        #### Beginner

        Clients send **`Accept: application/vnd.company.v2+json`** or **`API-Version: 2`**. URLs stay stable—good for hypermedia purists.


```python
            from fastapi import FastAPI, Header, HTTPException

            app = FastAPI()


            @app.get("/items")
            def items(x_api_version: str | None = Header(default=None)) -> dict:
                if x_api_version == "2":
                    return {"shape": "v2"}
                if x_api_version in (None, "1"):
                    return {"shape": "v1"}
                raise HTTPException(status_code=400, detail="unknown api version")

```

        #### Intermediate

        Implement via dependency that **selects** handler tables or response serializers based on header.

        #### Expert

        Expert: negotiate **content types** carefully with CDNs and caching (`Vary` header).

        **Key Points (26.2.2)**

        - Headers keep URLs **stable** across versions.

        **Best Practices (26.2.2)**

        - Always **`Vary`** on the version header for shared URLs.

        **Common Mistakes (26.2.2)**

        - Forgetting **`Vary`**—CDNs serve wrong JSON to clients.



### 26.2.3 Query Parameter Versioning

        #### Beginner

        `GET /items?version=2` is simple for quick prototypes; it clutters URLs and is easy for clients to omit.


```python
            from fastapi import FastAPI, Query

            app = FastAPI()


            @app.get("/report")
            def report(version: int = Query(default=1, ge=1, le=2)) -> dict:
                return {"version": version, "rows": []}

```

        #### Intermediate

        If used, treat missing version as **oldest supported** or **latest**—document clearly.

        #### Expert

        Expert: prefer header or path for public APIs; query versions complicate **HTTP caching** keys.

        **Key Points (26.2.3)**

        - Explicit defaults prevent **ambiguous** behavior.

        **Best Practices (26.2.3)**

        - Validate **`version`** with `Query` constraints.

        **Common Mistakes (26.2.3)**

        - Letting **`version` float** implicitly without a policy.



### 26.2.4 Version Deprecation

        #### Beginner

        Deprecation communicates **timeline**: emit **`Deprecation`** / **`Sunset`** headers and log structured warnings.


```python
            from fastapi import FastAPI, Response

            app = FastAPI()


            @app.get("/v1/legacy")
            def legacy(response: Response) -> dict:
                response.headers["Deprecation"] = "true"
                response.headers["Sunset"] = "Sat, 01 Nov 2026 00:00:00 GMT"
                return {"ok": True}

```

        #### Intermediate

        Track usage per version in **metrics** to see when safe to remove.

        #### Expert

        Expert: run **contract tests** for remaining clients; offer **migration guides** with examples.

        **Key Points (26.2.4)**

        - Sunset headers are **machine-readable** reminders.

        **Best Practices (26.2.4)**

        - Announce deprecations in **release notes** and emails to integrators.

        **Common Mistakes (26.2.4)**

        - Removing versions **without** telemetry proving zero traffic.



### 26.2.5 Backward Compatibility

        #### Beginner

        Compatible changes: **adding optional fields**, **new endpoints**, **additive** enum values (careful with strict clients).


```python
            from pydantic import BaseModel, Field


            class UserV2(BaseModel):
                id: int
                name: str
                display_name: str | None = Field(default=None, description="deprecated: use name")

```

        #### Intermediate

        Breaking changes: **removing** fields, changing types, tightening validation. Prefer **parallel fields** during migration windows.

        #### Expert

        Expert: use **JSON Schema compatibility** checks in CI for response models.

        **Key Points (26.2.5)**

        - Prefer **additive** evolution; use feature flags to gate new semantics.

        **Best Practices (26.2.5)**

        - Document **field deprecations** in OpenAPI descriptions.

        **Common Mistakes (26.2.5)**

        - Renaming fields **without** aliases—mobile apps break silently.

## 26.3 OpenAPI and Documentation

FastAPI generates **OpenAPI** from type hints and dependencies—treat the schema as a **contract** consumers rely on.

### 26.3.1 OpenAPI Schema Generation

        #### Beginner

        OpenAPI describes **paths**, **parameters**, **request bodies**, and **responses**. FastAPI builds this from **Pydantic models** and route signatures.


```python
            from fastapi import FastAPI
            from fastapi.openapi.utils import get_openapi

            app = FastAPI(title="Demo", version="1.0.0")


            def custom_openapi():
                if app.openapi_schema:
                    return app.openapi_schema
                schema = get_openapi(title=app.title, version=app.version, routes=app.routes)
                app.openapi_schema = schema
                return schema


            app.openapi = custom_openapi  # type: ignore[method-assign]

```

        #### Intermediate

        Customize global metadata via `FastAPI(title=..., version=...)`. Use **`response_model`** to constrain outputs.

        #### Expert

        Expert: export **`openapi.json`** in CI and diff for breaking changes; publish as an **artifact**.

        **Key Points (26.3.1)**

        - `openapi.json` is the **source of truth** for codegen tools.

        **Best Practices (26.3.1)**

        - Keep **versions** in sync with API product version.

        **Common Mistakes (26.3.1)**

        - Returning **extra fields** inconsistent with `response_model`—doc lies.



### 26.3.2 Custom Schemas

        #### Beginner

        Use **`Field`** for examples, constraints, and JSON Schema extras. **`model_config`** adjusts serialization.


```python
            from pydantic import BaseModel, Field


            class Item(BaseModel):
                sku: str = Field(examples=["ABC-123"])
                qty: int = Field(ge=1, le=999)

```

        #### Intermediate

        For polymorphic bodies, explore **`Union`** discriminated by `Literal` type fields.

        #### Expert

        Expert: attach **`examples`** at operation level for richer docs while keeping models clean.

        **Key Points (26.3.2)**

        - Examples improve **developer experience** in Swagger UI.

        **Best Practices (26.3.2)**

        - Align **constraints** with database checks.

        **Common Mistakes (26.3.2)**

        - Over-using **`Any`**—schema becomes useless.



### 26.3.3 Documentation Customization

        #### Beginner

        Customize **`docs_url`**, **`redoc_url`**, **`openapi_url`**. Add **metadata** to tags via `openapi_tags=[...]`.


```python
            from fastapi import FastAPI

            app = FastAPI(
                openapi_tags=[
                    {"name": "items", "description": "Catalog operations"},
                ]
            )

```

        #### Intermediate

        Use **`summary` and `description`** on route decorators for clarity.

        #### Expert

        Expert: protect docs behind **OAuth2** or VPN in production if they expose internals.

        **Key Points (26.3.3)**

        - Good docs reduce **support** load.

        **Best Practices (26.3.3)**

        - Link to **external** guides from tag descriptions.

        **Common Mistakes (26.3.3)**

        - Leaking **internal** admin routes in public OpenAPI.



### 26.3.4 ReDoc Integration

        #### Beginner

        ReDoc renders a **three-panel** reference doc from the same OpenAPI schema. Enable via `redoc_url="/redoc"` (default in dev).


```python
            from fastapi import FastAPI

            app = FastAPI(redoc_url="/redoc", docs_url="/docs")

```

        #### Intermediate

        Style with **`swagger_ui_parameters`** for Swagger; ReDoc theming is more limited but readable.

        #### Expert

        Expert: host **static ReDoc** sites in CI publishing to internal portals.

        **Key Points (26.3.4)**

        - ReDoc excels at **read-only** API browsing.

        **Best Practices (26.3.4)**

        - Offer both **Swagger** (try-it) and **ReDoc** (reading).

        **Common Mistakes (26.3.4)**

        - Disabling both without providing **alternate** developer docs.



### 26.3.5 Custom Documentation UI

        #### Beginner

        You can serve **any static UI** that consumes `openapi.json`—Stoplight Elements, Scalar, etc.


```python
            from fastapi import FastAPI
            from fastapi.staticfiles import StaticFiles

            app = FastAPI()
            app.mount("/static", StaticFiles(directory="static"), name="static")

```

        #### Intermediate

        Mount **`StaticFiles`** for branded portals; inject **`openapi_url`** via template.

        #### Expert

        Expert: version your **docs site** alongside API releases.

        **Key Points (26.3.5)**

        - Custom UIs let **design systems** match company branding.

        **Best Practices (26.3.5)**

        - Cache-bust **`openapi.json`** links after deploy.

        **Common Mistakes (26.3.5)**

        - CORS blocking **`fetch`** to `/openapi.json` from static site.

## 26.4 Rate Limiting and Throttling

Rate limits protect **your service** and **fairness** among tenants. Implement in-app, at **gateway**, or both (**defense in depth**).

### 26.4.1 Simple Rate Limiting

        #### Beginner

        A simple limiter counts events per fixed window per key (IP, API key). Start in middleware or dependency.


```python
            from fastapi import FastAPI, Request
            from starlette.responses import JSONResponse

            app = FastAPI()
            HITS: dict[str, int] = {}


            @app.middleware("http")
            async def limit(request: Request, call_next):
                k = request.client.host if request.client else "x"
                HITS[k] = HITS.get(k, 0) + 1
                if HITS[k] > 100:
                    return JSONResponse({"detail": "rate limited"}, status_code=429)
                return await call_next(request)

```

        #### Intermediate

        Return **429** with **`Retry-After`** when exceeded.

        #### Expert

        Expert: centralize in **Redis** for multi-worker fairness.

        **Key Points (26.4.1)**

        - Even naive limiters beat **no protection** against accidents.

        **Best Practices (26.4.1)**

        - Log **limit breaches** for security monitoring.

        **Common Mistakes (26.4.1)**

        - In-memory limits with **multiple workers**—each has separate counters.



### 26.4.2 User-Based Rate Limiting

        #### Beginner

        After auth, key limits by **`user_id`** or **`org_id`**—fairer than IP for shared NAT.


```python
            from fastapi import Depends, FastAPI

            app = FastAPI()


            def current_user() -> int:
                return 42


            @app.get("/me")
            def me(user_id: int = Depends(current_user)) -> dict:
                return {"user_id": user_id, "quota": "1k/hour"}

```

        #### Intermediate

        Different tiers (**free vs pro**) get different **quotas**.

        #### Expert

        Expert: expose **quota headers** proactively to help SDKs backoff.

        **Key Points (26.4.2)**

        - Authenticate **before** applying user buckets.

        **Best Practices (26.4.2)**

        - Store counters in **Redis** with **TTL** windows.

        **Common Mistakes (26.4.2)**

        - Trusting **`X-User-Id`** from clients without verification.



### 26.4.3 IP-Based Rate Limiting

        #### Beginner

        IP limits mitigate **anonymous abuse** and **DDoS** precursors. Use **`request.client.host`** behind trusted proxy configs.


```python
            from fastapi import Request

            def client_ip(request: Request) -> str:
                return request.client.host if request.client else "0.0.0.0"

```

        #### Intermediate

        Combine with **bot detection** and **captcha** escalation paths for public forms.

        #### Expert

        Expert: handle **IPv6** prefixes and **carrier-grade NAT**—avoid over-punishing shared IPs.

        **Key Points (26.4.3)**

        - IP limits are **coarse** but cheap.

        **Best Practices (26.4.3)**

        - Respect **`X-Forwarded-For`** only from trusted proxies.

        **Common Mistakes (26.4.3)**

        - Blocking **entire** `/24` due to one bad actor—collateral damage.



### 26.4.4 Sliding Window Algorithm

        #### Beginner

        Fixed windows allow **burst at edges**; **sliding** windows smooth enforcement. Log timestamps per key in a deque or Redis sorted set.


```python
            import time
            from collections import deque

            WINDOW = 60.0
            MAX_REQ = 100
            BUCKETS: dict[str, deque[float]] = {}


            def sliding_allow(key: str) -> bool:
                now = time.monotonic()
                q = BUCKETS.setdefault(key, deque())
                while q and now - q[0] > WINDOW:
                    q.popleft()
                if len(q) >= MAX_REQ:
                    return False
                q.append(now)
                return True

```

        #### Intermediate

        Redis **`ZREMRANGEBYSCORE`** + **`ZCARD`** implements sliding windows at scale.

        #### Expert

        Expert: **token bucket** variant allows controlled bursts while capping average rate.

        **Key Points (26.4.4)**

        - Sliding windows reduce **edge double burst**.

        **Best Practices (26.4.4)**

        - Prefer **Redis** for cross-process accuracy.

        **Common Mistakes (26.4.4)**

        - Unbounded **deque** growth if cleanup fails—bound by time window.



### 26.4.5 Rate Limit Headers

        #### Beginner

        Standards: **`X-RateLimit-Limit`**, **`Remaining`**, **`Reset`** (GitHub style) or **IETF draft** `RateLimit-*` headers.


```python
            from fastapi import FastAPI, Request, Response

            app = FastAPI()


            @app.get("/data")
            def data(response: Response) -> dict:
                response.headers["X-RateLimit-Limit"] = "100"
                response.headers["X-RateLimit-Remaining"] = "73"
                response.headers["X-RateLimit-Reset"] = "1710000000"
                return {"ok": True}

```

        #### Intermediate

        Clients use these for **exponential backoff** and **jitter**.

        #### Expert

        Expert: document header semantics in **OpenAPI** `responses` examples.

        **Key Points (26.4.5)**

        - Headers turn limits into **negotiated** contracts.

        **Best Practices (26.4.5)**

        - Keep **clock** sources consistent for `Reset`.

        **Common Mistakes (26.4.5)**

        - Returning **429** without **Retry-After**—clients hammer you.

## 26.5 Logging and Monitoring

Logs tell **stories**; monitoring quantifies **health**. Together they power **incident response** and **capacity planning**.

### 26.5.1 Logging Configuration

        #### Beginner

        Configure **log levels** per environment: DEBUG in dev, INFO in prod. Route logs to **stdout** for container collectors.


```python
            import logging
            import logging.config

            logging.config.dictConfig(
                {
                    "version": 1,
                    "handlers": {"console": {"class": "logging.StreamHandler"}},
                    "root": {"level": "INFO", "handlers": ["console"]},
                }
            )

```

        #### Intermediate

        Use **`logging.config.dictConfig`** for richer setups.

        #### Expert

        Expert: **contextvars** for async-safe request context logging.

        **Key Points (26.5.1)**

        - One logger per **module**: `logging.getLogger(__name__)`.

        **Best Practices (26.5.1)**

        - Avoid **logging secrets** accidentally—redact tokens.

        **Common Mistakes (26.5.1)**

        - Misconfigured **root logger** duplicating messages.



### 26.5.2 Structured Logging

        #### Beginner

        Structured logs (JSON) enable **field queries** (`status=500`, `route=/pay`).


```python
            import json
            import logging

            class JsonFormatter(logging.Formatter):
                def format(self, record: logging.LogRecord) -> str:
                    payload = {"msg": record.getMessage(), "level": record.levelname}
                    return json.dumps(payload)


            h = logging.StreamHandler()
            h.setFormatter(JsonFormatter())
            logging.getLogger().handlers = [h]

```

        #### Intermediate

        Include **`request_id`**, **`trace_id`**, **`user_id`** (hashed) fields.

        #### Expert

        Expert: **OpenTelemetry** log correlation with spans.

        **Key Points (26.5.2)**

        - JSON logs parse reliably in **ELK/Grafana Loki**.

        **Best Practices (26.5.2)**

        - Standardize **field names** across services.

        **Common Mistakes (26.5.2)**

        - Logging **entire** request bodies on every call—PII risk.



### 26.5.3 Log Aggregation

        #### Beginner

        Ship logs to **central** systems: Loki, Elasticsearch, CloudWatch. Use **agents** (Fluent Bit, Vector) rather than app blocking on network sends.


```python
            AGENTS = ["vector", "fluent-bit", "promtail"]
            print(AGENTS)

```

        #### Intermediate

        Sampling **debug** logs in prod keeps costs down.

        #### Expert

        Expert: **per-tenant** log streams for enterprise isolation requirements.

        **Key Points (26.5.3)**

        - Central logs accelerate **postmortems**.

        **Best Practices (26.5.3)**

        - Set **retention** policies per compliance needs.

        **Common Mistakes (26.5.3)**

        - Blocking request path on **sync** remote log shipping.



### 26.5.4 Application Monitoring

        #### Beginner

        Beyond logs, track **metrics** (latency histograms, error counters) and **traces** for distributed calls.


```python
            METRICS = ["http_server_duration", "db_client_duration"]
            print(METRICS)

```

        #### Intermediate

        Instrument DB and HTTP client libraries with **OpenTelemetry** auto-instrumentation where possible.

        #### Expert

        Expert: **SLO dashboards** per critical user journey (checkout, login).

        **Key Points (26.5.4)**

        - RED metrics remain the **default** service dashboard.

        **Best Practices (26.5.4)**

        - Alert on **SLO burn**, not every spike.

        **Common Mistakes (26.5.4)**

        - High-cardinality labels (`user_id`) in metrics backends.



### 26.5.5 Health Checks

        #### Beginner

        Liveness: process up? Readiness: can serve traffic **now** (DB reachable)?


```python
            from fastapi import FastAPI

            app = FastAPI()


            @app.get("/health/live")
            def live() -> dict[str, str]:
                return {"status": "alive"}


            @app.get("/health/ready")
            def ready() -> dict[str, str]:
                return {"db": "reachable"}

```

        #### Intermediate

        Kubernetes calls these probes—keep them **fast** and **side-effect free**.

        #### Expert

        Expert: **deep checks** behind admin-only endpoints separate from cheap readiness.

        **Key Points (26.5.5)**

        - Don't use readiness for **heavy** work—slow rollouts.

        **Best Practices (26.5.5)**

        - Differentiate **optional** vs **critical** dependencies.

        **Common Mistakes (26.5.5)**

        - Readiness probes hitting **external** SaaS every 3s—rate limits you.

## 26.6 API Gateway Integration

Gateways centralize **TLS**, **authn/z**, **rate limits**, **routing**, and **analytics**—freeing services to focus on domain logic.

### 26.6.1 API Gateway Concepts

        #### Beginner

        Gateways sit **in front** of services: they terminate client connections, enforce policies, and route to upstream clusters.


```python
            GATEWAY = ["routing", "auth", "rate_limit", "caching", "analytics"]
            print(GATEWAY)

```

        #### Intermediate

        They can transform payloads, but heavy transformation becomes **brittle**—prefer thin gateways.

        #### Expert

        Expert: **edge auth** vs **service mesh**—different trust boundaries and key rotation stories.

        **Key Points (26.6.1)**

        - Gateways are **policy enforcement points**.

        **Best Practices (26.6.1)**

        - Keep business rules **in services** when possible.

        **Common Mistakes (26.6.1)**

        - Turning gateway into a **second monolith** of orchestration code.



### 26.6.2 Kong Integration

        #### Beginner

        **Kong** (OSS or Enterprise) uses plugins for auth, rate limiting, and transformations. Upstream points to your **Uvicorn** service.


```python
            KONG = '''
            services:
            - name: fastapi-upstream
              url: http://api.internal:8000
              routes:
              - paths: ["/v1"]
            '''
            print(KONG)

```

        #### Intermediate

        Declarative **`kong.yml`** fits GitOps.

        #### Expert

        Expert: isolate **control plane**; monitor **plugin** latency impact.

        **Key Points (26.6.2)**

        - Kong plugins provide **cross-cutting** policies.

        **Best Practices (26.6.2)**

        - Test **WebSockets** through Kong if you use them.

        **Common Mistakes (26.6.2)**

        - Misconfigured **upstream keepalive** causing connection churn.



### 26.6.3 AWS API Gateway

        #### Beginner

        API Gateway offers **HTTP APIs** (cheaper) and **REST APIs** (feature-rich). Integrate with **Lambda** or **VPC Link** to private ALB.


```python
            AWS = {"type": "HTTP_API", "integration": "VPC_LINK_TO_ALB"}
            print(AWS)

```

        #### Intermediate

        Use **IAM**, **Cognito**, or **Lambda authorizers** for auth.

        #### Expert

        Expert: watch **latency** budgets—extra hops add ms; enable **caching** only for safe GETs.

        **Key Points (26.6.3)**

        - Map **stage variables** to FastAPI environments.

        **Best Practices (26.6.3)**

        - Use **WAF** on public APIs.

        **Common Mistakes (26.6.3)**

        - Giant **mapping templates** duplicating validation already in FastAPI.



### 26.6.4 Authentication at Gateway

        #### Beginner

        Gateways often validate **JWT** and pass **`X-User-Id`** downstream. Services must **re-validate** signatures or trust mTLS-enclosed internal networks.


```python
            # Downstream FastAPI trusts gateway-injected header ONLY inside private network
            from fastapi import FastAPI, Header, HTTPException

            app = FastAPI()


            @app.get("/secure")
            def secure(x_user_id: str | None = Header(default=None)) -> dict:
                if not x_user_id:
                    raise HTTPException(status_code=401, detail="missing identity")
                return {"user": x_user_id}

```

        #### Intermediate

        Prefer **short-lived** tokens and **scoped** claims.

        #### Expert

        Expert: **SPIFFE** identities for service-to-service inside mesh.

        **Key Points (26.6.4)**

        - Never trust identity headers from **public** internet without verification.

        **Best Practices (26.6.4)**

        - Rotate **JWT signing keys** with kid headers.

        **Common Mistakes (26.6.4)**

        - Passing **raw JWT** to every microservice—amplifies breach blast radius.



### 26.6.5 Rate Limiting at Gateway

        #### Beginner

        Edge limits protect **origin** from volumetric attacks and enforce **commercial** tiers.


```python
            TIERS = {"free": 60, "pro": 6000}  # requests per minute (illustrative)
            print(TIERS)

```

        #### Intermediate

        Combine with **per-service** limits to prevent one noisy neighbor from starving DB pool.

        #### Expert

        Expert: **global** vs **regional** counters; **burst** allowances per plan.

        **Key Points (26.6.5)**

        - Edge limits reduce **cost** of malicious traffic hitting Python.

        **Best Practices (26.6.5)**

        - Return consistent **429** bodies for SDK parsing.

        **Common Mistakes (26.6.5)**

        - Only gateway limits with **no** per-tenant DB protection—still vulnerable to expensive queries.

## 26.7 GraphQL Integration

**GraphQL** lets clients select fields and nest related data in one round trip—powerful but introduces **N+1**, **complexity**, and **caching** challenges.

### 26.7.1 GraphQL Basics

        #### Beginner

        A **schema** defines types, **queries** read, **mutations** write. Clients POST a **query string** + variables.


```python
            GQL = '''
            query User($id: ID!) {
              user(id: $id) { id name posts { title } }
            }
            '''
            print(GQL)

```

        #### Intermediate

        Unlike REST resource URLs, GraphQL often uses **single `/graphql`** endpoint.

        #### Expert

        Expert: enforce **query depth/complexity** limits and **persisted queries** for public APIs.

        **Key Points (26.7.1)**

        - GraphQL trades **multiple REST calls** for **server complexity**.

        **Best Practices (26.7.1)**

        - Introspection may be **disabled** in production for sensitive APIs.

        **Common Mistakes (26.7.1)**

        - Unbounded queries **DoS** your server—always limit.



### 26.7.2 Graphene with FastAPI

        #### Beginner

        **Graphene** is a popular Python GraphQL library. Mount schema via a **Starlette GraphQL route** or ASGI app wrapper.


```python
            # Illustrative: install graphene, starlette-graphene or similar
            SCHEMA_NOTE = "Define graphene.ObjectType classes and graphene.Schema(query=Query)"
            print(SCHEMA_NOTE)

```

        #### Intermediate

        You may run GraphQL alongside REST routers in one FastAPI app.

        #### Expert

        Expert: use **DataLoader** pattern to batch DB fetches and kill N+1.

        **Key Points (26.7.2)**

        - Share **DB session** dependency between REST and GraphQL contexts.

        **Best Practices (26.7.2)**

        - Keep **auth** consistent across both interfaces.

        **Common Mistakes (26.7.2)**

        - Mixing **sync ORM** resolvers in async servers without offload—blocks loop.



### 26.7.3 Query Resolution

        #### Beginner

        Resolvers are functions fetching each field. Default resolvers map attribute access.


```python
            # Pseudo-resolver pattern
            def resolve_user_posts(user, info):
                return fetch_posts_for_user(user.id)

```

        #### Intermediate

        Use **batching** (`DataLoader`) when many child fields repeat fetches.

        #### Expert

        Expert: **tracing** per resolver to find hotspots.

        **Key Points (26.7.3)**

        - Resolver granularity drives **performance**.

        **Best Practices (26.7.3)**

        - Cache **entity** loads inside request scope.

        **Common Mistakes (26.7.3)**

        - Implicit **N+1** on `user.posts` lists.



### 26.7.4 Mutation Handling

        #### Beginner

        Mutations should be **idempotent** where possible (use client **mutation IDs**). Validate with **input types**.


```python
            MUTATION = '''
            mutation CreateItem($input: ItemInput!) {
              createItem(input: $input) { item { id } errors { code } }
            }
            '''
            print(MUTATION)

```

        #### Intermediate

        Return **payload + errors** arrays following GraphQL conventions.

        #### Expert

        Expert: wrap mutations in **transactions**; map domain errors to **GraphQL errors** with extensions.

        **Key Points (26.7.4)**

        - Side effects belong in **service layer**, not resolver spaghetti.

        **Best Practices (26.7.4)**

        - Audit **mutations** with user id + request id.

        **Common Mistakes (26.7.4)**

        - Returning **stack traces** to clients in errors.



### 26.7.5 Subscription Support

        #### Beginner

        Subscriptions stream events—often via **WebSockets** and **graphql-ws** protocol.


```python
            SUB = "Use WebSocket endpoint + graphql-ws subprotocol; bridge to asyncio queues"
            print(SUB)

```

        #### Intermediate

        FastAPI **WebSockets** integrate with subscription servers; scale with **Redis pub/sub** or **Kafka** fanout.

        #### Expert

        Expert: enforce **auth** at connection initiation; limit **concurrent** subscriptions per user.

        **Key Points (26.7.5)**

        - Subscriptions need **lifecycle** management—cancel on disconnect.

        **Best Practices (26.7.5)**

        - Backpressure: drop or sample events under load.

        **Common Mistakes (26.7.5)**

        - Broadcasting **private** events without per-connection filtering—data leaks.

## 26.8 Best Practices

Standards turn solo scripts into **maintainable** products: predictable structure, errors, security, docs, and tests.

### 26.8.1 Code Organization

        #### Beginner

        Keep **dependencies** explicit; avoid **global state**. Colocate tests near packages or under **`tests/`** mirroring structure.


```python
            TREE = ["src layout optional", "tests mirror app", "Makefile or task runner"]
            print(TREE)

```

        #### Intermediate

        Use **`ruff` + `mypy`** in CI for consistency.

        #### Expert

        Expert: **CODEOWNERS** per domain directory for review routing.

        **Key Points (26.8.1)**

        - Readable structure beats **clever** one-liners.

        **Best Practices (26.8.1)**

        - Automate **format + lint** on every PR.

        **Common Mistakes (26.8.1)**

        - Hiding **business rules** in middleware only—hard to test.



### 26.8.2 Error Handling Strategy

        #### Beginner

        Use **`HTTPException`** for expected client errors; **global exception handlers** for unexpected ones returning safe messages.


```python
            from fastapi import FastAPI, Request
            from fastapi.responses import JSONResponse

            app = FastAPI()


            @app.exception_handler(Exception)
            async def fallback(request: Request, exc: Exception) -> JSONResponse:
                return JSONResponse({"title": "Server Error", "status": 500}, status_code=500)

```

        #### Intermediate

        Log server errors with **trace ids**; map validation errors to **422** with structured bodies.

        #### Expert

        Expert: **problem+json** (`RFC 7807`) for consistent machine-readable errors.

        **Key Points (26.8.2)**

        - Never leak **internal** exception strings to clients in prod.

        **Best Practices (26.8.2)**

        - Differentiate **retryable** vs **permanent** errors in payloads.

        **Common Mistakes (26.8.2)**

        - Catching **`Exception`** too broadly without logging **exc_info**.



### 26.8.3 Security Best Practices

        #### Beginner

        Validate inputs, use **parameterized queries**, hash passwords with **Argon2/bcrypt**, enforce **HTTPS**, configure **CORS** tightly.


```python
            HEADERS = {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
            }
            print(HEADERS)

```

        #### Intermediate

        Apply **least privilege** IAM and **rotate** secrets.

        #### Expert

        Expert: **threat modeling** (STRIDE) per major endpoint; regular **pentests**.

        **Key Points (26.8.3)**

        - Security is **defaults + reviews + monitoring**.

        **Best Practices (26.8.3)**

        - Use **dependency overrides** in tests, not weaker prod code paths.

        **Common Mistakes (26.8.3)**

        - Disabling **CSRF** protections when using cookie sessions with cross-site risk.



### 26.8.4 Documentation Standards

        #### Beginner

        Every route needs **`summary`**, stable **`tags`**, and **examples** for non-trivial bodies.


```python
            DOC_CHECKLIST = ["examples", "error shapes", "auth section", "rate limits", "pagination"]
            print(DOC_CHECKLIST)

```

        #### Intermediate

        Publish **changelog** alongside OpenAPI diff.

        #### Expert

        Expert: **consumer-driven contract tests** for partner APIs.

        **Key Points (26.8.4)**

        - Docs are part of the **product**.

        **Best Practices (26.8.4)**

        - Link **runbooks** from incident-prone endpoints' descriptions.

        **Common Mistakes (26.8.4)**

        - Undocumented **query params** clients depend on.



### 26.8.5 Testing Standards

        #### Beginner

        Test pyramid: lots of **unit**, fewer **integration**, occasional **e2e**. Use **`TestClient`** or **`httpx.AsyncClient`** with **`ASGITransport`**.


```python
            from fastapi import FastAPI
            from fastapi.testclient import TestClient

            app = FastAPI()


            @app.get("/ping")
            def ping() -> str:
                return "pong"


            def test_ping():
                c = TestClient(app)
                assert c.get("/ping").json() == "pong"

```

        #### Intermediate

        Cover **auth failures**, **validation errors**, and **happy paths**.

        #### Expert

        Expert: **property-based** tests for parsers; **load smoke** in staging CI.

        **Key Points (26.8.5)**

        - Tests should be **fast** enough to run on every commit.

        **Best Practices (26.8.5)**

        - Seed **deterministic** data for integration tests.

        **Common Mistakes (26.8.5)**

        - Only **mocking** without any real DB integration coverage.

---

## Appendix: Release Readiness Checklist (FastAPI Services)

Use this checklist before declaring an API **production-ready**. It complements the subtopics above and is meant to be copied into your team wiki or pull request template.

### Structure and configuration

- [ ] Routers grouped by **domain** with clear `tags` for OpenAPI.
- [ ] `Settings` validated at startup; no silent insecure defaults.
- [ ] `lifespan` manages shared clients (HTTP, DB) with clean shutdown.
- [ ] Migrations automated in CI/CD with **backward-compatible** phases when needed.

### API contract and documentation

- [ ] `openapi.json` exported per build; breaking changes caught by diff or contract tests.
- [ ] Examples provided for non-trivial request bodies and error responses.
- [ ] Versioning policy documented (URL, header, or query) including deprecation timeline.
- [ ] Authentication and required scopes documented per route.

### Reliability and performance

- [ ] Timeouts on all external I/O; connection pooling for DB and HTTP.
- [ ] Pagination or streaming for large collections; payload size limits enforced.
- [ ] Rate limits defined per tenant tier; gateway limits aligned with app limits.
- [ ] Load tests exercised against staging with realistic data volumes.

### Security and privacy

- [ ] TLS terminated correctly; HSTS and security headers configured at the edge.
- [ ] CORS policy matches actual browser clients; no wildcard credentials.
- [ ] Secrets sourced from a vault or managed store—not git or Docker layers.
- [ ] Logs and traces scrubbed of secrets and sensitive PII by default.

### Observability and operations

- [ ] Structured JSON logs with **request_id** / **trace_id** correlation fields.
- [ ] RED metrics and useful **dashboards**; alerts tied to SLO burn rates.
- [ ] `/health/live` vs `/health/ready` behave correctly under dependency failure.
- [ ] Runbooks exist for top failure modes (DB down, dependency timeout spikes).

### Testing and change management

- [ ] Unit + integration tests in CI; critical paths covered for auth and billing if applicable.
- [ ] Staging environment refreshed regularly; feature flags decouple deploy from release.
- [ ] Rollback path validated (previous image digest or migration down strategy).

### GraphQL-specific (if applicable)

- [ ] Query **depth/complexity** limits enforced; expensive fields guarded.
- [ ] DataLoader or equivalent batching verified under integration tests.
- [ ] Subscriptions authenticated at connection time; private events filtered per session.
- [ ] Introspection policy matches security requirements for each environment.

### Gateway and multi-service (if applicable)

- [ ] Identity propagation documented between gateway and services (JWT, mTLS, or signed headers).
- [ ] Idempotency keys or deduplication considered for write paths behind retries.
- [ ] Per-route **timeouts** at gateway align with upstream FastAPI/Uvicorn timeouts.



        ---

        ## Chapter Key Points, Best Practices, and Common Mistakes (26)

        ### Key Points

        - Structure + **routers** keep FastAPI codebases navigable at scale.
- Versioning and **OpenAPI** discipline protect clients and enable automation.
- Rate limits belong **in-app** and often **at the gateway**.
- Logging/monitoring should be **structured** and **SLO-aware**.
- GraphQL is optional power—plan for **complexity** and **N+1**.
- Best practices encode **security**, **docs**, and **tests** as habits.

        ### Best Practices

        - Use **`APIRouter`** domains, settings classes, and app factories.
- Publish **`openapi.json`** artifacts in CI with diffs.
- Centralize **auth** and **rate limit** policies with clear headers.
- Add **health** endpoints and **RED** metrics early.
- Enforce **lint/typecheck/tests** in CI for every PR.

        ### Common Mistakes

        - Mystery **500s** without logging context.
- Public **GraphQL** without limits.
- Trusting **gateway headers** on untrusted edges.
- Skipping **integration tests** for database migrations.
- Treating **docs** as an afterthought—integration pain follows.

