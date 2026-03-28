# Performance Optimization in Python

Profiling, algorithmic choices, memory discipline, caching, native extensions, and scalability patterns keep **APIs**, **batch jobs**, **ML inference**, and **data pipelines** within **SLOs**. This guide emphasizes **measurement-first** optimization.

---

## 📑 Table of Contents

1. [30.1 Profiling](#301-profiling)
   - [30.1.1 `timeit`](#3011-timeit)
   - [30.1.2 `cProfile`](#3012-cprofile)
   - [30.1.3 Memory profiling](#3013-memory-profiling)
   - [30.1.4 Line profiler](#3014-line-profiler)
   - [30.1.5 Benchmarking methodology](#3015-benchmarking-methodology)
2. [30.2 Code optimization](#302-code-optimization)
   - [30.2.1 Algorithms](#3021-algorithms)
   - [30.2.2 Data structures](#3022-data-structures)
   - [30.2.3 Global lookups](#3023-global-lookups)
   - [30.2.4 String concatenation](#3024-string-concatenation)
   - [30.2.5 Loops](#3025-loops)
3. [30.3 Memory](#303-memory)
   - [30.3.1 Memory analysis](#3031-memory-analysis)
   - [30.3.2 Garbage collection](#3032-garbage-collection)
   - [30.3.3 Weak references](#3033-weak-references)
   - [30.3.4 Object pooling](#3034-object-pooling)
   - [30.3.5 Caching and retention](#3035-caching-and-retention)
4. [30.4 Caching](#304-caching)
   - [30.4.1 `functools.lru_cache`](#3041-functoolslru_cache)
   - [30.4.2 `functools.cache`](#3042-functoolscache)
   - [30.4.3 Manual caches](#3043-manual-caches)
   - [30.4.4 Invalidation](#3044-invalidation)
   - [30.4.5 Memoization patterns](#3045-memoization-patterns)
5. [30.5 Compiled extensions and runtimes](#305-compiled-extensions-and-runtimes)
   - [30.5.1 Cython](#3051-cython)
   - [30.5.2 `ctypes`](#3052-ctypes)
   - [30.5.3 Calling C](#3053-calling-c)
   - [30.5.4 NumPy performance](#3054-numpy-performance)
   - [30.5.5 PyPy](#3055-pypy)
6. [30.6 Scalability](#306-scalability)
   - [30.6.1 Load testing](#3061-load-testing)
   - [30.6.2 Horizontal scaling](#3062-horizontal-scaling)
   - [30.6.3 Load balancing](#3063-load-balancing)
   - [30.6.4 Distributed systems](#3064-distributed-systems)
   - [30.6.5 Message queues](#3065-message-queues)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 30.1 Profiling

### 30.1.1 `timeit`

**Beginner Level:** **`timeit`** micro-benchmarks **snippets**—compare two ways to build a **string** in a **CLI** tool.

```python
import timeit

print(timeit.timeit('"-".join(map(str, range(100)))', number=10_000))
```

**Intermediate Level:** Use **`repeat`** and take **min** to reduce **noise** from **OS** jitter on **shared** **CI** runners.

```python
import timeit

stmt = "sum(range(1000))"
print(min(timeit.repeat(stmt, number=1000, repeat=5)))
```

**Expert Level:** **`timeit`** is **not** a substitute for **profiling** **real** **workloads**—**warm** **CPU** caches, **disable** **turbo** variability for **stable** **comparisons**, document **Python** version and **hardware**.

```python
# Expert: benchmark harness sketch
def bench(name, fn, iters=1000):
    import time

    t0 = time.perf_counter()
    for _ in range(iters):
        fn()
    dt = time.perf_counter() - t0
    print(name, dt / iters * 1e6, "µs/call")
```

#### Key Points — timeit

- **`-s` setup** in CLI isolates **imports**.
- **GC** can skew—`timeit` may **disable** GC briefly; know the **difference**.
- **Vectorized** comparisons need **larger** **N**.

---

### 30.1.2 `cProfile`

**Beginner Level:** **`cProfile.run`** shows **where** time goes in a **script**—start here before rewriting algorithms.

```python
import cProfile

cProfile.run("sum(range(10_000_000))")
```

**Intermediate Level:** **`Profile`** + **`pstats.Stats`** sort by **cumulative** time for **call** **graphs** of **web** **request** **handlers**.

```python
import cProfile
import pstats
from pstats import SortKey

profiler = cProfile.Profile()
profiler.enable()
heavy_work()
profiler.disable()
stats = pstats.Stats(profiler).sort_stats(SortKey.CUMULATIVE)
stats.print_stats(20)
```

**Expert Level:** **`snakeviz`** or **`py-spy`** for **production**-style **sampling**; **`profile`** module is **pure Python** and **slower**—teaching only.

```python
# Expert: save profile for external viewers
profiler.dump_stats("profile.stats")
```

#### Key Points — cProfile

- **Per-call** vs **cumulative** columns tell different stories.
- **Profiling** **tests** should mirror **production** **inputs**.
- **Decorators** can wrap **hot** **entrypoints** for **conditional** profiling.

---

### 30.1.3 Memory profiling

**Beginner Level:** **`tracemalloc`** tracks **allocations**—find **spikes** when **parsing** **large** **JSON** **webhooks**.

```python
import tracemalloc

tracemalloc.start()
big = [bytearray(10_000) for _ in range(1000)]
current, peak = tracemalloc.get_traced_memory()
print(current / 1e6, peak / 1e6, "MB")
tracemalloc.stop()
```

**Intermediate Level:** **`tracemalloc.take_snapshot()`** diffs **two** **snapshots** after a **request**.

```python
import tracemalloc

tracemalloc.start()
snap1 = tracemalloc.take_snapshot()
# ... handle request ...
snap2 = tracemalloc.take_snapshot()
for stat in snap2.compare_to(snap1, "lineno")[:10]:
    print(stat)
```

**Expert Level:** **`memory_profiler`** (`@profile`) line-by-line in **dev**; **`pympler`** for **object** **graphs**; **always** validate on **representative** **payloads**.

```python
# memory_profiler usage in dev:
# @profile
# def f(): ...
```

#### Key Points — memory profiling

- **Peak** matters for **containers** with **hard** **limits**.
- **Fragmentation** can **inflate** **RSS**—watch **OOMKilled** in **K8s**.
- **C extensions** may **allocate** outside **tracemalloc** visibility.

---

### 30.1.4 Line profiler

**Beginner Level:** Third-party **`kernprof`/`line_profiler`** annotates **each** **line**—great for **suspect** **loops** in **ETL**.

```python
# pip install line_profiler
# kernprof -l -v script.py

# @profile  # noqa: F821 — added by kernprof when run
def process_rows(rows):
    out = []
    for r in rows:
        out.append(transform(r))
    return out
```

**Intermediate Level:** Use **sparingly**—**high** overhead; **narrow** to **functions** flagged by **`cProfile`**.

```python
# Intermediate: isolate hot function in a benchmark script
```

**Expert Level:** Integrate **sampling** profilers in **staging** with **representative** traffic; **avoid** line profiler in **prod** due to cost.

```python
# Expert: feature flag around dev-only profiling hooks
```

#### Key Points — line profiler

- **kernprof** injects **`@profile`** or use **decorator** manually.
- **Combine** with **unit** tests on **small** **fixtures**.
- **Document** how to run in **README** for **contributors**.

---

### 30.1.5 Benchmarking methodology

**Beginner Level:** Run **multiple** iterations, **warm up**, print **mean**/**stdev** for **student** **sorting** **assignments**.

```python
import statistics
import time


def time_calls(fn, n=200):
    times = []
    for _ in range(n):
        t0 = time.perf_counter()
        fn()
        times.append(time.perf_counter() - t0)
    return statistics.mean(times), statistics.stdev(times)
```

**Intermediate Level:** **A/B** **compare** **branches** in **CI** with **fixed** **seeds** and **pinned** **dependencies**—**microservices** **regression** gates.

```python
# Intermediate: store results as JSON artifacts in CI
```

**Expert Level:** Use **`asv`** (airspeed velocity) for **libraries**; **statistical** tests to avoid **phantom** **wins**; **profile** **before** celebrating **1%** **speedups** that hurt **readability**.

```python
# Expert: document environment matrix
BENCH_ENV = {"cpu": "Apple M3", "python": "3.12.2", "turbo": "on"}
```

#### Key Points — benchmarking

- **Isolate** variables—**one** change at a time.
- **Real** **data** distributions beat **synthetic** unless **proven** equivalent.
- **Energy** and **cost** are **performance** too in **cloud** billing.

---

## 30.2 Code optimization

### 30.2.1 Algorithms

**Beginner Level:** Replacing **O(n²)** nested loops with **hash maps** speeds **duplicate** detection in **upload** **validation**.

```python
# O(n) membership
seen = set()
for x in items:
    if x in seen:
        raise ValueError("dup")
    seen.add(x)
```

**Intermediate Level:** **Sorting** + **two-pointer** techniques for **interval** **merging** in **scheduling** **APIs**.

```python
def merge_intervals(iv):
    iv = sorted(iv)
    out = []
    for s, e in iv:
        if not out or s > out[-1][1]:
            out.append([s, e])
        else:
            out[-1][1] = max(out[-1][1], e)
    return out
```

**Expert Level:** **Approximate** algorithms (**HyperLogLog**, **Count-Min Sketch**) for **massive** **stream** **analytics** where **exact** is **prohibitive**.

```python
# Expert: choose exact vs approx based on error budget
```

#### Key Points — algorithms

- **Big-O** hides **constants**—**profile** **medium** **n**.
- **Library** **routines** (`bisect`, `heapq`) are **fast** and **tested**.
- **Parallelism** doesn't fix **bad** **asymptotics**.

---

### 30.2.2 Data structures

**Beginner Level:** **`set`** for **membership**, **`dict`** for **indexes**, **`deque`** for **FIFO** **queues** in **rate** **limiters**.

```python
from collections import deque

q = deque(maxlen=1000)
```

**Intermediate Level:** **`defaultdict`**, **`Counter`** simplify **aggregation** in **log** **pipelines**.

```python
from collections import Counter

counts = Counter(token for line in lines for token in line.split())
```

**Expert Level:** **`__slots__`** / **typed** arrays (**array**, **NumPy**) for **millions** of **homogeneous** **records** in **simulation** **engines**.

```python
import numpy as np

prices = np.random.rand(1_000_000)
```

#### Key Points — data structures

- **list** **prepend** is **O(n)**—use **deque**.
- **Key** **equality** and **hashing** contracts matter for **`dict`/`set`**.
- **Immutable** **structures** ease **concurrency** reasoning.

---

### 30.2.3 Global lookups

**Beginner Level:** **Local** **bindings** are **faster** than **global** **lookups** in **tight** **loops**—assign **`len`** to **local** in **micro** **hotspots**.

```python
def total(xs):
    s = 0
    append = list.append  # method lookup hoisted
    out = []
    for x in xs:
        s += x
        append(out, x)
    return s, out
```

**Intermediate Level:** **Module-level** **constants** are fine; **avoid** **mutable** **globals** for **hot** **paths** and **thread** **safety**.

```python
TAX_RATE = 0.07  # constant OK
```

**Expert Level:** **`functools.partial`** or **closures** capture **prebound** **callables** in **ML** **inference** **loops** calling **NumPy**/**torch**.

```python
from functools import partial

softmax_row = partial(np.apply_along_axis, lambda r: r / r.sum(), 1)
```

#### Key Points — global lookups

- **Premature** **hoisting** hurts **readability**—**profile** first.
- **`from m import x`** vs **`import m`** affects **lookup** and **test** **patching**.
- **Builtin** **shadowing** (`list = ...`) is **toxic**.

---

### 30.2.4 String concatenation

**Beginner Level:** **`join`** on a **list** of **str** beats **repeated** **`+`** in **loops** building **CSV** **exports**.

```python
rows = ["a", "b", "c"]
csv_line = ",".join(rows)
```

**Intermediate Level:** **`io.StringIO`** for **very** **large** **string** **builders** in **reporting** **services**.

```python
import io

buf = io.StringIO()
for chunk in stream_text():
    buf.write(chunk)
s = buf.getvalue()
```

**Expert Level:** **`f-strings`** are **fast** and **readable**; **internationalization** may require **template** **systems** with **caching**.

```python
msg = f"order {oid} total={total:.2f}"
```

#### Key Points — string concat

- **Bytes** vs **str**—encode **once** at **I/O** **boundaries**.
- **Regex** **precompile** with **`re.compile`** in **loops**.
- **JSON** **serialization** dominates **string** **micro** **opts** often.

---

### 30.2.5 Loops

**Beginner Level:** **`for`** **loops** with **builtins** (`sum`, `any`) move work to **C**—**clear** and **fast** for **simple** **cases**.

```python
if any(x < 0 for x in balances):
    raise ValueError("negative balance")
```

**Intermediate Level:** **List** **comprehensions** often **beat** **`map`/`lambda`** for **speed** and **readability** in **CPython**.

```python
squares = [x * x for x in range(n)]
```

**Expert Level:** **Vectorize** with **NumPy**/**Pandas** for **numeric** **ETL**; **Numba**/**Cython** for **custom** **kernels**.

```python
import numpy as np

x = np.arange(n, dtype=np.float64)
y = x * x
```

#### Key Points — loops

- **Avoid** **function** **calls** in **innermost** **loop** when **proven** **hot**.
- **Iterator** **protocol** **streams** **memory**-friendly.
- **Parallel** **loops** need **correct** **aggregation** not **races**.

---

## 30.3 Memory

### 30.3.1 Memory analysis

**Beginner Level:** **`sys.getsizeof`** is **misleading** for **containers**—**nested** **objects** not fully counted.

```python
import sys

x = [1, 2, 3]
print(sys.getsizeof(x))
```

**Intermediate Level:** **`pympler.asizeof`** approximates **deep** **sizes** for **debug** **sessions**.

```python
# pip install pympler
# from pympler import asizeof
# print(asizeof.asizeof(big_structure))
```

**Expert Level:** **RSS** from **`psutil`** + **container** **limits** for **Kubernetes** **right-sizing** of **workers** processing **images**.

```python
import os

# Expert: read cgroup v2 memory limit when available
def cgroup_limit_bytes():
    p = "/sys/fs/cgroup/memory.max"
    if os.path.exists(p):
        with open(p) as f:
            v = f.read().strip()
        if v != "max":
            return int(v)
    return None
```

#### Key Points — memory analysis

- **Measure** **peak** under **burst** traffic.
- **Generational** **patterns** affect **GC** **pauses**.
- **Memory** **maps** for **C** **extensions** require **vendor** tools.

---

### 30.3.2 Garbage collection

**Beginner Level:** CPython uses **reference** **counting** + **cycle** **GC**—**cycles** need the **GC** to break **`__del__`** **edge** **cases**.

```python
import gc

gc.collect()
```

**Intermediate Level:** **`gc.set_threshold`** tuning for **low-latency** **games** or **audio**—**rare** and **measured**.

```python
gc.set_threshold(700, 10, 10)
```

**Expert Level:** **Disable** **GC** briefly in **carefully** **audited** **hot** **paths** (some **libraries** do)—**dangerous** without **expert** **review**.

```python
# Expert-only sketch:
# gc.disable()
# try:
#     ...
# finally:
#     gc.enable(); gc.collect()
```

#### Key Points — GC

- **`weakref`** breaks **cycles** **elegantly** for **caches**.
- **`__slots__`** reduce **per-object** **overhead**.
- **Avoid** **`__del__`**—use **context** **managers**.

---

### 30.3.3 Weak references

**Beginner Level:** **`weakref.ref`** observes **objects** without **preventing** **deallocation**—**metadata** **side** **tables**.

```python
import weakref


class Widget:
    pass


w = Widget()
r = weakref.ref(w)
print(r() is w)
del w
print(r())  # None
```

**Intermediate Level:** **`WeakKeyDictionary`** maps **objects** → **data** for **annotation** **caches** in **frameworks**.

```python
import weakref

meta = weakref.WeakKeyDictionary()
```

**Expert Level:** **`WeakValueDictionary`** for **automatic** **cache** **eviction** when **values** **die**—watch **iteration** **under** **mutation**.

```python
cache = weakref.WeakValueDictionary()
cache["model"] = load_big_model()
```

#### Key Points — weakref

- **Not** all **types** are **weakref-able**.
- **Thread** **safety** matches **dict** **semantics**.
- **Don't** **weakref** **ints/str** **interned** **immutables** expecting **timely** **cleanup**.

---

### 30.3.4 Object pooling

**Beginner Level:** Reuse **expensive** **objects** (**HTTP** **parsers**, **regex** **compiled**) instead of **per** **call** **construction**.

```python
import re

TOKEN = re.compile(r"\w+")


def tokens(s: str):
    return TOKEN.findall(s)
```

**Intermediate Level:** **Connection** **pools** (**SQLAlchemy**, **`requests.Session`**) are **pools** of **external** **objects**—same **idea**.

```python
# requests.Session pools TCP connections
```

**Expert Level:** **Custom** **pools** for **protobuf** **builders** or **GPU** **tensors**—**measure** **alloc** **costs** vs **pool** **complexity**.

```python
class BufferPool:
    def __init__(self, factory, size=8):
        self._free = [factory() for _ in range(size)]
        self._factory = factory

    def acquire(self):
        return self._free.pop() if self._free else self._factory()

    def release(self, buf):
        self._free.append(buf)
```

#### Key Points — object pooling

- **Reset** **state** **on** **release**.
- **Thread** **safety** required for **shared** **pools**.
- **Pool** **exhaustion** **backpressure** strategy needed.

---

### 30.3.5 Caching and retention

**Beginner Level:** **In-process** **dict** **cache** for **config** **snapshots** refreshed **periodically** in **microservices**.

```python
import time

_cache = {"value": None, "exp": 0.0}


def get_config():
    now = time.monotonic()
    if now > _cache["exp"]:
        _cache["value"] = fetch_remote_config()
        _cache["exp"] = now + 30
    return _cache["value"]


def fetch_remote_config():
    return {"feature_x": True}
```

**Intermediate Level:** **Redis** **TTL** **caches** for **multi-instance** **API** **clusters**.

```python
# redis.setex(key, ttl, value) conceptual
```

**Expert Level:** **Bounded** **caches** + **eviction** policies (**LRU**, **LFU**) prevent **memory** **leaks** under **adversarial** **key** **spaces**.

```python
from functools import lru_cache


@lru_cache(maxsize=10_000)
def normalize_token(t: str) -> str:
    return t.casefold()
```

#### Key Points — retention

- **TTL** **everywhere** for **staleness** **bounds**.
- **Stampede** **protection** on **expiry** (**singleflight**).
- **PII** in **caches** → **encryption** + **purge** **policies**.

---

## 30.4 Caching

### 30.4.1 `functools.lru_cache`

**Beginner Level:** **Memoize** **pure** **functions** with a **bounded** **LRU**—**DNS**-like **string** **normalization** in **ingestion**.

```python
from functools import lru_cache


@lru_cache(maxsize=1024)
def canon_host(h: str) -> str:
    return h.lower().strip()
```

**Intermediate Level:** **`maxsize=None`** **unbounded**—**dangerous** for **user-controlled** **inputs**.

```python
@lru_cache(maxsize=None)
def risky(user_input: str) -> str:
    return user_input  # can grow memory without bound
```

**Expert Level:** **`cache_info()`** **metrics** exported to **Prometheus** for **hit** **rate** **SLOs**.

```python
canon_host.cache_clear()
print(canon_host.cache_info())
```

#### Key Points — lru_cache

- **Hashable** **arguments** only.
- **Thread-safe** for **CPython** **dict** **ops** in **typical** **uses**.
- **`typed=True`** **deprecated** path—prefer **explicit** **keying**.

---

### 30.4.2 `functools.cache`

**Beginner Level:** **`@cache`** (3.9+) is **`lru_cache(maxsize=None)`** **shorthand**—**small** **finite** **domains** only.

```python
from functools import cache


@cache
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

**Intermediate Level:** **Fib** example is **pedagogical**—**real** **code** uses **iterative** **fib**; **cache** still **useful** for **AST** **walks** on **immutable** **trees**.

```python
@cache
def ast_key(node: tuple):
    return node
```

**Expert Level:** **Combine** with **`__slots__`** **immutable** **args** to **control** **memory**.

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Key:
    tenant: str
    sku: str


@cache
def price(k: Key) -> int:
    return lookup(k)
```

#### Key Points — cache

- **Unbounded** risk—**monitor** **memory**.
- **Clear** on **config** **changes** (`cache_clear`).
- **Don't** **cache** **functions** with **side** **effects**.

---

### 30.4.3 Manual caches

**Beginner Level:** **Plain** **`dict`** + **lock** for **thread-safe** **TTL** **cache** in **sync** **servers**.

```python
import threading

_lock = threading.Lock()
_store: dict[str, tuple[float, str]] = {}


def get(key: str, ttl: float, loader):
    now = time.monotonic()
    with _lock:
        hit = _store.get(key)
        if hit and now - hit[0] < ttl:
            return hit[1]
    val = loader(key)
    with _lock:
        _store[key] = (now, val)
    return val
```

**Intermediate Level:** **`cachetools.TTLCache`** for **feature-rich** **manual** **caches**.

```python
# pip install cachetools
# from cachetools import TTLCache
# c = TTLCache(maxsize=100, ttl=30)
```

**Expert Level:** **Stampede** **protection** with **per-key** **locks** or **`asyncio.Lock`** **singleflight** in **async** **gateways**.

```python
# Expert: singleflight sketch
_inflight: dict[str, asyncio.Future] = {}
```

#### Key Points — manual caches

- **Eviction** policy matches **access** **pattern**.
- **Serialization** for **multi-process** **caches** is **hard**—use **Redis**.
- **Metrics**: **size**, **hit/miss**, **evictions**.

---

### 30.4.4 Invalidation

**Beginner Level:** **`lru_cache.cache_clear()`** on **deploy** or **config** **toggle** **flip** in **admin** **APIs**.

```python
canon_host.cache_clear()
```

**Intermediate Level:** **Versioned** **cache** **keys** (`f"{schema_v}:{key}"`) for **ORM** **query** **caches**.

```python
SCHEMA_VER = 17


def k(user_id: int) -> str:
    return f"{SCHEMA_VER}:user:{user_id}"
```

**Expert Level:** **Pub/sub** (**Redis**) **invalidates** **edge** **caches** when **writes** **occur**—**eventual** **consistency** **documentation** required.

```python
# Expert: on write publish invalidate:user:{id}
```

#### Key Points — invalidation

- **Hardest** **problem** in **caching**—**design** **explicitly**.
- **Time-based** **TTL** is **simplest** **correct** **default**.
- **Thundering** **herd** after **TTL** **expiry**—**mitigate**.

---

### 30.4.5 Memoization patterns

**Beginner Level:** **Top-down** **DP** with **`@lru_cache`** for **combinatorics** **problems** in **interviews**—same **idea** in **route** **optimization** **prototypes**.

```python
from functools import lru_cache


@lru_cache(maxsize=None)
def routes(n):
    if n <= 1:
        return 1
    return routes(n - 1) + routes(n - 2)
```

**Intermediate Level:** **Explicit** **memo** **dict** when **keys** aren't **hashable** **as** **function** **args**.

```python
memo = {}


def edit_distance(a, b):
    key = (a, b)
    if key in memo:
        return memo[key]
    # ... compute ...
    memo[key] = result
    return result
```

**Expert Level:** **Distributed** **memoization** (**Dask**, **Spark**) for **ML** **feature** **materialization** **jobs**.

```python
# Expert: parquet on object storage as memo layer
```

#### Key Points — memoization

- **Pure** **functions** only.
- **Disk** **cache** (**joblib**) for **expensive** **sklearn** **pipelines**.
- **Watch** **memory** on **recursive** **caches**.

---

## 30.5 Compiled extensions and runtimes

### 30.5.1 Cython

**Beginner Level:** **Cython** translates **Python-like** code to **C** **extensions**—**speedups** on **tight** **loops** in **scientific** code.

```cython
# example .pyx concept: typed loop
# cdef int i
# cdef double s = 0
# for i in range(n):
#     s += i
```

**Intermediate Level:** **`annotate=True`** HTML shows **yellow** lines still **using** **Python** **APIs**.

```bash
cython -a module.pyx
```

**Expert Level:** **OpenMP** **pragmas** for **parallel** **Cython** in **HPC** **clusters**—**build** **matrix** in **CI** for **wheels**.

```python
# Expert: ship manylinux wheels via cibuildwheel
```

#### Key Points — Cython

- **Type** **annotations** unlock **C** **speed**.
- **Debugging** **mixed** **Python/C** is **harder**.
- **Alternative**: **mypyc**, **Nuitka** for **different** **tradeoffs**.

---

### 30.5.2 `ctypes`

**Beginner Level:** **`ctypes`** calls **shared** **libraries** without **writing** **C** **wrapper** **extensions**—**quick** **prototypes**.

```python
import ctypes

libc = ctypes.CDLL(None)  # platform dependent example
# libc.printf(b"hi\n")
```

**Intermediate Level:** **`ctypes.Structure`** maps **C** **structs** for **device** **drivers** in **embedded** **tooling**.

```python
class Point(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]
```

**Expert Level:** **ABI** **fragility** across **platforms**—prefer **`cffi`** or **official** **bindings** for **production** **payments** **HSM** **integrations**.

```python
# Expert: cffi out-of-line build for stable ABI
```

#### Key Points — ctypes

- **Manual** **memory** **management** **risks**.
- **GIL** **released** around **C** **calls** that **declare** **argtypes/restype** properly.
- **Security** of **loading** **DLLs** from **paths**.

---

### 30.5.3 Calling C

**Beginner Level:** **`ctypes`** or **`cffi`** to **invoke** **`libssl`**, **`libsodium`** **wrappers** maintained by **community**.

```python
# Prefer maintained packages: cryptography, pynacl
```

**Intermediate Level:** **Writing** **C** **extensions** with **`PyBind11`** for **NumPy** **interop** in **custom** **ops**.

```cpp
// pybind11 module example (C++)
// m.def("add", [](int a, int b) { return a + b; });
```

**Expert Level:** **Rust** **`pyo3`** for **memory-safe** **services** **extensions**—**ship** **abi3** **wheels** when possible.

```python
# maturin develop / build
```

#### Key Points — calling C

- **Reference** **counting** rules in **C** **API**.
- **Error** **paths** must not **leak** **references**.
- **Test** **wheels** on **target** **distros**.

---

### 30.5.4 NumPy performance

**Beginner Level:** **Vectorize** **instead** of **Python** **loops** for **numeric** **arrays** in **feature** **engineering**.

```python
import numpy as np

x = np.arange(1_000_000)
y = x * 2 + 1
```

**Intermediate Level:** **Broadcasting** avoids **explicit** **tiles**; **einsum** for **tensor** **contractions** in **ML** **serving**.

```python
np.einsum("ij,jk->ik", a, b)
```

**Expert Level:** **NumPy** **views** vs **copies**—**stride** **tricks** for **zero-copy** **windows** on **time-series** **buffers**.

```python
from numpy.lib.stride_tricks import sliding_window_view

# v = sliding_window_view(x, window_shape)
```

#### Key Points — NumPy

- **dtype** **choice** affects **speed** and **memory**.
- **BLAS** **threads** **interact** with **Python** **threads**—tune **`OMP_NUM_THREADS`**.
- **Pandas** **built** on **NumPy**—**profile** **before** **blaming** **Python**.

---

### 30.5.5 PyPy

**Beginner Level:** **PyPy** **JIT** can **accelerate** **long-running** **pure** **Python** **loops** in **simulations**.

```python
# Run same script with pypy3 interpreter
```

**Intermediate Level:** **Warmup** **time** matters for **short** **CLI** **tools**—**CPython** may **win**.

```python
# Benchmark after JIT warmup
```

**Expert Level:** **Extension** **compatibility** (**NumPy** on **PyPy**) **check** **before** **committing** **architecture**.

```python
import sys

print(sys.implementation.name)
```

#### Key Points — PyPy

- **Great** for **CPU**-bound **dynamic** **Python**.
- **Weaker** for **some** **C** **extensions** historically.
- **Deploy** **images** **explicitly** **tagged** **pypy** if used.

---

## 30.6 Scalability

### 30.6.1 Load testing

**Beginner Level:** **`locust`** or **`k6`** scripts simulate **users** hitting **REST** **APIs**—find **RPS** **ceilings**.

```python
# locustfile.py sketch
from locust import HttpUser, task


class ApiUser(HttpUser):
    @task
    def health(self):
        self.client.get("/health")
```

**Intermediate Level:** **Soak** **tests** (hours) reveal **memory** **leaks** and **connection** **pool** **misconfigurations**.

```python
# Run overnight in staging with production-like data volume
```

**Expert Level:** **Distributed** **load** **generation** + **percentile** **SLOs** (**p95/p99** **latency**) tracked in **Grafana**.

```python
SLO = {"p99_ms": 250, "error_rate": 0.001}
```

#### Key Points — load testing

- **Seed** **realistic** **payloads**.
- **Isolate** **client** vs **server** **limits**.
- **Profile** **DB** during **load** tests.

---

### 30.6.2 Horizontal scaling

**Beginner Level:** Run **multiple** **Uvicorn** **workers** behind **a** **proxy**—**stateless** **HTTP** **layer**.

```bash
uvicorn app:app --workers 4
```

**Intermediate Level:** **Kubernetes** **HPA** on **CPU**/**custom** **metrics** (**queue** **depth**) for **Black Friday** **traffic**.

```yaml
# HPA references metrics.k8s.io or external metrics adapter
```

**Expert Level:** **Shard** **by** **tenant** **or** **region** when **single** **DB** **becomes** **bottleneck**—**data** **plane** **scaling**.

```python
# Expert: tenant -> shard router
SHARDS = {"eu": db_eu, "us": db_us}
```

#### Key Points — horizontal scaling

- **Sticky** **sessions** complicate **scaling**—prefer **JWT** **stateless**.
- **Cache** **coherency** across **nodes**.
- **Cost** **vs** **headroom** **tradeoffs**.

---

### 30.6.3 Load balancing

**Beginner Level:** **Round-robin** **nginx** **upstream** for **identical** **API** **replicas**.

```nginx
upstream api {
    server 10.0.0.1:8000;
    server 10.0.0.2:8000;
}
```

**Intermediate Level:** **Least** **connections** for **long-lived** **SSE**/**WebSocket** **connections**.

```nginx
least_conn;
```

**Expert Level:** **Health** **checks** + **circuit** **breakers** + **retry** **budgets** in **service** **mesh** (**Istio**, **Linkerd**).

```python
# Envoy/Istio policies as YAML — retries with retry_on, per_try_timeout
```

#### Key Points — load balancing

- **Draining** **connections** on **deploy**.
- **TLS** **termination** **location** affects **CPU**.
- **Geographic** **routing** for **latency**.

---

### 30.6.4 Distributed systems

**Beginner Level:** **Idempotent** **HTTP** **methods** and **keys** enable **safe** **retries** in **unreliable** **networks**.

```python
@router.post("/orders", status_code=201)
def create_order(idempotency_key: str | None = Header(default=None)):
    if idempotency_key and seen(idempotency_key):
        return load_prior_response(idempotency_key)
    ...
```

**Intermediate Level:** **Saga** **pattern** for **multi-service** **transactions** with **compensating** **actions** in **travel** **booking**.

```python
# steps: reserve_hotel -> reserve_car -> charge_card; compensate on failure
```

**Expert Level:** **CAP** **tradeoffs**—choose **availability** vs **consistency** per **use** **case** (**inventory** vs **recommendations**).

```python
# Expert: document per-domain consistency tier
TIERS = {"inventory": "strong", "reco": "eventual"}
```

#### Key Points — distributed systems

- **Clocks** **skew**—use **logical** **timestamps** or **vendor** **timestamps**.
- **Partial** **failures** are **normal**—**design** **for** them.
- **Observability** with **trace** **IDs** across **services**.

---

### 30.6.5 Message queues

**Beginner Level:** **Redis** **lists** or **RQ** for **simple** **job** **queues** in **small** **deployments**.

```python
# rq enqueue sketch
# from rq import Queue
# q = Queue(connection=redis_conn)
# q.enqueue(send_email, user_id)
```

**Intermediate Level:** **Celery** + **RabbitMQ/SQS** for **durable** **workflows** with **retries** and **DLQs**.

```python
# celery task with autoretry_for, retry_backoff
```

**Expert Level:** **Kafka** for **event** **sourcing** **pipelines** feeding **analytics** **and** **microservices** **CDC**.

```python
# kafka-python / confluent-kafka producers with acks=all, idempotence=True
```

#### Key Points — message queues

- **At-least-once** **delivery** implies **duplicate** **handling**.
- **Ordering** **guarantees** **per** **partition** **key**.
- **Poison** **messages** → **DLQ** + **alerting**.

---

## Best Practices

- **Profile** before **optimizing**; re-profile after.
- **Keep** **hot** **paths** **simple**; **push** **complexity** to **cold** **code**.
- **Bound** **memory** with **TTL** **caches** and **streaming** **I/O**.
- **Document** **performance** **assumptions** in **SLO** **docs**.
- **Test** under **production-like** **data** **sizes** and **concurrency**.
- **Use** **native** **libraries** (**NumPy**, **`orjson`**, **`uvloop`**) when **proven** **beneficial**.
- **Plan** **scaling** **before** **hitting** **vertical** **limits**.

---

## Common Mistakes to Avoid

- **Micro-optimizing** **cold** **code** while **database** **queries** **dominate** **latency**.
- **Unbounded** **`@cache`** on **user** **input**.
- **Ignoring** **GIL** and **expecting** **thread** **speedup** on **CPU-bound** **Python**.
- **False** **sharing** and **lock** **contention** under **load**.
- **Disabling** **GC** without **measurement** and **review**.
- **Assuming** **`getsizeof`** is **deep** **size**.
- **Caching** **without** **invalidation** **strategy**.
- **Load** **testing** only **happy** **path** **GETs**.
- **Horizontal** **scale** **without** **fixing** **O(n²)** **algorithms**.

---

*Performance is a feature—ship measurements alongside code changes in performance-sensitive systems.*
