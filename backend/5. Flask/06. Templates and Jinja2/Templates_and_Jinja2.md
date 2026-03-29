# Templates and Jinja2

Flask uses **Jinja2** as its default template engine: `render_template()` loads files from the **`templates/`** directory, applies **autoescaping** for HTML by default, and supports **inheritance**, **macros**, **filters**, and **tests**. This chapter maps Flask 3.1.3 template behavior to practical patterns for **e-commerce** storefronts, **social** activity feeds, and **SaaS** admin consoles—with **beginner → real-time** examples at each major topic.

---

## 📑 Table of Contents

1. [Template Basics](#1-template-basics)
   - 1.1 Template rendering
   - 1.2 `render_template()`
   - 1.3 Template directory structure
   - 1.4 Template loading
   - 1.5 Auto-escaping
2. [Jinja2 Syntax](#2-jinja2-syntax)
   - 2.1 Variables `{{ }}`
   - 2.2 Comments `{# #}`
   - 2.3 Control structures
   - 2.4 Loops `{% for %}`
   - 2.5 Conditionals `{% if %}`
3. [Template Filters](#3-template-filters)
   - 3.1 String filters
   - 3.2 Number filters
   - 3.3 List filters
   - 3.4 Date filters
   - 3.5 Custom filters
4. [Template Tags](#4-template-tags)
   - 4.1 `for` loop tags
   - 4.2 `if` / `elif` / `else` tags
   - 4.3 `block` tags
   - 4.4 `include` tag
   - 4.5 `import` / `from` tags
5. [Template Inheritance](#5-template-inheritance)
   - 5.1 Base templates
   - 5.2 Child templates
   - 5.3 Block definition
   - 5.4 Block override
   - 5.5 Multiple inheritance
6. [Template Macros](#6-template-macros)
   - 6.1 Macro definition
   - 6.2 Macro parameters
   - 6.3 Macro calls
   - 6.4 Macro scope
   - 6.5 Reusable components
7. [Advanced Template Features](#7-advanced-template-features)
   - 7.1 Set variables
   - 7.2 Global variables
   - 7.3 Context processors
   - 7.4 Template tests
   - 7.5 Custom globals
8. [Template Organization](#8-template-organization)
   - 8.1 Template structure
   - 8.2 Partials / includes
   - 8.3 Component libraries
   - 8.4 Best practices
   - 8.5 Performance
9. [Best Practices](#9-best-practices)
10. [Common Mistakes to Avoid](#10-common-mistakes-to-avoid)
11. [Comparison Tables](#11-comparison-tables)

---

## 1. Template Basics

### 1.1 Template rendering

Turn Python context dict into HTML (or text) by merging with a template file.

### 1.2 `render_template()`

```python
from flask import render_template

return render_template("index.html", title="Home", items=items)
```

### 1.3 Template directory structure

Default: **`templates/`** next to your app package. Blueprints can set `template_folder`.

### 1.4 Template loading

Jinja2 **FileSystemLoader**; caching enabled in production.

### 1.5 Auto-escaping

Enabled for `.html`, `.htm`, `.xml`, `.xhtml` (configurable). Use `|safe` only for trusted HTML.

#### Concept: First HTML page

### 🟢 Beginner Example

`templates/hello.html`:

```html
<!doctype html>
<html>
  <body><h1>{{ title }}</h1></body>
</html>
```

`app.py`:

```python
from flask import Flask, render_template

app = Flask(__name__)


@app.get("/")
def home():
    return render_template("hello.html", title="Hello")
```

### 🟡 Intermediate Example

```python
@app.get("/products")
def products():
    items = [{"name": "Mug", "price": "9.99"}]
    return render_template("products.html", items=items)
```

### 🔴 Expert Example

```python
from flask import Flask, render_template, request

app = Flask(__name__)


@app.get("/search")
def search():
    q = request.args.get("q", "")
    results = [] if not q else [{"title": f"Result for {q}"}]
    return render_template("search.html", q=q, results=results)
```

### 🌍 Real-Time Example

**E-commerce** PLP (product listing page):

```python
@app.get("/shop/<category_slug>")
def category(category_slug: str):
    products = [{"sku": "A1", "title": "Tee", "price_cents": 1999}]
    return render_template(
        "shop/category.html",
        category=category_slug,
        products=products,
    )
```

---

## 2. Jinja2 Syntax

### 2.1 Variables `{{ }}`

```jinja2
{{ user.name }}
```

### 2.2 Comments `{# #}`

```jinja2
{# navigation partial #}
```

### 2.3 Control structures

Tags use `{% ... %}`.

### 2.4 Loops `{% for %}`

```jinja2
<ul>
{% for item in items %}
  <li>{{ item.title }}</li>
{% endfor %}
</ul>
```

### 2.5 Conditionals `{% if %}`

```jinja2
{% if user %}
  Hi {{ user.name }}
{% else %}
  <a href="/login">Login</a>
{% endif %}
```

#### Concept: Feed rendering

### 🟢 Beginner Example

```jinja2
{% for post in posts %}
  <p>{{ post.text }}</p>
{% endfor %}
```

### 🟡 Intermediate Example

```jinja2
{% for post in posts %}
  {% if post.pinned %}
    <article class="pinned">{{ post.text }}</article>
  {% else %}
    <article>{{ post.text }}</article>
  {% endif %}
{% else %}
  <p>No posts yet.</p>
{% endfor %}
```

### 🔴 Expert Example

```jinja2
{% for group, items in posts|groupby('day') %}
  <h3>{{ group }}</h3>
  {% for post in items %}
    <p>{{ post.text }}</p>
  {% endfor %}
{% endfor %}
```

### 🌍 Real-Time Example

**Social** notifications template with empty state and pagination hints.

```jinja2
{% if notifications %}
  <ul>
  {% for n in notifications %}
    <li class="{{ n.level }}">{{ n.message }}</li>
  {% endfor %}
  </ul>
{% else %}
  <p>You are all caught up.</p>
{% endif %}
```

---

## 3. Template Filters

### 3.1 String filters

`upper`, `lower`, `title`, `truncate`, `replace`.

### 3.2 Number filters

`round`, `abs` (via expressions), formatting with `format` filter.

### 3.3 List filters

`length`, `first`, `last`, `join`, `sort`.

### 3.4 Date filters

Often combine Python `datetime` in view or use `strftime` in template; custom filters for locale.

### 3.5 Custom filters

```python
@app.template_filter("money")
def money_filter(cents: int) -> str:
    return f"${cents / 100:.2f}"
```

#### Concept: Price display

### 🟢 Beginner Example

```jinja2
{{ (price_cents / 100)|round(2) }}
```

### 🟡 Intermediate Example

```jinja2
{{ "%.2f"|format(price_cents / 100) }}
```

### 🔴 Expert Example

```python
from flask import Flask

app = Flask(__name__)


@app.template_filter("currency")
def currency(value: float, code: str = "USD") -> str:
    return f"{code} {value:,.2f}"
```

```jinja2
{{ 19.5|currency('USD') }}
```

### 🌍 Real-Time Example

**E-commerce** multi-currency:

```jinja2
{{ item.price|currency(item.currency) }}
```

---

## 4. Template Tags

### 4.1 `for` loop tags

See section 2; use `loop.index`, `loop.first`, `loop.last`.

### 4.2 `if` / `elif` / `else` tags

Full branching in templates—keep business rules in Python when complex.

### 4.3 `block` tags

```jinja2
{% block content %}{% endblock %}
```

### 4.4 `include` tag

```jinja2
{% include 'partials/nav.html' %}
```

### 4.5 `import` / `from` tags

Import macros:

```jinja2
{% from 'macros/forms.html' import field %}
```

#### Concept: Form partial

### 🟢 Beginner Example

```jinja2
<label>{{ label }}</label>
<input name="{{ name }}" value="{{ value }}">
```

### 🟡 Intermediate Example

```jinja2
{% include 'partials/field.html' with context %}
```

### 🔴 Expert Example

```jinja2
{% from 'macros/ui.html' import button %}
{{ button('Save', class='btn-primary') }}
```

### 🌍 Real-Time Example

**SaaS** settings page reuses field macro across dozens of forms.

---

## 5. Template Inheritance

### 5.1 Base templates

`layout.html` defines chrome: `<html>`, nav, footer.

### 5.2 Child templates

```jinja2
{% extends 'layout.html' %}
```

### 5.3 Block definition

```jinja2
{% block title %}Default{% endblock %}
```

### 5.4 Block override

Child replaces blocks.

### 5.5 Multiple inheritance

Rare; prefer composition via includes/macros.

#### Concept: Site layout

`templates/layout.html`:

```jinja2
<!doctype html>
<html>
<head>
  <title>{% block title %}App{% endblock %}</title>
  {% block head %}{% endblock %}
</head>
<body>
  {% include 'partials/nav.html' %}
  <main>{% block content %}{% endblock %}</main>
</body>
</html>
```

`templates/home.html`:

```jinja2
{% extends 'layout.html' %}
{% block title %}Home · App{% endblock %}
{% block content %}
  <h1>Welcome</h1>
{% endblock %}
```

### 🟢 Beginner Example

```python
return render_template("home.html")
```

### 🟡 Intermediate Example

```jinja2
{% block content %}
  {{ super() }}
  <p>Extra footer note</p>
{% endblock %}
```

### 🔴 Expert Example

Named block dependencies: `{% block scripts %}{% endblock %}` at end of layout for page JS.

### 🌍 Real-Time Example

**E-commerce** checkout extends `checkout_layout.html` with minimal header for conversion testing.

---

## 6. Template Macros

### 6.1 Macro definition

```jinja2
{% macro card(title, body) %}
  <div class="card"><h3>{{ title }}</h3><p>{{ body }}</p></div>
{% endmacro %}
```

### 6.2 Macro parameters

Default args: `{% macro tag(name, kind='span') %}`.

### 6.3 Macro calls

```jinja2
{{ card('Hi', 'There') }}
```

### 6.4 Macro scope

Macros don’t see template context unless `with context`.

### 6.5 Reusable components

Collect in `macros/` directory.

#### Concept: Product card

`templates/macros/product.html`:

```jinja2
{% macro product_card(p) %}
<article class="product">
  <h2>{{ p.title }}</h2>
  <p>{{ p.price_cents|money }}</p>
</article>
{% endmacro %}
```

### 🟢 Beginner Example

```jinja2
{% from 'macros/product.html' import product_card %}
{{ product_card(product) }}
```

### 🟡 Intermediate Example

```jinja2
{% macro product_card(p, badge=None) %}
<article>
  {% if badge %}<span class="badge">{{ badge }}</span>{% endif %}
  <h2>{{ p.title }}</h2>
</article>
{% endmacro %}
```

### 🔴 Expert Example

```jinja2
{% macro datatable(rows, columns) %}
<table>
  <thead><tr>{% for c in columns %}<th>{{ c.label }}</th>{% endfor %}</tr></thead>
  <tbody>
  {% for r in rows %}
    <tr>{% for c in columns %}<td>{{ r[c.key] }}</td>{% endfor %}</tr>
  {% endfor %}
  </tbody>
</table>
{% endmacro %}
```

### 🌍 Real-Time Example

**SaaS** admin tables share `datatable` macro with sortable headers (JS added in `scripts` block).

---

## 7. Advanced Template Features

### 7.1 Set variables

```jinja2
{% set total = items|length %}
```

### 7.2 Global variables

Register with `app.jinja_env.globals['now'] = ...` (careful with mutability).

### 7.3 Context processors

Inject values into every template context:

```python
@app.context_processor
def inject_globals():
    return {"app_name": "My SaaS"}
```

### 7.4 Template tests

```jinja2
{% if value is odd %}...{% endif %}
```

### 7.5 Custom tests

```python
@app.template_test("email")
def is_email(value: str) -> bool:
    return "@" in value
```

#### Concept: Navigation highlights

### 🟢 Beginner Example

```python
return render_template("page.html", active="home")
```

```jinja2
<a class="{{ 'active' if active == 'home' else '' }}" href="/">Home</a>
```

### 🟡 Intermediate Example

```python
@app.context_processor
def inject_nav():
    return {"nav_version": 2}
```

### 🔴 Expert Example

```python
@app.template_global()
def asset_version() -> str:
    return "20260329"
```

```jinja2
<link rel="stylesheet" href="/static/app.css?v={{ asset_version() }}">
```

### 🌍 Real-Time Example

**SaaS** injects `current_tenant`, `feature_flags` via context processor—keep queries cached.

---

## 8. Template Organization

### 8.1 Template structure

```
templates/
  layout.html
  pages/
  partials/
  macros/
```

### 8.2 Partials / includes

Headers, footers, modals.

### 8.3 Component libraries

Group macros by domain: `macros/forms.html`, `macros/ui.html`.

### 8.4 Best practices

- Keep logic out of templates when possible.
- Prefer explicit context keys over huge dicts.
- Document expected context at top of complex templates.

### 8.5 Performance

- Enable Jinja bytecode cache in production.
- Avoid N+1 queries—preload in views.

#### Concept: Blueprint templates

### 🟢 Beginner Example

```python
bp = Blueprint("blog", __name__, template_folder="templates")
```

### 🟡 Intermediate Example

Template names can collide—use subfolders `blog/list.html`.

### 🔴 Expert Example

Override blueprint templates from main app using loader search path order.

### 🌍 Real-Time Example

**Marketplace** seller portal templates namespaced under `seller/`.

---

## 9. Best Practices

1. **Autoescape** stays on; sanitize or avoid `|safe` on user content.
2. Pass **minimal** data to templates; avoid ORM session-bound objects if lazy loads trigger in template.
3. Use **inheritance** for layout, **includes** for reusable fragments, **macros** for parameterized UI.
4. Keep **currency/dates** formatting consistent via filters or view preprocessing.
5. Add **`{% block head %}`** for page-specific meta/OG tags (**social** sharing).
6. Use **`url_for('static', filename='...')`** for assets (see Static Files chapter).
7. **Cache** expensive context processors.
8. **Version** assets for cache busting.
9. Prefer **explicit** template names (`pages/account/billing.html`).
10. Write **snapshot tests** for critical templates if layout regressions are costly.

---

## 10. Common Mistakes to Avoid

| Mistake | Risk | Fix |
|---------|------|-----|
| `|safe` on user HTML | XSS | Sanitize (bleach) or structured text |
| Heavy DB work in templates | Slow pages | Eager load in views |
| Giant macros | Hard to test | Python helpers or components |
| Duplicated layout without `extends` | Drift | Base template |
| Wrong template folder in blueprint | 404 templates | Verify `template_folder` |
| Leaking secrets in context processors | Exposure | Never inject env secrets |

---

## 11. Comparison Tables

### `include` vs `extends`

| Mechanism | Use |
|-----------|-----|
| **`extends`** | Page layout inheritance |
| **`include`** | Reusable fragments |

### Macros vs partials

| Tool | Best for |
|------|----------|
| **Macro** | Parameterized HTML snippets |
| **Partial include** | Static fragments with local context |

---

### Supplementary — **`render_template_string`**

### 🟢 Beginner Example

```python
from flask import render_template_string

@app.get("/demo")
def demo():
    return render_template_string("<p>{{ x }}</p>", x=1)
```

### 🟡 Intermediate Example

Avoid for user-provided strings (injection risk).

### 🔴 Expert Example

Use only for trusted tiny snippets or emails generated in controlled code.

### 🌍 Real-Time Example

**SaaS** email preview in admin uses controlled templates from DB with strict review.

---

### Supplementary — **Whitespace control**

### 🟢 Beginner Example

```jinja2
{%- for x in xs -%}
  {{ x }}
{%- endfor -%}
```

### 🟡 Intermediate Example

Trim blank lines in pretty HTML output.

### 🔴 Expert Example

Care with `{% raw %}` blocks for embedding Vue/React delimiters.

### 🌍 Real-Time Example

**SPA** hybrid pages embed JSON safely with `tojson` filter in script tag.

---

### Supplementary — **`tojson` filter**

### 🟢 Beginner Example

```jinja2
<script id="data" type="application/json">{{ items|tojson }}</script>
```

### 🟡 Intermediate Example

```jinja2
const items = {{ items|tojson }};
```

### 🔴 Expert Example

Combine with CSP nonces (set in view/response).

### 🌍 Real-Time Example

**E-commerce** client-side cart merges server catalog bootstrap JSON.

---

### Supplementary — **Custom filter registration variants**

### 🟢 Beginner Example

```python
app.jinja_env.filters["twice"] = lambda x: x * 2
```

### 🟡 Intermediate Example

```python
@app.template_filter()
def shout(s: str) -> str:
    return s.upper()
```

### 🔴 Expert Example

Filters as callables with dependencies—use closures carefully.

### 🌍 Real-Time Example

**SaaS** i18n filter `{{ s|t }}` backed by gettext.

---

### Supplementary — **Template caching**

### 🟢 Beginner Example

Default Jinja caching suitable for production WSGI workers.

### 🟡 Intermediate Example

Precompile templates at deploy (optional tooling).

### 🔴 Expert Example

Separate template paths per tenant with custom loader (advanced).

### 🌍 Real-Time Example

**SaaS** white-label themes in `themes/<tenant>/`.

---

### Supplementary — **`super()` in blocks**

### 🟢 Beginner Example

```jinja2
{% block scripts %}
  {{ super() }}
  <script src="/page.js"></script>
{% endblock %}
```

### 🟡 Intermediate Example

Order matters: parent vs child script dependencies.

### 🔴 Expert Example

Defer non-critical JS with `defer` in layout block.

### 🌍 Real-Time Example

**Social** infinite scroll script only on feed pages.

---

### Supplementary — **`with` statement**

### 🟢 Beginner Example

```jinja2
{% with items = products[:5] %}
  {% for p in items %}...{% endfor %}
{% endwith %}
```

### 🟡 Intermediate Example

Scoped variables for readability.

### 🔴 Expert Example

Avoid heavy slicing—prepare in view.

### 🌍 Real-Time Example

**E-commerce** “top picks” row.

---

### Supplementary — **`namespace()` for macros**

### 🟢 Beginner Example

Advanced pattern for mutable macro-internal state—use sparingly.

### 🟡 Intermediate Example

Prefer Python for complex state.

### 🔴 Expert Example

Document macro APIs like functions.

### 🌍 Real-Time Example

**SaaS** wizard steps macro with internal counters.

---

### Supplementary — **CSRF in forms**

### 🟢 Beginner Example

Use **Flask-WTF** for CSRF tokens in forms.

### 🟡 Intermediate Example

```jinja2
<form method="post">
  {{ form.hidden_tag() }}
</form>
```

### 🔴 Expert Example

Double-submit cookie patterns for SPAs.

### 🌍 Real-Time Example

**E-commerce** checkout POST hardened with CSRF + SameSite cookies.

---

### Supplementary — **Internationalization (i18n)**

### 🟢 Beginner Example

```jinja2
{{ _('Welcome') }}
```

### 🟡 Intermediate Example

Flask-Babel integration for locale negotiation.

### 🔴 Expert Example

RTL layout toggles via `dir` attribute from locale.

### 🌍 Real-Time Example

**Global SaaS** serves DE/FR/EN templates with shared components.

---

### Supplementary — **Error pages**

### 🟢 Beginner Example

```python
@app.errorhandler(404)
def not_found(e):
    return render_template("errors/404.html"), 404
```

### 🟡 Intermediate Example

Log `request.url` with request id.

### 🔴 Expert Example

Different 404 for API vs HTML (`Accept` aware).

### 🌍 Real-Time Example

**E-commerce** friendly 404 with search box.

---

### Supplementary — **Template tests built-ins**

### 🟢 Beginner Example

```jinja2
{% if x is defined %}
```

### 🟡 Intermediate Example

```jinja2
{% if items is iterable %}
```

### 🔴 Expert Example

Custom `is_admin` test backed by session.

### 🌍 Real-Time Example

**SaaS** show admin chrome only if `user is admin`.

---

### Supplementary — **Debugging undefined variables**

### 🟢 Beginner Example

Jinja raises on undefined in strict mode—enable in tests.

### 🟡 Intermediate Example

```python
import jinja2

app.jinja_env.undefined = jinja2.StrictUndefined
```

### 🔴 Expert Example

Catch template errors in integration tests.

### 🌍 Real-Time Example

**Social** release gate: strict templates in staging.

---

### Supplementary — **Markdown in templates**

### 🟢 Beginner Example

Render Markdown in view, pass HTML—sanitize.

### 🟡 Intermediate Example

Custom filter `markdown` using `markdown` library.

### 🔴 Expert Example

Cache rendered HTML per revision.

### 🌍 Real-Time Example

**SaaS** docs portal.

---

### Supplementary — **Pagination UI**

### 🟢 Beginner Example

Pass `page`, `total_pages` to template.

### 🟡 Intermediate Example

Macro `pagination(page, total)`.

### 🔴 Expert Example

SEO `rel=prev/next` in `head` block.

### 🌍 Real-Time Example

**E-commerce** category PLP with faceted search.

---

### Extended four-level — **Activity feed partial**

### 🟢 Beginner Example

```jinja2
{% for e in events %}
  <li>{{ e.text }}</li>
{% endfor %}
```

### 🟡 Intermediate Example

```jinja2
{% include 'partials/feed_item.html' %}
```

### 🔴 Expert Example

Macro with avatar sizes and relative time filter.

### 🌍 Real-Time Example

**Social** real-time updates: template stable, data swapped via HTMX/AJAX.

---

### Extended four-level — **SaaS sidebar**

### 🟢 Beginner Example

Static sidebar links.

### 🟡 Intermediate Example

Highlight active section from `request.path` in context processor.

### 🔴 Expert Example

Feature-flagged menu items from `g.features`.

### 🌍 Real-Time Example

**Enterprise** RBAC trims sidebar per role server-side.

---

### Deep dive — **Blueprint template precedence**

### 🟢 Beginner Example

App templates override blueprint names if same relative path—verify loader order.

### 🟡 Intermediate Example

Namespace blueprint templates in subfolders.

### 🔴 Expert Example

Custom Jinja loader merging paths.

### 🌍 Real-Time Example

**White-label** partner overrides `seller/dashboard.html`.

---

### Deep dive — **Performance: autoescape off for non-HTML**

### 🟢 Beginner Example

`.txt` templates may not autoescape—still escape if mixing sources.

### 🟡 Intermediate Example

Use `render_template` with correct extension.

### 🔴 Expert Example

Email text vs HTML multipart.

### 🌍 Real-Time Example

**Transactional email** pipeline.

---

*End of Templates and Jinja2 — Flask 3.1.3 learning notes.*
