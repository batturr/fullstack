# Middleware in FastAPI

## 📑 Table of Contents

- [18.1 Middleware Basics](#181-middleware-basics)
  - [18.1.1 Middleware Concept](#1811-middleware-concept)
  - [18.1.2 Middleware Order](#1812-middleware-order)
  - [18.1.3 Request Processing](#1813-request-processing)
  - [18.1.4 Response Processing](#1814-response-processing)
  - [18.1.5 Middleware Lifecycle](#1815-middleware-lifecycle)
- [18.2 Creating Middleware](#182-creating-middleware)
  - [18.2.1 Function-Based Middleware](#1821-function-based-middleware)
  - [18.2.2 Class-Based Middleware](#1822-class-based-middleware)
  - [18.2.3 Starlette Middleware](#1823-starlette-middleware)
  - [18.2.4 Custom Middleware](#1824-custom-middleware)
  - [18.2.5 Middleware Parameters](#1825-middleware-parameters)
- [18.3 Common Middleware](#183-common-middleware)
  - [18.3.1 CORS Middleware](#1831-cors-middleware)
  - [18.3.2 Logging Middleware](#1832-logging-middleware)
  - [18.3.3 Timing Middleware](#1833-timing-middleware)
  - [18.3.4 Authentication Middleware](#1834-authentication-middleware)
  - [18.3.5 Error Handling Middleware](#1835-error-handling-middleware)
- [18.4 Request Processing](#184-request-processing)
  - [18.4.1 Request Modification](#1841-request-modification)
  - [18.4.2 Request Headers](#1842-request-headers)
  - [18.4.3 Request Body](#1843-request-body)
  - [18.4.4 Request Attributes](#1844-request-attributes)
  - [18.4.5 Request Caching](#1845-request-caching)
- [18.5 Response Processing](#185-response-processing)
  - [18.5.1 Response Modification](#1851-response-modification)
  - [18.5.2 Response Headers](#1852-response-headers)
  - [18.5.3 Response Body](#1853-response-body)
  - [18.5.4 Compression](#1854-compression)
  - [18.5.5 Response Caching](#1855-response-caching)
- [18.6 Advanced Middleware](#186-advanced-middleware)
  - [18.6.1 Conditional Middleware](#1861-conditional-middleware)
  - [18.6.2 Middleware Chains](#1862-middleware-chains)
  - [18.6.3 Middleware Testing](#1863-middleware-testing)
  - [18.6.4 Performance Optimization](#1864-performance-optimization)
  - [18.6.5 Best Practices](#1865-best-practices)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 18.1 Middleware Basics

**Middleware** sits **around** your application: it can inspect or change **requests** before they reach **routes** and **responses** after routes return.

### 18.1.1 Middleware Concept

#### Beginner

Think of middleware as **onion layers**: each layer calls **`call_next`** to pass control **inward** toward the route, then runs code **on the way out** with the **response**.

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

app = FastAPI()


class HelloMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Hello"] = "1"
        return response


app.add_middleware(HelloMiddleware)
```

#### Intermediate

Middleware runs for **most** HTTP requests, including those that **404** at the routing layer—unless a **layer** short-circuits (returns early). It does **not** replace **dependencies**; use each tool for **cross-cutting** vs **per-route** concerns.

#### Expert

ASGI middleware wraps the **entire** app **callable**. Starlette’s **`BaseHTTPMiddleware`** spawns **background tasks** for the inner app in some patterns—under **high concurrency**, **pure ASGI** middleware can avoid subtle **task** overhead (see **18.6.4**).

```python
from starlette.types import ASGIApp, Receive, Scope, Send


class StripServerHeader:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = [(k, v) for k, v in message.get("headers", []) if k.lower() != b"server"]
                message = {**message, "headers": headers}
            await send(message)

        await self.app(scope, receive, send_wrapper)
```

**Key Points (18.1.1)**

- Middleware is **reusable** **cross-cutting** behavior.
- It wraps **`call_next`** to observe **both** directions.
- **ASGI** middleware is the **lowest-level** abstraction.

**Best Practices (18.1.1)**

- Keep middleware **fast**—defer heavy work to **workers** or **async tasks** when possible.
- Prefer **dependencies** for **auth** that needs **OpenAPI** integration.

**Common Mistakes (18.1.1)**

- Putting **business rules** in middleware that belong in **services**.
- Assuming middleware runs **only** for **successful** routes.

---

### 18.1.2 Middleware Order

#### Beginner

**`app.add_middleware(A); app.add_middleware(B)`** wraps so **B** is **outermost** (runs **first** on request, **last** on response for symmetric layers). The **last added** is **outer**.

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

app = FastAPI()


class Outer(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.order = getattr(request.state, "order", []) + ["outer-in"]
        resp = await call_next(request)
        request.state.order.append("outer-out")
        return resp


class Inner(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.order = getattr(request.state, "order", []) + ["inner-in"]
        resp = await call_next(request)
        request.state.order.append("inner-out")
        return resp


app.add_middleware(Inner)
app.add_middleware(Outer)  # Outer wraps Inner
```

#### Intermediate

**CORS** should usually be **outermost** so **error responses** still get **CORS headers**. **GZip** often sits **inside** CORS but **outside** route handlers.

#### Expert

**ExceptionMiddleware** lives **inside** much of the stack—errors may **bypass** some middleware **response** hooks if not re-raised correctly. **Test** **4xx/5xx** paths for **missing** headers.

**Key Points (18.1.2)**

- **Order** determines **which** middleware sees **raw** vs **modified** requests.
- **Outer** middleware sees the request **first** and response **last** (for typical patterns).

**Best Practices (18.1.2)**

- Document your **stack** in **README** for the team.
- Put **security** headers and **CORS** where they cover **all** outcomes.

**Common Mistakes (18.1.2)**

- **CORS** innermost → **preflight** or **errors** lack **Access-Control-*** headers.
- Adding **GZip** in the wrong place so **streaming** breaks.

---

### 18.1.3 Request Processing

#### Beginner

On the **inbound** leg, read **`request.method`**, **`request.url`**, **`request.headers`**, and **`request.state`** before **`await call_next(request)`**.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class LogPathMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print(request.method, request.url.path)
        return await call_next(request)
```

#### Intermediate

**Do not** read **`request.body()`** lightly—it **consumes** the stream; if you must inspect, **re-inject** with **`Request`** constructed from **`receive`**. Prefer **dependencies** for body access in routes.

#### Expert

**Streaming** endpoints and **WebSockets** use different **scope** types—gate middleware with **`if scope["type"] == "http"`** in **ASGI** style or **`request.scope["type"]`** checks.

```python
async def dispatch(self, request: Request, call_next):
    if request.scope["type"] != "http":
        return await call_next(request)
    return await call_next(request)
```

**Key Points (18.1.3)**

- Request phase is **before** **`call_next`**.
- **Body** inspection in middleware is **advanced** and **risky**.

**Best Practices (18.1.3)**

- Set **`request.state`** values **early** for downstream **dependencies**.
- Avoid **blocking** **I/O** in **`dispatch`**.

**Common Mistakes (18.1.3)**

- Consuming **body** without **rewinding** → routes see **empty** body.
- Logging **Authorization** header **verbatim**.

---

### 18.1.4 Response Processing

#### Beginner

After **`response = await call_next(request)`**, mutate **`response.headers`** or **wrap** **`response.body_iterator`** for **transforms**.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response
```

#### Intermediate

For **streaming** responses, header changes on **`StreamingResponse`** still work **before** iteration starts; changing **length** after **`Content-Length`** set is **error-prone**.

#### Expert

To **modify** JSON bodies, you may need to **buffer** the body (memory cost)—consider doing this in **exception handlers** or **route** layer instead for **large** payloads.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class AppendJsonMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        ct = response.headers.get("content-type", "")
        if "application/json" in ct:
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            body = body[:-1] + b',"meta":{"via":"mw"}}' if body.endswith(b"}") else body
            return Response(content=body, status_code=response.status_code, headers=dict(response.headers), media_type="application/json")
        return response
```

**Key Points (18.1.4)**

- Response phase is **after** **`call_next`**.
- **Buffering** defeats **streaming** benefits.

**Best Practices (18.1.4)**

- Prefer **headers** over **body surgery** when possible.
- Test **FileResponse** and **SSE** paths when adding **body** middleware.

**Common Mistakes (18.1.4)**

- Assuming **`response.body`** exists—many responses are **iterators** only.
- Breaking **`Content-Length`** when **editing** bodies.

---

### 18.1.5 Middleware Lifecycle

#### Beginner

Middleware is created when **`add_middleware`** registers it. **`dispatch`** runs **once per request**.

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

app = FastAPI()


class CountMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, name: str = "mw"):
        super().__init__(app)
        self.name = name

    async def dispatch(self, request: Request, call_next):
        return await call_next(request)


app.add_middleware(CountMiddleware, name="api")
```

#### Intermediate

**Startup/shutdown** belongs in **`@app.on_event`** (legacy) or **`lifespan`** context—not in middleware **`__init__`** unless you know the **implications** for **reload** and **tests**.

#### Expert

With **multiple workers**, middleware **in-memory counters** are **per process**—use **Redis** for **global** state. **Hot reload** re-instantiates app objects; avoid **singletons** that assume **once per deployment**.

**Key Points (18.1.5)**

- **`dispatch`** is **per request**; **`__init__`** is **per app build**.
- **Stateful** middleware must account for **multi-worker** **realities**.

**Best Practices (18.1.5)**

- Use **`lifespan`** for **DB pools**, **clients**, **cache warmers**.
- Keep middleware **stateless** except for **shared clients** injected safely.

**Common Mistakes (18.1.5)**

- Storing **per-user** state on **middleware instance** fields.
- Assuming **tests** share **one** global middleware **counter** without **reset**.

---

## 18.2 Creating Middleware

You can author middleware as **functions**, **classes**, or **prebuilt Starlette** middleware.

### 18.2.1 Function-Based Middleware

#### Beginner

A **middleware factory** returns an **ASGI** app wrapping **`app`**. This is the **canonical** Starlette pattern.

```python
from fastapi import FastAPI
from starlette.requests import Request

app = FastAPI()


@app.middleware("http")
async def add_header_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Fn"] = "1"
    return response
```

For a **parameterized** ASGI wrapper (factory style), compose around the **inner app** explicitly:

```python
from starlette.types import ASGIApp, Receive, Scope, Send


def with_header(app: ASGIApp, name: bytes, value: bytes):
    async def middleware(scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((name, value))
                message = {**message, "headers": headers}
            await send(message)

        await app(scope, receive, send_wrapper)

    return middleware


# app = with_header(app, b"x-fn", b"1")  # after FastAPI() construction
```

#### Intermediate

**`app.middleware("http")`** decorator registers **function-based** middleware in **FastAPI**—order follows **registration** sequence relative to **`add_middleware`**.

#### Expert

Function middleware composes cleanly: **curry** configuration (**`factory(header=value)(app)`**) or build **stacks** programmatically for **tenants**.

**Key Points (18.2.1)**

- **Pure ASGI** functions are **flexible** and **testable**.
- The **`middleware("http")`** decorator is **syntactic sugar** over **wrapping**.

**Best Practices (18.2.1)**

- Name factories **`with_*`** or **`add_*`** for clarity.
- Type-annotate **`ASGIApp`** and **`Scope`**.

**Common Mistakes (18.2.1)**

- Forgetting to **forward** **`receive`** unchanged unless **replacing** body.
- Applying **HTTP-only** transforms to **`websocket`** scopes.

---

### 18.2.2 Class-Based Middleware

#### Beginner

Subclass **`BaseHTTPMiddleware`** and implement **`async def dispatch`**.

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

app = FastAPI()


class PrefixStateMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.api_version = "v1"
        return await call_next(request)


app.add_middleware(PrefixStateMiddleware)
```

#### Intermediate

Pass **constructor args** via **`add_middleware(cls, arg1=...)`**—Starlette stores them on the **middleware instance**.

#### Expert

For **complex** **state** or **instrumentation**, a **class** can hold **shared** **httpx.AsyncClient** references created in **`lifespan`** and **injected**—avoid creating **clients per request** in **`dispatch`**.

```python
class InjectClientMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, http_client):
        super().__init__(app)
        self.http_client = http_client

    async def dispatch(self, request: Request, call_next):
        request.state.http = self.http_client
        return await call_next(request)
```

**Key Points (18.2.2)**

- **Classes** bundle **config** + **behavior**.
- **`add_middleware`** passes **kwargs** to **`__init__`**.

**Best Practices (18.2.2)**

- Keep **`dispatch`** **short**; extract **helpers**.
- Document **thread/async** safety of **shared** attributes.

**Common Mistakes (18.2.2)**

- Creating **expensive** objects **per request** inside **`dispatch`**.
- Mutating **shared** **mutable** defaults **across** requests incorrectly.

---

### 18.2.3 Starlette Middleware

#### Beginner

Import ready-made middleware from **`starlette.middleware.*`** (for example **`GZipMiddleware`**, **`HTTPSRedirectMiddleware`**).

```python
from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### Intermediate

**`TrustedHostMiddleware`** restricts **`Host`** headers—use behind **proxies** with correct **`forwarded`** handling.

```python
from starlette.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["api.example.com", "*.example.com"])
```

#### Expert

**`ProxyHeadersMiddleware`** (or platform equivalents) trusts **`X-Forwarded-For`**—misconfiguration enables **IP spoofing**. Only enable with **trusted** **reverse proxies**.

```python
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")  # tighten in production
```

**Key Points (18.2.3)**

- Starlette middleware is **first-party** and **well-tested**.
- **Security** middleware needs **deployment-aware** configuration.

**Best Practices (18.2.3)**

- Read **Starlette docs** for **defaults** (minimum sizes, methods).
- **Test** behind **nginx/traefik** with **real** headers.

**Common Mistakes (18.2.3)**

- **`TrustedHostMiddleware`** blocking **health checks** from **k8s** **kubelet**.
- **GZip** on **already compressed** **binary** responses wasting **CPU**.

---

### 18.2.4 Custom Middleware

#### Beginner

Combine **request** and **response** hooks: generate **request id**, attach to **state**, echo in **response** header.

```python
import uuid

from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

app = FastAPI()


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = rid
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        return response


app.add_middleware(RequestIdMiddleware)
```

#### Intermediate

Emit **structured logs** at **middleware** boundary with **duration** using **`time.perf_counter()`**.

```python
import time
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

log = logging.getLogger("access")


class AccessLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        ms = (time.perf_counter() - start) * 1000
        log.info(
            "%s %s -> %s in %.2fms",
            request.method,
            request.url.path,
            response.status_code,
            ms,
        )
        return response
```

#### Expert

Implement **W3C Trace Context** parsing/injection: read **`traceparent`**, create **child spans** in **OpenTelemetry** **instrumentation**—middleware is a natural **entry point**.

**Key Points (18.2.4)**

- Custom middleware is how teams encode **org-specific** **policies**.
- **Access logs** + **request ids** are **table stakes** for **production**.

**Best Practices (18.2.4)**

- Keep **PII** out of **logs**; **hash** user ids if needed.
- Correlate **logs** with **metrics** using **same** **ids**.

**Common Mistakes (18.2.4)**

- **Double** logging when **Uvicorn access log** **also** enabled without **coordination**.
- Logging **full** **query strings** with **secrets**.

---

### 18.2.5 Middleware Parameters

#### Beginner

Pass **static** config via **`add_middleware(MyMW, option=True)`**.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class FeatureFlagMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, beta: bool = False):
        super().__init__(app)
        self.beta = beta

    async def dispatch(self, request: Request, call_next):
        request.state.beta = self.beta
        return await call_next(request)
```

#### Intermediate

For **dynamic** config, read from **`os.environ`**, **pydantic-settings**, or a **config service** at **startup** and **rebuild** app—or use **feature flag SDK** inside **`dispatch`** (watch **latency**).

#### Expert

**Hot reload** and **tests** may construct **multiple** apps—avoid **module-level globals** for **config** unless **explicitly** managed. Prefer **`lifespan`** to load **settings** once.

```python
from dataclasses import dataclass

@dataclass
class MWConfig:
    expose_version: bool


class VersionHeaderMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, cfg: MWConfig):
        super().__init__(app)
        self.cfg = cfg

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if self.cfg.expose_version:
            response.headers["X-API-Version"] = "1.0.0"
        return response
```

**Key Points (18.2.5)**

- **Constructor** parameters configure **behavior** per **deployment**.
- **Dynamic** flags have **cost**—**cache** carefully.

**Best Practices (18.2.5)**

- Validate **config** at **startup** (**fail fast**).
- Document **each** **middleware** **parameter** in **infra** playbooks.

**Common Mistakes (18.2.5)**

- Reading **env vars** on **every** request **uncached**.
- **Boolean** traps: **`DEBUG=0`** still **truthy** as **non-empty** string.

---

## 18.3 Common Middleware

These patterns appear in **most** production **FastAPI** services.

### 18.3.1 CORS Middleware

#### Beginner

**`CORSMiddleware`** adds **`Access-Control-*`** headers and answers **OPTIONS** **preflight** requests.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Intermediate

Place **CORS** **early/outer** in the stack. Restrict **`allow_origins`** in **production**—**`**`** with **`allow_credentials=True`** is **invalid** per spec (see **Topic 19**).

#### Expert

When **splitting** **public** vs **admin** **APIs**, different **CORS** policies may require **separate** apps **mounted** or **conditional** middleware (**18.6.1**).

**Key Points (18.3.1)**

- Browsers **enforce** CORS; **curl** does **not**.
- **Credentials** + **wildcard origins** do **not** mix.

**Best Practices (18.3.1)**

- List **explicit** **origins** for **prod**.
- Expose only **needed** **headers** via **`expose_headers`**.

**Common Mistakes (18.3.1)**

- Forgetting **`allow_credentials`** when using **cookies**.
- **CORS** “fix” by **`allow_origins=["*"]`** on **authenticated** APIs.

---

### 18.3.2 Logging Middleware

#### Beginner

Log **method**, **path**, **status**, **duration** for **every** request.

```python
import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

log = logging.getLogger("http")


class SimpleLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        log.info(
            "%s %s %s %.2fms",
            request.method,
            request.url.path,
            response.status_code,
            (time.perf_counter() - start) * 1000,
        )
        return response
```

#### Intermediate

Add **`request.state.request_id`** to **every** log line via **context vars** (**`contextvars`**) or **logging filters**.

#### Expert

**Sampling** + **cardinality** control: avoid **high-cardinality** labels in **metrics** derived from **paths**—use **route templates** from **FastAPI** **scope** when available.

**Key Points (18.3.2)**

- **Structured JSON** logs ease **ingestion** into **ELK/Datadog**.
- **Correlation ids** tie **distributed** traces together.

**Best Practices (18.3.2)**

- Use **`extra={}`** fields consistently.
- **Redact** **Authorization**, **cookies**, **password** fields.

**Common Mistakes (18.3.2)**

- Logging **entire** **request bodies** by default.
- **INFO** noise from **health** checks—**filter** **`/healthz`**.

---

### 18.3.3 Timing Middleware

#### Beginner

Measure **server-side** duration and expose **`X-Response-Time`** header in **milliseconds**.

```python
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        ms = (time.perf_counter() - start) * 1000
        response.headers["X-Response-Time"] = f"{ms:.2f}ms"
        return response
```

#### Intermediate

Record **histograms** in **Prometheus** with **status** and **method** labels—**low cardinality**.

#### Expert

**OpenTelemetry** **span** around **`call_next`** captures **nested** **DB** spans as **children** automatically when **instrumentations** are installed. Prefer **`opentelemetry-instrumentation-fastapi`** wrapping the **app**; hand-rolled ASGI is only for **custom** needs:

```python
from starlette.types import ASGIApp, Receive, Scope, Send


def with_server_timing(app: ASGIApp) -> ASGIApp:
    async def middleware(scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await app(scope, receive, send)
            return
        import time

        start = time.perf_counter()

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                dur_ms = (time.perf_counter() - start) * 1000
                headers = list(message.get("headers", []))
                headers.append((b"server-timing", f"app;dur={dur_ms:.2f}".encode()))
                message = {**message, "headers": headers}
            await send(message)

        await app(scope, receive, send_wrapper)

    return middleware
```

**Key Points (18.3.3)**

- Use **`perf_counter`**, not **`time.time`**, for **durations**.
- **Headers** like **`Server-Timing`** can help **browser** **devtools**.

**Best Practices (18.3.3)**

- Do not **trust** client-facing **timing** for **security** decisions.
- **Aggregate** timings—**per-request** **logs** only at **debug**.

**Common Mistakes (18.3.3)**

- Including **microsecond** floats in **logs** without **rounding** (**noise**).
- **Blocking** **metrics** **push** inside **`dispatch`** on **every** request.

---

### 18.3.4 Authentication Middleware

#### Beginner

Parse **`Authorization: Bearer ...`** and set **`request.state.user_id`** before **`call_next`**. **Note:** OpenAPI **won’t** know about this unless you also use **dependencies**—many teams prefer **dependencies** over **middleware** for **auth**.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class BearerHintMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("authorization", "")
        request.state.bearer_present = auth.lower().startswith("bearer ")
        return await call_next(request)
```

#### Intermediate

**JWT** validation in **middleware** centralizes **policy** but complicates **per-route** **scopes**—often **hybrid**: middleware **parses**, dependency **authorizes**.

#### Expert

**mTLS** or **API gateway** **JWT** termination moves **crypto** **out-of-process**—middleware then **trusts** **`X-User-Id`** **only** on **internal** networks (**zero trust** cautions).

**Key Points (18.3.4)**

- **Middleware auth** is **global** unless **conditional**.
- **Dependencies** integrate better with **OpenAPI** **security schemes**.

**Best Practices (18.3.4)**

- **Validate** **audience**, **issuer**, **exp**, **nbf** for **JWTs**.
- Avoid **custom crypto**—use **libraries** (**PyJWT**, **authlib**).

**Common Mistakes (18.3.4)**

- Trusting **`X-User-Id`** from **public** **internet** without **gateway** **verification**.
- **Skipping** **auth** for **`/docs`** unintentionally exposing **admin** routes.

---

### 18.3.5 Error Handling Middleware

#### Beginner

Wrap **`call_next`** in **`try/except`** to log **unexpected** errors—**re-raise** unless converting to **response**.

```python
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

log = logging.getLogger(__name__)


class CatchAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception:
            log.exception("unhandled in mw")
            return JSONResponse({"detail": "error"}, status_code=500)
```

#### Intermediate

Prefer **`@app.exception_handler`** for **HTTP-shaped** errors—middleware **catch-all** can **mask** **`HTTPException`** or **duplicate** **handlers**.

#### Expert

**`BaseHTTPMiddleware` + try/except** historically had **subtle** interactions with **streaming** and **background tasks**—**test** **thoroughly** or use **ASGI** middleware + **exception** middleware ordering awareness.

**Key Points (18.3.5)**

- **Global catch** in middleware is a **last resort**.
- **Re-raise** when **central** **exception** middleware should **handle**.

**Best Practices (18.3.5)**

- Return **consistent** **JSON** **500** with **`error_id`**.
- Ensure **CORS** headers still **apply** (**outer** CORS).

**Common Mistakes (18.3.5)**

- Swallowing **exceptions** without **logging** **`exc_info`**.
- Returning **500** for **`HTTPException`** **accidentally**.

---

## 18.4 Request Processing

Deep dives on **mutating** and **inspecting** **incoming** requests.

### 18.4.1 Request Modification

#### Beginner

You cannot **safely** replace **`Request`** objects casually—mutate **`scope`** **only** if you know **ASGI** semantics. Prefer **`request.state`**.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class ForceJsonMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.expect_json = True
        return await call_next(request)
```

#### Intermediate

To **rewrite paths** (for example **strip prefix**), adjust **`scope["path"]`** in **ASGI** middleware—**be careful** with **`root_path`** and **proxies**.

```python
from starlette.types import ASGIApp, Receive, Scope, Send


def strip_prefix(app: ASGIApp, prefix: str):
    assert prefix.startswith("/") and prefix != "/" and not prefix.endswith("/")

    async def middleware(scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http" and scope["path"].startswith(prefix):
            scope = dict(scope)
            scope["path"] = scope["path"][len(prefix) :] or "/"
        await app(scope, receive, send)

    return middleware
```

#### Expert

**URL rewriting** interacts with **`FastAPI(root_path=...)`** and **OpenAPI** **servers** field—keep **docs** **accurate** when **behind** **subpaths**.

**Key Points (18.4.1)**

- **`request.state`** is the **safe** **extension** point.
- **Scope** mutation is **powerful** and **easy to break**.

**Best Practices (18.4.1)**

- Add **integration tests** for **rewritten** paths.
- Document **proxy** **path** **stripping** in **infra**.

**Common Mistakes (18.4.1)**

- Breaking **`/openapi.json`** **paths** with **bad** **strips**.
- Losing **query strings** when **manipulating** **`path`**.

---

### 18.4.2 Request Headers

#### Beginner

Read **`request.headers.get("user-agent")`** case-insensitively—Starlette **`Headers`** handles **case**.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class UAHintMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.is_mobile = "Mobile" in request.headers.get("user-agent", "")
        return await call_next(request)
```

#### Intermediate

Normalize **`Accept-Language`** for **i18n** **routing**—parse **quality** values properly (**`babel`**).

#### Expert

**`Forwarded`** / **`X-Forwarded-*`** headers should be **parsed** only when **trusted**—use **Starlette/Uvicorn** **Proxy** middleware or **platform** **features**.

**Key Points (18.4.2)**

- Headers are **untrusted** input from **clients** or **proxies**.
- **Case** insensitivity is **handled** by **Starlette**.

**Best Practices (18.4.2)**

- **Validate** **formats** of **custom** headers.
- **Allowlist** **expected** **headers** in **CORS** (**Topic 19**).

**Common Mistakes (18.4.2)**

- Treating **`X-Request-ID`** as **cryptographically** **unique** without **checking** **entropy**.
- **Splitting** **`Authorization`** incorrectly (**multiple** spaces).

---

### 18.4.3 Request Body

#### Beginner

Avoid reading **body** in middleware for **JSON** APIs—use **Pydantic** models in **routes**.

```python
# Prefer in route:
from pydantic import BaseModel
from fastapi import FastAPI

app = FastAPI()


class Payload(BaseModel):
    name: str


@app.post("/in")
def ingest(p: Payload) -> Payload:
    return p
```

#### Intermediate

If you **must** log **payload size**, use **`request.headers.get("content-length")`** without **reading** **body**.

#### Expert

**HMAC** verification of **raw body** requires **reading** **bytes** once and **re-wiring** **`receive`**—use **Starlette** patterns or **community** snippets **carefully**; **tests** are **mandatory**.

```python
# Pseudocode only — real implementations must reconstruct Request(receive=...)
# body = await request.body()
# verify_hmac(body, signature_header)
```

**Key Points (18.4.3)**

- **Body** is a **stream**—single **consumer** rule.
- **Signature** verification needs **raw** **bytes**.

**Best Practices (18.4.3)**

- **Cache** **parsed** body **only** under **size** limits.
- **Reject** huge bodies at **reverse proxy** first.

**Common Mistakes (18.4.3)**

- Calling **`request.body()`** in middleware **and** expecting **route** to **re-read** without **fixing** **`receive`**.
- Logging **password** fields from **JSON** bodies.

---

### 18.4.4 Request Attributes

#### Beginner

Use **`request.state`** dynamic attributes—initialize in **middleware**, read in **dependencies** or **routes**.

```python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.tenant = request.headers.get("x-tenant", "public")
        return await call_next(request)


app.add_middleware(TenantMiddleware)


@app.get("/who")
def who(request: Request) -> dict[str, str]:
    return {"tenant": request.state.tenant}
```

#### Intermediate

**Type hints**: define a **`Protocol`** or **custom **`Request`** subclass** pattern for **`state`**—optional but improves **IDE** support.

#### Expert

**Context variables** (**`contextvars`**) propagate through **`await`** without **passing** **`request`**—useful for **logging** **filters**, but **avoid** **abusing** for **request data** that should be **explicit**.

```python
import contextvars

current_tenant: contextvars.ContextVar[str] = contextvars.ContextVar("tenant", default="public")
```

**Key Points (18.4.4)**

- **`request.state`** is **per-request** **storage**.
- **`contextvars`** help **implicit** **propagation** but **hide** **data flow**.

**Best Practices (18.4.4)**

- **Document** **`state`** **keys** as **API** of your **internal** platform.
- **Reset** **contextvars** properly in **tests**.

**Common Mistakes (18.4.4)**

- **Typos** in **`state`** attribute names (**silent** **`AttributeError`** later).
- Using **`global`** **variables** for **per-request** data.

---

### 18.4.5 Request Caching

#### Beginner

**Idempotency** keys belong in **headers**—middleware can **dedupe** **POST** by **storing** **key → response** in **Redis** (**short TTL**).

```python
# Conceptual sketch — production needs locking, TTL, and body hash
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class IdempotencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and "idempotency-key" in request.headers:
            request.state.idempotency_key = request.headers["idempotency-key"]
        return await call_next(request)
```

#### Intermediate

**HTTP caching** for **GET** is usually **`Cache-Control`** headers from **routes**, not middleware—middleware can **strip** or **add** **Vary**.

#### Expert

**Danger:** caching **mutating** requests **without** canonical **serialization** of **body** leads to **data corruption**—prefer **gateway** **idempotency** or **dedicated** **service** with **strong** **tests**.

**Key Points (18.4.5)**

- **Caching** **POST** is **hard**—needs **keys** + **body** **hashing**.
- **GET** caching leverages **HTTP** semantics.

**Best Practices (18.4.5)**

- Use **Redis** **SETNX**-style **locks** for **idempotency** **windows**.
- **Expire** **entries** aggressively.

**Common Mistakes (18.4.5)**

- **Colliding** **idempotency** keys **across** **users**.
- Returning **cached** **401/500** responses incorrectly.

---

## 18.5 Response Processing

Shape **outbound** **responses** consistently.

### 18.5.1 Response Modification

#### Beginner

Add **headers** to **every** response for **security** baseline.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        return response
```

#### Intermediate

**Conditionally** **skip** **headers** for **`/docs`** if **needed**—some **headers** break **Swagger UI** embeds (**CSP**).

#### Expert

**Content Security Policy** belongs often at **CDN**/**edge**—duplicate carefully to avoid **conflicting** **policies** (**browser** applies **intersection** rules depending on **deployment**).

**Key Points (18.5.1)**

- **Response** mutation is **straightforward** for **headers**.
- **CSP** is **powerful** and **easy** to **break** **docs**.

**Best Practices (18.5.1)**

- Centralize **security** headers in **one** **middleware**.
- **Test** **`/docs`**, **`/redoc`**, **`/openapi.json`**.

**Common Mistakes (18.5.1)**

- Setting **`Content-Security-Policy`** too strict and **blocking** **inline** **Swagger** assets.
- Duplicating **`Set-Cookie`** headers accidentally.

---

### 18.5.2 Response Headers

#### Beginner

Set **`Cache-Control`** for **API** responses that are **dynamic** (**`no-store`**) vs **public** **GET** lists that can **cache**.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class NoStoreMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/private"):
            response.headers["Cache-Control"] = "no-store"
        return response
```

#### Intermediate

**`Vary: Origin`** may be needed when **responses** differ by **CORS**—**browsers** and **CDNs** use **`Vary`** for **cache** **keys**.

#### Expert

**ETag**/**`If-None-Match`** middleware is rare in **JSON** APIs—more common in **static** **file** **serving** (**`StaticFiles`**).

**Key Points (18.5.2)**

- Headers drive **browser** and **CDN** **behavior**.
- **`Vary`** impacts **cache** **hit rate**.

**Best Practices (18.5.2)**

- Be explicit about **`private` vs `public`** **caching**.
- Avoid **`Cache-Control: public`** on **authenticated** **JSON**.

**Common Mistakes (18.5.2)**

- **Caching** **authenticated** responses at **shared** **CDN** without **`private`**.
- Forgetting **`Vary`** when **compressing** with **`Accept-Encoding`**.

---

### 18.5.3 Response Body

#### Beginner

Prefer **route-level** **response_model** and **serializers** over **middleware** **body** edits.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Out(BaseModel):
    msg: str


@app.get("/out", response_model=Out)
def out() -> Out:
    return Out(msg="hi")
```

#### Intermediate

If **wrapping** all **JSON** with **`{data: ...}`**, consider a **custom** **`JSONResponse`** subclass or **router** **dependency** rather than **middleware** **buffering**.

#### Expert

**JSON** **transcoding** in middleware **breaks** **`StreamingResponse`** and **large** **downloads**—use **conditional** application or **exclude** **paths**.

**Key Points (18.5.3)**

- **Body** editing is **expensive** and **fragile**.
- **Streaming** and **middleware** **buffering** conflict.

**Best Practices (18.5.3)**

- **Whitelist** **paths** for **any** **body** transform.
- **Measure** **memory** **impact**.

**Common Mistakes (18.5.3)**

- **Double** **JSON** encoding or **corrupt** **bytes**.
- Changing **bodies** on **errors** inconsistently.

---

### 18.5.4 Compression

#### Beginner

Use **`GZipMiddleware`** instead of **manual** **gzip** in most apps.

```python
from starlette.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=500)
```

#### Intermediate

**Brotli** may be handled at **CDN**—avoid **double** compression (**check **`Content-Encoding`**).

#### Expert

**SSE** and **WebSockets** should **exclude** **gzip** middleware transforms—verify **content types** and **streaming** behavior on your **Starlette** version.

**Key Points (18.5.4)**

- **Compression** saves **bandwidth**, costs **CPU**.
- **Minimum size** avoids **compressing** **tiny** payloads.

**Best Practices (18.5.4)**

- Let **reverse proxies** compress **static** assets.
- **Monitor** **p99** **CPU** after enabling **gzip**.

**Common Mistakes (18.5.4)**

- Compressing **already** **compressed** **images**/**video**.
- **Breaking** **`EventSource`** streams.

---

### 18.5.5 Response Caching

#### Beginner

For **cacheable** **GET** **responses**, set **`Cache-Control`** and optionally **`ETag`** in **routes**.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/public-config")
def config(response: Response) -> dict[str, str]:
    response.headers["Cache-Control"] = "public, max-age=60"
    return {"theme": "dark"}
```

#### Intermediate

**`Stale-While-Revalidate`** patterns are **CDN** features—express via **headers** consistently.

#### Expert

**`private`** **caches** vs **shared** **proxies**: **authenticated** endpoints should use **`private`** or **`no-store`** unless you fully understand **Vary** and **cookie** interactions.

**Key Points (18.5.5)**

- **HTTP caching** is **declarative** via **headers**.
- **ETags** help **conditional** **GET** clients.

**Best Practices (18.5.5)**

- **Document** which endpoints are **cacheable**.
- **Test** with **`curl -I`** and **real** **CDN** configs.

**Common Mistakes (18.5.5)**

- **`max-age`** **too long** for **frequently** **changing** **data**.
- **Ignoring** **`Authorization`** when **caching** (**data leaks**).

---

## 18.6 Advanced Middleware

Patterns for **conditional stacks**, **testing**, and **performance**.

### 18.6.1 Conditional Middleware

#### Beginner

Branch inside **`dispatch`** based on **path** prefix.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class AdminOnlyHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/admin"):
            response.headers["X-Admin-API"] = "1"
        return response
```

#### Intermediate

**Separate** **`FastAPI`** apps **mounted** at **`/public`** and **`/internal`** with **different** **middleware** stacks—cleaner than **large** **if** **trees**.

```python
from fastapi import FastAPI

public = FastAPI()
internal = FastAPI()

app = FastAPI()
app.mount("/public", public)
app.mount("/internal", internal)
```

#### Expert

**Feature flags** can **short-circuit** middleware **chains** early—ensure **flag reads** are **cached** and **observable** when **misconfigured**.

**Key Points (18.6.1)**

- **Conditionals** keep **one** **process** but **multiple** **policies**.
- **Mounts** isolate **middleware** **scopes**.

**Best Practices (18.6.1)**

- Prefer **composition** over **mega** **middleware**.
- **Test** **all** **branches**.

**Common Mistakes (18.6.1)**

- **Accidentally** **skipping** **security** **middleware** on **“minor”** routes.
- **Complex** regex **path** rules **hurting** **performance**.

---

### 18.6.2 Middleware Chains

#### Beginner

**Chain** is **`add_middleware` order** + **function composition**—draw it **on paper**: **outer** to **inner**.

#### Intermediate

Build **reusable** **`build_app()`** factory returning **configured** **`FastAPI`** for **tests** and **CLI** **reuse**.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def build_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"])
    return app
```

#### Expert

**Third-party** **packages** may **inject** middleware—**document** **final** **order** via **introspection** **tests** that **assert** **middleware** **stack** types (**fragile** but useful as **smoke** test).

**Key Points (18.6.2)**

- **Chains** should be **deterministic** across **environments**.
- **Factories** reduce **drift** between **prod** and **tests**.

**Best Practices (18.6.2)**

- Keep **middleware** count **small**—each layer is **risk**.
- **Version** **internal** **middleware** packages.

**Common Mistakes (18.6.2)**

- **Different** **order** in **tests** masking **bugs**.
- **Duplicating** **same** **middleware** **twice**.

---

### 18.6.3 Middleware Testing

#### Beginner

Use **`TestClient`** against **`app`** and **assert** **headers**.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

app = FastAPI()


class EchoMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Echo"] = "1"
        return response


app.add_middleware(EchoMiddleware)


@app.get("/t")
def t() -> dict[str, str]:
    return {"ok": "1"}


client = TestClient(app)
r = client.get("/t")
assert r.headers["X-Echo"] == "1"
```

#### Intermediate

Test **error** paths: trigger **422** and assert **CORS** headers still **present** if **required**.

#### Expert

**ASGI** **direct** testing: call **`app(scope, receive, send)`** with **mock** **`send`** capturing **messages**—useful when **`TestClient`** **hides** **details**.

**Key Points (18.6.3)**

- **Headers** and **status** codes are **primary** **assertions**.
- **Integration** tests catch **ordering** **bugs**.

**Best Practices (18.6.3)**

- **Parametrize** **paths** for **middleware** **matrix** tests.
- Use **`capsys`**/**`caplog`** to verify **logging** middleware.

**Common Mistakes (18.6.3)**

- Testing **only** **happy** **paths**.
- **Flaky** tests due to **timing**—avoid **sleep**; **mock** **clock**.

---

### 18.6.4 Performance Optimization

#### Beginner

Avoid **heavy** **CPU** in **`dispatch`**—**offload** to **workers**/**queues**.

#### Intermediate

Prefer **pure ASGI** middleware for **hot** paths per **Starlette** guidance on **`BaseHTTPMiddleware`** overhead.

```python
# Use class-based ASGI middleware pattern from 18.1.1 for hot paths
```

#### Expert

**Profile** with **`py-spy`** or **OpenTelemetry** **CPU** spans—**optimize** only **proven** **bottlenecks**. **Connection pooling** for **HTTP** clients matters **more** than **micro** **middleware** tweaks.

**Key Points (18.6.4)**

- **Middleware** runs on **every** request—**microseconds** **add** **up**.
- **Pools** and **DB** **indexes** dominate **latency** usually.

**Best Practices (18.6.4)**

- **Benchmark** before/after **middleware** changes.
- **Disable** **debug** middleware in **prod**.

**Common Mistakes (18.6.4)**

- **Serializing** **large** **JSON** in **middleware** for **logging**.
- **N+1** **DB** queries mistaken for **middleware** **cost**.

---

### 18.6.5 Best Practices

#### Beginner

**Small number** of **focused** middleware layers: **CORS**, **request id**, **security headers**, **gzip**.

#### Intermediate

**Prefer dependencies** when behavior needs **per-route** **OpenAPI** **metadata** or **optional** **application**.

#### Expert

**Platform** capabilities (**service mesh**, **API gateway**) may **duplicate** middleware—**choose** **one** **source of truth** per **concern** to avoid **conflicts** and **debugging** **nightmares**.

**Key Points (18.6.5)**

- **Clarity** beats **cleverness** in **middleware** stacks.
- **Duplication** across **layers** is a **operational** **risk**.

**Best Practices (18.6.5)**

- Maintain a **diagram** of **request flow**.
- **Review** **middleware** on **every** **major** **upgrade** (**Starlette/FastAPI**).

**Common Mistakes (18.6.5)**

- **Middlware** typo-level naming drift (**copy-paste** **repos**).
- **Secrets** in **middleware** **defaults** committed to **git**.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- Middleware wraps **`call_next`** to observe **request** and **response** phases.
- **Order** matters—especially for **CORS**, **gzip**, and **security** headers.
- **BaseHTTPMiddleware** is **easy**; **pure ASGI** is **flexible** and sometimes **faster**.
- **Request bodies** and **response bodies** require **care**—**streaming** and **consumption** rules apply.

### Chapter Best Practices

- Keep middleware **thin**; put **domain logic** in **services**.
- Add **request ids** and **structured access logs**.
- Test **errors** and **preflight** CORS, not only **200** JSON.
- Document **stack order** and **deployment** headers (**proxies**).

### Chapter Common Mistakes

- **Inner** CORS causing **missing** headers on **errors**.
- Reading **`request.body()`** without **re-injecting** **`receive`**.
- **Buffering** **large** **streams** in middleware **memory**.
- **Catch-all** middleware **masking** **`HTTPException`** or **duplicating** **handlers**.
