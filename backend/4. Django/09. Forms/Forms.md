# Django Forms (Django 6.0.3)

Django **Forms** translate HTTP input into validated Python values and HTML widgets. They mirror the ergonomics of a **typed schema with runtime validation**—similar in spirit to validating JSON with **Zod** or **TypeScript** types plus refinements, but oriented around **HTML** and **server-side** trust boundaries. This reference covers **Django 6.0.3** with **Python 3.12–3.14**, with examples spanning **e‑commerce checkout**, **social profiles**, and **SaaS onboarding**.

---

## 📑 Table of Contents

- [9.1 Form Basics](#91-form-basics)
  - [9.1.1 Defining Forms](#911-defining-forms)
  - [9.1.2 Form Fields](#912-form-fields)
  - [9.1.3 Form Rendering](#913-form-rendering)
  - [9.1.4 Form Processing](#914-form-processing)
  - [9.1.5 Form Validation](#915-form-validation)
- [9.2 Form Fields](#92-form-fields)
  - [9.2.1 CharField / Text Field Patterns](#921-charfield--text-field-patterns)
  - [9.2.2 IntegerField / FloatField / DecimalField](#922-integerfield--floatfield--decimalfield)
  - [9.2.3 BooleanField](#923-booleanfield)
  - [9.2.4 DateField / DateTimeField](#924-datefield--datetimefield)
  - [9.2.5 EmailField / URLField](#925-emailfield--urlfield)
  - [9.2.6 ChoiceField / MultipleChoiceField](#926-choicefield--multiplechoicefield)
  - [9.2.7 FileField / ImageField](#927-filefield--imagefield)
- [9.3 Field Options](#93-field-options)
  - [9.3.1 required](#931-required)
  - [9.3.2 label / help_text](#932-label--help_text)
  - [9.3.3 initial](#933-initial)
  - [9.3.4 disabled](#934-disabled)
  - [9.3.5 error_messages](#935-error_messages)
- [9.4 Form Validation](#94-form-validation)
  - [9.4.1 clean()](#941-clean)
  - [9.4.2 Per-field clean methods](#942-per-field-clean-methods)
  - [9.4.3 Validators](#943-validators)
  - [9.4.4 Custom Validators](#944-custom-validators)
  - [9.4.5 ValidationError](#945-validationerror)
- [9.5 Form Rendering](#95-form-rendering)
  - [9.5.1 as_p()](#951-as_p)
  - [9.5.2 as_table()](#952-as_table)
  - [9.5.3 as_ul()](#953-as_ul)
  - [9.5.4 Manual Rendering](#954-manual-rendering)
  - [9.5.5 Widget Customization](#955-widget-customization)
- [9.6 Form Widgets](#96-form-widgets)
  - [9.6.1 Widget Types](#961-widget-types)
  - [9.6.2 TextInput / Textarea](#962-textinput--textarea)
  - [9.6.3 Select / RadioSelect](#963-select--radioselect)
  - [9.6.4 CheckboxInput](#964-checkboxinput)
  - [9.6.5 Custom Widgets](#965-custom-widgets)
- [9.7 Multi-Part Forms](#97-multi-part-forms)
  - [9.7.1 File Upload Forms](#971-file-upload-forms)
  - [9.7.2 Form Encoding](#972-form-encoding)
  - [9.7.3 File Handling](#973-file-handling)
  - [9.7.4 Multiple File Upload](#974-multiple-file-upload)
  - [9.7.5 File Validation](#975-file-validation)
- [9.8 Form Patterns](#98-form-patterns)
  - [9.8.1 CSRF Protection](#981-csrf-protection)
  - [9.8.2 Form Processing in Views](#982-form-processing-in-views)
  - [9.8.3 Form Errors Display](#983-form-errors-display)
  - [9.8.4 Pre-populated Forms](#984-pre-populated-forms)
  - [9.8.5 Dynamic Forms](#985-dynamic-forms)
- [Best Practices (Chapter Summary)](#best-practices-chapter-summary)
- [Common Mistakes (Chapter Summary)](#common-mistakes-chapter-summary)
- [Comparison Tables](#comparison-tables)

---

## 9.1 Form Basics

### 9.1.1 Defining Forms

Subclass **`forms.Form`** (or **`ModelForm`**—see Model Forms chapter). Declare attributes as **`Field`** instances.

**🟢 Beginner Example**

```python
from django import forms

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    message = forms.CharField(widget=forms.Textarea)
```

**🟡 Intermediate Example**

```python
class NewsletterForm(forms.Form):
    email = forms.EmailField()
    frequency = forms.ChoiceField(choices=[("weekly", "Weekly"), ("daily", "Daily")])
```

**🔴 Expert Example**

```python
class CheckoutContactForm(forms.Form):
    email = forms.EmailField()
    phone = forms.RegexField(regex=r"^\+?[0-9 .\-]{7,20}$", required=False)

    def __init__(self, *args, **kwargs):
        self.tenant = kwargs.pop("tenant")
        super().__init__(*args, **kwargs)
```

**🌍 Real-Time Example (SaaS trial signup)**

```python
class TrialSignupForm(forms.Form):
    work_email = forms.EmailField(label="Work email")
    company = forms.CharField(max_length=120)
    accept_terms = forms.BooleanField(required=True)
```

---

### 9.1.2 Form Fields

Fields define **validation**, **coercion**, and default **widget**.

**🟢 Beginner Example**

```python
age = forms.IntegerField(min_value=0, max_value=120)
```

**🟡 Intermediate Example**

```python
discount_code = forms.CharField(max_length=32, strip=True, empty_value=None)
```

**🔴 Expert Example**

```python
from django.core.validators import RegexValidator

sku = forms.CharField(
    max_length=24,
    validators=[RegexValidator(r"^[A-Z0-9\-]+$", "SKU must be alphanumeric.")],
)
```

**🌍 Real-Time Example (e‑commerce)**

```python
gift_message = forms.CharField(max_length=200, required=False, widget=forms.Textarea(attrs={"rows": 3}))
```

---

### 9.1.3 Form Rendering

Bind **`request.POST`** (and **`request.FILES`** for uploads) to **`Form(data, files)`**; unbound for GET.

**🟢 Beginner Example**

```python
form = ContactForm(request.POST)
```

**🟡 Intermediate Example**

```python
form = ProfileForm(request.POST, request.FILES, instance=profile)
```

**🔴 Expert Example**

```python
form = InvoiceForm(
    data=request.POST,
    initial={"currency": tenant.default_currency},
    prefix="inv",
)
```

**🌍 Real-Time Example**

```python
# Social: edit profile
form = SocialProfileForm(request.POST or None, instance=request.user.profile)
```

---

### 9.1.4 Form Processing

Idiomatic pattern: **GET** shows empty/initial; **POST** validates and acts.

**🟢 Beginner Example**

```python
def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            send_mail(...)
            return redirect("thanks")
    else:
        form = ContactForm()
    return render(request, "contact.html", {"form": form})
```

**🟡 Intermediate Example**

```python
def post_create(request):
    form = PostForm(request.POST or None)
    if form.is_valid():
        post = form.save(commit=False)
        post.author = request.user
        post.save()
        return redirect(post)
    return render(request, "social/post_form.html", {"form": form})
```

**🔴 Expert Example**

```python
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET", "POST"])
def checkout_step_shipping(request):
    cart = get_cart(request)
    form = ShippingForm(request.POST or None, country=cart.ship_country)
    if form.is_valid():
        request.session["shipping"] = form.cleaned_data
        return redirect("checkout:payment")
    return render(request, "checkout/shipping.html", {"form": form, "cart": cart})
```

**🌍 Real-Time Example (SaaS billing portal)**

```python
def payment_method(request):
    form = PaymentMethodForm(request.POST or None, customer=request.user.customer)
    if form.is_valid():
        stripe_service.attach_payment_method(form.cleaned_data["pm_id"])
        messages.success(request, "Card saved.")
        return redirect("billing:index")
    return render(request, "billing/payment_method.html", {"form": form})
```

---

### 9.1.5 Form Validation

**`is_valid()`** runs **`full_clean()`**: field **`to_python`**, field **`validate`**, **`run_validators`**, **`clean_<field>`**, then form **`clean`**.

**🟢 Beginner Example**

```python
if form.is_valid():
    data = form.cleaned_data
```

**🟡 Intermediate Example**

```python
if not form.is_valid():
    return render(request, "form.html", {"form": form}, status=422)
```

**🔴 Expert Example**

```python
form = OrderForm(request.POST)
form.full_clean()  # rare manual use; prefer is_valid()
```

**🌍 Real-Time Example**

HTMX partial returns **only** field errors on failed validation.

---

## 9.2 Form Fields

### 9.2.1 CharField / Text Field Patterns

**`CharField`** maps to string; use **`Textarea`** widget for multi-line.

**🟢 Beginner Example**

```python
title = forms.CharField(max_length=200)
```

**🟡 Intermediate Example**

```python
bio = forms.CharField(widget=forms.Textarea(attrs={"class": "input"}), max_length=500)
```

**🔴 Expert Example**

```python
slug = forms.SlugField(allow_unicode=True)
```

**🌍 Real-Time Example (social)**

```python
display_name = forms.CharField(max_length=50, strip=True)
```

---

### 9.2.2 IntegerField / FloatField / DecimalField

Prefer **`DecimalField`** for money.

**🟢 Beginner Example**

```python
qty = forms.IntegerField(min_value=1)
```

**🟡 Intermediate Example**

```python
weight_kg = forms.FloatField(min_value=0)
```

**🔴 Expert Example**

```python
from decimal import Decimal

price = forms.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.00"))
```

**🌍 Real-Time Example (e‑commerce)**

```python
line_quantity = forms.IntegerField(min_value=1, max_value=999)
```

---

### 9.2.3 BooleanField

**`required=False`** yields **False** when missing; **`required=True`** requires checked box.

**🟢 Beginner Example**

```python
agree = forms.BooleanField(label="I agree to the terms")
```

**🟡 Intermediate Example**

```python
newsletter_opt_in = forms.BooleanField(required=False, initial=False)
```

**🔴 Expert Example**

Hidden feature flags: combine with **`TypedChoiceField`** for tri-state if needed.

**🌍 Real-Time Example (SaaS)**

```python
marketing_ok = forms.BooleanField(required=False, label="Email me product updates")
```

---

### 9.2.4 DateField / DateTimeField

Accepts **`input_formats`**; widgets **`DateInput`**, **`DateTimeInput`**.

**🟢 Beginner Example**

```python
birth_date = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
```

**🟡 Intermediate Example**

```python
starts_at = forms.DateTimeField()
```

**🔴 Expert Example**

```python
from django.utils import timezone

class EventForm(forms.Form):
    starts_at = forms.DateTimeField()

    def clean_starts_at(self):
        dt = self.cleaned_data["starts_at"]
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt, timezone.get_current_timezone())
        return dt
```

**🌍 Real-Time Example**

Webinar scheduling in SaaS admin.

---

### 9.2.5 EmailField / URLField

Built-in validators for format.

**🟢 Beginner Example**

```python
email = forms.EmailField()
```

**🟡 Intermediate Example**

```python
website = forms.URLField(required=False)
```

**🔴 Expert Example**

Normalize email in **`clean_email`**.

**🌍 Real-Time Example**

Social: verify **`EmailField`** + later send confirmation.

---

### 9.2.6 ChoiceField / MultipleChoiceField

**`choices`** iterable of **(value, label)**.

**🟢 Beginner Example**

```python
size = forms.ChoiceField(choices=[("s", "S"), ("m", "M"), ("l", "L")])
```

**🟡 Intermediate Example**

```python
tags = forms.MultipleChoiceField(choices=TAG_CHOICES, widget=forms.CheckboxSelectMultiple)
```

**🔴 Expert Example**

```python
class DynamicTenantForm(forms.Form):
    def __init__(self, tenant, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["project"] = forms.ModelChoiceField(queryset=Project.objects.filter(tenant=tenant))
```

**🌍 Real-Time Example (e‑commerce)**

```python
shipping_speed = forms.ChoiceField(choices=[], widget=forms.RadioSelect)

def __init__(self, *args, rates=None, **kwargs):
    super().__init__(*args, **kwargs)
    self.fields["shipping_speed"].choices = [(r.id, r.label) for r in rates]
```

---

### 9.2.7 FileField / ImageField

**`ImageField`** adds Pillow verification when Pillow installed.

**🟢 Beginner Example**

```python
avatar = forms.ImageField(required=False)
```

**🟡 Intermediate Example**

```python
document = forms.FileField(validators=[validate_pdf])
```

**🔴 Expert Example**

```python
def validate_size(f):
    if f.size > 5 * 1024 * 1024:
        raise ValidationError("Max 5MB.")

class UploadForm(forms.Form):
    file = forms.FileField(validators=[validate_size])
```

**🌍 Real-Time Example**

SaaS invoice PDF upload to accounting.

---

## 9.3 Field Options

### 9.3.1 required

**`required=False`** allows empty submission (converted per field rules).

**🟢 Beginner Example**

```python
middle_name = forms.CharField(required=False)
```

**🟡 Intermediate Example**

Optional URL with empty string → **`None`** via **`empty_value`**.

**🔴 Expert Example**

**`BooleanField(required=False)`** → unchecked is valid **False**.

**🌍 Real-Time Example**

Optional phone on checkout.

---

### 9.3.2 label / help_text

Improve accessibility and UI copy.

**🟢 Beginner Example**

```python
code = forms.CharField(label="Discount code", help_text="One per order")
```

**🟡 Intermediate Example**

```python
password = forms.CharField(
    label="Password",
    help_text="Min 12 characters.",
    widget=forms.PasswordInput,
)
```

**🔴 Expert Example**

Use **`label_suffix=""`** on **`Form`** for compact layouts.

**🌍 Real-Time Example**

SaaS API key field with **help_text** linking docs.

---

### 9.3.3 initial

**Display-only** default for **unbound** forms; not fallback for missing POST data.

**🟢 Beginner Example**

```python
form = SettingsForm(initial={"timezone": "UTC"})
```

**🟡 Intermediate Example**

```python
class SettingsForm(forms.Form):
    timezone = forms.ChoiceField(choices=TIMEZONES, initial="UTC")
```

**🔴 Expert Example**

Never rely on **`initial`** for security—re-validate server-side.

**🌍 Real-Time Example**

Pre-fill shipping from last order **`initial`**.

---

### 9.3.4 disabled

Excluded from **`cleaned_data`** by default in recent Django—values must not be trusted from client.

**🟢 Beginner Example**

```python
username = forms.CharField(disabled=True, required=False)
```

**🟡 Intermediate Example**

Show **`account_tier`** disabled; update via admin only.

**🔴 Expert Example**

For “editable display”, copy trusted value from DB in **`clean`** if needed.

**🌍 Real-Time Example**

Invoice **`total`** display on SaaS statement form.

---

### 9.3.5 error_messages

Override per-field error strings (i18n-friendly).

**🟢 Beginner Example**

```python
age = forms.IntegerField(error_messages={"required": "Please enter your age."})
```

**🟡 Intermediate Example**

```python
email = forms.EmailField(error_messages={"invalid": "That email doesn’t look valid."})
```

**🔴 Expert Example**

Centralize with **`gettext_lazy`** for translation.

**🌍 Real-Time Example**

E‑commerce promo code field: custom **“invalid or expired”** message from **`clean_code`**.

---

## 9.4 Form Validation

### 9.4.1 clean()

Form-wide validation; must **`return cleaned_data`** (or new dict).

**🟢 Beginner Example**

```python
def clean(self):
    data = super().clean()
    if data["password1"] != data["password2"]:
        raise ValidationError("Passwords must match.")
    return data
```

**🟡 Intermediate Example**

```python
def clean(self):
    data = super().clean()
    start, end = data.get("start"), data.get("end")
    if start and end and start >= end:
        self.add_error("end", "End must be after start.")
    return data
```

**🔴 Expert Example**

Cross-check inventory reservation vs cart lines.

**🌍 Real-Time Example (e‑commerce)**

```python
def clean(self):
    data = super().clean()
    if data["ship_country"] not in data["allowed_countries"]:
        raise ValidationError("We cannot ship to that country.")
    return data
```

---

### 9.4.2 Per-field clean methods

Django calls **`clean_<fieldname>()`** hooks after the field’s own validation.

**🟢 Beginner Example**

```python
def clean_email(self):
    email = self.cleaned_data["email"].lower()
    return email
```

**🟡 Intermediate Example**

```python
def clean_username(self):
    u = self.cleaned_data["username"]
    if ReservedUsername.objects.filter(name__iexact=u).exists():
        raise ValidationError("That username is reserved.")
    return u
```

**🔴 Expert Example**

Normalize phone to E.164.

**🌍 Real-Time Example (social)**

```python
def clean_handle(self):
    handle = self.cleaned_data["handle"]
    if User.objects.filter(handle__iexact=handle).exclude(pk=self.instance.pk).exists():
        raise ValidationError("Handle taken.")
    return handle
```

---

### 9.4.3 Validators

Reusable callables: **`MaxLengthValidator`**, **`EmailValidator`**, etc.

**🟢 Beginner Example**

```python
from django.core.validators import MinLengthValidator

password = forms.CharField(validators=[MinLengthValidator(12)])
```

**🟡 Intermediate Example**

```python
from django.core.validators import FileExtensionValidator

doc = forms.FileField(validators=[FileExtensionValidator(["pdf"])])
```

**🔴 Expert Example**

Compose multiple validators on **`CharField`**.

**🌍 Real-Time Example**

SaaS subdomain **`RegexValidator`**.

---

### 9.4.4 Custom Validators

Raise **`ValidationError`** on failure.

**🟢 Beginner Example**

```python
def even_only(value):
    if value % 2:
        raise ValidationError("Enter an even number.")

even = forms.IntegerField(validators=[even_only])
```

**🟡 Intermediate Example**

```python
from django.utils.deconstruct import deconstructible

@deconstructible
class MaxImageDimensions:
    def __init__(self, max_w, max_h):
        self.max_w, self.max_h = max_w, max_h

    def __call__(self, data):
        from PIL import Image
        img = Image.open(data)
        w, h = img.size
        if w > self.max_w or h > self.max_h:
            raise ValidationError("Image too large.")
```

**🔴 Expert Example**

**`@deconstructible`** for migrations compatibility on model fields using same validator.

**🌍 Real-Time Example**

E‑commerce: validate image **aspect ratio** for product shots.

---

### 9.4.5 ValidationError

Attach errors to fields or whole form.

**🟢 Beginner Example**

```python
raise ValidationError("Something went wrong.")
```

**🟡 Intermediate Example**

```python
raise ValidationError({"email": ["Already registered."], "password": ["Too weak."]})
```

**🔴 Expert Example**

```python
from django.core.exceptions import ValidationError

raise ValidationError(
    "Invalid combination",
    code="combo",
    params={"field": "billing"},
)
```

**🌍 Real-Time Example**

SaaS seat limit exceeded → **non-field** error.

---

## 9.5 Form Rendering

### 9.5.1 as_p()

Wraps fields in **`<p>`** tags.

**🟢 Beginner Example**

```django
{{ form.as_p }}
```

**🟡 Intermediate Example**

Custom template loops **`form.visible_fields`**.

**🔴 Expert Example**

Combine **`as_p`** only for admin prototypes—not design systems.

**🌍 Real-Time Example**

Internal tools quick forms.

---

### 9.5.2 as_table()

**`<tr><th>label</th><td>widget</td></tr>`** pattern.

**🟢 Beginner Example**

```django
<table>{{ form.as_table }}</table>
```

**🟡 Intermediate Example**

Add **`error_class`** in table rows via manual render.

**🔴 Expert Example**

Legacy admin-style SaaS reports.

**🌍 Real-Time Example**

Printer-friendly tables.

---

### 9.5.3 as_ul()

List-based layout.

**🟢 Beginner Example**

```django
<ul>{{ form.as_ul }}</ul>
```

**🟡 Intermediate Example**

Style with **Tailwind** on **`li`**.

**🔴 Expert Example**

Rare in modern component libraries.

**🌍 Real-Time Example**

Simple marketing site forms.

---

### 9.5.4 Manual Rendering

Full control: **`{{ field.label_tag }}`**, **`{{ field }}`**, **`{{ field.errors }}`**.

**🟢 Beginner Example**

```django
<div>
  {{ form.email.label_tag }}
  {{ form.email }}
  {{ form.email.errors }}
</div>
```

**🟡 Intermediate Example**

```django
{% for field in form %}
  <div class="field {{ field.css_classes }}">
    {{ field.label_tag }}
    {{ field }}
    {% if field.help_text %}<p class="hint">{{ field.help_text }}</p>{% endif %}
    {{ field.errors }}
  </div>
{% endfor %}
```

**🔴 Expert Example**

**`form.non_field_errors`** for **`clean()`** failures.

**🌍 Real-Time Example (e‑commerce)**

Stripe Elements + hidden Django fields rendered manually side by side.

---

### 9.5.5 Widget Customization

**`attrs`**: **`class`**, **`placeholder`**, **`data-*`**, **`autocomplete`**.

**🟢 Beginner Example**

```python
name = forms.CharField(widget=forms.TextInput(attrs={"placeholder": "Jane Doe"}))
```

**🟡 Intermediate Example**

```python
class StyledForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            field.widget.attrs.setdefault("class", "input")
```

**🔴 Expert Example**

**`MultiWidget`** for composite inputs (expiry MM/YY).

**🌍 Real-Time Example**

SaaS: **`autocomplete="username"`** on login.

---

## 9.6 Form Widgets

### 9.6.1 Widget Types

Map model/logical types to HTML.

**🟢 Beginner Example**

```python
forms.PasswordInput(render_value=True)
```

**🟡 Intermediate Example**

```python
forms.Select(choices=...)
```

**🔴 Expert Example**

**`SplitDateTimeWidget`** for separate date/time inputs.

**🌍 Real-Time Example**

E‑commerce delivery window.

---

### 9.6.2 TextInput / Textarea

**🟢 Beginner Example**

```python
search = forms.CharField(widget=forms.TextInput(attrs={"type": "search"}))
```

**🟡 Intermediate Example**

```python
body = forms.CharField(widget=forms.Textarea(attrs={"rows": 6, "cols": 40}))
```

**🔴 Expert Example**

**`ClearableFileInput`** for optional file replace.

**🌍 Real-Time Example**

Social post composer.

---

### 9.6.3 Select / RadioSelect

**🟢 Beginner Example**

```python
country = forms.ChoiceField(widget=forms.Select, choices=COUNTRIES)
```

**🟡 Intermediate Example**

```python
plan = forms.ChoiceField(widget=forms.RadioSelect, choices=PLANS)
```

**🔴 Expert Example**

**`SelectMultiple`** with **`FilteredSelectMultiple`** in admin (admin-only widget).

**🌍 Real-Time Example**

SaaS plan picker.

---

### 9.6.4 CheckboxInput

Single checkbox; **`CheckboxSelectMultiple`** for many.

**🟢 Beginner Example**

```python
remember = forms.BooleanField(widget=forms.CheckboxInput, required=False)
```

**🟡 Intermediate Example**

```python
perms = forms.MultipleChoiceField(choices=PERMS, widget=forms.CheckboxSelectMultiple)
```

**🔴 Expert Example**

Indeterminate state requires JS—not native widget.

**🌍 Real-Time Example**

E‑commerce gift options.

---

### 9.6.5 Custom Widgets

Subclass **`Widget`**; implement **`render`** / **`value_from_datadict`**.

**🟢 Beginner Example**

```python
class ReadOnlyText(forms.Widget):
    template_name = "widgets/readonly.html"
```

**🟡 Intermediate Example**

```python
class StarRatingWidget(forms.NumberInput):
    input_type = "range"

    def __init__(self, attrs=None):
        default = {"min": 1, "max": 5, "step": 1}
        if attrs:
            default.update(attrs)
        super().__init__(default)
```

**🔴 Expert Example**

Composite widget storing JSON string in one field.

**🌍 Real-Time Example**

Color picker storing hex for SaaS branding.

---

## 9.7 Multi-Part Forms

### 9.7.1 File Upload Forms

Template: **`enctype="multipart/form-data"`**.

**🟢 Beginner Example**

```django
<form method="post" enctype="multipart/form-data">
  {% csrf_token %}
  {{ form }}
  <button>Upload</button>
</form>
```

**🟡 Intermediate Example**

Same with HTMX **`hx-encoding="multipart/form-data"`**.

**🔴 Expert Example**

Progress UX via **Uppy** + S3 direct upload (outside classic form).

**🌍 Real-Time Example**

Marketplace seller CSV upload.

---

### 9.7.2 Form Encoding

Default **`application/x-www-form-urlencoded`**; files need **multipart**.

**🟢 Beginner Example**

```python
# Django test client
c.post("/upload/", data, format="multipart")
```

**🟡 Intermediate Example**

Large uploads: tune **web server** body size limits.

**🔴 Expert Example**

Chunked upload bypasses classic form—still validate in view.

**🌍 Real-Time Example**

Video attachments on social posts.

---

### 9.7.3 File Handling

**`cleaned_data['file']`** is **`UploadedFile`**: **`.read()`**, **`.chunks()`**, **`.name`**, **`.content_type`**.

**🟢 Beginner Example**

```python
def clean_avatar(self):
    f = self.cleaned_data["avatar"]
    path = default_storage.save(f"avatars/{f.name}", ContentFile(f.read()))
    return path
```

**🟡 Intermediate Example**

Stream to object storage without loading full file into memory:

```python
for chunk in f.chunks():
    dest.write(chunk)
```

**🔴 Expert Example**

Virus scan queue before marking file public.

**🌍 Real-Time Example**

SaaS compliance: store in tenant-prefixed bucket path.

---

### 9.7.4 Multiple File Upload

HTML **`multiple`** on **`ClearableFileInput`** + custom field or view loop.

**🟢 Beginner Example**

```python
class MultiFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True
```

**🟡 Intermediate Example**

```python
class MultiFileField(forms.FileField):
    widget = MultiFileInput

    def clean(self, data, initial=None):
        if not isinstance(data, (list, tuple)):
            data = [data]
        return [super(forms.FileField, self).clean(d, initial) for d in data if d]
```

**🔴 Expert Example**

Use **django formsets** for structured multi-upload per row.

**🌍 Real-Time Example**

E‑commerce: multiple product images per SKU.

---

### 9.7.5 File Validation

Size, extension, MIME sniffing (careful: client MIME is spoofable).

**🟢 Beginner Example**

```python
from django.core.validators import FileExtensionValidator

data_sheet = forms.FileField(validators=[FileExtensionValidator(["csv", "xlsx"])])
```

**🟡 Intermediate Example**

```python
def clean(self):
    f = self.cleaned_data["import_file"]
    if f.size > 2 * 1024 * 1024:
        raise ValidationError("Max 2MB.")
    return super().clean()
```

**🔴 Expert Example**

Magic-byte validation with **`python-magic`** in worker.

**🌍 Real-Time Example**

SaaS bulk user import.

---

## 9.8 Form Patterns

### 9.8.1 CSRF Protection

**`{% csrf_token %}`** or **`csrf_exempt`** (avoid except APIs using token auth).

**🟢 Beginner Example**

```django
<form method="post">{% csrf_token %} ...</form>
```

**🟡 Intermediate Example**

```javascript
fetch("/api/profile", {
  method: "POST",
  headers: {"X-CSRFToken": csrftoken},
  body: formData,
});
```

**🔴 Expert Example**

Separate **JWT** API from session-based HTML forms.

**🌍 Real-Time Example**

SaaS SPA + session: **`ensure_csrf_cookie`**.

---

### 9.8.2 Form Processing in Views

Class-based views: **`FormView`**, **`CreateView`**; function views: explicit branch.

**🟢 Beginner Example**

```python
from django.views.generic import FormView

class ContactView(FormView):
    template_name = "contact.html"
    form_class = ContactForm
    success_url = "/thanks/"

    def form_valid(self, form):
        # send email
        return super().form_valid(form)
```

**🟡 Intermediate Example**

```python
def update_profile(request):
    form = ProfileForm(request.POST or None, instance=request.user.profile)
    ...
```

**🔴 Expert Example**

**`atomic`** transaction wrapping multi-model writes.

**🌍 Real-Time Example**

Checkout: single POST updates **Order**, **Address**, **PaymentIntent** record.

---

### 9.8.3 Form Errors Display

**`field.errors`**, **`form.non_field_errors`**, **`form.add_error`**.

**🟢 Beginner Example**

```django
{{ form.non_field_errors }}
```

**🟡 Intermediate Example**

```django
{% if form.errors %}
  <div class="alert">Please fix the highlighted fields.</div>
{% endif %}
```

**🔴 Expert Example**

Map server errors to **toast** IDs for JS.

**🌍 Real-Time Example**

Inline field errors on SaaS settings modals.

---

### 9.8.4 Pre-populated Forms

**`initial=`**, **`instance=`** (ModelForm), or **`GET` query** parsing (validate!).

**🟢 Beginner Example**

```python
form = AddressForm(initial=model_to_dict(last_address))
```

**🟡 Intermediate Example**

Deep link **`?email=`** prefilled—still **`EmailField`** validation.

**🔴 Expert Example**

Never trust **hidden** fields for prices—recompute server-side.

**🌍 Real-Time Example**

E‑commerce: repopulate checkout after failed payment.

---

### 9.8.5 Dynamic Forms

Add fields in **`__init__`** based on user, tenant, or DB.

**🟢 Beginner Example**

```python
def __init__(self, *args, user=None, **kwargs):
    super().__init__(*args, **kwargs)
    if user and user.is_staff:
        self.fields["internal_note"] = forms.CharField(required=False)
```

**🟡 Intermediate Example**

```python
FormSet = formset_factory(LineItemForm, extra=0)
```

**🔴 Expert Example**

JSON-schema-driven forms (custom framework) still validate in Python.

**🌍 Real-Time Example**

SaaS configurable onboarding questions per tenant.

---

## Best Practices (Chapter Summary)

- Prefer **explicit** fields over **`__all__`** on ModelForms when models grow.
- Validate **money** with **`DecimalField`**, never **`float`**.
- Use **`request.POST or None`** idiom to distinguish GET vs empty POST.
- Keep **disabled** fields non-authoritative; copy from DB if needed.
- Use **`add_error`** for field-specific issues from **`clean()`**.
- **Manual render** for design systems; **`as_p`** only for scaffolding.
- Always set upload limits at **web server** and **application** layers.
- **CSRF** on all session-authenticated mutating HTML forms.

---

## Common Mistakes (Chapter Summary)

- Trusting **`initial`** or **hidden inputs** for security-sensitive values.
- Forgetting **`request.FILES`** with file fields.
- Missing **`enctype="multipart/form-data"`**.
- Using **`cleaned_data`** after **`is_valid()`** is False.
- **N+1** in dynamic **`ModelChoiceField`** querysets without **`select_related`**.
- **`BooleanField(required=True)`** misunderstanding (checkbox must be checked).
- Raising **`ValidationError`** in **`clean_field`** without returning value.

---

## Comparison Tables

| API | Bound | Unbound |
|-----|--------|---------|
| Data source | POST/FILES | None |
| `is_valid()` | validates | False |

| Method | Output structure |
|--------|------------------|
| `as_p()` | Paragraphs |
| `as_table()` | Table rows |
| `as_ul()` | List items |

| Validation hook | Scope |
|-----------------|-------|
| `clean_<field>` | Single field |
| `clean()` | Whole form |
| Validators | Reusable on many fields |

| Widget | Typical field |
|--------|----------------|
| `TextInput` | `CharField` |
| `Textarea` | long text |
| `Select` | choices |
| `ClearableFileInput` | optional file |

---

*Django **6.0.3** forms behavior should be verified against the official release notes for your deployment.*
