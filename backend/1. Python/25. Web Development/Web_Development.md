
# Python Web Development (Topic 25)

Web development in Python spans HTTP fundamentals, microframeworks like **Flask**, batteries-included **Django**, JSON **APIs**, persistence layers, **security**, and **deployment** topologies. Each subsection below uses three depth levels and a short code sketch oriented toward APIs, dashboards, and SaaS backends.

## 📑 Table of Contents

- [25.1 Web Basics](#251-web-basics)
- [25.2 Flask](#252-flask)
- [25.3 Flask Advanced](#253-flask-advanced)
- [25.4 Django](#254-django)
- [25.5 REST APIs](#255-rest-apis)
- [25.6 Databases and ORMs](#256-databases-and-orms)
- [25.7 Web Security](#257-web-security)
- [25.8 Deployment and Operations](#258-deployment-and-operations)
- [Topic Key Points](#topic-key-points)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 25.1 Web Basics

<a id="251-web-basics"></a>


### 25.1.1 HTTP Protocol Overview

**Beginner Level**: Http protocol overview is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, http protocol overview decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, http protocol overview is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# Client asks server for a resource; server responds with status + body
import urllib.request
with urllib.request.urlopen("https://example.com") as r:
    print(r.status, r.headers.get("Content-Type"))
```

#### Key Points

- HTTP is stateless—each request carries enough context (cookies, tokens) to continue a session.
- Python `urllib` is fine for scripts; apps usually use `httpx` or `requests`.

---


### 25.1.2 HTTPS, TLS, and Certificates

**Beginner Level**: Https, tls, and certificates is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, https, tls, and certificates decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, https, tls, and certificates is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# Production apps terminate TLS at Nginx/ingress; Flask/Django see plain HTTP internally
# curl -I https://api.example.com  # verify cert chain in ops runbooks
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")  # Django-style hint
```

#### Key Points

- Always redirect HTTP→HTTPS for public sites.
- Terminate TLS close to users; re-encrypt between internal hops if policy requires.

---


### 25.1.3 HTTP Request Structure

**Beginner Level**: Http request structure is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, http request structure decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, http request structure is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask, request
app = Flask(__name__)

@app.post("/orders")
def create_order():
    body = request.get_json(silent=True) or {}
    auth = request.headers.get("Authorization", "")
    return {"received": body, "has_auth": bool(auth)}, 201
```

#### Key Points

- Method + path + headers + optional body.
- JSON APIs should validate `Content-Type` and reject malformed bodies early.

---


### 25.1.4 HTTP Response Structure

**Beginner Level**: Http response structure is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, http response structure decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, http response structure is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import make_response, jsonify

def ok_payload(data):
    resp = make_response(jsonify(data), 200)
    resp.headers["Cache-Control"] = "no-store"
    return resp
```

#### Key Points

- Status code + headers + body; APIs often standardize error envelopes.
- Set caching headers deliberately for CDN behavior.

---


### 25.1.5 HTTP Methods and CRUD Mapping

**Beginner Level**: Http methods and crud mapping is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, http methods and crud mapping decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, http methods and crud mapping is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# REST-ish mapping (conceptual)
ROUTES = {
    "GET /users": "list",
    "POST /users": "create",
    "GET /users/{id}": "read",
    "PUT /users/{id}": "replace",
    "PATCH /users/{id}": "partial",
    "DELETE /users/{id}": "delete",
}
```

#### Key Points

- Use POST for non-idempotent actions like payments.
- Idempotent PUT/DELETE simplify retries from mobile clients.

---


### 25.1.6 HTTP Status Code Families

**Beginner Level**: Status codes tell you whether a request succeeded, was redirected, failed because of bad input, or failed on the server—like traffic lights for API debugging.

**Intermediate Level**: In Flask/Django JSON APIs you map domain errors to **4xx** (client) vs **5xx** (server) consistently, and you document which codes your mobile clients should retry.

**Expert Level**: At scale, ingress controllers and service meshes use status-class metrics for SLOs; you align canonical mappings with RFC 9110 guidance and versioned error schemas without breaking old SDKs.

```python
def classify(code: int) -> str:
    if 200 <= code < 300:
        return "success"
    if 300 <= code < 400:
        return "redirect"
    if 400 <= code < 500:
        return "client_error"
    if 500 <= code < 600:
        return "server_error"
    return "unknown"
```

#### Key Points

- Return 422 for validation errors in many JSON APIs.
- Use 401 vs 403 consistently: unauthenticated vs forbidden.

---


### 25.1.7 HTTP Headers (Content-Type, Auth, Cache)

**Beginner Level**: Http headers (content-type, auth, cache) is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, http headers (content-type, auth, cache) decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, http headers (content-type, auth, cache) is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer <token>",
    "Cache-Control": "max-age=60",
    "ETag": '"v1-abc123"',
}
```

#### Key Points

- Prefer `application/json; charset=utf-8` for APIs.
- Use `Vary` when responses differ by `Accept-Encoding` or `Authorization`.

---


### 25.1.8 Cookies

**Beginner Level**: Cookies is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, cookies decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, cookies is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask, make_response, request
app = Flask(__name__)

@app.get("/login")
def login():
    resp = make_response({"ok": True})
    resp.set_cookie("session", "signed-value", httponly=True, samesite="Lax", secure=True)
    return resp

@app.get("/me")
def me():
    return {"session": request.cookies.get("session")}
```

#### Key Points

- `HttpOnly` reduces XSS token theft.
- `SameSite` mitigates CSRF for cookie-based auth.

---


### 25.1.9 Sessions and Server-Side State

**Beginner Level**: Sessions and server-side state is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, sessions and server-side state decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, sessions and server-side state is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# Flask server-side session (conceptual) stores user id server-side, cookie holds session key
SERVER_SESSION = {}

def new_session(user_id: str) -> str:
    sid = "sess_" + user_id
    SERVER_SESSION[sid] = {"user_id": user_id}
    return sid
```

#### Key Points

- JWT moves state to client; server sessions keep revocation easier.
- Redis is a common session store for horizontal scale.

---

## 25.2 Flask

<a id="252-flask"></a>


### 25.2.1 Flask and WSGI Basics

**Beginner Level**: Flask and wsgi basics is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, flask and wsgi basics decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, flask and wsgi basics is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask
app = Flask(__name__)

@app.get("/health")
def health():
    return {"status": "ok"}

# flask run  # dev server — use Gunicorn/uWSGI in prod
```

#### Key Points

- WSGI connects web servers to Python apps.
- Flask is microframework—add extensions for ORM, auth, etc.

---


### 25.2.2 Creating the Flask Application Object

**Beginner Level**: Creating the flask application object is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, creating the flask application object decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, creating the flask application object is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import os
from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only")
    return app
```

#### Key Points

- Import `app` as application factory for tests.
- Never ship default `SECRET_KEY` in production.

---


### 25.2.3 Routing and URL Rules

**Beginner Level**: Routing and url rules is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, routing and url rules decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, routing and url rules is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask
app = Flask(__name__)

@app.get("/users/<int:user_id>")
def user_detail(user_id: int):
    return {"user_id": user_id}

@app.route("/post/<slug>", methods=["GET", "HEAD"])
def blog_post(slug: str):
    return {"slug": slug}
```

#### Key Points

- Converters: `int`, `float`, `path`, `uuid`.
- Order matters for overlapping rules—specific routes before catch-alls.

---


### 25.2.4 URL Building with `url_for`

**Beginner Level**: Url building with `url_for` is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, url building with `url_for` decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, url building with `url_for` is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask, url_for
app = Flask(__name__)

@app.get("/item/<int:item_id>")
def item(item_id: int):
    return {"self": url_for("item", item_id=item_id, _external=True)}
```

#### Key Points

- Build URLs from endpoint names—survives refactors.
- `_external=True` for absolute URLs in emails.

---


### 25.2.5 Views: Functions and Return Types

**Beginner Level**: Views: functions and return types is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, views: functions and return types decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, views: functions and return types is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Response, jsonify

def csv_view():
    data = "id,name\n1,ada\n"
    return Response(data, mimetype="text/csv")

def json_view():
    return jsonify({"a": 1})
```

#### Key Points

- Return tuples `(body, status, headers)` when needed.
- Streaming responses suit large downloads.

---


### 25.2.6 The Request Object

**Beginner Level**: The request object is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, the request object decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, the request object is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import request

def handle():
    q = request.args.get("q", "")
    page = request.args.get("page", default=1, type=int)
    payload = request.get_json(silent=True)
    return {"q": q, "page": page, "json": payload}
```

#### Key Points

- Validate query params—types can be coerced with `type=`.
- Never trust `X-Forwarded-*` without trusted proxy config.

---


### 25.2.7 Responses, Status Codes, and JSON

**Beginner Level**: Responses, status codes, and json is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, responses, status codes, and json decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, responses, status codes, and json is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import jsonify, abort

def read_user(user_id: int):
    if user_id < 1:
abort(400, description="invalid id")
    return jsonify({"id": user_id}), 200
```

#### Key Points

- Use `abort` for early exits with HTTP errors.
- Consistent JSON keys help mobile clients.

---


### 25.2.8 Jinja2 Templates

**Beginner Level**: Jinja2 templates is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, jinja2 templates decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, jinja2 templates is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask, render_template_string
app = Flask(__name__)

@app.get("/hello")
def hello():
    from flask import request
    tpl = "<h1>Hello {{ name|e }}</h1>"
    return render_template_string(tpl, name=request.args.get("name", "world"))
```

#### Key Points

- Always escape user HTML—`|e` or autoescape enabled.
- Template inheritance reduces duplication for dashboards.

---


### 25.2.9 Static Files and `static_url_path`

**Beginner Level**: Static files and `static_url_path` is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, static files and `static_url_path` decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, static files and `static_url_path` is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
app = None  # placeholder — real: app = Flask(__name__, static_folder="static")
# url_for('static', filename='app.js') in templates
```

#### Key Points

- Serve static via CDN in production.
- Fingerprint assets for cache busting.

---

## 25.3 Flask Advanced

<a id="253-flask-advanced"></a>


### 25.3.1 Blueprints for Modular Applications

**Beginner Level**: Blueprints for modular applications is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, blueprints for modular applications decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, blueprints for modular applications is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Blueprint, jsonify
bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")

@bp.get("/ping")
def ping():
    return jsonify({"v": 1})
```

#### Key Points

- Group routes by domain: billing, auth, analytics.
- Register blueprints in application factory.

---


### 25.3.2 Application Factory Pattern

**Beginner Level**: Application factory pattern is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, application factory pattern decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, application factory pattern is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask

def create_app(testing: bool = False):
    app = Flask(__name__)
    app.config["TESTING"] = testing
    from . import routes
    routes.register(app)
    return app
```

#### Key Points

- Factories enable multiple app instances in tests.
- Delay imports to avoid circular dependencies.

---


### 25.3.3 Request Hooks: `before_request` / `after_request`

**Beginner Level**: Request hooks: `before_request` / `after_request` is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, request hooks: `before_request` / `after_request` decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, request hooks: `before_request` / `after_request` is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import time
from flask import Flask, g
app = Flask(__name__)

@app.before_request
def start_timer():
    g.start = time.time()

@app.after_request
def add_header(response):
    response.headers["X-Elapsed-ms"] = str(int((time.time() - g.start) * 1000))
    return response
```

#### Key Points

- Use hooks for tracing IDs, DB session open/close.
- Keep hooks fast—no heavy I/O unless async-safe.

---


### 25.3.4 Centralized Error Handlers

**Beginner Level**: Centralized error handlers is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, centralized error handlers decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, centralized error handlers is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import Flask, jsonify
app = Flask(__name__)

@app.errorhandler(ValueError)
def bad_value(e):
    return jsonify({"error": str(e)}), 400
```

#### Key Points

- Map domain errors to HTTP responses.
- Log server errors with stack traces, return generic message to clients.

---


### 25.3.5 Request Context vs Application Context

**Beginner Level**: Request context vs application context is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, request context vs application context decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, request context vs application context is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# request-local vs app-global configuration
from flask import current_app, has_request_context
def cfg_key(k: str):
    return current_app.config.get(k) if has_request_context() else None
```

#### Key Points

- `g` is request-scoped; `current_app` is app proxy.
- Push contexts manually in CLI scripts and tests.

---


### 25.3.6 The `g` Object and Teardowns

**Beginner Level**: The `g` object and teardowns is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, the `g` object and teardowns decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, the `g` object and teardowns is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask import g

def get_db():
    if "db" not in g:
g.db = connect_db()
    return g.db

def teardown_db(exc):
    db = g.pop("db", None)
    if db is not None:
db.close()
```

#### Key Points

- Register teardown functions to avoid connection leaks.
- Pattern mirrors Flask-SQLAlchemy session lifecycle.

---


### 25.3.7 Flask Extensions (SQLAlchemy Pattern)

**Beginner Level**: Flask extensions (sqlalchemy pattern) is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, flask extensions (sqlalchemy pattern) decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, flask extensions (sqlalchemy pattern) is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
```

#### Key Points

- Extensions attach to app in factory `init_*` methods.
- Avoid creating engine at import time before config exists.

---


### 25.3.8 Testing Flask with `pytest` and Test Client

**Beginner Level**: Testing flask with `pytest` and test client is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, testing flask with `pytest` and test client decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, testing flask with `pytest` and test client is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import pytest

@pytest.fixture()
def client():
    from myapp import create_app
    app = create_app(testing=True)
    return app.test_client()

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
```

#### Key Points

- Use in-memory SQLite for fast model tests.
- Test auth by setting headers or session cookies.

---


### 25.3.9 Configuration and the Twelve-Factor App

**Beginner Level**: Configuration and the twelve-factor app is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, configuration and the twelve-factor app decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, configuration and the twelve-factor app is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
```

#### Key Points

- Store secrets in env vars or secret managers.
- Separate dev/staging/prod settings modules.

---

## 25.4 Django

<a id="254-django"></a>


### 25.4.1 Django Project and App Layout

**Beginner Level**: Django project and app layout is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, django project and app layout decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, django project and app layout is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# mysite/
#   manage.py
#   mysite/settings.py
#   blog/models.py
# python manage.py startapp analytics
```

#### Key Points

- Project holds settings/urls; apps hold features.
- Keep apps focused—`accounts`, `billing`, `catalog`.

---


### 25.4.2 `settings.py` and Environments

**Beginner Level**: `settings.py` and environments is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, `settings.py` and environments decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, `settings.py` and environments is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import os
DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": "db.sqlite3"}}
```

#### Key Points

- Never enable DEBUG in production.
- Use `django-environ` or split settings files.

---


### 25.4.3 Models and Fields

**Beginner Level**: Models and fields is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, models and fields decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, models and fields is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from django.db import models

class Product(models.Model):
    sku = models.CharField(max_length=32, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Key Points

- Use `DecimalField` for money.
- Indexes on foreign keys and filter columns.

---


### 25.4.4 Migrations Workflow

**Beginner Level**: Migrations workflow is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, migrations workflow decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, migrations workflow is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# makemigrations -> migrate
# python manage.py makemigrations blog
# python manage.py migrate
```

#### Key Points

- Review auto migrations for destructive ops.
- Squash migrations periodically in long-lived apps.

---


### 25.4.5 Function-Based Views

**Beginner Level**: Function-based views is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, function-based views decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, function-based views is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from django.http import JsonResponse
from django.views.decorators.http import require_GET

@require_GET
def ping(request):
    return JsonResponse({"ok": True})
```

#### Key Points

- FBV + decorators is explicit and easy to grep.
- Great for tiny JSON endpoints.

---


### 25.4.6 Class-Based and Generic Views

**Beginner Level**: Class-based and generic views is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, class-based and generic views decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, class-based and generic views is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from django.views.generic import ListView
from .models import Product

class ProductList(ListView):
    model = Product
    paginate_by = 25
```

#### Key Points

- CBV reuse via mixins.
- Generic views accelerate CRUD admin-style pages.

---


### 25.4.7 URL Routing and `reverse`

**Beginner Level**: Url routing and `reverse` is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, url routing and `reverse` decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, url routing and `reverse` is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from django.urls import path
from . import views

urlpatterns = [
    path("items/<int:pk>/", views.item_detail, name="item-detail"),
]
```

#### Key Points

- Named URLs power templates and redirects.
- Include sub-urlpatterns per app.

---


### 25.4.8 Templates and the Django Template Language

**Beginner Level**: Templates and the django template language is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, templates and the django template language decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, templates and the django template language is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
{# templates/dashboard.html #}
{# {% extends "base.html" %} {% block content %} ... {% endblock %} #}
```

#### Key Points

- Autoescape on by default for HTML.
- Keep logic minimal—complex formatting in views or custom tags.

---


### 25.4.9 Forms and `ModelForm`

**Beginner Level**: Forms and `modelform` is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, forms and `modelform` decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, forms and `modelform` is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from django import forms
from .models import Product

class ProductForm(forms.ModelForm):
    class Meta:
model = Product
fields = ["sku", "price"]
```

#### Key Points

- Server-side validation is authoritative.
- Combine with DRF serializers for APIs.

---


### 25.4.10 Django Admin and Authentication

**Beginner Level**: Django admin and authentication is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, django admin and authentication decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, django admin and authentication is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from django.contrib import admin
from django.contrib.auth.models import User
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku", "price", "created_at")
```

#### Key Points

- Admin is for operators—lock behind SSO/VPN.
- Use `AbstractUser` extensions for profile fields.

---

## 25.5 REST APIs

<a id="255-rest-apis"></a>


### 25.5.1 REST Principles and Resource Design

**Beginner Level**: Rest principles and resource design is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, rest principles and resource design decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, rest principles and resource design is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# resources are nouns: /orders/{id}/lines
RESOURCES = {
    "collection": "GET list, POST create",
    "member": "GET read, PUT replace, PATCH partial, DELETE remove",
}
```

#### Key Points

- Avoid RPC-style `/doSomething` in pure REST shops—use verbs via POST actions when needed.
- Hypermedia (HATEOAS) is optional but helps discoverability.

---


### 25.5.2 JSON Serialization Patterns

**Beginner Level**: Json serialization patterns is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, json serialization patterns decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, json serialization patterns is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from dataclasses import dataclass, asdict
import json

@dataclass
class UserDTO:
    id: int
    name: str

print(json.dumps(asdict(UserDTO(1, "ada"))))
```

#### Key Points

- Use DTOs to avoid leaking ORM fields.
- Standardize `datetime` to ISO-8601 UTC.

---


### 25.5.3 Flask-RESTful Style Resources

**Beginner Level**: Flask-restful style resources is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, flask-restful style resources decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, flask-restful style resources is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# from flask_restful import Api, Resource
# class Item(Resource):
#     def get(self, item_id): return {"id": item_id}
# api.add_resource(Item, "/items/<int:item_id>")
```

#### Key Points

- Class per resource maps HTTP verbs to methods.
- Consider FastAPI/DRF for larger API surfaces.

---


### 25.5.4 Django REST Framework Overview

**Beginner Level**: Django rest framework overview is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, django rest framework overview decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, django rest framework overview is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# serializers.ModelSerializer + viewsets.ModelViewSet + routers.DefaultRouter
# provides CRUD + OpenAPI via drf-spectacular
```

#### Key Points

- DRF serializers centralize validation + rendering.
- Permissions classes enforce authz per viewset action.

---


### 25.5.5 Pagination for Large Collections

**Beginner Level**: Pagination splits a huge list of orders or users into pages so the browser or mobile app loads a small chunk at a time.

**Intermediate Level**: DRF and custom Flask endpoints expose `?page=` / `?limit=` or `Link` headers; you cap `limit` to protect the database from accidental full-table scans.

**Expert Level**: Cursor-based pagination (opaque `next_cursor`) scales for high-churn feeds; offset pagination degrades on deep pages—choose per resource and document stability guarantees.

```python
def page_slice(items, page: int, size: int):
    start = (page - 1) * size
    return items[start : start + size], len(items)
```

#### Key Points

- Cursor pagination suits high-churn feeds.
- Offset pagination is simpler for admin UIs.

---


### 25.5.6 Filtering, Sorting, and Query Parameters

**Beginner Level**: Filtering, sorting, and query parameters is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, filtering, sorting, and query parameters decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, filtering, sorting, and query parameters is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# ?status=paid&sort=-created_at&limit=50
FILTERS = {"status": str, "sort": str, "limit": int}
```

#### Key Points

- Whitelist filter fields—prevent arbitrary column sorts (SQLi risk if raw).
- Document OpenAPI parameters.

---


### 25.5.7 API Versioning Strategies

**Beginner Level**: Api versioning strategies is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, api versioning strategies decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, api versioning strategies is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
VERSIONS = {
    "url_prefix": "/api/v2/users",
    "header": "Accept: application/vnd.myapp+json; version=2",
    "query": "?api_version=2",
}
```

#### Key Points

- Pick one strategy per ecosystem and stick to it.
- Sunset old versions with metrics on traffic.

---


### 25.5.8 Consistent API Error Envelopes

**Beginner Level**: Clients should always get errors in the same JSON shape—fields like `title`, `detail`, and `status`—so mobile apps can show predictable messages.

**Intermediate Level**: Flask/Django views wrap domain exceptions into HTTP responses; you separate **user-safe** messages from **internal** logs that include stack traces.

**Expert Level**: RFC 7807 **Problem Details** (`application/problem+json`) plays well with API gateways; you localize messages and attach `instance` URIs for support without exposing internals.

```python
def problem(status: int, title: str, detail: str):
    return (
        {"type": "about:blank", "title": title, "status": status, "detail": detail},
        status,
    )
```

#### Key Points

- RFC 7807 `application/problem+json` improves client handling.
- Never leak stack traces externally.

---


### 25.5.9 OpenAPI, Swagger UI, and Contract Testing

**Beginner Level**: Openapi, swagger ui, and contract testing is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, openapi, swagger ui, and contract testing decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, openapi, swagger ui, and contract testing is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# FastAPI generates OpenAPI; DRF uses drf-spectacular
SPEC = {"openapi": "3.0.3", "paths": {"/users": {"get": {"responses": {"200": {"description": "ok"}}}}}}
```

#### Key Points

- Publish `/openapi.json` for integrators.
- Contract tests catch breaking field removals.

---

## 25.6 Databases and ORMs

<a id="256-databases-and-orms"></a>


### 25.6.1 SQLAlchemy Engine and Session

**Beginner Level**: Sqlalchemy engine and session is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, sqlalchemy engine and session decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, sqlalchemy engine and session is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("sqlite:///:memory:", future=True)
Session = sessionmaker(bind=engine, future=True)
```

#### Key Points

- One engine per process; sessions per request.
- Use `future=True` for 2.0 style APIs.

---


### 25.6.2 Declarative Models in SQLAlchemy

**Beginner Level**: Declarative models in sqlalchemy is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, declarative models in sqlalchemy decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, declarative models in sqlalchemy is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True)
```

#### Key Points

- Mapped annotations improve editor support.
- Migrations via Alembic track schema drift.

---


### 25.6.3 Relationships: One-to-Many and Many-to-Many

**Beginner Level**: Relationships: one-to-many and many-to-many is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, relationships: one-to-many and many-to-many decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, relationships: one-to-many and many-to-many is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# User has many Orders — use relationship() + back_populates
REL_NOTE = "foreign_keys, cascade delete rules, and lazy loading strategy must be explicit"
```

#### Key Points

- Prefer `selectinload`/`joinedload` to kill N+1 queries.
- Many-to-many needs association tables.

---


### 25.6.4 Query Optimization and Eager Loading

**Beginner Level**: Query optimization and eager loading is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, query optimization and eager loading decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, query optimization and eager loading is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# SQLAlchemy: session.query(Order).options(joinedload(Order.lines)).all()
# Django: Order.objects.select_related("user").prefetch_related("lines")
```

#### Key Points

- Log slow queries in staging.
- Index columns appearing in WHERE/JOIN/ORDER BY.

---


### 25.6.5 Django ORM QuerySet Patterns

**Beginner Level**: Django orm queryset patterns is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, django orm queryset patterns decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, django orm queryset patterns is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
qs = Product.objects.filter(price__gte=10).order_by("-created_at")[:50]
print(qs.query)  # debug SQL during development
```

#### Key Points

- QuerySets are lazy until evaluated.
- Use `only`/`defer` carefully—hidden queries can explode.

---


### 25.6.6 `select_related` and `prefetch_related`

**Beginner Level**: `select_related` and `prefetch_related` is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, `select_related` and `prefetch_related` decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, `select_related` and `prefetch_related` is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# select_related -> SQL JOIN for forward ForeignKey
# prefetch_related -> separate queries for reverse FK / M2M
PATTERN = "Use the Django debug toolbar in dev to spot N+1"
```

#### Key Points

- Measure query counts per view.
- Prefetch with custom QuerySets for filtering related rows.

---


### 25.6.7 Migrations: Alembic and Django

**Beginner Level**: Migrations: alembic and django is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, migrations: alembic and django decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, migrations: alembic and django is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# alembic revision --autogenerate
# python manage.py makemigrations
```

#### Key Points

- Autogenerate still needs human review.
- Zero-downtime deploys require additive migrations first.

---


### 25.6.8 Indexing, Constraints, and Data Integrity

**Beginner Level**: Indexing, constraints, and data integrity is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, indexing, constraints, and data integrity decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, indexing, constraints, and data integrity is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# Django: models.Index(fields=["created_at"])
# SQLAlchemy: Index("ix_created", Model.created_at)
```

#### Key Points

- Unique constraints enforce idempotency keys.
- Check constraints for valid enums at DB layer.

---


### 25.6.9 Seed Data and Test Fixtures

**Beginner Level**: Seed data and test fixtures is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, seed data and test fixtures decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, seed data and test fixtures is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# manage.py loaddata fixtures.json
# pytest fixtures + factory_boy for integration tests
SEED = [{"sku": "DEMO", "price": "9.99"}]
```

#### Key Points

- Anonymize production dumps used in staging.
- Keep seeds idempotent.

---

## 25.7 Web Security

<a id="257-web-security"></a>


### 25.7.1 Cross-Site Request Forgery (CSRF)

**Beginner Level**: Cross-site request forgery (csrf) is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, cross-site request forgery (csrf) decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, cross-site request forgery (csrf) is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# Django: {% csrf_token %} + CsrfViewMiddleware
# Flask-WTF: CSRFProtect(app)
CSRF_NOTE = "double-submit cookie or synchronizer token patterns for SPAs"
```

#### Key Points

- Cookie sessions need CSRF protection for state-changing requests.
- JWT in Authorization header reduces classic CSRF surface but shifts threats.

---


### 25.7.2 Cross-Site Scripting (XSS)

**Beginner Level**: Cross-site scripting (xss) is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, cross-site scripting (xss) decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, cross-site scripting (xss) is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from markupsafe import escape
user_input = "<script>alert(1)</script>"
safe = escape(user_input)
```

#### Key Points

- Autoescape templates; sanitize HTML if you must allow rich text.
- Content-Security-Policy headers reduce blast radius.

---


### 25.7.3 SQL Injection Prevention

**Beginner Level**: Sql injection prevention is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, sql injection prevention decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, sql injection prevention is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# Always parameterized queries
# ORM: User.objects.filter(email=user_input)
# raw: cursor.execute("SELECT * FROM users WHERE email=%s", [email])
```

#### Key Points

- Never interpolate user strings into SQL.
- Audit any `raw`/`extra` ORM usage.

---


### 25.7.4 Password Hashing and Credential Storage

**Beginner Level**: Password hashing and credential storage is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, password hashing and credential storage decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, password hashing and credential storage is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
from werkzeug.security import generate_password_hash, check_password_hash

h = generate_password_hash("secret")
assert check_password_hash(h, "secret")
```

#### Key Points

- Use bcrypt/argon2 via libraries—never roll your own.
- Enforce MFA for admin interfaces.

---


### 25.7.5 Authentication vs Authorization

**Beginner Level**: Authentication vs authorization is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, authentication vs authorization decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, authentication vs authorization is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# AuthN: who you are (login)
# AuthZ: what you can do (roles/permissions)
POLICY = {"role_admin": ["*"], "role_analyst": ["read:reports"]}
```

#### Key Points

- Centralize authorization checks—decorators or dependencies.
- Test deny paths, not just allow paths.

---


### 25.7.6 HTTPS, HSTS, and Secure Cookies

**Beginner Level**: Https, hsts, and secure cookies is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, https, hsts, and secure cookies decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, https, hsts, and secure cookies is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
SEC_HEADERS = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
}
```

#### Key Points

- HSTS prevents SSL stripping.
- Set `Secure` on cookies in prod.

---


### 25.7.7 Secrets Management and Configuration Leaks

**Beginner Level**: Secrets management and configuration leaks is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, secrets management and configuration leaks decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, secrets management and configuration leaks is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import os
API_KEY = os.environ["STRIPE_SECRET_KEY"]  # fail fast if missing
```

#### Key Points

- Rotate keys on employee offboarding.
- Scan git history for leaked tokens (trufflehog).

---


### 25.7.8 Rate Limiting and Abuse Protection

**Beginner Level**: Rate limiting and abuse protection is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, rate limiting and abuse protection decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, rate limiting and abuse protection is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# Flask-Limiter, nginx limit_req, or API gateway quotas
RULE = "100 requests / minute / IP for public /search"
```

#### Key Points

- Protect auth endpoints from credential stuffing.
- CAPTCHA only after risk signals.

---

## 25.8 Deployment and Operations

<a id="258-deployment-and-operations"></a>


### 25.8.1 WSGI and ASGI Servers

**Beginner Level**: Wsgi and asgi servers is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, wsgi and asgi servers decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, wsgi and asgi servers is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# gunicorn myapp:app
# uvicorn myapp.asgi:app  # for async frameworks
WORKERS = "CPU-bound: (2*CPU)+1; I/O-bound tune with load tests"
```

#### Key Points

- Dev servers are not production servers.
- ASGI enables websockets and long-lived connections.

---


### 25.8.2 Gunicorn Worker Model

**Beginner Level**: Gunicorn worker model is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, gunicorn worker model decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, gunicorn worker model is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# gunicorn -w 4 -k gevent app:app  # only if app is gevent-safe
NOTE = "sync workers + threads vs async workers — match stack to workload"
```

#### Key Points

- CPU-bound views need multiple processes.
- Watch worker memory—restart on leaks.

---


### 25.8.3 Nginx Reverse Proxy and TLS Termination

**Beginner Level**: Nginx reverse proxy and tls termination is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, nginx reverse proxy and tls termination decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, nginx reverse proxy and tls termination is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# proxy_pass http://127.0.0.1:8000;
# proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
NGINX = "static files, gzip, rate limits, TLS certs via certbot"
```

#### Key Points

- Nginx buffers slow clients from app workers.
- Configure real IP headers carefully.

---


### 25.8.4 Docker Images for Python Web Apps

**Beginner Level**: Docker images for python web apps is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, docker images for python web apps decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, docker images for python web apps is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# multi-stage build: builder venv -> slim runtime image
DOCKERFILE_HINT = "non-root user, dumb-init, healthcheck CMD"
```

#### Key Points

- Pin base image digests for supply chain safety.
- Minimize layers and secrets in layers.

---


### 25.8.5 Environment Variables and Twelve-Factor Config

**Beginner Level**: Environment variables and twelve-factor config is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, environment variables and twelve-factor config decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, environment variables and twelve-factor config is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import os
DATABASE_URL = os.environ["DATABASE_URL"]
REDIS_URL = os.environ.get("REDIS_URL")
```

#### Key Points

- Config changes without rebuilds.
- Use `.env` locally only—never commit secrets.

---


### 25.8.6 Logging, Metrics, and Tracing in Production

**Beginner Level**: Logging, metrics, and tracing in production is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, logging, metrics, and tracing in production decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, logging, metrics, and tracing in production is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
import logging, json
log = logging.getLogger("api")
log.info(json.dumps({"event": "request", "path": "/items", "ms": 12}))
```

#### Key Points

- Structured logs feed ELK/Loki.
- RED metrics: rate, errors, duration.

---


### 25.8.7 Health, Readiness, and Liveness Probes

**Beginner Level**: Health, readiness, and liveness probes is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, health, readiness, and liveness probes decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, health, readiness, and liveness probes is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
@app.get("/health/live")
def live():
    return {"ok": True}

@app.get("/health/ready")
def ready():
    # check DB ping, cache ping
    return {"db": True, "cache": True}
```

#### Key Points

- Kubernetes uses probes to route traffic safely.
- Readiness should fail when dependencies are down.

---


### 25.8.8 Graceful Shutdown and Zero-Downtime Reloads

**Beginner Level**: Graceful shutdown and zero-downtime reloads is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, graceful shutdown and zero-downtime reloads decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, graceful shutdown and zero-downtime reloads is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
# gunicorn handles SIGTERM to drain requests
SHUTDOWN = "Stop accepting new work, finish in-flight, close DB pools"
```

#### Key Points

- Long requests need timeouts at proxy.
- Coordinate deploys with connection draining.

---


### 25.8.9 Performance Tuning Checklist

**Beginner Level**: Performance tuning checklist is something you rely on whenever you use a browser or call an API from Python—think of it as the rulebook that keeps clients and servers speaking the same language.

**Intermediate Level**: In Flask or Django services, performance tuning checklist decisions affect caching, security headers, and how mobile apps consume JSON—so you validate inputs and return consistent status codes.

**Expert Level**: At scale, performance tuning checklist is woven into ingress controllers, service meshes, and blue/green deploys; you version contracts, observe p99 latency, and harden against abuse without breaking existing integrators.

```python
CHECKLIST = [
    "Enable gzip/brotli at edge",
    "HTTP caching for public GETs",
    "DB indexes + query review",
    "Connection pooling",
    "CDN for static assets",
    "Async where I/O bound",
]
```

#### Key Points

- Measure before tuning—profile real traffic mixes.
- Watch p99, not just averages.

---


---

## Topic Key Points

- HTTP semantics (methods, status, headers) underpin every Python web framework.
- Flask emphasizes flexibility; Django ships admin, ORM, and auth patterns—choose by team and product shape.
- REST APIs need consistent serialization, pagination, versioning, and error models.
- ORM performance is about indexes, eager loading, and migration discipline.
- Security is layered: CSRF, XSS, SQLi controls, TLS, secrets hygiene, and abuse protections.
- Production means WSGI/ASGI servers, reverse proxies, containers, observability, and safe deploys.

## Best Practices

- Validate all untrusted input at boundaries; return typed errors with stable codes.
- Use application factories / settings modules per environment.
- Keep templates autoescaped; sanitize rich text carefully.
- Parameterize SQL; avoid raw string interpolation.
- Log with request correlation IDs; never log secrets or full PANs.
- Automate tests for authz denial paths and critical business rules.
- Run dependency scanners and pin base images.

## Common Mistakes to Avoid

- Running Flask/Django dev servers in production.
- Disabling CSRF globally to “fix” SPA issues.
- Trusting client-sent role flags without server-side checks.
- N+1 queries in dashboards that page large datasets.
- Storing secrets in git or Docker layers.
- Returning 500 with stack traces to public API clients.
- Ignoring database migration ordering during concurrent deploys.
- Using floats for currency in JSON APIs.

---

*End of Topic 25 — Web Development.*
