# Django Validation — Reference Notes (Django 6.0.3)

Validation in Django happens at **fields**, **forms**, and **models**, and can be extended with **async** validators where supported. **Django 6.0.3** on **Python 3.12–3.14** continues `Validator` callables, `Model.clean()`, and `Form` cleaning hooks. These notes follow a TypeScript-style reference: TOC, exhaustive subtopics, and four example levels per major concept.

---

## 📑 Table of Contents

1. [19.1 Field Validators](#191-field-validators)
2. [19.2 Custom Validators](#192-custom-validators)
3. [19.3 Model Validation](#193-model-validation)
4. [19.4 Form Validation](#194-form-validation)
5. [19.5 Model Form Validation](#195-model-form-validation)
6. [19.6 Advanced Validation](#196-advanced-validation)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 19.1 Field Validators

### 19.1.1 Built-in Validators

**Concept:** `validators=[...]` on fields; Django ships common validators in `django.core.validators`.

#### 🟢 Beginner Example (simple, foundational)

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Product(models.Model):
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    rating = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
    )
```

#### 🟡 Intermediate Example (practical patterns)

```python
from django.core.validators import RegexValidator

sku_validator = RegexValidator(r"^[A-Z0-9-]+$", "SKU must be uppercase alphanumeric")

class SKUField(models.CharField):
    default_validators = [sku_validator]
```

#### 🔴 Expert Example (advanced usage)

```python
from django.core.validators import ProhibitNullCharactersValidator

class SafeText(models.TextField):
    default_validators = [ProhibitNullCharactersValidator()]
```

#### 🌍 Real-Time Example (production / e-commerce)

Product `weight_kg` with `MinValueValidator(0)` and `MaxValueValidator(500)` to reject bad catalog imports.

### 19.1.2 URLValidator

**Concept:** Validates URL strings; schemes configurable.

#### 🟢 Beginner Example

```python
from django.db import models
from django.core.validators import URLValidator

class Company(models.Model):
    website = models.URLField(validators=[URLValidator(schemes=["https"])])
```

#### 🟡 Intermediate Example

```python
from django.forms import URLField

class PartnerForm(forms.Form):
    callback_url = URLField()
```

#### 🔴 Expert Example

```python
URLValidator(schemes=["https", "http"], host_re=r".*\.example\.com$")
```

#### 🌍 Real-Time Example

SaaS OAuth redirect URIs: restrict scheme and optionally domain in custom validator wrapping `URLValidator`.

### 19.1.3 EmailValidator

**Concept:** Syntax validation, not deliverability.

#### 🟢 Beginner Example

```python
from django.core.validators import EmailValidator

email = models.EmailField(validators=[EmailValidator()])
```

#### 🟡 Intermediate Example

```python
class SubscribeForm(forms.Form):
    email = forms.EmailField()
```

#### 🔴 Expert Example

```python
EmailValidator(whitelist=["internal.company"])
```

#### 🌍 Real-Time Example

Social signup: combine `EmailValidator` with disposable-domain blocklist in custom validator.

### 19.1.4 MinValueValidator / MaxValueValidator

**Concept:** Compare numeric values with inclusive bounds.

#### 🟢 Beginner Example

```python
from django.core.validators import MinValueValidator, MaxValueValidator

quantity = models.PositiveIntegerField(
    validators=[MinValueValidator(1), MaxValueValidator(999)],
)
```

#### 🟡 Intermediate Example

```python
from decimal import Decimal

MinValueValidator(Decimal("0.01"))
```

#### 🔴 Expert Example

Dynamic max from settings:

```python
def max_order_total():
    from django.conf import settings
    return MaxValueValidator(settings.MAX_ORDER_TOTAL)

class Order(models.Model):
    total = models.DecimalField(max_digits=12, decimal_places=2, validators=[max_order_total()])
```

#### 🌍 Real-Time Example

E-commerce: enforce max line quantity per SKU from supplier contract table (custom validator hitting DB — cache carefully).

### 19.1.5 MinLengthValidator / MaxLengthValidator

**Concept:** For text fields where `max_length` is not enough (e.g., `TextField`).

#### 🟢 Beginner Example

```python
from django.core.validators import MinLengthValidator, MaxLengthValidator

class Post(models.Model):
    body = models.TextField(validators=[MinLengthValidator(10), MaxLengthValidator(10_000)])
```

#### 🟡 Intermediate Example

```python
class ReviewForm(forms.Form):
    comment = forms.CharField(
        widget=forms.Textarea,
        validators=[MinLengthValidator(20)],
    )
```

#### 🔴 Expert Example

Strip whitespace before length check in form `clean_comment`.

#### 🌍 Real-Time Example

SaaS support tickets: minimum description length to reduce noise.

---

## 19.2 Custom Validators

### 19.2.1 Creating Validators

**Concept:** Callable `(value)` raising `ValidationError`, or class with `__call__`.

#### 🟢 Beginner Example

```python
from django.core.exceptions import ValidationError

def validate_even(value):
    if value % 2:
        raise ValidationError("%(value)s is not even", params={"value": value})
```

#### 🟡 Intermediate Example

```python
class FileSizeValidator:
    def __init__(self, max_bytes):
        self.max_bytes = max_bytes

    def __call__(self, value):
        if value.size > self.max_bytes:
            raise ValidationError("File too large")
```

#### 🔴 Expert Example

```python
from django.utils.deconstruct import deconstructible

@deconstructible
class JSONSchemaValidator:
    def __init__(self, schema):
        self.schema = schema

    def __call__(self, value):
        import jsonschema
        jsonschema.validate(instance=value, schema=self.schema)
```

#### 🌍 Real-Time Example

E-commerce: validate dimensions dict against JSON schema for shipping APIs.

### 19.2.2 Validator Functions

**Concept:** Pure functions easiest to test; attach to multiple fields.

#### 🟢 Beginner Example

```python
def no_profanity(value):
    if "badword" in value.lower():
        raise ValidationError("Invalid wording")
```

#### 🟡 Intermediate Example

```python
title = models.CharField(max_length=200, validators=[no_profanity])
body = models.TextField(validators=[no_profanity])
```

#### 🔴 Expert Example

```python
def validate_timezone_name(value):
    import zoneinfo
    try:
        zoneinfo.ZoneInfo(value)
    except Exception as exc:
        raise ValidationError("Unknown timezone") from exc
```

#### 🌍 Real-Time Example

SaaS: tenant `default_timezone` validated against IANA database.

### 19.2.3 Validator Classes

**Concept:** Stateful validators (limits, patterns) as classes.

#### 🟢 Beginner Example

```python
class RangeValidator:
    def __init__(self, low, high):
        self.low = low
        self.high = high

    def __call__(self, value):
        if not (self.low <= value <= self.high):
            raise ValidationError("Out of range")
```

#### 🟡 Intermediate Example

Use `@deconstructible` for migrations serialization.

#### 🔴 Expert Example

```python
@deconstructible
class AsyncAPIValidator:
    def __init__(self, endpoint):
        self.endpoint = endpoint

    def __call__(self, value):
        # sync wrapper calling cached sync check
        ...
```

#### 🌍 Real-Time Example

Tax ID validator class with country parameter.

### 19.2.4 Error Messages

**Concept:** `ValidationError` accepts message, code, params.

#### 🟢 Beginner Example

```python
raise ValidationError("Invalid SKU")
```

#### 🟡 Intermediate Example

```python
raise ValidationError(
    "Value %(value)s is too small",
    code="too_small",
    params={"value": value},
)
```

#### 🔴 Expert Example

```python
raise ValidationError(
    [
        ValidationError("Error A", code="a"),
        ValidationError("Error B", code="b"),
    ]
)
```

#### 🌍 Real-Time Example

i18n: use `gettext_lazy` in form errors for user-facing strings.

### 19.2.5 Conditional Validation

**Concept:** Validators that depend on other field values belong in `clean()` often, not isolated field validators.

#### 🟢 Beginner Example

```python
def validate_discount(value):
    # alone cannot see price — use form/model clean
    pass
```

#### 🟡 Intermediate Example

```python
class OrderForm(forms.Form):
    price = forms.DecimalField()
    discount = forms.DecimalField()

    def clean(self):
        data = super().clean()
        if data["discount"] > data["price"]:
            raise ValidationError("Discount exceeds price")
        return data
```

#### 🔴 Expert Example

```python
if self.instance.status == "locked":
    return  # skip mutating validation in Model.clean
```

#### 🌍 Real-Time Example

E-commerce: free shipping only if `cart_subtotal` above threshold — cross-field in `clean`.

---

## 19.3 Model Validation

### 19.3.1 clean() Method

**Concept:** `model.full_clean()` calls `clean()` among other steps; not auto-called on `save()`.

#### 🟢 Beginner Example

```python
class Event(models.Model):
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()

    def clean(self):
        super().clean()
        if self.ends_at <= self.starts_at:
            raise ValidationError("ends_at must be after starts_at")
```

#### 🟡 Intermediate Example

```python
def clean(self):
    super().clean()
    if self.slug and self.title:
        if self.slug != slugify(self.title) and not self.allow_custom_slug:
            raise ValidationError({"slug": "Slug must match title"})
```

#### 🔴 Expert Example

```python
def clean(self):
    super().clean()
    if self.pk:
        conflicts = Model.objects.filter(code=self.code).exclude(pk=self.pk)
        if conflicts.exists():
            raise ValidationError({"code": "Duplicate code"})
```

#### 🌍 Real-Time Example

SaaS: `clean()` ensures plan features JSON matches schema.

### 19.3.2 Model-level Validation

**Concept:** Constraints in `Meta.constraints` + `clean()` for cross-field rules.

#### 🟢 Beginner Example

```python
class Meta:
    constraints = [
        models.CheckConstraint(check=models.Q(price__gte=0), name="price_non_negative"),
    ]
```

#### 🟡 Intermediate Example

```python
models.UniqueConstraint(fields=["tenant", "slug"], name="uniq_tenant_slug")
```

#### 🔴 Expert Example

```python
models.ExclusionConstraint(
    name="no_overlapping_bookings",
    expressions=[
        ("tsrange", "start", "end"),
    ],
)  # PostgreSQL
```

#### 🌍 Real-Time Example

E-commerce: DB-level check that `sale_price <= list_price`.

### 19.3.3 Cross-Field Validation

**Concept:** Compare multiple fields in `clean()`; set field errors with dict.

#### 🟢 Beginner Example

```python
def clean(self):
    super().clean()
    if self.ship_date and self.order_date and self.ship_date < self.order_date:
        raise ValidationError({"ship_date": "Cannot ship before order"})
```

#### 🟡 Intermediate Example

```python
raise ValidationError(
    {
        "start": "Invalid range",
        "end": "Invalid range",
    }
)
```

#### 🔴 Expert Example

Normalize in `clean` then validate:

```python
self.email = self.email.strip().lower()
```

#### 🌍 Real-Time Example

Travel booking: return date after departure; infants count vs seat class.

### 19.3.4 Unique Validation

**Concept:** `validate_unique()` in `full_clean`; uniqueness constraints in DB.

#### 🟢 Beginner Example

```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    handle = models.SlugField(unique=True)
```

#### 🟡 Intermediate Example

```python
class Meta:
    constraints = [
        models.UniqueConstraint(fields=["workspace", "email"], name="uniq_workspace_email"),
    ]
```

#### 🔴 Expert Example

```python
def validate_unique(self, exclude=None):
    super().validate_unique(exclude=exclude)
    # extra composite checks involving related rows
```

#### 🌍 Real-Time Example

SaaS: unique email per tenant, not globally.

### 19.3.5 Validation Errors

**Concept:** `django.core.exceptions.ValidationError` accumulates in forms; in models raise for `full_clean`.

#### 🟢 Beginner Example

```python
from django.core.exceptions import ValidationError

raise ValidationError("Bad data")
```

#### 🟡 Intermediate Example

```python
raise ValidationError({"field": ["error a", "error b"]})
```

#### 🔴 Expert Example

```python
errors = {}
...
if errors:
    raise ValidationError(errors)
```

#### 🌍 Real-Time Example

API layer maps `ValidationError` to 400 JSON with field keys.

---

## 19.4 Form Validation

### 19.4.1 clean_<fieldname>()

**Concept:** Per-field cleaning after field validators run.

#### 🟢 Beginner Example

```python
class SignupForm(forms.Form):
    username = forms.CharField()

    def clean_username(self):
        u = self.cleaned_data["username"].lower()
        if User.objects.filter(username=u).exists():
            raise forms.ValidationError("Taken")
        return u
```

#### 🟡 Intermediate Example

```python
def clean_quantity(self):
    q = self.cleaned_data["quantity"]
    if q % self.product.pack_size:
        raise forms.ValidationError(f"Must be multiple of {self.product.pack_size}")
    return q
```

#### 🔴 Expert Example

```python
def clean_avatar(self):
    f = self.cleaned_data.get("avatar")
    if not f:
        return f
    if f.content_type not in ALLOWED_TYPES:
        raise forms.ValidationError("Unsupported type")
    return f
```

#### 🌍 Real-Time Example

E-commerce: quantity multiples of case pack for B2B checkout form.

### 19.4.2 clean() in Forms

**Concept:** Form-wide validation; access `self.cleaned_data`.

#### 🟢 Beginner Example

```python
def clean(self):
    cleaned = super().clean()
    if cleaned.get("password1") != cleaned.get("password2"):
        raise forms.ValidationError("Passwords do not match")
    return cleaned
```

#### 🟡 Intermediate Example

```python
def clean(self):
    cleaned = super().clean()
    if not cleaned.get("billing_same_as_shipping"):
        required = ["bill_line1", "bill_city", "bill_postal"]
        for f in required:
            if not cleaned.get(f):
                self.add_error(f, "Required when different billing address")
    return cleaned
```

#### 🔴 Expert Example

```python
def clean(self):
    cleaned = super().clean()
    if self.errors:
        return cleaned
    ...
    return cleaned
```

#### 🌍 Real-Time Example

SaaS: enterprise form — if VAT ID provided, validate country pairing.

### 19.4.3 Form Errors

**Concept:** `form.errors`, `form.add_error`, `non_field_errors`.

#### 🟢 Beginner Example

```python
if not form.is_valid():
    print(form.errors)
```

#### 🟡 Intermediate Example

```python
form.add_error(None, "Session expired")
```

#### 🔴 Expert Example

```python
form.add_error("email", forms.ValidationError("Blocked domain", code="blocked_domain"))
```

#### 🌍 Real-Time Example

Social: map rate-limit failure to non-field error.

### 19.4.4 Error Messages

**Concept:** `error_messages` dict on fields; override in form `__init__`.

#### 🟢 Beginner Example

```python
code = forms.CharField(
    min_length=6,
    error_messages={"min_length": "Code must be at least 6 characters"},
)
```

#### 🟡 Intermediate Example

```python
self.fields["email"].error_messages["required"] = "We need your email"
```

#### 🔴 Expert Example

```python
from django.utils.translation import gettext_lazy as _

error_messages={"invalid": _("Enter a valid email address")}
```

#### 🌍 Real-Time Example

Localized checkout with per-locale messages.

### 19.4.5 Validation Order

**Concept:** Field `to_python` → field validators → `clean_<field>` → `clean()` → model validation in `ModelForm`.

#### 🟢 Beginner Example

Rely on documented order; don’t access other fields in `clean_a` without guarding missing data.

#### 🟡 Intermediate Example

```python
def clean_start(self):
    start = self.cleaned_data.get("start")
    if not start:
        return start
    ...
```

#### 🔴 Expert Example

```python
def clean(self):
    if "start" in self.errors or "end" in self.errors:
        return super().clean()
```

#### 🌍 Real-Time Example

Complex wizard forms: validate step-2 only if step-1 valid — use separate forms or `clean` guards.

---

## 19.5 Model Form Validation

### 19.5.1 Model Validation in Forms

**Concept:** `ModelForm` calls `instance.full_clean()` by default on `is_valid()` unless opted out.

#### 🟢 Beginner Example

```python
class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ["title", "body"]
```

#### 🟡 Intermediate Example

```python
class Meta:
    model = Article
    exclude = ["author"]
```

#### 🔴 Expert Example

```python
def _post_clean(self):
    super()._post_clean()
    # extra instance checks
```

#### 🌍 Real-Time Example

Admin `ModelForm` runs model `clean` — keep heavy checks efficient.

### 19.5.2 Exclude Validation

**Concept:** Excluded fields skip form validation; model may still require them on save.

#### 🟢 Beginner Example

```python
class Meta:
    model = Post
    exclude = ["author"]

def save(self, commit=True):
    post = super().save(commit=False)
    post.author = self.user
    ...
```

#### 🟡 Intermediate Example

Set required excluded fields in `save()` before DB insert.

#### 🔴 Expert Example

```python
readonly_fields in admin + exclude from form for security
```

#### 🌍 Real-Time Example

SaaS: `tenant` set from request, excluded from user-facing form.

### 19.5.3 Instance Validation

**Concept:** Editing passes existing PK; uniqueness checks must exclude self.

#### 🟢 Beginner Example

Model `validate_unique` handles exclude pk automatically.

#### 🟡 Intermediate Example

```python
if self.instance.pk:
    ...
```

#### 🔴 Expert Example

Partial updates via API: validate only provided fields (custom form or serializer).

#### 🌍 Real-Time Example

E-commerce: PATCH product price only — skip unrelated `clean` branches.

### 19.5.4 Bulk Validation

**Concept:** `full_clean()` per instance in loops; expensive — prefer DB constraints for bulk imports.

#### 🟢 Beginner Example

```python
for row in rows:
    obj = Model(**row)
    obj.full_clean()
    obj.save()
```

#### 🟡 Intermediate Example

```python
from django.core.exceptions import ValidationError

errors = []
for obj in batch:
    try:
        obj.full_clean()
    except ValidationError as e:
        errors.append((obj, e))
```

#### 🔴 Expert Example

Validate in worker with shared schema check + single query for duplicates.

#### 🌍 Real-Time Example

Catalog CSV import: row-level errors collected into report file.

### 19.5.5 Partial Validation

**Concept:** `ModelForm` with subset of fields; `update_fields` on `save()`.

#### 🟢 Beginner Example

```python
class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name"]
```

#### 🟡 Intermediate Example

```python
user.save(update_fields=["first_name", "last_name"])
```

#### 🔴 Expert Example

DRF serializers with `partial=True` analogous pattern.

#### 🌍 Real-Time Example

SaaS settings page updates notification prefs without touching billing fields.

---

## 19.6 Advanced Validation

### 19.6.1 Async Validators

**Concept:** Django forms/fields may support async validation in ASGI contexts — check 6.0 docs for `Field.validate()` / form async APIs where enabled; pattern: async service called from view, keep ORM in sync thread.

#### 🟢 Beginner Example

```python
# View-level async check before form save
async def email_deliverable(email: str) -> bool:
    ...
```

#### 🟡 Intermediate Example

```python
# sync form + async view
if await check_external(email):
    form.add_error("email", "Unreachable")
```

#### 🔴 Expert Example

Use `sync_to_async` carefully around ORM; prefer validate external IO async, persist sync.

#### 🌍 Real-Time Example

SaaS: async DNS check for custom domain before `Model.save`.

### 19.6.2 Conditional Fields

**Concept:** Dynamic fields in `__init__` based on user role or instance state.

#### 🟢 Beginner Example

```python
class OrderForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not kwargs["instance"].is_wholesale:
            del self.fields["po_number"]
```

#### 🟡 Intermediate Example

```python
self.fields["tax_id"].required = self.country in EU_COUNTRIES
```

#### 🔴 Expert Example

```python
self.fields["coupon"].widget = forms.HiddenInput()
```

#### 🌍 Real-Time Example

E-commerce B2B vs B2C checkout forms.

### 19.6.3 Dynamic Validation

**Concept:** Rules from database or feature flags.

#### 🟢 Beginner Example

```python
max_qty = Promotion.objects.active().values_list("max_per_order", flat=True).first() or 10
self.fields["quantity"].validators.append(MaxValueValidator(max_qty))
```

#### 🟡 Intermediate Example

Cache rules in request-level cache.

#### 🔴 Expert Example

```python
schema = Tenant.objects.get(pk=tenant_id).validation_schema
```

#### 🌍 Real-Time Example

SaaS per-tenant password policy enforced in auth form `clean_password`.

### 19.6.4 Business Logic Validation

**Concept:** Domain services called from `clean()` to avoid fat models/forms.

#### 🟢 Beginner Example

```python
def clean(self):
    super().clean()
    PricingService.validate_quote(self.instance)
```

#### 🟡 Intermediate Example

```python
if not InventoryService.can_fulfill(lines):
    raise ValidationError("Insufficient stock")
```

#### 🔴 Expert Example

Saga-style: validation split into command handler before aggregate save.

#### 🌍 Real-Time Example

E-commerce: shipping method valid for cart weight + destination zone.

### 19.6.5 Third-Party

**Concept:** `django-phonenumber-field`, `crispy_forms` (display), `jsonschema`, payment SDK validators.

#### 🟢 Beginner Example

```python
from phonenumber_field.modelfields import PhoneNumberField

phone = PhoneNumberField(region="US")
```

#### 🟡 Intermediate Example

```python
import stripe

def validate_payment_method_id(pm_id):
    try:
        stripe.PaymentMethod.retrieve(pm_id)
    except stripe.error.InvalidRequestError as e:
        raise ValidationError("Invalid payment method") from e
```

#### 🔴 Expert Example

Wrap third-party errors into `ValidationError` with safe user messages.

#### 🌍 Real-Time Example

SaaS billing: Stripe tax ID validation API.

---

## Best Practices

- Prefer DB constraints for invariants that must hold regardless of code path.
- Call `full_clean()` in APIs/services before `save()` when bypassing forms.
- Use `add_error` for field-specific issues; `non_field_errors` for global ones.
- Keep validators fast; external IO belongs in views/tasks with explicit UX.
- Use `gettext_lazy` for reusable validator messages.
- Document which layer owns which rule (field vs form vs model vs DB).
- For uploads, validate size/type/content in form `clean_<file>` and consider async virus scan post-upload.
- Test validation with both create and update paths.

---

## Common Mistakes to Avoid

- Assuming `save()` runs `full_clean()` — it does not by default.
- Raising `ValidationError` in wrong layer with wrong signature (dict vs list).
- Cross-field logic in field validators that cannot access sibling values.
- Unique checks without tenant scope in multi-tenant apps.
- Swallowing `ValidationError` and returning vague 500 errors in APIs.
- Huge work in `clean()` called on every admin save.
- Using `exclude` to hide sensitive fields without also preventing tampering in API.
- Async validation mixing unsafely with ORM from wrong context.

---

## Comparison Tables

| Layer | Runs when | Typical rules |
|-------|-----------|---------------|
| Field validators | `Field.clean` | Format, range, regex |
| Form `clean_*` | After fields | Derived single field |
| Form `clean` | After all fields | Cross-field |
| `Model.clean` | `full_clean` | Domain invariants |
| DB constraints | INSERT/UPDATE | Hard guarantees |

| API | Use |
|-----|-----|
| `ValidationError` | Forms/models |
| `forms.ValidationError` | Forms (same class in modern Django) |
| `django.core.exceptions.ValidationError` | Models, services |

| Approach | Pros | Cons |
|----------|------|------|
| Validator callable | Reusable | No sibling field access |
| `clean()` | Cross-field | Must call explicitly on save paths |
| Constraints | DB-enforced | Migration needed |

---

*Reference notes for **Django 6.0.3** validation. Verify async validation APIs against the official Django 6.0 documentation for your deployment (WSGI vs ASGI).*
