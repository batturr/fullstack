# Server-Side Rendering (React + TypeScript)

**Server-side** **rendering** **(SSR)** **generates** **HTML** **on** **the** **server** **for** **each** **request** **(or** **at** **build** **time** **for** **SSG)** **so** **users** **and** **crawlers** **receive** **a** **fully** **formed** **page** **faster.** **It** **powers** **e-commerce** **PLPs/PDPs,** **social** **share** **previews,** **marketing** **sites,** **dashboards** **with** **auth-gated** **HTML,** **and** **content** **portals** **where** **SEO** **and** **first** **paint** **matter.** **TypeScript** **types** **for** **loaders,** **props,** **and** **API** **responses** **keep** **server** **and** **client** **contracts** **aligned.**

---

## 📑 Table of Contents

- [Server-Side Rendering (React + TypeScript)](#server-side-rendering-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [16.1 SSR Basics](#161-ssr-basics)
  - [16.2 Next.js Framework](#162-nextjs-framework)
  - [16.3 Data Fetching in Next.js](#163-data-fetching-in-nextjs)
  - [16.4 Next.js App Router](#164-nextjs-app-router)
  - [16.5 Hydration](#165-hydration)
  - [16.6 Other SSR Solutions](#166-other-ssr-solutions)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 16.1 SSR Basics

### What is SSR?

**Beginner Level**

**SSR** **means** **running** **your** **React** **tree** **on** **a** **server** **to** **produce** **HTML** **strings** **sent** **to** **the** **browser.** **The** **client** **then** **hydrates** **to** **attach** **event** **listeners.**

**Real-time example**: **E-commerce** **product** **page** **HTML** **includes** **title,** **price,** **and** **schema** **for** **SEO** **before** **JavaScript** **loads.**

**Intermediate Level**

**Frameworks** **(Next.js,** **Remix)** **handle** **streaming,** **error** **boundaries,** **and** **data** **loading** **conventions.**

**Expert Level**

**SSR** **can** **be** **per-request** **(dynamic)** **or** **hybrid** **with** **ISR** **or** **static** **segments** **—** **pick** **based** **on** **freshness** **vs** **cost.**

```typescript
export type SsrResult = { html: string; statusCode: number; headers?: Record<string, string> };

// Conceptual: framework renders React to HTML stream/string
export declare function renderToString(element: React.ReactElement): string;
```

#### Key Points — What is SSR

- **HTML** **first,** **JS** **second.**
- **Requires** **hydration** **for** **interactivity.**
- **Frameworks** **encode** **best** **practices.**

---

### SSR vs CSR

**Beginner Level**

**CSR** **(client-side** **rendering)** **ships** **a** **minimal** **shell** **and** **builds** **UI** **in** **the** **browser** **after** **JS** **downloads.** **SSR** **ships** **meaningful** **HTML** **immediately.**

**Real-time example**: **Weather** **widget** **as** **CSR** **might** **show** **a** **spinner** **until** **`fetch`** **completes;** **SSR** **can** **embed** **initial** **forecast** **if** **data** **is** **available** **server-side.**

**Intermediate Level**

**SSR** **adds** **server** **cost** **and** **complexity** **but** **improves** **TTFB** **content** **and** **SEO** **for** **many** **sites.**

**Expert Level**

**Partial** **prerendering** **and** **islands** **blur** **the** **line** **—** **Next.js** **App** **Router** **mixes** **server** **and** **client** **components.**

```typescript
export type RenderingMode = "csr" | "ssr" | "ssg" | "isr" | "hybrid";

export function pickMode(content: "marketing" | "app-shell" | "realtime-dashboard"): RenderingMode {
  if (content === "marketing") return "ssg";
  if (content === "app-shell") return "csr";
  return "hybrid";
}
```

#### Key Points — SSR vs CSR

- **CSR** **simpler** **to** **host** **as** **static** **files** **sometimes.**
- **SSR/SSG** **better** **for** **SEO** **and** **first** **contentful** **paint** **of** **HTML.**
- **Hybrid** **is** **common** **in** **large** **products.**

---

### Benefits and Trade-offs

**Beginner Level**

**Benefits:** **SEO,** **faster** **first** **HTML,** **better** **link** **previews.** **Trade-offs:** **server** **load,** **latency** **to** **TTFB,** **hydration** **cost,** **complexity.**

**Real-time example**: **Social** **—** **OG** **tags** **and** **visible** **content** **for** **crawlers** **benefit** **from** **SSR/SSG.**

**Intermediate Level**

**Caching** **at** **CDN** **(ISR,** **static** **pages)** **mitigates** **SSR** **cost.**

**Expert Level**

**Personalized** **SSR** **is** **harder** **to** **cache** **—** **edge** **functions** **and** **segmented** **caching** **strategies** **apply.**

```typescript
export type TradeOff = { benefit: string; cost: string };

export const ssrTradeoffs: TradeOff[] = [
  { benefit: "Rich HTML for crawlers", cost: "Server CPU per request (unless cached)" },
  { benefit: "Faster meaningful first paint", cost: "Hydration JS still required for interactivity" },
];
```

#### Key Points — Benefits / Trade-offs

- **No** **free** **lunch** **—** **measure** **TTFB,** **LCP,** **TTI.**
- **Cache** **aggressively** **where** **possible.**
- **Personalization** **fights** **CDN** **caching** **—** **design** **explicitly.**

---

### SEO Considerations

**Beginner Level**

**Search** **engines** **execute** **JS** **better** **than** **before,** **but** **server-rendered** **HTML** **still** **reduces** **risk** **and** **improves** **discoverability** **for** **many** **sites.**

**Real-time example**: **E-commerce** **category** **pages** **with** **SSR/SSG** **expose** **product** **snippets** **to** **crawlers** **without** **waiting** **for** **client** **bundles.**

**Intermediate Level**

**Use** **metadata** **APIs** **(Next** **`generateMetadata`)** **for** **titles/descriptions/OG** **tags.**

**Expert Level**

**Structured** **data** **(JSON-LD)** **in** **SSR** **HTML** **improves** **rich** **results** **—** **validate** **with** **Google** **Rich** **Results** **Test.**

```tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

#### Key Points — SEO

- **SSR/SSG** **for** **indexable** **pages.**
- **Metadata** **and** **canonical** **URLs** **matter.**
- **Validate** **structured** **data.**

---

### Initial Load Performance

**Beginner Level**

**Users** **see** **content** **sooner** **when** **HTML** **arrives** **with** **real** **text** **instead** **of** **empty** **divs** **+** **spinners.**

**Real-time example**: **News** **article** **—** **SSR** **shows** **headline** **and** **lede** **immediately** **while** **hydration** **loads.**

**Intermediate Level**

**Streaming** **HTML** **improves** **perceived** **speed** **by** **flushing** **shell** **early** **(Next.js** **App** **Router,** **Suspense).**

**Expert Level**

**Measure** **LCP** **elements** **—** **optimize** **images** **with** **priority** **hints,** **sizes,** **and** **CDN.**

```typescript
export type WebVital = "TTFB" | "FCP" | "LCP" | "INP" | "CLS";

export const goal: Record<WebVital, string> = {
  TTFB: "Fast server/stream start",
  FCP: "First paint with content",
  LCP: "Hero image/text visible quickly",
  INP: "Input responsiveness after hydration",
  CLS: "No layout shift from late-loading fonts/images",
};
```

#### Key Points — Initial Load

- **SSR** **helps** **FCP/LCP** **when** **HTML** **is** **meaningful.**
- **Streaming** **helps** **perceived** **performance.**
- **Hydration** **still** **costs** **—** **reduce** **client** **JS.**

---

## 16.2 Next.js Framework

### Next.js Basics

**Beginner Level**

**Next.js** **is** **a** **React** **framework** **with** **routing,** **data** **fetching** **primitives,** **image** **optimization,** **and** **deployment** **integrations** **(Vercel** **or** **self-hosted).**

**Real-time example**: **Dashboard** **SaaS** **often** **uses** **Next** **for** **auth** **pages** **+** **app** **routes.**

**Intermediate Level**

**Choose** **between** **Pages** **Router** **(legacy** **but** **stable)** **and** **App** **Router** **(React** **Server** **Components** **by** **default).**

**Expert Level**

**Monorepos** **often** **share** **packages** **for** **types,** **UI,** **and** **API** **clients** **between** **Next** **and** **other** **services.**

```json
{
  "name": "my-storefront",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

#### Key Points — Next.js Basics

- **Batteries** **included** **for** **production** **React** **sites.**
- **Two** **routers** **to** **understand** **(Pages** **vs** **App).**
- **Strong** **TypeScript** **support** **when** **configured.**

---

### Pages Directory (Pages Router)

**Beginner Level**

**`pages/index.tsx`** **maps** **to** **`/`;** **`pages/product/[id].tsx`** **is** **a** **dynamic** **route.**

**Real-time example**: **E-commerce** **`pages/p/[slug].tsx`** **for** **product** **detail** **pages.**

**Intermediate Level**

**`pages/api/*`** **defines** **API** **routes** **as** **serverless** **functions.**

**Expert Level**

**Incremental** **adoption** **to** **App** **Router** **can** **be** **done** **incrementally** **in** **some** **versions** **—** **follow** **migration** **docs.**

```tsx
// pages/index.tsx (Pages Router)
import type { NextPage } from "next";

const Home: NextPage = () => {
  return <main>Welcome</main>;
};

export default Home;
```

#### Key Points — Pages Directory

- **File-based** **routing** **in** **`pages/`.**
- **`getServerSideProps`** **/** **`getStaticProps`** **live** **here** **(legacy** **data** **APIs).**
- **Still** **valid** **for** **many** **production** **apps.**

---

### App Directory / App Router

**Beginner Level**

**`app/page.tsx`** **is** **the** **`/`** **route** **in** **the** **App** **Router.** **Nested** **folders** **define** **nested** **routes.**

**Real-time example**: **`app/dashboard/analytics/page.tsx`** **→** **`/dashboard/analytics`.**

**Intermediate Level**

**`layout.tsx`** **wraps** **segments;** **`loading.tsx`** **and** **`error.tsx`** **provide** **conventions.**

**Expert Level**

**Server** **Components** **are** **default;** **client** **interactivity** **requires** **`"use client"`.**

```tsx
// app/page.tsx (App Router)
export default function Page() {
  return <main>Home (App Router)</main>;
}
```

#### Key Points — App Directory

- **Server** **Components** **by** **default.**
- **Colocated** **loading/error** **UI.**
- **Streaming** **first-class.**

---

### File-based Routing

**Beginner Level**

**Folders** **and** **`page.tsx`** **files** **define** **URL** **segments;** **`[id]`** **dynamic** **segments** **capture** **params.**

**Real-time example**: **Social** **`app/u/[handle]/page.tsx`** **for** **profiles.**

**Intermediate Level**

**Route** **groups** **`(marketing)`** **organize** **without** **affecting** **URL.**

**Expert Level**

**Parallel** **and** **intercepting** **routes** **for** **modals** **and** **advanced** **UX** **(see** **Next** **docs).**

```text
app/
  (shop)/
    products/
      [slug]/
        page.tsx
```

#### Key Points — File-based Routing

- **Predictable** **URL** **↔** **file** **mapping.**
- **Dynamic** **segments** **for** **IDs/slugs.**
- **Groups** **for** **organization.**

---

### API Routes

**Beginner Level**

**Pages** **Router:** **`pages/api/hello.ts`** **exports** **a** **handler.** **App** **Router:** **`route.ts`** **with** **`GET`/`POST`** **exports.**

**Real-time example**: **Todo** **app** **`POST /api/todos`** **persists** **tasks** **(demo).**

**Intermediate Level**

**Prefer** **separate** **backend** **for** **heavy** **business** **logic** **in** **large** **systems;** **Next** **API** **for** **BFF** **patterns.**

**Expert Level**

**Edge** **runtime** **for** **low-latency** **globally** **distributed** **handlers** **when** **appropriate.**

```typescript
// app/api/health/route.ts (App Router)
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true });
}
```

#### Key Points — API Routes

- **Quick** **BFF** **endpoints.**
- **Mind** **cold** **starts** **on** **serverless.**
- **Type** **request/response** **with** **Zod** **for** **safety.**

---

### Middleware

**Beginner Level**

**`middleware.ts`** **runs** **on** **the** **edge** **before** **a** **request** **completes** **—** **useful** **for** **rewrites,** **A/B,** **auth** **checks.**

**Real-time example**: **Dashboard** **redirect** **unauthenticated** **users** **from** **`/app/*`.**

**Intermediate Level**

**Keep** **middleware** **fast** **—** **no** **heavy** **DB** **calls** **unless** **necessary** **(often** **verify** **JWT** **signature** **only).**

**Expert Level**

**Geolocation** **headers** **and** **experiments** **at** **the** **edge** **for** **personalization.**

```typescript
// middleware.ts (sketch)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token && req.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*"] };
```

#### Key Points — Middleware

- **Edge** **execution** **model.**
- **Great** **for** **lightweight** **gates.**
- **Avoid** **slow** **IO** **on** **critical** **path.**

---

## 16.3 Data Fetching in Next.js

### getServerSideProps

**Beginner Level**

**`getServerSideProps`** **(Pages** **Router)** **runs** **on** **each** **request** **and** **passes** **props** **to** **the** **page** **—** **classic** **SSR** **data** **loading.**

**Real-time example**: **E-commerce** **stock** **levels** **that** **must** **be** **fresh** **per** **request.**

**Intermediate Level**

**Use** **only** **in** **`pages/`** **—** **not** **App** **Router** **(different** **patterns).**

**Expert Level**

**Consider** **caching** **headers** **and** **CDN** **behavior** **when** **possible** **to** **reduce** **origin** **load.**

```typescript
import type { GetServerSideProps } from "next";

type Props = { product: { id: string; title: string } };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = ctx.params?.id;
  const res = await fetch(`https://api.example.com/products/${id}`);
  if (!res.ok) return { notFound: true };
  const product = (await res.json()) as Props["product"];
  return { props: { product } };
};

export default function ProductPage({ product }: Props) {
  return <h1>{product.title}</h1>;
}
```

#### Key Points — getServerSideProps

- **Per-request** **fresh** **data.**
- **Pages** **Router** **only.**
- **Adds** **TTFB** **latency** **—** **measure.**

---

### getStaticProps

**Beginner Level**

**`getStaticProps`** **runs** **at** **build** **time** **(or** **on** **revalidation)** **and** **pre-renders** **pages** **to** **static** **HTML.**

**Real-time example**: **Marketing** **blog** **posts** **built** **from** **CMS.**

**Intermediate Level**

**Combine** **with** **`getStaticPaths`** **for** **dynamic** **routes** **at** **build.**

**Expert Level**

**Preview** **mode** **for** **draft** **content** **from** **CMS.**

```typescript
import type { GetStaticProps } from "next";

type Props = { title: string };

export const getStaticProps: GetStaticProps<Props> = async () => {
  return { props: { title: "Hello SSG" } };
};

export default function Page({ title }: Props) {
  return <main>{title}</main>;
}
```

#### Key Points — getStaticProps

- **Fast** **CDN** **delivery.**
- **Stale** **until** **rebuild** **or** **ISR.**
- **Great** **for** **mostly-static** **content.**

---

### getStaticPaths

**Beginner Level**

**For** **dynamic** **`[id]`** **pages** **with** **SSG,** **`getStaticPaths`** **declares** **which** **paths** **to** **pre-render** **at** **build** **and** **fallback** **behavior.**

**Real-time example**: **E-commerce** **top** **N** **SKUs** **prebuilt;** **long** **tail** **on-demand.**

**Intermediate Level**

**`fallback: "blocking"`** **waits** **for** **HTML** **on** **first** **miss;** **`true`** **can** **show** **fallback** **UI.**

**Expert Level**

**Incremental** **builds** **for** **large** **catalogs** **—** **batch** **path** **generation.**

```typescript
import type { GetStaticPaths } from "next";

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = ["a", "b", "c"];
  return { paths: ids.map((id) => ({ params: { id } })), fallback: "blocking" };
};
```

#### Key Points — getStaticPaths

- **Controls** **which** **dynamic** **routes** **exist** **at** **build.**
- **Fallback** **strategies** **matter** **for** **UX.**
- **Scale** **path** **generation** **carefully.**

---

### ISR (Incremental Static Regeneration)

**Beginner Level**

**ISR** **revalidates** **static** **pages** **after** **a** **time** **window** **`revalidate: N`** **seconds** **—** **blend** **of** **static** **speed** **and** **freshness.**

**Real-time example**: **Weather** **city** **pages** **rebuild** **every** **10** **minutes.**

**Intermediate Level**

**On-demand** **revalidation** **via** **API** **routes** **for** **CMS** **webhooks.**

**Expert Level**

**Understand** **stale-while-revalidate** **behavior** **and** **cache** **invalidation** **at** **CDN.**

```typescript
export async function getStaticProps() {
  const data = await fetch("https://api.example.com/featured").then((r) => r.json());
  return { props: { data }, revalidate: 60 };
}
```

#### Key Points — ISR

- **Popular** **for** **catalog** **freshness.**
- **Not** **instant** **invalidation** **by** **default.**
- **Pair** **with** **webhooks** **for** **critical** **updates.**

---

### Server Components

**Beginner Level**

**React** **Server** **Components** **render** **on** **the** **server** **and** **send** **a** **serialized** **tree** **to** **the** **client** **—** **no** **`useState`** **on** **the** **server** **component** **itself.**

**Real-time example**: **Dashboard** **server** **fetches** **KPI** **JSON** **and** **renders** **tables** **without** **shipping** **fetch** **code** **to** **client** **for** **that** **segment.**

**Intermediate Level**

**Pass** **serializable** **props** **to** **client** **components.**

**Expert Level**

**Security:** **don’t** **expose** **secrets** **in** **client** **bundles** **—** **keep** **them** **in** **server** **modules.**

```tsx
// Server Component (default in app/)
async function ServerKpi() {
  const res = await fetch("https://api.example.com/kpi", { next: { revalidate: 30 } });
  const data = (await res.json()) as { revenue: number };
  return <div>Revenue: {data.revenue}</div>;
}

export default function Page() {
  return (
    <main>
      <ServerKpi />
    </main>
  );
}
```

#### Key Points — Server Components

- **Reduce** **client** **JS.**
- **Direct** **backend/data** **access** **patterns** **(framework-specific).**
- **Compose** **with** **client** **components.**

---

### Client Components

**Beginner Level**

**Mark** **files** **with** **`"use client"`** **at** **the** **top** **when** **you** **need** **`useState`,** **effects,** **or** **browser** **APIs.**

**Real-time example**: **Chat** **composer** **with** **`useState`** **for** **draft** **text.**

**Intermediate Level**

**Push** **`"use client"`** **to** **leaves** **—** **avoid** **making** **the** **entire** **tree** **client.**

**Expert Level**

**Boundary** **serialization** **costs** **—** **large** **props** **to** **client** **children** **still** **matter.**

```tsx
"use client";

import { useState } from "react";

export function ChatComposer() {
  const [text, setText] = useState("");
  return <textarea value={text} onChange={(e) => setText(e.target.value)} />;
}
```

#### Key Points — Client Components

- **Needed** **for** **interactivity.**
- **Minimize** **client** **surface** **area.**
- **Colocate** **with** **hooks.**

---

### Data-fetching Patterns (summary)

**Beginner Level**

**App** **Router:** **`fetch`** **in** **Server** **Components,** **Route** **Handlers,** **or** **client** **hooks** **(TanStack** **Query).** **Pages** **Router:** **`getServerSideProps`/`getStaticProps`.**

**Real-time example**: **Social** **feed** **—** **server** **component** **for** **first** **page,** **client** **infinite** **scroll** **for** **more.**

**Intermediate Level**

**Choose** **cache** **semantics** **`cache`,** **`next: { revalidate }`,** **`no-store`.**

**Expert Level**

**Deduplicate** **`fetch`** **requests** **automatically** **in** **Next** **—** **understand** **the** **caching** **model.**

```typescript
export type FetchCache = "force-cache" | "no-store";

export async function fetchJson<T>(url: string, cache: FetchCache): Promise<T> {
  const res = await fetch(url, { cache });
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}
```

#### Key Points — Patterns

- **Match** **freshness** **to** **business** **need.**
- **Server** **for** **initial** **payload;** **client** **for** **interaction.**
- **Read** **Next** **cache** **docs** **carefully.**

---

## 16.4 Next.js App Router

### Server Components by Default

**Beginner Level**

**Files** **in** **`app/`** **without** **`"use client"`** **are** **Server** **Components** **—** **they** **can** **async** **fetch** **and** **omit** **client** **hooks.**

**Real-time example**: **E-commerce** **category** **HTML** **rendered** **on** **server** **with** **product** **list.**

**Intermediate Level**

**Imports** **of** **client** **components** **compose** **into** **server** **trees.**

**Expert Level**

**Watch** **what** **gets** **serialized** **across** **the** **boundary.**

```tsx
export default async function Category({ params }: { params: { slug: string } }) {
  const res = await fetch(`https://api.example.com/c/${params.slug}`, { next: { revalidate: 300 } });
  const data = (await res.json()) as { items: { id: string; title: string }[] };
  return (
    <ul>
      {data.items.map((i) => (
        <li key={i.id}>{i.title}</li>
      ))}
    </ul>
  );
}
```

#### Key Points — Server Default

- **Smaller** **client** **bundles.**
- **Async** **components** **supported.**
- **Clear** **client** **boundaries.**

---

### 'use client'

**Beginner Level**

**Directive** **`"use client"`** **marks** **the** **entry** **to** **client** **module** **graph** **for** **that** **file** **and** **its** **imports** **(subject** **to** **rules).**

**Real-time example**: **Todo** **checkbox** **component** **with** **local** **state.**

**Intermediate Level**

**Don’t** **add** **`"use client"`** **to** **every** **file** **—** **push** **to** **leaves.**

**Expert Level**

**Third-party** **libraries** **that** **use** **hooks** **must** **be** **imported** **from** **client** **components.**

```tsx
"use client";

import { useRouter } from "next/navigation";

export function GoHome() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.push("/")}>
      Home
    </button>
  );
}
```

#### Key Points — use client

- **Leaf** **placement** **is** **ideal.**
- **Enables** **hooks** **and** **browser** **APIs.**
- **Impacts** **bundle** **size.**

---

### 'use server' (Server Actions)

**Beginner Level**

**`"use server"`** **marks** **async** **functions** **that** **run** **on** **the** **server** **and** **can** **be** **called** **from** **client** **forms** **(framework** **handles** **serialization).**

**Real-time example**: **Dashboard** **“Save** **settings”** **POST** **without** **writing** **a** **separate** **API** **route** **manually.**

**Intermediate Level**

**Validate** **inputs** **on** **the** **server** **with** **Zod** **always.**

**Expert Level**

**Security:** **treat** **as** **public** **endpoints** **—** **authz** **checks** **required.**

```tsx
"use server";

import { revalidatePath } from "next/cache";

export async function saveNote(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  await fetch("https://api.example.com/notes", { method: "POST", body: JSON.stringify({ title }) });
  revalidatePath("/notes");
}
```

#### Key Points — use server

- **Colocate** **mutations** **with** **UI.**
- **Must** **validate** **and** **authorize.**
- **Use** **`revalidatePath`/`revalidateTag`** **for** **cache** **updates.**

---

### Streaming and Suspense

**Beginner Level**

**App** **Router** **streams** **HTML** **as** **segments** **resolve** **—** **wrap** **slow** **server** **components** **in** **`Suspense`.**

**Real-time example**: **Weather** **page** **shows** **layout** **immediately** **while** **forecast** **suspends.**

**Intermediate Level**

**`loading.tsx`** **provides** **instant** **fallback** **for** **route** **segments.**

**Expert Level**

**Tune** **skeleton** **layout** **to** **reduce** **CLS.**

```tsx
import { Suspense } from "react";

async function Slow() {
  await new Promise((r) => setTimeout(r, 500));
  return <div>Loaded</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Skeleton…</div>}>
      <Slow />
    </Suspense>
  );
}
```

#### Key Points — Streaming + Suspense

- **Better** **perceived** **performance.**
- **Nest** **boundaries.**
- **Design** **skeletons** **carefully.**

---

### Loading UI

**Beginner Level**

**`app/segment/loading.tsx`** **automatically** **wraps** **the** **segment** **in** **Suspense** **with** **that** **fallback.**

**Real-time example**: **E-commerce** **PLP** **shows** **product** **grid** **skeleton.**

**Intermediate Level**

**Match** **skeleton** **dimensions** **to** **final** **UI** **to** **minimize** **CLS.**

**Expert Level**

**Combine** **with** **instant** **search** **param** **loading** **states** **for** **filters.**

```tsx
export default function Loading() {
  return <div aria-busy="true">Loading products…</div>;
}
```

#### Key Points — Loading UI

- **First-class** **route** **loading.**
- **Accessibility:** **`aria-busy`.**
- **Visual** **continuity** **matters.**

---

### Error Handling

**Beginner Level**

**`error.tsx`** **captures** **errors** **in** **a** **segment** **and** **allows** **reset** **buttons.**

**Real-time example**: **Dashboard** **widget** **failure** **doesn’t** **white-screen** **the** **entire** **app.**

**Intermediate Level**

**Log** **to** **observability** **from** **error** **components** **(client** **boundary** **constraints** **apply).**

**Expert Level**

**Distinguish** **expected** **errors** **(404)** **via** **`notFound()`** **in** **server** **code.**

```tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert">
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
```

#### Key Points — Error Handling

- **Route-level** **resilience.**
- **User-facing** **recovery.**
- **Logging** **and** **alerting.**

---

### Layouts and Templates

**Beginner Level**

**`layout.tsx`** **persists** **across** **navigations** **within** **the** **segment** **(state** **in** **layout** **children** **preserved).** **`template.tsx`** **remounts** **on** **navigation** **(fresh** **effects).**

**Real-time example**: **Social** **app** **sidebar** **layout** **vs** **page** **enter** **animations** **in** **template.**

**Intermediate Level**

**Put** **shared** **chrome** **in** **`layout`.** **Use** **`template`** **when** **you** **need** **remount** **behavior.**

**Expert Level**

**Nested** **layouts** **for** **complex** **apps** **(shop** **vs** **account** **areas).**

```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <nav>Sidebar</nav>
      <section>{children}</section>
    </div>
  );
}
```

#### Key Points — Layouts + Templates

- **Layouts** **for** **persistent** **UI.**
- **Templates** **for** **per-navigation** **reset.**
- **Plan** **nested** **structure** **early.**

---

## 16.5 Hydration

### What is Hydration?

**Beginner Level**

**Hydration** **attaches** **React** **event** **listeners** **to** **server-rendered** **DOM** **and** **reconciles** **the** **tree.**

**Real-time example**: **Todo** **list** **HTML** **from** **SSR** **becomes** **interactive** **after** **`hydrateRoot`.**

**Intermediate Level**

**Server** **and** **client** **trees** **must** **match** **for** **correct** **hydration.**

**Expert Level**

**Streaming** **and** **Suspense** **affect** **hydration** **ordering** **—** **follow** **framework** **rules.**

```tsx
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";

const el = document.getElementById("root");
if (el) hydrateRoot(el, <App />);
```

#### Key Points — What is Hydration

- **Makes** **SSR** **interactive.**
- **Requires** **matching** **output.**
- **Costs** **main-thread** **time.**

---

### Hydration Errors

**Beginner Level**

**Mismatches** **(different** **text,** **extra** **nodes)** **cause** **React** **warnings** **and** **can** **force** **client** **re-renders.**

**Real-time example**: **Random** **`Date.now()`** **in** **render** **differs** **server** **vs** **client.**

**Intermediate Level**

**`suppressHydrationWarning`** **only** **for** **known** **benign** **cases** **(e.g.,** **timestamps).**

**Expert Level**

**Third-party** **scripts** **mutating** **DOM** **before** **hydration** **break** **trees.**

```tsx
export function Clock() {
  return <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>;
}
```

#### Key Points — Hydration Errors

- **Avoid** **non-deterministic** **render** **output.**
- **Guard** **browser-only** **APIs** **in** **`useEffect`.**
- **Investigate** **extensions** **and** **tag** **managers** **if** **mystery** **mismatches.**

---

### Selective Hydration

**Beginner Level**

**Modern** **frameworks** **can** **hydrate** **priority** **parts** **first** **(e.g.,** **interactive** **regions)** **while** **deferring** **others.**

**Real-time example**: **E-commerce** **above-the-fold** **buy** **box** **hydrates** **before** **reviews** **section.**

**Intermediate Level**

**Client** **component** **boundaries** **define** **hydration** **units** **in** **Next** **App** **Router.**

**Expert Level**

**“Islands”** **architecture** **(Astro** **etc.)** **takes** **this** **further** **—** **mostly** **static** **HTML** **with** **small** **hydrated** **widgets.**

```typescript
export type HydrationPriority = "high" | "low";

export function markHydrationPriority(_: HydrationPriority) {
  // Framework-specific hints vary; concept only
}
```

#### Key Points — Selective Hydration

- **Improves** **INP** **for** **critical** **UI.**
- **Split** **client** **components** **thoughtfully.**
- **Measure** **real** **devices.**

---

### Progressive Hydration

**Beginner Level**

**Defer** **hydration** **of** **below-the-fold** **or** **non-critical** **widgets** **until** **idle** **or** **visible.**

**Real-time example**: **Dashboard** **footer** **chat** **widget** **loads** **after** **main** **charts** **interactive.**

**Intermediate Level**

**IntersectionObserver** **or** **requestIdleCallback** **to** **trigger** **import** **of** **client** **chunks.**

**Expert Level**

**Balance** **with** **SEO** **and** **a11y** **—** **ensure** **critical** **flows** **work** **without** **waiting** **for** **deferred** **hydration.**

```tsx
"use client";

import { useEffect, useState } from "react";

export function DeferredChat() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = requestIdleCallback(() => setShow(true));
    return () => cancelIdleCallback(id);
  }, []);
  return show ? <div>Chat</div> : null;
}
```

#### Key Points — Progressive Hydration

- **Cuts** **main-thread** **work** **early.**
- **Don’t** **defer** **critical** **paths.**
- **Test** **on** **slow** **phones.**

---

## 16.6 Other SSR Solutions

### Remix

**Beginner Level**

**Remix** **is** **a** **full-stack** **React** **framework** **centering** **on** **web** **standards:** **loaders/actions,** **forms,** **and** **nested** **routing.**

**Real-time example**: **Todo** **app** **with** **progressive** **enhancement** **—** **forms** **work** **without** **JS.**

**Intermediate Level**

**Colocated** **data** **loading** **with** **routes** **reduces** **waterfalls** **when** **done** **well.**

**Expert Level**

**Great** **for** **CRUD** **apps** **and** **content** **sites** **with** **strong** **UX** **around** **navigation** **and** **errors.**

```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  return { product: { id: params.id, title: "Demo" } };
}
```

#### Key Points — Remix

- **Loaders/actions** **first-class.**
- **Nested** **routes** **and** **error** **boundaries.**
- **Evaluate** **vs** **Next** **for** **your** **team.**

---

### Gatsby (SSG)

**Beginner Level**

**Gatsby** **excels** **at** **static** **site** **generation** **with** **a** **GraphQL** **data** **layer** **and** **plugin** **ecosystem.**

**Real-time example**: **Marketing** **site** **with** **CMS** **sourcing** **and** **image** **pipelines.**

**Intermediate Level**

**Build** **times** **can** **grow** **with** **large** **sites** **—** **incremental** **builds** **matter.**

**Expert Level**

**Consider** **vs** **Next** **SSG/ISR** **depending** **on** **ecosystem** **and** **hosting.**

```typescript
// gatsby-node / page queries are project-specific; concept only
export type GatsbyPageContext = { slug: string };
```

#### Key Points — Gatsby

- **Strong** **for** **content** **sites.**
- **Plugin** **ecosystem.**
- **Assess** **build** **scalability.**

---

### Custom SSR with Express

**Beginner Level**

**You** **can** **`renderToString`** **or** **`renderToPipeableStream`** **in** **an** **Express** **handler** **per** **request** **—** **full** **control,** **full** **responsibility.**

**Real-time example**: **Internal** **dashboard** **with** **existing** **Node** **monolith.**

**Intermediate Level**

**Handle** **streaming,** **errors,** **asset** **paths,** **and** **caching** **yourself** **or** **use** **a** **framework.**

**Expert Level**

**Security** **(XSS,** **CSRF),** **performance,** **and** **observability** **are** **on** **you.**

```typescript
import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";

const app = express();

app.get("/", (_req, res) => {
  const html = renderToString(<div>Hello SSR</div>);
  res.send(`<!doctype html><html><body><div id="root">${html}</div></body></html>`);
});

app.listen(3000);
```

#### Key Points — Custom Express SSR

- **Maximum** **flexibility.**
- **High** **maintenance** **burden.**
- **Prefer** **frameworks** **unless** **you** **need** **custom** **infra.**

---

## Key Points (Chapter Summary)

- **SSR** **delivers** **HTML** **early** **for** **SEO** **and** **FCP;** **CSR** **shifts** **work** **to** **the** **browser.**
- **Next.js** **dominates** **React** **full-stack** **with** **Pages** **and** **App** **Routers,** **API** **routes,** **and** **middleware.**
- **Data** **fetching** **patterns** **differ** **by** **router:** **GSSP/GSP/ISR** **vs** **Server** **Components** **+** **`fetch`** **cache.**
- **App** **Router** **defaults** **to** **Server** **Components;** **use** **`"use client"`** **and** **`"use server"`** **deliberately.**
- **Hydration** **connects** **server** **HTML** **to** **client** **React** **—** **avoid** **mismatches.**
- **Remix,** **Gatsby,** **and** **custom** **Express** **SSR** **serve** **different** **trade-offs.**

---

## Best Practices (Global)

- **Choose** **rendering** **mode** **per** **route** **based** **on** **freshness,** **auth,** **and** **SEO.**
- **Minimize** **client** **JS** **with** **Server** **Components** **and** **lazy** **client** **leaves.**
- **Validate** **all** **server** **inputs** **(actions,** **API** **routes).**
- **Design** **loading** **and** **error** **UI** **per** **segment** **to** **avoid** **global** **spinners.**
- **Measure** **TTFB,** **LCP,** **INP,** **CLS** **in** **field** **data.**
- **Avoid** **hydration** **mismatches** **with** **deterministic** **server** **rendering.**
- **Use** **CDN** **caching** **and** **ISR** **where** **personalization** **allows.**

---

## Common Mistakes to Avoid

- **Using** **browser-only** **APIs** **`window`/`localStorage`** **in** **Server** **Components.**
- **Accidentally** **importing** **heavy** **client** **libraries** **into** **server** **modules** **(bundle** **bloat).**
- **Non-deterministic** **renders** **causing** **hydration** **mismatches.**
- **Treating** **Server** **Actions** **as** **trusted** **without** **authz** **checks.**
- **Assuming** **`getServerSideProps`** **works** **in** **App** **Router** **—** **different** **model.**
- **Ignoring** **TTFB** **regressions** **when** **adding** **SSR** **data** **waterfalls.**
- **Over-custom** **Express** **SSR** **without** **security** **hardening** **and** **monitoring.**

---
