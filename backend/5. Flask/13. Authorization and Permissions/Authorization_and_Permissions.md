# Authorization and Permissions with Flask 3.1.3

**Authorization** answers “what may you do?” after authentication establishes identity. Flask does not prescribe a model—you implement **roles**, **permissions**, **decorators**, and **object-level checks** to protect routes and data. These notes align with **Flask 3.1.3** and **Python 3.9+**, with examples from **SaaS** admin consoles, **e‑commerce** order ownership, and **social** content moderation.

---

## 📑 Table of Contents

1. [13.1 Authorization Concepts](#131-authorization-concepts)
2. [13.2 Role and Permission Models](#132-role-and-permission-models)
3. [13.3 Permission Checking](#133-permission-checking)
4. [13.4 Custom Decorators](#134-custom-decorators)
5. [13.5 Object-Level Permissions](#135-object-level-permissions)
6. [13.6 Advanced Authorization](#136-advanced-authorization)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 13.1 Authorization Concepts

### 13.1.1 Access Control

Restrict actions to authenticated principals with appropriate rights.

**🟢 Beginner Example** — route open vs protected:

```python
from flask_login import login_required

@app.get("/public")
def public():
    return "ok"

@app.get("/private")
@login_required
def private():
    return "secret"
```

**🟡 Intermediate Example** — separate **authentication** check from **authorization** check.

**🔴 Expert Example** — centralized policy engine invoked per action.

**🌍 Real-Time Example** — SaaS: free tier cannot access export API.

---

### 13.1.2 RBAC (Role-Based Access Control)

Users receive **roles**; roles grant **permissions**.

**🟢 Beginner Example** — hardcoded role string on user:

```python
if current_user.role != "admin":
    abort(403)
```

**🟡 Intermediate Example** — `Role` and `Permission` tables (§13.2).

**🔴 Expert Example** — role hierarchy with inheritance (admin > editor > viewer).

**🌍 Real-Time Example** — e‑commerce: `staff` can refund, `customer` cannot.

---

### 13.1.3 Permission Models

**ACL**, **RBAC**, **ABAC** (attribute-based). Flask apps commonly start RBAC, evolve to ABAC for enterprise.

**🟢 Beginner Example** — boolean flags: `user.is_moderator`.

**🟡 Intermediate Example** — named permissions: `post.delete_any`.

**🔴 Expert Example** — policy documents evaluated with request context attributes.

**🌍 Real-Time Example** — social: moderators edit any post; users edit own.

---

### 13.1.4 User Roles

**🟢 Beginner Example**

```python
class User(db.Model):
    role = db.Column(db.String(20), nullable=False, default="member")
```

**🟡 Intermediate Example** — multiple roles via association table.

**🔴 Expert Example** — scoped roles per organization (`org_id`, `role`).

**🌍 Real-Time Example** — SaaS: `owner`, `admin`, `billing`, `member` per workspace.

---

### 13.1.5 Resource Permissions

Permissions tied to resource types (`invoice:read`, `invoice:write`).

**🟢 Beginner Example**

```python
PERMS = {"admin": {"*"}, "member": {"post:create", "post:read"}}
```

**🟡 Intermediate Example** — DB-stored permission strings attached to roles.

**🔴 Expert Example** — resource instance conditions (`invoice.org_id == user.org_id`).

**🌍 Real-Time Example** — e‑commerce vendor portal: manage only own SKUs.

---

## 13.2 Role and Permission Models

### 13.2.1 Role Definition

**🟢 Beginner Example**

```python
class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
```

**🟡 Intermediate Example** — seed roles in migration:

```python
def upgrade():
    op.bulk_insert(
        sa.table("role", sa.column("name", sa.String)),
        [{"name": "admin"}, {"name": "member"}],
    )
```

**🔴 Expert Example** — environment-specific role sets (staging has `superadmin`).

**🌍 Real-Time Example** — SaaS: customer-configurable custom roles (enterprise).

---

### 13.2.2 Permission Definition

**🟢 Beginner Example**

```python
class Permission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(80), unique=True, nullable=False)
```

**🟡 Intermediate Example** — group permissions by domain: `billing.*`.

**🔴 Expert Example** — versioned permissions for backward compatibility during deploy.

**🌍 Real-Time Example** — mobile app feature flags backed by same permission codes.

---

### 13.2.3 User-Role Association

**🟢 Beginner Example** — many-to-many:

```python
user_roles = db.Table(
    "user_roles",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
    db.Column("role_id", db.Integer, db.ForeignKey("role.id"), primary_key=True),
)
```

**🟡 Intermediate Example** — effective role computed from org membership table.

**🔴 Expert Example** — temporal roles (`valid_until`) for contractors.

**🌍 Real-Time Example** — e‑commerce seasonal support staff elevated role.

---

### 13.2.4 Role-Permission Association

**🟢 Beginner Example**

```python
role_permissions = db.Table(
    "role_permissions",
    db.Column("role_id", db.Integer, db.ForeignKey("role.id"), primary_key=True),
    db.Column("permission_id", db.Integer, db.ForeignKey("permission.id"), primary_key=True),
)
```

**🟡 Intermediate Example** — cache role→permissions in Redis with TTL on role change.

**🔴 Expert Example** — partial permissions per tenant plan.

**🌍 Real-Time Example** — SaaS plan `pro` adds `export.csv` permission.

---

### 13.2.5 Model Relationships

**🟢 Beginner Example**

```python
class User(db.Model):
    roles = db.relationship("Role", secondary=user_roles, back_populates="users")

class Role(db.Model):
    users = db.relationship("User", secondary=user_roles, back_populates="roles")
    permissions = db.relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(db.Model):
    roles = db.relationship("Role", secondary=role_permissions, back_populates="permissions")
```

**🟡 Intermediate Example** — `lazy="selectinload"` when checking permissions on each request (watch cost).

**🔴 Expert Example** — denormalized `user_effective_perms` materialized view for huge systems.

**🌍 Real-Time Example** — social: separate `CommunityRole` per group membership.

---

## 13.3 Permission Checking

### 13.3.1 Checking User Roles

**🟢 Beginner Example**

```python
def user_has_role(user, role_name: str) -> bool:
    return any(r.name == role_name for r in user.roles)
```

**🟡 Intermediate Example** — `@role_required("admin")` decorator (§13.4).

**🔴 Expert Example** — context-aware roles: same user `viewer` in org A, `admin` in org B.

**🌍 Real-Time Example** — SaaS URL `/orgs/<id>/settings` checks role **in that org**.

---

### 13.3.2 Checking Permissions

**🟢 Beginner Example**

```python
def user_has_perm(user, code: str) -> bool:
    for role in user.roles:
        for perm in role.permissions:
            if perm.code == code:
                return True
    return False
```

**🟡 Intermediate Example** — wildcard `*` permission for superadmin.

**🔴 Expert Example** — prefix match `billing.` permissions.

**🌍 Real-Time Example** — e‑commerce ERP integration permission `integrations.write`.

---

### 13.3.3 Custom Decorators

**🟢 Beginner Example**

```python
from functools import wraps
from flask import abort
from flask_login import current_user, login_required

def admin_required(f):
    @wraps(f)
    @login_required
    def wrapper(*args, **kwargs):
        if current_user.role != "admin":
            abort(403)
        return f(*args, **kwargs)
    return wrapper
```

**🟡 Intermediate Example** — pass permission code argument.

**🔴 Expert Example** — decorator reads `kwargs["org_id"]` from route.

**🌍 Real-Time Example** — SaaS blueprint `/org/<int:org_id>/...` stack: `login_required` + `org_member_required`.

---

### 13.3.4 View Protection

Apply decorators to view functions or class-based views.

**🟢 Beginner Example**

```python
@app.get("/admin")
@admin_required
def admin_home():
    return "admin"
```

**🟡 Intermediate Example** — Blueprint-level `before_request` for `/admin` prefix.

**🔴 Expert Example** — MethodView `decorators = [login_required, permission_required("x")]`.

**🌍 Real-Time Example** — social admin moderation queue.

---

### 13.3.5 Route Protection

Same as view protection; include **HTTP method** checks.

**🟢 Beginner Example**

```python
@app.route("/post/<int:id>", methods=["DELETE"])
@login_required
def delete_post(id):
    return "", 204
```

**🟡 Intermediate Example** — CSRF on DELETE if using cookie auth from browser (SPA patterns vary).

**🔴 Expert Example** — rate limit destructive routes per role.

**🌍 Real-Time Example** — e‑commerce cancel order: role + state machine guard.

---

## 13.4 Custom Decorators

### 13.4.1 @role_required

**🟢 Beginner Example**

```python
def role_required(role_name: str):
    def decorator(f):
        @wraps(f)
        @login_required
        def wrapper(*args, **kwargs):
            if not user_has_role(current_user, role_name):
                abort(403)
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.get("/staff")
@role_required("staff")
def staff():
    return "staff area"
```

**🟡 Intermediate Example** — accept multiple roles: `roles_required("admin", "staff")`.

**🔴 Expert Example** — load roles once per request into `g` to avoid N queries.

**🌍 Real-Time Example** — SaaS support impersonation with audited `support` role.

---

### 13.4.2 @permission_required

**🟢 Beginner Example**

```python
def permission_required(code: str):
    def decorator(f):
        @wraps(f)
        @login_required
        def wrapper(*args, **kwargs):
            if not user_has_perm(current_user, code):
                abort(403)
            return f(*args, **kwargs)
        return wrapper
    return decorator
```

**🟡 Intermediate Example** — optional message / JSON 403 for APIs.

**🔴 Expert Example** — compose with object loader decorator.

**🌍 Real-Time Example** — `users.invite` on team settings POST.

---

### 13.4.3 Decorator Stacking

Order matters: outer wraps inner.

**🟢 Beginner Example**

```python
@app.get("/org/<int:org_id>/billing")
@login_required
@org_member_required
@permission_required("billing.read")
def billing(org_id: int):
    return "ok"
```

**🟡 Intermediate Example** — `org_member_required` loads org into `g.org`.

**🔴 Expert Example** — avoid circular dependencies by keeping decorators thin.

**🌍 Real-Time Example** — e‑commerce merchant dashboard stacks auth + shop ownership.

---

### 13.4.4 Conditional Protection

**🟢 Beginner Example**

```python
if app.config["MAINTENANCE"] and not user_has_role(current_user, "admin"):
    abort(503)
```

**🟡 Intermediate Example** — feature flag `if flags.is_on("new_editor", user):`.

**🔴 Expert Example** — gradual rollout by user id hash percentage.

**🌍 Real-Time Example** — SaaS beta features for selected customers.

---

### 13.4.5 Error Handling

Return **403 Forbidden** vs **404 Not Found** for existence leakage.

**🟢 Beginner Example**

```python
from flask import abort

if not can_view(current_user, document):
    abort(404)
```

**🟡 Intermediate Example** — `abort(403)` when resource existence is already public (e.g., shared slug).

**🔴 Expert Example** — JSON API consistent envelope `{"error": "forbidden", "code": "..."}`.

**🌍 Real-Time Example** — social: private profile returns 404 to non-friends.

---

## 13.5 Object-Level Permissions

### 13.5.1 Resource Ownership

**🟢 Beginner Example**

```python
@app.get("/orders/<int:order_id>")
@login_required
def order_detail(order_id: int):
    order = Order.query.get_or_404(order_id)
    if order.user_id != current_user.id:
        abort(403)
    return render_template("order.html", order=order)
```

**🟡 Intermediate Example** — shared household accounts: multiple `user_id` via `AccountMember` table.

**🔴 Expert Example** — delegated access with expiry.

**🌍 Real-Time Example** — e‑commerce: gift order visible to purchaser and recipient roles.

---

### 13.5.2 User-Specific Access

**🟢 Beginner Example** — filter queries by `user_id`.

**🟡 Intermediate Example** — `tenant_id` filter for every query in SaaS.

**🔴 Expert Example** — row-level security in Postgres as safety net.

**🌍 Real-Time Example** — support tools: break-glass access with audit log.

---

### 13.5.3 Ownership Verification

Centralize in a function `can(user, action, obj)`.

**🟢 Beginner Example**

```python
def can_edit_post(user, post) -> bool:
    return post.author_id == user.id or user_has_role(user, "moderator")
```

**🟡 Intermediate Example** — policy function used in routes **and** templates.

**🔴 Expert Example** — capability tokens for time-limited edit links.

**🌍 Real-Time Example** — social: wiki-style coauthors.

---

### 13.5.4 Delegation

**🟢 Beginner Example** — assistant role can act on behalf of manager with audit trail.

**🟡 Intermediate Example** — OAuth-style scopes `orders:read` delegated to integration.

**🔴 Expert Example** — temporary elevation with MFA step-up.

**🌍 Real-Time Example** — SaaS: delegate billing contact without full admin.

---

### 13.5.5 Fine-Grained Control

Field-level: who may change `role` vs `display_name`.

**🟢 Beginner Example** — separate endpoints with different permission decorators.

**🟡 Intermediate Example** — serializer drops forbidden fields for role.

**🔴 Expert Example** — column-level ABAC policies (rare in monolith; more in enterprise IAM).

**🌍 Real-Time Example** — HR SaaS: salary field visible only to `hr.payroll`.

---

## 13.6 Advanced Authorization

### 13.6.1 ABAC (Attribute-Based Access Control)

Decisions from attributes: user department, resource sensitivity, time, IP.

**🟢 Beginner Example**

```python
def can_access_report(user, report) -> bool:
    return report.region in user.allowed_regions and user.department == "finance"
```

**🟡 Intermediate Example** — business hours restriction for sensitive exports.

**🔴 Expert Example** — policy language (Rego/OPA) evaluated per request.

**🌍 Real-Time Example** — healthcare SaaS: patient data access rules by facility + role + purpose.

---

### 13.6.2 Policy-Based Authorization

Central policies instead of scattered `if` statements.

**🟢 Beginner Example**

```python
POLICIES = {
    ("post", "delete"): lambda u, p: p.author_id == u.id or user_has_perm(u, "post.moderate"),
}
```

**🟡 Intermediate Example** — register policies in app factory.

**🔴 Expert Example** — external PDP (Policy Decision Point) over gRPC.

**🌍 Real-Time Example** — enterprise SSO buying OPA sidecar.

---

### 13.6.3 Context-Based Authorization

Use `request`, geo, device posture.

**🟢 Beginner Example**

```python
if request.headers.get("X-App-Context") == "mobile" and not user_has_perm(current_user, "mobile.beta"):
    abort(403)
```

**🟡 Intermediate Example** — IP allowlist for admin routes.

**🔴 Expert Example** — risk score from fraud service gates refunds.

**🌍 Real-Time Example** — e‑commerce: high-risk transactions need extra staff permission.

---

### 13.6.4 Dynamic Permissions

Permissions change at runtime (feature flags, plan changes).

**🟢 Beginner Example** — query `Subscription.plan` on each request (cache 60s).

**🟡 Intermediate Example** — event-driven cache invalidation on webhook `customer.subscription.updated`.

**🔴 Expert Example** — CRDT-like permission sync for edge workers (advanced).

**🌍 Real-Time Example** — SaaS downgrade removes `api.write` immediately.

---

### 13.6.5 Permission Caching

**🟢 Beginner Example**

```python
from functools import lru_cache

@lru_cache(maxsize=1)
def all_permissions():
    return {p.code for p in Permission.query.all()}
```

**🟡 Intermediate Example** — per-user permission set in Redis `SETEX userperms:{id} 300 "..."`.

**🔴 Expert Example** — stampede protection with single-flight lock.

**🌍 Real-Time Example** — social high traffic: cache moderator list with short TTL.

---

## Best Practices

1. **Deny by default**; explicitly allow capabilities.
2. **Check permissions on the server** for every mutating action (never UI-only).
3. **Keep checks close to domain operations**, not only at HTTP edge (service layer too).
4. **Use 404** when hiding resource existence is important.
5. **Audit** sensitive authorization decisions (admin actions, data export).
6. **Test** matrix of roles × routes automatically where possible.
7. **Avoid role string sprawl**—normalize in DB early.
8. **Separate org context** in multi-tenant apps (`org_id` in URL + membership check).
9. **Document** permission codes for API consumers.
10. **Review** decorator order and `login_required` coverage in security audits.

**🟢 Beginner Example** — `can_edit_post` unit tests table-driven.

**🟡 Intermediate Example** — pytest fixtures creating users with roles.

**🔴 Expert Example** — property-based tests for policy invariants.

**🌍 Real-Time Example** — e‑commerce chargeback tool: dual control (two staff approvals).

---

## Common Mistakes to Avoid

1. **Only hiding buttons** in templates without server enforcement.
2. **IDOR** (Insecure Direct Object Reference): trusting `order_id` without ownership check.
3. **Role checks** on wrong scope (global admin vs org admin).
4. **Stale cached permissions** after role change.
5. **Overly broad `admin` role** without segmentation.
6. **Mixing authentication errors (401)** with authorization (403) inconsistently in APIs.
7. **Leaking data** in error messages (“not your invoice” vs 404 strategy).
8. **Forgotten DELETE/PUT** protection on APIs.
9. **Trusting client-sent `role`** fields.
10. **N+1 permission queries** on every request without caching strategy.

**🟢 Beginner Example** — fix IDOR:

```python
order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
```

**🟡 Intermediate Example** — fix: always include `tenant_id` in filtered queries.

**🔴 Expert Example** — fix: centralized query scopes `Order.for_user(current_user)`.

**🌍 Real-Time Example** — SaaS: pen test finds missing `org_id` check on file download—add authorization in storage proxy.

---

## Comparison Tables

### 401 vs 403 vs 404

| Code | Meaning | Typical cause |
|------|---------|----------------|
| 401 | Unauthorized | Not logged in / bad token |
| 403 | Forbidden | Logged in but not allowed |
| 404 | Not Found | Hide existence or truly missing |

### RBAC vs ABAC

| Model | Strength | Complexity |
|-------|----------|------------|
| RBAC | Simple to reason | Coarse |
| ABAC | Expressive | Harder to audit |

### Where to enforce authorization

| Layer | Pros | Cons |
|-------|------|------|
| Route decorator | Clear | Duplication |
| Service function | Reusable | Must remember to call |
| DB RLS | Strong safety | Ops complexity |

### Caching permissions

| Strategy | Risk |
|----------|------|
| No cache | DB load |
| Short TTL | Slight delay after change |
| Event invalidation | Engineering cost |

---

## Supplement: End-to-end patterns

### SaaS organization route guard

**🟢 Beginner Example**

```python
def load_org(org_id: int) -> Organization:
    org = Organization.query.get_or_404(org_id)
    membership = Membership.query.filter_by(user_id=current_user.id, org_id=org.id).first()
    if not membership:
        abort(404)
    g.membership = membership
    g.org = org
    return org
```

**🟡 Intermediate Example** — decorator `@org_route` injecting `org`.

**🔴 Expert Example** — SQLAlchemy `with_loader_criteria` auto-filter children by org (advanced).

**🌍 Real-Time Example** — prevent cross-tenant export URLs.

---

### E‑commerce merchant authorization

**🟢 Beginner Example** — `product.merchant_id == current_user.merchant_id`.

**🟡 Intermediate Example** — staff users with `merchant_staff` mapping table.

**🔴 Expert Example** — marketplace: platform admin override with immutable audit.

**🌍 Real-Time Example** — dispute resolution tooling.

---

### Social moderation permissions

**🟢 Beginner Example** — `user_has_perm(current_user, "content.moderate")`.

**🟡 Intermediate Example** — community-scoped moderator role.

**🔴 Expert Example** — ML-assisted queue still requires human permission to action.

**🌍 Real-Time Example** — regional compliance takedown workflow.

---

### API JSON error consistency

**🟢 Beginner Example**

```python
@app.errorhandler(403)
def forbidden(e):
    return {"error": "forbidden"}, 403
```

**🟡 Intermediate Example** — include `request_id` header for support.

**🔴 Expert Example** — OAuth2-style error codes for mobile.

**🌍 Real-Time Example** — public developer portal documents codes.

---

### Testing authorization matrix (concept)

**🟢 Beginner Example** — parametrized tests `(role, path, expected_status)`.

**🟡 Intermediate Example** — factory_boy users with roles.

**🔴 Expert Example** — mutation testing to ensure checks not bypassed.

**🌍 Real-Time Example** — CI gate on security PRs.

---

### Performance: caching effective permissions

**🟢 Beginner Example** — `g._perms = None` lazy load once per request.

**🟡 Intermediate Example** — Redis cache key includes `role_version` bumped on change.

**🔴 Expert Example** — bloom filter pre-check before hitting DB (exotic).

**🌍 Real-Time Example** — viral traffic social app.

---

### Delegation audit log fields

**🟢 Beginner Example** — table `audit_log(actor_id, action, target_type, target_id, ts)`.

**🟡 Intermediate Example** — store before/after JSON for config changes.

**🔴 Expert Example** — WORM storage export for compliance.

**🌍 Real-Time Example** — finance SaaS SOC2 evidence.

---

### Policy engine stub (in-process)

**🟢 Beginner Example**

```python
class Policy:
    @staticmethod
    def allow(user, action, resource) -> bool:
        if action == "post.delete" and resource.author_id == user.id:
            return True
        return user_has_perm(user, "post.moderate")
```

**🟡 Intermediate Example** — register handlers per `(resource_type, action)`.

**🔴 Expert Example** — compile policies to decision trees.

**🌍 Real-Time Example** — ABAC pilot behind feature flag.

---

### Role relationship fix (reference model)

**🟢 Beginner Example** — corrected symmetric `back_populates`:

```python
class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    users = db.relationship("User", secondary=user_roles, back_populates="roles")
    permissions = db.relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(80), unique=True, nullable=False)
    roles = db.relationship("Role", secondary=role_permissions, back_populates="permissions")
```

**🟡 Intermediate Example** — eager load `selectinload(User.roles).selectinload(Role.permissions)` for admin user screen.

**🔴 Expert Example** — cap depth to avoid cartesian products.

**🌍 Real-Time Example** — enterprise IAM export page.

---

### Org-scoped permission code naming

**🟢 Beginner Example** — `org:123:billing:read` vs global `billing:read` (pick one convention).

**🟡 Intermediate Example** — store scope in membership row, not in permission string.

**🔴 Expert Example** — attribute-based: `(perm, org_id, team_id)`.

**🌍 Real-Time Example** — SaaS fine-grained sharing links.

---

### Flask `abort` import safety

**🟢 Beginner Example**

```python
from flask import abort, Blueprint
```

**🟡 Intermediate Example** — custom `Forbidden` exception subclass registered on app.

**🔴 Expert Example** — map exceptions to problem+json RFC 7807.

**🌍 Real-Time Example** — public API consistency across services.

---

### GraphQL-style resolver note (Flask context)

**🟢 Beginner Example** — each resolver calls `authorize(user, "post.read", post)`.

**🟡 Intermediate Example** — DataLoader batches objects; authorization still per object.

**🔴 Expert Example** — field-level directives evaluated in middleware.

**🌍 Real-Time Example** — social GraphQL API behind Flask gateway.

---

### Multi-tenant query scoping helper

**🟢 Beginner Example**

```python
def scoped_query(model, tenant_id):
    return model.query.filter_by(tenant_id=tenant_id)
```

**🟡 Intermediate Example** — `BaseQuery` subclass with `_tenant_id` set per request.

**🔴 Expert Example** — Postgres RLS `SET app.tenant_id = ...` per connection.

**🌍 Real-Time Example** — regulated SaaS isolates PHI by tenant.

---

### Rate limiting sensitive actions

**🟢 Beginner Example** — Flask-Limiter on `@permission_required("admin.users.delete")` routes.

**🟡 Intermediate Example** — per-user and per-IP combined limits.

**🔴 Expert Example** — adaptive limits from fraud scores.

**🌍 Real-Time Example** — e‑commerce refund endpoint.

---

### Time-bound elevation

**🟢 Beginner Example** — `sudo_mode_until` timestamp in session after step-up password.

**🟡 Intermediate Example** — short TTL 10 minutes for destructive admin actions.

**🔴 Expert Example** — signed elevation token with audience `admin-actions`.

**🌍 Real-Time Example** — SaaS billing portal changes payment method.

---

### Permission diff on role change (audit)

**🟢 Beginner Example** — log old role ids vs new role ids on `PUT /users/:id/roles`.

**🟡 Intermediate Example** — compute symmetric difference of permission codes.

**🔴 Expert Example** — stream audit events to SIEM.

**🌍 Real-Time Example** — enterprise compliance quarterly access review.

---

### Template helpers for authorization

**🟢 Beginner Example**

```python
@app.context_processor
def auth_helpers():
    return dict(can=user_has_perm)
```

```html
{% if can(current_user, 'post.create') %}
  <a href="/new">New post</a>
{% endif %}
```

**🟡 Intermediate Example** — ensure `can` mirrors server checks exactly.

**🔴 Expert Example** — template cache busting when permissions version changes.

**🌍 Real-Time Example** — SaaS nav menu rendered from effective permissions.

---

### Service layer enforcement

**🟢 Beginner Example**

```python
def delete_post(post_id: int, user: User) -> None:
    post = Post.query.get_or_404(post_id)
    if not can_edit_post(user, post):
        raise Forbidden()
    db.session.delete(post)
    db.session.commit()
```

**🟡 Intermediate Example** — views become thin; same service used by CLI tasks.

**🔴 Expert Example** — idempotent delete returns 204 whether or not already deleted (careful with leaks).

**🌍 Real-Time Example** — moderation tools + user self-delete share service.

---

*End of Authorization and Permissions notes — Flask 3.1.3, Python 3.9+.*
