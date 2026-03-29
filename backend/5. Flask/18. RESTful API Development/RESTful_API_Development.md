# Flask 3.1.3 — RESTful API Development

Representational State Transfer (REST) maps domain resources to URLs and HTTP verbs. With Flask 3.1.3 (Python 3.9+), you can build JSON APIs using plain routes or the **Flask-RESTful** extension. This guide covers **REST principles**, **Resource classes**, **request parsing**, **marshalling**, full **CRUD** patterns, **authentication**, and **documentation** (Swagger/OpenAPI/ReDoc/versioning) for e-commerce catalogs, social graphs, and SaaS platforms.

---

## 📑 Table of Contents

1. [18.1 REST Principles](#181-rest-principles)
2. [18.2 Flask-RESTful Extension](#182-flask-restful-extension)
3. [18.3 Request Parsing](#183-request-parsing)
4. [18.4 Response Formatting](#184-response-formatting)
5. [18.5 CRUD Operations API](#185-crud-operations-api)
6. [18.6 Authentication in APIs](#186-authentication-in-apis)
7. [18.7 API Documentation](#187-api-documentation)
8. [Best Practices](#best-practices-summary)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Comparison Tables](#comparison-tables)

---

## 18.1 REST Principles

REST emphasizes **resources**, **stateless** servers, **uniform interface**, and **cache-friendly** responses.

### 18.1.1 REST Architecture

Resources are **nouns** (`/users`, `/orders/{id}`); actions use **HTTP methods** and **hypermedia** links where applicable (HATEOAS optional).

#### 🟢 Beginner Example

```text
GET    /products       -> list products
GET    /products/42    -> one product
POST   /products       -> create
```

#### 🟡 Intermediate Example

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/products")
def list_products():
    return jsonify(items=[{"id": 1, "name": "Mug"}])
```

#### 🔴 Expert Example

```python
# Version in path or header; hypermedia _links
def hal_product(p):
    return {
        "id": p.id,
        "name": p.name,
        "_links": {"self": {"href": f"/api/v1/products/{p.id}"}},
    }
```

#### 🌍 Real-Time Example (E-Commerce)

```text
GET /v1/categories/electronics/products?brand=acme&page=2
```

### 18.1.2 HTTP Methods Mapping

**GET** safe/idempotent read; **POST** create; **PUT** replace; **PATCH** partial; **DELETE** remove.

#### 🟢 Beginner Example

```python
@app.post("/users")
def create_user():
    return {"id": 1}, 201
```

#### 🟡 Intermediate Example

```python
@app.put("/users/1")
def replace_user():
    return {}, 204
```

#### 🔴 Expert Example

```python
# Idempotency-Key header on POST for payments
```

#### 🌍 Real-Time Example (SaaS Projects)

```text
PATCH /v1/projects/{id}  {"name":"New title"}
```

### 18.1.3 Status Codes

**201 Created** + `Location`; **204 No Content**; **409 Conflict**; **422 Unprocessable Entity**.

#### 🟢 Beginner Example

```python
return jsonify(ok=True), 200
```

#### 🟡 Intermediate Example

```python
return jsonify(id=new_id), 201, {"Location": f"/items/{new_id}"}
```

#### 🔴 Expert Example

```python
return jsonify(problem={...}), 429, {"Retry-After": "60"}
```

#### 🌍 Real-Time Example (Social Follow)

```python
return "", 204  # unfollow success
```

### 18.1.4 Resource Representation

JSON is dominant; support **content negotiation** with `Accept`.

#### 🟢 Beginner Example

```python
return jsonify(user={"id": 1, "handle": "alex"})
```

#### 🟡 Intermediate Example

```python
from flask import request

if "application/xml" in request.accept_mimetypes:
    return xml.dumps(user), 200, {"Content-Type": "application/xml"}
```

#### 🔴 Expert Example

```python
# JSON:API format with included relationships
```

#### 🌍 Real-Time Example (E-Commerce Order)

```json
{
  "id": "ord_123",
  "lines": [{"sku": "T1", "qty": 2}],
  "totals": {"currency": "USD", "amount": 1999}
}
```

### 18.1.5 Statelessness

Server stores no **per-client session** in API tier; auth sent each request (**JWT**, **API key**).

#### 🟢 Beginner Example

```python
# No server session for mobile API
```

#### 🟡 Intermediate Example

```python
@app.before_request
def load_user_from_header():
    g.user = parse_bearer(request.headers.get("Authorization", ""))  # noqa: F821
```

#### 🔴 Expert Example

```python
# Sticky sessions avoided; rate limit by key + IP at edge
```

#### 🌍 Real-Time Example (SaaS Public API)

```python
# Each call includes Authorization; gateway validates JWT
```

---

## 18.2 Flask-RESTful Extension

**Flask-RESTful** adds `Api` and `Resource` classes with method mapping.

### 18.2.1 Installing Flask-RESTful

```bash
pip install flask-restful
```

#### 🟢 Beginner Example

```python
# requirements.txt
flask==3.1.3
flask-restful==0.3.10
```

#### 🟡 Intermediate Example

```python
from flask import Flask
from flask_restful import Api

app = Flask(__name__)
api = Api(app)
```

#### 🔴 Expert Example

```python
api_bp = Blueprint("api", __name__, url_prefix="/api/v1")
api = Api(api_bp)
app.register_blueprint(api_bp)
```

#### 🌍 Real-Time Example (E-Commerce Microservice)

```python
# Separate package `catalog_api` mounted at /catalog
```

### 18.2.2 Resource Classes

Subclass **`Resource`**; define **`get`**, **`post`**, etc.

#### 🟢 Beginner Example

```python
from flask_restful import Resource

class Hello(Resource):
    def get(self):
        return {"hello": "world"}

api.add_resource(Hello, "/hello")
```

#### 🟡 Intermediate Example

```python
class Product(Resource):
    def get(self, product_id: int):
        return {"id": product_id}

api.add_resource(Product, "/products/<int:product_id>")
```

#### 🔴 Expert Example

```python
class Product(Resource):
    method_decorators = [require_auth]

    def get(self, product_id: int):
        ...
```

#### 🌍 Real-Time Example (Social Profile)

```python
class Profile(Resource):
    def get(self, handle: str):
        return load_profile(handle)
```

### 18.2.3 Method Decorators

**`method_decorators`** list applies to all HTTP verbs on resource.

#### 🟢 Beginner Example

```python
method_decorators = [login_required]
```

#### 🟡 Intermediate Example

```python
method_decorators = {"get": [cache_control(max_age=60)], "post": [csrf.exempt]}
```

#### 🔴 Expert Example

```python
def audit(f):
    def wrapper(*args, **kwargs):
        audit_log()  # noqa: F821
        return f(*args, **kwargs)
    return wrapper

method_decorators = [audit]
```

#### 🌍 Real-Time Example (SaaS Admin API)

```python
method_decorators = [require_role("admin")]
```

### 18.2.4 API Registration

**`api.add_resource(cls, *urls)`** registers routes.

#### 🟢 Beginner Example

```python
api.add_resource(Users, "/users")
```

#### 🟡 Intermediate Example

```python
api.add_resource(UserItem, "/users/<int:id>", endpoint="user_item")
```

#### 🔴 Expert Example

```python
# Multiple paths same resource
api.add_resource(Product, "/products/<int:id>", "/p/<int:id>")
```

#### 🌍 Real-Time Example (E-Commerce)

```python
api.add_resource(Order, "/orders/<string:order_id>")
```

### 18.2.5 Route Definition

Flask-RESTful builds **`Rule`** objects; works with **blueprints**.

#### 🟢 Beginner Example

```python
api.add_resource(Health, "/health")
```

#### 🟡 Intermediate Example

```python
class Health(Resource):
    def get(self):
        return {"status": "ok"}, 200
```

#### 🔴 Expert Example

```python
# Combine with url_value_preprocessor for tenant slug
```

#### 🌍 Real-Time Example (Multi-Tenant SaaS)

```python
api.add_resource(TenantUser, "/t/<string:tenant>/users/<int:id>")
```

---

## 18.3 Request Parsing

**`reqparse.RequestParser`** defines arguments, types, and validation (Flask-RESTful).

### 18.3.1 RequestParser

```python
from flask_restful import reqparse

parser = reqparse.RequestParser()
parser.add_argument("name", type=str, required=True, location="json")
```

#### 🟢 Beginner Example

```python
args = parser.parse_args()
return {"name": args["name"]}
```

#### 🟡 Intermediate Example

```python
parser.add_argument("page", type=int, default=1, location="args")
```

#### 🔴 Expert Example

```python
parser_copy = parser.copy()
parser_copy.replace_argument("name", type=str, required=False)
```

#### 🌍 Real-Time Example (E-Commerce Search)

```python
parser.add_argument("q", type=str, required=True, location="args")
parser.add_argument("filters", type=str, action="append", location="args")
```

### 18.3.2 Argument Definition

**`location`**: `json`, `args`, `headers`, `values`, `files`.

#### 🟢 Beginner Example

```python
parser.add_argument("price", type=float, location="json")
```

#### 🟡 Intermediate Example

```python
parser.add_argument("Authorization", location="headers")
```

#### 🔴 Expert Example

```python
parser.add_argument("file", type=FileStorage, location="files")
```

#### 🌍 Real-Time Example (SaaS Webhook)

```python
parser.add_argument("X-Signature", dest="signature", location="headers", required=True)
```

### 18.3.3 Type Conversion

Use **`int`**, **`bool`**, custom callables.

#### 🟢 Beginner Example

```python
parser.add_argument("limit", type=int, default=20)
```

#### 🟡 Intermediate Example

```python
def bounded_int(v):
    v = int(v)
    if v < 1 or v > 100:
        raise ValueError("out of range")
    return v

parser.add_argument("limit", type=bounded_int)
```

#### 🔴 Expert Example

```python
from uuid import UUID

parser.add_argument("correlation_id", type=UUID)
```

#### 🌍 Real-Time Example (Social Cursor Pagination)

```python
parser.add_argument("after", type=str)  # opaque cursor
```

### 18.3.4 Validation Rules

**`choices`**, **`help`**, **`required`**.

#### 🟢 Beginner Example

```python
parser.add_argument("role", choices=("user", "admin"), required=True)
```

#### 🟡 Intermediate Example

```python
parser.add_argument("email", type=email_type, required=True)
```

#### 🔴 Expert Example

```python
# Cross-field validation after parse_args in resource method
```

#### 🌍 Real-Time Example (E-Commerce Checkout)

```python
parser.add_argument("country", choices=SHIPPING_COUNTRIES)
```

### 18.3.5 Error Messages

Parser returns **400** with **`message`** payload by default.

#### 🟢 Beginner Example

```python
# Automatic error JSON from parse_args()
```

#### 🟡 Intermediate Example

```python
parser.add_argument("age", type=int, help="Age must be integer")
```

#### 🔴 Expert Example

```python
bundle_errors=True  # collect all field errors
```

#### 🌍 Real-Time Example (SaaS Partner API)

```python
return {"errors": errors}, 422  # map parser errors to RFC7807
```

---

## 18.4 Response Formatting

**`marshal`** and **`fields`** shape outgoing JSON.

### 18.4.1 Response Marshalling

```python
from flask_restful import fields, marshal

user_fields = {"id": fields.Integer, "email": fields.String}

return marshal(user_obj, user_fields)
```

#### 🟢 Beginner Example

```python
return marshal({"id": 1, "email": "a@b.com"}, user_fields)
```

#### 🟡 Intermediate Example

```python
return {"user": marshal(u, user_fields)}, 200
```

#### 🔴 Expert Example

```python
# Envelope versioning
return {"v": 1, "data": marshal(u, user_fields)}
```

#### 🌍 Real-Time Example (E-Commerce Product Card)

```python
product_fields = {
    "id": fields.String,
    "title": fields.String,
    "price_cents": fields.Integer,
}
```

### 18.4.2 Fields Definition

**`Nested`**, **`List`**, **`Url`**, **`DateTime`**.

#### 🟢 Beginner Example

```python
fields.Nested({"line_total": fields.Integer})
```

#### 🟡 Intermediate Example

```python
fields.List(fields.Nested(tag_fields))
```

#### 🔴 Expert Example

```python
fields.Raw  # passthrough dict when schema dynamic
```

#### 🌍 Real-Time Example (Social Activity Feed)

```python
activity_fields = {
    "type": fields.String,
    "actor": fields.Nested(actor_fields),
    "created_at": fields.DateTime(dt_format="iso8601"),
}
```

### 18.4.3 Nested Resources

Embed **order lines** inside **order** representation.

#### 🟢 Beginner Example

```python
order_fields = {
    "id": fields.Integer,
    "lines": fields.List(fields.Nested(line_fields)),
}
```

#### 🟡 Intermediate Example

```python
# Lazy load lines only when ?expand=lines
```

#### 🔴 Expert Example

```python
# GraphQL alternative for arbitrary nesting
```

#### 🌍 Real-Time Example (SaaS Invoice)

```python
marshal(invoice, {**invoice_fields, "items": fields.Nested(item_fields)})
```

### 18.4.4 List Responses

**`marshal_with`** decorator on resource methods.

#### 🟢 Beginner Example

```python
from flask_restful import marshal_with

class Users(Resource):
    @marshal_with(user_fields)
    def get(self):
        return User.query.all()
```

#### 🟡 Intermediate Example

```python
@marshal_with(user_fields, envelope="users")
def get(self):
    return users
```

#### 🔴 Expert Example

```python
# Pagination envelope
return {"items": marshal(page.items, fields), "next_cursor": page.next}
```

#### 🌍 Real-Time Example (E-Commerce PLP)

```python
{"items": [...], "page": 2, "total_pages": 40}
```

### 18.4.5 Pagination

**Offset/limit** vs **cursor**; include **total** optionally.

#### 🟢 Beginner Example

```python
page = request.args.get("page", 1, type=int)
per = min(request.args.get("per", 20, type=int), 100)
```

#### 🟡 Intermediate Example

```python
q = Model.query.offset((page - 1) * per).limit(per)
```

#### 🔴 Expert Example

```python
# Keyset pagination on (created_at, id)
```

#### 🌍 Real-Time Example (Social Infinite Scroll)

```python
return {"items": items, "next": encode_cursor(last)}
```

---

## 18.5 CRUD Operations API

### 18.5.1 List Resources GET

Collection endpoint with filters.

#### 🟢 Beginner Example

```python
@app.get("/posts")
def posts():
    return jsonify([{"id": 1}])
```

#### 🟡 Intermediate Example

```python
class Posts(Resource):
    def get(self):
        return Post.query.limit(50).all()
```

#### 🔴 Expert Example

```python
# ETag / If-None-Match for cache
```

#### 🌍 Real-Time Example (E-Commerce)

```python
GET /v1/products?category=shoes&sort=price_asc
```

### 18.5.2 Get Single Resource GET

**404** if missing.

#### 🟢 Beginner Example

```python
@app.get("/posts/<int:pid>")
def one(pid):
    p = Post.get(pid)
    if not p:
        abort(404)
    return jsonify(p.to_dict())
```

#### 🟡 Intermediate Example

```python
class PostRes(Resource):
    def get(self, pid: int):
        p = Post.get_or_404(pid)
        return p
```

#### 🔴 Expert Example

```python
# Field masks ?fields=id,title
```

#### 🌍 Real-Time Example (Social)

```python
GET /v1/users/by-handle/{handle}
```

### 18.5.3 Create Resource POST

**201** + **`Location`**.

#### 🟢 Beginner Example

```python
@app.post("/posts")
def create():
    p = Post.create(request.json)
    return jsonify(id=p.id), 201, {"Location": f"/posts/{p.id}"}
```

#### 🟡 Intermediate Example

```python
class Posts(Resource):
    def post(self):
        args = parser.parse_args()
        p = Post(**args)
        return p, 201
```

#### 🔴 Expert Example

```python
# Idempotent POST with Idempotency-Key
```

#### 🌍 Real-Time Example (SaaS Ticket)

```python
POST /v1/support/tickets
```

### 18.5.4 Update Resource PUT/PATCH

**PUT** full replace; **PATCH** partial.

#### 🟢 Beginner Example

```python
@app.put("/posts/<int:pid>")
def put_post(pid):
    replace_post(pid, request.json)
    return "", 204
```

#### 🟡 Intermediate Example

```python
@app.patch("/posts/<int:pid>")
def patch_post(pid):
    partial_update(pid, request.json)
    return jsonify(ok=True)
```

#### 🔴 Expert Example

```python
# JSON Merge Patch vs JSON Patch (RFC 6902)
```

#### 🌍 Real-Time Example (E-Commerce Cart Line)

```python
PATCH /v1/carts/{id}/lines/{line_id}  {"qty": 3}
```

### 18.5.5 Delete Resource DELETE

**204** or **202** if async.

#### 🟢 Beginner Example

```python
@app.delete("/posts/<int:pid>")
def del_post(pid):
    delete(pid)
    return "", 204
```

#### 🟡 Intermediate Example

```python
class PostRes(Resource):
    def delete(self, pid: int):
        soft_delete(pid)
        return "", 204
```

#### 🔴 Expert Example

```python
return {"job_id": "del_123"}, 202
```

#### 🌍 Real-Time Example (SaaS GDPR)

```python
DELETE /v1/me  -> schedules erasure job
```

---

## 18.6 Authentication in APIs

### 18.6.1 Token-Based Auth

Opaque **session tokens** or **random API tokens** in DB.

#### 🟢 Beginner Example

```python
@app.before_request
def auth():
    t = request.headers.get("X-Api-Token")
    if not valid_token(t):
        abort(401)
```

#### 🟡 Intermediate Example

```python
# Hash stored tokens (bcrypt/argon2 of raw token)
```

#### 🔴 Expert Example

```python
# Token rotation + families on reuse detection
```

#### 🌍 Real-Time Example (E-Commerce Mobile)

```python
Authorization: Bearer <opaque>
```

### 18.6.2 JWT Integration

**Flask-JWT-Extended** or **PyJWT** manual.

#### 🟢 Beginner Example

```python
import jwt

payload = jwt.decode(token, SECRET, algorithms=["HS256"])
```

#### 🟡 Intermediate Example

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.get("/me")
@jwt_required()
def me():
    return {"user": get_jwt_identity()}
```

#### 🔴 Expert Example

```python
# RS256 with JWKS rotation; short AT + RT
```

#### 🌍 Real-Time Example (SaaS)

```python
claims: sub, tenant_id, roles, aud, iss, exp
```

### 18.6.3 API Key Auth

**Header** `X-API-Key` or **query** (avoid query in logs).

#### 🟢 Beginner Example

```python
if request.headers.get("X-API-Key") != MASTER_KEY:
    abort(401)
```

#### 🟡 Intermediate Example

```python
key = request.headers.get("X-API-Key")
tenant = lookup_key(key)
```

#### 🔴 Expert Example

```python
# Per-key scopes and rate limits in Redis
```

#### 🌍 Real-Time Example (Partner E-Commerce Feed)

```python
# Key tied to merchant_id, scoped read:catalog
```

### 18.6.4 Bearer Tokens

**`Authorization: Bearer <token>`** per RFC 6750.

#### 🟢 Beginner Example

```python
h = request.headers.get("Authorization", "")
if not h.startswith("Bearer "):
    abort(401)
token = h.split(" ", 1)[1]
```

#### 🟡 Intermediate Example

```python
from werkzeug.datastructures import Authorization

auth = request.authorization  # may be None
```

#### 🔴 Expert Example

```python
# OAuth2 resource server introspection
```

#### 🌍 Real-Time Example (Social Third-Party Apps)

```python
# PKCE + Bearer access token
```

### 18.6.5 Custom Auth

**mTLS**, **HMAC signatures**, **Signed URLs**.

#### 🟢 Beginner Example

```python
def sign(payload: bytes, secret: bytes) -> str:
    return hmac.new(secret, payload, hashlib.sha256).hexdigest()
```

#### 🟡 Intermediate Example

```python
# Stripe-like webhook signature header
```

#### 🔴 Expert Example

```python
# AWS SigV4 for internal service mesh
```

#### 🌍 Real-Time Example (SaaS Webhooks)

```python
verify_signature(raw_body, request.headers["X-Signature"])
```

---

## 18.7 API Documentation

### 18.7.1 API Documentation

Human-readable **reference** + **examples**.

#### 🟢 Beginner Example

```markdown
## GET /health
Returns 200 {"status":"ok"}
```

#### 🟡 Intermediate Example

```python
# Markdown in /docs route
```

#### 🔴 Expert Example

```python
# Auto-generated from decorators + type hints
```

#### 🌍 Real-Time Example (E-Commerce Partner Portal)

```python
PDF + interactive console
```

### 18.7.2 Swagger Integration

**flask-swagger-ui** or **apispec** + UI.

#### 🟢 Beginner Example

```python
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = "/api/docs"
API_URL = "/static/openapi.json"

app.register_blueprint(get_swaggerui_blueprint(SWAGGER_URL, API_URL))
```

#### 🟡 Intermediate Example

```python
@app.get("/static/openapi.json")
def spec():
    return send_file("openapi.json")
```

#### 🔴 Expert Example

```python
# apispec.from_dict route introspection
```

#### 🌍 Real-Time Example (SaaS)

```python
# Try-it-out against sandbox base URL
```

### 18.7.3 OpenAPI Schema

**OpenAPI 3.1** YAML/JSON.

#### 🟢 Beginner Example

```yaml
openapi: 3.1.0
info:
  title: Shop API
  version: "1.0.0"
paths:
  /products:
    get:
      responses:
        "200":
          description: OK
```

#### 🟡 Intermediate Example

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

#### 🔴 Expert Example

```yaml
webhooks:
  orderShipped:
    post:
      requestBody: ...
```

#### 🌍 Real-Time Example (E-Commerce)

```yaml
paths:
  /v1/orders/{orderId}:
    parameters:
      - name: orderId
        in: path
        required: true
        schema:
          type: string
```

### 18.7.4 ReDoc Integration

Static **ReDoc** bundle pointing at **`openapi.json`**.

#### 🟢 Beginner Example

```html
<redoc spec-url="/static/openapi.json"></redoc>
```

#### 🟡 Intermediate Example

```python
@app.get("/redoc")
def redoc():
    return render_template("redoc.html")
```

#### 🔴 Expert Example

```python
# CDN redoc.standalone.js pinned by SRI
```

#### 🌍 Real-Time Example (Enterprise SaaS)

```python
# SSO-gated /developer/redoc
```

### 18.7.5 API Versioning

**URL prefix** `/v1` vs **header** `Accept: application/vnd.example.v2+json`.

#### 🟢 Beginner Example

```python
bp_v1 = Blueprint("api_v1", __name__, url_prefix="/v1")
```

#### 🟡 Intermediate Example

```python
@app.url_value_preprocessor
def pull_api_version(endpoint, values):
    g.api_version = values.pop("version", "v1")
```

#### 🔴 Expert Example

```python
# Sunset header + deprecation policy in OpenAPI
```

#### 🌍 Real-Time Example (Social Mobile)

```python
# v1 stable, v2 beta behind feature flag
```

---

## Best Practices (Summary)

- Use **nouns** for resources; **verbs** via HTTP methods.
- Return **consistent** error envelopes and **correct** status codes.
- Prefer **cursor pagination** for large, changing datasets.
- Authenticate at **edge** (API gateway) and **app** (claims validation).
- Document **every** public route with OpenAPI; keep **examples** fresh.
- Version **explicitly** and communicate **deprecations**.

---

## Common Mistakes to Avoid

| Mistake | Problem | Fix |
|---------|---------|-----|
| RPC-style URLs `/createUser` | Not RESTful | POST `/users` |
| 200 with error body | Breaks clients | 4xx/5xx + schema |
| Ignoring `Content-Type` | Parse bugs | Strict JSON parser |
| Giant responses | Timeouts | Pagination + field masks |
| Leaking stack traces | Security | Generic JSON errors |
| JWT in localStorage w XSS | Token theft | HttpOnly cookies or hardened SPA |

---

## Comparison Tables

| Style | Pros | Cons |
|-------|------|------|
| Plain Flask routes | Simple, flexible | More boilerplate |
| Flask-RESTful | Structure, marshal | Opinionated |
| FastAPI (note) | Auto OpenAPI | Different framework |

| Auth | Use when |
|------|----------|
| API key | Server-to-server |
| JWT | Mobile/SPA scale-out |
| mTLS | Internal mesh |
| OAuth2 | Third-party access |

| Versioning | Tradeoff |
|------------|----------|
| URL `/v1` | Visible, cacheable |
| Header | Clean URLs, harder logs |

---

*Flask 3.1.3 (February 2026), Python 3.9+. Flask-RESTful versions may vary; pin dependencies in production.*
