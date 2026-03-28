# Next.js Rendering Strategies — Topics 12.1–12.7

Rendering decides **when** and **where** HTML and data are produced. Next.js blends static generation, server rendering, streaming, and client hydration. This guide maps each strategy to real products: **e‑commerce** catalogs, **blogs**, **SaaS dashboards**, **social** feeds, and **marketing** sites—with TypeScript-first examples.

## 📑 Table of Contents

- [12.1 Rendering Overview](#121-rendering-overview)
  - [12.1.1 Static rendering](#1211-static-rendering)
  - [12.1.2 Dynamic rendering](#1212-dynamic-rendering)
  - [12.1.3 Streaming](#1213-streaming)
  - [12.1.4 Edge rendering](#1214-edge-rendering)
  - [12.1.5 Hybrid rendering](#1215-hybrid-rendering)
- [12.2 Static Site Generation (SSG)](#122-static-site-generation-ssg)
  - [12.2.1 Concept](#1221-concept)
  - [12.2.2 Build-time generation](#1222-build-time-generation)
  - [12.2.3 When to use SSG](#1223-when-to-use-ssg)
  - [12.2.4 Performance](#1224-performance)
  - [12.2.5 Limitations](#1225-limitations)
- [12.3 Server-Side Rendering (SSR)](#123-server-side-rendering-ssr)
  - [12.3.1 Concept](#1231-concept)
  - [12.3.2 Request-time rendering](#1232-request-time-rendering)
  - [12.3.3 When to use SSR](#1233-when-to-use-ssr)
  - [12.3.4 Performance trade-offs](#1234-performance-trade-offs)
  - [12.3.5 Caching with SSR](#1235-caching-with-ssr)
- [12.4 Incremental Static Regeneration (ISR)](#124-incremental-static-regeneration-isr)
  - [12.4.1 Concept](#1241-concept)
  - [12.4.2 Stale-while-revalidate](#1242-stale-while-revalidate)
  - [12.4.3 Background regeneration](#1243-background-regeneration)
  - [12.4.4 Benefits](#1244-benefits)
  - [12.4.5 Configuration](#1245-configuration)
- [12.5 Client-Side Rendering (CSR)](#125-client-side-rendering-csr)
  - [12.5.1 CSR in Next.js](#1251-csr-in-nextjs)
  - [12.5.2 `useEffect` fetching](#1252-useeffect-fetching)
  - [12.5.3 When to use CSR](#1253-when-to-use-csr)
  - [12.5.4 Trade-offs](#1254-trade-offs)
- [12.6 Edge Rendering](#126-edge-rendering)
  - [12.6.1 Edge Runtime](#1261-edge-runtime)
  - [12.6.2 Edge Middleware](#1262-edge-middleware)
  - [12.6.3 Edge functions / routes](#1263-edge-functions--routes)
  - [12.6.4 Use cases](#1264-use-cases)
  - [12.6.5 Limitations](#1265-limitations)
- [12.7 Choosing a Rendering Strategy](#127-choosing-a-rendering-strategy)
  - [12.7.1 Static vs dynamic decision](#1271-static-vs-dynamic-decision)
  - [12.7.2 Performance](#1272-performance)
  - [12.7.3 SEO](#1273-seo)
  - [12.7.4 Data freshness](#1274-data-freshness)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices (End of Guide)](#best-practices-end-of-guide)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 12.1 Rendering Overview

### 12.1.1 Static rendering

**Beginner Level**  
**Static** pages are prepared **ahead of time**—like printing a **blog** post once and serving copies to everyone. Fast and cheap to host.

**Intermediate Level**  
In the **App Router**, a Server Component is static by default if it does not opt into dynamic APIs (`cookies()`, `headers()`, `searchParams` in some cases, `noStore`, etc.). Static HTML and RSC payload can be cached on a CDN.

**Expert Level**  
Static rendering composes with **Partial Prerendering (PPR)** and **fetch caching** (`cache: 'force-cache'`, `next: { revalidate }`). For **e‑commerce** category trees that rarely change, static + ISR at the SKU level is common.

```tsx
// app/products/page.tsx — static-friendly Server Component
type Product = { id: string; title: string; priceCents: number };

async function getFeatured(): Promise<Product[]> {
  const res = await fetch("https://api.example.com/products/featured", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to load products");
  return (await res.json()) as Product[];
}

export default async function FeaturedPage(): Promise<JSX.Element> {
  const products = await getFeatured();
  return (
    <main>
      <h1>Featured</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.title} — ${(p.priceCents / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

#### Key Points — 12.1.1

- Default posture in App Router: **static** when possible.
- Static does not mean “no data”—it means **cached data fetch** at build/revalidate time.

---

### 12.1.2 Dynamic rendering

**Beginner Level**  
**Dynamic** means the page is tailored **per request**—like a **dashboard** greeting: “Hello, Alex.”

**Intermediate Level**  
Calling `cookies()`, `headers()`, or `connection()` (unstable) or using `unstable_noStore()` / `fetch(..., { cache: 'no-store' })` forces **dynamic** rendering for that route segment.

**Expert Level**  
Dynamic segments still benefit from **streaming** and **suspense**. For **SaaS**, isolate dynamic boundaries with nested layouts so marketing shells stay static.

```tsx
// app/dashboard/page.tsx — dynamic via cookies (App Router)
import { cookies } from "next/headers";

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = cookies().get("session")?.value ?? "guest";
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Session: {session}</p>
    </main>
  );
}
```

#### Key Points — 12.1.2

- Dynamic is powerful but costs **TTFB** vs fully static.
- Push dynamism to the **smallest subtree** possible.

---

### 12.1.3 Streaming

**Beginner Level**  
**Streaming** sends the page in **chunks**—users see the header fast while slower parts load, like a **social** feed skeleton filling in.

**Intermediate Level**  
Use `<Suspense fallback={...}>` around async Server Components or slow `fetch` trees. Next.js flushes early HTML/RSC chunks.

**Expert Level**  
Combine with **loading.tsx** files for route segments. Watch **waterfalls**: parallelize fetches with `Promise.all`. For **e‑commerce** PDPs, stream reviews separately from core product data.

```tsx
// app/feed/page.tsx
import { Suspense } from "react";

async function Timeline(): Promise<JSX.Element> {
  await new Promise((r) => setTimeout(r, 800)); // simulate slow API
  const items = [{ id: "1", text: "Hello world" }];
  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>{i.text}</li>
      ))}
    </ul>
  );
}

export default function FeedPage(): JSX.Element {
  return (
    <main>
      <h1>Feed</h1>
      <Suspense fallback={<p>Loading timeline…</p>}>
        <Timeline />
      </Suspense>
    </main>
  );
}
```

#### Key Points — 12.1.3

- Streaming improves **perceived performance**.
- Always provide meaningful **fallback UI** (accessibility).

---

### 12.1.4 Edge rendering

**Beginner Level**  
**Edge** runs code **close to users**—fast first byte for simple responses.

**Intermediate Level**  
Route handlers and middleware can use `export const runtime = 'edge'`. Not all Node APIs exist.

**Expert Level**  
Use edge for **geo personalization** headers, auth gates, or lightweight transforms. Heavy ORM workloads belong on **Node** runtime regions.

```typescript
// app/api/ping/route.ts
export const runtime = "edge";

export function GET(): Response {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
}
```

#### Key Points — 12.1.4

- Edge optimizes **latency**, not heavy compute.
- Validate library compatibility before switching runtime.

---

### 12.1.5 Hybrid rendering

**Beginner Level**  
A **hybrid** page mixes static shell + dynamic islands—like a **store** with static nav and live cart count.

**Intermediate Level**  
Pattern: static/layout Server Components + **client components** for interactivity + **dynamic** subtrees for personalized data.

**Expert Level**  
**PPR** (when enabled) serves static shell while dynamic holes stream. For **blogs**, static article + dynamic comments is classic hybrid.

```tsx
// app/layout.tsx — simplified hybrid shell
import type { ReactNode } from "react";
import { CartBadge } from "./CartBadge"; // "use client"

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>…</nav>
          <CartBadge />
        </header>
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/CartBadge.tsx
"use client";

import { useEffect, useState } from "react";

export function CartBadge(): JSX.Element {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    void fetch("/api/cart/count")
      .then((r) => r.json() as Promise<{ count: number }>)
      .then((d) => setCount(d.count))
      .catch(() => setCount(0));
  }, []);
  return <span aria-label="Cart items">{count}</span>;
}
```

#### Key Points — 12.1.5

- Hybrid maximizes **cacheability** where personalization is narrow.
- Keep client bundles small; prefer server data when possible.

---

## 12.2 Static Site Generation (SSG)

### 12.2.1 Concept

**Beginner Level**  
**SSG** builds pages at **deploy time** (or revalidation time) so visitors get precomputed HTML.

**Intermediate Level**  
In App Router, static is the absence of per-request dynamic signals. `generateStaticParams` enumerates **dynamic route** instances for SSG.

**Expert Level**  
For **marketing** sites with thousands of pages, SSG + CDN is the cost-performance sweet spot. Combine with **content** layer (CMS) webhooks to revalidate.

```tsx
// app/blog/[slug]/page.tsx
type Post = { slug: string; title: string; html: string };

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const res = await fetch("https://cms.example.com/posts?fields=slug");
  const posts = (await res.json()) as { slug: string }[];
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}): Promise<JSX.Element> {
  const res = await fetch(`https://cms.example.com/posts/${params.slug}`, {
    next: { revalidate: 86400 },
  });
  const post = (await res.json()) as Post;
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
```

#### Key Points — 12.2.1

- SSG is ideal for **read-mostly** content.
- `generateStaticParams` connects dynamic routes to static builds.

---

### 12.2.2 Build-time generation

**Beginner Level**  
When you run `next build`, Next computes static pages and stores them for deployment.

**Intermediate Level**  
Data fetched during build with default `fetch` caching becomes part of the static artifact until revalidated (ISR) or rebuilt.

**Expert Level**  
Watch **build duration** for huge param sets; use **ISR** or on-demand revalidation. For **e‑commerce**, prebuild top SKUs, lazily ISR long tail.

```tsx
// Build-time static param chunking pattern (conceptual types)
export async function generateStaticParams(): Promise<{ sku: string }[]> {
  const top: string[] = await fetch("https://api.shop.example/top-skus", {
    cache: "force-cache",
  }).then((r) => r.json() as Promise<string[]>);

  return top.map((sku) => ({ sku }));
}
```

#### Key Points — 12.2.2

- Build-time work scales with **param cardinality**.
- Use reporting (`next build` output) to find slow static pages.

---

### 12.2.3 When to use SSG

**Beginner Level**  
Use SSG for pages that **rarely change**: **blog** posts, docs, landing pages.

**Intermediate Level**  
Use when SEO needs full HTML immediately and personalization is unnecessary.

**Expert Level**  
Avoid SSG for **authorization-sensitive** pages unless output is identical for all users. Use SSR or client gating instead.

#### Key Points — 12.2.3

- SSG + CDN = excellent **global** performance.
- Pair with **ISR** when content updates on a schedule.

---

### 12.2.4 Performance

**Beginner Level**  
Static pages load fast because the server work is already done.

**Intermediate Level**  
TTFB approaches CDN edge latency. LCP improves with static HTML + optimized images/fonts.

**Expert Level**  
Measure **RSC payload** size; static does not eliminate JS for client islands. For **dashboards**, static shells with small client bundles win.

#### Key Points — 12.2.4

- Static helps **LCP** and **TTFB** on edge.
- Still optimize images (`next/image`) and fonts (`next/font`).

---

### 12.2.5 Limitations

**Beginner Level**  
You cannot show **per-user** stock or cart in pure static HTML without client code.

**Intermediate Level**  
Stale content between rebuilds unless ISR/on-demand revalidation is configured.

**Expert Level**  
**Globally distributed** static may complicate **A/B** tests and cookie-varying HTML—use middleware or client strategies carefully.

#### Key Points — 12.2.5

- Static is wrong tool for **highly personalized** primary HTML.
- Plan **revalidation** when content freshness matters.

---

## 12.3 Server-Side Rendering (SSR)

### 12.3.1 Concept

**Beginner Level**  
**SSR** builds the page on the **server** when someone asks—fresh HTML each visit (unless cached).

**Intermediate Level**  
App Router SSR is implicit when routes use dynamic APIs or `no-store` fetching. HTML and RSC stream to the client.

**Expert Level**  
SSR integrates with **React cache()** and **request memoization** for deduping fetches within a single request.

```tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function LiveStatsPage(): Promise<JSX.Element> {
  noStore();
  const stats = await fetch("https://api.example.com/stats/live", {
    cache: "no-store",
  }).then((r) => r.json() as Promise<{ usersOnline: number }>);

  return (
    <main>
      <h1>Live</h1>
      <p>Users online: {stats.usersOnline}</p>
    </main>
  );
}
```

#### Key Points — 12.3.1

- SSR gives **fresh** HTML for crawlers and users.
- Combine with **suspense** to avoid all-or-nothing waits.

---

### 12.3.2 Request-time rendering

**Beginner Level**  
Each request may run your server component code again—like printing a custom **invoice** every time.

**Intermediate Level**  
Request-time work includes DB queries, auth checks, and personalized assembly.

**Expert Level**  
Protect against **N+1** queries; use dataloaders or batched APIs. For **SaaS**, tenant id from subdomain drives SSR queries.

```tsx
import { headers } from "next/headers";

type Row = { id: string; amount: number };

export default async function InvoicesPage(): Promise<JSX.Element> {
  const orgId = headers().get("x-org-id") ?? "";
  const res = await fetch(`https://api.example.com/orgs/${orgId}/invoices`, {
    cache: "no-store",
  });
  const rows = (await res.json()) as Row[];
  return (
    <table>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>{r.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

#### Key Points — 12.3.2

- Request scope = place for **user-specific** data.
- Add observability (timings, traces) around SSR handlers.

---

### 12.3.3 When to use SSR

**Beginner Level**  
Use SSR when data **changes often** or is **private**.

**Intermediate Level**  
Examples: **dashboard** home, account settings, authenticated feeds.

**Expert Level**  
Prefer **edge SSR** only when compute fits constraints; otherwise Node region close to DB.

#### Key Points — 12.3.3

- SSR balances **freshness** vs **cost**.
- Do not SSR entire app if only a widget needs live data.

---

### 12.3.4 Performance trade-offs

**Beginner Level**  
SSR is slower than static because the server works on **every** request.

**Intermediate Level**  
Mitigate with **caching** (short TTL), **parallel fetches**, and **streaming**.

**Expert Level**  
For **social** timelines, SSR first screen + infinite scroll CSR for older items is a common split.

#### Key Points — 12.3.4

- Watch **p95** latency, not averages.
- Database proximity matters more than micro-optimizations in JSX.

---

### 12.3.5 Caching with SSR

**Beginner Level**  
Even SSR routes can cache **pieces**—like a shared footer fragment.

**Intermediate Level**  
Use `fetch` with `next: { revalidate: N }` where safe, or `cache()` for dedupe. Use `noStore()` to opt out.

**Expert Level**  
**CDN caching** of SSR HTML is tricky with cookies; often use **private** caches or cache only anonymous segments.

```tsx
import { cache } from "react";

type NavItem = { href: string; label: string };

const getNav = cache(async (): Promise<NavItem[]> => {
  const res = await fetch("https://cms.example.com/nav", {
    next: { revalidate: 600 },
  });
  return (await res.json()) as NavItem[];
});

export default async function Shell({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const nav = await getNav();
  return (
    <div>
      <nav>
        {nav.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}
```

#### Key Points — 12.3.5

- `cache()` dedupes within one request.
- Be explicit about **shared vs user-specific** data when caching SSR.

---

## 12.4 Incremental Static Regeneration (ISR)

### 12.4.1 Concept

**Beginner Level**  
**ISR** serves **cached** pages like static, then **updates** them in the background after a timer.

**Intermediate Level**  
In App Router, `fetch(url, { next: { revalidate: seconds } })` marks data as revalidatable; pages using it become ISR candidates.

**Expert Level**  
**On-demand revalidation** (`revalidatePath`, `revalidateTag`) pairs with CMS webhooks for **e‑commerce** price updates.

```tsx
// Segment using time-based revalidation
export default async function SalePage(): Promise<JSX.Element> {
  const res = await fetch("https://api.example.com/promos/active", {
    next: { revalidate: 60 },
  });
  const promo = (await res.json()) as { title: string };
  return (
    <main>
      <h1>{promo.title}</h1>
    </main>
  );
}
```

#### Key Points — 12.4.1

- ISR merges **static speed** with **controlled freshness**.
- Understand provider semantics for **distributed** caches.

---

### 12.4.2 Stale-while-revalidate

**Beginner Level**  
Visitors often get the **old** page instantly while Next refreshes a **new** copy behind the scenes.

**Intermediate Level**  
First request after expiry triggers background regeneration; stale served meanwhile.

**Expert Level**  
Tune `revalidate` vs **business** tolerance—**financial** data may need shorter windows or SSR.

#### Key Points — 12.4.2

- Classic **CDN SWR** mental model.
- Document staleness for stakeholders (support, legal).

---

### 12.4.3 Background regeneration

**Beginner Level**  
The **next** visitor might trigger rebuild work without blocking the current one.

**Intermediate Level**  
Regeneration failures keep serving last good version until success.

**Expert Level**  
Monitor **revalidation errors**; alert when stale exceeds SLA. For **blogs**, webhook + `revalidateTag('posts')` is more deterministic than long TTL alone.

```typescript
// app/api/revalidate/route.ts (protect in production!)
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag("posts");
  return NextResponse.json({ ok: true });
}
```

#### Key Points — 12.4.3

- Secure on-demand endpoints.
- Tags create **coarse** cache bust groups.

---

### 12.4.4 Benefits

**Beginner Level**  
Fast like static, fresher than pure SSG.

**Intermediate Level**  
Scales on CDN for **read-heavy** workloads.

**Expert Level**  
Combine with **edge** caching and **tagged** invalidation for multi-tenant **SaaS** marketing sites.

#### Key Points — 12.4.4

- ISR is a **sweet spot** for CMS-driven sites.
- Pair with observability to validate TTL choices.

---

### 12.4.5 Configuration

**Beginner Level**  
Set `revalidate` in `fetch` options.

**Intermediate Level**  
`export const revalidate = N` at layout/page level sets segment defaults (App Router).

**Expert Level**  
Align with `dynamic` exports from Pages Router migrations; avoid conflicting cache directives in nested layouts.

```tsx
export const revalidate = 120; // seconds

export default async function Page(): Promise<JSX.Element> {
  return <main>ISR segment default</main>;
}
```

#### Key Points — 12.4.5

- Segment-level `revalidate` applies to the **whole** subtree unless overridden.
- Prefer **tags** for precise invalidation of shared fetches.

---

## 12.5 Client-Side Rendering (CSR)

### 12.5.1 CSR in Next.js

**Beginner Level**  
**CSR** means the browser downloads JS and **fetches data in the client**—like a **SPA** dashboard widget.

**Intermediate Level**  
Mark components with `"use client"`; they hydrate in the browser. Parent server components can pass serializable props.

**Expert Level**  
Minimize client boundaries; use **React Query/SWR** patterns for cache and dedupe on the client for interactive **social** apps.

```tsx
"use client";

import { useMemo, useState } from "react";

type Tab = "foryou" | "following";

export function FeedTabs(): JSX.Element {
  const [tab, setTab] = useState<Tab>("foryou");
  const label = useMemo(() => (tab === "foryou" ? "For you" : "Following"), [tab]);
  return (
    <div>
      <button type="button" onClick={() => setTab("foryou")}>
        For you
      </button>
      <button type="button" onClick={() => setTab("following")}>
        Following
      </button>
      <p>Active: {label}</p>
    </div>
  );
}
```

#### Key Points — 12.5.1

- CSR enables **rich interactivity**.
- Every client component adds to **bundle** size.

---

### 12.5.2 `useEffect` fetching

**Beginner Level**  
Run `fetch` after the component **mounts**—user sees a loading state first.

**Intermediate Level**  
Handle `AbortController` for strict mode double-mount in dev. Type JSON responses.

**Expert Level**  
Prefer **server-first** fetch for SEO-critical data; reserve `useEffect` for user-gated or highly interactive data.

```tsx
"use client";

import { useEffect, useState } from "react";

type Profile = { handle: string; bio: string };

export function ProfileCard({ userId }: { userId: string }): JSX.Element {
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void fetch(`/api/users/${userId}`, { signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed");
        return (await r.json()) as Profile;
      })
      .then(setData)
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setError("Could not load");
      });
    return () => ac.abort();
  }, [userId]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading…</p>;
  return (
    <section>
      <h2>@{data.handle}</h2>
      <p>{data.bio}</p>
    </section>
  );
}
```

#### Key Points — 12.5.2

- `useEffect` fetch is **not** ideal for SEO-critical content.
- Clean up with **abort** to avoid races.

---

### 12.5.3 When to use CSR

**Beginner Level**  
Use for **buttons**, **modals**, charts that need browser APIs.

**Intermediate Level**  
Use when data depends on **client-only** state (scroll position, localStorage).

**Expert Level**  
Use for **post-load** enhancements on otherwise static pages (e.g., recommendations).

#### Key Points — 12.5.3

- CSR shines for **interaction**, not first meaningful paint of primary content.

---

### 12.5.4 Trade-offs

**Beginner Level**  
Slower **first view** if important content waits for JS.

**Intermediate Level**  
SEO suffers if crawlers do not execute JS (less common now, still risky for latency).

**Expert Level**  
**Waterfalls** (layout JS → component mount → fetch) hurt; prefetch with **link** or server seeding.

#### Key Points — 12.5.4

- Measure **TBT** and **LCP** when adding client data fetching.
- Prefer **SSR/SSG** for marketing and product SEO pages.

---

## 12.6 Edge Rendering

### 12.6.1 Edge Runtime

**Beginner Level**  
A **small** JavaScript environment running near users—great for quick responses.

**Intermediate Level**  
Activate with `export const runtime = 'edge'` on routes or compatible functions.

**Expert Level**  
Evaluate **cold start**, **CPU limits**, and **library** support before moving SSR to edge.

#### Key Points — 12.6.1

- Edge ≠ faster for **DB-heavy** workloads far from edge DB.

---

### 12.6.2 Edge Middleware

**Beginner Level**  
Middleware always runs at the **edge** to inspect requests early.

**Intermediate Level**  
Use for redirects, A/B, geo headers—covered in Topic 11 notes.

**Expert Level**  
Keep middleware **thin**; complex auth validation may belong in Node server routes.

#### Key Points — 12.6.2

- Middleware is **edge-native** in modern Next.js.

---

### 12.6.3 Edge functions / routes

**Beginner Level**  
API routes marked `edge` respond without full Node.

**Intermediate Level**  
Good for **OAuth** lightweight callbacks or **image** resizing via external service orchestration.

**Expert Level**  
For **SaaS** multi-tenant, edge handlers can normalize host → tenant before proxying.

```typescript
export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  return new Response(JSON.stringify({ youSent: q }), {
    headers: { "content-type": "application/json" },
  });
}
```

#### Key Points — 12.6.3

- Great for **I/O light** handlers.
- Watch **response size** limits on platforms.

---

### 12.6.4 Use cases

**Beginner Level**  
Personalize **headers** based on country.

**Intermediate Level**  
**Feature flags** at edge for marketing pages.

**Expert Level**  
**A/B** assignment + **CSP** nonces (advanced) coordinated with SSR.

#### Key Points — 12.6.4

- Edge augments **latency-sensitive** paths.

---

### 12.6.5 Limitations

**Beginner Level**  
Cannot use every **npm** package.

**Intermediate Level**  
Limited **filesystem** and **long** tasks.

**Expert Level**  
**Stateful** connections (some DB drivers) may be incompatible—use HTTP data APIs.

#### Key Points — 12.6.5

- Fall back to **Node runtime** for heavy lifting.

---

## 12.7 Choosing a Rendering Strategy

### 12.7.1 Static vs dynamic decision

**Beginner Level**  
If everyone sees the same **blog** HTML, go static. If each user sees different **orders**, go dynamic.

**Intermediate Level**  
Draw a **matrix**: public vs authenticated; stale vs fresh; SEO vs app shell.

**Expert Level**  
For **e‑commerce**: static/ISR for PLP/PDP content, SSR or CSR for cart/checkout where personalization and compliance matter.

```typescript
// Decision helper types (documentation-only)
type Audience = "public" | "authenticated";
type Freshness = "realtime" | "minutes" | "daily";

interface RoutePolicy {
  path: string;
  audience: Audience;
  freshness: Freshness;
  recommendation: "SSG" | "ISR" | "SSR" | "CSR+API";
}

const examples: RoutePolicy[] = [
  { path: "/blog/[slug]", audience: "public", freshness: "daily", recommendation: "ISR" },
  { path: "/dashboard", audience: "authenticated", freshness: "realtime", recommendation: "SSR" },
  { path: "/cart", audience: "authenticated", freshness: "realtime", recommendation: "CSR+API" },
];
```

#### Key Points — 12.7.1

- Start **static**, add dynamism surgically.
- Document policies per route for team alignment.

---

### 12.7.2 Performance

**Beginner Level**  
Static is fastest; dynamic costs more.

**Intermediate Level**  
Use streaming + parallel fetch to hide SSR latency.

**Expert Level**  
**Profile** RSC serialization; reduce props to client components; optimize DB.

#### Key Points — 12.7.2

- Measure **Core Web Vitals** per template, not sitewide averages.

---

### 12.7.3 SEO

**Beginner Level**  
Search engines like **HTML** with real text in the first response.

**Intermediate Level**  
SSR/SSG ensure titles/descriptions via Metadata API.

**Expert Level**  
Avoid making **primary** copy client-only. Use JSON-LD from server (see Topic 15 notes).

#### Key Points — 12.7.3

- SSR/SSG help **crawl budget** and **snippet** quality.

---

### 12.7.4 Data freshness

**Beginner Level**  
Choose how **stale** data can be for users.

**Intermediate Level**  
Map SLAs: **prices** (seconds?), **blog** (hours?), **legal** (manual).

**Expert Level**  
Use **on-demand** revalidation for editorial **SaaS** when posts publish.

#### Key Points — 12.7.4

- Freshness is a **product** decision, not only engineering.

---

## Key Points (Chapter Summary)

- Next.js **defaults to static** in App Router when no dynamic APIs are used.
- **SSR** and **`no-store` fetches** trade cost for **fresh, private** HTML.
- **ISR** delivers static performance with **time-based** or **tag-based** freshness.
- **CSR** powers interactivity but is a poor primary vehicle for SEO-critical text.
- **Edge** optimizes latency for **thin** logic; **Node** remains king for heavy data access.
- **Hybrid** architectures mix strategies per segment for best **UX** and **cost**.

## Best Practices (End of Guide)

- Prefer **Server Components** for data fetching; push `"use client"` to leaves.
- Use **`generateStaticParams`** for large static route sets; chunk or ISR the tail.
- Add **`Suspense` boundaries** around slow SSR segments to enable streaming.
- Parallelize independent fetches with **`Promise.all`** to avoid waterfalls.
- Use **`revalidate` + tags** instead of giant TTL guesses when CMS events exist.
- Keep **auth checks** on the server; do not rely on hidden client-only gates for sensitive data.
- Measure **per-route** rendering mode during `next build` and in production APM.
- Align **runtime** (`edge` vs `nodejs`) with library support and data locality.

## Common Mistakes to Avoid

- Marking entire trees as client components unnecessarily (**bundle bloat**).
- Using `useEffect` fetch for **SEO-critical** content that should be server-rendered.
- Assuming **static** means secure—never expose secrets in static HTML/JS.
- Ignoring **stale** ISR windows for **regulated** data (prices, compliance text).
- Creating **serial waterfalls** (`await` A then `await` B) when they are independent.
- Forcing **edge** runtime with incompatible database drivers.
- Mixing **`cache: 'no-store'`** everywhere “just to be safe,” killing performance.
- Omitting **loading states** when streaming, causing layout jumps and poor UX.
