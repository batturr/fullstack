# Deployment

**Deployment** turns your FastAPI project into a **running service** that other systems can reach safely. Production work spans **runtime servers**, **reverse proxies**, **containers**, **cloud platforms**, **Kubernetes**, **CI/CD**, and **operational hardening**—each layer must align with your **threat model**, **SLOs**, and **team skills**.

**How to use these notes:** Sketch the **smallest** production path first (single VM + TLS + process manager), then add **Docker**, **autoscaling**, and **GitOps** when requirements justify complexity.


## 📑 Table of Contents

- [25.1 Deployment Basics](#251-deployment-basics)
  - [25.1.1 Development vs Production](#2511-development-vs-production)
  - [25.1.2 Environment Configuration](#2512-environment-configuration)
  - [25.1.3 Secret Management](#2513-secret-management)
  - [25.1.4 Logging Configuration](#2514-logging-configuration)
  - [25.1.5 Monitoring Setup](#2515-monitoring-setup)
- [25.2 WSGI Servers](#252-wsgi-servers)
  - [25.2.1 Uvicorn](#2521-uvicorn)
  - [25.2.2 Gunicorn](#2522-gunicorn)
  - [25.2.3 Daphne](#2523-daphne)
  - [25.2.4 Hypercorn](#2524-hypercorn)
  - [25.2.5 Server Configuration](#2525-server-configuration)
- [25.3 Reverse Proxy](#253-reverse-proxy)
  - [25.3.1 Nginx Configuration](#2531-nginx-configuration)
  - [25.3.2 Apache Configuration](#2532-apache-configuration)
  - [25.3.3 Load Balancing](#2533-load-balancing)
  - [25.3.4 SSL/TLS Setup](#2534-ssltls-setup)
  - [25.3.5 Proxy Headers](#2535-proxy-headers)
- [25.4 Docker Deployment](#254-docker-deployment)
  - [25.4.1 Docker Basics](#2541-docker-basics)
  - [25.4.2 Dockerfile Creation](#2542-dockerfile-creation)
  - [25.4.3 Image Building](#2543-image-building)
  - [25.4.4 Container Running](#2544-container-running)
  - [25.4.5 Docker Compose](#2545-docker-compose)
- [25.5 Cloud Platforms](#255-cloud-platforms)
  - [25.5.1 Heroku Deployment](#2551-heroku-deployment)
  - [25.5.2 AWS Deployment](#2552-aws-deployment)
  - [25.5.3 Google Cloud Deployment](#2553-google-cloud-deployment)
  - [25.5.4 Azure Deployment](#2554-azure-deployment)
  - [25.5.5 DigitalOcean Deployment](#2555-digitalocean-deployment)
- [25.6 Kubernetes](#256-kubernetes)
  - [25.6.1 Kubernetes Basics](#2561-kubernetes-basics)
  - [25.6.2 Pod Configuration](#2562-pod-configuration)
  - [25.6.3 Service Deployment](#2563-service-deployment)
  - [25.6.4 Ingress Configuration](#2564-ingress-configuration)
  - [25.6.5 Scaling Strategies](#2565-scaling-strategies)
- [25.7 CI/CD Pipeline](#257-cicd-pipeline)
  - [25.7.1 GitHub Actions](#2571-github-actions)
  - [25.7.2 GitLab CI](#2572-gitlab-ci)
  - [25.7.3 Jenkins](#2573-jenkins)
  - [25.7.4 Automated Testing](#2574-automated-testing)
  - [25.7.5 Automated Deployment](#2575-automated-deployment)
- [25.8 Production Considerations](#258-production-considerations)
  - [25.8.1 Security Hardening](#2581-security-hardening)
  - [25.8.2 Error Monitoring](#2582-error-monitoring)
  - [25.8.3 Performance Monitoring](#2583-performance-monitoring)
  - [25.8.4 Backup Strategies](#2584-backup-strategies)
  - [25.8.5 Disaster Recovery](#2585-disaster-recovery)
- [Chapter Key Points, Best Practices, and Common Mistakes (25)](#chapter-key-points-best-practices-and-common-mistakes-25)

---

## 25.1 Deployment Basics

Before choosing exotic platforms, align on **what production means** for your API: **who** calls it, **what** data it handles, and **how** you recover when things break.

### 25.1.1 Development vs Production

        #### Beginner

        Development favors **fast feedback**: auto-reload, verbose errors, local SQLite, and sample data. Production favors **predictability**: pinned dependencies, controlled logging, externalized configuration, and **least surprise** for operators.


```python
            import os

            from fastapi import FastAPI

            DEBUG = os.getenv("ENV", "dev") == "dev"
            app = FastAPI(debug=DEBUG, docs_url="/docs" if DEBUG else None, redoc_url=None)

```

        #### Intermediate

        Use separate **settings modules** or environment classes. Disable **`docs`/`openapi`** publicly if they leak internals; keep them behind auth or VPN when needed.

        #### Expert

        Progressive rollout patterns (**canary**, **blue/green**) reduce blast radius. Pair them with **feature flags** for behavior toggles independent of deploy artifacts.

        **Key Points (25.1.1)**

        - Production is a **bundle** of code + config + infrastructure + runbooks.
- Never enable **debug tracebacks** to the public internet.

        **Best Practices (25.1.1)**

        - Mirror **production-like** data volumes in staging for realistic perf tests.
- Use **immutable** release artifacts (container digest, wheel lockfile).

        **Common Mistakes (25.1.1)**

        - Shipping **`.env`** files with production secrets into the image.
- Treating **staging** as optional when it is your last safety net.



### 25.1.2 Environment Configuration

        #### Beginner

        Environment variables are the lingua franca of **12-factor** apps: database URLs, feature toggles, and log levels land in **`os.environ`** without baking secrets into code.


```python
            from pydantic_settings import BaseSettings, SettingsConfigDict


            class Settings(BaseSettings):
                model_config = SettingsConfigDict(env_file=".env", extra="ignore")
                database_url: str = "sqlite:///./app.db"
                api_hmac_secret: str


            settings = Settings()

```

        #### Intermediate

        Use **Pydantic Settings** (`pydantic-settings`) for typed config with validation, defaults, and `.env` loading in dev only.

        #### Expert

        Expert teams add **config providers** (AWS Parameter Store, Vault) and **schema-versioned** config to support rolling upgrades across API versions.

        **Key Points (25.1.2)**

        - Validate config **at startup**—fail fast on missing secrets.
- Keep **dev** `.env` out of git via `.gitignore`.

        **Best Practices (25.1.2)**

        - Document every env var in **README** or OpenAPI description for operators.

        **Common Mistakes (25.1.2)**

        - Silent **stringly-typed** `os.getenv` without defaults or validation.



### 25.1.3 Secret Management

        #### Beginner

        Secrets are credentials and signing keys—**never** commit them. Beginners should use platform secret stores or encrypted env injection.


```python
            import os

            from fastapi import Depends, HTTPException, Security
            from fastapi.security import APIKeyHeader

            API_KEY = os.environ["INTERNAL_API_KEY"]
            hdr = APIKeyHeader(name="X-Internal-Key", auto_error=False)


            def require_internal(key: str | None = Security(hdr)) -> None:
                if key != API_KEY:
                    raise HTTPException(status_code=401, detail="invalid internal key")

```

        #### Intermediate

        Rotate keys on a schedule; use **short-lived** tokens where possible. Separate **build-time** secrets from **runtime** secrets.

        #### Expert

        Expert: envelope encryption, **HSM** integration, and **break-glass** procedures with audited access.

        **Key Points (25.1.3)**

        - Secrets belong in **stores**, not repositories.
- Principle of **least privilege** for service accounts.

        **Best Practices (25.1.3)**

        - Automate **rotation** with dual-key acceptance windows.

        **Common Mistakes (25.1.3)**

        - Logging headers that accidentally contain **Bearer** tokens.



### 25.1.4 Logging Configuration

        #### Beginner

        Logs help you **reconstruct incidents**. Use structured JSON logs in production for parsing; include **request_id**, **user_id** (hashed if needed), and **route**.


```python
            import logging
            import sys

            LOG_JSON = True


            def setup_logging() -> None:
                root = logging.getLogger()
                root.setLevel(logging.INFO)
                h = logging.StreamHandler(sys.stdout)
                if LOG_JSON:
                    fmt = '{"ts":"%(asctime)s","level":"%(levelname)s","msg":"%(message)s"}'
                else:
                    fmt = "%(asctime)s %(levelname)s %(message)s"
                h.setFormatter(logging.Formatter(fmt))
                root.handlers.clear()
                root.addHandler(h)

```

        #### Intermediate

        Configure **uvicorn** access logs separately from **application** logs. Downsample noisy debug in hot paths.

        #### Expert

        Expert: **PII redaction**, **sampling** for high-cardinality debug, and **log quotas** to prevent disk exhaustion attacks.

        **Key Points (25.1.4)**

        - Correlate logs with **trace/request IDs**.
- Log **outcomes** and **latency**, not giant payloads by default.

        **Best Practices (25.1.4)**

        - Centralize logs with **vector agents** or cloud logging drivers.

        **Common Mistakes (25.1.4)**

        - Printing **`print()`** instead of logger—unstructured and hard to grep.



### 25.1.5 Monitoring Setup

        #### Beginner

        Monitoring means you can answer: **Is it up?** **Is it fast?** **Is it correct enough?** Start with health checks and error rates.


```python
            from fastapi import FastAPI

            app = FastAPI()


            @app.get("/health/live")
            def live() -> dict[str, str]:
                return {"status": "ok"}


            @app.get("/health/ready")
            def ready() -> dict[str, str]:
                # check DB/redis here in real apps
                return {"db": "ok"}

```

        #### Intermediate

        Add **RED** metrics, **synthetic probes**, and **alerting** with actionable runbooks.

        #### Expert

        Expert: **SLOs**, multi-window burn alerts, and **eBPF**-based host metrics paired with app traces.

        **Key Points (25.1.5)**

        - Differentiate **liveness** vs **readiness** probes.
- Alerts should be **symptom-based** where possible.

        **Best Practices (25.1.5)**

        - Dashboard the **same** metrics developers see in staging.

        **Common Mistakes (25.1.5)**

        - Health checks that always return 200 even when **dependencies** are dead.

## 25.2 WSGI Servers

FastAPI is **ASGI-native**. **Uvicorn**, **Hypercorn**, and **Daphne** speak ASGI; **Gunicorn** is often used as a **process manager** in front of Uvicorn workers. Do not confuse **WSGI-only** servers with ASGI needs.

### 25.2.1 Uvicorn

        #### Beginner

        Uvicorn is the de facto **ASGI server** for FastAPI in development and many production setups. It runs an **async event loop** per worker.


```python
            # Procfile-style
            CMD = "uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4"
            print(CMD)

```

        #### Intermediate

        Tune **`--workers`** for CPU-bound sync portions; for pure async I/O, fewer workers with higher concurrency may suffice. Put **TLS termination** at the proxy unless you need end-to-end TLS inside the mesh.

        #### Expert

        Expert: combine Uvicorn workers with **SO_REUSEPORT**, kernel tuning, and **graceful shutdown** hooks that drain connections.

        **Key Points (25.2.1)**

        - Uvicorn serves **`app:app`** callables—import string matters.
- Use **`--proxy-headers`** behind trusted reverse proxies.

        **Best Practices (25.2.1)**

        - Pin **uvicorn** version in `requirements.txt` or lockfile.

        **Common Mistakes (25.2.1)**

        - Running **single-threaded** dev server exposed publicly.



### 25.2.2 Gunicorn

        #### Beginner

        Gunicorn is a **pre-fork** process manager historically for WSGI. With FastAPI, use **`uvicorn.workers.UvicornWorker`** as the worker class.


```python
            CMD = (
                "gunicorn main:app "
                "-k uvicorn.workers.UvicornWorker "
                "-w 4 -b 0.0.0.0:8000 "
                "--timeout 120 --graceful-timeout 30"
            )
            print(CMD)

```

        #### Intermediate

        Gunicorn manages **worker lifecycle**, **timeouts**, and **max requests** to mitigate memory leaks.

        #### Expert

        Expert: integrate **systemd** or **supervisor** for restart policies; align **`worker_tmp_dir`** and **`graceful_timeout`** with deploy orchestration.

        **Key Points (25.2.2)**

        - Gunicorn + UvicornWorker is a **common** production pattern.
- Tune **timeouts** longer than your slowest legitimate request.

        **Best Practices (25.2.2)**

        - Use **`max_requests`** to recycle workers periodically.

        **Common Mistakes (25.2.2)**

        - Using **sync workers** for ASGI apps—won't work as expected.



### 25.2.3 Daphne

        #### Beginner

        Daphne is an ASGI server from the **Django Channels** ecosystem. It supports HTTP and WebSockets and can run FastAPI apps.


```python
            CMD = "daphne -b 0.0.0.0 -p 8000 main:app"
            print(CMD)

```

        #### Intermediate

        Choose Daphne when your org standardizes on Channels infrastructure or you need **uniform** ASGI hosting across Django and FastAPI services.

        #### Expert

        Expert: validate **HTTP/2** and **WebSocket** proxy paths through your load balancer when mixing protocols.

        **Key Points (25.2.3)**

        - Daphne is **ASGI**—compatible with FastAPI's stack.

        **Best Practices (25.2.3)**

        - Benchmark **your** workload—don't assume parity with Uvicorn.

        **Common Mistakes (25.2.3)**

        - Mixing **WSGI** assumptions (middleware ordering) with ASGI servers.



### 25.2.4 Hypercorn

        #### Beginner

        Hypercorn is an ASGI server with **HTTP/2** and **HTTP/3** (QUIC) options—useful when modern protocol features matter.


```python
            CMD = "hypercorn main:app --bind 0.0.0.0:8000"
            print(CMD)

```

        #### Intermediate

        Deploy behind proxies that preserve **protocol semantics**; HTTP/3 requires **UDP** exposure and careful firewall rules.

        #### Expert

        Expert: evaluate **TLS 1.3** settings, **0-RTT** risks, and **alt-svc** headers for gradual QUIC adoption.

        **Key Points (25.2.4)**

        - Protocol choice is a **security** and **ops** decision, not only perf.

        **Best Practices (25.2.4)**

        - Test **WebSockets** through the same server config you ship.

        **Common Mistakes (25.2.4)**

        - Opening **UDP** for QUIC without **DDoS** mitigation.



### 25.2.5 Server Configuration

        #### Beginner

        Server configuration spans **bind addresses**, **worker counts**, **timeouts**, **keep-alive**, and **file descriptor limits**.


```python
            # Uvicorn knobs (illustrative)
            UVICORN_FLAGS = [
                "--host 0.0.0.0",
                "--port 8000",
                "--workers 4",
                "--timeout-keep-alive 5",
                "--limit-concurrency 1000",
            ]
            print(" ".join(UVICORN_FLAGS))

```

        #### Intermediate

        Set **`limit-request-line`** equivalents at the proxy; in ASGI, configure **`--timeout-keep-alive`** on Uvicorn to match upstream idle timeouts.

        #### Expert

        Expert: coordinate **backlog**, **`somaxconn`**, and **autoscaling** to avoid accept-queue drops during flash crowds.

        **Key Points (25.2.5)**

        - Align **keep-alive** between app server and reverse proxy.

        **Best Practices (25.2.5)**

        - Load test after changing **worker** or **concurrency** limits.

        **Common Mistakes (25.2.5)**

        - Oversubscribing **workers** vs CPU—context switch thrash.

## 25.3 Reverse Proxy

A **reverse proxy** terminates TLS, enforces request size limits, adds **compression**, and routes traffic to app processes. **Nginx** and **Apache** are common front doors for FastAPI.

### 25.3.1 Nginx Configuration

        #### Beginner

        Nginx sits on **:443**, forwards to **127.0.0.1:8000**, and can serve **static** assets directly—freeing Python for API work.


```python
            NGINX = '''
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
            '''
            print(NGINX)

```

        #### Intermediate

        Enable **`proxy_set_header`** for `Host`, `X-Forwarded-For`, `X-Forwarded-Proto` so FastAPI sees original client context when using `ProxyHeadersMiddleware`.

        #### Expert

        Expert: tune **`worker_connections`**, **`proxy_buffering`** for streaming endpoints, and **rate limiting** zones at the edge.

        **Key Points (25.3.1)**

        - Terminate **TLS** at the proxy unless you need end-to-end encryption inside.
- Pass **`X-Forwarded-*`** consistently.

        **Best Practices (25.3.1)**

        - Use **`limit_req`** for basic edge protection.

        **Common Mistakes (25.3.1)**

        - Trusting **all** `X-Forwarded-For` without controlling the proxy hop.



### 25.3.2 Apache Configuration

        #### Beginner

        Apache **`mod_proxy`** + **`mod_proxy_http`** can reverse-proxy to Uvicorn similarly to Nginx.


```python
            APACHE = '''
            ProxyPass / http://127.0.0.1:8000/
            ProxyPassReverse / http://127.0.0.1:8000/
            RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}
            '''
            print(APACHE)

```

        #### Intermediate

        Use **`ProxyPreserveHost On`** and **`RequestHeader set X-Forwarded-Proto`** for correct scheme hints.

        #### Expert

        Expert: integrate with **mod_security** for WAF-style rules when compliance requires it.

        **Key Points (25.3.2)**

        - Apache remains common in **enterprise** estates—both are viable.

        **Best Practices (25.3.2)**

        - Keep **timeout** directives aligned with long-running uploads/streams.

        **Common Mistakes (25.3.2)**

        - Forgetting **`ProxyPassReverse`**—breaks redirects.



### 25.3.3 Load Balancing

        #### Beginner

        Load balancing spreads traffic across **multiple app instances** for throughput and fault tolerance.


```python
            UPSTREAM = '''
            upstream fastapi_app {
              least_conn;
              server 10.0.1.10:8000;
              server 10.0.1.11:8000;
            }
            '''
            print(UPSTREAM)

```

        #### Intermediate

        Algorithms: **round-robin**, **least connections**, **IP hash** (session stickiness). Health checks should hit **`/health/ready`** not trivial always-200 endpoints.

        #### Expert

        Expert: **connection draining** during deploys, **zone-aware** routing in multi-AZ clouds, and **autoscaling** signals based on saturation not just CPU.

        **Key Points (25.3.3)**

        - Balance on **capacity**, not only instance count.

        **Best Practices (25.3.3)**

        - Configure **sticky sessions** only when required—prefer stateless APIs.

        **Common Mistakes (25.3.3)**

        - Uneven **hot shards** when hashing poorly distributed keys.



### 25.3.4 SSL/TLS Setup

        #### Beginner

        TLS protects data in transit. Use **Let's Encrypt** or managed certs; disable legacy protocols (**SSLv3**, **TLS1.0**).


```python
            SSL_PARAMS = {
                "protocols": ["TLSv1.2", "TLSv1.3"],
                "hsts_max_age": 31536000,
            }
            print(SSL_PARAMS)

```

        #### Intermediate

        Enable **HSTS** after you are sure HTTPS works everywhere. Prefer **TLS 1.2+** with modern cipher suites.

        #### Expert

        Expert: **OCSP stapling**, **mTLS** for service-to-service, and **certificate rotation** automation.

        **Key Points (25.3.4)**

        - TLS is **default**, not optional, for public APIs.

        **Best Practices (25.3.4)**

        - Automate **renewal**; alert on **expiry** windows.

        **Common Mistakes (25.3.4)**

        - Mixed **HTTP/HTTPS** content breaking clients.



### 25.3.5 Proxy Headers

        #### Beginner

        Proxies add headers so apps know the **original scheme/host/client IP**. FastAPI/Starlette can trust these via **`ForwardedHeadersMiddleware`** (configure trusted hosts!).


```python
            from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

            from fastapi import FastAPI

            app = FastAPI()
            app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

```

        #### Intermediate

        Misconfigured trust enables **IP spoofing** and **open redirect** surprises when generating absolute URLs.

        #### Expert

        Expert: normalize on **`Forwarded`** (RFC 7239) in greenfield designs while supporting **`X-Forwarded-*`** for compatibility.

        **Key Points (25.3.5)**

        - Never trust forwarded headers from **untrusted** hops.

        **Best Practices (25.3.5)**

        - Restrict **`trusted_hosts`** to your proxy IPs or internal network.

        **Common Mistakes (25.3.5)**

        - Using `trusted_hosts="*"` on **public** internet-facing apps.

## 25.4 Docker Deployment

**Docker** packages your app with its OS-level dependencies into an **image** you can run anywhere consistently—dev laptop to Kubernetes.

### 25.4.1 Docker Basics

        #### Beginner

        An **image** is a blueprint; a **container** is a running instance. **Layers** cache build steps—order Dockerfile instructions from least to most frequently changing.


```python
            # docker run example
            RUN_CMD = "docker run --rm -p 8000:8000 -e DATABASE_URL=... myapi:1.2.3"
            print(RUN_CMD)

```

        #### Intermediate

        Use **multi-stage builds** to keep runtime images small. Run as **non-root** inside the container.

        #### Expert

        Expert: scan images (**Trivy**, **Grype**), sign with **cosign**, and pin **digest** in production deploy manifests.

        **Key Points (25.4.1)**

        - Containers **isolate** processes—not a substitute for full VM isolation assumptions.

        **Best Practices (25.4.1)**

        - Use **.dockerignore** to skip `venv`, `.git`, and local artifacts.

        **Common Mistakes (25.4.1)**

        - Running **as root** in production images.



### 25.4.2 Dockerfile Creation

        #### Beginner

        A Dockerfile for FastAPI installs deps, copies code, exposes a port, and sets **`CMD`** to launch Uvicorn/Gunicorn.


```python
            DOCKERFILE = '''
            FROM python:3.12-slim AS base
            WORKDIR /app
            COPY requirements.txt .
            RUN pip install --no-cache-dir -r requirements.txt
            COPY . .
            EXPOSE 8000
            CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
            '''
            print(DOCKERFILE)

```

        #### Intermediate

        Install **build dependencies** in builder stage; copy only wheels/sdist to runtime. Use **`PYTHONDONTWRITEBYTECODE`** and **`PYTHONUNBUFFERED`** for cleaner logs.

        #### Expert

        Expert: **distroless** or **slim** bases, **SBOM** export in CI, and reproducible builds with **`--platform`** for multi-arch.

        **Key Points (25.4.2)**

        - Pin base image **tags** or digests.

        **Best Practices (25.4.2)**

        - Separate **dev** Dockerfile from **prod** if tooling diverges.

        **Common Mistakes (25.4.2)**

        - Copying **secrets** into layers.



### 25.4.3 Image Building

        #### Beginner

        Build with **`docker build -t myapi:gitsha .`**. Tag with **semantic versions** and **immutable** digests for rollbacks.


```python
            BUILD = "docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/acme/api:1.4.0 ."
            print(BUILD)

```

        #### Intermediate

        Use **BuildKit** cache mounts for `pip` to accelerate CI. Push to a **registry** (ECR, GCR, GHCR).

        #### Expert

        Expert: **parallel** matrix builds for `amd64`/`arm64`; **vulnerability gates** blocking deploy on critical CVEs without exceptions.

        **Key Points (25.4.3)**

        - Reproducible builds require **locked** dependencies.

        **Best Practices (25.4.3)**

        - Promote the **same** digest from staging to prod.

        **Common Mistakes (25.4.3)**

        - Using **`latest`** tag as the only production reference.



### 25.4.4 Container Running

        #### Beginner

        Run with **resource limits** (`--memory`, `--cpus`) so noisy neighbors don't take the node down. Map ports explicitly.


```python
            RUN = "docker run -d --name api -p 8000:8000 --read-only --tmpfs /tmp myapi:1.4.0"
            print(RUN)

```

        #### Intermediate

        Inject secrets via **runtime** (`docker secret`, K8s secret, cloud env)—not baked in.

        #### Expert

        Expert: **read-only rootfs**, **`tmpfs`** for writable scratch, **`cap_drop: ALL`** style hardening on orchestrators.

        **Key Points (25.4.4)**

        - Set **`restart` policies** appropriate to orchestration layer.

        **Best Practices (25.4.4)**

        - Healthcheck in Docker aligns with **`/health`** endpoints.

        **Common Mistakes (25.4.4)**

        - Unbounded **log** growth inside container writable layer.



### 25.4.5 Docker Compose

        #### Beginner

        Compose defines **multi-container** dev stacks: API + Postgres + Redis + worker. Use **profiles** for optional services.


```python
            COMPOSE = '''
            services:
              api:
                build: .
                ports: ["8000:8000"]
                environment:
                  DATABASE_URL: postgres://db:5432/app
                depends_on: [db]
              db:
                image: postgres:16
                environment:
                  POSTGRES_PASSWORD: devpass
            '''
            print(COMPOSE)

```

        #### Intermediate

        Bind-mount code for **hot reload** in dev; use **named volumes** for database persistence.

        #### Expert

        Expert: Compose for **integration tests** in CI with **`docker compose run`**; avoid using Compose as a full prod orchestrator at large scale.

        **Key Points (25.4.5)**

        - Compose excels at **local parity** with prod dependencies.

        **Best Practices (25.4.5)**

        - Use **`.env` files** for dev-only secrets.

        **Common Mistakes (25.4.5)**

        - Using **dev** compose files unchanged in production.

## 25.5 Cloud Platforms

Cloud platforms provide **managed** load balancers, databases, and autoscaling. FastAPI is just a process listening on a port—platforms differ in **how** they deliver traffic and secrets.

### 25.5.1 Heroku Deployment

        #### Beginner

        Heroku uses a **`Procfile`** (`web: gunicorn ...`) and **buildpacks** or **containers**. Config goes in **config vars**.


```python
            PROCFILE = "web: gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT"
            print(PROCFILE)

```

        #### Intermediate

        Attach **Postgres** add-ons; use **`DATABASE_URL`** injection. Expect **ephemeral filesystem**—use object storage for uploads.

        #### Expert

        Expert: watch **dyno** sleep on free tiers; optimize **cold starts** or move to always-on plans for latency-sensitive APIs.

        **Key Points (25.5.1)**

        - Bind to **`$PORT`** platform-provided.

        **Best Practices (25.5.1)**

        - Use **`release` phase** for migrations when supported.

        **Common Mistakes (25.5.1)**

        - Storing **uploads** on local disk expecting persistence.



### 25.5.2 AWS Deployment

        #### Beginner

        Common paths: **ECS/Fargate** tasks, **Elastic Beanstalk**, **Lambda** (with adapters), or **EKS**. Pair with **ALB** for TLS and routing.


```python
            # Pseudocode: boto3 fetch secret at startup
            import boto3


            def load_secret(name: str) -> str:
                client = boto3.client("secretsmanager")
                return client.get_secret_value(SecretId=name)["SecretString"]

```

        #### Intermediate

        Store secrets in **SSM Parameter Store** or **Secrets Manager**. Use **IAM roles** for tasks—no long-lived keys in env if avoidable.

        #### Expert

        Expert: **multi-AZ** RDS, **autoscaling** on custom metrics (queue depth), and **WAF** on ALB for edge protection.

        **Key Points (25.5.2)**

        - Prefer **IAM roles** over static AWS keys in containers.

        **Best Practices (25.5.2)**

        - Centralize **observability** with CloudWatch + X-Ray or OTLP.

        **Common Mistakes (25.5.2)**

        - Public **S3** buckets for “simple” file hosting without auth.



### 25.5.3 Google Cloud Deployment

        #### Beginner

        **Cloud Run** is a strong fit for containerized FastAPI: scales to zero, HTTPS front door, simple deploys. **GKE** when you need Kubernetes features.


```python
            DEPLOY = "gcloud run deploy api --image gcr.io/PROJECT/api:1.0 --region us-central1"
            print(DEPLOY)

```

        #### Intermediate

        Use **Secret Manager** + **Workload Identity** for credential-free GCP access from pods.

        #### Expert

        Expert: **Cloud Armor** for edge security, **Cloud CDN** in front of static or cacheable endpoints.

        **Key Points (25.5.3)**

        - Cloud Run respects **concurrency per instance**—tune Uvicorn workers accordingly.

        **Best Practices (25.5.3)**

        - Use **VPC connectors** for private DB access.

        **Common Mistakes (25.5.3)**

        - Oversized **container images** slowing cold starts.



### 25.5.4 Azure Deployment

        #### Beginner

        **Azure App Service** and **Container Apps** host FastAPI containers with managed TLS. **AKS** for Kubernetes workloads.


```python
            AZ = "az containerapp create --image myregistry.azurecr.io/api:1.0 --ingress external"
            print(AZ)

```

        #### Intermediate

        Integrate **Key Vault** references in app settings for secrets.

        #### Expert

        Expert: **private endpoints** for databases, **Azure Front Door** for global routing and WAF.

        **Key Points (25.5.4)**

        - Use **managed identity** instead of embedding service principals.

        **Best Practices (25.5.4)**

        - Align **App Insights** OpenTelemetry exporters early.

        **Common Mistakes (25.5.4)**

        - Misconfigured **CORS** + public storage accounts exposing data.



### 25.5.5 DigitalOcean Deployment

        #### Beginner

        **App Platform** provides Heroku-like flows; **Droplets** give raw VMs for DIY Docker/systemd setups.


```python
            DO_SPEC = {"region": "nyc3", "instance": "basic-xxs", "container_port": 8000}
            print(DO_SPEC)

```

        #### Intermediate

        Good for smaller teams wanting simplicity—still apply **TLS**, **firewalls**, and **backups** manually on Droplets.

        #### Expert

        Expert: use **VPC** peering and **managed DB** for HA instead of single-node Postgres on a Droplet when SLOs demand it.

        **Key Points (25.5.5)**

        - Start simple; **migrate** when observability/HA needs grow.

        **Best Practices (25.5.5)**

        - Automate **snapshots** for stateful services.

        **Common Mistakes (25.5.5)**

        - Exposing **admin ports** (Postgres/Redis) publicly.

## 25.6 Kubernetes

**Kubernetes** schedules containers across a cluster, provides **Services** for stable networking, and **Ingress** for HTTP routing and TLS.

### 25.6.1 Kubernetes Basics

        #### Beginner

        Cluster = **control plane** + **nodes**. You declare **desired state** (Deployments); controllers reconcile reality.


```python
            KUBECTL = "kubectl get pods -n prod"
            print(KUBECTL)

```

        #### Intermediate

        **Pods** are the smallest deploy unit; they are **ephemeral**—store state in PVCs or external stores.

        #### Expert

        Expert: understand **QoS classes**, **taints/tolerations**, and **pod disruption budgets** for resilient rollouts.

        **Key Points (25.6.1)**

        - K8s solves **orchestration**, not application correctness.

        **Best Practices (25.6.1)**

        - Namespaces separate **envs** or teams—use RBAC.

        **Common Mistakes (25.6.1)**

        - Treating pods like **pets** with manual SSH fixes.



### 25.6.2 Pod Configuration

        #### Beginner

        Pods specify **image**, **env**, **resources** (`requests`/`limits`), **probes**, and **securityContext**.


```python
            POD = '''
            containers:
            - name: api
              image: ghcr.io/acme/api:1.4.0
              ports: [{containerPort: 8000}]
              readinessProbe:
                httpGet: { path: /health/ready, port: 8000 }
              resources:
                requests: {cpu: "250m", memory: "512Mi"}
                limits: {cpu: "1", memory: "1Gi"}
            '''
            print(POD)

```

        #### Intermediate

        Set **CPU/memory requests** so the scheduler places work correctly; limits prevent noisy neighbors.

        #### Expert

        Expert: **`shareProcessNamespace`**, **init containers** for migrations, and **sidecars** for mesh/logging.

        **Key Points (25.6.2)**

        - Probes must reflect **real** dependency readiness.

        **Best Practices (25.6.2)**

        - Run as **non-root**; read-only root FS where possible.

        **Common Mistakes (25.6.2)**

        - Missing **resources** → best-effort scheduling chaos.



### 25.6.3 Service Deployment

        #### Beginner

        **Deployment** manages ReplicaSets; **Service** exposes pods via **ClusterIP**, **NodePort**, or **LoadBalancer**.


```python
            SVC = '''
            apiVersion: v1
            kind: Service
            metadata:
              name: api
            spec:
              selector: {app: api}
              ports:
              - port: 80
                targetPort: 8000
            '''
            print(SVC)

```

        #### Intermediate

        Use **ClusterIP** internally + **Ingress** for HTTP(S) in most clusters.

        #### Expert

        Expert: **headless services** for StatefulSets; **topology-aware hints** for same-zone traffic.

        **Key Points (25.6.3)**

        - Label selectors must match **pod template** labels exactly.

        **Best Practices (25.6.3)**

        - Use **network policies** to restrict east-west traffic.

        **Common Mistakes (25.6.3)**

        - Accidentally exposing **ClusterIP** services publicly via sloppy LB.



### 25.6.4 Ingress Configuration

        #### Beginner

        **Ingress** maps hostnames/paths to Services. Implementations: **nginx-ingress**, **Traefik**, cloud LB controllers.


```python
            INGRESS = '''
            rules:
            - host: api.example.com
              http:
                paths:
                - path: /
                  pathType: Prefix
                  backend:
                    service: {name: api, port: {number: 80}}
            '''
            print(INGRESS)

```

        #### Intermediate

        TLS certs via **cert-manager** + Let's Encrypt are standard.

        #### Expert

        Expert: **canary** traffic splitting with service mesh or ingress annotations; **WAF** integration at edge.

        **Key Points (25.6.4)**

        - Ingress is **layer 7**—not a replacement for all L4 needs.

        **Best Practices (25.6.4)**

        - Test **WebSockets** and **large uploads** through ingress timeouts.

        **Common Mistakes (25.6.4)**

        - Wildcard **TLS** without understanding **SAN** coverage.



### 25.6.5 Scaling Strategies

        #### Beginner

        **HPA** scales pods on CPU/custom metrics; **VPA** adjusts requests; **cluster autoscaler** adds nodes.


```python
            HPA = '''
            metrics:
            - type: Resource
              resource:
                name: cpu
                target:
                  type: Utilization
                  averageUtilization: 60
            '''
            print(HPA)

```

        #### Intermediate

        For FastAPI, scale on **request latency**, **queue depth**, or **CPU**—not arbitrary replica counts.

        #### Expert

        Expert: **KEDA** for event-driven scaling; **predictive** scaling using historical seasonality.

        **Key Points (25.6.5)**

        - Scale **before** saturation—laggy HPA causes retries storms.

        **Best Practices (25.6.5)**

        - Cap **maxReplicas** to protect downstream databases.

        **Common Mistakes (25.6.5)**

        - Autoscaling on **CPU alone** while **DB connections** exhaust first.

## 25.7 CI/CD Pipeline

**CI** verifies every change; **CD** ships verified artifacts to environments. FastAPI repos typically run **lint**, **typecheck**, **tests**, **docker build**, and **deploy**.

### 25.7.1 GitHub Actions

        #### Beginner

        GitHub Actions workflows live in **`.github/workflows/`**. Cache **`pip`** and **Docker layers** for speed.


```python
            GHA = '''
            on: [push]
            jobs:
              test:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-python@v5
                    with: {python-version: '3.12'}
                  - run: pip install -r requirements.txt && pytest
            '''
            print(GHA)

```

        #### Intermediate

        Use **OIDC** to AWS/GCP/Azure instead of long-lived cloud keys in secrets.

        #### Expert

        Expert: **reusable workflows**, **environments** with protection rules, and **deployment concurrency** controls.

        **Key Points (25.7.1)**

        - Fail the pipeline on **lint + tests** before deploy jobs.

        **Best Practices (25.7.1)**

        - Sign containers and verify **digest** in deploy job.

        **Common Mistakes (25.7.1)**

        - Storing **cloud keys** in repo secrets without rotation.



### 25.7.2 GitLab CI

        #### Beginner

        `.gitlab-ci.yml` defines **stages** (`test`, `build`, `deploy`). Use **cache** for dependencies.


```python
            GITLAB = '''
            stages: [test, deploy]
            test:
              image: python:3.12
              script: [pip install -r requirements.txt, pytest]
            '''
            print(GITLAB)

```

        #### Intermediate

        GitLab **container registry** pairs naturally with CI build jobs.

        #### Expert

        Expert: **review apps** for PR environments; **parent-child pipelines** for mono-repo services.

        **Key Points (25.7.2)**

        - Mirror **branch protection** rules to pipeline gates.

        **Best Practices (25.7.2)**

        - Use **environments** with **manual** deploy for production.

        **Common Mistakes (25.7.2)**

        - Running **prod deploy** from unprotected branches.



### 25.7.3 Jenkins

        #### Beginner

        Jenkins offers **plugin** ecosystems and on-prem control. Define pipelines in **Jenkinsfile** (Declarative or Scripted).


```python
            JFILE = '''
            pipeline {
              agent any
              stages {
                stage('Test') { steps { sh 'pytest' } }
              }
            }
            '''
            print(JFILE)

```

        #### Intermediate

        Agents can be **ephemeral** Kubernetes pods for isolation.

        #### Expert

        Expert: **shared libraries** for org-wide standards; **credentials** binding with minimal scope.

        **Key Points (25.7.3)**

        - Pin **plugins** versions for reproducibility.

        **Best Practices (25.7.3)**

        - Separate **build** agents from **deploy** credentials.

        **Common Mistakes (25.7.3)**

        - **Groaning** Jenkins without containerized agents—"works on agent" drift.



### 25.7.4 Automated Testing

        #### Beginner

        CI should run **unit** tests (fast) and **integration** tests (DB/HTTP) with **containers** or **test services**.


```python
            # pytest marker example
            import pytest

            @pytest.mark.integration
            def test_health(client):
                r = client.get("/health/live")
                assert r.status_code == 200

```

        #### Intermediate

        Add **contract tests** for external APIs you own/consumers rely on.

        #### Expert

        Expert: **mutation testing** selectively; **load smoke** in staging post-deploy.

        **Key Points (25.7.4)**

        - Flaky tests erode trust—**quarantine** and fix, don't ignore.

        **Best Practices (25.7.4)**

        - Collect **coverage** but gate on meaningful thresholds per package.

        **Common Mistakes (25.7.4)**

        - Only **mock** everything—no real DB/SQL integration coverage.



### 25.7.5 Automated Deployment

        #### Beginner

        Deploy the **same artifact** tested in CI. Use **blue/green** or **rolling** updates with health gates.


```python
            DEPLOY_FLOW = ["build image", "scan image", "push digest", "migrate", "rollout", "smoke tests"]
            print(DEPLOY_FLOW)

```

        #### Intermediate

        Automate **DB migrations** with a **job** that runs before traffic shift—or use expand/contract patterns for risky migrations.

        #### Expert

        Expert: **feature flags** decouple deploy from release; **automatic rollback** on SLO burn.

        **Key Points (25.7.5)**

        - Make rollbacks **one command** to a known-good digest.

        **Best Practices (25.7.5)**

        - Record **changelog** + **deployment notes** automatically.

        **Common Mistakes (25.7.5)**

        - Running **migrations** without backups or **backward-compatible** phases.

## 25.8 Production Considerations

Production is where **security**, **reliability**, and **compliance** meet user traffic. FastAPI is one component in a broader system.

### 25.8.1 Security Hardening

        #### Beginner

        Disable unused endpoints, enforce **TLS**, validate **CORS**, sanitize **inputs**, and keep dependencies **patched**.


```python
            from fastapi import FastAPI
            from starlette.middleware.trustedhost import TrustedHostMiddleware

            app = FastAPI()
            app.add_middleware(TrustedHostMiddleware, allowed_hosts=["api.example.com", "*.example.com"])

```

        #### Intermediate

        Apply **CSP** for any served HTML; use **security headers** at the proxy.

        #### Expert

        Expert: **zero trust** networking, **mTLS** service mesh, continuous **SBOM** diffing on builds.

        **Key Points (25.8.1)**

        - Defense in depth: **app + proxy + IAM**.

        **Best Practices (25.8.1)**

        - Run **`pip-audit`** / **`uv pip audit`** in CI.

        **Common Mistakes (25.8.1)**

        - Trusting **all origins** with credentials enabled.



### 25.8.2 Error Monitoring

        #### Beginner

        Capture **stack traces** with **Sentry**, Rollbar, or OpenTelemetry logs—scrub PII.


```python
            # Conceptual Sentry init (install sentry-sdk)
            INIT = '''
            import sentry_sdk
            sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], traces_sample_rate=0.1)
            '''
            print(INIT)

```

        #### Intermediate

        Tag releases with **version** and **git SHA** for correlation.

        #### Expert

        Expert: **ownership** routing in on-call tools; **anomaly detection** on error rates.

        **Key Points (25.8.2)**

        - Sample **transactions** in high-traffic systems.

        **Best Practices (25.8.2)**

        - Include **request_id** in error reports.

        **Common Mistakes (25.8.2)**

        - Shipping **PII** in breadcrumbs.



### 25.8.3 Performance Monitoring

        #### Beginner

        APM tools show **slow spans** (DB, HTTP). Pair with **metrics** from Topic 24.


```python
            METRICS = ["process_cpu_seconds_total", "http_request_duration_seconds_bucket"]
            print(METRICS)

```

        #### Intermediate

        Define **SLOs** (availability/latency) and track **error budgets**.

        #### Expert

        Expert: **continuous profiling** in prod (careful overhead), **RUM** for client-perceived latency if you control clients.

        **Key Points (25.8.3)**

        - Measure **user-facing** latency at the edge, not only inside Python.

        **Best Practices (25.8.3)**

        - Alert on **burn rates**, not instantaneous blips only.

        **Common Mistakes (25.8.3)**

        - Optimizing code before fixing **missing indexes**.



### 25.8.4 Backup Strategies

        #### Beginner

        Back up **databases** and **object storage** policies. Test **restores** regularly—untested backups are wishful thinking.


```python
            BACKUP = {"rpo_minutes": 15, "rto_minutes": 60, "encrypted": True}
            print(BACKUP)

```

        #### Intermediate

        Use **PITR** where available; encrypt backups at rest.

        #### Expert

        Expert: **cross-region** replication, **legal hold** workflows, and **restore drills** with RTO/RPO targets.

        **Key Points (25.8.4)**

        - Automate backups; **verify** with scheduled restores.

        **Best Practices (25.8.4)**

        - Separate **secrets** from backup bundles.

        **Common Mistakes (25.8.4)**

        - Assuming **cloud provider** "backs up everything" without configuration.



### 25.8.5 Disaster Recovery

        #### Beginner

        DR plans cover **region loss**, **operator errors**, and **ransomware**. Document **runbooks** and **communication** trees.


```python
            DR = ["detect", "declare incident", "failover DNS", "restore DB", "validate SLO", "postmortem"]
            print(DR)

```

        #### Intermediate

        Practice **game days**; keep **infra as code** to rebuild quickly.

        #### Expert

        Expert: **active-active** multi-region with data **conflict resolution** strategies—expensive, only when business demands.

        **Key Points (25.8.5)**

        - DR is **process + data**, not only multi-region k8s.

        **Best Practices (25.8.5)**

        - Store **runbooks** next to the service repo.

        **Common Mistakes (25.8.5)**

        - Assuming **Kubernetes** alone provides DR without data strategy.



        ---

        ## Chapter Key Points, Best Practices, and Common Mistakes (25)

        ### Key Points

        - FastAPI deploys as **ASGI** behind **TLS** proxies with **externalized** config.
- Pick **servers** and **worker** models aligned to sync/async workload.
- Containers + **CI/CD** give **repeatable** releases; K8s adds **orchestration** complexity.
- Cloud platforms differ in **secrets**, **networking**, and **scaling** primitives.
- Production requires **monitoring**, **security**, **backups**, and **tested recovery**.

        ### Best Practices

        - Use **health/readiness** probes and meaningful **SLOs**.
- Pin images and **promote digests** through environments.
- Automate **migrations** with safe **expand/contract** patterns.
- Trust **forwarded headers** only from controlled proxies.
- Practice **restore** drills quarterly.

        ### Common Mistakes

        - Running dev servers **publicly** with debug on.
- No **resource limits** in containers/K8s.
- Secrets in **git** or Docker layers.
- CI green but **no integration** tests touching real SQL.
- Assuming backups work without **ever** restoring.

