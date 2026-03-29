# Django Advanced Features

Once you are fluent in views, models, and the ORM, Django **6.0.3** rewards deeper patterns: composable class-based views, expressive querysets and managers, inheritance maps that match your domain, analytics-level aggregations, disciplined raw SQL, transactional integrity, search at scale, and multilingual URLs. This reference uses TypeScript-style progression (beginner → real-world) with **e-commerce**, **social**, and **SaaS** examples.

---

## 📑 Table of Contents

1. [27.1 Class-Based Views Advanced](#271-class-based-views-advanced)
2. [27.2 Queryset and Manager Advanced](#272-queryset-and-manager-advanced)
3. [27.3 Model Inheritance Patterns](#273-model-inheritance-patterns)
4. [27.4 Aggregation and Annotation](#274-aggregation-and-annotation)
5. [27.5 Raw SQL Integration](#275-raw-sql-integration)
6. [27.6 Database Transactions](#276-database-transactions)
7. [27.7 Search and Full-Text](#277-search-and-full-text)
8. [27.8 Internationalization (i18n)](#278-internationalization-i18n)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 27.1 Class-Based Views Advanced

### 27.1.1 View Subclassing

**🟢 Beginner Example — thin specialization**

```python
from django.views.generic import ListView
from .models import Product

class ActiveProductList(ListView):
    model = Product
    template_name = "shop/product_list.html"

    def get_queryset(self):
        return super().get_queryset().filter(active=True)
```

**🟡 Intermediate Example — SaaS project list scoped by org**

```python
class OrgProjectList(ListView):
    model = Project

    def get_queryset(self):
        return Project.objects.filter(org=self.request.user.org)
```

**🔴 Expert Example — inject policy hooks**

```python
class AuditedCreateView(CreateView):
    def form_valid(self, form):
        response = super().form_valid(form)
        AuditLog.objects.create(user=self.request.user, action="create", obj=self.object)
        return response
```

**🌍 Real-Time Example — e-commerce staff-only price override form**

```python
class StaffPriceUpdate(UpdateView):
    model = Product

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
```

### 27.1.2 Mixins Strategy

**🟢 Beginner Example — `LoginRequiredMixin`**

```python
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import DetailView

class AccountDetail(LoginRequiredMixin, DetailView):
    model = User
    template_name = "account/detail.html"

    def get_object(self):
        return self.request.user
```

**🟡 Intermediate Example — reusable `UserOrgMixin`**

```python
class UserOrgMixin:
    def get_org(self):
        return self.request.user.org

class InvoiceList(UserOrgMixin, ListView):
    model = Invoice

    def get_queryset(self):
        return Invoice.objects.filter(org=self.get_org())
```

**🔴 Expert Example — mixin ordering (MRO)**

```python
class SecureOrgUpdate(LoginRequiredMixin, UserOrgMixin, UpdateView):
    # LoginRequiredMixin must be leftmost among auth mixins
    ...
```

**🌍 Real-Time Example — social: `BlockedUsersExclusionMixin` on message views**

```python
class BlockedUsersExclusionMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        blocked = self.request.user.blocked_user_ids()
        return qs.exclude(author_id__in=blocked)
```

### 27.1.3 Chaining Mixins

**🟢 Beginner Example — two mixins**

```python
class M1:
    def get_context_data(self, **kwargs):
        kwargs["a"] = 1
        return super().get_context_data(**kwargs)

class M2:
    def get_context_data(self, **kwargs):
        kwargs["b"] = 2
        return super().get_context_data(**kwargs)

class V(M1, M2, TemplateView):
    template_name = "t.html"
```

**🟡 Intermediate Example — cache mixin + analytics mixin**

**🔴 Expert Example — avoid diamond surprises with explicit `super()` flow**

**🌍 Real-Time Example — SaaS: `PlanFeatureMixin` + `AuditMixin` on settings views**

### 27.1.4 Composition vs Inheritance

**🟢 Beginner Example — service function instead of deep CBV tree**

```python
def build_checkout_context(user):
    return {"cart": user.cart, "addresses": user.addresses.all()}
```

**🟡 Intermediate Example — compose in view**

```python
class CheckoutView(TemplateView):
    template_name = "checkout.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(build_checkout_context(self.request.user))
        return ctx
```

**🔴 Expert Example — class-based policy objects**

```python
class PricingPolicy:
    def line_total(self, line):
        ...

class CheckoutView(View):
    policy = PricingPolicy()

    def post(self, request):
        total = sum(self.policy.line_total(l) for l in request.user.cart.lines.all())
```

**🌍 Real-Time Example — e-commerce promotions engine injected, not subclassed per promo type**

### 27.1.5 Generic Relations

**🟢 Beginner Example — `GenericForeignKey` for polymorphic targets**

```python
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

class Like(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
```

**🟡 Intermediate Example — reverse generic relation on Post**

```python
from django.contrib.contenttypes.fields import GenericRelation

class Post(models.Model):
    body = models.TextField()
    likes = GenericRelation(Like)
```

**🔴 Expert Example — index strategy**

```python
class Meta:
    indexes = [
        models.Index(fields=["content_type", "object_id"]),
    ]
```

**🌍 Real-Time Example — social: likes on posts, comments, reels uniformly**

---

## 27.2 Queryset and Manager Advanced

### 27.2.1 Custom QuerySet Methods

**🟢 Beginner Example**

```python
from django.db import models

class ProductQuerySet(models.QuerySet):
    def active(self):
        return self.filter(active=True)

class ProductManager(models.Manager.from_queryset(ProductQuerySet)):
    pass

class Product(models.Model):
    ...
    objects = ProductManager()
```

**🟡 Intermediate Example — chainable search**

```python
class UserQuerySet(models.QuerySet):
    def search(self, term):
        return self.filter(
            models.Q(username__icontains=term) | models.Q(email__icontains=term)
        )

class UserManager(models.Manager.from_queryset(UserQuerySet)):
    pass
```

**🔴 Expert Example — reusable `with_counts` annotation**

```python
class PostQuerySet(models.QuerySet):
    def with_engagement(self):
        return self.annotate(
            like_count=models.Count("likes", distinct=True),
            comment_count=models.Count("comments", distinct=True),
        )
```

**🌍 Real-Time Example — SaaS invoices: `open()`, `overdue()` on custom queryset**

```python
class InvoiceQuerySet(models.QuerySet):
    def open(self):
        return self.exclude(status__in=["paid", "void"])

    def overdue(self):
        from django.utils import timezone
        return self.open().filter(due_date__lt=timezone.now().date())
```

### 27.2.2 QuerySet as Manager Return Value

**🟢 Beginner Example — `from_queryset`**

```python
class BookManager(models.Manager.from_queryset(BookQuerySet)):
    pass
```

**🟡 Intermediate Example — default queryset filters**

```python
class SoftDeleteQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(deleted_at__isnull=True)

class SoftDeleteManager(models.Manager.from_queryset(SoftDeleteQuerySet)):
    def get_queryset(self):
        return super().get_queryset().alive()
```

**🔴 Expert Example — `all_objects` manager bypass**

```python
class Order(models.Model):
    objects = SoftDeleteManager()
    all_objects = models.Manager()
```

**🌍 Real-Time Example — e-commerce hide archived SKUs from storefront queries**

### 27.2.3 Custom Manager Methods

**🟢 Beginner Example**

```python
class CartManager(models.Manager):
    def active_for_user(self, user):
        return self.get(user=user, status="open")
```

**🟡 Intermediate Example — `create_with_lines` factory**

```python
from django.db import transaction

class OrderManager(models.Manager):
    @transaction.atomic
    def create_with_lines(self, user, lines):
        order = self.create(user=user)
        for sku, qty in lines:
            Line.objects.create(order=order, sku=sku, qty=qty)
        return order
```

**🔴 Expert Example — bulk helpers that respect signals policy**

```python
# Document if save() signals skipped in bulk paths
```

**🌍 Real-Time Example — social: `TimelineManager.for_user(user)` encapsulates complex prefetch**

### 27.2.4 Chaining Custom Methods

**🟢 Beginner Example**

```python
Product.objects.active().filter(category="books")
```

**🟡 Intermediate Example**

```python
Post.objects.with_engagement().filter(like_count__gte=10)
```

**🔴 Expert Example — clone-safe queryset methods**

```python
# Each method returns new queryset from self.filter/annotate
```

**🌍 Real-Time Example — SaaS reporting queryset DSL**

```python
Report.objects.for_org(org).between(start, end).by_plan()
```

### 27.2.5 QuerySet Subclasses

**🟢 Beginner Example — dedicated class for readability**

**🟡 Intermediate Example — `values`/`values_list` specialized return**

**🔴 Expert Example — `.iterator(chunk_size=...)` wrapper for exports**

```python
class ExportQuerySet(models.QuerySet):
    def csv_rows(self):
        for row in self.iterator(chunk_size=2000):
            yield (row.id, row.name)
```

**🌍 Real-Time Example — e-commerce nightly feed generation**

---

## 27.3 Model Inheritance Patterns

### 27.3.1 Abstract Base Classes

**🟢 Beginner Example**

```python
class Timestamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Article(Timestamped):
    title = models.CharField(max_length=200)
```

**🟡 Intermediate Example — shared `uuid` primary key policy**

**🔴 Expert Example — abstract constraints**

```python
class Meta:
    abstract = True
    constraints = [
        models.CheckConstraint(check=models.Q(price__gte=0), name="%(class)s_price_non_negative"),
    ]
```

**🌍 Real-Time Example — SaaS: `OrgOwned` abstract with `org` FK + index**

### 27.3.2 Multi-table Inheritance

**🟢 Beginner Example**

```python
class Place(models.Model):
    name = models.CharField(max_length=100)

class Restaurant(Place):
    serves_hot_dogs = models.BooleanField(default=False)
```

**🟡 Intermediate Example — query joins parent automatically**

**🔴 Expert Example — extra join cost; prefer explicit FK if hot path**

**🌍 Real-Time Example — e-commerce `Product` parent with `Book`, `Electronics` children**

### 27.3.3 Proxy Models

**🟢 Beginner Example**

```python
class Order(models.Model):
    ...

class PaidOrder(Order):
    class Meta:
        proxy = True

    @property
    def is_paid(self):
        return self.status == "paid"
```

**🟡 Intermediate Example — proxy manager**

```python
class PaidOrderManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status="paid")

class PaidOrder(Order):
    objects = PaidOrderManager()

    class Meta:
        proxy = True
```

**🔴 Expert Example — admin registration differences**

**🌍 Real-Time Example — social: `ModeratorUser` proxy with custom admin actions**

### 27.3.4 Mixin Classes (model composition)

**🟢 Beginner Example — abstract mixin fields**

```python
class SEOFields(models.Model):
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    class Meta:
        abstract = True

class Product(SEOFields, models.Model):
    name = models.CharField(max_length=200)
```

**🟡 Intermediate Example — ordering MRO for `Meta`**

**🔴 Expert Example — avoid conflicting `Meta.indexes` names — use `%(class)s` in names**

**🌍 Real-Time Example — SaaS `Billable` mixin (currency, tax fields)**

### 27.3.5 Mixins in Inheritance

**🟢 Beginner Example — combine abstract mixins**

**🟡 Intermediate Example — diamond with two abstract parents**

**🔴 Expert Example — migrate from multi-table to FK + composition gradually**

**🌍 Real-Time Example — e-commerce extract `Shippable` mixin from god model**

---

## 27.4 Aggregation and Annotation

### 27.4.1 Window Functions

**🟢 Beginner Example — running total (Postgres)**

```python
from django.db.models import Sum, F, Window
from django.db.models.functions import RowNumber

qs = Sales.objects.annotate(
    running_total=Window(Sum("amount"), order_by=F("day").asc()),
)
```

**🟡 Intermediate Example — `RowNumber` partition by user**

**🔴 Expert Example — percentile with vendor-specific SQL fallback**

**🌍 Real-Time Example — SaaS usage: rolling 30-day sum per customer**

### 27.4.2 Conditional Aggregation

**🟢 Beginner Example**

```python
from django.db.models import Count, Q

Order.objects.aggregate(
    paid=Count("id", filter=Q(status="paid")),
    open=Count("id", filter=Q(status="open")),
)
```

**🟡 Intermediate Example — `Sum` with filter**

```python
from django.db.models import Sum

Line.objects.aggregate(revenue=Sum("price", filter=Q(product__category="books")))
```

**🔴 Expert Example — combine with `Case/When` annotations**

**🌍 Real-Time Example — e-commerce funnel counts per stage**

### 27.4.3 Filtering by Annotation

**🟢 Beginner Example**

```python
from django.db.models import Count

User.objects.annotate(c=Count("posts")).filter(c__gte=5)
```

**🟡 Intermediate Example — `HAVING` via filter after annotate**

**🔴 Expert Example — subquery annotation + filter**

**🌍 Real-Time Example — social: users with >1000 followers**

```python
User.objects.annotate(fc=Count("followers")).filter(fc__gte=1000)
```

### 27.4.4 Ordering by Annotation

**🟢 Beginner Example**

```python
Product.objects.annotate(sold=Count("line_items")).order_by("-sold")
```

**🟡 Intermediate Example — `Coalesce` for null-safe sort**

```python
from django.db.models.functions import Coalesce

Product.objects.annotate(score=Coalesce("rating", 0)).order_by("-score")
```

**🔴 Expert Example — ordering by window function alias (DB support)**

**🌍 Real-Time Example — SaaS leaderboard by `mrr` annotation**

### 27.4.5 Annotation Performance

**🟢 Beginner Example — push filters before annotate**

**🟡 Intermediate Example — `distinct=True` on M2M counts**

```python
Count("tags", distinct=True)
```

**🔴 Expert Example — materialized view for heavy nightly metrics**

**🌍 Real-Time Example — e-commerce category revenue dashboard cached 5 min**

---

## 27.5 Raw SQL Integration

### 27.5.1 `raw()` Method

**🟢 Beginner Example**

```python
for p in Product.objects.raw("SELECT * FROM shop_product WHERE active = %s", [True]):
    print(p.name)
```

**🟡 Intermediate Example — column names must map to model fields**

**🔴 Expert Example — defer loading heavy columns with custom SQL + only fields**

**🌍 Real-Time Example — SaaS custom report aligning with ORM model for template reuse**

### 27.5.2 `cursor()` API

**🟢 Beginner Example**

```python
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("UPDATE shop_product SET stock = stock - %s WHERE id = %s", [qty, pid])
```

**🟡 Intermediate Example — `fetchmany` batching**

**🔴 Expert Example — temporary tables for ETL**

**🌍 Real-Time Example — e-commerce inter-store stock transfer stored procedure**

### 27.5.3 Parameterized Queries

**🟢 Beginner Example — always `%s` placeholders**

**🟡 Intermediate Example — `NamedTupleCursor` in psycopg**

**🔴 Expert Example — never f-string user input into SQL**

**🌍 Real-Time Example — social graph mutual friends SQL tuned by DBA**

### 27.5.4 SQL Injection Prevention

**🟢 Beginner Example — pass list/tuple params**

**🟡 Intermediate Example — whitelist dynamic ORDER BY**

**🔴 Expert Example — ORM `RawSQL` expression with params**

```python
from django.db.models.expressions import RawSQL

Product.objects.annotate(discount_price=RawSQL("(price * (1 - discount))", []))
```

**🌍 Real-Time Example — SaaS analytical filters compiled from JSON schema**

### 27.5.5 Hybrid Queries

**🟢 Beginner Example — ORM queryset + `extra` discouraged**

**🟡 Intermediate Example — `union` of querysets**

```python
qs1.union(qs2)
```

**🔴 Expert Example — prefetch in Python for graph algorithms**

**🌍 Real-Time Example — e-commerce recommendations: SQL top sellers + Python ranking blend**

---

## 27.6 Database Transactions

### 27.6.1 Transaction Control

**🟢 Beginner Example**

```python
from django.db import transaction

@transaction.atomic
def place_order(user, lines):
    order = Order.objects.create(user=user)
    for sku, qty in lines:
        Line.objects.create(order=order, sku=sku, qty=qty)
```

**🟡 Intermediate Example — `atomic()` context manager**

```python
with transaction.atomic():
    ...
```

**🔴 Expert Example — `on_commit` hook**

```python
def place_order(...):
    with transaction.atomic():
        order = Order.objects.create(...)
        transaction.on_commit(lambda: send_confirmation.delay(order.id))
```

**🌍 Real-Time Example — e-commerce reserve inventory then charge**

### 27.6.2 ACID Properties

**🟢 Beginner Example — rely on Postgres defaults**

**🟡 Intermediate Example — document invariants per use case**

**🔴 Expert Example — saga pattern across payment + warehouse services**

**🌍 Real-Time Example — SaaS seat billing + IdP SCIM sync**

### 27.6.3 Isolation Levels

**🟢 Beginner Example — default READ COMMITTED**

**🟡 Intermediate Example — per-transaction `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`**

```python
from django.db import connection, transaction

@transaction.atomic
def strict_transfer():
    with connection.cursor() as c:
        c.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
    ...
```

**🔴 Expert Example — retry on serialization failure**

**🌍 Real-Time Example — e-commerce flash sale inventory decrement**

### 27.6.4 Nested Transactions

**🟢 Beginner Example — savepoints**

```python
sid = transaction.savepoint()
try:
    risky()
except Exception:
    transaction.savepoint_rollback(sid)
else:
    transaction.savepoint_commit(sid)
```

**🟡 Intermediate Example — nested `atomic()` uses savepoints automatically**

**🔴 Expert Example — partial rollback inside large batch job**

**🌍 Real-Time Example — social import contacts: per-row failure isolation**

### 27.6.5 Rollback Strategies

**🟢 Beginner Example — raise to rollback outer atomic block**

**🟡 Intermediate Example — compensating action**

```python
try:
    charge()
except PaymentError:
    release_inventory()
    raise
```

**🔴 Expert Example — outbox to reconcile async failures**

**🌍 Real-Time Example — SaaS trial conversion: mark pending state if gateway timeout**

---

## 27.7 Search and Full-Text

### 27.7.1 Full-Text Search

**🟢 Beginner Example — `icontains` prototype**

```python
Article.objects.filter(body__icontains=term)
```

**🟡 Intermediate Example — Postgres `SearchVector` / `SearchQuery`**

```python
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

vector = SearchVector("title", weight="A") + SearchVector("body", weight="B")
query = SearchQuery(term)
Article.objects.annotate(rank=SearchRank(vector, query)).filter(rank__gte=0.1).order_by("-rank")
```

**🔴 Expert Example — GIN indexes + `to_tsvector` config per language**

**🌍 Real-Time Example — e-commerce catalog search with synonyms dictionary**

### 27.7.2 Search Vectors

**🟢 Beginner Example — single field vector**

**🟡 Intermediate Example — weighted fields**

**🔴 Expert Example — maintain `search_vector` column updated via trigger or Celery**

**🌍 Real-Time Example — SaaS docs site: headline vs body weights**

### 27.7.3 Search Queries

**🟢 Beginner Example — plain vs phrase**

**🟡 Intermediate Example — `&`, `|` operators composition**

**🔴 Expert Example — sanitize user input to prevent tsquery injection**

**🌍 Real-Time Example — social hashtag search combined with full-text body**

### 27.7.4 Elasticsearch Integration

**🟢 Beginner Example — index document JSON on save signal**

**🟡 Intermediate Example — django-elasticsearch-dsl**

**🔴 Expert Example — dual-write outbox + worker for consistency**

**🌍 Real-Time Example — e-commerce faceted navigation at scale**

### 27.7.5 Search Ranking

**🟢 Beginner Example — `order_by("-rank")`**

**🟡 Intermediate Example — boost in-stock products**

**🔴 Expert Example — learn-to-rank offline; online feature store**

**🌍 Real-Time Example — SaaS marketplace listing quality score**

---

## 27.8 Internationalization (i18n)

### 27.8.1 Translation Framework

**🟢 Beginner Example — `gettext` in Python**

```python
from django.utils.translation import gettext as _

message = _("Order confirmed")
```

**🟡 Intermediate Example — lazy translation in models**

```python
from django.utils.translation import gettext_lazy as _

class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
```

**🔴 Expert Example — contextual strings `pgettext`**

```python
from django.utils.translation import pgettext

label = pgettext("checkout", "Total")
```

**🌍 Real-Time Example — e-commerce VAT labels per region**

### 27.8.2 Message Files

**🟢 Beginner Example**

```bash
django-admin makemessages -l de
django-admin compilemessages
```

**🟡 Intermediate Example — domain-specific apps**

```bash
django-admin makemessages -l fr -d djangojs
```

**🔴 Expert Example — CI check for missing translations**

**🌍 Real-Time Example — SaaS community translators via PO file PRs**

### 27.8.3 Lazy Translations

**🟢 Beginner Example — `gettext_lazy` in model fields**

**🟡 Intermediate Example — form labels**

**🔴 Expert Example — avoid evaluating lazy proxies in JSON without str()**

**🌍 Real-Time Example — social: device locale vs profile language**

### 27.8.4 Language Middleware

**🟢 Beginner Example**

```python
MIDDLEWARE = [
    "django.middleware.locale.LocaleMiddleware",
    ...
]
```

**🟡 Intermediate Example — `LANGUAGES`, `LANGUAGE_CODE`, `LocaleMiddleware` order**

**🔴 Expert Example — cookie `django_language` + user preference merge**

**🌍 Real-Time Example — SaaS help center remembers language**

### 27.8.5 URL Localization

**🟢 Beginner Example — `i18n_patterns`**

```python
from django.conf.urls.i18n import i18n_patterns

urlpatterns += i18n_patterns(
    path("about/", about_view, name="about"),
    prefix_default_language=False,
)
```

**🟡 Intermediate Example — `set_language` view POST**

**🔴 Expert Example — hreflang tags in base template**

**🌍 Real-Time Example — e-commerce `/de/` vs `/en/` product URLs with translated slugs**

---

## Best Practices

- Prefer **composition** (services, policies) over **deep CBV** hierarchies unless reuse is real.
- Use **custom QuerySet + Manager** to encode query patterns once; avoid copy-paste filters.
- Choose **inheritance** deliberately: **abstract** for shared fields, **MTI** sparingly, **proxy** for behavior/views.
- Push heavy reporting to **annotations** / **materialized views** / **warehouse** as volume grows.
- Wrap **raw SQL** in repositories with **tests**; never interpolate user strings.
- Default to **`atomic()`** for multi-row business invariants; use **`on_commit`** for side effects.
- Pair **full-text** features with proper **indexes**; consider **Elasticsearch** when relevance + facets explode.
- Turn on **`LocaleMiddleware`** only when you ship multiple languages; keep **translations** in version control.

---

## Common Mistakes to Avoid

- **Mixin order** bugs breaking auth or context propagation.
- **Generic relations** without indexes → slow polymorphic joins.
- **Overusing multi-table inheritance** causing hidden joins.
- **annotate().filter()** misunderstanding (filter applies to SQL HAVING vs WHERE — know your ORM SQL).
- **Raw SQL** without tests → silent schema drift breaks production.
- **Long transactions** holding locks during external API calls.
- **`SearchVector` in hot path** without DB indexes.
- **Lazy gettext** serialized to JSON as proxy object by mistake.

---

## Comparison Tables

| Inheritance | DB tables | Use |
|-------------|-----------|-----|
| Abstract | 0 shared | Shared field defs |
| Multi-table | Parent + child rows | True subtype |
| Proxy | 0 | Same table, new Python API |

| SQL tool | When |
|----------|------|
| ORM | Default |
| `raw()` | Map rows to models |
| `cursor()` | DML/DDL, bulk ops |

| Isolation | Phantom reads | Use case |
|-----------|---------------|----------|
| Read committed | Possible | Default web apps |
| Serializable | Reduced | Hot inventory |

| Search | Complexity | Scale |
|--------|--------------|-------|
| icontains | Low | Small data |
| Postgres FTS | Medium | Moderate |
| Elasticsearch | High | Large / facets |

---

*Django **6.0.3** advanced topics — verify database-specific features against your engine version and support matrix.*
