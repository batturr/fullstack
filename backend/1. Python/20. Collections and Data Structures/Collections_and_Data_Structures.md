# Collections and Data Structures

Python’s **`collections`** module adds specialized containers beyond built-in `dict`, `list`, and `set`. This guide also covers **`heapq`** and **`bisect`** for priority queues and sorted sequences—grounded in **API rate tracking**, **log aggregation**, **task scheduling**, **caching**, and **file analytics** workflows.

## 📑 Table of Contents

- [20.1 collections Module](#201-collections-module)
  - [namedtuple](#namedtuple)
  - [deque](#deque-overview)
  - [Counter](#counter-overview)
  - [OrderedDict](#ordereddict-overview)
  - [defaultdict](#defaultdict-overview)
  - [ChainMap](#chainmap)
- [20.2 deque in Depth](#202-deque-in-depth)
  - [Creating deque](#creating-deque)
  - [append and appendleft](#append-and-appendleft)
  - [pop and popleft](#pop-and-popleft)
  - [rotate](#rotate)
  - [Use Cases](#deque-use-cases)
- [20.3 Counter in Depth](#203-counter-in-depth)
  - [Creating Counter](#creating-counter)
  - [most_common](#most_common)
  - [Counter Operations](#counter-operations)
  - [Arithmetic](#counter-arithmetic)
  - [Use Cases](#counter-use-cases)
- [20.4 defaultdict and OrderedDict](#204-defaultdict-and-ordereddict)
  - [defaultdict Basics](#defaultdict-basics)
  - [Factory Functions](#factory-functions)
  - [OrderedDict](#ordereddict)
  - [dict Ordering in Python 3.7+](#dict-ordering-in-python-37)
  - [move_to_end](#move_to_end)
- [20.5 heapq](#205-heapq)
  - [heapq Basics](#heapq-basics)
  - [heappush and heappop](#heappush-and-heappop)
  - [heapify](#heapify)
  - [nlargest and nsmallest](#nlargest-and-nsmallest)
  - [Use Cases](#heapq-use-cases)
- [20.6 bisect](#206-bisect)
  - [Sorted Lists](#sorted-lists)
  - [bisect_left and bisect_right](#bisect_left-and-bisect_right)
  - [insort](#insort)
  - [Binary Search Patterns](#binary-search-patterns)
  - [Performance](#bisect-performance)
- [20.7 Integration Recipes](#207-integration-recipes)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 20.1 collections Module

### namedtuple

**Beginner Level**: **`namedtuple`** creates a tuple subclass with named fields—lightweight immutable records.

```python
from collections import namedtuple

User = namedtuple("User", ["id", "email"])
u = User(1, "a@b.com")
u.email
```

**Intermediate Level**: Parse **CSV rows** into named tuples for readable ETL without a full ORM.

```python
from collections import namedtuple

Row = namedtuple("Row", ["ts", "level", "msg"])


def parse_line(ln: str) -> Row | None:
    parts = ln.strip().split(None, 2)
    if len(parts) != 3:
        return None
    return Row(parts[0], parts[1], parts[2])
```

**Expert Level**: Prefer **`typing.NamedTuple`** or **`dataclasses`** for type hints and defaults; `namedtuple` remains fine for hot immutable structs.

```python
from typing import NamedTuple


class Event(NamedTuple):
    ts: str
    level: str
    msg: str
```

**Key Points**: Immutability aids hashing if all fields hashable; `_replace` for copies with changes; `_asdict` for JSON.

---

### deque-overview

**Beginner Level**: **`deque`** (double-ended queue) is O(1) append/pop from both ends—unlike `list` which is O(n) at front.

```python
from collections import deque

d = deque([1, 2, 3])
d.appendleft(0)
d.pop()
```

**Intermediate Level**: **Sliding window** over streaming metrics (last N response times).

**Expert Level**: `maxlen` evicts automatically—bounded memory for caches and rolling buffers.

**Key Points**: Thread-safe operations documented as CPython implementation detail for some methods—use `queue` for strict producer-consumer.

---

### counter-overview

**Beginner Level**: **`Counter`** counts hashable items—like a dict of int tallies.

```python
from collections import Counter

Counter("abracadabra").most_common(3)
```

**Intermediate Level**: **HTTP status codes** from access log lines.

**Expert Level**: Multiset operations `+`, `-`, `&`, `|`—use carefully with negative counts after subtraction.

**Key Points**: `elements()` expands counts back to iterator; `total()` (3.10+) sum of counts.

---

### ordereddict-overview

**Beginner Level**: **`OrderedDict`** remembers insertion order—since Python 3.7 **plain dict** also preserves insertion order; `OrderedDict` still useful for **`move_to_end`** and equality semantics.

**Intermediate Level**: **LRU**-style structures before `functools.lru_cache` or when you need reorder hooks.

**Expert Level**: `OrderedDict` equality considers order; `dict` equality ignores order.

**Key Points**: Prefer plain `dict` unless you need reorder API; document why `OrderedDict` is chosen.

---

### defaultdict-overview

**Beginner Level**: **`defaultdict(factory)`** supplies missing keys by calling `factory()` instead of `KeyError`.

```python
from collections import defaultdict

dd = defaultdict(list)
dd["a"].append(1)
```

**Intermediate Level**: **Adjacency list** graph from edge stream: `dd[u].append(v)`.

**Expert Level**: Factory must be **callable with no args**—use `lambda: defaultdict(int)` for nested counts.

**Key Points**: `int` factory gives 0 for missing keys; watch `__missing__` vs `defaultdict` overlap.

---

### chainmap

**Beginner Level**: **`ChainMap(*maps)`** layers dicts: lookup searches maps left-to-right; writes go to first map.

```python
from collections import ChainMap

defaults = {"timeout": 30}
env = {"timeout": 60}
cfg = ChainMap(env, defaults)
cfg["timeout"]
```

**Intermediate Level**: **CLI + file + defaults** configuration merge without copying until needed.

**Expert Level**: `new_child()` pushes overlay; `parents` drops first—functional overlay stacks.

**Key Points**: Not a deep merge; side effects visible if underlying dicts mutate.

---

## 20.2 deque in Depth

### Creating deque

**Beginner Level**: `deque(iterable, maxlen=None)`.

```python
from collections import deque

deque(range(5))
deque("hello")
```

**Intermediate Level**: **Byte window** for rolling checksum over file stream.

**Expert Level**: Pick `maxlen` for **telemetry ring buffer**—old samples drop automatically.

**Key Points**: Copy with `deque(d)`; pickle support for IPC if needed.

---

### append and appendleft

**Beginner Level**: `append(x)` right side; `appendleft(x)` left side—both O(1).

```python
from collections import deque

d = deque()
d.append(1)
d.appendleft(0)
```

**Intermediate Level**: **BFS** in graphs: `append` neighbors, `popleft` frontier.

**Expert Level**: With `maxlen`, appending may drop opposite end—document direction.

**Key Points**: Prefer `deque` over `list` for queue discipline.

---

### pop and popleft

**Beginner Level**: `pop()` right; `popleft()` left—raise `IndexError` if empty.

```python
from collections import deque

d = deque([1, 2])
d.popleft(), d.pop()
```

**Intermediate Level**: **Task queue** draining jobs in FIFO order.

**Expert Level**: For **LIFO** stack use only `append`+`pop` on same end consistently.

**Key Points**: Check length before pop in concurrent code or catch `IndexError`.

---

### rotate

**Beginner Level**: `rotate(n)` rotates right by n; negative rotates left.

```python
from collections import deque

d = deque([1, 2, 3, 4])
d.rotate(1)
list(d)
```

**Intermediate Level**: **Round-robin** scheduling pointer without rebuilding list.

**Expert Level**: O(k) where k is rotation distance—large rotations on huge deques cost—consider index math instead.

**Key Points**: Mutates deque in place; `maxlen` still enforced after rotate.

---

### deque-use-cases

**Beginner Level**: FIFO queues, palindrome checkers with two pointers.

**Intermediate Level**: **Last N lines** of log tail with `maxlen`.

```python
from collections import deque
from pathlib import Path


def last_lines(path: Path, n: int) -> list[str]:
    buf: deque[str] = deque(maxlen=n)
    with path.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            buf.append(line.rstrip("\n"))
    return list(buf)
```

**Expert Level**: Combine with **async** producers—still use `asyncio.Queue` for cross-task; `deque` for in-task buffers.

**Key Points**: Bounded `deque` prevents memory blowups in streaming apps.

---

## 20.3 Counter in Depth

### creating-counter

**Beginner Level**: `Counter(iterable)` or `Counter(a=1, b=2)`.

```python
from collections import Counter

Counter(["a", "b", "a"])
```

**Intermediate Level**: Count **words** in scraped text after `split()`.

```python
from collections import Counter
import re

text = open("page.txt", encoding="utf-8").read().lower()
words = re.findall(r"\w+", text)
wc = Counter(words)
```

**Expert Level**: Pass **generator** of millions of items—memory proportional to **unique** keys.

**Key Points**: Missing key reads as 0; assignment creates key.

---

### most_common

**Beginner Level**: `most_common(n)` returns top n `(elem, count)` pairs sorted descending.

```python
from collections import Counter

Counter("mississippi").most_common(2)
```

**Intermediate Level**: **Top HTTP status codes** in access logs.

```python
import re
from collections import Counter

codes = Counter()
pat = re.compile(r" (\d{3}) ")
for line in log_lines:
    if m := pat.search(line):
        codes[m.group(1)] += 1
alerts = codes.most_common(5)
```

**Expert Level**: For huge unique sets, streaming top-k may use `heapq` instead of full `Counter`.

**Key Points**: `n=None` returns all sorted—can be large.

---

### counter-operations

**Beginner Level**: `update(iterable)` adds counts; `subtract` like `-` but keeps zero/negative.

```python
from collections import Counter

c = Counter(a=2)
c.update(a=1, b=1)
```

**Intermediate Level**: Merge per-host counters in local **reduce** step.

**Expert Level**: `+` adds counts; `-` subtracts; `&` intersection min; `|` union max.

**Key Points**: `elements()` expands multiset—can be huge.

---

### counter-arithmetic

**Beginner Level**: Multiset math for diffing bags of tokens.

```python
from collections import Counter

Counter("ab") + Counter("bc")
```

**Intermediate Level**: **Anomaly**: spike when today's token counts minus baseline.

**Expert Level**: Filter non-positive before `elements()`.

**Key Points**: Operations return new `Counter`; use `update` for in-place adds.

---

### counter-use-cases

**Beginner Level**: Votes, inventory SKUs, character counts.

**Intermediate Level**: **Events per minute** bucket keys.

```python
from collections import Counter
from datetime import datetime, timezone


def minute_key(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y%m%d%H%M")


c: Counter[str] = Counter()
c[minute_key(__import__("time").time())] += 1
```

**Expert Level**: At scale use **Redis** `INCR` with TTL; `Counter` for single-process.

**Key Points**: Match tool to cardinality and persistence.

---

## 20.4 defaultdict and OrderedDict

### defaultdict-basics

**Beginner Level**: Auto-insert default on `__getitem__` miss.

```python
from collections import defaultdict

dd = defaultdict(int)
dd["hits"] += 1
```

**Intermediate Level**: **Group by** in one pass.

```python
from collections import defaultdict

rows = [("east", 1), ("east", 2), ("west", 3)]
g: dict[str, list[int]] = defaultdict(list)
for k, v in rows:
    g[k].append(v)
```

**Expert Level**: Nested `defaultdict` for multi-level counts.

**Key Points**: `in` / `get` do not call factory—only `dd[k]` does.

---

### factory-functions

**Beginner Level**: `list`, `set`, `int` factories are most common.

**Intermediate Level**: **Inverted index** word → set of doc ids.

```python
from collections import defaultdict

inv: dict[str, set[int]] = defaultdict(set)
inv["python"].add(1)
```

**Expert Level**: Pickling issues with `lambda` factories in multiprocessing.

**Key Points**: `defaultdict(list)` is idiomatic grouping.

---

### ordereddict

**Beginner Level**: Remembers order; `move_to_end` for LRU-style tweaks.

```python
from collections import OrderedDict

od = OrderedDict([("a", 1), ("b", 2)])
od.move_to_end("a")
list(od.keys())
```

**Intermediate Level**: Manual LRU before dedicated libraries.

**Expert Level**: `functools.lru_cache` or **`cachetools`** for production LRU.

**Key Points**: `OrderedDict` equality considers order unlike plain `dict`.

---

### dict-ordering-in-python-37

**Beginner Level**: **`dict`** preserves insertion order (3.7+ language guarantee).

```python
d = {}
d["z"] = 1
d["a"] = 2
list(d.keys())
```

**Intermediate Level**: JSON key order for human-readable diffs.

**Expert Level**: Merge `{**a, **b}`—later keys win.

**Key Points**: Ordered dict not same as sort order—use `sorted(d)` for keys.

---

### move_to-end

**Beginner Level**: `move_to_end(key, last=True)` to right; `last=False` to left.

**Intermediate Level**: Touch entry in **manual** LRU cache.

**Expert Level**: Not thread-safe—add locks if shared.

**Key Points**: `KeyError` if key missing.

---

## 20.5 heapq

### heapq-basics

**Beginner Level**: Min-heap as list; smallest at index 0.

```python
import heapq

h = [5, 7, 9, 1, 3]
heapq.heapify(h)
heapq.heappop(h)
```

**Intermediate Level**: **k-way merge** of sorted log chunks.

**Expert Level**: Max-heap via negative priority or `key` tricks with tuples.

**Key Points**: Heap property ≠ fully sorted list.

---

### heappush-and-heappop

**Beginner Level**: Push pop maintain heap invariant.

```python
import heapq

h: list[int] = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
heapq.heappop(h)
```

**Intermediate Level**: **Dijkstra** frontier queue.

**Expert Level**: Tie-break with monotonic counter in tuple: `(priority, seq, item)`.

**Key Points**: Empty heap pop raises `IndexError`.

---

### heapify

**Beginner Level**: O(n) build heap from list.

```python
import heapq

data = [3, 1, 4, 1, 5]
heapq.heapify(data)
```

**Intermediate Level**: Reload priorities after batch config load.

**Expert Level**: If list mutated outside heap API, `heapify` again.

**Key Points**: In-place.

---

### nlargest-and-nsmallest

**Beginner Level**: Efficient top/bottom k from iterable.

```python
import heapq

heapq.nlargest(3, range(10_000))
```

**Intermediate Level**: Top **latency** tuples by first field.

```python
import heapq

samples = [(0.2, "/a"), (0.05, "/b"), (0.4, "/c")]
heapq.nlargest(2, samples, key=lambda x: x[0])
```

**Expert Level**: If k ≈ n, `sorted` may win—benchmark.

**Key Points**: `key=` like `sorted`.

---

### heapq-use-cases

**Beginner Level**: Scheduling, simulation events, streaming top-k.

**Intermediate Level**: **Next run time** min-heap for cron-like worker.

**Expert Level**: `asyncio` uses different primitives—heap for custom time loop.

**Key Points**: Document tie-breaking.

---

## 20.6 bisect

### sorted-lists

**Beginner Level**: `bisect` works on sorted ascending list.

```python
import bisect

xs = [1, 3, 5]
bisect.insort(xs, 4)
xs
```

**Intermediate Level**: Timetable maintenance for small n.

**Expert Level**: Many inserts: consider trees or DB index.

**Key Points**: Unsorted input → wrong results.

---

### bisect_left-and-bisect_right

**Beginner Level**: Insertion index left vs right of equal runs.

```python
import bisect

a = [1, 2, 2, 3]
bisect.bisect_left(a, 2), bisect.bisect_right(a, 2)
```

**Intermediate Level**: **Grade buckets** via threshold list.

**Expert Level**: Python 3.10+ `key=` on bisect functions.

**Key Points**: Returns 0..len(a).

---

### insort

**Beginner Level**: `insort_left` / `insort_right` keep sorted order.

```python
import bisect

xs: list[int] = []
for v in [10, 5, 7, 5]:
    bisect.insort_left(xs, v)
xs
```

**Intermediate Level**: Ordered timestamps for window queries.

**Expert Level**: O(n) due to list shifts.

**Key Points**: Choose left vs right for stability.

---

### binary-search-patterns

**Beginner Level**: Membership via `bisect_left` + check.

```python
import bisect


def contains(a: list[int], x: int) -> bool:
    i = bisect.bisect_left(a, x)
    return i < len(a) and a[i] == x
```

**Intermediate Level**: Lower/upper bound patterns for intervals.

**Expert Level**: Float keys—epsilon or `Decimal`.

**Key Points**: Classic competitive programming tool.

---

### bisect-performance

**Beginner Level**: O(log n) search; O(n) insert in list.

**Intermediate Level**: Read-heavy, insert-light OK.

**Expert Level**: Millions of updates—different structure.

**Key Points**: Measure.

---

## 20.7 Integration Recipes

### Sliding window rate limit (deque)

**Beginner Level**: Store request timestamps in `deque`; drop older than window.

```python
from collections import deque
import time


class WindowLimiter:
    def __init__(self, max_events: int, window_sec: float) -> None:
        self.max_events = max_events
        self.window_sec = window_sec
        self.ts: deque[float] = deque()

    def allow(self) -> bool:
        now = time.monotonic()
        while self.ts and now - self.ts[0] > self.window_sec:
            self.ts.popleft()
        if len(self.ts) >= self.max_events:
            return False
        self.ts.append(now)
        return True
```

**Intermediate Level**: Per-API-key limiter: `dict[str, WindowLimiter]` or `defaultdict` factory.

**Expert Level**: Distributed rate limits still need Redis; local `deque` for single instance.

**Key Points**: Monotonic clock avoids DST jumps; bound deque size implicitly via window trimming.

---

### Top-K errors (Counter + heapq)

**Beginner Level**: `Counter.most_common(k)` simplest.

**Intermediate Level**: Million unique errors—stream with `heapq.nlargest` on rolling structure or approximate with **Count-min sketch** (external).

**Expert Level**: Log sampling before count to reduce noise.

**Key Points**: Choose exact vs approximate by SLA.

---

### Priority task queue (heapq)

**Beginner Level**: `(due_time, task_id, payload)` tuples in heap.

```python
import heapq

q: list[tuple[float, int, str]] = []
heapq.heappush(q, (1.0, 1, "job"))
heapq.heappop(q)
```

**Intermediate Level**: **Celery** / **RQ** for production—heap illustrates idea.

**Expert Level**: Stable ordering requires tie-breaker id.

**Key Points**: Do not mutate task priority in place—push new entry or use lazy deletion pattern.

---

### Sorted merge of log files (heapq.merge)

**Beginner Level**: `heapq.merge` merges sorted iterables lazily.

```python
import heapq


def merged_lines(paths: list[str]):
    files = [open(p, encoding="utf-8", errors="replace") for p in paths]
    try:
        yield from heapq.merge(*files)
    finally:
        for f in files:
            f.close()
```

**Intermediate Level**: Keyed merge: `heapq.merge(*iters, key=lambda ln: ln[:19])` for timestamp prefix.

**Expert Level**: Use **`ExitStack`** to close files reliably.

**Key Points**: Each input must be sorted by same key; total output sorted.

---

### Choosing the right structure

**Beginner Level**: FIFO → `deque`; count → `Counter`; grouped lists → `defaultdict(list)`.

**Intermediate Level**: Top-k streaming → `heapq`; sorted dynamic array small n → `bisect` + list.

**Expert Level**: Profile and measure cardinality; swap to Redis/SQL when process memory limits hit.

**Key Points**: Document invariant (sorted, bounded, thread model) next to each field.

---

## Best Practices

1. Use **`deque`** for FIFO/LIFO at both ends—not `list.pop(0)`.
2. Use **`Counter`** for tallies; **`most_common`** for dashboards.
3. Use **`defaultdict`** for grouping over `setdefault` spam.
4. **`heapq`** is min-heap; negate or invert for max.
5. **`bisect`** requires sorted invariant—assert in tests.
6. Plain **`dict`** order suffices for many “ordered” cases in 3.7+.
7. **`ChainMap`** for overlay config without copy.
8. Thread safety: **`queue.Queue`**, not raw shared `deque` without locks.
9. Profile **`insort`** hot paths.
10. JSON-serialize **`Counter`/`defaultdict`** via plain `dict` conversion.

---

## Common Mistakes to Avoid

1. **`list.pop(0)`** in hot loops.
2. **`Counter`** negative counts surprising `elements()`.
3. **`heapq`** tuples comparing unequal types on tie.
4. **`bisect`** on unsorted data.
5. **`bisect_left`** vs **`bisect_right`** confusion with duplicates.
6. Expecting **`defaultdict`** factory on `get()`—it does not run.
7. **`OrderedDict`** without needing **`move_to_end`**.
8. **`ChainMap`** write visibility across layers.
9. **`most_common`** on massive unique keyspace without streaming strategy.
10. **Lambda** `defaultdict` factories and multiprocessing pickling failures.

---

*End of Topic 20 — Collections and Data Structures.*
