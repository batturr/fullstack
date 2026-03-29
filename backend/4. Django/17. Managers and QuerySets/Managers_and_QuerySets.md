# Django Managers and QuerySets — Reference Notes (Django 6.0.3)

**Managers** are the entry point to the database for a model (`Model.objects`). **QuerySets** represent lazy SQL compositions: filtering, slicing, and annotation chain until evaluation. Django **6.0.3** (Python **3.12–3.14**) continues the `QuerySet` / `Manager` split with `from_queryset`, custom managers, and rich aggregation APIs. These notes follow a TypeScript-style reference: TOC, exhaustive subtopics, and four example levels per major concept.

---

## 📑 Table of Contents

1. [17.1 Custom Managers](#171-custom-managers)
2. [17.2 QuerySet Methods](#172-queryset-methods)
3. [17.3 QuerySet Optimization](#173-queryset-optimization)
4. [17.4 Chaining Queries](#174-chaining-queries)
5. [17.5 Aggregation](#175-aggregation)
6. [17.6 Bulk Operations](#176-bulk-operations)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 17.1 Custom Managers

### 17.1.1 Creating Custom Managers

**Concept:** Subclass `models.Manager` and assign to `objects` or a named attribute on the model.

#### 🟢 Beginner Example (simple, foundational)

```python
from django.db import models

class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status="published")

class Article(models.Model):
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, default="draft")
    objects = models.Manager()
    published = PublishedManager()
```

#### 🟡 Intermediate Example (practical patterns)

```python
class TenantManager(models.Manager):
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class Invoice(models.Model):
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE)
    objects = TenantManager()
```

#### 🔴 Expert Example (advanced usage)

```python
class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

class SoftDeleteAllManager(models.Manager):
    def get_queryset(self):
        return models.QuerySet(self.model, using=self._db).filter()

class Account(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True)
    objects = SoftDeleteManager()
    all_objects = SoftDeleteAllManager()
```

#### 🌍 Real-Time Example (production / SaaS)

Multi-tenant CRM: default manager scopes `tenant_id`; admin or support uses `all_objects` with audited views.

### 17.1.2 Manager Methods

**Concept:** Add chain-starting methods that return QuerySets.

#### 🟢 Beginner Example

```python
class ProductManager(models.Manager):
    def in_stock(self):
        return self.get_queryset().filter(stock__gt=0)
```

#### 🟡 Intermediate Example

```python
class OrderManager(models.Manager):
    def open_orders(self):
        return self.get_queryset().exclude(status__in=["shipped", "canceled"])

    def for_user(self, user):
        return self.get_queryset().filter(customer=user)
```

#### 🔴 Expert Example

```python
class SubscriptionManager(models.Manager):
    def due_for_renewal(self, as_of):
        return (
            self.get_queryset()
            .filter(status="active", current_period_end__lte=as_of)
            .select_related("customer", "plan")
        )
```

#### 🌍 Real-Time Example

E-commerce nightly job: `Order.objects.ready_to_ship()` encapsulates complex status + warehouse rules.

### 17.1.3 QuerySet as Manager

**Concept:** `Manager.from_queryset(CustomQuerySet)()` merges custom QuerySet methods onto the manager.

#### 🟢 Beginner Example

```python
class ProductQuerySet(models.QuerySet):
    def cheap(self):
        return self.filter(price__lt=10)

ProductManager = models.Manager.from_queryset(ProductQuerySet)

class Product(models.Model):
    price = models.DecimalField(max_digits=10, decimal_places=2)
    objects = ProductManager()
```

#### 🟡 Intermediate Example

```python
class PostQuerySet(models.QuerySet):
    def with_comment_count(self):
        return self.annotate(comment_count=models.Count("comments"))

PostManager = models.Manager.from_queryset(PostQuerySet)

class Post(models.Model):
    objects = PostManager()
```

#### 🔴 Expert Example

```python
class InvoiceQuerySet(models.QuerySet):
    def overdue(self):
        return self.filter(due_date__lt=models.functions.Now(), paid=False)

class InvoiceManager(models.Manager.from_queryset(InvoiceQuerySet)):
    def create_draft(self, customer):
        return self.model(customer=customer, status="draft")

class Invoice(models.Model):
    objects = InvoiceManager()
```

#### 🌍 Real-Time Example

SaaS billing: shared `InvoiceQuerySet` methods reused in reports and API serializers.

### 17.1.4 Manager Inheritance

**Concept:** Managers propagate; use `Meta.base_manager_name` / `default_manager_name` when needed.

#### 🟢 Beginner Example

```python
class BaseActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

class Base(models.Model):
    is_active = models.BooleanField(default=True)
    objects = BaseActiveManager()

class Derived(Base):
    class Meta:
        proxy = True
```

#### 🟡 Intermediate Example

```python
class Derived(Base):
    class Meta:
        base_manager_name = "all_objects"
        default_manager_name = "objects"

    all_objects = models.Manager()
```

#### 🔴 Expert Example

Abstract base with tenant-scoped manager; concrete models add specialized managers alongside `_base_manager`.

#### 🌍 Real-Time Example

Social: `VisiblePostManager` on abstract `PostBase`; `ModeratorPostManager` on proxy for staff tools.

### 17.1.5 Multiple Managers

**Concept:** Several manager instances on one model for different default querysets.

#### 🟢 Beginner Example

```python
class Book(models.Model):
    objects = models.Manager()
    published = PublishedManager()
```

#### 🟡 Intermediate Example

```python
class User(models.Model):
    objects = ActiveUserManager()
    with_inactive = models.Manager()
```

#### 🔴 Expert Example

```python
class SKU(models.Model):
    objects = AvailableSKUManager()
    including_discontinued = AllSKUManager()
```

#### 🌍 Real-Time Example

E-commerce catalog API uses `objects`; merchandising admin uses `including_discontinued` for audits.

---

## 17.2 QuerySet Methods

### 17.2.1 all() / none()

**Concept:** `all()` returns all rows (lazy); `none()` returns empty queryset with same interface.

#### 🟢 Beginner Example

```python
Product.objects.all()
Product.objects.none()
```

#### 🟡 Intermediate Example

```python
def visible_products(user):
    if user.is_anonymous:
        return Product.objects.none()
    return Product.objects.filter(is_public=True)
```

#### 🔴 Expert Example

```python
qs = Model.objects.all()
if not feature_enabled:
    qs = Model.objects.none()
return qs.filter(...)
```

#### 🌍 Real-Time Example

SaaS: deactivated tenant returns `none()` from manager for defense in depth.

### 17.2.2 filter() / exclude()

**Concept:** `WHERE` clauses; chained as AND; `Q` objects for OR/NOT.

#### 🟢 Beginner Example

```python
Order.objects.filter(status="paid")
Order.objects.exclude(status="canceled")
```

#### 🟡 Intermediate Example

```python
from django.db.models import Q

Product.objects.filter(Q(price__lt=20) | Q(featured=True))
```

#### 🔴 Expert Example

```python
Product.objects.filter(
    models.Exists(
        LineItem.objects.filter(product_id=models.OuterRef("pk"), order__placed_at__gte=month_start)
    )
)
```

#### 🌍 Real-Time Example

E-commerce: complex availability filter combining inventory M2M and warehouse cutoffs.

### 17.2.3 get() / first() / last()

**Concept:** `get()` expects exactly one row; `first()`/`last()` need ordering for stability.

#### 🟢 Beginner Example

```python
User.objects.get(username="alice")
User.objects.filter(is_staff=True).first()
```

#### 🟡 Intermediate Example

```python
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist

try:
    profile = Profile.objects.get(user=user)
except (ObjectDoesNotExist, MultipleObjectsReturned):
    profile = None
```

#### 🔴 Expert Example

```python
Subscription.objects.filter(customer=c, status="active").order_by("-started_at").first()
```

#### 🌍 Real-Time Example

SaaS: `get` with `select_for_update` inside transaction for single active subscription row.

### 17.2.4 exists() / count() / aggregate()

**Concept:** `exists()` is efficient existence check; `count()` SQL COUNT; `aggregate()` returns dict of reductions.

#### 🟢 Beginner Example

```python
if Order.objects.filter(customer=user).exists():
    ...
count = Product.objects.count()
```

#### 🟡 Intermediate Example

```python
from django.db.models import Sum

Order.objects.filter(status="paid").aggregate(total=Sum("total"))
```

#### 🔴 Expert Example

```python
stats = Order.objects.aggregate(
    paid_sum=Sum("total", filter=models.Q(status="paid")),
    open_count=models.Count("id", filter=models.Q(status="open")),
)
```

#### 🌍 Real-Time Example

Social: dashboard aggregates with `filter=` argument (conditional aggregation).

### 17.2.5 only() / defer()

**Concept:** Limit columns fetched; trade memory vs extra queries if deferred fields accessed.

#### 🟢 Beginner Example

```python
User.objects.only("id", "username")
User.objects.defer("bio")
```

#### 🟡 Intermediate Example

```python
for u in User.objects.only("email").iterator():
    send_digest(u.email)
```

#### 🔴 Expert Example

```python
list(Product.objects.defer("description_html", "search_vector"))
```

#### 🌍 Real-Time Example

E-commerce listing page: `only("title", "price", "slug")` for thousands of rows.

---

## 17.3 QuerySet Optimization

### 17.3.1 select_related()

**Concept:** SQL JOIN for **forward** ForeignKey and OneToOne — single query.

#### 🟢 Beginner Example

```python
Order.objects.select_related("customer")
```

#### 🟡 Intermediate Example

```python
Article.objects.select_related("author", "author__profile")
```

#### 🔴 Expert Example

```python
qs = Invoice.objects.select_related("customer", "customer__billing_address")
```

#### 🌍 Real-Time Example

SaaS invoice PDF generation: one query for invoice + customer + address.

### 17.3.2 prefetch_related()

**Concept:** Separate queries + Python join for reverse FK, M2M, generic relations.

#### 🟢 Beginner Example

```python
Post.objects.prefetch_related("comments")
```

#### 🟡 Intermediate Example

```python
Order.objects.prefetch_related("lines", "lines__product")
```

#### 🔴 Expert Example

```python
from django.db.models import Prefetch

active_lines = LineItem.objects.filter(canceled=False)
Order.objects.prefetch_related(Prefetch("lines", queryset=active_lines, to_attr="active_lines"))
```

#### 🌍 Real-Time Example

E-commerce order API: prefetch lines and product SKUs; `Prefetch` avoids loading canceled lines.

### 17.3.3 Reducing Database Queries

**Concept:** Combine `select_related`, `prefetch_related`, annotations, and `iterator()`.

#### 🟢 Beginner Example

```python
for o in Order.objects.select_related("customer"):
    print(o.customer.email)
```

#### 🟡 Intermediate Example

```python
list(Order.objects.annotate(line_count=models.Count("lines")))
```

#### 🔴 Expert Example

```python
# Avoid per-row get in template
users = User.objects.prefetch_related(
    models.Prefetch(
        "groups",
        queryset=Group.objects.only("name"),
    )
)
```

#### 🌍 Real-Time Example

Social feed: 3-query pattern with prefetch vs N+1 for likes.

### 17.3.4 values() / values_list()

**Concept:** Return dicts/tuples instead of model instances — less overhead.

#### 🟢 Beginner Example

```python
User.objects.values("id", "email")
User.objects.values_list("id", flat=True)
```

#### 🟡 Intermediate Example

```python
Product.objects.values("category_id").annotate(c=models.Count("id"))
```

#### 🔴 Expert Example

```python
dict(User.objects.values_list("username", "id"))
```

#### 🌍 Real-Time Example

E-commerce export: `values_list` streaming CSV without model instantiation.

### 17.3.5 Chunked Queries

**Concept:** `iterator(chunk_size=...)` for large read-only scans; beware caching with `prefetch_related`.

#### 🟢 Beginner Example

```python
for row in HugeTable.objects.iterator(chunk_size=2000):
    process(row)
```

#### 🟡 Intermediate Example

```python
for batch in queryset_batches(Product.objects.all(), size=500):
    bulk_update(batch, ["index_version"])
```

#### 🔴 Expert Example

```python
# Custom batching with pk ordering for stable pagination
last_id = 0
while True:
    batch = list(Model.objects.filter(pk__gt=last_id).order_by("pk")[:1000])
    if not batch:
        break
    last_id = batch[-1].pk
    handle(batch)
```

#### 🌍 Real-Time Example

SaaS nightly reindex: iterator over millions of rows with server-side cursors on PostgreSQL.

---

## 17.4 Chaining Queries

### 17.4.1 QuerySet Chaining

**Concept:** Each filter/annotate returns new QuerySet; immutable-style API.

#### 🟢 Beginner Example

```python
qs = Product.objects.filter(is_active=True)
qs = qs.filter(price__lte=100)
```

#### 🟡 Intermediate Example

```python
def build_product_qs(request):
    qs = Product.objects.all()
    if request.GET.get("q"):
        qs = qs.filter(title__icontains=request.GET["q"])
    if request.GET.get("category"):
        qs = qs.filter(category_id=request.GET["category"])
    return qs
```

#### 🔴 Expert Example

```python
qs = base_qs
qs = qs.filter(models.Q(a=1) | models.Q(b=2))
qs = qs.exclude(archived=True)
qs = qs.distinct()
```

#### 🌍 Real-Time Example

E-commerce faceted search building dynamic `filter` chain from facet selections.

### 17.4.2 Lazy Evaluation

**Concept:** No SQL until evaluation (iteration, `list()`, `len()` in some cases, etc.).

#### 🟢 Beginner Example

```python
qs = Product.objects.filter(price__lt=5)  # no query yet
list(qs)  # executes
```

#### 🟡 Intermediate Example

```python
def get_queryset(self):
    return super().get_queryset().select_related("author")  # still lazy until template iterates
```

#### 🔴 Expert Example

```python
qs1 = Model.objects.all()
qs2 = qs1.filter(active=True)
# qs1 and qs2 are independent clones after filter
```

#### 🌍 Real-Time Example

DRF viewset: queryset built lazily; pagination triggers single limited query.

### 17.4.3 QuerySet Cloning

**Concept:** Methods return clone; underlying query object copied.

#### 🟢 Beginner Example

```python
base = Product.objects.filter(in_stock=True)
cheap = base.filter(price__lt=10)
expensive = base.filter(price__gte=100)
```

#### 🟡 Intermediate Example

```python
published = Article.objects.published()
recent = published.filter(published_at__gte=week_ago)
```

#### 🔴 Expert Example

```python
# Clone for count vs data
qs = complex_queryset()
total = qs.count()
page = list(qs[offset : offset + limit])
```

#### 🌍 Real-Time Example

SaaS reporting: reuse annotated base queryset for chart series and table export.

### 17.4.4 Query Reuse

**Concept:** Same QuerySet evaluated twice runs SQL twice unless cached.

#### 🟢 Beginner Example

```python
qs = Product.objects.all()
list(qs)
list(qs)  # hits DB again
```

#### 🟡 Intermediate Example

```python
qs = Product.objects.all()
data = list(qs)  # cache in Python list for reuse
```

#### 🔴 Expert Example

```python
qs = Model.objects.filter(...)
if qs.exists():
    return list(qs[:50])  # second query — acceptable pattern
```

#### 🌍 Real-Time Example

Avoid `bool(qs)` — use `exists()`; then fetch with slice.

### 17.4.5 Query Composition

**Concept:** Combine with `Q`, subqueries, `Union`, `RawSQL` where appropriate.

#### 🟢 Beginner Example

```python
from django.db.models import Q
Model.objects.filter(Q(a=1) & ~Q(b=2))
```

#### 🟡 Intermediate Example

```python
from django.db.models import OuterRef, Subquery

latest = Comment.objects.filter(post_id=OuterRef("pk")).order_by("-created_at")
Post.objects.annotate(latest_comment_id=Subquery(latest.values("pk")[:1]))
```

#### 🔴 Expert Example

```python
qs1 = ActiveUser.objects.values("id")
qs2 = PartnerUser.objects.values("id")
combined = qs1.union(qs2, all=True)
```

#### 🌍 Real-Time Example

Social: union of followers and mutuals for recommendation candidates.

---

## 17.5 Aggregation

### 17.5.1 Count

**Concept:** `Count()` annotation or `queryset.count()`.

#### 🟢 Beginner Example

```python
Order.objects.count()
```

#### 🟡 Intermediate Example

```python
from django.db.models import Count

Category.objects.annotate(product_count=Count("products"))
```

#### 🔴 Expert Example

```python
Post.objects.annotate(approved_comments=Count("comments", filter=models.Q(comments__approved=True)))
```

#### 🌍 Real-Time Example

E-commerce: category sidebar with distinct product counts respecting visibility rules.

### 17.5.2 Sum / Average

**Concept:** `Sum`, `Avg` from `django.db.models`.

#### 🟢 Beginner Example

```python
from django.db.models import Sum

Order.objects.aggregate(total=Sum("total"))
```

#### 🟡 Intermediate Example

```python
from django.db.models import Avg

Review.objects.aggregate(avg_stars=Avg("stars"))
```

#### 🔴 Expert Example

```python
from django.db.models import Sum, F

Order.objects.annotate(
    lines_sum=Sum(F("lines__quantity") * F("lines__unit_price")),
)
```

#### 🌍 Real-Time Example

SaaS MRR rollup: `Sum` with `filter` on plan interval.

### 17.5.3 Min / Max

**Concept:** `Min`, `Max` aggregates.

#### 🟢 Beginner Example

```python
from django.db.models import Max

Product.objects.aggregate(max_price=Max("price"))
```

#### 🟡 Intermediate Example

```python
from django.db.models import Min

Event.objects.aggregate(first_at=Min("starts_at"))
```

#### 🔴 Expert Example

```python
Customer.objects.annotate(last_order_at=Max("orders__placed_at"))
```

#### 🌍 Real-Time Example

E-commerce: “price range” facet per category using min/max subqueries.

### 17.5.4 Multiple Aggregates

**Concept:** Several keys in one `aggregate()` or multiple annotations.

#### 🟢 Beginner Example

```python
from django.db.models import Count, Sum

Order.objects.aggregate(c=Count("id"), revenue=Sum("total"))
```

#### 🟡 Intermediate Example

```python
Product.objects.values("category_id").annotate(
    cnt=Count("id"),
    revenue=Sum(models.F("price") * models.F("sold_units")),
)
```

#### 🔴 Expert Example

```python
from django.db.models import Count, Sum, Avg

qs.annotate(
    orders=Count("orders"),
    revenue=Sum("orders__total"),
    aov=models.ExpressionWrapper(
        models.F("revenue") / models.F("orders"),
        output_field=models.DecimalField(max_digits=12, decimal_places=2),
    ),
)
```

#### 🌍 Real-Time Example

SaaS executive dashboard: simultaneous user growth, churn count, expansion revenue.

### 17.5.5 Filtering Aggregates

**Concept:** `HAVING` via `filter()` after `annotate()`, or conditional aggregation.

#### 🟢 Beginner Example

```python
Author.objects.annotate(post_count=Count("posts")).filter(post_count__gte=5)
```

#### 🟡 Intermediate Example

```python
from django.db.models import Count, Q

Product.objects.annotate(
    sold=Count("lineitem", filter=Q(lineitem__order__status="paid")),
).filter(sold__gt=0)
```

#### 🔴 Expert Example

```python
from django.db.models import Sum

Region.objects.annotate(
    revenue=Sum("stores__orders__total", filter=Q(stores__orders__status="paid")),
).filter(revenue__gt=1_000_000)
```

#### 🌍 Real-Time Example

E-commerce vendor portal: only show vendors with >10 fulfilled orders in 30 days.

---

## 17.6 Bulk Operations

### 17.6.1 bulk_create()

**Concept:** Insert many rows in few queries; `ignore_conflicts`, `update_conflicts` (PostgreSQL) where supported.

#### 🟢 Beginner Example

```python
objs = [Tag(name=f"t{i}") for i in range(1000)]
Tag.objects.bulk_create(objs, batch_size=500)
```

#### 🟡 Intermediate Example

```python
LineItem.objects.bulk_create(lines, batch_size=1000)
```

#### 🔴 Expert Example

```python
Product.objects.bulk_create(
    products,
    update_conflicts=True,
    unique_fields=["sku"],
    update_fields=["price", "updated_at"],
)
```

#### 🌍 Real-Time Example

E-commerce catalog import: `bulk_create` with batches + conflict upsert on SKU.

### 17.6.2 bulk_update()

**Concept:** UPDATE per field in batches; no `save()` signals per row.

#### 🟢 Beginner Example

```python
for p in products:
    p.stock = new_stock[p.id]
Product.objects.bulk_update(products, ["stock"], batch_size=500)
```

#### 🟡 Intermediate Example

```python
User.objects.bulk_update(users, ["last_login"], batch_size=1000)
```

#### 🔴 Expert Example

```python
Invoice.objects.bulk_update(
    invoices,
    ["status", "paid_at", "ledger_entry_id"],
    batch_size=200,
)
```

#### 🌍 Real-Time Example

SaaS: nightly sync updates thousands of subscription renewal dates.

### 17.6.3 update() on QuerySet

**Concept:** Single SQL UPDATE; no model `save()` per instance.

#### 🟢 Beginner Example

```python
Product.objects.filter(category_id=5).update(on_sale=True)
```

#### 🟡 Intermediate Example

```python
from django.utils import timezone

Session.objects.filter(expire_date__lt=timezone.now()).delete()
```

#### 🔴 Expert Example

```python
Order.objects.filter(status="pending", placed_at__lt=cutoff).update(status="expired")
```

#### 🌍 Real-Time Example

E-commerce: expire stale carts with one query.

### 17.6.4 delete() on QuerySet

**Concept:** SQL DELETE (possibly CASCADE at DB level); may not call `Model.delete()` per row.

#### 🟢 Beginner Example

```python
CartItem.objects.filter(cart=cart).delete()
```

#### 🟡 Intermediate Example

```python
LogEntry.objects.filter(created_at__lt=retention_cutoff).delete()
```

#### 🔴 Expert Example

```python
# Fast purge with raw SQL in maintenance window for huge tables — operational pattern
```

#### 🌍 Real-Time Example

SaaS GDPR: bulk delete user-derived rows by `user_id` with chunked deletes to avoid long locks.

### 17.6.5 Batch Processing

**Concept:** Combine slicing, `iterator`, `bulk_update`, and transactions.

#### 🟢 Beginner Example

```python
ids = list(Model.objects.filter(stale=True).values_list("pk", flat=True)[:1000])
Model.objects.filter(pk__in=ids).update(stale=False)
```

#### 🟡 Intermediate Example

```python
from django.db import transaction

with transaction.atomic():
    batch = list(Model.objects.select_for_update(skip_locked=True)[:500])
    for obj in batch:
        obj.process()
    Model.objects.bulk_update(batch, ["state", "processed_at"])
```

#### 🔴 Expert Example

Worker loop: claim rows with `skip_locked`, process, `bulk_update`, commit.

#### 🌍 Real-Time Example

E-commerce fulfillment: workers claim order batches safely under concurrency.

---

## Best Practices

- Prefer `from_queryset` to share methods between manager and queryset.
- Use `exists()` instead of `count()` when you only need boolean presence.
- Default manager should enforce safe scoping (tenant, soft-delete); expose escape hatches explicitly.
- Profile with `django-debug-toolbar` or SQL logging for N+1 regressions.
- Use `select_related`/`prefetch_related` in list endpoints as a default discipline.
- For huge writes, batch `bulk_create`/`bulk_update` and tune `batch_size` per DB.
- Remember `bulk_*` and `update()` bypass `save()` and many signals — document or enqueue side effects manually.
- Use `iterator()` for exports; avoid it when you need queryset caching in same request.

---

## Common Mistakes to Avoid

- `select_related("m2m_field")` — invalid; use `prefetch_related`.
- Unstable `first()`/`last()` without `order_by`.
- Annotating then filtering wrong step — confusion between WHERE and HAVING.
- Assuming `delete()` calls model `delete()` methods or collects signals per instance.
- `bulk_create` expecting auto `pk` on all databases without `update_conflicts` / returning columns support nuances.
- Chaining heavy `prefetch_related` on giant M2Ms without custom `Prefetch` queryset.
- Re-evaluating huge QuerySets multiple times without caching or pagination.
- `len(qs)` on unfiltered table — full scan.

---

## Comparison Tables

| Method | SQL pattern | Model.save() | Signals |
|--------|-------------|--------------|---------|
| `save()` per instance | 1× INSERT/UPDATE each | Yes | Yes |
| `bulk_create` | batched INSERT | No | No |
| `bulk_update` | batched UPDATE | No | No |
| `QuerySet.update` | single UPDATE | No | No |
| `QuerySet.delete` | DELETE | Often no per-row | Sometimes |

| Optimization | Use when |
|--------------|----------|
| `select_related` | Forward FK/O2O single-valued path |
| `prefetch_related` | Reverse FK, M2M, multiple multi-valued paths |
| `only`/`defer` | Known hot columns, large blobs |
| `values` | Read-only projections / exports |

| API | Lazy until |
|-----|------------|
| `filter`/`exclude` | Always lazy |
| `get` | Immediate |
| `count` | Immediate SQL |
| `exists` | Immediate SQL (efficient) |
| slicing `[:1]` | Evaluated when consumed |

---

*Reference notes for **Django 6.0.3** ORM managers and querysets. Validate database-specific features (e.g., `update_conflicts`) against your engine version.*
