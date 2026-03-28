# Next.js Project Structure

Understanding **where files live** and **what each file does** is the fastest way to navigate **App Router** codebases—from **e-commerce** storefronts to **internal dashboards**. This guide maps **root config**, **`app/`**, **`pages/`**, **`public/`**, and **common supporting folders** with **beginner → expert** depth and **TypeScript-first** examples.

---

## 📑 Table of Contents

1. [2.1 Root Files](#21-root-files)
   - [next.config.js / next.config.ts](#nextconfigjs--nextconfigts)
   - [package.json](#packagejson)
   - [tsconfig.json](#tsconfigjson)
   - [.env Files](#env-files)
   - [.gitignore](#gitignore)
   - [next-env.d.ts](#next-envdts)
2. [2.2 App Directory](#22-app-directory)
   - [app/ Structure](#app-structure)
   - [page.tsx](#pagetsx)
   - [layout.tsx](#layouttsx)
   - [loading.tsx](#loadingtsx)
   - [error.tsx](#errortsx)
   - [not-found.tsx](#not-foundtsx)
   - [template.tsx](#templatetsx)
   - [route.ts](#routets)
   - [default.tsx](#defaulttsx)
3. [2.3 Pages Directory](#23-pages-directory)
   - [pages/ Structure](#pages-structure)
   - [_app.tsx](#_apptsx)
   - [_document.tsx](#_documenttsx)
   - [_error.tsx](#_errortsx)
   - [404.tsx](#404tsx)
   - [500.tsx](#500tsx)
   - [api/](#api)
4. [2.4 Public Directory](#24-public-directory)
   - [Static Files](#static-files)
   - [robots.txt](#robotstxt)
   - [sitemap.xml](#sitemapxml)
   - [favicon.ico](#faviconico)
   - [Images / Assets](#images--assets)
5. [2.5 Special Directories](#25-special-directories)
   - [components/](#components)
   - [lib/ and utils/](#lib-and-utils)
   - [styles/](#styles)
   - [middleware.ts](#middlewarets)
6. [Best Practices](#best-practices)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 2.1 Root Files

### next.config.js / next.config.ts

**Beginner Level:** This file is the **control panel** for Next.js—turn on **image hosts**, add **redirects** from `/sale` to `/deals`, or set **base path** if your **blog** lives under `/blog` on a bigger site.

**Intermediate Level:** Use **`NextConfig`** typing, **`images.remotePatterns`**, **`headers`**, **`redirects`**, **`rewrites`**, **`experimental`**, and **`output: 'standalone'`** for Docker. **ESM** vs **CJS** matters: **`next.config.mjs`** or **`type: module`** in **`package.json`**.

**Expert Level:** **`webpack`** and **`turbopack`** configuration hooks customize loaders; **`transpilePackages`** compiles workspace packages. **i18n** (Pages Router) and **`trailingSlash`** affect **CDN** rules. **Analyze** **bundle** impact when adding **polyfills**—prefer **browserslist** alignment.

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.example.com', pathname: '/catalog/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
```

#### Key Points

- **Treat** **`next.config`** as **infrastructure-as-code**—review in **PRs**.
- **Validate** **experimental** flags per **Next** **minor**.
- **Avoid** **secrets** in committed **config**—use **env** at **build**/**runtime**.

---

### package.json

**Beginner Level:** Lists **dependencies** (`next`, `react`) and **scripts**: **`dev`**, **`build`**, **`start`**. Running **`npm run dev`** starts your **project**.

**Intermediate Level:** **Peer** alignment: **`eslint-config-next`**, **`@types/node`**, **`typescript`**. **Engines** field pins **Node** for **CI**. **Package manager** **`packageManager`** field helps **Corepack**. **Private** monorepo packages use **`workspace:*`**.

**Expert Level:** **Postinstall** hooks can **patch** dependencies—security review required. **Resolutions/overrides** dedupe **React** in **monorepos**. **Analyze** **bundle** with **`next build --analyze`** (when configured). **Lockfile** discipline prevents **drift** across **SaaS** **staging**/**prod**.

```json
{
  "name": "acme-dashboard",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.1.0"
  },
  "engines": {
    "node": ">=20.9.0"
  }
}
```

#### Key Points

- **Pin** majors intentionally; **batch** **minor** upgrades with **tests**.
- **Keep** **`react`/`react-dom`** on **supported** pairs for **Next**.
- **Document** **scripts** for **designers**/**PMs** running **local** demos.

---

### tsconfig.json

**Beginner Level:** Tells **TypeScript** how to **check** your code—**strict** mode catches **typos** in a **student grades** dashboard.

**Intermediate Level:** Next sets **`jsx: "preserve"`**, **`moduleResolution: "bundler"`**, **`plugins: [{ "name": "next" }]`**. **`paths`** with **`@/*`** map imports. **`include`** must list **`next-env.d.ts`**, **`**/*.ts`, `**/*.tsx`**.

**Expert Level:** **Project references** for **monorepo** packages; align **`module`** with **Next** compiler expectations. **`verbatimModuleSyntax`** impacts **type-only** imports—use **`import type`**. **Avoid** **`isolatedModules: false`**—breaks **SWC**.

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Key Points

- **Commit** **`tsconfig`** changes with **rationale**.
- **Regenerate** **`.next/types`** affects **`include`**—after **build**, **IDE** sees **route** types.
- **Strict** catches **`params`**/` **`searchParams`** mistakes early.

---

### .env Files

**Beginner Level:** **`.env.local`** holds **private keys** (e.g., **Stripe test key**) for your **machine** only—**never** upload to **GitHub**.

**Intermediate Level:** **Load order**: `.env` → `.env.local` → `.env.development` / `.env.production` (mode-specific). **`NEXT_PUBLIC_*`** exposes to **browser** bundles. **Validate** with **Zod** at **startup** in **`instrumentation.ts`** or **`lib/env.ts`**.

**Expert Level:** **Vercel**/**Docker** inject **runtime** envs; **`NEXT_PUBLIC_`** is **inlined** at **build**—changing it needs **rebuild**. **Rotate** secrets with **zero-downtime** **pipelines**. **Multi-tenant SaaS** may use **per-tenant** config from **DB**, not **static** `.env` only.

```typescript
import { z } from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(10),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const serverEnv = serverSchema.parse(process.env);
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
```

#### Key Points

- **`.env*.local`** in **`.gitignore`** always.
- **Never** **`NEXT_PUBLIC_`** for **secrets**.
- **Document** required **vars** in **README** for **onboarding**.

---

### .gitignore

**Beginner Level:** Lists files **Git** should **ignore**—**`node_modules`**, **`.next`**, **`.env.local`** so you do not **commit** **junk** or **keys**.

**Intermediate Level:** Ignore **`.turbo`**, **`coverage`**, **`.vercel`**, **`*.log`**, **`.DS_Store`**. **Monorepos** may use **root** + **package** ignores. **Keep** **`next-env.d.ts`** **committed** (auto-generated but **tracked**).

**Expert Level:** **Secrets scanning** in **CI** complements **gitignore**. **Artifact** directories from **Playwright**/**Cypress** should be **ignored** but **uploaded** as **CI** **artifacts** selectively. **Lockfiles** should **not** be ignored.

```gitignore
node_modules
.next
out
.turbo
.vercel
.env*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
```

#### Key Points

- **Review** **ignores** when **adding** **new** **tools**.
- **Do not** ignore **`package-lock.json`**/**`pnpm-lock.yaml`** in **apps**.
- **Scan** **history** if **secrets** were **ever** committed.

---

### next-env.d.ts

**Beginner Level:** A **small auto-generated** file that helps **TypeScript** understand **Next.js** types—you usually **do not edit** it.

**Intermediate Level:** **Regenerated** on **`next dev`**/**`build`**; **reference** **`/// <reference types="next" />`**. **Include** in **`tsconfig`** so **JSX** and **route** types resolve.

**Expert Level:** **Merge conflicts**—prefer **regenerating** by **running** **dev**/**build** over **manual** edits. **Custom** **ambient** types live in **`types/*.d.ts`**, not **`next-env.d.ts`**.

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

#### Key Points

- **Do not** **hand-edit** except **rare** **merge** fixes—**regenerate**.
- **Commit** to **repo** for **consistent** **IDE** behavior.
- **Extend** via **separate** **declaration** files.

---

## 2.2 App Directory

### app/ Structure

**Beginner Level:** The **`app`** folder holds **screens** and **wrappers**. Each **folder** is usually part of the **URL**, like **`app/shop/page.tsx`** → **`/shop`**.

**Intermediate Level:** **Special files** (`page`, `layout`, `loading`, `error`, `route`, etc.) **compose** a **route segment**. **Route groups** `(name)` **omit** URL parts. **`[param]`** creates **dynamic** segments. **`@slot`** for **parallel routes**.

**Expert Level:** **Colocation** of **`_components`** or **`components.tsx`** (non-special names) keeps **feature** code near **routes** without affecting URLs. **Private folders** `_lib` are **ignored** for routing. **Understand** **segment** **boundaries** for **caching** and **error** **isolation**.

```
app/
  layout.tsx
  page.tsx
  (marketing)/
    layout.tsx
    pricing/page.tsx
  (app)/
    dashboard/
      layout.tsx
      page.tsx
```

#### Key Points

- **Only** **documented** filenames gain **framework** behavior.
- **Route groups** organize **without** **changing** URLs.
- **Plan** **layouts** for **shared** **chrome** (**nav**, **analytics**).

---

### page.tsx

**Beginner Level:** **`page.tsx`** is the **actual page** users see at a **route**—your **blog index** or **product** **detail**.

**Intermediate Level:** **Default export** must be a **React component**. **Async** **Server Components** can **`await fetch`**. **Generate static params** for **dynamic** **static** paths. **`export const metadata`** or **`generateMetadata`** for **SEO**.

**Expert Level:** **Colocate** **data** loaders **private** to the **segment**. **Avoid** **waterfalls**—**parallelize** **`fetch`** with **`Promise.all`**. **Streaming** via **`Suspense`** around **slow** **children**. **Type** **`PageProps`** with **Promise** **`params`**/**`searchParams`** per **current** Next types.

```tsx
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  return (
    <main>
      <h1>SKU {slug}</h1>
      <p>Sorted by {sort ?? 'featured'}</p>
    </main>
  );
}
```

#### Key Points

- **One** **`page.tsx`** per **route segment** leaf you want **navigable**.
- **Keep** **heavy** **client** **logic** in **`'use client'`** **children**.
- **SEO**: **compose** **metadata** at **page** level.

---

### layout.tsx

**Beginner Level:** **`layout.tsx`** wraps **pages** below it—**header** and **footer** stay while **content** swaps, like a **SaaS** **shell** around **settings** and **billing**.

**Intermediate Level:** **Root layout** **required**; **nested** layouts **compose**. **`children`** prop is **mandatory**. **Layouts** **persist** across **client navigations** (unlike **templates**). **Colocate** **providers** sparingly—prefer **client** **provider** **wrappers**.

**Expert Level:** **Partial rendering** respects **layout** **boundaries**. **Avoid** **async** **race** **bugs**—**stable** **keys** on **lists** in **layout**. **Data fetching** in **layouts** affects **all** **child** **routes**—watch **cache** **scope**. **Internationalization** loaders sometimes live in **root** **layout**.

```tsx
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr]">
      <aside>Sidebar</aside>
      <section>{children}</section>
    </div>
  );
}
```

#### Key Points

- **Do not** fetch **route-specific** **data** in **parent** **layout** unless **shared**.
- **Keep** **root** **layout** **`html`/`body`** **once**.
- **Client** **providers** at **subtree** **minimize** **JS**.

---

### loading.tsx

**Beginner Level:** Shows a **spinner** or **skeleton** **instantly** while a **slow** **page** loads—like **placeholder boxes** on a **social** **feed**.

**Intermediate Level:** **`loading.tsx`** wraps the **segment** in **React Suspense** **automatically** (App Router behavior). **Nested** **`loading`** files **target** **deeper** **routes**. **Combine** with **`Suspense` boundaries** manually for **finer** control.

**Expert Level:** **Streaming** **HTML** improves **TTFB** perception. **Skeleton** **layout** should **match** **CLS** **constraints**. **Avoid** **spinners** that **shift** **layout**. **Prefetch** and **loading** **states** should align with **`router.refresh()`** patterns after **mutations**.

```tsx
export default function Loading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-40 w-full animate-pulse rounded bg-muted" />
    </div>
  );
}
```

#### Key Points

- **Prefer** **skeletons** over **generic** **spinners** for **CLS**.
- **Nest** **loading** for **large** **route** **trees**.
- **Test** **slow** **3G** in **Chrome** **DevTools**.

---

### error.tsx

**Beginner Level:** If something **crashes**, **`error.tsx`** shows a **friendly** **message** instead of a **blank** screen on your **checkout** page.

**Intermediate Level:** Must be **`'use client'`**. Receives **`error`** and **`reset`** props. **Isolates** errors to a **segment** without **breaking** the **entire** app. **Log** to **monitoring** (`Sentry`) in **`useEffect`**.

**Expert Level:** **Distinguish** **expected** **errors** (use **`notFound()`**) vs **exceptional** **errors**. **Production** vs **dev** **stack traces** differ—**sanitize** **UI**. **Nested** **error** boundaries **compose**—**design** **fallbacks** per **feature** (**payments** vs **recommendations**).

```tsx
'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error', error);
  }, [error]);

  return (
    <div role="alert">
      <h2>Checkout unavailable</h2>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
```

#### Key Points

- **`error.tsx` is Client**—plan **imports** accordingly.
- **`reset`** re-renders **segment**—useful after **transient** **failures**.
- **Pair** with **monitoring** for **SaaS** **SLAs**.

---

### not-found.tsx

**Beginner Level:** Custom **404 page** when a **URL** does not exist—**“We could not find that blog post.”**

**Intermediate Level:** **`notFound()`** helper **throws** a **special** signal from **Server Components** or **handlers**. **Route-level** **`not-found.tsx`** **styles** **missing** **resources**. **Global** **404** still uses **root** **`not-found.tsx`** in **App Router**.

**Expert Level:** **Differentiate** **soft** **404s** (**legal** **compliance**) vs **marketing** **404** **campaigns**. **Log** **404** **clusters** to detect **broken** **links** in **e-commerce** **catalog** migrations. **Internationalized** **copy** via **dictionaries**.

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <h1>Product not found</h1>
      <p>The SKU may have been discontinued.</p>
      <Link href="/shop">Back to catalog</Link>
    </main>
  );
}
```

```typescript
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function LegacyRedirect({ params }: Props) {
  const { id } = await params;
  const exists = await fetch(`https://api.example.com/items/${id}`, { cache: 'no-store' }).then((r) => r.ok);
  if (!exists) notFound();
  return null;
}
```

#### Key Points

- **Use** **`notFound()`** for **expected** **missing** **entities**.
- **Keep** **messaging** **on-brand** for **marketing** sites.
- **Monitor** **404** rates after **migrations**.

---

### template.tsx

**Beginner Level:** Like a **layout**, but **remounts** on **navigation**—good for **page enter animations** on a **fashion** **lookbook**.

**Intermediate Level:** **Use** **`template.tsx`** when you need **keyed** remounts or **animation** libraries that expect **mount**/**unmount** cycles. **Layouts** **persist** state; **templates** **do not**.

**Expert Level:** **Watch** **performance**—**remounting** **heavy** **trees** is costly. **Prefer** **layout** for **data** **caching** in **client** state. **Coordinate** with **view transitions** APIs when **available**/**polyfilled**.

```tsx
'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {children}
    </motion.div>
  );
}
```

#### Key Points

- **Default** to **layout**; **reach** for **template** for **remount** semantics.
- **Templates** **do not** replace **error**/**loading** concerns.
- **Measure** **INP** when **animating** large **DOM** subtrees.

---

### route.ts

**Beginner Level:** **`route.ts`** creates an **API** endpoint at a **URL**—`app/api/cart/route.ts` → **`/api/cart`** for your **store**.

**Intermediate Level:** Export **`GET`**, **`POST`**, etc. **functions** receiving **`Request`**. **Use** **`NextResponse`**. **Set** **`runtime`** (`edge`/`nodejs`). **Validate** **input** with **Zod**. **Return** **JSON**/**streams**.

**Expert Level:** **Dedupe** **handlers** with **shared** **auth** middleware patterns. **Rate limit** at **edge** with **KV**/**Redis**. **Webhooks** (**Stripe**) need **raw** **body** parsing—**configure** **`export const dynamic = 'force-dynamic'`** when needed.

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ sku: z.string(), qty: z.number().int().positive() });

export async function POST(req: Request) {
  const json: unknown = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  return NextResponse.json({ ok: true, cartId: 'cart_123' });
}
```

#### Key Points

- **Prefer** **route handlers** over **custom** servers for **HTTP** APIs.
- **Mind** **body** size **limits** and **streaming**.
- **Secure** **with** **CSRF** strategies for **cookie** **sessions**.

---

### default.tsx

**Beginner Level:** When using **parallel routes**, **`default.tsx`** is the **fallback** **UI** if **no** **slot** **content** is **active**—like an **empty** **modal** slot on **first** load.

**Intermediate Level:** **Required** for **optional** **slots** to avoid **build**/**runtime** **errors** on **hard refresh**/**deep link**. **Return** **`null`** for **no** **UI**.

**Expert Level:** **Compose** with **`@modal`** **intercepting** routes for **gallery** patterns. **Ensure** **consistent** **layout** **metrics** when **`default`** **differs** from **loaded** **slot**—avoid **CLS**.

```tsx
export default function Default() {
  return null;
}
```

#### Key Points

- **Mandatory** for **optional** **parallel** **slots**.
- **Keep** **lightweight**—**no** **heavy** **fetch** here unless **needed**.
- **Test** **hard** **refresh** on **complex** **parallel** **routes**.

---

## 2.3 Pages Directory

### pages/ Structure

**Beginner Level:** Each **`.tsx`** file in **`pages/`** becomes a **route**: **`pages/team.tsx`** → **`/team`**.

**Intermediate Level:** **Dynamic** routes use **`[id].tsx`**. **Catch-all** **`[...slug].tsx`**. **Index** routes use **`index.tsx`**. **API routes** under **`pages/api`**.

**Expert Level:** **Coexistence** with **`app/`** during **migration**—avoid **duplicate** paths. **Base path** and **i18n** affect **actual** URLs. **Custom** **`pageExtensions`** in config change **filenames**.

```
pages/
  index.tsx
  blog/
    index.tsx
    [slug].tsx
  api/
    hello.ts
```

#### Key Points

- **Prefer** **`app/`** for **new** work.
- **Consistent** **naming** prevents **404** surprises.
- **Plan** **redirects** from **legacy** **pages** URLs.

---

### _app.tsx

**Beginner Level:** **Wraps all pages**—put **global CSS** and **layout** that **every** **screen** shares, like **theme** for a **dashboard**.

**Intermediate Level:** **`Component`**, **`pageProps`** pattern. **Integrate** **providers** (**React Query**, **ThemeProvider**). **Avoid** **heavy** **data** fetching here—prefer **per-page** **`getServerSideProps`**.

**Expert Level:** **Custom** **`getInitialProps`** in **`_app`** **disables** **automatic static optimization** for **pages** without **`getStaticProps`**—**performance** pitfall. **Measure** **JS** **bundle** impact of **global** providers.

```tsx
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

#### Key Points

- **Global** **styles** import **here** (Pages Router).
- **Avoid** **accidental** **SSR** **blocking** **work** in **`_app`**.
- **Migrating**? Map **providers** to **`app/layout.tsx`** **client** **child**.

---

### _document.tsx

**Beginner Level:** Customizes **`<html>`** and **`<body>`** tags—**rare** for **beginners**; used for **lang** attribute or **fonts** in **classic** setups.

**Intermediate Level:** **Extend** **`Document`** from **`next/document`**. **Use** **`Head`** for **static** head tags. **Do not** use **`next/head`** here incorrectly—**know** separation.

**Expert Level:** **Styled-components** / **emotion** **SSR** sometimes requires **`_document`** changes. **App Router** uses **`layout.tsx`** instead for many concerns—**migration** **simplifies** **`_document`** needs.

```tsx
import { Html, Head, Main, NextScript } from 'next/document';

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

#### Key Points

- **Only** **one** **`_document`** per **app**.
- **Avoid** **adding** **app** **logic** here.
- **Prefer** **`next/font`** in **App Router** for **fonts**.

---

### _error.tsx

**Beginner Level:** **Custom error page** for **runtime** errors in **Pages Router**—similar spirit to **`error.tsx`** in **App Router**.

**Intermediate Level:** **Must** **`getInitialProps`** or **static** **`statusCode`** patterns in **classic** implementations. **Distinguish** **404** vs **500**.

**Expert Level:** Prefer **`pages/500.tsx`** and **`pages/404.tsx`** where applicable in **modern** setups. **Monitoring** integration **here** for **legacy** apps.

```tsx
import type { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return <p>{statusCode ? `Error ${statusCode}` : 'Client error'}</p>;
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
```

#### Key Points

- **Legacy** **Pages** concern—**map** to **`error.tsx`** when **migrating**.
- **Do not** **confuse** with **`not-found`** semantics.
- **Log** **server** vs **client** **errors** distinctly.

---

### 404.tsx

**Beginner Level:** **Custom not found** page for **unknown** URLs in **Pages Router**.

**Intermediate Level:** **Static** **404** served when **no** **matching** **page**. **Branding** and **helpful** links **reduce** **bounce** for **e-commerce**.

**Expert Level:** **Analytics** events on **404** to **find** **bad** **campaign** links. **Internationalization** with **`next-i18next`** patterns in **legacy** apps.

```tsx
export default function FourOhFour() {
  return (
    <main>
      <h1>Page not found</h1>
      <a href="/">Return home</a>
    </main>
  );
}
```

#### Key Points

- **Pair** with **server** **`notFound()`** patterns in **App Router**.
- **Keep** **helpful** **navigation**.
- **Track** **404s**.

---

### 500.tsx

**Beginner Level:** **Server error** page—**“Something went wrong”** for **your** **video** **streaming** site when **APIs** fail.

**Intermediate Level:** **Static** by default; **ensure** **no** **runtime** dependencies that **break** during **outages**. **Link** to **status** page.

**Expert Level:** **Differentiate** **planned** **maintenance** vs **unexpected** **500** via **middleware** **rewrites** to **`/status`**.

```tsx
export default function FiveHundred() {
  return (
    <main>
      <h1>We are fixing this</h1>
      <p>Please retry shortly.</p>
    </main>
  );
}
```

#### Key Points

- **Static** **fallback** helps when **dynamic** **errors** occur.
- **Communicate** **ETA** for **trust** in **SaaS**.
- **Monitor** **incident** channels.

---

### api/

**Beginner Level:** **`pages/api/*`** files are **backend** endpoints—**`/api/hello`** returns **JSON** for a **simple** **form**.

**Intermediate Level:** **`NextApiRequest`**, **`NextApiResponse`** types. **Middleware** patterns for **auth**. **Edge** API routes with **`config.runtime = 'edge'`** (where supported).

**Expert Level:** **Migrate** to **`app/**/route.ts`** for **Web** **`Request`** standard, **better** **streaming**. **Shared** **validation** libraries between **handlers** and **Server Actions**.

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = { ok: true };

export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ ok: true });
}
```

#### Key Points

- **New** **HTTP** endpoints → **`route.ts`** in **`app/`**.
- **Keep** **typing** **strict** for **req**/**res**.
- **CORS** and **cookies** require **explicit** **handling**.

---

## 2.4 Public Directory

### Static Files

**Beginner Level:** Files in **`public/`** are served **as-is** at the **root** URL—**`public/hero.jpg`** → **`/hero.jpg`** for a **coffee** **shop** **banner**.

**Intermediate Level:** **No** **import** needed—use **absolute** paths **`/hero.jpg`**. **Cache-Control** defaults depend on **platform**—override via **`headers`** in **`next.config`**.

**Expert Level:** **Prefer** **`next/image`** for **images** needing **optimization**. **Version** **static** assets with **hashed** **filenames** from **`next build`** for **immutable** caching—**public** files are **not** **hashed** unless you **do** it.

```tsx
export function Hero() {
  return <img src="/marketing/hero.jpg" alt="Fresh beans pouring" width={1200} height={630} />;
}
```

#### Key Points

- **`public`** is **world-readable**—**never** **secrets**.
- **Large** **media** may belong on **CDN** instead.
- **Use** **meaningful** **folder** names (`/downloads`, `/docs`).

---

### robots.txt

**Beginner Level:** Tells **search bots** which **pages** they can **crawl**—**important** for **staging** environments you want **hidden**.

**Intermediate Level:** **Static** **`public/robots.txt`** is simple. **Dynamic** **`app/robots.ts`** **generates** rules per **environment** variable.

**Expert Level:** **SaaS** **multi-tenant** **subdomains** may need **per-tenant** **robots** via **middleware** **`rewrite`** to **handler**. **Disallow** **query** **facets** that **create** **infinite** URLs.

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/private/'] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
```

#### Key Points

- **Never** **block** **critical** **CSS/JS** needed for **rendering**.
- **Separate** **staging**/**prod** policies.
- **Link** **sitemap** in **robots**.

---

### sitemap.xml

**Beginner Level:** **List** of **URLs** for **Google**—helps your **blog** posts appear **faster**.

**Intermediate Level:** **`app/sitemap.ts`** returns **`MetadataRoute.Sitemap`**. **Include** **`lastModified`**, **`changeFrequency`**, **`priority`**.

**Expert Level:** **Paginated** **sitemaps** for **1M+** **SKU** **catalogs**—split **`sitemap/[page]/route.ts`** patterns or **external** **generation** jobs. **Revalidate** when **CMS** **webhooks** fire.

```typescript
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetch('https://cms.example.com/posts').then((r) => r.json() as Promise<{ slug: string }[]>);
  const base = 'https://example.com';
  return posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(),
  }));
}
```

#### Key Points

- **Keep** **URLs** **canonical** and **HTTPS**.
- **Avoid** **duplicate** **content** paths.
- **Monitor** **Search Console** **coverage**.

---

### favicon.ico

**Beginner Level:** The **little icon** on **browser** tabs—put **`favicon.ico`** in **`app/`** (App Router) or **`public/`**.

**Intermediate Level:** **App Router** supports **`icon.png`**, **`apple-icon.png`**, **`favicon.ico`** via **file conventions** in **`app/`**. **Metadata API** can **declare** **icons**.

**Expert Level:** **Cache busting** via **filename** changes. **Serve** **multiple** sizes for **PWA** manifests. **Dark/light** variants where supported.

```tsx
// app/layout.tsx (excerpt) — icons can also be file-based in app/
import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: { icon: '/favicon.ico' },
};
```

#### Key Points

- **Prefer** **file-based** **metadata** where **simple**.
- **Test** **iOS** **home screen** icons.
- **Keep** **sizes** documented for **design** handoff.

---

### Images / Assets

**Beginner Level:** **Logos** and **PDFs** can live in **`public/`**—link with **`/brand/logo.svg`**.

**Intermediate Level:** **Use** **`next/image`** for **responsive** **images** with **`sizes`** prop. **SVG** as **components** when **styling**/**animation** needed.

**Expert Level:** **`remotePatterns`** **security** **boundary**. **Blur** **placeholders** from **CMS** **LQIP**. **CDN** **signed URLs** require **loader** customization.

```tsx
import Image from 'next/image';

export function LogoMark() {
  return <Image src="/brand/logo.svg" alt="Acme" width={120} height={32} priority />;
}
```

#### Key Points

- **`priority`** only for **LCP** candidates.
- **`sizes`** critical for **responsive** **performance**.
- **Avoid** **megapixel** **unoptimized** **galleries**.

---

## 2.5 Special Directories

### components/

**Beginner Level:** **Reusable UI** pieces—**buttons**, **cards**—used across **shop** and **blog**.

**Intermediate Level:** Split **`ui/`** (primitives) vs **`features/`** (domain). **Colocate** **stories**/**tests**. **Server** vs **Client** components by **default** **server**—mark **`'use client'`** at **leaf** **interactive** components.

**Expert Level:** **Barrel** **`index.ts`** **exports** can **harm** **tree-shaking**—**prefer** **direct** paths for **hot** paths. **Design tokens** integration (**Tailwind**, **CSS variables**).

```tsx
type AddToCartProps = { sku: string };

export function AddToCartButton({ sku }: AddToCartProps) {
  return (
    <button className="rounded bg-black px-3 py-2 text-white" type="button">
      Add {sku}
    </button>
  );
}
```

#### Key Points

- **Name** **files** by **role**, not **type** only (`product-card.tsx`).
- **Document** **RSC**/**client** **boundaries** in **README** for **contributors**.
- **Avoid** **circular** imports across **features**.

---

### lib/ and utils/

**Beginner Level:** **Helper** functions—**formatting prices**, **date** labels—for your **marketplace**.

**Intermediate Level:** **`lib/db.ts`**, **`lib/auth.ts`**, **`lib/cn.ts`**. **Mark** **`server-only`** package for **modules** that must **never** **import** **client** **bundles**.

**Expert Level:** **Domain** **services** vs **utility** **pure** **functions**—**separate** **test** **strategies**. **Dependency injection** for **testability** in **SaaS** billing logic.

```typescript
import 'server-only';

export async function getDashboardKpis(orgId: string): Promise<{ mrrCents: number }> {
  // pretend DB call
  return { mrrCents: 125000_00 };
}
```

```typescript
export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
```

#### Key Points

- **Use** **`server-only`** to **prevent** **accidental** **client** imports.
- **Keep** **utils** **pure** when possible.
- **Test** **lib** with **unit** tests **without** **Next** runtime.

---

### styles/

**Beginner Level:** **CSS files**—**globals** and **modules**—for **consistent** colors on a **magazine** site.

**Intermediate Level:** **`globals.css`** imported in **`app/layout.tsx`**. **CSS Modules** `*.module.css` **scoped** styles. **Tailwind** `globals` with **`@tailwind`** directives.

**Expert Level:** **Critical CSS** strategies; **dark mode** via **`class`**/**`media`**. **Layer** **`@layer`** for **precedence** control. **Avoid** **global** **leaks** from **third-party** CSS.

```css
/* styles/globals.css (excerpt) */
:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
```

#### Key Points

- **One** **global** entry for **App Router** apps.
- **Prefer** **modules**/**utility** **classes** over **deep** **globals**.
- **Audit** **specificity** wars early.

---

### middleware.ts

**Beginner Level:** **Runs on the edge** before a **page** loads—**redirect** logged-out users from **`/dashboard`** to **`/login`**.

**Intermediate Level:** **`export function middleware(req: NextRequest)`** returns **`NextResponse`**. **`matcher`** limits **scope**. **Use** **`geolocation`**, **`cookies`**, **`headers`**.

**Expert Level:** **Latency** **budget**—**keep** **middleware** **fast**. **Auth** **JWT** **verification** **cost** vs **session** **cookie** **checks**. **Avoid** **heavy** **Node-only** APIs on **edge**. **Compose** with **`next-auth`**/**Clerk** patterns.

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
```

#### Key Points

- **Matcher** **precision** reduces **cost**.
- **Remember** **middleware** runs **often**—**no** **DB** round trips unless **absolutely** needed.
- **Test** **redirect** loops carefully.

---

## Best Practices

- **Colocate** **route-specific** components under **`app/(feature)/...`** folders.
- **Keep** **`public/`** **minimal**; **optimize** images with **`next/image`** and **CDNs** for **media-heavy** **social** apps.
- **Type** **configs** (`NextConfig`, **`Metadata`**) and **validate** **env**.
- **Separate** **`server-only`** **modules** from **shared** **utils**.
- **Plan** **parallel**/**intercepting** routes **on paper** before **coding** **modals**.
- **Document** **Pages↔App** **migration** **map** in **wiki** for **large** **teams**.
- **Use** **dynamic** **`robots`**/**`sitemap`** when **staging** must **differ** from **prod**.

---

## Common Mistakes to Avoid

- **Duplicating** routes in **`pages/`** and **`app/`** causing **confusing** **404/rewrite** behavior.
- **Putting** **secrets** in **`public/`** or **referencing** them in **client** code.
- **Omitting** **`default.tsx`** for **optional** **parallel** **slots**.
- **Using** **`next/image`** without **`remotePatterns`** for **remote** **CDN** assets.
- **Heavy** **database** calls inside **`middleware`** on **every** request.
- **Global** **`'use client'`** **providers** in **`layout`** without **scoping**.
- **Ignoring** **`.gitignore`** for **local** env files—**leaking** **Stripe** keys.
- **Barrel** files that **import** **server-only** code into **client** **trees**.

---

*Structure conventions evolve with Next.js releases; validate special filenames against the official App Router reference for your version.*
