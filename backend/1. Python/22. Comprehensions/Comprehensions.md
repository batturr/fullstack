# Python Comprehensions (Topic 22)

Comprehensions are concise syntax for building lists, sets, and dictionaries by describing *what* you want rather than *how* to loop. They are idiomatic in data pipelines, API response shaping, and ML feature prep. This guide covers list, dict, and set comprehensions, generator expressions, and advanced patterns at three depth levels.

## 📑 Table of Contents

- [22.1 List Comprehensions](#221-list-comprehensions)
- [22.2 Dictionary Comprehensions](#222-dictionary-comprehensions)
- [22.3 Set Comprehensions](#223-set-comprehensions)
- [22.4 Generator Expressions](#224-generator-expressions)
- [22.5 Advanced Comprehension Patterns](#225-advanced-comprehension-patterns)
- [Topic Key Points](#topic-key-points)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 22.1 List Comprehensions

### 22.1.1 Syntax

**Beginner Level**: `[expression for item in iterable]` reads as “make a list of `expression` for each `item`.”

**Intermediate Level**: Optional `if filter` and nested `for` clauses follow left-to-right scoping rules (outer loops first in nested case).

**Expert Level**: Comprehensions have their own local scope in Python 3; `:=` walrus can leak if used in certain positions—know PEP 572 scoping.

```python
# Beginner: squares
nums = [1, 2, 3]
squares = [n * n for n in nums]

# Intermediate: with filter
evens = [n for n in range(10) if n % 2 == 0]

# Expert: nested binding order
pairs = [(i, j) for i in range(2) for j in range(3)]
print(pairs)  # i outer, j inner
```

#### Key Points

- Square brackets always produce a **list** eagerly.
- Single expression before first `for` is the output element.

---

### 22.1.2 Simple List Comprehensions

**Beginner Level**: Transform each element—uppercasing names, parsing integers.

**Intermediate Level**: Combine with built-ins: `"".join([...])` only if list is needed; otherwise consider generator.

**Expert Level**: Vectorized NumPy/Pandas often replace list comps for numeric columns at scale.

```python
# Beginner: normalize email
emails = [" Ada@X.com ", "bob@y.org"]
clean = [e.strip().lower() for e in emails]

# Intermediate: API JSON field extraction
rows = [{"id": 1, "score": 8.2}, {"id": 2, "score": 9.1}]
scores = [r["score"] for r in rows]

# Expert: still Python list for mixed-type records before DataFrame
records = [{"sku": s, "qty": q} for s, q in [("A", 10), ("B", 3)]]
```

#### Key Points

- Simple comps are the most readable; stop adding logic when a plain `for` is clearer.

---

### 22.1.3 Conditional Filtering (`if`)

**Beginner Level**: `if` at the end keeps only matching items.

**Intermediate Level**: Do not confuse with ternary in expression: `[x if cond else y for ...]` vs `[x for ... if cond]`.

**Expert Level**: Multiple conditions can be combined with `and`; for complex rules, use a helper function.

```python
# Beginner: active users only
users = [{"name": "a", "active": True}, {"name": "b", "active": False}]
active_names = [u["name"] for u in users if u["active"]]

# Intermediate: valid sensor readings
readings = [12.5, -999.0, 8.0]  # -999 sentinel
valid = [r for r in readings if r > -100]

# Expert: callable predicate
def ok(row):
    return row.get("status") == "paid" and row["amount"] > 0

rows = [{"status": "paid", "amount": 10}, {"status": "due", "amount": 5}]
print([r["amount"] for r in rows if ok(r)])
```

#### Key Points

- Filter `if` comes **after** the `for`, not inside `for` unless nested loops.

---

### 22.1.4 Multiple `for` Clauses

**Beginner Level**: Nested loops flattened into one comprehension: `for a in ... for b in ...`.

**Intermediate Level**: Order matches nested `for` loops top-to-bottom.

**Expert Level**: Cartesian products grow quickly—profile memory; use `itertools.product` for clarity.

```python
# Beginner: all pairs
colors = ["red", "blue"]
sizes = ["S", "M"]
tags = [f"{c}-{s}" for c in colors for s in sizes]

# Intermediate: matrix flatten row-major
matrix = [[1, 2], [3, 4]]
flat = [x for row in matrix for x in row]

# Expert: product size warning
ids = range(1000)
# huge = [(i, j) for i in ids for j in ids]  # avoid materializing
```

#### Key Points

- First `for` is outer loop; second is inner.

---

### 22.1.5 Nested List Comprehensions

**Beginner Level**: Inner comprehension builds each sublist—e.g., transpose-like structures.

**Intermediate Level**: Readable line breaks and naming beat one-line matryoshka dolls.

**Expert Level**: For deep nesting, switch to explicit loops or NumPy.

```python
# Beginner: 3x3 zeros grid
grid = [[0 for _ in range(3)] for _ in range(3)]

# Intermediate: parse CSV lines to ints (all rows)
lines = ["1,2", "3,4"]
matrix = [[int(x) for x in line.split(",")] for line in lines]

# Expert: independent rows — do NOT use [[0]*3]*3 mistake
bad = [[0] * 3] * 3
bad[0][0] = 9
print(bad)  # all rows aliased

good = [[0 for _ in range(3)] for _ in range(3)]
good[0][0] = 9
print(good)
```

#### Key Points

- `[expr] * n` repeats references; list comp creates new inner lists.

---

### 22.1.6 Comprehensions vs Explicit Loops

**Beginner Level**: Comprehensions are shorter for simple transforms.

**Intermediate Level**: Use loops when you need side effects, multiple statements, or `break`/`continue`.

**Expert Level**: Team style guides often cap comprehension complexity (e.g., no more than two `for`, one `if`).

```python
# Beginner: comprehension wins
squares = [n * n for n in range(5)]

# Intermediate: loop for side effects (logging)
import logging

def process(items):
    for item in items:
        logging.info("handling %s", item)
        yield item * 2

# Expert: transaction with rollback — use loop
def transfer_all(accounts):
    for acc in accounts:
        acc.lock()
        try:
            acc.debit()
        except Exception:
            rollback_all(accounts)
            raise
```

#### Key Points

- Comprehensions are expressions; not for I/O or exception-heavy flows per step.

---

### 22.1.7 Performance Characteristics

**Beginner Level**: List comps are often faster than `map`/`lambda` and clearer than `append` in a loop for simple cases.

**Intermediate Level**: Still O(n) memory; generator expressions defer allocation.

**Expert Level**: Profile hot paths; C extensions and vectorized libs beat Python-level comps on huge data.

```python
# Beginner: one pass
nums = range(10_000)
out = [x * 2 for x in nums]

# Intermediate: preallocate rare in Python; bytearray for bytes
data = bytes([b ^ 0xFF for b in b"abc"])

# Expert: micro-benchmark mindset (conceptual)
# python -m timeit '[x*x for x in range(1000)]'
```

#### Key Points

- Prefer generator pipeline for chained stages on large streams.

---

### 22.1.8 Conditional Expressions Inside List Comprehensions

**Beginner Level**: You can write `x if cond else y` *inside* the expression part of a comprehension to normalize values while building a list.

**Intermediate Level**: Useful when cleaning API payloads (`None` → `0`, invalid strings → `"unknown"`) but keep the condition simple so readers can scan the comprehension.

**Expert Level**: Heavy branching belongs in a helper function; the comprehension should call `clean_row(row)` rather than embedding five nested ternaries.

```python
raw_scores = [10, None, 20, None]
filled = [s if s is not None else 0 for s in raw_scores]
labels = ["pos" if x > 0 else "nonpos" for x in filled]
```

#### Key Points

- Ternary expressions are expressions—no statements inside.
- If readability drops, switch to a loop.

---

## 22.2 Dictionary Comprehensions

### 22.2.1 Syntax

**Beginner Level**: `{key_expr: value_expr for item in iterable}` builds a dict.

**Intermediate Level**: Duplicate keys—last wins silently.

**Expert Level**: Combine with `dict()` constructor and keyword unpacking for merging.

```python
# Beginner: id -> name
users = [("u1", "Ada"), ("u2", "Bob")]
by_id = {uid: name for uid, name in users}

# Intermediate: last wins
items = [("k", 1), ("k", 2)]
print({k: v for k, v in items})

# Expert: inverse with collision awareness (later wins)
forward = {"a": 1, "b": 2}
rev = {v: k for k, v in forward.items()}
```

#### Key Points

- Keys must be hashable.

---

### 22.2.2 Simple Dictionary Comprehensions

**Beginner Level**: Counting, indexing, quick lookup tables from lists.

**Intermediate Level**: Derive from two parallel lists with `zip`.

**Expert Level**: Precompute config maps for feature flags in API gateways.

```python
# Beginner: length map
words = ["python", "go", "rust"]
lengths = {w: len(w) for w in words}

# Intermediate: zip keys to values
keys = ["host", "port"]
vals = ["0.0.0.0", 8080]
cfg = {k: v for k, v in zip(keys, vals)}

# Expert: static route table
routes = {f"/api/v{i}": f"handler_v{i}" for i in range(1, 4)}
```

#### Key Points

- Dict comp is eager—entire dict in memory.

---

### 22.2.3 Conditional Dictionary Comprehensions

**Beginner Level**: Filter items with trailing `if`.

**Intermediate Level**: Ternary in key or value slot for defaults.

**Expert Level**: Keep conditions readable; fall back to loop if `if/else` per key gets baroque.

```python
# Beginner: drop None values
raw = {"a": 1, "b": None, "c": 3}
clean = {k: v for k, v in raw.items() if v is not None}

# Intermediate: default for falsy
scores = {"a": 0, "b": 8}
display = {k: (v if v else "n/a") for k, v in scores.items()}

# Expert: whitelist keys for public JSON
PUBLIC = {"id", "name"}
user = {"id": 1, "name": "Ada", "hash": "secret"}
safe = {k: user[k] for k in user if k in PUBLIC}
```

#### Key Points

- `{k: v for ... if ...}` filters **items**, not keys separately.

---

### 22.2.4 Patterns (Grouping, Inverting, Building Indexes)

**Beginner Level**: Build inverted index: word → list of positions (often needs `defaultdict`, but comp can start dict).

**Intermediate Level**: Compose with `collections.defaultdict(list)` outside comp for grouping.

**Expert Level**: Database query results → nested dict via two-pass or `setdefault`.

```python
# Beginner: frequency by category
rows = [{"cat": "A", "v": 1}, {"cat": "B", "v": 2}, {"cat": "A", "v": 3}]
totals = {}
for r in rows:
    totals[r["cat"]] = totals.get(r["cat"], 0) + r["v"]
# dict comp alone is awkward for accumulation — pattern choice

# Intermediate: unique key map
items = [{"sku": "x", "price": 10}, {"sku": "y", "price": 12}]
by_sku = {it["sku"]: it["price"] for it in items}

# Expert: secondary index
orders = [{"id": 1, "user": "u1"}, {"id": 2, "user": "u2"}, {"id": 3, "user": "u1"}]
from collections import defaultdict

by_user = defaultdict(list)
for o in orders:
    by_user[o["user"]].append(o["id"])
by_user = dict(by_user)
```

#### Key Points

- Comprehensions excel at 1:1 mappings; grouping often needs a loop or `defaultdict`.

---

### 22.2.5 Default Values and `dict.fromkeys` Alternatives

**Beginner Level**: `{k: 0 for k in keys}` gives independent zeros.

**Intermediate Level**: `dict.fromkeys(keys, [])` is wrong—shared list reference.

**Expert Level**: Use comp or `defaultdict` for mutable defaults per key.

```python
# Beginner: counts initialized
keys = ["click", "view"]
counters = {k: 0 for k in keys}

# Intermediate: WRONG shared list
bad = dict.fromkeys(keys, [])
bad["click"].append(1)
print(bad)  # both keys see [1]

# Expert: comprehension for independent lists
good = {k: [] for k in keys}
good["click"].append(1)
print(good)
```

#### Key Points

- **Never** use mutable default as second arg to `fromkeys`.

---

### 22.2.6 Swapping Keys and Values

**Beginner Level**: `{v: k for k, v in d.items()}` when values are unique.

**Intermediate Level**: Detect collisions when values duplicate—validate before invert.

**Expert Level**: Bijection checks in schema migration tools.

```python
# Beginner: port name -> number unique map
name_to_port = {"http": 80, "https": 443}
port_to_name = {p: n for n, p in name_to_port.items()}

# Intermediate: collision guard
forward = {"a": 1, "b": 1}
rev = {}
for k, v in forward.items():
    if v in rev and rev[v] != k:
        raise ValueError("non-invertible")
    rev[v] = k

# Expert: partial invert with list aggregation
fwd = {"a": 1, "b": 1, "c": 2}
from collections import defaultdict

inv = defaultdict(list)
for k, v in fwd.items():
    inv[v].append(k)
inv = {k: v for k, v in inv.items()}
```

#### Key Points

- Inversion requires thinking about duplicate values and unhashable values as keys.

---

### 22.2.7 Dictionary Merging with Comprehensions and Modern Unions

**Beginner Level**: A dict comprehension can start from two parallel lists (`zip(keys, values)`), which is how many tutorials build lookup tables.

**Intermediate Level**: Python 3.9+ `d1 | d2` merges mappings immutably; combine with comprehensions to transform values after the merge for feature-flag dashboards.

**Expert Level**: For huge configs, prefer `ChainMap` or incremental merges in libraries like Pydantic settings—materializing giant dict comps costs memory.

```python
keys = ["region", "tier"]
vals = ["EU", "gold"]
cfg = {k: v for k, v in zip(keys, vals)}
defaults = {"tier": "silver"}
merged = defaults | cfg
```

#### Key Points

- Dict union is shallow—nested dicts still alias if reused.
- Comprehensions over `dict.items()` power many migration scripts.

---

## 22.3 Set Comprehensions

### 22.3.1 Syntax

**Beginner Level**: `{expr for x in iterable}` is a set comp if no colon—dict comp has `key: value`.

**Intermediate Level**: Empty `{}` is dict, not set—use `set()`.

**Expert Level**: Unhashable `expr` raises `TypeError`.

```python
# Beginner: unique lowercased tags
tags = ["Py", "py", "Go"]
unique = {t.lower() for t in tags}

# Intermediate: disambiguate from dict
print(type({}))  # dict
print(type(set()))  # set

# Expert: try unhashable list as element — fails
try:
    s = {tuple([1, 2]), [3, 4]}
except TypeError as e:
    print(e)
```

#### Key Points

- `{1, 2, 3}` literal set; `{x for x in ...}` set comp.

---

### 22.3.2 Simple Set Comprehensions

**Beginner Level**: Unique IDs from API payload.

**Intermediate Level**: Normalize with strip/lower before dedupe.

**Expert Level**: Feed into relational `IN` query parameter sets.

```python
# Beginner
ids = [1, 2, 2, 3]
unique_ids = {i for i in ids}

# Intermediate: dedupe emails
emails = [" A@x.com ", "a@x.com", "b@y.com"]
norm = {e.strip().lower() for e in emails}

# Expert: tenant ids from mixed log lines (simplified)
lines = ["tenant=acme", "tenant=beta", "tenant=acme"]
tenants = {line.split("=")[1] for line in lines}
```

#### Key Points

- Set membership is average O(1).

---

### 22.3.3 Conditional Set Comprehensions

**Beginner Level**: Filter before adding to set—same trailing `if`.

**Intermediate Level**: Combine with type checks for messy CSV.

**Expert Level**: Data quality: collect invalid tokens separately with loop; set comp for valid domain.

```python
# Beginner: positive ints only
raw = [1, -2, 3, 3]
positives = {x for x in raw if x > 0}

# Intermediate: parse floats
strings = ["1.5", "nan", "2", "oops"]
import math

def parse_float(s):
    try:
        v = float(s)
        return v if not math.isnan(v) else None
    except ValueError:
        return None

values = {v for v in (parse_float(s) for s in strings) if v is not None}
```

#### Key Points

- `if` filters elements before insertion attempt.

---

### 22.3.4 Removing Duplicates While Preserving Order

**Beginner Level**: Set comp loses order; for order preservation use `dict.fromkeys` idiom.

**Intermediate Level**: Pandas `drop_duplicates` for columns.

**Expert Level**: Large datasets: sort + unique pass in NumPy.

```python
# Beginner: unordered unique
items = ["b", "a", "b"]
print(list({x for x in items}))  # order not guaranteed

# Intermediate: ordered unique (Py 3.7+ dict preserves insertion)
ordered = list(dict.fromkeys(items))

# Expert: stable unique by key function
rows = [{"id": 2}, {"id": 1}, {"id": 2}]
seen = set()
out = []
for r in rows:
    if r["id"] not in seen:
        seen.add(r["id"])
        out.append(r)
```

#### Key Points

- **Set comp ≠ ordered dedupe.**

---

### 22.3.5 Performance and Membership Use Cases

**Beginner Level**: Build a set once, test many times in loops.

**Intermediate Level**: `set` intersection/union for tag matching in search.

**Expert Level**: Bloom filters when memory-bound (not comprehension—but comp builds small sets).

```python
# Beginner: allowlist
ALLOW = {"read", "write"}
perms = {"read", "admin"}
print(perms <= ALLOW)  # subset? False

# Intermediate: overlap of skills
req = {"sql", "python"}
candidate = {"python", "rust"}
print(len(req & candidate))

# Expert: comp builds frozen candidate skill set from resume tokens
resume = "Python SQL python"
skills = {tok.lower() for tok in resume.split()}
```

#### Key Points

- Comprehension materializes full set—consider streaming for huge inputs.

---

## 22.4 Generator Expressions

### 22.4.1 Syntax

**Beginner Level**: `(expr for x in iterable)`—parentheses like a lazy cousin of list comp.

**Intermediate Level**: Outer parentheses can be dropped when it is the only argument to a function: `sum(x for x in nums)`.

**Expert Level**: Generator objects implement iterator protocol; single-pass consumption.

```python
# Beginner
g = (n * n for n in range(3))
print(list(g))

# Intermediate: sum without list
print(sum(x * x for x in range(4)))

# Expert: single pass
g = (x for x in range(3))
print(next(g), list(g))  # 0 then [1, 2]
```

#### Key Points

- Round parens vs square brackets is the main syntactic difference from list comps.

---

### 22.4.2 Generator Expression vs List Comprehension

**Beginner Level**: List comp makes a list immediately; gen exp waits until you iterate.

**Intermediate Level**: Choose gen exp for pipelines feeding `sum`, `max`, `any`, `all`.

**Expert Level**: Chained gen exps keep memory flat in ETL.

```python
# Beginner: memory difference conceptual
nums = range(10**6)
# lst = [x for x in nums]  # large RAM
gen = (x for x in nums)  # tiny iterator object

# Intermediate: pipeline
lines = ["1", "2", "oops", "3"]
parsed = (int(x) for x in lines if x.isdigit())
print(sum(parsed))

# Expert: compose
squares = (x * x for x in range(5))
evens = (y for y in squares if y % 2 == 0)
print(list(evens))
```

#### Key Points

- If you need random access or `len`, use a list.

---

### 22.4.3 Memory Footprint

**Beginner Level**: One small generator object vs large list allocation.

**Intermediate Level**: Nested gen exps still constant overhead if not materialized.

**Expert Level**: Watch accidental `list(gen)` in middle of pipeline.

```python
# Beginner / Intermediate
import sys

lst = [x for x in range(1000)]
gen = (x for x in range(1000))
print(sys.getsizeof(lst) > sys.getsizeof(gen))

# Expert: re-iterable need — tee or list
from itertools import tee

g = (x for x in range(3))
a, b = tee(g)
print(list(a), list(b))
```

#### Key Points

- Generators do not support `len` without exhausting or wrapping.

---

### 22.4.4 Lazy Evaluation Semantics

**Beginner Level**: Values computed on demand when you loop.

**Intermediate Level**: Side effects in expression run as iteration proceeds—not all up front.

**Expert Level**: Exception may occur mid-pipeline; partial consumption matters for resource cleanup (`contextlib.closing` patterns).

```python
# Beginner: lazy demo
def noisy(x):
    print("eval", x)
    return x * 2

g = (noisy(n) for n in range(3))
print("created")
print(next(g))

# Intermediate: short-circuit consumers
from itertools import islice

g = (x for x in range(10**9))
first10 = list(islice(g, 10))

# Expert: closing files — use context in loop, not raw gen of open()
```

#### Key Points

- Lazy + side effects = ordering surprises if consumed multiple times.

---

### 22.4.5 Use Cases (Pipelines, `any`/`all`, Constructors)

**Beginner Level**: `any(pred(x) for x in items)` without building booleans list.

**Intermediate Level**: Pass gen exp to constructors: `set()`, `sorted()`, `collections.Counter`.

**Expert Level**: Zero-copy style chaining in microservices map-reduce steps.

```python
# Beginner
logs = ["ok", "error", "ok"]
has_error = any("error" in line for line in logs)

# Intermediate
from collections import Counter

words = (w.lower() for w in ["Py", "py", "go"])
print(Counter(words))

# Expert: dict from gen of pairs
pairs = ((str(i), i * i) for i in range(3))
print(dict(pairs))
```

#### Key Points

- Consumers like `sorted` will materialize—still often better than manual append.

---

## 22.5 Advanced Comprehension Patterns

### 22.5.1 Complex Comprehensions and Readability Budget

**Beginner Level**: If you need to read it twice, simplify.

**Intermediate Level**: Extract helpers: `def clean(x): ...` then `[clean(r) for r in rows]`.

**Expert Level**: Linters (e.g., Ruff) may flag overly complex comps—split.

```python
# Beginner: too much in one line — refactor
raw = [" 1 ", "x", "3"]

def parse_int(s):
    s = s.strip()
    return int(s) if s.isdigit() else None

nums = [v for v in (parse_int(s) for s in raw) if v is not None]
```

#### Key Points

- **Clarity > cleverness** in production code reviews.

---

### 22.5.2 Debugging Comprehensions

**Beginner Level**: Temporarily switch to loop with print.

**Intermediate Level**: Use `warnings` or logging inside a gen—know it runs lazily.

**Expert Level**: `breakpoint()` inside expression (Python 3.7+) works but is awkward—prefer loop.

```python
# Beginner: loop duplicate
items = range(3)
out = []
for x in items:
    y = x * 2
    # print("dbg", x, y)
    out.append(y)

# Intermediate: list() to force errors early
gen = (1 / x for x in [1, 0, 2])
try:
    print(list(gen))
except ZeroDivisionError as e:
    print("caught", e)
```

#### Key Points

- Stack traces point to comprehension line—harder to debug than expanded loop.

---

### 22.5.3 Variable Scope and the Walrus Operator

**Beginner Level**: Loop variable leaks in Python 2; in Python 3 comprehension has local scope for simple comps.

**Intermediate Level**: `:=` can introduce bindings used in filters—PEP 572 rules.

**Expert Level**: Walrus in comp: `[y for x in data if (y := f(x)) > 0]`.

```python
# Beginner: Py3 scoping
x = "outer"
squares = [x * x for x in range(3)]
print(x)  # still "outer"

# Intermediate / Expert: walrus avoids double computation
data = [1, 2, 3, 4]
out = [y for x in data if (y := x * x) % 2 == 0]
print(out)
```

#### Key Points

- Test walrus-heavy comps—some reviewers ban them for readability.

---

### 22.5.4 Flattening Nested Structures

**Beginner Level**: `[x for row in matrix for x in row]`.

**Intermediate Level**: Irregular nesting may need recursion, not comp alone.

**Expert Level**: `itertools.chain.from_iterable` for iterators of iterators.

```python
# Beginner
matrix = [[1, 2], [3]]
flat = [x for row in matrix for x in row]

# Intermediate: mixed depth — recursive generator
def flatten(it):
    for el in it:
        if isinstance(el, list):
            yield from flatten(el)
        else:
            yield el

print(list(flatten([[1, [2, 3]], 4])))

# Expert
from itertools import chain

chunks = [[1, 2], [3]]
print(list(chain.from_iterable(chunks)))
```

#### Key Points

- Pick recursion/`chain` when structure is not uniform.

---

### 22.5.5 Performance Optimization Strategies

**Beginner Level**: Avoid repeated work in expression—compute once with walrus or pre-loop.

**Intermediate Level**: Push filters early in pipeline to shrink work.

**Expert Level**: Move hot inner loops to NumPy/Cython; comps stay in orchestration layer.

```python
# Beginner: repeated call
import hashlib

rows = [b"a", b"bb"]

# BAD: hashlib.sha256(x).hexdigest() twice conceptually if duplicated logic
digests = [hashlib.sha256(x).hexdigest() for x in rows]

# Intermediate: precompile regex outside comp
import re

pat = re.compile(r"\d+")
strings = ["a1", "b2"]
nums = [int(m.group(0)) for s in strings if (m := pat.search(s))]
```

#### Key Points

- Profile before micro-optimizing comprehensions.

---

### 22.5.6 Team Standards and Anti-Patterns

**Beginner Level**: Avoid comps purely for code golf.

**Intermediate Level**: Do not put `try/except` inside expression (syntax limitation anyway—use helper).

**Expert Level**: Document non-obvious comps with a short comment or named helper.

```python
# Anti-pattern: side effect in comp (don't)
out = [print(x) or x for x in range(3)]  # confusing

# Better
out = []
for x in range(3):
    print(x)
    out.append(x)
```

#### Key Points

- Side effects inside comprehensions harm readability and debugging.

---

### 22.5.7 When Not to Use Comprehensions

**Beginner Level**: Multiple branches and mutations belong in a loop.

**Intermediate Level**: Async `async for` is not comprehension in older Python; use async loops.

**Expert Level**: Highly exception-prone steps need explicit try/except per item.

```python
# Beginner: exception per item
paths = ["a.txt", "b.txt"]
contents = []
for p in paths:
    try:
        with open(p, encoding="utf-8") as f:
            contents.append(f.read())
    except OSError:
        contents.append("")
```

#### Key Points

- Comprehensions are not a moral imperative—loops are fine.

---

## Topic Key Points

- List/set/dict comprehensions are **eager**; generator expressions are **lazy**.
- Dict comps need hashable keys; watch duplicate key overwrite.
- Set comps dedupe but **do not preserve order**.
- Gen exps shine as arguments to reductions and constructors.
- Complexity growth is the main readability risk—refactor aggressively.

## Best Practices

- Prefer comprehensions for simple 1:1 transforms and filters; use loops for side effects and errors.
- Use generator expressions for large streams and intermediate pipeline stages.
- Validate invertibility before swapping dict keys/values.
- Never share mutable defaults via `dict.fromkeys`.
- Use `dict.fromkeys` or ordered dedupe patterns when order matters.
- Add helper functions when the expression part spans multiple concepts.
- Enforce team rules on walrus usage and maximum comprehension complexity.

## Common Mistakes to Avoid

- Using `{}` expecting an empty set.
- Confusing list comp filter `if` with conditional expression placement.
- Nesting comprehensions so deeply that logic is opaque.
- Assuming set comp preserves order.
- Using list comprehension where generator would save huge memory.
- Creating aliased inner lists with `[[]] * n`.
- Inverting dicts when values collide, silently losing data.
- Consuming a generator twice without `tee` or `list`.
- Putting non-hashable objects into sets or dict keys.
- Relying on comprehension loop variables leaking (check Python version and walrus rules).

---

*End of Topic 22 — Comprehensions.*
