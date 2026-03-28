# Routing (Pages Router)

Complete notes for Next.js **Pages Router** routing: file-based URLs, dynamic segments, navigation, `next.config` routing options, custom `_app` / `_document`, and `pages/api` route handlers. Examples use **TypeScript** and domains such as e-commerce, blogs, dashboards, SaaS, and social feeds.

---

## 📑 Table of Contents

- [6.1 Pages Router Basics](#61-pages-router-basics)
  - [6.1.1 File-based Routing](#611-file-based-routing)
  - [6.1.2 Index Routes](#612-index-routes)
  - [6.1.3 Nested Routes](#613-nested-routes)
  - [6.1.4 `pages/` Directory Structure](#614-pages-directory-structure)
- [6.2 Dynamic Routes (Pages)](#62-dynamic-routes-pages)
  - [6.2.1 `[param].tsx` Syntax](#621-paramtsx-syntax)
  - [6.2.2 `useRouter` Hook](#622-userouter-hook)
  - [6.2.3 `router.query`](#623-routerquery)
  - [6.2.4 `getStaticPaths`](#624-getstaticpaths)
  - [6.2.5 Catch-all Routes `[...slug]`](#625-catch-all-routes-slug)
  - [6.2.6 Optional Catch-all `[[...slug]]`](#626-optional-catch-all-slug)
- [6.3 Navigation (Pages Router)](#63-navigation-pages-router)
  - [6.3.1 Link Component](#631-link-component)
  - [6.3.2 `useRouter` for Navigation](#632-userouter-for-navigation)
  - [6.3.3 `router.push()`](#633-routerpush)
  - [6.3.4 `router.replace()`](#634-routerreplace)
  - [6.3.5 `router.back()`](#635-routerback)
  - [6.3.6 Programmatic Navigation](#636-programmatic-navigation)
  - [6.3.7 Shallow Routing](#637-shallow-routing)
  - [6.3.8 Scroll Restoration](#638-scroll-restoration)
- [6.4 Route Configuration](#64-route-configuration)
  - [6.4.1 `redirects` in `next.config`](#641-redirects-in-nextconfig)
  - [6.4.2 `rewrites` in `next.config`](#642-rewrites-in-nextconfig)
  - [6.4.3 `headers` in `next.config`](#643-headers-in-nextconfig)
  - [6.4.4 `basePath`](#644-basepath)
  - [6.4.5 `trailingSlash`](#645-trailingslash)
  - [6.4.6 Internationalization (`i18n`)](#646-internationalization-i18n)
- [6.5 Custom App and Document](#65-custom-app-and-document)
  - [6.5.1 `_app.tsx` Purpose](#651-apptsx-purpose)
  - [6.5.2 Global Styles in `_app`](#652-global-styles-in-app)
  - [6.5.3 Layout Components in `_app`](#653-layout-components-in-app)
  - [6.5.4 `_document.tsx` Purpose](#654-documenttsx-purpose)
  - [6.5.5 Customizing HTML Structure](#655-customizing-html-structure)
  - [6.5.6 Adding Third-party Scripts](#656-adding-third-party-scripts)
- [6.6 API Routes (Pages Router)](#66-api-routes-pages-router)
  - [6.6.1 `pages/api/` Directory](#661-pagesapi-directory)
  - [6.6.2 API Route Handlers](#662-api-route-handlers)
  - [6.6.3 `req` and `res` Objects](#663-req-and-res-objects)
  - [6.6.4 HTTP Methods (GET, POST, etc.)](#664-http-methods-get-post-etc)
  - [6.6.5 API Route Middleware](#665-api-route-middleware)
  - [6.6.6 Dynamic API Routes](#666-dynamic-api-routes)
- [Topic 6 — Best Practices](#topic-6--best-practices)
- [Topic 6 — Common Mistakes to Avoid](#topic-6--common-mistakes-to-avoid)

---

## 6.1 Pages Router Basics

### 6.1.1 File-based Routing

**Beginner Level:** In the Pages Router, the folder and file names under `pages/` decide the URL. `pages/about.tsx` becomes `/about`. You do not configure a separate route table for simple sites—the **filesystem is the router**.

**Intermediate Level:** Only files that **default-export a React component** (or use data functions like `getServerSideProps`) become routes. Non-page files should live **outside** `pages/` (for example `components/`, `lib/`) so they are not exposed as URLs. The file name maps to a path segment; dynamic segments use brackets.

**Expert Level:** Next.js compiles `pages/` into a **route manifest** at build time. Special files (`_app`, `_document`, `_error`, `404`, `500`) are excluded from public URL mapping. Colocation of helpers inside `pages/` was historically possible but is discouraged—use `pageExtensions` or move utilities out to avoid accidental routes and to keep **tree-shaking** predictable.

```tsx
// pages/index.tsx — URL: /
import type { NextPage } from "next";

const HomePage: NextPage = () => {
  return (
    <main>
      <h1>E-commerce Home</h1>
    </main>
  );
};

export default HomePage;
```

#### Key Points — 6.1.1

- One default export per route file.
- URL = path under `pages/` (with rules for `index`, dynamic, and catch-all).
- Avoid accidental routes by not putting random `.tsx` files in `pages/`.

---

### 6.1.2 Index Routes

**Beginner Level:** `pages/index.tsx` is your **home page** at `/`. In a folder, `pages/shop/index.tsx` maps to `/shop`—the word `index` means “default for this folder.”

**Intermediate Level:** Index routes compose with nested folders: `pages/dashboard/index.tsx` → `/dashboard`. For a blog, `pages/blog/index.tsx` lists posts; `pages/blog/[slug].tsx` shows one post. Index files keep URLs clean without repeating `index` in the path.

**Expert Level:** When using `getStaticProps` / `getServerSideProps` on index routes, treat them like any other page. For ISR on a storefront homepage, `revalidate` on `pages/index.tsx` refreshes hero banners and featured products on a schedule without rebuilding the entire site.

```tsx
// pages/blog/index.tsx — URL: /blog
import type { InferGetStaticPropsType, NextPage } from "next";

type Post = { slug: string; title: string };

export async function getStaticProps() {
  const posts: Post[] = await fetch("https://api.example.com/posts").then((r) =>
    r.json()
  );
  return { props: { posts }, revalidate: 60 };
}

const BlogIndex: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
}) => (
  <ul>
    {posts.map((p) => (
      <li key={p.slug}>{p.title}</li>
    ))}
  </ul>
);

export default BlogIndex;
```

#### Key Points — 6.1.2

- `index.tsx` never appears in the URL.
- Use index pages for section roots (shop, blog, dashboard).

---

### 6.1.3 Nested Routes

**Beginner Level:** Nesting folders under `pages/` creates nested URLs. `pages/settings/profile.tsx` → `/settings/profile`. Think of folders as URL segments.

**Intermediate Level:** Each segment can have its own data fetching. A SaaS app might use `pages/app/billing.tsx` with SSR for authenticated account data, while `pages/app/team.tsx` uses SSG for public team marketing content—**routing structure mirrors product areas**.

**Expert Level:** Layout-like UI in the Pages Router is usually duplicated or abstracted via **wrapper components** imported into each page (unlike App Router `layout.tsx`). For large dashboards, use a shared `DashboardShell` in `_app` or per-section layouts to avoid prop drilling while keeping routes explicit.

```tsx
// pages/app/analytics.tsx — URL: /app/analytics
import type { NextPage } from "next";
import { DashboardShell } from "@/components/DashboardShell";

const AnalyticsPage: NextPage = () => (
  <DashboardShell section="analytics">
    <h1>SaaS usage metrics</h1>
  </DashboardShell>
);

export default AnalyticsPage;
```

#### Key Points — 6.1.3

- Folder depth equals URL depth (with exceptions for `api` and dynamic segments).
- Share chrome (nav, sidebars) via components, not nested `layout.tsx` (Pages Router).

---

### 6.1.4 `pages/` Directory Structure

**Beginner Level:** A minimal app has `pages/_app.tsx`, `pages/index.tsx`, and often `pages/api/hello.ts`. Static files go in `public/`, not `pages/`.

**Intermediate Level:** Organize by **feature** or **user journey**: `pages/cart`, `pages/checkout`, `pages/account`. Keep `pages/api` for HTTP endpoints. Types and fetchers live in `lib/` or `types/`.

**Expert Level:** For monorepos or large teams, enforce structure with **ESLint boundaries** and path aliases in `tsconfig.json`. Document which segments are SSG vs SSR vs CSR to prevent accidental `getServerSideProps` on high-traffic catalog pages that should be cached.

```txt
pages/
  _app.tsx
  _document.tsx
  index.tsx
  shop/
    index.tsx
    [productId].tsx
  api/
    products/
      [id].ts
  dashboard/
    index.tsx
    reports.tsx
```

#### Key Points — 6.1.4

- `public/` for assets; `pages/` only for routable pages and API handlers.
- Feature folders scale better than flat dozens of files.

---

## 6.2 Dynamic Routes (Pages)

### 6.2.1 `[param].tsx` Syntax

**Beginner Level:** Square brackets mean “this part of the URL is a variable.” `pages/products/[id].tsx` matches `/products/42` and `/products/shoes`.

**Intermediate Level:** The param is available in `getStaticProps` / `getServerSideProps` as `context.params` and on the client via `router.query` (after hydration). For TypeScript, define a `Params` type and assert safely—query values may be `string | string[]`.

**Expert Level:** Use **one dynamic segment per folder level** for clarity: `pages/u/[handle]/posts/[postId].tsx`. Prefer numeric IDs in e-commerce for stable cache keys; slug+ID combos help SEO while keeping lookups reliable. Validate params server-side before hitting the database.

```tsx
// pages/products/[productId].tsx
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";

type Params = { productId: string };

type Product = { id: string; name: string; priceCents: number };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const ids = (await fetch("https://api.example.com/product-ids").then((r) =>
    r.json()
  )) as string[];
  return {
    paths: ids.map((id) => ({ params: { productId: id } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<
  { product: Product },
  Params
> = async ({ params }) => {
  if (!params?.productId) return { notFound: true };
  const product = await fetch(
    `https://api.example.com/products/${params.productId}`
  ).then((r) => (r.ok ? r.json() : null));
  if (!product) return { notFound: true };
  return { props: { product }, revalidate: 300 };
};

const ProductPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  product,
}) => (
  <article>
    <h1>{product.name}</h1>
    <p>{(product.priceCents / 100).toFixed(2)} USD</p>
  </article>
);

export default ProductPage;
```

#### Key Points — 6.2.1

- `[param]` maps to `params.param` in data methods.
- Always handle missing/invalid `params` with `notFound` or redirects.

---

### 6.2.2 `useRouter` Hook

**Beginner Level:** `import { useRouter } from 'next/router'` gives you the current route, query string, and navigation methods. It only works in **client components** (or after mount in pages that also use SSR).

**Intermediate Level:** During SSR, `router` is not fully populated the same way as on the client for the first paint—prefer **props from `getServerSideProps`/`getStaticProps`** for critical data. Use `router.isReady` before reading `router.query` for client-only logic.

**Expert Level:** For analytics in a social app, subscribe to `routeChangeComplete` to fire pageview events with `router.asPath`. Clean up listeners on unmount. Avoid heavy work in `routeChangeStart`—it blocks perceived navigation performance.

```tsx
// components/RouteReadyGate.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";

export function RouteReadyGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(router.isReady);

  useEffect(() => {
    if (router.isReady) setReady(true);
  }, [router.isReady]);

  if (!ready) return <p>Loading route…</p>;
  return <>{children}</>;
}
```

#### Key Points — 6.2.2

- `useRouter` is Pages Router–specific (`next/router`).
- Use `router.isReady` when consuming `router.query` on first client render.

---

### 6.2.3 `router.query`

**Beginner Level:** `router.query` is an object of URL query parameters and dynamic route params. `/shop?sort=price` → `router.query.sort === 'price'`.

**Intermediate Level:** Values typed as `string | string[] | undefined` because repeated keys produce arrays. Normalize with `const sort = typeof q === "string" ? q : q?.[0]`.

**Expert Level:** **Never trust `router.query` alone for authorization.** A dashboard admin flag in the query string can be forged. Use server sessions, signed tokens, or SSR checks. For shareable filtered e-commerce URLs, treat query as **UX state** and validate against an allowlist server-side.

```tsx
import { useRouter } from "next/router";
import { useMemo } from "react";

function useListingFilters() {
  const { query, isReady } = useRouter();

  return useMemo(() => {
    if (!isReady) return { ready: false as const, sort: "newest" as const };
    const raw = query.sort;
    const sort =
      raw === "price" || raw === "rating" || raw === "newest" ? raw : "newest";
    return { ready: true as const, sort };
  }, [query.sort, isReady]);
}
```

#### Key Points — 6.2.3

- Dynamic segments appear in `query` too (Pages Router).
- Normalize types; validate on the server for security-sensitive behavior.

---

### 6.2.4 `getStaticPaths`

**Beginner Level:** For SSG dynamic routes, Next needs to know **which paths to pre-render** at build time. `getStaticPaths` returns `{ paths, fallback }`.

**Intermediate Level:** `paths` is an array of `{ params }` objects matching your `[param]` names. For a blog with 10,000 posts, you might pre-render the top 500 and use `fallback: 'blocking'` or `true` for the long tail.

**Expert Level:** Combine **ISR** (`revalidate` in `getStaticProps`) with `fallback: 'blocking'` so unknown slugs still SSR once, then cache. For a marketplace, periodically rebuild or use on-demand revalidation when sellers publish new listings.

```tsx
import type { GetStaticPaths } from "next";

type Params = { slug: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const slugs: string[] = await fetch(
    "https://cms.example.com/blog/slugs"
  ).then((r) => r.json());

  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
};
```

#### Key Points — 6.2.4

- Required for dynamic SSG pages (unless using `fallback` strategies intentionally).
- `fallback` choice drives UX for unbuilt paths.

---

### 6.2.5 Catch-all Routes `[...slug]`

**Beginner Level:** `[...slug].tsx` matches **multiple** segments: `/docs/a`, `/docs/a/b`. The param is an **array** of strings.

**Intermediate Level:** Use for **CMS-driven** pages, documentation trees, or marketing site paths owned by a headless CMS. `getStaticPaths` can return `{ params: { slug: ['intro', 'install'] } }`.

**Expert Level:** Implement **breadcrumb** generation from `slug` segments and validate each segment against a CMS manifest to avoid open redirects or path traversal issues. Cache aggressively if content is public.

```tsx
// pages/docs/[...slug].tsx
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";

type Params = { slug: string[] };

export async function getStaticPaths() {
  return {
    paths: [
      { params: { slug: ["getting-started"] } },
      { params: { slug: ["api", "auth"] } },
    ],
    fallback: "blocking",
  };
}

export const getStaticProps: GetStaticProps<
  { title: string },
  Params
> = async ({ params }) => {
  const path = params?.slug?.join("/") ?? "";
  const doc = await fetch(`https://cms.example.com/docs/${path}`).then((r) =>
    r.json()
  );
  return { props: { title: doc.title }, revalidate: 600 };
};

const DocPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  title,
}) => <h1>{title}</h1>;

export default DocPage;
```

#### Key Points — 6.2.5

- Catch-all params are **string arrays** in `params`.
- Great for hierarchical content (docs, multi-level categories).

---

### 6.2.6 Optional Catch-all `[[...slug]]`

**Beginner Level:** Double brackets `[[...slug]].tsx` match **zero or more** segments. One file can serve `/help`, `/help/faq`, and `/help/legal/privacy`.

**Intermediate Level:** Use when a single page component handles a **whole subtree** with shared layout logic—common for help centers or static site generators feeding Next.

**Expert Level:** Beware **SEO**: multiple URLs may show similar content—add canonical links and structured data. For a SaaS knowledge base, map empty slug to a landing grid and deeper slugs to articles, all with ISR.

```tsx
// pages/help/[[...slug]].tsx
import type { NextPage } from "next";
import { useRouter } from "next/router";

const HelpHub: NextPage = () => {
  const router = useRouter();
  const segments = router.query.slug;
  const path =
    !segments || Array.isArray(segments) ? segments?.join("/") ?? "" : segments;

  return (
    <main>
      <h1>Help center</h1>
      <p>Path: {path || "(home)"}</p>
    </main>
  );
};

export default HelpHub;
```

#### Key Points — 6.2.6

- Optional catch-all includes the **index** of that route level.
- Watch for duplicate content SEO issues; use canonical URLs.

---

## 6.3 Navigation (Pages Router)

### 6.3.1 Link Component

**Beginner Level:** `next/link` wraps anchors for **client-side navigation** between pages without full reloads. E-commerce category links should use `<Link href="/shop/shoes">`.

**Intermediate Level:** `Link` **prefetches** visible routes in production (default) for faster transitions. Pass `prefetch={false}` for rarely used or personalized URLs (e.g., `/account/orders/[secretId]`).

**Expert Level:** Use **dynamic `href`** objects for complex routes and centralize URL builders (`lib/routes.ts`) so marketing and app routes stay consistent across environments (`basePath`, locale).

```tsx
import Link from "next/link";

export function ProductCard(props: { id: string; name: string }) {
  return (
    <Link
      href={{ pathname: "/shop/[productId]", query: { productId: props.id } }}
      legacyBehavior
    >
      <a className="card">{props.name}</a>
    </Link>
  );
}
```

> **Note:** On Next.js 13+ you can often omit `legacyBehavior` and the inner `<a>`; match your project’s version and docs.

#### Key Points — 6.3.1

- Prefer `Link` over raw `<a>` for internal navigation.
- Control prefetch for sensitive or huge pages.

---

### 6.3.2 `useRouter` for Navigation

**Beginner Level:** Beyond reading state, `useRouter()` exposes `push`, `replace`, `back`, etc., for **imperative** navigation when something happens (form success, logout).

**Intermediate Level:** Combine with **Next.js data fetching**: after creating a post, `router.push('/blog/' + slug)` while showing toast UI. Use `shallow` routing when only query changes and you want to avoid full data refetch (Pages Router).

**Expert Level:** For checkout, orchestrate **multi-step flows** with query or session state; use `replace` to prevent users returning to a payment step via back button when that would duplicate charges (pair with server idempotency keys).

```tsx
import { useRouter } from "next/router";

export function useCheckoutRedirect() {
  const router = useRouter();
  return async (orderId: string) => {
    await router.replace({
      pathname: "/checkout/confirm",
      query: { orderId },
    });
  };
}
```

#### Key Points — 6.3.2

- Imperative navigation complements declarative `Link`.
- Choose `push` vs `replace` based on history semantics.

---

### 6.3.3 `router.push()`

**Beginner Level:** Adds a new history entry and navigates: `router.push('/dashboard')`.

**Intermediate Level:** Signature supports string URLs or object `{ pathname, query }`. For typed apps, wrap in a helper that accepts allowed route names (discriminated union).

**Expert Level:** Handle **errors** and **aborted navigations** in analytics; `router.push` returns a Promise (Next 12.2+). For social “compose post” flows, defer `push` until media upload completes to avoid losing draft state.

```tsx
import type { NextRouter } from "next/router";

type AppRoutes =
  | { name: "feed"; query?: { tab?: "foryou" | "following" } }
  | { name: "profile"; query: { handle: string } };

export function navigate(router: NextRouter, route: AppRoutes) {
  switch (route.name) {
    case "feed":
      return router.push({
        pathname: "/feed",
        query: { tab: route.query?.tab },
      });
    case "profile":
      return router.push({
        pathname: "/u/[handle]",
        query: { handle: route.query.handle },
      });
  }
}
```

#### Key Points — 6.3.3

- `push` keeps prior page in history (back button works).
- Prefer typed route builders in large apps.

---

### 6.3.4 `router.replace()`

**Beginner Level:** Like `push`, but **replaces** the current history entry—user cannot go “back” to the replaced page.

**Intermediate Level:** Use after **login redirect** from `/login?next=/dashboard` to `/dashboard` so the back button does not return to login. OAuth callbacks often use `replace`.

**Expert Level:** In password-reset flows, `replace` intermediate token URLs to avoid token leakage via history on shared devices. Log security-sensitive transitions server-side.

```tsx
import { useRouter } from "next/router";
import { useEffect } from "react";

export function PostLoginRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    void router.replace(to);
  }, [router, to]);
  return null;
}
```

#### Key Points — 6.3.4

- Replace when the prior URL should not remain in history.
- Common for auth and token-handling routes.

---

### 6.3.5 `router.back()`

**Beginner Level:** Goes back one step in browser history, like clicking the browser back button.

**Intermediate Level:** If there is no history, behavior may no-op or leave the user on the same page—**guard** with your own fallback route (`router.push('/shop')`).

**Expert Level:** Mobile social apps often map Android back to `router.back()` with a custom stack; ensure modal routes use shallow routing or parallel state so back closes modals before leaving the page.

```tsx
import { useRouter } from "next/router";

export function SmartBack({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          void router.back();
        } else {
          void router.push(fallbackHref);
        }
      }}
    >
      Back
    </button>
  );
}
```

#### Key Points — 6.3.5

- `back` is history-dependent; provide fallbacks.
- Test embedded webviews where history length differs.

---

### 6.3.6 Programmatic Navigation

**Beginner Level:** Any navigation triggered by code (click handlers, timers) instead of `<Link>` is **programmatic**.

**Intermediate Level:** Batch **state updates** before navigation to avoid flicker: set React state, then `router.push`. For dashboards, prefetch data with SWR/React Query on hover of table rows before navigating.

**Expert Level:** For enterprise SaaS, centralize navigation in a **router service** that enforces entitlements (e.g., cannot navigate to `/billing` without `billing:read`). Still enforce permissions on the server.

```tsx
import { useRouter } from "next/router";

export function useEntitledNavigation() {
  const router = useRouter();
  return (path: string, allowed: boolean) => {
    if (!allowed) {
      void router.push("/403");
      return;
    }
    void router.push(path);
  };
}
```

#### Key Points — 6.3.6

- Programmatic navigation is essential for wizards and post-mutation redirects.
- Always duplicate access control on the server.

---

### 6.3.7 Shallow Routing

**Beginner Level:** Shallow routing updates the URL **without** running `getServerSideProps`, `getStaticProps`, or `getInitialProps` again—useful for toggling UI state in the query string.

**Intermediate Level:** Call `router.push({ pathname, query }, undefined, { shallow: true })` (Pages Router). Good for **filter chips** on a product listing.

**Expert Level:** Ensure **SEO-sensitive** pages still render meaningful content on first load—shallow updates are client-only after hydration. For analytics dashboards, shallow routing can sync chart state to URL for shareable views without refetching heavy SSR props.

```tsx
import { useRouter } from "next/router";

export function FilterBar() {
  const router = useRouter();
  const setBrand = (brand: string) => {
    void router.push(
      { pathname: router.pathname, query: { ...router.query, brand } },
      undefined,
      { shallow: true }
    );
  };
  return (
    <div>
      <button type="button" onClick={() => setBrand("acme")}>
        Acme
      </button>
    </div>
  );
}
```

#### Key Points — 6.3.7

- Shallow routing skips data fetching methods on navigation.
- Great for client-only filter/sort state mirrored in the URL.

---

### 6.3.8 Scroll Restoration

**Beginner Level:** Next.js scrolls to top on route changes by default (unlike some SPAs). Users expect new pages to start at the top.

**Intermediate Level:** Disable auto scroll with `<Link scroll={false}>` when preserving scroll is better (e.g., tabbed content with parallel routes pattern approximations in Pages Router).

**Expert Level:** For infinite social feeds, store **scroll position** in `sessionStorage` keyed by `asPath` and restore on `routeChangeComplete`. Coordinate with virtualized lists (react-window) to avoid jank.

```tsx
import Link from "next/link";

export function FeedItemLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link href={props.href} scroll={false}>
      {props.children}
    </Link>
  );
}
```

#### Key Points — 6.3.8

- Default scroll-to-top improves UX for most sites.
- Opt out when you implement custom restoration (feeds, modals).

---

## 6.4 Route Configuration

### 6.4.1 `redirects` in `next.config`

**Beginner Level:** Redirects send users from one path to another (301/302/307/308). Use when renaming `/store` to `/shop`.

**Intermediate Level:** Configure in `next.config.js` `async redirects()` returning an array of `{ source, destination, permanent }`. Supports **dynamic segments** and patterns.

**Expert Level:** For an e-commerce domain migration, use **308 permanent** redirects to preserve SEO equity. Combine with **middleware** for A/B tests only when you need request-time decisions; static redirects are cheaper at the edge.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/old-blog/:slug*", destination: "/blog/:slug*", permanent: true },
      { source: "/wp-admin", destination: "/404", permanent: false },
    ];
  },
};

export default nextConfig;
```

#### Key Points — 6.4.1

- Prefer config redirects for stable, known rules.
- `permanent` maps to 308 vs 307 behavior in Next.

---

### 6.4.2 `rewrites` in `next.config`

**Beginner Level:** Rewrites map an incoming URL to a **different internal path** without changing the browser URL—useful for masking legacy backends.

**Intermediate Level:** Split marketing and app: external users see `/features`, internally served by `/marketing/features`. Rewrites can proxy to external URLs (`destination: 'https://api.example.com/:path*'`).

**Expert Level:** For a **BFF** pattern, rewrite `/api/v2/:path*` to a Route Handler or server to hide origin URLs. Document rewrite chains carefully—debugging 404s becomes harder when URLs do not match files.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [{ source: "/docs", destination: "/help/introduction" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
```

#### Key Points — 6.4.2

- Rewrites are transparent to the user (URL stays the same).
- Useful for incremental migrations and proxies.

---

### 6.4.3 `headers` in `next.config`

**Beginner Level:** Add HTTP headers to matching routes—security headers, caching, or CORS for APIs.

**Intermediate Level:** Return `{ source, headers: [{ key, value }] }` from `async headers()`. Combine with `has` / `missing` (Next 12.2+) for conditional rules.

**Expert Level:** Set **Content-Security-Policy**, **HSTS**, and **Permissions-Policy** for SaaS dashboards. Align with CDN settings (Vercel) to avoid duplicate/conflicting headers.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### Key Points — 6.4.3

- Headers apply per pattern; order matters with overlapping rules.
- Security headers belong in config + edge middleware for auth-specific cases.

---

### 6.4.4 `basePath`

**Beginner Level:** Host the app under a subpath like `https://example.com/docs` by setting `basePath: '/docs'`.

**Intermediate Level:** All `Link` `href`s and `router.push` paths should **include** `basePath` automatically—Next prefixes them. Assets in `public/` are also prefixed.

**Expert Level:** For enterprise deployments behind **reverse proxies**, align `basePath` with ingress rules and cookie paths. Update sitemap generators and canonical URLs accordingly.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/acme-app",
};

export default nextConfig;
```

#### Key Points — 6.4.4

- `basePath` affects routing, static files, and `next/image` in many setups.
- Test absolute URLs in emails—they must include the subpath.

---

### 6.4.5 `trailingSlash`

**Beginner Level:** `trailingSlash: true` makes routes use `/about/` instead of `/about`.

**Intermediate Level:** Choose one style for **SEO consistency**; mix-ups create duplicate URLs—pair with redirects. Static hosts may prefer trailing slashes.

**Expert Level:** CDNs and **canonical** tags should match your choice. Some integrations (OAuth callbacks) are sensitive to exact redirect URI matching—update provider configs when toggling.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
};

export default nextConfig;
```

#### Key Points — 6.4.5

- Pick trailing slash or not; enforce with redirects + canonical.
- External integrations must use exact callback URLs.

---

### 6.4.6 Internationalization (`i18n`)

**Beginner Level:** Pages Router has built-in **locale subpaths** or domains via `i18n` in `next.config`.

**Intermediate Level:** Configure `locales`, `defaultLocale`, and optional `domains`. `useRouter` exposes `router.locale`, `locales`, and `defaultLocale`.

**Expert Level:** For large e-commerce, combine **hreflang**, localized slugs, and CMS translations. App Router projects often prefer custom `[lang]` segments—Pages `i18n` is legacy but still production-viable.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "fr", "de"],
    defaultLocale: "en",
    localeDetection: true,
  },
};

export default nextConfig;
```

```tsx
import Link from "next/link";
import { useRouter } from "next/router";

export function LocaleSwitcher() {
  const router = useRouter();
  return (
    <div>
      {router.locales?.map((loc) => (
        <Link key={loc} href={router.asPath} locale={loc}>
          {loc.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
```

#### Key Points — 6.4.6

- Built-in i18n routing is Pages Router–centric.
- Always translate metadata and structured data for SEO.

---

## 6.5 Custom App and Document

### 6.5.1 `_app.tsx` Purpose

**Beginner Level:** `_app.tsx` wraps **every page**. Put global providers (theme, auth context) and layouts here.

**Intermediate Level:** Receives `Component` and `pageProps`. Data fetching results from pages flow through `pageProps`. Keep `_app` mostly **composition**—heavy logic belongs in providers or middleware.

**Expert Level:** For SaaS, initialize **telemetry**, **error boundaries**, and **feature flags** once. Avoid blocking renders—lazy load non-critical providers.

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
}
```

#### Key Points — 6.5.1

- `_app` runs on every page navigation (client-side too).
- Use for cross-cutting concerns, not page-specific data fetching.

---

### 6.5.2 Global Styles in `_app`

**Beginner Level:** Import `styles/globals.css` once in `_app.tsx` so Tailwind or reset CSS applies everywhere.

**Intermediate Level:** Order matters: **CSS reset**, then **tokens**, then **component styles**. Avoid importing page-specific CSS here.

**Expert Level:** For design systems, expose **CSS variables** for theming and load fonts via `next/font` in `_app` (preferred over raw `<link>` when possible).

```tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

#### Key Points — 6.5.2

- Global imports belong in `_app` exactly once.
- Keep global CSS small to reduce bundle and specificity wars.

---

### 6.5.3 Layout Components in `_app`

**Beginner Level:** Wrap pages with a `Layout` that renders nav + footer for marketing sites.

**Intermediate Level:** Use **per-page layouts** pattern: pages export optional `getLayout` (custom convention) to compose dashboards vs minimal auth layouts.

**Expert Level:** Typed `getLayout` pattern scales for large teams—each page opts into a layout without prop drilling through `_app`.

```tsx
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(<Component {...pageProps} />);
}
```

#### Key Points — 6.5.3

- `_app` is the hook point for layout composition.
- `getLayout` is a community pattern—not built into Next like App Router layouts.

---

### 6.5.4 `_document.tsx` Purpose

**Beginner Level:** `_document.tsx` customizes the **outer HTML shell** (`<Html>`, `<Head>`, `<body>`). Use for things that apply to all pages but are **not React tree** per page.

**Intermediate Level:** Only `getInitialProps` in `_document` (special case). Do **not** use browser APIs here—this runs on the server.

**Expert Level:** Inject **lang** attributes per locale, preconnect hints, and **structured meta** that must exist outside individual pages. Keep `_document` minimal—most metadata should use `next/head` or App Router metadata API when migrating.

```tsx
// pages/_document.tsx
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

#### Key Points — 6.5.4

- `_document` is server-only; no `useEffect`.
- Do not add application state here.

---

### 6.5.5 Customizing HTML Structure

**Beginner Level:** Add classes on `<body>` for theme (e.g., `dark`) or split testing.

**Intermediate Level:** Ensure **accessibility**: `lang`, skip links, focus outlines. Social apps may inject **portals** roots for modals.

**Expert Level:** Coordinate with **CSP nonces** (advanced) if inline scripts are required—Next has patterns involving middleware and custom document rendering.

```tsx
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-app="dashboard">
      <Head />
      <body className="antialiased bg-neutral-950 text-neutral-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

#### Key Points — 6.5.5

- Structure changes affect every page—test thoroughly.
- Prefer `next/script` over raw tags when adding scripts.

---

### 6.5.6 Adding Third-party Scripts

**Beginner Level:** Use `next/script` in `_app` or pages with strategies `afterInteractive`, `lazyOnload`.

**Intermediate Level:** For analytics in e-commerce, load non-critical scripts **lazily** to protect Core Web Vitals. Use `onLoad` callbacks to initialize trackers.

**Expert Level:** For **consent management** (GDPR), gate script loading behind a client provider; consider Tag Manager server-side tagging for production privacy posture.

```tsx
import type { AppProps } from "next/app";
import Script from "next/script";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"
        strategy="afterInteractive"
      />
    </>
  );
}
```

#### Key Points — 6.5.6

- `next/script` deduplicates and controls load order.
- Defer third parties that are not needed for first paint.

---

## 6.6 API Routes (Pages Router)

### 6.6.1 `pages/api/` Directory

**Beginner Level:** Files in `pages/api/` become HTTP endpoints: `pages/api/hello.ts` → `/api/hello`.

**Intermediate Level:** API routes run **server-side**—safe to use secrets and databases. They are **not** React components.

**Expert Level:** For high-scale SaaS, prefer **Route Handlers** in App Router for streaming and modern APIs, but Pages `api` remains valid. Split **public** vs **admin** namespaces (`/api/public`, `/api/internal`) and protect with middleware.

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from "next";

type HealthResponse = { ok: true; service: string };

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({ ok: true, service: "checkout" });
}
```

#### Key Points — 6.6.1

- `pages/api` maps to `/api/*`.
- Use for backends-for-frontend and webhooks.

---

### 6.6.2 API Route Handlers

**Beginner Level:** Default export a function `(req, res) => void | Promise<void>`.

**Intermediate Level:** Branch on `req.method` for REST semantics. Send JSON with `res.status().json()`.

**Expert Level:** Wrap handlers with **error middleware** that maps thrown errors to stable JSON `{ code, message }` and logs stack traces server-side only.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

type CartBody = { items: { sku: string; qty: number }[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
  const body = req.body as CartBody;
  return res.status(200).json({ cartId: "cart_123" });
}
```

#### Key Points — 6.6.2

- One default export per API file (unless using route config object + helpers).
- Always set status codes explicitly.

---

### 6.6.3 `req` and `res` Objects

**Beginner Level:** `req` has URL, method, headers, body; `res` sends the response.

**Intermediate Level:** For JSON, ensure `bodyParser` (enabled by default) size limits fit uploads—or disable and use raw body for **Stripe webhooks**.

**Expert Level:** Type narrow with **Zod** after parsing. For cookie sessions, read signed cookies on `req` and set `Set-Cookie` on `res` with `httpOnly`, `secure`, `sameSite`.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const QuerySchema = z.object({ userId: z.string().uuid() });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "bad_query" });
  return res.status(200).json({ userId: parsed.data.userId });
}
```

#### Key Points — 6.6.3

- `req.query` values are strings or string arrays.
- Disable body parsing when verifying raw webhook signatures.

---

### 6.6.4 HTTP Methods (GET, POST, etc.)

**Beginner Level:** Check `req.method` and respond accordingly.

**Intermediate Level:** Return **405** with `Allow` header for unsupported methods—helps API clients and SEO crawlers.

**Expert Level:** Implement **idempotent** PUT handlers for CMS sync from dashboard apps; use POST for commands with side effects. Document your API versioning scheme.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return res.status(200).json({ items: [] });
    case "POST":
      return res.status(201).json({ created: true });
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end();
  }
}
```

#### Key Points — 6.6.4

- Enforce method allowlists per endpoint.
- Use correct semantics for caches (GET only where appropriate).

---

### 6.6.5 API Route Middleware

**Beginner Level:** Compose small functions that wrap the handler to parse auth, log requests, etc.

**Intermediate Level:** Pattern: `withAuth(handler)`, `withCors(handler)`—return async functions that validate then call inner handler.

**Expert Level:** For rate limiting on social **write APIs**, use Edge middleware + Redis (Upstash) counters; keep Pages API thin and delegate to services.

```typescript
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export function withBearerAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    (req as NextApiRequest & { token: string }).token = token;
    return handler(req, res);
  };
}
```

#### Key Points — 6.6.5

- Middleware wrappers keep handlers small and testable.
- Share auth logic between API routes via `lib/auth.ts`.

---

### 6.6.6 Dynamic API Routes

**Beginner Level:** `pages/api/post/[id].ts` exposes `/api/post/:id` via `req.query.id`.

**Intermediate Level:** Validate IDs before DB calls. Return **404** for unknown resources.

**Expert Level:** For multi-tenant SaaS, include **tenantId** in path or subdomain routing resolved in middleware, and scope DB queries with composite keys—never trust a bare ID.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string")
    return res.status(400).json({ error: "invalid_id" });
  return res.status(200).json({ postId: id, title: "Example" });
}
```

#### Key Points — 6.6.6

- Dynamic segments live in `req.query`.
- Validate and authorize before returning data.

---

### Supplement: Pages Router vs App Router (routing mental model)

**Beginner Level:** Pages Router = one React tree per page file under `pages/`. App Router = nested `layout.tsx` + `page.tsx` under `app/`.

**Intermediate Level:** When you **migrate**, keep URL parity using rewrites or parallel hosting until cutover. E-commerce often migrates catalog (SSG) first, then account (SSR).

**Expert Level:** Instrument **404 rates** and **redirect chains** during migration; use staged rollouts and feature flags for high-risk routes (checkout, auth).

```typescript
// types/routes.ts — shared path constants for dual-router migration
export const ROUTES = {
  product: (id: string) => `/products/${id}`,
  dashboard: "/dashboard",
} as const;
```

#### Key Points — Supplement

- Treat routing as a **product contract** with SEO and analytics implications.
- Path constants prevent drift between routers and marketing links.

---

### Supplement: Testing routes and navigation (E2E angle)

**Beginner Level:** Click `Link` in Playwright and assert URL changes: `await page.click('a[href="/shop"]')`.

**Intermediate Level:** Stub **Next data** responses in integration tests when testing navigation in isolation.

**Expert Level:** Contract-test **rewrites/redirects** in CI with snapshot HTTP checks against staging.

```typescript
// playwright: e-commerce smoke
// await page.goto("/");
// await page.getByRole("link", { name: "Shoes" }).click();
// await expect(page).toHaveURL(/\/shop\/shoes/);
```

#### Key Points — Testing

- Test **critical paths**: checkout, login, password reset.
- Include **locale/basePath** variants if enabled.

---

## Topic 6 — Best Practices

- Prefer **explicit folder structure** that matches product areas (shop, blog, dashboard).
- Use **`getStaticProps` + ISR** for catalog-style pages; **`getServerSideProps`** for highly personalized or auth-gated views.
- Centralize **URL builders** and respect **`basePath` / `i18n`** in links.
- Keep **`_app` thin**; use layout composition patterns for divergent chrome.
- Treat **`_document` as static shell** only—no application state.
- For APIs, **validate input**, return consistent error shapes, and **never expose secrets** to the client.
- Add **monitoring** for slow SSR pages and API routes; correlate with **navigation timing** in the browser.

---

## Topic 6 — Common Mistakes to Avoid

- Putting **non-page components** inside `pages/` and accidentally creating routes.
- Trusting **`router.query`** for security or assuming it is always defined on first render.
- Using **`shallow: true`** and expecting SSR data functions to re-run.
- Adding **heavy global providers** in `_app` that slow every page.
- Using **`_document` for data fetching** or browser APIs.
- Forgetting **`export const config = { api: { bodyParser: false } }`** when verifying signed webhook payloads.
- Misconfiguring **`redirects` vs `rewrites`** and debugging the wrong layer.
- Shipping **duplicate locales or trailing slash variants** without canonical URLs.

---

*These notes align with the Pages Router model in Next.js. When starting new projects, evaluate the App Router for nested layouts and Server Components, while keeping Pages Router patterns for maintenance of existing codebases.*
