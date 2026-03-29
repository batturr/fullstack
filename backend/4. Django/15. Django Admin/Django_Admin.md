# Django Admin — Reference Notes (Django 6.0.3)

Django’s **automatic admin interface** is one of its signature features: it reads your models and metadata, then generates CRUD screens, list views, filters, and permissions with minimal code. For Django **6.0.3** (Python **3.12–3.14**), the admin remains `django.contrib.admin`, backed by `ModelAdmin`, URL routing under a configurable path, and optional deep customization via Python, templates, and static assets. These notes mirror a TypeScript-style reference: concepts first, then layered examples from beginner through production.

---

## 📑 Table of Contents

1. [15.1 Admin Basics](#151-admin-basics)
2. [15.2 ModelAdmin Class](#152-modeladmin-class)
3. [15.3 Admin Customization](#153-admin-customization)
4. [15.4 Admin Actions](#154-admin-actions)
5. [15.5 Admin Permissions](#155-admin-permissions)
6. [15.6 Inline Admin](#156-inline-admin)
7. [15.7 Admin Forms](#157-admin-forms)
8. [15.8 Advanced Admin](#158-advanced-admin)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 15.1 Admin Basics

### 15.1.1 Registering Models

**Concept:** Models appear in the admin only after registration with `admin.site.register()` or via `@admin.register` on a `ModelAdmin` subclass.

#### 🟢 Beginner Example (simple, foundational)

```python
# shop/models.py
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# shop/admin.py
from django.contrib import admin
from .models import Product

admin.site.register(Product)
```

#### 🟡 Intermediate Example (practical patterns)

```python
from django.contrib import admin
from .models import Product, Category

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price")

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    pass
```

#### 🔴 Expert Example (advanced usage)

```python
from django.contrib import admin
from django.contrib.admin.sites import AlreadyRegistered

from .models import Product

class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "price")

try:
    admin.site.register(Product, ProductAdmin)
except AlreadyRegistered:
    admin.site.unregister(Product)
    admin.site.register(Product, ProductAdmin)
```

#### 🌍 Real-Time Example (production / e-commerce)

```python
# apps/catalog/admin.py — SaaS multi-tenant: register only after app is ready
from django.apps import apps
from django.contrib import admin

def register_catalog_models():
    Product = apps.get_model("catalog", "Product")
    admin.site.register(Product, ProductAdmin)

# Called from AppConfig.ready() if you need lazy imports to avoid circular deps
```

### 15.1.2 Admin Site

**Concept:** `django.contrib.admin.site` is the default `AdminSite` instance. You can create additional sites for separate URL namespaces (e.g., internal vs. partner admin).

#### 🟢 Beginner Example

```python
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
```

#### 🟡 Intermediate Example

```python
from django.contrib.admin import AdminSite

partner_admin = AdminSite(name="partner_admin")
partner_admin.register(PartnerOrder)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("partner-admin/", partner_admin.urls),
]
```

#### 🔴 Expert Example

```python
class TenantAdminSite(AdminSite):
    site_header = "Tenant Console"
    site_title = "Tenant Admin"
    index_title = "Operations"

tenant_admin = TenantAdminSite(name="tenant")

# Register models per tenant in middleware or AppConfig after DB routing is set
```

#### 🌍 Real-Time Example (SaaS)

Separate `AdminSite` instances per white-label brand, each with its own `site_header`, `index_template`, and registered subset of models exposed to customer success teams.

### 15.1.3 Superuser Creation

**Concept:** Superusers bypass object-level checks in the admin (subject to model permissions). Create with `createsuperuser` or programmatically.

#### 🟢 Beginner Example

```bash
python manage.py createsuperuser
```

#### 🟡 Intermediate Example

```python
from django.contrib.auth import get_user_model

User = get_user_model()
User.objects.create_superuser("ops@example.com", "secure-password")
```

#### 🔴 Expert Example

```python
# Idempotent bootstrap for containers
from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(username="bootstrap").exists():
    User.objects.create_superuser("bootstrap", "bootstrap@internal", "from-vault")
```

#### 🌍 Real-Time Example

Kubernetes init job runs `createsuperuser` with secrets from the platform vault; regular staff accounts created via SSO and `RemoteUserBackend` without shared passwords.

### 15.1.4 Admin Interface Overview

**Concept:** List changelist → object add/change form → history; each model has optional inlines, actions, and filters driven by `ModelAdmin`.

#### 🟢 Beginner Example

Navigate to `/admin/`, log in, open **Products**, use **Add** and **Change**.

#### 🟡 Intermediate Example

Customize `list_display` so the changelist shows SKU, stock, and “published” without opening each row.

#### 🔴 Expert Example

Override `changelist_view` to inject analytics context (read-only) while preserving default queryset behavior.

#### 🌍 Real-Time Example (social media)

Moderation queue: `list_filter` by `report_count`, `search_fields` on username, custom action “suspend user” with audit log.

### 15.1.5 Admin URL Configuration

**Concept:** Default pattern is `path("admin/", admin.site.urls)`. Custom `AdminSite` uses `site.urls` the same way.

#### 🟢 Beginner Example

```python
from django.contrib import admin
from django.urls import path

urlpatterns = [path("admin/", admin.site.urls)]
```

#### 🟡 Intermediate Example

```python
urlpatterns = [
    path("internal/tools/", admin.site.urls),
]
```

#### 🔴 Expert Example

```python
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/admin/", include("myapp.admin_api_urls")),  # JSON hooks, not replacing admin.site.urls
]
```

#### 🌍 Real-Time Example

Admin mounted only on VPN hostname; `ALLOWED_HOSTS` and middleware enforce host, with `SECURE_SSL_REDIRECT` in production.

---

## 15.2 ModelAdmin Class

### 15.2.1 ModelAdmin Options (overview)

**Concept:** `ModelAdmin` attributes control list views, forms, permissions, and templates. Common: `list_display`, `list_filter`, `search_fields`, `ordering`, `readonly_fields`, `fieldsets`, `inlines`, `actions`.

#### 🟢 Beginner Example

```python
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "total")
```

#### 🟡 Intermediate Example

```python
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "total", "placed_at")
    list_filter = ("status", "placed_at")
    search_fields = ("customer__email", "id")
    ordering = ("-placed_at",)
```

#### 🔴 Expert Example

```python
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "total", "status_badge")
    list_select_related = ("customer",)
    show_full_result_count = False

    @admin.display(description="Status")
    def status_badge(self, obj):
        return obj.get_status_display()
```

#### 🌍 Real-Time Example

E-commerce: `list_select_related` + `list_prefetch_related` for line items count columns; `date_hierarchy` on `placed_at` for ops.

### 15.2.2 list_display

**Concept:** Tuple of field names, callables, or `ModelAdmin` methods marked with `@admin.display`.

#### 🟢 Beginner Example

```python
list_display = ("name", "price")
```

#### 🟡 Intermediate Example

```python
list_display = ("title", "author", "published_at", "is_featured")
```

#### 🔴 Expert Example

```python
@admin.display(ordering="comment_count", description="Comments")
def comment_count(self, obj):
    return obj.comment_count  # annotated in get_queryset
```

#### 🌍 Real-Time Example

SaaS billing: columns for MRR, plan tier, and `next_invoice_at` from annotated queryset to avoid N+1 queries.

### 15.2.3 list_filter

**Concept:** Filters in the right sidebar: field names, `SimpleListFilter` subclasses, or related field lookups (`customer__country`).

#### 🟢 Beginner Example

```python
list_filter = ("is_active",)
```

#### 🟡 Intermediate Example

```python
list_filter = ("status", "created_at", "customer__tier")
```

#### 🔴 Expert Example

```python
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

class TierListFilter(admin.SimpleListFilter):
    title = _("tier")
    parameter_name = "tier"

    def lookups(self, request, model_admin):
        return (("pro", "Pro"), ("free", "Free"))

    def queryset(self, request, queryset):
        if self.value() == "pro":
            return queryset.filter(plan__slug="pro")
        return queryset

class AccountAdmin(admin.ModelAdmin):
    list_filter = (TierListFilter,)
```

#### 🌍 Real-Time Example

Social: filter posts by “reported in last 24h” using a custom filter with timezone-aware boundaries.

### 15.2.4 search_fields

**Concept:** OR search across listed fields; prefix with `^` (startswith), `=` (exact), `@` (full-text on supported backends).

#### 🟢 Beginner Example

```python
search_fields = ("name",)
```

#### 🟡 Intermediate Example

```python
search_fields = ("email", "username", "profile__bio")
```

#### 🔴 Expert Example

```python
search_fields = ("=id", "email", "^username")
```

#### 🌍 Real-Time Example

Support console: search orders by exact ID, partial email, and related payment reference fields.

### 15.2.5 ordering

**Concept:** Default ordering for changelist; can be a string or tuple of field names (prefix `-` for descending).

#### 🟢 Beginner Example

```python
ordering = ("name",)
```

#### 🟡 Intermediate Example

```python
ordering = ("-updated_at", "priority")
```

#### 🔴 Expert Example

```python
def get_ordering(self, request):
    if request.user.is_superuser:
        return ("-created_at",)
    return ("name",)
```

#### 🌍 Real-Time Example

Multi-warehouse inventory: default order by `warehouse`, then `sku` for ops consistency.

---

## 15.3 Admin Customization

### 15.3.1 fieldsets

**Concept:** Group fields on the change form with optional titles and `classes` (e.g., `collapse`).

#### 🟢 Beginner Example

```python
fieldsets = (
    (None, {"fields": ("name", "price")}),
)
```

#### 🟡 Intermediate Example

```python
fieldsets = (
    ("Main", {"fields": ("title", "slug", "body")}),
    ("SEO", {"fields": ("meta_title", "meta_description"), "classes": ("collapse",)}),
)
```

#### 🔴 Expert Example

```python
def get_fieldsets(self, request, obj=None):
    base = ((None, {"fields": ("name",)}),)
    if request.user.is_superuser:
        base += (("Internal", {"fields": ("cost", "margin"), "classes": ("collapse",)}),)
    return base
```

#### 🌍 Real-Time Example

E-commerce product: collapsed “Compliance” fieldset (HS code, country restrictions) for legal team only.

### 15.3.2 filter_horizontal / filter_vertical

**Concept:** Widgets for `ManyToManyField` on the admin form (better UX than default multiselect).

#### 🟢 Beginner Example

```python
filter_horizontal = ("tags",)
```

#### 🟡 Intermediate Example

```python
filter_vertical = ("permissions",)
```

#### 🔴 Expert Example

```python
# Large M2M: combine with raw_id_fields for very large tables
raw_id_fields = ("supplier",)
filter_horizontal = ("categories",)
```

#### 🌍 Real-Time Example

SaaS: assign hundreds of feature flags to a plan — `filter_horizontal` for moderate sets; `raw_id` when the related table is huge.

### 15.3.3 readonly_fields

**Concept:** Fields shown on the form but not editable; can include methods.

#### 🟢 Beginner Example

```python
readonly_fields = ("created_at",)
```

#### 🟡 Intermediate Example

```python
readonly_fields = ("uuid", "created_at", "updated_at")
```

#### 🔴 Expert Example

```python
@admin.display(description="Stripe ID")
def stripe_customer_id(self, obj):
    return obj.billing_metadata.get("stripe_customer_id", "—")

readonly_fields = ("created_at", stripe_customer_id)
```

#### 🌍 Real-Time Example

Order admin: `readonly_fields` for payment intent id and capture status synced from PSP webhooks.

### 15.3.4 Custom Properties in Display

**Concept:** Use `@admin.display` for `boolean`, `ordering`, and `description`.

#### 🟢 Beginner Example

```python
@admin.display(boolean=True, description="Active?")
def is_live(self, obj):
    return obj.status == "live"
```

#### 🟡 Intermediate Example

```python
@admin.display(description="Revenue")
def revenue_display(self, obj):
    return f"${obj.revenue:,.2f}"
```

#### 🔴 Expert Example

```python
@admin.display(ordering="last_login", description="Last seen")
def last_seen(self, obj):
    return obj.profile.last_activity_at
```

#### 🌍 Real-Time Example

Social: “verified” badge column with `boolean=True` for quick scanning in user changelist.

### 15.3.5 Form Customization

**Concept:** Set `form`, `fields`, `exclude`, or override `get_form` / `get_formset` for validation and widgets.

#### 🟢 Beginner Example

```python
class ProductAdmin(admin.ModelAdmin):
    fields = ("name", "price", "description")
```

#### 🟡 Intermediate Example

```python
from django import forms

class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"
        widgets = {"description": forms.Textarea(attrs={"rows": 4})}

class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
```

#### 🔴 Expert Example

```python
def get_form(self, request, obj=None, **kwargs):
    Form = super().get_form(request, obj, **kwargs)
    class AdminForm(Form):
        def clean_price(self):
            price = self.cleaned_data["price"]
            if price < 0:
                raise forms.ValidationError("Invalid price")
            return price
    return AdminForm
```

#### 🌍 Real-Time Example

E-commerce: admin-only “cost” field with validation against supplier contract ranges.

---

## 15.4 Admin Actions

### 15.4.1 Built-in Actions

**Concept:** Delete selected is always available; behavior respects `has_delete_permission`.

#### 🟢 Beginner Example

Select rows → **Action** → **Delete selected** → **Go**.

#### 🟡 Intermediate Example

Restrict delete: override `has_delete_permission` so only superusers see delete action.

#### 🔴 Expert Example

```python
def get_actions(self, request):
    actions = super().get_actions(request)
    if not request.user.is_superuser:
        del actions["delete_selected"]
    return actions
```

#### 🌍 Real-Time Example

SaaS: soft-delete action replaces hard delete for compliance retention.

### 15.4.2 Custom Actions

**Concept:** Functions `(modeladmin, request, queryset)` decorated with `@admin.action`.

#### 🟢 Beginner Example

```python
from django.contrib import admin

@admin.action(description="Mark as shipped")
def mark_shipped(modeladmin, request, queryset):
    queryset.update(status="shipped")
```

#### 🟡 Intermediate Example

```python
@admin.action(description="Export CSV")
def export_csv(modeladmin, request, queryset):
    # stream HttpResponse with CSV
    pass
```

#### 🔴 Expert Example

```python
@admin.action(description="Recalculate totals", permissions=["change"])
def recalc(modeladmin, request, queryset):
    for order in queryset.select_for_update():
        order.recalculate_total()
        order.save(update_fields=["total"])
```

#### 🌍 Real-Time Example

E-commerce: bulk “refund selected” calling payment API with idempotency keys and logging.

### 15.4.3 Action Permissions

**Concept:** `permissions` on `@admin.action` defaults to `change`; can require `add`, `delete`, `view`, or custom perms.

#### 🟢 Beginner Example

```python
@admin.action(description="Publish", permissions=["change"])
def publish(modeladmin, request, queryset):
    queryset.update(state="published")
```

#### 🟡 Intermediate Example

```python
@admin.action(description="Purge", permissions=["delete"])
def purge(modeladmin, request, queryset):
    queryset.delete()
```

#### 🔴 Expert Example

```python
def has_publish_permission(request):
    return request.user.has_perm("blog.publish_post")

@admin.action(description="Publish", permissions=[has_publish_permission])
def publish(modeladmin, request, queryset):
    queryset.update(state="published")
```

#### 🌍 Real-Time Example

Finance: “post to ledger” action gated by custom perm `accounting.post_journal`.

### 15.4.4 Multiple Actions

**Concept:** `actions` list on `ModelAdmin` combines built-in and custom actions.

#### 🟢 Beginner Example

```python
actions = [mark_shipped]
```

#### 🟡 Intermediate Example

```python
actions = [mark_shipped, export_csv, "delete_selected"]
```

#### 🔴 Expert Example

```python
def get_actions(self, request):
    acts = super().get_actions(request)
    if not request.user.groups.filter(name="Moderators").exists():
        acts.pop("bulk_suspend", None)
    return acts
```

#### 🌍 Real-Time Example

Content platform: separate actions for “hide”, “feature”, “notify author”.

### 15.4.5 Action Descriptions

**Concept:** `description` in decorator sets human-readable label; can use `gettext_lazy` for i18n.

#### 🟢 Beginner Example

```python
@admin.action(description="Activate accounts")
def activate(modeladmin, request, queryset):
    queryset.update(is_active=True)
```

#### 🟡 Intermediate Example

```python
from django.utils.translation import gettext_lazy as _

@admin.action(description=_("Deactivate accounts"))
def deactivate(modeladmin, request, queryset):
    queryset.update(is_active=False)
```

#### 🔴 Expert Example

Dynamic descriptions via subclassing `ActionForm` is rare; prefer separate actions per intent for clarity.

#### 🌍 Real-Time Example

Localized admin for EU ops: all action labels wrapped in `_()`.

---

## 15.5 Admin Permissions

### 15.5.1 Add, Change, Delete, View

**Concept:** Django creates default permissions per model; admin checks them per view and action.

#### 🟢 Beginner Example

Staff user with only `view_product` sees read-only product admin if `ModelAdmin` respects defaults.

#### 🟡 Intermediate Example

```python
def has_add_permission(self, request):
    return request.user.groups.filter(name="Merchants").exists()
```

#### 🔴 Expert Example

```python
def has_change_permission(self, request, obj=None):
    if obj and obj.tenant_id != getattr(request.user, "tenant_id", None):
        return False
    return super().has_change_permission(request, obj)
```

#### 🌍 Real-Time Example

Multi-tenant SaaS: object-level checks in every `has_*_permission` and `get_queryset`.

### 15.5.2 View Permission

**Concept:** `view_*` allows read-only access; Django 6.x admin integrates view-only flows for users without change permission.

#### 🟢 Beginner Example

Assign `view_order` to support staff.

#### 🟡 Intermediate Example

```python
def has_view_permission(self, request, obj=None):
    return request.user.has_perm("shop.view_order")
```

#### 🔴 Expert Example

Override `changeform_view` only when necessary; prefer `has_change_permission` returning False and `has_view_permission` True.

#### 🌍 Real-Time Example

Call center: view PII-masked representation via readonly fields and `has_view_permission`.

### 15.5.3 Permission Restrictions

**Concept:** Combine `ModelAdmin` hooks with Django Guardian or custom backends for row-level security.

#### 🟢 Beginner Example

Non-superuser staff without perms sees empty admin sections.

#### 🟡 Intermediate Example

```python
def get_queryset(self, request):
    qs = super().get_queryset(request)
    if request.user.is_superuser:
        return qs
    return qs.filter(organization=request.user.organization)
```

#### 🔴 Expert Example

Centralize in a mixin `ScopedAdminMixin` used across all tenant models.

#### 🌍 Real-Time Example

E-commerce marketplace: sellers see only their products through `get_queryset` + action permission checks.

---

## 15.6 Inline Admin

### 15.6.1 InlineModelAdmin

**Concept:** Edit related objects on the parent change page; base class for tabular and stacked inlines.

#### 🟢 Beginner Example

```python
class LineItemInline(admin.TabularInline):
    model = LineItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [LineItemInline]
```

#### 🟡 Intermediate Example

```python
class LineItemInline(admin.TabularInline):
    model = LineItem
    fields = ("product", "quantity", "unit_price")
    readonly_fields = ("line_total",)
```

#### 🔴 Expert Example

```python
class LineItemInline(admin.TabularInline):
    model = LineItem
    autocomplete_fields = ("product",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("product")
```

#### 🌍 Real-Time Example

B2B orders: dozens of lines with autocomplete SKUs and readonly extended cost.

### 15.6.2 TabularInline vs StackedInline

**Concept:** Tabular = compact rows; stacked = full form per related object.

#### 🟢 Beginner Example

```python
class AddressInline(admin.StackedInline):
    model = Address
    extra = 0
```

#### 🟡 Intermediate Example

Use `TabularInline` for homogeneous line items; `StackedInline` for complex nested address or profile data.

#### 🔴 Expert Example

```python
class StackedImageInline(admin.StackedInline):
    model = ProductImage
    max_num = 10
    sortable_field_name = "sort_order"  # if using admin extension; native admin uses ordering field
```

#### 🌍 Real-Time Example

Social: `StackedInline` for user profile extensions; `TabularInline` for role assignments.

### 15.6.3 Relationship Display

**Concept:** FK from inline child to parent is implicit; use `fk_name` when multiple FKs to same parent exist.

#### 🟢 Beginner Example

Single `ForeignKey` from `Comment` to `Post` — default inline works.

#### 🟡 Intermediate Example

```python
class RevisionInline(admin.StackedInline):
    model = PageRevision
    fk_name = "page"
```

#### 🔴 Expert Example

Polymorphic or duplicate FK paths: explicit `fk_name` + `can_delete` / `max_num` tuning.

#### 🌍 Real-Time Example

E-commerce: `Shipment` with optional FKs to `Order` and `Return` — two inlines on different admins with correct `fk_name`.

### 15.6.4 Inline Permissions

**Concept:** `has_add_permission`, `has_change_permission`, `has_delete_permission` on inline class.

#### 🟢 Beginner Example

```python
class ReadOnlyInline(admin.TabularInline):
    model = AuditLog
    can_delete = False
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False
```

#### 🟡 Intermediate Example

```python
def has_delete_permission(self, request, obj=None):
    return request.user.is_superuser
```

#### 🔴 Expert Example

Financial adjustments inline: delete allowed only in draft parent status.

#### 🌍 Real-Time Example

SaaS audit: append-only inline logs with all add/change/delete denied.

---

## 15.7 Admin Forms

### 15.7.1 Changing Admin Forms

**Concept:** `form`, `get_form`, `fieldsets`, `readonly_fields` shape the `ModelForm` used in add/change views.

#### 🟢 Beginner Example

```python
class MyAdmin(admin.ModelAdmin):
    fields = ("a", "b")
```

#### 🟡 Intermediate Example

```python
class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"

class ProductAdmin(admin.ModelAdmin):
    form = ProductForm
```

#### 🔴 Expert Example

```python
def get_form(self, request, obj=None, **kwargs):
    kwargs["form"] = self._form_with_request(request)
    return super().get_form(request, obj, **kwargs)
```

#### 🌍 Real-Time Example

Dynamic “tax region” choices loaded from cache based on `request.user.country`.

### 15.7.2 Form Validation in Admin

**Concept:** ModelForm `clean_*` and `clean()` run as in normal forms; model `full_clean()` on save.

#### 🟢 Beginner Example

```python
def clean_price(self):
    v = self.cleaned_data["price"]
    if v <= 0:
        raise forms.ValidationError("Must be positive")
    return v
```

#### 🟡 Intermediate Example

Cross-field in `clean()` comparing `start` and `end` dates.

#### 🔴 Expert Example

```python
def clean(self):
    data = super().clean()
    if data.get("discount") and data.get("price") and data["discount"] > data["price"]:
        raise forms.ValidationError("Discount cannot exceed price")
    return data
```

#### 🌍 Real-Time Example

Promo codes: validate against Redis rate limits inside `clean_code`.

### 15.7.3 Dynamic Form Fields

**Concept:** Override `get_form` and patch `base_fields` or assign on the form class at runtime.

#### 🟢 Beginner Example

Hide field based on user:

```python
def get_form(self, request, *args, **kwargs):
    FormClass = super().get_form(request, *args, **kwargs)
    if not request.user.is_superuser:
        FormClass.base_fields.pop("internal_cost", None)
    return FormClass
```

#### 🟡 Intermediate Example

Add computed `ChoiceField` options per tenant.

#### 🔴 Expert Example

Use `modelform_factory` inside `get_form` for large dynamic field sets (measure performance).

#### 🌍 Real-Time Example

Enterprise contracts: optional legal clauses as dynamic boolean fields from database schema.

### 15.7.4 Admin Form Widgets

**Concept:** Set `widgets` in `ModelForm.Meta` or `formfield_overrides` on `ModelAdmin`.

#### 🟢 Beginner Example

```python
from django import forms

class ProductAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.TextField: {"widget": forms.Textarea(attrs={"rows": 6})},
    }
```

#### 🟡 Intermediate Example

```python
class Meta:
    widgets = {"slug": forms.TextInput(attrs={"readonly": "readonly"})}
```

#### 🔴 Expert Example

Custom `AdminSplitDateTime` or third-party rich text with CSP-compliant config.

#### 🌍 Real-Time Example

Markdown + preview widget for blog posts in admin only.

### 15.7.5 Field Ordering

**Concept:** `fields`, `fieldsets`, and `get_fields` / `get_fieldsets` control order.

#### 🟢 Beginner Example

```python
fields = ("z", "a", "m")  # display order
```

#### 🟡 Intermediate Example

```python
def get_fields(self, request, obj=None):
    base = ["name", "sku"]
    if request.user.is_superuser:
        base.append("cost")
    return base
```

#### 🔴 Expert Example

Reorder per workflow state: draft vs archived products show different field order.

#### 🌍 Real-Time Example

SaaS onboarding: required fields first for CS tools.

---

## 15.8 Advanced Admin

### 15.8.1 Site Customization

**Concept:** `AdminSite.site_header`, `site_title`, `index_title`, `site_url`, `enable_nav_sidebar`.

#### 🟢 Beginner Example

```python
admin.site.site_header = "My Shop Admin"
admin.site.site_title = "Shop"
admin.site.index_title = "Dashboard"
```

#### 🟡 Intermediate Example

```python
admin.site.site_url = "/"  # link from admin logo to public site
```

#### 🔴 Expert Example

Subclass `AdminSite` and set `final_catch_all_view` behavior for custom 404 handling in admin namespace.

#### 🌍 Real-Time Example

White-label: per-tenant `site_header` from database after middleware resolves tenant.

### 15.8.2 Admin Templates

**Concept:** Override `change_list_template`, `change_form_template`, `index_template`, or extend `admin/base_site.html`.

#### 🟢 Beginner Example

```python
class ProductAdmin(admin.ModelAdmin):
    change_list_template = "admin/shop/product/change_list.html"
```

#### 🟡 Intermediate Example

```django
{# templates/admin/base_site.html #}
{% extends "admin/base.html" %}
{% block branding %}
<h1 id="site-name"><a href="{% url 'admin:index' %}">Acme Ops</a></h1>
{% endblock %}
```

#### 🔴 Expert Example

Inject chart partial in `change_list.html` with `{% block result_list %}` wrapping.

#### 🌍 Real-Time Example

E-commerce KPI header on order changelist (read-only charts).

### 15.8.3 Admin JavaScript

**Concept:** `Media` class on `ModelAdmin` or widgets; `class Media: js = (...)` for form assets.

#### 🟢 Beginner Example

```python
class ProductAdmin(admin.ModelAdmin):
    class Media:
        js = ("admin/js/product_slug.js",)
```

#### 🟡 Intermediate Example

Use `admin/js/jquery.init.js` patterns or `django.jQuery` for namespacing.

#### 🔴 Expert Example

Integrate ES modules with `ManifestStaticFilesStorage` and hashed filenames in `Media.js`.

#### 🌍 Real-Time Example

SKU barcode scanner hook in fulfillment admin page.

### 15.8.4 Admin CSS

**Concept:** `class Media: css = {"all": ("path",)}` for list/form styling.

#### 🟢 Beginner Example

```python
class Media:
    css = {"all": ("css/admin_extra.css",)}
```

#### 🟡 Intermediate Example

Highlight rows by status using extra classes from `row_css_class` pattern (custom template column).

#### 🔴 Expert Example

Dark mode overrides aligned with design system tokens.

#### 🌍 Real-Time Example

Brand colors for partner-facing `AdminSite` only.

### 15.8.5 Admin Search Optimization

**Concept:** Narrow `search_fields`, add DB indexes, avoid leading-wildcard LIKE on huge tables; use `list_select_related` / `list_prefetch_related`.

#### 🟢 Beginner Example

```python
search_fields = ("email",)  # selective
```

#### 🟡 Intermediate Example

```python
list_select_related = ("customer",)
```

#### 🔴 Expert Example

Database-specific full-text search in `get_search_results` override.

#### 🌍 Real-Time Example

```python
def get_search_results(self, request, queryset, search_term):
    queryset, use_distinct = super().get_search_results(request, queryset, search_term)
    if search_term.isdigit():
        queryset |= self.model.objects.filter(pk=int(search_term))
    return queryset, use_distinct
```

Social: search users by exact ID fast-path plus name/email fallback.

---

## Best Practices

- Register models in `admin.py` near the app; avoid importing models in `models.py` from admin (cycles).
- Use `list_select_related` and `list_prefetch_related` aggressively on changelists with related columns.
- Prefer `readonly_fields` + `has_view_permission` over duplicating read-only UIs in custom views when admin fits.
- Gate destructive actions with permissions, confirmation (default for delete), and audit logging.
- Keep `search_fields` precise; index columns you search frequently.
- For large M2M relations, use `raw_id_fields` or `autocomplete_fields` (requires `search_fields` on the related `ModelAdmin`).
- Internationalize user-visible strings with `gettext_lazy` for global teams.
- Test custom `get_queryset` and permission methods for tenant isolation regressions.

---

## Common Mistakes to Avoid

- Registering the same model twice without unregistering → `AlreadyRegistered`.
- Heavy computation in `list_display` callables without annotation → N+1 queries and slow pages.
- Forgetting `list_display_links` when using non-link first columns → harder navigation.
- Custom actions without `self.message_user` feedback → silent failures for staff.
- Relying on admin as the only superuser UI for dangerous operations without 2FA or IP allowlists.
- Using broad `search_fields` with `icontains` on unindexed JSON/text columns on huge tables.
- Inlines with large `extra` and no `max_num` → accidental mass empty rows.
- Overriding templates without `{{ block.super }}` → breaking admin JS and accessibility.

---

## Comparison Tables

| Concern | `TabularInline` | `StackedInline` |
|--------|------------------|-----------------|
| Layout | Row-based grid | Full card per object |
| Best for | Many uniform children | Few complex children |
| Scan speed | Faster for many rows | Slower, more detail |

| Search modifier | Effect |
|----------------|--------|
| (none) | `icontains` (default) |
| `^` | `istartswith` |
| `=` | exact (case-sensitive) |
| `@` | full-text (if backend supports) |

| Permission hook | Typical use |
|------------------|-------------|
| `has_add_permission` | Gate creation |
| `has_change_permission` | Edit + inline edits |
| `has_delete_permission` | Delete + delete action |
| `has_view_permission` | Read-only admin |
| `has_module_permission` | Show app in index |

| Customization level | Mechanism |
|--------------------|-----------|
| Low | `list_display`, `fields` |
| Medium | `ModelAdmin` methods, `get_queryset` |
| High | Templates, `AdminSite`, static `Media` |

---

*Reference notes for **Django 6.0.3** admin (`django.contrib.admin`). Verify behavior against the official Django 6.0 release notes and your project’s Python version.*
