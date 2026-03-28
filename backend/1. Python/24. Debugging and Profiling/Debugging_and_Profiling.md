# Python Debugging and Profiling (Topic 24)

Shipping reliable Python services—REST APIs, batch analytics, ML inference—requires systematic **debugging**, **logging**, **profiling**, and **error analysis**. This guide maps tools and patterns from quick print debugging to production observability, with beginner through expert examples.

**How to use this topic in real projects**: when a dashboard shows a spike in errors, first confirm whether it is a **data** issue (schema drift), a **dependency** issue (downstream API), or a **code** regression. Capture timestamps, trace IDs, and sample payloads, then reproduce locally with the same Python version and dependency lockfile. Only after you can reproduce should you reach for profilers—otherwise you risk optimizing the wrong layer.

**Notebook vs service**: exploratory notebooks tolerate `print` and inline charts, but scheduled jobs and HTTP handlers should emit structured logs and exit codes that operators can alert on. Carry the discipline of production debugging back into notebooks by naming experiments, pinning seeds, and saving the exact dataframe slices that triggered anomalies.

**Latency vs throughput**: profiling a batch job that finishes nightly differs from debugging a real-time API. For batch work, wall-clock and total cost dominate; for APIs, tail latency and saturation under concurrency matter more than mean response time alone. Load-test with realistic **think times** and **payload sizes**—micro-benchmarks on empty JSON bodies routinely lie.

## 📑 Table of Contents

- [24.1 Debugging Techniques](#241-debugging-techniques)
- [24.2 Logging](#242-logging)
- [24.3 Profiling and Performance](#243-profiling-and-performance)
- [24.4 Error Handling and Tracebacks](#244-error-handling-and-tracebacks)
- [24.5 Common Failure Patterns](#245-common-failure-patterns)
- [Topic Key Points](#topic-key-points)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 24.1 Debugging Techniques

### 24.1.1 `print()` Debugging

**Beginner Level**: Insert `print(x)` to see values as code runs.

**Intermediate Level**: Use f-strings with `repr`, file/line tags, and `flush=True` in long-running workers.

**Expert Level**: Replace with structured logging in anything deployed; keep prints for quick notebooks and CLI scripts only.

```python
# Beginner
def total(items):
    s = 0
    for x in items:
        print("adding", x)
        s += x
    return s

# Intermediate: structured quick trace
def score(rows):
    acc = 0.0
    for i, r in enumerate(rows):
        v = float(r["score"])
        print(f"[score] row={i} value={v!r}", flush=True)
        acc += v
    return acc
```

#### Key Points

- Remove or gate debug prints before merge; they leak PII if not careful.
- For API debugging, log **request id**, **route**, and **latency** instead of ad-hoc prints scattered in handlers.
- In Jupyter notebooks, `display()` and rich reprs often beat raw `print` for DataFrames.

---

### 24.1.2 `pdb` — The Python Debugger

**Beginner Level**: `import pdb; pdb.set_trace()` stops execution; type `n` next, `s` step, `c` continue.

**Intermediate Level**: `pdb.post_mortem()` after exceptions; `python -m pdb script.py` starts at first line.

**Expert Level**: `breakpoint()` (PEP 553) respects `PYTHONBREAKPOINT=0` to disable in prod.

```python
# Beginner
def divide(a, b):
    breakpoint()  # or pdb.set_trace()
    return a / b
```

#### Key Points

- Learn `l` (list), `p expr`, `pp expr`, `w` where, `u`/`d` stack navigation.
- `commands` in pdb can automate actions on breakpoints for repetitive investigations.
- Remote teams: pair-debug by sharing **minimal repro** scripts rather than full app state dumps.

---

### 24.1.3 Breakpoints in IDEs and `breakpoint()`

**Beginner Level**: Click gutter in VS Code/PyCharm to set red dots.

**Intermediate Level**: Conditional breakpoints (e.g., `user_id == 42`).

**Expert Level**: Remote debugging over SSH/Docker with debugpy; map ports securely.

```python
# Conditional without IDE — simple guard
def handle(user_id):
    if user_id == 42:
        breakpoint()
    return user_id
```

#### Key Points

- Never leave unconditional breakpoints in hot paths in production images.

---

### 24.1.4 Stepping Through Code

**Beginner Level**: `n` steps over calls; `s` steps into functions.

**Intermediate Level**: `until` runs until line greater than current (escape loops).

**Expert Level**: `return` finishes current frame—useful deep in libraries.

```python
def inner(x):
    return x + 1

def outer(x):
    return inner(x) * 2
```

#### Key Points

- Stepping through framework code is noisy—use frame filters in IDE.

---

### 24.1.5 Inspecting Variables and State

**Beginner Level**: `p variable` shows value; `locals()` dump.

**Intermediate Level**: `interact` drops into REPL with current scope (powerful, dangerous).

**Expert Level**: Custom `__repr__` on domain objects makes pdb sessions productive.

```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"
```

#### Key Points

- Huge objects: print slices or summaries, not entire DataFrames.

---

### 24.1.6 Post-Mortem Debugging

**Beginner Level**: After crash in REPL, `import pdb; pdb.pm()` (shortcut for post_mortem on last traceback).

**Intermediate Level**: `PYTHONFAULTHANDLER=1` for native segfault traces.

**Expert Level**: Integrate Sentry for production exception capture with local variables (privacy review required).

```python
def boom():
    return 1 / 0

try:
    boom()
except Exception:
    import pdb
    pdb.post_mortem()
```

#### Key Points

- Post-mortem inspects stack at failure—ideal for reproducing logic bugs.

---

## 24.2 Logging

### 24.2.1 The `logging` Module

**Beginner Level**: `logging.basicConfig(level=logging.INFO); logging.info("msg")`.

**Intermediate Level**: Hierarchical loggers mirror package structure (`logging.getLogger(__name__)`).

**Expert Level**: Replace print in services; integrate with OpenTelemetry for traces + logs correlation.

```python
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

def handle_request(req_id: str):
    log.info("start", extra={"req_id": req_id})
```

#### Key Points

- Library code should use `getLogger(__name__)`, not `basicConfig` itself.

---

### 24.2.2 Log Levels

**Beginner Level**: DEBUG < INFO < WARNING < ERROR < CRITICAL.

**Intermediate Level**: INFO for lifecycle, WARNING for recoverable issues, ERROR for failed operations.

**Expert Level**: Dynamic level per module in prod via config; sampling for DEBUG storms.

```python
import logging

log = logging.getLogger("app")
log.debug("fine detail")
log.warning("retrying")
log.error("payment failed", exc_info=True)
```

#### Key Points

- `exc_info=True` adds traceback to log record.

---

### 24.2.3 Loggers, Handlers, and Formatters

**Beginner Level**: Logger emits records; Handler writes them (console, file); Formatter shapes text.

**Intermediate Level**: Multiple handlers: INFO to stdout, ERROR to file.

**Expert Level**: `QueueHandler`/`QueueListener` for thread-safe non-blocking logging.

```python
import logging

log = logging.getLogger("app")
log.setLevel(logging.DEBUG)

h = logging.StreamHandler()
h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
log.addHandler(h)
```

#### Key Points

- Avoid duplicate logs by not calling `basicConfig` and adding handlers twice.

---

### 24.2.4 File Logging

**Beginner Level**: `FileHandler("app.log")`.

**Intermediate Level**: Separate files per service instance in K8s often replaced by stdout + collector.

**Expert Level**: WatchedFileHandler for external rotation on Windows quirks.

```python
import logging

log = logging.getLogger("svc")
fh = logging.FileHandler("svc.log", encoding="utf-8")
fh.setFormatter(logging.Formatter("%(message)s"))
log.addHandler(fh)
```

#### Key Points

- Container platforms prefer stdout/stderr; files need volume mounts.

---

### 24.2.5 Rotating Logs

**Beginner Level**: `RotatingFileHandler` caps file size; `TimedRotatingFileHandler` rotates by time.

**Intermediate Level**: Retention policy aligns with compliance (GDPR log minimization).

**Expert Level**: Centralized log platform (ELK, Loki) handles rotation remotely.

```python
from logging.handlers import RotatingFileHandler
import logging

log = logging.getLogger("api")
h = RotatingFileHandler("api.log", maxBytes=1_000_000, backupCount=5, encoding="utf-8")
log.addHandler(h)
```

#### Key Points

- Disk full from logs is an outage—always bound size or ship off-box.

---

### 24.2.6 Logging Best Practices for Production

**Beginner Level**: Include request IDs; log key metrics (latency, status).

**Intermediate Level**: Structured JSON logs (`python-json-logger`) for parsing.

**Expert Level**: PII redaction, correlation IDs across services, log volume budgets.

```python
import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "msg": record.getMessage(),
            "logger": record.name,
        }
        return json.dumps(payload, ensure_ascii=False)

h = logging.StreamHandler()
h.setFormatter(JsonFormatter())
logging.getLogger().addHandler(h)
```

#### Key Points

- Never log passwords, tokens, or full payment payloads.
- **Sampling**: high-traffic services should sample DEBUG logs or gate behind feature flags.
- **Correlation**: pass `X-Request-ID` from edge proxy to app log `extra` for end-to-end traces.
- **Processors**: in centralized logging, strip binary bodies and truncate large payloads at the agent.

```python
# Filter to redact sensitive keys in dict payloads before logging
SENSITIVE = {"password", "token", "authorization"}

def redact(obj):
    if isinstance(obj, dict):
        return {k: ("***" if k.lower() in SENSITIVE else redact(v)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [redact(x) for x in obj[:50]]  # cap list size in logs
    return obj
```

---

## 24.3 Profiling and Performance

### 24.3.1 `cProfile`

**Beginner Level**: `python -m cProfile -s cumtime script.py` shows where time goes.

**Intermediate Level**: Programmatic `cProfile.run('main()')` or `Profile().runcall(fn)`.

**Expert Level**: Combine with `snakeviz` or `pstats` for call graphs; profile realistic workloads.

```python
import cProfile
import pstats
from pstats import SortKey

def work():
    return sum(x * x for x in range(100_000))

pr = cProfile.Profile()
pr.enable()
work()
pr.disable()
pstats.Stats(pr).sort_stats(SortKey.CUMULATIVE).print_stats(10)
```

#### Key Points

- Profiling adds overhead—use on representative input sizes.

---

### 24.3.2 Fine-Grained Timing

**Beginner Level**: `time.time()` around blocks.

**Intermediate Level**: `time.perf_counter()` for monotonic measurements.

**Expert Level**: `timeit` module for microbenchmarks; beware optimizer artifacts.

```python
import time

def timed(fn, *args, **kwargs):
    t0 = time.perf_counter()
    out = fn(*args, **kwargs)
    dt = time.perf_counter() - t0
    return out, dt
```

#### Key Points

- Warm caches before benchmarking API handlers.

---

### 24.3.3 Memory Profiling

**Beginner Level**: `tracemalloc` tracks allocations.

**Intermediate Level**: `memory_profiler` line-by-line (`@profile`).

**Expert Level**: `objgraph` for reference leaks; `pympler` for heap snapshots in long-running workers.

```python
import tracemalloc

tracemalloc.start()
# ... code ...
current, peak = tracemalloc.get_traced_memory()
print(current / 1024, peak / 1024)
tracemalloc.stop()
```

#### Key Points

- ML pipelines spike memory—profile batch sizes.

---

### 24.3.4 Performance Analysis Workflow

**Beginner Level**: Reproduce slow path locally with production-like data volume.

**Intermediate Level**: Identify **big-O** issues vs constant factors; optimize hotspots only.

**Expert Level**: A/B test optimizations; watch p95/p99 latency, not just means.

```python
# Conceptual: timing middleware records duration -> metrics
```

#### Key Points

- Measure before optimizing; intuition is often wrong.

---

### 24.3.5 Profiling Tips

**Beginner Level**: Profile the **entire request** or ETL job first, then open the hottest function—avoid optimizing code that is not on the critical path.

**Intermediate Level**: Turn off verbose DEBUG logging during profiling runs; they skew timings and allocate huge strings.

**Expert Level**: Use **flame graphs** (`py-spy`) on representative production-like workloads, not only on unit-test-sized inputs.

```text
# py-spy record -o profile.svg --pid <pid>
```

#### Key Points

- Sampling profilers trade precision for lower overhead in prod-like runs.
- CPU profiles under-report time spent waiting on sockets or disks—pair with tracing spans.

---

### 24.3.6 Profiling Tools and Ecosystem

**Beginner Level**: Start with **`cProfile`** + `pstats` in the stdlib; they are enough to rank functions by cumulative time.

**Intermediate Level**: Add **`pytest-benchmark`** for regression tests and **`line_profiler`** (`kernprof`) when a single function looks suspicious.

**Expert Level**: APMs (Datadog, New Relic) and continuous profilers (Pyroscope) show live services; interpret results alongside **GIL** contention and noisy neighbors in shared clusters.

```text
# line_profiler (conceptual): kernprof -l -v script.py
```

```python
import os
import time

def wall(fn):
    t0 = time.perf_counter()
    fn()
    return time.perf_counter() - t0

def cpu_aware_note():
    return os.times()
```

#### Key Points

- Run microbenchmarks multiple times; report mean and spread, not a single sample.
- Pick tools that match the environment (laptop vs container vs bare metal).

---

## 24.4 Error Handling and Tracebacks

### 24.4.1 Reading Tracebacks

**Beginner Level**: Bottom line is the exception type and message; upward frames show call path.

**Intermediate Level**: `Caused by` chains in wrapped exceptions (`raise ... from`).

**Expert Level**: Frame locals in custom error pages—sanitize for users, detail for logs.

```python
def low():
    raise ValueError("bad")

def high():
    try:
        low()
    except ValueError as e:
        raise RuntimeError("wrap") from e

try:
    high()
except RuntimeError as e:
    print(e.__cause__)
```

#### Key Points

- Python prints newest frame last in console tracebacks—learn your mental model.

---

### 24.4.2 `sys.exc_info()`

**Beginner Level**: Returns `(type, value, traceback)` for active exception in `except` block.

**Intermediate Level**: Use in logging filters to attach exception classes.

**Expert Level**: Avoid storing traceback refs long-term—GC and cycles issues historically.

```python
import sys
import logging

log = logging.getLogger("x")

try:
    1 / 0
except Exception:
    exc_type, exc, tb = sys.exc_info()
    log.error("failed", exc_info=(exc_type, exc, tb))
```

#### Key Points

- Outside `except`, `exc_info()` is `(None, None, None)`.

---

### 24.4.3 Exception Debugging Strategies

**Beginner Level**: Re-raise after logging to preserve stack (`raise` bare).

**Intermediate Level**: Add context with `raise NewErr(...) from e`.

**Expert Level**: Exception groups (Python 3.11+) for concurrent task failures.

```python
def load_config(path):
    try:
        ...
    except OSError as e:
        raise RuntimeError(f"cannot read {path}") from e
```

#### Key Points

- Swallowing exceptions hides bugs—log and re-raise or handle deliberately.

---

### 24.4.4 Stack Traces in Frameworks

**Beginner Level**: In development, Flask and Django can show rich tracebacks in the browser; in production you return generic **500** pages to users while servers log details to stderr or APM.

**Intermediate Level**: Map each log line to a **request ID**; normalize JSON errors with stable `code` / `message` fields for mobile clients.

**Expert Level**: Public APIs should emit **Problem Details** (RFC 7807) without leaking frames; integrate with Sentry/OpenTelemetry for breadcrumbs.

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.errorhandler(ValueError)
def bad_value(e):
    return jsonify({"error": str(e)}), 400
```

#### Key Points

- Never return raw tracebacks to external API clients.

---

### 24.4.5 Async Tracebacks and the Event Loop

**Beginner Level**: Async stack traces improved in recent Python releases—read them like synchronous trace but expect shorter frames when tasks hop threads.

**Intermediate Level**: Name tasks (`asyncio.create_task(..., name="fetch-user")`) so logs identify failing work.

**Expert Level**: Context variables propagate correlation IDs across `async` boundaries; blocking calls inside async handlers starve the loop and masquerade as mysterious hangs.

```python
import asyncio

async def inner():
    raise RuntimeError("boom")

async def outer():
    await inner()

# asyncio.run(outer())
```

#### Key Points

- Treat “hangs” in async services as potential blocking I/O in a coroutine.

---

## 24.5 Common Failure Patterns

### 24.5.1 Division by Zero (`ZeroDivisionError`)

**Beginner Level**: Dividing by zero in arithmetic or modulo.

**Intermediate Level**: Guard denominators; use numeric stability patterns near zero.

**Expert Level**: Vectorized NumPy warns/errors—configure `np.seterr`.

```python
def safe_div(a, b, default=0.0):
    return a / b if b else default
```

#### Key Points

- In analytics, zeros often mean “missing metric”—handle explicitly.

---

### 24.5.2 `IndexError`

**Beginner Level**: Index past end of list/tuple.

**Intermediate Level**: Check `len` or iterate; use `deque` boundaries.

**Expert Level**: Off-by-one in pagination math (`page * size`).

```python
items = [1, 2, 3]
idx = 10
try:
    x = items[idx]
except IndexError:
    x = None
```

#### Key Points

- Prefer bounds checks or try/except for rare edge cases.

---

### 24.5.3 `KeyError`

**Beginner Level**: Missing dict key with `d[k]`.

**Intermediate Level**: `d.get(k, default)` or `collections.defaultdict`.

**Expert Level**: Pandas `loc` vs `at` mistakes—label not in index.

```python
cfg = {"host": "0.0.0.0"}
port = cfg.get("port", 8080)
```

#### Key Points

- For counting, `Counter` avoids manual key existence checks.

---

### 24.5.4 `AttributeError`

**Beginner Level**: Object lacks attribute—often `None` where model expected.

**Intermediate Level**: Optional chaining patterns with explicit guards in Python (`if x is not None`).

**Expert Level**: Dynamic APIs—validate JSON schema before access.

```python
user = None
if user is not None:
    _ = user.name
```

#### Key Points

- Dataclasses and type checkers catch many of these pre-runtime.

---

### 24.5.5 `TypeError`

**Beginner Level**: Wrong types passed (`"a" + 1`).

**Intermediate Level**: Missing `self` in method call; wrong arity.

**Expert Level**: Protocol typing mismatches at runtime despite static hints.

```python
def add(a: int, b: int) -> int:
    if not isinstance(a, int) or not isinstance(b, int):
        raise TypeError("ints required")
    return a + b
```

#### Key Points

- Add validation at system boundaries (HTTP, queues), not every internal call.
- **`AssertionError`**: `assert` is for development invariants; `python -O` strips it—never rely on `assert` for auth. Use `if not ok: raise`.
- **`RecursionError`**: prefer iterative traversals for unbounded JSON/XML or deep trees; `sys.setrecursionlimit` is a last resort.

```python
def delete_user(actor, target):
    if not actor.can_delete(target):
        raise PermissionError("denied")

def walk_json(obj):
    stack = [obj]
    while stack:
        cur = stack.pop()
        if isinstance(cur, dict):
            stack.extend(cur.values())
        elif isinstance(cur, list):
            stack.extend(cur)
```

---

**Quick reference — from symptom to next step**

| Symptom | Likely causes | Next tool |
| --- | --- | --- |
| Sudden `500` after deploy | Bad migration, missing env var, unchecked `KeyError` | Rollback + grep logs for `KeyError` / `NoneType` |
| Endpoint “slow” only in prod | Cold cache vs hot cache, DB pool wait, N+1 queries | APM trace + `EXPLAIN` + SQLAlchemy echo (staging) |
| Memory climbing overnight | Leaked references, unbounded caches, huge pandas frames | `tracemalloc`, `objgraph`, review global singletons |
| Tests pass locally, fail in CI | Timezone/locale, random seeds, race conditions | Pin `TZ`, freeze time with `freezegun`, add `pytest -s` logs |

Use the table as a checklist—not every cell will apply, but it reminds you to switch tools instead of staring at the same log line.

**Analytics pipelines**: when a nightly job fails, diff row counts and schema against the previous successful run before blaming model code. **ML training**: capture the git SHA, dataset version, and random seed in the same log line as your metrics so you can bisect quality regressions weeks later. **API gateways**: if latency grows, verify whether TLS handshakes, JWT validation, or upstream retries moved—CPU profiling on the Python app alone may show nothing while the proxy tells the truth.

**Security note**: exception pages, core dumps, and verbose logs can leak stack locals containing secrets. Redact automatically where possible, and treat any log line that might contain user content as subject to data-retention policy.

**Team workflow**: keep a shared “debug playbook” in the repo root—one page with how to pull logs, which kubectl/Docker commands are allowed, and where to find runbooks for payments and auth. New engineers should be able to follow it without asking for tribal knowledge.

**Closing habit**: after each production incident, write a short **blameless postmortem** listing root cause, detection gap, and the test or alert that now prevents recurrence. Link the postmortem from the relevant module docstring or README so the lesson survives team churn.

## Topic Key Points

- Use **`breakpoint()` / pdb** for interactive investigation; **logging** for production systems.
- **cProfile** finds CPU hotspots; **tracemalloc** / **memory_profiler** find memory issues.
- Tracebacks plus **`raise ... from`** preserve causal chains for debugging.
- Common exceptions (`KeyError`, `NoneType` attribute) often indicate missing validation at boundaries.
- Treat observability as a product feature: logs, metrics, and traces should tell a story from user action to database row.
- Reproduce production bugs with **recorded inputs** (HAR files, anonymized payloads) instead of guessing from screenshots alone.

## Best Practices

- Log with **structure** (JSON), **context** (request ID), and **safe** payloads.
- Configure **rotation** or centralized collection; monitor log volume.
- Profile on **realistic** data; optimize measured hotspots.
- Never expose raw tracebacks or secrets in client responses.
- Add **health checks** that validate dependencies, not just `return ok`.
- Use **type hints** and tests to catch `TypeError`/`AttributeError` early.
- For async services, avoid blocking calls and log **task names**.
- When incidents strike, capture **one** minimal repro script checked into `docs/incidents/` for future regression tests.
- Pair percentiles (p95/p99) with averages when evaluating “slow” endpoints after profiling.
- Document which environments enable debug tooling (`DEBUG=True`, `PYTHONBREAKPOINT`) and ensure prod images disable them.

## Common Mistakes to Avoid

- Leaving `print`/`pdb` in production code paths.
- Logging sensitive data (tokens, PII) at INFO.
- Misinterpreting cProfile output without considering **cumulative** vs **tottime**.
- Catching `Exception` and passing silently.
- Using `except:` bare clause.
- Storing traceback objects in global lists.
- Debugging with tiny synthetic data that hides O(n²) issues.
- Ignoring **warning** messages from NumPy/pandas that precede hard failures.
- Shipping containers without log driver configuration, then wondering where stdout went.
- Running profilers on cold caches and declaring victory—warm realistic caches first.

---

**Document versions when sharing profiles**: note Python minor release, OS, and native wheels (`numpy`, `cryptography`) whenever you paste benchmark numbers—mismatched binaries invalidate comparisons.

*End of Topic 24 — Debugging and Profiling.*

