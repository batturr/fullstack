# Django Authentication (Django 6.0.3)

Django’s **authentication** stack ties together **users**, **sessions**, **password hashing**, and **permission** metadata. Think of it as the server-side counterpart to **front-end auth libraries**: credentials become a **`User`** object on **`request.user`**, backed by pluggable **backends** and **middleware**. These notes target **Django 6.0.3** on **Python 3.12–3.14**, with **e‑commerce accounts**, **social identity**, **SaaS workspaces**, and **API tokens**.

---

## 📑 Table of Contents

- [11.1 User Model](#111-user-model)
  - [11.1.1 Default User Model](#1111-default-user-model)
  - [11.1.2 Custom User Model](#1112-custom-user-model)
  - [11.1.3 User Fields](#1113-user-fields)
  - [11.1.4 User Methods](#1114-user-methods)
  - [11.1.5 Extending User Model](#1115-extending-user-model)
- [11.2 User Registration](#112-user-registration)
  - [11.2.1 User Creation](#1121-user-creation)
  - [11.2.2 Password Hashing](#1122-password-hashing)
  - [11.2.3 Password Validators](#1123-password-validators)
  - [11.2.4 Registration Forms](#1124-registration-forms)
  - [11.2.5 Email Verification](#1125-email-verification)
- [11.3 Login and Logout](#113-login-and-logout)
  - [11.3.1 authenticate()](#1131-authenticate)
  - [11.3.2 login()](#1132-login)
  - [11.3.3 logout()](#1133-logout)
  - [11.3.4 Session Management](#1134-session-management)
  - [11.3.5 Login View Implementation](#1135-login-view-implementation)
- [11.4 Password Management](#114-password-management)
  - [11.4.1 Password Reset Flow](#1141-password-reset-flow)
  - [11.4.2 PasswordResetView](#1142-passwordresetview)
  - [11.4.3 Password Change](#1143-password-change)
  - [11.4.4 Password Tokens](#1144-password-tokens)
  - [11.4.5 Email Confirmation](#1145-email-confirmation)
- [11.5 Authentication Decorators](#115-authentication-decorators)
  - [11.5.1 @login_required](#1151-login_required)
  - [11.5.2 @permission_required](#1152-permission_required)
  - [11.5.3 @user_passes_test](#1153-user_passes_test)
  - [11.5.4 @require_http_methods with Auth](#1154-require_http_methods-with-auth)
  - [11.5.5 Multiple Decorator Combinations](#1155-multiple-decorator-combinations)
- [11.6 Social Authentication](#116-social-authentication)
  - [11.6.1 OAuth2 Concepts](#1161-oauth2-concepts)
  - [11.6.2 django-allauth](#1162-django-allauth)
  - [11.6.3 Social Login Providers](#1163-social-login-providers)
  - [11.6.4 Connecting Accounts](#1164-connecting-accounts)
  - [11.6.5 Profile Data](#1165-profile-data)
- [11.7 Two-Factor Authentication](#117-two-factor-authentication)
  - [11.7.1 TOTP](#1171-totp)
  - [11.7.2 SMS OTP](#1172-sms-otp)
  - [11.7.3 Backup Codes](#1173-backup-codes)
  - [11.7.4 2FA Implementation](#1174-2fa-implementation)
  - [11.7.5 django-otp](#1175-django-otp)
- [11.8 Token Authentication](#118-token-authentication)
  - [11.8.1 Token Model](#1181-token-model)
  - [11.8.2 Token Generation](#1182-token-generation)
  - [11.8.3 Token Validation](#1183-token-validation)
  - [11.8.4 Token Expiration](#1184-token-expiration)
  - [11.8.5 Token Usage](#1185-token-usage)
- [Best Practices (Chapter Summary)](#best-practices-chapter-summary)
- [Common Mistakes (Chapter Summary)](#common-mistakes-chapter-summary)
- [Comparison Tables](#comparison-tables)

---

## 11.1 User Model

### 11.1.1 Default User Model

**`django.contrib.auth.models.User`**: **`username`**, **`password`**, **`email`**, **`first_name`**, **`last_name`**, flags **`is_staff`**, **`is_superuser`**, **`is_active`**, **`date_joined`**.

**🟢 Beginner Example**

```python
from django.contrib.auth.models import User
user = User.objects.create_user("ada", password="secret123!")
```

**🟡 Intermediate Example**

```python
user = User.objects.create_user("grace", email="grace@example.com", password="x", first_name="Grace")
```

**🔴 Expert Example**

```python
# Avoid create() without hashing
User.objects.create_user(..., is_active=False)  # pending verification
```

**🌍 Real-Time Example (e‑commerce)**

Store **`User`** for purchasers; guest checkout may use **`AnonymousUser`**.

---

### 11.1.2 Custom User Model

**`AUTH_USER_MODEL = 'myapp.User'`** set **before first migration**. Subclass **`AbstractUser`** (username-based) or **`AbstractBaseUser`** + **`PermissionsMixin`** (custom identifier).

**🟢 Beginner Example**

```python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass
```

**🟡 Intermediate Example**

```python
class User(AbstractUser):
    tenant = models.ForeignKey("Tenant", on_delete=models.CASCADE, null=True, blank=True)
```

**🔴 Expert Example**

```python
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save()
        return user

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()
```

**🌍 Real-Time Example (SaaS)**

Email-only login with **`tenant_id`** on profile.

---

### 11.1.3 User Fields

**`last_login`**, password field **`password`** (hashed string).

**🟢 Beginner Example**

```python
user.email = "new@example.com"
user.save()
```

**🟡 Intermediate Example**

```python
user.set_password("new-strong-password")
user.save(update_fields=["password"])
```

**🔴 Expert Example**

Use **`update_fields`** to avoid clobbering concurrent writes.

**🌍 Real-Time Example**

Social: store **`display_name`** on profile model, not **`User.username`**.

---

### 11.1.4 User Methods

**`check_password`**, **`has_perm`**, **`get_username`**, **`get_full_name`**.

**🟢 Beginner Example**

```python
if user.check_password(raw):
    ...
```

**🟡 Intermediate Example**

```python
if user.has_perm("shop.change_product"):
    ...
```

**🔴 Expert Example**

Custom user: override **`get_full_name`** for organization directory.

**🌍 Real-Time Example**

SaaS admin impersonation logs **`get_username()`**.

---

### 11.1.5 Extending User Model

**Profile pattern**: **`OneToOneField(User)`** vs single custom user model.

**🟢 Beginner Example**

```python
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
```

**🟡 Intermediate Example**

Signals to create **`Profile`** on **`User`** creation.

**🔴 Expert Example**

```python
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def ensure_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
```

**🌍 Real-Time Example**

E‑commerce: **`CustomerProfile`** with loyalty tier.

---

## 11.2 User Registration

### 11.2.1 User Creation

**`create_user`** hashes password; **`create_superuser`** sets flags.

**🟢 Beginner Example**

```python
User.objects.create_user("bob", password="pass")
```

**🟡 Intermediate Example**

```python
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_user(email="a@b.com", password="x")
```

**🔴 Expert Example**

```python
user = User(email=email, is_active=False)
user.set_password(password)
user.save()
```

**🌍 Real-Time Example**

SaaS self-serve signup + Stripe customer creation after verify.

---

### 11.2.2 Password Hashing

**`PASSWORD_HASHERS`** list; default **PBKDF2**. Use **`set_password`**.

**🟢 Beginner Example**

```python
user.set_password("hunter2")
user.save()
```

**🟡 Intermediate Example**

```python
# settings.py
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]
```

**🔴 Expert Example**

Rehash on login when hasher upgraded:

```python
from django.contrib.auth.hashers import identify_hasher

# Django may update password if hasher preference changes on successful auth
```

**🌍 Real-Time Example**

High-security SaaS: **Argon2** + rate limiting.

---

### 11.2.3 Password Validators

**`AUTH_PASSWORD_VALIDATORS`**: length, similarity, common passwords, numeric.

**🟢 Beginner Example**

```python
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
]
```

**🟡 Intermediate Example**

Custom validator in **`validators.py`**.

**🔴 Expert Example**

Breach password list integration (Have I Been Pwned k-anonymity API) in worker.

**🌍 Real-Time Example**

E‑commerce: stricter rules for merchant accounts than shoppers.

---

### 11.2.4 Registration Forms

**`UserCreationForm`**, custom **`ModelForm`**.

**🟢 Beginner Example**

```python
from django.contrib.auth.forms import UserCreationForm

class SignupForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ("email",)
```

**🟡 Intermediate Example**

```python
class RegisterForm(forms.ModelForm):
    password1 = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ["email"]

    def clean(self):
        data = super().clean()
        if data["password1"] != data["password2"]:
            raise ValidationError("Passwords must match.")
        return data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user
```

**🔴 Expert Example**

CAPTCHA / honeypot fields for bot mitigation.

**🌍 Real-Time Example**

Social: invite-only registration with **`Invitation`** token field.

---

### 11.2.5 Email Verification

Send signed token link; flip **`is_active`** or set **`email_verified_at`**.

**🟢 Beginner Example**

```python
from django.contrib.auth.tokens import default_token_generator
token = default_token_generator.make_token(user)
```

**🟡 Intermediate Example**

```python
uid = urlsafe_base64_encode(force_bytes(user.pk))
link = request.build_absolute_uri(reverse("verify_email", args=[uid, token]))
```

**🔴 Expert Example**

Store **`EmailVerification`** rows with expiry and single-use consumption.

**🌍 Real-Time Example**

SaaS trial: block billing until email verified.

---

## 11.3 Login and Logout

### 11.3.1 authenticate()

Returns **`User`** or **`None`**; credentials kwargs depend on **`ModelBackend`**.

**🟢 Beginner Example**

```python
from django.contrib.auth import authenticate
user = authenticate(request, username="ada", password="secret")
```

**🟡 Intermediate Example**

```python
user = authenticate(request, email=email, password=password)
```

**🔴 Expert Example**

Multi-backend:

```python
AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend", "myapp.backends.EmailOTPBackend"]
```

**🌍 Real-Time Example**

SaaS: subdomain-scoped auth backend adds **`tenant`** constraint.

---

### 11.3.2 login()

Binds user to **session**; requires **`SessionMiddleware`**.

**🟢 Beginner Example**

```python
from django.contrib.auth import login
login(request, user)
```

**🟡 Intermediate Example**

```python
login(request, user, backend="django.contrib.auth.backends.ModelBackend")
```

**🔴 Expert Example**

Regenerate session key after login to mitigate fixation:

```python
from django.contrib.auth import login
request.session.cycle_key()
login(request, user)
```

**🌍 Real-Time Example**

E‑commerce: remember **cart merge** on login signal.

---

### 11.3.3 logout()

Clears session user.

**🟢 Beginner Example**

```python
from django.contrib.auth import logout
logout(request)
```

**🟡 Intermediate Example**

```python
logout(request)
messages.info(request, "Signed out.")
```

**🔴 Expert Example**

OIDC logout redirect with **`request`** session cleanup + IdP end session.

**🌍 Real-Time Example**

SaaS: revoke **refresh tokens** on logout if using JWT alongside session.

---

### 11.3.4 Session Management

**`SESSION_ENGINE`**, **`SESSION_COOKIE_SECURE`**, **`SESSION_COOKIE_HTTPONLY`**.

**🟢 Beginner Example**

```python
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7
```

**🟡 Intermediate Example**

```python
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
```

**🔴 Expert Example**

**`SESSION_SAVE_EVERY_REQUEST = True`** for sliding expiration (trade-offs).

**🌍 Real-Time Example**

Banking-style SaaS: short idle timeout + re-auth for sensitive actions.

---

### 11.3.5 Login View Implementation

**`LoginView`**, **`AuthenticationForm`**, or manual.

**🟢 Beginner Example**

```python
from django.contrib.auth.views import LoginView

urlpatterns = [path("login/", LoginView.as_view(template_name="login.html"))]
```

**🟡 Intermediate Example**

```python
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return redirect("home")
    else:
        form = AuthenticationForm()
    return render(request, "login.html", {"form": form})
```

**🔴 Expert Example**

Add **2FA** step: partial auth state in session before **`login`**.

**🌍 Real-Time Example**

Social: OAuth callback view finishes **`login`**.

---

## 11.4 Password Management

### 11.4.1 Password Reset Flow

**Forgot password** → email → tokenized link → **`set_password`**.

**🟢 Beginner Example**

Use built-in **`PasswordResetView`**.

**🟡 Intermediate Example**

Customize templates **`registration/password_reset_email.html`**.

**🔴 Expert Example**

Audit log each reset request with IP + rate limit.

**🌍 Real-Time Example**

E‑commerce: throttle resets per email + per IP.

---

### 11.4.2 PasswordResetView

Class-based, sends mail via **`EmailBackend`**.

**🟢 Beginner Example**

```python
path("reset/", PasswordResetView.as_view(), name="password_reset")
```

**🟡 Intermediate Example**

```python
class BrandedPasswordReset(PasswordResetView):
    html_email_template_name = "emails/password_reset.html"
```

**🔴 Expert Example**

Use **Celery** task to send async with retry.

**🌍 Real-Time Example**

SaaS multi-tenant: pass **`tenant`** branding into email context.

---

### 11.4.3 Password Change

**`PasswordChangeView`** for authenticated users.

**🟢 Beginner Example**

```python
path("password/change/", PasswordChangeView.as_view(), name="password_change")
```

**🟡 Intermediate Example**

```python
class PasswordChangeForm(forms.Form):
    old_password = forms.CharField(widget=forms.PasswordInput)
    new_password1 = forms.CharField(widget=forms.PasswordInput)
    new_password2 = forms.CharField(widget=forms.PasswordInput)
```

**🔴 Expert Example**

Require recent re-auth (**`django.contrib.auth.decorators.user_passes_test`**) before change.

**🌍 Real-Time Example**

Enterprise SSO: disable local password change when **`user.has_usable_password()`** is False.

---

### 11.4.4 Password Tokens

**`default_token_generator`** combines **`user.pk`**, **`password` field`**, **`last_login`**, **`timestamp`**.

**🟢 Beginner Example**

```python
default_token_generator.check_token(user, token)
```

**🟡 Intermediate Example**

Custom generator with HMAC secret rotation.

**🔴 Expert Example**

Single-use tokens stored hashed in DB for higher assurance.

**🌍 Real-Time Example**

Invite links for workspace admins.

---

### 11.4.5 Email Confirmation

Same machinery as reset with different view paths.

**🟢 Beginner Example**

Reuse **`PasswordResetTokenGenerator`** subclass.

**🟡 Intermediate Example**

```python
from django.contrib.auth.tokens import PasswordResetTokenGenerator

class EmailVerifyTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return f"{user.is_active}{user.pk}{timestamp}{user.email}"

email_verify_token = EmailVerifyTokenGenerator()
```

**🔴 Expert Example**

Signed **`django.core.signing.TimestampSigner`** for stateless emails.

**🌍 Real-Time Example**

Double opt-in mailing lists (marketing) vs account verify.

---

## 11.5 Authentication Decorators

### 11.5.1 @login_required

Redirects to **`LOGIN_URL`** if anonymous.

**🟢 Beginner Example**

```python
from django.contrib.auth.decorators import login_required

@login_required
def dashboard(request):
    return render(request, "dashboard.html")
```

**🟡 Intermediate Example**

```python
@login_required(login_url="/accounts/login/")
def checkout(request):
    ...
```

**🔴 Expert Example**

```python
@login_required(redirect_field_name="next")
def profile(request):
    ...
```

**🌍 Real-Time Example**

E‑commerce **`/checkout/`** requires login.

---

### 11.5.2 @permission_required

Raises **`PermissionDenied`** or redirects.

**🟢 Beginner Example**

```python
from django.contrib.auth.decorators import permission_required

@permission_required("blog.add_post", raise_exception=True)
def write(request):
    ...
```

**🟡 Intermediate Example**

```python
@permission_required(["shop.change_product", "shop.view_product"], raise_exception=True)
```

**🔴 Expert Example**

Map to **view-level** coarse permissions; object-level needs more (see Authorization chapter).

**🌍 Real-Time Example**

SaaS admin tools.

---

### 11.5.3 @user_passes_test

Arbitrary predicate on **`user`**.

**🟢 Beginner Example**

```python
from django.contrib.auth.decorators import user_passes_test

def email_verified(user):
    return bool(getattr(user, "profile", None) and user.profile.email_verified)

@user_passes_test(email_verified)
def billing(request):
    ...
```

**🟡 Intermediate Example**

```python
@user_passes_test(lambda u: u.is_staff)
def internal_metrics(request):
    ...
```

**🔴 Expert Example**

Close over **`request`** via **CBV** **`UserPassesTestMixin`** instead.

**🌍 Real-Time Example**

Merchant portal: **`user.groups.filter(name="merchant").exists()`**.

---

### 11.5.4 @require_http_methods with Auth

Restrict verbs then apply auth.

**🟢 Beginner Example**

```python
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required

@require_http_methods(["GET", "POST"])
@login_required
def edit_post(request, pk):
    ...
```

**🟡 Intermediate Example**

**`@require_POST`** for destructive actions.

**🔴 Expert Example**

**CSRF** + **auth** + **method** ordering documented in security guide.

**🌍 Real-Time Example**

API-like HTML endpoints: POST only + login.

---

### 11.5.5 Multiple Decorator Combinations

Order matters: **bottom** decorator wraps first.

**🟢 Beginner Example**

```python
@login_required
@require_http_methods(["GET"])
def safe_view(request):
    ...
```

**🟡 Intermediate Example**

```python
from django.views.decorators.csrf import csrf_exempt  # only if justified

@csrf_exempt  # dangerous for session views
@login_required
def bad_pattern(request):
    ...
```

**🔴 Expert Example**

Prefer **`csrf_protect`** + **`login_required`** for POST.

**🌍 Real-Time Example**

Webhook endpoints: **`csrf_exempt`** + **signature** verification, not session login.

---

## 11.6 Social Authentication

### 11.6.1 OAuth2 Concepts

**Authorization code** flow, **access tokens**, **scopes**, **redirect URIs**.

**🟢 Beginner Example**

User clicks **“Continue with Google”** → redirect to provider.

**🟡 Intermediate Example**

Exchange **`code`** at token endpoint server-side.

**🔴 Expert Example**

**PKCE** for public clients; store **refresh tokens** encrypted.

**🌍 Real-Time Example**

SaaS SSO for enterprise customers.

---

### 11.6.2 django-allauth

Popular package integrating local + social accounts.

**🟢 Beginner Example**

```python
INSTALLED_APPS += ["allauth", "allauth.account", "allauth.socialaccount", "allauth.socialaccount.providers.google"]
```

**🟡 Intermediate Example**

Configure **`SOCIALACCOUNT_PROVIDERS`** with **scopes**.

**🔴 Expert Example**

Custom **adapter** to enforce **`email_verified`** only.

**🌍 Real-Time Example**

Social network: link **Instagram** for creator tools.

---

### 11.6.3 Social Login Providers

Google, GitHub, Facebook, etc.

**🟢 Beginner Example**

Add provider in Django admin **Social applications**.

**🟡 Intermediate Example**

Separate **dev** vs **prod** OAuth client IDs via settings.

**🔴 Expert Example**

Per-tenant OAuth clients for white-label SaaS.

**🌍 Real-Time Example**

Marketplace sellers connect **Shopify** OAuth.

---

### 11.6.4 Connecting Accounts

Link **`SocialAccount`** to existing **`User`** by verified email.

**🟢 Beginner Example**

Enable **`SOCIALACCOUNT_AUTO_SIGNUP`**.

**🟡 Intermediate Example**

Prompt merge flow if email exists.

**🔴 Expert Example**

Require password re-entry before linking sensitive providers.

**🌍 Real-Time Example**

User signed up with email later adds **Google**.

---

### 11.6.5 Profile Data

Map claims to **`Profile`** fields in signal or adapter.

**🟢 Beginner Example**

```python
def populate_profile(sociallogin, user):
    extra = sociallogin.account.extra_data
    user.first_name = extra.get("given_name", "")
```

**🟡 Intermediate Example**

Download and store avatar image to **`MEDIA`**.

**🔴 Expert Example**

GDPR: minimize stored PII from provider payloads.

**🌍 Real-Time Example**

Pull **GitHub** **`login`** as suggested **`handle`**.

---

## 11.7 Two-Factor Authentication

### 11.7.1 TOTP

Time-based one-time passwords (**RFC 6238**).

**🟢 Beginner Example**

User scans QR in authenticator app.

**🟡 Intermediate Example**

Store **`secret`** encrypted; verify window ±1 step.

**🔴 Expert Example**

Hardware keys via **WebAuthn** (parallel track to TOTP).

**🌍 Real-Time Example**

SaaS admin consoles.

---

### 11.7.2 SMS OTP

Deliver codes via Twilio/MessageBird.

**🟢 Beginner Example**

Send 6-digit code, store hashed in cache with TTL.

**🟡 Intermediate Example**

Rate limit per phone number.

**🔴 Expert Example**

SIM-swap risk disclosures; prefer TOTP/WebAuthn.

**🌍 Real-Time Example**

E‑commerce high-value transaction step-up.

---

### 11.7.3 Backup Codes

One-time recovery codes.

**🟢 Beginner Example**

Generate 10 codes, show once, store hashed.

**🟡 Intermediate Example**

Invalidate all on disable 2FA.

**🔴 Expert Example**

Audit consumption per code.

**🌍 Real-Time Example**

Developer tools SaaS for **`npm`-style** tokens + backup codes.

---

### 11.7.4 2FA Implementation

Middleware or view decorator gating **`login`** completion.

**🟢 Beginner Example**

After password OK, render **`totp_verify.html`**.

**🟡 Intermediate Example**

Mark **`request.session["twofa_passed"]=True`** after success.

**🔴 Expert Example**

Step-up for **`/billing/transfer`**.

**🌍 Real-Time Example**

Banking-style SaaS.

---

### 11.7.5 django-otp

Provides **`TOTPDevice`**, middleware, admin integration.

**🟢 Beginner Example**

```python
INSTALLED_APPS += ["django_otp", "django_otp.plugins.otp_totp"]
```

**🟡 Intermediate Example**

```python
from django_otp.decorators import otp_required

@otp_required
def wire_transfer(request):
    ...
```

**🔴 Expert Example**

Combine with **custom admin** site subclass.

**🌍 Real-Time Example**

Internal ops tools.

---

## 11.8 Token Authentication

### 11.8.1 Token Model

**`rest_framework.authtoken`** **`Token`** one-to-one user (DRF). Django core focuses on **session**; tokens usually **DRF** or **JWT**.

**🟢 Beginner Example**

```python
from rest_framework.authtoken.models import Token
token, _ = Token.objects.get_or_create(user=user)
```

**🟡 Intermediate Example**

Custom **`ApiKey`** model with **`prefix`**, **`hashed_secret`**.

**🔴 Expert Example**

Store only **hash** of secret like passwords.

**🌍 Real-Time Example**

SaaS public API keys for integrations.

---

### 11.8.2 Token Generation

**`secrets.token_urlsafe`**, **`uuid4`**, HMAC-based.

**🟢 Beginner Example**

```python
import secrets
raw = secrets.token_hex(32)
```

**🟡 Intermediate Example**

```python
key = ApiKey.objects.create(user=user, prefix=raw[:8], digest=make_password(raw))
return raw  # show once
```

**🔴 Expert Example**

**JWT** signed with rotating **`kid`** keys.

**🌍 Real-Time Example**

Mobile app refresh tokens.

---

### 11.8.3 Token Validation

**`Authorization: Bearer`**, **`Token abc`** (DRF).

**🟢 Beginner Example**

```python
class HasToken(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.auth is not None
```

**🟡 Intermediate Example**

Lookup **`ApiKey`** by prefix then verify hash.

**🔴 Expert Example**

**Opaque tokens** introspected via auth service.

**🌍 Real-Time Example**

Partner webhooks HMAC **`X-Signature`** instead of bearer.

---

### 11.8.4 Token Expiration

**TTL**, refresh rotation, revocation lists.

**🟢 Beginner Example**

```python
expires_at = timezone.now() + timedelta(days=30)
```

**🟡 Intermediate Example**

**Redis** denylist for revoked JWT **`jti`**.

**🔴 Expert Example**

Short-lived access + long-lived refresh with **reuse detection**.

**🌍 Real-Time Example**

SaaS OAuth client credentials for M2M.

---

### 11.8.5 Token Usage

**`curl -H "Authorization: Token ..."`**

**🟢 Beginner Example**

DRF **`TokenAuthentication`**.

**🟡 Intermediate Example**

Scoped tokens: **`scopes`** JSON field.

**🔴 Expert Example**

**mTLS** for service accounts.

**🌍 Real-Time Example**

E‑commerce mobile app checkout API.

---

## Best Practices (Chapter Summary)

- Set **`AUTH_USER_MODEL`** before first migration if customizing user.
- Always **`set_password`**, never assign **`password`** raw string.
- Use **`get_user_model()`** instead of importing **`User`** directly.
- Enable **`SESSION_COOKIE_SECURE`** and **`CSRF_COOKIE_SECURE`** in production HTTPS.
- Rate-limit login and password reset endpoints.
- Prefer **verified email** before granting sensitive capabilities.
- For APIs, prefer **short-lived tokens** + rotation over long-lived static keys when feasible.
- Log auth events with care for **PII** and **GDPR**.

---

## Common Mistakes (Chapter Summary)

- Changing **`AUTH_USER_MODEL`** mid-project without migration strategy.
- Using **`User.objects.create`** with plaintext passwords.
- **Session fixation**—not cycling session key on login.
- Trusting **`email`** from OAuth without **`verified`** claim.
- Storing **JWTs** in **`localStorage`** (XSS risk) vs **`httpOnly`** cookies trade-offs misunderstood.
- **`@csrf_exempt`** on session-authenticated POST views.
- Forgetting **`login(request, backend=...)`** when multiple backends and Django warns.

---

## Comparison Tables

| Construct | Purpose |
|-----------|---------|
| Session | Browser cookie session id |
| Token (opaque) | API clients |
| JWT | Stateless claims (verify signature) |

| API | Anonymous | Authenticated |
|-----|-----------|----------------|
| `request.user` | `AnonymousUser` | `User` instance |

| Decorator | Effect |
|-----------|--------|
| `login_required` | Must be signed in |
| `permission_required` | Django perm string |
| `user_passes_test` | Custom predicate |

| Flow | Mechanism |
|------|-----------|
| Password reset | Email + signed token |
| Email verify | Similar token pattern |
| OAuth login | Redirect + code exchange |

---

*Align implementation details with **Django 6.0.3** and third-party package docs (allauth, DRF, django-otp) for exact settings names.*
