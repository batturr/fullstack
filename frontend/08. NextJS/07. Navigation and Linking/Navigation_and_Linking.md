# Navigation and Linking

How users **move between routes** in Next.js using `next/link`, the Pages Router `useRouter`, App Router navigation hooks, and common UI patterns (active links, breadcrumbs, tabs, guards). Examples span **e-commerce**, **blogs**, **dashboards**, **SaaS**, and **social** apps with **TypeScript**.

---

## 📑 Table of Contents

- [7.1 Link Component](#71-link-component)
  - [7.1.1 `next/link` Basics](#711-nextlink-basics)
  - [7.1.2 `href` Prop](#712-href-prop)
  - [7.1.3 Dynamic `href`](#713-dynamic-href)
  - [7.1.4 `prefetch` Prop](#714-prefetch-prop)
  - [7.1.5 `replace` Prop](#715-replace-prop)
  - [7.1.6 `scroll` Prop](#716-scroll-prop)
  - [7.1.7 `shallow` Prop (Pages Router)](#717-shallow-prop-pages-router)
  - [7.1.8 Link with `children`](#718-link-with-children)
- [7.2 `useRouter` Hook (Pages Router)](#72-userouter-hook-pages-router)
  - [7.2.1 `useRouter` Overview](#721-userouter-overview)
  - [7.2.2 `router.pathname`](#722-routerpathname)
  - [7.2.3 `router.query`](#723-routerquery)
  - [7.2.4 `router.asPath`](#724-routeraspath)
  - [7.2.5 `router.push()`](#725-routerpush)
  - [7.2.6 `router.replace()`](#726-routerreplace)
  - [7.2.7 `router.back()`](#727-routerback)
  - [7.2.8 `router.reload()`](#728-routerreload)
- [7.3 App Router Navigation Hooks](#73-app-router-navigation-hooks)
  - [7.3.1 `usePathname`](#731-usepathname)
  - [7.3.2 `useSearchParams`](#732-usesearchparams)
  - [7.3.3 `useParams`](#733-useparams)
  - [7.3.4 `useSelectedLayoutSegment`](#734-useselectedlayoutsegment)
  - [7.3.5 `useSelectedLayoutSegments`](#735-useselectedlayoutsegments)
- [7.4 Navigation Patterns](#74-navigation-patterns)
  - [7.4.1 Active Link Styling](#741-active-link-styling)
  - [7.4.2 Breadcrumb Navigation](#742-breadcrumb-navigation)
  - [7.4.3 Tab Navigation](#743-tab-navigation)
  - [7.4.4 Navigation Guards](#744-navigation-guards)
  - [7.4.5 Progress Indicators](#745-progress-indicators)
  - [7.4.6 Scroll to Top](#746-scroll-to-top)
- [Topic 7 — Best Practices](#topic-7--best-practices)
- [Topic 7 — Common Mistakes to Avoid](#topic-7--common-mistakes-to-avoid)

---

## 7.1 Link Component

### 7.1.1 `next/link` Basics

**Beginner Level:** `Link` turns internal anchors into **fast client-side transitions** without reloading the whole page—like flipping between **shop categories** instantly.

**Intermediate Level:** `Link` integrates with the Next.js **router and prefetching** pipeline. In the App Router, it targets file-system routes under `app/`; in the Pages Router, it targets `pages/`.

**Expert Level:** Understand version differences: older Next required `legacyBehavior` + child `<a>`; newer versions can style the `Link` directly. Audit **accessibility**: focus rings, `aria-current` for active states, and keyboard navigation.

```tsx
import Link from "next/link";

export function ShopHomeLink() {
  return (
    <Link href="/shop" className="underline">
      Browse catalog
    </Link>
  );
}
```

#### Key Points — 7.1.1

- Use `next/link` for **internal** navigation.
- Match **Next version** docs for `legacyBehavior` / child `<a>` rules.

---

### 7.1.2 `href` Prop

**Beginner Level:** `href` is the destination path: `/blog`, `/product/123`.

**Intermediate Level:** `href` accepts strings or URL objects. With **dynamic routes**, use templates or objects with `pathname` + `query` (Pages Router) or string interpolation for App Router segments.

**Expert Level:** Centralize `href` construction in **`lib/routes.ts`** with typed helpers so `basePath`, **locales**, and **campaign query params** stay consistent across email, push, and in-app links.

```typescript
// lib/routes.ts
export const routes = {
  product: (id: string) => `/products/${id}`,
  post: (slug: string) => `/blog/${slug}`,
} as const;
```

```tsx
import Link from "next/link";
import { routes } from "@/lib/routes";

export function ProductLink({ id, name }: { id: string; name: string }) {
  return <Link href={routes.product(id)}>{name}</Link>;
}
```

#### Key Points — 7.1.2

- Prefer **typed route builders** in large apps.
- Keep **external** URLs as normal `<a rel="noopener">` for third-party sites.

---

### 7.1.3 Dynamic `href`

**Beginner Level:** Build URLs from variables: `` href={`/u/${handle}`} `` for a **social profile**.

**Intermediate Level:** For Pages Router dynamic routes, `href={{ pathname: '/post/[id]', query: { id } }}` keeps param names aligned with the file name `[id].tsx`.

**Expert Level:** For **App Router**, dynamic segments are usually plain strings: `/users/${userId}`. Pair with **`generateStaticParams`** for static shells. Avoid string concatenation without encoding user input—use `encodeURIComponent` for opaque ids when they appear in query strings.

```tsx
import Link from "next/link";

export function ProfileLink({ handle }: { handle: string }) {
  const safe = encodeURIComponent(handle);
  return <Link href={`/u/${safe}`}>@{handle}</Link>;
}
```

#### Key Points — 7.1.3

- Encode untrusted segments when needed.
- Align param names with route files.

---

### 7.1.4 `prefetch` Prop

**Beginner Level:** Prefetch downloads route code **ahead of time** so clicks feel instant—great for **e-commerce** category grids.

**Intermediate Level:** Default prefetch is **true in production** for `Link` in viewport. Set `prefetch={false}` for **personalized** or **low-hit** pages (account settings, one-time invoices).

**Expert Level:** For **SaaS** with huge lazy routes, combine `prefetch={false}` with **manual `router.prefetch`** on hover/focus for power users. Monitor **CDN and RSC payload** costs if prefetching aggressively on mobile.

```tsx
import Link from "next/link";

export function PrivateInvoiceLink({ id }: { id: string }) {
  return (
    <Link href={`/account/invoices/${id}`} prefetch={false}>
      View invoice
    </Link>
  );
}
```

#### Key Points — 7.1.4

- Prefetch improves perceived performance; disable for sensitive/heavy routes.
- App Router prefetch semantics may differ slightly—verify against your Next version.

---

### 7.1.5 `replace` Prop

**Beginner Level:** When `replace` is true, navigation **swaps the history entry** instead of pushing—similar to `router.replace`.

**Intermediate Level:** Use for **temporary steps** you do not want in history (some wizard UIs)—but often you still prefer imperative `router.replace` after mutations.

**Expert Level:** For **auth flows**, prefer server redirects for security; client `replace` is UX polish. Test **browser back** behavior with `replace` on mobile webviews.

```tsx
import Link from "next/link";

export function SkipOnboardingLink() {
  return (
    <Link href="/dashboard" replace>
      Skip for now
    </Link>
  );
}
```

#### Key Points — 7.1.5

- `replace` affects **history stack**.
- Pair with server-side redirects for canonical URLs.

---

### 7.1.6 `scroll` Prop

**Beginner Level:** `scroll={false}` prevents scrolling to the top on navigation—handy when you manage scroll yourself.

**Intermediate Level:** Use for **tabs** or **modal-like** experiences in hybrid setups. Default **scroll reset** is usually what you want for standard page changes.

**Expert Level:** For **social feeds**, combine `scroll={false}` with **sessionStorage** restoration and virtualized lists; measure **CLS** and **INP** when experimenting.

```tsx
import Link from "next/link";

export function SameScrollSectionLink(props: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={props.href} scroll={false}>
      {props.children}
    </Link>
  );
}
```

#### Key Points — 7.1.6

- Default: scroll to top.
- Opt out only with a deliberate scroll strategy.

---

### 7.1.7 `shallow` Prop (Pages Router)

**Beginner Level:** Shallow navigation updates the URL **without re-running** `getServerSideProps` / `getStaticProps` (Pages Router).

**Intermediate Level:** Ideal for **filter state** in query strings on listing pages. Not applicable the same way in App Router—use **client state** + `useSearchParams` patterns instead.

**Expert Level:** Ensure **first load** still renders SEO content; shallow is a **client continuation** pattern. Document for your team to avoid confusion during App Router migration.

```tsx
import Link from "next/link";

export function BrandFilterLink({
  brand,
  pathname,
  query,
}: {
  brand: string;
  pathname: string;
  query: Record<string, string | string[] | undefined>;
}) {
  return (
    <Link
      href={{ pathname, query: { ...query, brand } }}
      shallow
      legacyBehavior
    >
      <a>{brand}</a>
    </Link>
  );
}
```

#### Key Points — 7.1.7

- **Pages Router** concept; verify support in your Next version.
- Do not rely on shallow routing for **security boundaries**.

---

### 7.1.8 Link with `children`

**Beginner Level:** Put text or components inside `Link`: `<Link href="/">Home</Link>`.

**Intermediate Level:** You can wrap **cards** or **images**—ensure **one interactive target** and keyboard focus works. Avoid nesting interactive elements (`button` inside `a`).

**Expert Level:** For **dashboard tiles**, use `className` on `Link` and consistent **focus-visible** styles. With **RSC**, remember client boundaries if children are Client Components.

```tsx
import Link from "next/link";
import Image from "next/image";

export function ProductCard(props: {
  id: string;
  title: string;
  imageUrl: string;
}) {
  return (
    <Link
      href={`/products/${props.id}`}
      className="block rounded-lg border p-4 hover:border-blue-500 focus-visible:outline focus-visible:outline-2"
    >
      <Image src={props.imageUrl} alt="" width={320} height={200} />
      <h3 className="mt-2 font-semibold">{props.title}</h3>
    </Link>
  );
}
```

#### Key Points — 7.1.8

- No nested buttons/links.
- Whole-card links are fine if accessibility is preserved.

---

## 7.2 `useRouter` Hook (Pages Router)

### 7.2.1 `useRouter` Overview

**Beginner Level:** `useRouter` from `next/router` reads the **current URL** and exposes **navigation methods** on the client.

**Intermediate Level:** Do not import `useRouter` from `next/navigation` in Pages Router code—that is for App Router. Mixing them causes confusion and bugs.

**Expert Level:** Instrument router events for **analytics** (`routeChangeComplete`) and **performance** (long tasks during transitions). Guard SSR: router APIs are **browser-oriented** except where documented.

```tsx
"use client";

import { useRouter } from "next/router";

export function LoginButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => void router.push("/login")}>
      Log in
    </button>
  );
}
```

#### Key Points — 7.2.1

- Pages Router: `next/router`.
- App Router navigation: `next/navigation`.

---

### 7.2.2 `router.pathname`

**Beginner Level:** `pathname` is the route pattern: `/products/[id]` rather than the literal URL.

**Intermediate Level:** Use `pathname` for **matching** active navigation items independent of query strings.

**Expert Level:** For **i18n**, `pathname` excludes locale prefix in some configurations—verify with your `next.config`. Combine with `asPath` when you need the full user-facing path.

```tsx
import Link from "next/link";
import { useRouter } from "next/router";

export function NavItem({ href, label }: { href: string; label: string }) {
  const { pathname } = useRouter();
  const active = pathname === href;
  return (
    <Link href={href} aria-current={active ? "page" : undefined}>
      {label}
    </Link>
  );
}
```

#### Key Points — 7.2.2

- `pathname` ≈ route template.
- Good for **active link** detection.

---

### 7.2.3 `router.query`

**Beginner Level:** Object of **query string** and **dynamic route** values from the URL.

**Intermediate Level:** Wait for `router.isReady` before trusting values on first render. Normalize `string | string[]`.

**Expert Level:** Never use `query` for **auth**; validate server-side. For **marketing attribution** (`utm_*`), persist server-side or analytics pipeline—not only client state.

```tsx
import { useRouter } from "next/router";
import { useMemo } from "react";

export function useTabQuery(defaultTab: string) {
  const router = useRouter();
  return useMemo(() => {
    if (!router.isReady) return defaultTab;
    const t = router.query.tab;
    return typeof t === "string" ? t : defaultTab;
  }, [router.isReady, router.query.tab, defaultTab]);
}
```

#### Key Points — 7.2.3

- Unstable until `isReady` on client.
- Treat as **untrusted** input.

---

### 7.2.4 `router.asPath`

**Beginner Level:** The URL **as shown in the browser**, including query and hash (minus `basePath` in some cases—check docs for your version).

**Intermediate Level:** Use `asPath` for **analytics page URLs** and **sharing** links. Avoid parsing it manually when `query` suffices.

**Expert Level:** Beware **PII** in query strings logging to analytics—scrub tokens. For **social share** buttons, prefer canonical URLs from metadata, not raw `asPath`, if duplicates exist.

```tsx
import { useRouter } from "next/router";
import { useEffect } from "react";

export function PageViewLogger() {
  const router = useRouter();
  useEffect(() => {
    const handle = (url: string) => {
      // send to analytics (scrub sensitive params in production)
      console.info("pageview", url);
    };
    router.events.on("routeChangeComplete", handle);
    return () => router.events.off("routeChangeComplete", handle);
  }, [router.events]);
  return null;
}
```

#### Key Points — 7.2.4

- Great for **telemetry** hooks.
- Sanitize before logging.

---

### 7.2.5 `router.push()`

**Beginner Level:** Navigate forward in history to a new URL.

**Intermediate Level:** Accepts string or object; returns **Promise** in modern Next—`await` for sequential flows (show spinner, then navigate).

**Expert Level:** Debounce rapid `push` calls from **typeahead search** UIs; use `replace` for search query churn to avoid history spam.

```tsx
import { useRouter } from "next/router";

export function useGoToCheckout() {
  const router = useRouter();
  return (cartId: string) =>
    router.push({ pathname: "/checkout", query: { cartId } });
}
```

#### Key Points — 7.2.5

- Prefer `Link` when possible for accessibility defaults.
- `push` for **post-action** redirects.

---

### 7.2.6 `router.replace()`

**Beginner Level:** Navigate without leaving a **back** entry.

**Intermediate Level:** After form success, replace **interstitial** routes. Combine with **toast** UI.

**Expert Level:** For **payment**, also enforce server **idempotency**; `replace` alone does not prevent double submits.

```tsx
import { useRouter } from "next/router";

export function useReplaceWithQuery() {
  const router = useRouter();
  return (patch: Record<string, string>) =>
    router.replace(
      { pathname: router.pathname, query: { ...router.query, ...patch } },
      undefined,
      { shallow: true }
    );
}
```

#### Key Points — 7.2.6

- Common in **auth** and **wizard** exits.
- Pair shallow routing carefully (Pages Router).

---

### 7.2.7 `router.back()`

**Beginner Level:** Browser **back** action.

**Intermediate Level:** Provide **fallback** when history is empty (e.g., open in new tab).

**Expert Level:** In **mobile apps** using WebView, coordinate with native back stack.

```tsx
import { useRouter } from "next/router";

export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else void router.push(fallback);
      }}
    >
      Back
    </button>
  );
}
```

#### Key Points — 7.2.7

- Always consider **deep links** without history.

---

### 7.2.8 `router.reload()`

**Beginner Level:** Reload the current page—like pressing browser refresh.

**Intermediate Level:** Prefer **revalidating data** (SWR/React Query/`router.replace`) instead of full reload for better UX.

**Expert Level:** Use sparingly for **session refresh** after rare server flag changes when you cannot invalidate caches cleanly—document as **escape hatch**.

```tsx
import { useRouter } from "next/router";

export function HardRefreshButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => void router.reload()}>
      Reload app
    </button>
  );
}
```

#### Key Points — 7.2.8

- Full reload is **expensive**; prefer targeted refetch.
- Useful for rare **support** workflows.

---

## 7.3 App Router Navigation Hooks

> **Scope:** These hooks live in **`next/navigation`** and apply to the **App Router** (`app/`). They complement `<Link>` the same way `useRouter` complements Pages Router navigation.

### 7.3.1 `usePathname`

**Beginner Level:** Returns the **current pathname string** like `/dashboard/settings`—useful for highlighting nav items in a **SaaS sidebar**.

**Intermediate Level:** `usePathname` updates on navigation without query strings—pair with `useSearchParams` when you need both.

**Expert Level:** For **multi-tenant** apps with tenant prefixes (`/t/acme/...`), derive active states from **segment parsing** rather than naive string equality; centralize in a hook for testability.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Overview" },
  { href: "/app/reports", label: "Reports" },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "font-semibold" : ""}
            aria-current={active ? "page" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

#### Key Points — 7.3.1

- Client hook—mark file `"use client"` or place in Client Component.
- Pathname excludes origin and usually excludes `search`.

---

### 7.3.2 `useSearchParams`

**Beginner Level:** Read **query string** values in Client Components: `?tab=analytics`.

**Intermediate Level:** Returns **read-only** `URLSearchParams`. To update, use `router.push`/`replace` with `next/navigation` or `<Link href="?tab=billing">`.

**Expert Level:** For **dashboard deep links**, serialize complex state minimally—prefer **short keys** and **zod** validation. Beware **hydration**: URL may differ between server and client if manipulated before hydration; consider `useEffect` sync for analytics only.

```tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function BillingTabs() {
  const sp = useSearchParams();
  const tab = sp.get("tab") ?? "usage";
  return (
    <div className="flex gap-2">
      <Link href="?tab=usage" aria-current={tab === "usage" ? "page" : undefined}>
        Usage
      </Link>
      <Link href="?tab=invoices" aria-current={tab === "invoices" ? "page" : undefined}>
        Invoices
      </Link>
    </div>
  );
}
```

#### Key Points — 7.3.2

- Updating search params triggers navigation (when using `Link`/`router`).
- Validate tab keys against an allowlist.

---

### 7.3.3 `useParams`

**Beginner Level:** Read **dynamic route params** from the current segment: `/blog/[slug]` → `{ slug: 'hello' }`.

**Intermediate Level:** Types are **loose** unless you wrap with your own zod schema—validate on the server in `page.tsx` loaders too.

**Expert Level:** For **e-commerce**, combine `useParams` with **parallel routes** carefully—params may include multiple parallel slot segments depending on layout; prefer **server `params` prop** when possible and pass as props to clients.

```tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { z } from "zod";

const ParamsSchema = z.object({ slug: z.string().min(1) });

export function BlogToolbar() {
  const raw = useParams();
  const parsed = useMemo(() => ParamsSchema.safeParse(raw), [raw]);
  if (!parsed.success) return null;
  const { slug } = parsed.data;
  return <span className="text-sm text-neutral-500">Editing: {slug}</span>;
}
```

#### Key Points — 7.3.3

- Prefer **server-provided props** for authoritative data fetching.
- Client `useParams` is for **UI affordances** (toolbars, breadcrumbs).

---

### 7.3.4 `useSelectedLayoutSegment`

**Beginner Level:** Returns the **active segment** for one parallel route level—useful for **tabs** that mirror filesystem segments.

**Intermediate Level:** Pass `parallelRoutesKey` when using **named parallel slots** (advanced). Returns `null` when no active segment.

**Expert Level:** Use in **marketing + app** shells where `(marketing)` vs `(app)` route groups split experiences—segment hooks help highlight **top-level** areas without brittle pathname parsing.

```tsx
"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export function SettingsSubnav() {
  const segment = useSelectedLayoutSegment();
  const items = [
    { slug: "profile", label: "Profile" },
    { slug: "security", label: "Security" },
  ] as const;
  return (
    <nav className="flex gap-3">
      {items.map((i) => {
        const active = segment === i.slug;
        return (
          <Link
            key={i.slug}
            href={`/settings/${i.slug}`}
            aria-current={active ? "page" : undefined}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

#### Key Points — 7.3.4

- Segment-level active states without manual pathname splitting.
- Works best with **consistent folder segment names**.

---

### 7.3.5 `useSelectedLayoutSegments`

**Beginner Level:** Returns **all selected segments** as an array—handy for **nested** navigation UI.

**Intermediate Level:** Combine with `usePathname` for **breadcrumbs** when you need both full path and segment focus.

**Expert Level:** For **SaaS admin** consoles, map segments to **RBAC** resources (`['org', orgId, 'projects']`)—still authorize on the server, but segments help **hide** nav items client-side.

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export function SegmentDebugger(props: { enabled: boolean }) {
  const segments = useSelectedLayoutSegments();
  if (!props.enabled) return null;
  return (
    <pre className="text-xs opacity-70">
      {JSON.stringify(segments, null, 2)}
    </pre>
  );
}
```

#### Key Points — 7.3.5

- Arrays mirror **nested layout** selections.
- Do not rely on segments alone for **security**.

---

## 7.4 Navigation Patterns

### 7.4.1 Active Link Styling

**Beginner Level:** Highlight the nav item for the **current page** with bold or underline.

**Intermediate Level:** Use `aria-current="page"` for accessibility. Compare `usePathname` or `router.pathname` depending on router.

**Expert Level:** For **nested** routes, use **prefix matching** with exceptions (do not mark `/settings` active on `/settings/billing` incorrectly—tune rules). Consider **style encapsulation** in design systems.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav() {
  const pathname = usePathname();
  const items = [
    { href: "/shop", label: "Shop" },
    { href: "/blog", label: "Blog" },
  ] as const;
  return (
    <header className="flex gap-4">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "text-blue-600" : "text-neutral-700"}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </header>
  );
}
```

#### Key Points — 7.4.1

- Accessible current state matters for **screen readers**.
- Tune **prefix** vs **exact** matching per route.

---

### 7.4.2 Breadcrumb Navigation

**Beginner Level:** Show `Home / Category / Product` so **e-commerce** users know where they are.

**Intermediate Level:** Generate crumbs from **route segments** or **CMS path**. Provide JSON-LD `BreadcrumbList` for SEO.

**Expert Level:** For **App Router**, pass structured crumb data from **server components** (with titles resolved from DB) to a small client crumb renderer to avoid waterfalls.

```tsx
import Link from "next/link";

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
      <ol className="flex flex-wrap gap-2">
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {i === items.length - 1 ? (
              <span aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

```tsx
// Server Component example sketch (App Router)
// export default async function ProductPage({ params }: { params: { id: string } }) {
//   const product = await getProduct(params.id);
//   const items = [
//     { href: "/", label: "Home" },
//     { href: "/shop", label: "Shop" },
//     { href: `/products/${product.id}`, label: product.name },
//   ];
//   return <Breadcrumbs items={items} />;
// }
```

#### Key Points — 7.4.2

- Last crumb is **current page** (not a link).
- Add **structured data** for SEO on marketing sites.

---

### 7.4.3 Tab Navigation

**Beginner Level:** Tabs switch content; URLs may include `?tab=` for **shareable state**.

**Intermediate Level:** Use **roving tabindex** and `role="tablist"` for accessibility; connect tabs to **panels** with `aria-controls`.

**Expert Level:** For **dashboard metrics**, lazy-load tab panels with `dynamic()` and prefetch on hover. Keep **server cache** tags consistent across tabs that hit the same resource.

```tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const tabs = ["overview", "members", "billing"] as const;
type Tab = (typeof tabs)[number];

function isTab(x: string | null): x is Tab {
  return !!x && (tabs as readonly string[]).includes(x);
}

export function OrgTabs({ orgId }: { orgId: string }) {
  const sp = useSearchParams();
  const current = isTab(sp.get("tab")) ? sp.get("tab")! : "overview";
  return (
    <div role="tablist" aria-label="Organization sections" className="flex gap-2">
      {tabs.map((t) => {
        const active = t === current;
        return (
          <Link
            key={t}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            href={`/org/${orgId}?tab=${t}`}
            className={active ? "border-b-2 border-blue-600" : ""}
          >
            {t}
          </Link>
        );
      })}
    </div>
  );
}
```

#### Key Points — 7.4.3

- **URL-backed tabs** improve shareability.
- Implement **keyboard** patterns for true tabs (advanced).

---

### 7.4.4 Navigation Guards

**Beginner Level:** Block navigation when a **form is dirty**—“You have unsaved changes.”

**Intermediate Level:** In Pages Router, listen to `routeChangeStart` and prompt. In App Router, patterns are evolving—use **client state** + `beforeunload` for full page exits.

**Expert Level:** For **SaaS editors**, store drafts **autoserver-side** so guards are less frequent; guards are **UX backup**, not persistence.

```tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export function useUnsavedGuard(shouldBlock: boolean) {
  const router = useRouter();
  const shouldBlockRef = useRef(shouldBlock);
  shouldBlockRef.current = shouldBlock;

  useEffect(() => {
    const onRouteChange = (url: string) => {
      if (!shouldBlockRef.current) return;
      const ok = window.confirm(`Leave to ${url}? Unsaved changes will be lost.`);
      if (!ok) {
        router.events.emit("routeChangeError");
        throw new Error("Route change aborted by user");
      }
    };
    router.events.on("routeChangeStart", onRouteChange);
    return () => router.events.off("routeChangeStart", onRouteChange);
  }, [router.events]);
}
```

#### Key Points — 7.4.4

- Guards are **client UX**; autosave is **real safety**.
- App Router may need different patterns—check current Next docs.

---

### 7.4.5 Progress Indicators

**Beginner Level:** Show a **top loading bar** during navigations—users perceive speed.

**Intermediate Level:** Use libraries like **NProgress** with `routeChangeStart/Complete/Error` in Pages Router. For App Router, use **`useTransition`** pending UI or third-party solutions compatible with your version.

**Expert Level:** Correlate progress with **RSC streaming**: show skeletons in `loading.tsx` rather than only a global bar—**perceived performance** improves more than a thin spinner.

```tsx
"use client";

import Router from "next/router";
import NProgress from "nprogress";
import { useEffect } from "react";

export function NavigationProgress() {
  useEffect(() => {
    const start = () => NProgress.start();
    const stop = () => NProgress.done();
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", stop);
    Router.events.on("routeChangeError", stop);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", stop);
      Router.events.off("routeChangeError", stop);
    };
  }, []);
  return null;
}
```

#### Key Points — 7.4.5

- Combine **global** and **local** loading UI.
- Avoid **layout shift** from bars—use `position: fixed` carefully.

---

### 7.4.6 Scroll to Top

**Beginner Level:** On navigation, users should land at the **top** of the new page (default Next behavior).

**Intermediate Level:** Disable with `<Link scroll={false}>` when keeping scroll is intentional.

**Expert Level:** Implement **`scrollRestoration`** manually for feed apps: save `scrollY` keyed by URL in `sessionStorage` on link click, restore on mount. Test **iOS Safari** quirks.

```tsx
"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";

export function ScrollToTopOnRoute() {
  const router = useRouter();
  useEffect(() => {
    const onDone = () => window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    router.events.on("routeChangeComplete", onDone);
    return () => router.events.off("routeChangeComplete", onDone);
  }, [router.events]);
  return null;
}
```

#### Key Points — 7.4.6

- Default behavior is usually correct.
- Feeds and **nested modals** need custom strategies.

---

### Supplement: External vs internal links

**Beginner Level:** Use `<a href="https://...">` for **external** sites.

**Intermediate Level:** Add `rel="noopener noreferrer"` when using `target="_blank"` for **security** (tab nabbing).

**Expert Level:** Wrap external links with **UTM policy** centrally; for **affiliate e-commerce**, ensure compliance (disclosure, `rel=sponsored` where appropriate).

```tsx
export function ExternalBlogLink(props: { href: string; children: React.ReactNode }) {
  return (
    <a href={props.href} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
}
```

#### Key Points — Supplement

- Never use `next/link` for **arbitrary** user-supplied external URLs without validation.
- Centralize **analytics** parameters.

---

### Supplement: Mobile navigation patterns

**Beginner Level:** Hamburger menu toggles **drawer** navigation on small screens.

**Intermediate Level:** Trap focus inside drawer, close on **Escape**, restore focus to opener.

**Expert Level:** For **social** apps, combine bottom tab bar (client layout) with **server-driven** badge counts fetched in parallel on the server.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/feed", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/notifications", label: "Alerts" },
  { href: "/profile", label: "You" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t bg-white/90 backdrop-blur md:hidden">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 py-3 text-center text-sm ${active ? "font-semibold" : ""}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

#### Key Points — Mobile

- Respect **safe-area-inset** for iOS home indicator.
- Keep touch targets **≥ 44px**.

---

### Supplement: Deep linking and email campaigns

**Beginner Level:** Marketing emails link to `/promo/summer` with UTM params.

**Intermediate Level:** Normalize UTM capture in **middleware** or **analytics** provider; avoid storing PII in URLs.

**Expert Level:** For **passwordless login**, use **one-time codes** in URLs with short TTL and **rotate** on use; prefer POST for tokens when possible.

```typescript
// middleware sketch: strip tracking params for cache keys (conceptual)
// export function middleware(request: NextRequest) {
//   const url = request.nextUrl.clone();
//   url.searchParams.delete("utm_source");
//   return NextResponse.rewrite(url);
// }
```

#### Key Points — Deep links

- Test **desktop vs mobile** email clients.
- Prefer **server redirects** for deprecated paths.

---

## Topic 7 — Best Practices

- Prefer **`Link`** for declarative navigation; use **`router.push/replace`** after mutations.
- Keep **router imports** consistent: `next/router` (Pages) vs `next/navigation` (App).
- Mark **active links** with `aria-current` and thoughtful **prefix matching**.
- Encode **dynamic path segments** when they are user-controlled.
- Disable **prefetch** for private or huge routes; add **hover prefetch** selectively.
- Combine **URL state** with validated **server state**—never trust query params for auth.
- Use **breadcrumbs** + **structured data** on content-heavy sites (blog, e-commerce).
- Provide **loading affordances** (`loading.tsx`, progress bars, skeletons) appropriate to your router.

---

## Topic 7 — Common Mistakes to Avoid

- Mixing **`next/router` and `next/navigation`** in the same component tree incorrectly.
- Reading **`router.query`** before **`router.isReady`** (Pages Router).
- Nesting **interactive elements** inside `Link`.
- Using **`Link`** for **external** untrusted URLs (open redirect risks).
- **Over-prefix matching** active styles (`/sh` matching `/shop` accidentally—use delimiters).
- Relying on **client navigation guards** without **server validation** of permissions.
- Spamming history with **`router.push`** in search boxes—use **`replace`** or debounce.
- Ignoring **keyboard and screen reader** behavior in custom tab/list navigation.

---

*Navigation is the backbone of user experience. Invest in consistent URL design, accessible components, and router-appropriate hooks as you split or migrate between Pages and App Routers.*


