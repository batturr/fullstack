# Flask 3.1.3 — Logging and Debugging

Observability turns silent failures into actionable signals. This guide covers Python’s **logging** module in Flask apps, **request/error** logging, **debug mode** and the **debugger**, **handlers/formatters**, **performance** investigation, and **production** patterns (remote debug, error trackers, monitoring, aggregation) for e-commerce, social platforms, and SaaS APIs on Flask 3.1.3 (Python 3.9+).

---

## 📑 Table of Contents

1. [21.1 Logging Setup](#211-logging-setup)
2. [21.2 Flask Logging](#212-flask-logging)
3. [21.3 Debugging](#213-debugging)
4. [21.4 Logging Configuration](#214-logging-configuration)
5. [21.5 Performance Debugging](#215-performance-debugging)
6. [21.6 Advanced Debugging](#216-advanced-debugging)
7. [Best Practices](#best-practices-summary)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 21.1 Logging Setup

### 21.1.1 Python Logging Module

**`logging.getLogger(__name__)`** hierarchical loggers; **propagate** to root.

#### 🟢 Beginner Example

```python
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

log.info("starting")
```

#### 🟡 Intermediate Example

```python
log = logging.getLogger("shop.catalog")
log.debug("sku=%s price=%s", sku, price)
```

#### 🔴 Expert Example

```python
class ContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = getattr(g, "request_id", "-")  # noqa: F821
        return True

log.addFilter(ContextFilter())
```

#### 🌍 Real-Time Example (E-Commerce Order Service)

```python
log.info("order_created order_id=%s amount_cents=%s", oid, amt)
```

### 21.1.2 Logger Configuration

**`dictConfig`** or **`fileConfig`** at startup.

#### 🟢 Beginner Example

```python
logging.basicConfig(
    format="%(levelname)s %(name)s %(message)s",
    level=logging.INFO,
)
```

#### 🟡 Intermediate Example

```python
from logging.config import dictConfig

dictConfig({
    "version": 1,
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "std"},
    },
    "formatters": {
        "std": {"format": "%(asctime)s %(levelname)s %(name)s %(message)s"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
})
```

#### 🔴 Expert Example

```python
# YAML-loaded config for 12-factor parity across envs
```

#### 🌍 Real-Time Example (SaaS)

```python
# Separate loggers: security, audit, app
```

### 21.1.3 Log Levels

**DEBUG < INFO < WARNING < ERROR < CRITICAL**; filter per handler.

#### 🟢 Beginner Example

```python
log.debug("verbose")
log.info("user_login")
log.warning("deprecated_endpoint_used")
log.error("payment_failed")
log.critical("db_unreachable")
```

#### 🟡 Intermediate Example

```python
if log.isEnabledFor(logging.DEBUG):
    log.debug("heavy_debug_payload %s", expensive_repr())
```

#### 🔴 Expert Example

```python
# Dynamic level per tenant for support escalations
```

#### 🌍 Real-Time Example (Social Feed)

```python
log.info("timeline_build user=%s ms=%s", uid, elapsed_ms)
```

### 21.1.4 Log Handlers

**StreamHandler**, **FileHandler**, **SMTPHandler**, **SysLogHandler**, **QueueHandler**.

#### 🟢 Beginner Example

```python
h = logging.FileHandler("app.log")
log.addHandler(h)
```

#### 🟡 Intermediate Example

```python
from logging.handlers import RotatingFileHandler

h = RotatingFileHandler("app.log", maxBytes=10_000_000, backupCount=5)
```

#### 🔴 Expert Example

```python
from logging.handlers import QueueHandler, QueueListener
import queue

q = queue.Queue(-1)
qh = QueueHandler(q)
listener = QueueListener(q, StreamHandler(), respect_handler_level=True)
listener.start()
```

#### 🌍 Real-Time Example (E-Commerce Peak)

```python
# Non-blocking queue to disk handler under burst traffic
```

### 21.1.5 Log Formatters

**`%(asctime)s`**, **`%(levelname)s`**, **`%(name)s`**, **`%(message)s`**, **`exc_info`**.

#### 🟢 Beginner Example

```python
formatter = logging.Formatter("%(levelname)s %(message)s")
handler.setFormatter(formatter)
```

#### 🟡 Intermediate Example

```python
formatter = logging.Formatter(
    "%(asctime)s %(levelname)s %(name)s [%(request_id)s] %(message)s"
)
```

#### 🔴 Expert Example

```python
import json

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)
```

#### 🌍 Real-Time Example (SaaS Centralized Logging)

```python
# Ship JSON to ELK/OpenSearch
```

---

## 21.2 Flask Logging

### 21.2.1 Flask Logger Access

**`app.logger`** is a standard **`Logger`**; configured by Flask.

#### 🟢 Beginner Example

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    app.logger.info("home_hit")
    return "ok"
```

#### 🟡 Intermediate Example

```python
app.logger.setLevel(logging.DEBUG)
```

#### 🔴 Expert Example

```python
# Replace default handlers in create_app for prod
```

#### 🌍 Real-Time Example (E-Commerce)

```python
app.logger.info("checkout_started cart_id=%s", cart_id)
```

### 21.2.2 Application Logging

Use **module loggers** for libraries; **`app.logger`** for request-scoped app.

#### 🟢 Beginner Example

```python
import logging
log = logging.getLogger("billing")

log.info("invoice_generated")
```

#### 🟡 Intermediate Example

```python
logging.getLogger("werkzeug").setLevel(logging.ERROR)  # quiet access logs in tests
```

#### 🔴 Expert Example

```python
# structlog processors + Flask context vars
```

#### 🌍 Real-Time Example (SaaS)

```python
audit_log.info("role_changed actor=%s target=%s", actor, target)
```

### 21.2.3 Request Logging

**`before_request`/`after_request`** timing and ids.

#### 🟢 Beginner Example

```python
import time
from flask import Flask, g, request

app = Flask(__name__)

@app.before_request
def t0():
    g._t0 = time.perf_counter()

@app.after_request
def log_time(resp):
    dt = (time.perf_counter() - g._t0) * 1000
    app.logger.info("%s %s %.2fms", request.method, request.path, dt)
    return resp
```

#### 🟡 Intermediate Example

```python
@app.before_request
def rid():
    g.request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex)
    return None
```

#### 🔴 Expert Example

```python
# OpenTelemetry span attributes mirror log fields
```

#### 🌍 Real-Time Example (Social API)

```python
app.logger.info(
    "api_request method=%s path=%s status=%s user=%s",
    request.method,
    request.path,
    response.status_code,
    getattr(g, "user_id", None),
)
```

### 21.2.4 Error Logging

**`logger.exception`** inside **`errorhandler`**.

#### 🟢 Beginner Example

```python
@app.errorhandler(500)
def five(e):
    app.logger.exception("server_error")
    return "error", 500
```

#### 🟡 Intermediate Example

```python
try:
    work()
except Exception:
    app.logger.exception("work_failed ctx=%s", ctx)
    raise
```

#### 🔴 Expert Example

```python
# Attach Sentry scope user/tenant before capture
```

#### 🌍 Real-Time Example (E-Commerce Payment)

```python
app.logger.exception("stripe_webhook_verify_failed")
```

### 21.2.5 Custom Logging

**Filters**, **contextvars** for async workers.

#### 🟢 Beginner Example

```python
class TenantFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.tenant = getattr(g, "tenant_id", "-")
        return True
```

#### 🟡 Intermediate Example

```python
app.logger.addFilter(TenantFilter())
```

#### 🔴 Expert Example

```python
import contextvars
request_id_var = contextvars.ContextVar("request_id", default="-")

def bind_request_id(rid: str):
    request_id_var.set(rid)
```

#### 🌍 Real-Time Example (SaaS Multi-Tenant)

```python
# Same worker thread serves many tenants — use contextvars in async stack
```

---

## 21.3 Debugging

### 21.3.1 Flask Debug Mode

**`app.run(debug=True)`** or **`FLASK_DEBUG=1`** — **never in production**.

#### 🟢 Beginner Example

```bash
export FLASK_DEBUG=1
flask --app app run
```

#### 🟡 Intermediate Example

```python
app.config["DEBUG"] = True
app.config["TESTING"] = False
```

#### 🔴 Expert Example

```python
# Separate debug profile docker-compose.override.yml
```

#### 🌍 Real-Time Example (E-Commerce Local)

```python
# DEBUG shows tracebacks in browser for HTML routes
```

### 21.3.2 Debugger Console

Werkzeug **interactive traceback** pin-protected console.

#### 🟢 Beginner Example

```text
Enable debugger in browser when exception occurs (development only).
```

#### 🟡 Intermediate Example

```python
app.config["DEBUG"] = True
# PIN displayed in terminal
```

#### 🔴 Expert Example

```python
# Disable evalex in shared dev if needed
```

#### 🌍 Real-Time Example

```python
# Never expose debugger to internet — VPN/bastion only
```

### 21.3.3 Breakpoints

**`breakpoint()`** (Python 3.7+) uses **`PYTHONBREAKPOINT`** env.

#### 🟢 Beginner Example

```python
def compute_total(lines):
    breakpoint()
    return sum(l.price for l in lines)
```

#### 🟡 Intermediate Example

```python
import pdb; pdb.set_trace()  # legacy explicit
```

#### 🔴 Expert Example

```python
# remote-pdb for container attach
```

#### 🌍 Real-Time Example (SaaS Staging)

```python
# Conditional breakpoint on failing tenant id
```

### 21.3.4 Variable Inspection

**Debugger `p` command**, **`pp`**, **`interact`**.

#### 🟢 Beginner Example

```python
print("DEBUG", user, cart)
```

#### 🟡 Intermediate Example

```python
app.logger.debug("cart=%r", cart)
```

#### 🔴 Expert Example

```python
# rich.inspect in IPython embed
```

#### 🌍 Real-Time Example (Social Ranking)

```python
# Log top-K scores only when DEBUG
```

### 21.3.5 Stack Traces

**`traceback.print_exc()`**, **`logger.exception`**.

#### 🟢 Beginner Example

```python
import traceback
try:
    ...
except Exception:
    traceback.print_exc()
```

#### 🟡 Intermediate Example

```python
log.error("failed", exc_info=True)
```

#### 🔴 Expert Example

```python
# Limit traceback depth for noise
```

#### 🌍 Real-Time Example (E-Commerce)

```python
# Include cause chain for payment gateway errors
```

---

## 21.4 Logging Configuration

### 21.4.1 File Handlers

**Permissions**, **logrotate** vs **RotatingFileHandler**.

#### 🟢 Beginner Example

```python
from logging.handlers import WatchedFileHandler

h = WatchedFileHandler("/var/log/app/app.log")
```

#### 🟡 Intermediate Example

```python
# logrotate copytruncate vs reopen signals (USR1)
```

#### 🔴 Expert Example

```python
# Separate files: access, app, audit
```

#### 🌍 Real-Time Example (SaaS Compliance)

```python
# Immutable audit log append-only volume
```

### 21.4.2 Rotating Logs

**Size** and **time** based rotation.

#### 🟢 Beginner Example

```python
RotatingFileHandler("app.log", maxBytes=1_000_000, backupCount=10)
```

#### 🟡 Intermediate Example

```python
from logging.handlers import TimedRotatingFileHandler

TimedRotatingFileHandler("app.log", when="midnight", backupCount=14)
```

#### 🔴 Expert Example

```python
# Compress rotated logs in post-rotate script
```

#### 🌍 Real-Time Example (E-Commerce Black Friday)

```python
# Higher maxBytes temporarily
```

### 21.4.3 Log Levels

**Per-logger** overrides: `logging.getLogger("urllib3").setLevel(logging.WARNING)`.

#### 🟢 Beginner Example

```python
logging.getLogger("werkzeug").setLevel(logging.INFO)
```

#### 🟡 Intermediate Example

```python
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)  # SQL echo-like
```

#### 🔴 Expert Example

```python
# Dynamic per-request ?debug=1 only for staff (dangerous — gate strongly)
```

#### 🌍 Real-Time Example (SaaS Support)

```python
# Temporary DEBUG for one logger via admin API + TTL
```

### 21.4.4 Formatters

Multiple handlers, multiple formatters.

#### 🟢 Beginner Example

```python
console = StreamHandler()
console.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
```

#### 🟡 Intermediate Example

```python
file_handler.setFormatter(JsonFormatter())
```

#### 🔴 Expert Example

```python
# Redact formatter wrapping base formatter for secrets
```

#### 🌍 Real-Time Example (Social DMs)

```python
# Strip message bodies in production logs
```

### 21.4.5 Multiple Handlers

**INFO** to stdout, **ERROR** to Sentry, **AUDIT** to SIEM.

#### 🟢 Beginner Example

```python
root = logging.getLogger()
root.addHandler(console_handler)
root.addHandler(file_handler)
```

#### 🟡 Intermediate Example

```python
audit = logging.getLogger("audit")
audit.propagate = False
audit.addHandler(audit_handler)
audit.setLevel(logging.INFO)
```

#### 🔴 Expert Example

```python
# Sampling handler: 1% debug logs in prod
```

#### 🌍 Real-Time Example (Enterprise SaaS)

```python
# Split PII-free telemetry vs full internal debug stream
```

---

## 21.5 Performance Debugging

### 21.5.1 Request Timing

**Middleware** timing + slow threshold alerts.

#### 🟢 Beginner Example

```python
@app.after_request
def time_resp(resp):
    app.logger.info("elapsed_ms=%s", getattr(g, "elapsed_ms", 0))
    return resp
```

#### 🟡 Intermediate Example

```python
SLOW_MS = 500
if g.elapsed_ms > SLOW_MS:
    app.logger.warning("slow_request path=%s ms=%s", request.path, g.elapsed_ms)
```

#### 🔴 Expert Example

```python
# Histogram metrics instead of per-request logs in hot paths
```

#### 🌍 Real-Time Example (E-Commerce PLP)

```python
log.warning("slow_plp_ms=%s filters=%s", ms, request.args)
```

### 21.5.2 Database Query Logging

**SQLAlchemy** echo or events.

#### 🟢 Beginner Example

```python
engine = create_engine(url, echo=True)
```

#### 🟡 Intermediate Example

```python
from sqlalchemy import event

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault("query_start_time", []).append(time.time())
```

#### 🔴 Expert Example

```python
# Capture query plans for >N ms only
```

#### 🌍 Real-Time Example (SaaS Reporting)

```python
log.info("report_query_ms=%s rows=%s", ms, n)
```

### 21.5.3 Slow Query Detection

**Threshold** + **EXPLAIN** in dev.

#### 🟢 Beginner Example

```python
if duration > 1.0:
    log.warning("slow_query %.3fs %s", duration, sql[:200])
```

#### 🟡 Intermediate Example

```python
# pg_stat_statements dashboards
```

#### 🔴 Expert Example

```python
# Auto-open issue when p95 exceeds SLO
```

#### 🌍 Real-Time Example (Social Graph)

```python
# N+1 detector middleware in dev
```

### 21.5.4 Memory Profiling

**tracemalloc**, **memory_profiler**, **objgraph**.

#### 🟢 Beginner Example

```python
import tracemalloc
tracemalloc.start()
# ... run request ...
current, peak = tracemalloc.get_traced_memory()
log.info("mem_kb current=%s peak=%s", current / 1024, peak / 1024)
```

#### 🟡 Intermediate Example

```python
@m.profile  # memory_profiler decorator
def heavy():
    ...
```

#### 🔴 Expert Example

```python
# py-spy flamegraph in prod-safe sampling mode
```

#### 🌍 Real-Time Example (E-Commerce CSV Export)

```python
log.warning("export_peak_rss_mb=%s", rss_mb)
```

### 21.5.5 Bottleneck Identification

**cProfile**, **snakeviz**, **line_profiler**.

#### 🟢 Beginner Example

```bash
python -m cProfile -s cumtime wsgi.py
```

#### 🟡 Intermediate Example

```python
from werkzeug.middleware.profiler import ProfilerMiddleware
app.wsgi_app = ProfilerMiddleware(app.wsgi_app, restrictions=[30])
```

#### 🔴 Expert Example

```python
# Continuous profiling (Parca/Phlare)
```

#### 🌍 Real-Time Example (SaaS API Latency)

```python
# Offload serialization to orjson/ujson after profiling
```

---

## 21.6 Advanced Debugging

### 21.6.1 Remote Debugging

**debugpy** / **pydevd** attach (staging only, secured).

#### 🟢 Beginner Example

```python
import debugpy
debugpy.listen(("0.0.0.0", 5678))
# debugpy.wait_for_client()  # optional
```

#### 🟡 Intermediate Example

```python
# Kubernetes port-forward 5678, VS Code attach config
```

#### 🔴 Expert Example

```python
# Auto-enable only when env REMOTE_DEBUG=1 and IP allowlist
```

#### 🌍 Real-Time Example (SaaS Staging)

```python
# Time-bounded debug session with audit log entry
```

### 21.6.2 Debugging Production

**No interactive debugger**; use **logs + traces + repro in staging**.

#### 🟢 Beginner Example

```python
@app.errorhandler(500)
def err(e):
    app.logger.exception("prod_500")
    return jsonify(code="internal", id=g.request_id), 500
```

#### 🟡 Intermediate Example

```python
# Feature flag canary with detailed logging slice
```

#### 🔴 Expert Example

```python
# Dynamic trace sampling via OpenTelemetry tail sampling
```

#### 🌍 Real-Time Example (E-Commerce)

```python
# Payment failures with correlation to gateway ids
```

### 21.6.3 Error Tracking Services

**Sentry**, **Rollbar**, **Honeybadger**.

#### 🟢 Beginner Example

```python
import sentry_sdk
sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], traces_sample_rate=0.1)
```

#### 🟡 Intermediate Example

```python
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(integrations=[FlaskIntegration()])
```

#### 🔴 Expert Example

```python
with sentry_sdk.push_scope() as scope:
    scope.set_tag("tenant", tenant_id)
    scope.user = {"id": user_id}
```

#### 🌍 Real-Time Example (Social)

```python
# Breadcrumbs for last API calls before crash
```

### 21.6.4 Application Monitoring

**Prometheus**, **Datadog**, **New Relic**, **Grafana**.

#### 🟢 Beginner Example

```python
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST

REQUESTS = Counter("http_requests_total", "HTTP requests", ["method", "endpoint", "status"])

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)
```

#### 🟡 Intermediate Example

```python
REQUESTS.labels(request.method, request.path, str(response.status_code)).inc()
```

#### 🔴 Expert Example

```python
# RED metrics + USE for saturation
```

#### 🌍 Real-Time Example (SaaS)

```python
# Per-tenant usage meters for billing + SLO dashboards
```

### 21.6.5 Log Aggregation

**Fluent Bit**, **Vector**, **ELK**, **Loki**.

#### 🟢 Beginner Example

```text
Container stdout JSON -> collector -> OpenSearch
```

#### 🟡 Intermediate Example

```python
# Kubernetes DaemonSet ships /var/log/pods/*/*.log
```

#### 🔴 Expert Example

```python
# Trace-to-log correlation via trace_id field
```

#### 🌍 Real-Time Example (E-Commerce Global)

```python
# Region-tagged indexes + retention tiers
```

---

## Best Practices (Summary)

- Use **structured logs** (JSON) in production for queryability.
- Include **request_id**, **user_id**, **tenant_id** where applicable.
- **Never** log secrets, full payment PAN, or raw passwords.
- Keep **DEBUG=False** in production; rely on observability stack.
- **Sample** high-volume debug telemetry to control cost.
- **Alert** on SLO burn (error rate, latency), not single log lines.

---

## Common Mistakes to Avoid

| Mistake | Outcome | Fix |
|---------|---------|-----|
| `print` debugging in prod | Noise, no structure | `logging` |
| Root logger misconfigured | Lost logs / duplicates | dictConfig once |
| Logging huge payloads | I/O bottlenecks | Truncate/summarize |
| Enabling Werkzeug debugger publicly | Critical RCE risk | Firewall + DEBUG off |
| No rotation | Disk full | Rotating/Timed handlers |

---

## Comparison Tables

| Tool | When |
|------|------|
| logging | Always |
| Sentry | Exception grouping |
| Prometheus | Metrics |
| OpenTelemetry | Traces + logs correlation |
| py-spy | Low-overhead sampling profile |

| Signal | Question it answers |
|--------|---------------------|
| Logs | What happened narrative |
| Metrics | How much / how often |
| Traces | Where time went |

---

*Flask 3.1.3 (February 2026), Python 3.9+. Werkzeug and Flask logging integration evolve—confirm handler behavior after upgrades.*
