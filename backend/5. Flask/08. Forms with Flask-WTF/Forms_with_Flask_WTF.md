# Forms with Flask-WTF (Flask 3.1.3)

This guide explains how to build secure, validated HTML forms in Flask 3.1.3 using **Flask-WTF** and **WTForms**. You will learn how to define form classes, attach validators, protect against CSRF, render fields in Jinja2 templates, process POST data, and scale patterns toward production (e‑commerce checkouts, SaaS onboarding, social profile edits). Examples assume **Python 3.9+** and Flask **3.1.3** (released February 2026).

---

## 📑 Table of Contents

1. [8.1 Form Basics](#81-form-basics)
2. [8.2 Form Fields](#82-form-fields)
3. [8.3 Form Validators](#83-form-validators)
4. [8.4 Custom Validation](#84-custom-validation)
5. [8.5 Rendering Forms](#85-rendering-forms)
6. [8.6 Form Processing](#86-form-processing)
7. [8.7 Advanced Form Features](#87-advanced-form-features)
8. [Best Practices](#best-practices)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Comparison Tables](#comparison-tables)

---

## 8.1 Form Basics

### 8.1.1 Installing Flask-WTF

Flask-WTF integrates WTForms with Flask and adds CSRF protection. Install alongside your Flask version:

```bash
pip install Flask==3.1.3 Flask-WTF
# Often paired:
pip install email-validator
```

**🟢 Beginner Example** — minimal install check:

```python
# check_versions.py
import flask
import flask_wtf

print("Flask", flask.__version__)
print("Flask-WTF OK", flask_wtf.__version__)
```

**🟡 Intermediate Example** — `requirements.txt` fragment for a small app:

```text
Flask==3.1.3
Flask-WTF>=1.2.0
WTForms>=3.1.0
email-validator>=2.0.0
```

**🔴 Expert Example** — pinning in a lockfile workflow (conceptual):

```bash
pip install pip-tools
# requirements.in contains Flask==3.1.3 Flask-WTF ...
pip-compile requirements.in --generate-hashes -o requirements.txt
```

**🌍 Real-Time Example** — SaaS API + web UI: same virtualenv, separate processes but one dependency set; CI runs `pip install -r requirements.txt && python -m pytest`.

---

### 8.1.2 Creating Forms

A form is a Python class subclassing `FlaskForm` with class attributes for fields.

**🟢 Beginner Example**

```python
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

class HelloForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired()])
    submit = SubmitField("Say hi")
```

**🟡 Intermediate Example** — contact form for a marketing site:

```python
class ContactForm(FlaskForm):
    name = StringField("Full name", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired()])
    message = TextAreaField("Message", validators=[DataRequired()])
    submit = SubmitField("Send")
```

**🔴 Expert Example** — subclassing for shared behavior:

```python
class BaseForm(FlaskForm):
    class Meta:
        csrf_time_limit = 3600

class ProductInquiryForm(BaseForm):
    sku = StringField("SKU", validators=[DataRequired()])
    question = TextAreaField("Question")
```

**🌍 Real-Time Example** — e‑commerce “quick question” modal reuses `ProductInquiryForm`; rate limiting applied at the route, not in the form class.

---

### 8.1.3 Form Classes

`FlaskForm` binds `request.form` (and files) automatically when instantiated in a view.

**🟢 Beginner Example**

```python
@app.get("/")
@app.post("/")
def index():
    form = HelloForm()
    if form.validate_on_submit():
        return f"Hello {form.name.data}"
    return render_template("index.html", form=form)
```

**🟡 Intermediate Example** — explicit POST branch:

```python
@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if request.method == "POST" and form.validate():
        # handle login
        pass
    return render_template("login.html", form=form)
```

**🔴 Expert Example** — multiple forms on one page using `formname` prefix:

```python
class SearchForm(FlaskForm):
    class Meta:
        csrf_class = None  # only if you know the tradeoffs; usually keep CSRF

    q = StringField(validators=[DataRequired()])
```

Prefer **separate endpoints** or **hidden `form_id` field** instead of disabling CSRF.

**🌍 Real-Time Example** — social feed: “new post” and “search” as different routes (`/post`, `/search`) to avoid one page with conflicting `FlaskForm` instances.

---

### 8.1.4 Form Fields

Fields map to HTML inputs and hold `.data`, `.errors`, and widget configuration. Covered in depth in §8.2.

**🟢 Beginner Example**

```python
username = StringField("Username")
```

**🟡 Intermediate Example**

```python
remember = BooleanField("Remember me", default=False)
```

**🔴 Expert Example** — custom widget (inline in field):

```python
from wtforms.widgets import TextInput

class CurrencyWidget(TextInput):
    def __call__(self, field, **kwargs):
        kwargs.setdefault("class", "input-currency")
        return super().__call__(field, **kwargs)

class MoneyField(StringField):
    widget = CurrencyWidget()
```

**🌍 Real-Time Example** — SaaS billing: `MoneyField` for amount + server-side decimal parsing.

---

### 8.1.5 CSRF Protection

Flask-WTF enables CSRF by default. Set `SECRET_KEY` on the app.

**🟢 Beginner Example**

```python
app = Flask(__name__)
app.config["SECRET_KEY"] = "change-me-in-production"
```

**🟡 Intermediate Example** — template token:

```html
<form method="post">
  {{ form.hidden_tag() }}
  {{ form.name.label }} {{ form.name() }}
  {{ form.submit() }}
</form>
```

**🔴 Expert Example** — AJAX POST with CSRF header:

```python
# app: expose token in meta or cookie + header pattern
from flask_wtf.csrf import generate_csrf

@app.context_processor
def inject_csrf():
    return dict(csrf_token=generate_csrf)
```

```javascript
fetch("/api/profile", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": document.querySelector('meta[name="csrf-token"]').content
  },
  body: JSON.stringify({ display_name: "Ada" })
});
```

**🌍 Real-Time Example** — e‑commerce checkout: CSRF on every POST that mutates cart; idempotent GET for cart view only.

---

## 8.2 Form Fields

### 8.2.1 StringField

Single-line text.

**🟢 Beginner Example**

```python
title = StringField("Title", validators=[DataRequired(), Length(max=120)])
```

**🟡 Intermediate Example** — HTML attributes:

```python
slug = StringField("Slug", render_kw={"placeholder": "my-product"})
```

**🔴 Expert Example** — coercion pipeline in view:

```python
form.slug.data = (form.slug.data or "").strip().lower()
```

**🌍 Real-Time Example** — social media: `@handle` stored lowercase after `strip()`.

---

### 8.2.2 PasswordField

Renders `type="password"`; never pre-fill from DB.

**🟢 Beginner Example**

```python
password = PasswordField("Password", validators=[DataRequired()])
```

**🟡 Intermediate Example**

```python
password = PasswordField("Password", validators=[DataRequired(), Length(min=8)])
confirm = PasswordField("Confirm", validators=[DataRequired(), EqualTo("password")])
```

**🔴 Expert Example** — optional change-password on profile:

```python
new_password = PasswordField("New password", validators=[Optional(), Length(min=12)])
```

**🌍 Real-Time Example** — SaaS: enforce min length in form; enforce complexity in service layer or extra validators.

---

### 8.2.3 EmailField

Requires `email-validator` package for robust validation.

**🟢 Beginner Example**

```python
from wtforms import EmailField
from wtforms.validators import Email

email = EmailField("Email", validators=[DataRequired(), Email()])
```

**🟡 Intermediate Example** — normalizing:

```python
def lower_email(form, field):
    if field.data:
        field.data = field.data.strip().lower()
```

**🔴 Expert Example** — disposable domain blocklist in custom validator (see §8.4).

**🌍 Real-Time Example** — e‑commerce: email as account key; normalize before uniqueness check.

---

### 8.2.4 IntegerField / FloatField

**🟢 Beginner Example**

```python
qty = IntegerField("Quantity", validators=[DataRequired(), NumberRange(min=1)])
```

**🟡 Intermediate Example**

```python
price = FloatField("Price", validators=[Optional(), NumberRange(min=0)])
```

**🔴 Expert Example** — prefer `Decimal` for money server-side; fields still collect stringy input:

```python
from decimal import Decimal

price = StringField("Price", validators=[DataRequired(), Regex(r"^\d+(\.\d{1,2})?$")])
# then Decimal(price.data) in view/service
```

**🌍 Real-Time Example** — inventory: `IntegerField` for stock; reject floats at validator level.

---

### 8.2.5 BooleanField

**🟢 Beginner Example**

```python
accept_terms = BooleanField("I agree", validators=[DataRequired()])
```

**🟡 Intermediate Example** — “remember me” without `DataRequired`:

```python
remember = BooleanField("Remember me")
```

**🔴 Expert Example** — HTML quirk: unchecked boxes omit key; WTForms handles `False`.

**🌍 Real-Time Example** — GDPR marketing opt-in stored explicitly as `True`/`False`.

---

### 8.2.6 SelectField

**🟢 Beginner Example**

```python
country = SelectField("Country", choices=[("us", "US"), ("ca", "CA")])
```

**🟡 Intermediate Example** — dynamic choices in view:

```python
form = OrderForm()
form.shipping_method.choices = [(m.id, m.label) for m in methods]
```

**🔴 Expert Example** — validate choice against DB ids:

```python
def valid_ship_id(form, field):
    if not ShippingMethod.query.get(field.data):
        raise ValidationError("Invalid method")

shipping_method = SelectField(coerce=int, validators=[DataRequired(), valid_ship_id])
```

**🌍 Real-Time Example** — e‑commerce: shipping options from carrier API refreshed per session.

---

### 8.2.7 TextAreaField

**🟢 Beginner Example**

```python
bio = TextAreaField("Bio", validators=[Length(max=500)])
```

**🟡 Intermediate Example**

```python
review = TextAreaField("Review", render_kw={"rows": 5, "class": "textarea"})
```

**🔴 Expert Example** — sanitize HTML server-side (bleach) after validation.

**🌍 Real-Time Example** — social: post body with max length + spam heuristics in service.

---

## 8.3 Form Validators

### 8.3.1 DataRequired

Fails on empty string / whitespace-only for most fields.

**🟢 Beginner Example**

```python
name = StringField(validators=[DataRequired(message="Name is required")])
```

**🟡 Intermediate Example** — vs `InputRequired` for special widgets.

**🔴 Expert Example** — file fields: use `DataRequired` on `FileField` when upload mandatory.

**🌍 Real-Time Example** — SaaS signup: required company name.

---

### 8.3.2 Optional

Skips other validators if empty.

**🟢 Beginner Example**

```python
middle = StringField("Middle name", validators=[Optional(), Length(max=50)])
```

**🟡 Intermediate Example**

```python
phone = StringField("Phone", validators=[Optional(), Length(min=10, max=15)])
```

**🔴 Expert Example** — conditional password change (§8.2).

**🌍 Real-Time Example** — e‑commerce optional apartment line.

---

### 8.3.3 Length

**🟢 Beginner Example**

```python
username = StringField(validators=[Length(min=3, max=32)])
```

**🟡 Intermediate Example**

```python
code = StringField(validators=[Length(equal=6)])
```

**🔴 Expert Example** — UTF-8 grapheme counting needs custom logic beyond `len()`.

**🌍 Real-Time Example** — social display names: max 50 chars for UI consistency.

---

### 8.3.4 NumberRange

**🟢 Beginner Example**

```python
age = IntegerField(validators=[NumberRange(min=13, max=120)])
```

**🟡 Intermediate Example**

```python
discount = FloatField(validators=[Optional(), NumberRange(min=0, max=0.5)])
```

**🔴 Expert Example** — stock cannot exceed warehouse max: cross-field in §8.4.

**🌍 Real-Time Example** — loyalty points redemption caps.

---

### 8.3.5 Email / URL / Regex

**🟢 Beginner Example**

```python
site = StringField(validators=[Optional(), URL()])
```

**🟡 Intermediate Example**

```python
import re
pattern = re.compile(r"^[A-Z]{2}-\d{4}$")
code = StringField(validators=[Regex(pattern, message="Use format AA-1234")])
```

**🔴 Expert Example** — URL validator does not guarantee reachability; add async job to verify.

**🌍 Real-Time Example** — SaaS webhook URL field.

---

### 8.3.6 EqualTo

**🟢 Beginner Example**

```python
password = PasswordField(validators=[DataRequired()])
confirm = PasswordField(validators=[DataRequired(), EqualTo("password")])
```

**🟡 Intermediate Example** — field names are attribute names on the form class.

**🔴 Expert Example** — localization: pass `message=` for i18n.

**🌍 Real-Time Example** — registration flows.

---

## 8.4 Custom Validation

### 8.4.1 Custom Validators

Callable `def _name(form, field):` raising `ValidationError`.

**🟢 Beginner Example**

```python
from wtforms import ValidationError

def no_spaces(form, field):
    if " " in (field.data or ""):
        raise ValidationError("No spaces allowed")

username = StringField(validators=[DataRequired(), no_spaces])
```

**🟡 Intermediate Example** — uniqueness (sync DB check):

```python
def unique_email(form, field):
    if User.query.filter_by(email=field.data.lower()).first():
        raise ValidationError("Email already registered")

email = EmailField(validators=[DataRequired(), Email(), unique_email])
```

**🔴 Expert Example** — validator that uses `form.other_field.data`.

**🌍 Real-Time Example** — SaaS: reserved subdomain list.

---

### 8.4.2 Field Validation

Same as custom validators attached to `validators=[...]`.

**🟢 Beginner Example** — see §8.4.1.

**🟡 Intermediate Example** — `validate_<fieldname>` method on form:

```python
class SignupForm(FlaskForm):
    email = EmailField(validators=[DataRequired(), Email()])

    def validate_email(self, field):
        if field.data.endswith("@tempmail.com"):
            raise ValidationError("Disposable emails not allowed")
```

**🔴 Expert Example** — combine method + reusable functions for testing.

**🌍 Real-Time Example** — block competitor domains on B2B signup.

---

### 8.4.3 Form-Level Validation

Override `validate(self, extra_validators=None)`.

**🟢 Beginner Example**

```python
class DateRangeForm(FlaskForm):
    start = StringField(validators=[DataRequired()])
    end = StringField(validators=[DataRequired()])

    def validate(self, extra_validators=None):
        rv = FlaskForm.validate(self, extra_validators)
        if not rv:
            return False
        if self.start.data > self.end.data:
            self.end.errors.append("End must be after start")
            return False
        return True
```

**🟡 Intermediate Example** — coupon `valid_from` / `valid_until`.

**🔴 Expert Example** — attach errors to `form.form_errors` via `raise ValidationError` on a dummy field pattern.

**🌍 Real-Time Example** — SaaS reporting: enforce max 90-day window.

---

### 8.4.4 Cross-Field Validation

**🟢 Beginner Example** — password + confirm with `EqualTo`.

**🟡 Intermediate Example** — billing: if `country == "US"`, `state` required:

```python
def require_state_if_us(form, field):
    if form.country.data == "us" and not field.data:
        raise ValidationError("State required for US addresses")
```

**🔴 Expert Example** — dynamic min order quantity per product category.

**🌍 Real-Time Example** — e‑commerce tax/VAT id required when EU B2B toggled.

---

### 8.4.5 Asynchronous Validation

WTForms validation is synchronous; “async” in production means **separate endpoint** or **background job**.

**🟢 Beginner Example** — debounced client fetch to `/api/check-username?u=...`.

**🟡 Intermediate Example**

```python
@app.get("/api/check-username")
def check_username():
    u = request.args.get("u", "")
    taken = User.query.filter_by(username=u.lower()).first() is not None
    return {"taken": taken}
```

**🔴 Expert Example** — HTMX: `hx-get` on blur triggers partial swap with error span.

**🌍 Real-Time Example** — fraud service score for card BIN (call external API in view/service, not inside WTForms validator to avoid blocking).

---

## 8.5 Rendering Forms

### 8.5.1 Form Rendering in Templates

**🟢 Beginner Example**

```html
<form method="post" novalidate>
  {{ form.hidden_tag() }}
  <p>{{ form.name.label }} {{ form.name() }}</p>
  <p>{{ form.submit() }}</p>
</form>
```

**🟡 Intermediate Example** — Bootstrap classes via `render_kw` on fields.

**🔴 Expert Example** — macros for DRY field rendering.

**🌍 Real-Time Example** — design system components in Jinja macros shared across SaaS modules.

---

### 8.5.2 Field Rendering

**🟢 Beginner Example** — `{{ form.email(size=32) }}`.

**🟡 Intermediate Example** — `field(**kwargs)` merges `render_kw`.

**🔴 Expert Example** — custom widgets for accessibility `aria-describedby`.

**🌍 Real-Time Example** — e‑commerce accessibility audit fixes.

---

### 8.5.3 Error Display

**🟢 Beginner Example**

```html
{% if form.name.errors %}
  <ul class="errors">
    {% for e in form.name.errors %}<li>{{ e }}</li>{% endfor %}
  </ul>
{% endif %}
```

**🟡 Intermediate Example** — `form.errors` dict for summary banner.

**🔴 Expert Example** — map WTForms errors to API JSON `{"errors": {"email": ["..."]}}`.

**🌍 Real-Time Example** — SPA + Flask API: same error shape as mobile client.

---

### 8.5.4 CSRF Token

Always include `hidden_tag()` or equivalent in classic HTML forms.

**🟢 Beginner Example** — see §8.1.5.

**🟡 Intermediate Example** — `{{ csrf_token() }}` in forms without `FlaskForm` (manual).

**🔴 Expert Example** — `WTF_CSRF_TIME_LIMIT` tuning.

**🌍 Real-Time Example** — long checkout: extend limit or refresh token with meta refresh pattern.

---

### 8.5.5 Form Layout

**🟢 Beginner Example** — table layout (legacy).

**🟡 Intermediate Example** — CSS grid / flex in template.

**🔴 Expert Example** — fieldsets via Jinja blocks + `{% call %}` macros.

**🌍 Real-Time Example** — multi-step wizard: one route per step, `session` for intermediate data.

---

## 8.6 Form Processing

### 8.6.1 Form Submission

**🟢 Beginner Example**

```python
@app.post("/submit")
def submit():
    form = MyForm()
    if form.validate_on_submit():
        return redirect(url_for("thanks"))
    return render_template("form.html", form=form), 400
```

**🟡 Intermediate Example** — `validate_on_submit()` is `POST` + validates.

**🔴 Expert Example** — idempotency keys for payments (header + server store).

**🌍 Real-Time Example** — double-submit prevention on “Place order”.

---

### 8.6.2 Form Data Handling

**🟢 Beginner Example** — `form.field.data`.

**🟡 Intermediate Example** — `request.files` via `FileField`.

**🔴 Expert Example** — immutable DTO passed to service layer.

**🌍 Real-Time Example** — social: sanitize markdown, store raw + rendered.

---

### 8.6.3 Validation on Submit

**🟢 Beginner Example** — `validate_on_submit()`.

**🟡 Intermediate Example** — manual `form.validate()` for APIs returning JSON.

**🔴 Expert Example** — partial validation for step forms.

**🌍 Real-Time Example** — SaaS trial: soft validation on step 1, hard on final.

---

### 8.6.4 Redirect After POST

**🟢 Beginner Example**

```python
from flask import redirect, url_for, flash

if form.validate_on_submit():
    flash("Saved")
    return redirect(url_for("profile"))
```

**🟡 Intermediate Example** — PRG pattern prevents refresh duplicates.

**🔴 Expert Example** — `url_for` with `_external=True` only when needed.

**🌍 Real-Time Example** — e‑commerce order confirmation page after POST.

---

### 8.6.5 Dynamic Forms

**🟢 Beginner Example** — set `choices` per request.

**🟡 Intermediate Example** — `FieldList` + `FormField` for line items.

```python
from wtforms import FieldList, FormField, Form as WTForm

class LineItemForm(WTForm):
    sku = StringField(validators=[DataRequired()])
    qty = IntegerField(validators=[DataRequired(), NumberRange(min=1)])

class CartForm(FlaskForm):
    lines = FieldList(FormField(LineItemForm), min_entries=1)
```

**🔴 Expert Example** — cap `max_entries` to prevent DoS.

**🌍 Real-Time Example** — B2B bulk order rows.

---

## 8.7 Advanced Form Features

### 8.7.1 File Upload Fields

**🟢 Beginner Example**

```python
from flask_wtf.file import FileField, FileAllowed, FileRequired

class UploadForm(FlaskForm):
    photo = FileField("Photo", validators=[FileRequired(), FileAllowed(["jpg", "png"])])
```

**🟡 Intermediate Example** — save securely:

```python
import os
from werkzeug.utils import secure_filename

@app.post("/upload")
def upload():
    form = UploadForm()
    if form.validate_on_submit():
        f = form.photo.data
        name = secure_filename(f.filename)
        f.save(os.path.join(app.config["UPLOAD_FOLDER"], name))
        return "ok"
    return render_template("upload.html", form=form)
```

**🔴 Expert Example** — virus scan queue, S3 presigned upload separate from WTForms.

**🌍 Real-Time Example** — social avatar: resize in worker, store CDN URL in DB.

---

### 8.7.2 Dynamic Field Addition

**🟢 Beginner Example** — `FieldList.append_entry()` in view after POST.

**🟡 Intermediate Example** — JavaScript adds rows; server validates count.

**🔴 Expert Example** — reconstruct expected indices to prevent tampering.

**🌍 Real-Time Example** — SaaS seat licenses: N invite email fields.

---

### 8.7.3 Nested Forms

See `FormField` + `FieldList` in §8.6.5.

**🟢 Beginner Example** — single nested `AddressForm`.

**🟡 Intermediate Example** — shipping vs billing nested duplication.

**🔴 Expert Example** — `model_form` patterns with WTForms-Alchemy (extension).

**🌍 Real-Time Example** — e‑commerce multi-package shipment.

---

### 8.7.4 AJAX Form Submission

**🟢 Beginner Example** — `fetch` POST `FormData` from `FormData(formElement)`.

**🟡 Intermediate Example** — return JSON `{ok: true}` or `{errors: ...}`.

**🔴 Expert Example** — CSRF in header; `credentials: "same-origin"`.

**🌍 Real-Time Example** — inline comment box on social post without full reload.

---

### 8.7.5 Best Practices (Feature Summary)

Combine: rate limit, honeypot field (server reject), logging, and server-side price verification for commerce.

**🟢 Beginner Example** — honeypot:

```python
class PublicForm(FlaskForm):
    website = StringField(validators=[Optional()])  # hidden in CSS; bots fill

    def validate_website(self, field):
        if field.data:
            raise ValidationError("Bot suspected")
```

**🟡 Intermediate Example** — never trust client-sent totals; recompute from DB prices.

**🔴 Expert Example** — WAF + CSRF + SameSite cookies.

**🌍 Real-Time Example** — Black Friday: queue checkout POSTs.

---

## Best Practices

1. **Always set `SECRET_KEY`** in every environment (use env vars).
2. **Keep CSRF enabled** for cookie-session browsers; use tokens for AJAX.
3. **Validate on the server** — client validation is UX only.
4. **Use `secure_filename`** and content checks for uploads.
5. **Prefer PRG** (redirect after successful POST).
6. **Normalize inputs** (email lowercasing, strip whitespace) in validators or a dedicated service layer.
7. **Separate forms** per route when possible to simplify validation logic.
8. **Test forms** with Flask test client posting multipart and standard forms.
9. **Avoid fat validators** that call slow external APIs synchronously.
10. **Document field contracts** for frontend/mobile teams (JSON error shape).

**🟢 Beginner Example** — env-based secret:

```python
import os
app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]
```

**🟡 Intermediate Example** — `WTF_CSRF_SSL_STRICT = True` behind HTTPS.

**🔴 Expert Example** — split read/write models: form → command → domain validation.

**🌍 Real-Time Example** — PCI scope reduction: card data never touches your WTForms (use Stripe Elements).

---

## Common Mistakes to Avoid

1. **Missing `hidden_tag()`** → 400 CSRF errors.
2. **`validate()` on GET** → false negatives; use `validate_on_submit()`.
3. **Trusting `FloatField` for currency** → rounding bugs; use `Decimal`.
4. **Huge `FieldList` without caps** → CPU/memory DoS.
5. **Disabling CSRF** “temporarily” and shipping it.
6. **Unique checks riddled with race conditions** — add DB unique constraints.
7. **Returning 200 on validation failure** without clear UX feedback.
8. **Storing passwords in forms longer than needed** — hash immediately.
9. **Forgetting `enctype="multipart/form-data"`** on file upload forms.
10. **Using `DataRequired()` on checkboxes incorrectly** — use custom validation for “must check”.

**🟢 Beginner Example** — fix upload form:

```html
<form method="post" enctype="multipart/form-data">
  {{ form.hidden_tag() }}
  ...
</form>
```

**🟡 Intermediate Example** — use DB transaction for signup + profile row.

**🔴 Expert Example** — log validation failures without storing PII.

**🌍 Real-Time Example** — rate-limit password reset POST by IP + email hash.

---

## Comparison Tables

### FlaskForm vs raw `request.form`

| Aspect | FlaskForm / WTForms | Manual `request.form` |
|--------|---------------------|------------------------|
| Validation | Declarative validators | Hand-written checks |
| CSRF | Built-in via `hidden_tag` | Manual `csrf` utilities |
| Errors | Per-field errors | Custom dict assembly |
| Testing | Easy to unit test rules | More boilerplate |
| Coupling | Medium to templates | Low |

### Validators quick reference

| Validator | Typical use |
|-----------|-------------|
| `DataRequired` | Non-empty value |
| `Optional` | Skip other validators if empty |
| `Length` | String bounds |
| `NumberRange` | Numeric bounds |
| `Email` | Email shape |
| `URL` | URL shape |
| `Regex` | Custom pattern |
| `EqualTo` | Password confirm |

### When to use `FieldList`

| Scenario | Use `FieldList`? |
|----------|------------------|
| Fixed small set of fields | No — explicit fields |
| User-defined rows (1..N) | Yes |
| Very large N | Prefer batch import / separate API |

---

*End of Forms with Flask-WTF notes — Flask 3.1.3, Python 3.9+.*
