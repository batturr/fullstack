# Advanced Topics in Next.js

Edge runtimes, experimental rendering, security hardening, real-time systems, GraphQL, headless CMS, monorepos, and custom servers—explained with e-commerce, blog, SaaS dashboard, and social product scenarios. All examples emphasize TypeScript.

## 📑 Table of Contents

- [26.1 Edge Runtime](#261-edge-runtime)
  - [Overview](#overview)
  - [Edge vs Node.js](#edge-vs-nodejs)
  - [Middleware](#middleware)
  - [API Routes on the Edge](#api-routes-on-the-edge)
  - [Limitations](#limitations)
  - [Use Cases](#use-cases)
- [26.2 Partial Prerendering (PPR)](#262-partial-prerendering-ppr)
  - [Concept (Experimental)](#concept-experimental)
  - [Static Shell + Dynamic](#static-shell--dynamic)
  - [Configuration](#configuration)
  - [Benefits](#benefits)
- [26.3 React Server Components Deep Dive](#263-react-server-components-deep-dive)
  - [RSC Architecture](#rsc-architecture)
  - [RSC Payload](#rsc-payload)
  - [Serialization](#serialization)
  - [Client Boundaries](#client-boundaries)
- [26.4 Security](#264-security)
  - [Content Security Policy (CSP)](#content-security-policy-csp)
  - [CSRF](#csrf)
  - [XSS Prevention](#xss-prevention)
  - [SQL Injection](#sql-injection)
  - [Environment Variable Security](#environment-variable-security)
  - [API Route Security](#api-route-security)
  - [Authentication Best Practices](#authentication-best-practices)
- [26.5 WebSockets and Real-time](#265-websockets-and-real-time)
  - [WebSocket Integration](#websocket-integration)
  - [Socket.io](#socketio)
  - [Server-Sent Events (SSE)](#server-sent-events-sse)
  - [Real-time Data Patterns](#real-time-data-patterns)
  - [Pusher and Ably](#pusher-and-ably)
- [26.6 GraphQL](#266-graphql)
  - [Apollo Client](#apollo-client)
  - [GraphQL Server](#graphql-server)
  - [Apollo Server Setup](#apollo-server-setup)
  - [Code Generation](#code-generation)
  - [urql](#urql)
- [26.7 Content Management Systems (CMS)](#267-content-management-systems-cms)
  - [Headless CMS](#headless-cms)
  - [Contentful](#contentful)
  - [Sanity](#sanity)
  - [Strapi](#strapi)
  - [Prismic](#prismic)
  - [WordPress Headless](#wordpress-headless)
- [26.8 Monorepo Setup](#268-monorepo-setup)
  - [Turborepo](#turborepo)
  - [Nx](#nx)
  - [pnpm Workspaces](#pnpm-workspaces)
  - [Sharing Code](#sharing-code)
- [26.9 Custom Server](#269-custom-server)
  - [Custom Express](#custom-express)
  - [server.js Entry](#serverjs-entry)
  - [When to Use](#when-to-use)
  - [Custom Server Limitations](#custom-server-limitations)
- [Production Checklists and Patterns](#production-checklists-and-patterns)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 26.1 Edge Runtime

### Overview

**Beginner Level:** The Edge Runtime is a lightweight JavaScript environment that runs closer to users—often on CDN edge locations—so redirects and simple auth checks feel instant for a global social app.

**Intermediate Level:** It is **not** full Node.js: a subset of APIs (`fetch`, `Request`, `Response`, `URL`, crypto) is available, startup is fast, and CPU/memory limits are tighter than a long-lived server.

**Expert Level:** Use edge when latency dominates and work is small (JWT verification, feature flags, geo routing). Push heavy ORM/database work to Node runtimes or dedicated services to avoid timeouts and compatibility issues.

```typescript
export const runtime = "edge";
```

**Key Points — Overview**

- Edge complements Node; it does not replace it for all workloads.
- Measure cold starts and regional variance in RUM.

---

### Edge vs Node.js

**Beginner Level:** Node.js supports `fs`, native addons, and most npm packages; Edge supports a browser-like API surface.

**Intermediate Level:** Prisma Client, some image libraries, and native modules often require Node. Edge-friendly code uses `fetch` + Web Crypto.

**Expert Level:** Split architecture: edge middleware for fast decisions; Node route handlers or external microservices for transactional e-commerce checkout logic hitting PostgreSQL.

```typescript
// Edge-safe crypto sketch
export async function verifyHs256Jwt(token: string, secret: string): Promise<boolean> {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const data = enc.encode(`${h}.${p}`);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const b64url = Buffer.from(sig).toString("base64url");
  return b64url === s;
}
```

**Key Points — Edge vs Node**

- Choose runtime per route via `export const runtime`.
- Avoid accidental Node imports in edge files—CI lint rules help.

---

### Middleware

**Beginner Level:** Middleware runs before a request finishes—great for sending shoppers from `/` to `/deals` when a cookie says they prefer the sale tab.

**Intermediate Level:** Read `NextRequest` cookies/headers, rewrite to localized paths, or attach tracing IDs for SaaS observability.

**Expert Level:** Compose auth + locale + bot protection; keep CPU minimal; avoid external calls without timeouts; be careful with large cookies.

```typescript
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !req.cookies.get("session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

**Key Points — Middleware**

- Runs on every matched request—optimize matchers.
- Prefer `NextResponse.rewrite` for invisible routing when appropriate.

---

### API Routes on the Edge

**Beginner Level:** A route handler can set `runtime = "edge"` to respond from edge locations—useful for quick aggregations calling other HTTPS APIs.

**Intermediate Level:** Good for A/B assignment endpoints or geo-personalized hero config for a marketing blog.

**Expert Level:** Watch subrequest limits; cache responses with `Cache-Control` when safe; do not embed secrets in client-visible responses.

```typescript
export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sku = searchParams.get("sku");
  if (!sku) return new Response("missing sku", { status: 400 });
  const res = await fetch(`https://api.example.com/products/${sku}`, { next: { revalidate: 60 } });
  return new Response(res.body, { headers: { "content-type": "application/json" } });
}
```

**Key Points — Edge API Routes**

- Ideal for fan-out `fetch` patterns with small payloads.
- Avoid long CPU loops—edge functions have tighter limits.

---

### Limitations

**Beginner Level:** Cannot use every npm package—especially ones needing Node APIs.

**Intermediate Level:** File system, child processes, and some WASM setups may be unsupported or tricky.

**Expert Level:** Debugging distributed edge logs is harder than single Node servers; consistent structured logging and trace IDs are mandatory at scale.

**Key Points — Limitations**

- Read current Next.js edge runtime docs when upgrading versions.
- Load test edge endpoints—they behave differently than Node under burst.

---

### Use Cases

**Beginner Level:** Redirects, simple header injection, locale detection.

**Intermediate Level:** JWT cookie validation before serving cached marketing pages.

**Expert Level:** Multi-tenant SaaS hostname routing (`tenant.app.com`) to the correct region origin with zero Node cold start on auth checks.

**Key Points — Use Cases**

- Match use case to latency and isolation requirements.
- Re-evaluate when Node runtime improves cold starts in your host environment.

---

## 26.2 Partial Prerendering (PPR)

### Concept (Experimental)

**Beginner Level:** PPR tries to combine static speed with dynamic freshness: ship a static shell quickly, stream dynamic holes.

**Intermediate Level:** Think “mostly static product page + dynamic inventory badge” without forcing the entire route dynamic.

**Expert Level:** Adoption depends on Next.js version flags—verify experimental status, measure TTFB vs staleness trade-offs, and align CDN caching rules with dynamic holes.

**Key Points — Concept**

- Experimental features need pinning and release monitoring.
- Product + engineering should agree on acceptable staleness.

---

### Static Shell + Dynamic

**Beginner Level:** Users see header, footer, and hero instantly while personalized recommendations load.

**Intermediate Level:** Use Suspense boundaries around dynamic widgets on a storefront.

**Expert Level:** Ensure skeleton placeholders reserve space to protect CLS; coordinate with CMS preview and edge caches.

```tsx
import { Suspense } from "react";

async function Recommendations({ userId }: { userId: string }) {
  const items = await fetch(`https://api.example.com/reco/${userId}`, { cache: "no-store" }).then((r) =>
    r.json(),
  );
  return <ul>{items.map((i: { id: string }) => <li key={i.id}>{i.id}</li>)}</ul>;
}

export default function HomePage({ userId }: { userId: string }) {
  return (
    <main>
      <h1>Weekly deals</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded bg-muted" />}>
        <Recommendations userId={userId} />
      </Suspense>
    </main>
  );
}
```

**Key Points — Static Shell**

- Suspense boundaries define dynamic regions.
- Fallback UI must approximate final layout height.

---

### Configuration

**Beginner Level:** Enable experimental flags in `next.config` when documented for your version.

**Intermediate Level:** Validate preview/staging before production toggles.

**Expert Level:** Automate canary deployments comparing Web Vitals with feature flag on/off.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
};

export default nextConfig;
```

**Key Points — Configuration**

- Experimental flags differ across releases—read the changelog.
- Keep rollback plan (config revert) one click away.

---

### Benefits

**Beginner Level:** Faster first paint for content-heavy blog templates.

**Intermediate Level:** Better SEO crawlability when static HTML includes primary copy.

**Expert Level:** Cost savings when CDN serves static portions while dynamic queries hit smaller origin subsets.

**Key Points — Benefits**

- Combine with monitoring to prove wins.
- Watch backend QPS when dynamic holes multiply.

---

## 26.3 React Server Components Deep Dive

### RSC Architecture

**Beginner Level:** Most of your blog article can render on the server without shipping React component code for static paragraphs.

**Intermediate Level:** Server Components fetch data directly; React serializes a payload describing UI + client boundaries.

**Expert Level:** Flight protocol streams updates; bundler splits client references; caching layers (`fetch` cache, full route cache) interact with RSC trees—reason about invalidation holistically.

**Key Points — RSC Architecture**

- Server-first by default in App Router.
- Client boundaries are explicit with `"use client"`.

---

### RSC Payload

**Beginner Level:** The browser receives a special payload, not only HTML, so React can hydrate client islands intelligently.

**Intermediate Level:** Large props to client boundaries increase payload size—keep them minimal.

**Expert Level:** Inspect network tab during development; watch for accidental serialization of huge objects (ORM entities with relations) in SaaS admin tools.

**Key Points — RSC Payload**

- Payload size is a performance metric.
- Prefer DTO projections before passing to Client Components.

---

### Serialization

**Beginner Level:** Only JSON-serializable data crosses server→client boundaries (plus React elements rules).

**Intermediate Level:** Dates become strings unless you transform them; `Map`/`Set` need conversion.

**Expert Level:** Design DTOs with `zod` or `superstruct` at boundaries; centralize mappers for e-commerce `Order` types.

```typescript
export type OrderSummaryDTO = {
  id: string;
  placedAtIso: string;
  totalCents: number;
};

export function toOrderSummaryDTO(order: { id: string; placedAt: Date; totalCents: number }): OrderSummaryDTO {
  return { id: order.id, placedAtIso: order.placedAt.toISOString(), totalCents: order.totalCents };
}
```

**Key Points — Serialization**

- Serialization errors surface as runtime failures—test boundaries.
- Keep DTOs stable for client caches.

---

### Client Boundaries

**Beginner Level:** Put `"use client"` on interactive widgets (likes on a social post).

**Intermediate Level:** Do not mark entire layouts client unless necessary—keeps dashboards fast.

**Expert Level:** Compose small client leaves around `contenteditable`, charts, or drag-and-drop; pass server-fetched summaries as props.

```tsx
"use client";

import { useState } from "react";

export function LikeButton({ postId, initial }: { postId: string; initial: number }) {
  const [count, setCount] = useState(initial);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)} aria-label="like">
      ♥ {count}
    </button>
  );
}
```

**Key Points — Client Boundaries**

- Push `"use client"` down the tree.
- Avoid importing server-only modules from client files.

---

## 26.4 Security

### Content Security Policy (CSP)

**Beginner Level:** CSP headers tell browsers which script sources are allowed—reducing XSS blast radius on a blog with user comments.

**Intermediate Level:** Use nonces generated per request in middleware and thread through `next/script` where supported.

**Expert Level:** Tighten `default-src`, `img-src`, `connect-src` for analytics domains; test report-only mode first.

```typescript
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https:`,
    `connect-src 'self' https://api.example.com`,
  ].join("; ");
  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("x-nonce", nonce);
  return res;
}
```

**Key Points — CSP**

- Start with report-only in staging.
- Nonces require dynamic HTML—cannot cache HTML with wrong nonce.

---

### CSRF

**Beginner Level:** Cross-Site Request Forgery tricks a logged-in user into submitting unwanted actions (transfer points in a social game).

**Intermediate Level:** Use framework protections: SameSite cookies, POST for mutations, CSRF tokens for cookie-based auth.

**Expert Level:** For Server Actions, follow Next.js security guidance for origin checks; pair with custom headers for double-submit cookie patterns when needed.

**Key Points — CSRF**

- JWT in `Authorization` header is less CSRF-prone than cookie-only auth.
- Never assume `POST` alone is sufficient without SameSite strategy.

---

### XSS Prevention

**Beginner Level:** Do not `dangerouslySetInnerHTML` with unsanitized user bios.

**Intermediate Level:** Sanitize rich text with allowlisted tags server-side; escape output in emails.

**Expert Level:** Content Security Policy + strict templating + DOMPurify on client when unavoidable; log XSS attempts via WAF.

```tsx
// Prefer plain text from trusted renderer pipelines
export function UserBio({ text }: { text: string }) {
  return <p>{text}</p>;
}
```

**Key Points — XSS**

- Treat all user content as hostile.
- Validate and sanitize at write time, not only read time.

---

### SQL Injection

**Beginner Level:** Attackers inject SQL via query parameters on legacy search boxes.

**Intermediate Level:** Always use parameterized queries in Prisma/Drizzle/Knex—never string-concat SQL.

**Expert Level:** Least-privilege DB roles for app servers; separate read replicas for reporting dashboards in SaaS.

```typescript
// Good: parameterized via ORM
await prisma.user.findMany({ where: { email: userInput } });
```

**Key Points — SQL Injection**

- ORMs help but raw queries still need discipline.
- Audit any `$queryRaw` usages in code review.

---

### Environment Variable Security

**Beginner Level:** Only `NEXT_PUBLIC_*` belongs in client bundles—never put database passwords there.

**Intermediate Level:** Use secret managers in production; rotate keys regularly.

**Expert Level:** Validate required env at boot; fail fast in containers; map Vercel env groups per environment.

```typescript
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env ${name}`);
  return v;
}

export const databaseUrl = () => requireEnv("DATABASE_URL");
```

**Key Points — Env Var Security**

- Scan builds for accidental `NEXT_PUBLIC_` misuse.
- Log env names, not values, in errors.

---

### API Route Security

**Beginner Level:** Check authentication before returning private order details in e-commerce APIs.

**Intermediate Level:** Rate limit login routes; validate JSON bodies with Zod.

**Expert Level:** mTLS between services, WAF rules, IP allowlists for internal admin APIs, structured audit logs for mutations.

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({ sku: z.string(), qty: z.number().int().positive() });

export async function POST(req: Request) {
  const json: unknown = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```

**Key Points — API Route Security**

- Consistent error shapes without leaking stack traces.
- Authorization after authentication—check resource ownership.

---

### Authentication Best Practices

**Beginner Level:** Use established providers (Auth.js, Clerk, Auth0) instead of rolling crypto.

**Intermediate Level:** Rotate refresh tokens; short-lived access tokens; secure, HttpOnly cookies.

**Expert Level:** Step-up MFA for sensitive SaaS actions; device binding for social account recovery; monitor brute force with anomaly detection.

**Key Points — Auth Best Practices**

- Threat model OAuth redirects and open redirects.
- Log auth events with user id + ip + user-agent (privacy permitting).

---

## 26.5 WebSockets and Real-time

### WebSocket Integration

**Beginner Level:** Chat on a social app updates live without refreshing—WebSockets keep a persistent connection.

**Intermediate Level:** Browsers open `wss://` connections to a gateway; Next.js UI subscribes in Client Components.

**Expert Level:** Scale with Redis pub/sub or managed gateways; authenticate during handshake; backoff reconnects with jitter.

```tsx
"use client";

import { useEffect, useState } from "react";

export function LiveCounter({ url }: { url: string }) {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (ev) => setValue(Number(ev.data));
    return () => ws.close();
  }, [url]);
  return <output aria-live="polite">{value ?? "…"}</output>;
}
```

**Key Points — WebSocket Integration**

- Always `wss://` in production.
- Handle cleanup on unmount to avoid leaks.

---

### Socket.io

**Beginner Level:** Socket.io layers rooms, fallbacks, and heartbeats atop WebSockets—nice for MVP dashboards.

**Intermediate Level:** Run a Node server (custom server or separate service) because Socket.io expects long-lived connections.

**Expert Level:** Sticky sessions behind load balancers; monitor memory per room; cap message size to prevent abuse.

**Key Points — Socket.io**

- Not edge-friendly in classic setups—deploy as dedicated service.
- Version client/server packages together.

---

### Server-Sent Events (SSE)

**Beginner Level:** One-way server→browser stream for live blog comment updates or order status.

**Intermediate Level:** Implement via `ReadableStream` in route handlers; reconnect from client using `EventSource`.

**Expert Level:** Pair with HTTP/2; mind proxy buffering; authenticate with short-lived tokens in query (carefully) or cookies with SameSite policies.

```typescript
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("data: hello\n\n"));
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream" } });
}
```

**Key Points — SSE**

- Simpler than WebSockets for one-way feeds.
- Watch infrastructure timeouts on long-lived connections.

---

### Real-time Data Patterns

**Beginner Level:** Show “5 people viewing this deal” on e-commerce PDP.

**Intermediate Level:** Combine periodic polling for low-frequency updates vs push for chat.

**Expert Level:** CRDTs/OT for collaborative SaaS editors; operational transforms require server authority.

**Key Points — Real-time Data**

- Choose transport based on directionality and frequency.
- Cache last-known-good UI state offline when possible.

---

### Pusher and Ably

**Beginner Level:** Hosted pub/sub with SDKs—fast path for notifications in a startup social app.

**Intermediate Level:** Use private channels per user; authorize via Next API route.

**Expert Level:** Compare pricing, SLAs, regional latency, and GDPR data processing agreements for EU customers.

```typescript
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

**Key Points — Pusher/Ably**

- Great when self-hosting WebSockets is not core competency.
- Never expose server secrets to the client.

---

## 26.6 GraphQL

### Apollo Client

**Beginner Level:** Apollo caches GraphQL query results on the client for snappy SaaS dashboards.

**Intermediate Level:** Use `ApolloNextAppProvider` patterns for App Router as documented for your Apollo version.

**Expert Level:** Tune cache policies (`typePolicies`) for paginated social feeds; evict on mutations.

```tsx
"use client";

import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({ uri: "/api/graphql" }),
  cache: new InMemoryCache(),
});

export function GraphqlProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
```

**Key Points — Apollo Client**

- Watch bundle size—Apollo is powerful but heavy.
- Prefer persisted queries at scale.

---

### GraphQL Server

**Beginner Level:** One endpoint returns exactly the fields the mobile app needs—useful for e-commerce product pages shared by web and native.

**Intermediate Level:** Implement in Node (`graphql-yoga`, Apollo Server) behind `/api/graphql` route.

**Expert Level:** Enforce depth limits, cost analysis, and auth at resolver boundaries; DataLoader for N+1 protection.

**Key Points — GraphQL Server**

- Strong schema governance prevents client-induced DB storms.
- Rate limit introspection in production.

---

### Apollo Server Setup

**Beginner Level:** Define `typeDefs` + `resolvers`, plug into HTTP handler.

**Intermediate Level:** Context carries `viewer` from session cookie.

**Expert Level:** Federation across subgraphs for large orgs—gateway composition with tracing.

```typescript
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const typeDefs = `#graphql
  type Query { health: String! }
`;

const resolvers = { Query: { health: () => "ok" } };

const server = new ApolloServer({ typeDefs, resolvers });

export default startServerAndCreateNextHandler(server);
```

**Key Points — Apollo Server**

- Keep server in Node runtime unless edge-compatible packages used.
- Disable playground in production.

---

### Code Generation

**Beginner Level:** GraphQL Code Generator creates TypeScript types and hooks from `.graphql` files.

**Intermediate Level:** CI fails when schema drifts from client documents.

**Expert Level:** Use persisted operations + codegen for allowed operation IDs in mobile clients.

**Key Points — Code Generation**

- Types eliminate stringly-typed field access mistakes.
- Commit generated artifacts or regenerate in CI—pick one strategy.

---

### urql

**Beginner Level:** Lightweight alternative to Apollo for simple dashboards.

**Intermediate Level:** Exchanges customize caching and auth.

**Expert Level:** Combine with Wonka streams for advanced control—great for teams preferring functional pipelines.

**Key Points — urql**

- Smaller bundle than Apollo for many apps.
- Ecosystem differs—verify needed features.

---

## 26.7 Content Management Systems (CMS)

### Headless CMS

**Beginner Level:** Editors use a CMS UI; your Next.js site fetches JSON via API—great for marketing blogs.

**Intermediate Level:** Preview mode renders drafts with secure tokens.

**Expert Level:** Webhook-triggered revalidation (`revalidateTag`) keeps CDN pages fresh without full rebuilds.

**Key Points — Headless CMS**

- Separates content from presentation.
- Plan localization and asset pipelines early.

---

### Contentful

**Beginner Level:** Model content types; fetch entries by slug for articles.

**Intermediate Level:** Use GraphQL or REST SDK with typed responses via codegen.

**Expert Level:** Compose environments (master/preview) and RBAC for enterprise marketing teams.

**Key Points — Contentful**

- Mature APIs and UI.
- Watch API rate limits during large builds.

---

### Sanity

**Beginner Level:** Structured content with real-time studio; GROQ queries power landing pages.

**Intermediate Level:** Portable Text renders rich blog bodies in React.

**Expert Level:** Custom input components for merchandising bundles in e-commerce stacks.

**Key Points — Sanity**

- Developer-friendly modeling.
- GROQ learning curve for complex joins.

---

### Strapi

**Beginner Level:** Self-hosted Node CMS with admin panel—popular for indie SaaS marketing sites.

**Intermediate Level:** Extend with plugins; secure admin route.

**Expert Level:** Horizontal scaling with Postgres; file uploads to S3; backup strategy for self-hosted content.

**Key Points — Strapi**

- Full control vs managed SaaS overhead.
- You operate patches and uptime.

---

### Prismic

**Beginner Level:** Slice Machine encourages reusable page sections—nice for storytelling brands.

**Intermediate Level:** TypeScript integration via `@prismicio/client`.

**Expert Level:** Schedule releases for campaign launches; integrate with edge caching for global promos.

**Key Points — Prismic**

- Strong editorial UX for marketing.
- Understand slice modeling vs free-form page builders.

---

### WordPress Headless

**Beginner Level:** Use WP as editorial backend; Next.js as frontend via REST or WPGraphQL.

**Intermediate Level:** Secure application passwords or OAuth for server fetches.

**Expert Level:** Offload media to CDN; block direct WP theme access in production; harden WP instance with managed hosting.

**Key Points — WordPress Headless**

- Leverage vast plugin ecosystem carefully—security implications.
- Cache aggressively; WP can be slow under load.

---

## 26.8 Monorepo Setup

### Turborepo

**Beginner Level:** One repo houses `apps/web` (Next) and `packages/ui`—Turborepo orchestrates builds.

**Intermediate Level:** Remote caching speeds CI for large teams.

**Expert Level:** Pipeline tasks with input globs; `turbo prune` for Docker slim installs.

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "lint": {},
    "test": { "dependsOn": ["^build"] }
  }
}
```

**Key Points — Turborepo**

- Great DX for JS/TS monorepos.
- Define task boundaries clearly.

---

### Nx

**Beginner Level:** Nx adds generators, dependency graph, and affected commands.

**Intermediate Level:** Module boundary rules prevent UI importing server-only code wrongly.

**Expert Level:** Distributed task execution across CI workers for huge graphs.

**Key Points — Nx**

- Strong for enterprises needing governance.
- Heavier setup than Turborepo-only workflows.

---

### pnpm Workspaces

**Beginner Level:** `pnpm-workspace.yaml` lists packages; symlinks save disk.

**Intermediate Level:** `workspace:*` protocol pins internal deps.

**Expert Level:** Strict `node-linker` strategies for deterministic Docker builds.

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Key Points — pnpm Workspaces**

- Fast installs; great for monorepos.
- Educate contributors on `pnpm` commands.

---

### Sharing Code

**Beginner Level:** Shared `Button` component in `packages/ui` imported by marketing and dashboard apps.

**Intermediate Level:** Share Zod schemas for API contracts between Next and worker services.

**Expert Level:** Publish private packages to registry or use git submodules sparingly—prefer workspace packages.

**Key Points — Sharing Code**

- Enforce package boundaries with lint rules.
- Version internal packages intentionally.

---

## 26.9 Custom Server

### Custom Express

**Beginner Level:** You can mount Next behind Express for legacy APIs living in one process.

**Intermediate Level:** `next({ dev })` handler passed to Express `app.all`.

**Expert Level:** Separate concerns—often better to run Next standalone and proxy to microservices.

```typescript
import express from "express";
import next from "next";

const port = Number(process.env.PORT ?? 3000);
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = express();
  server.get("/healthz", (_req, res) => res.status(200).send("ok"));
  server.all("*", (req, res) => handle(req, res));
  server.listen(port, () => console.log(`ready on ${port}`));
});
```

**Key Points — Custom Express**

- Adds operational complexity.
- You manage timeouts, body parsers, and security headers.

---

### server.js Entry

**Beginner Level:** `node server.js` starts Express + Next together.

**Intermediate Level:** Use `NODE_OPTIONS` for profiling in staging.

**Expert Level:** Container CMD points to `server.js`; health checks hit `/healthz`.

**Key Points — server.js**

- Document startup sequence for platform teams.
- Keep Next upgrade path in mind—test after each bump.

---

### When to Use

**Beginner Level:** Rare for greenfield—Next 13+ App Router covers most needs.

**Intermediate Level:** Use when integrating WebSockets/Socket.io in same process or bridging legacy middleware.

**Expert Level:** Prefer separate services if availability/scaling profiles diverge (e.g., Next static + dedicated real-time).

**Key Points — When to Use**

- Default to standard Next server.
- Custom server is a maintenance commitment.

---

### Custom Server Limitations

**Beginner Level:** Some platforms optimize only standard Next start—custom servers may lose features.

**Intermediate Level:** ISR, image optimization, and edge integrations may need extra care.

**Expert Level:** Observability splits across Express + Next—unified tracing IDs become mandatory.

**Key Points — Custom Server Limitations**

- Harder to deploy to serverless-only environments.
- Performance tuning is now your responsibility end-to-end.

---

## Cross-cutting Case Studies

### E-commerce: Real-time Inventory + CMS Merch

Combine Strapi for merchandising, SSE or Pusher for low-stock badges, and strict CSP on PDP templates. Type DTOs for product payloads shared between Next Server Components and mobile clients.

### Blog: Headless + Edge Auth for Preview

Use Sanity preview with signed cookies validated in edge middleware, Node route for webhook revalidation, and `revalidateTag` per article slug.

### SaaS Dashboard: GraphQL + Monorepo

Nx or Turborepo shares `packages/graphql` documents + codegen types across Next and background workers processing analytics jobs.

### Social: Socket.io Service + BFF

Next handles SSR/SEO pages; separate Socket.io cluster handles chat; Next API routes issue short-lived channel tokens.

---

## Advanced Snippets (TypeScript)

```typescript
export type RateLimitBucket = { count: number; resetAt: number };

export function rateLimitHit(bucket: RateLimitBucket, limit: number, now = Date.now()): boolean {
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + 60_000;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
```

```typescript
export function assertSameOrigin(req: Request, allowed: string[]) {
  const origin = req.headers.get("origin");
  if (origin && !allowed.includes(origin)) {
    throw new Error("invalid_origin");
  }
}
```

```typescript
export type CmsWebhookBody = {
  type: "entry.publish";
  slug: string;
  locale: string;
};

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  // Implement HMAC compare (use timing-safe comparison in real code)
  return signature.length > 0 && secret.length > 0 && rawBody.length > 0;
}
```

---

## Production Checklists and Patterns

### Edge Rollout Checklist (SaaS Dashboard)

**Beginner Level:** Start with read-only endpoints that only aggregate public HTTPS APIs.

**Intermediate Level:** Add structured logs with `requestId`, region, and tenant id (hashed) for support escalations.

**Expert Level:** Canary middleware changes per region; automatic rollback when error rates spike; synthetic probes from multiple PoPs.

```typescript
export type EdgeProbeResult = { region: string; ok: boolean; latencyMs: number };

export function summarizeProbes(results: EdgeProbeResult[]): { healthy: boolean } {
  const failed = results.filter((r) => !r.ok).length;
  return { healthy: failed === 0 };
}
```

---

### RSC Data Boundary Pattern (E-commerce)

**Beginner Level:** Fetch product details in a Server Component; pass plain fields to `<AddToCartButton sku={sku} priceCents={priceCents} />`.

**Intermediate Level:** Never pass ORM entities with circular relations across the boundary.

**Expert Level:** Version DTOs (`ProductCardV2`) to coordinate with mobile clients sharing the same BFF.

```typescript
export type ProductCardDTO = {
  sku: string;
  title: string;
  priceCents: number;
  currency: "USD" | "EUR";
  imageUrl: string;
};
```

---

### Security Review Prompts Before Launch (Social App)

**Beginner Level:** Confirm cookies are `Secure` and `HttpOnly` where appropriate.

**Intermediate Level:** Validate Content Security Policy in staging with real third-party domains.

**Expert Level:** Pen-test direct messages and media upload flows; verify signed URL TTLs; ensure report-abuse endpoints are rate limited.

---

### GraphQL N+1 Guard (Typed DataLoader Sketch)

**Beginner Level:** N+1 means one query per list item—slow for feeds.

**Intermediate Level:** Batch load users by id in a DataLoader per request context.

**Expert Level:** Add metrics on batch sizes; cap depth and complexity; trace slow resolvers.

```typescript
type User = { id: string; handle: string };

export class UserLoader {
  constructor(private readonly fetchByIds: (ids: string[]) => Promise<User[]>) {}
  private cache = new Map<string, Promise<User | undefined>>();

  load(id: string) {
    let p = this.cache.get(id);
    if (!p) {
      p = this.fetchByIds([id]).then((rows) => rows[0]);
      this.cache.set(id, p);
    }
    return p;
  }
}
```

---

### CMS Revalidation Handler (Route Handler)

**Beginner Level:** Accept webhook POST from CMS; call `revalidateTag` for the changed slug.

**Intermediate Level:** Verify signature header before revalidating to stop spoofed purge storms.

**Expert Level:** Debounce bursts, log publish events, and alert when repeated failures indicate bad credentials.

```typescript
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-signature") ?? "";
  const ok = verifyWebhookSignature(raw, sig, process.env.CMS_WEBHOOK_SECRET ?? "");
  if (!ok) return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  const body = JSON.parse(raw) as { slug: string };
  revalidateTag(`post:${body.slug}`);
  return NextResponse.json({ revalidated: true });
}
```

---

### Monorepo Import Boundaries (Nx-style Mental Model)

**Beginner Level:** `apps/*` may import `packages/ui`; reverse is forbidden.

**Intermediate Level:** Enforce with ESLint `import/no-restricted-paths`.

**Expert Level:** Codify architecture tests that parse dependency graph weekly and fail on drift.

---

### Custom Server Observability

**Beginner Level:** Log one line per HTTP request with status and duration.

**Intermediate Level:** Propagate `x-trace-id` from edge to origin through proxies.

**Expert Level:** OpenTelemetry spans around Express middleware + Next handler; sample in production to control cost.

---

### Real-time Fan-out Cost Controls (Pusher/Ably)

**Beginner Level:** Limit message size (e.g., 4KB) for chat events.

**Intermediate Level:** Channel naming conventions per tenant `private-tenant-123`.

**Expert Level:** Autoscale workers based on connection counts; kill idle connections gently during deploys.

---

### WordPress Headless Hardening Checklist

**Beginner Level:** Disable unused WP REST routes via plugins if possible.

**Intermediate Level:** Put WP admin behind VPN or IP allowlist for enterprise marketing teams.

**Expert Level:** Separate DB credentials per environment; automated security patching on managed WP hosts.

---

### Kubernetes + Next Standalone Pitfalls

**Beginner Level:** Set `PORT` from environment; bind `0.0.0.0`.

**Intermediate Level:** Liveness vs readiness: readiness waits for DB migrations completion job.

**Expert Level:** Pod resource requests/limits based on measured RSS after load tests; HPA on RPS and CPU.

```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

### Advanced Topics Reading Order

**Beginner Level:** Read Security → Deployment docs → then Edge overview.

**Intermediate Level:** Deep dive RSC → caching → real-time transports.

**Expert Level:** Combine observability + monorepo governance + threat modeling in quarterly architecture reviews.

---

## Key Points (Chapter Summary)

- Edge excels at low-latency guards; Node excels at full ecosystem access—choose per route.
- PPR and Suspense enable static shells with dynamic holes when experimental flags fit your release process.
- RSC requires careful serialization and minimal client boundaries.
- Security combines CSP, CSRF defenses, XSS discipline, SQL parameterization, and secret hygiene.
- Real-time features usually live in Client Components plus dedicated services (Socket.io, Pusher, SSE).
- GraphQL shines with schema governance, codegen, and server protections against abusive queries.
- Headless CMS options trade self-hosting vs managed UX; all pair well with `revalidateTag` patterns.
- Monorepos (Turborepo/Nx/pnpm) scale teams when boundaries are enforced.
- Custom servers are powerful but increase ops burden—default to standard Next unless blocked.

---

## Best Practices

1. **Document runtime choices** (edge vs node) in your architecture decision records.
2. **Test security headers** with Mozilla Observatory and automated CI checks.
3. **Centralize DTO mappers** at server/client boundaries for RSC apps.
4. **Rate limit** auth and expensive GraphQL operations.
5. **Use managed real-time** when reliability beats cost optimization early on.
6. **Codegen GraphQL** types to prevent drift between client and server.
7. **Webhook secrets** for CMS revalidation endpoints—verify HMAC signatures.
8. **Monorepo lint rules** to prevent illegal imports across layers.
9. **Avoid custom servers** unless integration requirements are explicit and long-lived.
10. **Monitor experimental features** closely—pin versions and read changelogs.

---

## Common Mistakes to Avoid

1. **Running DB-heavy logic on the edge** and hitting timeouts or missing drivers.
2. **Giant client bundles** by marking large trees `"use client"` unnecessarily.
3. **CSP nonces** cached in HTML at CDN incorrectly—breaks scripts or weakens security.
4. **Storing secrets** in `NEXT_PUBLIC_*` variables.
5. **Trusting GraphQL depth** without limits—easy DoS vector.
6. **Opening public WebSockets** without authentication—spam and abuse follow.
7. **CMS preview endpoints** without auth—content leaks pre-release.
8. **Monorepo anarchy**—no boundaries, everything imports everything.
9. **Custom Express** without proper security middleware (helmet, body limits).
10. **Ignoring platform limits** for SSE/WebSockets behind corporate proxies.

---
