# HTTP Headers in FastAPI

## 📑 Table of Contents

- [9.1 Response Headers](#91-response-headers)
  - [9.1.1 Adding Custom Headers](#911-adding-custom-headers)
  - [9.1.2 Standard Headers](#912-standard-headers)
  - [9.1.3 Cache Control Headers](#913-cache-control-headers)
  - [9.1.4 Security Headers](#914-security-headers)
  - [9.1.5 Custom Headers](#915-custom-headers)
- [9.2 Request Headers](#92-request-headers)
  - [9.2.1 Reading Request Headers](#921-reading-request-headers)
  - [9.2.2 Header Type Conversion](#922-header-type-conversion)
  - [9.2.3 Optional Headers](#923-optional-headers)
  - [9.2.4 Header Validation](#924-header-validation)
  - [9.2.5 Case-Insensitive Headers](#925-case-insensitive-headers)
- [9.3 Header Validation](#93-header-validation)
  - [9.3.1 Required Headers](#931-required-headers)
  - [9.3.2 Optional Headers](#932-optional-headers)
  - [9.3.3 Header Values Validation](#933-header-values-validation)
  - [9.3.4 Pattern Matching](#934-pattern-matching)
  - [9.3.5 Custom Validators](#935-custom-validators)
- [9.4 Common Headers](#94-common-headers)
  - [9.4.1 Content-Type](#941-content-type)
  - [9.4.2 Authorization](#942-authorization)
  - [9.4.3 X-Token](#943-x-token)
  - [9.4.4 Accept-Language](#944-accept-language)
  - [9.4.5 User-Agent](#945-user-agent)
- [9.5 Advanced Header Usage](#95-advanced-header-usage)
  - [9.5.1 Header Parameters in Documentation](#951-header-parameters-in-documentation)
  - [9.5.2 Multiple Values in Headers](#952-multiple-values-in-headers)
  - [9.5.3 Header Aliases](#953-header-aliases)
  - [9.5.4 Deprecated Headers](#954-deprecated-headers)
  - [9.5.5 Header Best Practices](#955-header-best-practices)
- [9.6 CORS and Headers](#96-cors-and-headers)
  - [9.6.1 Access-Control Headers](#961-access-control-headers)
  - [9.6.2 Preflight Requests](#962-preflight-requests)
  - [9.6.3 Custom CORS Headers](#963-custom-cors-headers)
  - [9.6.4 Header Exposure](#964-header-exposure)
  - [9.6.5 Security Headers](#965-security-headers)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 9.1 Response Headers

Response headers travel from **server to client** after a path operation. They carry **metadata** about the body, **caching**, **security**, and **protocol** negotiation.

### 9.1.1 Adding Custom Headers

#### Beginner

Inject **`Response`** and mutate **`response.headers`** before returning, or return **`JSONResponse`** with a **`headers`** dict.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/with-headers")
def with_headers(response: Response) -> dict[str, str]:
    response.headers["X-Request-Id"] = "abc-123"
    return {"ok": "yes"}
```

#### Intermediate

Header values must be **strings** (or types coerced per Starlette). For multiple **`Set-Cookie`**-style semantics, use **`Response.set_cookie`** rather than raw header duplication mistakes.

#### Expert

Use **`MutableHeaders`** behavior carefully: some headers are **hop-by-hop** (`Connection`). Reverse proxies may **strip** or **overwrite** headers—document **ingress** expectations for platform teams.

```python
from fastapi.responses import JSONResponse

@app.get("/json-headers")
def json_headers() -> JSONResponse:
    return JSONResponse(
        content={"v": 1},
        headers={"X-Build": "2026.03.28"},
    )
```

**Key Points (9.1.1)**

- **`Response`** parameter gives **mutable** headers map.
- **`JSONResponse`** accepts **`headers=`** at construction.
- Values are ultimately **byte strings** on the wire (latin-1 constraints historically).

**Best Practices (9.1.1)**

- Prefix **custom** headers with **`X-`** only when needed; some orgs prefer **vendor** prefixes (`X-Acme-`).
- Propagate **request IDs** from **incoming** to **outgoing** headers for tracing.

**Common Mistakes (9.1.1)**

- Returning **`Response`** and also **decorator `response_model`** without understanding **serialization** order.
- Non-ASCII header values without **encoding** policy (RFC 5987 for filenames).

---

### 9.1.2 Standard Headers

#### Beginner

Standard headers include **`Content-Type`**, **`Content-Length`**, **`Date`**, **`Server`**, **`ETag`**, **`Location`**. FastAPI/Starlette sets many **automatically** when you return JSON or files.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/auto")
def auto() -> dict[str, bool]:
    return {"json": True}  # Content-Type: application/json (typically)
```

#### Intermediate

Override **`Content-Type`** when returning **`PlainTextResponse`**, **`HTMLResponse`**, or **`Response`** with **custom** bodies.

#### Expert

**`Transfer-Encoding: chunked`** appears for **streaming** without known length—intermediaries behave differently vs **`Content-Length`**. HTTP/2 **multiplexing** changes **header** compression but not **semantic** rules.

```python
from fastapi.responses import PlainTextResponse

@app.get("/text", response_class=PlainTextResponse)
def text() -> str:
    return "hello"
```

**Key Points (9.1.2)**

- Let the **framework** set **defaults** when possible.
- **Manual** overrides should match **actual** bytes returned.
- **`Date`** is often added by **ASGI servers**.

**Best Practices (9.1.2)**

- Align **`Content-Type`** with **`charset=utf-8`** for text when non-ASCII appears.
- Use **`Location`** with **`201`** and **`3xx`** consistently.

**Common Mistakes (9.1.2)**

- **`application/json`** body that is **not** valid JSON.
- Wrong **`Content-Type`** on **file downloads**, breaking **browser** behavior.

---

### 9.1.3 Cache Control Headers

#### Beginner

**`Cache-Control`** directs browsers and CDNs (e.g., `no-store`, `max-age=60`, `private`).

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/public-data")
def public_data(response: Response) -> dict[str, int]:
    response.headers["Cache-Control"] = "public, max-age=300"
    return {"value": 42}
```

#### Intermediate

**`ETag`** + **`If-None-Match`** enables **304 Not Modified** flows—implement in dependencies or route logic for **heavy** GET handlers.

#### Expert

**`Vary`** must list headers that **change** representation (`Accept-Encoding`, `Accept-Language`, `Authorization`). Mis-**Vary** causes **cache poisoning** or **bloat**.

```python
response.headers["Cache-Control"] = "private, no-store"
response.headers["Vary"] = "Authorization, Accept-Encoding"
```

**Key Points (9.1.3)**

- **`private`** vs **`public`** is a **privacy** and **CDN** policy decision.
- **`no-store`** for **sensitive** data endpoints.
- **`Vary`** coordinates **content negotiation** with **caches**.

**Best Practices (9.1.3)**

- Document **which GETs** are **cacheable** in OpenAPI **descriptions**.
- Use **`s-maxage`** for **CDN-only** TTL when applicable.

**Common Mistakes (9.1.3)**

- **Public** caching of **authenticated** JSON.
- Omitting **`Vary`** when **`Accept`** drives **different** response shapes.

---

### 9.1.4 Security Headers

#### Beginner

Common **defense-in-depth** headers: **`X-Content-Type-Options: nosniff`**, **`X-Frame-Options`** or **`Content-Security-Policy`**, **`Referrer-Policy`**, **`Permissions-Policy`**.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.get("/sec")
def sec() -> dict[str, str]:
    return {"ok": "yes"}
```

#### Intermediate

**`Strict-Transport-Security`** (HSTS) belongs at **TLS termination** (CDN/load balancer) for **first-hit** protection; APIs may still set it for **direct** clients.

#### Expert

**CSP** for **APIs** is less common than for **HTML**, but **hybrid** endpoints (Swagger UI) need **careful** CSP to mitigate **XSS** in **docs** pages.

```python
response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
```

**Key Points (9.1.4)**

- Security headers complement **input validation**, not replace it.
- **Middleware** centralizes **policy** across routes.
- **Misconfigured** CSP can **break** **Swagger**/**ReDoc**.

**Best Practices (9.1.4)**

- Use **security.txt** and **standard** headers per **OWASP** guidance.
- Test headers with **securityheaders.com** or **curl -I** in **staging**.

**Common Mistakes (9.1.4)**

- Copy-pasting **huge** CSP without **nonce** strategy for **inline** docs assets.
- Setting **HSTS** on **HTTP** endpoints accidentally.

---

### 9.1.5 Custom Headers

#### Beginner

**Custom** headers communicate **product** metadata: **`X-RateLimit-Remaining`**, **`X-Api-Version`**, **`X-Trace-Id`**.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/quota")
def quota(response: Response) -> dict[str, int]:
    response.headers["X-RateLimit-Remaining"] = "42"
    return {"n": 1}
```

#### Intermediate

Prefer **registered** headers when they exist (**`Deprecation`**, **`Sunset`**, **`Link`**). Custom names should avoid **colliding** with future **standards**.

#### Expert

**IANA** **Permanent Message Header Field Names** registry evolves—audit **custom** headers yearly. For **internal** meshes, **W3C** **Trace Context** (`traceparent`) beats ad-hoc **`X-Request-Id`** alone when possible.

```python
response.headers["Deprecation"] = "true"
response.headers["Sunset"] = "Sat, 01 Nov 2026 00:00:00 GMT"
```

**Key Points (9.1.5)**

- **Custom** headers are **contracts**—version them with care.
- **`Deprecation`** headers signal **client** migrations.
- **Tracing** headers should follow **open standards** when feasible.

**Best Practices (9.1.5)**

- Publish a **header dictionary** for **partner** docs.
- Keep **values** **ASCII** when possible for **interoperability**.

**Common Mistakes (9.1.5)**

- **Typos** in header names (`X-Request-ID` vs **`X-Request-Id`**) breaking **middleware** joins.
- **Unbounded** custom header cardinality at **proxies** (logging costs).

---

## 9.2 Request Headers

Request headers arrive from **clients** (browsers, mobile apps, services). FastAPI exposes them via **`Header()`** parameters and the raw **`Request`** object.

### 9.2.1 Reading Request Headers

#### Beginner

Import **`Header`** from **`fastapi`** and declare a parameter with **`Header()`** as the default. The parameter name is normalized to a header name (underscores become hyphens).

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/who")
def who(user_agent: Annotated[str | None, Header()] = None) -> dict[str, str | None]:
    return {"user_agent": user_agent}
```

#### Intermediate

For **non-standard** casing or names, use **`Header(alias="X-Custom")`**. Multiple headers with the same name are **combined** per HTTP rules—Starlette exposes **lists** in **`Request.headers.getlist`** when needed.

#### Expert

**`Request.headers`** is a **`Headers`** object (case-insensitive mapping). For **performance**-critical paths, avoid repeated parsing—read once in a **dependency** and cache on **`request.state`**.

```python
from fastapi import FastAPI, Request

app = FastAPI()


@app.get("/raw")
def raw(request: Request) -> dict[str, str | None]:
    return {"accept": request.headers.get("accept")}
```

**Key Points (9.2.1)**

- **`Header()`** integrates with **OpenAPI** as a **parameter**.
- Underscores in **Python** names map to **hyphenated** HTTP names by default.
- **`Request`** offers **escape hatches** for unusual cases.

**Best Practices (9.2.1)**

- Prefer **`Annotated[..., Header()]`** style (PEP 593) for clarity.
- Log **sanitized** header snapshots in **debug** tooling only.

**Common Mistakes (9.2.1)**

- Expecting **`Authorization`** to appear when **`HTTPBearer`** already consumed it.
- Confusing **missing** header with **empty string**.

---

### 9.2.2 Header Type Conversion

#### Beginner

Annotate types like **`int`**, **`bool`**, or **`UUID`**—FastAPI/Starlette will **coerce** string header values when possible.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/page")
def page(x_page: Annotated[int, Header()]) -> dict[str, int]:
    return {"page": x_page}
```

#### Intermediate

**Boolean** headers: only some values are accepted as **true/false** per Starlette’s rules—**test** edge cases (`"1"`, `"true"`, `"yes"`).

#### Expert

For **complex** structured headers (**`Accept`**, **`WWW-Authenticate`**), parse manually or use **specialized** libraries; do not over-trust naive **split** logic for **quoted strings**.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/flag")
def flag(debug: Annotated[bool, Header()] = False) -> dict[str, bool]:
    return {"debug": debug}
```

**Key Points (9.2.2)**

- **Type coercion** follows framework rules—**verify** with tests.
- **Complex** headers need **custom** parsers.
- **Invalid** coercion yields **422** for **`Header`** params.

**Best Practices (9.2.2)**

- Prefer **explicit** string types + **validator** for **high-stakes** headers.
- Document **accepted** boolean string forms in **OpenAPI** `description`.

**Common Mistakes (9.2.2)**

- Using **`float`** for **monetary** or **precision** values in headers.
- Assuming **case** sensitivity for **coercion** of **enums**.

---

### 9.2.3 Optional Headers

#### Beginner

Provide **`None`** defaults or use **`Optional[...]`** so missing headers do not trigger **422**.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/opt")
def opt(x_opt: Annotated[str | None, Header()] = None) -> dict[str, str | None]:
    return {"x_opt": x_opt}
```

#### Intermediate

Distinguish **absent** vs **empty** header: **`Header()`** may receive **`""`**—business logic may treat differently.

#### Expert

Use **`Header(convert_underscores=False)`** when you need **exact** header names matching **legacy** clients with **underscores** (rare and non-standard).

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/legacy")
def legacy(x_legacy_token: Annotated[str | None, Header(alias="X-Legacy-Token")] = None) -> dict:
    return {"has": x_legacy_token is not None}
```

**Key Points (9.2.3)**

- **Optional** headers enable **progressive** client upgrades.
- **`None`** means **missing** in typical FastAPI usage.
- **Aliases** clarify **wire** names vs **Python** identifiers.

**Best Practices (9.2.3)**

- Default **sensible** behavior when header **omitted**.
- Version **new** optional headers in **changelog**.

**Common Mistakes (9.2.3)**

- Marking header **optional** but later **assuming** it exists (AttributeError).
- Using **`Optional`** without **`= None`** default correctly.

---

### 9.2.4 Header Validation

#### Beginner

Combine **`Header()`** with **`Annotated`** constraints via **`Query`-style** `ge`/`le` on strings using **`Field`** from Pydantic in newer FastAPI patterns, or validate manually.

```python
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

app = FastAPI()


@app.get("/tenant")
def tenant(x_tenant: Annotated[str, Header()]) -> dict[str, str]:
    if not x_tenant.isalnum():
        raise HTTPException(status_code=400, detail="invalid tenant header")
    return {"tenant": x_tenant}
```

#### Intermediate

Prefer **`Pattern`** constraints (Pydantic v2) on a **wrapper** type or use **`Annotated[str, StringConstraints(pattern=...)]`** depending on your Python/FastAPI versions.

#### Expert

Centralize **header validation** in **`Depends()`** dependencies reusable across routers—keeps path operations **thin** and tests **focused**.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()


def require_tenant(x_tenant: Annotated[str, Header()]) -> str:
    if len(x_tenant) > 64:
        raise HTTPException(status_code=400, detail="tenant too long")
    return x_tenant


@app.get("/t")
def t(tenant: Annotated[str, Depends(require_tenant)]) -> dict[str, str]:
    return {"tenant": tenant}
```

**Key Points (9.2.4)**

- **422** arises from **type** validation failures automatically.
- **Domain** rules may still need **explicit** **`HTTPException(400)`**.
- **Dependencies** promote **DRY** validation.

**Best Practices (9.2.4)**

- Return **machine-readable** error **codes** in **`detail`** for bad headers.
- Unit-test **dependency** functions independently.

**Common Mistakes (9.2.4)**

- Validating only in **one** route while **sub-routers** forget the dependency.
- **Regex** **DoS** on **user-controlled** header values—cap **length** first.

---

### 9.2.5 Case-Insensitive Headers

#### Beginner

HTTP header **names** are **case-insensitive**. Starlette’s **`Headers`** object handles lookups case-insensitively.

```python
from fastapi import FastAPI, Request

app = FastAPI()


@app.get("/case")
def case(request: Request) -> dict[str, str | None]:
    # These are equivalent lookups conceptually
    a = request.headers.get("X-Test")
    b = request.headers.get("x-test")
    return {"a": a, "b": b}
```

#### Intermediate

**`Header()`** parameters document **canonical** casing in OpenAPI; clients may send any casing.

#### Expert

When **logging** raw headers for **debug**, normalize keys to **lowercase** before **aggregation** to avoid **duplicate** metrics labels.

```python
normalized = {k.lower(): v for k, v in request.headers.items()}
```

**Key Points (9.2.5)**

- **Never** rely on **specific** casing from **clients**.
- **OpenAPI** may display **preferred** casing for **docs** only.
- **Normalization** helps **security** audits.

**Best Practices (9.2.5)**

- Compare **sensitive** tokens using **constant-time** functions when feasible.
- Avoid **case-sensitive** dict keys in **custom** middleware.

**Common Mistakes (9.2.5)**

- Building **signatures** over headers with **wrong** canonicalization.
- **Duplicated** processing when both **`Header()`** and **`Request`** read same value inconsistently.

---

## 9.3 Header Validation

Validation ensures **malformed** or **malicious** header input fails fast with **clear** errors.

### 9.3.1 Required Headers

#### Beginner

Declare a **`Header()`** parameter **without** a default (non-optional type). Missing header → **422 Unprocessable Entity**.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/need")
def need(x_api_key: Annotated[str, Header()]) -> dict[str, str]:
    return {"key_prefix": x_api_key[:4]}
```

#### Intermediate

Use **`min_length`** / **`max_length`** via Pydantic **`Field`** in **`Annotated`** compositions supported by your FastAPI version.

#### Expert

For **API keys**, also enforce **HTTPS** at the **edge** and **rotate** keys—header presence ≠ **security**.

```python
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

app = FastAPI()


@app.get("/key")
def key(x_api_key: Annotated[str, Header()]) -> dict[str, int]:
    if len(x_api_key) < 8:
        raise HTTPException(status_code=422, detail="X-Api-Key too short")
    return {"len": len(x_api_key)}
```

**Key Points (9.3.1)**

- **Required** headers enforce **contract** at the **HTTP** layer.
- **422** documents **validation** problems clearly in OpenAPI clients.
- Pair with **TLS** and **authz** for **secrets**.

**Best Practices (9.3.1)**

- Name required headers **`X-Api-Key`** or standard **`Authorization`** consistently.
- Avoid **too many** required headers per request—**friction** for clients.

**Common Mistakes (9.3.1)**

- Using **required** headers for **optional** features—prefer **query** or **body** when appropriate.
- **Leaking** full **API keys** in **logs** when validation fails.

---

### 9.3.2 Optional Headers

#### Beginner

Use **`str | None`**, default **`None`**, or **`Optional[str] = None`** with **`Header()`**.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/feat")
def feat(x_beta: Annotated[str | None, Header()] = None) -> dict[str, bool]:
    return {"beta": x_beta == "on"}
```

#### Intermediate

**Feature flags** via headers allow **gradual** rollout—ensure **CDN** **`Vary`** includes flag headers when responses differ.

#### Expert

**Optional** auth headers (`Authorization` absent) should route to **guest** mode explicitly—don’t conflate with **invalid** token (**401**).

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/maybe-auth")
def maybe_auth(
    authorization: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    return {"mode": "auth" if authorization else "anon"}
```

**Key Points (9.3.2)**

- **Optional** headers enable **backward** compatible upgrades.
- **Vary** header coordination prevents **wrong** cached variants.
- **Auth** absence is not automatically **error**.

**Best Practices (9.3.2)**

- Document **default** behavior when header **omitted**.
- Integration-test **both** paths.

**Common Mistakes (9.3.2)**

- Returning **500** when optional header missing due to **code** assumptions.
- Forgetting **`Vary`** when optional header changes **JSON** shape.

---

### 9.3.3 Header Values Validation

#### Beginner

Validate **allowed** values with **`if`** checks or **`enum.Enum`** string enums.

```python
from enum import Enum
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

app = FastAPI()


class Theme(str, Enum):
    light = "light"
    dark = "dark"


@app.get("/ui")
def ui(x_theme: Annotated[str, Header()]) -> dict[str, str]:
    if x_theme not in {t.value for t in Theme}:
        raise HTTPException(status_code=400, detail="invalid theme")
    return {"theme": x_theme}
```

#### Intermediate

Where FastAPI supports **typing** `Literal["light","dark"]` for headers, prefer that for **OpenAPI** **enum** documentation.

#### Expert

**Locale** tags and **media** types need **structured** parsing—use **`babel`** or **`email.message`** patterns for **robustness**.

```python
from typing import Literal, Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/mode")
def mode(x_mode: Annotated[Literal["on", "off"], Header()]) -> dict[str, str]:
    return {"mode": x_mode}
```

**Key Points (9.3.3)**

- **Enums** and **Literal** improve **docs** and **validation**.
- **Custom** parsers belong in **dependencies** when complex.
- Reject **unknown** values with **400** when not **422**-eligible.

**Best Practices (9.3.3)**

- Keep **allowed** sets **small** and **documented**.
- Version **new** enum values safely.

**Common Mistakes (9.3.3)**

- Case-sensitive **string** compare for **protocol** headers that are **case-insensitive** by spec.
- **Silently** ignoring invalid values—better **explicit** **error**.

---

### 9.3.4 Pattern Matching

#### Beginner

Use **regex** checks for **structured** tokens (e.g., **UUID**, **semver**).

```python
import re
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

app = FastAPI()

UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.I,
)


@app.get("/trace")
def trace(x_trace_id: Annotated[str, Header()]) -> dict[str, str]:
    if not UUID_RE.match(x_trace_id):
        raise HTTPException(status_code=400, detail="trace id must be UUID")
    return {"trace_id": x_trace_id}
```

#### Intermediate

**Pre-compile** regexes at **module** import for **performance**.

#### Expert

**ReDoS** risk: keep patterns **linear**; cap **input length** before **regex**.

```python
if len(x_trace_id) > 64:
    raise HTTPException(status_code=400, detail="trace id too long")
```

**Key Points (9.3.4)**

- **Patterns** encode **format** contracts.
- **Compile** once, **execute** many.
- **Length** limits precede **heavy** validation.

**Best Practices (9.3.4)**

- Prefer **`UUID` type** coercion when **simple** UUID strings suffice.
- Log **validation** failures with **rate limiting** to avoid **log spam** attacks.

**Common Mistakes (9.3.4)**

- **Complex** regex without **tests** for **edge** cases.
- **Unicode** surprises in **header** values—normalize policy.

---

### 9.3.5 Custom Validators

#### Beginner

Wrap validation in a **`Depends()`** function raising **`HTTPException`** on failure.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()


def valid_version(x_api_version: Annotated[str, Header()]) -> str:
    if not x_api_version.startswith("v"):
        raise HTTPException(status_code=400, detail="version must start with v")
    return x_api_version


@app.get("/v")
def v(ver: Annotated[str, Depends(valid_version)]) -> dict[str, str]:
    return {"api_version": ver}
```

#### Intermediate

Return **parsed** **dataclasses** from dependencies for **rich** context (version **tuple**, **tenant** object).

#### Expert

Compose **validators** with **cached** **TTL** lookups (e.g., **tenant exists**) using **`lru_cache`** or **Redis**—watch **staleness** vs **availability**.

```python
from dataclasses import dataclass

@dataclass
class Tenant:
    id: str


def load_tenant(x_tenant: Annotated[str, Header()]) -> Tenant:
    return Tenant(id=x_tenant)
```

**Key Points (9.3.5)**

- **Dependencies** are **reusable** validators.
- Return **strong types** beyond **strings** when useful.
- **IO** in validators affects **latency**—cache wisely.

**Best Practices (9.3.5)**

- Keep validators **pure** when possible for **unit** tests.
- **Timeout** external **lookup** calls.

**Common Mistakes (9.3.5)**

- **Hidden IO** in validators causing **spiky** latency.
- **Circular** **Depends** graphs.

---

## 9.4 Common Headers

These headers appear in **most** production APIs; knowing their **semantics** prevents **subtle** bugs.

### 9.4.1 Content-Type

#### Beginner

**`Content-Type`** declares **media type** of the **body** (`application/json`, `multipart/form-data`, etc.). FastAPI sets it for **JSONResponse** and **HTMLResponse**.

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


@app.get("/ct")
def ct() -> JSONResponse:
    return JSONResponse(content={"a": 1}, media_type="application/json")
```

#### Intermediate

For **`multipart`**, boundaries are **generated** automatically by **UploadFile** handling—do not **hand-craft** unless expert.

#### Expert

**`charset`** parameter matters for **text** bodies; **`application/json`** typically **UTF-8** without **BOM**. **RFC 9110** discourages **charset** for **JSON** but **clients** vary.

```python
from fastapi.responses import PlainTextResponse

@app.get("/txt")
def txt() -> PlainTextResponse:
    return PlainTextResponse("héllo", media_type="text/plain; charset=utf-8")
```

**Key Points (9.4.1)**

- **Request** **`Content-Type`** drives **body** parsing in FastAPI.
- **Mismatch** → **422** or **unsupported media type** (415) patterns.
- **Response** **`Content-Type`** must match **bytes** sent.

**Best Practices (9.4.1)**

- Reject **unexpected** **`Content-Type`** on **POST** with clear **errors**.
- Document **accepted** types in OpenAPI (`requestBody.content`).

**Common Mistakes (9.4.1)**

- Clients sending **`text/plain`** JSON and expecting **automatic** parsing.
- **`application/json`** with **form** body.

---

### 9.4.2 Authorization

#### Beginner

**`Authorization`** carries **credentials** (`Bearer <token>`, `Basic ...`). FastAPI **`HTTPBearer`**, **`OAuth2PasswordBearer`**, etc., read this header via **security** dependencies.

```python
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()


@app.get("/auth")
def auth(creds: Annotated[HTTPAuthorizationCredentials, Depends(bearer)]) -> dict[str, str]:
    return {"scheme": creds.scheme, "token_prefix": creds.credentials[:4]}
```

#### Intermediate

**`WWW-Authenticate`** challenge headers accompany **401** responses in **OAuth2** flows.

#### Expert

**`Authorization`** may be **stripped** by **misconfigured** proxies—ensure **allowlists** preserve it. **mTLS** and **JWT** change **threat** models—never **log** raw tokens.

```python
raise HTTPException(
    status_code=401,
    detail="Invalid token",
    headers={"WWW-Authenticate": "Bearer"},
)
```

**Key Points (9.4.2)**

- **`HTTPBearer`** focuses on **`Bearer`** tokens.
- **401** + **`WWW-Authenticate`** is **standard** for **auth** challenges.
- **Secrets** never belong in **logs** or **error** messages.

**Best Practices (9.4.2)**

- Use **short-lived** tokens + **refresh** flows for **web** clients.
- Validate **issuer**, **audience**, **exp** for **JWT**.

**Common Mistakes (9.4.2)**

- Parsing **Authorization** manually **and** using **`HTTPBearer`** twice inconsistently.
- Returning **403** when **401** is correct for **missing** credentials.

---

### 9.4.3 X-Token

#### Beginner

Some APIs use **`X-Token`** or **`X-API-Key`** instead of **`Authorization`**. Read with **`Header(alias="X-Token")`**.

```python
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

app = FastAPI()


@app.get("/xt")
def xt(x_token: Annotated[str | None, Header()] = None) -> dict[str, bool]:
    if x_token != "secret":
        raise HTTPException(status_code=401, detail="bad token")
    return {"ok": True}
```

#### Intermediate

**OAuth2** and **API keys** serve different **threat** models—prefer **standard** **`Authorization`** for **OAuth** bearer tokens.

#### Expert

**`X-Api-Key`** often bypasses **browser** **CORS** **preflight** complexity compared to **custom** **`Authorization`** in some setups—**security** review still required.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/keyhdr")
def keyhdr(x_api_key: Annotated[str, Header(alias="X-Api-Key")]) -> dict[str, int]:
    return {"len": len(x_api_key)}
```

**Key Points (9.4.3)**

- **Custom** token headers are **common** for **simple** integrations.
- **Aliases** map Python names to **wire** names.
- Treat **keys** as **secrets**.

**Best Practices (9.4.3)**

- Rotate **keys** and support **multiple** active keys during **rotation**.
- Rate-limit **invalid** key attempts.

**Common Mistakes (9.4.3)**

- Sending **keys** in **query strings** (logged in **referrers**).
- **Plaintext** keys in **git** repos.

---

### 9.4.4 Accept-Language

#### Beginner

**`Accept-Language`** expresses **locale** preferences (`en-US,en;q=0.9`). Parse to choose **message** language.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/hello")
def hello(accept_language: Annotated[str | None, Header()] = None) -> dict[str, str]:
    lang = "en"
    if accept_language and accept_language.lower().startswith("es"):
        lang = "es"
    return {"msg": "hola" if lang == "es" else "hello"}
```

#### Intermediate

Proper **negotiation** uses **quality values** (`q=`)—libraries like **`babel`** help select **best** match from **supported** locales.

#### Expert

**`Content-Language`** response header should reflect **actual** language of **error** messages—helps **accessibility** tooling.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/localized")
def localized(response: Response) -> dict[str, str]:
    response.headers["Content-Language"] = "en-US"
    return {"note": "Language header set"}
```

**Key Points (9.4.4)**

- **i18n** is **product** complexity—headers are just **hints**.
- **`Content-Language`** documents **response** language.
- **`Vary: Accept-Language`** needed when **caching** localized **JSON**.

**Best Practices (9.4.4)**

- Keep **default** locale **explicit** in docs.
- Avoid **per-header** **SQL** lookups without **caching**.

**Common Mistakes (9.4.4)**

- Ignoring **`q`** weights and taking **first** tag only.
- **Caching** localized responses without **`Vary`**.

---

### 9.4.5 User-Agent

#### Beginner

**`User-Agent`** identifies **client** software. Useful for **telemetry** and **compat** shims—**never** for **security** decisions alone.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/ua")
def ua(user_agent: Annotated[str | None, Header()] = None) -> dict[str, str | None]:
    return {"user_agent": user_agent}
```

#### Intermediate

**Bots** and **scripts** often set **generic** **`User-Agent`**—**rate limit** by **identity**, not **UA** alone.

#### Expert

**Privacy** regulations may classify **UA** as **personal data** when combined with **IPs**—minimize **storage** and **pseudonymize**.

```python
# Pseudonymize for analytics (illustrative)
import hashlib

def bucket_ua(ua: str) -> str:
    return hashlib.sha256(ua.encode()).hexdigest()[:12]
```

**Key Points (9.4.5)**

- **`User-Agent`** is **spoofable**.
- Useful for **debugging** and **gradual** deprecation of **old** clients.
- **Privacy** implications for **logging**.

**Best Practices (9.4.5)**

- Treat **UA** as **untrusted** **metadata**.
- Prefer **API version** headers or **URL** versioning over **UA** sniffing.

**Common Mistakes (9.4.5)**

- Blocking **integrations** based on **UA** substring **matches** (fragile).
- **Storing** raw **UA** indefinitely without **policy**.

---

## 9.5 Advanced Header Usage

Advanced patterns cover **OpenAPI** fidelity, **multiple** header values, **aliases**, **deprecation**, and **operational** discipline.

### 9.5.1 Header Parameters in Documentation

#### Beginner

**`Header()`** parameters appear in **Swagger UI** automatically with **in: header**. Add **`description`** via **`Field`** or parameter **docstrings** depending on version.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/docd")
def docd(
    x_client: Annotated[str, Header(description="Partner client identifier")],
) -> dict[str, str]:
    return {"client": x_client}
```

#### Intermediate

Use **`openapi_examples`** on parameters when supported to show **sample** header values.

#### Expert

For **global** headers (e.g., **tenant**), define **`dependencies=[Depends(...)]`** on **`APIRouter`** and **document** once in **top-level** API **description** to avoid **repetition**.

```python
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException

app = FastAPI()


def require_tenant(x_tenant: Annotated[str, Header()]) -> str:
    if not x_tenant:
        raise HTTPException(status_code=400, detail="X-Tenant required")
    return x_tenant


router = APIRouter(prefix="/tenanted", dependencies=[Depends(require_tenant)])


@router.get("/items")
def items() -> dict[str, str]:
    return {"scope": "tenant-scoped"}
```

**Key Points (9.5.1)**

- **OpenAPI** **header** params power **client** codegen.
- **Descriptions** reduce **support** tickets.
- **Router-level** dependencies reduce **duplication**.

**Best Practices (9.5.1)**

- Mark **required** vs **optional** clearly in **docs**.
- Provide **examples** mirroring **real** integrator strings.

**Common Mistakes (9.5.1)**

- **Undocumented** **required** headers breaking **SDK** users.
- **Mismatch** between **docs** and **`Depends`** enforcement.

---

### 9.5.2 Multiple Values in Headers

#### Beginner

Some headers allow **comma-separated** lists (**`Accept`**, **`Cache-Control`**). **`Request.headers.getlist`** can retrieve **multiple** instances if duplicates exist.

```python
from fastapi import FastAPI, Request

app = FastAPI()


@app.get("/acc")
def acc(request: Request) -> dict[str, list[str]]:
    return {"accept": request.headers.getlist("accept")}
```

#### Intermediate

**`Set-Cookie`** is special—use **`Response.set_cookie`** multiple times rather than manual **joining**.

#### Expert

**`Forwarded`**, **`X-Forwarded-For`** parsing must handle **lists** and **quoting** carefully behind **proxies**—prefer **structured** **`Forwarded`** when you control **ingress**.

```python
xff = request.headers.get("x-forwarded-for", "")
ips = [ip.strip() for ip in xff.split(",") if ip.strip()]
```

**Key Points (9.5.2)**

- **List** headers are **not** always **CSV**—read **RFC** per header.
- **Proxies** append **values**—take **trusted** **client IP** from **right** position per **your** topology.
- **Cookies** are **not** simple **CSV**.

**Best Practices (9.5.2)**

- Centralize **forwarded** header parsing in **middleware**.
- **Trust boundary** only at **verified** proxy hops.

**Common Mistakes (9.5.2)**

- Using **first** **`X-Forwarded-For`** entry as **client** on **untrusted** chains.
- Splitting **`User-Agent`** on **commas** incorrectly.

---

### 9.5.3 Header Aliases

#### Beginner

**`Header(alias="X-Custom-Name")`** maps a **Python** parameter name to a **different** HTTP header name.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/alias")
def alias(x_req: Annotated[str, Header(alias="X-Request-ID")]) -> dict[str, str]:
    return {"id": x_req}
```

#### Intermediate

Without **alias**, **`x_request_id`** maps to **`x-request-id`** automatically—aliases override defaults.

#### Expert

**`convert_underscores=False`** allows **non-standard** underscore headers for **legacy** systems—avoid in **new** **public** APIs.

```python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/legacy2")
def legacy2(
    weird: Annotated[str, Header(alias="X_Weird_Legacy", convert_underscores=False)],
) -> dict[str, str]:
    return {"weird": weird}
```

**Key Points (9.5.3)**

- **Aliases** decouple **Python** naming from **HTTP** naming.
- **Defaults** convert **underscores** to **hyphens**.
- **Legacy** flags exist but are **sharp-edged**.

**Best Practices (9.5.3)**

- Prefer **hyphenated** standard **HTTP** header **styles**.
- Document **aliases** in **partner** PDFs / portals.

**Common Mistakes (9.5.3)**

- **Forgetting** **`alias`** and wondering why **`X-My-Header`** is not bound.
- **Typos** in **alias** strings.

---

### 9.5.4 Deprecated Headers

#### Beginner

Signal **sunset** with response headers **`Deprecation`**, **`Sunset`**, and **`Link`** relations as standards emerge.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/old-endpoint")
def old_endpoint(response: Response) -> dict[str, str]:
    response.headers["Deprecation"] = "true"
    response.headers["Link"] = '</new-endpoint>; rel="successor-version"'
    return {"note": "migrate"}
```

#### Intermediate

Communicate **deprecation** in **docs**, **changelog**, and **metrics**—headers alone are **insufficient**.

#### Expert

**`Sunset`** dates should be **GMT** formatted per **RFC 8594** guidance; automate **alerts** when **past** sunset.

```python
response.headers["Sunset"] = "Sat, 01 Nov 2026 00:00:00 GMT"
```

**Key Points (9.5.4)**

- **Deprecation** is a **product** and **engineering** process.
- **Headers** help **automated** **client** linting.
- **Successor** links aid **discovery**.

**Best Practices (9.5.4)**

- Provide **migration** guides with **examples**.
- Keep **old** endpoints **stable** until **committed** dates.

**Common Mistakes (9.5.4)**

- **Deprecating** without **timeline**.
- **Breaking** clients **before** **Sunset** date.

---

### 9.5.5 Header Best Practices

#### Beginner

**Consistent naming**, **clear required/optional** policy, and **documented** semantics beat **clever** shortcuts.

```python
from typing import Annotated

from fastapi import APIRouter, Header

router = APIRouter(prefix="/v1")


@router.get("/items")
def items(x_request_id: Annotated[str | None, Header()] = None) -> dict:
    return {"items": []}
```

#### Intermediate

**Version** APIs via **URL** prefix **`/v1`** **and/or** headers—pick **one primary** approach for **cognitive** load.

#### Expert

**Header cardinality** at **ingress** logging pipelines costs **money**—**allowlist** headers for **indexed** fields.

```python
ALLOWED_LOG_HEADERS = {"user-agent", "x-request-id", "authorization"}
```

**Key Points (9.5.5)**

- **Consistency** > novelty.
- **Versioning** strategy should be **obvious** in **docs**.
- **Observability** should **filter** sensitive headers.

**Best Practices (9.5.5)**

- Run **Spectral** / **lint** rules on **OpenAPI** for **parameter** descriptions.
- **Redact** **`Authorization`** in **logs** automatically.

**Common Mistakes (9.5.5)**

- **Different** header names for the **same** concept across **services**.
- **Logging** full **headers** in **production**.

---

## 9.6 CORS and Headers

**Cross-Origin Resource Sharing (CORS)** uses **response headers** to let **browsers** permit **cross-origin** **XHR/fetch** to your API.

### 9.6.1 Access-Control Headers

#### Beginner

Add **`CORSMiddleware`** with **`allow_origins`**, **`allow_methods`**, **`allow_headers`**.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/cors-demo")
def cors_demo() -> dict[str, str]:
    return {"cors": "enabled"}
```

#### Intermediate

**`allow_origins=["*"]`** with **`allow_credentials=True`** is **invalid** per spec—browsers will **reject**.

#### Expert

**`Access-Control-Allow-Origin`** must echo **specific** origin when **credentials** enabled—middleware handles this; **caching** at CDN must **Vary: Origin**.

```python
# Pseudocode: never use "*" with credentials
```

**Key Points (9.6.1)**

- CORS is a **browser** enforcement—**curl** ignores it.
- **`allow_credentials`** tightens **rules** for **origins**.
- **Misconfigured** CORS manifests as **browser** console errors, not **server** 500.

**Best Practices (9.6.1)**

- **Whitelist** **origins** explicitly in **production**.
- **Separate** **dev** permissive settings from **prod**.

**Common Mistakes (9.6.1)**

- **`allow_origins=["*"]`** on **production** **authenticated** APIs.
- Forgetting **`expose_headers`** when **JS** must read **response** headers.

---

### 9.6.2 Preflight Requests

#### Beginner

Browsers send **`OPTIONS`** **preflight** for **non-simple** requests (custom headers, non-simple methods, JSON with certain content types). **`CORSMiddleware`** answers **`OPTIONS`** automatically.

```python
# Preflight handled by middleware — ensure OPTIONS not blocked by auth
```

#### Intermediate

**Custom Authorization** headers trigger **preflight**—plan for **`OPTIONS`** **latency** and **CDN** behavior.

#### Expert

**Auth middleware** must **not** require **credentials** on **`OPTIONS`** or preflight **fails** with **401**—exclude **`OPTIONS`** in **dependencies** or order **middleware** correctly.

```python
from starlette.requests import Request

@app.middleware("http")
async def skip_auth_options(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    return await call_next(request)
```

**Key Points (9.6.2)**

- **Preflight** is **OPTIONS** + **`Access-Control-Request-*`** headers.
- **Middleware order** matters.
- **401 on OPTIONS** is a **classic** bug.

**Best Practices (9.6.2)**

- Test **CORS** from a **real** browser **origin** in **staging**.
- Document **which** headers require **preflight**.

**Common Mistakes (9.6.2)**

- Applying **global** **Basic** auth before **CORS** middleware.
- **Caching** **preflight** responses incorrectly at **CDN**.

---

### 9.6.3 Custom CORS Headers

#### Beginner

Expose custom **response** headers to **JavaScript** via **`expose_headers`**.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id", "X-RateLimit-Remaining"],
)


@app.get("/exposed")
def exposed() -> dict[str, str]:
    return {"ok": "yes"}
```

#### Intermediate

Only **listed** headers are readable by **fetch** **`response.headers`** in browsers—others are **opaque**.

#### Expert

**`Access-Control-Max-Age`** reduces **preflight** traffic—tune **TTL** vs **rollout** agility.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    max_age=600,
)
```

**Key Points (9.6.3)**

- **`expose_headers`** is **read** access from **JS**, not **security** boundary.
- **`max_age`** caches **preflight** outcomes **client-side**.
- **Custom** **telemetry** headers often need **exposure**.

**Best Practices (9.6.3)**

- **Minimize** exposed headers to **reduce** **fingerprinting**.
- **Document** **JS** header reads for **frontend** teams.

**Common Mistakes (9.6.3)**

- Expecting **JS** to read **`Set-Cookie`**—**HttpOnly** prevents it by design.
- **Exposing** **sensitive** internal headers.

---

### 9.6.4 Header Exposure

#### Beginner

**Exposure** means **JavaScript** visibility vs **network** visibility—**CORS** **`expose_headers`** controls **JS** read access.

```python
# expose_headers=["X-Trace-Id"]  # browser JS can read X-Trace-Id
```

#### Intermediate

**`Access-Control-Allow-Headers`** lists **request** headers the **client** may send on **actual** requests after **preflight**.

#### Expert

**`Vary: Origin`** should accompany **dynamic** **`Access-Control-Allow-Origin`**—CDNs must **cache** **per-origin** variants.

```python
response.headers["Vary"] = "Origin"
```

**Key Points (9.6.4)**

- **CORS** does **not** replace **authz**—anyone can **curl** your API.
- **`Vary`** coordinates **CDN** with **per-origin** **ACA-O** values.
- **Exposure** is about **browser** **sandbox**, not **secrecy**.

**Best Practices (9.6.4)**

- **Test** with **CDN** enabled—**local** dev may **hide** **caching** bugs.
- **Document** **`Vary`** expectations for **platform** teams.

**Common Mistakes (9.6.4)**

- Believing **hidden** response headers are **secret** from **non-browser** clients.
- **Missing** **`Vary`** causing **wrong** **CORS** header **reuse**.

---

### 9.6.5 Security Headers

#### Beginner

CORS pairs with **security headers** like **`Content-Security-Policy`** on **HTML** docs; APIs returning **JSON** still benefit from **`X-Content-Type-Options`**.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["https://app.example.com"])


@app.middleware("http")
async def add_nosniff(request, call_next):
    r = await call_next(request)
    r.headers.setdefault("X-Content-Type-Options", "nosniff")
    return r
```

#### Intermediate

**`SameSite` cookies** interact with **CORS** and **CSRF**—API-first **SPAs** often prefer **tokens** in **`Authorization`** instead.

#### Expert

**`Cross-Origin-Opener-Policy`** / **`Cross-Origin-Embedder-Policy`** matter for **SharedArrayBuffer** scenarios—usually **web** **document** concerns more than **JSON** APIs.

```python
# COOP/COEP typically on HTML document responses
```

**Key Points (9.6.5)**

- **Layer** **CORS**, **CSP**, **cookies**, and **auth** thoughtfully.
- **JSON** APIs are still affected by **browser** **ambient** **authority** when mixed with **cookies**.
- **Middleware** ordering: **CORS** often **outermost** per **Starlette** docs.

**Best Practices (9.6.5)**

- Follow **FastAPI** docs for **CORSMiddleware** placement.
- **Pen-test** **SPA** + **API** **together**.

**Common Mistakes (9.6.5)**

- **CSRF** on **cookie** **sessions** without **SameSite** strategy.
- **Overly** **permissive** **CORS** trying to “fix” **auth** bugs.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points (Chapter 9)

- **Response** headers are set via **`Response`**, **`JSONResponse`**, or **middleware**.
- **Request** headers bind to parameters using **`Header()`** with **aliases** and **types**.
- **Validation** combines automatic **422** behavior with **custom** **`Depends()`** logic.
- **CORS** is **browser-specific** and configured via **`CORSMiddleware`** and related **Access-Control-*** headers.
- **Security** and **caching** policies are often **centralized** in **middleware**.

### Best Practices (Chapter 9)

- **Standardize** **`X-Request-Id`** / **trace** propagation across **services**.
- **Redact** **`Authorization`** and **cookies** in **logs**.
- **Whitelist** **`allow_origins`** in **production** CORS.
- Use **`Vary`** when **responses** depend on **`Accept`**, **`Accept-Language`**, **`Authorization`**, or **`Origin`**.
- Document **every** **required** **header** in **OpenAPI**.

### Common Mistakes (Chapter 9)

- **`401` on OPTIONS** breaking **CORS** preflight.
- **`allow_credentials=True`** with **`allow_origins=["*"]`**.
- **Logging** **secrets** from **headers**.
- **Case-sensitive** **custom** header handling.
- **Caching** **personalized** responses without proper **`Cache-Control`** / **`Vary`**.

---

### Appendix: Headers + CORS Starter `main.py`

```python
from typing import Annotated

from fastapi import FastAPI, Header, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Headers Demo", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
)


@app.middleware("http")
async def add_request_id(request, call_next):
    response: Response = await call_next(request)
    rid = request.headers.get("x-request-id", "generated-demo-id")
    response.headers["X-Request-Id"] = rid
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    return response


@app.get("/echo-headers")
def echo_headers(
    response: Response,
    x_client: Annotated[str | None, Header()] = None,
) -> dict:
    if x_client:
        response.headers["X-Client-Ack"] = x_client
    return {"received_client": x_client}
```

---
