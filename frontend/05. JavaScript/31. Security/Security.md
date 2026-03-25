# JavaScript Security

Web applications that run in the browser and on Node.js face a wide range of threats: attackers can steal sessions, run scripts in your users’ browsers, trick users into unwanted actions, or exfiltrate data. This guide explains common vulnerabilities, how to validate and protect data, how authentication and transport security fit together, and practical patterns you can implement in JavaScript. **Never use `innerHTML` with untrusted data—use `textContent`. Always validate and sanitize user input. Never store secrets in client-side code. On the server, use parameterized queries for databases.**

---

## 📑 Table of Contents

1. [Common Vulnerabilities](#1-common-vulnerabilities)
2. [Input Validation](#2-input-validation)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Secure Communication](#4-secure-communication)
5. [Data Protection](#5-data-protection)
6. [Security Best Practices](#6-security-best-practices)
7. [Summary: Best Practices](#summary-best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Common Vulnerabilities

### 1.1 Cross-Site Scripting (XSS)

XSS occurs when untrusted data is interpreted as HTML or JavaScript in a victim’s browser. Attackers can steal cookies (when not `HttpOnly`), hijack sessions, or deface the UI.

#### Stored XSS

Malicious input is saved (e.g., in a database) and later rendered to other users without encoding.

```javascript
// VULNERABLE: server returns comment HTML; client injects with innerHTML
async function loadComments() {
  const res = await fetch('/api/comments');
  const comments = await res.json();
  const list = document.getElementById('comments');
  comments.forEach((c) => {
    const div = document.createElement('div');
    // NEVER: attacker stored <script> or <img onerror=...>
    div.innerHTML = c.body;
    list.appendChild(div);
  });
}

// SAFER: treat comment as plain text
async function loadCommentsSafe() {
  const res = await fetch('/api/comments');
  const comments = await res.json();
  const list = document.getElementById('comments');
  comments.forEach((c) => {
    const div = document.createElement('div');
    div.textContent = c.body;
    list.appendChild(div);
  });
}
```

#### Reflected XSS

The payload is reflected in the response immediately (often via URL query parameters) without persistence.

```javascript
// VULNERABLE: echoing search query into the page via innerHTML
function showSearchResult() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  document.getElementById('result').innerHTML = `You searched for: ${q}`;
  // URL: ?q=<img src=x onerror=alert(1)>
}

// SAFER
function showSearchResultSafe() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const el = document.getElementById('result');
  el.textContent = '';
  el.appendChild(document.createTextNode(`You searched for: ${q}`));
}
```

#### DOM-based XSS

The sink is in client-side JavaScript (e.g., `eval`, `innerHTML`, `document.write`) that processes attacker-controlled data from the URL, storage, or messages.

```javascript
// VULNERABLE: reading hash and writing to HTML
function renderFromHash() {
  const fragment = window.location.hash.slice(1);
  document.getElementById('panel').innerHTML = decodeURIComponent(fragment);
}

// SAFER: do not use HTML sinks; validate and use text or a safe templating strategy
function renderFromHashSafe() {
  const fragment = window.location.hash.slice(1);
  const decoded = decodeURIComponent(fragment);
  // Whitelist allowed pattern, e.g. only alphanumeric slug
  if (!/^[a-z0-9-]{1,64}$/i.test(decoded)) {
    document.getElementById('panel').textContent = 'Invalid fragment';
    return;
  }
  document.getElementById('panel').textContent = decoded;
}
```

**Mitigations:** encode output for the correct context (HTML, attribute, URL, JS), use a strict Content Security Policy (CSP), avoid dangerous sinks, and set cookies with `HttpOnly` and `Secure` where appropriate.

### 1.2 Cross-Site Request Forgery (CSRF)

The victim’s browser sends a forged request to your site with the victim’s cookies, because the browser automatically attaches session cookies to same-site requests.

```javascript
// Legitimate form POST from your app (simplified)
async function updateEmail(newEmail) {
  await fetch('/api/user/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: newEmail }),
  });
}

// Attacker’s page (on evil.com) cannot read your cookies, but might trigger
// a simple form or GET that changes state if your API only checks cookies:
// <form action="https://yoursite.com/api/user/email" method="POST">...</form>
```

**Mitigations (server-led):** CSRF tokens in forms, `SameSite` cookies (`Lax` or `Strict`), custom headers requiring a secret the attacker’s origin cannot set for cross-origin simple requests, and re-authentication for sensitive actions.

```javascript
// Client: send CSRF token from cookie or meta tag in header (double-submit or synchronizer pattern)
async function postWithCsrf(url, body) {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });
}
```

### 1.3 Injection Attacks

**SQL injection** (server): attacker-controlled strings concatenated into SQL.

```javascript
// NEVER (Node example): string concatenation
// const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ALWAYS: parameterized queries (pg example)
// await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**Command injection** (server): passing user input to `exec` or shells.

```javascript
// NEVER
// const { exec } = require('child_process');
// exec(`convert ${userFilename} out.png`);

// Prefer: spawn with array args, validate filenames against a whitelist
// const { spawn } = require('child_process');
// spawn('convert', [safePath, 'out.png']);
```

**NoSQL injection**: treat query objects as untrusted; validate types and allowed operators before building queries.

### 1.4 Clickjacking

The victim clicks what looks like a harmless UI while actually clicking a transparent iframe over a sensitive page (e.g., “Delete account”).

**Mitigations:** `X-Frame-Options: DENY` or `SAMEORIGIN`, or CSP `frame-ancestors 'none'`.

```javascript
// Client cannot reliably prevent being framed; rely on HTTP headers from server.
// You can detect some cases for UX only (not a security boundary):
if (window.self !== window.top) {
  // Optional: break out — does not stop all clickjacking variants
  // window.top.location = window.self.location;
}
```

### 1.5 Man-in-the-Middle (MITM)

An attacker on the network intercepts or alters traffic if it is not encrypted or if TLS is stripped/broken.

**Mitigations:** enforce HTTPS, HSTS (`Strict-Transport-Security`), certificate pinning for native apps (rarely in browsers), and never send secrets over HTTP.

```javascript
// In browser: prefer relative URLs on same origin so scheme matches the page
const apiUrl = '/api/data'; // inherits HTTPS when page is HTTPS

// Never hardcode http:// for auth or PII endpoints
// const bad = 'http://api.example.com/login';
```

---

## 2. Input Validation

Client-side validation improves UX; **server-side validation is mandatory** for security.

### 2.1 Client-Side Validation

```javascript
function validateEmail(value) {
  // Simple format check — server must re-validate
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRe.test(value);
}

function onSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!validateEmail(email)) {
    alert('Invalid email');
    return;
  }
  // send to server — server validates again
}
```

### 2.2 Sanitization: `textContent` vs `innerHTML`

```javascript
const userInput = '<img src=x onerror="steal()">';

// UNSAFE
// document.getElementById('out').innerHTML = userInput;

// SAFE for plain text display
document.getElementById('out').textContent = userInput;

// If you must allow limited HTML, use a vetted library (DOMPurify) on client
// and sanitize on server; never roll your own HTML sanitizer for rich text.

// Example pattern with DOMPurify (after npm install dompurify + appropriate DOM in bundler):
// import DOMPurify from 'dompurify';
// el.innerHTML = DOMPurify.sanitize(userHtml, { USE_PROFILES: { html: true } });
```

> Always re-sanitize on the server before storage; the client cannot be trusted.

### 2.3 Whitelisting vs Blacklisting

Whitelisting (allow only known-good values) is stronger than blacklisting (block known-bad patterns).

```javascript
// Whitelist role for an API payload (conceptual)
const ALLOWED_ROLES = new Set(['user', 'moderator']);

function sanitizeRole(input) {
  return ALLOWED_ROLES.has(input) ? input : 'user';
}

// Blacklisting is fragile — attackers find bypasses
function badBlackList(html) {
  return html.replace(/<script/gi, ''); // easily bypassed: <scr<script>ipt>
}
```

### 2.4 RegExp Safety and ReDoS

Catastrophic backtracking can make a regex hang on malicious input (Regular Expression Denial of Service).

```javascript
// RISKY: nested quantifiers on unbounded input
const risky = /^(\d+)+$/;

function safeTest(pattern, input, maxLen = 1000) {
  if (input.length > maxLen) return false;
  return pattern.test(input);
}

// Prefer: atomic groups / possessive quantifiers where supported, or simpler patterns
const safer = /^\d{1,20}$/;

// In Node, you can use `re2` for some safe patterns; always cap input length and timeouts on server
```

---

## 3. Authentication & Authorization

### 3.1 JWT: Structure, Signing, Verification

A JSON Web Token has three Base64URL-encoded parts: **header** (algorithm, type), **payload** (claims), **signature**.

```javascript
// Decoding payload for inspection ONLY — signature NOT verified (do not trust this for auth)
function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT shape');
  const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json);
}

// Example claims (never put secrets in payload — it is only Base64, not encryption)
const examplePayload = {
  sub: 'user-123',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
};
```

**Signing and verification belong on the server** with a secret (HMAC) or private key (RSA/ECDSA). Never store the signing key in frontend code.

```javascript
// Node.js: sign and verify with jsonwebtoken (illustrative — run only on server)
// const jwt = require('jsonwebtoken');
// const token = jwt.sign({ sub: 'user-123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
// const payload = jwt.verify(token, process.env.JWT_SECRET);

// Browser: typically only stores token (memory or httpOnly cookie) and sends it;
// verification is done by the API
async function apiCallWithBearer(token) {
  return fetch('/api/protected', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
}
```

**Best practices:** short-lived access tokens, refresh tokens with rotation, validate `iss`/`aud`, use strong algorithms (`RS256`/`ES256` for public verification), and prefer httpOnly cookies for session tokens when possible to reduce XSS impact.

```javascript
// Refresh flow (conceptual — refresh token in httpOnly cookie, access token in memory)
async function refreshAccessToken() {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Refresh failed');
  const { accessToken } = await res.json();
  return accessToken;
}

// Server: invalidate refresh token on reuse (rotation) to detect theft
```

### 3.2 OAuth 2.0 Flow (Authorization Code with PKCE)

Common pattern for SPAs and mobile: user authorizes the **authorization server**; app receives an **authorization code**; app exchanges code for **tokens** at the token endpoint. **PKCE** protects public clients that cannot hold a client secret.

```javascript
// PKCE helpers (browser) — do not embed client_secret in SPA
function randomString(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .slice(0, len);
}

async function sha256Base64Url(plain) {
  const data = new TextEncoder().encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// 1) Generate code_verifier and code_challenge; store verifier in sessionStorage
// 2) Redirect user to /authorize?response_type=code&client_id=...&code_challenge=...&code_challenge_method=S256
// 3) On redirect back with ?code=..., POST to token endpoint with code_verifier
// Never log tokens; use HTTPS only
```

### 3.3 Session Management

```javascript
// Prefer httpOnly, Secure, SameSite cookies set by server — JS cannot read httpOnly
// document.cookie is NOT the place for session secrets if XSS is a risk

// For in-memory token storage (reduces persistence vs localStorage)
let accessToken = null;

export function setSessionToken(token) {
  accessToken = token;
}

export function clearSession() {
  accessToken = null;
}

// Logout: clear server session + client state
async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  accessToken = null;
}
```

### 3.4 Secure Password Storage (Server-Side Hashing)

Passwords must be hashed with a slow, memory-hard algorithm (**bcrypt**, **scrypt**, or **Argon2**). Never store plaintext; never send passwords to analytics.

```javascript
// Node (bcrypt) — server only
// const bcrypt = require('bcrypt');
// const rounds = 12;
// const hash = await bcrypt.hash(plainPassword, rounds);
// const ok = await bcrypt.compare(plainPassword, hash);

// Client: never “pre-hash” passwords for the server unless following a documented protocol;
// always use TLS and let the server hash
```

### 3.5 Two-Factor Authentication (2FA)

TOTP (time-based one-time passwords) is common. The **secret** lives on the server and in the user’s authenticator app—**not** in client-side source.

```javascript
// Client: user submits 6-digit code with password
async function loginWithTotp(username, password, totpCode) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, totpCode }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

// Server verifies TOTP window and rate-limits attempts (conceptual — implement on API)
```

---

## 4. Secure Communication

### 4.1 HTTPS and TLS/SSL

TLS encrypts data in transit and provides server authentication via certificates. Use HTTPS for all auth, cookies, and APIs.

```javascript
// Service worker or fetch: ensure no mixed content (HTTPS page loading HTTP assets)
if (window.isSecureContext) {
  console.log('Secure context — Web Crypto and some APIs available');
}
```

### 4.2 Content Security Policy (CSP)

CSP is set via HTTP header (preferred) or `<meta http-equiv>`. It restricts script sources, frames, and more.

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

```javascript
// With a nonce (server injects nonce per response)
// <script nonce="ABC123"> ... inline script allowed only if nonce matches CSP

// Report violations (report-uri or report-to)
// Content-Security-Policy-Report-Only: ...; report-uri /csp-report
```

### 4.3 CORS Security

Cross-Origin Resource Sharing is enforced by the **browser**. The server sends `Access-Control-Allow-Origin` and related headers.

```javascript
// Browser: credentialed requests require explicit origin on server, not '*'
fetch('https://api.example.com/data', {
  credentials: 'include',
});

// Server must respond with:
// Access-Control-Allow-Origin: https://yourapp.com
// Access-Control-Allow-Credentials: true
// And validate Origin — never reflect arbitrary Origin without checks
```

**Mistake to avoid:** using `Access-Control-Allow-Origin: *` with `credentials: 'include'`.

### 4.4 Secure HTTP Headers

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

```javascript
// Meta fallbacks exist for some policies but prefer headers
// <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

### 4.5 Subresource Integrity (SRI)

Load third-party scripts only with a cryptographic hash so a compromised CDN cannot silently change the file.

```html
<!-- integrity matches exact file bytes; crossorigin required for CORS-enabled checks -->
<script
  src="https://cdn.example.com/lib.min.js"
  integrity="sha384-ozE1L1...base64..."
  crossorigin="anonymous"
></script>
```

```javascript
// Fetch + verify manually is uncommon; prefer <script integrity="..."> or self-host critical libs
```

### 4.6 SameSite Cookies (Defense in Depth)

```http
Set-Cookie: session=abc; Path=/; HttpOnly; Secure; SameSite=Lax
```

```javascript
// Lax: cookie sent on top-level navigations (e.g. following a link to your site)
// Strict: not sent on any cross-site request — strongest, may break some flows
// None: requires Secure; use only when you intentionally need cross-site cookies (e.g. embedded widgets)
```

---

## 5. Data Protection

### 5.1 Encryption Basics

- **Symmetric:** one key encrypts and decrypts (AES).
- **Asymmetric:** public key encrypts, private key decrypts (or private key signs, public verifies).

Use **authenticated encryption** (e.g., AES-GCM) so ciphertext cannot be tampered with undetected.

### 5.2 Web Crypto API

```javascript
// Generate AES-GCM key
async function makeAesGcmKey() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptMessage(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  return { iv, ciphertext: new Uint8Array(ciphertext) };
}

async function decryptMessage(key, iv, ciphertextBuffer) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertextBuffer
  );
  return new TextDecoder().decode(decrypted);
}

// Digest (e.g., SHA-256) — not for passwords; use proper KDF on server
async function sha256Hex(message) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
```

### 5.3 Secure Storage Considerations

```javascript
// localStorage/sessionStorage: readable by any script on the origin — XSS can steal tokens
// localStorage.setItem('token', jwt); // avoid for sensitive tokens if XSS is possible

// Prefer httpOnly cookies for session identifiers set by server

// Never store API keys or private keys in frontend bundles
const apiKey = 'sk_live_xxxxx'; // NEVER — visible in DevTools and build output
```

### 5.4 PII Handling

Minimize collection, encrypt in transit (TLS), restrict access (least privilege), and avoid logging PII.

```javascript
function redactEmail(email) {
  const [user, domain] = email.split('@');
  if (!domain) return '[redacted]';
  return `${user[0]}***@${domain}`;
}

// Send only fields needed for the feature
function buildProfileUpdate({ displayName }) {
  return { displayName }; // omit national ID, etc., unless required and authorized
}
```

---

## 6. Security Best Practices

### 6.1 Least Privilege

Grant users, services, and API tokens the minimum permissions needed.

```javascript
// API scopes example (conceptual)
const tokenScopes = ['read:profile'];
function canWritePosts(scopes) {
  return scopes.includes('write:posts');
}
```

### 6.2 Input Escaping

Escape or encode for the **output context** (HTML, attribute, URL, CSS, JS string).

```javascript
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Still prefer textContent for user-controlled text in the DOM
```

### 6.3 Dependency Security (`npm audit`)

```bash
# Run in project root
npm audit
npm audit fix
# Review breaking changes before npm audit fix --force
```

```javascript
// package.json: use lockfile, pin versions in CI, enable Dependabot/Renovate on the repo
```

### 6.4 Regular Security Audits

Combine automated scans (SAST, dependency audit), manual review of auth flows, and periodic penetration tests. Review third-party scripts loaded on your site.

### 6.5 OWASP Top 10 (Overview)

Typical categories (evolve over yearly refresh): broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable components, authentication failures, software/data integrity failures, logging/monitoring failures, SSRF. Map each item to your stack (browser app + API + database).

```javascript
// Example: broken access control — always check ownership on server
// GET /api/documents/:id — verify session user owns document before returning
```

---

## Summary: Best Practices

- Treat **all** client input as untrusted; validate and authorize on the **server**.
- Use **`textContent`** (or safe encoding) instead of **`innerHTML`** for untrusted data.
- Use **HTTPS**, **HSTS**, **CSP**, **secure cookies**, and **SameSite** where appropriate.
- **Never** embed API keys, JWT signing secrets, or private keys in frontend code.
- Use **parameterized queries** for SQL; avoid string concatenation for commands and queries.
- Prefer **short-lived tokens**, **refresh rotation**, and **httpOnly** session cookies when XSS is a concern.
- Keep dependencies updated; run **`npm audit`** and fix or document accepted risks.
- Apply **least privilege** for users, tokens, and admin features.
- Plan for **ReDoS** (regex + length limits) and **rate limiting** on auth endpoints.

---

## Common Mistakes to Avoid

1. **Injecting user data with `innerHTML`** — leads to XSS; use `textContent` or a vetted sanitizer for rich text only.
2. **Trusting client-side validation alone** — attackers bypass the browser; duplicate checks on the server.
3. **Storing sensitive tokens in `localStorage`** — XSS can exfiltrate them; prefer httpOnly cookies or memory with tight CSP.
4. **Committing secrets** — `.env` in repo, keys in `config.js`, or Stripe keys in frontend bundles.
5. **Weak session fixation** — re-issue session after login; invalidate on logout.
6. **Open CORS** — `*` with credentials, or reflecting `Origin` without an allowlist.
7. **JWT in URL query strings** — leaks via Referer and logs; prefer Authorization header or secure cookies.
8. **Rolling custom crypto** — use well-reviewed libraries and Web Crypto for standard operations.
9. **Ignoring dependency vulnerabilities** — supply-chain risk; audit and pin versions.
10. **Missing security headers** — no CSP, no `X-Frame-Options`, no `nosniff`, enabling clickjacking and MIME confusion.
11. **Logging passwords or tokens** — never log request bodies containing secrets.
12. **SQL/command string interpolation** — use parameters and safe APIs instead.

---

*This document is for learning and checklist purposes. Apply controls appropriate to your threat model and compliance requirements.*
