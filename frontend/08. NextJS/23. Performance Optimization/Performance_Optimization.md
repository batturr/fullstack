# Performance Optimization in Next.js

Optimize Core Web Vitals, assets, bundles, caching, and monitoring for e-commerce, blogs, SaaS dashboards, and social products. This chapter maps Next.js features to measurable user experience and production operations.

## 📑 Table of Contents

- [23.1 Core Web Vitals](#231-core-web-vitals)
  - [LCP (Largest Contentful Paint)](#lcp-largest-contentful-paint)
  - [FID (First Input Delay)](#fid-first-input-delay)
  - [CLS (Cumulative Layout Shift)](#cls-cumulative-layout-shift)
  - [INP (Interaction to Next Paint)](#inp-interaction-to-next-paint)
  - [Measuring Web Vitals](#measuring-web-vitals)
- [23.2 Image Optimization](#232-image-optimization)
  - [next/image Best Practices](#nextimage-best-practices)
  - [Lazy Loading Images](#lazy-loading-images)
  - [Priority and fetchPriority](#priority-and-fetchpriority)
  - [Responsive Images](#responsive-images)
  - [Modern Image Formats](#modern-image-formats)
- [23.3 Font Optimization](#233-font-optimization)
  - [next/font and Zero CLS](#nextfont-and-zero-cls)
  - [Subsetting](#subsetting)
  - [Display Strategies](#display-strategies)
  - [Preloading Fonts](#preloading-fonts)
- [23.4 Code Splitting](#234-code-splitting)
  - [Automatic Code Splitting](#automatic-code-splitting)
  - [Dynamic Imports](#dynamic-imports)
  - [React.lazy](#reactlazy)
  - [Route-based Splitting](#route-based-splitting)
  - [Component-based Splitting](#component-based-splitting)
- [23.5 Bundle Optimization](#235-bundle-optimization)
  - [Bundle Analysis](#bundle-analysis)
  - [@next/bundle-analyzer](#nextbundle-analyzer)
  - [Tree Shaking](#tree-shaking)
  - [Unused Dependencies](#unused-dependencies)
  - [Package Imports Optimization](#package-imports-optimization)
- [23.6 Rendering Performance](#236-rendering-performance)
  - [Static Generation](#static-generation)
  - [Streaming and TTFB](#streaming-and-ttfb)
  - [Suspense Boundaries](#suspense-boundaries)
  - [Parallel Fetching](#parallel-fetching)
  - [Preloading Data](#preloading-data)
- [23.7 Caching Strategies](#237-caching-strategies)
  - [Full Route Cache](#full-route-cache)
  - [Data Cache](#data-cache)
  - [CDN Caching](#cdn-caching)
  - [Browser Caching](#browser-caching)
  - [Service Workers](#service-workers)
- [23.8 JavaScript Optimization](#238-javascript-optimization)
  - [Minimizing Client JavaScript](#minimizing-client-javascript)
  - [Server Components and Zero JS](#server-components-and-zero-js)
  - [Avoiding Large Dependencies](#avoiding-large-dependencies)
  - [Third-party Scripts on the Client](#third-party-scripts-on-the-client)
- [23.9 Third-party Scripts](#239-third-party-scripts)
  - [next/script](#nextscript)
  - [Loading Strategies](#loading-strategies)
  - [Web Workers](#web-workers)
- [23.10 Performance Monitoring](#2310-performance-monitoring)
  - [Vercel Analytics](#vercel-analytics)
  - [Web Vitals Reporting](#web-vitals-reporting)
  - [Profiling React and Node](#profiling-react-and-node)
  - [Lighthouse](#lighthouse)
  - [Real User Monitoring (RUM)](#real-user-monitoring-rum)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 23.1 Core Web Vitals

### LCP (Largest Contentful Paint)

**Beginner Level:** LCP marks when the biggest visible content—often a hero image on a marketing site or a product image on an e-commerce PDP—has painted. Faster feels “loaded.”

**Intermediate Level:** Optimize LCP by shrinking image bytes, using `next/image` with correct `sizes`, prioritizing the LCP image with `priority`, reducing server response time (TTFB), and eliminating render-blocking resources above the fold.

**Expert Level:** For App Router, ensure the LCP element is discoverable early: avoid hiding hero media behind slow client-only gates, prefer SSR or static HTML for hero, and align CDN cache headers. Use `fetchPriority="high"` on the true LCP candidate when appropriate and measure field data—lab scores lie without RUM.

```tsx
import Image from "next/image";

export function Hero({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={900}
      priority
      sizes="100vw"
      placeholder="blur"
      blurDataURL="data:image/png;base64,..."
    />
  );
}
```

**Key Points — LCP**

- The LCP element is often an image or large text block.
- TTFB and resource load both matter; fix the bottleneck you measure.

---

### FID (First Input Delay)

**Beginner Level:** FID measures delay from the first tap or keypress until the browser can respond—important on mobile social feeds where users scroll and tap quickly.

**Intermediate Level:** Long tasks on the main thread (parsing huge JS bundles, expensive hydration) inflate FID. Split code, defer non-critical scripts, and avoid synchronous third parties.

**Expert Level:** FID is being superseded by INP for responsiveness measurement, but legacy tooling still references it. Reduce main-thread work via Server Components, selective client hydration, and moving heavy work to workers or server.

**Key Points — FID**

- Main-thread congestion hurts first interactions most.
- Defer analytics and chat widgets when possible.

---

### CLS (Cumulative Layout Shift)

**Beginner Level:** CLS captures annoying jumps—like a blog ad loading and pushing text down while you read.

**Intermediate Level:** Reserve space for images and embeds with width/height or aspect-ratio CSS. Use `next/font` to inline font metrics and avoid FOIT/FOUT shifts.

**Expert Level:** Dynamic content (e-commerce recommendations, skeleton → content swaps) should preserve layout: animate opacity, not height jumps; use CSS grid min heights; for web fonts, prefer `size-adjust` fallbacks and variable fonts with stable metrics.

```tsx
import Image from "next/image";

export function ProductThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-square w-full overflow-hidden rounded-md">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
    </div>
  );
}
```

**Key Points — CLS**

- Always size media containers.
- Avoid inserting banners above stable content without reserved space.

---

### INP (Interaction to Next Paint)

**Beginner Level:** INP looks at how quickly the page responds to interactions throughout the visit—not only the first one—so a sluggish SaaS dashboard fails even if the first click was fine.

**Intermediate Level:** Optimize event handlers, avoid synchronous `useEffect` storms on each keystroke, debounce expensive searches, and split heavy Client Components.

**Expert Level:** Profile interactions with Chrome Performance panel; watch long tasks after clicks; consider `transition` APIs, React 18 concurrent features, and moving validation to workers for large payloads.

**Key Points — INP**

- Holistic interactivity metric; critical for SPAs and rich dashboards.
- Combine UI feedback (optimistic updates) with fast commits.

---

### Measuring Web Vitals

**Beginner Level:** Run Lighthouse in Chrome DevTools on your blog and read the scores.

**Intermediate Level:** Use `web-vitals` in `app` to `reportWebVitals` or `instrumentation` client hook; send metrics to your analytics pipeline.

**Expert Level:** Field data segmented by connection, device, and route; compare P75 vs P95; tie deploys to regressions with deployment markers.

```tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

type Metric = {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
};

export function WebVitalsReporter() {
  useReportWebVitals((metric: Metric) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(metric.name, metric.value, metric.rating);
    }
  });
  return null;
}
```

**Key Points — Measuring**

- Lab + field together tell the truth.
- Track by route and locale for global sites.

---

## 23.2 Image Optimization

### next/image Best Practices

**Beginner Level:** Use `next/image` instead of `<img>` for automatic resizing and modern formats when using the default loader.

**Intermediate Level:** Always set `alt`, prefer `fill` in responsive cards with a sized parent, and configure `remotePatterns` in `next.config` for CDN hosts.

**Expert Level:** For image CDNs (Cloudinary, Imgix), custom `loader` functions map URLs; align cache TTL at CDN with Next image optimization cache.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.example.com", pathname: "/media/**" }],
  },
};

export default nextConfig;
```

**Key Points — next/image**

- Correct `sizes` prevents shipping desktop-sized images to phones.
- Remote images must be explicitly allowed.

---

### Lazy Loading Images

**Beginner Level:** Images below the fold load later so the product grid feels faster.

**Intermediate Level:** Default lazy loading applies except `priority` images. For infinite social feeds, virtualize lists to avoid thousands of DOM nodes.

**Expert Level:** IntersectionObserver-based patterns for custom backgrounds; for LCP candidates never lazy-load inadvertently.

**Key Points — Lazy Loading**

- `loading="lazy"` is default for non-priority `next/image`.
- Virtualize long feeds.

---

### Priority and fetchPriority

**Beginner Level:** Mark the hero image `priority` so it loads sooner on a storefront homepage.

**Intermediate Level:** Only one or two `priority` images per route; misuse increases contention.

**Expert Level:** Combine with HTTP/2 priorities and CDN prefetch; measure LCP element in field data to validate the right candidate is prioritized.

```tsx
<Image src="/hero.jpg" alt="Spring sale" width={1200} height={600} priority />
```

**Key Points — Priority**

- Too many priorities = no priority.
- Match priority to actual LCP element.

---

### Responsive Images

**Beginner Level:** Different image widths for mobile vs desktop using `sizes`.

**Intermediate Level:** Art direction with `<picture>` when cropping differs (fashion e-commerce).

**Expert Level:** `sizes` strings should reflect CSS layout breakpoints; incorrect `sizes` wastes bandwidth massively.

```tsx
<Image
  src="/banner.jpg"
  alt="Promo"
  width={2400}
  height={800}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
  className="w-full h-auto"
/>
```

**Key Points — Responsive**

- `sizes` is a contract with the browser’s responsive selection.
- Test real devices, not only desktop Lighthouse.

---

### Modern Image Formats

**Beginner Level:** Next serves WebP/AVIF when supported—smaller files, faster loads.

**Intermediate Level:** Provide SVG for logos; raster for photos.

**Expert Level:** For animated content prefer video (`<video muted playsInline>`) over giant GIFs in social embeds.

**Key Points — Formats**

- Let `next/image` negotiate formats when possible.
- Avoid double compression artifacts from upstream CMS.

---

## 23.3 Font Optimization

### next/font and Zero CLS

**Beginner Level:** `next/font/google` self-hosts fonts and reduces layout shift versus a late-loaded stylesheet.

**Intermediate Level:** Use `variable` fonts for weight axes without multiple files.

**Expert Level:** Subset glyphs per site language; combine with CSP `font-src` self-host only.

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

**Key Points — next/font**

- Self-hosting removes extra DNS/TLS hops versus ad-hoc remote stylesheet tags.
- Pair with CSS variables for design tokens.

---

### Subsetting

**Beginner Level:** Only ship characters you need (Latin vs Cyrillic) to shrink bytes.

**Intermediate Level:** `subsets: ["latin", "latin-ext"]` for Polish accents on a blog.

**Expert Level:** Automated subsetting pipelines per locale build in large multilingual SaaS.

**Key Points — Subsetting**

- Smaller files mean faster parse and download.
- Add subsets when expanding languages.

---

### Display Strategies

**Beginner Level:** `display: "swap"` shows fallback text immediately, then swaps—may flash but avoids invisible text forever.

**Intermediate Level:** `optional` avoids blocking paint on slow networks; great for non-critical accent fonts.

**Expert Level:** Match brand guidelines: flash vs invisible trade-offs; measure CLS when tuning.

**Key Points — Display**

- `swap` is a common default for body text.
- Decorative fonts can use `optional`.

---

### Preloading Fonts

**Beginner Level:** Critical heading font preloads so marketing hero text renders styled quickly.

**Intermediate Level:** `next/font` handles preloading for configured fonts; avoid duplicate manual `<link rel="preload">` unless you know what you’re doing.

**Expert Level:** For third-party icon fonts, prefer SVG sprites to font preloads—smaller CLS risk.

**Key Points — Preloading**

- Preload only critical few faces.
- Verify no redundant preloads across layouts.

---

## 23.4 Code Splitting

### Automatic Code Splitting

**Beginner Level:** Next splits JavaScript per route automatically—home and cart load different bundles.

**Intermediate Level:** Shared chunks deduplicate dependencies across pages.

**Expert Level:** Analyze flight boundaries in App Router; server components reduce client splits further.

**Key Points — Automatic Splitting**

- Route-level splitting is a major Next.js win.
- Watch for accidental giant shared chunks via barrel imports.

---

### Dynamic Imports

**Beginner Level:** Load a heavy chart library only on the analytics dashboard page.

**Intermediate Level:** `next/dynamic` with `{ ssr: false }` for browser-only APIs (caution: SEO impact).

**Expert Level:** `dynamic(import(), { loading: () => <Skeleton/> })` to stream placeholders and improve perceived performance.

```tsx
import dynamic from "next/dynamic";

const AdminCharts = dynamic(() => import("./AdminCharts"), {
  ssr: false,
  loading: () => <p>Loading charts…</p>,
});

export function Dashboard() {
  return <AdminCharts />;
}
```

**Key Points — Dynamic Imports**

- Push heavy client deps behind interaction or route entry.
- Provide loading UI to stabilize CLS.

---

### React.lazy

**Beginner Level:** `React.lazy` + `Suspense` splits component trees in Client Components.

**Intermediate Level:** Works inside client boundaries; not for Server Components directly.

**Expert Level:** Combine with route-level splitting—avoid double fragmentation causing waterfall requests.

```tsx
"use client";

import { lazy, Suspense } from "react";

const HeavyModal = lazy(() => import("./HeavyModal"));

export function OpenModalButton() {
  return (
    <Suspense fallback={null}>
      <HeavyModal />
    </Suspense>
  );
}
```

**Key Points — React.lazy**

- Suspense fallback should be lightweight.
- Prefer `next/dynamic` when integrating loading states with Next.js.

---

### Route-based Splitting

**Beginner Level:** Each page imports only what it needs—checkout does not ship blog editor code.

**Intermediate Level:** Keep shared UI in small modules; avoid mega `components/index.ts` re-exporting everything.

**Expert Level:** Monorepo packages marked `sideEffects: false` help tree shaking.

**Key Points — Route-based Splitting**

- Architectural boundaries become performance boundaries.
- Review shared barrels.

---

### Component-based Splitting

**Beginner Level:** Lazy-load a map picker on an address form.

**Intermediate Level:** Split rarely used admin tools in SaaS behind role gates **and** dynamic import.

**Expert Level:** Prefetch dynamic chunks on hover for power users where navigation is predictable.

**Key Points — Component Splitting**

- Balance latency vs upfront cost.
- Instrument chunk load times.

---

## 23.5 Bundle Optimization

### Bundle Analysis

**Beginner Level:** See which packages bloat your cart page bundle.

**Intermediate Level:** Run analyzer on production build; sort by gzip size.

**Expert Level:** Track bundle budgets in CI; fail PRs that regress significantly.

**Key Points — Analysis**

- Measure production builds, not dev.
- Repeat after major dependency upgrades.

---

### @next/bundle-analyzer

**Beginner Level:** Wrap `next.config` with analyzer plugin; open HTML treemap.

**Intermediate Level:** Enable only via env flag `ANALYZE=true` to avoid slowing normal builds.

**Expert Level:** Compare treemaps between branches for migrations (e.g., lodash → lodash-es).

```typescript
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@mui/material"],
  },
};

export default withBundleAnalyzer(nextConfig);
```

**Key Points — bundle-analyzer**

- Visualizes duplicate modules clearly.
- Pair with `optimizePackageImports` for icon libraries.

---

### Tree Shaking

**Beginner Level:** Unused functions drop from the bundle when using ESM and side-effect-free packages.

**Intermediate Level:** Import `Button` from `@mui/material/Button` vs entire library when optimization not configured.

**Expert Level:** Mark internal packages `"sideEffects": false` or list CSS side effect globs accurately.

**Key Points — Tree Shaking**

- Default exports of huge objects defeat shaking.
- Check CJS interop issues.

---

### Unused Dependencies

**Beginner Level:** Remove packages left from prototypes—smaller `node_modules` and faster installs.

**Intermediate Level:** Use `depcheck` periodically in monorepos.

**Expert Level:** Lock down dependency additions via PR checklist; prefer stdlib or existing utils.

**Key Points — Unused Dependencies**

- Fewer deps = smaller attack surface and less audit noise.
- Transitive deps still matter—use analyzer.

---

### Package Imports Optimization

**Beginner Level:** Next can rewrite barrel imports to direct paths for icon libraries.

**Intermediate Level:** Configure `experimental.optimizePackageImports` for large UI kits.

**Expert Level:** Benchmark SSR cold start after optimization—sometimes wins are client-only but still valuable.

**Key Points — Package Imports**

- Official Next feature for common pain points.
- Validate with analyzer diffs.

---

## 23.6 Rendering Performance

### Static Generation

**Beginner Level:** Pre-render blog posts at build time—fast CDN delivery.

**Intermediate Level:** Use `revalidate` (ISR) for semi-fresh marketing pages.

**Expert Level:** Choose static vs dynamic per segment; static for SEO landing, dynamic for personalized dashboard.

```typescript
export const revalidate = 3600;

export default async function MarketingPage() {
  const data = await fetch("https://cms.example.com/page/home", { next: { revalidate: 3600 } }).then(
    (r) => r.json(),
  );
  return <main>{data.title}</main>;
}
```

**Key Points — Static Generation**

- Lowest TTFB when served from CDN full route cache.
- Stale data trade-offs explicit via `revalidate`.

---

### Streaming and TTFB

**Beginner Level:** HTML arrives in chunks—users see shell faster on slow DB queries for a product page.

**Intermediate Level:** App Router streams RSC payloads; avoid awaiting all fetches serially at the top of the page.

**Expert Level:** Tune database indexes and API latency—they dominate TTFB even with streaming.

**Key Points — Streaming**

- Parallelize independent fetches.
- Move slow optional widgets lower in the tree inside `Suspense`.

---

### Suspense Boundaries

**Beginner Level:** Show skeleton while recommendations load on e-commerce PDP.

**Intermediate Level:** Fine-grained boundaries avoid blocking entire page.

**Expert Level:** Nested suspense for layout vs content; pair with `loading.tsx` conventions.

```tsx
import { Suspense } from "react";

async function Reviews({ productId }: { productId: string }) {
  const reviews = await fetch(`https://api.example.com/reviews/${productId}`, {
    cache: "no-store",
  }).then((r) => r.json());
  return <ReviewsList reviews={reviews} />;
}

export function ProductPage({ productId }: { productId: string }) {
  return (
    <>
      <ProductDetails id={productId} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={productId} />
      </Suspense>
    </>
  );
}
```

**Key Points — Suspense**

- Boundaries define progressive rendering.
- Fallbacks should reserve space (CLS).

---

### Parallel Fetching

**Beginner Level:** `Promise.all` for user + notifications on a dashboard header.

**Intermediate Level:** Start fetches before awaiting each sequentially in Server Components.

**Expert Level:** Use `cache()` from React to dedupe repeated fetches in one render pass.

```typescript
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/users/${id}`, { next: { tags: [`user:${id}`] } });
  return res.json();
});

export const getAlerts = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/alerts/${id}`, { next: { tags: [`alerts:${id}`] } });
  return res.json();
});

export async function loadDashboard(userId: string) {
  const [user, alerts] = await Promise.all([getUser(userId), getAlerts(userId)]);
  return { user, alerts };
}
```

**Key Points — Parallel Fetching**

- `cache` dedupes within a render pass.
- Avoid waterfalls hidden in nested children without Suspense.

---

### Preloading Data

**Beginner Level:** `<link rel="preload" as="image">` for known hero assets.

**Intermediate Level:** `router.prefetch` for likely next navigation from product grid to PDP.

**Expert Level:** Server-side preload patterns to begin fetches before children consume them—follow current Next.js docs for recommended APIs.

**Key Points — Preloading**

- Preload only high-confidence navigations to save bandwidth.
- Measure misuse via analytics.

---

## 23.7 Caching Strategies

### Full Route Cache

**Beginner Level:** Entire page HTML cached at CDN for anonymous blog readers.

**Intermediate Level:** Dynamic functions (`cookies`, `headers`, `searchParams` usage) opt into dynamic rendering—disables full route static cache.

**Expert Level:** Segment-level static vs dynamic with `fetchCache`, `dynamic`, `revalidate` exports—architect routes to keep marketing static.

**Key Points — Full Route Cache**

- Static routes scale globally.
- Dynamic boundaries should be as narrow as possible.

---

### Data Cache

**Beginner Level:** `fetch` responses cached by Next between requests depending on config.

**Intermediate Level:** `cache: 'no-store'` for personalized SaaS widgets; `next: { revalidate, tags }` for tag invalidation.

**Expert Level:** `unstable_cache` for non-fetch IO with tags; design invalidation on webhook from CMS.

```typescript
const res = await fetch("https://api.example.com/feed", {
  next: { revalidate: 60, tags: ["home-feed"] },
});
```

**Key Points — Data Cache**

- Tags connect CMS updates to precise invalidations.
- Misconfigured caching leaks stale prices in e-commerce—test carefully.

---

### CDN Caching

**Beginner Level:** Vercel/Cloudflare cache static assets at the edge.

**Intermediate Level:** Set `s-maxage` via `headers()` in route handlers for API responses that can be shared.

**Expert Level:** Stale-while-revalidate strategies for read-heavy catalog APIs; purge on product updates.

**Key Points — CDN**

- Align `Cache-Control` with auth requirements—never cache private JSON publicly.

---

### Browser Caching

**Beginner Level:** Hashed filenames for JS/CSS long-term immutable cache.

**Intermediate Level:** `next build` handles hashed assets automatically.

**Expert Level:** Service worker strategies for offline dashboards—complexity cost.

**Key Points — Browser Caching**

- Immutable assets + HTML revalidation pattern.
- Beware overly aggressive caching during incidents—version your API.

---

### Service Workers

**Beginner Level:** Offline shell for a PWA news reader.

**Intermediate Level:** Workbox recipes with Next precache lists.

**Expert Level:** Avoid stale HTML serving wrong auth states—scope SW carefully; prefer network-first for authenticated areas.

**Key Points — Service Workers**

- Powerful but easy to break auth flows.
- Test update lifecycle aggressively.

---

## 23.8 JavaScript Optimization

### Minimizing Client JavaScript

**Beginner Level:** Fewer kilobytes means faster parse on mobile social apps.

**Intermediate Level:** Convert presentational components to Server Components; mark interactivity only where needed with `"use client"`.

**Expert Level:** Audit client providers; collapse context trees; lazy-load non-critical widgets.

**Key Points — Client JS**

- Every client component pulls React runtime cost.
- Push data fetching to server by default.

---

### Server Components and Zero JS

**Beginner Level:** A static article page ships almost no component JS—just HTML.

**Intermediate Level:** Compose server trees with small client islands for likes/comments.

**Expert Level:** Measure RSC payload sizes; avoid serializing huge props to client.

**Key Points — RSC Zero JS**

- Default to server for content-heavy sites.
- Client boundaries are performance seams.

---

### Avoiding Large Dependencies

**Beginner Level:** Replace moment.js with `date-fns` tree-shaken imports or `Intl`.

**Intermediate Level:** Avoid importing entire icon packs.

**Expert Level:** Evaluate native browser APIs before adding polyfills—target modern baselines in Browserslist.

**Key Points — Large Dependencies**

- Analyzer highlights surprises (e.g., `lodash` full import).
- Prefer modular libraries.

---

### Third-party Scripts on the Client

**Beginner Level:** Ads and trackers slow dashboards—load them late.

**Intermediate Level:** Use `next/script` strategies.

**Expert Level:** Tag managers: audit triggers; cap concurrent third parties; monitor INP impact.

**Key Points — Third-party Client JS**

- Measure before/after in RUM.
- Host third-party consent before loading non-essential.

---

## 23.9 Third-party Scripts

### next/script

**Beginner Level:** Load analytics after interactive to keep product pages snappy.

**Intermediate Level:** Centralize scripts in `layout` with strategy.

**Expert Level:** Integrate CSP nonces from middleware for inline script security while using `next/script`.

```tsx
import Script from "next/script";

export function Analytics() {
  return <Script src="https://cdn.example.com/analytics.js" strategy="afterInteractive" />;
}
```

**Key Points — next/script**

- Avoid duplicating tags in every page.
- Use `onLoad` for initialization hooks.

---

### Loading Strategies

**Beginner Level:** `beforeInteractive` for critical early scripts (use sparingly).

**Intermediate Level:** `afterInteractive` default for analytics; `lazyOnload` for chat widgets.

**Expert Level:** Combine with Partytown (separate setup) to offload main thread—advanced integration cost.

```tsx
<Script id="consent-default" strategy="beforeInteractive">
  {`window.consent = { marketing: false };`}
</Script>
<Script src="https://example.com/marketing.js" strategy="lazyOnload" />
```

**Key Points — Strategies**

- Wrong strategy hurts LCP or INP.
- Re-evaluate on mobile networks.

---

### Web Workers

**Beginner Level:** Parse large CSV uploads off the main thread in a B2B SaaS importer.

**Intermediate Level:** Comlink wrappers for ergonomic RPC.

**Expert Level:** WASM modules in workers for image transcoding—pair with server-side preprocessing for huge files.

```typescript
self.onmessage = (e: MessageEvent<{ rows: string[] }>) => {
  const parsed = e.data.rows.map((line) => line.split(","));
  self.postMessage(parsed);
};
```

**Key Points — Web Workers**

- Great for CPU-heavy client tasks.
- Serialization cost still exists—chunk data.

---

## 23.10 Performance Monitoring

### Vercel Analytics

**Beginner Level:** Toggle Web Analytics in Vercel dashboard for real user vitals on a deployed blog.

**Intermediate Level:** Track custom events (add-to-cart) alongside vitals.

**Expert Level:** Combine with Speed Insights; segment by deployment.

**Key Points — Vercel Analytics**

- Low setup cost for Vercel-hosted apps.
- Understand sampling and privacy implications.

---

### Web Vitals Reporting

**Beginner Level:** Console log vitals in development.

**Intermediate Level:** POST to internal metrics with user anonymization.

**Expert Level:** OpenTelemetry traces linking server TTFB to client LCP.

**Key Points — Web Vitals Reporting**

- Normalize metrics (P75) consistently.
- Correlate with releases.

---

### Profiling React and Node

**Beginner Level:** React DevTools Profiler finds slow client renders in an admin table.

**Intermediate Level:** Node `--inspect` CPU profiles for API route hot paths.

**Expert Level:** Continuous profiling (e.g., Datadog, Pyroscope) in production sampling mode.

**Key Points — Profiling**

- Profile production-like data volumes.
- Watch re-renders caused by unstable props.

---

### Lighthouse

**Beginner Level:** Score e-commerce PDP in lab environment.

**Intermediate Level:** CI Lighthouse with budgets on PRs.

**Expert Level:** Calibrate throttling to match target markets; don’t chase 100s at the expense of product requirements.

**Key Points — Lighthouse**

- Lab metric; not a substitute for RUM.
- Useful for regressions on static pages.

---

### Real User Monitoring (RUM)

**Beginner Level:** See slow pages for real 4G users in another country.

**Intermediate Level:** Attribute slowness to LCP vs INP vs server.

**Expert Level:** Session replay for reproducing CLS/INP outliers—privacy reviewed.

**Key Points — RUM**

- Ground truth for UX.
- Segment by route, experiment, and hardware class.

---

## Extended Deep Dives (E-commerce, Blog, SaaS, Social)

### E-commerce: PDP Performance Checklist

**Beginner Level:** One LCP image (primary product shot), lazy secondary gallery.

**Intermediate Level:** Sticky ATC bar as client island; everything else server-rendered with cached pricing where safe.

**Expert Level:** Inventory-sensitive pricing uses `no-store` or short `revalidate`; merchandising CMS uses tags. Load reviews inside Suspense. Third-party payment SDKs `lazyOnload` until checkout step.

```tsx
<Suspense fallback={<ReviewsSkeleton />}>
  <ProductReviews productId={id} />
</Suspense>
```

---

### Blog: Editorial and Ads

**Beginner Level:** Static generation for posts; lazy ad iframes.

**Intermediate Level:** `next/font` for reading typography; CLS-safe ad slots with min-height.

**Expert Level:** RUM on article templates separately from home; measure INP for inline comment widgets.

---

### SaaS: Dashboard TTFB vs INP

**Beginner Level:** Skeleton screens for charts.

**Intermediate Level:** Parallel fetch for widgets; defer heavy chart library.

**Expert Level:** Server aggregates KPIs to reduce client fan-out; edge-cache only non-tenant-specific public data.

---

### Social: Infinite Feed

**Beginner Level:** Virtualized list; lazy images.

**Intermediate Level:** Prefetch next page on scroll threshold.

**Expert Level:** Service worker optional for offline draft posts—network-first for authenticated feed API.

---

### Case Study Snippets (TypeScript)

```typescript
type VitalsReport = { route: string; lcp: number; cls: number; inp: number };

export async function postVitals(body: VitalsReport) {
  await fetch("/api/vitals", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
}
```

```typescript
export function cacheHeadersForPublicJson(seconds: number) {
  return {
    "cache-control": `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`,
  } as const;
}
```

---

### Performance Review Agenda (Production)

**Beginner Level:** Weekly Lighthouse on top templates.

**Intermediate Level:** RUM dashboards with budgets per route.

**Expert Level:** Blameless postmortems linking deploy SHA to vitals regression; bundle diff artifacts stored per release.

---

### Instrumentation Hooks (Conceptual)

```typescript
// instrumentation.ts (Node runtime sketch)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("Node instrumentation: register profilers or OTEL here");
  }
}
```

---

### Image CDN Loader (Typed)

```typescript
import type { ImageLoaderProps } from "next/image";

export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`w_${width}`, `q_${quality ?? 75}`, "f_auto"];
  return `https://res.cloudinary.com/demo/image/upload/${params.join(",")}${src}`;
}
```

---

### Edge vs Node Caching Note

**Beginner Level:** Static assets always edge-friendly.

**Intermediate Level:** Authenticated JSON should not use shared CDN cache without Vary or private directives.

**Expert Level:** Separate caches for HTML shell vs data when using advanced patterns; document invalidation owners.

---

### Request Prioritization and HTTP Caching Headers (Expert Pattern)

**Beginner Level:** Some files should load before others; browsers already prioritize important resources.

**Intermediate Level:** Align `Link` `rel=preload` for fonts and critical CSS only when measured improvements appear in LCP.

**Expert Level:** For APIs backing Server Components, prefer short `s-maxage` with `stale-while-revalidate` for catalog reads in e-commerce, and `private, no-store` for `/api/me` style SaaS session endpoints. Document which teams own each header.

```typescript
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { ok: true },
    { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
```

---

### Reducing Hydration Cost on Marketing Pages

**Beginner Level:** Hydration is React “waking up” static HTML on the client; less client JS means faster hydration.

**Intermediate Level:** Keep hero and primary content in Server Components; isolate newsletter signup as a Client Component.

**Expert Level:** Avoid passing large serialized props across the server/client boundary; fetch on server, pass minimal DTO fields only.

```tsx
"use client";

import { useState } from "react";

export function NewsletterForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={async (fd) => {
        setPending(true);
        try {
          await action(fd);
        } finally {
          setPending(false);
        }
      }}
    >
      <input name="email" type="email" required />
      <button type="submit" disabled={pending}>
        {pending ? "Joining…" : "Join"}
      </button>
    </form>
  );
}
```

---

### Database and ORM Latency (SaaS Dashboard)

**Beginner Level:** Slow queries make every page feel slow, even with pretty spinners.

**Intermediate Level:** Add indexes for tenant_id + created_at patterns; use `select` projections instead of `SELECT *`.

**Expert Level:** Connection pooling (PgBouncer), read replicas for analytics widgets, and caching denormalized rollups in Redis with explicit TTL per widget.

---

### Media Policy for Social Uploads

**Beginner Level:** Resize images on upload so feeds do not ship multi-megabyte photos.

**Intermediate Level:** Generate multiple derivatives (thumb, feed, full) in a background job.

**Expert Level:** Content moderation pipelines scan derivatives; CDN caches per derivative with immutable URLs keyed by content hash.

---

### Performance Culture: PR Checklist (Typed Constants)

```typescript
export const PERF_BUDGETS = {
  maxClientChunkKbGzip: 250,
  maxLcpImageKb: 200,
  maxThirdParties: 6,
} as const;

export type PerfBudgetKey = keyof typeof PERF_BUDGETS;
```

---

## Key Points (Chapter Summary)

- Core Web Vitals connect UX to SEO and conversion; optimize LCP, CLS, INP with field data.
- `next/image` and `next/font` are first-class levers for media and typography performance.
- Split code by route and dynamic import heavy client-only dependencies.
- Analyzer + `optimizePackageImports` reduce accidental bloat.
- App Router streaming, parallel fetch, and Suspense improve perceived speed.
- Caching must balance freshness (e-commerce prices) vs scale (blogs).
- Third-party scripts need disciplined strategies and monitoring.
- Combine Lighthouse (lab) with RUM (field) and profiling for regressions.

---

## Best Practices

1. **Measure before optimizing**—identify the actual bottleneck route.
2. **Set correct `sizes`** on every responsive `next/image`.
3. **Limit `priority` images** to true LCP candidates.
4. **Default to Server Components**; add `"use client"` deliberately.
5. **Parallelize independent server fetches** and use `Suspense` for slow sections.
6. **Use tags + revalidation** instead of `no-store` everywhere.
7. **Run bundle analyzer** on a schedule, not only during emergencies.
8. **Defer third parties** (`lazyOnload`) unless business-critical.
9. **Track vitals per route/locale** for global apps.
10. **Set bundle/budget policies** in CI for sustainable performance culture.

---

## Common Mistakes to Avoid

1. **Huge hero images** without `sizes` or compression—kills LCP.
2. **Marking every image `priority`**—network contention and worse LCP.
3. **Serial `await` waterfalls** in Server Components without Suspense.
4. **Importing barrel files** that pull entire UI libraries.
5. **Caching personalized API responses** at CDN publicly.
6. **Ignoring CLS** when swapping skeletons for widely different content heights.
7. **Overusing `ssr: false`** hurting SEO on content pages.
8. **Assuming lab Lighthouse equals mobile emerging markets** experience.
9. **Shipping analytics before consent**—privacy and performance issues.
10. **No monitoring**—performance regressions ship silently until revenue drops.
