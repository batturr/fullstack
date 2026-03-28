# Async and Concurrency

FastAPI runs on **ASGI** servers (**Uvicorn**, **Hypercorn**) that drive **`asyncio`** event loops. Understanding **coroutines**, **blocking** pitfalls, **async database** drivers, **concurrent HTTP**, and **asyncio primitives** separates snappy APIs from ones that **stall** under load. This chapter ties **language concepts** to **framework behavior** and **production** tuning.

**How to use these notes:** Profile with realistic **I/O** patterns; avoid blocking the loop; prefer **async def** endpoints only when the **call graph** is async-safe end-to-end.

## 📑 Table of Contents

- [23.1 Async Basics](#231-async-basics)
  - [23.1.1 Asynchronous Programming](#2311-asynchronous-programming)
  - [23.1.2 async/await Syntax](#2312-asyncawait-syntax)
  - [23.1.3 Event Loop](#2313-event-loop)
  - [23.1.4 Coroutines](#2314-coroutines)
  - [23.1.5 Async Context](#2315-async-context)
- [23.2 Async Endpoints](#232-async-endpoints)
  - [23.2.1 Async Path Operations](#2321-async-path-operations)
  - [23.2.2 Sync vs Async](#2322-sync-vs-async)
  - [23.2.3 Performance Benefits](#2323-performance-benefits)
  - [23.2.4 When to Use Async](#2324-when-to-use-async)
  - [23.2.5 Mixed Sync/Async](#2325-mixed-syncasync)
- [23.3 Async Database Operations](#233-async-database-operations)
  - [23.3.1 Async Drivers](#2331-async-drivers)
  - [23.3.2 Async SQLAlchemy](#2332-async-sqlalchemy)
  - [23.3.3 Async Queries](#2333-async-queries)
  - [23.3.4 Connection Management](#2334-connection-management)
  - [23.3.5 Performance Optimization](#2335-performance-optimization)
- [23.4 Async External Services](#234-async-external-services)
  - [23.4.1 Async HTTP Calls](#2341-async-http-calls)
  - [23.4.2 aiohttp Library](#2342-aiohttp-library)
  - [23.4.3 Multiple Concurrent Requests](#2343-multiple-concurrent-requests)
  - [23.4.4 Timeout Handling](#2344-timeout-handling)
  - [23.4.5 Error Handling](#2345-error-handling)
- [23.5 Concurrency Patterns](#235-concurrency-patterns)
  - [23.5.1 asyncio.gather()](#2351-asynciogather)
  - [23.5.2 asyncio.create_task()](#2352-asynciocreate_task)
  - [23.5.3 Task Cancellation](#2353-task-cancellation)
  - [23.5.4 Timeout Management](#2354-timeout-management)
  - [23.5.5 Resource Pooling](#2355-resource-pooling)
- [23.6 Performance and Debugging](#236-performance-and-debugging)
  - [23.6.1 Profiling Async Code](#2361-profiling-async-code)
  - [23.6.2 Identifying Bottlenecks](#2362-identifying-bottlenecks)
  - [23.6.3 Debugging Async Issues](#2363-debugging-async-issues)
  - [23.6.4 Deadlock Detection](#2364-deadlock-detection)
  - [23.6.5 Best Practices](#2365-best-practices)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 23.1 Async Basics

Async is **cooperative** multitasking: tasks yield at `await` points so the loop can run other work.

### 23.1.1 Asynchronous Programming

#### Beginner

**Asynchronous** code can **pause** while waiting on I/O, letting other tasks proceed. It differs from **threads** (preemptive) and **processes** (isolated memory).

```python
import asyncio


async def main() -> None:
    print("a")
    await asyncio.sleep(0)
    print("b")


asyncio.run(main())
```

#### Intermediate

Async shines with **many** concurrent **I/O-bound** waits (HTTP, DB, DNS); it does not speed **CPU-bound** work on a single core without **multiprocessing**.

#### Expert

**Structured concurrency** (TaskGroup) makes task lifetimes explicit—prefer it over fire-and-forget tasks when possible.

**Key Points (23.1.1)**

- Async is **not** magic parallelism; it is **efficient waiting**.

**Best Practices (23.1.1)**

- Model operations as **awaitable** boundaries matching real I/O.

**Common Mistakes (23.1.1)**

- Expecting async to parallelize **heavy** `numpy` work without threads/processes.

### 23.1.2 async/await Syntax

#### Beginner

`async def` defines a **coroutine function**; calling it returns a **coroutine object**. **`await`** suspends until the awaited awaitable completes.

```python
import asyncio


async def fetch() -> str:
    await asyncio.sleep(0.01)
    return "data"


async def route_handler() -> str:
    result = await fetch()
    return result.upper()
```

#### Intermediate

You cannot use **`await`** inside a plain **`def`** route unless you offload—FastAPI allows **`def`** handlers by running them in a **threadpool**.

#### Expert

Understand **`__await__`** protocol for custom awaitables—rare in app code, common in libraries.

**Key Points (23.1.2)**

- Missing **`await`** leads to **coroutine never scheduled** warnings.

**Best Practices (23.1.2)**

- Use **ruff** / **flake8-async** rules to catch bad patterns.

**Common Mistakes (23.1.2)**

- Doing `async def` but calling **blocking** APIs inside—defeats the purpose.

### 23.1.3 Event Loop

#### Beginner

The **event loop** schedules tasks, runs callbacks, and processes I/O notifications (epoll/kqueue/IOCP).

```python
import asyncio


async def tick() -> None:
    for i in range(3):
        print(i)
        await asyncio.sleep(0.1)


asyncio.run(tick())
```

#### Intermediate

`asyncio.run` creates a **new** loop—fine for scripts; **uvicorn** owns the loop in servers.

#### Expert

**Loop policies** differ on Windows vs Unix; container images should match **prod** OS assumptions.

**Key Points (23.1.3)**

- **One** loop per thread typically—do not call `asyncio.run` inside running loop.

**Best Practices (23.1.3)**

- Use **`get_running_loop()`** in library code when scheduling callbacks.

**Common Mistakes (23.1.3)**

- Mixing **`asyncio.run`** in random utilities imported by the app—**RuntimeError** ensues.

### 23.1.4 Coroutines

#### Beginner

A **coroutine** is an awaitable created by calling an `async def` function. Schedule it with **`await`** or **`create_task`**.

```python
import asyncio


async def child() -> int:
    return 7


async def parent() -> int:
    return await child()


asyncio.run(parent())
```

#### Intermediate

**Generators** (`yield`) vs **async generators** (`async def` + `yield`)—use async generators for **streaming** with `async for`.

#### Expert

Inspect **coroutine frames** for advanced debugging; understand **closure** capture of loop references.

**Key Points (23.1.4)**

- Coroutines are **cheap** to create; **tasks** actually **schedule** them.

**Best Practices (23.1.4)**

- Name coroutines like functions; name tasks when long-lived (`reader_task`).

**Common Mistakes (23.1.4)**

- Storing coroutine objects in lists without **wrapping** in tasks—never runs.

### 23.1.5 Async Context

#### Beginner

`async with` manages resources with **`__aenter__`/`__aexit__`** (e.g., **`httpx.AsyncClient`**).

```python
import asyncio
import httpx


async def main() -> None:
    async with httpx.AsyncClient() as client:
        r = await client.get("https://example.com")
        assert r.status_code == 200


asyncio.run(main())
```

#### Intermediate

Combine with **`@asynccontextmanager`** for app **`lifespan`** hooks in FastAPI.

```python
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.started = True
    yield
    app.state.started = False


app = FastAPI(lifespan=lifespan)
```

#### Expert

Ensure **`__aexit__`** runs on **cancel**—test timeout paths.

**Key Points (23.1.5)**

- Async context managers **must** be awaited through `async with`.

**Best Practices (23.1.5)**

- Keep **`yield`** in lifespan minimal—heavy startup should still **timeout**.

**Common Mistakes (23.1.5)**

- Nesting clients per request without **closing**—socket exhaustion.

---

## 23.2 Async Endpoints

FastAPI supports both **`async def`** and **`def`** routes—choose based on **workload**.

### 23.2.1 Async Path Operations

#### Beginner

Declare `async def` route functions and `await` I/O inside.

```python
from fastapi import FastAPI
import httpx

app = FastAPI()
client = httpx.AsyncClient()


@app.get("/proxy")
async def proxy() -> dict[str, int]:
    r = await client.get("https://httpbin.org/status/200")
    return {"status": r.status_code}
```

#### Intermediate

Inject **`AsyncSession`** dependencies that `yield` scoped sessions per request.

#### Expert

For **streaming** responses, use **`StreamingResponse`** with async iterables carefully—backpressure matters.

**Key Points (23.2.1)**

- Async routes run on the **event loop** thread—never block it.

**Best Practices (23.2.1)**

- Create **shared clients** in **`lifespan`**, not per request.

**Common Mistakes (23.2.1)**

- Using **global** `requests.get` inside `async def` routes.

### 23.2.2 Sync vs Async

#### Beginner

**`def`** routes run in a **threadpool**; **`async def`** routes run on the loop.

```python
import asyncio
import time
from fastapi import FastAPI

app = FastAPI()


@app.get("/sync")
def sync_route() -> dict[str, str]:
    time.sleep(0.01)  # blocking OK here — offloaded to threadpool
    return {"mode": "sync"}


@app.get("/async")
async def async_route() -> dict[str, str]:
    await asyncio.sleep(0.01)  # non-blocking for the loop
    return {"mode": "async"}
```

#### Intermediate

Threadpool is **finite**—too many blocking `def` routes exhausts workers and hurts latency.

#### Expert

Starlette runs sync endpoints via **`anyio.to_thread.run_sync`**—understand **default limits** and **configuration** in your ASGI server.

**Key Points (23.2.2)**

- Sync endpoints are fine for **short** blocking or **CPU** if pool sized correctly—often better to offload explicitly.

**Best Practices (23.2.2)**

- Prefer **`async`** when your stack is **async-native** end-to-end.

**Common Mistakes (23.2.2)**

- Mixing **async** route with **blocking** DB driver—stalls loop.

### 23.2.3 Performance Benefits

#### Beginner

Async improves **throughput** when waiting on **many** external calls with low **per-request** overhead.

#### Intermediate

Measure **RPS** and **p99** under concurrent load—not microbenchmarks on localhost only.

#### Expert

**Garbage collection**, **logging**, and **JSON** serialization often dominate at high RPS—optimize holistically.

**Key Points (23.2.3)**

- Performance is **system**-level: loop + DB pool + external deps.

**Best Practices (23.2.3)**

- Use **`uvloop`** on Linux via `uvicorn[standard]` for faster loop (CPython).

**Common Mistakes (23.2.3)**

- Claiming async is faster for **CPU-bound** JSON crunching without evidence.

### 23.2.4 When to Use Async

#### Beginner

Use **`async def`** when you **`await`** network/DB/async libraries predominantly.

#### Intermediate

Use **`def`** for **quick** pure-Python transforms if everything else is sync and simple.

#### Expert

If one **blocking** call sits in hot path, isolate with **`to_thread`** or **queue** to worker processes.

**Key Points (23.2.4)**

- Align **endpoint style** with **dependency graph**.

**Best Practices (23.2.4)**

- Standardize on **httpx.AsyncClient** + **async DB** for new greenfield services.

**Common Mistakes (23.2.4)**

- `async def` with **zero** awaits—adds complexity without benefit.

### 23.2.5 Mixed Sync/Async

#### Beginner

Call blocking code from async via **`asyncio.to_thread`** (3.9+) or **`anyio.to_thread.run_sync`**.

```python
import asyncio
import time
from fastapi import FastAPI

app = FastAPI()


def blocking_io() -> str:
    time.sleep(0.05)
    return "done"


@app.get("/mixed")
async def mixed() -> dict[str, str]:
    result = await asyncio.to_thread(blocking_io)
    return {"result": result}
```

#### Intermediate

Do not call **`await`** from threads blindly—use **`asyncio.run_coroutine_threadsafe`** when bridging.

#### Expert

For **CPU** parallelism, **`ProcessPoolExecutor`** with serialized tasks—watch **pickle** constraints.

**Key Points (23.2.5)**

- Mixed patterns are **normal**—contain blocking behind **explicit** boundaries.

**Best Practices (23.2.5)**

- Cap **threadpool** usage—monitor **queue depth**.

**Common Mistakes (23.2.5)**

- Calling **`asyncio.run`** inside **`to_thread`**—nested loop disaster.

---

## 23.3 Async Database Operations

The database is usually the **first** scalability bottleneck—async drivers help **concurrency**, not **query cost**.

### 23.3.1 Async Drivers

#### Beginner

Examples: **`asyncpg`** (Postgres), **`aiomysql`**, **`aiosqlite`**, **`motor`** (Mongo). Pair with ORMs that support async.

```python
# Conceptual asyncpg usage (pseudo-connection)
import asyncpg
import asyncio


async def main() -> None:
    conn = await asyncpg.connect("postgresql://user:pass@localhost/db")
    try:
        row = await conn.fetchrow("SELECT 1 AS n")
        assert row["n"] == 1
    finally:
        await conn.close()


asyncio.run(main())
```

#### Intermediate

Prefer **pool** APIs (`create_pool`) instead of per-query connections.

#### Expert

Tune **`max_size`** vs **uvicorn workers** × **containers** to avoid **Postgres connection storms**.

**Key Points (23.3.1)**

- Async driver ≠ faster **single** query; better **concurrency** characteristics.

**Best Practices (23.3.1)**

- Use **SSL** parameters matching cloud provider requirements.

**Common Mistakes (23.3.1)**

- Using **sync** SQLAlchemy session inside `async def` route.

### 23.3.2 Async SQLAlchemy

#### Beginner

SQLAlchemy 2.x **`AsyncSession`** with **`create_async_engine`** (`postgresql+asyncpg://`).

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///:memory:"


class Base(DeclarativeBase):
    pass


engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
```

#### Intermediate

Use **`async with session.begin()`** transactions; avoid **implicit** begins that surprise you.

#### Expert

For **greenfield**, prefer **`select()`** + **`session.execute`**; understand **`lazy="selectin"`** vs **`joined`** loading in async context.

**Key Points (23.3.2)**

- **Session** lifecycle must match **request** scope—`yield` dependency pattern.

**Best Practices (23.3.2)**

- **Index** foreign keys; async won’t fix missing indexes.

**Common Mistakes (23.3.2)**

- **N+1** queries amplified under concurrent load—monitor SQL logs.

### 23.3.3 Async Queries

#### Beginner

`result = await session.execute(select(User).where(User.id == user_id))`

#### Intermediate

Stream large results with **`stream_scalars`** when supported—mind **memory**.

#### Expert

Use **`FOR UPDATE`** carefully—long-held async transactions block DB resources.

**Key Points (23.3.3)**

- Compose queries with **`select`** / **`where`**—avoid string SQL when ORM suffices.

**Best Practices (23.3.3)**

- Add **`limit`** + **`offset`/`cursor`** pagination tests.

**Common Mistakes (23.3.3)**

- Using **`await`** on **sync** `session.execute` by mistake—subtle bugs when mixing APIs.

### 23.3.4 Connection Management

#### Beginner

Create **one engine** per process; sessions **per request**.

```python
from typing import AsyncIterator

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# SessionLocal = async_sessionmaker(engine, ...)  # see 23.3.2 — one engine per process

app = FastAPI()


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


@app.get("/db/ping")
async def db_ping(session: AsyncSession = Depends(get_session)) -> dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"db": "up"}
```

#### Intermediate

Configure **`pool_pre_ping`** and **`pool_recycle`** for cloud DBs that **reap** idle connections.

#### Expert

Use **PgBouncer** **transaction** pooling mode—avoid **prepared statements** pitfalls across backends.

**Key Points (23.3.4)**

- Pools are **global resources**—size them with **math**, not vibes.

**Best Practices (23.3.4)**

- Expose **metrics**: active connections, checkout time, timeouts.

**Common Mistakes (23.3.4)**

- **New engine** per request—catastrophic overhead.

### 23.3.5 Performance Optimization

#### Beginner

Add **indexes** for filters; fetch only **needed** columns.

#### Intermediate

Batch inserts with **`session.add_all`** or **bulk** APIs.

#### Expert

Partition tables, **read replicas** for analytics, **materialized views** for heavy aggregates.

**Key Points (23.3.5)**

- Async reveals **bad queries** faster under load—profile SQL.

**Best Practices (23.3.5)**

- Use **`EXPLAIN (ANALYZE, BUFFERS)`** in staging with realistic data sizes.

**Common Mistakes (23.3.5)**

- Caching **ORM objects** across requests—stale **identity map** hazards.

---

## 23.4 Async External Services

Microservices architectures multiply **network** waits—async coordination is essential.

### 23.4.1 Async HTTP Calls

#### Beginner

Use **`httpx.AsyncClient`** with **`await client.get/post`**.

```python
import asyncio
import httpx
from fastapi import FastAPI

app = FastAPI()
client = httpx.AsyncClient(timeout=5.0)


@app.get("/aggregate")
async def aggregate() -> dict[str, int]:
    r1, r2 = await asyncio.gather(
        client.get("https://httpbin.org/status/200"),
        client.get("https://httpbin.org/status/204"),
    )
    return {"a": r1.status_code, "b": r2.status_code}
```

#### Intermediate

Share **limits** (`httpx.Limits(max_connections=100, max_keepalive_connections=20)`).

#### Expert

Propagate **W3C tracecontext** headers for **distributed tracing**.

**Key Points (23.4.1)**

- Always set **timeouts**—default infinite waits hurt **availability**.

**Best Practices (23.4.1)**

- Reuse **client**; enable **HTTP/2** if beneficial and supported.

**Common Mistakes (23.4.1)**

- Creating **`AsyncClient()`** per request.

### 23.4.2 aiohttp Library

#### Beginner

`aiohttp` provides **client** and **server** capabilities; many codebases still use it for **websockets** and **custom** connectors.

```python
import aiohttp
import asyncio


async def main() -> None:
    async with aiohttp.ClientSession() as session:
        async with session.get("https://example.com") as resp:
            assert resp.status == 200


asyncio.run(main())
```

#### Intermediate

For **FastAPI**, **`httpx`** often suffices for HTTP; **`aiohttp`** shines when already standardized internally.

#### Expert

Tune **`TCPConnector`** **limit** / **ttl_dns_cache** for high-churn endpoints.

**Key Points (23.4.2)**

- Pick **one** HTTP client style per service to reduce cognitive load.

**Best Practices (23.4.2)**

- Align **SSL** verification settings with security policy.

**Common Mistakes (23.4.2)**

- Mixing **`aiohttp`** response reading mistakes—must **await** `read()`/`json()`.

### 23.4.3 Multiple Concurrent Requests

#### Beginner

`await asyncio.gather(*tasks)` to run I/O concurrently.

```python
import asyncio
import httpx


async def fetch_all(urls: list[str]) -> list[int]:
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [r.status_code for r in responses]
```

#### Intermediate

Use **`return_exceptions=True`** to prevent one failure from cancelling others—then handle errors.

#### Expert

Apply **semapores** to cap concurrency to protect fragile dependencies.

```python
import asyncio
import httpx

sem = asyncio.Semaphore(10)


async def bounded_get(client: httpx.AsyncClient, url: str) -> int:
    async with sem:
        r = await client.get(url)
        return r.status_code
```

**Key Points (23.4.3)**

- Uncapped **`gather`** against thousands of URLs **DOSes yourself**.

**Best Practices (23.4.3)**

- Batch external calls with **chunked** gathers.

**Common Mistakes (23.4.3)**

- Assuming **order** of results matches inputs after **`gather`**—it does, but exceptions change handling.

### 23.4.4 Timeout Handling

#### Beginner

`asyncio.wait_for(coro, timeout=1.0)` wraps any awaitable.

```python
import asyncio


async def slow() -> None:
    await asyncio.sleep(10)


async def main() -> None:
    try:
        await asyncio.wait_for(slow(), timeout=0.05)
    except asyncio.TimeoutError:
        print("timed out")


asyncio.run(main())
```

#### Intermediate

Prefer **library-native** timeouts (`httpx` timeout tuple: connect/read/write).

#### Expert

On timeout, **cancel** tasks and **await** them to release sockets—avoid **Task destroyed but pending**.

**Key Points (23.4.4)**

- Timeouts should be **policy** per dependency, not a single global number.

**Best Practices (23.4.4)**

- Log **which** hop timed out with **URL** + **attempt** id.

**Common Mistakes (23.4.4)**

- Catching **`TimeoutError`** without distinguishing **`asyncio`** vs builtin on older Pythons—be explicit.

### 23.4.5 Error Handling

#### Beginner

Catch **`httpx.HTTPStatusError`** after `raise_for_status()` or inspect `response.status_code`.

```python
import httpx


async def call() -> str:
    async with httpx.AsyncClient() as client:
        r = await client.get("https://httpbin.org/status/500")
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as exc:
            return f"remote error {exc.response.status_code}"
        return r.text
```

#### Intermediate

Implement **retry** with **exponential backoff** + **jitter** for **idempotent** reads.

#### Expert

Classify errors: **transient** (retry), **client** (4xx fix caller), **quota** (backoff + circuit break).

**Key Points (23.4.5)**

- Partial failures in **`gather`** need explicit **reduction** logic.

**Best Practices (23.4.5)**

- Attach **request ids** to logs across retries.

**Common Mistakes (23.4.5)**

- Retrying **non-idempotent** POSTs without **dedupe** keys.

---

## 23.5 Concurrency Patterns

Orchestration primitives turn **spaghetti** into **structured** flows.

### 23.5.1 asyncio.gather()

#### Beginner

Runs awaitables **concurrently**; results ordered to match input.

```python
import asyncio


async def a() -> int:
    await asyncio.sleep(0.01)
    return 1


async def b() -> int:
    await asyncio.sleep(0.02)
    return 2


async def main() -> list[int]:
    return list(await asyncio.gather(a(), b()))


asyncio.run(main())
```

#### Intermediate

`return_exceptions=True` returns **Exception instances** in result list—handle explicitly.

#### Expert

For **typed** task groups, **`TaskGroup`** (3.11+) fails fast with **ExceptionGroup**—great for structured cancel.

**Key Points (23.5.1)**

- **`gather`** is not for **infinite** producer tasks without supervision.

**Best Practices (23.5.1)**

- Keep awaited coroutine lists **bounded**.

**Common Mistakes (23.5.1)**

- Using **`gather`** inside tight loops building huge lists—memory blowup.

### 23.5.2 asyncio.create_task()

#### Beginner

Schedules coroutine **immediately**; returns **`Task`** you can **`await`** later.

```python
import asyncio


async def bg() -> str:
    await asyncio.sleep(0.01)
    return "done"


async def main() -> str:
    t = asyncio.create_task(bg())
    await asyncio.sleep(0)
    return await t


asyncio.run(main())
```

#### Intermediate

Keep references to tasks to avoid **garbage collection** edge cases on pending tasks (CPython details).

#### Expert

Use **`asyncio.TaskGroup`** to await **related** tasks as a bundle.

**Key Points (23.5.2)**

- Tasks run **concurrently** with current coroutine—ordering interleaves.

**Best Practices (23.5.2)**

- Name tasks (`set_name`) for **debug** traces.

**Common Mistakes (23.5.2)**

- Not **awaiting** tasks before shutdown—warnings and lost errors.

### 23.5.3 Task Cancellation

#### Beginner

`task.cancel()` raises **`CancelledError`** inside the task—handle **cleanup** in `finally`.

```python
import asyncio


async def worker() -> None:
    try:
        while True:
            await asyncio.sleep(3600)
    except asyncio.CancelledError:
        print("cleaning up")
        raise


async def main() -> None:
    t = asyncio.create_task(worker())
    await asyncio.sleep(0)
    t.cancel()
    try:
        await t
    except asyncio.CancelledError:
        pass


asyncio.run(main())
```

#### Intermediate

**Shield** critical sections with **`asyncio.shield`** when cancellation should not abort them—use sparingly.

#### Expert

Cancellation interacts with **`asyncio.wait_for`**—understand **inner** vs **outer** cancellation semantics.

**Key Points (23.5.3)**

- Cooperative cancellation—tasks must **await** to observe cancel.

**Best Practices (23.5.3)**

- Propagate **`CancelledError`** after cleanup unless truly swallowing (rare).

**Common Mistakes (23.5.3)**

- Catching **`Exception`** broadly and accidentally swallowing **`CancelledError`**.

### 23.5.4 Timeout Management

#### Beginner

Layer timeouts: **client**, **route**, **DB statement** (where supported).

#### Intermediate

Use **`asyncio.timeout`** context manager (3.11+) for clarity.

```python
import asyncio


async def op() -> None:
    await asyncio.sleep(10)


async def main() -> None:
    try:
        async with asyncio.timeout(0.05):
            await op()
    except TimeoutError:
        print("outer timeout")


asyncio.run(main())
```

#### Expert

Differentiate **connect** vs **read** timeouts—one masks DNS issues, the other slow servers.

**Key Points (23.5.4)**

- **Nested** timeouts need documented **precedence**.

**Best Practices (23.5.4)**

- Emit **metrics** on timeout counts per dependency.

**Common Mistakes (23.5.4)**

- Using a **single** 30s timeout everywhere—masks fast-fail opportunities.

### 23.5.5 Resource Pooling

#### Beginner

HTTP clients, DB pools, Redis pools are **pools**—create once, reuse.

#### Intermediate

Semaphore-guard **expensive** external APIs even with pooled connections.

#### Expert

**Circuit breakers** (e.g., **pybreaker**) stop hammering **failing** dependencies.

**Key Points (23.5.5)**

- Pools need **warmup** strategy on cold start—avoid thundering herd.

**Best Practices (23.5.5)**

- Monitor **pool checkout wait** time.

**Common Mistakes (23.5.5)**

- **Per-request** pool creation or **per-task** client spin-up.

---

## 23.6 Performance and Debugging

Observability turns **heisenbugs** into **actionable** fixes.

### 23.6.1 Profiling Async Code

#### Beginner

Use **`cProfile`** on workloads driven by **`asyncio.run`** scripts.

#### Intermediate

Sample production with **`py-spy`** without modifying code—safe for many Linux deployments.

#### Expert

Use **`yappi`** or **`austin`** for async-aware profiling; correlate with **OpenTelemetry** spans.

**Key Points (23.6.1)**

- Wall time != CPU time—async hides **wait** in profiles unless tools understand tasks.

**Best Practices (23.6.1)**

- Profile under **load**, not single requests.

**Common Mistakes (23.6.1)**

- Optimizing **Python** when **DB** is the bottleneck—verify first.

### 23.6.2 Identifying Bottlenecks

#### Beginner

Check **p99 latency** splits: routing, auth, DB, external HTTP, serialization.

#### Intermediate

Add **middleware** timing headers in **staging** only.

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Process-Time-ms"] = f"{duration_ms:.2f}"
        return response
```

#### Expert

**Saturation** signals: threadpool queue depth, DB pool timeouts, **ephemeral port** exhaustion.

**Key Points (23.6.2)**

- **Little’s Law** relates concurrency, arrival rate, and latency—use it mentally.

**Best Practices (23.6.2)**

- Dashboard **RED** metrics: rate, errors, duration.

**Common Mistakes (23.6.2)**

- Measuring only **average** latency.

### 23.6.3 Debugging Async Issues

#### Beginner

Run with **`PYTHONASYNCIODEBUG=1`** in dev to catch **never-awaited** coroutines (noisy).

#### Intermediate

Print **`asyncio.all_tasks()`** during hangs—identify stuck tasks.

#### Expert

Use **`aiomonitor`** or remote REPL in **staging** (never prod without controls).

**Key Points (23.6.3)**

- Reproducible **minimal** asyncio scripts isolate framework vs app bugs.

**Best Practices (23.6.3)**

- Enable **structured tracebacks** (ExceptionGroups) on 3.11+.

**Common Mistakes (23.6.3)**

- Debugging with **`print`** inside concurrent tasks without **ordering** context.

### 23.6.4 Deadlock Detection

#### Beginner

**Deadlocks** in async often are **await forever** scenarios—missing wakeup, deadlock on **locks**.

#### Intermediate

Avoid **async lock** held across **await** to unrelated network calls unless carefully reasoned.

```python
import asyncio

lock = asyncio.Lock()


async def bad() -> None:
    async with lock:
        await asyncio.sleep(10)  # long wait while holding lock — blocks others


async def contender() -> None:
    async with lock:
        pass
```

#### Expert

Use **timeouts** on lock acquisition **`asyncio.wait_for(lock.acquire(), ...)`** in sensitive code (rare—prefer redesign).

**Key Points (23.6.4)**

- Async deadlocks are **logical**, not OS thread deadlocks only.

**Best Practices (23.6.4)**

- Keep **lock scopes** tiny; no I/O inside unless unavoidable.

**Common Mistakes (23.6.4)**

- **Re-entrancy** confusion—`asyncio.Lock` is not reentrant.

### 23.6.5 Best Practices

#### Beginner

`async def` + async libraries + timeouts + shared clients.

#### Intermediate

**Lint** with **ruff** plugins / **flake8-async**; type check with **mypy** + **`AsyncIterator`** hints.

#### Expert

**Chaos** experiments: slow dependencies, **packet loss**, **DNS** failures—validate **degradation** paths.

**Key Points (23.6.5)**

- Reliability engineering extends async **patterns** into **operations**.

**Best Practices (23.6.5)**

- Document **concurrency limits** per route in internal runbooks.

**Common Mistakes (23.6.5)**

- **Global** mutable caches without locks in multi-task contexts.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points

- **Async** improves **I/O concurrency** on a single thread by **cooperative** `await` points.
- FastAPI **`async def`** routes must not **block** the event loop—offload blocking work.
- **`asyncio.gather`**, **`create_task`**, and **timeouts** orchestrate concurrent awaits safely.
- **Async DB/HTTP** stacks need **pools** and **timeouts** sized for **real** traffic.
- Debugging async requires **task-aware** tools and **structured** logging/tracing.

### Best Practices

- Share **`httpx.AsyncClient`** and **DB engines** via **`lifespan`**.
- Apply **semaphores** and **bulkheads** to downstream dependencies.
- Use **`return_exceptions=True`** or **`TaskGroup`** patterns for robust multi-call handling.
- Profile under load; watch **p99** and **pool** metrics.
- Keep **lock** regions free of **unrelated** network I/O.

### Common Mistakes

- Blocking calls (`requests`, sync ORM) inside **`async def`** routes.
- Unbounded **`gather`** on user-controlled lists.
- Swallowing **`CancelledError`** accidentally.
- Creating new **clients/pools** per request.
- Ignoring **timeouts**—leading to **stuck** requests and cascading failures.
