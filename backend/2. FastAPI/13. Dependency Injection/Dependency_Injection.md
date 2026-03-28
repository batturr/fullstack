# Dependency Injection in FastAPI

## 📑 Table of Contents

- [13.1 Dependency Basics](#131-dependency-basics)
  - [13.1.1 Declare Dependencies](#1311-declare-dependencies)
  - [13.1.2 Dependency Parameter](#1312-dependency-parameter)
  - [13.1.3 Simple Dependencies](#1313-simple-dependencies)
  - [13.1.4 Sub-dependencies](#1314-sub-dependencies)
  - [13.1.5 Parameter Dependencies](#1315-parameter-dependencies)
- [13.2 Using Dependencies](#132-using-dependencies)
  - [13.2.1 In Path Operations](#1321-in-path-operations)
  - [13.2.2 In Other Dependencies](#1322-in-other-dependencies)
  - [13.2.3 Classes as Dependencies](#1323-classes-as-dependencies)
  - [13.2.4 Functions as Dependencies](#1324-functions-as-dependencies)
  - [13.2.5 Multiple Dependencies](#1325-multiple-dependencies)
- [13.3 Advanced Dependencies](#133-advanced-dependencies)
  - [13.3.1 Dependency Caching](#1331-dependency-caching)
  - [13.3.2 Global Dependencies](#1332-global-dependencies)
  - [13.3.3 Scoped Dependencies](#1333-scoped-dependencies)
  - [13.3.4 Parametrized Dependencies](#1334-parametrized-dependencies)
  - [13.3.5 Dynamic Dependencies](#1335-dynamic-dependencies)
- [13.4 Dependency Configuration](#134-dependency-configuration)
  - [13.4.1 Depend() Function](#1341-depend-function)
  - [13.4.2 Optional Dependencies](#1342-optional-dependencies)
  - [13.4.3 Default Dependencies](#1343-default-dependencies)
  - [13.4.4 Error Handling in Dependencies](#1344-error-handling-in-dependencies)
  - [13.4.5 Dependency Ordering](#1345-dependency-ordering)
- [13.5 Common Dependency Patterns](#135-common-dependency-patterns)
  - [13.5.1 Database Connection](#1351-database-connection)
  - [13.5.2 Query Parameters as Dependencies](#1352-query-parameters-as-dependencies)
  - [13.5.3 Header Validation](#1353-header-validation)
  - [13.5.4 Authentication Dependency](#1354-authentication-dependency)
  - [13.5.5 Authorization Dependency](#1355-authorization-dependency)
- [13.6 Testing with Dependencies](#136-testing-with-dependencies)
  - [13.6.1 Mocking Dependencies](#1361-mocking-dependencies)
  - [13.6.2 Override Dependencies](#1362-override-dependencies)
  - [13.6.3 Test Fixtures](#1363-test-fixtures)
  - [13.6.4 Dependency Testing Patterns](#1364-dependency-testing-patterns)
  - [13.6.5 Integration Testing](#1365-integration-testing)
- [13.7 Best Practices](#137-best-practices)
  - [13.7.1 Dependency Organization](#1371-dependency-organization)
  - [13.7.2 Reusable Dependencies](#1372-reusable-dependencies)
  - [13.7.3 Dependency Documentation](#1373-dependency-documentation)
  - [13.7.4 Performance Considerations](#1374-performance-considerations)
  - [13.7.5 Anti-patterns to Avoid](#1375-anti-patterns-to-avoid)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 13.1 Dependency Basics

FastAPI’s **dependency injection** system resolves parameters before your path operation runs. Dependencies can be **async** or **sync** and may themselves **depend** on other dependencies.

### 13.1.1 Declare Dependencies

#### Beginner

Use **`Depends(some_callable)`** as a **default value** for a parameter. **`some_callable`** is a function or class that FastAPI **calls** to produce the injected value.

```python
from fastapi import Depends, FastAPI

app = FastAPI()


def hello_dep() -> str:
    return "world"


@app.get("/hi")
def hi(msg: str = Depends(hello_dep)) -> dict[str, str]:
    return {"msg": msg}
```

#### Intermediate

The **parameter name** (`msg`) is independent of the dependency’s return value typing—annotate **`msg: str`** for clarity and editor support.

#### Expert

Dependencies participate in **OpenAPI** only when they map to **known parameter types** (e.g., **`Header`**, **`Query`**). **Arbitrary** **`Depends`** return values are **internal**—document them in **prose** or **custom** extensions.

**Key Points (13.1.1)**

- **`Depends`** is the **core** primitive for DI in FastAPI.
- Return type of the dependency becomes the **injected** type (conceptually).

**Best Practices (13.1.1)**

- Type dependency return values **explicitly** for **mypy/pyright**.

**Common Mistakes (13.1.1)**

- Calling **`hello_dep()`** manually inside the route when **injection** already provides the value—duplicates logic.

---

### 13.1.2 Dependency Parameter

#### Beginner

Dependencies are **function parameters** whose default is **`Depends(...)`**. FastAPI **does not** treat them as query params.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def prefix(p: str = "api") -> str:
    return p


@app.get("/echo-prefix")
def echo_prefix(
    pre: Annotated[str, Depends(prefix)],
) -> dict[str, str]:
    return {"pre": pre}
```

#### Intermediate

**`Annotated[T, Depends(dep)]`** style avoids **`= Depends(...)`** default pitfalls and is **recommended** in modern FastAPI.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def tenant() -> str:
    return "acme"


@app.get("/t")
def t(tenant_id: Annotated[str, Depends(tenant)]) -> dict[str, str]:
    return {"tenant_id": tenant_id}
```

#### Expert

**Signature inspection** drives resolution order—**rename** parameters carefully; dependency **cache keys** use the **callable** and **path** context, not param names alone.

**Key Points (13.1.2)**

- **`Annotated[..., Depends(...)]`** is the preferred spelling in new code.

**Best Practices (13.1.2)**

- Name injected values for **domain** meaning (`**`current_user`**`), not **`dep1`**.

**Common Mistakes (13.1.2)**

- Shadowing **builtins** with dependency parameter names.

---

### 13.1.3 Simple Dependencies

#### Beginner

A **simple** dependency has **no parameters** (or only **defaults**) and returns a **service** or **config** fragment.

```python
from functools import lru_cache

from fastapi import Depends, FastAPI

app = FastAPI()


@lru_cache
def settings() -> dict[str, str]:
    return {"env": "dev"}


@app.get("/cfg")
def cfg(s: dict[str, str] = Depends(settings)) -> dict[str, str]:
    return s
```

#### Intermediate

**`lru_cache`** on **dependency** functions mimics **singleton** settings—ensure **cache** invalidation strategy if you **reload** config at runtime.

#### Expert

For **multi-tenant** apps, **simple** global settings dependencies may be **wrong**—compose **tenant** from **request** in a **higher** dependency.

**Key Points (13.1.3)**

- Simple dependencies promote **reuse** across routes.

**Best Practices (13.1.3)**

- Keep **side effects** out of **pure** dependency callables when possible.

**Common Mistakes (13.1.3)**

- Opening **new DB connections** per call without **yield/cleanup** pattern.

---

### 13.1.4 Sub-dependencies

#### Beginner

Dependencies may **declare** their own **`Depends`** parameters—FastAPI resolves the **graph** recursively.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def base_token() -> str:
    return "tok"


def user_from_token(token: Annotated[str, Depends(base_token)]) -> str:
    return f"user-for-{token}"


@app.get("/me")
def me(user: Annotated[str, Depends(user_from_token)]) -> dict[str, str]:
    return {"user": user}
```

#### Intermediate

**Caching** applies per **request** by default for the same dependency **callable** in a tree—see **13.3.1**.

#### Expert

**Circular** dependency graphs **fail** at startup or first request—**refactor** shared pieces into a **third** dependency.

**Key Points (13.1.4)**

- Sub-dependencies **compose** cross-cutting concerns (**auth → user → db**).

**Best Practices (13.1.4)**

- Limit **depth** for **readability**; deep graphs are **hard** to trace.

**Common Mistakes (13.1.4)**

- **Hidden** **I/O** in **deep** chains causing **latency** surprises.

---

### 13.1.5 Parameter Dependencies

#### Beginner

Combine **`Depends`** with **`Query`**, **`Header`**, **`Cookie`**, etc. **Inside** the dependency function signature.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Query

app = FastAPI()


def pagination(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> tuple[int, int]:
    return skip, limit


@app.get("/items")
def items(
    page: Annotated[tuple[int, int], Depends(pagination)],
) -> dict[str, int | tuple[int, int]]:
    skip, limit = page
    return {"skip": skip, "limit": limit, "slice": page}
```

#### Intermediate

This pattern keeps **OpenAPI** accurate for **`skip`/`limit`** while packaging them as **one** injected **object** if you return a **dataclass** instead of **tuple**.

#### Expert

**Cursor-based** pagination should **validate** **`cursor`** encoding in the **dependency**, not in every route.

**Key Points (13.1.5)**

- Parameter dependencies **DRY** up repeated **query** signatures.

**Best Practices (13.1.5)**

- Return **small** **dataclasses** or **TypedDict** for readability.

**Common Mistakes (13.1.5)**

- Returning **mutable** **lists** shared across requests—**never** do that from **cached** deps without **per-request** scope.

---

## 13.2 Using Dependencies

### 13.2.1 In Path Operations

#### Beginner

Any path operation function can declare **`Depends`** parameters alongside **`Path`**, **`Query`**, **`Body`**, etc.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def trace_id() -> str:
    return "abc"


@app.get("/ping")
def ping(tid: Annotated[str, Depends(trace_id)]) -> dict[str, str]:
    return {"tid": tid}
```

#### Intermediate

**`APIRouter`** routes share the same **DI** system—attach **common** dependencies at **router** or **app** level.

#### Expert

**WebSocket** endpoints also support **`Depends`**—useful for **auth** on **WS** handshakes.

**Key Points (13.2.1)**

- Path operations remain **thin**; **logic** moves to **dependencies** and **services**.

**Best Practices (13.2.1)**

- Avoid **fat** path functions—**orchestrate** in **services**.

**Common Mistakes (13.2.1)**

- Putting **DB transactions** only in route without **dependency yield** cleanup.

---

### 13.2.2 In Other Dependencies

#### Beginner

**Chain** dependencies by adding **`Depends`** parameters to **dependency functions** themselves (see **13.1.4**).

#### Intermediate

**Shared** **sub-dependencies** (e.g., **`get_db`**) should be **one** function imported everywhere for **consistent** **session** lifecycle.

#### Expert

**Request-scoped** context (locale, auth) flows naturally down the **tree**—avoid **global** **thread-local** unless you fully **control** **workers**.

**Key Points (13.2.2)**

- **Composition** beats **inheritance** for FastAPI DI.

**Best Practices (13.2.2)**

- **Type** intermediate dependency results as **Protocol** or **ABC** for **test doubles**.

**Common Mistakes (13.2.2)**

- **Duplicating** the same **`Depends(get_db)`** at **every** layer unnecessarily—**trust** the **cache** per request.

---

### 13.2.3 Classes as Dependencies

#### Beginner

FastAPI will **call** a class dependency (no **`__call__`** required)—it **instantiates** the class. Often you use **`__init__`** with **`Depends`** parameters.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


class PageQuery:
    def __init__(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> None:
        self.skip = skip
        self.limit = limit


@app.get("/page")
def page(pq: Annotated[PageQuery, Depends()]) -> dict[str, int]:
    return {"skip": pq.skip, "limit": pq.limit}
```

Note: **`Depends()`** without argument uses the **parameter type** as the callable—here **`PageQuery`**.

#### Intermediate

**`__call__`** pattern is less common; prefer **functions** or **init** injection for clarity.

#### Expert

**Per-request** **service classes** can hold **validated** **query** state—useful in **CQRS** **read** models.

**Key Points (13.2.3)**

- Class-based dependencies integrate with **OOP** teams’ mental models.

**Best Practices (13.2.3)**

- Keep **constructors** **fast**—no **blocking** **I/O** without **async** patterns.

**Common Mistakes (13.2.3)**

- Expecting **singleton** semantics—**new instance** per resolution unless **cached**.

---

### 13.2.4 Functions as Dependencies

#### Beginner

**Plain functions** (sync or async) are the most **idiomatic** dependencies. When a dependency declares a parameter with the **same name** as a **path**, **query**, or **header** parameter, FastAPI **injects** that value into the dependency.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


async def load_widget(widget_id: str) -> dict[str, str]:
    return {"id": widget_id, "name": "demo"}


@app.get("/widgets/{widget_id}")
async def get_widget(
    w: Annotated[dict[str, str], Depends(load_widget)],
) -> dict[str, str]:
    return w
```

#### Intermediate

**`async`** dependencies run **await**ed; **sync** deps run in **threadpool** when in **async** route (framework handles this).

#### Expert

**Blocking** **sync** **I/O** in **sync** dependency called from **async** route still **blocks**—use **async** drivers or **`run_in_executor`**.

**Key Points (13.2.4)**

- **Name matching** wires **path/query/header** parameters into **dependencies**.

**Best Practices (13.2.4)**

- Prefer **async** I/O end-to-end for **high** concurrency.

**Common Mistakes (13.2.4)**

- **Mismatched** parameter names between **path** and **dependency** silently **fails** or uses **wrong** source.

---

### 13.2.5 Multiple Dependencies

#### Beginner

Declare **multiple** **`Depends`** parameters—FastAPI resolves **all** before the route runs.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def a() -> int:
    return 1


def b() -> int:
    return 2


@app.get("/sum")
def sum_ab(
    x: Annotated[int, Depends(a)],
    y: Annotated[int, Depends(b)],
) -> dict[str, int]:
    return {"sum": x + y}
```

#### Intermediate

**Order** of resolution follows **dependency graph** **topological** order, not **left-to-right** in the route signature.

#### Expert

**Parallel** **independent** async dependencies could theoretically be **gathered**—FastAPI’s **resolution** is **sequential** per implementation details—**profile** if **many** **I/O** deps.

**Key Points (13.2.5)**

- Multiple dependencies **compose** without **nesting** functions explicitly.

**Best Practices (13.2.5)**

- If **many** deps share **setup**, **merge** into **one** **facade** dependency.

**Common Mistakes (13.2.5)**

- **Repeating** **expensive** **uncached** deps—see **caching**.

---

## 13.3 Advanced Dependencies

### 13.3.1 Dependency Caching

#### Beginner

Within a **single request**, if the **same** dependency function is needed **multiple** times, FastAPI **caches** the result by default (**`use_cache=True`** in **`Depends`**).

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()

calls = {"n": 0}


def counted() -> int:
    calls["n"] += 1
    return calls["n"]


def dep_a(x: Annotated[int, Depends(counted)]) -> int:
    return x


def dep_b(x: Annotated[int, Depends(counted)]) -> int:
    return x + 10


@app.get("/cache-demo")
def cache_demo(
    v1: Annotated[int, Depends(dep_a)],
    v2: Annotated[int, Depends(dep_b)],
) -> dict[str, int]:
    return {"v1": v1, "v2": v2, "counted_calls_this_request": calls["n"]}
```

#### Intermediate

Use **`Depends(counted, use_cache=False)`** to **force** **re-execution** when **intentional** (rare—e.g., **time**-based **nonce** generator).

#### Expert

**Cache** is **per-request**, **not** global—**global** **singletons** use **`lru_cache`** or **app.state** with **care**.

**Key Points (13.3.1)**

- Default **caching** prevents **duplicate** **DB** **hits** in **one** request.

**Best Practices (13.3.1)**

- Structure deps so **cached** results are **immutable** or **safe** to share.

**Common Mistakes (13.3.1)**

- Assuming **cache** spans **requests**—it does **not**.

---

### 13.3.2 Global Dependencies

#### Beginner

Add **`dependencies=[Depends(...)]`** to **`FastAPI()`** or **`APIRouter()`** to run **deps** for **all** routes in scope without injecting return values into signatures.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException


def require_request_id(
    x_request_id: Annotated[str | None, Header(alias="X-Request-Id")] = None,
) -> None:
    if not x_request_id:
        raise HTTPException(status_code=400, detail="Missing X-Request-Id")


app = FastAPI(dependencies=[Depends(require_request_id)])


@app.get("/ok")
def ok() -> dict[str, bool]:
    return {"ok": True}
```

#### Intermediate

Global deps are great for **policy** enforcement (**request id**, **internal** **auth** header).

#### Expert

**Observability**: pair **global** deps with **middleware** for **tracing**—avoid **double** work; **choose** **one** layer as **source of truth**.

**Key Points (13.3.2)**

- Global **dependencies** **run** but **don’t** **inject** return values into **route** params automatically.

**Best Practices (13.3.2)**

- Keep **global** deps **fast** or **async** lightweight checks.

**Common Mistakes (13.3.2)**

- Using **global** deps for **data** you need in **route**—use **normal** **`Depends`** instead.

---

### 13.3.3 Scoped Dependencies

#### Beginner

**Request scope** is implicit—**yield** dependencies create a **context** around the request (e.g., **DB session**).

```python
from collections.abc import Generator

from fastapi import Depends, FastAPI

app = FastAPI()


def get_db() -> Generator[str, None, None]:
    db = "db-conn"
    try:
        yield db
    finally:
        # close db
        _ = db


@app.get("/db")
def use_db(conn: str = Depends(get_db)) -> dict[str, str]:
    return {"conn": conn}
```

#### Intermediate

**`async def get_db()`** with **`async yield`** supports **async** session **cleanup**.

#### Expert

True **arbitrary** scopes (request vs websocket vs background) need **care**—**background tasks** may **outlive** request **session**—**detach** objects or **new** session.

**Key Points (13.3.3)**

- **`yield`** dependencies are the **pattern** for **acquire/release**.

**Best Practices (13.3.3)**

- Always **close** resources in **`finally`** after **`yield`**.

**Common Mistakes (13.3.3)**

- **Raising** after **`yield`** without understanding **exception** propagation semantics.

---

### 13.3.4 Parametrized Dependencies

#### Beginner

Use a **factory** function returning a **dependency** callable with **closure** over parameters.

```python
from typing import Annotated, Callable

from fastapi import Depends, FastAPI, HTTPException

app = FastAPI()


def require_role(expected: str) -> Callable[[], None]:
    def checker() -> None:
        role = "admin"  # pretend from token
        if role != expected:
            raise HTTPException(status_code=403, detail="wrong role")

    return checker


@app.get("/admin", dependencies=[Depends(require_role("admin"))])
def admin_only() -> dict[str, str]:
    return {"area": "admin"}
```

#### Intermediate

Alternatively, **`Annotated`** with **custom** markers + **`Depends`** wrappers—keep **readable**.

#### Expert

**RBAC** matrices may be **data-driven**—pass **`permission: str`** into **factory** reading from **policy** **engine**.

**Key Points (13.3.4)**

- Factories **encode** **parameterized** **policies**.

**Best Practices (13.3.4)**

- **Cache** **heavy** **policy** **loads** **outside** **per-request** **hot** path when possible.

**Common Mistakes (13.3.4)**

- Creating **new** **callables** **inline** without **stable** **identity**—can **break** **OpenAPI** or **caching** expectations.

---

### 13.3.5 Dynamic Dependencies

#### Beginner

**Dynamic** behavior often uses **request** inspection inside a **dependency** via **`Request`** injection.

```python
from fastapi import Depends, FastAPI, Request

app = FastAPI()


def pick_backend(request: Request) -> str:
    if request.headers.get("X-Use-Legacy") == "1":
        return "legacy"
    return "modern"


@app.get("/route")
def dynamic(
    backend: str = Depends(pick_backend),
) -> dict[str, str]:
    return {"backend": backend}
```

#### Intermediate

**Feature flags** from **settings** + **user cohort** combine here—**test** **all** branches.

#### Expert

**Over-dynamic** routing complicates **caching**, **observability**, and **OpenAPI**—prefer **explicit** **versioned** endpoints when possible.

**Key Points (13.3.5)**

- **`Request`** access is **powerful** but **ties** logic to **HTTP** details.

**Best Practices (13.3.5)**

- **Log** chosen **backend**/**variant** with **low cardinality** labels.

**Common Mistakes (13.3.5)**

- **Branching** security decisions **opaquely** without **audit** trail.

---

## 13.4 Dependency Configuration

### 13.4.1 Depend() Function

#### Beginner

**`Depends(dependency, use_cache=True)`** is the **`Depends`** class/callable you already use—**configuration** is mostly **`use_cache`**.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def noisy() -> int:
    return 1


@app.get("/no-cache")
def no_cache(
    a: Annotated[int, Depends(noisy, use_cache=False)],
    b: Annotated[int, Depends(noisy, use_cache=False)],
) -> dict[str, int]:
    return {"a": a, "b": b}
```

#### Intermediate

**`security` dependencies** (OAuth2 schemes) are **`Depends`** under the hood—same **caching** rules.

#### Expert

Custom **`OpenAPI`** for **dependencies** is **limited**—use **`HTTPBearer`** etc. for **standard** **security** models.

**Key Points (13.4.1)**

- **`use_cache=False`** is **niche**—**justify** with **docs** in code.

**Best Practices (13.4.1)**

- Default **`use_cache=True`** unless you **must** **recompute**.

**Common Mistakes (13.4.1)**

- Disabling **cache** to **fix** a **bug** caused by **mutable** **shared** state—**fix** **mutability** instead.

---

### 13.4.2 Optional Dependencies

#### Beginner

Return **`None`** from a dependency or use **`HTTPException`** only when **required**. Alternatively, wrap **OAuth2** optional flows.

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


def maybe_user() -> str | None:
    return None


@app.get("/public")
def public(user: Annotated[str | None, Depends(maybe_user)]) -> dict[str, str | None]:
    return {"user": user}
```

#### Intermediate

**Optional auth** is common for **public** **feeds** with **personalization** when **logged in**.

#### Expert

**Security**: distinguish **`None`** user from **invalid** token—**invalid** should be **401**, not **silent** **guest**.

**Key Points (13.4.2)**

- **Optional** dependencies should be **explicit** in typing.

**Best Practices (13.4.2)**

- **Document** **behavior** when **auth** header **missing** vs **bad**.

**Common Mistakes (13.4.2)**

- Treating **malformed** **Bearer** token as **anonymous**.

---

### 13.4.3 Default Dependencies

#### Beginner

**Router-level** **`dependencies=[]`** adds **default** **runs** for **all** routes on that router.

```python
from fastapi import APIRouter, Depends, FastAPI

app = FastAPI()
router = APIRouter(prefix="/api", dependencies=[Depends(lambda: None)])


@router.get("/x")
def x() -> dict[str, bool]:
    return {"x": True}


app.include_router(router)
```

#### Intermediate

Combine **router** defaults with **route-specific** **`Depends`** for **layered** **policy**.

#### Expert

**OpenAPI** **security** at **router** level via **`dependencies`** doesn’t always **mark** **security** the same as **`Security()`**—verify **docs**.

**Key Points (13.4.3)**

- **Defaults** reduce **boilerplate** on **large** routers.

**Best Practices (13.4.3)**

- **Group** routes by **policy** boundaries with **routers**.

**Common Mistakes (13.4.3)**

- **Over-broad** **router** **dependencies** making **health** endpoints **fail**.

---

### 13.4.4 Error Handling in Dependencies

#### Beginner

Raise **`HTTPException`** from dependencies—FastAPI converts them to **HTTP** responses. Path parameters with the **same name** as the dependency argument are injected automatically.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException

app = FastAPI()


def must_be_even(n: int) -> int:
    if n % 2:
        raise HTTPException(status_code=400, detail="n must be even")
    return n


@app.get("/even/{n}")
def even(n: Annotated[int, Depends(must_be_even)]) -> dict[str, int]:
    return {"n": n}
```

#### Intermediate

**Custom** exceptions can be mapped with **`@app.exception_handler`**.

#### Expert

**Retry**-able **errors** (**503**) should **not** be used for **validation**—use **400/422**.

**Key Points (13.4.4)**

- Dependencies are ideal **guard clauses** before **business** logic.

**Best Practices (13.4.4)**

- Use **consistent** **error** codes across **similar** failures.

**Common Mistakes (13.4.4)**

- **Catching** **broad** **Exception** and returning **500** hiding **bugs**.

---

### 13.4.5 Dependency Ordering

#### Beginner

FastAPI **topologically sorts** the dependency graph—**declare** **dependencies** without worrying about **left-to-right** order in **signatures**.

#### Intermediate

**Side-effect** order **can** still **matter** if deps **mutate** **shared** **request state**—**avoid** **mutation**.

#### Expert

**Yield** dependencies’ **teardown** runs **reverse** order of **setup** in **Python** **context** **stack**—similar to **nested** **context managers**.

**Key Points (13.4.5)**

- **Pure** dependencies make **ordering** irrelevant.

**Best Practices (13.4.5)**

- **Minimize** **side** **effects**; **prefer** **return** **values**.

**Common Mistakes (13.4.5)**

- Relying on **ordering** of **independent** **global** **mutations**.

---

## 13.5 Common Dependency Patterns

### 13.5.1 Database Connection

#### Beginner

Use **`yield`** in a **`get_db`** dependency to **open** a session at request start and **close** after response.

```python
from collections.abc import Generator

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

app = FastAPI()


def get_db() -> Generator[Session, None, None]:
    db = Session()  # illustrative; use your engine/sessionmaker
    try:
        yield db
    finally:
        db.close()


@app.get("/db-health")
def db_health(db: Session = Depends(get_db)) -> dict[str, bool]:
    return {"db": bool(db)}
```

#### Intermediate

**SQLModel**/**SQLAlchemy 2.0** **async** sessions use **`async def get_db(): async with session_factory() as s: yield s`**.

#### Expert

**Read replicas**: choose **connection** based on **`request.method == "GET"`** in **`get_db`** with **care** for **read-your-writes** consistency.

**Key Points (13.5.1)**

- **Always** **close**/**return** connections to the pool.

**Best Practices (13.5.1)**

- One **session** per **request** unless you **know** you need **nested** **unit-of-work**.

**Common Mistakes (13.5.1)**

- **Sharing** **session** across **tasks**/**threads**.

---

### 13.5.2 Query Parameters as Dependencies

#### Beginner

Encapsulate **filter** query params in a **`FilterParams`** dependency for **list** endpoints.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Query

app = FastAPI()


class ItemFilter:
    def __init__(
        self,
        q: Annotated[str | None, Query()] = None,
        min_price: Annotated[float | None, Query(ge=0)] = None,
    ) -> None:
        self.q = q
        self.min_price = min_price


@app.get("/items")
def list_items(f: Annotated[ItemFilter, Depends()]) -> dict[str, str | float | None]:
    return {"q": f.q, "min_price": f.min_price}
```

#### Intermediate

Return a **Pydantic `BaseModel`** instead of a class if you want **schema** reuse.

#### Expert

**Stable sorting** + **cursor** pagination as **dependencies** keeps **list** endpoints **consistent**.

**Key Points (13.5.2)**

- Query **dependencies** keep **OpenAPI** **rich** without **duplication**.

**Best Practices (13.5.2)**

- **Validate** **combinations** (e.g., **`from > to`**) in **`model_validator`**.

**Common Mistakes (13.5.2)**

- **Exploding** **query** **surface** without **pagination** limits.

---

### 13.5.3 Header Validation

#### Beginner

Use **`Header()`** inside dependencies to **require** or **optionalize** headers with **validation**.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()


def api_version(
    x_api_version: Annotated[str | None, Header(alias="X-Api-Version")] = None,
) -> str:
    if x_api_version not in (None, "1", "2"):
        raise HTTPException(status_code=400, detail="Unsupported API version")
    return x_api_version or "1"


@app.get("/versioned")
def versioned(v: Annotated[str, Depends(api_version)]) -> dict[str, str]:
    return {"version": v}
```

#### Intermediate

**Case-insensitive** header names are handled by **Starlette**—still use **canonical** casing in **docs**.

#### Expert

**Signature** headers (**`Digest`**, **`Authorization`**) may need **custom** parsing—keep **crypto** in **security** utilities.

**Key Points (13.5.3)**

- Header **dependencies** centralize **API gateway** contracts.

**Best Practices (13.5.3)**

- Avoid **too many** **required** **custom** headers for **public** APIs.

**Common Mistakes (13.5.3)**

- Confusing **missing** header with **empty** string.

---

### 13.5.4 Authentication Dependency

#### Beginner

Parse **Bearer** token and return **user** id or raise **401**.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()


def current_user_id(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    if token != "secret-token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return "user-123"


@app.get("/me")
def me(uid: Annotated[str, Depends(current_user_id)]) -> dict[str, str]:
    return {"user_id": uid}
```

#### Intermediate

Prefer **`HTTPBearer`** from **`fastapi.security`** for **OpenAPI** **security** schemes.

#### Expert

**JWT** validation belongs in **one** dependency; **cache JWKS** with **TTL** and **handle** **key rotation**.

**Key Points (13.5.4)**

- **401** = **not authenticated**; **403** = **authenticated** but **not allowed**.

**Best Practices (13.5.4)**

- **Short-lived** **access tokens** + **refresh** **flow** for **web** apps.

**Common Mistakes (13.5.4)**

- Logging **raw** **tokens**.

---

### 13.5.5 Authorization Dependency

#### Beginner

Build on **`current_user`** dependency; check **roles** and raise **403**.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException

app = FastAPI()


def current_user() -> dict[str, str]:
    return {"id": "1", "role": "user"}


def require_admin(
    user: Annotated[dict[str, str], Depends(current_user)],
) -> dict[str, str]:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


@app.get("/admin/ping")
def admin_ping(admin: Annotated[dict[str, str], Depends(require_admin)]) -> dict[str, str]:
    return {"admin": admin["id"]}
```

#### Intermediate

**Object-level** **authorization** needs **`resource_id`** from **path** + **DB** lookup—keep checks **close** to **data** access.

#### Expert

**Policy engines** (**OPA**, **Casbin**) integrate via **dependencies** returning **decision** objects.

**Key Points (13.5.5)**

- **Authorize** after **authenticate**; **separate** concerns.

**Best Practices (13.5.5)**

- **Audit** **denials** for **suspicious** patterns.

**Common Mistakes (13.5.5)**

- **Role** checks in **every** route **inline**—**centralize** in **dependencies**.

---

## 13.6 Testing with Dependencies

### 13.6.1 Mocking Dependencies

#### Beginner

In tests, replace heavy dependencies with **simple** functions returning **fixtures**.

```python
from fastapi import Depends, FastAPI

app = FastAPI()


def real_settings() -> dict[str, str]:
    return {"env": "prod"}


@app.get("/cfg")
def cfg(s: dict[str, str] = Depends(real_settings)) -> dict[str, str]:
    return s
```

#### Intermediate

Use **`pytest`** **monkeypatch** temporarily to **swap** **`real_settings`** if you **import** routes as a **module**.

#### Expert

Prefer **`app.dependency_overrides`** (next section) over **monkeypatch** for **integration** tests hitting **`TestClient`**.

**Key Points (13.6.1)**

- **Mocks** should mimic **types** and **invariants** of **real** deps.

**Best Practices (13.6.1)**

- **Verify** **mock** **call** counts for **expensive** **operations** when relevant.

**Common Mistakes (13.6.1)**

- **Over-mocking** **HTTP** layer so tests **never** exercise **validation**.

---

### 13.6.2 Override Dependencies

#### Beginner

**`app.dependency_overrides[original] = replacement`** swaps implementation for **`TestClient`**.

```python
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


def get_token() -> str:
    return "real"


@app.get("/t")
def t(token: str = Depends(get_token)) -> dict[str, str]:
    return {"token": token}


def fake_token() -> str:
    return "fake"


app.dependency_overrides[get_token] = fake_token
client = TestClient(app)


def test_override() -> None:
    r = client.get("/t")
    assert r.json() == {"token": "fake"}
```

#### Intermediate

**Reset** overrides in **`pytest` fixtures** **`yield`** teardown to avoid **test** **pollution**.

#### Expert

**Nested** dependencies require overriding **leaf** **callables** or **higher-level** **facade** deps—**plan** **composition** for **testability**.

**Key Points (13.6.2)**

- Overrides apply **per app instance**—create **fresh** app or **clear** dict.

**Best Practices (13.6.2)**

- **`autouse` pytest fixtures** can **clear** **`dependency_overrides`** after each test.

**Common Mistakes (13.6.2)**

- Forgetting to **clear** overrides → **flaky** **suite**.

---

### 13.6.3 Test Fixtures

#### Beginner

Use **`pytest` fixtures** to build **`TestClient`**, **DB**, and **override** **deps** together.

```python
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture()
def client() -> TestClient:
    app = FastAPI()

    @app.get("/ping")
    def ping() -> dict[str, str]:
        return {"p": "pong"}

    return TestClient(app)
```

#### Intermediate

**HTTPX** **`AsyncClient`** with **`ASGITransport`** tests **async** routes more **faithfully**.

#### Expert

**Factory fixtures** for **tenant** contexts help **multi-tenant** **authorization** tests.

**Key Points (13.6.3)**

- **Fixture** **scope** (**`function`**, **`module`**) trades **speed** vs **isolation**.

**Best Practices (13.6.3)**

- Prefer **`function`** scope for **mutable** **global** **state** unless **proven** safe.

**Common Mistakes (13.6.3)**

- **Shared** **DB** **state** across **tests** without **transactions** **rollback**.

---

### 13.6.4 Dependency Testing Patterns

#### Beginner

**Unit test** dependency **callables** **directly** with **plain** **Python** arguments.

```python
from fastapi import HTTPException

import pytest


def must_be_even(n: int) -> int:
    if n % 2:
        raise HTTPException(status_code=400, detail="n must be even")
    return n


def test_must_be_even() -> None:
    assert must_be_even(2) == 2
    with pytest.raises(HTTPException) as ei:
        must_be_even(3)
    assert ei.value.status_code == 400
```

#### Intermediate

**TestClient** verifies **wiring**; **direct** calls verify **pure** **logic** **fast**.

#### Expert

**Property-based** testing (**Hypothesis**) on **validation** dependencies catches **edge** cases.

**Key Points (13.6.4)**

- **Two** **layers**: **unit** deps, **integration** routes.

**Best Practices (13.6.4)**

- **Table-driven** tests for **RBAC** **matrix**.

**Common Mistakes (13.6.4)**

- **Only** **E2E** tests → **slow** **feedback**.

---

### 13.6.5 Integration Testing

#### Beginner

Spin up **app** with **TestClient**, **override** **DB** to **SQLite** **file** or **in-memory**, run **migrations** if needed.

#### Intermediate

**Docker Compose** **integration** in **CI** catches **real** **Postgres** **behaviors**.

#### Expert

**Contract tests** between **services** validate **assumptions** **beyond** FastAPI **unit** tests.

**Key Points (13.6.5)**

- **Integration** tests **cost** more—**curate** **critical** **paths**.

**Best Practices (13.6.5)**

- **Seed** **minimal** **data** per **test** for **determinism**.

**Common Mistakes (13.6.5)**

- **Depending** on **test** **order** for **pass**—**isolate** **state**.

---

## 13.7 Best Practices

### 13.7.1 Dependency Organization

#### Beginner

**`deps.py`** or **`dependencies/`** package with **auth.py**, **db.py**, **pagination.py**.

#### Intermediate

**Barrel** **imports** (**`from app.deps import *`**)—avoid; **explicit** imports **aid** **refactors**.

#### Expert

**Bounded contexts**: **each** **module** exposes **`get_*`** **factories** **locally**; **avoid** **global** **god** **`deps.py`** in **large** **repos**.

**Key Points (13.7.1)**

- **Colocate** **deps** with **domain** when **specific**; **extract** **shared** **carefully**.

**Best Practices (13.7.1)**

- **Name** files by **concern**, not by **layer** only.

**Common Mistakes (13.7.1)**

- **Circular** **imports** between **`routes`** and **`deps`**—introduce **`protocols`** or **`TYPE_CHECKING`**.

---

### 13.7.2 Reusable Dependencies

#### Beginner

**Pagination**, **auth**, **db**, **common headers** should be **one** implementation reused.

#### Intermediate

**Compose** **small** deps into **`read_context`** **facades** for **complex** **read** endpoints.

#### Expert

**Libraries** can export **ready-made** deps (**`fastapi-users`**, etc.)—**wrap** to **pin** **policies**.

**Key Points (13.7.2)**

- **DRY** applies to **security** and **validation** **too**.

**Best Practices (13.7.2)**

- **Version** **internal** **libraries** **alongside** **API** **version**.

**Common Mistakes (13.7.2)**

- **Copy-paste** **auth** dep with **one** line **changed** → **divergence** **bugs**.

---

### 13.7.3 Dependency Documentation

#### Beginner

Document **non-obvious** **deps** with **docstrings**; reference them from **router** **tags** descriptions.

#### Intermediate

For **OpenAPI** **security**, use **`Security`** schemes—not only **raw** **`Header`** deps.

#### Expert

**Architecture Decision Records** for **auth**/**multi-tenant** **DI** choices help **onboarding**.

**Key Points (13.7.3)**

- **Docs** reduce **wrong** **usage** of **`Depends`** **factories**.

**Best Practices (13.7.3)**

- **Examples** in **`README`** for **adding** a new **authenticated** route.

**Common Mistakes (13.7.3)**

- **Undocumented** **global** **router** **dependencies** surprising **new** **developers**.

---

### 13.7.4 Performance Considerations

#### Beginner

**Cache** **per-request** **by default**; avoid **repeat** **expensive** **work**.

#### Intermediate

**Async** **I/O** **throughout** the **graph** when **latency**-bound.

#### Expert

**Connection pool** **sizing** **must** match **worker** **count** × **concurrency**—**monitor** **pool** **timeouts**.

**Key Points (13.7.4)**

- **Profile** **production**; **local** **dev** **lies**.

**Best Practices (13.7.4)**

- **Time** **dependencies** with **middleware** **metrics** (**histograms**).

**Common Mistakes (13.7.4)**

- **N+1** **queries** inside **loops** in **routes**—**use** **joinedload**/**batching**.

---

### 13.7.5 Anti-patterns to Avoid

#### Beginner

**Hidden** **global** **state** mutated by **dependencies** → **flaky** **behavior** under **concurrency**.

#### Intermediate

**Fat** **dependencies** that **do** **everything** (**send email**, **charge card**) → **hard** **to** **test** **and** **reuse**.

#### Expert

**Dynamic** **`import`** **inside** **hot** **deps** → **CPU** **cost**; **import** **once**.

**Key Points (13.7.5)**

- **Pure**, **typed**, **small** **dependencies** **scale** **best**.

**Best Practices (13.7.5)**

- **Review** **dependency** **graphs** in **PRs** like **call** **graphs**.

**Common Mistakes (13.7.5)**

- **Raising** **bare** **`Exception`** **swallowing** **tracebacks**.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- **`Depends`** wires **reusable** **callables** into **path operations** and **other** dependencies.
- **Sub-dependencies** **compose** **auth**, **DB**, **pagination**, and **policy** checks.
- **`yield`** dependencies manage **resources** with **scoped** **setup/teardown**.
- **Per-request caching** avoids **duplicate** **work** for the **same** **dependency** **callable**.
- **Tests** use **`dependency_overrides`** to **swap** **implementations** **safely**.

### Chapter Best Practices

- Prefer **`Annotated[..., Depends(...)]`** **style**.
- Keep **dependencies** **focused**; **push** **business** **logic** to **services**.
- Use **global/router** **`dependencies`** for **cross-cutting** **policy** **without** **return** **values**.
- **Document** **security** dependencies with **OpenAPI** **`Security`** **schemes** when **applicable**.
- **Clear** **`dependency_overrides`** after **tests**.

### Chapter Common Mistakes

- **Blocking** **I/O** in **async** **routes** **via** **sync** **deps**.
- **Leaking** **DB** **sessions** **without** **`yield`** **cleanup**.
- **Assuming** **dependency** **cache** is **global** **across** **requests**.
- **Mismatched** **parameter** **names** **breaking** **wiring** **silently** in **complex** **signatures**.
- **Using** **global** **dependencies** when you **need** **injected** **return** **values** in **routes**.

---
