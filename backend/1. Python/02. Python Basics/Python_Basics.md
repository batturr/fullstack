# Python Basics

This guide covers **syntax**, **variables**, **input/output**, **operators**, **type conversion**, and **comments** — the foundation for building **inventory systems**, **student portals**, **banking utilities**, **e-commerce** checkouts, and **weather** dashboards in Python.

---

## 📑 Table of Contents

### Section 2.1 — Syntax
1. [2.1.1 Statements](#211-statements)
2. [2.1.2 Expression Statements](#212-expression-statements)
3. [2.1.3 Keywords](#213-keywords)
4. [2.1.4 Identifiers](#214-identifiers)
5. [2.1.5 Unicode Identifiers](#215-unicode-identifiers)
6. [2.1.6 Line Continuation — Backslash](#216-line-continuation--backslash)
7. [2.1.7 Parenthesized Continuation](#217-parenthesized-continuation)
8. [2.1.8 Multiple Statements on One Line](#218-multiple-statements-on-one-line)

### Section 2.2 — Variables
9. [2.2.1 Declaration and Assignment](#221-declaration-and-assignment)
10. [2.2.2 Dynamic Typing](#222-dynamic-typing)
11. [2.2.3 Naming Rules](#223-naming-rules)
12. [2.2.4 Style-Oriented Naming](#224-style-oriented-naming)
13. [2.2.5 Multiple Assignment](#225-multiple-assignment)
14. [2.2.6 Tuple Unpacking and Extended Unpacking](#226-tuple-unpacking-and-extended-unpacking)
15. [2.2.7 Swapping Values](#227-swapping-values)
16. [2.2.8 Names, Objects, and Memory](#228-names-objects-and-memory)

### Section 2.3 — Input / Output
17. [2.3.1 print() Basics](#231-print-basics)
18. [2.3.2 print() Advanced — sep, end, file, flush](#232-print-advanced--sep-end-file-flush)
19. [2.3.3 input() Basics](#233-input-basics)
20. [2.3.4 input() Validation Patterns](#234-input-validation-patterns)
21. [2.3.5 Legacy % Formatting](#235-legacy--formatting)
22. [2.3.6 str.format()](#236-strformat)
23. [2.3.7 f-strings (Formatted String Literals)](#237-f-strings-formatted-string-literals)
24. [2.3.8 Escape Sequences](#238-escape-sequences)

### Section 2.4 — Operators
25. [2.4.1 Arithmetic Operators](#241-arithmetic-operators)
26. [2.4.2 Comparison Operators](#242-comparison-operators)
27. [2.4.3 Logical Operators](#243-logical-operators)
28. [2.4.4 Assignment Operators](#244-assignment-operators)
29. [2.4.5 Bitwise Operators](#245-bitwise-operators)
30. [2.4.6 Membership Operators](#246-membership-operators)
31. [2.4.7 Identity Operators](#247-identity-operators)
32. [2.4.8 Precedence and Associativity](#248-precedence-and-associativity)

### Section 2.5 — Type Conversion
33. [2.5.1 Implicit Conversion](#251-implicit-conversion)
34. [2.5.2 Explicit Conversion Overview](#252-explicit-conversion-overview)
35. [2.5.3 int()](#253-int)
36. [2.5.4 float()](#254-float)
37. [2.5.5 str()](#255-str)
38. [2.5.6 bool()](#256-bool)
39. [2.5.7 type()](#257-type)
40. [2.5.8 isinstance()](#258-isinstance)

### Section 2.6 — Comments
41. [2.6.1 Single-Line Comments](#261-single-line-comments)
42. [2.6.2 Multi-Line and Block Comments](#262-multi-line-and-block-comments)
43. [2.6.3 Docstrings](#263-docstrings)
44. [2.6.4 Shebang Lines](#264-shebang-lines)
45. [2.6.5 Comment Hygiene and Readability](#265-comment-hygiene-and-readability)
46. [2.6.6 When Not to Comment](#266-when-not-to-comment)
47. [2.6.7 Docstrings and Tooling](#267-docstrings-and-tooling)
48. [2.6.8 Documentation Parity with README](#268-documentation-parity-with-readme)

- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 2.1.1 Statements

### Key Points

- A **statement** is a unit of execution (assignment, `import`, `return`, `if`, loops).
- Statements perform actions; many can contain **expressions** as subparts.
- Top-level scripts are sequences of statements executed in order.

**Beginner Level:** Each line of code that “does something” is usually a statement. Printing a welcome banner for an **e-commerce** site is a simple statement.

```python
print("Flash sale starts at noon!")
```

**Intermediate Level:** **Simple statements** include assignment, `assert`, `pass`, `del`, `return`, `yield`, `raise`, `break`, `continue`, `import`. **Compound statements** (`if`, `for`, `while`, `try`, `def`, `class`, `with`) contain indented suites.

```python
total = 0
for price in [9.99, 14.50, 7.00]:
    total += price  # assignment statement inside for compound statement
```

**Expert Level:** Understanding **AST** structure helps with linters and macros. In **bank** batch jobs, idempotent statement ordering and explicit transaction boundaries matter more than clever one-liners.

```python
# Expert: context manager compound statement ensures file closure
from pathlib import Path

def write_ledger_line(path: Path, line: str) -> None:
    with path.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")
```

---

## 2.1.2 Expression Statements

### Key Points

- An **expression** evaluates to a value; used inside larger statements.
- **Expression statements** evaluate an expression for its side effects (e.g. `list.append(x)`).
- Bare literals in the REPL print results; in scripts they are no-ops unless interactive.

**Beginner Level:** `2 + 2` is an expression. `print(2 + 2)` is a call expression used as a statement.

```python
2 + 2  # in a .py file, result discarded unless assigned or printed
print(2 + 2)
```

**Intermediate Level:** Method calls that mutate (`cart.append(item)`) are common expression statements in **inventory** code.

```python
cart = []
cart.append({"sku": "A12", "qty": 3})
```

**Expert Level:** Chained fluent APIs rely on expression statements returning `self`. Be careful with **mutable default** patterns and **thread safety** in production services.

```python
class Query:
    def __init__(self):
        self._filters: list[str] = []

    def where(self, clause: str) -> "Query":
        self._filters.append(clause)
        return self

q = Query().where("active=1").where("region='US'")
```

---

## 2.1.3 Keywords

### Key Points

- **Keywords** are reserved; you cannot use them as identifiers (`if`, `class`, `lambda`).
- `help("keywords")` lists them in the REPL.
- New versions may add keywords (`match`, `case` in 3.10).

**Beginner Level:** You cannot name a variable `class` because Python reserves it.

```python
student_class = "10-A"  # OK — not the keyword `class`
```

**Intermediate Level:** **`async` / `await`** are soft keywords in some positions; understanding parsing helps read modern **weather** API clients.

```python
# Conceptual — requires asyncio runtime for real usage
# async def fetch_temp(city: str) -> float: ...
```

**Expert Level:** **`__debug__`**, **`_` in match**, and **soft keywords** complicate syntax highlighters. Static analysis tools must track version-specific grammar for **e-commerce** monorepos on mixed interpreters.

```python
match {"status": "paid"}:
    case {"status": s} if s in {"paid", "pending"}:
        print("known", s)
```

---

## 2.1.4 Identifiers

### Key Points

- Identifiers name variables, functions, modules, classes.
- Allowed: letters, digits, underscore; **cannot start with a digit**.
- Case-sensitive: `Total` ≠ `total`.

**Beginner Level:** Name a **student** score variable `score_math`, not `2score`.

```python
score_math = 92
```

**Intermediate Level:** Leading underscore signals **internal use** (`_cache`); double leading underscore triggers **name mangling** in classes (`__balance`).

```python
class Account:
    def __init__(self):
        self.__internal_id = 1  # mangled to _Account__internal_id
```

**Expert Level:** Identifiers may contain Unicode letters (PEP 3131); international **bank** domains sometimes use localized field names — balance clarity vs locale standards in APIs.

```python
résumé_id = 42  # valid identifier in Python 3
```

---

## 2.1.5 Unicode Identifiers

### Key Points

- Python 3 allows non-ASCII letters in identifiers per Unicode categories.
- ASCII **`snake_case`** remains standard for public APIs.
- Fonts and keyboards make Unicode identifiers harder in mixed teams.

**Beginner Level:** Stick to English ASCII names until you are comfortable.

```python
city_tokyo_temp_c = 18
```

**Intermediate Level:** If your domain uses **diacritics**, identifiers can match legal names — still prefer ASCII keys in **JSON** payloads.

```python
nombre_estudiante = "Sofía"
```

**Expert Level:** Lint rules (`ruff`/`pylint`) may flag non-ASCII identifiers; configure **per-package** overrides for localized admin tools while keeping **wire formats** ASCII-safe.

---

## 2.1.6 Line Continuation — Backslash

### Key Points

- A backslash `\` at end of line continues the logical line.
- **Fragile**: trailing whitespace after `\` breaks continuation.
- Prefer **implicit continuation** inside parentheses.

**Beginner Level:**

```python
message = "Your order total is " + \
    "$49.99"
print(message)
```

**Intermediate Level:** In **bank** CSV parsers, backslash continuation is rare; parentheses are clearer for long conditions.

```python
eligible = (
    age >= 18
    and country == "US"
    and not frozen
)
```

**Expert Level:** Code formatters like **Black** re-parenthesize expressions; avoid backslashes in generated code templates where whitespace is invisible.

---

## 2.1.7 Parenthesized Continuation

### Key Points

- Expressions inside `()`, `[]`, `{}` can span lines without `\`.
- Brackets must balance; trailing commas allowed in literals.
- Preferred style in modern Python.

**Beginner Level:**

```python
items = [
    "apple",
    "banana",
    "cherry",
]
```

**Intermediate Level:** Long **e-commerce** SQL strings (if not using an ORM) benefit from implicit string concatenation of adjacent literals.

```python
query = (
    "SELECT id, total FROM orders "
    "WHERE status = 'open'"
)
```

**Expert Level:** Nested comprehensions across lines should stay readable; extract functions when depth hurts **code review** velocity.

```python
order_ids = [
    oid
    for batch in shipments
    for oid in batch["order_ids"]
    if oid % 2 == 0
]
```

---

## 2.1.8 Multiple Statements on One Line

### Key Points

- Semicolon `;` separates simple statements on one line.
- **Discouraged** except rare tight one-liners (e.g. `python -c`).
- Hurts readability in application code.

**Beginner Level:**

```python
x = 1; y = 2; print(x + y)
```

**Intermediate Level:** Tuple unpacking with semicolons is still multiple statements — avoid packing unrelated logic.

**Expert Level:** Generated code and **golf** aside, **PEP 8** says “Don’t use compound statements on the same line as the header.” Production **inventory** services favor vertical space.

```python
# Avoid:
# if x: do_something()

# Prefer:
if x:
    do_something()
```

---

## 2.2.1 Declaration and Assignment

### Key Points

- Python has **no declaration keyword**; assignment binds a name to an object.
- First assignment **creates** the name in the current scope.
- **`=`** binds reference to object, not “storage slot typing”.

**Beginner Level:**

```python
product_name = "Wireless Mouse"
price_usd = 29.99
```

**Intermediate Level:** **Annotated assignment** (`x: int = 0`) documents intent and enables static typing tools without runtime enforcement (unless using validators).

```python
quantity: int = 0
quantity = 10
```

**Expert Level:** **Single assignment** style in functional hotspots reduces mutation bugs; for **bank** ledgers, prefer immutable records and explicit reassignment only at controlled boundaries.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class LineItem:
    sku: str
    qty: int
```

---

## 2.2.2 Dynamic Typing

### Key Points

- Names refer to objects; **objects** have types, not variables.
- The same name can refer to different types over time.
- **Type hints** document expected types for tooling.

**Beginner Level:**

```python
x = 5
x = "hello"  # allowed — name now refers to a str
```

**Intermediate Level:** Duck typing helps **student** records accept dict-like or object-like rows.

```python
def student_id(row):
    return row["id"] if isinstance(row, dict) else row.id
```

**Expert Level:** Use **`mypy` strict** + **`Protocol`** for structural typing in large **e-commerce** codebases while retaining Python flexibility.

```python
from typing import Protocol

class Priced(Protocol):
    price: float

def subtotal(items: list[Priced]) -> float:
    return sum(i.price for i in items)
```

---

## 2.2.3 Naming Rules

### Key Points

- Do not shadow **builtins** (`list`, `id`, `sum`) carelessly.
- Avoid **l** (lowercase L) and **O** (uppercase o) confusion with `1` and `0`.
- Module names: short, lowercase, underscores if needed.

**Beginner Level:**

```python
list_of_scores = [80, 90]  # better than naming variable `list`
```

**Intermediate Level:** Constants use **`UPPER_SNAKE`** at module level for **weather** API keys loaded from env.

```python
API_BASE = "https://api.weather.example"
```

**Expert Level:** **Private module** patterns (`_impl.py`), **dunder** reserved (`__all__`, `__init__.py`), and **package** layout interact with **importlib**; naming affects **test discovery**.

---

## 2.2.4 Style-Oriented Naming

### Key Points

- **PEP 8**: `snake_case` functions/vars, `PascalCase` classes, `UPPER_SNAKE` constants.
- Method names: verbs (`fetch`, `calculate`).
- Class names: nouns (`Student`, `Order`).

**Beginner Level:**

```python
class ShoppingCart:
    def add_item(self, name: str) -> None:
        pass
```

**Intermediate Level:** Properties can expose attribute-like access while keeping encapsulation in **bank** domain models.

```python
class Account:
    @property
    def available_balance(self) -> float:
        return self._balance - self._holds
```

**Expert Level:** Consistency across **microservices** matters more than personal taste; adopt org-wide **style guide** + automated formatters.

---

## 2.2.5 Multiple Assignment

### Key Points

- `a = b = c = 0` chains assignment right-to-left.
- All names refer to the **same object** when one expression is used.
- Mutable shared defaults are a classic pitfall.

**Beginner Level:**

```python
x = y = z = 0
print(x, y, z)
```

**Intermediate Level:** Chained assignment to a mutable literal is almost always wrong.

```python
# Wrong for three independent lists:
# a = b = c = []

# Right:
a, b, c = [], [], []
```

**Expert Level:** In **inventory** caches, chain assignment of singletons (`NONE = _sentinel = object()`) appears in advanced patterns — document intent heavily.

---

## 2.2.6 Tuple Unpacking and Extended Unpacking

### Key Points

- `a, b = (1, 2)` unpacks iterables of known length.
- **Starred** `*rest` captures remaining items (PEP 3132).
- Works with any iterable (lists, tuples, generators) if structure matches.

**Beginner Level:**

```python
name, grade = ("Alice", "A")
```

**Intermediate Level:**

```python
first, *middle, last = [10, 20, 30, 40]
print(middle)  # [20, 30]
```

**Expert Level:** Unpacking in **`for`** loops simplifies **e-commerce** pair iteration.

```python
for sku, qty in [("A1", 2), ("B2", 5)]:
    print(sku, qty)
```

---

## 2.2.7 Swapping Values

### Key Points

- Tuple unpacking enables swap without temp: `a, b = b, a`.
- More readable than XOR tricks from other languages.
- Works because right-hand side packs a tuple before assignments.

**Beginner Level:**

```python
a, b = 1, 2
a, b = b, a
print(a, b)  # 2 1
```

**Intermediate Level:** Rotate three **student** ranks in a readable way.

```python
first, second, third = "Ann", "Bo", "Cy"
first, second, third = second, third, first
```

**Expert Level:** In numeric code, swapping via unpacking is clear; for huge structures, swapping **references** is O(1) — objects themselves may be large in memory.

---

## 2.2.8 Names, Objects, and Memory

### Key Points

- Names are entries in **namespaces** pointing to objects on the heap.
- **Garbage collection** reclaims unreferenced objects (mostly refcount + cycle GC).
- **`is`** tests identity; **`==`** tests value equality.

**Beginner Level:**

```python
a = [1, 2]
b = a
b.append(3)
print(a)  # [1, 2, 3] — same list object
```

**Intermediate Level:** Small integers are **interned**; do not rely on `is` for equality of integers except `None` checks with `is None`.

```python
x = None
if x is None:
    print("missing student id")
```

**Expert Level:** **`sys.getrefcount`**, **weakrefs**, and **copy** semantics matter in **bank** in-memory caches; profile before micro-optimizing.

```python
import copy

original = {"tags": ["sale"]}
shallow = copy.copy(original)
deep = copy.deepcopy(original)
```

---

## 2.3.1 print() Basics

### Key Points

- **`print(*values, sep=' ', end='\n', file=sys.stdout, flush=False)`**
- Converts arguments to strings separated by `sep`.
- Adds `end` afterward (default newline).

**Beginner Level:**

```python
print("Hello", "student")
```

**Intermediate Level:** Print **weather** readings in a loop.

```python
for hour, temp in [(9, 18.5), (12, 21.0), (15, 19.2)]:
    print(hour, "h ->", temp, "°C")
```

**Expert Level:** Redirect **`file`** to logs or StringIO for testing **e-commerce** receipt builders.

```python
import io

buf = io.StringIO()
print("Order #1001", file=buf)
assert "1001" in buf.getvalue()
```

---

## 2.3.2 print() Advanced — sep, end, file, flush

### Key Points

- **`sep`** changes delimiter; **`end`** suppresses or doubles newlines.
- **`file`** targets any text stream.
- **`flush=True`** forces immediate write — useful for long-running **bank** ETL progress.

**Beginner Level:**

```python
print("a", "b", "c", sep="-")
```

**Intermediate Level:**

```python
print("Loading", end="")
print("...", flush=True)
```

**Expert Level:** Combine with **`logging`** in production instead of `print`; for CLI tools, `print(..., file=sys.stderr)` separates errors from pipeable stdout.

```python
import sys

print("error: bad input", file=sys.stderr)
```

---

## 2.3.3 input() Basics

### Key Points

- **`input(prompt)`** reads a line from stdin as **string** (no `input()` in 2.x `raw_input` rename).
- Trailing newline stripped.
- **Security**: never `eval` user input.

**Beginner Level:**

```python
name = input("Enter your name: ")
print("Welcome", name)
```

**Intermediate Level:** **Student** ID entry:

```python
sid = input("Student ID: ").strip()
```

**Expert Level:** For **non-interactive** contexts (daemons), stdin may be closed — guard with try/except or use argparse instead.

---

## 2.3.4 input() Validation Patterns

### Key Points

- Always **validate** and **normalize** (`strip`, casefold for identifiers).
- Loop until valid or cap attempts for UX.
- Convert explicitly with try/except.

**Beginner Level:**

```python
while True:
    raw = input("Enter quantity (int): ")
    if raw.isdigit():
        qty = int(raw)
        break
    print("Please enter digits only.")
```

**Intermediate Level:** **Bank** amount entry with decimal validation:

```python
while True:
    raw = input("Amount USD: ").strip()
    try:
        amount = float(raw)
        if amount <= 0:
            raise ValueError
        break
    except ValueError:
        print("Enter a positive number.")
```

**Expert Level:** Use **`decimal.Decimal`** for money, localized parsers, and strict **regex** where needed; log validation failures without leaking PII.

```python
from decimal import Decimal, InvalidOperation

while True:
    raw = input("Amount: ").strip()
    try:
        amount = Decimal(raw)
        break
    except InvalidOperation:
        print("Invalid decimal.")
```

---

## 2.3.5 Legacy % Formatting

### Key Points

- **`"%.2f" % value`** C-style printf formatting.
- **Deprecated** for new code in favor of f-strings but still seen in legacy **inventory** scripts.
- Tuple right-hand side for multiple values.

**Beginner Level:**

```python
total = 49.99
print("Total: $%.2f" % total)
```

**Intermediate Level:**

```python
print("%(sku)s x %(qty)d" % {"sku": "A1", "qty": 3})
```

**Expert Level:** When maintaining **Python 2**-era templates, migrate gradually to `.format` or f-strings; watch **type** of `%s` with bytes vs str on boundaries.

---

## 2.3.6 str.format()

### Key Points

- **`"{0} {1}".format(a, b)`** positional; **`{name}`** keyword.
- **Format spec** inside braces: `"{:.2f}".format(x)`.
- Useful for i18n message catalogs with reorderable placeholders.

**Beginner Level:**

```python
print("Hello, {}".format("World"))
```

**Intermediate Level:**

```python
print("{item} costs {price:.2f} USD".format(item="Keyboard", price=79.5))
```

**Expert Level:** **`str.format_map`** with `collections.defaultdict` for templating **e-commerce** emails with optional fields.

```python
from collections import defaultdict

class SafeDict(dict):
    def __missing__(self, key):
        return "{" + key + "}"

template = "Hi {name}, your {reward} points await."
print(template.format_map(SafeDict(name="Bo")))
```

---

## 2.3.7 f-strings (Formatted String Literals)

### Key Points

- **`f"{expr}"`** evaluates expressions in braces at runtime.
- **`=`** debug specifier (`f"{x=}"`) shows expression text (3.8+).
- Fast and readable — default choice in modern Python.

**Beginner Level:**

```python
city = "Oslo"
temp = 7
print(f"{city} is {temp}°C today")
```

**Intermediate Level:** Format numbers for **bank** statements:

```python
bal = 1234.5
print(f"Balance: ${bal:,.2f}")
```

**Expert Level:** Nested f-strings, custom format specs, and **`datetime`** formatting integrate cleanly; avoid overly complex expressions inside braces — assign to locals first.

```python
from datetime import date

d = date(2026, 3, 28)
print(f"Report as of {d:%Y-%m-%d}")
```

---

## 2.3.8 Escape Sequences

### Key Points

- **`\n` newline, `\t` tab, `\\` backslash, `\'` `\"` quotes**
- **Raw strings** `r"\d"` disable most escapes (except quote escaping).
- Unicode escapes `\uXXXX`, `\UXXXXXXXX`, `\N{name}`.

**Beginner Level:**

```python
print("Line1\nLine2")
```

**Intermediate Level:** Windows paths in regex — raw strings:

```python
path = r"C:\Users\student\data.csv"
```

**Expert Level:** Normalization of Unicode for **international** product titles — combine escapes with **`unicodedata`** in **e-commerce** search pipelines.

```python
print("\u20AC")  # €
```

---

## 2.4.1 Arithmetic Operators

### Key Points

- **`+ - * / // % **`** — `**` is exponentiation.
- **`/`** always float in Python 3; **`//`** floor division.
- **`divmod(a, b)`** returns `(a // b, a % b)`.

**Beginner Level:**

```python
print(7 / 2)   # 3.5
print(7 // 2)  # 3
```

**Intermediate Level:** **Inventory** pack sizes:

```python
cases, loose = divmod(125, 24)
print(cases, loose)  # 5 cases, 5 loose
```

**Expert Level:** **`math.fsum`** for stable float summation in **financial** aggregates; **`Decimal`** for currency.

```python
import math
print(math.fsum([0.1] * 10))
```

---

## 2.4.2 Comparison Operators

### Key Points

- **`< <= > >= == !=`**
- **Chaining**: `a < b < c` equivalent to `a < b and b < c`.
- Rich comparisons delegate to **dunder** methods.

**Beginner Level:**

```python
score = 85
print(60 <= score <= 100)
```

**Intermediate Level:** **Student** grade bands:

```python
def letter_grade(score: int) -> str:
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    return "C"
```

**Expert Level:** **`functools.total_ordering`** or explicit **`__lt__`** for domain objects in **priority queues**.

---

## 2.4.3 Logical Operators

### Key Points

- **`and` `or` `not`**
- **Short-circuit**: `and` stops at first falsy; `or` at first truthy.
- Non-Boolean operands return last evaluated operand (truthiness).

**Beginner Level:**

```python
age = 20
citizen = True
print(age >= 18 and citizen)
```

**Intermediate Level:** Default values with **`or`**:

```python
nickname = input("Nickname: ").strip() or "Anonymous"
```

**Expert Level:** Guard expensive checks:

```python
def is_vip(user) -> bool:
    return user is not None and user.tier == "gold" and user.active
```

---

## 2.4.4 Assignment Operators

### Key Points

- **Augmented**: `+= -= *= /= //= %= **= &= |= ^= >>= <<=`
- **Walrus** `:=` assigns inside expressions (3.8+).
- `:=` cannot replace normal `=` at statement level in all positions.

**Beginner Level:**

```python
count = 0
count += 1
```

**Intermediate Level:**

```python
# Walrus in while loop
lines = []
while (line := input()) != "END":
    lines.append(line)
```

**Expert Level:** Use walrus sparingly for **readability**; in **code review**, reject nested walrus that obscure **e-commerce** tax computation.

```python
if (tax := price * rate) > 0:
    print(f"Tax: {tax:.2f}")
```

---

## 2.4.5 Bitwise Operators

### Key Points

- **`& | ^ ~ << >>`**
- Operate on integers in two’s complement.
- Common for **flags**, **permissions**, **protocols**.

**Beginner Level:**

```python
read = 4
write = 2
perm = read | write
print(perm)  # 6
```

**Intermediate Level:** Test flag:

```python
def can_write(bits: int) -> bool:
    return (bits & 2) != 0
```

**Expert Level:** **IPv4** handling with **`ipaddress`** module instead of manual shifts when possible; bitwise still appears in **serialization** formats.

---

## 2.4.6 Membership Operators

### Key Points

- **`in` / `not in`** test containment.
- For dicts, **`in`** tests **keys**.
- Time complexity depends on container (`set`/`dict` average O(1)).

**Beginner Level:**

```python
if "admin" in {"read", "write", "admin"}:
    print("elevated")
```

**Intermediate Level:** **SKU** lookup:

```python
catalog = {"A1", "B2"}
print("A1" in catalog)
```

**Expert Level:** **`__contains__`** customization; for **large** data, prefer **sets** over lists for membership.

---

## 2.4.7 Identity Operators

### Key Points

- **`is` / `is not`** compare object identity (same memory).
- Use **`is None`**, never `== None`.
- Small ints and interned strings may identity-match — do not rely on that logic.

**Beginner Level:**

```python
a = None
print(a is None)
```

**Intermediate Level:** Singleton **sentinels**:

```python
MISSING = object()

def get_discount(user):
    d = user.get("discount", MISSING)
    if d is MISSING:
        return 0.0
    return float(d)
```

**Expert Level:** **Interning** and **copy** semantics in **caching** layers — identity shortcuts for deduplication of immutable flyweights.

---

## 2.4.8 Precedence and Associativity

### Key Points

- **PEM**DAS-like rules: `**` binds tighter than unary `+ -`, then `* / // %`, then `+ -`.
- Comparisons chain; Boolean `not and or` lowest among Booleans.
- When unsure, **parenthesize**.

**Beginner Level:**

```python
print(1 + 2 * 3)  # 7
```

**Intermediate Level:**

```python
print(not a or b and c)  # clarify with parens in real code
```

**Expert Level:** Document non-obvious precedence in **bank** interest formulas with parentheses even when redundant for compilers — humans read the code.

```python
apr = (nominal / periods + 1) ** periods - 1  # illustrative
```

---

## 2.5.1 Implicit Conversion

### Key Points

- Python coerces in **Boolean context** (`if x:`) using truthiness.
- **`+`** between str requires explicit conversion; **mixed numeric** promotes int→float in arithmetic.
- No implicit str↔int conversion (unlike some languages).

**Beginner Level:**

```python
print(1 + 2.0)  # 3.0 — int promoted to float
```

**Intermediate Level:**

```python
items = [1, 0, [], "text"]
print([bool(x) for x in items])
```

**Expert Level:** **Operator overloading** can define coercion paths in custom numerics — rare in app code, common in scientific libraries.

---

## 2.5.2 Explicit Conversion Overview

### Key Points

- Use **`int` `float` `str` `bool` `list` `tuple` `set`** constructors.
- **Constructors are callables**, not magic syntax.
- Conversions may **lose information** (float→int truncates toward zero unless using `math.floor` patterns).

**Beginner Level:**

```python
s = "42"
n = int(s)
```

**Intermediate Level:** Round-trip **JSON**-like values in **student** forms.

**Expert Level:** **`typing.cast`** for static types only; **`decimal.Decimal(str_value)`** for money ingestion.

---

## 2.5.3 int()

### Key Points

- **`int("FF", 16)`** optional base.
- Truncates float toward zero: `int(3.9) == 3`.
- **`int` unbounded** — arbitrary precision.

**Beginner Level:**

```python
print(int("10"))
```

**Intermediate Level:**

```python
print(int("ff", 16))
```

**Expert Level:** Parsing **bank** integers from localized strings — strip separators first, then `int`.

```python
raw = "1,000,000".replace(",", "")
value = int(raw)
```

---

## 2.5.4 float()

### Key Points

- **`float("inf")`**, **`float("nan")`** special values.
- Binary float cannot represent all decimals exactly.
- Use **`Decimal`** for money rules.

**Beginner Level:**

```python
print(float("3.14"))
```

**Intermediate Level:** **Weather** sensor average:

```python
readings = [20.1, 19.8, 20.0]
print(sum(map(float, readings)) / len(readings))
```

**Expert Level:** **`math.isclose`** for comparisons; never `==` on floats from compounded operations.

```python
import math
print(math.isclose(0.1 + 0.2, 0.3))
```

---

## 2.5.5 str()

### Key Points

- **`str(x)`** calls **`__str__`** for user-facing text.
- **`repr(x)`** debugging representation.
- **`f"{x}"`** uses `str` by default.

**Beginner Level:**

```python
print(str(99))
```

**Intermediate Level:** Build **e-commerce** SKU labels:

```python
sku = 1001
label = "SKU-" + str(sku).zfill(6)
print(label)
```

**Expert Level:** **`__str__` vs `__repr__`** in domain entities; logging often prefers repr for fidelity.

---

## 2.5.6 bool()

### Key Points

- **`bool(x)`** uses truthiness rules.
- **Falsy**: `None`, `False`, `0`, `0.0`, empty containers, empty strings.
- **Truthy**: most other objects.

**Beginner Level:**

```python
print(bool(0), bool(1))
```

**Intermediate Level:** Guard **inventory** quantities:

```python
qty = int(input())
if not qty:
    print("Quantity must be non-zero")
```

**Expert Level:** Custom **`__bool__`** for domain objects — ensure consistency with **`__len__`** if both defined.

---

## 2.5.7 type()

### Key Points

- **`type(obj)`** returns the class.
- **`type(name, bases, dict)`** creates dynamic classes (advanced).
- Prefer **`isinstance`** for interface checks.

**Beginner Level:**

```python
print(type(3), type("hi"))
```

**Intermediate Level:**

```python
data = {"a": 1}
print(type(data))
```

**Expert Level:** Metaclasses and **`type()`** construction appear in frameworks — avoid in **bank** CRUD unless you own the abstraction cost.

---

## 2.5.8 isinstance()

### Key Points

- **`isinstance(obj, (A, B))`** tuple of types allowed.
- Respects **inheritance** and **virtual subclasses** (`abc.register`).
- Better than `type(x) is int` for most checks.

**Beginner Level:**

```python
print(isinstance(3, int))
```

**Intermediate Level:**

```python
def add_to_cart(item):
    if not isinstance(item, dict):
        raise TypeError("item must be dict")
    return item
```

**Expert Level:** **`typing.TYPE_CHECKING`** guards for imports; **`Protocol`** + **`isinstance`** with **`@runtime_checkable`** (use carefully).

```python
from typing import Sequence

def total(nums: Sequence[float]) -> float:
    if not isinstance(nums, Sequence):
        raise TypeError
    return float(sum(nums))
```

---

## 2.6.1 Single-Line Comments

### Key Points

- **`#` to end of line** is a comment.
- **Encoding** comments like `# -*- coding: utf-8 -*-` legacy in Python 2; UTF-8 default in 3.
- Inline comments should be two spaces after code.

**Beginner Level:**

```python
total = 100  # subtotal before tax
```

**Intermediate Level:** Explain **why** a **weather** API field is optional:

```python
wind = data.get("wind_mps")  # older stations omit wind
```

**Expert Level:** Link tickets in comments sparingly; prefer issue trackers + **`TODO(name)`** conventions your team enforces.

---

## 2.6.2 Multi-Line and Block Comments

### Key Points

- Python has **no** `/* */`; use repeated `#` or a **string literal** (docstring-like) discarded if not assigned.
- Triple-quoted strings at module level **are** docstrings if first statement — careful!

**Beginner Level:**

```python
# Line 1 of comment
# Line 2 of comment
x = 1
```

**Intermediate Level:**

```python
"""
Not a docstring if not first — still creates a string object if standalone!
Prefer consecutive # in modules.
"""
```

**Expert Level:** For large commented-out blocks, use **version control** instead of shipping dead code in **production** branches.

---

## 2.6.3 Docstrings

### Key Points

- First string in module/class/function becomes **`__doc__`**.
- **PEP 257** conventions; tools like **Sphinx** parse them.
- Imperative mood for functions: “Return…”, “Compute…”.

**Beginner Level:**

```python
def add(a, b):
    """Return the sum of a and b."""
    return a + b
```

**Intermediate Level:**

```python
class Student:
    """Represent a student row with id and GPA."""

    def __init__(self, student_id: str, gpa: float) -> None:
        self.student_id = student_id
        self.gpa = gpa
```

**Expert Level:** **Google/NumPy** style sections (`Args:`, `Returns:`), **`typing`** in signatures, **`doctest`** examples for **bank** calculation utilities.

---

## 2.6.4 Shebang Lines

### Key Points

- **`#!/usr/bin/env python3`** on Unix marks executable scripts.
- Must be **first line** (with optional UTF-8 comment PEP 263 on line 2 historically).
- Windows ignores shebang unless using a launcher.

**Beginner Level:**

```python
#!/usr/bin/env python3
print("Run me with ./script.py after chmod +x")
```

**Intermediate Level:** Combine with **`if __name__ == "__main__"`** for CLI tools in **inventory** ops.

**Expert Level:** Container **ENTRYPOINT** often calls `python -m pkg.cli` instead of relying on shebang for portability.

---

## 2.6.5 Comment Hygiene and Readability

### Key Points

- Explain **intent** and **invariants**, not obvious code.
- Update comments with code — stale comments are worse than none.
- Keep line length readable (often 88–100 cols).

**Beginner Level:**

```python
# tax rate for default region in 2026
TAX = 0.0825
```

**Intermediate Level:** **E-commerce** promotions:

```python
# BOGO applies only to items tagged "shoes" per marketing rule #4412
```

**Expert Level:** **ADR** (Architecture Decision Records) for big choices; code comments link to ADR IDs.

---

## 2.6.6 When Not to Comment

### Key Points

- If a **better name** removes the need to comment, rename.
- Do not narrate Python syntax to experts.
- Avoid **commented-out code** in mainline branches.

**Beginner Level:** Prefer `hours_until_close` over `h` + comment.

**Intermediate Level:** Replace `# check if vip` with `if user.is_vip:` via method.

**Expert Level:** **Feature flags** instead of giant commented blocks in **bank** releases.

---

## 2.6.7 Docstrings and Tooling

### Key Points

- **`help(func)`** displays docstrings.
- **Sphinx autodoc**, **MkDocstrings** generate sites.
- **pydocstyle** enforces style.

**Beginner Level:**

```python
def c_to_f(c: float) -> float:
    """Convert Celsius to Fahrenheit."""
    return c * 9 / 5 + 32

help(c_to_f)
```

**Intermediate Level:** Module docstring describes **student_mgmt** package scope.

**Expert Level:** Integrate docstrings into **CI** quality gates alongside **mypy** and **ruff**.

---

## 2.6.8 Documentation Parity with README

### Key Points

- **README** explains how to run/install; **docstrings** explain API behavior.
- Keep examples synchronized.
- For CLI tools, **`--help`** text matters as much as README.

**Beginner Level:** README shows `python main.py`; docstrings explain functions inside `main.py`.

**Intermediate Level:** **Weather** project: README documents API keys; module docstring documents rate limits.

**Expert Level:** **OpenAPI** for HTTP services, **changelog** for releases, **runbooks** for ops — beyond comments but part of documentation culture.

---

## Best Practices

- Prefer **f-strings** for formatting; use `.format` when building i18n message tables that need reordering.
- Use **`is None`** and **`is not None`** explicitly; avoid `==` with `None`.
- Validate all **`input()`** before converting; never **`eval`** user strings.
- Learn **operator precedence** or parenthesize; optimize for human readers in **bank** and **retail** code.
- Use **`isinstance`** for type checks in libraries; reserve **`type(x) is int`** for rare exact-type needs.
- Keep **mutable defaults** out of function signatures — use `None` and assign inside.
- Name functions with **verbs**, classes with **nouns**, constants **`UPPER_SNAKE`**.
- Run **formatters** and **linters** continuously; comments cannot fix inconsistent style at scale.
- Treat **float** as approximate; use **`Decimal`** for currency invariants.
- Document public APIs with **docstrings**; link high-level design in **README/ADRs**, not only inline comments.

---

## Common Mistakes to Avoid

- Using **`input`** return value as **`int`** without conversion or try/except.
- Comparing floats with **`==`** after arithmetic.
- **`from module import *`** in application code — pollutes namespace and confuses static tools.
- **Mutable default arguments**: `def f(items=[]):` — shared list across calls.
- Shadowing **builtins** (`list`, `str`, `id`) and then calling them.
- Relying on **`is` for equality** of small integers or strings beyond `None`/`True`/`False`.
- Mixing **tabs and spaces** — causes `TabError` or `IndentationError`.
- Using **backslash continuation** with trailing whitespace — silent syntax surprises.
- Putting **secrets** in comments or **printing** PII to stdout in **production** logs.
- Writing **misleading comments** that diverge from behavior after refactors.

---

## Comparison Cheatsheet

| Topic | Prefer | Avoid |
|-------|--------|-------|
| Formatting | f-strings | Complex `%` |
| None check | `is None` | `== None` |
| Type check | `isinstance` | `type(x)==T` everywhere |
| Money | `Decimal` | `float` |
| Continuation | Parentheses | Trailing `\` |
| User input | Validate + convert | `eval(input())` |

---

*End of Python Basics — you are ready for structured data types.*
