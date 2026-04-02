# Next.js Interview Questions — Intermediate (4+ Years Experience)

100 in-depth questions with detailed answers for experienced developers.

---

## 1. How do parallel routes in the App Router let you render multiple pages in the same layout simultaneously, and what problems do `@folder` slots solve?

Parallel routes use named slots defined by the `@segmentName` folder convention alongside your regular route segments. Each slot can have its own `default.tsx` (required) so that when a user navigates to a URL that does not specify content for every slot, Next.js still has a fallback and avoids 404s for missing parallel branches. This pattern shines for dashboards where you want independent loading and error boundaries per pane—analytics, inbox, and calendar can fetch and stream on their own timelines. You combine slots in a parent `layout.tsx` by accepting props like `{ children, analytics, settings }` and rendering them side by side. Because each slot is a separate tree, you can soft-navigate one pane with `<Link>` while others preserve state if you structure URLs and loading states carefully. Parallel routes pair naturally with intercepting routes when you want modal overlays that map to shareable URLs. Understanding slot independence is critical: each parallel subtree still participates in the same route match, but caching and revalidation can differ per segment if you use different `fetch` options or tags.

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <section>{children}</section>
      <aside>{analytics}</aside>
    </div>
  );
}
```

---

## 2. What is the purpose of `default.js` (or `default.tsx`) inside a parallel route folder, and what breaks if you omit it?

Next.js requires a `default` export for each parallel slot so the framework can render something when the active URL does not address that slot—for example, a direct hit to a child route that does not include a parallel segment’s explicit UI. Without `default.tsx`, builds or navigations can fail because the router cannot synthesize a fallback for incomplete slot resolution. The default component should be lightweight and should not assume expensive data is available; it often mirrors a “closed” or empty state for modals driven by intercepting routes. In production, missing defaults are a common source of confusing hard errors during static analysis or runtime navigation. Treat defaults as part of your UX contract: they should align with what users expect when deep-linking. For modal patterns, the default might render `null` so the main page shows through until a matching intercept supplies overlay content.

```tsx
// app/@modal/default.tsx
export default function Default() {
  return null;
}
```

---

## 3. Explain intercepting routes using `(.)`, `(..)`, and `(..)(..)` conventions. When would you choose interception over a dedicated modal route?

Intercepting routes let you show UI from a **different** route segment while keeping the user visually on the current layout—commonly for photo galleries or quick-detail drawers—by “intercepting” client-side navigations to a nested route. The dot segments encode how many levels up from the current segment the intercepted route lives: `(.)` is the same level, `(..)` is one level up, and `(..)(..)` is two levels up, following the filesystem—not the URL path in every case, which trips people up. You still get a full-page render on hard refresh or direct URL entry because the intercept only applies to soft navigation from the defined entry points. This gives shareable URLs and SEO-friendly detail pages without sacrificing SPA-like overlays for in-app flows. Choose interception when the overlay and full page should share the same data requirements and you want progressive disclosure; avoid it when the modal and page experiences diverge heavily or when analytics needs a clean full navigation boundary. Testing both intercepted and full renders is essential because they are two render paths for one URL.

```tsx
// app/photos/(.)[id]/page.tsx — intercept sibling [id] from /photos
export default function PhotoModal({ params }: { params: { id: string } }) {
  return <dialog open><img src={`/api/img/${params.id}`} alt="" /></dialog>;
}
```

---

## 4. How do route groups—folders wrapped in parentheses—affect URLs, layouts, and organizational structure?

Route groups like `(marketing)` and `(app)` are purely organizational: they **do not** appear in the URL path, so `/pricing` stays `/pricing` even if the file lives at `app/(marketing)/pricing/page.tsx`. Groups let you apply different root layouts, fonts, or analytics providers to cohesive sections without polluting public URLs with extra segments. They are invaluable for large teams that want clear ownership boundaries in the filesystem while preserving flat marketing URLs. Multiple groups can coexist under `app/` and share or diverge layouts at different nesting levels. Remember that colocation rules and parallel routes still apply; groups do not change how dynamic segments or catch-all routes work. Misunderstanding groups as URL segments is a frequent interview trap—clarify that only folder names without parentheses become path segments.

```txt
app/
  (marketing)/
    layout.tsx
    page.tsx          → /
  (dashboard)/
    layout.tsx
    analytics/page.tsx → /analytics
```

---

## 5. What are soft navigation versus hard navigation behaviors in the App Router, and how do they affect Server Components and caching?

Soft navigation occurs when `next/link` or `router.push` performs a client transition: React can preserve client state in surviving subtrees and may reuse cached RSC payloads for unchanged segments. Hard navigation is a full document load (refresh, external link, or `window.location`), which always runs the full server pipeline and re-establishes client bundles from scratch. Soft navigations respect `staleTimes` for client router cache (framework-controlled in recent Next versions) and can skip refetching if Flight payloads are still considered fresh for a segment. This distinction matters for authentication gates: middleware still runs, but you should not rely solely on client preservation for security-sensitive state. For developers, it means you must test both transitions because intercepting routes and parallel slots behave differently on hard loads. Instrumentation should tag navigation type when debugging stale UI after deployments.

---

## 6. How does Next.js resolve conflicting layouts when using nested route groups and multiple `layout.tsx` files?

Layouts compose recursively from root to leaf: each `layout.tsx` wraps its children segment and inherits parent wrappers unless you reorganize with route groups to reset the tree. Route groups can split entirely different layout stacks under `app/` without adding URL segments, which is how you get unrelated chrome for `(auth)` vs `(main)` branches. When two groups converge on the same URL accidentally, the filesystem wins by specificity and ordering rules—duplicate paths are a build error. Understanding composition helps you place providers: put global ones in `app/layout.tsx`, section-specific ones in group layouts. Streaming boundaries inherit from the nearest `loading.tsx` and Suspense wrappers you define. Refactoring layout boundaries is often the cleanest fix for unwanted persistent headers rather than conditional hacks in a single layout.

```tsx
// app/(shop)/layout.tsx — shop-specific chrome only
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopChrome>{children}</ShopChrome>;
}
```

---

## 7. What role does `template.tsx` play compared to `layout.tsx`, and when should you prefer a template?

`layout.tsx` persists across navigations within its segment and is designed for shell UI that should not remount—headers, sidebars, and context providers that must survive route changes. `template.tsx` remounts on every navigation for its subtree, which resets local state and effects inside that boundary. Use templates when you need keyed animations, enter/exit transitions, or to reset client state on every child navigation without lifting state awkwardly. Templates still participate in the layout composition chain but insert a fresh instance per navigation. Overusing templates can hurt performance if expensive client trees remount too often. For most apps, layouts dominate; templates are a scalpel for animation and state-reset cases.

```tsx
// app/(docs)/template.tsx
'use client';
export default function DocsTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in">{children}</div>;
}
```

---

## 8. How do optional catch-all routes `[[...slug]]` differ from required catch-all `[...slug]` segments?

Required catch-all `[...slug]` matches one or more path segments; if zero segments are present, the route does not match and another route must handle the base path. Optional catch-all `[[...slug]]` also matches **zero** segments, so the same file can serve both the index and nested paths—useful for documentation sites or CMS-driven hierarchies with a single page component. Both expose `params.slug` as an array (or `undefined` for optional with zero segments, depending on configuration—verify against your Next version’s typings). Optional catch-alls increase the chance of accidental broad matching, so order sibling static routes carefully to avoid shadowing. Static generation with `generateStaticParams` must enumerate variants you care about for the optional tree.

```txt
app/docs/[[...slug]]/page.tsx  → /docs, /docs/a, /docs/a/b
```

---

## 9. Explain how `notFound()` and the `not-found.tsx` convention interact across nested routes.

Calling `notFound()` from a Server Component, Server Action, or route handler throws a special control-flow error that renders the **nearest** `not-found.tsx` in the route tree, unwinding the current render. This is how you translate domain-level “missing resource” outcomes into a 404 UX without manually branching every page. If no `not-found.tsx` exists, the root `app/not-found.tsx` is used; if that is also missing, a generic fallback appears. `not-found.tsx` can itself be a Server Component and may fetch supplemental navigation data. Distinguish this from `redirect()`, which issues a navigation response rather than a 404. For CMS-driven pages, combine `notFound()` with tag-based revalidation so unpublished content stops resolving after purge.

```tsx
// app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  return <article>{post.title}</article>;
}
```

---

## 10. How can you combine parallel routes and route groups to implement a resilient admin shell with independently failing panes?

You structure the admin area under a route group `(admin)` for shared auth-wrapped layout, then define parallel slots such as `@main`, `@inspector`, and `@activityLog` for distinct panes. Each slot can export its own `error.tsx` and `loading.tsx`, so one pane’s failure does not white-screen the entire admin surface—aligning with React’s granular error boundary model extended to routes. `default.tsx` per slot ensures direct URLs and partial navigations always resolve. Data fetching can be isolated per slot with Suspense-friendly patterns, streaming results as they arrive. This architecture maps well to product analytics or moderation tools where operators expect partial degradation rather than total outage. Document cross-slot communication carefully—usually URL search params, server actions, or a lightweight client store—because implicit coupling breaks slot independence.

---

## 11. What are React Server Components (RSC) in the Next.js context, and how do they change mental models from the Pages Router era?

Server Components execute only on the server, emit a serialized description of UI plus references to client islands, and never ship component code for those parts to the browser—shrinking bundles for data-heavy trees. They can read the filesystem, hit private networks, and use large libraries without bloating client JS, provided those usages stay server-side. Unlike traditional SSR that hydrates everything, RSC avoids hydrating server-only subtrees entirely, delegating interactivity to explicit Client Components. The mental shift is from “fetch on client in `useEffect`” to “fetch on server close to data, stream HTML/Flight to client.” Boundaries matter: passing non-serializable props (functions, class instances) across the server/client line is invalid. Next’s App Router makes RSC the default, so you reach for `'use client'` only where browser APIs or local state demand it.

```tsx
// Server Component (default) — no directive
import { db } from '@/lib/db';

export default async function UserList() {
  const users = await db.user.findMany();
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.email}</li>
      ))}
    </ul>
  );
}
```

---

## 12. Describe the React Server/Client boundary rules: what props can cross it, and why?

The server can pass serializable props—plain objects, arrays, strings, numbers, `Date` in many setups (serialized), and JSX for children—to Client Components. You cannot pass functions (except specific Server Actions marked with directives), promises awaiting on the client in arbitrary ways, or opaque handles unless using supported bridging patterns. Children composition is powerful: a Server Component can import a Client Component and pass **server-rendered** children slots that remain server components conceptually when structured correctly. Violations surface as build-time or runtime errors about non-serializable values. Understanding serialization explains why context from server-only modules cannot directly hydrate arbitrary client consumers without explicit providers on the client. Keeping props JSON-like at boundaries yields predictable behavior across deploys.

```tsx
'use client';
export function Counter({ label }: { label: string }) {
  const [n, setN] = React.useState(0);
  return (
    <button type="button" onClick={() => setN((x) => x + 1)}>
      {label}: {n}
    </button>
  );
}
```

---

## 13. How does streaming SSR with Suspense change Time to First Byte (TTFB) versus Time to First Meaningful Paint in App Router applications?

Without streaming, the server might delay sending bytes until an entire route’s async work completes, harming TTFB for slow upstream dependencies. Suspense boundaries let Next flush the shell early—layout, static chrome, and fallbacks—while asynchronous Server Components resolve in parallel and stream additional HTML/RSC payloads as data arrives. Users perceive faster paint because skeleton UI appears quickly even if DB queries lag. This shifts optimization focus from minimizing total server time to structuring work into parallel, well-bounded segments with sensible fallbacks. Abuse Suspense boundaries and you risk layout shift; pair them with stable skeleton dimensions. Measuring Web Vitals with real navigation patterns is essential because lab tests may hide streaming benefits.

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SlowBlock />
    </Suspense>
  );
}
```

---

## 14. What is the difference between `loading.tsx` and manual `<Suspense>` in the App Router?

`loading.tsx` automatically wraps the corresponding `page.tsx` segment in a Suspense boundary with your fallback, applying to navigations within the app without you wrapping every page manually. It integrates with prefetching: Next can show the loading UI quickly during transitions, improving perceived performance. Manual `<Suspense>` gives finer-grained control inside a page when multiple independent async regions exist—charts vs comments vs recommendations. You might combine both: route-level `loading.tsx` for coarse skeletons, nested Suspense for partial streaming. `loading.tsx` does not replace error handling; pair with `error.tsx` for fault domains. Choose manual Suspense when fallbacks need shared state or layout coupling beyond a single segment file.

---

## 15. How do partial pre-rendering (PPR) concepts relate to static shells and dynamic holes in Next.js 15+ discussions?

Partial Prerendering aims to serve a mostly static HTML shell instantly while marking certain subtrees as dynamic “holes” that stream in when ready—blending static generation responsiveness with personalized or data-heavy islands. In practice, you structure routes so static marketing chrome can be cached at the edge while authenticated or geo-specific regions hydrate/stream post-shell. APIs like `unstable_noStore` (or evolving equivalents across versions) mark segments opting out of static caching where needed. PPR shifts architecture conversations from “all or nothing SSR” to explicit delineation of cacheable vs realtime surfaces. Teams should align CDN configs and `cache-control` headers with these holes to avoid stale static shells hiding fresh dynamic content incorrectly. Observability must tag static vs dynamic segment timings separately.

```tsx
import { unstable_noStore as noStore } from 'next/cache';

export default async function Personalized() {
  noStore();
  const user = await getCurrentUser();
  return <span>{user.name}</span>;
}
```

---

## 16. Why might you split a page into multiple async Server Components instead of one large `async` component?

Multiple async siblings allow React to schedule independent IO concurrently and stream results as each completes, reducing head-of-line blocking. A single large component awaits everything serially unless you manually parallelize with `Promise.all`, which still yields one completion barrier for the whole subtree’s readiness if not paired with Suspense. Smaller components improve code locality—easier testing and clearer ownership per domain entity. They also localize revalidation concerns: you can tag fetches differently per entity. The trade-off is more files and prop drilling unless you use composition patterns. For highly correlated data, a single query might still be preferable to avoid N+1 patterns—apply judgment.

```tsx
export default function Page() {
  return (
    <>
      <Suspense fallback={<AFallback />}>
        <A />
      </Suspense>
      <Suspense fallback={<BFallback />}>
        <B />
      </Suspense>
    </>
  );
}
```

---

## 17. How does the Flight protocol (RSC payload) differ from classic JSON APIs for UI updates?

Flight carries serialized React element trees and metadata so the client reconciles updates against the existing component tree rather than you manually mapping JSON to state. It enables fine-grained UI refreshes without shipping a full page reload or bespoke client templates for every endpoint. Payloads can reference client modules by ID, keeping heavy logic server-side. This is fundamentally different from REST JSON where you own hydration glue. Debugging Flight requires Next-specific tooling familiarity—network panels show binary/text streams rather than familiar JSON bodies. Security-wise, never expose secrets in props destined for Client Components because serialization crosses the wire. Version skew between server and client bundles is a deployment concern; consistent rollouts matter.

---

## 18. What pitfalls appear when mixing `export const dynamic = 'force-static'` with components that need request-specific data?

Forcing static opts the route into build-time or shared caching semantics, meaning per-request headers, cookies, and search params may not be available in the way dynamic routes expect—or reads may be fixed at build time. Misconfiguration manifests as stale personalized UI or build failures when accessing `headers()`/`cookies()` in static segments. The fix is to relocate dynamic reads into explicitly dynamic segments, use `connection()` (Next 15+) patterns where appropriate, or move user-specific UI into client fetches with clear trade-offs. Document these boundaries for CMS editors who expect live previews. Often `dynamic = 'force-dynamic'` or selective `fetch` caching is clearer than fighting static mode.

```tsx
export const dynamic = 'force-static';

export default function MarketingPage() {
  // Avoid cookies()/headers() here if truly static
  return <h1>Hello</h1>;
}
```

---

## 19. Explain how `use` (React) interacts with promises in Client Components versus server contexts in Next.js apps.

React’s `use` can unwrap promises and context in render for suspense-compatible data access; on the server, it participates in streaming semantics when paired with Suspense. In Client Components, you still need a Suspense boundary above components that `use` a promise created per render carelessly—anti-patterns include creating a new promise every render causing infinite suspense. Prefer stable promise sources or cache layers. Next.js developers often rely on `async` Server Components instead of `use` for server data, reserving `use` for experimental or library-driven patterns. Understanding `use` clarifies newer React directions, but teams should follow framework idioms for data loading to reduce footguns. Always verify minimum React/Next versions supporting your chosen `use` patterns.

```tsx
'use client';
import { use, Suspense } from 'react';

function Inner({ data }: { data: Promise<string> }) {
  const value = use(data);
  return <p>{value}</p>;
}

export function ClientBlock({ data }: { data: Promise<string> }) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Inner data={data} />
    </Suspense>
  );
}
```

---

## 20. How do error boundaries (`error.tsx`) behave with streaming Server Components, and what do they not catch?

`error.tsx` wraps errors in its segment during rendering and in nested client/server boundaries according to React rules, showing a fallback UI and enabling `reset()` via the exported boundary in Client Components. They **do not** catch errors inside event handlers unless you handle manually; those remain regular try/catch concerns. Errors thrown in certain asynchronous server paths after streaming starts may surface differently—monitor logs and test failure injection per segment. Global capture for server failures still leans on observability platforms and `global-error.tsx` for root-level replacement. For RSC, think of `error.tsx` as segment-scoped resilience, not a substitute for domain validation. Pair with `notFound()` for expected absence cases instead of treating them as exceptions.

```tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert">
      <p>{error.message}</p>
      <button type="button" onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## 21. Compare `fetch` caching semantics in Next.js App Router: `cache: 'force-cache'`, `cache: 'no-store'`, and `next: { revalidate }`.

By default in many App Router setups, `fetch` requests are memoized per request layout and participate in Data Cache rules unless opted out. `cache: 'no-store'` disables data cache storage, forcing fresh IO—ideal for auth-sensitive or highly volatile reads. `next: { revalidate: 60 }` enables ISR-like revalidation windows, storing responses until stale, then refreshing in the background depending on traffic patterns. `force-cache` leans on platform caching aggressively; combine with tags for surgical invalidation. Misunderstanding defaults causes “stale UI after mutation” bugs—always trace whether your `fetch` is deduped within a render, cached across requests, or fully dynamic. Version notes: confirm current Next 15/16 docs because defaults evolved across minors.

```tsx
const res = await fetch('https://api.example.com/items', {
  next: { revalidate: 120, tags: ['items'] },
});
```

---

## 22. How does `fetch` request deduplication work within a single server render in Next.js?

During a single request’s React render pass, identical `fetch` calls (same URL and options) collapse to one network operation, reducing redundant database/API hits when multiple components ask for the same resource. This is not a substitute for application-level caching across users or requests; it is an intra-request optimization. Changing query string order or headers typically breaks deduplication identity—normalize URLs when relying on this feature. For non-`fetch` data access (ORM queries), deduplication does not magically apply unless you use React `cache()` wrappers or your ORM’s request-scoped singleton. Debugging “why only one query” often traces back to dedup plus aggressive memoization. Instrument ORM logs to verify actual DB roundtrips.

```tsx
import { cache } from 'react';
import { db } from '@/lib/db';

export const getUser = cache(async (id: string) => db.user.findUnique({ where: { id } }));
```

---

## 23. What is the Data Cache versus the Full Route Cache, and why does confusing them cause stale page bugs?

The Data Cache stores the results of `fetch` (and some other data APIs) keyed by inputs and revalidation policies, potentially shared across requests and deployments depending on configuration. The Full Route Cache relates to prerendered RSC/HTML payloads for static routes at build time, reused until invalidated or rebuilt. A page can be static while still pulling “fresh enough” data via tagged revalidation, or fully dynamic if opted out—layers interact but are not identical. Stale bugs appear when developers mutate server state but never invalidate the Data Cache tags or path cache entries backing the route. Fixing requires explicit `revalidateTag`, `revalidatePath`, or time-based revalidation strategies aligned with UX. Draw diagrams for your team’s caching stack to align backend mutations with frontend freshness contracts.

---

## 24. Demonstrate `revalidateTag` and explain when tagged fetches become stale.

Tag-based revalidation lets multiple routes share a logical cache key (e.g., `posts`) and invalidate all associated cached `fetch` results after a mutation. After `revalidateTag('posts')`, the next request should miss cache for tagged fetches and repopulate—exact eager vs lazy behavior can depend on Next version and configuration. Tags encourage colocating cache invalidation with domain events: creating a post triggers tag invalidation for lists and detail caches. Without tags, you might overuse `revalidatePath` and invalidate broader trees than necessary. Tag granularity is a design choice: too fine means many invalidation calls; too coarse causes unnecessary refetching. Always handle authz at the data layer—cache invalidation does not fix permission bugs.

```tsx
// mutation route or Server Action
import { revalidateTag } from 'next/cache';

export async function createPost() {
  'use server';
  await db.post.create({ data: { title: 'Hi' } });
  revalidateTag('posts');
}
```

---

## 25. How does `revalidatePath` differ from `revalidateTag`, and what are the trade-offs?

`revalidatePath('/blog')` invalidates a specific path (and optionally page vs layout types via options in newer APIs), useful when you know exactly which URL surfaces must refresh after a mutation. `revalidateTag` invalidates by cross-cutting data dependencies regardless of which routes consumed those fetches. Paths are simpler to reason about for content editors targeting known URLs; tags scale better for entity-centric domains with many consumers. Over-broad path invalidation can spike server load; tag misuse can miss obscure consumers if tagging discipline slips. Combining both is valid: tag data, then path-revalidate critical entry routes for immediate navigation freshness. Measure ISR behavior under load after changes.

```tsx
import { revalidatePath } from 'next/cache';

export async function updateProfile() {
  'use server';
  await saveProfile();
  revalidatePath('/account');
}
```

---

## 26. What is `unstable_cache` (React `cache` vs Next `unstable_cache`) and when would you wrap ORM calls?

React `cache()` deduplicates per request render for arbitrary async functions, while `unstable_cache` can persist results across requests with keys and revalidation windows—closer to application memoization at the framework level. Wrap expensive ORM aggregations that are safe to share across users for a TTL when data is not user-specific. Never wrap personalized queries without including user-scoped keys in the cache key parts—otherwise you leak data across sessions. `unstable_cache` APIs have evolved; verify import paths and stability for your Next version. Prefer `fetch` tags when possible for uniformity; reach for `unstable_cache` when not using `fetch`. Document cache key versioning when schema changes.

```tsx
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

export const getTopProducts = unstable_cache(
  async () => db.product.findMany({ take: 10, orderBy: { score: 'desc' } }),
  ['top-products'],
  { revalidate: 300, tags: ['products'] },
);
```

---

## 27. How do you implement incremental static regeneration (ISR) patterns in App Router projects without the old `revalidate` export on `getStaticProps`?

You shift to `fetch` revalidate options, `revalidatePath`, `revalidateTag`, or route segment config like `export const revalidate = 3600` depending on whether the whole route should adopt a cadence. For CMS pages, tag invalidation on webhook events often beats pure time-based ISR. Dynamic routes use `generateStaticParams` to prebuild popular paths while leaving long-tail paths on-demand with caching policies. Understanding your hosting platform’s edge behavior is crucial—Vercel and self-hosted Node differ in cache propagation. Test stale-while-revalidate UX: users might see old content briefly unless you optimistically update client views after mutations.

```tsx
export const revalidate = 600;

export default async function BlogIndex() {
  const posts = await fetch(`${process.env.API}/posts`, {
    next: { tags: ['posts'] },
  }).then((r) => r.json());
  return <PostList posts={posts} />;
}
```

---

## 28. What are safe patterns for using `headers()`, `cookies()`, and `searchParams` in Next.js 15+ regarding async access?

Next.js 15 moved many dynamic APIs to **async** accessors to prepare for finer-grained pre-rendering and concurrent request handling—`await headers()`, `await cookies()`, and `searchParams` passed as Promises in pages/layouts in newer typings. This prevents accidental synchronous reads that block scheduling optimizations. Refactor older code by marking components `async` and awaiting these APIs before branching auth or personalization. Libraries that assumed sync reads may need adapters or temporary compatibility flags during migration—check release notes. Testing should cover both sync legacy and async paths if you maintain a transition window. Always minimize dynamic scope: read cookies once and pass values down rather than scattering dynamic calls.

```tsx
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token ? <Authed /> : <Guest />;
}
```

---

## 29. How does opting a segment into `dynamic = 'force-dynamic'` affect downstream caching and edge behavior?

Marking a route as force-dynamic ensures request-specific rendering, disabling static prerender for that segment’s RSC/HTML payload and typically involving runtime evaluation on the server for each request. This is appropriate for dashboards using private session data across the entire tree. The trade-off is higher TTFB and server load versus static shells—use route splitting to confine dynamic scope. Edge vs Node runtime choice still applies separately; dynamic does not imply edge. Combine with caching headers you set manually in `route.ts` handlers for API responses if mixing patterns. Monitor cold starts if dynamic segments land on serverless functions.

```tsx
export const dynamic = 'force-dynamic';
```

---

## 30. What strategies help you avoid “over-fetching” in Server Components when multiple layers need the same entity?

Centralize entity loaders in a dedicated module wrapped with React `cache()` for per-request deduplication, ensuring one DB roundtrip even if header, page, and sidebar all need the user. Alternatively, fetch in a parent layout and pass serializable props—though large prop payloads might argue for careful shaping. Use GraphQL or relational `select` projections to limit columns at the source. Avoid N+1 patterns by batching with `include`/`join` strategies in Prisma or Drizzle. For read-heavy hot paths, add short-TTL caches with tags if data is shared across users. Measure query counts with SQL logging in staging; surprises often hide in nested child components.

---

## 31. What are Server Actions, and how does the `'use server'` directive change bundling and security posture?

Server Actions are async functions executed on the server, invoked from forms or imported into Client Components when marked with `'use server'`, wired through Next’s action protocol instead of ad hoc API routes. They reduce boilerplate for mutations and colocate validation with domain code. Security relies on **treating actions as public endpoints**: always re-verify authentication/authorization inside the action, never trust client-hidden fields. CSRF protections are handled by framework mechanisms where applicable—still follow SameSite cookie hygiene. Actions should validate input with Zod or similar and handle idempotency for payments. Understanding that actions are serialized calls explains why only certain closures can be passed—no accidental secret leakage via captured env unless intended.

```tsx
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const schema = z.object({ title: z.string().min(1) });

export async function createTodo(formData: FormData) {
  const parsed = schema.safeParse({ title: formData.get('title') });
  if (!parsed.success) return { error: parsed.error.flatten() };
  await db.todo.create({ data: { title: parsed.data.title } });
  revalidatePath('/todos');
  return { ok: true };
}
```

---

## 32. How do progressive enhancement patterns apply to Server Actions with native HTML forms?

Because Server Actions can be bound directly to `<form action={serverAction}>`, the form works without JavaScript for basic submissions—screen readers and low-JS environments still complete mutations, given you return meaningful UI feedback via redirects or re-rendered pages. Client-side enhancements add optimistic UI, toasts, and field-level validation, but the server remains authoritative. This reduces fragility compared to SPA-only mutations that fail closed when bundles break. Testing should include non-JS flows for critical funnels—checkout, password reset, support tickets. Pair `useFormStatus` for pending states in submit buttons to preserve accessible pending semantics. Progressive enhancement aligns with resilient ecommerce and government-style UX requirements.

```tsx
<form action={createTodo}>
  <input name="title" required />
  <SubmitButton />
</form>
```

---

## 33. Explain `useFormStatus` and how it differs from tracking loading state manually in the parent.

`useFormStatus` reads pending state from the **nearest** `<form>` context—typically used in a child submit button component to disable itself or show a spinner while the Server Action request is in flight. It avoids prop drilling `isPending` from parents and aligns pending UI tightly with form semantics. Manual parent state can desynchronize if multiple forms coexist or if you reuse buttons outside forms. `useFormStatus` focuses on submission pending, not field validation state—combine with controlled inputs for that. It pairs naturally with Server Actions and fetchers in React 19 patterns. Keep button components small and client-only.

```tsx
'use client';
import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save'}
    </button>
  );
}
```

---

## 34. How does `useActionState` (formerly `useFormState`) help manage validation errors returned from Server Actions?

`useActionState` lets a Client Component hold state returned from an action invocation—ideal for showing field-level errors without a full page reload while still using Server Actions as the source of truth. The hook receives `(state, formData) => newState` semantics on each submission, enabling reducers over server results. This pattern supersedes much of the manual wiring developers did with `useState` plus `startTransition`. You should serialize error objects safely—avoid leaking stack traces to clients. Combine with Zod `.flatten()` for ergonomic mapping to inputs. Remember accessibility: associate errors with fields via `aria-describedby`.

```tsx
'use client';
import { useActionState } from 'react';

export function Form({ action }: { action: (prev: any, formData: FormData) => Promise<any> }) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction}>
      <input name="email" aria-invalid={!!state?.errors?.email} />
      {state?.errors?.email && <p>{state.errors.email}</p>}
      <SubmitButton />
    </form>
  );
}
```

---

## 35. What are optimistic updates with Server Actions, and what consistency risks do you accept?

Optimistic updates apply predicted UI changes immediately—adding a comment locally before the Server Action completes—to make interfaces feel instant. The risk is divergence if the server rejects the mutation: you must roll back or reconcile, which complicates state machines. Implement with `useOptimistic` (React) around transitions or manual temporary IDs for created entities. For financial or inventory systems, optimism may be inappropriate; show pending states instead. Testing should simulate latency and failure modes. Pair with idempotent server operations to safely retry. Telemetry should track rollback frequency to detect systemic issues.

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';

export function CommentList({ addComment }: { addComment: (fd: FormData) => Promise<void> }) {
  const [optimistic, addOptimistic] = useOptimistic<string[], string>(
    [],
    (state, newComment) => [...state, newComment],
  );
  const [, start] = useTransition();

  async function onSubmit(formData: FormData) {
    const text = String(formData.get('text') ?? '');
    start(async () => {
      addOptimistic(text);
      await addComment(formData);
    });
  }

  return (
    <form action={onSubmit}>
      {optimistic.map((c, i) => (
        <p key={i}>{c}</p>
      ))}
    </form>
  );
}
```

---

## 36. How can you structure Server Actions across files to avoid circular imports with Client Components?

Place shared actions in dedicated `actions.ts` files marked `'use server'` at the top, exporting only async functions—Client Components import **named** actions without importing server-only modules transitively into client bundles. Avoid defining actions inside client files; the compiler boundary gets confusing fast. For colocated validation, import Zod schemas from isomorphic modules containing no server secrets. If you need derived server utilities, keep them in `lib/server/*` not imported by client code. Circular dependency issues often signal that UI components are doing too much data work—split presentation from mutations. Use barrel files cautiously; they can accidentally pull server code into client graphs if mis-exported.

```ts
// app/todos/actions.ts
'use server';
export async function toggleTodo(id: string) {
  await db.todo.update({ where: { id }, data: { done: true } });
}
```

---

## 37. What limitations exist binding Server Actions to non-form elements, and what patterns replace manual `onClick` mutations?

Actions integrate tightly with `<form>` for accessibility and progressive enhancement; using them from buttons without forms typically relies on `action` props on `<form>` or transitional APIs—check current React/Next docs for `formAction` on buttons for splitting multiple actions per form. For non-form interactions, you may call async actions from client handlers with `startTransition`, but you lose some progressive enhancement guarantees. Prefer hidden inputs and `<button formAction={...}>` patterns to stay declarative. For highly interactive surfaces (canvas, DnD), client mutations to route handlers may be clearer. Always re-validate auth inside the action regardless of trigger. Avoid mixing imperative `fetch` POSTs duplicating Server Action endpoints unnecessarily—duplication risks diverging validation.

```tsx
<form>
  <button formAction={saveDraft}>Save draft</button>
  <button formAction={publish}>Publish</button>
</form>
```

---

## 38. How do you handle file uploads with Server Actions securely?

Use `<input type="file" name="file" />` inside forms posted to Server Actions; on the server, read `FormData` blobs and stream uploads to object storage (S3, GCS) rather than persisting binaries in your app server memory longer than needed. Validate MIME types and size limits server-side—never trust client `accept` attributes. Virus scanning may be required for user-generated content platforms. Generate non-guessable object keys and return only signed URLs to clients when possible. For multi-tenant apps, enforce tenant-scoped paths in storage. Consider direct-to-storage uploads with pre-signed POST for large files while still using Server Actions to mint policies. Log anomalies and throttle abusive IPs at middleware.

```tsx
'use server';
export async function upload(formData: FormData) {
  const file = formData.get('file');
  if (!(file instanceof Blob) || file.size > 5_000_000) throw new Error('Invalid file');
  await putObject(await file.arrayBuffer());
}
```

---

## 39. Why should Server Actions be idempotent when possible, and how does that relate to double-submit behavior?

Users double-click, networks retry, and proxies may duplicate requests—idempotent actions (or dedup keys) prevent duplicate charges or records. Implement upserts, unique constraints at the DB level, and idempotency tokens for payment APIs. Server Actions are not magically immune to duplication; they’re HTTP requests under the hood. UX mitigations include disabling submit buttons via `useFormStatus`, but server guarantees matter more. For non-idempotent workflows, record request IDs in a short-lived store to detect repeats. Document these constraints for API teams integrating with your actions via the same server modules.

---

## 40. How can you debug Server Actions when validations fail silently in production?

Add structured logging at action entry with correlation IDs, log Zod parse results without sensitive fields, and send errors to observability (OpenTelemetry, Sentry). Use `console.error` sparingly in serverless—prefer centralized logging. Reproduce locally with the same `FormData` by writing unit tests invoking actions directly. Temporarily increase verbosity in staging with feature flags. For client mysteries, inspect Network for the Server Action POST and decode framework-specific payloads cautiously. Ensure `useActionState` surfaces error messages users can report. Remember PII regulations when logging forms.

---

## 41. What is Partial Prerendering (PPR) trying to optimize in real-world Next.js deployments?

PPR targets the sweet spot between fully static marketing performance and unavoidable dynamic pockets—personalized nav, cart badges, or account-specific greetings—without forcing the entire page onto slow SSR paths. Static shells maximize CDN offload and edge cache hit rates, while dynamic holes stream when ready. Product teams see better Lighthouse scores and reduced server costs versus wholesale SSR. Implementation details evolve; follow official guidance for enabling flags and compatible route segment configurations. Misconfiguration can yield blank holes if Suspense boundaries lack fallbacks. Align SEO needs: ensure critical text exists in static regions when crawlers require it.

---

## 42. How does `export const dynamic = 'error'` help enforce purely static segments?

Setting `dynamic` to `'error'` causes Next to throw if a developer accidentally introduces dynamic APIs like `headers()` into what was supposed to be a static-only route—useful for guardrails on marketing pages. It converts mistakes into build-time failures rather than silent performance regressions. Teams adopting strict performance budgets benefit from these compile-time contracts. Pair with code review policies requiring tests for static routes. If a new feature needs dynamism, you explicitly relax the config—making trade-offs visible. Document for contributors to avoid frustration.

```tsx
export const dynamic = 'error';
```

---

## 43. Compare static generation, dynamic rendering, and edge SSR in practical latency terms.

Static generation serves prebuilt assets from the edge almost instantly—best for blogs and landing pages. Dynamic rendering computes per request on your server region, adding DB/network latency but enabling auth. Edge SSR moves rendering closer to users but constrains Node APIs and database proximity—great for personalization that does not need a central DB roundtrip every time or when using edge-friendly data. Misplacing heavy ORM work on edge functions can hurt more than help. Measure p95 latency, not averages, and watch cold starts. Choose based on data locality and compliance, not buzzwords.

---

## 44. What does `export const fetchCache = 'default-cache' | 'only-cache' | 'force-cache' | 'only-no-store' | 'default-no-store'` control?

These segment-level options tune how `fetch` inside the subtree participates in Next’s Data Cache—useful when a route mixes cacheable marketing copy with user sessions by splitting segments instead of micromanaging each `fetch`. Mis-set options cause confusing “always fresh” or “always stale” behaviors. Prefer colocating policies with business requirements per layout region. When in doubt, be explicit per `fetch` for clarity. Review Next release notes—naming and availability refined across versions. Document team defaults in one internal wiki page to avoid per-file drift.

---

## 45. How do `runtime = 'edge'` and `runtime = 'nodejs'` differ for route handlers and middleware?

Edge runtimes use V8 isolates with a smaller API surface, faster cold starts in many cases, and geographic distribution—ideal for auth checks, geolocation routing, and rewriting requests. Node runtime supports full Node APIs, larger CPU/time limits on typical platforms, and traditional database drivers—better for heavy SSR and legacy integrations. Middleware almost always runs on edge; long DB transactions belong in route handlers on Node. Mix runtimes consciously within an app: lightweight gates at the edge, authoritative mutations on Node. Watch package compatibility—some npm modules assume Node `fs`.

```tsx
export const runtime = 'edge';

export function GET() {
  return new Response('ok');
}
```

---

## 46. Explain connection-oriented APIs like `connection()` (where available) and why they matter for pre-rendering boundaries.

`connection()` signals intent to wait for an actual incoming request connection before executing subsequent dynamic work—helping Next distinguish prerenderable content from truly connection-bound logic in advanced rendering modes. This matters as frameworks push toward more aggressive static shells: without explicit connection markers, some dynamic code might run at inappropriate phases. Adoption depends on Next versions—verify docs for your pin. Use these APIs when library authors say they’re required for compatibility with Partial Prerendering or similar features. Misuse can block streaming unnecessarily. Keep an eye on changelog terminology; these APIs evolve quickly.

---

## 47. How can you combine `generateStaticParams` with on-demand generation effectively?

`generateStaticParams` prebuilds high-traffic paths at build time, while other paths may still compile on first request if configured—balancing build duration with coverage. For huge catalogs, paginate static params or sample top items plus periodic rebuilds via CMS triggers. Pair with `revalidate`/`tags` so generated pages refresh after content changes. Watch database load during builds—batch queries and avoid N+1 in param generation. For rapidly changing slugs, prefer SSR with caching rather than huge static matrices. Monitor 404 rates to adjust which slugs are prebuilt.

```tsx
export async function generateStaticParams() {
  const posts = await db.post.findMany({ select: { slug: true }, take: 100 });
  return posts.map((p) => ({ slug: p.slug }));
}
```

---

## 48. What is the role of `dynamicParams` in dynamic segments?

`dynamicParams` controls whether params outside `generateStaticParams` are allowed to resolve on demand (`true`, default in many cases) or result in 404 (`false`) for static export-like strictness. Ecommerce sites with closed catalogs may set `false` to avoid accidental page generation for bogus slugs. Public blogs usually keep `true` to accept long-tail URLs. Changing this impacts SEO and marketing campaigns using UTM-only differences—usually unrelated, but worth noting. Combine with server-side validation inside the page for business rules.

```tsx
export const dynamicParams = true;
```

---

## 49. How does Next.js handle `metadata` exports and streaming compatibility for SEO?

The `metadata` API in App Router replaces many `next/head` uses with type-safe, colocated SEO definitions—open graph, robots, canonical URLs. For streaming routes, ensure critical metadata is static or resolvable early; highly dynamic titles can still work but may require `generateMetadata` async functions that complete before commit depending on constraints. Misconfigured metadata hurts social sharing previews—test with Facebook/Twitter debuggers. Structured data may be injected via components or `metadata` where appropriate. Keep metadata functions pure and fast; heavy DB calls here delay first byte.

```tsx
export const metadata = {
  title: 'Acme Blog',
  description: 'Posts about engineering',
};
```

---

## 50. Why might you still see loading waterfalls despite Suspense, and how do you mitigate them?

Waterfalls happen when one async component’s result is required to start the next fetch—classic parent-child sequential dependencies. Mitigate by lifting independent queries to a common parent and firing `Promise.all`, using parallel route slots, or restructuring GraphQL to batch fields. Another waterfall source is accidental await in series within one component—refactor to concurrent awaits. Instrument server timings to see layer-by-layer delays. Sometimes business logic truly is sequential; communicate that honestly to stakeholders rather than overpromising Suspense miracles.

```tsx
export default async function Page() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return <Feed user={user} posts={posts} />;
}
```

---

## 51. How do you implement auth gating in `middleware.ts` without leaking session details to the client?

Middleware should read lightweight session cookies or signed tokens, perform fast allow/deny, and rewrite or redirect unauthorized users before heavy SSR. Avoid logging raw secrets; redact tokens in logs. Keep authorization checks **repeated** in Server Components or actions for sensitive operations—middleware is an optimization and first line of defense, not the sole check. Use `matcher` configs to limit middleware execution to protected subtrees for performance. Be mindful of edge limitations when verifying JWTs—crypto libraries must be edge-compatible. For OAuth, prefer battle-tested libraries and rotate secrets regularly.

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token && req.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/app/:path*'] };
```

---

## 52. Describe internationalization routing strategies with `next-intl` or similar libraries in App Router.

Common patterns segment locales via `[locale]` dynamic routes or domain-based mapping, with middleware detecting preferred language from `Accept-Language` and cookie overrides. Server Components can load translations as dictionaries without shipping all locales to the client if structured carefully. Static generation requires enumerating locales in `generateStaticParams`. Right-to-left languages need layout tweaks—CSS logical properties help. Keep URLs culturally appropriate; some teams omit locale prefixes for default languages—document that choice. Test hreflang tags for SEO across locales.

```tsx
// middleware sets locale cookie; app/[locale]/layout.tsx wraps children
export default async function Root({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  return <html lang={params.locale}>{children}</html>;
}
```

---

## 53. How can middleware support A/B testing or feature flags at the edge?

Middleware can assign users to experiments based on cookies or consistent hashes of anonymous IDs, then set headers or cookies consumed downstream by Server Components or clients. Keep assignments sticky to avoid flicker—set durable cookies once per experiment. Avoid large response bodies in middleware; it should be fast. For complex bucketing, integrate with flag providers that offer edge SDKs. Ensure GDPR/privacy compliance when persisting identifiers. Log experiment assignments with trace IDs for analysis. Do not fork caching dangerously: vary cache keys or disable cache for experimental pages when necessary.

```ts
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get('exp_bucket')) {
    res.cookies.set('exp_bucket', Math.random() < 0.5 ? 'A' : 'B', { path: '/' });
  }
  return res;
}
```

---

## 54. What are geo-routing patterns, and what cautions apply for compliance?

Middleware can read geolocation headers provided by hosting platforms to route users to region-specific storefronts or currency defaults. Compliance teams may require explicit consent before localization—do not override user-selected preferences. Geo IP is imperfect; always allow manual region switching accessible in the UI. Combine geo hints with CDN caching carefully to prevent cross-region leakage of pricing. Document data residency implications if routing also changes backend data stores. Test VPN scenarios to ensure flows remain usable.

---

## 55. How does middleware interact with `next.config.js` `basePath` and trailing slash settings?

When using `basePath`, middleware matchers and redirects must account for prefixed paths depending on Next version behavior—misconfiguration causes redirect loops or skipped auth. Trailing slash normalization can change string comparisons in matchers—normalize `req.nextUrl.pathname` before branching. Integration tests should cover both `/base` and `/base/` variants if applicable. Read official compatibility tables when upgrading—subtle fixes land in minors. Centralize path helpers to avoid duplicated string literals.

---

## 56. Why should middleware stay minimal, and what belongs in route handlers instead?

Middleware runs on every matched request—heavy CPU or remote calls add global latency and scale costs. Offload database session lookups to Server Components or dedicated `/api` routes when acceptable, caching results per request. Reserve middleware for cheap checks, rewrites, and header injection. Complex business rules often fit better in dedicated services or background jobs. Observability: tag spans inside middleware sparingly. If you need body inspection, remember middleware constraints—often not possible for large payloads; use route handlers.

---

## 57. Compare Edge Middleware vs Node `middleware` runtime if you opt into experimental Node middleware (when available).

Edge middleware offers low latency and geographic distribution but cannot use all Node modules. Node middleware (where supported experimentally) unlocks richer libraries at the cost of heavier cold starts and different scaling profiles—evaluate carefully. Many teams keep middleware edge-pure and push Node needs downward. Security patches apply differently across runtimes—track advisories. Load test both: p99 matters for login storms. Document the chosen approach for onboarding engineers.

---

## 58. How do you safely redirect in middleware while preserving `callbackUrl` query params for OAuth flows?

Construct `NextResponse.redirect` URLs using `req.nextUrl.clone()` to preserve origin and protocol, then append encoded `callbackUrl` parameters pointing to the originally requested path. Validate `callbackUrl` against an allowlist to prevent open redirects—attackers craft malicious login links otherwise. For OAuth libraries, follow their recommended callback handling rather than ad hoc strings. Test multi-hop flows: login → consent → return. Use HTTPS everywhere in production to protect tokens in transit.

```ts
const login = new URL('/login', req.url);
login.searchParams.set('callbackUrl', req.nextUrl.pathname);
return NextResponse.redirect(login);
```

---

## 59. What is the `matcher` export’s role, and how do negative lookahead patterns help performance?

`matcher` restricts which paths invoke middleware—critical to avoid running auth on static assets (`_next/static`, images). Negative lookahead regexes exclude those paths efficiently. Smaller matcher surface reduces CPU spend globally. Revisit matchers when adding new top-level routes—accidental omissions can skip auth on new sections. Document regexes inline—future maintainers will thank you. Test matcher behavior against internationalized path prefixes.

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 60. How can you coordinate middleware rewrites with App Router `route.ts` handlers for BFF patterns?

Middleware can rewrite external-looking paths (`/api/mobile/*`) to internal route handlers that aggregate backend microservices—shielding secrets and adapting payloads for clients. Ensure rewritten routes still enforce auth consistently—don’t bypass checks accidentally. For mobile apps, stable BFF contracts matter; version your JSON. Rate limit at edge or gateway in front of route handlers to protect origin services. Logging should include internal rewrite targets for debugging. Keep response sizes modest to leverage edge caching where safe.

---

## 61. What workflow optimizes bundle size analysis in Next.js 15+ projects?

Use `@next/bundle-analyzer` via environment flag to visualize client chunks and identify heavy imports—run on CI for regressions, not just locally. Focus on largest dependencies first—date libraries, charts, and icon packs often dominate. Replace default imports with tree-shakeable paths where possible (`lodash-es` vs `lodash`). Compare server vs client bundles separately—Server Actions and RSC change what ships to the browser. Track RUM metrics after optimizations; bundle size is a proxy, not the goal. Educate designers about icon font vs SVG trade-offs.

```bash
ANALYZE=true pnpm build
```

---

## 62. How does dynamic `import()` improve performance for heavy client-only components?

`next/dynamic` with `ssr: false` loads large client components—maps, editors—only when needed, shrinking initial JS and improving LCP. Pair with skeleton fallbacks to avoid layout jumps. Prefetch routes that likely need those components when user intent signals hover or navigation—balance speculation vs bandwidth. Ensure dynamically imported modules don’t eagerly pull massive CSS unintentionally. For SEO-critical content, avoid client-only dynamic imports in above-the-fold hero regions. Monitor Core Web Vitals segmented by device class.

```tsx
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <p>Loading chart…</p> });
```

---

## 63. Explain tree shaking interactions with barrel files and server/client boundaries in Next apps.

Barrel files that re-export both client and server modules can accidentally pull server-only code into client bundles if bundlers cannot prove separation—use explicit import paths or `import 'server-only'`. Tree shaking works best with ES modules and side-effect-free packages; CommonJS interop can block elimination. Audit `package.json` `sideEffects` flags from libraries. For internal modules, avoid mega-barrels at hot paths. Lint with ESLint rules banning client imports of `server-only` modules. Measure, don’t guess—bundle analyzer reveals reality.

```ts
import 'server-only';

export async function secret() {
  return process.env.SECRET;
}
```

---

## 64. What techniques reduce image-related performance issues with `next/image`?

Provide accurate `width`/`height` or `fill` with sized containers to avoid CLS; use priority only for true LCP candidates. Prefer modern formats via automatic optimization where supported. Configure `remotePatterns` carefully to avoid open proxies. For art direction, `sizes` helps the browser pick correct responsive variants. Don’t upscale tiny assets—serve appropriate resolutions from CMS. Monitor CDN cache hit rates for image routes. For user uploads, generate thumbnails asynchronously.

```tsx
import Image from 'next/image';

export function Hero() {
  return (
    <Image src="/hero.jpg" alt="" width={1200} height={600} priority />
  );
}
```

---

## 65. How does font optimization with `next/font` help Core Web Vitals?

`next/font` self-hosts fonts, removes extra round trips to third-party hosts, and applies CSS adjustments to minimize FOIT/FOUT—improving LCP and CLS. Subsetting strategies may still be needed for large scripts like CJK. Combine with `display: swap` behaviors the helper configures. Avoid duplicating font families across layouts unnecessarily—centralize in root layout. For variable fonts, prefer single files over many weights when design permits. Verify licensing for self-hosting.

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 66. Compare Auth.js (NextAuth v5) App Router integration versus bespoke JWT session APIs.

Auth.js provides credential providers, OAuth integrations, and session callbacks with conventions that reduce security mistakes compared to rolling your own crypto. JWT sessions reduce database hits but complicate instant revocation—database sessions improve control at the cost of IO. App Router adapters expose route handlers for auth; keep `AUTH_SECRET` rotation plans. For custom JWT, you must handle XSS, CSRF, and replay carefully—often not worth it versus maintained libraries. Map organizational requirements—SSO, MFA—to provider support early. Test session expiry edge cases across tabs.

```ts
// auth.ts (Auth.js v5 style sketch — verify against pinned docs)
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: 'database' },
});
```

---

## 67. How do you implement role-based access control (RBAC) with Server Components and Server Actions?

Store roles in your session or database user record, then centralize authorization helpers like `assertRole(user, 'admin')` invoked at the top of sensitive Server Actions and data loaders. Never rely on hidden form fields or client-only guards. For UI, conditionally render admin controls, but treat that as convenience only—security must re-check on the server. Consider attribute-based access control (ABAC) for fine-grained resources. Audit logs for admin mutations help compliance. Unit-test authorization matrices thoroughly—bugs here are critical.

```tsx
'use server';
import { auth } from '@/auth';

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') throw new Error('Forbidden');
  await db.user.delete({ where: { id } });
}
```

---

## 68. What are common JWT pitfalls in Next.js apps using edge middleware and Node SSR?

JWT verification in middleware must use crypto supported on edge; some algorithms or key formats fail silently or at build time. Clock skew between issuers and verifiers causes intermittent failures—allow small leeways where appropriate. Storing JWTs in `localStorage` exposes them to XSS—prefer HttpOnly cookies for session tokens. Rotation of signing keys requires dual-key verification periods—plan migrations. Logging JWT claims can leak PII—scrub fields. Short-lived access tokens plus refresh flows reduce blast radius.

---

## 69. How does session fixation protection apply to custom login Server Actions?

Regenerate session identifiers after successful login to prevent fixation attacks where an attacker seeds a session ID consumed later by the victim. Frameworks often handle this; custom stores must explicitly rotate tokens stored in cookies. Invalidate old sessions server-side when passwords reset. Tie session creation to IP/User-Agent only cautiously—mobile networks change IPs often. Multi-device session lists improve user trust and security. Document logout behavior—client-only state clearing is insufficient.

---

## 70. Explain CSRF defenses for cookie-based sessions using Server Actions and standard forms.

Frameworks may embed hidden tokens or rely on SameSite cookies; understand which applies to your stack—never assume. For custom APIs, use double-submit cookies or CSRF tokens validated on the server. CORS policies matter for cookie credentialed requests from separate frontends. Preflight requests add latency—minimize unnecessary cross-origin complexity. Pen-test authentication flows regularly. Educate frontend devs that `credentials: 'include'` widens attack surfaces if backends are misconfigured.

---

## 71. What are pragmatic Prisma patterns for Next.js serverless deployments?

Use a **singleton** Prisma Client in development to avoid connection explosions from hot reload; in production serverless, prefer connection poolers like PgBouncer or Neon’s pooler to avoid exhausting Postgres connections. Set `DATABASE_URL` to pooled endpoints for lambdas; direct URLs for migrations run in CI. Avoid long transactions in serverless handlers—they block concurrency. Index queries used in Server Components heavily accessed at runtime. Use `prisma.$transaction` for consistency when mutating multiple tables. Monitor connection counts aggressively during spikes.

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 72. How does Drizzle ORM fit into type-safe Server Actions and migrations workflows?

Drizzle offers lightweight SQL-like schemas with excellent TypeScript inference—great for teams wanting closer-to-SQL control than Prisma’s DSL. Co-locate schema definitions in `db/schema.ts`, generate migrations with `drizzle-kit`, and import typed queries into Server Actions for compile-time guarantees. Combine with `postgres.js` or `pg` poolers suited to serverless. Drizzle’s bundle size can be smaller—important for edge if ever needed, though many DB drivers still target Node. Establish code review standards for raw SQL fragments to prevent injection—use tagged templates/helpers. Benchmark ORM vs raw for hot queries.

---

## 73. What connection pooling strategies apply when deploying to Vercel or AWS Lambda?

Serverless scales concurrency horizontally—each invocation may open DB connections unless pooled externally. Use vendor poolers (Supabase pooler, RDS Proxy, Neon) to multiplex connections to the database. Tune pool sizes and idle timeouts; misconfiguration causes `too many connections` or latency spikes. For read replicas, route read-heavy reporting queries explicitly. Cache read models in Redis for hot keys when necessary. Document maximum concurrency targets from load tests. Fail closed when the pool is saturated—queue or backoff rather than stampeding the DB.

---

## 74. How do you structure transactions across Server Actions and background jobs safely?

Keep business-critical transactions short inside Server Actions; for multi-step workflows spanning human approval, use durable job queues (SQS, BullMQ) with idempotent workers. Never rely solely on in-memory state across function instances. Store workflow state in Postgres with explicit statuses. Compensating transactions handle partial failures in distributed systems—design them upfront. For emails or third-party APIs, outbox patterns ensure at-least-once delivery without blocking HTTP requests. Test crash scenarios where the action succeeds but the client never receives the response—make retries safe.

---

## 75. What are read-after-write consistency challenges when using global caches with DB mutations?

After a Server Action mutates data, edge caches or CDN layers might still serve stale reads unless you invalidate or use surrogate key purging. Tag-based revalidation coordinates Next Data Cache invalidation with database truth. For user-specific reads, consider `cache: 'no-store'` or `unstable_noStore` in the immediate post-mutation navigation path. Mobile apps may hit APIs bypassing Next—ensure those caches invalidate consistently. Document expected temporary inconsistency windows for support teams. Telemetry comparing DB vs UI states helps detect cache bugs early.

---

## 76. How do you unit test Server Components and actions in isolation?

Extract pure functions for business rules and test them without React. For asynchronous Server Components, use React’s experimental testing utilities sparingly—many teams integration-test via rendering routes in test harnesses. For Server Actions, invoke them directly in Node tests with mocked databases and verify side effects and revalidation calls (mock `next/cache`). Snapshot tests for RSC output are brittle—prefer behavior assertions. Use in-memory SQLite for Prisma tests where feasible. Keep tests fast—avoid real network calls.

```ts
import { describe, it, expect, vi } from 'vitest';
import { createTodo } from './actions';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('createTodo', () => {
  it('validates input', async () => {
    const fd = new FormData();
    const res = await createTodo(fd);
    expect(res).toMatchObject({ error: expect.anything() });
  });
});
```

---

## 77. What integration testing strategies suit App Router layouts and nested loading states?

Use Playwright or Cypress to navigate real routes, assert skeleton visibility during delayed API mocks, and ensure final content appears—validates Suspense/`loading.tsx` wiring. Mock network at the HTTP layer for realism versus stubbing fetch internals. Seed databases or use docker-compose services for faithful SSR tests in CI. Test both full reload and client transitions for critical flows. Keep tests parallelizable with isolated tenants. Flaky tests often trace to timing—use Playwright’s auto-waiting wisely, avoid arbitrary sleeps.

```ts
await page.goto('/dashboard');
await expect(page.getByText('Loading')).toBeVisible();
await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
```

---

## 78. How do you end-to-end test authentication flows without brittle sleeps?

Use Playwright’s `storageState` to save authenticated sessions after one login fixture, reusing cookies across specs for speed. For OAuth, intercept provider callbacks in test environments using test-only IdPs or mocked token endpoints—never hit real Google in CI. Rotate credentials via secrets management. Assert role-gated routes return 403 or redirects deterministically. Clean up test users in teardown hooks to avoid DB pollution. Monitor test runtime—auth flows are slow when done poorly.

---

## 79. What role does Visual Regression Testing play in Next.js component libraries?

Storybook + Chromatic or Loki captures screenshots of components across themes and locales, catching unintended CSS changes when upgrading Tailwind or design tokens. Pair with accessibility checks (axe) in CI. For RSC-only components, stories may require wrappers mimicking server data—keep stories simple and deterministic. Visual tests complement—not replace—functional tests. Flakiness often comes from animation—disable transitions in test modes via data attributes.

---

## 80. How can you test middleware matchers and rewrites effectively?

Write unit tests importing middleware functions with mocked `NextRequest` objects to assert redirect targets and status codes for representative paths—including negative cases for static assets. Supplement with integration tests hitting the running server or Playwright navigating to URLs that should rewrite. Regex mistakes are subtle—table-driven tests from real paths help. Document expected behavior for internationalization prefixes. Performance-test middleware regexes if extremely complex—though usually negligible.

---

## 81. Compare `next-intl`, `next-i18next`, and manual `[locale]` routing for App Router projects.

`next-intl` is App Router–friendly with middleware locale detection and message catalogs suited to RSC; verify current RSC support in docs for your version. `next-i18next` historically targeted Pages Router—migration may be nontrivial though adapters evolve. Manual `[locale]` routing offers maximum control but pushes i18n plumbing to you—fine for small sites, heavy for large ones. Choose based on translation workflow (Phrase, Crowdin integrations), pluralization, and ICU message needs. Consider bundle impact of message loading strategies. Ensure SEO hreflang tags remain correct regardless of library.

---

## 82. How do you manage localized date/number formatting in Server Components?

Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with `params.locale` on the server to render locale-correct strings without client JS—great for emails and static HTML. Ensure time zones are explicit for events—store UTC in DB, convert with `Intl` or libraries like `luxon`/`date-fns-tz` where complex rules apply. For user-specific time zones, detect via profile settings rather than IP when accuracy matters. Test around daylight saving transitions—bugs cluster there. Keep formatting logic pure for unit tests.

```tsx
export default function Price({ locale, amount }: { locale: string; amount: number }) {
  return <span>{new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount)}</span>;
}
```

---

## 83. What strategies help right-to-left (RTL) layouts in Next.js apps?

Set `dir="rtl"` on `<html>` or relevant subtrees when locale requires it—often via `[locale]` layout reading a locale-to-dir map. Prefer CSS logical properties (`margin-inline-start`) over physical left/right rules to reduce branching CSS. Iconography may need mirroring—design systems should document exceptions (e.g., play buttons). Test component libraries for RTL bugs—some third-party components mishandle popper positioning. Combine with Storybook global locale/dir toggles for manual QA.

---

## 84. How does localized SEO metadata differ from single-locale sites, and what pitfalls appear?

Each localized URL should have unique `title`, `description`, and `openGraph` locale fields—duplicate metadata across languages hurts relevance. `hreflang` link tags cross-reference translations for search engines; missing reciprocity breaks trust signals. Avoid automatic translation of brand terms without human review—SEO and legal risk. Separate structured data per locale with correct language fields. Automated sitemaps should enumerate locale variants with canonical URLs to reduce duplicate content issues. Monitor Search Console per locale separately.

---

## 85. What are effective patterns for loading translation messages efficiently?

Split namespaces per route to avoid sending huge JSON blobs—load only `common` plus feature namespaces needed for that segment. For RSC, fetch dictionaries on the server per request locale and pass serializable message maps to client islands if needed. Cache dictionaries in memory on the server for high-traffic locales with `unstable_cache`. For static sites, embed translations at build time. Beware of dynamic key construction preventing tree shaking—prefer explicit imports. Track translator workflow with keys, not English string scraping, for maintainability.

---

## 86. How do `error.tsx` boundaries compose, and when should you add a `global-error.tsx`?

Nested `error.tsx` files catch errors in their subtree, allowing contextual recovery UI—sidebar errors without killing the entire app. `global-error.tsx` replaces the root layout entirely for catastrophic root failures—use sparingly for minimal fatal UI and logging. Errors bubble to the nearest boundary; plan granularity to match product surfaces. Always provide a `reset` path when using client boundaries to retry rendering. Log to observability with route context. Do not catch expected validation failures here—handle those inline.

```tsx
'use client';
export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body>
        <h1>Something went wrong</h1>
        <pre>{error.message}</pre>
      </body>
    </html>
  );
}
```

---

## 87. What is the difference between throwing errors versus returning `{ error }` objects from Server Actions?

Throwing triggers `error.tsx` boundaries—good for unexpected failures, but poor for routine validation messages unless you catch them carefully. Returning structured `{ error }` objects integrates cleanly with `useActionState` for inline field feedback without tripping full-page error UIs. Mixing both without discipline confuses UX—define conventions: validation returns, invariant violations throw. Logging differs: thrown errors should hit error monitoring with stack traces; validation might only need info logs. Document which exceptions are user-visible. Avoid leaking internal details in either path.

---

## 88. How can you implement centralized logging and error reporting for server routes?

Initialize OpenTelemetry or Sentry in `instrumentation.ts` (Next hook) so server handlers share tracing context—propagate `requestId` headers from middleware. Use structured JSON logs in production for ingestion by Datadog/CloudWatch. Correlate logs across Server Actions, `route.ts`, and background jobs with shared IDs. Sample traces in high-traffic systems to control costs. Tag releases with commit SHAs for regression tracking. Never log secrets or full cookies.

```ts
// instrumentation.ts (conceptual)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
}
```

---

## 89. What patterns help users recover from transient errors in streamed regions?

Provide `reset` buttons from error boundaries and retry fetches with exponential backoff for client components. For Server Components, guide users to refresh the page—consider optimistic messaging that the system auto-retries idempotent reads. Display human-friendly references (support IDs) mapped to trace IDs internally. For payments, never auto-retry blindly—confirm state with the provider. Pair UI with circuit breakers upstream to avoid retry storms. Communicate maintenance windows transparently when platforms degrade.

---

## 90. How do you handle `not-found` versus error states for CMS content that is unpublished?

`notFound()` semantically maps to 404—appropriate when content never existed or is permanently removed with no replacement. Temporary unpublished states might be 403 if authenticated users could see drafts—avoid misleading 404s for SEO if the slug will return. Implement CMS workflows with preview tokens that bypass `notFound` for editors. Audit trails should record who unpublished content. For legal takedowns, consult compliance about HTTP status codes and caching headers.

---

## 91. How can you improve type safety for `params` and `searchParams` in layouts and pages?

Use TypeScript generics with `PageProps` patterns centralizing `params` and `searchParams` types—Next 15 types may wrap these as Promises, so define `Awaited` helpers accordingly. Derive types from Zod schemas parsing `searchParams` to catch invalid inputs early. Avoid `as any` on `params.slug`; instead validate with `z.string().uuid()` when applicable. Generate route types using community tools cautiously—ensure compatibility with your Next pin. Share types between `generateMetadata` and `page` components to prevent drift.

```tsx
type Props = { params: Promise<{ slug: string }> };

export default async function Page(props: Props) {
  const { slug } = await props.params;
  return <Post slug={slug} />;
}
```

---

## 92. What advanced TypeScript patterns help with discriminated unions in Server Action results?

Model action results as ` { ok: true; data: T } | { ok: false; error: ValidationError }` and narrow with `if (!result.ok)` checks—TypeScript flows types correctly in branches. Avoid `any` unions that force runtime checks everywhere. Pair with Zod’s `safeParse` outputs typed errors. Export helper type guards (`isValidationError`) when sharing code between client renderers and tests. Keep enums for roles/strings aligned between DB and TS via `satisfies` patterns. Document result contracts for API consumers across services if actions are reused.

```ts
type ActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { field?: string; message: string } };
```

---

## 93. How do you type `fetch` wrappers and tagged caches for safer revalidation?

Wrap `fetch` in a function that requires `tags` when hitting certain domains, using TypeScript overloads to enforce compile-time presence for mutating routes. Centralize tag string constants in a `cacheTags.ts` module as `as const` objects to prevent typos in `revalidateTag`. Optionally tie tags to domain entities (`user:${id}`) with helper functions. This reduces subtle stale UI caused by mis-typed tag strings in large teams. Document tag cardinality—exploding tag counts can stress cache stores.

```ts
export const tags = {
  posts: 'posts',
  post: (id: string) => `post:${id}`,
} as const;
```

---

## 94. What is the role of `satisfies` with Next `metadata` or config exports?

`satisfies` ensures objects conform to expected shapes while preserving literal types—useful for `metadata` where you want literal `title` strings for type inference but still check against `Metadata` type from `next`. It prevents drift as Next adds fields—your object must remain compatible. Apply similarly to `next.config.ts` experimental flags when using TypeScript configs. This pattern shines when combining strict typing with exhaustive checking without widening literals to `string`. Teach teammates unfamiliar with `satisfies`—it is newer in the TypeScript landscape.

```tsx
import type { Metadata } from 'next';

export const metadata = {
  title: 'About',
} satisfies Metadata;
```

---

## 95. How can generics improve reusable list/detail Server Components?

Write factory functions `createEntityLoader<Row>()` returning typed data accessors, or generic table column definitions with `keyof` constraints. Because generic default exports for React components are awkward for JSX inference, most teams keep exported components concrete and instead apply generics to props types, helpers, and factories. That pattern works well for reusable tables and list/detail shells where columns are `keyof`-driven. You still validate at runtime where data crosses the wire—generics only protect compile-time structure inside the app. Add Vitest or `tsd` checks when the contracts are security- or money-critical, and revisit types when API schemas version.

```tsx
type GridProps<T> = { rows: T[]; columns: { key: keyof T; header: string }[] };

export function Grid<T>({ rows, columns }: GridProps<T>) {
  return (
    <table>
      <thead>
        <tr>{columns.map((c) => <th key={String(c.key)}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={String(c.key)}>{String(row[c.key])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 96. What CI/CD practices reduce failed Next.js deployments?

Run `next build` in CI with the same Node version as production, execute linting, type checks, and unit tests in parallel stages, and cache `.next/cache` and package manager stores between builds for speed. Use preview deployments per PR with environment variables scoped safely—no production secrets. Gate merges on Lighthouse CI budgets for critical pages. Record bundle analyzer diffs as artifacts when thresholds regress. Blue/green or canary releases on the edge minimize blast radius. Automate database migrations separately with backward-compatible steps.

```yaml
# excerpt: GitHub Actions
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: corepack enable && pnpm i --frozen-lockfile
      - run: pnpm lint && pnpm test && pnpm build
```

---

## 97. How should environment variables be managed across `NEXT_PUBLIC_*` and server secrets?

Only prefix truly public values with `NEXT_PUBLIC_`—they embed in client bundles and are visible to users. Keep database URLs, API keys, and signing secrets server-only, referenced in Server Components/actions/route handlers. Use platform secret managers (Vercel, AWS SSM) and inject at deploy time—never commit `.env` files with secrets. Rotate keys periodically and audit access. For preview environments, use isolated databases or schemas to prevent accidental production writes. Document required env vars in a typed `env.mjs` validated with `@t3-oss/env-nextjs` or Zod.

```ts
import { z } from 'zod';

const server = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
});

export const env = server.parse(process.env);
```

---

## 98. What observability signals matter most for debugging production Next apps?

Capture request traces spanning middleware, Server Components, and downstream APIs; log structured fields (`route`, `userId`, `requestId`); monitor error rates segmented by route and deployment version; track server timing headers and TTFB distributions. Client-side, collect Web Vitals (`next/script` + `reportWebVitals` or RUM SDKs). Alert on saturation metrics—DB connections, memory, cold start rates—not just HTTP 500 counts. Correlate canary deployments with error spikes using deployment tags. Dashboards should answer: “Is it the CDN, app server, or database?” quickly.

---

## 99. How do you debug hydration mismatches when mixing Server and Client Components?

Hydration errors mean HTML differed between server and client renders—common causes include `Date.now()`, random IDs, locale drift, or browser-only APIs in shared components. Mark non-deterministic UI as client-only or gate behind `useEffect`. Ensure `suppressHydrationWarning` is used sparingly for known safe cases like timestamps. For third-party scripts altering DOM, load them client-side after mount. Compare server logs vs client console with React’s diff messages—they pinpoint mismatched nodes. Storybook SSR tests can catch some issues early.

```tsx
'use client';
import { useEffect, useState } from 'react';

export function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(new Date().toLocaleString());
  }, []);
  return <span>{now ?? '—'}</span>;
}
```

---

## 100. What production debugging workflow suits intermittent 500s on Vercel or self-hosted Node?

Start by correlating timestamps with function logs and trace IDs—Vercel and CloudWatch provide request paths and status codes; filter by dynamic routes experiencing spikes. Reproduce locally with production-like data snapshots (sanitized). Enable verbose logging temporarily behind feature flags for affected routes. Capture heap profiles if memory errors appear—serverless OOM can manifest as 500s. For database deadlocks, inspect slow query logs during incidents. Post-incident, write blameless notes and add tests or alerts for the specific failure class—intermittent issues often reflect missing idempotency or pool exhaustion rather than random noise.

---
