# Introduction to FastAPI

## 📑 Table of Contents

- [1.1 What is FastAPI?](#11-what-is-fastapi)
  - [1.1.1 FastAPI Overview](#111-fastapi-overview)
  - [1.1.2 FastAPI Philosophy](#112-fastapi-philosophy)
  - [1.1.3 Why FastAPI?](#113-why-fastapi)
  - [1.1.4 FastAPI vs Flask](#114-fastapi-vs-flask)
  - [1.1.5 FastAPI vs Django](#115-fastapi-vs-django)
  - [1.1.6 FastAPI Use Cases](#116-fastapi-use-cases)
- [1.2 Key Features](#12-key-features)
  - [1.2.1 High Performance](#121-high-performance)
  - [1.2.2 Async Support](#122-async-support)
  - [1.2.3 Automatic API Documentation](#123-automatic-api-documentation)
  - [1.2.4 Type Hints](#124-type-hints)
  - [1.2.5 Built-in Validation](#125-built-in-validation)
  - [1.2.6 Security Features](#126-security-features)
- [1.3 FastAPI Ecosystem](#13-fastapi-ecosystem)
  - [1.3.1 Starlette Framework](#131-starlette-framework)
  - [1.3.2 Pydantic Models](#132-pydantic-models)
  - [1.3.3 Uvicorn Server](#133-uvicorn-server)
  - [1.3.4 OpenAPI and Swagger](#134-openapi-and-swagger)
  - [1.3.5 Related Libraries](#135-related-libraries)
- [1.4 Getting Started](#14-getting-started)
  - [1.4.1 FastAPI Roadmap](#141-fastapi-roadmap)
  - [1.4.2 Python Version Requirements](#142-python-version-requirements)
  - [1.4.3 Virtual Environments](#143-virtual-environments)
  - [1.4.4 Installation Methods](#144-installation-methods)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)
- [Appendix: Integrated Lab Examples](#appendix-integrated-lab-examples)

---

## 1.1 What is FastAPI?

### 1.1.1 FastAPI Overview

#### Beginner

FastAPI is a **modern Python web framework** for building **HTTP APIs**—systems that expose data and operations over the network using URLs, HTTP methods (GET, POST, and so on), and structured payloads such as JSON. You write ordinary Python functions; FastAPI connects them to the web server so clients (browsers, mobile apps, partner systems, or internal microservices) can call your code in a standardized way.

The name **FastAPI** signals two goals: **fast to run** (leveraging high-performance foundations) and **fast to build with** (thanks to automatic validation and documentation). Unlike a traditional website framework that focuses on HTML pages, FastAPI is **API-first**: responses are often JSON, though you can still return HTML or files when needed through Starlette’s response types.

#### Intermediate

Architecturally, FastAPI is an **ASGI application** built on **Starlette** for routing, middleware, requests, responses, and background tasks, combined with **Pydantic** for parsing and validating data at the trust boundary between the network and your Python types. When a request arrives, FastAPI uses your **function signature**—parameter names, types, and defaults—to decide how to read **path parameters**, **query parameters**, **headers**, **cookies**, and **request bodies**, and how to serialize **responses**.

This design means your **type annotations are executable documentation**: they influence runtime behavior, not merely static analysis. The same information also drives **OpenAPI** schema generation, which powers **Swagger UI** and **ReDoc** without maintaining a parallel specification by hand.

#### Expert

Implementation-wise, FastAPI inspects endpoint callables with the `inspect` module and resolves type hints (including `from __future__ import annotations` forward references) to construct internal models for each **path operation**. Validation is delegated to **Pydantic v2**, whose core is implemented in Rust (`pydantic-core`) for speed. The framework composes Starlette’s `Router`, exception handlers, and middleware stack while adding opinionated ergonomics: `Depends` for dependency injection, `APIRouter` for modularization, and integrated OpenAPI metadata.

Understanding the **ASGI callable** contract matters for advanced customization: an ASGI app is an async callable `(scope, receive, send) -> None` handling events; HTTP and WebSocket differ by `scope["type"]`. FastAPI’s `FastAPI` class implements this contract by delegating to Starlette.

```python
# overview_min.py — minimal ASGI app surface
from fastapi import FastAPI

app = FastAPI(title="Overview Demo", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    """Simple JSON response; FastAPI serializes dict -> JSON."""
    return {"status": "ok", "service": "demo"}


# The `app` object is callable as ASGI. Uvicorn imports `app` and drives the event loop.
```

**Key Points (1.1.1)**

- FastAPI targets **JSON APIs** and **machine clients** first; HTML rendering is optional.
- It is **ASGI-native**, not WSGI-first.
- **Types** at the boundary drive validation, serialization, and OpenAPI.

**Best Practices (1.1.1)**

- Set explicit `title`, `version`, and (when public) `description` on `FastAPI(...)`.
- Keep **one obvious module** exporting `app` for deployment (`main:app`).

**Common Mistakes (1.1.1)**

- Treating FastAPI as a drop-in replacement for **Django templates** without adding a template stack.
- Assuming **all** Python web knowledge transfers from WSGI-only frameworks unchanged.

---

### 1.1.2 FastAPI Philosophy

#### Beginner

FastAPI favors **explicit contracts**: you declare what inputs and outputs look like using Python types. The framework should **fail fast** on bad input with clear errors (typically HTTP **422**) rather than letting malformed data reach deep business logic. Documentation should be a **by-product of coding**, not a separate artifact that drifts out of date.

#### Intermediate

The philosophy aligns with **standards**: **OpenAPI 3**, **JSON Schema**, and common **OAuth2** patterns are first-class. The learning curve is **progressive**: a two-line app works; larger apps add routers, dependencies, middleware, and lifecycle hooks without a mandatory “mega tutorial project.” The framework prefers **composition** (`APIRouter`, `Depends`) over deep class inheritance trees.

#### Expert

In practice, FastAPI encourages a **functional core, imperative shell** style: pure validation and transformation at the edges (Pydantic models), while side effects (database IO, messaging, external HTTP) live in **dependencies** or explicitly structured service layers. This separation improves **testability** and makes **async** migration paths clearer, because dependencies can be async callables resolved per-request.

```python
# philosophy_deps.py — explicit shell vs handler body
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def get_trace_id() -> str:
    # In real apps, read from headers or generate; keep side effects localized
    return "trace-static-demo"


@app.get("/echo")
def echo(
    msg: str,
    trace_id: Annotated[str, Depends(get_trace_id)],
) -> dict[str, str]:
    # Handler focuses on composing validated inputs + injected context
    return {"msg": msg, "trace_id": trace_id}
```

**Key Points (1.1.2)**

- **Explicit types** are the API contract, not optional hints.
- **Dependencies** express cross-cutting context (auth, DB sessions, settings).

**Best Practices (1.1.2)**

- Prefer **small dependency functions** over hidden global singletons.

**Common Mistakes (1.1.2)**

- Performing **expensive work** inside dependencies on every request without caching strategy.

---

### 1.1.3 Why FastAPI?

#### Beginner

Teams adopt FastAPI when they want **quick iteration** on APIs, **automatic interactive docs** for partners and frontend developers, and **modern Python** features like `async`/`await`. For many I/O-heavy services (calling other APIs, databases with async drivers), the stack feels responsive and ergonomic.

#### Intermediate

Compared to rolling your own validation in lighter frameworks, FastAPI reduces boilerplate: fewer manual `if not isinstance(...)` checks, consistent **422** error shapes, and **OpenAPI** for codegen. The ecosystem around **Pydantic** and **Starlette** is stable and widely understood, which helps hiring and maintenance.

#### Expert

The decision should still be **evidence-based**: benchmark your realistic workload (payload sizes, auth, ORM patterns). FastAPI does not remove Python’s **GIL** constraints for CPU-bound work; it improves **concurrency** for non-blocking IO when you use async libraries correctly. For **ML inference** that saturates CPU, you may still need process pools, dedicated workers, or external model servers.

```python
# why_async_io.py — where async shines (I/O wait)
import asyncio

from fastapi import FastAPI

app = FastAPI()


@app.get("/fan-out")
async def fan_out() -> dict[str, int]:
    async def ping() -> int:
        await asyncio.sleep(0.05)  # stand-in for async HTTP/DB
        return 1

    # Concurrent waits — good async usage
    results = await asyncio.gather(ping(), ping(), ping())
    return {"count": sum(results)}
```

**Key Points (1.1.3)**

- **Docs + validation + types** accelerate API product development.
- **Async** helps when the **runtime waits** on I/O, not CPU.

**Best Practices (1.1.3)**

- Measure **p95/p99 latency** and throughput, not hello-world benchmarks alone.

**Common Mistakes (1.1.3)**

- Declaring `async def` while calling **blocking** database drivers at scale.

---

### 1.1.4 FastAPI vs Flask

#### Beginner

**Flask** is a minimalist **WSGI** framework: you choose extensions for forms, ORMs, and validation. **FastAPI** is **ASGI-first** with **built-in** validation and OpenAPI generation via Pydantic integration. Flask remains excellent for small apps and simple APIs; FastAPI often wins when **typed contracts** and **async** matter.

#### Intermediate

Flask 2+ can run `async` views, but deployment and middleware ecosystems are still **WSGI-oriented** in many teams’ minds (`gunicorn` sync workers). FastAPI’s request/response modeling maps naturally to **Pydantic models** and **Annotated** constraints. Blueprints correspond loosely to FastAPI’s **`APIRouter`**.

#### Expert

Migrating a Flask API often entails: replacing `request.args`/`request.json` with typed parameters; moving before-request hooks to **middleware** or **dependencies**; swapping **Jinja**-only patterns for explicit template responses if you still render HTML; and changing deployment to **Uvicorn** (or Gunicorn + Uvicorn workers). Error handling moves from `@app.errorhandler` to Starlette/FastAPI exception handlers with different signatures.

```python
# flask_vs_fastapi_path_param.py — conceptual comparison as comments + FastAPI side

from fastapi import FastAPI

app = FastAPI()

# Flask style (WSGI):
# @app.route("/user/<int:user_id>")
# def user(user_id):
#     return jsonify(id=user_id)

@app.get("/user/{user_id}")
def user(user_id: int) -> dict[str, int]:
    return {"id": user_id}
```

**Key Points (1.1.4)**

- **WSGI vs ASGI** changes how concurrency and middleware work.
- FastAPI **enforces** parsing/validation at the edge by default.

**Best Practices (1.1.4)**

- When evaluating performance, compare **comparable servers** and workloads.

**Common Mistakes (1.1.4)**

- Expecting **Flask extensions** to work unchanged in FastAPI/ASGI.

---

### 1.1.5 FastAPI vs Django

#### Beginner

**Django** is **batteries-included**: ORM, admin, auth, migrations, template language, and a long history of plugins. **FastAPI** focuses on the **API layer**; you bring your own persistence, admin, and often your own auth integration. Django is strong for **content-heavy** sites; FastAPI is strong for **service-oriented** HTTP APIs.

#### Intermediate

**Django REST Framework (DRF)** adds serialization and browsable APIs. FastAPI’s **Pydantic models** and automatic docs overlap much of DRF’s value for JSON APIs. Django’s async path is evolving across ORM and views; FastAPI started from an **async-friendly** ASGI stack, though sync endpoints remain fully supported.

#### Expert

Hybrid architectures are common: Django for **internal admin** and **FastAPI** for **public microservice** APIs, routed by a reverse proxy. Sharing a database requires discipline around **migrations** and **transaction boundaries**. Do not duplicate business rules inconsistently across both stacks.

```python
# django_contrast_demo.py — FastAPI side only (no Django import required)
from pydantic import BaseModel
from fastapi import FastAPI

app = FastAPI()


class Article(BaseModel):
    slug: str
    title: str


@app.get("/articles/{slug}", response_model=Article)
def get_article(slug: str) -> Article:
    # Django might use get_object_or_404(Article, slug=slug)
    return Article(slug=slug, title="Example")
```

**Key Points (1.1.5)**

- Django ≈ **framework + ORM + admin**; FastAPI ≈ **HTTP API toolkit + your choices**.

**Best Practices (1.1.5)**

- Draw a **bounded context** if using both frameworks in one organization.

**Common Mistakes (1.1.5)**

- Expecting **Django admin**-level features without building or integrating them.

---

### 1.1.6 FastAPI Use Cases

#### Beginner

Typical FastAPI use cases include **mobile app backends**, **partner integration APIs**, **webhooks** (Stripe, GitHub, payment providers), **internal tools**, **prototypes**, and **machine learning model serving** behind a stable HTTP interface.

#### Intermediate

Architecture patterns: **BFF** aggregating multiple downstream services; **API gateway** features (auth, rate limits) in front of legacy systems; **OAuth2 resource servers**; **WebSocket** services (via Starlette); **SSE** streams for progressive updates.

#### Expert

Operational patterns: **Kubernetes liveness/readiness** probes as tiny endpoints; **OpenAPI-driven** client generation for web and mobile; **schema regression tests** in CI comparing `/openapi.json` between commits; **multi-tenant** routing with middleware setting request state consumed by dependencies.

```python
# use_case_webhook.py — async acceptance pattern (validate stricter in production)
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


@app.post("/hooks/incoming", status_code=202)
async def incoming_hook(event: dict) -> JSONResponse:
    # Production: use a Pydantic model + signature verification + idempotency keys
    return JSONResponse({"accepted": True, "event_id": event.get("id")}, status_code=202)
```

### Key Points (Section 1.1)

- FastAPI is purpose-built for **typed, documented HTTP APIs** on **ASGI**.
- It complements or competes with **Flask API** and **DRF** depending on constraints.
- **Use cases** span public APIs, internal services, webhooks, and real-time features.

### Best Practices (Section 1.1)

- Choose FastAPI when **OpenAPI**, **async IO**, and **validation** are central requirements.
- Keep **business rules** independent of framework imports where practical.

### Common Mistakes (Section 1.1)

- Using `async def` with **blocking** libraries under load.
- Underestimating **operational** needs (auth, logging, tracing) because demos look small.

---

## 1.2 Key Features

### 1.2.1 High Performance

#### Beginner

FastAPI’s speed comes from **fast foundations**: Starlette for HTTP, Pydantic v2’s Rust core for validation, and efficient JSON serialization options. Your **application code**—database queries, remote calls, algorithms—usually dominates latency, not the framework overhead.

#### Intermediate

Tune **serialization** (`ORJSONResponse`), **worker count**, **keep-alive**, and **connection pooling**. For sync endpoints, Starlette runs the callable in a **threadpool** to avoid blocking other requests on the same worker’s event loop—this has a cost; async endpoints avoid thread overhead when all IO is truly non-blocking.

#### Expert

Read benchmarks critically: compare **JSON payload sizes**, **validation depth**, **middleware chains**, and **server** (Uvicorn vs Gunicorn workers). Profile with **OpenTelemetry** or **py-spy** when optimizing. Consider **HTTP/2** termination at the proxy and **caching** headers for read-heavy APIs.

```python
# performance_orjson.py — optional faster JSON responses
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

app = FastAPI(default_response_class=ORJSONResponse)


@app.get("/bulk")
def bulk() -> list[dict[str, int]]:
    return [{"i": i} for i in range(200)]
```

**Key Points (1.2.1)**

- Framework speed matters; **your IO and DB** matter more at scale.
- **`ORJSONResponse`** can materially help large JSON payloads.

**Best Practices (1.2.1)**

- Load test with **realistic** authentication and payload shapes.

**Common Mistakes (1.2.1)**

- Declaring performance wins while doing **N+1 queries** or synchronous external calls in `async` routes.

---

### 1.2.2 Async Support

#### Beginner

Use **`async def`** when your route **awaits** non-blocking operations (`httpx.AsyncClient`, `asyncpg`, `asyncio.sleep`). Use plain **`def`** for CPU-heavy code or **legacy blocking** libraries; Starlette will run sync routes in a threadpool.

#### Intermediate

The event loop is **cooperative**: one blocking call in an `async def` handler can delay **all** tasks scheduled on that loop for that worker. This is why `time.sleep` inside `async def` is an anti-pattern, while `await asyncio.sleep` is fine.

#### Expert

Advanced patterns: **anyio** task groups, cancellation semantics on client disconnect, **streaming** responses with async iterators, and careful **connection lifecycle** for async clients (prefer app-scoped clients with lifespan context).

```python
# async_discipline.py
import asyncio
import time

from fastapi import FastAPI

app = FastAPI()


@app.get("/good")
async def good() -> dict[str, str]:
    await asyncio.sleep(0.1)
    return {"ok": "non-blocking wait"}


@app.get("/sync-ok")
def sync_ok() -> dict[str, str]:
    # Blocking here uses a worker thread from the threadpool — not ideal at huge scale
    time.sleep(0.1)
    return {"ok": "sync with threadpool"}
```

**Key Points (1.2.2)**

- **`async` + blocking IO** = scalability hazard.
- **Sync routes** are valid; async is not mandatory everywhere.

**Best Practices (1.2.2)**

- Centralize **async HTTP clients** and reuse connections.

**Common Mistakes (1.2.2)**

- Calling **ORM** methods that block sockets inside `async def` without shimming.

---

### 1.2.3 Automatic API Documentation

#### Beginner

Run the app and open **`/docs`** for **Swagger UI** or **`/redoc`** for **ReDoc**. These pages list operations, show schemas, and let you **try requests** interactively. They update as you edit code—no separate Word document to maintain.

#### Intermediate

The machine-readable spec is at **`/openapi.json`**. You can import it into **Postman**, generate **TypeScript** clients with **openapi-generator**, or diff schemas in CI to catch breaking changes.

#### Expert

Customize with `summary`, `description`, `responses`, `tags`, `deprecated=True`, and `openapi_examples`. You can disable docs in production with `docs_url=None` if your threat model requires it (often replaced by authenticated doc portals).

```python
# docs_rich_operation.py
from fastapi import FastAPI

app = FastAPI()


@app.get(
    "/items/",
    summary="List items",
    description="Returns a static demo list; replace with DB query.",
    response_description="Array of item names",
    tags=["catalog"],
    deprecated=False,
)
def list_items() -> list[str]:
    return ["alpha", "beta"]
```

**Key Points (1.2.3)**

- Docs are **derived** from types and decorators—keep them accurate by keeping types accurate.

**Best Practices (1.2.3)**

- Use **tags** to group domains (`users`, `billing`, `admin`).

**Common Mistakes (1.2.3)**

- Leaving **public `/docs`** exposed without auth on internet-facing services.

---

### 1.2.4 Type Hints

#### Beginner

Annotations tell FastAPI **what** you expect: `int` path parameters convert from strings, optional query parameters use `str | None`, lists use `list[str]`. Return annotations guide **response serialization** and OpenAPI **response schemas** when combined with `response_model`.

#### Intermediate

Use **`Annotated`** with `Query`, `Path`, `Body`, `Header` for extra constraints (min/max length, regex, examples). Use **`Literal`** for enums-like strings, and **union types** for polymorphic inputs where appropriate.

#### Expert

Leverage **custom types**, **Pydantic** validators, and **generics** for reusable patterns. Enable **Pyright/mypy** in CI to catch inconsistencies static analysis can see; remember runtime validation still happens via Pydantic for request/response boundaries.

```python
# type_hints_query_path.py
from typing import Annotated

from fastapi import FastAPI, Path, Query

app = FastAPI()


@app.get("/search/{tenant}")
def search(
    tenant: Annotated[str, Path(min_length=2, max_length=32)],
    q: Annotated[str, Query(min_length=1)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, str | int]:
    return {"tenant": tenant, "q": q, "limit": limit}
```

**Key Points (1.2.4)**

- **Path vs query** inference follows “declared in path template vs not.”
- **`Annotated` metadata** refines validation beyond raw types.

**Best Practices (1.2.4)**

- Prefer **Python 3.10+** built-in generics (`list[str]`) for readability.

**Common Mistakes (1.2.4)**

- Using **mutable default arguments** in Python signatures (`def f(items=[]):`).

---

### 1.2.5 Built-in Validation

#### Beginner

If a client sends invalid JSON shapes, wrong types, or out-of-range numbers, FastAPI responds with **422 Unprocessable Entity** and a structured error payload. Your route function **does not run** on validation failure, which prevents garbage from reaching core logic.

#### Intermediate

Pydantic performs **coercion** where configured (for example, reasonable string-to-number parsing), applies **field constraints** (`gt`, `max_length`), and validates **nested models**. You can separate **input models** from **persistence models** to avoid over-exposing internal fields.

#### Expert

Use **`model_validator`**, **`field_validator`**, custom types, and **partial updates** (`exclude_unset=True`) for PATCH-style endpoints. Consider **API versioning** when evolving schemas to avoid breaking existing clients.

```python
# validation_models.py
from pydantic import BaseModel, Field
from fastapi import FastAPI

app = FastAPI()


class ItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    price: float = Field(gt=0)


@app.post("/items", status_code=201)
def create_item(payload: ItemIn) -> ItemIn:
    return payload
```

**Key Points (1.2.5)**

- **422** means “client sent data that does not match the contract.”
- Use **distinct models** for create/read/update when fields differ.

**Best Practices (1.2.5)**

- Return **helpful** but **safe** error messages (avoid leaking stack traces).

**Common Mistakes (1.2.5)**

- Using untyped **`dict`** bodies for everything in public APIs.

---

### 1.2.6 Security Features

#### Beginner

FastAPI provides **building blocks**: OAuth2 password flow helpers, **HTTP Bearer** token schemes, **API key** query/header schemes, **HTTP Basic**, **CORS** middleware, and **TrustedHost** middleware patterns via Starlette. You still must manage **secrets**, **HTTPS**, **token validation**, and **authorization rules**.

#### Intermediate

Combine **`Depends`** with security schemes to inject **current user** or **scopes**. Use **environment variables** or a secret manager for signing keys. Terminate TLS at a reverse proxy and forward **proto** headers carefully (`--proxy-headers` in Uvicorn).

#### Expert

Integrate **OIDC**, **JWT** validation with **JWKS** rotation, **mTLS**, **rate limiting** (middleware or API gateway), **CSRF** strategies for cookie sessions, and **OWASP**-aligned security headers. Audit **dependency override** patterns in tests to ensure you do not accidentally disable auth in production.

```python
# security_bearer_sketch.py — educational only; do not use hard-coded secrets
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()


def require_token(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    if creds.credentials != "demo-token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return creds.credentials


@app.get("/secure/me")
def me(_: str = Depends(require_token)) -> dict[str, str]:
    return {"user": "authenticated-demo"}
```

### Key Points (Section 1.2)

- Features **compose**: performance, async, docs, types, validation, security.
- Security helpers are **not** a complete identity platform—plan integrations.

### Best Practices (Section 1.2)

- Apply **CORS** narrowly; allow origins explicitly in production.
- Log **auth failures** with care (avoid logging raw tokens).

### Common Mistakes (Section 1.2)

- Copy-pasting **tutorial OAuth2** into production without hardening.
- Exposing **detailed validation errors** that leak internal field names in sensitive APIs.

---

## 1.3 FastAPI Ecosystem

### 1.3.1 Starlette Framework

#### Beginner

**Starlette** is a lightweight **ASGI** toolkit. FastAPI uses Starlette for **routing**, **requests and responses**, **middleware**, **WebSockets**, **background tasks**, and **lifespan** events. When you read FastAPI docs and see `Request`, `Response`, or middleware examples, you are often using Starlette primitives.

#### Intermediate

Anything Starlette can do, FastAPI generally allows: mount **static files**, add **custom middleware**, implement **pure ASGI** middleware, or access the **raw scope**. FastAPI adds Pydantic integration and OpenAPI generation on top of this foundation.

#### Expert

For advanced cases, study Starlette’s **middleware stack ordering** (last added runs first on ingress), **exception handlers**, and **routing precedence**. Custom **ASGI middleware** can inspect or transform `scope`, `receive`, and `send` streams—powerful but easy to get wrong regarding streaming bodies and disconnects.

```python
# starlette_middleware.py
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from fastapi import FastAPI

app = FastAPI()


class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Under-The-Hood"] = "Starlette"
        return response


app.add_middleware(TimingMiddleware)


@app.get("/ping")
def ping() -> dict[str, str]:
    return {"pong": "yes"}
```

**Key Points (1.3.1)**

- Learning **Starlette** deepens your FastAPI debugging skills.

**Best Practices (1.3.1)**

- Prefer **FastAPI** APIs when available; drop to Starlette for edge cases.

**Common Mistakes (1.3.1)**

- Misordering **middleware** and wondering why CORS or auth headers fail.

---

### 1.3.2 Pydantic Models

#### Beginner

**Pydantic** models are Python classes inheriting `BaseModel` that declare **fields with types**. FastAPI uses them to parse **JSON bodies** and to shape **responses** via `response_model`, hiding internal fields or reformatting output.

#### Intermediate

Pydantic v2 introduces `model_validate`, `model_dump`, and a faster core. Configure models with `model_config = ConfigDict(...)` for behaviors like **stripping whitespace**, **forbidding extra fields**, or **population by name** for aliases.

#### Expert

Patterns: **composition** of models, **discriminated unions** for polymorphic payloads, **computed fields**, **custom serializers** for odd types (Decimal, datetime/timezones), and exporting **JSON Schema** for codegen pipelines.

```python
# pydantic_response_filter.py
from pydantic import BaseModel, ConfigDict, Field
from fastapi import FastAPI

app = FastAPI()


class UserDB(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    username: str
    password_hash: str
    email: str


class UserPublic(BaseModel):
    username: str
    email: str


@app.get("/users/demo", response_model=UserPublic)
def demo_user() -> UserDB:
    return UserDB(username="alice", password_hash="SECRET", email="a@example.com")
```

**Key Points (1.3.2)**

- **`response_model`** can **strip** sensitive fields from output.

**Best Practices (1.3.2)**

- Maintain **`XxxCreate`**, **`XxxRead`**, **`XxxUpdate`** model families for evolving APIs.

**Common Mistakes (1.3.2)**

- Returning **ORM instances** directly without `response_model` or explicit conversion.

---

### 1.3.3 Uvicorn Server

#### Beginner

**Uvicorn** is an **ASGI server** that runs your `app` object. In development you typically run `uvicorn main:app --reload`. The `main:app` syntax means “import `app` from module `main`.”

#### Intermediate

Production patterns: multiple **workers**, **socket binding** to `0.0.0.0`, **graceful shutdown**, and reverse proxies (nginx, Traefik) handling TLS. **Gunicorn** with **UvicornWorker** is a common recipe for pre-fork process management.

#### Expert

Tune **`--limit-concurrency`**, **`--timeout-keep-alive`**, and **`--proxy-headers`** when behind load balancers. Understand **file descriptor** limits and **TIME_WAIT** socket behavior under burst traffic.

```python
# main_uvicorn_target.py — typical entry module
from fastapi import FastAPI

app = FastAPI(title="Uvicorn Target")


@app.get("/")
def root() -> dict[str, str]:
    return {"hint": "uvicorn main_uvicorn_target:app --reload"}
```

**Key Points (1.3.3)**

- The **`module:attribute`** string wires the ASGI callable for the CLI.

**Best Practices (1.3.3)**

- Use **`uvicorn[standard]`** for `uvloop`/`httptools` where supported.

**Common Mistakes (1.3.3)**

- Running **one worker** on multi-core machines without reason.

---

### 1.3.4 OpenAPI and Swagger

#### Beginner

**OpenAPI** describes your API: paths, operations, parameters, request/response **JSON Schemas**, and security schemes. **Swagger UI** renders that description as interactive HTML at `/docs`.

#### Intermediate

You can enrich metadata with **global tags**, **servers** lists, **contact** and **license** blocks on `FastAPI(...)`, and per-operation **examples**. Export `/openapi.json` into **contract tests** or **SDK generators**.

#### Expert

Advanced: **custom OpenAPI schema** modifications via `app.openapi` override, **OpenAPI 3.1** features when tooling supports them, and **breaking change detection** by diffing normalized schemas between releases.

```python
# openapi_metadata.py
from fastapi import FastAPI

app = FastAPI(
    title="Ecosystem Metadata API",
    version="1.0.0",
    openapi_tags=[
        {"name": "status", "description": "Health and version endpoints."},
    ],
)


@app.get("/version", tags=["status"])
def version() -> dict[str, str]:
    return {"api": "1.0.0"}
```

**Key Points (1.3.4)**

- **OpenAPI** is the hub for docs, mocks, and client generation.

**Best Practices (1.3.4)**

- Align **URL path versioning** (`/v1`) with documented **version** fields.

**Common Mistakes (1.3.4)**

- Hand-editing **generated** OpenAPI instead of fixing **models and routes**.

---

### 1.3.5 Related Libraries

#### Beginner

Frequent companions: **HTTPX** (async-friendly HTTP client), **SQLAlchemy 2.x** + **Alembic** (ORM + migrations), **pytest** with **httpx** or **TestClient** for API tests, **python-jose** or **PyJWT** for tokens (evaluate security needs carefully).

#### Intermediate

**Structlog** or **loguru** for structured logs, **Sentry** for error reporting, **Redis** clients for caching, **Celery**/**ARQ**/**RQ** for background jobs, **Typer** for CLIs that share code with your API.

#### Expert

**OpenTelemetry** for traces/metrics, **Kafka**/**NATS** clients for eventing, **Strawberry**/**Ariadne** if you add GraphQL alongside REST, **protobuf** services in separate processes for gRPC while FastAPI serves HTTP.

```python
# related_httpx_pattern.py — async client reuse sketch
import httpx
from fastapi import FastAPI

app = FastAPI()


@app.on_event("startup")
async def startup() -> None:
    # Prefer lifespan context in new code; this demonstrates startup hooks
    app.state.http = httpx.AsyncClient(timeout=10.0)


@app.on_event("shutdown")
async def shutdown() -> None:
    await app.state.http.aclose()


@app.get("/proxy-status")
async def proxy_status() -> dict[str, int]:
    r = await app.state.http.get("https://httpbin.org/status/200")
    return {"status_code": r.status_code}
```

### Key Points (Section 1.3)

- FastAPI’s power is **ecosystem composability**: HTTP stack + validation + your data layer.
- **Uvicorn** runs the app; **Starlette** handles low-level HTTP; **Pydantic** validates data.

### Best Practices (Section 1.3)

- **Pin** dependency versions and automate **lockfile** or **constraints** in CI.

### Common Mistakes (Section 1.3)

- Creating a **new HTTP client per request** without connection pooling.

---

## 1.4 Getting Started

### 1.4.1 FastAPI Roadmap

#### Beginner

A practical learning path: install tools → smallest app → **path/query/body** parameters → **Pydantic models** → **routers** → **dependencies** → **middleware** → **testing** → **deployment** → **observability**.

#### Intermediate

Add **SQLAlchemy/Tortoise**, **migrations**, **pagination**, **filtering**, **versioned routers**, **OAuth2** flows matching your IdP, and **Docker** images with non-root users.

#### Expert

Deep dives: **WebSockets**, **SSE**, **custom OpenAPI**, **multi-tenant** isolation, **horizontal scaling**, **zero-downtime** migrations, **chaos testing** for downstream failures.

```python
# roadmap_checkpoint.py
from fastapi import FastAPI

app = FastAPI()


@app.get("/checkpoint/{step}")
def checkpoint(step: int) -> dict[str, int | str]:
    return {"step": step, "note": "You can explain path params and JSON responses"}
```

**Key Points (1.4.1)**

- **Incremental mastery** matches how FastAPI projects grow in real teams.

**Best Practices (1.4.1)**

- After each topic, **reproduce** examples without copy-pasting.

**Common Mistakes (1.4.1)**

- Jumping to **microservices** before solid **testing** and **deployment** basics.

---

### 1.4.2 Python Version Requirements

#### Beginner

FastAPI tracks modern Python; as of recent releases, **Python 3.8+** is commonly supported, but **3.10+** is recommended for cleaner builtin generics and error messages. Always verify the **official FastAPI documentation** for the minimum version for the release you install.

#### Intermediate

Python **3.11+** improves interpreter speed; **3.12+** continues refinements. Align **Docker base images**, **CI matrix**, and **developer laptops** to the same minimum to avoid “works on my machine” typing differences.

#### Expert

Declare **`requires-python`** in **`pyproject.toml`** and mirror it in **mypy/pyright** `python_version` settings. Consider **`ruff`** for fast linting across large codebases.

```toml
# pyproject.toml fragment (illustrative)
[project]
name = "my-api"
requires-python = ">=3.10"
dependencies = [
  "fastapi>=0.110.0",
  "uvicorn[standard]>=0.27.0",
]
```

```python
# version_probe.py
import sys

print(f"Running Python {sys.version_info.major}.{sys.version_info.minor}")
```

**Key Points (1.4.2)**

- **Version consistency** across dev/CI/prod prevents subtle typing/runtime mismatches.

**Best Practices (1.4.2)**

- Test on the **oldest** Python you claim to support in CI.

**Common Mistakes (1.4.2)**

- Using **3.12-only** syntax while CI runs **3.9**.

---

### 1.4.3 Virtual Environments

#### Beginner

A **virtual environment** is an isolated directory of packages for one project. Create it with `python3 -m venv .venv`, **activate** it, then install FastAPI inside. This avoids polluting your system Python and makes dependency versions reproducible.

#### Intermediate

Check `.venv` into **`.gitignore`**. Document activation for **Windows** (`.\.venv\Scripts\activate`) vs **Unix** (`source .venv/bin/activate`). IDEs can auto-select the interpreter inside `.venv`.

#### Expert

Tools like **Poetry**, **pip-tools**, **uv**, or **Conda** add **lockfiles** and **resolution**. **direnv** can auto-activate environments per directory. **Docker** multi-stage builds keep runtime images small while preserving deterministic installs.

```bash
# Unix/macOS — illustrative commands
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install "fastapi[standard]"
```

```python
# show_prefix.py — verify interpreter isolation
import sys

print(sys.prefix)
```

**Key Points (1.4.3)**

- **Never** rely on system site-packages for application services.

**Best Practices (1.4.3)**

- Commit **requirements.txt** or **lockfile**, not the **venv folder**.

**Common Mistakes (1.4.3)**

- Forgetting to **activate** the venv before running `pip install`.

---

### 1.4.4 Installation Methods

#### Beginner

**pip**: `pip install fastapi uvicorn` or `pip install "fastapi[standard]"` which pulls common optional performance extras where applicable. Always install **inside** your virtual environment.

#### Intermediate

**requirements.txt** pins versions:

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
```

**Poetry**: `poetry add fastapi uvicorn`. **Conda-forge** provides conda packages when your org standardizes on Conda.

#### Expert

**Private package indexes**, **wheel caches** in CI, **`pip audit`** or **`safety`** for vulnerability scanning, and **SBOM** generation for compliance. Consider **`uv pip install`** for faster resolver installs in large monorepos.

```python
# install_smoke_test.py
def smoke() -> None:
    import fastapi  # noqa: F401
    import uvicorn  # noqa: F401

    assert fastapi.__version__
    assert uvicorn.__version__


if __name__ == "__main__":
    smoke()
    print("imports successful")
```

### Key Points (Section 1.4)

- **Roadmap**, **Python version**, **venv**, and **install method** are the foundation for everything that follows.

### Best Practices (Section 1.4)

- Document **copy-paste** install steps for new contributors.

### Common Mistakes (Section 1.4)

- Omitting **`[standard]`** for Uvicorn when you expect **production-grade** loops/parsers.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points (Chapter Summary)

- FastAPI is an **ASGI** API framework combining **Starlette** and **Pydantic** with **OpenAPI-first** docs.
- **Type hints** define contracts at the HTTP boundary and reduce documentation drift.
- **Async** increases throughput for **non-blocking** IO when libraries cooperate.
- The **ecosystem** (server, DB, HTTP clients, observability) is **your** architecture to compose.

### Best Practices (Chapter Summary)

- Use **virtualenvs**, **pinned deps**, and **consistent Python** versions.
- Invest in **automated tests** and **schema checks** early for public APIs.
- Treat **security tutorials** as starting points—integrate real **IdP** and **secret management**.

### Common Mistakes (Chapter Summary)

- **Blocking** the event loop in `async def` routes.
- **Skipping** `response_model` and leaking **internal fields**.
- **Exposing** interactive docs and OpenAPI on **unauthenticated** public endpoints when inappropriate.

---

## Appendix: Integrated Lab Examples

The following scripts tie multiple introduction themes together. Run them with Uvicorn after installing dependencies (`pip install fastapi uvicorn httpx` for examples that import httpx).

```python
"""intro_lab_app.py — combined patterns for experimentation."""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Introduction Lab", version="0.1.0")


class Item(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    price: float = Field(gt=0)


def api_key(q_key: Annotated[str | None, Query(alias="api_key")] = None) -> str:
    if q_key != "demo":
        raise HTTPException(status_code=401, detail="bad api key")
    return q_key


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/items", response_model=Item, tags=["items"])
def create_item(item: Item, _: str = Depends(api_key)) -> Item:
    return item


@app.get("/items/{item_id}", response_model=Item)
def read_item(
    item_id: int,
    verbose: Annotated[bool, Query()] = False,
) -> Item:
    if item_id <= 0:
        raise HTTPException(status_code=404, detail="not found")
    base = Item(name=f"item-{item_id}", price=1.0)
    if verbose:
        return base.model_copy(update={"name": f"{base.name}+verbose"})
    return base
```

```python
"""async_pitfalls_lab.py — compare blocking vs non-blocking waits."""
import asyncio
import time

from fastapi import FastAPI

app = FastAPI()


@app.get("/bad/blocking-in-async")
async def bad() -> dict[str, str]:
    time.sleep(0.25)  # blocks event loop — demo only, avoid in real apps
    return {"pattern": "blocking sleep inside async route"}


@app.get("/good/async-sleep")
async def good() -> dict[str, str]:
    await asyncio.sleep(0.25)
    return {"pattern": "async sleep yields to other tasks"}


@app.get("/ok/sync-route")
def ok_sync() -> dict[str, str]:
    time.sleep(0.25)  # runs in threadpool — better than blocking async, still costly
    return {"pattern": "sync route with blocking sleep"}
```

```python
"""openapi_tags_lab.py — organize growing APIs."""
from fastapi import FastAPI

tags = [
    {"name": "public", "description": "Unauthenticated read-only endpoints."},
    {"name": "admin", "description": "Privileged maintenance endpoints."},
]

app = FastAPI(title="Tagged API", openapi_tags=tags)


@app.get("/public/info", tags=["public"])
def public_info() -> dict[str, str]:
    return {"env": "dev"}


@app.get("/admin/ping", tags=["admin"])
def admin_ping() -> dict[str, str]:
    return {"role": "admin-demo"}
```

```python
"""validation_matrix_lab.py — show 422 behavior with constrained fields."""
from pydantic import BaseModel, Field
from fastapi import FastAPI

app = FastAPI()


class Rating(BaseModel):
    score: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=280)


@app.post("/ratings")
def submit_rating(r: Rating) -> Rating:
    return r
```

```python
"""ecosystem_client_demo.py — minimal httpx usage (install httpx)."""
import httpx
from fastapi import FastAPI

app = FastAPI()


@app.get("/fetch-headers")
async def fetch_headers() -> dict[str, str]:
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get("https://httpbin.org/headers")
        return {"remote_status": str(response.status_code)}
```

```python
"""settings_dependency_sketch.py — pretend settings injection."""
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def get_settings() -> dict[str, str]:
    return {"ENV": "development", "FEATURE_BETA": "on"}


@app.get("/settings-snapshot")
def snapshot(settings: Annotated[dict[str, str], Depends(get_settings)]) -> dict[str, str]:
    return settings
```

```python
"""router_preview.py — foreshadowing modular apps (Topic 3 expands this)."""
from fastapi import APIRouter, FastAPI

api = FastAPI(title="Router Preview")
items_router = APIRouter(prefix="/items", tags=["items"])


@items_router.get("/")
def list_items() -> list[str]:
    return ["router-a", "router-b"]


api.include_router(items_router)
```

### Appendix Key Points

- Labs are **safe playgrounds**—replace demo auth and sleeps with production patterns.
- Use **`--reload`** in development; disable or protect **`/docs`** in production as needed.

### Appendix Best Practices

- After each lab, **curl** or use Swagger UI to observe **status codes** and **422** bodies.

### Appendix Common Mistakes

- Running **httpx** examples without `pip install httpx`.
- Leaving **demo API keys** in query strings when deploying publicly.

---

## Further Reading Checklist

1. Read the official **FastAPI** tutorial sections on path parameters and query parameters.
2. Skim **Starlette** middleware documentation for request/response hooks.
3. Review **Pydantic** model configuration for strict vs loose validation policies.
4. Practice deploying a **Docker**ized Uvicorn service behind **nginx** or **Traefik**.

---

*Document version: introduction chapter. Complements local course Topics 1–3 in this repository.*

