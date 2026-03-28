# Installation and Setup

## 📑 Table of Contents

- [2.1 Prerequisites](#21-prerequisites)
  - [2.1.1 Python Installation](#211-python-installation)
  - [2.1.2 pip and Package Management](#212-pip-and-package-management)
  - [2.1.3 Virtual Environment Creation (venv)](#213-virtual-environment-creation-venv)
  - [2.1.4 Conda for Windows/macOS/Linux](#214-conda-for-windowsmacoslinux)
  - [2.1.5 Poetry for Dependency Management](#215-poetry-for-dependency-management)
- [2.2 FastAPI Installation](#22-fastapi-installation)
  - [2.2.1 pip install fastapi](#221-pip-install-fastapi)
  - [2.2.2 Installing with Uvicorn](#222-installing-with-uvicorn)
  - [2.2.3 Installing Optional Dependencies](#223-installing-optional-dependencies)
  - [2.2.4 Using requirements.txt](#224-using-requirementstxt)
  - [2.2.5 Version Management](#225-version-management)
- [2.3 Development Environment Setup](#23-development-environment-setup)
  - [2.3.1 IDE/Editor Choice (VS Code, PyCharm)](#231-ideeditor-choice-vs-code-pycharm)
  - [2.3.2 Extensions and Plugins](#232-extensions-and-plugins)
  - [2.3.3 Linting (pylint, flake8)](#233-linting-pylint-flake8)
  - [2.3.4 Formatting (black, autopep8)](#234-formatting-black-autopep8)
  - [2.3.5 Pre-commit Hooks](#235-pre-commit-hooks)
- [2.4 Running Your First Server](#24-running-your-first-server)
  - [2.4.1 Uvicorn Server Installation](#241-uvicorn-server-installation)
  - [2.4.2 Running FastAPI with Uvicorn](#242-running-fastapi-with-uvicorn)
  - [2.4.3 Auto-reload Development Mode](#243-auto-reload-development-mode)
  - [2.4.4 Accessing the Application](#244-accessing-the-application)
  - [2.4.5 Hot Reloading Configuration](#245-hot-reloading-configuration)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)
- [Appendix: Copy-Paste Setup Recipes](#appendix-copy-paste-setup-recipes)

---

## 2.1 Prerequisites

### 2.1.1 Python Installation

#### Beginner

Before FastAPI, you need a **Python interpreter** on your machine. Visit **python.org** downloads or use your operating system package manager. Verify installation with `python3 --version` (macOS/Linux) or `py -3 --version` (Windows with the Python launcher). You should see **3.8 or newer**; prefer **3.10+** for the best typing ergonomics.

#### Intermediate

On macOS, **Homebrew** (`brew install python@3.12`) is common. On Linux, distribution packages or **pyenv** help manage multiple versions. On Windows, the **Microsoft Store** build or the official installer both work; ensure **“Add Python to PATH”** is selected in the installer. Corporate laptops may require IT-approved installers.

#### Expert

Use **pyenv**, **asdf**, or **mise** to pin per-project Python versions. In **Docker**, choose slim official images (`python:3.12-slim`) and verify **multi-arch** builds (`linux/arm64`) if deploying to ARM servers. Align **CI** images with production **minor** versions.

```python
# verify_python.py — run: python3 verify_python.py
import sys

min_major, min_minor = 3, 10
ok = (sys.version_info.major, sys.version_info.minor) >= (min_major, min_minor)
print(f"Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
print("OK for recommended FastAPI learning track" if ok else "Consider upgrading Python")
```

**Key Points (2.1.1)**

- **Consistent Python** versions across dev/CI/prod prevent mysterious typing/runtime bugs.

**Best Practices (2.1.1)**

- Install **pip** bundled with Python; upgrade with `python -m pip install --upgrade pip` in venvs.

**Common Mistakes (2.1.1)**

- Calling **`python`** when **`python3`** is the correct command on your OS, or vice versa.

---

### 2.1.2 pip and Package Management

#### Beginner

**pip** is Python’s standard package installer. Always prefer **`python -m pip install ...`** so you install into the **same interpreter** you run. List installed packages with `pip list` and show outdated packages with `pip list --outdated`.

#### Intermediate

Understand **`pip install -r requirements.txt`** for reproducible installs. Use **virtual environments** so `pip install fastapi` does not touch system Python. For transitive dependency conflicts, read `pip`’s resolver error messages carefully—they usually suggest constraints.

#### Expert

Advanced: **`pip-tools`** (`pip-compile`) for pinned transitive graphs, **`uv`** for fast installs, **private indexes** with `--index-url`, **wheelhouse** vendoring for air-gapped installs, and **`pip audit`** for CVE scanning.

```bash
# Unix/macOS — always activate venv first
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install fastapi uvicorn
```

```python
# pip_programmatic_check.py
import subprocess
import sys

subprocess.check_call([sys.executable, "-m", "pip", "--version"])
```

**Key Points (2.1.2)**

- **`python -m pip`** avoids PATH confusion between multiple Pythons.

**Best Practices (2.1.2)**

- Pin versions for **applications**; libraries may use ranges.

**Common Mistakes (2.1.2)**

- Mixing **sudo pip install** on macOS/Linux and breaking system tooling.

---

### 2.1.3 Virtual Environment Creation (venv)

#### Beginner

Create a venv with **`python3 -m venv .venv`**. Activate: **macOS/Linux** `source .venv/bin/activate`, **Windows CMD** `.venv\Scripts\activate.bat`, **Windows PowerShell** `.\.venv\Scripts\Activate.ps1`. Your prompt often shows `(.venv)` when active.

#### Intermediate

The venv contains `pyvenv.cfg` pointing to the base interpreter. **Recreate** the venv if you upgrade Python major versions. Use **`.python-version`** with pyenv for team alignment. IDEs can bind interpreters to `.venv/bin/python`.

#### Expert

**PEP 405** venvs are lightweight; **conda** envs additionally manage binary dependencies. For **CI**, create fresh venvs per job for purity. Combine venv with **`pip cache`** in CI for speed.

```bash
# create and activate (Unix)
python3 -m venv .venv
source .venv/bin/activate
which python
python -m pip install -U pip
```

```python
# in_venv_check.py
import sys

in_venv = sys.prefix != sys.base_prefix
print({"running_in_venv": in_venv, "prefix": sys.prefix})
```

**Key Points (2.1.3)**

- **One venv per project** is the default professional workflow.

**Best Practices (2.1.3)**

- Add **`.venv/`** to `.gitignore`.

**Common Mistakes (2.1.3)**

- Committing **`.venv`** to version control.

---

### 2.1.4 Conda for Windows/macOS/Linux

#### Beginner

**Conda** (Anaconda/Miniconda/Mambaforge) creates environments with **`conda create -n myapi python=3.12`** and activates with **`conda activate myapi`**. Install FastAPI from **conda-forge** for community-maintained recipes: `conda install -c conda-forge fastapi uvicorn`.

#### Intermediate

Conda shines when you need **non-Python** dependencies (compilers, CUDA stacks) co-versioned with Python. For pure API services, **venv + pip** is often simpler. **mamba** is a faster conda-compatible solver.

#### Expert

Mixing **conda** and **pip** in the same environment can break reproducibility—install conda packages first, then pip sparingly, or split **conda env** for scientific stack and **separate service** containers for APIs. Export **`conda env export`** for sharing; prefer **`environment.yml`** with pinned builds in production.

```yaml
# environment.yml (illustrative)
name: fastapi-dev
channels:
  - conda-forge
dependencies:
  - python=3.12
  - pip
  - pip:
      - fastapi>=0.110
      - "uvicorn[standard]>=0.27"
```

**Key Points (2.1.4)**

- Conda is optional for FastAPI but valuable for **scientific** stacks.

**Best Practices (2.1.4)**

- Prefer **conda-forge** channel for up-to-date packages.

**Common Mistakes (2.1.4)**

- Heavy **base env** mutations that are hard to reproduce.

---

### 2.1.5 Poetry for Dependency Management

#### Beginner

**Poetry** manages dependencies and packaging via **`pyproject.toml`**. Initialize with **`poetry init`**, add FastAPI with **`poetry add fastapi uvicorn`**, and run commands in the virtualenv with **`poetry run uvicorn main:app --reload`**.

#### Intermediate

Poetry creates its own venv (configurable). **`poetry.lock`** pins transitive dependencies—commit it for apps. Use **`poetry install --no-dev`** in production images when separating dev tools.

#### Expert

Poetry **plugins**, **private repositories**, and **dependency groups** help monorepos. Evaluate **Poetry vs pip-tools vs uv** for your org’s velocity. For Docker, **`poetry export -f requirements.txt`** feeds slim pip-only images.

```toml
# pyproject.toml snippet — Poetry style
[tool.poetry]
name = "fastapi-service"
version = "0.1.0"
description = "Demo API"
authors = ["You <you@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.10"
fastapi = "^0.115.0"
uvicorn = {extras = ["standard"], version = "^0.30.0"}

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### Key Points (Section 2.1)

- **Python + pip + venv** is the universal baseline; **Conda/Poetry** add workflows.
- Always know **which interpreter** runs your code.

### Best Practices (Section 2.1)

- Document **OS-specific** install quirks in your README.

### Common Mistakes (Section 2.1)

- Installing packages **globally** then wondering why versions conflict across projects.

---

## 2.2 FastAPI Installation

### 2.2.1 pip install fastapi

#### Beginner

Minimal install: **`pip install fastapi`**. This pulls FastAPI and its required dependencies (including Pydantic and Starlette). You still need an **ASGI server** such as Uvicorn to run the app in most setups.

#### Intermediate

Check installed version:

```bash
python -m pip show fastapi
```

Upgrade:

```bash
python -m pip install -U fastapi
```

#### Expert

For **air-gapped** installs, download **wheels** on a connected machine and **`pip install --no-index --find-links=./wheels fastapi`**. Mirror internal **PyPI** with **devpi** or **Artifactory** if your enterprise requires it.

```python
# print_fastapi_version.py
import fastapi

print(f"FastAPI {fastapi.__version__}")
```

**Key Points (2.2.1)**

- **`fastapi` package** is the framework; **server** is separate unless bundled in your template.

**Best Practices (2.2.1)**

- Pin **`fastapi`** in application `requirements.txt`.

**Common Mistakes (2.2.1)**

- Installing **only** FastAPI and forgetting **Uvicorn** (or another ASGI server).

---

### 2.2.2 Installing with Uvicorn

#### Beginner

Install Uvicorn alongside FastAPI:

```bash
python -m pip install fastapi uvicorn
```

Or use FastAPI’s optional extras if documented for your version (patterns evolve—verify docs):

```bash
python -m pip install "uvicorn[standard]"
```

The **`[standard]`** extra typically adds performance-related dependencies where supported (e.g., `uvloop`, `httptools` on compatible platforms).

#### Intermediate

**Production** often uses **`gunicorn -k uvicorn.workers.UvicornWorker`** or multiple **Uvicorn worker processes** behind a load balancer. **Development** uses **`--reload`**.

#### Expert

Understand **worker model**: each Uvicorn worker is a process with its own event loop (async). **Shared state** must live outside process memory (Redis, DB) when scaling horizontally.

```bash
# after install
uvicorn main:app --host 127.0.0.1 --port 8000
```

```python
# main.py minimal for uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root() -> dict[str, str]:
    return {"msg": "uvicorn runs this app"}
```

**Key Points (2.2.2)**

- **`uvicorn module:app`** wires the ASGI callable.

**Best Practices (2.2.2)**

- Prefer **`uvicorn[standard]`** in production deployments when compatible.

**Common Mistakes (2.2.2)**

- Running **`python main.py`** without a `if __name__` block that calls `uvicorn.run`—many tutorials use CLI instead.

---

### 2.2.3 Installing Optional Dependencies

#### Beginner

Optional packages improve **JSON speed** (`orjson`), **template** rendering (`jinja2`), **multipart** forms (`python-multipart`), **OAuth** crypto (`python-jose[cryptography]`), **password hashing** (`passlib[bcrypt]`)—install only what you need.

#### Intermediate

Example installs:

```bash
python -m pip install orjson python-multipart
```

FastAPI can use **`ORJSONResponse`** when `orjson` is installed and configured.

#### Expert

Audit optional deps for **security** (JWT libraries, crypto backends). Keep **extras** documented in `pyproject.toml` or `requirements.txt` comments so teammates know why a package exists.

```python
# optional_orjson.py — requires: pip install orjson
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

app = FastAPI(default_response_class=ORJSONResponse)


@app.get("/data")
def data() -> dict[str, list[int]]:
    return {"nums": list(range(10))}
```

**Key Points (2.2.3)**

- **Optional** means **not always required**—add when features demand them.

**Best Practices (2.2.3)**

- Group optional deps in **`requirements-dev.txt`** vs **`requirements.txt`**.

**Common Mistakes (2.2.3)**

- Installing **heavy ML stacks** into slim API images unnecessarily.

---

### 2.2.4 Using requirements.txt

#### Beginner

A **`requirements.txt`** file lists packages, often **pinned**:

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
```

Install with:

```bash
python -m pip install -r requirements.txt
```

#### Intermediate

Split files: **`requirements.in`** (human) + **`pip-compile`** output, or **`requirements.txt`** + **`requirements-dev.txt`** for pytest/black/ruff. Use **`-c constraints.txt`** in advanced setups.

#### Expert

**Hash-checking mode** (`--require-hashes`) for high-assurance pipelines. **Docker** `COPY requirements.txt` before source code to maximize **layer caching**.

```dockerfile
# Dockerfile fragment — illustrative
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key Points (2.2.4)**

- **Pinning** improves reproducibility; **ranges** help libraries.

**Best Practices (2.2.4)**

- Regenerate lockfiles or pins when **patching CVEs**.

**Common Mistakes (2.2.4)**

- Unpinned **`fastapi`** in production leading to surprise upgrades in CI.

---

### 2.2.5 Version Management

#### Beginner

Track versions in **`requirements.txt`** or **`poetry.lock`**. Periodically **`pip list --outdated`** and plan upgrades. Read **FastAPI release notes** for breaking changes when jumping minor versions.

#### Intermediate

Semantic versioning awareness: **0.x** APIs may evolve quickly; still read changelogs. Run **`pytest`** after upgrades. Consider **Dependabot/Renovate** PRs for automated bumps with CI gates.

#### Expert

Maintain **compatibility matrix** (Python × FastAPI × Pydantic). Use **`tox`** or **nox** to test multiple Python versions. For large orgs, **internal golden images** standardize versions.

```python
# versions_endpoint.py — surface build-time versions (optional)
import importlib.metadata as im

from fastapi import FastAPI

app = FastAPI()


@app.get("/build/versions")
def versions() -> dict[str, str]:
    return {
        "fastapi": im.version("fastapi"),
        "uvicorn": im.version("uvicorn"),
        "pydantic": im.version("pydantic"),
    }
```

### Key Points (Section 2.2)

- **FastAPI + Uvicorn + pins** form the default install story.
- **Optional** packages add capabilities—keep the attack surface minimal.

### Best Practices (Section 2.2)

- Automate **upgrade PRs** with CI test suites.

### Common Mistakes (Section 2.2)

- Upgrading **FastAPI** without checking **Pydantic** major migration notes.

---

## 2.3 Development Environment Setup

### 2.3.1 IDE/Editor Choice (VS Code, PyCharm)

#### Beginner

**VS Code** is free, extension-rich, and popular for Python. **PyCharm** (Community or Professional) offers deep refactoring and test runners. Both support FastAPI debugging when configured to run **Uvicorn** or **module** targets.

#### Intermediate

VS Code: set **`python.defaultInterpreterPath`** to `.venv/bin/python`. PyCharm: mark `.venv` as **Project Interpreter**. Configure **Run/Debug** to execute `uvicorn main:app --reload` with working directory at project root.

#### Expert

Use **remote development** (SSH, Dev Containers) for parity with production Linux. **PyCharm Professional** database tools help SQLAlchemy workflows. **Neovim**/Emacs users rely on **LSP** (`pyright`, `pylsp`).

```json
// .vscode/launch.json fragment — illustrative debug config
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Uvicorn: main:app",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```

**Key Points (2.3.1)**

- Correct **interpreter** selection prevents “module not found” confusion.

**Best Practices (2.3.1)**

- Commit **editor-agnostic** configs sparingly; prefer **documented** setup steps.

**Common Mistakes (2.3.1)**

- Debugging with **system Python** while terminal uses **venv**.

---

### 2.3.2 Extensions and Plugins

#### Beginner

VS Code essentials: **Python** (Microsoft), **Pylance** (types), sometimes **Ruff** extension. PyCharm bundles many features; enable **FastAPI** code insight via type stubs and interpreter settings.

#### Intermediate

Add **REST Client** or **Thunder Client** for ad-hoc HTTP, **Docker** extension for container workflows, **GitLens** for history. Ensure **ESLint**/**Prettier** only if you also edit frontend in-repo.

#### Expert

Use **devcontainers** `.devcontainer/devcontainer.json` to codify extensions and post-create `pip install -r requirements.txt` for zero-setup onboarding.

**Key Points (2.3.2)**

- **Pylance/pyright** dramatically improves FastAPI autocomplete via types.

**Best Practices (2.3.2)**

- Keep **extension lists** minimal to reduce noise and startup time.

**Common Mistakes (2.3.2)**

- Installing duplicate **linters** that fight each other.

---

### 2.3.3 Linting (pylint, flake8)

#### Beginner

**Linting** finds suspicious patterns and style issues. **Flake8** (wrapper around pyflakes/pycodestyle) and **pylint** are classic choices. Modern teams often prefer **Ruff** (fast, multi-rule).

#### Intermediate

Example **Ruff** config in `pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
target-version = "py310"

[tool.ruff.lint]
select = ["E", "F", "I", "B"]
```

Run: `ruff check .`

#### Expert

Integrate **mypy** or **pyright** for static typing; combine with **ruff** for speed. Tune **per-file ignores** for migrations and generated code.

```python
# pylint_flake8_friendly.py
def add(a: int, b: int) -> int:
    return a + b
```

**Key Points (2.3.3)**

- **Lint + typecheck** catch bugs before runtime.

**Best Practices (2.3.3)**

- Run **the same checks in CI** as locally.

**Common Mistakes (2.3.3)**

- **Ignoring** lint debt until it blocks releases.

---

### 2.3.4 Formatting (black, autopep8)

#### Beginner

**Black** is an opinionated formatter (`black .`). **autopep8** applies PEP 8 fixes more conservatively. Pick one standard for the team to avoid formatting wars.

#### Intermediate

Configure **line length** to match **ruff/flake8**. VS Code format-on-save with Black is common. **isort** (or **ruff**’s import sorting) keeps imports tidy.

#### Expert

Use **`[tool.black]`** and **`[tool.isort]`** in `pyproject.toml`. For mixed JS/Python repos, separate formatters per language.

```toml
[tool.black]
line-length = 100
target-version = ["py310"]
```

**Key Points (2.3.4)**

- Automatic formatting **reduces diff noise** in PRs.

**Best Practices (2.3.4)**

- Format **before** committing; prefer **pre-commit** automation.

**Common Mistakes (2.3.4)**

- Partially formatted files causing **merge conflicts**.

---

### 2.3.5 Pre-commit Hooks

#### Beginner

**pre-commit** runs checks before git commits. Install framework: `pip install pre-commit`, add `.pre-commit-config.yaml`, run `pre-commit install`.

#### Intermediate

Typical hooks: **ruff**, **black**, **mypy** (optional, slower), **trailing whitespace**, **end-of-file-fixer**. CI should run `pre-commit run --all-files` to catch bypasses.

#### Expert

Cache pre-commit environments in CI. For monorepos, use **`files:`** filters so hooks touch only relevant paths.

```yaml
# .pre-commit-config.yaml — illustrative
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: end-of-file-fixer
      - id: trailing-whitespace
```

### Key Points (Section 2.3)

- **IDE + linters + formatters + hooks** create a consistent developer experience.

### Best Practices (Section 2.3)

- Mirror local tooling in **CI** for enforcement.

### Common Mistakes (Section 2.3)

- Slow **mypy** hooks blocking commits—run heavy checks in **CI** instead.

---

## 2.4 Running Your First Server

### 2.4.1 Uvicorn Server Installation

#### Beginner

Install Uvicorn inside your venv:

```bash
python -m pip install uvicorn
```

Verify:

```bash
uvicorn --version
```

#### Intermediate

Prefer **`uvicorn[standard]`** for optional accelerators when your platform supports them. In **Docker**, install build dependencies only if a package needs compilation—slim images reduce attack surface.

#### Expert

Consider **Hypercorn** or **Daphne** for alternative ASGI servers when specific **HTTP/2** or **protocol** needs arise; FastAPI remains compatible as ASGI app.

```bash
python -m pip install "uvicorn[standard]"
```

**Key Points (2.4.1)**

- **Uvicorn** is the default teaching server for FastAPI.

**Best Practices (2.4.1)**

- Pin **uvicorn** version alongside **fastapi**.

**Common Mistakes (2.4.1)**

- Running **outdated** Uvicorn with **newer** Starlette/FastAPI without testing.

---

### 2.4.2 Running FastAPI with Uvicorn

#### Beginner

Save `main.py` with `app = FastAPI()` and a route. Run:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

Open a browser to `http://127.0.0.1:8000/docs`.

#### Intermediate

**Module path** must be importable from your **current working directory**. If your file lives in `src/service/main.py`, adjust **PYTHONPATH** or run from package context: `uvicorn service.main:app`.

#### Expert

**Programmatic** run (optional):

```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

Useful for **packaged** CLIs; production still often prefers process managers.

```python
# main.py
from fastapi import FastAPI

app = FastAPI()


@app.get("/hello")
def hello() -> dict[str, str]:
    return {"message": "Hello from FastAPI"}
```

**Key Points (2.4.2)**

- **`module:variable`** must point to the **FastAPI instance**.

**Best Practices (2.4.2)**

- Keep **`main.py`** thin; import routers from packages as apps grow.

**Common Mistakes (2.4.2)**

- **Wrong working directory** causing `ModuleNotFoundError: No module named 'main'`.

---

### 2.4.3 Auto-reload Development Mode

#### Beginner

**`--reload`** watches files and restarts the server on changes:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Intermediate

Reload uses **watchfiles** or **stat** polling depending on environment. It is **development-only**—do not enable in production (performance and stability). In **Docker**, volume mounts make reload usable; without mounts, rebuild images.

#### Expert

Large monorepos may need **`--reload-dir`** to limit scanning scope and reduce CPU. Combine with **debugpy** remote attach for breakpoints.

```bash
uvicorn main:app --reload --reload-dir ./src --host 127.0.0.1 --port 8000
```

**Key Points (2.4.3)**

- **Reload** accelerates feedback loops while editing routes and models.

**Best Practices (2.4.3)**

- Disable reload in **staging/prod**; use proper **rolling deploys**.

**Common Mistakes (2.4.3)**

- Editing files **outside** watched directories and wondering why reload missed changes.

---

### 2.4.4 Accessing the Application

#### Beginner

By default Uvicorn listens on **127.0.0.1** (localhost only). Open:

- `http://127.0.0.1:8000/` — your routes
- `http://127.0.0.1:8000/docs` — Swagger UI
- `http://127.0.0.1:8000/redoc` — ReDoc
- `http://127.0.0.1:8000/openapi.json` — raw schema

#### Intermediate

Bind **`0.0.0.0`** inside containers or VMs to accept external interfaces—but **firewall** appropriately. Behind **TLS-terminating proxies**, configure **forwarded headers** so `request.url` schemes/hosts are correct.

#### Expert

Use **curl** for quick checks:

```bash
curl -s http://127.0.0.1:8000/hello | jq
```

Automate **smoke tests** in CI hitting `/health` after deploy.

```python
# health_for_smoke.py
from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

**Key Points (2.4.4)**

- **Host/port** binding is a **security** concern, not just convenience.

**Best Practices (2.4.4)**

- Add **`/health`/`/ready`** endpoints early for orchestrators.

**Common Mistakes (2.4.4)**

- Binding **`0.0.0.0`** on laptops on **untrusted networks** without thought.

---

### 2.4.5 Hot Reloading Configuration

#### Beginner

**Hot reload** ≈ **auto reload** in Uvicorn: server restarts when Python files change. It is not “in-place” bytecode hot swap like some game engines—expect brief connection blips.

#### Intermediate

Exclude noisy paths via **`.watchfilesignore`** or tool-specific ignore files where supported. On **Windows**, ensure antivirus does not thrash file watchers.

#### Expert

For **frontend + backend** monorepos, run **Vite** and **Uvicorn** concurrently with **`concurrently`** or **Makefile** targets. Consider **docker compose watch** (Docker Compose v2+) for containerized reload workflows.

```makefile
# Makefile fragment — illustrative
.PHONY: dev
dev:
	uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Key Points (Section 2.4)

- **Uvicorn** runs the ASGI app; **reload** aids development velocity.
- **Production** uses multiple workers, proxies, and health checks—not reload flags.

### Best Practices (Section 2.4)

- Script **`dev`** commands in **Makefile**/`justfile`/`npm scripts` for consistency.

### Common Mistakes (Section 2.4)

- Using **`--reload`** under load testing and misinterpreting results.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points (Chapter Summary)

- Install a **supported Python**, use **venv** (or Conda/Poetry), and install **fastapi + uvicorn**.
- **Pin** dependencies for reproducible builds; understand **optional** extras.
- Configure **IDE**, **linters**, **formatters**, and **pre-commit** for team consistency.
- Run **`uvicorn main:app --reload`** locally; understand **host binding** and **docs URLs**.

### Best Practices (Chapter Summary)

- Document **exact** setup commands in README for Windows/macOS/Linux.
- Align **CI Python** with **production Python**.

### Common Mistakes (Chapter Summary)

- Wrong **interpreter** or **working directory** when launching Uvicorn.
- **Production** deployments with **dev reload** enabled.
- **Unpinned** dependencies causing CI/prod drift.

---

## Appendix: Copy-Paste Setup Recipes

### Recipe A — Unix/macOS venv + requirements.txt

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install fastapi "uvicorn[standard]"
printf '%s\n' "fastapi==0.115.0" "uvicorn[standard]==0.30.6" > requirements.txt
pip freeze | grep -E 'fastapi|uvicorn|pydantic|starlette' >> requirements.txt
```

### Recipe B — Windows PowerShell venv

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
python -m pip install fastapi "uvicorn[standard]"
```

### Recipe C — Minimal `main.py` + run

```python
from fastapi import FastAPI

app = FastAPI(title="Setup Verification")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Recipe D — `pyproject.toml` tools section (Ruff)

```toml
[tool.ruff]
line-length = 100
target-version = "py310"

[tool.ruff.format]
quote-style = "double"
```

### Recipe E — Programmatic `uvicorn.run` (optional)

```python
import uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root() -> dict[str, str]:
    return {"where": "root"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

### Appendix Key Points

- Recipes are **starting points**—adjust versions to current stable releases.

### Appendix Best Practices

- After setup, hit **`/docs`** and execute a sample request to confirm wiring.

### Appendix Common Mistakes

- Mixing **Recipe E** (direct `app` object) with CLI **`main:app`** strings without understanding equivalence.

---

## Troubleshooting Guide

| Symptom | Likely Cause | Fix |
|--------|----------------|-----|
| `ModuleNotFoundError: No module named 'main'` | Wrong CWD or module name | `cd` to package root; fix `uvicorn pkg.main:app` |
| Port already in use | Another Uvicorn/process bound | Change `--port` or stop process |
| Wrong dependency versions | Unpinned installs | Pin in `requirements.txt`; recreate venv |
| SSL errors behind proxy | Missing forwarded headers | Configure proxy + Uvicorn flags |
| Slow reload | Huge directory watched | Use `--reload-dir` to narrow scope |

---

## Version Pinning Example (requirements.txt)

```
# Application runtime pins (illustrative versions — update as needed)
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.9.2
starlette==0.38.6
```

---

*End of Installation and Setup notes (Topic 2).*
