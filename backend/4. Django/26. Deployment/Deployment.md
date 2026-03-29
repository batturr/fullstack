# Django Deployment

Deploying Django **6.0.3** means separating **development convenience** from **production guarantees**: secrets out of code, static assets on a CDN or edge cache, an application server behind a reverse proxy, a real database with backups, containers or VMs you can reproduce, cloud primitives you trust, twelve-factor configuration, and observability that wakes someone up when users hurt. These notes mirror a TypeScript handbook with four-tier examples and **e-commerce**, **social**, and **SaaS** stories.

---

## 📑 Table of Contents

1. [26.1 Production Settings](#261-production-settings)
2. [26.2 Static File Deployment](#262-static-file-deployment)
3. [26.3 Server Setup](#263-server-setup)
4. [26.4 Database Deployment](#264-database-deployment)
5. [26.5 Docker Deployment](#265-docker-deployment)
6. [26.6 Cloud Platforms](#266-cloud-platforms)
7. [26.7 Environment Management](#267-environment-management)
8. [26.8 Monitoring and Logging](#268-monitoring-and-logging)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)

---

## 26.1 Production Settings

### 26.1.1 DEBUG=False

**🟢 Beginner Example**

```python
DEBUG = False
```

**🟡 Intermediate Example — split settings**

```python
# settings/base.py
DEBUG = False
# settings/local.py overrides DEBUG=True for dev only (not imported in prod)
```

**🔴 Expert Example — fail if DEBUG true in prod env**

```python
import os

if os.environ.get("DJANGO_ENV") == "production" and DEBUG:
    raise RuntimeError("DEBUG must be False in production")
```

**🌍 Real-Time Example — e-commerce storefront**

```python
# Misconfigured DEBUG leaked stack traces during checkout — run check --deploy in CI
```

### 26.1.2 SECRET_KEY Management

**🟢 Beginner Example**

```python
SECRET_KEY = os.environ["SECRET_KEY"]
```

**🟡 Intermediate Example — rotate with dual-key verification**

```python
# Keep previous key in SECRET_KEY_FALLBACKS (Django supports fallbacks for signing)
```

**🔴 Expert Example — KMS-wrapped key**

```python
# Fetch from AWS Secrets Manager at startup; cache in memory only
```

**🌍 Real-Time Example — SaaS multi-tenant: per-tenant encryption keys separate from SECRET_KEY**

```python
# SECRET_KEY for sessions/CSRF; envelope encryption for customer secrets column
```

### 26.1.3 ALLOWED_HOSTS

**🟢 Beginner Example**

```python
ALLOWED_HOSTS = ["api.example.com", "www.example.com"]
```

**🟡 Intermediate Example — env list**

```python
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")
```

**🔴 Expert Example — dynamic tenant hosts**

```python
# Middleware validates Host against Tenant.custom_domain in addition to ALLOWED_HOSTS base
```

**🌍 Real-Time Example — social app with user blogs on subdomains**

```python
ALLOWED_HOSTS = [".mysocial.app"]
```

### 26.1.4 Database Configuration

**🟢 Beginner Example**

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": "5432",
    }
}
```

**🟡 Intermediate Example — SSL mode**

```python
DATABASES["default"]["OPTIONS"] = {"sslmode": "require"}
```

**🔴 Expert Example — read replica router**

```python
DATABASE_ROUTERS = ["myapp.dbrouters.PrimaryReplicaRouter"]
```

**🌍 Real-Time Example — e-commerce flash sale**

```python
# PgBouncer transaction pooling + primary for writes, replica for catalog reads
```

### 26.1.5 Security Settings

**🟢 Beginner Example**

```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

**🟡 Intermediate Example**

```python
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

**🔴 Expert Example — content type nosniff, XSS filter, frame options**

```python
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"
```

**🌍 Real-Time Example — SaaS admin on separate subdomain with stricter CSP**

---

## 26.2 Static File Deployment

### 26.2.1 collectstatic

**🟢 Beginner Example**

```bash
python manage.py collectstatic --noinput
```

**🟡 Intermediate Example — Manifest storage**

```python
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
```

**🔴 Expert Example — parallel collect in CI**

```bash
python manage.py collectstatic --noinput --clear
```

**🌍 Real-Time Example — e-commerce themed assets per brand**

```python
# Multiple STATICFILES_DIRS + pipeline build per theme before collectstatic
```

### 26.2.2 Static File Serving

**🟢 Beginner Example — whitenoise middleware**

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    ...
]
```

**🟡 Intermediate Example — nginx `location /static/`**

```nginx
location /static/ {
    alias /var/www/app/static/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

**🔴 Expert Example — separate static domain cookieless**

**🌍 Real-Time Example — social CDN for emoji sprites**

### 26.2.3 CDN Integration

**🟢 Beginner Example**

```python
STATIC_URL = "https://cdn.example.com/static/"
```

**🟡 Intermediate Example — signed URLs for private workshop PDFs**

**🔴 Expert Example — purge API on deploy**

**🌍 Real-Time Example — SaaS global latency**

```python
# CloudFront with origin shield hitting S3 bucket of hashed assets
```

### 26.2.4 Whitenoise

**🟢 Beginner Example**

```python
STATIC_ROOT = BASE_DIR / "staticfiles"
```

**🟡 Intermediate Example — compression**

```python
WHITENOISE_MAX_AGE = 31536000
```

**🔴 Expert Example — root vs subpath behind reverse proxy**

**🌍 Real-Time Example — Heroku-style single dyno + whitenoise for MVP**

### 26.2.5 S3 / Cloud Storage

**🟢 Beginner Example — `django-storages`**

```python
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
AWS_STORAGE_BUCKET_NAME = "my-bucket"
AWS_S3_REGION_NAME = "eu-west-1"
```

**🟡 Intermediate Example — separate buckets static vs media**

**🔴 Expert Example — SSE-KMS encryption for user uploads**

**🌍 Real-Time Example — e-commerce product images lifecycle to Glacier**

---

## 26.3 Server Setup

### 26.3.1 Gunicorn

**🟢 Beginner Example**

```bash
gunicorn proj.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

**🟡 Intermediate Example — threads for I/O**

```bash
gunicorn proj.wsgi:application --workers 2 --threads 4 --timeout 60
```

**🔴 Expert Example — worker class uvicorn for ASGI**

```bash
uvicorn proj.asgi:application --host 0.0.0.0 --port 8000 --workers 4
```

**🌍 Real-Time Example — SaaS API autoscaling on CPU + request rate**

### 26.3.2 Nginx Configuration

**🟢 Beginner Example — proxy_pass**

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**🟡 Intermediate Example — gzip/brotli**

**🔴 Expert Example — rate limiting zones**

**🌍 Real-Time Example — e-commerce image resizing via nginx `image_filter` (careful)**

### 26.3.3 Reverse Proxy Setup

**🟢 Beginner Example — single VM nginx + gunicorn**

**🟡 Intermediate Example — TLS termination at load balancer**

**🔴 Expert Example — WebSocket upgrade headers for ASGI**

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

**🌍 Real-Time Example — social live notifications**

### 26.3.4 SSL/TLS Configuration

(See Security notes; deployment angle.)

**🟢 Beginner Example — certbot on nginx**

**🟡 Intermediate Example — HSTS preload**

**🔴 Expert Example — OCSP stapling**

**🌍 Real-Time Example — SaaS custom domain TLS via ACME DNS-01**

### 26.3.5 Load Balancing

**🟢 Beginner Example — round robin upstream**

```nginx
upstream app {
    server app1:8000;
    server app2:8000;
}
```

**🟡 Intermediate Example — health checks `/healthz`**

**🔴 Expert Example — sticky sessions only if unavoidable**

**🌍 Real-Time Example — e-commerce regional active-active with sticky cart optional**

---

## 26.4 Database Deployment

### 26.4.1 PostgreSQL Setup

**🟢 Beginner Example — managed RDS**

**🟡 Intermediate Example — parameters**

```text
shared_buffers, work_mem, effective_cache_size tuned to instance RAM
```

**🔴 Expert Example — logical replication to analytics**

**🌍 Real-Time Example — SaaS row-level security per tenant (optional)**

### 26.4.2 MySQL Setup

**🟢 Beginner Example — ENGINE=InnoDB, utf8mb4**

**🟡 Intermediate Example — transaction isolation READ COMMITTED**

**🔴 Expert Example — Galera cluster**

**🌍 Real-Time Example — legacy e-commerce on MySQL 8**

### 26.4.3 Database Migration

**🟢 Beginner Example**

```bash
python manage.py migrate --noinput
```

**🟡 Intermediate Example — CI gate**

```bash
python manage.py makemigrations --check --dry-run
```

**🔴 Expert Example — blue/green expand/contract migrations**

```python
# Phase1: add nullable column → deploy → backfill → Phase2: enforce NOT NULL
```

**🌍 Real-Time Example — social zero-downtime index creation `CONCURRENTLY`**

### 26.4.4 Backup Strategy

**🟢 Beginner Example — nightly `pg_dump`**

**🟡 Intermediate Example — PITR WAL archiving**

**🔴 Expert Example — quarterly restore drills**

**🌍 Real-Time Example — e-commerce compliance: encrypted backups, retention policy**

### 26.4.5 Connection Pooling

**🟢 Beginner Example — PgBouncer transaction mode**

**🟡 Intermediate Example — Django `CONN_MAX_AGE`**

```python
DATABASES["default"]["CONN_MAX_AGE"] = 60
```

**🔴 Expert Example — separate pool for admin tasks**

**🌍 Real-Time Example — SaaS thousands of cheap containers → few DB connections**

---

## 26.5 Docker Deployment

### 26.5.1 Dockerfile Creation

**🟢 Beginner Example**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV DJANGO_SETTINGS_MODULE=proj.settings.prod
CMD ["gunicorn", "proj.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**🟡 Intermediate Example — non-root user**

```dockerfile
RUN useradd -m appuser && chown -R appuser /app
USER appuser
```

**🔴 Expert Example — multi-stage build: builder + slim runtime**

**🌍 Real-Time Example — e-commerce pin system deps for Pillow/heif**

### 26.5.2 Docker Compose

**🟢 Beginner Example**

```yaml
services:
  web:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app
    depends_on: [db, redis]
  db:
    image: postgres:16
  redis:
    image: redis:7
```

**🟡 Intermediate Example — worker service**

```yaml
  worker:
    build: .
    command: celery -A proj worker -l INFO
    depends_on: [redis]
```

**🔴 Expert Example — healthchecks + restart policies**

**🌍 Real-Time Example — local parity with prod compose profiles**

### 26.5.3 Container Management

**🟢 Beginner Example — `docker compose up -d`**

**🟡 Intermediate Example — Kubernetes Deployment + Service**

**🔴 Expert Example — rolling update maxUnavailable 0**

**🌍 Real-Time Example — SaaS GitOps with Argo CD**

### 26.5.4 Networking

**🟢 Beginner Example — internal DNS `db` hostname in compose**

**🟡 Intermediate Example — VPC private subnets for DB**

**🔴 Expert Example — service mesh mTLS**

**🌍 Real-Time Example — social egress allowlist for payment APIs**

### 26.5.5 Volumes

**🟢 Beginner Example — named volume for Postgres data**

**🟡 Intermediate Example — media volume (prefer S3 in prod)**

**🔴 Expert Example — read-only root filesystem + tmpfs**

**🌍 Real-Time Example — e-commerce ephemeral workers for image processing**

---

## 26.6 Cloud Platforms

### 26.6.1 Heroku

**🟢 Beginner Example — `Procfile`**

```text
web: gunicorn proj.wsgi --log-file -
worker: celery -A proj worker -l INFO
release: python manage.py migrate --noinput
```

**🟡 Intermediate Example — `DATABASE_URL` via dj-database-url**

**🔴 Expert Example — Private Spaces + shield Postgres**

**🌍 Real-Time Example — SaaS MVP rapid deploy**

### 26.6.2 AWS

**🟢 Beginner Example — Elastic Beanstalk**

**🟡 Intermediate Example — ECS Fargate + ALB + RDS**

**🔴 Expert Example — multi-AZ RDS, cross-region failover playbook**

**🌍 Real-Time Example — e-commerce CloudFront + S3 static + ECS API**

### 26.6.3 Google Cloud

**🟢 Beginner Example — Cloud Run container**

**🟡 Intermediate Example — Cloud SQL Postgres**

**🔴 Expert Example — VPC connector for private Redis**

**🌍 Real-Time Example — SaaS BigQuery export pipeline**

### 26.6.4 Azure

**🟢 Beginner Example — App Service**

**🟡 Intermediate Example — Azure Database for PostgreSQL Flexible Server**

**🔴 Expert Example — private endpoints**

**🌍 Real-Time Example — enterprise SSO customers on Azure AD**

### 26.6.5 DigitalOcean

**🟢 Beginner Example — Droplet + managed DB**

**🟡 Intermediate Example — App Platform**

**🔴 Expert Example — Spaces CDN for static**

**🌍 Real-Time Example — indie social network cost-optimized stack**

---

## 26.7 Environment Management

### 26.7.1 Environment Variables

**🟢 Beginner Example**

```python
import os
DEBUG = os.environ.get("DEBUG", "False") == "True"
```

**🟡 Intermediate Example — `django-environ`**

```python
import environ
env = environ.Env()
SECRET_KEY = env("SECRET_KEY")
```

**🔴 Expert Example — typed env schema validation at startup**

**🌍 Real-Time Example — e-commerce 12-factor: no secrets in image layers**

### 26.7.2 .env Files

**🟢 Beginner Example — local only**

```bash
# .env (gitignored)
DEBUG=True
SECRET_KEY=dev-not-secret
```

**🟡 Intermediate Example — `python-dotenv` in manage.py for dev**

**🔴 Expert Example — never load .env in production container**

**🌍 Real-Time Example — SaaS developer onboarding doc**

### 26.7.3 Secret Management

**🟢 Beginner Example — platform secret store (AWS Secrets Manager)**

**🟡 Intermediate Example — rotation lambda updates env**

**🔴 Expert Example — sealed secrets in Kubernetes**

**🌍 Real-Time Example — payment API keys per region**

### 26.7.4 Configuration Separation

**🟢 Beginner Example**

```text
settings/
  __init__.py
  base.py
  dev.py
  prod.py
```

**🟡 Intermediate Example — `DJANGO_SETTINGS_MODULE=proj.settings.prod`**

**🔴 Expert Example — feature flags service overrides defaults**

**🌍 Real-Time Example — social gradual feature rollout**

### 26.7.5 Sensitive Data Protection

**🟢 Beginner Example — `.gitignore` for `local_settings.py`**

**🟡 Intermediate Example — pre-commit secret scan (gitleaks)**

**🔴 Expert Example — SOPS encrypted helm values**

**🌍 Real-Time Example — SaaS customer PII field-level encryption**

---

## 26.8 Monitoring and Logging

### 26.8.1 Application Logging

**🟢 Beginner Example**

```python
LOGGING = {
    "version": 1,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
```

**🟡 Intermediate Example — JSON one-line for Loki/ELK**

**🔴 Expert Example — request id middleware adds `extra`**

**🌍 Real-Time Example — e-commerce correlate payment id across services**

### 26.8.2 Error Tracking (Sentry)

**🟢 Beginner Example**

```python
import sentry_sdk
sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], traces_sample_rate=0.1)
```

**🟡 Intermediate Example — scrub sensitive form fields**

**🔴 Expert Example — release health + deploy markers**

**🌍 Real-Time Example — SaaS source maps for SPA + backend linked issues**

### 26.8.3 Performance Monitoring

**🟢 Beginner Example — APM agent auto-instrument Django**

**🟡 Intermediate Example — custom spans around checkout service**

**🔴 Expert Example — SLO dashboards on Apdex**

**🌍 Real-Time Example — social feed p99 regression alert**

### 26.8.4 Health Checks

**🟢 Beginner Example**

```python
from django.http import HttpResponse

def healthz(request):
    return HttpResponse("ok")
```

**🟡 Intermediate Example — deep check DB**

```python
from django.db import connection

def ready(request):
    with connection.cursor() as c:
        c.execute("SELECT 1")
    return HttpResponse("ok")
```

**🔴 Expert Example — separate liveness vs readiness K8s probes**

**🌍 Real-Time Example — e-commerce disable traffic if payment provider circuit open**

### 26.8.5 Log Aggregation

**🟢 Beginner Example — CloudWatch log group**

**🟡 Intermediate Example — Fluent Bit sidecar → OpenSearch**

**🔴 Expert Example — sampling noisy info logs, always error**

**🌍 Real-Time Example — SaaS per-tenant audit stream to SIEM**

---

## Best Practices

- Run `python manage.py check --deploy` in CI against **production settings**.
- Use **environment variables** or a **secret manager**; never commit secrets.
- Serve **static/media** via **CDN/object storage** in real traffic paths.
- Put **Gunicorn/Uvicorn** behind **nginx/ALB**; enforce **TLS** and **HSTS**.
- Use **migrations** with a **zero-downtime** mindset; **backup** before risky ops.
- **Dockerize** with **non-root**, **pinned bases**, and **health checks**.
- Pick cloud primitives for **managed DB** and **autoscaling** early if growth expected.
- **Log structured**, **trace requests**, and **page humans** on user-impacting errors.

---

## Common Mistakes to Avoid

- **`DEBUG=True`** or **`ALLOWED_HOSTS=['*']`** in production.
- Serving **user uploads** from the same path as **code**.
- Running **`runserver`** in production.
- **Unbounded `CONN_MAX_AGE`** without pooler → too many DB connections.
- **Collectstatic** missing in pipeline → 404 CSS in admin.
- **Secrets** baked into Docker image layers.
- **No migration strategy** for large tables → table locks.
- **Health check** hits DB on every kube probe → DB load storm.

---

## Comparison Tables

| App server | Model | Best for |
|------------|-------|----------|
| Gunicorn sync workers | WSGI | Traditional Django |
| Uvicorn workers | ASGI | Async + websockets |
| Hypercorn | ASGI | HTTP/2 experiments |

| Static strategy | When |
|-----------------|------|
| Whitenoise | Simple PaaS / small apps |
| Nginx files | VM classic |
| S3 + CDN | Global users |

| DB hosting | Trade-off |
|-----------|-----------|
| Managed RDS/Cloud SQL | Ops savings |
| Self-hosted | Control, burden |

| Platform | Sweet spot |
|----------|------------|
| Heroku | Speed to market |
| AWS | Breadth |
| Cloud Run | Scale to zero |
| DigitalOcean | Cost clarity |

---

*Django **6.0.3** deployment notes — keep a **runbook** (rollback, backups, on-call) next to infrastructure code.*
