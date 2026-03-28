# Functional Programming in Python

Python supports **functional programming** alongside OOP and procedural styles. This guide covers pure functions, immutability, higher-order functions, `map`/`filter`/`reduce`, lambdas, composition, closures, partial application, and the main libraries—using examples from **API response shaping**, **log parsing**, **file pipelines**, and **web scraping** contexts.

## 📑 Table of Contents

- [15.1 Core Concepts](#151-core-concepts)
  - [Pure Functions](#pure-functions)
  - [Immutability](#immutability)
  - [First-Class Functions](#first-class-functions)
  - [Higher-Order Functions](#higher-order-functions)
  - [Side Effects](#side-effects)
  - [Referential Transparency](#referential-transparency)
- [15.2 map, filter, reduce](#152-map-filter-reduce)
  - [map()](#map)
  - [filter()](#filter)
  - [functools.reduce()](#functoolsreduce)
  - [Chaining map, filter, reduce](#chaining-map-filter-reduce)
  - [Performance Considerations](#performance-considerations)
- [15.3 Lambda Expressions](#153-lambda-expressions)
  - [Lambda Syntax](#lambda-syntax)
  - [Lambda with map, filter, sorted](#lambda-with-map-filter-sorted)
  - [Limitations of Lambda](#limitations-of-lambda)
- [15.4 Function Composition](#154-function-composition)
  - [Composing Functions](#composing-functions)
  - [Pipe Pattern](#pipe-pattern)
  - [functools for Composition](#functools-for-composition)
  - [Composition Chains](#composition-chains)
  - [Partial Application in Pipelines](#partial-application-in-pipelines)
- [15.5 Closures and Partial Application](#155-closures-and-partial-application)
  - [Closures](#closures)
  - [Partial Application](#partial-application)
  - [functools.partial()](#functoolspartial)
  - [Currying](#currying)
  - [Applications](#applications)
- [15.6 Functional Libraries](#156-functional-libraries)
  - [functools](#functools)
  - [itertools](#itertools)
  - [operator](#operator)
  - [cytoolz](#cytoolz)
  - [Other Functional Libraries](#other-functional-libraries)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 15.1 Core Concepts

### Pure Functions

**Beginner Level**: A **pure function** always returns the same output for the same input and does not change anything outside itself (no printing files, no global variables). Think of a calculator: `add(2, 3)` is always `5`.

```python
# Beginner: pure vs impure
def pure_square(x: int) -> int:
    return x * x

total = 0  # shared state

def impure_add_to_total(x: int) -> int:
    global total
    total += x
    return total
```

**Intermediate Level**: Purity makes code **easier to test and parallelize**. In an API pipeline, mapping JSON to DTOs with pure functions means you can replay the same payload and get identical results—critical for debugging production issues.

```python
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class UserDTO:
    id: int
    email: str


def parse_user(raw: dict[str, Any]) -> UserDTO | None:
    """Pure: no I/O, deterministic."""
    try:
        return UserDTO(id=int(raw["id"]), email=str(raw["email"]).strip().lower())
    except (KeyError, ValueError, TypeError):
        return None


api_rows = [
    {"id": "1", "email": "  Ana@Example.COM "},
    {"id": "bad", "email": "x"},
]
users = [u for u in (parse_user(r) for r in api_rows) if u is not None]
```

**Expert Level**: In production, push **I/O to the edges** (read once, write once) and keep transformation **pure in the middle**. Combine with immutable data (`frozen` dataclasses, tuples) so caches like `functools.lru_cache` stay correct. Document which layer performs side effects (HTTP, DB, logging).

```python
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Callable, Iterable, TypeVar

T = TypeVar("T")
R = TypeVar("R")


def read_jsonl(path: Path) -> list[dict]:
    """Impure boundary: file I/O."""
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def transform_records(rows: Iterable[dict], f: Callable[[dict], dict]) -> tuple[dict, ...]:
    """Pure core: tuple output is immutable snapshot."""
    return tuple(f(dict(r)) for r in rows)


def stable_id(row: dict) -> str:
    payload = json.dumps(row, sort_keys=True).encode()
    return hashlib.sha256(payload).hexdigest()[:16]


def enrich(row: dict) -> dict:
    return {**row, "_id": stable_id(row)}


def write_jsonl(path: Path, rows: Iterable[dict]) -> None:
    """Impure boundary."""
    path.write_text("\n".join(json.dumps(r) for r in rows) + "\n")
```

**Key Points**

- Same inputs → same outputs; no hidden reads/writes.
- Easier unit tests; safe to memoize when arguments are hashable.
- Isolate I/O; keep business rules pure.

---

### Immutability

**Beginner Level**: **Immutable** values cannot be changed after creation. In Python, strings and tuples are immutable; lists and dicts are mutable. “Treating data as immutable” often means **copy-and-update** instead of mutating in place.

```python
# Beginner: avoid mutating shared list in a loop
bad = []
for x in [1, 2, 3]:
    bad.append(x * 2)  # mutates bad

# Functional style: new tuple
good = tuple(x * 2 for x in (1, 2, 3))
```

**Intermediate Level**: When parsing logs, building new dicts per line avoids subtle bugs if the same dict object is reused. Use `tuple`/`frozenset` as dict keys or set members when you need hashable aggregates.

```python
from typing import TypedDict


class LogEvent(TypedDict):
    ts: str
    level: str
    msg: str


def normalize_event(raw: dict) -> LogEvent:
    return {
        "ts": str(raw.get("ts", "")).strip(),
        "level": str(raw.get("level", "INFO")).upper(),
        "msg": str(raw.get("msg", "")).strip(),
    }
```

**Expert Level**: Prefer **`frozen=True` dataclasses** or **`NamedTuple`** for value objects in pipelines. For large structures, `types.MappingProxyType` exposes read-only dict views; persistent data structures appear in libraries like `pyrsistent` for advanced FP.

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class PageFetch:
    url: str
    status: int
    bytes_len: int


def merge_stats(a: PageFetch, b: PageFetch) -> PageFetch:
    if a.url != b.url:
        raise ValueError("url mismatch")
    return PageFetch(url=a.url, status=b.status, bytes_len=a.bytes_len + b.bytes_len)
```

**Key Points**

- Immutability reduces aliasing bugs in concurrent or async code.
- New objects have a cost; profile hot paths.
- Combine with pure functions for predictable pipelines.

---

### First-Class Functions

**Beginner Level**: In Python, **functions are values**: you can assign them to variables, put them in lists, and pass them to other functions.

```python
def greet(name: str) -> str:
    return f"Hello, {name}"


f = greet
handlers = [greet, str.upper]
print(handlers[0]("World"))
```

**Intermediate Level**: First-class functions power **plug-in strategies**: e.g., choose a normalizer for scraped HTML vs. JSON-LD without `if/elif` chains everywhere.

```python
from html.parser import HTMLParser
from typing import Callable


def extract_text_simple(html: str) -> str:
    class P(HTMLParser):
        def __init__(self) -> None:
            super().__init__()
            self.parts: list[str] = []

        def handle_data(self, data: str) -> None:
            self.parts.append(data)

    p = P()
    p.feed(html)
    return " ".join(p.parts)


def clean_whitespace(s: str) -> str:
    return " ".join(s.split())


Pipeline = Callable[[str], str]

pipe: Pipeline = lambda html: clean_whitespace(extract_text_simple(html))
```

**Expert Level**: Registries of callables (validators, serializers) are common in frameworks. Type with `Protocol` or `Callable[..., T]`; use `typing.overload` for precise signatures at API boundaries.

```python
from pathlib import Path
from typing import Callable, Protocol


class RowValidator(Protocol):
    def __call__(self, row: dict) -> bool: ...


def load_and_validate(path: str, validators: tuple[RowValidator, ...]) -> list[dict]:
    import json

    rows = json.loads(Path(path).read_text())
    out: list[dict] = []
    for r in rows:
        if all(v(r) for v in validators):
            out.append(r)
    return out
```

**Key Points**

- Functions as data enable strategy and callback patterns.
- Annotate with `Callable` or `Protocol` for clarity.
- Keep registries small and documented.

---

### Higher-Order Functions

**Beginner Level**: A **higher-order function** takes functions as arguments or returns functions. `map` and `sorted(..., key=...)` are built-in examples.

```python
nums = [1, 2, 3]
squared = list(map(lambda n: n * n, nums))
```

**Intermediate Level**: In data pipelines, HOFs express **policy**: `retry(fetch, predicate=is_transient_error)` or `batch_process(items, mapper=normalize)`.

```python
from typing import Callable, TypeVar

T = TypeVar("T")
U = TypeVar("U")


def map_chunked(items: list[T], size: int, fn: Callable[[T], U]) -> list[U]:
    out: list[U] = []
    for i in range(0, len(items), size):
        out.extend(fn(x) for x in items[i : i + size])
    return out
```

**Expert Level**: Decorators are HOFs returning wrappers. Combine with generics and structural typing for reusable middleware (auth, metrics) around HTTP client callables.

```python
from collections.abc import Callable
from typing import ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")


def logged(name: str) -> Callable[[Callable[P, R]], Callable[P, R]]:
    def deco(fn: Callable[P, R]) -> Callable[P, R]:
        def inner(*args: P.args, **kwargs: P.kwargs) -> R:
            print(f"[{name}] start")
            try:
                return fn(*args, **kwargs)
            finally:
                print(f"[{name}] end")

        return inner

    return deco
```

**Key Points**

- HOFs factor out control flow (mapping, filtering, retry).
- Prefer named functions over lambdas when logic grows.
- ParamSpec preserves type information for decorators.

---

### Side Effects

**Beginner Level**: A **side effect** is anything besides returning a value: printing, writing files, mutating globals, network calls. Functional style **limits** side effects and makes them explicit.

```python
def impure_log_and_double(x: int) -> int:
    print(f"doubling {x}")  # side effect
    return x * 2


def pure_double(x: int) -> int:
    return x * 2
```

**Intermediate Level**: For **web scraping**, separate fetching (I/O) from parsing (pure). Test parsers on saved HTML fixtures without hitting the network.

```python
from urllib.request import urlopen


def fetch(url: str) -> str:
    with urlopen(url, timeout=10) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_prices(html: str) -> list[float]:
    import re

    return [float(m.group(1)) for m in re.finditer(r'data-price="([0-9.]+)"', html)]
```

**Expert Level**: Use **dependency injection** for time, randomness, and I/O: pass `clock=time.time` or `http_get=requests.get` so pure tests swap fakes. In async services, isolate effects in `async` boundaries and keep reducers pure.

```python
from typing import Callable


def process_file(
    path: str,
    reader: Callable[[str], str],
    writer: Callable[[str, str], None],
    transform: Callable[[str], str],
) -> None:
    content = reader(path)
    writer(path + ".out", transform(content))
```

**Key Points**

- Push I/O to outer layers; document effectful functions.
- Pure cores are trivially testable with examples.
- DI improves testability without heavy frameworks.

---

### Referential Transparency

**Beginner Level**: An expression is **referentially transparent** if you can replace it with its value without changing program behavior. Pure functions enable this.

```python
x = 2 + 3  # can replace with 5 everywhere
```

**Intermediate Level**: If `normalize_email(user)` is pure, caching or parallel mapping does not change semantics—important when **deduplicating API users** before insert.

```python
def normalize_email(s: str) -> str:
    return s.strip().lower()


users = ["A@X.com", " a@x.com ", "b@y.com"]
unique = list({normalize_email(u) for u in users})
```

**Expert Level**: Breaking transparency: **mutable defaults**, **global caches without keys**, **reading time**. In production, wrap `now()` at boundaries; inside pure logic pass timestamps.

```python
from datetime import datetime, timezone


def is_fresh_logged(ts_iso: str, now: datetime, max_age_sec: int) -> bool:
    ts = datetime.fromisoformat(ts_iso.replace("Z", "+00:00"))
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return (now - ts).total_seconds() <= max_age_sec
```

**Key Points**

- Transparency ↔ safe substitution and reasoning.
- Hidden time and randomness break transparency.
- Pass dependencies explicitly for testability.

---

## 15.2 map, filter, reduce

### map()

**Beginner Level**: `map(fn, iterable)` applies `fn` to each item. In Python 3 it returns an iterator—use `list()` to materialize.

```python
names = [" ada ", "bob"]
cleaned = list(map(str.strip, map(str.title, names)))
```

**Intermediate Level**: Use `map` for **vectorized-ish** transforms on API fields; often a generator expression reads clearer—choose consistency with your team.

```python
raw_prices = ["12.5", "10", "bad", "3"]
prices: list[float] = []
for p in map(float, filter(lambda x: x.replace(".", "", 1).isdigit(), raw_prices)):
    prices.append(p)
```

**Expert Level**: For large files, `map` over a line iterator avoids loading all lines; pair with chunked processing for memory bounds.

```python
from pathlib import Path
from typing import Iterable


def line_lengths(path: Path) -> Iterable[int]:
    with path.open() as f:
        yield from map(len, f)
```

**Key Points**

- Lazy iterator; one pass, low memory if not collected.
- Prefer comprehensions when readability wins.
- Combine with `itertools` for complex iteration.

---

### filter()

**Beginner Level**: `filter(pred, iterable)` keeps items where `pred(item)` is truthy.

```python
nums = range(10)
evens = list(filter(lambda n: n % 2 == 0, nums))
```

**Intermediate Level**: **Log parsing**: drop noise lines before aggregation.

```python
lines = ['INFO ok', 'DEBUG noisy', 'ERROR fail', 'INFO done']


def is_significant(line: str) -> bool:
    return line.startswith(("ERROR", "WARN"))


important = list(filter(is_significant, lines))
```

**Expert Level**: `filter(None, iterable)` removes falsy values—handy after `map` that may produce `None`, but can hide bugs; prefer explicit predicates in strict code.

```python
parsed = [None, {"a": 1}, None, {"b": 2}]
compact = [x for x in parsed if x is not None]
```

**Key Points**

- `filter` is lazy like `map`.
- Explicit list comps often read better than `filter`+`lambda`.
- `None` as predicate filters falsy values—use carefully.

---

### functools.reduce

**Beginner Level**: `reduce(function, iterable[, initial])` cumulatively combines items: `reduce(add, [1,2,3]) → 6`.

```python
from functools import reduce
import operator

product = reduce(operator.mul, [2, 3, 4], 1)
```

**Intermediate Level**: Fold log lines into counts **without** global mutation.

```python
from collections import Counter
from functools import reduce


def count_levels(acc: Counter, line: str) -> Counter:
    level = line.split()[0] if line else "?"
    acc[level] += 1
    return acc


lines = ["INFO a", "ERROR b", "INFO c"]
totals = reduce(count_levels, lines, Counter())
```

**Expert Level**: For production, complex folds are often clearer as **`for` loops** or **`groupby`**; use `reduce` when the monoid structure is obvious (merge configs, build trees).

```python
from functools import reduce
from typing import Any


def deep_merge(a: dict[str, Any], b: dict[str, Any]) -> dict[str, Any]:
    out = dict(a)
    for k, v in b.items():
        if k in out and isinstance(out[k], dict) and isinstance(v, dict):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out


configs = [{"a": 1}, {"b": {"c": 2}}, {"b": {"d": 3}}]
merged = reduce(deep_merge, configs, {})
```

**Key Points**

- `reduce` shines for associative combines; otherwise loop.
- Always provide `initial` when empty input is possible.
- `itertools.accumulate` for running totals without final collapse.

---

### Chaining map, filter, reduce

**Beginner Level**: Chain by passing iterators: `map` output feeds `filter`, etc.

```python
nums = range(20)
result = list(filter(lambda n: n > 10, map(lambda n: n * n, nums)))
```

**Intermediate Level**: **ETL snippet**: normalize → validate → aggregate.

```python
from decimal import Decimal, InvalidOperation


def to_money(s: str) -> Decimal | None:
    try:
        return Decimal(s.strip())
    except InvalidOperation:
        return None


raw = [" 10.5 ", "x", "2", "3.25"]
amounts = (
    m
    for m in map(to_money, raw)
    if m is not None and m > 0
)
total = sum(amounts, Decimal("0"))
```

**Expert Level**: For readability, name stages or use a small **pipe** helper; profile before micro-optimizing—generator chains are usually memory-efficient.

```python
def pipe(value, *funcs):
    v = value
    for f in funcs:
        v = f(v)
    return v


data = [1, 2, 3]
out = pipe(data, lambda xs: map(lambda x: x * 2, xs), list, lambda xs: [x for x in xs if x > 2])
```

**Key Points**

- Generators compose with low memory.
- Name intermediate steps when chains grow.
- Prefer clarity over clever one-liners in teams.

---

### Performance Considerations

**Beginner Level**: `map`/`filter` in Python are **C-speed loops** for simple callables, but **generator expressions** are often equally fast and clearer.

```python
xs = range(1_000_000)
sum(x * x for x in xs if x % 2 == 0)
```

**Intermediate Level**: Heavy Python-level functions dominate cost—**vectorize** with NumPy/Pandas for numeric ETL, or batch I/O.

**Expert Level**: Use **`operator.methodcaller`** / **`itemgetter`** to reduce attribute access overhead in hot inner loops; `cytoolz` / `more_itertools` for optimized recipes.

```python
from operator import itemgetter

rows = [{"id": i, "v": i * 2} for i in range(100_000)]
ids = list(map(itemgetter("id"), rows))
```

**Key Points**

- Measure; don’t assume `map` beats comprehensions.
- Push work to C extensions when data is huge.
- Avoid materializing giant intermediate lists.

---

## 15.3 Lambda Expressions

### Lambda Syntax

**Beginner Level**: `lambda args: expression` defines an anonymous one-expression function.

```python
add = lambda a, b: a + b
```

**Intermediate Level**: Lambdas fit **small** `key=` and `sort` uses; use `def` when you need statements or docstrings.

```python
rows = [{"name": "Z"}, {"name": "A"}]
sorted(rows, key=lambda r: r["name"])
```

**Expert Level**: Lambdas **cannot** carry type comments cleanly in all Python versions; prefer `def` for public APIs and static typing.

```python
from typing import Callable

KeyFn = Callable[[dict], str]
key_name: KeyFn = lambda r: str(r["name"])
```

**Key Points**

- Single expression only; no assignments inside (without tricks).
- PEP 8: avoid assigning lambdas to names—use `def`.
- Good for `sorted`, `min`, `max`, `map` with tiny logic.

---

### Lambda with map, filter, sorted

**Beginner Level**:

```python
nums = [3, 1, 4]
sorted(nums, key=lambda x: -x)
list(map(lambda x: x + 1, nums))
list(filter(lambda x: x > 2, nums))
```

**Intermediate Level**: **API sorting** by nested field:

```python
events = [
    {"ts": "2024-01-02", "prio": 1},
    {"ts": "2024-01-01", "prio": 10},
]
events.sort(key=lambda e: (e["prio"], e["ts"]))
```

**Expert Level**: Combine with **`operator`** for speed and readability:

```python
from operator import itemgetter

events.sort(key=itemgetter("prio", "ts"))
```

**Key Points**

- Prefer `itemgetter`/`attrgetter` when keys are simple extractions.
- Lambdas capture variables—watch late binding in loops (use default args).

```python
# Expert: late-binding pitfall
funcs_wrong = [lambda: i for i in range(3)]  # all return 2
funcs_ok = [lambda i=i: i for i in range(3)]
```

---

### Limitations of Lambda

**Beginner Level**: No statements (`return`, `if` blocks with assignments), no annotations in older Python, awkward for debugging.

**Intermediate Level**: **Tracebacks** show `<lambda>`—harder in logs; use `def` with name for production filters.

**Expert Level**: Linters flag complex lambdas; **stack depth** and pickling (multiprocessing) can fail on lambdas in some contexts—use top-level `def` or `functools.partial`.

```python
from functools import partial


def over(threshold: float, x: float) -> bool:
    return x > threshold


high = partial(over, 100.0)
```

**Key Points**

- Keep lambdas trivial.
- Name functions for observability.
- Use `partial` instead of `lambda` for pre-bound args.

---

## 15.4 Function Composition

### Composing Functions

**Beginner Level**: Compose `f` and `g` as `lambda x: f(g(x))`.

```python
def f(x: str) -> str:
    return x.upper()


def g(x: str) -> str:
    return x.strip()


compose_fg = lambda x: f(g(x))
```

**Intermediate Level**: Build **scraping** pipeline: `parse_json ∘ decode_bytes ∘ fetch`.

```python
from typing import Callable, TypeVar

T = TypeVar("T")
U = TypeVar("U")
V = TypeVar("V")


def compose(
    f: Callable[[U], V],
    g: Callable[[T], U],
) -> Callable[[T], V]:
    return lambda x: f(g(x))


decode = lambda b: b.decode("utf-8")
loads = __import__("json").loads
parse_response = compose(loads, decode)
```

**Expert Level**: Variadic composition with `reduce` over a list of functions (right-to-left or left-to-right—**document order**).

```python
from functools import reduce
from typing import Callable, TypeVar

T = TypeVar("T")


def compose_many(*funcs: Callable[[T], T]) -> Callable[[T], T]:
    def step(acc: Callable[[T], T], f: Callable[[T], T]) -> Callable[[T], T]:
        return lambda x: f(acc(x))

    return reduce(step, funcs, lambda x: x)
```

**Key Points**

- Agree on `compose(f,g)` = `f(g(x))` vs `g(f(x))` convention.
- TypeVar helps mypy follow data flow.
- Small named steps beat deep compose stacks in teams.

---

### Pipe Pattern

**Beginner Level**: Pipe = apply functions left-to-right (like Unix pipes).

```python
def pipe(x, *fs):
    for f in fs:
        x = f(x)
    return x


pipe("  hello  ", str.strip, str.title)
```

**Intermediate Level**: **Log line** pipeline:

```python
def strip(s: str) -> str:
    return s.strip()


def drop_empty(s: str) -> str | None:
    return s if s else None


def tag_level(s: str) -> dict:
    level, _, rest = s.partition(" ")
    return {"level": level, "msg": rest}


line = "  ERROR disk full  "
ev = pipe(line, strip, tag_level)
```

**Expert Level**: Libraries like `toolz.pipe` generalize; in-house, keep **typed** stages and return `Result` types for failures.

**Key Points**

- Pipe improves readability vs nested calls.
- Handle `None` early or use `Maybe` patterns.
- Log at stage boundaries in debug mode.

---

### functools for Composition

**Beginner Level**: `partial` fixes arguments; `reduce` folds.

**Intermediate Level**: `cache`/`lru_cache` memoize pure expensive stages in **data pipelines**.

```python
from functools import lru_cache


@lru_cache(maxsize=10_000)
def geocode_token(token: str) -> tuple[float, float]:
    # pretend expensive
    return (0.0, 0.0)
```

**Expert Level**: `singledispatch` for functional-style overloads on first argument type—useful in serializers.

```python
from functools import singledispatch


@singledispatch
def serialize(obj: object) -> str:
    raise TypeError(type(obj))


@serialize.register
def _(obj: int) -> str:
    return str(obj)


@serialize.register
def _(obj: float) -> str:
    return f"{obj:.4f}"
```

**Key Points**

- `wraps` preserves metadata for decorated pipelines.
- `total_ordering` reduces boilerplate for ordering types.
- `cached_property` for lazy immutable-ish attrs on classes.

---

### Composition Chains

**Beginner Level**: Chain generators: `(f(x) for x in g(y))`.

**Intermediate Level**: **Flat-file** processing:

```python
from pathlib import Path


def lines(p: Path):
    yield from p.open()


def strip_lines(it):
    yield from (ln.strip() for ln in it)


def split_fields(it):
    yield from (ln.split(",") for ln in it if ln)


path = Path("data.csv")
rows = split_fields(strip_lines(lines(path)))
```

**Expert Level**: Use `itertools` chain/from_iterable for nested iterators; bound memory in long-running **producer-consumer** services.

**Key Points**

- Generator chains are lazy and composable.
- Add `contextlib.closing` when wrapping resources.
- Unit-test each stage with small fixtures.

---

### Partial Application in Pipelines

**Beginner Level**: Fix early arguments so later APIs match `map`/`thread pool` signatures.

```python
from functools import partial


def fetch(url: str, timeout: int) -> str:
    return f"body:{url}:{timeout}"


fetch_5s = partial(fetch, timeout=5)
urls = ["http://a", "http://b"]
list(map(fetch_5s, urls))
```

**Intermediate Level**: Configure **validators** for batch import:

```python
from functools import partial


def in_range(low: float, high: float, x: float) -> bool:
    return low <= x <= high


valid_pct = partial(in_range, 0.0, 100.0)
scores = [10, 101, 50]
list(filter(valid_pct, scores))
```

**Expert Level**: Combine `partial` with `multiprocessing.pool.Pool.map`—top-level function required on some platforms; `partial` of top-level works.

**Key Points**

- `partial` is pickling-friendlier than lambdas for multiprocessing.
- Keyword partials improve readability.
- Don’t partial mutable defaults incorrectly.

---

## 15.5 Closures and Partial Application

### Closures

**Beginner Level**: A **closure** remembers variables from the enclosing scope when the inner function runs later.

```python
def make_adder(n: int):
    def adder(x: int) -> int:
        return x + n

    return adder

plus3 = make_adder(3)
plus3(10)  # 13
```

**Intermediate Level**: **Rate limiting** scraper: closure holds last call time.

```python
import time
from typing import Callable


def rate_limited(min_interval_sec: float) -> Callable[[Callable[[], None]], Callable[[], None]]:
    last = {"t": 0.0}

    def deco(fn: Callable[[], None]) -> Callable[[], None]:
        def wrapped() -> None:
            now = time.monotonic()
            wait = last["t"] + min_interval_sec - now
            if wait > 0:
                time.sleep(wait)
            fn()
            last["t"] = time.monotonic()

        return wrapped

    return deco
```

**Expert Level**: Beware **late binding** in loops creating closures—bind with default args. For thread-safety, use locks instead of naive mutable cell dicts.

```python
callbacks = [lambda i=i: print(i) for i in range(3)]
```

**Key Points**

- Closures capture by reference—mutable objects are shared.
- Default-arg trick fixes loop capture.
- Document lifetimes of captured resources.

---

### Partial Application

**Beginner Level**: Fix some arguments now; call with the rest later—`functools.partial` or closures.

**Intermediate Level**: **Auth header** factory for API client:

```python
from functools import partial


def header(token: str, content_type: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Content-Type": content_type}


json_api = partial(header, content_type="application/json")
h = json_api("SECRET")
```

**Expert Level**: Currying manually vs `partial`—Python is not Haskell; use `partial` for ergonomics.

**Key Points**

- Partial ≠ curry; partial fixes leftmost args (unless kw).
- Great for callbacks matching uniform signatures.
- Combine with closures for configurable decorators.

---

### functools.partial

**Beginner Level**:

```python
from functools import partial

int_base2 = partial(int, base=2)
int_base2("101")  # 5
```

**Intermediate Level**: **SQLAlchemy-style** (conceptual) binding:

```python
from functools import partial


def query(table: str, limit: int, where: str) -> str:
    return f"SELECT * FROM {table} WHERE {where} LIMIT {limit}"


users_top = partial(query, "users", 10)
users_top("active=1")
```

**Expert Level**: `partialmethod` for class methods; inspect with `.func`, `.args`, `.keywords`.

**Key Points**

- Read signature with `inspect.signature(partial(...))` (may wrap).
- `partial` objects are callable and often picklable if underlying func is.
- Watch interaction with `*args` ordering.

---

### Currying

**Beginner Level**: **Currying** transforms `f(a,b,c)` into `f(a)(b)(c)`—uncommon in idiomatic Python but teachable.

```python
from functools import partial


def curry2(f):
    return lambda a: lambda b: f(a, b)


add = curry2(lambda a, b: a + b)
add(2)(3)
```

**Intermediate Level**: Use currying style sparingly; **`partial`** usually wins.

**Expert Level**: Libraries (`toolz.curry`) auto-curry for DSLs; beware debuggability.

**Key Points**

- Python variadics don’t map 1:1 to Haskell curry.
- Prefer `partial` and explicit functions in production code.
- Currying can help build fluent config builders.

---

### Applications

**Beginner Level**: Closures + partial = configurable mini-functions for `map`.

**Intermediate Level**: **Validation pipeline** for JSON API:

```python
from typing import Callable

Validator = Callable[[dict], list[str]]


def require_keys(*keys: str) -> Validator:
    def v(row: dict) -> list[str]:
        missing = [k for k in keys if k not in row]
        return [f"missing:{k}" for k in missing]

    return v


def combine(*vs: Validator) -> Validator:
    def v(row: dict) -> list[str]:
        errs: list[str] = []
        for fn in vs:
            errs.extend(fn(row))
        return errs

    return v


validate_user = combine(require_keys("id", "email"))
```

**Expert Level**: Plug validators into **framework middleware**; keep validators pure and return structured errors.

**Key Points**

- Small validators compose.
- Return errors, don’t raise, for composability (optional pattern).
- Log at HTTP layer, not inside pure validators.

---

## 15.6 Functional Libraries

### functools

**Beginner Level**: `reduce`, `partial`, `lru_cache`, `wraps`—see prior sections.

**Intermediate Level**: **`cache`** (3.9+) for unbounded memo of pure functions with hashable args—use for **URL canonicalization** in crawlers with care for memory.

```python
from functools import cache


@cache
def canonical_url(u: str) -> str:
    from urllib.parse import urlparse, urlunparse

    p = urlparse(u)
    return urlunparse((p.scheme, p.netloc.lower(), p.path, "", "", ""))
```

**Expert Level**: `singledispatchmethod` in classes; `total_ordering` for custom ordering in sorted merges.

**Key Points**

- Choose `lru_cache` with `maxsize` for long-running processes.
- Memoize only pure functions.
- `update_wrapper` for advanced decorator authoring.

---

### itertools

**Beginner Level**: `count`, `cycle`, `repeat`, `chain`, `islice`—lazy infinite/finite iterators.

```python
from itertools import count, islice

first_10_squares = list(islice((n * n for n in count()), 10))
```

**Intermediate Level**: **Paginated API** fetch: `iter` with sentinel or `while` + `islice` batches.

```python
from itertools import islice


def batched(it, n: int):
    it = iter(it)
    while chunk := list(islice(it, n)):
        yield chunk
```

**Expert Level**: `groupby` requires sorted input; `product`, `permutations`, `combinations` for test data generation; `tee` duplicates iterators at memory cost.

```python
from itertools import groupby

rows = [("east", 1), ("east", 2), ("west", 3)]
for region, grp in groupby(rows, key=lambda r: r[0]):
    print(region, list(grp))
```

**Key Points**

- Prefer stdlib `itertools` over hand-rolled loops.
- `groupby` is not SQL GROUP BY—sort first.
- `tee` can be expensive; often re-iterate source instead.

---

### operator

**Beginner Level**: `itemgetter`, `attrgetter`, `methodcaller`, arithmetic funcs for `reduce`.

```python
from operator import itemgetter, mul
from functools import reduce

rows = [{"id": 1, "v": 2}, {"id": 2, "v": 3}]
list(map(itemgetter("id"), rows))
reduce(mul, [2, 3, 4], 1)
```

**Intermediate Level**: Sort by multiple attrs:

```python
from operator import attrgetter


class E:
    def __init__(self, a, b):
        self.a = a
        self.b = b


sorted([E(2, 1), E(1, 9)], key=attrgetter("a", "b"))
```

**Expert Level**: Faster inner loops in **data pipelines** vs lambdas; combines cleanly with `map`.

**Key Points**

- `itemgetter` supports multiple keys: `itemgetter("a", "b")`.
- `methodcaller("strip")` for string lists.
- Use with `functools.reduce` for clarity.

---

### cytoolz

**Beginner Level**: **Cython**-accelerated cousin of `toolz`—`pipe`, `curry`, `compose`, persistent data structures patterns.

**Intermediate Level**: Install when you need functional utilities at scale (`pip install cytoolz`). Example conceptual API (check installed version docs):

```python
# pip install cytoolz
from cytoolz import pipe, curried

# curried.map is map that can be partially applied
# (exact imports depend on version; verify locally)
```

**Expert Level**: Use for **high-throughput** stream processing; fall back to stdlib if dependency weight matters.

**Key Points**

- Third-party: pin versions in production.
- Profile before adopting for marginal gains.
- Align team on functional style readability.

---

### Other Functional Libraries

**Beginner Level**: **`more_itertools`** extends itertools recipes; **`fn.py` / `returns`** (ecosystem) for Result/Either patterns.

**Intermediate Level**: **`pandas`** applies functional ideas column-wise; still mutable DataFrames—use `.pipe` for method chains.

```python
import pandas as pd

df = pd.DataFrame({"x": [1, 2, 3]})
out = df.assign(y=lambda d: d["x"] * 2).pipe(lambda d: d[d["y"] > 2])
```

**Expert Level**: **Apache Beam / Faust** for distributed streaming—functional transforms over PCollections; different scale than stdlib FP.

**Key Points**

- Pick libraries by problem domain (data, async, distributed).
- Don’t over-abstract; Python favors pragmatic mixing of styles.
- Document style guide for your service repo.

---

## Best Practices

1. **Isolate side effects** at boundaries; keep transforms pure and testable.
2. **Prefer named functions** over complex lambdas; use `operator` helpers for simple extractions.
3. **Type-annotate** pipelines (`Protocol`, `Callable`, `TypeVar`) for safer refactors.
4. **Measure performance** before choosing `map` vs comprehension vs NumPy.
5. **Memoize** only pure functions with bounded or safe cache keys.
6. **Document composition order** (`compose` vs `pipe`) to avoid team confusion.
7. **Use immutable value objects** (`frozen` dataclasses) when sharing across threads/tasks.
8. **Default-arg bind** loop variables when creating closures.
9. **Keep `reduce` simple** or replace with explicit loops for maintainability.
10. **Pin third-party** FP libraries and review security updates.

---

## Common Mistakes to Avoid

1. **Mutating** shared lists/dicts inside `map` callbacks across threads.
2. **Assuming** `map`/`filter` return lists (Python 3 iterators).
3. **Using mutable default arguments** in factory functions—use `None` + new object inside.
4. **Late-binding closures** in loops without `lambda x=x` pattern.
5. **Memoizing** functions that depend on time, randomness, or external I/O.
6. **Overusing `reduce`** where a simple loop or `sum`/`any`/`all` is clearer.
7. **Chaining** too many anonymous lambdas—debugging and stack traces suffer.
8. **Ignoring empty iterables** in `reduce` without an initializer.
9. **Treating `groupby` like SQL** without sorting by the key first.
10. **Pulling heavy FP libraries** for trivial scripts—dependency and onboarding cost.

---

*End of Topic 15 — Functional Programming.*
