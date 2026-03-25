# JavaScript AJAX and HTTP

This guide covers HTTP in the browser: methods and status codes, legacy `XMLHttpRequest`, the **Fetch API**, **CORS**, and practical API client patterns. **AJAX** originally meant updating pages without full reloads; today that usually means async JSON requests with `fetch`.

## 📑 Table of Contents

1. [HTTP Basics](#1-http-basics)
2. [XMLHttpRequest (Legacy)](#2-xmlhttprequest-legacy)
3. [Fetch API (Modern)](#3-fetch-api-modern)
4. [CORS](#4-cors)
5. [API Integration](#5-api-integration)
6. [Best Practices](#6-best-practices)
7. [Common Mistakes to Avoid](#7-common-mistakes-to-avoid)

## 1. HTTP Basics

### 1.1 What Is HTTP?

**HTTP** (Hypertext Transfer Protocol) is a request–response protocol: a **client** (usually the browser) sends a **request**; a **server** returns a **response**. Each exchange has a **method**, **URL**, **headers**, and often a **body**. HTTPS is HTTP layered on TLS for encryption and server identity.

```javascript
// Browsers expose HTTP to JS mainly via fetch() and XMLHttpRequest.
// The URL identifies the resource; the method describes the intended action.
const url = 'https://api.example.com/users/42';
```

### 1.2 HTTP Methods

Common methods and typical semantics:

| Method   | Typical use |
|----------|-------------|
| **GET**  | Read a resource (safe, idempotent; no body in browsers for simple navigations) |
| **POST** | Create a resource or trigger an action |
| **PUT**  | Replace a resource entirely (idempotent) |
| **PATCH**| Partial update |
| **DELETE** | Remove a resource (idempotent) |

```javascript
fetch('https://api.example.com/items', { method: 'GET' }); // default method is GET

fetch('https://api.example.com/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Widget' }),
});

fetch('https://api.example.com/items/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1, name: 'Widget Pro', price: 29.99 }),
});

fetch('https://api.example.com/items/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ price: 24.99 }),
});

fetch('https://api.example.com/items/1', { method: 'DELETE' });
```

**Idempotent** means repeating the same request should not compound side effects (e.g., `DELETE /items/1` twice might 404 the second time, but should not delete something else).

### 1.3 Status Codes (1xx–5xx)

Responses include a **status code** and optional **reason phrase**.

- **1xx Informational** — rare in browser `fetch`; e.g., `100 Continue`.
- **2xx Success** — `200 OK`, `201 Created`, `204 No Content`.
- **3xx Redirection** — `301`, `302`, `307`, `308`; `fetch` follows redirects by default for same-origin and many cross-origin cases.
- **4xx Client errors** — `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`.
- **5xx Server errors** — `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`.

```javascript
async function checkStatus(response) {
  if (response.ok) {
    // ok is true for status 200-299
    return response.json();
  }
  // Still useful to read body for error messages
  const text = await response.text();
  throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
}

fetch('https://api.example.com/data')
  .then(checkStatus)
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

### 1.4 Headers

**Request headers** tell the server about the body, auth, caching, etc. **Response headers** describe the payload, caching, CORS, and more.

```javascript
fetch('https://api.example.com/secure', {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Accept-Language': 'en-US',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
});

// Inspecting response headers (some are forbidden for JS to read cross-origin)
fetch('https://api.example.com/data').then((res) => {
  console.log(res.headers.get('content-type'));
  console.log(res.headers.get('cache-control'));
});
```

Common headers:

- `Content-Type` — e.g., `application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`.
- `Accept` — what representation the client prefers.
- `Authorization` — credentials (Bearer token, Basic, etc.).

### 1.5 Request/Response Cycle

1. Resolve URL (DNS, connect, TLS handshake for HTTPS).
2. Send request line (method + path + HTTP version), headers, optional body.
3. Server processes and returns status line, headers, body.
4. Client parses; for `fetch`, body is a **stream** you read once (e.g., `.json()`, `.text()`).

```javascript
async function requestResponseCycle() {
  const response = await fetch('/api/items');
  console.log(response.status, response.statusText, response.url);
  return response.json(); // body is a one-time stream
}
```

### 1.6 RESTful APIs

**REST** (Representational State Transfer) is an architectural style: resources identified by URLs, manipulated with HTTP methods, stateless server interactions, often JSON representations.

```javascript
const base = 'https://api.example.com/v1';
const json = (r) => r.json();

const listUsers = () => fetch(`${base}/users`).then(json);
const getUser = (id) => fetch(`${base}/users/${id}`).then(json);
const createUser = (payload) =>
  fetch(`${base}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(json);
const patchUser = (id, payload) =>
  fetch(`${base}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(json);
const deleteUser = (id) =>
  fetch(`${base}/users/${id}`, { method: 'DELETE' }).then((r) =>
    r.status === 204 ? null : json(r),
  );
```

Not every API is strictly REST; many use RPC-style paths (`POST /actions/sendEmail`). Match your backend contract.

## 2. XMLHttpRequest (Legacy)

`XMLHttpRequest` (XHR) was the original browser API for asynchronous HTTP. It still works everywhere and powers some older libraries, but **`fetch` is preferred** for new code unless you need XHR-specific features (e.g., progress events on older stacks).

### 2.1 Creating an XHR Object

```javascript
const xhr = new XMLHttpRequest();
```

### 2.2 Opening, Sending, and Methods

`open(method, url, async, user?, password?)` → `setRequestHeader(name, value)` (after `open`, before `send`) → `send(body | null)`.

```javascript
function xhrGet(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve(xhr.responseText)
        : reject(new Error(`HTTP ${xhr.status}`));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send();
  });
}

const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://example.com/api', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({ foo: 'bar' }));
```

### 2.3 Events and Ready State

`readyState` progresses: `0` UNSENT → `1` OPENED → `2` HEADERS_RECEIVED → `3` LOADING → `4` DONE.

```javascript
function xhrWithEvents(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };

    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        console.log(`Downloaded ${percent.toFixed(1)}%`);
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send();
  });
}
```

Modern shorthand: `onload` fires when complete (like `readyState === DONE` with success path often checked via `status`).

### 2.4 Properties

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1', true);
xhr.responseType = 'json'; // parse as JSON where supported

xhr.onload = () => {
  console.log(xhr.status); // number
  console.log(xhr.statusText); // e.g. "OK"
  console.log(xhr.response); // parsed if responseType set
  console.log(xhr.responseText); // string
  console.log(xhr.getResponseHeader('content-type'));
};

xhr.send();
```

`responseType` values include `''`, `'text'`, `'json'`, `'document'`, `'blob'`, `'arraybuffer'`.

### 2.5 Handling Responses and Errors

```javascript
function xhrPostJson(url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(
          Object.assign(new Error(xhr.statusText || 'Request failed'), {
            status: xhr.status,
            body: xhr.response,
          }),
        );
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.timeout = 10000; // ms

    xhr.send(JSON.stringify(data));
  });
}
```

## 3. Fetch API (Modern)

`fetch` returns a **Promise** that resolves to a `Response`. It does **not** reject on HTTP 4xx/5xx—only on network failure—so you must check `response.ok` or `response.status`.

### 3.1 Basic Usage

```javascript
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((todo) => console.log(todo.title))
  .catch(console.error);

async function loadTodo(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}
```

### 3.2 Fetch Options

Second argument: `RequestInit`.

```javascript
const controller = new AbortController();

const res = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({ query: 'books' }),
  mode: 'cors', // 'same-origin' | 'cors' | 'no-cors'
  credentials: 'same-origin', // 'omit' | 'same-origin' | 'include'
  cache: 'default', // 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached'
  redirect: 'follow', // 'follow' | 'error' | 'manual'
  referrerPolicy: 'no-referrer',
  signal: controller.signal,
});
```

### 3.3 Handling JSON

```javascript
async function apiGetJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  const text = await res.text(); // read once
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('Invalid JSON response');
  }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
```

### 3.4 FormData

`FormData` encodes fields as `multipart/form-data`. Do **not** set `Content-Type` yourself—the browser adds the `boundary`.

```javascript
document.querySelector('form#signup')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/signup', { method: 'POST', body: new FormData(e.target) });
  if (!res.ok) throw new Error(await res.text());
  console.log(await res.json());
});

const fd = new FormData();
fd.append('username', 'ada');
fd.append('role', 'admin');
fetch('/api/profile', { method: 'PUT', body: fd });
```

### 3.5 Blob and File Uploads

```javascript
async function uploadFile(input) {
  const file = input.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file, file.name);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

async function putBlob(url, blob) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': blob.type || 'application/octet-stream' },
    body: blob,
  });
  if (!res.ok) throw new Error(`PUT failed ${res.status}`);
}

async function downloadAsBlob(url, filename = 'download.bin') {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href, download: filename }).click();
  URL.revokeObjectURL(href);
}
```

### 3.6 Streaming Responses

`response.body` is a **ReadableStream**. Useful for large payloads or incremental parsing.

```javascript
async function logStreamedText(url) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error('Bad response');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    console.log('Chunk received, total length:', accumulated.length);
  }

  console.log('Final:', accumulated);
}
```

```javascript
// NDJSON-style: split on newlines and JSON.parse each non-empty line
async function* ndjsonEvents(response) {
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += value;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line) yield JSON.parse(line);
    }
  }
}
```

### 3.7 AbortController

Cancel in-flight requests (timeouts, user navigation, race conditions).

```javascript
function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
}

fetchWithTimeout('https://slow.example.com/data').catch((err) => {
  if (err.name === 'AbortError') {
    console.log('Request aborted or timed out');
  } else {
    console.error(err);
  }
});
```

```javascript
let searchAbort = null;
async function searchUsers(query) {
  searchAbort?.abort();
  searchAbort = new AbortController();
  try {
    const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`, {
      signal: searchAbort.signal,
    });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  } catch (e) {
    if (e.name === 'AbortError') return null;
    throw e;
  }
}
```

## 4. CORS

**CORS** (Cross-Origin Resource Sharing) lets browsers relax the **same-origin policy** when servers explicitly allow it.

### 4.1 Same-Origin Policy

An origin is **scheme + host + port** (e.g., `https://app.example.com:443`). By default, scripts on `https://a.com` cannot read responses from `https://b.com` unless `b.com` sends CORS headers permitting `a.com`.

```javascript
// Page at https://app.example.com — this may fail without CORS on API
fetch('https://api.other.com/data', { mode: 'cors' })
  .then((r) => r.json())
  .catch(console.error);
```

### 4.2 CORS Headers (Server-Side Concept, Relevant to Front-End Debugging)

Common response headers:

- `Access-Control-Allow-Origin: https://app.example.com` or `*`
- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Max-Age: 86400` (cache preflight)

```javascript
// Front-end: you cannot set forbidden cross-origin headers arbitrarily;
// the browser enforces which headers you may send on "non-simple" requests.
fetch('https://api.example.com/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': '123',
  },
  body: JSON.stringify({}),
});
// If X-Custom-Header is not allowed, server must echo
// Access-Control-Allow-Headers including X-Custom-Header
```

### 4.3 Preflight Requests

For **non-simple** requests (custom headers, methods other than GET/HEAD/POST, or certain content types), the browser sends an **OPTIONS** preflight. The server must respond with appropriate `Access-Control-Allow-*` headers.

Simple requests roughly: GET/HEAD/POST with safelisted headers and `Content-Type` of `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`.

```javascript
// Triggers preflight (PUT + JSON)
fetch('https://api.example.com/items/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'x' }),
});
```

### 4.4 Credentials (Cookies and Authorization)

```javascript
fetch('/api/me', { credentials: 'same-origin' });

// Cross-origin cookies: server needs Access-Control-Allow-Credentials: true
// and a specific Access-Control-Allow-Origin (not *).
fetch('https://api.example.com/me', { credentials: 'include' });

// Bearer token in a header often avoids cookie + CORS credential rules
fetch('https://api.example.com/me', {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

## 5. API Integration

### 5.1 Authentication: Tokens

**Bearer tokens** (JWT or opaque) are sent in the `Authorization` header.

```javascript
class ApiClient {
  constructor(baseUrl, getToken) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.getToken = getToken;
  }
  async request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = this.getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    if (res.status === 401) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error(typeof data === 'string' ? data : data?.message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }
}
new ApiClient('https://api.example.com', () => localStorage.getItem('access_token'))
  .request('/v1/profile')
  .then(console.log)
  .catch(console.error);
```

### 5.2 OAuth (Browser-Oriented Sketch)

OAuth 2.0 often uses redirects or a **PKCE** flow for public clients. The browser opens an authorization URL; the user logs in; the provider redirects back with a **code** you exchange for tokens (typically via your **backend**, not by exposing client secrets).

```javascript
// Step 1: redirect user (simplified — real apps use PKCE code_challenge)
function startOAuthLogin(clientId, redirectUri) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state: crypto.randomUUID(),
  });
  window.location.assign(`https://auth.provider.com/oauth/authorize?${params}`);
}

// Step 2: after redirect, your app reads ?code=...&state=... and POSTs to YOUR server
async function exchangeCodeOnBackend(code) {
  const res = await fetch('/api/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json(); // { access_token, refresh_token, ... }
}
```

Never embed **client secrets** in front-end JavaScript.

### 5.3 Rate Limiting

Servers may return `429 Too Many Requests` with `Retry-After` (seconds or HTTP-date).

```javascript
async function fetchRespectingRateLimit(url, options) {
  const res = await fetch(url, options);
  if (res.status !== 429) return res;
  const ra = res.headers.get('retry-after');
  await new Promise((r) => setTimeout(r, ra ? Number(ra) * 1000 : 2000));
  return fetch(url, options);
}

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last < ms) return Promise.resolve(null);
    last = now;
    return fn(...args);
  };
}
const throttledSearch = throttle((q) => fetch(`/api/search?q=${q}`), 300);
```

### 5.4 Error Handling Strategies

```javascript
class HttpError extends Error {
  constructor(message, { status, data, url } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

async function parseErrorResponse(res) {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch {
    return null;
  }
}

async function robustFetch(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new HttpError(e.message || 'Network error', { url });
  }

  if (res.ok) return res;

  const body = await parseErrorResponse(res);
  const message =
    (typeof body === 'object' && body?.message) ||
    res.statusText ||
    'Request failed';

  throw new HttpError(message, { status: res.status, data: body, url });
}
```

Map errors to UI: validation (`400`), auth (`401`/`403`), not found (`404`), conflict (`409`), server (`5xx`).

### 5.5 Retry Logic

Retry **idempotent** requests (GET, HEAD, PUT, DELETE) more aggressively than POST. Use **exponential backoff** and respect `Retry-After`.

```javascript
async function fetchWithRetry(url, options = {}, maxAttempts = 3) {
  let attempt = 0;
  let delay = 300;
  while (true) {
    attempt += 1;
    try {
      const res = await fetch(url, options);
      if (res.status >= 500 && res.status < 600 && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function fetchWithRetryAndDeadline(url, options, { maxAttempts = 3, ms = 15000 } = {}) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetchWithRetry(url, { ...options, signal: c.signal }, maxAttempts);
  } finally {
    clearTimeout(t);
  }
}
```

## 6. Best Practices

- **Check `response.ok`** (or status ranges) after every `fetch`; network success ≠ HTTP success.
- **Parse the body once**; clone with `response.clone()` if multiple consumers need it.
- **Use `AbortController`** for timeouts and cancelling stale requests (search, navigation).
- **Centralize API access** (small client wrapper) for headers, base URL, auth, and error mapping.
- **Avoid secrets in the browser**; use backend token exchange for OAuth.
- **Respect CORS** during development: fix server headers or use a dev proxy, not ad-hoc “disable CORS” in users’ browsers.
- **Send correct `Content-Type`**; omit it for `FormData` so the browser sets `multipart` boundary.
- **Use HTTPS** in production; avoid mixed content (HTTPS page calling HTTP API).
- **Validate and sanitize** server data before rendering (XSS); treat all API input as untrusted.
- **Log correlation**: when debugging, log `requestId` from response headers if your API provides one.

```javascript
// Tiny reusable JSON helper
export async function jsonFetch(input, init = {}) {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
```

## 7. Common Mistakes to Avoid

1. **Assuming `fetch` throws on 404/500** — it usually does not; always inspect `status` or `ok`.
2. **Reading the body twice** without cloning — second read fails or returns empty.
3. **Setting `Content-Type: application/json` on `FormData`** — breaks multipart encoding.
4. **Ignoring CORS preflight requirements** — custom headers need server allowance.
5. **Using `credentials: 'include'` with `Access-Control-Allow-Origin: *`** — browsers block it.
6. **Retrying non-idempotent POST** blindly — can duplicate side effects (payments, emails).
7. **Storing refresh tokens insecurely** — prefer HttpOnly cookies set by the server when possible.
8. **Trusting status alone** — some APIs return `200` with `{ error: true }`; follow the contract.
9. **Huge JSON in memory** — for large downloads, prefer streaming when the API supports it.
10. **No timeout** — hung requests hurt UX; combine `AbortController` with `setTimeout`.

```javascript
// Mistake: ignoring !ok
fetch('/api/x').then((r) => r.json()); // may parse error HTML as JSON

// Better
fetch('/api/x').then(async (r) => {
  if (!r.ok) throw new Error(await r.text());
  return r.json();
});
```

*Browser-focused. Node.js `fetch` is similar but has no CORS. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for edge cases.*
