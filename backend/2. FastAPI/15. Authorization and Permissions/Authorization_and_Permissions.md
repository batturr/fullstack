# Authorization and Permissions

## 📑 Table of Contents

- [15.1 Authorization Basics](#151-authorization-basics)
  - [15.1.1 Access Control](#1511-access-control)
  - [15.1.2 Roles and Permissions](#1512-roles-and-permissions)
  - [15.1.3 Role-Based Access Control (RBAC)](#1513-role-based-access-control-rbac)
  - [15.1.4 Attribute-Based Access Control (ABAC)](#1514-attribute-based-access-control-abac)
  - [15.1.5 Permission Models](#1515-permission-models)
- [15.2 Scopes](#152-scopes)
  - [15.2.1 OAuth2 Scopes](#1521-oauth2-scopes)
  - [15.2.2 Scope Declaration](#1522-scope-declaration)
  - [15.2.3 Scope Validation](#1523-scope-validation)
  - [15.2.4 Multiple Scopes](#1524-multiple-scopes)
  - [15.2.5 Scope Hierarchy](#1525-scope-hierarchy)
- [15.3 Permission Checking](#153-permission-checking)
  - [15.3.1 Current User Access](#1531-current-user-access)
  - [15.3.2 Role Checking](#1532-role-checking)
  - [15.3.3 Permission Checking](#1533-permission-checking)
  - [15.3.4 Resource-Level Authorization](#1534-resource-level-authorization)
  - [15.3.5 Action-Based Authorization](#1535-action-based-authorization)
- [15.4 Authorization Patterns](#154-authorization-patterns)
  - [15.4.1 Decorator-Based Authorization](#1541-decorator-based-authorization)
  - [15.4.2 Dependency-Based Authorization](#1542-dependency-based-authorization)
  - [15.4.3 Middleware-Based Authorization](#1543-middleware-based-authorization)
  - [15.4.4 Context-Based Authorization](#1544-context-based-authorization)
  - [15.4.5 Policy-Based Authorization](#1545-policy-based-authorization)
- [15.5 Advanced Authorization](#155-advanced-authorization)
  - [15.5.1 Object-Level Permissions](#1551-object-level-permissions)
  - [15.5.2 Field-Level Permissions](#1552-field-level-permissions)
  - [15.5.3 Time-Based Permissions](#1553-time-based-permissions)
  - [15.5.4 Location-Based Permissions](#1554-location-based-permissions)
  - [15.5.5 Dynamic Permissions](#1555-dynamic-permissions)
- [15.6 Best Practices](#156-best-practices)
  - [15.6.1 Principle of Least Privilege](#1561-principle-of-least-privilege)
  - [15.6.2 Permission Inheritance](#1562-permission-inheritance)
  - [15.6.3 Authorization Caching](#1563-authorization-caching)
  - [15.6.4 Audit Logging](#1564-audit-logging)
  - [15.6.5 Permission Documentation](#1565-permission-documentation)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 15.1 Authorization Basics

Authorization answers **who may do what** after authentication establishes **who** the caller is. In FastAPI, you typically combine **dependencies** with **domain rules** so every endpoint enforces consistent access control.

### 15.1.1 Access Control

#### Beginner

**Access control** means allowing or denying an operation based on identity, roles, or policies. A minimal pattern is: authenticate → load user → check a boolean or role before running the handler.

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def fake_decode(token: str) -> dict:
    if token != "alice-token":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {"sub": "alice", "is_admin": False}


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return fake_decode(token)


@app.get("/reports")
def reports(user: dict = Depends(get_current_user)) -> dict[str, str]:
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")
    return {"report": "summary"}
```

#### Intermediate

Separate **authentication** (401) from **authorization** (403). Use **dependencies** that raise `HTTPException(403)` only after you know **who** the user is. For APIs, return **problem details** consistently (detail codes, trace IDs).

#### Expert

Model access control as **decision points**: subject, action, resource, context. Consider **central policy engines** (OPA, Cedar, IAM) for multi-service systems; FastAPI remains the **enforcement point** at the edge, calling a policy service synchronously or via sidecar.

**Key Points (15.1.1)**

- Authentication proves identity; authorization decides **allowed operations**.
- Use **403** when identity is known but access is denied; **401** when identity is missing or invalid.
- Keep checks **close** to the handler or in **reusable dependencies**.

**Best Practices (15.1.1)**

- Name dependencies clearly: `require_admin`, `require_scope`, `load_owned_document`.
- Log **deny** decisions with **non-sensitive** context for security monitoring.

**Common Mistakes (15.1.1)**

- Returning **401** for “wrong role” confuses clients and breaks caching semantics.
- Duplicating the same `if not admin` logic across dozens of routes without shared dependencies.

---

### 15.1.2 Roles and Permissions

#### Beginner

A **role** bundles permissions (for example `editor` can `post:write`). Users receive roles; endpoints require roles or specific permissions.

```python
from enum import Enum

from fastapi import Depends, FastAPI, HTTPException, status


class Role(str, Enum):
    reader = "reader"
    editor = "editor"


ROLES: dict[str, set[Role]] = {
    "alice": {Role.reader},
    "bob": {Role.reader, Role.editor},
}


def require_role(*allowed: Role):
    def checker(user_id: str = "alice") -> str:  # replace with real auth
        roles = ROLES.get(user_id, set())
        if not roles.intersection(set(allowed)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        return user_id

    return checker


app = FastAPI()


@app.post("/articles")
def create_article(_: str = Depends(require_role(Role.editor))) -> dict[str, str]:
    return {"status": "created"}
```

#### Intermediate

Prefer **permission strings** (`articles:create`) over raw role checks inside business logic when roles become numerous; map roles → permissions in one place to avoid **role explosion**.

#### Expert

Implement **role hierarchies** and **constraints** (SoD): e.g. a user cannot both **approve** and **pay** the same invoice. Express as separate permissions and **transactional** checks at the domain layer.

**Key Points (15.1.2)**

- Roles are **coarse** shortcuts; permissions are **fine-grained** capabilities.
- Centralize the **role → permission** matrix for maintainability.

**Best Practices (15.1.2)**

- Store roles in **JWT claims** only when they change infrequently and token revocation is handled.
- Version permission names when doing breaking API changes.

**Common Mistakes (15.1.2)**

- Hardcoding role names as magic strings across the codebase.
- Granting **admin** for convenience instead of least-privilege permissions.

---

### 15.1.3 Role-Based Access Control (RBAC)

#### Beginner

**RBAC** assigns users to roles; roles grant permissions. FastAPI enforces RBAC by dependencies that inspect the current user’s roles.

```python
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()


def require_roles(*names: str):
    def dep(user: dict = Depends(lambda: {"roles": ["billing"]})) -> dict:
        if not set(names).intersection(user["roles"]):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        return user

    return dep


@router.get("/invoices")
def list_invoices(user: dict = Depends(require_roles("billing", "admin"))) -> dict:
    return {"user": user["roles"], "invoices": []}
```

#### Intermediate

Add **role assignment** workflows and **auditing** in the admin API. For multi-tenant apps, scope roles per **tenant** to prevent cross-tenant privilege leaks.

#### Expert

Use **NIST RBAC** concepts: flat, hierarchical, constrained. Combine with **attribute** checks (tenant_id, data classification) when pure RBAC is too blunt.

**Key Points (15.1.3)**

- RBAC scales well for **internal** tools with stable job functions.
- Combine RBAC with **resource ownership** for user-generated content.

**Best Practices (15.1.3)**

- Keep role sets **small** and meaningful; avoid hundreds of micro-roles.
- Test authorization with **matrix tests** (user × endpoint).

**Common Mistakes (15.1.3)**

- Using RBAC alone when **per-row** access is required (documents owned by users).
- Caching role checks incorrectly across **tenant** boundaries.

---

### 15.1.4 Attribute-Based Access Control (ABAC)

#### Beginner

**ABAC** decides access using **attributes** (user department, resource owner, time of day). You evaluate predicates against a context object.

```python
from dataclasses import dataclass

from fastapi import Depends, FastAPI, HTTPException, status

app = FastAPI()


@dataclass
class Ctx:
    user_department: str
    doc_department: str


def abac_read(ctx: Ctx) -> None:
    if ctx.user_department != ctx.doc_department:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)


@app.get("/docs/{dept}")
def read_doc(dept: str, user: dict = Depends(lambda: {"dept": "eng"})) -> dict:
    abac_read(Ctx(user_department=user["dept"], doc_department=dept))
    return {"dept": dept}
```

#### Intermediate

Structure context as **typed models** (Pydantic) and unit-test policies. Consider **Rego** or **CEL** for complex rules maintained by security teams.

#### Expert

Watch **performance**: ABAC can explode into N queries per request. **Materialize** decisions, **index** attributes, or use **decision caching** with careful invalidation.

**Key Points (15.1.4)**

- ABAC is flexible but needs **disciplined** policy language and tests.
- Great for **regulated** environments with contextual rules.

**Best Practices (15.1.4)**

- Document attribute **sources of truth** (IdP vs local DB).
- Avoid embedding **PII** in logs when evaluating ABAC.

**Common Mistakes (15.1.4)**

- Implementing ABAC as nested `if` spaghetti without tests.
- Confusing **default allow** vs **default deny** in policy composition.

---

### 15.1.5 Permission Models

#### Beginner

Common models: **ACL** (per-resource list), **RBAC**, **ABAC**, **ReBAC** (relationship-based like Google Zanzibar). Pick based on product complexity.

```python
# Tiny ACL-style check: resource has allowed user ids
def can_edit(doc: dict, user_id: str) -> bool:
    return user_id in doc["editors"]


from fastapi import FastAPI

app = FastAPI()


@app.put("/docs/{doc_id}")
def update_doc(doc_id: str, user_id: str = "u1") -> dict[str, str]:
    doc = {"id": doc_id, "editors": ["u1", "u2"]}
    if not can_edit(doc, user_id):
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {"updated": doc_id}
```

#### Intermediate

Expose a single internal API like `authorize(subject, action, resource)` and implement backends per model. FastAPI dependencies call that API.

#### Expert

For **graph** relationships (orgs, groups, shares), use a **relationship store** or **Zanzibar-style** service; edge services should not reimplement graph walks naïvely.

**Key Points (15.1.5)**

- Start simple (RBAC + ownership); evolve toward ABAC/ReBAC as needed.
- **Model** choice affects auditability and performance.

**Best Practices (15.1.5)**

- Align permission vocabulary with **product** nouns and verbs.
- Run **periodic access reviews** for enterprise customers.

**Common Mistakes (15.1.5)**

- Mixing multiple models **ad hoc** without boundaries.
- Storing ACLs in JWTs without size and revocation plans.

---

## 15.2 Scopes

OAuth2 **scopes** limit what a token can do. FastAPI can **declare** required scopes on routes and **validate** tokens against them.

### 15.2.1 OAuth2 Scopes

#### Beginner

Scopes are **space-delimited** strings in tokens or introspection results, e.g. `items:read items:write`. They express **authorization** at token mint time.

```python
from fastapi import Depends, FastAPI
from fastapi.security import SecurityScopes, OAuth2PasswordBearer

app = FastAPI()
oauth2 = OAuth2PasswordBearer(tokenUrl="token", scopes={"items:read": "Read items"})


def parse_scopes(token: str) -> list[str]:
    return ["items:read"] if token.endswith("-ro") else ["items:read", "items:write"]


async def get_scopes(security_scopes: SecurityScopes, token: str = Depends(oauth2)) -> list[str]:
    scopes = parse_scopes(token)
    for s in security_scopes.scopes:
        if s not in scopes:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient scope")
    return scopes


@app.get("/items", dependencies=[Depends(oauth2)])
def items(_: list[str] = Depends(get_scopes)) -> dict:
    return {"items": []}
```

#### Intermediate

Use **SecurityScopes** so OpenAPI shows required scopes. Keep scope names **stable** and **namespaced** (`service:resource:action`).

#### Expert

Implement **scope downgrade**: refresh tokens cannot mint broader scopes than consent; introspection endpoints return canonical scope lists for RS validation.

**Key Points (15.2.1)**

- Scopes are a **contract** between authorization server and resource server.
- FastAPI integrates scopes via **`SecurityScopes`** and dependencies.

**Best Practices (15.2.1)**

- Document scopes in **OpenAPI** descriptions for client teams.
- Avoid encoding **dynamic** IDs inside scope strings.

**Common Mistakes (15.2.1)**

- Validating scopes only in the client (must validate on **server**).
- Using scopes for **fine-grained** row ACLs (wrong tool).

---

### 15.2.2 Scope Declaration

#### Beginner

Declare scopes on **`OAuth2PasswordBearer`** or **`OAuth2AuthorizationCodeBearer`** via the `scopes=` dict so Swagger UI can display them.

```python
from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()

oauth2 = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "users:read": "Read users",
        "users:write": "Create or update users",
    },
)
```

#### Intermediate

Align OpenAPI **securitySchemes** with your IdP’s **scope registry**. For third-party clients, publish a **machine-readable** scope catalog.

#### Expert

Support **optional** vs **required** scopes per route using layered dependencies and **AND/OR** composition documented in your API guidelines.

**Key Points (15.2.2)**

- Declaration improves **developer experience** and reduces integration bugs.
- OpenAPI is not law; **runtime** must still enforce.

**Best Practices (15.2.2)**

- Use consistent **naming** (`domain:verb`).
- Review scope additions in **security review**.

**Common Mistakes (15.2.2)**

- Declaring scopes in docs but forgetting **enforcement** code paths.
- Typos between **token** scope strings and **route** requirements.

---

### 15.2.3 Scope Validation

#### Beginner

Parse the token, extract **scope** claim (or introspect), then verify every required scope is present.

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

app = FastAPI()
oauth2 = OAuth2PasswordBearer(tokenUrl="token")


def token_scopes(token: str) -> set[str]:
    return set(token.split(":")[-1].split(","))  # demo only


async def require_scopes(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2),
) -> set[str]:
    have = token_scopes(token)
    need = set(security_scopes.scopes)
    if not need.issubset(have):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "insufficient_scope", "required": sorted(need)},
        )
    return have
```

#### Intermediate

Handle **JWT** `scope` as string or list per provider quirks. Normalize early in one function.

#### Expert

Implement **audience** (`aud`) and **issuer** (`iss`) checks alongside scopes to prevent **token misuse** across services.

**Key Points (15.2.3)**

- Validate scopes on **every** protected resource server, not only at login.
- Return **RFC 6750**-style errors where appropriate.

**Best Practices (15.2.3)**

- Unit-test token variants: missing scope, extra scope, expired, wrong `aud`.
- Centralize parsing in **`get_security_context()`**.

**Common Mistakes (15.2.3)**

- String **substring** checks for scopes (collision-prone).
- Ignoring **scope** on cached user objects after role changes.

---

### 15.2.4 Multiple Scopes

#### Beginner

A route may require **several** scopes (all required). Compose with `SecurityScopes` or explicit set logic.

```python
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

app = FastAPI()
oauth2 = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={"items:write": "Write items", "items:delete": "Delete items"},
)


async def require_all_scopes(
    security_scopes: SecurityScopes,
    token: Annotated[str, Depends(oauth2)],
) -> None:
    # Demo: token is pipe-separated scope list, e.g. "items:write|items:delete|profile:read"
    granted = set(token.split("|")) if token else set()
    if not set(security_scopes.scopes).issubset(granted):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient scope")


@app.delete(
    "/items/{item_id}",
    dependencies=[
        Security(require_all_scopes, scopes=["items:write", "items:delete"]),
    ],
)
def delete_item(item_id: str) -> dict[str, str]:
    return {"deleted": item_id}
```

#### Intermediate

For **OR** semantics (`read` OR `admin`), implement explicit policy functions rather than overloading OAuth2 scope lists.

#### Expert

Model **scope combinations** in a policy table; generate FastAPI dependencies or OpenAPI metadata from that table to avoid drift.

**Key Points (15.2.4)**

- OAuth2 scopes are often **conjunctive** per route requirement; OR logic needs **custom** code.
- Document whether endpoints need **all** or **any** of listed scopes.

**Best Practices (15.2.4)**

- Prefer **fewer** composite scopes if clients struggle (`items:admin`).
- Instrument **403** rates per scope to detect misconfigured clients.

**Common Mistakes (15.2.4)**

- Assuming Swagger’s display implies **OR** when your code requires **AND**.
- Exploding scope combinations causing **token bloat**.

---

### 15.2.5 Scope Hierarchy

#### Beginner

Sometimes `data:admin` **implies** `data:read`. Encode implications in a small resolver.

```python
IMPLIED = {"data:admin": {"data:read", "data:write"}}


def expand_scopes(granted: set[str]) -> set[str]:
    out = set(granted)
    for s in list(out):
        out |= IMPLIED.get(s, set())
    return out


from fastapi import FastAPI, HTTPException, status

app = FastAPI()


@app.get("/data")
def read_data(token_scopes: set[str] = {"data:admin"}) -> dict:
    effective = expand_scopes(token_scopes)
    if "data:read" not in effective:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {"rows": 1}
```

#### Intermediate

Prefer **hierarchical scope names** (`reports.read`, `reports.write`) and parse as trees; or avoid hierarchy and use **flat** explicit scopes for clarity.

#### Expert

If using hierarchy, define **canonicalization** rules and **conflict resolution** when IdP sends redundant scopes; ensure **deterministic** expansion for caching keys.

**Key Points (15.2.5)**

- Hierarchies reduce **client** complexity but increase **server** logic.
- Document implied scopes in your **developer portal**.

**Best Practices (15.2.5)**

- Keep expansion **idempotent** and **finite** (no cycles).

**Common Mistakes (15.2.5)**

- Double-counting permissions after expansion in **billing** or **audit**.

---

## 15.3 Permission Checking

Translate business rules into **FastAPI dependencies** and **domain services** that operate on the current user and loaded resources.

### 15.3.1 Current User Access

#### Beginner

Load the **current user** once per request via `Depends`, then pass to services that enforce rules.

```python
from fastapi import Depends, FastAPI

app = FastAPI()


def get_current_user() -> dict:
    return {"id": "u1", "tenant": "t9"}


@app.get("/me")
def me(user: dict = Depends(get_current_user)) -> dict:
    return user
```

#### Intermediate

Use **typed** user models (`User` pydantic model) and avoid leaking **password hashes** into handlers.

#### Expert

Attach **authorization context** (correlation id, IP risk score) alongside user for ABAC; propagate via **context vars** carefully in async code.

**Key Points (15.3.1)**

- `Depends` makes user loading **composable** and testable.
- Keep user objects **minimal** in hot paths.

**Best Practices (15.3.1)**

- Short-circuit **anonymous** routes without auth dependencies.
- Memoize per-request user fetches (dependency cache).

**Common Mistakes (15.3.1)**

- Fetching user **again** inside every helper instead of reusing dependency output.
- Storing **mutable** global user state.

---

### 15.3.2 Role Checking

#### Beginner

Centralize `assert_role(user, "admin")` helpers used by dependencies.

```python
from fastapi import Depends, FastAPI, HTTPException, status

app = FastAPI()


def require_admin(user: dict = Depends(lambda: {"roles": ["user"]})) -> dict:
    if "admin" not in user["roles"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user


@app.post("/admin/tasks")
def run_task(_: dict = Depends(require_admin)) -> dict[str, str]:
    return {"status": "queued"}
```

#### Intermediate

Support **implicit roles** from group membership synced from IdP; reconcile on login webhook.

#### Expert

Implement **break-glass** roles with **time-bound** elevation and **mandatory** logging.

**Key Points (15.3.2)**

- Role checks should be **one-liners** at the route via dependencies.
- Prefer **403** with structured error bodies for programmatic clients.

**Best Practices (15.3.2)**

- Test **role sync** failures and stale token scenarios.

**Common Mistakes (15.3.2)**

- Checking roles **only** in the UI, not the API.

---

### 15.3.3 Permission Checking

#### Beginner

Check named permissions resolved from roles before sensitive operations.

```python
PERMS = {"alice": {"doc:read", "doc:delete"}}


def require_perm(name: str):
    def inner(user_id: str = "alice") -> str:
        if name not in PERMS.get(user_id, set()):
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        return user_id

    return inner


from fastapi import Depends, FastAPI

app = FastAPI()


@app.delete("/doc/{doc_id}")
def delete(doc_id: str, _: str = Depends(require_perm("doc:delete"))) -> dict[str, str]:
    return {"deleted": doc_id}
```

#### Intermediate

Cache permission sets **per user** with TTL; invalidate on **role change** events.

#### Expert

Use **partial evaluation** for policy engines: compile rules when configuration changes, evaluate per request.

**Key Points (15.3.3)**

- Permissions enable **finer** control than roles alone.
- Keep permission strings in a **single module** or database table.

**Best Practices (15.3.3)**

- Add **integration tests** that assert permission matrix coverage.

**Common Mistakes (15.3.3)**

- Duplicating permission logic between **GraphQL** and **REST** layers inconsistently.

---

### 15.3.4 Resource-Level Authorization

#### Beginner

After loading a row from DB, verify **ownership** or **share** before returning or mutating.

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()


@app.get("/docs/{doc_id}")
def get_doc(doc_id: str, user_id: str = "u2") -> dict:
    row = {"id": "d1", "owner": "u1"}
    if row["id"] != doc_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if row["owner"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return row
```

#### Intermediate

Use **404 vs 403** consistently: some teams prefer **404** for non-owned IDs to avoid **enumeration**.

#### Expert

Push filters into **SQL** (`WHERE tenant_id = :tid`) to avoid **IDOR** at scale; never load-then-check alone for large tables without indexes.

**Key Points (15.3.4)**

- Resource-level auth prevents **horizontal privilege escalation**.
- Database **filters** are the strongest enforcement.

**Best Practices (15.3.4)**

- Use **UUIDs** or non-guessable IDs as defense in depth.
- Log **cross-tenant** access attempts.

**Common Mistakes (15.3.4)**

- Checking ownership **after** serializing sensitive fields into logs.

---

### 15.3.5 Action-Based Authorization

#### Beginner

Name actions (`approve`, `archive`) and map routes to actions for auditing.

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()
ALLOWED = {("u1", "approve"): True}


@app.post("/orders/{oid}/approve")
def approve(oid: str, user_id: str = "u1") -> dict[str, str]:
    if not ALLOWED.get((user_id, "approve")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {"order": oid, "state": "approved"}
```

#### Intermediate

Attach **action** to observability spans; include **resource type** and **id hash** in audit logs.

#### Expert

Implement **command/query** separation: commands carry explicit **authorization** metadata validated in application services.

**Key Points (15.3.5)**

- Action-based models align with **event sourcing** and **audit** requirements.
- Helps product teams reason about **who can click what**.

**Best Practices (15.3.5)**

- Reuse action vocabulary in **frontend** feature flags and **backend** checks.

**Common Mistakes (15.3.5)**

- Using different **verbs** for the same operation across microservices.

---

## 15.4 Authorization Patterns

### 15.4.1 Decorator-Based Authorization

#### Beginner

Python decorators can wrap handlers, but FastAPI prefers **dependencies** because they integrate with **OpenAPI** and **dependency injection**.

```python
from collections.abc import Callable
from typing import Any

from fastapi import FastAPI, HTTPException, status

app = FastAPI()


def admin_only(fn: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        user = kwargs.get("user") or (args[0] if args else None)
        if getattr(user, "is_admin", False) is not True:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        return fn(*args, **kwargs)

    return wrapper


class User:
    is_admin = True


@app.get("/admin")
@admin_only
def panel(user: User = User()) -> dict[str, bool]:
    return {"ok": True}
```

#### Intermediate

Decorators often **break** signature introspection unless using `functools.wraps`; prefer `Depends` for predictable injection.

#### Expert

If you must decorate, generate **wrappers** that preserve `__signature__` for FastAPI 0.115+ compatibility and testing.

**Key Points (15.4.1)**

- Decorators are **less idiomatic** than dependencies in FastAPI.
- Useful for **cross-framework** shared libraries.

**Best Practices (15.4.1)**

- Combine decorators with **dependencies**, not instead of them, when possible.

**Common Mistakes (15.4.1)**

- Assuming decorator order with **multiple** decorators is always correct.

---

### 15.4.2 Dependency-Based Authorization

#### Beginner

This is the **recommended** pattern: reusable `Depends` callables that raise `HTTPException` on failure.

```python
from fastapi import Depends, FastAPI, HTTPException, status

app = FastAPI()


def get_user() -> dict:
    return {"id": "1", "roles": ["member"]}


def require_role(role: str):
    def checker(user: dict = Depends(get_user)) -> dict:
        if role not in user["roles"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        return user

    return checker


@app.get("/team")
def team(_: dict = Depends(require_role("member"))) -> dict[str, str]:
    return {"team": "acme"}
```

#### Intermediate

Nest dependencies: `get_db` → `get_repo` → `get_resource` → `require_owner`.

#### Expert

Use **`yield`** dependencies for **request-scoped** transactions that rollback on authorization failure after partial writes (careful ordering).

**Key Points (15.4.2)**

- Dependency graphs are **explicit** and **testable**.
- Compose **small** dependencies rather than monolith functions.

**Best Practices (15.4.2)**

- Type-annotate dependency callables for IDE support.
- Use **`Annotated`** aliases (Python 3.9+) for reusable dependency types.

**Common Mistakes (15.4.2)**

- Side effects in dependencies that should be **pure** checks.

---

### 15.4.3 Middleware-Based Authorization

#### Beginner

**Middleware** runs for many routes; good for coarse rules (IP allowlists, require auth header presence), poor for **resource-specific** rules.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from fastapi import FastAPI

app = FastAPI()


class RequireAuthHeader(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/public"):
            return await call_next(request)
        if "authorization" not in request.headers:
            return JSONResponse({"detail": "missing auth"}, status_code=401)
        return await call_next(request)


app.add_middleware(RequireAuthHeader)
```

#### Intermediate

Middleware cannot easily access **path params** without parsing; prefer dependencies for route-aware authz.

#### Expert

Use middleware for **mTLS** client cert extraction into request state, then let dependencies interpret **cert** → **user** mapping.

**Key Points (15.4.3)**

- Middleware = **broad** gates; dependencies = **fine** gates.
- Order matters: CORS, HTTPS redirect, auth extraction.

**Best Practices (15.4.3)**

- Keep middleware **fast**; offload heavy policy to async tasks only when safe.

**Common Mistakes (15.4.3)**

- Implementing **full RBAC** in middleware (hard to test and evolve).

---

### 15.4.4 Context-Based Authorization

#### Beginner

Pass a **context** object (tenant, locale, device trust) into authorization functions.

```python
from dataclasses import dataclass

from fastapi import Depends, FastAPI, HTTPException, status

app = FastAPI()


@dataclass
class AuthzContext:
    tenant_id: str
    ip_country: str


def get_ctx() -> AuthzContext:
    return AuthzContext(tenant_id="t1", ip_country="US")


def assert_export_allowed(ctx: AuthzContext) -> None:
    if ctx.ip_country not in {"US", "CA"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)


@app.get("/export")
def export(_: None = Depends(lambda: assert_export_allowed(get_ctx()))) -> dict[str, str]:
    return {"file": "report.csv"}
```

#### Intermediate

Store context in **`contextvars`** for async call chains; reset on request teardown.

#### Expert

Propagate **W3C trace context** alongside authz context for **distributed** denials.

**Key Points (15.4.4)**

- Context carries **environmental** attributes beyond user identity.
- Must be **request-scoped**, not global.

**Best Practices (15.4.4)**

- Validate context **early** (CDN headers, mTLS) before expensive DB work.

**Common Mistakes (15.4.4)**

- **Leaking** context across concurrent async tasks via shared mutable objects.

---

### 15.4.5 Policy-Based Authorization

#### Beginner

Encode rules as data or DSL; evaluate with one `allows(subject, action, resource)` entry point.

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

POLICY = {
    ("role:editor", "update", "article"): True,
}


def allows(role: str, action: str, kind: str) -> bool:
    return POLICY.get((role, action, kind), False)


@app.put("/articles/{aid}")
def update(aid: str, role: str = "role:viewer") -> dict[str, str]:
    if not allows(role, "update", "article"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {"id": aid}
```

#### Intermediate

Externalize policies to **JSON/YAML** loaded at startup with hot reload in dev.

#### Expert

Integrate **OPA** sidecar: FastAPI posts partial input JSON, receives allow/deny with **latency SLOs**.

**Key Points (15.4.5)**

- Policies **decouple** product code from security rule changes.
- Enables **security team** ownership of rules.

**Best Practices (15.4.5)**

- Version policies; keep **rollback** paths.
- Test policies with **table-driven** cases.

**Common Mistakes (15.4.5)**

- **Split-brain** when edge policy and DB constraints disagree.

---

## 15.5 Advanced Authorization

### 15.5.1 Object-Level Permissions

#### Beginner

Attach ACEs to each object (owner, editors, viewers) and evaluate on access.

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()


def can_view(obj: dict, user: str) -> bool:
    return user in obj["viewers"] or user == obj["owner"]


@app.get("/files/{fid}")
def get_file(fid: str, user: str = "alice") -> dict:
    obj = {"id": fid, "owner": "bob", "viewers": ["alice"]}
    if not can_view(obj, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return obj
```

#### Intermediate

Normalize ACL tables in SQL; **join** on `(resource_id, principal_id, perm)`.

#### Expert

Consider **Zanzibar**-style tuples: `document:123#viewer@user:alice` for scalable relationship checks.

**Key Points (15.5.1)**

- Object-level permissions are essential for **collaboration** features.
- Prefer **normalized** storage over JSON blobs for queryability.

**Best Practices (15.5.1)**

- Batch ACL checks when listing objects (`WHERE id IN (...)` with permissions CTE).

**Common Mistakes (15.5.1)**

- Returning **403** for some items and **omitting** others inconsistently in lists (UI leaks).

---

### 15.5.2 Field-Level Permissions

#### Beginner

Strip or mask fields in **response models** based on caller permissions.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class UserOut(BaseModel):
    name: str
    email: str | None = None


@app.get("/users/{uid}", response_model=UserOut)
def user(uid: str, admin: bool = False) -> UserOut:
    base = UserOut(name="Ada", email="ada@example.com")
    if not admin:
        return base.model_copy(update={"email": None})
    return base
```

#### Intermediate

Use **`model_serializer`** or dedicated **DTOs** per role to avoid accidental exposure in OpenAPI.

#### Expert

Enforce **write** field permissions via **Pydantic `model_validate`** with **context** and custom validators per role.

**Key Points (15.5.2)**

- Field-level rules protect **PII** and **commercial** secrets.
- **Read** and **write** field rules may differ.

**Best Practices (15.5.2)**

- Test OpenAPI schema for **sensitive** fields visibility in public docs.

**Common Mistakes (15.5.2)**

- Hiding fields in JSON but leaving them in **HTML** error pages or logs.

---

### 15.5.3 Time-Based Permissions

#### Beginner

Allow actions only in **windows** (business hours, subscription active).

```python
from datetime import UTC, datetime

from fastapi import FastAPI, HTTPException, status

app = FastAPI()


@app.post("/trades")
def trade(user: dict = {"plan": "pro", "expires": "2099-01-01"}) -> dict[str, str]:
    if datetime.now(UTC).date() > datetime.fromisoformat(user["expires"]).date():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="subscription expired")
    return {"status": "filled"}
```

#### Intermediate

Use **timezone-aware** datetimes; sync clocks with NTP on servers.

#### Expert

Combine **legal hold** flags that **override** time-based access for e-discovery workflows.

**Key Points (15.5.3)**

- Time-based rules need **consistent** clocks and **UTC** storage.
- Great for **trials** and **scheduled** maintenance modes.

**Best Practices (15.5.3)**

- Cache **now** once per request for consistent decisions.

**Common Mistakes (15.5.3)**

- Using local server time for **global** users without timezone policy.

---

### 15.5.4 Location-Based Permissions

#### Beginner

Restrict by **country**, **office IP**, or **geo-fencing** signals from headers/CDN.

```python
from fastapi import FastAPI, Header, HTTPException, status

app = FastAPI()


@app.get("/content")
def content(cf_country: str | None = Header(default=None, alias="CF-IPCountry")) -> dict[str, str]:
    if cf_country in {"XX", "YY"}:  # sanctioned / blocked regions (example)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {"stream": "ok"}
```

#### Intermediate

Treat client-supplied `X-Forwarded-*` as **untrusted** unless your proxy **strips** spoofed values.

#### Expert

Use **risk engines** (device, VPN detection) rather than crude IP rules for fraud-sensitive flows.

**Key Points (15.5.4)**

- Location rules are **fragile** (VPNs, traveling users).
- Often **compliance** driven (export controls).

**Best Practices (15.5.4)**

- Provide **support** escalation paths when false positives occur.

**Common Mistakes (15.5.4)**

- Blocking based on **easily spoofed** headers without trusted edge.

---

### 15.5.5 Dynamic Permissions

#### Beginner

Permissions computed from **live** state (feature flags, incident lockdown).

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

FLAGS = {"payments_enabled": False}


@app.post("/pay")
def pay() -> dict[str, str]:
    if not FLAGS["payments_enabled"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="payments paused")
    return {"status": "ok"}
```

#### Intermediate

Subscribe to **config service** updates; use **versioned** snapshots per request.

#### Expert

Ensure **deterministic** evaluation when flags change mid-request; consider **read-your-writes** consistency for authorization config.

**Key Points (15.5.5)**

- Dynamic permissions support **incident response** and **gradual rollouts**.
- Must be **observable** (why denied?) for operators.

**Best Practices (15.5.5)**

- Cache with **TTL** and **stale-while-revalidate** patterns carefully.

**Common Mistakes (15.5.5)**

- **Flapping** flags causing intermittent 403s without client retry guidance.

---

## 15.6 Best Practices

### 15.6.1 Principle of Least Privilege

#### Beginner

Grant the **minimum** rights needed for a task: narrow scopes, roles, and DB credentials.

```python
from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_ro = OAuth2PasswordBearer(tokenUrl="token", scopes={"items:read": "read only"})


@app.get("/items/public")
def public_items(token: str = Depends(oauth2_ro)) -> dict[str, str]:
    _ = token
    return {"note": "token only needs read scope here"}
```

#### Intermediate

Separate **service accounts** per worker with distinct DB roles (read-only replicas for reporting).

#### Expert

Apply **JIT** (just-in-time) elevation with **approval workflows** and automatic **expiration**.

**Key Points (15.6.1)**

- Least privilege reduces **blast radius** of stolen tokens and bugs.
- Applies to **humans** and **machines**.

**Best Practices (15.6.1)**

- Regularly **review** permissions with automated reports.

**Common Mistakes (15.6.1)**

- Wide **wildcard** admin roles for speed.

---

### 15.6.2 Permission Inheritance

#### Beginner

Child resources inherit parent permissions (folder → files). Implement via **path** or **foreign keys**.

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()


def folder_allows(user: str, folder_id: str) -> bool:
    return user in {"alice"}


@app.get("/folders/{fid}/files/{name}")
def file(fid: str, name: str, user: str = "alice") -> dict[str, str]:
    if not folder_allows(user, fid):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {"folder": fid, "file": name}
```

#### Intermediate

Materialize **effective permissions** tables updated by triggers or async jobs for performance.

#### Expert

Handle **override deny** (explicit deny beats inherited allow) consistently with your policy language.

**Key Points (15.6.2)**

- Inheritance simplifies **UX** but complicates **auditing**.
- Define **precedence** rules clearly.

**Best Practices (15.6.2)**

- Write **property tests** for inheritance edge cases (moved resources).

**Common Mistakes (15.6.2)**

- **Cycles** in inheritance graphs causing infinite loops.

---

### 15.6.3 Authorization Caching

#### Beginner

Cache allow/deny decisions **per request** or with short TTL **per user+resource**.

```python
from functools import lru_cache

from fastapi import FastAPI

app = FastAPI()


@lru_cache
def role_for_user(user_id: str) -> str:
    # In real apps, avoid unbounded LRU; use TTL cache instead
    return "editor"


@app.get("/cached-role/{user_id}")
def cached_role(user_id: str) -> dict[str, str]:
    return {"role": role_for_user(user_id)}
```

#### Intermediate

Invalidate caches on **role change** events via pub/sub.

#### Expert

Watch **stale authorization** after compromises: prefer **short-lived** tokens + **forced refresh** over long-lived positive caching.

**Key Points (15.6.3)**

- Caching improves latency but risks **stale** denials/allows.
- Never cache **without** identity+resource keying.

**Best Practices (15.6.3)**

- Add **cache bust** headers for security-sensitive admin UIs if applicable.

**Common Mistakes (15.6.3)**

- **Global** cache keys missing tenant id → cross-tenant leakage.

---

### 15.6.4 Audit Logging

#### Beginner

Log **who** did **what** **when** on sensitive endpoints (append-only store in serious systems).

```python
import logging

from fastapi import FastAPI, Request

app = FastAPI()
log = logging.getLogger("audit")


@app.post("/transfer")
async def transfer(request: Request, amount: int) -> dict[str, int]:
    user_id = "u1"
    log.info("transfer", extra={"user_id": user_id, "amount": amount, "path": str(request.url)})
    return {"amount": amount}
```

#### Intermediate

Ship logs to **SIEM**; include **decision** (`allow`/`deny`), **policy version**, and **correlation id**.

#### Expert

Implement **tamper-evident** logs (hash chains, WORM storage) for regulated industries.

**Key Points (15.6.4)**

- Auditing is both **security** and **compliance**.
- Avoid logging **secrets** and excessive **PII**.

**Best Practices (15.6.4)**

- Standardize **audit event schema** across services.

**Common Mistakes (15.6.4)**

- Logging only **successes**, missing **failed** attempts.

---

### 15.6.5 Permission Documentation

#### Beginner

Document each route’s required **roles/scopes** in OpenAPI **description** and internal wiki.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get(
    "/reports/sales",
    summary="Sales report",
    description="Requires scope `reports:read` or role `analyst`.",
)
def sales_report() -> dict[str, int]:
    return {"total": 123}
```

#### Intermediate

Generate **permission catalogs** from code via AST scanning or route metadata tables.

#### Expert

Publish **machine-readable** policy docs for enterprise customers (SOC2 evidence, IAM integration).

**Key Points (15.6.5)**

- Documentation reduces **integration** time and **security review** friction.
- Should match **runtime** behavior (test-enforced).

**Best Practices (15.6.5)**

- Include **examples** of error payloads for 403 cases.

**Common Mistakes (15.6.5)**

- Docs drift from code after refactors without CI checks.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- Authorization must be enforced **server-side** for every sensitive FastAPI route.
- Prefer **dependencies** over ad-hoc checks; separate **401** vs **403** semantics.
- Combine **coarse** controls (roles, scopes) with **fine** controls (resource ownership, ABAC context).
- Treat **lists** and **single-resource** reads with equal rigor to prevent IDOR.
- Advanced patterns (object/field/time/location/dynamic) are **policy** concerns—encode them clearly and test them.

### Chapter Best Practices

- Centralize vocabulary for **permissions** and **scopes**; document them in OpenAPI.
- Add **audit logs** for admin and financial operations with correlation IDs.
- Use **least privilege** for tokens, DB users, and background workers.
- For multi-tenant apps, **scope queries** by tenant in the data layer, not only in handlers.
- Review authorization in **code review** with a checklist (authn, authz, logging, errors).

### Chapter Common Mistakes

- Trusting **client-side** role claims without server validation.
- Returning **200** with empty bodies instead of **403** when unauthorized.
- Inconsistent **404 vs 403** strategies leaking resource existence.
- **Caching** user permissions without proper **tenant** and **invalidation** keys.
- Duplicating logic across **HTTP**, **WebSocket**, and **internal** RPC layers inconsistently.

---
