# Authentication with Flask 3.1.3

**Authentication** answers “who are you?”—typically via credentials, sessions, or tokens. Flask provides primitives; extensions like **Flask-Login** standardize session-based auth. This guide aligns with **Flask 3.1.3** and **Python 3.9+**, covering password hashing with **Werkzeug**, registration/login flows, and advanced patterns (OAuth, MFA, JWT) for **SaaS**, **e‑commerce**, and **social** products.

---

## 📑 Table of Contents

1. [12.1 Authentication Basics](#121-authentication-basics)
2. [12.2 Password Management](#122-password-management)
3. [12.3 Flask-Login Extension](#123-flask-login-extension)
4. [12.4 Login and Logout](#124-login-and-logout)
5. [12.5 User Model](#125-user-model)
6. [12.6 Registration System](#126-registration-system)
7. [12.7 Advanced Authentication](#127-advanced-authentication)
8. [Best Practices](#best-practices)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Comparison Tables](#comparison-tables)

---

## 12.1 Authentication Basics

### 12.1.1 Concepts

**Identity** (user id), **credentials** (password, key), **authentication** (verify credentials), **session** (subsequent requests).

**🟢 Beginner Example** — mental model:

```text
Login POST → verify password → store user_id in session → redirect
```

**🟡 Intermediate Example** — threat model notes: session fixation, CSRF, XSS stealing cookies.

**🔴 Expert Example** — split **authentication** vs **authorization** (see Authorization notes).

**🌍 Real-Time Example** — SaaS: SSO for employees, local accounts for contractors.

---

### 12.1.2 User Registration

Collect email/password, validate, hash password, persist user.

**🟢 Beginner Example**

```python
from werkzeug.security import generate_password_hash
from extensions import db

def register_user(email: str, password: str) -> User:
    user = User(email=email.lower(), password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return user
```

**🟡 Intermediate Example** — wrap in transaction + unique constraint handling.

**🔴 Expert Example** — outbox email event after commit.

**🌍 Real-Time Example** — e‑commerce: optional marketing opt-in separate from account credentials.

---

### 12.1.3 User Login

Verify credentials, establish session (`login_user` with Flask-Login).

**🟢 Beginner Example**

```python
from werkzeug.security import check_password_hash

def authenticate(email, password):
    user = User.query.filter_by(email=email.lower()).first()
    if user and check_password_hash(user.password_hash, password):
        return user
    return None
```

**🟡 Intermediate Example** — constant-time failure messages to reduce user enumeration (still leaky via timing).

**🔴 Expert Example** — rate limit + CAPTCHA after N failures.

**🌍 Real-Time Example** — social: suggest 2FA when new device.

---

### 12.1.4 User Logout

Clear server session / Flask-Login session.

**🟢 Beginner Example**

```python
from flask_login import logout_user

@app.post("/logout")
def logout():
    logout_user()
    return redirect(url_for("index"))
```

**🟡 Intermediate Example** — CSRF on POST logout.

**🔴 Expert Example** — revoke refresh tokens at IdP for OAuth sessions.

**🌍 Real-Time Example** — SaaS admin “sign out all devices”.

---

### 12.1.5 Session Management

Flask signed cookies (`session`) or server-side sessions (Redis).

**🟢 Beginner Example**

```python
app.config["SECRET_KEY"] = "change-me"
```

**🟡 Intermediate Example**

```python
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)
```

**🔴 Expert Example** — rotating `SECRET_KEY` with dual-key validation window.

**🌍 Real-Time Example** — e‑commerce PCI: keep session small; no card data in session.

---

## 12.2 Password Management

### 12.2.1 Password Hashing (werkzeug.security)

Use strong adaptive hashes (pbkdf2/scrypt/bcrypt via Werkzeug configuration).

**🟢 Beginner Example**

```python
from werkzeug.security import generate_password_hash, check_password_hash

h = generate_password_hash("correct horse battery staple")
assert check_password_hash(h, "correct horse battery staple")
```

**🟡 Intermediate Example** — specify method if policy requires:

```python
h = generate_password_hash("secret", method="pbkdf2:sha256", salt_length=16)
```

**🔴 Expert Example** — align parameters with organizational crypto standards.

**🌍 Real-Time Example** — SaaS SOC2: document hash algorithm in security whitepaper.

---

### 12.2.2 generate_password_hash()

**🟢 Beginner Example** — store only hash in DB, never plaintext.

**🟡 Intermediate Example** — migration from legacy md5: force reset on next login.

**🔴 Expert Example** — rehash on login if parameters upgraded (`needs_update` patterns with passlib if adopted).

**🌍 Real-Time Example** — import users from acquired company: assign random password + email reset.

---

### 12.2.3 check_password_hash()

**🟢 Beginner Example**

```python
ok = check_password_hash(user.password_hash, form.password.data)
```

**🟡 Intermediate Example** — on success, rotate session id (session fixation mitigation).

**🔴 Expert Example** — integrate with hardware security key as second step.

**🌍 Real-Time Example** — brute-force protection at edge (Cloudflare) + app rate limit.

---

### 12.2.4 Password Validation

Enforce length/complexity at registration and password change.

**🟢 Beginner Example**

```python
from wtforms.validators import Length, DataRequired

password = PasswordField(validators=[DataRequired(), Length(min=12)])
```

**🟡 Intermediate Example** — block common passwords via HIBP k-anonymity API (async job or login-time check).

**🔴 Expert Example** — passphrase encouragement over arbitrary complexity rules (NIST-aligned).

**🌍 Real-Time Example** — enterprise SaaS: integrate password policy from IdP when SSO not used.

---

### 12.2.5 Password Reset Flow

Token in DB or signed URL, time-limited, single use.

**🟢 Beginner Example**

```python
import secrets
from datetime import datetime, timedelta

def issue_reset_token(user):
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_expires = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()
    return token
```

**🟡 Intermediate Example** — hash token at rest like session tokens.

**🔴 Expert Example** — send event to email provider; never echo token in logs.

**🌍 Real-Time Example** — e‑commerce: reset does not reveal whether email exists (generic message).

---

## 12.3 Flask-Login Extension

### 12.3.1 Installing Flask-Login

**🟢 Beginner Example**

```bash
pip install Flask-Login
```

**🟡 Intermediate Example** — pin alongside Flask 3.1.3 in lockfile.

**🔴 Expert Example** — type hints for `current_user` via Protocol in larger codebases.

**🌍 Real-Time Example** — Docker image includes same versions as CI.

---

### 12.3.2 UserMixin

Implements Flask-Login required methods: `is_authenticated`, `is_active`, `is_anonymous`, `get_id`.

**🟢 Beginner Example**

```python
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
```

**🟡 Intermediate Example** — override `get_id` for UUID string ids.

**🔴 Expert Example** — `is_active` reflects banned/suspended state.

**🌍 Real-Time Example** — SaaS: delinquent accounts `is_active=False` still identifiable for support.

---

### 12.3.3 Login Manager Setup

**🟢 Beginner Example**

```python
from flask_login import LoginManager

login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    return app
```

**🟡 Intermediate Example**

```python
login_manager.login_message_category = "warning"
```

**🔴 Expert Example** — `request_loader` for API keys (careful scope).

**🌍 Real-Time Example** — multi-blueprint app: `login_view` as endpoint name string.

---

### 12.3.4 @login_required

**🟢 Beginner Example**

```python
from flask_login import login_required

@app.get("/account")
@login_required
def account():
    return render_template("account.html")
```

**🟡 Intermediate Example** — customize `login_manager.unauthorized_handler`.

**🔴 Expert Example** — JSON 401 for API routes, redirect for HTML routes (split decorators).

**🌍 Real-Time Example** — e‑commerce checkout steps require login.

---

### 12.3.5 Current User Access

**🟢 Beginner Example**

```python
from flask_login import current_user

@app.get("/me")
@login_required
def me():
    return {"email": current_user.email}
```

**🟡 Intermediate Example** — template `{% if current_user.is_authenticated %}`.

**🔴 Expert Example** — avoid DB hits in hot paths: cache safe fields on user loader.

**🌍 Real-Time Example** — social: show avatar from `current_user` without extra query if eager loaded.

---

### 12.3.6 user_loader

**🟢 Beginner Example**

```python
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))
```

**🟡 Intermediate Example** — handle deleted users returning `None` → logout.

**🔴 Expert Example** — shard-aware loader in multi-DB setups.

**🌍 Real-Time Example** — high QPS: consider server-side sessions to reduce repeated `get` (tradeoffs).

---

## 12.4 Login and Logout

### 12.4.1 login_user()

**🟢 Beginner Example**

```python
from flask_login import login_user

@app.post("/login")
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = authenticate(form.email.data, form.password.data)
        if user:
            login_user(user, remember=form.remember.data)
            return redirect(url_for("index"))
        flash("Invalid credentials")
    return render_template("login.html", form=form)
```

**🟡 Intermediate Example** — `duration` parameter for remember cookie lifetime.

**🔴 Expert Example** — bind session to user agent fingerprint (fragile; optional defense).

**🌍 Real-Time Example** — SaaS: audit log `login_success` with IP + UA.

---

### 12.4.2 logout_user()

**🟢 Beginner Example** — see §12.1.4.

**🟡 Intermediate Example** — clear flash messages appropriately.

**🔴 Expert Example** — revoke server-side session key from Redis.

**🌍 Real-Time Example** — social: stop push notifications for that session.

---

### 12.4.3 Login Redirects

**🟢 Beginner Example**

```python
return redirect(request.args.get("next") or url_for("dashboard"))
```

**🟡 Intermediate Example** — validate `next` is same-site relative URL.

**🔴 Expert Example** — allowlist path prefixes `/app/`.

**🌍 Real-Time Example** — e‑commerce: return to cart after login.

---

### 12.4.4 Remember Me

Persistent cookie with separate signature; understand risks on shared devices.

**🟢 Beginner Example**

```python
login_user(user, remember=True)
```

**🟡 Intermediate Example** — shorter duration for high-risk roles.

**🔴 Expert Example** — disable remember for admin users by policy.

**🌍 Real-Time Example** — banking-style SaaS: no remember me on admin portal.

---

### 12.4.5 Session Duration

**🟢 Beginner Example** — browser session cookie until close (non-permanent).

**🟡 Intermediate Example**

```python
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
```

**🔴 Expert Example** — idle timeout implemented via middleware + `last_activity` in session.

**🌍 Real-Time Example** — HIPAA-oriented app: 15-minute idle timeout.

---

## 12.5 User Model

### 12.5.1 Creating User Model

**🟢 Beginner Example**

```python
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
```

**🟡 Intermediate Example** — `username` optional if email is primary login.

**🔴 Expert Example** — separate `Credential` table for multiple auth methods.

**🌍 Real-Time Example** — e‑commerce: link `User` to `Customer` profile.

---

### 12.5.2 User Properties

**🟢 Beginner Example**

```python
@property
def display_name(self):
    return self.email.split("@")[0]
```

**🟡 Intermediate Example** — `verified_email` boolean.

**🔴 Expert Example** — computed `plan_tier` from subscription service (cache carefully).

**🌍 Real-Time Example** — SaaS: `billing_customer_id` from Stripe.

---

### 12.5.3 User Methods

**🟢 Beginner Example**

```python
def set_password(self, password: str) -> None:
    self.password_hash = generate_password_hash(password)
```

**🟡 Intermediate Example**

```python
def verify_password(self, password: str) -> bool:
    return check_password_hash(self.password_hash, password)
```

**🔴 Expert Example** — `rotate_sessions()` invalidating all tokens.

**🌍 Real-Time Example** — social: `can_post()` checks ban + email verified.

---

### 12.5.4 Custom User Model

**🟢 Beginner Example** — add `avatar_url` column.

**🟡 Intermediate Example** — soft delete `deleted_at`.

**🔴 Expert Example** — multi-tenant `User` belongs to `Organization` with composite uniqueness `(org_id, email)`.

**🌍 Real-Time Example** — enterprise IdP `external_subject` column.

---

### 12.5.5 User Relationships

**🟢 Beginner Example** — `User` → `Post` one-to-many.

**🟡 Intermediate Example** — `User` ↔ `Role` many-to-many for authorization layer.

**🔴 Expert Example** — delegate authorization to separate service; Flask stores only identity.

**🌍 Real-Time Example** — SaaS account switching: `Membership` rows per org.

---

## 12.6 Registration System

### 12.6.1 Registration Form

**🟢 Beginner Example**

```python
class RegisterForm(FlaskForm):
    email = EmailField(validators=[DataRequired(), Email()])
    password = PasswordField(validators=[DataRequired(), Length(min=12)])
    confirm = PasswordField(validators=[DataRequired(), EqualTo("password")])
```

**🟡 Intermediate Example** — honeypot field for bots.

**🔴 Expert Example** — invite-only registration with signed token field.

**🌍 Real-Time Example** — SaaS trial: capture company size (optional) after account creation.

---

### 12.6.2 User Validation

**🟢 Beginner Example** — unique email validator querying DB.

**🟡 Intermediate Example** — block disposable domains.

**🔴 Expert Example** — similarity check against breached password list.

**🌍 Real-Time Example** — e‑commerce: verify age/locale where legally required (jurisdiction-specific).

---

### 12.6.3 Email Verification

**🟢 Beginner Example** — `email_verified` boolean default False; send link with token.

**🟡 Intermediate Example** — token hashed in DB.

**🔴 Expert Example** — verification required before checkout in high-fraud regions.

**🌍 Real-Time Example** — social: limit DMs until verified.

---

### 12.6.4 Account Creation

**🟢 Beginner Example** — single transaction user + default profile row.

**🟡 Intermediate Example** — welcome email enqueued after commit.

**🔴 Expert Example** — idempotent signup if user double-clicks submit (unique email constraint).

**🌍 Real-Time Example** — referral code attribution stored atomically with user.

---

### 12.6.5 Error Handling

**🟢 Beginner Example**

```python
from sqlalchemy.exc import IntegrityError

try:
    db.session.commit()
except IntegrityError:
    db.session.rollback()
    flash("Email already registered")
```

**🟡 Intermediate Example** — structured JSON errors for SPA.

**🔴 Expert Example** — map DB errors to safe messages; log details server-side only.

**🌍 Real-Time Example** — mobile app retries: return consistent error codes.

---

## 12.7 Advanced Authentication

### 12.7.1 Social Login (OAuth)

Use Authlib or Flask-Dance; Flask stores OAuth tokens securely.

**🟢 Beginner Example** — high-level flow:

```text
/authorize → provider → /callback → create/link user → login_user
```

**🟡 Intermediate Example** — link OAuth account to existing email with verification.

**🔴 Expert Example** — PKCE for public clients; rotate refresh tokens.

**🌍 Real-Time Example** — social “Sign in with Google” on marketing site; SSO separate for enterprise.

---

### 12.7.2 Multi-Factor Authentication (MFA)

TOTP (Google Authenticator), WebAuthn, SMS (weaker).

**🟢 Beginner Example** — store `mfa_secret` encrypted; verify 6-digit code on login step 2.

**🟡 Intermediate Example** — backup codes hashed one-time use.

**🔴 Expert Example** — WebAuthn with `py_webauthn` integration behind feature flag.

**🌍 Real-Time Example** — SaaS admin console mandates MFA; customers optional.

---

### 12.7.3 JWT Tokens

Stateless bearer tokens for APIs; short-lived access + refresh pattern.

**🟢 Beginner Example**

```python
import jwt
from datetime import datetime, timedelta, timezone

def mint_access_token(user_id: int, secret: str) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, secret, algorithm="HS256")
```

**🟡 Intermediate Example** — asymmetric RS256 with JWKS for microservices.

**🔴 Expert Example** — token binding, rotation, revocation list for compromised refresh tokens.

**🌍 Real-Time Example** — mobile app uses JWT; web uses Flask-Login sessions.

---

### 12.7.4 Custom Authentication

Header `X-API-Key` hashed in DB for machine clients.

**🟢 Beginner Example**

```python
@app.before_request
def load_api_user():
    key = request.headers.get("X-API-Key", "")
    if not key:
        return
    token = ApiToken.query.filter_by(key_hash=hash_key(key), revoked=False).first()
    if token:
        g.api_user = token.user
```

**🟡 Intermediate Example** — scope checks per route.

**🔴 Expert Example** — HMAC request signing for webhooks (different from user auth).

**🌍 Real-Time Example** — SaaS partner API keys with monthly rotation.

---

### 12.7.5 Third-Party Integration

SAML/OIDC via managed services (Auth0, Okta, Cognito).

**🟢 Beginner Example** — delegate login UI to provider hosted page.

**🟡 Intermediate Example** — map IdP groups to local roles on JIT provisioning.

**🔴 Expert Example** — SCIM user lifecycle automation.

**🌍 Real-Time Example** — enterprise SaaS: SSO required for `@customer.com` emails.

---

## Best Practices

1. **Hash passwords** with Werkzeug (or approved library); never store plaintext.
2. **HTTPS only** in production; secure cookies.
3. **CSRF protect** session-authenticated POST routes (Flask-WTF).
4. **Rate limit** login and reset endpoints.
5. **Generic errors** on login to reduce account enumeration (balance with UX).
6. **Email verification** for sensitive actions.
7. **Audit security events** (login failures, password changes).
8. **Separate admin auth** domain or stricter policies when risk is higher.
9. **Rotate secrets** with a documented process.
10. **Test** auth flows including remember-me and OAuth callback edge cases.

**🟢 Beginner Example** — `LoginManager.login_view` set on all environments.

**🟡 Intermediate Example** — integration tests posting login form with test client.

**🔴 Expert Example** — chaos test session store failure behavior.

**🌍 Real-Time Example** — e‑commerce: monitor spike in failed logins as fraud signal.

---

## Common Mistakes to Avoid

1. **Weak `SECRET_KEY`** or committed to git.
2. **Storing passwords** in session or logs.
3. **Missing `@login_required`** on mutating routes.
4. **Open redirects** via unchecked `next` parameter.
5. **JWT in localStorage** vulnerable to XSS—prefer HttpOnly cookies for web when possible.
6. **Email as both identifier and verification channel** without handling change carefully.
7. **Remember me** on shared kiosks.
8. **Leaking user existence** via password reset timing.
9. **Not invalidating sessions** on password change.
10. **Rolling custom crypto** for tokens—use `secrets` module / standard JWT libraries.

**🟢 Beginner Example** — fix: `next` validation:

```python
from urllib.parse import urlparse

def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ("http", "https") and ref_url.netloc == test_url.netloc
```

**🟡 Intermediate Example** — fix: session regeneration on login (`session.clear()` before `login_user` pattern varies—document team approach).

**🔴 Expert Example** — fix: store only hashed API keys.

**🌍 Real-Time Example** — OAuth misconfiguration exposing `client_secret` in frontend bundle.

---

## Comparison Tables

### Session auth vs JWT

| Aspect | Flask-Login session | JWT access token |
|--------|---------------------|------------------|
| Revocation | Easy (server session) | Harder (short TTL + denylist) |
| Mobile | Cookies tricky | Common |
| CSRF | Risk on cookies | Less for Bearer (XSS risk) |
| Scale | Sticky sessions or server store | Stateless verification |

### Password hashing parameters

| Concern | Guidance |
|---------|----------|
| Salt | Automatic in Werkzeug hash string |
| Work factor | Increase over years as CPUs improve |
| Algorithm | Follow Werkzeug defaults unless policy dictates |

### MFA factors ranked (typical)

| Factor | Strength notes |
|--------|----------------|
| WebAuthn | Phishing resistant |
| TOTP app | Good, shared secret |
| SMS | Weaker (SIM swap) |

---

*End of Authentication notes — Flask 3.1.3, Python 3.9+.*
