# Views and Generic Views (Django 6.0.3)

Views turn HTTP requests into responses. Django supports **function-based views (FBVs)**, **class-based views (CBVs)**, **generic class-based views** for common CRUD/list/detail patterns, plus decorators, mixins, and context utilities. These notes map each layer to e-commerce, social, and SaaS scenarios on **Python 3.12–3.14**.

---

## 📑 Table of Contents

1. [6.1 Function-Based Views](#61-function-based-views)
2. [6.2 Class-Based Views](#62-class-based-views)
3. [6.3 Generic Display Views](#63-generic-display-views)
4. [6.4 Generic Editing Views](#64-generic-editing-views)
5. [6.5 View Decorators](#65-view-decorators)
6. [6.6 View Mixins](#66-view-mixins)
7. [6.7 View Context](#67-view-context)
8. [6.8 Advanced View Patterns](#68-advanced-view-patterns)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 6.1 Function-Based Views

### Creating Views

A view is a callable taking **`(request, *args, **kwargs)`** and returning **`HttpResponse`**.

#### 🟢 Beginner Example

```python
from django.http import HttpResponse

def ping(request):
    return HttpResponse("pong")
```

#### 🟡 Intermediate Example — `Http404`

```python
from django.http import Http404
from shop.models import Product

def product_detail(request, pk: int):
    try:
        p = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        raise Http404("No product matches the given query.")
    return HttpResponse(p.name)
```

#### 🔴 Expert Example — Thin view, fat service

```python
from django.shortcuts import get_object_or_404, render
from shop import services

def checkout(request, order_id: int):
    order = get_object_or_404(services.user_orders(request.user), pk=order_id)
    summary = services.build_checkout_summary(order)
    return render(request, "shop/checkout.html", {"order": order, "summary": summary})
```

#### 🌍 Real-Time Example — E-commerce “add to cart”

```python
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required

@require_POST
@login_required
def add_to_cart(request, product_id: int):
    services.add_line(request.user, product_id, int(request.POST.get("qty", "1")))
    return redirect("cart:detail")
```

---

### View Parameters

Path converters pass typed args; extra kwargs come from `path(..., kwargs={})`.

#### 🟢 Beginner Example

```python
def user_profile(request, username: str):
    ...
```

#### 🟡 Intermediate Example — Optional GET params

```python
def search(request):
    q = request.GET.get("q", "").strip()
    ...
```

#### 🔴 Expert Example — Typed request (with django-stubs patterns)

```text
Use HttpRequest annotations in typed projects; keep runtime behavior unchanged.
```

#### 🌍 Real-Time Example — SaaS workspace slug

```python
def dashboard(request, workspace_slug: str):
    ...
```

---

### Returning Responses

**`HttpResponse`**, **`JsonResponse`**, **`redirect`**, **`render`**, **`FileResponse`**, **`StreamingHttpResponse`**.

#### 🟢 Beginner Example

```python
from django.http import JsonResponse

def api_ping(request):
    return JsonResponse({"ok": True})
```

#### 🟡 Intermediate Example — `render`

```python
from django.shortcuts import render

def home(request):
    return render(request, "home.html", {"title": "Home"})
```

#### 🔴 Expert Example — Response with headers

```python
from django.http import HttpResponse

def robots_txt(request):
    body = "User-agent: *\nDisallow: /admin/\n"
    return HttpResponse(body, content_type="text/plain")
```

#### 🌍 Real-Time Example — Social activity feed JSON

```python
from django.http import JsonResponse
from django.core.serializers import serialize

def activity_json(request):
    data = serialize("json", Activity.objects.filter(user=request.user)[:50], fields=("verb", "created_at"))
    return HttpResponse(data, content_type="application/json")
```

---

### View Decorators

Compose cross-cutting behavior: HTTP methods, auth, caching.

#### 🟢 Beginner Example — `login_required`

```python
from django.contrib.auth.decorators import login_required

@login_required
def account(request):
    return render(request, "account.html")
```

#### 🟡 Intermediate Example — Stack order matters

```python
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET", "POST"])
@login_required
def edit_profile(request):
    ...
```

#### 🔴 Expert Example — Custom decorator

```python
from functools import wraps
from django.shortcuts import redirect

def staff_only(view):
    @wraps(view)
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_staff:
            return redirect("home")
        return view(request, *args, **kwargs)
    return _wrapped
```

#### 🌍 Real-Time Example — E-commerce staff refund portal

```python
@staff_only
def refund_order(request, order_id: int):
    ...
```

---

### `require_http_methods`

Restrict verbs allowed.

#### 🟢 Beginner Example

```python
from django.views.decorators.http import require_GET

@require_GET
def terms(request):
    return render(request, "legal/terms.html")
```

#### 🟡 Intermediate Example

```python
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET", "HEAD"])
def health(request):
    return HttpResponse("OK")
```

#### 🔴 Expert Example — OPTIONS for CORS preflight (API)

```text
For browser APIs, handle OPTIONS at middleware or DRF level—not only this decorator.
```

#### 🌍 Real-Time Example — SaaS webhook receiver

```python
@require_http_methods(["POST"])
def stripe_webhook(request):
    ...
```

---

## 6.2 Class-Based Views

### `View` Class

Base class with **`dispatch()`** routing to **`get`**, **`post`**, etc.

#### 🟢 Beginner Example

```python
from django.views import View
from django.http import HttpResponse

class HelloView(View):
    def get(self, request):
        return HttpResponse("hello")
```

#### 🟡 Intermediate Example — `setup()` hook

```python
class OwnerView(View):
    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        self.workspace = get_workspace(request)
```

#### 🔴 Expert Example — `http_method_names` restriction

```python
class ReadOnlyView(View):
    http_method_names = ["get", "head", "options"]
```

#### 🌍 Real-Time Example — Social public profile

```python
class ProfileView(View):
    def get(self, request, handle):
        profile = get_object_or_404(Profile, handle__iexact=handle)
        return render(request, "profiles/detail.html", {"profile": profile})
```

---

### `dispatch()`

Entry point before method handlers; common place for auth checks in base classes.

#### 🟢 Beginner Example

```python
from django.http import HttpResponseNotAllowed

class StrictView(View):
    def dispatch(self, request, *args, **kwargs):
        if request.method not in ("GET", "HEAD"):
            return HttpResponseNotAllowed(["GET", "HEAD"])
        return super().dispatch(request, *args, **kwargs)
```

#### 🟡 Intermediate Example — Attach request attributes

```python
class TenantView(View):
    def dispatch(self, request, *args, **kwargs):
        request.tenant = resolve_tenant(request)
        return super().dispatch(request, *args, **kwargs)
```

#### 🔴 Expert Example — API error shaping

```text
DRF uses its own dispatch; for plain CBVs return JsonResponse errors consistently.
```

#### 🌍 Real-Time Example — SaaS plan gate

```python
class PlanGatedView(View):
    required_plan = "pro"

    def dispatch(self, request, *args, **kwargs):
        if not user_has_plan(request.user, self.required_plan):
            return redirect("billing:upgrade")
        return super().dispatch(request, *args, **kwargs)
```

---

### `as_view()`

Returns a callable for **`urlpatterns`**.

#### 🟢 Beginner Example

```python
from django.urls import path
from .views import HelloView

urlpatterns = [
    path("hello/", HelloView.as_view()),
]
```

#### 🟡 Intermediate Example — Init kwargs to `as_view` (use sparingly)

```python
path("reports/", ReportView.as_view(report_type="sales")),
```

#### 🔴 Expert Example — Per-request state belongs on `self` in `setup`, not class attrs

```text
Avoid mutable class attributes shared across requests.
```

#### 🌍 Real-Time Example — E-commerce category page

```python
path("c/<slug:slug>/", CategoryView.as_view()),
```

---

### Method Handlers

Implement **`get`**, **`post`**, **`put`**, **`patch`**, **`delete`** as needed.

#### 🟢 Beginner Example

```python
class ContactView(View):
    def get(self, request):
        return render(request, "contact/form.html", {"form": ContactForm()})

    def post(self, request):
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("contact:thanks")
        return render(request, "contact/form.html", {"form": form})
```

#### 🟡 Intermediate Example — Separate validation helpers

```python
class ContactView(View):
    def post(self, request):
        form = ContactForm(request.POST)
        if not form.is_valid():
            return self.invalid(form)
        return self.valid(form)

    def valid(self, form):
        ...
```

#### 🔴 Expert Example — Idempotent POST patterns

```text
Use PRG (post/redirect/get) for form submissions to avoid duplicate actions.
```

#### 🌍 Real-Time Example — Social create post

```python
class PostCreateView(View):
    def post(self, request):
        ...
```

---

### Mixins

Reusable CBV building blocks composed via multiple inheritance.

#### 🟢 Beginner Example — Simple mixin

```python
class JSONResponseMixin:
    def render_json(self, data, status=200):
        return JsonResponse(data, status=status)

class StatsView(JSONResponseMixin, View):
    def get(self, request):
        return self.render_json({"users": User.objects.count()})
```

#### 🟡 Intermediate Example — With Django’s auth mixins (preview of 6.6)

```python
from django.contrib.auth.mixins import LoginRequiredMixin

class DashView(LoginRequiredMixin, View):
    ...
```

#### 🔴 Expert Example — MRO (method resolution order) awareness

```text
Put mixins left of base view: `Mixin, View` per Django docs convention.
```

#### 🌍 Real-Time Example — SaaS audit logging mixin

```python
class AuditMixin:
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        audit_log.record(request.user, self.__class__.__name__)
        return response
```

---

## 6.3 Generic Display Views

### `TemplateView`

Render a static template with optional context.

#### 🟢 Beginner Example

```python
from django.views.generic import TemplateView

class AboutView(TemplateView):
    template_name = "about.html"
```

#### 🟡 Intermediate Example — `get_context_data`

```python
class AboutView(TemplateView):
    template_name = "about.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["version"] = "6.0.3"
        return ctx
```

#### 🔴 Expert Example — Cache template fragments separately

```text
Use `{% cache %}` or CDN for marketing pages; keep view simple.
```

#### 🌍 Real-Time Example — E-commerce marketing landing

```python
class CampaignView(TemplateView):
    template_name = "shop/campaign.html"
```

---

### `ListView`

List model objects with pagination hooks.

#### 🟢 Beginner Example

```python
from django.views.generic import ListView
from shop.models import Product

class ProductListView(ListView):
    model = Product
    template_name = "shop/product_list.html"
    context_object_name = "products"
```

#### 🟡 Intermediate Example — `get_queryset`

```python
class ProductListView(ListView):
    model = Product

    def get_queryset(self):
        return Product.objects.filter(is_active=True).order_by("name")
```

#### 🔴 Expert Example — `paginate_by` + SEO canonical

```python
class ProductListView(ListView):
    paginate_by = 24

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["canonical_path"] = self.request.path
        return ctx
```

#### 🌍 Real-Time Example — Social “followers” list

```python
class FollowersView(ListView):
    template_name = "social/followers.html"
    paginate_by = 50

    def get_queryset(self):
        return Profile.objects.filter(followers__followed=self.profile).order_by("handle")
```

---

### `DetailView`

Fetch object by **`pk`** or **`slug`**.

#### 🟢 Beginner Example

```python
from django.views.generic import DetailView
from shop.models import Product

class ProductDetailView(DetailView):
    model = Product
    template_name = "shop/product_detail.html"
```

#### 🟡 Intermediate Example — `slug_field`

```python
class ArticleDetailView(DetailView):
    model = Article
    slug_field = "slug"
    slug_url_kwarg = "slug"
```

#### 🔴 Expert Example — `get_queryset` scoping

```python
class DocumentDetailView(DetailView):
    model = Document

    def get_queryset(self):
        return Document.objects.filter(workspace=self.request.workspace)
```

#### 🌍 Real-Time Example — SaaS invoice detail

```python
class InvoiceDetailView(DetailView):
    model = Invoice

    def get_queryset(self):
        return Invoice.objects.filter(customer=self.request.user.customer)
```

---

### Customizing Generic Views

Override **`get_queryset`**, **`get_context_data`**, **`get_template_names`**.

#### 🟢 Beginner Example — Alternate template by flag

```python
class PromoProductDetailView(DetailView):
    model = Product

    def get_template_names(self):
        if self.object.on_sale:
            return ["shop/product_detail_sale.html"]
        return ["shop/product_detail.html"]
```

#### 🟡 Intermediate Example — Add related prefetch

```python
class ProductDetailView(DetailView):
    model = Product

    def get_queryset(self):
        return Product.objects.prefetch_related("images", "variants")
```

#### 🔴 Expert Example — `ObjectDoesNotExist` vs 404

```text
`DetailView` raises Http404 automatically when not found if queryset scoped.
```

#### 🌍 Real-Time Example — E-commerce bundle detail

```python
class BundleDetailView(DetailView):
    model = Bundle

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["savings_cents"] = self.object.list_savings_cents()
        return ctx
```

---

### Pagination

**`ListView.paginate_by`** or **`Paginator`** manually.

#### 🟢 Beginner Example — `ListView`

```python
class OrderHistoryView(ListView):
    paginate_by = 20

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-placed_at")
```

#### 🟡 Intermediate Example — Manual paginator

```python
from django.core.paginator import Paginator

def listing(request):
    qs = Post.objects.all().order_by("-id")
    page = Paginator(qs, 25).get_page(request.GET.get("page") or 1)
    return render(request, "blog/list.html", {"page": page})
```

#### 🔴 Expert Example — Keyset pagination for huge feeds

```text
For very large social feeds, use cursor-based pagination, not OFFSET.
```

#### 🌍 Real-Time Example — Social notifications

```python
class NotificationListView(ListView):
    paginate_by = 30

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")
```

---

## 6.4 Generic Editing Views

### `CreateView`

Display form on GET, save on POST.

#### 🟢 Beginner Example

```python
from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from shop.models import Product
from shop.forms import ProductForm

class ProductCreateView(CreateView):
    model = Product
    form_class = ProductForm
    template_name = "shop/product_form.html"
    success_url = reverse_lazy("shop:list")
```

#### 🟡 Intermediate Example — `form_valid` for owner

```python
class PostCreateView(CreateView):
    model = Post
    fields = ["title", "body"]

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)
```

#### 🔴 Expert Example — Transaction + side effects

```python
from django.db import transaction

class PostCreateView(CreateView):
    @transaction.atomic
    def form_valid(self, form):
        response = super().form_valid(form)
        enqueue_index_job(self.object.id)
        return response
```

#### 🌍 Real-Time Example — SaaS “create project”

```python
class ProjectCreateView(CreateView):
    model = Project
    fields = ["name"]

    def form_valid(self, form):
        form.instance.workspace = self.request.workspace
        return super().form_valid(form)
```

---

### `UpdateView`

Load existing object, edit, save.

#### 🟢 Beginner Example

```python
class ProductUpdateView(UpdateView):
    model = Product
    fields = ["name", "price_cents"]
    template_name = "shop/product_form.html"
```

#### 🟡 Intermediate Example — Permission scoping queryset

```python
class PostUpdateView(UpdateView):
    model = Post
    fields = ["title", "body"]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)
```

#### 🔴 Expert Example — Optimistic concurrency with `updated_at`

```text
Use `select_for_update` or version field to detect stale edits in `form_valid`.
```

#### 🌍 Real-Time Example — E-commerce vendor edits SKU

```python
class VendorProductUpdateView(UpdateView):
    model = Product

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user.vendor_profile)
```

---

### `DeleteView`

Confirm on POST (template shows form).

#### 🟢 Beginner Example

```python
from django.views.generic.edit import DeleteView

class PostDeleteView(DeleteView):
    model = Post
    template_name = "blog/post_confirm_delete.html"
    success_url = reverse_lazy("blog:list")
```

#### 🟡 Intermediate Example — `get_queryset` scope

```python
class PostDeleteView(DeleteView):
    model = Post

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)
```

#### 🔴 Expert Example — Soft delete instead

```python
from django.http import HttpResponseRedirect
from django.utils import timezone
from django.views.generic.edit import DeleteView

class PostDeleteView(DeleteView):
    model = Post

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.deleted_at = timezone.now()
        self.object.save(update_fields=["deleted_at"])
        return HttpResponseRedirect(self.get_success_url())
```

#### 🌍 Real-Time Example — Social account deactivation

```python
class DeactivateView(DeleteView):
    template_name = "accounts/deactivate_confirm.html"
```

---

### `FormView`

Non-model form handling.

#### 🟢 Beginner Example

```python
from django.views.generic import FormView

class ContactView(FormView):
    template_name = "contact.html"
    form_class = ContactForm
    success_url = "/thanks/"

    def form_valid(self, form):
        send_mail(**form.cleaned_data)
        return super().form_valid(form)
```

#### 🟡 Intermediate Example — Pass user into form

```python
def get_form_kwargs(self):
    kwargs = super().get_form_kwargs()
    kwargs["user"] = self.request.user
    return kwargs
```

#### 🔴 Expert Example — Multi-step wizard (conceptual)

```text
Use `django-formtools` or a state machine for complex wizards.
```

#### 🌍 Real-Time Example — SaaS “invite teammates”

```python
class InviteView(FormView):
    form_class = InviteForm
    success_url = reverse_lazy("team:list")
```

---

### `get_success_url()`

Dynamic redirect targets.

#### 🟢 Beginner Example

```python
class PostCreateView(CreateView):
    model = Post
    fields = ["title", "body"]

    def get_success_url(self):
        return self.object.get_absolute_url()
```

#### 🟡 Intermediate Example — Query param passthrough

```python
def get_success_url(self):
    next_url = self.request.GET.get("next")
    if next_url:
        return next_url
    return reverse("home")
```

#### 🔴 Expert Example — Validate `next` to avoid open redirects

```python
from django.utils.http import url_has_allowed_host_and_scheme

def get_success_url(self):
    next_url = self.request.POST.get("next") or self.request.GET.get("next")
    if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={self.request.get_host()}):
        return next_url
    return reverse("dashboard")
```

#### 🌍 Real-Time Example — E-commerce return to cart

```python
def get_success_url(self):
    return reverse("cart:detail")
```

---

## 6.5 View Decorators

### `@login_required`

Redirects anonymous users to login.

#### 🟢 Beginner Example

```python
from django.contrib.auth.decorators import login_required

@login_required
def inbox(request):
    return render(request, "inbox.html")
```

#### 🟡 Intermediate Example — `login_url` + `redirect_field_name`

```python
@login_required(login_url="/accounts/login/", redirect_field_name="next")
def checkout(request):
    ...
```

#### 🔴 Expert Example — 401 for APIs

```text
Use DRF authentication or return JsonResponse 401 instead of HTML redirect.
```

#### 🌍 Real-Time Example — SaaS settings page

```python
@login_required
def workspace_settings(request, slug):
    ...
```

---

### `@permission_required`

Checks Django model permissions.

#### 🟢 Beginner Example

```python
from django.contrib.auth.decorators import permission_required

@permission_required("shop.change_product", raise_exception=True)
def restock(request, pk):
    ...
```

#### 🟡 Intermediate Example — Multiple permissions

```python
@permission_required(["auth.change_user", "auth.view_user"], raise_exception=True)
def user_admin_tool(request):
    ...
```

#### 🔴 Expert Example — Object-level permissions

```text
Django default perms are model-level; object rules need django-guardian or custom checks.
```

#### 🌍 Real-Time Example — E-commerce vendor admin

```python
@permission_required("catalog.publish_product", raise_exception=True)
def publish(request, pk):
    ...
```

---

### `@require_http_methods`

(See 6.1.)

#### 🟢 Beginner Example

```python
@require_http_methods(["GET"])
def robots(request):
    return HttpResponse("User-agent: *\nDisallow:\n", content_type="text/plain")
```

#### 🟡 Intermediate Example

```python
@require_http_methods(["POST"])
def logout_post_only(request):
    ...
```

#### 🔴 Expert Example — HEAD for health checks

```python
@require_http_methods(["GET", "HEAD"])
def healthz(request):
    return HttpResponse("ok")
```

#### 🌍 Real-Time Example — Social like button

```python
@require_http_methods(["POST"])
def like(request, post_id):
    ...
```

---

### `@never_cache`

Sets headers to discourage caching (sensitive pages).

#### 🟢 Beginner Example

```python
from django.views.decorators.cache import never_cache

@never_cache
def sensitive_dashboard(request):
    return render(request, "dash.html")
```

#### 🟡 Intermediate Example — Combine with auth

```python
@never_cache
@login_required
def billing_portal(request):
    ...
```

#### 🔴 Expert Example — CDN bypass for HTML

```text
Also configure Cache-Control at reverse proxy for defense in depth.
```

#### 🌍 Real-Time Example — SaaS MFA enrollment

```python
@never_cache
@login_required
def enroll_mfa(request):
    ...
```

---

### Custom Decorators

#### 🟢 Beginner Example — Timing header

```python
import time
from functools import wraps

def timed(view):
    @wraps(view)
    def _wrapped(request, *args, **kwargs):
        t0 = time.perf_counter()
        response = view(request, *args, **kwargs)
        dt = (time.perf_counter() - t0) * 1000
        response["Server-Timing"] = f"app;dur={dt:.2f}"
        return response
    return _wrapped
```

#### 🟡 Intermediate Example — Feature flag

```python
def feature_required(flag: str):
    def deco(view):
        @wraps(view)
        def _wrapped(request, *args, **kwargs):
            if not flags.enabled(flag, request.user):
                raise Http404()
            return view(request, *args, **kwargs)
        return _wrapped
    return deco
```

#### 🔴 Expert Example — Async-compatible decorators

```text
For async views, use async-aware wrappers or middleware.
```

#### 🌍 Real-Time Example — E-commerce maintenance mode

```python
def maintenance_exempt(view):
    @wraps(view)
    def _wrapped(request, *args, **kwargs):
        if settings.MAINTENANCE and not request.user.is_staff:
            return render(request, "503.html", status=503)
        return view(request, *args, **kwargs)
    return _wrapped
```

---

## 6.6 View Mixins

### `LoginRequiredMixin`

CBV equivalent of **`login_required`**.

#### 🟢 Beginner Example

```python
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

class InboxView(LoginRequiredMixin, TemplateView):
    template_name = "inbox.html"
```

#### 🟡 Intermediate Example — `login_url`

```python
class InboxView(LoginRequiredMixin, TemplateView):
    login_url = "/login/"
```

#### 🔴 Expert Example — Mixin order

```text
Place `LoginRequiredMixin` left of `TemplateView`.
```

#### 🌍 Real-Time Example — SaaS app shell

```python
class AppShellView(LoginRequiredMixin, TemplateView):
    template_name = "app/shell.html"
```

---

### `PermissionRequiredMixin`

#### 🟢 Beginner Example

```python
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.views.generic import ListView

class ProductAdminListView(PermissionRequiredMixin, ListView):
    permission_required = "shop.view_product"
    model = Product
```

#### 🟡 Intermediate Example — Multiple permissions

```python
class UserAuditView(PermissionRequiredMixin, TemplateView):
    permission_required = ("auth.view_user", "auth.change_user")
    raise_exception = True
```

#### 🔴 Expert Example — `get_permission_required` dynamic

```python
def get_permission_required(self):
    return [f"{self.model._meta.app_label}.change_{self.model._meta.model_name}"]
```

#### 🌍 Real-Time Example — E-commerce refunds desk

```python
class RefundQueueView(PermissionRequiredMixin, ListView):
    permission_required = "orders.refund_order"
```

---

### `UserPassesTestMixin`

Arbitrary test function.

#### 🟢 Beginner Example

```python
from django.contrib.auth.mixins import UserPassesTestMixin

class StaffOnlyView(UserPassesTestMixin, TemplateView):
    template_name = "staff.html"

    def test_func(self):
        return self.request.user.is_staff
```

#### 🟡 Intermediate Example — Object owner test in UpdateView

```python
class PostUpdateView(UserPassesTestMixin, UpdateView):
    model = Post
    fields = ["title", "body"]

    def test_func(self):
        return self.get_object().author_id == self.request.user.id
```

#### 🔴 Expert Example — Combine with `get_redirect_url`

```python
def handle_no_permission(self):
    return redirect("upgrade")
```

#### 🌍 Real-Time Example — Social private group

```python
class GroupPrivateView(UserPassesTestMixin, DetailView):
    def test_func(self):
        return self.request.user.groups.filter(name="beta").exists()
```

---

### Custom Mixins

#### 🟢 Beginner Example — Attach common context

```python
class NavMixin:
    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["nav_items"] = build_nav(self.request.user)
        return ctx
```

#### 🟡 Intermediate Example — Rate limit (conceptual)

```text
Prefer middleware or DRF throttling for robust rate limits.
```

#### 🔴 Expert Example — `MultipleObjectMixin` coordination

```text
Understand base generic mixins before overriding `get_context_data` chains.
```

#### 🌍 Real-Time Example — SaaS breadcrumbs

```python
class BreadcrumbMixin:
    breadcrumb_label = "Home"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.setdefault("breadcrumbs", []).append(self.breadcrumb_label)
        return ctx
```

---

### Mixin Order

Rule of thumb: **mixins left**, base generic view **right**.

#### 🟢 Beginner Example

```python
class SafeDetailView(LoginRequiredMixin, DetailView):
    model = Document
```

#### 🟡 Intermediate Example — Three mixins

```python
class EditorView(LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    permission_required = "cms.change_page"
```

#### 🔴 Expert Example — MRO debugging

```python
print(EditorView.mro())
```

#### 🌍 Real-Time Example — E-commerce vendor portal

```python
class VendorMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        return hasattr(self.request.user, "vendor_profile")

class VendorOrderDetailView(VendorMixin, DetailView):
    model = Order
```

---

## 6.7 View Context

### `get_context_data()`

Merge context from parent classes.

#### 🟢 Beginner Example

```python
class HomeView(TemplateView):
    template_name = "home.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["featured"] = Product.objects.filter(featured=True)[:6]
        return ctx
```

#### 🟡 Intermediate Example — `**kwargs` includes URL captured values

```python
def get_context_data(self, **kwargs):
    ctx = super().get_context_data(**kwargs)
    ctx["slug"] = kwargs.get("slug")
    return ctx
```

#### 🔴 Expert Example — Avoid duplicate queries

```text
Reuse `self.object` in `DetailView` context instead of re-querying.
```

#### 🌍 Real-Time Example — Social profile stats

```python
def get_context_data(self, **kwargs):
    ctx = super().get_context_data(**kwargs)
    profile = self.object
    ctx["stats"] = {"followers": profile.followers.count()}
    return ctx
```

---

### Adding Context

Use mixins, context processors, or explicit dict merges.

#### 🟢 Beginner Example — `render` shortcut

```python
return render(request, "page.html", {"form": form, "title": "Edit"})
```

#### 🟡 Intermediate Example — `extra_context` on CBV

```python
class PageView(TemplateView):
    template_name = "page.html"
    extra_context = {"title": "About"}
```

#### 🔴 Expert Example — `context_object_name`

```python
class ProductListView(ListView):
    model = Product
    context_object_name = "products"
```

#### 🌍 Real-Time Example — SaaS feature flags in every page

```text
Use context processors sparingly—they run for all template responses.
```

---

### Context Processors

Add global template variables via **`TEMPLATES` `context_processors`**.

#### 🟢 Beginner Example

```python
def branding(request):
    return {"BRAND": "Acme SaaS"}
```

#### 🟡 Intermediate Example — Register in settings

```python
TEMPLATES[0]["OPTIONS"]["context_processors"] += ["myapp.context_processors.branding"]
```

#### 🔴 Expert Example — Avoid heavy queries in processors

```text
Processors run often—cache stable values or read from request middleware cache.
```

#### 🌍 Real-Time Example — E-commerce cart count badge

```python
def cart(request):
    if request.user.is_authenticated:
        return {"cart_qty": cart_service.qty(request.user)}
    return {"cart_qty": 0}
```

---

### Request in Context

**`request`** is available when using **`django.template.context_processors.request`**.

#### 🟢 Beginner Example — In template

```django
{% if request.user.is_authenticated %}Hi {{ request.user }}{% endif %}
```

#### 🟡 Intermediate Example — Pass explicitly in FBV

```python
return render(request, "x.html", {"request": request})  # usually unnecessary if processor enabled
```

#### 🔴 Expert Example — Avoid leaking internal fields in cached fragments

```text
Cache keys must include user/tenant when content is personalized.
```

#### 🌍 Real-Time Example — SaaS impersonation banner

```django
{% if request.session.is_impersonating %}Impersonation mode{% endif %}
```

---

### Template Context

**`RequestContext`** merges processors; **`render()`** uses it by default.

#### 🟢 Beginner Example

```python
from django.template import loader

def legacy(request):
    html = loader.render_to_string("x.html", {}, request=request)
    return HttpResponse(html)
```

#### 🟡 Intermediate Example — `Context` vs `RequestContext`

```text
Prefer `render()`—it wires request automatically.
```

#### 🔴 Expert Example — JSON views skip template context

```python
return JsonResponse({"ok": True})  # no template processors
```

#### 🌍 Real-Time Example — E-commerce hybrid

```text
SSR pages use rich context; mobile app hits DRF without template context.
```

---

## 6.8 Advanced View Patterns

### Multiple Forms

Handle two forms in one POST using **prefixes** or separate endpoints.

#### 🟢 Beginner Example — Prefixes

```python
class DualFormView(View):
    def post(self, request):
        a = ProfileForm(request.POST, prefix="a")
        b = PreferencesForm(request.POST, prefix="b")
        ...
```

#### 🟡 Intermediate Example — Separate URLs

```text
Simpler: `/profile/` and `/preferences/` each with one form.
```

#### 🔴 Expert Example — Wizard

```text
Use session-stored step data for complex checkout flows.
```

#### 🌍 Real-Time Example — E-commerce checkout (shipping + billing)

```python
def checkout_post(request):
    shipping = ShippingForm(request.POST, prefix="ship")
    billing = BillingForm(request.POST, prefix="bill")
```

---

### Ajax Responses

Return **`JsonResponse`** or partial HTML for **`HX-Request`** / fetch clients.

#### 🟢 Beginner Example

```python
from django.http import JsonResponse
from django.views.decorators.http import require_POST

@require_POST
def toggle_like(request, post_id):
    liked = likes_service.toggle(request.user, post_id)
    return JsonResponse({"liked": liked})
```

#### 🟡 Intermediate Example — CSRF with JS

```text
Send `X-CSRFToken` header from cookie for POST requests.
```

#### 🔴 Expert Example — Partial template render

```python
from django.template.loader import render_to_string

html = render_to_string("comments/_item.html", {"comment": comment}, request=request)
return JsonResponse({"html": html})
```

#### 🌍 Real-Time Example — Social infinite scroll

```python
def feed_page(request):
    page = int(request.GET.get("page", "1"))
    items = feed_service.page(request.user, page)
    return render(request, "feed/_items.html", {"items": items})
```

---

### File Download Views

Use **`FileResponse`** with **`as_attachment=True`**.

#### 🟢 Beginner Example

```python
from django.http import FileResponse
import pathlib

def download_sample(request):
    path = pathlib.Path("/var/app/static/samples/guide.pdf")
    return FileResponse(open(path, "rb"), as_attachment=True, filename="guide.pdf")
```

#### 🟡 Intermediate Example — From storage

```python
def export_invoice_pdf(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk, customer=request.user.customer)
    pdf_path = billing.render_pdf(invoice)
    return FileResponse(open(pdf_path, "rb"), as_attachment=True, filename=f"inv-{pk}.pdf")
```

#### 🔴 Expert Example — Stream from object storage

```text
Use signed URLs to S3 instead of proxying large files through Django.
```

#### 🌍 Real-Time Example — SaaS GDPR export

```python
def export_my_data(request):
    zip_path = privacy.build_user_archive(request.user)
    return FileResponse(open(zip_path, "rb"), as_attachment=True, filename="my-data.zip")
```

---

### Streaming Responses

**`StreamingHttpResponse`** for large generated payloads.

#### 🟢 Beginner Example

```python
from django.http import StreamingHttpResponse

def stream_numbers(_request):
    def gen():
        for i in range(5):
            yield f"{i}\n".encode()
    return StreamingHttpResponse(gen(), content_type="text/plain")
```

#### 🟡 Intermediate Example — CSV stream

```python
import csv
from io import StringIO

def stream_csv(_request):
    def rows():
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["id", "name"])
        yield buffer.getvalue().encode()
        buffer.seek(0)
        buffer.truncate(0)
        for row in Product.objects.iterator():
            writer.writerow([row.pk, row.name])
            yield buffer.getvalue().encode()
            buffer.seek(0)
            buffer.truncate(0)

    return StreamingHttpResponse(rows(), content_type="text/csv")
```

#### 🔴 Expert Example — Backpressure and timeouts

```text
Tune reverse proxy buffering; long streams need worker timeouts adjusted.
```

#### 🌍 Real-Time Example — E-commerce admin export

```text
Stream millions of rows from replica DB to avoid memory spikes.
```

---

### Custom Response Types

Return **`HttpResponse`** subclasses with correct **`content_type`** and status.

#### 🟢 Beginner Example — 204 No Content

```python
from django.http import HttpResponse

def acknowledge(_request):
    return HttpResponse(status=204)
```

#### 🟡 Intermediate Example — 410 Gone

```python
def retired_product(_request, slug):
    return HttpResponse("This product is retired.", status=410)
```

#### 🔴 Expert Example — Problem+json errors (API style)

```python
import json
from django.http import HttpResponse

def problem(title, status, detail):
    payload = {"title": title, "status": status, "detail": detail}
    return HttpResponse(json.dumps(payload), status=status, content_type="application/problem+json")
```

#### 🌍 Real-Time Example — SaaS API versioning sunset

```python
def v1_removed(_request):
    return problem("Gone", 410, "API v1 has been removed. Use /api/v2/.")
```

---

## Best Practices

- Prefer **generic CBVs** for CRUD; drop to FBVs when clearer.
- Keep **business logic** out of templates—use services/selectors.
- Use **`LoginRequiredMixin` / `PermissionRequiredMixin`** consistently in CBVs.
- Apply **`@require_http_methods`** to mutating endpoints.
- Return **appropriate status codes** for APIs (`404`, `403`, `409`).
- Use **PRG** for form POST success flows.
- Add **tests** for permissions and queryset scoping on detail/update views.

---

## Common Mistakes to Avoid

- Wrong **mixin order** causing auth checks to never run.
- Using **`get_success_url`** with unsanitized **`next`** (open redirect).
- **N+1** in `get_context_data` without prefetch.
- **`CreateView`** without setting **`author`** / tenant fields.
- Returning **`QuerySet`** directly as HTTP response (use serializer/template).
- **Caching** personalized pages without `Vary` headers.
- Mixing **sync ORM** inside **async** views without `sync_to_async`.

---

## Comparison Tables

### FBV vs CBV

| Style | Pros                         | Cons                    |
| ----- | ---------------------------- | ----------------------- |
| FBV   | Obvious flow, easy decorators| Repetition for CRUD     |
| CBV   | DRY for generic patterns     | MRO/mixin complexity    |

### Generic display vs editing

| View         | Purpose            |
| ------------ | ------------------ |
| TemplateView | Static-ish pages   |
| ListView     | Object lists       |
| DetailView   | Single object      |
| CreateView   | Create             |
| UpdateView   | Update             |
| DeleteView   | Delete             |
| FormView     | Non-model forms    |

### Decorator vs mixin mapping

| Decorator           | Mixin equivalent            |
| ------------------- | --------------------------- |
| `login_required`    | `LoginRequiredMixin`        |
| `permission_required` | `PermissionRequiredMixin` |
| `user_passes_test`  | `UserPassesTestMixin`       |

---

*For JSON APIs at scale, pair these view patterns with **Django REST Framework** serializers, pagination, and authentication classes.*
