# Response Models in FastAPI

## 📑 Table of Contents

- [7.1 Response Model Basics](#71-response-model-basics)
  - [7.1.1 response_model Parameter](#711-response_model-parameter)
  - [7.1.2 Filtering Response Data](#712-filtering-response-data)
  - [7.1.3 Multiple Response Models](#713-multiple-response-models)
  - [7.1.4 Dynamic Response Models](#714-dynamic-response-models)
  - [7.1.5 Response Serialization](#715-response-serialization)
- [7.2 Response Filtering](#72-response-filtering)
  - [7.2.1 Include Specific Fields](#721-include-specific-fields)
  - [7.2.2 Exclude Specific Fields](#722-exclude-specific-fields)
  - [7.2.3 Partial Models](#723-partial-models)
  - [7.2.4 Sub-model Filtering](#724-sub-model-filtering)
  - [7.2.5 Conditional Filtering](#725-conditional-filtering)
- [7.3 Response Types](#73-response-types)
  - [7.3.1 Dictionary Responses](#731-dictionary-responses)
  - [7.3.2 List Responses](#732-list-responses)
  - [7.3.3 Scalar Responses](#733-scalar-responses)
  - [7.3.4 File Responses](#734-file-responses)
  - [7.3.5 Streaming Responses](#735-streaming-responses)
- [7.4 Advanced Response Patterns](#74-advanced-response-patterns)
  - [7.4.1 Union Types in Response](#741-union-types-in-response)
  - [7.4.2 Optional Responses](#742-optional-responses)
  - [7.4.3 Multiple Status Code Responses](#743-multiple-status-code-responses)
  - [7.4.4 Generic Responses](#744-generic-responses)
  - [7.4.5 Response Pagination](#745-response-pagination)
- [7.5 Response Validation](#75-response-validation)
  - [7.5.1 Automatic Validation](#751-automatic-validation)
  - [7.5.2 Strict Mode](#752-strict-mode)
  - [7.5.3 Custom Response Validators](#753-custom-response-validators)
  - [7.5.4 Type Coercion](#754-type-coercion)
  - [7.5.5 Error Handling in Response](#755-error-handling-in-response)
- [7.6 Response Documentation](#76-response-documentation)
  - [7.6.1 OpenAPI Schema Generation](#761-openapi-schema-generation)
  - [7.6.2 Example Responses](#762-example-responses)
  - [7.6.3 Response Descriptions](#763-response-descriptions)
  - [7.6.4 Multiple Response Examples](#764-multiple-response-examples)
  - [7.6.5 Documentation Best Practices](#765-documentation-best-practices)
- [7.7 Performance Considerations](#77-performance-considerations)
  - [7.7.1 Response Model Overhead](#771-response-model-overhead)
  - [7.7.2 Excluding Unset Fields](#772-excluding-unset-fields)
  - [7.7.3 Lazy Loading](#773-lazy-loading)
  - [7.7.4 Caching Responses](#774-caching-responses)
  - [7.7.5 Streaming Large Responses](#775-streaming-large-responses)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 7.1 Response Model Basics

FastAPI uses **Pydantic models** (v2: `BaseModel`) to describe the **shape of JSON** your path operation returns. Declaring a `response_model` tells FastAPI to **filter**, **validate**, and **document** outgoing data—without forcing you to manually construct DTOs in every handler.

### 7.1.1 response_model Parameter

#### Beginner

The simplest use is passing a Pydantic model to the decorator’s **`response_model`** argument. FastAPI will serialize your return value through that model before sending it to the client.

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI()


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    display_name: str


@app.get("/users/me", response_model=UserPublic)
def read_me() -> UserPublic:
    # Could be ORM object or dict; FastAPI coerces via the model
    return UserPublic(id=1, email="me@example.com", display_name="Ada")
```

#### Intermediate

`response_model` applies **after** your function runs. That means you can return a **richer** internal structure (for example including a `password_hash`) and FastAPI will **omit** fields not present on the public model—provided the return value is **dict-like** or a model instance that can be converted. For strict guarantees, return explicit public models or use `response_model_include` / `exclude`.

#### Expert

Under the hood, FastAPI uses **`jsonable_encoder`** and Pydantic’s **serialization** API. Custom types should implement compatible serializers or use `field_serializer` / `PlainSerializer` in Pydantic v2. For `Union` response models, OpenAPI generation and runtime validation follow the declared type; ordering of `Union` members can matter for schema discrimination in documentation tools.

```python
from typing import Annotated

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class UserDB(BaseModel):
    id: int
    email: str
    password_hash: str


class UserOut(BaseModel):
    id: int
    email: str


@app.get("/users/{user_id}", response_model=UserOut)
def read_user(
    user_id: Annotated[int, Field(ge=1)],
) -> UserDB:
    return UserDB(
        id=user_id,
        email="user@example.com",
        password_hash="argon2$secret",
    )
```

**Key Points (7.1.1)**

- **`response_model`** controls **documented** and **serialized** output, not necessarily your Python return annotation.
- It is a **post-processing** step: great for stripping secrets from ORM rows.
- Works with **`BaseModel`**, lists of models, primitives wrapped in models, and more.

**Best Practices (7.1.1)**

- Prefer **dedicated public schemas** (`UserOut`, `ItemPublic`) separate from DB/ORM models.
- Name models after **role** (`UserCreate`, `UserUpdate`, `UserRead`) to avoid ambiguity.

**Common Mistakes (7.1.1)**

- Expecting `response_model` to **validate incoming** request bodies (that is `Body` / parameters, not responses).
- Returning types that **cannot** be converted to the declared model without extra config, then being surprised by 500 errors during serialization.

---

### 7.1.2 Filtering Response Data

#### Beginner

**Filtering** means the client only sees a **subset** of fields. The easiest path is returning a **smaller** `response_model` than your internal object has fields for, when FastAPI can build the smaller model from the larger payload.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class InternalUser(BaseModel):
    id: int
    username: str
    is_admin: bool


class PublicUser(BaseModel):
    id: int
    username: str


@app.get("/users/{user_id}", response_model=PublicUser)
def get_user(user_id: int) -> InternalUser:
    return InternalUser(id=user_id, username="neo", is_admin=True)
```

#### Intermediate

When your return type is a plain **`dict`**, keys **not** in the response model are dropped during serialization. When returning a **Pydantic model instance** with **extra** fields disallowed, validation ensures consistency. Tune behavior with Pydantic model config (`model_config = ConfigDict(extra="ignore")`) on the **output** model when ingesting dicts with noise.

#### Expert

For ORM objects, use patterns like **SQLAlchemy** with explicit column loads or **Pydantic’s** `model_validate` with `from_attributes=True` on a read schema. Combine with `response_model_include` / `exclude` for **ad hoc** field sets without defining a new class—use sparingly to avoid schema drift in OpenAPI.

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class ORMUser:
    def __init__(self) -> None:
        self.id = 42
        self.email = "orm@example.com"
        self.internal_flag = True


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


@app.get("/orm-user", response_model=UserRead)
def orm_user() -> ORMUser:
    return ORMUser()  # type: ignore[return-value]
```

**Key Points (7.1.2)**

- Output filtering protects **privacy** and reduces **payload size**.
- Dict returns are **key-filtered** to the response model’s fields.
- Attribute-based objects need **`from_attributes`** (formerly `orm_mode`) on read models.

**Best Practices (7.1.2)**

- Treat filtering as a **security boundary** for PII, not only cosmetic JSON shaping.
- Keep **one canonical public schema** per resource for stable API contracts.

**Common Mistakes (7.1.2)**

- Assuming ORM lazy-loaded fields are safe when they may **trigger IO** or **expose relations** unintentionally.
- Mixing **`include`/`exclude`** on many endpoints so **OpenAPI** no longer matches product expectations.

---

### 7.1.3 Multiple Response Models

#### Beginner

One path operation can declare **different shapes** for different outcomes using `responses` (OpenAPI) and `Union` types—or separate endpoints. Beginners often start with **one** success model and use `HTTPException` for errors.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Cat(BaseModel):
    meows: bool


class Dog(BaseModel):
    barks: bool


@app.get("/pets/{pet_id}", response_model=Cat | Dog)
def pet(pet_id: str) -> Cat | Dog:
    if pet_id == "1":
        return Cat(meows=True)
    if pet_id == "2":
        return Dog(barks=True)
    raise HTTPException(status_code=404, detail="Unknown pet")
```

#### Intermediate

Use **`responses={404: {"model": ErrorSchema}}`** alongside `response_model` for **200** to document errors in OpenAPI. At runtime, `response_model` still applies to the **normal** return path; raised `HTTPException` bypasses it for the error payload unless you standardize error models via exception handlers.

#### Expert

For **discriminated unions**, Pydantic v2 supports `Discriminator` and `tagged unions` patterns, improving validation and OpenAPI **oneOf** clarity. When combining **streaming** or **FileResponse**, `response_model` may be `None`—document alternate media types explicitly.

```python
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class OkUser(BaseModel):
    kind: Literal["user"] = "user"
    id: int


class OkItem(BaseModel):
    kind: Literal["item"] = "item"
    sku: str


@app.get("/mixed", response_model=OkUser | OkItem)
def mixed(flag: bool) -> OkUser | OkItem:
    if flag:
        return OkUser(id=7)
    return OkItem(sku="SKU-9")
```

**Key Points (7.1.3)**

- **`Union`** (`A | B`) in `response_model` expresses **alternatives** for successful JSON.
- OpenAPI **documentation** for errors is separate from `response_model` (use `responses`).
- Discriminators improve **client codegen** quality.

**Best Practices (7.1.3)**

- Prefer **explicit discriminator fields** for polymorphic JSON APIs consumed by TypeScript/Java clients.
- Document **every** status code you emit with a **schema** where feasible.

**Common Mistakes (7.1.3)**

- Using overly broad **`dict`** response models that erase useful **static typing**.
- Forgetting that **`HTTPException(detail=dict)`** is not validated like a Pydantic model unless you add handlers.

---

### 7.1.4 Dynamic Response Models

#### Beginner

**Dynamic** usually means choosing a model **at runtime** based on query params, headers, or user role. FastAPI requires the decorator’s `response_model` to be **static** for OpenAPI—so dynamic behavior is typically modeled with **`Union`**, **versioned routers**, or **multiple routes**.

```python
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class V1Item(BaseModel):
    name: str


class V2Item(BaseModel):
    title: str
    stock: int


@router.get("/items", response_model=list[V1Item])
def list_items_v1() -> list[V1Item]:
    return [V1Item(name="Pen")]


@router.get("/v2/items", response_model=list[V2Item])
def list_items_v2() -> list[V2Item]:
    return [V2Item(title="Pen", stock=3)]
```

#### Intermediate

You can build **Pydantic models programmatically** with `create_model` for advanced plugins, but exposing them to FastAPI requires careful OpenAPI stability. Prefer **explicit classes** in application code; reserve `create_model` for codegen and dynamic forms.

#### Expert

For **hypermedia** or **HATEOAS**, combine stable core models with **`Field(json_schema_extra=...)`** for link metadata. If you must alter schemas per deployment, consider **multiple OpenAPI versions** (`FastAPI(..., openapi_url="/openapi-v2.json")`) rather than mutating models at import time in production.

```python
from pydantic import BaseModel, create_model

Dynamic = create_model(
    "DynamicRow",
    id=(int, ...),
    score=(float, 0.0),
)

# Illustrative only — prefer named models in real services
assert Dynamic(id=1, score=2.5).model_dump() == {"id": 1, "score": 2.5}
```

**Key Points (7.1.4)**

- FastAPI’s **OpenAPI** generation favors **static** types at import time.
- **Versioned paths** beat clever runtime model swapping for maintainability.
- `create_model` is powerful but easy to misuse for **public** APIs.

**Best Practices (7.1.4)**

- Publish **versioned** routes or **Accept** header–driven routers with clear documentation.
- Keep **dynamic** internal, **static** external for SDK consumers.

**Common Mistakes (7.1.4)**

- Mutating shared **`model_config`** or fields on global models at runtime (thread-safety and cache issues).
- Assuming **`response_model=some_variable`** updates OpenAPI per request (it does not).

---

### 7.1.5 Response Serialization

#### Beginner

**Serialization** turns Python objects into **JSON-compatible** data. FastAPI’s default JSON response uses **`JSONResponse`** with `jsonable_encoder` for non-Pydantic pieces (like `datetime`, `UUID`).

```python
from datetime import datetime, timezone
from uuid import UUID

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Event(BaseModel):
    when: datetime
    ref: UUID


@app.get("/event", response_model=Event)
def event() -> Event:
    return Event(when=datetime.now(timezone.utc), ref=UUID(int=0))
```

#### Intermediate

Pydantic v2 uses **`model_dump(mode="json")`** internally for JSON modes, converting types appropriately. Customize per-field with **`PlainSerializer`**, **`SerializeAsAny`**, or **`field_serializer`** when you need ISO-8601 vs epoch, or redacted strings.

#### Expert

For **ORJSON** performance, plug in **`ORJSONResponse`** as `default_response_class` and ensure custom types register with **orjson** defaults. Watch for **decimal** precision and **datetime** timezone policies across clients.

```python
from decimal import Decimal

from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel, PlainSerializer
from typing_extensions import Annotated

Money = Annotated[
    Decimal,
    PlainSerializer(lambda v: str(v), return_type=str, when_used="json"),
]


class Invoice(BaseModel):
    amount: Money


app = FastAPI(default_response_class=ORJSONResponse)


@app.get("/invoice", response_model=Invoice)
def invoice() -> Invoice:
    return Invoice(amount=Decimal("19.99"))
```

**Key Points (7.1.5)**

- JSON responses require **JSON-serializable** payloads after model processing.
- **Custom types** need explicit serializers or encoders.
- **ORJSON** trades flexibility for speed—validate compatibility with your types.

**Best Practices (7.1.5)**

- Standardize **timezone-aware** UTC datetimes for APIs.
- Use **`Decimal` as string** in JSON for monetary values when exactness matters.

**Common Mistakes (7.1.5)**

- Returning **`set`** or arbitrary objects without encoder support.
- Mixing **`float`** for money, introducing rounding surprises.

---

## 7.2 Response Filtering

Response filtering fine-tunes **which fields** appear in JSON without rewriting every handler. It complements **separate read models** and is especially handy for **experimental** fields or **legacy** migrations.

### 7.2.1 Include Specific Fields

#### Beginner

Use **`response_model_include`** with a `set` of field names (including nested paths with dot notation where supported) to **whitelist** output keys.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class User(BaseModel):
    id: int
    email: str
    phone: str


@app.get("/user-mini", response_model=User, response_model_include={"id", "email"})
def mini() -> User:
    return User(id=1, email="a@b.com", phone="+1000")
```

#### Intermediate

**Nested** inclusion uses dict form in some FastAPI/Pydantic versions; verify against your stack. Often clearer to define **`UserMini`** model instead of `include` for long-term APIs.

#### Expert

`include` interacts with **`model_dump`** options and may affect **OpenAPI**: the documented schema might still list all fields unless you use a dedicated model. Prefer **separate schemas** for public contracts; use `include` for **internal** admin tools or temporary rollouts.

```python
# Prefer this for stable OpenAPI:
from pydantic import BaseModel

class UserMini(BaseModel):
    id: int
    email: str
```

**Key Points (7.2.1)**

- **`response_model_include`** whitelists top-level (and sometimes nested) fields.
- OpenAPI may still show **full** model unless you split schemas.
- Great for **quick** experiments; weak for **versioned** public APIs.

**Best Practices (7.2.1)**

- When clients depend on the schema, **create explicit models**.
- Document **field-level** privacy policies in API guidelines.

**Common Mistakes (7.2.1)**

- Thinking `include` **hides** fields from Python objects in memory (it does not—only HTTP output).
- Using `include` inconsistently across endpoints for the **same** resource name.

---

### 7.2.2 Exclude Specific Fields

#### Beginner

**`response_model_exclude`** removes named fields from the serialized response. It is the mirror of `include`.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class User(BaseModel):
    id: int
    email: str
    password_hash: str


@app.get("/user-safe", response_model=User, response_model_exclude={"password_hash"})
def safe() -> User:
    return User(id=1, email="u@u.com", password_hash="secret")
```

#### Intermediate

**Unset** vs **default** fields interact with `exclude_unset` parameters on responses (see 7.7.2). Combining `exclude` with **default `None`** fields can confuse clients expecting keys to always be present.

#### Expert

For **nested** models, `exclude` supports dict structures in Pydantic dumps; FastAPI forwards these to serialization. Complex trees merit **explicit sub-models** rather than deep exclude maps that are hard to review in code review.

```python
from pydantic import BaseModel


class Profile(BaseModel):
    bio: str
    ssn: str


class User(BaseModel):
    id: int
    profile: Profile


# Expert preference: ProfilePublic without ssn
class ProfilePublic(BaseModel):
    bio: str


class UserPublic(BaseModel):
    id: int
    profile: ProfilePublic
```

**Key Points (7.2.2)**

- **`exclude`** strips fields from **wire** format.
- Nested exclusions are **harder** to maintain than dedicated models.
- Security-sensitive fields should **never** enter the object** if avoidable.

**Best Practices (7.2.2)**

- Avoid shipping secrets **into** response objects solely to exclude them—**drop earlier**.
- Pair excludes with **tests** asserting forbidden keys are absent.

**Common Mistakes (7.2.2)**

- Relying on exclude while still **logging** full objects containing secrets.
- Breaking **backward compatibility** by removing keys clients parse as `undefined` vs missing.

---

### 7.2.3 Partial Models

#### Beginner

**Partial** responses often mean **optional fields** on reads—use `Optional[...]` or defaults, or Pydantic’s **`model_construct`** for internal skips. For PATCH-like semantics in responses (unusual), document which fields may be absent.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class UserPartial(BaseModel):
    id: int
    display_name: str | None = None
    avatar_url: str | None = None


@app.get("/users/{user_id}", response_model=UserPartial)
def user(user_id: int) -> UserPartial:
    return UserPartial(id=user_id, display_name="Sam")
```

#### Intermediate

Pydantic v2 **`TypedDict`** and **`NotRequired`** can represent partial JSON for internal typing, but FastAPI `response_model` still prefers **`BaseModel`** for OpenAPI. Consider `Field(description=...)` on optionals for docs.

#### Expert

For **sparse** column projections in databases, map rows to **`UserPartial`** explicitly in a service layer; avoid leaking **SQL NULL** semantics inconsistently (`null` vs missing key) across endpoints.

```python
from pydantic import BaseModel, Field

class UserSparse(BaseModel):
    id: int
    bio: str | None = Field(default=None, description="Omitted when not public.")
```

**Key Points (7.2.3)**

- **Optional** fields express partial JSON cleanly.
- Align **`null` vs absent** keys with client expectations and OpenAPI `required` arrays.
- Service-layer mapping keeps ORM concerns out of routing.

**Best Practices (7.2.3)**

- Document **when** optional fields appear using **descriptions** and examples.
- Version APIs when **required** fields become **optional** (breaking change for strict clients).

**Common Mistakes (7.2.3)**

- Returning **`None`** for the entire body when `response_model` expects an object (use **204** or `Optional` carefully—see 7.4.2).
- Using partial models to hide **inconsistent** backend state instead of fixing data.

---

### 7.2.4 Sub-model Filtering

#### Beginner

When a response embeds **nested** objects, define **nested Pydantic models** and reuse them. Filtering at the parent level does not always remove nested secrets unless the nested type is also safe.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class TeamPublic(BaseModel):
    name: str


class UserPublic(BaseModel):
    id: int
    team: TeamPublic


@app.get("/users/1", response_model=UserPublic)
def one() -> UserPublic:
    return UserPublic(id=1, team=TeamPublic(name="Core"))
```

#### Intermediate

Use **`model_validate`** with `from_attributes` to build nested public trees from ORM graphs; control loading with **`selectinload`**, **`joinedload`**, or explicit queries to avoid **N+1** queries when serializing lists.

#### Expert

For **large** graphs, prefer **DTO mappers** (functions) that accept ORM rows and emit public models, centralizing field rules. Add **integration tests** that fetch JSON and **snapshot** nested keys for regression safety.

```python
from pydantic import BaseModel, ConfigDict

class ORMTeam:
    name = "Ops"
    budget_code = "SECRET"

class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    team: TeamOut
```

**Key Points (7.2.4)**

- **Nested** filtering is only as safe as the **innermost** schema.
- ORM relationships need **eager loading** strategies aligned with response shape.
- DTO functions reduce **duplicated** shaping logic.

**Best Practices (7.2.4)**

- Co-locate **TeamOut** next to **Team** domain docs for discoverability.
- Avoid returning **SQLAlchemy** instances directly without a clear read model policy.

**Common Mistakes (7.2.4)**

- Serializing **lazy** relationships that emit extra queries per row in lists.
- Using the same **Team** model for **admin** and **public** routes.

---

### 7.2.5 Conditional Filtering

#### Beginner

Sometimes **admins** see more fields than **regular users**. Common beginner pattern: **two routes** (`/admin/users`, `/users`) with different `response_model` values.

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter()


class UserPublic(BaseModel):
    id: int
    name: str


class UserAdmin(UserPublic):
    last_login: str


def admin_user() -> bool:
    return True


@router.get("/public/me", response_model=UserPublic)
def me_public(is_admin: bool = Depends(admin_user)) -> UserPublic:
    _ = is_admin
    return UserPublic(id=1, name="Neo")


@router.get("/admin/me", response_model=UserAdmin)
def me_admin() -> UserAdmin:
    return UserAdmin(id=1, name="Neo", last_login="2026-03-28T00:00:00Z")
```

#### Intermediate

A single route may **branch** return types with **`Union`** models and role checks, but OpenAPI must reflect possibilities. Alternatively, use **`response_model_exclude_unset`** and populate admin-only keys when allowed.

#### Expert

Centralize authorization with **`Depends`** and **policy objects**; never rely on **client-side** hiding of fields for security. Combine **OAuth scopes** with distinct response schemas per scope using **router-level dependencies** and separate **path operations** for clarity under audit.

```python
from fastapi import HTTPException

def ensure_admin(flag: bool) -> None:
    if not flag:
        raise HTTPException(status_code=403, detail="Admin only")
```

**Key Points (7.2.5)**

- **Security** is enforced server-side; response filtering is **not** authorization alone.
- **Separate routes** or **unions** document differing shapes clearly.
- **Role checks** belong in dependencies or services.

**Best Practices (7.2.5)**

- Log **access** to sensitive admin endpoints separately.
- Test **non-admin** users never receive admin fields (contract tests).

**Common Mistakes (7.2.5)**

- Returning **admin fields** always and “hiding” them in the UI only.
- Using one giant **`User`** model with dozens of optionals for every role.

---

## 7.3 Response Types

Not every endpoint returns a **Pydantic model**. FastAPI supports **dicts**, **lists**, **scalars**, **files**, and **streams**—each with different implications for `response_model`, media types, and OpenAPI.

### 7.3.1 Dictionary Responses

#### Beginner

Returning a **`dict`** is idiomatic for small JSON payloads. If you set `response_model`, FastAPI validates/filters keys against the model.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    sku: str
    qty: int


@app.get("/item-dict", response_model=Item)
def item_dict() -> dict[str, str | int]:
    return {"sku": "ABC", "qty": 2, "extra": "dropped"}
```

#### Intermediate

**Typed dicts** (`TypedDict`) help static typing for handlers but are not `response_model` targets themselves—wrap with **`BaseModel`** for documentation. For arbitrary keys, use **`dict[str, Any]`** sparingly; clients lose structure.

#### Expert

When bridging **legacy** services, you may return pre-built **`JSON`** strings—prefer **`Response(content=..., media_type="application/json")`** and skip `response_model` to avoid double encoding; document schemas manually in `responses`.

```python
from fastapi import Response, FastAPI

app = FastAPI()


@app.get("/raw-json")
def raw() -> Response:
    return Response(content='{"ok":true}', media_type="application/json")
```

**Key Points (7.3.1)**

- **Dict** returns are convenient but easy to let **drift** from models.
- `response_model` **filters** unknown dict keys on output.
- Raw **Response** bypasses automatic model validation.

**Best Practices (7.3.1)**

- Promote stable dict shapes to **`BaseModel`** classes.
- Add **tests** comparing dict keys to model fields.

**Common Mistakes (7.3.1)**

- Returning **`JSONResponse`** with already serialized bytes inconsistently.
- Using **`Any`** everywhere, losing OpenAPI value.

---

### 7.3.2 List Responses

#### Beginner

Annotate list responses as **`list[Model]`** in `response_model` for OpenAPI **arrays**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Tag(BaseModel):
    name: str


@app.get("/tags", response_model=list[Tag])
def tags() -> list[Tag]:
    return [Tag(name="py"), Tag(name="api")]
```

#### Intermediate

Large lists should use **pagination** (see 7.4.5) to avoid **memory** and **latency** issues. For CSV or NDJSON, switch **media type** and response class.

#### Expert

**StreamingResponse** can emit **JSON lines**; `response_model` may not apply per line—document alternative schemas. For **SQLAlchemy** `scalars().all()`, ensure each row maps cleanly to list items.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Row(BaseModel):
    id: int


@app.get("/rows", response_model=list[Row])
def rows() -> list[Row]:
    return [Row(id=i) for i in range(3)]
```

**Key Points (7.3.2)**

- **`list[T]`** generates OpenAPI **`type: array`** with **`items`** schema.
- Pagination is a **separate concern** from typing.
- Streaming changes **validation** guarantees.

**Best Practices (7.3.2)**

- Cap **page size** server-side; reject absurd `limit` query params.
- Use **total count** fields thoughtfully (expensive queries).

**Common Mistakes (7.3.2)**

- Returning a **generator** where a **list** is expected without streaming response class.
- **N+1** loading when each list element triggers DB calls.

---

### 7.3.3 Scalar Responses

#### Beginner

Scalars include **`str`**, **`int`**, **`float`**, **`bool`**. FastAPI wraps them as JSON primitives.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/pi", response_model=float)
def pi() -> float:
    return 3.14


@app.get("/name", response_model=str)
def name() -> str:
    return "fastapi"
```

#### Intermediate

**Plaintext** responses use **`PlainTextResponse`** or `Response(media_type="text/plain")`. OpenAPI shows **string** schema; examples help clients.

#### Expert

**Boolean** JSON lowercases to `true`/`false`; ensure clients don’t expect Python’s **`True`**. For **enums**, prefer **`Enum` subclasses** with `str` mixin for stable string wire values.

```python
from enum import Enum

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Color(str, Enum):
    red = "red"
    blue = "blue"


class Choice(BaseModel):
    color: Color


@app.get("/color", response_model=Choice)
def color() -> Choice:
    return Choice(color=Color.red)
```

**Key Points (7.3.3)**

- JSON **numbers** are IEEE floats—**Big integers** may lose precision in JavaScript clients.
- Use **string enums** when numeric codes are confusing cross-language.
- **Media types** distinguish text vs JSON.

**Best Practices (7.3.3)**

- Wrap scalars in **named models** when they might grow fields later.
- Document **units** (`seconds` vs `milliseconds`) in descriptions.

**Common Mistakes (7.3.3)**

- Returning **`bytes`** without encoding clarification.
- Using **`float`** for **currency**.

---

### 7.3.4 File Responses

#### Beginner

Use **`FileResponse`** for on-disk files with correct **`Content-Type`** and optional **`filename`** for downloads.

```python
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()


@app.get("/download")
def download() -> FileResponse:
    path = Path("static/report.pdf")
    return FileResponse(
        path,
        media_type="application/pdf",
        filename="report.pdf",
    )
```

#### Intermediate

**`StreamingResponse`** suits generated files without temp disk. Set headers like **`Content-Disposition`** for attachment behavior.

#### Expert

**Range requests** (`Accept-Ranges`) for large media may require **Starlette**-level customization or static file servers (nginx) in front. Virus-scan uploads before exposing **`FileResponse`** from user-controlled paths—**path traversal** is a classic bug.

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.get("/stream.csv")
def stream_csv() -> StreamingResponse:
    def gen():
        yield b"id,name\n"
        yield b"1,ada\n"

    return StreamingResponse(gen(), media_type="text/csv")
```

**Note:** Prefer a real DB cursor or file iterator in production; keep chunk sizes reasonable for proxies.

**Key Points (7.3.4)**

- **`FileResponse`** is optimized for filesystem reads.
- **Streaming** reduces memory for large exports.
- Never use **raw user input** as filesystem paths.

**Best Practices (7.3.4)**

- Set **`Content-Disposition`** explicitly for downloads.
- Use **`BackgroundTasks`** to clean up temporary files if you must create them.

**Common Mistakes (7.3.4)**

- Omitting **`media_type`**, causing browsers to mishandle files.
- Serving files from **upload directories** without access control.

---

### 7.3.5 Streaming Responses

#### Beginner

**`StreamingResponse`** accepts an **iterator** of bytes (or async iterator) and streams chunks to the client.

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.get("/count")
def count() -> StreamingResponse:
    def nums() -> bytes:
        for i in range(5):
            yield f"{i}\n".encode()

    return StreamingResponse(nums(), media_type="text/plain")
```

#### Intermediate

For **Server-Sent Events**, set **`media_type="text/event-stream"`** and yield **`data: ...\n\n`** frames. Combine with **cache-control: no-cache** headers.

#### Expert

**Backpressure** and **client disconnects** matter: use **`async` generators** and monitor cancellation. For **gzip**, consider middleware carefully with streaming—compression may buffer. Document that **`response_model` does not apply** to non-JSON streams.

```python
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.get("/ticks")
async def ticks() -> StreamingResponse:
    async def gen():
        for _ in range(3):
            await asyncio.sleep(0.1)
            yield b"tick\n"

    return StreamingResponse(gen(), media_type="text/plain")
```

**Key Points (7.3.5)**

- Streaming trades **simplicity** for **memory efficiency**.
- **SSE** and **chunked** encoding are distinct client integrations.
- **Async** iterators fit **async** endpoints naturally.

**Best Practices (7.3.5)**

- Set **`Cache-Control`** appropriately for live streams.
- Handle **client abort** to stop expensive work.

**Common Mistakes (7.3.5)**

- Blocking the event loop inside a **sync** generator doing IO.
- Expecting **OpenAPI** to fully describe arbitrary byte streams.

---

## 7.4 Advanced Response Patterns

Advanced patterns combine **typing**, **status codes**, **pagination**, and **documentation** to keep APIs **scalable** and **tooling-friendly**.

### 7.4.1 Union Types in Response

#### Beginner

Python **`X | Y`** in `response_model` declares **either** schema for success responses.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class A(BaseModel):
    a: int


class B(BaseModel):
    b: str


@app.get("/ab", response_model=A | B)
def ab(flag: bool) -> A | B:
    return A(a=1) if flag else B(b="x")
```

#### Intermediate

Add **`Field(discriminator="kind")`** with **literal** fields in Pydantic v2 for **tagged unions**, helping validation select the correct branch.

#### Expert

Client generators (OpenAPI Generator) may emit **wrapper types** for unions—coordinate with frontend teams. For **JSON:API** or **envelope** patterns, model the **envelope** explicitly rather than relying on implicit unions.

```python
from typing import Literal

from pydantic import BaseModel, Field

class Cat(BaseModel):
    pet_type: Literal["cat"]
    lives: int

class Dog(BaseModel):
    pet_type: Literal["dog"]
    breed: str

Pet = Cat | Dog  # discriminated in model definitions via pet_type

class Wrapper(BaseModel):
    data: Pet = Field(discriminator="pet_type")
```

**Key Points (7.4.1)**

- **Unions** express alternatives; discriminators add **clarity**.
- OpenAPI **`oneOf`** complexity affects **client** tooling.
- **Explicit wrappers** simplify some ecosystems.

**Best Practices (7.4.1)**

- Prefer **discriminators** for polymorphic JSON.
- Keep union members **small** and **stable**.

**Common Mistakes (7.4.1)**

- Overusing **`dict`** unions that erase **type safety**.
- Non-unique discriminators causing **validation** ambiguity.

---

### 7.4.2 Optional Responses

#### Beginner

When a resource may be missing, choose between **`404`** (no body / error schema) or **`200`** with **`null`**—pick one convention per resource type.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    id: int


@app.get("/items/{item_id}", response_model=Item | None)
def maybe_item(item_id: int) -> Item | None:
    if item_id == 0:
        return None
    return Item(id=item_id)
```

#### Intermediate

OpenAPI **nullable** types document `null` responses. Ensure **`response_model`** matches reality; some teams prefer **always 404** for missing entities to simplify caches.

#### Expert

**Conditional models** interact with **ETag**/`304` caching: optional bodies and **304** responses need careful `responses` documentation. For **GraphQL**-style “maybe” fields, REST often still uses **404** for missing **primary** resources.

```python
raise HTTPException(status_code=404, detail="Not found")
```

**Key Points (7.4.2)**

- **`Optional` body** vs **404** is an API design choice with **caching** implications.
- Document **`null`** clearly in OpenAPI descriptions.
- Misaligned **status** and **body** confuse intermediaries.

**Best Practices (7.4.2)**

- Use **404** for unknown IDs in **resource-oriented** APIs.
- Use **`null`** for **optional fields**, not usually whole resources, unless documented.

**Common Mistakes (7.4.2)**

- Returning **`200`** with empty body **without** `Content-Length: 0` clarity.
- Mixing **404** and **`null`** for the same route over time.

---

### 7.4.3 Multiple Status Code Responses

#### Beginner

Declare **`responses`** on the decorator to attach **models** and **descriptions** for non-200 statuses.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    id: int


class Err(BaseModel):
    detail: str


@app.get(
    "/items/{item_id}",
    response_model=Item,
    responses={404: {"model": Err, "description": "Missing item"}},
)
def item(item_id: int) -> Item:
    if item_id < 0:
        raise HTTPException(status_code=404, detail="bad id")
    return Item(id=item_id)
```

#### Intermediate

Combine **`JSONResponse`** with **`status_code`** for success variants like **`201 Created`**. `response_model` still applies when returning a model instance.

#### Expert

For **RFC 7807 Problem Details**, define a **`Problem`** model and register **exception handlers** so OpenAPI matches runtime. Keep **error models** consistent across services for observability.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()


class Problem(BaseModel):
    type: str
    title: str
    status: int
    detail: str


@app.exception_handler(ValueError)
def value_err(request: Request, exc: ValueError) -> JSONResponse:
    body = Problem(
        type="about:blank",
        title="Validation Error",
        status=400,
        detail=str(exc),
    )
    return JSONResponse(status_code=400, content=body.model_dump())
```

**Key Points (7.4.3)**

- **`responses`** improves **OpenAPI** completeness.
- **Exception handlers** unify error body shapes.
- **201/204** are first-class success states in REST.

**Best Practices (7.4.3)**

- Mirror **production** error format in docs.
- Include **correlation IDs** in error payloads (often via middleware).

**Common Mistakes (7.4.3)**

- Documenting **models** for errors never actually returned.
- Returning **inconsistent** `detail` shapes (`str` vs `dict`).

---

### 7.4.4 Generic Responses

#### Beginner

Use **`GenericModel`** patterns in Pydantic v1; in **Pydantic v2**, prefer **`BaseModel`** with **type parameters** (`class Page[T](BaseModel): items: list[T]`) on Python 3.12+ or use **concrete** aliases.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Page(BaseModel):
    items: list[str]
    total: int


@app.get("/page", response_model=Page)
def page() -> Page:
    return Page(items=["a", "b"], total=2)
```

#### Intermediate

For **reusable** envelopes, define **`ApiResponse[T]`**-style models using Python **generics** carefully—OpenAPI may inline concrete instantiations per endpoint.

#### Expert

**OpenAPI** lacks true **higher-kinded** generics; code generators **monomorphize**. Prefer **explicit** `UserPage`, `ItemPage` classes for public APIs if tooling struggles, or provide **overlays** for codegen configs.

```python
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Envelope(BaseModel, Generic[T]):
    data: T
    meta: dict[str, str]


class User(BaseModel):
    id: int


# Concrete usage in a route:
UserEnvelope = Envelope[User]
```

**Key Points (7.4.4)**

- **Generics** aid internal typing; **OpenAPI** sees concrete shapes.
- **Envelope** patterns standardize pagination and metadata.
- Too much abstraction hurts **documentation clarity**.

**Best Practices (7.4.4)**

- Publish **examples** for generic envelopes in OpenAPI.
- Validate **meta** keys with a small **Meta** model when possible.

**Common Mistakes (7.4.4)**

- Assuming **generic** parameters appear magically in **Swagger UI** without concrete routes.
- Using **`Any`** inside envelopes, defeating their purpose.

---

### 7.4.5 Response Pagination

#### Beginner

Return **`items`**, **`limit`**, **`offset`** (or **`cursor`**) fields in a **`Page`** model.

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

app = FastAPI()


class User(BaseModel):
    id: int


class UserPage(BaseModel):
    items: list[User]
    total: int
    limit: int
    offset: int


@app.get("/users", response_model=UserPage)
def users(
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
) -> UserPage:
    data = [User(id=i) for i in range(offset, offset + min(limit, 3))]
    return UserPage(items=data, total=1000, limit=limit, offset=offset)
```

#### Intermediate

**Cursor** pagination uses **opaque** tokens tied to indexed columns; document **ordering** guarantees. Avoid **`OFFSET`** for huge datasets when latency matters.

#### Expert

Add **`Link` headers** (`rel="next"`) for **HATEOAS** clients while still returning JSON metadata. Consider **keyset pagination** on `(created_at, id)` for stable pages under concurrent writes.

```python
from fastapi import FastAPI, Response
from pydantic import BaseModel

app = FastAPI()


class CursorPage(BaseModel):
    items: list[int]
    next_cursor: str | None


@app.get("/cursor", response_model=CursorPage)
def cursor(response: Response) -> CursorPage:
    page = CursorPage(items=[1, 2, 3], next_cursor="abc")
    if page.next_cursor:
        response.headers["Link"] = f'</api?cursor={page.next_cursor}>; rel="next"'
    return page
```

**Key Points (7.4.5)**

- **Limit/offset** is simple; **cursors** scale better for large tables.
- **Stable sort keys** prevent duplicates/skips when data mutates.
- **Headers** can complement JSON navigation hints.

**Best Practices (7.4.5)**

- Enforce **maximum page size** server-side.
- Index **columns** used in pagination filters.

**Common Mistakes (7.4.5)**

- Returning **`total`** on billion-row tables without **approximation** strategy.
- Using **`float`** cursors for time—prefer **ISO strings** or integers.

---

## 7.5 Response Validation

FastAPI validates responses when a **`response_model`** is set, catching bugs where handlers return **invalid shapes** before clients see inconsistent data.

### 7.5.1 Automatic Validation

#### Beginner

With `response_model`, FastAPI builds a Pydantic model from the return value and **validates** fields, raising **500** on failure (server bug).

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Point(BaseModel):
    x: int
    y: int


@app.get("/point", response_model=Point)
def point() -> Point:
    return Point(x=1, y=2)
```

#### Intermediate

Validation adds **CPU** cost proportional to model complexity—usually negligible vs database IO. It is **not** a substitute for **input** validation.

#### Expert

Tune with **`response_model_exclude_unset`** etc., but validation still applies to present fields. For **high-throughput** internal APIs, some teams disable response validation in production via **custom routes**—trade safety for speed cautiously.

```python
# Expert-only pattern sketch — prefer keeping validation on for public APIs
from fastapi import FastAPI

app = FastAPI()


@app.get("/fast", response_model=None)
def fast() -> dict[str, int]:
    return {"x": 1}
```

**Key Points (7.5.1)**

- Response validation catches **server-side** mistakes early.
- Failures surface as **500**—monitor these closely.
- Distinct from **request** validation (422).

**Best Practices (7.5.1)**

- Keep response models **strict** enough to reflect **real** guarantees.
- Log validation errors with **stack traces** and **route ids**.

**Common Mistakes (7.5.1)**

- Returning **SQLAlchemy** objects without proper **`from_attributes`** configuration.
- Swallowing **500** errors without alerts.

---

### 7.5.2 Strict Mode

#### Beginner

Pydantic **strict** types reject coercion (`"1"` → `int` fails). Apply via **`Field(strict=True)`** or `model_config` depending on version/use-case.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class StrictId(BaseModel):
    model_config = {"strict": True}
    id: int


@app.get("/strict", response_model=StrictId)
def strict() -> StrictId:
    return StrictId(id=42)
```

#### Intermediate

Strictness reduces **surprises** cross-language but may break **lenient** internal producers. Often better on **inputs** than outputs.

#### Expert

Combine **strict** validation with **custom serializers** to enforce **canonical** wire formats (e.g., **UUID** only as hyphenated lowercase strings).

```python
from uuid import UUID

from pydantic import BaseModel

class Job(BaseModel):
    model_config = {"strict": True}
    job_id: UUID
```

**Key Points (7.5.2)**

- **Strict** mode disables silent **coercion**.
- Useful when clients are **strongly typed**.
- May increase **500** errors if internal code is sloppy.

**Best Practices (7.5.2)**

- Apply strictness to **IDs** and **enums** first.
- Document **canonical** string formats in OpenAPI.

**Common Mistakes (7.5.2)**

- Enabling strict globally without fixing **data producers**.
- Confusing **strict** with **extra=forbid** (different concern).

---

### 7.5.3 Custom Response Validators

#### Beginner

Use Pydantic **`field_validator`** to enforce invariants on **outgoing** models (also applies on construction).

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator

app = FastAPI()


class Rating(BaseModel):
    value: int

    @field_validator("value")
    @classmethod
    def one_to_five(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("rating must be 1..5")
        return v


@app.get("/rating", response_model=Rating)
def rating() -> Rating:
    return Rating(value=4)
```

#### Intermediate

**`model_validator`** coordinates multi-field rules (e.g., `end > start`). Keep validators **pure** where possible for testability.

#### Expert

Validators run during **serialization paths** that reconstruct models—watch **performance** on hot lists. For **cross-field** database constraints, validate in **service layer** too.

```python
from pydantic import BaseModel, model_validator

class Range(BaseModel):
    start: int
    end: int

    @model_validator(mode="after")
    def ordered(self) -> "Range":
        if self.end < self.start:
            raise ValueError("end before start")
        return self
```

**Key Points (7.5.3)**

- **Validators** encode domain rules once.
- They protect both **incoming** and **outgoing** constructions depending on flow.
- Heavy logic belongs in **services** with validators as **guards**.

**Best Practices (7.5.3)**

- Write **unit tests** for validators independently.
- Use **clear error messages** (will surface as 500 on response path).

**Common Mistakes (7.5.3)**

- Using validators for **authorization** (use **dependencies**).
- Raising **generic** exceptions without context.

---

### 7.5.4 Type Coercion

#### Beginner

By default, Pydantic **coerces** compatible types (`"3"` → `3` for `int` fields) when constructing models—this affects response validation if your return values are **strings** for numeric fields.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Age(BaseModel):
    years: int


@app.get("/age", response_model=Age)
def age() -> Age:
    return Age(years=30)
```

#### Intermediate

Coercion helps **gradual typing** but can **hide** bugs. Prefer matching **types** explicitly in handlers before return.

#### Expert

For **JSON Schema** interoperability, document **formats** (`uuid`, `date-time`) using **`Field(json_schema_extra=...)`** or Pydantic **JSON schema** customizations.

```python
from datetime import datetime

from pydantic import BaseModel, Field

class Event(BaseModel):
    at: datetime = Field(json_schema_extra={"example": "2026-03-28T12:00:00Z"})
```

**Key Points (7.5.4)**

- **Coercion** is convenient but can **mask** type drift.
- **Strict** mode reduces coercion.
- **OpenAPI `format`** hints help clients.

**Best Practices (7.5.4)**

- Return **correct Python types** from handlers.
- Use **mypy**/**pyright** to catch mismatches before runtime.

**Common Mistakes (7.5.4)**

- Relying on **`bool("false") == True`** style truthiness bugs in non-Pydantic code paths.
- Silent **float** narrowing for large integers.

---

### 7.5.5 Error Handling in Response

#### Beginner

If response validation fails, clients see **500 Internal Server Error**. Handle by fixing the handler or loosening the model—**do not** try to “catch” this per route easily without wrappers.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Ok(BaseModel):
    ok: bool


@app.get("/should-be-ok", response_model=Ok)
def broken() -> Ok:
    return Ok(ok=True)
```

#### Intermediate

Register **`exception_handler`** for **`ResponseValidationError`** (Starlette/FastAPI internals) in advanced scenarios to log and transform—rarely expose details to clients.

#### Expert

Instrument with **OpenTelemetry** spans around serialization; tag failures with **route template** and **user id hash** (never PII). Consider **feature flags** to disable response validation in **emergencies** with strong monitoring.

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import ResponseValidationError
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(ResponseValidationError)
def rv_handler(request: Request, exc: ResponseValidationError) -> JSONResponse:
    # Log exc.errors() server-side; return generic message
    return JSONResponse(status_code=500, content={"detail": "Internal error"})
```

**Key Points (7.5.5)**

- Response validation errors are **server bugs**, treated as **500**.
- Custom handlers aid **logging**, not user-facing detail leakage.
- **Monitoring** these errors prevents silent client breakage.

**Best Practices (7.5.5)**

- Alert on spikes in **response validation** failures after deploys.
- Add **contract tests** in CI simulating real serializers.

**Common Mistakes (7.5.5)**

- Returning **tracebacks** to clients in debug mode on public hosts.
- Ignoring **500** spikes as “client problems.”

---

## 7.6 Response Documentation

OpenAPI documentation is a **first-class product** of FastAPI. Response models drive **schemas**, **examples**, and **SDK** generation.

### 7.6.1 OpenAPI Schema Generation

#### Beginner

Run **`GET /openapi.json`** on your app to inspect generated schemas for each operation’s **responses**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class M(BaseModel):
    x: int


@app.get("/m", response_model=M)
def m() -> M:
    return M(x=1)
```

#### Intermediate

Customize **OpenAPI** via **`app.openapi` override** to inject **security**, **servers**, or **common components**—ensure response **$ref** names remain stable for clients.

#### Expert

For **multi-tenant** or **white-label** APIs, merge **static** base schemas with **runtime** fragments carefully—cache merged OpenAPI documents with **ETags** to reduce work.

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(title="Custom OpenAPI Demo", version="1.0.0")


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    app.openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )
    return app.openapi_schema


app.openapi = custom_openapi  # type: ignore[method-assign]
```

**Key Points (7.6.1)**

- **`openapi.json`** is the **contract** for many tools.
- Overrides are powerful and **easy to break**—test diff in CI.
- **`$ref`** reuse keeps schemas **DRY**.

**Best Practices (7.6.1)**

- Pin **FastAPI/Pydantic** versions in lockfiles for reproducible schemas.
- Review **breaking** OpenAPI diffs on upgrades.

**Common Mistakes (7.6.1)**

- Returning **hand-edited** JSON that diverges from actual responses.
- Renaming models **frivolously**, breaking client **$ref** links.

---

### 7.6.2 Example Responses

#### Beginner

Add **`json_schema_extra`** with **`examples`** on models or use **`Field(examples=[...])`** (syntax varies by version—consult your Pydantic docs).

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Item(BaseModel):
    sku: str = Field(examples=["SKU-123"])
    qty: int = Field(examples=[2])


@app.get("/item", response_model=Item)
def item() -> Item:
    return Item(sku="SKU-123", qty=2)
```

#### Intermediate

Use **`openapi_examples` on responses** via `responses` dict for **per-status** examples (FastAPI feature in recent versions—check your release notes).

#### Expert

Generate examples from **factory fixtures** in tests to ensure docs track **reality**. For **PII**, scrub examples automatically in **staging** OpenAPI exports.

```python
class User(BaseModel):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {"id": 1, "email": "user@example.com"},
            ]
        }
    }

    id: int
    email: str
```

**Key Points (7.6.2)**

- **Examples** improve **Swagger UI** usability.
- Keep examples **valid** against the schema.
- Avoid **real** customer data in **public** docs.

**Best Practices (7.6.2)**

- Add **edge case** examples (`qty=0`) when meaningful.
- Localize **description** text if your API is multilingual (rare at schema layer).

**Common Mistakes (7.6.2)**

- Examples that **fail** validation against the same model.
- Huge **blob** examples bloating **openapi.json**.

---

### 7.6.3 Response Descriptions

#### Beginner

Add **`description`** parameters on **decorators** (`@app.get(..., description="...")`) and on **Pydantic `Field`** for individual properties.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Health(BaseModel):
    status: str = Field(description="Service status: ok | degraded | down")


@app.get("/health", response_model=Health, summary="Liveness probe")
def health() -> Health:
    return Health(status="ok")
```

#### Intermediate

Use **`response_description`** on routes to clarify **success** payloads vs generic defaults in OpenAPI.

#### Expert

Adopt a **style guide** for descriptions (imperative vs declarative voice). Pull descriptions from **docstrings** via extensions or codegen if you maintain **parallel** sources—avoid drift.

```python
@app.get(
    "/users/{user_id}",
    response_model=Health,
    response_description="Returns the health snapshot for the user shard.",
)
def user_health(user_id: int) -> Health:
    return Health(status="ok")
```

**Key Points (7.6.3)**

- **Descriptions** are documentation, not validation.
- Consistency helps **grep** and **LLM** tooling.
- **`summary`** vs **`description`** serve different UI slots.

**Best Practices (7.6.3)**

- Mention **units** and **time zones** in descriptions.
- Link to **external** docs with `Field(json_schema_extra={"links": [...]})` sparingly.

**Common Mistakes (7.6.3)**

- Empty **`description`** on complex **financial** fields.
- Copy-pasted **wrong** field descriptions after refactors.

---

### 7.6.4 Multiple Response Examples

#### Beginner

FastAPI supports **`openapi_examples`** on parameters; for bodies/responses, supply **`examples` dict** in OpenAPI extras where supported by your version.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Report(BaseModel):
    title: str
    score: float


@app.get("/report", response_model=Report)
def report() -> Report:
    return Report(title="Q1", score=0.95)
```

#### Intermediate

Use **`responses[200]["content"]["application/json"]["examples"]`** manually in advanced `responses` dict configuration for **multiple** named examples per status.

#### Expert

Drive **contract tests** by iterating declared **examples** and asserting they parse—keeps docs honest. Version examples alongside **API version** tags.

```python
responses = {
    200: {
        "description": "OK",
        "content": {
            "application/json": {
                "examples": {
                    "success": {"summary": "Good", "value": {"title": "Q1", "score": 0.9}},
                    "perfect": {"summary": "Max", "value": {"title": "Q2", "score": 1.0}},
                }
            }
        },
    }
}
```

**Key Points (7.6.4)**

- Multiple examples clarify **domain** variants.
- OpenAPI **3** uses structured **examples** maps.
- Align **names** with **SDK** snippets where possible.

**Best Practices (7.6.4)**

- Name examples **`happy_path`**, **`empty_list`**, **`rate_limited`** consistently.
- Review examples in **Swagger UI** after each release.

**Common Mistakes (7.6.4)**

- Providing **examples** only in Markdown external docs, not **OpenAPI**.
- Conflicting **example** vs **examples** keys in schema objects.

---

### 7.6.5 Documentation Best Practices

#### Beginner

Keep **`title`**, **`version`**, and **`description`** on the `FastAPI()` app meaningful; group routes with **`openapi_tags`**.

```python
from fastapi import FastAPI

app = FastAPI(
    title="Inventory API",
    version="1.0.0",
    openapi_tags=[
        {"name": "items", "description": "SKU operations"},
    ],
)
```

#### Intermediate

Add **`deprecated=True`** on routes transitioning out; mirror in response models with **`Field(deprecated=True)`** when fields sunset.

#### Expert

Publish **openapi.json** to **portal** with **linting** (Spectral rules): require **descriptions**, **examples**, and **standard error** schemas. Integrate **CI** failure on **breaking** changes (openapi-diff).

```python
@app.get("/legacy", deprecated=True)
def legacy() -> dict[str, str]:
    return {"note": "use /v2"}
```

**Key Points (7.6.5)**

- Treat OpenAPI as a **product artifact**.
- **Deprecation** belongs in docs **and** communication channels.
- **Lint** and **diff** OpenAPI in CI.

**Best Practices (7.6.5)**

- Assign **owners** per `openapi_tags` section in large orgs.
- Keep **changelog** entries linked to schema changes.

**Common Mistakes (7.6.5)**

- Auto-generated **opaque** schema names confusing readers.
- **Undocumented** error bodies across services.

---

## 7.7 Performance Considerations

Response models add **value** and **cost**. Tune serialization, shape, and transport for your **SLAs**.

### 7.7.1 Response Model Overhead

#### Beginner

Validation and serialization take **CPU**. For tiny JSON, overhead is **microseconds**; for large lists, cost grows **linearly**.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Row(BaseModel):
    id: int


@app.get("/many", response_model=list[Row])
def many() -> list[Row]:
    return [Row(id=i) for i in range(10_000)]
```

#### Intermediate

Profile with **`py-spy`** or **`yappi`** if endpoints CPU-bound. Compare **`ORJSONResponse`** vs default JSON.

#### Expert

Avoid constructing **giant** intermediate Python lists—stream **DB cursors** when possible. Use **`model_dump` batching** patterns cautiously; sometimes **raw SQL to CSV** beats ORM+Pydantic.

```python
# Micro-benchmark mindset — measure before optimizing
import time
from pydantic import BaseModel, TypeAdapter


class Row(BaseModel):
    id: int


adapter = TypeAdapter(list[Row])
t0 = time.perf_counter()
adapter.validate_python([{"id": i} for i in range(1000)])
_ = time.perf_counter() - t0
```

**Key Points (7.7.1)**

- **Measure** before blaming Pydantic.
- **Large payloads** dominate latency more than validation.
- **Algorithms** beat serializers.

**Best Practices (7.7.1)**

- Cache **immutable** read models when safe.
- Paginate **huge** collections.

**Common Mistakes (7.7.1)**

- Prematurely removing **validation** without metrics.
- Serializing **ORM** graphs far wider than the **wire** needs.

---

### 7.7.2 Excluding Unset Fields

#### Beginner

**`response_model_exclude_unset=True`** omits fields that were not explicitly set when constructing the model (defaults only).

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Profile(BaseModel):
    name: str = "anon"
    bio: str | None = None


@app.get("/profile", response_model=Profile, response_model_exclude_unset=True)
def profile() -> Profile:
    return Profile(name="Ada")  # bio default may be omitted depending on construction
```

#### Intermediate

Interaction with **`model_construct`** differs from **`model_validate`**—understand which paths mark fields **set**.

#### Expert

Clients relying on **always-present keys** may break when unset fields disappear—version carefully. Combine with **`model_dump(exclude_unset=True)`** patterns in manual responses if you bypass FastAPI’s helper.

```python
from pydantic import BaseModel

class M(BaseModel):
    a: int = 1
    b: int = 2

m = M.model_construct(a=3)
assert m.model_dump(exclude_unset=True) == {"a": 3}
```

**Key Points (7.7.2)**

- **`exclude_unset`** shrinks JSON size.
- Semantics differ across **construction** APIs.
- **Breaking** for clients expecting **nulls** vs **missing** keys.

**Best Practices (7.7.2)**

- Document **key presence** guarantees per endpoint.
- Use **`Optional`** + explicit **`None`** when `null` must appear.

**Common Mistakes (7.7.2)**

- Assuming **defaults** imply **unset**—they do not after full validation.
- Changing **exclude_unset** behavior in a **patch** release.

---

### 7.7.3 Lazy Loading

#### Beginner

**Lazy** here means deferring **expensive work** until needed—e.g., not querying optional expansions until `?expand=` is passed.

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()


class User(BaseModel):
    id: int


class UserDetail(User):
    bio: str


@app.get("/users/{user_id}", response_model=User | UserDetail)
def user(user_id: int, expand: bool = Query(False)) -> User | UserDetail:
    if expand:
        return UserDetail(id=user_id, bio="likes FastAPI")
    return User(id=user_id)
```

#### Intermediate

ORM **lazy loaders** can still trigger implicit IO during serialization—prefer **explicit** service functions that fetch only requested **projections**.

#### Expert

Use **`selectinload`** only when the response actually includes relations; instrument SQL counts per request in **staging** to catch accidental **cascades**.

```python
# Service-layer sketch
def get_user(user_id: int, *, with_bio: bool) -> User | UserDetail:
    if with_bio:
        return UserDetail(id=user_id, bio=fetch_bio(user_id))
    return User(id=user_id)
```

**Key Points (7.7.3)**

- **API-level** laziness improves **average** latency.
- **ORM** laziness is a **footgun** during serialization.
- **Explicit** beats **implicit** for performance audits.

**Best Practices (7.7.3)**

- Add **`expand`** or **sparse fieldsets** standards across resources.
- Test **worst-case** expand graphs.

**Common Mistakes (7.7.3)**

- Returning ORM objects with **default lazy** relationships enabled.
- **N+1** queries hidden behind **property** accessors.

---

### 7.7.4 Caching Responses

#### Beginner

Set **`Cache-Control`**, **`ETag`**, and **`Last-Modified`** headers (see Topic 9) to let clients and CDNs cache **GET** responses safely.

```python
from fastapi import FastAPI, Response
from pydantic import BaseModel

app = FastAPI()


class Stat(BaseModel):
    hits: int


@app.get("/stats", response_model=Stat)
def stats(response: Response) -> Stat:
    response.headers["Cache-Control"] = "public, max-age=60"
    return Stat(hits=123)
```

#### Intermediate

**`response_model`** does not compute **ETags**—use **middleware** or dependencies. Invalidate caches on **mutations** with **versioned** URLs or **surrogate keys** (CDN feature).

#### Expert

For **personalized** JSON, use **`private`** cache directives or **`Vary: Authorization`**. Beware **stale** admin views when caching aggressively—partition **anonymous** vs **authenticated** routes.

```python
response.headers["Cache-Control"] = "private, no-store"
```

**Key Points (7.7.4)**

- **Caching** interacts with **authorization**—never cache **user-private** data publicly.
- **ETags** reduce bandwidth on **304** responses.
- **OpenAPI** should mention **cache** behavior in descriptions when non-obvious.

**Best Practices (7.7.4)**

- Prefer **`max-age`** with **immutable** assets hashed by filename.
- Document **which** GETs are safe to cache.

**Common Mistakes (7.7.4)**

- Caching **HTML error pages** at CDN for API paths.
- Missing **`Vary`** when content depends on **Accept-Language**.

---

### 7.7.5 Streaming Large Responses

#### Beginner

Use **`StreamingResponse`** or **`FileResponse`** instead of building **multi-gigabyte** strings in memory.

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.get("/big.txt")
def big() -> StreamingResponse:
    def chunks():
        for i in range(1000):
            yield f"line {i}\n".encode()

    return StreamingResponse(chunks(), media_type="text/plain")
```

#### Intermediate

Ensure **reverse proxies** (`nginx`) do not buffer excessively, defeating streaming—tune **`proxy_buffering`**.

#### Expert

For **CSV/Parquet** exports, consider **background jobs** + **signed URLs** to object storage for **very large** datasets; stream only **moderate** sizes through app servers.

```python
# Pattern: return redirect to pre-signed S3 URL (pseudo-code)
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()


@app.get("/export")
def export() -> RedirectResponse:
    return RedirectResponse(url="https://cdn.example/presigned", status_code=302)
```

**Key Points (7.7.5)**

- **Stream** to protect **memory**.
- **Jobs + object storage** scale further than app streaming.
- **Proxies** must cooperate with **chunked** encoding.

**Best Practices (7.7.5)**

- Track **export** jobs with **idempotency keys**.
- Authenticate **download URLs** with **short TTL** tokens.

**Common Mistakes (7.7.5)**

- Holding **DB transactions** open for entire stream duration.
- No **timeout** configuration on long streams through gateways.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points (Chapter 7)

- **`response_model`** defines the **contract** for successful JSON responses and powers **OpenAPI** schemas.
- **Filtering** (models, include/exclude, partials) is a **privacy** and **evolution** tool—design explicit **read models** for stability.
- Not all responses are **JSON models**; **files** and **streams** need different **response classes** and documentation strategies.
- **Response validation** catches **server bugs** early but adds **CPU** cost—tune consciously.
- **Performance** wins usually come from **database**, **pagination**, and **caching**, not micro-optimizing serializers alone.

### Best Practices (Chapter 7)

- Maintain **`XxxCreate` / `XxxUpdate` / `XxxRead`** model families per aggregate.
- Document **errors** with **`responses`** and centralized **exception handlers**.
- Add **integration tests** that assert **JSON keys** and **status codes** for critical routes.
- Prefer **UTC** datetimes and **explicit** money representations in schemas.
- Review **OpenAPI diffs** in CI when upgrading **FastAPI** or **Pydantic**.

### Common Mistakes (Chapter 7)

- Returning **ORM** entities with **lazy** relationships without considering **queries** and **secrets**.
- Using **`dict`** response models for everything, losing **schema** and **validation**.
- Relying on **response filtering** instead of **authorization** checks.
- **Undocumented** `Union` responses that confuse **clients** and **codegen**.
- **Caching** personalized responses with **public** cache headers.

---

### Appendix: Minimal Runnable `main.py` (Response Model Tour)

```python
from datetime import datetime, timezone
from typing import Annotated

from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Response Models Tour", version="1.0.0")


class Item(BaseModel):
    sku: str = Field(examples=["SKU-1"])
    qty: int = Field(ge=0)


class ItemPage(BaseModel):
    items: list[Item]
    total: int


@app.get("/items", response_model=ItemPage)
def list_items(
    limit: Annotated[int, Query(le=50, ge=1)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ItemPage:
    rows = [Item(sku=f"SKU-{i}", qty=i) for i in range(offset, offset + limit)]
    return ItemPage(items=rows, total=10_000)


class Health(BaseModel):
    status: str
    at: datetime


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", at=datetime.now(timezone.utc))
```

---
