# Django Templates (Django 6.0.3)

Django’s template language is a **designer-friendly**, **logic-light** presentation layer. It deliberately limits what you can do in templates so that business rules stay in Python (views, models, services). This guide maps **Django 6.0.3** template behavior—compatible with **Python 3.12–3.14**—to a **TypeScript-reference style**: crisp definitions, progressive examples, and production-minded patterns for **e‑commerce**, **social**, and **SaaS** apps.

---

## 📑 Table of Contents

- [8.1 Template Basics](#81-template-basics)
  - [8.1.1 Syntax](#811-syntax)
  - [8.1.2 Variables](#812-variables)
  - [8.1.3 Filters](#813-filters)
  - [8.1.4 Tags](#814-tags)
  - [8.1.5 Comments](#815-comments)
- [8.2 Template Tags](#82-template-tags)
  - [8.2.1 if / elif / else](#821-if--elif--else)
  - [8.2.2 for Loop](#822-for-loop)
  - [8.2.3 block / extends](#823-block--extends)
  - [8.2.4 include](#824-include)
  - [8.2.5 csrf_token](#825-csrf_token)
- [8.3 Filters](#83-filters)
  - [8.3.1 String Filters](#831-string-filters)
  - [8.3.2 Numeric Filters](#832-numeric-filters)
  - [8.3.3 Date Filters](#833-date-filters)
  - [8.3.4 List Filters](#834-list-filters)
  - [8.3.5 Custom Filters](#835-custom-filters)
- [8.4 Template Inheritance](#84-template-inheritance)
  - [8.4.1 Base Templates](#841-base-templates)
  - [8.4.2 Child Templates](#842-child-templates)
  - [8.4.3 Blocks and Overriding](#843-blocks-and-overriding)
  - [8.4.4 Multiple Levels](#844-multiple-levels)
  - [8.4.5 Template Organization](#845-template-organization)
- [8.5 Static Files](#85-static-files)
  - [8.5.1 {% static %}](#851--static-)
  - [8.5.2 Static File Management](#852-static-file-management)
  - [8.5.3 CSS / JS Loading](#853-css--js-loading)
  - [8.5.4 Image References](#854-image-references)
  - [8.5.5 Static File Collection](#855-static-file-collection)
- [8.6 Template Loaders](#86-template-loaders)
  - [8.6.1 FileSystemLoader](#861-filesystemloader)
  - [8.6.2 AppDirectoriesLoader](#862-appdirectoriesloader)
  - [8.6.3 Custom Loaders](#863-custom-loaders)
  - [8.6.4 Template Cache](#864-template-cache)
  - [8.6.5 Debug Settings](#865-debug-settings)
- [8.7 Template Context Processors](#87-template-context-processors)
  - [8.7.1 Built-in Processors](#871-built-in-processors)
  - [8.7.2 auth Processor](#872-auth-processor)
  - [8.7.3 csrf Processor](#873-csrf-processor)
  - [8.7.4 Custom Processors](#874-custom-processors)
  - [8.7.5 Processor Order](#875-processor-order)
- [8.8 Advanced Template Features](#88-advanced-template-features)
  - [8.8.1 Rendering](#881-rendering)
  - [8.8.2 Variable Scope](#882-variable-scope)
  - [8.8.3 Caching](#883-caching)
  - [8.8.4 Whitespace Control](#884-whitespace-control)
  - [8.8.5 Custom Template Tags and Filters](#885-custom-template-tags-and-filters)
- [Best Practices (Chapter Summary)](#best-practices-chapter-summary)
- [Common Mistakes (Chapter Summary)](#common-mistakes-chapter-summary)
- [Comparison Tables](#comparison-tables)

---

## 8.1 Template Basics

### 8.1.1 Syntax

Django templates mix **HTML** (or any text format) with **`{{ }}`** (variable output) and **`{% %}`** (tags: control flow, inheritance, includes). **`|filter`** chains transform values. **`{# #}`** holds comments.

**🟢 Beginner Example**

```django
<h1>Hello, {{ username }}!</h1>
```

**🟡 Intermediate Example**

```django
<p>Total: {{ price|floatformat:2 }} {{ currency|upper }}</p>
```

**🔴 Expert Example**

```django
{% load i18n %}
{% blocktranslate with name=user.get_full_name|default:user.username %}
  Welcome back, {{ name }}.
{% endblocktranslate %}
```

**🌍 Real-Time Example (SaaS dashboard)**

```django
{# templates/app/dashboard.html #}
<section class="kpi">
  <span class="label">MRR</span>
  <span class="value">{{ metrics.mrr|default:"—"|floatformat:0 }}</span>
</section>
```

---

### 8.1.2 Variables

Variables resolve with **attribute lookup** then **key lookup** then **callable** (no arguments). Dot syntax walks objects and dicts.

**🟢 Beginner Example**

```django
{{ product.name }}
```

**🟡 Intermediate Example**

```django
{{ order.shipping_address.city }}
```

**🔴 Expert Example**

```python
# views.py — lazy queryset still evaluates on access in template
def order_detail(request, pk):
    order = Order.objects.select_related("user", "shipping_address").get(pk=pk)
    return render(request, "orders/detail.html", {"order": order})
```

```django
{{ order.user.email }}
```

**🌍 Real-Time Example (e‑commerce)**

```django
{# Avoid N+1: view uses prefetch_related for lines #}
<ul>
  {% for line in order.lines.all %}
    <li>{{ line.product.title }} × {{ line.quantity }}</li>
  {% endfor %}
</ul>
```

---

### 8.1.3 Filters

**Filters** are pipe-suffixed transforms: `value|filter:arg`. They run left-to-right and cannot execute arbitrary Python.

**🟢 Beginner Example**

```django
{{ bio|truncatewords:20 }}
```

**🟡 Intermediate Example**

```django
{{ published_at|date:"M j, Y" }}
```

**🔴 Expert Example**

```django
{{ items|dictsort:"priority"|slice:":5" }}
```

**🌍 Real-Time Example (social feed)**

```django
{% for post in posts %}
  <article>
    <time datetime="{{ post.created_at|date:'c' }}">{{ post.created_at|timesince }} ago</time>
    <p>{{ post.body|linebreaksbr|urlize }}</p>
  </article>
{% endfor %}
```

---

### 8.1.4 Tags

**Tags** perform control flow, composition, and framework hooks (`url`, `static`, `csrf_token`). Some tags require `{% load library %}`.

**🟢 Beginner Example**

```django
{% if user.is_authenticated %}Hi{% else %}Sign in{% endif %}
```

**🟡 Intermediate Example**

```django
{% url 'product_detail' slug=product.slug %}
```

**🔴 Expert Example**

```django
{% load cache %}
{% cache 600 sidebar request.user.id %}
  {% include "partials/sidebar.html" %}
{% endcache %}
```

**🌍 Real-Time Example (SaaS billing)**

```django
{% if subscription.plan.tier == "enterprise" %}
  {% include "billing/enterprise_banner.html" %}
{% endif %}
```

---

### 8.1.5 Comments

**`{# ... #}`** removes content from output. **`{% comment %}...{% endcomment %}`** supports multi-line and nested content in newer Django versions when using block form.

**🟢 Beginner Example**

```django
{# TODO: add pagination #}
```

**🟡 Intermediate Example**

```django
{% comment %}
  Legacy markup kept for reference during redesign.
{% endcomment %}
```

**🔴 Expert Example**

```django
{% comment "feature-flag" %}
  Shown only while designers iterate — remove before GA.
{% endcomment %}
```

**🌍 Real-Time Example**

```django
{# Production: never leave API keys or secrets in templates #}
```

---

## 8.2 Template Tags

### 8.2.1 if / elif / else

Supports **`and` / `or` / `not`**, **operators** (`==`, `!=`, `<`, `>`, `in`, etc.), and **filters** on operands.

**🟢 Beginner Example**

```django
{% if cart_count %}
  You have {{ cart_count }} items.
{% endif %}
```

**🟡 Intermediate Example**

```django
{% if user.is_staff or user.is_superuser %}
  <a href="{% url 'admin:index' %}">Admin</a>
{% elif user.groups.filter.name == "support" %}
  <a href="{% url 'support:dashboard' %}">Support</a>
{% else %}
  <a href="{% url 'account' %}">Account</a>
{% endif %}
```

**🔴 Expert Example**

```django
{% if product.inventory_count|default:0 > 0 and not product.is_archived %}
  <button type="submit">Add to cart</button>
{% endif %}
```

**🌍 Real-Time Example (e‑commerce)**

```django
{% if promo and promo.is_active and order.subtotal >= promo.min_spend %}
  <p class="promo">You qualify for {{ promo.label }}.</p>
{% endif %}
```

---

### 8.2.2 for Loop

**`{% for x in seq %}`** exposes **`forloop.counter`**, **`first`**, **`last`**, **`parentloop`**, and **`empty`** clause.

**🟢 Beginner Example**

```django
<ul>
  {% for tag in tags %}
    <li>{{ tag }}</li>
  {% empty %}
    <li>No tags yet.</li>
  {% endfor %}
</ul>
```

**🟡 Intermediate Example**

```django
{% for row in matrix %}
  <tr class="{% cycle 'odd' 'even' %}">
    {% for cell in row %}<td>{{ cell }}</td>{% endfor %}
  </tr>
{% endfor %}
```

**🔴 Expert Example**

```django
{% regroup people by department as dept_list %}
{% for dept in dept_list %}
  <h3>{{ dept.grouper }}</h3>
  <ul>
    {% for person in dept.list %}
      <li>{{ person.name }}</li>
    {% endfor %}
  </ul>
{% endfor %}
```

**🌍 Real-Time Example (social)**

```django
{% for notif in notifications %}
  <div class="notif {% if forloop.first %}unread-highlight{% endif %}">
    {{ notif.verb }} · {{ notif.created_at|timesince }} ago
  </div>
{% endfor %}
```

---

### 8.2.3 block / extends

**`extends`** chooses a layout; **`block`** defines override points. Only **one** `extends` per template, and it should be first (convention).

**🟢 Beginner Example**

```django
{# child.html #}
{% extends "base.html" %}
{% block title %}About{% endblock %}
```

**🟡 Intermediate Example**

```django
{% extends "layouts/app.html" %}
{% block content %}
  <main>{% block main %}{% endblock %}</main>
{% endblock %}
```

**🔴 Expert Example**

```django
{% extends "saas/base.html" %}
{% block extra_head %}
  {{ block.super }}
  <script type="module" src="{% static 'js/billing.js' %}"></script>
{% endblock %}
```

**🌍 Real-Time Example (SaaS)**

```django
{% extends "tenant_base.html" %}
{% block page_header %}
  <h1>{{ tenant.name }} · Usage</h1>
{% endblock %}
```

---

### 8.2.4 include

Embeds another template with optional **`with`** context and **`only`**.

**🟢 Beginner Example**

```django
{% include "partials/footer.html" %}
```

**🟡 Intermediate Example**

```django
{% include "cards/product.html" with product=p only %}
```

**🔴 Expert Example**

```django
{% include "widgets/pricing_tier.html" with tier=plan.tier annual=plan.is_annual %}
```

**🌍 Real-Time Example (e‑commerce)**

```django
{% for bundle in bundles %}
  {% include "store/bundle_card.html" with bundle=bundle %}
{% endfor %}
```

---

### 8.2.5 csrf_token

Outputs hidden field(s) for **CSRF** protection on POST forms. Requires **`CsrfViewMiddleware`** and often **`csrf` context processor** for JS clients.

**🟢 Beginner Example**

```django
<form method="post">
  {% csrf_token %}
  <button>Save</button>
</form>
```

**🟡 Intermediate Example**

```django
<form hx-post="{% url 'comments:add' %}" hx-headers='js:{"X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value}'>
  {% csrf_token %}
</form>
```

**🔴 Expert Example**

```python
# For SPA / API: use ensure_csrf_cookie + header X-CSRFToken
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def spa_shell(request):
    return render(request, "app/shell.html")
```

**🌍 Real-Time Example**

```django
{# Checkout POST must always include CSRF #}
<form action="{% url 'checkout:pay' %}" method="post">
  {% csrf_token %}
  {% include "checkout/payment_fields.html" %}
</form>
```

---

## 8.3 Filters

### 8.3.1 String Filters

**`upper`**, **`lower`**, **`capitalize`**, **`title`**, **`slugify`**, **`truncatewords`**, etc.

**🟢 Beginner Example**

```django
{{ headline|lower }}
```

**🟡 Intermediate Example**

```django
{{ sku|upper }} — {{ name|title }}
```

**🔴 Expert Example**

```django
{{ user.display_name|default:guest_label|slugify }}
```

**🌍 Real-Time Example**

```django
<span class="badge">{{ plan.code|upper }}</span>
```

---

### 8.3.2 Numeric Filters

**`add`** (also works for concatenating lists), **`floatformat`**, **`filesizeformat`**, etc.

**🟢 Beginner Example**

```django
{{ quantity|add:1 }}
```

**🟡 Intermediate Example**

```django
{{ invoice.total|floatformat:2 }}
```

**🔴 Expert Example**

```django
{{ usage.bytes|filesizeformat }} of {{ quota.bytes|filesizeformat }} used
```

**🌍 Real-Time Example (SaaS metering)**

```django
{{ included_units|add:overage_units }} total API calls this period
```

---

### 8.3.3 Date Filters

**`date`**, **`time`**, **`timesince`**, **`timeuntil`**.

**🟢 Beginner Example**

```django
{{ now|date:"Y-m-d" }}
```

**🟡 Intermediate Example**

```django
{{ post.published_at|date:"SHORT_DATETIME_FORMAT" }}
```

**🔴 Expert Example**

```django
<meta property="article:published_time" content="{{ article.published_at|date:'c' }}">
```

**🌍 Real-Time Example**

```django
Subscription renews {{ subscription.current_period_end|timeuntil }}.
```

---

### 8.3.4 List Filters

**`join`**, **`first`**, **`last`**, **`length`**, **`slice`**, **`dictsort`**.

**🟢 Beginner Example**

```django
{{ tags|join:", " }}
```

**🟡 Intermediate Example**

```django
Top pick: {{ featured|first }}
```

**🔴 Expert Example**

```django
{{ leaderboard|dictsortreversed:"score"|slice:":10" }}
```

**🌍 Real-Time Example (social)**

```django
{{ mutual_friends|slice:":5"|join:", " }} and others
```

---

### 8.3.5 Custom Filters

Register with **`@register.filter`** in **`templatetags`** package.

**🟢 Beginner Example**

```python
# cart/templatetags/cart_extras.py
from django import template

register = template.Library()

@register.filter
def cents(value):
    try:
        return f"${float(value):.2f}"
    except (TypeError, ValueError):
        return value
```

**🟡 Intermediate Example**

```python
@register.filter(name="currency")
def currency(value, code="USD"):
    from decimal import Decimal
    amount = Decimal(str(value))
    symbols = {"USD": "$", "EUR": "€"}
    return f"{symbols.get(code, code)} {amount.quantize(Decimal('0.01'))}"
```

**🔴 Expert Example**

```python
from django.utils.safestring import mark_safe
import bleach

@register.filter(is_safe=True)
def safe_rich_text(html: str) -> str:
    allowed = bleach.sanitizer.ALLOWED_TAGS | {"p", "br", "strong", "em", "a"}
    return mark_safe(bleach.clean(html, tags=allowed, attributes={"a": ["href", "title"]}))
```

**🌍 Real-Time Example**

```django
{{ product.description_html|safe_rich_text }}
```

---

## 8.4 Template Inheritance

### 8.4.1 Base Templates

Define **document structure**, **shared assets**, and **named blocks**.

**🟢 Beginner Example**

```django
<!DOCTYPE html>
<html>
<head><title>{% block title %}Site{% endblock %}</title></head>
<body>{% block body %}{% endblock %}</body>
</html>
```

**🟡 Intermediate Example**

```django
{% load static %}
<head>
  <link rel="stylesheet" href="{% static 'css/base.css' %}">
  {% block extra_css %}{% endblock %}
</head>
```

**🔴 Expert Example**

```django
{% block meta %}
  <meta name="viewport" content="width=device-width, initial-scale=1">
{% endblock %}
```

**🌍 Real-Time Example**

```django
{# SaaS: base loads tenant-themed CSS variable overrides #}
<body class="theme-{{ tenant.theme_slug }}">
  {% block app_shell %}{% endblock %}
</body>
```

---

### 8.4.2 Child Templates

Child sets **`extends`** then fills blocks.

**🟢 Beginner Example**

```django
{% extends "base.html" %}
{% block title %}Home{% endblock %}
```

**🟡 Intermediate Example**

```django
{% extends "shop/base.html" %}
{% block content %}
  {% include "shop/product_grid.html" %}
{% endblock %}
```

**🔴 Expert Example**

```django
{% extends "admin/base_site.html" %}
{# Rare: customize Django admin look per project #}
```

**🌍 Real-Time Example**

```django
{% extends "social/profile_base.html" %}
{% block profile_main %}
  {% include "social/post_list.html" with posts=posts %}
{% endblock %}
```

---

### 8.4.3 Blocks and Overriding

Use **`{{ block.super }}`** to prepend/append parent content.

**🟢 Beginner Example**

```django
{% block title %}About — {{ block.super }}{% endblock %}
```

**🟡 Intermediate Example**

```django
{% block scripts %}
  {{ block.super }}
  <script src="{% static 'js/page.js' %}"></script>
{% endblock %}
```

**🔴 Expert Example**

```django
{% block analytics %}
  {{ block.super }}
  {% if tenant.analytics_id %}
    <!-- tenant-specific snippet -->
  {% endif %}
{% endblock %}
```

**🌍 Real-Time Example**

```django
{% block notifications %}
  {{ block.super }}
  {% include "billing/dunning_banner.html" %}
{% endblock %}
```

---

### 8.4.4 Multiple Levels

**Chain** `extends`: `page` → `section` → `global base`.

**🟢 Beginner Example**

`base.html` ← `shop_base.html` ← `product.html`

**🟡 Intermediate Example**

```django
{# shop_base extends site_base #}
{% extends "site_base.html" %}
{% block body %}
  <nav class="shop-nav">...</nav>
  {% block shop_content %}{% endblock %}
{% endblock %}
```

**🔴 Expert Example**

```
emails/base.txt
emails/orders/base.txt
emails/orders/shipped.txt
```

**🌍 Real-Time Example**

SaaS: `tenant_brand.html` extends `saas/base.html` extends `root.html`.

---

### 8.4.5 Template Organization

**`templates/`** at project root plus **`app/templates/app/`** avoids name collisions.

**🟢 Beginner Example**

```
templates/
  base.html
  home.html
```

**🟡 Intermediate Example**

```
shop/templates/shop/
  product_list.html
  product_detail.html
```

**🔴 Expert Example**

```
templates/
  layouts/
  partials/
  pages/
  emails/
```

**🌍 Real-Time Example**

E‑commerce: split **`checkout/`**, **`catalog/`**, **`account/`** with shared **`components/`**.

---

## 8.5 Static Files

### 8.5.1 {% static %}

**`{% load static %}`** then **`{% static 'path' %}`** resolves URL via configured static storage/finders.

**🟢 Beginner Example**

```django
{% load static %}
<img src="{% static 'img/logo.png' %}" alt="Logo">
```

**🟡 Intermediate Example**

```django
<link href="{% static 'dist/app.css' %}" rel="stylesheet">
```

**🔴 Expert Example**

```django
{# With ManifestStaticFilesStorage, filename may be hashed #}
<script src="{% static 'js/chunks/checkout.js' %}" defer></script>
```

**🌍 Real-Time Example**

CDN: set **`STATIC_URL`** to CDN origin; `static` tag still works.

---

### 8.5.2 Static File Management

**`STATICFILES_DIRS`**, **`STATIC_ROOT`**, **`STATIC_URL`**, finders.

**🟢 Beginner Example**

```python
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "assets"]
```

**🟡 Intermediate Example**

```python
STATIC_ROOT = BASE_DIR / "staticfiles"
```

**🔴 Expert Example**

```python
STORAGES = {
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"},
}
```

**🌍 Real-Time Example**

SaaS: separate **build pipeline** emits `dist/` included via `STATICFILES_DIRS`.

---

### 8.5.3 CSS / JS Loading

Place in **`extra_head` / `scripts`** blocks; prefer **`defer`** for scripts.

**🟢 Beginner Example**

```django
{% block extra_head %}<link rel="stylesheet" href="{% static 'css/site.css' %}">{% endblock %}
```

**🟡 Intermediate Example**

```django
{% block scripts %}
  <script defer src="{% static 'vendor/alpine.min.js' %}"></script>
{% endblock %}
```

**🔴 Expert Example**

Use **`django.contrib.staticfiles`** + **Vite/Webpack** manifest mapping.

**🌍 Real-Time Example**

E‑commerce: **critical CSS** inline in base, **rest** lazy-loaded on product pages.

---

### 8.5.4 Image References

Same as static; for **user uploads** use **`MEDIA_URL`** (see Static & Media chapter).

**🟢 Beginner Example**

```django
<img src="{% static 'img/placeholder.png' %}">
```

**🟡 Intermediate Example**

```django
<img src="{{ product.image.url }}" alt="{{ product.title }}">
```

**🔴 Expert Example**

Responsive: **`srcset`** built in template from generated sizes.

**🌍 Real-Time Example**

Social avatars: **`User.avatar.url`** with default static fallback.

---

### 8.5.5 Static File Collection

**`collectstatic`** gathers files into **`STATIC_ROOT`** for production.

**🟢 Beginner Example**

```bash
python manage.py collectstatic --noinput
```

**🟡 Intermediate Example**

CI: run **`collectstatic`** before container image finalize.

**🔴 Expert Example**

WhiteNoise or CDN: **`collectstatic`** uploads to object storage via custom backend.

**🌍 Real-Time Example**

Kubernetes: **init container** or **build stage** runs **`collectstatic`**.

---

## 8.6 Template Loaders

### 8.6.1 FileSystemLoader

**`django.template.loaders.filesystem.Loader`** reads **`DIRS`**.

**🟢 Beginner Example**

```python
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "templates"],
    "APP_DIRS": True,
    "OPTIONS": {},
}]
```

**🟡 Intermediate Example**

Override third-party template by placing same path earlier in **`DIRS`**.

**🔴 Expert Example**

Multi-tenant: swap **`DIRS`** per request via **custom engine** (advanced) or middleware-set thread-local (use with care).

**🌍 Real-Time Example**

SaaS white-label: **`templates/brands/acme/`** in **`DIRS`**.

---

### 8.6.2 AppDirectoriesLoader

**`django.template.loaders.app_directories.Loader`** scans **`INSTALLED_APPS`** for **`templates/`**.

**🟢 Beginner Example**

```
blog/templates/blog/post_list.html
```

**🟡 Intermediate Example**

**`APP_DIRS: True`** enables app loader automatically.

**🔴 Expert Example**

Reusable app ships default templates; project overrides via **`DIRS`**.

**🌍 Real-Time Example**

**`django.contrib.admin`** templates overridden in project **`templates/admin/`**.

---

### 8.6.3 Custom Loaders

Subclass **`BaseLoader`** and implement **`get_contents`** / **`get_template_sources`**.

**🟢 Beginner Example**

Use filesystem + app dirs only (default path).

**🟡 Intermediate Example**

```python
from django.template.loaders.base import Loader as BaseLoader

class StringsLoader(BaseLoader):
    def get_contents(self, origin):
        return self.templates[origin.name]

    def get_template_sources(self, template_name):
        ...
```

**🔴 Expert Example**

Load from **database** or **S3** with caching and **version** invalidation.

**🌍 Real-Time Example**

CMS stores editable layouts in DB; **DB loader** + **in-memory cache**.

---

### 8.6.4 Template Cache

**`cached.Loader`** wraps other loaders.

**🟡 Intermediate Example**

```python
"loaders": [
    ("django.template.loaders.cached.Loader", [
        "django.template.loaders.filesystem.Loader",
        "django.template.loaders.app_directories.Loader",
    ]),
]
```

**🔴 Expert Example**

Disable cache in tests that hot-reload templates.

**🌍 Real-Time Example**

High-traffic social: **cached loader** reduces disk reads.

---

### 8.6.5 Debug Settings

**`DEBUG=True`**: richer template error pages. **`TEMPLATE_DEBUG`** removed in modern Django—use **`DEBUG`**.

**🟢 Beginner Example**

Local: **`DEBUG=True`** shows template line on error.

**🟡 Intermediate Example**

Production: **`DEBUG=False`**, **`ALLOWED_HOSTS`** set.

**🔴 Expert Example**

Custom **`handler500`** template without leaking stack traces.

**🌍 Real-Time Example**

Use **`django.template.context_processors.debug`** only in dev.

---

## 8.7 Template Context Processors

### 8.7.1 Built-in Processors

**`request`**, **`debug`**, **`i18n`**, **`tz`**, **`static`**, **`media`**, **`csrf`**, **`messages`**, **`auth`**.

**🟢 Beginner Example**

```python
"context_processors": [
    "django.template.context_processors.request",
]
```

**🟡 Intermediate Example**

Access **`{{ request.path }}`** in any template.

**🔴 Expert Example**

Conditionally add processors for **subset** of engines (multi-engine setups).

**🌍 Real-Time Example**

SaaS: include **`tenant`** processor injecting **`current_tenant`**.

---

### 8.7.2 auth Processor

Adds **`user`**, **`perms`**, parts of auth context.

**🟢 Beginner Example**

```django
{% if user.is_authenticated %}…{% endif %}
```

**🟡 Intermediate Example**

```django
{{ perms.blog.add_post }}
```

**🔴 Expert Example**

**`AuthenticationMiddleware`** must run; anonymous **`User`** provided.

**🌍 Real-Time Example**

Social: show **`user.avatar`** if authenticated.

---

### 8.7.3 csrf Processor

Exposes **`csrf_token`** helper for templates.

**🟢 Beginner Example**

Implicitly used by **`{% csrf_token %}`**.

**🔴 Expert Example**

JS reads cookie **`csrftoken`** when using **`CSRF_USE_SESSIONS`**.

**🌍 Real-Time Example**

SPA posts JSON with **`X-CSRFToken`**.

---

### 8.7.4 Custom Processors

**`(request) -> dict`** merged into context.

**🟢 Beginner Example**

```python
def storefront(request):
    return {"cart_item_count": getattr(request, "cart_count", 0)}
```

**🟡 Intermediate Example**

```python
def feature_flags(request):
    return {"flags": request.flags}  # set in middleware
```

**🔴 Expert Example**

Keep processors **cheap**; avoid DB hits—use **cache** or **middleware snapshot**.

**🌍 Real-Time Example**

E‑commerce: **global promo banner** variables from cached campaign.

---

### 8.7.5 Processor Order

Later keys **do not** overwrite earlier unless same key—actually **merge** order: each processor updates context; **duplicate keys**: last wins (depends on merge in `RequestContext`).

**🟢 Beginner Example**

List **`auth`** before custom processors that depend on **`user`**.

**🔴 Expert Example**

Document team **order contract** in project README.

**🌍 Real-Time Example**

SaaS: **`tenant`** before **`flags`** so flags can be tenant-scoped.

---

## 8.8 Advanced Template Features

### 8.8.1 Rendering

**`render()`**, **`Template.render()`**, **`engines['django'].from_string()`**.

**🟢 Beginner Example**

```python
from django.shortcuts import render
return render(request, "page.html", {"x": 1})
```

**🟡 Intermediate Example**

```python
from django.template import engines
tpl = engines["django"].from_string("Hi {{ name }}")
html = tpl.render({"name": "Ada"})
```

**🔴 Expert Example**

```python
from django.template.loader import render_to_string
body = render_to_string("emails/order.txt", {"order": order})
```

**🌍 Real-Time Example**

Celery task emails order confirmation using **`render_to_string`**.

---

### 8.8.2 Variable Scope

**`{% with %}`** limits scope; **`for`** introduces loop-local vars.

**🟢 Beginner Example**

```django
{% with total=items|length %}
  {{ total }} items
{% endwith %}
```

**🟡 Intermediate Example**

```django
{% for item in items %}
  {% with price=item.final_price %}
    {{ price }}
  {% endwith %}
{% endfor %}
```

**🔴 Expert Example**

Template inheritance: blocks **do not** isolate Python scope—avoid reusing fragile inner names.

**🌍 Real-Time Example**

Complex checkout: **`with`** binds **`tax`** once for readability.

---

### 8.8.3 Caching

**`{% cache %}`** fragment cache; keyed by arguments.

**🟢 Beginner Example**

```django
{% load cache %}
{% cache 300 featured_products %}
  …
{% endcache %}
```

**🟡 Intermediate Example**

```django
{% cache 600 sidebar request.user.id %}
```

**🔴 Expert Example**

Invalidate with **version key** bump when model changes (signals).

**🌍 Real-Time Example**

Social trending panel cached **60s** per locale.

---

### 8.8.4 Whitespace Control

Django templates preserve whitespace; use **`{% spaceless %}`** (HTML between tags) or trim in CSS.

**🟢 Beginner Example**

```django
{% spaceless %}
<div>
  <p>Hi</p>
</div>
{% endspaceless %}
```

**🔴 Expert Example**

For email plaintext, pre-format in view or use filters.

**🌍 Real-Time Example**

Minify in **build** step rather than complex template whitespace hacks.

---

### 8.8.5 Custom Template Tags and Filters

**Simple tags**, **inclusion tags**, **assignment tags**, **`Node` subclasses**.

**🟢 Beginner Example**

```python
@register.simple_tag
def icon(name):
    return mark_safe(f'<span class="icon icon-{name}"></span>')
```

**🟡 Intermediate Example**

```python
@register.inclusion_tag("tags/user_chip.html")
def user_chip(user):
    return {"user": user}
```

**🔴 Expert Example**

```python
class CurrentTimeNode(template.Node):
    def __init__(self, fmt):
        self.fmt = fmt

    def render(self, context):
        return timezone.now().strftime(self.fmt)
```

**🌍 Real-Time Example**

SaaS **plan badge** inclusion tag reused across header, billing, and admin views.

---

## Best Practices (Chapter Summary)

- Keep templates **dumb**: compute in **views/services**, format in templates.
- Prefer **template inheritance** over **deep include** trees when layout is shared.
- Use **`select_related` / `prefetch_related`** to back templates efficiently.
- **Sanitize** rich text; never **`|safe`** on untrusted input.
- **Cache** expensive fragments with clear **invalidation** rules.
- Organize by **feature** (`shop/`, `billing/`) and use **`partials/`** for components.
- Use **`block.super`** for extensibility in shared bases.
- Rely on **`{% static %}`** for cache-busted built assets in production.

---

## Common Mistakes (Chapter Summary)

- Putting **business rules** in templates (hard to test, easy to duplicate).
- **`extends`** not at top or **multiple** `extends`.
- **N+1 queries** powering loops.
- **CSRF** missing on POST or misconfigured JS headers.
- **`|safe`** on user content → **XSS**.
- **Custom tags** doing heavy DB work per render.
- Assuming **`if querysets`** without understanding **truthiness** (queryset is truthy if non-empty when evaluated).

---

## Comparison Tables

| Concern | `{{ var }}` | `{% tag %}` |
|--------|-------------|------------|
| Purpose | Output value | Control / composition |
| Logic | Limited (filters) | Loops, inheritance, includes |

| Loader | Source | Typical use |
|--------|--------|-------------|
| filesystem | `DIRS` | Project overrides |
| app_directories | per-app `templates/` | reusable apps |
| cached | wraps others | production speed |

| Feature | Context processor | Middleware |
|---------|-------------------|------------|
| Runs for | Template render | Every request/response |
| Best for | Template globals | Request mutation, auth |

| Static | Media |
|--------|-------|
| `STATIC_URL` / `collectstatic` | `MEDIA_URL` / uploads |
| Versioned assets | User-generated content |

---

*These notes target **Django 6.0.3**. Verify behavior against the official Django documentation for your exact release.*
