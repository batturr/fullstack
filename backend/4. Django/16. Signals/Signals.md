# Django Signals — Reference Notes (Django 6.0.3)

**Signals** decouple framework and application events from reactions: senders emit signals, receivers subscribe via the **dispatcher**. Django ships model lifecycle signals (`pre_save`, `post_save`, etc.), request signals, and lets you define **custom signals** for domain events. For **Django 6.0.3** on **Python 3.12–3.14**, signals remain synchronous by default; use them for small, fast side effects or enqueue async work. This document follows a TypeScript-reference style: TOC, deep subsections, and four example tiers per major idea.

---

## 📑 Table of Contents

1. [16.1 Signal Basics](#161-signal-basics)
2. [16.2 Built-in Model Signals](#162-built-in-model-signals)
3. [16.3 Receiving Signals](#163-receiving-signals)
4. [16.4 Custom Signals](#164-custom-signals)
5. [16.5 Signal Patterns](#165-signal-patterns)
6. [16.6 Advanced Signal Topics](#166-advanced-signal-topics)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 16.1 Signal Basics

### 16.1.1 Concept

**Concept:** A signal is a named event. Receivers are callables registered to run when the signal fires. The coupling is loose: the sender does not import receivers.

#### 🟢 Beginner Example (simple, foundational)

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def on_user_saved(sender, instance, created, **kwargs):
    if created:
        print(f"New user: {instance.username}")
```

#### 🟡 Intermediate Example (practical patterns)

```python
# apps/accounts/signals.py — imported from AppConfig.ready()
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile

@receiver(post_save, sender=Profile)
def sync_profile_to_search(sender, instance, **kwargs):
    from .tasks import index_profile
    index_profile.delay(instance.pk)
```

#### 🔴 Expert Example (advanced usage)

```python
from django.dispatch import Signal

order_placed = Signal()

def send_order_placed(order):
    order_placed.send(sender=type(order), order=order)
```

#### 🌍 Real-Time Example (production / e-commerce)

Order service emits `order_placed` after commit; fulfillment and email subsystems subscribe without importing each other (bounded coupling).

### 16.1.2 Dispatcher

**Concept:** `django.dispatch.dispatcher.Signal` stores receivers and invokes them when `send` / `send_robust` is called.

#### 🟢 Beginner Example

```python
from django.db.models.signals import pre_save
pre_save.send(sender=MyModel, instance=my_instance)
```

#### 🟡 Intermediate Example

```python
from django.core.signals import request_finished

def cleanup(sender, **kwargs):
    pass

request_finished.connect(cleanup)
```

#### 🔴 Expert Example

```python
from django.dispatch import receiver, Signal

payment_captured = Signal()

# Multiple receivers, order not guaranteed unless documented
@receiver(payment_captured)
def a(sender, **kwargs):
    pass

@receiver(payment_captured)
def b(sender, **kwargs):
    pass
```

#### 🌍 Real-Time Example (SaaS)

Central dispatcher module documents receiver order and SLAs; slow receivers moved to `transaction.on_commit` + task queue.

### 16.1.3 Receivers

**Concept:** Any callable `def recv(sender, **kwargs)` registered with `.connect()` or `@receiver`.

#### 🟢 Beginner Example

```python
def log_save(sender, instance, **kwargs):
    print("saved", instance.pk)

post_save.connect(log_save, sender=Product)
```

#### 🟡 Intermediate Example

```python
from django.apps import AppConfig

class ShopConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "shop"

    def ready(self):
        from . import signals  # noqa: F401
```

#### 🔴 Expert Example

```python
post_save.connect(
    my_handler,
    sender=Order,
    dispatch_uid="shop.order.post_save.my_handler",
)
```

#### 🌍 Real-Time Example

Receivers live in `signals.py` per app; `ready()` imports them once to avoid duplicate registration in runserver reloader.

### 16.1.4 Sending Signals

**Concept:** `Signal.send(sender, **kwargs)` returns list of `(receiver, response)` pairs; `send_robust` catches receiver exceptions.

#### 🟢 Beginner Example

```python
from django.dispatch import Signal

notify = Signal()

notify.send(sender=None, user_id=1, message="hello")
```

#### 🟡 Intermediate Example

```python
results = notify.send(sender=BillingService, invoice_id=42)
for receiver, response in results:
    if response is False:
        log.warning("receiver declined", extra={"receiver": receiver})
```

#### 🔴 Expert Example

```python
responses = notify.send_robust(sender=BillingService, invoice_id=42)
for receiver, response in responses:
    if isinstance(response, Exception):
        capture_exception(response, receiver=receiver.__name__)
```

#### 🌍 Real-Time Example

Payment webhook handler uses `send_robust` so one failing analytics receiver does not block ledger updates (with monitoring on exceptions).

### 16.1.5 Parameters

**Concept:** Built-in model signals pass documented kwargs (`instance`, `created`, `raw`, `using`, `update_fields`, etc.). Custom signals should document their kwargs contract.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Post)
def on_post(sender, instance, created, update_fields, **kwargs):
    if created:
        ...
```

#### 🟡 Intermediate Example

```python
@receiver(pre_save, sender=Product)
def normalize_sku(sender, instance, **kwargs):
    instance.sku = instance.sku.strip().upper()
```

#### 🔴 Expert Example

```python
@receiver(post_save, sender=Order)
def on_order(sender, instance, created, update_fields, **kwargs):
    if not created and update_fields is not None and "status" not in update_fields:
        return
    ...
```

#### 🌍 Real-Time Example

E-commerce: `update_fields` check avoids re-indexing catalog when only `last_viewed_at` changes.

---

## 16.2 Built-in Model Signals

### 16.2.1 pre_save

**Concept:** Fires before `Model.save()`; mutate `instance` here for normalization (still runs validators).

#### 🟢 Beginner Example

```python
@receiver(pre_save, sender=Article)
def slugify_title(sender, instance, **kwargs):
    if not instance.slug:
        instance.slug = slugify(instance.title)
```

#### 🟡 Intermediate Example

```python
@receiver(pre_save, sender=LineItem)
def set_line_total(sender, instance, **kwargs):
    instance.line_total = instance.quantity * instance.unit_price
```

#### 🔴 Expert Example

```python
@receiver(pre_save, sender=Subscription)
def freeze_plan_snapshot(sender, instance, **kwargs):
    if instance._state.adding:
        instance.plan_snapshot = instance.plan.export_snapshot()
```

#### 🌍 Real-Time Example

SaaS: capture immutable plan JSON at subscription creation for billing disputes.

### 16.2.2 post_save

**Concept:** After save; `created` is True on insert. Common for notifications and denormalized counters.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Comment)
def bump_comment_count(sender, instance, created, **kwargs):
    if created:
        Post.objects.filter(pk=instance.post_id).update(
            comment_count=F("comment_count") + 1
        )
```

#### 🟡 Intermediate Example

```python
from django.db import transaction

@receiver(post_save, sender=Order)
def enqueue_fulfillment(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(lambda: fulfill_order.delay(instance.pk))
```

#### 🔴 Expert Example

```python
@receiver(post_save, sender=User)
def ensure_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
```

#### 🌍 Real-Time Example

Social: on new follow `post_save`, enqueue fan-out job inside `on_commit`.

### 16.2.3 pre_delete

**Concept:** Before deletion; access related rows that may be cascade-deleted afterward.

#### 🟢 Beginner Example

```python
@receiver(pre_delete, sender=Media)
def unlink_storage(sender, instance, **kwargs):
    instance.file.delete(save=False)
```

#### 🟡 Intermediate Example

```python
@receiver(pre_delete, sender=Organization)
def warn_active_subscriptions(sender, instance, **kwargs):
    if instance.subscription_set.filter(active=True).exists():
        logger.warning("Deleting org with active subs", extra={"org": instance.pk})
```

#### 🔴 Expert Example

```python
@receiver(pre_delete, sender=Product)
def archive_skus(sender, instance, **kwargs):
    ArchivedSKU.objects.create(sku=instance.sku, product_id=instance.pk)
```

#### 🌍 Real-Time Example

E-commerce: archive SKU history before hard delete for compliance.

### 16.2.4 post_delete

**Concept:** After instance removed from DB; good for cache invalidation and search index removal.

#### 🟢 Beginner Example

```python
@receiver(post_delete, sender=Post)
def remove_from_index(sender, instance, **kwargs):
    search_client.delete_document("post", instance.pk)
```

#### 🟡 Intermediate Example

```python
@receiver(post_delete, sender=LineItem)
def decrement_parent_total(sender, instance, **kwargs):
    Order.objects.filter(pk=instance.order_id).update(
        total=F("total") - instance.line_total
    )
```

#### 🔴 Expert Example

Use idempotent deletes: index client may 404 — treat as success.

#### 🌍 Real-Time Example

CDN purge after `Media` post_delete.

### 16.2.5 m2m_changed

**Concept:** Sent when `ManyToManyField` changes: `action` in `pre_add`, `post_add`, `pre_remove`, `post_remove`, `pre_clear`, `post_clear`; `pk_set` holds related PKs.

#### 🟢 Beginner Example

```python
@receiver(m2m_changed, sender=User.groups.through)
def log_group_change(sender, instance, action, pk_set, **kwargs):
    if action == "post_add":
        logger.info("user %s added to groups %s", instance.pk, pk_set)
```

#### 🟡 Intermediate Example

```python
@receiver(m2m_changed, sender=Project.members.through)
def invalidate_member_cache(sender, instance, action, **kwargs):
    if action in ("post_add", "post_remove", "post_clear"):
        cache.delete(f"project:{instance.pk}:members")
```

#### 🔴 Expert Example

```python
@receiver(m2m_changed, sender=Role.permissions.through)
def sync_permission_cache(sender, instance, action, pk_set, **kwargs):
    if action == "pre_clear":
        ...
```

#### 🌍 Real-Time Example

SaaS RBAC: refresh materialized permission view after permission M2M changes.

---

## 16.3 Receiving Signals

### 16.3.1 @receiver Decorator

**Concept:** Registers function as receiver; args: signal(s), optional `sender`, `weak`, `dispatch_uid`.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Article)
def notify_subscribers(sender, instance, created, **kwargs):
    ...
```

#### 🟡 Intermediate Example

```python
from django.db.models.signals import post_save, pre_save

@receiver([pre_save, post_save], sender=Product)
def audit_product(sender, instance, **kwargs):
    ...
```

#### 🔴 Expert Example

```python
@receiver(post_save, sender=Order, dispatch_uid="orders.audit", weak=False)
def strong_ref_handler(sender, instance, **kwargs):
    ...
```

#### 🌍 Real-Time Example

Multiple apps listen to `User` post_save; each uses unique `dispatch_uid` to prevent double registration on reload.

### 16.3.2 Signal Handlers

**Concept:** Keep handlers small; delegate to services or tasks.

#### 🟢 Beginner Example

```python
def handle_user_created(sender, instance, created, **kwargs):
    if created:
        send_welcome_email(instance.email)
```

#### 🟡 Intermediate Example

```python
def handle_user_created(sender, instance, created, **kwargs):
    if not created:
        return
    from .services import OnboardingService
    OnboardingService.start(instance)
```

#### 🔴 Expert Example

```python
def handle_invoice_paid(sender, invoice, **kwargs):
    with transaction.atomic():
        LedgerEntry.create_from_invoice(invoice)
```

#### 🌍 Real-Time Example

E-commerce: handler validates invariants then calls idempotent payment reconciliation service.

### 16.3.3 Weak References

**Concept:** By default receivers are weak references; ephemeral callables may be garbage-collected — use `weak=False` or module-level functions.

#### 🟢 Beginner Example

Module-level function — safe with default weak refs.

#### 🟡 Intermediate Example

```python
class Notifier:
    def on_save(self, sender, instance, **kwargs):
        pass

n = Notifier()
# BAD: bound method may disappear
post_save.connect(n.on_save, sender=Post)
```

#### 🔴 Expert Example

```python
post_save.connect(n.on_save, sender=Post, weak=False)
```

#### 🌍 Real-Time Example

Avoid registering lambdas or local functions as receivers in `ready()`.

### 16.3.4 Dispatch UID

**Concept:** Unique id prevents duplicate registration when the same receiver is connected twice.

#### 🟢 Beginner Example

```python
post_save.connect(handler, sender=Order, dispatch_uid="orders.handler")
```

#### 🟡 Intermediate Example

```python
@receiver(post_save, sender=Order, dispatch_uid="fulfillment.on_order_saved")
def on_order_saved(...):
    ...
```

#### 🔴 Expert Example

Include app label and version in uid when replacing handler behavior behind feature flags.

#### 🌍 Real-Time Example

Blue/green deploy: two code paths must not double-connect without distinct uids per path.

### 16.3.5 Handler Order

**Concept:** Order is **not** guaranteed across receivers unless you control registration order; prefer explicit orchestration for ordering-sensitive workflows.

#### 🟢 Beginner Example

Single receiver per signal for simple apps.

#### 🟡 Intermediate Example

One facade receiver calls ordered internal functions.

#### 🔴 Expert Example

```python
def ordered_post_save(sender, instance, created, **kwargs):
    step_validate(instance)
    step_denormalize(instance)
    step_notify(instance)
```

#### 🌍 Real-Time Example

Billing: use a workflow service instead of five unordered signal handlers mutating the same row.

---

## 16.4 Custom Signals

### 16.4.1 Defining Custom Signals

**Concept:** `Signal()` at module scope; document kwargs.

#### 🟢 Beginner Example

```python
from django.dispatch import Signal

user_logged_in = Signal()
```

#### 🟡 Intermediate Example

```python
invoice_finalized = Signal()  # kwargs: invoice: Invoice
```

#### 🔴 Expert Example

```python
class DomainSignals:
    subscription_renewed = Signal()
    subscription_canceled = Signal()
```

#### 🌍 Real-Time Example

SaaS `billing/signals.py` centralizes financial domain events.

### 16.4.2 Sending Custom Signals

**Concept:** `signal.send(sender, **kwargs)` from services after business rules succeed.

#### 🟢 Beginner Example

```python
user_logged_in.send(sender=request.user.__class__, user=request.user, request=request)
```

#### 🟡 Intermediate Example

```python
from django.db import transaction

def finalize_invoice(invoice):
    invoice.status = "finalized"
    invoice.save()
    transaction.on_commit(
        lambda: invoice_finalized.send(sender=Invoice, invoice=invoice)
    )
```

#### 🔴 Expert Example

```python
invoice_finalized.send_robust(sender=Invoice, invoice=invoice)
```

#### 🌍 Real-Time Example

After DB commit, notify analytics; failures isolated via `send_robust` + error metrics.

### 16.4.3 Signal Payload

**Concept:** Pass IDs for large objects if receivers might run later in tasks; pass ORM instances for same-request handlers.

#### 🟢 Beginner Example

```python
post_published.send(sender=Post, post_id=post.pk)
```

#### 🟡 Intermediate Example

```python
order_shipped.send(sender=Order, order=order, tracking_number=tracking)
```

#### 🔴 Expert Example

```python
# Serializable payload for Celery
order_shipped.send(sender=Order, order_id=order.pk, tracking_number=tracking)
```

#### 🌍 Real-Time Example

E-commerce: Celery task loads `Order` by id to avoid stale pickled instances.

### 16.4.4 Documentation

**Concept:** Document sender type, kwargs, sync vs post-commit, idempotency expectations.

#### 🟢 Beginner Example

Docstring on signal: "Kwargs: user: User, request: HttpRequest".

#### 🟡 Intermediate Example

`ARCHITECTURE.md` section "Domain signals" with sequence diagrams.

#### 🔴 Expert Example

OpenAPI-style table: signal name, producers, consumers, failure modes.

#### 🌍 Real-Time Example

On-call runbook: which signals trigger external webhooks.

### 16.4.5 Best Practices (custom)

**Concept:** Prefer few well-named signals over many overlapping ones.

#### 🟢 Beginner Example

One `order_created` instead of separate signals per integration.

#### 🟡 Intermediate Example

Version payloads when evolving: `v=2` kwarg for consumers.

#### 🔴 Expert Example

Feature-flag new receivers; dark launch with metrics.

#### 🌍 Real-Time Example

SaaS: deprecate signal by logging producers still calling it.

---

## 16.5 Signal Patterns

### 16.5.1 Cache Invalidation

**Concept:** On model change, delete or bump cache keys.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Product)
def bust_product_cache(sender, instance, **kwargs):
    cache.delete(f"product:{instance.pk}")
```

#### 🟡 Intermediate Example

```python
@receiver(post_delete, sender=Product)
def bust_product_cache_delete(sender, instance, **kwargs):
    cache.delete(f"product:{instance.pk}")
    cache.delete("product:list:homepage")
```

#### 🔴 Expert Example

```python
@receiver(post_save, sender=Category)
def bust_category_tree(sender, instance, **kwargs):
    cache.delete_pattern("nav:tree:*")  # redis backend feature
```

#### 🌍 Real-Time Example

E-commerce homepage category tree cache version bump on any category edit.

### 16.5.2 Log Operations

**Concept:** Structured logging for audit trails in `pre_save`/`post_save` comparing state.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Order)
def log_order_save(sender, instance, created, **kwargs):
    logger.info("order_saved", extra={"order_id": instance.pk, "created": created})
```

#### 🟡 Intermediate Example

```python
@receiver(pre_save, sender=Order)
def capture_old_status(sender, instance, **kwargs):
    if instance.pk:
        instance._old_status = (
            type(instance).objects.filter(pk=instance.pk).values_list("status", flat=True).first()
        )
```

#### 🔴 Expert Example

Emit audit event to append-only store with actor from middleware `thread_local`.

#### 🌍 Real-Time Example

SaaS admin changes: log before/after JSON for compliance.

### 16.5.3 Send Notifications

**Concept:** Email/push/Slack from `transaction.on_commit`.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Order)
def email_confirmation(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(lambda: send_mail(...))
```

#### 🟡 Intermediate Example

```python
@receiver(post_save, sender=Comment)
def notify_mentions(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(lambda: notify_mentioned_users.delay(instance.pk))
```

#### 🔴 Expert Example

Template rendering + provider abstraction; retries in task layer.

#### 🌍 Real-Time Example

Social: push notification only after post row committed.

### 16.5.4 Data Denormalization

**Concept:** Maintain counters, search vectors, rollups.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Review)
def update_product_rating(sender, instance, **kwargs):
    Product.objects.filter(pk=instance.product_id).update(
        review_count=Review.objects.filter(product_id=instance.product_id).count()
    )
```

#### 🟡 Intermediate Example

Use `aggregate(Avg("stars"))` in periodic task; signal triggers mark `needs_recompute`.

#### 🔴 Expert Example

```python
@receiver(post_save, sender=Review)
def mark_stale(sender, instance, **kwargs):
    cache.set(f"product:{instance.product_id}:rating_stale", True, timeout=None)
```

#### 🌍 Real-Time Example

E-commerce: heavy aggregates via nightly job; signals set dirty flags.

### 16.5.5 Audit Trail

**Concept:** Immutable `AuditLog` rows on critical models.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Payment)
def audit_payment(sender, instance, created, **kwargs):
    AuditLog.objects.create(
        model="Payment",
        object_id=str(instance.pk),
        action="create" if created else "update",
    )
```

#### 🟡 Intermediate Example

Store JSON snapshot from `model_to_dict`.

#### 🔴 Expert Example

Stream to warehouse (Kafka) instead of DB row for volume.

#### 🌍 Real-Time Example

PCI scope: audit payment objects without storing PAN.

---

## 16.6 Advanced Signal Topics

### 16.6.1 Conditional Handling

**Concept:** Early return on `raw=True`, `update_fields`, environment flags.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Product)
def skip_loaddata(sender, instance, raw, **kwargs):
    if raw:
        return
    ...
```

#### 🟡 Intermediate Example

```python
if not settings.ENABLE_SIGNALS:
    return
```

#### 🔴 Expert Example

```python
if kwargs.get("update_fields") and "price" not in kwargs["update_fields"]:
    return
```

#### 🌍 Real-Time Example

E-commerce: skip search indexing during bulk price import.

### 16.6.2 Signal Ordering

**Concept:** Django does not promise cross-receiver order; consolidate or use explicit pipeline.

#### 🟢 Beginner Example

One receiver per signal per concern.

#### 🟡 Intermediate Example

Chain inside Celery workflow instead of signals.

#### 🔴 Expert Example

```python
SIGNAL_PIPELINE = [step_a, step_b, step_c]

@receiver(post_save, sender=Order)
def run_pipeline(sender, instance, created, **kwargs):
    for step in SIGNAL_PIPELINE:
        step(instance, created=created)
```

#### 🌍 Real-Time Example

SaaS billing: ordered steps in single service method called from one receiver.

### 16.6.3 Signal Errors

**Concept:** Uncaught exceptions in receivers break `save()`; `send_robust` swallows per receiver.

#### 🟢 Beginner Example

```python
@receiver(post_save, sender=Item)
def safe_handler(sender, instance, **kwargs):
    try:
        risky()
    except Exception:
        logger.exception("signal failure")
```

#### 🟡 Intermediate Example

Use Sentry `capture_exception`.

#### 🔴 Expert Example

Circuit breaker around external API calls in receiver.

#### 🌍 Real-Time Example

Never let third-party webhook sender exceptions roll back core DB transaction unintentionally — use `on_commit` + task.

### 16.6.4 Signal Performance

**Concept:** Signals run in request/transaction path — keep O(1) or defer.

#### 🟢 Beginner Example

Avoid queries in tight loops; pass `update_fields` awareness.

#### 🟡 Intermediate Example

```python
transaction.on_commit(lambda: heavy_task.delay(pk))
```

#### 🔴 Expert Example

Batch invalidation: collect IDs in thread-local, flush in `request_finished`.

#### 🌍 Real-Time Example

Social feed: no per-like signal doing 50 queries; aggregate events.

### 16.6.5 Testing Signals

**Concept:** Use `captureOnCommitCallbacks` for `on_commit`; disconnect or mute signals in tests.

#### 🟢 Beginner Example

```python
from django.test import TestCase

class SignalTests(TestCase):
    def test_profile_created(self):
        u = User.objects.create_user("a", "a@a.com", "x")
        self.assertTrue(Profile.objects.filter(user=u).exists())
```

#### 🟡 Intermediate Example

```python
from django.db import transaction

with self.captureOnCommitCallbacks(execute=True):
    Order.objects.create(...)
```

#### 🔴 Expert Example

```python
from django.db.models.signals import post_save

post_save.disconnect(receiver, sender=Order)
try:
    ...
finally:
    post_save.connect(receiver, sender=Order, dispatch_uid="...")
```

#### 🌍 Real-Time Example

Integration test asserts task enqueued when using `on_commit` + Celery eager mode.

---

## Best Practices

- Import signals in `AppConfig.ready()` only; avoid side effects at import time elsewhere.
- Use `dispatch_uid` for every `connect()` to survive autoreload and duplicate imports.
- Prefer `transaction.on_commit` for anything that must see committed data or trigger external IO.
- Respect `raw` during fixtures and migrations.
- Keep receivers idempotent where possible (retries, duplicate events).
- Document custom signals like a public API; version breaking changes.
- Monitor `send_robust` exceptions in production.
- For high-volume paths, replace signals with explicit service calls for clarity.

---

## Common Mistakes to Avoid

- Doing slow IO synchronously in `pre_save`/`post_save` → timeouts and lock contention.
- Forgetting `on_commit` → tasks read uncommitted or rolled-back rows.
- Duplicate handlers after code reload without `dispatch_uid`.
- Assuming receiver execution order across different modules.
- Using signals for core business rules that should live in domain services (hard to test and trace).
- Ignoring `m2m_changed` nuances (`pk_set` empty on `pre_clear`).
- Connecting lambdas or methods without `weak=False` → silent drops.
- Swallowing all exceptions silently — at least log or metric.

---

## Comparison Tables

| API | Exceptions in receivers | Typical use |
|-----|-------------------------|-------------|
| `send` | Propagate (can break caller) | In-process strict pipelines |
| `send_robust` | Captured per receiver | Integrations, analytics |

| Signal | When |
|--------|------|
| `pre_save` | Normalize, compute derived fields |
| `post_save` | Side effects after persist |
| `pre_delete` | Capture related state, guard delete |
| `post_delete` | External cleanup, indexes |
| `m2m_changed` | M2M add/remove/clear |

| Alternative to signals | When to prefer |
|------------------------|----------------|
| Explicit service method | Ordering, testability, clarity |
| Celery chain | Heavy async workflows |
| DB constraints / triggers | Invariants at storage layer |

| Testing approach | Pros |
|----------------|------|
| End-to-end via model API | Realistic |
| `disconnect` | Isolation |
| `captureOnCommitCallbacks` | Test `on_commit` |

---

*Notes aligned with **Django 6.0.3** signal APIs. Confirm keyword arguments against current docs for your Python and database backend.*
