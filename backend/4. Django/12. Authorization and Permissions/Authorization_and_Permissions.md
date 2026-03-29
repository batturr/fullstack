# Django Authorization and Permissions (Django 6.0.3)

**Authorization** answers *what this identity may do* after **authentication** establishes *who they are*. Django ships a **database-backed permission** system tied to models and groups, analogous to coarse **RBAC** in enterprise systems. For **object-level** rules (row ownership), you typically combine Django’s primitives with patterns or packages like **django-guardian**. This reference targets **Django 6.0.3** / **Python 3.12–3.14** with **e‑commerce**, **social**, and **SaaS** scenarios.

---

## 📑 Table of Contents

- [12.1 Permission Model](#121-permission-model)
  - [12.1.1 Permission Types](#1211-permission-types)
  - [12.1.2 App Permissions](#1212-app-permissions)
  - [12.1.3 Model Permissions](#1213-model-permissions)
  - [12.1.4 Custom Permissions](#1214-custom-permissions)
  - [12.1.5 Permission Inheritance](#1215-permission-inheritance)
- [12.2 Groups](#122-groups)
  - [12.2.1 Creating Groups](#1221-creating-groups)
  - [12.2.2 Group Permissions](#1222-group-permissions)
  - [12.2.3 User Groups](#1223-user-groups)
  - [12.2.4 Multiple Groups](#1224-multiple-groups)
  - [12.2.5 Group Management](#1225-group-management)
- [12.3 Permission Checking](#123-permission-checking)
  - [12.3.1 has_perm()](#1231-has_perm)
  - [12.3.2 has_perms()](#1232-has_perms)
  - [12.3.3 get_all_permissions()](#1233-get_all_permissions)
  - [12.3.4 has_module_perms()](#1234-has_module_perms)
  - [12.3.5 Permission Cache](#1235-permission-cache)
- [12.4 Authorization in Views](#124-authorization-in-views)
  - [12.4.1 Permission Required Decorators](#1241-permission-required-decorators)
  - [12.4.2 PermissionRequiredMixin](#1242-permissionrequiredmixin)
  - [12.4.3 UserPassesTestMixin](#1243-userpassestestmixin)
  - [12.4.4 Custom Permission Mixins](#1244-custom-permission-mixins)
  - [12.4.5 Object-Level Authorization](#1245-object-level-authorization)
- [12.5 Role-Based Access Control](#125-role-based-access-control)
  - [12.5.1 Role Definition](#1251-role-definition)
  - [12.5.2 Role Assignment](#1252-role-assignment)
  - [12.5.3 Role Hierarchy](#1253-role-hierarchy)
  - [12.5.4 Dynamic Roles](#1254-dynamic-roles)
  - [12.5.5 RBAC Implementation](#1255-rbac-implementation)
- [12.6 Object-Level Permissions](#126-object-level-permissions)
  - [12.6.1 django-guardian](#1261-django-guardian)
  - [12.6.2 Object Permissions Assignment](#1262-object-permissions-assignment)
  - [12.6.3 Permission Inheritance](#1263-permission-inheritance)
  - [12.6.4 Checking Object Permissions](#1264-checking-object-permissions)
  - [12.6.5 Listing User Objects](#1265-listing-user-objects)
- [Best Practices (Chapter Summary)](#best-practices-chapter-summary)
- [Common Mistakes (Chapter Summary)](#common-mistakes-chapter-summary)
- [Comparison Tables](#comparison-tables)

---

## 12.1 Permission Model

### 12.1.1 Permission Types

**Default**: add, change, delete, view per model. **Custom**: arbitrary codenames on models.

**🟢 Beginner Example**

```python
from django.contrib.auth.models import Permission
Permission.objects.filter(content_type__app_label="shop")
```

**🟡 Intermediate Example**

```python
user.has_perm("shop.delete_product")
```

**🔴 Expert Example**

Separate **feature flags** from **security permissions**—flags drive UX; perms enforce integrity.

**🌍 Real-Time Example**

SaaS: **`billing.issue_refund`** custom permission for finance team.

---

### 12.1.2 App Permissions

Permissions grouped by **`content_type.app_label`**.

**🟢 Beginner Example**

```python
user.has_module_perms("shop")
```

**🟡 Intermediate Example**

Admin index uses **`has_module_perms`** to show app sections.

**🔴 Expert Example**

Custom admin sites filter **`INSTALLED_APPS`** visibility.

**🌍 Real-Time Example**

Hide internal **`ops`** app from merchants.

---

### 12.1.3 Model Permissions

Auto-created **`auth_permission`** rows on **`migrate`**.

**🟢 Beginner Example**

```text
shop | product | Can add product
```

**🟡 Intermediate Example**

```python
from django.contrib.auth.models import Group
editors = Group.objects.get(name="editors")
editors.permissions.add(Permission.objects.get(codename="change_post"))
```

**🔴 Expert Example**

CI check ensures critical models always have **`view_`** permission for read-only roles.

**🌍 Real-Time Example**

E‑commerce: **`change_order`** restricted to support supervisors.

---

### 12.1.4 Custom Permissions

Declare in **`Meta.permissions`**.

**🟢 Beginner Example**

```python
class Product(models.Model):
    class Meta:
        permissions = [("publish_product", "Can publish products")]
```

**🟡 Intermediate Example**

```python
user.has_perm("shop.publish_product")
```

**🔴 Expert Example**

Map custom perms to **Stripe** capabilities in middleware for support tooling.

**🌍 Real-Time Example**

Social: **`moderate_content`** for trust & safety.

---

### 12.1.5 Permission Inheritance

**`User`** gains permissions via **`user_permissions`** M2M and **`groups`**.

**🟢 Beginner Example**

```python
user.user_permissions.add(perm)
```

**🟡 Intermediate Example**

```python
user.groups.add(managers)
```

**🔴 Expert Example**

**Superuser** short-circuits checks: **`has_perm`** returns True (use carefully).

**🌍 Real-Time Example**

SaaS: tenant **owner** group includes subset of Django perms.

---

## 12.2 Groups

### 12.2.1 Creating Groups

**`Group.objects.create(name="support_tier1")`**

**🟢 Beginner Example**

```python
from django.contrib.auth.models import Group
Group.objects.create(name="customers")
```

**🟡 Intermediate Example**

Data migration seeds groups and attaches perms.

**🔴 Expert Example**

**`get_or_create`** idempotent bootstrap in **`ready()`** (careful with multiple workers).

**🌍 Real-Time Example**

E‑commerce roles: **`merchant`**, **`staff`**, **`fulfillment`**.

---

### 12.2.2 Group Permissions

**`group.permissions.set([...])`**

**🟢 Beginner Example**

```python
g = Group.objects.get(name="editors")
g.permissions.set(Permission.objects.filter(content_type__model="post"))
```

**🟡 Intermediate Example**

```python
g.permissions.add(*Permission.objects.filter(codename__in=["view_order", "change_order"]))
```

**🔴 Expert Example**

Diff group perms in admin audit log.

**🌍 Real-Time Example**

SaaS internal admin: **`read_only_analyst`** with **`view_*`** only.

---

### 12.2.3 User Groups

**`user.groups.all()`**

**🟢 Beginner Example**

```python
if user.groups.filter(name="merchant").exists():
    ...
```

**🟡 Intermediate Example**

```python
merchant_group = Group.objects.get(name="merchant")
merchant_group.user_set.add(user)
```

**🔴 Expert Example**

Sync group membership from IdP SCIM webhook.

**🌍 Real-Time Example**

Marketplace seller onboarding adds **`merchant`**.

---

### 12.2.4 Multiple Groups

Permissions **union** across groups plus direct user perms.

**🟢 Beginner Example**

```python
names = set(user.groups.values_list("name", flat=True))
```

**🟡 Intermediate Example**

Template: **`{{ perms.shop.change_product }}`** via auth context processor.

**🔴 Expert Example**

Conflict resolution policy: explicit **deny** not native—implement in **`user_passes_test`**.

**🌍 Real-Time Example**

User is **`creator`** and **`moderator`** simultaneously.

---

### 12.2.5 Group Management

Django admin **`auth`** app or custom tooling.

**🟢 Beginner Example**

Use admin to attach perms.

**🟡 Intermediate Example**

Management command **`sync_roles`** from YAML.

**🔴 Expert Example**

Approval workflow before granting **`finance_admin`** group.

**🌍 Real-Time Example**

SaaS: self-serve **invite** assigns **`member`** group only.

---

## 12.3 Permission Checking

### 12.3.1 has_perm()

**`user.has_perm("app.codename")`**

**🟢 Beginner Example**

```python
if request.user.has_perm("blog.add_post"):
    ...
```

**🟡 Intermediate Example**

```python
if request.user.has_perm("shop.change_product", product):
    ...  # object-level if backend supports (guardian)
```

**🔴 Expert Example**

Custom auth backend implements **`has_perm(user, perm, obj=None)`**.

**🌍 Real-Time Example**

E‑commerce: check **`change_order`** before refund action.

---

### 12.3.2 has_perms()

**`user.has_perms(["a.b", "c.d"])`** — **AND** semantics.

**🟢 Beginner Example**

```python
user.has_perms(["shop.view_product", "shop.change_product"])
```

**🟡 Intermediate Example**

Gate destructive UI when **both** perms required.

**🔴 Expert Example**

DRF permission class wrapping **`has_perms`**.

**🌍 Real-Time Example**

SaaS migration tools: **`view_tenant`** + **`export_tenant`**.

---

### 12.3.3 get_all_permissions()

Includes user + groups; used internally.

**🟢 Beginner Example**

```python
perms = user.get_all_permissions()
```

**🟡 Intermediate Example**

Debug page lists effective permissions (staff-only).

**🔴 Expert Example**

Warm cache after group change signal.

**🌍 Real-Time Example**

Compliance export of access rights.

---

### 12.3.4 has_module_perms()

Coarse gate for admin sections.

**🟢 Beginner Example**

```python
user.has_module_perms("auth")
```

**🟡 Intermediate Example**

Custom dashboard tiles mirror **`has_module_perms`**.

**🔴 Expert Example**

Combine with **`is_staff`** for admin access.

**🌍 Real-Time Example**

Hide **billing** module for non-finance staff.

---

### 12.3.5 Permission Cache

**`_perm_cache`** on user; clear with **`user.refresh_from_db()`** or new instance.

**🟢 Beginner Example**

After permission change in same request lifecycle, re-fetch user.

**🟡 Intermediate Example**

```python
from django.contrib.auth.models import User
u = User.objects.get(pk=user.pk)  # fresh perms
```

**🔴 Expert Example**

When updating groups, **`request.user`** may be stale—avoid mutating in-place inconsistently.

**🌍 Real-Time Example**

SaaS: after role change webhook, force logout or refresh session claims.

---

## 12.4 Authorization in Views

### 12.4.1 Permission Required Decorators

**`@permission_required`**

**🟢 Beginner Example**

```python
from django.contrib.auth.decorators import permission_required

@permission_required("shop.change_product", raise_exception=True)
def edit_product(request, pk):
    ...
```

**🟡 Intermediate Example**

```python
@permission_required(["shop.view_order", "shop.change_order"], raise_exception=True)
```

**🔴 Expert Example**

Custom decorator wrapping **`permission_required`** + **logging**.

**🌍 Real-Time Example**

Merchant portal edit SKU.

---

### 12.4.2 PermissionRequiredMixin

For **CBVs**.

**🟢 Beginner Example**

```python
from django.contrib.auth.mixins import PermissionRequiredMixin

class ProductUpdate(PermissionRequiredMixin, UpdateView):
    permission_required = "shop.change_product"
    model = Product
```

**🟡 Intermediate Example**

```python
permission_required = ("shop.view_product", "shop.change_product")
```

**🔴 Expert Example**

```python
def has_permission(self):
    return super().has_permission() and self.get_object().shop_id == self.request.user.shop_id
```

**🌍 Real-Time Example**

Object-scoped check layered on top (see 12.4.5).

---

### 12.4.3 UserPassesTestMixin

**`test_func(self) -> bool`**

**🟢 Beginner Example**

```python
from django.contrib.auth.mixins import UserPassesTestMixin

class StaffOnly(UserPassesTestMixin, TemplateView):
    def test_func(self):
        return self.request.user.is_staff
```

**🟡 Intermediate Example**

```python
class OwnerOnly(UserPassesTestMixin, DetailView):
    def test_func(self):
        obj = self.get_object()
        return obj.owner_id == self.request.user.id
```

**🔴 Expert Example**

```python
def test_func(self):
    return self.request.user.has_perm("conversations.moderate") or self.get_object().participants.filter(user=self.request.user).exists()
```

**🌍 Real-Time Example**

Social DMs: participant-only thread view.

---

### 12.4.4 Custom Permission Mixins

Compose **reusable** mixins.

**🟢 Beginner Example**

```python
class TenantMixin:
    def get_tenant(self):
        return self.request.tenant
```

**🟡 Intermediate Example**

```python
class TenantObjectMixin(TenantMixin):
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(tenant=self.get_tenant())
```

**🔴 Expert Example**

```python
class RequiresPlanFeature(UserPassesTestMixin):
    feature = None

    def test_func(self):
        return self.request.user.customer.plan.features.get(self.feature, False)
```

**🌍 Real-Time Example**

SaaS: **`RequiresPlanFeature(feature="sso")`**.

---

### 12.4.5 Object-Level Authorization

**`get_object()`** then check ownership or guardian perms.

**🟢 Beginner Example**

```python
def get_object(self):
    obj = super().get_object()
    if obj.owner != self.request.user:
        raise PermissionDenied
    return obj
```

**🟡 Intermediate Example**

```python
from guardian.shortcuts import get_objects_for_user

qs = get_objects_for_user(self.request.user, "view_product", Product)
return qs.get(pk=self.kwargs["pk"])
```

**🔴 Expert Example**

Central **`Policy`** service used by views and DRF.

**🌍 Real-Time Example**

E‑commerce: user may view **own** orders only.

---

## 12.5 Role-Based Access Control

### 12.5.1 Role Definition

Map **roles** to **Django groups** or custom **`Role`** model.

**🟢 Beginner Example**

```python
ROLE_MERCHANT = "merchant"
```

**🟡 Intermediate Example**

```python
class Membership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    workspace = models.ForeignKey("Workspace", on_delete=models.CASCADE)
    role = models.CharField(max_length=32, choices=WorkspaceRole.choices)
```

**🔴 Expert Example**

**CASL**-style ability strings generated from **`Membership`**.

**🌍 Real-Time Example**

SaaS workspace **admin** vs **member**.

---

### 12.5.2 Role Assignment

Invite flow sets **`Membership`**.

**🟢 Beginner Example**

```python
Membership.objects.create(user=u, workspace=w, role=WorkspaceRole.MEMBER)
```

**🟡 Intermediate Example**

Signal syncs **`Group`** **`workspace_{id}_admin`**.

**🔴 Expert Example**

SCIM **`PATCH`** updates roles.

**🌍 Real-Time Example**

Enterprise SSO JIT provisioning.

---

### 12.5.3 Role Hierarchy

**`admin > member > guest`** implemented in code.

**🟢 Beginner Example**

```python
ORDER = {"guest": 0, "member": 1, "admin": 2}

def role_at_least(role, minimum):
    return ORDER[role] >= ORDER[minimum]
```

**🟡 Intermediate Example**

```python
if not role_at_least(membership.role, "admin"):
    raise PermissionDenied
```

**🔴 Expert Example**

Store hierarchy in DB with **`lft`/`rgt`** (nested sets) for complex org trees.

**🌍 Real-Time Example**

Holding company SaaS with subsidiaries.

---

### 12.5.4 Dynamic Roles

Roles depend on **subscription** or **feature flags**.

**🟢 Beginner Example**

```python
if customer.plan == "enterprise":
    allow_sso = True
```

**🟡 Intermediate Example**

```python
def effective_permissions(user):
    base = user.get_all_permissions()
    if user.customer.plan == "pro":
        base |= {"analytics.view_advanced"}
    return base
```

**🔴 Expert Example**

Push dynamic claims into **JWT** at login; reconcile drift.

**🌍 Real-Time Example**

Trial converts to paid → expand permissions.

---

### 12.5.5 RBAC Implementation

**Groups = roles**; **permissions = granular actions**; optional **object-level** layer.

**🟢 Beginner Example**

One group per role name.

**🟡 Intermediate Example**

**`Role`** model + M2M to **`Permission`** for flexibility.

**🔴 Expert Example**

**Policy-as-data** stored JSON, evaluated uniformly.

**🌍 Real-Time Example**

Multi-tenant B2B with per-customer custom roles.

---

## 12.6 Object-Level Permissions

### 12.6.1 django-guardian

Assigns per-object permissions to users/groups.

**🟢 Beginner Example**

```python
from guardian.shortcuts import assign_perm
assign_perm("view_product", user, product)
```

**🟡 Intermediate Example**

```python
from guardian.shortcuts import remove_perm
remove_perm("change_product", group, product)
```

**🔴 Expert Example**

**`GUARDIAN_RENDER_403`** template for UX.

**🌍 Real-Time Example**

SaaS: grant **`view_project`** on **`Project`** rows per user.

---

### 12.6.2 Object Permissions Assignment

On object creation, assign owner perms.

**🟢 Beginner Example**

```python
def form_valid(self, form):
    obj = form.save(commit=False)
    obj.owner = self.request.user
    obj.save()
    assign_perm("change_project", self.request.user, obj)
    return redirect(obj)
```

**🟡 Intermediate Example**

Bulk assign to team group:

```python
assign_perm("view_document", team_group, doc)
```

**🔴 Expert Example**

Celery task propagates sharing from template folder ACLs.

**🌍 Real-Time Example**

Google Drive-like sharing UI.

---

### 12.6.3 Permission Inheritance

Guardian does not auto-inherit; implement **folder** → **file** resolution.

**🟢 Beginner Example**

```python
def user_can_view_file(user, file):
    if user.has_perm("view_file", file):
        return True
    return user.has_perm("view_folder", file.folder)
```

**🟡 Intermediate Example**

Walk ancestors up tree.

**🔴 Expert Example**

Materialized path caching for ACL checks.

**🌍 Real-Time Example**

E‑commerce vendor sees only **their** products via object perms.

---

### 12.6.4 Checking Object Permissions

**`user.has_perm("perm", obj)`** with guardian backend enabled.

**🟢 Beginner Example**

```python
from django.contrib.auth import get_user_model
user = get_user_model().objects.get(pk=1)
user.has_perm("shop.view_product", product)
```

**🟡 Intermediate Example**

```python
from guardian.shortcuts import get_objects_for_user
visible = get_objects_for_user(request.user, "view_post", Post)
```

**🔴 Expert Example**

Combine queryset filtering in **`get_queryset`** to avoid IDOR.

**🌍 Real-Time Example**

Social: timeline queryset = **`get_objects_for_user`** + friends graph.

---

### 12.6.5 Listing User Objects

**`get_objects_for_user`** efficient SQL.

**🟢 Beginner Example**

```python
docs = get_objects_for_user(user, "view_document", Document)
```

**🟡 Intermediate Example**

```python
docs = get_objects_for_user(user, "view_document", Document, accept_global_perms=False)
```

**🔴 Expert Example**

Pagination + **`select_related`** on filtered queryset.

**🌍 Real-Time Example**

SaaS “Shared with me” page.

---

## Best Practices (Chapter Summary)

- Default **deny**; explicitly allow in views/querysets.
- Always scope **querysets** by **tenant/user**—do not rely on obscurity of IDs.
- Prefer **`raise_exception=True`** on **`permission_required`** for consistent **403**.
- Keep **role** logic in one module/service to avoid drift across views.
- Audit **superuser** usage; use **break-glass** accounts.
- For object-level, **filter querysets** and **check object** on detail views.
- Test authorization with **multiple users** per view (pytest + client).
- Separate **feature flags** from **security permissions**.

---

## Common Mistakes (Chapter Summary)

- Checking **`is_authenticated`** only, without **authorization**.
- **IDOR**: **`get_object()`** without verifying ownership/tenant.
- Stale **`request.user`** permission cache after admin changes roles mid-session.
- Granting **`change_*`** without **`view_*`** leading to odd admin states.
- Using **custom permissions** without **`migrate`** to create rows.
- Duplicating permission strings with typos across codebase—**constants** help.
- Assuming **`has_perm`** on anonymous user (always False except special cases).

---

## Comparison Tables

| Layer | Mechanism | Granularity |
|-------|-----------|-------------|
| `login_required` | auth | binary |
| Model perms | `auth.Permission` | model-wide |
| Object perms | guardian / custom | per row |
| RBAC | groups/roles | user groups |

| API | Question answered |
|-----|-------------------|
| `has_perm("app.action_model")` | Global model perm? |
| `has_perm("app.action_model", obj)` | Object perm? (with backend) |
| `has_module_perms("app")` | Any perms in app? |

| Pattern | When |
|---------|------|
| Groups | Stable org roles |
| User perms | Exceptions / break-glass |
| Custom perms | Domain actions beyond CRUD |
| Object perms | Shared resources |

| Mixin | Typical use |
|-------|-------------|
| `LoginRequiredMixin` | Must be signed in |
| `PermissionRequiredMixin` | Django perm strings |
| `UserPassesTestMixin` | Custom logic |

---

*Verify permission codenames and backends against **Django 6.0.3** and **django-guardian** documentation for your stack.*
