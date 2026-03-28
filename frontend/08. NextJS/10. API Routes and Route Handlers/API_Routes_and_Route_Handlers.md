# API Routes and Route Handlers

How to build **HTTP endpoints** in Next.js: **Route Handlers** in the App Router (`app/**/route.ts`) and **API Routes** in the Pages Router (`pages/api`). Covers **methods**, **request/response** patterns, **production** concerns (auth, CORS, rate limits, uploads, edge), with **TypeScript** examples across **e-commerce**, **blogs**, **dashboards**, **SaaS**, and **social** use cases.

---

## 📑 Table of Contents

- [10.1 Route Handlers (App Router)](#101-route-handlers-app-router)
  - [10.1.1 `route.ts` / `route.js` Files](#1011-routets--routejs-files)
  - [10.1.2 HTTP Method Exports (GET, POST, etc.)](#1012-http-method-exports-get-post-etc)
  - [10.1.3 `Request` Object](#1013-request-object)
  - [10.1.4 Response Helpers](#1014-response-helpers)
  - [10.1.5 `NextRequest` and `NextResponse`](#1015-nextrequest-and-nextresponse)
  - [10.1.6 Dynamic Route Handlers](#1016-dynamic-route-handlers)
  - [10.1.7 Route Handler Caching](#1017-route-handler-caching)
- [10.2 HTTP Methods](#102-http-methods)
  - [10.2.1 GET Requests](#1021-get-requests)
  - [10.2.2 POST Requests](#1022-post-requests)
  - [10.2.3 PUT Requests](#1023-put-requests)
  - [10.2.4 PATCH Requests](#1024-patch-requests)
  - [10.2.5 DELETE Requests](#1025-delete-requests)
  - [10.2.6 OPTIONS Requests](#1026-options-requests)
  - [10.2.7 HEAD Requests](#1027-head-requests)
- [10.3 Request Handling](#103-request-handling)
  - [10.3.1 Reading Request Body](#1031-reading-request-body)
  - [10.3.2 Query Parameters](#1032-query-parameters)
  - [10.3.3 Headers](#1033-headers)
  - [10.3.4 Cookies](#1034-cookies)
  - [10.3.5 Form Data](#1035-form-data)
  - [10.3.6 JSON Parsing](#1036-json-parsing)
  - [10.3.7 URL Parameters](#1037-url-parameters)
- [10.4 Response Handling](#104-response-handling)
  - [10.4.1 JSON Responses](#1041-json-responses)
  - [10.4.2 Status Codes](#1042-status-codes)
  - [10.4.3 Custom Headers](#1043-custom-headers)
  - [10.4.4 Cookies in Response](#1044-cookies-in-response)
  - [10.4.5 Redirects](#1045-redirects)
  - [10.4.6 Streaming Responses](#1046-streaming-responses)
  - [10.4.7 Error Responses](#1047-error-responses)
- [10.5 API Routes (Pages Router)](#105-api-routes-pages-router)
  - [10.5.1 `pages/api/` Handler Functions](#1051-pagesapi-handler-functions)
  - [10.5.2 `req` and `res` Objects](#1052-req-and-res-objects)
  - [10.5.3 API Middleware](#1053-api-middleware)
  - [10.5.4 Helper Methods (`req.body`, `req.query`)](#1054-helper-methods-reqbody-reqquery)
  - [10.5.5 Dynamic API Routes](#1055-dynamic-api-routes)
- [10.6 Advanced API Patterns](#106-advanced-api-patterns)
  - [10.6.1 API Authentication](#1061-api-authentication)
  - [10.6.2 Rate Limiting](#1062-rate-limiting)
  - [10.6.3 CORS Configuration](#1063-cors-configuration)
  - [10.6.4 API Versioning](#1064-api-versioning)
  - [10.6.5 WebSocket Integration](#1065-websocket-integration)
  - [10.6.6 File Upload Handling](#1066-file-upload-handling)
  - [10.6.7 Edge API Routes / Route Handlers](#1067-edge-api-routes--route-handlers)
- [Topic 10 — Best Practices](#topic-10--best-practices)
- [Topic 10 — Common Mistakes to Avoid](#topic-10--common-mistakes-to-avoid)

---

## 10.1 Route Handlers (App Router)

### 10.1.1 `route.ts` / `route.js` Files

**Beginner Level:** A file named `route.ts` next to your `page.tsx` defines **HTTP endpoints** for that URL segment—like `/api/cart` or nested resource routes.

**Intermediate Level:** Only **one `route` module** per route folder; colocate with `page` carefully to avoid confusion about which handles GET page vs API.

**Expert Level:** For **versioned BFF** endpoints, structure `app/api/v2/.../route.ts` and keep **public contracts** documented (OpenAPI).

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "checkout-bff" });
}
```

#### Key Points — 10.1.1

- **File name** `route.ts` is special.
- Handlers are **server** modules.

---

### 10.1.2 HTTP Method Exports (GET, POST, etc.)

**Beginner Level:** Export `GET`, `POST`, … functions—Next maps them to HTTP verbs.

**Intermediate Level:** Unsupported methods return **405** automatically when no matching export.

**Expert Level:** Factor shared logic into **`lib/http.ts`**; keep exports **thin** for testability.

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ items: [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ created: true, echo: body }, { status: 201 });
}
```

#### Key Points — 10.1.2

- One export per supported **verb**.
- Use **correct semantics** for caches and intermediaries.

---

### 10.1.3 `Request` Object

**Beginner Level:** Web standard **`Request`** carries method, URL, headers, body stream.

**Intermediate Level:** Use `req.json()`, `req.text()`, `req.formData()`—but only **once** per request body consumption.

**Expert Level:** For **large uploads**, stream processing avoids buffering entire files in memory.

```typescript
export async function POST(req: Request) {
  const payload = (await req.json()) as { sku: string };
  return new Response(JSON.stringify({ sku: payload.sku }), {
    headers: { "content-type": "application/json" },
  });
}
```

#### Key Points — 10.1.3

- Standard **Fetch API** request object.
- Body can be read **only once** unless cloned.

---

### 10.1.4 Response Helpers

**Beginner Level:** `Response.json({ ok: true })` is convenient in modern handlers.

**Intermediate Level:** `NextResponse.json` adds **cookie** helpers and Next integrations.

**Expert Level:** For **typed** APIs, wrap helpers to enforce **consistent error shapes**.

```typescript
import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json({ ok: true as const, data }, init);
}

export function jsonErr(message: string, status = 400) {
  return NextResponse.json({ ok: false as const, error: message }, { status });
}
```

#### Key Points — 10.1.4

- Consistent envelopes ease **client** parsing.
- Prefer **NextResponse** when setting cookies.

---

### 10.1.5 `NextRequest` and `NextResponse`

**Beginner Level:** `NextRequest` extends `Request` with Next helpers like **`nextUrl`** for easier search param parsing.

**Intermediate Level:** `NextResponse.next()`, `redirect()`, `rewrite()` integrate with **middleware** patterns.

**Expert Level:** Use **`ip`/`geo`** (host-dependent) cautiously—privacy review for **SaaS** analytics.

```typescript
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ q });
}
```

#### Key Points — 10.1.5

- **`nextUrl`** simplifies URL mutation.
- Prefer typed **zod** parsing for inputs.

---

### 10.1.6 Dynamic Route Handlers

**Beginner Level:** `app/api/items/[id]/route.ts` handles `/api/items/:id`.

**Intermediate Level:** `context.params` provides `{ id: string }` (App Router)—validate types.

**Expert Level:** Multi-tenant SaaS: include **tenant** in path or resolve from **subdomain** + session.

```typescript
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json({ id });
}
```

> **Note:** In Next.js 15+, `context.params` is often a **Promise**—`await` it in handlers.

#### Key Points — 10.1.6

- Align folder names with **param** keys.
- **Await** params per your Next version.

---

### 10.1.7 Route Handler Caching

**Beginner Level:** `GET` handlers may be **cached** if marked static (per Next rules).

**Intermediate Level:** Use `export const dynamic = 'force-dynamic'` to opt out when returning **personalized** JSON.

**Expert Level:** Set **`revalidate`** for cached GET proxies to upstreams when building **public** read APIs.

```typescript
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ now: Date.now() });
}
```

#### Key Points — 10.1.7

- **GET** caching surprises are common—be explicit.
- **Mutations** should not be cached.

---

## 10.2 HTTP Methods

### 10.2.1 GET Requests

**Beginner Level:** Read data: list **blog** posts, **product** details.

**Intermediate Level:** **Idempotent** and **cacheable**—do not mutate state.

**Expert Level:** Add **ETag**/**Last-Modified** for conditional requests on heavy **dashboard** exports (advanced).

```typescript
export async function GET() {
  return Response.json({ posts: [] }, { headers: { "cache-control": "no-store" } });
}
```

#### Key Points — 10.2.1

- No **side effects**.
- Mind **PII** in URLs—prefer POST for sensitive filters sometimes.

---

### 10.2.2 POST Requests

**Beginner Level:** Create resources: **checkout** session, **social** post.

**Intermediate Level:** Validate JSON with **zod**; return **201** with `Location` header when appropriate.

**Expert Level:** Enforce **idempotency** with `Idempotency-Key` header for payments.

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({ text: z.string().min(1).max(280) });

export async function POST(req: Request) {
  const json: unknown = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json({ id: "p_new" }, { status: 201 });
}
```

#### Key Points — 10.2.2

- Validate **all** inputs.
- Use **201** for creates.

---

### 10.2.3 PUT Requests

**Beginner Level:** Replace a resource representation (e.g., **CMS page** payload).

**Intermediate Level:** Often **idempotent**—repeated PUT yields same end state.

**Expert Level:** For **SaaS settings**, implement field-level **PATCH** if partial updates dominate.

```typescript
export async function PUT() {
  return new Response(null, { status: 204 });
}
```

#### Key Points — 10.2.3

- Clarify **replace vs patch** semantics with clients.
- Log **audit** trails for admin PUTs.

---

### 10.2.4 PATCH Requests

**Beginner Level:** Partial updates: change **shipping** address on an order.

**Intermediate Level:** Merge patches carefully—use **JSON Merge Patch** or explicit DTOs.

**Expert Level:** Optimistic locking with **`If-Match`** / **version** fields for collaborative **dashboard** edits.

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

const Patch = z.object({ displayName: z.string().optional() });

export async function PATCH(req: Request) {
  const json: unknown = await req.json();
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json({ ok: true, user: parsed.data });
}
```

#### Key Points — 10.2.4

- Great for **partial** updates.
- Document **defaults** vs **undefined** fields.

---

### 10.2.5 DELETE Requests

**Beginner Level:** Remove a resource: delete **draft** post.

**Intermediate Level:** Return **204** or **200** with summary JSON—pick a standard.

**Expert Level:** Soft-delete for **compliance** (retain audit); **async** deletion jobs for large graphs.

```typescript
export async function DELETE() {
  return new Response(null, { status: 204 });
}
```

#### Key Points — 10.2.5

- Confirm **authorization** before delete.
- Consider **soft delete** patterns.

---

### 10.2.6 OPTIONS Requests

**Beginner Level:** Browsers send **OPTIONS** for CORS **preflight**.

**Intermediate Level:** Return **allowed methods** and **headers**.

**Expert Level:** Centralize CORS logic in **`lib/cors.ts`** shared by handlers.

```typescript
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    },
  });
}
```

#### Key Points — 10.2.6

- Required for many **cross-origin** setups.
- Keep **allowlists** tight.

---

### 10.2.7 HEAD Requests

**Beginner Level:** Like GET but **no body**—check existence/size.

**Intermediate Level:** Implement by reusing GET logic where safe.

**Expert Level:** Use for **CDN** validation and **cache** priming patterns (advanced).

```typescript
export async function HEAD() {
  return new Response(null, { status: 200, headers: { "content-length": "0" } });
}
```

#### Key Points — 10.2.7

- Rare in **BFF** apps but appears in **crawler** traffic.
- Ensure **consistent** headers with GET.

---

## 10.3 Request Handling

### 10.3.1 Reading Request Body

**Beginner Level:** `await req.json()` for JSON APIs.

**Intermediate Level:** For **raw** text, `req.text()`; for **streams**, `req.body` with readers.

**Expert Level:** **Size limits**—reject huge bodies early; use **reverse proxy** limits too.

```typescript
export async function POST(req: Request) {
  const text = await req.text();
  return Response.json({ bytes: text.length });
}
```

#### Key Points — 10.3.1

- Enforce **max body** size.
- Handle **malformed** JSON with try/catch.

---

### 10.3.2 Query Parameters

**Beginner Level:** `req.nextUrl.searchParams.get('page')` in `NextRequest`.

**Intermediate Level:** Coerce **numbers** safely; validate with zod **transforms**.

**Expert Level:** Avoid putting **secrets** in query strings—logs and referrers leak them.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Query = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function GET(req: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "bad_query" }, { status: 400 });
  return NextResponse.json(parsed.data);
}
```

#### Key Points — 10.3.2

- Treat query params as **strings** until parsed.
- Validate **ranges** for pagination.

---

### 10.3.3 Headers

**Beginner Level:** `req.headers.get('authorization')` for **Bearer** tokens.

**Intermediate Level:** Normalize **case**—headers are case-insensitive.

**Expert Level:** Implement **request signing** (`X-Signature`, timestamp, nonce) for **webhooks**.

```typescript
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  return Response.json({ hasAuth: Boolean(auth) });
}
```

#### Key Points — 10.3.3

- Never log **raw** auth headers in production.
- Validate **content-type** before parsing bodies.

---

### 10.3.4 Cookies

**Beginner Level:** `req.cookies.get('session')` with `NextRequest` (or `cookies()` in server contexts).

**Intermediate Level:** Prefer **`httpOnly` `secure` cookies** for session IDs.

**Expert Level:** **Rotate** sessions on privilege elevation; bind cookie to **user-agent** fingerprint only if privacy reviewed.

```typescript
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  return NextResponse.json({ signedIn: Boolean(token) });
}
```

#### Key Points — 10.3.4

- Server-side readable cookies for **BFF** auth.
- **CSRF** protections for cookie-based POST (use tokens).

---

### 10.3.5 Form Data

**Beginner Level:** `await req.formData()` for `multipart` or `x-www-form-urlencoded`.

**Intermediate Level:** Extract fields with **`get`**; validate.

**Expert Level:** For **large** uploads, stream to object storage (S3) instead of buffering.

```typescript
export async function POST(req: Request) {
  const fd = await req.formData();
  const title = String(fd.get("title") ?? "");
  return Response.json({ title });
}
```

#### Key Points — 10.3.5

- Great for **HTML forms** + progressive enhancement.
- Watch **CSRF** for cookie auth.

---

### 10.3.6 JSON Parsing

**Beginner Level:** `req.json()` parses JSON body.

**Intermediate Level:** Wrap in **try/catch**; return **400** on parse errors.

**Expert Level:** Use **zod** schemas shared with client types (e.g., **zod-to-ts** pipelines).

```typescript
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  return NextResponse.json({ echo: json });
}
```

#### Key Points — 10.3.6

- Always handle **parse failures**.
- Version schemas for **API evolution**.

---

### 10.3.7 URL Parameters

**Beginner Level:** Dynamic route `[id]` becomes `params.id`.

**Intermediate Level:** Validate UUIDs/slugs before DB queries.

**Expert Level:** Return **404** vs **400** consistently across the API surface.

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

const Params = z.object({ id: z.string().uuid() });

type Ctx = { params: Promise<Record<string, string | string[] | undefined>> };

export async function GET(_req: Request, ctx: Ctx) {
  const raw = await ctx.params;
  const parsed = Params.safeParse({ id: raw.id });
  if (!parsed.success) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  return NextResponse.json({ id: parsed.data.id });
}
```

#### Key Points — 10.3.7

- Params may be **string[]** in catch-all routes—narrow carefully.
- **Await** params per Next 15+ conventions.

---

## 10.4 Response Handling

### 10.4.1 JSON Responses

**Beginner Level:** `NextResponse.json({ ok: true })` sets `content-type` for you.

**Intermediate Level:** Keep a **stable envelope** `{ data, error }` for SaaS public APIs.

**Expert Level:** Add **`requestId`** fields for **support** correlation across microservices.

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { data: { sku: "SKU-1", priceCents: 999 } },
    { status: 200 }
  );
}
```

#### Key Points — 10.4.1

- JSON is default for **BFF** endpoints.
- Consider **compression** at CDN/edge.

---

### 10.4.2 Status Codes

**Beginner Level:** **200** OK, **201** created, **400** bad input, **401** unauthenticated, **403** forbidden, **404** not found, **500** server error.

**Intermediate Level:** Use **422** for validation semantics if your API standard requires it.

**Expert Level:** Map **domain errors** to stable **machine-readable** codes (`{ code: 'INSUFFICIENT_STOCK' }`).

```typescript
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: { code: "OUT_OF_STOCK" } }, { status: 409 });
}
```

#### Key Points — 10.4.2

- Consistency beats creativity in **status** usage.
- Document **codes** in OpenAPI.

---

### 10.4.3 Custom Headers

**Beginner Level:** `new Response(body, { headers: { 'x-request-id': id } })`.

**Intermediate Level:** Expose **`Cache-Control`** carefully for **public** GET proxies.

**Expert Level:** **Content-Security-Policy** is usually page-level, but APIs returning HTML fragments need thought.

```typescript
export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "x-api-version": "2025-03-01",
    },
  });
}
```

#### Key Points — 10.4.3

- Headers are part of your **contract**.
- Avoid **PII** in custom headers.

---

### 10.4.4 Cookies in Response

**Beginner Level:** `NextResponse.next()` then `cookie.set` patterns, or `NextResponse.json` + `cookies().set` in server actions—**in route handlers**, use `NextResponse` cookie helpers.

**Intermediate Level:** Set **`httpOnly`**, **`secure`**, **`sameSite`**, **`path`**, **`maxAge`**.

**Expert Level:** **Rotate** refresh tokens; detect **reuse** for theft detection.

```typescript
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "abc", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
```

#### Key Points — 10.4.4

- Never expose **session** cookies to JS (`httpOnly`).
- Align **`domain`** with subdomains carefully.

---

### 10.4.5 Redirects

**Beginner Level:** `NextResponse.redirect(new URL('/login', req.url))`.

**Intermediate Level:** Use **307** vs **308** appropriately for method retention.

**Expert Level:** Prevent **open redirects**—allowlist destinations.

```typescript
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/shop";
  return NextResponse.redirect(url);
}
```

#### Key Points — 10.4.5

- Prefer **server redirects** for auth gating when possible.
- Validate **next** parameters.

---

### 10.4.6 Streaming Responses

**Beginner Level:** Return a **`ReadableStream`** for **SSE**-like patterns.

**Intermediate Level:** Set **`content-type: text/event-stream`** for SSE.

**Expert Level:** For **LLM** dashboards, stream tokens to the client with **backpressure** awareness.

```typescript
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      controller.enqueue(enc.encode("event: ping\n"));
      controller.enqueue(enc.encode("data: hello\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
```

#### Key Points — 10.4.6

- Streaming improves **TTFB** for long responses.
- Proxies may **buffer**—configure accordingly.

---

### 10.4.7 Error Responses

**Beginner Level:** Return JSON errors with **clear messages** (safe for users).

**Intermediate Level:** Log **stack traces** server-side only.

**Expert Level:** Integrate **Sentry** with **requestId** tags; sanitize **sequelize/prisma** errors.

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  try {
    throw new Error("db down");
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "INTERNAL", requestId: "req_123" } },
      { status: 500 }
    );
  }
}
```

#### Key Points — 10.4.7

- Never leak **SQL** details to clients.
- Use **structured** logging.

---

## 10.5 API Routes (Pages Router)

### 10.5.1 `pages/api/` Handler Functions

**Beginner Level:** Default export `(req, res) => void` handles `/api/...`.

**Intermediate Level:** Use **`NextApiRequest` / `NextApiResponse`** types.

**Expert Level:** Split large handlers into **`lib/controllers`** with unit tests.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { ok: true };

export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ ok: true });
}
```

#### Key Points — 10.5.1

- One default export per file (typically).
- Node **HTTP** semantics.

---

### 10.5.2 `req` and `res` Objects

**Beginner Level:** `req.method`, `req.query`, `req.body` (parsed), `res.status().json()`.

**Intermediate Level:** **`req.body`** parsing can be disabled for **webhooks** needing raw buffers.

**Expert Level:** Mind **type** of `req.query` values (`string | string[]`).

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => resolve());
    req.on("error", reject);
  });
  const raw = Buffer.concat(chunks).toString("utf8");
  res.status(200).json({ bytes: raw.length });
}
```

#### Key Points — 10.5.2

- **`bodyParser: false`** for **Stripe** webhooks.
- **`res`** methods chain carefully—send once.

---

### 10.5.3 API Middleware

**Beginner Level:** Higher-order function wraps handler with **auth** checks.

**Intermediate Level:** Compose **`withCors(withAuth(handler))`**.

**Expert Level:** For **Pages Router**, you can also use **edge middleware** for cross-cutting security headers (distinct from API wrapper).

```typescript
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export function withMethod(method: string, handler: NextApiHandler): NextApiHandler {
  return (req, res) => {
    if (req.method !== method) {
      res.setHeader("Allow", method);
      return res.status(405).end("Method Not Allowed");
    }
    return handler(req, res);
  };
}
```

#### Key Points — 10.5.3

- Keep handlers **thin**.
- Share middleware across **routes**.

---

### 10.5.4 Helper Methods (`req.body`, `req.query`)

**Beginner Level:** `req.query.id` reads dynamic API route params.

**Intermediate Level:** Validate with **zod** before DB access.

**Expert Level:** For **batch** endpoints, accept **JSON arrays** with max length guards.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const Body = z.object({ items: z.array(z.string()).max(50) });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid" });
  return res.status(200).json({ count: parsed.data.items.length });
}
```

#### Key Points — 10.5.4

- **`req.body`** is already parsed unless disabled.
- Enforce **limits** on arrays/strings.

---

### 10.5.5 Dynamic API Routes

**Beginner Level:** `pages/api/orders/[id].ts` → `/api/orders/:id`.

**Intermediate Level:** Authorize **ownership**: user A cannot fetch user B’s order.

**Expert Level:** Add **rate limiting** keys scoped by **userId + route**.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "bad_id" });
  return res.status(200).json({ orderId: id });
}
```

#### Key Points — 10.5.5

- **Authorize**, not just **authenticate**.
- Consistent **404** for hidden resources (avoid enumeration).

---

## 10.6 Advanced API Patterns

### 10.6.1 API Authentication

**Beginner Level:** Check **`Authorization: Bearer`** header.

**Intermediate Level:** Use **JWT** verification or **session** cookie validation per request.

**Expert Level:** **mTLS** or **signed service-to-service** calls for internal **SaaS** jobs.

```typescript
import { NextRequest, NextResponse } from "next/server";

export function withBearer(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    // verify token…
    return handler(req);
  };
}
```

#### Key Points — 10.6.1

- Reject **missing/invalid** auth early.
- Log **auth failures** with care (no tokens).

---

### 10.6.2 Rate Limiting

**Beginner Level:** Block clients exceeding **N requests/minute**—protect **login** and **write** APIs.

**Intermediate Level:** Use **Redis** (Upstash) counters keyed by **IP + route** or **userId**.

**Expert Level:** **Sliding window** algorithms; **penalty boxes** for abuse; **bot** detection upstream.

```typescript
// Conceptual interface — implement with Redis INCR + EXPIRE
export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export async function rateLimit(_key: string): Promise<RateLimitResult> {
  return { ok: true };
}
```

#### Key Points — 10.6.2

- Protect **expensive** endpoints first.
- Return **`Retry-After`** header when possible.

---

### 10.6.3 CORS Configuration

**Beginner Level:** Allow **trusted origins** to call your BFF from browsers.

**Intermediate Level:** Handle **OPTIONS** preflight; echo **Allow-Origin** for allowlisted origins only.

**Expert Level:** Avoid **`*`** with credentials; prefer **same-site** cookies + same-origin fetch when possible.

```typescript
import { NextResponse } from "next/server";

const ALLOW = new Set(["https://app.example.com"]);

export function cors(res: NextResponse, origin: string | null) {
  if (origin && ALLOW.has(origin)) {
    res.headers.set("access-control-allow-origin", origin);
    res.headers.set("vary", "Origin");
  }
  return res;
}
```

#### Key Points — 10.6.3

- **Credentials** require explicit origins.
- Never reflect **untrusted** Origin blindly.

---

### 10.6.4 API Versioning

**Beginner Level:** Prefix `/api/v1` vs `/api/v2`.

**Intermediate Level:** Maintain **backward compatible** changes; deprecate with **sunset** headers.

**Expert Level:** **Contract tests** in CI for **mobile** clients on old versions.

```typescript
export const API_VERSION = "2025-03-01";
```

#### Key Points — 10.6.4

- Version **contracts**, not implementations only.
- Document **breaking** changes.

---

### 10.6.5 WebSocket Integration

**Beginner Level:** Next **Route Handlers** are **HTTP**—WebSockets need **custom server** or external **realtime** service (Pusher, Ably, Supabase Realtime).

**Intermediate Level:** Use **SSE** from route handlers for **one-way** streams.

**Expert Level:** For **chat**, isolate **connection state** in a dedicated service; Next handles **auth** handshakes only.

```typescript
// Typical pattern: issue short-lived token via Route Handler, client connects to realtime vendor
import { NextResponse } from "next/server";

export async function POST() {
  const token = "rt_abc"; // mint with vendor SDK
  return NextResponse.json({ token });
}
```

#### Key Points — 10.6.5

- Plan **transport** outside Next if you need bi-directional sockets at scale.
- **SSE** is simpler for **notifications** feeds.

---

### 10.6.6 File Upload Handling

**Beginner Level:** `multipart/form-data` to Route Handler, forward to **S3** presigned URL.

**Intermediate Level:** Validate **MIME** type and **size**; scan for **malware** in enterprise SaaS.

**Expert Level:** Use **direct-to-S3** uploads with **presigned POST** to keep Next nodes light.

```typescript
export async function POST(req: Request) {
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "missing_file" }, { status: 400 });
  }
  return Response.json({ name: file.name, size: file.size });
}
```

#### Key Points — 10.6.6

- Never trust **client-provided** MIME alone.
- Prefer **storage** offload for big files.

---

### 10.6.7 Edge API Routes / Route Handlers

**Beginner Level:** Run handlers at the **edge** for low latency **geo** routing.

**Intermediate Level:** `export const runtime = 'edge'` (verify current Next docs for exact API).

**Expert Level:** **No Node APIs** (`fs`, some crypto)—use **web** APIs only; watch **CPU** limits.

```typescript
export const runtime = "edge";

export async function GET(req: Request) {
  const country = req.headers.get("x-vercel-ip-country") ?? "unknown";
  return Response.json({ country });
}
```

#### Key Points — 10.6.7

- Great for **A/B**, **geo**, **lightweight** transforms.
- Not for **heavy** DB drivers incompatible with edge.

---

### Supplement: OpenAPI and typed clients

**Beginner Level:** Document endpoints for **mobile** and **partner** teams.

**Intermediate Level:** Generate **types** with **openapi-typescript**.

**Expert Level:** CI **contract tests** ensure handlers match spec.

#### Key Points — OpenAPI

- **Spec-first** reduces integration bugs.
- Keep **examples** realistic (pagination).

---

### Supplement: Idempotency for e-commerce checkouts

**Beginner Level:** Double-clicks should not **double-charge**.

**Intermediate Level:** Accept **`Idempotency-Key`** header; store results in Redis **24h**.

**Expert Level:** Align with **payment provider** idempotency semantics.

#### Key Points — Idempotency

- Critical for **POST** that costs money.
- Return **same response** on replay.

---

### Supplement: Webhooks from CMS (blog)

**Beginner Level:** CMS calls `/api/revalidate` on publish.

**Intermediate Level:** Verify **HMAC** signatures.

**Expert Level:** **Queue** webhook processing for **retries** and **ordering**.

#### Key Points — Webhooks

- **Authenticate** and **dedupe** events.
- Respond **fast**; process async when heavy.

---

### Supplement: Admin dashboards exporting CSV

**Beginner Level:** `GET` returns `text/csv` stream.

**Intermediate Level:** Set `content-disposition: attachment`.

**Expert Level:** **Background job** + **signed download URL** for huge exports.

```typescript
export async function GET() {
  const csv = "id,name\n1,Ada\n";
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="users.csv"',
    },
  });
}
```

#### Key Points — CSV exports

- **Stream** large datasets.
- **Authorize** export capabilities.

---

### Supplement: Social graph follow/unfollow mutations

**Beginner Level:** `POST /api/follow` toggles follow.

**Intermediate Level:** Return **updated counts** + **optimistic** UI hints.

**Expert Level:** **Fan-out** writes to timelines async; **rate limit** burst follows.

#### Key Points — Social

- Beware **abuse** patterns (mass follows).
- Consider **event-driven** architecture at scale.

---

## Topic 10 — Best Practices

- Validate **all inputs** with **zod** (or similar) at the HTTP boundary.
- Return **consistent JSON** envelopes and **documented** error codes.
- Use **appropriate HTTP methods** and **status codes**; include **`Allow`** for 405s.
- Set **security headers** and **CORS** deliberately—no wildcard credentials.
- Never log **secrets**; include **`requestId`** for traceability.
- Implement **authz** checks per **resource**, not only login gating.
- Add **rate limiting** to expensive/auth endpoints.
- For uploads, prefer **presigned URLs** and **virus scanning** when required.
- Mark **dynamic** route handlers explicitly when responses must not be cached.
- Write **integration tests** for critical BFF routes (checkout, permissions, webhooks).

---

## Topic 10 — Common Mistakes to Avoid

- Reading **`req.json()` twice** without cloning the request.
- Returning **500** for validation errors (should be **400/422**).
- **Open redirects** and **open CORS** reflecting arbitrary `Origin`.
- Using **GET** endpoints that **mutate** state (breaks caches/proxies).
- **Leaking stack traces** and **SQL** errors to clients.
- Forgetting **`bodyParser: false`** for **signed** webhook payloads.
- Assuming **edge** runtime supports all **Node** APIs your DB driver needs.
- **Unbounded** JSON arrays/body sizes leading to **DoS**.
- Inconsistent **404** behavior leaking resource existence for **private** data.
- Caching **personalized** GET handlers accidentally—explicit `dynamic`/`cache-control`.

---

*Route Handlers and API routes are your application’s public contract. Treat them like production services: typed, validated, observable, and secure by default.*


