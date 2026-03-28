# Next.js Middleware — Topics 11.1–11.5

Middleware in Next.js runs **before** a request completes, letting you rewrite, redirect, authenticate, or enrich traffic at the edge. This guide covers the `middleware.ts` contract, matchers, real product patterns (e‑commerce, SaaS dashboards, blogs), and production pitfalls.

## 📑 Table of Contents

- [11.1 Middleware Basics](#111-middleware-basics)
  - [11.1.1 `middleware.ts` file](#1111-middlewarets-file)
  - [11.1.2 Execution model](#1112-execution-model)
  - [11.1.3 `NextRequest` / `NextResponse`](#1113-nextrequest--nextresponse)
  - [11.1.4 File placement](#1114-file-placement)
  - [11.1.5 Edge Runtime](#1115-edge-runtime)
- [11.2 Middleware Functions](#112-middleware-functions)
  - [11.2.1 Request modification](#1121-request-modification)
  - [11.2.2 Response modification](#1122-response-modification)
  - [11.2.3 Rewriting URLs](#1123-rewriting-urls)
  - [11.2.4 Redirecting](#1124-redirecting)
  - [11.2.5 Setting headers](#1125-setting-headers)
  - [11.2.6 Setting cookies](#1126-setting-cookies)
- [11.3 Middleware Configuration](#113-middleware-configuration)
  - [11.3.1 Matcher config](#1131-matcher-config)
  - [11.3.2 Path matching](#1132-path-matching)
  - [11.3.3 Excluding paths](#1133-excluding-paths)
  - [11.3.4 Conditional middleware](#1134-conditional-middleware)
  - [11.3.5 Multiple logical functions](#1135-multiple-logical-functions)
- [11.4 Middleware Use Cases](#114-middleware-use-cases)
  - [11.4.1 Authentication checks](#1141-authentication-checks)
  - [11.4.2 Bot detection](#1142-bot-detection)
  - [11.4.3 A/B testing](#1143-ab-testing)
  - [11.4.4 Geolocation](#1144-geolocation)
  - [11.4.5 Feature flags](#1145-feature-flags)
  - [11.4.6 Logging and analytics](#1146-logging-and-analytics)
  - [11.4.7 Security headers](#1147-security-headers)
- [11.5 Middleware Best Practices](#115-middleware-best-practices)
  - [11.5.1 Performance](#1151-performance)
  - [11.5.2 Limitations](#1152-limitations)
  - [11.5.3 Debugging](#1153-debugging)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices (End of Guide)](#best-practices-end-of-guide)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 11.1 Middleware Basics

### 11.1.1 `middleware.ts` file

**Beginner Level**  
Think of `middleware.ts` as a **bouncer** at the door of your Next.js app. Before a page or API route runs, this file can look at the incoming URL and cookies and decide “allow,” “redirect,” or “send somewhere else.” For a **blog**, you might block `/admin` unless the user is logged in.

**Intermediate Level**  
The middleware file exports a single default function (or a named `middleware` in some setups) that receives a `NextRequest` and must return a `NextResponse` (continue, redirect, rewrite) or `Response`. It is bundled separately and runs on the **Edge** by default. For a **SaaS** app, the same file often centralizes session refresh hints and tenant slug parsing.

**Expert Level**  
`middleware.ts` participates in the **routing pipeline** ahead of static matching in some cases and can short-circuit with `NextResponse.next()`, `redirect()`, or `rewrite()`. You can compose typed helpers and share constants, but avoid importing heavy Node-only modules. For **e‑commerce**, you might branch on `pathname` for `/checkout` vs `/api/webhooks` (webhooks often should be excluded from auth middleware).

```typescript
// middleware.ts — minimal skeleton (App Router, Next.js 13+)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

#### Key Points — 11.1.1

- One middleware entry per project root (or `src/` root).
- Default export function signature is stable: `(request: NextRequest) => NextResponse | Response | Promise<...>`.
- Use `config.matcher` to limit which routes pay the middleware cost.

---

### 11.1.2 Execution model

**Beginner Level**  
Middleware runs **every time** someone visits a matching path—like opening a **social media** feed URL. It runs **before** your React page code on the server.

**Intermediate Level**  
Execution order: **Middleware → (optional) redirects/rewrites → route handlers / RSC**. Middleware does not replace route handlers; it shapes the request. For a **dashboard**, `/app` might hit middleware first to attach `x-user-id` for downstream logging.

**Expert Level**  
Middleware runs in the **Edge Runtime** (unless configured otherwise in older patterns). It cannot use all Node APIs. Chains of `rewrite`/`redirect` interact with **Next.js config** `basePath`, **i18n** (Pages Router), and **trailing slashes**. For **high-traffic SaaS**, keep matcher tight so static assets and prefetch requests do not execute heavy logic.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-middleware-hit", "1");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
```

#### Key Points — 11.1.2

- Runs on the edge path of the request lifecycle.
- Prefer passing data downstream via **headers** or **cookies**, not global singletons.
- Tight matchers reduce cost on prefetches (`<Link prefetch>`).

---

### 11.1.3 `NextRequest` / `NextResponse`

**Beginner Level**  
`NextRequest` is like a **richer `Request`**: it has `nextUrl` (easy pathname/searchParams). `NextResponse` creates responses: continue, redirect, or rewrite.

**Intermediate Level**  
Use `request.nextUrl.clone()` to mutate URL objects safely. `NextResponse.redirect(url)` expects `URL` or string. `NextResponse.rewrite()` keeps the **browser URL** but internally serves another path—useful for **blog** “pretty URLs.”

**Expert Level**  
`NextResponse.next({ request: { headers }})` **mutates the incoming request** visible to server components and route handlers (for that request). Cookie APIs: `response.cookies.set(name, value, options)`. For **e‑commerce**, set a **correlation id** header for payment flows across services.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname === "/legacy-product") {
    const url = request.nextUrl.clone();
    url.pathname = "/products/legacy";
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/admin") && !request.cookies.get("session")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}
```

#### Key Points — 11.1.3

- `rewrite` vs `redirect`: user-visible URL differs only for redirect.
- Clone `nextUrl` before mutating.
- Cookies and headers on `NextResponse` apply to the **response**; `next({ request })` adjusts the **upstream request**.

---

### 11.1.4 File placement

**Beginner Level**  
Put `middleware.ts` (or `middleware.js`) at the **project root** or inside `src/` next to `app/`—**not** inside `app/` or `pages/` folders.

**Intermediate Level**  
Next.js discovers middleware from:

- `middleware.ts` at root  
- `src/middleware.ts` when using `src` layout  

For monorepos, only the **Next app package** root counts. A **dashboard** in a monorepo must place middleware in that app’s root, not the repo root.

**Expert Level**  
Middleware is **global** to that Next application. Split concerns with **pure functions** imported into `middleware.ts`, not multiple middleware files. For **multi-zone** or micro-frontend setups, each Next zone has its own middleware boundary.

```typescript
// src/middleware.ts — valid placement alongside src/app
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest): NextResponse {
  return NextResponse.next();
}
```

#### Key Points — 11.1.4

- Root or `src/` only (same level as `app` or `pages`).
- One middleware entrypoint; refactor via modules.

---

### 11.1.5 Edge Runtime

**Beginner Level**  
Edge Runtime is a **lightweight** environment: fast cold starts, but not full Node.js.

**Intermediate Level**  
Middleware always runs at the edge in modern Next.js. Use **Web APIs** (`fetch`, `Headers`, `URL`) and avoid `fs`, native bindings, or large dependencies. For **social** apps, simple JWT verification may be okay; heavy crypto or DB drivers may not.

**Expert Level**  
If you need Node APIs, move logic to **Route Handlers** or **Server Actions** after a lightweight middleware gate. Consider **regional** edge limits and **WASM** for crypto. For **production SaaS**, validate tokens with libraries compatible with edge or use an external auth service with edge-verifiable JWTs.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Edge-safe fetch example (hypothetical feature flag service)
  const flagRes = await fetch("https://api.example.com/flags/beta", {
    headers: { authorization: `Bearer ${process.env.FLAGS_TOKEN ?? ""}` },
    next: { revalidate: 60 },
  }).catch(() => null);

  const beta =
    flagRes?.ok === true ? ((await flagRes.json()) as { enabled?: boolean }).enabled === true : false;

  const res = NextResponse.next();
  res.headers.set("x-beta", beta ? "1" : "0");
  return res;
}
```

#### Key Points — 11.1.5

- Prefer edge-compatible packages only.
- Offload heavy I/O to server routes after cheap checks.
- Treat `process.env` as **build-time inlined** where applicable.

---

## 11.2 Middleware Functions

### 11.2.1 Request modification

**Beginner Level**  
You change what the **rest of Next.js sees** by adding headers to the request clone passed to `NextResponse.next({ request })`.

**Intermediate Level**  
Common pattern: attach `x-pathname`, `x-locale`, or `x-tenant` for **Server Components** to read via `headers()`. For a **blog** with multi-tenant subdomains, parse host → tenant id.

**Expert Level**  
Request header injection is **not** a security boundary—clients can spoof headers on direct API calls. Use it for **derived server-side context** only. Combine with **signed cookies** or **session** for auth.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function extractTenant(host: string): string | null {
  const [sub] = host.split(".");
  if (!sub || sub === "www") return null;
  return sub;
}

export function middleware(request: NextRequest): NextResponse {
  const tenant = extractTenant(request.nextUrl.hostname);
  const requestHeaders = new Headers(request.headers);
  if (tenant) requestHeaders.set("x-tenant", tenant);

  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

#### Key Points — 11.2.1

- Use `headers()` in RSC to read injected values.
- Never trust `x-*` from the client as authentication.

---

### 11.2.2 Response modification

**Beginner Level**  
Start with `NextResponse.next()` and call `response.headers.set(...)` to add **response** headers every time.

**Intermediate Level**  
Use for **CORS** on specific paths, **caching hints**, or **debug flags**. For **e‑commerce** product pages, add `Link` preload headers sparingly (often better in metadata API).

**Expert Level**  
Be careful with **caching**: middleware response headers can affect CDN behavior. Align with `Cache-Control` from route handlers. For **SaaS**, add `X-Robots-Tag` on staging via middleware.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const res = NextResponse.next();
  if (request.nextUrl.hostname.startsWith("staging.")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}
```

#### Key Points — 11.2.2

- Response headers apply to the outgoing response for that request.
- Coordinate with CDN / hosting (Vercel, CloudFront).

---

### 11.2.3 Rewriting URLs

**Beginner Level**  
Rewrite = user still sees `/sale` but Next serves `/campaigns/summer` internally—like a **store** hiding complex paths.

**Intermediate Level**  
`NextResponse.rewrite(new URL("/target", request.url))` keeps the address bar. Use for **legacy URL** support or **A/B** bucket routes.

**Expert Level**  
Rewrites interact with **RSC** navigation and **prefetching**. Avoid rewrite loops. For **dashboard** role-based UIs, prefer segment layouts over complex rewrite graphs.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (pathname === "/deals") {
    const url = request.nextUrl.clone();
    url.pathname = "/campaigns/deals";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
```

#### Key Points — 11.2.3

- `rewrite` preserves the public URL.
- Test prefetch and soft navigation, not only full page loads.

---

### 11.2.4 Redirecting

**Beginner Level**  
Redirect sends the browser to another URL—common for **login walls**.

**Intermediate Level**  
Use `NextResponse.redirect(url, status)`; **307** preserves method (POST stays POST) vs **308** permanent. For **social** apps, temporary redirects (302/307) during outages are common.

**Expert Level**  
Avoid redirect chains for SEO. Preserve `return` query params. For **e‑commerce**, after cart merge, redirect once with flash cookie instead of multiple hops.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/account" && !request.cookies.get("auth")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", `${pathname}?${searchParams.toString()}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
```

#### Key Points — 11.2.4

- Choose status codes deliberately (temporary vs permanent).
- Minimize chains; encode return URLs safely (open redirect awareness).

---

### 11.2.5 Setting headers

**Beginner Level**  
`response.headers.set("name", "value")` adds HTTP headers to the response.

**Intermediate Level**  
Typical middleware headers: **CSP report-only**, **HSTS** (often at CDN), **permissions-policy**, **referrer-policy**. For **blog** static pages, security headers at edge are convenient.

**Expert Level**  
CSP nonces in middleware are advanced: generate nonce, attach to request headers for RSC to consume, set CSP header with that nonce—must be consistent per request. For **production**, many teams use CDN or reverse proxy for CSP.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const res = NextResponse.next();
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}
```

#### Key Points — 11.2.5

- Align header policy across middleware, `next.config`, and CDN.
- CSP is powerful but easy to break; test thoroughly.

---

### 11.2.6 Setting cookies

**Beginner Level**  
Cookies remember login or preferences. In middleware: `response.cookies.set("theme", "dark")`.

**Intermediate Level**  
Options: `httpOnly`, `secure`, `sameSite`, `maxAge`, `path`, `domain`. For **SaaS** multi-subdomain cookies, `domain` is critical.

**Expert Level**  
**Chunked** session cookies or rotating refresh tokens should be coordinated with your auth library. Avoid huge cookies (header size limits). For **A/B** tests, prefer short-lived experiment cookies.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Bucket = "A" | "B";

function pickBucket(): Bucket {
  return Math.random() < 0.5 ? "A" : "B";
}

export function middleware(request: NextRequest): NextResponse {
  const res = NextResponse.next();
  if (!request.cookies.get("exp_bucket")) {
    const bucket: Bucket = pickBucket();
    res.cookies.set("exp_bucket", bucket, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return res;
}
```

#### Key Points — 11.2.6

- Prefer `sameSite: "lax"` or `"strict"` for CSRF posture.
- Keep payloads small; split server-side session storage when needed.

---

## 11.3 Middleware Configuration

### 11.3.1 Matcher config

**Beginner Level**  
`export const config = { matcher: [...] }` tells Next which paths run middleware.

**Intermediate Level**  
Matchers can be strings or regex-like patterns. Exclude static files to save cost. Official docs recommend excluding `_next/static`, images, favicon.

**Expert Level**  
Negative lookahead in matcher is common. For **API**-heavy apps, split matchers: `/api/:path*` vs pages. Remember **case sensitivity** and **trailing slashes** per your `next.config`.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
```

#### Key Points — 11.3.1

- Matcher is the first performance lever.
- Re-test when adding new top-level routes (e.g. `/ingest`).

---

### 11.3.2 Path matching

**Beginner Level**  
`/dashboard/:path*` matches `/dashboard` and nested routes.

**Intermediate Level**  
Use array of matchers for **blog** posts vs **admin**. `path*` is a **modifier** in Next matcher syntax (consult current Next docs for exact pattern support in your version).

**Expert Level**  
Combine matcher minimization with **early returns** inside middleware for readability. For **i18n** (Pages Router), matcher often includes locale prefixes.

```typescript
export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
```

#### Key Points — 11.3.2

- Prefer explicit matchers for sensitive areas.
- Document why each pattern exists for teammates.

---

### 11.3.3 Excluding paths

**Beginner Level**  
Exclude `/static` files so images load fast without middleware.

**Intermediate Level**  
Exclude **webhooks** (`/api/stripe/webhook`) from auth middleware—Stripe needs raw body and no session redirects.

**Expert Level**  
Use negative lookahead or separate **non-matching** top-level segments. For **SaaS**, exclude `/.well-known` for Apple/Google verification files.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
  }
  // ... auth logic
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/webhooks).*)"],
};
```

#### Key Points — 11.3.3

- Webhooks and OAuth callbacks are classic exclude paths.
- Double-check `matcher` + internal `if` for defense in depth.

---

### 11.3.4 Conditional middleware

**Beginner Level**  
Use `if` on `pathname`, `cookies`, or headers to skip logic.

**Intermediate Level**  
For **feature flags**, branch on cookie or header set by an earlier edge layer. For **geolocation**, use `request.geo` (platform-dependent).

**Expert Level**  
Keep conditions **deterministic** for caching. Avoid random behavior on cacheable GETs without `Vary` considerations. For **e‑commerce** sales, time windows should be evaluated in UTC.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  const role = request.cookies.get("role")?.value;
  if (role !== "admin" && pathname.startsWith("/app/admin")) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}
```

#### Key Points — 11.3.4

- Structure: cheap checks first.
- Consider caching implications for marketing pages.

---

### 11.3.5 Multiple logical functions

**Beginner Level**  
You still have **one** `middleware` export—split into helper functions like `withAuth`, `withGeo`.

**Intermediate Level**  
Compose: `export function middleware(req) { return chain(req, [geo, auth, flags]); }`.

**Expert Level**  
Type the chain with `type MiddlewareFn = (req: NextRequest, res: NextResponse) => NextResponse`. Short-circuit on redirect. For **large enterprises**, keep policy modules testable without running Next.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type MiddlewareFn = (req: NextRequest) => NextResponse | Promise<NextResponse>;

const withRequestId: MiddlewareFn = async (req) => {
  const id = crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", id);
  return NextResponse.next({ request: { headers: requestHeaders } });
};

const withSecurityHeaders: MiddlewareFn = async (req) => {
  const res = await withRequestId(req);
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
};

export function middleware(request: NextRequest): Promise<NextResponse> {
  return withSecurityHeaders(request);
}
```

#### Key Points — 11.3.5

- Compose small pure steps.
- Unit test helpers without booting Next.

---

## 11.4 Middleware Use Cases

### 11.4.1 Authentication checks

**Beginner Level**  
If no session cookie, redirect to `/login` before showing **dashboard**.

**Intermediate Level**  
Read encrypted session cookie, validate JWT at edge if library supports it, or call auth provider’s **session endpoint** (watch latency). For **SaaS**, check organization membership.

**Expert Level**  
Combine **Clerk/Auth.js/Supabase** patterns: refresh tokens in route handlers, middleware only checks presence/expiry. Avoid **database** calls in middleware unless edge-compatible and fast. For **e‑commerce**, never block public product pages behind login.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
```

#### Key Points — 11.4.1

- Middleware = coarse gate; server = authoritative auth.
- Exclude webhooks and public assets.

---

### 11.4.2 Bot detection

**Beginner Level**  
Block scrapers from **checkout** by checking `User-Agent` (fragile but simple).

**Intermediate Level**  
Use **verified bot lists** or a service; rate-limit in CDN/WAF instead of only middleware when possible.

**Expert Level**  
Do not rely solely on UA for security. For **social** feeds, serve lightweight pages to bots with `NextResponse.rewrite` to a static snapshot route.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOCKED_UA_SNIPPETS = ["badscraper", "curl/7."];

export function middleware(request: NextRequest): NextResponse {
  const ua = request.headers.get("user-agent") ?? "";
  if (BLOCKED_UA_SNIPPETS.some((s) => ua.includes(s))) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.next();
}
```

#### Key Points — 11.4.2

- UA spoofing is trivial; pair with WAF/rate limits.
- SEO bots should not be accidentally blocked.

---

### 11.4.3 A/B testing

**Beginner Level**  
Assign users a **bucket cookie** and rewrite to variant folders.

**Intermediate Level**  
Ensure **sticky** assignment across sessions. For **marketing** landing pages, log exposures server-side.

**Expert Level**  
Watch **cache fragmentation**: use `Vary: Cookie` carefully or disable caching for experiment pages. For **SaaS** onboarding, prefer server-side flag services with user id hashing.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname !== "/pricing") return NextResponse.next();

  const bucket = request.cookies.get("pricing_variant")?.value ?? (Math.random() < 0.5 ? "v1" : "v2");
  const url = request.nextUrl.clone();
  url.pathname = bucket === "v1" ? "/pricing/v1" : "/pricing/v2";

  const res = NextResponse.rewrite(url);
  if (!request.cookies.get("pricing_variant")) {
    res.cookies.set("pricing_variant", bucket, { path: "/", maxAge: 60 * 60 * 24 * 7 });
  }
  return res;
}
```

#### Key Points — 11.4.3

- Sticky bucketing + cache strategy = hardest part.
- Log assignments with privacy in mind.

---

### 11.4.4 Geolocation

**Beginner Level**  
Show **currency** or **language** hints based on user country (when platform provides geo).

**Intermediate Level**  
On Vercel, `request.geo` may include `country`, `city`, `region`. For **e‑commerce**, route to `/eu/store` vs `/us/store`.

**Expert Level**  
Geo is **approximate**; comply with privacy laws. Prefer explicit user locale selection. Fallback when `geo` is undefined (local dev).

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const country = request.geo?.country ?? "US";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-country", country);
  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

#### Key Points — 11.4.4

- Geo headers vary by host platform.
- Never use geo alone for legal compliance (GDPR, etc.).

---

### 11.4.5 Feature flags

**Beginner Level**  
Turn **beta dashboard** on for employees via cookie.

**Intermediate Level**  
Evaluate flags at edge with **low latency** cache; pass `x-features` header downstream.

**Expert Level**  
For **large SaaS**, integrate LaunchDarkly/Unleash with server SDK in route handlers; middleware only passes user key from session.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const beta = request.cookies.get("beta_access")?.value === "1";
  const res = NextResponse.next();
  res.headers.set("x-beta", beta ? "true" : "false");
  return res;
}
```

#### Key Points — 11.4.5

- Edge flag evaluation must stay fast and cache-aware.
- Authoritative enforcement still on server/data layer.

---

### 11.4.6 Logging and analytics

**Beginner Level**  
Log pathname when request hits middleware (debug).

**Intermediate Level**  
Emit structured JSON with **request id** to your logging sink (edge-compatible). For **blog**, track 404 patterns.

**Expert Level**  
Do not log **PII** or secrets. Sample logs in high traffic. Prefer **OpenTelemetry** at hosting layer when available.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const logPayload = {
    path: request.nextUrl.pathname,
    method: request.method,
    ts: new Date().toISOString(),
  };
  console.info(JSON.stringify(logPayload));
  return NextResponse.next();
}
```

#### Key Points — 11.4.6

- `console` in edge goes to provider logs.
- Redact tokens and cookies.

---

### 11.4.7 Security headers

**Beginner Level**  
Add headers so browsers behave safely on your **store** site.

**Intermediate Level**  
Combine `X-Frame-Options` or `frame-ancestors` in CSP, `X-Content-Type-Options`, `Referrer-Policy`.

**Expert Level**  
Align with **OAuth** flows and embed partners. Test payment iframes. For **dashboard** apps with third-party widgets, CSP is a balancing act.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}
```

#### Key Points — 11.4.7

- Duplicate policies between CDN and middleware can conflict—pick one source of truth.
- Test CSP with real third-party scripts.

---

## 11.5 Middleware Best Practices

### 11.5.1 Performance

**Beginner Level**  
Keep middleware **fast**: it runs on many requests.

**Intermediate Level**  
Avoid `await fetch` on every request unless cached. Minimize regex complexity. Narrow matcher.

**Expert Level**  
Profile cold starts; reduce bundle size; avoid polyfills. For **e‑commerce** flash sales, put rate limiting at CDN; middleware only for session cookie checks.

```typescript
// Prefer early return before expensive work
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  if (request.method === "GET" && request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  return NextResponse.next();
}
```

#### Key Points — 11.5.1

- Matcher + early return + no heavy deps = speed.
- Push work to async background jobs when possible.

---

### 11.5.2 Limitations

**Beginner Level**  
No full Node APIs; not every npm package works.

**Intermediate Level**  
No long CPU tasks; limited memory. Cannot replace all server logic.

**Expert Level**  
**Streaming** responses and **RSC** payloads: middleware sees the request, not the full React tree. For **webhooks**, signature verification may need raw body in route handler.

#### Key Points — 11.5.2

- Middleware is a gate, not a mini backend.
- Verify package **edge** compatibility before importing.

---

### 11.5.3 Debugging

**Beginner Level**  
Use `console.log` and read deployment logs.

**Intermediate Level**  
Add temporary `x-debug` response headers in staging only.

**Expert Level**  
Reproduce locally with `next dev`; compare matcher. Use **curl** to hit API routes without browser noise. For **SaaS**, log **correlation ids** across middleware → server.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const res = NextResponse.next();
  if (process.env.DEBUG_MW === "1") {
    res.headers.set("x-mw-path", request.nextUrl.pathname);
  }
  return res;
}
```

#### Key Points — 11.5.3

- Staging-only debug headers avoid leaking internals.
- Test redirects with `curl -I`.

---

## Key Points (Chapter Summary)

- Middleware centralizes **cross-cutting** request logic at the edge.
- **`NextRequest` / `NextResponse`** implement rewrites, redirects, cookies, and header surgery.
- **`config.matcher`** is your primary performance and correctness filter.
- Auth in middleware should be **coarse**; authoritative checks stay in servers and data layers.
- Security-sensitive decisions need more than **User-Agent** or client-supplied headers.

## Best Practices (End of Guide)

- Place `middleware.ts` at project or `src/` root; keep one exported middleware.
- Narrow matchers; exclude static assets, images, webhooks, and verification paths.
- Prefer **small** pure helpers; compose them for clarity and testability.
- Inject **request headers** for downstream server code; avoid trusting them from clients on APIs.
- Set **cookies** with explicit `path`, `sameSite`, and `secure` in production.
- Align **CSP and security headers** with your CDN and `next.config.js`.
- Revisit middleware when adding **internationalization**, **multi-tenant hosts**, or new **API** namespaces.

## Common Mistakes to Avoid

- Putting `middleware.ts` inside `app/` or `pages/` (it will not run as expected).
- Using middleware for **heavy** database queries or Node-only drivers.
- Redirecting **webhook** endpoints and breaking signature verification.
- **Open redirects** via unchecked `callbackUrl` query parameters.
- Relying on **User-Agent** alone for security or paywall enforcement.
- Overusing `fetch` in middleware without caching, causing latency on every navigation.
- Setting conflicting **Cache-Control** / **CSP** in middleware vs `next.config` vs edge CDN.
- Accidentally blocking **search engine** crawlers during bot filtering experiments.
