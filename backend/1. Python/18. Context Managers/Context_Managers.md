# Context Managers

**Context managers** set up a resource before a block runs and **clean up** afterward—files, locks, DB transactions, temp directories—even when exceptions occur. The `with` statement is the primary syntax. Examples reference **file pipelines**, **API clients**, **database sessions**, and **concurrent scraping**.

## 📑 Table of Contents

- [18.1 The with Statement](#181-the-with-statement)
  - [with Syntax](#with-syntax)
  - [Context Manager Protocol](#context-manager-protocol)
  - [__enter__](#__enter__)
  - [__exit__](#__exit__)
  - [Cleanup Guarantees](#cleanup-guarantees)
- [18.2 Using Context Managers](#182-using-context-managers)
  - [File Handling](#file-handling)
  - [Lock Acquisition](#lock-acquisition)
  - [Database Connections](#database-connections)
  - [Temporary Directory](#temporary-directory)
  - [Exception Handling Patterns](#exception-handling-patterns)
- [18.3 Creating Context Managers](#183-creating-context-managers)
  - [Class-Based Context Managers](#class-based-context-managers)
  - [@contextmanager](#contextmanager)
  - [Generator-Based Managers](#generator-based-managers)
  - [contextlib Module](#contextlib-module)
  - [Nesting with Blocks](#nesting-with-blocks)
- [18.4 Advanced Topics](#184-advanced-topics)
  - [Multiple Context Managers](#multiple-context-managers)
  - [ExitStack](#exitstack)
  - [Conditional Context Managers](#conditional-context-managers)
  - [Error Handling in __exit__](#error-handling-in-__exit__)
  - [Production Patterns](#production-patterns)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 18.1 The with Statement

### with Syntax

**Beginner Level**: `with EXPR as VAR:` runs `EXPR.__enter__()`, binds return to `VAR`, runs block, then `EXPR.__exit__` even on errors.

```python
with open("data.txt", encoding="utf-8") as f:
    text = f.read()
```

**Intermediate Level**: Multiple items in one `with` (Python 3.1+ tuple form, 3.10+ parentheses multi-line):

```python
with open("a.txt", encoding="utf-8") as a, open("b.txt", encoding="utf-8") as b:
    print(a.readline(), b.readline())
```

**Expert Level**: `async with` for async context managers (`__aenter__`/`__aexit__`) in asyncio services and HTTP clients.

```python
async def fetch(client):
    async with client.get("https://api.example.com/v1/items") as resp:
        return await resp.json()
```

**Key Points**

- Indentation defines scope of managed resource.
- `as` is optional if you do not need the bound object.
- Prefer `with` over manual `try/finally` for RAII-style resources.

---

### Context Manager Protocol

**Beginner Level**: Object needs `__enter__` and `__exit__` methods to work with `with`.

```python
class Hello:
    def __enter__(self):
        print("enter")
        return self

    def __exit__(self, exc_type, exc, tb):
        print("exit")
        return False


with Hello():
    print("body")
```

**Intermediate Level**: **Timer** for batch jobs: enter records start, exit logs duration.

```python
import time


class Timer:
    def __enter__(self) -> "Timer":
        self.t0 = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        print(f"elapsed {(time.perf_counter() - self.t0)*1000:.1f} ms")
        return False
```

**Expert Level**: Returning **`True`** from `__exit__` suppresses the exception (swallows it)—use sparingly and document.

**Key Points**

- Protocol is duck-typed—no formal interface required.
- `__exit__` receives exception info or `(None, None, None)`.
- Context managers can return any object from `__enter__`.

---

### __enter__

**Beginner Level**: Prepare resource; return object bound to `as` target (or `self`).

```python
class Conn:
    def __enter__(self):
        self.open = True
        return self

    def __exit__(self, *a):
        self.open = False
```

**Intermediate Level**: **SQLite** connection: `__enter__` returns connection; consumer runs queries in block.

**Expert Level**: `__enter__` can **acquire multiple low-level resources** if `__exit__` releases all—often clearer to compose managers instead.

**Key Points**

- Keep `__enter__` fast; defer heavy work only if necessary.
- Return handles users need inside `with` body.
- Idempotent enter is helpful for reusable wrappers.

---

### __exit__

**Beginner Level**: Signature `__exit__(self, exc_type, exc_val, traceback)`. Return `False` to propagate exception; `True` to suppress.

```python
class Suppress:
    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc, tb):
        return exc_type is ValueError
```

**Intermediate Level**: **Rollback DB** on exception, **commit** otherwise.

```python
class Transaction:
    def __init__(self, conn) -> None:
        self.conn = conn

    def __enter__(self):
        return self.conn

    def __exit__(self, exc_type, exc, tb):
        if exc_type is not None:
            self.conn.rollback()
        else:
            self.conn.commit()
        return False
```

**Expert Level**: **`__exit__` exceptions**: if `__exit__` raises, original exception may be lost—keep `__exit__` minimal and safe.

**Key Points**

- Always release resources in `__exit__`.
- Log `exc_type` in services for observability.
- Avoid broad `return True` unless intentional (e.g., `suppress`).

---

### Cleanup Guarantees

**Beginner Level**: `with` calls `__exit__` after block **even if** block raises—like `try/finally`.

```python
def boom():
    with open(__file__, encoding="utf-8") as f:
        raise RuntimeError
    # __exit__ still ran → file closed
```

**Intermediate Level**: **Lock release** must happen on all paths—`with lock:` guarantees.

```python
import threading

lock = threading.Lock()


def critical():
    with lock:
        # mutual exclusion
        pass
```

**Expert Level**: If **`__enter__` raises**, `__exit__` is **not** called on that object—design `__enter__` to leave no partial state or use `try` inside `__enter__`.

**Key Points**

- Cleanup is not magic if object never successfully enters.
- Nested `with` unwinds outer to inner on exceptions (actually inner first in `__exit__` order—last entered exits first).
- Document re-entrancy if locks allow it.

---

## 18.2 Using Context Managers

### File Handling

**Beginner Level**: Always `with open(...)` so descriptors close promptly on CPython and other implementations.

```python
from pathlib import Path

def tail_errors(path: Path, n: int = 5) -> list[str]:
    with path.open(encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    return [ln for ln in lines if "ERROR" in ln][-n:]
```

**Intermediate Level**: **Read/write pipeline**: read source, transform, write dest—two files in one `with`.

```python
def copy_upper(src: str, dst: str) -> None:
    with open(src, encoding="utf-8") as s, open(dst, "w", encoding="utf-8") as d:
        for line in s:
            d.write(line.upper())
```

**Expert Level**: **`Path.open`** matches `open`; for binary streams use `"rb"`/`"wb"`; set **`newline=""`** for CSV to control line endings.

**Key Points**

- Text mode handles decoding; binary is for images/protocols.
- Use explicit `encoding="utf-8"` on text files.
- Large files: iterate lines instead of `read()`.

---

### Lock Acquisition

**Beginner Level**: `with lock:` acquires `threading.Lock` or `RLock`.

```python
import threading

data = []
lock = threading.Lock()


def append_item(x: str) -> None:
    with lock:
        data.append(x)
```

**Intermediate Level**: **Scraper** writing to shared in-memory buffer from threads—still better to use a queue for producer-consumer.

**Expert Level**: **`asyncio.Lock`** uses `async with`; mixing thread locks in async code blocks the event loop—use async primitives.

**Key Points**

- Prefer narrow critical sections.
- Deadlock: consistent lock ordering across modules.
- `RLock` for re-entrant same-thread needs.

---

### Database Connections

**Beginner Level**: Drivers often provide context managers for connections or cursors.

```python
import sqlite3

with sqlite3.connect(":memory:") as conn:
    conn.execute("CREATE TABLE t (x INT)")
    conn.execute("INSERT INTO t VALUES (1)", ())
```

**Intermediate Level**: **Transaction scope**: commit/rollback pattern with wrapper (see `__exit__` example above).

**Expert Level**: **Connection pools** (SQLAlchemy, psycopg pool): check out connection in `__enter__`, return to pool in `__exit__`—always use `with`.

**Key Points**

- Do not share connections across threads without pool design.
- Set timeouts at connect level for production.
- Log slow queries outside hot `__exit__` paths when possible.

---

### Temporary Directory

**Beginner Level**: `tempfile.TemporaryDirectory()` deletes tree on exit.

```python
import json
import tempfile
from pathlib import Path


def json_in_tempdir(payload: dict) -> str:
    """Read result back before temp dir is removed."""
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / "out.json"
        p.write_text(json.dumps(payload), encoding="utf-8")
        return p.read_text(encoding="utf-8")
```

**Intermediate Level**: **Correct** pattern: process inside `with`, copy artifacts out if needed.

```python
import shutil
import tempfile
from pathlib import Path


def build_zip_artifact() -> Path:
    with tempfile.TemporaryDirectory() as d:
        work = Path(d)
        (work / "a.txt").write_text("hi", encoding="utf-8")
        out = work / "out.zip"
        shutil.make_archive(str(out.with_suffix("")), "zip", work)
        final = Path(tempfile.mkstemp(suffix=".zip")[1])
        shutil.copy(out, final)
        return final
```

**Expert Level**: **`TemporaryFile`/`NamedTemporaryFile`**—Windows quirks with delete-on-close; read docs for your platform.

**Key Points**

- Temp dirs vanish after block—copy results if needed.
- Use `pathlib` for clarity.
- Secure temp: `tempfile` uses safe APIs—avoid `/tmp/foo` literals.

---

### Exception Handling Patterns

**Beginner Level**: Combine `with` and `try/except` **outside** or **inside** the block depending on whether you need resource during handling.

```python
try:
    with open("missing.txt", encoding="utf-8") as f:
        data = f.read()
except FileNotFoundError:
    data = ""
```

**Intermediate Level**: **`contextlib.suppress`** to ignore specific errors around a block.

```python
from contextlib import suppress

with suppress(FileNotFoundError):
    Path("optional.cfg").unlink()
```

**Expert Level**: **`ExitStack`** to conditionally enter managers—see advanced section.

**Key Points**

- `with` does not catch exceptions—only ensures cleanup.
- Place `try` where you can still use open resource if needed.
- Log exceptions after exit or in `__exit__` carefully.

---

## 18.3 Creating Context Managers

### Class-Based Context Managers

**Beginner Level**: Implement `__enter__`/`__exit__` on a class.

```python
class managed_list:
    def __init__(self) -> None:
        self.items: list[int] = []

    def __enter__(self) -> list[int]:
        return self.items

    def __exit__(self, *a) -> bool:
        self.items.clear()
        return False


with managed_list() as xs:
    xs.append(1)
```

**Intermediate Level**: **HTTP session** wrapper: enter creates session, exit closes sockets.

```python
class HTTPSession:
    def __enter__(self):
        import urllib.request

        self._opener = urllib.request.build_opener()
        return self._opener

    def __exit__(self, *a):
        self._opener.close()  # conceptual
```

**Expert Level**: Store **`exc_info`** in `__exit__` for structured logging but re-raise after cleanup.

**Key Points**

- Class managers are explicit and extensible.
- Hold resources as instance attributes.
- Test `__enter__` failure paths.

---

### @contextmanager

**Beginner Level**: `yield` splits **before** (setup) and **after** (teardown) in a single generator function.

```python
from contextlib import contextmanager


@contextmanager
def tag(name: str):
    print(f"<{name}>")
    try:
        yield
    finally:
        print(f"</{name}>")


with tag("div"):
    print("content")
```

**Intermediate Level**: **Timed API batch**: log wall time around a block.

```python
import time
from contextlib import contextmanager


@contextmanager
def elapsed(label: str):
    t0 = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {(time.perf_counter()-t0)*1000:.1f} ms")
```

**Expert Level**: **`yield` value** becomes `as` binding; exceptions in block propagate into generator at `yield`—use `try/finally` after `yield` for guaranteed teardown.

**Key Points**

- One `yield` per `@contextmanager` generator.
- `try/finally` after `yield` mirrors `__exit__`.
- Decorator wraps generator in `GeneratorContextManager`.

---

### Generator-Based Managers

**Beginner Level**: Same as `@contextmanager`—function with `yield` is the generator-based pattern.

**Intermediate Level**: **Acquire/release** pattern for custom locks or file handles.

```python
from contextlib import contextmanager


@contextmanager
def open_text(path: str):
    f = open(path, encoding="utf-8")
    try:
        yield f
    finally:
        f.close()
```

**Expert Level**: Avoid **`yield` in loops** for context managers—usually wrong; one resource per manager or use `ExitStack`.

**Key Points**

- Generator-based managers must not forget `finally`.
- `@contextmanager` adds `__enter__`/`__exit__` glue.
- Prefer `contextlib.closing` for generators that need `.close()`.

---

### contextlib Module

**Beginner Level**: Helpers: `closing`, `suppress`, `redirect_stdout`, `ContextDecorator`.

```python
from contextlib import closing
from urllib.request import urlopen

with closing(urlopen("https://example.com", timeout=5)) as resp:
    data = resp.read(200)
```

**Intermediate Level**: **`contextlib.chdir`** (3.11+) temporarily changes working directory for legacy scripts.

**Expert Level**: **`AbstractContextManager`** typing; **`asynccontextmanager`** for async code.

```python
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app):
    await app.startup()
    try:
        yield
    finally:
        await app.shutdown()
```

**Key Points**

- `suppress` is clearer than bare `try/except: pass`.
- `redirect_stdout` useful in tests.
- Explore `contextlib` docs for new additions per Python version.

---

### Nesting with Blocks

**Beginner Level**: Inner `with` inside outer—exits inner first.

```python
with open("a.txt", encoding="utf-8") as a:
    with open("b.txt", encoding="utf-8") as b:
        print(a.readline(), b.readline())
```

**Intermediate Level**: Same line multi-context (3.10+):

```python
with open("a.txt", encoding="utf-8") as a, open("b.txt", encoding="utf-8") as b:
    pass
```

**Expert Level**: Deep nesting hurts readability—use **`ExitStack`** or refactor to a function.

**Key Points**

- Exit order is reverse of enter order.
- Combine related resources in one `with` line when possible.
- Async nesting uses `async with`.

---

## 18.4 Advanced Topics

### Multiple Context Managers

**Beginner Level**: Tuple syntax enters left-to-right; exits right-to-left.

```python
with A() as a, B() as b:
    pass
```

**Intermediate Level**: **DB + file audit log**: open connection and log file together.

**Expert Level**: Dynamic number of files → **`ExitStack.enter_context`** in a loop.

**Key Points**

- If first `__enter__` succeeds and second fails, first’s `__exit__` still runs (PEP 479 behavior for `with` statement).
- Document pairing rules for related resources.

---

### ExitStack

**Beginner Level**: `ExitStack` defers entering contexts until runtime; unwinds all on exit.

```python
from contextlib import ExitStack

with ExitStack() as stack:
    files = [stack.enter_context(open(p, encoding="utf-8")) for p in ("a.txt", "b.txt")]
    for f in files:
        print(f.readline(), end="")
```

**Intermediate Level**: **Optional debug file**: enter only if verbose.

```python
from contextlib import ExitStack, nullcontext

def process(verbose: bool) -> None:
    with ExitStack() as stack:
        log = (
            stack.enter_context(open("debug.log", "a", encoding="utf-8"))
            if verbose
            else stack.enter_context(nullcontext())
        )
        log.write("start\n")
```

**Expert Level**: **`callback`** registration for non-context cleanups.

```python
from contextlib import ExitStack

with ExitStack() as stack:
    stack.callback(print, "cleanup runs")
```

**Key Points**

- Essential for variable-length `with` lists.
- `enter_context` returns the `__enter__` result.
- Callbacks run on unwind order LIFO.

---

### Conditional Context Managers

**Beginner Level**: `nullcontext` yields a dummy value—no-op manager.

```python
from contextlib import nullcontext

maybe_file = open("x.txt", encoding="utf-8") if False else nullcontext()
with maybe_file:
    pass
```

**Intermediate Level**: **Feature flags**: real lock vs dummy for single-threaded tests.

```python
from contextlib import nullcontext
import threading

def section(use_lock: bool):
    cm = threading.Lock() if use_lock else nullcontext()
    with cm:
        pass
```

**Expert Level**: Combine with **`ExitStack`** for cleaner dynamic stacks.

**Key Points**

- `nullcontext(optional)` passes through optional resource to `as`.
- Keep types consistent for mypy—use `AbstractContextManager` unions.

---

### Error Handling in __exit__

**Beginner Level**: Log exception, always release resource, return `False` to propagate.

```python
import logging

log = logging.getLogger(__name__)


class LogErrors:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is not None:
            log.exception("block failed")
        return False
```

**Intermediate Level**: **Translate** exceptions: catch in block, wrap, re-raise—`__exit__` usually should not eat unknown errors.

**Expert Level**: If `__exit__` raises, you may mask original—**minimal logic** in `__exit__`.

**Key Points**

- Prefer handling business errors inside block.
- Use `contextlib.suppress` for known benign cases.
- Monitor `__exit__` failures—they are hard to debug.

---

### Production Patterns

**Beginner Level**: Always `with` files and locks in services.

**Intermediate Level**: **FastAPI lifespan**, **Django** does not use `with` for requests—framework manages scope; use `with` inside handlers for DB transactions (per-request session).

**Expert Level**: **Structured concurrency**: async `TaskGroup` (3.11+) + `asynccontextmanager` for app startup/shutdown; **tenacity** + `with` for bounded retries around IO blocks.

```python
from contextlib import contextmanager


@contextmanager
def request_timeout(seconds: float):
    import signal

    def handler(*_):
        raise TimeoutError

    old = signal.signal(signal.SIGALRM, handler)
    signal.setitimer(signal.ITIMER_REAL, seconds)
    try:
        yield
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, old)
```

**Key Points**

- Align resource lifetime with request/task boundaries.
- Metrics: time `__exit__` duration if teardown is costly.
- Document thread/async constraints for each manager.

---

### Worked Example: API Client Session

**Beginner Level**: Wrap `requests.Session` (or `httpx.Client`) so every script gets the same setup/teardown.

```python
from contextlib import contextmanager


@contextmanager
def http_session(headers: dict[str, str]):
    import requests

    s = requests.Session()
    s.headers.update(headers)
    try:
        yield s
    finally:
        s.close()
```

**Intermediate Level**: **Scrape with politeness**: combine session `with` and per-request `time.sleep` using a nested manager.

```python
import time
from contextlib import contextmanager


@contextmanager
def throttle(seconds: float):
    t0 = time.monotonic()
    yield
    spent = time.monotonic() - t0
    if spent < seconds:
        time.sleep(seconds - spent)


with http_session({"User-Agent": "bot/1.0"}) as s, throttle(0.5):
    s.get("https://example.com", timeout=10)
```

**Expert Level**: In production prefer **`httpx`** with `Client` context manager and built-in limits; centralize retries at the client layer rather than ad hoc `with` nesting everywhere.

**Key Points**

- Sessions keep connections warm—close them to avoid socket leaks in long processes.
- Nest managers for orthogonal concerns (auth session + throttle).
- Timeouts belong on each call, not only on `open`.

---

## Best Practices

1. Prefer **`with`** for any object with `close()`, `release()`, or `commit()`.
2. Use **`try/finally` after `yield`** in `@contextmanager` generators.
3. Avoid **`return True`** in `__exit__` unless suppressing is the API contract.
4. Use **`ExitStack`** for dynamic lists of files or connections.
5. Specify **`encoding="utf-8"`** for text files in managers wrapping `open`.
6. Keep **`__exit__`** small—no heavy business logic.
7. Use **`contextlib.suppress`** instead of empty `except`.
8. Test both **success** and **exception** paths for custom managers.
9. Prefer **`nullcontext`** over `if`/`else` duplicated bodies.
10. For async services, pair **`async with`** with async-native clients.

---

## Common Mistakes to Avoid

1. **Leaking** file handles by forgetting `with` in branches.
2. Returning paths to files inside **`TemporaryDirectory`** after exit.
3. **`__enter__` raising** after partial setup without cleanup.
4. **`@contextmanager`** with multiple `yield` points.
5. Swallowing **all** exceptions via `return True` in `__exit__`.
6. Using **threading.Lock** inside **async** coroutines incorrectly.
7. Assuming **`__exit__` order**—rely on language rules: last entered exits first.
8. **`ExitStack`** without reading docs on callback exception chaining.
9. Mixing **binary and text** modes accidentally in paired files.
10. **Signal-based timeouts** (Unix) without restoring handlers—broken example if copied blindly; prefer `socket.timeout` or library timeouts.

---

*End of Topic 18 — Context Managers.*
