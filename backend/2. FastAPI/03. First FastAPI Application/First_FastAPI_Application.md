# First FastAPI Application

## 📑 Table of Contents

- [3.1 Creating a Basic App](#31-creating-a-basic-app)
  - [3.1.1 Importing FastAPI](#311-importing-fastapi)
  - [3.1.2 Creating an Instance](#312-creating-an-instance)
  - [3.1.3 First Endpoint (GET)](#313-first-endpoint-get)
  - [3.1.4 Running the Application](#314-running-the-application)
  - [3.1.5 Testing with Browser](#315-testing-with-browser)
  - [3.1.6 Returning JSON](#316-returning-json)
- [3.2 Understanding the Framework](#32-understanding-the-framework)
  - [3.2.1 Route Decorators](#321-route-decorators)
  - [3.2.2 HTTP Methods (@app.get, @app.post, etc.)](#322-http-methods-appget-apppost-etc)
  - [3.2.3 Path Operations](#323-path-operations)
  - [3.2.4 Response Data](#324-response-data)
  - [3.2.5 Status Codes Basics](#325-status-codes-basics)
- [3.3 Interactive API Documentation](#33-interactive-api-documentation)
  - [3.3.1 Swagger UI (/docs)](#331-swagger-ui-docs)
  - [3.3.2 ReDoc (/redoc)](#332-redoc-redoc)
  - [3.3.3 OpenAPI Schema](#333-openapi-schema)
  - [3.3.4 Testing from Documentation](#334-testing-from-documentation)
  - [3.3.5 Customizing Documentation](#335-customizing-documentation)
- [3.4 Application Structure](#34-application-structure)
  - [3.4.1 Single File Applications](#341-single-file-applications)
  - [3.4.2 Multi-File Applications](#342-multi-file-applications)
  - [3.4.3 Application Factory Pattern](#343-application-factory-pattern)
  - [3.4.4 Router Organization](#344-router-organization)
  - [3.4.5 Project Layout](#345-project-layout)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)
- [Appendix: Full Starter Examples](#appendix-full-starter-examples)

---

## 3.1 Creating a Basic App

### 3.1.1 Importing FastAPI

#### Beginner

Every FastAPI project starts by importing the **`FastAPI` class** from the `fastapi` package:

```python
from fastapi import FastAPI
```

This import gives you the constructor used to build your application object. You typically place imports at the **top** of `main.py` (or another module) following PEP 8 ordering: standard library, third party, local.

#### Intermediate

You may also import submodules you need later (`HTTPException`, `Depends`, `APIRouter`, `Query`, `Path`, and so on). Keeping imports **minimal** at first reduces cognitive load; add as you learn each feature. Type checkers (Pyright/mypy) benefit from explicit imports rather than star imports.

#### Expert

Large codebases sometimes use **`from __future__ import annotations`** to postpone evaluation of annotations, enabling forward references without quotes. FastAPI resolves annotations for endpoint signatures—ensure **runtime** types are available or use **`model_rebuild()`** patterns for forward-ref Pydantic models.

```python
# import_patterns.py
from __future__ import annotations

from fastapi import FastAPI  # primary application class

app = FastAPI()


@app.get("/import-check")
def import_check() -> dict[str, str]:
    return {"fastapi_imported": "yes"}
```

**Key Points (3.1.1)**

- **`FastAPI`** is the application class; other symbols are imported as needed.

**Best Practices (3.1.1)**

- Avoid **`from fastapi import *`** for clarity and linter friendliness.

**Common Mistakes (3.1.1)**

- Naming your file **`fastapi.py`**, shadowing the installed package and breaking imports.

---

### 3.1.2 Creating an Instance

#### Beginner

Create the app with:

```python
app = FastAPI()
```

This **`app`** object is the ASGI application you pass to Uvicorn (`uvicorn main:app`). You can pass **metadata** like `title` and `version` to improve generated documentation.

#### Intermediate

Common constructor arguments include `title`, `description`, `version`, `openapi_tags`, `docs_url`, `redoc_url`, and `openapi_url`. These shape the **OpenAPI** document and the HTML documentation pages.

#### Expert

Multiple apps can coexist in one process for advanced testing scenarios, but production services usually expose **one** primary `FastAPI()` instance per service. Use **`lifespan`** context (Starlette) for startup/shutdown hooks instead of legacy `@app.on_event` where possible.

```python
# app_instance_meta.py
from fastapi import FastAPI

app = FastAPI(
    title="First Application",
    description="Learning notes demo service",
    version="0.1.0",
)


@app.get("/meta")
def meta() -> dict[str, str]:
    return {"app_title": app.title}
```

**Key Points (3.1.2)**

- The **`app`** variable name is convention; Uvicorn needs **`module:attribute`** matching it.

**Best Practices (3.1.2)**

- Set **`title`/`version`** even in tutorials—it mirrors real projects.

**Common Mistakes (3.1.2)**

- Creating the **`FastAPI()`** instance inside a function without returning/exporting it consistently for Uvicorn.

---

### 3.1.3 First Endpoint (GET)

#### Beginner

Attach a **GET** route with a decorator:

```python
@app.get("/")
def read_root():
    return {"Hello": "World"}
```

The function name is arbitrary; the **path** and **decorator** determine the URL. `GET` is the default browser navigation method.

#### Intermediate

Add **type annotations** for parameters and return values to unlock validation and OpenAPI:

```python
@app.get("/items/{item_id}")
def read_item(item_id: int) -> dict[str, int]:
    return {"item_id": item_id}
```

#### Expert

You can declare **sync** or **async** functions. FastAPI runs sync functions in a threadpool to avoid blocking the event loop, but blocking inside `async def` remains dangerous.

```python
# first_get_endpoints.py
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "root"}


@app.get("/hello/{name}")
def hello(name: str) -> dict[str, str]:
    return {"hello": name}
```

**Key Points (3.1.3)**

- **`@app.get("/path")`** registers a GET **path operation**.

**Best Practices (3.1.3)**

- Prefer **typed** signatures from the first real endpoint onward.

**Common Mistakes (3.1.3)**

- Forgetting the **leading slash** in paths (`"items"` vs `"/items"`).

---

### 3.1.4 Running the Application

#### Beginner

From the directory containing `main.py`:

```bash
uvicorn main:app --reload
```

Uvicorn prints a local URL (often `http://127.0.0.1:8000`). **`--reload`** restarts on file changes (development only).

#### Intermediate

Specify host/port explicitly:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

If your module lives in a package, use dotted paths: `uvicorn mypkg.main:app`.

#### Expert

For containers, bind `0.0.0.0` and configure **workers** at the process manager level. Use **environment variables** for ports to match **12-factor** style configs.

```python
# main_run_target.py — save as main.py for CLI usage
from fastapi import FastAPI

app = FastAPI()


@app.get("/run-check")
def run_check() -> dict[str, str]:
    return {"uvicorn": "should serve this"}
```

**Key Points (3.1.4)**

- **`uvicorn module:app`** imports `module` and uses attribute `app`.

**Best Practices (3.1.4)**

- Add a **README** snippet with the exact Uvicorn command.

**Common Mistakes (3.1.4)**

- Running Uvicorn from the **wrong directory**, breaking imports.

---

### 3.1.5 Testing with Browser

#### Beginner

Start the server, open **Chrome/Firefox/Safari**, visit `http://127.0.0.1:8000/`. For JSON endpoints, browsers display raw JSON. Use **`/docs`** for a friendlier UI to try requests.

#### Intermediate

**Bookmarks**: save `http://127.0.0.1:8000/docs` for quick access. Hard refresh (**Cmd+Shift+R** / **Ctrl+F5**) if caching interferes during development (rare for JSON APIs).

#### Expert

For **HTTPS** local dev, terminate TLS with **mkcert** + reverse proxy or tools like **Caddy**. Browsers enforce **secure context** for some APIs—plan accordingly if you test **service workers** or **cookies** with `Secure` flags.

```python
# browser_friendly_message.py
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/welcome", response_class=HTMLResponse)
def welcome() -> str:
    return "<h1>Hello from FastAPI</h1><p>Open <code>/docs</code> next.</p>"
```

**Key Points (3.1.5)**

- Browsers are great for **GET** checks; **POST** JSON is easier in **Swagger UI**.

**Best Practices (3.1.5)**

- Keep **dev** servers on **localhost** unless you intend network exposure.

**Common Mistakes (3.1.5)**

- Trying to **POST** complex JSON purely via address bar (use docs or curl).

---

### 3.1.6 Returning JSON

#### Beginner

Return a **`dict`**, **`list`**, or Pydantic **model**—FastAPI serializes to JSON with the default JSON encoder. Numbers, strings, booleans, nested structures are typical.

#### Intermediate

Use **`response_model=YourModel`** to enforce output shape and strip fields. Switch to **`ORJSONResponse`** for performance when appropriate.

#### Expert

Return **`Response` subclasses** for custom status/headers, **`StreamingResponse`** for streams, or **`JSONResponse`** when you need explicit `status_code` and `headers` together with JSON bodies.

```python
# returning_json.py
from pydantic import BaseModel
from fastapi import FastAPI

app = FastAPI()


class Item(BaseModel):
    sku: str
    qty: int


@app.get("/items/demo", response_model=Item)
def demo_item() -> Item:
    return Item(sku="ABC", qty=3)


@app.get("/raw-dict")
def raw_dict() -> dict[str, list[int]]:
    return {"nums": [1, 2, 3]}
```

### Key Points (Section 3.1)

- **Import** `FastAPI`, **instantiate** `app`, **`@app.get`**, **run** Uvicorn, **view** in browser/docs.
- **JSON** responses are the default happy path for dicts and models.

### Best Practices (Section 3.1)

- Use **types** immediately; they power validation and documentation.

### Common Mistakes (Section 3.1)

- **Shadowing** the `fastapi` module with your filenames.
- **Blocking** async routes with synchronous sleeps/ORM calls.

---

## 3.2 Understanding the Framework

### 3.2.1 Route Decorators

#### Beginner

Decorators like **`@app.get("/path")`** **register** your function as a handler for that HTTP method + path. The order of registration rarely matters unless paths **overlap** ambiguously—prefer **distinct, explicit** paths.

#### Intermediate

You can stack **multiple methods** by duplicating decorators on the same function is **not** the pattern—instead use `@app.api_route("/path", methods=["GET", "HEAD"])` or separate functions. For clarity, prefer **one method per function**.

#### Expert

Internally, Starlette’s router matches **first registered** compatible route depending on configuration; avoid relying on subtle overlap. Use **`APIRouter`** to namespace segments (`/users`, `/items`).

```python
# decorators_methods.py
from fastapi import FastAPI

app = FastAPI()


@app.api_route("/dual", methods=["GET", "HEAD"])
def dual() -> dict[str, str]:
    return {"methods": "GET or HEAD"}
```

**Key Points (3.2.1)**

- Decorators **bind** URL paths and HTTP verbs to Python callables.

**Best Practices (3.2.1)**

- Keep paths **RESTful** and **nouns**-oriented where reasonable (`/items`, `/items/{id}`).

**Common Mistakes (3.2.1)**

- Using **`@app.get`** for actions that mutate server state without documenting **POST** semantics.

---

### 3.2.2 HTTP Methods (@app.get, @app.post, etc.)

#### Beginner

Common decorators:

- `@app.get` — read, idempotent
- `@app.post` — create or non-idempotent actions
- `@app.put` — replace resource
- `@app.patch` — partial update
- `@app.delete` — delete

Browsers issue **GET** by default; **POST** JSON typically comes from clients or Swagger UI.

#### Intermediate

**HEAD** and **OPTIONS** are supported via `api_route` or Starlette behaviors. **TRACE** is uncommon and often disabled for security in proxies.

#### Expert

Design **idempotency keys** for POST in payment APIs; FastAPI won’t do this automatically—use **dependencies** and **database constraints**.

```python
# http_verbs_demo.py
from pydantic import BaseModel
from fastapi import FastAPI

app = FastAPI()


class Note(BaseModel):
    text: str


notes: dict[int, Note] = {}
next_id = 1


@app.post("/notes", status_code=201)
def create_note(n: Note) -> Note:
    global next_id
    nid = next_id
    next_id += 1
    notes[nid] = n
    return n


@app.get("/notes/{note_id}")
def read_note(note_id: int) -> Note:
    return notes[note_id]


@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int) -> None:
    notes.pop(note_id, None)
```

**Key Points (3.2.2)**

- Match **HTTP method semantics** to your operation to keep APIs predictable.

**Best Practices (3.2.2)**

- Return correct **status codes** (`201` for creates, `204` for empty deletes).

**Common Mistakes (3.2.2)**

- Using **GET** endpoints that **mutate** server state.

---

### 3.2.3 Path Operations

#### Beginner

FastAPI calls each combination of **path + HTTP method** a **path operation** in its documentation language. Your Python function is the **endpoint** or **route handler**.

#### Intermediate

Path operations appear in **OpenAPI** as **operations** with `operationId`, `parameters`, `requestBody`, and `responses`. Good names and tags make docs navigable.

#### Expert

You can set **`operation_id`** explicitly for codegen-friendly clients and **`deprecated=True`** to signal sunsetting.

```python
# path_operation_ids.py
from fastapi import FastAPI

app = FastAPI()


@app.get("/users/", operation_id="listUsers")
def list_users() -> list[str]:
    return ["alice"]


@app.get("/legacy/ping", deprecated=True)
def legacy_ping() -> dict[str, str]:
    return {"ping": "deprecated example"}
```

**Key Points (3.2.3)**

- **Path operation** = framework term for one HTTP endpoint definition.

**Best Practices (3.2.3)**

- Use **`tags`** to group path operations in Swagger UI.

**Common Mistakes (3.2.3)**

- Duplicating **paths** with the same method accidentally.

---

### 3.2.4 Response Data

#### Beginner

Return Python objects; FastAPI converts them to JSON. Use **`response_model`** to document and **filter** output fields.

#### Intermediate

Use **`response_model_exclude_unset`** or `response_model_exclude` for partial representations. For **different status** payloads, declare `responses={404: {"model": ErrorModel}}` metadata.

#### Expert

**StreamingResponse** with async generators for **large downloads**; **FileResponse** for on-disk files; **HTMLResponse**/`PlainTextResponse` for non-JSON.

```python
# response_data_shapes.py
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI()


class PublicUser(BaseModel):
    username: str


class PrivateUser(BaseModel):
    username: str
    password_hash: str


@app.get("/user/demo", response_model=PublicUser)
def user_demo() -> PrivateUser:
    return PrivateUser(username="alice", password_hash="SECRET")
```

**Key Points (3.2.4)**

- **`response_model`** is about **output contract**, not only documentation.

**Best Practices (3.2.4)**

- Never return **raw ORM rows** without considering hidden columns.

**Common Mistakes (3.2.4)**

- Returning **`None`** from functions declared to return **models** without handling `Optional`.

---

### 3.2.5 Status Codes Basics

#### Beginner

Default success for GET/POST is **200** unless you override with `status_code=` on the decorator. **201 Created** is typical for POST creates. **204 No Content** signals success with empty body.

#### Intermediate

Use **`HTTPException(status_code=404)`** for not found. **422** is automatic for validation errors. **401/403** for authz problems—pair with security dependencies in real apps.

#### Expert

Consistent **error models** (`{"detail": ...}`) improve client parsing. Document error shapes in OpenAPI via `responses` for important 4xx/5xx cases.

```python
# status_codes_basics.py
from fastapi import FastAPI, HTTPException

app = FastAPI()

items = {1: "apple"}


@app.post("/items/{item_id}", status_code=201)
def create(item_id: int, name: str) -> dict[str, str | int]:
    items[item_id] = name
    return {"item_id": item_id, "name": name}


@app.get("/items/{item_id}")
def read(item_id: int) -> dict[str, str | int]:
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item_id": item_id, "name": items[item_id]}


@app.delete("/items/{item_id}", status_code=204)
def delete(item_id: int) -> None:
    items.pop(item_id, None)
```

### Key Points (Section 3.2)

- **Decorators + HTTP methods + paths** define the API surface.
- **Status codes** communicate outcomes to clients—choose them deliberately.

### Best Practices (Section 3.2)

- Document **non-200** responses where clients depend on structured errors.

### Common Mistakes (Section 3.2)

- Always returning **200** with error payloads buried in JSON bodies.

---

## 3.3 Interactive API Documentation

### 3.3.1 Swagger UI (/docs)

#### Beginner

Navigate to **`http://127.0.0.1:8000/docs`** (unless you changed `docs_url`). You’ll see all **path operations**, can **expand** them, **Try it out**, fill parameters, and **Execute** requests.

#### Intermediate

Swagger UI reads **`/openapi.json`**. It shows **schemas** for Pydantic models and **security** schemes when configured. Download OpenAPI JSON for **import into Postman**.

#### Expert

Customize Swagger UI parameters via `swagger_ui_parameters` in `FastAPI(...)` (options evolve—consult current docs). Disable docs in locked-down environments with `docs_url=None`.

```python
# swagger_ui_app.py
from fastapi import FastAPI

app = FastAPI(title="Swagger Demo")


@app.get("/add")
def add(a: int, b: int) -> dict[str, int]:
    return {"result": a + b}
```

**Key Points (3.3.1)**

- **Swagger UI** is the fastest way to learn your own API while building it.

**Best Practices (3.3.1)**

- Add **`summary`/`description`** on critical operations for teammates.

**Common Mistakes (3.3.1)**

- Assuming **`/docs`** is safe to expose publicly without auth.

---

### 3.3.2 ReDoc (/redoc)

#### Beginner

**ReDoc** is another HTML documentation view, often at **`/redoc`**. It emphasizes **readable** schema docs compared to Swagger’s interactive focus.

#### Intermediate

Some teams prefer ReDoc for **public API reference** and Swagger for **internal QA**. Both consume the same OpenAPI schema.

#### Expert

Set `redoc_url=None` to disable. Host **static ReDoc** externally pointing at your `/openapi.json` if you want docs separated from the API origin (mind **CORS**).

```python
# redoc_enabled.py
from fastapi import FastAPI

app = FastAPI(title="ReDoc Demo")


@app.get("/hello")
def hello() -> dict[str, str]:
    return {"msg": "see /redoc"}
```

**Key Points (3.3.2)**

- **ReDoc** + **Swagger** = complementary views of one schema.

**Best Practices (3.3.2)**

- Choose **one** primary doc style for external developers and link prominently.

**Common Mistakes (3.3.2)**

- Forgetting to **redeploy** after OpenAPI-affecting changes and reading **stale** docs.

---

### 3.3.3 OpenAPI Schema

#### Beginner

The raw JSON schema lives at **`/openapi.json`**. It lists **paths**, **components/schemas**, and **securityDefinitions** equivalents (OpenAPI 3 naming).

#### Intermediate

You can **pretty-print** it with `jq` for inspection:

```bash
curl -s http://127.0.0.1:8000/openapi.json | jq '.paths | keys'
```

#### Expert

Override **`app.openapi`** method to merge **custom** components or patch generated schema for legacy clients—test thoroughly, as mistakes break codegen.

```python
# openapi_json_route.py
from fastapi import FastAPI

app = FastAPI()


@app.get("/schema-hint")
def schema_hint() -> dict[str, str]:
    return {"openapi": "/openapi.json"}
```

**Key Points (3.3.3)**

- **OpenAPI** is the **contract** between backend and clients/tooling.

**Best Practices (3.3.3)**

- Commit **schema snapshots** in CI diff jobs for breaking-change detection.

**Common Mistakes (3.3.3)**

- Manually editing **generated** schema instead of **code**.

---

### 3.3.4 Testing from Documentation

#### Beginner

In Swagger UI, click **Try it out** → fill fields → **Execute**. Inspect **response code**, **body**, and **curl** snippet Swagger generates—useful for sharing repro steps.

#### Intermediate

Provide **examples** via Pydantic `Field(examples=[...])` or OpenAPI `openapi_examples` on parameters to pre-fill realistic payloads.

#### Expert

Pair docs testing with **automated** tests (`httpx.AsyncClient(app=app, base_url="http://test")` or `TestClient`) so regressions are caught **without** manual clicking.

```python
# examples_for_docs.py
from typing import Annotated

from fastapi import FastAPI, Body

app = FastAPI()


@app.post("/echo")
def echo(
    payload: Annotated[
        dict,
        Body(
            openapi_examples={
                "sample": {
                    "summary": "A sample",
                    "value": {"name": "alice", "score": 99},
                }
            },
        ),
    ],
) -> dict:
    return payload
```

**Key Points (3.3.4)**

- **Examples** improve manual testing quality and onboarding speed.

**Best Practices (3.3.4)**

- Keep examples **valid** against current schemas.

**Common Mistakes (3.3.4)**

- Relying solely on manual tests for **releases**.

---

### 3.3.5 Customizing Documentation

#### Beginner

Pass **`title`**, **`description`**, and **`version`** to `FastAPI()`. Use **`tags`** with `openapi_tags=[{"name": "users", "description": "..."}]`.

#### Intermediate

Add per-operation **`summary`**, **`description`**, **`responses`**, and **`deprecated`**. Include **contact** and **license** metadata at the app level for public APIs.

#### Expert

Federation patterns: publish **docs** on a portal while protecting **`/openapi.json`** behind auth or network policies. Use **`root_path`** when mounted behind a subpath reverse proxy so URLs in OpenAPI resolve correctly.

```python
# customize_docs_meta.py
from fastapi import FastAPI

app = FastAPI(
    title="Custom Docs API",
    description="Demonstrates rich metadata.",
    version="1.0.0",
    contact={"name": "API Owner", "email": "owner@example.com"},
    license_info={"name": "MIT"},
    openapi_tags=[{"name": "math", "description": "Arithmetic endpoints"}],
)


@app.get("/sum", tags=["math"])
def sum_ab(a: int, b: int) -> dict[str, int]:
    return {"sum": a + b}
```

### Key Points (Section 3.3)

- **`/docs`**, **`/redoc`**, and **`/openapi.json`** are three views of the same truth.

### Best Practices (Section 3.3)

- Invest in **metadata** early—it is cheaper than retrofitting public docs.

### Common Mistakes (Section 3.3)

- **Misconfigured `root_path`** breaking try-it-out URLs behind proxies.

---

## 3.4 Application Structure

### 3.4.1 Single File Applications

#### Beginner

Early projects fit in **`main.py`**: imports, `app = FastAPI()`, routes, and maybe a `if __name__ == "__main__": uvicorn.run(...)`. This is perfect for learning.

#### Intermediate

When files exceed **hundreds** of lines or mix many domains, readability drops. Keep **single-file** apps **only** while scope is small.

#### Expert

Even single-file apps can use **`APIRouter`** internally to group code regions—prepares for extraction without large rewrites.

```python
# single_file_app.py
from fastapi import APIRouter, FastAPI

app = FastAPI(title="Single File")
router = APIRouter()


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"ping": "pong"}


app.include_router(router)
```

**Key Points (3.4.1)**

- **Single file** is valid; **scale out** when cognitive load grows.

**Best Practices (3.4.1)**

- Keep **config** out of handler globals when you outgrow demos.

**Common Mistakes (3.4.1)**

- Turning one file into a **god module** with unrelated domains.

---

### 3.4.2 Multi-File Applications

#### Beginner

Split modules: `main.py` creates `app` and includes routers from `routes/items.py`, `routes/users.py`. Each submodule defines an **`APIRouter`**.

#### Intermediate

Use **package** layout (`app/__init__.py`, `app/main.py`) and run with `uvicorn app.main:app`. Ensure **`__init__.py`** files exist for classic package imports (unless using namespace packages deliberately).

#### Expert

Apply **boundary rules**: routes thin, services encapsulate business logic, repositories handle persistence. FastAPI doesn’t enforce this—**discipline** does.

```python
# multi_file_users_router.py — conceptual piece
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
def list_users() -> list[str]:
    return ["alice", "bob"]
```

```python
# multi_file_main.py — wires routers together
from fastapi import FastAPI

from multi_file_users_router import router as users_router

app = FastAPI()
app.include_router(users_router)
```

**Key Points (3.4.2)**

- **Multi-file** improves navigation and enables team parallelization.

**Best Practices (3.4.2)**

- Mirror **domain boundaries** in file structure.

**Common Mistakes (3.4.2)**

- **Circular imports** between routers and models—extract shared types.

---

### 3.4.3 Application Factory Pattern

#### Beginner

Instead of a global `app = FastAPI()` at import time, define:

```python
def create_app() -> FastAPI:
    app = FastAPI()
    # include routers, middleware
    return app
```

#### Intermediate

Factories help **tests** create fresh apps with **dependency overrides** and **different config** per test case. Some ASGI servers expect a **string** import path—expose `app = create_app()` at module level for Uvicorn compatibility.

#### Expert

Combine factory with **`lifespan`** for resource initialization (DB pools) and teardown. Avoid heavy work at **import** time in serverless cold starts if applicable.

```python
# application_factory.py
from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.started = True
    yield
    app.state.started = False


def create_app() -> FastAPI:
    application = FastAPI(lifespan=lifespan)

    @application.get("/factory-check")
    def factory_check() -> dict[str, bool]:
        return {"started": bool(getattr(application.state, "started", False))}

    return application


app = create_app()
```

**Key Points (3.4.3)**

- **Factory** improves **testability** and **configuration** flexibility.

**Best Practices (3.4.3)**

- Still expose a **module-level `app`** unless your deployment stack supports factory callables.

**Common Mistakes (3.4.3)**

- Creating **multiple** app instances accidentally in the same module.

---

### 3.4.4 Router Organization

#### Beginner

`APIRouter` groups routes with shared **`prefix`**, **`tags`**, and **`dependencies`**. Include with `app.include_router(items_router)`.

#### Intermediate

Nest routers: `user_router.include_router(posts_router)` for hierarchical resources (`/users/{id}/posts` patterns).

#### Expert

Centralize **auth dependencies** at router inclusion time:

```python
app.include_router(admin_router, dependencies=[Depends(require_admin)])
```

```python
# router_organization.py
from fastapi import APIRouter, FastAPI

app = FastAPI()
items = APIRouter(prefix="/items", tags=["items"])


@items.get("/")
def list_items() -> list[str]:
    return ["a"]


@items.get("/{item_id}")
def get_item(item_id: int) -> dict[str, int]:
    return {"item_id": item_id}


app.include_router(items)
```

**Key Points (3.4.4)**

- **Routers** are the primary scaling tool for **URL** and **concern** organization.

**Best Practices (3.4.4)**

- Keep **router modules** focused; avoid dozens of unrelated endpoints per file.

**Common Mistakes (3.4.4)**

- Duplicating **`prefix`** on both `APIRouter` and `@router.get` paths incorrectly.

---

### 3.4.5 Project Layout

#### Beginner

A simple layout:

```
project/
  main.py
  requirements.txt
```

#### Intermediate

Scalable layout:

```
app/
  __init__.py
  main.py        # creates app, includes routers
  api/
    __init__.py
    routes/
      users.py
      items.py
  core/
    config.py
  models/
    schemas.py
```

#### Expert

Monorepos may place FastAPI under **`services/api`** with shared libraries in **`packages/`**. Docker build contexts should copy **only** needed files to reduce image size and rebuild churn.

```
# tree is documentation-only; create files as your project grows
```

**Key Points (3.4.5)**

- **Layout** communicates architecture—optimize for **reader** clarity.

**Best Practices (3.4.5)**

- Co-locate **tests** (`tests/`) mirroring package paths.

**Common Mistakes (3.4.5)**

- Mixing **virtualenv** artifacts and source in the same folder without `.gitignore`.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points (Chapter Summary)

- A FastAPI app is **`FastAPI()` + path operations**, run by **Uvicorn**.
- **HTTP methods** and **status codes** should reflect REST semantics.
- **`/docs`**, **`/redoc`**, **`/openapi.json`** document and exercise the API.
- **Structure** evolves from **single file** → **routers** → **packages** → **factories**.

### Best Practices (Chapter Summary)

- Annotate **inputs/outputs**; use **`response_model`** for safety.
- Organize **routers** early to avoid painful file splits later.
- Add **automated tests** alongside manual Swagger checks.

### Common Mistakes (Chapter Summary)

- **Blocking async** handlers; **GET** mutations; **leaky** internal fields in responses.
- **Wrong module paths** for Uvicorn after refactors.

---

## Appendix: Full Starter Examples

### Example 1 — Minimal JSON API

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "minimal"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

### Example 2 — CRUD-ish in-memory store (learning only)

```python
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException

app = FastAPI()


class Product(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)


DB: dict[int, Product] = {}
SEQ = 1


@app.post("/products", response_model=Product, status_code=201)
def create_product(p: Product) -> Product:
    global SEQ
    DB[SEQ] = p
    SEQ += 1
    return p


@app.get("/products/{product_id}", response_model=Product)
def read_product(product_id: int) -> Product:
    if product_id not in DB:
        raise HTTPException(status_code=404, detail="Not found")
    return DB[product_id]
```

### Example 3 — Tests with TestClient (install httpx)

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/add")
def add(x: int, y: int) -> dict[str, int]:
    return {"sum": x + y}


client = TestClient(app)


def test_add() -> None:
    r = client.get("/add", params={"x": 2, "y": 3})
    assert r.status_code == 200
    assert r.json() == {"sum": 5}
```

### Example 4 — Package entrypoint pattern

```python
# app/main_package_example.py — run: uvicorn app.main_package_example:app
from fastapi import FastAPI

app = FastAPI(title="Packaged App")


@app.get("/hello")
def hello() -> dict[str, str]:
    return {"hello": "package"}
```

### Appendix Key Points

- Replace **in-memory** stores with real databases before production.

### Appendix Best Practices

- Run **`pytest`** on Example 3-style tests in CI.

### Appendix Common Mistakes

- Using **`TestClient` with async apps** without understanding event loop nuances—consult current FastAPI testing docs for async patterns.

---

## Quick Reference Card

| Task | Command / Pattern |
|------|-------------------|
| Run dev server | `uvicorn main:app --reload` |
| Open interactive docs | `GET /docs` |
| Open alternative docs | `GET /redoc` |
| Download schema | `GET /openapi.json` |
| Declare GET route | `@app.get("/path")` |
| Set status code | `@app.post(..., status_code=201)` |
| Group routes | `APIRouter` + `include_router` |

---

*End of First FastAPI Application notes (Topic 3).*
