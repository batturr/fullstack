# Asynchronous Programming and Concurrency in Python

Threading, multiprocessing, `asyncio`, and `concurrent.futures` let Python serve **high-throughput APIs**, **parallel ETL**, **real-time** pipelines, and **CPU-bound** **ML** preprocessing. This guide maps each tool to the **GIL**, **I/O** waits, and **process** isolation.

---

## 📑 Table of Contents

1. [29.1 Threading](#291-threading)
   - [29.1.1 The `threading` module](#2911-the-threading-module)
   - [29.1.2 Thread creation](#2912-thread-creation)
   - [29.1.3 Synchronization primitives](#2913-synchronization-primitives)
   - [29.1.4 Locks and `RLock`](#2914-locks-and-rlock)
   - [29.1.5 Semaphores](#2915-semaphores)
   - [29.1.6 Conditions](#2916-conditions)
   - [29.1.7 Thread pools](#2917-thread-pools)
2. [29.2 Multiprocessing](#292-multiprocessing)
   - [29.2.1 The `multiprocessing` module](#2921-the-multiprocessing-module)
   - [29.2.2 Process creation](#2922-process-creation)
   - [29.2.3 Inter-process communication](#2923-inter-process-communication)
   - [29.2.4 Queues](#2924-queues)
   - [29.2.5 Pipes](#2925-pipes)
   - [29.2.6 Shared memory](#2926-shared-memory)
   - [29.2.7 Process pools](#2927-process-pools)
3. [29.3 asyncio](#293-asyncio)
   - [29.3.1 Coroutines](#2931-coroutines)
   - [29.3.2 `async` / `await`](#2932-async--await)
   - [29.3.3 Event loop](#2933-event-loop)
   - [29.3.4 Tasks](#2934-tasks)
   - [29.3.5 Futures (asyncio)](#2935-futures-asyncio)
   - [29.3.6 Creating async code](#2936-creating-async-code)
   - [29.3.7 Running async programs](#2937-running-async-programs)
4. [29.4 Async patterns](#294-async-patterns)
   - [29.4.1 Gathering concurrency](#2941-gathering-concurrency)
   - [29.4.2 Sequential async](#2942-sequential-async)
   - [29.4.3 Timeouts](#2943-timeouts)
   - [29.4.4 Error handling](#2944-error-handling)
   - [29.4.5 Async generators](#2945-async-generators)
   - [29.4.6 Async context managers](#2946-async-context-managers)
5. [29.5 Concurrent execution — `concurrent.futures`](#295-concurrent-execution--concurrentfutures)
   - [29.5.1 Module overview](#2951-module-overview)
   - [29.5.2 `ThreadPoolExecutor`](#2952-threadpoolexecutor)
   - [29.5.3 `ProcessPoolExecutor`](#2953-processpoolexecutor)
   - [29.5.4 Executor interface](#2954-executor-interface)
   - [29.5.5 `map` and `submit`](#2955-map-and-submit)
6. [Best Practices](#best-practices)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 29.1 Threading

### 29.1.1 The `threading` module

**Beginner Level:** Threads share memory inside one **Python process**—good for **blocking I/O** (HTTP calls, DB) while other threads run.

```python
# Beginner: two threads printing
import threading


def work(name: str):
    print(f"hello from {name}")


t1 = threading.Thread(target=work, args=("A",))
t2 = threading.Thread(target=work, args=("B",))
t1.start()
t2.start()
t1.join()
t2.join()
```

**Intermediate Level:** The **GIL** limits **CPU-bound** parallelism in CPython threads—use **multiprocessing** or **native** extensions for **numeric** hot loops.

```python
# Intermediate: I/O-bound use case — fetch URLs (use requests in real code)
import threading
import urllib.request


def fetch(url: str, out: dict, lock: threading.Lock):
    with lock:
        out[url] = len(urllib.request.urlopen(url, timeout=5).read())


results = {}
lock = threading.Lock()
threads = [
    threading.Thread(target=fetch, args=("https://example.com", results, lock)),
]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

**Expert Level:** **`threading.local()`** for **per-thread** state in **WSGI**-like servers; combine with **connection pools** carefully—pools must be **thread-safe**.

```python
# Expert: thread-local HTTP session (conceptual)
import threading

_tls = threading.local()


def get_session():
    s = getattr(_tls, "session", None)
    if s is None:
        import requests

        _tls.session = requests.Session()
    return _tls.session
```

#### Key Points — threading module

- **daemon** threads exit abruptly when main ends—avoid for **critical** flush work.
- Prefer **`concurrent.futures`** for **pool**-shaped workloads.
- **Race conditions** are easy—default to **queues** or **locks**.

---

### 29.1.2 Thread creation

**Beginner Level:** `Thread(target=fn, args=(...))` then **`start()`**.

```python
import threading


def tick():
    print("tick")


threading.Thread(target=tick).start()
```

**Intermediate Level:** Subclass **`Thread`** and override **`run`** for structured **worker** loops in **ingestion** services.

```python
class Worker(threading.Thread):
    def __init__(self, q: "queue.Queue"):
        super().__init__()
        self.q = q

    def run(self):
        while True:
            item = self.q.get()
            if item is None:
                break
            process(item)
            self.q.task_done()
```

**Expert Level:** **Name threads** for **debugging** (`name=`); cap stacks; avoid creating **unbounded** threads per **request** in **API** servers.

```python
threading.Thread(target=work, name="checkout-worker-3", daemon=True).start()
```

#### Key Points — thread creation

- **`join`** to wait for completion.
- **Exceptions** in threads print to **stderr** by default—use **`threading.excepthook`** (3.8+) or wrappers.
- **Pool** instead of **per-task** threads at scale.

---

### 29.1.3 Synchronization primitives

**Beginner Level:** When threads share **mutable** data, coordinate updates with **locks** or **queues**.

```python
import threading

balance = 0
lock = threading.Lock()


def deposit():
    global balance
    for _ in range(100_000):
        with lock:
            balance += 1
```

**Intermediate Level:** **Lock granularity** trades **contention** vs **correctness**—hold locks **briefly** in **payment** ledgers.

```python
# Intermediate: minimize critical section
with lock:
    snapshot = balance
# compute outside lock
fee = compute_fee(snapshot)
with lock:
    balance -= fee
```

**Expert Level:** **Deadlock** prevention: **global lock order**, **timeouts** (`acquire(timeout=...)`), **lock-free** structures (`queue.Queue`).

```python
# Expert: always acquire locks in consistent order
LOCK_A = threading.Lock()
LOCK_B = threading.Lock()


def path1():
    with LOCK_A:
        with LOCK_B:
            ...


def path2():
    with LOCK_A:
        with LOCK_B:
            ...
```

#### Key Points — synchronization

- Prefer **`queue.Queue`** for **producer/consumer**.
- **Don't call blocking code** inside locks if it can wait on another thread holding a lock.
- **Test** under **thread sanitizer**-like stress (hard in Python—use design discipline).

---

### 29.1.4 Locks and `RLock`

**Beginner Level:** `Lock` is **non-reentrant**—same thread **cannot** acquire twice.

```python
import threading

lock = threading.Lock()
with lock:
    ...
```

**Intermediate Level:** **`RLock`** (reentrant) allows nested **`with`** in **recursive** or layered **API** wrappers.

```python
import threading

r = threading.RLock()
with r:
    with r:
        print("ok")
```

**Expert Level:** **RLock** hides **design smells**—often indicates **refactor** to smaller functions; still useful in **framework** code with **callbacks**.

```python
# Expert: document reentrancy requirements in docstrings
```

#### Key Points — locks

- **`Lock` cheaper** than **`RLock`** when non-reentrant is fine.
- **`with lock:`** ensures release on exceptions.
- Avoid **I/O** under **`RLock`** if reentering same thread unexpectedly.

---

### 29.1.5 Semaphores

**Beginner Level:** **`Semaphore(n)`** allows **n** concurrent holders—**rate limit** **scrapers** hitting **partner** APIs.

```python
import threading

sem = threading.Semaphore(3)


def limited():
    with sem:
        call_external_api()
```

**Intermediate Level:** **`BoundedSemaphore`** errors if **release** too many times—catches **bugs**.

```python
import threading

b = threading.BoundedSemaphore(2)
```

**Expert Level:** **`Semaphore(1)`** is like a lock but **different API**—prefer **`Lock`** unless **counting** semantics matter.

```python
# Expert: pool of download slots for CDN origin protection
download_slots = threading.Semaphore(20)
```

#### Key Points — semaphores

- **Resource pools** map naturally to semaphores.
- **Fairness** not guaranteed—starvation possible under load.
- Pair with **metrics** on **wait time**.

---

### 29.1.6 Conditions

**Beginner Level:** **`Condition`** lets threads **wait** until another **notifies**—classic **bounded buffer**.

```python
import threading

buf = []
cv = threading.Condition()


def producer():
    with cv:
        buf.append(1)
        cv.notify()


def consumer():
    with cv:
        while not buf:
            cv.wait()
        item = buf.pop()
    return item
```

**Intermediate Level:** Use **`notify_all`** when **multiple** waiters may proceed—**job** **scheduler** wakeups.

```python
with cv:
    ready_jobs.extend(new_jobs)
    cv.notify_all()
```

**Expert Level:** **Spurious wakeups** require **`while not predicate: wait()`** loops—document **predicates** clearly in **microservices** **worker** pools.

```python
# Expert pattern
with cv:
    while not work_available():
        cv.wait()
    job = pop_job()
```

#### Key Points — conditions

- Always **`wait`** inside **`with condition:`**.
- **`threading.Event`** simpler for **one-shot** signals.
- Test **timeouts** on **`wait(timeout)`** for **shutdown**.

---

### 29.1.7 Thread pools

**Beginner Level:** **`concurrent.futures.ThreadPoolExecutor`** maps **functions** over **iterables** with a **fixed** thread count—**web** **scraping** with **politeness** caps.

```python
from concurrent.futures import ThreadPoolExecutor, as_completed


def fetch(url: str) -> str:
    return url.upper()


with ThreadPoolExecutor(max_workers=8) as ex:
    futs = [ex.submit(fetch, u) for u in ["a", "b", "c"]]
    for f in as_completed(futs):
        print(f.result())
```

**Intermediate Level:** **`executor.map`** preserves **order** (with lazy iteration); handle **exceptions** per future.

```python
list(ThreadPoolExecutor(max_workers=4).map(fetch, urls))
```

**Expert Level:** **Queue + fixed workers** pattern for **backpressure** in **streaming** **pipelines**—don't **submit** unbounded tasks without **throttling**.

```python
# Expert: bounded queue between stages
import queue
import threading


def stage(q_in: queue.Queue, q_out: queue.Queue):
    while True:
        item = q_in.get()
        if item is None:
            q_out.put(None)
            break
        q_out.put(transform(item))
```

#### Key Points — thread pools

- **`max_workers`** often **2–32×** CPUs for **I/O**; **~CPUs** for **CPU**+**GIL** aware work.
- **Context manager** shuts down **cleanly**.
- **Cancel** futures carefully—**running** threads **ignore** cancellation.

---

## 29.2 Multiprocessing

### 29.2.1 The `multiprocessing` module

**Beginner Level:** Spawns **new Python interpreters**—true **parallelism** for **CPU-bound** Python code on **multi-core** hosts.

```python
from multiprocessing import Process


def cpu_work(n: int) -> int:
    return sum(i * i for i in range(n))


if __name__ == "__main__":
    p = Process(target=cpu_work, args=(5_000_000,))
    p.start()
    p.join()
```

**Intermediate Level:** **`spawn`** start method on **Windows/macOS**—must **guard** entry with **`if __name__ == "__main__"`** to avoid **fork bombs** on **import**.

```python
# Intermediate: required pattern on spawn platforms
if __name__ == "__main__":
    ...
```

**Expert Level:** **Pickle** limitations—targets must be **top-level** functions; **logging** config must **reinitialize** in child processes.

```python
# Expert: initializer for worker processes
from multiprocessing import Pool


def init_worker():
    import logging

    logging.basicConfig(level=logging.INFO)


with Pool(4, initializer=init_worker) as pool:
    pool.map(cpu_work, [1000, 2000, 3000])
```

#### Key Points — multiprocessing

- **Memory** overhead higher than threads.
- **Data** copying costs dominate small tasks.
- **Jupyter** notebooks complicate **`__main__`** guards—extract modules.

---

### 29.2.2 Process creation

**Beginner Level:** `Process(target=fn, args=...)`.

```python
from multiprocessing import Process


def say(x):
    print(x)


Process(target=say, args=("hi",)).start()
```

**Intermediate Level:** **`Process` subclass** with **`run`** for **long-lived** **workers** reading from **queues**.

```python
from multiprocessing import Process, Queue


class Consumer(Process):
    def __init__(self, q: Queue):
        super().__init__()
        self.q = q

    def run(self):
        while True:
            item = self.q.get()
            if item is None:
                break
            handle(item)
```

**Expert Level:** **Affinity**, **priority**, and **niceness** are **OS** APIs—use **carefully** in **Kubernetes** where **cgroups** already **throttle**.

```python
# Expert: set CPU affinity (Linux) via os.sched_setaffinity in worker
```

#### Key Points — process creation

- **`join`** with **timeout** for **graceful** shutdown paths.
- **`terminate`** is **coarse**—risks **corruption**.
- **Zombie** processes if not **reaped**—use **context managers**.

---

### 29.2.3 Inter-process communication

**Beginner Level:** Processes **don't share** Python objects—use **picklable** messages.

```python
from multiprocessing import Process, SimpleQueue


def worker(q: SimpleQueue):
    q.put({"ok": True})


if __name__ == "__main__":
    q = SimpleQueue()
    Process(target=worker, args=(q,)).start()
    print(q.get())
```

**Intermediate Level:** **`Manager`** exposes **proxy** objects—convenient but **slower** than **queues**.

```python
from multiprocessing import Manager

with Manager() as m:
    d = m.dict()
    l = m.list(range(10))
```

**Expert Level:** For **low latency**, prefer **`multiprocessing.shared_memory`** (3.8+) or **Rust** extensions; **Managers** over **network** are **rare** in **prod**.

```python
# Expert: choose IPC based on latency SLO
IPC_OPTIONS = {"queue": "general", "pipe": "duplex small messages", "shm": "large arrays"}
```

#### Key Points — IPC

- **Pickle** is not a **security** boundary—never **`recv`** from **untrusted** processes without validation.
- **Message size** matters—chunk **large** payloads.
- **Backpressure** with **bounded** queues.

---

### 29.2.4 Queues

**Beginner Level:** **`Queue`** is **process-safe** for **producer/consumer** **ETL** stages.

```python
from multiprocessing import Process, Queue


def producer(q: Queue):
    for i in range(5):
        q.put(i)


def consumer(q: Queue):
    for _ in range(5):
        print(q.get())


if __name__ == "__main__":
    q = Queue()
    Process(target=producer, args=(q,)).start()
    Process(target=consumer, args=(q,)).start()
```

**Intermediate Level:** **`join_thread`** on **queue feeder** thread when **serializing** background puts—read docs for **`Queue.cancel_join_thread`**.

```python
# Intermediate: poison pill shutdown
STOP = None


def worker(q: Queue):
    while True:
        item = q.get()
        if item is STOP:
            break
        process(item)
```

**Expert Level:** **`maxsize`** provides **backpressure**—tune for **memory** vs **throughput** in **video** **transcoding** farms.

```python
from multiprocessing import Queue

q = Queue(maxsize=100)
```

#### Key Points — queues

- **`SimpleQueue`** fewer features, **faster** for **simple** cases.
- **`get(timeout)`** for **shutdown** responsiveness.
- **JoinableQueue** tracks **task_done** for **barriers**.

---

### 29.2.5 Pipes

**Beginner Level:** **`Pipe()`** returns **two** connection ends for **duplex** or **simplex** messaging between **two** processes.

```python
from multiprocessing import Process, Pipe


def child(conn):
    conn.send({"pong": True})
    conn.close()


if __name__ == "__main__":
    parent_conn, child_conn = Pipe()
    Process(target=child, args=(child_conn,)).start()
    print(parent_conn.recv())
    parent_conn.close()
```

**Intermediate Level:** **One reader** per end—don't **multiplex** arbitrarily without **locking** at application layer.

```python
# Intermediate: distinguish message types
parent_conn.send(("task", 123))
```

**Expert Level:** For **many-to-many**, **Queue** or **message broker** (**Redis**, **NATS**) scales better than **O(n²)** pipes.

```python
# Expert: broker for microservices fan-out
```

#### Key Points — pipes

- **Picklable** objects only.
- **Close** unused ends to avoid **deadlocks** (EOF signaling).
- **Small** messages preferred.

---

### 29.2.6 Shared memory

**Beginner Level:** **`Value`** and **`Array`** from **`multiprocessing.sharedctypes`** wrap **ctypes** in **shared** memory for **numeric** **buffers**.

```python
from multiprocessing import Process, Value, Array


def f(counter: Value, arr: Array):
    with counter.get_lock():
        counter.value += 1
    arr[0] = 42


if __name__ == "__main__":
    counter = Value("i", 0)
    arr = Array("d", [0.0, 0.0])
    Process(target=f, args=(counter, arr)).start()
```

**Intermediate Level:** **`shared_memory.SharedMemory`** (3.8+) for **zero-copy** **NumPy** views across processes in **ML** **feature** **pipelines**.

```python
from multiprocessing import shared_memory
import numpy as np

shm = shared_memory.SharedMemory(create=True, size=10 * 8)
arr = np.ndarray((10,), dtype=np.float64, buffer=shm.buf)
arr[:] = 1.0
```

**Expert Level:** **Synchronize** updates—**race conditions** still exist; use **locks** or **atomic** operations via **NumPy**/`multiprocessing.Value`.

```python
# Expert: document memory ownership and unlink
shm.close()
shm.unlink()
```

#### Key Points — shared memory

- **Lifetime** management (`unlink`) prevents **leaks**.
- **Alignment** and **dtype** correctness critical.
- **Security**: name collisions—use **random** names in **multi-tenant** hosts.

---

### 29.2.7 Process pools

**Beginner Level:** **`Pool.map`** parallelizes **CPU** work—**batch** **image** resizing.

```python
from multiprocessing import Pool


def square(x: int) -> int:
    return x * x


if __name__ == "__main__":
    with Pool(4) as pool:
        print(pool.map(square, range(10)))
```

**Intermediate Level:** **`imap_unordered`** for **streaming** results as they finish—**data** **pipelines**.

```python
with Pool(4) as pool:
    for y in pool.imap_unordered(square, range(1000)):
        sink.write(y)
```

**Expert Level:** **`maxtasksperchild`** mitigates **memory leaks** in **long-running** **workers** processing **untrusted** inputs.

```python
with Pool(4, maxtasksperchild=100) as pool:
    pool.map(parse_file, file_list)
```

#### Key Points — process pools

- **Chunk size** tuning for **`map`** (`chunksize=`).
- **Exceptions** propagate to **parent**—wrap **worker** functions.
- **Avoid** passing **huge** arguments—use **shared memory** or **paths**.

---

## 29.3 asyncio

### 29.3.1 Coroutines

**Beginner Level:** **Coroutines** are **functions** defined with **`async def`**; calling them returns a **coroutine object**—they don't run until **awaited** or **scheduled**.

```python
async def greet():
    return "hi"


c = greet()
print(c)  # coroutine object
```

**Intermediate Level:** Coroutines **compose**—**microservices** **gateways** chain **HTTP** client calls without blocking threads.

```python
async def chain():
    a = await fetch_a()
    b = await fetch_b(a)
    return b


async def fetch_a():
    return 1


async def fetch_b(x):
    return x + 1
```

**Expert Level:** **Coroutine vs Task**: coroutine alone is **lazy**; **`create_task`** schedules **concurrent** execution on the **loop**.

```python
import asyncio


async def main():
    t = asyncio.create_task(asyncio.sleep(0.1))
    await t
```

#### Key Points — coroutines

- **`async def`** functions are **always** coroutines—even without **`await`** inside.
- **Generators** (`yield`) differ from **async generators** (`async def` + `yield`).
- **Type hints**: **`Coroutine`**, **`Awaitable`**.

---

### 29.3.2 `async` / `await`

**Beginner Level:** **`await`** suspends the **current** coroutine until the **awaited** awaitable completes—**other tasks** run meanwhile.

```python
import asyncio


async def main():
    await asyncio.sleep(1)
    print("done")


asyncio.run(main())
```

**Intermediate Level:** **Await** only inside **`async def`**—bridge from sync code with **`asyncio.run`** or **`loop.run_until_complete`** (legacy).

```python
async def fetch_all(urls: list[str]):
    import aiohttp  # pip install aiohttp

    async with aiohttp.ClientSession() as session:
        tasks = [session.get(u) for u in urls]
        responses = await asyncio.gather(*tasks)
        return [r.status for r in responses]
```

**Expert Level:** **`await`** points are **cancellation** boundaries—use **`asyncio.shield`** sparingly for **critical** **commits** paired with **app-level** idempotency.

```python
await asyncio.shield(db.commit_async())
```

#### Key Points — async/await

- **Never** call **blocking** APIs (`requests.get`, `time.sleep`) in **async** code—use **`asyncio.to_thread`** or **native** async libs.
- **`await`** propagates **exceptions** like synchronous code.
- **Color** functions: async **infects** call stack upward.

---

### 29.3.3 Event loop

**Beginner Level:** The **event loop** schedules **tasks** and **I/O callbacks**—one loop per thread typically.

```python
import asyncio

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
try:
    loop.run_until_complete(asyncio.sleep(0))
finally:
    loop.close()
```

**Intermediate Level:** **`asyncio.run`** creates loop, runs **main**, closes—**preferred** entrypoint in **scripts**.

```python
asyncio.run(main())
```

**Expert Level:** **uvloop** (Linux/macOS) accelerates loops for **FastAPI** deployments—**compatible** with **stdlib** asyncio patterns.

```python
# Expert: uvloop (optional dependency)
# import uvloop; uvloop.install()
```

#### Key Points — event loop

- **Nested loops** are **problematic**—use **`asyncio.run`** in apps.
- **Call_soon_threadsafe** bridges **threads** → **loop**.
- **Windows** uses **Proactor**; **Unix** uses **selector**—subtle **behavior** differences.

---

### 29.3.4 Tasks

**Beginner Level:** **`asyncio.create_task`** schedules a coroutine **concurrently** on the loop.

```python
import asyncio


async def main():
    t1 = asyncio.create_task(asyncio.sleep(0.2))
    t2 = asyncio.create_task(asyncio.sleep(0.2))
    await t1
    await t2


asyncio.run(main())
```

**Intermediate Level:** **Task groups** (3.11+ **`TaskGroup`**) structure **structured concurrency**—failures **cancel siblings**.

```python
async def main():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(work("a"))
        tg.create_task(work("b"))


async def work(name: str):
    await asyncio.sleep(0.1)
    print(name)
```

**Expert Level:** **Pending tasks** on shutdown—**wait** with **timeouts** and **logging** in **graceful** **Kubernetes** **SIGTERM** handlers.

```python
pending = asyncio.all_tasks()
await asyncio.wait(pending, timeout=5)
```

#### Key Points — tasks

- **Retain references** to tasks—**garbage collected** tasks may **disappear** silently (mitigated in recent Pythons—still **track** them).
- **`Task.cancel`** requests cancellation at **next await**.
- **Exceptions** in tasks bubble via **`await`** or **`gather`**.

---

### 29.3.5 Futures (asyncio)

**Beginner Level:** **`asyncio.Future`** is a **low-level** awaitable placeholder—libraries **resolve** them; app code often uses **`Task`** instead.

```python
import asyncio


async def setter(fut: asyncio.Future):
    await asyncio.sleep(0.1)
    fut.set_result(42)


async def main():
    loop = asyncio.get_running_loop()
    fut = loop.create_future()
    asyncio.create_task(setter(fut))
    print(await fut)


asyncio.run(main())
```

**Intermediate Level:** Bridge **callback** APIs with **`loop.create_future`** + **`add_done_callback`**.

```python
def legacy_call(callback):
    callback("done")


async def wrap_legacy():
    loop = asyncio.get_running_loop()
    fut = loop.create_future()

    def cb(value):
        loop.call_soon_threadsafe(fut.set_result, value)

    legacy_call(cb)
    return await fut
```

**Expert Level:** **`concurrent.futures.Future`** differs—use **`asyncio.wrap_future`** to **await** thread/process futures.

```python
import concurrent.futures
import asyncio


async def main():
    loop = asyncio.get_running_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        fut = loop.run_in_executor(pool, blocking_io)
        print(await fut)


def blocking_io():
    return 123
```

#### Key Points — futures

- Prefer **high-level** **`asyncio`** utilities in **apps**.
- **Future** vs **Task**: tasks **wrap** coroutines; futures **manual** completion.
- **Thread-safe** completion uses **`call_soon_threadsafe`**.

---

### 29.3.6 Creating async code

**Beginner Level:** Write **`async def`** **handlers** in **FastAPI**/**Starlette** for **non-blocking** **I/O**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/ping")
async def ping():
    return {"status": "ok"}
```

**Intermediate Level:** **Async iterators** (`async for`) for **streaming** **SSE**/**Kafka** consumers.

```python
async def stream_lines():
    async for line in async_open_lines("data.log"):
        yield line
```

**Expert Level:** **Libraries** expose **`asynccontextmanager`** for **acquiring** **pools**/**sessions**; **design** **protocols** for **sync+async** **dual** APIs carefully.

```python
from contextlib import asynccontextmanager


@asynccontextmanager
async def db_session():
    sess = await pool.acquire()
    try:
        yield sess
    finally:
        await pool.release(sess)
```

#### Key Points — creating async code

- **One async stack** per **request** in **web** servers.
- **Blocking** in **async** stalls the **whole** loop thread.
- **Test** with **`pytest-asyncio`**.

---

### 29.3.7 Running async programs

**Beginner Level:** **`asyncio.run(main())`** in **`__main__`**.

```python
import asyncio

asyncio.run(main())
```

**Intermediate Level:** **Frameworks** (**Uvicorn**) run loops for you—**don't** **`asyncio.run`** inside **workers**.

```python
# Intermediate: ASGI server owns the loop
# uvicorn main:app
```

**Expert Level:** **Multiple loops** in **threads** for **integration** with **Tkinter**/some **GUIs**—**expert-only** bridging.

```python
# Expert: run coroutine from sync via run_coroutine_threadsafe
```

#### Key Points — running async

- **Top-level** **`await`** (3.8+ in **async REPL**) for **experimentation**.
- **Jupyter** uses **nest_asyncio** sometimes—**understand** implications.
- **Graceful shutdown**: cancel **tasks**, **close** **async generators**.

---

## 29.4 Async patterns

### 29.4.1 Gathering concurrency

**Beginner Level:** **`asyncio.gather`** runs **multiple** awaitables **concurrently** and returns **results** list.

```python
import asyncio


async def main():
    results = await asyncio.gather(fetch(1), fetch(2), fetch(3))
    print(results)


async def fetch(x):
    await asyncio.sleep(0.1)
    return x


asyncio.run(main())
```

**Intermediate Level:** **`return_exceptions=True`** collects **errors** instead of **raising**—**batch** **health checks** across **microservices**.

```python
statuses = await asyncio.gather(*[check(svc) for svc in services], return_exceptions=True)
```

**Expert Level:** **`gather`** doesn't **limit** concurrency—use **`Semaphore`** for **thousands** of **tasks**.

```python
sem = asyncio.Semaphore(50)


async def bounded_fetch(url: str):
    async with sem:
        return await do_fetch(url)
```

#### Key Points — gathering

- **Order** preserved in **results**.
- **Fail-fast** vs **collect-all-errors** is a **product** decision.
- Prefer **`TaskGroup`** for **structured** semantics on **3.11+**.

---

### 29.4.2 Sequential async

**Beginner Level:** **`await`** one after another when **dependencies** exist—**OAuth** **token** then **API** call.

```python
async def flow():
    token = await login()
    data = await call_api(token)
    return data
```

**Intermediate Level:** **Avoid** **false** **sequentialization**—independent calls should **`gather`**.

```python
# Bad: sequential when parallel possible
# a = await fetch_a(); b = await fetch_b()
# Good:
a, b = await asyncio.gather(fetch_a(), fetch_b())
```

**Expert Level:** **Pipelines** mix **stages**—**async queues** connect **producers** and **consumers** with **backpressure**.

```python
async def producer(q: asyncio.Queue):
    for i in range(100):
        await q.put(i)
    await q.put(None)


async def consumer(q: asyncio.Queue):
    while True:
        item = await q.get()
        if item is None:
            break
        await handle(item)
```

#### Key Points — sequential async

- **Profile** parallel vs sequential **latency**.
- **Chained** **retries** belong in **policy** functions.
- **Readable** **linear** code for **complex** **business** rules.

---

### 29.4.3 Timeouts

**Beginner Level:** **`asyncio.wait_for`** wraps awaitables with **timeout**.

```python
await asyncio.wait_for(slow(), timeout=1.0)
```

**Intermediate Level:** **Per-hop** timeouts in **service** **mesh** style clients—**deadlines** propagate via **context**.

```python
import asyncio


async def call_with_deadline(coro, deadline_s: float):
    try:
        return await asyncio.wait_for(coro, timeout=deadline_s)
    except asyncio.TimeoutError:
        return None
```

**Expert Level:** **`wait_for` cancellation** semantics—ensure **idempotent** **cleanup** in **`finally`** blocks closing **sockets**.

```python
async def fetch():
    try:
        return await asyncio.wait_for(open_stream(), 2)
    except asyncio.TimeoutError:
        metrics.timeout.inc()
        raise
    finally:
        await cleanup_partial()
```

#### Key Points — timeouts

- Distinguish **connect** vs **read** timeouts in **HTTP** libraries.
- **Cumulative** timeouts across **chains** need **budgeting**.
- Log **SLO** breaches with **sampling**.

---

### 29.4.4 Error handling

**Beginner Level:** **`try/except`** around **`await`** catches **exceptions** from **coroutines**.

```python
try:
    await might_fail()
except ValueError:
    ...
```

**Intermediate Level:** **`gather(..., return_exceptions=True)`** returns **`Exception`** instances—**filter** them.

```python
results = await asyncio.gather(*tasks, return_exceptions=True)
for r in results:
    if isinstance(r, Exception):
        log.error("task failed", exc_info=r)
```

**Expert Level:** **Exception groups** (3.11+) with **`TaskGroup`**—handle **multiple** failures **explicitly**.

```python
try:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(fail_a())
        tg.create_task(fail_b())
except* ValueError as eg:
    print("value errors", eg.exceptions)
```

#### Key Points — error handling

- **Cancel** propagation—**handle** **`CancelledError`** carefully (often **re-raise**).
- **Retries** with **exponential backoff** + **jitter** for **transient** **I/O**.
- **Circuit breakers** protect **downstream** **databases**.

---

### 29.4.5 Async generators

**Beginner Level:** **`async def` + `yield`** produces **async iterators**—**stream** **records** from **async** **DB** cursors.

```python
async def naturals(n: int):
    for i in range(n):
        await asyncio.sleep(0)
        yield i


async def main():
    async for x in naturals(3):
        print(x)


asyncio.run(main())
```

**Intermediate Level:** **`async for`** in **FastAPI** **`StreamingResponse`** for **NDJSON** **logs**.

```python
async def lines():
    async for row in db_cursor():
        yield (str(row) + "\n").encode()
```

**Expert Level:** **`aclosing`** from **`contextlib`** ensures **async generator** **cleanup** on **break**/**exceptions**.

```python
from contextlib import aclosing


async def main():
    async with aclosing(stream()) as agen:
        async for item in agen:
            if done(item):
                break
```

#### Key Points — async generators

- **Manually close** or use **`aclosing`** to avoid **RuntimeWarning**.
- **Backpressure** via **slow** **consumers** naturally **pauses** **producers** (`await` in **yield** loop).
- **Type** as **`AsyncIterator[T]`**.

---

### 29.4.6 Async context managers

**Beginner Level:** **`async with`** manages **async** **setup/teardown**—**database** sessions, **HTTP** clients.

```python
class AsyncResource:
    async def __aenter__(self):
        await connect()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await disconnect()


async def main():
    async with AsyncResource():
        ...
```

**Intermediate Level:** **`@asynccontextmanager`** decorator for **simple** **async** **contexts**.

```python
from contextlib import asynccontextmanager


@asynccontextmanager
async def timer(name: str):
    t0 = time.monotonic()
    yield
    print(name, time.monotonic() - t0)
```

**Expert Level:** **Starlette/FastAPI lifespan** uses **async context** for **startup/shutdown** **hooks**—**close** **pools** **deterministically**.

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_pool()
    yield
    await close_db_pool()
```

#### Key Points — async context managers

- **`__aexit__`** **swallows** exceptions if it returns **`True`**—rarely desired.
- **Compose** nested **`async with`** for **resources**.
- **Test** **failure** paths **simulate** **exceptions** in **`__aenter__`**.

---

## 29.5 Concurrent execution — `concurrent.futures`

### 29.5.1 Module overview

**Beginner Level:** **`concurrent.futures`** provides **high-level** **executor** APIs over **threads** and **processes**.

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
```

**Intermediate Level:** **Executors** abstract **pool** lifecycle—**map**, **submit**, **shutdown**.

```python
ex = ThreadPoolExecutor(max_workers=4)
fut = ex.submit(pow, 2, 3)
print(fut.result())
ex.shutdown(wait=True)
```

**Expert Level:** Integrate with **`asyncio.loop.run_in_executor`** to **offload** **blocking** **CPU** or **legacy** **SDK** calls from **async** **web** **workers**.

```python
loop = asyncio.get_running_loop()
await loop.run_in_executor(None, blocking_call, arg)
```

#### Key Points — module overview

- **Thread** executor for **I/O**; **Process** for **CPU**-bound **Python**.
- **Future** interface **consistent** across backends.
- **Contextvars** copy to threads in **3.7+**—still **watch** **globals**.

---

### 29.5.2 `ThreadPoolExecutor`

**Beginner Level:** **Pool of threads** for **blocking** **I/O**—**S3** uploads, **SMTP**, **JDBC**-like drivers.

```python
from concurrent.futures import ThreadPoolExecutor


def upload(path: str) -> str:
    return f"uploaded {path}"


with ThreadPoolExecutor(max_workers=10) as ex:
    futures = [ex.submit(upload, p) for p in paths]
```

**Intermediate Level:** **`executor.map`** for **ordered** **results** with **iterable** **inputs**.

```python
with ThreadPoolExecutor(max_workers=8) as ex:
    for result in ex.map(upload, paths):
        print(result)
```

**Expert Level:** **`thread_name_prefix`** for **debugging** **thread dumps** in **production** **APM**.

```python
with ThreadPoolExecutor(max_workers=8, thread_name_prefix="s3") as ex:
    ...
```

#### Key Points — ThreadPoolExecutor

- **Default** **`max_workers`** is **min(32, os.cpu_count()+4)** on **3.8+**.
- **Queue** depth grows with **submitted** work—**bound** submission rate.
- **GIL** still applies to **Python** bytecode.

---

### 29.5.3 `ProcessPoolExecutor`

**Beginner Level:** **CPU**-parallel **Python**—**feature** **engineering** on **multicore** **batch** jobs.

```python
from concurrent.futures import ProcessPoolExecutor


def heavy(x: int) -> int:
    return x * x


if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=4) as ex:
        print(list(ex.map(heavy, range(20))))
```

**Intermediate Level:** **Picklable** **top-level** functions only—**lambdas** and **nested** defs **fail** on **spawn**.

```python
# Intermediate: define heavy at module level
```

**Expert Level:** **initializer** per **worker** for **expensive** **model** **loads** in **ML** **inference** **workers**.

```python
_model = None


def init():
    global _model
    _model = load_model()


def infer(batch):
    return _model.predict(batch)


if __name__ == "__main__":
    with ProcessPoolExecutor(4, initializer=init) as ex:
        print(ex.submit(infer, [1, 2, 3]).result())
```

#### Key Points — ProcessPoolExecutor

- **`if __name__ == "__main__"`** guard **required** on **Windows/macOS**.
- **Large** **model** **per process** multiplies **RAM**.
- **Chunk** inputs to **amortize** **IPC**.

---

### 29.5.4 Executor interface

**Beginner Level:** **`submit(fn, *args)`** returns **`Future`**; **`result()`** blocks until done.

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=2) as ex:
    fut = ex.submit(lambda: 7)
    print(fut.result())
```

**Intermediate Level:** **`Future.add_done_callback`** integrates **callback**-style **metrics** without blocking **callers**.

```python
def done(f):
    try:
        f.result()
        metrics.success.inc()
    except Exception:
        metrics.failure.inc()


fut.add_done_callback(done)
```

**Expert Level:** **`wait(fs, return_when=FIRST_COMPLETED)`** builds **reactive** **pipelines** mixing **completed** futures.

```python
from concurrent.futures import wait, FIRST_COMPLETED

done, not_done = wait(set(futures), return_when=FIRST_COMPLETED)
```

#### Key Points — executor interface

- **`shutdown(wait=False)`** for **fast** **process** exit—**risk** **leaking** threads.
- **`cancel`** only if **not started**.
- **Timeouts** on **`result(timeout=...)`** for **resilience**.

---

### 29.5.5 `map` and `submit`

**Beginner Level:** **`map(fn, iterable)`** applies **fn** **like** built-in **map** but **concurrently**.

```python
with ThreadPoolExecutor(max_workers=4) as ex:
    squares = list(ex.map(lambda x: x * x, range(10)))
```

**Intermediate Level:** **`submit`** enables **different** **functions** per **task** and **heterogeneous** **workloads**.

```python
with ThreadPoolExecutor(max_workers=4) as ex:
    futs = []
    futs.append(ex.submit(task_a, 1))
    futs.append(ex.submit(task_b, "x"))
    for f in as_completed(futs):
        print(f.result())
```

**Expert Level:** **`chunksize`** on **ProcessPoolExecutor.map** **reduces** **IPC** overhead for **large** **iterables**.

```python
with ProcessPoolExecutor(max_workers=8) as ex:
    ex.map(heavy, range(1_000_000), chunksize=32)
```

#### Key Points — map/submit

- **`map`** **preserves** order; **`as_completed`** yields **by finish time**.
- **Exception** in **`map`** iterator—**behavior** can **fail** **mid-stream**; **`submit`** isolates per future.
- **Backpressure**: **producer** shouldn't **enumerate** **infinite** **iterable** into **memory**.

---

## Best Practices

- Choose **asyncio** for **many** concurrent **I/O** waits on **one** thread; **threads** for **blocking** **third-party** **SDKs**; **processes** for **CPU-bound** **Python**.
- **Never** mix **unbounded** thread/process **creation** with **untrusted** load.
- **Profile** end-to-end—**parallelism** that **hurts** (overhead, contention) is common.
- **Structured concurrency** (**TaskGroup**) improves **cancellation** **hygiene**.
- **Graceful shutdown**: **poison pills**, **timeouts**, **drain** queues.
- **Observability**: **name** threads, **log** **task** **IDs**, **metric** **pool** **saturation**.
- **Security**: **unpickle** from **untrusted** **IPC** is **RCE**—treat like **`eval`**.

---

## Common Mistakes to Avoid

- **Blocking** the **event loop** (`time.sleep`, heavy **NumPy** in **async** **def**).
- **Shared** **mutable** **globals** without **locks** across **threads**.
- **Forking** after **threads** started—**deadlock** risk.
- **Omitting** **`if __name__ == "__main__"`** with **multiprocessing** on **Windows**.
- **Assuming** **`gather`** **limits** **concurrency**—it **doesn't**.
- **Swallowing** **`CancelledError`** incorrectly in **async** **cleanup**.
- **Huge** **pickled** messages between **processes**.
- **Daemon threads** for **work** that **must** **finish** on **shutdown**.
- **Ignoring** **GIL** and **expecting** **thread** **speedup** on **CPU-bound** **pure** **Python**.

---

*Concurrency is a product of your deployment model—design APIs and backpressure before chasing raw parallelism.*
