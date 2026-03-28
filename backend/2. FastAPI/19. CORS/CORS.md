# CORS in FastAPI

## 📑 Table of Contents

- [19.1 CORS Basics](#191-cors-basics)
  - [19.1.1 Same-Origin Policy](#1911-same-origin-policy)
  - [19.1.2 Cross-Origin Requests](#1912-cross-origin-requests)
  - [19.1.3 Preflight Requests](#1913-preflight-requests)
  - [19.1.4 CORS Headers](#1914-cors-headers)
  - [19.1.5 CORS Errors](#1915-cors-errors)
- [19.2 CORS Configuration](#192-cors-configuration)
  - [19.2.1 CORSMiddleware](#1921-corsmiddleware)
  - [19.2.2 allowed_origins](#1922-allowed_origins)
  - [19.2.3 allowed_methods](#1923-allowed_methods)
  - [19.2.4 allowed_headers](#1924-allowed_headers)
  - [19.2.5 allow_credentials](#1925-allow_credentials)
- [19.3 CORS Parameters](#193-cors-parameters)
  - [19.3.1 Access-Control-Allow-Origin](#1931-access-control-allow-origin)
  - [19.3.2 Access-Control-Allow-Methods](#1932-access-control-allow-methods)
  - [19.3.3 Access-Control-Allow-Headers](#1933-access-control-allow-headers)
  - [19.3.4 Access-Control-Allow-Credentials](#1934-access-control-allow-credentials)
  - [19.3.5 Access-Control-Max-Age](#1935-access-control-max-age)
- [19.4 CORS for Different Origins](#194-cors-for-different-origins)
  - [19.4.1 Wildcard Origins](#1941-wildcard-origins)
  - [19.4.2 Specific Origins](#1942-specific-origins)
  - [19.4.3 Multiple Origins](#1943-multiple-origins)
  - [19.4.4 Dynamic Origins](#1944-dynamic-origins)
  - [19.4.5 Regex Patterns](#1945-regex-patterns)
- [19.5 CORS Best Practices](#195-cors-best-practices)
  - [19.5.1 Security Considerations](#1951-security-considerations)
  - [19.5.2 Credential Handling](#1952-credential-handling)
  - [19.5.3 Cookie Sharing](#1953-cookie-sharing)
  - [19.5.4 Custom Headers](#1954-custom-headers)
  - [19.5.5 Monitoring CORS Issues](#1955-monitoring-cors-issues)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 19.1 CORS Basics

**CORS** (Cross-Origin Resource Sharing) is a **browser** security mechanism. FastAPI servers opt in by sending specific **`Access-Control-*`** headers—usually via **`CORSMiddleware`**.

### 19.1.1 Same-Origin Policy

#### Beginner

Browsers treat two URLs as the **same origin** when **`scheme`**, **`host`**, and **`port`** match. `https://app.example.com` and `https://api.example.com` are **different** origins (different **hosts**).

```python
# Illustrative comparison (not FastAPI code)
from urllib.parse import urlparse

def same_origin(a: str, b: str) -> bool:
    pa, pb = urlparse(a), urlparse(b)
    return (pa.scheme, pa.hostname, pa.port or default_port(pa.scheme)) == (
        pb.scheme,
        pb.hostname,
        pb.port or default_port(pb.scheme),
    )


def default_port(scheme: str) -> int:
    return 443 if scheme == "https" else 80
```

#### Intermediate

**Same-origin policy** blocks **JavaScript** from reading **most** cross-origin **responses** unless the **server** grants permission via **CORS**. **Non-browser** clients (**curl**, **mobile native**, **server-to-server**) are **not** restricted by CORS.

#### Expert

**Subdomains**, **IDN**, **IPv6 literals**, and **default ports** complicate comparisons—always reason in terms of **serialized origin** strings the browser uses in **`Origin`** headers.

**Key Points (19.1.1)**

- CORS is enforced by **browsers**, not by **HTTP** itself.
- **Origin** is **scheme + host + port**.

**Best Practices (19.1.1)**

- Log **`Origin`** (not **`Referer`**) when debugging **CORS**.
- Treat **`null`** **Origin** carefully (file URLs, sandboxed contexts).

**Common Mistakes (19.1.1)**

- Thinking **CORS** blocks your **backend**—it blocks **browser JS** reads.
- Confusing **DNS** CNAME aliasing with **same origin**—**host** string must match.

---

### 19.1.2 Cross-Origin Requests

#### Beginner

When a **SPA** at `https://app.example.com` calls `fetch("https://api.example.com/items")`, the browser sends the request and may **block JS** from reading the response unless **CORS** allows it.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

#### Intermediate

**Simple requests** (for example **GET** without custom headers) may not trigger **preflight**, but **CORS headers** are still required for **readable** responses in **cross-origin XHR/fetch**.

#### Expert

**Credentialed** requests (**cookies**, **Authorization**) have **stricter** rules: **no wildcard `*` for `Access-Control-Allow-Origin`** when **`Access-Control-Allow-Credentials: true`**.

**Key Points (19.1.2)**

- **Cross-origin** is normal for **SPAs** + **APIs**.
- **Credentials** tighten **Allow-Origin** rules.

**Best Practices (19.1.2)**

- Serve **API** and **SPA** from **stable** **origins** in **prod**.
- Use **environment-specific** **allow lists**.

**Common Mistakes (19.1.2)**

- Testing only with **Postman** and missing **browser** CORS failures.
- Mixing **http** and **https** **origins** accidentally.

---

### 19.1.3 Preflight Requests

#### Beginner

For **non-simple** requests, browsers send an **`OPTIONS`** **preflight** asking the server which methods/headers are allowed. The server must answer with **`204/200`** and **`Access-Control-*`** meta.

```python
# CORSMiddleware handles OPTIONS automatically when configured
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["DELETE", "GET", "POST", "PUT"],
    allow_headers=["Authorization", "Content-Type"],
)
```

#### Intermediate

**Triggers** include **`Content-Type: application/json`**, **custom headers** like **`X-Request-ID`**, and **methods** beyond **GET/HEAD/POST** (simple subset rules—verify current **Fetch** spec nuances).

#### Expert

**Preflight caching** via **`Access-Control-Max-Age`** reduces **OPTIONS** traffic—tune for **dev** vs **prod**. **CDNs** must **forward** **`OPTIONS`** to **origin** or answer **consistently**.

**Key Points (19.1.3)**

- **OPTIONS** preflight is **automatic** in **browsers**.
- **`CORSMiddleware`** should be **outer** enough to tag **OPTIONS** responses.

**Best Practices (19.1.3)**

- Ensure **routing**/**middleware** does not **404** **OPTIONS** unintentionally.
- **Cache** preflight in **prod** with **care** when **policies** change.

**Common Mistakes (19.1.3)**

- **Auth** middleware rejecting **`OPTIONS`** before **CORS** answers.
- Forgetting **`allow_headers`** for **`Authorization`**.

---

### 19.1.4 CORS Headers

#### Beginner

Key response headers:

- **`Access-Control-Allow-Origin`**
- **`Access-Control-Allow-Methods`**
- **`Access-Control-Allow-Headers`**
- **`Access-Control-Allow-Credentials`**
- **`Access-Control-Expose-Headers`**
- **`Access-Control-Max-Age`**

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/manual-cors")
def manual(response: Response) -> dict[str, str]:
    response.headers["Access-Control-Allow-Origin"] = "https://app.example.com"
    return {"ok": "true"}
```

#### Intermediate

**`Vary: Origin`** helps **caches** distinguish responses when **`Allow-Origin`** echoes **specific** origins—**CORSMiddleware** manages much of this.

#### Expert

**`Access-Control-Expose-Headers`** controls which **response** headers **JS** may read—by default only **CORS-safelisted** response headers are visible.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    expose_headers=["X-Request-ID"],
)
```

**Key Points (19.1.4)**

- **Allow-*** headers are **server grants** to **browsers**.
- **`Expose-Headers`** is separate from **Allow-Headers**.

**Best Practices (19.1.4)**

- **Minimize** exposed headers to reduce **leakage** surface.
- **Document** required **custom** headers for **frontend** teams.

**Common Mistakes (19.1.4)**

- Expecting **JS** to read **`Set-Cookie`** or arbitrary headers without **Expose**.
- Duplicating **CORS** headers in **both** **middleware** and **routes** inconsistently.

---

### 19.1.5 CORS Errors

#### Beginner

Browser **DevTools** shows **CORS policy** errors when **`Allow-Origin`** is missing/wrong, **preflight** fails, or **credentials** rules are violated.

```python
# Typical fix: align allow_origins with frontend URL exactly (scheme + host + port)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Intermediate

**Redirect** responses (**3xx**) on **preflight** or **API** calls can **strip** or **omit** CORS headers—ensure **reverse proxies** preserve **middleware** behavior.

#### Expert

**Multiple** **`Access-Control-Allow-Origin`** values are **invalid**—browsers expect **either** **`*`** **or** a **single** **origin** echo. **Regex** or **dynamic** origin validation must still emit **one** value.

**Key Points (19.1.5)**

- **CORS errors** are **client-side** visibility issues—**network** may still be **200 OK**.
- **Redirects** + **CORS** confuse many **teams**.

**Best Practices (19.1.5)**

- Reproduce with **browser** **fetch**, not only **curl**.
- Check **`OPTIONS`** **status** and **response headers** explicitly.

**Common Mistakes (19.1.5)**

- Using **`localhost` vs 127.0.0.1** interchangeably without **both** in **allow list**.
- Blaming **FastAPI** when **nginx** overwrites **headers**.

---

## 19.2 CORS Configuration

FastAPI re-exports **`CORSMiddleware`** from Starlette—configuration kwargs control **policy**.

### 19.2.1 CORSMiddleware

#### Beginner

Add **`CORSMiddleware`** with **`app.add_middleware(CORSMiddleware, ...)`**. Place it **early** so **errors** still receive **CORS** headers.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Intermediate

**`CORSMiddleware`** handles **simple** and **preflight** requests, echoing **`Origin`** when allowed.

#### Expert

For **mounted** apps, **each** **`FastAPI`** instance may need **its own** **CORS** stack—or mount under a **parent** that already applies **CORS** (understand **which** **app** handles **OPTIONS**).

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

api = FastAPI()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"])
app.mount("/api", api)
```

**Key Points (19.2.1)**

- **`CORSMiddleware`** is the **standard** FastAPI solution.
- **Mounting** affects **which** app’s **middleware** runs.

**Best Practices (19.2.1)**

- Add **CORS** in **one** **central** place per **app** surface.
- **Integration-test** **`OPTIONS`**.

**Common Mistakes (19.2.1)**

- Registering **CORS** **after** other middleware in a way that **skips** **error** responses—see **order** notes in **Topic 18**.
- **Duplicating** **CORSMiddleware** **twice**.

---

### 19.2.2 allowed_origins

#### Beginner

**`allow_origins`** is a **list** of **full origin strings** like **`"https://app.example.com"`**—**no paths**.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://myapp.vercel.app",
    ],
)
```

#### Intermediate

**`allow_origin_regex`** can complement **lists** for **preview** deployments—see **19.4.5**.

#### Expert

**Trailing slashes** do **not** belong in **origins**. **Scheme** must match (**`http` vs `https`**). **Wildcards** in **`allow_origins`** are **not** substring patterns—use **regex** for **patterns**.

**Key Points (19.2.2)**

- Origins are **exact** matches (unless **regex** is used).
- Include **ports** for **non-default** dev servers.

**Best Practices (19.2.2)**

- Load **origins** from **environment** variables in **prod**.
- **Review** **preview** **URLs** regularly (**ephemeral** **branches**).

**Common Mistakes (19.2.2)**

- Putting **`https://app.example.com/`** (trailing slash) in **`allow_origins`**.
- Forgetting **`http://localhost:3000`** vs **`http://127.0.0.1:3000`**.

---

### 19.2.3 allowed_methods

#### Beginner

**`allow_methods=["*"]`** permits any method in **preflight** responses (practical for **CRUD** APIs during **development**).

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)
```

#### Intermediate

Tighten to **`["GET", "POST", "PATCH"]`** in **production** to reduce **accidental** **surface**.

#### Expert

**`OPTIONS`** is handled by **middleware**—you rarely define **`@app.options`** manually unless **custom** routing.

**Key Points (19.2.3)**

- **Methods** matter for **preflight** **Allow-Methods**.
- **Over-permission** increases **CSRF** **risk** when combined with **cookies**—pair with **CSRF tokens** or **SameSite** policies.

**Best Practices (19.2.3)**

- Match **methods** to **actual** **OpenAPI** operations.
- **Document** **method** changes in **frontend** **SDKs**.

**Common Mistakes (19.2.3)**

- Allowing **`DELETE`** from **browser** **origins** you do not **trust**.
- Using **`*`** while **security** reviews assume **minimal** **methods**.

---

### 19.2.4 allowed_headers

#### Beginner

**`allow_headers=["*"]`** is convenient in **dev**. In **prod**, list **`Authorization`**, **`Content-Type`**, **`X-Request-ID`**, etc.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)
```

#### Intermediate

Browsers send **`Access-Control-Request-Headers`** on **preflight**—the server must **echo** allowed headers.

#### Expert

**Case-insensitive** comparisons apply—**`Authorization`** vs **`authorization`** should **both** work via middleware normalization.

**Key Points (19.2.4)**

- Missing **headers** in **allow_headers** → **preflight** **failures**.
- **`*`** may be **too broad** for **sensitive** deployments.

**Best Practices (19.2.4)**

- Enumerate **headers** your **frontend** **actually** sends.
- **Version** **custom** headers (**`X-MyApp-Feature`**).

**Common Mistakes (19.2.4)**

- Forgetting **`Content-Type`** for **JSON** **POST**.
- Allowing **`*`** while **`expose_headers`** is **tight**—different dimensions.

---

### 19.2.5 allow_credentials

#### Beginner

**`allow_credentials=True`** permits **cookies** and **`Authorization`** **credentialed** fetches. **`allow_origins` cannot be `["*"]`** in that mode.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Intermediate

Frontend must use **`fetch(url, { credentials: "include" })`** or **`axios.withCredentials = true`**.

#### Expert

**Third-party cookies** restrictions (**CHIPS**, **ITP**) evolve—**CORS** alone does not guarantee **cookie** delivery; **SameSite**, **Secure**, and **Partitioned** attributes matter.

**Key Points (19.2.5)**

- **Credentials** + **wildcard origins** = **invalid** combination.
- **Server** and **client** must **both** opt in.

**Best Practices (19.2.5)**

- Prefer **`SameSite=Lax`/`Strict`** where possible; **CSRF** defense in depth.
- Use **HTTPS** everywhere for **cookie** APIs.

**Common Mistakes (19.2.5)**

- Setting **`allow_credentials=True`** with **`allow_origins=["*"]`**.
- Enabling **credentials** without **HTTPS** in **production**.

---

## 19.3 CORS Parameters

These headers are what **browsers** interpret—**CORSMiddleware** sets them for you.

### 19.3.1 Access-Control-Allow-Origin

#### Beginner

Echo **`Origin`** if allowed, or **`*`** for **public** **non-credentialed** APIs.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/public")
def public(response: Response) -> dict[str, str]:
    response.headers["Access-Control-Allow-Origin"] = "*"
    return {"hello": "world"}
```

#### Intermediate

**`CORSMiddleware`** sets **specific** **origin** echoes when **`allow_credentials=True`**.

#### Expert

**`Vary: Origin`** should accompany **dynamic** **`Allow-Origin`** to prevent **cache poisoning** at **shared** caches.

**Key Points (19.3.1)**

- **Single** origin value or **`*`**—never a **list** in **raw** HTTP.
- **Echo** **exact** **`Origin`** header string when using **credentials**.

**Best Practices (19.3.1)**

- Avoid **manual** header setting unless **bypassing** **middleware** intentionally.
- **Test** **CDN** caching with **multiple** **origins**.

**Common Mistakes (19.3.1)**

- Returning **`Access-Control-Allow-Origin: null`** unintentionally via string **concat** bugs.
- **Mismatched** **scheme** (**`http`** frontend, **`https`** API).

---

### 19.3.2 Access-Control-Allow-Methods

#### Beginner

Lists **permitted** methods for **preflight**—often **`GET, POST, PUT, DELETE, OPTIONS`**.

```python
# CORSMiddleware sets this from allow_methods — manual example:
from fastapi import Response

def add_allow_methods(response: Response, methods: list[str]) -> None:
    response.headers["Access-Control-Allow-Methods"] = ", ".join(methods)
```

#### Intermediate

**`OPTIONS`** should be **allowed** at **proxy** level even if **app** handles it—otherwise **preflight** **dies** at **edge**.

#### Expert

**`Allow-Methods`** on **actual** **GET/POST** responses is **sometimes** included for **legacy** clients—middleware behavior varies; rely on **spec** + **tests**.

**Key Points (19.3.2)**

- **Methods** answer **`Access-Control-Request-Method`**.
- **Proxies** must **forward** **OPTIONS**.

**Best Practices (19.3.2)**

- **Align** with **OpenAPI** **verbs**.
- **Block** unused **methods** at **WAF** too.

**Common Mistakes (19.3.2)**

- **404** on **`OPTIONS`** at **load balancer**.
- **Case** sensitivity in **nonstandard** clients—use **uppercase** **method** names in **headers**.

---

### 19.3.3 Access-Control-Allow-Headers

#### Beginner

Answers **`Access-Control-Request-Headers`** from **preflight**.

```python
from fastapi import Response

def add_allow_headers(response: Response, headers: list[str]) -> None:
    response.headers["Access-Control-Allow-Headers"] = ", ".join(headers)
```

#### Intermediate

If **`Authorization`** is missing here, **Bearer** **tokens** in **SPA**s will **fail** **preflight**.

#### Expert

**Wildcard `*` for allow headers** interacts with **credentialed** requests per **spec updates**—verify **browser** behavior for your **target** matrix.

**Key Points (19.3.3)**

- **Allow-Headers** must cover **every** **non-simple** request header you send.
- **Preflight** is **cached**—**header** changes may **linger** until **cache** expires.

**Best Practices (19.3.3)**

- Keep **custom** headers **few** and **documented**.
- **Version** **breaking** header renames.

**Common Mistakes (19.3.3)**

- Adding **`X-Api-Key`** client-side without **server allow list**.
- Assuming **`*`** always works with **credentials** on **all** browsers.

---

### 19.3.4 Access-Control-Allow-Credentials

#### Beginner

**`true`** tells the browser it may **expose** **credentialed** responses to **JS**. Must pair with **non-`*`** **`Allow-Origin`**.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
)
```

#### Intermediate

**Cookies** still require **`Set-Cookie`** with proper **`Domain`/`Path`/`SameSite`/`Secure`**.

#### Expert

**Double** cookie **names** (**`__Host-`**, **`__Secure-`**) impose **extra** constraints—CORS does not **replace** **cookie** attribute rules.

**Key Points (19.3.4)**

- **`Allow-Credentials: true`** is a **boolean** string in **HTTP**.
- **Misconfiguration** yields **opaque** **network** errors in **fetch**.

**Best Practices (19.3.4)**

- **End-to-end** tests with **Playwright** for **real** **browser** behavior.
- **Separate** **public** and **private** **API** **surfaces** when possible.

**Common Mistakes (19.3.4)**

- **Frontend** missing **`credentials: "include"`**.
- **`Allow-Origin: *`** with **`Allow-Credentials: true`**.

---

### 19.3.5 Access-Control-Max-Age

#### Beginner

Caches **preflight** results **client-side** for **N seconds**, reducing **`OPTIONS`** traffic.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    max_age=600,
)
```

#### Intermediate

**Too long** **max_age** delays **policy** rollouts—use **shorter** values during **migrations**, **longer** in **steady** **prod**.

#### Expert

**Browsers** cap **effective** **max-age** per **implementation**—do not rely on **very large** values being honored **literally**.

**Key Points (19.3.5)**

- **`max_age`** optimizes **performance**, not **security**.
- **Policy** changes need **cache** **awareness**.

**Best Practices (19.3.5)**

- **600–86400** seconds common ranges—pick based on **change** frequency.
- **Invalidate** via **versioned** **origins** only as **last resort**—prefer **reasonable** **TTL**.

**Common Mistakes (19.3.5)**

- Setting **`max_age=0`** in **prod** causing **OPTIONS** storms.
- Expecting **instant** **CORS** updates with **hour-long** **max_age**.

---

## 19.4 CORS for Different Origins

Real deployments use **wildcards**, **lists**, **dynamic** validation, or **regex**.

### 19.4.1 Wildcard Origins

#### Beginner

**`allow_origins=["*"]`** allows **any** **Origin** for **non-credentialed** APIs (**public** read-only JSON).

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
)
```

#### Intermediate

**`allow_origin_regex=r".*"`** is **not** the same as **`*`**—regex still must obey **credentials** rules.

#### Expert

**Public** APIs may still leak **per-user** data if **auth** is **header-based** and **browsers** are not the only clients—**`*`** does not make data **public**, but **mis-AuthZ** might.

**Key Points (19.4.1)**

- **`*`** is for **anonymous** **cross-origin** **read** patterns.
- **Never** combine **`"*"`** with **`allow_credentials=True`**.

**Best Practices (19.4.1)**

- **Rate limit** **anonymous** endpoints even if **CORS** is **open**.
- **Monitor** **abuse** separately from **CORS**.

**Common Mistakes (19.4.1)**

- Using **`*`** for **cookie** **sessions**.
- Thinking **`*`** **hides** your API from **curl**/**scripts**.

---

### 19.4.2 Specific Origins

#### Beginner

List **each** **production** **frontend** origin explicitly.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.example.com",
        "https://admin.example.com",
    ],
)
```

#### Intermediate

Include **`https://app.example.com`** and **`https://www.example.com`** if both **exist**.

#### Expert

**APEX vs www** and **marketing** **sites** multiply **origins**—automate **config** from **infra** **registry**.

**Key Points (19.4.2)**

- **Explicit** origins are **clearest** **audit** trail.
- **Marketing** **subdomains** often **need** **separate** entries.

**Best Practices (19.4.2)**

- **Infrastructure as code** for **origin** lists.
- **Annual** review of **stale** **domains**.

**Common Mistakes (19.4.2)**

- **Typo** in **`https`** scheme or **port**.
- Missing **`www`** **variant**.

---

### 19.4.3 Multiple Origins

#### Beginner

Pass **several** strings in **`allow_origins=[...]`**—middleware matches **request `Origin`** against the **list**.

```python
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://staging.example.com",
    "https://app.example.com",
]
app.add_middleware(CORSMiddleware, allow_origins=origins)
```

#### Intermediate

**Environment** splits: **`DEV_ORIGINS`** vs **`PROD_ORIGINS`** **joined** at **startup**.

#### Expert

**Large** lists are fine **if** **static**—for **hundreds** of **tenants**, switch to **dynamic** validation (**19.4.4**) or **gateway**-level **CORS**.

**Key Points (19.4.3)**

- **Multiple** discrete **origins** are **normal** for **staging** + **prod**.
- **Size** of list is **less** important than **correctness**.

**Best Practices (19.4.3)**

- **Deduplicate** **origins** in **config** **loaders**.
- **Sort** **lists** in **docs** for **human** **diffs**.

**Common Mistakes (19.4.3)**

- **Accidentally** **concatenating** **origins** without **scheme**.
- **Sharing** **prod** **secrets** with **staging** **origins** in **same** **app** without **isolation**.

---

### 19.4.4 Dynamic Origins

#### Beginner

**Starlette `CORSMiddleware`** supports **`allow_origin_regex`** for **pattern**-based **matching** (see **19.4.5**). True **dynamic** logic sometimes uses **custom ASGI** **middleware** that validates **`Origin`** against **DB**.

```python
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Comma-separated env: CORS_ORIGINS="https://a.com,https://b.com"
_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(CORSMiddleware, allow_origins=cors_origins)
```

#### Intermediate

**Reload** **origins** on **SIGHUP** or **watch** **config** **service**—avoid **per-request** **DB** hits.

#### Expert

**Tenant-specific** **subdomains** like **`https://{tenant}.app.example.com`** map well to **regex** **`^https://[a-z0-9-]+\.app\.example\.com$`**—**test** **ReDoS** safety.

**Key Points (19.4.4)**

- **Dynamic** lists need **caching** and **observability**.
- **DB** lookups per **request** are **usually** **too slow**.

**Best Practices (19.4.4)**

- **Precompute** **compiled** **regexes** once.
- **Alert** on **unknown** **Origin** **spikes** (**possible** **phishing**).

**Common Mistakes (19.4.4)**

- **Accidentally** allowing **`https://evil.com\.app.example.com`** via **bad** **regex**.
- **No** **audit** trail when **origins** change **dynamically**.

---

### 19.4.5 Regex Patterns

#### Beginner

Use **`allow_origin_regex`** for **Vercel/Netlify** **preview** URLs.

```python
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
)
```

#### Intermediate

Anchor **patterns** (**`^...$`**) to avoid **superdomain** tricks.

```python
allow_origin_regex = re.compile(
    r"^https://[a-z0-9-]+\.example\.com$"
).pattern  # pass string to middleware
```

#### Expert

**ReDoS** matters if **regex** is **complex** and **Origin** is **attacker-controlled**—keep **patterns** **linear** time.

```python
# Prefer simple character classes and explicit anchors — avoid nested quantifiers
SAFE_PREVIEW = r"^https://[a-z0-9-]{1,63}--pr-\d+\.vercel\.app$"
```

**Key Points (19.4.5)**

- **Regex** scales **better** than **giant** static lists for **previews**.
- **Security** depends on **tight** **patterns**.

**Best Practices (19.4.5)**

- **Unit-test** **accepted** and **rejected** **origins**.
- **Escape** **dots** in **domains** (**`\.`**).

**Common Mistakes (19.4.5)**

- **Overbroad** **`.*`** **subpatterns**.
- **Mixing** **`allow_origins`** and **`allow_origin_regex`** **expectations** without reading **Starlette** **merge** rules.

---

## 19.5 CORS Best Practices

Operational guidance beyond **“it works on my machine.”**

### 19.5.1 Security Considerations

#### Beginner

CORS is **not** **authentication**—it only relaxes **browser read** restrictions. **Always** enforce **AuthN/AuthZ** server-side.

```python
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["https://app.example.com"], allow_credentials=True)
security = HTTPBearer()


@app.get("/me")
def me(token: str = Depends(security)) -> dict[str, str]:
    if token != "good":
        raise HTTPException(401)
    return {"user": "you"}
```

#### Intermediate

**CSRF** risk rises with **cookie** **sessions**—use **SameSite** defaults + **CSRF** tokens for **state-changing** **requests**.

#### Expert

**CORS** + **JSON** **POST** from **evil.com**: browsers **send** **cookies** only if **credentialed** + **allowed origin**—but **attackers** can still **invoke** **simple** requests in **some** cases—**defense in depth** matters.

**Key Points (19.5.1)**

- **Server** must **authorize** every **request** regardless of **CORS**.
- **Cookies** require **browser** **security** **controls** beyond **CORS**.

**Best Practices (19.5.1)**

- **Rotate** **JWTs**; **short** **TTL** for **access** tokens.
- **WAF** rules for **suspicious** **Origin** **combinations**.

**Common Mistakes (19.5.1)**

- Believing **CORS** **blocks** **attackers**—**curl** **bypasses** it.
- **Open** **CORS** on **admin** **routes** **accidentally**.

---

### 19.5.2 Credential Handling

#### Beginner

Set **`allow_credentials=True`**, **non-`*` origins**, and **frontend** **`credentials: "include"`**.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_headers=["Authorization", "Content-Type"],
)
```

#### Intermediate

**`Authorization: Bearer`** is **not** a **cookie**, but **credentialed** **fetch** still follows **CORS** **rules** for **reading** **responses**.

#### Expert

**Split** **token** **storage** strategies (**memory** vs **httpOnly** **cookies**) impact **XSS** vs **CSRF** tradeoffs—CORS is only **one** layer.

**Key Points (19.5.2)**

- **Credentials** flag is **binary**—get **both** sides right.
- **Cookies** and **bearer** tokens have **different** **threat** models.

**Best Practices (19.5.2)**

- Prefer **`httpOnly`** **cookies** + **CSRF** protection for **many** **web** apps.
- **Never** store **long-lived** **refresh** tokens in **localStorage** if **avoidable**.

**Common Mistakes (19.5.2)**

- **Backend** **`allow_credentials`** **True** with **frontend** default **`omit`**.
- **`SameSite=None`** without **`Secure`**.

---

### 19.5.3 Cookie Sharing

#### Beginner

Cookies are **scoped** by **`Domain`**, **`Path`**, **`Secure`**, **`HttpOnly`**, **`SameSite`**. **CORS** alone does not **create** **cross-site** **cookie** **behavior**.

```python
from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/login")
def login(response: Response) -> dict[str, str]:
    response.set_cookie(
        key="session",
        value="abc",
        httponly=True,
        secure=True,
        samesite="lax",
        domain=".example.com",
        path="/",
    )
    return {"ok": "true"}
```

#### Intermediate

**`SameSite=None; Secure`** is required for **third-party** **cookie** contexts in **modern** browsers—often **avoided** by **same-site** **deployment** (**app** + **api** **subdomains** under **parent** domain).

#### Expert

**CHIPS** (**Partitioned** cookies) changes **embedded** **widget** scenarios—**CORS** **Allow-Credentials** still required but **cookie** **partitioning** may **block** **sharing** you expected.

**Key Points (19.5.3)**

- **Cookie** **attributes** dominate **delivery**; **CORS** governs **JS** **visibility**.
- **Subdomain** **sharing** uses **leading dot** **Domain** rules **carefully**.

**Best Practices (19.5.3)**

- **Centralize** **cookie** **policy** in **one** **module**.
- **Test** **Safari/Firefox/Chrome** for **SameSite** behavior.

**Common Mistakes (19.5.3)**

- Setting **`Domain=localhost`** incorrectly across **browsers**.
- Expecting **cookies** to **cross** **different** **eTLD+1** **domains**.

---

### 19.5.4 Custom Headers

#### Beginner

Any **non-simple** header (for example **`X-Api-Key`**, **`Idempotency-Key`**) must appear in **`allow_headers`** (or **`*`** in **dev**).

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_headers=["Authorization", "Content-Type", "X-Api-Key", "Idempotency-Key"],
)
```

#### Intermediate

**Expose** response headers to **JS** with **`expose_headers`**—for example **`X-Request-ID`**, **`Retry-After`**.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    expose_headers=["X-Request-ID", "Retry-After"],
)
```

#### Expert

**Custom** headers should be **documented** in **OpenAPI** via **`Header()`** parameters so **SDKs** **generate** **correct** **clients**.

```python
from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/data")
def data(x_request_id: str | None = Header(default=None, alias="X-Request-ID")) -> dict:
    return {"x_request_id": x_request_id}
```

**Key Points (19.5.4)**

- **Request** headers → **`allow_headers`**; **response** headers → **`expose_headers`**.
- **Preflight** **failures** often mean **missing** **allow_headers** entry.

**Best Practices (19.5.4)**

- **Prefix** org headers (**`X-MyCo-`**) to avoid **collisions**.
- **Minimize** **custom** headers to reduce **preflight** **surface**.

**Common Mistakes (19.5.4)**

- Forgetting **`expose_headers`** while **logging** **`X-Request-ID`** **client-side**.
- **Typos** in **header** names (**case** usually OK, but **consistency** helps **docs**).

---

### 19.5.5 Monitoring CORS Issues

#### Beginner

Track **OPTIONS** **volume** and **4xx** on **`/api`**—spikes may indicate **misconfigured** **frontends** or **bots**.

```python
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

log = logging.getLogger("cors-debug")


class LogOptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            log.info("OPTIONS %s Origin=%s", request.url.path, request.headers.get("origin"))
        return await call_next(request)
```

#### Intermediate

**Real User Monitoring** can capture **CORS** **console** errors only on **frontend**—correlate with **API** **logs** using **`X-Request-ID`**.

#### Expert

**Synthetic** **checks** from **browser** **automation** in **staging** catch **prod** **only** issues like **wrong** **`allow_origins`** after **DNS** **cutover**.

**Key Points (19.5.5)**

- **CORS** failures are **often** **config** drift, not **code** bugs.
- **Cross-team** **correlation** (**frontend Origin** ↔ **backend allow list**) is key.

**Best Practices (19.5.5)**

- **Dashboards** for **`OPTIONS`/`GET` ratio** per **route prefix**.
- **Alert** when **new** **Origin** **appears** frequently (**possible** **misroute**).

**Common Mistakes (19.5.5)**

- **No** **logging** of **`Origin`** on **failed** **preflight** paths.
- **Blaming** **CORS** when **real** issue is **401/403** **after** **successful** **CORS**.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- **CORS** is a **browser** enforcement mechanism; configure **`Access-Control-*`** headers via **`CORSMiddleware`**.
- **`allow_credentials=True`** forbids **`Access-Control-Allow-Origin: *`**—use **explicit** origins or **careful** **regex**.
- **Preflight** **`OPTIONS`** must succeed with **matching** **methods** and **headers**.
- **Cookies** require **cookie attributes** + **CORS** + **frontend** **`credentials`** flags.

### Chapter Best Practices

- Keep **`CORSMiddleware` outer** in the stack so **errors** still carry **CORS** headers.
- Maintain **environment-driven** **origin lists**; **review** **regex** **patterns** for **overbreadth**.
- Test with **real browsers** and **automate** **smoke** checks in **staging**.
- **Minimize** exposed and allowed headers; **document** them for **frontend** engineers.

### Chapter Common Mistakes

- **`localhost` vs 127.0.0.1** mismatches.
- **`allow_credentials`** with **wildcard** origins.
- **Blocking** **`OPTIONS`** at **proxy**/auth layers.
- Confusing **CORS** with **authentication** or **authorization**.
