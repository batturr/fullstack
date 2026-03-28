# Caching

How Next.js **caches** routes, `fetch` responses, client navigations, and **deduplicates** work within a request—with **revalidation** tools that tie **e-commerce**, **blogs**, **dashboards**, **SaaS**, and **social** workloads to real **freshness SLAs**. Examples use **TypeScript** and align with **App Router** semantics (with Pages Router callouts where relevant).

---

## 📑 Table of Contents

- [9.1 Caching Overview](#91-caching-overview)
  - [9.1.1 Next.js Caching Layers](#911-nextjs-caching-layers)
  - [9.1.2 Full Route Cache](#912-full-route-cache)
  - [9.1.3 Data Cache](#913-data-cache)
  - [9.1.4 Router Cache](#914-router-cache)
  - [9.1.5 Request Memoization](#915-request-memoization)
- [9.2 Full Route Cache](#92-full-route-cache)
  - [9.2.1 Static Route Caching](#921-static-route-caching)
  - [9.2.2 Build-time Rendering](#922-build-time-rendering)
  - [9.2.3 Cache Invalidation](#923-cache-invalidation)
  - [9.2.4 Dynamic Routes Caching](#924-dynamic-routes-caching)
- [9.3 Data Cache](#93-data-cache)
  - [9.3.1 `fetch()` Response Caching](#931-fetch-response-caching)
  - [9.3.2 Cache Duration](#932-cache-duration)
  - [9.3.3 Per-Request Caching](#933-per-request-caching)
  - [9.3.4 Opting Out of Data Cache](#934-opting-out-of-data-cache)
  - [9.3.5 Cache Tags](#935-cache-tags)
- [9.4 Router Cache (Client-side)](#94-router-cache-client-side)
  - [9.4.1 Client-side Navigation Cache](#941-client-side-navigation-cache)
  - [9.4.2 Cache Duration](#942-cache-duration)
  - [9.4.3 Prefetching](#943-prefetching)
  - [9.4.4 Cache Invalidation](#944-cache-invalidation)
- [9.5 Request Memoization](#95-request-memoization)
  - [9.5.1 Automatic Request Deduplication](#951-automatic-request-deduplication)
  - [9.5.2 React `cache()` Function](#952-react-cache-function)
  - [9.5.3 Single Render Pass](#953-single-render-pass)
  - [9.5.4 Memoization Scope](#954-memoization-scope)
- [9.6 Revalidation](#96-revalidation)
  - [9.6.1 Time-based Revalidation](#961-time-based-revalidation)
  - [9.6.2 On-demand Revalidation](#962-on-demand-revalidation)
  - [9.6.3 `revalidatePath()` Function](#963-revalidatepath-function)
  - [9.6.4 `revalidateTag()` Function](#964-revalidatetag-function)
  - [9.6.5 Revalidation in Server Actions](#965-revalidation-in-server-actions)
  - [9.6.6 Cache Busting Strategies](#966-cache-busting-strategies)
- [9.7 Caching Best Practices (Operational)](#97-caching-best-practices-operational)
  - [9.7.1 When to Cache](#971-when-to-cache)
  - [9.7.2 When Not to Cache](#972-when-not-to-cache)
  - [9.7.3 Cache Configuration](#973-cache-configuration)
  - [9.7.4 Debug Caching Issues](#974-debug-caching-issues)
  - [9.7.5 Cache Headers](#975-cache-headers)
  - [9.7.6 CDN Integration](#976-cdn-integration)
- [Topic 9 — Best Practices](#topic-9--best-practices)
- [Topic 9 — Common Mistakes to Avoid](#topic-9--common-mistakes-to-avoid)

---

## 9.1 Caching Overview

### 9.1.1 Next.js Caching Layers

**Beginner Level:** Next.js speeds up your app by **remembering** work: rendered pages, `fetch` results, and client navigations—like keeping a **best-selling products** list ready to serve.

**Intermediate Level:** Major App Router layers: **Full Route Cache** (static HTML+RSC payload), **Data Cache** (`fetch`), **Router Cache** (client soft cache during session), and **Request Memoization** (dedupe within one request).

**Expert Level:** Reason about **invalidation** across **edge POPs**, **origin** Node processes, and **client** memory—stale bugs often come from **layer mismatch** (tag revalidated but CDN still old).

```typescript
export type CacheLayer =
  | "fullRoute"
  | "data"
  | "router"
  | "requestMemo";
```

#### Key Points — 9.1.1

- Multiple caches compose—debug **which** layer is stale.
- **Product** requirements drive which layers you enable.

---

### 9.1.2 Full Route Cache

**Beginner Level:** Prebuilt **pages** served from CDN quickly—great for **marketing** and **blog** posts.

**Intermediate Level:** Applies to **static** routes; dynamic rendering opts out of full static caching for that route.

**Expert Level:** Use **`revalidatePath`** / routing dynamics to refresh; watch **segment configs** (`dynamic`, `fetchCache`) during upgrades.

```tsx
// Conceptual: static marketing route benefits from full route cache
export default function MarketingPage() {
  return <h1>Ship faster with our SaaS</h1>;
}
```

#### Key Points — 9.1.2

- Tied to **static vs dynamic** route outcome.
- **Layouts** participate—understand nested invalidation.

---

### 9.1.3 Data Cache

**Beginner Level:** Stores **`fetch`** responses so repeated calls reuse data—like caching **currency rates** for a minute.

**Intermediate Level:** Controlled via `cache`, `next.revalidate`, and **`next.tags`**.

**Expert Level:** Align **origin `Cache-Control`** headers with Next semantics; avoid **double caching** conflicts between data cache and **browser**.

```tsx
await fetch("https://api.example.com/rates", { next: { revalidate: 60 } });
```

#### Key Points — 9.1.3

- **Per-URL + options** identity (conceptually).
- **Tag** invalidation is the scalpel for partial updates.

---

### 9.1.4 Router Cache

**Beginner Level:** Client keeps **recent segments** around so back/forward feels instant—like revisiting a **dashboard** tab.

**Intermediate Level:** Distinct from **React state**—it’s navigation-level memoization for segments.

**Expert Level:** Learn **soft navigation** behaviors per Next version; **`router.refresh`** forces server refetch when needed.

```tsx
"use client";

import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.refresh()}>
      Refresh data
    </button>
  );
}
```

#### Key Points — 9.1.4

- Improves **client navigation** UX.
- Can surprise devs when **server** changed but client shows prior segment briefly—use `refresh`.

---

### 9.1.5 Request Memoization

**Beginner Level:** If two components `fetch` the same URL in one request, Next may **dedupe** automatically.

**Intermediate Level:** Complements React `cache()` for **non-fetch** IO.

**Expert Level:** Scope is **one render pass**—do not rely on it cross-request; still add **application caches** where needed.

```tsx
import { cache } from "react";

export const getOrg = cache(async (orgId: string) => {
  return fetch(`https://api.example.com/orgs/${orgId}`).then((r) => r.json());
});
```

#### Key Points — 9.1.5

- **Automatic dedupe** reduces accidental waterfalls.
- `cache()` helps **DB** access patterns in RSC.

---

## 9.2 Full Route Cache

### 9.2.1 Static Route Caching

**Beginner Level:** Pages that can be **pre-rendered** are saved as static responses.

**Intermediate Level:** Avoid accidental dynamism (`cookies()` everywhere) if you want static **catalog** shells.

**Expert Level:** Use **segment-level** `dynamic` exports judiciously—push dynamism **down** the tree.

```tsx
export const dynamic = "force-static";

export default function AboutPage() {
  return <p>About our e-commerce brand</p>;
}
```

#### Key Points — 9.2.1

- Explicit **force-static** for clarity in mixed apps.
- Verify with **`next build` output**.

---

### 9.2.2 Build-time Rendering

**Beginner Level:** `next build` renders **static** pages and stores output.

**Intermediate Level:** ISR pages also have a **static first** version with revalidation timers.

**Expert Level:** CI pipelines should **warm** critical paths and validate **SLOs** on build-time API dependencies.

```bash
# Build renders static segments; inspect .next output sizes
next build
```

#### Key Points — 9.2.2

- Build-time failures block release—harden CMS access.
- Large sites need **incremental** strategies.

---

### 9.2.3 Cache Invalidation

**Beginner Level:** When content changes, **refresh** the cached route—via **time** or **webhooks**.

**Intermediate Level:** App Router: **`revalidatePath`**, **`revalidateTag`**, **`router.refresh`**.

**Expert Level:** For **multi-region**, ensure invalidation propagates or accept **eventual consistency** with user messaging.

```typescript
import { revalidatePath } from "next/cache";

export async function publishPost() {
  "use server";
  revalidatePath("/blog");
}
```

#### Key Points — 9.2.3

- Pick **path** vs **tag** granularity deliberately.
- Test **nested layouts** invalidation scope.

---

### 9.2.4 Dynamic Routes Caching

**Beginner Level:** Dynamic segments can still be **static** if inputs are known at build (`generateStaticParams`).

**Intermediate Level:** Unknown params may be **rendered on demand** then cached (per hosting).

**Expert Level:** For **e-commerce** SKUs, combine **tag per product** with static shells for PLP/PDP hybrids.

```tsx
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}

export default function Page({ params }: { params: { id: string } }) {
  return <p>Product {params.id}</p>;
}
```

#### Key Points — 9.2.4

- **generateStaticParams** enables static **dynamic routes**.
- Fallback behavior depends on **dynamic config**.

---

## 9.3 Data Cache

### 9.3.1 `fetch()` Response Caching

**Beginner Level:** Server `fetch` responses can be stored to skip repeat API calls.

**Intermediate Level:** Default caching mode favors **reuse** unless opted out.

**Expert Level:** POST `fetch` caching semantics differ—be explicit; prefer GET for cacheable reads.

```tsx
await fetch("https://api.example.com/blog/featured", {
  next: { tags: ["blog:featured"] },
});
```

#### Key Points — 9.3.1

- **Read** requests are the primary cache targets.
- **Auth** responses usually `no-store`.

---

### 9.3.2 Cache Duration

**Beginner Level:** `revalidate: N` sets **minimum time** between refreshes (ISR-like for data).

**Intermediate Level:** Long windows for **legal** docs; short for **pricing**.

**Expert Level:** Document **max staleness** accepted by finance/compliance for **B2B SaaS** quotes.

```tsx
await fetch("https://api.example.com/plans", { next: { revalidate: 3600 } });
```

#### Key Points — 9.3.2

- Duration is a **business** parameter.
- Pair with **on-demand** for editorial overrides.

---

### 9.3.3 Per-Request Caching

**Beginner Level:** Some data should be cached **only within one request**—handled via memoization/dedupe.

**Intermediate Level:** Do not confuse with **cross-request** data cache persistence.

**Expert Level:** Use `cache()` for DB reads that appear in multiple RSC subtrees **once per request**.

```tsx
import { cache } from "react";

export const loadViewer = cache(async () => {
  // one DB hit per request even if called from multiple components
  return { id: "u1" };
});
```

#### Key Points — 9.3.3

- **Request scope** prevents thundering herds inside a single render.
- Still use **connection pooling** at the DB layer.

---

### 9.3.4 Opting Out of Data Cache

**Beginner Level:** `cache: 'no-store'` means **always fetch**.

**Intermediate Level:** Needed for **personalized** dashboards and **auth**-scoped JSON.

**Expert Level:** Watch **cost** at scale—cache **non-sensitive** fragments or move reads to **edge** with care.

```tsx
await fetch("https://api.example.com/me", { cache: "no-store" });
```

#### Key Points — 9.3.4

- Explicit opt-out improves **predictability**.
- Do not sprinkle everywhere without **measurement**.

---

### 9.3.5 Cache Tags

**Beginner Level:** Name cache entries (`product:42`) for **targeted** invalidation.

**Intermediate Level:** Attach via `next: { tags: [...] }`.

**Expert Level:** Avoid **unbounded** tags (per user)—prefer **entity** tags + **list** tags pattern.

```tsx
await fetch("https://api.example.com/products/42", {
  next: { tags: ["products", "product:42"] },
});
```

```typescript
import { revalidateTag } from "next/cache";

export async function afterProductUpdate() {
  "use server";
  revalidateTag("product:42");
  revalidateTag("products");
}
```

#### Key Points — 9.3.5

- Tags are **invalidation handles**.
- Design **taxonomy** upfront.

---

## 9.4 Router Cache (Client-side)

### 9.4.1 Client-side Navigation Cache

**Beginner Level:** Keeps **segment UI** ready when users navigate around a **SaaS** app.

**Intermediate Level:** Works with **soft navigations** in App Router.

**Expert Level:** Understand **staleness** vs **server updates**; `router.refresh` re-fetches **Server Components** without losing client state necessarily (per framework rules).

#### Key Points — 9.4.1

- Improves **SPA-like** feel.
- Not a substitute for **application state** management.

---

### 9.4.2 Cache Duration

**Beginner Level:** Cached segments live for a **session window** (framework-defined).

**Intermediate Level:** Differs from **HTTP `max-age`**—this is **in-memory client router** behavior.

**Expert Level:** For **support** tools, expose a **hard refresh** UX pattern.

#### Key Points — 9.4.2

- Duration is managed by **Next**, not your code directly.
- Watch release notes on tuning knobs when exposed.

---

### 9.4.3 Prefetching

**Beginner Level:** `Link` prefetch fills router cache **ahead** of clicks.

**Intermediate Level:** Disable for **private** routes to avoid accidental caching signals (and wasted bandwidth).

**Expert Level:** Measure **data transferred** on mobile for **social** feeds with heavy parallel prefetches.

```tsx
import Link from "next/link";

export function SafeLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link href={props.href} prefetch={false}>
      {props.children}
    </Link>
  );
}
```

#### Key Points — 9.4.3

- Prefetch **warms** navigations.
- Tune for **cost** and **privacy**.

---

### 9.4.4 Cache Invalidation

**Beginner Level:** `router.refresh()` asks the server for **fresh RSC payload** for current route.

**Intermediate Level:** Combine with **server revalidation** after mutations.

**Expert Level:** For **optimistic** UI, defer refresh until server confirms—avoid **flicker**.

```tsx
"use client";

import { useRouter } from "next/navigation";

export function AfterCreateButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/items", { method: "POST" });
        router.refresh();
      }}
    >
      Create
    </button>
  );
}
```

#### Key Points — 9.4.4

- Client refresh complements **tag/path** revalidation.
- Not identical to **full reload**.

---

## 9.5 Request Memoization

### 9.5.1 Automatic Request Deduplication

**Beginner Level:** Identical in-flight server `fetch` may be **merged** within a render.

**Intermediate Level:** Reduces duplicate **CMS** calls in nested components.

**Expert Level:** Do not rely on dedupe for **mutations** or non-idempotent side effects.

#### Key Points — 9.5.1

- Helps **accidental** duplicate calls.
- Still design explicit **data loaders** for clarity.

---

### 9.5.2 React `cache()` Function

**Beginner Level:** Wrap expensive function to run **once per request** per args.

**Intermediate Level:** Use for **Prisma** queries shared across RSC tree.

**Expert Level:** Beware **cache key** semantics—complex objects should not be args; pass **primitives**.

```tsx
import { cache } from "react";
import { db } from "@/lib/db";

export const getProject = cache(async (id: string) => {
  return db.project.findUnique({ where: { id } });
});
```

#### Key Points — 9.5.2

- Server-only helper pattern.
- Great for **deduping DB** reads.

---

### 9.5.3 Single Render Pass

**Beginner Level:** Memoization resets **per request render**—not shared between users.

**Intermediate Level:** Contrast with **data cache** that can persist across requests.

**Expert Level:** For **ISR**, understand interactions between layers during **revalidation**.

#### Key Points — 9.5.3

- **Per-request** scope.
- Security: no **cross-tenant** leakage via memo cache.

---

### 9.5.4 Memoization Scope

**Beginner Level:** Scope = **one server render** invocation.

**Intermediate Level:** Nested `cache()` calls compose naturally.

**Expert Level:** Document which loaders are **cached** vs **live** in your **architecture** guide.

```typescript
export type MemoScope = "perRequest" | "dataCache" | "cdn";
```

#### Key Points — 9.5.4

- Name functions **`getXCached`** when wrapped with `cache()` for clarity.
- Test **hot paths** for accidental cache misses.

---

## 9.6 Revalidation

### 9.6.1 Time-based Revalidation

**Beginner Level:** Refresh cached data every **N seconds** automatically.

**Intermediate Level:** `next.revalidate` on `fetch` or ISR pages (Pages Router).

**Expert Level:** Choose timers per **dataset volatility**; use **jitter** in cron-like upstream systems to avoid synchronized stampedes.

```tsx
await fetch("https://cms.example.com/footer", { next: { revalidate: 86400 } });
```

#### Key Points — 9.6.1

- Simple **operational** model.
- Not sufficient for **instant** editorial needs alone.

---

### 9.6.2 On-demand Revalidation

**Beginner Level:** CMS webhook hits your app to **invalidate** immediately when a **blog** post publishes.

**Intermediate Level:** Implement secured POST handlers calling `revalidateTag` / `revalidatePath`.

**Expert Level:** Add **retry** + **idempotency** keys; verify **signature** (HMAC) from CMS vendors.

```typescript
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const sig = req.headers.get("x-signature");
  if (sig !== process.env.CMS_SIGNATURE)
    return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as { tag: string };
  revalidateTag(body.tag);
  return NextResponse.json({ ok: true });
}
```

#### Key Points — 9.6.2

- **Webhook-driven** freshness.
- **Authenticate** revalidation endpoints aggressively.

---

### 9.6.3 `revalidatePath()` Function

**Beginner Level:** Bust cache for `/shop` after merchandising updates.

**Intermediate Level:** Options may control **layout** vs **page** scope—consult current Next docs.

**Expert Level:** Avoid **wide** path revalidation on high-traffic roots during peak—prefer **tags** for surgical updates.

```typescript
import { revalidatePath } from "next/cache";

export async function afterCategoryRename() {
  "use server";
  revalidatePath("/shop");
}
```

#### Key Points — 9.6.3

- Path-based **invalidation**.
- Can be **broad**—use carefully.

---

### 9.6.4 `revalidateTag()` Function

**Beginner Level:** Invalidate all `fetch` entries tagged `products`.

**Intermediate Level:** Call after **admin** mutations.

**Expert Level:** For **multi-tenant SaaS**, include **tenant id** in tags (`tenant:acme:projects`).

```typescript
import { revalidateTag } from "next/cache";

export async function afterProjectMutation(tenantId: string) {
  "use server";
  revalidateTag(`tenant:${tenantId}:projects`);
}
```

#### Key Points — 9.6.4

- **Scalable** invalidation granularity.
- Requires **disciplined tagging** at fetch sites.

---

### 9.6.5 Revalidation in Server Actions

**Beginner Level:** After a form posts, **refresh** caches so lists update.

**Intermediate Level:** `revalidatePath`/`revalidateTag` at end of **server action**.

**Expert Level:** Handle **partial failures**—only revalidate after **DB commit** succeeds.

```typescript
"use server";

import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  // await db.task.create({ data: { title } })
  revalidatePath("/tasks");
}
```

#### Key Points — 9.6.5

- Keeps **UI** aligned with **mutations**.
- **Transactional** integrity first.

---

### 9.6.6 Cache Busting Strategies

**Beginner Level:** Add **`?v=2`** query strings to static assets when deploying (handled often by filename hashing).

**Intermediate Level:** For **API** JSON during incidents, temporary **`no-store`** flags.

**Expert Level:** Prefer **tag/path** revalidation over **global** busting; maintain **runbooks** for incidents.

```typescript
export const cacheBust = {
  asset: "content-hash filename",
  data: "revalidateTag",
  emergency: "temporary no-store + redeploy",
} as const;
```

#### Key Points — 9.6.6

- **Surgical** beats **nuclear**.
- Automate **CMS → webhook** pipelines.

---

## 9.7 Caching Best Practices (Operational)

### 9.7.1 When to Cache

**Beginner Level:** Cache **public** content many users see: **blogs**, **docs**, **product** descriptions.

**Intermediate Level:** Cache **read-heavy** JSON with clear staleness windows.

**Expert Level:** Cache **aggregates** (metrics) with **SLA** dashboards; invalidate on **pipelines** completion.

#### Key Points — 9.7.1

- High **QPS** + low **volatility** = great cache candidates.
- Add **monitoring** for hit rates.

---

### 9.7.2 When Not to Cache

**Beginner Level:** Do not cache **per-user secrets** or **authorization** decisions.

**Intermediate Level:** Personalized **dashboards** often `no-store` or segment dynamic.

**Expert Level:** **Cart** and **checkout** flows—be explicit; **PCI** scope prefers minimal caching of sensitive payloads.

#### Key Points — 9.7.2

- **Auth** and **PII** are red flags.
- **Legal** holds may require **immediate** accuracy.

---

### 9.7.3 Cache Configuration

**Beginner Level:** Set `revalidate` in `fetch` calls consistently via **helpers**.

**Intermediate Level:** Centralize **`cache()`** loaders and **`tags`** builders.

**Expert Level:** **Feature flags** to relax caching during incidents (toggle to dynamic).

```typescript
export async function cmsFetch(path: string, tags: string[]) {
  return fetch(`https://cms.example.com${path}`, {
    next: { revalidate: 120, tags },
  });
}
```

#### Key Points — 9.7.3

- **DRY** up caching options.
- Review on **Next upgrades**.

---

### 9.7.4 Debug Caching Issues

**Beginner Level:** Add temporary **logging** of cache keys and paths.

**Intermediate Level:** Compare **response headers** from origin vs Next.

**Expert Level:** Use **Vercel** (or host) observability + **distributed tracing** to see which layer serves stale.

```typescript
// Temporary debug helper (remove in production)
export function debugCache(label: string, meta: Record<string, unknown>) {
  if (process.env.DEBUG_CACHE === "1") console.info(label, meta);
}
```

#### Key Points — 9.7.4

- Reproduce with **curl** against deployment URLs.
- Capture **`next build`** route table.

---

### 9.7.5 Cache Headers

**Beginner Level:** `Cache-Control` on API responses influences downstream behavior.

**Intermediate Level:** Align **CDN** headers with Next **data cache** to avoid contradictions.

**Expert Level:** For **authenticated** JSON APIs behind BFF, often **`private, no-store`** at edge.

```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

#### Key Points — 9.7.5

- Headers are **contracts** with CDNs.
- Test **stale-while-revalidate** UX.

---

### 9.7.6 CDN Integration

**Beginner Level:** CDN sits in front of your app caching **static assets**.

**Intermediate Level:** Full route cache + CDN = **global** fast paths.

**Expert Level:** **Purge** APIs must coordinate with **tag** revalidation; avoid **race** where purge completes before origin regenerates.

```typescript
export type CdnPurge = { paths: string[]; tags?: string[] };
```

#### Key Points — 9.7.6

- **Edge** is not magic—understand **eventual consistency**.
- Document **purge runbooks**.

---

### Supplement: Pages Router caching cross-reference

**Beginner Level:** ISR pages use **`revalidate`** in `getStaticProps`.

**Intermediate Level:** `res.revalidate` API (historical patterns) vs App Router functions—follow current docs for your version.

**Expert Level:** During **migration**, run dual caches briefly—use **distinct paths** or **staged** cutover.

#### Key Points — Pages cross-reference

- **Terminology** shifts across routers.
- Migration tests should include **cache** behavior.

---

### Supplement: Social feed considerations

**Beginner Level:** Feeds change constantly—usually **dynamic** or **client** driven.

**Intermediate Level:** Cache **profile shells** statically; fetch **timeline** client-side with SWR/React Query.

**Expert Level:** **Edge personalization** is advanced—measure **privacy** and **compliance** impacts.

#### Key Points — Social

- Do not ISR **per-user** timelines at global cache.
- **Rate limit** fan-out prefetch.

---

### Supplement: E-commerce pricing integrity

**Beginner Level:** Show **stale price** risks—set **revalidate** conservatively.

**Intermediate Level:** On **promo start**, trigger **on-demand** revalidation for PLP/PDP tags.

**Expert Level:** **Legal** disclaimers + server **price verification** at checkout regardless of cached UI.

#### Key Points — Pricing

- UI cache ≠ **authoritative** price.
- **Checkout** must re-validate totals server-side.

---

## Topic 9 — Best Practices

- Model caches explicitly: **what**, **where**, **TTL/tag**, and **who invalidates**.
- Prefer **tags** for large sites with **partial** updates (products, posts, tenants).
- Keep **dynamic surfaces** small—push static shells outward.
- Use **`cache()`** for DB reads repeated across RSC subtrees in one request.
- Treat **router cache** as UX optimization—refresh after **mutations** when needed.
- Align **CDN headers** with Next caching; avoid fighting the framework.
- Add **secured webhooks** for on-demand revalidation from CMS/e-commerce backends.
- Measure **hit rate**, **p95 latency**, and **stale incidents** per critical route.
- Document **incident** toggles (`no-store` flags) ahead of time.
- Educate **content editors** on expected **publish latency** (ISR windows).

---

## Topic 9 — Common Mistakes to Avoid

- Assuming **`router.refresh`** replaces **tag revalidation** for all data—layering matters.
- Creating **too many unique tags** (per user) and blowing invalidation cardinality.
- Using **`force-static`** while also calling **`cookies()`**—confusing build/runtime errors.
- Caching **authenticated** JSON responses at **CDN** accidentally.
- Ignoring **multi-layer staleness** (origin fresh, edge stale).
- **Over-invalidating** `/` after every micro-update—causes traffic spikes.
- Relying on **client router cache** as **source of truth** for financial data.
- Forgetting to **authenticate** revalidation webhooks.
- Mixing **Pages** ISR mental models with **App Router** tags without re-reading docs each major upgrade.

---

*Caching is a product feature: it trades freshness for speed. Make the trade explicit, measurable, and reversible.*


