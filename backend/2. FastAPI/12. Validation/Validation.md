# Validation in FastAPI

## 📑 Table of Contents

- [12.1 Pydantic Validators](#121-pydantic-validators)
  - [12.1.1 @field_validator Decorator](#1211-field_validator-decorator)
  - [12.1.2 @model_validator Decorator](#1212-model_validator-decorator)
  - [12.1.3 Pre and Post Validation](#1213-pre-and-post-validation)
  - [12.1.4 Custom Error Messages](#1214-custom-error-messages)
  - [12.1.5 Multiple Validators](#1215-multiple-validators)
- [12.2 Built-in Validators](#122-built-in-validators)
  - [12.2.1 String Constraints (min_length, max_length)](#1221-string-constraints-min_length-max_length)
  - [12.2.2 Numeric Constraints (gt, gte, lt, lte)](#1222-numeric-constraints-gt-gte-lt-lte)
  - [12.2.3 Pattern Validation (regex)](#1223-pattern-validation-regex)
  - [12.2.4 Email Validation](#1224-email-validation)
  - [12.2.5 URL Validation](#1225-url-validation)
- [12.3 Type Validation](#123-type-validation)
  - [12.3.1 Type Checking](#1231-type-checking)
  - [12.3.2 Type Coercion](#1232-type-coercion)
  - [12.3.3 Custom Types](#1233-custom-types)
  - [12.3.4 Generic Types](#1234-generic-types)
  - [12.3.5 Union Types](#1235-union-types)
- [12.4 Complex Validation](#124-complex-validation)
  - [12.4.1 Cross-Field Validation](#1241-cross-field-validation)
  - [12.4.2 Conditional Validation](#1242-conditional-validation)
  - [12.4.3 Nested Model Validation](#1243-nested-model-validation)
  - [12.4.4 Collection Validation](#1244-collection-validation)
  - [12.4.5 Recursive Validation](#1245-recursive-validation)
- [12.5 Error Handling](#125-error-handling)
  - [12.5.1 Validation Error Responses](#1251-validation-error-responses)
  - [12.5.2 Custom Error Messages](#1252-custom-error-messages)
  - [12.5.3 Error Details](#1253-error-details)
  - [12.5.4 Partial Errors](#1254-partial-errors)
  - [12.5.5 Error Formatting](#1255-error-formatting)
- [12.6 Advanced Validation](#126-advanced-validation)
  - [12.6.1 Validation Hooks](#1261-validation-hooks)
  - [12.6.2 Root Validators](#1262-root-validators)
  - [12.6.3 Config Validators](#1263-config-validators)
  - [12.6.4 Dynamic Validation](#1264-dynamic-validation)
  - [12.6.5 Performance Optimization](#1265-performance-optimization)
- [12.7 Validation Best Practices](#127-validation-best-practices)
  - [12.7.1 Input Sanitization](#1271-input-sanitization)
  - [12.7.2 Security Validation](#1272-security-validation)
  - [12.7.3 Business Logic Validation](#1273-business-logic-validation)
  - [12.7.4 Validation Organization](#1274-validation-organization)
  - [12.7.5 Documentation](#1275-documentation)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 12.1 Pydantic Validators

FastAPI uses **Pydantic v2** models for request/response validation. Validators run during **model construction** and enforce **domain rules** beyond raw types.

### 12.1.1 @field_validator Decorator

#### Beginner

**`@field_validator`** runs on one or more **fields** after initial parsing. Use **`@classmethod`** style in Pydantic v2.

```python
from pydantic import BaseModel, field_validator

class UserIn(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def strip_username(cls, v: str) -> str:
        return v.strip()


# FastAPI will use this model as body schema
from fastapi import FastAPI

app = FastAPI()


@app.post("/users")
def create_user(user: UserIn) -> UserIn:
    return user
```

#### Intermediate

**`mode="before"`** receives **raw** input (often **`str`** from JSON); **`mode="after"`** (default for field validators in many cases) receives **converted** types—pick based on coercion needs.

```python
from pydantic import BaseModel, field_validator

class Item(BaseModel):
    code: str

    @field_validator("code", mode="before")
    @classmethod
    def upper_code(cls, v: object) -> object:
        if isinstance(v, str):
            return v.upper()
        return v
```

#### Expert

**`ValidationInfo`** provides **context** (`info.data` for other fields in **`before`** validators—careful with **order**). For **cross-field** rules prefer **`model_validator`**.

**Key Points (12.1.1)**

- Field validators are **composable** and **unit-testable**.
- They integrate with OpenAPI **schema** generation where types map cleanly.

**Best Practices (12.1.1)**

- Keep validators **pure** when possible; **I/O** belongs in **services**.

**Common Mistakes (12.1.1)**

- Raising **`ValueError`** with **non-string** messages that confuse **i18n** pipelines.

---

### 12.1.2 @model_validator Decorator

#### Beginner

**`@model_validator`** validates the **whole model**. Use **`mode="after"`** to access **constructed** fields as attributes.

```python
from pydantic import BaseModel, model_validator

class RangeIn(BaseModel):
    start: int
    end: int

    @model_validator(mode="after")
    def ordered(self) -> "RangeIn":
        if self.start > self.end:
            raise ValueError("start must be <= end")
        return self
```

#### Intermediate

**`mode="before"`** receives **`dict`**-like data—useful to **normalize** legacy keys before field validators run.

#### Expert

**`model_validator`** can return **`dict`** in **`before`** mode to **transform** data wholesale—powerful but harder to trace—document **invariants** clearly.

**Key Points (12.1.2)**

- Model validators are the right tool for **cross-field** constraints.
- **Order** of execution: **`before` model → field → `after` model** (simplified mental model).

**Best Practices (12.1.2)**

- Prefer **specific** exceptions **`ValueError`** with clear messages for Pydantic.

**Common Mistakes (12.1.2)**

- Mutating **`self`** in ways that **break** immutability expectations for **frozen** models.

---

### 12.1.3 Pre and Post Validation

#### Beginner

**Pre** (**`mode="before"`**) sees **incoming** primitives; **post** (**`mode="after"`**) sees **parsed** values/types.

```python
from pydantic import BaseModel, field_validator

class Score(BaseModel):
    value: int

    @field_validator("value", mode="before")
    @classmethod
    def coerce(cls, v: object) -> object:
        if isinstance(v, str) and v.isdigit():
            return int(v)
        return v

    @field_validator("value", mode="after")
    @classmethod
    def bounds(cls, v: int) -> int:
        if not 0 <= v <= 100:
            raise ValueError("score must be 0..100")
        return v
```

#### Intermediate

Multiple validators on same field run in **declaration order** within each **mode** group.

#### Expert

**Performance**: heavy **`before`** coercion on **large lists** can dominate CPU—profile **hot** endpoints.

**Key Points (12.1.3)**

- **Pre** is ideal for **lenient** wire formats; **post** for **strict** domain checks.

**Best Practices (12.1.3)**

- Document which endpoints accept **coercions** vs **strict** types.

**Common Mistakes (12.1.3)**

- Using **`before`** and accidentally returning **wrong type** that **skips** intended coercion.

---

### 12.1.4 Custom Error Messages

#### Beginner

Pass **`str`** to **`ValueError`**; Pydantic wraps as **`validation_error`**. Use **`PydanticCustomError`** for **typed** errors.

```python
from pydantic import BaseModel, field_validator, PydanticCustomError

class Pin(BaseModel):
    value: str

    @field_validator("value")
    @classmethod
    def four_digits(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 4:
            raise PydanticCustomError("pin_format", "PIN must be exactly 4 digits")
        return v
```

#### Intermediate

**`ctx`** in **`PydanticCustomError`** carries **structured** template fields for **i18n**.

#### Expert

Map **`type`** strings to **stable** API **error codes** for clients—avoid changing **`type`** strings across minor releases.

**Key Points (12.1.4)**

- Custom errors improve **client** UX vs generic **type** errors.

**Best Practices (12.1.4)**

- Keep **messages** helpful but **non-leaky** (no stack traces to users).

**Common Mistakes (12.1.4)**

- Embedding **PII** in validation error messages.

---

### 12.1.5 Multiple Validators

#### Beginner

Stack decorators **bottom-up** execution per Pydantic rules—**test** order explicitly.

```python
from pydantic import BaseModel, field_validator

class Slug(BaseModel):
    value: str

    @field_validator("value")
    @classmethod
    def strip(cls, v: str) -> str:
        return v.strip()

    @field_validator("value")
    @classmethod
    def no_spaces(cls, v: str) -> str:
        if " " in v:
            raise ValueError("no spaces allowed")
        return v
```

#### Intermediate

Combine related checks in **one** validator to reduce **passes** if **micro-optimization** matters.

#### Expert

For **plugin** architectures, **compose** validators dynamically—beware **MRO** and **duplicate** checks.

**Key Points (12.1.5)**

- Multiple validators aid **readability** when each enforces **one** invariant.

**Best Practices (12.1.5)**

- Add **unit tests** per invariant.

**Common Mistakes (12.1.5)**

- Assuming **order** across **field** and **model** validators without reading **docs**.

---

## 12.2 Built-in Validators

Pydantic **`Field`** constraints generate JSON Schema keywords and enforce Python-side checks.

### 12.2.1 String Constraints (min_length, max_length)

#### Beginner

Use **`Field(min_length=1, max_length=100)`** on **`str`** fields.

```python
from pydantic import BaseModel, Field

class Tweet(BaseModel):
    text: str = Field(min_length=1, max_length=280)
```

#### Intermediate

**`strip_whitespace=True`** (where applicable) combines well with **min_length**—ensure **empty-after-strip** is rejected.

#### Expert

**Unicode** grapheme count ≠ **len(str)** codepoints—use **`regex`** or **external** libs for **true** length limits on **emoji-heavy** text.

**Key Points (12.2.1)**

- Constraints appear in **OpenAPI** for **generated** clients.

**Best Practices (12.2.1)**

- Align **DB column** lengths with **API** max lengths.

**Common Mistakes (12.2.1)**

- **`max_length`** on **optional** fields without handling **`None`**.

---

### 12.2.2 Numeric Constraints (gt, gte, lt, lte)

#### Beginner

**`Field(gt=0)`** means **strictly greater**; **`ge=0`** includes zero.

```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    price: float = Field(gt=0, lt=1_000_000)
    stock: int = Field(ge=0)
```

#### Intermediate

**`float`** comparisons have **precision** issues—use **`Decimal`** for **money**.

#### Expert

**OpenAPI** **`exclusiveMinimum`** mapping depends on Pydantic version—verify **generated** schema for **client** generators.

**Key Points (12.2.2)**

- **`gt`** vs **`ge`** changes **boundary** behavior—**test** equality cases.

**Best Practices (12.2.2)**

- Document **inclusive/exclusive** bounds in **API** docs when ambiguous.

**Common Mistakes (12.2.2)**

- Using **`float`** for **currency** with **rounding** surprises.

---

### 12.2.3 Pattern Validation (regex)

#### Beginner

**`Field(pattern=r"^[A-Z]{3}$")`** validates **strings** against **regex**.

```python
from pydantic import BaseModel, Field

class Country(BaseModel):
    code: str = Field(pattern=r"^[A-Z]{2}$")
```

#### Intermediate

Prefer **`Pattern[str]`** compiled once at **import** for **performance**.

#### Expert

**ReDoS**: avoid **catastrophic** backtracking on **user** strings—keep patterns **simple** or use **timeouts** in **custom** validators.

**Key Points (12.2.3)**

- Regex validates **syntax**, not **existence** (e.g., **country code** still needs **business** check).

**Best Practices (12.2.3)**

- Anchor patterns **`^...$`** to **full string** match.

**Common Mistakes (12.2.3)**

- Partial matches accidentally accepted without **anchors**.

---

### 12.2.4 Email Validation

#### Beginner

Use **`EmailStr`** from **`pydantic`** (**`email-validator`** dependency required).

```python
from pydantic import BaseModel, EmailStr

class Contact(BaseModel):
    email: EmailStr
```

#### Intermediate

**Internationalized** email addresses may surprise **legacy** regexes—**`email-validator`** follows **practical** rules.

#### Expert

**Normalizing** email (**lowercase**, **Gmail dots**) is a **business policy**—do in **`field_validator`**, not only HTML layer.

**Key Points (12.2.4)**

- **`EmailStr`** is **not** proof the **mailbox** exists.

**Best Practices (12.2.4)**

- Run **verification** flows (magic link) for **critical** accounts.

**Common Mistakes (12.2.4)**

- Forgetting **`pip install email-validator`** in **deploy** image.

---

### 12.2.5 URL Validation

#### Beginner

**`HttpUrl`** (Pydantic) validates **URLs** and provides **parsed** components.

```python
from pydantic import BaseModel, HttpUrl

class Bookmark(BaseModel):
    url: HttpUrl
```

#### Intermediate

Restrict schemes with **`field_validator`** if **`https`** only is required.

```python
from pydantic import BaseModel, HttpUrl, field_validator

class SecureLink(BaseModel):
    url: HttpUrl

    @field_validator("url")
    @classmethod
    def https_only(cls, v: HttpUrl) -> HttpUrl:
        if str(v).startswith("http://"):
            raise ValueError("https only")
        return v
```

#### Expert

**SSRF** protection is **not** solved by **`HttpUrl`**—block **internal** IP ranges in **application** code when fetching **user** URLs.

**Key Points (12.2.5)**

- URL validation checks **shape**, not **safety** of **server-side** fetches.

**Best Practices (12.2.5)**

- Use **allowlists** of **domains** when integrating **webhooks**.

**Common Mistakes (12.2.5)**

- Assuming **`HttpUrl`** prevents **open redirects** in **your** app.

---

## 12.3 Type Validation

### 12.3.1 Type Checking

#### Beginner

Pydantic validates **runtime** types against **annotations** (for example **`int`**, **`UUID`**, **`datetime`**).

```python
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

class Event(BaseModel):
    id: UUID
    at: datetime
```

#### Intermediate

**`strict=True`** (**`model_config`**) disables **coercion**—useful for **strict** public APIs.

```python
from pydantic import BaseModel, ConfigDict

class StrictInt(BaseModel):
    model_config = ConfigDict(strict=True)

    n: int
```

#### Expert

**JSON** only has **number**—distinction **`int` vs float`** may coerce—**strict** mode clarifies **contracts**.

**Key Points (12.3.1)**

- Type checking is **first-line** defense against **garbage** input.

**Best Practices (12.3.1)**

- Prefer **precise** types over **`Any`**.

**Common Mistakes (12.3.1)**

- Using **`dict[str, Any]`** and losing **schema** benefits.

---

### 12.3.2 Type Coercion

#### Beginner

Pydantic **coerces** compatible values: **`"42"` → `int`** in **non-strict** mode.

```python
from pydantic import BaseModel

class Coerced(BaseModel):
    n: int


assert Coerced.model_validate({"n": "7"}).n == 7
```

#### Intermediate

**`bool`** coercion is **tricky**—**`strict`** recommended for **flags** if you fear **`"false"` → True** style issues (actually `"false"` string may not coerce to bool—verify Pydantic rules for your version).

#### Expert

Document **coercion** behavior for **public** APIs—**mobile** clients may send **strings** unintentionally.

**Key Points (12.3.2)**

- Coercion helps **pragmatic** integration; **strict** helps **safety**.

**Best Practices (12.3.2)**

- Pin **Pydantic** version; coercion rules **evolve**.

**Common Mistakes (12.3.2)**

- Relying on **implicit** coercion for **security-critical** enums.

---

### 12.3.3 Custom Types

#### Beginner

Use **`Annotated`** with **`AfterValidator`** or **`PlainValidator`** (Pydantic v2) to create **reusable** constrained types.

```python
from typing import Annotated

from pydantic import AfterValidator, BaseModel

def non_empty_str(v: str) -> str:
    if not v.strip():
        raise ValueError("must be non-empty")
    return v.strip()


ShortText = Annotated[str, AfterValidator(non_empty_str)]


class Note(BaseModel):
    title: ShortText
```

#### Intermediate

**`GetPydanticSchema`** customizes **JSON Schema** for **OpenAPI** if you need **fine** control.

#### Expert

**Branded types** at scale may use **NewType** + validators for **compile-time** hints in **Pyright**.

**Key Points (12.3.3)**

- Custom types **DRY** validation across models.

**Best Practices (12.3.3)**

- Name **`Annotated`** aliases clearly (**`NonEmptyStr`**).

**Common Mistakes (12.3.3)**

- **Overusing** **`PlainValidator`** when **`Field`** constraints suffice.

---

### 12.3.4 Generic Types

#### Beginner

**`BaseModel`** generics model **containers** like **`Page[T]`**.

```python
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
```

#### Intermediate

FastAPI **OpenAPI** support for **generic** models varies—often use **concrete** subclasses for **docs**.

#### Expert

**Recursive** generics need **`model_rebuild()`** or **forward refs** carefully in **Pydantic v2**.

**Key Points (12.3.4)**

- Generics improve **internal** typing; **API** surface may need **explicit** schemas.

**Best Practices (12.3.4)**

- Export **concrete** response models for **SDK** generation.

**Common Mistakes (12.3.4)**

- Assuming **OpenAPI** shows **perfect** **`T`** substitution everywhere.

---

### 12.3.5 Union Types

#### Beginner

**`str | int`** accepts **either**; Pydantic tries **branches** in **union** order (smart unions in v2).

```python
from pydantic import BaseModel

class Flexible(BaseModel):
    value: str | int
```

#### Intermediate

**`Tag`** discriminated unions via **`Literal`** fields for **JSON** **`type` discriminators**.

```python
from typing import Literal

from pydantic import BaseModel

class Cat(BaseModel):
    pet_type: Literal["cat"]
    meows: bool


class Dog(BaseModel):
    pet_type: Literal["dog"]
    barks: bool


class PetHolder(BaseModel):
    pet: Cat | Dog
```

#### Expert

**Performance**: large **unions** of **models** slow validation—flatten or **pre-parse** **`type`** field in **`before`** validator.

**Key Points (12.3.5)**

- **Discriminated** unions are **best** for **evolvable** payloads.

**Best Practices (12.3.5)**

- Keep **discriminator** values **stable** across API versions.

**Common Mistakes (12.3.5)**

- **Ambiguous** unions where **both** branches **coerce** same JSON.

---

## 12.4 Complex Validation

### 12.4.1 Cross-Field Validation

#### Beginner

Use **`model_validator(mode="after")`** to compare **two** fields.

```python
from pydantic import BaseModel, model_validator

class Booking(BaseModel):
    check_in: str
    check_out: str

    @model_validator(mode="after")
    def dates_order(self) -> "Booking":
        if self.check_in >= self.check_out:
            raise ValueError("check_in must be before check_out")
        return self
```

#### Intermediate

Prefer real **`datetime`** types over **strings** for comparisons.

#### Expert

**Timezone-aware** comparisons require **consistent** **`tzinfo`**—reject **naive** **datetimes** in **public** APIs.

**Key Points (12.4.1)**

- Cross-field rules belong in **model** validators, not scattered in **routes**.

**Best Practices (12.4.1)**

- Unit test **boundary** cases (equal dates, midnight).

**Common Mistakes (12.4.1)**

- Duplicating cross-field checks in **DB** and **API** inconsistently.

---

### 12.4.2 Conditional Validation

#### Beginner

Validate **field B** only if **field A** has a value—use **`model_validator`**.

```python
from typing import Literal

from pydantic import BaseModel, model_validator

class Shipment(BaseModel):
    kind: Literal["digital", "physical"]
    address: str | None = None

    @model_validator(mode="after")
    def physical_needs_address(self) -> "Shipment":
        if self.kind == "physical" and not self.address:
            raise ValueError("address required for physical shipments")
        return self
```

#### Intermediate

**`context`** via **`ValidationContext`** (Pydantic advanced) can inject **feature flags** for **dynamic** rules.

#### Expert

Keep **conditional** rules **declarative** and **tested**—avoid **hidden** dependencies on **global** state.

**Key Points (12.4.2)**

- Conditional validation encodes **business** workflows.

**Best Practices (12.4.2)**

- Document **combinations** in **OpenAPI** descriptions.

**Common Mistakes (12.4.2)**

- **422** messages that don’t explain **which** condition failed.

---

### 12.4.3 Nested Model Validation

#### Beginner

Embed **`BaseModel`** types; Pydantic validates **recursively**.

```python
from pydantic import BaseModel

class Address(BaseModel):
    city: str
    zip: str


class Person(BaseModel):
    name: str
    addr: Address
```

#### Intermediate

Use **`default_factory=list`** for **mutable** defaults on nested **collections**.

#### Expert

**`max_depth`** limits for **untrusted** JSON to prevent **billion laughs** style **CPU** blowups—consider **middleware** limits on **JSON** size and **depth**.

**Key Points (12.4.3)**

- Nested models map cleanly to **OpenAPI** **`components/schemas`**.

**Best Practices (12.4.3)**

- Split **large** nested graphs into **submodels** for **reuse**.

**Common Mistakes (12.4.3)**

- **Circular** references without **`model_rebuild()`** or **`ForwardRef`**.

---

### 12.4.4 Collection Validation

#### Beginner

**`list[str]`**, **`set[int]`**, **`dict[str, float]`** each validate **elements**.

```python
from pydantic import BaseModel, Field

class Batch(BaseModel):
    tags: list[str] = Field(min_length=1, max_length=50)
```

#### Intermediate

**`conlist`**-style constraints use **`Field`** on **`list`** types in v2 via **`Annotated`** and **`MinLen`/`MaxLen`** from **`pydantic`** where applicable.

```python
from typing import Annotated

from pydantic import BaseModel, Field

class Batch2(BaseModel):
    ids: Annotated[list[int], Field(min_length=1, max_length=100)]
```

#### Expert

Validating **huge** lists is **O(n)**—paginate **input** at **HTTP** layer for **bulk** imports.

**Key Points (12.4.4)**

- **Unique** constraints may need **`model_validator`** for **`set`** semantics vs **duplicates** in **list**.

**Best Practices (12.4.4)**

- Enforce **max** item count to prevent **DoS**.

**Common Mistakes (12.4.4)**

- Using **`set`** where **order** matters for **clients**.

---

### 12.4.5 Recursive Validation

#### Beginner

Model **trees** (e.g., **comments** with **replies**) use **forward references** **`"Node"`**.

```python
from __future__ import annotations

from pydantic import BaseModel, Field

class Node(BaseModel):
    name: str
    children: list[Node] = Field(default_factory=list)
```

#### Intermediate

Call **`Node.model_rebuild()`** if using **string** annotations across **modules** with **import cycles**.

#### Expert

Limit **depth** in **`model_validator`** to prevent **malicious** **deep** recursion **stack overflow**.

```python
from pydantic import BaseModel, Field, model_validator

class NodeLimited(BaseModel):
    name: str
    children: list["NodeLimited"] = Field(default_factory=list)

    @model_validator(mode="after")
    def depth_cap(self) -> "NodeLimited":
        def depth(n: NodeLimited, d: int) -> int:
            if not n.children:
                return d
            return max(depth(c, d + 1) for c in n.children)

        if depth(self, 1) > 20:
            raise ValueError("tree too deep")
        return self
```

**Key Points (12.4.5)**

- Recursion must be **bounded** for **untrusted** input.

**Best Practices (12.4.5)**

- Prefer **adjacency list** storage in **DB** for **deep** graphs.

**Common Mistakes (12.4.5)**

- **Infinite** mutual recursion in **broken** **`model_rebuild`** graphs.

---

## 12.5 Error Handling

### 12.5.1 Validation Error Responses

#### Beginner

FastAPI catches **`RequestValidationError`** and returns **422** with **`detail`** listing **`loc`**, **`msg`**, **`type`**, **`input`**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    price: float


@app.post("/items")
def create_item(item: Item) -> Item:
    return item
```

#### Intermediate

Clients should parse **`detail`** array consistently—**`loc`** may include **`body`**, **`query`**, **`path`**.

#### Expert

**Trace ID** middleware should attach **IDs** to **422** responses for **correlation** in **logs** without leaking **stack traces**.

**Key Points (12.5.1)**

- **422** indicates **understood** syntax but **invalid** semantics/types per schema.

**Best Practices (12.5.1)**

- Document **error** schema in **OpenAPI** **`responses`**.

**Common Mistakes (12.5.1)**

- Treating **422** as **server bug** (it's **client** input).

---

### 12.5.2 Custom Error Messages

#### Beginner

Use **`PydanticCustomError`** or **`ValueError`** strings; customize globally with **exception handlers**.

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def nice_errors(_: Request, exc: RequestValidationError) -> JSONResponse:
    simplified = [
        {"field": ".".join(str(x) for x in e.get("loc", [])), "issue": e.get("msg")}
        for e in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"errors": simplified})
```

#### Intermediate

Preserve **machine-readable** **`type`** while simplifying **`msg`** for **UX**.

#### Expert

**Rate-limit** verbose **422** logging from **single IPs**—can indicate **fuzzing**.

**Key Points (12.5.2)**

- Balance **developer** diagnostics vs **user** clarity.

**Best Practices (12.5.2)**

- Never expose **internal** field names that **reveal** schema **secrets**.

**Common Mistakes (12.5.2)**

- Returning **500** due to **unhandled** **`ValidationError`** in **dependencies**.

---

### 12.5.3 Error Details

#### Beginner

Each error dict may include **`ctx`** with **interpolation** values from **`PydanticCustomError`**.

#### Intermediate

**`input`** may contain **raw** user data—**mask** passwords in **logs** and **error** redaction layers.

#### Expert

**GDPR**: logging **raw** **`input`** for **validation** failures may **store PII** unintentionally—**scrub** fields.

**Key Points (12.5.3)**

- **`ctx`** helps **i18n** templates on **clients**.

**Best Practices (12.5.3)**

- Add **`instance`** URI in problem+json style APIs if adopting **RFC 7807**.

**Common Mistakes (12.5.3)**

- Assuming **`loc`** is always **flat**—it’s **nested** for **deep** models.

---

### 12.5.4 Partial Errors

#### Beginner

**Batch** endpoints may validate **each** item—collect errors vs **fail-fast**. Pydantic **`validate_python`** on **each** element enables **per-index** errors.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ValidationError

app = FastAPI()


class Row(BaseModel):
    sku: str
    qty: int


@app.post("/import-rows")
def import_rows(rows: list[dict]) -> dict[str, list]:
    errors: list[dict] = []
    ok: list[Row] = []
    for i, r in enumerate(rows):
        try:
            ok.append(Row.model_validate(r))
        except ValidationError as e:
            errors.append({"index": i, "errors": e.errors()})
    if errors:
        raise HTTPException(status_code=422, detail={"partial": errors, "accepted": len(ok)})
    return {"imported": len(ok)}
```

#### Intermediate

**Transactional** imports should **reject all** on any error—choose **policy** explicitly.

#### Expert

**Idempotent** bulk APIs may **upsert** valid rows while reporting **invalid** ones—requires **careful** **DB** transaction design.

**Key Points (12.5.4)**

- **Partial** success is **hard** for clients—document **behavior**.

**Best Practices (12.5.4)**

- Return **indices** and **stable** error codes per row.

**Common Mistakes (12.5.4)**

- **Silent** drops of invalid **rows** without **reporting**.

---

### 12.5.5 Error Formatting

#### Beginner

Standardize **`{"code", "message", "details"}`** wrapper via **exception handler** for **all** errors.

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def fmt(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "validation_error",
                "details": exc.errors(),
            }
        },
    )
```

#### Intermediate

**RFC 7807 Problem Details** is a **common** enterprise standard—map **`detail`** fields accordingly.

#### Expert

**Content negotiation** with the **`Accept`** header for **JSON** vs **XML** errors is rare in **pure JSON** APIs—pick **one** format.

**Key Points (12.5.5)**

- Consistent **error envelopes** simplify **SDK** wrappers.

**Best Practices (12.5.5)**

- Version **error** schema with **`api_version`** field if **breaking** changes occur.

**Common Mistakes (12.5.5)**

- Different **error** shapes per **endpoint** without **reason**.

---

## 12.6 Advanced Validation

### 12.6.1 Validation Hooks

#### Beginner

**`model_validator`** and **`field_validator`** are the primary **hooks**. **`__init_subclass__`** rarely needed in Pydantic v2 apps.

#### Intermediate

Use **`WrapValidator`** to **intercept** and **delegate**—useful for **logging** or **metrics** around validation.

```python
from typing import Annotated, Any, Callable

from pydantic import WrapValidator, BaseModel


def log_validator(value: Any, handler: Callable[[Any], Any]) -> Any:
    # before: inspect value
    result = handler(value)
    # after: inspect result
    return result


LoggedStr = Annotated[str, WrapValidator(log_validator)]


class M(BaseModel):
    s: LoggedStr
```

#### Expert

**Instrumentation**: emit **histograms** of **validation time** per **route** in **middleware**—cheaper than per-field hooks at scale.

**Key Points (12.6.1)**

- Hooks should stay **fast**—no **network** calls.

**Best Practices (12.6.1)**

- Feature-flag **expensive** diagnostics.

**Common Mistakes (12.6.1)**

- Raising **non-ValueError** exceptions that **bypass** Pydantic **error** formatting.

---

### 12.6.2 Root Validators

#### Beginner

In Pydantic v2, **`model_validator(mode="before"|"after")`** replaces v1 **`@root_validator`**. Think **“root” = whole model**.

```python
from pydantic import BaseModel, model_validator

class Totals(BaseModel):
    subtotal: float
    tax: float
    total: float

    @model_validator(mode="after")
    def total_matches(self) -> "Totals":
        if abs(self.total - (self.subtotal + self.tax)) > 0.01:
            raise ValueError("total must equal subtotal + tax")
        return self
```

#### Intermediate

**`before`** root validators can **inject** computed fields before **field** validation—**powerful** and **risky**.

#### Expert

**Financial** rounding policies (**`ROUND_HALF_UP`**) belong in **one** place—often **`model_validator`** + **Decimal** types.

**Key Points (12.6.2)**

- **Root** validation is the **last line** for **consistency** across fields.

**Best Practices (12.6.2)**

- Prefer **smaller** models over **god** models requiring **huge** root validators.

**Common Mistakes (12.6.2)**

- Using **float** equality for **money** in **root** checks.

---

### 12.6.3 Config Validators

#### Beginner

**`model_config = ConfigDict(...)`** controls coercion, **alias** behavior, **str** validation, etc.—not validators per se but shapes **validation**.

```python
from pydantic import BaseModel, ConfigDict, Field

class Aliased(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: int = Field(alias="userId")
```

#### Intermediate

**`validate_assignment=True`** revalidates on **attribute** set—useful for **long-lived** models, rare in **FastAPI** request models.

#### Expert

**`json_schema_extra`** adds **examples** for **OpenAPI**—improves **integration** testing in **Swagger**.

**Key Points (12.6.3)**

- **Config** changes **global** model behavior—**test** exhaustively.

**Best Practices (12.6.3)**

- Keep **`model_config`** **minimal**—defaults are usually **right** for **API** models.

**Common Mistakes (12.6.3)**

- **`extra="allow"`** accidentally letting **unknown** fields **silently** through **security** boundaries.

---

### 12.6.4 Dynamic Validation

#### Beginner

**Dynamic** rules (feature flags) can be implemented by passing **`context`** to **`model_validate`**—FastAPI integration requires **custom** dependency that builds **context**.

```python
from fastapi import FastAPI, Depends
from pydantic import BaseModel, ValidationError

app = FastAPI()


class Payload(BaseModel):
    feature_x: bool


def strict_mode() -> bool:
    return False


@app.post("/ctx")
def with_ctx(
    data: dict,
    strict: bool = Depends(strict_mode),
) -> dict:
    try:
        Payload.model_validate(data, context={"strict": strict})
    except ValidationError as e:
        return {"errors": e.errors()}
    return {"ok": True}
```

#### Intermediate

Often simpler: **branch** in **`model_validator`** reading **`os.environ`** is **test-hostile**—prefer **injected** **settings**.

#### Expert

**Multi-tenant** rules may depend on **tenant** row—fetch **tenant config** in **`Depends`**, then validate **payload** against **per-tenant** **JSON Schema** if **extreme** flexibility needed.

**Key Points (12.6.4)**

- **Dynamic** validation complicates **caching** and **OpenAPI** accuracy.

**Best Practices (12.6.4)**

- Snapshot **effective** rules in **audit logs** for **compliance**.

**Common Mistakes (12.6.4)**

- **Non-deterministic** validation (**time.now()**) inside **pure** validators.

---

### 12.6.5 Performance Optimization

#### Beginner

**Smaller models** validate faster—avoid **giant** nested payloads when **paginating**.

#### Intermediate

Use **`model_validate_json`** on **raw bytes** if you have **JSON** string already—can be faster than **dict** round-trip in some paths.

#### Expert

**Orjson** response + **validate_json** pipelines—ensure **thread** safety and **benchmark** end-to-end. Consider **skipping** validation for **trusted** internal calls behind **service mesh** (still risky).

**Key Points (12.6.5)**

- Validation cost is **usually** worth it—profile before **micro-optimizing**.

**Best Practices (12.6.5)**

- **Cache** compiled **regex** and **schemas** at **import** time.

**Common Mistakes (12.6.5)**

- Validating **same** payload **twice** in **middleware** and **route**.

---

## 12.7 Validation Best Practices

### 12.7.1 Input Sanitization

#### Beginner

**Strip** whitespace, **normalize** Unicode, **remove** null bytes. Sanitization is **not** the same as **validation** but complements it.

```python
from pydantic import BaseModel, field_validator

class Comment(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def clean(cls, v: str) -> str:
        return v.replace("\x00", "").strip()
```

#### Intermediate

**HTML** sanitization belongs **before** **storage** if you render **rich text**—use **bleach** or **server-side** markdown **renderers** with **allowlists**.

#### Expert

**SQLi** is mitigated by **parameterized** queries, not **string** sanitization alone—**layer** defenses.

**Key Points (12.7.1)**

- Sanitize for **your** **output** contexts (**HTML**, **JSON**, **logs**).

**Best Practices (12.7.1)**

- Define **canonical** stored form (e.g., **NFC** Unicode).

**Common Mistakes (12.7.1)**

- **Double-escaping** HTML in **API** layer and again in **templates**.

---

### 12.7.2 Security Validation

#### Beginner

Reject **oversized** strings and **deep** JSON. Validate **enums** for **roles**—never trust **client** role fields without **auth**.

```python
from enum import Enum

from pydantic import BaseModel

class Role(str, Enum):
    user = "user"
    admin = "admin"


class Claim(BaseModel):
    role: Role
```

#### Intermediate

**File paths**, **URLs**, and **regex** patterns are **common** attack surfaces—use **allowlists**.

#### Expert

**Content Security Policy** and **CORS** are **not** **Pydantic** concerns but must align with **validation** assumptions.

**Key Points (12.7.2)**

- Validation is **part of** **security** but **not** sufficient.

**Best Practices (12.7.2)**

- Run **SAST** and **dependency** scanning; keep **Pydantic** updated.

**Common Mistakes (12.7.2)**

- **Trusting** **`client`**-supplied **`user_id`** in **body** without **session** binding.

---

### 12.7.3 Business Logic Validation

#### Beginner

**Pydantic** validates **shape**; **services** validate **state** (“**coupon** still valid”, “**seat** available”). Keep **separation** clear.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Order(BaseModel):
    sku: str
    qty: int


@app.post("/order")
def place_order(o: Order) -> dict[str, str]:
    if o.sku not in {"BOOK", "MUG"}:
        raise HTTPException(status_code=400, detail="Unknown SKU")
    return {"status": "placed"}
```

#### Intermediate

Return **409 Conflict** when **resource** state rejects operation—more precise than **400**.

#### Expert

**Sagas** for **distributed** validation—**local** Pydantic **cannot** know **remote** **inventory** without **calls**.

**Key Points (12.7.3)**

- Don’t **bloat** models with **DB** queries—use **dependencies**.

**Best Practices (12.7.3)**

- Make **idempotent** **order** APIs when possible.

**Common Mistakes (12.7.3)**

- Catching **`IntegrityError`** only—**race** conditions still exist.

---

### 12.7.4 Validation Organization

#### Beginner

Place **request** models in **`schemas.py`**, **domain** models elsewhere if different. FastAPI **imports** schemas for **routes**.

#### Intermediate

**Shared** **`BaseModel`** mixins for **`id`**, **`timestamps`** reduce duplication.

#### Expert

**Packages** per **bounded context** in large systems—avoid **one** **`models.py`** **megalith**.

**Key Points (12.7.4)**

- Organization impacts **onboarding** and **reviewability**.

**Best Practices (12.7.4)**

- Mirror **OpenAPI** **tags** with **module** structure.

**Common Mistakes (12.7.4)**

- **Circular** imports between **routes** and **schemas**—extract **shared** types.

---

### 12.7.5 Documentation

#### Beginner

Use **`Field(description=..., examples=[...])`** so **Swagger** shows **helpful** hints.

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    age: int = Field(ge=0, le=150, description="Age in full years", examples=[30])
```

#### Intermediate

Publish **markdown** API guides for **complex** validation rules **OpenAPI** cannot express (**conditional** logic).

#### Expert

**Contract tests** (**Schemathesis**, **Dredd**) verify **docs** match **runtime**.

**Key Points (12.7.5)**

- **Docs** are part of the **API** product.

**Best Practices (12.7.5)**

- Include **changelog** entries for **stricter** validation.

**Common Mistakes (12.7.5)**

- **Examples** that **don’t** actually **validate**—breaks **trust**.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- **Pydantic v2** provides **`field_validator`** and **`model_validator`** for **field-level** and **cross-field** rules.
- **`Field`** constraints cover **common** **string/numeric** patterns and integrate with **OpenAPI**.
- **Types**, **unions**, and **custom `Annotated` types** structure **reuse** and **clarity**.
- **422** responses are **structured**—standardize **error envelopes** for clients.
- **Validation** splits among **schema** (shape), **sanitization** (safety), and **business** rules (state).

### Chapter Best Practices

- Prefer **`model_validator(mode="after")`** for **cross-field** consistency.
- Use **`strict`** mode for **high-assurance** public APIs when **coercion** is undesirable.
- **Bound** recursion, **collection sizes**, and **string lengths** for **untrusted** input.
- Keep **validators** **free of I/O**; use **`Depends`** for **database-backed** checks.
- Document **error** formats and **examples** that **pass** validation.

### Chapter Common Mistakes

- Mixing **float** and **money**.
- **Unbounded** **nested** JSON from clients.
- **Leaking** **sensitive** **`input`** fields in **logs** on **422**.
- **Inconsistent** **422** vs **400** semantics across routes.
- **God models** with **dozens** of **interdependent** fields and **fragile** **root** validators.

---
