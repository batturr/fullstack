# Best Practices and Design Patterns in Python

Clean structure, SOLID design, classic patterns, Pythonic idioms, and awareness of anti-patterns help teams ship maintainable APIs, data platforms, and ML services that evolve without rewrite taxes.

---

## 📑 Table of Contents

1. [32.1 Code organization](#321-code-organization)
2. [32.2 SOLID principles](#322-solid-principles)
3. [32.3 Core design patterns](#323-core-design-patterns)
4. [32.4 Creational patterns](#324-creational-patterns)
5. [32.5 Structural patterns](#325-structural-patterns)
6. [32.6 Behavioral patterns](#326-behavioral-patterns)
7. [32.7 Anti-patterns](#327-anti-patterns)
8. [32.8 Python-specific practices](#328-python-specific-practices)
9. [Best Practices](#best-practices)
10. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 32.1 Code organization

### 32.1.1 Module structure

**Beginner Level:** One module = one cohesive topic (`billing.py`, `users.py`). Avoid kitchen-sink **`utils.py`** until you know categories.

```python
# billing/invoices.py — invoice-specific logic
def total_with_tax(subtotal: float, rate: float) -> float:
    return subtotal * (1 + rate)
```

**Intermediate Level:** Public API via **`__all__`**; prefix private helpers with **`_`** to signal internals in packages consumed by other teams.

```python
__all__ = ["create_invoice", "void_invoice"]


def _normalize_line_items(items):
    ...
```

**Expert Level:** Layered modules for hexagonal ports/adapters: **`domain/`**, **`application/`**, **`infrastructure/`**, **`interfaces/`**—common in fintech cores.

```python
# domain/invoice.py — pure rules
# infrastructure/db_invoice_repo.py — adapter
```

#### Key Points — module structure

- Circular imports → extract shared types to **`types.py`** or **`protocols.py`**.
- Side effects on import minimize (connect DB in **`app.startup`**, not module top-level).
- Tests mirror package layout where helpful.

---

### 32.1.2 Project layout

**Beginner Level:** **`src/`** layout avoids accidentally importing uninstalled code during tests.

```
src/
  myservice/
    __init__.py
    main.py
tests/
  test_main.py
pyproject.toml
```

**Intermediate Level:** Separate **`services/`** per deployable in monorepos (billing-api, notifications-worker) with shared **`libs/common`**.

```text
services/checkout/app/
libs/schemas/
infra/terraform/
```

**Expert Level:** Versioned internal packages published to private index; Docker contexts minimal for fast builds.

```dockerfile
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root
COPY src ./src
```

#### Key Points — project layout

- Single virtualenv per service usually.
- Docs adjacent to code or mkdocs site—pick one standard.
- Makefile/ invoke tasks document common commands.

---

### 32.1.3 Naming

**Beginner Level:** **`snake_case`** functions/vars, **`PascalCase`** classes, **`UPPER_SNAKE`** constants per PEP 8.

```python
MAX_RETRIES = 3


class OrderService:
    def create_order(self, customer_id: str) -> str:
        ...
```

**Intermediate Level:** Verb names for functions (`fetch`, `normalize`); nouns for classes (`Invoice`, `TaxCalculator`).

```python
def calculate_shipping_weight(cart: list[Item]) -> float:
    return sum(i.weight_oz for i in cart)
```

**Expert Level:** Domain ubiquitous language from product teams—`capture_payment` not `do_money_thing` in payment gateways.

```python
def capture_payment(intent_id: str) -> CaptureResult:
    ...
```

#### Key Points — naming

- Avoid shadowing builtins (`list`, `id`, `type`).
- Long names OK if clarity wins at API boundaries.
- Consistent suffixes (`*_dto`, `*_repository`) team-wide.

---

### 32.1.4 Commenting

**Beginner Level:** Explain why, not what, when non-obvious—link tickets for regulatory exceptions.

```python
# PCI: we mask PAN in logs even in debug builds (ticket SEC-441)
```

**Intermediate Level:** Module docstring describes role and invariants; avoid stale comments—delete or update in same PR.

```python
"""Invoice totals and tax jurisdiction rules.

Invariant: all monetary values are integer cents internally.
"""
```

**Expert Level:** ADR references for architectural constraints longer than few lines.

```text
docs/adr/0007-use-event-sourcing-for-ledger.md
```

#### Key Points — commenting

- ASCII prefer unless team standard Unicode.
- TODO with owner and date.
- Don't comment out dead code—delete; git remembers.

---

### 32.1.5 Documentation

**Beginner Level:** README with install, run, test commands for microservices.

```markdown
## Dev
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

**Intermediate Level:** API OpenAPI generated from FastAPI; docstrings on public functions (Google or NumPy style consistent).

```python
def allocate_inventory(sku: str, qty: int) -> bool:
    """Reserve stock for a SKU if available.

    Args:
        sku: Merchant SKU identifier.
        qty: Positive integer units.

    Returns:
        True if reservation succeeded.
    """
```

**Expert Level:** Diátaxis split (tutorial, how-to, reference, explanation); Sphinx or MkDocs with versioned releases.

```python
# sphinx autodoc from docstrings
```

#### Key Points — documentation

- Examples runnable or copy-paste verified in CI.
- Deprecation notices with migration path.
- On-call runbooks linked from service README.

---

## 32.2 SOLID principles

### 32.2.1 Single Responsibility Principle (SRP)

**Beginner Level:** A class should change for one reason—split **`User`** if it both validates emails and writes audit CSV exports.

```python
class UserValidator:
    def validate_email(self, email: str) -> None:
        ...


class UserAuditExporter:
    def to_csv(self, users: list[User]) -> str:
        ...
```

**Intermediate Level:** SRP at module level for FastAPI routers—**`billing_routes.py`** vs **`admin_routes.py`**.

```python
router = APIRouter(prefix="/billing", tags=["billing"])
```

**Expert Level:** Microservices boundaries often follow SRP at organizational scale—Conway's law awareness.

```python
# Team A owns billing bounded context
```

#### Key Points — SRP

- Not one function per class dogma—cohesion matters.
- Refactor when PRs always touch same god file.
- Tests easier when responsibilities separate.

---

### 32.2.2 Open/Closed Principle

**Beginner Level:** Open for extension, closed for modification—add new **`PaymentProcessor`** subclass instead of **`if`/`elif`** chains.

```python
class PaymentProcessor:
    def charge(self, amount_cents: int) -> str:
        raise NotImplementedError


class StripeProcessor(PaymentProcessor):
    def charge(self, amount_cents: int) -> str:
        return "stripe-ok"
```

**Intermediate Level:** **`singledispatch`** or registry dict for open extension points in plugins.

```python
HANDLERS: dict[str, Callable] = {}


def register(kind: str):
    def deco(fn):
        HANDLERS[kind] = fn
        return fn

    return deco
```

**Expert Level:** Feature flags toggle behavior without branch explosion—still test all paths.

```python
if flags.new_tax_engine:
    tax = NewTaxEngine()
else:
    tax = LegacyTaxEngine()
```

#### Key Points — open/closed

- Prefer composition over deep hierarchies.
- Seal base classes carefully in public libs.
- Version interfaces when extending cannot avoid breaks.

---

### 32.2.3 Liskov Substitution Principle (LSP)

**Beginner Level:** Subtypes must be usable where base type expected—don't override to raise **`NotImplementedError`** unexpectedly.

```python
class Bird:
    def move(self) -> str:
        return "walk"


class Sparrow(Bird):
    def move(self) -> str:
        return "fly"


class Penguin(Bird):
    def move(self) -> str:
        return "swim"  # still valid movement — OK
```

**Intermediate Level:** Stricter preconditions or weaker postconditions break LSP—document contracts with types and tests.

```python
class ReadOnlyFile:
    def write(self, data: bytes) -> None:
        raise OSError("read-only")  # violates File-like expectation if callers expect write
```

**Expert Level:** **`Protocol`** structural typing encodes substitutability without inheritance.

```python
from typing import Protocol


class Drawable(Protocol):
    def draw(self) -> None: ...
```

#### Key Points — LSP

- Tests against abstract interfaces catch violations.
- Avoid empty implementations that lie.
- Composition when "is-a" fails.

---

### 32.2.4 Interface Segregation Principle (ISP)

**Beginner Level:** Small protocols better than one fat **`IMachine`** with **print/scan/fax`** for clients that only print.

```python
class Printer(Protocol):
    def print(self, doc: str) -> None: ...


class Scanner(Protocol):
    def scan(self) -> bytes: ...
```

**Intermediate Level:** FastAPI **`Depends`** small functions vs giant **`get_everything()`**.

```python
def current_user(): ...
def db_session(): ...
```

**Expert Level:** Optional capabilities via **`typing.Protocol`** @runtime_checkable guarded calls.

```python
@runtime_checkable
class ExportCSV(Protocol):
    def to_csv(self) -> str: ...


def maybe_export(obj):
    if isinstance(obj, ExportCSV):
        return obj.to_csv()
```

#### Key Points — ISP

- Fat interfaces force dummy methods.
- Role interfaces in security contexts (least privilege).
- Evolve APIs additively.

---

### 32.2.5 Dependency Inversion Principle (DIP)

**Beginner Level:** Depend on abstractions (protocols) not concrete **`SMTPClient`** in business logic.

```python
class Notifier(Protocol):
    def send(self, to: str, body: str) -> None: ...


def notify_user(n: Notifier, email: str):
    n.send(email, "welcome")
```

**Intermediate Level:** Dependency injection containers lightweight (FastAPI **`Depends`**, **`punq`**, manual **`app.state`**).

```python
def get_notifier() -> Notifier:
    return SmtpNotifier(...)
```

**Expert Level:** Hexagonal architecture ports in **`domain`**, adapters in **`infra`**—swap S3 for GCS without domain changes.

```python
class ObjectStore(Protocol):
    def put(self, key: str, data: bytes) -> None: ...
```

#### Key Points — DIP

- Constructor injection simplest to test.
- Global singletons hide dependencies.
- Framework should not invade domain.

---

## 32.3 Core design patterns

### 32.3.1 Singleton

**Beginner Level:** Only one instance—often overused; a module is already a singleton.

```python
class _Cfg:
    api_url = "https://api.example"


cfg = _Cfg()  # module-level instance
```

**Intermediate Level:** Metaclass singleton for legacy reasons—prefer explicit DI in new code.

```python
class Singleton(type):
    _inst = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._inst:
            cls._inst[cls] = super().__call__(*args, **kwargs)
        return cls._inst[cls]
```

**Expert Level:** Process-wide config from env + hot reload flags beats hidden singleton state in tests.

```python
@dataclass
class Settings:
    redis_url: str


def load_settings() -> Settings:
    return Settings(redis_url=os.environ["REDIS_URL"])
```

#### Key Points — singleton

- Testing pain due to shared state.
- Thread safety if lazy init.
- Prefer module constants or DI.

---

### 32.3.2 Factory

**Beginner Level:** Function returns objects based on input—choose **`Parser`** by file extension in ETL.

```python
def make_parser(path: str):
    if path.endswith(".csv"):
        return CsvParser()
    if path.endswith(".json"):
        return JsonParser()
    raise ValueError(path)
```

**Intermediate Level:** Factory class holds dependencies (DB session) for creating repositories.

```python
class RepoFactory:
    def __init__(self, session):
        self.session = session

    def orders(self) -> OrderRepository:
        return OrderRepository(self.session)
```

**Expert Level:** Abstract factory families (WinTheme/MacTheme) rare in Python—often simple functions suffice.

```python
def build_payment_gateway(kind: str) -> PaymentGateway:
    ...
```

#### Key Points — factory

- Hides construction complexity.
- Register plugins via entry points.
- Avoid god factory knowing everything.

---

### 32.3.3 Builder

**Beginner Level:** Stepwise construction of complex objects (`HTTP` requests, SQL queries).

```python
class Query:
    def __init__(self):
        self.parts = []

    def select(self, *cols):
        self.parts.append(("SELECT", cols))
        return self

    def from_(self, table: str):
        self.parts.append(("FROM", table))
        return self

    def build(self) -> str:
        ...
```

**Intermediate Level:** **`dataclasses`** with defaults often replace builders; use builder when order matters or optional parts many.

```python
email = (
    EmailBuilder()
    .to("user@example.com")
    .subject("Welcome")
    .body("Thanks for signing up")
    .build()
)
```

**Expert Level:** Test data builders in fixtures reduce boilerplate in large suites.

```python
def make_user(**kwargs):
    defaults = {"email": "a@b.com", "role": "viewer"}
    defaults.update(kwargs)
    return User(**defaults)
```

#### Key Points — builder

- Fluent API return **`self`** or immutable copies.
- Validate on **`build()`**.
- Don't overbuild simple dataclasses.

---

### 32.3.4 Adapter

**Beginner Level:** Wrap legacy **`SOAP`** client to match your **`Notifier`** protocol.

```python
class SmsAdapter:
    def __init__(self, legacy_client):
        self.c = legacy_client

    def send(self, to: str, body: str) -> None:
        self.c.send_sms(phone=to, msg=body)
```

**Intermediate Level:** Third-party SDK normalization layer in anti-corruption boundary.

```python
class S3Storage(ObjectStore):
    def __init__(self, boto_client):
        self.s3 = boto_client

    def put(self, key: str, data: bytes) -> None:
        self.s3.put_object(Bucket="b", Key=key, Body=data)
```

**Expert Level:** Feature flags swap adapters at runtime for shadow traffic testing.

```python
store: ObjectStore = S3Storage(...) if flags.use_s3 else GcsStorage(...)
```

#### Key Points — adapter

- Isolate vendor types from domain.
- Thin wrappers preferred.
- Log translation errors clearly.

---

### 32.3.5 Decorator (pattern)

**Beginner Level:** Wrap objects to add logging/caching without subclassing every implementation.

```python
class TimedService:
    def __init__(self, inner):
        self.inner = inner

    def work(self):
        t0 = time.perf_counter()
        out = self.inner.work()
        log.info("work took %.3fs", time.perf_counter() - t0)
        return out
```

**Intermediate Level:** Python **`@decorator`** syntax for functions differs from GoF decorator object pattern—both compose.

```python
def logged(fn):
    def wrap(*a, **k):
        log.info("call %s", fn.__name__)
        return fn(*a, **k)

    return wrap
```

**Expert Level:** **`functools.wraps`** preserves metadata; class decorators register routes in frameworks.

```python
from functools import wraps


def retry(fn):
    @wraps(fn)
    def wrap(*a, **k):
        for i in range(3):
            try:
                return fn(*a, **k)
            except TransientError:
                if i == 2:
                    raise

    return wrap
```

#### Key Points — decorator pattern

- Prefer composition over deep subclass trees.
- Stack decorators order matters.
- Type preservation with **`ParamSpec`** (3.10+).

---

### 32.3.6 Observer

**Beginner Level:** Subject notifies listeners on events—GUI patterns or domain events in DDD.

```python
class EventBus:
    def __init__(self):
        self._subs = []

    def subscribe(self, fn):
        self._subs.append(fn)

    def publish(self, event):
        for fn in list(self._subs):
            fn(event)
```

**Intermediate Level:** Django **`signals`** (use sparingly); prefer explicit calls or message bus for large systems.

```python
bus.subscribe(on_order_created)
bus.publish(OrderCreated(order_id="o1"))
```

**Expert Level:** Kafka topics as distributed observers—ordering, idempotency, consumer groups.

```python
# publish OrderCreated to orders.v1 topic
```

#### Key Points — observer

- Memory leaks if observers not unsubscribed.
- Sync vs async dispatch.
- Error isolation per handler.

---

### 32.3.7 Strategy

**Beginner Level:** Family of algorithms interchangeable at runtime—tax rules per country.

```python
class TaxStrategy(Protocol):
    def compute(self, amount: float) -> float: ...


class USTax:
    def compute(self, amount: float) -> float:
        return amount * 0.07


def checkout(cart, tax: TaxStrategy):
    return sum(i.price for i in cart) + tax.compute(...)
```

**Intermediate Level:** Replace if/elif chains in pricing engines with registry.

```python
STRATS = {"US": USTax(), "EU": EUTax()}
```

**Expert Level:** Hot-swap strategies via config without deploy for non-critical experiments (feature flags).

```python
tax = STRATS[tenant.tax_region]
```

#### Key Points — strategy

- Small functions can be strategies without classes.
- Test each strategy independently.
- Stateless strategies preferred.

---

### 32.3.8 Template method

**Beginner Level:** Base class defines skeleton **`run()`**, subclasses fill hooks **`load`/`transform`/`save`** in ETL jobs.

```python
class ETLJob:
    def run(self):
        data = self.load()
        data = self.transform(data)
        self.save(data)

    def load(self):
        raise NotImplementedError

    def transform(self, data):
        return data

    def save(self, data):
        raise NotImplementedError
```

**Intermediate Level:** Hooks as optional methods with defaults reduce subclass burden.

```python
class ETLJob:
    def transform(self, data):
        return data  # default pass-through
```

**Expert Level:** Composition with explicit **`Pipeline`** class often clearer in Python than inheritance-heavy template method.

```python
class Pipeline:
    def __init__(self, steps: list[Callable]):
        self.steps = steps

    def run(self, x):
        for s in self.steps:
            x = s(x)
        return x
```

#### Key Points — template method

- Inheritance ties subclasses tightly.
- Document call order invariants.
- Consider hooks vs strategy list.

---

## 32.4 Creational patterns

### 32.4.1 Abstract factory

**Beginner Level:** Factory of related products (Win/Mac UI widgets)—less common in Python than simple functions.

```python
class UIFactory(Protocol):
    def make_button(self) -> Button: ...
    def make_dialog(self) -> Dialog: ...
```

**Intermediate Level:** Theming systems or multi-cloud abstractions (AWS/GCP queues).

```python
def cloud_factory(vendor: str) -> CloudFactory:
    if vendor == "aws":
        return AwsFactory()
    if vendor == "gcp":
        return GcpFactory()
    raise ValueError(vendor)
```

**Expert Level:** Plugin entry points return factory per tenant customization in white-label SaaS.

```python
# entry_points group: myapp.storage_factory
```

#### Key Points — abstract factory

- Explosion of interfaces if overused.
- Often collapse to module per vendor.
- Test with fakes implementing same factory.

---

### 32.4.2 Prototype

**Beginner Level:** Clone objects as templates—default **`ReportConfig`** copied per customer.

```python
import copy


base = ReportConfig(theme="dark", sections=["sales", "inventory"])


def for_customer(c):
    cfg = copy.deepcopy(base)
    cfg.customer_id = c.id
    return cfg
```

**Intermediate Level:** **`dataclasses.replace`** for immutable variants.

```python
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Cfg:
    a: int
    b: int


cfg2 = replace(Cfg(1, 2), b=99)
```

**Expert Level:** Prototype in game dev for entity spawning; ensure deep vs shallow copy correctness.

```python
# copy.deepcopy can be expensive — profile
```

#### Key Points — prototype

- Mutable nested structures need deep copy.
- Prefer immutable + **`replace`** when possible.
- Serialization round-trip as alternative prototype.

---

### 32.4.3 Object pool

**Beginner Level:** Reuse expensive things (DB connections, HTTP sessions).

```python
from queue import Queue

pool: Queue[Connection] = Queue(maxsize=10)
```

**Intermediate Level:** SQLAlchemy **`QueuePool`** built-in.

```python
engine = create_engine(url, pool_size=5, max_overflow=5)
```

**Expert Level:** GPU tensor buffers in ML serving—watch reset state and OOM.

```python
class TensorPool:
    def acquire(self, shape): ...
    def release(self, t): ...
```

#### Key Points — object pool

- Leak detection if release skipped.
- Health checks on checkout.
- Size tuning via metrics.

---

### 32.4.4 Lazy initialization

**Beginner Level:** Create on first use—heavy ML model load once per worker.

```python
_model = None


def get_model():
    global _model
    if _model is None:
        _model = load_weights()
    return _model
```

**Intermediate Level:** **`functools.cached_property`** on resources per instance.

```python
from functools import cached_property


class Service:
    @cached_property
    def client(self):
        return expensive_client()
```

**Expert Level:** Thread-safe double-checked locking rare in Python—import locks or **`lru_cache`** often enough.

```python
from functools import lru_cache


@lru_cache(maxsize=1)
def shared_engine():
    return create_engine(...)
```

#### Key Points — lazy init

- Test startup vs first request latency.
- Failure handling on init errors.
- Memory if many instances each lazy heavy.

---

### 32.4.5 Multiton

**Beginner Level:** Map of named singletons—DB connection per shard key.

```python
_eng: dict[str, Engine] = {}


def engine_for(shard: str) -> Engine:
    if shard not in _eng:
        _eng[shard] = create_engine(urls[shard])
    return _eng[shard]
```

**Intermediate Level:** Tenant caches with TTL and eviction.

```python
from cachetools import TTLCache

clients = TTLCache(maxsize=1000, ttl=3600)
```

**Expert Level:** Bounded multiton to prevent unbounded memory in multi-tenant routing.

```python
# LRU eviction when max tenants in memory exceeded
```

#### Key Points — multiton

- Not standard GoF but practical.
- Lifecycle management complex.
- Metrics per instance.

---

## 32.5 Structural patterns

### 32.5.1 Bridge

**Beginner Level:** Split abstraction from implementation—remote control vs device APIs.

```python
class Device(Protocol):
    def on(self) -> None: ...
    def off(self) -> None: ...


class Remote:
    def __init__(self, device: Device):
        self.d = device

    def power(self):
        self.d.on()
```

**Intermediate Level:** Renderers separate from document model in reporting systems.

```python
class Renderer(Protocol):
    def render_table(self, rows): ...


class PDFRenderer(Renderer): ...
class HtmlRenderer(Renderer): ...
```

**Expert Level:** Swap implementations at runtime for A/B exports without touching domain code.

```python
def export(doc, renderer: Renderer) -> bytes:
    return renderer.render(doc)
```

#### Key Points — bridge

- Avoid Cartesian product subclass explosion.
- Two orthogonal axes ideal.
- Similar to adapter but planned upfront.

---

### 32.5.2 Composite

**Beginner Level:** Tree structures where leaves and nodes share interface—UI widgets, file folders.

```python
class Node(Protocol):
    def size(self) -> int: ...


class File:
    def __init__(self, bytes_: int):
        self.bytes_ = bytes_

    def size(self) -> int:
        return self.bytes_


class Folder:
    def __init__(self, children: list[Node]):
        self.children = children

    def size(self) -> int:
        return sum(c.size() for c in self.children)
```

**Intermediate Level:** JSON schema composition mirrors composite for config trees.

```python
def validate(node: dict) -> bool:
    if node["type"] == "leaf":
        return True
    return all(validate(c) for c in node["children"])
```

**Expert Level:** Visitor often pairs with composite for operations across trees.

```python
def walk(node: Node, fn: Callable[[Node], None]):
    fn(node)
    if isinstance(node, Folder):
        for c in node.children:
            walk(c, fn)
```

#### Key Points — composite

- Uniform interface critical.
- Cycles dangerous—guard.
- Immutability helps reasoning.

---

### 32.5.3 Facade

**Beginner Level:** Simple wrapper over complex subsystem—`checkout()` calls inventory, payments, notifications.

```python
class CheckoutFacade:
    def __init__(self, inv, pay, notify):
        self.inv = inv
        self.pay = pay
        self.notify = notify

    def complete(self, cart, user):
        self.inv.reserve(cart)
        self.pay.charge(cart.total, user)
        self.notify.send(user.email, "thanks")
```

**Intermediate Level:** SDK clients for internal microservices cluster.

```python
class PlatformAPI:
    def __init__(self, http: HttpClient):
        self.http = http

    def provision_tenant(self, name: str):
        self.http.post("/tenants", json={"name": name})
        self.http.post("/billing/enable", json={"tenant": name})
```

**Expert Level:** Stability layer for third-party API changes behind your facade.

```python
# When vendor v2 breaks, adjust facade only
```

#### Key Points — facade

- Hides complexity, not observability—still log inside.
- Don't turn into god object.
- Test facade with integration fakes.

---

### 32.5.4 Flyweight

**Beginner Level:** Share immutable intrinsic state across many objects—glyph fonts in text renderers.

```python
class IconFlyweight:
    def __init__(self, name: str, svg: str):
        self.name = name
        self.svg = svg


_CACHE: dict[str, IconFlyweight] = {}


def get_icon(name: str) -> IconFlyweight:
    if name not in _CACHE:
        _CACHE[name] = IconFlyweight(name, load_svg(name))
    return _CACHE[name]
```

**Intermediate Level:** **`intern()`** strings or small ints are language flyweights.

```python
a = "hello"
b = "hello"
assert a is b  # sometimes CPython interns
```

**Expert Level:** Memory pressure in simulation engines with millions of similar nodes.

```python
# Separate extrinsic state (position) from intrinsic (type id)
```

#### Key Points — flyweight

- Immutability required for shared cache.
- Thread safety on cache.
- Measure savings—not always worth complexity.

---

### 32.5.5 Proxy

**Beginner Level:** Placeholder controlling access—lazy image load, permission check.

```python
class SecureAccount:
    def __init__(self, real, user):
        self.real = real
        self.user = user

    def balance(self):
        if not self.user.can_view_balance():
            raise PermissionDenied
        return self.real.balance()
```

**Intermediate Level:** Virtual proxy delays object creation; remote proxy RPC stub.

```python
class RemoteService:
    def call(self, payload):
        return http_post("/rpc", json=payload)
```

**Expert Level:** Caching/metrics proxy around repository interfaces via composition.

```python
class MeteredRepo:
    def __init__(self, inner):
        self.inner = inner

    def get(self, id):
        metrics.repo_gets.inc()
        return self.inner.get(id)
```

#### Key Points — proxy

- Transparent to clients if API matches.
- Decorators overlap conceptually.
- Watch identity **`is`** checks.

---

## 32.6 Behavioral patterns

### 32.6.1 Chain of responsibility

**Beginner Level:** Pass request along a chain until handled—middleware stacks in web frameworks.

```python
class Handler(Protocol):
    def set_next(self, h: "Handler") -> "Handler": ...
    def handle(self, req): ...
```

**Intermediate Level:** Auth pipelines try JWT, then API key, then session cookie.

```python
def authenticate(req):
    for strategy in (jwt_strategy, api_key_strategy, session_strategy):
        user = strategy.try_auth(req)
        if user:
            return user
    raise Unauthorized
```

**Expert Level:** Ordered plugins processing webhooks with short-circuit.

```python
for plugin in plugins:
    if plugin.accepts(event):
        return plugin.handle(event)
```

#### Key Points — chain

- Avoid deep chains hard to debug.
- Explicit ordering documented.
- Return None vs raise policy consistent.

---

### 32.6.2 Command

**Beginner Level:** Encapsulate action as object for undo/queue/logging—text editor ops.

```python
class Command(Protocol):
    def execute(self) -> None: ...
    def undo(self) -> None: ...


class DepositCmd:
    def __init__(self, account, amount):
        self.account = account
        self.amount = amount

    def execute(self):
        self.account.balance += self.amount

    def undo(self):
        self.account.balance -= self.amount
```

**Intermediate Level:** Celery tasks as commands serialized to broker.

```python
@app.task
def send_invoice(order_id: str):
    ...
```

**Expert Level:** Event sourcing stores commands/events not state mutations directly.

```python
events.append(InvoiceIssued(order_id))
```

#### Key Points — command

- History stack for undo.
- Macro commands compose lists.
- Idempotency keys for queued commands.

---

### 32.6.3 Interpreter

**Beginner Level:** Define grammar and interpret sentences—simple rule engines or DSL.

```python
class Expr(Protocol):
    def eval(self, ctx: dict) -> float: ...


class Const:
    def __init__(self, v: float):
        self.v = v

    def eval(self, ctx):
        return self.v


class Var:
    def __init__(self, name: str):
        self.name = name

    def eval(self, ctx):
        return ctx[self.name]
```

**Intermediate Level:** JSONLogic, CEL, SQLAlchemy Core expressions instead of custom interpreters when possible.

```python
# Prefer existing DSL with community support
```

**Expert Level:** Security sandbox AST interpreters with allowlists only.

```python
ALLOWED_NODES = {ast.Expression, ast.BinOp, ast.Num, ast.Name}
```

#### Key Points — interpreter

- Performance often poor vs compiled forms.
- Testing grammar edge cases.
- Avoid Turing-complete user DSLs without governance.

---

### 32.6.4 Iterator

**Beginner Level:** Traverse collections without exposing internals—Python **`iter`/`next`**.

```python
class CountUp:
    def __init__(self, n: int):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        self.i += 1
        return self.i - 1
```

**Intermediate Level:** Generators **`yield`** simpler for streaming ETL.

```python
def lines(path: str):
    with open(path) as f:
        for line in f:
            yield line.rstrip("\n")
```

**Expert Level:** Legacy `__getitem__`-style iteration is discouraged; prefer the iterator protocol and `itertools` for composition.

```python
import itertools

for chunk in itertools.batched(iterable, 500):
    flush(chunk)
```

#### Key Points — iterator

- Lazy evaluation saves memory.
- Composable with pipeline functions.
- Two protocols: iterable vs iterator.

---

### 32.6.5 Mediator

**Beginner Level:** Central object routes interactions between components—chat room broadcasts messages.

```python
class ChatRoom:
    def __init__(self):
        self.users: list[User] = []

    def broadcast(self, from_user: str, text: str):
        for u in self.users:
            if u.name != from_user:
                u.receive(from_user, text)
```

**Intermediate Level:** Front-controller services orchestrating sagas between bounded contexts.

```python
class OrderMediator:
    def place_order(self, cmd):
        self.inventory.reserve(cmd.items)
        self.payment.authorize(cmd.card)
        self.shipping.schedule(cmd.address)
```

**Expert Level:** Event mediators (buses) decouple microservices with schemas and SLAs.

```python
bus.publish(OrderPlaced(...))
```

#### Key Points — mediator

- Avoid mediator becoming god service.
- Test mediator with fakes for deps.
- Async mediation needs idempotency.

---

### 32.6.6 State

**Beginner Level:** Object changes behavior when internal state changes—order status machine.

```python
class DraftState:
    def submit(self, order):
        order.state = SubmittedState()


class SubmittedState:
    def submit(self, order):
        raise InvalidTransition


class Order:
    def __init__(self):
        self.state = DraftState()

    def submit(self):
        self.state.submit(self)
```

**Intermediate Level:** Explicit transition tables **`dict[(State,Event), State]`** for auditability in compliance workflows.

```python
TRANSITIONS = {
    ("draft", "submit"): "submitted",
    ("submitted", "pay"): "paid",
}
```

**Expert Level:** Persist state version for migrations when rules change.

```python
order.state_machine_version = 2
```

#### Key Points — state

- Table-driven often clearer than class per state.
- Invalid transitions explicit errors.
- Logging transitions for support.

---

### 32.6.7 Visitor

**Beginner Level:** Separate algorithms from object structure—walk AST nodes with **`visit_Add`**, **`visit_Mul`**.

```python
class Node(Protocol):
    def accept(self, v: "Visitor"): ...


class Visitor(Protocol):
    def visit_literal(self, n): ...
    def visit_add(self, n): ...
```

**Intermediate Level:** Double dispatch awkward in Python—often **`singledispatch`** on type simpler.

```python
from functools import singledispatch


@singledispatch
def render(node):
    raise TypeError


@render.register
def _(node: Literal):
    return str(node.value)
```

**Expert Level:** Compiler passes over IR trees use visitor pattern heavily.

```python
class OptimizePass(Visitor):
    ...
```

#### Key Points — visitor

- Adding new node types touches all visitors.
- **`singledispatch`** reduces boilerplate.
- Stack overflow risk on deep trees—iterate with explicit stack.

---

## 32.7 Anti-patterns

### 32.7.1 God objects

**Beginner Level:** One class knows everything—hard to test and merge conflicts constant.

```python
# Smell: App class with DB, email, PDF, billing, auth...
```

**Intermediate Level:** Split by domain modules; inject dependencies.

```python
class BillingService: ...
class AuthService: ...
```

**Expert Level:** Detect via code metrics (lines, fan-in/out) in CI gates.

```python
# radon cc / import-linter rules
```

#### Key Points — god objects

- High coupling kills velocity.
- Refactor incrementally behind facades.
- Ownership per module.

---

### 32.7.2 Dead code

**Beginner Level:** Unused functions confuse readers—delete.

```python
# vulture / ruff F401 for unused imports
```

**Intermediate Level:** Feature flags leaving orphaned branches — periodic cleanups.

```python
if False:
    legacy_path()
```

**Expert Level:** Deprecation process with timeline and telemetry proving zero use.

```python
warnings.warn("old_api deprecated", DeprecationWarning, stacklevel=2)
```

#### Key Points — dead code

- Git history recovers old code.
- Coverage helps identify.
- Commented-out blocks are noise.

---

### 32.7.3 Duplication

**Beginner Level:** Copy-paste validation logic diverges — extract function.

```python
def validate_email(s: str) -> None:
    ...
```

**Intermediate Level:** DRY not absolute—wrong abstraction worse than some duplication (AHA principle).

```python
# Two similar but independently evolving flows — maybe keep separate
```

**Expert Level:** Shared libraries versioned for multiple services.

```python
# internal package common-validation==2.1.0
```

#### Key Points — duplication

- Rule of three before abstracting.
- Cross-service duplication vs shared lib tradeoff.
- Tests catch drift when duplicated.

---

### 32.7.4 Long methods

**Beginner Level:** 100+ line functions hide structure—extract named steps.

```python
def process_order(order):
    validated = validate(order)
    priced = price(validated)
    charged = charge(priced)
    notify(charged)
```

**Intermediate Level:** Cognitive load limits — one screenful per function guideline.

```python
# black/ruff line length 88 encourages breaks
```

**Expert Level:** Pipeline builders for ETL with observable stages.

```python
Pipeline([parse, validate, enrich, load]).run(batch)
```

#### Key Points — long methods

- Single level of abstraction per function.
- Test each step in isolation.
- Comments as last resort — name functions.

---

### 32.7.5 Feature envy

**Beginner Level:** Method uses another class's data more than its own — move method.

```python
# Instead of order.receipt_text() reaching into customer.address fields deeply,
# put formatting on Customer or a dedicated ReceiptFormatter
```

**Intermediate Level:** Law of Demeter thinking — few dots.

```python
customer.address.city  # ok occasionally
customer.friend.spouse.account.balance  # envy smell
```

**Expert Level:** DTO layers explicitly shape cross-context data.

```python
@dataclass
class ReceiptDTO:
    name: str
    addr_line: str
```

#### Key Points — feature envy

- Improves cohesion.
- Reduces coupling changes.
- Sometimes pragmatic to violate for performance.

---

### 32.7.6 Primitive obsession

**Beginner Level:** Passing **`str`** for email, **`int`** for cents, **`tuple[float,float]`** for money pairs — wrap types.

```python
from typing import NewType

Email = NewType("Email", str)
Cents = NewType("Cents", int)
```

**Intermediate Level:** **`dataclasses`** for **Money(currency, minor)`** with validation.

```python
@dataclass(frozen=True)
class Money:
    currency: str
    minor_units: int

    def __post_init__(self):
        if len(self.currency) != 3:
            raise ValueError
```

**Expert Level:** Domain types propagate through APIs — OpenAPI schemas generated.

```python
class MoneyModel(BaseModel):
    currency: constr(min_length=3, max_length=3)
    minor_units: conint(ge=0)
```

#### Key Points — primitive obsession

- Prevents accidental mixing USD cents with EUR cents.
- Self-documenting signatures.
- Gradual typing migration path.

---

## 32.8 Python-specific practices

### 32.8.1 Pythonic code

**Beginner Level:** Truthiness, **`enumerate`**, **`zip`**, comprehensions read clearly.

```python
if items:
    for i, x in enumerate(items):
        ...
```

**Intermediate Level:** **`pathlib`**, **`dataclasses`**, **`f-strings`**, **`contextlib`**.

```python
from pathlib import Path

data = Path("file.txt").read_text(encoding="utf-8")
```

**Expert Level:** **`match/case`** for structured routing; **`TypedDict`** for JSON shapes.

```python
match event["type"]:
    case "order.paid":
        ...
```

#### Key Points — pythonic

- Read PEP examples and stdlib code.
- Prefer exceptions over sentinel returns for errors.
- EAFP easier to ask forgiveness than permission.

---

### 32.8.2 PEP 8

**Beginner Level:** 4 spaces, 79/88 lines, imports grouped.

```python
import os

import requests

from mypkg import util
```

**Intermediate Level:** **`ruff`** + **`black`** enforce mechanically.

```toml
[tool.ruff]
line-length = 88
```

**Expert Level:** Agree team exceptions documented (e.g., generated code **excluded).

```text
[tool.ruff.lint.per-file-ignores]
"generated/*" = ["ALL"]
```

#### Key Points — PEP 8

- Consistency beats personal taste.
- Autoformat in pre-commit.
- Naming conventions for tests too.

---

### 32.8.3 Type hints

**Beginner Level:** Annotate public functions **`def f(x: int) -> str`**.

```python
def add(a: int, b: int) -> int:
    return a + b
```

**Intermediate Level:** **`Protocol`**, **`Generic`**, **`TypeVar`**, **`Literal`**, **`Annotated`**.

```python
from typing import Protocol, Iterable

def first[T](xs: Iterable[T]) -> T | None:
    for x in xs:
        return x
    return None
```

**Expert Level:** **`mypy --strict`** in CI for core packages; **`py.typed`** marker for libraries.

```python
# pyproject [tool.mypy] strict = true for selected modules
```

#### Key Points — type hints

- Gradual typing OK.
- Avoid **`Any`** spray.
- Runtime validation still needed at boundaries.

---

### 32.8.4 Docstrings

**Beginner Level:** Triple-quoted first line summary for modules/classes.

```python
def clamp(x: float, lo: float, hi: float) -> float:
    """Return x limited to the inclusive [lo, hi] interval."""
```

**Intermediate Level:** Args/Returns/Raises sections Google style.

```python
Raises:
    ValueError: if lo > hi.
```

**Expert Level:** Sphinx cross-references **`:class:`** links in library docs.

```python
"""See also :class:`Order` for lifecycle rules."""
```

#### Key Points — docstrings

- First line is imperative summary.
- Examples in doctest optional.
- Keep synced with behavior.

---

### 32.8.5 Error philosophy

**Beginner Level:** Exceptions for exceptional paths; don't use them for control flow in tight loops without care.

```python
try:
    value = mapping[key]
except KeyError:
    value = default
```

**Intermediate Level:** Custom exception hierarchies per domain **`BillingError`**.

```python
class BillingError(Exception): ...
class InsufficientFunds(BillingError): ...
```

**Expert Level:** Exception chaining **`raise New from e`** preserves context.

```python
try:
    raw = fetch()
except IOError as e:
    raise ServiceUnavailable("upstream down") from e
```

#### Key Points — errors

- Fine-grained types help callers.
- Don't catch **`Exception`** unless boundary logging.
- Retry only transient cases.

---

### 32.8.6 Zen of Python

**Beginner Level:** **`import this`** — readability, explicitness, simplicity.

```python
import this  # Easter egg prints the Zen
```

**Intermediate Level:** Apply to API design — one obvious way where possible.

```python
# Prefer pathlib over multiple os.path joins in new code
```

**Expert Level:** Balance pragmatism when performance or security demands complexity — document why.

```python
# Complex caching for p99 SLO — see ADR 0012
```

#### Key Points — Zen

- Not dogma — context matters.
- Teach new hires early.
- Code review checklist grounded in Zen principles.

---

## Best Practices

- Design for change with clear boundaries and tests.
- Prefer composition and protocols over deep inheritance.
- Automate style, types, tests, security scans in CI.
- Document architecture decisions (ADRs) for non-obvious choices.
- Refactor anti-patterns incrementally behind feature flags when needed.
- Patterns are vocabulary — don't force them where simple functions suffice.
- Align code structure with team topology consciously.

---

## Common Mistakes to Avoid

- Pattern cargo-culting without understanding forces and tradeoffs.
- Premature abstraction from one use case.
- Ignoring types until the codebase is too large to annotate.
- Megafiles and circular imports from lazy module placement.
- Testing only mocks — no integration confidence.
- Inconsistent error handling strategies across layers.
- SOLID taken to extremes producing interface proliferation.
- Anti-pattern recognition without a plan to pay down debt.

---

*Good design is iterative: patterns help you communicate intent—clarity for the next engineer is the ultimate metric.*
