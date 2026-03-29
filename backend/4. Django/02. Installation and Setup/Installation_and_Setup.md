# Installation and Setup (Django 6.0.3)

This reference covers installing Django **6.0.3** on **Python 3.12–3.14**, configuring databases, development tooling, and the first-pass `settings.py` values you need before writing features. The examples progress from beginner-friendly commands to production-minded patterns for e-commerce, social, and SaaS deployments.

---

## 📑 Table of Contents

1. [2.1 Prerequisites](#21-prerequisites)
2. [2.2 Django Installation](#22-django-installation)
3. [2.3 Database Setup](#23-database-setup)
4. [2.4 Development Environment](#24-development-environment)
5. [2.5 Initial Configuration](#25-initial-configuration)
6. [Best Practices](#best-practices)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
8. [Comparison Tables](#comparison-tables)

---

## 2.1 Prerequisites

### Python Installation

Install a **64-bit** Python from [python.org](https://www.python.org/downloads/) or your OS package manager. Django 6.0 requires **3.12+**.

#### 🟢 Beginner Example — Check Python

```bash
python3 --version
# Python 3.12.x (or 3.13 / 3.14)
```

#### 🟡 Intermediate Example — `pyenv` for multiple versions

```bash
pyenv install 3.13.1
pyenv local 3.13.1
python -V
```

#### 🔴 Expert Example — Dead-snakes PPA (Linux) or official installers

```bash
# Conceptual: pin interpreter in CI and Docker to the same minor version
```

#### 🌍 Real-Time Example — SaaS CI image

```dockerfile
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
```

---

### pip / Package Management

**pip** installs Django and drivers from PyPI. Prefer **`python -m pip`** so you target the correct interpreter.

#### 🟢 Beginner Example — Upgrade pip

```bash
python3 -m pip install --upgrade pip
```

#### 🟡 Intermediate Example — User installs (no sudo)

```bash
python3 -m pip install --user "Django==6.0.3"
```

#### 🔴 Expert Example — Hash-checked requirements (pip-tools)

```bash
pip-compile --generate-hashes requirements.in
pip-sync requirements.txt
```

#### 🌍 Real-Time Example — E-commerce team policy

```text
Lock files in Git; CI fails if `pip install -r requirements.txt` is not reproducible.
```

---

### Virtual Environments (`venv`)

**venv** isolates dependencies per project—essential when multiple apps need different Django versions.

#### 🟢 Beginner Example — Create and activate (macOS/Linux)

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install "Django==6.0.3"
```

#### 🟡 Intermediate Example — Windows PowerShell

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install "Django==6.0.3"
```

#### 🔴 Expert Example — `.venv` in project + IDE discovery

```text
Add .venv to .gitignore; document `python -m venv .venv` in README.
```

#### 🌍 Real-Time Example — Social app monorepo

```text
One venv per service folder: `api/.venv`, `worker/.venv` if dependencies diverge.
```

---

### Anaconda Setup

**Anaconda/Miniconda** manages Python and scientific stacks; use `conda` or `pip` inside a conda env for Django.

#### 🟢 Beginner Example — New conda env

```bash
conda create -n myshop python=3.13
conda activate myshop
pip install "Django==6.0.3"
```

#### 🟡 Intermediate Example — conda + pip hybrid

```bash
conda install -c conda-forge psycopg
pip install "Django==6.0.3"
```

#### 🔴 Expert Example — Pin in `environment.yml`

```yaml
name: myshop
channels:
  - conda-forge
dependencies:
  - python=3.13
  - pip
  - pip:
      - Django==6.0.3
```

#### 🌍 Real-Time Example — SaaS data science + web

```text
Use conda for ML training images; slim web containers may use plain venv instead.
```

---

### Poetry

**Poetry** manages dependencies and virtualenvs via `pyproject.toml`.

#### 🟢 Beginner Example — New project

```bash
poetry new myshop
cd myshop
poetry add "django@6.0.3"
```

#### 🟡 Intermediate Example — Existing project

```bash
cd /path/to/repo
poetry init
poetry add django@6.0.3 psycopg@binary
poetry run python -m django --version
```

#### 🔴 Expert Example — `poetry.lock` in CI

```yaml
- run: poetry install --no-interaction --no-root
- run: poetry run pytest
```

#### 🌍 Real-Time Example — E-commerce platform

```text
Poetry for library-style packages; Docker build uses `poetry export` to requirements.txt.
```

---

## 2.2 Django Installation

### Via pip

The standard path: create a venv, then `pip install Django`.

#### 🟢 Beginner Example

```bash
python -m venv .venv && source .venv/bin/activate
pip install Django
django-admin --version
```

#### 🟡 Intermediate Example — Exact pin

```bash
pip install "Django==6.0.3"
```

#### 🔴 Expert Example — Extras (optional)

```bash
# Example: database drivers are separate packages
pip install "Django==6.0.3" "psycopg[binary]>=3.2,<4"
```

#### 🌍 Real-Time Example — SaaS staging

```text
Staging uses the same minor Django as prod; feature branches may test RCs in isolated envs.
```

---

### Specific Versions

Always **pin** production versions; upgrade on your schedule after reading release notes.

#### 🟢 Beginner Example — `requirements.txt`

```text
Django==6.0.3
asgiref>=3.8,<4
sqlparse>=0.5,<0.6
```

#### 🟡 Intermediate Example — Install from file

```bash
pip install -r requirements.txt
```

#### 🔴 Expert Example — Upper bounds policy

```text
Allow patch updates only: Django==6.0.* via pip-tools constraints file.
```

#### 🌍 Real-Time Example — E-commerce holiday freeze

```text
Code freeze week: no dependency bumps except critical security patches.
```

---

### From GitHub

Install a **specific commit** for testing fixes before release (not typical in prod).

#### 🟢 Beginner Example

```bash
pip install "git+https://github.com/django/django.git@stable/6.0.x#egg=django"
```

#### 🟡 Intermediate Example — Editable checkout

```bash
git clone https://github.com/django/django.git
cd django
git checkout stable/6.0.x
pip install -e .
```

#### 🔴 Expert Example — Vendored patch (temporary)

```text
Prefer upstream fix; if blocked, fork with a branch and pip VCS URL until merged.
```

#### 🌍 Real-Time Example — Social platform hotfix

```text
Verify security patch in staging from stable branch before PyPI wheel lands.
```

---

### requirements.txt

A **frozen** list of packages for reproducible deploys.

#### 🟢 Beginner Example

```text
Django==6.0.3
gunicorn==23.0.0
```

#### 🟡 Intermediate Example — Split files

```text
# requirements/base.txt
Django==6.0.3

# requirements/dev.txt
-r base.txt
django-debug-toolbar==5.0.1
pytest-django==4.10.0
```

#### 🔴 Expert Example — Hash pinning excerpt

```text
Django==6.0.3 \
    --hash=sha256:...
```

#### 🌍 Real-Time Example — Multi-region SaaS

```text
Same requirements.txt artifact promoted from CI → staging → prod.
```

---

### Managing Dependencies

Use **one tool** consistently (pip-tools, Poetry, uv, PDM). Document upgrade workflow.

#### 🟢 Beginner Example — Freeze current env

```bash
pip freeze > requirements.txt
```

#### 🟡 Intermediate Example — `uv` speed

```bash
uv pip install -r requirements.txt
```

#### 🔴 Expert Example — License/compliance scan

```text
Run pip-audit / safety / internal scanner on lockfiles in CI.
```

#### 🌍 Real-Time Example — Enterprise procurement

```text
Approved package mirror; CI installs only from internal index.
```

---

## 2.3 Database Setup

### SQLite Default

**SQLite** is the default in `settings.py`—zero setup for local development.

#### 🟢 Beginner Example — Default `DATABASES`

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

#### 🟡 Intermediate Example — Busy timeout for locked DB

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "OPTIONS": {
            "timeout": 20,  # seconds to wait on lock
        },
    }
}
```

> For heavy concurrent writes (checkout, inventory), prefer **PostgreSQL**. SQLite is ideal for local dev and low-contention workloads.

#### 🔴 Expert Example — In-memory SQLite for fast tests

```python
import os
if os.environ.get("DJANGO_TESTING"):
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
```

#### 🌍 Real-Time Example — Local e-commerce prototype

```text
SQLite until first deploy; migrate settings to PostgreSQL before concurrent order writes.
```

---

### PostgreSQL

**PostgreSQL** is the most common production choice: robust constraints, JSONB, extensions.

#### 🟢 Beginner Example — Engine config

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "myshop",
        "USER": "myshop",
        "PASSWORD": "secret",
        "HOST": "127.0.0.1",
        "PORT": "5432",
    }
}
```

#### 🟡 Intermediate Example — Environment variables

```python
import os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["POSTGRES_DB"],
        "USER": os.environ["POSTGRES_USER"],
        "PASSWORD": os.environ["POSTGRES_PASSWORD"],
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }
}
```

#### 🔴 Expert Example — Connection pooling (pgbouncer) + `CONN_MAX_AGE`

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "myshop",
        "USER": "myshop",
        "PASSWORD": "secret",
        "HOST": "pgbouncer.internal",
        "PORT": "6432",
        "CONN_MAX_AGE": 60,
        "OPTIONS": {
            "options": "-c statement_timeout=5000",
        },
    }
}
```

#### 🌍 Real-Time Example — SaaS multi-tenant

```text
One database per tenant or shared DB with tenant_id—PostgreSQL handles either at scale with good indexing.
```

---

### MySQL

Use **`django.db.backends.mysql`** with a maintained driver (**mysqlclient** recommended).

#### 🟢 Beginner Example

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "myshop",
        "USER": "root",
        "PASSWORD": "secret",
        "HOST": "127.0.0.1",
        "PORT": "3306",
    }
}
```

#### 🟡 Intermediate Example — Charset options

```python
DATABASES["default"]["OPTIONS"] = {
    "charset": "utf8mb4",
    "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
}
```

#### 🔴 Expert Example — Read replica routing (custom database router)

```python
class PrimaryReplicaRouter:
    def db_for_read(self, model, **hints):
        return "replica"

    def db_for_write(self, model, **hints):
        return "default"
```

#### 🌍 Real-Time Example — E-commerce on managed MySQL

```text
RDS/Aurora MySQL with automated backups; Django migrations run from CI/CD job.
```

---

### MariaDB

Configure as **MySQL** backend with compatible server version; test migrations carefully.

#### 🟢 Beginner Example

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "myshop",
        "USER": "app",
        "PASSWORD": "secret",
        "HOST": "mariadb",
        "PORT": "3306",
    }
}
```

#### 🟡 Intermediate Example — Version check in docs runbook

```sql
SELECT VERSION();
```

#### 🔴 Expert Example — Feature flags for JSON fields

```text
Validate MariaDB version supports fields you use; add CI job against target version.
```

#### 🌍 Real-Time Example — Social app EU hosting

```text
Managed MariaDB in EU region; object storage for media in same jurisdiction.
```

---

### Database Drivers

| Database   | Common driver package   | Notes                          |
| ---------- | ----------------------- | ------------------------------ |
| PostgreSQL | `psycopg` (v3)          | `psycopg[binary]` for wheels   |
| MySQL      | `mysqlclient`           | Requires client libs on image  |
| SQLite     | stdlib `sqlite3`        | No extra install               |

#### 🟢 Beginner Example — Install psycopg

```bash
pip install "psycopg[binary]"
```

#### 🟡 Intermediate Example — `mysqlclient` build deps

```bash
# Debian/Ubuntu example
sudo apt-get install build-essential default-libmysqlclient-dev pkg-config
pip install mysqlclient
```

#### 🔴 Expert Example — SSL for PostgreSQL

```python
DATABASES["default"]["OPTIONS"] = {
    "sslmode": "verify-full",
    "sslrootcert": "/etc/ssl/certs/ca.pem",
}
```

#### 🌍 Real-Time Example — SaaS compliance

```text
TLS to database; private networking; rotate credentials via secrets manager.
```

---

## 2.4 Development Environment

### IDE / Editor Selection

VS Code, PyCharm, and Neovim are common; choose strong **Python + Django** support.

#### 🟢 Beginner Example — VS Code interpreter

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python"
}
```

#### 🟡 Intermediate Example — PyCharm Django project

```text
Mark folder as Django project; set settings module to `myproject.settings`.
```

#### 🔴 Expert Example — Remote dev containers

```json
{
  "name": "Django Dev",
  "image": "mcr.microsoft.com/devcontainers/python:3.13",
  "postCreateCommand": "pip install -r requirements/dev.txt"
}
```

#### 🌍 Real-Time Example — Distributed team

```text
Shared devcontainer.json ensures identical tooling versions.
```

---

### Extensions / Plugins

Python, Django template syntax, REST client, GitLens, and test runners.

#### 🟢 Beginner Example — Ruff extension (lint/format)

```json
{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true
  }
}
```

#### 🟡 Intermediate Example — PyCharm Django support

```text
Enable Django support → runserver configuration → template debugging.
```

#### 🔴 Expert Example — mypy strict in monorepos

```ini
[mypy]
plugins = mypy_django_plugin.main
strict = True
```

#### 🌍 Real-Time Example — SaaS code quality gate

```text
CI runs ruff + mypy + pytest before merge.
```

---

### Django Extensions

**django-extensions** adds `shell_plus`, `show_urls`, and more (dev-only).

#### 🟢 Beginner Example — Install

```bash
pip install django-extensions
```

```python
INSTALLED_APPS += ["django_extensions"]  # dev settings only
```

#### 🟡 Intermediate Example — `shell_plus`

```bash
python manage.py shell_plus
```

#### 🔴 Expert Example — `graph_models` (optional)

```bash
python manage.py graph_models -a -o models.png
```

#### 🌍 Real-Time Example — Onboarding

```text
New hires use shell_plus to explore ORM models quickly.
```

---

### Debugging Tools

Use **pdb** / **breakpoint()**, IDE debuggers, and **django-debug-toolbar** for query insight.

#### 🟢 Beginner Example — `breakpoint()`

```python
def checkout(request):
    breakpoint()
    ...
```

#### 🟡 Intermediate Example — `logging` dictConfig

```python
LOGGING = {
    "version": 1,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
```

#### 🔴 Expert Example — Debug Toolbar (dev)

```python
if DEBUG:
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")
    INTERNAL_IPS = ["127.0.0.1"]
```

#### 🌍 Real-Time Example — E-commerce slow checkout

```text
Toolbar SQL panel finds N+1; fix with select_related; verify in staging.
```

---

### Dev Server Config

`runserver` is for **development only**. Use **Gunicorn/Uvicorn** in production.

#### 🟢 Beginner Example

```bash
python manage.py runserver 0.0.0.0:8000
```

#### 🟡 Intermediate Example — Different settings module

```bash
DJANGO_SETTINGS_MODULE=myproject.settings.dev python manage.py runserver
```

#### 🔴 Expert Example — ASGI with Uvicorn (local)

```bash
uvicorn myproject.asgi:application --reload --port 8000
```

#### 🌍 Real-Time Example — Social real-time features

```text
Channels + Redis locally; production ASGI behind nginx TLS termination.
```

---

## 2.5 Initial Configuration

### settings.py Overview

Central configuration: **installed apps**, **middleware**, **templates**, **database**, **static/media**, **security**, **internationalization**.

#### 🟢 Beginner Example — Minimal awareness

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "change-me"
DEBUG = True
ALLOWED_HOSTS = []
```

#### 🟡 Intermediate Example — Split `settings/base.py`

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
```

#### 🔴 Expert Example — Typed settings helper

```python
def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).lower() in {"1", "true", "yes", "on"}
```

#### 🌍 Real-Time Example — SaaS 12-factor

```text
All sensitive config from environment; settings module selects prod vs dev.
```

---

### INSTALLED_APPS

Lists Django contrib apps and **your** apps. Order matters for templates/static overrides.

#### 🟢 Beginner Example

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "shop",
]
```

#### 🟡 Intermediate Example — Third-party apps

```python
INSTALLED_APPS += [
    "rest_framework",
    "django_filters",
]
```

#### 🔴 Expert Example — Conditional apps

```python
if DEBUG:
    INSTALLED_APPS += ["debug_toolbar"]
```

#### 🌍 Real-Time Example — E-commerce

```text
`shop`, `checkout`, `accounts`, `notifications` as separate apps.
```

---

### Database Config

Already covered in 2.3; ensure **`ATOMIC_REQUESTS`** is understood before enabling globally (performance tradeoffs).

#### 🟢 Beginner Example — Migrate

```bash
python manage.py migrate
```

#### 🟡 Intermediate Example — Router registration

```python
DATABASE_ROUTERS = ["myproject.dbrouters.PrimaryReplicaRouter"]
```

#### 🔴 Expert Example — `TEST` database settings

```python
DATABASES["default"]["TEST"] = {"NAME": "test_myshop"}
```

#### 🌍 Real-Time Example — SaaS CI

```text
Ephemeral PostgreSQL service container for pytest-django.
```

---

### SECRET_KEY

Used for signing sessions and CSRF tokens—**must be unique and secret** in production.

#### 🟢 Beginner Example — Dev placeholder

```python
SECRET_KEY = "dev-only-not-for-production"
```

#### 🟡 Intermediate Example — Env var

```python
SECRET_KEY = os.environ["SECRET_KEY"]
```

#### 🔴 Expert Example — Rotation strategy

```text
Rotate signing keys with downtime window or dual-key validation for custom JWT if applicable.
```

#### 🌍 Real-Time Example — E-commerce PCI-adjacent

```text
Load from KMS; never log settings dict; separate keys per environment.
```

---

### ALLOWED_HOSTS

Hostnames the site can serve—**required when `DEBUG=False`**.

#### 🟢 Beginner Example — Local dev

```python
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
```

#### 🟡 Intermediate Example — Production

```python
ALLOWED_HOSTS = [
    "api.mycompany.com",
    ".mycompany.com",  # subdomains
]
```

#### 🔴 Expert Example — Dynamic from env

```python
ALLOWED_HOSTS = [h.strip() for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h.strip()]
```

#### 🌍 Real-Time Example — SaaS custom domains

```text
Store customer domains in DB; middleware validates Host header against allowlist.
```

---

## Best Practices

- **Always use virtual environments**; never `sudo pip install` Django system-wide.
- **Pin Django** and audit upgrades; read release notes for deprecations.
- **Use PostgreSQL** for production unless requirements are trivial.
- **Keep dev-only apps** (`debug_toolbar`, `django_extensions`) out of production `INSTALLED_APPS`.
- **Secrets in environment variables** or a secrets manager—not in Git.
- **Match CI Python** to production Python minor version.
- **Run `migrate` in CI** against ephemeral DB to catch migration errors early.

---

## Common Mistakes to Avoid

- Installing packages **globally** and fighting version conflicts across projects.
- **Forgetting `ALLOWED_HOSTS`** after setting `DEBUG=False` (DisallowedHost 400).
- Using **SQLite** under high concurrent writes (orders/inventory) without understanding limits.
- Committing **`.env`** files with real credentials.
- Running **`runserver`** in production (no TLS, not hardened).
- **Wildcard `ALLOWED_HOSTS = ['*']`** with `DEBUG=False` and insecure cookies.
- Mixing **MySQL charset** mistakes (`utf8` vs `utf8mb4`) causing emoji bugs.

---

## Comparison Tables

### Virtual environment tools

| Tool    | Pros                    | Cons                    |
| ------- | ----------------------- | ----------------------- |
| venv    | Stdlib, simple          | No lockfile by itself   |
| Poetry  | Lockfile, scripts       | Learning curve          |
| Conda   | Binary scientific deps  | Heavier environments    |
| pip-tools | Reproducible hashes   | Two-step workflow       |

### Database choice (typical)

| Database   | Great for                         | Watch out for              |
| ---------- | --------------------------------- | -------------------------- |
| SQLite     | Local dev, demos, embedded        | Concurrent writes, backups |
| PostgreSQL | Most web apps, complex queries    | Ops complexity (managed helps) |
| MySQL/MariaDB | LAMP stacks, hosting familiarity | Strict SQL modes, versions |

### Dev server vs production server

| Server     | Use in dev | Use in prod |
| ---------- | ---------- | ----------- |
| runserver  | Yes        | No          |
| Gunicorn   | Optional   | Yes (WSGI)  |
| Uvicorn    | Yes (ASGI) | Yes (ASGI)  |

---

*Target stack: **Django 6.0.3**, **Python 3.12–3.14**. Validate configuration against the official Django deployment checklist before launch.*
