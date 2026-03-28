# Security in Python Applications

Input validation, cryptography, authentication, authorization, web hardening, and secure coding practices protect **APIs**, **SaaS** platforms, **fintech** services, and **ML** systems that handle sensitive data.

---

## 📑 Table of Contents

1. [31.1 Input validation](#311-input-validation)
   - [31.1.1 Validating untrusted input](#3111-validating-untrusted-input)
   - [31.1.2 Type checking](#3112-type-checking)
   - [31.1.3 Range constraints](#3113-range-constraints)
   - [31.1.4 Format validation](#3114-format-validation)
   - [31.1.5 Sanitization vs validation](#3115-sanitization-vs-validation)
2. [31.2 Encryption and hashing](#312-encryption-and-hashing)
   - [31.2.1 The `cryptography` library](#3121-the-cryptography-library)
   - [31.2.2 Symmetric encryption](#3122-symmetric-encryption)
   - [31.2.3 Asymmetric encryption](#3123-asymmetric-encryption)
   - [31.2.4 Cryptographic hashing](#3124-cryptographic-hashing)
   - [31.2.5 Password hashing with bcrypt](#3125-password-hashing-with-bcrypt)
   - [31.2.6 Key management](#3126-key-management)
3. [31.3 Authentication](#313-authentication)
   - [31.3.1 User authentication basics](#3131-user-authentication-basics)
   - [31.3.2 Sessions](#3132-sessions)
   - [31.3.3 JWT](#3133-jwt)
   - [31.3.4 OAuth 2.0](#3134-oauth-20)
   - [31.3.5 Two-factor authentication](#3135-two-factor-authentication)
4. [31.4 Authorization](#314-authorization)
   - [31.4.1 Role-based access control](#3141-role-based-access-control)
   - [31.4.2 Permission checks](#3142-permission-checks)
   - [31.4.3 Access control lists](#3143-access-control-lists)
   - [31.4.4 Decorators and guards](#3144-decorators-and-guards)
   - [31.4.5 Audit logging](#3145-audit-logging)
5. [31.5 Web security](#315-web-security)
   - [31.5.1 CSRF](#3151-csrf)
   - [31.5.2 XSS](#3152-xss)
   - [31.5.3 SQL injection](#3153-sql-injection)
   - [31.5.4 Secure HTTP headers](#3154-secure-http-headers)
   - [31.5.5 Rate limiting](#3155-rate-limiting)
6. [31.6 Secure coding](#316-secure-coding)
   - [31.6.1 Pickle and deserialization](#3161-pickle-and-deserialization)
   - [31.6.2 `eval` / `exec` risks](#3162-eval--exec-risks)
   - [31.6.3 Dependency supply chain](#3163-dependency-supply-chain)
   - [31.6.4 Secret management](#3164-secret-management)
   - [31.6.5 Error information disclosure](#3165-error-information-disclosure)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 31.1 Input validation

### 31.1.1 Validating untrusted input

**Beginner Level:** Treat **HTTP** **params**, **headers**, **file** **uploads**, and **webhook** bodies as **hostile**. Accept only **expected** **shapes**.

```python
from pydantic import BaseModel, Field, ValidationError


class SearchQuery(BaseModel):
    q: str = Field(min_length=1, max_length=200)
    page: int = Field(ge=1, le=10_000)


def parse_search(d: dict):
    try:
        return SearchQuery(**d)
    except ValidationError as e:
        raise HTTPException(400, detail=e.errors())  # framework-specific
```

**Intermediate Level:** **Allowlists** beat **denylists** for **enum** fields (`sort=price_asc` only). Reject **unknown** **JSON** keys in **strict** **APIs**.

```python
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["order", "refund"]
```

**Expert Level:** **Content-type** **sniffing** and **magic-byte** checks for **uploads**; **virus** **scanning** and **size** **quotas** in **object** **storage** **pipelines**.

```python
MAX_UPLOAD = 5 * 1024 * 1024


def assert_size(raw: bytes):
    if len(raw) > MAX_UPLOAD:
        raise ValueError("too large")
```

#### Key Points — validating input

- Validate **at** **trust** **boundary** (HTTP layer), not deep in **random** **helpers**.
- **Log** **validation** **failures** with **rate** **limits** to avoid **noise**.
- **Internationalization** affects **string** **constraints**—use **Unicode** **aware** **length** where needed.

---

### 31.1.2 Type checking

**Beginner Level:** Use **`int()`**, **`Decimal`**, **`UUID`**, with **try/except** or **Pydantic** for **typed** **query** **params** in **FastAPI**.

```python
from uuid import UUID


def parse_uuid(s: str) -> UUID:
    return UUID(s)  # raises ValueError if invalid
```

**Intermediate Level:** **`typing.Literal`** and **`Annotated`** with **constraints** encode **business** **rules** for **static** **and** **runtime** checks.

```python
from typing import Annotated
from pydantic import Field

PositiveInt = Annotated[int, Field(gt=0)]
```

**Expert Level:** **mypy** in **CI** for **internal** **modules**; **boundary** **DTOs** for **external** **JSON**—don't **trust** **ORM** **objects** crossing **trust** **zones** without **re-validation**.

```python
# Expert: separate PublicUser vs InternalUser models
```

#### Key Points — type checking

- **Coercion** can **hide** **attacks** (`"001"` **vs** `1`)—be **explicit**.
- **Bool** **parsing** pitfalls (`"false"` **truthy** in **some** **contexts**).
- **Union** types need **discriminated** **tags**.

---

### 31.1.3 Range constraints

**Beginner Level:** Clamp or **reject** **pagination** **limits** to prevent **DoS** via **`limit=999999999`**.

```python
def clamp_limit(n: int) -> int:
    return max(1, min(n, 100))
```

**Intermediate Level:** **Financial** **amounts** as **integer** **minor** **units** with **min/max** per **currency**.

```python
from decimal import Decimal

MAX_USD_CENTS = 1_000_000_000


def cents_ok(cents: int) -> bool:
    return 0 < cents <= MAX_USD_CENTS
```

**Expert Level:** **Resource** **quotas** per **tenant** in **multi-tenant** **SaaS**—enforce in **DB** **and** **app** **layer**.

```python
# Expert: check tenant quota before expensive job enqueue
```

#### Key Points — range constraints

- **Unsigned** vs **signed** confusion in **protocols**.
- **Time** **windows** for **rate** **limits** and **replay** **protection**.
- **Scientific** **notation** in **JSON** **numbers**—parser **behavior**.

---

### 31.1.4 Format validation

**Beginner Level:** **Email** **regex** is **error-prone**—use **libraries** or **deliverability** **checks**; at minimum **length** + **`@`**.

```python
from email_validator import validate_email, EmailNotValidError


def norm_email(s: str) -> str:
    try:
        return validate_email(s, check_deliverability=False).normalized
    except EmailNotValidError as e:
        raise ValueError(str(e))
```

**Intermediate Level:** **ISO8601** **dates** with **`datetime.fromisoformat`** (careful with **timezones**); **reject** **ambiguous** **local** **times** in **global** **systems**.

```python
from datetime import datetime, timezone


def parse_utc(s: str) -> datetime:
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        raise ValueError("timezone required")
    return dt.astimezone(timezone.utc)
```

**Expert Level:** **Hostname** validation for **SSRF** **defense** when **fetching** **user-supplied** **URLs**—block **private** **IP** **ranges**.

```python
import ipaddress


def is_private_ip(ip: str) -> bool:
    addr = ipaddress.ip_address(ip)
    return addr.is_private or addr.is_loopback or addr.is_link_local
```

#### Key Points — format validation

- **Unicode** **normalization** for **usernames** (**NFKC**).
- **URL** parsing **quirks**—use **`urllib`** / **`httpx`** with **care**.
- **File** **extensions** **lie**—inspect **content**, not **names**.

---

### 31.1.5 Sanitization vs validation

**Beginner Level:** **Validation** rejects bad data; **sanitization** transforms—prefer **validation** for **security** **decisions**.

```python
# Bad as sole defense: strip "<script>" substrings — bypassable
```

**Intermediate Level:** **HTML** **sanitization** with **`bleach`** or **server-side** **templating** **escaping** for **rich** **text** **CMS** features.

```python
# pip install bleach
# import bleach
# clean = bleach.clean(user_html, tags=["b","i","a"], attributes={"a":["href"]})
```

**Expert Level:** **Context-aware** **encoding**—**HTML** **vs** **JS** **vs** **CSS** **vs** **URL**; **CSP** headers reduce **XSS** **blast** **radius**.

```python
# Expert: templating auto-escape (Jinja2) + strict CSP
```

#### Key Points — sanitization

- **Canonicalize** **before** **checks** (**Unicode** **tricks**).
- **Don't** **sanitize** **SQL**—**parameterize**.
- **Log** **rejected** **payloads** **carefully** (PII).

---

## 31.2 Encryption and hashing

### 31.2.1 The `cryptography` library

**Beginner Level:** Use **`cryptography`** (maintained) instead of **rolling** **your** **own** **crypto** for **TLS** **adjacent** tasks.

```bash
pip install cryptography
```

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()
f = Fernet(key)
token = f.encrypt(b"secret data")
assert f.decrypt(token) == b"secret data"
```

**Intermediate Level:** **Fernet** provides **authenticated** **encryption** with **timestamp**—good for **tokens** **at** **rest** in **DBs**.

```python
# Rotate keys by trying multiple Fernet instances
```

**Expert Level:** **HSM**/**KMS** integration for **key** **wrapping**; **envelope** **encryption** for **large** **blobs** in **object** **storage**.

```python
# Expert: AWS KMS GenerateDataKey pattern (pseudo)
```

#### Key Points — cryptography lib

- **Never** reuse **nonce/IV** with **same** **key**.
- **Prefer** **high-level** **recipes** in **docs**.
- **Keep** **dependencies** **pinned** and **audited**.

---

### 31.2.2 Symmetric encryption

**Beginner Level:** **AES-GCM** via **`cryptography.hazmat`** for **confidentiality** **and** **integrity**.

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)
nonce = os.urandom(12)
ct = aesgcm.encrypt(nonce, b"data", associated_data=b"ctx")
pt = aesgcm.decrypt(nonce, ct, associated_data=b"ctx")
```

**Intermediate Level:** **Associated** **data** binds **ciphertext** to **context** (tenant id, purpose).

```python
aad = b"tenant:42|purpose:backup"
```

**Expert Level:** **Key** **rotation** with **versioned** **headers** prepended to **ciphertext** blobs.

```python
# v1|nonce|ciphertext
```

#### Key Points — symmetric crypto

- **Random** **nonces** per **message**.
- **Compare** **tags** in **constant** **time** (library handles).
- **Don't** **compress** **secrets** before **encrypt** (CRIME/BREACH class issues in **TLS** context).

---

### 31.2.3 Asymmetric encryption

**Beginner Level:** **RSA-OAEP** or **modern** **EC** **hybrids** for **encrypting** **small** **secrets** (e.g., **wrap** **AES** **keys).

```python
# Use cryptography recipes; avoid textbook RSA padding
```

**Intermediate Level:** **TLS** **terminates** **transport** **crypto**; **application-layer** **crypto** for **end-to-end** **backup** **to** **untrusted** **storage**.

```python
# Expert teams use libsodium crypto_box or age for files
```

**Expert Level:** **Certificate** **pinning** for **high-risk** **mobile** **clients**; **SPIFFE**/**mTLS** in **service** **meshes**.

```python
# openssl / certifi trust stores configured in httpx/requests
```

#### Key Points — asymmetric crypto

- **Prefer** **X25519/Ed25519** **families** for **new** **designs**.
- **Key** **length** **choices** follow **NIST**/vendor **guidance**.
- **Private** **keys** never in **git**.

---

### 31.2.4 Cryptographic hashing

**Beginner Level:** **`hashlib.sha256`** for **integrity** **checksums** of **artifacts** in **CI** **pipelines**—not for **passwords**.

```python
import hashlib

def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()
```

**Intermediate Level:** **HMAC** for **API** **signatures** with **shared** **secret**—use **`hmac.compare_digest`** to **avoid** **timing** **leaks**.

```python
import hmac
import hashlib


def verify_sig(secret: bytes, msg: bytes, sig: hex) -> bool:
    mac = hmac.new(secret, msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(mac, sig)
```

**Expert Level:** **HKDF** for **key** **derivation** from **shared** **secrets** in **MLS**/custom **protocols**.

```python
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
```

#### Key Points — hashing

- **SHA-256** minimum for **general** **hashing**; **avoid** **MD5/SHA1** for **security** (legacy **exceptions** exist).
- **Salt** **passwords** with **bcrypt/argon2**, not **SHA**.
- **Length** **extension** attacks on **plain** **HMAC-less** **MD** **constructs**—use **HMAC**.

---

### 31.2.5 Password hashing with bcrypt

**Beginner Level:** **`passlib`** or **`bcrypt`** to **hash** **passwords** with **automatic** **salt** and **work** **factor**.

```python
import bcrypt

pw = b"correct horse battery staple"
h = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))


def check(pw: bytes, stored: bytes) -> bool:
    return bcrypt.checkpw(pw, stored)
```

**Intermediate Level:** **Upgrade** **work** **factor** over **time**; **rehash** on **login** when **policy** changes.

```python
if needs_rehash(stored):
    new_hash = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=14))
    save_user_hash(user_id, new_hash)
```

**Expert Level:** **Argon2id** winner of **PHC**—prefer when **library** **available**; **enforce** **breach** **password** **checks** (**HIBP** k-anonymity API) for **consumer** **apps**.

```python
# pip install argon2-cffi
```

#### Key Points — bcrypt

- **Constant-time** **compare** via **`checkpw`**.
- **Never** **trim** **passwords** without **documenting** **policy**.
- **Unicode** **normalization** policy for **passwords**.

---

### 31.2.6 Key management

**Beginner Level:** **Environment** **variables** for **dev**; **never** **commit** **`.env`** with **real** **secrets**.

```python
import os

API_KEY = os.environ["API_KEY"]  # fail fast if missing
```

**Intermediate Level:** **Vault**, **AWS** **Secrets** **Manager**, **GCP** **Secret** **Manager**, **Azure** **Key** **Vault** with **IAM** **roles**.

```python
# boto3 client.get_secret_value(SecretId="prod/db")
```

**Expert Level:** **Envelope** **encryption**, **automatic** **rotation**, **HSM**-backed **keys**, **dual** **control** for **manual** **break-glass**.

```python
# Expert: separate keys per tenant for compliance boundaries (cost tradeoff)
```

#### Key Points — key management

- **Least** **privilege** **IAM** for **secret** **fetchers**.
- **Audit** **access** **logs**.
- **Separate** **keys** **per** **environment**.

---

## 31.3 Authentication

### 31.3.1 User authentication basics

**Beginner Level:** **Verify** **password** **hashes**; **issue** **session** **or** **token** **after** **MFA** **if** **enabled**.

```python
def login(email, password):
    user = load_user(email)
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash):
        raise AuthError("invalid credentials")
    return user
```

**Intermediate Level:** **Account** **enumeration** **defense**—generic **error** **messages**; **rate** **limit** **logins**.

```python
# Same timing for unknown user vs bad password (harder — use constant work)
```

**Expert Level:** **WebAuthn** **passkeys** for **phishing-resistant** **auth** in **enterprise** **SaaS**.

```python
# Use fido2/webauthn libraries
```

#### Key Points — user auth

- **Lockout** **policies** vs **DoS**—use **CAPTCHA**/**proof-of-work** at **scale**.
- **Device** **fingerprinting** **privacy** **implications**.
- **Session** **fixation** **defenses**.

---

### 31.3.2 Sessions

**Beginner Level:** **Random** **session** **IDs** in **HTTP-only**, **Secure**, **SameSite** **cookies**.

```python
import secrets

sid = secrets.token_urlsafe(32)
```

**Intermediate Level:** **Server-side** **session** **store** (**Redis**) with **TTL** and **rotation** on **privilege** **change**.

```python
# Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax; Path=/
```

**Expert Level:** **Binding** **session** to **client** **user-agent** **hash** + **IP** **is** **fragile**—prefer **short-lived** **tokens** + **refresh** **rotation**.

```python
# OWASP session management cheat sheet
```

#### Key Points — sessions

- **Regenerate** **ID** on **login**.
- **Invalidate** **all** **sessions** on **password** **reset**.
- **CSRF** **tokens** for **state-changing** **cookie** **auth**.

---

### 31.3.3 JWT

**Beginner Level:** **Signed** **JWTs** (`HS256` with **strong** **secret** or **`RS256`**) carry **claims**; **verify** **issuer**, **audience**, **exp**.

```python
# pip install pyjwt
import jwt

payload = jwt.decode(token, key, algorithms=["RS256"], audience="my-api", issuer="auth.example")
```

**Intermediate Level:** **Don't** **put** **secrets** in **JWT** **payload**—it's **base64**, not **encrypted** (unless **using** **JWE**).

```python
# Avoid alg=none; pin allowed algorithms
```

**Expert Level:** **Key** **rotation** via **`kid`** **header**; **short** **AT** + **refresh** **token** **with** **reuse** **detection**.

```python
# Expert: revocation lists or introspection for sensitive operations
```

#### Key Points — JWT

- **Local** **verification** **cannot** **instantly** **revoke**—plan **TTL** **and** **denylist**.
- **Sub** claim maps to **user** **id**.
- **Store** **refresh** **tokens** **hashed** in **DB**.

---

### 31.3.4 OAuth 2.0

**Beginner Level:** **Authorization** **code** **flow** with **PKCE** for **public** **clients** (**SPAs**/mobile).

```python
# Use authlib/requests-oauthlib; never embed client secrets in mobile apps
```

**Intermediate Level:** **Scopes** **minimized**; **validate** **state** **parameter** **against** **CSRF**.

```python
# state = secrets.token_urlsafe(16); store server-side or signed cookie
```

**Expert Level:** **mTLS** **client** **auth** for **B2B** **APIs**; **JWT** **access** **tokens** with **fine-grained** **authorization** **servers**.

```python
# Expert: separate authz server vs resource server
```

#### Key Points — OAuth 2.0

- **Redirect** **URI** **exact** **match**.
- **Refresh** **token** **rotation** **(RFC 6819)** patterns.
- **Resource** **owner** **password** **grant** **deprecated** for **new** **apps**.

---

### 31.3.5 Two-factor authentication

**Beginner Level:** **TOTP** (**Google** **Authenticator**) with **`pyotp`**; **store** **secret** **encrypted**.

```python
import pyotp

totp = pyotp.TOTP(secret_base32)
assert totp.verify(user_code, valid_window=1)
```

**Intermediate Level:** **Backup** **codes** **hashed** **one-time**; **rate** **limit** **TOTP** **attempts**.

```python
# bcrypt hash each backup code; remove on use
```

**Expert Level:** **WebAuthn** **as** **second** **factor**; **risk-based** **step-up** **auth** for **wire** **transfers**.

```python
# Adaptive auth using device trust scores (vendor solutions)
```

#### Key Points — 2FA

- **Clock** **skew** **handling** with **`valid_window`**.
- **SMS** **2FA** **weaker** than **TOTP/WebAuthn**.
- **Support** **flows** for **device** **loss**.

---

## 31.4 Authorization

### 31.4.1 Role-based access control

**Beginner Level:** **Roles** (`admin`, `editor`, `viewer`) on **users**; **check** **before** **mutations**.

```python
class User:
    role: str


def require_admin(u: User):
    if u.role != "admin":
        raise PermissionDenied
```

**Intermediate Level:** **Hierarchical** **roles** with **implied** **permissions**—encode as **data**, not **nested** **if** **chains**.

```python
ROLE_PERMS = {
    "viewer": {"read"},
    "editor": {"read", "write"},
    "admin": {"read", "write", "delete", "invite"},
}
```

**Expert Level:** **Attribute-based** **access** **control** (**ABAC**) for **fine-grained** **healthcare** **records** (**patient**, **department**, **break-glass**).

```python
def can_view_record(user, record) -> bool:
    return user.id == record.patient_id or user.role == "clinician" and user.dept == record.dept
```

#### Key Points — RBAC

- **Default** **deny**.
- **Separate** **authn** vs **authz** **failures** in **logs** (carefully).
- **Regular** **access** **reviews** for **compliance**.

---

### 31.4.2 Permission checks

**Beginner Level:** **Central** **`assert_perm(user, "invoice:approve")`** helper used by **routes** and **workers**.

```python
def assert_perm(user, perm: str):
    if perm not in user.permissions:
        raise PermissionDenied(perm)
```

**Intermediate Level:** **Policy** **as** **code** **+** **tests**; **never** **only** **hide** **UI** **buttons**—**always** **enforce** **server-side**.

```python
@router.post("/approve")
def approve(user: User = Depends(get_user)):
    assert_perm(user, "invoice:approve")
```

**Expert Level:** **OpenFGA/OPA** for **distributed** **authorization** **as** **a** **service** in **microservices**.

```python
# pip install openfga-sdk (conceptual)
```

#### Key Points — permission checks

- **Consistent** **naming** **convention** for **perms**.
- **Bulk** **endpoints** **check** **each** **item** **or** **prove** **set** **algebra**.
- **Time-limited** **grants** for **support** **impersonation**.

---

### 31.4.3 Access control lists

**Beginner Level:** **Per-object** **ACL** **entries** (`doc:read:user:5`) for **shared** **drive** **features**.

```python
acl = {"doc:42": {"read": {1, 2, 3}, "write": {1}}}
```

**Intermediate Level:** **Store** **ACLs** **normalized** **in** **DB** **with** **indexes**; **materialize** **effective** **perms** **for** **hot** **paths**.

```python
# Table: object_id, subject_id, perm
```

**Expert Level:** **Google** **Zanzibar**-style **relation** **tuples** for **planet-scale** **ACLs**—use **managed** **services** when **appropriate**.

```python
# tuple: document:readme#viewer@user:anna
```

#### Key Points — ACLs

- **Explosion** of **rows**—**pagination** **and** **caching**.
- **Inheritance** **models** (folder → file).
- **Audit** **ACL** **changes**.

---

### 31.4.4 Decorators and guards

**Beginner Level:** **FastAPI** **`Depends`** **injects** **current** **user**; **raises** **403** if **missing** **scope**.

```python
def require_scope(scope: str):
    def dep(user: User = Depends(get_user)):
        if scope not in user.permissions:
            raise HTTPException(403)
        return user

    return dep
```

**Intermediate Level:** **Class-based** **views** **mixins** in **Django** **with** **`UserPassesTestMixin`**.

```python
# Django: permission_required decorator
```

**Expert Level:** **Policy** **caching** with **invalidation** on **role** **changes**—**stale** **cache** **=** **security** **bug**.

```python
# Redis cache of compiled policy per user versioned by perm_version
```

#### Key Points — decorators/guards

- **Composable** **dependencies**.
- **Test** **guards** **with** **matrix** **of** **roles**.
- **Async** **guards** **must** **await** **IO** **checks** **carefully**.

---

### 31.4.5 Audit logging

**Beginner Level:** **Append-only** **logs** of **who** **did** **what** **when** for **admin** **actions**.

```python
audit.log(actor=user.id, action="user.delete", target=other_id, ip=request.client.host)
```

**Intermediate Level:** **Structured** **JSON** **logs** to **SIEM**; **tamper-evident** **storage** (**WORM** bucket).

```python
import json
import logging

log = logging.getLogger("audit")
log.info(json.dumps({"actor": 1, "action": "payout", "amount": 500}))
```

**Expert Level:** **Dual** **control** **events** **require** **two** **operator** **IDs**; **hash-chained** **logs** for **regulatory** **defense**.

```python
# Expert: sign log batches with HSM-backed key daily
```

#### Key Points — audit logging

- **Never** **log** **secrets** or **full** **PAN**.
- **Clock** **sync** **(NTP)** on **writers**.
- **Retention** **policy** **per** **compliance**.

---

## 31.5 Web security

### 31.5.1 CSRF

**Beginner Level:** For **cookie-based** **sessions**, **require** **CSRF** **tokens** on **POST**/**PUT**/**DELETE**.

```html
<input type="hidden" name="csrf" value="{{ csrf_token }}"/>
```

**Intermediate Level:** **SameSite=Lax/Strict** **cookies** reduce **CSRF**; **Lax** **may** **still** **allow** **some** **top-level** **POSTs**—**tokens** **still** **recommended**.

```python
# Starlette CSRF middleware patterns / Double Submit Cookie cautiously
```

**Expert Level:** **Custom** **clients** use **`Authorization: Bearer`** **without** **cookies**—**CSRF** **not** **applicable** **to** **that** **surface** but **XSS** **steals** **tokens**.

```python
# Threat model per auth mechanism
```

#### Key Points — CSRF

- **Defense** **in** **depth**: **token** + **SameSite** + **Origin** **checks**.
- **SPA** **frameworks** need **explicit** **CSRF** **handling** if **using** **cookies**.
- **CORS** **is** **not** **CSRF** **defense**.

---

### 31.5.2 XSS

**Beginner Level:** **Escape** **output** in **HTML** **templates**; **never** **`innerHTML`** **with** **raw** **user** **strings** in **SPAs** without **sanitization**.

```python
# Jinja autoescaping on
```

**Intermediate Level:** **CSP** **`default-src 'self'; script-src 'self'`** blocks **inline** **scripts**; **nonce** **for** **needed** **inline**.

```python
# Starlette/Flask-Talisman sets headers
```

**Expert Level:** **JSON** **responses** with **`Content-Type: application/json`**; **avoid** **reflecting** **user** **input** in **error** **pages**.

```python
# Use ORJSONResponse; never build HTML by concatenation
```

#### Key Points — XSS

- **DOM** **XSS** in **frontends** is **still** **your** **problem** **to** **coordinate**.
- **Markdown** **renderers** can **embed** **HTML**.
- **HTTPOnly** **cookies** **don't** **protect** **Bearer** **tokens** in **localStorage**.

---

### 31.5.3 SQL injection

**Beginner Level:** **Parameterized** **queries** **only**; **ORM** **helps** **but** **raw** **SQL** **must** **still** **parameterize**.

```python
cur.execute("SELECT * FROM users WHERE email = %s", (email,))
```

**Intermediate Level:** **Dynamic** **`ORDER BY`** **allowlist** **column** **names**.

```python
ALLOWED = {"created_at", "email"}


def order_clause(field: str) -> str:
    if field not in ALLOWED:
        raise ValueError
    return field
```

**Expert Level:** **Stored** **procedures** **with** **parameterization**; **escape** **hatches** **reviewed** in **PR** **checklist**.

```python
# No: f"SELECT ... {user_input}"
```

#### Key Points — SQLi

- **Second-order** **SQLi** via **stored** **data**.
- **LIKE** **wildcards** **user-controlled** → **escape** **`%` `_`**.
- **ORM** **`text()`** **fragments** are **dangerous**.

---

### 31.5.4 Secure HTTP headers

**Beginner Level:** **`Strict-Transport-Security`**, **`X-Content-Type-Options: nosniff`**, **`X-Frame-Options`/`frame-ancestors`**.

```python
# Starlette middleware Secure + HSTS in reverse proxy
```

**Intermediate Level:** **`Referrer-Policy`**, **`Permissions-Policy`** to **disable** **unused** **browser** **features**.

```python
HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
}
```

**Expert Level:** **`Cross-Origin-Opener-Policy`**, **`Cross-Origin-Resource-Policy`** for **Spectre**-class **mitigations** where **needed**.

```python
# Tune per route for APIs vs HTML
```

#### Key Points — headers

- **Terminate** **TLS** at **LB** **and** **set** **HSTS** **there** **often**.
- **CSP** **report-only** **mode** **first**.
- **Test** **with** **securityheaders.com** **style** **scanners** **in** **staging**.

---

### 31.5.5 Rate limiting

**Beginner Level:** **Per-IP** **limits** on **login** and **password** **reset** **endpoints**.

```python
# slowapi / starlette-limiter / redis token bucket
```

**Intermediate Level:** **Per-user** **and** **per-tenant** **quotas** for **expensive** **ML** **inference** **routes**.

```python
# leaky bucket keyed by tenant_id
```

**Expert Level:** **Edge** **CDN** **rate** **limits** + **app** **layer** **defense**; **CAPTCHA** **escalation** **tiers**.

```python
# Cloudflare/AWS WAF + app-level Redis
```

#### Key Points — rate limiting

- **Distributed** **counters** in **Redis**.
- **Return** **`429`** **with** **`Retry-After`**.
- **Whitelist** **internal** **health** **checks** **carefully**.

---

## 31.6 Secure coding

### 31.6.1 Pickle and deserialization

**Beginner Level:** **`pickle.loads` on untrusted bytes = remote code execution**—never accept **pickle** from **users** or **network**.

```python
import pickle

# NEVER: pickle.loads(request.body)
```

**Intermediate Level:** Use **JSON**, **MessagePack** with **schema**, **Protobuf** for **RPC** **payloads**.

```python
import json

data = json.loads(raw)  # still validate schema
```

**Expert Level:** **YAML** **`safe_load`** only; **`!!python/object`** **tags** **disabled**.

```python
import yaml

yaml.safe_load(text)
```

#### Key Points — pickle

- **Same** **warning** for **`shelve`**, **some** **caches**.
- **Signed** **blobs** **still** **not** **safe** if **attacker** **can** **forge** **signing** **key**.
- **Prefer** **explicit** **schemas**.

---

### 31.6.2 `eval` / `exec` risks

**Beginner Level:** **`eval(user_input)`** is **RCE**—**forbidden** in **web** **apps**.

```python
# Bad
# eval(expr)
```

**Intermediate Level:** **`ast.literal_eval`** for **safe** **literals** only.

```python
import ast

ast.literal_eval("[1, 2, 3]")
```

**Expert Level:** **Restricted** **interpreters** or **DSL** **compilers** to **AST** **allowlists** with **extreme** **care**—most **teams** should **avoid**.

```python
# Expert: use jsonlogic / jq-like libs instead of python eval
```

#### Key Points — eval/exec

- **`compile` + `exec`** **same** **risk**.
- **Template** **engines** can **execute** **code** if **misconfigured**.
- **Code** **review** **grep** for **`eval`**.

---

### 31.6.3 Dependency supply chain

**Beginner Level:** **`pip install`** from **PyPI** with **hash** **pinning** in **`requirements.txt`** or **`uv.lock`**.

```text
# requirements.txt with hashes (pip-compile)
```

**Intermediate Level:** **`pip-audit`**, **`safety`**, **Dependabot**, **Snyk** in **CI**.

```bash
pip-audit
```

**Expert Level:** **Sigstore**/**wheel** **signing** adoption; **private** **indexes** with **proxy** **caching**; **review** **typosquat** **packages**.

```python
# Expert: SBOM export cyclonedx for production images
```

#### Key Points — dependencies

- **Vendor** **critical** **packages** or **mirror**.
- **License** **compliance** alongside **security**.
- **Pin** **transitive** **deps** **via** **lockfile**.

---

### 31.6.4 Secret management

**Beginner Level:** **`.env` in `.gitignore`**; **use** **`python-dotenv` only in dev**.

```python
from dotenv import load_dotenv

load_dotenv()  # dev only
```

**Intermediate Level:** **IAM** **roles** for **cloud** **metadata** **credentials**—no **static** **keys** on **VMs**.

```python
# boto3 default chain
```

**Expert Level:** **Envelope** **encryption** for **tenant** **secrets**; **HSM**-backed **master** **keys**; **break-glass** **procedures**.

```python
# KMS Decrypt with IAM condition keys
```

#### Key Points — secrets

- **Rotate** on **employee** **offboarding** for **shared** **dev** **secrets**.
- **Scan** **repos** with **gitleaks/trufflehog**.
- **Separate** **secrets** **per** **service**.

---

### 31.6.5 Error information disclosure

**Beginner Level:** **Production** returns **generic** **messages**; **log** **details** **server-side**.

```python
@app.exception_handler(Exception)
def any_exc(request, exc):
    log.exception("unhandled")
    return JSONResponse({"error": "internal_error"}, status_code=500)
```

**Intermediate Level:** **Disable** **Flask/Django** **debug** **in** **prod**; **block** **`/console`**.

```python
DEBUG = False
```

**Expert Level:** **Sanitize** **tracebacks** in **API** **responses**; **use** **Sentry** **with** **PII** **scrubbing**.

```python
# sentry_sdk.init(before_send=scrub_pii)
```

#### Key Points — disclosure

- **Stack** **traces** leak **paths**, **library** **versions**.
- **Timing** **attacks** via **error** **paths**—uniform **responses** where needed.
- **HTTP** **404** vs **403** **enumeration** **tradeoffs**.

---

## Best Practices

- **Defense** in **depth**: **validate** input, **parameterize** SQL, **escape** output, **authenticate**, **authorize**, **log**.
- **Use** **standard** **libraries** for **crypto**; **rotate** **keys**.
- **Short-lived** **credentials**; **least** **privilege** **IAM**.
- **Security** **headers** and **HTTPS** **everywhere**.
- **Automate** **dependency** **scanning** and **baseline** **container** **images**.
- **Threat** **model** **new** **features** (**STRIDE**) **before** **coding**.
- **Incident** **response** **runbooks** and **on-call** **access**.

---

## Common Mistakes to Avoid

- **Trusting** **client-side** **validation** only.
- **Storing** **passwords** in **plaintext** or **MD5**.
- **JWT** in **localStorage** **without** **XSS** **controls**.
- **Pickle**/**yaml.unsafe_load** on **untrusted** **data**.
- **Logging** **tokens**, **passwords**, **PII**.
- **Wildcard** **CORS** **`*`** with **credentials**.
- **SSRF** from **user** **URLs** without **allowlists**.
- **Overly** **verbose** **errors** to **end** **users**.
- **Skipping** **authorization** **checks** on **internal** **routes** (**IDOR**).
- **Rate** **limits** **only** on **login** but **not** on **expensive** **APIs**.

---

*Security is a process: automate checks, review designs, and practice incident response before you need it.*
