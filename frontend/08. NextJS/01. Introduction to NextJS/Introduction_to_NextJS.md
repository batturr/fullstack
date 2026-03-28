# Introduction to Next.js

Next.js is a **React framework** for building full-stack web applications. It adds routing, rendering strategies, data fetching conventions, and deployment tooling on top of React so teams can ship **fast, SEO-friendly, production-grade** sites—from marketing pages to dashboards—without assembling dozens of libraries by hand.

---

## 📑 Table of Contents

1. [1.1 What is Next.js?](#11-what-is-nextjs)
   - [Overview](#overview)
   - [History and Vercel](#history-and-vercel)
   - [React Framework vs Library](#react-framework-vs-library)
   - [Philosophy](#philosophy)
   - [Server-First Approach](#server-first-approach)
   - [Hybrid Rendering](#hybrid-rendering)
2. [1.2 Why Next.js?](#12-why-nextjs)
   - [Performance Benefits](#performance-benefits)
   - [SEO](#seo)
   - [Developer Experience](#developer-experience)
   - [Built-in Features](#built-in-features)
   - [Production-Ready](#production-ready)
   - [vs Remix, Gatsby, and CRA](#vs-remix-gatsby-and-cra)
3. [1.3 Next.js Versions](#13-nextjs-versions)
   - [Pages Router (Next.js 12 and earlier patterns)](#pages-router-nextjs-12-and-earlier-patterns)
   - [App Router (Next.js 13+)](#app-router-nextjs-13)
   - [Migration](#migration)
   - [Stability](#stability)
4. [1.4 Setting Up Next.js](#14-setting-up-nextjs)
   - [System Requirements](#system-requirements)
   - [create-next-app CLI](#create-next-app-cli)
   - [Manual Setup](#manual-setup)
   - [Project Structure Overview](#project-structure-overview)
   - [Configuration Files](#configuration-files)
   - [Development Server](#development-server)
5. [Best Practices](#best-practices)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1.1 What is Next.js?

### Overview

**Beginner Level:** Think of Next.js as **React plus batteries included**: it gives you pages, links, and a dev server so you can build a **simple online store** or **blog** where each URL shows a different screen, without writing your own router from scratch.

**Intermediate Level:** Next.js compiles React components into optimized bundles, maps the **file system** to URLs (App or Pages Router), and coordinates **server and client** rendering so HTML can be generated on the server for fast first paint while still hydrating interactive islands on the client.

**Expert Level:** Next.js is a **full-stack React meta-framework** with a compiler (SWC), optional Rust-based tooling, **streaming RSC payloads**, **edge and Node runtimes**, **incremental static regeneration**, and **integrated caching semantics** (`fetch` cache, `revalidatePath`, tags). It positions React as a **UI layer** across SSR, SSG, CSR, and hybrid models behind one routing and build pipeline.

```tsx
// app/page.tsx — a minimal App Router entry renders a React Server Component by default
export default function HomePage() {
  return (
    <main>
      <h1>Northwind Traders — Fresh arrivals</h1>
      <p>Server-rendered catalog shell; interactive cart lives in a Client Component.</p>
    </main>
  );
}
```

#### Key Points

- Next.js **extends** React; you still write components, hooks (in Client Components), and JSX.
- **Routing** is convention-based: folders and special files define URLs and UI boundaries.
- **Rendering** can happen on the server, at build time, on the client, or in combination.

---

### History and Vercel

**Beginner Level:** Next.js was created to make **React websites easier to put on the internet**—like publishing a **portfolio** or **small business site** without wrestling with webpack configs. The company **Vercel** is closely tied to Next.js hosting.

**Intermediate Level:** **Guillermo Rauch** and the **Vercel** (formerly Zeit) team open-sourced Next.js in **2016** to provide **SSR**, **code splitting**, and **simple routing** for React. Vercel offers **managed deployment** optimized for Next.js (serverless functions, edge, previews), though Next.js itself is **framework-neutral** and runs anywhere Node or edge runtimes are supported.

**Expert Level:** Next.js evolution tracks **React features** (Suspense, Server Components, `use`); major releases introduced **Turbopack** (dev bundler), **App Router**, **Server Actions**, and refined **caching** contracts. Vercel’s platform integrates **ISR**, **image optimization**, and **analytics**, but self-hosted setups use **`output: 'standalone'`**, custom servers, or adapters—understanding **vendor coupling vs portability** matters for enterprise architecture reviews.

```typescript
// Typed release awareness in internal docs or upgrade scripts
type NextMajor = 12 | 13 | 14 | 15;

const appRouterMinimum: NextMajor = 13;

function assertFeature(major: NextMajor, feature: string): void {
  if (major < 13 && feature === 'app-router') {
    throw new Error('App Router requires Next.js 13+');
  }
}
```

#### Key Points

- **Open source** framework; **Vercel** is the primary sponsor, not a runtime requirement.
- **Release cadence** is fast; pin versions and read **upgrade guides** for majors.
- **Hosting** can be Vercel, Docker, Node servers, or other platforms with compatible runtimes.

---

### React Framework vs Library

**Beginner Level:** **React** is a **library** for UI pieces. **Next.js** is a **framework** that **decides structure**—where pages live, how URLs work, and how HTML gets to the browser—like a **recipe** for building a whole **restaurant website** (menu page, contact page, order form).

**Intermediate Level:** React answers: *how do I describe UI as components?* Next.js answers: *how do I organize routes, load data, split bundles, prerender, and deploy?* You can use React inside **Vite**, **CRA**, or **Remix**; Next.js **opinionates** the stack (file-based routing, `next/image`, `next/font`, API routes / route handlers).

**Expert Level:** Framework **inversion of control** means Next.js owns **entry points** (`layout.tsx`, `page.tsx`), **build manifests**, and **RSC wire format**. Swapping to another meta-framework changes **data fetching location**, **streaming**, and **cache APIs**. For **design systems** or **micro-frontends**, evaluate **composition** at the **segment** / **layout** level vs **module federation**.

```tsx
// React-only concern: reusable presentation
type ProductCardProps = { title: string; priceCents: number };

export function ProductCard({ title, priceCents }: ProductCardProps) {
  return (
    <article>
      <h2>{title}</h2>
      <p>${(priceCents / 100).toFixed(2)}</p>
    </article>
  );
}

// Next.js concern: route module composes React trees and data loading
// (illustrative import path in an App Router page)
// import { ProductCard } from '@/components/product-card';
```

#### Key Points

- **React** = UI rendering paradigm; **Next.js** = application shell and delivery.
- Moving between **meta-frameworks** is non-trivial; **component** code often migrates cleanly.
- Next.js **conventions** reduce decision fatigue but require **team buy-in**.

---

### Philosophy

**Beginner Level:** Next.js encourages **good defaults**: fast loads, clear folders, and simple commands (`dev`, `build`, `start`) so a **beginner team** can ship a **landing page** quickly.

**Intermediate Level:** The philosophy blends **developer productivity** (file-based routing, TypeScript-first templates) with **user-centric performance** (smaller JS payloads via Server Components, automatic splitting). **Progressive enhancement** appears in forms with **Server Actions**—basic flows work without client JS.

**Expert Level:** **Convention over configuration** extends to **caching** (`fetch` in RSC defaults to aggressive caching unless opted out), **layout composition**, and **error boundaries** per segment. Teams must internalize **opt-out** patterns (`cache: 'no-store'`, `dynamic = 'force-dynamic'`) to avoid stale **dashboard** or **SaaS admin** data—philosophy is **fast by default**, **explicit when dynamic**.

```typescript
// Explicit dynamic rendering for a SaaS tenant-scoped admin view (conceptual)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Philosophy: default static/ISR where safe; mark dynamic boundaries precisely
```

#### Key Points

- **Defaults favor speed**; **dynamic** behavior is **opt-in** or **annotated**.
- **Colocation** of routes, components, and tests is preferred.
- **Web standards** (`fetch`, Web `Request`/`Response`) are first-class.

---

### Server-First Approach

**Beginner Level:** With **App Router**, pages are **Server Components** by default: the server builds HTML for a **product catalog** so users see content **before** large JavaScript downloads.

**Intermediate Level:** **Server-first** means **data fetching** and **heavy logic** run closer to **databases** and **secrets**, sending **serialized props** to small **Client Components** for interactivity (charts, drag-and-drop). This shrinks **TTI** for **content-heavy** sites.

**Expert Level:** **RSC payload** streaming interleaves **HTML shell** and **serialized component trees**; **selective hydration** reduces client work. **Edge** Server Components change **latency characteristics**—evaluate **data locality** (DynamoDB vs regional Postgres) for **global SaaS**. **Composition patterns** (passing Server Components as `children` to Client wrappers) preserve **server boundaries**.

```tsx
// Server-first: async Server Component fetches on the server
type Post = { id: string; title: string; excerpt: string };

async function loadFeaturedPosts(): Promise<Post[]> {
  const res = await fetch('https://api.example.com/posts?featured=true', {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json() as Promise<Post[]>;
}

export default async function BlogHome() {
  const posts = await loadFeaturedPosts();
  return (
    <section>
      <h1>Engineering Blog</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <a href={`/blog/${p.id}`}>{p.title}</a>
            <p>{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

#### Key Points

- **Default server** execution in App Router; add **`'use client'`** only where needed.
- **Secrets** stay off the client bundle when kept in Server Components / server-only modules.
- **Streaming** improves perceived performance for **slow upstream APIs**.

---

### Hybrid Rendering

**Beginner Level:** **Hybrid** means **mixing strategies**: some pages **pre-built** (fast, like a **marketing FAQ**), others **personalized on each request** (like a **logged-in home feed**).

**Intermediate Level:** Next.js supports **SSG** (static at build), **SSR** (per request), **ISR** (revalidate static pages), **PPR** (Partial Prerendering, where available), and **client-only** islands. A **single app** can static-export `/about` while `/dashboard` uses **dynamic** rendering.

**Expert Level:** **Route segment config** (`dynamic`, `revalidate`, `fetch` options) composes **fine-grained** hybrid behavior. **CDN** caching headers interact with **`next/cache`**; misaligned **`Cache-Control`** and **`revalidate`** cause **stale** or **thundering herd** issues. **Edge middleware** can **rewrite** to static vs dynamic paths for **A/B** or **geo** routing.

```typescript
// Segment config illustrating hybrid intent (illustrative)
export const dynamic = 'force-static'; // marketing landing

// Another route file might use:
// export const revalidate = 3600; // ISR for product listing

// Client-only heavy chart in separate bundle
// 'use client' in chart.tsx imported from a Server page
```

#### Key Points

- **Per-route** rendering choices beat **one-size-fits-all** SPA defaults.
- **ISR** bridges **static** performance with **freshness**.
- **Measure** TTFB, LCP, and **server costs** when choosing SSR vs static.

---

## 1.2 Why Next.js?

### Performance Benefits

**Beginner Level:** Next.js helps sites **load faster** by sending **ready HTML**, **shrinking JavaScript**, and **optimizing images**—customers on a **phone** browsing **sneakers** see pictures and prices sooner.

**Intermediate Level:** **Automatic code splitting** by route, **prefetching** `<Link>`, **image** (`next/image`) and **font** (`next/font`) optimization reduce **layout shift** and **render-blocking** assets. **Server Components** avoid shipping large **markdown** or **data transformation** libraries to browsers.

**Expert Level:** **Streaming SSR** and **React.lazy** patterns integrate with **Suspense** boundaries; **bundle analyzer** workflows catch **accidental client imports**. For **high-traffic e-commerce**, combine **ISR** for PLPs (product listing pages) with **on-demand revalidation** from **webhooks** when inventory changes.

```tsx
import Image from 'next/image';
import Link from 'next/link';

type Sneaker = { slug: string; name: string; imageUrl: string };

export function SneakerTeaser({ item }: { item: Sneaker }) {
  return (
    <Link href={`/shop/${item.slug}`} prefetch>
      <article>
        <Image src={item.imageUrl} alt={item.name} width={320} height={200} priority={false} />
        <h3>{item.name}</h3>
      </article>
    </Link>
  );
}
```

#### Key Points

- **Measure** with **Core Web Vitals**, not assumptions.
- **Prefetch** responsibly on **data-heavy** lists.
- **Server Components** reduce **JS**, not **automatically** **CPU** on the server—profile both sides.

---

### SEO

**Beginner Level:** **Search engines** read HTML easily. Next.js can **build pages on the server** so a **local bakery blog** has **titles and text** visible immediately—better **Google** snippets.

**Intermediate Level:** Use **`generateMetadata`** (App Router) or **`next/head`** patterns (Pages) for **per-route** `<title>`, **Open Graph**, and **canonical** URLs. **Sitemaps** (`app/sitemap.ts`) and **`robots.txt`** integrate with **crawlers**. **SSR/SSG** avoids empty **client-only** shells that confuse bots.

**Expert Level:** **Internationalization** (`hreflang`), **structured data** (JSON-LD in Server Components), and **log-based** **post-render** analysis catch **hydration mismatches** that affect **rich results**. For **marketplaces**, **pagination** and **facet** URLs need **consistent** **metadata** to avoid **duplicate content** penalties.

```typescript
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = `Recipe: ${slug.replace(/-/g, ' ')}`;
  return {
    title,
    openGraph: { title, url: `https://bakery.example/recipes/${slug}` },
  };
}
```

#### Key Points

- **Server-rendered** HTML supports **crawlers** and **unfurl** previews.
- **Metadata API** centralizes **head** management in App Router.
- **Test** with **Search Console** and **social debuggers**.

---

### Developer Experience

**Beginner Level:** **`create-next-app`** scaffolds a project; **`npm run dev`** gives **instant refresh** when you edit a **checkout** form—errors show **in the browser** overlay.

**Intermediate Level:** **Fast Refresh** preserves component state where safe; **TypeScript** templates are first-class; **ESLint** `next/core-web-vitals` catches **anti-patterns**. **Turbopack** (dev) speeds **large monorepos**. **Route groups** and **colocation** clarify **feature ownership** in **SaaS** teams.

**Expert Level:** **Monorepo** tooling (Turborepo, Nx) pairs with **transpilePackages** for **shared UI** packages. **Module path aliases** (`@/`) reduce **deep imports**. **Custom ESLint rules** and **Codemods** from release notes automate **migrations**. Integrate **Playwright** and **Vitest** in **`src`** layouts for **end-to-end** **dashboard** flows.

```json
// tsconfig.json (excerpt) — DX: clean imports
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Key Points

- **Tooling** is **opinionated** but **extensible**.
- **Strict TypeScript** catches **RSC** boundary mistakes early.
- **Monorepo** consumers should **declare** **`react`/`react-dom`** versions carefully.

---

### Built-in Features

**Beginner Level:** You get **routing**, **API endpoints**, and **image helpers** without installing ten extra packages for a **school fundraiser** site.

**Intermediate Level:** Built-ins include **`next/image`**, **`next/font`**, **`next/link`**, **middleware**, **route handlers** (`route.ts`), **metadata**, **internationalized routing** patterns, and **server actions**. **CSS** support spans **CSS Modules**, **Tailwind**, and **Sass**.

**Expert Level:** **Incremental adoption** is possible: **edge middleware** for **auth gating**, **handlers** for **webhooks** (Stripe, CMS), **draft mode** for **preview** content in **headless CMS** workflows. Understand **limits** (image remotePatterns, body size) to avoid **production surprises**.

```typescript
// app/api/og/route.ts — route handler for dynamic social images (sketch)
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    <div style={{ display: 'flex', fontSize: 48 }}>SaaS Launch Week</div>,
    { width: 1200, height: 630 },
  );
}
```

#### Key Points

- **Prefer** built-ins for **images/fonts**—they encode **best practices**.
- **Route handlers** replace many **custom server** needs.
- **Read** **edge vs node** runtime **compatibility** matrices.

---

### Production-Ready

**Beginner Level:** **`next build`** makes an **optimized** version you can **deploy**—like packaging a **board game** with all pieces counted.

**Intermediate Level:** Production mode **minifies**, **tree-shakes**, **hashes** assets, and applies **React** production optimizations. **`standalone` output** eases **Docker** images. **Error boundaries** (`error.tsx`) and **logging** hooks support **operability**.

**Expert Level:** **Observability** integrates via **OpenTelemetry**, **runtime metrics**, and **edge logs**. **Security headers** (`next.config` `headers`), **CSP** nonces (App Router support patterns), and **environment validation** (e.g., **Zod** at startup) harden **SaaS** **multi-tenant** deployments. **Load tests** should include **cold starts** for **serverless**.

```typescript
// next.config.ts (typed sketch) — production headers
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

export default nextConfig;
```

#### Key Points

- **Treat** **env vars** as **build-time** vs **runtime** secrets explicitly.
- **Health checks** should hit **dynamic** routes if they **depend on DB**.
- **Automate** **preview deployments** per **PR**.

---

### vs Remix, Gatsby, and CRA

**Beginner Level:** **CRA** bootstraps **client React** only—**no built-in routing** for SSR. **Gatsby** excels at **content sites**. **Remix** focuses on **web fundamentals** and **nested routing**. **Next.js** is the **generalist** with **large ecosystem**.

**Intermediate Level:** **Gatsby** historically centered **GraphQL** and **build-time** data; **Remix** leans on **loaders/actions** and **nested layouts** with **less RSC-centric** models. **Next.js App Router** merges **RSC**, **Server Actions**, and **fine-grained caching**. **CRA** is **deprecated** for new apps; migrate to **Vite** or a **framework**.

**Expert Level:** Choose **Remix** when **teams** want **tight** **loader**/**action** **mental model** and **minimal** **abstractions**; **Gatsby** for **Markdown-heavy** **static** **GraphQL** pipelines; **Next** when **Vercel**/**ISR**/**RSC**/**image** stack fits **enterprise** **roadmaps**. **Portability** of **auth**, **i18n**, and **CMS** SDKs often drives the decision more than **benchmarks**.

```typescript
// Decision helper types (illustrative only)
type ProjectProfile = {
  contentModel: 'markdown' | 'headless-cms' | 'database-heavy';
  rendering: 'mostly-static' | 'mixed' | 'highly-dynamic';
  teamFamiliarity: 'react-only' | 'fullstack-ts';
};

function suggestStack(p: ProjectProfile): 'next' | 'remix' | 'gatsby' {
  if (p.rendering === 'mostly-static' && p.contentModel === 'markdown') return 'gatsby';
  if (p.teamFamiliarity === 'fullstack-ts' && p.rendering === 'highly-dynamic') return 'next';
  return 'next';
}
```

#### Key Points

- **No silver bullet**—map **requirements** to **framework strengths**.
- **Next** offers **widest** **commercial** **adoption** and **hosting** integrations.
- **Avoid** new **CRA**; prefer **framework-backed** **SSR**/**SSG**.

---

## 1.3 Next.js Versions

### Pages Router (Next.js 12 and earlier patterns)

**Beginner Level:** The **`pages/`** folder maps files to URLs: `pages/about.tsx` → `/about`. **`pages/index.tsx`** is **home**. This model is **still supported**.

**Intermediate Level:** **`getServerSideProps`**, **`getStaticProps`**, **`getStaticPaths`** control **data** and **rendering** per page. **`pages/api/*`** defines **API routes**. **Layouts** are **manual** (wrap `_app.tsx`). **Image optimization** and **dynamic imports** work across versions.

**Expert Level:** **Incremental migration** to App Router can **coexist** (`app` + `pages`). **Edge API routes** introduced runtime splits; **middleware** evolved. Legacy **i18n** routing config lives in **`next.config`**. Maintain **patches** for **security** backports if you **lag** majors.

```tsx
// pages/products/[id].tsx (Pages Router — illustrative)
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

type Product = { id: string; name: string; priceCents: number };

type Props = { product: Product };

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = ['sku-001', 'sku-002'];
  return { paths: ids.map((id) => ({ params: { id } })), fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const id = ctx.params?.id as string;
  const product: Product = { id, name: `Item ${id}`, priceCents: 1999 };
  return { props: { product }, revalidate: 60 };
};

const ProductPage: NextPage<Props> = ({ product }) => (
  <main>
    <h1>{product.name}</h1>
    <p>${(product.priceCents / 100).toFixed(2)}</p>
  </main>
);

export default ProductPage;
```

#### Key Points

- **Stable** and **documented**; many **codebases** still rely on it.
- **Data APIs** differ from **App Router**—plan **training** when **mixing**.
- **`fallback: 'blocking'`** vs **`true`** affects **SEO** and **UX**.

---

### App Router (Next.js 13+)

**Beginner Level:** The **`app/`** directory uses special files: **`page.tsx`** is the screen, **`layout.tsx`** wraps sections—like **nested frames** for a **social profile** (header + tabs).

**Intermediate Level:** **Server Components** default; **`loading.tsx`**, **`error.tsx`**, **`not-found.tsx`** define **UI states**. **Colocation** encourages **`components` next to routes**. **Streaming** integrates with **Suspense**.

**Expert Level:** **Parallel** and **intercepting** routes enable **modals** and **slot-based** dashboards. **Route handlers** replace **`pages/api`** gradually. **PPR** and **advanced caching** evolve by **minor** release—read **RFCs** and **release notes**.

```tsx
// app/(main)/profile/[userId]/page.tsx — dynamic segment
type PageProps = { params: Promise<{ userId: string }> };

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;
  return (
    <section>
      <h1>Creator @{userId}</h1>
      <p>Server Component shell with client-only follow button in a child client file.</p>
    </section>
  );
}
```

#### Key Points

- **Prefer** App Router for **new** **features** (Server Actions, Metadata API).
- **Layouts** are **nested** **by default**—plan **composition** carefully.
- **Type `params`/`searchParams`** as **Promises** in latest types for **async** APIs.

---

### Migration

**Beginner Level:** You can **move page by page** from **`pages/`** to **`app/`**—start with **marketing** pages, keep **checkout** on **Pages** until ready.

**Intermediate Level:** Use **official codemods**, **adapter patterns** for **auth** (`getServerSession` equivalents), and **parallel routes** only when needed. Map **`getServerSideProps`** → **dynamic** **Server Component** **`fetch`**, **`getStaticProps`** → **`fetch` with `revalidate`**.

**Expert Level:** **Dual router** periods need **consistent** **`basePath`**, **i18n**, and **analytics** page names. **Cache** semantics differ—**expect** **subtle** **stale** bugs when **lifting** **data** code. **Automate** **visual regression** for **critical** **e-commerce** templates.

```typescript
// Migration checklist types (illustrative)
type MigrationTask =
  | 'move-route-segment'
  | 'replace-getServerSideProps'
  | 'port-api-route-to-handler'
  | 'add-error-boundary'
  | 'metadata-from-next-head';

interface RouteMigration {
  path: string;
  tasks: MigrationTask[];
  risk: 'low' | 'medium' | 'high';
}
```

#### Key Points

- **Incremental** migration is **supported** and **practical**.
- **Test** **auth**, **redirects**, and **trailing slashes**.
- **Update** **types** when **`params`** become **async**.

---

### Stability

**Beginner Level:** **Stable** means **documented features** work as promised in **production** for your **blog**—avoid **experimental** toggles unless you **accept** changes.

**Intermediate Level:** **App Router** reached **production** maturity in **14+** for most apps; still, **edge cases** (third-party **RSC** support, **library** **`'use client'`** boundaries) appear. **LTS** expectations follow **community** practice—**pin** versions in **`package.json`**.

**Expert Level:** **Canary** channels preview **breaking** changes; **enterprise** **SaaS** should **soak** **minors** in **staging**. **Semantic** usage of **`experimental`** flags (e.g., **PPR**) requires **fallback** plans. **Security advisories** may require **rapid** **patches**.

```json
{
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  }
}
```

#### Key Points

- **Read** **release notes** each **upgrade**.
- **Avoid** **unpinned** **`next`** in **libraries** you **publish**.
- **Staging** mirrors **prod** **runtime** (Node **version**, **edge** usage).

---

## 1.4 Setting Up Next.js

### System Requirements

**Beginner Level:** Install **Node.js** (a recent **LTS**), then use **npm** or **pnpm**—your **laptop** can run **`npm run dev`** for a **portfolio**.

**Intermediate Level:** Next.js versions **dictate** **minimum Node**; **TypeScript** is optional but **recommended**. **WSL2** on Windows improves **file watcher** performance; **Docker** needs **glibc**-compatible **images** matching **Node** ABI.

**Expert Level:** **CI** images should **pin** **Node** and **package manager** versions; **corepack** manages **pnpm/yarn**. **Apple Silicon** **ARM** builds behave differently for **native** deps—test **sharp** and **SWC** fallbacks. **Edge** local emulation may require **specific** **runtime** flags.

```bash
node -v   # expect Active LTS for current Next major
npm -v
corepack enable && corepack prepare pnpm@latest --activate
```

#### Key Points

- **Match** **Node** to **Next** **docs** for your **version**.
- **Pin** **toolchain** in **CI** and **Dockerfile**.
- **Use** **pnpm** **workspaces** for **monorepos** when scaling teams.

---

### create-next-app CLI

**Beginner Level:** Run **`npx create-next-app@latest`** in a terminal, answer **questions** (TypeScript, Tailwind), and open the **folder** in your **editor**.

**Intermediate Level:** Flags like **`--ts`**, **`--eslint`**, **`--app`**, **`--src-dir`**, **`--import-alias`** enable **non-interactive** **CI** scaffolds. **Turbopack** can be **default** **dev** bundler on **supported** versions.

**Expert Level:** **Corporate** templates **fork** **`create-next-app`** or wrap it with **internal** **lint**/**test**/**CI** files. **Private** **registries** may need **`.npmrc`** before **install**. **Automate** **renovate**/**dependabot** after **bootstrap**.

```bash
npx create-next-app@latest my-saas \
  --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
```

#### Key Points

- **Regenerate** **lockfiles** after **template** changes.
- **`--app`** enables **App Router** structure.
- **Commit** **`.nvmrc`** or **`.node-version`** for **team** alignment.

---

### Manual Setup

**Beginner Level:** You *can* **`npm init`** and **install** **`next react react-dom`** manually, then **add scripts**—usually **unnecessary** for **learners**.

**Intermediate Level:** Manual setup requires **`next.config.*`**, **`tsconfig.json`** with **`jsx: preserve`**, **`include: ["next-env.d.ts"]`**, **`app/layout.tsx`** minimum, and **`package.json`** scripts: **`dev`**, **`build`**, **`start`**, **`lint`**.

**Expert Level:** **Custom servers** (`server.js` **import** `next`) trade **some** **platform** **features** (default **serverless** **splitting**) for **control**—**prefer** **route handlers**/**middleware** first. **Monorepo** setups may **hoist** **React**—guard against **duplicate** **React** with **lint rules**.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.1.0"
  }
}
```

#### Key Points

- **Prefer** **CLI** unless **embedding** Next into **existing** servers.
- **Validate** **`typescript`** **`paths`** align with **Next** resolver.
- **Avoid** **two Reacts** in **monorepos**.

---

### Project Structure Overview

**Beginner Level:** **`app/`** holds **pages**; **`public/`** holds **images** like **`logo.png`**; **`components/`** holds **reusable UI** for your **store**.

**Intermediate Level:** With **`src/`**, paths become **`src/app`**, **`src/components`**. **Route groups** `(marketing)` **omit** **segments** from URLs. **`lib/`** stores **helpers** (**`cn`**, **formatters**). **Tests** colocate as **`*.test.ts`**.

**Expert Level:** **Feature slices** (`modules/billing/`) vs **layered** (`ui/`, `domain/`) **tradeoffs** affect **imports** and **circular** **dependency** risk. **Barrel files** can **hurt** **tree-shaking**—prefer **direct** imports in **RSC**-heavy apps. **Env** splitting: **`.env.local`** (gitignored) vs **`.env`** **defaults**.

```
src/
  app/
    (shop)/
      layout.tsx
      page.tsx
    dashboard/
      layout.tsx
      page.tsx
  components/
  lib/
  styles/
public/
```

#### Key Points

- **`app/`** **special files** are **meaningful**—names **must** match **conventions**.
- **`public/`** is **statically** served—**no** **secrets**.
- **Colocation** scales **ownership** in **teams**.

---

### Configuration Files

**Beginner Level:** **`next.config.js`** (or **`.ts`**) customizes **Next**—**images**, **redirects**. **`.env.local`** stores **API keys** for **Stripe** (never commit).

**Intermediate Level:** Use **typed** **`NextConfig`**; configure **`images.remotePatterns`**, **`headers`**, **`redirects`**, **`rewrites`**, **`experimental`**. **`tsconfig`** **`paths`** map **`@/`**. **ESLint** extends **`next/core-web-vitals`**.

**Expert Level:** **`webpack`** / **`turbopack`** hooks customize **bundling**; **transpilePackages** **builds** **internal** **packages**. **Modularize** **config** for **multi-env** (**`loadEnvConfig`** patterns). **Review** **CSP** and **`poweredByHeader`**.

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com', pathname: '/assets/**' }],
  },
  async redirects() {
    return [{ source: '/old-deals', destination: '/promotions', permanent: true }];
  },
};

export default nextConfig;
```

#### Key Points

- **Keep** **secrets** out of **`next.config`** **committed** files.
- **Type** **config** to **catch** **typos**.
- **Document** **why** each **rewrite** exists.

---

### Development Server

**Beginner Level:** **`npm run dev`** starts **localhost:3000**; **edit** a **page** and **see** changes **instantly**.

**Intermediate Level:** **`next dev --turbo`** enables **Turbopack**; **`-p`** sets **port**. **HTTPS** local via **mkcert**/**proxy**. **Environment** variables **reload** on **restart**; **`NEXT_PUBLIC_*`** **exposes** to **browser**.

**Expert Level:** **CPU** **profiling** large **apps**; **watch** **memory** with **many** **dynamic** **imports**. **Cross-origin** **API** dev uses **`rewrites`** to **avoid** **CORS**. **Docker** dev mounts **volume** with **delegated** consistency on **macOS** for **speed**.

```bash
next dev --turbo -p 4000
```

```typescript
// Exposed to client bundle — ONLY non-secrets
const publicApiBase: string = process.env.NEXT_PUBLIC_API_BASE ?? '';
```

#### Key Points

- **Never** prefix **secrets** with **`NEXT_PUBLIC_`**.
- **Match** **prod** **`NODE_ENV`** behavior before **release**.
- **Use** **Turbopack** where **supported** for **DX** speed.

---

### Quick Reference: Mental Model (Bonus)

**Beginner Level:** **URL → file**: a **page file** is a **screen**. **Layout** = **wrapper** around many pages—like a **shopping site** header that stays while **departments** change.

**Intermediate Level:** **Rendering** happens **on the server** unless you **opt into** the **client**. **Data** fetching next to **UI** in **Server Components** replaces many **effect**+**fetch** patterns from **SPAs**.

**Expert Level:** **Cache keys** derive from **`fetch` inputs** and **route segment**; **mutations** trigger **`revalidatePath`**/**`revalidateTag`**/**`updateTag`** per version. **Edge** vs **Node** **runtimes** split **API** compatibility—model **middleware** as **Request/Response** pipeline, **route handlers** as **HTTP endpoints**, **RSC** as **serialized trees**.

```typescript
type RenderingSurface = 'server' | 'client' | 'edge';

interface RouteModule {
  path: string;
  defaultExport: RenderingSurface;
  segments: string[];
}

const example: RouteModule = {
  path: '/shop/[slug]',
  defaultExport: 'server',
  segments: ['shop', '[slug]'],
};
```

#### Key Points

- **Teach** **new hires** **URL → module** mapping before **hooks**.
- **Draw** **boundaries** between **edge**, **server**, and **client** early in **architecture** reviews.
- **Revisit** **mental models** each **major** Next **release**.

---

### Ecosystem Snapshot (Bonus)

**Beginner Level:** Next.js works with **Tailwind**, **Prisma**, **Auth.js**, and **Vercel** templates—like **LEGO kits** that snap onto a **storefront** starter.

**Intermediate Level:** **Headless CMS** (Sanity, Contentful) + **ISR** powers **marketing** sites; **tRPC**/**REST** handlers back **dashboards**. **Storybook** tests **components** extracted from **RSC** **trees** via **client** **wrappers**.

**Expert Level:** **OpenTelemetry** exporters, **feature flags** (LaunchDarkly) in **middleware**, **edge** **KV** for **rate limits**, and **multi-region** **Postgres** (Neon, PlanetScale patterns) compose **enterprise** stacks—Next remains the **rendering** and **routing** **orchestrator**, not the **whole** **architecture**.

```typescript
type StackLayer = 'ui' | 'data' | 'auth' | 'observability' | 'cdn';

const ecommerceStack: Record<StackLayer, string> = {
  ui: 'Next.js App Router + Server Components',
  data: 'Postgres + Prisma + Redis cache',
  auth: 'Auth.js with OAuth + email magic links',
  observability: 'OpenTelemetry + structured logs',
  cdn: 'Image CDN + edge caching rules',
};
```

#### Key Points

- **Choose** **boring** **data** layers for **mission-critical** **SaaS**.
- **Integrate** **flags** and **experiments** at **middleware** or **layout** **boundaries**.
- **Document** **which** **layer** owns **caching** for each **entity**.

---

## Best Practices

- **Start** new features in **`app/`** with **Server Components**; add **`'use client'`** at **leaf** **interactive** components.
- **Pin** **Node**, **Next**, and **React** versions; **automate** **dependency** updates with **CI tests**.
- **Co-locate** **routes**, **tests**, and **stories**; **avoid** **deep** **shared** **god** folders without **boundaries**.
- **Configure** **`next/image`** **`remotePatterns`** explicitly; **audit** **LCP** images with **`priority`** sparingly.
- **Validate** **environment variables** at **startup** for **SaaS** deployments.
- **Plan** **SEO** with **`generateMetadata`** and **structured data** where **revenue** depends on **organic** traffic.
- **Document** **rendering** choices (**static** vs **dynamic**) per **route** in **runbooks** for **on-call**.

---

## Common Mistakes to Avoid

- **Marking** entire **layouts** as **`'use client'`**, forcing **large** **JS** and **losing** **RSC** benefits.
- **Storing** **secrets** in **`NEXT_PUBLIC_`** variables or **`public/`** files.
- **Assuming** **client** **hooks** work in **Server Components**—**move** **logic** to **Client** **children**.
- **Ignoring** **`fetch` caching** defaults and **shipping** **stale** **dashboard** data.
- **Upgrading** **Next** without **reading** **breaking** changes for **`params`** **async**, **metadata**, or **image** config.
- **Using** **`next/image`** with **unconfigured** remote hosts—**broken** images in **prod**.
- **Overusing** **`getServerSideProps`**-style **thinking** in **App Router** without **revalidate**/**cache** strategy.
- **Committing** **`.env.local`** or **API keys** in **templates** by mistake.

---

*These notes align with App Router–first guidance in recent Next.js majors; always verify details against the official Next.js documentation for your pinned version.*
