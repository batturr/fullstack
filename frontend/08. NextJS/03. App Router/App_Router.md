# Next.js App Router

The **App Router** (`app/`) is the modern routing system in Next.js. It maps **folders to URLs**, defaults to **React Server Components**, and adds **layouts**, **loading states**, **error boundaries**, **parallel routes**, and **intercepting routes** so teams can ship **e-commerce**, **blogs**, **dashboards**, and **SaaS** experiences with **clear composition** and **streaming-friendly** architecture.

---

## 📑 Table of Contents

1. [3.1 App Router Fundamentals](#31-app-router-fundamentals)
2. [3.2 Pages and Layouts](#32-pages-and-layouts)
3. [3.3 Route Groups](#33-route-groups)
4. [3.4 Dynamic Routes](#34-dynamic-routes)
5. [3.5 Parallel Routes](#35-parallel-routes)
6. [3.6 Intercepting Routes](#36-intercepting-routes)
7. [3.7 Loading UI](#37-loading-ui)
8. [3.8 Error Handling](#38-error-handling)
9. [3.9 Not Found Handling](#39-not-found-handling)
10. [3.10 Templates](#310-templates)
11. [Best Practices](#best-practices)
12. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 3.1 App Router Fundamentals

### Overview

**Beginner Level:** The **App Router** turns **folders** into **website addresses**. A file named **`page.tsx`** is what visitors **see**—like **`app/shop/page.tsx`** showing your **online store** homepage at **`/shop`**.

**Intermediate Level:** Beyond URLs, the App Router defines **how** UI **loads** and **fails**: **`layout.tsx`** persists chrome, **`loading.tsx`** streams placeholders, **`error.tsx`** isolates faults, and **`route.ts`** exposes HTTP handlers. **Server Components** run by default, shrinking client JS.

**Expert Level:** The router composes **segment trees** with **caches** tied to **fetch** and **static generation**. **Partial Prerendering** (when enabled) combines **static shells** with **dynamic holes**. **RSC payload** streaming interleaves **serialized** trees with **HTML**—operational concerns include **CDN** caching, **stale** boundaries, and **edge** vs **node** runtimes.

```tsx
// app/page.tsx — Server Component by default
export default function Page() {
  return <main>Hybrid commerce shell</main>;
}
```

#### Key Points

- **Special filenames** trigger framework behavior—do not rename casually.
- **Think** in **segments**, not just **pages**.
- **Defaults** favor **server** execution and **cached** **fetch** where safe.

---

### File-system Routing

**Beginner Level:** **URL path = folder path**. `app/about/page.tsx` → **`/about`**. No manual **route config** for a **simple blog**.

**Intermediate Level:** **Dynamic** folders use **`[slug]`**; **catch-all** uses **`[...slug]`**; **optional catch-all** uses **`[[...slug]]`**. **Route groups** `(marketing)` **omit** URL parts. **Private** folders `_components` do not map to URLs.

**Expert Level:** **Colocated** non-special files are **invisible** to routing. **Parallel** `@slot` segments and **intercepting** `(.)` syntax create **advanced** UX (modals, dashboards). **Trailing slash** and **`basePath`** rewrite effective URLs—align with **reverse proxies**.

```
app/
  (site)/
    layout.tsx
    page.tsx            -> /
    blog/
      page.tsx          -> /blog
      [slug]/page.tsx   -> /blog/:slug
```

#### Key Points

- **Prefer** explicit folders over **giant** catch-alls when **SEO** matters.
- **Private** **`_prefix`** avoids accidental routes.
- **Test** **deep links** and **refresh** on **advanced** patterns.

---

### Server Components Default

**Beginner Level:** Components in **`app/`** are **Server Components** unless you add **`'use client'`** at the top—your **product** **description** can render **without** shipping React **hooks** to phones.

**Intermediate Level:** **Async** components can **`await`** data. **No** **`useState`**/**`useEffect`** in Server Components. Pass **serializable** **props** to **Client** children. **Third-party** libraries that use hooks need **client** wrappers.

**Expert Level:** **Server**/**Client** **boundary** affects **bundle** graph and **security**. **`server-only`** package prevents **accidental** imports into client modules. **Streaming** suspends at **`Suspense`** boundaries—**waterfalls** in **RSC** still cost **TTFB**.

```tsx
type Product = { id: string; name: string };

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`https://api.example.com/products/${id}`, { next: { revalidate: 300 } });
  return res.json() as Promise<Product>;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  return (
    <article>
      <h1>{product.name}</h1>
    </article>
  );
}
```

#### Key Points

- **Push** **`'use client'`** **down** the tree.
- **Validate** **library** compatibility with **RSC**.
- **Profile** **server** **CPU** when **fetching** heavily per request.

---

### Colocation

**Beginner Level:** Keep **components** next to the **page** they belong to—your **team** finds **checkout** code **fast**.

**Intermediate Level:** Place **`loading.tsx`**, **`error.tsx`**, and **`opengraph-image.tsx`** beside **`page.tsx`**. **Tests** `page.test.tsx` colocate too. **Route groups** organize without exposing URL segments.

**Expert Level:** **Feature slices** reduce **merge conflicts** in **monorepos**. Watch **import** **cycles** between **colocated** modules. **Barrel** exports may **pull** **server** code into **client**—prefer **direct** imports across **boundaries**.

```
app/
  checkout/
    page.tsx
    loading.tsx
    error.tsx
    _components/
      order-summary.tsx
```

#### Key Points

- **Colocation** improves **discoverability** and **ownership**.
- **Non-route** folders use **`_`** or **careful naming**.
- **Audit** **imports** when **splitting** **client**/**server**.

---

### Route Segments

**Beginner Level:** Each **folder** in **`app/`** is a **segment**—like **steps** in a URL: **`/shop`**, **`/shoes`**.

**Intermediate Level:** **Segments** compose **layouts**, **loading**, and **errors** **independently**. **Parent** **layout** wraps **child** **segments**. **Leaf** **segments** host **`page.tsx`** or **`route.ts`**.

**Expert Level:** **Segment config** exports (`dynamic`, `revalidate`, `fetchCache`) **cascade** with **rules** defined in docs per version—**misconfiguration** causes **stale** or **slow** pages. **Soft navigation** preserves **layout state** across **segment** changes.

```typescript
// Conceptual segment config in a leaf route module
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

#### Key Points

- **Understand** **leaf** vs **interior** **segments**.
- **Document** **dynamic** choices per **segment** in **larger** apps.
- **Revalidate** **intentionally** after **mutations**.

---

### Nested Routes

**Beginner Level:** **Folders inside folders** make **nested URLs**: **`app/settings/profile/page.tsx`** → **`/settings/profile`** for a **SaaS** **account** page.

**Intermediate Level:** **Nested layouts** share **UI** across **subsections** without **re-mounting** parent chrome. **Breadcrumbs** derive from **segments**. **Parallel** routes nest **slots** per **segment**.

**Expert Level:** **Deep** trees affect **build** **time** and **developer** **navigation**—**route groups** flatten **organization** without **deep** URLs. **AuthZ** checks belong **close** to **data** fetching, not only **middleware**, for **defense** in depth.

```tsx
// app/settings/layout.tsx
import type { ReactNode } from 'react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <section className="settings-shell">
      <nav aria-label="Settings">…</nav>
      {children}
    </section>
  );
}
```

#### Key Points

- **Nested** **layouts** reduce **duplicated** **nav**.
- **Avoid** **unnecessary** **depth** harming **UX**.
- **Combine** with **loading**/**error** per **nesting** level.

---

## 3.2 Pages and Layouts

### page.tsx

**Beginner Level:** The **`page.tsx`** file is the **screen** for a route—**home**, **pricing**, **cart**.

**Intermediate Level:** **Export default** component; can be **async**. **Colocate** **metadata** via **`export const metadata`** or **`generateMetadata`**. **Type** props with **`params`**/**`searchParams`** as **Promises** in current Next types.

**Expert Level:** **Avoid** **fetch waterfalls**—parallelize independent requests. **Choose** **cache** options per **upstream** SLA. **Partial** **pre-render** strategies may **pin** **static** portions around **dynamic** holes.

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard — Acme Analytics' };

type Props = { searchParams: Promise<{ range?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const { range } = await searchParams;
  return <main>Reporting range: {range ?? '7d'}</main>;
}
```

#### Key Points

- **Exactly one** **`page.tsx`** per **route** **folder** you want **addressable**.
- **SEO-critical** content should be **server-rendered**.
- **Measure** **LCP** elements within **`page`**.

---

### Root Layout

**Beginner Level:** **`app/layout.tsx`** wraps **everything**—**html** and **body** live here for your **entire app**.

**Intermediate Level:** **Required** in App Router. **Import** **global CSS** and **fonts**. **Nest** **`{children}`** precisely once in **root** (for standard apps). **Metadata** defaults can live here.

**Expert Level:** **Multiple root layouts** via **route groups** at top-level—**rare**, **powerful**. **i18n** **`lang`** attribute and **`dir`** handled here. **Avoid** **heavy** client providers at **root**—scope them.

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = { title: { default: 'Acme Shop', template: '%s | Acme Shop' } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Key Points

- **Root** **layout** is **persistent** across navigations.
- **Keep** **global** concerns **minimal** and **fast**.
- **Validate** **accessibility** (**lang**, **skip links**).

---

### Nested Layouts

**Beginner Level:** **`app/blog/layout.tsx`** wraps **only** **blog** pages—**sidebar** stays while **articles** change.

**Intermediate Level:** **Layouts** **do not re-mount** on **client-side** navigations among **siblings** sharing the layout. **Great** for **music app** **player** bars and **SaaS** **subnav**.

**Expert Level:** **Data fetching** in nested layouts impacts **all** **child routes**—watch **cache** scope. **Deduplicate** **`fetch`** calls via **cache** **keys**. **Error** boundaries **do not** catch **layout** errors in **child** segments unless **nested** **`error.tsx`**.

```tsx
import type { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[220px_1fr] gap-6">
      <aside>Blog categories</aside>
      <div>{children}</div>
    </div>
  );
}
```

#### Key Points

- **Use** nested layouts for **shared** **chrome** within **sections**.
- **Be careful** with **broad** **data** requirements in **layouts**.
- **Pair** with **loading.tsx** at **same** **segment** when needed.

---

### Composition

**Beginner Level:** **Layouts** + **pages** **stack** like **Russian dolls**—each **adds** UI around **inner** content.

**Intermediate Level:** **`children`** prop is the **composition** point. **Slots** via **parallel routes** generalize beyond a single **`children`**. **Patterns**: **modals** as **parallel** **slots** with **intercepting** routes.

**Expert Level:** **Cross-cutting** concerns (**analytics**, **feature flags**) often **inject** at **layout** boundaries using **small** **client** **observability** components. **Avoid** **tight coupling** between **layouts** and **leaf** **business** rules.

```tsx
import type { ReactNode } from 'react';

export default function CommerceLayout({
  children,
  recommendations,
}: {
  children: ReactNode;
  recommendations: ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>{children}</div>
      <aside>{recommendations}</aside>
    </div>
  );
}
```

#### Key Points

- **Prefer** **composition** over **props drilling** across **many** levels.
- **Parallel** routes **enable** **true** **slots**.
- **Keep** **layouts** **presentational** when possible.

---

### Shared Layouts

**Beginner Level:** One **`layout.tsx`** used by **many** pages—**same** **header** for **mens** and **womens** **departments**.

**Intermediate Level:** **Sibling** routes under the **same** **parent** **folder** **share** that **parent** layout. **Route groups** **`(a)`** **`(b)`** **share** a **group-level** layout without affecting URLs.

**Expert Level:** **Micro-frontend** teams may **align** **shared** layout packages imported into **`layout.tsx`**—**version** **React** carefully to **avoid** **duplicate** **context**. **Theme** providers should **wrap** **only** subtrees that need them.

```txt
app/
  (shop)/
    layout.tsx        <- shared within (shop) group URLs
    men/page.tsx
    women/page.tsx
```

#### Key Points

- **Route groups** clarify **shared** chrome **without** extra URL segments.
- **Document** **which** **layouts** apply to **which** **URLs**.
- **Minimize** **client** **JS** in **shared** layouts.

---

### Layout Props

**Beginner Level:** **Layouts** receive **`children`**—that's the **nested** **page**.

**Intermediate Level:** **Parallel** route **slots** appear as **named** props (`modal`, `analytics`, etc.). **Types** should **reflect** **`ReactNode`**. **`params`** may flow to **layouts** in **dynamic** segments.

**Expert Level:** **Async** **layouts** are supported in recent versions—**await** **auth** or **feature** flags **carefully** to **avoid** **blocking** entire **subtrees**. **Memoization** rarely needed—**layouts** are **server** functions.

```tsx
import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ region: string }>;
};

export default async function RegionLayout({ children, params }: LayoutProps) {
  const { region } = await params;
  return (
    <section data-region={region}>
      <header>Localized deals — {region}</header>
      {children}
    </section>
  );
}
```

#### Key Points

- **Name** **slot** props consistently across **parallel** files.
- **Type** **`params`** as **Promises** when using **async** **layout**.
- **Avoid** **passing** **non-serializable** props to **client** children.

---

### Layout and Page Best Practices

**Beginner Level:** Put **only** **shared** UI in **layouts**; put **page-specific** titles and **content** in **`page.tsx`**.

**Intermediate Level:** **Fetch** in **page** when **specific**; **layout** when **shared** across **all** **children**—but **measure** **cache** impact. **Keep** **error** boundaries **close** to **risky** **data**.

**Expert Level:** **Instrument** **per-segment** **TTFB** in **staging**. **Align** **CDN** rules with **`dynamic`**/**`revalidate`**. **Security**: **never** **trust** **`searchParams`** for **auth** decisions without **server** validation.

```tsx
// page-level concern: specific metadata
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: true, follow: true } };

export default function Page() {
  return <h1>Public marketing</h1>;
}
```

#### Key Points

- **Layouts** for **structure**; **pages** for **meaning**.
- **Revalidate** after **mutations** affecting **shared** **layout** data.
- **Test** **keyboard** **navigation** across **nested** **layouts**.

---

## 3.3 Route Groups

### (folder) Syntax

**Beginner Level:** Folders wrapped in **parentheses** **do not** appear in the URL—`(marketing)/about/page.tsx` is still **`/about`**.

**Intermediate Level:** **Groups** organize code and **layouts** without **changing** **routes**. Multiple groups can live under **`app/`** with **different** **layouts**.

**Expert Level:** **Top-level** groups enable **distinct root layouts**—use **sparingly** (e.g., **auth** vs **app** shells). **Avoid** **over-nesting** groups that confuse **new** **developers**.

```
app/
  (marketing)/
    layout.tsx
    page.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx
```

#### Key Points

- **Parentheses** = **organizational** only.
- **Pair** groups with **dedicated** **layouts** when UX differs.
- **Communicate** **group** purpose in **docs**.

---

### Organizing Routes

**Beginner Level:** Put **landing** pages in **`(marketing)`** and **logged-in** pages in **`(app)`**—like **separate** **drawers** in a **filing cabinet**.

**Intermediate Level:** **Co-locate** **feature** components under **group** folders. **Shared** **components** may live in **`components/`** root or **`src/components`**.

**Expert Level:** **Enforce** **import boundaries** with **ESLint** (`eslint-plugin-boundaries`) for **large** **SaaS** codebases. **Monorepo** packages expose **UI** primitives; **app** groups compose them.

#### Key Points

- **Optimize** for **team** **navigation**, not just **URLs**.
- **Review** **group** splits during **onboarding**.
- **Avoid** **cyclic** imports between **groups**.

---

### Multiple Root Layouts

**Beginner Level:** **Different** **top-level** designs: **minimal** **login** vs **full** **dashboard** chrome.

**Intermediate Level:** **`app/(auth)/layout.tsx`** and **`app/(main)/layout.tsx`** each **define** `<html>`? **Usually** **one** **root** **`app/layout.tsx`** still required—check **docs** for your version’s **constraints**; **patterns** evolve—**validate** against **official** guidance.

**Expert Level:** **Analytics** and **theming** may **diverge** **entirely** between **roots**—**test** **FOUC** and **font** loading. **SEO** **metadata** **inheritance** differs—**explicit** **`metadata`** per **tree**.

```tsx
// Illustrative: separate shells via groups — still often share a single root html in app/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid place-items-center bg-slate-950 text-white">
      {children}
    </div>
  );
}
```

#### Key Points

- **Confirm** **html/body** **requirements** for your **Next** **version**.
- **Keep** **auth** layouts **minimal** for **performance**.
- **Audit** **cookies**/**headers** expectations per **shell**.

---

### Route Group Use Cases

**Beginner Level:** **Marketing** vs **app** separation, **different** **nav** styles.

**Intermediate Level:** **A/B** **experiments** sometimes **swap** **group-level** **layouts** behind **flags**. **Internationalization** patterns may **use** groups per **locale** when not using **`[locale]`** segment.

**Expert Level:** **White-label** **SaaS** may **compose** **tenant** **themes** at **group** **layout** level with **server** **resolved** **branding** from **subdomain** lookup.

#### Key Points

- **Map** **business** domains to **groups** (**commerce**, **support**, **docs**).
- **Avoid** **groups** as a **substitute** for **access control**.
- **Test** **deep links** into each **group**.

---

## 3.4 Dynamic Routes

### [folder] Dynamic Segments

**Beginner Level:** **`app/blog/[slug]/page.tsx`** makes URLs like **`/blog/hello-world`** for **posts**.

**Intermediate Level:** **`params`** prop provides **`slug`**. **Static** generation via **`generateStaticParams`**. **ISR** with **`revalidate`** on **`fetch`** or **segment** config.

**Expert Level:** **Validation** of **`params`** prevents **injection** issues when **building** **downstream** **queries**. **Typed** **narrowing** with **Zod** is common. **Optional** static **fallback** strategies (`dynamicParams`).

```tsx
type Props = { params: Promise<{ slug: string }> };

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  return <article>Post slug: {slug}</article>;
}
```

#### Key Points

- **`params` are dynamic**—treat as **untrusted** input.
- **Prebuild** popular paths with **`generateStaticParams`**.
- **Align** **CMS** **slugs** with **Next** routes.

---

### params

**Beginner Level:** **`params`** is how **dynamic** **pieces** of the URL reach your **page**—**user id**, **sku**.

**Intermediate Level:** For **multiple** **segments**, **`params`** includes **each** **key**. **Typing** as **`Promise`** in **newer** Next **types**—**await** in **async** components.

**Expert Level:** **Serialization** rules apply when **passing** **params** to **client** components—**convert** to **plain** objects/strings. **Edge** vs **node** may affect **available** APIs when **processing** **params**.

```typescript
type Params = { category: string; sku: string };

export async function generateStaticParams(): Promise<Params[]> {
  return [
    { category: 'shoes', sku: 'sku-1001' },
    { category: 'shoes', sku: 'sku-1002' },
  ];
}
```

#### Key Points

- **Await** **`params`** in **async** **Server Components**.
- **Do not** rely on **params** alone for **authorization**.
- **Decode** **unicode** slugs carefully for **i18n** blogs.

---

### generateStaticParams

**Beginner Level:** Tells Next **which** **dynamic URLs** to **pre-build** at **compile** time—**top** **blog** posts ready **instantly**.

**Intermediate Level:** Return **array** of **param objects**. **`fallback`** behavior replaced by **`dynamicParams`** concepts in App Router—consult **versioned** docs. **Use** with **`fetch` caching** for **ISR**.

**Expert Level:** **Paginate** **CMS** queries; **watch** **build** **time** for **100k** **SKUs**—consider **on-demand** **ISR** + **background** jobs. **Deduplicate** **API** calls across **workers**.

```tsx
type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await fetch('https://cms.example.com/slugs').then((r) => r.json() as Promise<string[]>);
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;
```

#### Key Points

- **Prebuild** **high-traffic** paths **first**.
- **Monitor** **build** **duration** in **CI**.
- **Pair** with **webhook** **revalidation** for **freshness**.

---

### Multiple Dynamic Segments

**Beginner Level:** **`app/[locale]/[category]/page.tsx`** supports **`/en/shoes`** for a **global** **marketplace**.

**Intermediate Level:** **`params`** includes **`locale`** and **`category`**. **generateStaticParams** returns **combinations**—**mind** **explosion**.

**Expert Level:** **Sitemaps** and **hreflang** for **SEO**. **CDN** **rules** per **locale**. **Cache** **key** design includes **all** **segments**.

```tsx
type Props = { params: Promise<{ locale: string; category: string }> };

export default async function CategoryHub({ params }: Props) {
  const { locale, category } = await params;
  return (
    <main>
      <h1>
        {locale.toUpperCase()} — {category}
      </h1>
    </main>
  );
}
```

#### Key Points

- **Limit** **combinatorial** **static** generation.
- **Validate** **locale** against **allowlist**.
- **Centralize** **i18n** dictionaries.

---

### Catch-all [...] Segments

**Beginner Level:** **`app/docs/[...slug]/page.tsx`** matches **`/docs/a`**, **`/docs/a/b`**, **one** **page** handles **nested** **paths**—good for **documentation** sites.

**Intermediate Level:** **`params.slug`** is **`string[]`**. **Use** for **CMS** **nested** paths. **generateStaticParams** must **emit** **slug arrays**.

**Expert Level:** **Careful** with **SEO** **duplicate** content—**canonical** URLs. **Performance** of **very deep** paths. **Security** of **path** parsing.

```tsx
type Props = { params: Promise<{ slug: string[] }> };

export default async function DocsCatchAll({ params }: Props) {
  const { slug } = await params;
  return <pre>{slug.join('/')}</pre>;
}
```

#### Key Points

- **Prefer** **explicit** routes when **possible** for **clarity**.
- **Map** **slug** arrays to **CMS** queries **safely**.
- **Handle** **empty** segments per **routing** rules.

---

### Optional Catch-all [[...]]

**Beginner Level:** Matches **zero** or **more** segments—**`/dashboard`**, **`/dashboard/settings`**, same **route**.

**Intermediate Level:** **`params.slug` optional** **`string[]`**. Useful for **file-browser** style **UIs** in **SaaS** **storage** products.

**Expert Level:** **Disambiguate** **index** vs **nested** **behavior**; **loading** states for **deep** trees. **Analytics** **page** naming becomes **harder**—instrument **explicitly**.

```tsx
type Props = { params: Promise<{ slug?: string[] }> };

export default async function FilesPage({ params }: Props) {
  const { slug } = await params;
  const path = slug?.join('/') ?? '(root)';
  return <h1>Folder: {path}</h1>;
}
```

#### Key Points

- **Great** for **explorer** UIs; **tricky** for **marketing** SEO.
- **Normalize** paths before **hitting** **storage** APIs.
- **Test** **root** and **deep** **URLs**.

---

## 3.5 Parallel Routes

### @folder Slots

**Beginner Level:** **`@analytics/page.tsx`** creates a **named** **slot** alongside **`children`**—your **dashboard** can show **two** **panes** at once.

**Intermediate Level:** **Layout** receives **`analytics`**, **`children`**, etc. as **props**. **Slots** map to **folders** starting with **`@`**. **Each** slot has its **own** **`page.tsx`**.

**Expert Level:** **Independent** **loading** and **errors** per **slot**—**great** **isolation** for **micro** **services** **backends** with **different** **SLAs**. **Watch** **bundle** duplication in **shared** **dependencies**.

```tsx
import type { ReactNode } from 'react';

export default function DashboardLayout({
  children,
  revenue,
  funnel,
}: {
  children: ReactNode;
  revenue: ReactNode;
  funnel: ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section>{children}</section>
      <section>{revenue}</section>
      <section className="lg:col-span-2">{funnel}</section>
    </div>
  );
}
```

#### Key Points

- **Name** **slots** for **domain** meaning, not **implementation**.
- **Combine** with **`default.tsx`** for **optional** slots.
- **Align** **design** grids with **slot** **composition**.

---

### Simultaneous Rendering

**Beginner Level:** **Multiple** **panels** **load** **together**—**KPIs** and **tasks** on an **ops** **dashboard**.

**Intermediate Level:** **Parallel** **`fetch`** in **each** **slot** **page** **component** can **stream** **independently** with **`loading.tsx`** per **slot**.

**Expert Level:** **Backpressure** when **one** **slot** **errors**—**decide** **fallback** UI **per** **slot** vs **whole** **page**. **Observability** tags per **slot** **help** **SLO** tracking.

#### Key Points

- **Independent** **Suspense** **boundaries** improve **perceived** **performance**.
- **Design** **fallbacks** for **partial** **failures**.
- **Measure** **each** **slot** **TTFB**.

---

### Conditional Slots

**Beginner Level:** Sometimes **show** **recommendations** slot, sometimes **hide**—based on **feature** **flags** or **auth**.

**Intermediate Level:** **Server** **logic** can **`return null`** in **slot** **pages** or **swap** **content**. **Client** **state** cannot **remove** **slot** **files**—use **conditional** **rendering** inside **slot** **components**.

**Expert Level:** **Feature flags** evaluated on **server** to **avoid** **layout** **shift** **secrets** leakage. **Careful** with **SEO** when **slots** contain **critical** text.

```tsx
import type { ReactNode } from 'react';

export default async function RecommendationsSlot(): Promise<ReactNode> {
  const enabled = process.env.NEXT_PUBLIC_RECOMMENDATIONS === '1';
  if (!enabled) return null;
  const items = await fetch('https://api.example.com/recs', { next: { revalidate: 60 } }).then((r) => r.json());
  return <aside>{JSON.stringify(items)}</aside>;
}
```

#### Key Points

- **Prefer** **server** **decisions** for **conditional** **slots**.
- **Keep** **CLS** **stable** when **toggling**.
- **Document** **flag** matrix for **QA**.

---

### default.tsx for Parallel Routes

**Beginner Level:** **Fallback** when **Next** doesn’t know **what** to show in a **slot** on **certain** **navigations**—often **`null`**.

**Intermediate Level:** **Required** for **optional** **slots** to **support** **hard** **refresh** and **deep** **links**. **Prevents** **build/runtime** errors.

**Expert Level:** **Different** **`default`** **per** **segment** level—**test** **modal** **slots** **extensively**.

```tsx
export default function Default() {
  return null;
}
```

#### Key Points

- **Always** add **`default.tsx`** for **optional** **parallel** routes.
- **Return** **`null`** for **empty** **slots** when **appropriate**.
- **Test** **refresh** on **complex** **dashboard** URLs.

---

### Parallel Routes Use Cases

**Beginner Level:** **Dashboards**, **split** **admin** **views**, **side** **panels**.

**Intermediate Level:** **Modals** using **`@modal`** + **intercepting** routes. **A/B** **tested** **layouts** with **slot** swaps.

**Expert Level:** **Embedded** **analytics** from **separate** **deployment** **pipelines** **composed** at **layout**—**contract** **testing** between **teams** **required**.

#### Key Points

- **Start** **simple**—**add** **parallel** routes when **UX** demands **independent** **loading**.
- **Invest** in **integration** tests for **slot** **navigation**.
- **Coordinate** **design** **systems** across **slots**.

---

## 3.6 Intercepting Routes

### (.) Same-Segment Intercept

**Beginner Level:** **`(.)photo`** means **“intercept** a route **one** level **within** the **same** segment**”**—like opening a **photo** **modal** over your **social** **feed** without leaving the feed URL **semantics** (pattern depends on folder arrangement).

**Intermediate Level:** Intercepting routes **map** **soft** navigations (client-side) to **different** UI (modal) while **hard** navigations (refresh) still hit the **full** **page**. **Requires** **parallel** **`@modal`** slot in many **recipes**.

**Expert Level:** **Relative** path **rules** use **dot segments** to express **how many** **levels** to **traverse**—**mis-counting** breaks **build**. **Test** **every** **entry** path: **link click**, **router.push**, **back** button, **refresh**.

```txt
app/
  feed/
    page.tsx
    @modal/
      (.)photo/[id]/page.tsx   <- intercept relative to feed segment (illustrative)
```

#### Key Points

- **Intercept** = **client** navigation **only** (typically).
- **Pair** with **modal** **slot** patterns.
- **Verify** against **current** **Next** **docs** for **exact** **folder** math.

---

### (..) Parent-Segment Intercept

**Beginner Level:** Goes **up** **one** **segment** to **intercept**—useful when **modal** route lives **next to** **parent** **folder** structure in **complex** **galleries**.

**Intermediate Level:** **Organize** **routes** so **interceptors** **mirror** **actual** **URL** **hierarchy**—**refactors** **break** intercept rules **silently**.

**Expert Level:** **Document** **folder** **trees** in **RFCs**; **add** **E2E** tests for **modal** **open/close** **cycles** on **e-commerce** **quick** **views**.

#### Key Points

- **Dot** **count** encodes **relative** **navigation** depth.
- **Refactor** **with** **caution**.
- **Automate** **tests** around **intercept** paths.

---

### (..)(..) Two-Level-Up Intercept

**Beginner Level:** **Two** **dots** groups **mean** **go** **up** **two** **segments**—for **deep** **nested** **category** trees showing **product** **modal** from **two** levels **away**.

**Intermediate Level:** **Rare** and **error-prone**—**prefer** **simpler** **routing** when **possible**. **Use** when **UX** **absolutely** requires **modal** overlay from **deep** **nested** **lists**.

**Expert Level:** **Code review** **checklist** item for **intercept** **depth**. **Performance**: **modal** still **loads** **RSC** **payloads**—**lazy** **import** **heavy** **client** **pieces**.

#### Key Points

- **Avoid** unless **necessary**.
- **Diagram** **segment** **relationships**.
- **Test** **mobile** **gesture** **back** behavior.

---

### (...) Root-Level Intercept from App

**Beginner Level:** **`(...)`** references **intercepting** from **app** **root**—useful when **modal** route should **match** **regardless** of **deep** nesting **patterns** per **docs**.

**Intermediate Level:** **Combine** with **named** **slots** for **global** **modals** (e.g., **login**). **Careful** with **collisions** across **features**.

**Expert Level:** **Security**: **modal** content still **executes** **server** **logic**—**authorize** **sensitive** **actions** **outside** **UI** **visibility** alone.

#### Key Points

- **Powerful** but **broad**—**scope** **carefully**.
- **Auth** **still** **required** for **protected** modals.
- **Prefer** **feature-local** intercepts when **possible**.

---

### Modal Patterns with Intercepting + Parallel Routes

**Beginner Level:** Click **product** → **modal** opens; **refresh** → **full** **product** **page**—great **e-commerce** **quick** **view**.

**Intermediate Level:** **`@modal` slot** + **`default.tsx`** returning **`null`**. **Full** **page** at **`/product/[id]`**; **intercept** maps **soft** nav to **modal** **component** rendering **same** **data**.

**Expert Level:** **URL** **sync** with **modal** state; **focus** **trap**; **scroll** **lock**; **analytics** **virtual** **pageviews** on **modal** **open**. **Prefetch** **risk** on **large** **grids**.

```tsx
'use client';

import type { ReactNode } from 'react';

export function Modal({ children }: { children: ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50">
      <div className="mx-auto mt-24 max-w-lg rounded bg-white p-4">{children}</div>
    </div>
  );
}
```

#### Key Points

- **Accessibility** **non-negotiable** for **modals**.
- **Deep** **linking** must **work** after **refresh**.
- **Measure** **INP** on **low-end** **devices**.

---

## 3.7 Loading UI

### loading.tsx Semantics

**Beginner Level:** **`loading.tsx`** is the **instant** **“please wait”** UI for a **route** **segment**—**skeleton** **cards** on a **social** **timeline**.

**Intermediate Level:** Next **wraps** the **segment** in **Suspense** **automatically** for **`loading.tsx`**. **Nested** **`loading`** files **target** **deeper** **routes** **independently**.

**Expert Level:** **Streaming** **HTML** **reduces** **perceived** **latency**; **ensure** **skeleton** **dimensions** **match** **final** **content** to **minimize** **CLS**. **Coordinate** with **React** **`Suspense`** **boundaries** you add **manually** for **finer** **granularity**.

```tsx
export default function Loading() {
  return (
    <ul className="space-y-3" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="h-16 animate-pulse rounded bg-muted" />
      ))}
    </ul>
  );
}
```

#### Key Points

- **Prefer** **skeletons** over **spinners-only** for **layout** **stability**.
- **Nest** **loaders** to **avoid** **whole-page** **flash**.
- **Announce** **busy** state for **a11y**.

---

### Instant Loading States

**Beginner Level:** Users **see** **something** **immediately** while **data** **travels**—**critical** for **mobile** **dashboards** on **slow** **networks**.

**Intermediate Level:** **Instant** **feedback** **pairs** with **prefetching** **`Link`** targets. **Avoid** **layout** **jumps** when **replacing** **skeleton** with **content**.

**Expert Level:** **Perceived** **performance** **metrics** (**LCP**, **CLS**) **drive** **skeleton** **design**. **Reserve** **space** for **ads**/**widgets** with **known** **slots**.

#### Key Points

- **Design** **loading** as **first-class** UX.
- **Align** with **design** **system** **tokens**.
- **Test** **3G** **throttle**.

---

### Streaming and Suspense

**Beginner Level:** **Pieces** of the page **appear** as they **arrive**—**header** first, **recommendations** later on a **store** **PDP**.

**Intermediate Level:** **`Suspense`** **boundaries** around **slow** **components** **stream** **fallbacks**. **`loading.tsx`** is a **segment-level** **Suspense** **boundary**.

**Expert Level:** **Out-of-order** streaming **implications** for **SEO** and **analytics**—**ensure** **critical** **content** **above** the fold is **prioritized**. **Databases** **should** **support** **concurrent** **queries** without **locking**.

```tsx
import { Suspense } from 'react';

async function Reviews() {
  await new Promise((r) => setTimeout(r, 500));
  return <section>Reviews loaded</section>;
}

export default function ProductShell() {
  return (
    <main>
      <h1>SKU-123</h1>
      <Suspense fallback={<div className="h-40 animate-pulse bg-muted" />}>
        <Reviews />
      </Suspense>
    </main>
  );
}
```

#### Key Points

- **Suspense** **boundaries** are **explicit** **streaming** knobs.
- **Do not** **suspend** **everything** behind **one** **boundary** if **avoidable**.
- **Combine** with **`loading.tsx`** **strategically**.

---

### Skeleton Screens

**Beginner Level:** **Gray** **placeholders** mimicking **final** **UI**—**cards**, **avatars** in a **community** app.

**Intermediate Level:** **Match** **typography** **line** **heights** and **image** **ratios**. **Dark** **mode** **variants** too.

**Expert Level:** **Skeleton** **components** in **design** **systems** with **props** for **density** (**compact** admin vs **marketing**). **Internationalization** **length** **changes** **should** **not** **break** **layouts**.

#### Key Points

- **Skeleton** **fidelity** **reduces** **CLS**.
- **Reuse** **tokens** for **colors**/**radii**.
- **Test** **RTL** layouts.

---

### Loading Hierarchy

**Beginner Level:** **Parent** **loading** shows **first**, then **child** **loading** for **nested** **tabs**—like **shell** then **content** in **SaaS**.

**Intermediate Level:** **Nested** **`loading.tsx`** **creates** **cascaded** **fallbacks**. **Avoid** **double** **spinners** **without** **hierarchy** **planning**.

**Expert Level:** **Visual** **design** **guidelines** for **which** **level** **shows** **skeleton** vs **inline** **spinner**. **Performance** **budget** per **segment**.

#### Key Points

- **Plan** **hierarchy** before **coding**.
- **Avoid** **redundant** **full-screen** **loaders**.
- **Coordinate** with **parallel** **route** **slots**.

---

## 3.8 Error Handling

### error.tsx Boundaries

**Beginner Level:** When **code** **throws**, **`error.tsx`** **shows** a **fallback** instead of **crashing** the **whole** **checkout**.

**Intermediate Level:** Must be **`'use client'`**. **Catches** errors in **child** **segments** during **render** (not **all** errors—**event** handlers need **local** **try/catch**).

**Expert Level:** **Distinguish** **expected** failures (**notFound**) vs **exceptional** errors. **Integrate** **Sentry** with **`useEffect`** logging **digest** IDs.

```tsx
'use client';

import { useEffect } from 'react';

export default function SegmentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // report to observability
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <h2>Something broke in this section</h2>
      <button type="button" onClick={() => reset()}>
        Retry
      </button>
    </div>
  );
}
```

#### Key Points

- **`error.tsx` is not** a **catch-all** for **everything**.
- **Log** **digests** for **support** **correlation**.
- **Nested** **errors** **isolate** **blast** **radius**.

---

### error and reset Props

**Beginner Level:** **`error`** tells you **what** failed; **`reset`** **tries** **again**—like **reload** **this** **panel** only.

**Intermediate Level:** **`reset`** **re-renders** the **segment** **boundary**—useful **transient** **network** **errors** fetching **CRM** **widgets**.

**Expert Level:** **Idempotent** **retries**—**avoid** **double** **charges** in **payments** by **separating** **read** retries from **write** **actions** with **server** **dedupe** keys.

#### Key Points

- **Teach** **users** when **retry** is **safe**.
- **Pair** **reset** with **clear** **messaging**.
- **Do not** **retry** **unsafe** **mutations** blindly.

---

### Nested Error Boundaries

**Beginner Level:** **Outer** page **fine**, **inner** **recommendations** **tile** **errors** **alone**—**dashboard** **stays** **usable**.

**Intermediate Level:** **Place** **`error.tsx`** **close** to **risky** **third-party** **embeds** (**analytics**, **maps**).

**Expert Level:** **Fallback** **degradation** strategies: **remove** **widget**, **show** **cached** **stale** **data** with **banner**, **switch** **to** **static** **preview**.

#### Key Points

- **Granular** **boundaries** improve **resilience**.
- **Third-party** **scripts** deserve **local** **error** UI.
- **Monitor** **error** rates **per** **widget**.

---

### global-error.tsx

**Beginner Level:** **Catches** errors **even** in **`root` layout**—**last** **resort** **full-screen** **fallback** for **catastrophic** failures.

**Intermediate Level:** Must **include** its **own** **`<html>`** and **`<body>`** per **docs**—different from **`error.tsx`**.

**Expert Level:** **Branding** **minimal** **fast** **HTML**; **link** to **status** page; **avoid** **heavy** **client** **deps** that **might** **also** **fail**.

```tsx
'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <h1>Critical error</h1>
        <pre>{error.message}</pre>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
```

#### Key Points

- **Rare** **but** **essential** for **true** **root** failures.
- **Keep** **ultra** **simple**.
- **Test** **intentionally** in **staging**.

---

### Recovery Flows

**Beginner Level:** After **error**, **users** **recover** via **retry**, **navigate** **away**, or **contact** **support**—**clear** **CTAs** on **subscription** **billing** errors.

**Intermediate Level:** **`reset`** + **soft** **navigation** patterns; **preserve** **form** **drafts** in **client** storage where **appropriate**.

**Expert Level:** **Saga** **compensation** for **distributed** **transactions**—**UI** **error** **boundary** **does not** **rollback** **DB**; **coordinate** with **server** **idempotency**.

#### Key Points

- **Recovery** is **product** **design**, not **just** **engineering**.
- **Separate** **read**/**write** **recovery** **paths**.
- **Log** **recovery** **actions** for **analytics**.

---

### Production vs Development Errors

**Beginner Level:** **Dev** shows **big** **red** **stack** traces; **prod** shows **sanitized** messages—**protect** **implementation** **details**.

**Intermediate Level:** **`NODE_ENV`** **branches** in **error** **components**—**never** leak **secrets** in **messages**.

**Expert Level:** **Correlation** IDs **surfaced** to **users** for **support** tickets **without** exposing **stack** traces. **Different** **templates** for **API** vs **HTML** routes.

#### Key Points

- **Sanitize** **prod** **UI**.
- **Rich** **logs** **server-side** only.
- **Support** **workflows** **need** **digests**.

---

## 3.9 Not Found Handling

### not-found.tsx UI

**Beginner Level:** Friendly **404** page when **content** **doesn’t** exist—**“This** **tweet** **was** **deleted.”**

**Intermediate Level:** **Route** **segment** **`not-found.tsx`** **styles** **localized** **missing** **states**. **Branding** and **search** **help** **reduce** **bounce**.

**Expert Level:** **A/B** test **404** **helpfulness**; **link** to **popular** **collections** on **e-commerce** **catalog** **holes**.

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <h1>Collection not found</h1>
      <p>Browse active seasons instead.</p>
      <Link href="/shop">Continue shopping</Link>
    </main>
  );
}
```

#### Key Points

- **404** is a **UX** **surface**, not **just** **error** code.
- **Offer** **next** **best** **actions**.
- **Track** **404** **sources**.

---

### notFound() Helper

**Beginner Level:** Call **`notFound()`** when **your** **code** knows **resource** **missing**—**blog** **slug** **invalid**.

**Intermediate Level:** **Throws** a **special** **Next** **signal** caught by **`not-found.tsx`**. **Works** in **Server** **Components** and **route** **handlers**.

**Expert Level:** **Distinguish** **401/403** vs **404**—**authorization** failures **should not** always **map** to **404** (**security** **through** **obscurity** **debate**). **Legal** **requirements** may **mandate** **specific** **messages**.

```typescript
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function Article({ params }: Props) {
  const { id } = await params;
  const res = await fetch(`https://cms.example.com/articles/${id}`, { cache: 'no-store' });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error('CMS error');
  const article = await res.json();
  return <article>{article.title}</article>;
}
```

#### Key Points

- **Prefer** **`notFound()`** over **manual** **redirects** for **missing** **entities**.
- **Map** **HTTP** statuses **deliberately**.
- **Log** **misses** for **content** **teams**.

---

### Custom 404 Experiences

**Beginner Level:** **Branded** illustration, **search** bar, **support** links—**human** **touch** for **SaaS**.

**Intermediate Level:** **Internationalized** strings; **consistent** **nav** chrome via **layouts**.

**Expert Level:** **Edge** **cached** **404** pages vs **dynamic** **personalized** suggestions—**watch** **cache** **poisoning** if **user-specific**.

#### Key Points

- **Invest** in **404** for **high-traffic** **sites**.
- **Measure** **exit** rates post-404.
- **Avoid** **leaking** **PII** in **personalized** 404s.

---

### Route-Specific Not Found

**Beginner Level:** **`/docs/not-found.tsx`** can **differ** from **`/shop/not-found.tsx`**—**contextual** help.

**Intermediate Level:** **Nested** **`not-found`** **resolution** walks **tree**—**ensure** **consistent** **headers**/**footers** from **layouts**.

**Expert Level:** **API** **handlers** **`return NextResponse.json(..., { status: 404 })`** separate from **UI** **`notFound()`**—**align** **client** **expectations**.

#### Key Points

- **Context** improves **recovery**.
- **Match** **API** and **UI** **semantics**.
- **Test** **deep** **routes**.

---

## 3.10 Templates

### template.tsx vs layout.tsx

**Beginner Level:** **Layouts** **stay** mounted; **templates** **remount** on **navigation**—like **keeping** **playlist** **bar** vs **replaying** **page** **intro** **animation** on **each** **song** in a **music** app.

**Intermediate Level:** **Templates** **reset** **local** **state** each **navigation**; **layouts** **preserve** **state**. **Choose** based on **lifecycle** needs.

**Expert Level:** **Performance**: **remount** **cost** **vs** **animation** **requirements**. **Data** fetching in **templates** is **usually** **wrong**—prefer **layouts**/**pages**.

```tsx
'use client';

import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-in fade-in">{children}</div>;
}
```

#### Key Points

- **Default** to **layout**.
- **Template** for **remount** semantics.
- **Profile** **remount** **cost**.

---

### Re-mounting Behavior

**Beginner Level:** Each **click** **between** **sibling** routes **remounts** **template** **subtree**—**animations** **replay**.

**Intermediate Level:** **Key** props **implicit** via **template** **wrapper**. **State** in **template** **children** **resets** unless **lifted** to **layout** or **global** store.

**Expert Level:** **Interaction** with **scroll** **restoration**—**ensure** **UX** **consistency** across **browsers**.

#### Key Points

- **Lift** **state** **up** if it must **persist**.
- **Document** **animation** expectations.
- **Test** **back**/**forward** navigation.

---

### Template Use Cases

**Beginner Level:** **Page** **transitions**, **telemetry** **per** **view** **mount** for **marketing** **funnels**.

**Intermediate Level:** **Enter/exit** animations for **microsites**. **Reset** **forms** when **switching** **tabs** implemented as **routes**.

**Expert Level:** **AB** **test** **mount**/**unmount** hooks; **integrate** **with** **view transitions** API when **available**.

#### Key Points

- **Use** **templates** **sparingly**.
- **Pair** with **accessibility** **reduced** **motion** settings.
- **Measure** **Core** **Web** **Vitals** impact.

---

### Animation and Accessibility

**Beginner Level:** **Respect** **`prefers-reduced-motion`** for **users** sensitive to **motion**—**dashboard** **charts** **should** **not** **spin** wildly.

**Intermediate Level:** **CSS** **animations** on **template** **wrappers**; **avoid** **layout** **thrash**.

**Expert Level:** **Focus** **management** on **route** changes—**coordinate** **templates** with **focus** **scopes** for **SPAs**-like **a11y**.

```tsx
'use client';

import type { ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function AccessibleTemplate({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const className = reduceMotion ? '' : 'motion-safe:animate-in';
  return <div className={className}>{children}</div>;
}
```

#### Key Points

- **Always** **consider** **a11y**.
- **Test** with **OS** **reduced** **motion**.
- **Avoid** **seizure-inducing** flashes.

---

### Segment Config and Caching Knobs (Expert Reference)

**Beginner Level:** Some **magic exports** like **`dynamic`** tell Next **how** **fresh** a page should be—**think** “**always** **new**” vs “**cache** **for** **an** **hour**” on a **deals** page.

**Intermediate Level:** **`export const dynamic = 'force-static' | 'force-dynamic' | 'auto'`** and **`export const revalidate = number`** influence **static** vs **on-demand** behavior. **`fetch`** options **`cache`**, **`next: { revalidate, tags }`** interact with **Data Cache**—**misuse** causes **stale** **prices** or **slow** **TTFB**.

**Expert Level:** **`fetchCache`** segment config (when available in your version) changes **default** **`fetch`** behavior for the **subtree**. **Route handlers** use **`export const dynamic`** similarly. **Edge** runtime **restrictions** apply. **Document** a **matrix** of **routes** × **cache** policy for **SRE** handoffs.

```typescript
export const revalidate = 900; // 15 minutes ISR-style revalidation window (illustrative)

async function getDeals() {
  return fetch('https://api.example.com/deals', {
    next: { tags: ['deals'] },
  }).then((r) => r.json());
}
```

#### Key Points

- **Treat** **caching** as **part** of the **public** **API** of your app.
- **Tag** **invalidation** scales better than **path-only** mental models for **large** **SaaS**.
- **Re-test** after **Next** **upgrades**—defaults **shift**.

---

### Soft Navigation vs Full Load (UX + Data)

**Beginner Level:** Clicking **internal** **links** **feels** **instant** because Next **swaps** **page** **segments** **without** **reloading** the **entire** **browser** tab—like **turning** **TV** **channels** on a **smart** **hub**.

**Intermediate Level:** **RSC** **payloads** **stream** during **soft** navigations; **layouts** **persist** **state**; **scroll** restoration behaves **SPA-like**. **Prefetching** **`Link`** **warms** caches.

**Expert Level:** **Full** reload still happens on **hard** refresh—**parallel**/**intercept** routes must expose **`default.tsx`** and **full** **page** **targets** so **SSR** **matches** **client** **expectations**. **Analytics** pipelines should **distinguish** **soft** vs **hard** navigations using **`usePathname`** + **`useEffect`** in **client** **listeners** or **server** **logs** on **document** requests.

#### Key Points

- **Design** **loading** states for **soft** nav **specifically**.
- **Test** **Cmd+Shift+R** on **modal** routes.
- **Align** **product** **analytics** with **router** **events**.

---

### Internationalization and Segments

**Beginner Level:** Put **`[locale]`** at the top of **`app/`** so **`/en/shop`** and **`/fr/shop`** show **translated** **e-commerce** **copy**.

**Intermediate Level:** **`generateStaticParams`** enumerates **locales**; **dictionaries** loaded per **request**. **Middleware** **rewrites** **default** locale. **`hreflang`** via **metadata**.

**Expert Level:** **Collation** and **slug** **uniqueness** across **languages**; **CMS** **fallback** chains; **RTL** **layout** **flips** at **`layout`** level. **Edge** **geo** hints must **comply** with **privacy** policies.

```tsx
type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  return <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}><body>{children}</body></html>;
}
```

#### Key Points

- **Centralize** **locale** validation.
- **Avoid** **duplicate** **content** without **`canonical`** URLs.
- **Test** **mixed** **LTR/RTL** **components**.

---

### Security Boundaries in the App Router

**Beginner Level:** **Never** put **API** **keys** in files marked **`'use client'`** or **`NEXT_PUBLIC_`** vars—**thieves** can **steal** them from a **social** app’s **bundle**.

**Intermediate Level:** **Server** **Components** and **`server-only`** modules **access** **secrets**; **validate** all **inputs** from **`params`**, **`searchParams`**, **forms**, and **JSON** bodies in **handlers**/**actions**.

**Expert Level:** **CSRF** protections for **cookie** **sessions** with **Server Actions**—**framework** evolves; follow **official** security guidance. **Rate limit** **handlers** at **edge**. **Authorization** at **data** layer, not **UI** **visibility** alone.

#### Key Points

- **Secrets** stay **server-side**.
- **Validate** and **authorize** **every** **mutation** path.
- **Monitor** **abuse** on **public** handlers.

---

### Testing Strategy for App Router Apps

**Beginner Level:** **Click** through **routes** in **Playwright** to ensure **blog** **posts** **load**—**happy** path **smoke** tests.

**Intermediate Level:** **Component** tests for **client** islands; **integration** tests hitting **`next dev`** or **production** build with **MSW** for **APIs**. **Snapshot** **dangerous** for **RSC**—prefer **assertions** on **roles**/text.

**Expert Level:** **Contract** tests between **parallel** **slots** owned by **different** teams; **load** tests on **streaming** endpoints; **chaos** **injections** for **third-party** **failures** covered by **`error.tsx`**.

#### Key Points

- **E2E** **critical** **journeys** (**checkout**, **signup**).
- **Test** **error** and **not-found** paths.
- **Automate** **a11y** checks on **modal** flows.

---

### Observability: What to Log per Route Kind

**Beginner Level:** When **something** breaks on **`/checkout`**, you want **logs** saying **“checkout”**, not **“unknown”**—**name** things clearly for a **small** **store**.

**Intermediate Level:** **Structured** logs from **Server Actions** and **route handlers** include **`route`**, **`userId`**, **`requestId`**, **`revalidateTag`** calls. **Client** errors go to **Sentry** with **breadcrumbs** of **navigation** events.

**Expert Level:** **OpenTelemetry** spans around **`fetch`** to **upstream** **payment** gateways; **trace** **propagation** across **microservices** from **Next** **handlers**. **Sampling** **high-volume** **read** routes; **100%** **sample** **payment** **failures**. **PII** scrubbing in **logs** for **GDPR**.

```typescript
type LogContext = { route: string; requestId: string; orgId?: string };

export function logServerEvent(ctx: LogContext, message: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ level: 'info', msg: message, ...ctx, data }));
}
```

#### Key Points

- **Correlate** **browser** errors with **server** **request** IDs via **headers**.
- **Redact** **secrets** aggressively.
- **Dashboard** **SLOs** per **critical** **segment** (**auth**, **billing**).

---

### Migration Snippets: Pages Router Mental Map

**Beginner Level:** Where **`getStaticProps`** lived, you now often **`await fetch(..., { next: { revalidate } })`** in a **Server Component** for a **catalog** page.

**Intermediate Level:** **`getServerSideProps`** → **`cache: 'no-store'`** or **`dynamic = 'force-dynamic'`**. **`pages/api`** → **`route.ts`**. **`next/head`** → **`metadata` API**.

**Expert Level:** **`getLayout` patterns** (Pages) → **nested `layout.tsx`**. **Incremental** moves: **keep** **`pages`** for **legacy** while **`app`** grows; **redirect** duplicates. **Measure** **cache** regressions when **porting**.

#### Key Points

- **One** route at a time; **feature** flags help.
- **Rewrite** tests, not **copy-paste** old data APIs.
- **Communicate** **timeline** to **stakeholders**.

---

### Performance Review Checklist (Routes)

**Beginner Level:** Ask: **“Does** this **page** **need** **personal** data?” If **no**, **cache** it like a **public** **recipe** blog.

**Intermediate Level:** Checklist: **LCP** image **`priority`?** **Skeleton** **CLS?** **`loading.tsx` present?** **`fetch` cache** correct? **Client** **bundle** **size** for **interactive** **islands**?

**Expert Level:** **Trace** **RSC** **payload** **size** with **tools**; **watch** **server** **CPU** per **request** on **dashboard** grids; **validate** **edge** **compatibility** for **handlers**/**middleware** on **critical** paths; **load** test **streaming** under **concurrent** **users**.

#### Key Points

- **Revisit** checklist on **every** **major** feature.
- **Pair** with **budgets** in **CI** where possible.
- **Treat** **performance** as **product** quality.

---

## Best Practices

- **Model** routes on **user** **tasks**, not only **database** tables.
- **Prefer** **explicit** **dynamic** segments over **giant** catch-alls when **SEO** matters.
- **Add** **`default.tsx`** for **every** **optional** **parallel** slot.
- **Pair** **`loading.tsx`** with **slow** **I/O** **segments**; **skeleton** **layouts** should **mirror** **final** **UI** to **reduce** **CLS**.
- **Keep** **`'use client'`** **leaf**-oriented; **preserve** **RSC** **benefits** and **minimize** **hydration** **cost**.
- **Validate** **`params`** and **`searchParams`** with **Zod** (or similar) on the **server** before **using** in **queries**.
- **Document** **modal**, **parallel**, and **intercepting** route **diagrams** for **team** **onboarding**.
- **Revalidate** caches after **mutations** using **path** or **tag** APIs appropriate to your **Next** **version** and **deployment** model.
- **Place** **`error.tsx`** near **risky** **integrations**; keep **`global-error.tsx`** **minimal** and **tested**.
- **Differentiate** **`notFound()`** vs **thrown** errors vs **403** responses—**align** **security** and **UX** policies.
- **Use** **`template.tsx`** only when **remount** semantics are **required**; **default** to **`layout.tsx`** for **persistent** chrome.
- **Instrument** **per-segment** performance in **staging** (**TTFB**, **LCP**) before **shipping** **complex** streaming layouts.

---

## Common Mistakes to Avoid

- **Omitting** **`default.tsx`** for **optional** **parallel** slots, breaking **hard** **refresh** and **deep** links.
- **Misconfiguring** intercepting route **relative** paths after **folder** **refactors**, leaving **modals** **dead**.
- **Using** **client** **hooks** in **Server** **Components** without a **`'use client'`** boundary—**confusing** **compiler** errors or **runtime** failures.
- **Duplicating** or **conflicting** **`page.tsx`** paths across **route** **groups** unintentionally.
- **Trusting** **`searchParams`** or **`params`** for **authorization** or **pricing** without **server-side** validation against **trusted** **sources**.
- **Overusing** **catch-all** routes, harming **crawl** **budget**, **analytics** **segmentation**, and **cognitive** **load** for **developers**.
- **Placing** **large**, **user-specific** **data** **fetches** in **`layout.tsx`**, slowing **every** **child** route and **complicating** **cache** **reasoning**.
- **Ignoring** **default** **`fetch` caching** semantics—shipping **stale** **inventory** counts or **outdated** **SaaS** **permissions**.
- **Treating** **`error.tsx`** as a **catch-all** for **event** handler errors—those need **local** **handling**.
- **Forgetting** **`global-error.tsx`** **html/body** requirements or **testing** **root** **failure** modes.
- **Using** **`template.tsx`** for **data** fetching—causing **unnecessary** **remount** **fetches** and **janky** UX.
- **Neglecting** **reduced** **motion** and **focus** management when **animating** route **transitions**.

---

*Cross-check folder conventions and APIs with the official Next.js documentation for your pinned version—App Router behavior evolves across minors.*
