# Flask 3.1.3 — Deployment

Moving a **Flask 3.1.3** app to production means choosing a **WSGI server**, a **reverse proxy**, **secrets management**, and often **containers**, **cloud**, **Kubernetes**, and **CI/CD**. These notes connect each layer to **e-commerce uptime**, **social traffic spikes**, and **SaaS multi-tenant operations** on Python 3.9+.

---

## 📑 Table of Contents

1. [26.1 Deployment Basics](#261-deployment-basics)
2. [26.2 WSGI Servers](#262-wsgi-servers)
3. [26.3 Reverse Proxy](#263-reverse-proxy)
4. [26.4 Docker Deployment](#264-docker-deployment)
5. [26.5 Cloud Deployment](#265-cloud-deployment)
6. [26.6 Kubernetes](#266-kubernetes)
7. [26.7 CI/CD Pipeline](#267-cicd-pipeline)
8. [26.8 Production Monitoring](#268-production-monitoring)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
11. [Comparison Tables](#comparison-tables)
12. [Appendix — Runbooks](#appendix--runbooks)

---

## 26.1 Deployment Basics

### Development vs Production

**🟢 Beginner Example — `FLASK_ENV` / `DEBUG`**

```python
import os

class Config:
    DEBUG = False
    TESTING = False

class DevConfig(Config):
    DEBUG = True

class ProdConfig(Config):
    DEBUG = False
```

**🟡 Intermediate Example — `create_app` config object**

```python
def create_app():
    app = Flask(__name__)
    cfg = os.environ.get("APP_CONFIG", "config.ProdConfig")
    app.config.from_object(cfg)
    return app
```

**🔴 Expert Example — split settings: public vs secret**

```python
# config.py non-secret; secrets from env/secret store only
```

**🌍 Real-Time Example — e-commerce**

Prod disables Werkzeug debugger; staging mirrors prod flags but smaller resources.

### Configuration Management

**🟢 Beginner Example — `.env` locally (not committed)**

```bash
export DATABASE_URL=postgres://...
export SECRET_KEY=...
```

**🟡 Intermediate Example — `pydantic-settings`**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str

    class Config:
        env_file = ".env"

settings = Settings()
```

**🔴 Expert Example — layered config: defaults < file < env < CLI**

**🌍 Real-Time Example — SaaS**

Helm values per region; secrets from cloud KMS.

### Environment Variables

**🟢 Beginner Example — read in app**

```python
import os
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
```

**🟡 Intermediate Example — 12-factor alignment**

```text
Store connection strings, feature flags, log level in env
```

**🔴 Expert Example — k8s `envFrom` secret + configmap**

**🌍 Real-Time Example — social**

Blue/green toggles via `DEPLOY_COLOR=green`.

### Secret Management

**🟢 Beginner Example — never commit `SECRET_KEY`**

**🟡 Intermediate Example — AWS Secrets Manager**

```python
import boto3, json

def load_secret(name: str) -> dict:
    client = boto3.client("secretsmanager")
    raw = client.get_secret_value(SecretId=name)["SecretString"]
    return json.loads(raw)
```

**🔴 Expert Example — short-lived DB creds via IAM auth**

**🌍 Real-Time Example — e-commerce PSP keys**

Rotate Stripe secrets with zero-downtime dual-key window.

### Logging Configuration

**🟢 Beginner Example — JSON logs**

```python
import logging, json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({"message": record.getMessage(), "level": record.levelname})

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
```

**🟡 Intermediate Example — request id filter**

```python
import uuid
from flask import g, request

@app.before_request
def rid():
    g.request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = getattr(g, "request_id", "-")
        return True
```

**🔴 Expert Example — log sampling for high RPS**

**🌍 Real-Time Example — SaaS**

Ship logs to OpenSearch; retention 30 days with PII scrubbing.

---

## 26.2 WSGI Servers

### Gunicorn Setup

**🟢 Beginner Example**

```bash
gunicorn -w 4 -b 0.0.0.0:8000 "myapp:create_app()"
```

**🟡 Intermediate Example — config file**

```python
# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "gthread"
threads = 8
timeout = 30
```

```bash
gunicorn -c gunicorn.conf.py "myapp:create_app()"
```

**🔴 Expert Example — `preload_app` for memory sharing (watch fork safety)**

**🌍 Real-Time Example — e-commerce**

4 workers × 8 threads tuned after load test; separate pool for admin if needed.

### Gunicorn Configuration

**🟢 Beginner Example — `workers = (2 × CPU) + 1` rule of thumb**

**🟡 Intermediate Example — `graceful_timeout` for long requests**

**🔴 Expert Example — `worker_tmp_dir` on `/dev/shm` for heartbeat**

**🌍 Real-Time Example — SaaS CSV export**

Move long jobs to workers; keep HTTP timeout low.

### Worker Types

**🟢 Beginner Example — sync workers**

```bash
gunicorn -k sync ...
```

**🟡 Intermediate Example — `gthread`**

```bash
gunicorn -k gthread --threads 8 ...
```

**🔴 Expert Example — gevent (evaluate compatibility)**

**🌍 Real-Time Example — social**

Mostly `gthread` for mixed IO/CPU Flask routes.

### Worker Processes

**🟢 Beginner Example — `-w 4`**

**🟡 Intermediate Example — recycle**

```bash
gunicorn --max-requests 2000 --max-requests-jitter 200 ...
```

**🔴 Expert Example — pin workers to NUMA (large metal)**

**🌍 Real-Time Example — e-commerce Black Friday**

Temporarily scale replicas, not only threads.

### Performance Tuning

**🟢 Beginner Example — increase workers until CPU ~70%**

**🟡 Intermediate Example — tune DB pool to worker×thread count**

**🔴 Expert Example — cgroups memory limits + OOM awareness**

**🌍 Real-Time Example — SaaS noisy neighbor**

Separate deployments per large customer.

---

## 26.3 Reverse Proxy

### Nginx Configuration

**🟢 Beginner Example**

```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**🟡 Intermediate Example — buffering tuning**

```nginx
proxy_buffering on;
proxy_buffer_size 16k;
proxy_buffers 8 16k;
```

**🔴 Expert Example — `proxy_read_timeout` for streaming**

**🌍 Real-Time Example — e-commerce**

Nginx serves static; API proxied to Gunicorn.

### Apache Configuration

**🟢 Beginner Example — `mod_proxy`**

```apache
ProxyPass / http://127.0.0.1:8000/
ProxyPassReverse / http://127.0.0.1:8000/
```

**🟡 Intermediate Example — `RemoteIP` for real client IP**

**🔴 Expert Example — mTLS termination at Apache**

**🌍 Real-Time Example — enterprise hosting**

Apache front-end due to corporate standard.

### Load Balancing

**🟢 Beginner Example — nginx upstream**

```nginx
upstream app {
    least_conn;
    server 10.0.1.10:8000;
    server 10.0.1.11:8000;
}
```

**🟡 Intermediate Example — health checks**

**🔴 Expert Example — global anycast LB**

**🌍 Real-Time Example — social**

Regional LBs during viral event.

### SSL/TLS Setup

**🟢 Beginner Example — certbot certificates**

**🟡 Intermediate Example — TLS 1.2+ only**

**🔴 Expert Example — OCSP stapling**

**🌍 Real-Time Example — SaaS custom domains**

SNI-based certs via ACME DNS challenge.

### Proxy Headers

**🟢 Beginner Example — Flask `ProxyFix`**

```python
from werkzeug.middleware.proxy_fix import ProxyFix

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1, x_prefix=1)
```

**🟡 Intermediate Example — trust only internal subnets**

**🔴 Expert Example — strip client-supplied `X-Forwarded-*` at edge**

**🌍 Real-Time Example — e-commerce**

Correct `url_for(..., _external=True)` behind TLS terminator.

---

## 26.4 Docker Deployment

### Dockerfile Creation

**🟢 Beginner Example**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=myapp:create_app()
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "myapp:create_app()"]
```

**🟡 Intermediate Example — non-root user**

```dockerfile
RUN useradd -m appuser
USER appuser
```

**🔴 Expert Example — distroless final stage (advanced)**

**🌍 Real-Time Example — SaaS**

Scan image with Trivy in CI.

### Image Building

**🟢 Beginner Example**

```bash
docker build -t myapp:1.0.0 .
```

**🟡 Intermediate Example — buildx multi-arch**

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:1.0.0 .
```

**🔴 Expert Example — cache mounts for pip**

```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
```

**🌍 Real-Time Example — e-commerce**

Immutable tags promoted staging→prod.

### Container Running

**🟢 Beginner Example**

```bash
docker run --rm -p 8000:8000 -e DATABASE_URL=... myapp:1.0.0
```

**🟡 Intermediate Example — read-only rootfs**

```bash
docker run --read-only --tmpfs /tmp ...
```

**🔴 Expert Example — seccomp/apparmor profiles**

**🌍 Real-Time Example — social**

Autoscaling ECS tasks.

### Docker Compose

**🟢 Beginner Example**

```yaml
services:
  web:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgres://db:5432/app
    depends_on: [db, redis]
  db:
    image: postgres:16
  redis:
    image: redis:7
```

**🟡 Intermediate Example — healthchecks**

**🔴 Expert Example — compose profiles for observability stack**

**🌍 Real-Time Example — SaaS local dev parity**

### Multi-Stage Builds

**🟢 Beginner Example**

```dockerfile
FROM python:3.11 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel -r requirements.txt -w /wheels

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*
COPY . .
```

**🟡 Intermediate Example — separate test stage**

**🔴 Expert Example — SBOM generation stage**

**🌍 Real-Time Example — e-commerce**

Smaller images → faster deploys during incidents.

---

## 26.5 Cloud Deployment

### Heroku

**🟢 Beginner Example — `Procfile`**

```text
web: gunicorn myapp:create_app() --bind 0.0.0.0:$PORT
```

**🟡 Intermediate Example — `release` phase migrations**

**🔴 Expert Example — private space + VPC peering**

**🌍 Real-Time Example — SaaS MVP**

Fast path; watch dyno costs at scale.

### AWS

**🟢 Beginner Example — Elastic Beanstalk**

**🟡 Intermediate Example — ECS Fargate + ALB**

**🔴 Expert Example — Lambda + API Gateway (Flask via Mangum for async patterns)**

**🌍 Real-Time Example — e-commerce**

RDS Multi-AZ, ElastiCache Redis, S3 static.

### Google Cloud

**🟢 Beginner Example — Cloud Run container**

```bash
gcloud run deploy myapp --image gcr.io/PROJECT/myapp --region us-central1
```

**🟡 Intermediate Example — Cloud SQL**

**🔴 Expert Example — GKE Autopilot**

**🌍 Real-Time Example — SaaS**

Cloud Run scales to zero for internal tools.

### Azure

**🟢 Beginner Example — App Service Python**

**🟡 Intermediate Example — Container Apps**

**🔴 Expert Example — AKS + AGIC**

**🌍 Real-Time Example — enterprise SaaS**

Entra ID integration for admin SSO.

### DigitalOcean

**🟢 Beginner Example — App Platform from repo**

**🟡 Intermediate Example — Droplet + managed DB**

**🔴 Expert Example — Kubernetes DOKS**

**🌍 Real-Time Example — social startup**

Simple ops, predictable pricing.

---

## 26.6 Kubernetes

### Kubernetes Basics

**🟢 Beginner Example — Pod + Deployment**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flask-api
spec:
  replicas: 3
  selector:
    matchLabels: {app: flask-api}
  template:
    metadata:
      labels: {app: flask-api}
    spec:
      containers:
        - name: web
          image: myrepo/flask-api:1.0.0
          ports: [{containerPort: 8000}]
          envFrom:
            - secretRef: {name: flask-secrets}
            - configMapRef: {name: flask-config}
```

**🟡 Intermediate Example — resource requests/limits**

**🔴 Expert Example — topology spread constraints**

**🌍 Real-Time Example — SaaS**

Separate namespaces per env.

### Pod Configuration

**🟢 Beginner Example — liveness/readiness**

```yaml
livenessProbe:
  httpGet: {path: /healthz, port: 8000}
  initialDelaySeconds: 10
readinessProbe:
  httpGet: {path: /ready, port: 8000}
```

**🟡 Intermediate Example — startupProbe for slow boot**

**🔴 Expert Example — shareProcessNamespace for sidecars**

**🌍 Real-Time Example — e-commerce**

Readiness includes DB ping.

### Service Deployment

**🟢 Beginner Example — ClusterIP**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: flask-api
spec:
  selector: {app: flask-api}
  ports:
    - port: 80
      targetPort: 8000
```

**🟡 Intermediate Example — headless service for StatefulSets**

**🔴 Expert Example — internal-only NetworkPolicies**

**🌍 Real-Time Example — social**

gRPC sidecar pattern (if applicable) next to Flask.

### Ingress Configuration

**🟢 Beginner Example — nginx ingress host rule**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: flask-api
                port:
                  number: 80
```

**🟡 Intermediate Example — TLS cert-manager**

**🔴 Expert Example — WAF at edge + ingress**

**🌍 Real-Time Example — SaaS custom domains**

Wildcard certs + external-dns.

### Scaling Strategies

**🟢 Beginner Example — HPA on CPU**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: flask-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: flask-api
  minReplicas: 3
  maxReplicas: 30
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
```

**🟡 Intermediate Example — KEDA on Redis queue depth**

**🔴 Expert Example — cluster autoscaler + overprovisioning**

**🌍 Real-Time Example — e-commerce sale**

Predictive pre-scale + queue-based workers.

---

## 26.7 CI/CD Pipeline

### GitHub Actions

**🟢 Beginner Example**

```yaml
name: ci
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.11"}
      - run: pip install -r requirements.txt
      - run: pytest
```

**🟡 Intermediate Example — build/push image on tag**

**🔴 Expert Example — signed artifacts / SLSA**

**🌍 Real-Time Example — SaaS**

Protected branches + required checks.

### GitLab CI

**🟢 Beginner Example — `.gitlab-ci.yml` stages**

```yaml
stages: [test, build, deploy]
test:
  image: python:3.11
  script:
    - pip install -r requirements.txt
    - pytest
```

**🟡 Intermediate Example — environments with approvals**

**🔴 Expert Example — canary deploy job**

**🌍 Real-Time Example — e-commerce**

Manual production gate during holidays.

### Jenkins

**🟢 Beginner Example — pipeline from SCM**

**🟡 Intermediate Example — shared libraries**

**🔴 Expert Example — self-hosted agents in private VPC**

**🌍 Real-Time Example — enterprise**

Compliance requires on-prem Jenkins.

### Automated Testing

**🟢 Beginner Example — pytest in CI**

**🟡 Intermediate Example — parallel tests + coverage gate**

**🔴 Expert Example — contract tests against OpenAPI**

**🌍 Real-Time Example — social**

Replay production traffic samples in staging.

### Automated Deployment

**🟢 Beginner Example — kubectl apply with Kustomize**

**🟡 Intermediate Example — Argo CD GitOps**

**🔴 Expert Example — progressive delivery (Argo Rollouts)**

**🌍 Real-Time Example — SaaS**

Feature flags decouple deploy from release.

---

## 26.8 Production Monitoring

### Error Monitoring

**🟢 Beginner Example — Sentry SDK**

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], integrations=[FlaskIntegration()])
```

**🟡 Intermediate Example — release + environment tags**

**🔴 Expert Example — PII scrubbing before send**

**🌍 Real-Time Example — e-commerce**

Alert on payment route error spike.

### Performance Monitoring

**🟢 Beginner Example — APM agent (conceptual)**

**🟡 Intermediate Example — OpenTelemetry traces to collector**

**🔴 Expert Example — continuous profiling (Pyroscope)**

**🌍 Real-Time Example — SaaS**

Track p95 regression per route.

### Application Logging

**🟢 Beginner Example — ship stdout to aggregator**

**🟡 Intermediate Example — structured fields + trace correlation**

**🔴 Expert Example — log-based metrics**

**🌍 Real-Time Example — social**

Detect anomaly in 500 rate by region.

### Health Checks

**🟢 Beginner Example**

```python
@app.get("/healthz")
def healthz():
    return {"ok": True}
```

**🟡 Intermediate Example — `/ready` checks dependencies**

```python
@app.get("/ready")
def ready():
    try:
        db.session.execute(text("SELECT 1"))
        return {"db": True}, 200
    except Exception:
        return {"db": False}, 503
```

**🔴 Expert Example — deep checks gated (internal only)**

**🌍 Real-Time Example — e-commerce**

Remove bad pods before customers see errors.

### Alerting

**🟢 Beginner Example — alert on 5xx rate > 1%**

**🟡 Intermediate Example — SLO burn alerts**

**🔴 Expert Example — multi-window, multi-burn-rate**

**🌍 Real-Time Example — SaaS on-call**

PagerDuty routes by service ownership.

---

## Best Practices

1. **Run behind a production WSGI server**, never `flask run` in prod.
2. **Terminate TLS at the edge**; Flask sees HTTP with trusted `X-Forwarded-Proto`.
3. **Use non-root containers** and **read-only filesystems** where possible.
4. **Automate migrations** with a release phase or init container.
5. **Immutable deployments**—new image tag per release.
6. **Health checks** separate **liveness** vs **readiness**.
7. **Centralize logs** and **correlate** with trace IDs.
8. **Test disaster recovery** (restore DB backup quarterly).

---

## Common Mistakes to Avoid

| Mistake | Effect |
|---------|--------|
| `debug=True` in prod | Remote code execution risk |
| Trusting all forwarded headers | Incorrect URLs / IP bypass |
| No worker timeouts | Hung requests pile up |
| Giant Docker images | Slow deploys, large attack surface |
| DB migrations only manual | schema drift |
| No readiness probe | Traffic to broken pods |
| Logging secrets | compliance incident |

---

## Comparison Tables

### Gunicorn vs uWSGI vs Waitress

| Server | Notes |
|--------|-------|
| Gunicorn | Popular, simple, Unix-first |
| uWSGI | Feature-rich, more complex |
| Waitress | Pure Python, cross-platform |

### VM vs Container vs Serverless

| Model | Ops burden | Scaling |
|-------|------------|---------|
| VM | Higher | Manual/autoscale groups |
| Container | Medium | Orchestrator |
| Serverless | Lower | Automatic; cold starts |

### GitOps vs Push Deploy

| Style | Pros | Cons |
|-------|------|------|
| GitOps | Auditable desired state | Learning curve |
| Push scripts | Fast to start | Drift risk |

---

## Appendix — Runbooks

### A. E-Commerce Deploy Freeze

**🟢 Beginner Example — tag release `v2026.03.29`**

**🟡 Intermediate Example — blue/green switch at LB**

**🔴 Expert Example — automatic rollback on SLO violation**

**🌍 Real-Time Example — freeze during holiday except hotfixes**

### B. Social Viral Traffic

**🟢 Beginner Example — scale replicas**

**🟡 Intermediate Example — CDN cache public reads**

**🔴 Expert Example — shed load with 429 + Retry-After**

**🌍 Real-Time Example — protect DB with caching and rate limits**

### C. SaaS Tenant Incident

**🟢 Beginner Example — disable feature flag**

**🟡 Intermediate Example — isolate tenant to dedicated pool**

**🔴 Expert Example — revoke API keys + audit log review**

**🌍 Real-Time Example — data corruption traced to bad migration**

### D. Database Migration Safety

**🟢 Beginner Example — backward-compatible migrations**

**🟡 Intermediate Example — expand/contract pattern**

**🔴 Expert Example — online schema change tools**

**🌍 Real-Time Example — e-commerce add column nullable first**

### E. Secret Rotation

**🟢 Beginner Example — dual-key window for JWT signing**

**🟡 Intermediate Example — rolling restart after new secret mount**

**🔴 Expert Example — HSM-backed keys**

**🌍 Real-Time Example — SaaS customer webhook signing secret rotate**

### F. Image Vulnerability Response

**🟢 Beginner Example — rebuild base image**

**🟡 Intermediate Example — pin to patched digest**

**🔴 Expert Example — emergency virtual patch at WAF**

**🌍 Real-Time Example — log4j-style Python dep CVE triage**

### G. Zero-Downtime Deploy

**🟢 Beginner Example — rolling update maxUnavailable 0**

**🟡 Intermediate Example — preStop hook sleep for connection drain**

**🔴 Expert Example — sync in-flight websocket migrations**

**🌍 Real-Time Example — social chat reconnect storm mitigation**

### H. Cost Guardrails

**🟢 Beginner Example — autoscale max replicas cap**

**🟡 Intermediate Example — budget alerts**

**🔴 Expert Example — rate-based billing alarms per tenant**

**🌍 Real-Time Example — SaaS free tier abuse**

### I. Local Parity

**🟢 Beginner Example — same `gunicorn` command in dev container**

**🟡 Intermediate Example — tilt/devspace**

**🔴 Expert Example — service mesh in mini env**

**🌍 Real-Time Example — reproduce prod header behavior**

### J. Compliance Artifacts

**🟢 Beginner Example — export dependency list**

**🟡 Intermediate Example — SOC2 change management tickets**

**🔴 Expert Example — evidence bundle per release**

**🌍 Real-Time Example — e-commerce PCI segmentation diagram**

---

*Notes version: Flask **3.1.3**, Python **3.9+**, February 2026 release line.*
