
# Functions in Python

Functions package behavior behind a name—whether you price cart items, validate KYC data, or compute payroll. This file walks from first `def` through recursion and higher-order patterns used in real backends.

## 📑 Table of Contents

- [10.1 Basics](#101-basics)
  - [10.1.1 Defining Functions](#1011-defining-functions)
  - [10.1.2 Function Calls](#1012-function-calls)
  - [10.1.3 Parameters (Overview)](#1013-parameters-overview)
  - [10.1.4 Positional Arguments](#1014-positional-arguments)
  - [10.1.5 Keyword Arguments](#1015-keyword-arguments)
  - [10.1.6 Return Values](#1016-return-values)
  - [10.1.7 Multiple Return Values](#1017-multiple-return-values)
  - [10.1.8 Returning `None` and Bare `return`](#1018-returning-none-and-bare-return)
  - [10.1.9 Docstrings at a Glance](#1019-docstrings-at-a-glance)
- [10.2 Parameters (Advanced)](#102-parameters-advanced)
  - [10.2.1 Default Parameters](#1021-default-parameters)
  - [10.2.2 Arbitrary Positional `*args`](#1022-arbitrary-positional-args)
  - [10.2.3 Arbitrary Keyword `**kwargs`](#1023-arbitrary-keyword-kwargs)
  - [10.2.4 Combining Parameter Forms](#1024-combining-parameter-forms)
  - [10.2.5 Keyword-only Parameters](#1025-keyword-only-parameters)
  - [10.2.6 Positional-only Parameters](#1026-positional-only-parameters)
  - [10.2.7 Unpacking at Call Time](#1027-unpacking-at-call-time)
  - [10.2.8 Mutable Defaults: Pitfalls](#1028-mutable-defaults-pitfalls)
- [10.3 Scope](#103-scope)
  - [10.3.1 Local Scope](#1031-local-scope)
  - [10.3.2 Global Scope](#1032-global-scope)
  - [10.3.3 The `global` Keyword](#1033-the-global-keyword)
  - [10.3.4 The `nonlocal` Keyword](#1034-the-nonlocal-keyword)
  - [10.3.5 Enclosing Scope](#1035-enclosing-scope)
  - [10.3.6 LEGB Rule](#1036-legb-rule)
  - [10.3.7 Closures and Free Variables](#1037-closures-and-free-variables-preview)
- [10.4 Advanced Function Topics](#104-advanced-function-topics)
  - [10.4.1 Closures](#1041-closures)
  - [10.4.2 Nested Functions](#1042-nested-functions)
  - [10.4.3 Functions as Objects](#1043-functions-as-objects)
  - [10.4.4 Function Annotations](#1044-function-annotations)
  - [10.4.5 Type Hints](#1045-type-hints)
  - [10.4.6 Docstrings](#1046-docstrings)
  - [10.4.7 Callable Objects and `__call__`](#1047-callable-objects-and-__call__)
- [10.5 Lambda Expressions](#105-lambda-expressions)
  - [10.5.1 Lambda Syntax](#1051-lambda-syntax)
  - [10.5.2 Lambda vs Regular Functions](#1052-lambda-vs-regular-functions)
  - [10.5.3 Lambda with `map`](#1053-lambda-with-map)
  - [10.5.4 Lambda with `filter`](#1054-lambda-with-filter)
  - [10.5.5 Lambda with `sorted`](#1055-lambda-with-sorted)
  - [10.5.6 When to Use Lambdas](#1056-when-to-use-lambdas)
- [10.6 Higher-Order Functions](#106-higher-order-functions)
  - [10.6.1 Accepting Functions](#1061-accepting-functions)
  - [10.6.2 Returning Functions](#1062-returning-functions)
  - [10.6.3 `map`](#1063-map)
  - [10.6.4 `filter`](#1064-filter)
  - [10.6.5 `functools.reduce`](#1065-functoolsreduce)
  - [10.6.6 Function Composition](#1066-function-composition)
  - [10.6.7 Partial Application (`functools.partial`)](#1067-partial-application-functoolspartial)
- [10.7 Recursion](#107-recursion)
  - [10.7.1 Recursion Basics](#1071-recursion-basics)
  - [10.7.2 Base Case and Recursive Case](#1072-base-case-and-recursive-case)
  - [10.7.3 Call Stack and Recursion Depth](#1073-call-stack-and-recursion-depth)
  - [10.7.4 Tail Recursion Considerations](#1074-tail-recursion-considerations)
  - [10.7.5 Recursion Depth Limit](#1075-recursion-depth-limit)
  - [10.7.6 Memoization](#1076-memoization)

---

## 10.1 Basics

<a id="101-basics"></a>

### 10.1.1 Defining Functions

<a id="1011-defining-functions"></a>

**Beginner Level**: In real-world e-commerce workflows, Defining Functions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce contexts combine solid practice around defining functions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to defining functions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce systems.

```python
def calculate_subtotal(unit_price: float, qty: int) -> float:
    return unit_price * qty


print(calculate_subtotal(19.99, 2))
```

**Key Points**
- `def name(parameters):` introduces a function object at runtime.
- Parameters are local names; arguments supply values at call time.
- Type hints are optional metadata (Python remains dynamic).

### 10.1.2 Function Calls

<a id="1012-function-calls"></a>

**Beginner Level**: In real-world bank workflows, Function Calls connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bank contexts combine solid practice around function calls with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to function calls affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bank systems.

```python
def apply_fee(amount, fee_pct):
    return amount * (1 + fee_pct)


principal = 1000.0
total = apply_fee(principal, 0.02)
print(round(total, 2))
```

**Key Points**
- Calls evaluate arguments before entering the function.
- The function’s return value replaces the call expression.

### 10.1.3 Parameters (Overview)

<a id="1013-parameters-overview"></a>

**Beginner Level**: In real-world employee management workflows, Parameters (Overview) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in employee management contexts combine solid practice around parameters (overview) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to parameters (overview) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in employee management systems.

```python
def onboard_employee(name, department, salary):
    return {"name": name, "department": department, "salary": salary}


print(onboard_employee("Lee", "Engineering", 120000))
```

**Key Points**
- Parameters define the function’s public calling contract.
- Names should read like a mini API for humans and linters.

### 10.1.4 Positional Arguments

<a id="1014-positional-arguments"></a>

**Beginner Level**: In real-world library system workflows, Positional Arguments connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in library system contexts combine solid practice around positional arguments with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to positional arguments affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in library system systems.

```python
def checkout_book(member_id, book_id, days):
    return {"member": member_id, "book": book_id, "due_in": days}


print(checkout_book(42, 9001, 14))
```

**Key Points**
- Order matters: first arg maps to first parameter.
- Ideal for short, obvious parameter lists.

### 10.1.5 Keyword Arguments

<a id="1015-keyword-arguments"></a>

**Beginner Level**: In real-world inventory workflows, Keyword Arguments connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory contexts combine solid practice around keyword arguments with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to keyword arguments affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory systems.

```python
def adjust_stock(sku, delta, reason="manual"):
    return {"sku": sku, "delta": delta, "reason": reason}


print(adjust_stock("SKU-12", -3, reason="damaged"))
print(adjust_stock(delta=5, sku="SKU-12"))
```

**Key Points**
- Keyword args improve readability for boolean flags and numeric literals.
- Can appear after positional args at call sites.

### 10.1.6 Return Values

<a id="1016-return-values"></a>

**Beginner Level**: In real-world payments workflows, Return Values connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments contexts combine solid practice around return values with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to return values affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments systems.

```python
def authorize(amount, limit):
    if amount <= limit:
        return "approved"
    return "declined"


print(authorize(40, 100))
```

**Key Points**
- `return` exits immediately with a value (or `None`).
- Multiple exit points are fine when they simplify validation.

### 10.1.7 Multiple Return Values

<a id="1017-multiple-return-values"></a>

**Beginner Level**: In real-world e-commerce workflows, Multiple Return Values connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce contexts combine solid practice around multiple return values with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to multiple return values affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce systems.

```python
def split_total(total, tax_rate):
    tax = round(total * tax_rate, 2)
    net = round(total - tax, 2)
    return net, tax


net, tax = split_total(120.0, 0.08)
print(net, tax)
```

**Key Points**
- Tuples are the usual underlying type for multi-return.
- Unpacking keeps call sites explicit and readable.

### 10.1.8 Returning `None` and Bare `return`

<a id="1018-returning-none-and-bare-return"></a>

**Beginner Level**: In real-world HR payroll workflows, Returning `None` and Bare `return` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in HR payroll contexts combine solid practice around returning `none` and bare `return` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to returning `none` and bare `return` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in HR payroll systems.

```python
def log_bonus(employee_id, amount):
    if amount <= 0:
        return
    print("bonus", employee_id, amount)


log_bonus(7, 0)
log_bonus(7, 500)
```

**Key Points**
- Functions without `return` implicitly return `None`.
- Bare `return` is idiomatic for early exit in void-style functions.

### 10.1.9 Docstrings at a Glance

<a id="1019-docstrings-at-a-glance"></a>

**Beginner Level**: In real-world API services workflows, Docstrings at a Glance connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in API services contexts combine solid practice around docstrings at a glance with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to docstrings at a glance affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in API services systems.

```python
def create_invoice(customer_id: int) -> dict:
    """Create a draft invoice for a customer.

    Args:
        customer_id: Internal CRM identifier.

    Returns:
        A dict with invoice metadata.
    """
    return {"customer_id": customer_id, "status": "draft"}


print(create_invoice.__doc__[:40])
```

**Key Points**
- First string literal in a function body becomes its `__doc__`.
- Tools like Sphinx consume structured docstrings.


## 10.2 Parameters (Advanced)

<a id="102-parameters-advanced"></a>

### 10.2.1 Default Parameters

<a id="1021-default-parameters"></a>

**Beginner Level**: In real-world subscription billing workflows, Default Parameters connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in subscription billing contexts combine solid practice around default parameters with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to default parameters affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in subscription billing systems.

```python
def renew(plan, auto_renew=True):
    return {"plan": plan, "auto_renew": auto_renew}


print(renew("pro"))
print(renew("basic", False))
```

**Key Points**
- Defaults are evaluated once at function definition time.
- Non-default parameters must precede defaulted ones.

### 10.2.2 Arbitrary Positional `*args`

<a id="1022-arbitrary-positional-args"></a>

**Beginner Level**: In real-world shopping cart workflows, Arbitrary Positional `*args` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in shopping cart contexts combine solid practice around arbitrary positional `*args` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to arbitrary positional `*args` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in shopping cart systems.

```python
def line_total(*prices):
    return sum(prices)


print(line_total(10, 20, 5.5))
```

**Key Points**
- `*args` collects extra positional args into a tuple.
- Name `args` is convention only.

### 10.2.3 Arbitrary Keyword `**kwargs`

<a id="1023-arbitrary-keyword-kwargs"></a>

**Beginner Level**: In real-world CRM workflows, Arbitrary Keyword `**kwargs` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in CRM contexts combine solid practice around arbitrary keyword `**kwargs` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to arbitrary keyword `**kwargs` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in CRM systems.

```python
def merge_profile(base, **updates):
    out = dict(base)
    out.update(updates)
    return out


user = {"name": "Ava", "tier": "gold"}
print(merge_profile(user, phone="+1...", loyalty_pts=1200))
```

**Key Points**
- `**kwargs` collects keyword args into a dict.
- Useful for forwarding to other functions.

### 10.2.4 Combining Parameter Forms

<a id="1024-combining-parameter-forms"></a>

**Beginner Level**: In real-world logistics workflows, Combining Parameter Forms connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in logistics contexts combine solid practice around combining parameter forms with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to combining parameter forms affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in logistics systems.

```python
def ship(order_id, carrier, *extras, priority=False, **meta):
    return {
        "order_id": order_id,
        "carrier": carrier,
        "extras": extras,
        "priority": priority,
        "meta": meta,
    }


print(ship(55, "ACME", "fragile", "signature", priority=True, region="EU"))
```

**Key Points**
- Order: positional-only (if any), normal, *args, keyword-only, **kwargs.
- Complex signatures deserve documentation and tests.

### 10.2.5 Keyword-only Parameters

<a id="1025-keyword-only-parameters"></a>

**Beginner Level**: In real-world bank transfers workflows, Keyword-only Parameters connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bank transfers contexts combine solid practice around keyword-only parameters with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to keyword-only parameters affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bank transfers systems.

```python
def wire_transfer(*, amount, currency, beneficiary):
    return {"amount": amount, "currency": currency, "to": beneficiary}


print(wire_transfer(amount=250, currency="USD", beneficiary="ACCT-9"))
```

**Key Points**
- A bare `*` forces following parameters to be keyword-only.
- Prevents accidental argument swaps with similar numeric types.

### 10.2.6 Positional-only Parameters

<a id="1026-positional-only-parameters"></a>

**Beginner Level**: In real-world payments API workflows, Positional-only Parameters connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments API contexts combine solid practice around positional-only parameters with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to positional-only parameters affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments API systems.

```python
def round_money(amount, ndigits, /):
    return round(amount, ndigits)


print(round_money(19.995, 2))
```

**Key Points**
- `/` marks parameters that cannot be passed by keyword (3.8+).
- Useful for C-extension shaped APIs and fast paths.

### 10.2.7 Unpacking at Call Time

<a id="1027-unpacking-at-call-time"></a>

**Beginner Level**: In real-world warehouse workflows, Unpacking at Call Time connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in warehouse contexts combine solid practice around unpacking at call time with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to unpacking at call time affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in warehouse systems.

```python
def pick(zone, aisle, bin_code):
    return f"{zone}-{aisle}-{bin_code}"


loc = ("W", 3, 12)
print(pick(*loc))
extra = {"aisle": 4, "bin_code": 7, "zone": "E"}
print(pick(**{k: extra[k] for k in ("zone", "aisle", "bin_code")}))
```

**Key Points**
- `*iterable` splats positional; `**dict` splats keywords.
- Great for adapting tuples/rows into function calls.

### 10.2.8 Mutable Defaults: Pitfalls

<a id="1028-mutable-defaults-pitfalls"></a>

**Beginner Level**: In real-world e-commerce carts workflows, Mutable Defaults: Pitfalls connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce carts contexts combine solid practice around mutable defaults: pitfalls with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to mutable defaults: pitfalls affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce carts systems.

```python
def bad_append(item, bucket=[]):  # noqa: dangerous-default
    bucket.append(item)
    return bucket


def good_append(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket


print(good_append("A"))
print(good_append("B"))
```

**Key Points**
- Never use mutable literals as defaults; shared state surprises teams.
- Use `None` and allocate inside the function.


## 10.3 Scope

<a id="103-scope"></a>

### 10.3.1 Local Scope

<a id="1031-local-scope"></a>

**Beginner Level**: In real-world POS terminal workflows, Local Scope connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in POS terminal contexts combine solid practice around local scope with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to local scope affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in POS terminal systems.

```python
def sale_total():
    tax = 0.07
    subtotal = 50
    return subtotal * (1 + tax)


print(sale_total())
```

**Key Points**
- Assignments inside a function create locals unless declared otherwise.
- Locals disappear when the function returns.

### 10.3.2 Global Scope

<a id="1032-global-scope"></a>

**Beginner Level**: In real-world feature flags workflows, Global Scope connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in feature flags contexts combine solid practice around global scope with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to global scope affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in feature flags systems.

```python
FEATURE_X = False


def is_enabled():
    return FEATURE_X


print(is_enabled())
```

**Key Points**
- Module-level names are global to the module.
- Importing modules creates singleton global state.

### 10.3.3 The `global` Keyword

<a id="1033-the-global-keyword"></a>

**Beginner Level**: In real-world in-store kiosk workflows, The `global` Keyword connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in in-store kiosk contexts combine solid practice around the `global` keyword with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `global` keyword affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in in-store kiosk systems.

```python
session_count = 0


def next_ticket():
    global session_count
    session_count += 1
    return session_count


print(next_ticket(), next_ticket())
```

**Key Points**
- `global` binds a name to the module scope.
- Prefer classes or explicit dependency injection for complex state.

### 10.3.4 The `nonlocal` Keyword

<a id="1034-the-nonlocal-keyword"></a>

**Beginner Level**: In real-world rate limiter workflows, The `nonlocal` Keyword connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in rate limiter contexts combine solid practice around the `nonlocal` keyword with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `nonlocal` keyword affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in rate limiter systems.

```python
def make_limiter(limit):
    count = 0

    def allow():
        nonlocal count
        if count >= limit:
            return False
        count += 1
        return True

    return allow


gate = make_limiter(2)
print(gate(), gate(), gate())
```

**Key Points**
- `nonlocal` updates enclosing (non-global) bindings.
- Essential for closure-based counters and decorators.

### 10.3.5 Enclosing Scope

<a id="1035-enclosing-scope"></a>

**Beginner Level**: In real-world multi-tenant SaaS workflows, Enclosing Scope connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in multi-tenant SaaS contexts combine solid practice around enclosing scope with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to enclosing scope affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in multi-tenant SaaS systems.

```python
tenant = "acme"

def build_url(path):
    def full():
        return f"https://{tenant}.app{path}"

    return full


print(build_url("/dash")())
```

**Key Points**
- Nested functions see outer assignments unless shadowed.
- Read-only access does not need `nonlocal`/`global`.

### 10.3.6 LEGB Rule

<a id="1036-legb-rule"></a>

**Beginner Level**: In real-world microservices config workflows, LEGB Rule connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in microservices config contexts combine solid practice around legb rule with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to legb rule affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in microservices config systems.

```python
x = "module"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        return x

    return inner


print(outer()())
```

**Key Points**
- Resolution order: Local, Enclosing, Global, Builtins.
- Name errors mean no binding found in any scope.

### 10.3.7 Closures and Free Variables (Preview)

<a id="1037-closures-and-free-variables-preview"></a>

**Beginner Level**: In real-world pricing engine workflows, Closures and Free Variables (Preview) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in pricing engine contexts combine solid practice around closures and free variables (preview) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to closures and free variables (preview) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in pricing engine systems.

```python
def taxer(rate):
    def apply(amount):
        return round(amount * (1 + rate), 2)

    return apply


us = taxer(0.08)
print(us(100))
```

**Key Points**
- Inner functions that capture outer variables are closures.
- Detailed closure semantics appear in §10.4.1.


## 10.4 Advanced Function Topics

<a id="104-advanced-function-topics"></a>

### 10.4.1 Closures

<a id="1041-closures"></a>

**Beginner Level**: In real-world loyalty program workflows, Closures connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in loyalty program contexts combine solid practice around closures with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to closures affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in loyalty program systems.

```python
def tier_multiplier(tier):
    table = {"bronze": 1.0, "silver": 1.1, "gold": 1.25}

    def points_for(spend):
        return spend * table[tier]

    return points_for


gold = tier_multiplier("gold")
print(gold(200))
```

**Key Points**
- Closures keep outer values alive beyond the outer call.
- Watch mutable outer variables shared across calls.

### 10.4.2 Nested Functions

<a id="1042-nested-functions"></a>

**Beginner Level**: In real-world payroll workflows, Nested Functions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payroll contexts combine solid practice around nested functions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to nested functions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payroll systems.

```python
def payslip(gross):
    def taxes():
        return gross * 0.2

    net = gross - taxes()
    return {"gross": gross, "net": net}


print(payslip(5000))
```

**Key Points**
- Nested defs aid encapsulation of helpers.
- Too much nesting suggests extracting a module-level function.

### 10.4.3 Functions as Objects

<a id="1043-functions-as-objects"></a>

**Beginner Level**: In real-world plugin architecture workflows, Functions as Objects connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in plugin architecture contexts combine solid practice around functions as objects with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to functions as objects affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in plugin architecture systems.

```python
def noop(x):
    return x


handlers = {"double": lambda x: x * 2, "noop": noop}
print(handlers["double"](5))
```

**Key Points**
- Functions have attributes like `__name__` and `__doc__`.
- They can be stored in dicts and passed like data.

### 10.4.4 Function Annotations

<a id="1044-function-annotations"></a>

**Beginner Level**: In real-world REST adapters workflows, Function Annotations connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in REST adapters contexts combine solid practice around function annotations with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to function annotations affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in REST adapters systems.

```python
def fetch_customer(customer_id: int) -> dict:
    return {"id": customer_id}


print(fetch_customer.__annotations__)
```

**Key Points**
- Annotations are expressions attached to parameters and returns.
- Runtime ignores them unless libraries read them.

### 10.4.5 Type Hints

<a id="1045-type-hints"></a>

**Beginner Level**: In real-world inventory service workflows, Type Hints connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory service contexts combine solid practice around type hints with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to type hints affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory service systems.

```python
from typing import List, Optional


def reorder(skus: List[str], min_qty: int) -> Optional[str]:
    if not skus:
        return None
    return f"PO for {len(skus)} lines >= {min_qty}"


print(reorder(["A", "B"], 10))
```

**Key Points**
- Combine hints with mypy/pyright in CI for safer refactors.
- Use `Optional`, `Union`, `TypedDict` as domains grow.

### 10.4.6 Docstrings

<a id="1046-docstrings"></a>

**Beginner Level**: In real-world internal SDK workflows, Docstrings connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in internal SDK contexts combine solid practice around docstrings with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to docstrings affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in internal SDK systems.

```python
def transfer(from_acct: str, to_acct: str, amount_cents: int) -> bool:
    """Move funds between accounts.

    Raises:
        ValueError: If amount_cents <= 0.
    """
    if amount_cents <= 0:
        raise ValueError("amount must be positive")
    return True


print(transfer.__doc__.splitlines()[0])
```

**Key Points**
- Docstrings power help() and documentation pipelines.
- Keep them synchronized with behavior—drift erodes trust.

### 10.4.7 Callable Objects and `__call__`

<a id="1047-callable-objects-and-__call__"></a>

**Beginner Level**: In real-world pricing rules workflows, Callable Objects and `__call__` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in pricing rules contexts combine solid practice around callable objects and `__call__` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to callable objects and `__call__` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in pricing rules systems.

```python
class Fee:
    def __init__(self, pct):
        self.pct = pct

    def __call__(self, amount):
        return amount * (1 + self.pct)


fee = Fee(0.03)
print(fee(100))
```

**Key Points**
- Instances with `__call__` behave like functions.
- Useful for parameterized callable strategies.


## 10.5 Lambda Expressions

<a id="105-lambda-expressions"></a>

### 10.5.1 Lambda Syntax

<a id="1051-lambda-syntax"></a>

**Beginner Level**: In real-world sorting customer rows workflows, Lambda Syntax connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in sorting customer rows contexts combine solid practice around lambda syntax with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to lambda syntax affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in sorting customer rows systems.

```python
key_fn = lambda row: row["last_order_days"]
customers = [
    {"name": "Bo", "last_order_days": 5},
    {"name": "Cy", "last_order_days": 1},
]
print(sorted(customers, key=key_fn)[0]["name"])
```

**Key Points**
- `lambda args: expr` creates an anonymous function object.
- Body must be a single expression.

### 10.5.2 Lambda vs Regular Functions

<a id="1052-lambda-vs-regular-functions"></a>

**Beginner Level**: In real-world ETL workflows, Lambda vs Regular Functions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in ETL contexts combine solid practice around lambda vs regular functions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to lambda vs regular functions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in ETL systems.

```python
normalize = lambda s: s.strip().lower()


def normalize_verbose(s: str) -> str:
    return s.strip().lower()


print(normalize("  Hi "), normalize_verbose("  Hi "))
```

**Key Points**
- Lambdas lack statements and a real name for stack traces.
- Prefer `def` when logic spans multiple lines or needs a docstring.

### 10.5.3 Lambda with `map`

<a id="1053-lambda-with-map"></a>

**Beginner Level**: In real-world SKU pricing workflows, Lambda with `map` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in SKU pricing contexts combine solid practice around lambda with `map` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to lambda with `map` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in SKU pricing systems.

```python
costs = [10, 20, 15]
retail = list(map(lambda c: round(c * 1.3, 2), costs))
print(retail)
```

**Key Points**
- `map` is lazy in Python 3; often list comprehensions read clearer.
- Keep lambdas tiny inside `map`.

### 10.5.4 Lambda with `filter`

<a id="1054-lambda-with-filter"></a>

**Beginner Level**: In real-world fraud monitoring workflows, Lambda with `filter` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in fraud monitoring contexts combine solid practice around lambda with `filter` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to lambda with `filter` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in fraud monitoring systems.

```python
amounts = [20, 900, 45, 1200]
big = list(filter(lambda x: x >= 500, amounts))
print(big)
```

**Key Points**
- `filter` keeps items where the predicate is truthy.
- Consider generator expressions for composability.

### 10.5.5 Lambda with `sorted`

<a id="1055-lambda-with-sorted"></a>

**Beginner Level**: In real-world library holds queue workflows, Lambda with `sorted` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in library holds queue contexts combine solid practice around lambda with `sorted` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to lambda with `sorted` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in library holds queue systems.

```python
books = [
    {"title": "A", "holds": 3},
    {"title": "B", "holds": 1},
]
print(sorted(books, key=lambda b: b["holds"])[0]["title"])
```

**Key Points**
- `key` customizes ordering without mutating originals.
- Stable sort preserves relative order for ties.

### 10.5.6 When to Use Lambdas

<a id="1056-when-to-use-lambdas"></a>

**Beginner Level**: In real-world event UI callbacks workflows, When to Use Lambdas connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in event UI callbacks contexts combine solid practice around when to use lambdas with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to when to use lambdas affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in event UI callbacks systems.

```python
handlers = {"click": lambda: print("clicked")}
handlers["click"]()
```

**Key Points**
- Great for one-off comparators and functional helpers.
- Avoid when debugging would benefit from a named function.


## 10.6 Higher-Order Functions

<a id="106-higher-order-functions"></a>

### 10.6.1 Accepting Functions

<a id="1061-accepting-functions"></a>

**Beginner Level**: In real-world checkout validation workflows, Accepting Functions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in checkout validation contexts combine solid practice around accepting functions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to accepting functions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in checkout validation systems.

```python
def run_checks(amount, checks):
    for fn in checks:
        if not fn(amount):
            return False
    return True


print(run_checks(50, [lambda x: x > 0, lambda x: x < 1000]))
```

**Key Points**
- Higher-order functions take functions as parameters.
- Enables strategy injection without subclass explosion.

### 10.6.2 Returning Functions

<a id="1062-returning-functions"></a>

**Beginner Level**: In real-world tenant branding workflows, Returning Functions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in tenant branding contexts combine solid practice around returning functions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to returning functions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in tenant branding systems.

```python
def theme(primary):
    def badge(text):
        return f"[{primary}] {text}"

    return badge


acme = theme("ACME")
print(acme("invoice ready"))
```

**Key Points**
- Returning functions builds families of related behaviors.
- Common in factories and decorators.

### 10.6.3 `map`

<a id="1063-map"></a>

**Beginner Level**: In real-world FX conversion workflows, `map` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in FX conversion contexts combine solid practice around `map` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `map` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in FX conversion systems.

```python
usd = [10, 20]
eur = list(map(lambda x: round(x * 0.92, 2), usd))
print(eur)
```

**Key Points**
- `map(fn, iterable)` applies `fn` to each item.
- Often replaced by comprehensions for readability.

### 10.6.4 `filter`

<a id="1064-filter"></a>

**Beginner Level**: In real-world eligible promotions workflows, `filter` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in eligible promotions contexts combine solid practice around `filter` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `filter` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in eligible promotions systems.

```python
carts = [30, 5, 120]
qualified = list(filter(lambda total: total >= 25, carts))
print(qualified)
```

**Key Points**
- `filter(pred, iterable)` yields items where `pred` is true.
- Combine with `map` via generator pipelines.

### 10.6.5 `functools.reduce`

<a id="1065-functoolsreduce"></a>

**Beginner Level**: In real-world rolling balance workflows, `functools.reduce` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in rolling balance contexts combine solid practice around `functools.reduce` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `functools.reduce` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in rolling balance systems.

```python
from functools import reduce

deltas = [100, -20, -30, 50]
balance = reduce(lambda acc, x: acc + x, deltas, 0)
print(balance)
```

**Key Points**
- `reduce` folds an iterable to a single value.
- Prefer `sum`/`math.prod` when they fit—clearer intent.

### 10.6.6 Function Composition

<a id="1066-function-composition"></a>

**Beginner Level**: In real-world pricing pipeline workflows, Function Composition connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in pricing pipeline contexts combine solid practice around function composition with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to function composition affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in pricing pipeline systems.

```python
def compose(f, g):
    return lambda x: f(g(x))


tax = lambda x: x * 1.08
discount = lambda x: x * 0.9
price = compose(tax, discount)
print(round(price(100), 2))
```

**Key Points**
- Composition chains small pure steps.
- For readability, sometimes a plain sequential function wins.

### 10.6.7 Partial Application (`functools.partial`)

<a id="1067-partial-application-functoolspartial"></a>

**Beginner Level**: In real-world notification templates workflows, Partial Application (`functools.partial`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in notification templates contexts combine solid practice around partial application (`functools.partial`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to partial application (`functools.partial`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in notification templates systems.

```python
from functools import partial


def notify(channel, user, message):
    return {"channel": channel, "user": user, "message": message}


email_user = partial(notify, "email")
print(email_user(user="Bo", message="Shipped"))
```

**Key Points**
- `partial` fixes a subset of arguments ahead of time.
- Cleaner than `lambda` when wrapping callables.


## 10.7 Recursion

<a id="107-recursion"></a>

### 10.7.1 Recursion Basics

<a id="1071-recursion-basics"></a>

**Beginner Level**: In real-world org chart traversal workflows, Recursion Basics connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in org chart traversal contexts combine solid practice around recursion basics with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to recursion basics affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in org chart traversal systems.

```python
def count_nodes(node):
    if not node.get("children"):
        return 1
    return 1 + sum(count_nodes(c) for c in node["children"])


tree = {"name": "CEO", "children": [{"name": "VP", "children": []}]}
print(count_nodes(tree))
```

**Key Points**
- Recursion solves self-similar structures (trees, nested JSON).
- Each call should move toward a simpler subproblem.

### 10.7.2 Base Case and Recursive Case

<a id="1072-base-case-and-recursive-case"></a>

**Beginner Level**: In real-world loan amortization months workflows, Base Case and Recursive Case connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in loan amortization months contexts combine solid practice around base case and recursive case with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to base case and recursive case affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in loan amortization months systems.

```python
def months_to_payoff(balance, payment, rate_monthly, acc=0):
    if balance <= 0:
        return acc
    interest = balance * rate_monthly
    new_bal = balance + interest - payment
    return months_to_payoff(new_bal, payment, rate_monthly, acc + 1)


print(months_to_payoff(1000, 200, 0.0, 0))
```

**Key Points**
- Base case stops recursion; recursive case reduces the problem.
- Floating-point money needs decimal handling in real systems.

### 10.7.3 Call Stack and Recursion Depth

<a id="1073-call-stack-and-recursion-depth"></a>

**Beginner Level**: In real-world nested categories workflows, Call Stack and Recursion Depth connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in nested categories contexts combine solid practice around call stack and recursion depth with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to call stack and recursion depth affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in nested categories systems.

```python
def walk(cat, depth=0):
    print("  " * depth + cat["name"])
    for child in cat.get("sub", []):
        walk(child, depth + 1)


walk({"name": "Root", "sub": [{"name": "Leaf", "sub": []}]})
```

**Key Points**
- Each recursive call consumes stack frames.
- Deep trees may hit recursion limits—consider iterative DFS.

### 10.7.4 Tail Recursion Considerations

<a id="1074-tail-recursion-considerations"></a>

**Beginner Level**: In real-world compilers note workflows, Tail Recursion Considerations connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in compilers note contexts combine solid practice around tail recursion considerations with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to tail recursion considerations affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in compilers note systems.

```python
def factorial(n, acc=1):
    if n <= 1:
        return acc
    return factorial(n - 1, acc * n)


print(factorial(5))
```

**Key Points**
- CPython does not optimize tail recursion away.
- Use loops or `sys.setrecursionlimit` only with extreme care.

### 10.7.5 Recursion Depth Limit

<a id="1075-recursion-depth-limit"></a>

**Beginner Level**: In real-world safety guard workflows, Recursion Depth Limit connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in safety guard contexts combine solid practice around recursion depth limit with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to recursion depth limit affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in safety guard systems.

```python
import sys

print(sys.getrecursionlimit())
```

**Key Points**
- Default recursion limit protects the interpreter stack.
- Increase only when algorithm genuinely needs it and stack size allows.

### 10.7.6 Memoization

<a id="1076-memoization"></a>

**Beginner Level**: In real-world fee schedule lookup workflows, Memoization connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in fee schedule lookup contexts combine solid practice around memoization with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to memoization affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in fee schedule lookup systems.

```python
from functools import lru_cache


@lru_cache(maxsize=256)
def fee_band(amount):
    if amount < 100:
        return 2.0
    if amount < 500:
        return 5.0
    return 10.0


print(fee_band(120), fee_band(120))
```

**Key Points**
- `lru_cache` stores results of expensive pure functions.
- Arguments must be hashable; watch memory with large `maxsize`.


---

## Worked example: composable pricing for an e-commerce cart

**Beginner Level**: Write small functions for discount, tax, and shipping; call them one after another on a subtotal.

**Intermediate Level**: Pass policies as functions into a `price_cart(items, policies)` higher-order workflow so marketing can toggle rules without editing core math.

**Expert Level**: Memoize pure calculators, log inputs/outputs at boundaries, and keep monetary values in `Decimal` with explicit rounding modes in production catalogs.

```python
from decimal import Decimal, ROUND_HALF_UP
from typing import Callable, Iterable, Tuple

Money = Decimal


def subtotal(prices: Iterable[Money]) -> Money:
    return sum(prices, Money("0"))


def apply_discount(total: Money, pct: Money) -> Money:
    return (total * (Money("1") - pct)).quantize(Money("0.01"), rounding=ROUND_HALF_UP)


Policy = Callable[[Money], Money]


def price_pipeline(total: Money, steps: Iterable[Policy]) -> Money:
    x = total
    for step in steps:
        x = step(x)
    return x


lines = [Money("19.99"), Money("5.00")]
base = subtotal(lines)
ten_pct = Money("0.10")
steps = [lambda t: apply_discount(t, ten_pct), lambda t: (t + Money("4.99")).quantize(Money("0.01"))]
print(price_pipeline(base, steps))
```

**Key Points**
- Treat money as `Decimal`, not binary floats, in real billing systems.
- Higher-order `steps` lists are easy to extend with feature flags.

---

## Best Practices

- Keep function signatures small and intention-revealing; wrap complex bundles in data classes or dicts.
- Prefer pure functions for domain math; isolate I/O and side effects at the edges.
- Type-check and document public module APIs; treat them like contracts for other teams.
- Measure before micro-optimizing recursion; iterative forms often win on CPython.

---

## Common Mistakes to Avoid

- Mutable default arguments (`def f(x=[])`) sharing state across calls.
- Shadowing builtins (`list`, `dict`) with parameter names.
- Overusing `global` instead of explicit configuration objects.
- Deep recursion on user-controlled structures without depth guards.
