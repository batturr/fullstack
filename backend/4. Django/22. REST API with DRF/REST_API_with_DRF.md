# REST API with Django REST Framework (DRF)

This guide treats Django **6.0.3** (Python **3.12–3.14**) and **Django REST Framework** as a TypeScript-style reference: crisp headings, progressive examples, and production-shaped patterns. You will learn how to design REST APIs, configure serializers and views, filter and paginate responses, authenticate clients, enforce permissions and throttling, and test APIs end-to-end. Examples span **e-commerce**, **social**, and **SaaS** domains so you can map concepts to real products.

---

## 📑 Table of Contents

1. [22.1 REST Fundamentals](#221-rest-fundamentals)
2. [22.2 DRF Installation and Setup](#222-drf-installation-and-setup)
3. [22.3 Serializers](#223-serializers)
4. [22.4 DRF Views](#224-drf-views)
5. [22.5 Filters and Search](#225-filters-and-search)
6. [22.6 Pagination](#226-pagination)
7. [22.7 Authentication in DRF](#227-authentication-in-drf)
8. [22.8 Permissions and Throttling](#228-permissions-and-throttling)
9. [22.9 API Testing](#229-api-testing)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
12. [Comparison Tables](#comparison-tables)

---

## 22.1 REST Fundamentals

### 22.1.1 REST Principles

REST maps resources to URLs and uses HTTP semantics. State lives on the server or in tokens; each request carries enough context (headers, body) to be understood alone.

**🟢 Beginner Example — resource naming**

```python
# Good REST-ish paths (nouns, plural collections)
# GET    /api/products/
# GET    /api/products/{id}/
# POST   /api/products/
# PATCH  /api/products/{id}/
# DELETE /api/products/{id}/
```

**🟡 Intermediate Example — idempotent DELETE**

```python
from django.http import Http404
from rest_framework.response import Response
from rest_framework import status

def delete_line(request, line_id):
    deleted, _ = CartLine.objects.filter(pk=line_id, cart__user=request.user).delete()
    if not deleted:
        raise Http404()
    return Response(status=status.HTTP_204_NO_CONTENT)
```

**🔴 Expert Example — HATEOAS-style links in SaaS billing**

```python
class SubscriptionSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    plan = serializers.CharField()
    status = serializers.CharField()
    links = serializers.SerializerMethodField()

    def get_links(self, obj):
        base = self.context["request"].build_absolute_uri(f"/api/billing/subscriptions/{obj.id}/")
        return {
            "self": base,
            "cancel": f"{base}cancel/" if obj.status == "active" else None,
            "invoices": f"{base}invoices/",
        }
```

**🌍 Real-Time Example — social feed resource graph**

```python
# Feed item is a hypermedia node: post, author, reactions count, comment thread
# GET /api/feed/?cursor=... returns { results, next_cursor }
# Each item: { "type": "post", "url": "/api/posts/42/", "author_url": "/api/users/7/" }
```

### 22.1.2 HTTP Methods

Use **GET** (read), **POST** (create), **PUT** (replace), **PATCH** (partial update), **DELETE** (remove). **HEAD** and **OPTIONS** support discovery and caching.

**🟢 Beginner Example**

```python
from rest_framework.views import APIView
from rest_framework.response import Response

class PingView(APIView):
    def get(self, request):
        return Response({"ok": True})
```

**🟡 Intermediate Example — e-commerce cart POST**

```python
class CartItemCreateView(APIView):
    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(cart=request.user.cart)
        return Response(CartItemSerializer(item).data, status=201)
```

**🔴 Expert Example — conditional PATCH with If-Match (ETag pattern)**

```python
from rest_framework.exceptions import PreconditionFailed

class ProductUpdateView(APIView):
    def patch(self, request, pk):
        product = Product.objects.get(pk=pk)
        client_etag = request.headers.get("If-Match")
        if client_etag and client_etag != product.etag:
            raise PreconditionFailed("Resource changed; refresh and retry.")
        return Response(ProductSerializer(product).data)
```

**🌍 Real-Time Example — SaaS feature flag toggle**

```python
# PATCH /api/orgs/{id}/flags/realtime_chat/  { "enabled": true }
# Audited, idempotent from client perspective (same body = same outcome)
```

### 22.1.3 Status Codes

**2xx** success, **3xx** redirection (rare in JSON APIs), **4xx** client errors, **5xx** server errors. DRF maps exceptions to sensible codes.

**🟢 Beginner Example**

```python
from rest_framework import status
from rest_framework.response import Response

return Response({"detail": "created"}, status=status.HTTP_201_CREATED)
```

**🟡 Intermediate Example — validation → 400**

```python
serializer.is_valid(raise_exception=True)
```

**🔴 Expert Example — 409 conflict on duplicate SKU**

```python
from rest_framework.exceptions import ValidationError

def create(self, validated_data):
    if Product.objects.filter(sku=validated_data["sku"]).exists():
        raise ValidationError({"sku": "SKU already exists."}, code="conflict")
```

**🌍 Real-Time Example — rate limit 429 with Retry-After**

```python
# Throttling in DRF sets 429; custom exception handler can add Retry-After header
```

### 22.1.4 API Design

Version in URL or header, use consistent envelopes, document errors, prefer pagination for lists, and keep field names stable for mobile clients.

**🟢 Beginner Example — JSON field naming**

```python
# Use snake_case in Python; optional camelCase via custom renderer/parser
```

**🟡 Intermediate Example — list envelope**

```python
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
```

**🔴 Expert Example — SaaS multi-tenant header**

```python
# X-Org-ID: uuid — middleware sets request.org for queryset scoping
class OrgScopedViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return super().get_queryset().filter(org=self.request.org)
```

**🌍 Real-Time Example — e-commerce checkout API**

```python
# POST /api/checkout/sessions/  → payment provider session id
# GET  /api/orders/{id}/        → fulfillment state machine as read-only fields
```

### 22.1.5 Versioning

DRF supports **URL**, **namespace**, **host**, **query param**, and **Accept header** versioning.

**🟢 Beginner Example — URL prefix**

```python
urlpatterns = [
    path("api/v1/", include("shop.api.v1.urls")),
    path("api/v2/", include("shop.api.v2.urls")),
]
```

**🟡 Intermediate Example — DRF URLPathVersioning**

```python
REST_FRAMEWORK = {
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "DEFAULT_VERSION": "v1",
    "ALLOWED_VERSIONS": ("v1", "v2"),
    "VERSION_PARAM": "version",
}
```

**🔴 Expert Example — deprecate v1 with Sunset header**

```python
class DeprecationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/api/v1/"):
            response["Sunset"] = "Sat, 01 Jan 2028 00:00:00 GMT"
            response["Deprecation"] = "true"
        return response
```

**🌍 Real-Time Example — mobile app forces v2 for live chat**

```python
# Accept: application/vnd.myapp+json; version=2
```

---

## 22.2 DRF Installation and Setup

### 22.2.1 Installing DRF

**🟢 Beginner Example**

```bash
pip install djangorestframework
pip install django-filter djangorestframework-simplejwt
```

**🟡 Intermediate Example — requirements pin (SaaS)**

```text
Django==6.0.3
djangorestframework>=3.15
django-filter
```

**🔴 Expert Example — OpenAPI**

```bash
pip install drf-spectacular
```

**🌍 Real-Time Example — lockfile in CI**

```yaml
# Install from poetry.lock / uv.lock for reproducible API builds
```

### 22.2.2 INSTALLED_APPS

**🟢 Beginner Example**

```python
INSTALLED_APPS = [
    "rest_framework",
    "django_filters",
]
```

**🟡 Intermediate Example**

```python
INSTALLED_APPS += ["rest_framework.authtoken"]
```

**🔴 Expert Example — split settings**

```python
# base.py: rest_framework; local.py adds drf_spectacular in dev
```

**🌍 Real-Time Example**

```python
# Production: omit debug-only apps; keep authtoken if legacy clients need it
```

### 22.2.3 Initial Configuration

**🟢 Beginner Example**

```python
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
}
```

**🟡 Intermediate Example**

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

**🔴 Expert Example**

```python
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "myapp.api.exceptions.custom_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}
```

**🌍 Real-Time Example — e-commerce BFF**

```python
# Stricter CORS; DRF only on /api/*
```

### 22.2.4 Permission Classes

**🟢 Beginner Example**

```python
from rest_framework.permissions import IsAuthenticated

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]
```

**🟡 Intermediate Example — object-level**

```python
class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
```

**🔴 Expert Example — SaaS role matrix**

```python
class HasPlanFeature(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.org.plan.features.get("api_access", False)
```

**🌍 Real-Time Example — social private posts**

```python
class IsFriendOrPublic(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not obj.is_private:
            return True
        return Friendship.objects.filter(
            from_user=request.user, to_user=obj.author, accepted=True
        ).exists()
```

### 22.2.5 Authentication Classes

**🟢 Beginner Example**

```python
"DEFAULT_AUTHENTICATION_CLASSES": [
    "rest_framework.authentication.SessionAuthentication",
]
```

**🟡 Intermediate Example**

```python
"rest_framework.authentication.TokenAuthentication",
```

**🔴 Expert Example — custom API key**

```python
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class ApiKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.META.get("HTTP_AUTHORIZATION", "")
        if not header.startswith("Api-Key "):
            return None
        key = header.split(" ", 1)[1].strip()
        org = Organization.objects.filter(api_key=key, active=True).first()
        if not org:
            raise AuthenticationFailed("Invalid API key")
        return (org.service_user, None)
```

**🌍 Real-Time Example — JWT for WebSocket companion REST**

```python
# Same issuer as WS auth; short-lived access, refresh rotation
```

---

## 22.3 Serializers

### 22.3.1 Basic Serializers

**🟢 Beginner Example**

```python
from rest_framework import serializers

class HelloSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
```

**🟡 Intermediate Example**

```python
class ProductSerializer(serializers.Serializer):
    name = serializers.CharField()
    price_cents = serializers.IntegerField()
    price_display = serializers.SerializerMethodField()

    def get_price_display(self, obj):
        return f"${obj['price_cents'] / 100:.2f}"
```

**🔴 Expert Example**

```python
class DiscountSerializer(serializers.Serializer):
    percent = serializers.IntegerField(min_value=0, max_value=100)
    fixed_cents = serializers.IntegerField(min_value=0)

    def validate(self, attrs):
        if attrs["percent"] and attrs["fixed_cents"]:
            raise serializers.ValidationError("Choose percent OR fixed discount.")
        return attrs
```

**🌍 Real-Time Example — SaaS seat checkout**

```python
class CheckoutSerializer(serializers.Serializer):
    seats = serializers.IntegerField(min_value=1)
    plan_id = serializers.UUIDField()

    def validate(self, attrs):
        plan = Plan.objects.get(pk=attrs["plan_id"])
        if attrs["seats"] > plan.max_seats:
            raise serializers.ValidationError({"seats": "Exceeds plan limit."})
        return attrs
```

### 22.3.2 ModelSerializer

**🟢 Beginner Example**

```python
class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ["id", "title", "body", "created_at"]
        read_only_fields = ["id", "created_at"]
```

**🟡 Intermediate Example**

```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        extra_kwargs = {"email": {"required": True}}
```

**🔴 Expert Example — nested create**

```python
class LineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineItem
        fields = ["product_id", "qty"]

class OrderSerializer(serializers.ModelSerializer):
    lines = LineItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["id", "lines"]

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        order = Order.objects.create(**validated_data)
        for line in lines_data:
            LineItem.objects.create(order=order, **line)
        return order
```

**🌍 Real-Time Example — e-commerce order import**

```python
# Bulk create from ERP JSON inside transactional serializer.create()
```

### 22.3.3 Field Types

**🟢 Beginner Example**

```python
slug = serializers.SlugField()
published = serializers.BooleanField()
```

**🟡 Intermediate Example**

```python
tags = serializers.ListField(child=serializers.CharField(), allow_empty=False)
meta = serializers.JSONField()
```

**🔴 Expert Example**

```python
price = serializers.DecimalField(max_digits=12, decimal_places=2)
```

**🌍 Real-Time Example**

```python
location = serializers.JSONField(required=False)
```

### 22.3.4 Serializer Validation

**🟢 Beginner Example**

```python
def validate_username(value):
    if value.lower() in RESERVED:
        raise serializers.ValidationError("Reserved username")
    return value
```

**🟡 Intermediate Example**

```python
def validate_email(self, value):
    if User.objects.filter(email__iexact=value).exists():
        raise serializers.ValidationError("Email taken")
    return value
```

**🔴 Expert Example**

```python
def validate(self, attrs):
    return attrs
```

**🌍 Real-Time Example — VAT by country**

```python
def validate_vat_id(self, value):
    country = self.initial_data.get("country")
    if not vat_validator(country, value):
        raise serializers.ValidationError("Invalid VAT ID")
    return value
```

### 22.3.5 Nested Serializers

**🟢 Beginner Example**

```python
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "name"]

class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ["id", "title", "author"]
```

**🟡 Intermediate Example**

```python
class PostWriteSerializer(serializers.ModelSerializer):
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=Author.objects.all(), source="author"
    )

    class Meta:
        model = Post
        fields = ["title", "author_id"]
```

**🔴 Expert Example**

```python
def get_serializer_class(self):
    if self.action == "retrieve" and self.request.query_params.get("expand") == "author":
        return PostDetailSerializer
    return PostListSerializer
```

**🌍 Real-Time Example**

```python
class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = ["carrier", "tracking_number", "status"]

class OrderDetailSerializer(serializers.ModelSerializer):
    shipments = ShipmentSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "total_cents", "shipments"]
```

---

## 22.4 DRF Views

### 22.4.1 APIView

**🟢 Beginner Example**

```python
from rest_framework.views import APIView
from rest_framework.response import Response

class HealthView(APIView):
    def get(self, request):
        return Response({"status": "up"})
```

**🟡 Intermediate Example**

```python
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
```

**🔴 Expert Example**

```python
def get(self, request):
    if request.accepted_renderer.format == "csv":
        return self.csv_response()
    return Response(self.serialize_json())
```

**🌍 Real-Time Example — usage metering**

```python
class UsageView(APIView):
    def post(self, request):
        ...
```

### 22.4.2 Concrete Generic Views

**🟢 Beginner Example**

```python
from rest_framework import generics

class ProductListCreate(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

**🟡 Intermediate Example**

```python
class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

**🔴 Expert Example**

```python
from rest_framework.throttling import UserRateThrottle

class BurstThrottle(UserRateThrottle):
    rate = "30/min"

class OrgInvoiceList(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    throttle_classes = [BurstThrottle]

    def get_queryset(self):
        return Invoice.objects.filter(org=self.request.user.org)
```

**🌍 Real-Time Example**

```python
class NotificationList(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")[:200]
```

### 22.4.3 ViewSets and Routers

**🟢 Beginner Example**

```python
from rest_framework import viewsets

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

**🟡 Intermediate Example**

```python
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
urlpatterns = router.urls
```

**🔴 Expert Example**

```python
def get_queryset(self):
    qs = Product.objects.all()
    if self.action == "list":
        return qs.filter(active=True)
    return qs
```

**🌍 Real-Time Example**

```python
def perform_destroy(self, instance):
    instance.soft_delete()
```

### 22.4.4 Action Methods

**🟢 Beginner Example**

```python
# ModelViewSet provides list, retrieve, create, update, destroy
```

**🟡 Intermediate Example**

```python
def create(self, request, *args, **kwargs):
    response = super().create(request, *args, **kwargs)
    audit_log("resource_created", request.user, response.data["id"])
    return response
```

**🔴 Expert Example**

```python
from rest_framework.decorators import action

class MessageViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=["post"], url_path="bulk-delete")
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])
        Message.objects.filter(user=request.user, id__in=ids).delete()
        return Response(status=204)
```

**🌍 Real-Time Example**

```python
@action(detail=True, methods=["post"])
def release_hold(self, request, pk=None):
    payment = self.get_object()
    payment.release_authorization()
    return Response(PaymentSerializer(payment).data)
```

### 22.4.5 Custom Actions

**🟢 Beginner Example**

```python
@action(detail=True, methods=["get"])
def summary(self, request, pk=None):
    obj = self.get_object()
    return Response({"id": obj.id, "name": obj.name})
```

**🟡 Intermediate Example**

```python
@action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
def refund(self, request, pk=None):
    ...
```

**🔴 Expert Example**

```python
@action(detail=True, methods=["get"])
def followers(self, request, pk=None):
    user = self.get_object()
    qs = user.followers.all()
    page = self.paginate_queryset(qs)
    serializer = UserMiniSerializer(page, many=True)
    return self.get_paginated_response(serializer.data)
```

**🌍 Real-Time Example**

```python
@action(detail=True, methods=["post"], url_path="rotate-secret")
def rotate_secret(self, request, pk=None):
    hook = self.get_object()
    hook.rotate_secret()
    return Response({"secret": hook.plaintext_secret_once})
```

---

## 22.5 Filters and Search

### 22.5.1 Simple Filtering (query_params)

**🟢 Beginner Example**

```python
def get_queryset(self):
    qs = Product.objects.all()
    category = self.request.query_params.get("category")
    if category:
        qs = qs.filter(category__slug=category)
    return qs
```

**🟡 Intermediate Example**

```python
if self.request.query_params.get("in_stock") == "1":
    qs = qs.filter(stock__gt=0)
```

**🔴 Expert Example**

```python
ALLOWED_ORDER = {"price", "-price", "created_at"}
order = self.request.query_params.get("ordering", "created_at")
if order not in ALLOWED_ORDER:
    order = "created_at"
return qs.order_by(order)
```

**🌍 Real-Time Example**

```python
tag = self.request.query_params.get("tag")
if tag:
    qs = qs.filter(tags__name__iexact=tag)
```

### 22.5.2 SearchFilter

**🟢 Beginner Example**

```python
from rest_framework import filters

class ProductViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description"]
```

**🟡 Intermediate Example**

```python
search_fields = ["=sku", "name"]
```

**🔴 Expert Example**

```python
# Add DB index / pg_trgm for heavy icontains search
```

**🌍 Real-Time Example**

```python
search_fields = ["company_name", "billing_email", "domain"]
```

### 22.5.3 OrderingFilter

**🟢 Beginner Example**

```python
filter_backends = [filters.OrderingFilter]
ordering_fields = ["price", "created_at"]
ordering = ["-created_at"]
```

**🟡 Intermediate Example**

```python
# ?ordering=-price,name
```

**🔴 Expert Example**

```python
ordering_fields = ["created_at", "status"]
```

**🌍 Real-Time Example**

```python
ordering = ["-featured", "price"]
```

### 22.5.4 Custom Filters

**🟢 Beginner Example**

```python
from rest_framework.filters import BaseFilterBackend

class OrgFilter(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(org=request.user.org)
```

**🟡 Intermediate Example**

```python
class NearFilter(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        if lat and lon:
            return queryset.near(float(lat), float(lon), km=10)
        return queryset
```

**🔴 Expert Example**

```python
# Return ES ids then filter ORM queryset
```

**🌍 Real-Time Example**

```python
class DueBeforeFilter(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        d = request.query_params.get("due_before")
        if d:
            return queryset.filter(due_date__lte=d)
        return queryset
```

### 22.5.5 FilterSets

**🟢 Beginner Example**

```python
import django_filters
from django_filters.rest_framework import DjangoFilterBackend

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ["category", "brand"]

class ProductViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
```

**🟡 Intermediate Example**

```python
def filter_has_video(self, queryset, name, value):
    if value:
        return queryset.exclude(video_url="")
    return queryset

has_video = django_filters.BooleanFilter(method="filter_has_video")
```

**🔴 Expert Example**

```python
from django.db.models import Q

class ThreadFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(method="filter_q")

    def filter_q(self, queryset, name, value):
        return queryset.filter(Q(title__icontains=value) | Q(body__icontains=value))
```

**🌍 Real-Time Example**

```python
class VariantFilter(django_filters.FilterSet):
    class Meta:
        model = ProductVariant
        fields = {
            "size": ["exact"],
            "color": ["exact"],
            "warehouse_id": ["exact"],
        }
```

---

## 22.6 Pagination

### 22.6.1 PageNumberPagination

**🟢 Beginner Example**

```python
from rest_framework.pagination import PageNumberPagination

class StandardPagination(PageNumberPagination):
    page_size = 25
```

**🟡 Intermediate Example**

```python
page_size_query_param = "page_size"
max_page_size = 100
```

**🔴 Expert Example**

```python
queryset = qs.order_by("id")
```

**🌍 Real-Time Example**

```python
class AuditPagination(PageNumberPagination):
    page_size = 50
```

### 22.6.2 CursorPagination

**🟢 Beginner Example**

```python
from rest_framework.pagination import CursorPagination

class IdCursorPagination(CursorPagination):
    page_size = 20
    ordering = "-created_at"
```

**🟡 Intermediate Example**

```python
ordering = ("-created_at", "-id")
```

**🔴 Expert Example**

```python
# Stable under concurrent inserts — social timelines
```

**🌍 Real-Time Example**

```python
DEFAULT_PAGINATION_CLASS = "myapp.api.pagination.IdCursorPagination"
```

### 22.6.3 LimitOffsetPagination

**🟢 Beginner Example**

```python
from rest_framework.pagination import LimitOffsetPagination

class FlexiblePagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 200
```

**🟡 Intermediate Example**

```python
# Admin export ?limit=5000 with auth + throttle
```

**🔴 Expert Example**

```python
# Deep offsets are expensive — prefer cursor
```

**🌍 Real-Time Example**

```python
class AnalyticsPagination(LimitOffsetPagination):
    max_limit = 1000
```

### 22.6.4 Custom Pagination

**🟢 Beginner Example**

```python
class NamedPagePagination(PageNumberPagination):
    def get_paginated_response(self, data):
        return Response({
            "page": self.page.number,
            "total_pages": self.page.paginator.num_pages,
            "items": data,
        })
```

**🟡 Intermediate Example**

```python
def get_paginated_response(self, data):
    response = super().get_paginated_response(data)
    response.data["facets"] = self.view.get_facets()
    return response
```

**🔴 Expert Example**

```python
# Keyset: (last_id, last_ts)
```

**🌍 Real-Time Example**

```python
# Search cursor token encoding filter state
```

### 22.6.5 Pagination Schema

**🟢 Beginner Example**

```python
SPECTACULAR_SETTINGS = {"COMPONENT_SPLIT_REQUEST": True}
```

**🟡 Intermediate Example**

```python
from drf_spectacular.utils import extend_schema, OpenApiParameter

@extend_schema(parameters=[
    OpenApiParameter(name="page", type=int, location=OpenApiParameter.QUERY),
])
def list(self, request):
    ...
```

**🔴 Expert Example**

```python
@extend_schema(operation_id="products_list_cursor")
```

**🌍 Real-Time Example**

```python
# Developer portal documents next URL for SDKs
```

---

## 22.7 Authentication in DRF

### 22.7.1 BasicAuthentication

**🟢 Beginner Example**

```python
from rest_framework.authentication import BasicAuthentication

authentication_classes = [BasicAuthentication]
```

**🟡 Intermediate Example**

```python
# HTTPS only in production
```

**🔴 Expert Example**

```python
# /internal/ VPN + Basic
```

**🌍 Real-Time Example**

```python
# Legacy B2B migrating to OAuth2
```

### 22.7.2 TokenAuthentication

**🟢 Beginner Example**

```python
from rest_framework.authentication import TokenAuthentication

authentication_classes = [TokenAuthentication]
```

**🟡 Intermediate Example**

```python
from rest_framework.authtoken.models import Token
token, _ = Token.objects.get_or_create(user=user)
```

**🔴 Expert Example**

```python
# Prefer hashed API keys or JWT for rotation
```

**🌍 Real-Time Example**

```python
Authorization: Token <key>
```

### 22.7.3 SessionAuthentication

**🟢 Beginner Example**

```python
from rest_framework.authentication import SessionAuthentication

authentication_classes = [SessionAuthentication]
```

**🟡 Intermediate Example**

```python
# CSRF for unsafe methods from SPA
```

**🔴 Expert Example**

```python
SESSION_COOKIE_SAMESITE = "Lax"
```

**🌍 Real-Time Example**

```python
# Admin + same-site JSON API
```

### 22.7.4 JWT Authentication

**🟢 Beginner Example**

```python
from rest_framework_simplejwt.authentication import JWTAuthentication

authentication_classes = [JWTAuthentication]
```

**🟡 Intermediate Example**

```python
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
```

**🔴 Expert Example**

```python
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class OrgTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["org_id"] = str(user.org_id)
        return token
```

**🌍 Real-Time Example**

```python
# API gateway validates issuer/audience
```

### 22.7.5 Custom Authentication

**🟢 Beginner Example**

```python
# See ApiKeyAuthentication in 22.2.5
```

**🟡 Intermediate Example**

```python
class HMACAuthentication(BaseAuthentication):
    def authenticate(self, request):
        sig = request.META.get("HTTP_X_SIGNATURE")
        if not sig or not verify_hmac(request.body, sig, settings.WEBHOOK_SECRET):
            raise AuthenticationFailed("Bad signature")
        return (None, None)
```

**🔴 Expert Example**

```python
# mTLS: Nginx passes SSL_CLIENT_S_DN
```

**🌍 Real-Time Example**

```python
# Stripe-like webhooks: signature auth, AllowAny permission
```

---

## 22.8 Permissions and Throttling

### 22.8.1 AllowAny

**🟢 Beginner Example**

```python
from rest_framework.permissions import AllowAny

class PublicConfigView(APIView):
    permission_classes = [AllowAny]
```

**🟡 Intermediate Example**

```python
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
```

**🔴 Expert Example**

```python
throttle_classes = [AnonRateThrottle]
```

**🌍 Real-Time Example**

```python
# Public feature flags JSON
```

### 22.8.2 IsAuthenticated

**🟢 Beginner Example**

```python
permission_classes = [IsAuthenticated]
```

**🟡 Intermediate Example**

```python
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}
```

**🔴 Expert Example**

```python
def get_permissions(self):
    if self.action in ("list", "retrieve"):
        return [AllowAny()]
    return [IsAuthenticated()]
```

**🌍 Real-Time Example**

```python
# All writes require login
```

### 22.8.3 IsAdminUser

**🟢 Beginner Example**

```python
from rest_framework.permissions import IsAdminUser

class ImpersonationView(APIView):
    permission_classes = [IsAdminUser]
```

**🟡 Intermediate Example**

```python
class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)
```

**🔴 Expert Example**

```python
class IsApiAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="api_admins").exists()
```

**🌍 Real-Time Example**

```python
# Refund operator console
```

### 22.8.4 Custom Permissions

**🟢 Beginner Example**

```python
class ReadOnlyUnlessOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id
```

**🟡 Intermediate Example**

```python
class TeamMemberPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        team_id = view.kwargs.get("team_id")
        return Membership.objects.filter(user=request.user, team_id=team_id).exists()
```

**🔴 Expert Example**

```python
# Hide fields in serializer when lacking permission
```

**🌍 Real-Time Example**

```python
# Comment delete: author or moderator
```

### 22.8.5 Throttling Rates

**🟢 Beginner Example**

```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "100/day", "user": "1000/day"},
}
```

**🟡 Intermediate Example**

```python
class BurstThrottle(UserRateThrottle):
    scope = "burst"

REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["burst"] = "60/min"
```

**🔴 Expert Example**

```python
from rest_framework.throttling import SimpleRateThrottle

class OrgThrottle(SimpleRateThrottle):
    scope = "org"

    def get_cache_key(self, request, view):
        if not request.user.is_authenticated:
            return None
        ident = request.user.org_id
        return self.cache_format % {"scope": self.scope, "ident": ident}
```

**🌍 Real-Time Example**

```python
DEFAULT_THROTTLE_RATES = {"free_tier": "10/min", "pro_tier": "600/min"}
```

---

## 22.9 API Testing

### 22.9.1 APIClient

**🟢 Beginner Example**

```python
from rest_framework.test import APIClient

def test_ping():
    client = APIClient()
    response = client.get("/api/health/")
    assert response.status_code == 200
```

**🟡 Intermediate Example**

```python
client = APIClient()
client.force_authenticate(user=user)
response = client.post("/api/cart/items/", {"product_id": 1, "qty": 2}, format="json")
```

**🔴 Expert Example**

```python
client.login(username="u", password="p")
response = client.post("/api/...", data, format="json")
```

**🌍 Real-Time Example**

```python
# Checkout: add item → session → confirm
```

### 22.9.2 APITestCase

**🟢 Beginner Example**

```python
from rest_framework.test import APITestCase

class ProductTests(APITestCase):
    def test_list(self):
        Product.objects.create(name="A", price=1)
        res = self.client.get("/api/products/")
        self.assertEqual(res.status_code, 200)
```

**🟡 Intermediate Example**

```python
from django.contrib.auth import get_user_model
User = get_user_model()

def setUp(self):
    self.user = User.objects.create_user("a", password="x")
    self.client.force_authenticate(self.user)
```

**🔴 Expert Example**

```python
from unittest.mock import patch

@patch("django.utils.timezone.now")
def test_subscription_renewal(self, mock_now):
    ...
```

**🌍 Real-Time Example**

```python
res = self.client.post("/api/reports/export/")
self.assertEqual(res.status_code, 402)
```

### 22.9.3 APIRequestFactory

**🟢 Beginner Example**

```python
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get("/api/products/")
view = ProductViewSet.as_view({"get": "list"})
response = view(request)
```

**🟡 Intermediate Example**

```python
from rest_framework.test import force_authenticate

request = factory.get("/api/profile/")
force_authenticate(request, user=user)
```

**🔴 Expert Example**

```python
view = ProductViewSet()
view.request = request
serializer = view.get_serializer(page)
```

**🌍 Real-Time Example**

```python
# Fast unit tests without URLConf
```

### 22.9.4 Testing Serializers

**🟢 Beginner Example**

```python
def test_discount_xor():
    ser = DiscountSerializer(data={"percent": 10, "fixed_cents": 0})
    assert not ser.is_valid()
```

**🟡 Intermediate Example**

```python
ser = ProductSerializer(data={"name": "X", "price": "9.99"})
assert ser.is_valid(), ser.errors
obj = ser.save()
```

**🔴 Expert Example**

```python
ser = CheckoutSerializer(data=payload, context={"request": request})
```

**🌍 Real-Time Example**

```python
with patch("myapp.validators.vat_validator", return_value=True):
    assert ser.is_valid()
```

### 22.9.5 Testing Views

**🟢 Beginner Example**

```python
res = self.client.get("/api/products/1/")
self.assertEqual(res.data["name"], "Book")
```

**🟡 Intermediate Example**

```python
res = self.client.delete("/api/posts/1/")
self.assertEqual(res.status_code, 403)
```

**🔴 Expert Example**

```python
self.assertIn("next", res.data)
self.assertIsInstance(res.data["results"], list)
```

**🌍 Real-Time Example**

```python
r1 = self.client.post("/api/hooks/stripe/", payload, format="json")
r2 = self.client.post("/api/hooks/stripe/", payload, format="json")
self.assertEqual(r1.status_code, 200)
self.assertEqual(r2.status_code, 200)
```

---

## Best Practices

- Prefer **nouns** and consistent pluralization in URLs; use sub-resources or `@action` for non-CRUD operations.
- Use **`IsAuthenticated` by default**; explicitly open endpoints with `AllowAny` and throttling.
- **Version** APIs before breaking changes; communicate deprecations with `Sunset` / `Deprecation` headers where appropriate.
- **Paginate** large lists; use **stable `order_by`** for page-number pagination.
- **Validate in serializers**; keep views thin; use services for multi-step workflows.
- **Never expose stack traces** in JSON errors in production.
- Use **`Decimal`** for money; document minor units in your API schema.
- **Test** auth failures, validation, pagination, and idempotent webhooks.

---

## Common Mistakes to Avoid

- Returning **200** with an error body instead of proper **4xx** codes.
- Using **floats for currency** or unvalidated string amounts.
- **N+1 queries** in list endpoints (missing `select_related` / `prefetch_related`).
- **Unbounded `page_size`** on public APIs.
- Trusting **client-sent `user_id`** instead of `request.user`.
- Forgetting **CSRF** with session authentication from SPAs.
- **Partial nested creates** without transactions.
- **Deep limit/offset** paging on huge tables without cursor alternative.

---

## Comparison Tables

| View style | Best for | Trade-off |
|------------|----------|------------|
| `APIView` | Full control | More boilerplate |
| Generic CBVs | Standard CRUD | Less flexible |
| `ViewSet` + router | Resource APIs | Convention learning curve |

| Pagination | Pros | Cons |
|------------|------|------|
| Page number | Simple | Skips/duplicates under concurrent writes |
| Cursor | Stable feeds | No random access |
| Limit/offset | Flexible | Slow at high offset |

| Auth | Client | Notes |
|------|--------|-------|
| Session | Same-site web | CSRF |
| Token | Mobile / simple | Rotation story |
| JWT | SPA / services | Short access + refresh |

| Filter | When |
|--------|------|
| `SearchFilter` | Quick text on few fields |
| `OrderingFilter` | Sort options |
| `django-filter` | Many optional filters |

---

*Django **6.0.3** + **DRF** — align versions with your lockfile; run `python manage.py check` after settings changes.*
