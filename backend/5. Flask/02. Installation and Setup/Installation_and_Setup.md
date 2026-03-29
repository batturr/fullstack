# Installation and Setup

This chapter walks through **everything you need before writing Flask 3.1.3 code**: installing Python, isolating dependencies with virtual environments (**venv**, **Conda**, **Poetry**), installing and pinning Flask, shaping a productive editor workflow (linting, formatting, pre-commit), and running the **development server** safely (debug mode, auto-reload, host/port). Flask builds on Werkzeug, Jinja2, Click, and ItsDangerous—your environment should match **Python 3.9+** and reproducible dependency locks for production parity.

---

## 📑 Table of Contents

1. [Prerequisites](#1-prerequisites)
   - 1.1 Python installation
   - 1.2 pip
   - 1.3 Virtual environment (`venv`)
   - 1.4 Conda
   - 1.5 Poetry
2. [Flask Installation](#2-flask-installation)
   - 2.1 `pip install flask`
   - 2.2 Verifying installation
   - 2.3 Specific versions
   - 2.4 `requirements.txt`
   - 2.5 Updating
3. [Development Environment](#3-development-environment)
   - 3.1 IDE/editor selection
   - 3.2 Extensions/plugins
   - 3.3 Linting (`pylint` / `flake8`)
   - 3.4 Formatting (`black` / `autopep8`)
   - 3.5 Pre-commit hooks
4. [Development Server](#4-development-server)
   - 4.1 Running Flask dev server
   - 4.2 Debug mode
   - 4.3 Auto-reload
   - 4.4 Port configuration
   - 4.5 Host configuration
5. [Best Practices](#5-best-practices)
6. [Common Mistakes to Avoid](#6-common-mistakes-to-avoid)
7. [Comparison Tables](#7-comparison-tables)

---

## 1. Prerequisites

### 1.1 Python installation

Install **Python 3.9 or newer** from [python.org](https://www.python.org/downloads/), your OS package manager, or **pyenv**. Confirm:

```bash
python3 --version
```

On macOS, `python3` often maps to a Homebrew build; on Linux, use `python3.12` if multiple versions coexist.

### 1.2 pip

**pip** is the standard installer. Prefer:

```bash
python3 -m pip install --upgrade pip
```

This guarantees pip matches the interpreter you run.

### 1.3 Virtual environment (`venv`)

**venv** (stdlib since Python 3.3) creates an isolated directory with its own `site-packages`:

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

Deactivate with `deactivate`.

### 1.4 Conda

**Miniconda/Anaconda** manage Python binaries and binary dependencies (useful for scientific stacks). Create an env:

```bash
conda create -n myflask python=3.12
conda activate myflask
pip install flask
```

### 1.5 Poetry

**Poetry** manages dependencies and virtualenvs via `pyproject.toml`:

```bash
poetry new myapp
cd myapp
poetry add flask@3.1.3
poetry run flask --version
```

#### Concept: Creating an isolated environment for Flask

### 🟢 Beginner Example

```bash
cd ~/projects/hello-flask
python3 -m venv .venv
source .venv/bin/activate
pip install flask
python -c "import flask; print('Flask', flask.__version__)"
```

### 🟡 Intermediate Example

Store activation in team docs; use **direnv** or **envrc** for automatic activation (illustrative `.envrc`):

```bash
# .envrc
source .venv/bin/activate
```

### 🔴 Expert Example

**pyenv** + **venv** for per-project Python:

```bash
pyenv install 3.12.2
pyenv local 3.12.2
python -m venv .venv
source .venv/bin/activate
pip install -U pip setuptools wheel
```

### 🌍 Real-Time Example

**SaaS** mono-repo: separate venv per service folder to avoid dependency conflicts.

```bash
cd services/billing-api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

---

## 2. Flask Installation

### 2.1 `pip install flask`

```bash
pip install flask
```

Installs Flask and compatible versions of Werkzeug, Jinja2, Click, ItsDangerous, and Blinker.

### 2.2 Verifying installation

```bash
python -c "import flask; print(flask.__version__)"
flask --version
```

### 2.3 Specific versions

Pin for reproducibility:

```bash
pip install "flask==3.1.3"
```

### 2.4 `requirements.txt`

Generate after install:

```bash
pip freeze > requirements.txt
```

Or maintain a curated file and `pip install -r requirements.txt` in CI/Docker.

### 2.5 Updating

```bash
pip install --upgrade flask
pip check
```

Read the Flask changelog before major jumps; run your test suite.

#### Concept: Pinning Flask in a team `requirements.txt`

### 🟢 Beginner Example

```text
flask==3.1.3
```

### 🟡 Intermediate Example

```text
flask==3.1.3
werkzeug>=3.0.0
jinja2>=3.1.2
itsdangerous>=2.2.0
click>=8.1.0
blinker>=1.9.0
```

### 🔴 Expert Example

Use **pip-tools**:

```bash
pip install pip-tools
# requirements.in
echo "flask==3.1.3" > requirements.in
pip-compile requirements.in
pip-sync requirements.txt
```

### 🌍 Real-Time Example

**E-commerce** deploy: Docker build installs from hashed lock for supply-chain consistency.

```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -c "import flask; assert flask.__version__=='3.1.3'"
```

---

## 3. Development Environment

### 3.1 IDE/editor selection

**VS Code**, **PyCharm**, and **Neovim** are common. Choose based on debugging, refactoring, and team norms.

### 3.2 Extensions/plugins

- **Python** extension (VS Code): IntelliSense, debugging.
- **Ruff** or **Pylance** for fast lint/diagnostics.
- **Docker** extension for containerized dev.

### 3.3 Linting (`pylint` / `flake8`)

**flake8** composes PyFlakes, pycodestyle, McCabe. **pylint** is deeper but noisier.

```bash
pip install flake8 pylint
flake8 .
pylint mypackage
```

### 3.4 Formatting (`black` / `autopep8`)

**Black** is opinionated; **autopep8** fixes PEP 8 issues more conservatively.

```bash
pip install black
black .
```

### 3.5 Pre-commit hooks

Run formatters/linters before each commit:

```bash
pip install pre-commit
pre-commit sample-config > .pre-commit-config.yaml
pre-commit install
```

#### Concept: Linting a small Flask module

### 🟢 Beginner Example

```bash
flake8 app.py
```

### 🟡 Intermediate Example

`.flake8` config:

```ini
[flake8]
max-line-length = 88
extend-ignore = E203,W503
exclude = .venv,migrations
```

### 🔴 Expert Example

**Ruff** replaces multiple tools (fast Rust-based linter):

```bash
pip install ruff
ruff check .
ruff format .
```

### 🌍 Real-Time Example

**Social media** API repo: CI fails on `ruff` + `mypy` + `pytest`—local pre-commit mirrors CI.

```yaml
# .pre-commit-config.yaml (illustrative)
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.0
    hooks:
      - id: ruff
      - id: ruff-format
```

---

## 4. Development Server

### 4.1 Running Flask dev server

Set `FLASK_APP` to your application object:

```bash
export FLASK_APP=hello:app
flask run
```

Or `python app.py` if you call `app.run()` (development only).

### 4.2 Debug mode

**Debug mode** enables interactive debugger on errors—**never** on public networks.

```bash
export FLASK_DEBUG=1
flask run
```

### 4.3 Auto-reload

With debug, the reloader watches files. In code:

```python
app.run(debug=True)  # dev only
```

### 4.4 Port configuration

```bash
flask run --port 8080
```

Or:

```python
app.run(port=8080)
```

### 4.5 Host configuration

Listen on all interfaces (use carefully on untrusted networks):

```bash
flask run --host 0.0.0.0
```

#### Concept: Safe local development defaults

### 🟢 Beginner Example

```bash
export FLASK_APP=app.py
flask run
# visit http://127.0.0.1:5000
```

### 🟡 Intermediate Example

```bash
flask run --debug --port 8000
```

### 🔴 Expert Example

Use **Werkzeug** options via `flask run` where supported; prefer **Gunicorn** for staging that mirrors production.

```bash
export FLASK_APP=wsgi:app
gunicorn -w 2 -b 127.0.0.1:8000 wsgi:app
```

### 🌍 Real-Time Example

**SaaS** developer tunnel: bind `0.0.0.0` inside Docker, publish port `5000` to host only.

```yaml
services:
  web:
    build: .
    ports:
      - "127.0.0.1:5000:5000"
    environment:
      FLASK_DEBUG: "1"
      FLASK_APP: wsgi:app
```

---

## 5. Best Practices

1. **One venv per project**; never `sudo pip install` into system Python.
2. **Pin Flask** and audit transitive deps in production.
3. **Match Python minor** across dev, CI, and prod containers.
4. **Use `python -m pip`** to avoid wrong-pip mistakes.
5. **Separate dev tools** (`requirements-dev.txt` or Poetry dev group).
6. **Pre-commit + CI** should run the same checks.
7. **Never expose debug** to the internet; use structured logging instead.
8. **Document `FLASK_APP`** in README for newcomers.
9. **Use environment variables** for secrets and feature flags.
10. **Reproducible Docker builds** with `--no-cache-dir` and pinned bases.

---

## 6. Common Mistakes to Avoid

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Global `pip install flask` | Version drift, permission issues | Always use venv |
| Forgetting to activate venv | Imports fail or wrong version | Prompt shows `(.venv)` |
| `debug=True` in prod | Critical security risk | Env-gated config |
| `0.0.0.0` on coffee-shop Wi‑Fi | Attack surface | Bind localhost or use VPN |
| Unpinned `requirements.txt` | CI/prod surprises | Pin or lockfile |
| Mixing Conda and pip carelessly | Broken binary deps | Prefer one workflow per env |
| Skipping `pip check` | Incompatible transitive deps | Run after upgrades |

---

## 7. Comparison Tables

### venv vs Conda vs Poetry

| Tool | Strengths | Typical use |
|------|-----------|-------------|
| **venv** | Stdlib, simple | Web services, libraries |
| **Conda** | Binary packages, scientific stack | Data + web hybrids |
| **Poetry** | Lockfiles, packaging | Apps and publishable libs |

### black vs autopep8

| Formatter | Style | Notes |
|-----------|-------|-------|
| **Black** | Highly opinionated, stable formatting | Minimal config |
| **autopep8** | PEP 8 fixes, configurable | Less uniform output |

### flake8 vs pylint

| Linter | Speed | Depth |
|--------|-------|-------|
| **flake8** | Fast | Style + basic errors |
| **pylint** | Slower | Architectural hints, more noise |

---

### Supplementary — **pip workflows**

### 🟢 Beginner Example

```bash
pip install flask
pip show flask
```

### 🟡 Intermediate Example

```bash
pip install "flask[async]"  # if extras exist in your chosen stack; verify metadata for your version
```

Note: check Flask 3.1.3 metadata on PyPI for actual extras; the line above is illustrative of extras syntax.

### 🔴 Expert Example

```bash
pip download flask==3.1.3 -d vendor_wheels
pip install --no-index --find-links vendor_wheels flask==3.1.3
```

### 🌍 Real-Time Example

**Air-gapped** deploy: vendor wheels + internal index mirror.

```bash
pip install -i https://pypi.internal/simple -r requirements.txt
```

---

### Supplementary — **IDE launch configurations**

### 🟢 Beginner Example

VS Code `launch.json` fragment:

```json
{
  "name": "Flask",
  "type": "debugpy",
  "request": "launch",
  "module": "flask",
  "env": { "FLASK_APP": "app.py", "FLASK_DEBUG": "1" },
  "args": ["run", "--no-debugger", "--no-reload"]
}
```

### 🟡 Intermediate Example

PyCharm: set **Script path** to Flask module, parameters `run`, working directory to project root.

### 🔴 Expert Example

Remote attach debugging over SSH with `debugpy` in guarded dev-only code paths.

### 🌍 Real-Time Example

**Kubernetes** dev pod: port-forward debug port only, never in prod image.

---

### Supplementary — **Flask CLI discovery**

### 🟢 Beginner Example

```bash
flask --help
```

### 🟡 Intermediate Example

```bash
export FLASK_APP=app:create_app
flask routes
```

### 🔴 Expert Example

```python
import click
from flask import Flask

app = Flask(__name__)


@app.cli.command("seed")
def seed():
    click.echo("Seeding database...")
```

### 🌍 Real-Time Example

**E-commerce** staging: `flask seed-demo-catalog` loads fixtures idempotently.

---

### Supplementary — **Port and host matrix**

| Scenario | Host | Port |
|----------|------|------|
| Local browser only | `127.0.0.1` | `5000` |
| Phone on same LAN testing | `0.0.0.0` | `5000` |
| Docker published | `0.0.0.0` in container | map to host |
| Production | Gunicorn behind nginx | `8000` internal |

### 🟢 Beginner Example

```bash
flask run -h 127.0.0.1 -p 5000
```

### 🟡 Intermediate Example

```python
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
```

### 🔴 Expert Example

```bash
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=8080
flask run
```

### 🌍 Real-Time Example

```dockerfile
EXPOSE 8000
ENV FLASK_RUN_HOST=0.0.0.0
CMD ["flask", "run"]
```

Prefer Gunicorn in real production images; above illustrates env-driven dev server.

---

### Supplementary — **Updating strategies**

### 🟢 Beginner Example

```bash
pip install --upgrade flask
```

### 🟡 Intermediate Example

```bash
pip list --outdated
pip install "flask==3.1.3"
```

### 🔴 Expert Example

```bash
pip-compile --upgrade-package flask
pip-sync
pytest
```

### 🌍 Real-Time Example

**SaaS** canary: deploy new image to 5% traffic, watch error rate, then full rollout.

---

### Supplementary — **requirements.txt hygiene**

### 🟢 Beginner Example

```text
flask==3.1.3
```

### 🟡 Intermediate Example

Split files:

```text
# requirements-base.txt
flask==3.1.3

# requirements-dev.txt
-r requirements-base.txt
pytest
ruff
```

### 🔴 Expert Example

Hash pinning (pip 19.2+):

```bash
pip install pip-tools
pip-compile --generate-hashes requirements.in
```

### 🌍 Real-Time Example

Supply-chain policy: only install if hash matches in CI.

---

### Supplementary — **Conda specifics**

### 🟢 Beginner Example

```bash
conda create -n flaskdev python=3.12 pip
conda activate flaskdev
pip install flask
```

### 🟡 Intermediate Example

```bash
conda env export > environment.yml
```

### 🔴 Expert Example

Prefer `conda-forge` channel for fresher builds; pin `flask` via pip inside conda when needed.

### 🌍 Real-Time Example

**Data + Flask**: Conda for `numpy`/`pandas`, pip for `flask` in same env—document order: conda first, pip second.

---

### Supplementary — **Poetry specifics**

### 🟢 Beginner Example

```bash
poetry add flask@3.1.3
poetry run python -c "import flask; print(flask.__version__)"
```

### 🟡 Intermediate Example

```toml
[tool.poetry.dependencies]
python = "^3.11"
flask = "3.1.3"
```

### 🔴 Expert Example

```bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```

### 🌍 Real-Time Example

Docker:

```dockerfile
RUN pip install poetry && poetry config virtualenvs.create false
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev
```

---

### Supplementary — **autopep8 sample**

### 🟢 Beginner Example

```bash
pip install autopep8
autopep8 --in-place app.py
```

### 🟡 Intermediate Example

```bash
autopep8 --recursive --in-place mypackage
```

### 🔴 Expert Example

Combine with `flake8` in pre-commit; let Black own formatting if team standardizes on Black.

### 🌍 Real-Time Example

Legacy **social** codebase: autopep8 incremental PRs to reduce diff noise before Black adoption.

---

### Supplementary — **pylint Flask app**

### 🟢 Beginner Example

```bash
pylint app.py
```

### 🟡 Intermediate Example

`.pylintrc`:

```ini
[MASTER]
load-plugins=pylint_flask
```

### 🔴 Expert Example

Disable noisy rules for migrations folder via `ignore-paths`.

### 🌍 Real-Time Example

Gate quality score in CI with minimum threshold, not zero warnings day one.

---

### Deep practice — **Verify Werkzeug/Jinja alongside Flask**

### 🟢 Beginner Example

```python
import flask, werkzeug, jinja2

print(flask.__version__, werkzeug.__version__, jinja2.__version__)
```

### 🟡 Intermediate Example

```bash
pip install pipdeptree
pipdeptree -p flask
```

### 🔴 Expert Example

Fail CI if dependency tree includes yanked or conflicting versions.

### 🌍 Real-Time Example

**E-commerce** PCI-scoped env: approved versions list in internal wiki + automated check.

---

### Deep practice — **Windows notes**

### 🟢 Beginner Example

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\activate
pip install flask
```

### 🟡 Intermediate Example

```powershell
set FLASK_APP=app.py
flask run
```

### 🔴 Expert Example

Use **WSL2** for parity with Linux production.

### 🌍 Real-Time Example

Corporate laptop: antivirus excludes `.venv` to speed file watchers.

---

### Deep practice — **macOS notes**

### 🟢 Beginner Example

```bash
brew install python@3.12
python3.12 -m venv .venv
```

### 🟡 Intermediate Example

Codesign issues with certain wheels—prefer official wheels from PyPI.

### 🔴 Expert Example

Rosetta vs ARM wheels in mixed teams—standardize on arm64 dev containers.

### 🌍 Real-Time Example

**SaaS** engineers use `colima` + Linux containers for prod-like networking.

---

### Extended table — **Environment variables for dev server**

| Variable | Purpose |
|----------|---------|
| `FLASK_APP` | Import path to app |
| `FLASK_DEBUG` | Enables debug features |
| `FLASK_RUN_HOST` | Bind host |
| `FLASK_RUN_PORT` | Bind port |
| `FLASK_ENV` | Legacy; prefer explicit debug flag in modern docs |

---

### Four-level recap — **Production vs dev server**

### 🟢 Beginner Example

```python
# Dev only
app.run(debug=True)
```

### 🟡 Intermediate Example

```bash
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app
```

### 🔴 Expert Example

```bash
gunicorn -k gevent -w 4 -b 0.0.0.0:8000 wsgi:app
```

### 🌍 Real-Time Example

nginx terminates TLS → proxies to Gunicorn Unix socket → Flask app; systemd manages process restarts.

---

*End of Installation and Setup — Flask 3.1.3 learning notes.*
