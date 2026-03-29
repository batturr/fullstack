# Django Database Relationships — Reference Notes (Django 6.0.3)

Django’s ORM models **relationships** with `ForeignKey`, `OneToOneField`, and `ManyToManyField`, plus optional **through** models for extra pivot data. Understanding **`on_delete`**, **reverse accessors**, **self-relations**, and **signals** around cascades is essential for correct data modeling in **Django 6.0.3** on **Python 3.12–3.14**. These notes mirror a TypeScript-style reference: TOC, full subtopic coverage, and four example tiers per major concept.

---

## 📑 Table of Contents

1. [18.1 Foreign Key Relationships](#181-foreign-key-relationships)
2. [18.2 One-to-One Relationships](#182-one-to-one-relationships)
3. [18.3 Many-to-Many Relationships](#183-many-to-many-relationships)
4. [18.4 Reverse Relations](#184-reverse-relations)
5. [18.5 Self Relationships](#185-self-relationships)
6. [18.6 Relationship Signals](#186-relationship-signals)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 18.1 Foreign Key Relationships

### 18.1.1 ForeignKey Definition

**Concept:** Many-to-one from the declaring model to another model; creates `<field>_id` column.

#### 🟢 Beginner Example (simple, foundational)

```python
from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=200)

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=12, decimal_places=2)
```

#### 🟡 Intermediate Example (practical patterns)

```python
class Order(models.Model):
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.PROTECT,
        related_name="orders",
        related_query_name="order",
    )
```

#### 🔴 Expert Example (advanced usage)

```python
class Shipment(models.Model):
    order = models.ForeignKey(
        "shop.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="ord_id",
        db_constraint=False,  # cross-database / legacy integration — use with care
    )
```

#### 🌍 Real-Time Example (production / e-commerce)

`Order` → `Customer` FK with `PROTECT` on customer delete while legal holds exist; archival flow reassigns orders first.

### 18.1.2 on_delete Options

**Concept:** ORM behavior when the referenced row is deleted: `CASCADE`, `PROTECT`, `SET_NULL`, `SET_DEFAULT`, `SET(...)`, `DO_NOTHING`, `RESTRICT`.

#### 🟢 Beginner Example

```python
class Comment(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE)
```

#### 🟡 Intermediate Example

```python
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class Article(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
```

#### 🔴 Expert Example

```python
def set_system_user():
    return User.objects.get(username="system").pk

class AuditRecord(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET(set_system_user))
```

#### 🌍 Real-Time Example (SaaS)

`Subscription` → `Plan` with `PROTECT` if active subscriptions exist; admin must migrate plans before deletion.

### 18.1.3 Related Names

**Concept:** `related_name` sets the reverse attribute on the parent; `related_query_name` for lookups from parent queryset.

#### 🟢 Beginner Example

```python
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
```

#### 🟡 Intermediate Example

```python
User.objects.filter(posts__title__icontains="django")
```

#### 🔴 Expert Example

```python
class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    team = models.ForeignKey("Team", on_delete=models.CASCADE, related_name="memberships")

# related_query_name defaults to membership; customize for readability
```

#### 🌍 Real-Time Example

Social: `user.followers` / `user.following` with explicit `related_name` on two FKs to `User`.

### 18.1.4 Accessing Relations

**Concept:** Forward: `order.customer`; lazy fetch or cached after first access.

#### 🟢 Beginner Example

```python
o = Order.objects.get(pk=1)
print(o.customer.name)
```

#### 🟡 Intermediate Example

```python
o = Order.objects.select_related("customer").get(pk=1)
```

#### 🔴 Expert Example

```python
# Assignment
o.customer = new_customer
o.save(update_fields=["customer_id"])
```

#### 🌍 Real-Time Example

E-commerce checkout: `select_related("customer", "customer__default_address")` for single-query confirmation page.

### 18.1.5 Reverse Relations

**Concept:** Default `model_set`; overridden by `related_name`.

#### 🟢 Beginner Example

```python
c = Customer.objects.get(pk=1)
for order in c.order_set.all():
    print(order.total)
```

#### 🟡 Intermediate Example

```python
c.orders.all()  # with related_name="orders"
```

#### 🔴 Expert Example

```python
Customer.objects.annotate(order_count=models.Count("orders"))
```

#### 🌍 Real-Time Example

SaaS: `organization.users.count()` with indexed FK and annotated dashboards.

---

## 18.2 One-to-One Relationships

### 18.2.1 OneToOneField Definition

**Concept:** Like FK with **unique** constraint; reverse accessor is a single object, not a manager.

#### 🟢 Beginner Example

```python
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
```

#### 🟡 Intermediate Example

```python
class BillingAccount(models.Model):
    organization = models.OneToOneField(
        "orgs.Organization",
        on_delete=models.CASCADE,
        related_name="billing",
    )
```

#### 🔴 Expert Example

```python
class KYCRecord(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
```

#### 🌍 Real-Time Example

SaaS: one billing profile per workspace — enforce at DB with uniqueness.

### 18.2.2 Accessing Relations

**Concept:** `user.profile` may raise `Profile.DoesNotExist`; pattern `getattr` or `hasattr` vs explicit `RelatedObjectDoesNotExist`.

#### 🟢 Beginner Example

```python
profile = user.profile
```

#### 🟡 Intermediate Example

```python
from django.core.exceptions import ObjectDoesNotExist

try:
    bio = user.profile.bio
except ObjectDoesNotExist:
    bio = ""
```

#### 🔴 Expert Example

```python
Profile.objects.select_related("user").get(user_id=user_id)
```

#### 🌍 Real-Time Example

Social: lazy profile creation in signal vs required profile at signup — document which invariant you choose.

### 18.2.3 Reverse Accessors

**Concept:** From `User` to `Profile`: lowercase model name by default.

#### 🟢 Beginner Example

```python
u.profile
```

#### 🟡 Intermediate Example

```python
User.objects.select_related("profile")
```

#### 🔴 Expert Example

```python
User.objects.filter(profile__tier="pro")
```

#### 🌍 Real-Time Example

E-commerce: `Customer` ↔ `LoyaltyAccount` one-to-one; join in queryset for tier pricing.

### 18.2.4 Auto One-to-One

**Concept:** `parent_link=True` on multi-table inheritance child’s auto O2O to parent.

#### 🟢 Beginner Example

```python
class Place(models.Model):
    name = models.CharField(max_length=100)

class Restaurant(Place):
    serves_hot_dogs = models.BooleanField(default=False)
```

#### 🟡 Intermediate Example

MTI creates implicit O2O from `Restaurant` to `Place`.

#### 🔴 Expert Example

Customize with explicit `OneToOneField(Place, parent_link=True, ...)` when needed.

#### 🌍 Real-Time Example

SaaS product catalog: base `Product` + typed subclasses with shared PK.

### 18.2.5 Related Names

**Concept:** Avoid clashes when multiple O2O/FK to same model — use explicit `related_name`.

#### 🟢 Beginner Example

```python
class Driver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="driver_profile")

class Rider(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="rider_profile")
```

#### 🟡 Intermediate Example

Same for dual FK from `Message` to `User` as sender/recipient.

#### 🔴 Expert Example

```python
sender = models.ForeignKey(User, related_name="sent_messages", on_delete=models.CASCADE)
recipient = models.ForeignKey(User, related_name="received_messages", on_delete=models.CASCADE)
```

#### 🌍 Real-Time Example

Marketplace: buyer/seller both `User` — distinct `related_name` values required.

---

## 18.3 Many-to-Many Relationships

### 18.3.1 ManyToManyField

**Concept:** Implicit through table `<app>_<model>_<field>` unless `through` is set.

#### 🟢 Beginner Example

```python
class Topping(models.Model):
    name = models.CharField(max_length=50)

class Pizza(models.Model):
    name = models.CharField(max_length=100)
    toppings = models.ManyToManyField(Topping)
```

#### 🟡 Intermediate Example

```python
class Post(models.Model):
    tags = models.ManyToManyField("Tag", related_name="posts", blank=True)
```

#### 🔴 Expert Example

```python
class Group(models.Model):
    members = models.ManyToManyField(User, through="Membership", related_name="group_memberships")
```

#### 🌍 Real-Time Example

E-commerce: `Product` ↔ `Collection` M2M for curated storefronts.

### 18.3.2 Through Models

**Concept:** Extra columns on the pivot: role, joined_at, etc.

#### 🟢 Beginner Example

```python
class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey("Team", on_delete=models.CASCADE)
    role = models.CharField(max_length=20)

class Team(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, through=Membership, related_name="teams")
```

#### 🟡 Intermediate Example

```python
Membership.objects.create(user=u, team=t, role="admin")
```

#### 🔴 Expert Example

```python
class Team(models.Model):
    members = models.ManyToManyField(User, through="Membership")

class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "team"], name="uniq_membership"),
        ]
```

#### 🌍 Real-Time Example

SaaS: seat licensing with `seat_type` and `expires_at` on through model.

### 18.3.3 Adding / Removing Relations

**Concept:** `add`, `remove`, `clear`, `set` on descriptor; through with extra fields requires `through_defaults` or create through rows directly.

#### 🟢 Beginner Example

```python
pizza.toppings.add(pepperoni, mushrooms)
pizza.toppings.remove(mushrooms)
```

#### 🟡 Intermediate Example

```python
user.groups.set([g1, g2], clear=False)
```

#### 🔴 Expert Example

```python
post.tags.add(tag, through_defaults={"added_by": editor})
```

#### 🌍 Real-Time Example

Social: follow graph with timestamps via through — use `m2m_changed` or explicit `Follow.objects.create`.

### 18.3.4 Querying Relations

**Concept:** Forward `post.tags.filter(...)`; reverse `tag.posts.all()`; combine `Prefetch`.

#### 🟢 Beginner Example

```python
Post.objects.filter(tags__name="news").distinct()
```

#### 🟡 Intermediate Example

```python
Tag.objects.prefetch_related("posts")
```

#### 🔴 Expert Example

```python
Post.objects.filter(tags__in=interesting_tags).annotate(
    overlap=models.Count("tags", distinct=True),
).filter(overlap__gte=2)
```

#### 🌍 Real-Time Example

E-commerce: products in all selected categories using chained filter + annotate.

---

## 18.4 Reverse Relations

### 18.4.1 Accessing Reverse Relations

**Concept:** `<parent>.<related_name>_set` or custom `related_name`.

#### 🟢 Beginner Example

```python
author.posts.all()
```

#### 🟡 Intermediate Example

```python
author.posts.filter(published=True)
```

#### 🔴 Expert Example

```python
author.posts.values_list("slug", flat=True)
```

#### 🌍 Real-Time Example

SaaS: `workspace.projects.filter(archived=False)`.

### 18.4.2 Related Manager

**Concept:** `create`, `add` (M2M), `set`, etc., on reverse side.

#### 🟢 Beginner Example

```python
author.posts.create(title="Hello", body="...")
```

#### 🟡 Intermediate Example

```python
order.lines.create(product=p, quantity=2, unit_price=p.price)
```

#### 🔴 Expert Example

```python
# Reverse FK manager uses default FK field name
parent.children.model
```

#### 🌍 Real-Time Example

E-commerce: `order.lines.bulk_create([...])` for cart checkout.

### 18.4.3 Prefetch Related Objects

**Concept:** `prefetch_related("lines", "lines__product")` for efficient access.

#### 🟢 Beginner Example

```python
orders = Order.objects.prefetch_related("lines")
for o in orders:
    list(o.lines.all())  # no extra queries per order
```

#### 🟡 Intermediate Example

```python
Prefetch("lines", queryset=LineItem.objects.select_related("product"))
```

#### 🔴 Expert Example

```python
User.objects.prefetch_related(
    Prefetch("posts", queryset=Post.objects.filter(published=True), to_attr="published_posts"),
)
```

#### 🌍 Real-Time Example

Social: feed query prefetches `likes` and `author` for each post.

### 18.4.4 Filtering

**Concept:** Join via related name in `filter`.

#### 🟢 Beginner Example

```python
Author.objects.filter(posts__published_at__gte=week_ago).distinct()
```

#### 🟡 Intermediate Example

```python
Product.objects.filter(order__status="paid").distinct()
```

#### 🔴 Expert Example

```python
Customer.objects.alias(
    paid_total=models.Sum(
        "orders__total",
        filter=models.Q(orders__status="paid"),
    ),
).filter(paid_total__gte=1000)
```

#### 🌍 Real-Time Example

SaaS: organizations with at least one active subscription via reverse filter.

### 18.4.5 Exclude

**Concept:** `exclude` with joins mirrors filter semantics.

#### 🟢 Beginner Example

```python
User.objects.exclude(groups__name="Banned")
```

#### 🟡 Intermediate Example

```python
Product.objects.exclude(orderitem__isnull=False)
```

#### 🔴 Expert Example

```python
Team.objects.exclude(members__is_active=False)
```

#### 🌍 Real-Time Example

E-commerce: products never purchased — careful with NULL semantics vs `exclude` joins.

---

## 18.5 Self Relationships

### 18.5.1 Self Foreign Keys

**Concept:** `ForeignKey("self", ...)` for tree/graph edges.

#### 🟢 Beginner Example

```python
class Employee(models.Model):
    name = models.CharField(max_length=100)
    manager = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL)
```

#### 🟡 Intermediate Example

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE)
```

#### 🔴 Expert Example

```python
class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="children")
```

#### 🌍 Real-Time Example

SaaS: folder hierarchy for documents.

### 18.5.2 Tree Structures

**Concept:** Adjacency list (FK to parent) vs nested sets — Django common pattern is adjacency + recursive queries (CTEs) on PostgreSQL.

#### 🟢 Beginner Example

```python
def ancestors(category):
    while category.parent_id:
        category = category.parent
        yield category
```

#### 🟡 Intermediate Example

```python
from django.db.models import F

Category.objects.filter(path__startswith=parent.path)  # if materialized path field maintained
```

#### 🔴 Expert Example

```python
# django-treebeard or ltree extension for large trees
```

#### 🌍 Real-Time Example

E-commerce: category breadcrumbs with cached path string updated in `save()`.

### 18.5.3 Hierarchical Data

**Concept:** Depth limits, cycle prevention in `clean()` or DB constraints.

#### 🟢 Beginner Example

```python
def clean(self):
    if self.parent_id == self.pk:
        raise ValidationError("Cannot be own parent")
```

#### 🟡 Intermediate Example

Walk parents in loop to detect cycles before save.

#### 🔴 Expert Example

Closure table pattern for fast ancestry queries at scale.

#### 🌍 Real-Time Example

Org chart: prevent circular reporting lines in admin form validation.

### 18.5.4 Querying Self Relations

**Concept:** `children__children` nested lookups; `__in` with subqueries.

#### 🟢 Beginner Example

```python
Category.objects.filter(parent=root)
```

#### 🟡 Intermediate Example

```python
Category.objects.filter(parent__parent=root)
```

#### 🔴 Expert Example

Recursive CTE via `RawSQL` or `django-cte` package for deep subtrees.

#### 🌍 Real-Time Example

Social: threaded comments — fetch flat list ordered by `path` or `tree_id`.

### 18.5.5 Recursive Patterns

**Concept:** Signals or `save()` to maintain denormalized `depth`, `path`, or `sort` fields.

#### 🟢 Beginner Example

```python
@receiver(pre_save, sender=Category)
def set_depth(sender, instance, **kwargs):
    instance.depth = 0 if instance.parent_id is None else instance.parent.depth + 1
```

#### 🟡 Intermediate Example

Rebuild path on move:

```python
instance.path = f"{instance.parent.path}{instance.slug}/"
```

#### 🔴 Expert Example

Background job to rebuild entire tree materialized paths after bulk import.

#### 🌍 Real-Time Example

SaaS CMS: `materialized_path` for fast subtree listing in multi-tenant tables.

---

## 18.6 Relationship Signals

### 18.6.1 m2m_changed Signal

**Concept:** Hook M2M mutations for cache, audit, denormalization.

#### 🟢 Beginner Example

```python
from django.db.models.signals import m2m_changed

@receiver(m2m_changed, sender=User.groups.through)
def log_groups(sender, instance, action, pk_set, **kwargs):
    logger.info("m2m %s %s %s", action, instance, pk_set)
```

#### 🟡 Intermediate Example

```python
@receiver(m2m_changed, sender=Post.tags.through)
def bust_tag_cache(sender, instance, action, **kwargs):
    if action in ("post_add", "post_remove", "post_clear"):
        cache.delete(f"post:{instance.pk}:tags")
```

#### 🔴 Expert Example

Distinguish `pre_add` vs `post_add` for external sync — `post_add` after DB state committed for `add`.

#### 🌍 Real-Time Example

SaaS RBAC: recompute effective permissions cache on group M2M changes.

### 18.6.2 pre_delete with Relations

**Concept:** Before parent delete, inspect children; `on_delete` still governs DB outcome.

#### 🟢 Beginner Example

```python
@receiver(pre_delete, sender=Customer)
def block_if_open_orders(sender, instance, **kwargs):
    if instance.orders.exclude(status="shipped").exists():
        raise ValidationError("Open orders exist")
```

#### 🟡 Intermediate Example

Prefer `PROTECT` at FK level instead of raising in signal when possible.

#### 🔴 Expert Example

Soft-delete pattern: `pre_delete` cancel signal, replace with `deleted_at` update in service layer instead of true delete.

#### 🌍 Real-Time Example

E-commerce: never hard-delete customer with chargebacks — business rule in service + `PROTECT` on payment rows.

### 18.6.3 Cascade Behavior

**Concept:** `CASCADE` deletes dependents in same DELETE or follows DB cascades depending on collector.

#### 🟢 Beginner Example

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
# Deleting post deletes comments
```

#### 🟡 Intermediate Example

Understand order: `collect_objects` builds deletion graph.

#### 🔴 Expert Example

Circular FK with `SET_NULL` on one side to break cycles.

#### 🌍 Real-Time Example

SaaS tenant delete job: ordered deletion by dependency graph, not relying solely on implicit cascade timing for audit.

### 18.6.4 Protect Behavior

**Concept:** `ProtectedError` when deletion would orphan or violate protect.

#### 🟢 Beginner Example

```python
class LineItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
```

#### 🟡 Intermediate Example

```python
from django.db.models import ProtectedError

try:
    product.delete()
except ProtectedError:
    messages.error(request, "Product still referenced")
```

#### 🔴 Expert Example

Admin action: reassign line items before delete.

#### 🌍 Real-Time Example

Financial ledger lines `PROTECT` accounts from deletion.

### 18.6.5 Set Null

**Concept:** `SET_NULL` requires `null=True` on FK; reverse collections lose link.

#### 🟢 Beginner Example

```python
class Article(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
```

#### 🟡 Intermediate Example

```python
class Order(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
```

#### 🔴 Expert Example

```python
# SET with callable runs at deletion time
user = models.ForeignKey(User, on_delete=models.SET(get_deleted_user_placeholder))
```

#### 🌍 Real-Time Example

Social: posts remain when author account deleted but attributed to “deleted user” placeholder.

---

## Best Practices

- Choose `on_delete` from **data integrity** requirements, not convenience — `CASCADE` is not always correct.
- Always set explicit `related_name` when there are multiple FKs to the same model.
- Index foreign keys used in joins and filters (`db_index=True` default on FK).
- For M2M with business data, use `through` and enforce `UniqueConstraint` on pairs.
- Use `select_related` / `prefetch_related` appropriate to cardinality.
- Document invariants for O2O (create if missing vs required).
- For large trees, plan query strategy early (materialized path, closure, or extensions).
- Test `ProtectedError` and cascade paths in migrations that alter `on_delete`.

---

## Common Mistakes to Avoid

- Clashing related names → `Reverse accessor clashes` during system checks.
- `SET_NULL` without `null=True`.
- Using `related_name="+"` to hide reverse accessor then needing reverse queries later.
- M2M `add()` with extra through fields without `through_defaults` or manual through rows.
- `filter(parent=node)` tree queries without indexing or path strategy — slow at depth.
- Assuming `delete()` order across databases matches development SQLite behavior.
- `exclude` with joins misinterpreted for “does not have related” — often need `filter(related__isnull=True)` patterns carefully.
- Duplicate rows in implicit M2M when business requires uniqueness — add through + constraint.

---

## Comparison Tables

| Field | Cardinality | Reverse accessor |
|-------|-------------|------------------|
| `ForeignKey` | N:1 | Related manager (`_set` or `related_name`) |
| `OneToOneField` | 1:1 | Single object |
| `ManyToManyField` | N:M | Related manager on both sides |

| on_delete | When to use |
|-----------|-------------|
| `CASCADE` | Strong ownership, child meaningless alone |
| `PROTECT` | Prevent orphaning regulated data |
| `SET_NULL` | Keep child, optional link |
| `SET_DEFAULT` | Replace with default FK |
| `SET(callable)` | Placeholder / archive user |
| `RESTRICT` | DB-enforced protect (MySQL semantics differ) |
| `DO_NOTHING` | Expert/legacy; you manage integrity |

| Pattern | Pros | Cons |
|---------|------|------|
| Adjacency list | Simple | Deep subtree queries harder |
| Materialized path | Fast subtree reads | Writes on move |
| Closure table | Flexible queries | More storage |

| Signal | Use for |
|--------|---------|
| `m2m_changed` | Pivot audits, permission cache |
| `pre_delete` | Guardrails (prefer FK rules) |
| `post_delete` | External cleanup |

---

*Reference notes for **Django 6.0.3** relationship fields. Confirm `RESTRICT`/`DO_NOTHING` semantics on your database backend.*
