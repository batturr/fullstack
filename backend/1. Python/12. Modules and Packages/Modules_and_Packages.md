
# Modules and Packages in Python

Modules and packages let you split an e-commerce monolith into importable pieces—catalog, checkout, fraud—with clear boundaries and test doubles.



## 📑 Table of Contents

- [12.1 Module Basics](#121-module-basics)
- [12.2 Module System Internals](#122-module-system-internals)
- [12.3 Packages and Imports](#123-packages-and-imports)
- [12.4 Standard Library Highlights](#124-standard-library-highlights)
- [12.5 Third-Party Ecosystem](#125-third-party-ecosystem)

### 12.1 Module Basics
<a id="121-module-basics"></a>



### 12.1.1 What Is a Module

<a id="1211-what-is-a-module"></a>

**Beginner Level**: In real-world e-commerce workflows, What Is a Module connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce contexts combine solid practice around what is a module with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to what is a module affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce systems.

```python
# inventory.py — namespaced code reused across services
STOCK = {}

def set_stock(sku, qty):
    STOCK[sku] = qty
```

**Key Points**
- A module is a file (or namespace) whose definitions load once
- `import` binds names in the importer’s namespace
- Prefer small, cohesive modules per domain area

### 12.1.2 Creating a Module

<a id="1212-creating-a-module"></a>

**Beginner Level**: In real-world banking workflows, Creating a Module connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in banking contexts combine solid practice around creating a module with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to creating a module affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in banking systems.

```python
# rates.py
BASE_APR = 0.039

def apr_for(score):
    return BASE_APR if score > 700 else BASE_APR + 0.01
```

**Key Points**
- Any `.py` file can act as a module
- Avoid side effects at import time except lightweight config
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.1.3 The `import` Statement

<a id="1213-import-statement"></a>

**Beginner Level**: In real-world library system workflows, The `import` Statement connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in library system contexts combine solid practice around the `import` statement with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `import` statement affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in library system systems.

```python
# catalog.py in same package folder (example)
# import catalog  # would run catalog.py
PI = 3.14

def shelf_label(code):
    return f"SHELF-{code}"
```

**Key Points**
- `import mod` executes `mod.py` once then caches in `sys.modules`
- Access attributes with `mod.name`
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.1.4 `from` … `import`

<a id="1214-from-import"></a>

**Beginner Level**: In real-world employee management workflows, `from` … `import` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in employee management contexts combine solid practice around `from` … `import` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `from` … `import` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in employee management systems.

```python
from math import sqrt, ceil

def allocate_desks(headcount):
    return ceil(sqrt(headcount))
```

**Key Points**
- Imports specific names into current namespace
- Can create shadowing—avoid importing `list`, `dict`, etc.
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.1.5 `import *` and `__all__`

<a id="1215-star-import"></a>

**Beginner Level**: In real-world inventory workflows, `import *` and `__all__` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory contexts combine solid practice around `import *` and `__all__` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `import *` and `__all__` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory systems.

```python
# reporting.py
__all__ = ["summary"]

def summary():
    return "ok"

def _hidden():
    return "internal"
```

**Key Points**
- `from mod import *` imports `__all__` or non-underscore names
- Pollutes namespaces—discouraged in application code
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.1.6 Import Aliases

<a id="1216-import-aliases"></a>

**Beginner Level**: In real-world payments workflows, Import Aliases connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments contexts combine solid practice around import aliases with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to import aliases affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments systems.

```python
import datetime as dt
import json as js

def iso_now():
    return dt.datetime.utcnow().isoformat()
```

**Key Points**
- `as` shortens long package paths
- Keeps call sites readable in data pipelines
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.2 Module System Internals

<a id="122-module-system-internals"></a>

### 12.2.1 `sys.modules`

<a id="1221-sys-modules"></a>

**Beginner Level**: In real-world API gateway workflows, `sys.modules` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in API gateway contexts combine solid practice around `sys.modules` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `sys.modules` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in API gateway systems.

```python
import sys

def describe_cache(name):
    return name in sys.modules
```

**Key Points**
- Import cache prevents double execution
- Useful for introspection and hot-reload tooling
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.2.2 Module Search Path (`sys.path`)

<a id="1222-sys-path"></a>

**Beginner Level**: In real-world microservices workflows, Module Search Path (`sys.path`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in microservices contexts combine solid practice around module search path (`sys.path`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to module search path (`sys.path`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in microservices systems.

```python
import sys

for p in sys.path[:3]:
    print(p)
```

**Key Points**
- Python searches entries in order for `import`
- Virtualenvs prepend their `site-packages`
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.2.3 `__name__` and the Current Module

<a id="1223-dunder-name"></a>

**Beginner Level**: In real-world CLI tools workflows, `__name__` and the Current Module connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in CLI tools contexts combine solid practice around `__name__` and the current module with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__name__` and the current module affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in CLI tools systems.

```python
if __name__ == "__main__":
    print("run as script")
```

**Key Points**
- `__main__` when executed as top-level script
- Enables reusable modules and testable CLIs
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.2.4 Main Module Pattern

<a id="1224-main-module-pattern"></a>

**Beginner Level**: In real-world batch jobs workflows, Main Module Pattern connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in batch jobs contexts combine solid practice around main module pattern with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to main module pattern affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in batch jobs systems.

```python
def main():
    print("ETL start")

if __name__ == "__main__":
    main()
```

**Key Points**
- Guard side-effecting entrypoints
- Keeps imports safe for libraries
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.2.5 Reloading Modules

<a id="1225-reloading-modules"></a>

**Beginner Level**: In real-world notebooks workflows, Reloading Modules connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in notebooks contexts combine solid practice around reloading modules with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to reloading modules affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in notebooks systems.

```python
import importlib
import sys

# importlib.reload(some_module)  # after editing source in dev
```

**Key Points**
- `reload` re-executes module body—mutable singletons may duplicate state
- Rare in production; dev/REPL aid
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.2.6 Module Initialization (Once)

<a id="1226-module-initialization"></a>

**Beginner Level**: In real-world web app workflows, Module Initialization (Once) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in web app contexts combine solid practice around module initialization (once) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to module initialization (once) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in web app systems.

```python
_initialized = False

def init_app():
    global _initialized
    if _initialized:
        return
    _initialized = True
    print("db pool ready")
```

**Key Points**
- Module-level code runs on first import
- Use idempotent init for shared resources
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.3 Packages and Imports

<a id="123-packages-and-imports"></a>

### 12.3.1 What Is a Package

<a id="1231-what-is-a-package"></a>

**Beginner Level**: In real-world e-commerce workflows, What Is a Package connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce contexts combine solid practice around what is a package with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to what is a package affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce systems.

```python
# myshop/__init__.py may be empty or export API
__version__ = "1.0.0"
```

**Key Points**
- Package is a module with submodules (usually a directory)
- Namespace organizes bounded contexts (catalog, checkout)
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.3.2 Creating Packages

<a id="1232-creating-packages"></a>

**Beginner Level**: In real-world logistics workflows, Creating Packages connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in logistics contexts combine solid practice around creating packages with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to creating packages affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in logistics systems.

```python
# mylog/setup: mylog/__init__.py + mylog/tracking.py
# import mylog.tracking
```

**Key Points**
- Directory + `__init__.py` (3.3+ namespace packages may omit in some layouts)
- Keep package name lowercase, no dashes
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.3.3 The Role of `__init__.py`

<a id="1233-init-py-role"></a>

**Beginner Level**: In real-world bank workflows, The Role of `__init__.py` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bank contexts combine solid practice around the role of `__init__.py` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the role of `__init__.py` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bank systems.

```python
# acmebank/__init__.py
from .accounts import Account

__all__ = ["Account"]
```

**Key Points**
- Controls package import surface
- Can re-export for stable public API
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.3.4 Subpackages

<a id="1234-subpackages"></a>

**Beginner Level**: In real-world HR SaaS workflows, Subpackages connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in HR SaaS contexts combine solid practice around subpackages with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to subpackages affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in HR SaaS systems.

```python
# hr/payroll/calc.py imported as hr.payroll.calc
```

**Key Points**
- Dot notation reflects directory nesting
- Improves discoverability in large codebases
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.3.5 Absolute Imports

<a id="1235-absolute-imports"></a>

**Beginner Level**: In real-world retail POS workflows, Absolute Imports connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in retail POS contexts combine solid practice around absolute imports with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to absolute imports affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in retail POS systems.

```python
from shop.inventory.stock import adjust

def sale():
    adjust("SKU1", -1)
```

**Key Points**
- Start from top-level package for clarity
- Preferred in modern Python (PEP 8)
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.3.6 Relative Imports

<a id="1236-relative-imports"></a>

**Beginner Level**: In real-world internal SDK workflows, Relative Imports connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in internal SDK contexts combine solid practice around relative imports with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to relative imports affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in internal SDK systems.

```python
# inside pkg/a.py: from .b import helper
# from ..parent import x
```

**Key Points**
- `.` current package, `..` parent
- Use inside packages only—not in scripts run as `__main__` at arbitrary paths
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.4 Standard Library Highlights

<a id="124-standard-library-highlights"></a>

### 12.4.1 Built-in Functions and `builtins`

<a id="1241-builtins-module"></a>

**Beginner Level**: In real-world data pipeline workflows, Built-in Functions and `builtins` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in data pipeline contexts combine solid practice around built-in functions and `builtins` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to built-in functions and `builtins` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in data pipeline systems.

```python
import builtins

print(builtins.sum([1, 2, 3]))
```

**Key Points**
- `len`, `sum`, `open` live in builtins module
- Shadowing builtins causes painful bugs
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.4.2 The `sys` Module

<a id="1242-sys-module"></a>

**Beginner Level**: In real-world observability workflows, The `sys` Module connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in observability contexts combine solid practice around the `sys` module with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `sys` module affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in observability systems.

```python
import sys

print(sys.version_info[:2])
```

**Key Points**
- Argv, stdin/stdout, recursion limit, path
- Use for platform/version gates
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.4.3 The `os` Module

<a id="1243-os-module"></a>

**Beginner Level**: In real-world file workers workflows, The `os` Module connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in file workers contexts combine solid practice around the `os` module with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `os` module affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in file workers systems.

```python
import os

print(os.name)
```

**Key Points**
- Process and filesystem primitives
- Prefer `pathlib` for path manipulation when possible
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.4.4 `collections`

<a id="1244-collections-module"></a>

**Beginner Level**: In real-world analytics workflows, `collections` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in analytics contexts combine solid practice around `collections` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `collections` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in analytics systems.

```python
from collections import Counter, defaultdict

c = Counter(["a", "b", "a"])
print(c["a"])
```

**Key Points**
- Specialized containers (`deque`, `namedtuple`, `ChainMap`)
- Performance and clarity wins in aggregations
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.4.5 `itertools`

<a id="1245-itertools-module"></a>

**Beginner Level**: In real-world warehouse batches workflows, `itertools` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in warehouse batches contexts combine solid practice around `itertools` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `itertools` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in warehouse batches systems.

```python
import itertools

chunks = list(itertools.batched(range(5), 2))
print(chunks)
```

**Key Points**
- Memory-efficient iterators for combinatorics and grouping
- Pairs well with generator pipelines
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.4.6 `functools`

<a id="1246-functools-module"></a>

**Beginner Level**: In real-world pricing service workflows, `functools` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in pricing service contexts combine solid practice around `functools` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `functools` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in pricing service systems.

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fee(amount):
    return amount * 0.02
```

**Key Points**
- `partial`, `reduce`, `cached_property`
- Common in services needing memoized pure helpers
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.5 Third-Party Ecosystem

<a id="125-third-party-ecosystem"></a>

### 12.5.1 PyPI and Package Discovery

<a id="1251-pypi"></a>

**Beginner Level**: In real-world startups workflows, PyPI and Package Discovery connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in startups contexts combine solid practice around pypi and package discovery with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to pypi and package discovery affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in startups systems.

```python
# Browse https://pypi.org for django, fastapi, pydantic, etc.
```

**Key Points**
- Community packages accelerate delivery
- Pin versions for reproducible deploys
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.5.2 `pip install`

<a id="1252-pip-install"></a>

**Beginner Level**: In real-world DevOps workflows, `pip install` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in DevOps contexts combine solid practice around `pip install` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `pip install` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in DevOps systems.

```python
# pip install "requests>=2.28,<3"
```

**Key Points**
- Installs into active environment
- Use constraints files in CI images
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.5.3 `requirements.txt`

<a id="1253-requirements-txt"></a>

**Beginner Level**: In real-world platform team workflows, `requirements.txt` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in platform team contexts combine solid practice around `requirements.txt` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `requirements.txt` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in platform team systems.

```python
# requirements.txt lines:
# fastapi==0.110.0
# uvicorn[standard]==0.29.0
```

**Key Points**
- Freeze transitive deps for production
- Consider `pip-tools` or Poetry/pdm for lockfiles
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.5.4 Virtual Environments (`venv`)

<a id="1254-virtual-environments"></a>

**Beginner Level**: In real-world consulting workflows, Virtual Environments (`venv`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in consulting contexts combine solid practice around virtual environments (`venv`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to virtual environments (`venv`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in consulting systems.

```python
# python3 -m venv .venv && source .venv/bin/activate
```

**Key Points**
- Isolate dependencies per project
- Never install project libs globally on shared servers casually
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.5.5 Common `pip` Flags

<a id="1255-pip-options"></a>

**Beginner Level**: In real-world SRE workflows, Common `pip` Flags connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in SRE contexts combine solid practice around common `pip` flags with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to common `pip` flags affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in SRE systems.

```python
# pip install -r requirements.txt --no-cache-dir
# pip install -e ./local_pkg
```

**Key Points**
- `-e` editable installs for libraries you develop
- `--user` vs venv—prefer venv
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 12.5.6 Dependency Resolution and Conflicts

<a id="1256-dependencies"></a>

**Beginner Level**: In real-world fintech workflows, Dependency Resolution and Conflicts connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in fintech contexts combine solid practice around dependency resolution and conflicts with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to dependency resolution and conflicts affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in fintech systems.

```python
# pip check  # verifies installed packages have compatible requirements
```

**Key Points**
- Transitive deps can conflict—use resolver output seriously
- Document security updates for payment stacks
- See code sample.
- Relates to production data integrity.
- Test edge cases.


---

## Supplementary patterns for real backends

### Lazy imports to break circular dependencies

**Beginner Level**: If `views` imports `services` and `services` imports `views`, the import cycle errors can confuse newcomers.

**Intermediate Level**: Move shared types to a third module, or import inside a function right before use so the cycle is deferred.

**Expert Level**: In ASGI/WSGI apps, structure packages so edges (HTTP) depend inward on domain modules, never the reverse; use protocols for inversion.

```python
def get_user_service():
    from . import user_service  # deferred import

    return user_service
```

**Key Points**
- Deferred imports are a smell—restructure when cycles grow.
- Domain core should not import framework layers.

### `requirements.txt` vs lockfiles for a bank-grade service

**Beginner Level**: Pin major versions so `pip install -r requirements.txt` is predictable.

**Intermediate Level**: Separate `requirements-dev.txt` for pytest/mypy; use `pip-compile` to freeze transitive pins.

**Expert Level**: Scan SBOM output in CI, block CVEs above policy, and mirror PyPI internally for supply-chain control.

```python
# constraints.txt example (generated)
# requests==2.31.0
# certifi==2024.2.2
```

**Key Points**
- Reproducible builds beat "works on my laptop."
- Document upgrade cadence for compliance audits.

### Editable installs for internal libraries

**Beginner Level**: `pip install -e ./mylib` lets you edit source and immediately import changes while building an employee portal.

**Intermediate Level**: Pair editable installs with `src/` layout so imports match what CI publishes to your private index.

**Expert Level**: Version internal packages, sign artifacts, and gate promotions through staging environments that mirror production import paths.

```python
# pyproject.toml snippet (conceptual)
# [project]
# name = "acme-hr"
# version = "0.4.0"
```

**Key Points**
- Editable mode accelerates monorepo-style service development.
- Still pin released dependencies in deployed images.

---

## Best Practices

- Prefer absolute imports inside packages; reserve relative imports for intra-package glue.
- Keep `__init__.py` thin; avoid heavy work on import unless documented.
- Pin dependencies and scan for CVEs in regulated industries (banking, healthcare).
- Use `python -m` to run modules so `sys.path[0]` is predictable.

---

## Common Mistakes to Avoid

- Circular imports solved by lazy imports or restructuring—avoid `import *` hacks.
- Mutating `sys.path` at runtime without isolation—breaks deployments.
- Installing packages into the system Python on servers—use venv/containers.
