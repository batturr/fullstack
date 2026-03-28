# Cookies in FastAPI

## 📑 Table of Contents

- [10.1 Setting Cookies](#101-setting-cookies)
  - [10.1.1 response.set_cookie()](#1011-responseset_cookie)
  - [10.1.2 Cookie Parameters](#1012-cookie-parameters)
  - [10.1.3 Cookie Expiration](#1013-cookie-expiration)
  - [10.1.4 Cookie Domain](#1014-cookie-domain)
  - [10.1.5 Secure Cookies](#1015-secure-cookies)
- [10.2 Reading Cookies](#102-reading-cookies)
  - [10.2.1 Cookie() Function](#1021-cookie-function)
  - [10.2.2 Optional Cookies](#1022-optional-cookies)
  - [10.2.3 Required Cookies](#1023-required-cookies)
  - [10.2.4 Accessing Cookie Values](#1024-accessing-cookie-values)
  - [10.2.5 Cookie Validation](#1025-cookie-validation)
- [10.3 Cookie Security](#103-cookie-security)
  - [10.3.1 httponly Flag](#1031-httponly-flag)
  - [10.3.2 secure Flag](#1032-secure-flag)
  - [10.3.3 SameSite Policy](#1033-samesite-policy)
  - [10.3.4 Cookie Encryption](#1034-cookie-encryption)
  - [10.3.5 Best Practices](#1035-best-practices)
- [10.4 Session Management](#104-session-management)
  - [10.4.1 Session Cookies](#1041-session-cookies)
  - [10.4.2 Persistent Cookies](#1042-persistent-cookies)
  - [10.4.3 Session ID Storage](#1043-session-id-storage)
  - [10.4.4 Session Cleanup](#1044-session-cleanup)
  - [10.4.5 Session Expiration](#1045-session-expiration)
- [10.5 Advanced Cookie Usage](#105-advanced-cookie-usage)
  - [10.5.1 Multiple Cookies](#1051-multiple-cookies)
  - [10.5.2 Cookie Manipulation](#1052-cookie-manipulation)
  - [10.5.3 Cookie Deletion](#1053-cookie-deletion)
  - [10.5.4 Cookie Documentation](#1054-cookie-documentation)
  - [10.5.5 Cookie Best Practices](#1055-cookie-best-practices)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 10.1 Setting Cookies

Cookies are small **name=value** pairs the server asks the browser to store and send back on later requests. In FastAPI, you typically set them on a **`Response`** (or subclass) using **`set_cookie`**.

### 10.1.1 response.set_cookie()

#### Beginner

Call **`response.set_cookie(key, value)`** inside a path operation that injects **`Response`**. The browser stores the cookie and includes it in future requests to the same site (subject to path, domain, and security flags).

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/login")
def login(response: Response) -> dict[str, str]:
    response.set_cookie(key="user", value="alice")
    return {"status": "logged_in"}
```

#### Intermediate

**`set_cookie`** is inherited from Starlette’s **`Response`**. It sets the **`Set-Cookie`** header. You can combine **`set_cookie`** with returning a dict (FastAPI still serializes the body) because **`Response`** is the same object Starlette will send.

#### Expert

For multiple **`Set-Cookie`** headers, call **`set_cookie`** multiple times on the same response. Starlette appends cookies via **`response.raw_headers`** / cookie API. Be careful with **middleware** that wraps responses and may not forward cookie mutations unless it clones the response correctly.

**Key Points (10.1.1)**

- **`set_cookie`** is the primary API for issuing cookies in FastAPI.
- The **`Response`** parameter must be injected to mutate outgoing headers.
- Each call corresponds to one **`Set-Cookie`** header line (conceptually).

**Best Practices (10.1.1)**

- Prefer **short**, **non-sensitive** identifiers in cookies; keep secrets **server-side**.
- Set **`path`** explicitly when you scope cookies to part of your API.

**Common Mistakes (10.1.1)**

- Forgetting to inject **`Response`** and expecting cookies to appear.
- Storing **PII** or **raw tokens** in cookies without **`HttpOnly`** and **encryption** strategy.

---

### 10.1.2 Cookie Parameters

#### Beginner

Besides **`key`** and **`value`**, **`set_cookie`** accepts **`max_age`**, **`expires`**, **`path`**, **`domain`**, **`secure`**, **`httponly`**, and **`samesite`**. These control **lifetime** and **visibility**.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/prefs")
def save_prefs(theme: str, response: Response) -> dict[str, str]:
    response.set_cookie(
        key="theme",
        value=theme,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"theme": theme}
```

#### Intermediate

**`path`** defaults often matter: a cookie with **`path="/api"`** is not sent to **`/`**. **`domain`** restricts which hostnames receive the cookie; omitting it usually scopes to the **current host** only.

#### Expert

**`samesite`** accepts **`"strict"`**, **`"lax"`**, or **`"none"`** (string forms Starlette accepts). **`SameSite=None`** requires **`Secure=True`** in modern browsers. Validate against your **deployment topology** (SPA on another origin needs careful CORS + cookie rules).

**Key Points (10.1.2)**

- Parameters map closely to **RFC 6265** cookie attributes.
- Defaults differ by framework; **always verify** in browser devtools.

**Best Practices (10.1.2)**

- Document each cookie’s **purpose**, **path**, and **flags** for your frontend team.
- Use **`max_age`** (seconds) for predictable relative expiry when possible.

**Common Mistakes (10.1.2)**

- Setting **`domain=localhost`** incorrectly in dev vs prod.
- Using **`SameSite=None`** without **`secure=True`**.

---

### 10.1.3 Cookie Expiration

#### Beginner

**Session cookies** have no **`Max-Age`** or **`Expires`** and disappear when the browser closes (approximately—mobile browsers may differ). **Persistent cookies** use **`max_age`** (seconds from now) or **`expires`** (HTTP-date).

```python
from datetime import datetime, timezone

from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/remember")
def remember(response: Response) -> dict[str, bool]:
    response.set_cookie(
        key="remember_me",
        value="1",
        max_age=60 * 60 * 24 * 30,  # 30 days
        path="/",
        httponly=True,
    )
    return {"remember": True}


@app.post("/absolute-expiry")
def absolute_expiry(response: Response) -> dict[str, str]:
    response.set_cookie(
        key="promo",
        value="spring",
        expires=datetime(2026, 12, 31, 23, 59, 59, tzinfo=timezone.utc),
        path="/",
    )
    return {"ok": "true"}
```

#### Intermediate

Prefer **`max_age`** for clarity. **`expires`** is absolute and can be affected by **clock skew** on clients (less of an issue for cookie expiry than for JWT **`exp`** validation on servers).

#### Expert

**Sliding expiration** (refresh session on activity) is **not** a cookie feature alone—you renew **`max_age`** on each authenticated response or use a **server-side session store** with TTL.

**Key Points (10.1.3)**

- **`max_age=0`** can delete cookies (see deletion section too).
- Session vs persistent is a **client storage** concept tied to attributes.

**Best Practices (10.1.3)**

- Align cookie TTL with **risk tolerance** and **re-auth** policy.
- Log **session rotation** events for security monitoring.

**Common Mistakes (10.1.3)**

- Extremely long **`max_age`** on sensitive cookies.
- Assuming “browser closed” clears secrets—users suspend, not quit, apps.

---

### 10.1.4 Cookie Domain

#### Beginner

The **`domain`** attribute controls which hosts receive the cookie. If omitted, the cookie is typically a **host-only** cookie for the **current hostname**.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/sso-prep")
def sso_prep(response: Response) -> dict[str, str]:
    # Example: subdomains of example.com (requires correct DNS + HTTPS setup)
    response.set_cookie(
        key="sso_hint",
        value="corp",
        domain=".example.com",
        path="/",
        secure=True,
        httponly=True,
        samesite="lax",
    )
    return {"domain": "configured"}
```

#### Intermediate

Leading **dot** in **`.example.com`** historically indicated domain cookies; modern browsers use the **registrable domain** and **Public Suffix List**. You cannot set cookies for **other** registrable domains (e.g., **`evil.com`** from **`api.good.com`**).

#### Expert

**Cookie-less** API subdomains (`api.example.com`) vs **web** (`app.example.com`) often need **`SameSite`**, **CORS credentials**, and **`domain`** alignment. Misconfiguration causes “cookie not sent” bugs that are painful to trace.

**Key Points (10.1.4)**

- **`domain`** widens visibility—treat it as a **security knob**.
- **Host-only** cookies are **narrower** and often **safer**.

**Best Practices (10.1.4)**

- Default to **no** **`domain`** unless cross-subdomain sharing is required.
- Test with **real hostnames**, not only **`127.0.0.1`**.

**Common Mistakes (10.1.4)**

- Setting **`domain`** to a value the browser **rejects** silently.
- Expecting cookies to work across **different registrable domains** without a **gateway** or **token** flow.

---

### 10.1.5 Secure Cookies

#### Beginner

**`secure=True`** means the browser should only send the cookie over **HTTPS**. Use it in production for any sensitive cookie.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/prod-login")
def prod_login(response: Response) -> dict[str, str]:
    response.set_cookie(
        key="session_id",
        value="opaque-random-id",
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"status": "ok"}
```

#### Intermediate

In **local development** over **HTTP**, **`secure=True`** prevents the cookie from being stored or sent—often confusing during onboarding. Use **environment-based** flags.

```python
import os

from fastapi import FastAPI, Response

app = FastAPI()
USE_SECURE_COOKIES = os.getenv("ENV", "dev") == "prod"


@app.post("/login-env")
def login_env(response: Response) -> dict[str, str]:
    response.set_cookie(
        key="sid",
        value="abc",
        path="/",
        httponly=True,
        secure=USE_SECURE_COOKIES,
        samesite="lax",
    )
    return {"ok": "true"}
```

#### Expert

**TLS termination** at a load balancer must forward **`X-Forwarded-Proto`** if your app builds **URLs** or enforces **HTTPS-only** logic. Cookies are **end-to-end** with the browser; mixed content or **proxy misconfiguration** can strip **`Secure`** semantics unexpectedly.

**Key Points (10.1.5)**

- **`Secure`** protects **confidentiality on the wire** (with HTTPS).
- It does **not** encrypt** cookie values** by itself.

**Best Practices (10.1.5)**

- Combine **`Secure` + `HttpOnly` + sensible `SameSite`** for session cookies.
- Use **HSTS** at the edge to reduce **downgrade** risk.

**Common Mistakes (10.1.5)**

- Enabling **`secure`** in dev without **HTTPS**.
- Believing **`Secure`** stops **XSS**—it does not; **`HttpOnly`** helps more for theft.

---

## 10.2 Reading Cookies

FastAPI reads cookies from the incoming request using **`Cookie()`** as a dependency, similar to **`Header()`** and **`Query()`**.

### 10.2.1 Cookie() Function

#### Beginner

Import **`Cookie`** from **`fastapi`** and declare a parameter **`name: str | None = Cookie(None)`**. FastAPI extracts the cookie value from the **`Cookie`** header.

```python
from typing import Annotated

from fastapi import Cookie, FastAPI

app = FastAPI()


@app.get("/whoami")
def whoami(
    user: Annotated[str | None, Cookie()] = None,
) -> dict[str, str | None]:
    return {"user": user}
```

#### Intermediate

Use **`Annotated`** style (recommended) or default values like **`user: str = Cookie()`** for required cookies. The parameter **name** maps to the **cookie name** unless you use **`alias`**.

#### Expert

**`Cookie`** is implemented via **`Request.cookies`** parsing in Starlette. Extremely large **`Cookie`** headers can impact performance—prefer **few, small** cookies.

**Key Points (10.2.1)**

- **`Cookie()`** declares a **request cookie** dependency.
- Values arrive as **strings**; you coerce with **type hints** and validation.

**Best Practices (10.2.1)**

- Name cookies with a **clear prefix** (`app_session`, not `s`).
- Keep cookie names **stable** across API versions when possible.

**Common Mistakes (10.2.1)**

- Confusing **`Cookie`** header parameter with **`set_cookie`** response API.
- Expecting JSON automatically—cookies are **strings**.

---

### 10.2.2 Optional Cookies

#### Beginner

Make a cookie optional by giving a **default** of **`None`** or using **`Optional[str]`** with **`Cookie(None)`**.

```python
from typing import Annotated

from fastapi import Cookie, FastAPI

app = FastAPI()


@app.get("/theme")
def get_theme(
    theme: Annotated[str | None, Cookie()] = None,
) -> dict[str, str]:
    return {"theme": theme or "light"}
```

#### Intermediate

Optional cookies are ideal for **preferences**, **A/B flags**, and **first-visit** flows. Combine with **Pydantic models** for richer optional groups if needed (multiple cookies).

#### Expert

For **high-cardinality** optional state, consider **server-side sessions** keyed by one **session id** cookie instead of many optional cookies—reduces header bloat and **privacy** surface.

**Key Points (10.2.2)**

- Default **`None`** means “cookie may be absent.”
- Your handler must **branch** sensibly.

**Best Practices (10.2.2)**

- Avoid **business-critical** logic that silently treats missing cookies as **guest** without explicit checks.

**Common Mistakes (10.2.2)**

- Using **`Cookie("")`** semantics incorrectly—absent vs empty string differs by client.

---

### 10.2.3 Required Cookies

#### Beginner

Require a cookie by not providing a default: **`session_id: Annotated[str, Cookie()]`**. FastAPI returns **422** if missing (validation error), depending on configuration and type.

```python
from typing import Annotated

from fastapi import Cookie, FastAPI

app = FastAPI()


@app.get("/dashboard")
def dashboard(session_id: Annotated[str, Cookie()]) -> dict[str, str]:
    return {"session_id": session_id}
```

#### Intermediate

For **401 Unauthorized** semantics, validate the **session value** in a dependency and raise **`HTTPException`** instead of relying solely on **422** from missing parameters.

```python
from typing import Annotated

from fastapi import Cookie, Depends, FastAPI, HTTPException

app = FastAPI()


def require_session(session_id: Annotated[str | None, Cookie()] = None) -> str:
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session_id


@app.get("/secure-data")
def secure_data(sid: Annotated[str, Depends(require_session)]) -> dict[str, str]:
    return {"sid": sid}
```

#### Expert

**CSRF** defenses often require **double-submit** cookies or **synchronizer tokens**—requiring a cookie alone is **not** authentication. Design **401/403** vs **422** consistently across your API surface.

**Key Points (10.2.3)**

- **Required** cookies are a **sharp edge** for public endpoints.
- Prefer **dependency** that maps to **HTTP auth semantics**.

**Best Practices (10.2.3)**

- Use **session id** cookie + **server store** for session state.
- Rate-limit **login** and **session** endpoints.

**Common Mistakes (10.2.3)**

- Returning **422** where clients expect **401**.
- Treating “cookie present” as “user authenticated” without **server validation**.

---

### 10.2.4 Accessing Cookie Values

#### Beginner

You can also read **`request.cookies`** directly if you inject **`Request`**.

```python
from fastapi import FastAPI, Request

app = FastAPI()


@app.get("/raw")
def raw_cookies(request: Request) -> dict[str, str]:
    return dict(request.cookies)
```

#### Intermediate

**`dict(request.cookies)`** copies all cookies—useful for **debug** endpoints (guard behind **admin** auth). For normal code, prefer **`Cookie()`** for **documentation** and **validation**.

#### Expert

**Duplicate cookie names** in a raw header are ambiguous—Starlette’s parsing follows **last-wins** or **first-wins** behavior per its implementation; avoid relying on duplicates. Normalize on **one name**.

**Key Points (10.2.4)**

- **`Request.cookies`** is a **`ImmutableMultiDict`**-like mapping.
- **`Cookie()`** parameters integrate with **OpenAPI**.

**Best Practices (10.2.4)**

- Avoid **logging full cookie jars** in production.

**Common Mistakes (10.2.4)**

- Assuming cookie values are **already URL-decoded** correctly for every edge case—validate.

---

### 10.2.5 Cookie Validation

#### Beginner

Treat cookie values as **untrusted input**. Use **Pydantic** models or manual checks (length, charset) before use.

```python
from typing import Annotated

from fastapi import Cookie, FastAPI, HTTPException

app = FastAPI()


@app.get("/lang")
def lang(
    lang_cookie: Annotated[str | None, Cookie(alias="lang")] = None,
) -> dict[str, str]:
    allowed = {"en", "es", "fr"}
    if lang_cookie and lang_cookie not in allowed:
        raise HTTPException(status_code=400, detail="Invalid language")
    return {"lang": lang_cookie or "en"}
```

#### Intermediate

For **signed** cookies, verify **signature** (e.g., **itsdangerous**, **Fernet**, or framework middleware) in a dependency before trusting payload fields.

#### Expert

**Rotation** of signing keys requires **dual verification** during rollout. Cookie validation should be **constant-time** for **secrets** (compare with **`hmac.compare_digest`**).

```python
import hmac

def constant_time_eq(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode(), b.encode())
```

**Key Points (10.2.5)**

- Never **trust** cookie content without **crypto** or **server lookup**.
- Validate **format** before **DB** queries to avoid **injection** (if embedded in queries—prefer parameterized queries).

**Best Practices (10.2.5)**

- Prefer **opaque random** session ids over **JWT in cookies** unless you have a **strong reason** and **hard CSRF** story.

**Common Mistakes (10.2.5)**

- Parsing JSON from cookies without **schema** validation.
- Storing **role=admin** in a client cookie without signing.

---

## 10.3 Cookie Security

Cookies cross the **trust boundary** between browser and server. Flags and policies reduce **theft** and **forgery** risk.

### 10.3.1 httponly Flag

#### Beginner

**`httponly=True`** tells browsers not to expose the cookie to **JavaScript** via **`document.cookie`** (mitigates some **XSS** cookie theft).

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/session")
def new_session(response: Response) -> dict[str, str]:
    response.set_cookie(
        key="session_id",
        value="opaque",
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"ok": "true"}
```

#### Intermediate

**`HttpOnly`** does not block **CSRF** and does not stop **XSS** from performing **actions as the user**—it mainly protects **cookie confidentiality** from scripts.

#### Expert

Some flows need **JS-readable** tokens (often a mistake); if you must, isolate **non-HttpOnly** cookies to **least privilege** paths and short **TTL**, and still prefer **header-based** tokens for SPAs with **appropriate storage risks** documented.

**Key Points (10.3.1)**

- **`HttpOnly`** is **default-off**; set it explicitly for session cookies.
- It is **advisory**; client ecosystems vary slightly.

**Best Practices (10.3.1)**

- Combine with **CSP**, **input sanitization**, and **framework XSS** defenses.

**Common Mistakes (10.3.1)**

- Assuming **`HttpOnly`** means “safe to put secrets in cookies” without **HTTPS** and **rotation**.

---

### 10.3.2 secure Flag

#### Beginner

**`secure=True`** restricts the cookie to **HTTPS** connections. Complements **`HttpOnly`**.

#### Intermediate

With **`SameSite=None`**, **`Secure`** is **mandatory** on modern Chromium-based browsers.

#### Expert

On **internal networks**, **TLS everywhere** still matters; **secure** cookies won’t attach to **plain HTTP** fetches—ensure **health checks** don’t depend on cookies.

**Key Points (10.3.2)**

- **`Secure`** protects **on-the-wire** exposure when paired with **HTTPS**.
- Not a substitute for **payload encryption**.

**Best Practices (10.3.2)**

- Terminate TLS correctly and avoid **mixed content**.

**Common Mistakes (10.3.2)**

- Debugging locally with **`secure=True`** and wondering why cookies vanish.

---

### 10.3.3 SameSite Policy

#### Beginner

**`samesite="strict"`** blocks cross-site cookies on **navigation**. **`lax`** allows **top-level GET** navigations. **`none`** allows cross-site (with **`Secure`**).

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/csrf-friendly")
def csrf_friendly(response: Response) -> dict[str, str]:
    response.set_cookie(
        key="sid",
        value="opaque",
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"ok": "true"}
```

#### Intermediate

**CSRF** risk rises when browsers send cookies on **cross-origin POSTs**. **`Lax`** reduces many cases; **state-changing** endpoints still need **tokens** or **custom headers**.

#### Expert

**OAuth** and **embedded** flows may require **`SameSite=None`**. Pair with **PKCE**, **exact redirect URI** matching, and **token binding** strategies appropriate to your threat model.

**Key Points (10.3.3)**

- **`SameSite`** is a **default** in modern browsers—know your baseline.
- **`none`** requires **`Secure`**.

**Best Practices (10.3.3)**

- Prefer **`lax`** for typical **same-site** session cookies.
- Add **CSRF tokens** for **cookie-based** session **cross-site** POSTs.

**Common Mistakes (10.3.3)**

- Using **`none`** without understanding **third-party** cookie deprecation trends.

---

### 10.3.4 Cookie Encryption

#### Beginner

Cookies are **not encrypted** by the HTTP layer. If you store structured data in a cookie, **sign** or **encrypt** it so clients cannot forge it.

```python
from cryptography.fernet import Fernet
from fastapi import FastAPI, Response

app = FastAPI()
fernet = Fernet(Fernet.generate_key())


@app.post("/seal")
def seal(response: Response) -> dict[str, str]:
    token = fernet.encrypt(b"user_id=42").decode()
    response.set_cookie(
        key="sealed_payload",
        value=token,
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"stored": "encrypted"}
```

#### Intermediate

Prefer **opaque server-side sessions** over **large encrypted cookies** to reduce **size** and **revocation** complexity.

#### Expert

**Key management** (rotation, storage in **KMS**, environment injection) is the hard part. Avoid **homegrown crypto**; use **well-vetted** libraries and **authenticated encryption**.

**Key Points (10.3.4)**

- **Signing** proves integrity; **encryption** hides content.
- **Rotate keys** with overlap windows.

**Best Practices (10.3.4)**

- Keep **cookies small**; store bulk data server-side.

**Common Mistakes (10.3.4)**

- Encrypting without **authenticating** (vulnerable to **malleability** depending on mode—use **Fernet** or **AES-GCM** correctly).

---

### 10.3.5 Best Practices

#### Beginner

Use **`HttpOnly`**, **`Secure`**, sensible **`SameSite`**, short **TTL** for sensitive sessions, and **minimal** cookie count.

#### Intermediate

Centralize cookie policy in **settings** (pydantic-settings) and apply consistently across **login**, **refresh**, and **logout** endpoints.

#### Expert

Threat-model **XSS**, **CSRF**, **session fixation**, and **token theft**. Implement **session rotation** on privilege elevation and **logout** everywhere.

**Key Points (10.3.5)**

- Defense is **layered**—cookies are one layer only.
- **Monitor** anomalous **session** usage.

**Best Practices (10.3.5)**

- Invalidate **server sessions** on password change.
- Use **Secure, HttpOnly** session cookies with **server-side** stores for most apps.

**Common Mistakes (10.3.5)**

- Storing **JWT refresh** tokens in **`localStorage`** while claiming cookie security on unrelated endpoints.

---

## 10.4 Session Management

Sessions tie **state** to a user across requests. Cookies commonly carry **session identifiers**.

### 10.4.1 Session Cookies

#### Beginner

A **session cookie** typically has **no** **`max_age`/`expires`** and holds a **random session id** pointing to **server memory** or **Redis**.

```python
import secrets

from fastapi import FastAPI, Response

app = FastAPI()
SESSIONS: dict[str, dict] = {}


@app.post("/session/start")
def start_session(response: Response) -> dict[str, str]:
    sid = secrets.token_urlsafe(32)
    SESSIONS[sid] = {"user": "guest"}
    response.set_cookie(
        key="session_id",
        value=sid,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"session_id": sid}
```

#### Intermediate

In production, **do not** use in-process **`dict`**—use **Redis**, **database**, or managed session store for **multi-worker** consistency.

#### Expert

**Sticky sessions** at load balancers are a **band-aid**; prefer **shared session store** or **stateless** tokens with explicit **tradeoffs**.

**Key Points (10.4.1)**

- Session cookies should be **opaque** and **unguessable**.
- Session **data** belongs server-side.

**Best Practices (10.4.1)**

- Generate ids with **`secrets`**, not **`random.random()`**.

**Common Mistakes (10.4.1)**

- Using **predictable** session ids.

---

### 10.4.2 Persistent Cookies

#### Beginner

Persistent cookies survive browser restarts via **`max_age`** or **`expires`**. Useful for **“remember me”**—but higher risk.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/remember-device")
def remember_device(device_id: str, response: Response) -> dict[str, str]:
    response.set_cookie(
        key="device_id",
        value=device_id,
        max_age=60 * 60 * 24 * 365,
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"remembered": "true"}
```

#### Intermediate

Long-lived cookies should **not** equal **full auth**—use **step-up** auth for sensitive actions.

#### Expert

**Device binding** and **risk scoring** often combine **cookie**, **IP**, and **UA** signals—know **privacy** regulations implications.

**Key Points (10.4.2)**

- Persistence increases **exposure** if stolen.
- Prefer **refresh token** patterns with **rotation** for long-lived auth.

**Best Practices (10.4.2)**

- Pair persistent tokens with **server-side revocation** lists.

**Common Mistakes (10.4.2)**

- **Infinite** login with no **re-auth** on sensitive changes.

---

### 10.4.3 Session ID Storage

#### Beginner

Store **session id** in **`HttpOnly`** cookie; map **`sid -> user`** in **Redis** with **TTL**.

#### Intermediate

On login, **regenerate** session id to mitigate **session fixation** attacks.

```python
import secrets

from typing import Annotated

from fastapi import Cookie, FastAPI, HTTPException, Response

app = FastAPI()
STORE: dict[str, str] = {}


@app.post("/login")
def login(user: str, response: Response) -> dict[str, str]:
    sid = secrets.token_urlsafe(32)
    STORE[sid] = user
    response.set_cookie(
        key="session_id",
        value=sid,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"user": user}


@app.post("/logout")
def logout(
    response: Response,
    session_id: Annotated[str | None, Cookie()] = None,
) -> dict[str, str]:
    if session_id:
        STORE.pop(session_id, None)
    response.delete_cookie(key="session_id", path="/")
    return {"status": "logged_out"}
```

#### Expert

**Session tables** should index by **id**, enforce **TTL**, and optionally track **metadata** (IP, user agent) for **fraud** detection—with **GDPR** minimization.

**Key Points (10.4.3)**

- **Never** embed **PII** in the session cookie value.
- **Rotate** session ids on **privilege** change.

**Best Practices (10.4.3)**

- Use **constant-time** comparisons for **signed** tokens if applicable.

**Common Mistakes (10.4.3)**

- Logging **`session_id`** values in **access logs**.

---

### 10.4.4 Session Cleanup

#### Beginner

Delete server session records on **logout** and expire **stale** sessions with **TTL**.

#### Intermediate

Use **Redis EXPIRE** or periodic **janitor** jobs for orphaned sessions.

#### Expert

**Concurrent logout** from multiple devices may need **per-device** session rows rather than a single **global** session.

**Key Points (10.4.4)**

- Cleanup reduces **storage** cost and **attack** window.
- **TTL** should match **business** session length.

**Best Practices (10.4.4)**

- Provide **“logout all devices”** by invalidating **all** server sessions for a user.

**Common Mistakes (10.4.4)**

- Only clearing the **cookie** without deleting **server** session.

---

### 10.4.5 Session Expiration

#### Beginner

Enforce **idle timeout** and **absolute timeout** in your session store metadata.

```python
import time

from typing import Annotated

from fastapi import Cookie, Depends, FastAPI, HTTPException

app = FastAPI()
SESSIONS: dict[str, dict] = {}


def get_session(session_id: Annotated[str | None, Cookie()] = None) -> dict:
    if not session_id or session_id not in SESSIONS:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = SESSIONS[session_id]
    now = time.time()
    if now > sess["abs_expires"]:
        del SESSIONS[session_id]
        raise HTTPException(status_code=401, detail="Session expired")
    if now - sess["last_seen"] > 1800:  # 30 min idle
        del SESSIONS[session_id]
        raise HTTPException(status_code=401, detail="Idle timeout")
    sess["last_seen"] = now
    return sess


@app.get("/protected")
def protected(_: Annotated[dict, Depends(get_session)]) -> dict[str, bool]:
    return {"ok": True}
```

#### Intermediate

Sliding **idle** windows should **update last_seen** on each authenticated request (as shown).

#### Expert

**Remember-me** vs **session** should have **different TTL** and **threat** models; keep code paths separate.

**Key Points (10.4.5)**

- **Absolute** caps limit **indefinite** hijack windows.
- **Idle** caps reduce risk on **shared** computers.

**Best Practices (10.4.5)**

- Communicate **timeouts** clearly in **client UX**.

**Common Mistakes (10.4.5)**

- Only relying on **cookie expiry** without **server-side** enforcement.

---

## 10.5 Advanced Cookie Usage

### 10.5.1 Multiple Cookies

#### Beginner

Call **`set_cookie`** multiple times on the same **`Response`** to issue several cookies.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/multi")
def multi(response: Response) -> dict[str, str]:
    response.set_cookie("a", "1", path="/")
    response.set_cookie("b", "2", path="/")
    return {"cookies": "two"}
```

#### Intermediate

Order rarely matters; **names** must differ. Watch **total header size** limits.

#### Expert

Some proxies limit **header** sizes—**consolidate** state into **one** signed cookie or **server session** if you approach limits.

**Key Points (10.5.1)**

- Multiple **`Set-Cookie`** headers are normal.
- Prefer **fewer** cookies for performance.

**Best Practices (10.5.1)**

- Namespace cookie names (`app_sid`, `app_csrf`).

**Common Mistakes (10.5.1)**

- Accidentally using the **same name** with different **paths** and getting confused about which wins.

---

### 10.5.2 Cookie Manipulation

#### Beginner

“Manipulation” here means **server-side updates**: re-send **`set_cookie`** with the same **name** to **overwrite**.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/bump")
def bump(response: Response) -> dict[str, int]:
    response.set_cookie("visits", "3", path="/")
    return {"visits": 3}
```

#### Intermediate

Clients can **tamper** with cookies unless values are **signed** or **opaque ids** into server storage.

#### Expert

**Version** your cookie payloads if you must migrate **format** (`v=1|...`) to support **rolling upgrades**.

**Key Points (10.5.2)**

- Treat inbound cookies as **mutable** by the user.
- Overwriting is the **update** mechanism.

**Best Practices (10.5.2)**

- Log **suspicious** patterns (impossibly long values).

**Common Mistakes (10.5.2)**

- Incrementing **numeric counters** in cookies for **security** decisions.

---

### 10.5.3 Cookie Deletion

#### Beginner

Use **`response.delete_cookie(key, path=..., domain=...)`** matching the original **path/domain** used when setting.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/clear")
def clear(response: Response) -> dict[str, str]:
    response.delete_cookie(key="session_id", path="/")
    return {"status": "cleared"}
```

#### Intermediate

Deletion works by setting **Max-Age=0** / expired **Expires**. Mismatched **path** often causes “**cannot delete**” bugs.

#### Expert

For **JWT** in cookies, **deletion** does not **revoke** tokens unless you maintain **blocklists** or **short TTL** + **refresh**.

**Key Points (10.5.3)**

- Match **path** and **domain** on delete.
- Test in **browser** devtools, not only unit tests.

**Best Practices (10.5.3)**

- Clear **server session** **and** **client cookie**.

**Common Mistakes (10.5.3)**

- Deleting with default **path** when cookie was set with **`/api`**.

---

### 10.5.4 Cookie Documentation

#### Beginner

**`Cookie()`** parameters appear in **OpenAPI**; add **`description`** via **`Field`** when using **`Annotated`** with metadata (pattern aligns with FastAPI docs for query/header).

```python
from typing import Annotated

from fastapi import Cookie, FastAPI
from pydantic import Field

app = FastAPI()


@app.get("/docced")
def docced(
    session_id: Annotated[
        str,
        Cookie(description="Opaque server session identifier"),
    ],
) -> dict[str, str]:
    return {"session_id": session_id}
```

#### Intermediate

Document **cookie flags** in your **developer portal**—OpenAPI cannot fully express **`HttpOnly`** semantics for responses.

#### Expert

Provide **security notes** for integrators: **CSRF**, **CORS credentials**, **`SameSite`**, and **third-party** context.

**Key Points (10.5.4)**

- Auto docs help **internal** consumers discover **names**.
- Response cookies still need **human** docs.

**Best Practices (10.5.4)**

- Maintain a **cookie inventory** table for **privacy** reviews.

**Common Mistakes (10.5.4)**

- Assuming **Swagger** shows **all** cookies your app ever sets dynamically.

---

### 10.5.5 Cookie Best Practices

#### Beginner

Minimize data in cookies, use **HttpOnly** session ids, **HTTPS**, and validate server-side.

#### Intermediate

Align **frontend** (`fetch` **`credentials`**) with **CORS** **`allow_credentials`** when using cookies cross-origin.

#### Expert

Plan for **third-party cookie** deprecation: prefer **first-party** contexts or **token** patterns that fit your architecture.

**Key Points (10.5.5)**

- Cookies are simple **mechanically** but subtle **operationally**.
- **Observability** (structured logs without secrets) aids debugging.

**Best Practices (10.5.5)**

- Run **periodic** security reviews on **auth** and **session** flows.

**Common Mistakes (10.5.5)**

- Debugging **production-only** cookie issues without **staging** parity on **HTTPS** and **domains**.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- Cookies are set with **`Response.set_cookie`** and read with **`Cookie()`** or **`Request.cookies`**.
- **Security attributes** (`HttpOnly`, `Secure`, `SameSite`) are as important as the **cookie value**.
- Prefer **opaque session ids** with **server-side** session storage for most applications.
- **Expiration** must be enforced **server-side** for authoritative session length.
- **Deletion** requires matching **path** and **domain** attributes.

### Chapter Best Practices

- Centralize cookie configuration in **settings** and apply consistently.
- Use **`Annotated[..., Cookie()]`** style for clarity and documentation.
- Combine cookie defenses with **CSRF protection** for cookie-based auth.
- Keep cookies **small**, **few**, and **non-sensitive** (values are opaque ids).
- Test **login/logout** flows under **HTTPS** with production-like hostnames.

### Chapter Common Mistakes

- Storing **raw user roles** or **PII** in cookies without signing or encryption.
- Using **`secure=True`** during local **HTTP** development without toggles.
- Relying on **422** for **auth** failures instead of **401/403**.
- Forgetting **`path`** when calling **`delete_cookie`**, leaving “undeletable” cookies.
- Assuming **`HttpOnly`** alone stops **CSRF** or **all XSS** impact.

---
