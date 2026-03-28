# Next.js Metadata and SEO — Complete Guide (App Router & Pages Router)

This guide explains how **metadata** and **SEO** work in **Next.js** with **TypeScript**: the **Metadata API** and **`generateMetadata`** in the **App Router**, **`next/head`** in the **Pages Router**, **Open Graph**, **Twitter Cards**, **icons**, and production patterns including **JSON-LD**, **sitemaps**, and **internationalization**. Examples span **e‑commerce product pages**, **blog posts**, **authenticated dashboards**, and **SaaS landing pages**.

## 📑 Table of Contents

- [15.1 Metadata API (App Router)](#151-metadata-api-app-router)
  - [15.1.1 `metadata` Object Export](#1511-metadata-object-export)
  - [15.1.2 `generateMetadata` Function](#1512-generatemetadata-function)
  - [15.1.3 Static Metadata](#1513-static-metadata)
  - [15.1.4 Dynamic Metadata](#1514-dynamic-metadata)
  - [15.1.5 Metadata Inheritance](#1515-metadata-inheritance)
- [15.2 Basic Metadata](#152-basic-metadata)
  - [15.2.1 `title` Property](#1521-title-property)
  - [15.2.2 `description` Property](#1522-description-property)
  - [15.2.3 `keywords` Property](#1523-keywords-property)
  - [15.2.4 `authors` Property](#1524-authors-property)
  - [15.2.5 `creator` Property](#1525-creator-property)
  - [15.2.6 `applicationName` Property](#1526-applicationname-property)
- [15.3 Open Graph Metadata](#153-open-graph-metadata)
  - [15.3.1 `openGraph` Configuration](#1531-opengraph-configuration)
  - [15.3.2 `og:title`](#1532-ogtitle)
  - [15.3.3 `og:description`](#1533-ogdescription)
  - [15.3.4 `og:image`](#1534-ogimage)
  - [15.3.5 `og:url`](#1535-ogurl)
  - [15.3.6 `og:type`](#1536-ogtype)
  - [15.3.7 `og:locale`](#1537-oglocale)
- [15.4 Twitter Card Metadata](#154-twitter-card-metadata)
  - [15.4.1 `twitter` Configuration](#1541-twitter-configuration)
  - [15.4.2 `twitter:card`](#1542-twittercard)
  - [15.4.3 `twitter:title`](#1543-twittertitle)
  - [15.4.4 `twitter:description`](#1544-twitterdescription)
  - [15.4.5 `twitter:image`](#1545-twitterimage)
  - [15.4.6 `twitter:creator`](#1546-twittercreator)
- [15.5 Favicon and Icons](#155-favicon-and-icons)
  - [15.5.1 Icon Files (`icon.ico` / `icon.png`)](#1551-icon-files-iconico--iconpng)
  - [15.5.2 Apple Touch Icons (`apple-icon.png`)](#1552-apple-touch-icons-apple-iconpng)
  - [15.5.3 Dynamic Icons](#1553-dynamic-icons)
  - [15.5.4 Icon Sizes](#1554-icon-sizes)
- [15.6 Head Component (Pages Router)](#156-head-component-pages-router)
  - [15.6.1 `next/head` Import](#1561-nexthead-import)
  - [15.6.2 Setting Title](#1562-setting-title)
  - [15.6.3 Meta Tags](#1563-meta-tags)
  - [15.6.4 Link Tags](#1564-link-tags)
  - [15.6.5 Script Tags](#1565-script-tags)
- [15.7 SEO Best Practices](#157-seo-best-practices)
  - [15.7.1 Semantic HTML](#1571-semantic-html)
  - [15.7.2 Structured Data (JSON-LD)](#1572-structured-data-json-ld)
  - [15.7.3 Sitemap Generation](#1573-sitemap-generation)
  - [15.7.4 `robots.txt`](#1574-robotstxt)
  - [15.7.5 Canonical URLs](#1575-canonical-urls)
  - [15.7.6 `hreflang` for i18n](#1576-hreflang-for-i18n)
  - [15.7.7 Schema Markup](#1577-schema-markup)
- [Chapter Key Points](#chapter-key-points)
- [Best Practices (End of Guide)](#best-practices-end-of-guide)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 15.1 Metadata API (App Router)

The **Metadata API** lets **Server Components** declare document metadata without manually juggling `<head>` strings. Exports are **typed** with `Metadata` and `ResolvingMetadata` from **`next`**.

### 15.1.1 `metadata` Object Export

**Beginner Level**  
Create `app/layout.tsx` (or any `page.tsx`) and **export** a constant named `metadata`. Next.js turns each field into real HTML tags. For a **SaaS landing** page, you set `title` and `description` once at the root so every child route inherits a sensible default until overridden.

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OrbitCRM — Revenue intelligence for B2B teams",
  description: "Pipeline analytics, forecasting, and alerts in one workspace.",
};

export default function RootLayout(props: { children: ReactNode }): ReactNode {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
```

**Intermediate Level**  
`metadata` is **static** at build time for that segment unless you use **`generateMetadata`**. Use **`metadataBase`** so **relative** image URLs in Open Graph resolve to **absolute** URLs—critical for **Slack** and **LinkedIn** previews on your **blog**.

```typescript
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.orbitcrm.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OrbitCRM",
    template: "%s · OrbitCRM",
  },
  description: "Modern CRM for revenue teams.",
  alternates: {
    canonical: "/",
  },
};
```

**Expert Level**  
For **multi-tenant SaaS** (`tenant.acme.com`), avoid baking the wrong `metadataBase` into a shared layout unless every tenant shares one apex domain. Prefer **absolute** URLs from your **tenant resolver** inside **`generateMetadata`** on leaf routes, or set `metadataBase` in a **route group** layout per deployment. Combine with **`export const dynamic = "force-static"`** only when metadata is truly immutable for that segment.

```tsx
// app/(marketing)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orbitcrm.io"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "OrbitCRM",
  },
};

export default function MarketingLayout(props: { children: ReactNode }): ReactNode {
  return <section data-region="marketing">{props.children}</section>;
}
```

**Key Points — `metadata` export**

- Must be a **top-level** export from `layout.tsx`, `page.tsx`, or special files Next documents.
- **Cannot** coexist with `generateMetadata` in the **same** module for the same segment (choose one pattern per file).
- **`metadataBase`** affects resolution of relative URLs in OG/Twitter/icons.

---

### 15.1.2 `generateMetadata` Function

**Beginner Level**  
Use **`generateMetadata`** when the **title** or **description** depends on **data**—for example an **e‑commerce product** slug. You **fetch** the product, then **return** an object that looks like **`metadata`**.

```tsx
// app/products/[slug]/page.tsx
import type { Metadata } from "next";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  return {
    title: `Product ${slug}`,
    description: `Buy ${slug} with free shipping.`,
  };
}

export default async function ProductPage(props: PageProps) {
  const { slug } = await props.params;
  return <main><h1>{slug}</h1></main>;
}
```

**Intermediate Level**  
The second argument can include **`searchParams`** (as a Promise in recent Next versions). Use **`parent`** from **`ResolvingMetadata`** to **compose** titles with the parent **`template`**. This is ideal for **blog** posts where the root layout defines `title.template`.

```tsx
import type { Metadata, ResolvingMetadata } from "next";

type Args = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
};

export async function generateMetadata(
  { params, searchParams }: Args,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const { variant } = await searchParams;
  const previousImages = (await parent).openGraph?.images ?? [];

  return {
    title: `How we shipped ${slug}`,
    description: "Engineering notes from our team.",
    openGraph: {
      images: [...previousImages],
    },
  };
}
```

**Expert Level**  
**Dashboard** routes often require **auth**. Do **not** leak private titles to crawlers: gate metadata using **`headers()`** or session resolution, and set **`robots: { index: false }`** for authenticated areas. For **ISR**, ensure metadata **revalidates** consistently with `fetch` options (`next: { revalidate }`).

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const isAuthed = h.get("x-demo-authed") === "1";

  if (!isAuthed) {
    return { title: "Sign in", robots: { index: false, follow: false } };
  }

  return {
    title: "Team dashboard",
    robots: { index: false, follow: false },
  };
}
```

**Key Points — `generateMetadata`**

- Runs on the **server**; keep it **fast** (avoid N+1 queries).
- Can **await** `parent()` to merge with ancestor metadata.
- Use for **any** route where strings depend on **DB/CMS** values.

---

### 15.1.3 Static Metadata

**Beginner Level**  
**Static metadata** is the plain **`export const metadata`** object. Next emits tags **without** per-request execution. Perfect for a **SaaS** pricing page with fixed copy.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple plans. No hidden fees.",
};

export default function PricingPage() {
  return <main><h1>Pricing</h1></main>;
}
```

**Intermediate Level**  
Static segments pair well with **`export const dynamic = "force-static"`** (when appropriate) and **edge** caching at the CDN. Combine with **`openGraph`** defaults in **`app/layout.tsx`** so leaf pages only override what differs.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description: "Product documentation and API reference.",
  category: "technology",
};
```

**Expert Level**  
For **content sites** built from **MDX** at build time, you can derive static metadata from **frontmatter** using **`generateStaticParams`** sibling patterns—keep heavy parsing in **build** plugins or **`next.config`** rather than runtime. Version **`metadata`** exports across **route groups** to minimize duplication (`(marketing)` vs `(app)`).

```tsx
// app/(marketing)/legal/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return <article>…</article>;
}
```

**Key Points — static metadata**

- Zero **per-request** cost.
- Best for **stable** marketing and **legal** pages.
- Still benefits from **`metadataBase`** for relative assets.

---

### 15.1.4 Dynamic Metadata

**Beginner Level**  
**Dynamic metadata** means **`generateMetadata`** (or **dynamic route** segments) so the **HTML** `<head>` reflects **live** data—like a **product** name.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id}` };
}
```

**Intermediate Level**  
Align **cache** semantics: if the page uses **`fetch(..., { cache: 'no-store' })`**, metadata should use the same **freshness** rules to avoid **title/body mismatch**. For **e‑commerce**, include **price** in **`description`** only if acceptable for **SEO** (some teams prefer static marketing copy + visible on-page price).

```tsx
import type { Metadata } from "next";

async function getProduct(slug: string): Promise<{ name: string; summary: string }> {
  const res = await fetch(`https://api.example.com/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("product");
  return res.json() as Promise<{ name: string; summary: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product.name,
    description: product.summary,
  };
}
```

**Expert Level**  
Use **segment config** exports (`revalidate`, `dynamic`) coherently with **`generateMetadata`**. For **dashboards**, consider **default** metadata at layout + **narrow** overrides per sub-route. Instrument **TTFB** vs metadata query cost; sometimes a **lightweight** head endpoint beats joining large graphs.

```tsx
export const revalidate = 300;

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Status",
    other: { "x-app-build": process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "dev" },
  };
}
```

**Key Points — dynamic metadata**

- Tied to **request/build** resolution rules of the route.
- Must stay **consistent** with visible UI for trust and SEO.
- Watch for **PII** in titles/descriptions on **account** pages.

---

### 15.1.5 Metadata Inheritance

**Beginner Level**  
Child routes **inherit** parent **`metadata`** fields unless they **replace** them. Root **`layout.tsx`** sets defaults; nested **`page.tsx`** fills in **`title`** for that URL.

**Intermediate Level**  
**Shallow merge** rules apply for some fields; others **override**. Use **`title.template`** in root layout so nested titles become **`Article · MyBlog`**. **`openGraph.images`** arrays may **append** when using **`parent`** resolution patterns.

```tsx
// app/blog/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { template: "%s · Northwind Blog", default: "Northwind Blog" },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <div className="blog-shell">{children}</div>;
}
```

**Expert Level**  
For **i18n** (`app/[locale]/layout.tsx`), set **`alternates.languages`** at the **locale layout** and inherit downward. For **canonical**, prefer **leaf** specificity. Document a **metadata ownership** matrix for large teams (marketing owns root OG, product owns `/docs`, support owns `/help`).

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: { siteName: "Northwind" },
};

// Child page exports add openGraph.title, twitter.card, etc.
```

**Key Points — inheritance**

- Think **defaults at root**, **specifics at leaves**.
- **`metadataBase`** should live as high as practical.
- Use **`parent`** when you must **inspect** ancestor values.

---

## 15.2 Basic Metadata

These fields map to classic **`<meta>`** and **`<title>`** tags. Types come from **`Metadata`** in **`next`**.

### 15.2.1 `title` Property

**Beginner Level**  
**`title`** sets the **browser tab** text and the default **bookmark** name. Use a **string** for simple pages.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winter Parka — Northwind Outfitters",
};
```

**Intermediate Level**  
**`title`** can be an object with **`default`**, **`template`**, and **`absolute`**. Templates interpolate **`%s`** with nested segment titles—great for **blogs** and **product catalogs**.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Northwind Outfitters",
    template: "%s | Northwind Outfitters",
  },
};
```

**Expert Level**  
For **SaaS** apps with **marketing + app** shells, split route groups: marketing uses SEO-rich titles; **app** subdomain might use **`absolute`** titles to **bypass** template when needed.

```tsx
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "Console — Acme Cloud" },
  };
}
```

**Key Points — `title`**

- Prefer **`template`** for brand suffix consistency.
- **`absolute`** overrides template inheritance for that segment.

---

### 15.2.2 `description` Property

**Beginner Level**  
**`description`** becomes **`<meta name="description">`**. Search engines may show it in **snippets**. Write **one clear sentence** for a **landing** hero section page.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Automate invoicing, time tracking, and client portals.",
};
```

**Intermediate Level**  
Keep **120–160 characters** as a soft target; avoid **keyword stuffing**. For **e‑commerce**, summarize **benefits** + **primary use**; put **SKU-specific** facts in **structured data** too.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    description: `The ${slug} jacket: waterproof shell, recycled insulation, lifetime warranty.`,
  };
}
```

**Expert Level**  
If **CMS** returns **rich text**, **strip** tags and **normalize** whitespace server-side before assigning to **`description`**. For **A/B** experiments on copy, ensure **metadata** variant matches **HTML** (avoid cloaking).

```typescript
import type { Metadata } from "next";

function toPlainDescription(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata(): Promise<Metadata> {
  const html = "<p>Ship faster <strong>today</strong>.</p>";
  return { description: toPlainDescription(html) };
}
```

**Key Points — `description`**

- Plain text only in the **meta** tag.
- Should honestly represent **above-the-fold** content.

---

### 15.2.3 `keywords` Property

**Beginner Level**  
**`keywords`** maps to **`<meta name="keywords">`**. Many search engines **ignore** it for ranking; still occasionally useful for **internal** tools or **legacy** requirements.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  keywords: ["Next.js", "React", "SEO", "Metadata API"],
};
```

**Intermediate Level**  
Type-wise, **`Metadata['keywords']`** accepts **string | string[] | null**. Prefer **small** curated lists for **documentation** sites where **on-page** headings carry real weight.

```typescript
import type { Metadata } from "next";

const keywords: string[] = [
  "invoice automation",
  "Stripe billing",
  "SaaS metrics",
];

export const metadata: Metadata = { keywords };
```

**Expert Level**  
Do **not** rely on **`keywords`** for **SEO**. Invest in **content**, **internal linking**, and **structured data**. If stakeholders require it, **automate** from taxonomy with **dedupe** and **length** caps.

```tsx
import type { Metadata } from "next";

function uniqueKeywords(tags: string[]): string[] {
  return [...new Set(tags.map((t) => t.toLowerCase()))];
}

export async function generateMetadata(): Promise<Metadata> {
  return { keywords: uniqueKeywords(["React", "react", "Next.js"]) };
}
```

**Key Points — `keywords`**

- Low **ranking** impact today.
- Keep **concise**; avoid **spam**.

---

### 15.2.4 `authors` Property

**Beginner Level**  
**`authors`** emits **`<meta name="author">`** (and related link forms depending on Next version/config). Use it on **blog** posts.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  authors: [{ name: "Asha Kumar", url: "https://northwind.blog/authors/asha" }],
};
```

**Intermediate Level**  
Provide **`url`** when you have **profile** pages; helps **credibility** and **entity** signals when combined with **JSON-LD** `Person`.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  authors: [
    { name: "Diego Martín", url: "https://example.com/team/diego" },
    { name: "Priya Singh" },
  ],
};
```

**Expert Level**  
Align **`authors`** with **`openGraph.article:authors`** (if using **article** OG type) and **`jsonLd`**. Single source of truth from **CMS** prevents **mismatches**.

```tsx
import type { Metadata } from "next";

type CmsAuthor = { name: string; slug: string };

function authorsFromCms(list: CmsAuthor[]): Metadata["authors"] {
  return list.map((a) => ({
    name: a.name,
    url: `https://northwind.blog/authors/${a.slug}`,
  }));
}

export async function generateMetadata(): Promise<Metadata> {
  return { authors: authorsFromCms([{ name: "Asha Kumar", slug: "asha" }]) };
}
```

**Key Points — `authors`**

- Especially relevant for **editorial** content.
- Pair with **byline** visible in **body** copy.

---

### 15.2.5 `creator` Property

**Beginner Level**  
**`creator`** identifies the **content creator** (meta). Useful for **blogs** and **newsrooms**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  creator: "Northwind Editorial",
};
```

**Intermediate Level**  
Distinguish **`publisher`** (organization) vs **`creator`** (person/team) when both exist—Next supports related fields on **`Metadata`**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  creator: "Morgan Lee",
  publisher: "Northwind Media",
};
```

**Expert Level**  
For **UGC** **marketplaces**, avoid setting **`creator`** to the **platform** when the **seller** is the true creator; reflect **policy** and **legal** guidance in both **metadata** and **schema**.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seller: string }>;
}): Promise<Metadata> {
  const { seller } = await params;
  return { creator: seller };
}
```

**Key Points — `creator`**

- Clarify **who** produced the **main** content.
- Align with visible **attribution**.

---

### 15.2.6 `applicationName` Property

**Beginner Level**  
**`applicationName`** sets the **installed PWA** / **browser** application name context. Handy for **SaaS** and **dashboard** products.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  applicationName: "OrbitCRM",
};
```

**Intermediate Level**  
Combine with **`manifest`** (`app/manifest.ts`) for **icons** and **theme_color**. Keep **`applicationName`** short and **brand-legal**.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  applicationName: "OrbitCRM",
  manifest: "/manifest.webmanifest",
};
```

**Expert Level**  
If **white-label** **SaaS** uses **tenant branding**, set **`applicationName`** dynamically via **`generateMetadata`** from **host** mapping—ensure **CDN** caching varies correctly or use **per-tenant** deployments.

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host") ?? "app.example.com";
  const tenant = host.split(".")[0];
  return { applicationName: `${tenant} Workspace` };
}
```

**Key Points — `applicationName`**

- Distinct from **`title`** (UI vs **install** name).
- Cross-check with **manifest.short_name** for UX.

---

## 15.3 Open Graph Metadata

**Open Graph** tags control previews in **Facebook**, **LinkedIn**, **iMessage**, and many **Slack** unfurls. In Next, nest fields under **`openGraph`** on **`Metadata`**.

### 15.3.1 `openGraph` Configuration

**Beginner Level**  
Add an **`openGraph`** object to **`metadata`**. At minimum set **`title`**, **`description`**, and **`url`**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    title: "OrbitCRM — Close more deals",
    description: "Pipeline analytics your team will actually use.",
    url: "https://www.orbitcrm.io",
    siteName: "OrbitCRM",
    type: "website",
  },
};
```

**Intermediate Level**  
Use **`images`** as an array of **`{ url, width, height, alt }`**. Always set **`metadataBase`** or use **absolute** `url` strings. Match **OG** copy to **on-page** **H1** where possible.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orbitcrm.io"),
  openGraph: {
    title: "Pricing",
    description: "Plans for every stage of growth.",
    images: [{ url: "/og/pricing.png", width: 1200, height: 630, alt: "Pricing overview" }],
  },
};
```

**Expert Level**  
For **article** and **product** types, populate **type-specific** fields (`publishedTime`, `authors`, etc.). Pre-generate **OG images** with **`ImageResponse`** (OG routes) for **scale**—especially **e‑commerce** with thousands of SKUs.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    openGraph: {
      title: `Post: ${slug}`,
      type: "article",
      publishedTime: new Date().toISOString(),
      authors: ["https://northwind.blog/authors/asha"],
    },
  };
}
```

**Key Points — `openGraph`**

- **Absolute** image URLs are non-negotiable for most crawlers.
- Choose correct **`type`** (`website`, `article`, `product`, etc.).

---

### 15.3.2 `og:title`

**Beginner Level**  
**`openGraph.title`** maps to **`og:title`**. It can differ slightly from **`<title>`** for **social** punch, but keep consistent meaning.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Handmade Ceramic Mug — Northwind",
  openGraph: { title: "Handmade Ceramic Mug | Northwind Pottery" },
};
```

**Intermediate Level**  
If omitted, Next may **fall back** to **`metadata.title`**. For **SaaS** feature pages, OG title can emphasize **outcome** while HTML title includes **brand**.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Workflow automation — Acme" },
  openGraph: { title: "Automate approvals in minutes" },
};
```

**Expert Level**  
**Locale** variants: pair **`openGraph.locale`** + **`alternateLocale`** with translated **`title`** in **`generateMetadata`** for **i18n** landing pages.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Security that scales",
    es: "Seguridad que escala",
  };
  return { openGraph: { title: titles[locale] ?? titles.en } };
}
```

**Key Points — `og:title`**

- Aim **under ~60–70 chars** for clean previews.
- Avoid **clickbait** inconsistent with page content.

---

### 15.3.3 `og:description`

**Beginner Level**  
**`openGraph.description`** becomes **`og:description`**. Often mirrors **meta description**—that is fine.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Track inventory across warehouses in real time.",
  openGraph: {
    description: "Track inventory across warehouses in real time.",
  },
};
```

**Intermediate Level**  
For **promos**, you might craft a **shorter** OG line with **CTA** while keeping **SEO** description factual—ensure both are honest.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Northwind WMS integrates with Shopify, Amazon, and custom ERPs for unified stock levels.",
  openGraph: {
    description: "Unify Shopify + Amazon inventory — free 14-day trial.",
  },
};
```

**Expert Level**  
When **personalizing** UI by segment, avoid **personalized** OG text that could look like **cloaking**; keep OG aligned with **default** public content.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    description: "Analytics for modern finance teams (public overview).",
  },
};
```

**Key Points — `og:description`**

- Typically **1–2** sentences.
- Must match **public** content.

---

### 15.3.4 `og:image`

**Beginner Level**  
**`openGraph.images`** sets **`og:image`**. Use **1200×630** for **landscape** cards when possible.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.example.com"),
  openGraph: {
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: "Example Inc." }],
  },
};
```

**Intermediate Level**  
Provide **`alt`** for **accessibility** in platforms that surface it. For **e‑commerce**, use **product** shots with **clean** backgrounds; avoid **tiny** images that upscale poorly.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>;
}): Promise<Metadata> {
  const { sku } = await params;
  return {
    metadataBase: new URL("https://shop.example.com"),
    openGraph: {
      images: [
        {
          url: `/og/product/${sku}.png`,
          width: 1200,
          height: 630,
          alt: `Product ${sku} hero`,
        },
      ],
    },
  };
}
```

**Expert Level**  
Generate images via **`opengraph-image.tsx`** segment files or **`@vercel/og`**. Cache **CDN** aggressively; validate **MIME** types; use **`secure_url`** implications (HTTPS). For **dashboards** that are **noindex**, you may still want a **branded** OG image for **internal** Slack shares.

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        {params.slug}
      </div>
    ),
    { ...size },
  );
}
```

**Key Points — `og:image`**

- Prefer **HTTPS** URLs.
- Include **`width`/`height`** when known.

---

### 15.3.5 `og:url`

**Beginner Level**  
**`openGraph.url`** sets the **canonical** social URL for the resource—usually the **public** URL of the page.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: { url: "https://www.example.com/blog/first-post" },
};
```

**Intermediate Level**  
Avoid **querystring** chaos: for **tracking** params, prefer **`alternates.canonical`** without UTMs; set **`og:url`** to the **clean** URL.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.example.com"),
  alternates: { canonical: "/features/automation" },
  openGraph: { url: "/features/automation" },
};
```

**Expert Level**  
For **paginated** **blogs**, each page should have its **own** **`og:url`** (page 2 is not the same object as page 1). Pair with **`rel=prev/next`** only if your **SEO** strategy still uses them (optional today).

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const page = (await searchParams).page ?? "1";
  const path = page === "1" ? "/blog" : `/blog?page=${page}`;
  return { openGraph: { url: path } };
}
```

**Key Points — `og:url`**

- Should match the **primary** shareable location.
- Avoid **session** IDs in OG URLs.

---

### 15.3.6 `og:type`

**Beginner Level**  
**`openGraph.type`** sets **`og:type`**. Common values: **`website`**, **`article`**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: { type: "website" },
};
```

**Intermediate Level**  
Use **`article`** for **blogs**; **`product`** for **commerce** when you also supply **product** fields. Type drives validator expectations.

```tsx
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    openGraph: {
      type: "article",
      publishedTime: "2025-12-01T10:00:00.000Z",
      modifiedTime: "2025-12-15T09:30:00.000Z",
    },
  };
}
```

**Expert Level**  
Align **`og:type`** with **JSON-LD** `@type` (`Article`, `Product`, `WebPage`). Mismatches confuse **debuggers** and **analytics** pipelines.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    siteName: "Acme Cloud",
  },
};
```

**Key Points — `og:type`**

- Pick the **closest** real type.
- Add **required** fields per type.

---

### 15.3.7 `og:locale`

**Beginner Level**  
**`openGraph.locale`** sets **`og:locale`** (`en_US`, `fr_FR`, …). Helps platforms pick **formatting**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: { locale: "en_US" },
};
```

**Intermediate Level**  
Use **`alternateLocale`** for translations available on other routes.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    locale: "en_US",
    alternateLocale: ["es_ES", "de_DE"],
  },
};
```

**Expert Level**  
Coordinate with **`html lang`** via **`layout`** and **`alternates.languages`** map for **hreflang** (see §15.7.6). Automate from a **`Locale` union type**.

```typescript
import type { Metadata } from "next";

type Locale = "en-US" | "fr-FR";

const ogLocale: Record<Locale, string> = {
  "en-US": "en_US",
  "fr-FR": "fr_FR",
};

export function buildOgLocale(locale: Locale): Pick<Metadata["openGraph"], "locale"> {
  return { locale: ogLocale[locale] };
}
```

**Key Points — `og:locale`**

- Use **underscore** form (`en_US`) for OG.
- Keep **`lang`** attribute consistent.

---

## 15.4 Twitter Card Metadata

**Twitter / X Cards** read **`meta name="twitter:*"`**. Next exposes a convenient **`twitter`** object on **`Metadata`**.

### 15.4.1 `twitter` Configuration

**Beginner Level**  
Set **`card`**, **`title`**, **`description`**, and **`images`**. Many teams **mirror** Open Graph content.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    title: "Ship faster with OrbitCRM",
    description: "Pipeline analytics and alerts.",
    images: ["/og/default.png"],
  },
};
```

**Intermediate Level**  
If **`twitter`** fields are omitted, **Twitter** may **fall back** to **OG** tags—still **explicit** config reduces surprises across **API** changes.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    title: "Docs",
    description: "API reference and guides.",
    images: [{ url: "/og/docs.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Docs",
    description: "API reference and guides.",
    images: ["/og/docs.png"],
  },
};
```

**Expert Level**  
Centralize a **`buildSocialMetadata()`** helper returning **`{ openGraph, twitter }`** from one **CMS** record to prevent **drift**.

```tsx
import type { Metadata } from "next";

type SocialDraft = { title: string; description: string; image: string };

function socialMetadata(d: SocialDraft): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [{ url: d.image, width: 1200, height: 630, alt: d.title }];
  return {
    openGraph: { title: d.title, description: d.description, images },
    twitter: {
      card: "summary_large_image",
      title: d.title,
      description: d.description,
      images: [d.image],
    },
  };
}
```

**Key Points — `twitter` configuration**

- **`card`** is required for predictable rendering.
- Keep **images** **HTTPS** and **large** enough for **`summary_large_image`**.

---

### 15.4.2 `twitter:card`

**Beginner Level**  
**`summary`** shows a **small** square image; **`summary_large_image`** shows a **wide** preview.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: { card: "summary_large_image" },
};
```

**Intermediate Level**  
Choose **`summary`** for **dense** **dashboard** screenshots that do not crop well; choose **`summary_large_image`** for **marketing** art.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary",
    title: "Live metrics",
    description: "Real-time charts for your team.",
  },
};
```

**Expert Level**  
**`app`** and **`player`** cards require **additional** fields and **approval** historically—verify current **X** documentation before implementing.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: { card: "summary_large_image" },
};
```

**Key Points — `twitter:card`**

- **`summary_large_image`** is default for many **SaaS** landings.
- Validate with **Card Validator** tools periodically.

---

### 15.4.3 `twitter:title`

**Beginner Level**  
**`twitter.title`** maps to **`twitter:title`**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: { card: "summary", title: "Northwind — Winter collection" },
};
```

**Intermediate Level**  
For **blog** posts, include **series** names only if concise—preview width is limited.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    twitter: {
      card: "summary_large_image",
      title: `Inside ${slug}: a build diary`,
    },
  };
}
```

**Expert Level**  
If **A/B** testing **H1** copy, keep **`twitter.title`** aligned with the **default** **public** **H1** variant crawlers see.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: { card: "summary_large_image", title: "Security whitepaper" },
};
```

**Key Points — `twitter:title`**

- Short, **specific**, **human**.

---

### 15.4.4 `twitter:description`

**Beginner Level**  
**`twitter.description`** is the **card** body text.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    title: "API docs",
    description: "Authentication, webhooks, and rate limits explained.",
  },
};
```

**Intermediate Level**  
For **e‑commerce**, mention **free shipping** or **warranty** only if **true** on that URL for all users.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    title: "Titanium cook set",
    description: "Ultralight 3-piece kit. Lifetime warranty.",
  },
};
```

**Expert Level**  
Avoid **dynamic** **PII** (e.g., “Hi {name}”) in **twitter** fields.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary",
    title: "Account settings",
    description: "Manage your profile and security preferences.",
  },
};
```

**Key Points — `twitter:description`**

- Two lines max **visually** on many clients.
- Plain text.

---

### 15.4.5 `twitter:image`

**Beginner Level**  
**`twitter.images`** accepts **string** or **array** of URLs.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.example.com"),
  twitter: {
    card: "summary_large_image",
    images: ["/og/blog.png"],
  },
};
```

**Intermediate Level**  
**`summary_large_image`** wants **≥300px** wide; **300×157** minimum historically—prefer **1200×630** for crisp previews.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    images: [{ url: "https://www.example.com/og/parkas.png", alt: "Parkas on a rack" }],
  },
};
```

**Expert Level**  
Use **dedicated** **Twitter** images only when **cropping** differs from **OG**; otherwise **single** source asset.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: { card: "summary_large_image", images: ["/og/unified.png"] },
  openGraph: { images: [{ url: "/og/unified.png", width: 1200, height: 630 }] },
};
```

**Key Points — `twitter:image`**

- **HTTPS** only in production.
- Test how **logos** look on **dark** backgrounds.

---

### 15.4.6 `twitter:creator`

**Beginner Level**  
**`twitter.creator`** sets **`twitter:creator`** with **@handle**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: { card: "summary", creator: "@northwind" },
};
```

**Intermediate Level**  
Pair **`creator`** (author) with **`site`** (brand) when applicable.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    site: "@orbitcrm",
    creator: "@asha_writes_code",
  },
};
```

**Expert Level**  
For **multi-author** **blogs**, pick **primary** author or omit to avoid **misattribution**—align with **editorial** policy.

```tsx
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    twitter: {
      card: "summary_large_image",
      creator: "@northwinddev",
    },
  };
}
```

**Key Points — `twitter:creator`**

- Include **`@`** prefix as per **platform** convention.
- Do not invent **handles**.

---

## 15.5 Favicon and Icons

Next can generate **icon** routes from **static files** or **`icon.tsx`**. Types: see **`MetadataRoute`** and **`Icon`**.

### 15.5.1 Icon Files (`icon.ico` / `icon.png`)

**Beginner Level**  
Place **`app/icon.png`** or **`app/icon.ico`**. Next serves **`/icon.png`** automatically.

```
app/
  icon.png
  layout.tsx
```

**Intermediate Level**  
You can export **`metadata.icons`** for **explicit** **shortcut** icons and **sizes** if not using file convention.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
  },
};
```

**Expert Level**  
For **CDN**-hosted icons, use **absolute** URLs in **`icons`** and set long **`Cache-Control`** on assets. Version filenames (`icon-2026.png`) when **rebranding**.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "https://cdn.example.com/assets/favicon.ico", sizes: "any" }],
  },
};
```

**Key Points — `icon.ico` / `icon.png`**

- Prefer **square** sources.
- Keep **favicon** **simple** and **legible** at 16×16.

---

### 15.5.2 Apple Touch Icons (`apple-icon.png`)

**Beginner Level**  
Add **`app/apple-icon.png`** for **iOS** home screen.

```
app/
  apple-icon.png
```

**Intermediate Level**  
**`metadata.icons.apple`** can point to **180×180** PNG for **latest** devices.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    apple: "/apple-touch-icon.png",
  },
};
```

**Expert Level**  
For **PWA** **splash** screens, complement with **`manifest`** icons array; **apple-icon** alone is not enough for **full-screen** **web apps**.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};
```

**Key Points — Apple touch icons**

- **180×180** is a common **baseline**.
- Avoid **transparency** quirks on **iOS** (use **solid** background).

---

### 15.5.3 Dynamic Icons

**Beginner Level**  
**`app/icon.tsx`** exports an **`ImageResponse`** or default function (per Next docs) to **generate** icons.

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111827",
        color: "#fff",
        fontSize: 18,
        fontWeight: 700,
      }}
    >
      N
    </div>,
    { ...size },
  );
}
```

**Intermediate Level**  
**Tenant** **SaaS** might render **tenant** **initial** from **host**—cache per **hostname** carefully.

```tsx
import { ImageResponse } from "next/og";
import { headers } from "next/headers";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const host = (await headers()).get("host") ?? "app";
  const initial = host.charAt(0).toUpperCase();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0ea5e9",
          color: "#0f172a",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        {initial}
      </div>
    ),
    { ...size },
  );
}
```

**Expert Level**  
Watch **CPU** cost for **dynamic** icons at scale—prefer **static** assets for **marketing** sites and **dynamic** only where **personalization** matters.

**Key Points — dynamic icons**

- Great for **multi-tenant** **letter** marks.
- Keep **render** **deterministic**.

---

### 15.5.4 Icon Sizes

**Beginner Level**  
Provide **multiple** sizes for **crisp** rendering: **16**, **32**, **48**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
  },
};
```

**Intermediate Level**  
Add **`mask-icon`** for **Safari** pinned tabs (SVG).

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    other: [{ rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#0f172a" }],
  },
};
```

**Expert Level**  
Align **`sizes`** with **actual** file dimensions—browsers use hints for **resource** selection.

```typescript
import type { Metadata } from "next";

const iconSet: NonNullable<Metadata["icons"]>["icon"] = [
  { url: "/icons/16.png", sizes: "16x16", type: "image/png" },
  { url: "/icons/32.png", sizes: "32x32", type: "image/png" },
  { url: "/icons/48.png", sizes: "48x48", type: "image/png" },
];

export const metadata: Metadata = { icons: { icon: iconSet } };
```

**Key Points — icon sizes**

- **Sharp** > **upscaled**.
- Document a **design** **matrix** for marketing.

---

## 15.6 Head Component (Pages Router)

The **Pages Router** uses **`next/head`** to inject tags per page. Still common in **legacy** **dashboard** apps.

### 15.6.1 `next/head` Import

**Beginner Level**  
Import **`Head`** from **`next/head`** inside **`pages/*.tsx`**.

```tsx
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Northwind — Home</title>
      </Head>
      <main>Welcome</main>
    </>
  );
}
```

**Intermediate Level**  
**`Head`** can appear in **child** components; Next **merges** duplicates **by** **key** rules—prefer **one** **`Head`** per page for clarity.

```tsx
import Head from "next/head";

export default function BlogIndex() {
  return (
    <>
      <Head>
        <title>Blog — Northwind</title>
        <meta name="description" content="Product updates and tutorials." />
      </Head>
      <main>Posts</main>
    </>
  );
}
```

**Expert Level**  
For **mixed** Router migrations, avoid **double** titles when **App** shell wraps **Pages**—establish **ownership** per route tree.

```tsx
import Head from "next/head";

type SeoProps = { title: string; description: string };

export function MarketingSeo(props: SeoProps) {
  return (
    <Head>
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
    </Head>
  );
}
```

**Key Points — `next/head` import**

- **Client-safe** usage in many cases; still avoid **secrets** in tags.
- Prefer **App Router Metadata API** for new apps.

---

### 15.6.2 Setting Title

**Beginner Level**  
Use **`<title>`** inside **`Head`**.

```tsx
import Head from "next/head";

export default function ProductPage() {
  return (
    <>
      <Head>
        <title>Ceramic Mug — Northwind</title>
      </Head>
      <main>Mug</main>
    </>
  );
}
```

**Intermediate Level**  
Compose with **`useRouter`** for **dynamic** routes.

```tsx
import Head from "next/head";
import { useRouter } from "next/router";

export default function PostPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "post";
  return (
    <>
      <Head>
        <title>{slug} — Blog</title>
      </Head>
      <article>{slug}</article>
    </>
  );
}
```

**Expert Level**  
For **SEO**, prefer **`getServerSideProps`**/**`getStaticProps`** to compute **title** server-side and pass props—avoid **empty** title on **first** paint **SEO** for crawlers that execute JS inconsistently.

```tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";

type Props = { title: string };

export default function Page(props: Props) {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <main>Dashboard</main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return { props: { title: "Team dashboard — Acme" } };
};
```

**Key Points — title (Pages Router)**

- **Unique** per URL.
- Avoid **generic** “Welcome” titles on **money** pages.

---

### 15.6.3 Meta Tags

**Beginner Level**  
Add **`<meta name="description" content="…">`** for snippets.

```tsx
import Head from "next/head";

export default function Landing() {
  return (
    <>
      <Head>
        <meta name="description" content="Automate billing for agencies." />
      </Head>
      <main>Landing</main>
    </>
  );
}
```

**Intermediate Level**  
Open Graph and Twitter tags are plain **meta** elements.

```tsx
import Head from "next/head";

export default function Campaign() {
  return (
    <>
      <Head>
        <meta property="og:title" content="OrbitCRM Spring Sale" />
        <meta property="og:description" content="20% off annual plans." />
        <meta property="og:image" content="https://www.orbitcrm.io/og/sale.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main>Sale</main>
    </>
  );
}
```

**Expert Level**  
Use **`key`** prop on **`Head`** children to **dedupe** when merging from **layout**-like wrappers (patterns vary by Next version—test).

```tsx
import Head from "next/head";

export default function DocsPage() {
  return (
    <>
      <Head key="docs-seo">
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
      </Head>
      <main>Docs</main>
    </>
  );
}
```

**Key Points — meta tags (Pages)**

- Property **meta** uses **`property=`** for OG.
- Keep **charset** and **viewport** in **`_document.tsx`** (`pages/_document.tsx`).

---

### 15.6.4 Link Tags

**Beginner Level**  
Use **`<link rel="canonical" href="…">`** for **URL** consolidation.

```tsx
import Head from "next/head";

export default function BlogPost() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://www.example.com/blog/hello-world" />
      </Head>
      <article>Hello</article>
    </>
  );
}
```

**Intermediate Level**  
**`hreflang`** links for **i18n** variants.

```tsx
import Head from "next/head";

export default function LocalizedMarketing() {
  return (
    <>
      <Head>
        <link rel="alternate" hrefLang="en" href="https://www.example.com/en/pricing" />
        <link rel="alternate" hrefLang="es" href="https://www.example.com/es/pricing" />
        <link rel="alternate" hrefLang="x-default" href="https://www.example.com/pricing" />
      </Head>
      <main>Pricing</main>
    </>
  );
}
```

**Expert Level**  
**Preconnect**/**dns-prefetch** for **third-party** **analytics**—balance **performance** vs **privacy**.

```tsx
import Head from "next/head";

export default function SaaSMarketing() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <main>Hero</main>
    </>
  );
}
```

**Key Points — link tags**

- **Canonical** is **high** leverage for duplicate content.
- **hreflang** must be **reciprocal** across locales.

---

### 15.6.5 Script Tags

**Beginner Level**  
**`<script>`** in **`Head`** for **JSON-LD** (prefer **`strategy`** in **`next/script`** for **client** pages when appropriate).

```tsx
import Head from "next/head";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Northwind",
  url: "https://www.example.com",
};

export default function Home() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <main>Home</main>
    </>
  );
}
```

**Intermediate Level**  
For **App Router**, prefer **`<Script>`** from **`next/script`** or embed JSON-LD in **server** components without **`dangerouslySetInnerHTML`** if using **safe** serialization utilities.

```tsx
import Head from "next/head";

type JsonLdGraph = { "@context": string; "@graph": Record<string, unknown>[] };

const graph: JsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: "Acme", url: "https://www.acme.com" },
    { "@type": "WebPage", name: "Security", url: "https://www.acme.com/security" },
  ],
};

export default function SecurityPage() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      </Head>
      <main>Security</main>
    </>
  );
}
```

**Expert Level**  
**Sanitize** any **user-generated** strings before embedding in **JSON-LD** (`</script>` breakout prevention). Prefer **`serialize-javascript`**-style escaping or server-only composition.

```typescript
import Head from "next/head";

function escapeJsonForHtml(json: string): string {
  return json.replace(/</g, "\\u003c");
}

export default function UgcPage(props: { name: string }) {
  const payload = escapeJsonForHtml(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: props.name,
    }),
  );
  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: payload }} />
      </Head>
      <main>{props.name}</main>
    </>
  );
}
```

**Key Points — script tags**

- JSON-LD belongs in **valid** **JSON** without **HTML** breaks.
- Prefer **server** rendering for **SEO** payloads.

---

## 15.7 SEO Best Practices

Cross-cutting **SEO** concerns: **HTML** semantics, **structured data**, **crawling** controls, **canonicalization**, and **i18n**.

### 15.7.1 Semantic HTML

**Beginner Level**  
Use **`<main>`**, **`<article>`**, **`<section>`**, **`<nav>`**, **`<header>`**, **`<footer>`**, and heading **hierarchy** (`h1` → `h2`). Your **blog** **post** page should have **one** **`h1`**.

```tsx
export default function BlogPost() {
  return (
    <article>
      <header>
        <h1>Shipping Next.js to production</h1>
        <p>
          <time dateTime="2026-03-01">March 1, 2026</time>
        </p>
      </header>
      <section aria-labelledby="outline">
        <h2 id="outline">Outline</h2>
        <ol>
          <li>Routing</li>
          <li>Data fetching</li>
        </ol>
      </section>
    </article>
  );
}
```

**Intermediate Level**  
**Landmarks** aid **accessibility** and help parsers understand **template** structure—especially **e‑commerce** **PDPs** with **reviews** blocks.

```tsx
export default function ProductPage(props: { name: string }) {
  return (
    <main>
      <article itemScope itemType="https://schema.org/Product">
        <h1 itemProp="name">{props.name}</h1>
        <section aria-labelledby="reviews-heading">
          <h2 id="reviews-heading">Reviews</h2>
        </section>
      </article>
    </main>
  );
}
```

**Expert Level**  
Avoid **div soup** in **SaaS** **marketing** pages; **component libraries** still need **semantic** **wrappers**. Add **`aria-*`** when **visual** design omits visible labels.

**Key Points — semantic HTML**

- **Headings** reflect **outline**, not **font size**.
- **Landmarks** should be **unique** per page where possible (`main` once).

---

### 15.7.2 Structured Data (JSON-LD)

**Beginner Level**  
Embed **`application/ld+json`** describing **`WebSite`** or **`Organization`**.

```tsx
const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OrbitCRM",
  url: "https://www.orbitcrm.io",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.orbitcrm.io/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
} as const;

export function JsonLdWebsite() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
    />
  );
}
```

**Intermediate Level**  
**`Product`** JSON-LD for **e‑commerce**: **offers**, **availability**, **priceCurrency**.

```typescript
type MoneyOffer = {
  "@type": "Offer";
  priceCurrency: string;
  price: string;
  availability: string;
  url: string;
};

type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  image: string[];
  description: string;
  sku: string;
  offers: MoneyOffer;
};

export function productLd(p: Omit<ProductJsonLd, "@context" | "@type">): ProductJsonLd {
  return { "@context": "https://schema.org", "@type": "Product", ...p };
}
```

**Expert Level**  
Use **`@graph`** for **multiple** entities. Validate with **Rich Results Test**. Keep **JSON-LD** in sync with **visible** content (**guidelines**).

```tsx
type WithContext = { "@context": "https://schema.org" };

type BreadcrumbList = WithContext & {
  "@type": "BreadcrumbList";
  itemListElement: { "@type": "ListItem"; position: number; name: string; item: string }[];
};

const breadcrumbs: BreadcrumbList = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://shop.example.com" },
    { "@type": "ListItem", position: 2, name: "Mugs", item: "https://shop.example.com/mugs" },
  ],
};
```

**Key Points — JSON-LD**

- **Valid** JSON, **stable** URLs.
- Reflect **real** **inventory**/**pricing** where required.

---

### 15.7.3 Sitemap Generation

**Beginner Level**  
**`app/sitemap.ts`** exports default function returning **`MetadataRoute.Sitemap`**.

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.example.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://www.example.com/blog", changeFrequency: "weekly", priority: 0.8 },
  ];
}
```

**Intermediate Level**  
Fetch **CMS** paths inside **`sitemap`** (with **caching**/**revalidation** appropriate to size).

```typescript
import type { MetadataRoute } from "next";

async function getPosts(): Promise<{ slug: string; updated: string }[]> {
  const res = await fetch("https://cms.example.com/posts", { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json() as Promise<{ slug: string; updated: string }[]>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return posts.map((p) => ({
    url: `https://www.example.com/blog/${p.slug}`,
    lastModified: new Date(p.updated),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}
```

**Expert Level**  
Split **large** sites with **sitemap indexes** (`generateSitemaps` in Next docs) and **prioritize** **money** URLs. Exclude **authenticated** **dashboard** URLs entirely.

```typescript
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: "https://www.example.com/", priority: 1 },
    { url: "https://www.example.com/pricing", priority: 0.9 },
  ];
}
```

**Key Points — sitemaps**

- Submit in **Search Console**.
- **`lastModified`** helps **crawl** efficiency.

---

### 15.7.4 `robots.txt`

**Beginner Level**  
**`app/robots.ts`** returns rules for crawlers.

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/"] },
    sitemap: "https://www.example.com/sitemap.xml",
  };
}
```

**Intermediate Level**  
**Staging** environments should often **`disallow: /`** entirely.

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.VERCEL_ENV === "preview";
  if (isStaging) {
    return { rules: { userAgent: "*", disallow: ["/"] } };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }, { userAgent: "GPTBot", disallow: ["/"] }],
    sitemap: "https://www.example.com/sitemap.xml",
  };
}
```

**Expert Level**  
**`robots.txt`** is **not** **security**—never expose **secret** paths assuming they are hidden. Use **auth** for **dashboards**.

**Key Points — robots.txt**

- Pair with **`metadata.robots`** for **page-level** directives.
- Keep **sitemap** line **accurate**.

---

### 15.7.5 Canonical URLs

**Beginner Level**  
Use **`alternates.canonical`** in **Metadata** (App Router).

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.example.com"),
  alternates: { canonical: "/products/parka" },
};
```

**Intermediate Level**  
**E‑commerce** faceted navigation creates **duplicate** URLs—canonical to **clean** **PDP** without **sort** params.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}): Promise<Metadata> {
  await searchParams;
  return {
    metadataBase: new URL("https://shop.example.com"),
    alternates: { canonical: "/catalog/jackets" },
  };
}
```

**Expert Level**  
**Cross-domain** canonicals for **syndicated** **blog** content—confirm **search engine** guidelines and **partner** agreements.

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.authoritative.com/original-post" },
};
```

**Key Points — canonical URLs**

- One **clear** preferred URL per **indexable** content item.
- Self-referencing **canonical** is normal and good.

---

### 15.7.6 `hreflang` for i18n

**Beginner Level**  
Declare **`alternates.languages`** map in **metadata**.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.example.com/en-us/pricing",
    languages: {
      "en-US": "https://www.example.com/en-us/pricing",
      "es-ES": "https://www.example.com/es-es/pricing",
      "x-default": "https://www.example.com/en-us/pricing",
    },
  },
};
```

**Intermediate Level**  
Ensure **every** localized URL **links back** to others (**reciprocity**). **`x-default`** picks a **fallback** for unmatched locales.

```tsx
import type { Metadata } from "next";

type Locale = "en" | "es";

const prefix: Record<Locale, string> = { en: "/en", es: "/es" };

export function pricingMetadata(locale: Locale): Metadata {
  const path = `${prefix[locale]}/pricing`;
  return {
    alternates: {
      canonical: path,
      languages: {
        en: "/en/pricing",
        es: "/es/pricing",
        "x-default": "/en/pricing",
      },
    },
  };
}
```

**Expert Level**  
**CMS-driven** locales: generate **maps** from **content** availability—omit **languages** without a **published** translation to avoid **soft 404s**.

**Key Points — hreflang**

- **Consistent** URL patterns.
- **Hreflang** + **`html lang`** + **OG locale** should align.

---

### 15.7.7 Schema Markup

**Beginner Level**  
**Schema.org** vocabulary expressed as **JSON-LD** (preferred by Google) or **microdata** (less common in React). Start with **`Organization`** + **`WebSite`**.

**Intermediate Level**  
**`FAQPage`** for **SaaS** support marketing; **`Article`** for **blogs**; **`Product`** + **`Review`** for **commerce**.

```tsx
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you offer SAML SSO?",
      acceptedAnswer: { "@type": "Answer", text: "Yes, on Enterprise plans." },
    },
  ],
} as const;
```

**Expert Level**  
Maintain a **schema** **registry** in TypeScript—version entities alongside **CMS** **migrations**. Monitor **Search Console** **enhancements** for **errors**.

```typescript
type SchemaBase = { "@context": "https://schema.org" };

type Organization = SchemaBase & {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
};

export const org: Organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OrbitCRM",
  url: "https://www.orbitcrm.io",
  logo: "https://www.orbitcrm.io/logo.png",
  sameAs: ["https://www.linkedin.com/company/orbitcrm"],
};
```

**Key Points — schema markup**

- Follow **Google** **structured data** policies.
- **Don’t** mark up **invisible** content.

---

## Chapter Key Points

- **App Router**: prefer **`metadata`** / **`generateMetadata`** over manual head juggling.
- **`metadataBase`** + **absolute** social images = fewer **preview** bugs.
- **Open Graph** and **Twitter** should **match** public page intent.
- **Icons** benefit from **file conventions** and **size** matrices.
- **Pages Router**: **`next/head`** still works—plan **migration** to Metadata API.
- **SEO**: **semantic HTML**, **canonical**, **hreflang**, **sitemaps**, **robots**, and **JSON-LD** work together—fix **one** layer without breaking others.
- **Dashboards**: usually **noindex** + **robots.txt** disallow + **auth**, not **keyword** tricks.

---

## Best Practices (End of Guide)

1. **Single source of truth**: derive **titles**, **descriptions**, and **OG** fields from **CMS** records or **typed** config objects shared across routes.
2. **Stable URLs**: canonicalize **tracking** parameters; keep **`og:url`** clean.
3. **Image discipline**: **1200×630** branded templates; **alt** text that describes the image, not stuffed with keywords.
4. **Performance**: **`generateMetadata`** should avoid **heavy** joins—fetch **minimal** fields for head, **lazy-load** body extras.
5. **Security & privacy**: **noindex** **authenticated** experiences; never embed **tokens** in meta tags.
6. **Internationalization**: align **`lang`**, **`hreflang`**, **`og:locale`**, and **visible** copy.
7. **Validation**: periodically run **Rich Results** and **social** **debuggers** after template changes.
8. **Testing**: snapshot **rendered** `<head>` for **critical** templates in **CI** where feasible.
9. **Analytics hygiene**: separate **marketing** **campaign** params from **canonical** URLs.
10. **Governance**: document **who** owns metadata for **marketing**, **product**, and **support** surfaces.

---

## Common Mistakes to Avoid

1. **Missing `metadataBase`** → broken **relative** **OG** images in production.
2. **Duplicated `metadata` + `generateMetadata`** in the same file → **build** errors / confusion.
3. **Title/description mismatch** with **H1** and hero copy → poor **CTR** and trust.
4. **Indexing** **dashboard** **feeds** with **session-specific** URLs → **duplicate** / **thin** content issues.
5. **Huge** **`keywords`** meta → noise; no substitute for **content** quality.
6. **Wrong `og:type`** or **incomplete** fields → validation warnings and weaker **rich** results eligibility.
7. **Non-reciprocal `hreflang`** clusters → search engines ignore hints.
8. **Unsafe JSON-LD** embedding of **user** input → **XSS** risk.
9. **Assuming `robots.txt` blocks** guarantee **privacy**—it’s a **hint**, not **auth**.
10. **Pages Router**: forgetting **`viewport`** in **`_app`** / **`_document`** while tuning **SEO** tags—**mobile** usability matters for ranking and **UX**.

---

### Vertical playbooks (real-world checklists)

**E‑commerce product pages**

- Dynamic **`generateMetadata`** from **SKU** data: **title**, **meta description**, **canonical** to master **PDP** URL.
- **`openGraph.type: 'product'`** when appropriate; **`og:image`** from **primary** image.
- **`Product`** JSON-LD with **`offers`**, **`brand`**, **`aggregateRating`** when **truthful** and visible.
- **Facet** URLs: **canonical** to **clean** **PDP**; exclude **cart** and **checkout** from **sitemap**.

**Blog posts**

- **`article`** Open Graph with **`publishedTime`**, **`authors`**; **`twitter:creator`** for brand **voice**.
- **`Article`** / **`BlogPosting`** JSON-LD; **`BreadcrumbList`** for **category** trails.
- **RSS** feeds (if used) consistent with **`canonical`** URLs.

**Dashboard (authenticated)**

- **`robots: { index: false, follow: false }`** on **app** layouts; **`robots.txt`** **disallow** for `/app` or similar.
- Titles emphasize **context** (“Settings — Acme”) without **sensitive** **customer** names in **metadata**.
- Avoid **spending** **OG** **budget** on **private** pages unless **internal** sharing is a **requirement**.

**SaaS landing pages**

- **Strong** **`title` template`** across **feature** pages; **unique** descriptions per **value prop**.
- **`WebSite`** JSON-LD with **`SearchAction`** if **on-site** search exists.
- **`openGraph.siteName`** + consistent **`theme-color`** / **manifest** for **PWA** polish.

---

_This guide targets Next.js patterns common in **App Router** **15+** and **Pages Router** projects using **TypeScript**. Verify field names against your installed **`next`** version because the framework evolves._
