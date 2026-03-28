# Introduction to Python

**Python** is a high-level, interpreted programming language known for clear syntax and a vast ecosystem. This guide introduces what Python is, how to install it, how to set up a productive development environment, and how to write your first programs following community standards.

---

## 📑 Table of Contents

1. [1.1 Overview — What is Python?](#11-overview--what-is-python)
2. [1.2 Python Philosophy (The Zen of Python)](#12-python-philosophy-the-zen-of-python)
3. [1.3 Use Cases](#13-use-cases)
4. [1.4 Python 2 vs Python 3](#14-python-2-vs-python-3)
5. [1.5 Language Roadmap and Versions](#15-language-roadmap-and-versions)
6. [2.1 Installation — Windows, macOS, and Linux](#21-installation--windows-macos-and-linux)
7. [2.2 Virtual Environments (`venv`)](#22-virtual-environments-venv)
8. [2.3 Package Managers — `pip` and `conda`](#23-package-managers--pip-and-conda)
9. [3.1 Editors, IDEs, and Tooling](#31-editors-ides-and-tooling)
10. [3.2 Jupyter Notebooks](#32-jupyter-notebooks)
11. [3.3 The Interactive REPL](#33-the-interactive-repl)
12. [3.4 Project Structure](#34-project-structure)
13. [4.1 Hello World and Running Scripts](#41-hello-world-and-running-scripts)
14. [4.2 Comments](#42-comments)
15. [4.3 Indentation and Blocks](#43-indentation-and-blocks)
16. [4.4 PEP 8 and Style](#44-pep-8-and-style)
17. [Best Practices](#best-practices)
18. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1.1 Overview — What is Python?

### Key Points

- Python is **interpreted**: source runs via an interpreter (CPython is the reference implementation).
- It supports **multiple paradigms**: procedural, object-oriented, and functional styles.
- **Batteries included**: a rich standard library covers files, networking, dates, and more.
- **Dynamic typing**: types are associated with values at runtime, not fixed on variables.

**Beginner Level:** Think of Python as instructions you write in almost-plain English that the computer follows step by step. A small **e-commerce** “hello” script might just print a welcome message when a customer opens a tool.

```python
# Beginner: a tiny storefront greeting
print("Welcome to FreshCart — your groceries, delivered.")
```

**Intermediate Level:** Python compiles source to **bytecode** (`.pyc`) and executes on a **virtual machine**. You trade some raw speed for developer speed and portability. In a **student management** CLI, you might load CSV data and compute averages without compiling a binary.

```python
# Intermediate: quick stats for a class export (conceptual)
grades = [88, 92, 79, 95]
average = sum(grades) / len(grades)
print(f"Class average: {average:.1f}")
```

**Expert Level:** Implementations include **CPython** (C), **PyPy** (JIT), **Jython**, **IronPython**. You choose based on deployment (Linux containers often use CPython), FFI needs (`ctypes`, `cffi`), or embedding. In **production** banking middleware, teams pin a minor version, use reproducible builds, and isolate dependencies per service.

```python
# Expert: introspection of implementation details (illustrative)
import sys
print(sys.version)           # exact build string
print(sys.implementation.name)  # cpython, pypy, etc.
```

---

## 1.2 Python Philosophy (The Zen of Python)

### Key Points

- **Readability counts** — code is read far more often than written.
- **Explicit is better than implicit** — magic should be documented or avoided.
- **Simple is better than complex** — prefer straightforward designs first.
- Type `import this` in a REPL to see **The Zen of Python** (PEP 20).

**Beginner Level:** Python encourages you to write code that your future self can understand. In a **weather app**, naming variables `city` and `temp_c` beats `x` and `y`.

```python
# Beginner: clear names for a one-day forecast display
city = "Seattle"
temp_c = 12
print(f"{city}: {temp_c}°C")
```

**Intermediate Level:** The Zen guides API design: prefer one obvious way (`str.split()`), avoid redundant features, and use exceptions for exceptional cases. In **inventory**, raising `ValueError` for negative stock is clearer than returning magic codes.

```python
# Intermediate: explicit validation (Zen: "Errors should never pass silently")
def reserve_units(available: int, requested: int) -> int:
    if requested < 0:
        raise ValueError("requested cannot be negative")
    if requested > available:
        raise ValueError("insufficient stock")
    return available - requested
```

**Expert Level:** Teams encode philosophy in **linters** (`ruff`, `flake8`), **formatters** (`black`), and **review checklists**. Production **e-commerce** services favor boring, explicit configuration over clever metaprogramming unless performance or DSL needs justify it.

```python
# Expert: explicit config object instead of hidden globals
from dataclasses import dataclass

@dataclass(frozen=True)
class CheckoutConfig:
    tax_rate: float = 0.08
    currency: str = "USD"

cfg = CheckoutConfig()
```

---

## 1.3 Use Cases

### Key Points

- **Web**: Django, FastAPI, Flask.
- **Data / ML**: pandas, NumPy, scikit-learn, PyTorch.
- **Automation / DevOps**: scripts, Ansible hooks, CI pipelines.
- **Desktop / games**: Tkinter, PyQt; tooling for game pipelines.

**Beginner Level:** Python is used anywhere you need to automate or analyze. A beginner might automate renaming **bank** statement exports.

```python
# Beginner: list PDFs in a folder (conceptual automation)
from pathlib import Path
for pdf in Path("statements").glob("*.pdf"):
    print(pdf.name)
```

**Intermediate Level:** In **student management**, you might expose a REST API with FastAPI, validate Pydantic models, and persist to PostgreSQL — all common Python stacks.

```python
# Intermediate: sketch of a typed endpoint (requires fastapi installed)
# from fastapi import FastAPI
# app = FastAPI()
# @app.get("/students/{student_id}")
# def get_student(student_id: int): ...
```

**Expert Level:** Large systems combine **async I/O**, **workers** (Celery), **observability** (OpenTelemetry), and **multi-stage deploys**. An **e-commerce** platform might use Python for catalog services, recommendation batch jobs, and internal admin tools, each with isolated virtualenvs and locked dependencies.

```python
# Expert: structured logging pattern (conceptual)
import logging
log = logging.getLogger("orders")
log.info("order_created", extra={"order_id": "ORD-1001", "amount": 49.99})
```

---

## 1.4 Python 2 vs Python 3

### Key Points

- **Python 2 reached end of life on 2020-01-01** — do not start new projects on it.
- Python 3 has **true division** (`/` → float), **`print()` function**, **Unicode strings** by default, and modern syntax (`async`/`await`).
- Legacy code may still exist; migration uses tools like `2to3` and `six` (historically).

**Beginner Level:** If a tutorial says `print "hi"`, it is Python 2. In Python 3 you always use parentheses: `print("hi")`.

```python
# Python 3 only
print("Hello from Python 3")
```

**Intermediate Level:** Key differences affect real apps: `dict.keys()` returns a view, `range` is lazy, integer division semantics changed, and string/bytes separation is strict — important for **inventory** CSV import from legacy systems.

```python
# Intermediate: bytes vs str for file protocols
payload = b"SKU=42;qty=3"  # bytes from a socket
text = payload.decode("utf-8")
pairs = dict(item.split("=") for item in text.split(";"))
```

**Expert Level:** Production **bank** stacks that once ran 2.7 migrated for security patches and dependency availability. Expert teams maintain **compatibility matrices**, run **CI on target Python versions**, and use `from __future__ import annotations` for forward-compatible typing.

```python
# Expert: future annotations postpone evaluation of hints
from __future__ import annotations

def parse_accounts(lines: list[str]) -> dict[str, float]:
    ...
```

---

## 1.5 Language Roadmap and Versions

### Key Points

- **Feature releases** (e.g. 3.12, 3.13) arrive yearly with new syntax and stdlib improvements.
- **Bugfix releases** (3.12.x) are security and correctness fixes — prefer latest patch.
- Check **PEPs** (Python Enhancement Proposals) for language changes (e.g. PEP 634 match/case).

**Beginner Level:** Install the newest **stable** 3.x from python.org. Your tutorial should say “Python 3.10+” or similar.

```python
# Beginner: check you are on Python 3
import sys
assert sys.version_info.major == 3, "Please use Python 3"
```

**Intermediate Level:** Track **deprecation warnings** when upgrading; e.g. `datetime.utcnow()` deprecations affect **e-commerce** scheduling code. Use `python -W default` locally to surface them.

```python
# Intermediate: version-gated feature example (structural pattern matching, 3.10+)
def route_event(event: dict) -> str:
    match event:
        case {"type": "order", "id": oid}:
            return f"order:{oid}"
        case {"type": "refund", "amount": amt}:
            return f"refund:{amt}"
        case _:
            return "unknown"
```

**Expert Level:** Organizations adopt **support windows** (N-1 minor versions), test **free-threaded** builds where relevant, and pin **Docker** base images to digest hashes. Roadmap awareness drives decisions on **pattern matching**, **type parameter syntax** (PEP 695), and **JIT** experiments in newer releases.

```python
# Expert: PEP 695 style type aliases (3.12+)
type UserId = str
type Ledger = dict[UserId, list[tuple[str, float]]]
```

---

## 2.1 Installation — Windows, macOS, and Linux

### Key Points

- Prefer **official installers** or **distro packages** that stay patched.
- Use **`python3` / `pip3`** on Linux/macOS when both 2 and 3 exist.
- Verify install with `python --version` and `python -m pip --version`.

**Beginner Level:** On Windows, download the installer from [python.org](https://www.python.org/downloads/), check **“Add Python to PATH”**, then open **Command Prompt** and run `python --version`.

```python
# After install, run a file: python hello.py
print("Install OK")
```

**Intermediate Level:** On **macOS**, `brew install python` or use **pyenv** for multiple versions. On **Linux**, `apt install python3 python3-venv python3-pip` (Debian/Ubuntu). For a **weather app** side project, isolate tools per version with pyenv.

```bash
# Intermediate (shell): typical Linux setup
# sudo apt update && sudo apt install -y python3 python3-venv python3-pip
```

**Expert Level:** Production images use **multi-stage builds**, **distroless** or **slim** bases, and **SBOM** scanning. Pin **OpenSSL** and **libffi** versions where wheels depend on them. Corporate **bank** laptops may require internal mirrors and signed binaries.

```dockerfile
# Expert snippet: pin Python image digest in Dockerfile
# FROM python:3.12-slim@sha256:...
```

---

## 2.2 Virtual Environments (`venv`)

### Key Points

- A **venv** is an isolated directory with its own `python` and `site-packages`.
- Create with `python -m venv .venv`; activate per OS.
- **Never** commit large venv folders — add `.venv/` to `.gitignore`.

**Beginner Level:** Each project gets its own box of installed libraries so they do not fight each other.

```bash
# Beginner: create and activate (macOS/Linux)
python3 -m venv .venv
source .venv/bin/activate
python -m pip install requests
```

**Intermediate Level:** For **student management** projects, commit `requirements.txt` generated via `pip freeze`, and document Python version in `.python-version` (pyenv) or `README`.

```bash
# Intermediate: reproducible deps
python -m pip install -r requirements.txt
python -m pip freeze > requirements.lock
```

**Expert Level:** Use **`pip-tools`** or **Poetry** / **uv** for lockfiles, **hatch** for env matrices, and CI that creates **fresh venvs** each run. **E-commerce** microservices pin transitive dependencies to avoid supply-chain drift.

```text
# Expert: requirements.in (input) compiled to requirements.txt with pip-compile
# flask
# gunicorn
```

---

## 2.3 Package Managers — `pip` and `conda`

### Key Points

- **`pip`** installs packages from **PyPI** into the active environment.
- **`conda`** manages **binary dependencies** (C libs) and Python together — common in data science.
- Prefer **`python -m pip`** to ensure pip matches the interpreter.

**Beginner Level:** `pip install package_name` downloads a library so you can `import` it.

```python
# Beginner: after pip install requests
# import requests
# print(requests.get("https://api.example.com").status_code)
print("Use pip from the terminal: python -m pip install requests")
```

**Intermediate Level:** **conda** environments help when you need NumPy linked to optimized BLAS without compiling. For pure web apps, **pip + venv** is often enough.

```bash
# Intermediate conda (illustrative)
# conda create -n myenv python=3.12
# conda activate myenv
# conda install pandas
```

**Expert Level:** Internal **PyPI mirrors** (DevPI, Artifactory), **`--require-hashes`**, and **wheelhouse** caches for air-gapped **bank** networks. Conda-forge vs defaults channel policies matter for reproducibility.

```bash
# Expert: hashed installs in CI
# python -m pip install --require-hashes -r requirements.txt
```

---

## 3.1 Editors, IDEs, and Tooling

### Key Points

- **VS Code** with the Python extension is lightweight and popular.
- **PyCharm** offers deep refactoring, test runners, and Django support.
- **Sublime Text**, **Vim**, **Neovim** remain valid with LSP (`pylsp`, `basedpyright`).

**Beginner Level:** Install **VS Code**, add the **Python** extension, open a folder, and press **Run** on a file.

```python
# Beginner: run from VS Code / PyCharm "Run" on this file
for i in range(3):
    print(f"tick {i}")
```

**Intermediate Level:** Configure **format on save** (`black` or `ruff format`), **lint on save**, and **pytest** discovery. For **inventory** dashboards, breakpoints in the IDE beat `print` debugging.

```json
// Intermediate: .vscode/settings.json fragment
{
  "python.testing.pytestEnabled": true,
  "editor.formatOnSave": true
}
```

**Expert Level:** **monorepo** setups use **workspace folders**, **remote SSH**, **devcontainers**, and shared **lint configs** (`ruff.toml`, `mypy.ini`). **E-commerce** teams integrate **pre-commit** hooks for consistent style.

```yaml
# Expert: .pre-commit-config.yaml fragment (conceptual)
# repos:
#   - repo: https://github.com/astral-sh/ruff-pre-commit
#     hooks:
#       - id: ruff
#       - id: ruff-format
```

---

## 3.2 Jupyter Notebooks

### Key Points

- **Jupyter** runs code in **cells** — great for exploration and visualization.
- Notebooks are **`.ipynb`** JSON files — use **version control** carefully (clear outputs or use `nbstripout`).
- Not a replacement for **production** deploy artifacts unless converted (papermill, Voilà).

**Beginner Level:** Launch `jupyter lab`, write a cell, press **Shift+Enter** to run.

```python
# Beginner: cell in Jupyter — explore weather CSV stats
temps_f = [72, 68, 75, 80]
avg = sum(temps_f) / len(temps_f)
avg
```

**Intermediate Level:** Use **pandas** in notebooks for **student management** exploratory analysis, then move stable logic to `.py` modules and **import** them.

```python
# Intermediate: keep heavy logic in a module; thin notebook
# from school_stats import grade_distribution
```

**Expert Level:** **Parameterize** notebooks for **reproducible research**, schedule with **Papermill**, enforce **nbconvert** to HTML in CI for reports. **Bank** risk teams may require **audit trails** and **no secrets** in notebook metadata.

```python
# Expert: avoid secrets in notebooks — load from env
import os
api_key = os.environ.get("WEATHER_API_KEY")
assert api_key, "Set WEATHER_API_KEY"
```

---

## 3.3 The Interactive REPL

### Key Points

- Run **`python`** or **`python -i script.py`** for interactive sessions.
- **REPL** is ideal for quick experiments (`dir()`, `help()`).
- **IPython** adds history, `%timeit`, and better tab completion.

**Beginner Level:** Open terminal, type `python3`, then:

```python
>>> 2 + 2
4
>>> name = "Ada"
>>> print(name.upper())
ADA
```

**Intermediate Level:** Use **`python -i`** after a script to inspect variables when debugging **bank** file parsers.

```bash
# Intermediate: drop into REPL after script
# python -i load_transactions.py
```

**Expert Level:** **`PYTHONSTARTUP`** can load autocompletion; embed **IPython** in apps for admin shells. Production systems avoid REPL on servers — use **logging** and **metrics** instead.

```python
# Expert: quick introspection in REPL
import json
help(json.loads)
```

---

## 3.4 Project Structure

### Key Points

- Small scripts: one folder with `main.py` and `requirements.txt`.
- Packages: `src/` layout (`src/mypkg/`) avoids import pitfalls.
- Tests live in `tests/` mirroring package structure.

**Beginner Level:**

```text
weather_app/
  main.py
  README.md
```

```python
# weather_app/main.py — beginner
def main():
    print("Today's high: 22°C")

if __name__ == "__main__":
    main()
```

**Intermediate Level:**

```text
student_mgmt/
  src/
    students/
      __init__.py
      models.py
  tests/
    test_models.py
  pyproject.toml
```

**Expert Level:** Use **`pyproject.toml`** (`[project]`, `[tool.ruff]`), **tox** / **nox** for multi-version testing, and **Dockerfile** at root. **E-commerce** services split **api**, **workers**, **shared** libs.

```text
# Expert monorepo sketch
services/
  catalog/
  checkout/
libs/
  common/
```

---

## 4.1 Hello World and Running Scripts

### Key Points

- **Scripts** run top-to-bottom: `python path/to/file.py`.
- **`if __name__ == "__main__":`** guards executable entry points.
- **Shebang** (`#!/usr/bin/env python3`) helps on Unix when marking executable.

**Beginner Level:**

```python
# hello.py
print("Hello, World!")
```

```bash
python hello.py
```

**Intermediate Level:**

```python
# Intermediate: CLI-style student greeter
import sys

def main(argv: list[str]) -> int:
    name = argv[1] if len(argv) > 1 else "student"
    print(f"Hello, {name}!")
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
```

**Expert Level:**

```python
# Expert: entry point pattern for installable package
def run() -> None:
    print("FreshCart API starting")

if __name__ == "__main__":
    run()
```

```toml
# pyproject.toml [project.scripts]
# [project.scripts]
# freshcart = "freshcart.cli:run"
```

---

## 4.2 Comments

### Key Points

- **`#`** starts a single-line comment.
- **Docstrings** (`"""..."""`) document modules, classes, and functions.
- Comments should explain **why**, not **what**, when code is clear.

**Beginner Level:**

```python
# This line prints a welcome (beginner tutorial style)
print("Welcome to the bank portal")
```

**Intermediate Level:**

```python
def apr(effective_yield: float) -> float:
    """Convert effective annual yield to APR label for UI (simplified)."""
    # Round for display consistency with legacy PDF statements
    return round(effective_yield * 100, 2)
```

**Expert Level:**

```python
# Expert: module docstring standards (PEP 257)
"""Inventory sync service.

Subscribes to warehouse webhooks and reconciles SKU counts.
"""
```

---

## 4.3 Indentation and Blocks

### Key Points

- Python uses **4 spaces** per level (PEP 8); tabs mixed with spaces break parsing.
- Colon **`:`** starts an indented block (`if`, `for`, `def`, `class`).
- Indentation is **syntactic** — there are no braces for blocks.

**Beginner Level:**

```python
score = 85
if score >= 60:
    print("Pass")
else:
    print("Retry")
```

**Intermediate Level:**

```python
# Intermediate: nested validation for e-commerce coupons
def apply_coupon(cart_total: float, coupon: str | None) -> float:
    if coupon:
        if coupon == "SAVE10":
            return max(0.0, cart_total * 0.9)
    return cart_total
```

**Expert Level:**

```python
# Expert: explicit continuation with parentheses (preferred over backslash)
values = (
    process_line(a)
    for a in long_iterator
    if predicate(a)
)
```

---

## 4.4 PEP 8 and Style

### Key Points

- **PEP 8** is the official style guide: naming, spacing, imports, line length (often 88 with Black).
- **`snake_case`** for functions and variables, **`PascalCase`** for classes, **`UPPER_SNAKE`** for constants.
- **Imports**: stdlib, blank line, third party, blank line, local.

**Beginner Level:** Keep lines short, one statement per line when learning, and name things descriptively.

```python
class StudentRecord:
    pass

def calculate_gpa(scores):
    return sum(scores) / len(scores)
```

**Intermediate Level:**

```python
# Intermediate: import order sketch
import os
import sys

import requests  # third-party

from myapp.config import API_URL  # local
```

**Expert Level:** Enforce PEP 8 mechanically with **Ruff** (`select = ["E", "F", "I"]`), **mypy** for types, and **CI** failures on violations. **Bank** code reviews treat style tools as non-negotiable for merge.

```toml
# ruff.toml fragment
line-length = 88
target-version = "py312"
```

---

## Extended Practical Scenarios

The following scenarios tie installation, environments, and project layout to **inventory**, **banking**, **e-commerce**, **student management**, and **weather** domains. Each scenario uses the three-level pattern.

### Scenario A — New developer on an inventory service

**Beginner Level:** Clone the repo, create `.venv`, run `pip install -r requirements.txt`, execute `python -m inventory.cli --help`.

```python
# inventory/cli.py (beginner sketch)
def main():
    print("Commands: list, add, sync")

if __name__ == "__main__":
    main()
```

**Intermediate Level:** Use `python -m pytest` inside the activated venv; set `PYTHONPATH=src` if imports fail.

```bash
export PYTHONPATH=src
pytest -q
```

**Expert Level:** Run the same in **Docker** with multi-stage build, non-root user, and `pip install --no-cache-dir -r requirements.txt` pinned by hash.

### Scenario B — Bank analytics notebook to production module

**Beginner Level:** Explore APR curves in Jupyter, then copy working cells into `apr.py`.

**Intermediate Level:** Extract pure functions, add `if __name__ == "__main__"` smoke tests, and delete duplicated notebook logic.

```python
# apr.py
def effective_rate(nominal: float, periods: int) -> float:
    return (1 + nominal / periods) ** periods - 1
```

**Expert Level:** Package with `pyproject.toml`, type-check with mypy, publish internal wheel to Artifactory, consume from batch ETL.

### Scenario C — E-commerce local development

**Beginner Level:** One terminal runs `python manage.py runserver` (Django) or `uvicorn main:app --reload` (FastAPI).

**Intermediate Level:** Split settings: `settings/local.py` vs `settings/prod.py`; use `.env` + `python-dotenv` (never commit secrets).

**Expert Level:** Feature flags, database migrations in CI, canary deploys — Python is one piece in a larger platform.

### Scenario D — Student management CLI

**Beginner Level:** Read a CSV with the stdlib `csv` module and print rows.

```python
import csv
from pathlib import Path

def load_students(path: Path) -> None:
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            print(row["name"], row["gpa"])

# load_students(Path("students.csv"))
```

**Intermediate Level:** Add `argparse` for `--file` and `--sort-by`.

**Expert Level:** SQLite persistence, SQLAlchemy models, Alembic migrations, and pytest with tmp_path fixtures.

### Scenario E — Weather API prototype

**Beginner Level:** `urllib.request` or `requests` to GET JSON and print temperature.

**Intermediate Level:** Cache responses with `functools.lru_cache` or a small file cache for rate limits.

**Expert Level:** Async `httpx`, retries with tenacity, structured logging, OpenTelemetry spans around outbound HTTP.

### Quick reference — activation commands

```bash
# Windows (cmd)
.venv\Scripts\activate.bat

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

### Quick reference — useful one-liners

```bash
python -m json.tool < payload.json
python -c "import sys; print(sys.executable)"
python -m timeit -s "data=range(1000)" "sum(data)"
```

---

## Best Practices

- Install **Python 3.12+** (or your org’s supported LTS) and verify with `python --version`.
- Always use a **virtual environment** per project; never `pip install` into the system Python on shared machines.
- Prefer **`python -m pip`** and **`python -m venv`** so commands match the active interpreter.
- Structure projects with a clear **entry point**, **`README`**, and **dependency lock** strategy.
- Learn **`if __name__ == "__main__"`** early to separate importable library code from scripts.
- Use **formatters and linters** from day one so style is automatic, not debated.
- For notebooks, **strip outputs** before git commit unless outputs are intentional artifacts.
- Pin **Python and dependency versions** in production containers and CI matrices.

---

## Common Mistakes to Avoid

- Installing packages **globally** and breaking system tools (especially on Linux/macOS).
- Mixing **tabs and spaces** — copy-paste from the web can hide this until runtime `IndentationError`.
- Running tutorials written for **Python 2** (`print` without parentheses, `xrange`, `unicode` type).
- Putting **secrets** in source files, notebooks, or committed `.env` files.
- Committing **`.venv`** or **huge `__pycache__`** trees to version control.
- Ignoring **`python3` vs `python`** on PATH and wondering why `pip` installs somewhere else.
- Using the REPL or Jupyter as the **only** workflow — learn `.py` modules for real apps.
- **Skipping tests** and type hints on “small” scripts that later become **production** dependencies.

---

*Happy coding — welcome to the Python ecosystem.*

---

## Glossary (Quick Reference)

| Term | Meaning |
|------|---------|
| **CPython** | Reference Python implementation written in C |
| **REPL** | Read-Eval-Print Loop — interactive interpreter |
| **venv** | Standard-library virtual environment tool |
| **PyPI** | Python Package Index — default source for pip |
| **PEP** | Python Enhancement Proposal — design documents |
| **Bytecode** | Low-level instructions executed by Python VM |
| **Shebang** | `#!` line telling Unix which interpreter to use |
| **Conda** | Cross-language package and environment manager |
| **LSP** | Language Server Protocol — powers IDE intelligence |

These terms appear throughout professional **bank**, **retail**, and **SaaS** Python codebases; knowing them speeds onboarding and documentation reading.
