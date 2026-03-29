# Django ORM and Models (Django 6.0.3)

The Django ORM maps Python classes to relational tables, generates migrations, and exposes a rich query API. These notes cover model definition, field types and options, keys, `Meta`, managers, validation, and production patterns for e-commerce, social, and SaaS data models on **Python 3.12–3.14**.

---

## 📑 Table of Contents

1. [4.1 Model Basics](#41-model-basics)
2. [4.2 Field Types](#42-field-types)
3. [4.3 Field Options](#43-field-options)
4. [4.4 Primary Keys](#44-primary-keys)
5. [4.5 Custom Model Methods](#45-custom-model-methods)
6. [4.6 Model Meta Options](#46-model-meta-options)
7. [4.7 Advanced Model Features](#47-advanced-model-features)
8. [4.8 Model Validation](#48-model-validation)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 4.1 Model Basics

### Defining Models

Subclass **`django.db.models.Model`**. Each attribute that is a **`Field`** becomes a column (or relation).

#### 🟢 Beginner Example

```python
from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length=50)
```

#### 🟡 Intermediate Example — FK to User

```python
from django.conf import settings

class Comment(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

#### 🔴 Expert Example — Swappable dependency

```python
class Article(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="articles",
    )
```

#### 🌍 Real-Time Example — SaaS `Workspace`

```python
class Workspace(models.Model):
    name = models.CharField(max_length=80)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    plan = models.CharField(max_length=20, default="free")
```

---

### Model Fields

Fields define **column type**, **constraints**, and **form defaults**.

#### 🟢 Beginner Example

```python
class Product(models.Model):
    sku = models.CharField(max_length=32, unique=True)
    price_cents = models.PositiveIntegerField()
```

#### 🟡 Intermediate Example — Choices (text)

```python
class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
```

#### 🔴 Expert Example — `GeneratedField` (where supported / DB-specific)

```text
Use database-generated columns for derived values when your DB supports them;
verify Django version docs for `GeneratedField` availability and backends.
```

#### 🌍 Real-Time Example — E-commerce `Shipment`

```python
class Shipment(models.Model):
    order = models.ForeignKey("checkout.Order", on_delete=models.CASCADE)
    carrier = models.CharField(max_length=40)
    tracking_code = models.CharField(max_length=80, db_index=True)
```

---

### Meta Options

`class Meta:` configures table name, ordering, constraints, permissions.

#### 🟢 Beginner Example

```python
class Post(models.Model):
    title = models.CharField(max_length=200)

    class Meta:
        ordering = ["-id"]
```

#### 🟡 Intermediate Example — `indexes`

```python
class Event(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField()

    class Meta:
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]
```

#### 🔴 Expert Example — `constraints` + `UniqueConstraint` with condition

```python
class SeatReservation(models.Model):
    show = models.ForeignKey("events.Show", on_delete=models.CASCADE)
    seat = models.CharField(max_length=10)
    cancelled = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["show", "seat"],
                condition=models.Q(cancelled=False),
                name="uniq_active_seat_per_show",
            ),
        ]
```

#### 🌍 Real-Time Example — Social `Reaction`

```python
class Reaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey("posts.Post", on_delete=models.CASCADE)
    emoji = models.CharField(max_length=8)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "post"], name="one_reaction_per_user_post"),
        ]
```

---

### Model Inheritance

**Abstract base**, **multi-table**, and **proxy** models serve different reuse goals.

#### 🟢 Beginner Example — Abstract base

```python
class Timestamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

class Note(Timestamped):
    body = models.TextField()
```

#### 🟡 Intermediate Example — Multi-table parent/child

```python
class Place(models.Model):
    name = models.CharField(max_length=100)

class Restaurant(Place):
    serves_hot_dogs = models.BooleanField(default=False)
```

#### 🔴 Expert Example — Proxy for behavior-only subclass

```python
class OrderedProduct(Product):
    class Meta:
        proxy = True

    def margin_percent(self):
        return (self.price_cents - self.cost_cents) / self.price_cents * 100
```

#### 🌍 Real-Time Example — SaaS `BillableEntity`

```python
class BillableEntity(models.Model):
    external_id = models.CharField(max_length=64, unique=True)

class Subscription(BillableEntity):
    plan = models.CharField(max_length=40)
```

---

### Abstract Base Classes

Shared fields without a table—subclasses get copies of fields.

#### 🟢 Beginner Example

```python
class OwnedModel(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        abstract = True

class Photo(OwnedModel):
    url = models.URLField()
```

#### 🟡 Intermediate Example — Abstract + custom manager

```python
class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

class SoftDeletable(models.Model):
    is_active = models.BooleanField(default=True)
    objects = models.Manager()
    active = ActiveManager()

    class Meta:
        abstract = True
```

#### 🔴 Expert Example — Abstract inheritance chain

```text
Keep abstract trees shallow; document which fields each concrete model receives.
```

#### 🌍 Real-Time Example — E-commerce `PricedItem` ABC

```python
class PricedItem(models.Model):
    price_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="USD")

    class Meta:
        abstract = True
```

---

### Multi-table Inheritance

Child has **OneToOne** to parent row; joins span tables.

#### 🟢 Beginner Example

```python
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
```

> Prefer explicit `OneToOneField` over implicit multi-table inheritance when you want clarity.

#### 🟡 Intermediate Example — Access parent fields

```python
# Restaurant inherits Place — restaurant.place_ptr_id links rows
r = Restaurant.objects.select_related().get(pk=1)
print(r.name)  # from Place
```

#### 🔴 Expert Example — Performance caution

```text
Queries may JOIN parent table; use `select_related` on `place_ptr` patterns.
```

#### 🌍 Real-Time Example — Social verified creator profile

```python
class CreatorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    payout_iban = models.CharField(max_length=34)
```

---

## 4.2 Field Types

### AutoField / BigAutoField / Identity

Default PK is **`BigAutoField`** in modern Django projects.

#### 🟢 Beginner Example — Implicit PK

```python
class City(models.Model):
    name = models.CharField(max_length=80)
```

#### 🟡 Intermediate Example — Explicit `BigAutoField`

```python
class LegacyCounter(models.Model):
    id = models.BigAutoField(primary_key=True)
    value = models.IntegerField(default=0)
```

#### 🔴 Expert Example — Database defaults project-wide

```python
# settings.py
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
```

#### 🌍 Real-Time Example — High-volume events

```text
BigAutoField avoids 32-bit overflow for write-heavy analytics tables.
```

---

### CharField / TextField

**CharField** requires `max_length`. **TextField** for long content.

#### 🟢 Beginner Example

```python
class Article(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
```

#### 🟡 Intermediate Example — `db_collation` (database-specific)

```text
Use collations for case-insensitive unique constraints on PostgreSQL when needed.
```

#### 🔴 Expert Example — CITEXT (PostgreSQL extension)

```text
Enable extension via migration RunSQL; map to custom field or use functional unique index.
```

#### 🌍 Real-Time Example — Social post body

```python
class Post(models.Model):
    text = models.TextField(max_length=5000)  # optional max_length for form validation in some contexts
```

---

### IntegerField / BigIntegerField

Use **`PositiveIntegerField`** for counts and prices in cents.

#### 🟢 Beginner Example

```python
class Inventory(models.Model):
    on_hand = models.PositiveIntegerField(default=0)
```

#### 🟡 Intermediate Example — `BigIntegerField` for analytics

```python
class DailyMetric(models.Model):
    day = models.DateField()
    impressions = models.BigIntegerField(default=0)
```

#### 🔴 Expert Example — CheckConstraint for sane ranges

```python
class Discount(models.Model):
    percent = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(percent__lte=100), name="percent_lte_100"),
        ]
```

#### 🌍 Real-Time Example — E-commerce stock reservation

```python
class Stock(models.Model):
    product = models.OneToOneField("catalog.Product", on_delete=models.CASCADE)
    reserved = models.PositiveIntegerField(default=0)
    available = models.PositiveIntegerField(default=0)
```

---

### FloatField / DecimalField

Prefer **`DecimalField`** for money; avoid binary float rounding.

#### 🟢 Beginner Example — Money as integer cents (recommended)

```python
class Price(models.Model):
    amount_cents = models.PositiveIntegerField()
```

#### 🟡 Intermediate Example — `DecimalField`

```python
from django.db import models

class Quote(models.Model):
    total = models.DecimalField(max_digits=12, decimal_places=2)
```

#### 🔴 Expert Example — Rounding in Python layer

```python
from decimal import Decimal, ROUND_HALF_UP

def to_decimal_cents(s: str) -> Decimal:
    return (Decimal(s) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
```

#### 🌍 Real-Time Example — SaaS invoice line

```python
class InvoiceLine(models.Model):
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=4)
```

---

### BooleanField

Stores true/false; tri-state with **`null=True`** if needed.

#### 🟢 Beginner Example

```python
class FeatureFlag(models.Model):
    key = models.CharField(max_length=64, unique=True)
    enabled = models.BooleanField(default=False)
```

#### 🟡 Intermediate Example — Nullable bool

```python
class SurveyAnswer(models.Model):
    would_recommend = models.BooleanField(null=True, blank=True)
```

#### 🔴 Expert Example — Avoid tri-state unless domain requires unknown

```text
Prefer explicit enum (`UNKNOWN`, `YES`, `NO`) for clearer APIs.
```

#### 🌍 Real-Time Example — Social “muted” state

```python
class Membership(models.Model):
    muted = models.BooleanField(default=False)
```

---

### DateField / TimeField / DateTimeField

Use **`auto_now_add`** / **`auto_now`** or explicit defaults.

#### 🟢 Beginner Example

```python
class Task(models.Model):
    due_date = models.DateField()
```

#### 🟡 Intermediate Example — Timestamps

```python
class Audit(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 🔴 Expert Example — Time zones

```python
# settings.py
USE_TZ = True
TIME_ZONE = "UTC"
```

#### 🌍 Real-Time Example — E-commerce `Order`

```python
class Order(models.Model):
    placed_at = models.DateTimeField(auto_now_add=True)
```

---

### EmailField / URLField

Validated formats at form/API layer; DB stores strings.

#### 🟢 Beginner Example

```python
class Contact(models.Model):
    email = models.EmailField(unique=True)
    website = models.URLField(blank=True)
```

#### 🟡 Intermediate Example — Normalize email on save

```python
def save(self, *args, **kwargs):
    if self.email:
        self.email = self.email.lower()
    super().save(*args, **kwargs)
```

#### 🔴 Expert Example — Custom validator

```python
from django.core.validators import EmailValidator, RegexValidator

corp_validator = RegexValidator(regex=r".+@example\.com$", message="Must be corporate email.")

class Employee(models.Model):
    email = models.EmailField(validators=[EmailValidator(), corp_validator])
```

#### 🌍 Real-Time Example — SaaS billing email

```python
class BillingProfile(models.Model):
    invoice_email = models.EmailField()
```

---

### FileField / ImageField

Require **`MEDIA_ROOT`** / storage backend; **`ImageField`** needs Pillow.

#### 🟢 Beginner Example

```python
class Document(models.Model):
    file = models.FileField(upload_to="docs/%Y/%m/")
```

#### 🟡 Intermediate Example — `ImageField`

```python
class Avatar(models.Model):
    image = models.ImageField(upload_to="avatars/%Y/%m/")
```

#### 🔴 Expert Example — Dynamic `upload_to`

```python
def user_avatar_path(instance, filename):
    return f"avatars/{instance.user_id}/{filename}"

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=user_avatar_path, blank=True)
```

#### 🌍 Real-Time Example — E-commerce product media

```python
class ProductImage(models.Model):
    product = models.ForeignKey("catalog.Product", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="products/%Y/%m/")
    sort_order = models.PositiveSmallIntegerField(default=0)
```

---

## 4.3 Field Options

### `null` / `blank`

**null** = database NULL. **blank** = allowed empty in validation (forms/admin).

#### 🟢 Beginner Example

```python
class Profile(models.Model):
    nickname = models.CharField(max_length=40, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
```

#### 🟡 Intermediate Example — CharField null anti-pattern

```text
Avoid `null=True` on `CharField`; use empty string + `blank=True` instead.
```

#### 🔴 Expert Example — Partial unique with nulls (PostgreSQL)

```text
Multiple NULLs allowed in unique constraints—design accordingly.
```

#### 🌍 Real-Time Example — Social optional location

```python
class UserGeo(models.Model):
    city = models.CharField(max_length=80, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
```

---

### `choices`

Use **`TextChoices`** / **`IntegerChoices`** for clarity.

#### 🟢 Beginner Example

```python
class Coupon(models.Model):
    class Kind(models.TextChoices):
        PERCENT = "PERCENT", "Percent off"
        FIXED = "FIXED", "Fixed amount"

    kind = models.CharField(max_length=16, choices=Kind.choices)
```

#### 🟡 Intermediate Example — Integer choices

```python
class Priority(models.IntegerChoices):
    LOW = 1, "Low"
    HIGH = 10, "High"

class Ticket(models.Model):
    priority = models.SmallIntegerField(choices=Priority.choices, default=Priority.LOW)
```

#### 🔴 Expert Example — Migration-safe choice changes

```text
Add new values first, backfill rows, then remove old values in phased deploys.
```

#### 🌍 Real-Time Example — SaaS subscription status

```python
class Subscription(models.Model):
    class Status(models.TextChoices):
        TRIALING = "trialing", "Trialing"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past due"

    status = models.CharField(max_length=16, choices=Status.choices)
```

---

### `default` / callable defaults

Use **`default=value`** or **`default=callable`** (no arguments).

#### 🟢 Beginner Example

```python
class PageView(models.Model):
    count = models.PositiveIntegerField(default=0)
```

#### 🟡 Intermediate Example — Callable default (new dict/list per instance)

```python
import uuid

def new_uuid():
    return uuid.uuid4()

class ApiKey(models.Model):
    id = models.UUIDField(primary_key=True, default=new_uuid, editable=False)
```

> Django uses **`default=callable`**, not `default_factory=` like `dataclasses`.

#### 🔴 Expert Example — Mutable default pitfall

```text
Never `default={}`; use `default=dict` callable instead.
```

#### 🌍 Real-Time Example — E-commerce cart expiry

```python
from datetime import timedelta
from django.utils import timezone

def default_expiry():
    return timezone.now() + timedelta(hours=24)

class Cart(models.Model):
    expires_at = models.DateTimeField(default=default_expiry)
```

---

### `db_column` / `db_index`

Rename column or add index (also use **`Meta.indexes`**).

#### 🟢 Beginner Example — `db_index=True`

```python
class Session(models.Model):
    token = models.CharField(max_length=64, db_index=True)
```

#### 🟡 Intermediate Example — `db_column`

```python
class LegacyUser(models.Model):
    legacy_id = models.IntegerField(db_column="old_user_id")
```

#### 🔴 Expert Example — Partial index via `RunSQL`

```text
For advanced PG indexes, migrations may use `RunSQL` alongside model fields.
```

#### 🌍 Real-Time Example — Social hashtag search

```python
class Tag(models.Model):
    slug = models.SlugField(db_index=True, unique=True)
```

---

### `unique` / `unique_together` / constraints

Prefer **`UniqueConstraint`** in `Meta.constraints` over deprecated `unique_together` where possible.

#### 🟢 Beginner Example — `unique=True`

```python
class Country(models.Model):
    code = models.CharField(max_length=2, unique=True)
```

#### 🟡 Intermediate Example — `unique_together`

```python
class TeamMember(models.Model):
    team = models.ForeignKey("teams.Team", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = [("team", "user")]
```

#### 🔴 Expert Example — `UniqueConstraint` replacement

```python
class TeamMember(models.Model):
    team = models.ForeignKey("teams.Team", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["team", "user"], name="uniq_team_user"),
        ]
```

#### 🌍 Real-Time Example — SaaS seat licensing

```python
class Seat(models.Model):
    workspace = models.ForeignKey("tenants.Workspace", on_delete=models.CASCADE)
    email = models.EmailField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["workspace", "email"], name="uniq_seat_email_per_ws"),
        ]
```

---

### `validators` / `help_text` / `verbose_name`

Improve admin/forms and API documentation.

#### 🟢 Beginner Example

```python
from django.core.validators import MinValueValidator

class LineItem(models.Model):
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)], help_text="Minimum 1")
```

#### 🟡 Intermediate Example — `verbose_name`

```python
class Product(models.Model):
    name = models.CharField("display name", max_length=120)
```

#### 🔴 Expert Example — Composed validators

```python
from django.core.validators import RegexValidator

sku_validator = RegexValidator(regex=r"^[A-Z0-9-]+$", message="SKU must be uppercase alphanumeric.")

class SKUField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("max_length", 32)
        kwargs.setdefault("validators", [sku_validator])
        super().__init__(*args, **kwargs)
```

#### 🌍 Real-Time Example — E-commerce return window

```python
class ReturnPolicy(models.Model):
    days = models.PositiveSmallIntegerField(
        verbose_name="return window (days)",
        help_text="Business days customer may initiate a return.",
    )
```

---

## 4.4 Primary Keys

### AutoField / BigAutoField

Integer surrogate keys—simple joins and admin URLs.

#### 🟢 Beginner Example — Default

```python
class Note(models.Model):
    text = models.TextField()
```

#### 🟡 Intermediate Example — Explicit

```python
class Counter(models.Model):
    id = models.AutoField(primary_key=True)
    hits = models.PositiveIntegerField(default=0)
```

#### 🔴 Expert Example — Sharding consideration

```text
Surrogate keys are still fine; sharding uses tenant prefix or external IDs in APIs.
```

#### 🌍 Real-Time Example — Orders

```python
class Order(models.Model):
    # bigint id default
    total_cents = models.PositiveIntegerField()
```

---

### UUIDField as PK

Expose **opaque IDs** to clients; good for public APIs.

#### 🟢 Beginner Example

```python
import uuid
from django.db import models

class ApiEntity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=80)
```

#### 🟡 Intermediate Example — UUID `default=uuid.uuid4`

```python
class CheckoutSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart_id = models.UUIDField()
```

#### 🔴 Expert Example — DB default (PostgreSQL)

```text
Use `RunSQL` to set `DEFAULT gen_random_uuid()` and align Django field defaults.
```

#### 🌍 Real-Time Example — SaaS public resource URLs

```text
`/files/550e8400-e29b-41d4-a716-446655440000/` avoids sequential ID scraping.
```

---

### Custom PKs

Any unique field can be **`primary_key=True`**.

#### 🟢 Beginner Example — Slug PK

```python
class Channel(models.Model):
    slug = models.SlugField(primary_key=True)
    title = models.CharField(max_length=80)
```

#### 🟡 Intermediate Example — Natural keys for imports

```python
class Region(models.Model):
    code = models.CharField(max_length=6, primary_key=True)
```

#### 🔴 Expert Example — PK migration risk

```text
Changing PK type is painful; choose early or use surrogate + unique business key.
```

#### 🌍 Real-Time Example — E-commerce SKU as key (careful)

```python
class Sku(models.Model):
    code = models.CharField(max_length=32, primary_key=True)
```

---

### Composite Keys

Django **does not** natively support composite primary keys. Use **`UniqueConstraint`** + surrogate PK.

#### 🟢 Beginner Example — Surrogate + uniqueness

```python
class Follow(models.Model):
    id = models.BigAutoField(primary_key=True)
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="following", on_delete=models.CASCADE)
    followed = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="followers", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["follower", "followed"], name="uniq_follow"),
        ]
```

#### 🟡 Intermediate Example — Through model for M2M

```python
class Membership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey("auth.Group", on_delete=models.CASCADE)
    role = models.CharField(max_length=20)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "group"], name="uniq_user_group"),
        ]
```

#### 🔴 Expert Example — DB-level composite PK (not ORM-first)

```text
Avoid fighting the framework; integrate via raw SQL only in exceptional cases.
```

#### 🌍 Real-Time Example — Social graph edges

```text
Surrogate PK + unique pair enables ORM-friendly relations and admin.
```

---

## 4.5 Custom Model Methods

### `__str__` / `__repr__`

Improve admin and debugging output.

#### 🟢 Beginner Example

```python
class Product(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self) -> str:
        return self.name
```

#### 🟡 Intermediate Example — `__repr__` for dev

```python
class Product(models.Model):
    def __repr__(self) -> str:
        return f"<Product id={self.pk} name={self.name!r}>"
```

#### 🔴 Expert Example — Avoid heavy work in `__str__`

```text
Do not query relations in `__str__` (N+1 in admin lists).
```

#### 🌍 Real-Time Example — Order display

```python
class Order(models.Model):
    def __str__(self) -> str:
        return f"Order #{self.pk}"
```

---

### `get_absolute_url`

Canonical URL for the object; works with **`redirect()`** patterns.

#### 🟢 Beginner Example

```python
from django.urls import reverse

class Article(models.Model):
    slug = models.SlugField(unique=True)

    def get_absolute_url(self):
        return reverse("articles:detail", kwargs={"slug": self.slug})
```

#### 🟡 Intermediate Example — Use in templates

```html
<a href="{{ article.get_absolute_url }}">{{ article.title }}</a>
```

#### 🔴 Expert Example — `reverse` vs `reverse_lazy`

```text
Use `reverse_lazy` in module-level defaults (e.g., success_url on CBV attrs).
```

#### 🌍 Real-Time Example — E-commerce product page

```python
class Product(models.Model):
    slug = models.SlugField(unique=True)

    def get_absolute_url(self):
        return reverse("catalog:product", kwargs={"slug": self.slug})
```

---

### Custom Methods

Domain behavior on the model—keep heavy IO in services.

#### 🟢 Beginner Example

```python
class Cart(models.Model):
    def item_count(self) -> int:
        return self.items.count()
```

#### 🟡 Intermediate Example — Property

```python
class Product(models.Model):
    price_cents = models.PositiveIntegerField()
    cost_cents = models.PositiveIntegerField()

    @property
    def margin_cents(self) -> int:
        return self.price_cents - self.cost_cents
```

#### 🔴 Expert Example — `cached_property` for expensive compute

```python
from django.utils.functional import cached_property

class Post(models.Model):
    @cached_property
    def like_count(self) -> int:
        return self.likes.count()
```

#### 🌍 Real-Time Example — SaaS plan feature check

```python
class Workspace(models.Model):
    plan = models.CharField(max_length=20)

    def can_use_sso(self) -> bool:
        return self.plan in {"business", "enterprise"}
```

---

### `save()` Override

Enforce invariants, denormalize fields, or touch timestamps.

#### 🟢 Beginner Example — Normalize field

```python
class Tag(models.Model):
    name = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        self.name = self.name.strip().lower()
        super().save(*args, **kwargs)
```

#### 🟡 Intermediate Example — `update_fields`

```python
def save(self, *args, **kwargs):
    super().save(*args, **kwargs)
    if kwargs.get("update_fields") is not None and "search_vector" not in kwargs["update_fields"]:
        return
```

#### 🔴 Expert Example — Avoid recursive saves

```text
Guard denormalization updates; prefer signals or DB triggers for complex cases.
```

#### 🌍 Real-Time Example — E-commerce SKU generation

```python
import uuid

class Product(models.Model):
    sku = models.CharField(max_length=32, blank=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = uuid.uuid4().hex[:10].upper()
        super().save(*args, **kwargs)
```

---

## 4.6 Model Meta Options

### `verbose_name` / `verbose_name_plural`

Human labels in admin.

#### 🟢 Beginner Example

```python
class Mouse(models.Model):
    class Meta:
        verbose_name = "computer mouse"
        verbose_name_plural = "computer mice"
```

#### 🟡 Intermediate Example — Translation hooks

```python
from django.utils.translation import gettext_lazy as _

class Invoice(models.Model):
    class Meta:
        verbose_name = _("Invoice")
```

#### 🔴 Expert Example — Consistent naming across apps

```text
Use verbose names for customer-facing admin exports and reports.
```

#### 🌍 Real-Time Example — SaaS `AuditLog`

```python
class AuditLog(models.Model):
    class Meta:
        verbose_name = "audit log entry"
```

---

### `ordering`

Default order for queries and relations.

#### 🟢 Beginner Example

```python
class Comment(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
```

#### 🟡 Intermediate Example — Compound order

```python
class LeaderboardEntry(models.Model):
    class Meta:
        ordering = ["-score", "created_at"]
```

#### 🔴 Expert Example — `order_by()` overrides Meta

```python
Comment.objects.order_by("-like_count")  # explicit wins
```

#### 🌍 Real-Time Example — Social feed

```python
class Post(models.Model):
    class Meta:
        ordering = ["-published_at", "-id"]
```

---

### `get_latest_by`

Enables **`latest()`** / **`earliest()`** shortcuts.

#### 🟢 Beginner Example

```python
class Measurement(models.Model):
    taken_at = models.DateTimeField()

    class Meta:
        get_latest_by = "taken_at"
```

#### 🟡 Intermediate Example — Usage

```python
latest = SensorMeasurement.objects.latest()
```

#### 🔴 Expert Example — Prefer explicit `order_by` in critical code

```text
`latest()` can surprise if Meta changes; be explicit in payment code paths.
```

#### 🌍 Real-Time Example — SaaS usage meter

```python
class UsageRecord(models.Model):
    period_start = models.DateField()

    class Meta:
        get_latest_by = "period_start"
```

---

### `unique_together` / constraints / `db_table`

Custom table name for legacy DB integration.

#### 🟢 Beginner Example — `db_table`

```python
class LegacyCustomer(models.Model):
    name = models.CharField(max_length=120)

    class Meta:
        db_table = "cust_legacy"
```

#### 🟡 Intermediate Example — Constraints over `unique_together`

```python
class Seat(models.Model):
    flight = models.ForeignKey("travel.Flight", on_delete=models.CASCADE)
    code = models.CharField(max_length=4)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["flight", "code"], name="uniq_seat_per_flight"),
        ]
```

#### 🔴 Expert Example — Naming length limits

```text
Constraint names must fit DB identifier limits—keep concise.
```

#### 🌍 Real-Time Example — E-commerce multi-warehouse inventory

```python
class Stock(models.Model):
    warehouse = models.ForeignKey("logistics.Warehouse", on_delete=models.CASCADE)
    product = models.ForeignKey("catalog.Product", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["warehouse", "product"], name="uniq_stock_per_wh_product"),
        ]
```

---

## 4.7 Advanced Model Features

### Managers Overview

**`objects`** is the default manager; customize via **`Manager`** / **`QuerySet`**.

#### 🟢 Beginner Example — Default manager

```python
Product.objects.filter(is_active=True)
```

#### 🟡 Intermediate Example — Custom manager method

```python
class ActiveProductManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

class Product(models.Model):
    is_active = models.BooleanField(default=True)
    objects = models.Manager()
    active = ActiveProductManager()
```

#### 🔴 Expert Example — Chaining with `QuerySet` subclass

```python
class PostQuerySet(models.QuerySet):
    def published(self):
        return self.filter(published_at__isnull=False)

class PostManager(models.Manager.from_queryset(PostQuerySet)):
    pass

class Post(models.Model):
    objects = PostManager()
```

#### 🌍 Real-Time Example — SaaS `visible_to(user)`

```python
class DocumentQuerySet(models.QuerySet):
    def visible_to(self, user):
        return self.filter(models.Q(owner=user) | models.Q(shared_with=user))

class Document(models.Model):
    objects = models.Manager.from_queryset(DocumentQuerySet)()
```

---

### Custom Managers

Attach **domain queries** to models to avoid duplication.

#### 🟢 Beginner Example

```python
class PaidOrderManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status="PAID")
```

#### 🟡 Intermediate Example — Multiple managers

```python
class Order(models.Model):
    objects = models.Manager()
    paid = PaidOrderManager()
```

#### 🔴 Expert Example — `use_in_migrations = False` for ephemeral managers

```text
Rare; default manager used in migrations—be careful renaming managers.
```

#### 🌍 Real-Time Example — E-commerce `fulfillable()`

```python
class OrderQuerySet(models.QuerySet):
    def fulfillable(self):
        return self.filter(paid=True, cancelled=False)

class Order(models.Model):
    objects = OrderQuerySet.as_manager()
```

---

### QuerySet Methods

Chainable filters: **`filter`**, **`exclude`**, **`annotate`**, etc. (see Database Queries notes).

#### 🟢 Beginner Example

```python
Product.objects.filter(price_cents__lte=2000)
```

#### 🟡 Intermediate Example — `select_related`

```python
Order.objects.select_related("user").all()
```

#### 🔴 Expert Example — `defer` / `only`

```python
User.objects.only("id", "email")
```

#### 🌍 Real-Time Example — Social notifications digest

```python
Notification.objects.filter(user=u, read=False).order_by("-created_at")[:50]
```

---

### Model Properties

Use **`@property`** for derived attributes; **`cached_property`** when expensive.

#### 🟢 Beginner Example

```python
class Rectangle(models.Model):
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()

    @property
    def area(self) -> int:
        return self.width * self.height
```

#### 🟡 Intermediate Example — Formatting

```python
class MoneyCents(models.Model):
    amount_cents = models.IntegerField()

    @property
    def display(self) -> str:
        return f"${self.amount_cents / 100:.2f}"
```

#### 🔴 Expert Example — Don’t hit DB in property without care

```text
Properties used in templates can cause N+1—prefetch or annotate instead.
```

#### 🌍 Real-Time Example — SaaS seat usage

```python
class Subscription(models.Model):
    seat_limit = models.PositiveIntegerField()

    @property
    def seats_remaining(self) -> int:
        used = self.seat_assignments.count()
        return max(self.seat_limit - used, 0)
```

---

### Model Signals

**`pre_save`**, **`post_save`**, **`m2m_changed`**, etc.—powerful but easy to abuse.

#### 🟢 Beginner Example — `post_save` receiver

```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
```

#### 🟡 Intermediate Example — Idempotent side effects

```python
@receiver(post_save, sender=Order)
def enqueue_fulfillment(sender, instance, **kwargs):
    if instance.status == Order.Status.PAID:
        fulfillment_tasks.schedule(instance.id)
```

#### 🔴 Expert Example — Prefer explicit service calls for money paths

```text
Signals hide control flow; for payments, call services directly + transactions.
```

#### 🌍 Real-Time Example — E-commerce search index

```python
@receiver(post_save, sender=Product)
def index_product(sender, instance, **kwargs):
    search_index.upsert_product.delay(instance.id)
```

---

## 4.8 Model Validation

### Field Validation

Field **`validators`** and built-in checks.

#### 🟢 Beginner Example

```python
from django.core.validators import MaxValueValidator

class Review(models.Model):
    rating = models.PositiveSmallIntegerField(validators=[MaxValueValidator(5)])
```

#### 🟡 Intermediate Example — `EmailField` implicit validator

```python
class Subscriber(models.Model):
    email = models.EmailField()
```

#### 🔴 Expert Example — Database constraints vs validators

```text
Validators are not DB-enforced; add `CheckConstraint` for integrity at rest.
```

#### 🌍 Real-Time Example — SaaS subdomain

```python
from django.core.validators import RegexValidator

subdomain_validator = RegexValidator(
    regex=r"^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$",
    message="Invalid subdomain",
)

class Tenant(models.Model):
    subdomain = models.CharField(max_length=32, validators=[subdomain_validator], unique=True)
```

---

### Model-level Validation

Override **`clean()`** for cross-field rules.

#### 🟢 Beginner Example

```python
from django.core.exceptions import ValidationError

class Range(models.Model):
    start = models.DateField()
    end = models.DateField()

    def clean(self):
        super().clean()
        if self.end < self.start:
            raise ValidationError("end must be on or after start")
```

#### 🟡 Intermediate Example — `validate_unique`

```python
class Coupon(models.Model):
    code = models.CharField(max_length=40)

    def validate_unique(self, exclude=None):
        super().validate_unique(exclude=exclude)
        if self.code.lower() in DENYLIST:
            raise ValidationError({"code": "This coupon code is reserved."})
```

#### 🔴 Expert Example — `full_clean()` in forms vs save()

```text
`Model.save()` does not call `full_clean()` by default; forms/admin do.
```

#### 🌍 Real-Time Example — E-commerce bundle pricing

```python
class Bundle(models.Model):
    price_cents = models.PositiveIntegerField()
    product_a = models.ForeignKey("catalog.Product", on_delete=models.CASCADE)
    product_b = models.ForeignKey("catalog.Product", on_delete=models.CASCADE, related_name="+")

    def clean(self):
        floor = self.product_a.price_cents + self.product_b.price_cents
        if self.price_cents > floor:
            raise ValidationError("Bundle price cannot exceed sum of parts.")
```

---

### `clean()` Method

Central place for object-wide validation before saving via forms.

#### 🟢 Beginner Example

```python
class UserProfile(models.Model):
    age = models.PositiveIntegerField(null=True, blank=True)

    def clean(self):
        super().clean()
        if self.age is not None and self.age < 13:
            raise ValidationError("Must be 13+")
```

#### 🟡 Intermediate Example — Access related data carefully

```python
def clean(self):
    if self.team_id and self.user_id:
        if not self.team.members.filter(pk=self.user_id).exists():
            raise ValidationError("User is not a member of the team.")
```

#### 🔴 Expert Example — Async validators

```text
`clean()` must stay synchronous; move IO validation to form/service layers.
```

#### 🌍 Real-Time Example — Social NSFW + age gate

```python
def clean(self):
    if self.nsfw and (self.author.profile.age or 0) < 18:
        raise ValidationError("NSFW not allowed for this account.")
```

---

### Validators / Custom Validators

Callables: **`value`** → raise **`ValidationError`** if invalid.

#### 🟢 Beginner Example

```python
from django.core.exceptions import ValidationError

def even_only(value: int):
    if value % 2:
        raise ValidationError("Must be an even number.")

class DiceRoll(models.Model):
    value = models.PositiveSmallIntegerField(validators=[even_only])
```

#### 🟡 Intermediate Example — Parameterized validator factory

```python
def max_length_words(max_words: int):
    def validator(value: str):
        if len(value.split()) > max_words:
            raise ValidationError(f"Max {max_words} words.")
    return validator

class Tweet(models.Model):
    text = models.CharField(max_length=280, validators=[max_length_words(50)])
```

#### 🔴 Expert Example — Reusable validator in app `validators.py`

```text
Centralize validators to keep models thin and test them in isolation.
```

#### 🌍 Real-Time Example — SaaS strong password (duplicate of auth validators)

```python
from django.contrib.auth.password_validation import validate_password

def django_password_validator(value):
    validate_password(value)  # raises ValidationError
```

---

## Best Practices

- Prefer **integer cents** or **Decimal** for money; document rounding rules.
- Use **`constraints`** for integrity; don’t rely only on application checks.
- Avoid **signals** for critical transactional logic; prefer explicit services.
- Add **`indexes`** for real filter/sort patterns—verify with `EXPLAIN`.
- Use **`select_related` / `prefetch_related`** at call sites, not hidden in `__str__`.
- Keep **`save()`** overrides simple; use **`update_fields`** when possible.
- Plan **PK strategy** (int vs UUID) before public API launch.

---

## Common Mistakes to Avoid

- **`null=True` on CharField** causing two “empty” representations.
- **Mutable defaults** (`default=[]`, `default={}`).
- **Composite PK** expectations—Django wants a single PK column.
- **Validation only in forms** while admin/scripts bypass and corrupt data.
- **Heavy work in properties** used in templates → N+1 queries.
- **Overusing multi-table inheritance** without understanding JOIN costs.
- **Migrations** that add non-nullable columns without backfill strategy.

---

## Comparison Tables

### Field type quick pick

| Need            | Prefer            |
| --------------- | ----------------- |
| Money           | `DecimalField` or cents `IntegerField` |
| Long text       | `TextField`       |
| Short label     | `CharField`       |
| True/false      | `BooleanField`    |
| File uploads    | `FileField`/`ImageField` |
| Public object id| `UUIDField`       |

### Inheritance strategies

| Type      | Table        | Use case                 |
| --------- | ------------ | ------------------------ |
| Abstract  | None (ABC)   | Shared field definitions |
| MTI       | Parent+child | True “is-a” relational modeling |
| Proxy     | Same table   | Behavior/alternate managers |

### Validation layers

| Layer        | Enforced when                    |
| ------------ | -------------------------------- |
| Field valid. | Forms/model `full_clean`       |
| `clean()`    | `full_clean()`                   |
| DB constraint| Any insert/update path           |

---

*ORM behavior can vary slightly by database backend—always run migrations against **staging** that mirrors production (PostgreSQL recommended for serious products).*
