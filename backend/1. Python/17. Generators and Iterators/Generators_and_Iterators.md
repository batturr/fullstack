# Generators and Iterators

**Iterators** let you loop over data one item at a time. **Generators** are a concise way to build iterators with `yield`. This guide ties both to **log streaming**, **large file processing**, **API pagination**, and **data pipelines**—with emphasis on memory and lazy evaluation.

## 📑 Table of Contents

- [17.1 Iterators](#171-iterators)
  - [Iterator Protocol](#iterator-protocol)
  - [__iter__](#__iter__)
  - [__next__](#__next__)
  - [iter()](#iter)
  - [next()](#next)
  - [StopIteration](#stopiteration)
- [17.2 Creating Iterators](#172-creating-iterators)
  - [Custom Iterators](#custom-iterators)
  - [Iterator Classes](#iterator-classes)
  - [Managing Iterator State](#managing-iterator-state)
  - [Infinite Iterators](#infinite-iterators)
  - [Finite Iterators](#finite-iterators)
- [17.3 Generators](#173-generators)
  - [Generator Functions](#generator-functions)
  - [yield](#yield)
  - [Generator Expressions](#generator-expressions)
  - [send()](#send)
  - [throw()](#throw)
  - [close()](#close)
- [17.4 Generator Usage](#174-generator-usage)
  - [Memory Efficiency](#memory-efficiency)
  - [Lazy Evaluation](#lazy-evaluation)
  - [Pipeline Pattern](#pipeline-pattern)
  - [Infinite Sequences](#infinite-sequences)
  - [Producer-Consumer](#producer-consumer)
- [17.5 itertools](#175-itertools)
  - [count](#count)
  - [cycle](#cycle)
  - [repeat](#repeat)
  - [chain](#chain)
  - [Combining and Grouping](#combining-and-grouping)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 17.1 Iterators

### Iterator Protocol

**Beginner Level**: An **iterator** is an object you can pass to `next()` until it raises `StopIteration`. Iterators usually come from `iter(something)` or generator functions.

```python
it = iter([1, 2, 3])
print(next(it), next(it), next(it))
```

**Intermediate Level**: The protocol requires `__iter__` returning `self` and `__next__` returning the next value. Files and many stdlib objects implement iterators for **streaming I/O**.

```python
from pathlib import Path

with Path("access.log").open() as f:
    for line in f:  # file object is iterable
        if "ERROR" in line:
            print(line.strip())
```

**Expert Level**: Custom iterators must raise **`StopIteration`** (Python 3.7+ automatically stops propagation inside generators; in `__next__`, raise it explicitly). Async iterators use `__aiter__`/`__anext__`—related but distinct.

**Key Points**

- Iterator vs iterable: iterables define `__iter__`; iterators define `__next__`.
- One-shot: exhausted iterators do not rewind without recreating.
- Composability: iterators chain in pipelines.

---

### __iter__

**Beginner Level**: `__iter__` on a container returns an iterator—often `self` for iterator classes or a new generator.

```python
class CountToThree:
    def __iter__(self):
        yield 1
        yield 2
        yield 3


print(list(CountToThree()))
```

**Intermediate Level**: **Paginated API**: `__iter__` can yield pages fetched lazily.

```python
from typing import Iterator


def fetch_page(cursor: str | None) -> tuple[list[dict], str | None]:
    # pretend HTTP
    if cursor is None:
        return [{"id": 1}], "next"
    return [], None


class UserPages:
    def __iter__(self) -> Iterator[dict]:
        cursor = None
        while True:
            rows, cursor = fetch_page(cursor)
            yield from rows
            if cursor is None:
                break
```

**Expert Level**: Returning **`self`** from `__iter__` requires implementing `__next__` on the same class; mixing styles confuses readers—pick one idiom per type.

**Key Points**

- `for x in obj` calls `iter(obj)` → `__iter__`.
- Generators implement `__iter__` via the generator object automatically.
- Document whether iteration is restartable.

---

### __next__

**Beginner Level**: `__next__` returns the next item or raises `StopIteration`.

```python
class UpTo:
    def __init__(self, n: int) -> None:
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self) -> int:
        if self.i >= self.n:
            raise StopIteration
        self.i += 1
        return self.i


print(list(UpTo(3)))  # [1, 2, 3]
```

**Intermediate Level**: **Token scanner** for log lines: `__next__` returns next token or raises when line exhausted.

**Expert Level**: In Python 3, **`StopIteration`** inside a generator is converted to runtime `RuntimeError` if accidentally raised manually in some contexts—prefer `yield` and `return` in generator functions.

**Key Points**

- Keep iterator state explicit (`self.i`, etc.).
- Do not swallow `StopIteration` broadly—it ends loops.
- Thread safety: iterators are not generally thread-safe.

---

### iter()

**Beginner Level**: `iter(obj)` gets an iterator from an iterable. Two-arg form `iter(callable, sentinel)` calls `callable()` until the value equals `sentinel`.

```python
it = iter([10, 20])
list(it)
```

**Intermediate Level**: **Read binary chunks** until empty bytes—useful for socket/file streaming.

```python
def read_chunks(sock, size: int = 4096):
    return iter(lambda: sock.recv(size), b"")
```

**Expert Level**: `iter` with sentinel requires **callable with no args**—often `partial(sock.recv, 4096)` or `lambda`.

```python
from functools import partial


def chunks_from_read(read, size: int):
    return iter(partial(read, size), b"")
```

**Key Points**

- `iter(dict)` iterates keys; use `.items()` for pairs.
- Sentinel form is elegant for blocking reads—document blocking behavior.
- `iter` is idempotent on iterators (returns same iterator).

---

### next()

**Beginner Level**: `next(it)` returns the next value; optional default if iterator exhausted.

```python
it = iter([1])
print(next(it, "done"))
print(next(it, "done"))
```

**Intermediate Level**: **Manual parsing**: pull headers from a line iterator until blank line.

```python
def read_headers(lines):
    it = iter(lines)
    headers: dict[str, str] = {}
    for line in it:
        if line.strip() == "":
            break
        k, _, v = line.partition(":")
        headers[k.strip()] = v.strip()
    return headers, it  # remainder iterator for body
```

**Expert Level**: Combine with **`contextlib.closing`** when wrapping resources that need cleanup after iteration.

**Key Points**

- `next` with default avoids `StopIteration` handling.
- Passing remainder iterators enables push parsers.
- Prefer `for` loops when full consumption is intended.

---

### StopIteration

**Beginner Level**: Signals end of iterator; `for` loops catch it internally.

```python
it = iter([])
try:
    next(it)
except StopIteration:
    print("empty")
```

**Intermediate Level**: **Generator cleanup**: `return` in a generator raises `StopIteration` with a value (Python 3.3+); callers rarely need to catch it.

```python
def gen():
    yield 1
    return "done"


g = gen()
print(next(g), next(g))
try:
    next(g)
except StopIteration as e:
    print(e.value)  # "done"
```

**Expert Level**: PEP 479: **`StopIteration`** raised inside a generator becomes `RuntimeError`—do not use `StopIteration` for ordinary control flow inside generators.

**Key Points**

- Let `for`/`list()` consume iterators—avoid manual loops unless needed.
- Generator `return value` is retrieved via `StopIteration.value`.
- Async generators parallel `StopAsyncIteration`.

---

## 17.2 Creating Iterators

### Custom Iterators

**Beginner Level**: Implement `__iter__`/`__next__` on a class or use a generator function—generator is usually shorter.

```python
def squares(n: int):
    for i in range(n):
        yield i * i


print(list(squares(4)))
```

**Intermediate Level**: **CSV row iterator** that strips cells and skips comments.

```python
from typing import Iterator


def csv_rows(path: str) -> Iterator[list[str]]:
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            yield [c.strip() for c in line.split(",")]
```

**Expert Level**: For **restartable** iteration, return a fresh iterator from `__iter__` each time; do not share mutable cursor across independent `for` loops unless intentional.

**Key Points**

- Prefer generators for clarity unless you need rich stateful objects.
- Custom classes help when exposing `.peek()` or multi-cursor semantics.
- Unit-test iterators with `list()` and incremental `next()`.

---

### Iterator Classes

**Beginner Level**: Stateful class with `__iter__` returning `self` and `__next__` advancing.

```python
class LineWindow:
    def __init__(self, lines: list[str], size: int) -> None:
        self.lines = lines
        self.size = size
        self.pos = 0

    def __iter__(self):
        return self

    def __next__(self) -> list[str]:
        if self.pos + self.size > len(self.lines):
            raise StopIteration
        w = self.lines[self.pos : self.pos + self.size]
        self.pos += 1
        return w
```

**Intermediate Level**: **Rolling average** over sensor readings from an iterator of floats.

**Expert Level**: Iterator classes can hold **locks** for thread-safe consumption—rare; often use queues instead.

**Key Points**

- Iterator objects are consumed once by default.
- `__iter__` returning `self` makes instance single-pass.
- Document thread and re-entrancy behavior.

---

### Managing Iterator State

**Beginner Level**: Store index, file handle, or network cursor in instance attributes.

```python
class ReadLines:
    def __init__(self, path: str) -> None:
        self._f = open(path, encoding="utf-8")

    def __iter__(self):
        return self

    def __next__(self) -> str:
        line = self._f.readline()
        if not line:
            self._f.close()
            raise StopIteration
        return line.rstrip("\n")
```

**Intermediate Level**: Prefer **`with` + generator function** instead of manual close in `__next__`—easier to reason about.

**Expert Level**: Use **`contextlib.closing`** or make the object a **context manager** if it owns OS handles.

**Key Points**

- Leaked file handles are a common bug—use generators with `with`.
- Resetting state may require a new iterator instance.
- Explicit state beats hidden globals.

---

### Infinite Iterators

**Beginner Level**: Never raises `StopIteration` unless broken externally—`itertools.count()`, `cycle()`, custom `while True`.

```python
import itertools

for i, x in zip(range(3), itertools.count(10, 2)):
    print(i, x)
```

**Intermediate Level**: **Synthetic load testing**: infinite stream of fake JSON lines.

```python
import json
import random
import itertools


def fake_events():
    for seq in itertools.count():
        yield json.dumps({"seq": seq, "v": random.random()}) + "\n"
```

**Expert Level**: Always **bound** infinite iterators with `islice`, `zip`, or `break`—unbounded `list()` will exhaust memory.

**Key Points**

- Infinite + `list()` = disaster.
- Pair with `takewhile` for conditional termination.
- Document non-termination in APIs.

---

### Finite Iterators

**Beginner Level**: Stop when data ends: file EOF, empty API page, counter limit.

```python
def first_n(n: int):
    for i in range(n):
        yield i
```

**Intermediate Level**: **Paginated REST**: stop when `next_url` is missing.

```python
from typing import Any, Iterator


def pages(start_url: str) -> Iterator[dict[str, Any]]:
    url: str | None = start_url
    while url:
        # pretend fetch returns body + next link
        body = {"items": [1, 2], "next": None}
        yield body
        url = body.get("next")
```

**Expert Level**: **Exhausted iterators** stay exhausted—create `iter(collection)` again to restart.

**Key Points**

- Finite iterators compose safely with `list()` and `sum()`.
- Pagination should handle empty pages and errors.
- Tests should cover 0, 1, many pages.

---

## 17.3 Generators

### Generator Functions

**Beginner Level**: Any function containing `yield` returns a **generator object** when called—not the yielded values yet.

```python
def gen():
    yield 1
    yield 2


g = gen()
print(type(g))
```

**Intermediate Level**: **Stream parse** large NDJSON log files line by line without loading whole file.

```python
from pathlib import Path
import json


def jsonl_records(path: Path):
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)
```

**Expert Level**: Generators implement **iterator protocol**; they support `send`, `throw`, `close` for coroutine-like patterns (pre-async).

**Key Points**

- Calling the function constructs the generator; no body runs until `next()`.
- Generators are lazy and memory-friendly.
- One generator object = one execution frame.

---

### yield

**Beginner Level**: `yield` pauses the function and emits a value to the consumer; resumes on next `next()`.

```python
def countdown(n: int):
    while n > 0:
        yield n
        n -= 1


print(list(countdown(3)))
```

**Intermediate Level**: **ETL**: yield normalized dicts while reading raw rows.

```python
def normalize_rows(rows):
    for r in rows:
        yield {"id": int(r["id"]), "name": r["name"].strip().lower()}
```

**Expert Level**: **`yield from`** delegates to sub-iterator—flattens nested iteration and forwards `send`/`throw` to subgenerator.

```python
def chain_sources(a, b):
    yield from a
    yield from b
```

**Key Points**

- `yield` expressions can receive values via `send` (advanced).
- `yield from` simplifies delegation.
- `return` in generator completes with optional value to `StopIteration`.

---

### Generator Expressions

**Beginner Level**: Like list comprehensions but with `()`—lazy.

```python
squares = (x * x for x in range(10_000_000))  # no huge list yet
print(next(squares))
```

**Intermediate Level**: **Pipeline**: map filter without intermediate lists.

```python
lines = [" ERROR x", "INFO y", "ERROR z"]
errs = (ln.strip() for ln in lines if ln.lstrip().startswith("ERROR"))
```

**Expert Level**: Generator expressions **cannot** be inspected length without consuming—use `sum(1 for _ in gen)` to count at cost of consumption.

**Key Points**

- Single-use: second iteration needs new expression.
- Prefer genexpr over `map`/`filter` when readability ties.
- Nested genexprs can be hard to debug—name steps.

---

### send()

**Beginner Level**: `generator.send(value)` resumes generator and injects value as result of `yield` expression.

```python
def acc():
    total = 0
    while True:
        n = yield total
        if n is None:
            break
        total += n


g = acc()
print(next(g))  # prime: 0
print(g.send(10))  # 10
print(g.send(5))  # 15
```

**Intermediate Level**: **Cooperative parsers** can push tokens—rare in modern code replaced by async.

**Expert Level**: First call must be **`next(g)`** or `g.send(None)` to advance to first `yield`—document this contract.

**Key Points**

- `send` enables bidirectional communication.
- Easy to misuse—prefer classes or async for complex state.
- Closing generator invalidates further `send`.

---

### throw()

**Beginner Level**: `g.throw(exc)` injects an exception at the current `yield`.

```python
def g():
    try:
        yield 1
    except ValueError:
        yield "handled"


gen = g()
print(next(gen))
print(gen.throw(ValueError))
```

**Intermediate Level**: Frameworks use this for **cancellation** propagation—asyncio has different primitives today.

**Expert Level**: If exception not handled inside generator, propagates to `throw` caller.

**Key Points**

- Use for advanced control flow, not everyday parsing.
- Test both handled and unhandled paths.
- Prefer `contextlib` for resource cleanup.

---

### close()

**Beginner Level**: `g.close()` raises `GeneratorExit` at current suspension point; generator should clean up in `finally`.

```python
def resource():
    print("open")
    try:
        yield 1
    finally:
        print("close")


r = resource()
print(next(r))
r.close()
```

**Intermediate Level**: **File-backed generator** should close handles in `finally`—or use `yield from` with context manager via `@contextmanager`.

**Expert Level**: GC may close generators; do not rely on it for critical cleanup—use explicit context managers.

**Key Points**

- Always use `try/finally` for OS resources inside generators.
- `close` is idempotent-ish—second close is safe.
- Combine with `contextlib.closing` when exposing raw generators.

---

## 17.4 Generator Usage

### Memory Efficiency

**Beginner Level**: Generators **do not** build the full sequence in RAM—only one active item (plus frame overhead).

```python
def big_range(n: int):
    for i in range(n):
        yield i


# sum(big_range(10_000_000)) uses O(1) extra list memory vs list(range(...))
```

**Intermediate Level**: **Web server** streaming CSV export: `yield` rows as strings instead of concatenating a giant blob.

```python
def csv_stream(rows):
    yield "id,name\n"
    for r in rows:
        yield f'{r["id"]},{r["name"]}\n'
```

**Expert Level**: Watch **hidden materialization**: `list(gen)`, `sorted(gen)`, `max(gen)` consume fully—chain only while each stage stays streaming.

**Key Points**

- Generators trade CPU for memory predictability.
- Nested generators can still buffer if inner stage does.
- Profile RSS on real datasets.

---

### Lazy Evaluation

**Beginner Level**: Values are computed **on demand** when you iterate—not when you define the generator.

```python
def expensive(n):
    print("eval", n)
    yield n * n


g = expensive(3)  # no print yet
next(g)
```

**Intermediate Level**: **API polling**: fetch next page only when consumer asks—pairs with `for item in page_items`.

**Expert Level**: Lazy pipelines can **delay errors** until consumption—integration tests must actually iterate.

**Key Points**

- Side effects happen during iteration, not at definition.
- Document error timing for API clients.
- Debugging: `list()` forces evaluation.

---

### Pipeline Pattern

**Beginner Level**: Output of one generator feeds another: `parse(lines)` → `filter(errors)` → `map(normalize)`.

```python
def lines(path: str):
    with open(path, encoding="utf-8") as f:
        yield from f


def errors_only(ls):
    for ln in ls:
        if "ERROR" in ln:
            yield ln.strip()


def to_records(ls):
    for ln in ls:
        yield {"msg": ln.split("ERROR", 1)[-1].strip()}


# pipeline
recs = to_records(errors_only(lines("app.log")))
```

**Intermediate Level**: **Scraping**: fetch URL → parse HTML → extract links as chained generators.

**Expert Level**: Add **backpressure** with queues when producer outpaces consumer in threaded/async systems.

**Key Points**

- Small stages are testable in isolation.
- Avoid `list()` between stages in hot paths.
- Log at stage boundaries sparingly.

---

### Infinite Sequences

**Beginner Level**: `itertools.count`, `repeat`, custom `while True`—always slice with `islice`.

```python
import itertools

first_5 = list(itertools.islice(itertools.count(), 5))
```

**Intermediate Level**: **Retry with increasing delay** as infinite stream cut by `takewhile`.

```python
import itertools
import time


def backoff_delays(start: float = 0.1, factor: float = 2.0):
    t = start
    while True:
        yield t
        t *= factor


for delay in itertools.islice(backoff_delays(), 5):
    time.sleep(min(delay, 2.0))
```

**Expert Level**: Document **non-terminating** iterators in public APIs; provide `take(n)` helpers.

**Key Points**

- `islice` prevents runaway loops.
- `takewhile` adds conditional stop.
- Tests must not hang—bound iterations.

---

### Producer-Consumer

**Beginner Level**: Producer `yield`s items; consumer iterates—often in same thread.

```python
def produce():
    for i in range(3):
        yield i


def consume(items):
    for x in items:
        print("got", x)


consume(produce())
```

**Intermediate Level**: **`queue.Queue`** bridges threads: producer puts, consumer gets—generators alone are not thread-safe for shared mutation.

```python
import queue
import threading


def producer(q: queue.Queue[int]) -> None:
    for i in range(5):
        q.put(i)
    q.put(-1)  # sentinel


def consumer(q: queue.Queue[int]) -> None:
    while True:
        item = q.get()
        if item == -1:
            break
        print(item)


q: queue.Queue[int] = queue.Queue()
threading.Thread(target=producer, args=(q,)).start()
consumer(q)
```

**Expert Level**: **asyncio.Queue** for async producer-consumer; `multiprocessing` for CPU-bound with picklable iterators.

**Key Points**

- Generators excel in-process pipelines.
- Cross-thread needs queues or channels.
- Sentinels or `join` patterns avoid leaks.

---

## 17.5 itertools

### count

**Beginner Level**: `count(start=0, step=1)` infinite arithmetic sequence.

```python
import itertools

for i in zip(range(3), itertools.count(100, 10)):
    print(i)
```

**Intermediate Level**: Assign **monotonic ids** in stream processing (still prefer DB sequences for durability).

**Expert Level**: Combine with **`map`** for derived streams: `map(lambda i: f"row-{i}", itertools.count())`.

**Key Points**

- Infinite—bound with `islice` or `zip`.
- `step` can be float.
- Not a replacement for UUIDs in distributed systems.

---

### cycle

**Beginner Level**: Repeats iterable forever.

```python
import itertools

colors = itertools.cycle(["red", "green", "blue"])
print([next(colors) for _ in range(5)])
```

**Intermediate Level**: **Round-robin** workers assigning jobs in scraper pools (conceptual).

**Expert Level**: `cycle` needs finite iterable—empty iterable errors immediately.

**Key Points**

- Memory stores a copy of the iterable for repetition.
- Useful for test fixtures and schedulers.
- Avoid unbounded `zip` with infinite `cycle` without bound.

---

### repeat

**Beginner Level**: `repeat(obj[, times])` yields same object repeatedly—`times` optional for finite.

```python
import itertools

print(list(itertools.repeat("x", 3)))
```

**Intermediate Level**: **`map` with repeat** to call `func` with fixed arg: `map(str.upper, repeat("a"))` is odd—prefer `starmap`.

**Expert Level**: **Infinite repeat** shares same object reference—mutable objects mutate once for all consumers if you mutate in place.

**Key Points**

- Immutable values are safe with infinite `repeat`.
- For mutable defaults, use factory pattern instead.
- `repeat(None)` sometimes used as filler in `zip_longest`.

---

### chain

**Beginner Level**: `chain(*iterables)` flattens one level lazily.

```python
import itertools

list(itertools.chain([1, 2], [3], (4, 5)))
```

**Intermediate Level**: **Merge log files** as single line iterator.

```python
from pathlib import Path
import itertools


def all_lines(paths: list[Path]):
    files = (p.open(encoding="utf-8") for p in paths)
    return itertools.chain.from_iterable(files)
```

**Expert Level**: `from_iterable` avoids `*` splatting huge argument lists—takes iterable of iterables.

**Key Points**

- One level only—recursive flatten needs recipe.
- `from_iterable` is lazy; does not open all files eagerly if inner iterables are lazy.
- Close files: prefer explicit context managers per file or `ExitStack`.

---

### Combining and Grouping

**Beginner Level**: `groupby(iterable, key)` groups **consecutive** equal keys—**sort first** if you need global groups.

```python
import itertools

rows = [("east", 1), ("east", 2), ("west", 3)]
for k, g in itertools.groupby(rows, key=lambda r: r[0]):
    print(k, list(g))
```

**Intermediate Level**: **`zip_longest`** for uneven columns in CSV-like data; **`product`** for test case combinations.

```python
import itertools

cases = itertools.product(["GET", "POST"], ["/a", "/b"])
print(list(cases))
```

**Expert Level**: **`pairwise` (3.10+)** for sliding windows; **`groupby`** with complex keys for sessionization of web logs by user id (after sort by user then time).

**Key Points**

- `groupby` is not SQL GROUP BY—sort by key first.
- `tee` duplicates iterators at memory/time cost.
- Prefer `more_itertools` for chunking/windowed recipes if allowed.

---

## Best Practices

1. Prefer **generator functions** over hand-written iterator classes unless you need extra methods.
2. Use **`with` statements** for files even inside generators—avoid leaking handles in `__next__`.
3. **Bound** infinite iterators with `islice`, `zip`, or explicit breaks.
4. Keep **pipeline stages small** and unit-test each with sample iterators.
5. Remember generators are **single-pass**—rebuild or `tee` if multiple consumers.
6. Do not rely on GC for **cleanup**—use `try/finally` or context managers.
7. For threads/processes, use **queues** rather than sharing generator state.
8. Document whether iteration is **restartable** for your types.
9. Avoid **`list()`** between streaming stages in memory-sensitive jobs.
10. Use **`yield from`** to delegate to sub-iterators cleanly.

---

## Common Mistakes to Avoid

1. Calling **`list()`** on an infinite iterator.
2. Using **`groupby`** without sorting by the same key—wrong groups.
3. Assuming **`iter(iterator)`** resets—it usually returns same exhausted iterator.
4. **Leaking file handles** in generator-based iterators without `with`/`finally`.
5. **Consuming** the same generator twice unintentionally.
6. Using **`repeat(mutable_list)`** and mutating in place—shared surprise.
7. **`next()`** without priming **`send()`**-based coroutine generators.
8. Mixing **sync iterators** with **async for** without bridging.
9. **Materializing** giant intermediate lists in ETL “for convenience.”
10. Ignoring that **errors** may surface late due to laziness—test full iteration.

---

*End of Topic 17 — Generators and Iterators.*
