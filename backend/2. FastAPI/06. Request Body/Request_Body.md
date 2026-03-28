# Request Body

## 📑 Table of Contents

- [6.1 Pydantic Models Basics](#61-pydantic-models-basics)
  - [6.1.1 Creating Models](#611-creating-models)
  - [6.1.2 Field Types](#612-field-types)
  - [6.1.3 Model Validation](#613-model-validation)
  - [6.1.4 Model Documentation](#614-model-documentation)
  - [6.1.5 Nested Models](#615-nested-models)
- [6.2 Request Body Structure](#62-request-body-structure)
  - [6.2.1 Single Request Body](#621-single-request-body)
  - [6.2.2 Multiple Request Bodies](#622-multiple-request-bodies)
  - [6.2.3 Body with Path Parameters](#623-body-with-path-parameters)
  - [6.2.4 Body with Query Parameters](#624-body-with-query-parameters)
  - [6.2.5 Mixed Parameters](#625-mixed-parameters)
- [6.3 Field Validation](#63-field-validation)
  - [6.3.1 Field() Function](#631-field-function)
  - [6.3.2 Type Validation](#632-type-validation)
  - [6.3.3 min_length and max_length](#633-min_length-and-max_length)
  - [6.3.4 gt, gte, lt, lte](#634-gt-gte-lt-lte)
  - [6.3.5 pattern (Regex)](#635-pattern-regex)
  - [6.3.6 Custom Validators](#636-custom-validators)
- [6.4 Advanced Field Configuration](#64-advanced-field-configuration)
  - [6.4.1 title and description](#641-title-and-description)
  - [6.4.2 default and default_factory](#642-default-and-default_factory)
  - [6.4.3 alias for Field Mapping](#643-alias-for-field-mapping)
  - [6.4.4 exclude_unset, exclude_none](#644-exclude_unset-exclude_none)
  - [6.4.5 example in OpenAPI](#645-example-in-openapi)
- [6.5 Nested Models (Advanced)](#65-nested-models-advanced)
  - [6.5.1 Model within Model](#651-model-within-model)
  - [6.5.2 Deep Nesting](#652-deep-nesting)
  - [6.5.3 Lists of Models](#653-lists-of-models)
  - [6.5.4 Optional Nested Models](#654-optional-nested-models)
  - [6.5.5 Circular References](#655-circular-references)
- [6.6 Pydantic Advanced Features](#66-pydantic-advanced-features)
  - [6.6.1 Custom Validators](#661-custom-validators)
  - [6.6.2 Computed Fields](#662-computed-fields)
  - [6.6.3 Model Configuration](#663-model-configuration)
  - [6.6.4 Model Serialization](#664-model-serialization)
  - [6.6.5 Dynamic Model Creation](#665-dynamic-model-creation)
- [6.7 Request Body Documentation](#67-request-body-documentation)
  - [6.7.1 Schema Examples](#671-schema-examples)
  - [6.7.2 Field Descriptions](#672-field-descriptions)
  - [6.7.3 Model Descriptions](#673-model-descriptions)
  - [6.7.4 Documentation in Swagger](#674-documentation-in-swagger)
  - [6.7.5 Custom Schemas](#675-custom-schemas)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 6.1 Pydantic Models Basics

### 6.1.1 Creating Models

#### Beginner

A **Pydantic `BaseModel`** class describes the shape of JSON in the request body. Subclass `BaseModel`, declare attributes with types, and use the model as a parameter in a **`POST`/`PUT`/`PATCH`** route.

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

FastAPI **parses** JSON into the model, validates fields, and passes a **model instance** to your function. Invalid JSON or failed validation returns **422** with detailed errors.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class UserCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str
    age: int


@app.post("/users")
def create_user(u: UserCreate) -> UserCreate:
    return u
```

#### Expert

Models can use **`model_config`** (`ConfigDict`) for **forbid** extra keys, **alias** generation, **validation** strictness, and more—align with your API **versioning** strategy.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class StrictItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sku: str
    qty: int


@app.post("/cart/lines")
def add_line(line: StrictItem) -> StrictItem:
    return line
```

**Key Points (6.1.1)**

- `BaseModel` + typed fields = request body schema + validation.
- FastAPI injects the model instance after successful parsing.

**Best Practices (6.1.1)**

- One model per **resource command** (`CreateUser`, `UpdateUser`).
- Enable **`extra="forbid"`** for public APIs when you want strict contracts.

**Common Mistakes (6.1.1)**

- Reusing one mega-model for **create** and **update** with wrong optional/required rules.
- Forgetting that **GET** typically should not take a body (proxies/clients vary).

---

### 6.1.2 Field Types

#### Beginner

Fields can use **`str`, `int`, `float`, `bool`, `datetime`, `UUID`**, nested models, **`list[str]`**, **`dict[str, int]`**, and more.

```python
from datetime import datetime
from uuid import UUID

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Event(BaseModel):
    id: UUID
    at: datetime
    score: float
    live: bool


@app.post("/events")
def create_event(e: Event) -> Event:
    return e
```

#### Intermediate

Use **`Optional[T]`** or **`T | None`** for nullable JSON **`null`**. For list defaults, use **`Field(default_factory=list)`**—never use a mutable **`[]`** as a default.

```python
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Profile(BaseModel):
    display_name: str
    bio: Optional[str] = None
    tags: list[str] = Field(default_factory=list)


@app.post("/profiles")
def save_profile(p: Profile) -> Profile:
    return p
```

#### Expert

**Annotated** metadata (`Field`, custom validators) attaches constraints without changing the logical Python type. Document **timezone** policies for datetimes.

```python
from decimal import Decimal
from typing import Annotated

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class InvoiceLine(BaseModel):
    desc: str
    amount: Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]


@app.post("/lines")
def line(l: InvoiceLine) -> InvoiceLine:
    return l
```

**Key Points (6.1.2)**

- JSON types map naturally to Python typing constructs.
- `Optional` allows explicit JSON `null`.

**Best Practices (6.1.2)**

- Use **`Decimal`** for money fields.
- Avoid **`dict[str, Any]`** unless you truly need opaque bags.

**Common Mistakes (6.1.2)**

- Using **`float`** for currency.
- Mutable **`list` / `dict` defaults** on models.

---

### 6.1.3 Model Validation

#### Beginner

Validation runs **before** your handler executes. Types are coerced where Pydantic allows.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Box(BaseModel):
    w: int
    h: int


@app.post("/box")
def box(b: Box) -> Box:
    return b
```

#### Intermediate

Use **`field_validator`** for per-field normalization (lowercasing emails, trimming).

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class EmailUser(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.lower()


@app.post("/register")
def register(u: EmailUser) -> EmailUser:
    return u
```

#### Expert

**Multi-field** validation uses **`model_validator`** to enforce invariants across fields (e.g., `end > start`).

```python
from fastapi import FastAPI
from pydantic import BaseModel, model_validator


class Range(BaseModel):
    start: int
    end: int

    @model_validator(mode="after")
    def ordered(self) -> Range:
        if self.end <= self.start:
            raise ValueError("end must be greater than start")
        return self


@app.post("/range")
def range_ep(r: Range) -> Range:
    return r
```

**Key Points (6.1.3)**

- Validation failures produce **422** via FastAPI’s exception handling.
- Validators should raise **`ValueError`** with clear messages.

**Best Practices (6.1.3)**

- Keep validators **pure**; use **`Depends`** for DB checks.
- Test **edge** JSON payloads in unit tests.

**Common Mistakes (6.1.3)**

- Side effects (DB writes) inside **`field_validator`**.
- Catching **`ValidationError`** incorrectly and masking client errors.

---

### 6.1.4 Model Documentation

#### Beginner

Add **`Field(description=...)`** so OpenAPI shows **human-readable** help next to each property.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Item(BaseModel):
    name: str = Field(description="Display name of the item")
    price: float = Field(description="Price in USD, tax excluded")


@app.post("/items")
def create_item(item: Item) -> Item:
    return item
```

#### Intermediate

Use **`json_schema_extra`** for **examples** at model level.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI()


class Pet(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={"examples": [{"name": "Ada", "species": "dog"}]},
    )

    name: str = Field(description="Pet name")
    species: str


@app.post("/pets")
def create_pet(p: Pet) -> Pet:
    return p
```

#### Expert

Prefer **`ConfigDict`** consistently in Pydantic v2 codebases.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI()


class Part(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={"example": {"sku": "ABC-1", "qty": 3}},
    )

    sku: str = Field(description="Stock keeping unit")
    qty: int = Field(ge=1)


@app.post("/parts")
def part(p: Part) -> Part:
    return p
```

**Key Points (6.1.4)**

- Schema documentation drives **Swagger** and **client codegen**.
- Examples reduce integration friction.

**Best Practices (6.1.4)**

- Document **units**, **formats** (ISO-8601), and **enums**.
- Keep **examples** aligned with validation.

**Common Mistakes (6.1.4)**

- Empty descriptions on **non-obvious** fields.
- **Wrong** examples that fail validation in “Try it out”.

---

### 6.1.5 Nested Models

#### Beginner

A field’s type can be **another `BaseModel`**, representing nested JSON objects.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Address(BaseModel):
    city: str
    zip: str


class Person(BaseModel):
    name: str
    address: Address


@app.post("/people")
def person(p: Person) -> Person:
    return p
```

#### Intermediate

Nesting composes **reusable** pieces (`Address`, `Money`, `GeoPoint`) across multiple request models.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Geo(BaseModel):
    lat: float
    lng: float


class Place(BaseModel):
    label: str
    geo: Geo


@app.post("/places")
def place(p: Place) -> Place:
    return p
```

#### Expert

Deep nesting affects **performance** and **error message** complexity—flatten when it improves **UX** without losing invariants.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Line(BaseModel):
    sku: str
    qty: int


class Order(BaseModel):
    id: str
    lines: list[Line]


@app.post("/orders")
def order(o: Order) -> Order:
    return o
```

**Key Points (6.1.5)**

- Nested models mirror **JSON object** structure.
- Lists of models mirror **JSON arrays of objects**.

**Best Practices (6.1.5)**

- Extract shared sub-models to **modules** to avoid drift.
- Cap **list sizes** at application layer if needed.

**Common Mistakes (6.1.5)**

- **Null** vs missing nested object confusion—use **`Optional[SubModel]`** deliberately.

---

## 6.2 Request Body Structure

### 6.2.1 Single Request Body

#### Beginner

The most common pattern: **one** Pydantic model parameter—FastAPI treats it as the **entire JSON body**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Note(BaseModel):
    title: str
    body: str


@app.post("/notes")
def create_note(n: Note) -> Note:
    return n
```

#### Intermediate

Use **`response_model`** to filter output fields and document responses separately from the request model.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class NoteIn(BaseModel):
    title: str
    body: str


class NoteOut(BaseModel):
    id: int
    title: str


@app.post("/notes", response_model=NoteOut)
def create_note(n: NoteIn) -> NoteOut:
    return NoteOut(id=1, title=n.title)
```

#### Expert

For **large** payloads, consider **streaming** or **multipart** for uploads alongside JSON metadata models.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Job(BaseModel):
    type: str
    payload: dict[str, str]


@app.post("/jobs")
def enqueue(j: Job) -> Job:
    return j
```

**Key Points (6.2.1)**

- One body model = one JSON object root.
- `response_model` shapes **outbound** schema.

**Best Practices (6.2.1)**

- Separate **`In`/`Out`** models when fields differ (passwords, tokens).
- Validate **size** at reverse proxy where possible.

**Common Mistakes (6.2.1)**

- Expecting **multiple** JSON roots (invalid JSON).
- Returning ORM objects without **`response_model`** control (leaks fields).

---

### 6.2.2 Multiple Request Bodies

#### Beginner

OpenAPI **expects one body** per operation. Compose multiple conceptual payloads into **one** wrapper model.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class User(BaseModel):
    name: str


class Item(BaseModel):
    title: str


class Bundle(BaseModel):
    user: User
    item: Item


@app.post("/bundle")
def bundle(b: Bundle) -> Bundle:
    return b
```

#### Intermediate

Prefer **single wrapper** or **multipart** over non-standard double JSON bodies.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Audit(BaseModel):
    actor: str
    reason: str


class Payload(BaseModel):
    data: str


class Command(BaseModel):
    audit: Audit
    payload: Payload


@app.post("/cmd")
def cmd(c: Command) -> Command:
    return c
```

#### Expert

For **webhooks** with signatures, combine JSON body model with **header** dependencies for HMAC verification.

```python
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Hook(BaseModel):
    event: str


@app.post("/hook")
def hook(
    body: Hook,
    sig: str | None = Header(default=None, alias="X-Signature"),
) -> dict[str, str]:
    if not sig:
        raise HTTPException(401, "missing signature")
    return {"event": body.event, "sig_ok": "assumed"}
```

**Key Points (6.2.2)**

- Design **one** JSON object; compose sub-objects inside.
- Multipart is the path for **file + metadata** as distinct parts.

**Best Practices (6.2.2)**

- Avoid fighting OpenAPI with exotic multi-body patterns.
- Use **clear** wrapper field names (`payload`, `meta`).

**Common Mistakes (6.2.2)**

- Assuming two independent JSON bodies without **wrapper**—not standard.
- Mixing **form** fields and JSON body incorrectly.

---

### 6.2.3 Body with Path Parameters

#### Beginner

Combine **`{path}`** parameters with a body model for **updates** to a specific resource.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ItemUpdate(BaseModel):
    price: float


@app.put("/items/{item_id}")
def update_item(item_id: int, body: ItemUpdate) -> dict[str, int | float]:
    return {"item_id": item_id, "price": body.price}
```

#### Intermediate

Name the body parameter **`user`** instead of **`body`** for readability.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class PatchUser(BaseModel):
    display_name: str | None = None


@app.patch("/users/{user_id}")
def patch_user(user_id: int, user: PatchUser) -> dict[str, int | str | None]:
    return {"user_id": user_id, "display_name": user.display_name}
```

#### Expert

**Idempotency** keys often live in **headers** while the body carries domain fields.

```python
from typing import Annotated

from fastapi import FastAPI, Header
from pydantic import BaseModel

app = FastAPI()


class Pay(BaseModel):
    amount_cents: int


@app.post("/payments/{account_id}")
def pay(
    account_id: int,
    p: Pay,
    idem: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> dict[str, int | str | None]:
    return {"account_id": account_id, "amount_cents": p.amount_cents, "idem": idem}
```

**Key Points (6.2.3)**

- Path identifies **which** resource; body carries **what** to change.
- PATCH often uses **optional** fields for partial updates.

**Best Practices (6.2.3)**

- Use **`PUT`** for full replacement, **`PATCH`** for partial when documenting honestly.
- Authorize **path id** vs session user in dependencies.

**Common Mistakes (6.2.3)**

- Duplicating the **id** in the body and path with **inconsistent** values.
- Partial update models with **required** fields that defeat PATCH semantics.

---

### 6.2.4 Body with Query Parameters

#### Beginner

Non-path, non-body parameters are **query** params—useful for **flags** like `dry_run=true` on a POST.

```python
from typing import Annotated

from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()


class Deploy(BaseModel):
    revision: str


@app.post("/deploy")
def deploy(
    d: Deploy,
    dry_run: Annotated[bool, Query()] = False,
) -> dict[str, str | bool]:
    return {"revision": d.revision, "dry_run": dry_run}
```

#### Intermediate

Use query for **control plane** options (`pretty`, `force`) and body for **domain payload**.

```python
from typing import Annotated

from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()


class ImportJob(BaseModel):
    source: str


@app.post("/import")
def import_job(
    job: ImportJob,
    async_mode: Annotated[bool, Query(alias="async")] = True,
) -> dict[str, str | bool]:
    return {"source": job.source, "async": async_mode}
```

#### Expert

**Content negotiation** is usually headers (`Accept`), not query.

```python
from typing import Annotated

from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()


class Report(BaseModel):
    title: str


@app.post("/reports")
def reports(
    r: Report,
    notify: Annotated[bool, Query()] = False,
) -> dict[str, str | bool]:
    return {"title": r.title, "notify": notify}
```

**Key Points (6.2.4)**

- Query + body in one operation is valid and common.
- Query params appear in **OpenAPI** separately from the body schema.

**Best Practices (6.2.4)**

- Avoid putting **large** data in query when a body exists.
- Document **boolean** encoding for query flags.

**Common Mistakes (6.2.4)**

- Using query for **secrets** (tokens)—prefer **headers** or body over TLS.

---

### 6.2.5 Mixed Parameters

#### Beginner

A route may include **`Path`**, **`Query`**, **`Body` model**, and **`Depends`** together.

```python
from typing import Annotated

from fastapi import FastAPI, Path, Query
from pydantic import BaseModel

app = FastAPI()


class Score(BaseModel):
    value: int


@app.post("/players/{player_id}/scores")
def add_score(
    player_id: Annotated[int, Path(gt=0)],
    game: Annotated[str, Query(min_length=1)],
    score: Score,
) -> dict[str, int | str]:
    return {"player_id": player_id, "game": game, "value": score.value}
```

#### Intermediate

Use **`Body(embed=True)`** when you need a **named** JSON key wrapping a model.

```python
from typing import Annotated

from fastapi import Body, FastAPI
from pydantic import BaseModel

app = FastAPI()


class Tag(BaseModel):
    name: str


@app.post("/embed-demo")
def embed_demo(
    tag: Annotated[Tag, Body(embed=True)],
) -> Tag:
    return tag
```

#### Expert

**Dependency-only** parameters (`Depends`) reuse **auth**, **db sessions**, and **feature flags**.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI()


def require_token(x_token: Annotated[str | None, Header()] = None) -> str:
    if not x_token:
        raise HTTPException(401, "missing token")
    return x_token


class Msg(BaseModel):
    text: str


@app.post("/secure-echo")
def secure_echo(msg: Msg, _: str = Depends(require_token)) -> Msg:
    return msg
```

**Key Points (6.2.5)**

- Mixed injection is a core FastAPI strength.
- `Body(embed=True)` changes JSON shape—document carefully.

**Best Practices (6.2.5)**

- Order parameters for **readers**: path, query, body, dependencies.
- Keep handlers **thin**; push cross-cutting to `Depends`.

**Common Mistakes (6.2.5)**

- **`Body(embed=True)`** surprising clients expecting a bare object.
- Conflicting **names** between parameters.

---

## 6.3 Field Validation

### 6.3.1 Field() Function

#### Beginner

`Field()` from Pydantic attaches **constraints** and **metadata** to model attributes: defaults, descriptions, bounds, regex, and more.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Product(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    qty: int = Field(ge=1, default=1)


@app.post("/products")
def create_product(p: Product) -> Product:
    return p
```

#### Intermediate

`Field` replaces bare defaults when you need **both** a default and **validation** metadata in one place.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class PageReq(BaseModel):
    size: int = Field(default=20, ge=1, le=200, description="Page size")


@app.post("/page-query")
def page_query(q: PageReq) -> PageReq:
    return q
```

#### Expert

Combine **`Annotated`** with `Field` for reusable **constraint types** (branded scalars) across models.

```python
from typing import Annotated

from fastapi import FastAPI
from pydantic import BaseModel, Field

PositiveInt = Annotated[int, Field(gt=0)]


class Transfer(BaseModel):
    from_account: PositiveInt
    to_account: PositiveInt
    cents: PositiveInt


@app.post("/transfer")
def transfer(t: Transfer) -> Transfer:
    return t
```

**Key Points (6.3.1)**

- `Field` is the primary API for **per-field** rules in Pydantic v2 models.
- Defaults + constraints live together cleanly.

**Best Practices (6.3.1)**

- Prefer **`Field(default_factory=...)`** for mutable defaults.
- Mirror DB constraints in **Field** where practical.

**Common Mistakes (6.3.1)**

- Using **`Field`** incorrectly on **non-model** contexts.
- Duplicating the same **`ge`/`le`** in **DB** and **not** in schema.

---

### 6.3.2 Type Validation

#### Beginner

Pydantic validates **each field’s type** recursively for nested models and collection element types.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Point(BaseModel):
    x: int
    y: int


@app.post("/point")
def point(p: Point) -> Point:
    return p
```

#### Intermediate

Use **`Literal`** and **`Enum`** to restrict values to **closed sets**.

```python
from enum import Enum

from fastapi import FastAPI
from pydantic import BaseModel


class Color(str, Enum):
    red = "red"
    blue = "blue"


class Theme(BaseModel):
    primary: Color


app = FastAPI()


@app.post("/theme")
def theme(t: Theme) -> Theme:
    return t
```

#### Expert

**Union** types (`str | int`) validate against **variants** in order—order matters for performance and error messages.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class IdOrName(BaseModel):
    ref: str | int


@app.post("/lookup")
def lookup(x: IdOrName) -> IdOrName:
    return x
```

**Key Points (6.3.2)**

- Types compose: **`list[SubModel]`**, **`dict[str, int]`**, etc.
- `Enum` / `Literal` encode **business enums** in schema.

**Best Practices (6.3.2)**

- Prefer **`Enum`** for stable wire values.
- Avoid overly broad **`Union`** trees without discriminator fields.

**Common Mistakes (6.3.2)**

- **`Union`** order causing surprising coercion.
- Using **`Any`** and losing validation benefits.

---

### 6.3.3 min_length and max_length

#### Beginner

String fields support **`min_length`** / **`max_length`** via `Field`.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Tweet(BaseModel):
    text: str = Field(min_length=1, max_length=280)


@app.post("/tweet")
def tweet(t: Tweet) -> Tweet:
    return t
```

#### Intermediate

For **list** fields, `min_length`/`max_length` can constrain **number of items** (Pydantic v2 `Field` on collections).

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Batch(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=100)


@app.post("/batch")
def batch(b: Batch) -> Batch:
    return b
```

#### Expert

**Unicode** length vs user-perceived “character” count may differ—document for internationalized text.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Bio(BaseModel):
    text: str = Field(max_length=500)


@app.post("/bio")
def bio(b: Bio) -> Bio:
    return b
```

**Key Points (6.3.3)**

- Length constraints catch **empty** and **overlong** input early.
- Collection length limits reduce **abuse**.

**Best Practices (6.3.3)**

- Align `max_length` with **DB columns**.
- Combine with **regex** for structured tokens.

**Common Mistakes (6.3.3)**

- Using string length limits on **`int`** fields.
- Emoji-heavy UX expecting **grapheme** counts.

---

### 6.3.4 gt, gte, lt, lte

#### Beginner

Numeric **`Field`** constraints include **`gt`, `ge`, `lt`, `le`** (greater/less, inclusive or exclusive).

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Rating(BaseModel):
    stars: int = Field(ge=1, le=5)


@app.post("/rating")
def rating(r: Rating) -> Rating:
    return r
```

#### Intermediate

**Float** and **Decimal** work similarly—prefer **Decimal** for money.

```python
from decimal import Decimal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Price(BaseModel):
    usd: Decimal = Field(gt=0, max_digits=10, decimal_places=2)


@app.post("/price")
def price(p: Price) -> Price:
    return p
```

#### Expert

OpenAPI reflects **inclusive/exclusive** min/max; verify **client codegen** compatibility.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Sample(BaseModel):
    ratio: float = Field(gt=0.0, lt=1.0)


@app.post("/sample")
def sample(s: Sample) -> Sample:
    return s
```

**Key Points (6.3.4)**

- Numeric bounds encode **domain rules** declaratively.
- Exclusive min/max differs from SQL `BETWEEN`—stay consistent.

**Best Practices (6.3.4)**

- Use **`ge=0`** for counts; **`gt=0`** for strictly positive IDs.
- Document **inclusive** bounds in field descriptions.

**Common Mistakes (6.3.4)**

- Off-by-one between **`lt`** and **`le`** vs SQL.
- Using **float** for **money** with bounds.

---

### 6.3.5 pattern (Regex)

#### Beginner

`Field(pattern=r"...")` validates strings with a **regular expression**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class USZip(BaseModel):
    code: str = Field(pattern=r"^\d{5}(-\d{4})?$")


@app.post("/zip")
def zip_code(z: USZip) -> USZip:
    return z
```

#### Intermediate

Anchor patterns and keep them **simple** to reduce **ReDoS** risk.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Sku(BaseModel):
    sku: str = Field(pattern=r"^[A-Z]{3}-\d{4}$")


@app.post("/sku")
def sku(s: Sku) -> Sku:
    return s
```

#### Expert

Prefer **`Enum`** when the set is **small**; use regex for **structured** but **infinite** sets (ISO-like codes with rules).

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class IsoCurrency(BaseModel):
    code: str = Field(pattern=r"^[A-Z]{3}$")


@app.post("/currency")
def currency(c: IsoCurrency) -> IsoCurrency:
    return c
```

**Key Points (6.3.5)**

- Regex validation is **declarative** and appears in JSON Schema.
- Test **edge cases** independently.

**Best Practices (6.3.5)**

- Document **case sensitivity**.
- Avoid catastrophic backtracking on **user-controlled** patterns.

**Common Mistakes (6.3.5)**

- Unanchored regex accepting **partial** garbage.
- Regex where **`Enum`** would be clearer.

---

### 6.3.6 Custom Validators

#### Beginner

`field_validator` processes a single field; raise **`ValueError`** on invalid input.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class User(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def alnum(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError("alphanumeric only")
        return v


@app.post("/user")
def user(u: User) -> User:
    return u
```

#### Intermediate

`model_validator` enforces **cross-field** rules and can normalize derived fields.

```python
from fastapi import FastAPI
from pydantic import BaseModel, model_validator


class Window(BaseModel):
    start_hour: int
    end_hour: int

    @model_validator(mode="after")
    def hours(self) -> Window:
        if not (0 <= self.start_hour < self.end_hour <= 24):
            raise ValueError("invalid hour window")
        return self


@app.post("/window")
def window(w: Window) -> Window:
    return w
```

#### Expert

Use **`ValidationInfo`** and **`field_validator(mode="wrap")`** for advanced pipelines when needed; keep **I/O** out of validators.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class HexColor(BaseModel):
    value: str

    @field_validator("value")
    @classmethod
    def normalize_hex(cls, v: str) -> str:
        if not v.startswith("#"):
            v = "#" + v
        if len(v) not in (4, 7):
            raise ValueError("bad hex color")
        return v.lower()


@app.post("/color")
def color(c: HexColor) -> HexColor:
    return c
```

**Key Points (6.3.6)**

- Validators centralize **normalization** and **invariants**.
- `ValueError` becomes **422** details for clients.

**Best Practices (6.3.6)**

- Unit-test validators **without** HTTP.
- Prefer **`model_validator`** for multi-field constraints.

**Common Mistakes (6.3.6)**

- Database access inside **validators**.
- Raising **`HTTPException`** instead of **`ValueError`**.

---

## 6.4 Advanced Field Configuration

### 6.4.1 title and description

#### Beginner

`Field(title="...", description="...")` enriches **JSON Schema** for better docs UIs.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Item(BaseModel):
    name: str = Field(title="Name", description="Human-readable item title")
    price: float = Field(title="Unit price", description="USD, excluding tax")


@app.post("/items")
def item(i: Item) -> Item:
    return i
```

#### Intermediate

Titles should be **short**; descriptions carry **constraints** and examples.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class SLA(BaseModel):
    ms: int = Field(
        title="Latency budget (ms)",
        description="Maximum allowed latency in milliseconds.",
        ge=1,
        le=60_000,
    )


@app.post("/sla")
def sla(s: SLA) -> SLA:
    return s
```

#### Expert

For **internal** fields, you can still document **deprecated** replacements in `description` text.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Legacy(BaseModel):
    old_key: str | None = Field(default=None, description="Deprecated: use `new_key`.")
    new_key: str | None = None


@app.post("/legacy")
def legacy(l: Legacy) -> Legacy:
    return l
```

**Key Points (6.4.1)**

- `title` / `description` surface in **OpenAPI** and Swagger.
- Good docs reduce **integration** time.

**Best Practices (6.4.1)**

- Mention **units** and **formats** in `description`.
- Keep `title` concise.

**Common Mistakes (6.4.1)**

- **Misleading** descriptions vs actual validation.
- Using `title` for **long** prose.

---

### 6.4.2 default and default_factory

#### Beginner

`Field(default=...)` sets the value when the client **omits** the field.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Options(BaseModel):
    verbose: bool = Field(default=False)


@app.post("/run")
def run(o: Options) -> Options:
    return o
```

#### Intermediate

Use **`default_factory=list`** / **`dict`** for mutable defaults.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Tags(BaseModel):
    tags: list[str] = Field(default_factory=list)


@app.post("/tags")
def tags(t: Tags) -> Tags:
    return t
```

#### Expert

**Callable factories** can generate **UUIDs** or timestamps—ensure they are **side-effect safe** for your use case.

```python
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))


@app.post("/job")
def job(j: Job) -> Job:
    return j
```

**Key Points (6.4.2)**

- `default_factory` avoids shared **mutable** state.
- Defaults affect **OpenAPI** “required” flags.

**Best Practices (6.4.2)**

- Prefer explicit **`None`** defaults for **optional** semantics when needed.
- Document **server-generated** defaults if clients should omit fields.

**Common Mistakes (6.4.2)**

- Using **`[]` or `{}`** directly as defaults.
- Non-idempotent **factories** causing surprises in tests.

---

### 6.4.3 alias for Field Mapping

#### Beginner

`Field(alias="camelCase")` maps JSON field names to **Pythonic** attribute names.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Dto(BaseModel):
    model_config = {"populate_by_name": True}

    item_id: int = Field(alias="itemId")


@app.post("/dto")
def dto(d: Dto) -> Dto:
    return d
```

#### Intermediate

`populate_by_name` allows **either** alias or field name on input depending on configuration—verify **serialization** side as well.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI()


class ClientPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    first_name: str = Field(alias="firstName")


@app.post("/client")
def client(p: ClientPayload) -> ClientPayload:
    return p
```

#### Expert

For responses, control **`serialization_alias`** vs **`validation_alias`** in Pydantic v2 when input/output names differ.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Out(BaseModel):
    model_config = {"populate_by_name": True}

    user_name: str = Field(serialization_alias="userName")


@app.post("/out")
def out(o: Out) -> Out:
    return o
```

**Key Points (6.4.3)**

- Aliases bridge **JavaScript** naming and **Python** naming.
- Config flags control **strictness** of accepted keys.

**Best Practices (6.4.3)**

- Standardize **`alias` policy** per API version.
- Test **by_alias** serialization for public JSON.

**Common Mistakes (6.4.3)**

- Forgetting **`populate_by_name`** and rejecting Python names.
- Mismatched **alias** between **request** and **response** models.

---

### 6.4.4 exclude_unset, exclude_none

#### Beginner

When echoing or re-serializing models, **`model_dump(exclude_unset=True)`** omits fields the client never sent—useful for **PATCH** semantics in your service layer.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Patch(BaseModel):
    title: str | None = None
    body: str | None = None


@app.patch("/echo")
def echo(p: Patch) -> dict:
    return p.model_dump(exclude_unset=True)
```

#### Intermediate

**`exclude_none=True`** removes keys with **`None`** values from dumps—handy for sparse updates.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Profile(BaseModel):
    bio: str | None = None
    url: str | None = None


@app.post("/profile-dump")
def profile(p: Profile) -> dict:
    return p.model_dump(exclude_none=True)
```

#### Expert

FastAPI **`response_model`** combined with **return dict** patterns may need careful use of **`exclude_unset`** when building **SQL UPDATE** sets.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class RowPatch(BaseModel):
    a: int | None = None
    b: int | None = None


@app.patch("/row/{row_id}")
def patch_row(row_id: int, p: RowPatch) -> dict[str, int | dict]:
    return {"row_id": row_id, "patch": p.model_dump(exclude_unset=True)}
```

**Key Points (6.4.4)**

- `exclude_unset` distinguishes **omitted** vs **explicit null**.
- Critical for **partial update** mapping to SQL.

**Best Practices (6.4.4)**

- Combine with **transactional** updates and **optimistic locking**.
- Document **JSON merge PATCH** vs **partial** models.

**Common Mistakes (6.4.4)**

- Treating **missing** field same as **`null`** without policy.
- Dumping **`exclude_unset`** but still overwriting **non-null** DB columns incorrectly.

---

### 6.4.5 example in OpenAPI

#### Beginner

`Field(examples=[...])` or **`json_schema_extra`** supplies **examples** in generated schema.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Addr(BaseModel):
    street: str = Field(examples=["1 Market St"])
    city: str = Field(examples=["San Francisco"])


@app.post("/addr")
def addr(a: Addr) -> Addr:
    return a
```

#### Intermediate

Model-level **`model_config = ConfigDict(json_schema_extra={"example": {...}})`** documents full objects.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class OrderIn(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={"example": {"sku": "ABC", "qty": 2}},
    )

    sku: str
    qty: int


@app.post("/orders")
def order(o: OrderIn) -> OrderIn:
    return o
```

#### Expert

Keep examples **valid** under current validators; add **CI** checks that examples pass `model_validate`.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Token(BaseModel):
    jti: str = Field(min_length=8, examples=["a1b2c3d4e5f6g7h8"])


@app.post("/token")
def token(t: Token) -> Token:
    return t
```

**Key Points (6.4.5)**

- Examples improve **Try it out** and **SDK** docs.
- Invalid examples erode trust.

**Best Practices (6.4.5)**

- Use **non-sensitive** synthetic data.
- Version examples with **API** changes.

**Common Mistakes (6.4.5)**

- Examples that **violate** `pattern` or `ge`/`le`.
- Huge **blob** examples bloating `openapi.json`.

---

## 6.5 Nested Models (Advanced)

### 6.5.1 Model within Model

#### Beginner

Nest models to mirror **JSON object trees**: parent fields whose types are other **`BaseModel`** subclasses.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Money(BaseModel):
    amount: str
    currency: str


class LineItem(BaseModel):
    title: str
    price: Money


@app.post("/line")
def line(li: LineItem) -> LineItem:
    return li
```

#### Intermediate

Reuse nested models across **create**, **update**, and **response** DTOs to avoid **schema drift**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Geo(BaseModel):
    lat: float
    lng: float


class Store(BaseModel):
    name: str
    location: Geo


@app.post("/stores")
def store(s: Store) -> Store:
    return s
```

#### Expert

Consider **value objects** (money, email) as nested models even when JSON is **flat**, if validation benefits outweigh extra nesting.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class Email(BaseModel):
    address: str

    @field_validator("address")
    @classmethod
    def check_at(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("invalid email")
        return v.lower()


class Invite(BaseModel):
    to: Email


@app.post("/invite")
def invite(i: Invite) -> Invite:
    return i
```

**Key Points (6.5.1)**

- Nested models map to **nested JSON objects**.
- Shared sub-models promote **consistency**.

**Best Practices (6.5.1)**

- Keep nesting depth **shallow** for public APIs when possible.
- Version nested shapes with the **parent** resource.

**Common Mistakes (6.5.1)**

- Duplicating nested structures **inline** across models.
- **Null** object vs empty object ambiguity.

---

### 6.5.2 Deep Nesting

#### Beginner

Deep trees validate **recursively**; errors include **JSON paths** to the failing field.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class L3(BaseModel):
    z: int


class L2(BaseModel):
    y: L3


class L1(BaseModel):
    x: L2


@app.post("/deep")
def deep(v: L1) -> L1:
    return v
```

#### Intermediate

Very deep payloads risk **stack** and **performance** issues—impose **depth/size** limits at gateway or with custom validators.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Node(BaseModel):
    name: str
    children: list["Node"] = Field(default_factory=list)


Node.model_rebuild()


@app.post("/tree")
def tree(n: Node) -> Node:
    return n
```

#### Expert

For **arbitrary-depth** trees, define **recursive models** with **`model_rebuild()`** and forward references in quotes.

```python
from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field


class TreeNode(BaseModel):
    label: str
    children: list[TreeNode] = Field(default_factory=list)


@app.post("/tree2")
def tree2(n: TreeNode) -> TreeNode:
    return n
```

**Key Points (6.5.2)**

- Deep nesting complicates **errors** and **docs**.
- Recursive models need **`model_rebuild()`** in some patterns.

**Best Practices (6.5.2)**

- Prefer **adjacency lists** in JSON for huge graphs when possible.
- Add **max depth** business rules.

**Common Mistakes (6.5.2)**

- Unbounded **recursion** from untrusted clients.
- Forgetting **`model_rebuild()`** for forward refs.

---

### 6.5.3 Lists of Models

#### Beginner

`list[SubModel]` validates **each element** as a nested object.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Tag(BaseModel):
    name: str


class TaggedItem(BaseModel):
    title: str
    tags: list[Tag]


@app.post("/tagged")
def tagged(t: TaggedItem) -> TaggedItem:
    return t
```

#### Intermediate

Constrain list size with **`Field(min_length=..., max_length=...)`** on the list.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class UserRow(BaseModel):
    name: str


class BatchUser(BaseModel):
    users: list[UserRow] = Field(min_length=1, max_length=500)


@app.post("/users/batch")
def batch_users(b: BatchUser) -> BatchUser:
    return b
```

**Key Points (6.5.3)**

- Lists of models map to **JSON arrays of objects**.
- Per-item validation runs automatically.

**Best Practices (6.5.3)**

- Cap **`max_length`** for abuse prevention.
- Use **pagination** instead of megarrays when appropriate.

**Common Mistakes (6.5.3)**

- Allowing **empty** lists when at least one item is required—use `min_length=1`.

---

### 6.5.4 Optional Nested Models

#### Beginner

`Optional[SubModel] = None` means the nested object may be **absent** or **`null`** (policy depends on Pydantic null handling settings).

```python
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Extra(BaseModel):
    note: str


class Payload(BaseModel):
    title: str
    extra: Optional[Extra] = None


@app.post("/payload")
def payload(p: Payload) -> Payload:
    return p
```

#### Intermediate

Distinguish **`extra: None`** (explicit null) vs **omitted** using **`model_dump(exclude_unset=True)`** in your update logic.

```python
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Settings(BaseModel):
    theme: Optional[str] = None


@app.patch("/settings")
def settings(s: Settings) -> dict:
    return s.model_dump(exclude_unset=True)
```

#### Expert

Three-valued PATCH semantics may require **`Union[SubModel, None, MissingType]`** patterns or dedicated **JSON Merge Patch** libraries.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ProfilePatch(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None


@app.patch("/profile")
def profile(p: ProfilePatch) -> ProfilePatch:
    return p
```

**Key Points (6.5.4)**

- Optional nested models are common in **partial** updates.
- Document **null** vs **omit** behavior.

**Best Practices (6.5.4)**

- Keep PATCH models **sparse**—only mutable fields.
- Test **OpenAPI** `required` arrays for nested optionals.

**Common Mistakes (6.5.4)**

- Confusing **missing** nested object with **invalid** nested object.
- Using **`Optional`** when **empty object** `{}` is also allowed.

---

### 6.5.5 Circular References

#### Beginner

When **A** references **B** and **B** references **A**, use **forward references** in quotes and call **`model_rebuild()`**.

```python
from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel


class Parent(BaseModel):
    name: str
    child: Child | None = None


class Child(BaseModel):
    name: str
    parent: Parent | None = None


@app.post("/parent")
def parent(p: Parent) -> Parent:
    return p
```

#### Intermediate

Prefer **`from __future__ import annotations`** to postpone evaluation of annotations in modern Python.

```python
from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field


class Node(BaseModel):
    id: str
    links: list[Node] = Field(default_factory=list)


@app.post("/graph")
def graph(n: Node) -> Node:
    return n
```

#### Expert

**Graph cycles** in JSON can be **infinite**; validate **acyclicity** in a **`model_validator`** if your domain forbids cycles.

```python
from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, model_validator


class DAGNode(BaseModel):
    id: str
    children: list[DAGNode] = []

    @model_validator(mode="after")
    def no_self_loop(self) -> DAGNode:
        for c in self.children:
            if c.id == self.id:
                raise ValueError("self-loop")
        return self


@app.post("/dag")
def dag(n: DAGNode) -> DAGNode:
    return n
```

**Key Points (6.5.5)**

- Forward refs + **`model_rebuild()`** solve type cycles.
- Runtime **cycle detection** may still be required for **graphs**.

**Best Practices (6.5.5)**

- Prefer **IDs** instead of nested mutual objects for **large** graphs.
- Document **max** nodes/edges.

**Common Mistakes (6.5.5)**

- Infinite recursion on **serialization** if real cyclic Python graphs exist.
- Forgetting **`model_rebuild()`** in dynamic model builds.

---

## 6.6 Pydantic Advanced Features

### 6.6.1 Custom Validators

#### Beginner

`field_validator` and `model_validator` are the core hooks for **custom** rules beyond `Field` constraints.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class Password(BaseModel):
    value: str

    @field_validator("value")
    @classmethod
    def length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("too short")
        return v


@app.post("/pw")
def pw(p: Password) -> Password:
    return p
```

#### Intermediate

Use **`mode="before"`** to coerce **raw** input before standard validation.

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator


class NormalizedStr(BaseModel):
    s: str

    @field_validator("s", mode="before")
    @classmethod
    def strip(cls, v: object) -> object:
        if isinstance(v, str):
            return v.strip()
        return v


@app.post("/norm")
def norm(n: NormalizedStr) -> NormalizedStr:
    return n
```

#### Expert

**Wrap validators** can compose parsing pipelines; consult Pydantic v2 docs for **`ValidationInfo`**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, model_validator


class Interval(BaseModel):
    lo: float
    hi: float

    @model_validator(mode="after")
    def check(self) -> Interval:
        if self.lo >= self.hi:
            raise ValueError("lo must be < hi")
        return self


@app.post("/interval")
def interval(i: Interval) -> Interval:
    return i
```

**Key Points (6.6.1)**

- Validators encode **domain rules** once, reused by FastAPI.
- Prefer **`ValueError`** for client-facing validation errors.

**Best Practices (6.6.1)**

- Keep validators **fast** and **deterministic**.
- Test **validator** units independently.

**Common Mistakes (6.6.1)**

- Side effects and **I/O** in validators.
- **`HTTPException`** inside validators.

---

### 6.6.2 Computed Fields

#### Beginner

**`computed_field`** exposes derived values on serialization (Pydantic v2).

```python
from fastapi import FastAPI
from pydantic import BaseModel, computed_field

app = FastAPI()


class Rect(BaseModel):
    w: int
    h: int

    @computed_field
    @property
    def area(self) -> int:
        return self.w * self.h


@app.post("/rect")
def rect(r: Rect) -> Rect:
    return r
```

#### Intermediate

Computed fields can depend on **multiple** base fields; avoid **heavy** work if responses are hot paths.

```python
from fastapi import FastAPI
from pydantic import BaseModel, computed_field

app = FastAPI()


class Item(BaseModel):
    unit_price_cents: int
    qty: int

    @computed_field
    @property
    def line_total_cents(self) -> int:
        return self.unit_price_cents * self.qty


@app.post("/line")
def line(i: Item) -> Item:
    return i
```

#### Expert

Decide whether computed fields belong in **response models** only, not **request** models, to avoid implying clients may **send** them.

```python
from fastapi import FastAPI
from pydantic import BaseModel, computed_field

app = FastAPI()


class CartLineIn(BaseModel):
    sku: str
    qty: int


class CartLineOut(BaseModel):
    sku: str
    qty: int
    unit_price_cents: int

    @computed_field
    @property
    def line_total_cents(self) -> int:
        return self.unit_price_cents * self.qty


@app.post("/lines", response_model=CartLineOut)
def lines(li: CartLineIn) -> CartLineOut:
    return CartLineOut(sku=li.sku, qty=li.qty, unit_price_cents=100)
```

**Key Points (6.6.2)**

- Computed fields enrich **responses** without redundant storage.
- Keep them **cheap** or **cache** appropriately.

**Best Practices (6.6.2)**

- Separate **in** vs **out** models when exposing computed data.
- Document **rounding** for monetary computed values.

**Common Mistakes (6.6.2)**

- Clients expecting to **POST** computed fields that are **ignored** or **rejected**.
- Expensive computed properties on **large** lists.

---

### 6.6.3 Model Configuration

#### Beginner

`model_config = ConfigDict(...)` sets behaviors like **`str_strip_whitespace`**, **`extra`**, **`validate_assignment`**, etc.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class CleanStr(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str


@app.post("/clean")
def clean(c: CleanStr) -> CleanStr:
    return c
```

#### Intermediate

**`extra="forbid"`** rejects unknown keys—great for **strict** public APIs.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")

    a: int


@app.post("/strict")
def strict(s: Strict) -> Strict:
    return s
```

#### Expert

Tune **`ser_json_timedelta`** / datetime handling to enforce **UTC** policies consistently.

```python
from datetime import datetime, timezone

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class Event(BaseModel):
    model_config = ConfigDict()

    at: datetime


@app.post("/event")
def event(e: Event) -> Event:
    return e
```

**Key Points (6.6.3)**

- `ConfigDict` centralizes model behavior.
- **`extra`** policy is a major API compatibility lever.

**Best Practices (6.6.3)**

- Choose **`forbid`** vs **`ignore`** explicitly per API surface.
- Document **coercion** rules (`coerce_numbers_to_str`, etc.) if enabled.

**Common Mistakes (6.6.3)**

- **`ignore`** extra keys silently dropping client data.
- Inconsistent config between **request** and **response** models.

---

### 6.6.4 Model Serialization

#### Beginner

**`model_dump()`** returns a **dict**; **`model_dump_json()`** returns a JSON string—useful in non-FastAPI contexts.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class M(BaseModel):
    x: int


@app.post("/dump")
def dump(m: M) -> dict[str, str]:
    return {"json": m.model_dump_json()}
```

#### Intermediate

Use **`by_alias=True`** when external JSON must use **camelCase** keys.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI()


class Out(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    item_id: int = Field(serialization_alias="itemId")


@app.post("/out")
def out(o: Out) -> dict:
    return o.model_dump(by_alias=True)
```

#### Expert

**`model_validate_json`** parses JSON strings directly—handy for **queue workers**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Job(BaseModel):
    kind: str


raw = '{"kind":"email"}'


@app.get("/job-parse")
def job_parse() -> Job:
    return Job.model_validate_json(raw)
```

**Key Points (6.6.4)**

- Serialization options control **aliases** and **null** omission.
- JSON helpers align with **offline** validation pipelines.

**Best Practices (6.6.4)**

- Use **`response_model`** in FastAPI instead of manual dumps when possible.
- Snapshot **stable** sort order for dict keys if clients diff JSON.

**Common Mistakes (6.6.4)**

- Dumping **internal** fields accidentally in logs.
- Forgetting **`by_alias`** for external **camelCase** contracts.

---

### 6.6.5 Dynamic Model Creation

#### Beginner

**`create_model`** builds models at runtime—use sparingly for **plugin** systems or **schema-driven** APIs.

```python
from fastapi import FastAPI
from pydantic import BaseModel, create_model

app = FastAPI()

Dynamic = create_model("Dynamic", x=(int, ...), y=(str, "hi"))


@app.post("/dyn")
def dyn(d: Dynamic) -> Dynamic:
    return d
```

#### Intermediate

Dynamic models complicate **static type checking**—wrap behind **Protocol** or **TypedDict** boundaries in large codebases.

```python
from fastapi import FastAPI
from pydantic import create_model

app = FastAPI()

Shape = create_model("Shape", kind=(str, ...), data=(dict[str, int], {}))


@app.post("/shape")
def shape(s: Shape) -> Shape:
    return s
```

#### Expert

Call **`model_rebuild()`** when dynamically linking **forward references**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, create_model

app = FastAPI()

Inner = create_model("Inner", v=(int, ...))
Outer = create_model("Outer", inner=(Inner, ...))


@app.post("/outer")
def outer(o: Outer) -> Outer:
    return o
```

**Key Points (6.6.5)**

- Dynamic models enable **meta-programming** but hurt **IDE** help.
- Prefer static models for **core** domains.

**Best Practices (6.6.5)**

- Cache **created** models; don’t rebuild per request.
- Add **tests** that validate dynamic schema **invariants**.

**Common Mistakes (6.6.5)**

- Creating **new** model classes per request (**memory** leak risk).
- Untrusted **schema** input defining arbitrary fields without **sandbox** rules.

---

## 6.7 Request Body Documentation

### 6.7.1 Schema Examples

#### Beginner

Provide **`json_schema_extra`** with **`examples`** at the model level for Swagger.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class UserIn(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={"examples": [{"email": "ada@example.com", "age": 36}]},
    )

    email: str
    age: int


@app.post("/users")
def users(u: UserIn) -> UserIn:
    return u
```

#### Intermediate

Field-level **`examples`** complement model-level **examples**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Item(BaseModel):
    sku: str = Field(examples=["SKU-001"])
    qty: int = Field(ge=1, examples=[3])


@app.post("/items")
def items(i: Item) -> Item:
    return i
```

#### Expert

Validate examples in **CI** with `Model.model_validate(example_dict)`.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()

EX = {"title": "Note", "body": "Hello"}


class Note(BaseModel):
    model_config = ConfigDict(json_schema_extra={"example": EX})

    title: str
    body: str


@app.post("/notes")
def notes(n: Note) -> Note:
    return n
```

**Key Points (6.7.1)**

- Examples improve **Try it out** success rates.
- Keep examples **synchronized** with validators.

**Best Practices (6.7.1)**

- Use **synthetic** data.
- Version examples with **breaking** schema changes.

**Common Mistakes (6.7.1)**

- Examples that **fail** validation.
- **PII** in committed examples.

---

### 6.7.2 Field Descriptions

#### Beginner

Every non-obvious field deserves a **`Field(description=...)`**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Payment(BaseModel):
    amount_cents: int = Field(description="Amount in integer cents (USD).")
    capture: bool = Field(description="Whether to capture immediately.")


@app.post("/pay")
def pay(p: Payment) -> Payment:
    return p
```

#### Intermediate

Link to **long-form** docs with URLs in descriptions when your portal supports clickable text.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Webhook(BaseModel):
    url: str = Field(description="HTTPS callback URL; see docs.example.com/webhooks")


@app.post("/wh")
def wh(w: Webhook) -> Webhook:
    return w
```

#### Expert

For **sensitive** fields, describe **retention** and **encryption** expectations at the **API policy** layer, not only inline text.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class PII(BaseModel):
    national_id: str = Field(description="Government ID; store encrypted; do not log.")


@app.post("/pii")
def pii(p: PII) -> PII:
    return p
```

**Key Points (6.7.2)**

- Field descriptions become **OpenAPI** `description`.
- They are part of your **contract**.

**Best Practices (6.7.2)**

- Mention **required** formats (ISO-8601, E.164 phone).
- Align text with **actual** validation.

**Common Mistakes (6.7.2)**

- **Empty** descriptions on complex financial fields.
- Descriptions contradicting **`Field`** constraints.

---

### 6.7.3 Model Descriptions

#### Beginner

Set a **`model_config`** doc or use FastAPI route **`description`** referencing the model; Pydantic also supports **`json_schema_extra`** with **`title`**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class Invoice(BaseModel):
    model_config = ConfigDict(title="Sales invoice", json_schema_extra={"description": "Invoice header"})

    number: str


@app.post("/invoice")
def invoice(i: Invoice) -> Invoice:
    return i
```

#### Intermediate

For multiple **DTOs**, prefix titles (`UserCreate`, `UserPublic`) to disambiguate **schema** names in codegen.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class UserCreate(BaseModel):
    model_config = ConfigDict(title="UserCreate")

    email: str


@app.post("/signup")
def signup(u: UserCreate) -> UserCreate:
    return u
```

#### Expert

If using **namespaced** tags in OpenAPI, align **model titles** with **domain bounded contexts**.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class BillingInvoice(BaseModel):
    model_config = ConfigDict(title="billing.Invoice")

    id: str


@app.post("/billing/invoices")
def inv(i: BillingInvoice) -> BillingInvoice:
    return i
```

**Key Points (6.7.3)**

- Model titles/descriptions clarify **generated** client types.
- Useful when many similar schemas exist.

**Best Practices (6.7.3)**

- Use **`Create`/`Update`/`Read`** suffix conventions.
- Avoid **generic** titles like `Model1`.

**Common Mistakes (6.7.3)**

- Duplicate **schema** names confusing **OpenAPI** consumers.
- Missing **title** when models collapse in UI lists.

---

### 6.7.4 Documentation in Swagger

#### Beginner

FastAPI shows request bodies in **`/docs`** automatically from Pydantic models. Add route-level **`summary`** and **`tags`**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Task(BaseModel):
    title: str


@app.post("/tasks", summary="Create task", tags=["tasks"])
def create_task(t: Task) -> Task:
    return t
```

#### Intermediate

Use **`response_model`** and **`responses={422: {...}}`** to document **errors** richly.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Err(BaseModel):
    detail: str


class ThingIn(BaseModel):
    name: str


class ThingOut(BaseModel):
    id: int


@app.post("/things", response_model=ThingOut, responses={422: {"model": Err}})
def things(t: ThingIn) -> ThingOut:
    return ThingOut(id=1)
```

#### Expert

**Disable docs** routes in production if policy requires, or protect **`/docs`** with **auth** at the reverse proxy.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(docs_url="/docs", redoc_url="/redoc")


class X(BaseModel):
    v: int


@app.post("/x")
def x(v: X) -> X:
    return v
```

**Key Points (6.7.4)**

- Swagger is **generated**—keep models the **source of truth**.
- Tags and summaries organize large APIs.

**Best Practices (6.7.4)**

- Add **`examples`** for every public **POST**.
- Link to **postman**/**insomnia** collections if maintained.

**Common Mistakes (6.7.4)**

- **Undocumented** error shapes.
- Exposing **internal** admin endpoints on the same **public** docs.

---

### 6.7.5 Custom Schemas

#### Beginner

Use **`json_schema_extra`** on models/fields to attach **`x-`** vendor extensions or additional schema keywords permitted by your toolchain.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Row(BaseModel):
    id: str = Field(json_schema_extra={"x-primary-key": True})


@app.post("/row")
def row(r: Row) -> Row:
    return r
```

#### Intermediate

Override **`FastAPI().openapi()`** to inject **global** metadata, **servers**, or **securitySchemes**.

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel

app = FastAPI()


class M(BaseModel):
    a: int


def custom_openapi() -> dict:
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(title="API", version="1.0.0", routes=app.routes)
    schema.setdefault("x-api", {})["owner"] = "platform"
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi  # type: ignore[method-assign]


@app.post("/m")
def m(x: M) -> M:
    return x
```

#### Expert

Snapshot-test **`openapi.json`** when customizing schema to catch **upgrade regressions** across FastAPI/Pydantic bumps.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class Tagged(BaseModel):
    model_config = ConfigDict(json_schema_extra={"x-visibility": "internal"})

    secret: str


@app.post("/tagged")
def tagged(t: Tagged) -> Tagged:
    return t
```

**Key Points (6.7.5)**

- Custom schema hooks integrate with **enterprise** portals.
- Global OpenAPI functions unify **multi-router** apps.

**Best Practices (6.7.5)**

- Keep **`openapi.json`** small enough for **CI** diff review.
- Document **`x-`** keys for consumers.

**Common Mistakes (6.7.5)**

- **Invalid** JSON Schema breaking **codegen**.
- Duplicating **security** metadata incorrectly at multiple levels.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- **Pydantic v2 `BaseModel`** classes define FastAPI request bodies, validation, and OpenAPI schemas.
- **`Field`**, **`field_validator`**, and **`model_validator`** layer constraints from simple to cross-field rules.
- **Separate** input/output models when fields differ (passwords, tokens, computed fields).
- **Nested** models and **lists** map cleanly to JSON; manage **optional** vs **omitted** carefully for PATCH.
- **Aliases**, **examples**, and **`json_schema_extra`** tailor docs and client **codegen**.

### Chapter Best Practices

- Use **`ConfigDict(extra="forbid")`** on strict public contracts.
- Prefer **`Decimal`** for money; cap **list** lengths and pagination sizes.
- Use **`exclude_unset`** when applying partial updates to databases.
- Document **null vs omit** behavior explicitly for PATCH-style bodies.
- Test **422** responses and **OpenAPI** snapshots in CI.

### Chapter Common Mistakes

- Mutable **`[]` / `{}`** defaults on models.
- Returning **ORM** entities without **`response_model`** filtering.
- Validators performing **I/O** or raising **`HTTPException`**.
- Deep or **cyclic** JSON without **limits** or **cycle checks**.
- **Examples** and **descriptions** that contradict actual **validation** rules.

---

*End of Request Body notes (Topic 6).*


