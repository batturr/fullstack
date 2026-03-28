# Query Parameters

## 📑 Table of Contents

- [5.1 Basic Query Parameters](#51-basic-query-parameters)
  - [5.1.1 Defining Query Parameters](#511-defining-query-parameters)
  - [5.1.2 Optional Query Parameters](#512-optional-query-parameters)
  - [5.1.3 Default Values](#513-default-values)
  - [5.1.4 Required Query Parameters](#514-required-query-parameters)
  - [5.1.5 None as Default](#515-none-as-default)
- [5.2 Type Validation](#52-type-validation)
  - [5.2.1 String Query Parameters](#521-string-query-parameters)
  - [5.2.2 Integer Query Parameters](#522-integer-query-parameters)
  - [5.2.3 Float Query Parameters](#523-float-query-parameters)
  - [5.2.4 Boolean Query Parameters](#524-boolean-query-parameters)
  - [5.2.5 List Query Parameters](#525-list-query-parameters)
- [5.3 List Query Parameters (Advanced)](#53-list-query-parameters-advanced)
  - [5.3.1 Multiple Values](#531-multiple-values)
  - [5.3.2 query() Function](#532-query-function)
  - [5.3.3 List with Duplicates](#533-list-with-duplicates)
  - [5.3.4 Set Parameters](#534-set-parameters)
  - [5.3.5 Tuple Parameters](#535-tuple-parameters)
- [5.4 Query Parameter Validation](#54-query-parameter-validation)
  - [5.4.1 min_length and max_length](#541-min_length-and-max_length)
  - [5.4.2 gt, gte, lt, lte](#542-gt-gte-lt-lte)
  - [5.4.3 pattern (Regex)](#543-pattern-regex)
  - [5.4.4 Custom Validation](#544-custom-validation)
  - [5.4.5 Validation Messages](#545-validation-messages)
- [5.5 Query Parameter Examples](#55-query-parameter-examples)
  - [5.5.1 Filtering](#551-filtering)
  - [5.5.2 Pagination (skip, limit)](#552-pagination-skip-limit)
  - [5.5.3 Sorting](#553-sorting)
  - [5.5.4 Searching](#554-searching)
  - [5.5.5 Multiple Filters](#555-multiple-filters)
- [5.6 Documentation and Schema](#56-documentation-and-schema)
  - [5.6.1 Adding Descriptions](#561-adding-descriptions)
  - [5.6.2 Examples](#562-examples)
  - [5.6.3 Deprecated Parameters](#563-deprecated-parameters)
  - [5.6.4 Custom Schema Properties](#564-custom-schema-properties)
  - [5.6.5 OpenAPI Extensions](#565-openapi-extensions)
- [5.7 Advanced Query Patterns](#57-advanced-query-patterns)
  - [5.7.1 Optional vs Required](#571-optional-vs-required)
  - [5.7.2 Query with None](#572-query-with-none)
  - [5.7.3 Combining Query and Path](#573-combining-query-and-path)
  - [5.7.4 Query Best Practices](#574-query-best-practices)
  - [5.7.5 Performance Considerations](#575-performance-considerations)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 5.1 Basic Query Parameters

### 5.1.1 Defining Query Parameters

#### Beginner

Query parameters appear after **`?`** in the URL (`/search?q=fastapi`). In FastAPI, any function parameter **not** matched to the path is treated as a **query** parameter by default. Names map to query keys.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/search")
def search(q: str) -> dict[str, str]:
    return {"q": q}
```

`GET /search?q=hello` → `q="hello"`.

#### Intermediate

FastAPI uses the parameter **name** as the query key. Order in the Python signature does not affect URL parsing. Types drive **coercion** and **422** on failure.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/add")
def add(a: int, b: int) -> dict[str, int]:
    return {"sum": a + b}
```

#### Expert

For explicit metadata, wrap with **`Query()`** inside **`Annotated`**. This becomes important when you need defaults, validation, aliases, or documentation without changing the Python parameter name.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/items")
def items(
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, int]:
    return {"offset": offset, "limit": limit}
```

**Key Points (5.1.1)**

- Non-path parameters default to **query** parameters.
- `Query()` adds validation and OpenAPI details.

**Best Practices (5.1.1)**

- Use **lowercase** snake_case names for query keys in public APIs.
- Document **array** and **boolean** encoding for your clients.

**Common Mistakes (5.1.1)**

- Expecting **JSON** bodies on GET when using only query params (sometimes confused by newcomers).
- Using **reserved** names that collide with framework internals without `alias`.

---

### 5.1.2 Optional Query Parameters

#### Beginner

Make a query parameter optional with a **default value** in Python, e.g. `limit: int = 10`. If the client omits `limit`, FastAPI uses `10`.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/feed")
def feed(limit: int = 10) -> dict[str, int]:
    return {"limit": limit}
```

#### Intermediate

Use **`Optional[str] = None`** when absence means “no filter”. Distinguish **omitted** vs **empty string** if your domain cares.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()


@app.get("/users")
def users(name: Optional[str] = None) -> dict[str, str | None]:
    return {"name_filter": name}
```

#### Expert

**Ellipsis `...` in `Query()`** marks a required query param (see 5.1.4). Optional with `None` pairs well with **dependency** overrides in tests.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/filter")
def filter_x(
    tag: Annotated[Optional[str], Query(description="Tag filter")] = None,
) -> dict[str, str | None]:
    return {"tag": tag}
```

**Key Points (5.1.2)**

- Defaulted parameters are **optional** for clients.
- `None` default models “not provided” when typed as `Optional`.

**Best Practices (5.1.2)**

- Prefer **`Optional[T] = None`** over magic sentinel strings when possible.
- Document whether **`?tag=`** (empty) is allowed.

**Common Mistakes (5.1.2)**

- Using **`Optional[int] = 0`** and losing the ability to tell “omitted” from “zero”.
- Forgetting that **boolean** query parsing has specific accepted strings.

---

### 5.1.3 Default Values

#### Beginner

Defaults in the function signature set the value when the query key is **missing**. They also appear as **defaults** in OpenAPI.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/page")
def page(page: int = 1) -> dict[str, int]:
    return {"page": page}
```

#### Intermediate

`Query(default=...)` can duplicate the default; prefer **one source of truth**—usually the function default—to avoid drift.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/list")
def list_items(
    page: Annotated[int, Query(ge=1)] = 1,
) -> dict[str, int]:
    return {"page": page}
```

#### Expert

**Mutable defaults** (`default=[]`) are still a Python antipattern; use **`default_factory`** in Pydantic models for bodies. For query params, stick to **immutable** defaults or `None` plus internal logic.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/stats")
def stats(window: Annotated[str, Query(pattern="^(1h|24h|7d)$")] = "24h") -> dict[str, str]:
    return {"window": window}
```

**Key Points (5.1.3)**

- Defaults show up in **Swagger** “Try it out”.
- Validate defaults with `Query(..., ge=...)` so even implicit values are legal.

**Best Practices (5.1.3)**

- Align defaults with **database** pagination conventions (`limit=20`).
- Reject **out-of-range** defaults at startup tests if complex.

**Common Mistakes (5.1.3)**

- Setting a **default** that fails **`Query` constraints** (startup may still allow until first request—verify).
- Different defaults in **proxy** vs application.

---

### 5.1.4 Required Query Parameters

#### Beginner

Use **`Query(..., ...)`** with **`...` (Ellipsis)** to require a query parameter. If missing, FastAPI returns **422**.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/echo")
def echo(msg: Annotated[str, Query(...)]) -> dict[str, str]:
    return {"msg": msg}
```

#### Intermediate

Required params can still have **`min_length`**, **`pattern`**, etc. Combine with `...` as the first argument to `Query`.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/token")
def token(t: Annotated[str, Query(..., min_length=8)]) -> dict[str, str]:
    return {"t": t}
```

#### Expert

**Required** query parameters are less common in highly cacheable GETs (CDNs may strip unknown query strings—know your cache rules). For **OAuth** callbacks, required query params are normal.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/cb")
def cb(
    code: Annotated[str, Query(...)],
    state: Annotated[str, Query(...)],
) -> dict[str, str]:
    return {"code": code, "state": state}
```

**Key Points (5.1.4)**

- `Query(...)` means **required**.
- Required query + GET is valid OpenAPI; document client behavior.

**Best Practices (5.1.4)**

- Keep required query keys **stable** across versions.
- Use **validation** to reject blank required strings.

**Common Mistakes (5.1.4)**

- Marking as required but also giving a **Python default** (confusing / invalid patterns).
- Confusing **422 missing** with **401 unauthorized**.

---

### 5.1.5 None as Default

#### Beginner

`Optional[str] = None` means the query param is **not required**. `None` tells your code “no value supplied”.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()


@app.get("/find")
def find(q: Optional[str] = None) -> dict[str, str | None]:
    return {"q": q}
```

#### Intermediate

**Explicit `null`** in query strings is **not** standard—clients usually **omit** the key. Do not rely on `?q=null` unless you define that convention.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()


@app.get("/report")
def report(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> dict[str, str | None]:
    return {"from": from_date, "to": to_date}
```

#### Expert

Use **`Union[str, None]`** or **`str | None`** consistently with Pydantic v2 typing. For **three-state** logic (unset / empty / value), consider a **custom type** or explicit **sentinel** with documented semantics.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/advanced")
def advanced(
    tag: Annotated[Optional[str], Query()] = None,
) -> dict[str, str | None]:
    if tag is None:
        return {"mode": "all"}
    if tag == "":
        return {"mode": "empty_explicit"}
    return {"mode": "filter", "tag": tag}
```

**Key Points (5.1.5)**

- `None` default = optional query param.
- Three-state semantics need **explicit** API design.

**Best Practices (5.1.5)**

- Document **empty string** vs **omitted**.
- In OpenAPI, optional fields are **nullable** only if you model them that way in response schemas—query is separate.

**Common Mistakes (5.1.5)**

- Assuming **`Optional[int] = None`** converts empty string to `None` (it may **422**).
- Using `None` for **required** business fields without validation in handler.

---

## 5.2 Type Validation

### 5.2.1 String Query Parameters

#### Beginner

Declare `str` for textual query values. FastAPI reads the decoded query string component as text.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/hello")
def hello(name: str) -> dict[str, str]:
    return {"name": name}
```

#### Intermediate

Add **`Query(min_length=..., max_length=..., pattern=...)`** for validation without changing the base type.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/nick")
def nick(
    n: Annotated[str, Query(min_length=2, max_length=24, pattern=r"^[a-zA-Z0-9_]+$")],
) -> dict[str, str]:
    return {"nick": n}
```

#### Expert

**Unicode normalization** (NFC) may differ between clients; normalize in a **dependency** if you need stable lookup keys for `str` queries.

```python
import unicodedata
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/uni")
def uni(q: Annotated[str, Query()]) -> dict[str, str]:
    return {"q_norm": unicodedata.normalize("NFC", q)}
```

**Key Points (5.2.1)**

- `str` query params are the default textual type.
- Combine with `Query` constraints for safety.

**Best Practices (5.2.1)**

- Specify **max_length** to mitigate abuse.
- Avoid logging raw **PII** query values.

**Common Mistakes (5.2.1)**

- Confusing **plus** vs **percent** encoding for spaces.
- Expecting JSON **objects** in a single query string without a parser.

---

### 5.2.2 Integer Query Parameters

#### Beginner

`int` query parameters coerce `"42"` → `42`. Non-numeric values → **422**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/id")
def by_id(x: int) -> dict[str, int]:
    return {"x": x}
```

#### Intermediate

Use **`Query(ge=0)`** for offsets and limits. Pair **`gt`** with domain rules (e.g., positive IDs only).

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/page")
def page(
    skip: Annotated[int, Query(ge=0)] = 0,
    take: Annotated[int, Query(ge=1, le=500)] = 50,
) -> dict[str, int]:
    return {"skip": skip, "take": take}
```

#### Expert

Watch **JavaScript** client limits on **JSON integers** in bodies; query integers are strings on the wire and parsed server-side—generally safer for **64-bit** if kept as string until `int` conversion in controlled contexts.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/prime")
def prime(p: Annotated[int, Query(ge=2, le=10_000)]) -> dict[str, int]:
    return {"p": p}
```

**Key Points (5.2.2)**

- Integer parsing errors yield structured **422** responses.
- Bounds on integers prevent absurd pagination.

**Best Practices (5.2.2)**

- Cap **`limit`** aggressively on public APIs.
- Use **`ge=0`** for `skip`/`offset`.

**Common Mistakes (5.2.2)**

- Allowing **`limit=0`** when SQL `LIMIT 0` surprises consumers.
- Using **`int`** for values that exceed **64-bit** in your language runtime.

---

### 5.2.3 Float Query Parameters

#### Beginner

`float` parses decimal query text. Document expected precision for scientific clients.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/latlng")
def latlng(lat: float, lng: float) -> dict[str, float]:
    return {"lat": lat, "lng": lng}
```

#### Intermediate

Use **`Query(ge=..., le=...)`** for lat/lon ranges or probability-like values.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/prob")
def prob(p: Annotated[float, Query(ge=0.0, le=1.0)] = 0.5) -> dict[str, float]:
    return {"p": p}
```

#### Expert

For **money**, prefer **integer minor units** or **`Decimal`** via string query + validation, not binary floats.

```python
from decimal import Decimal
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/price")
def price(amount: Annotated[Decimal, Query(gt=0)]) -> dict[str, str]:
    return {"amount": format(amount, "f")}
```

**Key Points (5.2.3)**

- Float is fine for **physical** measurements; risky for **currency**.
- `Decimal` improves exactness when needed.

**Best Practices (5.2.3)**

- Document **locale** expectations (always use `.` decimal).
- Bound ranges to physically possible values.

**Common Mistakes (5.2.3)**

- Binary float **rounding** in billing.
- Sending **comma** decimals from EU clients without normalization.

---

### 5.2.4 Boolean Query Parameters

#### Beginner

FastAPI accepts several truthy/falsy strings for **bool** query params (`true`, `false`, `1`, `0`, `yes`, `no`—case-insensitive per Starlette conventions). Verify current docs for your version.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/flags")
def flags(debug: bool = False) -> dict[str, bool]:
    return {"debug": debug}
```

#### Intermediate

Because **bool** coercion is special, document **exact** accepted literals for external partners to avoid surprises.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/notify")
def notify(
    send_email: Annotated[bool, Query(description="true/false, 1/0, yes/no")],
) -> dict[str, bool]:
    return {"send_email": send_email}
```

#### Expert

If you need **tri-state** booleans (unset/true/false), use **`Optional[bool] = None`** and document three behaviors.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()


@app.get("/tri")
def tri(enabled: Optional[bool] = None) -> dict[str, str | bool | None]:
    return {"enabled": enabled}
```

**Key Points (5.2.4)**

- Boolean query parsing is **convenience-based**; not JSON `true`/`false` in the query string without parsing as string first.
- Optional bool enables **three states**.

**Best Practices (5.2.4)**

- Publish a **matrix** of accepted tokens in API docs.
- Prefer **explicit enums** for critical feature flags when ambiguity hurts.

**Common Mistakes (5.2.4)**

- Clients sending **`"on"`** from HTML forms expecting bool True.
- Using bool for values that are really **enums**.

---

### 5.2.5 List Query Parameters

#### Beginner

Annotate with **`list[str]`** (or `list[int]`) to accept **repeated** query keys: `?tag=a&tag=b`.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/tags")
def tags(tag: list[str]) -> dict[str, list[str]]:
    return {"tags": tag}
```

#### Intermediate

An **empty list** may mean “no values provided” depending on whether the param was omitted vs repeated—test your OpenAPI client generators.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/ids")
def ids(x: list[int]) -> dict[str, list[int]]:
    return {"ids": x}
```

#### Expert

Use **`Query()`** with list types to add **per-item** validation or **`alias`** for repeated keys in legacy clients.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/multi")
def multi(
    v: Annotated[list[int], Query(ge=1)],
) -> dict[str, list[int]]:
    return {"v": v}
```

**Key Points (5.2.5)**

- Lists map to **repeated** query parameters.
- Validation can apply to **each element**.

**Best Practices (5.2.5)**

- Cap **maximum** number of elements at the application layer if needed.
- Document **CSV** alternatives if you support them (separate pattern).

**Common Mistakes (5.2.5)**

- Expecting **`?tag=a,b`** to become `["a","b"]` without custom parsing.
- Huge lists in URLs hitting **length limits**.

---

## 5.3 List Query Parameters (Advanced)

### 5.3.1 Multiple Values

#### Beginner

Multiple values are sent as **`name=v1&name=v2`**. FastAPI collects them into a Python list.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/colors")
def colors(c: list[str]) -> dict[str, list[str]]:
    return {"colors": c}
```

#### Intermediate

If only **one** value is sent, FastAPI still produces a **single-element** list for `list[T]`.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/one")
def one(x: list[int]) -> dict[str, list[int]]:
    return {"x": x}
```

#### Expert

For **optional** multi-select, use **`list[str] | None = None`** or **`default=None`** with `Query`—verify behavior when key is absent vs present empty.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/opt")
def opt(
    t: Annotated[Optional[list[str]], Query()] = None,
) -> dict[str, list[str] | None]:
    return {"t": t}
```

**Key Points (5.3.1)**

- Repetition encodes **cardinality > 1**.
- Single vs multiple values should be tested per client stack.

**Best Practices (5.3.1)**

- Document **max** selections.
- Consider **POST** + JSON for large multi-filters.

**Common Mistakes (5.3.1)**

- Assuming **order** is preserved across all proxies (usually is, but don’t rely for security).

---

### 5.3.2 query() Function

#### Beginner

Import **`Query`** from `fastapi` to attach metadata and constraints to query parameters inside **`Annotated`**.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/q")
def q(
    term: Annotated[str, Query(min_length=1, title="Search term")],
) -> dict[str, str]:
    return {"term": term}
```

#### Intermediate

`Query` supports **`alias="q"`** when external API must use `q` but Python name is `search_term`.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/search")
def search(
    search_term: Annotated[str, Query(alias="q")],
) -> dict[str, str]:
    return {"search_term": search_term}
```

#### Expert

**`validation_alias` / `serialization_alias`** patterns exist in Pydantic v2 ecosystems; for pure FastAPI query params, `alias` in `Query` is the common approach.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/legacy")
def legacy(
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=200)] = 25,
) -> dict[str, int]:
    return {"page_size": page_size}
```

**Key Points (5.3.2)**

- `Query()` is the query-parameter analogue of `Path()`.
- `alias` bridges **Pythonic** names and **legacy** query keys.

**Best Practices (5.3.2)**

- Prefer **`Annotated`** style in new code.
- Keep **aliases** stable across versions.

**Common Mistakes (5.3.2)**

- Using **`alias`** without updating **client SDKs**.
- Duplicating constraints in **`Query`** and manual handler checks.

---

### 5.3.3 List with Duplicates

#### Beginner

`list[str]` **preserves duplicates** as sent: `?t=a&t=a` → `["a","a"]`.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/dup")
def dup(t: list[str]) -> dict[str, list[str]]:
    return {"t": t}
```

#### Intermediate

If duplicates are invalid, dedupe in code or use **`set`** patterns (see 5.3.4).

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/unique")
def unique(t: list[str]) -> dict[str, list[str]]:
    return {"unique": sorted(set(t))}
```

#### Expert

**Order-sensitive** duplicates matter for ranking features; document whether your API treats lists as **sets** or **bags**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/rank")
def rank(w: list[str]) -> dict[str, list[str]]:
    return {"weights": w}
```

**Key Points (5.3.3)**

- Lists are **multisets** when duplicates allowed.
- Business rules may require **deduping**.

**Best Practices (5.3.3)**

- Validate **unique** constraints explicitly if required.
- Log **counts**, not full lists, if large.

**Common Mistakes (5.3.3)**

- Accidentally deduping when **order** carried meaning.

---

### 5.3.4 Set Parameters

#### Beginner

Use **`set[str]`** (or `set[int]`) if you want **unique** values; order is **not** guaranteed.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/uniq")
def uniq(t: set[str]) -> dict[str, list[str]]:
    return {"tags": sorted(t)}
```

#### Intermediate

OpenAPI may represent this as **array** with **uniqueItems** where supported; verify UIs.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/ids")
def ids(i: set[int]) -> dict[str, list[int]]:
    return {"ids": sorted(i)}
```

#### Expert

If you need **stable order** and uniqueness, accept **`list`** then validate with a **Pydantic** model in a dependency.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class OrderedUniqueTags(BaseModel):
    tags: list[str]

    @field_validator("tags")
    @classmethod
    def unique_preserve_order(cls, v: list[str]) -> list[str]:
        seen: set[str] = set()
        out: list[str] = []
        for x in v:
            if x not in seen:
                seen.add(x)
                out.append(x)
        return out


app = FastAPI()


@app.get("/ordered")
def ordered(t: OrderedUniqueTags) -> dict[str, list[str]]:
    return {"tags": t.tags}
```

**Key Points (5.3.4)**

- `set` enforces **uniqueness**, loses order.
- Custom models combine **order + unique**.

**Best Practices (5.3.4)**

- Return **sorted** lists for deterministic responses.
- Document **case sensitivity** for string sets.

**Common Mistakes (5.3.4)**

- Assuming **set** round-trips order in responses.
- Using **set** when clients need **positional** semantics.

---

### 5.3.5 Tuple Parameters

#### Beginner

**`tuple` types** for query parameters are **uncommon**; lists are typical. Tuples may appear in advanced typing for **fixed-length** sequences.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/pair")
def pair(p: tuple[int, int]) -> dict[str, tuple[int, int]]:
    return {"p": p}
```

#### Intermediate

Prefer **two named query params** (`lat`, `lng`) over opaque tuples for **public** APIs.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/coord")
def coord(lat: float, lng: float) -> dict[str, float]:
    return {"lat": lat, "lng": lng}
```

#### Expert

If integrating **legacy** `?range=1,10` strings, parse with **`str` + validator** rather than tuple typing.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/legacy-range")
def legacy_range(
    range: Annotated[str, Query(pattern=r"^\d+,\d+$")],
) -> dict[str, str]:
    a, b = range.split(",", 1)
    return {"a": a, "b": b}
```

**Key Points (5.3.5)**

- Tuples are niche for query params; explicit params read better.
- Legacy composite strings need **custom parsing**.

**Best Practices (5.3.5)**

- Avoid **tuple** in public schemas unless necessary.
- Prefer **structured** query names.

**Common Mistakes (5.3.5)**

- Expecting **OpenAPI** clarity from nested tuple types.
- Complex parsing in **handlers** without validation helpers.

---

## 5.4 Query Parameter Validation

### 5.4.1 min_length and max_length

#### Beginner

`Query(min_length=1)` rejects empty strings for **required** textual filters.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/s")
def s(term: Annotated[str, Query(min_length=1, max_length=100)]) -> dict[str, str]:
    return {"term": term}
```

#### Intermediate

Works for **`list[str]`** element validation in supported configurations—check FastAPI/Pydantic pairing for your version.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/tags")
def tags(
    t: Annotated[list[str], Query(min_length=1, max_length=3)],
) -> dict[str, list[str]]:
    return {"t": t}
```

#### Expert

**Unicode length** vs **grapheme** count: `min_length` counts Python string length in code points.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/bio")
def bio(
    text: Annotated[str, Query(max_length=280)],
) -> dict[str, str]:
    return {"len": str(len(text))}
```

**Key Points (5.4.1)**

- Length constraints catch **empty** and **overlong** inputs early.
- Lists may validate **per element** depending on typing.

**Best Practices (5.4.1)**

- Align `max_length` with **DB column** sizes.
- Combine with **pattern** for structured tokens.

**Common Mistakes (5.4.1)**

- Using length limits on **int** types (wrong constraint family).
- Ignoring **multibyte** emoji in “280 characters” UX expectations.

---

### 5.4.2 gt, gte, lt, lte

#### Beginner

Numeric `Query` parameters accept **`gt`, `ge`, `lt`, `le`** like `Path`.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/n")
def n(x: Annotated[int, Query(gt=0)]) -> dict[str, int]:
    return {"x": x}
```

#### Intermediate

Apply to **`float`** and **`Decimal`** consistently with your type annotation.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/pct")
def pct(x: Annotated[float, Query(ge=0.0, le=100.0)]) -> dict[str, float]:
    return {"x": x}
```

#### Expert

**OpenAPI** schema reflects inclusive/exclusive bounds where possible; verify client generators interpret **exclusiveMinimum**.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/bucket")
def bucket(
    b: Annotated[int, Query(ge=0, lt=8)],
) -> dict[str, int]:
    return {"bucket": b}
```

**Key Points (5.4.2)**

- Bounds prevent **nonsense** pagination and numeric abuse.
- Exclusive vs inclusive bounds must match **SQL** queries.

**Best Practices (5.4.2)**

- Use **`ge=0`** for offsets.
- Document **inclusive** upper bounds for `limit`.

**Common Mistakes (5.4.2)**

- Off-by-one errors between **`lt`** and **`le`** vs SQL `LIMIT`.

---

### 5.4.3 pattern (Regex)

#### Beginner

`Query(pattern="^...$")` validates string queries with **regex**.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/iso")
def iso(cc: Annotated[str, Query(pattern=r"^[A-Z]{2}$")]) -> dict[str, str]:
    return {"cc": cc}
```

#### Intermediate

Anchor patterns and keep them **simple** to avoid ReDoS.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/sku")
def sku(s: Annotated[str, Query(pattern=r"^[A-Z]{3}-\d{4}$")]) -> dict[str, str]:
    return {"sku": s}
```

#### Expert

Prefer **Enum** when the set is small and **closed**.

```python
from enum import Enum
from typing import Annotated

from fastapi import FastAPI, Query


class SortDir(str, Enum):
    asc = "asc"
    desc = "desc"


app = FastAPI()


@app.get("/sort")
def sort(dir: Annotated[SortDir, Query(alias="direction")]) -> dict[str, str]:
    return {"direction": dir.value}
```

**Key Points (5.4.3)**

- Regex validates **string** queries declaratively.
- Enums sometimes replace regex cleanly.

**Best Practices (5.4.3)**

- Unit-test **edge** strings.
- Document **case sensitivity**.

**Common Mistakes (5.4.3)**

- Overly complex **regex** for simple enumerations.
- Unanchored patterns accepting **partial** junk unexpectedly.

---

### 5.4.4 Custom Validation

#### Beginner

Use a **Pydantic `BaseModel`** as a **dependency** or validate inside the handler after basic types.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class Q(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def must_have_at(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("not an email-like string")
        return v.lower()


app = FastAPI()


@app.get("/notify")
def notify(q: Q) -> dict[str, str]:
    return {"email": q.email}
```

#### Intermediate

For **multiple** query fields, a **`BaseModel`** groups validation cleanly (FastAPI treats simple model fields as query params when used as parameter type).

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field


class Pagination(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=100)


app = FastAPI()


@app.get("/rows")
def rows(p: Pagination) -> dict[str, int]:
    return {"skip": p.skip, "limit": p.limit}
```

#### Expert

Keep **I/O** out of validators; use **`Depends`** services for DB checks returning **404**.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator


class Region(BaseModel):
    code: str

    @field_validator("code")
    @classmethod
    def allowed(cls, v: str) -> str:
        if v.upper() not in {"US", "EU", "APAC"}:
            raise ValueError("unknown region")
        return v.upper()


app = FastAPI()


@app.get("/region")
def region(r: Region) -> dict[str, str]:
    return {"region": r.code}
```

**Key Points (5.4.4)**

- Pydantic models compose multi-query validation.
- Validators should raise **`ValueError`** for 422 semantics.

**Best Practices (5.4.4)**

- Reuse **pagination** models across routes.
- Test **422** payloads in CI.

**Common Mistakes (5.4.4)**

- Raising **`HTTPException`** inside Pydantic validators.
- Mixing **query** and **body** fields in one model incorrectly.

---

### 5.4.5 Validation Messages

#### Beginner

FastAPI/Pydantic return **structured errors** listing `loc`, `type`, and `msg`. Clients should parse these fields.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/age")
def age(a: Annotated[int, Query(ge=0, le=120)]) -> dict[str, int]:
    return {"age": a}
```

#### Intermediate

Customize messages using Pydantic **`Field(..., json_schema_extra)`** or custom **exception handlers** for consistent API error envelopes.

```python
from typing import Annotated

from fastapi import FastAPI, Query
from pydantic import Field

app = FastAPI()


@app.get("/code")
def code(
    c: Annotated[str, Field(pattern=r"^\d{3}$", description="Three-digit code")],
) -> dict[str, str]:
    return {"c": c}
```

#### Expert

**i18n** error messages typically belong in **clients** or a **gateway**; servers return **machine-stable** `type` codes.

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(RequestValidationError)
def validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse({"ok": False, "issues": exc.errors()}, status_code=422)


@app.get("/v")
def v(x: int) -> dict[str, int]:
    return {"x": x}
```

**Key Points (5.4.5)**

- Default 422 bodies are **rich**; wrap them for public APIs if needed.
- Custom handlers centralize **logging** and **metrics**.

**Best Practices (5.4.5)**

- Never leak **stack traces** in validation errors.
- Log **`request_id`** with validation failures.

**Common Mistakes (5.4.5)**

- Changing error shape **without versioning** mobile clients.
- Returning **400** for pure validation when **422** is expected by tooling.

---

## 5.5 Query Parameter Examples

### 5.5.1 Filtering

#### Beginner

Use optional query params as **column filters** for list endpoints.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()
ITEMS = [
    {"id": 1, "cat": "a", "price": 10},
    {"id": 2, "cat": "b", "price": 20},
]


@app.get("/items")
def items(cat: Optional[str] = None, max_price: Optional[int] = None) -> dict:
    rows = ITEMS
    if cat:
        rows = [r for r in rows if r["cat"] == cat]
    if max_price is not None:
        rows = [r for r in rows if r["price"] <= max_price]
    return {"items": rows}
```

#### Intermediate

Validate **enumerated** filters with **`Enum`** query params.

```python
from enum import Enum
from typing import Optional

from fastapi import FastAPI


class Status(str, Enum):
    open = "open"
    done = "done"


app = FastAPI()


@app.get("/tasks")
def tasks(status: Optional[Status] = None) -> dict[str, str | None]:
    return {"status": None if status is None else status.value}
```

#### Expert

Push **filter parsing** into a dependency returning a **SQLAlchemy** `Select` or query builder fragment to keep handlers thin.

```python
from typing import Annotated, Optional

from fastapi import Depends, FastAPI, Query

app = FastAPI()


def filter_clause(
    q: Annotated[Optional[str], Query(description="Full-text-ish filter")] = None,
    min_score: Annotated[Optional[int], Query(ge=0, le=100)] = None,
) -> dict[str, str | int | None]:
    return {"q": q, "min_score": min_score}


@app.get("/search")
def search(f: dict = Depends(filter_clause)) -> dict:
    return {"filters": f}
```

**Key Points (5.5.1)**

- Filters are classic **optional** query params.
- Enum filters reduce **invalid** states.

**Best Practices (5.5.1)**

- Namespace **filter** params consistently (`filter[status]` vs flat `status`—pick one style).
- Index **DB columns** used in filters.

**Common Mistakes (5.5.1)**

- **SQL injection** via string concatenation (use bound parameters).
- Unbounded **result sets** without pagination.

---

### 5.5.2 Pagination (skip, limit)

#### Beginner

`skip` and `limit` (or `page`/`page_size`) are standard query patterns.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/users")
def users(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, int]:
    return {"skip": skip, "limit": limit}
```

#### Intermediate

Convert **page** to **offset** in a dependency: `skip = (page-1)*page_size`.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/page")
def page(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, int]:
    skip = (page - 1) * page_size
    return {"page": page, "page_size": page_size, "skip": skip}
```

#### Expert

**Cursor-based** pagination often uses an **opaque** `cursor` query token instead of offsets for large tables—still expressed as query param.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/feed")
def feed(
    cursor: Annotated[Optional[str], Query(description="Opaque cursor")] = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> dict[str, str | int | None]:
    return {"cursor": cursor, "limit": limit}
```

**Key Points (5.5.2)**

- Always **cap** `limit`.
- Cursor pagination avoids **deep offset** costs.

**Best Practices (5.5.2)**

- Return **`next_cursor`** in response bodies (not only query docs).
- Use **stable sort keys** when paginating.

**Common Mistakes (5.5.2)**

- **`skip`** without **`ORDER BY`** (nondeterministic pages).
- Exposing **internal row IDs** as cursors without encoding.

---

### 5.5.3 Sorting

#### Beginner

Accept **`sort=field`** and **`order=asc|desc`** as query strings.

```python
from typing import Annotated, Literal, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/rows")
def rows(
    sort: Annotated[Optional[str], Query(pattern=r"^(created|name)$")] = "created",
    order: Annotated[Literal["asc", "desc"], Query()] = "asc",
) -> dict[str, str]:
    return {"sort": sort or "created", "order": order}
```

#### Intermediate

**Whitelist** sortable fields in code—never pass user strings directly into **SQL ORDER BY** without a map.

```python
from typing import Annotated, Literal

from fastapi import FastAPI, Query

app = FastAPI()
ALLOWED = {"created_at", "updated_at"}


@app.get("/safe-sort")
def safe_sort(
    by: Annotated[Literal["created_at", "updated_at"], Query(alias="sortBy")],
    dir: Annotated[Literal["asc", "desc"], Query(alias="sortDir")] = "asc",
) -> dict[str, str]:
    assert by in ALLOWED
    return {"by": by, "dir": dir}
```

#### Expert

Multi-column sort can use **repeated** `sort=field:dir` tokens with custom parsing.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/multi-sort")
def multi_sort(
    s: Annotated[list[str], Query(alias="sort", pattern=r"^[a-z_]+:(asc|desc)$")] = [],
) -> dict[str, list[str]]:
    return {"sort": s}
```

**Key Points (5.5.3)**

- Sort params are **high risk** for SQL injection if mishandled.
- Literal/Enum types improve **OpenAPI** clarity.

**Best Practices (5.5.3)**

- Map to **ORM column objects**, not string concatenation.
- Default to a **stable** tie-breaker sort.

**Common Mistakes (5.5.3)**

- Raw **`f"ORDER BY {user_input}"`**.
- Non-deterministic results when **`created_at`** ties.

---

### 5.5.4 Searching

#### Beginner

**`q`** or **`search`** query params carry free text. Apply `min_length` to avoid empty scans.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/search")
def search(
    q: Annotated[str, Query(min_length=1, max_length=200)],
) -> dict[str, str]:
    return {"q": q}
```

#### Intermediate

Combine search with **filters** and **pagination** parameters in one endpoint.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/catalog")
def catalog(
    q: Annotated[Optional[str], Query(max_length=200)] = None,
    brand: Annotated[Optional[str], Query()] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> dict[str, str | int | None]:
    return {"q": q, "brand": brand, "skip": skip, "limit": limit}
```

#### Expert

Offload **full-text** search to **Elasticsearch/OpenSearch** with query params mapping to DSL fragments in a service layer.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/fts")
def fts(
    q: Annotated[Optional[str], Query(description="FTS query")] = None,
    lang: Annotated[Optional[str], Query(pattern=r"^[a-z]{2}$")] = None,
) -> dict[str, str | None]:
    return {"q": q, "lang": lang}
```

**Key Points (5.5.4)**

- Search endpoints benefit from **length limits** and **rate limits**.
- Compose with pagination for **large** corpora.

**Best Practices (5.5.4)**

- Normalize **whitespace**; consider **stemming** in the search engine.
- Avoid **LIKE '%x%'** on unindexed columns at scale.

**Common Mistakes (5.5.4)**

- No **timeout** on expensive search queries.
- Logging **full** search strings containing secrets.

---

### 5.5.5 Multiple Filters

#### Beginner

Several optional query params **AND** together in typical designs.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()


@app.get("/orders")
def orders(
    user: Optional[str] = None,
    status: Optional[str] = None,
    min_total: Optional[int] = None,
) -> dict[str, str | int | None]:
    return {"user": user, "status": status, "min_total": min_total}
```

#### Intermediate

**Repeated** keys express **OR** within one dimension (e.g., multiple statuses) while other params **AND**.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/mix")
def mix(
    status: Annotated[Optional[list[str]], Query()] = None,
    region: Annotated[Optional[str], Query()] = None,
) -> dict[str, list[str] | str | None]:
    return {"status": status or [], "region": region}
```

#### Expert

Complex filters may move to **POST** + JSON body (`/search` resource) while keeping **simple** GET filters for cacheable reads.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/simple")
def simple(tag: str | None = None) -> dict[str, str | None]:
    return {"tag": tag}
```

**Key Points (5.5.5)**

- Combine filters thoughtfully; document **AND/OR** rules.
- POST search when **query string** limits bite.

**Best Practices (5.5.5)**

- Offer a **filter DSL** only when necessary; complexity costs support time.
- Test **combinatorial** edge cases in integration tests.

**Common Mistakes (5.5.5)**

- Ambiguous precedence between **OR** groups.
- **Cache poisoning** via filter permutations.

---

## 5.6 Documentation and Schema

### 5.6.1 Adding Descriptions

#### Beginner

`Query(description="...")` documents parameters in **Swagger UI** / **ReDoc**.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/items")
def items(
    q: Annotated[str, Query(description="Full-text filter over title and body")],
) -> dict[str, str]:
    return {"q": q}
```

#### Intermediate

Use **`title`** for short labels and **`description`** for longer guidance.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/metrics")
def metrics(
    window: Annotated[
        str,
        Query(title="Time window", description="One of: 1h, 24h, 7d, 30d."),
    ] = "24h",
) -> dict[str, str]:
    return {"window": window}
```

#### Expert

For **internal** vs **external** docs, generate different OpenAPI via **separate apps** or **route metadata** filtering.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/public")
def public(
    tenant: Annotated[str, Query(description="Tenant slug visible to integrators")],
) -> dict[str, str]:
    return {"tenant": tenant}
```

**Key Points (5.6.1)**

- Good descriptions reduce **support** tickets.
- Titles help **compact** UI displays.

**Best Practices (5.6.1)**

- Mention **units** (seconds vs milliseconds).
- Link to **extended** docs where helpful.

**Common Mistakes (5.6.1)**

- **Stale** descriptions after validation rules change.
- **Essay-length** text in `title`.

---

### 5.6.2 Examples

#### Beginner

`Query(example="...")` sets a sample in OpenAPI for interactive docs.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/zip")
def zip_code(
    z: Annotated[str, Query(pattern=r"^\d{5}$", example="94107")],
) -> dict[str, str]:
    return {"zip": z}
```

#### Intermediate

Examples should **satisfy** validation constraints.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/page")
def page(
    p: Annotated[int, Query(ge=1, example=3)] = 1,
) -> dict[str, int]:
    return {"page": p}
```

#### Expert

Use **`json_schema_extra`** on Pydantic `Field` when integrating advanced **examples** objects (multiple media types) where supported.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/ex")
def ex(
    x: Annotated[str, Query(json_schema_extra={"examples": ["a", "b"]})] = "a",
) -> dict[str, str]:
    return {"x": x}
```

**Key Points (5.6.2)**

- Examples improve **Try it out** ergonomics.
- Invalid examples confuse **SDK** users.

**Best Practices (5.6.2)**

- Rotate examples away from **real** customer data.
- Keep examples **minimal** but realistic.

**Common Mistakes (5.6.2)**

- Example **violates** `pattern`.
- Examples that encourage **insecure** practices (`password=123456`).

---

### 5.6.3 Deprecated Parameters

#### Beginner

Mark legacy query keys with **`Query(deprecated=True)`** so UIs show **strikethrough** warnings.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/legacy")
def legacy(
    old: Annotated[Optional[str], Query(deprecated=True, description="Use `q`")] = None,
    q: Annotated[Optional[str], Query()] = None,
) -> dict[str, str | None]:
    return {"q": q or old}
```

#### Intermediate

Maintain **both** params during migration windows; log usage of deprecated keys.

```python
import logging
from typing import Annotated, Optional

from fastapi import FastAPI, Query

log = logging.getLogger(__name__)
app = FastAPI()


@app.get("/migrate")
def migrate(
    pageSize: Annotated[Optional[int], Query(deprecated=True, alias="pageSize")] = None,
    page_size: Annotated[Optional[int], Query()] = None,
) -> dict[str, int | None]:
    ps = page_size if page_size is not None else pageSize
    if pageSize is not None:
        log.warning("deprecated query pageSize used")
    return {"page_size": ps}
```

#### Expert

Coordinate deprecation with **semantic versioning** and **changelog** entries; remove after telemetry shows near-zero use.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/v2/things")
def things_v2(
    filter_x: Annotated[Optional[str], Query(deprecated=True)] = None,
    filter: Annotated[Optional[str], Query()] = None,
) -> dict[str, str | None]:
    return {"filter": filter or filter_x}
```

**Key Points (5.6.3)**

- `deprecated=True` signals **migration** in docs.
- Support **dual** params during transitions.

**Best Practices (5.6.3)**

- Set **sunset** dates in human docs.
- Monitor **metrics** on deprecated usage.

**Common Mistakes (5.6.3)**

- Removing deprecated params **without** a major version bump policy.
- Marking deprecated but **not** implementing the new param.

---

### 5.6.4 Custom Schema Properties

#### Beginner

Attach extra JSON Schema keys via **`json_schema_extra`** on `Query` or Pydantic `Field`.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/x")
def x(
    code: Annotated[str, Query(json_schema_extra={"x-visibility": "public"})],
) -> dict[str, str]:
    return {"code": code}
```

#### Intermediate

Corporate **API portals** sometimes require **`x-*`** extensions for ownership metadata.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/owned")
def owned(
    team: Annotated[
        str,
        Query(json_schema_extra={"x-owner-team": "billing", "x-tier": "gold"}),
    ],
) -> dict[str, str]:
    return {"team": team}
```

#### Expert

Validate **`openapi.json`** snapshots in CI when customizing schema—unexpected stripping may occur across upgrades.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/snap")
def snap(
    z: Annotated[int, Query(json_schema_extra={"x-metric": "counter"})] = 0,
) -> dict[str, int]:
    return {"z": z}
```

**Key Points (5.6.4)**

- `json_schema_extra` extends machine-readable **metadata**.
- Custom properties may be **ignored** by generic clients.

**Best Practices (5.6.4)**

- Namespace **`x-`** keys per org standards.
- Document extensions for **gateway** teams.

**Common Mistakes (5.6.4)**

- Relying on **`x-*`** for **authorization** (use real auth).
- Breaking **codegen** with invalid schema.

---

### 5.6.5 OpenAPI Extensions

#### Beginner

OpenAPI allows **`x-` prefixed** extension fields at various levels; query param schema is one attachment point.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/ext")
def ext(
    p: Annotated[str, Query(json_schema_extra={"x-codegen": {"name": "projectId"}})],
) -> dict[str, str]:
    return {"p": p}
```

#### Intermediate

Global extensions appear via **`openapi_tags`**, **`responses`**, or custom **`get_openapi`** overrides.

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI()


def custom_openapi() -> dict:
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version="1.0.0",
        routes=app.routes,
    )
    schema.setdefault("x-company", {})["contact"] = "api-team@example.com"
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi  # type: ignore[method-assign]


@app.get("/ping")
def ping() -> dict[str, str]:
    return {"ping": "pong"}
```

#### Expert

**Multiple OpenAPI documents** (public/internal) can be served from different **sub-apps** mounted under prefixes.

```python
from fastapi import FastAPI

public = FastAPI()
internal = FastAPI()


@public.get("/hi")
def hi() -> dict[str, str]:
    return {"scope": "public"}


@internal.get("/diag")
def diag() -> dict[str, str]:
    return {"scope": "internal"}


root = FastAPI()
root.mount("/public", public)
root.mount("/internal", internal)
```

**Key Points (5.6.5)**

- Extensions integrate with **enterprise** tooling.
- Custom `openapi()` enables **global** `x-` metadata.

**Best Practices (5.6.5)**

- Version your **OpenAPI** alongside API releases.
- Automate **diffs** on schema changes in PRs.

**Common Mistakes (5.6.5)**

- Forking **`get_openapi`** without calling **super** patterns correctly on upgrades.
- **Huge** `x-` blobs bloating `openapi.json`.

---

## 5.7 Advanced Query Patterns

### 5.7.1 Optional vs Required

#### Beginner

**Optional** = has a default or `None`. **Required** = `Query(...)` with ellipsis and no default.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/mix")
def mix(
    a: Annotated[str, Query(...)],
    b: Annotated[Optional[str], Query()] = None,
) -> dict[str, str | None]:
    return {"a": a, "b": b}
```

#### Intermediate

**Required** lists: `list[str]` might be empty if allowed—control with **`min_length`** on `Query`.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/need-tags")
def need_tags(tags: Annotated[list[str], Query(min_length=1)]) -> dict[str, list[str]]:
    return {"tags": tags}
```

#### Expert

**OAuth2** flows mix required and optional query params—mirror the **RFC** parameter requirements exactly.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/oauth/cb")
def oauth_cb(
    code: Annotated[str, Query(...)],
    state: Annotated[Optional[str], Query()] = None,
) -> dict[str, str | None]:
    return {"code": code, "state": state}
```

**Key Points (5.7.1)**

- Explicit required vs optional improves **OpenAPI** accuracy.
- Lists have nuanced **empty** semantics.

**Best Practices (5.7.1)**

- Minimize **required** query params on cacheable GETs.
- Document **defaults** clearly.

**Common Mistakes (5.7.1)**

- Conflicting **`...`** with Python **defaults**.
- Treating **empty list** as **missing filter**.

---

### 5.7.2 Query with None

#### Beginner

`Optional[T] = None` means the client can omit the parameter; your function receives **`None`**.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()


@app.get("/maybe")
def maybe(x: Optional[int] = None) -> dict[str, int | None]:
    return {"x": x}
```

#### Intermediate

Distinguish **`None`** from **default business value** by using **`Union`** with **`Literal`** sentinels if truly needed.

```python
from typing import Literal, Optional, Union

from fastapi import FastAPI

app = FastAPI()


@app.get("/tri-int")
def tri_int(
    n: Optional[Union[int, Literal["default"]]] = "default",
) -> dict[str, int | str | None]:
    return {"n": n}
```

#### Expert

**Nullable** query parameters in OpenAPI may require explicit `Query()` metadata in some versions—test generated schema.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/nullish")
def nullish(
    v: Annotated[Optional[str], Query(description="Omit or provide string")] = None,
) -> dict[str, str | None]:
    return {"v": v}
```

**Key Points (5.7.2)**

- `None` models **absence** cleanly in Python.
- Exotic tri-state needs **explicit** contracts.

**Best Practices (5.7.2)**

- Prefer **`Optional`** over magic strings when possible.
- Test **omitted** vs **empty** vs **valid**.

**Common Mistakes (5.7.2)**

- Using **`None`** defaults for **required** business fields by accident.
- JSON **`null`** in query strings—nonstandard.

---

### 5.7.3 Combining Query and Path

#### Beginner

Path parameters identify the **resource**; query parameters refine the **view** (filters, pagination).

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/users/{user_id}/posts")
def posts(
    user_id: int,
    published: Optional[bool] = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> dict[str, int | bool | None]:
    return {"user_id": user_id, "published": published, "limit": limit}
```

#### Intermediate

Keep **required** identifiers in the **path**; keep **optional** modifiers in **query**.

```python
from typing import Annotated, Optional

from fastapi import FastAPI, Path, Query

app = FastAPI()


@app.get("/orgs/{org_id}/members")
def members(
    org_id: Annotated[int, Path(gt=0)],
    role: Optional[str] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
) -> dict[str, int | str | None]:
    return {"org_id": org_id, "role": role, "skip": skip}
```

#### Expert

**HATEOAS** links often embed path ids while leaving **query** for **state**—design link builders accordingly.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
def item(item_id: int, expand: str | None = None) -> dict[str, int | str | None]:
    return {"item_id": item_id, "expand": expand}
```

**Key Points (5.7.3)**

- Path = **identity**, query = **options**.
- Mixed signatures are idiomatic FastAPI.

**Best Practices (5.7.3)**

- Avoid duplicating the same data in **path and query**.
- Cache **GET** combinations that are safe and common.

**Common Mistakes (5.7.3)**

- Putting **optional** resource selectors only in query without a **list** route.
- **Ambiguous** routes when static segments conflict (see Topic 4).

---

### 5.7.4 Query Best Practices

#### Beginner

Use **consistent naming** (`snake_case` vs `camelCase`) and document the choice; `alias` bridges gaps.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/ok")
def ok(
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
) -> dict[str, int]:
    return {"page_size": page_size}
```

#### Intermediate

Apply **rate limiting** and **payload size** limits at gateway for query-heavy endpoints.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/public-search")
def public_search(q: str) -> dict[str, str]:
    return {"q": q}
```

#### Expert

Emit **metrics** with **low-cardinality** labels—bucket query param names, do not use raw values as metric tags.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/metrics-friendly")
def mf(
    kind: Annotated[str, Query(pattern=r"^(user|post|comment)$")],
) -> dict[str, str]:
    return {"kind": kind}
```

**Key Points (5.7.4)**

- Consistency beats cleverness for **public** APIs.
- Observability should avoid **cardinality explosions**.

**Best Practices (5.7.4)**

- Version breaking **query** changes carefully.
- Provide **OpenAPI** + **examples** for every public GET.

**Common Mistakes (5.7.4)**

- Undocumented **boolean** encodings.
- **Breaking** rename of query keys without deprecation.

---

### 5.7.5 Performance Considerations

#### Beginner

Long query strings cost **parsing** and **logging**; keep URLs reasonably short.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/heavy")
def heavy(q: str) -> dict[str, int]:
    return {"len": len(q)}
```

#### Intermediate

**Indexes** must align with **filter** params; otherwise queries scan tables.

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/by-status")
def by_status(
    status: Annotated[str, Query()],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> dict[str, str | int]:
    return {"status": status, "skip": skip, "limit": limit}
```

#### Expert

**CDN caching** keys must include **vary** headers and **normalized** query ordering—some caches sort query params; yours may not.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/cache-demo")
def cache_demo(response: Response, v: str = "1") -> dict[str, str]:
    response.headers["Cache-Control"] = "public, max-age=60"
    return {"v": v}
```

**Key Points (5.7.5)**

- Query parsing is cheap; **database work** dominates.
- CDNs interact oddly with **auth** query tokens—prefer **headers**.

**Best Practices (5.7.5)**

- Add **database timeouts** and **statement timeouts**.
- Use **read replicas** for heavy **GET** search if needed.

**Common Mistakes (5.7.5)**

- **N+1** queries triggered by list endpoints with **expand** params.
- Logging **entire** URLs with secrets in query.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- Query parameters refine **GET** (and other) operations without changing the path **resource identity**.
- **`Query()`** supplies validation, aliases, deprecation, and documentation metadata.
- **Lists** use repeated keys; **`set`** enforces uniqueness without order guarantees.
- Combine **path + query** so IDs live in the path and **options** in the query.
- OpenAPI documents query schema; **`examples`** and **`deprecated`** ease migrations.

### Chapter Best Practices

- Cap **`limit`**, validate **pagination**, and whitelist **sort** fields.
- Document **boolean** and **list** encoding for every public client surface.
- Centralize complex **filter** logic in **dependencies** or services.
- Snapshot-test **`openapi.json`** when using **custom schema** extensions.
- Monitor **422** rates and **latency** on search endpoints.

### Chapter Common Mistakes

- SQL **injection** via **sort** or **filter** strings.
- **Unbounded** result sets and **deep offsets** on large tables.
- Treating **`?flag=`** the same as **omitted** without documentation.
- **camelCase** vs **snake_case** mismatches without **`alias`**.
- Putting **secrets** in query strings (logs, referrers, browser history).

---

*End of Query Parameters notes (Topic 5).*
