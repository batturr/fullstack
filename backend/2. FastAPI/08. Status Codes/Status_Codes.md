# HTTP Status Codes in FastAPI

## 📑 Table of Contents

- [8.1 HTTP Status Codes](#81-http-status-codes)
  - [8.1.1 2xx Success Codes](#811-2xx-success-codes)
  - [8.1.2 3xx Redirect Codes](#812-3xx-redirect-codes)
  - [8.1.3 4xx Client Error Codes](#813-4xx-client-error-codes)
  - [8.1.4 5xx Server Error Codes](#814-5xx-server-error-codes)
  - [8.1.5 Status Code Meanings](#815-status-code-meanings)
- [8.2 Setting Status Codes](#82-setting-status-codes)
  - [8.2.1 status_code Parameter](#821-status_code-parameter)
  - [8.2.2 Default Status Codes](#822-default-status-codes)
  - [8.2.3 Custom Status Codes](#823-custom-status-codes)
  - [8.2.4 Dynamic Status Codes](#824-dynamic-status-codes)
  - [8.2.5 Conditional Status Codes](#825-conditional-status-codes)
- [8.3 Common Status Codes](#83-common-status-codes)
  - [8.3.1 200 OK](#831-200-ok)
  - [8.3.2 201 Created](#832-201-created)
  - [8.3.3 204 No Content](#833-204-no-content)
  - [8.3.4 400 Bad Request](#834-400-bad-request)
  - [8.3.5 401 Unauthorized](#835-401-unauthorized)
  - [8.3.6 403 Forbidden](#836-403-forbidden)
  - [8.3.7 404 Not Found](#837-404-not-found)
  - [8.3.8 500 Internal Server Error](#838-500-internal-server-error)
- [8.4 Status Code Documentation](#84-status-code-documentation)
  - [8.4.1 Responses Parameter](#841-responses-parameter)
  - [8.4.2 Multiple Status Codes](#842-multiple-status-codes)
  - [8.4.3 Response Examples by Status](#843-response-examples-by-status)
  - [8.4.4 Status Code Descriptions](#844-status-code-descriptions)
  - [8.4.5 Error Response Schemas](#845-error-response-schemas)
- [8.5 Best Practices](#85-best-practices)
  - [8.5.1 RESTful Status Code Usage](#851-restful-status-code-usage)
  - [8.5.2 Consistent Status Codes](#852-consistent-status-codes)
  - [8.5.3 Client Error Handling](#853-client-error-handling)
  - [8.5.4 Server Error Handling](#854-server-error-handling)
  - [8.5.5 Status Code Documentation](#855-status-code-documentation)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 8.1 HTTP Status Codes

HTTP status codes are **three-digit** numbers grouped into **classes** by the leading digit. FastAPI maps them to **OpenAPI** responses and uses them to signal **outcome semantics** to clients, caches, and intermediaries.

### 8.1.1 2xx Success Codes

#### Beginner

**2xx** means the server **accepted** and **handled** the request successfully for its class of operation. The most common is **`200 OK`** for successful **GET** and many **POST** handlers.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok"}  # defaults to 200 OK
```

#### Intermediate

Other success codes include **`201 Created`** (resource created, often with **`Location`** header), **`202 Accepted`** (async processing), **`204 No Content`** (success with empty body), and **`206 Partial Content`** (range requests). Pick the code that matches **HTTP semantics**, not only “it worked.”

#### Expert

**`207 Multi-Status`** appears in **WebDAV**; **`203 Non-Authoritative Information`** signals transformed proxies. APIs consumed by **browsers** and **CDNs** rely on accurate **2xx** usage for **cacheability**—mislabeling mutating **POST** as cacheable **200** can cause subtle bugs.

```python
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse

app = FastAPI()


@app.post("/jobs", status_code=status.HTTP_202_ACCEPTED)
def enqueue() -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={"job_id": "9f3c"},
    )
```

**Key Points (8.1.1)**

- **2xx** confirms **successful** handling from the server’s perspective.
- **`201`/`204`/`202`** communicate **specific** success shapes.
- Correct **2xx** choice improves **caching** and **client** logic.

**Best Practices (8.1.1)**

- Use **`201`** on **POST** that creates addressable resources.
- Use **`204`** when success has **no** response body by design.

**Common Mistakes (8.1.1)**

- Returning **`200`** for every operation regardless of **REST** meaning.
- Using **`200`** with **`{"error": ...}`** bodies instead of **4xx** codes.

---

### 8.1.2 3xx Redirect Codes

#### Beginner

**3xx** tells the client to **look elsewhere**—common examples: **`301 Moved Permanently`**, **`302 Found`**, **`307 Temporary Redirect`**, **`308 Permanent Redirect`**.

```python
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()


@app.get("/old-home")
def old_home() -> RedirectResponse:
    return RedirectResponse(url="/new-home", status_code=301)
```

#### Intermediate

**`307`/`308`** preserve the **original HTTP method** more strictly than legacy **`302`** behavior in many clients—prefer them for modern APIs when method preservation matters. **`303 See Other`** often pairs with **POST → GET** flows.

#### Expert

Reverse proxies and **SPA** routers sometimes mishandle **3xx** on **XHR/fetch**—document whether APIs return **JSON errors** vs **redirects**. For **canonical URLs** and **SEO**, **`301`/`308`** signal permanence to caches.

```python
from fastapi.responses import RedirectResponse

def permanent(url: str) -> RedirectResponse:
    return RedirectResponse(url, status_code=308)
```

**Key Points (8.1.2)**

- **3xx** encodes **redirection** semantics and **cache** hints.
- **Method + body** behavior varies by code and **client**.
- **`RedirectResponse`** is the Starlette/FastAPI shortcut.

**Best Practices (8.1.2)**

- Use **`308`** for **permanent** API path moves when appropriate.
- Avoid chains of **many** redirects—update clients directly.

**Common Mistakes (8.1.2)**

- Issuing **`302`** when **`307`** or **`308`** was intended for **API** clients.
- Redirecting **POST** without understanding **client** resubmission behavior.

---

### 8.1.3 4xx Client Error Codes

#### Beginner

**4xx** means the **client** should fix the request (bad input, missing auth, insufficient permissions, unknown resource). **`HTTPException`** in FastAPI defaults to **`422`** for validation issues on **inputs** and lets you set **`400`**, **`401`**, **`403`**, **`404`**, etc.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/items/{item_id}")
def item(item_id: int) -> dict[str, int]:
    if item_id < 0:
        raise HTTPException(status_code=400, detail="item_id must be non-negative")
    return {"id": item_id}
```

#### Intermediate

**`422 Unprocessable Entity`** is widely used by FastAPI for **Pydantic** validation errors; some purists prefer **`400`** for generic bad input—**consistency** within your API matters more than debates.

#### Expert

**`409 Conflict`**, **`410 Gone`**, **`412 Precondition Failed`**, **`429 Too Many Requests`** express **rich** client-retry semantics. Rate limiting should return **`429`** with **`Retry-After`** when possible.

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
    detail="Rate limit exceeded",
    headers={"Retry-After": "60"},
)
```

**Key Points (8.1.3)**

- **4xx** is **not** retried blindly by well-behaved clients (unlike many **5xx**).
- **`detail`** should be **safe** to expose (no secrets).
- **Validation** errors are **4xx** family in FastAPI (`422`).

**Best Practices (8.1.3)**

- Use **`404`** for **unknown** resource IDs, **`403`** when known but **disallowed**.
- Standardize **error JSON** shape across endpoints.

**Common Mistakes (8.1.3)**

- Using **`401`** vs **`403`** interchangeably (see 8.3.5–8.3.6).
- Leaking **stack traces** in **`detail`** for **4xx** responses.

---

### 8.1.4 5xx Server Error Codes

#### Beginner

**5xx** signals **server-side** failure: bugs, downstream outages, timeouts. The generic **`500 Internal Server Error`** is the default when unhandled exceptions propagate.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/maybe")
def maybe() -> dict[str, str]:
    raise HTTPException(status_code=500, detail="Unexpected failure")
```

#### Intermediate

**`502 Bad Gateway`** and **`503 Service Unavailable`** communicate **proxy** and **capacity** issues. **`503`** pairs with **`Retry-After`** for maintenance windows.

#### Expert

Map **database deadlock** vs **connection pool exhaustion** carefully—clients may **retry** **503** with backoff but should not hammer **500** loops identically. Use **observability** (trace IDs) without exposing internals in JSON.

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
    detail="Upstream database maintenance",
)
```

**Key Points (8.1.4)**

- **5xx** implies **server** responsibility—monitor and alert aggressively.
- **`503`** hints **temporary** unavailability.
- Unhandled exceptions become **500** via Starlette **exception middleware**.

**Best Practices (8.1.4)**

- Log **5xx** with **correlation IDs** and **exception** chains server-side.
- Use **circuit breakers** to avoid **cascading** failures.

**Common Mistakes (8.1.4)**

- Returning **500** for **validation** bugs that are really **client** mistakes (fix code).
- Treating **all** errors as **500** without **differentiation** for operators.

---

### 8.1.5 Status Code Meanings

#### Beginner

Each code has a **standard meaning** defined by **RFC 9110** (HTTP Semantics). Your API should follow those meanings so **generic** HTTP clients (curl, browsers, SDKs) behave predictably.

```python
from fastapi import status

assert status.HTTP_200_OK == 200
assert status.HTTP_404_NOT_FOUND == 404
```

#### Intermediate

**IANA** maintains the **HTTP Status Code Registry**. Custom APIs sometimes overload codes—document deviations prominently and prefer **well-known** codes for **interoperability**.

#### Expert

**Intermediaries** (caches, gateways) interpret codes per spec—e.g., **only some** responses are **cacheable**. Misusing **`204`** with bodies violates spec and confuses clients.

```python
SEMANTICS = {
    200: "OK — generic success with body",
    201: "Created — new resource",
    204: "Success — no content body",
    400: "Bad request — malformed or rule violation",
    401: "Unauthenticated",
    403: "Forbidden — authenticated but not allowed",
    404: "Resource not found",
    500: "Server error",
}
```

**Key Points (8.1.5)**

- **RFC** semantics are a **cross-language** contract.
- **Documentation** should map **business** errors to **HTTP** codes explicitly.
- **Caches** and **retries** depend on **correct** semantics.

**Best Practices (8.1.5)**

- Maintain an **internal** “status code decision tree” for engineers.
- Review **new** endpoints in PRs for **HTTP** appropriateness.

**Common Mistakes (8.1.5)**

- Inventing **non-standard** codes without **registration** or clear **tooling** support.
- Using **`418`** jokingly in **production** APIs clients depend on.

---

## 8.2 Setting Status Codes

FastAPI sets **defaults** per HTTP method and lets you override **`status_code`** on decorators or return **`JSONResponse`** with explicit codes.

### 8.2.1 status_code Parameter

#### Beginner

Pass an **integer** or **`status.HTTP_*`** constant to the route decorator.

```python
from fastapi import FastAPI, status

app = FastAPI()


@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item() -> dict[str, str]:
    return {"id": "new"}
```

#### Intermediate

`status_code` on the decorator applies to the **normal** return path. **`HTTPException`** carries its **own** code overriding the success default.

#### Expert

For **`Response`** subclasses, set **`status_code`** in the constructor; FastAPI will **not** override it when you return a **prebuilt** response object unless configured accordingly.

```python
from fastapi import FastAPI
from starlette.responses import Response

app = FastAPI()


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: str) -> Response:
    return Response(status_code=204)
```

**Key Points (8.2.1)**

- Decorator **`status_code`** sets **success** default.
- **Exceptions** and **Response** objects can **override**.
- Prefer **`status` constants** over **magic numbers** for readability.

**Best Practices (8.2.1)**

- Import **`status`** from **`fastapi`** for discoverability.
- Align **`status_code`** with **`responses`** OpenAPI docs.

**Common Mistakes (8.2.1)**

- Setting **`201`** but forgetting **`Location`** when clients expect it.
- Returning a **JSON body** with **`204`**.

---

### 8.2.2 Default Status Codes

#### Beginner

**GET** routes default to **`200`**. **POST** defaults to **`200`** unless you set **`201`**. **DELETE** often uses **`204`** or **`200`** depending on whether a body returns.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/a")
def a() -> dict[str, bool]:
    return {"ok": True}  # 200


@app.post("/b")
def b() -> dict[str, bool]:
    return {"ok": True}  # still 200 unless you pass status_code=201
```

#### Intermediate

FastAPI follows **Starlette** routing defaults; always **explicitly** set codes on **mutations** when you want **REST-typical** behavior.

#### Expert

OpenAPI **operation** defaults come from these rules—verify **`/openapi.json`** after changes. **HEAD** requests mirror **GET** without bodies.

```python
@app.post("/items/", status_code=201)
def create() -> dict[str, str]:
    return {"created": "yes"}
```

**Key Points (8.2.2)**

- **Defaults** may not match **REST** style guides—be explicit.
- **OpenAPI** reflects decorator **status_code**.
- **POST** ≠ **201** automatically.

**Best Practices (8.2.2)**

- Document **default** choices in **API guidelines**.
- Use **`201`/`204`** explicitly for **write** endpoints.

**Common Mistakes (8.2.2)**

- Assuming **POST** is **201** by default in FastAPI (it is not).
- Returning **bodies** with **`204`**.

---

### 8.2.3 Custom Status Codes

#### Beginner

Any **registered** HTTP code (e.g., **`418`**, **`451`**) can be set if your clients understand it—rare for **public** JSON APIs.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/teapot")
def teapot() -> dict[str, str]:
    raise HTTPException(status_code=418, detail="I'm a teapot")
```

#### Intermediate

**Custom** codes outside the **IANA** registry break **middleware** and **clients**—avoid. Prefer **existing** codes plus **machine-readable** `detail` fields.

#### Expert

Some organizations use **vendor** codes behind **private** gateways—keep **public** internet APIs **standards-compliant**.

```python
raise HTTPException(status_code=422, detail={"code": "INVALID_EMAIL"})
```

**Key Points (8.2.3)**

- **Registered** codes only for **broad** interoperability.
- **Domain** errors fit in **`detail`** payloads, not novel **status digits**.
- **Tooling** (proxies, WAF) may not understand **obscure** codes.

**Best Practices (8.2.3)**

- Stay within **common** codes for **partner** integrations.
- If using **rare** codes, document **client** handling.

**Common Mistakes (8.2.3)**

- Encoding **business** outcome solely in **status** with dozens of **numeric** variants.
- Using **`418`** in **serious** APIs without realizing **client** filters may block it.

---

### 8.2.4 Dynamic Status Codes

#### Beginner

Compute status inside the function and return **`JSONResponse`** with the chosen code—useful when one handler serves **multiple** outcomes.

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


@app.post("/subscribe")
def subscribe(email: str) -> JSONResponse:
    if email.endswith("@bad.example"):
        return JSONResponse({"ok": False}, status_code=400)
    return JSONResponse({"ok": True}, status_code=201)
```

#### Intermediate

Keep **OpenAPI** honest: if status varies, document **`responses`** with **multiple** entries or split routes for **clearer** contracts.

#### Expert

**ETag** flows may return **`304`** vs **`200`** dynamically—centralize logic in **dependencies** or **services** with tests for each branch.

```python
from fastapi import Response

def maybe_not_modified(match: bool, response: Response) -> bool:
    if match:
        response.status_code = 304
        return True
    return False
```

**Key Points (8.2.4)**

- **Dynamic** codes are powerful but complicate **SDK** generation.
- **OpenAPI** needs **`responses`** covering **each** branch you support.
- **304** must not include a **full** body matching **`200`**.

**Best Practices (8.2.4)**

- Prefer **separate** functions per **major** semantic outcome when feasible.
- Add **tests** asserting **status_code** per branch.

**Common Mistakes (8.2.4)**

- Returning **dynamic** codes not listed in **OpenAPI**.
- Using **dynamic** codes to bypass **structured** error handling.

---

### 8.2.5 Conditional Status Codes

#### Beginner

Use **`if`/`else`** with **`HTTPException`** or **`JSONResponse`** when business rules dictate different codes (e.g., **found** vs **not found**).

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

DB = {1: "one"}


@app.get("/db/{key}")
def db_get(key: int) -> dict[str, str]:
    val = DB.get(key)
    if val is None:
        raise HTTPException(status_code=404, detail="missing")
    return {"value": val}
```

#### Intermediate

**Guard clauses** early in handlers improve **readability**. Combine with **dependency** exceptions for **auth** checks.

#### Expert

**State machines** (e.g., order **`pending` → `paid`**) may map to **`409 Conflict`** when transitions are invalid—document **state-specific** errors.

```python
from fastapi import HTTPException, status

class Order:
    state = "pending"

def pay(order: Order) -> None:
    if order.state != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="invalid state")
    order.state = "paid"
```

**Key Points (8.2.5)**

- **Conditionals** encode **business** rules in **HTTP** semantics.
- **`409`** fits **conflict** with **current resource** state.
- **Early** returns reduce **nesting**.

**Best Practices (8.2.5)**

- Mirror **conditional** branches in **contract tests**.
- Keep **domain** exceptions **separate** from **HTTP** mapping layers when large.

**Common Mistakes (8.2.5)**

- Using **`404`** to hide **existence** of **forbidden** resources (privacy trade-off).
- Deeply **nested** conditionals without **helpers**.

---

## 8.3 Common Status Codes

These eight codes appear constantly in **REST** JSON APIs. Master their **distinctions**—especially **401 vs 403** and **400 vs 422**.

### 8.3.1 200 OK

#### Beginner

**`200 OK`** means success with a **response body** (unless **`HEAD`**). Default for **GET** and often **POST** when not using **`201`**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/hello")
def hello() -> dict[str, str]:
    return {"msg": "hi"}
```

#### Intermediate

**`200`** with **`PUT`/`PATCH`** can mean **updated** resources; include the **current representation** or a **summary** per your API style.

#### Expert

**Caching**: **`200`** responses to **GET** may be **cacheable** if **`Cache-Control`** allows—avoid **`200`** for operations with **side effects** mistakenly labeled **GET**.

```python
@app.put("/users/{user_id}", status_code=200)
def update(user_id: int) -> dict[str, int]:
    return {"id": user_id, "version": 2}
```

**Key Points (8.3.1)**

- **`200`** is the **general-purpose** success code.
- Still choose **`201`/`204`** when semantics are **clearer**.
- **GET** should be **safe** and **idempotent**—**200** fits.

**Best Practices (8.3.1)**

- Prefer **`201`** after **creation** with server-assigned IDs.
- Document whether **`200`** **PUT** returns **full** or **partial** resource.

**Common Mistakes (8.3.1)**

- **`200`** + **error JSON** for failed operations.
- **Non-idempotent** **GET** with **`200`**.

---

### 8.3.2 201 Created

#### Beginner

Use **`201 Created`** when a **new** resource is created, typically **`POST`** to a collection. Often combined with **`Location`** header.

```python
from fastapi import FastAPI, Response, status

app = FastAPI()


@app.post("/items", status_code=status.HTTP_201_CREATED)
def create(response: Response) -> dict[str, str]:
    new_id = "42"
    response.headers["Location"] = f"/items/{new_id}"
    return {"id": new_id, "name": "new item"}
```

#### Intermediate

**Idempotent creates** sometimes use **`PUT`** to a **known URL** with **`201`** on first creation and **`200`/`204` on update—document **upsert** semantics.

#### Expert

**Hypermedia** APIs may return **`201`** with **links** in JSON (`"self"`, `"collection"`)—align **`Location`** with **`self`** URI.

```python
@app.post("/v2/things", status_code=201)
def create_v2(response: Response) -> dict[str, str]:
    tid = "t-1"
    response.headers["Location"] = f"/v2/things/{tid}"
    return {"id": tid}
```

**Key Points (8.3.2)**

- **`201`** signals **resource birth**, not just “request ok.”
- **`Location`** helps **clients** fetch the **created** entity.
- Pair with **`response_model`** for **typed** bodies.

**Best Practices (8.3.2)**

- Return **representation** or **minimal** identifiers consistently.
- Use **absolute** or **relative** `Location` consistently per API.

**Common Mistakes (8.3.2)**

- **`201`** without any **identifier** clients can use.
- **`201`** on **non-creating** **POST** actions (e.g., search).

---

### 8.3.3 204 No Content

#### Beginner

**`204`** means **success** with **no** response body. Common for **`DELETE`** or **`PUT`** when nothing needs returning.

```python
from fastapi import FastAPI, Response, status

app = FastAPI()


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: str) -> Response:
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

#### Intermediate

Do not send a **JSON body** with **`204`**—some clients choke. If you need payload, use **`200`**.

#### Expert

**OpenAPI** should show **empty** response content for **`204`**. For **conditional deletes**, **`404`** vs **`204`** documents whether **idempotent** delete of missing resource is allowed.

```python
@app.delete("/items/{item_id}", status_code=204)
def delete_idempotent(item_id: str) -> Response:
    return Response(status_code=204)
```

**Key Points (8.3.3)**

- **`204`** communicates **success** without **entity** payload.
- Ideal for **fire-and-forget** **mutations**.
- **Intermediaries** treat **`204`** as **no content** per spec.

**Best Practices (8.3.3)**

- Decide **idempotent DELETE** policy explicitly.
- Ensure **middleware** does not **inject** bodies into **`204`**.

**Common Mistakes (8.3.3)**

- Returning **`{"status": "ok"}`** with **`204`**.
- Clients expecting **JSON** where **`204`** is documented.

---

### 8.3.4 400 Bad Request

#### Beginner

**`400`** indicates **malformed** requests or **semantic** rule violations not covered by **validation** schemas. Use when rejecting **business** rules FastAPI cannot express in types alone.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.post("/transfer")
def transfer(amount: int) -> dict[str, str]:
    if amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be positive")
    return {"status": "queued"}
```

#### Intermediate

FastAPI often uses **`422`** for **schema** validation failures—reserve **`400`** for **valid JSON** that violates **domain** constraints.

#### Expert

For **OAuth2**-adjacent flows, **`400`** appears for **invalid_grant**-class errors—mirror **spec** guidance for **interop**.

```python
raise HTTPException(
    status_code=400,
    detail={"code": "DATE_IN_PAST", "field": "scheduled_at"},
)
```

**Key Points (8.3.4)**

- **`400`** = **client** mistake, but not always **Pydantic**’s **`422`**.
- Structured **`detail`** improves **client UX**.
- Avoid **`400`** for **auth** failures (**`401`/`403`**).

**Best Practices (8.3.4)**

- Keep **`detail`** **stable** for **programmatic** handling.
- Log **`400`** with **sanitized** context.

**Common Mistakes (8.3.4)**

- Using **`400`** for **everything** including **server** bugs.
- Conflicting **`400`** vs **`422`** policies across teams.

---

### 8.3.5 401 Unauthorized

#### Beginner

**`401`** means **authentication** failed or is **missing**. Clients should obtain/refresh **credentials**. Often paired with **`WWW-Authenticate`** header for **browser** flows.

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBearer

app = FastAPI()
security = HTTPBearer()


@app.get("/secure")
def secure(creds=Depends(security)) -> dict[str, str]:
    if creds.credentials != "good":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    return {"user": "you"}
```

#### Intermediate

Despite the name **“Unauthorized,”** **`401`** signals **unauthenticated** in common API usage; **`403`** means **authenticated** but **not permitted**.

#### Expert

**OAuth2** **`invalid_token`** responses often use **`401`** with **`WWW-Authenticate: Bearer ...`**—coordinate with **security** schemes in OpenAPI.

```python
raise HTTPException(
    status_code=401,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
```

**Key Points (8.3.5)**

- **`401`** → **who are you?** problem.
- Encourage **`Authorization`** header usage.
- **`WWW-Authenticate`** matters for **standards** compliance in some contexts.

**Best Practices (8.3.5)**

- Differentiate **expired** vs **invalid** tokens in **`detail`** codes.
- Avoid leaking whether an **email exists** when mixing **`401`/`404`**.

**Common Mistakes (8.3.5)**

- Returning **`403`** when the user is simply **not logged in**.
- Omitting **`Bearer`** scheme hints for **machine** clients.

---

### 8.3.6 403 Forbidden

#### Beginner

**`403`** means the server **understands** who you are, but you **cannot** perform this action. Contrasts with **`401`** (not authenticated).

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()


@app.delete("/admin/users/{user_id}")
def admin_delete(user_id: int, is_admin: bool = False) -> dict[str, str]:
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="admin only")
    return {"deleted": str(user_id)}
```

#### Intermediate

**`403`** vs **`404`**: some APIs **`404`** on **private** resources to avoid **enumeration**—document **security** policy.

#### Expert

**ABAC/RBAC** failures map cleanly to **`403`** with **`detail`** codes like **`INSUFFICIENT_SCOPE`**.

```python
raise HTTPException(status_code=403, detail={"code": "INSUFFICIENT_SCOPE", "need": "users:write"})
```

**Key Points (8.3.6)**

- **`403`** → **authenticated**, **not authorized** for **action/resource**.
- Sensitive existence hiding may use **`404`** instead—**explicit** policy.
- Do not use **`403`** for **missing** **login** when **`401`** fits.

**Best Practices (8.3.6)**

- Log **`403`** attempts for **security** monitoring.
- Provide **support** channels when users believe access should exist.

**Common Mistakes (8.3.6)**

- **`403`** on **invalid** password (often **`401`**).
- Revealing **too much** about **internal** roles in **`detail`**.

---

### 8.3.7 404 Not Found

#### Beginner

**`404`** means the **resource** or **path** does not exist (or you choose not to reveal existence).

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/users/{user_id}")
def user(user_id: int) -> dict[str, int]:
    if user_id not in {1, 2}:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user_id}
```

#### Intermediate

**Trailing slash** mismatches may yield **`307`** redirects or **`404`** depending on **`redirect_slashes`**—standardize **URL** style.

#### Expert

For **SPA** fallbacks, **`404`** JSON vs **`index.html`** is a **deployment** concern—use **separate** mounts for **API** vs **static** routes.

```python
raise HTTPException(status_code=404, detail={"resource": "user", "id": 99})
```

**Key Points (8.3.7)**

- **`404`** is the **default** unknown route behavior in Starlette.
- Can represent **hidden** **403** scenarios—decide **policy**.
- **Sub-resource** missing may be **`404`** on **parent** path patterns.

**Best Practices (8.3.7)**

- Include **stable** **`detail.code`** for **clients**.
- Avoid **`404`** for **wrong HTTP method** when **`405`** is clearer.

**Common Mistakes (8.3.7)**

- **`404`** when **`410`** (gone) or **`301`** (moved) is more accurate.
- Leaking **stack** traces on **404** handlers.

---

### 8.3.8 500 Internal Server Error

#### Beginner

**`500`** indicates an **unexpected** server failure—uncaught exceptions become **`500`** unless you register handlers.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/boom")
def boom() -> dict[str, str]:
    raise RuntimeError("unexpected")
```

#### Intermediate

**`HTTPException(500)`** should be rare—prefer **specific** **5xx** when you know **`503`** applies (dependency down).

#### Expert

**Exception handlers** convert domain errors to **`JSONResponse`** with **500** while hiding internals; **metrics** track **500** rate as **SLO** driver.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(RuntimeError)
def runtime_handler(request: Request, exc: RuntimeError) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

**Key Points (8.3.8)**

- **`500`** = **bug** or **unhandled** exceptional condition.
- **Never** include **secrets** in **500** JSON bodies.
- **Alert** on **`500`** spikes post-deploy.

**Best Practices (8.3.8)**

- Use **error monitoring** (Sentry, etc.) with **PII** scrubbing.
- Return **generic** messages publicly; **rich** logs privately.

**Common Mistakes (8.3.8)**

- Catching **`Exception`** and re-raising as **`400`**—hides **real** bugs.
- Returning **500** for **known** validation mistakes (should be **4xx**).

---

## 8.4 Status Code Documentation

OpenAPI documents **each operation’s** possible responses. FastAPI’s **`responses`** parameter enriches **`openapi.json`** beyond the default **200** entry.

### 8.4.1 Responses Parameter

#### Beginner

Pass a **`responses`** dict to `@app.get` (etc.) mapping **status codes** (int or str) to **metadata** including **`model`** and **`description`**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    id: int


class Error(BaseModel):
    detail: str


@app.get(
    "/items/{item_id}",
    response_model=Item,
    responses={404: {"model": Error, "description": "Item not found"}},
)
def get_item(item_id: int) -> Item:
    return Item(id=item_id)
```

#### Intermediate

You can specify **`content`**, **`headers`**, and **`links`** per OpenAPI 3—FastAPI merges these into the generated schema.

#### Expert

For **shared** error models, register components via **`openapi_schema` overrides** or reuse **Pydantic** models to keep **`$ref`** consistent across operations.

```python
responses = {
    401: {"description": "Unauthorized", "model": Error},
    403: {"description": "Forbidden", "model": Error},
}
```

**Key Points (8.4.1)**

- **`responses`** augments **OpenAPI**, not runtime behavior alone.
- **`model`** should match **actual** JSON bodies you return.
- Combine with **`HTTPException`** handlers for **consistency**.

**Best Practices (8.4.1)**

- Centralize **Error** schema fields (`code`, `message`, `request_id`).
- Document **at least** common **4xx** for public endpoints.

**Common Mistakes (8.4.1)**

- Declaring **models** in OpenAPI that **never** appear at runtime.
- Omitting **`422`** documentation when clients rely on **validation** errors.

---

### 8.4.2 Multiple Status Codes

#### Beginner

List **several** status keys in **`responses`** alongside **`response_model`** for the **primary** success response.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Ok(BaseModel):
    id: int


class Err(BaseModel):
    detail: str


@app.get(
    "/dual/{x}",
    response_model=Ok,
    responses={
        200: {"description": "Found"},
        404: {"model": Err, "description": "Missing"},
    },
)
def dual(x: int) -> Ok:
    if x == 0:
        raise HTTPException(status_code=404, detail="zero")
    return Ok(id=x)
```

#### Intermediate

**SDK generators** create **union** return types from **multiple** success codes—avoid **multiple success** codes with **incompatible** bodies without **discriminators**.

#### Expert

Prefer **separate routes** if success shapes diverge strongly—cleaner OpenAPI and **client** code.

**Key Points (8.4.2)**

- **Multiple** documented statuses improve **client** expectations.
- **Success** should remain **predictable** per route when possible.
- **Errors** benefit most from **multiple** documented entries.

**Best Practices (8.4.2)**

- Document **401/403/404/422/429/500** for **external** APIs selectively.
- Keep **descriptions** **actionable** for integrators.

**Common Mistakes (8.4.2)**

- Declaring **10+** statuses **per** route without **real** coverage.
- **200** documented with a **model** but **204** returned in some cases.

---

### 8.4.3 Response Examples by Status

#### Beginner

Inside **`responses`**, nest **`content` → `application/json` → `example` or `examples`** for OpenAPI **3** documentation.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Payment(BaseModel):
    id: str
    amount: str


@app.post(
    "/payments",
    response_model=Payment,
    responses={
        402: {
            "description": "Payment required",
            "content": {
                "application/json": {
                    "example": {"detail": "INSUFFICIENT_FUNDS"},
                }
            },
        }
    },
)
def pay() -> Payment:
    return Payment(id="p1", amount="10.00")
```

#### Intermediate

Use **`examples`** dict with **named** keys for **Swagger UI** dropdowns when supported.

#### Expert

Generate **examples** from **pytest** fixtures to prevent **drift**—export **golden** JSON files in CI.

**Key Points (8.4.3)**

- **Examples** are **documentation only**, not validation.
- Must remain **valid** under declared **schemas** when models are attached.
- Help **QA** and **partners** integrate faster.

**Best Practices (8.4.3)**

- Include **success** and **failure** examples for **payment** flows.
- Scrub **PII** from **published** examples.

**Common Mistakes (8.4.3)**

- **Examples** that contradict **`response_model`** fields.
- **Huge** embedded examples bloating **`openapi.json`**.

---

### 8.4.4 Status Code Descriptions

#### Beginner

Each **`responses`** entry accepts **`description`** text shown in **Swagger UI** / **ReDoc**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get(
    "/healthz",
    responses={200: {"description": "Service is healthy"}},
)
def healthz() -> dict[str, str]:
    return {"status": "ok"}
```

#### Intermediate

Use **`response_description`** on the decorator for the **primary** **`response_model`** response’s **200** entry when you want a **richer** default than “Successful Response.”

#### Expert

Align **description** strings with **runbooks**—link **internal** wiki paths in **private** docs builds, not **public** OpenAPI.

```python
@app.get(
    "/readyz",
    response_description="Readiness: dependencies reachable",
    responses={503: {"description": "Dependency unavailable"}},
)
def readyz() -> dict[str, str]:
    return {"ready": "yes"}
```

**Key Points (8.4.4)**

- **Descriptions** aid **humans**, not machines—still valuable.
- **Consistency** in voice reduces **cognitive load**.
- **`summary`** vs **`description`** apply at **operation** level too.

**Best Practices (8.4.4)**

- Mention **retry** behavior in **503** descriptions.
- Note **idempotency** expectations for **POST** in descriptions.

**Common Mistakes (8.4.4)**

- **Empty** descriptions on **complex** **financial** endpoints.
- **Misleading** text after **refactors** (stale docs).

---

### 8.4.5 Error Response Schemas

#### Beginner

Define a **`Problem`** or **`Error`** Pydantic model and reuse it across **`responses`** entries for **4xx/5xx**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ApiError(BaseModel):
    code: str
    message: str
    request_id: str


@app.get(
    "/thing",
    responses={
        400: {"model": ApiError},
        500: {"model": ApiError},
    },
)
def thing() -> dict[str, bool]:
    return {"ok": True}
```

#### Intermediate

**RFC 7807** **Problem Details** maps cleanly to a **`Problem`** model with **`type`**, **`title`**, **`status`**, **`detail`**, **`instance`**.

#### Expert

Register a **global exception handler** that always emits **`ApiError`** / **`Problem`**, and **assert** in tests that **`openapi.json`** includes those **components**.

```python
class Problem(BaseModel):
    type: str
    title: str
    status: int
    detail: str
    instance: str | None = None
```

**Key Points (8.4.5)**

- **Standardized** errors simplify **client** parsing and **logs** correlation.
- **OpenAPI** models should match **handler** output **exactly**.
- Include **`request_id`** for **support** tickets.

**Best Practices (8.4.5)**

- Version **error** schemas carefully—clients **depend** on **fields**.
- Map **internal** exceptions to **safe** external messages.

**Common Mistakes (8.4.5)**

- **Different** error JSON shapes per **endpoint**.
- Documenting **`detail: str`** only while returning **`detail: dict`**.

---

## 8.5 Best Practices

Operational excellence for HTTP APIs requires **consistent** semantics, **great** docs, and **clear** client/server responsibilities.

### 8.5.1 RESTful Status Code Usage

#### Beginner

Map **CRUD** operations to **meaningful** codes: **GET** **`200`**, **POST** **`201`**, **DELETE** **`204`**, **PUT** **`200`/`204`**.

```python
from fastapi import APIRouter, status
from starlette.responses import Response

router = APIRouter()


@router.post("/books", status_code=status.HTTP_201_CREATED)
def create_book() -> dict[str, str]:
    return {"id": "b1"}


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: str) -> Response:
    return Response(status_code=204)
```

#### Intermediate

**HATEOAS** and **batch** endpoints may deviate—document **non-REST** patterns honestly in **`description`**.

#### Expert

**RPC**-style JSON POSTs still ride HTTP—choose codes reflecting **HTTP-layer** outcome and **document** the pattern.

**Key Points (8.5.1)**

- **REST** is a **style guide**, not a **law**—**consistency** wins.
- **HTTP semantics** still apply to **caching** and **proxies**.
- **Non-standard** patterns need **explicit** **docs**.

**Best Practices (8.5.1)**

- Publish an **API style guide** referencing **this chapter**.
- Review **status** choices in **PR** checklists.

**Common Mistakes (8.5.1)**

- **RPC-over-POST** returning **`200`** for all outcomes without **documented** error **envelope**.
- Using **`POST`** for **safe** **read** operations accidentally.

---

### 8.5.2 Consistent Status Codes

#### Beginner

Pick **one** policy for **`422` vs `400`** validation errors and apply **service-wide**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/need-int")
def need_int(x: int) -> dict[str, int]:
    return {"x": x}
```

#### Intermediate

**BFF** layers translating **multiple backends** should **normalize** codes so **mobile** apps see **uniform** behavior.

#### Expert

**Feature flags** toggling **behavior** should not silently change **status** codes without **versioning**—track **metrics** per **code** to detect **drift**.

**Key Points (8.5.2)**

- **Inconsistency** confuses **SDK** authors and **SRE** dashboards.
- **Normalization** belongs in **gateway** or **shared** **middleware**.
- **Metrics** tags should include **`http.status_code`**.

**Best Practices (8.5.2)**

- Lint **OpenAPI** for **undocumented** error responses.
- Run **contract tests** across **services** in **staging**.

**Common Mistakes (8.5.2)**

- **Per-team** **dialects** of **`detail`** JSON.
- Changing codes in **patch** releases without **changelog** entry.

---

### 8.5.3 Client Error Handling

#### Beginner

Teach clients to **branch** on **status** first, then parse **JSON** bodies for **`detail`**.

```python
import requests

r = requests.get("https://api.example/items/1", timeout=5)
if r.status_code == 200:
    data = r.json()
elif r.status_code == 404:
    ...
else:
    r.raise_for_status()
```

#### Intermediate

**Retry** only **idempotent** methods on **`429`/`503`** with **exponential backoff** + **jitter**.

#### Expert

**Respect `Retry-After`** headers; parse **Problem Details** `type` URLs for **stable** **error** taxonomy across **versions**.

**Key Points (8.5.3)**

- Clients should **never** assume **200** means **business** success without **schema** checks if your API nests errors (discouraged).
- **Backoff** protects **your own** service from **storms**.
- **Log** **`x-request-id`** on **errors** for **support**.

**Best Practices (8.5.3)**

- Ship **reference** **client** snippets with **error** handling.
- Document **rate limit** behavior with **`429`** examples.

**Common Mistakes (8.5.3)**

- Infinite **retry** loops on **`400`**.
- Parsing **HTML** **error pages** from **misconfigured** gateways as **JSON**.

---

### 8.5.4 Server Error Handling

#### Beginner

Register **`exception_handler`** for **`Exception`** **carefully**—usually log and return **500** JSON, re-raise in **dev** only.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(Exception)
def any_exc(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

#### Intermediate

Map **known** domain exceptions to **4xx** before the **generic** **500** handler runs.

#### Expert

Integrate **OpenTelemetry** **`span.record_exception`** and **metrics** **`http.server.errors`** counters tagged by **route template**, not raw path (cardinality).

```python
class DomainError(Exception):
    def __init__(self, code: str) -> None:
        self.code = code
```

**Key Points (8.5.4)**

- **500** handlers are **last resort**—prefer **specific** handling.
- **Logging** must be **structured** for **queries**.
- **PII** scrubbing in **logs** is **mandatory**.

**Best Practices (8.5.4)**

- Use **Sentry** **fingerprints** to group **errors** sanely.
- **Alert** on **new** **error** types post-deploy.

**Common Mistakes (8.5.4)**

- Swallowing **exceptions** silently.
- Returning **SQL** text to **clients** on **500**.

---

### 8.5.5 Status Code Documentation

#### Beginner

Ensure **`/docs`** shows **each** documented status with **description**—verify manually during **QA**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get(
    "/demo",
    responses={
        200: {"description": "OK"},
        429: {"description": "Too many requests"},
    },
)
def demo() -> dict[str, str]:
    return {"ok": "yes"}
```

#### Intermediate

Add **CI** step comparing **`openapi.json`** to **golden** file or running **Spectral** rules.

#### Expert

Publish **multi-environment** OpenAPI (**dev/stage/prod**) with **warning** banners when **schemas** differ—automate **diff** comments on **PRs**.

**Key Points (8.5.5)**

- **Docs** are part of the **API contract**.
- **CI** enforcement prevents **silent** regressions.
- **Consumers** trust **examples** that **execute**.

**Best Practices (8.5.5)**

- Embed **Try it out** examples with **sandbox** keys.
- Version **`openapi.json`** URLs (`/v1/openapi.json`).

**Common Mistakes (8.5.5)**

- **Hand-written** **wiki** tables diverging from **reality**.
- **Forgetting** to document **`422`** when clients **parse** validation errors.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points (Chapter 8)

- HTTP **status codes** communicate **outcome class** to **clients**, **caches**, and **operators**.
- FastAPI sets **defaults** per method; **override** with **`status_code`**, **`JSONResponse`**, or **`Response`**.
- **`401`** vs **`403`**, **`400`** vs **`422`**, **`200`** vs **`201`/`204`** are **high-impact** distinctions.
- **`responses`** enriches **OpenAPI**; **handlers** determine **runtime** bodies.
- **5xx** should trigger **alerts**; **4xx** should trigger **client** fixes or **UX** messaging.

### Best Practices (Chapter 8)

- Use **`fastapi.status`** constants instead of **magic** numbers.
- Standardize **error JSON** and **document** it per **status**.
- Add **integration tests** for **critical** **status** branches (**401/403/404/409/422/429/503**).
- **Log** **request IDs** and **safe** **error codes** server-side.
- **Review** **OpenAPI** diffs on every **release**.

### Common Mistakes (Chapter 8)

- **Always `200`** with **error** payloads.
- **Misusing** **`401`/`403`** confusing **authentication** vs **authorization**.
- **Undocumented** **`422`** bodies breaking **clients** after upgrades.
- Returning **bodies** with **`204`**.
- **Leaking** **internals** in **`detail`** for **5xx/4xx**.

---

### Appendix: Status Code Quick Reference Table

| Code | Typical meaning               | FastAPI notes                              |
| ---- | ----------------------------- | ------------------------------------------ |
| 200  | OK                            | Default success for many **GET**/**POST** |
| 201  | Created                       | Set on **POST** creates; add **Location**  |
| 204  | No Content                    | Use **`Response(204)`** without JSON     |
| 400  | Bad Request                   | Domain rule failures (non-schema)          |
| 401  | Unauthorized (unauthenticated) | Missing/invalid **credentials**        |
| 403  | Forbidden                     | Authenticated but **not allowed**          |
| 404  | Not Found                     | Unknown resource or hidden **403**         |
| 422  | Unprocessable Entity          | Common for **Pydantic** validation         |
| 429  | Too Many Requests             | Add **`Retry-After`** when possible        |
| 500  | Internal Server Error         | Unhandled exceptions / bugs                |
| 503  | Service Unavailable           | Maintenance / overload                     |

```python
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse, Response

app = FastAPI()


@app.post("/resources", status_code=status.HTTP_201_CREATED)
def create() -> JSONResponse:
    return JSONResponse(status_code=201, content={"id": "1"})


@app.delete("/resources/{rid}", status_code=status.HTTP_204_NO_CONTENT)
def remove(rid: str) -> Response:
    return Response(status_code=204)
```

---
