# Dictionaries in Python

**Dictionaries** map **keys** to **values** with fast average **O(1)** lookup. They power **inventory** SKU maps, **student** id indexes, **bank** account registries, **e-commerce** product catalogs, and **weather** station tables.

---

## 📑 Table of Contents

### 7.1 Basics
1. [7.1.1 Creating Dicts](#711-creating-dicts)
2. [7.1.2 Keys and Hashing](#712-keys-and-hashing)
3. [7.1.3 Values](#713-values)
4. [7.1.4 Accessing — [] and get](#714-accessing---and-get)
5. [7.1.5 len and Truthiness](#715-len-and-truthiness)
6. [7.1.6 Modifying and Overwriting](#716-modifying-and-overwriting)
7. [7.1.7 Deleting — del, pop, clear](#717-deleting--del-pop-clear)

### 7.2 Methods
8. [7.2.1 keys, values, items](#721-keys-values-items)
9. [7.2.2 get](#722-get)
10. [7.2.3 pop and popitem](#723-pop-and-popitem)
11. [7.2.4 clear](#724-clear)
12. [7.2.5 update](#725-update)
13. [7.2.6 setdefault](#726-setdefault)
14. [7.2.7 fromkeys](#727-fromkeys)
15. [7.2.8 copy](#728-copy)
16. [7.2.9 setdefault vs defaultdict](#729-setdefault-vs-defaultdict)

### 7.3 Iteration
17. [7.3.1 Iterating Keys](#731-iterating-keys)
18. [7.3.2 Iterating Values](#732-iterating-values)
19. [7.3.3 Iterating Items](#733-iterating-items)
20. [7.3.4 Dict Comprehensions](#734-dict-comprehensions)
21. [7.3.5 Conditional Dict Comprehensions](#735-conditional-dict-comprehensions)

### 7.4 Operations
22. [7.4.1 Membership on Keys](#741-membership-on-keys)
23. [7.4.2 Merging — | and |= (3.9+)](#742-merging--and--39)
24. [7.4.3 Merging — ** unpacking](#743-merging--unpacking)
25. [7.4.4 Shallow Copy Behavior](#744-shallow-copy-behavior)
26. [7.4.5 Nested Dicts](#745-nested-dicts)
27. [7.4.6 Unpacking Dict into kwargs](#746-unpacking-dict-into-kwargs)
28. [7.4.7 Comparison](#747-comparison)

### 7.5 Advanced
29. [7.5.1 collections.defaultdict](#751-collectionsdefaultdict)
30. [7.5.2 collections.OrderedDict](#752-collectionsordereddict)
31. [7.5.3 collections.Counter](#753-collectionscounter)
32. [7.5.4 collections.ChainMap](#754-collectionschainmap)
33. [7.5.5 Dict as Object Bag — pattern](#755-dict-as-object-bag--pattern)
34. [7.5.6 __missing__ on subclasses](#756-__missing__-on-subclasses)
35. [7.5.7 PEP 584 union operators](#757-pep-584-union-operators)
36. [7.5.8 TypedDict and schemas](#758-typeddict-and-schemas)
37. [7.5.9 Pydantic / dataclass migration](#759-pydantic--dataclass-migration)
38. [7.5.10 Serialization — JSON](#7510-serialization--json)

- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 7.1.1 Creating Dicts

### Key Points

- `{}` or `dict()`
- `dict(a=1)` kwargs
- `dict.fromkeys`

**Beginner Level:** Map **SKU → qty** for **inventory**.

**Intermediate Level:** Build from pairs `dict([('a',1)])`.

**Expert Level:** Literal merging `{**a, **b}` and `|` operator.

```python
stock = {"A1": 10, "B2": 3}
print(stock["A1"])
```

---

## 7.1.2 Keys and Hashing

### Key Points

- Keys must be hashable
- str, int, tuple of immutables
- no list key

**Beginner Level:** Use **student** `id` str as key.

**Intermediate Level:** Composite tuple key `(day, city)`.

**Expert Level:** Custom class keys need **`__hash__`/`__eq__`** contract.

```python
d = {("k", 1): True}
print(d)
```

---

## 7.1.3 Values

### Key Points

- Any object
- Duplicates allowed
- Values unhashable OK

**Beginner Level:** Store **product** dicts as values.

**Intermediate Level:** List of **transactions** per account.

**Expert Level:** Huge values — consider external store + id in dict.

```python
catalog = {"p1": {"price": 9.99}}
print(catalog["p1"]["price"])
```

---

## 7.1.4 Accessing — [] and get

### Key Points

- `d[k]` raises KeyError
- `get(k, default)` silent

**Beginner Level:** Fetch **weather** for city.

**Intermediate Level:** Use **get** when missing is normal.

**Expert Level:** Default factories via **setdefault** or **defaultdict**.

```python
temps = {"SEA": 12}
print(temps.get("PDX", "n/a"))
```

---

## 7.1.5 len and Truthiness

### Key Points

- `len(d)` key count
- empty dict falsy

**Beginner Level:** Check **cart** has items.

**Intermediate Level:** Guard **`if not config:`**.

**Expert Level:** Distinguish empty dict vs **None** sentinel.

```python
cfg = {}
print(bool(cfg), len(cfg))
```

---

## 7.1.6 Modifying and Overwriting

### Key Points

- `d[k]=v` upserts
- same as update

**Beginner Level:** Update **stock** after sale.

**Intermediate Level:** Batch assign in loops with care for perf.

**Expert Level:** Atomicity with transactions in **DB** layer, not dict alone.

```python
stock = {"A": 1}
stock["A"] = 2
print(stock)
```

---

## 7.1.7 Deleting — del, pop, clear

### Key Points

- `del d[k]`
- `pop` returns
- `popitem` LIFO 3.7+

**Beginner Level:** Remove **coupon** after use.

**Intermediate Level:** `pop` gives value or default.

**Expert Level:** `popitem` for LIFO stack of pairs.

```python
d = {"x": 1}
print(d.pop("x"))
print(d)
```

---

## 7.2.1 keys, values, items

### Key Points

- View objects
- Dynamic
- list() to snapshot

**Beginner Level:** Loop **SKU** keys.

**Intermediate Level:** Iterate **items** for both parts.

**Expert Level:** Views reflect live dict — copy if mutating dict while iterating.

```python
for k, v in {"a": 1}.items():
    print(k, v)
```

---

## 7.2.2 get

### Key Points

- No KeyError
- default None
- common in counting

**Beginner Level:** Optional **middle name** field.

**Intermediate Level:** Prefer explicit **None** checks when 0 is valid.

**Expert Level:** Combine with **`collections.Counter`** for histograms.

```python
print({"a": 1}.get("b", 0))
```

---

## 7.2.3 pop and popitem

### Key Points

- `pop(k, default)`
- `popitem()`

**Beginner Level:** Consume **task** queue entries.

**Intermediate Level:** LIFO eviction patterns.

**Expert Level:** Thread safety — dict ops not atomic across threads without lock.

```python
d = {"a": 1, "b": 2}
print(d.pop("a"), d)
```

---

## 7.2.4 clear

### Key Points

- Remove all keys
- keep same dict object

**Beginner Level:** Reset **session** scratch dict.

**Intermediate Level:** vs reassign `{}` — watchers see identity.

**Expert Level:** Clear large dict to free references for GC.

```python
d = {"a": 1}
d.clear()
print(d)
```

---

## 7.2.5 update

### Key Points

- Merge in place
- accepts mapping or iterable of pairs
- kwargs

**Beginner Level:** Apply **price** patch dict to catalog.

**Intermediate Level:** Last key wins on conflict.

**Expert Level:** Prefer `|=` for clarity in 3.9+.

```python
a = {"x": 1}
a.update({"y": 2})
print(a)
```

---

## 7.2.6 setdefault

### Key Points

- Insert default if missing
- returns value

**Beginner Level:** Initialize **list** values for grouping.

**Intermediate Level:** Often clearer: **defaultdict**.

**Expert Level:** Race conditions under concurrency — use locks.

```python
g = {}
g.setdefault("k", []).append(1)
print(g)
```

---

## 7.2.7 fromkeys

### Key Points

- Shared default reference trap
- use for immutable defaults

**Beginner Level:** Initialize **flags** to False per **SKU**.

**Intermediate Level:** Never `fromkeys(keys, [])` — shared list!

**Expert Level:** Use dict comp `{k: [] for k in keys}`.

```python
print(dict.fromkeys(["a", "b"], 0))
```

---

## 7.2.8 copy

### Key Points

- Shallow copy
- `dict.copy` or `dict(d)`

**Beginner Level:** Snapshot **cart** top-level.

**Intermediate Level:** Nested dicts still shared.

**Expert Level:** **deepcopy** for deep independence.

```python
a = {"x": {"y": 1}}
b = a.copy()
b["x"]["y"] = 2
print(a["x"]["y"])
```

---

## 7.2.9 setdefault vs defaultdict

### Key Points

- setdefault inline
- defaultdict factory

**Beginner Level:** One-off grouping vs many inserts.

**Intermediate Level:** **inventory** aggregations.

**Expert Level:** defaultdict faster for heavy grouping.

```python
from collections import defaultdict
dd = defaultdict(int)
dd["a"] += 1
print(dd)
```

---

## 7.3.1 Iterating Keys

### Key Points

- `for k in d:`
- `for k in d.keys():` redundant but explicit

**Beginner Level:** List all **student** ids.

**Intermediate Level:** Don’t mutate dict size while iterating keys without care.

**Expert Level:** Py3.7+ insertion order preserved.

```python
for k in {"b": 1, "a": 2}:
    print(k)
```

---

## 7.3.2 Iterating Values

### Key Points

- `d.values()`
- may contain duplicates

**Beginner Level:** Sum all **quantities** if values numeric.

**Intermediate Level:** Values can be large — stream if needed.

**Expert Level:** Combine with **sum** generator.

```python
print(sum({"a": 2, "b": 3}.values()))
```

---

## 7.3.3 Iterating Items

### Key Points

- `items()` best default
- tuple pairs

**Beginner Level:** Format **e-commerce** lines for receipt.

**Intermediate Level:** Avoid repeated **`d[k]`** lookup.

**Expert Level:** Large dict — items() is still efficient.

```python
for sku, q in {"A": 1}.items():
    print(sku, q)
```

---

## 7.3.4 Dict Comprehensions

### Key Points

- `{k: v for ...}`

**Beginner Level:** Map **SKU → price** from list of pairs.

**Intermediate Level:** Transform keys casefold.

**Expert Level:** Readable limits on comprehension depth.

```python
sq = {x: x*x for x in range(4)}
print(sq)
```

---

## 7.3.5 Conditional Dict Comprehensions

### Key Points

- `if` at end
- filter keys/values

**Beginner Level:** Keep **active** students only.

**Intermediate Level:** Drop **None** values.

**Expert Level:** Don’t duplicate business rules hidden only in comp.

```python
d = {k: v for k, v in [("a", 1), ("b", 0)] if v}
```

---

## 7.4.1 Membership on Keys

### Key Points

- `k in d`
- not values by default

**Beginner Level:** Check **coupon** exists.

**Intermediate Level:** `in` on values is O(n) scan.

**Expert Level:** Invert index dict for value lookup if needed.

```python
print("a" in {"a": 1})
```

---

## 7.4.2 Merging — | and |= (3.9+)

### Key Points

- RHS wins on conflict
- immutable | new dict

**Beginner Level:** Overlay **default config** with user **overrides**.

**Intermediate Level:** `|=` mutates left.

**Expert Level:** Typed merging in **settings** layers.

```python
print({"a": 1} | {"b": 2})
```

---

## 7.4.3 Merging — ** unpacking

### Key Points

- `{**a, **b}`
- PEP 448

**Beginner Level:** Compatible with older Python than 3.9.

**Intermediate Level:** Rightmost wins.

**Expert Level:** Dynamic merge from list of dicts reduce.

```python
print({**{"a": 1}, **{"b": 2}})
```

---

## 7.4.4 Shallow Copy Behavior

### Key Points

- Assignment aliases
- copy one level

**Beginner Level:** Two names one **cart** dict.

**Intermediate Level:** Nested share references.

**Expert Level:** **copy.deepcopy** for trees.

```python
a = {"x": 1}
b = a
b["x"] = 2
print(a["x"])
```

---

## 7.4.5 Nested Dicts

### Key Points

- JSON-like trees
- setdefault for auto-vivification

**Beginner Level:** Represent **region → store → sku** **inventory**.

**Intermediate Level:** Careful with **fromkeys**.

**Expert Level:** Consider **Pydantic** for validated trees.

```python
tree = {"US": {"SEA": 1}}
print(tree["US"]["SEA"])
```

---

## 7.4.6 Unpacking Dict into kwargs

### Key Points

- `func(**d)`
- keys must be str identifiers

**Beginner Level:** Build **HTTP** client kwargs.

**Intermediate Level:** Validate keys before unpack to avoid injection.

**Expert Level:** Combine with `*` tuple unpack.

```python
def f(a, b):
    return a + b
print(f(**{"a": 1, "b": 2}))
```

---

## 7.4.7 Comparison

### Key Points

- `==` same keys/values
- order ignored until 3.7+ insertion order in equality? — still value-based

**Beginner Level:** Compare **API** response dicts in tests.

**Intermediate Level:** Floating point tolerance separate.

**Expert Level:** Order-sensitive needs **list** of items.

```python
print({"a": 1} == {"a": 1})
```

---

## 7.5.1 collections.defaultdict

### Key Points

- Factory callable
- no KeyError on missing

**Beginner Level:** Group **orders** by **customer** id.

**Intermediate Level:** Counters and adjacency lists.

**Expert Level:** Pickle considerations with lambda factory.

```python
from collections import defaultdict
g = defaultdict(list)
g["k"].append(1)
print(g)
```

---

## 7.5.2 collections.OrderedDict

### Key Points

- Extra ordering API
- move_to_end

**Beginner Level:** LRU-like structures before **functools.lru_cache** patterns.

**Intermediate Level:** JSON round-trip order tests.

**Expert Level:** Regular dict is ordered since 3.7 — niche now.

```python
from collections import OrderedDict
od = OrderedDict([("a", 1), ("b", 2)])
print(list(od.keys()))
```

---

## 7.5.3 collections.Counter

### Key Points

- Multiset
- most_common

**Beginner Level:** **SKU** frequency in **shipments**.

**Intermediate Level:** Subtract counters for inventory deltas.

**Expert Level:** Elements can be any hashable.

```python
from collections import Counter
c = Counter(["a", "a", "b"])
print(c.most_common(1))
```

---

## 7.5.4 collections.ChainMap

### Key Points

- Search chain of dicts
- no single flat dict

**Beginner Level:** Layer **defaults**, **env**, **CLI** overrides.

**Intermediate Level:** Writes go to first mapping only.

**Expert Level:** Copy-out with `dict(chain)` for mutation isolation.

```python
from collections import ChainMap
cm = ChainMap({"a": 1}, {"b": 2})
print(cm["a"], cm["b"])
```

---

## 7.5.5 Dict as Object Bag — pattern

### Key Points

- `__dict__` style
- simple DTOs

**Beginner Level:** Quick **student** record before dataclass.

**Intermediate Level:** Harder to refactor than attributes.

**Expert Level:** Prefer **dataclass** for IDE help.

```python
student = {"id": "s1", "gpa": 3.5}
print(student["id"])
```

---

## 7.5.6 __missing__ on subclasses

### Key Points

- Hook for defaultdict-like behavior
- return or raise

**Beginner Level:** Lazy **schema** defaults.

**Intermediate Level:** Careful infinite recursion.

**Expert Level:** Document subclass behavior for team.

```python
class D(dict):
    def __missing__(self, k):
        return 0
print(D()["x"])
```

---

## 7.5.7 PEP 584 union operators

### Key Points

- `|` and `|=`
- 3.9+

**Beginner Level:** Immutable merge for **feature flags**.

**Intermediate Level:** Augment **settings** dict.

**Expert Level:** Type checkers understand for TypedDict carefully.

```python
a = {"x": 1}
print(a | {"y": 2})
```

---

## 7.5.8 TypedDict and schemas

### Key Points

- Static keys
- total=False optional

**Beginner Level:** **JSON** shapes for **weather** API.

**Intermediate Level:** mypy/pyright validation.

**Expert Level:** Not runtime validation — use **Pydantic**.

```python
from typing import TypedDict
class T(TypedDict):
    a: int
print(T(a=1))
```

---

## 7.5.9 Pydantic / dataclass migration

### Key Points

- validation
- immutability

**Beginner Level:** Promote dict blobs to **models** in **e-commerce** services.

**Intermediate Level:** **ORM** rows ↔ dict ↔ model pipelines.

**Expert Level:** Version models for **bank** compliance.

```python
# from pydantic import BaseModel
```

---

## 7.5.10 Serialization — JSON

### Key Points

- `json.dumps`/`loads`
- keys str
- datetime not native

**Beginner Level:** Persist **cart** to Redis JSON.

**Intermediate Level:** Custom encoders for **Decimal**.

**Expert Level:** **orjson** for speed in production.

```python
import json
print(json.dumps({"a": 1}))
```

---
## Best Practices

- Default to **`dict.items()`** when you need both key and value in a loop.
- Use **`get`** or **`in`** instead of catching **`KeyError`** when missing keys are expected.
- Never use **`dict.fromkeys(keys, [])`** with a mutable default — each key needs its **own** list.
- Prefer **`collections.Counter`** and **`defaultdict`** over manual **`setdefault`** when patterns repeat.
- Understand **shallow copies** before mutating nested **catalog** or **cart** structures.
- Use **`|`** / **`|=`** (3.9+) or **`{**a, **b}`** for explicit merges with clear precedence rules.
- Move validated **JSON** payloads into **`TypedDict`**, **dataclass**, or **Pydantic** models at system boundaries.
- Document whether functions **mutate** dicts in place or return new dicts — especially in **financial** code.

---

## Common Mistakes to Avoid

- Using **`[]` on a missing key** instead of **`get`** when absence is normal.
- Mutating a dict **while iterating** its **`keys()`/`items()`** without a snapshot (`list(d.items())`).
- Shared **mutable defaults** via **`fromkeys`** or **`setdefault` with `[]`**.
- Assuming **`k in d`** checks values — it checks **keys** only.
- **Unhashable keys** (like **list**) causing **`TypeError`**.
- Deep merges with **`|`** — it is only **shallow**; nested dicts need recursive merge utilities.
- Relying on **dict order** across processes on Python **3.6** dict implementation specifics — target 3.7+.
- **`json`** dumping **Decimal**, **datetime**, or **set** without custom encoders.

---

## Extended Scenarios

### Inventory multi-warehouse

**Beginner Level:** `stock[warehouse][sku] = qty` nested dict (initialize inner dicts carefully).

**Intermediate Level:** `defaultdict(lambda: defaultdict(int))` for two-level counts.

**Expert Level:** Normalize into **database** tables with **ACID** updates; dict as in-memory cache with TTL.

### Student information system

**Beginner Level:** `students[id] = {"name": ..., "gpa": ...}`.

**Intermediate Level:** Validate with **Pydantic** before insert; use **`TypedDict`** for static checks.

**Expert Level:** Row-level security — never pass raw dicts to templates without field allowlists.

### E-commerce session cart

**Beginner Level:** Dict keyed by **product_id** mapping to quantity.

**Intermediate Level:** Merge guest cart with user cart on login using **`|`** with quantity sum logic.

**Expert Level:** **Redis** hash + **JSON** snapshot; handle **race conditions** with **WATCH**/transactions.

---

*Master dicts and your data models stay fast, clear, and easy to evolve.*
