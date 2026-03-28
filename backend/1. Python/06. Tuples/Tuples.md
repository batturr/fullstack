# Tuples in Python

**Tuples** are ordered, **immutable** sequences — ideal for fixed records: **RGB** colors, **(SKU, qty)** pairs in **inventory**, **student** `(id, gpa)` snapshots, **bank** `(swift, branch)` keys, **e-commerce** price points, and **weather** `(station, date)` composite keys.

---

## 📑 Table of Contents

### 6.1 Basics
1. [6.1.1 Creating Tuples](#611-creating-tuples)
2. [6.1.2 Indexing](#612-indexing)
3. [6.1.3 Slicing](#613-slicing)
4. [6.1.4 Immutability](#614-immutability)
5. [6.1.5 Single-Element Tuple](#615-single-element-tuple)
6. [6.1.6 Empty Tuple](#616-empty-tuple)

### 6.2 Methods and Unpacking
7. [6.2.1 count](#621-count)
8. [6.2.2 index](#622-index)
9. [6.2.3 Tuple Unpacking](#623-tuple-unpacking)
10. [6.2.4 Multiple Assignment](#624-multiple-assignment)
11. [6.2.5 Extended Unpacking with *](#625-extended-unpacking-with-)

### 6.3 Operations
12. [6.3.1 Concatenation](#631-concatenation)
13. [6.3.2 Repetition](#632-repetition)
14. [6.3.3 Membership](#633-membership)
15. [6.3.4 Comparison](#634-comparison)
16. [6.3.5 Iteration](#635-iteration)

### 6.4 Tuples vs Lists
17. [6.4.1 Immutability Benefits](#641-immutability-benefits)
18. [6.4.2 Performance Characteristics](#642-performance-characteristics)
19. [6.4.3 Hashing and dict Keys](#643-hashing-and-dict-keys)
20. [6.4.4 When to Use Tuple vs List](#644-when-to-use-tuple-vs-list)
21. [6.4.5 namedtuple](#645-namedtuple)

### 6.5 Advanced
22. [6.5.1 Tuples as dict Keys](#651-tuples-as-dict-keys)
23. [6.5.2 Function Return Values](#652-function-return-values)
24. [6.5.3 Unpacking in for Loops](#653-unpacking-in-for-loops)
25. [6.5.4 Starred Unpacking in Calls](#654-starred-unpacking-in-calls)
26. [6.5.5 Tuple in Type Hints](#655-tuple-in-type-hints)
27. [6.5.6 namedtuple vs dataclass](#656-namedtuple-vs-dataclass)
28. [6.5.7 Immutable API Conventions](#657-immutable-api-conventions)

- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 6.1.1 Creating Tuples

### Key Points

- `()` or `tuple()`
- Comma creates tuple
- `tuple(iterable)`

**Beginner Level:** Build `(sku, qty)` for **inventory**.

**Intermediate Level:** Materialize **student** rows from a cursor.

**Expert Level:** Use **`tuple[str, int]`** for fixed-shape typing.

```python
pair = ("A1", 3)
print(pair)
```

---

## 6.1.2 Indexing

### Key Points

- 0-based
- negative indices
- IndexError when OOB

**Beginner Level:** Read fields from a **weather** `(min, max, avg)` tuple.

**Intermediate Level:** Index **bank** SWIFT components.

**Expert Level:** Guard indices when parsing external **API** payloads.

```python
t = (10, 20, 30)
print(t[0], t[-1])
```

---

## 6.1.3 Slicing

### Key Points

- Half-open `[i:j)`
- New tuple
- step supported

**Beginner Level:** Take a window of **e-commerce** price history.

**Intermediate Level:** Slicing returns a new immutable view of data.

**Expert Level:** Cost is O(k) for k elements copied.

```python
print((0, 1, 2, 3)[1:3])
```

---

## 6.1.4 Immutability

### Key Points

- No `t[i] = x`
- Rebinding name is OK
- Inner mutables can change

**Beginner Level:** Share an **RGB** triple safely across functions.

**Intermediate Level:** A tuple may contain a **list** — the list can mutate.

**Expert Level:** For **dict keys**, every nested part must be hashable.

```python
t = (1, [2])
t[1].append(3)
print(t)
```

---

## 6.1.5 Single-Element Tuple

### Key Points

- Trailing comma `(x,)`
- `(x)` is just parentheses

**Beginner Level:** Return a single **product** id as a tuple for a uniform API.

**Intermediate Level:** Strings in parens stay strings without comma.

**Expert Level:** Generators emitting one-tuple need explicit comma.

```python
one = ("only",)
print(type(one))
```

---

## 6.1.6 Empty Tuple

### Key Points

- `()` literal
- `tuple()`

**Beginner Level:** Represent “no segments” in a path builder.

**Intermediate Level:** Base case in recursive algorithms.

**Expert Level:** Typing advanced empty tuple forms.

```python
empty = ()
print(len(empty))
```

---

## 6.2.1 count

### Key Points

- Linear scan
- Uses `==`

**Beginner Level:** Count how many times a **grade** code appears.

**Intermediate Level:** Fine for tiny tuples.

**Expert Level:** Use **`Counter`** for large multisets.

```python
print((1, 1, 2).count(1))
```

---

## 6.2.2 index

### Key Points

- First match
- `ValueError` if missing
- start/end optional

**Beginner Level:** Find a column index in a small header tuple.

**Intermediate Level:** Prefer **dict** maps for large schemas.

**Expert Level:** Multiple hits: use **enumerate**.

```python
print(("a", "b", "c").index("b"))
```

---

## 6.2.3 Tuple Unpacking

### Key Points

- Parallel assignment
- Length must match
- Readable names

**Beginner Level:** Unpack **lat, lon** for a map pin.

**Intermediate Level:** Nested structures for tree tuples `(v, left, right)`.

**Expert Level:** Combine with `*` rest patterns.

```python
x, y = (1, 2)
print(x + y)
```

---

## 6.2.4 Multiple Assignment

### Key Points

- Same semantics as unpacking
- RHS can be implicit tuple

**Beginner Level:** Swap two **student** ranks without temp.

**Intermediate Level:** Multiple returns from a function.

**Expert Level:** Document tuple field order in docstrings.

```python
a, b = 1, 2
a, b = b, a
print(a, b)
```

---

## 6.2.5 Extended Unpacking with *

### Key Points

- `*rest` captures remainder
- At most one starred target

**Beginner Level:** Split **log** tuple into head, middle, tail.

**Intermediate Level:** Ignore middle with conventional `_` names.

**Expert Level:** Advanced: PEP 448 unpacking rules.

```python
first, *mid, last = (1, 2, 3, 4)
print(mid)
```

---

## 6.3.1 Concatenation

### Key Points

- `+` builds new tuple
- O(n+m)

**Beginner Level:** Join route segments as tuples.

**Intermediate Level:** Many concats in a loop → accumulate list then `tuple()`.

**Expert Level:** Functional composition of immutable paths.

```python
print((1, 2) + (3,))
```

---

## 6.3.2 Repetition

### Key Points

- `* n` repeats
- `n=0` gives empty

**Beginner Level:** Repeat a **status** marker in CLI output.

**Intermediate Level:** Watch memory if `n` is huge.

**Expert Level:** Mutable element repeated shares references.

```python
print((0,) * 3)
```

---

## 6.3.3 Membership

### Key Points

- `in` is O(n) for tuple

**Beginner Level:** Check a small static allowlist of tuples.

**Intermediate Level:** Frequent checks → **`set`** of tuples.

**Expert Level:** Set of tuples for deduped **inventory** pairs.

```python
pairs = {(1, 2), (3, 4)}
print((1, 2) in pairs)
```

---

## 6.3.4 Comparison

### Key Points

- Lexicographic
- Elementwise
- Recursive for nested

**Beginner Level:** Compare **version** tuples `(major, minor, patch)`.

**Intermediate Level:** Sort **student** keys without a class.

**Expert Level:** Beware **NaN** in float elements.

```python
print((1, 2) < (1, 3))
```

---

## 6.3.5 Iteration

### Key Points

- `for x in t`
- Immutable iteration is read-only safe

**Beginner Level:** Loop **RGB** channels.

**Intermediate Level:** Zip tuple with parallel lists.

**Expert Level:** Concurrent readers need no locks for tuple content.

```python
for v in (9, 8, 7):
    print(v)
```

---

## 6.4.1 Immutability Benefits

### Key Points

- Hashable if elements hashable
- Easy to share

**Beginner Level:** Use `(city, date)` as **weather** cache key.

**Intermediate Level:** Pass config tuples across **threads**.

**Expert Level:** Immutability reduces defensive copying.

```python
cache = {}
cache[("SEA", 1)] = 12
print(cache[("SEA", 1)])
```

---

## 6.4.2 Performance Characteristics

### Key Points

- Small tuples are cheap in CPython
- Struct-like layout

**Beginner Level:** Micro-optimize hot **inventory** paths.

**Intermediate Level:** Profile tuple vs list in your workload.

**Expert Level:** Numeric bulk data → **array** / **NumPy**.

```python
import sys
print(sys.getsizeof((1, 2, 3)))
```

---

## 6.4.3 Hashing and dict Keys

### Key Points

- Every item must be hashable
- `frozenset` allowed inside

**Beginner Level:** Composite **bank** key `(customer_id, currency)`.

**Intermediate Level:** Never put a **list** inside a key tuple.

**Expert Level:** Custom objects in keys need stable **`__hash__`**.

```python
d = {}
d[(1, 'a')] = True
print(d)
```

---

## 6.4.4 When to Use Tuple vs List

### Key Points

- Fixed shape → tuple
- Growing homogeneous → list

**Beginner Level:** **Cart** lines change → list; **point** `(x,y)` → tuple.

**Intermediate Level:** API stability: tuple signals read-only bundle.

**Expert Level:** Refactor growing tuples into objects or dicts.

```python
# list=cart items; tuple=coordinate
```

---

## 6.4.5 namedtuple

### Key Points

- `collections.namedtuple`
- Field names
- `_replace` for shallow copy with change

**Beginner Level:** Name fields of an **inventory** move `(sku, src, dst)`.

**Intermediate Level:** Readable versus index magic.

**Expert Level:** Heavy apps migrate to **dataclass**.

```python
from collections import namedtuple
M = namedtuple('M', 'sku q')
m = M('A1', 2)
print(m.q)
```

---

## 6.5.1 Tuples as dict Keys

### Key Points

- Natural composite keys
- Normalize text first

**Beginner Level:** **E-commerce** `(order_id, line_no)` mapping.

**Intermediate Level:** Unicode NFC for string pieces of keys.

**Expert Level:** Avoid enormous keys — memory and hashing cost.

```python
lines = {}
lines[(42, 1)] = 'sku-X'
print(lines[(42, 1)])
```

---

## 6.5.2 Function Return Values

### Key Points

- `(a, b)` multiple values
- Unpack at callsite

**Beginner Level:** Return `(success, message)` from **student** import.

**Intermediate Level:** Public libs prefer **`NamedTuple`**.

**Expert Level:** Many fields → small object (RORO pattern).

```python
def div7(n):
    return n // 7, n % 7
q, r = div7(23)
print(q, r)
```

---

## 6.5.3 Unpacking in for Loops

### Key Points

- `for a, b in rows:`

**Beginner Level:** Iterate **SKU, qty** pairs.

**Intermediate Level:** **Bank** `(date, amount)` rows.

**Expert Level:** Nested tuples mirror nested loops readability.

```python
for sku, q in (("A", 1), ("B", 2)):
    print(sku, q)
```

---

## 6.5.4 Starred Unpacking in Calls

### Key Points

- `f(*t)` spreads tuple

**Beginner Level:** Forward args to **max**/**min**.

**Intermediate Level:** Combine with kwargs `**dict`.

**Expert Level:** Typing with **`Unpack`** for variadic tuples (advanced).

```python
def add(a, b, c):
    return a + b + c
print(add(*(1, 2, 3)))
```

---

## 6.5.5 Tuple in Type Hints

### Key Points

- `tuple[int, str]` fixed arity
- `tuple[int, ...]` homogeneous variable

**Beginner Level:** Annotate **sensor** `(id, temp_c)`.

**Intermediate Level:** Variable-length int tuple for vector.

**Expert Level:** **`typing.ReadOnly`** for immutability hints (3.13+).

```python
def read() -> tuple[str, float]:
    return "KSEA", 8.1
```

---

## 6.5.6 namedtuple vs dataclass

### Key Points

- Upgrade path
- `frozen=True` dataclass

**Beginner Level:** Start with **namedtuple** for events.

**Intermediate Level:** Add validation → **dataclass** + `__post_init__`.

**Expert Level:** **Pydantic** models for **API** boundaries.

```python
from dataclasses import dataclass
@dataclass(frozen=True)
class P:
    x: int
    y: int
```

---

## 6.5.7 Immutable API Conventions

### Key Points

- Document order
- Version tuple shape changes

**Beginner Level:** Stable `(data, error)` from internal tools.

**Intermediate Level:** Breaking order → major version bump.

**Expert Level:** Evolving schemas → dict or object, not tuple.

```python
# (ok: bool, detail: str | None)
```

---

## Cross-Domain Recipes

### Inventory: immutable line keys

**Beginner Level:** Use `(warehouse, sku)` tuples as dict keys for quick stock lookup.

```python
stock = {("WH1", "A1"): 40, ("WH1", "B2"): 12}
print(stock[("WH1", "A1")])
```

**Intermediate Level:** Normalize SKU strings (`strip`, `upper`) before placing them inside key tuples so lookups stay consistent.

**Expert Level:** When warehouses exceed memory, shard dicts by warehouse id and keep inner maps of `sku → qty`; tuples still model composite keys at the API layer.

### Student records: sorting and stability

**Beginner Level:** Sort `(name, score)` tuples by score descending using `key=lambda t: t[1], reverse=True`.

**Intermediate Level:** Use tuple comparison for multi-field sorts: `sorted(rows, key=lambda r: (r["year"], r["name"]))`.

**Expert Level:** For international names, sort with `key=lambda r: (r["year"], r["name"].casefold())` and document collation requirements.

### Bank: immutable snapshots

**Beginner Level:** Store posted amounts as `(currency, Decimal)` pairs in audit logs (conceptually immutable).

**Intermediate Level:** Never mutate a tuple that is referenced by multiple threads; publish new tuples for each state change.

**Expert Level:** Align with event-sourcing: events carry tuple-like payloads serialized to JSON arrays; validate on ingest.

### E-commerce: cart line identity

**Beginner Level:** Represent a line as `(product_id, variant_id)` tuple key in a dict mapping to quantity.

**Intermediate Level:** When promotions apply, copy dict of tuple keys before simulation so you do not corrupt the live session.

**Expert Level:** Move to SKUs with full `LineItem` models when discounts, taxes, and bundles require richer behavior than a tuple can express cleanly.

### Weather: station tuples in pipelines

**Beginner Level:** `(station_code, observation_hour)` identifies a bucket for aggregating temperatures.

**Intermediate Level:** Stream processing: emit `(key, value)` tuples between stages; unpack with explicit loops over grouped data.

**Expert Level:** For geospatial grids, tuples of ints `(i, j)` index cells; pair with NumPy arrays rather than nested Python tuples at scale.

### Quick reference: tuple vs list decision tree

```text
Need to grow or shrink the sequence?        → list
Fixed number of fields with mixed types?    → tuple
Must use as dict/set key?                   → tuple (if all parts hashable)
Returning multiple values from function?    → tuple or NamedTuple
Heavy numeric matrix?                       → NumPy / array, not tuple of tuples
```

### Tuple unpacking in `match` (Python 3.10+)

**Beginner Level:** Match a simple `(x, y)` pair from **coordinates**.

```python
point = (3, 4)
match point:
    case (x, y):
        print(x + y)
```

**Intermediate Level:** Match **student** `(id, name, gpa)` rows in a batch processor with a `case` per format version.

**Expert Level:** Combine **guards** (`if`) with tuple patterns for **e-commerce** fulfillment rules; keep patterns readable and covered by tests.

### JSON and tuples

**Beginner Level:** JSON has no tuple type — arrays round-trip as **lists**.

**Intermediate Level:** When loading **bank** config, convert fixed-length lists to tuples if you need hashable keys: `tuple(json.loads("[1,2]"))`.

**Expert Level:** Document schema: some fields are “tuple-shaped” lists in JSON but become `tuple` in Python for immutability at the domain layer.

### `typing.NamedTuple` (quick bridge)

**Beginner Level:** Gives names to tuple fields so `t.sku` works like an object.

```python
from typing import NamedTuple

class Line(NamedTuple):
    sku: str
    qty: int

row = Line("A1", 3)
print(row.sku, row.qty)
```

**Intermediate Level:** Use in **inventory** import pipelines before promoting to full **dataclass** models.

**Expert Level:** `NamedTuple` is still a tuple subclass — keep hashability rules in mind if you use instances as dict keys.

### `collections.namedtuple` `_fields` and `_asdict`

**Beginner Level:** `_fields` lists field names as strings for introspection.

**Intermediate Level:** Convert to plain dict for **logging** or **CSV** headers: `row._asdict()`.

**Expert Level:** For ORM integration, map `_fields` to column names in bulk **ETL** jobs with schema validation.

### Exercise ideas (self-check)

**Beginner Level:** Write a function `clamp_rgb(r, g, b)` that returns a tuple of ints each limited to `0..255`.

**Intermediate Level:** Given a list of **student** `(id, gpa)` tuples, return the id with highest gpa; handle ties by smallest id.

**Expert Level:** Implement an immutable **linked list** using nested tuples `(head, tail_tuple)` and compare memory to a list-based stack for depth `n`.

### One-line reminders

- Tuple: **immutable sequence**, often **heterogeneous**, **hashable** if every item is hashable.
- Comma: **`(x,)`** is a tuple; **`(x)`** is not.
- Unpacking: **`a, b = t`** reads better than magic indices for humans and reviewers.
- When in doubt, name the concept (`LineItem`, `Coordinates`) instead of anonymous tuples in public APIs.

---

## Best Practices

- Use tuples for **fixed-length heterogeneous** records; lists for **mutable** sequences.
- Always write **`(x,)`** for a one-tuple — **`(x)`** is not a tuple.
- Prefer **namedtuple** / **NamedTuple** / **frozen dataclass** over raw index tuples in shared libraries.
- Before using a tuple as a **dict key**, verify **every** element is **hashable**.
- Prefer **unpacking** with meaningful names instead of `t[0]`, `t[1]` without comment.
- Normalize **Unicode** and **case** for string components of composite keys.
- Document return tuples in **docstrings** or replace them with named types as the API matures.
- For large numeric grids, use **array** or **NumPy**, not deep nests of tuples.

---

## Common Mistakes to Avoid

- Omitting the comma in **`(x,)`** and wondering why it is not a tuple.
- Putting **unhashable** values (e.g. **list**) inside tuples used as **set**/**dict** keys.
- Confusing **tuple immutability** with **deep immutability** — inner lists can still change.
- Using tuples for **schemas that change often** — callers break when order shifts.
- Concatenating tuples in a tight loop — **quadratic** copying; buffer in a list first.
- Mixing up **`tuple[int, str]`** (exactly two elements) and **`tuple[int, ...]`** (homogeneous variable length).
- Returning tuples where some slots may be **`None`** without documenting which positions.
- Expecting **total ordering** when tuples contain **float NaN**.

---

## Extended Scenarios

### Inventory pick path

**Beginner Level:** Model a route as `("ZONE-A", "BIN-12", "PICK")`.

**Intermediate Level:** Unpack `(zone, bin, action)` and dispatch to handlers; log each step.

**Expert Level:** Replace with **`frozen dataclass PickStep`** when validation, methods, and JSON schema matter.

### Student leaderboard export

**Beginner Level:** List of `(student_id, score)` tuples.

**Intermediate Level:** Sort with **`key=lambda t: t[1], reverse=True`** for top scores.

**Expert Level:** Stream tuples to **CSV**/**Parquet** without loading all rows into memory where possible.

### Bank rate lookup

**Beginner Level:** Key `(product_code, "USD")` in a dict of rates.

**Intermediate Level:** Add **`tenor`** dimension: `(product, ccy, tenor)`.

**Expert Level:** Back cache with **versioned** tuple keys when rates include **as_of** timestamp for audit.

---

*Tuples model stable, lightweight records — pair them with unpacking and clear naming.*
