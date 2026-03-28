# Data Fetching

A full map of **data fetching** in Next.js across **App Router** (`fetch`, Server Components, streaming) and **Pages Router** (`getServerSideProps`, `getStaticProps`, `getStaticPaths`, ISR), plus **client** libraries (SWR, TanStack Query) and **patterns** for production apps: **e-commerce**, **blogs**, **dashboards**, **SaaS**, and **social** products. All examples emphasize **TypeScript**.

---

## 📑 Table of Contents

- [8.1 Data Fetching Overview](#81-data-fetching-overview)
  - [8.1.1 Next.js Data Fetching Philosophy](#811-nextjs-data-fetching-philosophy)
  - [8.1.2 Server-side Data Fetching](#812-server-side-data-fetching)
  - [8.1.3 Client-side Data Fetching](#813-client-side-data-fetching)
  - [8.1.4 Static vs Dynamic Rendering](#814-static-vs-dynamic-rendering)
  - [8.1.5 Streaming](#815-streaming)
- [8.2 `fetch()` API (App Router)](#82-fetch-api-app-router)
  - [8.2.1 Extended `fetch()` in Next.js](#821-extended-fetch-in-nextjs)
  - [8.2.2 `fetch()` Caching](#822-fetch-caching)
  - [8.2.3 Cache: `'force-cache'` (Default)](#823-cache-force-cache-default)
  - [8.2.4 Cache: `'no-store'` (Dynamic)](#824-cache-no-store-dynamic)
  - [8.2.5 `next.revalidate` Option](#825-nextrevalidate-option)
  - [8.2.6 `next.tags` for Cache Tags](#826-nexttags-for-cache-tags)
- [8.3 `getServerSideProps` (Pages Router)](#83-getserversideprops-pages-router)
  - [8.3.1 `getServerSideProps` Basics](#831-getserversideprops-basics)
  - [8.3.2 Server-side Rendering (SSR)](#832-server-side-rendering-ssr)
  - [8.3.3 `context` Object](#833-context-object)
  - [8.3.4 `params`, `query`, `req`, `res`](#834-params-query-req-res)
  - [8.3.5 Returning `props`](#835-returning-props)
  - [8.3.6 `notFound: true`](#836-notfound-true)
  - [8.3.7 `redirect` Object](#837-redirect-object)
  - [8.3.8 When to Use SSR](#838-when-to-use-ssr)
- [8.4 `getStaticProps` (Pages Router)](#84-getstaticprops-pages-router)
  - [8.4.1 `getStaticProps` Basics](#841-getstaticprops-basics)
  - [8.4.2 Static Site Generation (SSG)](#842-static-site-generation-ssg)
  - [8.4.3 Build-time Data Fetching](#843-build-time-data-fetching)
  - [8.4.4 `context.params`](#844-contextparams)
  - [8.4.5 Returning `props`](#845-returning-props)
  - [8.4.6 `revalidate` (ISR)](#846-revalidate-isr)
  - [8.4.7 `notFound: true`](#847-notfound-true)
  - [8.4.8 `redirect` Object](#848-redirect-object)
- [8.5 `getStaticPaths` (Pages Router)](#85-getstaticpaths-pages-router)
  - [8.5.1 `getStaticPaths` Basics](#851-getstaticpaths-basics)
  - [8.5.2 Dynamic Route Generation](#852-dynamic-route-generation)
  - [8.5.3 `paths` Array](#853-paths-array)
  - [8.5.4 `fallback: false`](#854-fallback-false)
  - [8.5.5 `fallback: true`](#855-fallback-true)
  - [8.5.6 `fallback: 'blocking'`](#856-fallback-blocking)
  - [8.5.7 Use with `getStaticProps`](#857-use-with-getstaticprops)
- [8.6 Incremental Static Regeneration (ISR)](#86-incremental-static-regeneration-isr)
  - [8.6.1 ISR Concept](#861-isr-concept)
  - [8.6.2 `revalidate` in `getStaticProps`](#862-revalidate-in-getstaticprops)
  - [8.6.3 On-demand Revalidation](#863-on-demand-revalidation)
  - [8.6.4 `revalidatePath()` (App Router)](#864-revalidatepath-app-router)
  - [8.6.5 `revalidateTag()` (App Router)](#865-revalidatetag-app-router)
  - [8.6.6 ISR Use Cases](#866-isr-use-cases)
- [8.7 Client-side Data Fetching](#87-client-side-data-fetching)
  - [8.7.1 `useEffect` with `fetch()`](#871-useeffect-with-fetch)
  - [8.7.2 SWR Library](#872-swr-library)
    - [8.7.2.1 `useSWR` Hook](#8721-useswr-hook)
    - [8.7.2.2 SWR Configuration](#8722-swr-configuration)
    - [8.7.2.3 Revalidation Strategies](#8723-revalidation-strategies)
  - [8.7.3 React Query with Next.js](#873-react-query-with-nextjs)
    - [8.7.3.1 `QueryClientProvider` Setup](#8731-queryclientprovider-setup)
    - [8.7.3.2 `useQuery` in Next.js](#8732-usequery-in-nextjs)
    - [8.7.3.3 Prefetching on Server](#8733-prefetching-on-server)
  - [8.7.4 Client-side Mutations](#874-client-side-mutations)
- [8.8 Streaming and Suspense](#88-streaming-and-suspense)
  - [8.8.1 Streaming with Server Components](#881-streaming-with-server-components)
  - [8.8.2 React `Suspense`](#882-react-suspense)
  - [8.8.3 Suspense Boundaries](#883-suspense-boundaries)
  - [8.8.4 `loading.tsx` (Automatic Suspense)](#884-loadingtsx-automatic-suspense)
  - [8.8.5 Manual Suspense Usage](#885-manual-suspense-usage)
  - [8.8.6 Parallel Streaming](#886-parallel-streaming)
  - [8.8.7 Progressive Rendering](#887-progressive-rendering)
- [8.9 Data Fetching Patterns](#89-data-fetching-patterns)
  - [8.9.1 Parallel Data Fetching](#891-parallel-data-fetching)
  - [8.9.2 Sequential Data Fetching](#892-sequential-data-fetching)
  - [8.9.3 Preloading Data](#893-preloading-data)
  - [8.9.4 Blocking vs Non-blocking](#894-blocking-vs-non-blocking)
  - [8.9.5 Error Handling in Data Fetching](#895-error-handling-in-data-fetching)
  - [8.9.6 Loading States](#896-loading-states)
  - [8.9.7 Caching Strategies](#897-caching-strategies)
- [Topic 8 — Best Practices](#topic-8--best-practices)
- [Topic 8 — Common Mistakes to Avoid](#topic-8--common-mistakes-to-avoid)

---

## 8.1 Data Fetching Overview

### 8.1.1 Next.js Data Fetching Philosophy

**Beginner Level:** Next.js wants you to fetch data **close to where it is rendered**—often on the **server**—so pages load fast and SEO works (think **product catalog** HTML delivered ready to read).

**Intermediate Level:** You choose **when** data is fetched: at **build time** (SSG), **per request** (SSR), **on the client** (CSR), or hybrid (**ISR**, **streaming**). The framework provides caching hooks (`fetch` options, tags, revalidation APIs) to balance **freshness vs cost**.

**Expert Level:** Treat data fetching as a **cache invalidation problem** at scale: align **CDN edge caching**, **full route cache**, **data cache**, and **client caches** (SWR/React Query). Model **SLAs** (e.g., pricing fresh within 60s) explicitly in code and monitoring.

```typescript
// types/sla.ts — document freshness contracts for teams
export type FreshnessSla = {
  productCatalogSeconds: number;
  userDashboardSeconds: number;
};
```

#### Key Points — 8.1.1

- Server-first by default in App Router RSC.
- Explicitly choose static vs dynamic per route.

---

### 8.1.2 Server-side Data Fetching

**Beginner Level:** Data is loaded **before** or **while** HTML is sent—users see content sooner on slow phones for **blogs** and **shops**.

**Intermediate Level:** In App Router, **async Server Components** `await fetch()` or DB calls. In Pages Router, use `getServerSideProps` / `getStaticProps`.

**Expert Level:** Watch **TTFB** vs **TTI**: SSR shifts work to the server—protect with **caching**, **deduplication**, **DB indexes**, and **timeouts**. Use **streaming** to avoid all-or-nothing SSR.

```tsx
// app/shop/page.tsx (Server Component) — e-commerce listing shell
type Product = { id: string; name: string; priceCents: number };

export default async function ShopPage() {
  const res = await fetch("https://api.example.com/products?limit=24", {
    next: { revalidate: 120, tags: ["products:list"] },
  });
  const products = (await res.json()) as Product[];
  return (
    <section>
      <h1>Featured</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </section>
  );
}
```

#### Key Points — 8.1.2

- Secrets and SQL belong on the server.
- Combine with **partial prerendering** patterns as your stack matures.

---

### 8.1.3 Client-side Data Fetching

**Beginner Level:** Browser runs `fetch` after page loads—good for **personalized widgets** (notifications) that are not needed for SEO.

**Intermediate Level:** Use **`useEffect`** for simple cases; prefer **SWR/React Query** for caching, dedupe, retries, and mutations in **dashboards**.

**Expert Level:** Avoid **waterfalls**: prefetch on hover, use **parallel queries**, and **stale-while-revalidate** to keep UI snappy under load. Instrument **CLS** when client fetching replaces placeholders.

```tsx
"use client";

import { useEffect, useState } from "react";

type Notice = { id: string; text: string };

export function NotificationsBell() {
  const [items, setItems] = useState<Notice[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await fetch("/api/notifications");
      const data = (await r.json()) as Notice[];
      if (!cancelled) setItems(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  if (!items) return <span>…</span>;
  return <span>{items.length} new</span>;
}
```

#### Key Points — 8.1.3

- Great for **private** or **highly interactive** data.
- Pair with **skeletons** and **error boundaries** on the client.

---

### 8.1.4 Static vs Dynamic Rendering

**Beginner Level:** **Static** pages are prepared ahead of time (fast CDN). **Dynamic** pages change per visitor or time (personalized **SaaS** home).

**Intermediate Level:** App Router decides per route based on **dynamic APIs** used (`cookies()`, `headers()`, `no-store`, etc.). Pages Router uses **data functions** to pick SSG/SSR.

**Expert Level:** **Force static** where possible for **marketing** and **catalog** shells; isolate dynamic islands. Use **ISR** to get static speed with controlled freshness.

```tsx
// Explicitly dynamic route segment (App Router) — user-specific dashboard
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const session = cookies().get("session");
  if (!session) return <p>Please sign in</p>;
  return <p>SaaS metrics for {session.value}</p>;
}
```

#### Key Points — 8.1.4

- Dynamic rendering is powerful but more expensive.
- Audit **why** a route is dynamic (check Next build output).

---

### 8.1.5 Streaming

**Beginner Level:** Send **HTML in chunks**—users see header/nav immediately while slower sections load (like a **social** feed).

**Intermediate Level:** React **Suspense** + **RSC streaming** in App Router. `loading.tsx` provides instant fallback UI.

**Expert Level:** Tune **suspense boundaries** to match **SLAs**—do not stream tiny fragments excessively if it increases **layout shift**; coalesce meaningful units.

```tsx
import { Suspense } from "react";
import { SlowRecommendations } from "./SlowRecommendations";

export default function ProductPage() {
  return (
    <main>
      <h1>Product</h1>
      <Suspense fallback={<aside>Loading picks for you…</aside>}>
        <SlowRecommendations />
      </Suspense>
    </main>
  );
}
```

#### Key Points — 8.1.5

- Improves **perceived performance**.
- Pair with **skeleton** components matching final layout.

---

## 8.2 `fetch()` API (App Router)

### 8.2.1 Extended `fetch()` in Next.js

**Beginner Level:** In Server Components, `fetch` is **wrapped** by Next to support caching options like `next: { revalidate: 60 }`.

**Intermediate Level:** The extension is **not** the browser `fetch` polyfill—it is a **framework integration** that keys cache entries and participates in **static generation** when eligible.

**Expert Level:** Understand **deduplication** within a render pass and interaction with **`cache()`** helper for non-fetch IO. For **GraphQL**, consider POST caching implications—often use `unstable_cache` or tags carefully.

```tsx
export async function getPost(slug: string) {
  const res = await fetch(`https://cms.example.com/posts/${slug}`, {
    next: { tags: [`post:${slug}`] },
  });
  if (!res.ok) throw new Error("Failed to load post");
  return res.json() as Promise<{ title: string; html: string }>;
}
```

#### Key Points — 8.2.1

- Extended options live under **`next: { ... }`**.
- Same URL + options → deduped within a request where applicable.

---

### 8.2.2 `fetch()` Caching

**Beginner Level:** Cached responses avoid **re-hitting** APIs on every request—your **blog** reads from a cache after the first fetch.

**Intermediate Level:** Default in RSC is **`force-cache`** (static data where possible). Opt into **`no-store`** for always-fresh reads.

**Expert Level:** Debug with **`logging` flags** (per Next version docs) and by inspecting **response headers** from origins. Align **CDN cache-control** with Next data cache semantics to avoid **double caching** bugs.

```tsx
const res = await fetch("https://api.example.com/hero", {
  cache: "force-cache",
});
```

#### Key Points — 8.2.2

- Caching is **explicit** via `cache` / `next.revalidate` / tags.
- Third-party APIs may send `Cache-Control`—Next may respect depending on mode.

---

### 8.2.3 Cache: `'force-cache'` (Default)

**Beginner Level:** Reuse the saved response **as long as allowed**—great for **public marketing** content.

**Intermediate Level:** Works with **`revalidate`** windows for **time-based** freshness (ISR-like data cache).

**Expert Level:** For **e-commerce pricing**, ensure legal/compliance accepts staleness windows; trigger **on-demand revalidation** on price updates.

```tsx
await fetch("https://api.example.com/categories", { cache: "force-cache" });
```

#### Key Points — 8.2.3

- Default favors **performance**.
- Combine with **tags** for precise invalidation.

---

### 8.2.4 Cache: `'no-store'` (Dynamic)

**Beginner Level:** Always fetch **fresh**—use for **user-specific** dashboards.

**Intermediate Level:** Marks route handling as **dynamic** when used in Server Components (with other dynamic signals).

**Expert Level:** Watch **origin rate limits**—add **edge caching** of personalized fragments only when safe; prefer **segment static shells** + dynamic islands.

```tsx
await fetch("https://api.example.com/me/subscription", { cache: "no-store" });
```

#### Key Points — 8.2.4

- Disables data cache for that fetch.
- Essential for **auth** and **live** counters when required.

---

### 8.2.5 `next.revalidate` Option

**Beginner Level:** Re-fetch at most every **N seconds**—stale copy served while background refresh happens (ISR semantics for data).

**Intermediate Level:** Set per-fetch **SLA** for catalog sections differently from **footer** links.

**Expert Level:** Pair with **tag revalidation** for **instant** updates when editors publish—time-based as a safety net.

```tsx
await fetch("https://cms.example.com/homepage", {
  next: { revalidate: 300 },
});
```

#### Key Points — 8.2.5

- **Time-based** freshness for data cache.
- Not a substitute for **auth** or **access control**.

---

### 8.2.6 `next.tags` for Cache Tags

**Beginner Level:** Label cached entries (`products`, `post:123`) so you can **invalidate** them together.

**Intermediate Level:** Use **`revalidateTag('products')`** from Server Actions or Route Handlers after mutations.

**Expert Level:** Design **tag cardinality**—avoid unbounded unique tags per user; scope tags to **tenant** or **resource type** carefully in **multi-tenant SaaS**.

```tsx
await fetch("https://api.example.com/products/42", {
  next: { tags: ["products", "product:42"] },
});
```

```typescript
// app/api/revalidate/route.ts (sketch)
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, tag } = (await req.json()) as { token: string; tag: string };
  if (token !== process.env.REVALIDATE_TOKEN)
    return NextResponse.json({ ok: false }, { status: 401 });
  revalidateTag(tag);
  return NextResponse.json({ ok: true });
}
```

#### Key Points — 8.2.6

- Tags enable **on-demand** invalidation.
- Protect revalidation endpoints with **secrets**.

---

## 8.3 `getServerSideProps` (Pages Router)

### 8.3.1 `getServerSideProps` Basics

**Beginner Level:** `getServerSideProps` runs **on the server on every request** (unless configured otherwise in advanced hosting) to fetch data before rendering the page.

**Intermediate Level:** Export an `async function getServerSideProps(context)` returning `{ props: { ... } }` merged into your page component props.

**Expert Level:** **TTFB** sensitive—optimize DB queries, add **caching at the edge** selectively, and avoid serial waterfalls inside `getServerSideProps`.

```tsx
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";

type Props = { now: string };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return { props: { now: new Date().toISOString() } };
};

const TimePage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  now,
}) => <p>Server time: {now}</p>;

export default TimePage;
```

#### Key Points — 8.3.1

- Runs **per request** (SSR data).
- Cannot be used with `getInitialProps` on the same page in modern patterns—pick one.

---

### 8.3.2 Server-side Rendering (SSR)

**Beginner Level:** HTML is generated **when someone visits**—great when content changes often or is **personalized**.

**Intermediate Level:** Contrast with SSG: SSR costs more CPU/latency but is always fresh (modulo caching layers you add).

**Expert Level:** For **dashboards**, SSR critical **above-the-fold** metrics; defer charts to client or streaming equivalents when migrating to App Router.

```tsx
export const getServerSideProps: GetServerSideProps<{ user: string }> = async (
  ctx
) => {
  const user = ctx.req.headers["x-user-name"];
  return { props: { user: String(user ?? "guest") } };
};
```

#### Key Points — 8.3.2

- Ideal for **auth-gated** views.
- Cache carefully—SSR does not mean “no caching.”

---

### 8.3.3 `context` Object

**Beginner Level:** `context` carries **request info** and routing params for your data function.

**Intermediate Level:** Includes `params`, `query`, `req`, `res`, `preview`, `locale`, etc., depending on features enabled.

**Expert Level:** **Do not** treat `context` as fully typed without narrowing—write small parsers with **zod** for `query` and `params`.

```typescript
import type { GetServerSidePropsContext } from "next";

export async function parseContextParams(ctx: GetServerSidePropsContext) {
  const id = ctx.params?.id;
  return typeof id === "string" ? id : null;
}
```

#### Key Points — 8.3.3

- Centralize parsing helpers.
- `preview` mode affects CMS behavior—test drafts.

---

### 8.3.4 `params`, `query`, `req`, `res`

**Beginner Level:** `params` = dynamic route segments; `query` = URL search params; `req`/`res` = Node HTTP objects.

**Intermediate Level:** Use `req` headers/cookies for **auth** in SSR. Avoid sending huge props to React—**trim** to view-model shapes.

**Expert Level:** Respect **`res`** lifecycle—setting headers after send throws; use **NextResponse** patterns only in App Router. For **sessions**, prefer encrypted cookies and **rotation**.

```tsx
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = ctx.req.cookies.session;
  if (!token) return { redirect: { destination: "/login", permanent: false } };
  const cart = await fetch("https://api.example.com/cart", {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  return { props: { cart } };
};
```

#### Key Points — 8.3.4

- `req`/`res` are **low-level**—validate inputs.
- Keep props **serializable** (JSON-like).

---

### 8.3.5 Returning `props`

**Beginner Level:** `return { props: { foo: 'bar' } }` becomes your page props.

**Intermediate Level:** Props must be **JSON-serializable**—no `Date` objects unless you rehydrate carefully (generally pass ISO strings).

**Expert Level:** Map DB rows to **DTOs** explicitly—avoid leaking internal fields (PII) to the client bundle via props.

```tsx
import type { GetServerSideProps } from "next";

type UserDto = { id: string; displayName: string };

export const getServerSideProps: GetServerSideProps<{ user: UserDto }> =
  async () => {
    const row = { id: "u_1", displayName: "Ada", email: "ada@example.com" };
    const user: UserDto = { id: row.id, displayName: row.displayName };
    return { props: { user } };
  };
```

#### Key Points — 8.3.5

- Shape props for the **view**, not the **database**.
- Dates as **strings**.

---

### 8.3.6 `notFound: true`

**Beginner Level:** Return `{ notFound: true }` to render the **404 page** for missing resources (deleted **blog** post).

**Intermediate Level:** Prefer this over throwing for **expected** absence to keep logs clean.

**Expert Level:** Pair with **CDN** behaviors—some hosts cache 404s; set appropriate **`Cache-Control`** via `res` if needed (advanced).

```tsx
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== "string") return { notFound: true };
  const ok = await fetch(`https://api.example.com/items/${id}`).then((r) => r.ok);
  if (!ok) return { notFound: true };
  return { props: { id } };
};
```

#### Key Points — 8.3.6

- Clear UX for missing entities.
- Distinguish **403** vs **404** when authorization matters.

---

### 8.3.7 `redirect` Object

**Beginner Level:** Send users elsewhere: `{ redirect: { destination: '/login', permanent: false } }`.

**Intermediate Level:** `permanent: true` uses **308**—good for stable URL moves at SSR time.

**Expert Level:** Avoid **open redirects**—validate `destination` against an allowlist when using query param targets.

```tsx
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const nextPath = ctx.query.next;
  const safe =
    typeof nextPath === "string" && nextPath.startsWith("/app")
      ? nextPath
      : "/app";
  if (!ctx.req.cookies.session) {
    return { redirect: { destination: `/login?next=${encodeURIComponent(safe)}`, permanent: false } };
  }
  return { props: {} };
};
```

#### Key Points — 8.3.7

- Server-side redirect before render.
- Validate **next** URLs.

---

### 8.3.8 When to Use SSR

**Beginner Level:** Use when data **must be fresh** per visit or **user-specific**.

**Intermediate Level:** Examples: **account pages**, **admin** tools, **stock** that changes minute-by-minute (if CDN caching inappropriate).

**Expert Level:** Re-evaluate with **ISR**, **edge personalization**, or **client fetching** for non-SEO fragments—SSR everything is a common scaling bottleneck.

```typescript
// decision matrix (documentation pattern)
export type PageKind = "marketing" | "catalog" | "account";

export function defaultStrategy(kind: PageKind) {
  switch (kind) {
    case "marketing":
      return "SSG/ISR";
    case "catalog":
      return "ISR + on-demand";
    case "account":
      return "SSR or RSC dynamic";
  }
}
```

#### Key Points — 8.3.8

- SSR is a **tool**, not the default for all routes.
- Measure **p95 latency** before expanding SSR surface.

---

## 8.4 `getStaticProps` (Pages Router)

### 8.4.1 `getStaticProps` Basics

**Beginner Level:** Runs at **build time** (and on ISR revalidation) to fetch data for a page.

**Intermediate Level:** Page HTML is **precomputed**—great for **blogs** and **docs**.

**Expert Level:** Watch **build duration** for huge path counts—partition builds or move to **ISR** with small `paths` + `fallback`.

```tsx
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";

export const getStaticProps: GetStaticProps<{ title: string }> = async () => {
  return { props: { title: "Hello SSG" } };
};

const Page: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  title,
}) => <h1>{title}</h1>;

export default Page;
```

#### Key Points — 8.4.1

- No `req` per visitor—do not rely on cookies inside `getStaticProps` for unique user pages.
- Combine with **`getStaticPaths`** for dynamic SSG routes.

---

### 8.4.2 Static Site Generation (SSG)

**Beginner Level:** Pages are **HTML files** generated ahead—super fast from CDN.

**Intermediate Level:** Good when content changes on a **schedule** or via **webhooks** (ISR), not every second.

**Expert Level:** For **e-commerce**, SSG category shells + client hydration for cart state is a classic pattern.

```tsx
export async function getStaticProps() {
  const categories = await fetch("https://api.example.com/categories").then((r) =>
    r.json()
  );
  return { props: { categories }, revalidate: 600 };
}
```

#### Key Points — 8.4.2

- Excellent **SEO** and **LCP** when done right.
- Needs a **plan** for updates (ISR/revalidate).

---

### 8.4.3 Build-time Data Fetching

**Beginner Level:** When you run `next build`, Next calls `getStaticProps` for each path.

**Intermediate Level:** External APIs must be **available** during CI builds—use fixtures or **mock** for PR previews.

**Expert Level:** Add **retries** and **timeouts** around CMS fetches in build scripts; fail the build on **schema drift** with zod.

```typescript
import { z } from "zod";

const HomepageSchema = z.object({ heroTitle: z.string() });

export async function loadHomepage() {
  const json: unknown = await fetch("https://cms.example.com/homepage").then((r) =>
    r.json()
  );
  return HomepageSchema.parse(json);
}
```

#### Key Points — 8.4.3

- CI reliability matters.
- Validate **CMS payloads** at build time.

---

### 8.4.4 `context.params`

**Beginner Level:** For dynamic SSG pages, `context.params` holds `{ slug: 'hello' }` style values.

**Intermediate Level:** Undefined for non-dynamic pages—narrow types.

**Expert Level:** For **large blogs**, generate params from a **manifest** file produced by CMS export to speed builds.

```tsx
import type { GetStaticProps } from "next";

type Params = { slug: string };

export const getStaticProps: GetStaticProps<
  { post: { title: string } },
  Params
> = async (ctx) => {
  const slug = ctx.params?.slug;
  if (!slug) return { notFound: true };
  const post = await fetch(`https://cms.example.com/posts/${slug}`).then((r) =>
    r.json()
  );
  return { props: { post }, revalidate: 120 };
};
```

#### Key Points — 8.4.4

- Always guard missing params.
- Align param names with file segments.

---

### 8.4.5 Returning `props`

**Beginner Level:** Same serialization rules as SSR props.

**Intermediate Level:** Large props **increase HTML payload**—trim fields used above the fold; lazy load the rest client-side if needed.

**Expert Level:** For **social** posts, consider storing **engagement counts** separately with shorter revalidate to reduce full rebuild churn.

```tsx
export async function getStaticProps() {
  return {
    props: {
      post: { id: "1", title: "RSC tips", body: "<p>...</p>" },
    },
    revalidate: 60,
  };
}
```

#### Key Points — 8.4.5

- Mind **HTML size** limits on platforms.
- Split **volatile** metrics when needed.

---

### 8.4.6 `revalidate` (ISR)

**Beginner Level:** Number of seconds before Next may **regenerate** the page in the background after a request.

**Intermediate Level:** First visitor after window may still see stale page briefly—**stale-while-revalidate**.

**Expert Level:** Combine with **webhooks** calling `res.revalidate` (Pages) or `revalidatePath` (App) for **instant** updates on publish.

```tsx
export async function getStaticProps() {
  return {
    props: { items: [] },
    revalidate: 30,
  };
}
```

#### Key Points — 8.4.6

- ISR bridges **static** and **fresh**.
- Tune per **content type**.

---

### 8.4.7 `notFound: true`

**Beginner Level:** At build/revalidate time, mark missing entities as 404.

**Intermediate Level:** Use when CMS returns **gone** content.

**Expert Level:** Ensure **sitemap** jobs remove dead URLs to avoid soft-404 SEO issues.

```tsx
export const getStaticProps: GetStaticProps = async () => {
  const exists = false;
  if (!exists) return { notFound: true };
  return { props: {} };
};
```

#### Key Points — 8.4.7

- Works in SSG/ISR flows.
- Pair with **redirects** for renamed slugs.

---

### 8.4.8 `redirect` Object

**Beginner Level:** Redirect during data generation when content **moved**.

**Intermediate Level:** Useful for **legacy slug** maps from an old **blog**.

**Expert Level:** Prefer **permanent** redirects for SEO consolidation; log **redirect chains** to detect loops.

```tsx
import type { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async () => {
  return {
    redirect: { destination: "/blog/new-home", permanent: true },
  };
};
```

#### Key Points — 8.4.8

- Prefer **config redirects** for static known rules when possible.
- Use GSSP/GSP redirects for **data-driven** rules.

---

## 8.5 `getStaticPaths` (Pages Router)

### 8.5.1 `getStaticPaths` Basics

**Beginner Level:** Tells Next which **dynamic URLs** to pre-render at build (or via ISR fallback strategies).

**Intermediate Level:** Export `getStaticPaths` alongside `getStaticProps` for `[id].tsx` style routes.

**Expert Level:** Optimize **build fan-out**—pre-render top traffic paths; use `fallback` for long tail.

```tsx
import type { GetStaticPaths } from "next";

type Params = { slug: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => ({
  paths: [{ params: { slug: "hello-world" } }],
  fallback: "blocking",
});
```

#### Key Points — 8.5.1

- Only for **dynamic SSG** pages.
- Works hand-in-hand with `getStaticProps`.

---

### 8.5.2 Dynamic Route Generation

**Beginner Level:** Build a list of `{ params }` from your CMS for **blog posts**.

**Intermediate Level:** For **e-commerce**, fetch product IDs from a search index or DB export.

**Expert Level:** Consider **incremental builds** in CI (split by locale) and **differential** path lists between preview and production.

```tsx
export async function getStaticPaths() {
  const slugs: string[] = await fetch("https://cms.example.com/slugs").then((r) =>
    r.json()
  );
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
}
```

#### Key Points — 8.5.2

- Paths must match **dynamic segment names**.
- Watch **API rate limits** during build.

---

### 8.5.3 `paths` Array

**Beginner Level:** The explicit list of routes to **prebuild**.

**Intermediate Level:** Empty `paths` + `fallback: true/blocking` can still serve dynamic routes on demand.

**Expert Level:** For **dashboards** that should not be SSG, do not use `getStaticPaths`—use SSR or App Router dynamic rendering instead.

```tsx
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}
```

#### Key Points — 8.5.3

- `paths` can be partial.
- Combine with analytics to pick **top N** paths.

---

### 8.5.4 `fallback: false`

**Beginner Level:** Unknown paths → **404** immediately.

**Intermediate Level:** Best when **all** paths known at build and small cardinality.

**Expert Level:** Risky for large or **ever-growing** catalogs—users hit 404 until rebuild.

```tsx
export async function getStaticPaths() {
  return { paths: [{ params: { id: "1" } }], fallback: false };
}
```

#### Key Points — 8.5.4

- Strict static set.
- Great for **finite** marketing sites.

---

### 8.5.5 `fallback: true`

**Beginner Level:** Unknown paths show a **fallback page** first, then hydrate when data arrives (older UX pattern).

**Intermediate Level:** Can cause **SEO** concerns if fallback shell is thin—use carefully.

**Expert Level:** Prefer **`blocking`** for many apps to avoid flash of loading state on first visit.

```tsx
export async function getStaticPaths() {
  return { paths: [{ params: { id: "1" } }], fallback: true };
}
```

#### Key Points — 8.5.5

- Legacy behavior still documented for older apps.
- Evaluate **`blocking`** first for new work.

---

### 8.5.6 `fallback: 'blocking'`

**Beginner Level:** First request to unknown path **waits** for HTML generation—no premature client 404.

**Intermediate Level:** Behaves like SSR for first hit, then **caches** for CDN.

**Expert Level:** Protect origin with **timeouts** and **circuit breakers**—blocking can pile up under attack.

```tsx
export async function getStaticPaths() {
  return { paths: [{ params: { id: "1" } }], fallback: "blocking" };
}
```

#### Key Points — 8.5.6

- Preferred for **long-tail** SSG.
- Monitor **cold path** latency.

---

### 8.5.7 Use with `getStaticProps`

**Beginner Level:** `getStaticPaths` chooses **which** pages; `getStaticProps` loads **data** for each.

**Intermediate Level:** `params` in `getStaticProps` aligns with `paths`.

**Expert Level:** Share **fetch helpers** between preview mode and production builds to avoid drift.

```tsx
import type { GetStaticPaths, GetStaticProps } from "next";

type Params = { id: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => ({
  paths: [{ params: { id: "42" } }],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<{ sku: string }, Params> = async ({
  params,
}) => {
  const id = params?.id;
  if (!id) return { notFound: true };
  return { props: { sku: id }, revalidate: 60 };
};
```

#### Key Points — 8.5.7

- Mandatory pairing for dynamic SSG.
- Test **preview** and **production** CMS outputs.

---

## 8.6 Incremental Static Regeneration (ISR)

### 8.6.1 ISR Concept

**Beginner Level:** Keep static speed but **refresh** pages on a timer or when told—like updating **sale prices** every few minutes.

**Intermediate Level:** Stale page served, regeneration happens **in background** (conceptually “stale-while-revalidate”).

**Expert Level:** Understand platform nuances (multi-instance **deduplication**, **distributed** caches)—test on your host.

```typescript
// mental model
export type ISR = {
  staleWindowSeconds: number;
  onDemand: boolean;
};
```

#### Key Points — 8.6.1

- ISR is **not** real-time by default.
- Pair with **on-demand** for editorial workflows.

---

### 8.6.2 `revalidate` in `getStaticProps`

**Beginner Level:** Export `revalidate: 60` with props to enable ISR for that page.

**Intermediate Level:** Different routes can have different windows—**homepage** vs **product** vs **legal**.

**Expert Level:** Very low `revalidate` approximates SSR cost—profile before tightening.

```tsx
export async function getStaticProps() {
  return { props: { ok: true }, revalidate: 45 };
}
```

#### Key Points — 8.6.2

- Pages Router ISR flag.
- Works with **`fallback`** strategies.

---

### 8.6.3 On-demand Revalidation

**Beginner Level:** Instead of waiting for timer, your server hits a **secret URL** to refresh a page when CMS publishes.

**Intermediate Level:** Pages Router uses **`res.revalidate(revalidateURL)`** API in Route Handlers (or legacy ` unstable_revalidate` patterns depending on version—follow current docs).

**Expert Level:** Secure tokens, **idempotent** handlers, and **audit logs** for who triggered revalidation in **enterprise** setups.

```typescript
// app/api/revalidate-path/route.ts (App Router example)
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.REVALIDATE_TOKEN}`)
    return NextResponse.json({ ok: false }, { status: 401 });
  revalidatePath("/blog");
  return NextResponse.json({ ok: true });
}
```

#### Key Points — 8.6.3

- Editorial **instant** updates.
- Never expose tokens publicly.

---

### 8.6.4 `revalidatePath()` (App Router)

**Beginner Level:** Invalidates **route cache** for a path (and layout variants depending on Next version/options).

**Intermediate Level:** Call from **Server Actions** after mutations (e.g., create post).

**Expert Level:** Choose **`page` vs `layout`** type option (per docs) to limit invalidation blast radius in large **SaaS** apps.

```typescript
import { revalidatePath } from "next/cache";

export async function createPostAction() {
  "use server";
  // await db.insert(...)
  revalidatePath("/blog");
}
```

#### Key Points — 8.6.4

- Path-based **cache busting**.
- Use after **successful** mutations.

---

### 8.6.5 `revalidateTag()` (App Router)

**Beginner Level:** Invalidate everything tagged with e.g. **`posts`**.

**Intermediate Level:** Matches `fetch` `next.tags`.

**Expert Level:** Design tags to avoid **thundering herds**—stagger invalidations or debounce CMS webhooks.

```typescript
import { revalidateTag } from "next/cache";

export async function refreshPosts() {
  "use server";
  revalidateTag("posts");
}
```

#### Key Points — 8.6.5

- Great for **entity** granular updates.
- Combine with **tag per resource** patterns.

---

### 8.6.6 ISR Use Cases

**Beginner Level:** **E-commerce** listings, **blog**, **help center**—content changes sometimes, not every millisecond.

**Intermediate Level:** **Dashboards** usually need SSR/dynamic—not classic ISR—unless data is anonymized aggregates.

**Expert Level:** **Social** feeds are typically **dynamic** or **client-driven**; ISR for **profile shells** + client for timelines.

```typescript
export const isrExamples = {
  ecommercePLP: "revalidate 60–300s + on-demand for merchandising",
  blog: "on-demand on publish + long revalidate fallback",
  docs: "long revalidate + webhook",
} as const;
```

#### Key Points — 8.6.6

- ISR shines for **public**, **cacheable** content.
- Not for **per-user** sensitive data.

---

## 8.7 Client-side Data Fetching

### 8.7.1 `useEffect` with `fetch()`

**Beginner Level:** After mount, call `fetch` and `setState`—works for **simple widgets**.

**Intermediate Level:** Add **abort controllers** to cancel in-flight requests on dependency change/unmount.

**Expert Level:** Prefer **SWR/React Query** for dedupe, retries, and cache—raw `useEffect` does not scale across components.

```tsx
"use client";

import { useEffect, useState } from "react";

type Metric = { dau: number };

export function DauPill() {
  const [data, setData] = useState<Metric | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const r = await fetch("/api/metrics/dau", { signal: ac.signal });
        if (!r.ok) throw new Error(String(r.status));
        setData((await r.json()) as Metric);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("failed");
      }
    })();
    return () => ac.abort();
  }, []);

  if (error) return <span>Offline</span>;
  if (!data) return <span>…</span>;
  return <span>DAU {data.dau.toLocaleString()}</span>;
}
```

#### Key Points — 8.7.1

- Handle **race conditions** and **cleanup**.
- Not ideal for **shared server state** across many components.

---

### 8.7.2 SWR Library

#### 8.7.2.1 `useSWR` Hook

**Beginner Level:** `useSWR(key, fetcher)` gives **data**, **error**, and **isLoading** with caching.

**Intermediate Level:** Keys should be **stable strings**—include params (`['/api/user', userId]`).

**Expert Level:** Use **middleware** for auth token injection, logging, and **error normalization**.

```tsx
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("bad response");
  return r.json() as Promise<{ handle: string }>;
});

export function ProfileHandle({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(`/api/users/${userId}`, fetcher);
  if (isLoading) return <span>…</span>;
  if (error) return <span>Unavailable</span>;
  return <span>@{data.handle}</span>;
}
```

#### Key Points — 8.7.2.1

- Declarative data hook for **client caches**.
- Keys drive **identity** of cached entries.

---

#### 8.7.2.2 SWR Configuration

**Beginner Level:** Wrap app in **`SWRConfig`** to set default **`refreshInterval`**, **`dedupingInterval`**, **`revalidateOnFocus`**.

**Intermediate Level:** For **dashboards**, tune focus revalidation vs battery/network concerns on mobile.

**Expert Level:** Provide **`compare`** function for structural sharing and **`fallbackData`** from SSR prefetched JSON.

```tsx
"use client";

import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 2000,
        revalidateOnFocus: false,
        refreshInterval: 60_000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

#### Key Points — 8.7.2.2

- Centralize defaults in **`SWRConfig`**.
- Disable **focus** revalidation for chatty APIs.

---

#### 8.7.2.3 Revalidation Strategies

**Beginner Level:** Call **`mutate()`** after posting a new **social** comment to refresh the feed key.

**Intermediate Level:** Use **`revalidateIfStale`** options and **polling** for near-real-time metrics.

**Expert Level:** Pair **Server Actions** + **`mutate`** optimistic updates with **rollback** on failure.

```tsx
"use client";

import useSWR, { mutate } from "swr";

export function useFeed() {
  const swr = useSWR("/api/feed", (u) => fetch(u).then((r) => r.json()));
  return {
    ...swr,
    prependOptimistic: (item: { id: string; text: string }) => {
      mutate(
        "/api/feed",
        (cur: { id: string; text: string }[] | undefined) => [item, ...(cur ?? [])],
        false
      );
    },
  };
}
```

#### Key Points — 8.7.2.3

- **`mutate`** is the heart of client coherence.
- Optimistic UI needs **error handling**.

---

### 8.7.3 React Query with Next.js

#### 8.7.3.1 `QueryClientProvider` Setup

**Beginner Level:** Create a **`QueryClient`** and wrap the tree—enables **`useQuery`** everywhere under it.

**Intermediate Level:** Use **`defaultOptions`** for **`staleTime`** to reduce refetch churn on **SaaS** tables.

**Expert Level:** In SSR/hydration flows, use **`HydrationBoundary`** / **`dehydrate`** patterns (see 8.7.3.3).

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

#### Key Points — 8.7.3.1

- One client per **browser session** (create in `useState` lazy init).
- Tune **staleTime** per data volatility.

---

#### 8.7.3.2 `useQuery` in Next.js

**Beginner Level:** `useQuery({ queryKey, queryFn })` fetches and caches **orders** lists in **e-commerce** account pages.

**Intermediate Level:** Use **`enabled`** to wait for router params or auth readiness.

**Expert Level:** Split **infinite queries** for feeds with **`useInfiniteQuery`** and **cursor** APIs.

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

type Order = { id: string; totalCents: number };

export function OrdersList() {
  const q = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const r = await fetch("/api/orders");
      if (!r.ok) throw new Error("orders");
      return r.json() as Promise<Order[]>;
    },
  });
  if (q.isPending) return <p>Loading…</p>;
  if (q.isError) return <p>Failed</p>;
  return (
    <ul>
      {q.data.map((o) => (
        <li key={o.id}>{(o.totalCents / 100).toFixed(2)}</li>
      ))}
    </ul>
  );
}
```

#### Key Points — 8.7.3.2

- **`queryKey`** must include **all** variables affecting data.
- Surface **error** states with UX affordances.

---

#### 8.7.3.3 Prefetching on Server

**Beginner Level:** Fetch data on the server, dehydrate, and hydrate React Query so the client **skips spinners**.

**Intermediate Level:** In App Router, prefetch in **`page.tsx`** (server) with **`QueryClient`**, `prefetchQuery`, then pass dehydrated state to a client subtree.

**Expert Level:** Align **HTTP cache** headers from your API with **staleTime** to prevent **double fetches** on hydration mismatches.

```tsx
// app/dashboard/page.tsx (sketch)
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["kpis"],
    queryFn: () => fetch("https://api.example.com/kpis").then((r) => r.json()),
  });
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
```

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function DashboardClient() {
  const q = useQuery({
    queryKey: ["kpis"],
    queryFn: () => fetch("/api/kpis").then((r) => r.json()),
  });
  return <pre>{JSON.stringify(q.data, null, 2)}</pre>;
}
```

#### Key Points — 8.7.3.3

- SSR prefetch improves **first paint** quality.
- Ensure **`queryFn` URLs** match server vs client (absolute vs relative).

---

### 8.7.4 Client-side Mutations

**Beginner Level:** POST from the browser when a user **updates profile** or **likes** a post.

**Intermediate Level:** Use **SWR `mutate`** or **React Query `useMutation`** with **`onSuccess` invalidation**.

**Expert Level:** Implement **optimistic updates**, **idempotency keys** for payments, and **concurrency** control for collaborative **dashboard** edits.

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRenameProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const r = await fetch(`/api/projects/${input.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: input.name }),
      });
      if (!r.ok) throw new Error("rename failed");
      return r.json() as Promise<{ id: string; name: string }>;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

#### Key Points — 8.7.4

- Mutations should **invalidate** or **update** caches explicitly.
- Surface **pending** and **error** states in UI.

---

## 8.8 Streaming and Suspense

### 8.8.1 Streaming with Server Components

**Beginner Level:** The server can **stream HTML** as components resolve—users see the **header** of a **product** page before recommendations arrive.

**Intermediate Level:** Works with **React Suspense** boundaries in the RSC tree.

**Expert Level:** Measure **TTFB vs FCP vs LCP** trade-offs; too many boundaries can fragment **compression** efficiency—balance **meaningful** chunks.

```tsx
import { Suspense } from "react";

async function Recommendations({ productId }: { productId: string }) {
  const items = await fetch(`https://api.example.com/reco/${productId}`).then((r) =>
    r.json()
  );
  return <aside>{items.map((x: { id: string }) => x.id).join(", ")}</aside>;
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main>
      <h1>Product {params.id}</h1>
      <Suspense fallback={<aside>Loading picks…</aside>}>
        <Recommendations productId={params.id} />
      </Suspense>
    </main>
  );
}
```

#### Key Points — 8.8.1

- Streaming improves **perceived** performance.
- Keep fallbacks **layout-stable**.

---

### 8.8.2 React `Suspense`

**Beginner Level:** Wrap slow components with `<Suspense fallback={...}>`.

**Intermediate Level:** **Data fetching** in Server Components `await` triggers suspense boundaries when combined with streaming.

**Expert Level:** Client Suspense differs—**data** usually suspends via libraries (React Query experimental suspense) or **lazy** imports.

```tsx
import { Suspense, lazy } from "react";

const HeavyChart = lazy(() => import("./HeavyChart"));

export function Dashboard() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded bg-neutral-200" />}>
      <HeavyChart />
    </Suspense>
  );
}
```

#### Key Points — 8.8.2

- Suspense is for **async UI** orchestration.
- Provide **accessible** loading text where appropriate.

---

### 8.8.3 Suspense Boundaries

**Beginner Level:** Each boundary **isolates** loading—one slow widget does not block the entire **dashboard**.

**Intermediate Level:** Place boundaries at **component ownership** lines (team boundaries).

**Expert Level:** Avoid **over-nesting** that increases **waterfalls** if child boundaries wait sequentially—use **parallel** fetches at parent when possible.

```tsx
export function ParallelBlocks() {
  return (
    <>
      <Suspense fallback={<p>A…</p>}>
        <BlockA />
      </Suspense>
      <Suspense fallback={<p>B…</p>}>
        <BlockB />
      </Suspense>
    </>
  );
}

async function BlockA() {
  await new Promise((r) => setTimeout(r, 200));
  return <p>A done</p>;
}
async function BlockB() {
  await new Promise((r) => setTimeout(r, 200));
  return <p>B done</p>;
}
```

#### Key Points — 8.8.3

- Boundaries define **SLA surfaces**.
- Parallelize **independent** async work.

---

### 8.8.4 `loading.tsx` (Automatic Suspense)

**Beginner Level:** App Router: `loading.tsx` shows **instant** UI while a route segment loads.

**Intermediate Level:** Equivalent to wrapping segment `page` in Suspense with your fallback.

**Expert Level:** Customize per **nested** segment for **SaaS** settings areas—avoid huge spinners; prefer **skeletons** mirroring tables.

```tsx
// app/(app)/settings/loading.tsx
export default function Loading() {
  return <div className="animate-pulse space-y-3 p-6">Loading settings…</div>;
}
```

#### Key Points — 8.8.4

- File convention—zero wiring.
- Keep lightweight for **instant** feedback.

---

### 8.8.5 Manual Suspense Usage

**Beginner Level:** You choose exactly **where** suspense happens in shared layouts.

**Intermediate Level:** Combine with **error boundaries** (`error.tsx`) for fault isolation.

**Expert Level:** For **A/B** tests, ensure suspense fallbacks do not **flash** incorrectly—gate on deterministic server flags.

```tsx
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

async function MaybeSlow() {
  noStore();
  return <p>Dynamic bit</p>;
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading dynamic…</p>}>
      <MaybeSlow />
    </Suspense>
  );
}
```

#### Key Points — 8.8.5

- Manual control for **library** components.
- Pair **`noStore`** when dynamic data must not be statically cached.

---

### 8.8.6 Parallel Streaming

**Beginner Level:** Multiple suspense regions **stream independently**.

**Intermediate Level:** Great for **e-commerce** pages: product info, reviews, recommendations as separate streams.

**Expert Level:** Watch **ordering** semantics in HTML for accessibility—**headings** should still make sense as pieces arrive.

```tsx
export default function ProductLayout(props: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">{props.children}</div>
      <Suspense fallback={<aside>Reviews loading…</aside>}>
        <ReviewsRail />
      </Suspense>
    </div>
  );
}

async function ReviewsRail() {
  await new Promise((r) => setTimeout(r, 50));
  return <aside>Reviews here</aside>;
}
```

#### Key Points — 8.8.6

- Parallel streams reduce **time to interactive** chunks.
- Mind **layout shift** in side rails.

---

### 8.8.7 Progressive Rendering

**Beginner Level:** Show **critical content first**, enhance with **secondary** modules.

**Intermediate Level:** **Skeleton → content** transitions should preserve **CLS** budgets.

**Expert Level:** For **social timelines**, interleave **sponsored** slots with streamed organic items using **consistent heights** placeholders.

```tsx
export function ProgressiveProfile() {
  return (
    <main>
      <h1>@handle</h1>
      <Suspense fallback={<div className="h-40 w-full bg-neutral-100" />}>
        <Bio />
      </Suspense>
      <Suspense fallback={<div className="mt-6 h-64 w-full bg-neutral-100" />}>
        <Posts />
      </Suspense>
    </main>
  );
}

async function Bio() {
  await new Promise((r) => setTimeout(r, 30));
  return <p>Bio text…</p>;
}
async function Posts() {
  await new Promise((r) => setTimeout(r, 30));
  return <ul><li>post</li></ul>;
}
```

#### Key Points — 8.8.7

- Progressive rendering is a **UX strategy**, not only a tech toggle.
- Measure **Core Web Vitals** per deploy.

---

## 8.9 Data Fetching Patterns

### 8.9.1 Parallel Data Fetching

**Beginner Level:** `Promise.all` fetches **user** and **notifications** together for a **dashboard** header.

**Intermediate Level:** In Server Components, start multiple `fetch` calls before `await`ing each to maximize overlap when dedup rules allow.

**Expert Level:** For heterogeneous IO (DB + object store + search), use **task pools** with **timeouts** and **partial success** rendering.

```tsx
export default async function AdminHome() {
  const [users, reports] = await Promise.all([
    fetch("https://api.example.com/users/count").then((r) => r.json()),
    fetch("https://api.example.com/reports/summary").then((r) => r.json()),
  ]);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section>Users: {users.count}</section>
      <section>Open reports: {reports.open}</section>
    </div>
  );
}
```

#### Key Points — 8.9.1

- Avoid **serial** awaits when independent.
- Handle **partial failures** explicitly.

---

### 8.9.2 Sequential Data Fetching

**Beginner Level:** Second fetch needs an **id** from the first—**waterfall**.

**Intermediate Level:** Sometimes required (auth → tenant → resources).

**Expert Level:** Reduce waterfalls with **single** BFF endpoints or **SQL joins** on the server; document **latency budgets**.

```tsx
export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const project = await fetch(
    `https://api.example.com/projects/${params.projectId}`
  ).then((r) => r.json());
  const members = await fetch(
    `https://api.example.com/projects/${project.id}/members`
  ).then((r) => r.json());
  return (
    <div>
      <h1>{project.name}</h1>
      <p>{members.length} members</p>
    </div>
  );
}
```

#### Key Points — 8.9.2

- Necessary when **dependent**, but costly.
- Prefer **batch APIs** when hot path.

---

### 8.9.3 Preloading Data

**Beginner Level:** On **hover** of a product card, `router.prefetch` + warm client cache.

**Intermediate Level:** React Query **`prefetchQuery`** in server components for hydration.

**Expert Level:** For **enterprise** tables, prefetch **next page** on idle callbacks (`requestIdleCallback`).

```tsx
"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export function ProductRow({ id }: { id: string }) {
  const qc = useQueryClient();
  return (
    <Link
      href={`/products/${id}`}
      onMouseEnter={() => {
        void qc.prefetchQuery({
          queryKey: ["product", id],
          queryFn: () => fetch(`/api/products/${id}`).then((r) => r.json()),
        });
      }}
    >
      Open {id}
    </Link>
  );
}
```

#### Key Points — 8.9.3

- Preload **high probability** navigations.
- Avoid **stampeding** APIs on large lists—throttle.

---

### 8.9.4 Blocking vs Non-blocking

**Beginner Level:** Blocking: page waits for data before paint. Non-blocking: show shell quickly (**streaming**).

**Intermediate Level:** Choose blocking for **SEO-critical** text; non-blocking for **widgets**.

**Expert Level:** For **SaaS billing**, block on **entitlement** checks server-side; stream **usage charts** later.

```typescript
export type FetchStrategy = "blocking" | "nonBlocking";

export function pickStrategy(surface: "seo" | "widget"): FetchStrategy {
  return surface === "seo" ? "blocking" : "nonBlocking";
}
```

#### Key Points — 8.9.4

- Map strategy to **business risk** and **SEO**.
- Document per route in your **architecture** wiki.

---

### 8.9.5 Error Handling in Data Fetching

**Beginner Level:** `try/catch` around `fetch`; show **friendly** message.

**Intermediate Level:** Use **error.tsx** boundaries (App Router) and **typed** error objects.

**Expert Level:** Centralize **retry** policies, **circuit breakers**, and **observability** (OpenTelemetry spans around IO).

```tsx
export default async function SafePage() {
  try {
    const res = await fetch("https://api.example.com/x");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return <pre>{JSON.stringify(data)}</pre>;
  } catch {
    return <p>We could not load this section. Try again soon.</p>;
  }
}
```

#### Key Points — 8.9.5

- Never leak **stack traces** to users in prod.
- Log **correlation ids** on the server.

---

### 8.9.6 Loading States

**Beginner Level:** Spinners for **client** fetches; skeletons for **layout** placeholders.

**Intermediate Level:** Match skeleton **geometry** to final UI to reduce CLS.

**Expert Level:** For **infinite feeds**, maintain **stable keys** and **scroll** preservation across fetches.

```tsx
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 w-full animate-pulse rounded bg-neutral-100" />
      ))}
    </div>
  );
}
```

#### Key Points — 8.9.6

- Prefer **skeletons** over spinners for **content** areas.
- Accessibility: **`aria-busy`** where appropriate.

---

### 8.9.7 Caching Strategies

**Beginner Level:** **Static** for marketing, **dynamic** for accounts, **ISR** for blogs.

**Intermediate Layer:** Align **browser**, **CDN**, **Next data cache**, and **client cache**.

**Expert Level:** Write a **decision table** per entity (`Product`, `UserSession`, `Cart`) with **owner** and **invalidation** events.

```typescript
export const cachePolicy = {
  productDetail: { layer: "ISR+tag", ttlSeconds: 120 },
  cart: { layer: "client+serverSession", ttlSeconds: 0 },
  homepageHero: { layer: "tagOnDemand", ttlSeconds: 300 },
} as const;
```

#### Key Points — 8.9.7

- Caching is **cross-layer**.
- Test **purge** paths whenever you ship mutations.

---

### Supplement: Observability and SLOs

**Beginner Level:** Log slow `fetch` calls in dev.

**Intermediate Level:** Track **p95** SSR latency and **API error rates** per route.

**Expert Level:** **SLO dashboards** per critical flow (**checkout**, **login**, **feed**). Alert on **saturation** of data dependencies (DB CPU).

```typescript
export type RouteSlo = { route: string; p95Ms: number; errorRate: number };
```

#### Key Points — Observability

- Measure before **micro-optimizing**.
- Tie metrics to **user journeys**, not only routes.

---

### Supplement: Security considerations

**Beginner Level:** Do not put **API keys** in client `fetch`.

**Intermediate Level:** Validate **Zod** on all server inputs from `fetch` JSON.

**Expert Level:** **SSRF** protection for user-supplied URLs in **webhook** or **preview** fetchers; **token** scope minimization per **tenant**.

```typescript
// never do this in client bundles
const SECRET = process.env.DATABASE_URL;
void SECRET;
```

#### Key Points — Security

- **Server-only** secrets.
- **Authorize** every BFF handler.

---

### Supplement: Testing data fetching

**Beginner Level:** Mock `fetch` in unit tests.

**Intermediate Level:** Use **MSW** for integration tests of components.

**Expert Level:** Contract test **API handlers** and **CMS** payloads in CI with **schema snapshots**.

```typescript
// vitest/jest style sketch
// test("loads orders", async () => {
//   global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
//   ...
// });
```

#### Key Points — Testing

- Test **error** and **empty** states.
- Keep fixtures **realistic** (pagination shapes).

---

## Topic 8 — Best Practices

- Choose **SSG/ISR** for public, cacheable content; **SSR/dynamic** for personalized or auth-heavy views.
- Prefer **server fetching** for SEO and secrets; **client fetching** for interactive, private widgets.
- Use **parallel fetching** by default; justify **waterfalls** explicitly.
- Apply **tags + on-demand revalidation** for editorial and merchandising workflows.
- Tune **`staleTime` / `revalidate`** to real **freshness requirements**, not zero by default everywhere.
- Instrument **p95 latency**, **error rates**, and **cache hit ratio** per critical API.
- Keep **DTOs** small and **serialize** safely to the client.
- Pair **Suspense fallbacks** with **stable skeleton layouts** to protect CLS.
- For mutations, implement **invalidation** (React Query) or **`mutate`** (SWR) and **optimistic UI** with rollbacks.
- Document a **caching decision table** shared by frontend and backend teams.

---

## Topic 8 — Common Mistakes to Avoid

- Using **`getStaticProps`** for data that depends on **request cookies** or unique user sessions.
- Creating **unbounded `getStaticPaths`** builds that time out CI.
- Assuming **ISR** is real-time—it's **eventually consistent** without on-demand revalidation.
- Fetching in **`useEffect`** without **abort/cleanup** or **deduplication** across components.
- **Hydration mismatches** when server and client `fetch` differ—align URLs and caching.
- Ignoring **error states** and only coding happy paths.
- Sprinkling `no-store` everywhere and wondering why **costs** and **TTFB** exploded.
- **Leaking PII** in props or client caches.
- **Open redirect** vulnerabilities in SSR redirect logic based on raw query params.
- Overusing **`fallback: true`** without considering **SEO** and UX flashes.

---

*Data fetching is where performance, security, and UX meet. Start from product freshness requirements, implement the smallest cache story that satisfies them, and evolve toward tags, streaming, and client caches as complexity grows.*





