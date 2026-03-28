# Decorators in Python

**Decorators** wrap functions or classes to add behavior (logging, validation, caching) without changing every call site. This guide covers syntax, authoring, class and method decorators, production patterns (timing, retry, rate limits), and built-ins—using **API handlers**, **file processing**, **scraping**, and **batch jobs** as contexts.

## 📑 Table of Contents

- [16.1 Basics](#161-basics)
  - [What Is a Decorator?](#what-is-a-decorator)
  - [Function Decorators](#function-decorators)
  - [Decorator Syntax](#decorator-syntax)
  - [Decorating Functions](#decorating-functions)
  - [Stacking Decorators](#stacking-decorators)
- [16.2 Creating Decorators](#162-creating-decorators)
  - [Simple Decorators](#simple-decorators)
  - [Decorators with Arguments](#decorators-with-arguments)
  - [functools.wraps](#functoolswraps)
  - [Decorators with Parameters on the Target](#decorators-with-parameters-on-the-target)
  - [Generic Decorators](#generic-decorators)
- [16.3 Advanced Decorators](#163-advanced-decorators)
  - [Class Decorators](#class-decorators)
  - [Decorating Methods](#decorating-methods)
  - [Method Decorators](#method-decorators)
  - [Property and Decorators](#property-and-decorators)
  - [Custom Descriptor Patterns](#custom-descriptor-patterns)
- [16.4 Practical Patterns](#164-practical-patterns)
  - [Logging Decorator](#logging-decorator)
  - [Timing Decorator](#timing-decorator)
  - [Caching and Memoization](#caching-and-memoization)
  - [Validation Decorator](#validation-decorator)
  - [Retry Decorator](#retry-decorator)
  - [Rate Limiting](#rate-limiting)
- [16.5 Built-in Decorators](#165-built-in-decorators)
  - [@property](#property)
  - [@staticmethod](#staticmethod)
  - [@classmethod](#classmethod)
  - [@lru_cache](#lru_cache)
  - [@wraps](#wraps)
  - [@dataclass](#dataclass)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 16.1 Basics

### What Is a Decorator?

**Beginner Level**: A decorator is a **callable that takes a callable and returns a new callable**. `@decorator_name` above `def` wraps the function at definition time.

```python
def shout(fn):
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs).upper()

    return wrapper


@shout
def greet(name: str) -> str:
    return f"hello {name}"


greet("ada")  # "HELLO ADA"
```

**Intermediate Level**: Frameworks use decorators to register **routes**, enforce **auth**, or attach **metrics**. The wrapped function remains the core implementation; the decorator adds a shell.

```python
ROUTES: dict[str, callable] = {}


def route(path: str):
    def deco(fn):
        ROUTES[path] = fn
        return fn

    return deco


@route("/health")
def health():
    return {"ok": True}
```

**Expert Level**: Decorators are **higher-order functions** at import time. Wrapping changes `__name__` and `inspect.signature` unless you use `functools.wraps`. For **async** endpoints, the wrapper must be `async def` and `await` the inner call.

```python
import functools
from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])


def async_timer(fn: F) -> F:
    @functools.wraps(fn)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        import time

        t0 = time.perf_counter()
        try:
            return await fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__} {(time.perf_counter() - t0) * 1000:.1f} ms")

    return wrapper  # type: ignore[return-value]
```

**Key Points**

- Decorators run when the module is **loaded** (definition time).
- The wrapper must be **callable** like the original.
- Use `wraps` to preserve metadata and `__wrapped__`.

---

### Function Decorators

**Beginner Level**: Decorate functions defined with `def` or `async def`.

```python
def identity(f):
    return f


@identity
def f():
    return 1
```

**Intermediate Level**: Cross-cutting checks for **CLI file commands**: ensure path exists before opening.

```python
from pathlib import Path


def existing_file(fn):
    def wrapper(path: str, *args, **kwargs):
        p = Path(path)
        if not p.is_file():
            raise FileNotFoundError(path)
        return fn(str(p), *args, **kwargs)

    return wrapper


@existing_file
def checksum(path: str) -> int:
    return sum(Path(path).read_bytes())
```

**Expert Level**: Type with **`ParamSpec`** so `*args` and `**kwargs` typing flows through the wrapper for mypy and IDEs.

```python
from functools import wraps
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")


def enforce_non_empty(fn: Callable[P, R]) -> Callable[P, R]:
    @wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        if not args and not kwargs:
            raise TypeError("missing arguments")
        return fn(*args, **kwargs)

    return wrapper
```

**Key Points**

- Match **sync vs async** between wrapper and wrapped.
- Forward `*args, **kwargs` unless the API is intentionally narrowed.
- Test decorated functions, not only bare functions.

---

### Decorator Syntax

**Beginner Level**: `@d` above `def f` means `f = d(f)`. `@d()` means the outer call returns a decorator: `f = d()(f)`.

```python
def bold(f):
    def w():
        return "<b>" + f() + "</b>"

    return w


@bold
def msg():
    return "hi"
```

**Intermediate Level**: **Parameterized** decorators use a factory returning the real decorator.

```python
def tag(name: str):
    def deco(f):
        def w():
            return f"<{name}>{f()}</{name}>"

        return w

    return deco


@tag("p")
def html_msg():
    return "hello"
```

**Expert Level**: With multiple decorators, **`@a` above `@b` above `def f`** applies as `f = a(b(f))` — `b` touches `f` first.

**Key Points**

- Factory decorators often need `()` even with defaults.
- Class decorators use identical `@` syntax.
- Deep nesting hurts readability—extract helpers.

---

### Decorating Functions

**Beginner Level**: After `@noop` that returns `f`, the name still refers to the original. If the decorator returns a wrapper, the name refers to the **wrapper**.

```python
def noop(f):
    return f


@noop
def add(a, b):
    return a + b
```

**Intermediate Level**: **JSON API**: decode bytes once in the wrapper.

```python
import json
from typing import Any, Callable


def json_body(fn: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(envelope: bytes, *args, **kwargs):
        data = json.loads(envelope.decode("utf-8"))
        return fn(data, *args, **kwargs)

    return wrapper


@json_body
def handle_create_user(payload: dict) -> dict:
    return {"created": payload.get("email")}
```

**Expert Level**: Access the original via **`__wrapped__`** when using `functools.wraps`—useful in tests.

```python
import functools


def logged(f):
    @functools.wraps(f)
    def w(*a, **k):
        print("call", f.__name__)
        return f(*a, **k)

    return w


@logged
def work(x: int) -> int:
    return x + 1


original = work.__wrapped__
```

**Key Points**

- Document if the wrapper changes the public signature.
- Prefer explicit argument transformation over magic.
- `__wrapped__` chains through multiple decorators.

---

### Stacking Decorators

**Beginner Level**: Nearest decorator to `def` runs first; outer runs last in application order: `f = outer(inner(f))`.

```python
def a(f):
    return lambda: "A" + f()


def b(f):
    return lambda: "B" + f()


@a
@b
def core():
    return "C"


core()  # "ABC"
```

**Intermediate Level**: **Auth vs logging** order is a policy choice: log failed auth attempts only if auth runs inside logging, etc.

```python
def log_calls(f):
    def w(*a, **k):
        print("enter", f.__name__)
        return f(*a, **k)

    return w


def require_token(f):
    def w(token: str, *a, **k):
        if token != "ok":
            raise PermissionError
        return f(*a, **k)

    return w


@log_calls
@require_token
def fetch_profile(token: str, user_id: int) -> dict:
    return {"id": user_id}
```

**Expert Level**: Many layers → consider **middleware** or a single composed decorator for clarity.

**Key Points**

- Memorize: ` @a @b` → `a(b(f))`.
- Integration-test the full stack.
- Security-sensitive decorators should be reviewed for order bugs.

---

## 16.2 Creating Decorators

### Simple Decorators

**Beginner Level**: One outer function taking `f`, returning `wrapper`.

```python
import time


def sleep_after(f):
    def w(*a, **k):
        try:
            return f(*a, **k)
        finally:
            time.sleep(0.01)

    return w
```

**Intermediate Level**: **CSV sanitization** before business rules.

```python
from typing import Any


def sanitize_rows(f):
    def w(rows: list[dict[str, Any]], *a, **k):
        cleaned = [
            {key: (val.strip() if isinstance(val, str) else val) for key, val in row.items()}
            for row in rows
        ]
        return f(cleaned, *a, **k)

    return w
```

**Expert Level**: **Generator** decorators must decide whether to proxy `send`/`throw`/`close`—often use a manual iterator class for full fidelity.

```python
def count_calls(gen_fn):
    def w(*a, **k):
        it = gen_fn(*a, **k)
        n = 0
        for item in it:
            n += 1
            yield item
        print(f"yielded {n} items")

    return w
```

**Key Points**

- Simple = no factory parameters.
- Preserve return values and exception propagation intentionally.
- Generators need special treatment.

---

### Decorators with Arguments

**Beginner Level**: Three levels: factory → `deco(f)` → `wrapper`.

```python
def repeat(n: int):
    def deco(f):
        def w(*a, **k):
            for _ in range(n - 1):
                f(*a, **k)
            return f(*a, **k)

        return w

    return deco


@repeat(3)
def beep():
    print("beep")
```

**Intermediate Level**: **Retry** with exponential backoff for flaky I/O.

```python
import time
from typing import Any, Callable, Tuple, Type


def retry(
    *,
    attempts: int = 3,
    backoff: float = 0.2,
    exceptions: Tuple[Type[BaseException], ...] = (Exception,),
):
    def deco(f: Callable[..., Any]) -> Callable[..., Any]:
        def w(*a, **k):
            last: BaseException | None = None
            for i in range(attempts):
                try:
                    return f(*a, **k)
                except exceptions as e:
                    last = e
                    time.sleep(backoff * (2**i))
            assert last is not None
            raise last

        return w

    return deco


@retry(attempts=4, backoff=0.1)
def download(url: str) -> bytes:
    import random

    if random.random() < 0.7:
        raise ConnectionError("transient")
    return b"ok"
```

**Expert Level**: Type the factory as returning `Callable[[F], F]` with appropriate `F` bounds.

**Key Points**

- Avoid mutable defaults in the factory signature.
- Cap retries and total time in production.
- Log each failure with context.

---

### functools.wraps

**Beginner Level**: `@wraps(f)` on the inner wrapper copies metadata from `f`.

```python
import functools


def noisy(f):
    @functools.wraps(f)
    def w(*a, **k):
        print(f.__name__)
        return f(*a, **k)

    return w
```

**Intermediate Level**: **APM/tracing** relies on `__qualname__`; without `wraps`, spans all show `wrapper`.

```python
import functools


def trace(f):
    @functools.wraps(f)
    def w(*a, **k):
        print("span", f.__qualname__)
        return f(*a, **k)

    return w
```

**Expert Level**: Customize via `assigned` and `updated` if you intentionally omit certain attributes.

**Key Points**

- Default: use `wraps` always.
- Enables introspection and `__wrapped__`.
- Improves stack traces in production logs.

---

### Decorators with Parameters on the Target

**Beginner Level**: Registry pattern: decorator registers function under a key.

```python
HANDLERS = {}


def handles(event: str):
    def deco(f):
        HANDLERS[event] = f
        return f

    return deco


@handles("order.created")
def on_order(payload: dict) -> None:
    print(payload)
```

**Intermediate Level**: **HTTP-style** routing table for a toy framework.

```python
APP_GET: dict[str, callable] = {}


def get(path: str):
    def deco(f):
        APP_GET[path] = f
        return f

    return deco


@get("/items")
def list_items():
    return []
```

**Expert Level**: Combine with **`typing.Annotated`** or attachment to `__dict__` for rich metadata in modern APIs.

**Key Points**

- Document registration side effects.
- Watch import order and circular imports.
- Version registry schema if persisted.

---

### Generic Decorators

**Beginner Level**: One implementation, many signatures, via `ParamSpec` / `TypeVar`.

```python
from functools import wraps
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")


def noop_typed(fn: Callable[P, R]) -> Callable[P, R]:
    @wraps(fn)
    def w(*args: P.args, **kwargs: P.kwargs) -> R:
        return fn(*args, **kwargs)

    return w
```

**Intermediate Level**: **Separate** `timed_sync` and `timed_async` rather than one dynamic wrapper that inspects coroutines—clearer and safer.

```python
def timed_sync(fn):
    import time
    from functools import wraps

    @wraps(fn)
    def w(*a, **k):
        t0 = time.perf_counter()
        try:
            return fn(*a, **k)
        finally:
            print((time.perf_counter() - t0) * 1000, "ms")

    return w
```

**Expert Level**: Use **`Protocol`** for “callable with extra attrs” when decorating varied objects.

**Key Points**

- `ParamSpec` needs Python 3.10+ for full effect (backport via typing_extensions).
- Test decoration on **bound methods**.
- Avoid `*args: Any` unless necessary.

---

## 16.3 Advanced Decorators

### Class Decorators

**Beginner Level**: Takes a class, returns a class (often mutated or replaced).

```python
def add_repr(cls):
    cls.__repr__ = lambda self: f"{cls.__name__}()"  # noqa: ARG005
    return cls


@add_repr
class Box:
    pass
```

**Intermediate Level**: **ORM-style** model registration.

```python
MODELS: dict[str, type] = {}


def model(name: str):
    def deco(cls: type) -> type:
        MODELS[name] = cls
        return cls

    return deco


@model("user")
class User:
    pass
```

**Expert Level**: Wrap `__init__` to enforce invariants across all instances.

```python
def require_fields(*fields: str):
    def deco(cls: type) -> type:
        orig_init = cls.__init__

        def __init__(self, *a, **k):
            orig_init(self, *a, **k)
            for f in fields:
                if not hasattr(self, f):
                    raise TypeError(f"missing {f}")

        cls.__init__ = __init__  # type: ignore[method-assign]
        return cls

    return deco
```

**Key Points**

- Runs once per class object.
- Mind inheritance and MRO when mutating.
- Prefer `dataclass` for boilerplate fields.

---

### Decorating Methods

**Beginner Level**: `@decorator` on a method still receives `self` as first argument in the underlying function.

```python
def double(f):
    def w(self, x):
        return f(self, x) * 2

    return w


class C:
    @double
    def val(self, x):
        return x
```

**Intermediate Level**: **Per-instance memo**: store cache on `self`, not a global dict keyed weakly.

```python
from functools import wraps


def memo_method(f):
    @wraps(f)
    def w(self, *a, **k):
        cache = getattr(self, "_memo", {})
        key = (f.__name__, a, tuple(sorted(k.items())))
        if key not in cache:
            cache[key] = f(self, *a, **k)
            self._memo = cache
        return cache[key]

    return w
```

**Expert Level**: `functools.lru_cache` on methods can create unbounded caches per instance reference—use `cached_property` or explicit LRU on `self`.

**Key Points**

- Decoration happens at class body execution time.
- `self` binding is normal when the method is accessed on an instance.
- Test `Class.method(instance, ...)` vs `instance.method(...)`.

---

### Method Decorators

**Beginner Level**: Same as function decorators; naming reflects intent (method-specific logging, auth).

```python
def log_method(f):
    def w(self, *a, **k):
        print(self.__class__.__name__, f.__name__)
        return f(self, *a, **k)

    return w


class Svc:
    @log_method
    def run(self) -> None:
        pass
```

**Intermediate Level**: **Role checks** on service layer.

```python
def admin_only(f):
    def w(self, *a, **k):
        if getattr(self, "role", "") != "admin":
            raise PermissionError
        return f(self, *a, **k)

    return w
```

**Expert Level**: Descriptor `__get__` decorators are rare; use when you need per-class binding behavior.

**Key Points**

- Keep wrappers thin to preserve stack depth.
- Do not break `super()` by replacing with incompatible signatures.
- Consider class-level policy for cross-cutting rules.

---

### Property and Decorators

**Beginner Level**: `@property` for getters; `@name.setter` for setters.

```python
class User:
    def __init__(self, email: str) -> None:
        self._email = email

    @property
    def email(self) -> str:
        return self._email.lower()

    @email.setter
    def email(self, v: str) -> None:
        self._email = v.strip()
```

**Intermediate Level**: **`cached_property`** for expensive derived values (e.g. file hash after upload).

```python
from functools import cached_property


class UploadedFile:
    def __init__(self, path: str) -> None:
        self.path = path

    @cached_property
    def sha256(self) -> str:
        import hashlib
        from pathlib import Path

        h = hashlib.sha256()
        h.update(Path(self.path).read_bytes())
        return h.hexdigest()
```

**Expert Level**: For complex validation at boundaries, prefer **Pydantic** or explicit service-layer checks over huge property setters.

**Key Points**

- `cached_property` stores on instance after first access.
- Property getters should not surprise with slow I/O unless documented.
- Use deleter sparingly for resource cleanup.

---

### Custom Descriptor Patterns

**Beginner Level**: Implement `__get__` (and optionally `__set__`) for attribute-level behavior.

```python
class Once:
    def __init__(self, f):
        self.f = f
        self.name = f.__name__

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        val = self.f(obj)
        setattr(obj, self.name, val)
        return val


class C:
    @Once
    def big(self) -> int:
        print("compute")
        return 10**6
```

**Intermediate Level**: **Lazy config** loaded from env on first access.

**Expert Level**: Descriptors compose with the **data model**; debug with `obj.__dict__` vs descriptor `__get__` precedence rules.

**Key Points**

- `obj is None` → attribute accessed on class.
- `Once` replaces computed attr with plain value—document that.
- Prefer `property` unless you need reusable descriptor class.

---

## 16.4 Practical Patterns

### Logging Decorator

**Beginner Level**: Log function name and arguments (redact in prod).

```python
import functools
import logging

log = logging.getLogger(__name__)


def log_calls(f):
    @functools.wraps(f)
    def w(*a, **k):
        log.info("call %s args=%s kwargs=%s", f.__name__, a, k)
        return f(*a, **k)

    return w
```

**Intermediate Level**: **Structured JSON** lines for log aggregation (ELK, CloudWatch).

```python
import functools
import json


def log_json(handler):
    @functools.wraps(handler)
    def w(payload: dict):
        print(json.dumps({"event": "in", "fn": handler.__name__, "keys": list(payload)}))
        out = handler(payload)
        print(json.dumps({"event": "out", "fn": handler.__name__}))
        return out

    return w
```

**Expert Level**: Integrate **OpenTelemetry** or `contextvars` for `request_id` instead of printing; sample high-volume paths.

**Key Points**

- Never log passwords or full payment data.
- Use the `logging` module in services.
- Structured fields beat unstructured strings for queries.

---

### Timing Decorator

**Beginner Level**: `time.perf_counter()` around the call.

```python
import functools
import time


def timed(f):
    @functools.wraps(f)
    def w(*a, **k):
        t0 = time.perf_counter()
        try:
            return f(*a, **k)
        finally:
            print(f"{f.__name__}: {(time.perf_counter() - t0)*1000:.2f} ms")

    return w
```

**Intermediate Level**: Append to a **metrics list** for batch job summaries or push to StatsD.

```python
import functools
import time


def timed_metric(name: str):
    def deco(f):
        @functools.wraps(f)
        def w(*a, **k):
            t0 = time.perf_counter()
            try:
                return f(*a, **k)
            finally:
                METRICS.append((name, time.perf_counter() - t0))

        return w

    return deco


METRICS: list[tuple[str, float]] = []
```

**Expert Level**: Async handlers need `async def` wrapper with `await`; use **`timeit`** only for microbenchmarks.

**Key Points**

- `perf_counter` is appropriate for intervals.
- Sample timing in hot paths to reduce overhead.
- Subtract framework overhead when interpreting latency.

---

### Caching and Memoization

**Beginner Level**: `@lru_cache(maxsize=n)` on pure functions.

```python
from functools import lru_cache


@lru_cache(maxsize=10_000)
def tokenize_line(line: str) -> tuple[str, ...]:
    return tuple(line.split())
```

**Intermediate Level**: **Compile regex** patterns by string key in log parsing services.

```python
import re
from functools import lru_cache


@lru_cache(maxsize=256)
def compile_pat(pat: str) -> re.Pattern:
    return re.compile(pat)
```

**Expert Level**: Distributed systems use **Redis** with TTL; local `lru_cache` is process-local only.

**Key Points**

- Do not cache time-dependent or random logic without explicit inputs.
- Unhashable arguments require key functions or manual dicts.
- Call `cache_clear()` when configuration changes.

---

### Validation Decorator

**Beginner Level**: Check required dict keys before handler runs.

```python
import functools


def require_keys(*keys: str):
    def deco(f):
        @functools.wraps(f)
        def w(payload: dict, *a, **k):
            missing = [x for x in keys if x not in payload]
            if missing:
                raise ValueError(f"missing {missing}")
            return f(payload, *a, **k)

        return w

    return deco


@require_keys("email", "name")
def register(payload: dict) -> dict:
    return {"ok": True}
```

**Intermediate Level**: **Dataclass** construction inside wrapper for typed handlers.

```python
import functools
from dataclasses import dataclass


@dataclass
class CreateUser:
    email: str
    name: str


def validates(cls):
    def deco(f):
        @functools.wraps(f)
        def w(data: dict, *a, **k):
            obj = cls(**data)
            return f(obj, *a, **k)

        return w

    return deco


@validates(CreateUser)
def create_user(u: CreateUser) -> str:
    return u.email
```

**Expert Level**: Map `ValueError` to **HTTP 400** in the web layer; keep decorators thin.

**Key Points**

- Validate at trust boundaries (HTTP, queue consumers).
- Prefer schema libraries for nested JSON.
- Return structured errors for APIs.

---

### Retry Decorator

**Beginner Level**: Loop over attempts; sleep between; re-raise last error.

**Intermediate Level**: Add **jitter** to avoid thundering herd when many clients retry the same API.

```python
import functools
import random
import time


def retry_http(*, attempts: int = 3, base: float = 0.2, jitter: float = 0.05):
    def deco(f):
        @functools.wraps(f)
        def w(*a, **k):
            last = None
            for i in range(attempts):
                try:
                    return f(*a, **k)
                except OSError as e:
                    last = e
                    time.sleep(base * (2**i) + random.random() * jitter)
            raise last  # type: ignore[misc]

        return w

    return deco
```

**Expert Level**: Libraries like **Tenacity** provide composable policies, hooks, and logging.

**Key Points**

- Retry only **idempotent** or keyed operations.
- Set max duration as well as max attempts.
- Log failures with correlation IDs for on-call debugging.

---

### Rate Limiting

**Beginner Level**: Enforce minimum interval between calls (single-threaded).

```python
import functools
import time


def rate_limit(qps: float):
    min_interval = 1.0 / qps
    last = 0.0

    def deco(f):
        @functools.wraps(f)
        def w(*a, **k):
            nonlocal last
            now = time.monotonic()
            wait = last + min_interval - now
            if wait > 0:
                time.sleep(wait)
            try:
                return f(*a, **k)
            finally:
                last = time.monotonic()

        return w

    return deco
```

**Intermediate Level**: **Scraper** politeness: pair with `robots.txt` and per-domain limits.

**Expert Level**: Use **Redis** or API gateway quotas for distributed systems; add **locks** for threads.

**Key Points**

- Shared `last` needs synchronization under concurrency.
- Per-key rate limits need bounded storage.
- Document fairness vs burst allowance.

---

## 16.5 Built-in Decorators

### @property

**Beginner Level**: Computed attribute syntax.

**Intermediate Level**: **E-commerce** line totals from cents and tax rate.

```python
class Product:
    def __init__(self, price_cents: int, tax_rate: float) -> None:
        self.price_cents = price_cents
        self.tax_rate = tax_rate

    @property
    def price_usd(self) -> float:
        return self.price_cents / 100.0

    @property
    def total_usd(self) -> float:
        return self.price_usd * (1 + self.tax_rate)
```

**Expert Level**: `cached_property` (3.8+) for one-shot expensive computation on instances.

**Key Points**

- Read-only API: omit setter.
- Avoid recursion in getters.
- Document performance of derived properties.

---

### @staticmethod

**Beginner Level**: Function nested in class namespace; no automatic `self`/`cls`.

```python
class Math:
    @staticmethod
    def clamp(x: float, lo: float, hi: float) -> float:
        return max(lo, min(hi, x))
```

**Intermediate Level**: Group **pure utilities** with the domain type.

**Expert Level**: Often a **module-level function** is clearer unless subclass override is needed.

**Key Points**

- Cannot access instance state without explicit arguments.
- Weaker than `classmethod` for alternate constructors.

---

### @classmethod

**Beginner Level**: Receives class as first argument; use for factories.

```python
class Point:
    def __init__(self, x: float, y: float) -> None:
        self.x, self.y = x, y

    @classmethod
    def from_tuple(cls, t: tuple[float, float]) -> "Point":
        return cls(t[0], t[1])
```

**Intermediate Level**: **`from_json`** for API payloads.

```python
class User:
    def __init__(self, id: int, email: str) -> None:
        self.id, self.email = id, email

    @classmethod
    def from_json(cls, d: dict) -> "User":
        return cls(int(d["id"]), str(d["email"]))
```

**Expert Level**: Using `cls` ensures **subclasses** construct their own type in `from_*` methods.

**Key Points**

- First parameter conventionally named `cls`.
- Can call other classmethods via `cls.other()`.

---

### @lru_cache

**Beginner Level**: Memoization with LRU eviction.

```python
from functools import lru_cache


@lru_cache(maxsize=32)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

**Intermediate Level**: **Pattern compilation** for log parsing pipelines.

**Expert Level**: Monitor **`cache_info()`**; watch memory if `maxsize` is large.

**Key Points**

- Thread-safety in CPython for many read-mostly uses—verify for your workload.
- Python 3.9+ `cache` is unbounded—use with care.

---

### @wraps

**Beginner Level**: `from functools import wraps` — use inside decorators.

**Intermediate Level**: Required for **OpenAPI** and framework route naming.

**Expert Level**: Advanced: customize `assigned` tuple.

**Key Points**

- Always pair with user-defined wrappers.
- Maintains `__wrapped__` chain.

---

### @dataclass

**Beginner Level**: Auto `__init__`, `__repr__`, optional ordering.

```python
from dataclasses import dataclass


@dataclass
class Item:
    sku: str
    qty: int
```

**Intermediate Level**: **`field(default_factory=list)`** for mutable defaults.

```python
from dataclasses import dataclass, field


@dataclass
class Cart:
    items: list[str] = field(default_factory=list)
```

**Expert Level**: `slots=True`, `frozen=True`, `kw_only=True` for APIs and immutability.

```python
from dataclasses import dataclass


@dataclass(slots=True, frozen=True)
class Event:
    name: str
    payload: dict
```

**Key Points**

- Not a runtime wrapper like `logged`—generates class body code.
- `__post_init__` for validation.
- `frozen` enables hashing if fields are hashable.

---

## Best Practices

1. Use **`functools.wraps`** on every user-defined function decorator.
2. Document and test **decorator order** when stacking.
3. Split **sync** and **async** decorators explicitly.
4. **Parameterize** retries, log levels, and rate limits via factories.
5. Avoid expensive work at **import time** inside decorators.
6. Do not use unbounded caches on **methods** without instance scoping.
7. **Redact** sensitive fields in logging decorators.
8. Prefer **middleware** over ten stacked decorators in web apps.
9. Type with **`ParamSpec`** / **`TypeVar`** for maintainability.
10. Expose **`__wrapped__`** for unit tests that need the raw function.

---

## Common Mistakes to Avoid

1. Omitting **`wraps`** → broken introspection and confusing tracebacks.
2. Wrong **stack order** breaking security or logging expectations.
3. **`lru_cache`** on functions with **dict/list** arguments (unhashable).
4. Broken **generator** decoration losing iterator protocol nuances.
5. **Mutable default** in decorator closure (`cache={}`).
6. Retrying **non-idempotent** POST without idempotency keys.
7. **Rate limit** decorators without locks in threaded code.
8. Using **`staticmethod`** for factories that should use **`classmethod`**.
9. **Properties** that perform unbounded I/O per access.
10. Expecting **`@dataclass`** to enforce types—it does not by default.

---

*End of Topic 16 — Decorators.*
