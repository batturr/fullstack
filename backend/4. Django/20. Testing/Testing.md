# Django Testing — Reference Notes (Django 6.0.3)

Django’s test framework builds on **Python `unittest`**, adding **database isolation**, **HTTP `Client`**, **RequestFactory**, and tooling for **fixtures**, **mocking**, and **CI**. **Django 6.0.3** on **Python 3.12–3.14** supports `DiscoverRunner`, parallel tests (where configured), and integrates cleanly with **pytest-django** for many teams. These notes follow a TypeScript-style reference: TOC, exhaustive subtopics, and four example levels per major concept.

---

## 📑 Table of Contents

1. [20.1 Testing Basics](#201-testing-basics)
2. [20.2 Model Testing](#202-model-testing)
3. [20.3 View Testing](#203-view-testing)
4. [20.4 Form Testing](#204-form-testing)
5. [20.5 Database Testing](#205-database-testing)
6. [20.6 Advanced Testing](#206-advanced-testing)
7. [20.7 Test Organization](#207-test-organization)
8. [20.8 Continuous Testing](#208-continuous-testing)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 20.1 Testing Basics

### 20.1.1 unittest Framework

**Concept:** Tests are methods on `unittest.TestCase` subclasses; assertions like `assertEqual`, `assertTrue`.

#### 🟢 Beginner Example (simple, foundational)

```python
import unittest

class MathTests(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1 + 1, 2)
```

#### 🟡 Intermediate Example (practical patterns)

```python
from django.test import TestCase

class SmokeTests(TestCase):
    def test_app_imports(self):
        import shop  # noqa: F401
```

#### 🔴 Expert Example (advanced usage)

```python
from django.test import SimpleTestCase

class PureUtilTests(SimpleTestCase):
    def test_slugify(self):
        from django.utils.text import slugify
        self.assertEqual(slugify("Hello World"), "hello-world")
```

#### 🌍 Real-Time Example (production / SaaS)

CI runs `unittest` discovery plus Django’s runner for DB tests in parallel shards.

### 20.1.2 Test Structure

**Concept:** `tests/` package or `tests.py`; modules named `test_*.py`; classes `Test*`; methods `test_*`.

#### 🟢 Beginner Example

```
shop/
  tests/
    __init__.py
    test_models.py
    test_views.py
```

#### 🟡 Intermediate Example

Mirror application structure: `tests/test_services/billing.py`.

#### 🔴 Expert Example

Split fast `SimpleTestCase` suites from `TransactionTestCase` for speed.

#### 🌍 Real-Time Example

Monorepo: Django app tests colocated; shared `conftest.py` for pytest fixtures at repo root.

### 20.1.3 TestCase Class

**Concept:** `django.test.TestCase` wraps `unittest.TestCase` with DB fixtures and assertion helpers.

#### 🟢 Beginner Example

```python
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTests(TestCase):
    def test_create_user(self):
        u = User.objects.create_user("a", "a@a.com", "pw")
        self.assertFalse(u.is_superuser)
```

#### 🟡 Intermediate Example

```python
class OrderTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = Customer.objects.create(name="Acme")
```

#### 🔴 Expert Example

```python
from django.test import TransactionTestCase

class OutboxTests(TransactionTestCase):
    def test_on_commit_fires(self):
        with self.captureOnCommitCallbacks(execute=True):
            Order.objects.create(customer=self.customer)
```

#### 🌍 Real-Time Example

E-commerce: `TestCase` for most tests; `TransactionTestCase` only for testing `on_commit` without execute helper edge cases.

### 20.1.4 Test Methods

**Concept:** Each `test_*` runs independently; `setUp` per method, `setUpTestData` per class (once).

#### 🟢 Beginner Example

```python
def setUp(self):
    self.user = User.objects.create_user("u", "u@u.com", "pw")
```

#### 🟡 Intermediate Example

```python
def test_permission_denied(self):
    self.client.login(username="u", password="pw")
    resp = self.client.get("/admin/")
    self.assertEqual(resp.status_code, 302)
```

#### 🔴 Expert Example

```python
def test_idempotent_webhook(self):
    for _ in range(2):
        self.assertEqual(self.post_webhook().status_code, 200)
```

#### 🌍 Real-Time Example

SaaS: replay Stripe webhook test twice to assert idempotency.

### 20.1.5 Running Tests

**Concept:** `python manage.py test [app_label[.TestClass[.test_name]]]`; `DiscoverRunner`.

#### 🟢 Beginner Example

```bash
python manage.py test
```

#### 🟡 Intermediate Example

```bash
python manage.py test shop.tests.test_models.OrderTests
```

#### 🔴 Expert Example

```bash
python manage.py test --parallel auto --keepdb
```

#### 🌍 Real-Time Example

GitHub Actions matrix: Python 3.12/3.13/3.14 × Postgres service container.

---

## 20.2 Model Testing

### 20.2.1 Creating Model Tests

**Concept:** Use ORM in tests; DB rolled back between tests in `TestCase`.

#### 🟢 Beginner Example

```python
def test_product_str(self):
    p = Product.objects.create(name="Mug", price="9.99")
    self.assertIn("Mug", str(p))
```

#### 🟡 Intermediate Example

```python
def test_order_line_total(self):
    order = Order.objects.create(customer=self.customer, total=0)
    LineItem.objects.create(order=order, product=self.product, quantity=2, unit_price="5.00")
    self.assertEqual(order.lines.count(), 1)
```

#### 🔴 Expert Example

```python
def test_select_for_update(self):
    from django.db import transaction
    with transaction.atomic():
        Order.objects.select_for_update().get(pk=self.order.pk)
```

#### 🌍 Real-Time Example

Inventory decrement race: concurrent `TestCase` using threads + `transaction.atomic` (often `TransactionTestCase`).

### 20.2.2 Model Instance Testing

**Concept:** Properties, methods, state transitions.

#### 🟢 Beginner Example

```python
def test_is_shippable(self):
    self.assertTrue(self.order.is_shippable())
```

#### 🟡 Intermediate Example

```python
def test_mark_paid(self):
    self.invoice.mark_paid()
    self.assertEqual(self.invoice.status, "paid")
```

#### 🔴 Expert Example

```python
def test_version_increment(self):
    v1 = self.doc.version
    self.doc.publish()
    self.assertGreater(self.doc.version, v1)
```

#### 🌍 Real-Time Example

SaaS subscription state machine: illegal transitions raise.

### 20.2.3 Method Testing

**Concept:** Unit-test pure methods without DB when possible.

#### 🟢 Beginner Example

```python
def test_full_name(self):
    u = User(first_name="A", last_name="B")
    self.assertEqual(u.get_full_name(), "A B")
```

#### 🟡 Intermediate Example

```python
def test_price_with_tax(self):
    self.assertEqual(Product(price=100).price_with_tax(rate=0.2), 120)
```

#### 🔴 Expert Example

Extract calculation to module function for easier testing than ORM instance.

#### 🌍 Real-Time Example

E-commerce tax engine: table-driven tests for jurisdictions.

### 20.2.4 Validation Testing

**Concept:** `full_clean()` raises `ValidationError`.

#### 🟢 Beginner Example

```python
from django.core.exceptions import ValidationError

def test_negative_price(self):
    p = Product(name="x", price=-1)
    with self.assertRaises(ValidationError):
        p.full_clean()
```

#### 🟡 Intermediate Example

```python
with self.assertRaises(ValidationError) as ctx:
    event.full_clean()
self.assertIn("ends_at", ctx.exception.error_dict)
```

#### 🔴 Expert Example

```python
with self.assertRaisesMessage(ValidationError, "..."):
    obj.full_clean()
```

#### 🌍 Real-Time Example

SaaS: model constraints mirrored by `full_clean` tests + migration constraint tests on Postgres.

### 20.2.5 Signal Testing

**Concept:** Assert side effects; use `captureOnCommitCallbacks` for deferred work.

#### 🟢 Beginner Example

```python
def test_profile_created_signal(self):
    User.objects.create_user("n", "n@n.com", "pw")
    self.assertTrue(Profile.objects.filter(user__username="n").exists())
```

#### 🟡 Intermediate Example

```python
from django.db.models.signals import post_save

post_save.disconnect(receiver, sender=Order)
try:
    Order.objects.create(...)
finally:
    post_save.connect(receiver, sender=Order, dispatch_uid="orders.receiver")
```

#### 🔴 Expert Example

```python
with self.captureOnCommitCallbacks(execute=True):
    Order.objects.create(...)
self.assertTrue(Task.objects.filter(name="fulfill").exists())
```

#### 🌍 Real-Time Example

E-commerce: enqueue task only after commit.

---

## 20.3 View Testing

### 20.3.1 Client for Testing

**Concept:** `self.client` on `TestCase` is `django.test.Client` (WSGI); use `AsyncClient` for async views.

#### 🟢 Beginner Example

```python
def test_homepage(self):
    resp = self.client.get("/")
    self.assertEqual(resp.status_code, 200)
```

#### 🟡 Intermediate Example

```python
from django.test import Client

c = Client(HTTP_HOST="tenant.example.com")
```

#### 🔴 Expert Example

```python
from django.test import AsyncClient

class AsyncViewTests(TestCase):
    async def test_feed(self):
        c = AsyncClient()
        resp = await c.get("/feed/")
        self.assertEqual(resp.status_code, 200)
```

#### 🌍 Real-Time Example

SaaS: pass tenant host header in client tests for middleware routing.

### 20.3.2 GET / POST Requests

**Concept:** `client.get/post` with data, content_type, follow redirects.

#### 🟢 Beginner Example

```python
resp = self.client.post("/login/", {"username": "u", "password": "pw"})
```

#### 🟡 Intermediate Example

```python
import json

resp = self.client.post(
    "/api/orders/",
    data=json.dumps({"sku": "ABC", "qty": 2}),
    content_type="application/json",
)
```

#### 🔴 Expert Example

```python
resp = self.client.post("/checkout/", data=payload, follow=True)
self.assertEqual(resp.redirect_chain[-1][0], 200)
```

#### 🌍 Real-Time Example

E-commerce checkout POST with CSRF token from `client.get` first.

### 20.3.3 Status Code Checking

**Concept:** `assertEqual(resp.status_code, expected)`.

#### 🟢 Beginner Example

```python
self.assertEqual(self.client.get("/about/").status_code, 200)
```

#### 🟡 Intermediate Example

```python
self.assertEqual(self.client.get("/secret/").status_code, 302)
```

#### 🔴 Expert Example

```python
self.assertEqual(self.client.get("/api/me/").status_code, 401)
```

#### 🌍 Real-Time Example

API contract tests: table of routes × auth × expected status.

### 20.3.4 Template Context Testing

**Concept:** `assertTemplateUsed`, `response.context` for rendered responses.

#### 🟢 Beginner Example

```python
from django.urls import reverse

resp = self.client.get(reverse("post_detail", args=[self.post.slug]))
self.assertContains(resp, self.post.title)
```

#### 🟡 Intermediate Example

```python
self.assertTemplateUsed(resp, "blog/post_detail.html")
```

#### 🔴 Expert Example

```python
self.assertEqual(resp.context["post"].pk, self.post.pk)
```

#### 🌍 Real-Time Example

Social: ensure moderation flag surfaces in template context for staff.

---

## 20.4 Form Testing

### 20.4.1 Form Validation Testing

**Concept:** Instantiate form with data; `is_valid()`, `errors`.

#### 🟢 Beginner Example

```python
from django.test import TestCase
from shop.forms import ContactForm

class ContactFormTests(TestCase):
    def test_valid(self):
        f = ContactForm({"email": "a@a.com", "message": "hi"})
        self.assertTrue(f.is_valid())

    def test_invalid_email(self):
        f = ContactForm({"email": "bad", "message": "hi"})
        self.assertFalse(f.is_valid())
        self.assertIn("email", f.errors)
```

#### 🟡 Intermediate Example

```python
def test_cross_field(self):
    f = OrderForm({"start": "2026-01-02", "end": "2026-01-01"})
    self.assertFalse(f.is_valid())
```

#### 🔴 Expert Example

```python
f = OrderForm(data, initial={"currency": "USD"})
```

#### 🌍 Real-Time Example

SaaS signup: assert password policy errors.

### 20.4.2 Form Field Testing

**Concept:** Bound field values, widgets, required flags.

#### 🟢 Beginner Example

```python
from django import forms

class MyForm(forms.Form):
    accept_terms = forms.BooleanField(required=True)

f = MyForm()
self.assertTrue(f.fields["accept_terms"].required)
```

#### 🟡 Intermediate Example

```python
f = MyForm({"qty": "not-int"})
self.assertFalse(f.is_valid())
```

#### 🔴 Expert Example

```python
html = f.as_p()
self.assertIn('name="qty"', html)
```

#### 🌍 Real-Time Example

E-commerce: dynamic pack-size field appears for wholesale users.

### 20.4.3 Model Form Testing

**Concept:** `ModelForm` saves instance; test DB state.

#### 🟢 Beginner Example

```python
f = ArticleForm({"title": "T", "body": "B"})
self.assertTrue(f.is_valid())
article = f.save()
self.assertEqual(article.title, "T")
```

#### 🟡 Intermediate Example

```python
f = ArticleForm({"title": "T", "body": "B"}, instance=self.article)
self.assertTrue(f.is_valid())
f.save()
self.article.refresh_from_db()
```

#### 🔴 Expert Example

```python
f.save(commit=False)
f.instance.author = self.user
f.save_m2m()
```

#### 🌍 Real-Time Example

Admin-like forms: `save_m2m` after `commit=False`.

### 20.4.4 Error Testing

**Concept:** `assertFormError`, `assertFormsetError` (Django test tools).

#### 🟢 Beginner Example

```python
from django.test import TestCase

class FormErrorTests(TestCase):
    def test_errors(self):
        f = LoginForm({})
        self.assertFalse(f.is_valid())
        self.assertFormError(f, "username", "This field is required.")
```

#### 🟡 Intermediate Example

```python
self.assertFormError(f, field=None, errors="Invalid credentials")
```

#### 🔴 Expert Example

```python
self.assertEqual(f.errors.as_json(), "...")
```

#### 🌍 Real-Time Example

API forms returning JSON errors — parse and assert keys.

### 20.4.5 Widget Testing

**Concept:** Widget `render` output; admin widgets integration tests.

#### 🟢 Beginner Example

```python
from django.forms import TextInput

w = TextInput(attrs={"class": "input"})
html = w.render("name", "val")
self.assertIn('class="input"', html)
```

#### 🟡 Intermediate Example

```python
from django import forms

class F(forms.Form):
    note = forms.CharField(widget=forms.Textarea)

f = F()
self.assertIsInstance(f.fields["note"].widget, forms.Textarea)
```

#### 🔴 Expert Example

Selenium/Playwright for JS-heavy widgets if needed.

#### 🌍 Real-Time Example

Date picker widget includes `autocomplete="off"` for compliance.

---

## 20.5 Database Testing

### 20.5.1 Fixtures

**Concept:** Serialized data loaded with `fixtures` class attr or `loaddata`.

#### 🟢 Beginner Example

```python
class CatalogTests(TestCase):
    fixtures = ["categories.json"]
```

#### 🟡 Intermediate Example

Prefer `setUpTestData` factory over static JSON for maintainability.

#### 🔴 Expert Example

```python
from django.core.management import call_command

call_command("loaddata", "minimal.json", verbosity=0)
```

#### 🌍 Real-Time Example

Legacy ERP snapshot fixture for integration tests only in nightly job.

### 20.5.2 Test Database

**Concept:** Django creates `test_<dbname>`; mirrors migrations.

#### 🟢 Beginner Example

Default SQLite file `:memory:` in dev for speed.

#### 🟡 Intermediate Example

```python
DATABASES["default"]["TEST"] = {"NAME": "test_myapp"}
```

#### 🔴 Expert Example

```python
DATABASES["default"]["TEST"]["MIGRATE"] = False  # expert tuning
```

#### 🌍 Real-Time Example

CI Postgres: service container + `TEST` dict with `HOST` env.

### 20.5.3 Database Transactions

**Concept:** `TestCase` wraps each test in transaction and rolls back.

#### 🟢 Beginner Example

```python
def test_creates_row(self):
    Product.objects.create(name="x", price=1)
    self.assertEqual(Product.objects.count(), 1)
```

#### 🟡 Intermediate Example

```python
from django.test import TransactionTestCase

class RealCommitTests(TransactionTestCase):
    def test_signal_sees_commit(self):
        ...
```

#### 🔴 Expert Example

```python
from django.db import connection

def test_raw_connection(self):
    with connection.cursor() as c:
        c.execute("SELECT 1")
```

#### 🌍 Real-Time Example

Testing multi-db routing with `TransactionTestCase`.

### 20.5.4 Setup / Teardown

**Concept:** `setUp`, `tearDown`, `setUpClass`, `tearDownClass`, `setUpTestData`.

#### 🟢 Beginner Example

```python
from django.core.cache import cache

def tearDown(self):
    cache.clear()
```

#### 🟡 Intermediate Example

```python
@classmethod
def setUpTestData(cls):
    cls.org = Organization.objects.create(name="O")
```

#### 🔴 Expert Example

```python
def setUp(self):
    self.addCleanup(self.tmpdir.cleanup)
```

#### 🌍 Real-Time Example

SaaS: clear cache keys per test to avoid leakage.

### 20.5.5 Resetting Database State

**Concept:** Rely on rollback; for `TransactionTestCase`, truncate between tests.

#### 🟢 Beginner Example

Use `TestCase` default rollback.

#### 🟡 Intermediate Example

```python
def test_flaky_cache(self):
    cache.clear()
```

#### 🔴 Expert Example

```python
from django.core.management import call_command

call_command("flush", interactive=False)
```

#### 🌍 Real-Time Example

E2E job rebuilds DB once per suite, not per test.

---

## 20.6 Advanced Testing

### 20.6.1 Mocking

**Concept:** `unittest.mock.patch` to replace imports or methods.

#### 🟢 Beginner Example

```python
from unittest.mock import patch

@patch("shop.views.stripe.Charge.create")
def test_charge(self, mock_create):
    mock_create.return_value = {"id": "ch_1"}
    resp = self.client.post("/pay/")
    self.assertEqual(resp.status_code, 302)
```

#### 🟡 Intermediate Example

```python
from unittest.mock import patch

with patch("shop.services.email.send_mail") as m:
    notify_user(1)
    m.assert_called_once()
```

#### 🔴 Expert Example

```python
from unittest.mock import patch
from django.test import Client

with patch.object(Client, "post", side_effect=TimeoutError):
    ...
```

#### 🌍 Real-Time Example

SaaS: mock outbound HTTP with `responses` or `httpx_mock`.

### 20.6.2 Patching

**Concept:** Patch where the symbol is **looked up** (usually where it is used, not defined).

#### 🟢 Beginner Example

```python
@patch("myapp.views.get_geocode")
```

#### 🟡 Intermediate Example

```python
@patch("myapp.views.cache.get", return_value=None)
```

#### 🔴 Expert Example

```python
patcher = patch("...")
self.addCleanup(patcher.stop)
patcher.start()
```

#### 🌍 Real-Time Example

Patch settings: `@override_settings(DEBUG=False)`.

### 20.6.3 Integration Testing

**Concept:** Multiple layers: DB + views + templates.

#### 🟢 Beginner Example

```python
def test_checkout_flow(self):
    self.client.login(username="u", password="pw")
    self.client.post("/cart/add/", {"sku": "X", "qty": 1})
    resp = self.client.post("/checkout/", {})
    self.assertEqual(resp.status_code, 200)
```

#### 🟡 Intermediate Example

Celery eager mode in test settings:

```python
CELERY_TASK_ALWAYS_EAGER = True
```

#### 🔴 Expert Example

Test management commands that orchestrate services.

#### 🌍 Real-Time Example

E-commerce: place order, assert `Order` + `PaymentIntent` rows.

### 20.6.4 E2E Testing

**Concept:** Browser automation outside Django test runner or via Playwright.

#### 🟢 Beginner Example

```python
# Pseudocode — Playwright
# page.goto("/"); expect(page).to_have_title("Shop")
```

#### 🟡 Intermediate Example

Run against `LiveServerTestCase` URL.

#### 🔴 Expert Example

```python
from django.contrib.staticfiles.testing import StaticLiveServerTestCase

class E2E(StaticLiveServerTestCase):
    fixtures = ["user.json"]
```

#### 🌍 Real-Time Example

Critical smoke: login, create post, logout in staging.

### 20.6.5 pytest Integration

**Concept:** `pytest-django` provides `django_db` marker, fixtures, settings.

#### 🟢 Beginner Example

```python
import pytest

@pytest.mark.django_db
def test_user_count():
    from django.contrib.auth import get_user_model
    User = get_user_model()
    assert User.objects.count() >= 0
```

#### 🟡 Intermediate Example

```python
import pytest

@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()
```

#### 🔴 Expert Example

```python
@pytest.mark.django_db(transaction=True)
def test_on_commit():
    ...
```

#### 🌍 Real-Time Example

Parametrized tests for all roles × endpoints.

---

## 20.7 Test Organization

### 20.7.1 Test Discovery

**Concept:** `manage.py test` discovers `test*.py` under apps in `INSTALLED_APPS`.

#### 🟢 Beginner Example

File `tests/test_foo.py` discovered automatically.

#### 🟡 Intermediate Example

```ini
# pytest.ini
# DJANGO_SETTINGS_MODULE = project.settings
```

#### 🔴 Expert Example

Custom runner `TEST_RUNNER` for tagging slow tests.

#### 🌍 Real-Time Example

Split `fast` vs `slow` in CI jobs.

### 20.7.2 Test Isolation

**Concept:** Avoid global state; clear cache; unique keys.

#### 🟢 Beginner Example

```python
def test_a(self):
    cache.set("k1", 1, timeout=60)
```

#### 🟡 Intermediate Example

```python
from django.test import override_settings

@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
class CacheTests(TestCase):
    ...
```

#### 🔴 Expert Example

Time freezing with `freezegun` for deterministic timestamps.

#### 🌍 Real-Time Example

SaaS: isolate per-test tenant schema if using schema-per-tenant.

### 20.7.3 Test Fixtures

**Concept:** Reusable setup via methods, factories, or pytest fixtures.

#### 🟢 Beginner Example

```python
def make_user(username="u"):
    return User.objects.create_user(username, f"{username}@x.com", "pw")
```

#### 🟡 Intermediate Example

```python
import factory
from factory.django import DjangoModelFactory

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Sequence(lambda n: f"user{n}")
```

#### 🔴 Expert Example

```python
class Scenario:
    @staticmethod
    def paid_order():
        ...
```

#### 🌍 Real-Time Example

E-commerce: factory creates product with inventory rows.

### 20.7.4 Factories

**Concept:** `factory_boy` builds graphs of related objects.

#### 🟢 Beginner Example

```python
user = UserFactory()
```

#### 🟡 Intermediate Example

```python
order = OrderFactory(customer__email="vip@example.com")
```

#### 🔴 Expert Example

```python
class OrderFactory(DjangoModelFactory):
    class Meta:
        model = Order
    customer = factory.SubFactory(CustomerFactory)
```

#### 🌍 Real-Time Example

SaaS: `SubscriptionFactory` with `plan` and `payment_method`.

### 20.7.5 Test Utilities

**Concept:** Helpers: `RequestFactory`, `reverse`, `assertRedirects`.

#### 🟢 Beginner Example

```python
from django.urls import reverse

url = reverse("order_detail", args=[order.pk])
```

#### 🟡 Intermediate Example

```python
from django.test import RequestFactory

rf = RequestFactory()
req = rf.get("/items/")
resp = my_view(req)
```

#### 🔴 Expert Example

```python
from django.contrib.auth.models import AnonymousUser

req.user = AnonymousUser()
```

#### 🌍 Real-Time Example

Middleware tests with `RequestFactory` + full middleware chain helper.

---

## 20.8 Continuous Testing

### 20.8.1 Coverage

**Concept:** `coverage run manage.py test` then `coverage report`.

#### 🟢 Beginner Example

```bash
pip install coverage
coverage run manage.py test
coverage report -m
```

#### 🟡 Intermediate Example

```bash
coverage run --source=shop manage.py test shop
```

#### 🔴 Expert Example

`.coveragerc` omit migrations, virtualenv.

#### 🌍 Real-Time Example

Gate merges on ≥85% coverage for billing package.

### 20.8.2 Coverage Reports

**Concept:** HTML output for line-by-line gaps.

#### 🟢 Beginner Example

```bash
coverage html && open htmlcov/index.html
```

#### 🟡 Intermediate Example

Upload to codecov.io in CI.

#### 🔴 Expert Example

Diff coverage on PRs only for touched files.

#### 🌍 Real-Time Example

Nightly full HTML report archived as artifact.

### 20.8.3 Automated Testing

**Concept:** CI runs on every push/PR.

#### 🟢 Beginner Example

```yaml
# .github/workflows/ci.yml
# run: python manage.py test
```

#### 🟡 Intermediate Example

Matrix Python versions; services: postgres/redis.

#### 🔴 Expert Example

Sharding tests with `pytest -n auto` or Django `--parallel`.

#### 🌍 Real-Time Example

Main branch deploy blocked if integration suite fails.

### 20.8.4 Pre-commit Hooks

**Concept:** Run linters/tests before commit.

#### 🟢 Beginner Example

```yaml
repos:
  - repo: local
    hooks:
      - id: django-check
        entry: python manage.py check
        language: system
        pass_filenames: false
```

#### 🟡 Intermediate Example

`ruff`, `black`, `mypy` hooks.

#### 🔴 Expert Example

Run subset of tests `<30s` on pre-push.

#### 🌍 Real-Time Example

Monorepo: only affected apps’ tests via path filters.

### 20.8.5 CI Integration

**Concept:** Secrets for `DJANGO_SECRET_KEY`, DB URLs, `ALLOWED_HOSTS`.

#### 🟢 Beginner Example

```yaml
env:
  DJANGO_SETTINGS_MODULE: project.settings.ci
```

#### 🟡 Intermediate Example

```yaml
services:
  postgres:
    image: postgres:16
```

#### 🔴 Expert Example

Migrations check: `python manage.py makemigrations --check`.

#### 🌍 Real-Time Example

Deploy pipeline: migrate → smoke test → roll forward.

---

## Best Practices

- Prefer `TestCase` + factories over large static fixtures.
- Use `setUpTestData` for expensive shared readonly setup.
- Test permissions and negative paths, not only happy paths.
- For async views, use `AsyncClient` and async test methods where supported.
- Keep unit tests fast; isolate slow integration tests.
- Run `makemigrations --check` and `manage.py check` in CI.
- Use `override_settings` to test feature flags.
- Avoid testing framework internals; test observable behavior.

---

## Common Mistakes to Avoid

- Testing with production secrets or real external APIs.
- Assuming `TestCase` commits data visible to threads without `TransactionTestCase`.
- Flaky time-dependent tests without freezing time.
- Patching wrong import path → mock not applied.
- Over-mocking to the point tests mirror implementation, not behavior.
- Not testing CSRF on POST views that require it.
- Giant fixtures that break on every schema change.
- Ignoring database routing in multi-DB projects during tests.

---

## Comparison Tables

| Class | DB | Transactions | Typical use |
|-------|----|----------------|-------------|
| `SimpleTestCase` | No | N/A | Pure helpers, template tags |
| `TestCase` | Yes | Rollback per test | Most ORM/view tests |
| `TransactionTestCase` | Yes | Real commits | Signals/on_commit, threading |
| `LiveServerTestCase` | Yes | Real commits | Selenium/Playwright |

| Tool | Purpose |
|------|---------|
| `Client` | HTTP to WSGI app |
| `AsyncClient` | HTTP to ASGI app |
| `RequestFactory` | Construct `HttpRequest` without middleware stack |

| Runner | Ecosystem |
|--------|-----------|
| `manage.py test` | Batteries included |
| `pytest-django` | Fixtures, parametrization |

---

*Reference notes for **Django 6.0.3** testing. Confirm async test APIs against the Django version you run in CI.*
