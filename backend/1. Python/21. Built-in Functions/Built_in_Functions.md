# Python Built-in Functions (Topic 21)

Python exposes a rich standard library of **built-in functions**—callable objects available without import. They underpin type checking, numeric work, text handling, sequences, object introspection, iteration, and dynamic execution. This guide covers them at three depth levels with data-analysis, API, and production-flavored examples.

## 📑 Table of Contents

- [21.1 Type and Attribute Functions](#211-type-and-attribute-functions)
- [21.2 Numeric Built-ins](#212-numeric-built-ins)
- [21.3 String and Representation Built-ins](#213-string-and-representation-built-ins)
- [21.4 Sequence and Ordering Built-ins](#214-sequence-and-ordering-built-ins)
- [21.5 Object Identity and Model Built-ins](#215-object-identity-and-model-built-ins)
- [21.6 Iteration and Transformation Built-ins](#216-iteration-and-transformation-built-ins)
- [21.7 Execution, Environment, and I/O Built-ins](#217-execution-environment-and-io-built-ins)
- [21.8 Introspection Attributes and `inspect`](#218-introspection-attributes-and-inspect)
- [Topic Key Points](#topic-key-points)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 21.1 Type and Attribute Functions

### 21.1.1 `type()`

**Beginner Level**: `type(x)` tells you what kind of value `x` is—for example `int` or `str`. It is how you read the class of an object in the REPL.

**Intermediate Level**: With three arguments, `type(name, bases, dict)` constructs a new class dynamically (metaclass use). Single-argument `type` returns `x.__class__` and is the canonical way to branch on concrete types in libraries.

**Expert Level**: Metaprogramming and ORMs use `type()` to build model classes at import time. Frameworks may subclass `type` as a metaclass; understanding `type(obj)` vs `obj.__class__` matters when `__class__` is overridden on instances.

```python
# Beginner: what is this API field?
user_id = "42"
print(type(user_id))  # <class 'str'> — might need int for DB

# Intermediate: dynamic model (simplified ORM-style)
def make_model(name, fields):
    return type(name, (), {"__annotations__": {k: type(v) for k, v in fields.items()}})

Order = make_model("Order", {"total": 0.0, "currency": "USD"})
print(Order.__name__, Order.__annotations__)

# Expert: respect __class__ edge cases in proxies
class Proxy:
    __slots__ = ("_obj",)
    def __init__(self, obj):
        self._obj = obj
    @property
    def __class__(self):
        return str  # lie to isinstance unless checks use _obj
    def __getattr__(self, n):
        return getattr(self._obj, n)

p = Proxy([1, 2])
print(type(p) is list, isinstance(p, list))  # False False — type sees Proxy
```

#### Key Points

- One-arg `type(x)` returns the class object.
- Three-arg `type` creates a new class object.
- Prefer `isinstance` for type checks in application code.

---

### 21.1.2 `isinstance()`

**Beginner Level**: `isinstance(x, int)` answers “is `x` an integer?” It returns `True` or `False`.

**Intermediate Level**: The second argument may be a tuple of types; `isinstance(x, (int, float))` accepts numeric types. Subclasses satisfy `isinstance` for their bases (Liskov-friendly).

**Expert Level**: Abstract base classes (`collections.abc`) integrate with `isinstance` via `__instancecheck__`. In APIs, accept `collections.abc.Sequence` instead of `list` alone for flexibility.

```python
# Beginner: validate JSON payload age
def age_ok(v):
    return isinstance(v, int) and v >= 0

# Intermediate: numeric tower for analytics
def normalize_number(x):
    if isinstance(x, (int, float)):
        return float(x)
    if isinstance(x, str) and x.replace(".", "", 1).isdigit():
        return float(x)
    raise TypeError("expected number-like")

# Expert: structural typing with ABC
from collections.abc import Mapping

def merge_metadata(base: dict, extra):
    if not isinstance(extra, Mapping):
        raise TypeError("metadata must be mapping-like")
    return {**base, **extra}
```

#### Key Points

- Use `isinstance`, not `type(x) is T`, unless you explicitly disallow subclasses.
- Tuple of types is idiomatic for “one of several.”

---

### 21.1.3 `issubclass()`

**Beginner Level**: `issubclass(A, B)` checks whether class `A` is `B` or a subclass of `B`.

**Intermediate Level**: Second argument may be a tuple of classes. Useful for plugin systems that register base handler classes.

**Expert Level**: Works with ABCs and virtual subclasses (`register`). Critical in framework code that inspects class hierarchies before wiring routes or serializers.

```python
# Beginner: only allow certain exception types in a retry helper
class TransientError(Exception):
    pass

def retryable(exc):
    return issubclass(type(exc), TransientError)

# Intermediate: multi-base plugins
class BaseParser: ...
class JsonParser(BaseParser): ...
class XmlParser(BaseParser): ...

def register(parser_cls):
    if not issubclass(parser_cls, (JsonParser, XmlParser, BaseParser)):
        raise ValueError("invalid parser family")

# Expert: ABC virtual subclass
from collections.abc import Sized

class Bucket:
    def __len__(self):
        return 0

assert issubclass(Bucket, Sized)
```

#### Key Points

- Both arguments must be type objects (classes), not instances.
- Prefer `isinstance(obj, cls)` for instances.

---

### 21.1.4 `callable()`

**Beginner Level**: Returns whether you can call a value with `()`—for example functions are callable; integers are not.

**Intermediate Level**: Instances are callable if they define `__call__`. Handy when normalizing hooks that may be either a function or a callable object.

**Expert Level**: In dependency injection, `callable(factory)` distinguishes factories from pre-built singletons. Beware: classes are callable (constructors).

```python
# Beginner: user supplies callback or None
def run_hook(hook, data):
    if callable(hook):
        hook(data)

# Intermediate: Flask-like before_request registration
_registry = []

def before_request(fn=None):
    def deco(f):
        _registry.append(f)
        return f
    if callable(fn):
        return deco(fn)
    return deco

# Expert: class vs instance callable
class Greeter:
    def __call__(self, name):
        return f"hi {name}"

print(callable(Greeter), callable(Greeter()))
```

#### Key Points

- `callable` is True for functions, methods, classes, and objects with `__call__`.
- Do not use it as the only guard for “is this a function”; sometimes you need `inspect`.

---

### 21.1.5 `hasattr()`

**Beginner Level**: `hasattr(obj, "name")` checks if `obj` has an attribute `name` without raising `AttributeError`.

**Intermediate Level**: Implemented by `getattr(obj, name, _sentinel)` and comparing; it may invoke descriptors. Can trigger `__getattr__` side effects on some classes.

**Expert Level**: In production, prefer `getattr` with default or `try/except AttributeError` when you need to avoid descriptor execution. `hasattr` during `__init__` of fragile legacy objects can mask bugs.

```python
# Beginner: optional debug flag on config object
def verbose(cfg):
    return hasattr(cfg, "debug") and cfg.debug

# Intermediate: API client version detection
def supports_compression(client):
    return hasattr(client, "session") and hasattr(client.session, "headers")

# Expert: descriptor caveat — hasattr may run code
class Tricky:
    @property
    def x(self):
        raise RuntimeError("side effect")

# hasattr(Tricky(), "x") may raise in edge cases; EAFP often clearer
```

#### Key Points

- `hasattr` swallows exceptions from property getters in Python 3.11+ behavior is documented—still be cautious with properties that raise.
- EAFP (`try` / `except`) is often clearer in tight loops.

---

### 21.1.6 `getattr()`

**Beginner Level**: `getattr(obj, "name", default)` reads an attribute by string name; if it is missing, you get `default` instead of an exception.

**Intermediate Level**: Powers serializers and plugins that read optional hooks (`getattr(cfg, "on_event", None)`); the three-argument form is the usual pattern.

**Expert Level**: ORMs and RPC stubs build on `getattr`/`__getattr__`; always **whitelist** dynamic names that originate from HTTP or message queues.

```python
ALLOWED = {"created_at", "score"}
field = "score"
record = type("R", (), {"created_at": 1, "score": 99})()
if field in ALLOWED:
    print(getattr(record, field))
```

#### Key Points

- Two-argument `getattr` raises `AttributeError` if missing.
- Never pass untrusted user strings as the attribute name.

---

### 21.1.7 `setattr()`

**Beginner Level**: `setattr(obj, "name", value)` assigns `obj.name = value` using a runtime string name.

**Intermediate Level**: Bulk-applies validated dictionaries when building admin tools or applying JSON patches to plain objects.

**Expert Level**: Metaclasses and data-binding layers use `setattr` during class construction; watch infinite recursion if `__setattr__` is overridden carelessly.

```python
def apply_updates(obj, updates: dict):
    for k, v in updates.items():
        setattr(obj, k, v)
```

#### Key Points

- Pair with schema validation before touching sensitive models.

---

### 21.1.8 `delattr()`

**Beginner Level**: `delattr(obj, "name")` removes an attribute, similar to `del obj.name`.

**Intermediate Level**: Feature flags may strip deprecated fields after migrations; tests use it to simulate partial objects.

**Expert Level**: Frameworks cleaning dynamic registries must avoid deleting required slots or breaking invariants—prefer explicit APIs over silent `delattr` in libraries.

```python
class Row:
    def __init__(self):
        self.old_column = 1

r = Row()
delattr(r, "old_column")
```

#### Key Points

- `__slots__` objects still support `delattr` only for existing slot attributes.

---


**Beginner Level**: `getattr(obj, "a", default)` reads attribute `a` or returns `default`. `setattr(obj, "a", v)` sets it. `delattr` removes it.

**Intermediate Level**: Enables generic serializers and dataclass-like utilities without `if` chains. Third argument to `getattr` avoids exceptions.

**Expert Level**: Used in ORMs, RPC proxies, and `mock.patch`. Security: never pass untrusted strings as attribute names from HTTP parameters (attribute injection).

```python
# Beginner: pick sort field from query string (whitelist!)
ALLOWED = {"created_at", "score"}
field = "score"
if field in ALLOWED:
    key = getattr(record, field)

# Intermediate: bulk setattr from validated dict
def apply_updates(obj, updates: dict):
    for k, v in updates.items():
        setattr(obj, k, v)

# Expert: delattr for dynamic schema migration rollback
class Row:
    def __init__(self):
        self.old_column = 1

delattr(Row(), "old_column")
```

#### Key Points

- Always whitelist dynamic attribute names in web-facing code.
- `setattr`/`getattr` work on modules and classes too.

---

## 21.2 Numeric Built-ins

### 21.2.1 `abs()`

**Beginner Level**: Absolute value: `abs(-3)` is `3`.

**Intermediate Level**: Works on complex numbers (magnitude). Useful in ML loss deltas and financial variance.

**Expert Level**: Custom types can implement `__abs__`; NumPy arrays delegate element-wise.

```python
# Beginner: distance without sign
delta = actual - forecast
print(abs(delta))

# Intermediate: complex step in signal processing
z = 3 + 4j
print(abs(z))  # 5.0

# Expert: __abs__ hook
class Money:
    def __init__(self, cents: int):
        self.cents = cents
    def __abs__(self):
        return Money(abs(self.cents))
```

#### Key Points

- For integers and floats, result type matches input (except complex → float).

---

### 21.2.2 `round()`

**Beginner Level**: Rounds a number to the nearest whole value: `round(3.6)` → `4`.

**Intermediate Level**: `round(x, ndigits)` rounds to decimal places. Uses bankers rounding (round half to even) for floats.

**Expert Level**: For currency, avoid binary float `round`; use `Decimal` quantize in production.

```python
# Beginner: display KPI
print(round(3.14159, 2))

# Intermediate: tie-breaking
print(round(0.5), round(1.5))  # 0 2 — half to even

# Expert: money with Decimal
from decimal import Decimal, ROUND_HALF_UP
d = Decimal("2.675")
print(d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
```

#### Key Points

- Float rounding surprises are inherent to IEEE 754; document behavior for APIs.

---

### 21.2.3 `pow()`

**Beginner Level**: `pow(x, y)` is \(x^y\). `pow(2, 3)` → `8`.

**Intermediate Level**: Three-arg form `pow(x, y, mod)` computes modular exponentiation efficiently—critical in crypto.

**Expert Level**: Prefer `pow(a, b, m)` over `(a**b) % m` for large integers in auth token math.

```python
# Beginner: compound interest factor
print(pow(1 + 0.05, 10))

# Intermediate: modular exp for RSA-style demo (tiny numbers)
print(pow(7, 3, 11))

# Expert: large-int crypto pattern
MOD = 10**9 + 7
print(pow(123456, 789012, MOD))
```

#### Key Points

- Three-argument `pow` requires integers.

---

### 21.2.4 `divmod()`

**Beginner Level**: Returns `(quotient, remainder)` together: `divmod(7, 3)` → `(2, 1)`.

**Intermediate Level**: Same as `(a // b, a % b)` for ints; for floats, floor division and remainder semantics apply.

**Expert Level**: Pagination helpers: `page, offset = divmod(index, page_size)` style layouts.

```python
# Beginner: split items into groups of 3
n, rem = divmod(10, 3)
print(n, rem)

# Intermediate: time conversion
seconds = 3661
minutes, sec = divmod(seconds, 60)
hours, minutes = divmod(minutes, 60)
print(hours, minutes, sec)

# Expert: chunking dataframe row indices (conceptual)
def chunk_bounds(total, size):
    for start in range(0, total, size):
        q, r = divmod(min(size, total - start), size)
        yield start, start + min(size, total - start)
```

#### Key Points

- Single call avoids duplicate division work in hot loops (minor optimization).

---

### 21.2.5 `min()`

**Beginner Level**: Returns the smallest item in an iterable (for example the lowest price in a list of dicts).

**Intermediate Level**: `key=` selects comparison field; `default=` avoids crashes on empty streams in streaming analytics.

**Expert Level**: NaN and timezone-aware datetimes need explicit policies—document whether ties pick the first stable element.

```python
products = [{"name": "a", "price": 9}, {"name": "b", "price": 7}]
print(min(products, key=lambda p: p["price"]))
```

#### Key Points

- Passing multiple positional iterables compares pairwise elements.

---

### 21.2.6 `max()`

**Beginner Level**: Returns the largest item—useful for peak throughput, latest timestamp, or highest model score in a batch.

**Intermediate Level**: Combine with `key=` for dict rows; use `default=` when iterators may be empty (live tailing logs).

**Expert Level**: Ranking APIs should state tie behavior; for floats, consider filtering NaNs before calling `max`.

```python
import math

def safe_max(nums):
    clean = [x for x in nums if not (isinstance(x, float) and math.isnan(x))]
    return max(clean) if clean else float("nan")
```

#### Key Points

- Symmetric API to `min`; both support the same keyword arguments.

---


**Beginner Level**: `min([3, 1, 2])` → `1`; `max` picks the largest.

**Intermediate Level**: `key=` function customizes ordering (e.g., `key=lambda u: u["score"]`). `default=` for `min` on empty iterables (Python 3.4+).

**Expert Level**: Tie-breaking and stability matter in rankings; document whether you use first-seen or arbitrary ties. For production metrics, handle NaN explicitly.

```python
# Beginner: cheapest product
products = [{"name": "a", "price": 9}, {"name": "b", "price": 7}]
print(min(products, key=lambda p: p["price"]))

# Intermediate: default for possibly empty stream
rows = []
best = min(rows, key=lambda r: r["loss"], default=None)

# Expert: NaN-aware (math.isnan guard) for analytics
import math

def safe_min(nums):
    clean = [x for x in nums if not (isinstance(x, float) and math.isnan(x))]
    return min(clean) if clean else float("nan")
```

#### Key Points

- Multiple positional iterables compare element-wise (less common).
- Empty iterator without `default` raises `ValueError`.

---

### 21.2.7 `sum()`

**Beginner Level**: Adds numbers in an iterable, starting at `0` (or `start`).

**Intermediate Level**: `sum(matrix, [])` flattens but is O(n²)—avoid for large lists.

**Expert Level**: For floats, `math.fsum` is more numerically stable for analytics pipelines.

```python
# Beginner: total sales
print(sum([10, 20, 30]))

# Intermediate: weighted sum via generator
weights = [0.5, 0.3, 0.2]
scores = [80, 90, 70]
print(sum(w * s for w, s in zip(weights, scores)))

# Expert: use fsum for many small floats
import math
print(math.fsum([1e-16] * 1000 + [1.0]))
```

#### Key Points

- `start` must support `+` with elements (e.g., `sum([[1],[2]], [])` works but slowly).

---

## 21.3 String and Representation Built-ins

### 21.3.1 `len()` (strings and general)

**Beginner Level**: Number of characters in a string (Unicode code points in CPython for `str`).

**Intermediate Level**: Same built-in works on sequences and collections; `__len__` hook.

**Expert Level**: For UTF-8 byte length, use `len(s.encode("utf-8"))`; for grapheme clusters, use `unicodedata` or ICU.

```python
# Beginner: validate username length
u = "ada"
print(len(u) >= 3)

# Intermediate: batch string lengths for histogram
texts = ["hi", "hello", "hey"]
print([len(t) for t in texts])

# Expert: bytes vs characters
s = "café"
print(len(s), len(s.encode("utf-8")))
```

#### Key Points

- `len` is O(1) for built-in containers that track size.

---

### 21.3.2 `format()` / format protocol

**Beginner Level**: `format(3.1, ".2f")` formats values as strings.

**Intermediate Level**: Aligns with f-strings internally; supports `format_spec` mini-language for tables in logs.

**Expert Level**: Custom types implement `__format__` for domain-specific rendering (currencies, units).

```python
# Beginner: stable CSV column
print(format(12.3, ">10.2f"))

# Intermediate: thousand separators
print(format(1_000_000, ","))

# Expert: custom __format__
class EUR:
    def __init__(self, amount):
        self.amount = amount
    def __format__(self, spec):
        return f"{self.amount:{spec}} €"

print(format(EUR(1999.5), ",.2f"))
```

#### Key Points

- Prefer f-strings in app code; `format()` shines for dynamic format strings.

---

### 21.3.3 `ord()`

**Beginner Level**: `ord("A")` returns the integer Unicode code point of a single-character string.

**Intermediate Level**: Validate ASCII subsets for hardware protocols or legacy mainframe bridges alongside UTF-8 JSON APIs.

**Expert Level**: Surrogate handling is mostly historical in Python 3; still document behavior for international SKU encodings.

```python
print(ord("A"), ord("€"))
```

#### Key Points

- `ord` requires a string of length 1.

---

### 21.3.4 `chr()`

**Beginner Level**: `chr(65)` returns the character for a Unicode code point.

**Intermediate Level**: Rebuild normalized identifiers or simple ciphers in teaching examples (never for real cryptography).

**Expert Level**: For human-visible glyphs (grapheme clusters), higher-level libraries outperform naive `chr` loops.

```python
print(chr(65), chr(0x1F600))
```

#### Key Points

- Raises `ValueError` for code points outside Unicode range.

---


**Beginner Level**: `ord("A")` → `65`; `chr(65)` → `"A"`.

**Intermediate Level**: Building simple ciphers, validating ASCII subsets for API tokens.

**Expert Level**: Surrogate pairs in narrow builds are historical; in Python 3 `ord` on astral characters returns full code point.

```python
# Beginner: ROT13 style (demo only)
def rot_char(c):
    if "a" <= c <= "z":
        base = ord("a")
        return chr((ord(c) - base + 13) % 26 + base)
    return c

# Intermediate: ensure printable ASCII for webhook secrets
def is_ascii_printable(s: str) -> bool:
    return all(32 <= ord(ch) <= 126 for ch in s)

# Expert: code point iteration awareness
s = "A"
print(ord(s), chr(ord(s)))
```

#### Key Points

- `chr` only accepts valid Unicode code points in range.

---

### 21.3.5 `repr()`

**Beginner Level**: “Developer string” for a value, often with quotes for strings.

**Intermediate Level**: Should be unambiguous where possible; used in debug logs and `__repr__` for dataclasses.

**Expert Level**: `eval(repr(x))` round-trip is ideal but not always possible; security: never `eval` untrusted repr.

```python
# Beginner: log structure
user = {"id": 1, "role": "admin"}
print(repr(user))

# Intermediate: dataclass-style repr
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point(x={self.x!r}, y={self.y!r})"

# Expert: reprlib for large collections
import reprlib
print(reprlib.repr(list(range(1000))))
```

#### Key Points

- Implement `__repr__` for every non-trivial model type.

---

### 21.3.6 `ascii()`

**Beginner Level**: Like `repr` but escapes non-ASCII with `\x`, `\u`, `\U`.

**Intermediate Level**: Useful when you must embed strings in ASCII-only protocols or JSON-ish logs that must be 7-bit safe displays.

**Expert Level**: Auditing and security reviews use `ascii` to reveal hidden homoglyphs.

```python
# Beginner: see escapes
print(ascii("café"))

# Intermediate: safe debug line for mixed-language NLP corpus
s = "Hello 你好"
print(ascii(s))

# Expert: compare visually similar strings
a, b = "а", "a"  # Cyrillic vs Latin
print(ascii(a), ascii(b))
```

#### Key Points

- `ascii` always returns ASCII-only string.

---

### 21.3.7 `bin()`

**Beginner Level**: `bin(10)` → `'0b1010'`, a string for debugging binary flags.

**Intermediate Level**: IoT services interpret hardware registers; combine with int literals in firmware-facing dashboards.

**Expert Level**: Log feature-flag bitmasks with consistent width using f-strings or format specs instead of raw `bin` alone.

```python
flags = 0b1010
print(bin(flags))
```

#### Key Points

- Result is a string; parse with `int(s, 2)`.

---

### 21.3.8 `oct()`

**Beginner Level**: `oct(8)` → `'0o10'`, common when reading Unix `chmod` style permissions.

**Intermediate Level**: DevOps scripts echo permission triples; pair with bitwise ops for security reviews.

**Expert Level**: Document whether APIs expect string or integer—convert explicitly at boundaries.

```python
mode = 0o755
print(oct(mode))
```

#### Key Points

- Leading `0o` prefix distinguishes base.

---

### 21.3.9 `hex()`

**Beginner Level**: `hex(255)` → `'0xff'`, helpful when reading memory dumps or color codes.

**Intermediate Level**: API identifiers and Git SHAs often surface as hex strings; normalize casing (`lower()`) before comparisons.

**Expert Level**: Cryptographic code still uses `int.from_bytes`/`to_bytes`; `hex` is mainly for display.

```python
print(hex(255), int("ff", 16))
```

#### Key Points

- Works on arbitrary-size integers.

---


**Beginner Level**: String forms of integers in base 2, 8, 16 with prefixes `0b`, `0o`, `0x`.

**Intermediate Level**: Parsing permissions, flags, and hardware registers in IoT backends.

**Expert Level**: Combine with `int(s, 0)` for auto-base parsing of literals in admin tools.

```python
# Beginner: permissions demo
mode = 0o755
print(oct(mode))

# Intermediate: bitmask feature flags
flags = 0b1010
print(bin(flags))

# Expert: round-trip
s = hex(255)
print(int(s, 16))
```

#### Key Points

- These return strings; use `int(x, base)` to parse.

---

## 21.4 Sequence and Ordering Built-ins

### 21.4.1 `len()` on sequences

**Beginner Level**: Counts items in a list/tuple.

**Intermediate Level**: For generators, `len` fails—materialize or track count separately.

**Expert Level**: Custom sequences implement `__len__`; numpy arrays support `len` as first dimension.

```python
# Beginner
print(len([1, 2, 3]))

# Intermediate: generator has no len
g = (x for x in range(3))
try:
    len(g)
except TypeError:
    print("generators are not sized")

# Expert: __len__ on custom batch iterator wrapper
class Batch:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)
```

#### Key Points

- Do not call `len` on unbounded iterators.

---

### 21.4.2 `max()` / `min()` on sequences

**Beginner Level**: Largest/smallest element.

**Intermediate Level**: `key` for dicts of metrics; multiple iterables compared lexicographically.

**Expert Level**: For time-series windows, combine with `deque` for streaming min/max (built-in min is for finite iterables).

```python
# Beginner
print(max([3, 9, 2]))

# Intermediate: latest event by timestamp
events = [{"ts": 1, "v": "a"}, {"ts": 5, "v": "b"}]
print(max(events, key=lambda e: e["ts"]))

# Expert: lexicographic tuple keys
rows = [("alice", 2), ("bob", 1), ("alice", 9)]
print(max(rows))  # compares first element then second
```

#### Key Points

- Document tie behavior for business logic.

---

### 21.4.3 `sum()` on sequences

**Beginner Level**: Total of a list of numbers.

**Intermediate Level**: Generator expressions avoid intermediate lists in big data ETL.

**Expert Level**: For mixed Decimal/float, avoid accidental promotion—keep types consistent.

```python
# Beginner
print(sum([1, 2, 3]))

# Intermediate: conditional sum (revenue where status == paid)
orders = [{"amount": 10, "status": "paid"}, {"amount": 5, "status": "due"}]
print(sum(o["amount"] for o in orders if o["status"] == "paid"))

# Expert
from decimal import Decimal
print(sum([Decimal("0.1"), Decimal("0.2")]))
```

#### Key Points

- Boolean is subclass of int—`sum` of bools counts `True` as 1.

---

### 21.4.4 `reversed()`

**Beginner Level**: Iterates a sequence backwards.

**Intermediate Level**: Returns an iterator; does not mutate original list.

**Expert Level**: Custom `__reversed__` on classes; for linked lists, define efficient reverse iterator.

```python
# Beginner
print(list(reversed([1, 2, 3])))

# Intermediate: last N log lines without indexing full file in memory (conceptual)
def tail_lines(lines, n=5):
    return list(reversed(list(reversed(lines))[-n:]))

# Expert
class Stack:
    def __init__(self, items):
        self.items = items
    def __reversed__(self):
        return reversed(self.items)

print(list(reversed(Stack([1, 2, 3]))))
```

#### Key Points

- `reversed` needs a sequence with `__len__` and `__getitem__` or `__reversed__`.

---

### 21.4.5 `sorted()`

**Beginner Level**: Returns new sorted list.

**Intermediate Level**: `key`, `reverse`. Stable sort preserves order of equal elements.

**Expert Level**: `operator.itemgetter` for faster keys in analytics; `sorted` is Timsort—great on partially ordered data.

```python
# Beginner
print(sorted([3, 1, 2]))

# Intermediate: sort users by last login desc
users = [{"name": "a", "last": 2}, {"name": "b", "last": 9}]
print(sorted(users, key=lambda u: u["last"], reverse=True))

# Expert: multi-key sort
import operator
rows = [("west", 1), ("east", 2), ("west", 0)]
print(sorted(rows, key=operator.itemgetter(0, 1)))
```

#### Key Points

- Unlike `list.sort`, `sorted` works on any iterable and returns a list.

---

### 21.4.6 `enumerate()`

**Beginner Level**: Pairs index with value: `0, first`, `1, second`, …

**Intermediate Level**: Start index for 1-based reporting in CSV exports.

**Expert Level**: Prefer over manual index counters to avoid off-by-one bugs in ETL pipelines.

```python
# Beginner
for i, ch in enumerate("abc"):
    print(i, ch)

# Intermediate: numbered API errors
errors = ["bad token", "expired"]
body = {f"error_{i}": msg for i, msg in enumerate(errors, start=1)}

# Expert: parallel validation trace
for idx, row in enumerate(dataset):
    validate_row(idx, row)
```

#### Key Points

- `enumerate` is lazy and iterator-friendly.

---

### 21.4.7 `zip()`

**Beginner Level**: Walks multiple lists in parallel.

**Intermediate Level**: `zip(*rows)` transposes a matrix; `strict=True` (3.10+) catches length mismatch.

**Expert Level**: In ML batching, zip features with labels; length mismatch bugs are common—use `strict` in modern Python.

```python
# Beginner
xs = [1, 2, 3]
ys = [10, 20, 30]
print(list(zip(xs, ys)))

# Intermediate: transpose
matrix = [[1, 2], [3, 4], [5, 6]]
print(list(zip(*matrix)))

# Expert: strict zip for aligned time series
a = [1, 2]
b = [10, 20, 30]
try:
    list(zip(a, b, strict=True))
except ValueError as e:
    print("length mismatch caught", e)
```

#### Key Points

- `zip` stops at shortest iterable unless using `itertools.zip_longest`.

---

## 21.5 Object Identity and Model Built-ins

### 21.5.1 `dir()`

**Beginner Level**: Lists names on an object—attributes and methods you can access.

**Intermediate Level**: Without arguments, shows locals in scope. Filters are not applied; includes `__dunder__` names.

**Expert Level**: `dir` is for discovery, not a security boundary; use `getattr` with care.

```python
# Beginner
print([n for n in dir("") if not n.startswith("_")])

# Intermediate: introspect Flask-like app (conceptual)
class App:
    def route(self, path):
        def deco(f):
            return f
        return deco

print("route" in dir(App()))

# Expert
import json
print("loads" in dir(json))
```

#### Key Points

- Output is sorted and is implementation-detail-ish for some types.

---

### 21.5.2 `vars()`

**Beginner Level**: `vars(obj)` like `obj.__dict__` for simple objects.

**Intermediate Level**: No-arg `vars()` is `locals()`—read-only view semantics differ.

**Expert Level**: Use in debuggers; for production serialization prefer explicit schemas (Pydantic).

```python
# Beginner
class User:
    def __init__(self, name):
        self.name = name

print(vars(User("ada")))

# Intermediate: shallow copy pattern
import copy

u = User("bob")
snapshot = copy.copy(vars(u))

# Expert: object without __dict__ (slots)
class S:
    __slots__ = ("x",)
    def __init__(self):
        self.x = 1

try:
    vars(S())
except TypeError as e:
    print(e)
```

#### Key Points

- `__slots__` instances may not have `__dict__`.

---

### 21.5.3 `id()`

**Beginner Level**: Integer identity of object (CPython: address-like).

**Intermediate Level**: Use only for debugging identity, not equality.

**Expert Level**: After object is freed, `id` may be reused; never persist `id` as stable external key.

```python
# Beginner: same literal integers may share id (implementation detail)
a = 256
b = 256
print(a is b)

# Intermediate: detect accidental duplicate mutation of shared list
rows = [[1], [1]]
print(id(rows[0]) == id(rows[1]))

# Expert: weakref keys use identity
import weakref

class Node:
    pass

n = Node()
d = weakref.WeakKeyDictionary()
d[n] = "meta"
```

#### Key Points

- Prefer `is` for `None` checks; use `==` for value equality.

---

### 21.5.4 `hash()`

**Beginner Level**: Integer hash used by dict/set.

**Intermediate Level**: Mutable objects are not hashable unless frozen; tuples hash if contents hashable.

**Expert Level**: Custom `__hash__` must match `__eq__` contract; security: never hash secrets for deduplication if timing matters—use HMAC elsewhere.

```python
# Beginner
print(hash("user:42"))

# Intermediate: tuple key in memoization cache
cache = {}

def fib(n):
    if n in cache:
        return cache[n]
    if n < 2:
        return n
    cache[n] = fib(n - 1) + fib(n - 2)
    return cache[n]

# Expert: dataclass frozen hash
from dataclasses import dataclass

@dataclass(frozen=True)
class Key:
    tenant: str
    id: int

print(hash(Key("acme", 1)))
```

#### Key Points

- If `a == b`, then `hash(a) == hash(b)` must hold for hashable types.

---

### 21.5.5 `object()`

**Beginner Level**: Base class of all classes; bare `object()` instance is a unique sentinel.

**Intermediate Level**: Useful as `default` for `getattr` or `dict.get` when `None` is valid data.

**Expert Level**: Cooperative multiple inheritance uses `object` as ultimate base; understand MRO.

```python
# Beginner: sentinel
MISSING = object()

def get_setting(name, settings):
    v = settings.get(name, MISSING)
    return v if v is not MISSING else "default"

# Intermediate: unique marker in parsing
Token = object()
stream = [Token, "data", Token]

# Expert
class MyCls(object):
    pass

print(MyCls.__mro__)
```

#### Key Points

- `object()` instances cannot have attributes (no `__dict__` by default in CPython).

---

### 21.5.6 `super()`

**Beginner Level**: Calls parent class method in inheritance.

**Intermediate Level**: `super()` without args inside methods uses `__class__` and first argument (Python 3).

**Expert Level**: Cooperative multiple inheritance with explicit `super()` chain; mixins in Django views.

```python
# Beginner
class Base:
    def greet(self):
        return "base"

class Child(Base):
    def greet(self):
        return super().greet() + "+child"

# Intermediate: __init__ chaining
class A:
    def __init__(self):
        self.a = 1

class B(A):
    def __init__(self):
        super().__init__()
        self.b = 2

# Expert: diamond
class X: ...
class Y(X): ...
class Z(X): ...
class W(Y, Z):
    pass

print(W.__mro__)
```

#### Key Points

- Always use `super()` in cooperative hierarchies instead of naming base classes.

---

## 21.6 Iteration and Transformation Built-ins

### 21.6.1 `iter()`

**Beginner Level**: `iter(x)` returns an iterator so you can pass a list or dict keys into manual loops.

**Intermediate Level**: `iter(callable, sentinel)` reads from sockets or parsers until a sentinel value appears.

**Expert Level**: Custom iterators power streaming ETL; know when to implement `__iter__` vs generator functions.

```python
it = iter([1, 2, 3])
print(next(it), next(it))
```

#### Key Points

- Iterators are single-pass; exhausted iterators stay exhausted.

---

### 21.6.2 `next()`

**Beginner Level**: `next(it)` returns the following item; optional default avoids `StopIteration` on empty iterators.

**Intermediate Level**: Parsing protocols manually often uses `next` on token iterators built from `iter(list)`.

**Expert Level**: Async iterators use `anext` in modern Python—do not confuse with synchronous `next`.

```python
it = iter([])
print(next(it, "done"))
```

#### Key Points

- Catching `StopIteration` inside generators incorrectly breaks PEP 479 expectations.

---


**Beginner Level**: `iter(x)` gets iterator; `next(it)` gets next item.

**Intermediate Level**: `iter(callable, sentinel)` reads until sentinel—useful for socket protocols.

**Expert Level**: Custom iterators implement `__iter__`/`__next__`; async code uses `__aiter__` separately.

```python
# Beginner
it = iter([1, 2, 3])
print(next(it), next(it))

# Intermediate: read lines until blank (demo)
lines = iter(["a", "b", "", "c"].__iter__())
def read_until_blank():
    return next(lines)

# Simpler sentinel demo with partial
from functools import partial

def read_chunk():
    return "END"

it = iter(partial(read_chunk), "END")
print(next(it))  # raises if first is already END in real use

# Expert: generator protocol
class Count:
    def __init__(self, n):
        self.n = n
        self.i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        self.i += 1
        return self.i - 1

print(list(Count(3)))
```

#### Key Points

- `StopIteration` ends iteration; in generators, do not catch it incorrectly around `for`.

---

### 21.6.3 `map()`

**Beginner Level**: Applies function to each item lazily.

**Intermediate Level**: Prefer generator expressions for clarity; `map` can be faster with built-in `str` etc.

**Expert Level**: Multiple iterables zip together in `map(fn, a, b)`.

```python
# Beginner
print(list(map(str.upper, ["a", "b"])))

# Intermediate: parse CSV fields
raw = ["10", "20", "bad"]
nums = list(map(int, filter(str.isdigit, raw)))

# Expert: parallel columns
xs = [1, 2, 3]
ys = [10, 20, 30]
print(list(map(lambda a, b: a + b, xs, ys)))
```

#### Key Points

- `map` returns iterator in Python 3—materialize if you need a list or length.

---

### 21.6.4 `filter()`

**Beginner Level**: Keeps items where predicate is true.

**Intermediate Level**: `None` as function filters truthy values.

**Expert Level**: For complex predicates in analytics, profile list comp vs `filter`; readability wins.

```python
# Beginner
print(list(filter(lambda x: x % 2 == 0, range(10)))

# Intermediate: drop null metrics
rows = [{"v": 1}, {"v": None}, {"v": 3}]
print([r for r in rows if r["v"] is not None])

# Expert: truthiness cleanup
values = [0, 1, "", "x"]
print(list(filter(None, values)))
```

#### Key Points

- `filter` is lazy.

---

### 21.6.5 `functools.reduce()` (built-in `reduce` in Python 2; use functools in 3)

**Beginner Level**: Fold iterable to single value (import from `functools` in Python 3).

**Intermediate Level**: Common patterns: sum/product/custom merge.

**Expert Level**: For readability, many `reduce` uses are clearer as explicit loops; keep for established functional pipelines.

```python
from functools import reduce
import operator

# Beginner: product
print(reduce(operator.mul, [2, 3, 4], 1))

# Intermediate: merge dicts (Py3.9+ use | instead)
dicts = [{"a": 1}, {"b": 2}]
print(reduce(lambda x, y: {**x, **y}, dicts, {}))

# Expert: running max with index (still often clearer as loop)
series = [3, 9, 4]
print(reduce(lambda best, x: x if x > best else best, series))
```

#### Key Points

- Python 3 moved `reduce` to `functools`; it is still “stdlib iteration toolbox.”

---

### 21.6.6 `range()`

**Beginner Level**: Arithmetic progression of integers.

**Intermediate Level**: Memory efficient; `len(range(n))` is O(1).

**Expert Level**: Use for indexing and batch offsets in data loaders.

```python
# Beginner
print(list(range(3)))

# Intermediate: stride for sampling every k-th row
k = 1000
indices = range(0, 1_000_000, k)

# Expert: no materialization in sum of arithmetic series formula vs range
print(sum(range(1, 101)))
```

#### Key Points

- `range` is not a list in Python 3.

---

### 21.6.7 `slice()`

**Beginner Level**: `s = slice(1, 5, 2)` describes start/stop/step for `seq[s]`.

**Intermediate Level**: Use in NumPy-style APIs or pagination objects.

**Expert Level**: `indices(len)` maps slice to concrete bounds for bounded sequences.

```python
# Beginner
items = [0, 1, 2, 3, 4, 5]
s = slice(2, None)
print(items[s])

# Intermediate: reusable window for time series
WINDOW = slice(-24, None)  # last 24 points conceptual

# Expert
s = slice(1, 6, 2)
print(s.indices(4))  # (1, 4, 2) clamped to length 4
```

#### Key Points

- Negative slices follow normal sequence rules.

---

## 21.7 Execution, Environment, and I/O Built-ins

### 21.7.1 `eval()`

**Beginner Level**: Evaluates a Python expression string.

**Intermediate Level**: **Dangerous** with untrusted input—never use on request parameters.

**Expert Level**: Some templating systems sandbox; still prefer `ast.literal_eval` for literals.

```python
# Beginner (local only!)
x = 2
print(eval("x + 3", {"__builtins__": {}}, {"x": x}))

# Intermediate: DON'T in web apps
# eval(request.args["expr"])  # never

# Expert: literal config
import ast
safe = ast.literal_eval('{"retry": 3}')
print(safe)
```

#### Key Points

- Treat `eval` as code execution; block in security reviews.

---

### 21.7.2 `exec()`

**Beginner Level**: Executes statements from a string.

**Intermediate Level**: Used rarely in frameworks for dynamic plugins—must be tightly controlled.

**Expert Level**: Supply custom `globals`/`locals` and restricted `__builtins__` if unavoidable.

```python
# Beginner: define function dynamically in controlled environment
g = {}
exec(
    "def add(a,b): return a+b",
    {"__builtins__": {}},
    g,
)
print(g["add"](2, 3))
```

#### Key Points

- Same security caveats as `eval`, stronger surface area.

---

### 21.7.3 `compile()`

**Beginner Level**: Precompile source to code object for repeated `exec`/`eval`.

**Intermediate Level**: Modes `'eval'`, `'exec'`, `'single'`.

**Expert Level**: Template engines and ORMs may compile small DSL snippets once and reuse.

```python
# Beginner / Intermediate
code = compile("a + 1", "<string>", "eval")
print(eval(code, {}, {"a": 10}))

# Expert: filename for tracebacks
code = compile("raise ValueError('bad')", "dynamic.py", "exec")
try:
    exec(code)
except ValueError as e:
    print(e.__traceback__.tb_frame.f_code.co_filename)
```

#### Key Points

- Always pass meaningful `filename` for debugging.

---

### 21.7.4 `globals()`

**Beginner Level**: Returns the current module’s global namespace dict—what names exist at the top level of a file.

**Intermediate Level**: Notebooks and DSL evaluators inject symbols by mutating `globals()`—sandbox carefully.

**Expert Level**: Multiprocessing workers inherit fresh interpreters; relying on mutated globals for cross-task state fails silently.

```python
g = globals()
print("__name__" in g)
```

#### Key Points

- Changes persist for the module lifetime.

---

### 21.7.5 `locals()`

**Beginner Level**: Snapshot of local variables inside a function while debugging.

**Intermediate Level**: `locals()` updates may not persist—treat as read-mostly inside functions.

**Expert Level**: Frame introspection (`inspect.currentframe().f_locals`) is for tooling, not business logic.

```python
def demo():
    x = 1
    print("x" in locals())

demo()
```

#### Key Points

- Behavior of mutating `locals()` is implementation-dependent—avoid relying on it.

---


**Beginner Level**: Dict-like views of global/local namespaces.

**Intermediate Level**: Modifications to `globals()` persist; `locals()` updates may not persist inside functions (implementation detail).

**Expert Level**: Debugging and REPL tooling; avoid mutating `locals()` for logic.

```python
# Beginner
g = globals()
print("globals" in str(type(g)))

# Intermediate: inject test doubles in notebook-style exploration (sparingly)
def patch_global(name, value):
    globals()[name] = value

# Expert: frame inspection (conceptual)
import inspect

def where_am_i():
    fr = inspect.currentframe()
    print(fr.f_locals.keys())
```

#### Key Points

- Do not rely on mutating `locals()` for function behavior.

---

### 21.7.6 `vars()` (no-arg) vs module dict

**Beginner Level**: `vars()` without arguments returns `locals()`.

**Intermediate Level**: `vars(module)` returns `module.__dict__`.

**Expert Level**: Introspection tools enumerate exports.

```python
# Beginner
def demo():
    x = 1
    print(vars())

demo()

# Intermediate
import json
print("loads" in vars(json))
```

#### Key Points

- Overlaps with `dir`/`locals`—pick one style per codebase.

---

### 21.7.7 `input()`

**Beginner Level**: Reads a line from stdin as string.

**Intermediate Level**: Strip and validate; CLI tools compose with `argparse` instead for production CLIs.

**Expert Level**: Non-interactive environments (Docker, CI) may lack stdin—avoid blocking `input` in servers.

```python
# Beginner
# name = input("Name: ")  # uncomment in terminal script

# Intermediate: validation loop (conceptual)
def ask_int(prompt):
    while True:
        s = input(prompt)
        if s.isdigit():
            return int(s)
        print("digits only")

# Expert: prefer argparse for services
# python service.py --port 8080
```

#### Key Points

- `input` evaluates in Python 2 `raw_input` sense; Python 3 is always string.

---

### 21.7.8 `print()`

**Beginner Level**: Writes to stdout.

**Intermediate Level**: `sep`, `end`, `file`, `flush` for structured logs during development.

**Expert Level**: Services should use `logging` module; `print` to stdout is fine for CLIs and quick scripts.

```python
# Beginner
print("hello", "world")

# Intermediate: CSV-like quick dump
print("2025-01-01", "sale", 19.99, sep="|", flush=True)

# Expert: redirect to StringIO for tests
import io

buf = io.StringIO()
print("x", file=buf)
print(buf.getvalue())
```

#### Key Points

- `print` is not thread-safe with partial line interleaving in some hosts—logging handles better.

---

## 21.8 Introspection Attributes and `inspect`

### 21.8.1 `__doc__`

**Beginner Level**: String documentation under a function or class (docstring).

**Intermediate Level**: Tools like Sphinx extract `__doc__` for API docs.

**Expert Level**: `help()` uses `__doc__`; keep first line as summary per PEP 257.

```python
# Beginner
def add(a, b):
    """Return sum of a and b."""
    return a + b

print(add.__doc__)

# Intermediate: attach to class
class Model:
    """ORM row wrapper."""
    pass

# Expert: runtime doc for dynamic functions
add.__doc__ = "Patched documentation"
```

#### Key Points

- Docstrings are runtime attributes—keep them honest with behavior.

---

### 21.8.2 `__name__`

**Beginner Level**: Function/class/module name as string.

**Intermediate Level**: Logging format `%(name)s` for module loggers uses qualified names.

**Expert Level**: Decorators should use `functools.wraps` to preserve `__name__`.

```python
# Beginner
def f():
    pass

print(f.__name__)

# Intermediate: dispatch table
registry = {}

def route(name):
    def deco(fn):
        registry[name] = fn
        fn.__name__ = name
        return fn
    return deco

# Expert: wraps
import functools

def logged(fn):
    @functools.wraps(fn)
    def inner(*a, **k):
        print(fn.__name__)
        return fn(*a, **k)
    return inner
```

#### Key Points

- Modules have `__name__ == "__main__"` when executed as script.

---

### 21.8.3 `__module__`

**Beginner Level**: Name of module where class/function was defined.

**Intermediate Level**: Serialization frameworks use it to locate picklable classes.

**Expert Level**: Dynamic creation may set `__module__` manually for pickling.

```python
# Beginner
import json as js
print(js.dumps.__module__)

# Intermediate: pydantic/dataclass style reflection
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

print(Point.__module__)
```

#### Key Points

- Changing `__module__` affects import paths in tools.

---

### 21.8.4 `__dict__`

**Beginner Level**: Namespace mapping for objects with arbitrary attributes.

**Intermediate Level**: Class `__dict__` holds methods and descriptors.

**Expert Level**: Metaclasses manipulate `__dict__` at class creation.

```python
# Beginner
class C:
    a = 1

print(C.__dict__["a"])

# Intermediate: instance dict
c = C()
c.b = 2
print(c.__dict__)

# Expert: mappingproxy is read-only view on class dict
print(type(C.__dict__))
```

#### Key Points

- Not all instances have `__dict__` (`__slots__`).

---

### 21.8.5 `dir()` for introspection (summary)

**Beginner Level**: Already covered—lists attributes.

**Intermediate Level**: Combine with `[n for n in dir(x) if not n.startswith("_")]`.

**Expert Level**: Filter callables with `callable(getattr(x, n))` for plugin UIs.

```python
# Beginner / Intermediate
def public_api(obj):
    return [n for n in dir(obj) if not n.startswith("_")]
```

#### Key Points

- `dir` is not a complete enumeration of all getattr-able attributes.

---

### 21.8.6 `inspect` module

**Beginner Level**: `inspect.signature(f)` shows parameters.

**Intermediate Level**: `getsource`, `getfile`, `ismethod`, `isfunction` for tooling.

**Expert Level**: Frameworks build dependency injection by reading signatures; FastAPI-style binding.

```python
import inspect

# Beginner
def api(user_id: int, debug: bool = False):
    pass

print(inspect.signature(api))

# Intermediate: unwrap decorators
print(inspect.unwrap(api))

# Expert: parameter kinds
for name, p in inspect.signature(api).parameters.items():
    print(name, p.kind, p.default)
```

#### Key Points

- Prefer `inspect.signature` over manual `__code__.co_varnames`.

---

## Topic Key Points

- Built-ins are fast, well-tested, and idiomatic—reach for them before custom loops.
- Type checks in libraries should favor `isinstance` and ABCs.
- Dynamic execution (`eval`/`exec`) is almost never appropriate on untrusted input.
- Iteration tools (`map`, `filter`, `zip`) are lazy; mind memory and length mismatches.
- Introspection supports frameworks, tests, and documentation—stabilize public `__doc__` and names.

## Best Practices

- Whitelist dynamic `getattr`/`setattr` attribute names in web-facing code.
- Use `math.fsum` and `Decimal` when financial or numeric stability matters more than `sum`/`round` on binary floats.
- Prefer `logging` over `print` in long-running servers; structure JSON logs for observability.
- When subclassing, use `super()` and document cooperative patterns.
- Use `zip(..., strict=True)` when parallel iterables must align.
- Replace risky `eval` with `ast.literal_eval` or parsers.
- Implement meaningful `__repr__` for models and errors.

## Common Mistakes to Avoid

- Using `type(x) is list` and rejecting valid subclasses.
- Calling `len` on a generator or infinite iterator.
- Assuming `round` on floats is exact for currency.
- Using `hasattr` on properties with side effects without understanding descriptor invocation.
- Mutating `locals()` expecting persistent changes.
- Feeding user input to `eval`/`exec`/`compile`.
- Ignoring `StopIteration` handling when writing manual iterators.
- Using `id` or default object `hash` for security-sensitive deduplication.
- Forgetting that `sum` starts at `0` and thus `sum([])` is `0`, which may mask “no data” bugs if not checked separately.
- Using `min`/`max` on empty iterators without `default`.

---

*End of Topic 21 — Built-in Functions.*
