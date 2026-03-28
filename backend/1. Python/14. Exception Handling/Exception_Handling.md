
# Exception Handling in Python

Exceptions let banking cores decline bad transfers, inventory services reject negative stock, and APIs return consistent error envelopes—without tangling every function in error codes.



## 📑 Table of Contents

- [14.1 Exception Basics](#141-exception-basics)
- [14.2 `try` / `except`](#142-try--except)
- [14.3 Advanced Control Flow](#143-advanced-control-flow)
- [14.4 Raising Exceptions](#144-raising-exceptions)
- [14.5 Custom Exceptions](#145-custom-exceptions)
- [14.6 Operational Best Practices](#146-operational-best-practices)

### 14.1 Exception Basics
<a id="141-exception-basics"></a>



### 14.1.1 What Exceptions Are

<a id="1411-what-exceptions"></a>

**Beginner Level**: In real-world payments workflows, What Exceptions Are connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments contexts combine solid practice around what exceptions are with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to what exceptions are affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments systems.

```python
def charge(amount):
    if amount < 0:
        raise ValueError("negative charge")
    return amount

charge(5)
```

**Key Points**
- Exceptions signal exceptional control flow
- Prefer explicit validation before side effects
- Foundation for resilient services.
- Prefer explicit over silent.
- Log with correlation IDs.

### 14.1.2 Exception Types and Messages

<a id="1412-exception-types"></a>

**Beginner Level**: In real-world inventory workflows, Exception Types and Messages connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory contexts combine solid practice around exception types and messages with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to exception types and messages affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory systems.

```python
err = ValueError("SKU missing")
print(type(err).__name__, err)
```

**Key Points**
- Type conveys category; args carry details
- Foundation for resilient services.
- Prefer explicit over silent.
- Log with correlation IDs.

### 14.1.3 Built-in Exceptions

<a id="1413-built-in-exceptions"></a>

**Beginner Level**: In real-world HTTP layer workflows, Built-in Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in HTTP layer contexts combine solid practice around built-in exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to built-in exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in HTTP layer systems.

```python
try:
    int("abc")
except ValueError as e:
    print("bad number", e)
```

**Key Points**
- `ValueError`, `KeyError`, `IOError`/`OSError` common
- Foundation for resilient services.
- Prefer explicit over silent.
- Log with correlation IDs.

### 14.1.4 Exception Hierarchy

<a id="1414-exception-hierarchy"></a>

**Beginner Level**: In real-world framework author workflows, Exception Hierarchy connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in framework author contexts combine solid practice around exception hierarchy with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to exception hierarchy affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in framework author systems.

```python
print(issubclass(ValueError, Exception))
```

**Key Points**
- Catch `Exception` sparingly—hides bugs
- `BaseException` includes `SystemExit`, `KeyboardInterrupt`
- Foundation for resilient services.
- Prefer explicit over silent.
- Log with correlation IDs.

### 14.1.5 Exception Objects and Attributes

<a id="1415-exception-objects"></a>

**Beginner Level**: In real-world logging workflows, Exception Objects and Attributes connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in logging contexts combine solid practice around exception objects and attributes with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to exception objects and attributes affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in logging systems.

```python
try:
    {}["x"]
except KeyError as e:
    print(e.args)
```

**Key Points**
- `.args` tuple holds constructor arguments
- Foundation for resilient services.
- Prefer explicit over silent.
- Log with correlation IDs.

### 14.1.6 `BaseException` vs `Exception`

<a id="1416-base-vs-exception"></a>

**Beginner Level**: In real-world CLI apps workflows, `BaseException` vs `Exception` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in CLI apps contexts combine solid practice around `baseexception` vs `exception` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `baseexception` vs `exception` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in CLI apps systems.

```python
# User interrupts derive from BaseException
```

**Key Points**
- Do not catch `KeyboardInterrupt` unless you truly must
- Foundation for resilient services.
- Prefer explicit over silent.
- Log with correlation IDs.

### 14.2 `try` / `except`

<a id="142-try--except"></a>

### 14.2.1 `try` / `except` Syntax

<a id="1421-try-except-syntax"></a>

**Beginner Level**: In real-world bank transfer workflows, `try` / `except` Syntax connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bank transfer contexts combine solid practice around `try` / `except` syntax with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `try` / `except` syntax affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bank transfer systems.

```python
try:
    1 / 0
except ZeroDivisionError:
    print("blocked")
```

**Key Points**
- First matching handler runs
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.2.2 Single `except` Clause

<a id="1422-single-except"></a>

**Beginner Level**: In real-world cart workflows, Single `except` Clause connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in cart contexts combine solid practice around single `except` clause with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to single `except` clause affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in cart systems.

```python
try:
    int("nope")
except ValueError:
    print("fix input")
```

**Key Points**
- Bind with `as` to inspect without string parsing
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.2.3 Multiple `except` Blocks

<a id="1423-multiple-except"></a>

**Beginner Level**: In real-world file import workflows, Multiple `except` Blocks connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in file import contexts combine solid practice around multiple `except` blocks with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to multiple `except` blocks affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in file import systems.

```python
try:
    open("missing.txt", "r", encoding="utf-8")
except FileNotFoundError:
    print("missing")
except PermissionError:
    print("denied")
```

**Key Points**
- Order specific-to-general
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.2.4 Catching Multiple Types

<a id="1424-catching-multiple"></a>

**Beginner Level**: In real-world API client workflows, Catching Multiple Types connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in API client contexts combine solid practice around catching multiple types with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to catching multiple types affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in API client systems.

```python
try:
    risky()
except (TypeError, ValueError):
    print("client bug")
```

**Key Points**
- Tuple of types shares one handler body
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.2.5 Binding with `as`

<a id="1425-binding-as"></a>

**Beginner Level**: In real-world support tooling workflows, Binding with `as` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in support tooling contexts combine solid practice around binding with `as` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to binding with `as` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in support tooling systems.

```python
try:
    raise RuntimeError("trace id 9")
except RuntimeError as err:
    print(str(err))
```

**Key Points**
- `err` is valid only inside handler
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.2.6 `else` on `try`

<a id="1426-try-else"></a>

**Beginner Level**: In real-world validation pipeline workflows, `else` on `try` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in validation pipeline contexts combine solid practice around `else` on `try` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `else` on `try` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in validation pipeline systems.

```python
try:
    x = int("3")
except ValueError:
    print("bad")
else:
    print("parsed", x)
```

**Key Points**
- `else` runs if no exception in `try`
- Keeps happy path unindented
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.3 Advanced Control Flow

<a id="143-advanced-control-flow"></a>

### 14.3.1 The `finally` Block

<a id="1431-finally-block"></a>

**Beginner Level**: In real-world DB session workflows, The `finally` Block connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in DB session contexts combine solid practice around the `finally` block with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `finally` block affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in DB session systems.

```python
f = open("x.txt", "w", encoding="utf-8")
try:
    f.write("a")
finally:
    f.close()
```

**Key Points**
- `finally` always runs (almost)—use for cleanup
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.3.2 Execution Flow with `try`/`except`/`finally`

<a id="1432-execution-flow"></a>

**Beginner Level**: In real-world checkout workflows, Execution Flow with `try`/`except`/`finally` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in checkout contexts combine solid practice around execution flow with `try`/`except`/`finally` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to execution flow with `try`/`except`/`finally` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in checkout systems.

```python
def flow(flag):
    try:
        if flag:
            return "ok"
    finally:
        print("cleanup")

print(flow(True))
```

**Key Points**
- `finally` runs even on `return` in `try`
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.3.3 Nested `try` Blocks

<a id="1433-nested-try"></a>

**Beginner Level**: In real-world multi-step KYC workflows, Nested `try` Blocks connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in multi-step KYC contexts combine solid practice around nested `try` blocks with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to nested `try` blocks affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in multi-step KYC systems.

```python
try:
    try:
        raise ValueError("inner")
    except ValueError:
        print("handled inner")
except ValueError:
    print("outer")
```

**Key Points**
- Inner handlers take precedence
- Flatten when readability suffers
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.3.4 Exception Propagation

<a id="1434-propagation"></a>

**Beginner Level**: In real-world middleware workflows, Exception Propagation connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in middleware contexts combine solid practice around exception propagation with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to exception propagation affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in middleware systems.

```python
def low():
    raise RuntimeError("boom")

def high():
    low()

try:
    high()
except RuntimeError:
    print("caught at boundary")
```

**Key Points**
- Unhandled exceptions bubble through call stack
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.3.5 Re-raising Exceptions

<a id="1435-reraising"></a>

**Beginner Level**: In real-world observability workflows, Re-raising Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in observability contexts combine solid practice around re-raising exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to re-raising exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in observability systems.

```python
try:
    1 / 0
except ZeroDivisionError:
    print("log")
    raise
```

**Key Points**
- Bare `raise` preserves traceback
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.3.6 `try`/`finally` without `except`

<a id="1436-try-finally-without-except"></a>

**Beginner Level**: In real-world locks workflows, `try`/`finally` without `except` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in locks contexts combine solid practice around `try`/`finally` without `except` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `try`/`finally` without `except` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in locks systems.

```python
lock = True

def release():
    print("released")

try:
    print("work")
finally:
    release()
```

**Key Points**
- Useful when you always cleanup but do not handle errors here
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.3.7 Exception Groups (Python 3.11+)

<a id="1437-exception-groups-note"></a>

**Beginner Level**: In real-world batch payments workflows, Exception Groups (Python 3.11+) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in batch payments contexts combine solid practice around exception groups (python 3.11+) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to exception groups (python 3.11+) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in batch payments systems.

```python
# try:
#     raise ExceptionGroup("batch", [ValueError("a"), TypeError("b")])
# except* ValueError as e:
#     print("handled value errors", e)
print("use except* for ExceptionGroup members when on 3.11+")
```

**Key Points**
- `ExceptionGroup` models multiple failures (e.g., parallel tasks)
- `except*` matches sub-exceptions inside groups
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.4 Raising Exceptions

<a id="144-raising-exceptions"></a>

### 14.4.1 The `raise` Statement

<a id="1441-raise-statement"></a>

**Beginner Level**: In real-world inventory rules workflows, The `raise` Statement connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory rules contexts combine solid practice around the `raise` statement with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `raise` statement affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory rules systems.

```python
if qty < 0:
    raise ValueError("qty must be non-negative")
```

**Key Points**
- `raise` without arg re-raises active exception inside `except`
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.4.2 Raising Built-in Exceptions

<a id="1442-raising-built-ins"></a>

**Beginner Level**: In real-world payments workflows, Raising Built-in Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments contexts combine solid practice around raising built-in exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to raising built-in exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments systems.

```python
raise PermissionError("insufficient rights")
```

**Key Points**
- Pick the narrowest built-in that matches semantics
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.4.3 Custom Exception Classes

<a id="1443-custom-exceptions"></a>

**Beginner Level**: In real-world domain layer workflows, Custom Exception Classes connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in domain layer contexts combine solid practice around custom exception classes with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to custom exception classes affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in domain layer systems.

```python
class InsufficientFunds(Exception):
    pass

raise InsufficientFunds()
```

**Key Points**
- Subclass `Exception` for application errors
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.4.4 Exception Chaining (`from`)

<a id="1444-exception-chaining"></a>

**Beginner Level**: In real-world data pipelines workflows, Exception Chaining (`from`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in data pipelines contexts combine solid practice around exception chaining (`from`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to exception chaining (`from`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in data pipelines systems.

```python
try:
    int("x")
except ValueError as e:
    raise RuntimeError("parse failed") from e
```

**Key Points**
- Preserves `__cause__` for debugging
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.4.5 Tracebacks and `traceback` Module

<a id="1445-tracebacks"></a>

**Beginner Level**: In real-world support workflows, Tracebacks and `traceback` Module connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in support contexts combine solid practice around tracebacks and `traceback` module with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to tracebacks and `traceback` module affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in support systems.

```python
import traceback

try:
    1 / 0
except Exception:
    print(traceback.format_exc()[:60])
```

**Key Points**
- Format for logs without crashing user flows
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.4.6 The `assert` Statement (Testing Aid)

<a id="1446-assert-statement"></a>

**Beginner Level**: In real-world dev only workflows, The `assert` Statement (Testing Aid) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in dev only contexts combine solid practice around the `assert` statement (testing aid) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `assert` statement (testing aid) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in dev only systems.

```python
assert 2 + 2 == 4
```

**Key Points**
- `-O` disables asserts—do not rely for security
- Prefer explicit checks in production paths
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.5 Custom Exceptions

<a id="145-custom-exceptions"></a>

### 14.5.1 Defining Custom Exceptions

<a id="1451-defining-custom"></a>

**Beginner Level**: In real-world e-commerce workflows, Defining Custom Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce contexts combine solid practice around defining custom exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to defining custom exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce systems.

```python
class CheckoutError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
```

**Key Points**
- Attach structured fields for HTTP mapping
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.5.2 Inheritance Patterns

<a id="1452-inheritance-patterns"></a>

**Beginner Level**: In real-world API errors workflows, Inheritance Patterns connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in API errors contexts combine solid practice around inheritance patterns with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to inheritance patterns affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in API errors systems.

```python
class ApiError(Exception):
    pass

class NotFound(ApiError):
    pass
```

**Key Points**
- Hierarchy enables coarse `except ApiError`
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.5.3 Exception Attributes

<a id="1453-exception-attributes"></a>

**Beginner Level**: In real-world retry logic workflows, Exception Attributes connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in retry logic contexts combine solid practice around exception attributes with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to exception attributes affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in retry logic systems.

```python
class TransientError(Exception):
    def __init__(self, retry_after):
        super().__init__("retry")
        self.retry_after = retry_after
```

**Key Points**
- Carry machine-readable metadata
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.5.4 User-facing vs Internal Messages

<a id="1454-user-messages"></a>

**Beginner Level**: In real-world banking UX workflows, User-facing vs Internal Messages connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in banking UX contexts combine solid practice around user-facing vs internal messages with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to user-facing vs internal messages affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in banking UX systems.

```python
class Declined(Exception):
    def user_message(self):
        return "Payment could not be completed"
```

**Key Points**
- Never leak stack traces to end users
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.5.5 Logging Exceptions

<a id="1455-logging-exceptions"></a>

**Beginner Level**: In real-world SRE workflows, Logging Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in SRE contexts combine solid practice around logging exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to logging exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in SRE systems.

```python
import logging

log = logging.getLogger(__name__)

try:
    1 / 0
except Exception:
    log.exception("unhandled path")
```

**Key Points**
- `exception` includes traceback automatically
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.6 Operational Best Practices

<a id="146-operational-best-practices"></a>

### 14.6.1 Catch Specific Exceptions

<a id="1461-specific-handling"></a>

**Beginner Level**: In real-world file worker workflows, Catch Specific Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in file worker contexts combine solid practice around catch specific exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to catch specific exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in file worker systems.

```python
try:
    open("x", "r", encoding="utf-8")
except FileNotFoundError:
    print("defaulting")
```

**Key Points**
- Avoid bare `except:` entirely
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.6.2 Avoid Silent Failures

<a id="1462-silent-failures"></a>

**Beginner Level**: In real-world finance workflows, Avoid Silent Failures connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in finance contexts combine solid practice around avoid silent failures with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to avoid silent failures affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in finance systems.

```python
# Bad: except Exception: pass
```

**Key Points**
- At minimum log context and metric
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.6.3 Context-specific Error Handling

<a id="1463-context-specific"></a>

**Beginner Level**: In real-world HTTP workflows, Context-specific Error Handling connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in HTTP contexts combine solid practice around context-specific error handling with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to context-specific error handling affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in HTTP systems.

```python
def to_http(exc):
    mapping = {ValueError: 400, KeyError: 404}
    return mapping.get(type(exc), 500)
```

**Key Points**
- Map domain errors to stable API contracts
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.6.4 Document Raised Exceptions

<a id="1464-documentation"></a>

**Beginner Level**: In real-world libraries workflows, Document Raised Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in libraries contexts combine solid practice around document raised exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to document raised exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in libraries systems.

```python
def parse_isbn(s: str) -> str:
    'Raises ValueError if checksum invalid.'
    if len(s) != 10:
        raise ValueError("length")
    return s
```

**Key Points**
- Doc contracts reduce misuse
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.6.5 Testing Exceptions

<a id="1465-testing-exceptions"></a>

**Beginner Level**: In real-world pytest style workflows, Testing Exceptions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in pytest style contexts combine solid practice around testing exceptions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to testing exceptions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in pytest style systems.

```python
def _raises():
    raise RuntimeError("x")

try:
    _raises()
except RuntimeError:
    assert True
```

**Key Points**
- Use `pytest.raises` in real test suites
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.

### 14.6.6 The `warnings` Module

<a id="1466-warnings-module"></a>

**Beginner Level**: In real-world deprecations workflows, The `warnings` Module connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in deprecations contexts combine solid practice around the `warnings` module with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `warnings` module affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in deprecations systems.

```python
import warnings

warnings.warn("old API", DeprecationWarning)
```

**Key Points**
- For library maintainers signaling migration
- Map to user-safe messages at boundaries.
- Never bare except.
- Test failure paths.


---

## Worked example: HTTP-safe error mapping for an e-commerce API

**Beginner Level**: Catch domain errors and translate them to HTTP status codes.

**Intermediate Level**: Use exception hierarchies (`ApiError` subclasses) so middleware can serialize consistently.

**Expert Level**: Add `request_id`, omit stack traces from clients, log full context server-side, and include retry hints only when idempotent.

```python
class ApiError(Exception):
    status = 500
    code = "internal_error"


class BadRequest(ApiError):
    status = 400
    code = "bad_request"


def http_error_payload(exc: Exception, request_id: str):
    if isinstance(exc, ApiError):
        return exc.status, {"error": {"code": exc.code, "request_id": request_id}}
    return 500, {"error": {"code": "internal_error", "request_id": request_id}}


print(http_error_payload(BadRequest("bad sku"), "req-1"))
```

**Key Points**
- Clients see stable JSON; operators see rich logs.
- Never reuse generic 500 for validation bugs.

---

## Best Practices

- Catch the narrowest exception that you can handle meaningfully.
- Use `raise ... from` when wrapping errors to preserve causal chains.
- Test both success and failure paths; failures are user journeys too.
- Document which exceptions public functions may emit.

---

## Common Mistakes to Avoid

- Bare `except:` swallowing `KeyboardInterrupt` and `SystemExit`.
- Returning `None` on error without documenting it—callers crash later.
- Logging only the message without exception—lose stack context.
