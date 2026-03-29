# Celery and Async Tasks

Background work keeps HTTP requests fast: sending email, resizing images, recomputing aggregates, syncing inventory, and draining webhooks. **Celery** is the de facto distributed task queue for Django. With Django **6.0.3** and Python **3.12+**, you will still run Celery workers as separate processes talking to a **message broker** (Redis or RabbitMQ) and optionally a **result backend**. This reference uses the same four-tier example pattern and ties scenarios to **e-commerce**, **social**, and **SaaS** systems.

---

## 📑 Table of Contents

1. [25.1 Celery Basics](#251-celery-basics)
2. [25.2 Celery Tasks](#252-celery-tasks)
3. [25.3 Task Execution](#253-task-execution)
4. [25.4 Celery Workers](#254-celery-workers)
5. [25.5 Scheduled Tasks](#255-scheduled-tasks)
6. [25.6 Error Handling](#256-error-handling)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 25.1 Celery Basics

### 25.1.1 Task Queue Concept

A **producer** (Django view, signal, management command) enqueues **messages**. **Workers** dequeue and execute Python callables. The broker persists messages until acknowledged.

**🟢 Beginner Example — mental model**

```text
HTTP request → enqueue "send_welcome_email(user_id=7)" → return 201
Worker        → receives message → runs function → ack
```

**🟡 Intermediate Example — at-least-once delivery**

```python
# Tasks may run more than once if worker crashes after execution but before ack.
# Design tasks to be idempotent where possible.
```

**🔴 Expert Example — visibility timeout (SQS-style) vs Redis ack**

```python
# Understand your broker semantics; Redis lists vs streams differ from RabbitMQ acks.
```

**🌍 Real-Time Example — e-commerce order placed**

```python
# View: create Order row, enqueue charge + inventory hold + confirmation email
```

### 25.1.2 Message Broker Selection

**🟢 Beginner Example — Redis for small teams**

```text
BROKER_URL = redis://localhost:6379/0
```

**🟡 Intermediate Example — RabbitMQ for complex routing**

```text
BROKER_URL = amqp://guest:guest@rabbit:5672//
```

**🔴 Expert Example — quorum queues / federation for multi-region**

```python
# Ops concern: mirror queues, HA policies, monitoring with Prometheus plugin
```

**🌍 Real-Time Example — SaaS EU data residency**

```python
# Broker cluster in EU; workers in EU VPC; no cross-border task spillage
```

### 25.1.3 Installation

**🟢 Beginner Example**

```bash
pip install "celery[redis]" redis
```

**🟡 Intermediate Example — pin versions**

```text
celery==5.4.*
redis==5.*
```

**🔴 Expert Example — optional lz4/msgpack serialization**

```python
# For large payloads, prefer object storage + pass URL in task kwargs
```

**🌍 Real-Time Example — Docker Compose dev stack**

```yaml
services:
  redis:
    image: redis:7
  worker:
    build: .
    command: celery -A proj worker -l INFO
```

### 25.1.4 Project Configuration

**🟢 Beginner Example — `proj/celery.py`**

```python
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "proj.settings")

app = Celery("proj")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
```

**🟡 Intermediate Example — `proj/__init__.py`**

```python
from .celery import app as celery_app

__all__ = ("celery_app",)
```

**🔴 Expert Example — settings**

```python
CELERY_BROKER_URL = "redis://redis:6379/0"
CELERY_RESULT_BACKEND = "redis://redis:6379/1"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 60
CELERY_TASK_SOFT_TIME_LIMIT = 45
```

**🌍 Real-Time Example — SaaS multi-tenant queues**

```python
CELERY_TASK_ROUTES = {
    "billing.tasks.*": {"queue": "billing"},
    "exports.tasks.*": {"queue": "exports"},
}
```

### 25.1.5 Task Definition (overview)

(See 25.2 for decorators; here, placement.)

**🟢 Beginner Example — `app/tasks.py`**

```python
from celery import shared_task

@shared_task
def add(x, y):
    return x + y
```

**🟡 Intermediate Example — discover per Django app**

```python
# tasks.py inside each installed app; autodiscover_tasks finds them
```

**🔴 Expert Example — avoid circular imports**

```python
# Import models inside task body if needed to prevent import cycles at startup
```

**🌍 Real-Time Example — social fan-out notifications**

```python
@shared_task
def notify_followers(post_id):
    ...
```

---

## 25.2 Celery Tasks

### 25.2.1 `@shared_task` Decorator

**🟢 Beginner Example**

```python
from celery import shared_task

@shared_task
def ping():
    return "pong"
```

**🟡 Intermediate Example — bind=True for self (task instance)**

```python
@shared_task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
```

**🔴 Expert Example — base class customization**

```python
class BaseTask(Task):
    autoretry_for = (Exception,)
    retry_backoff = True

@shared_task(base=BaseTask)
def flaky_io():
    ...
```

**🌍 Real-Time Example — e-commerce capture payment**

```python
@shared_task(bind=True, max_retries=5)
def capture_payment(self, payment_intent_id):
    try:
        gateway.capture(payment_intent_id)
    except GatewayTimeout as exc:
        raise self.retry(exc=exc, countdown=30)
```

### 25.2.2 Defining Tasks

**🟢 Beginner Example — pure function**

```python
@shared_task
def uppercase_name(user_id: int):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    u = User.objects.get(pk=user_id)
    u.first_name = u.first_name.upper()
    u.save(update_fields=["first_name"])
```

**🟡 Intermediate Example — pass IDs not ORM instances**

```python
# GOOD: user_id
# BAD: user object (not JSON serializable with default JSON serializer)
```

**🔴 Expert Example — typed payload dataclass validated at enqueue time**

```python
from dataclasses import dataclass

@dataclass
class EmailJob:
    user_id: int
    template: str

@shared_task
def send_templated_email(payload: dict):
    job = EmailJob(**payload)
    ...
```

**🌍 Real-Time Example — SaaS CSV export**

```python
@shared_task
def export_invoices(org_id: int, start: str, end: str):
    ...
```

### 25.2.3 Task Parameters

**🟢 Beginner Example — positional args**

```python
add.delay(2, 3)
```

**🟡 Intermediate Example — kwargs**

```python
send_email.delay(to="a@b.com", subject="Hi")
```

**🔴 Expert Example — immutable arguments + ETA**

```python
notify_user.apply_async(kwargs={"user_id": 5}, countdown=60, expires=3600)
```

**🌍 Real-Time Example — social scheduled post**

```python
publish_post.apply_async(args=[post_id], eta=scheduled_at)
```

### 25.2.4 Task Return Values

**🟢 Beginner Example — JSON-serializable return stored in result backend**

```python
@shared_task
def total_for_user(user_id: int) -> int:
    return Order.objects.filter(user_id=user_id).count()
```

**🟡 Intermediate Example — ignore result**

```python
@shared_task(ignore_result=True)
def fire_and_forget():
    ...
```

**🔴 Expert Example — large results via storage**

```python
@shared_task
def build_report(org_id: int) -> str:
    path = write_to_s3(...)
    return path  # store S3 URL, not megabytes of CSV in Redis
```

**🌍 Real-Time Example — e-commerce nightly sales rollup**

```python
@shared_task
def rollup_sales(day: str) -> dict:
    return {"day": day, "rows": 12345}
```

### 25.2.5 Task Results

**🟢 Beginner Example — AsyncResult**

```python
from celery.result import AsyncResult

res = AsyncResult(task_id)
print(res.state)
print(res.get(timeout=10))
```

**🟡 Intermediate Example — chord / group (workflow)**

```python
from celery import chord, group

workflow = chord(group(task.s(i) for i in range(3)), finalize.s())
workflow.apply_async()
```

**🔴 Expert Example — custom result backend**

```python
# Enterprise: Redis cluster with TLS; disable result backend if unused
```

**🌍 Real-Time Example — SaaS onboarding checklist**

```python
# Group: provision DB schema, send emails, seed demo data — callback marks org ready
```

---

## 25.3 Task Execution

### 25.3.1 `delay()`

**🟢 Beginner Example**

```python
from myapp.tasks import send_welcome

send_welcome.delay(user_id=1)
```

**🟡 Intermediate Example — equivalent**

```python
send_welcome.apply_async(args=[], kwargs={"user_id": 1})
```

**🔴 Expert Example — queue routing shortcut**

```python
send_welcome.apply_async(kwargs={"user_id": 1}, queue="email")
```

**🌍 Real-Time Example — e-commerce order confirmation**

```python
send_order_confirmation.delay(order_id=order.id)
```

### 25.3.2 `apply_async()`

**🟢 Beginner Example**

```python
task.apply_async()
```

**🟡 Intermediate Example — priority (broker-dependent)**

```python
task.apply_async(priority=6)
```

**🔴 Expert Example — headers for tracing**

```python
task.apply_async(
    kwargs={"order_id": 9},
    headers={"traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"},
)
```

**🌍 Real-Time Example — SaaS webhook fan-out**

```python
deliver_webhook.apply_async(kwargs={"event_id": e.id}, queue="webhooks_high")
```

### 25.3.3 Synchronous Execution (testing / admin)

**🟢 Beginner Example**

```python
send_welcome(user_id=1)  # when using @shared_task, call .run or invoke function if plain
```

**🟡 Intermediate Example — `task.apply()`**

```python
result = send_welcome.apply(kwargs={"user_id": 1})
print(result.result)
```

**🔴 Expert Example — `CELERY_TASK_ALWAYS_EAGER` in tests**

```python
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
```

**🌍 Real-Time Example — debugging production logic in shell**

```python
# Beware side effects; use staging snapshot DB
```

### 25.3.4 Task Routing

**🟢 Beginner Example — `queue` argument**

```python
heavy_job.apply_async(queue="heavy")
```

**🟡 Intermediate Example — `CELERY_TASK_ROUTES`**

```python
CELERY_TASK_ROUTES = {"myapp.tasks.video_*": {"queue": "video"}}
```

**🔴 Expert Example — RabbitMQ exchange + routing key**

```python
CELERY_TASK_ROUTES = {
    "myapp.tasks.billing.*": {
        "exchange": "billing",
        "exchange_type": "topic",
        "routing_key": "billing.#",
    }
}
```

**🌍 Real-Time Example — social moderation: separate GPU workers**

```python
moderate_image.apply_async(args=[media_id], queue="gpu")
```

### 25.3.5 Task Priority

**🟢 Beginner Example — Redis priority steps (0-9)**

```python
urgent_alert.apply_async(priority=9)
```

**🟡 Intermediate Example — separate queues vs priority**

```python
# Often clearer: queue "critical" with dedicated workers
```

**🔴 Expert Example — starvation avoidance**

```python
# Ensure low-priority tasks eventually run; monitor queue depth
```

**🌍 Real-Time Example — e-commerce fraud check before fulfillment**

```python
fraud_screen.apply_async(kwargs={"order_id": oid}, priority=8)
```

---

## 25.4 Celery Workers

### 25.4.1 Worker Management

**🟢 Beginner Example**

```bash
celery -A proj worker -l INFO
```

**🟡 Intermediate Example — concurrency**

```bash
celery -A proj worker -l INFO --concurrency=4
```

**🔴 Expert Example — autoscale**

```bash
celery -A proj worker -l INFO --autoscale=10,2
```

**🌍 Real-Time Example — Kubernetes HPA on queue depth metric**

```yaml
# Scale deployment when redis queue length > 1000
```

### 25.4.2 Multiple Workers

**🟢 Beginner Example — two terminals**

```bash
celery -A proj worker -Q default -n default@%h
celery -A proj worker -Q email -n email@%h
```

**🟡 Intermediate Example — systemd units**

```ini
[Service]
ExecStart=/venv/bin/celery -A proj worker -Q email -c 2
```

**🔴 Expert Example — separate clusters per compliance zone**

**🌍 Real-Time Example — SaaS: isolation between free-tier noisy neighbors**

```python
# Dedicated queue + worker pool for enterprise tenants
```

### 25.4.3 Worker Concurrency

**🟢 Beginner Example — prefork pool (default)**

**🟡 Intermediate Example — gevent/eventlet for I/O bound (care with Django ORM)**

**🔴 Expert Example — solo pool for debugging**

```bash
celery -A proj worker --pool=solo
```

**🌍 Real-Time Example — social oEmbed fetch tasks**

```python
# Many concurrent HTTP calls; consider dedicated async service if ORM not touched
```

### 25.4.4 Worker Logging

**🟢 Beginner Example**

```bash
celery -A proj worker -l INFO
```

**🟡 Intermediate Example — structured JSON logging**

```python
LOGGING = {
    "version": 1,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {"celery": {"handlers": ["console"], "level": "INFO"}},
}
```

**🔴 Expert Example — correlation id from task headers**

```python
@setup_logging.connect
def configure_celery_logging(**kwargs):
    ...
```

**🌍 Real-Time Example — e-commerce reconcile job**

```python
logger.info("reconcile_done", extra={"order_id": order_id, "trace_id": trace_id})
```

### 25.4.5 Worker Signals

**🟢 Beginner Example — `task_prerun` / `task_postrun`**

```python
from celery.signals import task_prerun

@task_prerun.connect
def set_request_context(sender=None, task_id=None, task=None, args=None, kwargs=None, **extra):
    ...
```

**🟡 Intermediate Example — metrics**

```python
from celery.signals import task_failure

@task_failure.connect
def count_failures(sender=None, exception=None, **kwargs):
    TASK_FAILURES.inc()
```

**🔴 Expert Example — Django database connection handling**

```python
from django.db import connections

@task_postrun.connect
def close_db_conn(**kwargs):
    for conn in connections.all():
        conn.close_if_unusable_or_obsolete()
```

**🌍 Real-Time Example — SaaS per-task org context**

```python
@task_prerun.connect
def bind_org(sender=None, kwargs=None, **extra):
    org_id = kwargs.get("org_id")
    set_current_org(org_id)
```

---

## 25.5 Scheduled Tasks

### 25.5.1 Celery Beat

**🟢 Beginner Example**

```bash
celery -A proj beat -l INFO
```

**🟡 Intermediate Example — `CELERY_BEAT_SCHEDULE`**

```python
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    "purge-old-sessions-daily": {
        "task": "myapp.tasks.purge_sessions",
        "schedule": crontab(hour=3, minute=0),
    },
}
```

**🔴 Expert Example — dynamic schedules from database (`django-celery-beat`)**

```python
INSTALLED_APPS += ["django_celery_beat"]
```

**🌍 Real-Time Example — e-commerce expire cart holds**

```python
{"task": "shop.tasks.release_expired_holds", "schedule": crontab(minute="*/5")}
```

### 25.5.2 Periodic Tasks

**🟢 Beginner Example — every 30 seconds**

```python
from celery.schedules import schedule

CELERY_BEAT_SCHEDULE = {
    "metrics-push": {
        "task": "ops.tasks.push_metrics",
        "schedule": schedule(run_every=30.0),
    },
}
```

**🟡 Intermediate Example — timezone-aware crontab**

```python
CELERY_TIMEZONE = "UTC"
```

**🔴 Expert Example — jitter to avoid thundering herd**

```python
# Randomize start within window at application level or use redbeat/scheduling libs
```

**🌍 Real-Time Example — SaaS usage metering flush**

```python
{"task": "billing.tasks.flush_usage_buffers", "schedule": crontab(minute="*")}
```

### 25.5.3 Cron Expressions

**🟢 Beginner Example**

```python
crontab(minute=0, hour="*/6")  # every 6 hours on the hour
```

**🟡 Intermediate Example — weekdays 9am**

```python
crontab(hour=9, minute=0, day_of_week="1-5")
```

**🔴 Expert Example — last day of month nuances**

```python
# Prefer explicit calendar logic in task if crontab too limited
```

**🌍 Real-Time Example — social weekly digest email**

```python
crontab(hour=8, minute=0, day_of_week="1")  # Monday 08:00
```

### 25.5.4 Task Scheduling

**🟢 Beginner Example — ETA**

```python
task.apply_async(eta=some_datetime)
```

**🟡 Intermediate Example — countdown**

```python
task.apply_async(countdown=300)
```

**🔴 Expert Example — revoke/cancel**

```python
from celery.result import AsyncResult
AsyncResult(task_id).revoke(terminate=True)
```

**🌍 Real-Time Example — e-commerce abandoned cart email**

```python
remind_cart.apply_async(args=[cart_id], countdown=3600)
```

### 25.5.5 Schedule Persistence

**🟢 Beginner Example — beat schedule file (older style)**

**🟡 Intermediate Example — Redis scheduler / django-celery-beat DB**

```python
# Survives beat restarts; important for HA
```

**🔴 Expert Example — leader election for single active beat**

**🌍 Real-Time Example — SaaS tenant-specific schedules**

```python
# Store next_run_at per tenant; enqueue dynamic ETA tasks instead of millions of crontabs
```

---

## 25.6 Error Handling

### 25.6.1 Task Retry

**🟢 Beginner Example**

```python
@shared_task(bind=True, autoretry_for=(RequestException,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def fetch_url(self, url):
    return requests.get(url, timeout=5).text
```

**🟡 Intermediate Example — manual retry**

```python
@shared_task(bind=True)
def charge(self, order_id):
    try:
        gateway.charge(order_id)
    except TransientError as exc:
        raise self.retry(exc=exc, countdown=60)
```

**🔴 Expert Example — distinguish non-retryable**

```python
except CardDeclined:
    mark_failed(order_id)
    return
```

**🌍 Real-Time Example — e-commerce inventory sync with vendor API**

```python
# Exponential backoff + circuit breaker in Redis
```

### 25.6.2 Error Callbacks

**🟢 Beginner Example — `link_error`**

```python
task.apply_async(link_error=alert_ops.s())
```

**🟡 Intermediate Example — chord error propagation**

**🔴 Expert Example — dead letter queue pattern**

```python
@shared_task(queue="dlq")
def dead_letter(payload):
    persist_for_manual_review(payload)
```

**🌍 Real-Time Example — SaaS webhook delivery failures**

```python
# After N retries, move to DLQ; UI for replay
```

### 25.6.3 Error Logging

**🟢 Beginner Example**

```python
import logging
logger = logging.getLogger(__name__)

@shared_task
def job():
    try:
        ...
    except Exception:
        logger.exception("job failed")
        raise
```

**🟡 Intermediate Example — Sentry SDK captures Celery**

```python
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration

sentry_sdk.init(integrations=[CeleryIntegration()])
```

**🔴 Expert Example — scrub PII from logs**

**🌍 Real-Time Example — social content moderation audit trail**

```python
logger.info("moderation_result", extra={"content_id": cid, "action": action})
```

### 25.6.4 Task Timeout

**🟢 Beginner Example — global limits**

```python
CELERY_TASK_TIME_LIMIT = 120
CELERY_TASK_SOFT_TIME_LIMIT = 90
```

**🟡 Intermediate Example — per-task**

```python
@shared_task(time_limit=30, soft_time_limit=25)
def quick_task():
    ...
```

**🔴 Expert Example — chunk long jobs**

```python
# Process 1000 rows per subtask instead of one 2-hour task
```

**🌍 Real-Time Example — SaaS data migration**

```python
migrate_tenant_chunk.apply_async(kwargs={"tenant_id": t, "cursor": c})
```

### 25.6.5 Exception Handling

**🟢 Beginner Example — catch expected domain errors**

```python
@shared_task
def deactivate_user(user_id):
    try:
        u = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return
    u.is_active = False
    u.save(update_fields=["is_active"])
```

**🟡 Intermediate Example — transactional outbox**

```python
from django.db import transaction

with transaction.atomic():
    Outbox.objects.create(payload={...})
    # separate process publishes to broker
```

**🔴 Expert Example — idempotency keys**

```python
@shared_task
def apply_credit(idempotency_key: str, ...):
    if Credit.objects.filter(key=idempotency_key).exists():
        return
    ...
```

**🌍 Real-Time Example — e-commerce payment webhook**

```python
# Never double-ship: lock row or use unique constraint on event_id
```

---

## Best Practices

- Pass **stable identifiers** (IDs) to tasks; re-fetch models inside the worker.
- Make tasks **idempotent**; expect **at-least-once** execution.
- Use **timeouts**, **retries with backoff**, and **non-retryable** error paths.
- Choose **queues** to isolate latency-sensitive, heavy, or noisy workloads.
- Store **large artifacts** in object storage; pass **URLs** in task args.
- Run **beat** as a **single leader** or use **django-celery-beat** for HA schedules.
- **Close DB connections** appropriately; avoid long-lived transactions in tasks.
- **Instrument** tasks (success/fail duration histograms) and alert on **DLQ depth**.

---

## Common Mistakes to Avoid

- Passing **ORM instances** or **file handles** in task kwargs.
- Using **infinite retries** on non-transient errors.
- **CPU-heavy** tasks on gevent workers with blocking Django ORM.
- **Same queue** for sub-100ms tasks and multi-minute video transcoding.
- Forgetting **timezone** awareness for `eta` / crontab.
- **Swallowing exceptions** without logging/metrics.
- Running **beat and workers** without monitoring **broker memory**.
- **Double spending** money because webhook task is not idempotent.

---

## Comparison Tables

| Broker | Strength | Watch out |
|--------|----------|-----------|
| Redis | Simple, fast | Persistence settings |
| RabbitMQ | Routing, HA | Ops complexity |
| SQS | Managed | Latency, semantics |

| Pool | Good for | Bad for |
|------|----------|---------|
| prefork | Mixed CPU/ORM | Very high fan-out I/O alone |
| gevent/eventlet | I/O bound | Blocking C extensions |
| solo | Debugging | Production throughput |

| Scheduling | Mechanism |
|------------|-----------|
| Periodic | Celery beat + crontab |
| One-shot delayed | `countdown` / `eta` |
| Per-row dynamic | Enqueue on model save |

| Pattern | Purpose |
|---------|---------|
| Chord | fan-out + aggregate |
| Chain | sequential pipeline |
| Group | parallel independent |

---

*Celery with Django **6.0.3** — align worker count with DB connection limits (`CONN_MAX_AGE`, pgbouncer) to avoid exhausting Postgres.*
