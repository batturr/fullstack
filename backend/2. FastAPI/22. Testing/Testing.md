# Testing

Testing FastAPI applications combines **pytest** ergonomics with Starlette’s **`TestClient`** (synchronous) or **`httpx.AsyncClient`** with **ASGI transport** for async-first suites. This chapter covers **structure**, **TestClient** usage, **parameter** and **body** testing, **authentication**, **mocking**, **integration/e2e/perf/coverage**, and **CI** practices—so refactors stay safe and regressions surface early.

**How to use these notes:** Start every feature with a **failing test**; prefer **dependency overrides** over monkeypatching globals; keep tests **fast** by default and **isolate** external IO.

## 📑 Table of Contents

- [22.1 Testing Basics](#221-testing-basics)
  - [22.1.1 Test Structure](#2211-test-structure)
  - [22.1.2 Test Cases](#2212-test-cases)
  - [22.1.3 Assertions](#2213-assertions)
  - [22.1.4 Test Organization](#2214-test-organization)
  - [22.1.5 Running Tests](#2215-running-tests)
- [22.2 FastAPI TestClient](#222-fastapi-testclient)
  - [22.2.1 TestClient Initialization](#2221-testclient-initialization)
  - [22.2.2 Making Requests](#2222-making-requests)
  - [22.2.3 Checking Responses](#2223-checking-responses)
  - [22.2.4 Status Code Testing](#2224-status-code-testing)
  - [22.2.5 Response Body Testing](#2225-response-body-testing)
- [22.3 Testing Path and Query Parameters](#223-testing-path-and-query-parameters)
  - [22.3.1 Path Parameter Tests](#2231-path-parameter-tests)
  - [22.3.2 Query Parameter Tests](#2232-query-parameter-tests)
  - [22.3.3 Parameter Validation](#2233-parameter-validation)
  - [22.3.4 Edge Cases](#2234-edge-cases)
  - [22.3.5 Error Cases](#2235-error-cases)
- [22.4 Testing Request Body](#224-testing-request-body)
  - [22.4.1 JSON Request Testing](#2241-json-request-testing)
  - [22.4.2 Form Data Testing](#2242-form-data-testing)
  - [22.4.3 File Upload Testing](#2243-file-upload-testing)
  - [22.4.4 Validation Testing](#2244-validation-testing)
  - [22.4.5 Error Response Testing](#2245-error-response-testing)
- [22.5 Testing Authentication](#225-testing-authentication)
  - [22.5.1 Bearer Token Testing](#2251-bearer-token-testing)
  - [22.5.2 JWT Testing](#2252-jwt-testing)
  - [22.5.3 OAuth2 Testing](#2253-oauth2-testing)
  - [22.5.4 Permission Testing](#2254-permission-testing)
  - [22.5.5 Credential Testing](#2255-credential-testing)
- [22.6 Mocking and Fixtures](#226-mocking-and-fixtures)
  - [22.6.1 pytest Fixtures](#2261-pytest-fixtures)
  - [22.6.2 Mocking Dependencies](#2262-mocking-dependencies)
  - [22.6.3 Database Mocking](#2263-database-mocking)
  - [22.6.4 External Service Mocking](#2264-external-service-mocking)
  - [22.6.5 Fixture Organization](#2265-fixture-organization)
- [22.7 Advanced Testing](#227-advanced-testing)
  - [22.7.1 Integration Testing](#2271-integration-testing)
  - [22.7.2 End-to-End Testing](#2272-end-to-end-testing)
  - [22.7.3 Performance Testing](#2273-performance-testing)
  - [22.7.4 Load Testing](#2274-load-testing)
  - [22.7.5 Coverage Testing](#2275-coverage-testing)
- [22.8 Continuous Testing](#228-continuous-testing)
  - [22.8.1 Automated Testing](#2281-automated-testing)
  - [22.8.2 CI/CD Pipelines](#2282-cicd-pipelines)
  - [22.8.3 Test Automation](#2283-test-automation)
  - [22.8.4 Regression Testing](#2284-regression-testing)
  - [22.8.5 Best Practices](#2285-best-practices)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 22.1 Testing Basics

Solid tests read like **specifications** and fail with **actionable** messages.

### 22.1.1 Test Structure

#### Beginner

A test file imports the app (or factory), uses **`TestClient`**, calls an endpoint, asserts outcomes. Use **`test_*`** function names for pytest discovery.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def test_health() -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

#### Intermediate

Adopt **Arrange-Act-Assert** blocks and keep each test focused on **one** behavior.

#### Expert

For large apps, use **`pytest_plugins`** and **packages** (`tests/api/test_users.py`) mirroring source modules without circular imports via **`create_app()`** factories.

**Key Points (22.1.1)**

- Clarity beats cleverness—tests are **documentation**.

**Best Practices (22.1.1)**

- One **primary** assertion concept per test; ancillary assertions must support that concept.

**Common Mistakes (22.1.1)**

- Sharing **mutable** global app state between tests without resets.

### 22.1.2 Test Cases

#### Beginner

Use **`@pytest.mark.parametrize`** to cover input variations without copy-paste.

```python
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/double")
def double(x: int) -> dict[str, int]:
    return {"y": x * 2}


client = TestClient(app)


@pytest.mark.parametrize(
    ("x", "expected"),
    [(0, 0), (2, 4), (-3, -6)],
)
def test_double(x: int, expected: int) -> None:
    r = client.get("/double", params={"x": x})
    assert r.json()["y"] == expected
```

#### Intermediate

Group cases with **ids** for readable pytest output: `parametrize(..., ids=["zero", "positive", "negative"])`.

#### Expert

Separate **happy**, **edge**, and **adversarial** cases into different **test modules** or **markers** for selective runs.

**Key Points (22.1.2)**

- Parametrize **data**, not **assertion logic**.

**Best Practices (22.1.2)**

- Keep parameter tuples **short**—use dataclasses for wide tables.

**Common Mistakes (22.1.2)**

- Over-parametrizing **unrelated** scenarios into one test.

### 22.1.3 Assertions

#### Beginner

Use plain **`assert`** with pytest introspection; for JSON, compare **`response.json()`** to dicts.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/item")
def item() -> dict[str, int]:
    return {"a": 1}


def test_item() -> None:
    r = TestClient(app).get("/item")
    body = r.json()
    assert body["a"] == 1
```

#### Intermediate

For **floats**, use **`pytest.approx`**; for **unordered** lists, compare **`set`** or **`Counter`**.

#### Expert

Custom assertions helpers (`assert_json_subset`) reduce noise for **evolving** APIs.

**Key Points (22.1.3)**

- Assertions should print **diffs**—pytest does this for collections.

**Best Practices (22.1.3)**

- Avoid **`assert True`** placeholders—delete or implement.

**Common Mistakes (22.1.3)**

- Asserting **exact** error message strings tied to library internals.

### 22.1.4 Test Organization

#### Beginner

Place tests under **`tests/`**; mirror `app/routers/users.py` → `tests/routers/test_users.py`.

#### Intermediate

Use **`conftest.py`** for shared fixtures scoped to package subtree.

#### Expert

Tag slow tests `@pytest.mark.slow` and default CI to **exclude** them on PRs with selective full runs nightly.

**Key Points (22.1.4)**

- Structure should answer “where do I add a test for X?” instantly.

**Best Practices (22.1.4)**

- Co-locate **factory** helpers (`factories/user.py`) for readable setups.

**Common Mistakes (22.1.4)**

- **Giant** `test_api.py` files thousands of lines long.

### 22.1.5 Running Tests

#### Beginner

Run **`pytest -q`** locally; use **`pytest tests/test_health.py::test_health`** for single tests.

#### Intermediate

Enable **`pytest-xdist`** for parallel runs: `pytest -n auto`. Configure **`pyproject.toml`** `[tool.pytest.ini_options]` with `testpaths = ["tests"]`, `addopts = "-ra -q"`.

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra -q"
filterwarnings = ["error::DeprecationWarning"]
```

#### Expert

Split **unit** vs **integration** via markers and **GitHub Actions** matrices (Python versions, OS).

**Key Points (22.1.5)**

- Fast default loop encourages **TDD**.

**Best Practices (22.1.5)**

- Fail CI on **warnings** you care about—prevents drift.

**Common Mistakes (22.1.5)**

- Running tests against **production** `.env` files.

---

## 22.2 FastAPI TestClient

`TestClient` wraps **httpx** and drives your ASGI app **synchronously**—perfect for most pytest suites.

### 22.2.1 TestClient Initialization

#### Beginner

`client = TestClient(app)` then reuse across tests via fixture.

```python
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
```

#### Intermediate

Pass **`base_url="http://testserver"`** (default) explicitly when constructing absolute URLs in app code that reads `request.base_url`.

#### Expert

Use **`with TestClient(app) as client:`** to trigger **`lifespan`** startup/shutdown around a block.

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.testclient import TestClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.flag = True
    yield
    app.state.flag = False


app = FastAPI(lifespan=lifespan)


def test_lifespan() -> None:
    with TestClient(app) as client:
        assert client.app.state.flag is True
```

**Key Points (22.2.1)**

- `TestClient` exercises **real** middleware stack and exception handlers.

**Best Practices (22.2.1)**

- Prefer **app factory** fixtures to configure **dependency overrides** per test.

**Common Mistakes (22.2.1)**

- Creating a **new** `TestClient` per assertion inside tight loops—slow.

### 22.2.2 Making Requests

#### Beginner

Use `.get`, `.post`, `.put`, `.delete`, `.patch` with `json=`, `data=`, `files=`, `headers=`, `cookies=`.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.post("/echo")
def echo(payload: dict) -> dict:
    return payload


def test_post_json() -> None:
    client = TestClient(app)
    r = client.post("/echo", json={"a": 1})
    assert r.json() == {"a": 1}
```

#### Intermediate

Follow redirects with `allow_redirects=True` (default) or disable to assert **307** behavior.

#### Expert

For **streaming** responses, iterate **`response.iter_lines()`** and assert chunk sequences.

**Key Points (22.2.2)**

- `json=` sets **Content-Type** automatically.

**Best Practices (22.2.2)**

- Always pass **`timeout`** for tests that could hang—safety net.

**Common Mistakes (22.2.2)**

- Using `data=` with a dict without **`files=`** expecting multipart—won’t match FastAPI’s expectations.

### 22.2.3 Checking Responses

#### Beginner

Inspect **`status_code`**, **`headers`**, **`json()`**, **`text`**, **`content`**.

```python
from fastapi import FastAPI, Response
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/hdr")
def hdr(response: Response) -> dict[str, str]:
    response.headers["X-Test"] = "1"
    return {"ok": "true"}


def test_headers() -> None:
    r = TestClient(app).get("/hdr")
    assert r.headers["X-Test"] == "1"
```

#### Intermediate

Use **`response.raise_for_status()`** in helper clients when testing **non-JSON** error paths.

#### Expert

Validate **`Set-Cookie`** attributes for auth flows—`response.cookies`.

**Key Points (22.2.3)**

- Headers are **case-insensitive** via httpx mapping.

**Best Practices (22.2.3)**

- When asserting binary, compare **`content`** to **`b"..."`**.

**Common Mistakes (22.2.3)**

- Calling **`.json()`** on empty body responses—raises.

### 22.2.4 Status Code Testing

#### Beginner

Assert exact codes for success and failure routes.

```python
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/maybe")
def maybe(fail: bool = False) -> dict[str, str]:
    if fail:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no")
    return {"ok": "yes"}


def test_status() -> None:
    c = TestClient(app)
    assert c.get("/maybe", params={"fail": False}).status_code == 200
    assert c.get("/maybe", params={"fail": True}).status_code == 400
```

#### Intermediate

Prefer **`status.HTTP_*`** constants for readability and refactors.

#### Expert

For **RFC** compliance on auth, assert **401** vs **403** distinctly with documented semantics.

**Key Points (22.2.4)**

- Status codes are part of your **public API contract**.

**Best Practices (22.2.4)**

- Test both **machine-readable** `detail` and **stable** error `type` if you customize handlers.

**Common Mistakes (22.2.4)**

- Accepting **500** in tests as “expected”—usually masks bugs.

### 22.2.5 Response Body Testing

#### Beginner

Compare full JSON for small payloads; for large, assert **subset** keys.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/user")
def user() -> dict[str, str | int]:
    return {"id": 1, "name": "Ada", "email": "ada@example.com"}


def test_subset() -> None:
    body = TestClient(app).get("/user").json()
    assert body["id"] == 1
    assert body["name"] == "Ada"
```

#### Intermediate

Use **Pydantic** models in tests to parse responses (`User.model_validate_json(r.text)`).

#### Expert

For **OpenAPI** compliance, optionally validate responses against **jsonschema** generated specs in CI.

**Key Points (22.2.5)**

- Avoid overspecifying **ordering** of JSON keys—unnecessary.

**Best Practices (22.2.5)**

- Freeze **time** (`freezegun`) when responses include **timestamps**.

**Common Mistakes (22.2.5)**

- Testing **default** fields that may change with library upgrades without pinning versions.

---

## 22.3 Testing Path and Query Parameters

FastAPI’s validation layer should be **proven** by tests—not assumed.

### 22.3.1 Path Parameter Tests

#### Beginner

Call routes with concrete path segments; assert **404** for missing resources as designed.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/items/{item_id}")
def get_item(item_id: int) -> dict[str, int]:
    return {"item_id": item_id}


def test_path_int() -> None:
    assert TestClient(app).get("/items/5").json() == {"item_id": 5}
```

#### Intermediate

Test **path converters** (`{item_id:uuid}`) with valid and invalid strings.

#### Expert

Ensure **trailing slash** behavior matches **router** configuration and **proxy** rules—encode assumptions in tests.

**Key Points (22.3.1)**

- Path params are coerced—invalid types yield **422**.

**Best Practices (22.3.1)**

- Test **minimum** and **maximum** if using **`Path`** constraints.

**Common Mistakes (22.3.1)**

- Only testing **string** paths that accidentally match regex—miss real user inputs.

### 22.3.2 Query Parameter Tests

#### Beginner

Pass `params={"q": "a"}`; assert defaults when omitted.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/search")
def search(q: str = "all", limit: int = 10) -> dict[str, str | int]:
    return {"q": q, "limit": limit}


def test_query_defaults() -> None:
    assert TestClient(app).get("/search").json() == {"q": "all", "limit": 10}
```

#### Intermediate

Test **`List[str]`** query params with repeated keys depending on client style.

#### Expert

Verify **`deepObject`**-style params only if you implement them—FastAPI defaults are simple.

**Key Points (22.3.2)**

- Query parsing interacts with **OpenAPI** `explode` behavior—clients vary.

**Best Practices (22.3.2)**

- Encode **`+`**, **`&`**, Unicode in tests.

**Common Mistakes (22.3.2)**

- Forgetting **`params` tuples** for duplicate keys: `[("tag", "a"), ("tag", "b")]`.

### 22.3.3 Parameter Validation

#### Beginner

Send invalid values; expect **422** and Pydantic **`detail`** structure.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/age")
def age(n: int) -> dict[str, int]:
    return {"n": n}


def test_validation_error() -> None:
    r = TestClient(app).get("/age", params={"n": "x"})
    assert r.status_code == 422
    detail = r.json()["detail"]
    assert isinstance(detail, list)
```

#### Intermediate

Snapshot **stable** subsets of `detail` (field `loc`, `type`) rather than full messages if i18n changes.

#### Expert

Customize **`RequestValidationError` handler** and test **uniform** error envelope.

**Key Points (22.3.3)**

- Validation tests protect you through **Pydantic** upgrades.

**Best Practices (22.3.3)**

- Add tests whenever you tweak **`Field`** constraints.

**Common Mistakes (22.3.3)**

- Asserting full **English** strings from Pydantic—brittle.

### 22.3.4 Edge Cases

#### Beginner

Test `0`, negative numbers, empty strings where allowed, very long strings.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/len")
def length(s: str) -> dict[str, int]:
    return {"len": len(s)}


def test_empty_string() -> None:
    r = TestClient(app).get("/len", params={"s": ""})
    assert r.json()["len"] == 0
```

#### Intermediate

Test **maximum** lengths for query/path parameters enforced by **`Field(max_length=...)`**.

#### Expert

Fuzz with **Hypothesis** for parsers you own—bounded example sizes.

**Key Points (22.3.4)**

- Edge cases are where **security** and **stability** intersect.

**Best Practices (22.3.4)**

- Include **unicode** and **whitespace** variants.

**Common Mistakes (22.3.4)**

- Ignoring **integer overflow** expectations—Python ints are unbounded but DBs are not.

### 22.3.5 Error Cases

#### Beginner

Test unknown routes → **404** unless custom exception handlers change it.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


def test_404() -> None:
    assert TestClient(app).get("/nope").status_code == 404
```

#### Intermediate

Test **`HTTPException`** branches and **`RequestValidationError`** paths uniformly.

#### Expert

Simulate **middleware** failures and ensure **correlation ids** still propagate in error JSON.

**Key Points (22.3.5)**

- Error responses are **API surface**—test them.

**Best Practices (22.3.5)**

- Document **error codes** your clients rely on.

**Common Mistakes (22.3.5)**

- Only testing **happy paths** for new query parameters.

---

## 22.4 Testing Request Body

Bodies drive **Pydantic** models—tests should exercise **shape** and **validation**.

### 22.4.1 JSON Request Testing

#### Beginner

`client.post("/items", json={"name": "a"})`.

```python
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()


class Item(BaseModel):
    name: str
    price: float


@app.post("/items")
def create_item(item: Item) -> Item:
    return item


def test_create_item() -> None:
    payload = {"name": "pen", "price": 1.5}
    r = TestClient(app).post("/items", json=payload)
    assert r.status_code == 200
    assert r.json() == payload
```

#### Intermediate

Test **`exclude_unset`** behavior in response models indirectly by verifying **output** JSON keys.

#### Expert

Benchmark **large JSON** parsing if endpoints accept bulk arrays—test **max length** enforcement.

**Key Points (22.4.1)**

- JSON tests should include **extra fields** behavior (`model_config` / Pydantic settings).

**Best Practices (22.4.1)**

- Test **Content-Type** rejection for `text/plain` posts to JSON endpoints.

**Common Mistakes (22.4.1)**

- Sending **`float`** as JSON numbers but expecting **Decimal** without configuring Pydantic.

### 22.4.2 Form Data Testing

#### Beginner

Use `data={"field": "value"}` for `application/x-www-form-urlencoded`.

```python
from fastapi import FastAPI, Form
from fastapi.testclient import TestClient

app = FastAPI()


@app.post("/login")
def login(username: str = Form(), password: str = Form()) -> dict[str, str]:
    return {"user": username}


def test_form() -> None:
    r = TestClient(app).post("/login", data={"username": "u", "password": "p"})
    assert r.json() == {"user": "u"}
```

#### Intermediate

For **`File` + `Form`**, use **`files`** and **`data`** kwargs together per Starlette docs.

#### Expert

Test **duplicate** keys and **charset** edge cases if you parse manually.

**Key Points (22.4.2)**

- Form parsing differs from JSON—both need **coverage**.

**Best Practices (22.4.2)**

- Validate **CSRF** strategy if cookies + forms in browsers.

**Common Mistakes (22.4.2)**

- Using `json=` where route expects **`Form`**—422 or wrong handler.

### 22.4.3 File Upload Testing

#### Beginner

Pass **`files={"file": ("name.txt", b"data", "text/plain")}`**.

```python
from fastapi import FastAPI, File, UploadFile
from fastapi.testclient import TestClient

app = FastAPI()


@app.post("/upload")
async def upload(file: UploadFile = File()) -> dict[str, str]:
    content = await file.read()
    return {"name": file.filename, "size": str(len(content))}


def test_upload() -> None:
    r = TestClient(app).post(
        "/upload",
        files={"file": ("hello.txt", b"hello", "text/plain")},
    )
    assert r.json()["size"] == "5"
```

#### Intermediate

Test **multiple** files with lists and field names matching endpoint signature.

#### Expert

Simulate **large** files using **`io.BytesIO`** chunks and ensure **spooling** limits if configured.

**Key Points (22.4.3)**

- `UploadFile` uses **spool** to disk for large uploads—test tmp space failures in integration env.

**Best Practices (22.4.3)**

- Assert **content type** validation logic you implement.

**Common Mistakes (22.4.3)**

- Forgetting **`await file.read()`** in route makes tests confusing when mixing sync/async clients.

### 22.4.4 Validation Testing

#### Beginner

Send bodies missing required fields; expect **422**.

```python
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()


class M(BaseModel):
    a: int
    b: int


@app.post("/m")
def m(body: M) -> M:
    return body


def test_missing_field() -> None:
    r = TestClient(app).post("/m", json={"a": 1})
    assert r.status_code == 422
```

#### Intermediate

Test **`Field` validators**, **`model_validator`**, and custom **types**.

#### Expert

Ensure **`alias`** fields accept external wire names—post using alias keys.

**Key Points (22.4.4)**

- Validation tests are **regression shields** for model refactors.

**Best Practices (22.4.4)**

- Include **cross-field** validation cases.

**Common Mistakes (22.4.4)**

- Testing only **serializer** output, not **parser** input.

### 22.4.5 Error Response Testing

#### Beginner

Assert **`detail`** structure for `HTTPException`.

```python
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient

app = FastAPI()


@app.post("/deny")
def deny() -> None:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="nope")


def test_forbidden() -> None:
    r = TestClient(app).post("/deny")
    assert r.status_code == 403
    assert r.json() == {"detail": "nope"}
```

#### Intermediate

If using **`RFC 7807`** problem+json, assert **`type`**, **`title`**, **`status`**.

#### Expert

Test **`exception_handlers`** for **`StarletteHTTPException`** vs **`HTTPException`** precedence.

**Key Points (22.4.5)**

- Clients parse **stable** error shapes—test those shapes.

**Best Practices (22.4.5)**

- Never leak stack traces in **production** error models—test prod handler.

**Common Mistakes (22.4.5)**

- Returning **different** JSON schemas for 422 vs 400 without documenting.

---

## 22.5 Testing Authentication

Security regressions are **high impact**—automate them.

### 22.5.1 Bearer Token Testing

#### Beginner

Pass `headers={"Authorization": "Bearer token"}`.

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.testclient import TestClient

app = FastAPI()
auth = HTTPBearer()


def get_subject(creds: HTTPAuthorizationCredentials = Depends(auth)) -> str:
    if creds.credentials != "secret":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return "user-1"


@app.get("/me")
def me(subject: str = Depends(get_subject)) -> dict[str, str]:
    return {"sub": subject}


def test_bearer_ok() -> None:
    r = TestClient(app).get("/me", headers={"Authorization": "Bearer secret"})
    assert r.json()["sub"] == "user-1"


def test_bearer_fail() -> None:
    r = TestClient(app).get("/me", headers={"Authorization": "Bearer wrong"})
    assert r.status_code == 401
```

#### Intermediate

Test **missing** header → 403 vs 401 depending on **`HTTPBearer(auto_error=False)`**.

#### Expert

Test **case** sensitivity and **extra whitespace** handling per RFC 6750 expectations.

**Key Points (22.5.1)**

- Bearer schemes are trivial to get wrong—test **both** branches.

**Best Practices (22.5.1)**

- Centralize **`get_current_user`** and test it **once** deeply.

**Common Mistakes (22.5.1)**

- Using **`Bearer`** tests only—neglecting **malformed** `Authorization` headers.

### 22.5.2 JWT Testing

#### Beginner

Generate tokens in tests with **`python-jose`** or **`PyJWT`** using a test secret.

```python
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.testclient import TestClient

app = FastAPI()
auth = HTTPBearer()
SECRET = "test"
ALGO = "HS256"


def get_sub(creds: HTTPAuthorizationCredentials = Depends(auth)) -> str:
    try:
        payload = jwt.decode(creds.credentials, SECRET, algorithms=[ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    sub = payload.get("sub")
    if not isinstance(sub, str):
        raise HTTPException(status_code=401)
    return sub


@app.get("/jwt-me")
def jwt_me(sub: str = Depends(get_sub)) -> dict[str, str]:
    return {"sub": sub}


def test_jwt() -> None:
    token = jwt.encode(
        {"sub": "u1", "exp": datetime.now(tz=UTC) + timedelta(minutes=5)},
        SECRET,
        algorithm=ALGO,
    )
    r = TestClient(app).get("/jwt-me", headers={"Authorization": f"Bearer {token}"})
    assert r.json() == {"sub": "u1"}
```

#### Intermediate

Test **expired** tokens, **wrong audience**, **wrong issuer**, **alg=none** attacks if applicable.

#### Expert

Property-test **clock skew** tolerance and **rotation** between signing keys (`kid` header).

**Key Points (22.5.2)**

- JWT validation is **algorithm + claims**—test both.

**Best Practices (22.5.2)**

- Use **asymmetric** keys in integration tests if production does.

**Common Mistakes (22.5.2)**

- Signing tests with **HS256** but prod uses **RS256**—tests give false confidence.

### 22.5.3 OAuth2 Testing

#### Beginner

Test **`OAuth2PasswordBearer`** dependency with token URL flows at **unit** level; mock upstream IdP in integration.

```python
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer
from fastapi.testclient import TestClient

app = FastAPI()
oauth2 = OAuth2PasswordBearer(tokenUrl="/token")


@app.get("/oauth-protected")
def protected(token: str = Depends(oauth2)) -> dict[str, str]:
    return {"token": token}


def test_oauth_header() -> None:
    r = TestClient(app).get(
        "/oauth-protected", headers={"Authorization": "Bearer abc"}
    )
    assert r.json()["token"] == "abc"
```

#### Intermediate

Use **`respx`** or **`pytest-httpx`** to mock **token introspection** endpoints.

#### Expert

Test **PKCE** and **state** parameters for authorization code flows in **client** libraries; FastAPI often implements **resource server** side only.

**Key Points (22.5.3)**

- Distinguish **authorization server** tests from **resource server** tests.

**Best Practices (22.5.3)**

- Record **VCR** cassettes for sandbox IdP if allowed.

**Common Mistakes (22.5.3)**

- Testing only **happy** token responses—neglect **inactive** token JSON.

### 22.5.4 Permission Testing

#### Beginner

Parametrize user roles; assert **403** when role insufficient.

```python
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.testclient import TestClient

app = FastAPI()


def require_admin(role: str = Query()) -> str:
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return role


@app.get("/admin")
def admin(_role: str = Depends(require_admin)) -> dict[str, str]:
    return {"role": _role}


def test_admin_forbidden() -> None:
    r = TestClient(app).get("/admin", params={"role": "user"})
    assert r.status_code == 403
```

#### Intermediate

Use **`Permission` classes** or **Casbin**/OPA wrappers—test policy tables.

#### Expert

Prove **object-level** authorization (user can access **their** `item_id` only).

**Key Points (22.5.4)**

- Role checks without **resource** checks cause **IDOR** bugs—test both.

**Best Practices (22.5.4)**

- Build **`authenticate`** + **`authorize`** helpers tested independently.

**Common Mistakes (22.5.4)**

- Using **`401`** where **`403`** is correct after authentication.

### 22.5.5 Credential Testing

#### Beginner

Test **HTTP Basic** credentials via `auth=("user", "pass")` on `TestClient` requests.

```python
from fastapi import Depends, FastAPI
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.testclient import TestClient

app = FastAPI()
basic = HTTPBasic()


def get_user(creds: HTTPBasicCredentials = Depends(basic)) -> str:
    return creds.username


@app.get("/basic-me")
def basic_me(user: str = Depends(get_user)) -> dict[str, str]:
    return {"user": user}


def test_basic() -> None:
    r = TestClient(app).get("/basic-me", auth=("alice", "x"))
    assert r.json() == {"user": "alice"}
```

#### Intermediate

Test **reject** wrong password paths.

#### Expert

Ensure **timing-safe** comparison (`secrets.compare_digest`) in real code—test constant-time behavior indirectly via **code review** + **lint** rules.

**Key Points (22.5.5)**

- Never log **raw** credentials in tests or app logs.

**Best Practices (22.5.5)**

- Rotate **test secrets** per CI run when simulating vault integration.

**Common Mistakes (22.5.5)**

- Hardcoding **prod-like** passwords in repository tests.

---

## 22.6 Mocking and Fixtures

Isolate **units**; swap **dependencies** cleanly.

### 22.6.1 pytest Fixtures

#### Beginner

Define reusable **`@pytest.fixture`** objects: DB session, client, auth headers.

```python
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
```

#### Intermediate

Use **`yield`** fixtures for setup/teardown (truncate tables).

#### Expert

Scope fixtures **`session`** for expensive app startup, **`function`** for isolation—understand **tradeoffs**.

**Key Points (22.6.1)**

- Fixtures compose—keep **DAG** shallow.

**Best Practices (22.6.1)**

- Name fixtures **`client`**, **`db_session`**, **`admin_headers`** consistently.

**Common Mistakes (22.6.1)**

- **Session-scoped** fixtures returning **mutable** state shared across tests.

### 22.6.2 Mocking Dependencies

#### Beginner

`app.dependency_overrides[func] = override` then clear in teardown.

```python
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


def get_settings() -> dict[str, str]:
    return {"env": "prod"}


@app.get("/cfg")
def cfg(settings: dict = Depends(get_settings)) -> dict[str, str]:
    return settings


def test_override() -> None:
    app.dependency_overrides[get_settings] = lambda: {"env": "test"}
    try:
        r = TestClient(app).get("/cfg")
        assert r.json()["env"] == "test"
    finally:
        app.dependency_overrides.clear()
```

#### Intermediate

Override **`get_current_user`** to return fake users with roles.

#### Expert

Wrap overrides in fixtures using **`try/finally`** or **`contextlib.ExitStack`** for multiple overrides.

**Key Points (22.6.2)**

- Overrides are **powerful**—always **clear** them to prevent cross-test leakage.

**Best Practices (22.6.2)**

- Prefer overrides over **monkeypatching** internal FastAPI symbols.

**Common Mistakes (22.6.2)**

- Forgetting **`clear()`** → **flaky** suites.

### 22.6.3 Database Mocking

#### Beginner

Use **`sqlite+aiosqlite:///:memory:`** for fast integration tests.

#### Intermediate

Wrap each test in **transaction rollback** using **`session.begin()`** nested pattern.

#### Expert

Use **Testcontainers** for Postgres parity tests matching **prod** features (JSON operators, constraints).

```python
# Conceptual: pytest fixture spinning Postgres container
# from testcontainers.postgres import PostgresContainer
```

**Key Points (22.6.3)**

- Mocking ORM **too much** yields false confidence—balance with **container** tests.

**Best Practices (22.6.3)**

- Run **migrations** against test DB in CI.

**Common Mistakes (22.6.3)**

- SQLite tests passing while **Postgres** fails on types or locks.

### 22.6.4 External Service Mocking

#### Beginner

Use **`unittest.mock.patch`** on client functions.

```python
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


def charge_card(amount: int) -> bool:
    ...


@app.post("/pay")
def pay(amount: int) -> dict[str, bool]:
    return {"ok": charge_card(amount)}


@patch("path.to.module.charge_card", return_value=True)
def test_pay(mock_charge: object) -> None:
    r = TestClient(app).post("/pay", params={"amount": 100})
    assert r.json()["ok"] is True
```

#### Intermediate

Prefer **`respx`** for structured HTTP mock routes.

#### Expert

Record/replay with **VCR.py** for third-party APIs with **secrets** scrubbed.

**Key Points (22.6.4)**

- Assert **call args** on mocks to ensure **idempotency keys** passed.

**Best Practices (22.6.4)**

- Simulate **timeouts** and **5xx** sequences.

**Common Mistakes (22.6.4)**

- Mocking at wrong **import path** (where used vs defined).

### 22.6.5 Fixture Organization

#### Beginner

Place shared fixtures in **`tests/conftest.py`**.

#### Intermediate

Split **`conftest.py`** per package when it grows—pytest discovers nested ones.

#### Expert

Publish **internal test utilities** as a **private** package for monorepos.

**Key Points (22.6.5)**

- Organization scales teams—invest early.

**Best Practices (22.6.5)**

- Document **fixture** purposes in module docstrings.

**Common Mistakes (22.6.5)**

- **Circular imports** between `conftest.py` and app modules—use lazy imports.

---

## 22.7 Advanced Testing

Move up the pyramid when **confidence** demands it.

### 22.7.1 Integration Testing

#### Beginner

Spin real app with **test DB**; exercise multiple layers (router → service → DB).

#### Intermediate

Use **Docker Compose** profile `test` to bring **dependencies** up in CI.

#### Expert

Contract-test **internal** microservices with **Pact** or **Schemathesis** against OpenAPI.

**Key Points (22.7.1)**

- Integration tests catch **wiring** bugs unit tests miss.

**Best Practices (22.7.1)**

- Keep them **fewer** but **representative**.

**Common Mistakes (22.7.1)**

- Using **production** endpoints or credentials.

### 22.7.2 End-to-End Testing

#### Beginner

Drive browser with **Playwright** against **`uvicorn`** test server.

#### Intermediate

Seed data via **fixtures** or **admin API** before UI flows.

#### Expert

Parallelize shards in CI; use **test isolation** tenants.

**Key Points (22.7.2)**

- E2E is **slow**—target **critical user journeys** only.

**Best Practices (22.7.2)**

- Stabilize with **deterministic** waits, not blind `sleep`.

**Common Mistakes (22.7.2)**

- Flaky tests from **async** animations—prefer **expect** APIs.

### 22.7.3 Performance Testing

#### Beginner

Use **`pytest-benchmark`** for microbench of pure functions.

#### Intermediate

Use **`locust`** against staging with **auth** tokens.

#### Expert

Profile **async** code with **`py-spy`** on running uvicorn under load.

**Key Points (22.7.3)**

- Performance tests belong on **merge to main** or nightly, not every PR.

**Best Practices (22.7.3)**

- Compare against **baseline** commits, not single numbers alone.

**Common Mistakes (22.7.3)**

- Benchmarking on **shared** CI runners with noisy neighbors.

### 22.7.4 Load Testing

#### Beginner

Script **`httpx`** with **`asyncio`** to fire concurrent requests locally.

```python
import asyncio
import httpx


async def hammer(url: str, n: int) -> None:
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for _ in range(n)]
        await asyncio.gather(*tasks)


def test_hammer_runs() -> None:
    asyncio.run(hammer("http://127.0.0.1:8000/health", 50))
```

#### Intermediate

Use **k6** or **Locust** for **ramp-up** scenarios.

#### Expert

Model **think time** and **payload** distributions realistically.

**Key Points (22.7.4)**

- Load tests need **monitoring** correlation (CPU, DB connections).

**Best Practices (22.7.4)**

- Start at **low** concurrency, step up.

**Common Mistakes (22.7.4)**

- Saturating **client** machine—mistaking it for server limits.

### 22.7.5 Coverage Testing

#### Beginner

Run **`pytest --cov=myapp --cov-report=term-missing`**.

#### Intermediate

Enforce **`--cov-fail-under=85`** in CI with **pragmatic** exclusions for generated code.

#### Expert

Track **diff coverage** (only changed lines) via **Codecov** or **Coveralls**.

**Key Points (22.7.5)**

- Coverage **quantity** ≠ quality—review **branch** coverage.

**Best Practices (22.7.5)**

- Exclude **`if TYPE_CHECKING`** blocks and **migrations**.

**Common Mistakes (22.7.5)**

- Gaming coverage with **meaningless** asserts.

---

## 22.8 Continuous Testing

Automate **trust** in every merge.

### 22.8.1 Automated Testing

#### Beginner

Run **`pytest`** on every push via **GitHub Actions**.

```yaml
# .github/workflows/tests.yml (sketch)
# on: [push, pull_request]
# jobs:
#   test:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-python@v5
#         with:
#           python-version: "3.12"
#       - run: pip install -r requirements-dev.txt
#       - run: pytest
```

#### Intermediate

Cache **pip** wheels; split **lint** (`ruff`) from **tests**.

#### Expert

Use **merge queues** requiring green checks + **integration** suite.

**Key Points (22.8.1)**

- Automation turns tribal knowledge into **enforced** quality gates.

**Best Practices (22.8.1)**

- Upload **JUnit** XML for flaky test analytics.

**Common Mistakes (22.8.1)**

- No **pinning** dependencies—CI surprises.

### 22.8.2 CI/CD Pipelines

#### Beginner

Pipeline stages: **install → lint → test → build image → deploy**.

#### Intermediate

Gate **deploy** on **smoke tests** against **canary**.

#### Expert

**Blue/green** with automated **rollback** on SLO violation.

**Key Points (22.8.2)**

- Fast feedback loops shrink **MTTR**.

**Best Practices (22.8.2)**

- Parallelize **matrix** jobs across Python versions.

**Common Mistakes (22.8.2)**

- Running **long** E2E on every PR without sharding.

### 22.8.3 Test Automation

#### Beginner

Pre-commit hooks: **`ruff check`**, **`ruff format`**, **`pytest -q` subset**.

#### Intermediate

**Label-driven** bots rerun flaky tests or post **coverage** deltas.

#### Expert

**Mutation testing** (`mutmut`) nightly on critical modules.

**Key Points (22.8.3)**

- Automation should **help** developers, not punish them with 30m waits.

**Best Practices (22.8.3)**

- Provide **`make test-fast`** locally mirroring CI’s fast stage.

**Common Mistakes (22.8.3)**

- Hooks that **mutate** files silently mid-commit without user awareness.

### 22.8.4 Regression Testing

#### Beginner

Add a test every time you fix a **bug**—prove the fix.

#### Intermediate

Maintain **golden files** for stable serializers with reviewable diffs.

#### Expert

Track **API compatibility** with **OpenAPI diff** tools in CI.

**Key Points (22.8.4)**

- Regressions are **process failures**—tests encode lessons.

**Best Practices (22.8.4)**

- Link tests to **issue IDs** in comments sparingly but usefully.

**Common Mistakes (22.8.4)**

- Removing tests because they fail after **intentional** break—update expectations instead.

### 22.8.5 Best Practices

#### Beginner

Fast, deterministic, isolated tests; clear failures.

#### Intermediate

**Flake detection**: rerun on failure once, quarantine chronic flakes.

#### Expert

**SLOs** for CI time—optimize slow tests or split suites.

**Key Points (22.8.5)**

- Developer experience is part of **quality**.

**Best Practices (22.8.5)**

- Publish **how to run a single failing test** in `CONTRIBUTING.md` when helpful.

**Common Mistakes (22.8.5)**

- Ignoring **flaky** tests— they erode **trust**.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points

- **`TestClient`** provides synchronous, high-fidelity ASGI tests for most FastAPI routes.
- **Parametrize** inputs; assert **status**, **headers**, and **JSON** shapes deliberately.
- Use **`dependency_overrides`** to mock **auth**, **settings**, and **services** cleanly.
- Move up the pyramid: **unit → integration → e2e → load** with clear purpose.
- **CI** should run **fast checks** always and **heavy** suites on a schedule or main branch.

### Best Practices

- Prefer **factories**, **fixtures**, and **app factories** over copy-pasted setup.
- Test **validation** and **error envelopes** alongside happy paths.
- Enforce **coverage** thresholds with exceptions for generated code.
- Containerize **integration** dependencies for **prod parity**.
- Monitor **CI duration** and **flake rate** as product metrics.

### Common Mistakes

- Leaking **`dependency_overrides`** between tests.
- **Brittle** assertions on full Pydantic error strings.
- **SQLite-only** tests that miss **Postgres** semantics.
- Mocking imports at the **wrong** symbol path.
- Treating **coverage** percent as proof of **correctness**.
