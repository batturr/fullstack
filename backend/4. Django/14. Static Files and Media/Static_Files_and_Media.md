# Django Static Files and Media (Django 6.0.3)

**Static files** are versioned assets you ship with code (CSS, JS, images). **Media files** are **user-generated** or **uploaded** content stored outside the codebase. Django separates **`STATIC_*`** from **`MEDIA_*`** settings and provides **`collectstatic`**, **finders**, and **storage backends**—similar in spirit to a **CDN + object store** pipeline in TypeScript/Node stacks using **Vite** and **S3**. This reference targets **Django 6.0.3** on **Python 3.12–3.14** with **e‑commerce catalogs**, **social avatars**, and **SaaS tenant branding**.

---

## 📑 Table of Contents

- [14.1 Static Files Basics](#141-static-files-basics)
  - [14.1.1 Directory Structure](#1411-directory-structure)
  - [14.1.2 STATIC_URL](#1412-static_url)
  - [14.1.3 STATIC_ROOT](#1413-static_root)
  - [14.1.4 STATICFILES_DIRS](#1414-staticfiles_dirs)
  - [14.1.5 Static File Finders](#1415-static-file-finders)
- [14.2 Managing Static Files](#142-managing-static-files)
  - [14.2.1 collectstatic](#1421-collectstatic)
  - [14.2.2 Development vs Production](#1422-development-vs-production)
  - [14.2.3 Versioning](#1423-versioning)
  - [14.2.4 Cache Busting](#1424-cache-busting)
  - [14.2.5 Static File Storage](#1425-static-file-storage)
- [14.3 Serving Static Files](#143-serving-static-files)
  - [14.3.1 Development Server](#1431-development-server)
  - [14.3.2 Production Serving](#1432-production-serving)
  - [14.3.3 CDN Integration](#1433-cdn-integration)
  - [14.3.4 Whitenoise](#1434-whitenoise)
  - [14.3.5 S3 / Cloud Storage](#1435-s3--cloud-storage)
- [14.4 Media Files](#144-media-files)
  - [14.4.1 Directory Setup](#1441-directory-setup)
  - [14.4.2 MEDIA_URL](#1442-media_url)
  - [14.4.3 MEDIA_ROOT](#1443-media_root)
  - [14.4.4 User Upload Handling](#1444-user-upload-handling)
  - [14.4.5 File Storage Backends](#1445-file-storage-backends)
- [14.5 File Upload](#145-file-upload)
  - [14.5.1 FileField](#1451-filefield)
  - [14.5.2 ImageField](#1452-imagefield)
  - [14.5.3 File Validation](#1453-file-validation)
  - [14.5.4 File Size Limits](#1454-file-size-limits)
  - [14.5.5 File Type Restrictions](#1455-file-type-restrictions)
- [14.6 Advanced File Handling](#146-advanced-file-handling)
  - [14.6.1 Custom Storage Backends](#1461-custom-storage-backends)
  - [14.6.2 Remote File Storage](#1462-remote-file-storage)
  - [14.6.3 File Processing](#1463-file-processing)
  - [14.6.4 Image Optimization](#1464-image-optimization)
  - [14.6.5 File Cleanup](#1465-file-cleanup)
- [Best Practices (Chapter Summary)](#best-practices-chapter-summary)
- [Common Mistakes (Chapter Summary)](#common-mistakes-chapter-summary)
- [Comparison Tables](#comparison-tables)

---

## 14.1 Static Files Basics

### 14.1.1 Directory Structure

Place app static under **`app/static/app/`** to namespace; project-wide assets in **`STATICFILES_DIRS`**.

**🟢 Beginner Example**

```
shop/
  static/
    shop/
      css/
        shop.css
```

**🟡 Intermediate Example**

```
assets/
  dist/
    app.js
    app.css
```

**🔴 Expert Example**

Monorepo: frontend **Vite** emits to **`backend/static/dist/`** consumed by Django templates.

**🌍 Real-Time Example**

E‑commerce: **`static/shop/images/fallback-product.png`**.

---

### 14.1.2 STATIC_URL

URL prefix for static files (e.g. **`/static/`** or CDN origin).

**🟢 Beginner Example**

```python
STATIC_URL = "static/"
```

**🟡 Intermediate Example**

```python
STATIC_URL = "https://cdn.example.com/static/"
```

**🔴 Expert Example**

**`FORCE_SCRIPT_NAME`** + subpath deployments adjust effective URLs.

**🌍 Real-Time Example**

SaaS: per-tenant CDN subdomain via **reverse proxy** path rewrite (advanced).

---

### 14.1.3 STATIC_ROOT

Destination for **`collectstatic`** in production—**not** for hand-editing.

**🟢 Beginner Example**

```python
STATIC_ROOT = BASE_DIR / "staticfiles"
```

**🟡 Intermediate Example**

Docker: **`/app/staticfiles`** volume.

**🔴 Expert Example**

Ephemeral container FS: upload **`collectstatic`** output to **S3** in CI.

**🌍 Real-Time Example**

Kubernetes: build stage runs **`collectstatic`** then copies artifacts into image layer.

---

### 14.1.4 STATICFILES_DIRS

Additional search paths for development finders.

**🟢 Beginner Example**

```python
STATICFILES_DIRS = [BASE_DIR / "assets"]
```

**🟡 Intermediate Example**

```python
STATICFILES_DIRS = [
    ("vendor", BASE_DIR / "node_modules/some-pkg/dist"),
]
```

**🔴 Expert Example**

**Finder precedence**: **`STATICFILES_DIRS`** before app static for overrides.

**🌍 Real-Time Example**

White-label SaaS: brand pack in **`STATICFILES_DIRS`** per settings module.

---

### 14.1.5 Static File Finders

**`FileSystemFinder`**, **`AppDirectoriesFinder`**.

**🟢 Beginner Example**

Default **`STATICFILES_FINDERS`** includes both.

**🟡 Intermediate Example**

```python
STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]
```

**🔴 Expert Example**

Custom finder pulling from **ZIP** or **database** (rare).

**🌍 Real-Time Example**

Plugin system loads vendor assets from installed plugins.

---

## 14.2 Managing Static Files

### 14.2.1 collectstatic

Copies files into **`STATIC_ROOT`** using configured **storage**.

**🟢 Beginner Example**

```bash
python manage.py collectstatic --noinput
```

**🟡 Intermediate Example**

```bash
python manage.py collectstatic --clear --noinput
```

**🔴 Expert Example**

**`--dry-run`** in CI diff checks.

**🌍 Real-Time Example**

GitHub Actions → **S3 sync** **`staticfiles/`**.

---

### 14.2.2 Development vs Production

**`runserver`** + **`django.contrib.staticfiles`** serves **`STATIC_URL`** in **DEBUG**.

**🟢 Beginner Example**

```python
INSTALLED_APPS += ["django.contrib.staticfiles"]
```

**🟡 Intermediate Example**

Production: **`DEBUG=False`**, web server or **WhiteNoise** serves static.

**🔴 Expert Example**

Never **`runserver`** in production.

**🌍 Real-Time Example**

E‑commerce: nginx **`location /static/`** alias to **`STATIC_ROOT`**.

---

### 14.2.3 Versioning

Git commit hash or package version in **`STATIC_URL`** path segment.

**🟢 Beginner Example**

```python
STATIC_URL = f"static/{BUILD_ID}/"
```

**🟡 Intermediate Example**

**`ManifestStaticFilesStorage`** hashes filenames.

**🔴 Expert Example**

**`django-storages`** + **CloudFront** cache policies keyed by hashed object key.

**🌍 Real-Time Example**

SaaS: deploy **immutable** assets at **`/assets/<git_sha>/...`**.

---

### 14.2.4 Cache Busting

**`CachedStaticFilesStorage`** / **`ManifestStaticFilesStorage`**.

**🟢 Beginner Example**

```python
STORAGES = {
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.ManifestStaticFilesStorage",
    },
}
```

**🟡 Intermediate Example**

Template: **`{% static 'app.js' %}`** resolves hashed path.

**🔴 Expert Example**

Source maps reference original paths; serve **restricted** in prod.

**🌍 Real-Time Example**

Social PWA: **service worker** version tied to manifest hash.

---

### 14.2.5 Static File Storage

**`STORAGES["staticfiles"]`** backend.

**🟢 Beginner Example**

Default **`StaticFilesStorage`**.

**🟡 Intermediate Example**

**`CompressedManifestStaticFilesStorage`** (third-party) for **WhiteNoise** compression.

**🔴 Expert Example**

**`S3Boto3Storage`** for static exclusively on S3.

**🌍 Real-Time Example**

Global SaaS: **Cloudflare R2** (S3-compatible).

---

## 14.3 Serving Static Files

### 14.3.1 Development Server

**`runserver`** automatic static when **`staticfiles`** in **`INSTALLED_APPS`**.

**🟢 Beginner Example**

```bash
python manage.py runserver
```

**🟡 Intermediate Example**

```python
python manage.py runserver 0.0.0.0:8000
```

**🔴 Expert Example**

**`--nostatic`** to disable dev static handler (edge debugging).

**🌍 Real-Time Example**

Frontend dev uses **Vite** proxy to Django API; static from Vite.

---

### 14.3.2 Production Serving

nginx, Apache, **WhiteNoise**, CDN.

**🟢 Beginner Example**

```nginx
location /static/ {
    alias /var/www/app/staticfiles/;
}
```

**🟡 Intermediate Example**

Enable **`gzip_static`** / **`brotli_static`** in nginx.

**🔴 Expert Example**

**`immutable`** **Cache-Control** for hashed filenames.

**🌍 Real-Time Example**

E‑commerce Black Friday: CDN **shield origin** from traffic spikes.

---

### 14.3.3 CDN Integration

**`STATIC_URL`** points to CDN; **`collectstatic`** uploads to origin bucket.

**🟢 Beginner Example**

```python
STATIC_URL = "https://d111111abcdef8.cloudfront.net/"
```

**🟡 Intermediate Example**

Signed URLs **not** typically used for public static assets.

**🔴 Expert Example**

**Origin access identity** (AWS) restricting **S3** to CloudFront only.

**🌍 Real-Time Example**

SaaS global latency reduction.

---

### 14.3.4 Whitenoise

**`WhiteNoiseMiddleware`** serves **`STATIC_ROOT`** efficiently from same dyno/container.

**🟢 Beginner Example**

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    ...
]
```

**🟡 Intermediate Example**

```python
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
```

**🔴 Expert Example**

**`WHITENOISE_ROOT`** alternative root (advanced).

**🌍 Real-Time Example**

Heroku-style PaaS without separate nginx static pod.

---

### 14.3.5 S3 / Cloud Storage

**`django-storages`** **`S3Boto3Storage`**.

**🟢 Beginner Example**

```python
STORAGES = {
    "staticfiles": {"BACKEND": "storages.backends.s3boto3.S3ManifestStaticStorage"},
}
AWS_STORAGE_BUCKET_NAME = "my-static-bucket"
```

**🟡 Intermediate Example**

```python
AWS_S3_CUSTOM_DOMAIN = "cdn.example.com"
```

**🔴 Expert Example**

**SSE-KMS** encryption at rest for compliance (often media > static).

**🌍 Real-Time Example**

SaaS attachments bucket separate from public static bucket.

---

## 14.4 Media Files

### 14.4.1 Directory Setup

**`MEDIA_ROOT`** on disk or abstracted via storage.

**🟢 Beginner Example**

```python
MEDIA_ROOT = BASE_DIR / "media"
```

**🟡 Intermediate Example**

```python
MEDIA_URL = "media/"
```

**🔴 Expert Example**

**Ephemeral** containers: **no local** **`MEDIA_ROOT`** reliance—use remote storage.

**🌍 Real-Time Example**

Docker volume **`/data/media`**.

---

### 14.4.2 MEDIA_URL

Public URL prefix for **`FileField.url`**.

**🟢 Beginner Example**

```python
MEDIA_URL = "/media/"
```

**🟡 Intermediate Example**

```python
MEDIA_URL = "https://files.example.com/"
```

**🔴 Expert Example**

**Private** media: do not expose **`MEDIA_URL`** publicly—use signed URLs from view.

**🌍 Real-Time Example**

Social: CDN for public avatars; **signed** for DM attachments.

---

### 14.4.3 MEDIA_ROOT

Local filesystem path for **`FileSystemStorage`**.

**🟢 Beginner Example**

```python
# urls.py (DEV ONLY)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

**🟡 Intermediate Example**

Production: **do not** serve **`MEDIA`** via Django **`runserver`** pattern.

**🔴 Expert Example**

nginx **`alias`** **`MEDIA_ROOT`** or proxy to object storage.

**🌍 Real-Time Example**

E‑commerce product images.

---

### 14.4.4 User Upload Handling

**`request.FILES`** bound to **`ModelForm`**.

**🟢 Beginner Example**

```python
class Document(models.Model):
    file = models.FileField(upload_to="documents/%Y/%m/")
```

**🟡 Intermediate Example**

```python
def user_avatar_path(instance, filename):
    return f"avatars/{instance.user_id}/{filename}"

class Profile(models.Model):
    avatar = models.ImageField(upload_to=user_avatar_path, blank=True)
```

**🔴 Expert Example**

**`upload_to`** callable receives **`instance`** and **`filename`**—sanitize **`filename`**.

**🌍 Real-Time Example**

SaaS: tenant-prefixed paths **`tenant_{id}/…`**.

---

### 14.4.5 File Storage Backends

**`STORAGES["default"]`** for **`FileField`**.

**🟢 Beginner Example**

```python
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
}
```

**🟡 Intermediate Example**

```python
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {"bucket_name": "my-media-bucket"},
    },
}
```

**🔴 Expert Example**

**Multi-bucket** routing: custom storage subclass.

**🌍 Real-Time Example**

Compliance region: **EU bucket** for EU tenants.

---

## 14.5 File Upload

### 14.5.1 FileField

Stores path relative to storage.

**🟢 Beginner Example**

```python
attachment = models.FileField(upload_to="tickets/%Y/")
```

**🟡 Intermediate Example**

```python
class Ticket(models.Model):
    attachment = models.FileField(upload_to="tickets/%Y/", blank=True, null=True)
```

**🔴 Expert Example**

**`FileField(storage=PrivateMediaStorage())`**.

**🌍 Real-Time Example**

SaaS support ticket uploads.

---

### 14.5.2 ImageField

Requires **Pillow** for validation.

**🟢 Beginner Example**

```python
cover = models.ImageField(upload_to="covers/")
```

**🟡 Intermediate Example**

```python
from django.core.validators import FileExtensionValidator

cover = models.ImageField(
    upload_to="covers/",
    validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
)
```

**🔴 Expert Example**

Generate thumbnails on **`post_save`** signal (Celery).

**🌍 Real-Time Example**

E‑commerce product gallery.

---

### 14.5.3 File Validation

**`clean_*`** + **`validators`**.

**🟢 Beginner Example**

```python
from django.core.validators import FileExtensionValidator

data = models.FileField(validators=[FileExtensionValidator(["csv"])])
```

**🟡 Intermediate Example**

```python
def validate_pdf_size(f):
    if f.size > 10 * 1024 * 1024:
        raise ValidationError("Max 10MB.")
```

**🔴 Expert Example**

ClamAV scan in async worker before marking **`scan_status=clean`**.

**🌍 Real-Time Example**

Social: block **EXE** uploads.

---

### 14.5.4 File Size Limits

**`DATA_UPLOAD_MAX_MEMORY_SIZE`**, **`FILE_UPLOAD_MAX_MEMORY_SIZE`**, web server body limits.

**🟢 Beginner Example**

```python
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
```

**🟡 Intermediate Example**

```python
FILE_UPLOAD_MAX_MEMORY_SIZE = 2 * 1024 * 1024
```

**🔴 Expert Example**

**nginx** **`client_max_body_size`**.

**🌍 Real-Time Example**

SaaS CSV import **100MB** allowed only on **async upload** endpoint with **S3 presigned POST**.

---

### 14.5.5 File Type Restrictions

Extension + **magic bytes**; never trust **`content_type`** from client alone.

**🟢 Beginner Example**

```python
FileExtensionValidator(["png", "jpg"])
```

**🟡 Intermediate Example**

```python
import imghdr

def clean_avatar(self):
    f = self.cleaned_data["avatar"]
    kind = imghdr.what(f)
    if kind not in ("jpeg", "png", "webp"):
        raise ValidationError("Invalid image.")
    return f
```

**🔴 Expert Example**

**python-magic** library in worker.

**🌍 Real-Time Example**

Marketplace seller **PDF** invoices only.

---

## 14.6 Advanced File Handling

### 14.6.1 Custom Storage Backends

Subclass **`Storage`**: **`_open`**, **`_save`**, **`delete`**, **`exists`**, **`url`**.

**🟢 Beginner Example**

```python
from django.core.files.storage import FileSystemStorage

class TenantFileSystemStorage(FileSystemStorage):
    def __init__(self, tenant_id, **kwargs):
        self.tenant_id = tenant_id
        kwargs.setdefault("location", f"/data/media/tenant_{tenant_id}")
        super().__init__(**kwargs)
```

**🟡 Intermediate Example**

Delegate to **S3** with **prefix**.

**🔴 Expert Example**

**WORM** storage for audit logs (compliance).

**🌍 Real-Time Example**

SaaS per-tenant encryption keys (KMS).

---

### 14.6.2 Remote File Storage

**S3**, **GCS**, **Azure Blob** via **django-storages**.

**🟢 Beginner Example**

```python
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
```

**🟡 Intermediate Example**

```python
AWS_QUERYSTRING_AUTH = True  # private files signed URLs
```

**🔴 Expert Example**

**Lifecycle rules** transition to **Glacier**.

**🌍 Real-Time Example**

Social video: **transcoding** pipeline on upload event.

---

### 14.6.3 File Processing

Resize, virus scan, extract metadata.

**🟢 Beginner Example**

```python
from PIL import Image

def resize_image(path, max_side=1024):
    with Image.open(path) as im:
        im.thumbnail((max_side, max_side))
        im.save(path)
```

**🟡 Intermediate Example**

Celery task **`process_upload.delay(file_id)`**.

**🔴 Expert Example**

**PDF** rasterization for preview thumbnails.

**🌍 Real-Time Example**

E‑commerce on-the-fly **image CDN** transformations (**imgproxy**).

---

### 14.6.4 Image Optimization

**WebP** conversion, **progressive JPEG**.

**🟢 Beginner Example**

Save as **WebP** if browser supports (serve via **`<picture>`**).

**🟡 Intermediate Example**

**`sorl-thumbnail`** or **easy-thumbnails**.

**🔴 Expert Example**

**AVIF** pipeline with fallbacks.

**🌍 Real-Time Example**

Social feed: **blurhash** placeholder while lazy loading.

---

### 14.6.5 File Cleanup

Delete old file when model updates; **`post_delete`** signal.

**🟢 Beginner Example**

```python
@receiver(post_delete, sender=Document)
def remove_file(sender, instance, **kwargs):
    instance.file.delete(save=False)
```

**🟡 Intermediate Example**

Periodic **Celery beat** job purges orphaned uploads in **`tmp/`**.

**🔴 Expert Example**

**S3** **lifecycle** expiration for abandoned multipart uploads.

**🌍 Real-Time Example**

GDPR: user account deletion triggers **storage purge** + **CDN** invalidation.

---

## Best Practices (Chapter Summary)

- Never commit **`STATIC_ROOT`** or large **`media/`** trees to git.
- Use **`ManifestStaticFilesStorage`** (or equivalent) for long-cache safe deployments.
- Serve **static** from **CDN** or **nginx**; avoid Django for static in production at scale.
- Store **uploads** on **durable remote storage** in containerized environments.
- Sanitize **`upload_to`** paths; prevent **directory traversal** in filenames.
- Enforce **size** and **type** limits at **reverse proxy** and **application** layers.
- Use **signed URLs** for **private** media rather than public buckets.
- Separate **buckets** for static, public media, and private media when possible.

---

## Common Mistakes (Chapter Summary)

- Serving **`MEDIA`** via **`runserver`** helper in production.
- Confusing **`STATIC_URL`** with **`MEDIA_URL`**.
- Forgetting **`collectstatic`** in deploy pipeline → **404** on CSS/JS.
- Storing **secrets** in **`STATICFILES_DIRS`** bundles.
- Trusting **client-provided** filenames or MIME types.
- **Nginx** **`alias`** misconfiguration exposing filesystem.
- Not deleting **old** **`FileField`** files on update → storage leak.

---

## Comparison Tables

| Setting | Purpose |
|---------|---------|
| `STATIC_URL` | URL prefix for shipped assets |
| `STATIC_ROOT` | Collected output directory |
| `STATICFILES_DIRS` | Extra source dirs |
| `MEDIA_URL` | URL prefix for user uploads |
| `MEDIA_ROOT` | Local media root (if filesystem) |

| Tool | Role |
|------|------|
| `collectstatic` | Gather static to storage |
| `{% static %}` | Resolve URL + manifest |
| WhiteNoise | App-server static serving |
| CDN | Edge cache & TLS |

| Storage | Typical content |
|---------|-----------------|
| Static | CSS/JS/fonts |
| Public media | Avatars, product images |
| Private media | Invoices, legal docs |

| Validation layer | Strength |
|------------------|----------|
| Extension only | Weak |
| Size limits | Good baseline |
| Magic bytes / AV | Stronger |

---

## Supplement: Static vs Media Decision Guide

**🟢 Beginner Example**

Use **static** for the company logo asset bundled with the repo.

**🟡 Intermediate Example**

Use **media** for user-uploaded profile photos.

**🔴 Expert Example**

Use **static** for Webpack/Vite build output referenced via **`{% static %}`**; use **media** + **private storage** for KYC documents.

**🌍 Real-Time Example**

E‑commerce: canonical product shots might be **CMS/media**; UI icons are **static**.

---

## Supplement: Deployment Checklist (Production)

**🟢 Beginner Example**

Run **`collectstatic`** once per deploy.

**🟡 Intermediate Example**

Set **`DEBUG=False`**, configure **`ALLOWED_HOSTS`**, serve **`/static/`** from nginx or WhiteNoise.

**🔴 Expert Example**

Verify **`SECURE_SSL_REDIRECT`**, **`CSRF_TRUSTED_ORIGINS`**, and CDN **cache keys** for hashed assets.

**🌍 Real-Time Example**

SaaS: separate **staging** bucket/prefix to avoid polluting production CDN.

---

*Cross-check **`STORAGES`** dictionary format and default backends in **Django 6.0.3** documentation—settings evolved from legacy **`DEFAULT_FILE_STORAGE`** / **`STATICFILES_STORAGE`** to unified **`STORAGES`***.
