
# Control Flow in Python

Control flow decides *which* code runs and *how often*—the backbone of inventory checks, payment routing, batch jobs, and UI logic.

## 📑 Table of Contents

- [9.1 Conditionals](#91-conditionals)
  - [9.1.1 `if`](#911-if)
  - [9.1.2 `if`-`else`](#912-if-else)
  - [9.1.3 `if`-`elif`-`else`](#913-if-elif-else)
  - [9.1.4 Nested Conditionals](#914-nested-conditionals)
  - [9.1.5 Ternary (Conditional Expression)](#915-ternary-conditional-expression)
- [9.2 `for` Loops](#92-for-loops)
  - [9.2.1 Basics](#921-for-loop-basics)
  - [9.2.2 `range()`](#922-range)
  - [9.2.3 Iterating Collections](#923-iterating-collections)
  - [9.2.4 `enumerate()`](#924-enumerate)
  - [9.2.5 `zip()`](#925-zip)
  - [9.2.6 Nested `for` Loops](#926-nested-for-loops)
  - [9.2.7 `break` / `continue` in `for`](#927-break--continue-in-for)
- [9.3 `while` Loops](#93-while-loops)
  - [9.3.1 Basics](#931-while-loop-basics)
  - [9.3.2 Infinite Loops](#932-infinite-loops)
  - [9.3.3 Loop Conditions](#933-loop-conditions)
  - [9.3.4 Nested `while`](#934-nested-while)
  - [9.3.5 `break` / `continue` in `while`](#935-break--continue-in-while)
  - [9.3.6 `while` … `else`](#936-while--else)
- [9.4 Loop Control](#94-loop-control)
  - [9.4.1 `break`](#941-break)
  - [9.4.2 `continue`](#942-continue)
  - [9.4.3 `pass`](#943-pass)
  - [9.4.4 `else` with Loops](#944-else-with-loops)
  - [9.4.5 Loop Optimization](#945-loop-optimization)
- [9.5 Pattern Matching (3.10+)](#95-pattern-matching-python-310)
  - [9.5.1 `match` / `case` Basics](#951-match--case-basics)
  - [9.5.2 Wildcard Patterns](#952-wildcard-patterns)
  - [9.5.3 OR Patterns (`|`)](#953-or-patterns-)
  - [9.5.4 Guards (`if`)](#954-guards-if)
  - [9.5.5 Structural Pattern Matching](#955-structural-pattern-matching)

---

## 9.1 Conditionals

<a id="91-conditionals"></a>

### 9.1.1 `if`

<a id="911-if"></a>

**Beginner Level**: Use `if` when something should happen only when a condition is true—like skipping checkout when the cart is empty.

**Intermediate Level**: Combine comparisons and membership; short-circuit evaluation means later checks may not run if earlier ones fail.

**Expert Level**: Prefer truthiness carefully with custom objects; document expected types for API boundaries in larger systems.

```python
cart_items = 3
if cart_items > 0:
    print("Proceed to checkout")

balance = 150.0
if balance >= 100:
    print("VIP discount applies")
```

**Key Points**
- Condition must evaluate to a truth value.
- Indentation defines the body (PEP 8: 4 spaces).
- No parentheses required around the condition.

### 9.1.2 `if`-`else`

<a id="912-if-else"></a>

**Beginner Level**: Choose between two paths: approved loan or declined message.

**Intermediate Level**: Use `else` for the complementary branch; keep both branches similar in complexity when possible.

**Expert Level**: In services, structure `else` for observability (metrics/logging) without duplicating heavy work.

```python
age = 20
if age >= 18:
    status = "adult"
else:
    status = "minor"
print(status)
```

**Key Points**
- `else` pairs with the nearest `if` at the same indentation.
- Exactly one branch runs when the `if` is false.

### 9.1.3 `if`-`elif`-`else`

<a id="913-if-elif-else"></a>

**Beginner Level**: Chain many cases: bronze, silver, gold loyalty tiers.

**Intermediate Level**: Order matters: first true `elif` wins; use mutually exclusive ranges or explicit enums.

**Expert Level**: Refactor long chains to dict dispatch or `match` when branches encode types or commands.

```python
points = 750
if points < 500:
    tier = "bronze"
elif points < 1000:
    tier = "silver"
else:
    tier = "gold"
print(tier)
```

**Key Points**
- Unlimited `elif` between `if` and optional `else`.
- Avoid duplicate overlapping conditions.

### 9.1.4 Nested Conditionals

<a id="914-nested-conditionals"></a>

**Beginner Level**: Put an `if` inside another to combine rules: weekend *and* balance sufficient.

**Intermediate Level**: Deep nesting hurts readability; extract boolean helpers (`can_ship()`).

**Expert Level**: Use early returns in functions to flatten logic in HTTP handlers and domain services.

```python
is_weekend = True
balance = 200.0
if is_weekend:
    if balance > 50:
        print("Free express shipping")
    else:
        print("Add funds for express")
else:
    print("Standard rates apply")
```

**Key Points**
- Each level needs consistent indentation.
- Consider guard clauses to reduce depth.

### 9.1.5 Ternary (Conditional Expression)

<a id="915-ternary-conditional-expression"></a>

**Beginner Level**: `x if condition else y` picks one value—label 'In stock' or 'Backordered'.

**Intermediate Level**: Do not nest ternaries; use a small function or `match` for clarity.

**Expert Level**: Ternaries evaluate only the chosen branch (unlike `and/or` tricks).

```python
qty = 0
label = "In stock" if qty > 0 else "Backordered"
fee = 0.0 if qty >= 10 else 5.99
print(label, fee)
```

**Key Points**
- Syntax: `a if cond else b` (not `cond ? a : b`).
- Readable for simple assignments only.


## 9.2 `for` Loops

<a id="92-for-loops"></a>

### 9.2.1 `for` Loop Basics

<a id="921-for-loop-basics"></a>

**Beginner Level**: `for item in iterable` repeats for each element—scan every book in a library list.

**Intermediate Level**: Iterables include lists, tuples, strings, dict views, files, and custom iterators.

**Expert Level**: Prefer iterator protocol compliance in domain objects to integrate with pipelines.

```python
books = ["Python Guide", "Clean Code", "Design Patterns"]
for title in books:
    print("Catalog:", title)
```

**Key Points**
- No C-style `for(;;)`; use `while` or `range` for counting.
- Loop variable leaks in Python (exists after loop).

### 9.2.2 `range()`

<a id="922-range"></a>

**Beginner Level**: `range(stop)`, `range(start, stop)`, `range(start, stop, step)` generates integers for counting shelves.

**Intermediate Level**: `range` is lazy; materialize with `list()` only when needed.

**Expert Level**: Large numeric loops: `range` is memory-efficient vs building lists.

```python
for aisle in range(1, 6):
    print("Stock aisle", aisle)

for i in range(0, 10, 2):
    print(i, end=" ")
print()
```

**Key Points**
- Stop is exclusive.
- Negative steps supported.

### 9.2.3 Iterating Collections

<a id="923-iterating-collections"></a>

**Beginner Level**: Loop lists of employees; loop dict keys, values, or items.

**Intermediate Level**: For sets, order is arbitrary; sort first if deterministic output matters.

**Expert Level**: Use `collections.deque` for FIFO scans in real-time order processing.

```python
emp = {"id": 1, "name": "Asha", "dept": "HR"}
for k, v in emp.items():
    print(k, v)
```

**Key Points**
- `dict` iteration is insertion-ordered (3.7+).
- Avoid mutating container size while iterating over it.

### 9.2.4 `enumerate()`

<a id="924-enumerate"></a>

**Beginner Level**: Get index and value together—numbering invoice lines.

**Intermediate Level**: `enumerate(iterable, start=1)` for human-facing numbering.

**Expert Level**: Use in ETL row processing to attach source line metadata for error reports.

```python
skus = ["SKU1", "SKU2", "SKU3"]
for idx, sku in enumerate(skus, start=1):
    print(f"Line {idx}: {sku}")
```

**Key Points**
- Avoid manual `range(len(x))` when `enumerate` is clearer.
- `start` shifts the counter only, not slicing.

### 9.2.5 `zip()`

<a id="925-zip"></a>

**Beginner Level**: Pair parallel lists: product names with prices for a catalog display.

**Intermediate Level**: `zip` stops at shortest sequence; use `itertools.zip_longest` for padding.

**Expert Level**: Transpose rows to columns when validating CSV batches.

```python
names = ["Laptop", "Mouse"]
prices = [999.0, 29.99]
for n, p in zip(names, prices):
    print(n, p)
```

**Key Points**
- Returns an iterator of tuples.
- Python 3: `zip` is lazy.

### 9.2.6 Nested `for` Loops

<a id="926-nested-for-loops"></a>

**Beginner Level**: Rows and columns: every seat in every row of a theater.

**Intermediate Level**: Complexity grows quickly; profile hot paths.

**Expert Level**: Vectorized libraries or database-side joins often replace heavy nested Python loops.

```python
rows = 2
cols = 3
for r in range(rows):
    for c in range(cols):
        print(f"Seat R{r}-C{c}", end="  ")
    print()
```

**Key Points**
- Inner loop completes for each outer iteration.
- Name loop variables clearly (`row`, `col`).

### 9.2.7 `break` / `continue` in `for`

<a id="927-break--continue-in-for"></a>

**Beginner Level**: `break` exits the loop early when you find the first overdue book.

**Intermediate Level**: `continue` skips to the next item when a row fails validation.

**Expert Level**: `for`/`else` runs if no `break` occurred—useful for search patterns.

```python
balances = [100, -20, 300]
for b in balances:
    if b < 0:
        print("Found negative balance, stop audit")
        break
for b in balances:
    if b < 0:
        continue
    print("OK:", b)
```

**Key Points**
- `break` only exits the innermost loop.
- `continue` skips remainder of current iteration.


## 9.3 `while` Loops

<a id="93-while-loops"></a>

### 9.3.1 `while` Loop Basics

<a id="931-while-loop-basics"></a>

**Beginner Level**: Repeat while a condition holds—withdraw until balance too low or limit reached.

**Intermediate Level**: Ensure progress toward termination to avoid stuck loops.

**Expert Level**: Combine with `time.sleep` in polling workers with backoff strategies.

```python
attempts = 0
while attempts < 3:
    print("Retry payment", attempts + 1)
    attempts += 1
```

**Key Points**
- Condition checked before each iteration.
- Body may not run if condition initially false.

### 9.3.2 Infinite Loops

<a id="932-infinite-loops"></a>

**Beginner Level**: `while True:` for servers reading a queue until shutdown.

**Intermediate Level**: Always include an explicit exit: `break`, return, or exception.

**Expert Level**: Production: tie to signals, health checks, and graceful drain.

```python
cmd = "ping"
while True:
    if cmd == "quit":
        break
    print("Serving request")
    cmd = "quit"
```

**Key Points**
- Use sparingly in application code; prefer structured loops when possible.
- Tests should bound iterations with timeouts.

### 9.3.3 Loop Conditions

<a id="933-loop-conditions"></a>

**Beginner Level**: Combine flags: process while `has_jobs and not shutdown`.

**Intermediate Level**: Avoid mutating condition variables accidentally in threads without locks.

**Expert Level**: Use `asyncio` condition variables for async workers instead of busy `while`.

```python
jobs = 2
shutdown = False
while jobs > 0 and not shutdown:
    print("Processing job", jobs)
    jobs -= 1
```

**Key Points**
- Boolean operators short-circuit.
- Document invariants that must hold each iteration.

### 9.3.4 Nested `while`

<a id="934-nested-while"></a>

**Beginner Level**: Outer menu, inner PIN retries—common in kiosk flows.

**Intermediate Level**: Often clearer as functions with inner `while`.

**Expert Level**: Consider state machines for complex nested flows.

```python
outer = 2
while outer:
    inner = 2
    while inner:
        print("outer", outer, "inner", inner)
        inner -= 1
    outer -= 1
```

**Key Points**
- Each `while` needs its own progress condition.
- Extract to named functions when nesting exceeds two levels.

### 9.3.5 `break` / `continue` in `while`

<a id="935-break--continue-in-while"></a>

**Beginner Level**: `continue` re-checks condition; `break` exits immediately.

**Intermediate Level**: Useful for input validation loops in CLI tools.

**Expert Level**: Pair with logging for security-sensitive retry paths (banking PIN).

```python
pin_ok = False
tries = 0
while tries < 3 and not pin_ok:
    tries += 1
    if tries == 2:
        continue
    pin_ok = True
```

**Key Points**
- `continue` jumps to top of `while` (condition re-evaluated).
- `break` skips `while`’s `else` clause.

### 9.3.6 `while` … `else`

<a id="936-while--else"></a>

**Beginner Level**: Runs when condition becomes false without `break`—signal 'no fraud alerts found'.

**Intermediate Level**: Skips `else` if `break` executed—search-not-found pattern.

**Expert Level**: Document this behavior; many readers find it surprising.

```python
limit = 3
n = 0
while n < limit:
    if n == 10:
        break
    n += 1
else:
    print("Completed without break")
```

**Key Points**
- `else` belongs to the loop, not `if`.
- Prefer explicit flags in team codebases if clarity suffers.


## 9.4 Loop Control

<a id="94-loop-control"></a>

### 9.4.1 `break`

<a id="941-break"></a>

**Beginner Level**: Exit the innermost loop when a match is found in employee search.

**Intermediate Level**: Does not exit `try`/`finally` abruptly—`finally` still runs.

**Expert Level**: In parsers, `break` on sentinel tokens; pair with structured exceptions for errors.

```python
for eid in [101, 102, 103]:
    if eid == 102:
        print("Found", eid)
        break
```

**Key Points**
- Only innermost loop affected.
- Not valid outside a loop (SyntaxError).

### 9.4.2 `continue`

<a id="942-continue"></a>

**Beginner Level**: Skip invalid CSV rows but keep processing the file.

**Intermediate Level**: In `try` blocks, `continue` still runs `finally` of inner constructs as applicable.

**Expert Level**: Use in batch importers with per-row error collection.

```python
rows = [10, -1, 20]
total = 0
for r in rows:
    if r < 0:
        continue
    total += r
print(total)
```

**Key Points**
- Jumps to next iteration.
- Can make loops harder to follow if overused.

### 9.4.3 `pass`

<a id="943-pass"></a>

**Beginner Level**: Placeholder: stub a function or empty class while designing an e-commerce module.

**Intermediate Level**: No-op at runtime; satisfies syntax where a suite is required.

**Expert Level**: Replace with `raise NotImplementedError` when callers must not rely on it.

```python
def future_feature():
    pass

if False:
    pass
else:
    print("real work")
```

**Key Points**
- Different from comment—AST requires a statement.
- Do not use to swallow errors.

### 9.4.4 `else` with Loops

<a id="944-else-with-loops"></a>

**Beginner Level**: `for`/`while` `else` executes if loop finished without `break`.

**Intermediate Level**: Classic prime check pattern; also 'no early exit' validation.

**Expert Level**: Many teams avoid it; document team preference.

```python
for x in [2, 4, 6]:
    if x % 2 != 0:
        break
else:
    print("All even")
```

**Key Points**
- Applies to `for` and `while`.
- Misleading name—think 'no break'.

### 9.4.5 Loop Optimization

<a id="945-loop-optimization"></a>

**Beginner Level**: Fewer iterations and cheaper work inside the body speed up catalog generation.

**Intermediate Level**: Hoist invariants; use local variables; prefer built-ins (`sum`, `any`).

**Expert Level**: Profile with `cProfile`; consider C extensions, NumPy, or DB aggregation for hot paths.

```python
prices = [10, 20, 30]
total = 0
tax_rate = 0.08
for p in prices:
    total += p * (1 + tax_rate)
print(round(total, 2))
```

**Key Points**
- Measure before micro-optimizing.
- Algorithm choice beats constant tweaks.


## 9.5 Pattern Matching (Python 3.10+)

<a id="95-pattern-matching-python-310"></a>

### 9.5.1 `match` / `case` Basics

<a id="951-match--case-basics"></a>

**Beginner Level**: `match value: case pattern:` routes payment methods like card vs wallet.

**Intermediate Level**: Patterns can bind names; order matters like `if`/`elif`.

**Expert Level**: Use for CLI command dispatch replacing long `if` chains.

```python
method = "wallet"
match method:
    case "card":
        print("Process card")
    case "wallet":
        print("Deduct wallet")
    case _:
        print("Unknown")
```

**Key Points**
- Requires Python 3.10+.
- No fall-through between cases.

### 9.5.2 Wildcard Patterns

<a id="952-wildcard-patterns"></a>

**Beginner Level**: `case _:` catches anything else—default branch for unknown SKU categories.

**Intermediate Level**: Wildcard does not bind unless named with `as`.

**Expert Level**: Place `_` last; unreachable cases after it warn in static checkers.

```python
category = "misc"
match category:
    case "electronics":
        print("Warranty rules A")
    case _:
        print("Standard rules")
```

**Key Points**
- `_` is a throwaway pattern name by convention.
- Use explicit patterns before wildcard.

### 9.5.3 OR Patterns (`|`)

<a id="953-or-patterns-"></a>

**Beginner Level**: Match weekend or holiday shipping rules in one case.

**Intermediate Level**: Combine literals and capture patterns carefully.

**Expert Level**: Use for API version compatibility branches.

```python
day = "Sat"
match day:
    case "Sat" | "Sun":
        print("Weekend surcharge")
    case _:
        print("Weekday rate")
```

**Key Points**
- Same variable must bind consistently across OR alternatives.
- Readable alternative to `in ('Sat','Sun')`.

### 9.5.4 Guards (`if`)

<a id="954-guards-if"></a>

**Beginner Level**: Add `if amount > 0` to a case binding `amount` for refund validation.

**Intermediate Level**: Guard evaluated after pattern matches.

**Expert Level**: Express complex invariants without nested `if` inside case body.

```python
txn = ("refund", 50)
match txn:
    case ("refund", amt) if amt > 0:
        print("Refund", amt)
    case _:
        print("Invalid")
```

**Key Points**
- Guards do not catch exceptions from pattern matching.
- Order cases from specific to general.

### 9.5.5 Structural Pattern Matching

<a id="955-structural-pattern-matching"></a>

**Beginner Level**: Match sequences, mappings, and class patterns for event payloads in an order service.

**Intermediate Level**: Extract nested data declaratively; great for ADTs.

**Expert Level**: Combine with dataclasses and `__match_args__` for maintainable domain events.

```python
order = {"id": 42, "items": [1, 2], "total": 99.5}
match order:
    case {"id": oid, "items": items, "total": t} if t > 0:
        print(oid, len(items), t)
    case _:
        print("Bad order shape")
```

**Key Points**
- Mapping patterns match subset of keys.
- Sequence patterns match length and positions.


---

## Cross-cutting control-flow patterns (production-oriented)

### Inventory reservation flow

**Beginner Level**: When a customer checks out, you first verify stock, then charge payment, then mark items reserved—each step is a conditional or loop over cart lines.

**Intermediate Level**: Model the checkout as explicit states (cart → payment → fulfillment) and keep `if`/`for` bodies small so retries and idempotency hooks are easy to add.

**Expert Level**: In distributed inventory, combine optimistic locking with short `while` retry loops and circuit breakers; avoid hidden `for`/`else` in code paths that must be auditable.

```python
def reserve_lines(lines, stock):
    reserved = []
    for sku, qty in lines:
        if stock.get(sku, 0) >= qty:
            stock[sku] -= qty
            reserved.append((sku, qty))
        else:
            return False, reserved, stock
    return True, reserved, stock
```

**Key Points**
- Fail fast when a line cannot be reserved.
- Return enough data to roll back or compensate in larger workflows.

### Banking alert scan

**Beginner Level**: Loop through today's transactions and print an alert when a withdrawal exceeds a limit.

**Intermediate Level**: Use `continue` to skip weekend maintenance rows; use `break` when a fraud rule short-circuits further checks for that account.

**Expert Level**: Stream large files or DB cursors instead of materializing all transactions; pair `for` loops with batch commits and structured logging.

```python
LIMIT = 5000
alerts = []
for txn in [{"amt": 120}, {"amt": 6000}, {"amt": 80}]:
    if txn["amt"] <= LIMIT:
        continue
    alerts.append(txn)
print("Alerts:", len(alerts))
```

**Key Points**
- `continue` keeps throughput high for normal rows.
- Collect alerts instead of printing in real services (emit to queue).

### CLI menu `while` loop (library kiosk)

**Beginner Level**: Show a text menu, read a digit, and repeat until the user quits.

**Intermediate Level**: Validate input with `continue`, centralize exit with `break`, and keep I/O thin so you can unit-test the command parser separately.

**Expert Level**: Add timeouts, audit logging for privileged actions, and structured error codes for integration with campus SSO terminals.

```python
def run_kiosk():
    while True:
        print("1) Search  2) Borrow  q) Quit")
        choice = input("> ").strip().lower()
        if choice == "q":
            break
        if choice not in {"1", "2"}:
            print("Invalid choice")
            continue
        print("OK:", choice)


run_kiosk()
```

**Key Points**
- `input()` blocks—async CLIs need different patterns.
- Keep business rules out of the menu function when the app grows.

---

## Best Practices

- Prefer clarity over cleverness; flatten deeply nested conditionals with helpers.
- Use the right loop: `for` for known iterables, `while` for open-ended processes.
- Document surprising features (`for`/`else`, walrus in conditions) for teammates.
- Add tests for boundary values (0, empty, max) in financial and inventory logic.

---

## Common Mistakes to Avoid

- Mutating a list while iterating over it.
- Off-by-one with `range` stop values.
- Relying on loop `else` without team consensus on readability.
- Infinite `while True` without guaranteed exit in production paths.
