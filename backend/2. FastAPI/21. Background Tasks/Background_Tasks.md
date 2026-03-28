# Background Tasks

FastAPI’s **`BackgroundTasks`** schedules work to run **after** the response is sent—ideal for **non-critical side effects** like sending email, writing audit logs, or notifying external systems without blocking the client. This chapter contrasts **`BackgroundTasks`** with **true async workers**, explores **sync and async** task functions, **ordering**, **error handling**, **integration** with queues and schedulers, and **observability**.

**How to use these notes:** `BackgroundTasks` runs **in-process** in the same worker as your app—it is **not** a distributed queue. For heavy or crash-safe work, combine patterns here with **Celery**, **RQ**, or **cloud task** services.

## 📑 Table of Contents

- [21.1 Background Task Basics](#211-background-task-basics)
  - [21.1.1 BackgroundTasks Class](#2111-backgroundtasks-class)
  - [21.1.2 Adding Tasks](#2112-adding-tasks)
  - [21.1.3 Task Execution](#2113-task-execution)
  - [21.1.4 Task Order](#2114-task-order)
  - [21.1.5 Use Cases](#2115-use-cases)
- [21.2 Creating Background Tasks](#212-creating-background-tasks)
  - [21.2.1 Simple Tasks](#2121-simple-tasks)
  - [21.2.2 Tasks with Parameters](#2122-tasks-with-parameters)
  - [21.2.3 Task Functions](#2123-task-functions)
  - [21.2.4 Task Results](#2124-task-results)
  - [21.2.5 Task Status](#2125-task-status)
- [21.3 Async Background Tasks](#213-async-background-tasks)
  - [21.3.1 Async Task Functions](#2131-async-task-functions)
  - [21.3.2 Async/Await in Tasks](#2132-asyncawait-in-tasks)
  - [21.3.3 Task Concurrency](#2133-task-concurrency)
  - [21.3.4 Performance Optimization](#2134-performance-optimization)
  - [21.3.5 Error Handling](#2135-error-handling)
- [21.4 Advanced Task Patterns](#214-advanced-task-patterns)
  - [21.4.1 Task Queues](#2141-task-queues)
  - [21.4.2 Celery Integration](#2142-celery-integration)
  - [21.4.3 RQ (Redis Queue)](#2143-rq-redis-queue)
  - [21.4.4 APScheduler](#2144-apscheduler)
  - [21.4.5 Scheduled Tasks](#2145-scheduled-tasks)
- [21.5 Monitoring and Logging](#215-monitoring-and-logging)
  - [21.5.1 Task Logging](#2151-task-logging)
  - [21.5.2 Task Monitoring](#2152-task-monitoring)
  - [21.5.3 Error Tracking](#2153-error-tracking)
  - [21.5.4 Performance Metrics](#2154-performance-metrics)
  - [21.5.5 Best Practices](#2155-best-practices)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 21.1 Background Task Basics

`BackgroundTasks` is Starlette’s lightweight mechanism—understand its **lifecycle** before relying on it for **financial** guarantees.

### 21.1.1 BackgroundTasks Class

#### Beginner

Inject `BackgroundTasks` into your path operation; it is provided by FastAPI automatically when you declare it as a parameter.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def write_log(message: str) -> None:
    with open("app.log", "a", encoding="utf-8") as fh:
        fh.write(message + "\n")


@app.post("/signup")
async def signup(email: str, tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(write_log, f"signup {email}")
    return {"status": "accepted"}
```

#### Intermediate

`BackgroundTasks` is a **mutable accumulator** per request: multiple `add_task` calls queue callable objects executed **sequentially** after the response.

#### Expert

Implementation detail: Starlette runs tasks on the **ASGI** response path; behavior with **streaming responses** still runs tasks after the stream completes—verify with your response type.

**Key Points (21.1.1)**

- `BackgroundTasks` is **request-scoped** wiring, not a global executor singleton.

**Best Practices (21.1.1)**

- Keep task callables **pure enough** to test without HTTP.

**Common Mistakes (21.1.1)**

- Assuming **parallelism**—default execution is **sequential** per request.

### 21.1.2 Adding Tasks

#### Beginner

`tasks.add_task(func, *args, **kwargs)` registers work; arguments are bound immediately.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def notify(user_id: int, channel: str) -> None:
    ...


@app.post("/notify/{user_id}")
async def schedule_notify(
    user_id: int, channel: str, tasks: BackgroundTasks
) -> dict[str, str]:
    tasks.add_task(notify, user_id, channel)
    return {"queued": "true"}
```

#### Intermediate

You can add the **same** function multiple times with different args—order preserved.

#### Expert

Avoid capturing **mutable** defaults that change before execution—bind **immutable** snapshots or copy data structures.

**Key Points (21.1.2)**

- Arguments are evaluated at **`add_task`** time for references passed in.

**Best Practices (21.1.2)**

- Pass **ids**, not ORM instances, if the session closes before the task runs.

**Common Mistakes (21.1.2)**

- Closing DB **sessions** before background work that still needs them.

### 21.1.3 Task Execution

#### Beginner

Tasks run **after** the response is assembled; failures in tasks **do not** change the HTTP status already sent.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def risky() -> None:
    raise RuntimeError("boom")


@app.get("/ok-but-bg-fails")
async def dual(tasks: BackgroundTasks) -> dict[str, bool]:
    tasks.add_task(risky)
    return {"http_ok": True}
```

#### Intermediate

For **async** route + **sync** task, Starlette runs sync tasks in a **threadpool**; understand blocking implications.

#### Expert

If the **process** dies immediately after responding, queued tasks may **never** run—this is why payment capture belongs in **durable** queues.

**Key Points (21.1.3)**

- HTTP success ≠ background success.

**Best Practices (21.1.3)**

- Use **idempotent** side effects where possible.

**Common Mistakes (21.1.3)**

- Using background tasks for **must-run-once** financial operations without persistence.

### 21.1.4 Task Order

#### Beginner

Tasks execute in **FIFO** order per request for the tasks you added.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()
order: list[str] = []


def step(name: str) -> None:
    order.append(name)


@app.get("/order")
async def ordered(tasks: BackgroundTasks) -> dict[str, list[str]]:
    tasks.add_task(step, "a")
    tasks.add_task(step, "b")
    return {"note": "check global order after response"}
```

#### Intermediate

Across **concurrent** requests, interleaving depends on server concurrency—never rely on **global** ordering without explicit **queue**.

#### Expert

If you need **priority**, use a **priority queue** worker, not `BackgroundTasks`.

**Key Points (21.1.4)**

- Per-request ordering is **stable**; global ordering is **not**.

**Best Practices (21.1.4)**

- Document ordering assumptions in code comments when **multiple** tasks depend on each other.

**Common Mistakes (21.1.4)**

- Assuming task B finished before request 2’s tasks because it was added earlier globally.

### 21.1.5 Use Cases

#### Beginner

Good: **email**, **webhooks**, **analytics** fire-and-forget, **cache** warming.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def send_welcome_email(to: str) -> None:
    ...


@app.post("/users")
async def create_user(email: str, tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(send_welcome_email, email)
    return {"created": email}
```

#### Intermediate

Borderline: **thumbnail** generation—OK if loss acceptable; better queue if SLA matters.

#### Expert

Bad fit: **distributed transactions**, **exactly-once** delivery, **long CPU** jobs blocking threadpool.

**Key Points (21.1.5)**

- Match **durability** requirements to mechanism.

**Best Practices (21.1.5)**

- Keep tasks **short** or offload to workers.

**Common Mistakes (21.1.5)**

- Running **minutes** of work in `BackgroundTasks`.

---

## 21.2 Creating Background Tasks

Patterns for structuring callable code you can **test** and **reuse**.

### 21.2.1 Simple Tasks

#### Beginner

Any callable works; prefer **top-level** functions for pickling if you later move to queues.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def ping() -> None:
    print("pong")


@app.get("/ping-task")
async def ping_task(tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(ping)
    return {"scheduled": "ping"}
```

#### Intermediate

Lambdas are **OK** for in-process tasks but **break** Celery/RQ serialization—avoid early if you might migrate.

#### Expert

For **typed** codebases, annotate task functions and wrap with **retry** policies at the boundary.

**Key Points (21.2.1)**

- Simplicity aids **operability**—one function, one responsibility.

**Best Practices (21.2.1)**

- Name tasks `send_*`, `record_*`, `enqueue_*` for clarity.

**Common Mistakes (21.2.1)**

- Capturing **request** objects inside tasks—stale and unsafe.

### 21.2.2 Tasks with Parameters

#### Beginner

Pass primitives and **immutable** data; rebuild ORM objects inside the task with a **new session**.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def audit(actor: str, action: str, target_id: int) -> None:
    ...


@app.delete("/items/{item_id}")
async def delete_item(
    item_id: int, actor: str, tasks: BackgroundTasks
) -> dict[str, str]:
    tasks.add_task(audit, actor, "delete", item_id)
    return {"deleted": str(item_id)}
```

#### Intermediate

Use **`dataclasses`** or **Pydantic** models converted to dicts for structured payloads.

#### Expert

For **PII**, pass **tokenized** references; log **hashed** identifiers in background paths.

**Key Points (21.2.2)**

- Parameters cross **thread/process** boundaries in workers—must be **serializable** there.

**Best Practices (21.2.2)**

- Avoid **open file handles** as parameters.

**Common Mistakes (21.2.2)**

- Passing **SQLAlchemy** instances tied to a closed session.

### 21.2.3 Task Functions

#### Beginner

Group related side effects into **services** (`notifications.py`) and call from tasks.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


class Notifier:
    @staticmethod
    def send_sms(phone: str, body: str) -> None:
        ...


@app.post("/alert")
async def alert(phone: str, tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(Notifier.send_sms, phone, "hello")
    return {"queued": "sms"}
```

#### Intermediate

Use **protocols** or **ABC** for test doubles.

#### Expert

Apply **circuit breakers** around external calls inside task functions.

**Key Points (21.2.3)**

- Treat task functions as **application services**, not route clutter.

**Best Practices (21.2.3)**

- Keep FastAPI routes **thin**—validate input, call domain, schedule work.

**Common Mistakes (21.2.3)**

- Embedding **HTTP client** calls inline without timeouts/retries.

### 21.2.4 Task Results

#### Beginner

`BackgroundTasks` **does not** return results to the client—by design.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def compute() -> int:
    return 42


@app.get("/noresult")
async def noresult(tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(compute)
    return {"info": "client will not see 42 via BackgroundTasks"}
```

#### Intermediate

Persist results to **DB**, **Redis**, or a **task id** endpoint for polling.

#### Expert

Use **Celery result backends** or **cloud task** completion webhooks.

**Key Points (21.2.4)**

- If you need **feedback**, use a **job** abstraction.

**Best Practices (21.2.4)**

- Return **`202 Accepted`** + **`job_id`** from HTTP when kicking long work.

**Common Mistakes (21.2.4)**

- Expecting exceptions in tasks to map to **HTTP errors**—too late.

### 21.2.5 Task Status

#### Beginner

There is **no** built-in status for `BackgroundTasks`—you implement **state** if needed.

```python
from uuid import uuid4
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()
JOBS: dict[str, str] = {}


def run_job(job_id: str) -> None:
    JOBS[job_id] = "done"


@app.post("/job")
async def job(tasks: BackgroundTasks) -> dict[str, str]:
    job_id = str(uuid4())
    JOBS[job_id] = "pending"
    tasks.add_task(run_job, job_id)
    return {"job_id": job_id}


@app.get("/job/{job_id}")
async def job_status(job_id: str) -> dict[str, str]:
    return {"status": JOBS.get(job_id, "unknown")}
```

#### Intermediate

Use **Redis** with **TTL** for ephemeral status—not in-memory dicts in multi-worker setups.

#### Expert

Emit **metrics**: queued, running, succeeded, failed counts with **histogram** durations.

**Key Points (21.2.5)**

- Status requires **external** storage for **multi-instance** truth.

**Best Practices (21.2.5)**

- Include **timestamps** and **error** strings in status records.

**Common Mistakes (21.2.5)**

- Storing status **only** in process memory on **horizontally scaled** APIs.

---

## 21.3 Async Background Tasks

Starlette supports **async** callables—know how they interact with the **event loop**.

### 21.3.1 Async Task Functions

#### Beginner

Pass `async def` functions; they are **awaited** after the response.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


async def push_metric(name: str) -> None:
    # imagine non-blocking I/O
    ...


@app.get("/metrics-bg")
async def metrics_bg(tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(push_metric, "page_view")
    return {"ok": "true"}
```

#### Intermediate

Mixing many async tasks still runs them **sequentially** unless you spawn internal tasks—which shifts semantics.

#### Expert

For **high fan-in**, an async task that merely **pushes** to an **asyncio.Queue** consumed by a **worker** task can smooth bursts.

**Key Points (21.3.1)**

- Async tasks **cooperate** with other async I/O on the loop—still not “free parallelism.”

**Best Practices (21.3.1)**

- Use **`httpx.AsyncClient`** inside async tasks, not blocking `requests`.

**Common Mistakes (21.3.1)**

- Calling **blocking** libraries inside async tasks—stalls the server.

### 21.3.2 Async/Await in Tasks

#### Beginner

Use `await` for network and DB drivers that support async; keep CPU work off the loop.

```python
import asyncio
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


async def slow_io() -> None:
    await asyncio.sleep(0.1)


@app.get("/awaiting")
async def awaiting(tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(slow_io)
    return {"scheduled": "sleep"}
```

#### Intermediate

Use **`asyncio.create_task`** only when you explicitly want **concurrent** background work—and understand **cancellation** on shutdown.

#### Expert

Shield critical **flush** operations with **`asyncio.shield`** when combining server shutdown hooks.

**Key Points (21.3.2)**

- `await` yields control—great for throughput when I/O bound.

**Best Practices (21.3.2)**

- Set **timeouts** on external awaits.

**Common Mistakes (21.3.2)**

- **Nested** infinite loops in background tasks without **supervision**.

### 21.3.3 Task Concurrency

#### Beginner

Multiple **requests** schedule multiple background tasks **concurrently** across the event loop / threadpool.

#### Intermediate

A **single** request’s tasks run **one after another** unless a task internally parallelizes.

```python
import asyncio
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


async def parallel_bundle() -> None:
    await asyncio.gather(
        asyncio.sleep(0.05),
        asyncio.sleep(0.05),
    )


@app.get("/bundle")
async def bundle(tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(parallel_bundle)
    return {"scheduled": "bundle"}
```

#### Expert

Cap concurrency with **`Semaphore`** inside shared workers to protect downstream systems.

**Key Points (21.3.3)**

- Concurrency != **parallel CPU**—profile before adding `ProcessPoolExecutor`.

**Best Practices (21.3.3)**

- **Bulkhead** external dependencies.

**Common Mistakes (21.3.3)**

- Unbounded **`gather`** on user-controlled list sizes.

### 21.3.4 Performance Optimization

#### Beginner

Batch writes: accumulate in request handler, flush once in task.

#### Intermediate

Use **connection pooling** (`httpx` limits) shared via **`lifespan`** context.

```python
from contextlib import asynccontextmanager
from typing import AsyncIterator

import httpx
from fastapi import BackgroundTasks, FastAPI

client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    global client
    client = httpx.AsyncClient(timeout=5.0)
    yield
    await client.aclose()


app = FastAPI(lifespan=lifespan)


async def notify_remote(payload: dict) -> None:
    assert client is not None
    await client.post("https://hooks.example.com", json=payload)


@app.post("/hook")
async def hook(payload: dict, tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(notify_remote, payload)
    return {"queued": "true"}
```

#### Expert

Move heavy work to **Celery** with **autoscaling** workers based on **queue depth**.

**Key Points (21.3.4)**

- Reuse **clients** and **DB pools**—per-task instantiation is costly.

**Best Practices (21.3.4)**

- Measure **p95** route time **with** background work enabled.

**Common Mistakes (21.3.4)**

- Creating new **`httpx.Client`** per task.

### 21.3.5 Error Handling

#### Beginner

Wrap task bodies in **`try/except`**, log exceptions—Starlette logs failures but clients never see them.

```python
import logging
from fastapi import BackgroundTasks, FastAPI

log = logging.getLogger(__name__)
app = FastAPI()


def flaky() -> None:
    try:
        raise ValueError("nope")
    except Exception:
        log.exception("background task failed")


@app.get("/flaky")
async def flaky_route(tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(flaky)
    return {"http": "200"}
```

#### Intermediate

Send errors to **Sentry**/`OpenTelemetry` with **request id** context propagated manually.

#### Expert

Implement **dead-letter** storage for failing tasks when using queues.

**Key Points (21.3.5)**

- Observability for background work is **not automatic**.

**Best Practices (21.3.5)**

- Use **structured logs** with `task_name`, `args_hash`.

**Common Mistakes (21.3.5)**

- Silent **`pass`** in `except` blocks.

---

## 21.4 Advanced Task Patterns

When in-process tasks are not enough, integrate **brokers** and **schedulers**.

### 21.4.1 Task Queues

#### Beginner

A queue decouples **HTTP** from **workers** via a **broker** (Redis, RabbitMQ, SQS).

```python
# Conceptual enqueue from a route (Redis list)
import json
import redis
from fastapi import FastAPI

r = redis.Redis(host="localhost", port=6379, db=0)
app = FastAPI()


@app.post("/jobs")
async def enqueue_job(kind: str) -> dict[str, str]:
    r.rpush("jobs", json.dumps({"kind": kind}))
    return {"status": "enqueued"}
```

#### Intermediate

Define **retry**, **backoff**, and **visibility timeout** semantics per broker.

#### Expert

Use **idempotency keys** at enqueue time to dedupe **double clicks** and **client retries**.

**Key Points (21.4.1)**

- Queues add **durability** and **horizontal scale**.

**Best Practices (21.4.1)**

- Keep messages **small**; store payloads in **object storage** when large.

**Common Mistakes (21.4.1)**

- **Poison messages** infinite retry loops—cap attempts.

### 21.4.2 Celery Integration

#### Beginner

Celery uses **brokers** and **result backends**; tasks are **decorated** functions in a worker process.

```python
# celery_app.py (worker side)
from celery import Celery

celery_app = Celery("tasks", broker="redis://localhost:6379/0")


@celery_app.task
def add(x: int, y: int) -> int:
    return x + y
```

```python
# fastapi route
from fastapi import FastAPI
from celery_app import add as add_task

app = FastAPI()


@app.post("/sum")
async def sum_route(a: int, b: int) -> dict[str, str]:
    async_result = add_task.delay(a, b)
    return {"task_id": async_result.id}
```

#### Intermediate

Use **task retries**, **`acks_late`**, and **visibility** to handle crashes safely.

#### Expert

Run workers on **separate** autoscaling groups; monitor **queue lag** as scaling signal.

**Key Points (21.4.2)**

- Celery is **battle-tested** for Python batch workloads.

**Best Practices (21.4.2)**

- Pin **serializer** (JSON) and avoid pickle for untrusted data.

**Common Mistakes (21.4.2)**

- Sharing **mutable global** state between workers incorrectly.

### 21.4.3 RQ (Redis Queue)

#### Beginner

RQ is simpler than Celery—good for **Redis-only** shops and smaller workloads.

```python
from redis import Redis
from rq import Queue
from fastapi import FastAPI

redis_conn = Redis()
q = Queue(connection=redis_conn)
app = FastAPI()


def cleanup(user_id: int) -> None:
    ...


@app.delete("/users/{user_id}")
async def remove_user(user_id: int) -> dict[str, str]:
    q.enqueue(cleanup, user_id)
    return {"enqueued": "cleanup"}
```

#### Intermediate

Use **RQ Scheduler** or external cron for periodic jobs.

#### Expert

Monitor **Redis memory**—long queues of large payloads hurt.

**Key Points (21.4.3)**

- RQ trades **features** for **simplicity** vs Celery.

**Best Practices (21.4.3)**

- Run workers with **process** isolation for CPU tasks.

**Common Mistakes (21.4.3)**

- Using RQ for **exactly-once** semantics without careful design.

### 21.4.4 APScheduler

#### Beginner

APScheduler runs **in-process** cron-like jobs—great for **single-node** maintenance tasks, not distributed locks by default.

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

scheduler = AsyncIOScheduler()
app = FastAPI()


@app.on_event("startup")
async def start_scheduler() -> None:
    scheduler.start()


@app.on_event("shutdown")
async def shutdown_scheduler() -> None:
    scheduler.shutdown(wait=False)


def sweep() -> None:
    ...


scheduler.add_job(sweep, "interval", minutes=5)
```

#### Intermediate

For **multi-worker**, use **RedisJobStore** or ensure only **one** scheduler leader.

#### Expert

Combine with **distributed locks** (Redis `SET NX`) to prevent duplicate **cron** execution.

**Key Points (21.4.4)**

- In-process schedulers are **not** HA without external coordination.

**Best Practices (21.4.4)**

- Log **job start/end** with duration.

**Common Mistakes (21.4.4)**

- Running **five** uvicorn workers → **five** schedulers firing the same job.

### 21.4.5 Scheduled Tasks

#### Beginner

Schedule with **APScheduler**, **Celery beat**, **K8s CronJob**, or **cloud schedulers** hitting internal endpoints.

#### Intermediate

Protect internal endpoints with **mTLS** or **static bearer** tokens rotated via secrets manager.

#### Expert

Use **workload identity** and **VPC** egress controls for scheduler-triggered jobs.

```python
from fastapi import Depends, FastAPI, Header, HTTPException, status

app = FastAPI()


def verify_cron(x_cron_secret: str | None = Header(default=None)) -> None:
    if x_cron_secret != "rotate-me":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


@app.post("/internal/sweep", dependencies=[Depends(verify_cron)])
async def sweep_endpoint() -> dict[str, str]:
    return {"ran": "sweep"}
```

**Key Points (21.4.5)**

- **Who** can trigger scheduled endpoints matters as much as **when**.

**Best Practices (21.4.5)**

- Make scheduled jobs **idempotent** across overlaps.

**Common Mistakes (21.4.5)**

- Long **overlapping** runs without **locking**.

---

## 21.5 Monitoring and Logging

If you cannot see background failures, you will not fix them.

### 21.5.1 Task Logging

#### Beginner

Use standard **`logging`** with **context** (`request_id`) passed into task args.

```python
import logging
import uuid
from fastapi import BackgroundTasks, FastAPI, Request

log = logging.getLogger(__name__)
app = FastAPI()


def work(request_id: str) -> None:
    log.info("task_start", extra={"request_id": request_id})


@app.get("/trace")
async def trace(request: Request, tasks: BackgroundTasks) -> dict[str, str]:
    rid = str(uuid.uuid4())
    tasks.add_task(work, rid)
    return {"request_id": rid}
```

#### Intermediate

Adopt **`structlog`** or JSON logs for ingestion by **ELK**/**Loki**.

#### Expert

Propagate **OpenTelemetry** trace context manually into task functions (carrier dict).

**Key Points (21.5.1)**

- Correlate **HTTP** and **background** logs with shared ids.

**Best Practices (21.5.1)**

- Log **start**, **success**, **failure** consistently.

**Common Mistakes (21.5.1)**

- Logging **PII** payloads in background error traces.

### 21.5.2 Task Monitoring

#### Beginner

Export counters: tasks **scheduled**, **executed**, **failed**.

#### Intermediate

Use **Prometheus** client with labels `task_name`.

```python
from prometheus_client import Counter
from fastapi import BackgroundTasks, FastAPI

TASKS_FAILED = Counter("bg_tasks_failed_total", "Failed background tasks", ["name"])
app = FastAPI()


def monitored(name: str) -> None:
    try:
        raise RuntimeError("fail")
    except Exception:
        TASKS_FAILED.labels(name=name).inc()


@app.get("/mon")
async def mon(tasks: BackgroundTasks) -> dict[str, str]:
    tasks.add_task(monitored, "demo")
    return {"ok": "true"}
```

#### Expert

Alert on **SLO** burn rates for downstream side effects (webhook failure ratio).

**Key Points (21.5.2)**

- Monitoring must cover **worker** processes too, not only API.

**Best Practices (21.5.2)**

- Dashboard **queue depth** and **age of oldest message**.

**Common Mistakes (21.5.2)**

- Only monitoring **HTTP 5xx**—background could be failing silently.

### 21.5.3 Error Tracking

#### Beginner

Integrate **Sentry SDK** in both API and worker processes.

#### Intermediate

Attach **user id**, **org id**, **release** version to events.

#### Expert

Sample **high-volume** benign errors to control cost.

**Key Points (21.5.3)**

- Same error in **API** and **task** needs **unified** tracking.

**Best Practices (21.5.3)**

- Tag tasks with **`task.queue`**, **`task.retry`**.

**Common Mistakes (21.5.3)**

- Double-reporting the same failure on **retry** without fingerprinting.

### 21.5.4 Performance Metrics

#### Beginner

Time task execution with **`time.perf_counter()`** and log duration.

#### Intermediate

Use **OpenTelemetry** spans around task bodies—even if not HTTP.

#### Expert

Track **threadpool saturation** if many sync tasks run—**Prometheus** `process` metrics help.

**Key Points (21.5.4)**

- Measure **tail** latency of side effects, not averages only.

**Best Practices (21.5.4)**

- Compare **before/after** when adding new background work.

**Common Mistakes (21.5.4)**

- Ignoring **DB pool** exhaustion triggered by tasks.

### 21.5.5 Best Practices

#### Beginner

Default checklist: timeouts, retries with cap, logging, idempotency.

#### Intermediate

**Feature flag** new background integrations; **dark launch** with sampled execution.

#### Expert

Run **failure injection** tests: broker down, DNS flaky, disk full.

**Key Points (21.5.5)**

- Operational maturity beats clever code.

**Best Practices (21.5.5)**

- Document **SLA** for asynchronous side effects per product surface.

**Common Mistakes (21.5.5)**

- No **runbooks** for stuck queues.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points

- `BackgroundTasks` runs **after** the response, **in-process**, typically **sequentially** per request.
- It is ideal for **best-effort** side effects, not **financial** or **strictly-once** processing without a queue.
- **Async** tasks must avoid **blocking** the event loop; **sync** tasks may consume **threadpool** capacity.
- **Celery/RQ/cloud queues** provide **durability**, **retries**, and **horizontal** worker scaling.
- **Observability** (logs, metrics, traces) must explicitly include **background** paths.

### Best Practices

- Pass **ids** and **immutable** snapshots into tasks; open new **DB sessions** inside workers.
- Use **timeouts**, **retry budgets**, and **idempotency keys** for external calls.
- Replace in-memory **status** dicts with **Redis/DB** for multi-worker deployments.
- Protect **scheduled** HTTP endpoints and **cron** leaders in clustered setups.
- Reuse **HTTP clients** and **connection pools** via **`lifespan`**.

### Common Mistakes

- Assuming **HTTP 200** means background work succeeded.
- Running **long** CPU tasks via `BackgroundTasks` on API workers.
- Closing **ORM sessions** before tasks that still need database access.
- Using **lambda** tasks when future **migration** to Celery/RQ is likely.
- **No alerts** on growing **queue depth** or rising **task failure** rates.
