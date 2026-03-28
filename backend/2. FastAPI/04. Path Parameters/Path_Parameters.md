# Path Parameters

## 📑 Table of Contents

- [4.1 Basic Path Parameters](#41-basic-path-parameters)
  - [4.1.1 Defining Path Parameters](#411-defining-path-parameters)
  - [4.1.2 Parameter Types](#412-parameter-types)
  - [4.1.3 Multiple Path Parameters](#413-multiple-path-parameters)
  - [4.1.4 Parameter Order](#414-parameter-order)
  - [4.1.5 Required Parameters](#415-required-parameters)
- [4.2 Type Validation](#42-type-validation)
  - [4.2.1 String Parameters](#421-string-parameters)
  - [4.2.2 Integer Parameters](#422-integer-parameters)
  - [4.2.3 Float Parameters](#423-float-parameters)
  - [4.2.4 UUID Parameters](#424-uuid-parameters)
  - [4.2.5 Datetime Parameters](#425-datetime-parameters)
- [4.3 Predefined Values](#43-predefined-values)
  - [4.3.1 Enum Classes](#431-enum-classes)
  - [4.3.2 Valid Path Values](#432-valid-path-values)
  - [4.3.3 Validation with Enums](#433-validation-with-enums)
  - [4.3.4 String Enums](#434-string-enums)
  - [4.3.5 Integer Enums](#435-integer-enums)
- [4.4 Path Validation](#44-path-validation)
  - [4.4.1 gt, gte, lt, lte Parameters](#441-gt-gte-lt-lte-parameters)
  - [4.4.2 min_length and max_length](#442-min_length-and-max_length)
  - [4.4.3 pattern (Regex Validation)](#443-pattern-regex-validation)
  - [4.4.4 Validation Examples](#444-validation-examples)
  - [4.4.5 Custom Validators](#445-custom-validators)
- [4.5 Advanced Path Patterns](#45-advanced-path-patterns)
  - [4.5.1 Path Parameter Types](#451-path-parameter-types)
  - [4.5.2 File Paths](#452-file-paths)
  - [4.5.3 Regular Expressions in Paths](#453-regular-expressions-in-paths)
  - [4.5.4 Conflicting Paths](#454-conflicting-paths)
  - [4.5.5 Path Parameter Best Practices](#455-path-parameter-best-practices)
- [4.6 Documentation](#46-documentation)
  - [4.6.1 Adding Descriptions](#461-adding-descriptions)
  - [4.6.2 Parameter Examples](#462-parameter-examples)
  - [4.6.3 Swagger Annotations](#463-swagger-annotations)
  - [4.6.4 Documentation from Docstrings](#464-documentation-from-docstrings)
  - [4.6.5 Custom Schema](#465-custom-schema)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 4.1 Basic Path Parameters

### 4.1.1 Defining Path Parameters

#### Beginner

Path parameters are **dynamic segments** in the URL. You declare them as function parameters with the **same name** as the placeholder inside `{curly braces}` in the route path. FastAPI extracts the substring from the URL and passes it into your function.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
def read_item(item_id: str) -> dict[str, str]:
    return {"item_id": item_id}
```

A request to `GET /items/42` calls `read_item` with `item_id="42"` (still a string until you add a numeric type).

#### Intermediate

FastAPI builds an **OpenAPI path template** like `/items/{item_id}` and registers a **converter** based on your Python type annotation. The framework uses Starlette routing underneath; validation runs **before** your endpoint executes, so invalid types yield **422 Unprocessable Entity** with a structured error body.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/users/{user_id}")
def get_user(user_id: int) -> dict[str, int]:
    return {"user_id": user_id}
```

#### Expert

Internally, FastAPI inspects the signature with `inspect.signature` and matches path params to **dependant** metadata. Custom types can implement `__get_validators__` (Pydantic v1 style) or use Pydantic v2 **annotated metadata**; for standard library types, the generated JSON Schema uses **OpenAPI 3** `path` parameters. Consider **trailing slashes** and **case sensitivity** at the reverse-proxy layer (nginx) separately from FastAPI’s own routing.

```python
from __future__ import annotations

from fastapi import FastAPI

app = FastAPI()


@app.get("/resources/{resource_id}")
def resource(resource_id: str) -> dict[str, str]:
    # resource_id is always str from path; cast/validate further if needed
    return {"resource_id": resource_id, "normalized": resource_id.lower()}
```

**Key Points (4.1.1)**

- Path params use `{name}` in the route string and matching parameter names in the function.
- Types on parameters drive parsing and automatic API documentation.

**Best Practices (4.1.1)**

- Prefer **int** or **UUID** identifiers over plain strings when they truly identify resources.
- Keep path segment names **stable**; renaming breaks clients.

**Common Mistakes (4.1.1)**

- Mismatched names between `{item_id}` and `def read(it_id: str)` (FastAPI will not bind correctly).
- Expecting JSON bodies from a **GET** with only path params (bodies on GET are discouraged and often stripped by proxies).

---

### 4.1.2 Parameter Types

#### Beginner

You choose a Python type for each path parameter. FastAPI tries to **convert** the URL text into that type. If conversion fails, the client receives a validation error instead of hitting your code with bad data.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/demo/{n}")
def demo(n: int) -> dict[str, int]:
    return {"doubled": n * 2}
```

#### Intermediate

Supported types include `str`, `int`, `float`, `bool`, `UUID`, `datetime`, `date`, `Decimal`, and Pydantic types. **bool** is quirky: Starlette/FastAPI treat `"true"`, `"1"`, `"yes"` (case-insensitive) as true—document this for API consumers.

```python
from datetime import date
from fastapi import FastAPI

app = FastAPI()


@app.get("/events/{on_date}")
def events_on(on_date: date) -> dict[str, str]:
    return {"date": on_date.isoformat()}
```

#### Expert

For **custom types**, wrap validation in Pydantic models used as path parameter types (via `BaseModel` and field constraints) or use **`Annotated`** with `Path()` metadata. Remember path values are **strings at the wire**; coercion happens in the validation layer, and **locale** must not affect server parsing (always use ISO formats for dates).

```python
from typing import Annotated
from uuid import UUID

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/assets/{asset_uuid}")
def asset(asset_uuid: Annotated[UUID, Path(description="Asset UUID")]) -> dict[str, str]:
    return {"asset_uuid": str(asset_uuid)}
```

**Key Points (4.1.2)**

- Type annotations are not just hints; they define runtime validation.
- Exotic types may need explicit `Path(...)` metadata for docs.

**Best Practices (4.1.2)**

- Use **`UUID`** for opaque IDs when your storage uses UUIDs.
- Avoid **`bool`** in paths unless the semantics are obvious.

**Common Mistakes (4.1.2)**

- Using **`list`** directly as a path parameter type (lists belong in query or body).
- Assuming **`float`** path segments never carry precision surprises (very long decimals).

---

### 4.1.3 Multiple Path Parameters

#### Beginner

You can declare **several** `{placeholders}` in one path. Each needs a corresponding function parameter. FastAPI fills them **left to right** from the URL.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/orgs/{org_id}/projects/{project_id}")
def project(org_id: int, project_id: int) -> dict[str, int]:
    return {"org_id": org_id, "project_id": project_id}
```

#### Intermediate

Multi-segment paths express **hierarchy**: organizations own projects, repositories own issues. This mirrors **RESTful** resource nesting. Validation is **per parameter**; one bad segment fails the whole request.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/v1/namespaces/{ns}/pods/{name}")
def k8s_style(ns: str, name: str) -> dict[str, str]:
    return {"namespace": ns, "pod": name}
```

#### Expert

Deep paths affect **cache keys** and **CDN** rules. For internal microservices, consider **flat** paths with composite IDs if nesting complicates routing tables. OpenAPI still documents each segment separately; tools like **API gateways** may rewrite paths—keep param names consistent across environments.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/a/{a}/b/{b}/c/{c}")
def deep(a: int, b: int, c: int) -> dict[str, int]:
    return {"sum": a + b + c}
```

**Key Points (4.1.3)**

- Each `{segment}` maps to one typed parameter.
- Hierarchical URLs improve readability for humans.

**Best Practices (4.1.3)**

- Limit depth to what reflects your **domain model**, not your database joins.
- Use **consistent pluralization** (`/users/{id}` vs `/user/{id}`) team-wide.

**Common Mistakes (4.1.3)**

- Duplicating parameter names in the same path template.
- Confusing **path** params with **query** params when the same name appears in both.

---

### 4.1.4 Parameter Order

#### Beginner

In Python, **keyword arguments** and type annotations mean you can write function parameters in **any order** as long as names match path placeholders. FastAPI binds by **name**, not position.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/x/{b}/y/{a}")
def ordered(a: int, b: int) -> dict[str, int]:
    return {"a": a, "b": b}
```

#### Intermediate

Order **does** matter for parameters with **defaults** mixed with required ones: Python rules apply—required parameters before optional ones unless you use `*`/`**` patterns. Path parameters are typically **required** and should appear before query params with defaults.

```python
from typing import Optional

from fastapi import FastAPI

app = FastAPI()


@app.get("/files/{file_id}")
def file_meta(file_id: str, detail: Optional[str] = None) -> dict[str, str | None]:
    return {"file_id": file_id, "detail": detail}
```

#### Expert

When combining **`Depends`**, path, query, and body parameters, FastAPI’s dependency injection resolves **`Depends` parameters first** in a defined order, then simple parameters. Heavy use of `Depends` with the same parameter names as path variables can confuse readers—prefer distinct names for dependencies.

```python
from fastapi import Depends, FastAPI

app = FastAPI()


def prefix() -> str:
    return "item-"


@app.get("/items/{item_id}")
def read_item(item_id: str, p: str = Depends(prefix)) -> dict[str, str]:
    return {"id": item_id, "prefix": p}
```

**Key Points (4.1.4)**

- Path binding is **by name**; Python signature order is flexible for path-only endpoints.
- Mixing defaults follows normal Python rules.

**Best Practices (4.1.4)**

- Order parameters **logically** for readers: path, then query, then body, then `Depends`.
- Avoid duplicate parameter names across injection sources.

**Common Mistakes (4.1.4)**

- Putting optional query params **before** required path params without defaults (Python `SyntaxError`).
- Relying on parameter order for documentation clarity when names are cryptic.

---

### 4.1.5 Required Parameters

#### Beginner

Path parameters are **required by default**: every `{placeholder}` must be present in the URL. There is no `Optional` path segment in standard OpenAPI—if a value can be missing, use **query parameters** or multiple routes.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/must/{x}")
def must_have(x: str) -> dict[str, str]:
    return {"x": x}
```

#### Intermediate

Using `Optional[str] = None` for a path parameter does **not** make the segment optional in the URL template; it still must match the route. To model optional pieces, define **`/items` and `/items/{item_id}`** as two separate operations.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items")
def list_items() -> dict[str, str]:
    return {"mode": "list"}


@app.get("/items/{item_id}")
def get_item(item_id: int) -> dict[str, int]:
    return {"item_id": item_id}
```

#### Expert

Some frameworks allow **catch-all** paths; in FastAPI you emulate optional tail segments with **path converters** or Starlette `Mount`/`Route` for advanced cases. For APIs versioned in the path (`/v1/...`), treat version as a **required** leading segment for predictable gateway routing.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/v1/resource/{rid}")
def v1_resource(rid: str) -> dict[str, str]:
    return {"version": "v1", "rid": rid}
```

**Key Points (4.1.5)**

- Path segments in the template are inherently required.
- Model “optional resource” with separate routes or queries.

**Best Practices (4.1.5)**

- Prefer explicit routes over clever optional-path hacks.
- Document **404 vs 422** behavior when IDs are malformed vs missing.

**Common Mistakes (4.1.5)**

- Assuming `default` on `Path()` removes the segment from the URL (it does not).
- Using one route to mean two different resources without clear rules.

---

## 4.2 Type Validation

### 4.2.1 String Parameters

#### Beginner

`str` path parameters accept **any non-slash** text (slashes break segment boundaries). Use string type when identifiers are **opaque tokens** or when you validate manually inside the handler.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/tags/{tag}")
def by_tag(tag: str) -> dict[str, str]:
    return {"tag": tag}
```

#### Intermediate

Combine `str` with **`Path(..., min_length=..., max_length=..., pattern=...)`** for validation without switching to regex-only routes. Empty strings may be rejected depending on constraints—test edge cases.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/slugs/{slug}")
def slug(slug: Annotated[str, Path(min_length=3, max_length=64)]) -> dict[str, str]:
    return {"slug": slug}
```

#### Expert

For **Unicode slugs**, normalization (NFC/NFKC) may differ between client and server. If you store slugs in a DB, enforce **canonical form** at ingestion. `pattern` uses **Python regex** syntax; anchor carefully—FastAPI/Pydantic may already treat the whole string as the match unit for path params.

```python
import re
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@app.get("/articles/{slug}")
def article(
    slug: Annotated[str, Path(pattern=SLUG_RE.pattern)],
) -> dict[str, str]:
    return {"slug": slug}
```

**Key Points (4.2.1)**

- `str` is the most permissive path type.
- Add `Path` constraints to reject garbage early.

**Best Practices (4.2.1)**

- Validate **slug format** at the edge.
- Log validation failures sparingly (avoid PII in logs).

**Common Mistakes (4.2.1)**

- Forgetting that `%2F` encoding issues can surprise segment parsing at proxies.
- Using huge strings in paths (prefer short IDs).

---

### 4.2.2 Integer Parameters

#### Beginner

`int` path parameters convert numeric text like `"7"` into Python `int`. Non-integer strings return **422**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/orders/{order_id}")
def order(order_id: int) -> dict[str, int]:
    return {"order_id": order_id}
```

#### Intermediate

Use **`Path(..., gt=0)`** to reject zero or negative IDs when your domain uses **positive** primary keys. This keeps bad requests out of database queries.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/rows/{row_id}")
def row(row_id: Annotated[int, Path(gt=0)]) -> dict[str, int]:
    return {"row_id": row_id}
```

#### Expert

**SQL injection** is not solved by `int` conversion alone if you later concatenate strings in raw SQL—always use **parameterized queries**. For **64-bit** IDs coming from JavaScript, note JSON number precision issues in **JavaScript clients** (use strings for big integers in JSON bodies; paths are already strings on the wire).

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/pk/{pk}")
def by_pk(pk: Annotated[int, Path(ge=1, le=9_999_999)]) -> dict[str, int]:
    return {"pk": pk}
```

**Key Points (4.2.2)**

- Integer path params are ideal for numeric primary keys.
- Range constraints express business rules declaratively.

**Best Practices (4.2.2)**

- Align constraints with **database** types (`SERIAL` vs `BIGINT`).
- Return **404** when the integer is valid but the row is missing (in the handler/DB layer).

**Common Mistakes (4.2.2)**

- Using `int` for values that overflow (very long digit strings).
- Confusing **422** (bad format) with **404** (not found).

---

### 4.2.3 Float Parameters

#### Beginner

`float` path parameters parse decimal text like `"3.14"`. Scientific notation may be accepted depending on Python’s float parser—verify if your clients rely on it.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/readings/{value}")
def reading(value: float) -> dict[str, float]:
    return {"value": value}
```

#### Intermediate

Financial systems often avoid **`float`** in paths entirely; use **string + Decimal** or integers of **minor units**. If you must use float, document **rounding** behavior.

```python
from decimal import Decimal
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/rates/{rate}")
def rate(rate: Annotated[Decimal, Path(gt=0)]) -> dict[str, str]:
    return {"rate": format(rate, "f")}
```

#### Expert

**Binary floating-point** cannot represent all decimals; `Path` with `Decimal` uses Pydantic coercion. Watch for **localization** accidentally sending comma decimals (`3,14`) which will fail validation—good failure, but UX may need clearer errors.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/percent/{p}")
def percent(p: Annotated[float, Path(gt=0, lt=100)]) -> dict[str, float]:
    return {"p": p}
```

**Key Points (4.2.3)**

- Float path params are rare; prefer query or body for measurements.
- `Decimal` improves monetary correctness.

**Best Practices (4.2.3)**

- Use **Decimal** for money; **float** for scientific telemetry if approximate is OK.
- Constrain ranges (`gt`, `lt`) to plausible physics/domain bounds.

**Common Mistakes (4.2.3)**

- Expecting **exact** decimal representation after float parsing.
- Using float for **counters** that should be integers.

---

### 4.2.4 UUID Parameters

#### Beginner

`UUID` path parameters validate **RFC 4122** string forms. Invalid UUID strings yield **422** before your code runs.

```python
from uuid import UUID

from fastapi import FastAPI

app = FastAPI()


@app.get("/sessions/{session_id}")
def session(session_id: UUID) -> dict[str, str]:
    return {"session_id": str(session_id)}
```

#### Intermediate

UUIDs are **case-insensitive** on input; `UUID` normalizes **hex** representation. Good fit for **distributed** IDs without exposing sequential integers.

```python
from typing import Annotated
from uuid import UUID

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/blobs/{blob_id}")
def blob(blob_id: Annotated[UUID, Path(description="Blob UUID v4")]) -> dict[str, str]:
    return {"blob_id": str(blob_id)}
```

#### Expert

If you accept **non-standard** UUID strings from legacy clients, you may need a **custom type** or pre-parse in a dependency. Consider **UUID version** requirements (v4 vs v7) in documentation; Pydantic’s `UUID` does not enforce version bits beyond basic validity.

```python
from uuid import UUID

from fastapi import FastAPI
from pydantic import UUID4

app = FastAPI()


@app.get("/users/{user_id}")
def user(user_id: UUID4) -> dict[str, str]:
    return {"user_id": str(user_id)}
```

**Key Points (4.2.4)**

- UUID in path = strong format validation.
- `UUID4` restricts variant/version when you need stricter checks.

**Best Practices (4.2.4)**

- Use UUIDs to reduce **enumeration** attacks vs sequential ints.
- Store as **UUID type** in databases when possible.

**Common Mistakes (4.2.4)**

- Passing **URN** prefixed UUIDs if clients send `urn:uuid:...` without custom handling.
- Assuming UUID strings are always **lowercase** in logs (normalize if comparing).

---

### 4.2.5 Datetime Parameters

#### Beginner

You can type a path parameter as **`datetime`**, **`date`**, or **`time`** depending on Pydantic/FastAPI version support. ISO-8601 strings are typical input forms after URL decoding.

```python
from datetime import date

from fastapi import FastAPI

app = FastAPI()


@app.get("/daily/{d}")
def daily(d: date) -> dict[str, str]:
    return {"date": d.isoformat()}
```

#### Intermediate

Putting **full datetimes** in paths is uncommon (colons and time zones complicate URLs). Often you use **`date`** or a **string** slug (`2025-03-28`). If you must use datetime, document the exact accepted string format.

```python
from datetime import datetime
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/at/{moment}")
def at(
    moment: Annotated[datetime, Path(description="ISO-8601 datetime")],
) -> dict[str, str]:
    return {"moment": moment.isoformat()}
```

#### Expert

**Time zones**: naive vs aware datetimes depend on Pydantic settings. For APIs crossing regions, prefer **UTC** in paths or move temporal filters to **query** parameters with explicit `Z` offset. Watch **URL encoding** of `+` in query strings (different from path) when clients copy-paste.

```python
from datetime import date, timedelta
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/reports/{report_date}")
def report(
    report_date: Annotated[date, Path(le=date.today())],
) -> dict[str, str]:
    yesterday = report_date - timedelta(days=1)
    return {"report_date": report_date.isoformat(), "prev": yesterday.isoformat()}
```

**Key Points (4.2.5)**

- Date in path is reasonable; full datetime is awkward but possible.
- Be explicit about **timezone** semantics.

**Best Practices (4.2.5)**

- Prefer **date** for “daily bucket” APIs.
- Validate **not-in-future** with `le=date.today()` when appropriate.

**Common Mistakes (4.2.5)**

- Clients sending **locale-specific** dates (`03/28/2026`).
- Mixing path **date** with query **timezone** inconsistently.

---

## 4.3 Predefined Values

### 4.3.1 Enum Classes

#### Beginner

A Python **`Enum`** restricts path values to a **finite set**. FastAPI documents allowed values in OpenAPI and returns **422** for anything else.

```python
from enum import Enum

from fastapi import FastAPI


class Color(str, Enum):
    red = "red"
    green = "green"
    blue = "blue"


app = FastAPI()


@app.get("/colors/{color}")
def color(color: Color) -> dict[str, str]:
    return {"color": color.value}
```

#### Intermediate

Subclassing **`str`** (or `int`) as the mixin makes enum values **JSON-serializable** naturally. Without the mixin, you may need `.value` when returning from endpoints.

```python
from enum import Enum

from fastapi import FastAPI


class Size(str, Enum):
    s = "S"
    m = "M"
    l = "L"


app = FastAPI()


@app.get("/shirt/{size}")
def shirt(size: Size) -> dict[str, str]:
    return {"size": size.value}
```

#### Expert

Enums participate in **OpenAPI `enum`** arrays. For **renaming** values without breaking clients, you can keep stable **values** while changing Python **member names**—clients see values, not member identifiers.

```python
from enum import Enum

from fastapi import FastAPI


class Env(str, Enum):
    prod = "production"
    staging = "staging"


app = FastAPI()


@app.get("/env/{env}")
def env_info(env: Env) -> dict[str, str]:
    return {"env": env.value}
```

**Key Points (4.3.1)**

- `str, Enum` is the common pattern for string path enums.
- Invalid enum labels are rejected automatically.

**Best Practices (4.3.1)**

- Keep enum **values** stable across API versions.
- Mirror enums in **client SDKs** for compile-time safety.

**Common Mistakes (4.3.1)**

- Using **duplicate values** across enum members (confusing validation).
- Forgetting `.value` when constructing DB rows from plain strings.

---

### 4.3.2 Valid Path Values

#### Beginner

“Valid” means **both** syntactically valid for the type **and** allowed by your business rules. Enums handle **syntax + membership** in one declaration.

```python
from enum import Enum

from fastapi import FastAPI


class Lang(str, Enum):
    en = "en"
    es = "es"


app = FastAPI()


@app.get("/{lang}/hello")
def hello(lang: Lang) -> dict[str, str]:
    return {"lang": lang.value, "msg": "Hello"}
```

#### Intermediate

When valid values are **dynamic** (from DB), enums are a poor fit; use **`str` + dependency** that loads allowed values or returns 404. Enums are best for **static** vocabularies.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()
ALLOWED = {"alpha", "beta"}


@app.get("/channels/{name}")
def channel(name: str) -> dict[str, str]:
    if name not in ALLOWED:
        raise HTTPException(status_code=404, detail="Unknown channel")
    return {"name": name}
```

#### Expert

For **i18n** path prefixes, coordinate with **CDN** path rules and **SEO** canonical URLs. Enum-validated language codes should align with **BCP 47** where possible (`en-US` vs `en`).

```python
from enum import Enum

from fastapi import FastAPI


class Locale(str, Enum):
    en_US = "en-US"
    en_GB = "en-GB"


app = FastAPI()


@app.get("/{locale}/docs")
def docs(locale: Locale) -> dict[str, str]:
    return {"locale": locale.value}
```

**Key Points (4.3.2)**

- Static sets: Enum; dynamic sets: validate in code or dependencies.
- Consider 404 vs 422 for unknown resource names.

**Best Practices (4.3.2)**

- Document whether unknown values are **client errors (422)** or **missing resources (404)**.
- Cache dynamic allowlists carefully to avoid **stampede** on DB.

**Common Mistakes (4.3.2)**

- Using Enum for values that change every deployment without regeneration.
- Returning **500** for unknown IDs when **404** is correct.

---

### 4.3.3 Validation with Enums

#### Beginner

FastAPI passes the string segment into Pydantic, which coerces to your Enum member. Case sensitivity follows Enum **value** definitions (`"Red"` ≠ `"red"` unless you customize).

```python
from enum import Enum

from fastapi import FastAPI


class Role(str, Enum):
    admin = "admin"
    member = "member"


app = FastAPI()


@app.get("/roles/{role}")
def roles(role: Role) -> dict[str, str]:
    return {"role": role.value}
```

#### Intermediate

You can combine Enum with **`Path(..., description=...)`** using `Annotated` for richer docs while keeping validation.

```python
from enum import Enum
from typing import Annotated

from fastapi import FastAPI, Path


class Tier(str, Enum):
    free = "free"
    pro = "pro"


app = FastAPI()


@app.get("/plans/{tier}")
def plan(tier: Annotated[Tier, Path(description="Subscription tier")]) -> dict[str, str]:
    return {"tier": tier.value}
```

#### Expert

Custom **Pydantic validators** on a **wrapper model** used as a path parameter type can normalize aliases (`ADMIN` → `admin`) before your handler sees canonical Enum values.

```python
from enum import Enum

from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class Role(str, Enum):
    admin = "admin"
    member = "member"


class RolePath(BaseModel):
    role: Role

    @field_validator("role", mode="before")
    @classmethod
    def lower(cls, v: object) -> object:
        if isinstance(v, str):
            return v.lower()
        return v


app = FastAPI()


@app.get("/team/{role}")
def team(role: RolePath) -> dict[str, str]:
    return {"role": role.role.value}
```

**Key Points (4.3.3)**

- Enums integrate cleanly with OpenAPI **enum** listing.
- Pre-validators can normalize input before Enum coercion.

**Best Practices (4.3.3)**

- Avoid surprising **case folding** unless documented.
- Prefer explicit Enum values over implicit `auto()` unless you control serialization.

**Common Mistakes (4.3.3)**

- Using **integer Enum** while clients send string numbers inconsistently.
- Assuming Enum **name** is what appears in the URL (it’s usually **value**).

---

### 4.3.4 String Enums

#### Beginner

`class MyEnum(str, Enum)` makes each member behave like a **string** while retaining Enum properties. Ideal for path segments that are textual tokens.

```python
from enum import Enum

from fastapi import FastAPI


class Status(str, Enum):
    open = "open"
    closed = "closed"


app = FastAPI()


@app.get("/tickets/{status}")
def tickets(status: Status) -> dict[str, str]:
    return {"status": status.value}
```

#### Intermediate

String enums serialize to JSON **without** custom encoders in many cases, simplifying responses that echo the path value.

```python
from enum import Enum

from fastapi import FastAPI


class Format(str, Enum):
    json = "json"
    csv = "csv"


app = FastAPI()


@app.get("/export/{fmt}")
def export(fmt: Format) -> dict[str, str]:
    return {"format": fmt.value}
```

#### Expert

If you need **regex** validation beyond fixed sets, prefer `str` + `Path(pattern=...)` or a **Pydantic model** with `Field(pattern=...)` as path type. String Enum is for **closed** sets only.

```python
from enum import Enum

from fastapi import FastAPI


class ApiVersion(str, Enum):
    v1 = "v1"
    v2 = "v2"


app = FastAPI()


@app.get("/{version}/ping")
def ping(version: ApiVersion) -> dict[str, str]:
    return {"version": version.value}
```

**Key Points (4.3.4)**

- String enums are the default choice for symbolic path tokens.
- They map cleanly to OpenAPI string enums.

**Best Practices (4.3.4)**

- Use **lowercase** values for URLs to avoid case issues.
- Version tokens (`v1`) are a classic string-enum use case.

**Common Mistakes (4.3.4)**

- Storing Enum **objects** in JSONB columns instead of **values**.
- Changing enum **values** without API versioning.

---

### 4.3.5 Integer Enums

#### Beginner

`class Level(int, Enum)` lets path segments be **numeric strings** that map to Enum members (`"1"` → `Level.one`).

```python
from enum import IntEnum

from fastapi import FastAPI


class Level(IntEnum):
    one = 1
    two = 2


app = FastAPI()


@app.get("/level/{level}")
def level(level: Level) -> dict[str, int]:
    return {"level": int(level)}
```

#### Intermediate

Integer enums are useful when external systems already use **numeric codes** (error codes, priority levels). Document the mapping clearly in OpenAPI descriptions.

```python
from enum import IntEnum

from fastapi import FastAPI


class Priority(IntEnum):
    low = 1
    high = 2


app = FastAPI()


@app.get("/queue/{priority}")
def queue(priority: Priority) -> dict[str, int]:
    return {"priority": int(priority)}
```

#### Expert

JSON responses containing IntEnum may serialize as **numbers**; ensure **JavaScript** consumers understand numeric semantics. For paths, clients still send **digits as text**; coercion is handled for you.

```python
from enum import IntEnum
from typing import Annotated

from fastapi import FastAPI, Path


class Code(IntEnum):
    ok = 0
    warn = 1


app = FastAPI()


@app.get("/status/{code}")
def status(code: Annotated[Code, Path(description="0=ok,1=warn")]) -> dict[str, int]:
    return {"code": int(code)}
```

**Key Points (4.3.5)**

- IntEnum maps numeric path text to symbolic constants.
- Good for **legacy numeric** protocols.

**Best Practices (4.3.5)**

- Prefer **string enums** for new public HTTP APIs (more readable URLs).
- Keep numeric ranges **contiguous** or document gaps.

**Common Mistakes (4.3.5)**

- Clients sending **leading zeros** (`"01"`)—may fail or parse unexpectedly.
- Mixing **bool-like** 0/1 with real integers without documentation.

---

## 4.4 Path Validation

### 4.4.1 gt, gte, lt, lte Parameters

#### Beginner

Inside `Path()`, **`gt`** (greater than), **`ge`** (greater or equal), **`lt`**, **`le`** constrain numeric path parameters. They mirror **Pydantic** numeric constraints.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/page/{n}")
def page(n: Annotated[int, Path(gt=0)]) -> dict[str, int]:
    return {"n": n}
```

#### Intermediate

These constraints apply **after** type coercion: `"5"` becomes `5`, then compared to bounds. Error messages include the failed constraint, aiding client developers.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/scores/{s}")
def score(s: Annotated[float, Path(ge=0.0, le=100.0)]) -> dict[str, float]:
    return {"s": s}
```

#### Expert

Combining **`gt`** with **`le`** defines **open/closed** intervals on one side. For integers representing **percentiles**, ensure upper bound is **100** inclusive vs exclusive per product definition.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/percentile/{p}")
def percentile(p: Annotated[int, Path(ge=1, le=99)]) -> dict[str, int]:
    return {"p": p}
```

**Key Points (4.4.1)**

- `Path(gt=...)` etc. validate numeric path parameters.
- Errors are standardized **422** responses.

**Best Practices (4.4.1)**

- Match constraints to **database** check constraints.
- Use **`ge=0`** for counts; **`gt=0`** for IDs if zero is invalid.

**Common Mistakes (4.4.1)**

- Using `gt` vs `ge` inconsistently with **SQL** `BETWEEN`.
- Applying numeric constraints to **non-numeric** types.

---

### 4.4.2 min_length and max_length

#### Beginner

For **`str`** path parameters, **`min_length`** and **`max_length`** limit how many characters the segment may contain after decoding.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/codes/{code}")
def codes(code: Annotated[str, Path(min_length=4, max_length=4)]) -> dict[str, str]:
    return {"code": code}
```

#### Intermediate

Useful for **fixed-width** identifiers or human-chosen usernames in the path. Remember **Unicode** code points vs **grapheme clusters**—Python len counts code points, not visual glyphs.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/u/{username}")
def user(username: Annotated[str, Path(min_length=3, max_length=32)]) -> dict[str, str]:
    return {"username": username}
```

#### Expert

Extremely long path segments may hit **proxy** or **browser** URL length limits; enforce **reasonable max_length** even if your parser allows more.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/blob/{token}")
def blob(token: Annotated[str, Path(min_length=16, max_length=128)]) -> dict[str, str]:
    return {"token": token}
```

**Key Points (4.4.2)**

- Length constraints apply to the **path string** value.
- Pair with **pattern** for format validation.

**Best Practices (4.4.2)**

- Keep URLs short; put large identifiers in **headers** or **query** if possible.
- Document **encoding** (UTF-8) expectations.

**Common Mistakes (4.4.2)**

- Assuming **byte length** equals **character length** (UTF-8 multi-byte).
- Setting `min_length=0` while route still requires the segment to exist (empty string edge case).

---

### 4.4.3 pattern (Regex Validation)

#### Beginner

`pattern` accepts a **regex string** validated by Pydantic. The path value must **fully match** the pattern (as constrained by Pydantic’s string validation rules for the version you use).

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/hex/{h}")
def hex_id(h: Annotated[str, Path(pattern=r"^[a-f0-9]{8}$")]) -> dict[str, str]:
    return {"h": h}
```

#### Intermediate

Anchor patterns **`^...$`** to avoid accidental partial matches depending on engine semantics. Prefer **readable** patterns and comment complex regex in docs, not only in code.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/sku/{sku}")
def sku(sku: Annotated[str, Path(pattern=r"^[A-Z]{3}-\d{4}$")]) -> dict[str, str]:
    return {"sku": sku}
```

#### Expert

**ReDoS** (catastrophic backtracking) matters if patterns are user-influenced. Keep regexes **simple**; push complex validation to **application logic** with timeouts if needed.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/iso/{country}")
def country(country: Annotated[str, Path(pattern=r"^[A-Z]{2}$")]) -> dict[str, str]:
    return {"country": country}
```

**Key Points (4.4.3)**

- Regex validation is declarative and appears in schema metadata when supported.
- Always test **boundary** strings.

**Best Practices (4.4.3)**

- Prefer **Enums** over regex when the set is small and fixed.
- Unit-test regexes independently of HTTP.

**Common Mistakes (4.4.3)**

- Forgetting **case sensitivity** (`A-Z` vs `a-z`).
- Overly permissive `.*` patterns that defeat validation purpose.

---

### 4.4.4 Validation Examples

#### Beginner

Below is a compact example combining **type**, **range**, and **length** constraints for a path parameter representing a **product ID slug**.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/products/{pid}")
def product(
    pid: Annotated[
        str,
        Path(
            min_length=6,
            max_length=40,
            pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        ),
    ],
) -> dict[str, str]:
    return {"pid": pid}
```

#### Intermediate

Numeric example: **positive** big-endian **shard** index in path for routing diagnostics.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/shards/{shard}")
def shard(shard: Annotated[int, Path(ge=0, le=255)]) -> dict[str, int]:
    return {"shard": shard}
```

#### Expert

Combine **UUID** with **Path** metadata only (UUID already validates format); add **business** validation in a service layer (e.g., tenant scoping).

```python
from typing import Annotated
from uuid import UUID

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/tenants/{tenant_id}/items/{item_id}")
def item(
    tenant_id: Annotated[UUID, Path(description="Tenant UUID")],
    item_id: Annotated[UUID, Path(description="Item UUID")],
) -> dict[str, str]:
    return {"tenant_id": str(tenant_id), "item_id": str(item_id)}
```

**Key Points (4.4.4)**

- Layer **transport validation** (Path) vs **authorization** (handler/Depends).
- Compose multiple constraints when they are independent.

**Best Practices (4.4.4)**

- Test **422** responses in **pytest** with `TestClient`.
- Keep examples in docs **copy-pasteable**.

**Common Mistakes (4.4.4)**

- Duplicating the same validation in **10 handlers**—extract dependencies.
- Using path validation as a substitute for **authz**.

---

### 4.4.5 Custom Validators

#### Beginner

When `Path()` is not enough, use a **Pydantic model** as the path parameter type (single field) and attach **`field_validator`**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class Username(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def no_spaces(cls, v: str) -> str:
        if " " in v:
            raise ValueError("no spaces")
        return v.lower()


app = FastAPI()


@app.get("/profile/{name}")
def profile(name: Username) -> dict[str, str]:
    return {"name": name.name}
```

#### Intermediate

`Annotated` wrappers with **BeforeValidator** (Pydantic v2) can normalize inputs before standard validation.

```python
from typing import Annotated

from fastapi import FastAPI
from pydantic import BaseModel, BeforeValidator, Field


def strip(s: object) -> object:
    if isinstance(s, str):
        return s.strip()
    return s


class Tag(BaseModel):
    tag: Annotated[str, BeforeValidator(strip), Field(min_length=1)]


app = FastAPI()


@app.get("/tag/{tag}")
def tag_ep(tag: Tag) -> dict[str, str]:
    return {"tag": tag.tag}
```

#### Expert

Custom validators should be **pure** and **fast**; do **I/O** in dependencies (`Depends`) with caching, not inside low-level validators, to keep error semantics clear and testability high.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class IsbnPath(BaseModel):
    isbn: str

    @field_validator("isbn")
    @classmethod
    def digits_only(cls, v: str) -> str:
        cleaned = "".join(ch for ch in v if ch.isdigit() or ch.upper() == "X")
        if len(cleaned) not in (10, 13):
            raise ValueError("invalid isbn length")
        return cleaned


app = FastAPI()


@app.get("/books/{isbn}")
def book(isbn: IsbnPath) -> dict[str, str]:
    return {"isbn": isbn.isbn}
```

**Key Points (4.4.5)**

- Pydantic models as path types unlock **arbitrary** validation.
- Prefer dependencies for **database existence** checks.

**Best Practices (4.4.5)**

- Keep validators **deterministic** for caching and testing.
- Return **clear ValueError messages**; they surface as validation errors.

**Common Mistakes (4.4.5)**

- Raising **HTTPException** inside Pydantic validators (use `ValueError`).
- Heavy DB calls inside validators on **hot** endpoints.

---

## 4.5 Advanced Path Patterns

### 4.5.1 Path Parameter Types

#### Beginner

Beyond builtins, you can annotate with **Pydantic** models (as above), **NewType** wrappers, or types registered with Pydantic’s validation pipeline—depending on version.

```python
from typing import NewType

from fastapi import FastAPI

UserId = NewType("UserId", int)

app = FastAPI()


@app.get("/users/{user_id}")
def user(user_id: UserId) -> dict[str, int]:
    return {"user_id": int(user_id)}
```

#### Intermediate

`typing.Annotated` + `Path()` is the **preferred** style in modern FastAPI examples for attaching metadata without changing the base type.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/ids/{x}")
def ids(x: Annotated[int, Path(title="Identifier")]) -> dict[str, int]:
    return {"x": x}
```

#### Expert

For **branded IDs** across modules, define small **Pydantic** types or **NewType** to avoid accidentally passing `project_id` where `user_id` was expected in internal Python code—FastAPI still sees the underlying **`int`**.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/accounts/{account_id}/ledger/{entry_id}")
def ledger(
    account_id: Annotated[int, Path(gt=0)],
    entry_id: Annotated[int, Path(gt=0)],
) -> dict[str, int]:
    return {"account_id": account_id, "entry_id": entry_id}
```

**Key Points (4.5.1)**

- Annotated metadata enriches schema without wrapper classes.
- NewType helps **static** typing clarity.

**Best Practices (4.5.1)**

- Standardize on **Annotated[..., Path(...)]** in new codebases.
- Document **custom types** in a shared `types.py`.

**Common Mistakes (4.5.1)**

- Creating **too many** wrapper models solely for one constraint—use `Path()`.
- Losing OpenAPI clarity when using opaque **Any** types.

---

### 4.5.2 File Paths

#### Beginner

File names in URLs should be **single path segments**; slashes would break routing. Use **string** types and validate allowed characters to avoid **path traversal** (`..`).

```python
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path

app = FastAPI()


@app.get("/files/{filename}")
def file_dl(filename: Annotated[str, Path(pattern=r"^[^/\\\\.][^/\\\\]*$")]) -> dict[str, str]:
    if ".." in filename:
        raise HTTPException(400, "invalid filename")
    return {"filename": filename}
```

#### Intermediate

Prefer **opaque file IDs** (UUID) in the path and map to storage keys **server-side**, never trusting client-supplied directory structure.

```python
from typing import Annotated
from uuid import UUID

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/downloads/{file_id}")
def download(file_id: UUID) -> dict[str, str]:
    return {"storage_key": f"objects/{file_id}"}
```

#### Expert

When streaming from disk, combine **validated IDs** with a **chrooted** storage root and `os.path.realpath` checks; URL validation alone is **not** sufficient security.

```python
import os
from pathlib import Path as FSPath
from typing import Annotated
from uuid import UUID

from fastapi import FastAPI, HTTPException
from fastapi import Path as FPath

app = FastAPI()
ROOT = FSPath("/var/app/storage").resolve()


@app.get("/secure/{fid}")
def secure(fid: UUID) -> dict[str, str]:
    candidate = (ROOT / str(fid)).resolve()
    if ROOT not in candidate.parents and candidate != ROOT:
        raise HTTPException(400, "bad path")
    if not str(candidate).startswith(str(ROOT)):
        raise HTTPException(400, "bad path")
    return {"path": str(candidate)}
```

**Key Points (4.5.2)**

- Never let users pick arbitrary **file system paths** via URL segments.
- UUID indirection is safer than raw filenames.

**Best Practices (4.5.2)**

- Store files **outside** web root; serve via app or signed URLs.
- Validate **extensions** if you must accept names.

**Common Mistakes (4.5.2)**

- Concatenating user input into **`open()`** paths.
- Assuming **URL decoding** happens only once—double-encoding attacks.

---

### 4.5.3 Regular Expressions in Paths

#### Beginner

Starlette/FastAPI route paths are **not** full regex templates by default; you use **`{name:type}`** converters for some types or validate with **`pattern=`** on parameters. Custom path converters are **advanced**.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/alpha/{token}")
def alpha(token: Annotated[str, Path(pattern=r"^[a-z]+$")]) -> dict[str, str]:
    return {"token": token}
```

#### Intermediate

For **numeric-only** segments, prefer `int` type rather than regex on `str`—better errors and docs.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/digits/{n}")
def digits(n: int) -> dict[str, int]:
    return {"n": n}
```

#### Expert

If you integrate **custom Starlette routes**, you can use regex path matching—but you lose some FastAPI OpenAPI automation unless you manually document operations. Prefer staying in FastAPI’s decorator model.

```python
# Conceptual: prefer FastAPI-native constraints first.
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/hashes/{h}")
def hashes(h: Annotated[str, Path(pattern=r"^[a-f0-9]{64}$")]) -> dict[str, str]:
    return {"sha256": h}
```

**Key Points (4.5.3)**

- Parameter **`pattern`** validates the captured segment.
- Native types often beat regex for numeric segments.

**Best Practices (4.5.3)**

- Document regex expectations in **`description`**.
- Test **invalid** samples (`TestClient`).

**Common Mistakes (4.5.3)**

- Trying to match **multiple segments** with one path param (use different design).
- Copy-pasting **regex** without escaping for JSON schema consumers.

---

### 4.5.4 Conflicting Paths

#### Beginner

FastAPI registers routes in **order**; the **first match wins**. If `/items/{item_id}` is registered before `/items/me`, then `me` may be captured as `item_id` unless you define **`/items/me` first**.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/users/me")
def me() -> dict[str, str]:
    return {"user": "me"}


@app.get("/users/{user_id}")
def user(user_id: int) -> dict[str, int]:
    return {"user_id": user_id}
```

#### Intermediate

**Static** paths should precede **parameterized** paths sharing the same prefix. Use **APIRouter** modules and a clear registration order policy in large apps.

```python
from fastapi import APIRouter, FastAPI

r = FastAPI()


@r.get("/config/default")
def default_cfg() -> dict[str, str]:
    return {"cfg": "default"}


@r.get("/config/{name}")
def named_cfg(name: str) -> dict[str, str]:
    return {"cfg": name}
```

#### Expert

Trailing slash behavior and **307 redirects** can surprise clients; configure **`redirect_slashes`** on Starlette/FastAPI app if needed and test with your reverse proxy.

```python
from fastapi import FastAPI

app = FastAPI(redirect_slashes=True)


@app.get("/health")
def health() -> dict[str, str]:
    return {"ok": "true"}
```

**Key Points (4.5.4)**

- Order routes from **specific** to **general**.
- Conflicts are a frequent source of “wrong handler” bugs.

**Best Practices (4.5.4)**

- Add **integration tests** that hit ambiguous paths.
- Use **linting** or route tables in docs for review.

**Common Mistakes (4.5.4)**

- Registering **`/{id}`** before **`/status`** under same prefix.
- Assuming **method** differentiation fixes path ambiguity (it doesn’t if path collides).

---

### 4.5.5 Path Parameter Best Practices

#### Beginner

Use **nouns** for resources, **stable** IDs, and **consistent** pluralization. Keep path params **short** and meaningful.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/articles/{article_id}")
def article(article_id: int) -> dict[str, int]:
    return {"article_id": article_id}
```

#### Intermediate

Validate **early** with types and `Path()`; perform **authorization** in dependencies; return **404** when the row is missing.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Path

app = FastAPI()


def load_item(item_id: Annotated[int, Path(gt=0)]) -> dict[str, int]:
    if item_id == 404:
        raise HTTPException(404, "missing")
    return {"id": item_id}


@app.get("/items/{item_id}")
def get_item(item: dict[str, int] = Depends(load_item)) -> dict[str, int]:
    return item
```

#### Expert

Instrument paths with **metrics** per template (not per raw URL) to avoid **cardinality explosion** in Prometheus; align OpenAPI **operationId** conventions for codegen.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/v2/catalog/{sku}", operation_id="catalog_get_sku")
def catalog_sku(sku: str) -> dict[str, str]:
    return {"sku": sku}
```

**Key Points (4.5.5)**

- Good path design improves **caching**, **docs**, and **client SDKs**.
- Separate **routing concerns** from **business logic**.

**Best Practices (4.5.5)**

- Use **`operation_id`** for stable client generation.
- Review path params in **security** threat models.

**Common Mistakes (4.5.5)**

- Encoding **PII** in paths (logs, referrer headers).
- Changing paths without **versioning**.

---

## 4.6 Documentation

### 4.6.1 Adding Descriptions

#### Beginner

Use `Path(..., description="...")` inside `Annotated` to explain what the parameter means in **Swagger UI** / **ReDoc**.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/items/{item_id}")
def read_item(
    item_id: Annotated[int, Path(description="Primary key of the item")],
) -> dict[str, int]:
    return {"item_id": item_id}
```

#### Intermediate

Descriptions support **markdown** in some UIs (depends on version); keep text **short** and link to external docs for long prose.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/orgs/{org_id}")
def org(
    org_id: Annotated[
        int,
        Path(description="Tenant organization identifier (positive integer)."),
    ],
) -> dict[str, int]:
    return {"org_id": org_id}
```

#### Expert

For **i18n** documentation, OpenAPI is typically **English**; translate in **portal** layers if needed. You can also supply `description` via Pydantic `Field` on model-wrapped path params.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/datasets/{dataset_key}")
def dataset(
    dataset_key: Annotated[
        str,
        Path(
            description="URL-safe dataset key (lowercase, hyphenated).",
            example="sales-2024-q1",
        ),
    ],
) -> dict[str, str]:
    return {"dataset_key": dataset_key}
```

**Key Points (4.6.1)**

- `description` improves **developer experience** in interactive docs.
- Descriptions feed **OpenAPI** `description` fields.

**Best Practices (4.6.1)**

- Describe **units**, **formats**, and **constraints** referenced elsewhere.
- Avoid duplicating **privacy** policies inside every parameter.

**Common Mistakes (4.6.1)**

- Empty descriptions on **non-obvious** tokens.
- Misleading text that contradicts validation rules.

---

### 4.6.2 Parameter Examples

#### Beginner

`Path(..., example=...)` sets a sample value shown in docs UIs, helping consumers understand typical IDs.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/items/{item_id}")
def read_item(
    item_id: Annotated[int, Path(example=12345, ge=1)],
) -> dict[str, int]:
    return {"item_id": item_id}
```

#### Intermediate

Examples do **not** enforce validation; they are **documentation only**. Still pick examples that **pass** validation to avoid confusing readers.

```python
from typing import Annotated
from uuid import UUID

from fastapi import FastAPI, Path

app = FastAPI()
EX = UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


@app.get("/assets/{asset_id}")
def asset(
    asset_id: Annotated[UUID, Path(example=EX)],
) -> dict[str, str]:
    return {"asset_id": str(asset_id)}
```

#### Expert

OpenAPI 3.1 supports **`examples`** plural in JSON Schema; FastAPI/Pydantic integration evolves—check your version’s support when migrating. For multiple examples, model-level schema customization may be required.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/codes/{code}")
def code(
    code: Annotated[str, Path(example="US", pattern=r"^[A-Z]{2}$")],
) -> dict[str, str]:
    return {"code": code}
```

**Key Points (4.6.2)**

- Examples improve **Try it out** defaults in Swagger UI.
- They should be **valid** exemplars.

**Best Practices (4.6.2)**

- Use **non-production-like** IDs if examples might be copied into scripts.
- Rotate examples when **schemas** change.

**Common Mistakes (4.6.2)**

- Setting examples that **fail** `pattern` or `ge`/`le`.
- Using **sensitive** real IDs as examples.

---

### 4.6.3 Swagger Annotations

#### Beginner

FastAPI generates **OpenAPI** automatically; “annotations” often means `summary`, `description`, `response_description`, and tags on **route decorators**.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get(
    "/items/{item_id}",
    summary="Fetch an item",
    tags=["items"],
)
def read_item(
    item_id: Annotated[int, Path(title="Item ID")],
) -> dict[str, int]:
    return {"item_id": item_id}
```

#### Intermediate

`title` on `Path` sets the **short label** in schema sections; pair with `description` for clarity.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/nodes/{node_id}")
def node(
    node_id: Annotated[
        str,
        Path(title="NodeId", description="Kubernetes-style node name."),
    ],
) -> dict[str, str]:
    return {"node_id": node_id}
```

#### Expert

Customize **OpenAPI** via `app.openapi` override or `get_openapi` to inject **security schemes**, **servers**, and **global** metadata—useful for **multi-tenant** base URLs.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/secure/{id}")
def secure_id(
    id: Annotated[int, Path(title="Identifier", ge=1)],
) -> dict[str, int]:
    return {"id": id}
```

**Key Points (4.6.3)**

- Route-level metadata complements parameter metadata.
- Tags enable **grouping** in Swagger UI.

**Best Practices (4.6.3)**

- Keep **`summary`** concise; put details in `description`.
- Align **tags** with your **team boundaries**.

**Common Mistakes (4.6.3)**

- Over-tagging every endpoint uniquely (loses grouping).
- Duplicating **long** descriptions on both path and param.

---

### 4.6.4 Documentation from Docstrings

#### Beginner

FastAPI can expose endpoint **docstrings** as **description** in OpenAPI (configurable). Write clear **multi-line** docstrings for complex endpoints.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
def read_item(item_id: int) -> dict[str, int]:
    '''Retrieve a single item by its numeric identifier.

    Returns a JSON object containing the identifier echoed back.
    '''
    return {"item_id": item_id}
```

#### Intermediate

Google/NumPy style docstrings are **human** readable; OpenAPI may treat them as plain text. Put **parameter** docs in `Path(description=...)` for machine-readable fields.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/widgets/{widget_id}")
def widget(
    widget_id: Annotated[int, Path(description="Widget primary key.")],
) -> dict[str, int]:
    '''Widgets represent dashboard components.

    Note: Widgets may be cached at the edge for 60 seconds.
    '''
    return {"widget_id": widget_id}
```

#### Expert

For **private** APIs, you might disable docstring inclusion or serve **separate** external vs internal OpenAPI via **multiple apps** or **routes** with auth.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/internal/{secret}")
def internal(secret: str) -> dict[str, str]:
    '''Internal-only diagnostic endpoint.

    Not advertised to external integrators.
    '''
    return {"secret": secret}
```

**Key Points (4.6.4)**

- Docstrings are great for **narrative**; Path for **param** specifics.
- Consider audience (public vs internal).

**Best Practices (4.6.4)**

- Keep the **first line** of docstrings short (summary).
- Link runbooks in **description** fields if allowed.

**Common Mistakes (4.6.4)**

- Duplicating **Path** descriptions verbatim in docstrings without adding value.
- Leaving **placeholder** docstrings in production.

---

### 4.6.5 Custom Schema

#### Beginner

Use Pydantic `Field(json_schema_extra={...})` or FastAPI’s `responses` to tune **OpenAPI** output when defaults are insufficient.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/items/{item_id}")
def read_item(
    item_id: Annotated[
        int,
        Path(
            description="Item identifier",
            json_schema_extra={"examples": [1, 2, 3]},
        ),
    ],
) -> dict[str, int]:
    return {"item_id": item_id}
```

#### Intermediate

For complex **JSON Schema** keywords, consult Pydantic v2 **json_schema_extra** and OpenAPI compatibility; some keywords may be **stripped** depending on FastAPI version.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/ratio/{r}")
def ratio(
    r: Annotated[
        float,
        Path(
            ge=0.0,
            le=1.0,
            json_schema_extra={"title": "Probability", "default": 0.5},
        ),
    ],
) -> dict[str, float]:
    return {"r": r}
```

#### Expert

Override **`openapi()`** method subclassing `FastAPI` to merge **vendor extensions** (`x-...`) required by corporate **API portals**.

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/ext/{code}")
def ext(
    code: Annotated[
        str,
        Path(
            json_schema_extra={
                "x-tenant-scoped": True,
                "x-visibility": "internal",
            },
        ),
    ],
) -> dict[str, str]:
    return {"code": code}
```

**Key Points (4.6.5)**

- `json_schema_extra` augments generated schemas.
- Vendor extensions power **enterprise** tooling.

**Best Practices (4.6.5)**

- Test generated **`openapi.json`** in CI **snapshot** tests.
- Document **nonstandard** extensions for clients.

**Common Mistakes (4.6.5)**

- Relying on **unsupported** keywords that disappear silently.
- Breaking **codegen** with invalid schema combinations.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- Path parameters map `{segments}` to typed function arguments and validate **before** handler execution.
- Use **`Annotated[..., Path(...)]`** for metadata and constraints alongside types.
- **Route order** matters when static and dynamic paths share prefixes.
- **Enums** and **regex** constrain string segments; **numeric bounds** protect domain rules.
- OpenAPI documentation combines **route metadata**, **Path()** fields, and **docstrings**.

### Chapter Best Practices

- Design **resource-oriented** paths with stable identifiers and clear hierarchy.
- Prefer **UUIDs** or **opaque IDs** when exposing public identifiers.
- Validate **syntax** at the edge; enforce **authorization** in shared dependencies.
- Add **examples** and **descriptions** that match real constraints.
- Test **422**, **404**, and routing **conflicts** with automated tests.

### Chapter Common Mistakes

- Registering **`/users/{id}`** before **`/users/me`** without realizing the capture.
- Treating **path validation** as a substitute for **authentication**.
- Putting **sensitive** data in URLs that appear in logs and browser history.
- Using **`float`** for money; using **regex** when **`int`** would be clearer.
- Ignoring **proxy limits** on URL length and encoding.

---

*End of Path Parameters notes (Topic 4).*
