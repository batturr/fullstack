# Django Best Practices and Design Patterns

This closing reference distills how experienced teams structure Django **6.0.3** projects: where code lives, how models encapsulate data rules, how views stay thin, how forms stay reusable, how tests stay trustworthy, which object-oriented patterns map cleanly to web apps, which performance idioms matter, and how Python’s ethos shows up in Django. Examples escalate from small snippets to **e-commerce**, **social**, and **SaaS** production shapes, each major idea using the four-tier pattern.

---

## 📑 Table of Contents

1. [28.1 Code Organization](#281-code-organization)
2. [28.2 Model Design](#282-model-design)
3. [28.3 View Patterns](#283-view-patterns)
4. [28.4 Form Patterns](#284-form-patterns)
5. [28.5 Testing Patterns](#285-testing-patterns)
6. [28.6 Design Patterns](#286-design-patterns)
7. [28.7 Performance Patterns](#287-performance-patterns)
8. [28.8 Django Best Practices (Principles)](#288-django-best-practices-principles)
9. [Best Practices (Summary)](#best-practices-summary)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 28.1 Code Organization

### 28.1.1 Project Structure

**🟢 Beginner Example — default layout**

```text
proj/
  manage.py
  proj/
    settings.py
    urls.py
    wsgi.py
  shop/
    models.py
    views.py
    urls.py
```

**🟡 Intermediate Example — settings package**

```text
proj/settings/
  __init__.py   # imports prod or local based on env
  base.py
  local.py
  prod.py
```

**🔴 Expert Example — domain packages inside app**

```text
shop/
  models/
    __init__.py
    product.py
    order.py
  services/
    checkout.py
  api/
    serializers.py
    views.py
```

**🌍 Real-Time Example — SaaS monorepo: `billing/`, `identity/`, `core/` apps with shared `lib/`**

### 28.1.2 App Organization

**🟢 Beginner Example — one app per bounded context**

```text
catalog/   # products, categories
cart/      # session cart, lines
orders/    # checkout, payments
```

**🟡 Intermediate Example — avoid circular imports via `services` layer**

**🔴 Expert Example — `apps.py` `ready()` for sane signal registration**

```python
class CatalogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "catalog"

    def ready(self):
        from . import signals  # noqa: F401
```

**🌍 Real-Time Example — e-commerce split `fulfillment` from `catalog` for team ownership**

### 28.1.3 Module Splitting

**🟢 Beginner Example — `utils.py` for small helpers**

**🟡 Intermediate Example — split when >300 lines or distinct concern**

```text
shop/
  pricing.py
  tax.py
  shipping.py
```

**🔴 Expert Example — explicit public API in `__init__.py`**

```python
from .checkout import place_order

__all__ = ["place_order"]
```

**🌍 Real-Time Example — social: `moderation/rules.py` vs `moderation/actions.py`**

### 28.1.4 Naming Conventions

**🟢 Beginner Example — PEP 8: `snake_case` functions, `CapWords` classes**

**🟡 Intermediate Example — model names singular `Order`, table `shop_order`**

**🔴 Expert Example — consistent suffixes: `*Serializer`, `*ViewSet`, `*Service`, `*Policy`**

**🌍 Real-Time Example — SaaS DRF modules mirror domain language (`Invoice`, `Subscription`)**

### 28.1.5 Code Comments

**🟢 Beginner Example — explain why, not what**

```python
# Stripe requires idempotency keys on retries; we hash order id + attempt.
```

**🟡 Intermediate Example — module docstring for non-obvious invariants**

**🔴 Expert Example — ADR link for architectural decisions**

```python
# See docs/adr/0007-checkout-saga.md
```

**🌍 Real-Time Example — e-commerce tax engine: jurisdiction quirks documented beside formula**

---

## 28.2 Model Design

### 28.2.1 Model Relationships

**🟢 Beginner Example — FK vs M2M**

```python
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class Post(models.Model):
    tags = models.ManyToManyField("Tag")
```

**🟡 Intermediate Example — `through` model for extra columns**

```python
class Membership(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

class Group(models.Model):
    members = models.ManyToManyField(Person, through=Membership)
```

**🔴 Expert Example — soft-delete cascades policy**

```python
user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
```

**🌍 Real-Time Example — SaaS `Organization` ← `Project` ← `Environment` hierarchy**

### 28.2.2 Model Methods

**🟢 Beginner Example — `__str__`**

```python
def __str__(self):
    return self.name
```

**🟡 Intermediate Example — domain behavior**

```python
class Cart(models.Model):
    def total_cents(self) -> int:
        return sum(line.line_total_cents() for line in self.lines.all())
```

**🔴 Expert Example — avoid queries in `__str__` for admin list performance**

**🌍 Real-Time Example — e-commerce `Order.can_cancel()` encodes business rules**

### 28.2.3 Manager Usage

**🟢 Beginner Example — custom manager queryset**

```python
class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(published=True)
```

**🟡 Intermediate Example — multiple managers**

```python
objects = models.Manager()
published = PublishedManager()
```

**🔴 Expert Example — document which manager admin uses**

**🌍 Real-Time Example — social `VisiblePost.objects` hides blocked authors**

### 28.2.4 Validation Placement

**🟢 Beginner Example — `clean()` on model**

```python
from django.core.exceptions import ValidationError

class Coupon(models.Model):
    percent = models.PositiveIntegerField()
    fixed_cents = models.PositiveIntegerField()

    def clean(self):
        super().clean()
        if self.percent and self.fixed_cents:
            raise ValidationError("Choose percent or fixed amount.")
```

**🟡 Intermediate Example — constraints at DB level**

```python
class Meta:
    constraints = [
        models.CheckConstraint(
            check=models.Q(percent=0) | models.Q(fixed_cents=0),
            name="coupon_single_discount_type",
        ),
    ]
```

**🔴 Expert Example — serializer validation for API-specific rules; model for global invariants**

**🌍 Real-Time Example — SaaS plan limits validated in service + DB constraint for race safety**

### 28.2.5 Signal Usage

**🟢 Beginner Example — denormalize counter**

```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Comment)
def bump_comment_count(sender, instance, **kwargs):
    Post.objects.filter(pk=instance.post_id).update(comment_count=F("comment_count") + 1)
```

**🟡 Intermediate Example — `transaction.on_commit` for side effects**

**🔴 Expert Example — avoid signal spaghetti; prefer explicit service calls when team grows**

**🌍 Real-Time Example — e-commerce search index enqueue on product save**

---

## 28.3 View Patterns

### 28.3.1 Thin Views, Fat Models

**🟢 Beginner Example — view delegates totals**

```python
def cart_detail(request):
    cart = request.user.cart
    return render(request, "cart.html", {"cart": cart, "total": cart.total_cents()})
```

**🟡 Intermediate Example — fat model limits**

```python
# Models: single-table invariants. Cross-aggregate workflows → service.
```

**🔴 Expert Example — fat services for orchestration**

```python
def checkout_view(request):
    order = checkout_service.place_from_cart(request.user)
    return redirect("order_detail", order.id)
```

**🌍 Real-Time Example — SaaS provisioning spans billing + IAM + DB — service, not view**

### 28.3.2 Service Layer

**🟢 Beginner Example — module of functions**

```python
# shop/services/checkout.py
def place_order(user, address_id):
    ...
```

**🟡 Intermediate Example — class with dependencies**

```python
class CheckoutService:
    def __init__(self, payments, inventory):
        self.payments = payments
        self.inventory = inventory

    def place(self, user, cart):
        ...
```

**🔴 Expert Example — unit test services without HTTP**

**🌍 Real-Time Example — e-commerce `RefundService` reused by admin action + API + task**

### 28.3.3 View Documentation

**🟢 Beginner Example — docstring on non-obvious class-based view**

**🟡 Intermediate Example — OpenAPI description on DRF viewset**

**🔴 Expert Example — link to product spec / Figma for UX-heavy flows**

**🌍 Real-Time Example — social algorithmic feed: doc explains ranking inputs**

### 28.3.4 Error Handling

**🟢 Beginner Example — `get_object_or_404`**

```python
from django.shortcuts import get_object_or_404

product = get_object_or_404(Product, pk=pk, org=request.user.org)
```

**🟡 Intermediate Example — custom `Http404` message**

**🔴 Expert Example — map domain exceptions to HTTP in DRF exception handler**

**🌍 Real-Time Example — SaaS `PlanLimitExceeded` → 402 with upgrade hints**

### 28.3.5 Permission Handling

**🟢 Beginner Example — `PermissionRequiredMixin`**

```python
class ReportView(PermissionRequiredMixin, TemplateView):
    permission_required = "shop.view_sales_report"
```

**🟡 Intermediate Example — object-level checks in detail view**

**🔴 Expert Example — central policy module**

```python
def can_edit_project(user, project):
    return user.is_staff or project.owner_id == user.id
```

**🌍 Real-Time Example — e-commerce vendor portal: vendor sees only their SKUs**

---

## 28.4 Form Patterns

### 28.4.1 Form Reuse

**🟢 Beginner Example — subclass tweak labels**

```python
class ShortSignupForm(SignupForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"].label = "Work email"
```

**🟡 Intermediate Example — compose fields via inheritance**

**🔴 Expert Example — shared `Meta.widgets` dict constant**

**🌍 Real-Time Example — SaaS billing address form reused in checkout + settings**

### 28.4.2 Form Inheritance

**🟢 Beginner Example**

```python
class BaseContactForm(forms.Form):
    email = forms.EmailField()

class SupportForm(BaseContactForm):
    message = forms.CharField(widget=forms.Textarea)
```

**🟡 Intermediate Example — `ModelForm` inheritance adds optional company field**

**🔴 Expert Example — watch `Meta` class merging (children must declare `Meta` explicitly)**

**🌍 Real-Time Example — e-commerce guest vs authenticated checkout forms**

### 28.4.3 Form Validation

**🟢 Beginner Example — field `clean_<field>`**

**🟡 Intermediate Example — cross-field `clean()`**

**🔴 Expert Example — async-unfriendly: keep external API checks in tasks or services with UX polling**

**🌍 Real-Time Example — social username reserved list + profanity filter**

### 28.4.4 Error Messages

**🟢 Beginner Example — `error_messages` dict**

```python
slug = models.SlugField(
    error_messages={"invalid": "Use letters, numbers, and hyphens only."}
)
```

**🟡 Intermediate Example — i18n with `_()`**

**🔴 Expert Example — field-level vs non-field errors in templates (`{{ form.non_field_errors }}`)**

**🌍 Real-Time Example — SaaS password policy messages aligned with auth backend validators**

### 28.4.5 Form Documentation

**🟢 Beginner Example — help_text on fields**

**🟡 Intermediate Example — crispy/forms layout as UI contract**

**🔴 Expert Example — designer-facing Storybook for complex widgets**

**🌍 Real-Time Example — e-commerce return form explains restocking fee rules**

---

## 28.5 Testing Patterns

### 28.5.1 Test Organization

**🟢 Beginner Example — `tests.py` per app**

**🟡 Intermediate Example — package**

```text
shop/tests/
  test_models.py
  test_views.py
  test_api.py
```

**🔴 Expert Example — mirror package structure under tests**

**🌍 Real-Time Example — SaaS split `contract/` tests for public API compatibility**

### 28.5.2 Test Fixtures

**🟢 Beginner Example — `setUp` data**

```python
def setUp(self):
    self.user = User.objects.create_user("u", password="x")
```

**🟡 Intermediate Example — `fixtures.json` (use sparingly)**

**🔴 Expert Example — factories (factory_boy)**

```python
import factory

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Sequence(lambda n: f"user{n}")
```

**🌍 Real-Time Example — e-commerce catalog: factory creates product with variants**

### 28.5.3 Factory Pattern

(See factories above.)

**🟢 Beginner Example — static `build()` helpers**

**🟡 Intermediate Example — traits `UserFactory(admin=True)`**

**🔴 Expert Example — factory boy `post_generation` for M2M**

**🌍 Real-Time Example — social graph: `FriendshipFactory` ensures symmetric edges**

### 28.5.4 Mock Usage

**🟢 Beginner Example — patch external HTTP**

```python
from unittest.mock import patch

@patch("myapp.services.geo.lookup")
def test_locale(mock_lookup):
    mock_lookup.return_value = "DE"
```

**🟡 Intermediate Example — patch at import path used by subject**

**🔴 Expert Example — avoid mocking the ORM; use real DB (pytest-django)**

**🌍 Real-Time Example — SaaS Stripe client patched in payment tests**

### 28.5.5 Test Coverage

**🟢 Beginner Example — `coverage run manage.py test`**

**🟡 Intermediate Example — gate CI at 80% line coverage on critical apps**

**🔴 Expert Example — cover service layer branches, not just happy path views**

**🌍 Real-Time Example — e-commerce pricing: table-driven tests for tax matrix**

---

## 28.6 Design Patterns

### 28.6.1 Repository Pattern

**🟢 Beginner Example — functions wrapping ORM**

```python
class ProductRepository:
    def get_active(self):
        return Product.objects.filter(active=True)
```

**🟡 Intermediate Example — swap implementation for integration tests**

**🔴 Expert Example — combine with Unit of Work for transactions**

**🌍 Real-Time Example — SaaS multi-tenant raw SQL reports isolated in `ReportingRepository`**

### 28.6.2 Service Layer Pattern

(Covered in 28.3.2.)

**🟢 Beginner Example — `register_user()` function**

**🟡 Intermediate Example — `BillingService`**

**🔴 Expert Example — idempotent operations with explicit inputs/outputs (dataclasses)**

**🌍 Real-Time Example — e-commerce `InventoryService.adjust_stock()`**

### 28.6.3 Strategy Pattern

**🟢 Beginner Example — dict dispatch**

```python
def tax_for(country):
    strategies = {"US": us_tax, "DE": de_vat}
    return strategies[country]
```

**🟡 Intermediate Example — class-based strategies**

```python
class TaxStrategy(Protocol):
    def compute(self, cart) -> int: ...

class USTax:
    def compute(self, cart) -> int:
        ...
```

**🔴 Expert Example — plugin registry for payment providers**

**🌍 Real-Time Example — SaaS feature modules enabled per plan**

### 28.6.4 Observer Pattern

**🟢 Beginner Example — Django signals**

**🟡 Intermediate Example — domain events list appended in service, published `on_commit`**

**🔴 Expert Example — event bus (Redis streams / Kafka) for cross-service observers**

**🌍 Real-Time Example — social: `UserFollowed` event triggers recommendations refresh**

### 28.6.5 Factory Pattern

**🟢 Beginner Example — `@classmethod create_guest()` on model**

```python
class Order(models.Model):
    @classmethod
    def create_guest_order(cls, email):
        return cls.objects.create(user=None, guest_email=email)
```

**🟡 Intermediate Example — separate `OrderFactory` service constructing aggregates**

**🔴 Expert Example — abstract factory for A/B pricing experiments**

**🌍 Real-Time Example — e-commerce `CartFactory.from_session()`**

---

## 28.7 Performance Patterns

### 28.7.1 Lazy Loading

**🟢 Beginner Example — template lazy access**

```django
{% for line in order.lines.all %}
```

**🟡 Intermediate Example — generator views streaming CSV**

**🔴 Expert Example — explicit `iterator()` for exports**

**🌍 Real-Time Example — SaaS audit log UI loads detail pane via HTMX**

### 28.7.2 Eager Loading

**🟢 Beginner Example — `select_related` in view**

```python
qs = Order.objects.select_related("user")
```

**🟡 Intermediate Example — `prefetch_related` with custom queryset**

**🔴 Expert Example — `Prefetch` object with `to_attr`**

```python
pref = Prefetch("lines", queryset=Line.objects.select_related("product"), to_attr="cached_lines")
```

**🌍 Real-Time Example — e-commerce order admin list**

### 28.7.3 Caching Pattern

**🟢 Beginner Example — view `cache_page`**

**🟡 Intermediate Example — low-level `cache.get_or_set`**

**🔴 Expert Example — cache aside with version bump**

**🌍 Real-Time Example — social trending topics 60s TTL**

### 28.7.4 Pagination Pattern

**🟢 Beginner Example — `Paginator` in FBV**

```python
from django.core.paginator import Paginator

page = Paginator(qs, 25).get_page(request.GET.get("page"))
```

**🟡 Intermediate Example — DRF cursor pagination**

**🔴 Expert Example — keyset pagination for APIs**

**🌍 Real-Time Example — SaaS log explorer**

### 28.7.5 Async Pattern

**🟢 Beginner Example — async view fan-out HTTP**

**🟡 Intermediate Example — `sync_to_async` around ORM**

**🔴 Expert Example — push CPU work to Celery; keep async view I/O only**

**🌍 Real-Time Example — e-commerce availability check aggregates vendor APIs concurrently**

---

## 28.8 Django Best Practices (Principles)

### 28.8.1 DRY (Don’t Repeat Yourself)

**🟢 Beginner Example — reuse form class instead of duplicating fields**

**🟡 Intermediate Example — template partials `{% include %}`**

**🔴 Expert Example — duplication better than wrong abstraction — wait for third use case**

**🌍 Real-Time Example — SaaS duplicate validation in admin + API → move to model `clean()` + constraints**

### 28.8.2 Explicit Is Better Than Implicit

**🟢 Beginner Example — name URL patterns**

```python
path("orders/<int:pk>/", OrderDetail.as_view(), name="order_detail")
```

**🟡 Intermediate Example — avoid magic settings reads deep in library code**

**🔴 Expert Example — dependency injection over hidden global state**

**🌍 Real-Time Example — e-commerce explicit `ShippingMethod` enum vs stringly typed**

### 28.8.3 KISS (Keep It Simple, Stupid)

**🟢 Beginner Example — FBV before CBV if shorter**

**🟡 Intermediate Example — avoid micro-packages for 10 lines**

**🔴 Expert Example — YAGNI overlap: don’t build rules engine until rules exist**

**🌍 Real-Time Example — social MVP: chronological feed before ML ranking**

### 28.8.4 YAGNI (You Aren’t Gonna Need It)

**🟢 Beginner Example — skip abstract base view until second similar page**

**🟡 Intermediate Example — defer microservices split**

**🔴 Expert Example — feature flags without platform until launch pressure**

**🌍 Real-Time Example — SaaS don’t shard DB until metrics prove need**

### 28.8.5 Zen of Django (community pragmatics)

**🟢 Beginner Example — use built-in auth, admin, forms before custom**

**🟡 Intermediate Example — leverage ORM migrations, don’t hand-roll DDL**

**🔴 Expert Example — contribute reusable pieces back as internal packages**

**🌍 Real-Time Example — e-commerce reach for `F()` expressions before raw SQL**

---

## Best Practices (Summary)

- Grow structure with **pain**: small apps first; split when boundaries clarify.
- Keep **domain rules** near the data (models/constraints) and **workflows** in services.
- Views and serializers **orchestrate**; they should not become god objects.
- **Test** services and tricky queries; use **factories** and **real DB** for ORM confidence.
- Apply patterns (**repository**, **strategy**, **observer**) when they reduce coupling measurably.
- **Performance patterns** (`select_related`, caching, pagination) are features of correctness at scale.
- Let **DRY**, **explicitness**, **KISS**, and **YAGNI** argue in tension — judgment picks the winner per decision.

---

## Common Mistakes to Avoid

- **God models** carrying unrelated methods because “it’s convenient.”
- **Signal chains** debugging nightmares — implicit call order.
- **Copy-pasting** queryset filters across views instead of managers.
- **Anemic models** where every rule lives only in templates/forms (duplicated).
- **Over-mocking** tests that pass while integration breaks.
- **Premature repositories** wrapping one-line ORM calls.
- **Caching** without invalidation ownership.
- **Microservices** before modular monolith boundaries are understood.

---

## Comparison Tables

| Layer | Responsibility |
|-------|------------------|
| Model | Invariants, persistence helpers |
| Service | Multi-step workflows, external IO orchestration |
| View | HTTP concerns, authz entry, response choice |
| Serializer | API shape + request validation |

| Test type | Target |
|-----------|--------|
| Unit | Pure functions, services |
| Integration | Views + DB |
| API contract | DRF schema + status codes |
| E2E | Critical journeys sparingly |

| Pattern | When it pays off |
|---------|------------------|
| Repository | Swap storage / centralize complex queries |
| Service | Reuse across views, tasks, admin |
| Strategy | Pluggable algorithms (tax, shipping, pricing) |
| Observer | Decouple side effects (careful with signals) |

| Principle | One-line guidance |
|-----------|-------------------|
| DRY | Centralize truth |
| Explicit | Name and wire dependencies |
| KISS | Shippable beats clever |
| YAGNI | Build for today’s scale |

---

*Django **6.0.3** practices evolve with the ecosystem — revisit defaults when upgrading Python, Django, and DRF; keep `check --deploy` in CI.*
