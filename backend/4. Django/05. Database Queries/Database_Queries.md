# Database Queries (Django 6.0.3)

Django’s **`QuerySet`** API builds SQL lazily, executes against your configured database, and supports filtering, ordering, annotations, aggregations, and (when necessary) raw SQL. This reference maps query concepts to e-commerce, social, and SaaS patterns on **Python 3.12–3.14**.

---

## 📑 Table of Contents

1. [5.1 Query Basics](#51-query-basics)
2. [5.2 Retrieving Objects](#52-retrieving-objects)
3. [5.3 Filtering](#53-filtering)
4. [5.4 Ordering](#54-ordering)
5. [5.5 Complex Queries](#55-complex-queries)
6. [5.6 Aggregation](#56-aggregation)
7. [5.7 Grouping](#57-grouping)
8. [5.8 Raw SQL Queries](#58-raw-sql)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 5.1 Query Basics

### QuerySet Overview

A **`QuerySet`** represents a lazy database query. It is **chainable** and **immutable** in the sense that each filter returns a new `QuerySet`.

#### 🟢 Beginner Example

```python
qs = Product.objects.all()
print(qs)  # hits DB when evaluated (e.g., iteration or repr in shell)
```

#### 🟡 Intermediate Example — Chain filters

```python
qs = Product.objects.filter(is_active=True).exclude(price_cents=0).order_by("name")
```

#### 🔴 Expert Example — `QuerySet` is lazy until evaluation

```python
qs = Order.objects.filter(user=user)  # no SQL yet
list(qs[:10])  # LIMIT 10 query
```

#### 🌍 Real-Time Example — SaaS dashboard

```python
open_tickets = Ticket.objects.filter(workspace=ws, status__in=["open", "waiting"])
```

---

### Lazy Evaluation

No SQL until the queryset is **evaluated** (iteration, `list()`, `bool()`, slicing that hits DB, etc.).

#### 🟢 Beginner Example

```python
qs = Post.objects.all()
for p in qs:
    print(p.title)  # executes once; caches results
```

#### 🟡 Intermediate Example — Boolean evaluation

```python
if Product.objects.filter(sku=sku).exists():
    ...
```

#### 🔴 Expert Example — Multiple iterations reuse cache

```python
qs = Product.objects.all()
first_pass = list(qs)
second_pass = list(qs)  # uses cache; no second query for same qs
```

#### 🌍 Real-Time Example — E-commerce catalog page

```text
Build queryset with filters; paginator evaluates only current page slice.
```

---

### Query Execution

Evaluation triggers SQL generation for your backend (PostgreSQL, etc.).

#### 🟢 Beginner Example — `len()` vs `count()`

```python
Product.objects.count()  # SELECT COUNT(*)
len(list(Product.objects.all()))  # loads all rows — avoid on large tables
```

#### 🟡 Intermediate Example — `iterator()` for large scans

```python
for row in HugeLog.objects.all().iterator(chunk_size=2000):
    process(row)
```

#### 🔴 Expert Example — `explain()` (Django 4.2+ style)

```python
print(Order.objects.filter(user_id=1).explain(analyze=True))
```

#### 🌍 Real-Time Example — Social export job

```text
Use `iterator()` in Celery tasks streaming millions of events to S3.
```

---

### Caching

QuerySets cache results after first evaluation when reused; know when to avoid caching huge sets.

#### 🟢 Beginner Example

```python
qs = Product.objects.filter(is_active=True)
products = list(qs)  # evaluate and cache
```

#### 🟡 Intermediate Example — `prefetch_related` cache

```python
orders = list(Order.objects.prefetch_related("lines"))
for o in orders:
    list(o.lines.all())  # uses prefetch cache
```

#### 🔴 Expert Example — Turn off caching with `iterator()`

```python
for row in GiantTable.objects.all().iterator():
    ...
```

#### 🌍 Real-Time Example — SaaS billing recompute

```text
Stream invoices with `iterator()` to cap memory on large tenants.
```

---

### `repr` vs `str`

In shell, **`repr(qs)`** may truncate evaluation; prefer explicit methods for clarity.

#### 🟢 Beginner Example

```python
qs = Product.objects.all()
print(qs.query)  # SQL string (debug)
```

#### 🟡 Intermediate Example — `repr` in Django shell

```python
>>> Product.objects.filter(pk__in=[1,2,3])
<QuerySet [<Product: Mug>, ...]>
```

#### 🔴 Expert Example — Logging queries safely

```python
import logging
logger = logging.getLogger(__name__)
logger.debug("SQL: %s", str(qs.query))
```

#### 🌍 Real-Time Example — E-commerce support tooling

```text
Staff runs queryset in shell_plus with `str(qs.query)` to share with DBAs.
```

---

## 5.2 Retrieving Objects

### `all()`

Returns all rows (still lazy until evaluated).

#### 🟢 Beginner Example

```python
Product.objects.all()
```

#### 🟡 Intermediate Example — Always combine with limits in APIs

```python
Product.objects.all()[:50]
```

#### 🔴 Expert Example — Table scans dangerous at scale

```text
Never serialize `Model.objects.all()` in an API without pagination.
```

#### 🌍 Real-Time Example — SaaS internal admin export

```python
User.objects.all().iterator()
```

---

### `filter()` / `exclude()`

Narrow rows with field lookups.

#### 🟢 Beginner Example

```python
Product.objects.filter(is_active=True)
```

#### 🟡 Intermediate Example

```python
Order.objects.exclude(status="CANCELLED")
```

#### 🔴 Expert Example — Chained excludes

```python
Post.objects.filter(author=user).exclude(hidden=True)
```

#### 🌍 Real-Time Example — Social timeline

```python
Post.objects.filter(author__in=following_ids).exclude(blocked=True)
```

---

### `get()`

Expects **exactly one** row; raises **`DoesNotExist`** or **`MultipleObjectsReturned`**.

#### 🟢 Beginner Example

```python
p = Product.objects.get(pk=1)
```

#### 🟡 Intermediate Example — Try/except pattern

```python
from shop.models import Product

try:
    p = Product.objects.get(sku="MUG-01")
except Product.DoesNotExist:
    p = None
```

#### 🔴 Expert Example — Prefer `get` with unique constraints only

```text
If uniqueness isn’t enforced in DB, `get` can raise MultipleObjectsReturned.
```

#### 🌍 Real-Time Example — E-commerce coupon lookup

```python
coupon = Coupon.objects.get(code=code.upper(), active=True)
```

---

### `first()` / `last()`

Return object or **`None`**; requires **ordering** for stable semantics.

#### 🟢 Beginner Example

```python
latest = Post.objects.order_by("-published_at").first()
```

#### 🟡 Intermediate Example — `last()` with Meta.ordering

```python
oldest = Comment.objects.last()
```

#### 🔴 Expert Example — Without ordering, order is undefined

```text
Always set `order_by` when business logic depends on first/last.
```

#### 🌍 Real-Time Example — SaaS “current plan”

```python
sub = Subscription.objects.filter(user=user, status="active").order_by("-started_at").first()
```

---

### `exists()` / `count()`

**`exists()`** is optimized to a boolean existence query. **`count()`** counts rows.

#### 🟢 Beginner Example

```python
if Cart.objects.filter(user=user, checked_out=False).exists():
    ...
```

#### 🟡 Intermediate Example

```python
pending = Order.objects.filter(status="PENDING").count()
```

#### 🔴 Expert Example — `exists()` vs `count() > 0`

```text
Prefer `exists()` when you only need a boolean.
```

#### 🌍 Real-Time Example — Social block check

```python
if Block.objects.filter(blocker=viewer, blocked=author).exists():
    raise PermissionDenied
```

---

### `values()` / `values_list()`

Return dicts/tuples instead of model instances—less overhead.

#### 🟢 Beginner Example

```python
list(Product.objects.values("id", "name"))
```

#### 🟡 Intermediate Example — `values_list` flat

```python
ids = list(Product.objects.values_list("id", flat=True))
```

#### 🔴 Expert Example — Annotations with values

```python
Product.objects.annotate(revenue=Sum("orderline__line_total")).values("id", "revenue")
```

#### 🌍 Real-Time Example — E-commerce autocomplete

```python
Product.objects.filter(name__istartswith=q).values_list("name", flat=True)[:10]
```

---

## 5.3 Filtering

### Exact Match

Default lookup is **`exact`**; shorthand `field=value`.

#### 🟢 Beginner Example

```python
User.objects.filter(username="ada")
```

#### 🟡 Intermediate Example — Explicit

```python
User.objects.filter(username__exact="ada")
```

#### 🔴 Expert Example — Case sensitivity depends on DB collation

```text
PostgreSQL is case-sensitive by default for `exact`; use `iexact` if needed.
```

#### 🌍 Real-Time Example — SaaS tenant id

```python
Document.objects.filter(workspace_id=workspace_id)
```

---

### `iexact`

Case-insensitive exact match (may use `LOWER()` or ILIKE).

#### 🟢 Beginner Example

```python
User.objects.filter(email__iexact="Ada@Example.com")
```

#### 🟡 Intermediate Example — Login normalization

```python
user = User.objects.filter(email__iexact=email.strip()).first()
```

#### 🔴 Expert Example — Index implications

```text
`iexact` may prevent index use unless functional indexes exist.
```

#### 🌍 Real-Time Example — Social handle lookup

```python
Profile.objects.filter(handle__iexact=handle)
```

---

### `contains` / `icontains`

Substring match; **`icontains`** is case-insensitive.

#### 🟢 Beginner Example

```python
Post.objects.filter(body__icontains="django")
```

#### 🟡 Intermediate Example — SQL `%term%` pattern

```python
Product.objects.filter(description__icontains="organic")
```

#### 🔴 Expert Example — Prefer full-text search at scale

```text
For large text search, use PostgreSQL `SearchVector`/`tsvector`, not `icontains`.
```

#### 🌍 Real-Time Example — E-commerce search MVP

```python
Product.objects.filter(name__icontains=q)[:20]
```

---

### `gt` / `gte` / `lt` / `lte`

Numeric and date comparisons.

#### 🟢 Beginner Example

```python
Product.objects.filter(price_cents__lte=2500)
```

#### 🟡 Intermediate Example — Date range

```python
from django.utils import timezone
from datetime import timedelta

since = timezone.now() - timedelta(days=7)
Event.objects.filter(started_at__gte=since)
```

#### 🔴 Expert Example — Open interval with compound filters

```python
Reservation.objects.filter(check_in__lt=end_date, check_out__gt=start_date)
```

#### 🌍 Real-Time Example — SaaS usage alerts

```python
MeterReading.objects.filter(units__gte=threshold)
```

---

### `startswith` / `endswith` / `istartswith` / `iendswith`

Prefix/suffix filtering—can use indexes when pattern is prefix-only.

#### 🟢 Beginner Example

```python
Product.objects.filter(sku__startswith="MUG")
```

#### 🟡 Intermediate Example

```python
EmailLog.objects.filter(recipient__iendswith="@company.com")
```

#### 🔴 Expert Example — `startswith` + btree index

```text
Prefix queries can use btree indexes; suffix queries often cannot.
```

#### 🌍 Real-Time Example — E-commerce gift card ranges

```python
GiftCard.objects.filter(code__startswith="GC2026")
```

---

### `in` Operator

Match membership in list/tuple/subquery.

#### 🟢 Beginner Example

```python
Product.objects.filter(id__in=[1, 2, 3])
```

#### 🟡 Intermediate Example — Subquery

```python
from django.db.models import Subquery, OuterRef

active_user_ids = Subscription.objects.filter(status="active").values("user_id")
User.objects.filter(id__in=Subquery(active_user_ids))
```

#### 🔴 Expert Example — Huge `IN` lists

```text
Split giant IN clauses or use temp tables / joins for performance.
```

#### 🌍 Real-Time Example — Social feed from followed authors

```python
Post.objects.filter(author_id__in=following_ids)
```

---

### `isnull`

Filter **`NULL`** / non-null values.

#### 🟢 Beginner Example

```python
Profile.objects.filter(phone__isnull=True)
```

#### 🟡 Intermediate Example

```python
Order.objects.filter(shipped_at__isnull=False)
```

#### 🔴 Expert Example — `isnull` with booleans

```text
For nullable booleans, combine with explicit True/False filters carefully.
```

#### 🌍 Real-Time Example — SaaS trial expiry

```python
Subscription.objects.filter(cancelled_at__isnull=True, trial_ends_at__isnull=False)
```

---

## 5.4 Ordering

### `order_by()`

Specify sort fields; prefix **`'-'`** for descending.

#### 🟢 Beginner Example

```python
Product.objects.order_by("name")
```

#### 🟡 Intermediate Example

```python
LeaderboardEntry.objects.order_by("-score", "created_at")
```

#### 🔴 Expert Example — Ordering with NULLs (database-specific)

```text
Use `F()` expressions or `nulls_first`/`nulls_last` where supported.
```

#### 🌍 Real-Time Example — E-commerce “new arrivals”

```python
Product.objects.filter(is_active=True).order_by("-created_at")
```

---

### Ascending / Descending

Combine multiple fields for tie-breaking.

#### 🟢 Beginner Example

```python
Comment.objects.order_by("created_at")
```

#### 🟡 Intermediate Example

```python
Comment.objects.order_by("-like_count", "created_at")
```

#### 🔴 Expert Example — Stable pagination requires deterministic order

```text
Always include PK as final order key: `.order_by("-published_at", "id")`.
```

#### 🌍 Real-Time Example — Social “top posts today”

```python
Post.objects.filter(published_at__date=today).order_by("-engagement_score", "-id")
```

---

### Multiple Field Ordering

Already shown; use tuples of field names.

#### 🟢 Beginner Example

```python
User.objects.order_by("last_name", "first_name")
```

#### 🟡 Intermediate Example — Related field

```python
Order.objects.order_by("user__username", "-placed_at")
```

#### 🔴 Expert Example — `Meta.ordering` interaction

```text
Explicit `order_by()` replaces default ordering unless you chain carefully.
```

#### 🌍 Real-Time Example — SaaS audit log UI

```python
AuditLog.objects.order_by("-created_at", "id")
```

---

### Random Ordering

**`order_by('?')`** is expensive on large tables.

#### 🟢 Beginner Example

```python
Product.objects.order_by("?")[:5]
```

#### 🟡 Intermediate Example — Better: random IDs in application layer

```python
import random
ids = list(Product.objects.values_list("id", flat=True))
sample = random.sample(ids, k=min(5, len(ids)))
Product.objects.filter(id__in=sample)
```

#### 🔴 Expert Example — PostgreSQL `TABLESAMPLE` via RawSQL

```text
For huge catalogs, use DB-specific sampling strategies.
```

#### 🌍 Real-Time Example — E-commerce “surprise me”

```text
Precompute daily featured picks in a cache table instead of `order_by('?')`.
```

---

### `F` Expressions

Reference **database column values** in updates/filters without loading into Python.

#### 🟢 Beginner Example — Increment counter

```python
from django.db.models import F

Post.objects.filter(pk=post_id).update(like_count=F("like_count") + 1)
```

#### 🟡 Intermediate Example — Compare two columns

```python
Allocation.objects.filter(used__gt=F("quota"))
```

#### 🔴 Expert Example — `F` in annotations

```python
from django.db.models import ExpressionWrapper, FloatField

Product.objects.annotate(
    margin=ExpressionWrapper(
        (F("price_cents") - F("cost_cents")) * 1.0 / F("price_cents"),
        output_field=FloatField(),
    )
)
```

#### 🌍 Real-Time Example — E-commerce stock decrement (with constraints)

```text
Use `select_for_update()` + `F` updates inside transactions for inventory.
```

---

## 5.5 Complex Queries

### `Q` Objects

Build **OR/AND** logic beyond simple chaining.

#### 🟢 Beginner Example — OR

```python
from django.db.models import Q

Post.objects.filter(Q(title__icontains="sale") | Q(body__icontains="sale"))
```

#### 🟡 Intermediate Example — AND + OR grouping

```python
Product.objects.filter(Q(price_cents__lte=1000) | Q(featured=True), is_active=True)
```

#### 🔴 Expert Example — Negation

```python
Post.objects.filter(~Q(author=user) | Q(public=True))
```

#### 🌍 Real-Time Example — SaaS search filters

```python
Document.objects.filter(
    Q(title__icontains=q) | Q(body__icontains=q),
    workspace=ws,
)
```

---

### AND / OR / NOT Operations

Combine with **`&`**, **`|`**, **`~`**; wrap parentheses for clarity.

#### 🟢 Beginner Example

```python
from django.db.models import Q

User.objects.filter(Q(is_staff=True) | Q(is_superuser=True))
```

#### 🟡 Intermediate Example

```python
Blocked.objects.filter(~Q(blocker=viewer))
```

#### 🔴 Expert Example — Nested Q with related fields

```python
Message.objects.filter(
    Q(recipient=user) | Q(sender=user),
    deleted_at__isnull=True,
)
```

#### 🌍 Real-Time Example — Social privacy rules

```python
Post.objects.filter(Q(public=True) | Q(author__in=following))
```

---

### Complex Q Combinations

Build dynamic filters from user input lists.

#### 🟢 Beginner Example

```python
q = Q()
for tag in tags:
    q |= Q(tags__name=tag)
Post.objects.filter(q)
```

#### 🟡 Intermediate Example — Programmatic AND/OR builder

```python
def build_status_filter(statuses):
    q = Q()
    for s in statuses:
        q |= Q(status=s)
    return q

Order.objects.filter(build_status_filter(["PAID", "SHIPPED"]))
```

#### 🔴 Expert Example — Sanitize user filter inputs

```text
Whitelist field names and lookup types—never pass raw strings into `**kwargs` unchecked.
```

#### 🌍 Real-Time Example — E-commerce facet filters

```python
qs = Product.objects.all()
if brands:
    qs = qs.filter(brand__slug__in=brands)
if sizes:
    qs = qs.filter(variants__size__in=sizes).distinct()
```

---

## 5.6 Aggregation

### `aggregate()`

Compute summary values over a queryset.

#### 🟢 Beginner Example

```python
from django.db.models import Count

Product.objects.aggregate(total=Count("id"))
```

#### 🟡 Intermediate Example — Multiple aggregates

```python
from django.db.models import Sum, Avg

Order.objects.filter(status="PAID").aggregate(
    revenue=Sum("total_cents"),
    avg_order=Avg("total_cents"),
)
```

#### 🔴 Expert Example — Conditional aggregate

```python
from django.db.models import Sum, Q

Order.objects.aggregate(
    paid_revenue=Sum("total_cents", filter=Q(status="PAID")),
)
```

#### 🌍 Real-Time Example — SaaS MRR snapshot

```python
Subscription.objects.filter(status="active").aggregate(mrr_cents=Sum("amount_cents"))
```

---

### Count / Sum / Avg

#### 🟢 Beginner Example — `Count`

```python
from django.db.models import Count

User.objects.annotate(c=Count("order")).values("username", "c")[:5]
```

#### 🟡 Intermediate Example — `Sum`

```python
from django.db.models import Sum

OrderLine.objects.filter(order_id=order_id).aggregate(items=Sum("quantity"))
```

#### 🔴 Expert Example — `Avg` with `filter` argument

```python
from django.db.models import Avg, Q

Review.objects.aggregate(avg_rating=Avg("rating", filter=Q(verified_purchase=True)))
```

#### 🌍 Real-Time Example — E-commerce cart size

```python
from django.db.models import Sum

Cart.objects.filter(user=user).aggregate(qty=Sum("items__quantity"))
```

---

### Min / Max

#### 🟢 Beginner Example

```python
from django.db.models import Min, Max

PriceHistory.objects.filter(product_id=pid).aggregate(
    low=Min("price_cents"),
    high=Max("price_cents"),
)
```

#### 🟡 Intermediate Example — Latest timestamp

```python
from django.db.models import Max

last_seen = LoginEvent.objects.filter(user=user).aggregate(ts=Max("created_at"))["ts"]
```

#### 🔴 Expert Example — Nullable max

```text
Max on empty queryset returns None for the aggregate alias.
```

#### 🌍 Real-Time Example — Social peak concurrent viewers

```python
StreamSession.objects.filter(stream=stream).aggregate(peak=Max("concurrent_viewers"))
```

---

### StdDev / Variance

Statistical aggregates (database support required).

#### 🟢 Beginner Example

```python
from django.db.models import StdDev

Score.objects.aggregate(spread=StdDev("value"))
```

#### 🟡 Intermediate Example — Sample vs population

```text
Use `StdDev` with `sample=True` where supported (check Django DB docs).
```

#### 🔴 Expert Example — Guard for SQLite limitations

```text
Some aggregates are not available on SQLite—test backend compatibility.
```

#### 🌍 Real-Time Example — SaaS latency variance

```python
RequestMetric.objects.filter(service="api").aggregate(v=Variance("latency_ms"))
```

---

### Custom Aggregates

Extend **`Aggregate`** for DB-specific functions when needed.

#### 🟢 Beginner Example — Conceptual

```text
Prefer built-in aggregates; custom SQL via Func templates for advanced cases.
```

#### 🟡 Intermediate Example — `Func` expression

```python
from django.db.models import Func

class JSONArrayAgg(Func):
    function = "json_agg"
    template = "%(function)s(%(expressions)s)"
```

#### 🔴 Expert Example — Vendor-specific with fallback

```text
Feature-detect DB vendor in migration or use database routers per environment.
```

#### 🌍 Real-Time Example — E-commerce percentile in PostgreSQL

```text
Use `PercentileCont` via RawSQL or django.contrib.postgres if applicable.
```

---

## 5.7 Grouping

### `group_by` with `values()`

**`values()`** + **`annotate()`** groups by selected columns.

#### 🟢 Beginner Example

```python
from django.db.models import Count

Order.objects.values("status").annotate(c=Count("id"))
```

#### 🟡 Intermediate Example — Group by FK

```python
OrderLine.objects.values("product_id").annotate(units_sold=Sum("quantity"))
```

#### 🔴 Expert Example — `values` field order matters

```text
Only grouped fields + aggregates appear unless you add annotations carefully.
```

#### 🌍 Real-Time Example — SaaS signups by day

```python
from django.db.models.functions import TruncDate

User.objects.annotate(d=TruncDate("date_joined")).values("d").annotate(signups=Count("id"))
```

---

### Annotations

Add computed columns per row.

#### 🟢 Beginner Example

```python
from django.db.models import F

Product.objects.annotate(margin_cents=F("price_cents") - F("cost_cents"))
```

#### 🟡 Intermediate Example — `Case/When`

```python
from django.db.models import Case, When, Value, CharField

Shipment.objects.annotate(
    bucket=Case(
        When(delivered_at__isnull=False, then=Value("done")),
        default=Value("pending"),
        output_field=CharField(),
    )
)
```

#### 🔴 Expert Example — Subquery annotation

```python
from django.db.models import OuterRef, Subquery, Count

latest = Comment.objects.filter(post_id=OuterRef("pk")).order_by("-created_at")
Post.objects.annotate(latest_comment_id=Subquery(latest.values("pk")[:1]))
```

#### 🌍 Real-Time Example — Social follower counts

```python
from django.db.models import Count

User.objects.annotate(followers=Count("followers", distinct=True))
```

---

### Filtering Annotated QuerySets

Use **`filter()`** on annotations or **`HAVING`** via **`filter()`** after annotate.

#### 🟢 Beginner Example

```python
from django.db.models import Count

User.objects.annotate(c=Count("post")).filter(c__gte=10)
```

#### 🟡 Intermediate Example — Chain

```python
Product.objects.annotate(sold=Sum("orderline__quantity")).filter(sold__gte=100)
```

#### 🔴 Expert Example — `filter` vs `having` confusion

```text
Django maps many post-annotate filters to SQL HAVING as appropriate.
```

#### 🌍 Real-Time Example — E-commerce “bestsellers”

```python
Product.objects.annotate(units=Sum("orderline__quantity")).filter(units__gte=500).order_by("-units")
```

---

### Ordering Annotated QuerySets

Order by annotation aliases.

#### 🟢 Beginner Example

```python
from django.db.models import Count

Tag.objects.annotate(uses=Count("post")).order_by("-uses")
```

#### 🟡 Intermediate Example — Multi-key

```python
Author.objects.annotate(posts=Count("article")).order_by("-posts", "name")
```

#### 🔴 Expert Example — Ordering with `F` and annotations

```python
Product.objects.annotate(score=F("like_count") * 2 + F("comment_count")).order_by("-score")
```

#### 🌍 Real-Time Example — SaaS leaderboard

```python
Team.objects.annotate(points=Sum("member__achievement__points")).order_by("-points")
```

---

### Complex Grouping

Multiple dimensions with **`values()`** tuple.

#### 🟢 Beginner Example

```python
Order.objects.values("status", "currency").annotate(c=Count("id"))
```

#### 🟡 Intermediate Example — Time bucketing

```python
from django.db.models.functions import TruncMonth

Payment.objects.annotate(m=TruncMonth("paid_at")).values("m").annotate(total=Sum("amount_cents"))
```

#### 🔴 Expert Example — Distinct counts

```python
from django.db.models import Count

Post.objects.values("author_id").annotate(unique_tags=Count("tags", distinct=True))
```

#### 🌍 Real-Time Example — E-commerce cohort revenue

```text
Group by signup month + first purchase month using conditional aggregates.
```

---

## 5.8 Raw SQL

<a id="58-raw-sql"></a>

### `raw()`

`Model.objects.raw(sql, params)` maps rows to model instances—**still parameterize**.

#### 🟢 Beginner Example

```python
for p in Product.objects.raw("SELECT * FROM shop_product WHERE is_active = %s", [True]):
    print(p.name)
```

#### 🟡 Intermediate Example — Params must be tuple/list

```python
sql = "SELECT * FROM shop_product WHERE price_cents BETWEEN %s AND %s"
list(Product.objects.raw(sql, [100, 500]))
```

#### 🔴 Expert Example — Column order must include PK

```text
`raw()` expects primary key field present in SELECT for ORM mapping.
```

#### 🌍 Real-Time Example — E-commerce reporting query tuned by DBA

```python
rows = Order.objects.raw(
    """
    SELECT o.* FROM shop_order o
    JOIN shop_user u ON u.id = o.user_id
    WHERE u.country = %s AND o.placed_at >= %s
    """,
    ["US", since],
)
```

---

### `connection` / `cursor()`

Low-level DB-API for non-model SQL.

#### 🟢 Beginner Example

```python
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM shop_product")
    (count,) = cursor.fetchone()
```

#### 🟡 Intermediate Example — Parameterized insert

```python
with connection.cursor() as cursor:
    cursor.execute("INSERT INTO audit_log (msg) VALUES (%s)", ["checkout"])
```

#### 🔴 Expert Example — Use `transaction.atomic`

```python
from django.db import transaction

with transaction.atomic():
    with connection.cursor() as cursor:
        cursor.execute("UPDATE shop_inventory SET on_hand = on_hand - %s WHERE product_id = %s", [qty, pid])
```

#### 🌍 Real-Time Example — SaaS bulk maintenance

```text
Run partition management / vacuum / analyze scripts via management commands.
```

---

### Parameterized Queries

**Always** bind parameters—never interpolate user strings into SQL.

#### 🟢 Beginner Example — Safe

```python
cursor.execute("SELECT * FROM auth_user WHERE username = %s", [username])
```

#### 🟡 Intermediate Example — Unsafe (NEVER)

```python
# NEVER DO THIS
cursor.execute(f"SELECT * FROM auth_user WHERE username = '{username}'")
```

#### 🔴 Expert Example — Identifier quoting

```text
You cannot parameterize table/column names—whitelist allowed identifiers in code.
```

#### 🌍 Real-Time Example — Social search admin tool

```text
Staff inputs are still untrusted—bind all dynamic values.
```

---

### SQL Injection Prevention

ORM filters are parameterized. Raw SQL risk is **string concatenation**.

#### 🟢 Beginner Example — ORM safe

```python
User.objects.filter(username=username)
```

#### 🟡 Intermediate Example — Extra(where) deprecated patterns

```text
Avoid `extra`; prefer ORM or `RawSQL` with params.
```

#### 🔴 Expert Example — Defense in depth

```text
Least-privilege DB users, WAF, and audited queries for admin features.
```

#### 🌍 Real-Time Example — E-commerce PCI scope

```text
Keep card data out of Django DB; use tokenization; raw SQL still parameterized.
```

---

### When to Use Raw SQL

Use when ORM cannot express efficient SQL, or for **DBA-tuned** reporting.

#### 🟢 Beginner Example — Start with ORM

```python
Product.objects.filter(is_active=True)
```

#### 🟡 Intermediate Example — Drop to raw for window functions (if ORM insufficient)

```text
Django adds window function support over time—check current docs before raw SQL.
```

#### 🔴 Expert Example — Materialized views

```text
Refresh MV via cron; query through unmanaged models or raw SQL.
```

#### 🌍 Real-Time Example — SaaS executive dashboards

```text
Pre-aggregated tables fed by ETL; Django reads via ORM on summary models.
```

---

## Best Practices

- **Paginate** list endpoints; never unbounded `all()`.
- Prefer **`exists()`** over **`count()`** when checking presence.
- Use **`select_related`** for forward FK/OneToOne; **`prefetch_related`** for reverse FKs and M2M.
- Add **deterministic `order_by`** for stable pagination.
- Profile with **`explain()`** on slow queries.
- Keep **raw SQL** rare, reviewed, and **parameterized**.
- Use **`iterator()`** for large batch jobs.

---

## Common Mistakes to Avoid

- Calling **`len(qs)`** instead of **`count()`** on huge querysets.
- Using **`order_by('?')`** on large tables.
- **`get()`** without handling **`DoesNotExist`** in user-facing code.
- **`filter(a=x, b=y)`** misunderstanding as OR—it's AND; use **`Q`** for OR.
- **N+1** queries in loops—missing prefetch/select_related.
- Annotating then **filtering** without understanding SQL GROUP BY rules.
- **Raw SQL** without parameters.

---

## Comparison Tables

### `filter` vs `exclude`

| Method   | Effect              |
| -------- | ------------------- |
| filter   | Keep matching rows  |
| exclude  | Remove matching rows|

### `select_related` vs `prefetch_related`

| Method            | Relation types        | SQL shape      |
| ----------------- | --------------------- | -------------- |
| select_related    | FK, OneToOne          | JOINs          |
| prefetch_related  | reverse FK, M2M       | Extra queries + join in Python |

### `aggregate` vs `annotate`

| API        | Grain            |
| ---------- | ---------------- |
| aggregate  | One summary row  |
| annotate   | Per object row   |

### Evaluation triggers (common)

| Operation        | Evaluates queryset |
| ---------------- | -------------------- |
| `list(qs)`       | Yes                  |
| `for x in qs`    | Yes                  |
| `qs[:10]`        | Yes (slice)          |
| `qs.exists()`    | Yes (optimized)      |
| `qs.query`       | No (SQL string build)|

---

*Query optimization is database-specific—always validate indexes and plans on **production-like** data volumes.*
