# Error Handling in FastAPI

## 📑 Table of Contents

- [17.1 Exception Handling](#171-exception-handling)
  - [17.1.1 Try-Except Blocks](#1711-try-except-blocks)
  - [17.1.2 Exception Types](#1712-exception-types)
  - [17.1.3 Custom Exceptions](#1713-custom-exceptions)
  - [17.1.4 Exception Chaining](#1714-exception-chaining)
  - [17.1.5 Finally Blocks](#1715-finally-blocks)
- [17.2 HTTPException](#172-httpexception)
  - [17.2.1 Raising HTTPException](#1721-raising-httpexception)
  - [17.2.2 Status Codes](#1722-status-codes)
  - [17.2.3 Detail Messages](#1723-detail-messages)
  - [17.2.4 Headers in Exceptions](#1724-headers-in-exceptions)
  - [17.2.5 Custom HTTPException](#1725-custom-httpexception)
- [17.3 Error Responses](#173-error-responses)
  - [17.3.1 Error Response Format](#1731-error-response-format)
  - [17.3.2 Error Details](#1732-error-details)
  - [17.3.3 Error Codes](#1733-error-codes)
  - [17.3.4 Error Messages](#1734-error-messages)
  - [17.3.5 Stack Traces](#1735-stack-traces)
- [17.4 Exception Handlers](#174-exception-handlers)
  - [17.4.1 @app.exception_handler](#1741-appexception_handler)
  - [17.4.2 Built-in Exception Handlers](#1742-built-in-exception-handlers)
  - [17.4.3 Custom Exception Handlers](#1743-custom-exception-handlers)
  - [17.4.4 Multiple Handlers](#1744-multiple-handlers)
  - [17.4.5 Handler Ordering](#1745-handler-ordering)
- [17.5 Validation Errors](#175-validation-errors)
  - [17.5.1 Handling Validation Errors](#1751-handling-validation-errors)
  - [17.5.2 Custom Error Responses](#1752-custom-error-responses)
  - [17.5.3 Error Detail Format](#1753-error-detail-format)
  - [17.5.4 Localizing Errors](#1754-localizing-errors)
  - [17.5.5 Error Documentation](#1755-error-documentation)
- [17.6 Advanced Error Handling](#176-advanced-error-handling)
  - [17.6.1 Global Error Handling](#1761-global-error-handling)
  - [17.6.2 Error Logging](#1762-error-logging)
  - [17.6.3 Error Monitoring](#1763-error-monitoring)
  - [17.6.4 Error Recovery](#1764-error-recovery)
  - [17.6.5 Error Reporting](#1765-error-reporting)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 17.1 Exception Handling

Python exceptions let you **interrupt** normal control flow when something goes wrong. In FastAPI, many errors surface as **HTTP responses**, but **try/except** still matters inside route code, services, and background tasks.

### 17.1.1 Try-Except Blocks

#### Beginner

**`try`** runs code that might fail; **`except`** catches specific failures so the app can respond gracefully instead of crashing the request worker.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/safe-divide")
def safe_divide(a: int, b: int) -> dict[str, float | str]:
    try:
        return {"result": a / b}
    except ZeroDivisionError:
        return {"error": "b must not be zero"}
```

#### Intermediate

Catch **narrow** exception types first; use **`Exception`** only as a last resort. Re-raise when you cannot meaningfully handle the error, or translate to **`HTTPException`** for API clients.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()
_ITEMS: dict[str, dict[str, str]] = {"a": {"id": "a"}}


def load_item(item_id: str) -> dict[str, str]:
    return _ITEMS[item_id]  # KeyError if unknown


@app.get("/items/{item_id}")
def read_item(item_id: str) -> dict[str, str]:
    try:
        return load_item(item_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Item not found") from None
```

#### Expert

**Bare `except:`** hides **`KeyboardInterrupt`** and **`SystemExit`**—avoid it. Prefer **`except*`** (Python 3.11+) for **exception groups** in concurrent code. In **async** routes, **`try/except`** around **`await`** works like synchronous code for normal **`async def`** handlers.

```python
import asyncio
from fastapi import FastAPI, HTTPException

app = FastAPI()


async def fetch_external() -> str:
    await asyncio.sleep(0.01)
    raise ConnectionError("upstream offline")


@app.get("/aggregate")
async def aggregate() -> dict[str, str]:
    try:
        data = await fetch_external()
    except ConnectionError as exc:
        raise HTTPException(status_code=503, detail="Upstream unavailable") from exc
    return {"data": data}
```

**Key Points (17.1.1)**

- **`try/except`** contains failures **inside** your Python code path.
- Prefer **specific** exception types over catching everything.
- Use **`from exc`** or **`from None`** to control **exception context** in logs and traces.

**Best Practices (17.1.1)**

- Log **unexpected** exceptions at **`ERROR`** level before mapping to HTTP.
- Keep **business logic** in services; routes should mostly **orchestrate** and translate errors.

**Common Mistakes (17.1.1)**

- Swallowing exceptions with **`pass`**, hiding production bugs.
- Returning **`200 OK`** with **`{"error": ...}`** instead of proper **4xx/5xx** semantics.

---

### 17.1.2 Exception Types

#### Beginner

Built-in exceptions include **`ValueError`**, **`TypeError`**, **`KeyError`**, **`IndexError`**, and **`RuntimeError`**. FastAPI/Pydantic may raise **`ValidationError`** for bad request bodies or parameters.

```python
def parse_positive_int(raw: str) -> int:
    value = int(raw)
    if value < 1:
        raise ValueError("must be positive")
    return value
```

#### Intermediate

**`HTTPException`** is special: FastAPI turns it into an **HTTP response** rather than treating it as an unhandled crash. **`StarletteHTTPException`** is the underlying Starlette type—FastAPI subclasses extend behavior but handlers often register for both.

```python
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field

app = FastAPI()


class Body(BaseModel):
    x: int = Field(ge=0)


@app.post("/body")
def with_body(b: Body) -> Body:
    return b  # RequestValidationError if invalid
```

#### Expert

**`Exception`** hierarchy matters for **handler dispatch**: Starlette matches **exact exception class** (not subclasses) unless you register handlers carefully. For **middleware** and **dependencies**, unhandled exceptions become **500** unless a handler converts them.

```python
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(StarletteHTTPException)
async def starlette_http_handler(request, exc: StarletteHTTPException):
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
```

**Key Points (17.1.2)**

- Distinguish **client errors** (4xx), **server errors** (5xx), and **Python exceptions**.
- **`ValidationError`** vs **`RequestValidationError`** layering affects **handler** targets.
- **Starlette** vs **FastAPI** HTTP exception types can both appear in real apps.

**Best Practices (17.1.2)**

- Raise **domain exceptions** internally; map them to **HTTP** at the edge (router/service boundary).
- Document which **exceptions** each service function may raise.

**Common Mistakes (17.1.2)**

- Catching **`HTTPException`** too broadly and losing the intended **status code**.
- Assuming all **Pydantic** errors are **`ValidationError`** in every FastAPI version—check imports.

---

### 17.1.3 Custom Exceptions

#### Beginner

Subclass **`Exception`** (or a **domain base**) to represent **business rule** failures clearly.

```python
class InsufficientFundsError(Exception):
    def __init__(self, balance: int, amount: int) -> None:
        super().__init__(f"balance {balance} < {amount}")
        self.balance = balance
        self.amount = amount
```

#### Intermediate

Add **`__str__`**, **error codes**, and **metadata** so exception handlers can build consistent JSON without string parsing.

```python
class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.status_code = status_code


class NotFoundError(AppError):
    def __init__(self, resource: str, id_: str) -> None:
        super().__init__(
            code="not_found",
            message=f"{resource} {id_} not found",
            status_code=404,
        )
```

#### Expert

Use **exception groups** or **structured causes** when one user action triggers multiple independent failures (batch validation). Keep exceptions **immutable** after creation for safe logging.

```python
class PaymentDeclinedError(AppError):
    def __init__(self, *, reason_code: str, processor: str) -> None:
        super().__init__(
            code="payment_declined",
            message="Payment was declined",
            status_code=402,
        )
        self.reason_code = reason_code
        self.processor = processor
```

**Key Points (17.1.3)**

- Custom exceptions encode **domain meaning** beyond generic **`ValueError`**.
- Attach **fields** you need for **logging** and **API error payloads**.
- Keep **HTTP mapping** separate or centralized in **handlers**.

**Best Practices (17.1.3)**

- One **thin** hierarchy: **`AppError`** → specific types.
- Avoid raising **`HTTPException`** deep inside **pure** domain logic.

**Common Mistakes (17.1.3)**

- Overusing **string messages** as the only structured data.
- Creating **too many** exception classes with no clear mapping policy.

---

### 17.1.4 Exception Chaining

#### Beginner

**`raise ... from err`** preserves the **original cause**; **`raise ... from None`** suppresses **context** when you intentionally replace low-level noise.

```python
try:
    int("x")
except ValueError as err:
    raise ValueError("bad number") from err
```

#### Intermediate

In APIs, chaining helps **support** debug **500** responses in **dev** while returning **safe** messages in **prod**. **`__cause__`** and **`__context__`** appear in **tracebacks**.

```python
def read_config(path: str) -> str:
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except OSError as err:
        raise RuntimeError(f"cannot read {path}") from err
```

#### Expert

**`ExceptionGroup`** (3.11+) models **parallel** failures; frameworks may wrap them. When translating to HTTP, decide whether to **flatten** errors or return **207/422**-style structured bodies for batch endpoints.

```python
def validate_batch(ids: list[str]) -> None:
    errors: list[Exception] = []
    for i in ids:
        if not i.isdigit():
            errors.append(ValueError(f"bad id {i!r}"))
    if errors:
        raise ExceptionGroup("batch validation failed", errors)
```

**Key Points (17.1.4)**

- **Chaining** documents **causal** relationships for operators.
- **`from None`** avoids leaking **internal** exception types in **tracebacks** shown to users.
- **Exception groups** require **new** handling patterns in **Python 3.11+**.

**Best Practices (17.1.4)**

- Always **`from exc`** when re-wrapping **unexpected** low-level errors you log.
- In **public** error JSON, never expose raw **third-party** exception strings.

**Common Mistakes (17.1.4)**

- Losing the **original** exception by re-raising without **`from`** when debugging is needed.
- Logging **only** the wrapper without **`exc_info=True`**.

---

### 17.1.5 Finally Blocks

#### Beginner

**`finally`** runs **whether** the **`try`** succeeds, raises, or returns—ideal for **cleanup** (closing handles, releasing locks).

```python
def write_temp(data: str) -> None:
    f = open("/tmp/out.txt", "w", encoding="utf-8")
    try:
        f.write(data)
    finally:
        f.close()
```

#### Intermediate

Prefer **context managers** (**`with`**) over manual **`finally`** for resources. In **async**, use **`async with`** for **clients** and **DB** sessions.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/ok")
def ok() -> dict[str, str]:
    try:
        return {"status": "ok"}
    finally:
        # e.g. clear request-scoped context vars, metrics flush hooks
        pass
```

#### Expert

**`finally`** runs **before** the **`return`** value leaves the function—be careful with **`return`** inside **`try`** and **`finally`** (the **`finally`** return **overrides**). In ASGI, prefer **middleware** or **dependency teardown** for cross-cutting cleanup.

```python
def tricky() -> int:
    try:
        return 1
    finally:
        return 2  # returns 2 — usually a bug
```

**Key Points (17.1.5)**

- **`finally`** guarantees **cleanup** on all exit paths.
- Context managers are usually **clearer** than manual **`try/finally`**.
- **`return`** in **`finally`** is almost always **wrong**.

**Best Practices (17.1.5)**

- Use **`try/finally`** (or **`with`**) around **file**, **lock**, and **transaction** boundaries.
- For **request-scoped** resources, FastAPI **dependencies** with **`yield`** provide structured teardown.

**Common Mistakes (17.1.5)**

- Heavy work in **`finally`** that can **mask** exceptions or **slow** responses.
- Assuming **`finally`** will not run on **process kill**—it will not.

---

## 17.2 HTTPException

**`HTTPException`** is FastAPI’s primary way to signal **HTTP-level** errors with a **status code**, **detail**, and optional **headers**.

### 17.2.1 Raising HTTPException

#### Beginner

Raise **`HTTPException`** inside a route or dependency when the client did something invalid or lacks access.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/users/{user_id}")
def get_user(user_id: str) -> dict[str, str]:
    if user_id != "me":
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id}
```

#### Intermediate

**`HTTPException`** is not caught by generic **`except Exception`** handlers in all frameworks—FastAPI **handles** it internally. Still, do not use it for **normal control flow**; reserve it for **true** error conditions.

```python
from fastapi import Depends, FastAPI, HTTPException, status

app = FastAPI()


def get_token(authorization: str | None = None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    return authorization.removeprefix("Bearer ").strip()


@app.get("/secure")
def secure(token: str = Depends(get_token)) -> dict[str, str]:
    return {"token": token[:4] + "…"}
```

#### Expert

**`HTTPException`** participates in **OpenAPI** when raised from **dependencies** used in **parameters**—document expected **401/403** via **`responses={}`** on routes for complete specs.

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()


@app.get(
    "/resource",
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
    },
)
def resource() -> dict[str, str]:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="nope")
```

**Key Points (17.2.1)**

- **`HTTPException`** maps cleanly to **HTTP** responses.
- Use **`status` constants** instead of **magic numbers** when possible.
- Combine with **`responses=`** for **OpenAPI** completeness.

**Best Practices (17.2.1)**

- Put **auth** checks in **dependencies** to **reuse** and **test** them.
- Keep **`detail`** **safe** for clients (no secrets).

**Common Mistakes (17.2.1)**

- Raising **`HTTPException`** for **expected empty states** that might be **200** with **`null`**.
- Returning **`dict`** errors manually with **wrong** status codes.

---

### 17.2.2 Status Codes

#### Beginner

**4xx** = client fault; **5xx** = server fault. **`404`** not found, **`400`** bad input, **`401`** unauthenticated, **`403`** forbidden.

```python
from fastapi import HTTPException, status

raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="missing")
```

#### Intermediate

**`422 Unprocessable Entity`** is common for **validation** errors (FastAPI default). **`409 Conflict`** suits **unique constraint** violations; **`410 Gone`** for **permanently removed** resources.

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="Email already registered",
)
```

#### Expert

**`451 Unavailable For Legal Reasons`**, **`429 Too Many Requests`** with **`Retry-After`**, and **`503`** with **problem details** are part of **production** API design. Align with **RFC 9457** (Problem Details) if you standardize errors.

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
    detail="Maintenance window",
    headers={"Retry-After": "120"},
)
```

**Key Points (17.2.2)**

- Status codes communicate **class** of outcome to **clients**, **proxies**, and **observers**.
- **`422`** is **not** a generic “bad JSON”—it specifically means **semantically invalid** input per schema.

**Best Practices (17.2.2)**

- Pick **one** code per failure **type** across the API surface.
- Use **`status` enum** from **`starlette.status`** or **`fastapi.status`**.

**Common Mistakes (17.2.2)**

- Using **`401`** vs **`403`** interchangeably.
- Returning **`500`** for **predictable** client mistakes.

---

### 17.2.3 Detail Messages

#### Beginner

**`detail`** can be a **string** or a **JSON-serializable** structure (lists/dicts) for richer client feedback.

```python
from fastapi import HTTPException

raise HTTPException(status_code=400, detail="Invalid payload")
```

#### Intermediate

Structured **`detail`** helps **frontends** map fields to **form errors** without parsing strings.

```python
from fastapi import HTTPException

raise HTTPException(
    status_code=400,
    detail={"fields": {"email": ["invalid format"]}},
)
```

#### Expert

If you adopt **Problem Details**, embed **`type`**, **`title`**, **`status`**, **`instance`** in **`detail`** or a **custom response model** from a handler. Ensure **PII** is **redacted** in **`detail`** at the edge.

```python
from fastapi import HTTPException

raise HTTPException(
    status_code=422,
    detail={
        "type": "https://api.example.com/errors/invalid-order",
        "title": "Invalid order",
        "status": 422,
    },
)
```

**Key Points (17.2.3)**

- **`detail`** becomes the JSON **`detail`** field in default **FastAPI** errors.
- Structured **`detail`** improves **UX** for complex forms.

**Best Practices (17.2.3)**

- Keep messages **actionable** (“what to fix”) not vague (“error”).
- Log **internal** reasons separately from **public** **`detail`**.

**Common Mistakes (17.2.3)**

- Leaking **SQL**, **stack traces**, or **secrets** in **`detail`**.
- Returning **English-only** strings when **i18n** is required (see **17.5.4**).

---

### 17.2.4 Headers in Exceptions

#### Beginner

Pass **`headers=`** to **`HTTPException`** to add **response headers** (for example **`WWW-Authenticate`**).

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)
```

#### Intermediate

Use headers for **rate limits** (**`X-RateLimit-*`**), **cache invalidation hints**, or **correlation IDs** returned even on errors.

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
    detail="Too many requests",
    headers={"Retry-After": "60"},
)
```

#### Expert

Some **security** headers belong in **middleware**, not per-exception—but **`401`** **must** often carry **`WWW-Authenticate`** for **browser** clients. Combine with **CORS** awareness: exposed headers must be **allowlisted** (see **Topic 19**).

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token expired",
    headers={
        "WWW-Authenticate": 'Bearer error="invalid_token"',
    },
)
```

**Key Points (17.2.4)**

- Exception **headers** merge into the final **HTTP response**.
- **`Retry-After`** pairs naturally with **429/503**.

**Best Practices (17.2.4)**

- Centralize **header names** as **constants** to avoid typos.
- Document **non-standard** headers in **OpenAPI** where possible.

**Common Mistakes (17.2.4)**

- Setting **CORS** headers manually in routes instead of **`CORSMiddleware`**.
- Omitting **`WWW-Authenticate`** on **401**, confusing some clients.

---

### 17.2.5 Custom HTTPException

#### Beginner

You can **subclass** **`HTTPException`** to standardize **fields** like **`code`**.

```python
from fastapi import HTTPException, status


class ApiHTTPException(HTTPException):
    def __init__(self, code: str, *, status_code: int, detail: str) -> None:
        super().__init__(status_code=status_code, detail={"code": code, "message": detail})
        self.code = code
```

#### Intermediate

Register a dedicated **`exception_handler`** for your subclass to **reshape** JSON consistently across the app.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class PaymentRequired(HTTPException):
    pass


app = FastAPI()


@app.exception_handler(PaymentRequired)
async def pay_required_handler(request: Request, exc: PaymentRequired):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
```

#### Expert

Avoid **deep** subclass trees; prefer **one** **`AppError`** internally and **one** HTTP mapping layer. If you subclass, ensure **OpenAPI** examples still match **real** payloads.

```python
class GoneError(HTTPException):
    def __init__(self, resource_id: str) -> None:
        super().__init__(
            status_code=410,
            detail={"code": "gone", "id": resource_id},
        )
```

**Key Points (17.2.5)**

- Subclassing **`HTTPException`** is optional—**handlers** on **custom** **`AppError`** are often cleaner.
- Custom exceptions should still be **JSON-serializable** in **`detail`**.

**Best Practices (17.2.5)**

- Keep **`HTTPException`** subclasses **thin**—behavior lives in **handlers**.
- Test **serialization** of **`detail`** for all **custom** types.

**Common Mistakes (17.2.5)**

- Mixing **string** and **dict** **`detail`** shapes inconsistently across routes.
- Forgetting to **register** a handler after introducing a **new** exception type.

---

## 17.3 Error Responses

Clients consume **error responses** as **contracts**. Consistency matters more than clever messages.

### 17.3.1 Error Response Format

#### Beginner

Default FastAPI **`HTTPException`** JSON looks like **`{"detail": ...}`**. Validation errors use **`{"detail": [ ... ]}`** with **loc/type/msg** fields.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/boom")
def boom() -> None:
    raise HTTPException(status_code=400, detail="bad")
```

#### Intermediate

Standardize on **one envelope** (for example **`{error: {code, message, fields}}`**) via **exception handlers** or **middleware**.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": {"type": "validation_error", "items": exc.errors()}},
    )
```

#### Expert

Adopt **RFC 9457 Problem Details** (`application/problem+json`) for public APIs—map FastAPI defaults in **handlers** and update **OpenAPI** **`content`** types for **error** responses.

```python
from fastapi.responses import JSONResponse

body = {
    "type": "about:blank",
    "title": "Bad Request",
    "status": 400,
    "detail": "Invalid input",
}
return JSONResponse(status_code=400, content=body, media_type="application/problem+json")
```

**Key Points (17.3.1)**

- Default shapes are **good for prototypes**; **products** need **stable schemas**.
- **422** validation shape is **well-known**—changing it impacts **clients**.

**Best Practices (17.3.1)**

- Version your **error schema** if you make **breaking** changes.
- Publish **examples** in **OpenAPI** for **400/401/403/404/422/500**.

**Common Mistakes (17.3.1)**

- Returning **HTML** error pages from APIs consumed by **SPA** clients.
- Inconsistent **`Content-Type`** across success and error paths.

---

### 17.3.2 Error Details

#### Beginner

**`detail`** should tell the client **what** failed. For validation, each item includes **`loc`** (field path) and **`msg`**.

```python
from pydantic import BaseModel, Field
from fastapi import FastAPI

app = FastAPI()


class M(BaseModel):
    age: int = Field(ge=0)


@app.post("/m")
def m(x: M) -> M:
    return x
```

#### Intermediate

Enrich details with **`ctx`** from Pydantic errors or **custom** **`ErrorDetails`** models—keep **internal** IDs separate from **user-facing** text.

```python
# Conceptual: handler merges logging id with public message
def public_detail(internal_id: str, user_message: str) -> dict[str, str]:
    return {"message": user_message, "ref": internal_id}
```

#### Expert

For **multi-tenant** systems, ensure **`detail`** does not reveal **other tenants’** existence (for example **“user not found”** vs **“forbidden”** is a **privacy** tradeoff—often prefer **404** for both).

```python
from fastapi import HTTPException, status

# Uniform response for authz + existence to reduce enumeration
raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
```

**Key Points (17.3.2)**

- **Field-level** errors speed up **form** UX.
- **Security** and **privacy** shape what **details** you expose.

**Best Practices (17.3.2)**

- Add **machine-readable** **`code`** alongside **human** messages.
- Log **full** internal context with **request id**.

**Common Mistakes (17.3.2)**

- Returning **database** constraint names to clients.
- Using **`detail=None`**—clients may not handle **`null`** well.

---

### 17.3.3 Error Codes

#### Beginner

A **string code** (for example **`"invalid_email"`**) is easier for clients to branch on than **English** text.

```python
from fastapi import HTTPException

raise HTTPException(
    status_code=400,
    detail={"code": "invalid_email", "message": "Email format invalid"},
)
```

#### Intermediate

Namespace codes by **domain**: **`billing.card_declined`**, **`auth.token_expired`**. Store **catalog** in docs and **OpenAPI** **enums** if stable.

```python
from enum import Enum


class ErrorCode(str, Enum):
    INVALID_EMAIL = "invalid_email"
    RATE_LIMITED = "rate_limited"
```

#### Expert

Align **codes** with **support** tooling: same **code** in logs, **metrics**, and **JSON**. Consider **i18n keys** instead of literal **English** in **`message`**.

```python
raise HTTPException(
    status_code=429,
    detail={"code": "rate_limited", "i18n_key": "errors.rate_limited"},
)
```

**Key Points (17.3.3)**

- **Codes** are **API contracts**—treat breaking changes seriously.
- Pair codes with **HTTP status**—do not encode **status** only in the body.

**Best Practices (17.3.3)**

- Maintain a **single** **registry** document for **error codes**.
- Avoid **numeric** **error codes** that resemble **HTTP** status (confusing).

**Common Mistakes (17.3.3)**

- Changing **code** strings in **patch** releases without warning.
- Duplicating the same **concept** under multiple **codes**.

---

### 17.3.4 Error Messages

#### Beginner

Messages should be **short**, **specific**, and **free of jargon** where possible.

```python
raise HTTPException(status_code=400, detail="Quantity must be at least 1")
```

#### Intermediate

Separate **developer** messages (logs) from **user** messages (responses). Use **templates** with **safe interpolation**.

```python
def bad_range(field: str, min_v: int, max_v: int) -> str:
    return f"{field} must be between {min_v} and {max_v}"
```

#### Expert

For **localization**, return **keys + parameters** rather than final **strings** from the server, or negotiate **language** via **`Accept-Language`** in a **handler** (see **17.5.4**).

```python
detail = {"key": "errors.out_of_range", "args": {"field": "age", "min": 0, "max": 120}}
```

**Key Points (17.3.4)**

- Good messages reduce **support** tickets.
- **i18n** affects whether the **server** should emit **final** prose.

**Best Practices (17.3.4)**

- Avoid **blame** (“You messed up”)—use **neutral** tone.
- Test messages for **clarity** with **non-expert** readers.

**Common Mistakes (17.3.4)**

- Exposing **raw** **exception** **`str()`** to users.
- Inconsistent **capitalization** and **punctuation** across endpoints.

---

### 17.3.5 Stack Traces

#### Beginner

**Stack traces** belong in **logs**, not in **JSON** responses—never return them to browsers in **production**.

```python
import logging

log = logging.getLogger(__name__)


def risky() -> None:
    raise RuntimeError("boom")


try:
    risky()
except Exception:
    log.exception("risky failed")  # includes traceback in logs
    raise
```

#### Intermediate

Enable **`debug=True`** only in **development**. FastAPI/Starlette **debug** pages can leak **context**—disable in **prod**.

```python
from fastapi import FastAPI

app = FastAPI(debug=False)
```

#### Expert

Integrate **Sentry/OpenTelemetry**: capture **exceptions** with **trace ids**, **breadcrumbs**, and **PII scrubbing**. Return **opaque** **`error_id`** to clients linking to internal **incidents**.

```python
import uuid
from fastapi import HTTPException

error_id = str(uuid.uuid4())
# log.exception("fail", extra={"error_id": error_id})
raise HTTPException(status_code=500, detail={"error_id": error_id, "message": "Internal error"})
```

**Key Points (17.3.5)**

- **Tracebacks** are **sensitive** and **verbose**—keep them **server-side**.
- **`error_id`** bridges **client reports** and **server logs**.

**Best Practices (17.3.5)**

- Use **`exc_info=True`** or **`log.exception`** for **unexpected** errors.
- Scrub **secrets** from **breadcrumbs** in APM tools.

**Common Mistakes (17.3.5)**

- Returning **Python** tracebacks through **reverse proxies** accidentally.
- Logging **passwords** or **tokens** inside **exception** messages.

---

## 17.4 Exception Handlers

Exception **handlers** convert **exceptions** into **HTTP responses** and unify **error shapes**.

### 17.4.1 @app.exception_handler

#### Beginner

Register with **`@app.exception_handler(SomeException)`** to customize responses.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


class CheeseError(Exception):
    pass


@app.exception_handler(CheeseError)
async def cheese_handler(request: Request, exc: CheeseError):
    return JSONResponse(status_code=418, content={"detail": "I'm a teapot with cheese"})
```

#### Intermediate

Handlers may be **async** or **sync**; return **`Response`** subclasses. Access **`request`** for **headers**, **state**, or **URL**.

```python
@app.exception_handler(CheeseError)
async def cheese_handler(request: Request, exc: CheeseError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "path": str(request.url.path)},
    )
```

#### Expert

Use **`app.add_exception_handler`** for **modular** apps or **plugins**. Consider **per-router** patterns via **dependencies** when exception types are **not** global.

```python
app.add_exception_handler(CheeseError, cheese_handler)
```

**Key Points (17.4.1)**

- Handlers are **global** to the **FastAPI** app unless you use **sub-apps** with **separate** instances.
- They run **after** much of the **routing** pipeline—middleware ordering still matters.

**Best Practices (17.4.1)**

- Keep handlers **thin**: format response, **log**, **metrics**—not business rules.
- Always return a proper **`Response`**.

**Common Mistakes (17.4.1)**

- Raising **new** unhandled exceptions **inside** handlers.
- Forgetting **`await`** on **async** downstream calls inside **async** handlers.

---

### 17.4.2 Built-in Exception Handlers

#### Beginner

FastAPI includes default handlers for **`HTTPException`**, **`RequestValidationError`**, **`WebSocketRequestValidationError`**, and **`StarletteHTTPException`** (behavior evolves—consult your version’s docs).

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/x")
def x() -> None:
    raise HTTPException(404, "nope")
```

#### Intermediate

**Overriding** defaults is common for **`RequestValidationError`** to **standardize** **422** bodies. Keep **tests** that assert your **new** shape.

```python
from fastapi.exceptions import RequestValidationError
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def rv(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"errors": exc.errors()})
```

#### Expert

**WebSocket** validation errors need **distinct** handling—cannot always reuse **JSON** **`JSONResponse`** patterns. **`websocket.close`** with **codes** is the parallel tool.

```python
from fastapi import WebSocket, WebSocketException

# Conceptual: prefer WebSocketException / close codes in real WS routes
async def ws_fail(ws: WebSocket) -> None:
    await ws.close(code=4400)
```

**Key Points (17.4.2)**

- **Built-ins** define **baseline UX** for **OpenAPI**-first apps.
- **WebSocket** errors are **not** identical to **HTTP JSON** errors.

**Best Practices (17.4.2)**

- Document **overrides** in **team** playbooks.
- Snapshot-test **422** payloads when you customize them.

**Common Mistakes (17.4.2)**

- Assuming **Pydantic** error dicts are **stable** across **library upgrades**.
- Breaking **clients** silently by renaming **error** keys.

---

### 17.4.3 Custom Exception Handlers

#### Beginner

Map your **`AppError`** hierarchy to **JSON** once, instead of repeating **`HTTPException`** everywhere.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(message)
        self.code = code
        self.status_code = status_code


@app.exception_handler(AppError)
async def app_err(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": str(exc)}},
    )
```

#### Intermediate

Include **request id** from **middleware** **`request.state`**.

```python
@app.exception_handler(AppError)
async def app_err(request: Request, exc: AppError):
    rid = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": str(exc), "request_id": rid}},
    )
```

#### Expert

For **content negotiation**, inspect **`Accept`** and return **JSON** vs **XML** vs **problem+json**—rare, but possible in **enterprise** gateways.

```python
def wants_problem_json(request: Request) -> bool:
    accept = request.headers.get("accept", "")
    return "application/problem+json" in accept
```

**Key Points (17.4.3)**

- Custom handlers are the **single place** for **policy** (logging, shape, localization).
- **`request.state`** carries **per-request** context into handlers.

**Best Practices (17.4.3)**

- Unit-test handlers **in isolation** with **dummy** requests.
- Avoid **database** calls in handlers unless **required** for **enrichment**.

**Common Mistakes (17.4.3)**

- **Double-handling** the same exception (handler + middleware) causing **duplicate** logs.
- Returning **wrong** **`Content-Type`** for custom bodies.

---

### 17.4.4 Multiple Handlers

#### Beginner

Register **different** handlers for **different** exception classes. **Exact type match** determines which runs for a raised exception (see **ordering** nuances).

```python
@app.exception_handler(ValueError)
async def value_err(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(KeyError)
async def key_err(request: Request, exc: KeyError):
    return JSONResponse(status_code=404, content={"detail": "missing"})
```

#### Intermediate

Child classes need their **own** handler if you want **distinct** responses; otherwise the **parent** handler may not match depending on **Starlette** lookup—verify behavior on your version.

```python
class AppError(Exception):
    pass


class NotFound(AppError):
    pass
```

#### Expert

For **exception groups**, Python **3.11+** may require **custom** logic—frameworks may not unwrap them automatically. Flatten to **first** error or return **multi-error** JSON by policy.

```python
def flatten_eg(exc: BaseException) -> list[BaseException]:
    if isinstance(exc, BaseExceptionGroup):
        out: list[BaseException] = []
        for e in exc.exceptions:
            out.extend(flatten_eg(e))
        return out
    return [exc]
```

**Key Points (17.4.4)**

- **Multiple** handlers support **layered** error domains (**auth**, **billing**, **validation**).
- **Inheritance** interactions are **subtle**—test them.

**Best Practices (17.4.4)**

- Prefer **few** HTTP-facing exception types + **rich** **`code`** fields.
- Document **precedence** rules for maintainers.

**Common Mistakes (17.4.4)**

- Registering **two** handlers for incompatible **types** expecting **both** to run.
- Assuming **handler** match uses **MRO** like **`except`** clauses—verify **Starlette** rules.

---

### 17.4.5 Handler Ordering

#### Beginner

Handlers are looked up by **exception type** registration in Starlette’s **`ExceptionMiddleware`**. **Order of registration** can matter when adding handlers **dynamically**.

```python
app.add_exception_handler(KeyError, key_err)
app.add_exception_handler(Exception, generic_err)  # last resort pattern — verify matching rules
```

#### Intermediate

**Middleware** wraps **handlers**: exceptions that escape **routes** hit **exception middleware** after **inner** stack unwinding. **`HTTPException`** is handled **before** generic **500** generation.

#### Expert

For **sub-applications** mounted with **`app.mount`**, each **FastAPI** instance has **its own** handler table—**mount** boundaries affect **which** handler runs. **Routers** do **not** isolate exception handlers.

```python
from fastapi import FastAPI

sub = FastAPI()


@sub.get("/only-here")
def only_here() -> dict[str, str]:
    return {"ok": True}

app = FastAPI()
app.mount("/sub", sub)
```

**Key Points (17.4.5)**

- Think **app instance** scope for handlers, not **per-route** unless you simulate with **dependencies**.
- **Mounts** create **separate** apps with **separate** configs.

**Best Practices (17.4.5)**

- Register **generic** handlers **after** **specific** ones when using APIs that **overwrite** by key.
- Integration-test **mounted** apps’ **error** paths.

**Common Mistakes (17.4.5)**

- Expecting **parent** app handlers to catch **child** mounted app exceptions—often **false**.
- Misordering **middleware** so **CORS** headers are **missing** on **error** responses.

---

## 17.5 Validation Errors

Validation is the **most common** **4xx** path in FastAPI APIs. Treat **`422`** responses as **first-class** API surface.

### 17.5.1 Handling Validation Errors

#### Beginner

Override **`RequestValidationError`** handler to customize **`422`** payloads.

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"validation": exc.errors()})
```

#### Intermediate

**`exc.errors()`** returns **dicts** with **`type`**, **`loc`**, **`msg`**, **`input`**, and sometimes **`ctx`**. Filter **`input`** out in **production** if it may contain **PII**.

```python
def sanitize(items: list[dict]) -> list[dict]:
    return [{k: v for k, v in item.items() if k != "input"} for item in items]
```

#### Expert

**`body`**, **`query`**, **`path`**, and **`header`** validation all funnel here—use **`request.url.path`** and **`exc.body`** (when available) for **richer** logging, mindful of **size** and **sensitivity**.

```python
@app.exception_handler(RequestValidationError)
async def validation(request: Request, exc: RequestValidationError):
    log.warning("validation failed", extra={"path": request.url.path, "errors": exc.errors()})
    return JSONResponse(status_code=422, content={"errors": exc.errors()})
```

**Key Points (17.5.1)**

- **`RequestValidationError`** wraps **Pydantic** validation issues for **HTTP** layer.
- Sanitize **error** payloads before **client** exposure.

**Best Practices (17.5.1)**

- Keep **default** behavior for **internal** APIs unless **clients** require **custom** shape.
- Add **examples** of **`422`** in **OpenAPI**.

**Common Mistakes (17.5.1)**

- Returning **raw** **`input`** containing **passwords**.
- Treating **`422`** as “**invalid JSON**”—malformed JSON may yield **different** errors.

---

### 17.5.2 Custom Error Responses

#### Beginner

Return a **consistent** top-level object for **all** validation failures.

```python
return JSONResponse(
    status_code=422,
    content={"ok": False, "error": {"kind": "validation", "issues": exc.errors()}},
)
```

#### Intermediate

Map **Pydantic** **error types** to **stable** **`code`** values clients can switch on.

```python
def to_codes(errors: list[dict]) -> list[dict]:
    out = []
    for e in errors:
        out.append({"loc": e.get("loc"), "code": e.get("type"), "message": e.get("msg")})
    return out
```

#### Expert

Attach **schema version** and **`trace_id`** for **support**. Consider returning **field** paths as **strings** (`"user.address.zip"`) for **simpler** client parsers.

```python
content = {
    "error": {
        "kind": "validation",
        "trace_id": "abc",
        "fields": {"user.address.zip": ["required field"]},
    }
}
```

**Key Points (17.5.2)**

- Custom responses should remain **machine-readable**.
- **Flattening** **`loc`** tuples is a **UX** win for some teams.

**Best Practices (17.5.2)**

- Write **contract tests** for **`422`** JSON.
- Document **migration** when changing **error** schema.

**Common Mistakes (17.5.2)**

- Losing **`loc`** entirely—clients cannot highlight **fields**.
- Inconsistent **nesting** between **`HTTPException`** and **`422`** errors.

---

### 17.5.3 Error Detail Format

#### Beginner

Default **`loc`** is a **tuple** like **`("body", "field", "nested")`** or **`("query", "q")`**.

```python
# Example error item shape (conceptual)
item = {"loc": ("body", "email"), "msg": "value is not a valid email address", "type": "value_error"}
```

#### Intermediate

Customize messages using **Pydantic** **`Field(..., json_schema_extra=...)`** is **not** the same as **`ErrorDetails`**—use **`ValidationError` customization** via **`model_config`** and **validators** for clearer **`msg`**.

```python
from pydantic import BaseModel, Field, field_validator

class User(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def email_ok(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("email must contain @")
        return v
```

#### Expert

For **public APIs**, publish a **JSON Schema** of your **normalized** error items so **clients** can codegen **parsers**.

```python
normalized = {
    "type": "array",
    "items": {
        "type": "object",
        "required": ["field", "message", "code"],
        "properties": {
            "field": {"type": "string"},
            "message": {"type": "string"},
            "code": {"type": "string"},
        },
    },
}
```

**Key Points (17.5.3)**

- **`type`** strings come from **Pydantic**—they can change across **upgrades**.
- Normalizing **reduces** **coupling** to **internal** **Pydantic** vocabulary.

**Best Practices (17.5.3)**

- Map **`type` → code`** explicitly in **one** function.
- Keep **`msg`** **human-readable**; use **`code`** for **branching**.

**Common Mistakes (17.5.3)**

- Parsing **English** **`msg`** with **regex**.
- Assuming **`loc`** is always **2-tuple**—**depth** varies.

---

### 17.5.4 Localizing Errors

#### Beginner

**FastAPI** does not auto-translate **`msg`** strings. You must **map** errors to **catalog** entries in a **handler**.

```python
CATALOG = {"value_error.email": "Correo inválido"}


def localize(errors: list[dict]) -> list[dict]:
    out = []
    for e in errors:
        key = e.get("type", "")
        msg = CATALOG.get(key, e.get("msg"))
        out.append({**e, "msg": msg})
    return out
```

#### Intermediate

Read **`Accept-Language`**, choose **best** locale, fall back to **default**.

```python
from fastapi import Request

def pick_locale(request: Request) -> str:
    header = request.headers.get("accept-language", "")
    # production: use babel/negotiate properly
    return "es" if header.lower().startswith("es") else "en"
```

#### Expert

**i18n** on **server** can drift from **client** UI strings—many teams return **`error_code` + parameters** only and let **clients** translate. If server translates, **cache** catalogs and **test** **pluralization** rules.

```python
detail = {"code": "min_length", "args": {"field": "password", "min": 8}}
```

**Key Points (17.5.4)**

- **Localization** is a **product** decision—**not** framework-default.
- **Codes + args** scale better than **server-rendered** sentences.

**Best Practices (17.5.4)**

- Avoid translating **security-sensitive** errors into **verbose** hints for attackers.
- Log **canonical** **English** internally regardless of **response** locale.

**Common Mistakes (17.5.4)**

- Returning **mixed** languages in **one** response.
- Breaking **clients** by changing **`msg`** text they **parsed**.

---

### 17.5.5 Error Documentation

#### Beginner

Use route **`responses={422: {...}}`** to document **validation error** schemas in **OpenAPI**.

```python
@app.post(
    "/items",
    responses={422: {"description": "Validation Error", "content": {"application/json": {"example": {"detail": []}}}}},
)
def create_item() -> dict[str, str]:
    return {"ok": "true"}
```

#### Intermediate

Centralize **examples** in **`openapi_components`** or **`JSON` files** loaded at startup—avoid **copy-paste** drift.

```python
VALIDATION_EXAMPLE = {"detail": [{"loc": ["body", "price"], "msg": "ensure this value is greater than 0", "type": "greater_than"}]}
```

#### Expert

Publish **external** docs portal chapters linking **`error_code` registry** ↔ **OpenAPI** ↔ **Postman** examples. For **SDKs**, export **typed** **error** classes generated from **registry**.

```python
# Conceptual: CI checks every ErrorCode enum appears in OpenAPI examples
assert set(ErrorCode) <= set(load_documented_codes())
```

**Key Points (17.5.5)**

- **Documentation** is part of the **API contract**.
- **Examples** should mirror **real** handler output **exactly**.

**Best Practices (17.5.5)**

- Include **`422`** in **every** mutating endpoint’s docs template.
- Version docs with **API** version.

**Common Mistakes (17.5.5)**

- **OpenAPI** examples **stale** after changing **exception** handlers.
- Omitting **`401/403`** docs on **secured** routes.

---

## 17.6 Advanced Error Handling

Production APIs need **cross-cutting** policies: **logging**, **metrics**, **recovery**, and **support workflows**.

### 17.6.1 Global Error Handling

#### Beginner

Combine **exception handlers** + **middleware** to ensure **every** error path shares **logging** and **headers** (for example **`X-Request-ID`**).

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get("x-request-id", "gen")
        request.state.request_id = rid
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        return response
```

#### Intermediate

Catch **unhandled** exceptions in **middleware** as **last resort** only if needed—prefer **`exception_handler(Exception)`** carefully to avoid **masking** **`HTTPException`** incorrectly.

```python
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

log = logging.getLogger(__name__)
app = FastAPI()


@app.exception_handler(Exception)
async def any_exc(request: Request, exc: Exception):
    log.exception("unhandled")
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
```

#### Expert

**Global handler** for **`Exception`** can interfere with **Starlette**’s **`HTTPException`** flow if mis-specified—register **`HTTPException`** handlers **explicitly** and **test**. Use **`BaseHTTPMiddleware`** carefully under **load** (consider **pure ASGI** middleware for hot paths).

```python
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class TimedASGIMiddleware:
    """Minimal pure-ASGI wrapper — avoids BaseHTTPMiddleware overhead on hot paths."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message: Message) -> None:
            # Example: inject header on outbound response start
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"x-app", b"fastapi-notes"))
                message = {**message, "headers": headers}
            await send(message)

        await self.app(scope, receive, send_wrapper)
```

**Key Points (17.6.1)**

- **Global** policies belong in **one** place, not **copy-pasted** routes.
- **`Exception`** handlers are **powerful** and **risky**.

**Best Practices (17.6.1)**

- Always include **request id** in **logs** and **500** JSON.
- Never enable **`debug`** in **production**.

**Common Mistakes (17.6.1)**

- Turning **all** errors into **500** accidentally.
- Logging **sensitive** bodies in **global** catch-alls.

---

### 17.6.2 Error Logging

#### Beginner

Use **`logging`** with **levels**: **`INFO`** for expected client faults (optional), **`WARNING`** for **recoverable** anomalies, **`ERROR`** for **unexpected** failures.

```python
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

log = logging.getLogger(__name__)
app = FastAPI()


class AppError(Exception):
    def __init__(self, code: str, status_code: int = 400) -> None:
        super().__init__(code)
        self.code = code
        self.status_code = status_code


@app.exception_handler(AppError)
async def log_app_errors(request: Request, exc: AppError):
    log.info("client error: %s", exc.code)
    return JSONResponse(status_code=exc.status_code, content={"code": exc.code})
```

#### Intermediate

Use **structured logging** (**JSON**) fields: **`trace_id`**, **`user_id`**, **`route`**, **`duration_ms`**.

```python
log.error(
    "unhandled",
    extra={
        "trace_id": getattr(request.state, "request_id", None),
        "path": request.url.path,
    },
    exc_info=True,
)
```

#### Expert

Sample **high-volume** **4xx** logs to **control** cost. Correlate with **OpenTelemetry** **spans**: mark **span** **ERROR** status on **exceptions** in **instrumentation**.

```python
# Pseudocode integration
# with span: span.record_exception(exc); span.set_status(ERROR)
```

**Key Points (17.6.2)**

- Logs are for **operators**, not **end users**.
- **`exc_info=True`** is essential for **debuggability**.

**Best Practices (17.6.2)**

- **Redact** **PII** at **logging** boundary.
- Use **one** **logger** name per **module** (`__name__`).

**Common Mistakes (17.6.2)**

- Logging **full** **`Authorization`** headers.
- **INFO** flooding with **every** **`422`**.

---

### 17.6.3 Error Monitoring

#### Beginner

Send **unhandled** exceptions to **Sentry** (or similar) via **SDK** integration **hooks**.

```python
# pip install sentry-sdk
# sentry_sdk.init(dsn="...", traces_sample_rate=0.1)
```

#### Intermediate

Attach **tags**: **`endpoint`**, **`release`**, **`environment`**. Use **breadcrumbs** for **HTTP** client calls **outbound**.

#### Expert

Define **SLOs** on **error rate** and **latency**; **alert** on **burn rate**. Distinguish **4xx** (often **SLI-excluded**) vs **5xx** (availability). Use **synthetic** **checks** for **critical** paths.

**Key Points (17.6.3)**

- **Monitoring** turns **logs** into **actionable** signals.
- **Sampling** balances **cost** vs **coverage**.

**Best Practices (17.6.3)**

- **PII scrubbing** in **APM** is **mandatory**.
- Track **deployment** markers with **error** spikes.

**Common Mistakes (17.6.3)**

- **Alert fatigue** from **noisy** **422** spikes caused by **bots**.
- Missing **client-side** **context** (app version) in **reports**.

---

### 17.6.4 Error Recovery

#### Beginner

For **idempotent** operations, **retry** transient failures with **backoff** in **clients**—servers should return **`503`** + **`Retry-After`** when appropriate.

```python
raise HTTPException(
    status_code=503,
    detail="Please retry",
    headers={"Retry-After": "2"},
)
```

#### Intermediate

Implement **circuit breakers** around **unreliable** dependencies to **fail fast** instead of **cascading** timeouts.

```python
class CircuitOpen(Exception):
    pass


def call_upstream() -> str:
    if breaker_is_open():
        raise CircuitOpen()
    return "ok"
```

#### Expert

For **partial** failures in **batch** APIs, return **per-item** errors with **200** + **embedded** errors only if your **API style** explicitly allows—otherwise prefer **transactional** **all-or-nothing** semantics to avoid **ambiguous** client state.

```python
return {
    "results": [
        {"id": "1", "ok": True},
        {"id": "2", "ok": False, "error": {"code": "conflict"}},
    ]
}
```

**Key Points (17.6.4)**

- Recovery strategies depend on **idempotency** and **consistency** model.
- **Retries** on **non-idempotent** **POST** can **duplicate** side effects.

**Best Practices (17.6.4)**

- Document **which** errors are **retryable**.
- Use **timeouts** everywhere you **`await`** **I/O**.

**Common Mistakes (17.6.4)**

- Infinite **retry** loops hammering **downstream** systems.
- Returning **200** when **half** the **batch** failed without **clear** **client** guidance.

---

### 17.6.5 Error Reporting

#### Beginner

Return an **`error_id`** to users and store **details** server-side for **support** lookup.

```python
import uuid
from fastapi import HTTPException

eid = str(uuid.uuid4())
raise HTTPException(status_code=500, detail={"error_id": eid, "message": "Unexpected error"})
```

#### Intermediate

Provide **`/support`** runbooks: what **`error_id`** means, retention, GDPR **deletion** implications.

#### Expert

For **regulated** environments, ensure **error reports** exclude **protected** data and **support** tooling enforces **access** controls + **audit** trails.

**Key Points (17.6.5)**

- **Opaque ids** protect **users** while enabling **support**.
- **Retention** policy applies to **stored** error **payloads**.

**Best Practices (17.6.5)**

- Link **`error_id`** to **structured** log **records**.
- Train **support** staff on **interpreting** **codes** vs **messages**.

**Common Mistakes (17.6.5)**

- **`error_id`** not actually **queryable** in logs.
- Storing **passwords** in **error** **report** databases.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- **Python exceptions** and **HTTP errors** are related but **not identical**—translate at **boundaries**.
- **`HTTPException`** is the **default** client error mechanism; **handlers** unify **response shape**.
- **`RequestValidationError`** powers **`422`**—treat it as **public contract** when customized.
- **Global** policies (**ids**, **logging**, **security**) should be **centralized**.

### Chapter Best Practices

- Prefer **specific** exceptions internally; map once to **HTTP** via **handlers**.
- Standardize **error JSON** (include **`code`**, **`message`**, optional **`fields`**).
- Log **tracebacks** server-side; return **safe**, **minimal** **details** to clients.
- Document **errors** in **OpenAPI** with **accurate** examples.

### Chapter Common Mistakes

- Using **`200 OK`** for failures or **mixing** error shapes across routes.
- Leaking **stack traces**, **SQL**, or **secrets** in **responses**.
- Over-broad **`except Exception`** that **hides** bugs or **breaks** **`HTTPException`** handling.
- Changing **`422`** schema without a **client** migration plan.
