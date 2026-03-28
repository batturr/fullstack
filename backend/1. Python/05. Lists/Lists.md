# Lists in Python

**Lists** are ordered, mutable sequences — the workhorse for **inventory** line items, **student** grade arrays, **bank** transaction batches, **e-commerce** cart contents, and **weather** hourly readings.

---

## 📑 Table of Contents

### 5.1 Basics
1. [5.1.1 List Literals](#511-list-literals)
2. [5.1.2 list() Constructor](#512-list-constructor)
3. [5.1.3 Creating from Iterables](#513-creating-from-iterables)
4. [5.1.4 Length len()](#514-length-len)
5. [5.1.5 Positive Indexing](#515-positive-indexing)
6. [5.1.6 Negative Indexing](#516-negative-indexing)
7. [5.1.7 Slicing Basics](#517-slicing-basics)
8. [5.1.8 Slicing with Step](#518-slicing-with-step)
9. [5.1.9 Nested Lists](#519-nested-lists)
10. [5.1.10 References vs Copies (intro)](#5110-references-vs-copies-intro)

### 5.2 Adding and Removing
11. [5.2.1 append](#521-append)
12. [5.2.2 extend](#522-extend)
13. [5.2.3 insert](#523-insert)
14. [5.2.4 remove](#524-remove)
15. [5.2.5 pop](#525-pop)
16. [5.2.6 clear](#526-clear)
17. [5.2.7 del Statement](#527-del-statement)
18. [5.2.8 remove vs pop vs del](#528-remove-vs-pop-vs-del)
19. [5.2.9 Stack and Queue Idioms](#529-stack-and-queue-idioms)
20. [5.2.10 Bulk Deletes and Filters](#5210-bulk-deletes-and-filters)

### 5.3 Searching and Sorting
21. [5.3.1 count](#531-count)
22. [5.3.2 index](#532-index)
23. [5.3.3 sort — In-Place](#533-sort--in-place)
24. [5.3.4 sorted — New List](#534-sorted--new-list)
25. [5.3.5 reverse and reversed](#535-reverse-and-reversed)
26. [5.3.6 key= Function](#536-key-function)
27. [5.3.7 Stable Sort Properties](#537-stable-sort-properties)
28. [5.3.8 Custom Comparators (cmp_to_key)](#538-custom-comparators-cmp_to_key)
29. [5.3.9 bisect Module (overview)](#539-bisect-module-overview)
30. [5.3.10 min, max, any, all on Lists](#5310-min-max-any-all-on-lists)

### 5.4 Iteration
31. [5.4.1 for Loop](#541-for-loop)
32. [5.4.2 while Loop Index](#542-while-loop-index)
33. [5.4.3 enumerate](#543-enumerate)
34. [5.4.4 zip](#544-zip)
35. [5.4.5 List Comprehensions Basics](#545-list-comprehensions-basics)
36. [5.4.6 Comprehensions with Conditional](#546-comprehensions-with-conditional)
37. [5.4.7 Nested Loops in Comprehensions](#547-nested-loops-in-comprehensions)
38. [5.4.8 Index-Based Patterns](#548-index-based-patterns)
39. [5.4.9 Iterating Two Lists in Parallel](#549-iterating-two-lists-in-parallel)
40. [5.4.10 Side Effects in Loops](#5410-side-effects-in-loops)

### 5.5 Operations
41. [5.5.1 Concatenation +](#551-concatenation-)
42. [5.5.2 Repetition *](#552-repetition-)
43. [5.5.3 in and not in](#553-in-and-not-in)
44. [5.5.4 List Comparison](#554-list-comparison)
45. [5.5.5 Unpacking](#555-unpacking)
46. [5.5.6 Starred Expression in Calls](#556-starred-expression-in-calls)

### 5.6 Copying
47. [5.6.1 Reference Assignment](#561-reference-assignment)
48. [5.6.2 Shallow Copy](#562-shallow-copy)
49. [5.6.3 Deep Copy](#563-deep-copy)
50. [5.6.4 Slicing [:] Copy](#564-slicing--copy)
51. [5.6.5 list() Constructor Copy](#565-list-constructor-copy)
52. [5.6.6 copy.copy and copy.deepcopy](#566-copycopy-and-copydeepcopy)

### 5.7 Advanced
53. [5.7.1 map and filter](#571-map-and-filter)
54. [5.7.2 functools.reduce](#572-functoolsreduce)
55. [5.7.3 lambda Expressions](#573-lambda-expressions)
56. [5.7.4 Nested Comprehensions](#574-nested-comprehensions)
57. [5.7.5 Conditional Expressions in Comprehensions](#575-conditional-expressions-in-comprehensions)
58. [5.7.6 Generator Expressions](#576-generator-expressions)

- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---


## 5.1.1 List Literals

### Key Points

- `[]` literal
- Trailing comma OK
- Mixed types allowed

**Beginner Level:** Build a **cart** as a simple list of product names.

**Intermediate Level:** Mixed-type rows appear in legacy **student** imports.

**Expert Level:** Static typing with **`list[str]`** vs **`list[object]`** affects API contracts in large services.

```python
cart = ["mug", "notebook"]
print(cart)
```

---

## 5.1.2 list() Constructor

### Key Points

- `list()` empty
- `list(iter)` materializes
- Consumes iterators

**Beginner Level:** Make a list from **range** for practice.

**Intermediate Level:** Materialize a DB cursor into a list for small result sets.

**Expert Level:** For huge streams, avoid **`list(iter)`** — stream or page instead.

```python
nums = list(range(3))
print(nums)
```

---

## 5.1.3 Creating from Iterables

### Key Points

- `list("abc")` chars
- `split` → list
- Comprehension transforms

**Beginner Level:** Turn a string into a list of characters.

**Intermediate Level:** Parse **inventory** CSV fields into ints.

**Expert Level:** Cap memory with **`itertools.islice`** before **`list`** when sampling.

```python
chars = list("ab")
print(chars)
```

---

## 5.1.4 Length len()

### Key Points

- O(1) for built-in list
- `if not xs:` idiomatic
- Empty vs None differ

**Beginner Level:** Count how many **weather** samples you stored.

**Intermediate Level:** Guard **bank** batch uploads by **`len`**.

**Expert Level:** Custom sequences: document **`__len__`** complexity guarantees.

```python
temps = [20, 21, 19]
print(len(temps))
```

---

## 5.1.5 Positive Indexing

### Key Points

- 0-based
- IndexError if out of range
- Slicing safer

**Beginner Level:** Grab the first **SKU** in a pick list.

**Intermediate Level:** Access **student** rank in sorted array.

**Expert Level:** Bounds-check **API** list responses before `[0]`.

```python
skus = ["A1", "B2"]
print(skus[0])
```

---

## 5.1.6 Negative Indexing

### Key Points

- `-1` last
- Handy for tails
- Same rules as positive for del

**Beginner Level:** Get the most recent **weather** reading.

**Intermediate Level:** Last **order id** in a trail.

**Expert Level:** Combine with slicing for suffix parsers in **e-commerce** URLs.

```python
xs = [1, 2, 3]
print(xs[-1])
```

---

## 5.1.7 Slicing Basics

### Key Points

- Half-open `[i:j)`
- Clips out of range
- Shallow copy of segment

**Beginner Level:** Take the first three **cart** items for a preview.

**Intermediate Level:** Pagination slice `[20:40]` for **inventory**.

**Expert Level:** Use **`slice` objects** when parameters drive dynamic windows.

```python
print([0, 1, 2, 3][1:3])
```

---

## 5.1.8 Slicing with Step

### Key Points

- `[::-1]` reverse
- Step skips
- Empty if impossible

**Beginner Level:** Reverse a **student** code for a quick palindrome check game.

**Intermediate Level:** Every second **sensor** reading.

**Expert Level:** Large step slices still copy elements — NumPy has views.

```python
print([1, 2, 3, 4][::2])
```

---

## 5.1.9 Nested Lists

### Key Points

- Matrix `list[list]`
- Deep copy for independence
- jagged rows OK

**Beginner Level:** Store a small multiplication table.

**Intermediate Level:** Seating chart rows for an exam hall.

**Expert Level:** Numeric linear algebra at scale → **NumPy**.

```python
m = [[1, 2], [3, 4]]
print(m[1][0])
```

---

## 5.1.10 References vs Copies (intro)

### Key Points

- `b = a` aliases
- Mutate via either name
- Later sections deepen

**Beginner Level:** See how two variables point at one **cart**.

**Intermediate Level:** Shared **bank** adjustment list bug.

**Expert Level:** Audit data pipelines for unintended alias mutation.

```python
a = [1, 2]
b = a
b.append(3)
print(a)
```

---

## 5.2.1 append

### Key Points

- O(1) amortized
- Adds one object
- Nested list if you append a list

**Beginner Level:** Add an item to **cart**.

**Intermediate Level:** Buffer **events** in order.

**Expert Level:** Pre-size when length known to reduce reallocations.

```python
xs = []
xs.append("soap")
print(xs)
```

---

## 5.2.2 extend

### Key Points

- Adds each element of iterable
- Not the same as append(list)
- Can extend generator

**Beginner Level:** Merge two **SKU** lists from shipments.

**Intermediate Level:** Flatten one level into working buffer.

**Expert Level:** Extending with generator avoids temp list.

```python
a = [1, 2]
a.extend([3, 4])
print(a)
```

---

## 5.2.3 insert

### Key Points

- O(n) due to shifting
- Negative index supported
- Frequent middle inserts → deque

**Beginner Level:** Put a **VIP** item at front of a tiny queue list.

**Intermediate Level:** Insert column-like data in small **reports**.

**Expert Level:** For priority at scale use **`heapq`**.

```python
xs = [1, 3]
xs.insert(1, 2)
print(xs)
```

---

## 5.2.4 remove

### Key Points

- Removes first match
- ValueError if missing
- Linear scan

**Beginner Level:** Remove one duplicate **student** name by mistake entry.

**Intermediate Level:** Careful in loops — skip bug.

**Expert Level:** Wrap in helper that returns bool found for **API** ergonomics.

```python
xs = [1, 2, 1]
xs.remove(1)
print(xs)
```

---

## 5.2.5 pop

### Key Points

- `pop()` end
- `pop(i)` index
- Returns value

**Beginner Level:** Stack of **undo** actions for a cart editor.

**Intermediate Level:** Never use **`pop(0)`** on big lists habitually.

**Expert Level:** Use **`deque.popleft`** for FIFO in **order** processing.

```python
st = [1, 2]
print(st.pop())
```

---

## 5.2.6 clear

### Key Points

- Removes all
- Same list object
- `del lst[:]` similar

**Beginner Level:** Reset scratch **session** list.

**Intermediate Level:** Clear **cache** list in memory sandbox.

**Expert Level:** Identity-stable clear helps watchers in reactive UIs.

```python
xs = [1, 2]
xs.clear()
print(xs)
```

---

## 5.2.7 del Statement

### Key Points

- `del lst[i]`
- `del lst[i:j]` slice
- Also deletes names

**Beginner Level:** Drop a bad **import** row by index.

**Intermediate Level:** Remove slice of stale **quotes**.

**Expert Level:** Understand O(n) cost shifting elements.

```python
xs = [0, 1, 2]
del xs[0]
print(xs)
```

---

## 5.2.8 remove vs pop vs del

### Key Points

- Value vs index vs slice
- Return value only pop
- Choose by what you know

**Beginner Level:** Pick the right tool in **inventory** maintenance scripts.

**Intermediate Level:** Document team standard in style guide.

**Expert Level:** Domain methods (`cancel_line`) hide choice from callers.

```python
# remove by value; pop by index; del slice
```

---

## 5.2.9 Stack and Queue Idioms

### Key Points

- Stack: append+pop
- Queue: deque
- `pop(0)` O(n)

**Beginner Level:** Implement undo stack for **e-commerce** UI.

**Intermediate Level:** Recognize queue antipattern.

**Expert Level:** **asyncio** queues for services.

```python
st = []
st.append(1)
st.pop()
```

---

## 5.2.10 Bulk Deletes and Filters

### Key Points

- List comp rebuild
- `filter` iterator
- Don't mutate while iterating carelessly

**Beginner Level:** Keep only **active students**.

**Intermediate Level:** Filter **transactions** by type.

**Expert Level:** Generator pipeline for huge files.

```python
nums = [1, 2, 3, 4]
evens = [n for n in nums if n % 2 == 0]
print(evens)
```

---

## 5.3.1 count

### Key Points

- Linear search
- Equality with ==

**Beginner Level:** Count how many times **SKU A1** appears in a manifest.

**Intermediate Level:** Validate duplicate policy.

**Expert Level:** **Counter** for histograms.

```python
print([1, 1, 2].count(1))
```

---

## 5.3.2 index

### Key Points

- First hit
- ValueError
- start/end bounds

**Beginner Level:** Find position of **threshold** crossing in temps.

**Intermediate Level:** Locate header row in parsed table.

**Expert Level:** Multiple hits → loop with **enumerate**.

```python
print(["a", "b"].index("b"))
```

---

## 5.3.3 sort — In-Place

### Key Points

- Returns None
- Stable
- key= and reverse=

**Beginner Level:** Sort **student** rows by GPA descending.

**Intermediate Level:** Sort **inventory** by category then SKU.

**Expert Level:** **operator.itemgetter** for speed.

```python
xs = [3, 1, 2]
xs.sort()
print(xs)
```

---

## 5.3.4 sorted — New List

### Key Points

- Non-mutating
- Any iterable
- key= same as sort

**Beginner Level:** Show sorted **bank** tx view without changing source.

**Intermediate Level:** Immutable audit trail list.

**Expert Level:** Combine with **set** for unique sorted — mind cost.

```python
print(sorted([3, 1, 2]))
```

---

## 5.3.5 reverse and reversed

### Key Points

- `reverse` in-place
- `reversed` iterator
- `[::-1]` copy

**Beginner Level:** Flip **history** for newest-first display.

**Intermediate Level:** Iterate backwards without copy.

**Expert Level:** Choose iterator to save memory on big lists.

```python
xs = [1, 2, 3]
xs.reverse()
print(xs)
```

---

## 5.3.6 key= Function

### Key Points

- DSU pattern internal
- Called once per elt
- lambda or attrgetter

**Beginner Level:** Sort words by length for **search** UI.

**Intermediate Level:** Sort **products** by price.

**Expert Level:** Multi-key: tuple in lambda.

```python
words = ["a", "ccc", "bb"]
words.sort(key=len)
print(words)
```

---

## 5.3.7 Stable Sort Properties

### Key Points

- Equal keys keep order
- Multi-pass sorts rare with tuple keys

**Beginner Level:** Stable tie-break for **student** names.

**Intermediate Level:** Preserve insertion order among equals.

**Expert Level:** Exploit stability in clever algorithms — document heavily.

```python
xs = [(1, "b"), (1, "a")]
xs.sort(key=lambda t: t[0])
print(xs)
```

---

## 5.3.8 Custom Comparators (cmp_to_key)

### Key Points

- Bridge old cmp
- Prefer key=
- functools

**Beginner Level:** Legacy **bank** comparator port.

**Intermediate Level:** Interop with C-style callbacks.

**Expert Level:** Refactor to **key** when possible.

```python
from functools import cmp_to_key
xs = [3, 1, 2]
print(sorted(xs, key=cmp_to_key(lambda a,b: (a>b)-(a<b))))
```

---

## 5.3.9 bisect Module (overview)

### Key Points

- Sorted list maintain
- bisect_left/right
- insort

**Beginner Level:** Keep **timeline** of readings sorted on insert.

**Intermediate Level:** Binary search on array.

**Expert Level:** Consider **bisect** on **array** for compact storage.

```python
import bisect
xs = [1, 3, 5]
bisect.insort(xs, 4)
print(xs)
```

---

## 5.3.10 min, max, any, all on Lists

### Key Points

- key= on min/max
- any/all short-circuit
- empty min raises

**Beginner Level:** Cheapest **product** in a list of dicts.

**Intermediate Level:** Any **alert** flags true?

**Expert Level:** **default** for empty max/min (3.4+).

```python
print(max([2, 9, 3]))
print(any(x > 0 for x in [-1, 0, 3]))
```

---

## 5.4.1 for Loop

### Key Points

- Iterates elements
- No index unless enumerate
- for/else rare

**Beginner Level:** Print each **SKU** in a pick path.

**Intermediate Level:** Accumulate **cart** subtotal.

**Expert Level:** Use **`iter` + sentinel** for unusual streams.

```python
for x in [1, 2, 3]:
    print(x)
```

---

## 5.4.2 while Loop Index

### Key Points

- Manual index
- Mutate while iterate carefully
- Often prefer for

**Beginner Level:** Walk list with index when comparing **i** and **i+1** temps.

**Intermediate Level:** Fix off-by-one with care.

**Expert Level:** Consider **pairwise** from itertools for adjacent pairs.

```python
xs = [10, 20, 30]
i = 0
while i < len(xs):
    print(xs[i])
    i += 1
```

---

## 5.4.3 enumerate

### Key Points

- (i, value)
- start=
- Clean numbering

**Beginner Level:** Number lines in a **student** essay export.

**Intermediate Level:** Stable row ids in **CSV**.

**Expert Level:** Unpack with strict **zip** for parallel lists.

```python
for i, name in enumerate(["A", "B"], start=1):
    print(i, name)
```

---

## 5.4.4 zip

### Key Points

- Stops at shortest
- strict=True 3.10+
- Lazy

**Beginner Level:** Pair **SKU** with **qty** columns.

**Intermediate Level:** Parallel **bank** debit/credit narrations.

**Expert Level:** **zip_longest** for uneven with fill.

```python
print(list(zip([1, 2], ["a", "b"])))
```

---

## 5.4.5 List Comprehensions Basics

### Key Points

- `[expr for x in it]`
- Readable one-liners
- Fast in CPython

**Beginner Level:** Square numbers for a simple chart.

**Intermediate Level:** Parse ints from **inventory** tokens.

**Expert Level:** Keep nesting ≤2 levels for humans.

```python
squares = [n*n for n in range(4)]
print(squares)
```

---

## 5.4.6 Comprehensions with Conditional

### Key Points

- Filter at end `if`
- Value if/else inside expr

**Beginner Level:** Active **students** only.

**Intermediate Level:** Label temps hot/cold.

**Expert Level:** Walrus possible — use sparingly.

```python
evens = [n for n in range(8) if n % 2 == 0]
print(evens)
```

---

## 5.4.7 Nested Loops in Comprehensions

### Key Points

- Rightmost for inner
- Flatten matrix pattern

**Beginner Level:** All **category × region** pairs for a promo grid.

**Intermediate Level:** Cartesian small enumerations.

**Expert Level:** Switch to loops if comprehension spans multiple screens.

```python
pairs = [(i, j) for i in range(2) for j in range(2)]
print(pairs)
```

---

## 5.4.8 Index-Based Patterns

### Key Points

- range(len)
- Adjacency
- Prefer itertools.pairwise

**Beginner Level:** Diff consecutive **weather** points.

**Intermediate Level:** Detect **duplicate** runs by index.

**Expert Level:** NumPy **diff** for numeric vectors.

```python
xs = [1, 4, 6]
print([xs[i+1]-xs[i] for i in range(len(xs)-1)])
```

---

## 5.4.9 Iterating Two Lists in Parallel

### Key Points

- zip primary
- strict length checks
- pad if needed

**Beginner Level:** Combine **name** and **score** lists.

**Intermediate Level:** Merge parallel **CSV** columns.

**Expert Level:** Validate lengths in **ETL** tests.

```python
for n, s in zip(["Ann", "Bo"], [90, 88]):
    print(n, s)
```

---

## 5.4.10 Side Effects in Loops

### Key Points

- Comprehensions ideally pure
- I/O in for loops
- map side effects discouraged

**Beginner Level:** Use a **`for`** loop when printing **receipt** lines.

**Intermediate Level:** Batch **DB** writes in loop with transaction.

**Expert Level:** Linters flag impure comprehensions.

```python
for line in ["a", "b"]:
    print(line.upper())
```

---

## 5.5.1 Concatenation +

### Key Points

- New list
- O(n+m)
- Repeated + quadratic

**Beginner Level:** Merge two small **cohort** lists.

**Intermediate Level:** Combine **wishlist** segments.

**Expert Level:** **itertools.chain** for many lists.

```python
print([1] + [2])
```

---

## 5.5.2 Repetition *

### Key Points

- `[0]*n` zeros
- Mutable inner trap
- Memory blow if n huge

**Beginner Level:** Build a baseline **count** list.

**Intermediate Level:** Separator row of dashes in CLI **reports**.

**Expert Level:** Matrix: list comprehension for independent rows.

```python
print([0] * 5)
```

---

## 5.5.3 in and not in

### Key Points

- O(n) list
- set for many checks
- equality with ==

**Beginner Level:** Check if **coupon** code in small static list.

**Intermediate Level:** Large catalog → **set**.

**Expert Level:** Custom **`__eq__`** affects membership.

```python
print(2 in [1, 2, 3])
```

---

## 5.5.4 List Comparison

### Key Points

- Lexicographic
- Elementwise
- Nested lists recurse

**Beginner Level:** Compare version tuples **(major, minor)**.

**Intermediate Level:** Sort keys without custom class.

**Expert Level:** Beware **NaN** oddities if lists contain floats.

```python
print([1, 2] < [1, 3])
```

---

## 5.5.5 Unpacking

### Key Points

- `a, *rest = xs`
- Extended unpack
- Too few/many → error

**Beginner Level:** Head/tail split of **queue** snapshot.

**Intermediate Level:** First, middle, last in **UI**.

**Expert Level:** PEP 646 variadic typing for advanced APIs.

```python
head, *tail = [1, 2, 3, 4]
print(head, tail)
```

---

## 5.5.6 Starred Expression in Calls

### Key Points

- `f(*args)`
- With kwargs **
- Unpacking

**Beginner Level:** Pass list as positional args to **max**.

**Intermediate Level:** Forward **e-commerce** filters.

**Expert Level:** Combine with **positional-only** rules.

```python
print(max(*[1, 5, 3]))
```

---

## 5.6.1 Reference Assignment

### Key Points

- Alias
- Mutate both
- Pass to functions

**Beginner Level:** Two variables, one **cart** — change hits both.

**Intermediate Level:** Document **mutate vs copy** in function docstrings.

**Expert Level:** Defensive **`list(x)`** at API boundary.

```python
a = [1]
b = a
b.append(2)
print(a)
```

---

## 5.6.2 Shallow Copy

### Key Points

- New container
- Shared elements
- `copy.copy`

**Beginner Level:** Copy **order lines** list — dict rows still shared.

**Intermediate Level:** Understand **JSON** round-trip creates new dicts.

**Expert Level:** Visualize with **diagrams** in onboarding.

```python
import copy
xs = [[1], [2]]
ys = copy.copy(xs)
ys[0].append(9)
print(xs[0])
```

---

## 5.6.3 Deep Copy

### Key Points

- Recursive
- Cycles OK
- Expensive

**Beginner Level:** Independent nested **student** records.

**Intermediate Level:** Simulation branch trees in **risk**.

**Expert Level:** Implement **`__deepcopy__`** when needed.

```python
import copy
xs = [[1], [2]]
zs = copy.deepcopy(xs)
zs[0].append(9)
print(xs[0], zs[0])
```

---

## 5.6.4 Slicing [:] Copy

### Key Points

- Shallow
- Idiomatic
- Same as copy for list

**Beginner Level:** Quick duplicate before **sort** experiment.

**Intermediate Level:** Snapshot for undo buffer.

**Expert Level:** Not deep — document nested risk.

```python
a = [1, 2, 3]
b = a[:]
b.reverse()
print(a, b)
```

---

## 5.6.5 list() Constructor Copy

### Key Points

- Shallow from list
- General iterable copy
- Keys if dict

**Beginner Level:** Copy any iterable to list.

**Intermediate Level:** `list(dict)` gives keys only.

**Expert Level:** Use in APIs accepting sequences.

```python
a = [1, 2]
b = list(a)
b.append(3)
print(a)
```

---

## 5.6.6 copy.copy and copy.deepcopy

### Key Points

- Module functions
- Works on objects
- memo dict

**Beginner Level:** Copy custom **line item** objects.

**Intermediate Level:** Graph structures with cycles.

**Expert Level:** Profile **deepcopy** on big trees.

```python
import copy
class N:
    def __init__(self, v):
        self.v = v
a = N([1])
b = copy.deepcopy(a)
b.v.append(2)
print(a.v, b.v)
```

---

## 5.7.1 map and filter

### Key Points

- Lazy iterators
- Prefer comprehension often
- Existing callable

**Beginner Level:** Stringify a list of **order ids**.

**Intermediate Level:** Filter **paid** transactions.

**Expert Level:**  **`starmap`** for zipped args.

```python
print(list(map(str, [1, 2, 3])))
```

---

## 5.7.2 functools.reduce

### Key Points

- Fold
- Initial value
- Often clearer as for-loop

**Beginner Level:** Product of **probabilities** toy example.

**Intermediate Level:** Custom **bank** rollup (with care).

**Expert Level:** **itertools.accumulate** alternative.

```python
from functools import reduce
import operator
print(reduce(operator.mul, [2, 3, 4], 1))
```

---

## 5.7.3 lambda Expressions

### Key Points

- Single expression
- Anonymous
- Late binding gotcha

**Beginner Level:** Inline **sort** key for **SKU** length.

**Intermediate Level:** GUI callbacks one-liners.

**Expert Level:** Capture loop vars with defaults **`lambda x, i=i: ...`**. 

```python
pairs = [(1, "z"), (2, "a")]
print(sorted(pairs, key=lambda t: t[1]))
```

---

## 5.7.4 Nested Comprehensions

### Key Points

- Flatten matrix
- Rightmost inner loop
- Readability limit

**Beginner Level:** Flatten **warehouse** bins to pick list.

**Intermediate Level:** Pairwise combos small **n**.

**Expert Level:** Refactor to functions when eyes hurt.

```python
m = [[1, 2], [3, 4]]
flat = [x for row in m for x in row]
print(flat)
```

---

## 5.7.5 Conditional Expressions in Comprehensions

### Key Points

- `x if p else y` inside
- vs trailing `if` filter

**Beginner Level:** Normalize **None** readings to **0** for charts.

**Intermediate Level:** Tag rows pass/fail.

**Expert Level:** Keep expressions short.

```python
vals = [None, 2, None]
clean = [0 if v is None else v for v in vals]
print(clean)
```

---

## 5.7.6 Generator Expressions

### Key Points

- `(...)` lazy
- Low memory
- Single use iterator

**Beginner Level:** Sum millions of numbers from file without list.

**Intermediate Level:** Feed **`any`** short-circuit.

**Expert Level:** Combine with **pipeline** style; see **itertools** for **chain**/**groupby**; profile **append** vs **insert(0)** and **`in`** on list vs **set**.

```python
print(sum(n for n in range(5)))
```

---


## Best Practices

- Prefer **list comprehensions** when they fit on one screen; otherwise use explicit loops.
- Use **`collections.deque`** for FIFO queues instead of **`pop(0)`** on large lists.
- For repeated membership checks on large data, convert to **`set`** once.
- Understand **shallow vs deep** copy before mutating nested **cart** or **ledger** structures.
- Use **`sort(key=...)`** and **`sorted`** deliberately — know which mutates.
- Type-hint **`list[str]`** (3.9+) for clarity in **student** and **bank** APIs.
- Document whether functions mutate input lists or return new lists.
- Combine **`zip(..., strict=True)`** (3.10+) to catch length mismatches early.

---

## Common Mistakes to Avoid

- **`[[0]*n]*n`** creates shared inner rows — use a list comprehension for matrices.
- Using the return value of **`.sort()`** (it is **`None`**).
- Removing items from a list while iterating forward without a safe pattern.
- Using **`in`** on a long list inside a hot loop.
- Confusing **`append`** (one element, possibly nested list) with **`extend`** (flatten one level).
- Assuming **slice assignment** copies deeply — it is shallow for nested mutables.
- **`lambda` in a loop** without default argument capture for changing **`i`**.
- Calling **`deepcopy`** on objects holding sockets, locks, or DB connections.

---

*Lists are Python’s default ordered mutable sequence — pair them with the right algorithms and containers.*
