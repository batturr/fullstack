
# Object-Oriented Programming in Python

OOP models banks, stores, and HR systems as collaborating objects: accounts encapsulate balances, shopping carts own lines, and employees expose behavior—not just data bags.



## 📑 Table of Contents

- [11.1 Fundamentals](#111-fundamentals)
- [11.2 Constructors and `__init__`](#112-constructors-and-init)
- [11.3 Instance Methods](#113-instance-methods)
- [11.4 Class Variables](#114-class-variables)
- [11.5 Inheritance](#115-inheritance)
- [11.6 Encapsulation](#116-encapsulation)
- [11.7 Polymorphism](#117-polymorphism)
- [11.8 Dunder Methods](#118-dunder-methods)
- [11.9 Class and Static Methods](#119-class-and-static-methods)
- [11.10 Abstract Base Classes](#1110-abstract-base-classes)
- [11.11 Protocols and Memory Patterns](#1111-protocols-and-memory-patterns)

### 11.1 Fundamentals
<a id="111-fundamentals"></a>



### 11.1.1 Objects and Classes

<a id="1111-objects-and-classes"></a>

**Beginner Level**: In real-world library system workflows, Objects and Classes connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in library system contexts combine solid practice around objects and classes with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to objects and classes affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in library system systems.

```python
class Book:
    'Represents a catalog item.'

    pass


b = Book()
print(type(b).__name__)
```

**Key Points**
- Classes are blueprints; objects are concrete instances
- Everything in Python is an object
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.1.2 Attributes and Methods

<a id="1112-attributes-and-methods"></a>

**Beginner Level**: In real-world employee records workflows, Attributes and Methods connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in employee records contexts combine solid practice around attributes and methods with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to attributes and methods affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in employee records systems.

```python
class Employee:
    role = "staff"

    def badge(self):
        return f"{self.role}"


e = Employee()
print(e.badge())
```

**Key Points**
- Attributes store state; methods define behavior
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.1.3 Creating Classes

<a id="1113-creating-classes"></a>

**Beginner Level**: In real-world inventory SKU workflows, Creating Classes connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory SKU contexts combine solid practice around creating classes with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to creating classes affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory SKU systems.

```python
class SKU:
    def __init__(self, code):
        self.code = code


print(SKU("A-1").code)
```

**Key Points**
- `class` statement executes once to build the class object
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.1.4 Creating Instances

<a id="1114-creating-instances"></a>

**Beginner Level**: In real-world bank accounts workflows, Creating Instances connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bank accounts contexts combine solid practice around creating instances with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to creating instances affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bank accounts systems.

```python
class Account:
    def __init__(self, iban):
        self.iban = iban


acct = Account("DE89...")
print(acct.iban[:4])
```

**Key Points**
- Calling a class constructs an instance via `__new__`/`__init__`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.1.5 Identity vs State

<a id="1115-identity-and-state"></a>

**Beginner Level**: In real-world shopping session workflows, Identity vs State connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in shopping session contexts combine solid practice around identity vs state with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to identity vs state affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in shopping session systems.

```python
class Session:
    pass


a = Session()
b = Session()
print(a is b, a == b)
```

**Key Points**
- `is` compares identity; `==` uses `__eq__`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.1.6 `__dict__` and Per-object State

<a id="1116-object-dict"></a>

**Beginner Level**: In real-world CRM notes workflows, `__dict__` and Per-object State connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in CRM notes contexts combine solid practice around `__dict__` and per-object state with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__dict__` and per-object state affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in CRM notes systems.

```python
class Contact:
    def __init__(self, name):
        self.name = name


c = Contact("Bo")
print(c.__dict__)
```

**Key Points**
- Default instance attribute storage
- `__slots__` can replace dict for memory
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.2 Constructors and `__init__`

<a id="112-constructors-and-init"></a>

### 11.2.1 The `__init__` Method

<a id="1121-constructor-init"></a>

**Beginner Level**: In real-world e-commerce product workflows, The `__init__` Method connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce product contexts combine solid practice around the `__init__` method with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `__init__` method affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce product systems.

```python
class Product:
    def __init__(self, sku, price):
        self.sku = sku
        self.price = price


p = Product("SKU", 9.99)
```

**Key Points**
- Initializer configures new instance—not a constructor in C++ sense
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.2.2 Constructor Parameters

<a id="1122-constructor-parameters"></a>

**Beginner Level**: In real-world payroll workflows, Constructor Parameters connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payroll contexts combine solid practice around constructor parameters with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to constructor parameters affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payroll systems.

```python
class PayStub:
    def __init__(self, emp_id, gross, net):
        self.emp_id = emp_id
        self.gross = gross
        self.net = net
```

**Key Points**
- Keep `__init__` parameters explicit for testability
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.2.3 Defaults in Constructors

<a id="1123-defaults-in-constructors"></a>

**Beginner Level**: In real-world shipping workflows, Defaults in Constructors connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in shipping contexts combine solid practice around defaults in constructors with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to defaults in constructors affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in shipping systems.

```python
class Box:
    def __init__(self, label, priority=False):
        self.label = label
        self.priority = priority
```

**Key Points**
- Same default-arg rules as functions apply
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.2.4 Instance Variables

<a id="1124-instance-variables"></a>

**Beginner Level**: In real-world cart line workflows, Instance Variables connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in cart line contexts combine solid practice around instance variables with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to instance variables affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in cart line systems.

```python
class LineItem:
    def __init__(self, sku, qty):
        self.sku = sku
        self.qty = qty
```

**Key Points**
- Unique per instance
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.2.5 Class Variables (in Constructors Context)

<a id="1125-class-variables"></a>

**Beginner Level**: In real-world loyalty tiers workflows, Class Variables (in Constructors Context) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in loyalty tiers contexts combine solid practice around class variables (in constructors context) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to class variables (in constructors context) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in loyalty tiers systems.

```python
class Member:
    tier = "standard"

    def __init__(self, name):
        self.name = name


print(Member.tier)
```

**Key Points**
- Class attrs shared unless shadowed by instance attrs
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.2.6 The `self` Parameter

<a id="1126-self-parameter"></a>

**Beginner Level**: In real-world hotel booking workflows, The `self` Parameter connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in hotel booking contexts combine solid practice around the `self` parameter with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `self` parameter affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in hotel booking systems.

```python
class Reservation:
    def __init__(self, code):
        self.code = code

    def confirm(self):
        return self.code.upper()
```

**Key Points**
- First parameter receives instance—name `self` by convention
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.3 Instance Methods

<a id="113-instance-methods"></a>

### 11.3.1 Instance Methods

<a id="1131-instance-methods"></a>

**Beginner Level**: In real-world POS sale workflows, Instance Methods connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in POS sale contexts combine solid practice around instance methods with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to instance methods affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in POS sale systems.

```python
class Register:
    def __init__(self):
        self.total = 0

    def add(self, amount):
        self.total += amount
```

**Key Points**
- Automatic binding passes instance as `self`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.3.2 Calling Methods

<a id="1132-calling-methods"></a>

**Beginner Level**: In real-world support ticket workflows, Calling Methods connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in support ticket contexts combine solid practice around calling methods with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to calling methods affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in support ticket systems.

```python
class Ticket:
    def close(self):
        return "closed"


t = Ticket()
print(Ticket.close(t))
```

**Key Points**
- `t.method()` ↔ `Class.method(t)`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.3.3 `self` in Method Bodies

<a id="1133-self-in-methods"></a>

**Beginner Level**: In real-world inventory transfer workflows, `self` in Method Bodies connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory transfer contexts combine solid practice around `self` in method bodies with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `self` in method bodies affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory transfer systems.

```python
class Bin:
    def __init__(self, items):
        self.items = items

    def count(self):
        return len(self.items)
```

**Key Points**
- Use `self` to reach sibling methods and state
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.3.4 Method Parameters

<a id="1134-method-parameters"></a>

**Beginner Level**: In real-world tax engine workflows, Method Parameters connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in tax engine contexts combine solid practice around method parameters with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to method parameters affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in tax engine systems.

```python
class Tax:
    def on_subtotal(self, sub, rate):
        return sub * rate
```

**Key Points**
- Methods can take extra args like functions
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.3.5 Return Values from Methods

<a id="1135-method-return-values"></a>

**Beginner Level**: In real-world analytics rollup workflows, Return Values from Methods connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in analytics rollup contexts combine solid practice around return values from methods with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to return values from methods affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in analytics rollup systems.

```python
class Rollup:
    def sum_pairs(self, pairs):
        return sum(a + b for a, b in pairs)
```

**Key Points**
- Returning `None` is implicit without `return`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.4 Class Variables

<a id="114-class-variables"></a>

### 11.4.1 Defining Class Variables

<a id="1141-defining-class-variables"></a>

**Beginner Level**: In real-world warehouse zones workflows, Defining Class Variables connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in warehouse zones contexts combine solid practice around defining class variables with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to defining class variables affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in warehouse zones systems.

```python
class Zone:
    code = "A"


print(Zone.code)
```

**Key Points**
- Assigned in class body
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.4.2 Accessing Class Variables

<a id="1142-accessing-class-variables"></a>

**Beginner Level**: In real-world pricing defaults workflows, Accessing Class Variables connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in pricing defaults contexts combine solid practice around accessing class variables with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to accessing class variables affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in pricing defaults systems.

```python
class Quote:
    default_margin = 0.2


print(Quote.default_margin)
```

**Key Points**
- Readable via class or instance if not shadowed
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.4.3 Class vs Instance Variables

<a id="1143-class-vs-instance-vars"></a>

**Beginner Level**: In real-world seat map workflows, Class vs Instance Variables connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in seat map contexts combine solid practice around class vs instance variables with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to class vs instance variables affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in seat map systems.

```python
class Seat:
    section = "upper"

    def __init__(self, row):
        self.row = row


s = Seat(12)
print(s.section, s.row)
```

**Key Points**
- Lookup order: instance dict → class → bases
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.4.4 Shared Mutable Class State (Caution)

<a id="1144-shared-mutable-state"></a>

**Beginner Level**: In real-world bad pattern workflows, Shared Mutable Class State (Caution) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bad pattern contexts combine solid practice around shared mutable class state (caution) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to shared mutable class state (caution) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bad pattern systems.

```python
class Counter:
    seen = []

    def add(self, x):
        self.seen.append(x)


a = Counter()
b = Counter()
a.add(1)
print(b.seen)
```

**Key Points**
- Mutable class attrs are shared—often a bug
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.4.5 Modifying Class Variables

<a id="1145-modifying-class-variables"></a>

**Beginner Level**: In real-world feature flags workflows, Modifying Class Variables connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in feature flags contexts combine solid practice around modifying class variables with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to modifying class variables affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in feature flags systems.

```python
class Feature:
    beta = False


Feature.beta = True
print(Feature.beta)
```

**Key Points**
- Assign on class updates shared value for all instances
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.5 Inheritance

<a id="115-inheritance"></a>

### 11.5.1 Parent and Child Classes

<a id="1151-parent-child-classes"></a>

**Beginner Level**: In real-world payments workflows, Parent and Child Classes connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments contexts combine solid practice around parent and child classes with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to parent and child classes affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments systems.

```python
class Instrument:
    def charge(self, amount):
        return amount


class Card(Instrument):
    def charge(self, amount):
        return super().charge(amount) + 0.5
```

**Key Points**
- Subclass extends or specializes behavior
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.5.2 The `super()` Function

<a id="1152-super-function"></a>

**Beginner Level**: In real-world e-commerce catalog workflows, The `super()` Function connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce catalog contexts combine solid practice around the `super()` function with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `super()` function affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce catalog systems.

```python
class DigitalProduct:
    def price(self):
        return 10


class Bundle(DigitalProduct):
    def price(self):
        return super().price() * 2
```

**Key Points**
- `super()` follows MRO for cooperative inheritance
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.5.3 Overriding Methods

<a id="1153-overriding-methods"></a>

**Beginner Level**: In real-world HR policies workflows, Overriding Methods connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in HR policies contexts combine solid practice around overriding methods with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to overriding methods affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in HR policies systems.

```python
class Policy:
    def pto(self):
        return 10


class Manager(Policy):
    def pto(self):
        return 15
```

**Key Points**
- Child replaces parent implementation
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.5.4 Method Resolution Order (MRO)

<a id="1154-mro"></a>

**Beginner Level**: In real-world multi-service SDK workflows, Method Resolution Order (MRO) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in multi-service SDK contexts combine solid practice around method resolution order (mro) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to method resolution order (mro) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in multi-service SDK systems.

```python
class A:
    def m(self):
        return "A"


class B(A):
    def m(self):
        return "B"


print(B.mro())
```

**Key Points**
- C3 linearization determines `super()` path
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.5.5 Multiple Inheritance

<a id="1155-multiple-inheritance"></a>

**Beginner Level**: In real-world mixins workflows, Multiple Inheritance connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in mixins contexts combine solid practice around multiple inheritance with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to multiple inheritance affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in mixins systems.

```python
class LoggerMixin:
    def log(self, msg):
        print(msg)


class Service(LoggerMixin):
    def run(self):
        self.log("go")


Service().run()
```

**Key Points**
- Mixins add orthogonal capabilities
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.5.6 Cooperative Multiple Inheritance

<a id="1156-cooperative-inheritance"></a>

**Beginner Level**: In real-world streaming pipeline workflows, Cooperative Multiple Inheritance connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in streaming pipeline contexts combine solid practice around cooperative multiple inheritance with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to cooperative multiple inheritance affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in streaming pipeline systems.

```python
class Base:
    def setup(self):
        return ["base"]


class Middle(Base):
    def setup(self):
        return super().setup() + ["mid"]


class Top(Middle):
    def setup(self):
        return super().setup() + ["top"]


print(Top().setup())
```

**Key Points**
- Each class calls `super()` so chain composes
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.6 Encapsulation

<a id="116-encapsulation"></a>

### 11.6.1 Access Modifiers (Convention)

<a id="1161-access-modifiers-convention"></a>

**Beginner Level**: In real-world API keys workflows, Access Modifiers (Convention) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in API keys contexts combine solid practice around access modifiers (convention) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to access modifiers (convention) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in API keys systems.

```python
class Client:
    def __init__(self, token):
        self._token = token
```

**Key Points**
- Python uses naming conventions—not enforced privacy
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.6.2 Name Mangling with `__`

<a id="1162-name-mangling-private"></a>

**Beginner Level**: In real-world plugins workflows, Name Mangling with `__` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in plugins contexts combine solid practice around name mangling with `__` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to name mangling with `__` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in plugins systems.

```python
class Plugin:
    def __init__(self):
        self.__secret = 1

    def bump(self):
        self.__secret += 1
        return self.__secret
```

**Key Points**
- `__attr` becomes `_Class__attr`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.6.3 Protected with Single `_`

<a id="1163-protected-single-underscore"></a>

**Beginner Level**: In real-world internal hooks workflows, Protected with Single `_` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in internal hooks contexts combine solid practice around protected with single `_` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to protected with single `_` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in internal hooks systems.

```python
class Framework:
    def _hook(self):
        return 2
```

**Key Points**
- Signals “internal use” to humans and linters
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.6.4 Getters and Setters (Manual)

<a id="1164-getters-setters"></a>

**Beginner Level**: In real-world wallet workflows, Getters and Setters (Manual) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in wallet contexts combine solid practice around getters and setters (manual) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to getters and setters (manual) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in wallet systems.

```python
class Wallet:
    def __init__(self):
        self._bal = 0

    def get_bal(self):
        return self._bal

    def set_bal(self, v):
        if v < 0:
            raise ValueError("bal")
        self._bal = v
```

**Key Points**
- Verbose but explicit validation point
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.6.5 The `@property` Decorator

<a id="1165-property-decorator"></a>

**Beginner Level**: In real-world temperature-controlled goods workflows, The `@property` Decorator connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in temperature-controlled goods contexts combine solid practice around the `@property` decorator with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `@property` decorator affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in temperature-controlled goods systems.

```python
class Shipment:
    def __init__(self, c):
        self._celsius = c

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, v):
        if v < -30:
            raise ValueError("too cold")
        self._celsius = v
```

**Key Points**
- Pythonic computed attributes
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.6.6 Encapsulation as a Design Boundary

<a id="1166-encapsulation-design"></a>

**Beginner Level**: In real-world bounded context workflows, Encapsulation as a Design Boundary connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bounded context contexts combine solid practice around encapsulation as a design boundary with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to encapsulation as a design boundary affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bounded context systems.

```python
class Account:
    def __init__(self):
        self._ledger = []

    def deposit(self, amt):
        self._ledger.append(amt)
```

**Key Points**
- Hide representation; expose behavior
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.7 Polymorphism

<a id="117-polymorphism"></a>

### 11.7.1 Polymorphism via Overriding

<a id="1171-polymorphic-overriding"></a>

**Beginner Level**: In real-world notification channels workflows, Polymorphism via Overriding connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in notification channels contexts combine solid practice around polymorphism via overriding with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to polymorphism via overriding affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in notification channels systems.

```python
class Channel:
    def send(self, msg):
        raise NotImplementedError


class Email(Channel):
    def send(self, msg):
        return "email:" + msg
```

**Key Points**
- Callers depend on shared interface
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.7.2 Operator Overloading

<a id="1172-operator-overloading"></a>

**Beginner Level**: In real-world money vector workflows, Operator Overloading connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in money vector contexts combine solid practice around operator overloading with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to operator overloading affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in money vector systems.

```python
class Money:
    def __init__(self, v):
        self.v = v

    def __add__(self, other):
        return Money(self.v + other.v)


print((Money(1) + Money(2)).v)
```

**Key Points**
- Rich comparison, arithmetic, etc. via dunders
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.7.3 Duck Typing

<a id="1173-duck-typing"></a>

**Beginner Level**: In real-world report exporters workflows, Duck Typing connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in report exporters contexts combine solid practice around duck typing with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to duck typing affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in report exporters systems.

```python
class CSV:
    def rows(self):
        return [["a"]]


class JSON:
    def rows(self):
        return [["b"]]


def dump(src):
    for r in src.rows():
        print(r)


dump(CSV())
```

**Key Points**
- “If it walks like a duck…”—protocol over inheritance
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.7.4 Polymorphic Functions

<a id="1174-polymorphic-functions"></a>

**Beginner Level**: In real-world checkout discounts workflows, Polymorphic Functions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in checkout discounts contexts combine solid practice around polymorphic functions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to polymorphic functions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in checkout discounts systems.

```python
def discount(policy, amount):
    return policy.apply(amount)


class Flat:
    def apply(self, amount):
        return amount - 5
```

**Key Points**
- Strategy objects instead of giant `if` chains
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.7.5 `isinstance` for Type Branches

<a id="1175-isinstance-checks"></a>

**Beginner Level**: In real-world serialization workflows, `isinstance` for Type Branches connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in serialization contexts combine solid practice around `isinstance` for type branches with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `isinstance` for type branches affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in serialization systems.

```python
def encode(obj):
    if isinstance(obj, dict):
        return "map"
    return "scalar"


print(encode({}))
```

**Key Points**
- Prefer ABCs or protocols for structure
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8 Dunder Methods

<a id="118-dunder-methods"></a>

### 11.8.1 `__str__` Human-readable Strings

<a id="1181-dunder-str"></a>

**Beginner Level**: In real-world customer-facing workflows, `__str__` Human-readable Strings connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in customer-facing contexts combine solid practice around `__str__` human-readable strings with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__str__` human-readable strings affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in customer-facing systems.

```python
class Order:
    def __init__(self, oid):
        self.oid = oid

    def __str__(self):
        return f"Order({self.oid})"


print(str(Order(9)))
```

**Key Points**
- Used by `print` and `str()`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.2 `__repr__` Unambiguous Representations

<a id="1182-dunder-repr"></a>

**Beginner Level**: In real-world debugging workflows, `__repr__` Unambiguous Representations connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in debugging contexts combine solid practice around `__repr__` unambiguous representations with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__repr__` unambiguous representations affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in debugging systems.

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"


print(repr(Point(1, 2)))
```

**Key Points**
- Should ideally be evaluable when possible
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.3 `__len__` and Truthiness

<a id="1183-dunder-len"></a>

**Beginner Level**: In real-world warehouse bin workflows, `__len__` and Truthiness connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in warehouse bin contexts combine solid practice around `__len__` and truthiness with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__len__` and truthiness affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in warehouse bin systems.

```python
class Bin:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)


b = Bin([1, 2, 3])
print(len(b), bool(b))
```

**Key Points**
- Enables `len()`; may affect truthiness if no `__bool__`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.4 `__getitem__` Indexing

<a id="1184-dunder-getitem"></a>

**Beginner Level**: In real-world library shelf workflows, `__getitem__` Indexing connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in library shelf contexts combine solid practice around `__getitem__` indexing with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__getitem__` indexing affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in library shelf systems.

```python
class Shelf:
    def __init__(self, books):
        self.books = books

    def __getitem__(self, i):
        return self.books[i]


print(Shelf(["A", "B"])[0])
```

**Key Points**
- Slice support with `__getitem__` accepting slice objects
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.5 `__setitem__` and `__delitem__`

<a id="1185-dunder-setitem-delitem"></a>

**Beginner Level**: In real-world mutable models workflows, `__setitem__` and `__delitem__` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in mutable models contexts combine solid practice around `__setitem__` and `__delitem__` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__setitem__` and `__delitem__` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in mutable models systems.

```python
class Bag:
    def __init__(self):
        self.d = {}

    def __setitem__(self, k, v):
        self.d[k] = v

    def __delitem__(self, k):
        del self.d[k]


b = Bag()
b["k"] = 1
del b["k"]
```

**Key Points**
- Makes instances feel like mappings
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.6 `__add__` and Related Dunders

<a id="1186-dunder-add-arithmetic"></a>

**Beginner Level**: In real-world cart merge workflows, `__add__` and Related Dunders connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in cart merge contexts combine solid practice around `__add__` and related dunders with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__add__` and related dunders affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in cart merge systems.

```python
class Cart:
    def __init__(self, items):
        self.items = items

    def __add__(self, other):
        return Cart(self.items + other.items)


c = Cart([1]) + Cart([2])
print(c.items)
```

**Key Points**
- Also `__radd__` for reflected ops
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.7 Callable Instances (`__call__`)

<a id="1187-dunder-call"></a>

**Beginner Level**: In real-world fee rules workflows, Callable Instances (`__call__`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in fee rules contexts combine solid practice around callable instances (`__call__`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to callable instances (`__call__`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in fee rules systems.

```python
class TieredFee:
    def __call__(self, amount):
        return amount * 0.02


fee = TieredFee()
print(fee(100))
```

**Key Points**
- Use sparingly—can surprise readers
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.8 Context Managers (`__enter__`/`__exit__`)

<a id="1188-dunder-enter-exit"></a>

**Beginner Level**: In real-world DB transactions workflows, Context Managers (`__enter__`/`__exit__`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in DB transactions contexts combine solid practice around context managers (`__enter__`/`__exit__`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to context managers (`__enter__`/`__exit__`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in DB transactions systems.

```python
class Tx:
    def __enter__(self):
        print("begin")

    def __exit__(self, exc_type, exc, tb):
        print("end", exc_type is None)


with Tx():
    print("work")
```

**Key Points**
- `__exit__` receives exception info; suppress by returning True
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.9 `contextlib.contextmanager`

<a id="1189-contextmanager-decorator"></a>

**Beginner Level**: In real-world temp files workflows, `contextlib.contextmanager` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in temp files contexts combine solid practice around `contextlib.contextmanager` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `contextlib.contextmanager` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in temp files systems.

```python
from contextlib import contextmanager


@contextmanager
def temp_state():
    print("setup")
    yield
    print("teardown")


with temp_state():
    print("mid")
```

**Key Points**
- Generator-based context managers
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.10 Iteration Protocol (`__iter__`/`__next__`)

<a id="11810-dunder-iter"></a>

**Beginner Level**: In real-world paged API workflows, Iteration Protocol (`__iter__`/`__next__`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in paged API contexts combine solid practice around iteration protocol (`__iter__`/`__next__`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to iteration protocol (`__iter__`/`__next__`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in paged API systems.

```python
class Pages:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        self.i += 1
        return self.i


print(list(Pages(3)))
```

**Key Points**
- Supports `for` loops over custom collections
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.8.11 Rich Comparisons (`__eq__`, …)

<a id="11811-rich-comparison"></a>

**Beginner Level**: In real-world sortable products workflows, Rich Comparisons (`__eq__`, …) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in sortable products contexts combine solid practice around rich comparisons (`__eq__`, …) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to rich comparisons (`__eq__`, …) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in sortable products systems.

```python
class Product:
    def __init__(self, price):
        self.price = price

    def __eq__(self, other):
        return self.price == other.price


print(Product(1) == Product(1))
```

**Key Points**
- Define `__hash__` if `__eq__` and used in sets/dicts
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.9 Class and Static Methods

<a id="119-class-and-static-methods"></a>

### 11.9.1 `@classmethod`

<a id="1191-classmethod-decorator"></a>

**Beginner Level**: In real-world alternate constructors workflows, `@classmethod` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in alternate constructors contexts combine solid practice around `@classmethod` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `@classmethod` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in alternate constructors systems.

```python
class Order:
    def __init__(self, oid):
        self.oid = oid

    @classmethod
    def from_str(cls, s):
        return cls(int(s.split("-")[1]))


print(Order.from_str("o-5").oid)
```

**Key Points**
- Receives class as first arg (`cls`)
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.9.2 The `cls` Parameter

<a id="1192-cls-parameter"></a>

**Beginner Level**: In real-world factory registries workflows, The `cls` Parameter connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in factory registries contexts combine solid practice around the `cls` parameter with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `cls` parameter affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in factory registries systems.

```python
class Widget:
    registry = {}

    @classmethod
    def register(cls, name):
        cls.registry[name] = cls
```

**Key Points**
- Use `cls` for polymorphic construction
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.9.3 `@staticmethod`

<a id="1193-staticmethod-decorator"></a>

**Beginner Level**: In real-world pure helpers on class workflows, `@staticmethod` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in pure helpers on class contexts combine solid practice around `@staticmethod` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `@staticmethod` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in pure helpers on class systems.

```python
class MathUtil:
    @staticmethod
    def clamp(x, lo, hi):
        return max(lo, min(hi, x))


print(MathUtil.clamp(5, 0, 1))
```

**Key Points**
- No `self`/`cls`—namespacing only
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.9.4 When to Use Instance, Class, and Static Methods

<a id="1194-when-to-use-each"></a>

**Beginner Level**: In real-world service layer workflows, When to Use Instance, Class, and Static Methods connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in service layer contexts combine solid practice around when to use instance, class, and static methods with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to when to use instance, class, and static methods affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in service layer systems.

```python
class Service:
    def instance_m(self):
        return "i"

    @classmethod
    def class_m(cls):
        return "c"

    @staticmethod
    def static_m():
        return "s"
```

**Key Points**
- Instance: needs state; classmethod: alternate ctor/factory; static: namespaced util
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.9.5 Combining Method Types

<a id="1195-combining-method-types"></a>

**Beginner Level**: In real-world payments facade workflows, Combining Method Types connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments facade contexts combine solid practice around combining method types with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to combining method types affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments facade systems.

```python
class Facade:
    def __init__(self, api):
        self.api = api

    def pay(self, amt):
        return self.api.charge(amt)

    @classmethod
    def sandbox(cls):
        return cls(api=type("A", (), {"charge": staticmethod(lambda a: "ok")})())

    @staticmethod
    def validate(amt):
        return amt > 0
```

**Key Points**
- Keep responsibilities clear—avoid static for stateful ops
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10 Abstract Base Classes

<a id="1110-abstract-base-classes"></a>

### 11.10.1 Defining Abstract Base Classes

<a id="11101-defining-abc"></a>

**Beginner Level**: In real-world plugin host workflows, Defining Abstract Base Classes connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in plugin host contexts combine solid practice around defining abstract base classes with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to defining abstract base classes affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in plugin host systems.

```python
from abc import ABC, abstractmethod


class Parser(ABC):
    @abstractmethod
    def parse(self, data):
        pass
```

**Key Points**
- Cannot instantiate until abstract methods implemented
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10.2 `@abstractmethod`

<a id="11102-abstractmethod-decorator"></a>

**Beginner Level**: In real-world contract enforcement workflows, `@abstractmethod` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in contract enforcement contexts combine solid practice around `@abstractmethod` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `@abstractmethod` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in contract enforcement systems.

```python
from abc import ABC, abstractmethod


class Repo(ABC):
    @abstractmethod
    def get(self, key):
        pass
```

**Key Points**
- Subclasses must override or stay abstract
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10.3 Subclassing ABCs

<a id="11103-subclassing-abc"></a>

**Beginner Level**: In real-world inventory persistence workflows, Subclassing ABCs connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory persistence contexts combine solid practice around subclassing abcs with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to subclassing abcs affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory persistence systems.

```python
from abc import ABC, abstractmethod


class Repo(ABC):
    @abstractmethod
    def save(self, obj):
        pass


class MemoryRepo(Repo):
    def save(self, obj):
        return True
```

**Key Points**
- ABC provides `register` virtual subclassing optionally
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10.4 Interface-like Patterns

<a id="11104-interface-like-patterns"></a>

**Beginner Level**: In real-world hexagonal architecture workflows, Interface-like Patterns connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in hexagonal architecture contexts combine solid practice around interface-like patterns with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to interface-like patterns affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in hexagonal architecture systems.

```python
from abc import ABC, abstractmethod


class ClockPort(ABC):
    @abstractmethod
    def now(self):
        pass
```

**Key Points**
- Ports and adapters map cleanly to ABCs
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10.5 Enforcing Contracts in Large Teams

<a id="11105-enforcing-contracts"></a>

**Beginner Level**: In real-world CI typing workflows, Enforcing Contracts in Large Teams connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in CI typing contexts combine solid practice around enforcing contracts in large teams with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to enforcing contracts in large teams affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in CI typing systems.

```python
from abc import ABC, abstractmethod


class PaymentGateway(ABC):
    @abstractmethod
    def capture(self, intent_id: str) -> bool:
        pass
```

**Key Points**
- Pair ABCs with mypy `Protocol` where structural typing helps
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10.6 Composition vs Inheritance Trade-offs

<a id="11106-composition-vs-inheritance"></a>

**Beginner Level**: In real-world e-commerce workflows, Composition vs Inheritance Trade-offs connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce contexts combine solid practice around composition vs inheritance trade-offs with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to composition vs inheritance trade-offs affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce systems.

```python
class Notifier:
    def send(self, msg):
        return msg


class OrderService:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier

    def placed(self):
        return self.notifier.send("placed")
```

**Key Points**
- Favor composition for volatile integrations
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10.7 `dataclasses` for Concise Models

<a id="11107-dataclass-overview"></a>

**Beginner Level**: In real-world catalog workflows, `dataclasses` for Concise Models connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in catalog contexts combine solid practice around `dataclasses` for concise models with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `dataclasses` for concise models affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in catalog systems.

```python
from dataclasses import dataclass


@dataclass
class Item:
    sku: str
    price: float


print(Item("x", 1.0))
```

**Key Points**
- Boilerplate reduction; still real classes
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.10.8 `__slots__` for Memory Control

<a id="11108-slots-overview"></a>

**Beginner Level**: In real-world high-volume events workflows, `__slots__` for Memory Control connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in high-volume events contexts combine solid practice around `__slots__` for memory control with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__slots__` for memory control affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in high-volume events systems.

```python
class Event:
    __slots__ = ("ts", "kind")

    def __init__(self, ts, kind):
        self.ts = ts
        self.kind = kind
```

**Key Points**
- Restricts attributes; saves memory
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.11 Protocols and Memory Patterns

<a id="1111-protocols-and-memory-patterns"></a>

### 11.11.1 `typing.Protocol` (Structural Subtyping)

<a id="11111-typing-protocol"></a>

**Beginner Level**: In real-world payment adapters workflows, `typing.Protocol` (Structural Subtyping) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payment adapters contexts combine solid practice around `typing.protocol` (structural subtyping) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `typing.protocol` (structural subtyping) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payment adapters systems.

```python
from typing import Protocol


class Authorizer(Protocol):
    def authorize(self, cents: int) -> bool: ...


class StripeLike:
    def authorize(self, cents: int) -> bool:
        return cents > 0


def charge(gateway: Authorizer):
    return gateway.authorize(100)


print(charge(StripeLike()))
```

**Key Points**
- Protocols document duck-typed interfaces for type checkers
- No runtime enforcement unless combined with checks
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.11.2 `__hash__` with `__eq__`

<a id="11112-hash-and-eq"></a>

**Beginner Level**: In real-world deduplicated SKUs workflows, `__hash__` with `__eq__` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in deduplicated SKUs contexts combine solid practice around `__hash__` with `__eq__` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__hash__` with `__eq__` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in deduplicated SKUs systems.

```python
class SKU:
    def __init__(self, code):
        self.code = code

    def __eq__(self, other):
        return isinstance(other, SKU) and self.code == other.code

    def __hash__(self):
        return hash(self.code)


print(len({SKU("a"), SKU("a")}))
```

**Key Points**
- If you define `__eq__` without `__hash__`, hashability may be cleared
- Sets and dict keys need stable hashing
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.11.3 `__bool__` for Truthiness

<a id="11113-dunder-bool"></a>

**Beginner Level**: In real-world empty cart workflows, `__bool__` for Truthiness connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in empty cart contexts combine solid practice around `__bool__` for truthiness with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__bool__` for truthiness affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in empty cart systems.

```python
class Cart:
    def __init__(self, lines):
        self.lines = lines

    def __bool__(self):
        return bool(self.lines)


print(bool(Cart([])), bool(Cart([1])))
```

**Key Points**
- Controls `if obj:` without relying only on `__len__`
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.11.4 Copy vs Deep Copy for Models

<a id="11114-copy-patterns"></a>

**Beginner Level**: In real-world HR records workflows, Copy vs Deep Copy for Models connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in HR records contexts combine solid practice around copy vs deep copy for models with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to copy vs deep copy for models affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in HR records systems.

```python
import copy


class Dept:
    def __init__(self, name):
        self.name = name


class Employee:
    def __init__(self, name, dept):
        self.name = name
        self.dept = dept


e = Employee("Bo", Dept("Eng"))
shallow = copy.copy(e)
deep = copy.deepcopy(e)
shallow.dept.name = "Sales"
print(e.dept.name, deep.dept.name)
```

**Key Points**
- `copy` duplicates top-level; nested objects may still alias
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.

### 11.11.5 `__slots__` Instances and Attribute Layout

<a id="11115-object-slots-interaction"></a>

**Beginner Level**: In real-world high-throughput events workflows, `__slots__` Instances and Attribute Layout connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in high-throughput events contexts combine solid practice around `__slots__` instances and attribute layout with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `__slots__` instances and attribute layout affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in high-throughput events systems.

```python
class Tag:
    __slots__ = ("name",)

    def __init__(self, name):
        self.name = name


t = Tag("sale")
print(t.name)
```

**Key Points**
- `__slots__` instances omit per-instance `__dict__` by default
- Still inherit from `object` implicitly
- Align names with ubiquitous language from the domain.
- Favor small methods over giant classes.
- Compose services instead of god objects.


---

## Worked example: e-commerce `Order` aggregate (DDD-style sketch)

**Beginner Level**: An `Order` holds lines and can compute a simple total.

**Intermediate Level**: Encapsulate invariants (no negative quantities) and expose methods instead of raw lists.

**Expert Level**: Emit domain events (`OrderPlaced`) for inventory and payment sagas; keep persistence mappers outside the entity.

```python
from dataclasses import dataclass, field
from typing import List


@dataclass
class Line:
    sku: str
    qty: int
    unit_price: float

    def __post_init__(self):
        if self.qty <= 0:
            raise ValueError("qty must be positive")


class Order:
    def __init__(self, order_id: str):
        self.id = order_id
        self._lines: List[Line] = []

    def add_line(self, line: Line) -> None:
        self._lines.append(line)

    def subtotal(self) -> float:
        return sum(l.qty * l.unit_price for l in self._lines)


o = Order("o-1")
o.add_line(Line("SKU-1", 2, 9.99))
print(o.subtotal())
```

**Key Points**
- Entities enforce business rules; adapters handle I/O.
- `dataclass` reduces boilerplate but does not replace design discipline.

---

## Worked example: cooperative payment instruments with `abc`

**Beginner Level**: Define a `Payment` base class with a `charge` method.

**Intermediate Level**: Use `abc.ABC` + `@abstractmethod` so gateways must implement `refund`.

**Expert Level**: Version interfaces per API generation; provide fake implementations for contract tests.

```python
from abc import ABC, abstractmethod


class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, cents: int) -> str:
        pass

    @abstractmethod
    def refund(self, txn_id: str) -> bool:
        pass


class FakeGateway(PaymentGateway):
    def charge(self, cents: int) -> str:
        return "ch_123"

    def refund(self, txn_id: str) -> bool:
        return True


print(FakeGateway().charge(50))
```

**Key Points**
- Tests swap `FakeGateway` without touching production wiring.
- Keep ABCs narrow—fat interfaces are hard to mock.

---

## Best Practices

- Prefer composition for volatile integrations; inheritance for true is-a relationships.
- Keep `__repr__` truthful; rely on `@property` instead of Java-style getters when possible.
- Use ABCs or `typing.Protocol` to document expectations for plugin authors.
- Align class boundaries with team ownership (bounded contexts).

---

## Common Mistakes to Avoid

- Subclassing concrete classes just to reuse code—leads to fragile hierarchies.
- Mutable class variables holding shared lists/dicts.
- Operator overloading that surprises readers (`+` meaning unrelated things).
