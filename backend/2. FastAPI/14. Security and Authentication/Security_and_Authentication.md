# Security and Authentication

This chapter maps common **threats** and **controls** to concrete **FastAPI** patterns: transport hardening (TLS, CORS, headers), **authentication** schemes (Basic, Bearer, OAuth2, JWT), **OIDC** integration, **MFA** and enterprise federation, and **password** handling. Treat every snippet as **illustrative**—swap demo secrets, wire real databases, and align with your IdP and platform security baselines before production use.

## 📑 Table of Contents

- [14.1 Security Basics](#141-security-basics)
  - [14.1.1 Security Considerations](#1411-security-considerations)
  - [14.1.2 HTTPS/TLS](#1412-httpstls)
  - [14.1.3 CORS Security](#1413-cors-security)
  - [14.1.4 SQL Injection Prevention](#1414-sql-injection-prevention)
  - [14.1.5 XSS Prevention](#1415-xss-prevention)
- [14.2 HTTP Basic Authentication](#142-http-basic-authentication)
  - [14.2.1 HTTPBasic Scheme](#1421-httpbasic-scheme)
  - [14.2.2 Username and Password](#1422-username-and-password)
  - [14.2.3 Encoding Credentials](#1423-encoding-credentials)
  - [14.2.4 Validation](#1424-validation)
  - [14.2.5 Use Cases](#1425-use-cases)
- [14.3 Bearer Authentication](#143-bearer-authentication)
  - [14.3.1 HTTPBearer Scheme](#1431-httpbearer-scheme)
  - [14.3.2 Bearer Tokens](#1432-bearer-tokens)
  - [14.3.3 Token Management](#1433-token-management)
  - [14.3.4 Token Validation](#1434-token-validation)
  - [14.3.5 Best Practices](#1435-best-practices)
- [14.4 OAuth2 Authentication](#144-oauth2-authentication)
  - [14.4.1 OAuth2 Flow](#1441-oauth2-flow)
  - [14.4.2 OAuth2PasswordBearer](#1442-oauth2passwordbearer)
  - [14.4.3 OAuth2PasswordRequestForm](#1443-oauth2passwordrequestform)
  - [14.4.4 Scopes](#1444-scopes)
  - [14.4.5 Token Exchange](#1445-token-exchange)
- [14.5 JWT (JSON Web Tokens)](#145-jwt-json-web-tokens)
  - [14.5.1 JWT Structure](#1451-jwt-structure)
  - [14.5.2 JWT Creation](#1452-jwt-creation)
  - [14.5.3 JWT Validation](#1453-jwt-validation)
  - [14.5.4 JWT Payload](#1454-jwt-payload)
  - [14.5.5 Token Expiration](#1455-token-expiration)
- [14.6 OpenID Connect](#146-openid-connect)
  - [14.6.1 OIDC Overview](#1461-oidc-overview)
  - [14.6.2 ID Tokens](#1462-id-tokens)
  - [14.6.3 User Info Endpoint](#1463-user-info-endpoint)
  - [14.6.4 Discovery Endpoint](#1464-discovery-endpoint)
  - [14.6.5 OIDC Providers](#1465-oidc-providers)
- [14.7 Advanced Authentication](#147-advanced-authentication)
  - [14.7.1 Multi-Factor Authentication](#1471-multi-factor-authentication)
  - [14.7.2 Social Login Integration](#1472-social-login-integration)
  - [14.7.3 SAML Authentication](#1473-saml-authentication)
  - [14.7.4 Custom Authentication](#1474-custom-authentication)
  - [14.7.5 Authentication Middleware](#1475-authentication-middleware)
- [14.8 Password Management](#148-password-management)
  - [14.8.1 Password Hashing](#1481-password-hashing)
  - [14.8.2 bcrypt Integration](#1482-bcrypt-integration)
  - [14.8.3 Password Validation Rules](#1483-password-validation-rules)
  - [14.8.4 Password Reset Flow](#1484-password-reset-flow)
  - [14.8.5 Secure Password Storage](#1485-secure-password-storage)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 14.1 Security Basics

Web APIs face predictable classes of threats: **broken authentication**, **injection**, **XSS**, **CSRF**, **misconfiguration**, and **insufficient logging**. FastAPI helps with type validation and OpenAPI, but **security is mostly application and operations discipline**.

### 14.1.1 Security Considerations

#### Beginner

Before coding endpoints, list **assets** (user data, tokens), **trust boundaries** (browser, mobile app, partner API), and **adversaries** (anonymous internet, malicious insiders). Every route should answer: who can call it, with what proof, and what data can leak on error.

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/internal/metrics")
def metrics() -> dict[str, int]:
    # Example guard: never expose raw internals publicly without auth/network policy
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
```

#### Intermediate

Apply **defense in depth**: TLS termination at the edge, **WAF** rules, rate limits, strict **CORS**, parameterized DB access, secrets in a vault, and **least-privilege** IAM for workers. Threat-model **admin** paths separately—they are high value.

#### Expert

Align with **OWASP ASVS** levels per product tier. For B2B, map controls to **SOC2** trust criteria. Implement **secure SDLC**: dependency scanning (SBOM), SAST/DAST, pen tests, and **incident response** playbooks including token revocation and customer notification triggers.

**Key Points (14.1.1)**

- Security starts with **requirements**, not libraries.
- FastAPI validates shapes, not **business trust**—you must still authorize.
- **Errors** and **logs** are information disclosure surfaces.

**Best Practices (14.1.1)**

- Maintain a **data classification** policy and tag PII fields in models.
- Run **regular** dependency updates with automated CVE alerts.

**Common Mistakes (14.1.1)**

- Assuming **HTTPS** alone fixes authz bugs.
- Returning **stack traces** to clients in production.

---

### 14.1.2 HTTPS/TLS

#### Beginner

**HTTPS** encrypts data in transit between client and server, preventing passive eavesdropping and many on-path attacks. In production, terminate TLS at a **reverse proxy** (nginx, Envoy, cloud LB) or use **Uvicorn** with certificates for internal meshes.

```python
# Typical production: TLS handled by ingress; app sees HTTP internally on loopback.
# Local dev with self-signed certs (illustrative only):
# uvicorn main:app --ssl-keyfile=key.pem --ssl-certfile=cert.pem

from fastapi import FastAPI

app = FastAPI()


@app.middleware("http")
async def add_hsts(request, call_next):
    response = await call_next(request)
    # Only behind HTTPS termination you trust:
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    return response
```

#### Intermediate

Enforce **TLS 1.2+**, modern cipher suites, and **HSTS**. Use **cert-manager** or cloud-managed certs with **auto renewal**. For **mTLS** service-to-service, terminate at sidecars and forward client cert metadata as trusted headers **only** after verification at the mesh.

#### Expert

Implement **OCSP stapling**, monitor **certificate transparency**, and plan **key rotation** with zero downtime. For **zero-trust**, combine mTLS with **SPIFFE** identities and short-lived certs issued by workload attestation.

**Key Points (14.1.2)**

- TLS protects **transport**; it does not replace **authn/authz**.
- **HSTS** reduces SSL-stripping risk for browsers.
- Internal east-west traffic also needs encryption in regulated environments.

**Best Practices (14.1.2)**

- Redirect **HTTP→HTTPS** at the edge with permanent redirects for public sites.
- Use **443** only publicly; close management ports from the internet.

**Common Mistakes (14.1.2)**

- **Mixed content** (HTTPS page loading HTTP assets).
- Trusting `X-Forwarded-Proto` without a **trusted proxy** configuration.

---

### 14.1.3 CORS Security

#### Beginner

**CORS** lets browsers enforce which **origins** may read responses from your API. Misconfigured `Access-Control-Allow-Origin: *` with **credentials** is invalid and dangerous patterns often appear when copying snippets.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)
```

#### Intermediate

**Preflight** `OPTIONS` requests happen for non-simple requests; ensure middleware order places CORS **before** auth that might block OPTIONS incorrectly. Reflect **Vary: Origin** when responses differ per origin.

#### Expert

CORS is **not** a server-side access control for non-browser clients; **any** HTTP client can call your API. Treat CORS as **browser policy** only; enforce **auth** regardless.

**Key Points (14.1.3)**

- Restrict `allow_origins` to **known** frontends.
- Avoid `*` with cookies or `Authorization` unless you fully understand the tradeoff (usually disallow).

**Best Practices (14.1.3)**

- Separate **public** API CORS from **admin** portal CORS.
- Review CORS when adding **new** SPAs or mobile web shells.

**Common Mistakes (14.1.3)**

- Using `allow_origins=["*"]` with `allow_credentials=True` (browsers reject; if forced elsewhere, it's unsafe).
- Reflecting arbitrary **Origin** headers from attackers.

---

### 14.1.4 SQL Injection Prevention

#### Beginner

**SQL injection** tricks the database into executing attacker-controlled SQL. With ORMs and **bound parameters**, you avoid interpolating user strings into queries.

```python
from sqlalchemy import text

from fastapi import FastAPI

app = FastAPI()


@app.get("/users/by-email")
def by_email(email: str) -> dict[str, str]:
    # Good: bound parameters — values are never interpolated into SQL syntax.
    stmt = text("SELECT id, email FROM users WHERE email = :email").bindparams(email=email)
    _ = stmt  # In your app: await session.execute(stmt) with AsyncSession / connection
    return {"note": "Never build SQL with f-strings; use ORM or text() + bindparams"}
```

#### Intermediate

Even with SQLAlchemy, beware **raw SQL** fragments and dynamic `ORDER BY` built from user input. Whitelist **sort columns**; use **text()** with parameters, never concatenation.

#### Expert

Adopt **static query analysis**, **ORM lint rules**, and **read-only** DB roles for reporting. For **multi-tenant** schemas, validate tenant identifiers and use **row-level security** where supported.

**Key Points (14.1.4)**

- Parameters **bind** values; concatenation **merges** syntax.
- ORMs reduce risk but do not eliminate **raw SQL** footguns.

**Best Practices (14.1.4)**

- Code review any use of `.execute(f"...")`.
- Use **migrations** instead of runtime DDL from user input.

**Common Mistakes (14.1.4)**

- Building `WHERE` clauses with string **formatting**.
- Logging full SQL with **secrets** or PII.

---

### 14.1.5 XSS Prevention

#### Beginner

**XSS** injects scripts into pages consumed by browsers. JSON APIs are lower risk than server-rendered HTML, but **OpenAPI docs**, **error pages**, and **file uploads** can still be vectors if you mix HTML.

```python
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/echo", response_class=HTMLResponse)
def echo(q: str) -> str:
    # BAD example (do not do this):
    # return f"<p>{q}</p>"
    # GOOD: escape or avoid HTML; prefer JSON APIs
    from html import escape

    return f"<p>{escape(q)}</p>"
```

#### Intermediate

Set **Content-Security-Policy** at the edge for any HTML you serve. Use **HttpOnly** and **Secure** cookies for session IDs. Validate **Content-Type** on uploads.

#### Expert

Combine **CSP** with **nonce**-based scripts for SPAs you host. For **stored XSS** via rich text, use **allowlist** sanitizers (bleach alternatives in modern stacks) and **separate** content domains where feasible.

**Key Points (14.1.5)**

- FastAPI JSON responses are not magically XSS-proof if clients **inject** into DOM unsafely.
- **Encoding context** matters (HTML vs JS vs URL).

**Best Practices (14.1.5)**

- Prefer **templating** engines with auto-escaping for SSR.
- Educate frontend teams on **dangerouslySetInnerHTML** risks.

**Common Mistakes (14.1.5)**

- Reflecting query params into HTML **without** escaping.
- Serving user uploads with `Content-Disposition: inline` for HTML/SVG.

---

## 14.2 HTTP Basic Authentication

HTTP Basic sends **username:password** Base64-encoded in the `Authorization` header. It is simple but **leaks** if not over HTTPS and is unsuitable for user login in browsers without tight scoping.

### 14.2.1 HTTPBasic Scheme

#### Beginner

FastAPI’s `HTTPBasic` dependency parses the `Authorization: Basic ...` header and returns `HTTPBasicCredentials`.

```python
from fastapi import Depends, FastAPI
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI()
security = HTTPBasic()


@app.get("/whoami")
def whoami(creds: HTTPBasicCredentials = Depends(security)) -> dict[str, str]:
    return {"user": creds.username}
```

#### Intermediate

Set `auto_error=False` to distinguish **missing** vs **invalid** credentials and return custom **WWW-Authenticate** challenges.

#### Expert

Combine Basic with **mTLS** or **IP allowlists** for **machine-to-machine** scenarios; rotate passwords via **secrets manager** and **short TTL** service users.

**Key Points (14.2.1)**

- Basic is **standard** and easy to test with `curl -u`.
- Always require **TLS**; treat Base64 as **plaintext**.

**Best Practices (14.2.1)**

- Use for **internal** tools behind VPN or zero-trust, not public user accounts.

**Common Mistakes (14.2.1)**

- Storing Basic credentials in **browser history** or **logs**.

---

### 14.2.2 Username and Password

#### Beginner

`HTTPBasicCredentials` exposes `.username` and `.password` as strings. Validate against your user store using **constant-time** comparisons for secrets.

```python
import hmac

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI()
security = HTTPBasic()


def verify(creds: HTTPBasicCredentials) -> None:
    ok_user = hmac.compare_digest(creds.username, "service")
    ok_pass = hmac.compare_digest(creds.password, "long-random-secret")
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Basic"},
        )


@app.get("/secure/ping")
def ping(creds: HTTPBasicCredentials = Depends(security)) -> dict[str, str]:
    verify(creds)
    return {"ping": "pong"}
```

#### Intermediate

Do not log passwords. Use **pydantic** models for any **JSON** login separate from Basic.

#### Expert

For service users, prefer **OAuth2 client credentials** or **JWT** over long-lived Basic passwords when scaling teams.

**Key Points (14.2.2)**

- Use **`hmac.compare_digest`** to reduce timing leaks.
- Pair with **rate limiting** and **lockout** policies at the edge.

**Best Practices (14.2.2)**

- Enforce **password complexity** for human accounts; use **random** secrets for machines.

**Common Mistakes (14.2.2)**

- Using `==` on derived password hashes incorrectly (compare **hash** not plaintext).

---

### 14.2.3 Encoding Credentials

#### Beginner

Basic auth uses **Base64** encoding of `username:password`, **not** encryption. Anyone on the wire can decode if TLS is absent.

```python
import base64

raw = base64.b64encode(b"alice:secret").decode("ascii")
assert raw == "YWxpY2U6c2VjcmV0"
```

#### Intermediate

Explain to stakeholders: Base64 is for **transport framing**, not secrecy. Mandate TLS **1.2+** and monitor **downgrade** attempts.

#### Expert

For non-TLS internal links (discouraged), place Basic only inside **encrypted meshes** (IPsec/WireGuard/mTLS) and rotate creds frequently.

**Key Points (14.2.3)**

- Encoding ≠ encryption.
- **TLS** is mandatory for Basic in real networks.

**Best Practices (14.2.3)**

- Store **hashed** passwords server-side; Basic sends plaintext **once per request**—prefer tokens after initial login.

**Common Mistakes (14.2.3)**

- Calling Base64 “encryption” in documentation.

---

### 14.2.4 Validation

#### Beginner

Validate **username format**, **password policy**, and **account state** (locked/disabled) before accepting Basic auth for human accounts.

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI()
security = HTTPBasic()


@app.get("/account")
def account(creds: HTTPBasicCredentials = Depends(security)) -> dict[str, str]:
    if "@" in creds.username or len(creds.username) > 128:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username")
    return {"ok": "true"}
```

#### Intermediate

Return **401** with `WWW-Authenticate` for bad creds; use **429** with backoff headers when brute force detected.

#### Expert

Instrument **SIEM** alerts on Basic auth spikes; many attackers scan for default creds.

**Key Points (14.2.4)**

- Validation includes **rate-based** behavior, not only syntax.
- Do not reveal whether **username** exists for public internet forms (use generic errors).

**Best Practices (14.2.4)**

- Use **CAPTCHA** or **proof-of-work** only when abuse demands—balance UX.

**Common Mistakes (14.2.4)**

- Different error messages for **unknown user** vs **bad password** (user enumeration).

---

### 14.2.5 Use Cases

#### Beginner

Good fits: **dev-only** endpoints, **internal** admin tools, **simple** service-to-service when paired with network controls. Poor fit: public mobile apps with long sessions.

```python
from fastapi import APIRouter, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

router = APIRouter()
security = HTTPBasic()


@router.get("/internal/status")
def status(creds: HTTPBasicCredentials = Depends(security)) -> dict[str, str]:
    return {"role": "worker", "caller": creds.username}
```

#### Intermediate

Prefer **OAuth2 client credentials** for service APIs that need **scoped** tokens and **audience** checks.

#### Expert

For **Kubernetes** operators, combine Basic with **RBAC** tokens or **OIDC** at the ingress to avoid static passwords entirely.

**Key Points (14.2.5)**

- Basic is **acceptable** when threat model is constrained and TLS is guaranteed.
- Modern systems favor **bearer tokens** with rotation.

**Best Practices (14.2.5)**

- Rotate Basic passwords on **schedule** and on **personnel** changes.

**Common Mistakes (14.2.5)**

- Exposing Basic-protected routes on **0.0.0.0** without firewall rules.

---

## 14.3 Bearer Authentication

Bearer schemes send an **opaque** or **structured** token in `Authorization: Bearer <token>`. This pattern underpins **JWT**, **OAuth2**, and many **API keys**.

### 14.3.1 HTTPBearer Scheme

#### Beginner

`HTTPBearer` extracts the bearer token or returns **403** by default when missing (FastAPI/Starlette security behavior—verify version defaults; often 403 for HTTPBearer missing).

```python
from fastapi import Depends, FastAPI
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()


@app.get("/api/me")
def me(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict[str, str]:
    return {"scheme": creds.scheme, "token_prefix": creds.credentials[:6] + "..."}
```

#### Intermediate

Use `auto_error=False` to implement **optional** auth (public + enhanced for logged-in users).

#### Expert

Combine with **DPoP** or **mTLS sender-constrained tokens** in high-assurance environments.

**Key Points (14.3.1)**

- Bearer tokens must be **kept secret**—whoever holds it is the client until expiry/revocation.
- Prefer **short TTL** + **refresh** for interactive users.

**Best Practices (14.3.1)**

- Reject non-Bearer schemes explicitly when using `HTTPAuthorizationCredentials`.

**Common Mistakes (14.3.1)**

- Logging full **Authorization** headers.

---

### 14.3.2 Bearer Tokens

#### Beginner

Tokens may be **opaque** (random string mapped server-side) or **self-contained** (JWT). Opaque tokens simplify **revocation**; JWTs simplify **horizontal scaling** with **signature** verification costs.

```python
import secrets

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()

STORE: dict[str, str] = {}


@app.post("/tokens")
def mint(sub: str) -> dict[str, str]:
    t = secrets.token_urlsafe(32)
    STORE[t] = sub
    return {"access_token": t, "token_type": "bearer"}


@app.get("/sub")
def subject(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict[str, str]:
    sub = STORE.get(creds.credentials)
    if sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {"sub": sub}
```

#### Intermediate

Return **token_type** `bearer` in OAuth2-style responses for client library compatibility.

#### Expert

Define **audience** and **scopes** inside token metadata or introspection results consistently across microservices.

**Key Points (14.3.2)**

- Treat bearer tokens like **passwords** on the wire—TLS only.
- Choose **opaque vs JWT** based on **revocation** and **latency** needs.

**Best Practices (14.3.2)**

- Use **cryptographically strong** random token generators (`secrets` module).

**Common Mistakes (14.3.2)**

- Embedding **PII** in JWT without encryption (JWE) when tokens leak to clients.

---

### 14.3.3 Token Management

#### Beginner

Manage **issuance**, **storage**, **rotation**, and **revocation**. For first-party SPAs, prefer **HttpOnly cookies** or **backend-for-frontend** patterns over long-lived tokens in `localStorage`.

```python
from datetime import UTC, datetime, timedelta

from fastapi import FastAPI

app = FastAPI()

REVOKED: set[str] = set()


def revoke(token: str) -> None:
    REVOKED.add(token)


def is_active(token: str, issued_at: datetime, ttl: timedelta) -> bool:
    if token in REVOKED:
        return False
    return datetime.now(UTC) - issued_at < ttl
```

#### Intermediate

Implement **refresh tokens** with **rotation** (new refresh on each use) to detect **reuse** (possible theft).

#### Expert

Centralize **token service** with **HSM**-backed signing keys, **kid** rotation, and **global revocation** events via pub/sub.

**Key Points (14.3.3)**

- **Storage location** on the client drives XSS/CSRF tradeoffs.
- **Rotation** limits exposure window after compromise.

**Best Practices (14.3.3)**

- Monitor **anomalous** token usage (geo, velocity).

**Common Mistakes (14.3.3)**

- Never expiring **API keys** tied to user accounts.

---

### 14.3.4 Token Validation

#### Beginner

Validate **signature** (JWT), **expiry**, **issuer**, **audience**, and **not-before**. For opaque tokens, **lookup** in DB/cache.

```python
# Pseudocode outline for JWT validation with PyJWT (pip install PyJWT)
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()


def decode_jwt(token: str) -> dict:
    try:
        # return jwt.decode(token, key, algorithms=["RS256"], audience="my-api", issuer="https://idp")
        return {"sub": "user-1"}
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


@app.get("/jwt-protected")
def jwt_route(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict[str, str]:
    claims = decode_jwt(creds.credentials)
    return {"sub": claims["sub"]}
```

#### Intermediate

Cache **JWKS** with **ETag**/`Cache-Control` respect; handle **key rotation** via `kid` header.

#### Expert

Implement **step-up** authentication claims for sensitive operations (fresh `amr`/`acr`).

**Key Points (14.3.4)**

- **Alg=none** and **HS256** confusion attacks are classic—pin allowed algorithms.
- Validate **aud** to prevent **token relay** across services.

**Best Practices (14.3.4)**

- Use **asymmetric** keys for multi-service verification.

**Common Mistakes (14.3.4)**

- Trusting **unverified** JWT payloads for authorization decisions.

---

### 14.3.5 Best Practices

#### Beginner

Use **short-lived access tokens**, **scoped** permissions, **HTTPS** only, and **secure** client storage patterns.

```python
from fastapi import FastAPI
from fastapi.security import HTTPBearer

app = FastAPI()
HTTPBearer(auto_error=True)


@app.middleware("http")
async def security_headers(request, call_next):
    r = await call_next(request)
    r.headers["X-Content-Type-Options"] = "nosniff"
    return r
```

#### Intermediate

Add **binding** between token and client fingerprint only when it improves your threat model without breaking legit users.

#### Expert

Adopt **OAuth 2.1** guidance: PKCE for public clients, no implicit flow, strict redirect URI matching.

**Key Points (14.3.5)**

- **Least privilege** scopes reduce impact of token theft.
- **Monitoring** and **revocation** complete the lifecycle.

**Best Practices (14.3.5)**

- Automate **key rotation** drills quarterly.

**Common Mistakes (14.3.5)**

- Putting **database primary keys** in JWT `sub` without stable **subject** identifiers.

---

## 14.4 OAuth2 Authentication

OAuth2 delegates **authorization** to an **authorization server** issuing **access tokens** for **resource servers**. FastAPI ships utilities like `OAuth2PasswordBearer` mainly for **documentation** and dependency wiring—production flows need careful hardening.

### 14.4.1 OAuth2 Flow

#### Beginner

Common flows: **Authorization Code** (with **PKCE** for public clients), **Client Credentials** (M2M), **Device Code** (TV/CLI). Avoid the legacy **implicit** flow for new apps.

```python
# Authorization Code + PKCE (simplified illustration)
from fastapi import FastAPI

app = FastAPI()


@app.get("/oauth/callback")
def callback(code: str, state: str) -> dict[str, str]:
    # Exchange code at token endpoint with client_secret (confidential) or PKCE verifier (public)
    return {"code": code[:8] + "...", "state": state}
```

#### Intermediate

Validate **`state`** against CSRF for browser redirects. Enforce **exact** redirect URI matching.

#### Expert

Use **PAR** (Pushed Authorization Requests) and **JAR** for high-security clients to reduce request tampering.

**Key Points (14.4.1)**

- OAuth2 solves **delegated authorization**, not authentication—**OIDC** adds identity.
- **PKCE** is required for native/SPA public clients.

**Best Practices (14.4.1)**

- Prefer **auth code** flow with **short-lived** access tokens.

**Common Mistakes (14.4.1)**

- Long-lived **refresh tokens** in public clients without rotation.

---

### 14.4.2 OAuth2PasswordBearer

#### Beginner

`OAuth2PasswordBearer` declares where clients obtain tokens (`tokenUrl`) and integrates with OpenAPI **OAuth2 password** flow (mostly for **simple demos**).

```python
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@app.get("/items")
def items(token: str = Depends(oauth2_scheme)) -> dict[str, str]:
    return {"token_tail": token[-4:]}
```

#### Intermediate

The password flow is **discouraged** for third parties; use **authorization code** with your IdP instead.

#### Expert

If you must support **legacy** password flow internally, wrap it with **MFA**, **IP allowlists**, and **short TTL**.

**Key Points (14.4.2)**

- Great for **tutorials**; scrutinize for production internet exposure.
- `tokenUrl` should match your actual **token** route.

**Best Practices (14.4.2)**

- Combine with **rate limiting** and **credential stuffing** protections.

**Common Mistakes (14.4.2)**

- Exposing **client_secret** in SPA bundles.

---

### 14.4.3 OAuth2PasswordRequestForm

#### Beginner

`OAuth2PasswordRequestForm` parses `application/x-www-form-urlencoded` bodies with `username`, `password`, `scope`, `grant_type`.

```python
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordRequestForm

app = FastAPI()


@app.post("/token")
def token(form: OAuth2PasswordRequestForm = Depends()) -> dict[str, str]:
    # Validate user/password, issue token (demo only)
    if form.username == "alice" and form.password == "wonderland":
        return {"access_token": "demo", "token_type": "bearer"}
    from fastapi import HTTPException, status

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
```

#### Intermediate

Return **refresh_token** only over **secure** channels; rotate refresh tokens on use for confidential clients.

#### Expert

Log **authentication** attempts with **privacy** preservation (hash username, no password logging).

**Key Points (14.4.3)**

- Form class matches **OAuth2** token endpoint expectations in OpenAPI.
- Always **hash** passwords; never compare plaintext in real systems.

**Best Practices (14.4.3)**

- Use **Argon2/bcrypt** for password verification (see 14.8).

**Common Mistakes (14.4.3)**

- Issuing **JWTs** without `exp` or with excessive `ttl`.

---

### 14.4.4 Scopes

#### Beginner

OAuth2 **scopes** limit what a token can access. Declare scopes on the bearer scheme for docs; validate at runtime.

```python
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

app = FastAPI()
oauth2 = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={"items:read": "Read", "items:write": "Write"},
)


@app.get("/items")
def list_items(scopes: SecurityScopes = SecurityScopes(scopes=["items:read"])) -> dict:
    _ = scopes
    return {"items": []}
```

#### Intermediate

Use **resource indicators** (RFC 8707) when multiple APIs share an authorization server.

#### Expert

Implement **consent** screens mapping scopes to user-understandable descriptions for GDPR-friendly UX.

**Key Points (14.4.4)**

- Scopes are **coarse**; pair with **authorization** inside services for row-level rules.
- Keep **stable** scope identifiers for client compatibility.

**Best Practices (14.4.4)**

- Test **insufficient_scope** errors in integration suites.

**Common Mistakes (14.4.4)**

- Encoding **tenant** or **user id** inside scope strings—use **claims** instead.

---

### 14.4.5 Token Exchange

#### Beginner

**RFC 8693** token exchange lets a client trade one token for another (e.g., **subject** token for **delegated** token). Useful in **B2B** federation.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ExchangeBody(BaseModel):
    grant_type: str
    subject_token: str
    subject_token_type: str
    audience: str


@app.post("/oauth/token")
def oauth_token(body: ExchangeBody) -> dict[str, str]:
    if body.grant_type != "urn:ietf:params:oauth:grant-type:token-exchange":
        return {"error": "unsupported_grant_type"}
    return {"access_token": "exchanged", "token_type": "Bearer", "expires_in": 300}
```

#### Intermediate

Validate **actor** vs **subject** tokens for **impersonation** audits in admin tools.

#### Expert

Implement **delegation chains** with **maximum depth** and **cryptographic** proof-of-possession where required.

**Key Points (14.4.5)**

- Token exchange supports **complex** enterprise topologies.
- Misconfiguration can enable **privilege escalation**—test thoroughly.

**Best Practices (14.4.5)**

- Log **exchange** events with **both** subject and audience.

**Common Mistakes (14.4.5)**

- Accepting arbitrary `audience` values without **allowlists**.

---
## 14.5 JWT (JSON Web Tokens)

JWTs are **signed** (JWS) or **encrypted** (JWE) compact tokens with **header.payload.signature**. They are **not inherently more secure**—misuse is common.

### 14.5.1 JWT Structure

#### Beginner

A JWT has three Base64URL parts separated by dots: **header** (algorithm, type, `kid`), **payload** (claims), **signature**.

```python
import json
import base64


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


header = {"alg": "HS256", "typ": "JWT"}
payload = {"sub": "user-1", "exp": 9999999999}
h = b64url(json.dumps(header, separators=(",", ":")).encode())
p = b64url(json.dumps(payload, separators=(",", ":")).encode())
print(f"{h}.{p}.signature_goes_here")
```

#### Intermediate

Distinguish **JWS** (integrity) from **JWE** (confidentiality). Public clients should not receive **sensitive** claims without JWE.

#### Expert

Use **asymmetric** signing (`RS256`, `ES256`) with **JWKS** publishing; track **`kid`** rotation and **grace periods**.

**Key Points (14.5.1)**

- Anyone can **read** JWS payloads—do not put secrets inside.
- **Alg** header must be **validated** against an allowlist.

**Best Practices (14.5.1)**

- Prefer **short** JWT lifetimes with refresh for interactive sessions.

**Common Mistakes (14.5.1)**

- Using **`none`** algorithm or accepting **`alg` confusion** across key types.

---

### 14.5.2 JWT Creation

#### Beginner

Use **PyJWT** or **python-jose** (maintained fork) to create tokens with explicit **`exp`**, **`iat`**, **`iss`**, **`aud`**.

```python
import time

import jwt

SECRET = "dev-only-change"  # use real key management in prod


def mint_access(sub: str, ttl_sec: int = 900) -> str:
    now = int(time.time())
    payload = {
        "sub": sub,
        "iat": now,
        "exp": now + ttl_sec,
        "iss": "https://auth.example.com",
        "aud": "https://api.example.com",
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")


token = mint_access("alice")
print(token.split(".")[0])  # header part exists
```

#### Intermediate

Include **`jti`** for **replay** detection when using one-time tokens (password reset, email verification).

#### Expert

Use **KMS/HSM** for signing keys; automate **keygen**, **distribution**, and **retirement** with monitoring.

**Key Points (14.5.2)**

- Always set **`exp`**; consider **`nbf`** for scheduled validity.
- Sign with **strong** keys and **modern** algorithms.

**Best Practices (14.5.2)**

- Keep **clock skew** tolerance small but non-zero when validating.

**Common Mistakes (14.5.2)**

- Signing with **symmetric** keys shared across many teams/services without rotation discipline.

---

### 14.5.3 JWT Validation

#### Beginner

Validate **signature**, **`exp`**, **`iss`**, **`aud`**, and algorithm allowlist on **every** request in the resource server.

```python
import jwt
from jwt import InvalidTokenError

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()
SECRET = "dev-only-change"


def decode_token(raw: str) -> dict:
    try:
        return jwt.decode(
            raw,
            SECRET,
            algorithms=["HS256"],
            audience="https://api.example.com",
            issuer="https://auth.example.com",
        )
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


@app.get("/demo-validate")
def demo_validate(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict[str, str]:
    claims = decode_token(creds.credentials)
    return {"sub": claims["sub"]}
```

#### Intermediate

Fetch **JWKS** asynchronously with caching for **RS256** verification; handle **`kid`** not found (retry once).

#### Expert

Implement **at+jwt** access token profiles and **cnf** claims for **proof-of-possession** when required.

**Key Points (14.5.3)**

- **Never** trust decoded payload without verified signature.
- Pin **`algorithms=[...]`** explicitly in PyJWT.

**Best Practices (14.5.3)**

- Separate **validation** code from **business** handlers via dependencies.

**Common Mistakes (14.5.3)**

- Skipping **`aud`** validation enabling **cross-service** token reuse.

---

### 14.5.4 JWT Payload

#### Beginner

Common claims: **`sub`** (subject), **`exp`**, **`iat`**, **`iss`**, **`aud`**, **`scope`/`scp`**, **`roles`**. Keep payloads **small** to fit headers and caches.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/claims-example")
def claims_example() -> dict[str, list[str] | str]:
    return {
        "sub": "auth0|123",
        "scope": "items:read items:write",
        "roles": ["billing", "support"],
    }
```

#### Intermediate

Avoid **PII** in JWTs shown to third-party clients; use **opaque** identifiers mapping server-side.

#### Expert

Use **namespaced** claims (`https://example.com/claims/tenant_id`) to avoid collisions in federated setups.

**Key Points (14.5.4)**

- Payload is **visible** to client holders—treat as **public** unless JWE.
- **Custom** claims need **schema** governance.

**Best Practices (14.5.4)**

- Version claim schemas when doing **breaking** migrations.

**Common Mistakes (14.5.4)**

- Storing **authorization** too richly in JWT without **revocation** story.

---

### 14.5.5 Token Expiration

#### Beginner

Short **access token TTL** (minutes) + **refresh** (longer, rotatable) balances UX and security.

```python
from datetime import UTC, datetime, timedelta

from fastapi import FastAPI, HTTPException, status

app = FastAPI()


def assert_fresh(iat: datetime, max_age: timedelta) -> None:
    if datetime.now(UTC) - iat > max_age:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token too old")


@app.get("/sensitive")
def sensitive() -> dict[str, str]:
    assert_fresh(datetime.now(UTC), timedelta(minutes=15))
    return {"ok": "true"}
```

#### Intermediate

Use **sliding sessions** carefully—they extend exposure if refresh tokens are stolen; prefer **re-auth** for sensitive actions.

#### Expert

Implement **absolute session lifetime** caps regardless of refresh activity for high-risk industries.

**Key Points (14.5.5)**

- **`exp`** should be enforced with **small** clock skew leeway.
- **Refresh** rotation detects **reuse** attacks.

**Best Practices (14.5.5)**

- Communicate **expires_in** to clients for proactive refresh.

**Common Mistakes (14.5.5)**

- Issuing **year-long** JWT access tokens for convenience.

---

## 14.6 OpenID Connect

**OIDC** is OAuth2 **plus identity**: **ID Token** (JWT for authentication), **UserInfo**, standardized **discovery** and **JWKS**.

### 14.6.1 OIDC Overview

#### Beginner

OIDC adds **`openid` scope**, **ID token** validation, and **standard claims** (`email`, `name`). Your FastAPI API often validates **access tokens** while a frontend completes **OIDC login** with an IdP.

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/.well-known/openid-configuration")
def discovery_stub() -> dict[str, str]:
    return {
        "issuer": "https://idp.example.com",
        "authorization_endpoint": "https://idp.example.com/authorize",
        "token_endpoint": "https://idp.example.com/token",
        "jwks_uri": "https://idp.example.com/jwks.json",
    }
```

#### Intermediate

Prefer **OIDC libraries** on the client; on the API, trust **JWT access tokens** minted by the same IdP with correct **`aud`**.

#### Expert

Implement **RP-initiated logout**, **back-channel logout**, and **session management** for enterprise SSO.

**Key Points (14.6.1)**

- OIDC **authenticates** users; OAuth2 **authorizes** delegated access—often used together.
- **Discovery** reduces integration misconfiguration.

**Best Practices (14.6.1)**

- Pin **issuer** string **exactly** as published.

**Common Mistakes (14.6.1)**

- Treating **ID token** as **API access token** for your resource server.

---

### 14.6.2 ID Tokens

#### Beginner

**ID tokens** prove authentication events to the **client**. Validate **`iss`**, **`aud` (client_id)**, **`exp`**, **`nonce`** (for implicit/hybrid flows), and signature.

```python
# Illustrative validation checklist (pseudo)
checks = {
    "signature": "JWKS",
    "iss": "matches discovery",
    "aud": "contains your client_id",
    "exp": "future skew ok",
    "nonce": "matches original auth request",
}
print(checks)
```

#### Intermediate

Understand **`at_hash`** linkage between ID token and authorization code flow access tokens.

#### Expert

Handle **multiple audiences** for **federated** clients; reject unexpected **`azp`** patterns per your threat model.

**Key Points (14.6.2)**

- ID tokens are **not** substitutes for **access tokens** at APIs.
- **`nonce`** prevents **replay** in browser flows.

**Best Practices (14.6.2)**

- Log authentication **events**, not raw tokens.

**Common Mistakes (14.6.2)**

- Sending ID token to **your** API as bearer without **`aud`** meant for the API.

---

### 14.6.3 User Info Endpoint

#### Beginner

The **UserInfo** endpoint returns claims about the authenticated user when presented with a valid **access token** containing the right scopes.

```python
from fastapi import FastAPI, Header, HTTPException, status

app = FastAPI()


@app.get("/userinfo")
def userinfo(authorization: str | None = Header(default=None)) -> dict[str, str]:
    if authorization != "Bearer good":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {"sub": "user-1", "email": "user@example.com"}
```

#### Intermediate

Cache UserInfo sparingly; **email_verified** should drive **high-risk** actions.

#### Expert

Combine UserInfo with **SCIM** provisioning for enterprise **joiner/mover/leaver** automation.

**Key Points (14.6.3)**

- UserInfo complements **ID token** claims; reconcile **conflicts** carefully.
- Rate limit to prevent **enumeration**.

**Best Practices (14.6.3)**

- Return **minimal** claims by default; expand with scopes.

**Common Mistakes (14.6.3)**

- Exposing **admin-only** attributes via UserInfo without **scope** checks.

---

### 14.6.4 Discovery Endpoint

#### Beginner

`/.well-known/openid-configuration` publishes endpoints and capabilities. Fetch once (cached) to configure validators dynamically.

```python
import httpx

from fastapi import FastAPI

app = FastAPI()


@app.get("/setup/jwks")
async def jwks() -> dict:
    async with httpx.AsyncClient() as client:
        doc = (await client.get("https://idp.example.com/.well-known/openid-configuration")).json()
        jwks = (await client.get(doc["jwks_uri"])).json()
        return {"keys": jwks.get("keys", [])[:1]}
```

#### Intermediate

Respect **cache headers**; pin **issuer** and **JWKS** fingerprints in high-security deployments (with rotation plan).

#### Expert

Monitor **discovery** availability as **SLO**; fallback to **cached** config with **staleness** alerts.

**Key Points (14.6.4)**

- Discovery reduces **hardcoded** URL drift across environments.
- Always **HTTPS** with **cert validation**.

**Best Practices (14.6.4)**

- Use **environment-specific** issuers (dev/stage/prod).

**Common Mistakes (14.6.4)**

- Disabling **TLS verification** in scripts that fetch discovery/JWKS.

---

### 14.6.5 OIDC Providers

#### Beginner

Examples: **Auth0**, **Okta**, **Azure AD**, **Google**, **Keycloak**, **AWS Cognito**. FastAPI integrates as an **OAuth2/OIDC resource server** validating JWTs from the provider.

```python
from fastapi import Depends, FastAPI
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()


@app.get("/secure")
def secure(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict[str, str]:
    return {"len": str(len(creds.credentials))}
```

#### Intermediate

Map provider **groups** to **application roles** at login; refresh mapping on **token refresh** if claims change.

#### Expert

Implement **tenant-specific** issuers for multi-tenant IdPs; cache **per-tenant** JWKS securely.

**Key Points (14.6.5)**

- Provider quirks differ in **claim** names and **scope** behavior—**normalize** early.
- Plan **vendor lock-in** mitigations with **standard** OIDC features.

**Best Practices (14.6.5)**

- Maintain **runbooks** for provider outages (cached keys, graceful degradation policies).

**Common Mistakes (14.6.5)**

- Hardcoding **single** global `audience` when the IdP issues **per-API** audiences.

---

## 14.7 Advanced Authentication

Beyond passwords and bearer tokens, real systems add **MFA**, **social login**, **SAML**, **custom schemes**, and **middleware**-level controls.

### 14.7.1 Multi-Factor Authentication

#### Beginner

MFA combines **something you know** (password) with **something you have** (TOTP app, WebAuthn device) or **something you are** (biometrics via platform).

```python
# pip install pyotp
import pyotp

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()

SECRET = pyotp.random_base32()
totp = pyotp.TOTP(SECRET)


class Login(BaseModel):
    user: str
    password: str
    otp: str


@app.post("/login-mfa")
def login_mfa(body: Login) -> dict[str, str]:
    if body.password != "correct horse battery staple":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    if not totp.verify(body.otp, valid_window=1):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="bad otp")
    return {"access_token": "issued", "token_type": "bearer"}
```

#### Intermediate

Use **time-synced** TOTP with **recovery codes** stored **hashed**. Prefer **WebAuthn/FIDO2** for phishing resistance.

#### Expert

Risk-based **step-up**: require MFA when **new device**, **impossible travel**, or **sensitive** transaction.

**Key Points (14.7.1)**

- MFA reduces **credential stuffing** impact dramatically.
- SMS OTP is **weaker** than app/WebAuthn—discourage for high risk.

**Best Practices (14.7.1)**

- Enroll **multiple** factors; provide **account recovery** with strong verification.

**Common Mistakes (14.7.1)**

- Allowing **MFA bypass** via legacy **API** endpoints.

---

### 14.7.2 Social Login Integration

#### Beginner

Delegate login to **Google/GitHub** using **OAuth2/OIDC**. Your FastAPI backend exchanges **code** for tokens server-side and **links** social `sub` to internal user rows.

```python
from fastapi import APIRouter

router = APIRouter()


@router.get("/login/github/callback")
def github_callback(code: str) -> dict[str, str]:
    # Exchange code with client_id/secret on server; never in browser
    return {"linked": "user_internal_42", "oauth_code_prefix": code[:6]}
```

#### Intermediate

Verify **`nonce`/`state`**, handle **email changes** at provider, and require **email verification** before trust.

#### Expert

Support **account linking** carefully to avoid **pre-account takeover** via unverified emails.

**Key Points (14.7.2)**

- Social login shifts **trust** to the IdP—still **authorize** in your app.
- Store **provider + subject** tuples uniquely.

**Best Practices (14.7.2)**

- Offer **passwordless** where appropriate but keep **recovery** paths.

**Common Mistakes (14.7.2)**

- Creating duplicate users when the same person logs in with **different** providers.

---

### 14.7.3 SAML Authentication

#### Beginner

**SAML** is XML-based federation common in enterprises (**SSO**). Typically handled by a **reverse proxy** or **dedicated service** that sets a session cookie; FastAPI sees an **already authenticated** user.

```python
from fastapi import FastAPI, Header, HTTPException, status

app = FastAPI()


@app.get("/saml-protected")
def saml_protected(x_remote_user: str | None = Header(default=None, alias="X-Remote-User")) -> dict[str, str]:
    if not x_remote_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {"user": x_remote_user}
```

#### Intermediate

Validate **Assertion** signatures, **conditions** (`NotOnOrAfter`), **AudienceRestriction**, and **Recipient** URL.

#### Expert

Implement **SP-initiated** flows, **metadata** rotation, and **logout** (SLO) with clear **session** invalidation.

**Key Points (14.7.3)**

- Prefer **battle-tested** SAML libraries or gateways—XML crypto is error-prone.
- **Clock skew** breaks SAML—monitor NTP.

**Best Practices (14.7.3)**

- Keep **private keys** in HSM/KMS; rotate **certificates** with overlap.

**Common Mistakes (14.7.3)**

- Trusting **`X-Remote-User`** from the internet without **mTLS** at the edge.

---

### 14.7.4 Custom Authentication

#### Beginner

Implement custom schemes via **`HTTPBearer(auto_error=False)`**, parsing **API keys** from headers or query (discouraged for secrets), or **`Security`**.

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import APIKeyHeader

app = FastAPI()
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


@app.get("/data")
def data(key: str | None = Depends(api_key_header)) -> dict[str, str]:
    if key != "supersecretkey":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {"rows": 3}
```

#### Intermediate

Use **`APIKeyCookie`** only with **CSRF** protections for browser clients.

#### Expert

Design **versioned** auth schemes; provide **SDK** helpers so clients do not mis-wire headers.

**Key Points (14.7.4)**

- Custom schemes need **clear** docs and **consistent** error semantics.
- Avoid **API keys** in **query strings**—they leak via logs/referrers.

**Best Practices (14.7.4)**

- Rate limit **API key** endpoints aggressively.

**Common Mistakes (14.7.4)**

- Using **predictable** API keys or embedding **user ids** without secrets.

---

### 14.7.5 Authentication Middleware

#### Beginner

Middleware can enforce **presence** of credentials, **parse** tokens into **request.state**, or **reject** early.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from fastapi import FastAPI

app = FastAPI()


class AttachUserMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("authorization", "")
        if auth.startswith("Bearer "):
            request.state.user = {"token": auth.removeprefix("Bearer ").strip()}
        return await call_next(request)


app.add_middleware(AttachUserMiddleware)
```

#### Intermediate

Keep middleware **fast**; do **heavy** crypto verification in dependencies with **caching** where safe.

#### Expert

Propagate **W3C traceparent** and **baggage** alongside auth context for **observability**.

**Key Points (14.7.5)**

- Middleware runs **outside** route matching—great for **cross-cutting** extraction, not **resource** authz.
- Order relative to **CORS**, **gzip**, **HTTPS redirect** matters.

**Best Practices (14.7.5)**

- Unit-test middleware with **Starlette** TestClient.

**Common Mistakes (14.7.5)**

- Storing **large** objects on `request.state` without lifecycle clarity.

---

## 14.8 Password Management

Passwords remain common for **first-party** accounts. **Never store plaintext**. Use **slow hashes** and **secure reset** flows.

### 14.8.1 Password Hashing

#### Beginner

Hashing is **one-way** (with salt and modern algorithms). Verification **re-hashes** the candidate with stored parameters.

```python
import hashlib
import os

# Illustration only—use bcrypt/argon2 in production (see 14.8.2)


def naive_hash(password: str) -> tuple[bytes, bytes]:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600_000)
    return salt, dk
```

#### Intermediate

Prefer **Argon2id** (memory-hard) or **bcrypt** with appropriate **work factors** tuned to your hardware.

#### Expert

Isolate hashing to **worker** processes with **CPU quotas** to prevent **DoS** via login storms.

**Key Points (14.8.1)**

- **Salt** prevents rainbow tables; **pepper** (secret key) adds defense if DB leaks (store pepper in KMS).
- **Work factor** must increase over years as hardware improves.

**Best Practices (14.8.1)**

- Migrate users **transparently** on login to stronger algorithms.

**Common Mistakes (14.8.1)**

- Using **fast** hashes (MD5/SHA256 alone) for passwords.

---

### 14.8.2 bcrypt Integration

#### Beginner

Use **`passlib`** with **`bcrypt`** backend or **`bcrypt`** directly. Hash on registration; verify on login.

```python
import bcrypt

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

USER_HASHES: dict[str, bytes] = {}


class Register(BaseModel):
    email: str
    password: str


@app.post("/register")
def register(body: Register) -> dict[str, str]:
    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt(rounds=12))
    USER_HASHES[body.email] = hashed
    return {"status": "ok"}


@app.post("/login")
def login(body: Register) -> dict[str, str]:
    stored = USER_HASHES.get(body.email)
    ok = stored is not None and bcrypt.checkpw(body.password.encode(), stored)
    return {"ok": str(ok)}
```

#### Intermediate

Truncate passwords to **72 bytes** for bcrypt or document behavior; consider **pre-hashing** controversies carefully—usually prefer **argon2**.

#### Expert

Use **per-user salts** always; store **algorithm id** and **cost** parameters for future upgrades.

**Key Points (14.8.2)**

- bcrypt is **battle-tested**; tune **rounds** with benchmarks (e.g., ~250ms target).
- Constant-time compare is handled by **`checkpw`**.

**Best Practices (14.8.2)**

- Never log **passwords** or **hashes** in application logs.

**Common Mistakes (14.8.2)**

- Comparing **strings** with `==` on **digest** outputs without constant-time helpers when rolling custom schemes.

---

### 14.8.3 Password Validation Rules

#### Beginner

Enforce **minimum length** (NIST recommends long passwords over complex short ones), block **known breached** passwords where feasible, and validate with **Pydantic**.

```python
import re

from pydantic import BaseModel, field_validator


class PasswordModel(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("too short")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("need letters and digits")
        return v
```

#### Intermediate

Integrate **Have I Been Pwned** k-anonymity API with **privacy** preserved (hash prefix).

#### Expert

Adapt rules to **risk**—admin accounts stricter; avoid **arbitrary** composition rules that reduce usability without security gains.

**Key Points (14.8.3)**

- **UX** matters: allow **password managers** and **spaces** in passphrases.
- Validate **server-side** always.

**Best Practices (14.8.3)**

- Provide **strength meter** on client as **hint** only.

**Common Mistakes (14.8.3)**

- Maximum length limits that break **passphrases** without technical reason.

---

### 14.8.4 Password Reset Flow

#### Beginner

Issue **single-use**, **short-lived** tokens sent **only** to verified email/SMS. Invalidate **sessions** on reset.

```python
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

RESETS: dict[str, tuple[str, datetime]] = {}


class Forgot(BaseModel):
    email: str


@app.post("/forgot")
def forgot(body: Forgot) -> dict[str, str]:
    token = secrets.token_urlsafe(32)
    RESETS[token] = (body.email, datetime.now(UTC) + timedelta(minutes=30))
    # send email with link containing token (not logged)
    return {"status": "if_exists"}


class Reset(BaseModel):
    token: str
    new_password: str


@app.post("/reset")
def reset(body: Reset) -> dict[str, str]:
    row = RESETS.get(body.token)
    if not row or row[1] < datetime.now(UTC):
        return {"status": "invalid"}
    del RESETS[body.token]
    return {"status": "password_updated"}
```

#### Intermediate

Throttle **forgot** requests per IP/email; avoid revealing **whether email exists**.

#### Expert

Audit **reset** events; require **re-login** everywhere; notify user on **successful** reset.

**Key Points (14.8.4)**

- Reset tokens are **bearer secrets**—treat like session IDs.
- Never **embed** passwords in reset links.

**Best Practices (14.8.4)**

- Use **POST** endpoints for final password change, not **GET**.

**Common Mistakes (14.8.4)**

- Long-lived **reset links** stored in browser history.

---

### 14.8.5 Secure Password Storage

#### Beginner

Store **only** hashes, **unique salts**, and **parameters**. Protect DB backups with **encryption** and **access controls**.

```python
# Database row sketch (SQLAlchemy-style pseudo-columns)
row = {
    "email": "user@example.com",
    "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$...",
    "password_algo": "argon2id",
    "password_params": {"m": 65536, "t": 3, "p": 4},
}
print(row["password_algo"])
```

#### Intermediate

Encrypt **at rest** database volumes; restrict **DB user** privileges (no `SELECT *` from prod by dev laptops).

#### Expert

Implement **HSM-wrapped** keys for **pepper**; rotate **encryption keys** with **re-encryption** strategies.

**Key Points (14.8.5)**

- **Backups** and **replicas** are part of the threat surface.
- **Separation of duties** between app and DBA roles.

**Best Practices (14.8.5)**

- Periodic **restore drills** to verify backup integrity.

**Common Mistakes (14.8.5)**

- Storing **OAuth tokens** alongside password hashes without **additional** protection.


The numbered sections **14.1** through **14.8** each contain **five** subtopics (forty subtopics total in this chapter), aligned with the security lifecycle from transport hardening through credential storage.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- **Transport security (TLS)** and **application security** are complementary; neither replaces the other.
- **Authentication** proves identity; **tokens** (opaque/JWT/OAuth2) must be **validated** with correct **`aud`/`iss`/`exp`** semantics.
- **HTTP Basic** is acceptable only in **narrow** contexts with **TLS** and **rotation** discipline.
- **OIDC** standardizes identity on top of OAuth2; distinguish **ID tokens** from **API access tokens**.
- **Passwords** require **slow hashes**, **secure reset**, and **MFA** for meaningful assurance in internet threat models.

### Chapter Best Practices

- Centralize **crypto** and **token validation** in well-tested dependencies.
- Use **short-lived** access tokens, **scoped** permissions, and **observability** around auth failures.
- Apply **security headers** (HSTS, CSP for HTML), strict **CORS**, and **parameterized** database access.
- Integrate with **mature IdPs** for OIDC/SAML rather than rolling crypto protocols from scratch.
- Maintain **incident** playbooks: revoke tokens, rotate keys, force password resets when needed.

### Chapter Common Mistakes

- Trusting **client-side** auth checks only.
- Misconfigured **CORS** and **cookies** leading to **CSRF** or **credential** leaks.
- **JWT** misuse: missing **`aud`**, long **TTL**, sensitive claims without **JWE**.
- Logging **tokens** and **passwords**.
- Confusing **encoding (Base64)** with **encryption**, or **OAuth2** with **authentication** alone.

---
