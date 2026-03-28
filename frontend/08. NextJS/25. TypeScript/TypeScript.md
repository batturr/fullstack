# TypeScript with Next.js

Type-safe routing, data fetching, API handlers, and configuration patterns for e-commerce catalogs, blogs, SaaS dashboards, and social apps. This chapter maps Next.js-specific types to practical TypeScript habits.

## 📑 Table of Contents

- [25.1 TypeScript Setup](#251-typescript-setup)
  - [TypeScript with Next.js](#typescript-with-nextjs)
  - [tsconfig.json](#tsconfigjson)
  - [Type Checking](#type-checking)
  - [Incremental Compilation](#incremental-compilation)
- [25.2 Page and Layout Types](#252-page-and-layout-types)
  - [Page Component Types](#page-component-types)
  - [Layout Types](#layout-types)
  - [Route Params Type](#route-params-type)
  - [Search Params Type](#search-params-type)
  - [Metadata Type](#metadata-type)
- [25.3 API Route Types](#253-api-route-types)
  - [Route Handler Types](#route-handler-types)
  - [NextRequest Type](#nextrequest-type)
  - [NextResponse Type](#nextresponse-type)
  - [Dynamic Params Type](#dynamic-params-type)
- [25.4 Data Fetching Types](#254-data-fetching-types)
  - [Typed fetch Responses](#typed-fetch-responses)
  - [getServerSideProps Type](#getserversideprops-type)
  - [getStaticProps Type](#getstaticprops-type)
  - [getStaticPaths Type](#getstaticpaths-type)
- [25.5 Common Next.js Types](#255-common-nextjs-types)
  - [NextPage](#nextpage)
  - [AppProps](#appprops)
  - [NextApiRequest and NextApiResponse](#nextapirequest-and-nextapiresponse)
  - [GetServerSidePropsContext](#getserversidepropscontext)
  - [GetStaticPropsContext](#getstaticpropscontext)
- [25.6 Configuration Types](#256-configuration-types)
  - [next.config.ts](#nextconfigts)
  - [Middleware Types](#middleware-types)
  - [Server Actions Types](#server-actions-types)
- [25.7 Third-party Library Types](#257-third-party-library-types)
  - [@types Packages](#types-packages)
  - [Module Augmentation](#module-augmentation)
  - [Type Declarations](#type-declarations)
- [25.8 TypeScript Best Practices](#258-typescript-best-practices)
  - [Strict Mode](#strict-mode)
  - [Type Inference](#type-inference)
  - [Generic Components](#generic-components)
  - [Avoiding any](#avoiding-any)
  - [Type Guards](#type-guards)
  - [Utility Types](#utility-types)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 25.1 TypeScript Setup

### TypeScript with Next.js

**Beginner Level:** Create a Next app with the TypeScript template; use `.tsx` for React views and `.ts` for utilities.

**Intermediate Level:** Share domain types between Server Components, Client Components, and route handlers via `src/types` or a shared package in a monorepo.

**Expert Level:** Align `moduleResolution: "bundler"` with Next’s compiler, enable project references across `apps/web` and `packages/core`, and keep React types locked to the installed React version.

```bash
npx create-next-app@latest --typescript
```

**Key Points — TypeScript with Next.js**

- Framework types ship with `next`.
- Keep `@types/react` in sync with React.

---

### tsconfig.json

**Beginner Level:** Turning on `strict` helps a personal blog avoid silly `null` errors before deploy.

**Intermediate Level:** `paths` maps `@/*` to `./src/*` like the default template; include `.next/types/**/*.ts` when using typed routes.

**Expert Level:** Use `plugins: [{ "name": "next" }]` so editor tooling understands Next.js conventions; tune `jsx` to `preserve`.

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
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key Points — tsconfig.json**

- `skipLibCheck` speeds CI; occasionally masks broken upstream `.d.ts` files.
- Revisit config after major Next upgrades.

---

### Type Checking

**Beginner Level:** `next build` fails when TypeScript errors exist (unless explicitly overridden).

**Intermediate Level:** Add `npm run typecheck` with `tsc --noEmit` for faster feedback than full production builds.

**Expert Level:** Run `typecheck` in parallel with unit tests in CI; cache `.tsbuildinfo` for monorepos.

```json
{ "scripts": { "typecheck": "tsc --noEmit" } }
```

**Key Points — Type Checking**

- Treat type errors as merge blockers.
- Pair with ESLint `@typescript-eslint` rules for promises.

---

### Incremental Compilation

**Beginner Level:** `incremental: true` stores build graphs so the second run is faster—nice on a laptop.

**Intermediate Level:** Delete `.tsbuildinfo` when TypeScript upgrades behave oddly.

**Expert Level:** Remote caches (Turborepo) restore prior `tsc` outputs when inputs unchanged.

**Key Points — Incremental**

- Big win for developer iteration.
- Ensure `.gitignore` excludes `.tsbuildinfo` if generated locally.

---

## 25.2 Page and Layout Types

### Page Component Types

**Beginner Level:** Type the props your page receives, especially `params` for `/blog/[slug]`.

**Intermediate Level:** App Router pages accept `{ params, searchParams }`; in Next 15 some values may be promises—await per docs for your version.

**Expert Level:** Parse `params` with Zod after extracting them so invalid slugs become `notFound()` before hitting the database.

```tsx
type PageProps = {
  params: { slug: string };
  searchParams: { q?: string };
};

export default function BlogPostPage({ params, searchParams }: PageProps) {
  const q = searchParams.q ?? "";
  return (
    <main>
      <h1>{params.slug}</h1>
      <p>Search hint: {q}</p>
    </main>
  );
}
```

**Key Points — Page Component Types**

- Keep route param types adjacent to the route file.
- Never trust dynamic segments without validation.

---

### Layout Types

**Beginner Level:** Layouts wrap nested routes; type `children: React.ReactNode`.

**Intermediate Level:** Share chrome (nav, analytics) while keeping data fetching in leaf pages when possible.

**Expert Level:** Thread discriminated `Viewer` types through nested layouts for enterprise SaaS consoles with role-based sidebars.

```tsx
import type { ReactNode } from "react";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[220px_1fr]">
      <aside className="border-r p-4">Categories</aside>
      <section>{children}</section>
    </div>
  );
}
```

**Key Points — Layout Types**

- Avoid loading heavy data for every child route in root layouts.
- Mind client provider placement to limit bundle impact.

---

### Route Params Type

**Beginner Level:** `[sku]` maps to `params.sku: string`.

**Intermediate Level:** Catch-all routes produce `string[] | undefined`—handle both.

**Expert Level:** Use branded types `type Sku = string & { __brand: "Sku" }` after validation for e-commerce invariants.

```typescript
type Params = { params: { orderId: string } };

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
```

**Key Points — Route Params**

- Align param names with folder names exactly.
- Transform (uppercase SKU, trim slug) after validation.

---

### Search Params Type

**Beginner Level:** Query strings like `?sort=price` arrive as strings.

**Intermediate Level:** Duplicate keys become `string[]`; normalize with a helper.

**Expert Level:** Coerce numbers and booleans with Zod (`z.coerce.number()`) for dashboard filters.

```typescript
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
```

**Key Points — Search Params**

- Treat them as untrusted—never pass raw into SQL.
- Prefer path segments for hierarchical data when SEO matters.

---

### Metadata Type

**Beginner Level:** `export const metadata: Metadata = { title: "Newsroom" }` sets the document title for a media blog.

**Intermediate Level:** `generateMetadata` can async fetch CMS fields to populate Open Graph images per article.

**Expert Level:** Type alternate languages and canonical URLs for international storefronts.

```typescript
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await fetch(`https://cms.example.com/articles/${params.slug}`).then((r) => r.json());
  return {
    title: article.seoTitle,
    description: article.summary,
    openGraph: { images: [{ url: article.coverUrl }] },
  };
}
```

**Key Points — Metadata Type**

- Metadata runs on the server—safe for secrets only if never returned to client.
- Keep OG image URLs absolute.

---

## 25.3 API Route Types

### Route Handler Types

**Beginner Level:** `route.ts` exports `GET`/`POST` functions returning `Response`.

**Intermediate Level:** Use `NextResponse.json` for typed JSON bodies.

**Expert Level:** Share Zod schemas between clients and servers for end-to-end typings of cart checkout APIs.

```typescript
import { NextResponse } from "next/server";

type Health = { ok: true; uptimeSeconds: number };

export async function GET(): Promise<NextResponse<Health>> {
  return NextResponse.json({ ok: true, uptimeSeconds: process.uptime() });
}
```

**Key Points — Route Handler Types**

- Explicit return types clarify error paths.
- Keep handlers thin; delegate to services.

---

### NextRequest Type

**Beginner Level:** `NextRequest` extends `Request` with helpers like `nextUrl`.

**Intermediate Level:** Read cookies via `request.cookies.get("session")` for social app auth.

**Expert Level:** Avoid Node-only APIs inside edge middleware—stick to web standard APIs there.

```typescript
import type { NextRequest } from "next/server";

export function readLocale(req: NextRequest): string | undefined {
  return req.cookies.get("NEXT_LOCALE")?.value;
}
```

**Key Points — NextRequest**

- Prefer `nextUrl` for pathname/search parsing.
- Treat headers as untrusted.

---

### NextResponse Type

**Beginner Level:** Return JSON errors with appropriate HTTP status codes.

**Intermediate Level:** Set `Set-Cookie` for session rotation after login.

**Expert Level:** Attach `Content-Security-Policy` headers consistently via helper.

```typescript
import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
```

**Key Points — NextResponse**

- Use helpers to avoid duplicating security headers.
- Type JSON payloads with generics for clarity.

---

### Dynamic Params Type

**Beginner Level:** Handler second argument includes `params` with route segments.

**Intermediate Level:** Validate param shapes before using them in Prisma queries.

**Expert Level:** When Next passes promised params, `const { id } = await params` keeps types accurate.

```typescript
import { NextResponse } from "next/server";

type Ctx = { params: { userId: string } };

export async function GET(_req: Request, ctx: Ctx) {
  return NextResponse.json({ userId: ctx.params.userId });
}
```

**Key Points — Dynamic Params**

- Align handler types with folder structure.
- Never interpolate raw params into SQL strings.

---

## 25.4 Data Fetching Types

### Typed fetch Responses

**Beginner Level:** `await res.json()` returns `unknown` until you validate or cast.

**Intermediate Level:** Use Zod to parse CMS responses for a headless blog.

**Expert Level:** Return discriminated unions from data loaders so UI handles `loading | error | success` explicitly.

```typescript
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  priceCents: z.number().int().nonnegative(),
});

export type Product = z.infer<typeof ProductSchema>;

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`https://api.example.com/products/${id}`);
  if (!res.ok) throw new Error(`Failed product fetch (${res.status})`);
  return ProductSchema.parse(await res.json());
}
```

**Key Points — Typed fetch**

- Parsing beats casting for external JSON.
- Encode HTTP failures separately from schema failures when needed.

---

### getServerSideProps Type

**Beginner Level:** `GetServerSideProps<Props>` ensures returned props match the page component.

**Intermediate Level:** Return `notFound` or `redirect` with precise typing.

**Expert Level:** Compose with authentication helpers returning either props or redirect unions.

```typescript
import type { GetServerSideProps, NextPage } from "next";

type Props = { product: { name: string } };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const sku = ctx.params?.sku;
  if (typeof sku !== "string") return { notFound: true };
  return { props: { product: { name: `Widget ${sku}` } } };
};

const Page: NextPage<Props> = ({ product }) => <h1>{product.name}</h1>;

export default Page;
```

**Key Points — getServerSideProps**

- Do not expose secrets in props—they serialize to the client.
- Consider ISR when traffic spikes.

---

### getStaticProps Type

**Beginner Level:** `GetStaticProps` powers SSG pages like a documentation site.

**Intermediate Level:** `revalidate` typed as `number` enables ISR.

**Expert Level:** Combine with CMS preview data typing `PreviewData` generic when using draft mode.

```typescript
import type { GetStaticProps, NextPage } from "next";

type Props = { posts: { slug: string; title: string }[] };

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: { posts: [{ slug: "hello", title: "Hello world" }] },
  revalidate: 120,
});

const Page: NextPage<Props> = ({ posts }) => (
  <ul>
    {posts.map((post) => (
      <li key={post.slug}>{post.title}</li>
    ))}
  </ul>
);

export default Page;
```

**Key Points — getStaticProps**

- Props must be serializable—no functions or class instances.
- Watch build times when lists grow large.

---

### getStaticPaths Type

**Beginner Level:** Provide `paths` with `params` objects for each static page.

**Intermediate Level:** Choose `fallback` strategy consciously for large e-commerce catalogs.

**Expert Level:** Include `locale` keys when using Pages Router built-in i18n.

```typescript
import type { GetStaticPaths } from "next";

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [{ params: { slug: "alpha" } }, { params: { slug: "beta" } }],
  fallback: "blocking",
});
```

**Key Points — getStaticPaths**

- Typo in `params` keys fails builds—match dynamic segment names.
- Use CMS pagination to generate paths.

---

## 25.5 Common Next.js Types

### NextPage

**Beginner Level:** `NextPage` adds optional data fetching types to a component.

**Intermediate Level:** `NextPage<Props>` keeps page props synchronized.

**Expert Level:** Prefer plain functions in App Router; keep `NextPage` for legacy Pages Router maintenance.

```typescript
import type { NextPage } from "next";

type Props = { title: string };

const Page: NextPage<Props> = ({ title }) => <h1>{title}</h1>;

export default Page;
```

**Key Points — NextPage**

- Legacy but still valid for many codebases.
- Generally avoid `React.FC` unless you explicitly need its `children` defaulting behavior.

---

### AppProps

**Beginner Level:** `_app.tsx` receives `Component` and `pageProps`.

**Intermediate Level:** Wrap with providers (theme, analytics) for all Pages Router routes.

**Expert Level:** Type `pageProps` augmentation when using `getInitialProps` at app level (rare).

```typescript
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

**Key Points — AppProps**

- App Router uses `layout.tsx` instead for new apps.
- Keep global providers minimal to reduce client JS.

---

### NextApiRequest and NextApiResponse

**Beginner Level:** Pages Router API route signature `(req, res)`.

**Intermediate Level:** Narrow `req.method` with early returns.

**Expert Level:** Create `ApiError` class mapped to consistent JSON error bodies for SaaS public APIs.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { status: "ok" } | { error: string };

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  return res.status(200).json({ status: "ok" });
}
```

**Key Points — NextApiRequest/Response**

- Prefer App Router handlers for greenfield APIs.
- Always validate input bodies with Zod.

---

### GetServerSidePropsContext

**Beginner Level:** Contains `req`, `res`, `query`, `params`, and `locale`.

**Intermediate Level:** Use `query` for shallow filters but validate types.

**Expert Level:** Extract `getServerSession` (pattern) using typed adapters for auth-aware dashboards.

```typescript
import type { GetServerSidePropsContext } from "next";

export function readQueryParam(ctx: GetServerSidePropsContext, key: string): string | undefined {
  const value = ctx.query[key];
  return Array.isArray(value) ? value[0] : value;
}
```

**Key Points — GetServerSidePropsContext**

- `query` values are loosely typed.
- Never forward raw `req.headers` to props.

---

### GetStaticPropsContext

**Beginner Level:** Provides `params` for dynamic SSG routes.

**Intermediate Level:** `preview` boolean toggles draft content for editorial blogs.

**Expert Level:** Generic `GetStaticProps<Props, Params, PreviewData>` threads typed preview payloads.

```typescript
import type { GetStaticPropsContext } from "next";

export function readSlug(ctx: GetStaticPropsContext<{ slug: string }>) {
  return ctx.params?.slug;
}
```

**Key Points — GetStaticPropsContext**

- Guard `params`—may be undefined with certain fallback modes.
- Draft mode should enforce auth on CMS side too.

---

## 25.6 Configuration Types

### next.config.ts

**Beginner Level:** `NextConfig` type helps autocomplete `images.remotePatterns`.

**Intermediate Level:** Split configs per environment using `process.env.VERCEL_ENV`.

**Expert Level:** Compose plugins (`withSentryConfig`, bundle analyzer) while preserving strong typing via small helper functions.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.example.com", pathname: "/**" }],
  },
};

export default nextConfig;
```

**Key Points — next.config.ts**

- Type-safe config reduces typos in experimental flags.
- Document why each experimental flag exists—remove when stabilized.

---

### Middleware Types

**Beginner Level:** `middleware.ts` exports `middleware(request: NextRequest)` and optional `config.matcher`.

**Intermediate Level:** Clone headers immutably when injecting tracing IDs for SaaS observability.

**Expert Level:** Type `matcher` as const tuples; avoid importing Node `fs` into edge bundles.

```typescript
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", crypto.randomUUID());
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

**Key Points — Middleware Types**

- Edge runtime ≠ Node—verify APIs against docs.
- Keep matchers tight to reduce cost and attack surface.

---

### Server Actions Types

**Beginner Level:** Server actions are async functions marked with `"use server"`.

**Intermediate Level:** Return discriminated unions so `useFormState` consumers handle errors.

**Expert Level:** Wrap actions with auth helpers returning `never` when sessions invalid, keeping type flow sound.

```typescript
"use server";

import { z } from "zod";

const NoteSchema = z.object({ body: z.string().min(1).max(280) });

export type SaveNoteResult = { ok: true } | { ok: false; error: string };

export async function saveNote(_: SaveNoteResult, formData: FormData): Promise<SaveNoteResult> {
  const parsed = NoteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { ok: false, error: "invalid_body" };
  return { ok: true };
}
```

**Key Points — Server Actions Types**

- Serializable returns only.
- Align server validations with client hints but never trust the client.

---

## 25.7 Third-party Library Types

### @types Packages

**Beginner Level:** Install `@types/node` for `process`, `Buffer`, etc.

**Intermediate Level:** Match `@types/*` major versions to the runtime library version.

**Expert Level:** Prefer packages shipping `types` to skip DefinitelyTyped duplication.

**Key Points — @types**

- Mismatched versions cause impossible typings.
- Use `pnpm overrides` carefully to dedupe conflicting types.

---

### Module Augmentation

**Beginner Level:** Extend `next-auth` session objects with `role` and `tenantId` for multi-tenant SaaS.

**Intermediate Level:** Keep augmentation files imported once in `types/global.d.ts`.

**Expert Level:** Avoid augmenting internal Next modules unless documented—prefer wrapping with your own typed helpers.

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; role: "admin" | "member" };
  }
}
```

**Key Points — Module Augmentation**

- Single source of truth for extended fields.
- Restart TS server after edits if the IDE looks stale.

---

### Type Declarations

**Beginner Level:** `global.d.ts` augments `Window` for ad network globals on marketing pages.

**Intermediate Level:** Ambient `declare module "*.svg"` for SVGR imports.

**Expert Level:** Publish shared `.d.ts` with your internal UI package for consumers.

```typescript
export {};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
```

**Key Points — Type Declarations**

- Prefer explicit modules over large global namespaces.
- Document third-party script contracts for security reviews.

---

## 25.8 TypeScript Best Practices

### Strict Mode

**Beginner Level:** `strict: true` is the default in modern templates—keep it on.

**Intermediate Level:** Enable `noImplicitReturns` and `noFallthroughCasesInSwitch` via `tsconfig` extras.

**Expert Level:** `noUncheckedIndexedAccess` for safer record lookups in billing dashboards.

**Key Points — Strict Mode**

- Short-term friction saves production outages.
- Gradually tighten legacy repos with tracked TODOs.

---

### Type Inference

**Beginner Level:** Let TypeScript infer local variables inside a function.

**Intermediate Level:** Annotate exported function signatures explicitly for public packages.

**Expert Level:** Use `satisfies` to keep literal unions while checking structure (`as const satisfies`).

```typescript
const api = {
  v1: { baseUrl: "https://api.example.com/v1" },
  v2: { baseUrl: "https://api.example.com/v2" },
} as const satisfies Record<string, { baseUrl: `https://${string}` }>;

export type ApiVersion = keyof typeof api;
```

**Key Points — Type Inference**

- Exported surface explicit; internals inferred.
- `as const` preserves literal types for routes and tokens.

---

### Generic Components

**Beginner Level:** Build a typed `Select<T>` for choosing product variants in e-commerce.

**Intermediate Level:** Constrain `T extends { id: string }` for stable React keys.

**Expert Level:** Combine `forwardRef` generics with `ComponentPropsWithoutRef` for design systems.

```tsx
type Column<T> = { key: keyof T & string; header: string };

type DataGridProps<T extends Record<string, unknown>> = {
  rows: T[];
  columns: Column<T>[];
};

export function DataGrid<T extends Record<string, unknown>>({ rows, columns }: DataGridProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={"id" in row && typeof row.id === "string" ? row.id : idx}>
            {columns.map((col) => (
              <td key={col.key}>{String(row[col.key])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Key Points — Generic Components**

- Keep generics readable—extract helper types.
- Test instantiation with multiple row shapes.

---

### Avoiding any

**Beginner Level:** Replace `any` with `unknown` and narrow.

**Intermediate Level:** Wrap untyped libraries in small typed facades.

**Expert Level:** Enforce `@typescript-eslint/no-explicit-any` in CI for new code.

```typescript
function parseJson(input: string): unknown {
  return JSON.parse(input);
}
```

**Key Points — Avoiding any**

- `any` turns off safety—reserve for incremental migrations with tickets.
- Prefer `unknown` + Zod for JSON.

---

### Type Guards

**Beginner Level:** `typeof value === "string"` narrows primitives.

**Intermediate Level:** Discriminated unions model API success/failure elegantly.

**Expert Level:** `asserts` functions enforce invariants after parsing webhook payloads.

```typescript
export type CheckoutEvent =
  | { type: "order.paid"; orderId: string; amountCents: number }
  | { type: "order.refunded"; orderId: string };

export function isPaidEvent(e: CheckoutEvent): e is Extract<CheckoutEvent, { type: "order.paid" }> {
  return e.type === "order.paid";
}
```

**Key Points — Type Guards**

- Centralize guards to avoid duplicated logic.
- Unit test edge cases (`null`, unexpected strings).

---

### Utility Types

**Beginner Level:** `Pick`, `Omit`, `Partial`, and `Record` speed up DTO typing.

**Intermediate Level:** `NonNullable<T>` cleans optional database joins.

**Expert Level:** `Parameters<typeof fn>` keeps wrappers aligned with original functions.

```typescript
type UserRecord = { id: string; email: string; passwordHash: string; mfaSecret: string };

export type PublicProfile = Omit<UserRecord, "passwordHash" | "mfaSecret">;

export function toPublicProfile(user: UserRecord): PublicProfile {
  const { passwordHash, mfaSecret, ...rest } = user;
  return rest;
}
```

**Key Points — Utility Types**

- Compose utilities instead of duplicating object shapes.
- Watch distributed conditional types when applying `Omit` to unions.

---

## Real-world Recipes (Typed)

### E-commerce: Cart API DTO

```typescript
import { z } from "zod";

export const CartLineSchema = z.object({
  sku: z.string(),
  qty: z.number().int().positive(),
});

export type CartLine = z.infer<typeof CartLineSchema>;

export const CartSchema = z.object({
  currency: z.enum(["USD", "EUR"]),
  lines: z.array(CartLineSchema).nonempty(),
});

export type Cart = z.infer<typeof CartSchema>;
```

### SaaS: Tenant-scoped Session Type

```typescript
export type TenantId = string & { __brand: "TenantId" };

export type Session = {
  userId: string;
  tenantId: TenantId;
  role: "owner" | "admin" | "member";
};
```

### Social Feed: Pagination Params

```typescript
import { z } from "zod";

export const FeedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type FeedQuery = z.infer<typeof FeedQuerySchema>;
```

### Blog: MDX Frontmatter

```typescript
import { z } from "zod";

export const FrontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()).default([]),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
```

### Dashboard: Chart Props

```tsx
type Series = { label: string; values: number[] };

export type RevenueChartProps = {
  series: Series[];
  currency: "USD" | "GBP";
};

export function RevenueChart(props: RevenueChartProps) {
  return <div data-testid="revenue-chart">{props.series.length} series</div>;
}
```

---

## Key Points (Chapter Summary)

- Strict `tsconfig` + CI `tsc` keep Next.js projects maintainable as teams grow.
- App Router typing centers on `params`, `searchParams`, `Metadata`, and route handlers; Pages Router still uses `NextPage` and data fetching contexts.
- Validate all external data (`fetch`, forms, webhooks) with schemas—never rely on `as` alone.
- Server Actions should return serializable unions for predictable UI states.
- Middleware and edge code need runtime-aware typings; not every Node type is available.
- Generics and utility types model reusable UI without copy-paste DTOs.
- Third-party typings via `@types` or augmentation require version alignment.

---

## Best Practices

1. **Parse params and searchParams** with Zod (or similar) at route boundaries.
2. **Share schemas** between handlers and clients when possible for single-source contracts.
3. **Avoid `any`**; use `unknown` + narrowing or Zod.
4. **Document exported types** for shared packages and design systems.
5. **Use `satisfies`** for configuration objects needing literal preservation.
6. **Keep server-only modules** out of client import graphs—lint rules help.
7. **Enable `.next/types`** and adopt generated route types when available.
8. **Use discriminated unions** for API results instead of boolean flags + optional fields.
9. **Run ESLint TypeScript rules** alongside `tsc` for async safety.
10. **Version-lock** `@types/react` and `react` together on upgrades.

---

## Common Mistakes to Avoid

1. **Casting JSON** from third-party APIs without validation.
2. **Returning functions or class instances** from `getStaticProps`/`getServerSideProps`.
3. **Importing server secrets** into Client Components accidentally via shared modules.
4. **Ignoring `string[]` possibility** in `searchParams`.
5. **Disabling `strict`** to silence errors temporarily without tickets.
6. **Overly generic components** that become impossible to read or instantiate.
7. **Duplicated DTO types** drifting between client and server.
8. **Augmenting modules** in multiple conflicting ways across packages.
9. **Using `NextApiRequest.query` as trusted numbers** without coercion.
10. **Skipping `tsc` in CI** because “build passed in dev mode once.”

---
