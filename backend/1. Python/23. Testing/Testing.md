# Python Testing (Topic 23)

Automated tests protect APIs, data pipelines, and ML services from regressions. Python’s ecosystem centers on **`unittest`** (stdlib), **`pytest`** (de facto standard), **`unittest.mock`**, and supporting tools for coverage and CI. This topic breaks down fundamentals through advanced techniques with three depth levels and production-oriented examples.

## 📑 Table of Contents

- [23.1 Testing Fundamentals](#231-testing-fundamentals)
- [23.2 The `unittest` Framework](#232-the-unittest-framework)
- [23.3 `pytest`](#233-pytest)
- [23.4 Mocking with `unittest.mock`](#234-mocking-with-unittestmock)
- [23.5 Test Organization and Tooling](#235-test-organization-and-tooling)
- [23.6 Advanced Testing Styles](#236-advanced-testing-styles)
- [Topic Key Points](#topic-key-points)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 23.1 Testing Fundamentals

### 23.1.1 Types of Tests (Unit, Integration, E2E)

**Beginner Level**: **Unit** tests check one function or class in isolation. **Integration** tests combine modules (e.g., app + database). **End-to-end** tests drive the full stack like a user.

**Intermediate Level**: The **test pyramid** favors many fast unit tests, fewer integration tests, rare slow E2E. For ML, add **data validation** and **model contract** checks.

**Expert Level**: In microservices, use **contract tests** (consumer-driven) and **canary** releases; mark slow tests for selective CI execution.

```python
# Beginner-style unit: pure function
def discount(price: float, pct: float) -> float:
    return round(price * (1 - pct), 2)

def test_discount():
    assert discount(100, 0.1) == 90.0

# Intermediate: integration sketch (pseudo — real test uses test DB)
# def test_create_order_persists(client, db_session):
#     r = client.post("/orders", json={"sku": "A", "qty": 1})
#     assert r.status_code == 201
#     assert db_session.query(Order).count() == 1
```

#### Key Points

- Name tests by behavior, not method names only.
- Fast feedback loops come from good unit coverage.

---

### 23.1.2 Test-Driven Development (TDD)

**Beginner Level**: Write a failing test, implement minimal code to pass, refactor.

**Intermediate Level**: TDD shines for algorithms and pricing rules; less for exploratory data science.

**Expert Level**: **Outside-in TDD** with ports/adapters; **inside-out** for domain kernels—pick per subsystem.

```python
# Beginner: red-green for validation
def is_valid_isbn10(s: str) -> bool:
    # implement after test
    return len(s) == 10  # placeholder fails richer tests

def test_length():
    assert is_valid_isbn10("123456789X") in (True, False)
```

#### Key Points

- TDD is a discipline, not a religion—use where it reduces defect cost.

---

### 23.1.3 Assertions and Failure Messages

**Beginner Level**: `assert actual == expected` stops the test if false.

**Intermediate Level**: `unittest` assertions give richer diffs (`assertEqual`, `assertAlmostEqual`).

**Expert Level**: Custom assertion helpers and `pytest`’s rewritten assertions improve DX.

```python
# Beginner
assert 1 + 1 == 2

# Intermediate: unittest
import unittest

class Demo(unittest.TestCase):
    def test_list(self):
        self.assertListEqual([1, 2], [1, 2])

# Expert: pytest style
def test_api_shape():
    payload = {"user": {"id": 1}}
    assert payload["user"]["id"] == 1
```

#### Key Points

- Add context: `assert x, "reason"` for quick failures.

---

### 23.1.4 Code Coverage

**Beginner Level**: Coverage measures which lines ran during tests.

**Intermediate Level**: **Branch coverage** matters for `if/else`; 100% line coverage ≠ no bugs.

**Expert Level**: Use coverage to find **untested critical paths**, not as a vanity metric; exclude generated code.

```python
# Example function to cover branches
def classify_risk(score: int) -> str:
    if score < 30:
        return "low"
    if score < 70:
        return "medium"
    return "high"

def test_edges():
    assert classify_risk(0) == "low"
    assert classify_risk(50) == "medium"
    assert classify_risk(90) == "high"
```

#### Key Points

- Run `pytest --cov=pkg tests/` or `coverage run -m pytest`.

---

### 23.1.5 Fixtures and Test Data

**Beginner Level**: **Fixtures** are reusable setup (DB connection, sample user).

**Intermediate Level**: `pytest` fixtures compose with dependency injection; `unittest` uses `setUp`.

**Expert Level**: **Factory patterns** (factory_boy, pydantic factories) create valid graphs of objects.

```python
# Beginner: simple factory function
def make_user(name="ada"):
    return {"name": name, "active": True}

def test_user_active():
    u = make_user()
    assert u["active"] is True
```

#### Key Points

- Prefer factories over huge static JSON blobs when models evolve.

---

### 23.1.6 Isolation and Test Doubles

**Beginner Level**: Tests should not call real payment APIs—use **fakes** or **mocks**.

**Intermediate Level**: **Stub** returns canned data; **mock** asserts calls; **fake** is working lightweight impl.

**Expert Level**: Boundaries: mock **ports**, not every private function—avoid brittle tests.

```python
# Beginner: inject clock for time-dependent logic
from datetime import datetime, timezone

def greeting(now: datetime) -> str:
    h = now.astimezone(timezone.utc).hour
    return "night" if h < 6 or h >= 22 else "day"

def test_greeting():
    noon = datetime(2026, 1, 1, 12, tzinfo=timezone.utc)
    assert greeting(noon) == "day"
```

#### Key Points

- Deterministic tests avoid `datetime.now()` without injection.

---

### 23.1.7 Flaky Tests and Mitigation

**Beginner Level**: Flaky means sometimes pass, sometimes fail—often timing or shared state.

**Intermediate Level**: Quarantine flaky tests, add retries only as last resort for true externals.

**Expert Level**: Use **test isolation**, **idempotent** fixtures, **containerized** dependencies, and **record/replay** for third parties.

```python
# Bad: sleep for race
import time

def bad_test():
    start_job()
    time.sleep(0.5)  # fragile
    assert job_done()

# Better: poll with timeout (conceptual)
def wait_until(pred, timeout=2.0, step=0.05):
    import time as t
    end = t.monotonic() + timeout
    while t.monotonic() < end:
        if pred():
            return
        t.sleep(step)
    raise AssertionError("timeout")
```

#### Key Points

- Fix root cause: shared globals, random seeds, external network.

---

## 23.2 The `unittest` Framework

### 23.2.1 `unittest.TestCase`

**Beginner Level**: Subclass `TestCase`, define methods starting with `test_`.

**Intermediate Level**: Use `self.assert*` methods instead of raw `assert` for better messages in some runners.

**Expert Level**: Integrate with Django’s `TestCase` for DB transactions—same patterns.

```python
import unittest

class MathTest(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1 + 1, 2)

if __name__ == "__main__":
    unittest.main()
```

#### Key Points

- Discovery: `python -m unittest discover`.

---

### 23.2.2 `setUp` / `tearDown`

**Beginner Level**: `setUp` runs before each test method; `tearDown` cleans up.

**Intermediate Level**: For expensive once-per-class setup, `setUpClass`/`tearDownClass` with `@classmethod`.

**Expert Level**: Prefer pytest fixtures for composition; unittest class methods pair with legacy suites.

```python
import unittest

class TmpTest(unittest.TestCase):
    def setUp(self):
        self.buffer = []

    def tearDown(self):
        self.buffer.clear()

    def test_append(self):
        self.buffer.append(1)
        self.assertEqual(self.buffer, [1])
```

#### Key Points

- Ensure `tearDown` runs even on failure—use `addCleanup` for tricky resources.

---

### 23.2.3 Test Methods and Discovery

**Beginner Level**: Any method named `test_*` in a `TestCase` subclass is a test.

**Intermediate Level**: Pattern flags `-k` not in unittest; use `load_tests` for custom suites.

**Expert Level**: Keep one behavior per test method for clearer failures.

```python
import unittest

class PayTest(unittest.TestCase):
    def test_charge_declined(self):
        self.assertFalse(charge(0))

    def test_charge_ok(self):
        self.assertTrue(charge(10))

def charge(amount: int) -> bool:
    return amount > 0
```

#### Key Points

- Avoid inter-test dependencies and shared mutable state.

---

### 23.2.4 `unittest` Assertions

**Beginner Level**: `assertEqual`, `assertTrue`, `assertRaises`.

**Intermediate Level**: `assertAlmostEqual` for floats; `assertCountEqual` for order-insensitive.

**Expert Level**: `assertLogs` for logging verification.

```python
import unittest
import logging

class LogTest(unittest.TestCase):
    def test_logs_warning(self):
        with self.assertLogs("app", level="WARNING") as cm:
            logging.getLogger("app").warning("x")
        self.assertIn("WARNING", cm.output[0])
```

#### Key Points

- Choose assertion specialized to type for clearer diffs.

---

### 23.2.5 Test Suites

**Beginner Level**: `unittest.TestSuite` groups tests manually.

**Intermediate Level**: Rare in modern pytest-first repos; useful embedding unittest in custom runners.

**Expert Level**: Dynamic suite building for plugin systems.

```python
import unittest

def suite():
    s = unittest.TestSuite()
    s.addTest(unittest.makeSuite(MathTest))  # legacy style; prefer discover
    return s
```

#### Key Points

- Prefer discovery over manual suite assembly.

---

### 23.2.6 Test Runners

**Beginner Level**: `python -m unittest path.to.test`.

**Intermediate Level**: IDE integration runs same discovery.

**Expert Level**: CI runs with JUnit XML output (`pytest --junitxml`) for dashboards.

```python
# unittest CLI
# python -m unittest discover -s tests -p "test_*.py"
```

#### Key Points

- Verbose mode `-v` helps local debugging.

---

### 23.2.7 `subTest`, Skip, and Expected Failure

**Beginner Level**: `self.subTest` parametrizes iterations inside one test with separate failure context.

**Intermediate Level**: `@unittest.skip`, `@unittest.expectedFailure`.

**Expert Level**: Use `subTest` for table-driven cases without pytest.

```python
import unittest

class Table(unittest.TestCase):
    def test_squares(self):
        for n, exp in [(1, 1), (2, 4), (3, 9)]:
            with self.subTest(n=n):
                self.assertEqual(n * n, exp)
```

#### Key Points

- `subTest` continues after failure—see all failing rows.

---

## 23.3 `pytest`

### 23.3.1 Basics

**Beginner Level**: Plain functions `def test_*` and plain `assert`.

**Intermediate Level**: Powerful traceback introspection on assertion failure.

**Expert Level**: Plugins extend collection, reporting, asyncio.

```python
# test_sample.py
def test_upper():
    assert "hi".upper() == "HI"
```

#### Key Points

- Install: `pip install pytest`.

---

### 23.3.2 Fixtures

**Beginner Level**: `@pytest.fixture` functions inject setup into tests.

**Intermediate Level**: Scope `function`, `class`, `module`, `session` balances speed vs isolation.

**Expert Level**: Fixture factories yield resources with teardown after `yield`.

```python
import pytest

@pytest.fixture
def db():
    conn = open_memory_db()
    yield conn
    conn.close()

def test_insert(db):
    db.execute("INSERT INTO t VALUES (1)")
```

#### Key Points

- `autouse=True` for cross-cutting setup—use sparingly.

---

### 23.3.3 `parametrize`

**Beginner Level**: Run same test body with many inputs.

**Intermediate Level**: IDs for readable failure output.

**Expert Level**: Combine with fixtures—know parameter ordering rules.

```python
import pytest

@pytest.mark.parametrize("x,y,exp", [(1, 2, 3), (2, 3, 5)], ids=["small", "mid"])
def test_add(x, y, exp):
    assert x + y == exp
```

#### Key Points

- Great for boundary tables and ML metric thresholds.

---

### 23.3.4 Markers

**Beginner Level**: `@pytest.mark.slow` to label tests.

**Intermediate Level**: Register markers in `pyproject.toml` to avoid typos.

**Expert Level**: `-m "not slow"` in CI default job; nightly runs all.

```python
import pytest

@pytest.mark.slow
def test_big_data():
    assert True
```

#### Key Points

- `pytest.ini` or `pyproject.toml` `[tool.pytest.ini_options]` markers list.

---

### 23.3.5 Plugins (Overview)

**Beginner Level**: `pytest-cov` coverage, `pytest-xdist` parallel.

**Intermediate Level**: `pytest-mock` provides `mocker` fixture.

**Expert Level**: Custom plugins for corporate test harnesses.

```python
# pytest-cov (CLI)
# pytest --cov=myapp --cov-report=html

# pytest-xdist
# pytest -n auto
```

#### Key Points

- Pin plugin versions in lockfiles for CI reproducibility.

---

### 23.3.6 Configuration (`pytest.ini`, `pyproject.toml`)

**Beginner Level**: Set `testpaths`, `python_files`, `addopts`.

**Intermediate Level**: `asyncio_mode = auto` for pytest-asyncio.

**Expert Level**: Split configs for local vs CI with env vars.

```toml
# pyproject.toml fragment
[tool.pytest.ini_options]
minversion = "7.0"
addopts = "-ra -q"
testpaths = ["tests"]
```

#### Key Points

- Centralize CLI flags to keep developer commands short.

---

### 23.3.7 `conftest.py` Hierarchy

**Beginner Level**: Place shared fixtures in `tests/conftest.py`.

**Intermediate Level**: Nested `conftest.py` under packages scopes fixtures to subtrees.

**Expert Level**: Avoid import cycles—fixtures should not import app modules at collection time unnecessarily.

```python
# tests/conftest.py
import pytest

@pytest.fixture(scope="session")
def api_url():
    return "http://localhost:8000"
```

#### Key Points

- `conftest.py` is auto-loaded, not a regular module to import fixtures from casually.

---

### 23.3.8 Async Tests (`pytest-asyncio`)

**Beginner Level**: Mark test `async def` and use plugin.

**Intermediate Level**: Async fixtures for async DB clients.

**Expert Level**: Bound event loop issues—avoid mixing blocking calls in async tests.

```python
import pytest

pytest.importorskip("pytest_asyncio")

@pytest.mark.asyncio
async def test_fetch():
    assert await async_identity(1) == 1

async def async_identity(x):
    return x
```

#### Key Points

- Prefer native async test support in modern pytest-asyncio versions.

---

## 23.4 Mocking with `unittest.mock`

### 23.4.1 `unittest.mock` Overview

**Beginner Level**: Replace real objects with test doubles that record calls.

**Intermediate Level**: `patch` swaps imports temporarily.

**Expert Level**: Over-mocking hides integration bugs—mock boundaries.

```python
from unittest.mock import Mock

def test_uses_http_client():
    client = Mock()
    client.get.return_value.json.return_value = {"ok": True}
    svc = Service(client)
    assert svc.status()["ok"] is True

class Service:
    def __init__(self, client):
        self.client = client
    def status(self):
        return self.client.get("/health").json()
```

#### Key Points

- Mock where you **own** the seam (interface), not deep internals.

---

### 23.4.2 `Mock` and `MagicMock`

**Beginner Level**: `Mock()` creates an object accepting any attribute/call.

**Intermediate Level**: `MagicMock` implements magic methods like `__iter__`.

**Expert Level**: `spec` restricts API surface to catch typos.

```python
from unittest.mock import Mock

m = Mock(spec=["load"])
m.load.return_value = {"a": 1}
print(m.load())
```

#### Key Points

- `autospec=True` copies signature for safer patching.

---

### 23.4.3 Patching

**Beginner Level**: `@patch("module.func")` replaces object during test.

**Intermediate Level**: Patch **where used**, not where defined.

**Expert Level**: `patch.object` for instance methods; context manager form for fine scope.

```python
from unittest.mock import patch

def compute():
    import random
    return random.randint(1, 6)

@patch("random.randint", return_value=4)
def test_deterministic(mock_randint):
    assert compute() == 4
```

#### Key Points

- Wrong patch path = silent real calls.

---

### 23.4.4 Mock Assertions

**Beginner Level**: `mock.assert_called_once()`, `assert_called_with(...)`.

**Intermediate Level**: `assert_has_calls` for order-sensitive sequences.

**Expert Level**: `call_args_list` introspection for complex APIs.

```python
from unittest.mock import Mock

def test_notifier():
    n = Mock()
    n.send("a")
    n.send("b")
    n.send.assert_called()
    assert n.send.call_count == 2
```

#### Key Points

- Assert **behavior** at boundaries, not every internal call.

---

### 23.4.5 Side Effects

**Beginner Level**: `side_effect` raises exception or returns sequence per call.

**Intermediate Level**: Callable `side_effect` for dynamic responses.

**Expert Level**: Model retry/backoff by returning failures then success.

```python
from unittest.mock import Mock

m = Mock()
m.side_effect = [1, 2, ValueError("boom")]
print(m(), m())
try:
    m()
except ValueError as e:
    print(e)
```

#### Key Points

- Exhausted `side_effect` list raises `StopIteration`—watch call counts.

---

### 23.4.6 `MagicMock` for Operators and Iteration

**Beginner Level**: Use when mocking iterable or context manager.

**Intermediate Level**: `__enter__`/`__exit__` for `with` statements.

**Expert Level**: Compose nested `MagicMock` trees mirroring SDKs.

```python
from unittest.mock import MagicMock

m = MagicMock()
m.__iter__.return_value = iter([1, 2, 3])
print(list(m))
```

#### Key Points

- Prefer real simple fakes when magic method behavior is central.

---

### 23.4.7 `AsyncMock`

**Beginner Level**: Mocks `async def` calls with awaitable return.

**Intermediate Level**: `async for` support via magic methods.

**Expert Level**: Patch async clients in FastAPI tests.

```python
from unittest.mock import AsyncMock
import asyncio

async def demo():
    m = AsyncMock(return_value=42)
    assert await m() == 42

asyncio.run(demo())
```

#### Key Points

- Requires Python 3.8+ `AsyncMock`.

---

### 23.4.8 `autospec` and `spec_set`

**Beginner Level**: `patch(..., autospec=True)` prevents arbitrary attribute access.

**Intermediate Level**: Catches refactors that rename methods.

**Expert Level**: Slight friction vs bare Mock—worth it on large teams.

```python
from unittest.mock import create_autospec

class API:
    def fetch(self, x: int) -> int:
        return x

api = create_autospec(API, instance=True)
api.fetch(1)
```

#### Key Points

- `create_autospec` handy for interface-focused tests.

---

## 23.5 Test Organization and Tooling

### 23.5.1 Project Structure

**Beginner Level**: `tests/` mirror package layout or flat `test_*.py`.

**Intermediate Level**: Separate `tests/unit`, `tests/integration`.

**Expert Level**: Monorepo per service with own pytest config.

```text
src/
  myapp/
    api.py
tests/
  unit/
    test_api.py
  integration/
    test_api_db.py
```

#### Key Points

- Install package in editable mode for imports (`pip install -e .`).

---

### 23.5.2 Naming Conventions

**Beginner Level**: `test_` prefix functions; clear scenario names.

**Intermediate Level**: `test_when_stock_empty_then_409` style behavior names.

**Expert Level**: Consistent language aligned with product glossary.

```python
def test_when_discount_exceeds_100_percent_raises():
    with pytest.raises(ValueError):
        apply_discount(10, 1.5)
```

#### Key Points

- Avoid `test1`, `test2`.

---

### 23.5.3 Organization Strategies

**Beginner Level**: Group related tests in modules.

**Intermediate Level**: Markers for ownership (`@pytest.mark.billing`).

**Expert Level**: Codeowners file maps directories to teams.

```python
import pytest

@pytest.mark.billing
def test_invoice_total():
    assert True
```

#### Key Points

- Align test folders with bounded contexts in DDD.

---

### 23.5.4 Continuous Integration (CI)

**Beginner Level**: Run `pytest` on every push.

**Intermediate Level**: Matrix Python versions; cache dependencies.

**Expert Level**: Shard tests with `pytest -n auto`; fail fast on lint + types + tests.

```yaml
# conceptual GitHub Actions fragment
# - run: pytest -q
# - run: ruff check .
```

#### Key Points

- Upload coverage artifacts and JUnit for PR insights.

---

### 23.5.5 Coverage Tools

**Beginner Level**: `coverage.py` via `pytest-cov`.

**Intermediate Level**: Exclude migrations, virtualenv, generated protobuf.

**Expert Level**: Diff coverage on changed lines for large legacy codebases.

```ini
# .coveragerc fragment
[run]
omit =
    */migrations/*
    */tests/*
```

#### Key Points

- Enforce minimal thresholds gradually, not day-one 95%.

---

### 23.5.6 Test Data Factories and Pre-commit Hooks

**Beginner Level**: **Factories** are small functions that build valid orders or users for tests; **pre-commit** runs formatters or a quick `pytest` slice before you push.

**Intermediate Level**: Adopt `factory_boy` (or similar) for Django/SQLAlchemy graphs; wire `pre-commit` to `ruff`, `mypy`, and `pytest tests/unit` so obvious breaks never reach CI.

**Expert Level**: Pair factories with Hypothesis strategies for generative edge cases; keep hooks under ~60s (staged-only lint) and rely on CI for full integration matrices.

```python
def order(sku="X", qty=1, status="pending"):
    return {"sku": sku, "qty": qty, "status": status}

def test_ship_sets_status():
    o = order(status="paid")
    ship(o)
    assert o["status"] == "shipped"

def ship(o):
    if o["status"] != "paid":
        raise ValueError
    o["status"] = "shipped"
```

```yaml
# .pre-commit-config.yaml fragment (conceptual)
# repos:
#   - repo: local
#     hooks:
#       - id: pytest-quick
#         entry: pytest -q tests/unit
#         language: system
#         pass_filenames: false
```

#### Key Points

- Factories reduce duplicate setup and merge conflicts.
- Keep pre-commit fast so developers do not bypass it.

---

## 23.6 Advanced Testing Styles

### 23.6.1 Behavior-Driven Development (BDD)

**Beginner Level**: Given/When/Then readable scenarios.

**Intermediate Level**: `pytest-bdd`, `behave` parse feature files.

**Expert Level**: BDD as living documentation for product + QA alignment.

```gherkin
Feature: Checkout
  Scenario: Paid order ships
    Given a paid order
    When we ship
    Then status is shipped
```

#### Key Points

- BDD overhead pays off for cross-functional specs.

---

### 23.6.2 Property-Based Testing (`Hypothesis`)

**Beginner Level**: Declare properties that should hold for many generated inputs.

**Intermediate Level**: Shrinking finds minimal failing examples.

**Expert Level**: Great for parsers, serializers, round-trip invariants.

```python
from hypothesis import given
import hypothesis.strategies as st

@given(st.integers(), st.integers())
def test_add_commutative(a, b):
    assert a + b == b + a
```

#### Key Points

- Install `hypothesis`; mark slow properties for selective runs.

---

### 23.6.3 Snapshot Testing

**Beginner Level**: Store golden output of serializers/HTML and diff on change.

**Intermediate Level**: `pytest-snapshot` or custom JSON snapshots.

**Expert Level**: Review snapshot updates carefully—avoid rubber-stamping bugs.

```python
def test_render_user(snapshot):
    html = render({"name": "Ada"})
    snapshot.assert_match(html)
```

#### Key Points

- Snapshots are brittle for highly dynamic content—normalize timestamps.

---

### 23.6.4 Performance Testing

**Beginner Level**: `pytest-benchmark` measures function time.

**Intermediate Level**: Set thresholds in CI with tolerance.

**Expert Level**: Dedicated load testing with Locust/k6 outside pytest.

```python
def test_sum_speed(benchmark):
    data = list(range(10_000))
    benchmark(lambda: sum(data))
```

#### Key Points

- Noisy CI runners—trend over time, not single ms assertions.

---

### 23.6.5 Security Testing

**Beginner Level**: Assert auth required on protected routes (`401/403`).

**Intermediate Level**: Dependency scanning (`pip-audit`, Snyk).

**Expert Level**: Dynamic scanning (OWASP ZAP) in staging; secret scanning in git.

```python
def test_admin_requires_auth(client):
    r = client.post("/admin/users", json={})
    assert r.status_code in (401, 403)
```

#### Key Points

- Security tests complement, not replace, reviews and platform controls.

---

### 23.6.6 Mutation Testing and Contract Testing

**Beginner Level**: **Mutation testing** tools flip conditions (for example `==` → `!=`) to see whether your suite fails; **contract testing** records what a mobile app or partner expects from an API and replays it against the provider.

**Intermediate Level**: Mutation runs are slow—schedule them nightly on payment or auth modules; contract tests (Pact-style) run in CI so teams detect breaking JSON changes before deployment.

**Expert Level**: Low mutation scores despite high line coverage reveal **weak assertions**; consumer-driven contracts version schemas across microservices and public APIs, complementing OpenAPI snapshots.

```text
# mutation (conceptual)
# mutmut run

# contract (conceptual)
# consumer expects GET /user/1 -> {"id": 1}
# provider verifies replayed interactions
```

#### Key Points

- High coverage + low mutation score still means weak tests.
- Contracts are essential when services ship on independent cadences.

---

## Topic Key Points

- **pytest**’s simplicity and fixtures dominate new Python projects; **unittest** remains important for stdlib and Django.
- Mock **at system boundaries**; verify critical interactions.
- Coverage guides effort; **mutation testing** validates test strength.
- Isolate tests, control time/randomness, and containerize dependencies to reduce flakiness.
- CI should run fast checks on every change and heavier suites on schedule.

## Best Practices

- Write deterministic tests; inject time, randomness, and I/O.
- Prefer one clear assertion theme per test (not a hard rule, but aids debugging).
- Use factories and fixtures to keep setup DRY.
- Patch where the symbol is **looked up**, not defined.
- Mark and segregate slow, network, and GPU tests.
- Keep snapshots and golden files under review discipline.
- Track coverage trends and critical path coverage over blanket percentages.

## Common Mistakes to Avoid

- Mocking so much that tests only prove mocks work.
- Patching the wrong import path.
- Sharing mutable global state between tests.
- Using real production endpoints or secrets in tests.
- Ignoring flaky tests instead of quarantining and fixing.
- Overly large integration tests without any fast unit safety net.
- `assert False` or empty `except` hiding failures.
- Async tests without proper plugin/marks running synchronously incorrectly.
- Assuming 100% coverage means correctness.
- Using `time.sleep` for synchronization instead of condition polling or better design.

---

*End of Topic 23 — Testing.*
