# Data Types Fundamentals

Python’s core scalar types — **numbers**, **booleans**, **`None`**, and the tools to **inspect types** — underpin every **inventory** ledger, **student** record, **bank** calculation, **e-commerce** price, and **weather** reading. This guide explores each concept at beginner, intermediate, and expert depths.

---

## 📑 Table of Contents

### 3.1 Numbers
1. [3.1.1 Integer Literals and Underscores](#311-integer-literals-and-underscores)
2. [3.1.2 Floating-Point Literals](#312-floating-point-literals)
3. [3.1.3 Complex Numbers](#313-complex-numbers)
4. [3.1.4 Integer Operations](#314-integer-operations)
5. [3.1.5 Floating-Point Operations](#315-floating-point-operations)
6. [3.1.6 Numeric Comparisons](#316-numeric-comparisons)
7. [3.1.7 Rounding, Floor, and Ceil](#317-rounding-floor-and-ceil)
8. [3.1.8 divmod and pow](#318-divmod-and-pow)
9. [3.1.9 math and statistics (overview)](#319-math-and-statistics-overview)

### 3.2 Booleans
10. [3.2.1 True and False Literals](#321-true-and-false-literals)
11. [3.2.2 bool() Constructor](#322-bool-constructor)
12. [3.2.3 Truthiness](#323-truthiness)
13. [3.2.4 Falsiness](#324-falsiness)
14. [3.2.5 Boolean Operations — and, or, not](#325-boolean-operations--and-or-not)
15. [3.2.6 Comparison Expressions](#326-comparison-expressions)
16. [3.2.7 Boolean Conversions in Practice](#327-boolean-conversions-in-practice)
17. [3.2.8 Short-Circuit Patterns](#328-short-circuit-patterns)
18. [3.2.9 Feature Flags and Rules Engines](#329-feature-flags-and-rules-engines)

### 3.3 None Type
19. [3.3.1 The None Literal](#331-the-none-literal)
20. [3.3.2 is and is not with None](#332-is-and-is-not-with-none)
21. [3.3.3 Equality Pitfalls with None](#333-equality-pitfalls-with-none)
22. [3.3.4 Use Cases — Missing Values](#334-use-cases--missing-values)
23. [3.3.5 Optional Parameters and Returns](#335-optional-parameters-and-returns)
24. [3.3.6 JSON null and Python None](#336-json-null-and-python-none)
25. [3.3.7 Sentinel Patterns vs None](#337-sentinel-patterns-vs-none)
26. [3.3.8 None vs Falsy Values](#338-none-vs-falsy-values)
27. [3.3.9 Database NULL Mapping](#339-database-null-mapping)

### 3.4 Type Checking
28. [3.4.1 type() Basics](#341-type-basics)
29. [3.4.2 type() and Metaclasses (overview)](#342-type-and-metaclasses-overview)
30. [3.4.3 isinstance() Basics](#343-isinstance-basics)
31. [3.4.4 isinstance() with Tuples](#344-isinstance-with-tuples)
32. [3.4.5 issubclass()](#345-issubclass)
33. [3.4.6 ABCs and register()](#346-abcs-and-register)
34. [3.4.7 Custom __instancecheck__](#347-custom-__instancecheck__)
35. [3.4.8 Type Hints — Any, Union, Optional](#348-type-hints--any-union-optional)
36. [3.4.9 Protocol and @runtime_checkable](#349-protocol-and-runtime_checkable)

- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 3.1.1 Integer Literals and Underscores

### Key Points

- Integers have **arbitrary precision** in Python 3 (`int` unifies `long`).
- Underscores **`_`** group digits in literals: `1_000_000`.
- Bases: `0b` binary, `0o` octal, `0x` hex.

**Beginner Level:** Count **inventory** items with plain integers.

```python
widgets_in_stock = 1_250
print(widgets_in_stock + 10)
```

**Intermediate Level:** Parse **student** IDs from hex configuration flags.

```python
permissions = 0x0F06
print(bin(permissions))
```

**Expert Level:** Big integers for **cryptography** or combinatorial counts — performance profile differs from fixed-width C integers; use **`gmpy2`** when needed.

---

## 3.1.2 Floating-Point Literals

### Key Points

- Floats are **IEEE 754 binary64** in CPython.
- Scientific notation: `1.2e-3`.
- **No exact** representation for many decimals (0.1 issue).

**Beginner Level:** **Weather** temperature as float.

```python
temp_c = 21.5
```

**Intermediate Level:** **E-commerce** display rounding for catalogs.

```python
price = 19.99
print(f"{price:.2f}")
```

**Expert Level:** **`decimal.Decimal`** for **bank** ledger invariants; **`math.fsum`** for stable sums.

---

## 3.1.3 Complex Numbers

### Key Points

- Literal form: `3+4j` ( **`j`** imaginary unit).
- Attributes **`.real`** and **`.imag`**; **`cmath`** module for complex math.
- Used in signal processing, physics, some ML internals.

**Beginner Level:**

```python
z = 2 + 3j
print(z.real, z.imag)
```

**Intermediate Level:** Amplitude sketch for **weather** wave overlay (conceptual).

```python
import cmath
z = cmath.exp(1j * cmath.pi / 4)
```

**Expert Level:** Prefer **NumPy** `complex128` arrays for vectorized work; Python built-in complex for scalar glue.

---

## 3.1.4 Integer Operations

### Key Points

- **`+ - * // % **`** ; **`//`** floor division toward negative infinity.
- **Bitwise** operators apply to ints.
- **`int // int`** → int; **`int / int`** → float in Python 3.

**Beginner Level:**

```python
print(10 // 3, 10 % 3)
```

**Intermediate Level:** **Inventory** pallets:

```python
items = 100
per_pallet = 24
full_pallets, remainder = divmod(items, per_pallet)
```

**Expert Level:** **`math.gcd`**, **`math.lcm` (3.9+)**, **`pow(a, b, mod)`** for modular exponentiation in security code.

---

## 3.1.5 Floating-Point Operations

### Key Points

- Mixed int and float → float result for `+ - * /`.
- **`math`** functions (`sqrt`, `sin`, `log`) expect floats.
- Special values: **`inf`**, **`nan`**.

**Beginner Level:**

```python
print(0.1 + 0.2)  # not exactly 0.3
```

**Intermediate Level:**

```python
import math
print(math.sqrt(2))
```

**Expert Level:** **`math.isclose`**, **`math.nextafter`** for numeric robustness in **simulation** engines.

---

## 3.1.6 Numeric Comparisons

### Key Points

- **`< <= > >= == !=`** chainable.
- **`==`** value equality; **`is`** identity (do not use for numbers except small interned ints accidentally).
- **`math.isclose`** for float tolerance.

**Beginner Level:**

```python
score = 88
print(0 <= score <= 100)
```

**Intermediate Level:** **Student** percentile bucket:

```python
def bucket(p: float) -> str:
    if p < 0.25:
        return "Q1"
    if p < 0.5:
        return "Q2"
    if p < 0.75:
        return "Q3"
    return "Q4"
```

**Expert Level:** **`Decimal.compare`** for total ordering including NaN signaling in financial libs.

---

## 3.1.7 Rounding, Floor, and Ceil

### Key Points

- **`round(x, ndigits)`** uses bankers rounding (ties to even).
- **`math.floor`**, **`math.ceil`**, **`math.trunc`** differ for negatives.
- **`int(x)`** truncates toward zero.

**Beginner Level:**

```python
print(round(3.6))
```

**Intermediate Level:** **E-commerce** tax line rounding per jurisdiction.

```python
import math
cents = math.ceil(amount * 100) / 100  # illustrative ceiling to cents
```

**Expert Level:** **`Decimal.quantize`** with rounding modes (`ROUND_HALF_UP`) for **bank** compliance.

---

## 3.1.8 divmod and pow

### Key Points

- **`divmod(a, b)`** → `(a // b, a % b)` but note `%` and `//` relationship with negatives.
- **`pow(a, b)`** or **`a ** b`**; three-arg **`pow(a, b, mod)`** efficient modular exp.
- **`math.pow`** always returns float.

**Beginner Level:**

```python
print(divmod(17, 5))
```

**Intermediate Level:** Pagination for **student** list UI:

```python
total, page_size = 95, 10
pages, leftover = divmod(total + page_size - 1, page_size)
```

**Expert Level:** **`pow`** three-argument form in **crypto** verification paths.

---

## 3.1.9 math and statistics (overview)

### Key Points

- **`math`**: trig, hyperbolic, gamma, combinatorics, `isqrt` (3.8+).
- **`statistics`**: mean, median, stdev — numerically naive for huge data (use NumPy/pandas).
- **`random`** for sampling (not crypto — use **`secrets`**).

**Beginner Level:**

```python
import statistics
temps = [18.0, 19.5, 17.2]
print(statistics.mean(temps))
```

**Intermediate Level:** **Inventory** safety stock from historical demand stdev (sketch).

**Expert Level:** **`numpy`** vectorization for **e-commerce** analytics pipelines; Python scalars for orchestration.

---

## 3.2.1 True and False Literals

### Key Points

- **`True`** and **`False`** are instances of **`bool`**, subclass of **`int`** (`True == 1` but use `is` only for None, not bool).
- Capitalization matters.
- Boolean is subclass of int for historical reasons — avoid arithmetic on bools in new code.

**Beginner Level:**

```python
logged_in = True
print(logged_in)
```

**Intermediate Level:** **Bank** feature toggle:

```python
OVERDRAFT_PROTECTION = False
```

**Expert Level:** **`bool` subclassing** is possible but rare; prefer explicit enums for state machines in large systems.

---

## 3.2.2 bool() Constructor

### Key Points

- **`bool(x)`** returns `True` or `False` using truthiness.
- No “nullable bool” in core types — use **`Optional[bool]`** in hints.

**Beginner Level:**

```python
print(bool(0), bool(1))
```

**Intermediate Level:**

```python
has_items = bool(cart)  # cart is a list
```

**Expert Level:** Ensure **`__bool__`** and **`__len__`** consistency on custom containers.

---

## 3.2.3 Truthiness

### Key Points

- **Truthiness** is the result of `bool(x)` in Boolean context (`if`, `while`, `and`/`or`).
- Most objects are truthy by default if neither `__bool__` nor `__len__` forces falsy.

**Beginner Level:**

```python
name = "Ada"
if name:
    print("hello", name)
```

**Intermediate Level:** **E-commerce** cart checkout guard:

```python
if cart_items:
    proceed_to_payment()
```

**Expert Level:** Document truthiness contracts for domain objects (**bank** `Account` might be truthy if open).

---

## 3.2.4 Falsiness

### Key Points

- **Falsy**: `None`, `False`, zero numerics, empty `""`, `[]`, `{}`, `set()`, `range(0)`.
- **`Decimal(0)`** is falsy; **`numpy` arrays** use element-wise truthiness rules — beware.

**Beginner Level:**

```python
if not []:
    print("empty list")
```

**Intermediate Level:** Distinguish **missing** vs **empty** string in **student** forms (`None` vs `""`).

**Expert Level:** **`pandas`** `pd.NA` three-valued logic — do not assume Python truthiness maps 1:1.

---

## 3.2.5 Boolean Operations — and, or, not

### Key Points

- **`and` / `or`** return last evaluated operand, not always `bool`.
- **`not`** always returns `bool`.
- Short-circuit evaluation avoids side effects on RHS when possible.

**Beginner Level:**

```python
print(True and False)
print(True or False)
```

**Intermediate Level:**

```python
label = user.nickname or user.email or "Guest"
```

**Expert Level:** Combine with **walrus** carefully in **inventory** validation expressions.

---

## 3.2.6 Comparison Expressions

### Key Points

- Comparisons return **`bool`** (or raise).
- **`is`** is not a value comparison for strings/ints.
- **`in`** relies on **`__contains__`**.

**Beginner Level:**

```python
print(3 < 5 < 7)
```

**Intermediate Level:** **Weather** threshold alerts:

```python
if temp_c > 35 or temp_c < -10:
    send_alert()
```

**Expert Level:** **`functools.cmp_to_key`** legacy sorting; rich comparisons on dataclasses.

---

## 3.2.7 Boolean Conversions in Practice

### Key Points

- **`int(True)==1`**, **`int(False)==0`** — useful for sums of flags sparingly.
- Prefer explicit `1 if cond else 0` for clarity.
- JSON `true`/`false` maps to Python `True`/`False`.

**Beginner Level:**

```python
flags = [True, False, True]
print(sum(map(int, flags)))
```

**Intermediate Level:** Serialize **student** active status to API JSON.

**Expert Level:** **Pydantic** strict bool parsing for **e-commerce** webhooks.

---

## 3.2.8 Short-Circuit Patterns

### Key Points

- Guard expensive calls: `if cache and cache.is_valid():`.
- Default dict access: `value = d.get(k) or default` loses valid falsy values — prefer **`d.get(k, default)`** or explicit `None` checks.

**Beginner Level:**

```python
x = None
y = x or 0
```

**Intermediate Level:** **Bank** optional middle name:

```python
display = f"{first} {(middle or '').strip()} {last}".replace("  ", " ").strip()
```

**Expert Level:** **`or` chains** with Pydantic models — explicit `if x is None` for 0 and False.

---

## 3.2.9 Feature Flags and Rules Engines

### Key Points

- Booleans compose business rules; keep rules **data-driven** or **table-driven** as complexity grows.
- **Expert systems** may use DSLs beyond raw `and`/`or`.

**Beginner Level:**

```python
def show_sale_banner(is_logged_in: bool, is_holiday: bool) -> bool:
    return is_logged_in and is_holiday
```

**Intermediate Level:** **E-commerce** segment:

```python
eligible = user.country == "US" and user.orders_count > 0 and not user.blocked
```

**Expert Level:** **JSONLogic**, **OpenFeature**, or rules tables stored in DB with audit — bools at the edge, structured rules inside.

---

## 3.3.1 The None Literal

### Key Points

- **`None`** is a singleton of type **`NoneType`**.
- Indicates **absence of value** or **null** in Python semantics.
- There is only one `None` object.

**Beginner Level:**

```python
reply = None
print(reply is None)
```

**Intermediate Level:** **Student** optional advisor ID:

```python
advisor_id: str | None = None
```

**Expert Level:** **`Optional[T]`** ≡ **`T | None`** (PEP 604) in modern hints.

---

## 3.3.2 is and is not with None

### Key Points

- **Always** `x is None` / `x is not None`.
- **`== None`** can be overridden by `__eq__` on custom classes — surprising.

**Beginner Level:**

```python
if value is None:
    value = "default"
```

**Intermediate Level:** **Inventory** optional reorder date:

```python
if last_reorder is not None:
    print(last_reorder.isoformat())
```

**Expert Level:** Linters flag `== None` — enable **`E711`** in ruff/flake8.

---

## 3.3.3 Equality Pitfalls with None

### Key Points

- **`np.nan`** is not `None` and `nan != nan`.
- SQL NULL tri-valued logic ≠ Python `None` in expressions.
- **`pandas.isna`** for missing data.

**Beginner Level:** Avoid `if x == None:`.

**Intermediate Level:** JSON **`null`** becomes **`None`** with `json.loads`.

**Expert Level:** **SQLAlchemy** `is_(None)` vs `== None` in ORM filters.

---

## 3.3.4 Use Cases — Missing Values

### Key Points

- Optional fields in **student** profiles, **bank** optional middle names.
- **Cache miss** sentinel sometimes `None`.

**Beginner Level:**

```python
def find_student(id: str) -> dict | None:
    return None  # not found
```

**Intermediate Level:** **E-commerce** optional gift message.

**Expert Level:** **`Maybe` monad** patterns in functional libs — `None` as absence at language level.

---

## 3.3.5 Optional Parameters and Returns

### Key Points

- Default **`None`** + docstring describes meaning.
- Avoid mutable defaults; use **`None`** and assign inside.

**Beginner Level:**

```python
def greet(name: str | None = None) -> str:
    if name is None:
        name = "friend"
    return f"Hi, {name}"
```

**Intermediate Level:** **Bank** transaction metadata optional dict.

**Expert Level:** **Overload** signatures for type checkers when `None` changes return type.

---

## 3.3.6 JSON null and Python None

### Key Points

- **`json.dumps`** maps `None` → `null`.
- Parsing maps `null` → `None`.

**Beginner Level:**

```python
import json
print(json.dumps({"a": None}))
print(json.loads('{"a": null}'))
```

**Intermediate Level:** **Weather** API payload normalization.

**Expert Level:** **orjson**, **simdjson** for performance — same semantic mapping.

---

## 3.3.7 Sentinel Patterns vs None

### Key Points

- When **`None`** is a valid value, use **`object()`** sentinel or **`enum`**.
- **`dataclasses.MISSING`**-like patterns in libraries.

**Beginner Level:** (Rare at beginner — stick to `None` until needed.)

**Intermediate Level:**

```python
MISSING = object()

def get_discount(user, default=MISSING):
    d = user.get("discount", MISSING)
    if d is MISSING:
        return 0.05
    return float(d)
```

**Expert Level:** **`typing.Literal`** + enums instead of string sentinels in **bank** cores.

---

## 3.3.8 None vs Falsy Values

### Key Points

- **`if not x:`** treats `None`, `0`, `""`, `[]` the same — often wrong.
- Explicit **`if x is None:`** when distinguishing zero or empty from missing.

**Beginner Level:**

```python
count = 0
# Wrong if 0 is valid: if not count: ...
if count is None:
    print("unknown")
```

**Intermediate Level:** **Inventory** zero stock is valid — do not use `if not qty`.

**Expert Level:** APIs document whether omitted field, `null`, and `0` differ — **OpenAPI** `nullable` vs `required`.

---

## 3.3.9 Database NULL Mapping

### Key Points

- DB-API returns **`None`** for NULL columns.
- ORMs map NULL ↔ optional fields.

**Beginner Level:** SQLite + stdlib:

```python
# row[2] might be None if SQL NULL
```

**Intermediate Level:** **SQLAlchemy** `Optional[str]` columns.

**Expert Level:** **Three-valued logic** in SQL WHERE — `IS NULL` not `= NULL`.

---

## 3.4.1 type() Basics

### Key Points

- **`type(obj)`** returns class.
- **`type(name, bases, namespace)`** creates class dynamically (advanced).

**Beginner Level:**

```python
print(type(3), type("hi"))
```

**Intermediate Level:** Debug **e-commerce** webhook payload types in logs.

**Expert Level:** Avoid `type(x) is list` for polymorphic APIs — use **`isinstance`**.

---

## 3.4.2 type() and Metaclasses (overview)

### Key Points

- **`type`** is its own type.
- **Metaclasses** customize class creation (`__new__`, `__init__` on metaclass).

**Beginner Level:** Skip metaclasses until comfortable with classes.

**Intermediate Level:** Recognize **`abc.ABCMeta`** in tracebacks.

**Expert Level:** Frameworks (Django ORM, attrs) use metaclasses — debug carefully in **bank** monoliths.

---

## 3.4.3 isinstance() Basics

### Key Points

- **`isinstance(obj, cls)`** true if `obj` is instance of `cls` or subclass.
- Preferred over `type(x) == T` for interfaces.

**Beginner Level:**

```python
print(isinstance(3, int))
```

**Intermediate Level:** Validate **student** row:

```python
if not isinstance(gpa, (int, float)):
    raise TypeError("gpa must be numeric")
```

**Expert Level:** **`collections.abc`** abstract base classes for structural checks.

---

## 3.4.4 isinstance() with Tuples

### Key Points

- Second arg may be **tuple of types**: `isinstance(x, (A, B, C))`.

**Beginner Level:**

```python
x = 1.5
print(isinstance(x, (int, float)))
```

**Intermediate Level:** **Bank** amount types:

```python
def normalize_amount(x: int | float | str) -> float:
    if isinstance(x, str):
        return float(x)
    return float(x)
```

**Expert Level:** Combine with **`Union`** hints for exhaustive checking.

---

## 3.4.5 issubclass()

### Key Points

- **`issubclass(A, B)`** for class objects, not instances.
- Tuple of classes allowed for second argument.

**Beginner Level:**

```python
print(issubclass(bool, int))
```

**Intermediate Level:** Plugin registry ensuring subclasses of **`BasePlugin`**.

**Expert Level:** **Virtual subclassing** via **`register`**.

---

## 3.4.6 ABCs and register()

### Key Points

- **`collections.abc`**, **`typing.Protocol`** (structural).
- **`MyABC.register(Fake)`** makes `issubclass(Fake, MyABC)` true without inheritance.

**Beginner Level:** Use **`Sequence`**, **`Mapping`** in hints first.

**Intermediate Level:**

```python
from collections.abc import Sequence

def total(xs: Sequence[float]) -> float:
    return float(sum(xs))
```

**Expert Level:** **`register`** for duck-typed third-party classes in **inventory** integrations.

---

## 3.4.7 Custom __instancecheck__

### Key Points

- Advanced: override on **metaclass** to customize **`isinstance`**.
- Rare in application code.

**Beginner Level:** Not needed initially.

**Intermediate Level:** Know it exists when reading framework docs.

**Expert Level:** Implement carefully — can break **Liskov** expectations; add tests.

---

## 3.4.8 Type Hints — Any, Union, Optional

### Key Points

- **`Any`** disables static checking for that value.
- **`Union[A, B]`** or **`A | B`** (3.10+).
- **`Optional[T]`** = **`T | None`**.

**Beginner Level:**

```python
def parse(s: str) -> int | None:
    try:
        return int(s)
    except ValueError:
        return None
```

**Intermediate Level:** **E-commerce** product ID union `str | int` during migration.

**Expert Level:** **`TypeVar`**, **`Generic`**, **`ParamSpec`** for reusable APIs.

---

## 3.4.9 Protocol and @runtime_checkable

### Key Points

- **`Protocol`** structural subtyping (static).
- **`@runtime_checkable`** allows **`isinstance`** against protocol — only checks methods/attributes, not semantics.

**Beginner Level:** Use **`Protocol`** after basics of classes.

**Intermediate Level:**

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Priced(Protocol):
    price: float

def subtotal(obj: Priced) -> float:
    return obj.price
```

**Expert Level:** Prefer nominal types for **bank** domain when identity matters; protocols for adapters.

---

## Best Practices

- Use **`is` / `is not`** for **`None`** singleton checks only.
- Treat **money** with **`Decimal`** or integer cents — avoid **`float`** for invariants.
- Prefer **`isinstance`** over **`type(...) == ...`** for polymorphic code.
- Distinguish **`None`**, **empty**, and **zero** in APIs and **inventory** counts.
- Use **`math.isclose`** for float comparisons; document tolerances.
- Leverage **`statistics`** for small datasets; **NumPy/pandas** for large **e-commerce** analytics.
- Express optional values with **`T | None`** and validate at boundaries (HTTP, DB).
- Enable **mypy/pyright** gradually; replace **`Any`** at hot boundaries.

---

## Common Mistakes to Avoid

- Using **`== None`** instead of **`is None`**.
- Treating **`False`**, **`0`**, **`""`**, and **`None`** interchangeably in business rules.
- Summing **floats** for **bank** balances without **`Decimal`** or cents integers.
- Checking **`type(x) is list`** when **`isinstance(x, list)`** should allow subclasses.
- Assuming **`bool(np.array([0]))`** behaves like scalar bool — **truth value ambiguous** errors.
- Returning **`None`** without documenting it — callers forget to check.
- Using **`random`** for **security** tokens — use **`secrets`**.
- Ignoring **NaN** behavior in **pandas** merges and comparisons.

---

*Next: dive deep into strings, lists, and collections.*
</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read