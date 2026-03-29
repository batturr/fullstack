# Blueprints with Flask 3.1.3

**Blueprints** let you split a Flask application into modular components—routes, templates, static files, and hooks—without losing a single deployable app. They are essential for growing **SaaS** products (admin vs public API), **e‑commerce** (shop, checkout, merchant portal), and **social** platforms (feed, messaging, settings). This guide targets **Flask 3.1.3** and **Python 3.9+**.

---

## 📑 Table of Contents

1. [14.1 Blueprint Basics](#141-blueprint-basics)
2. [14.2 Blueprint Organization](#142-blueprint-organization)
3. [14.3 Blueprint Configuration](#143-blueprint-configuration)
4. [14.4 Blueprint Advanced Features](#144-blueprint-advanced-features)
5. [14.5 Best Practices](#145-best-practices)
6. [Best Practices (Cross-Cutting)](#best-practices-cross-cutting)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
8. [Comparison Tables](#comparison-tables)

---

## 14.1 Blueprint Basics

### 14.1.1 Concept

A Blueprint is a **deferrable** registration unit: you define routes on it, then `app.register_blueprint(bp)` attaches them to the application with optional URL prefixes.

**🟢 Beginner Example** — mental model:

```text
Blueprint "blog" + prefix "/blog" → route "/" becomes "/blog/"
```

**🟡 Intermediate Example** — same blueprint registered twice with different `url_prefix` and `name` for A/B microsites (advanced).

**🔴 Expert Example** — blueprint as installable Python package distributed to partners.

**🌍 Real-Time Example** — SaaS: `tenant_admin` blueprint only mounted when feature flag on.

---

### 14.1.2 Creating Blueprints

**🟢 Beginner Example**

```python
from flask import Blueprint

bp = Blueprint("blog", __name__, url_prefix="/blog")

@bp.get("/")
def index():
    return "Blog home"
```

**🟡 Intermediate Example** — separate `name` (endpoint namespace) from import name:

```python
api_v1 = Blueprint("api_v1", __name__, url_prefix="/api/v1")
```

**🔴 Expert Example** — blueprint subclassing rare; prefer composition.

**🌍 Real-Time Example** — e‑commerce `checkout_bp` isolated for PCI review scope.

---

### 14.1.3 Registration

**🟢 Beginner Example**

```python
from flask import Flask
from blog import bp as blog_bp

app = Flask(__name__)
app.register_blueprint(blog_bp)
```

**🟡 Intermediate Example** — factory:

```python
def create_app():
    app = Flask(__name__)
    from .blog import bp as blog_bp
    app.register_blueprint(blog_bp)
    return app
```

**🔴 Expert Example** — conditional registration from config `ENABLED_MODULES`.

**🌍 Real-Time Example** — SaaS OEM: register white-label `branding` blueprint per customer build.

---

### 14.1.4 Blueprint Routes

`@bp.route` and `@bp.get` / `@bp.post` (Flask 2+) attach to the blueprint.

**🟢 Beginner Example**

```python
@bp.get("/posts/<int:post_id>")
def post_detail(post_id: int):
    return {"id": post_id}
```

**🟡 Intermediate Example** — same-rule methods:

```python
@bp.route("/item/<int:id>", methods=["GET", "PATCH"])
def item(id: int):
    ...
```

**🔴 Expert Example** — `strict_slashes=False` per blueprint for API consistency.

**🌍 Real-Time Example** — social JSON API blueprint vs HTML site blueprint.

---

### 14.1.5 URL Prefixes

**🟢 Beginner Example**

```python
app.register_blueprint(admin_bp, url_prefix="/admin")
```

**🟡 Intermediate Example** — nested conceptual prefix: blueprint defines `/users`, registration adds `/api` → `/api/users`.

**🔴 Expert Example** — subdomain routing via `app.url_map` host matching (not prefix alone).

**🌍 Real-Time Example** — `api.example.com` vs path `/api` behind same app.

---

## 14.2 Blueprint Organization

### 14.2.1 Multi-File Organization

**🟢 Beginner Example**

```text
myapp/
  __init__.py      # create_app, register blueprints
  blog/
    __init__.py    # exports bp
    routes.py
    forms.py
```

**🟡 Intermediate Example** — `routes.py` only imports `bp` from `__init__.py`:

```python
# blog/__init__.py
from flask import Blueprint
bp = Blueprint("blog", __name__, url_prefix="/blog")

from . import routes  # noqa: E402,F401
```

**🔴 Expert Example** — lazy import routes inside `register` function to shave cold start (micro-optimization).

**🌍 Real-Time Example** — large SaaS: 20+ blueprints by bounded context.

---

### 14.2.2 Blueprint Modules

**🟢 Beginner Example** — one blueprint per business area: `auth`, `billing`, `reports`.

**🟡 Intermediate Example** — internal packages `myapp/billing/views.py`, `myapp/billing/services.py`.

**🔴 Expert Example** — enforce module boundaries with import-linter rules.

**🌍 Real-Time Example** — e‑commerce team ownership per blueprint directory.

---

### 14.2.3 Package Structure

**🟢 Beginner Example**

```text
shop/
  __init__.py
  catalog.py   # registers routes on shop.bp
  cart.py
```

**🟡 Intermediate Example** — `shop/__init__.py` defines `bp`, `catalog.py` uses `from . import bp`.

**🔴 Expert Example** — optional `shop/plugins/` discovered at runtime.

**🌍 Real-Time Example** — marketplace third-party seller blueprint package.

---

### 14.2.4 Import Strategies

**🟢 Beginner Example** — absolute imports `from myapp.blog import bp`.

**🟡 Intermediate Example** — relative within package `from . import routes`.

**🔴 Expert Example** — `TYPE_CHECKING` guards for circular type imports.

**🌍 Real-Time Example** — monorepo shared `libs/auth` imported by multiple Flask services.

---

### 14.2.5 Circular Import Prevention

**🟢 Beginner Example** — `extensions.py` holds `db`, `login_manager`; models import `db` only.

**🟡 Intermediate Example** — import views at bottom of `__init__.py` after `bp` creation.

**🔴 Expert Example** — application service layer imported by views, not by models.

**🌍 Real-Time Example** — social: `notifications` blueprint imports user service interface, not `models` from `feed`.

---

## 14.3 Blueprint Configuration

### 14.3.1 Static Files in Blueprints

**🟢 Beginner Example**

```python
bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/admin",
    static_folder="static",
    static_url_path="/admin-static",
)
```

**🟡 Intermediate Example** — fingerprinted assets via build pipeline referencing `url_for('admin.static', filename='app.css')`.

**🔴 Expert Example** — CDN origin pulls from same static tree; Flask only in dev.

**🌍 Real-Time Example** — e‑commerce admin bundle separate from storefront assets.

---

### 14.3.2 Templates in Blueprints

**🟢 Beginner Example**

```python
bp = Blueprint("blog", __name__, template_folder="templates")
```

```python
@bp.get("/")
def index():
    return render_template("index.html")
```

Flask searches `blog/templates/` then app templates.

**🟡 Intermediate Example** — override blueprint template from app `templates/` with same relative path.

**🔴 Expert Example** — namespaced template paths `blog/index.html` to avoid collisions.

**🌍 Real-Time Example** — SaaS theme pack overrides `shop/product.html` at app level.

---

### 14.3.3 Blueprint-Specific Config

**🟢 Beginner Example** — read `app.config` inside views; no separate config object required.

**🟡 Intermediate Example** — prefix convention `CHECKOUT_` keys documented per blueprint.

**🔴 Expert Example** — `bp.record(lambda s: s.before_request(...))` for setup (see advanced).

**🌍 Real-Time Example** — feature `MAX_CART_ITEMS` used only by `cart` blueprint.

---

### 14.3.4 Blueprint Variables

**🟢 Beginner Example** — `url_for('blog.post_detail', post_id=1)` includes blueprint endpoint name.

**🟡 Intermediate Example** — `current_app.blueprints` introspection at runtime.

**🔴 Expert Example** — dynamic endpoint lists for OpenAPI generation scanning blueprints.

**🌍 Real-Time Example** — API discovery page listing mounted blueprints in dev mode.

---

### 14.3.5 Blueprint Inheritance

Flask has no class inheritance for blueprints; **compose** multiple blueprints or share helpers.

**🟢 Beginner Example** — shared `decorators.py` imported by all blueprints.

**🟡 Intermediate Example** — factory `def create_crud_blueprint(model):` returning configured `Blueprint` (metaprogramming sparingly).

**🔴 Expert Example** — plugin registers its blueprint + hooks into events bus.

**🌍 Real-Time Example** — SaaS app store: each plugin is blueprint + manifest.

---

## 14.4 Blueprint Advanced Features

### 14.4.1 Nested Blueprints

Register a blueprint on another blueprint (Flask 2.0+).

**🟢 Beginner Example**

```python
parent = Blueprint("parent", __name__, url_prefix="/parent")
child = Blueprint("child", __name__, url_prefix="/child")
parent.register_blueprint(child)
app.register_blueprint(parent)
# child routes under /parent/child/...
```

**🟡 Intermediate Example** — `api` parent + `users` child for URL clarity.

**🔴 Expert Example** — watch endpoint name collisions; use distinct blueprint names.

**🌍 Real-Time Example** — e‑commerce `/shop/catalog` and `/shop/cart` nested under `shop`.

---

### 14.4.2 Before / After Request Handlers

**🟢 Beginner Example**

```python
@bp.before_request
def require_login_for_admin():
    if request.endpoint and request.endpoint.startswith("admin.") and not current_user.is_authenticated:
        return redirect(url_for("auth.login"))
```

**🟡 Intermediate Example** — `after_request` adds security headers only for `api` blueprint.

**🔴 Expert Example** — order: app `before_request` → blueprint `before_request` (document chain).

**🌍 Real-Time Example** — SaaS: attach `g.org_id` for all `/org/<id>` blueprint routes via `before_request`.

---

### 14.4.3 Error Handlers

**🟢 Beginner Example**

```python
@bp.app_errorhandler(404)
def not_found(e):
    return render_template("errors/404.html"), 404
```

Prefer blueprint-local handlers when registered with blueprint (Flask 3 supports blueprint error handlers via `@bp.errorhandler`).

**🟡 Intermediate Example**

```python
@bp.errorhandler(403)
def forbidden(e):
    return {"error": "forbidden"}, 403
```

**🔴 Expert Example** — JSON vs HTML negotiated by `Accept` header.

**🌍 Real-Time Example** — API blueprint always JSON errors; site blueprint returns HTML.

---

### 14.4.4 Context Processors

**🟢 Beginner Example**

```python
@bp.context_processor
def inject_cart_count():
    return {"cart_count": get_cart_count()}
```

**🟡 Intermediate Example** — scope expensive work: only run for blueprint templates (still runs for all requests hitting those templates—profile if heavy).

**🔴 Expert Example** — cache per request in `g`:

```python
@bp.context_processor
def inject_feature_flags():
    if not hasattr(g, "flags"):
        g.flags = load_flags()
    return {"flags": g.flags}
```

**🌍 Real-Time Example** — e‑commerce header cart badge.

---

### 14.4.5 Teardown Functions

**🟢 Beginner Example**

```python
@bp.teardown_request
def teardown(exc):
    # release blueprint-scoped resources
    pass
```

**🟡 Intermediate Example** — close third-party client stored in `g` for specific blueprint.

**🔴 Expert Example** — prefer `teardown_appcontext` for DB; blueprint teardown for rare resources.

**🌍 Real-Time Example** — PDF generation blueprint closes temp files.

---

## 14.5 Best Practices

### 14.5.1 Blueprint Organization

**🟢 Beginner Example** — group by user journey: `auth`, `dashboard`, `settings`.

**🟡 Intermediate Example** — separate `public_site` from `authenticated_app`.

**🔴 Expert Example** — align blueprints with DDD bounded contexts.

**🌍 Real-Time Example** — social: `feed`, `messages`, `profiles`, `moderation`.

---

### 14.5.2 Naming Conventions

**🟢 Beginner Example** — blueprint name `blog` matches import package `blog`.

**🟡 Intermediate Example** — API version in name `api_v1` not just `api`.

**🔴 Expert Example** — consistent endpoint naming `blueprint.view` in logs and OpenAPI.

**🌍 Real-Time Example** — SaaS multi-module nav maps to blueprint names.

---

### 14.5.3 Documentation

**🟢 Beginner Example** — module docstring listing base URL prefix and responsibilities.

**🟡 Intermediate Example** — table in internal wiki: blueprint, owner team, auth requirements.

**🔴 Expert Example** — auto-generate route list from Flask `url_map` in CI artifact.

**🌍 Real-Time Example** — onboarding doc for new engineers walks through blueprint map.

---

### 14.5.4 Testing Blueprints

**🟢 Beginner Example**

```python
def test_blog_index(client):
    rv = client.get("/blog/")
    assert rv.status_code == 200
```

**🟡 Intermediate Example** — `pytest` fixture `app` registers subset of blueprints for fast tests.

**🔴 Expert Example** — contract tests per blueprint OpenAPI slice.

**🌍 Real-Time Example** — e‑commerce smoke tests hit `checkout` blueprint only.

---

### 14.5.5 Reusable Blueprints

**🟢 Beginner Example** — publish `health_bp` as internal package used by many services.

**🟡 Intermediate Example** — configurable blueprint via init kwargs stored on `bp` for templates.

**🔴 Expert Example** — versioned reusable auth blueprint with semver.

**🌍 Real-Time Example** — agency reuses `cms_admin` blueprint across client projects.

---

## Best Practices (Cross-Cutting)

1. **One `create_app` factory** registers all blueprints explicitly (no auto-discovery magic unless justified).
2. **Stable URL prefixes** version APIs (`/api/v1`).
3. **Avoid giant blueprints**—split when >15 routes or mixed concerns.
4. **Centralize auth** decorators in `auth/decorators.py` reused across blueprints.
5. **Use blueprint names** in `url_for` consistently (`url_for('blog.index')`).
6. **Template namespacing** reduces accidental overrides.
7. **Static and template folders** documented for ops and CDN rules.
8. **Error handlers** scoped to avoid catching unrelated blueprint errors unintentionally.
9. **Observability**: tag logs with blueprint name from `request.blueprint`.
10. **Security reviews** per blueprint for high-risk areas (admin, webhooks).

**🟢 Beginner Example** — logging:

```python
@bp.before_request
def log_blueprint():
    current_app.logger.debug("bp=%s path=%s", request.blueprint, request.path)
```

**🟡 Intermediate Example** — OpenTelemetry span attribute `blueprint.name`.

**🔴 Expert Example** — per-blueprint rate limits (Flask-Limiter `limiter.limit` on blueprint routes).

**🌍 Real-Time Example** — webhook blueprint heavily rate limited and signed.

---

## Common Mistakes to Avoid

1. **Wrong `url_for` endpoint** missing blueprint name prefix.
2. **Circular imports** from eager model/view coupling.
3. **Blueprint static URL conflicts** with app `/static`.
4. **Assuming `before_request` runs** only for that blueprint’s routes—verify skipped for static if needed.
5. **Template shadowing** surprise when app and blueprint share filenames.
6. **Registering same blueprint twice** without `name` parameter override causing errors.
7. **Mixing API and HTML** in one blueprint without clear error handling split.
8. **Forgetting `url_prefix`** on nested blueprint registration duplicating paths.
9. **Heavy context processors** slowing unrelated pages if attached at app level by mistake.
10. **No tests** for blueprint registration in factory (missed import).

**🟢 Beginner Example** — fix `url_for`:

```python
url_for("blog.post_detail", post_id=3)
```

**🟡 Intermediate Example** — fix: use `Blueprint(..., name="store_api")` when registering twice.

**🔴 Expert Example** — fix: lazy blueprint registration in Celery workers that only need subset.

**🌍 Real-Time Example** — production 404 after refactor: endpoint rename not updated in email templates.

---

## Comparison Tables

### Blueprint vs App for routes

| Aspect | Blueprint | Direct on `app` |
|--------|------------|-----------------|
| Modularity | High | Low |
| Reuse across apps | Easy | Copy/paste |
| Registration | Explicit step | Immediate |
| Testing slices | Natural | Harder |

### `url_prefix` vs full path in routes

| Style | Example | Notes |
|-------|---------|-------|
| Prefix on register | `url_prefix="/api/v1"` | Flexible |
| Prefix on Blueprint ctor | Same | Couples definition |
| Full path in routes | `@bp("/api/v1/users")` | Verbose |

### Error handler scope

| Scope | Affects |
|-------|---------|
| `@app.errorhandler` | Entire app |
| `@bp.errorhandler` | Routes on blueprint (Flask 3) |
| `@bp.app_errorhandler` | App-wide registration from blueprint module |

---

## Supplement: Full patterns

### Application factory with blueprints

**🟢 Beginner Example**

```python
from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    from .extensions import db, migrate
    db.init_app(app)
    migrate.init_app(app, db)

    from .blog import bp as blog_bp
    from .shop import bp as shop_bp

    app.register_blueprint(blog_bp)
    app.register_blueprint(shop_bp, url_prefix="/shop")

    return app
```

**🟡 Intermediate Example** — `register_blueprints(app)` function in `blueprints.py`.

**🔴 Expert Example** — plugin manifest loop `for plugin in discover_plugins(): app.register_blueprint(plugin.bp)`.

**🌍 Real-Time Example** — SaaS vertical modules toggled per deployment flavor.

---

### SaaS: org-scoped blueprint

**🟢 Beginner Example**

```python
from flask import Blueprint, abort, g, request
from flask_login import current_user

org_bp = Blueprint("org", __name__, url_prefix="/orgs/<int:org_id>")

@org_bp.before_request
def load_membership():
    org_id = request.view_args.get("org_id") if request.view_args else None
    if org_id is None:
        return
    m = Membership.query.filter_by(user_id=current_user.id, org_id=org_id).first()
    if not m:
        abort(404)
    g.membership = m
```

**🟡 Intermediate Example** — permission decorator stacked per route group.

**🔴 Expert Example** — cache membership row with invalidation webhooks.

**🌍 Real-Time Example** — enterprise workspace URLs.

---

### E‑commerce: separate storefront and merchant

**🟢 Beginner Example**

```python
app.register_blueprint(storefront_bp)
app.register_blueprint(merchant_bp, url_prefix="/merchant")
```

**🟡 Intermediate Example** — different login managers or session cookies (subdomain split).

**🔴 Expert Example** — merchant blueprint only mounted for verified sellers.

**🌍 Real-Time Example** — marketplace fraud review queue blueprint internal-only VPN.

---

### Social: API blueprint with CORS

**🟢 Beginner Example**

```python
from flask_cors import CORS

api_bp = Blueprint("api", __name__, url_prefix="/api")
CORS(api_bp, resources={r"/api/*": {"origins": "https://app.example.com"}})
```

**🟡 Intermediate Example** — tighten methods/headers per route.

**🔴 Expert Example** — OAuth bearer only, no wildcard CORS.

**🌍 Real-Time Example** — mobile app + SPA share `api` blueprint.

---

### Webhooks blueprint (signed)

**🟢 Beginner Example**

```python
webhook_bp = Blueprint("webhooks", __name__, url_prefix="/hooks")

@webhook_bp.post("/stripe")
def stripe():
    verify_stripe_signature(request)
    ...
```

**🟡 Intermediate Example** — raw body required for signature—use `request.get_data(cache=False)`.

**🔴 Expert Example** — idempotency keys stored in DB.

**🌍 Real-Time Example** — SaaS billing provider events.

---

### Nested blueprint URL map check

**🟢 Beginner Example**

```python
with app.test_request_context():
    print(app.url_map)
```

**🟡 Intermediate Example** — assert tests scan expected rules exist.

**🔴 Expert Example** — diff `url_map` between versions in CI for accidental removals.

**🌍 Real-Time Example** — release checklist.

---

### Blueprint-specific CLI commands

**🟢 Beginner Example**

```python
import click
from flask.cli import with_appcontext

@click.command("seed-blog")
@with_appcontext
def seed_blog():
    ...
```

Register in blueprint `__init__` via `app.cli.add_command` in factory after import.

**🟡 Intermediate Example** — namespaced group `flask shop import-catalog`.

**🔴 Expert Example** — long-running commands as separate worker, CLI just enqueues.

**🌍 Real-Time Example** — e‑commerce nightly catalog sync.

---

### Testing blueprint isolation

**🟢 Beginner Example**

```python
@pytest.fixture()
def app():
    app = Flask(__name__)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.testing = True
    return app
```

**🟡 Intermediate Example** — snapshot JSON responses for `api` blueprint only.

**🔴 Expert Example** — fuzz webhook blueprint with generated payloads in staging.

**🌍 Real-Time Example** — SOC2 evidence of input validation tests.

---

### `register_blueprint` name parameter

**🟢 Beginner Example**

```python
app.register_blueprint(simple_page, name="admin_cn")
```

**🟡 Intermediate Example** — duplicate blueprint class for localized admin URLs.

**🔴 Expert Example** — ensure `url_for` uses correct endpoint names (`admin_cn.index`).

**🌍 Real-Time Example** — multi-language admin subpaths `/en/admin`, `/zh/admin`.

---

### Static URL path collision avoidance

**🟢 Beginner Example**

```python
bp = Blueprint("dash", __name__, static_url_path="/dash-static", static_folder="static")
```

**🟡 Intermediate Example** — nginx maps `/dash-static/` to Flask or CDN.

**🔴 Expert Example** — content-addressable hashed filenames.

**🌍 Real-Time Example** — SaaS long cache TTL on versioned assets.

---

### Template search path clarity

**🟢 Beginner Example** — use package layout:

```text
blog/
  templates/
    blog/
      index.html
```

Render `blog/index.html`.

**🟡 Intermediate Example** — Jinja `{% extends "base.html" %}` from app templates.

**🔴 Expert Example** — blueprint-specific `base.html` only when necessary to reduce fork.

**🌍 Real-Time Example** — white-label partner overrides one template file.

---

### `bp.record` for deferred setup

**🟢 Beginner Example**

```python
def register_stuff(state):
    app = state.app
    app.logger.info("blog blueprint registered")

bp.record(register_stuff)
```

**🟡 Intermediate Example** — attach signals when blueprint registered.

**🔴 Expert Example** — conditional middleware insertion.

**🌍 Real-Time Example** — observability hooks for specific modules.

---

### MethodView on blueprint

**🟢 Beginner Example**

```python
from flask.views import MethodView

class ItemAPI(MethodView):
    def get(self, item_id):
        return {"id": item_id}

bp.add_url_rule("/items/<int:item_id>", view_func=ItemAPI.as_view("item_api"))
```

**🟡 Intermediate Example** — `decorators = [login_required]`.

**🔴 Expert Example** — content negotiation in `dispatch_request`.

**🌍 Real-Time Example** — REST item resource in `api` blueprint.

---

### Blueprint `url_defaults`

**🟢 Beginner Example**

```python
bp = Blueprint("lang", __name__, url_prefix="/<lang_code>")

@bp.url_defaults
def add_lang(endpoint, values):
    values.setdefault("lang_code", g.lang)

@bp.url_value_preprocessor
def pull_lang(endpoint, values):
    g.lang = values.pop("lang_code", "en")
```

**🟡 Intermediate Example** — validate `lang_code` against supported set.

**🔴 Expert Example** — integrate with i18n libraries.

**🌍 Real-Time Example** — e‑commerce localized storefront.

---

### Large app: blueprint registry dict

**🟢 Beginner Example**

```python
BLUEPRINTS = [
    ("blog.blog", "/blog"),
    ("shop.shop", "/shop"),
]

def register_all(app):
    for qual, prefix in BLUEPRINTS:
        module, name = qual.split(".")
        bp = getattr(importlib.import_module(f"app.{module}"), "bp")
        app.register_blueprint(bp, url_prefix=prefix)
```

**🟡 Intermediate Example** — config-driven enablement.

**🔴 Expert Example** — topological sort for dependency order (rare).

**🌍 Real-Time Example** — modular monolith gradual extraction to services later.

---

### Security: blueprint isolation for admin

**🟢 Beginner Example** — IP allowlist in `admin.before_request`.

**🟡 Intermediate Example** — separate cookie domain or HttpOnly session for admin.

**🔴 Expert Example** — deploy admin blueprint only on internal service mesh.

**🌍 Real-Time Example** — bank SaaS admin split from public internet.

---

### Performance: blueprint before_request minimal work

**🟢 Beginner Example** — only parse JWT if path starts with `/api/`.

**🟡 Intermediate Example** — skip static files early `if request.path.startswith("/static"): return`.

**🔴 Expert Example** — connection pooling per blueprint rarely needed—prefer shared `db`.

**🌍 Real-Time Example** — high-QPS public read blueprint avoids session writes.

---

### OpenAPI tag per blueprint

**🟢 Beginner Example** — `@bp.doc` if using flasgger/APISpec conventions.

**🟡 Intermediate Example** — generate tags from blueprint name automatically.

**🔴 Expert Example** — merge specs from microservices behind gateway (beyond monolith).

**🌍 Real-Time Example** — public developer portal.

---

### Dead blueprint detection

**🟢 Beginner Example** — grep for `register_blueprint` vs defined blueprints.

**🟡 Intermediate Example** — custom linter rule.

**🔴 Expert Example** — archive unused modules.

**🌍 Real-Time Example** — post-acquisition codebase consolidation.

---

*End of Blueprints notes — Flask 3.1.3, Python 3.9+.*
