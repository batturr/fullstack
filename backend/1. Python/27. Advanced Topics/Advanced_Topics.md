# Advanced Topics in Python

This guide covers metaprogramming, descriptors, `__slots__`, multiple dispatch, AST/source inspection, and bytecode—skills used in ORMs, frameworks, linters, and performance tooling across APIs, microservices, and ML pipelines.

---

## 📑 Table of Contents

1. [27.1 Metaprogramming](#271-metaprogramming)
   - [27.1.1 Metaclasses](#2711-metaclasses)
   - [27.1.2 Metaclass `__new__` and class creation](#2712-metaclass-__new__-and-class-creation)
   - [27.1.3 `__new__` on ordinary classes](#2713-__new__-on-ordinary-classes)
   - [27.1.4 Dynamic classes and runtime schemas](#2714-dynamic-classes-and-runtime-schemas)
   - [27.1.5 Advanced `type()` — the three-argument form](#2715-advanced-type---the-three-argument-form)
   - [27.1.6 Reflection — observing objects at runtime](#2716-reflection--observing-objects-at-runtime)
   - [27.1.7 Introspection — `inspect` and callables](#2717-introspection--inspect-and-callables)
2. [27.2 Descriptors](#272-descriptors)
   - [27.2.1 Descriptor protocol](#2721-descriptor-protocol)
   - [27.2.2 `__get__`](#2722-__get__)
   - [27.2.3 `__set__`](#2723-__set__)
   - [27.2.4 `__delete__`](#2724-__delete__)
   - [27.2.5 Data vs non-data descriptors](#2725-data-vs-non-data-descriptors)
   - [27.2.6 `property` as a descriptor](#2726-property-as-a-descriptor)
3. [27.3 `__slots__`](#273-__slots__)
   - [27.3.1 Declaring `__slots__`](#2731-declaring-__slots__)
   - [27.3.2 Memory optimization in services](#2732-memory-optimization-in-services)
   - [27.3.3 `__slots__` with inheritance](#2733-__slots__-with-inheritance)
   - [27.3.4 Dynamic attributes and `__dict__`](#2734-dynamic-attributes-and-__dict__)
   - [27.3.5 Limitations and interoperability](#2735-limitations-and-interoperability)
4. [27.4 Multiple dispatch](#274-multiple-dispatch)
   - [27.4.1 `@singledispatch` and `@singledispatchmethod`](#2741-singledispatch-and-singledispatchmethod)
   - [27.4.2 Multiple dispatch libraries](#2742-multiple-dispatch-libraries)
   - [27.4.3 Generic functions](#2743-generic-functions)
   - [27.4.4 Type-based routing](#2744-type-based-routing)
   - [27.4.5 Predicate and manual dispatch](#2745-predicate-and-manual-dispatch)
5. [27.5 AST and code inspection](#275-ast-and-code-inspection)
   - [27.5.1 Abstract Syntax Trees](#2751-abstract-syntax-trees)
   - [27.5.2 The `ast` module](#2752-the-ast-module)
   - [27.5.3 The `inspect` module (source-level)](#2753-the-inspect-module-source-level)
   - [27.5.4 Source analysis for APIs](#2754-source-analysis-for-apis)
   - [27.5.5 Code generation](#2755-code-generation)
6. [27.6 Bytecode](#276-bytecode)
   - [27.6.1 Python bytecode overview](#2761-python-bytecode-overview)
   - [27.6.2 The `dis` module](#2762-the-dis-module)
   - [27.6.3 `compile()` and code objects](#2763-compile-and-code-objects)
   - [27.6.4 Optimization and CPython specifics](#2764-optimization-and-cpython-specifics)
   - [27.6.5 PyPy, JIT, and alternative VMs](#2765-pypy-jit-and-alternative-vms)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 27.1 Metaprogramming

Metaprogramming means programs that manipulate programs: classes that build classes, code that inspects code, and factories that shape APIs at import time—common in FastAPI-style dependency injection, ORMs, and schema validators.

### 27.1.1 Metaclasses

**Beginner Level:** A **metaclass** is the “class of a class.” Most classes use `type` as their metaclass. You rarely need a custom metaclass for apps; frameworks use them to register models or enforce invariants when a class body is executed.

```python
# Beginner: every class is an instance of a metaclass (usually type)
class Order:
    total: float = 0.0

print(type(Order))  # <class 'type'>
```

**Intermediate Level:** A custom metaclass subclasses `type` and overrides `__new__` / `__init__` to mutate the class namespace before the class object is finalized. A **payment gateway** plugin registry can auto-register subclasses.

```python
# Intermediate: register all PaymentBackend subclasses
class PluginMeta(type):
    registry = {}

    def __init__(cls, name, bases, namespace, **kwargs):
        super().__init__(name, bases, namespace, **kwargs)
        if bases:
            PluginMeta.registry[name] = cls


class PaymentBackend(metaclass=PluginMeta):
    def charge(self, cents: int) -> str:
        raise NotImplementedError


class StripeBackend(PaymentBackend):
    def charge(self, cents: int) -> str:
        return f"stripe:{cents}"
```

**Expert Level:** Prefer `__init_subclass__` and class decorators when they suffice; metaclasses compose poorly and confuse static analyzers. In **multi-tenant SaaS**, metaclasses sometimes build per-tenant ORM mappers—ensure mypy plugins or stubs document the generated API.

```python
# Expert: prefer __init_subclass__ for many registry patterns
class Model:
    _by_name: dict[str, type] = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Model._by_name[cls.__name__] = cls
```

#### Key Points — Metaclasses

- Default metaclass is **`type`**; metaclasses must subclass **`type`** (or another metaclass).
- Class body runs **before** metaclass `__new__` sees the namespace dict.
- **Composition:** multiple metaclasses require a common subclass of both—often a design smell.
- Consider **`__init_subclass__`** and **PEP 695**/**dataclasses** before custom metaclasses.

---

### 27.1.2 Metaclass `__new__` and class creation

**Beginner Level:** When Python executes `class Foo: ...`, it calls the metaclass’s `__new__` to allocate the class object—similar to how `__new__` allocates instances.

```python
# Beginner: metaclass __new__ runs during class definition
class ChattyMeta(type):
    def __new__(mcs, name, bases, namespace, **kwargs):
        print(f"Creating class {name!r}")
        return super().__new__(mcs, name, bases, namespace)


class User(metaclass=ChattyMeta):
    pass
```

**Intermediate Level:** Mutate `namespace` (a dict) before calling `super().__new__` to inject methods, validate attributes, or strip private names. An **analytics event** schema builder might uppercase field names.

```python
# Intermediate: normalize attribute names in namespace
class UpperFields(type):
    def __new__(mcs, name, bases, namespace, **kwargs):
        for key in list(namespace):
            if key.startswith("__") and key.endswith("__"):
                continue
            if isinstance(namespace[key], (int, float, str)):
                namespace[key.upper()] = namespace.pop(key)
        return super().__new__(mcs, name, bases, namespace)


class Event(metaclass=UpperFields):
    user_id = 1
    AMOUNT = 9.99  # already upper, left as-is by loop logic if you skip dunder only
```

**Expert Level:** Use `__prepare__` (Python 3) to return a custom mapping (e.g., **ordered** or **counter**) for the class body—Django-like “contributing attributes” patterns. Combine with **typing** carefully; analyzers may not see dynamic additions.

```python
# Expert: ordered namespace via __prepare__
class OrderedMeta(type):
    @classmethod
    def __prepare__(mcs, name, bases, **kwargs):
        from collections import OrderedDict

        return OrderedDict()

    def __new__(mcs, name, bases, namespace, **kwargs):
        return super().__new__(mcs, name, bases, dict(namespace))


class PipelineStep(metaclass=OrderedMeta):
    ingest = 1
    transform = 2
    load = 3
```

#### Key Points — Metaclass `__new__`

- **`namespace`** is the mapping from class body execution.
- **`kwargs`** come from `class Foo(Base, metaclass=M, key=value):` syntax (`PEP 3115`).
- Order: **`__prepare__`** → exec body → **`__new__`** → **`__init__`**.

---

### 27.1.3 `__new__` on ordinary classes

**Beginner Level:** `__new__` creates the object **before** `__init__` runs. For immutable built-ins (`int`, `str`, `tuple`), `__new__` is the real constructor.

```python
# Beginner: __new__ allocates; __init__ initializes mutable state
class Point:
    def __new__(cls, x, y):
        print("new")
        return super().__new__(cls)

    def __init__(self, x, y):
        print("init")
        self.x = x
        self.y = y


Point(1, 2)
```

**Intermediate Level:** Singletons, object pools, and **flyweight** caches often override `__new__`. A **connection token** service might reuse live objects.

```python
# Intermediate: simple singleton (often an anti-pattern—use modules or DI)
class _Singleton(type):
    _inst = None

    def __call__(cls, *args, **kwargs):
        if cls._inst is None:
            cls._inst = super().__call__(*args, **kwargs)
        return cls._inst


class Config(metaclass=_Singleton):
    def __init__(self):
        self.api_url = "https://api.example.com"
```

**Expert Level:** Subclassing immutable types or **CPython** C-API types may restrict `__new__` signatures. For **microservices**, prefer explicit factories over hidden singletons to keep tests parallel-safe.

```python
# Expert: factory function instead of metaclass singleton
def make_config() -> "Config":
    global _CONFIG
    try:
        return _CONFIG
    except NameError:
        _CONFIG = Config()
        return _CONFIG
```

#### Key Points — `__new__` on classes

- **`cls`** is the class being instantiated.
- Must return an instance (usually `super().__new__(cls)`).
- If `__new__` returns an instance of another class, `__init__` may not run on the original class.

---

### 27.1.4 Dynamic classes and runtime schemas

**Beginner Level:** You can build classes at runtime by assigning to names or using `type()`. Useful when **CSV headers** become row objects in a throwaway ETL script.

```python
# Beginner: build a simple namespace object from keys
def row_class(columns):
    return type("Row", (), {c: None for c in columns})


Row = row_class(["sku", "qty"])
```

**Intermediate Level:** Dynamic classes power **pydantic**-like validation, **protobuf** stubs, or **OpenAPI** client generation. Control `__repr__` and slots for memory.

```python
# Intermediate: dynamic dataclass-like row with __slots__
def make_row(name: str, fields: list[str]):
    namespace = {"__slots__": tuple(fields)}

    def __init__(self, **kwargs):
        for f in fields:
            setattr(self, f, kwargs.get(f))

    namespace["__init__"] = __init__
    return type(name, (), namespace)


InventoryRow = make_row("InventoryRow", ["warehouse_id", "sku", "units"])
r = InventoryRow(warehouse_id="W1", sku="ABC", units=10)
```

**Expert Level:** Dynamic models complicate **pickling**, **migrations**, and **IDE** support. Version the schema, freeze generated classes on disk for production **ML feature stores**, and add tests that generated code matches a golden file.

```python
# Expert: attach schema version for data pipelines
def versioned_model(version: int, fields: list[str]):
    cls = make_row(f"ModelV{version}", fields)
    cls.SCHEMA_VERSION = version
    return cls
```

#### Key Points — Dynamic classes

- **`type(name, bases, dict)`** is the programmatic class constructor.
- Combine with **`__slots__`** when creating many instances (streaming ingestion).
- Persist **metadata** (version, hash of columns) alongside dynamic types.

---

### 27.1.5 Advanced `type()` — the three-argument form

**Beginner Level:** `type("MyClass", (Base,), {"x": 1})` builds a class equivalent to `class MyClass(Base): x = 1`.

```python
# Beginner: minimal dynamic class
Base = object
MyCls = type("MyCls", (Base,), {"greet": lambda self: "hi"})
MyCls().greet()
```

**Intermediate Level:** Merge multiple dicts for the namespace when generating **gRPC**-style stubs from IDL: methods, nested enums, and docstrings.

```python
# Intermediate: compose namespace from fragments
def build_service_cls(name: str, methods: dict):
    namespace = {"SERVICE": name}
    namespace.update(methods)
    return type(f"{name}Stub", (), namespace)


svc = build_service_cls("Orders", {"list_orders": lambda self: []})
```

**Expert Level:** Respect **`metaclass`** propagation: if bases have different metaclasses, Python requires a **subclass** of those metaclasses. Dynamic frameworks sometimes install a **custom metaclass** via `type(..., (BaseModel,), ns)` where `BaseModel` already has a metaclass.

```python
# Expert: error case to understand
# class A(metaclass=MA): pass
# class B(metaclass=MB): pass
# class C(A, B): pass  # TypeError unless MA & MB have common subclass
```

#### Key Points — `type()` advanced

- Signature: **`type(name, bases, namespace)`**.
- **`bases`** may be empty: `(object,)`.
- Metaclass of result is **`type`** unless bases imply otherwise.

---

### 27.1.6 Reflection — observing objects at runtime

**Beginner Level:** Reflection means asking objects about themselves: `type(x)`, `dir(x)`, `getattr(x, "name")`. Handy in a **debug CLI** for support engineers.

```python
# Beginner: list public methods of an API client
client = open("stub", "w")  # placeholder
names = [n for n in dir(client) if not n.startswith("_")]
print(names[:5])
```

**Intermediate Level:** Use **`getattr` / `setattr` / `hasattr`** on plugin instances loaded from entry points in a **plugin host** service.

```python
# Intermediate: call hook if present
def run_hook(plugin, hook_name: str, payload: dict):
    fn = getattr(plugin, hook_name, None)
    if callable(fn):
        return fn(**payload)
    return None
```

**Expert Level:** Reflection bypasses static checks; wrap with **`typing.Protocol`** at boundaries. For **zero-downtime** deploys, validate plugin interfaces with **`inspect.signature`** before routing traffic.

```python
# Expert: validate arity before production dispatch
import inspect


def assert_hook_signature(fn, required_params: set[str]):
    sig = inspect.signature(fn)
    params = set(sig.parameters)
    missing = required_params - params
    if missing:
        raise TypeError(f"hook missing params: {missing}")
```

#### Key Points — Reflection

- **`getattr(obj, name, default)`** avoids bare `AttributeError` when optional.
- **`vars(obj)`** is `obj.__dict__` for typical instances.
- Prefer explicit protocols over unchecked `getattr` chains.

---

### 27.1.7 Introspection — `inspect` and callables

**Beginner Level:** The **`inspect`** module tells you if something is a function, method, generator, or coroutine—useful when building a **task runner** UI.

```python
# Beginner: is it a coroutine function?
import inspect


async def fetch():
    return 1


print(inspect.iscoroutinefunction(fetch))  # True
```

**Intermediate Level:** **`inspect.signature`** powers auto-documentation for **internal REST** frameworks: coerce query params to typed parameters.

```python
# Intermediate: bind arguments from a dict
import inspect


def endpoint(user_id: int, active: bool = True):
    return user_id, active


sig = inspect.signature(endpoint)
bound = sig.bind_partial(user_id="42", active="true")
bound.apply_defaults()
# you'd still coerce types in real code
```

**Expert Level:** Stack introspection (`inspect.stack`) appears in loggers and debug middleware; it is **slow** and **fragile** under optimizers. Use **`contextvars`** for request IDs in **async** services instead of stack walking when possible.

```python
# Expert: cheap request id vs stack walking
from contextvars import ContextVar

request_id: ContextVar[str] = ContextVar("request_id", default="-")


def log(msg: str) -> None:
    print(f"[{request_id.get()}] {msg}")
```

#### Key Points — Introspection

- **`inspect.getsource`** may fail for dynamically built functions.
- **`inspect.isasyncgenfunction`** etc. distinguish async variants.
- Avoid deep stack inspection on **hot paths**.

---

## 27.2 Descriptors

Descriptors are the mechanism behind `property`, `classmethod`, `staticmethod`, and **slots** machinery; ORMs attach validation and lazy loading via descriptors.

### 27.2.1 Descriptor protocol

**Beginner Level:** A **descriptor** is any object defining `__get__`, `__set__`, or `__delete__`. Access through a **class** vs **instance** triggers different protocol paths.

```python
# Beginner: descriptor class (non-data) — only __get__
class Reveal:
    def __get__(self, obj, owner=None):
        return "descriptor" if obj is None else f"on {obj!r}"


class Box:
    x = Reveal()


print(Box.x)    # descriptor path (obj is None)
print(Box().x)  # on instance
```

**Intermediate Level:** Descriptors implement **computed fields** on **DTOs** for **event streaming** (Kafka consumers).

```python
# Intermediate: read-only derived field
class ReadOnly:
    def __init__(self, fn):
        self.fn = fn

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return self.fn(obj)


class Shipment:
    def __init__(self, grams: float):
        self.grams = grams

    @ReadOnly
    def kilos(self):
        return self.grams / 1000.0
```

**Expert Level:** **Non-data** descriptors (`__get__` only) are shadowed by instance `__dict__` assignments; **data** descriptors (`__set__`) win over instance dict—this ordering is crucial for **mutating** vs **caching** semantics in frameworks.

```python
# Expert: remember lookup order (simplified)
# data descriptor > instance dict > non-data descriptor > __getattribute__ fallthrough
```

#### Key Points — Descriptor protocol

- Methods are descriptors binding `self`.
- **`owner`** is the class when accessed as `Cls.attr`.
- Implement **`__set_name__`** (PEP 487) to learn attribute name at class creation.

---

### 27.2.2 `__get__`

**Beginner Level:** `__get__(self, obj, owner)` runs on attribute read. If `obj` is `None`, access was via the class (often return the descriptor itself for chaining).

```python
# Beginner: class-level vs instance-level behavior
class Flag:
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return True


class Feature:
    beta = Flag()
```

**Intermediate Level:** Lazy **database** connections: open on first property access in a **repository** object.

```python
# Intermediate: lazy connection (illustrative)
class LazyConn:
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        if not hasattr(obj, "_conn"):
            obj._conn = open_connection()
        return obj._conn


class Repo:
    conn = LazyConn()
```

**Expert Level:** Combine with **`weakref`** for per-instance descriptor storage without `__dict__` on the host when using **`__slots__`**—advanced pattern for **high-throughput** workers.

```python
# Expert sketch: store per-instance state in a WeakKeyDictionary
import weakref


class SlotSafeDesc:
    def __init__(self):
        self._data = weakref.WeakKeyDictionary()

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return self._data.setdefault(obj, compute_default())
```

#### Key Points — `__get__`

- Return **`self`** when `obj is None` for method-like descriptors.
- Avoid heavy work without **caching** on hot attributes.
- Document **thread safety** if mutating shared state.

---

### 27.2.3 `__set__`

**Beginner Level:** `__set__(self, obj, value)` intercepts assignment. Enables validation for **user profile** fields.

```python
# Beginner: enforce positive stock
class Positive:
    def __set__(self, obj, value):
        if value < 0:
            raise ValueError("must be >= 0")
        obj.__dict__["_stock"] = value

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return obj.__dict__["_stock"]


class SKU:
    stock = Positive()
```

**Intermediate Level:** **Coercion** layer for **JSON** APIs: accept `str` or `int` for numeric fields.

```python
# Intermediate: coerce on set
class IntField:
    def __set__(self, obj, value):
        obj.__dict__[self.name] = int(value)

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return obj.__dict__[self.name]


class Item:
    units = IntField()
```

**Expert Level:** Descriptor `__set__` with **`__slots__`** requires slots to list the **underlying storage** name or use **`object.__setattr__`** carefully—easy to recurse infinitely.

```python
# Expert: slots + validated field using object.__setattr__
class ValidatedInt:
    def __set_name__(self, owner, name):
        self.name = name
        self.storage = f"_{name}"

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return getattr(obj, self.storage)

    def __set__(self, obj, value):
        if not isinstance(value, int):
            raise TypeError
        object.__setattr__(obj, self.storage, value)


class Point:
    __slots__ = ("_x", "_y")
    x = ValidatedInt()
    y = ValidatedInt()

    def __init__(self, x, y):
        self.x, self.y = x, y
```

#### Key Points — `__set__`

- Must raise **`AttributeError`** for read-only data descriptors (omit `__set__` or raise).
- Use **`__set_name__`** to bind attribute names cleanly.
- Watch **infinite recursion** when setting attributes inside `__set__`.

---

### 27.2.4 `__delete__`

**Beginner Level:** `__delete__(self, obj)` runs on `del obj.attr`. Rare in apps; appears in **resource** wrappers.

```python
# Beginner: clear external cache on delete
class Cached:
    def __delete__(self, obj):
        obj.__dict__.pop("_cache", None)


class View:
    data = Cached()
```

**Intermediate Level:** **ORM**-like attributes might unregister from a **unit of work** when deleted.

```python
# Intermediate: track dirty clearing
class Track:
    def __delete__(self, obj):
        getattr(obj, "_tracker").discard(self.name)

    def __set_name__(self, owner, name):
        self.name = name
```

**Expert Level:** Ensure symmetry with **context managers** and **weakrefs**; `__delete__` is not a substitute for deterministic **cleanup** in concurrent systems.

```python
# Expert: prefer contextlib + finally for sockets/locks
```

#### Key Points — `__delete__`

- Implement only when **`del`** semantics matter.
- Pair with **`__get__`/`__set__`** documentation for users.
- Do not rely on `__delete__` for **GC** of external resources.

---

### 27.2.5 Data vs non-data descriptors

**Beginner Level:** If a descriptor defines **`__set__` or `__delete__`**, it is a **data descriptor**; otherwise **non-data**. This changes whether instance attributes can hide the descriptor.

```python
# Beginner: non-data can be shadowed by instance __dict__
class ND:
    def __get__(self, obj, owner=None):
        return "nd"


class A:
    x = ND()


a = A()
a.x = 1
print(a.x)  # 1 (instance dict wins over non-data descriptor)
```

**Intermediate Level:** **`property`** without a setter is **non-data** in terms of shadowing nuances vs **fget** only—still use `property` API. For **caching**, `functools.cached_property` becomes an instance dict entry after first access in CPython 3.8+.

```python
# Intermediate: functools.cached_property (conceptual usage)
from functools import cached_property


class Profile:
    @cached_property
    def heavy(self):
        return sum(range(10_000))
```

**Expert Level:** Framework authors rely on MRO + descriptor precedence to allow **user overrides** while keeping **typed accessors**—study **`object.__getattribute__`** CPython docs.

```python
# Expert: data descriptor always wins over instance dict
class Data:
    def __get__(self, obj, owner=None):
        return "data"

    def __set__(self, obj, value):
        obj.__dict__["_v"] = value


class B:
    x = Data()


b = B()
b.x = 1
print(b.x)  # still uses descriptor __get__ -> "data" path depends on implementation
```

#### Key Points — data vs non-data

- **Data descriptor:** defines `__set__` or `__delete__`.
- **Instance `__dict__`** sits between non-data descriptors and class dict in lookup order.
- **`help(object.__getattribute__)`** documents full precedence.

---

### 27.2.6 `property` as a descriptor

**Beginner Level:** `@property` wraps a getter; `@name.setter` adds `__set__`. Pythonic way to expose **computed columns** in reports.

```python
# Beginner: read-only property
class Order:
    def __init__(self, subtotal: float, tax: float):
        self.subtotal = subtotal
        self.tax = tax

    @property
    def total(self) -> float:
        return self.subtotal + self.tax
```

**Intermediate Level:** Properties call user code on every access unless you cache—use **`cached_property`** for **idempotent** expensive reads.

```python
# Intermediate: validation in setter
class Account:
    def __init__(self):
        self._email = ""

    @property
    def email(self) -> str:
        return self._email

    @email.setter
    def email(self, value: str) -> None:
        if "@" not in value:
            raise ValueError("invalid email")
        self._email = value
```

**Expert Level:** **`property` objects** are data descriptors when setter/deleter exist. Subclass **`property`** rarely; prefer descriptors for reusable parameterized fields across many models.

```python
# Expert: property is an instance of class 'property'
print(type(Order.total))  # <class 'property'>
```

#### Key Points — `property`

- Prefer **public properties** over `get_*` / `set_*` Java-style.
- Document **O(n)** or **I/O** costs in docstrings.
- **`property`** can be replaced at subclass level like any class attribute.

---

## 27.3 `__slots__`

### 27.3.1 Declaring `__slots__`

**Beginner Level:** `__slots__` is a sequence of allowed attribute names; instances skip per-instance `__dict__` (unless `"__dict__"` is in slots).

```python
# Beginner: fixed-shape message object
class Tick:
    __slots__ = ("symbol", "price", "ts")

    def __init__(self, symbol: str, price: float, ts: float):
        self.symbol = symbol
        self.price = price
        self.ts = ts
```

**Intermediate Level:** **Market data** feeds create millions of ticks—slots cut RAM and speed attribute access.

```python
# Intermediate: __slots__ on a batch container
class Candle:
    __slots__ = ("open", "high", "low", "close", "volume")

    def __init__(self, o, h, l, c, v):
        self.open, self.high, self.low, self.close, self.volume = o, h, l, c, v
```

**Expert Level:** Mix **`__slots__` + `weakref`** slot name when instances participate in **caches**; remember pickling requires `__getstate__`/`__setstate__` customization.

```python
# Expert: enable weakrefs explicitly
class Node:
    __slots__ = ("value", "next", "__weakref__")
```

#### Key Points — declaring slots

- Tuple of **strings**; no default values in slots declaration itself.
- Class still has a **`__dict__`** unless **`__slots__` only** and no extra dict requested.
- Add **`"__dict__"`** to slots if you need dynamic attributes (defeats some savings).

---

### 27.3.2 Memory optimization in services

**Beginner Level:** Less memory → better cache locality and fewer **GC** pauses—important for **JSON**-heavy API workers.

```python
# Beginner: compare conceptual footprint (run in your env)
import sys


class Loose:
    def __init__(self, a, b):
        self.a = a
        self.b = b


class Tight:
    __slots__ = ("a", "b")

    def __init__(self, a, b):
        self.a = a
        self.b = b


print(sys.getsizeof(Loose(1, 2)), sys.getsizeof(Tight(1, 2)))
```

**Intermediate Level:** Profile real workloads with **`tracemalloc`**; slots help most when millions of **short-lived** objects exist (ETL, simulations).

```python
# Intermediate: tracemalloc snapshot sketch
import tracemalloc

tracemalloc.start()
# ... workload ...
current, peak = tracemalloc.get_traced_memory()
```

**Expert Level:** Combine slots with **`__match_args__`** (dataclass-like patterns) and **C extensions** for hot structures; avoid premature optimization on **wide** objects with dozens of optional fields.

```python
# Expert: dataclasses + slots (3.10+)
from dataclasses import dataclass


@dataclass(slots=True)
class Event:
    kind: str
    payload: dict
```

#### Key Points — memory

- Measure before/after on **representative** data.
- **GC** tuning (`gc.set_threshold`) is separate from slots.
- **`slots=True`** dataclass is often the sweet spot.

---

### 27.3.3 `__slots__` with inheritance

**Beginner Level:** Subclasses must declare their own `__slots__`; parent slots are inherited as allowed names only if the machinery allows—typically **each level lists its new names**.

```python
# Beginner: child adds slots
class Base:
    __slots__ = ("id",)


class User(Base):
    __slots__ = ("name",)

    def __init__(self, id, name):
        self.id = id
        self.name = name
```

**Intermediate Level:** Empty **`__slots__ = ()`** in a child can stop **`__dict__`** creation when parent uses slots—study MRO carefully.

```python
# Intermediate: mixin with empty slots
class Tagged:
    __slots__ = ("tags",)


class Document(Tagged):
    __slots__ = ("body",)
```

**Expert Level:** Multiple inheritance with conflicting slot layouts is fragile; prefer **composition** for **plugin** trees in **CMS** systems.

```python
# Expert: favor composition
class Page:
    __slots__ = ("slug", "_plugins")

    def __init__(self, slug):
        self.slug = slug
        self._plugins = []
```

#### Key Points — inheritance

- Document **slot composition** rules for contributors.
- Avoid diamond inheritance with different slot strategies.
- **`__dict__`** reappears if a base lacks slots discipline.

---

### 27.3.4 Dynamic attributes and `__dict__`

**Beginner Level:** Slotted instances reject unknown attributes—catch **`AttributeError`** when parsing **messy CSV**.

```python
# Beginner: unexpected field fails fast
class Row:
    __slots__ = ("a",)


r = Row()
r.a = 1
try:
    r.b = 2
except AttributeError as e:
    print("no dynamic b:", e)
```

**Intermediate Level:** If you need arbitrary keys, include **`__dict__`** in `__slots__` or use a **`metadata: dict`** field in **API** gateways.

```python
# Intermediate: explicit metadata bag
class Envelope:
    __slots__ = ("body", "metadata")

    def __init__(self, body):
        self.body = body
        self.metadata = {}
```

**Expert Level:** **`__slots__` + `__getattr__`** patterns exist but are subtle; for **plugin** metadata, store a **`types.SimpleNamespace`** or **Pydantic** model instead.

```python
# Expert: pydantic Extra.allow for dynamic keys (conceptual)
# from pydantic import BaseModel, ConfigDict
# class Dyn(BaseModel):
#     model_config = ConfigDict(extra="allow")
```

#### Key Points — dynamic attributes

- Choose **explicit dict fields** over hidden dynamism.
- Validate unknown keys at **schema** boundary.
- Document **serialization** behavior (JSON, ORM).

---

### 27.3.5 Limitations and interoperability

**Beginner Level:** Slotted objects may break naive code assuming **`__dict__`**. Some serializers need configuration.

```python
# Beginner: vars() may fail
class S:
    __slots__ = ("x",)


s = S()
s.x = 1
try:
    vars(s)
except TypeError as e:
    print(e)
```

**Intermediate Level:** **`dataclasses.asdict`** works with slotted dataclasses in modern Python; **pickle** may need `__reduce__` for extension types.

```python
# Intermediate: manual to_dict for slots
def slot_obj_to_dict(obj):
    return {name: getattr(obj, name) for name in obj.__slots__ if name != "__weakref__"}
```

**Expert Level:** **Cython**/`__slots__` interaction, **`copy.copy`** semantics, and **multiprocessing** pickling require testing in **staging** before rollout.

```python
# Expert: add copy semantics if default is wrong
import copy


class SlotCopy:
    __slots__ = ("n",)

    def __init__(self, n):
        self.n = n

    def __copy__(self):
        return type(self)(self.n)
```

#### Key Points — limitations

- Test **pickle/json/orm** integration early.
- **`multiple inheritance`** + slots = expert-only.
- Keep **public API** stable when adding slots to existing classes.

---

## 27.4 Multiple dispatch

### 27.4.1 `@singledispatch` and `@singledispatchmethod`

**Beginner Level:** `@functools.singledispatch` chooses an implementation based on the **first argument’s type**—great for **serialization** helpers.

```python
# Beginner: serialize by type
from functools import singledispatch
import json


@singledispatch
def to_jsonable(obj):
    raise TypeError(f"unsupported {type(obj)!r}")


@to_jsonable.register
def _(obj: dict):
    return {k: to_jsonable(v) for k, v in obj.items()}


@to_jsonable.register
def _(obj: list):
    return [to_jsonable(x) for x in obj]


@to_jsonable.register
def _(obj: (str, int, float, bool, type(None))):
    return obj
```

**Intermediate Level:** **`singledispatchmethod`** decorates methods; first param after `self` is dispatched—use in **domain services** with clean OCP.

```python
# Intermediate: method dispatch
from functools import singledispatchmethod


class Renderer:
    @singledispatchmethod
    def render(self, obj):
        raise NotImplementedError

    @render.register
    def _(self, obj: str):
        return f"text:{obj}"

    @render.register
    def _(self, obj: dict):
        return "dict:" + ",".join(obj)
```

**Expert Level:** Register **ABC** registrations for interfaces; watch **import order** to ensure registrations execute before use in **plugin** systems.

```python
# Expert: ABC registration
from collections.abc import Mapping


@to_jsonable.register
def _(obj: Mapping):
    return {k: to_jsonable(v) for k, v in obj.items()}
```

#### Key Points — singledispatch

- Dispatch is on **runtime types**, not annotations alone.
- Extend with **`register(lambda)`** for older Python.
- Keep a **default** that errors clearly.

---

### 27.4.2 Multiple dispatch libraries

**Beginner Level:** Standard library covers **single** argument; **`multipledispatch`** (PyPI) handles multiple arguments—useful for **numeric** kernels.

```python
# Beginner: conceptual multipledispatch (install: pip install multipledispatch)
# from multipledispatch import dispatch
#
# @dispatch(int, int)
# def add(a, b):
#     return a + b
#
# @dispatch(str, str)
# def add(a, b):
#     return a + b
```

**Intermediate Level:** In **production**, pin versions and test ambiguity resolution (which function wins). Consider **explicit** strategy dicts if dispatch table is small.

```python
# Intermediate: pure dict dispatch (no dependency)
HANDLERS = {}


def register(kind, fn):
    HANDLERS[kind] = fn


def handle(kind, payload):
    return HANDLERS[kind](payload)
```

**Expert Level:** For **DSL** compilers, use **custom** dispatch with **precedence** rules and caching of resolved functions; log **ambiguous** registrations at import time.

```python
# Expert: detect duplicate registration
def strict_register(registry, key, fn):
    if key in registry:
        raise ValueError(f"duplicate handler for {key}")
    registry[key] = fn
```

#### Key Points — libraries

- External **`multipledispatch`** is not stdlib—vendor consciously.
- Prefer **stdlib** when one argument suffices.
- Document **resolution order** for team onboarding.

---

### 27.4.3 Generic functions

**Beginner Level:** A **generic function** is one name with **type-specific** bodies—like overloaded functions in other languages, but resolved at **runtime**.

```python
# Beginner: generic pretty printer name
from functools import singledispatch


@singledispatch
def pretty(x):
    return str(x)


@pretty.register
def _(x: float):
    return f"{x:.2f}"
```

**Intermediate Level:** Combine with **protocols** for **structural** typing in **API** clients.

```python
# Intermediate: structural checks before dispatch
from typing import Protocol, runtime_checkable


@runtime_checkable
class Serializable(Protocol):
    def to_wire(self) -> bytes: ...


@singledispatch
def encode(obj):
    raise TypeError


@encode.register
def _(obj: Serializable):
    return obj.to_wire()
```

**Expert Level:** For **high-throughput** routers, compile a **jump table** (dict) from types to functions once at startup instead of repeated **`isinstance`** chains.

```python
# Expert: precomputed table
def build_router(pairs: list[tuple[type, object]]):
    return {t: fn for t, fn in pairs}
```

#### Key Points — generic functions

- Great **Open/Closed** style extension point.
- Not a substitute for **mypy** overloads (static).
- Keep **defaults** strict to catch new types early.

---

### 27.4.4 Type-based routing

**Beginner Level:** Route **webhook** payloads by a `type` field using **`isinstance`** or pattern matching (**PEP 634**).

```python
# Beginner: match/case routing (3.10+)
def route_event(e: dict):
    match e.get("type"):
        case "order.paid":
            return charge_fulfillment(e)
        case "user.signup":
            return provision_tenant(e)
        case _:
            raise ValueError("unknown event")


def charge_fulfillment(e):
    return "ok"


def provision_tenant(e):
    return "ok"
```

**Intermediate Level:** **`singledispatch`** on a **wrapper** that normalizes dicts into dataclasses first—cleaner than giant `if/elif`.

```python
# Intermediate: normalize then dispatch
from dataclasses import dataclass


@dataclass
class OrderPaid:
    id: str


@dataclass
class UserSignup:
    email: str


def normalize(e: dict):
    t = e["type"]
    if t == "order.paid":
        return OrderPaid(id=e["id"])
    if t == "user.signup":
        return UserSignup(email=e["email"])
    raise ValueError(t)
```

**Expert Level:** In **Kafka** consumers, combine **schema registry** (Avro/Protobuf) with **explicit** versioned handlers; never trust unvalidated `type` strings for **security** decisions.

```python
# Expert: verify signature before routing
def handle(raw_body: bytes, signature: str, secret: str):
    assert valid_hmac(raw_body, signature, secret)
    event = parse(raw_body)
    return route_event(event)


def valid_hmac(body, sig, secret) -> bool:
    return True  # use hmac.compare_digest in real code
```

#### Key Points — type-based routing

- Validate **before** dispatch in untrusted pipelines.
- Prefer **exhaustive** tests when `match` cases grow.
- Log **unknown** types with sampling, not full payloads (PII).

---

### 27.4.5 Predicate and manual dispatch

**Beginner Level:** Sometimes dispatch on **predicates** (`x > 0`) instead of types—use plain functions or **`if`**.

```python
# Beginner: simple predicate router
def classify_balance(b: float) -> str:
    if b < 0:
        return "overdrawn"
    if b == 0:
        return "zero"
    return "positive"
```

**Intermediate Level:** Build a **list of (predicate, handler)** pairs for **pricing rules** in **e-commerce**.

```python
# Intermediate: ordered rules engine
RULES = [
    (lambda cart: cart.get("vip"), lambda cart: 0.85),
    (lambda cart: cart["total"] > 1000, lambda cart: 0.9),
]


def price_factor(cart):
    for pred, fn in RULES:
        if pred(cart):
            return fn(cart)
    return 1.0
```

**Expert Level:** For **compliance** engines, record **which rule fired** for audit trails; avoid lambdas for rules—use named functions with **stable IDs**.

```python
# Expert: auditable rule
from dataclasses import dataclass
from typing import Callable


@dataclass(frozen=True)
class Rule:
    id: str
    pred: Callable[..., bool]
    apply: Callable[..., float]


RULES2 = [
    Rule("vip_discount", lambda c: c.get("vip"), lambda c: 0.85),
]


def apply_rules(cart):
    for r in RULES2:
        if r.pred(cart):
            audit_log(r.id, cart["user_id"])
            return r.apply(cart)
    return 1.0


def audit_log(rule_id: str, user_id: str) -> None:
    pass
```

#### Key Points — predicate dispatch

- Order matters—document **priority**.
- Prefer **explicit** named rules over opaque lambdas in **regulated** domains.
- Add **metrics** per rule for **SRE** tuning.

---

## 27.5 AST and code inspection

### 27.5.1 Abstract Syntax Trees

**Beginner Level:** Source code → **tokens** → **AST** (tree of nodes like `FunctionDef`, `Call`). Linters and formatters walk this tree.

```python
# Beginner: parse expression to AST
import ast

tree = ast.parse("1 + 2 * 3", mode="eval")
print(ast.dump(tree, indent=2))
```

**Intermediate Level:** **Static analysis** for **internal DSLs**: forbid `eval` calls in submitted scripts for a **data science** platform.

```python
# Intermediate: visitor banning eval
class BanEval(ast.NodeVisitor):
    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id == "eval":
            raise SyntaxError("eval is not allowed")
        self.generic_visit(node)


BanEval().visit(ast.parse("eval('1')"))
```

**Expert Level:** Preserve **location** info (`lineno`, `col_offset`) for error messages; handle **f-strings** and **async** constructs across Python versions—gate features by `sys.version_info`.

```python
# Expert: report line numbers
tree = ast.parse("x = 1\ny = bad(\n)")
for node in ast.walk(tree):
    if isinstance(node, ast.Call):
        print("call at", node.lineno)
```

#### Key Points — AST

- **`ast.parse`** supports `mode="exec" | "eval" | "single"`.
- **`ast.walk`** is deep; **`NodeVisitor`** is controlled traversal.
- **Security:** parsing is not execution—still validate allowed nodes.

---

### 27.5.2 The `ast` module

**Beginner Level:** `ast` builds, modifies, and unparses trees (**3.9+** `ast.unparse`).

```python
# Beginner: unparse round-trip sketch
import ast

source = "def f(x):\n    return x + 1\n"
tree = ast.parse(source)
print(ast.unparse(tree))
```

**Intermediate Level:** **Codegen** for **ORM** migrations: generate `ALTER TABLE` strings from model classes by inspecting class bodies (often easier with **inspect** + **annotations** than full AST).

```python
# Intermediate: constant folding visitor
class FoldConstants(ast.NodeTransformer):
    def visit_BinOp(self, node: ast.BinOp):
        self.generic_visit(node)
        if isinstance(node.left, ast.Constant) and isinstance(node.right, ast.Constant):
            if isinstance(node.op, ast.Add):
                return ast.Constant(node.left.value + node.right.value)
        return node
```

**Expert Level:** Use **`ast.increment_lineno`** when injecting nodes; for **macro**-like systems, write **golden tests** comparing unparsed output.

```python
# Expert: fix locations after template injection
import ast

def inject_return_one(fn_tree: ast.FunctionDef):
    fn_tree.body.insert(0, ast.Return(value=ast.Constant(1)))
    ast.fix_missing_locations(fn_tree)
```

#### Key Points — `ast` module

- Prefer **`ast.Constant`** over legacy `Num/Str` nodes on 3.8+.
- **`copy_location`** / **`fix_missing_locations`** maintain debuggability.
- **`ast.dump(..., include_attributes=True)`** for deep debugging.

---

### 27.5.3 The `inspect` module (source-level)

**Beginner Level:** Fetch docstrings, signatures, and source files of functions for **auto-docs**.

```python
# Beginner: getsource requires source file available
import inspect


def add(a, b):
    """Add numbers."""
    return a + b


print(inspect.getdoc(add))
print(inspect.signature(add))
```

**Intermediate Level:** Build a **FastAPI**-like dependency graph by reading **`typing.get_type_hints`** + **`signature.parameters`**.

```python
# Intermediate: parameter kinds
import inspect


def handler(user_id: int, *, debug: bool = False):
    pass


for name, p in inspect.signature(handler).parameters.items():
    print(name, p.kind)
```

**Expert Level:** **`inspect.getsource`** fails for REPL/dynamic functions—fall back to **decompilation** disclaimers or prohibit dynamic handler registration in **regulated** systems.

```python
# Expert: guard getsource
import inspect


def safe_source(fn):
    try:
        return inspect.getsource(fn)
    except (OSError, TypeError):
        return "<no source>"
```

#### Key Points — `inspect` source-level

- Combine with **`importlib`** to locate modules.
- **`getclosurevars`** helps debug **closure** capture bugs.
- Do not **`eval`** retrieved source from untrusted packages.

---

### 27.5.4 Source analysis for APIs

**Beginner Level:** Scan repository for **deprecated** function names before a **major** release.

```python
# Beginner: grep-like AST search
import ast
from pathlib import Path


def calls_name(tree, name: str) -> bool:
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id == name:
                return True
    return False


src = Path("module.py")  # hypothetical
# tree = ast.parse(src.read_text())
```

**Intermediate Level:** **OpenAPI** diff tools sometimes parse **Flask/FastAPI** route decorators via AST when reflection is insufficient.

```python
# Intermediate: find simple @app.get decorators (illustrative)
class FindRoutes(ast.NodeVisitor):
    def visit_FunctionDef(self, node: ast.FunctionDef):
        for dec in node.decorator_list:
            if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute):
                if dec.func.attr in {"get", "post", "put", "delete"}:
                    print("route", node.name, "at", node.lineno)
        self.generic_visit(node)
```

**Expert Level:** Integrate with **CI** (`pre-commit`) and **SARIF** output for GitHub Code Scanning; cap runtime on huge generated files.

```python
# Expert: skip huge files
MAX_BYTES = 2_000_000


def parse_if_small(path: Path):
    data = path.read_bytes()
    if len(data) > MAX_BYTES:
        return None
    return ast.parse(data.decode())
```

#### Key Points — source analysis

- AST > regex for **string** literals containing false positives.
- Respect **encoding** and **syntax version** (`feature_version=` in `ast.parse`).
- Provide **actionable** error locations for developers.

---

### 27.5.5 Code generation

**Beginner Level:** Generate Python source strings and `exec` into a dict—**avoid** for untrusted input.

```python
# Beginner: template a function (trusted templates only)
template = """
def f(x):
    return x * {factor}
"""
ns = {}
exec(template.format(factor=3), ns)
print(ns["f"](4))
```

**Intermediate Level:** Prefer **`ast`** + **`unparse`** over string formatting to avoid **injection** when building **SDKs** from specs.

```python
# Intermediate: build AST for a simple function
import ast

fn = ast.FunctionDef(
    name="double",
    args=ast.arguments(
        posonlyargs=[],
        args=[ast.arg("x")],
        kwonlyargs=[],
        kw_defaults=[],
        defaults=[],
    ),
    body=[ast.Return(ast.BinOp(left=ast.Name("x", ast.Load()), op=ast.Mult(), right=ast.Constant(2)))],
    decorator_list=[],
    returns=None,
    type_comment=None,
    lineno=1,
    col_offset=0,
)
ast.fix_missing_locations(fn)
mod = ast.Module(body=[fn], type_ignores=[])
print(ast.unparse(mod))
```

**Expert Level:** For **protobuf**/**thrift**, use official compilers; for **internal** IDL, emit `.pyi` stubs and run **`mypy`**.

```python
# Expert: write generated file to disk with header comment
header = "# Generated file — do not edit\n"
```

#### Key Points — code generation

- Never interpolate **user** input into generated code.
- Check generated output into git or reproducible **build** artifacts.
- Add **`# fmt: off`** only when formatters break intentional layout.

---

## 27.6 Bytecode

### 27.6.1 Python bytecode overview

**Beginner Level:** CPython compiles `.py` to **bytecode** (`.pyc`) for the **eval loop**. It is stack-based and version-specific.

```python
# Beginner: code object on a function
def add(a, b):
    return a + b


print(add.__code__.co_code[:10])
```

**Intermediate Level:** Bytecode differs across **Python minor versions**—do not ship bytecode without matching interpreter.

```python
# Intermediate: co_names, co_varnames introspection
def f(x, y=1):
    z = x + y
    return z


print(f.__code__.co_varnames)
print(f.__code__.co_names)
```

**Expert Level:** **Peephole** optimizer folds constants and jumps; understand limits when teaching **performance** tuning—source structure != bytecode structure after optimization.

```python
# Expert: examine flags
print(f.__code__.co_flags)  # inspect module has CO_* flags
```

#### Key Points — bytecode overview

- Bytecode is an **implementation detail** of CPython.
- `.pyc` lives in `__pycache__`.
- Security: bytecode can be **decompiled**—treat like source.

---

### 27.6.2 The `dis` module

**Beginner Level:** `dis.dis(fn)` prints opcodes—great classroom tool.

```python
# Beginner: disassemble a tiny function
import dis


def greet(name: str) -> str:
    return "hi, " + name


dis.dis(greet)
```

**Intermediate Level:** Compare bytecode for **micro-optimizations** (often unnecessary): `f-string` vs `+` concatenation in tight loops.

```python
# Intermediate: dis two expressions as functions
import dis


def with_plus(a, b):
    return str(a) + str(b)


def with_format(a, b):
    return f"{a}{b}"


dis.dis(with_plus)
dis.dis(with_format)
```

**Expert Level:** Use **`dis.Bytecode`** for tooling: locate **LOAD_GLOBAL** hotspots to optimize with **local** aliases.

```python
# Expert: opcode listing
import dis

bc = dis.Bytecode(greet)
for instr in bc:
    print(instr.opname, instr.argrepr)
```

#### Key Points — `dis`

- Pair with **`timeit`** for evidence-based optimization.
- Opcodes change between versions—pin Python in **CI** when asserting on bytecode tests.
- Great for **interviews** and teaching, not daily production debugging.

---

### 27.6.3 `compile()` and code objects

**Beginner Level:** `compile(source, filename, mode)` returns a **code object**; `exec` runs it.

```python
# Beginner: compile + exec in isolated dict
code = compile("answer = 40 + 2", "<string>", "exec")
ns = {}
exec(code, ns)
print(ns["answer"])
```

**Intermediate Level:** **`eval`** only for **trusted** expressions—**never** on user input in **web** apps.

```python
# Intermediate: safer: use ast.literal_eval for literals only
import ast

print(ast.literal_eval("[1, 2, 3]"))
```

**Expert Level:** **`types.FunctionType`** can build functions from code objects—framework internals; ensure **`__qualname__`** and **`__annotations__`** are set for debuggability.

```python
# Expert sketch: function from code object
import types


def make_function(code):
    return types.FunctionType(code, globals(), "dyn")
```

#### Key Points — `compile`

- Modes: **`exec`**, **`eval`**, **`single`**.
- Pass **restricted** `globals` for embedded **DSL** sandboxes (still hard to secure).
- Prefer **`ast.parse` + manual evaluation** for controlled subsets.

---

### 27.6.4 Optimization and CPython specifics

**Beginner Level:** CPython applies **constant folding** and jump threading; write **clear** code first.

```python
# Beginner: folded at compile time
x = 1 + 2 + 3
```

**Intermediate Level:** **Function attributes** are faster than **global** lookups—cache globals locally in **tight loops** processing **IoT** batches.

```python
# Intermediate: local alias pattern
def process_many(items, append_fn=list.append):
    out = []
    for it in items:
        append_fn(out, transform(it))
    return out


def transform(it):
    return it
```

**Expert Level:** **`PYTHONOPTIMIZE`** strips asserts; do not rely on **assert** for **security** or **invariants** in production **financial** systems—use explicit `if` + exceptions.

```python
# Expert: explicit invariant
def transfer(balance: float, amount: float) -> float:
    new_bal = balance - amount
    if new_bal < 0:
        raise ValueError("NSF")
    return new_bal
```

#### Key Points — CPython optimization

- Profile before micro-optimizing.
- **`__slots__`**, **`set`/`dict`**, **vectorized NumPy** beat opcode tricks.
- Understand **GIL** interactions for **CPU**-bound threads.

---

### 27.6.5 PyPy, JIT, and alternative VMs

**Beginner Level:** **PyPy** is a Python implementation with a **JIT**; long numeric loops may run faster than CPython.

```python
# Beginner: same source runs on PyPy or CPython
def total(n: int) -> int:
    return sum(range(n))


print(total(10000))
```

**Intermediate Level:** **C extensions** compatibility differs (`cpyext` overhead); **NumPy** on PyPy has matured but verify wheels for **ML** training jobs.

```python
# Intermediate: feature detect implementation
import sys

print(sys.implementation.name)
```

**Expert Level:** **GraalPython**, **Jython**, **IronPython** target JVM/CLR interop—choose based on **enterprise** integration, not raw **Django** throughput alone.

```python
# Expert: deployment matrix documentation (conceptual)
MATRIX = {
    "cpython": {"extensions": "best", "jit": False},
    "pypy": {"extensions": "good", "jit": True},
}
```

#### Key Points — PyPy/JIT

- Benchmark **your** workload; JIT helps **hot loops**, not **I/O**-bound APIs.
- Watch **warmup** time in **serverless** (cold starts).
- Pin **implementation** in **Docker** base images.

---

## Best Practices

- Prefer **`__init_subclass__`**, **class decorators**, and **metaclasses** only when simpler tools fail.
- Use **descriptors**/`property` for invariants; avoid **hidden** magic without docs.
- Apply **`__slots__`** only after **profiling** proves memory pressure; keep **serialization** tests.
- Choose **`singledispatch`** for extensible **generic functions**; document registration points.
- Treat **AST** and **bytecode** tools as **maintainer** utilities with version-pinned **CI** checks.
- Never **`eval/exec`** on **untrusted** data; combine **AST allowlists** with **policy** reviews.

---

## Common Mistakes to Avoid

- **Metaclass soup:** multiple metaclasses without a composed metaclass → **`TypeError`** at class definition.
- **Descriptor recursion:** `__set__` assigns to same public name without using **underlying storage** → infinite loop.
- **`__slots__` + pickle:** forgetting **`__weakref__`** when needed, or breaking **third-party** mixins.
- **`singledispatch` misuse:** expecting **static** overload resolution or dispatch on **multiple** arguments without a library.
- **AST security:** assuming `ast.parse` means **safe**—still inspect **allowed** nodes before evaluation.
- **Bytecode assumptions:** tests that assert exact **`dis`** output break across **Python upgrades**.
- **Optimization without profiling:** micro-tuning **hotspots** that are **I/O** or **database** bound.
- **`property` and inheritance:** read-only property looks overridden but **setter** missing on subclass → confusing errors.

---

*End of Advanced Topics — extend with team-specific framework examples as needed.*
