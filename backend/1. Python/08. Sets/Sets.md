# Sets in Python

**Sets** are unordered collections of **unique hashable** elements. They excel at **deduplication**, **membership testing**, and **set algebra** — essential for **inventory** SKU universes, **student** course enrollments, **bank** authorized device ids, **e-commerce** tag filters, and **weather** station id registries.

---

## 📑 Table of Contents

### 8.1 Basics
1. [8.1.1 Creating Sets](#811-creating-sets)
2. [8.1.2 set Literals and {} Gotcha](#812-set-literals-and--gotcha)
3. [8.1.3 Empty set](#813-empty-set)
4. [8.1.4 len](#814-len)
5. [8.1.5 add](#815-add)
6. [8.1.6 remove vs discard](#816-remove-vs-discard)
7. [8.1.7 pop](#817-pop)
8. [8.1.8 clear](#818-clear)

### 8.2 Operations
9. [8.2.1 Union](#821-union)
10. [8.2.2 Intersection](#822-intersection)
11. [8.2.3 Difference](#823-difference)
12. [8.2.4 Symmetric Difference](#824-symmetric-difference)
13. [8.2.5 Method vs Operator Forms](#825-method-vs-operator-forms)
14. [8.2.6 issubset and issuperset](#826-issubset-and-issuperset)
15. [8.2.7 isdisjoint](#827-isdisjoint)
16. [8.2.8 Copying Sets](#828-copying-sets)

### 8.3 Methods and Patterns
17. [8.3.1 Iteration](#831-iteration)
18. [8.3.2 Membership Testing](#832-membership-testing)
19. [8.3.3 Set Comprehensions](#833-set-comprehensions)
20. [8.3.4 Updating In Place](#834-updating-in-place)
21. [8.3.5 update, intersection_update, ...](#835-update-intersection_update-)
22. [8.3.6 copy and frozenset copy](#836-copy-and-frozenset-copy)
23. [8.3.7 frozenset in sets](#837-frozenset-in-sets)
24. [8.3.8 Performance Characteristics](#838-performance-characteristics)

### 8.4 Frozensets
25. [8.4.1 Creating frozenset](#841-creating-frozenset)
26. [8.4.2 Immutable Set](#842-immutable-set)
27. [8.4.3 frozenset as dict Keys](#843-frozenset-as-dict-keys)
28. [8.4.4 Set Operations on frozenset](#844-set-operations-on-frozenset)

### 8.5 Use Cases
29. [8.5.1 Removing Duplicates](#851-removing-duplicates)
30. [8.5.2 Unique Collections](#852-unique-collections)
31. [8.5.3 Fast Membership](#853-fast-membership)
32. [8.5.4 Set Algebra in Business Rules](#854-set-algebra-in-business-rules)
33. [8.5.5 Performance at Scale](#855-performance-at-scale)

- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 8.1.1 Creating Sets

### Key Points

- `set()`
- `set(iterable)`
- dedup on create

**Beginner Level:** Unique **SKU** from a list.

**Intermediate Level:** Parse log lines to set.

**Expert Level:** Unhashable elements → **TypeError**.

```python
print(set([1, 1, 2]))
```

---

## 8.1.2 set Literals and {} Gotcha

### Key Points

- `{1,2,3}`
- `{}` is empty dict
- use `set()` for empty set

**Beginner Level:** Literal set of **tags**.

**Intermediate Level:** Don’t confuse `{}` dict with set.

**Expert Level:** Mixed types if all hashable.

```python
tags = {"sale", "new"}
print(tags)
```

---

## 8.1.3 Empty set

### Key Points

- `set()` only
- `{}` is dict

**Beginner Level:** Start empty **allowed users** set.

**Intermediate Level:** Type annotations `set[str]`.

**Expert Level:** Serialize empty set in JSON as `[]` controversy — document.

```python
s = set()
print(len(s))
```

---

## 8.1.4 len

### Key Points

- Number of unique elements

**Beginner Level:** Count distinct **students** enrolled.

**Intermediate Level:** Large sets — len O(1).

**Expert Level:** Cardinality checks for **alerts**.

```python
print(len({1, 2, 2}))
```

---

## 8.1.5 add

### Key Points

- O(1) average
- ignores duplicate

**Beginner Level:** Add **coupon** to applied set.

**Intermediate Level:** Repeated add safe.

**Expert Level:** Thread safety — use locks.

```python
s = set()
s.add(1)
s.add(1)
print(s)
```

---

## 8.1.6 remove vs discard

### Key Points

- remove KeyError
- discard silent

**Beginner Level:** Strict **inventory** removal vs optional.

**Intermediate Level:** Choose by contract.

**Expert Level:** Log missing removes in **audit** systems.

```python
s = {1}
s.discard(2)
# s.remove(2) would raise
```

---

## 8.1.7 pop

### Key Points

- Arbitrary element
- KeyError if empty

**Beginner Level:** Consume work queue modeled as set (rare).

**Intermediate Level:** Nondeterministic order — document.

**Expert Level:** Prefer **deque** for ordered queue.

```python
s = {1, 2}
print(s.pop(), s)
```

---

## 8.1.8 clear

### Key Points

- Remove all

**Beginner Level:** Reset **session** allowed origins.

**Intermediate Level:** Free references for GC.

**Expert Level:** Same object identity.

```python
s = {1, 2}
s.clear()
print(s)
```

---

## 8.2.1 Union

### Key Points

- `|` or `union`
- all elements from both

**Beginner Level:** Combine **SKU** from two warehouses.

**Intermediate Level:** Dedup automatically.

**Expert Level:** Large unions — consider iterators `chain`.

```python
print({1, 2} | {2, 3})
```

---

## 8.2.2 Intersection

### Key Points

- `&` or `intersection`
- common elements

**Beginner Level:** **Students** taking both courses.

**Intermediate Level:** Filter **products** with all tags.

**Expert Level:** Empty intersection → disjoint.

```python
print({1, 2, 3} & {2, 4})
```

---

## 8.2.3 Difference

### Key Points

- `-` or `difference`
- in A not B

**Beginner Level:** **SKUs** in stock but not on shelf scan.

**Intermediate Level:** Revoked **permissions**.

**Expert Level:** Right-hand side can be any iterable in methods.

```python
print({1, 2, 3} - {2})
```

---

## 8.2.4 Symmetric Difference

### Key Points

- `^`
- in exactly one of A or B

**Beginner Level:** Diff **two days** of **weather** station ids reporting.

**Intermediate Level:** Toggle membership patterns.

**Expert Level:** Method `symmetric_difference`.

```python
print({1, 2} ^ {2, 3})
```

---

## 8.2.5 Method vs Operator Forms

### Key Points

- operators need sets
- methods accept iterables

**Beginner Level:** Pass list to **`union`** without converting.

**Intermediate Level:** `|` requires set operands.

**Expert Level:** Readability vs flexibility.

```python
print({1}.union([1, 2]))
```

---

## 8.2.6 issubset and issuperset

### Key Points

- `<=` `>=`
- proper subset `<`

**Beginner Level:** Check **required tags** ⊆ **product tags**.

**Intermediate Level:** Role hierarchy checks.

**Expert Level:** Frozensets compare too.

```python
print({1, 2}.issubset({1, 2, 3}))
```

---

## 8.2.7 isdisjoint

### Key Points

- No common elements

**Beginner Level:** **Promotions** exclusive regions.

**Intermediate Level:** Fast early exit.

**Expert Level:** Prefer over `not (a & b)` for clarity on large sets.

```python
print({1, 2}.isdisjoint({3, 4}))
```

---

## 8.2.8 Copying Sets

### Key Points

- `set.copy`
- shallow of elements

**Beginner Level:** Snapshot **allowlist**.

**Intermediate Level:** Elements themselves shared if mutable (avoid mutable in sets).

**Expert Level:** **frozenset** copy cheap.

```python
a = {1, 2}
b = a.copy()
b.add(3)
print(a, b)
```

---

## 8.3.1 Iteration

### Key Points

- Order arbitrary
- 3.7+ insertion order CPython for dict; set order implementation-defined

**Beginner Level:** Loop **unique** visitors.

**Intermediate Level:** Don’t rely on order in portable code.

**Expert Level:** Sort output for stable **diffs**.

```python
for x in {3, 1, 2}:
    print(x)
```

---

## 8.3.2 Membership Testing

### Key Points

- `in` O(1) average
- vs list O(n)

**Beginner Level:** Authorize **device** id in huge set.

**Intermediate Level:** Build set once, query many times.

**Expert Level:** Bloom filters for gigantic universes (probabilistic).

```python
ids = {"d1", "d2"}
print("d1" in ids)
```

---

## 8.3.3 Set Comprehensions

### Key Points

- `{expr for x in it}`

**Beginner Level:** Unique first letters of **product** names.

**Intermediate Level:** Filter + map concisely.

**Expert Level:** Don’t nest too deep.

```python
s = {x % 2 for x in range(10)}
print(s)
```

---

## 8.3.4 Updating In Place

### Key Points

- `|=` `&=` `-=` `^=`

**Beginner Level:** Accumulate **tags** from multiple sources.

**Intermediate Level:** Intersect filters in UI.

**Expert Level:** Augmented operators mutate.

```python
a = {1, 2}
a |= {2, 3}
print(a)
```

---

## 8.3.5 update, intersection_update, ...

### Key Points

- Method forms take iterables

**Beginner Level:** Bulk add from **generator**.

**Intermediate Level:** Read method names in **IDE**.

**Expert Level:** Consistent with dict **`update`** mental model.

```python
s = {1}
s.update([2, 3])
print(s)
```

---

## 8.3.6 copy and frozenset copy

### Key Points

- `copy` method
- frozenset immutable so copy is cheap/no-op new object

**Beginner Level:** Pass copies into untrusted code.

**Intermediate Level:** Immutability aids **hashing**.

**Expert Level:** Deep copy rarely needed for pure sets of immutables.

```python
fs = frozenset({1, 2})
print(fs)
```

---

## 8.3.7 frozenset in sets

### Key Points

- Set of frozensets
- hashable set

**Beginner Level:** Family of **tag sets** as elements.

**Intermediate Level:** Graph edges as frozenset pairs.

**Expert Level:** Powerful but mind readability.

```python
edges = {frozenset({1, 2}), frozenset({2, 3})}
print(len(edges))
```

---

## 8.3.8 Performance Characteristics

### Key Points

- Average O(1)
- worst cases
- memory overhead

**Beginner Level:** Scale **membership** for **fraud** lists.

**Intermediate Level:** Profile vs **Bloom** filter.

**Expert Level:** CPython hash table tuning.

```python
s = set(range(1000))
print(999 in s)
```

---

## 8.4.1 Creating frozenset

### Key Points

- `frozenset(iterable)`
- no literals

**Beginner Level:** Immutable **permissions** bundle.

**Intermediate Level:** From existing set.

**Expert Level:** Empty **`frozenset()`**.

```python
fs = frozenset([1, 2, 1])
print(fs)
```

---

## 8.4.2 Immutable Set

### Key Points

- No add/remove
- hashable if elements hashable

**Beginner Level:** Dict key grouping **tags**.

**Intermediate Level:** Cache keys in **web** app.

**Expert Level:** Compare by value like set.

```python
d = {frozenset({1, 2}): "pair"}
print(d[frozenset({2, 1})])
```

---

## 8.4.3 frozenset as dict Keys

### Key Points

- Nested structures
- JSON limitations

**Beginner Level:** Key by **category ∩ channel** as frozenset.

**Intermediate Level:** Serialize manually.

**Expert Level:** Document encoding for **API**.

```python
key = frozenset({"email", "sms"})
opts = {key: True}
print(opts[key])
```

---

## 8.4.4 Set Operations on frozenset

### Key Points

- Returns new frozenset for many ops
- immutable result

**Beginner Level:** Combine immutable tag groups.

**Intermediate Level:** Algebra same as set.

**Expert Level:** Use when outputs must be keys.

```python
a = frozenset({1, 2})
print(a | frozenset({3}))
```

---

## 8.5.1 Removing Duplicates

### Key Points

- `list(dict.fromkeys(lst))` preserves order
- set(lst) loses order

**Beginner Level:** Dedup **student** ids from messy log.

**Intermediate Level:** Order matters → dict trick.

**Expert Level:** Huge data — generator uniq pipeline.

```python
xs = [1, 2, 2, 3]
print(list(dict.fromkeys(xs)))
```

---

## 8.5.2 Unique Collections

### Key Points

- Maintain uniqueness invariant

**Beginner Level:** Live **SKU** universe.

**Intermediate Level:** Enforce on insert in domain model.

**Expert Level:** DB unique constraints still authoritative.

```python
skus = {"A", "B"}
skus.add("C")
```

---

## 8.5.3 Fast Membership

### Key Points

- O(1) average vs list

**Beginner Level:** **Blacklist** **bank** IPs.

**Intermediate Level:** Preconvert list to set once.

**Expert Level:** Memory trade acceptable for hot paths.

```python
blocked = {"10.0.0.1"}
print("10.0.0.1" in blocked)
```

---

## 8.5.4 Set Algebra in Business Rules

### Key Points

- Union/intersection express OR/AND of tags

**Beginner Level:** **E-commerce** search facets.

**Intermediate Level:** Compliance: required certs ∩ employee certs.

**Expert Level:** Readable business tests.

```python
need = {"id", "addr"}
have = {"id", "phone"}
print(need <= have)
```

---

## 8.5.5 Performance at Scale

### Key Points

- Memory
- hash collisions rare

**Beginner Level:** Millions of **device** tokens in RAM set.

**Intermediate Level:** Shard or external store if too big.

**Expert Level:** Consider **datasketch** for approximate sets.

```python
print(len(set(range(10_000))))
```

---
## Quick Reference — Set Algebra in Words

| Expression | Meaning | Example domain |
|------------|---------|----------------|
| `a \| b` | In **a** or **b** (or both) | Union of **SKU** catalogs |
| `a & b` | In both | **Students** enrolled in two courses |
| `a - b` | In **a** but not **b** | **Permissions** revoked |
| `a ^ b` | In one side only | **Stations** reporting on exactly one day |
| `a <= b` | Every element of **a** in **b** | **Required tags** ⊆ **product** tags |
| `a.isdisjoint(b)` | No overlap | **Promo** regions do not clash |

**Beginner Level:** Read the table aloud when designing **e-commerce** filters.

**Intermediate Level:** Encode rules as small set expressions in unit tests so marketing copy matches code.

**Expert Level:** For trillion-scale universes, sets in RAM are insufficient — use **database** constraints, **Bloom** filters, or **sketches**.

### Optional: mapping sets to JSON

**Beginner Level:** Convert `{"a", "b"}` to `list(sorted(s))` before `json.dumps` for stable output.

**Intermediate Level:** **E-commerce** tag sets in REST APIs often use sorted lists so clients get deterministic documents.

**Expert Level:** For huge sets, avoid materializing full JSON arrays — paginate or expose **search** endpoints instead of dumping membership.

### Set size and `sys.getsizeof` (illustrative)

**Beginner Level:** Bigger sets use more RAM than the elements alone — the hash table has overhead.

**Intermediate Level:** When caching **million-row** **bank** id sets in memory, measure RSS and set **TTL**s.

**Expert Level:** Compare **int** sets vs **str** ids — pointer density and **interning** change footprint; profile on target hardware.

```python
import sys
s = {1, 2, 3}
print(len(s), sys.getsizeof(s))
```

---

## Best Practices

- Build a **set** once, then perform many **`in`** checks — never scan a huge **list** repeatedly.
- Remember **`{}` creates a dict** — use **`set()`** for an empty set.
- Prefer **operators** (`|`, `&`, `-`, `^`) for clarity when both operands are sets; use **methods** when mixing iterables.
- Do not put **unhashable** types (like **dict** or **list**) into sets — use **tuple** or **frozenset** instead.
- For ordered unique sequences, use **`dict.fromkeys`** (3.7+ preserves order) rather than **`set` → list** if order matters.
- Use **`frozenset`** when you need a **set-valued dict key** or a truly immutable set object.
- Document that **set iteration order** is not a portable semantic unless you **sort** explicitly.
- Choose **set algebra** to express **tag**, **role**, and **permission** rules — it keeps **QA** tests readable.

---

## Common Mistakes to Avoid

- Using **`{}`** expecting an empty **set**.
- Putting **lists** or **dicts** into a set — **`TypeError: unhashable type`**.
- Assuming **set iteration order** matches insertion order across implementations or Python versions.
- Using **`remove`** when **`discard`** is safer for optional deletes.
- Intersecting large sets with **`&`** without considering memory — intermediate results materialize.
- Comparing **set** to **list** membership semantics — they differ in complexity and duplicates.
- JSON round-tripping sets — JSON has no set type; use **lists** plus server-side **`set()`**.
- Storing **mutable objects** in sets even if currently hashable (don’t mutate objects that are set members).

---

## Extended Scenarios

### Inventory SKU reconciliation

**Beginner Level:** `warehouse_a - warehouse_b` for SKUs missing in B.

**Intermediate Level:** Three-way compare with **symmetric difference** for mismatches.

**Expert Level:** Stream large SKU files with generators; use **database** `EXCEPT` for truth.

### Student course prerequisites

**Beginner Level:** `required.issubset(completed)`.

**Intermediate Level:** Track **electives** with intersections across departments.

**Expert Level:** Version prerequisite sets per catalog year using **frozenset** keys.

### E-commerce facet filters

**Beginner Level:** Selected brands as a set; intersect product tag sets.

**Intermediate Level:** `isdisjoint` for exclusion filters (no “sale” tag).

**Expert Level:** Precompute **inverted indexes** (tag → product id set) for sub-100ms search.

---

*Sets turn uniqueness and relationships into fast, expressive code — ideal for rules and indexes.*
