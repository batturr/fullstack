# 200 Next.js 15 Real-Time Assignments — With Answers

> Stack: **Next.js 15**, **App Router**, **React Server Components**, **Server Actions**, **Turbopack**, **Partial Prerendering**, streaming, parallel & intercepting routes.

---

## BEGINNER LEVEL (Assignments 1–70)

### Project Setup (1–6)

**Assignment 1:** Scaffold a new Next.js 15 project with TypeScript using `create-next-app` and the App Router.

```bash
npx create-next-app@latest my-app \
  --typescript --eslint --tailwind --app --src-dir \
  --import-alias "@/*" --turbopack

cd my-app && npm run dev
```


---

**Assignment 2:** Explain and document the default App Router folder structure (`app/`, `public/`, config files) after creation.

```tsx
/**
 * Next.js 15 App Router layout:
 * app/ — routes, layouts, route handlers (route.ts)
 * public/ — static files
 * middleware.ts — Edge middleware
 * next.config.ts — config
 */
```


---

**Assignment 3:** Create a minimal `app/page.tsx` and `app/layout.tsx` that render a site title and children.

```tsx
// app/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "My Site" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
// app/page.tsx
export default function Page() {
  return <main><h1>Welcome</h1></main>;
}
```


---

**Assignment 4:** Configure `npm` scripts for development (`next dev` with Turbopack), production build, and production start.

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  }
}
```


---

**Assignment 5:** Enable strict TypeScript settings in `tsconfig.json` suitable for a Next.js 15 app.

```json
{ "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true } }
```


---

**Assignment 6:** Load and use environment variables in both server and client contexts (`NEXT_PUBLIC_` vs server-only).

```ts
// .env.local — API_SECRET=...  NEXT_PUBLIC_APP_NAME=Acme
// Server Components: process.env.API_SECRET
// Client: only process.env.NEXT_PUBLIC_* inlined at build
```


---

### Routing (7–20)

**Assignment 7:** Add a static route `app/about/page.tsx` linked from the home page.

```tsx
// app/about/page.tsx
import Link from "next/link";
export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <Link href="/">Home</Link>
    </main>
  );
}
```


---

**Assignment 8:** Create a nested route `app/dashboard/page.tsx` with its own content.

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}
```


---

**Assignment 9:** Implement a dynamic segment `app/posts/[slug]/page.tsx` that displays the slug.

```tsx
// app/posts/[slug]/page.tsx
type P = { params: Promise<{ slug: string }> };
export default async function PostPage({ params }: P) {
  const { slug } = await params;
  return <article><h1>{slug}</h1></article>;
}
```


---

**Assignment 10:** Add a catch-all route `app/docs/[...slug]/page.tsx` that joins slug segments.

```tsx
// app/docs/[...slug]/page.tsx
type P = { params: Promise<{ slug: string[] }> };
export default async function DocsPage({ params }: P) {
  const { slug } = await params;
  return <pre>{slug.join("/")}</pre>;
}
```


---

**Assignment 11:** Add an optional catch-all `app/optional/[[...slug]]/page.tsx` that works with or without segments.

```tsx
// app/optional/[[...slug]]/page.tsx
type P = { params: Promise<{ slug?: string[] }> };
export default async function Page({ params }: P) {
  const { slug } = await params;
  return <p>{(slug ?? []).join(", ") || "(none)"}</p>;
}
```


---

**Assignment 12:** Use route groups: `app/(marketing)/page.tsx` and `app/(app)/dashboard/page.tsx` without affecting the URL.

```tsx
// app/(marketing)/page.tsx → URL /
// app/(app)/dashboard/page.tsx → URL /dashboard
// Parentheses omit segment from URL.
```


---

**Assignment 13:** Add `app/loading.tsx` for a route segment to show a loading UI.

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return <p>Loading…</p>;
}
```


---

**Assignment 14:** Add `app/error.tsx` as a segment error boundary with reset behavior.

```tsx
"use client";
// app/segment/error.tsx
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>{error.message}</p>
      <button type="button" onClick={() => reset()}>Retry</button>
    </div>
  );
}
```


---

**Assignment 15:** Add `app/not-found.tsx` and trigger `notFound()` from a dynamic page when data is missing.

```tsx
import { notFound } from "next/navigation";
// app/not-found.tsx — global 404 UI
export default function NotFound() { return <h1>404</h1>; }
// page: if (!item) notFound();
```


---

**Assignment 16:** Use the `<Link>` component for client-side navigation between routes.

```tsx
import Link from "next/link";
export default function Nav() {
  return <Link href="/dashboard">Dashboard</Link>;
}
```


---

**Assignment 17:** In a Client Component, use `useRouter()` from `next/navigation` for programmatic navigation.

```tsx
"use client";
import { useRouter } from "next/navigation";
export function Go() {
  const r = useRouter();
  return <button type="button" onClick={() => r.push("/dash")}>Go</button>;
}
```


---

**Assignment 18:** Use `usePathname()` to highlight the active nav item.

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Nav() {
  const p = usePathname();
  return <Link href="/about" aria-current={p === "/about" ? "page" : undefined}>About</Link>;
}
```


---

**Assignment 19:** Read and display query parameters with `useSearchParams()` in a Client Component.

```tsx
"use client";
import { useSearchParams } from "next/navigation";
export function Q() {
  const sp = useSearchParams();
  return <span>{sp.get("q")}</span>;
}
```


---

**Assignment 20:** Combine dynamic params and search params on one page (server or client).

```tsx
type P = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function Page({ params, searchParams }: P) {
  const { id } = await params;
  const sp = await searchParams;
  const sort = typeof sp.sort === "string" ? sp.sort : "new";
  return <p>{id} — {sort}</p>;
}
```


---

### Layouts & Templates (21–28)

**Assignment 21:** Define the root `app/layout.tsx` with `<html>`, `<body>`, and `{children}`.

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```


---

**Assignment 22:** Add a nested layout `app/dashboard/layout.tsx` wrapping dashboard routes.

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <section><aside>Nav</aside>{children}</section>;
}
```


---

**Assignment 23:** Compare `layout.tsx` vs `template.tsx` by implementing both and observing remount behavior.

```tsx
// layout.tsx — state persists across navigations within segment
// template.tsx — remounts on navigation (animations, keyed resets)
```


---

**Assignment 24:** Share UI state across a layout using a Client Component provider pattern.

```tsx
"use client";
import { createContext, useContext, useState } from "react";
const Ctx = createContext<{ n: number } | null>(null);
export function useN() {
  const v = useContext(Ctx);
  if (!v) throw new Error("provider");
  return v;
}
export function Prov({ children }: { children: React.ReactNode }) {
  const [n, setN] = useState(0);
  return <Ctx.Provider value={{ n }}>{children}</Ctx.Provider>;
}
// Wrap in root layout (import Prov)
```


---

**Assignment 25:** Export a static `metadata` object from a page for title and description.

```tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Hi", description: "Desc" };
```


---

**Assignment 26:** Implement `generateMetadata` for a dynamic route using fetched data.

```tsx
import type { Metadata } from "next";
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}
export default async function Page({ params }: P) {
  return <p>{(await params).slug}</p>;
}
```


---

**Assignment 27:** Add `app/favicon.ico` and `app/opengraph-image.tsx` (or static OG image) conventions.

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export default function Og() {
  return new ImageResponse(<div style={{ fontSize: 64 }}>OG</div>, size);
}
// app/favicon.ico — static file
```


---

**Assignment 28:** Use `robots` and `alternates.canonical` in metadata for a marketing page.

```tsx
import type { Metadata } from "next";
export const metadata: Metadata = {
  robots: { index: true, follow: true },
  alternates: { canonical: "https://example.com/p" },
};
```


---

### Server Components (29–38)

**Assignment 29:** Confirm default Server Component behavior: fetch data in a page without `"use client"`.

```tsx
export default async function Page() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const data = await res.json();
  return <p>{data.title}</p>;
}
```


---

**Assignment 30:** Add `"use client"` to a leaf component that uses `useState`.

```tsx
"use client";
import { useState } from "react";
export function C() {
  const [x, setX] = useState(0);
  return <button type="button" onClick={() => setX((n) => n + 1)}>{x}</button>;
}
```


---

**Assignment 31:** List criteria for choosing Server vs Client Components in an App Router app.

```tsx
/** Server: data, secrets, SEO, large static UI.
 *  Client: state, effects, DOM APIs, events.
 */
```


---

**Assignment 32:** Fetch JSON in a Server Component with `fetch` and render the result.

```tsx
export default async function Page() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  return <pre>{JSON.stringify(await res.json())}</pre>;
}
```


---

**Assignment 33:** Make a page component `async` and await data directly.

```tsx
export default async function Page() {
  const msg = await Promise.resolve("async RSC");
  return <p>{msg}</p>;
}
```


---

**Assignment 34:** Pass serializable props from a Server Component to a Client Component.

```tsx
// Server passes JSON-serializable props to client child
import { C } from "./c";
export default function Page() {
  return <C initial={1} />;
}
```


---

**Assignment 35:** Import a Client Component inside a Server Component and compose them.

```tsx
import { Btn } from "./btn"; // client leaf
export default function Page() {
  return <main><Btn /></main>;
}
```


---

**Assignment 36:** Avoid passing functions or non-serializable props from server to client.

```tsx
// Do not pass functions/classes from Server → Client.
// Use Server Actions or define handlers inside Client components.
```


---

**Assignment 37:** Split a feature into small Client boundaries while keeping the shell as Server Components.

```tsx
// Keep page.server.tsx mostly server; small interactive islands client-only.
```


---

**Assignment 38:** Render a list on the server and delegate item interactions to a Client child.

```tsx
// Server list + Client item actions
import { Like } from "./like";
export function List({ ids }: { ids: string[] }) {
  return (
    <ul>
      {ids.map((id) => (
        <li key={id}>
          {id} <Like id={id} />
        </li>
      ))}
    </ul>
  );
}
```


---

### Styling (39–46)

**Assignment 39:** Style a component with CSS Modules (`*.module.css`).

```tsx
import styles from "./m.module.css";
export function Box() {
  return <div className={styles.box}>x</div>;
}
```


---

**Assignment 40:** Import global styles in `app/layout.tsx`.

```tsx
import "./globals.css";
// in app/layout.tsx
```


---

**Assignment 41:** Integrate Tailwind CSS with Next.js 15 and use utility classes on a page.

```tsx
export default function Page() {
  return <p className="text-xl font-bold text-blue-600">Tailwind</p>;
}
```


---

**Assignment 42:** Use `next/font` (e.g. Geist or Inter) with `variable` and apply to `body`.

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```


---

**Assignment 43:** Apply conditional class names based on props (with `clsx` or template literals).

```tsx
export function Pill({ on }: { on?: boolean }) {
  return <span className={on ? "bg-black text-white" : "bg-zinc-200"}>tag</span>;
}
```


---

**Assignment 44:** Explain trade-offs of runtime CSS-in-JS libraries with Server Components.

```tsx
/** Runtime CSS-in-JS often requires client components; prefer CSS Modules/Tailwind for RSC. */
```


---

**Assignment 45:** Scope styles to a route segment using colocated CSS Module files.

```tsx
// Colocate segment.module.css next to page.tsx in same folder.
```


---

**Assignment 46:** Build a responsive navigation bar with mobile and desktop layouts.

```tsx
export function Nav() {
  return (
    <header className="flex justify-between px-4 md:px-8">
      <span>Logo</span>
      <nav className="hidden md:flex gap-4">Links</nav>
    </header>
  );
}
```


---

### Images & Assets (47–54)

**Assignment 47:** Render a local image with `next/image` using a static import.

```tsx
import Image from "next/image";
import pic from "./p.jpg";
export default function Page() {
  return <Image src={pic} alt="x" />;
}
```


---

**Assignment 48:** Configure `width`, `height`, and `sizes` for a responsive hero image.

```tsx
import Image from "next/image";
import pic from "./p.jpg";
export default function Page() {
  return <Image src={pic} alt="x" sizes="(max-width:768px) 100vw, 800px" className="w-full h-auto" />;
}
```


---

**Assignment 49:** Use `placeholder="blur"` with a static import `blurDataURL`.

```tsx
import Image from "next/image";
import pic from "./p.jpg";
const blur =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
export default function Page() {
  return <Image src={pic} alt="x" placeholder="blur" blurDataURL={blur} />;
}
```


---

**Assignment 50:** Allow a remote image host in `next.config.ts` `images.remotePatterns` and render it.

```ts
// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }] },
};
export default nextConfig;
// <Image src="https://images.unsplash.com/..." width={800} height={600} alt="x" />
```


---

**Assignment 51:** Mark above-the-fold images with `priority`.

```tsx
import Image from "next/image";
import p from "./p.jpg";
export default function Page() {
  return <Image src={p} alt="x" priority />;
}
```


---

**Assignment 52:** Use the `fill` prop with a sized parent container for a card image.

```tsx
import Image from "next/image";
export function Card() {
  return (
    <div className="relative h-48 w-full">
      <Image src="/x.jpg" alt="x" fill className="object-cover" sizes="33vw" />
    </div>
  );
}
```


---

**Assignment 53:** Serve a PDF from `public/` via a plain URL.

```tsx
export default function Page() {
  return <a href="/file.pdf">PDF</a>; // public/file.pdf
}
```


---

**Assignment 54:** Reference fonts and icons from `public/` vs bundled assets.

```tsx
/** public/* → absolute URL; imported assets are hashed in /_next/static */
```


---

### Basic Data Fetching (55–64)

**Assignment 55:** Fetch in a Server Component with default caching behavior.

```tsx
export default async function Page() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  return <pre>{await res.text()}</pre>;
}
```


---

**Assignment 56:** Use `cache: 'force-cache'` explicitly on a `fetch` call.

```tsx
// app/page.tsx — force-cache (explicit default for GET in RSC in many cases)
export default async function Page() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    cache: "force-cache",
  });
  const data = await res.json();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```


---

**Assignment 57:** Use `cache: 'no-store'` for always-fresh data.

```tsx
// app/page.tsx — always hit origin (dynamic data / user-specific)
export default async function Page() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    cache: "no-store",
  });
  const data = await res.json();
  return <p>{data.title}</p>;
}
```


---

**Assignment 58:** Use `next: { revalidate: 60 }` for time-based revalidation.

```tsx
// app/page.tsx — ISR-style: revalidate at most every 60s
export default async function Page() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  return <p>{data.title}</p>;
}
```


---

**Assignment 59:** Wrap a slow server fetch in `<Suspense>` with a fallback.

```tsx
import { Suspense } from "react";
async function Slow() {
  await new Promise((r) => setTimeout(r, 500));
  return <p>Ready</p>;
}
export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Slow />
    </Suspense>
  );
}
```


---

**Assignment 60:** Handle fetch errors in a Server Component and surface a friendly UI.

```tsx
export default async function Page() {
  try {
    const res = await fetch("https://invalid.invalid", { cache: "no-store" });
    if (!res.ok) throw new Error("bad");
    return <p>ok</p>;
  } catch {
    return <p>Failed to load.</p>;
  }
}
```


---

**Assignment 61:** Fetch two resources in parallel with `Promise.all` in a Server Component.

```tsx
export default async function Page() {
  const [a, b] = await Promise.all([
    fetch("https://jsonplaceholder.typicode.com/todos/1").then((r) => r.json()),
    fetch("https://jsonplaceholder.typicode.com/todos/2").then((r) => r.json()),
  ]);
  return <ul><li>{a.title}</li><li>{b.title}</li></ul>;
}
```


---

**Assignment 62:** Demonstrate sequential dependent fetches (waterfall) and explain impact.

```tsx
export default async function Page() {
  const u = await fetch("https://jsonplaceholder.typicode.com/users/1").then((r) => r.json());
  const posts = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${u.id}`).then((r) => r.json());
  return <p>{posts.length}</p>;
}
```


---

**Assignment 63:** Use `generateStaticParams` to prebuild dynamic routes at build time.

```tsx
export async function generateStaticParams() {
  return [{ slug: "a" }, { slug: "b" }];
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <p>{(await params).slug}</p>;
}
```


---

**Assignment 64:** Combine static generation hints with `dynamicParams` behavior on dynamic routes.

```tsx
export const dynamicParams = true;
export async function generateStaticParams() {
  return [{ id: "1" }];
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <p>{(await params).id}</p>;
}
```


---

### Basic API (65–70)

**Assignment 65:** Create `app/api/health/route.ts` with a `GET` handler returning JSON.

```tsx
// app/api/health/route.ts
import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json({ ok: true });
}
```


---

**Assignment 66:** Implement `POST` in `app/api/echo/route.ts` reading JSON body.

```tsx
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ echo: body });
}
```


---

**Assignment 67:** Set `Response` headers and status codes explicitly in a route handler.

```tsx
import { NextResponse } from "next/server";
export function GET() {
  return new NextResponse("hi", { status: 200, headers: { "x-v": "1" } });
}
```


---

**Assignment 68:** Add `app/api/items/[id]/route.ts` with `GET` returning the id.

```tsx
import { NextResponse } from "next/server";
type C = { params: Promise<{ id: string }> };
export async function GET(_req: Request, ctx: C) {
  return NextResponse.json({ id: (await ctx.params).id });
}
```


---

**Assignment 69:** Return `NextResponse.json` with different HTTP verbs in one file.

```tsx
import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ m: "GET" }); }
export function POST() { return NextResponse.json({ m: "POST" }, { status: 201 }); }
```


---

**Assignment 70:** Validate `Content-Type` and return `400` for invalid API requests.

```tsx
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "json only" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
```


---

---

## INTERMEDIATE LEVEL (Assignments 71–140)

### Server Actions (71–84)

**Assignment 71:** Declare a Server Action with `"use server"` in a dedicated file.

```tsx
// app/actions.ts
"use server";
export async function save(fd: FormData) {
  const title = String(fd.get("title") ?? "");
  return { title };
}
```


---

**Assignment 72:** Wire an HTML `<form action={serverAction}>` without client JavaScript.

```tsx
import { save } from "./actions";
export default function Page() {
  return (
    <form action={save}>
      <input name="title" />
      <button type="submit">Save</button>
    </form>
  );
}
```


---

**Assignment 73:** Use `useActionState` to show validation messages from a Server Action.

```tsx
"use client";
import { useActionState } from "react";
import { login } from "./actions";
export function F() {
  const [st, act] = useActionState(login, { err: "" });
  return (
    <form action={act}>
      <input name="email" />
      <p>{st.err}</p>
      <button type="submit">Go</button>
    </form>
  );
}
// actions: "use server"; export async function login(_:any, fd: FormData){...}
```


---

**Assignment 74:** Use `useFormStatus` for pending state on a submit button.

```tsx
"use client";
import { useFormStatus } from "react-dom";
function Sub() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "…" : "Save"}</button>;
}
export function Form({ a }: { a: (fd: FormData) => void }) {
  return (
    <form action={a}>
      <input name="x" />
      <Sub />
    </form>
  );
}
```


---

**Assignment 75:** Validate form data with Zod inside a Server Action.

```tsx
"use server";
import { z } from "zod";
const S = z.object({ title: z.string().min(1) });
export async function save(fd: FormData) {
  const p = S.safeParse({ title: fd.get("title") });
  if (!p.success) return { err: p.error.flatten() };
  return { ok: true };
}
```


---

**Assignment 76:** Call `revalidatePath('/')` after a mutation.

```tsx
"use server";
import { revalidatePath } from "next/cache";
export async function refresh() {
  revalidatePath("/");
}
```


---

**Assignment 77:** Tag fetches with `next: { tags: ['posts'] }` and call `revalidateTag('posts')`.

```tsx
"use server";
import { revalidateTag } from "next/cache";
export async function bust() {
  revalidateTag("posts");
}
// fetch(url, { next: { tags: ["posts"] } })
```


---

**Assignment 78:** Implement optimistic UI with `useOptimistic` around a Server Action.

```tsx
"use client";
import { useOptimistic, useTransition } from "react";
import { add } from "./actions";
export function L({ items }: { items: string[] }) {
  const [, start] = useTransition();
  const [opt, setOpt] = useOptimistic(items, (s, x: string) => [...s, x]);
  return (
    <form
      action={async (fd) => {
        const t = String(fd.get("t"));
        start(async () => {
          setOpt(t);
          await add(t);
        });
      }}
    >
      <ul>{opt.map((x) => <li key={x}>{x}</li>)}</ul>
      <input name="t" />
      <button type="submit">Add</button>
    </form>
  );
}
```


---

**Assignment 79:** Ensure forms work without JS (progressive enhancement) and enhance with client feedback.

```tsx
// Native <form action={serverAction}> works without JS; layer client UX on top.
```


---

**Assignment 80:** Return structured errors from a Server Action and display them in the UI.

```tsx
"use server";
export type St = { err?: string };
export async function go(_: St, fd: FormData): Promise<St> {
  if (!String(fd.get("x"))) return { err: "required" };
  return {};
}
```


---

**Assignment 81:** Redirect after success using `redirect()` from `next/navigation` in a Server Action.

```tsx
"use server";
import { redirect } from "next/navigation";
export async function signIn(fd: FormData) {
  if (String(fd.get("p")) === "ok") redirect("/dashboard");
}
```


---

**Assignment 82:** Upload a file with `<input type="file">` and process `FormData` in a Server Action.

```tsx
"use server";
export async function up(fd: FormData) {
  const f = fd.get("file");
  if (!(f instanceof File)) return { err: "file" };
  return { bytes: (await f.arrayBuffer()).byteLength };
}
```


---

**Assignment 83:** Invoke a Server Action from a Client Component via `action` prop or `startTransition`.

```tsx
"use client";
import { doThing } from "./actions";
export function B() {
  return <button type="button" onClick={() => doThing()}>Run</button>;
}
// "use server"; export async function doThing() { ... }
```


---

**Assignment 84:** Pass a bound Server Action as a prop to a Client Component child.

```tsx
// Pass server action as prop: <Client action={serverFn} /> — serverFn is serializable reference.
```


---

### Advanced Routing (85–96)

**Assignment 85:** Create parallel routes with `@analytics` and `@team` slots and a matching layout.

```tsx
// app/dashboard/@analytics/page.tsx + @team/page.tsx
// app/dashboard/layout.tsx receives { children, analytics, team } parallel slots.
```


---

**Assignment 86:** Add `default.tsx` for a parallel route slot.

```tsx
// app/slot/@analytics/default.tsx → export default function Default(){return null;}
```


---

**Assignment 87:** Implement a modal using an intercepting route `(.)photo/[id]` plus parallel route.

```tsx
// app/@modal/(.)photo/[id]/page.tsx intercepts soft nav; app/photo/[id]/page.tsx full page.
```


---

**Assignment 88:** Use intercept patterns `(..)(..)` / `(...)` where appropriate for nested structures.

```tsx
/** (.) same segment; (..) one up; (...) app root — intercept relative to route groups */
```


---

**Assignment 89:** Conditionally render slot content based on route segments.

```tsx
// Render parallel slot children conditionally based on segment or searchParams in layout.
```


---

**Assignment 90:** Use route groups to separate marketing vs app layouts sharing one `app` tree.

```tsx
// (marketing)/layout vs (app)/layout — different chrome, shared root layout.
```


---

**Assignment 91:** Use a private folder `_components` for non-routable colocated files.

```tsx
// app/_components/Button.tsx — not routable (private folder convention).
```


---

**Assignment 92:** Add `middleware.ts` that runs on matched paths.

```tsx
// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  return NextResponse.next();
}
export const config = { matcher: ["/app/:path*"] };
```


---

**Assignment 93:** Redirect unauthenticated users to `/login` from middleware.

```tsx
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  if (!req.cookies.get("session")) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
```


---

**Assignment 94:** Rewrite incoming paths to internal routes with `NextResponse.rewrite`.

```tsx
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/old")) {
    const u = req.nextUrl.clone();
    u.pathname = u.pathname.replace(/^\/old/, "/new");
    return NextResponse.rewrite(u);
  }
  return NextResponse.next();
}
```


---

**Assignment 95:** Attach auth session check in middleware and pass headers forward.

```tsx
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  const h = new Headers(req.headers);
  h.set("x-url", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: h } });
}
```


---

**Assignment 96:** Exclude static assets and `_next` from middleware via `matcher` config.

```tsx
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```


---

### Caching & Revalidation (97–106)

**Assignment 97:** Explain the Data Cache vs Full Route Cache at a high level in comments.

```tsx
/** Data Cache: fetch memo + persistence rules. Full Route Cache: static RSC HTML/payload. */
```


---

**Assignment 98:** Demonstrate Router Cache behavior when navigating between shared layouts.

```tsx
/** Router Cache: soft-nav RSC reuse; refresh via revalidatePath/Tag or router.refresh */
```


---

**Assignment 99:** Show request memoization by calling the same `fetch` URL twice in one request.

```tsx
import { cache } from "react";
const get = cache(async (u: string) => (await fetch(u)).json());
export default async function Page() {
  const a = await get("https://jsonplaceholder.typicode.com/todos/1");
  const b = await get("https://jsonplaceholder.typicode.com/todos/1");
  return <pre>{JSON.stringify({ a, b })}</pre>;
}
```


---

**Assignment 100:** Use `fetch` cache tags and `revalidateTag` together end-to-end.

```tsx
fetch("https://api.example/posts", { next: { tags: ["posts"] } });
// revalidateTag("posts") on mutation
```


---

**Assignment 101:** Trigger on-demand revalidation from a route handler using `revalidatePath`.

```tsx
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
export async function POST() {
  revalidatePath("/blog");
  return NextResponse.json({ ok: true });
}
```


---

**Assignment 102:** Use `unstable_cache` to wrap an expensive async function with tags.

```tsx
import { unstable_cache } from "next/cache";
const stats = unstable_cache(async () => ({ n: 1 }), ["stats"], { tags: ["stats"], revalidate: 60 });
export default async function Page() {
  return <pre>{JSON.stringify(await stats())}</pre>;
}
```


---

**Assignment 103:** Use React `cache()` to dedupe database or ORM calls in Server Components.

```tsx
import { cache } from "react";
export const user = cache(async (id: string) => ({ id }));
export default async function Page() {
  await user("1");
  await user("1"); // deduped same tick
  return <p>ok</p>;
}
```


---

**Assignment 104:** Implement ISR-style listing: time revalidate + on-demand tag revalidation.

```tsx
// ISR-style: fetch(..., { next: { revalidate: 300, tags: ["list"] } }) + revalidateTag on write.
```


---

**Assignment 105:** Force dynamic rendering with `export const dynamic = 'force-dynamic'`.

```tsx
export const dynamic = "force-dynamic";
export default function Page() {
  return <p>{Date.now()}</p>;
}
```


---

**Assignment 106:** Compare `force-static` vs default static behavior for a specific route.

```tsx
export const dynamic = "force-static";
export default function Page() {
  return <p>static</p>;
}
```


---

### Authentication (107–114)

**Assignment 107:** Implement middleware that checks a session cookie and protects `/dashboard/*`.

```tsx
// middleware.ts protect /dashboard/*
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  if (!req.cookies.get("session")) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*"] };
```


---

**Assignment 108:** Store session in an HTTP-only cookie set from a Server Action or route handler.

```tsx
"use server";
import { cookies } from "next/headers";
export async function setSession() {
  (await cookies()).set("session", "token", { httpOnly: true, sameSite: "lax", path: "/" });
}
```


---

**Assignment 109:** Build a protected layout that redirects unauthenticated users.

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function L({ children }: { children: React.ReactNode }) {
  if (!(await cookies()).get("session")) redirect("/login");
  return <>{children}</>;
}
```


---

**Assignment 110:** Implement login and logout Server Actions clearing/setting cookies.

```tsx
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function in_() {
  (await cookies()).set("session", "ok", { httpOnly: true, path: "/" });
  redirect("/dashboard");
}
export async function out() {
  (await cookies()).delete("session");
  redirect("/");
}
```


---

**Assignment 111:** Add role-based access: admin-only segment under `app/admin`.

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function AdminL({ children }: { children: React.ReactNode }) {
  if ((await cookies()).get("role")?.value !== "admin") redirect("/");
  return <>{children}</>;
}
```


---

**Assignment 112:** Outline OAuth callback route handler pattern (e.g. exchange code for session).

```tsx
// app/api/oauth/callback/route.ts
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ err: "code" }, { status: 400 });
  return NextResponse.redirect(new URL("/app", req.url));
}
```


---

**Assignment 113:** Verify a JWT on the server in a route handler and return `401` when invalid.

```tsx
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
export async function GET(req: Request) {
  const t = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!t) return NextResponse.json({ err: "auth" }, { status: 401 });
  try {
    await jwtVerify(t, secret);
  } catch {
    return NextResponse.json({ err: "jwt" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
```


---

**Assignment 114:** Provide a thin client `AuthProvider` reading session from server props.

```tsx
// Server passes session snapshot to client provider initial state
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = { user: "ada" };
  return <body data-session={JSON.stringify(session)}>{children}</body>;
}
// Client AuthProvider reads data attribute or props from server parent.
```


---

### Database Integration (115–122)

**Assignment 115:** Add Prisma to the project and define a `User` model.

```tsx
// prisma/schema.prisma
// model User { id String @id @default(cuid()) email String @unique }
// npx prisma migrate dev
```


---

**Assignment 116:** Query Prisma in a Server Component and list users.

```tsx
// import { prisma } from "@/lib/db";
export default async function Page() {
  // const users = await prisma.user.findMany();
  return <ul>{/* users.map */}</ul>;
}
```


---

**Assignment 117:** Create a Server Action that inserts a row with Prisma.

```tsx
"use server";
// import { prisma } from "@/lib/db";
// export async function createUser(fd: FormData) { await prisma.user.create({ data: { email: ... } }); }
```


---

**Assignment 118:** Implement update and delete Server Actions with revalidation.

```tsx
"use server";
import { revalidatePath } from "next/cache";
// await prisma.user.update(...); await prisma.user.delete(...);
export async function del() {
  revalidatePath("/users");
}
```


---

**Assignment 119:** Paginate list results with `skip`/`take` from search params.

```tsx
type P = { searchParams: Promise<{ page?: string }> };
export default async function Page({ searchParams }: P) {
  const page = Number((await searchParams).page ?? "1");
  const take = 10;
  // prisma.model.findMany({ skip: (page-1)*take, take })
  return <p>page {page}</p>;
}
```


---

**Assignment 120:** Implement search/filter in a Server Component using URL query strings.

```tsx
type P = { searchParams: Promise<{ q?: string }> };
export default async function Page({ searchParams }: P) {
  const q = (await searchParams).q ?? "";
  // prisma.model.findMany({ where: { title: { contains: q } } })
  return <p>{q}</p>;
}
```


---

**Assignment 121:** Use a Prisma transaction for two related writes.

```tsx
// await prisma.$transaction([prisma.a.create(...), prisma.b.create(...)])
```


---

**Assignment 122:** Document connection pooling considerations for serverless deployments.

```tsx
/** Serverless: use pooled URL (Prisma Accelerate / PgBouncer); avoid N+1; reuse Prisma client singleton */
```


---

### API Routes Advanced (123–130)

**Assignment 123:** Chain custom logic before/after a handler in a route module (helper pattern).

```tsx
import { NextResponse } from "next/server";
function withLog(h: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    console.log(req.method, req.url);
    return h(req);
  };
}
export const GET = withLog(async () => NextResponse.json({ ok: true }));
```


---

**Assignment 124:** Stream text from a route handler using Web `ReadableStream`.

```tsx
import { NextResponse } from "next/server";
export async function GET() {
  const stream = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(new TextEncoder().encode("a"));
      ctrl.close();
    },
  });
  return new NextResponse(stream, { headers: { "content-type": "text/plain" } });
}
```


---

**Assignment 125:** Implement a minimal SSE endpoint with `text/event-stream`.

```tsx
export async function GET() {
  const enc = new TextEncoder();
  const s = new ReadableStream({
    start(c) {
      c.enqueue(enc.encode("data: hello\n\n"));
      c.close();
    },
  });
  return new Response(s, { headers: { "content-type": "text/event-stream", "cache-control": "no-store" } });
}
```


---

**Assignment 126:** Support multiple HTTP methods with shared validation in `[id]/route.ts`.

```tsx
import { NextResponse } from "next/server";
type C = { params: Promise<{ id: string }> };
export function GET(_req: Request, ctx: C) {
  return ctx.params.then(({ id }) => NextResponse.json({ id }));
}
export async function PATCH(req: Request, ctx: C) {
  const { id } = await ctx.params;
  const body = await req.json();
  return NextResponse.json({ id, body });
}
```


---

**Assignment 127:** Validate request bodies with Zod in POST/PATCH handlers.

```tsx
import { NextResponse } from "next/server";
import { z } from "zod";
const B = z.object({ title: z.string() });
export async function POST(req: Request) {
  const json = await req.json();
  const p = B.safeParse(json);
  if (!p.success) return NextResponse.json(p.error.flatten(), { status: 400 });
  return NextResponse.json({ ok: true });
}
```


---

**Assignment 128:** Add CORS headers for a public API route.

```tsx
import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json({ ok: true }, { headers: { "access-control-allow-origin": "*" } });
}
export function OPTIONS() {
  return new NextResponse(null, { headers: { "access-control-allow-methods": "GET,OPTIONS" } });
}
```


---

**Assignment 129:** Implement a simple in-memory rate limit pattern per IP.

```tsx
const hits = new Map<string, { n: number; t: number }>();
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const now = Date.now();
  const h = hits.get(ip) ?? { n: 0, t: now };
  if (now - h.t > 60_000) {
    h.n = 0;
    h.t = now;
  }
  h.n += 1;
  hits.set(ip, h);
  if (h.n > 100) return new Response("slow down", { status: 429 });
  return Response.json({ ok: true });
}
```


---

**Assignment 130:** Version an API under `app/api/v1/...` and keep v2 separate.

```tsx
// app/api/v1/items/route.ts vs app/api/v2/items/route.ts — version by path prefix.
```


---

### SEO & Metadata (131–140)

**Assignment 131:** Export static `metadata` on a landing page with title template in root layout.

```tsx
// app/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: { template: "%s | Acme", default: "Acme" } };
// page metadata merges
```


---

**Assignment 132:** Generate Open Graph images dynamically for blog posts.

```tsx
// app/blog/[slug]/opengraph-image.tsx — same pattern as root OG; use params for title.
```


---

**Assignment 133:** Add Twitter card metadata alongside Open Graph.

```tsx
import type { Metadata } from "next";
export const metadata: Metadata = {
  openGraph: { title: "Hi", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Hi", images: ["/og.png"] },
};
```


---

**Assignment 134:** Implement `app/sitemap.ts` returning `MetadataRoute.Sitemap`.

```tsx
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://example.com", lastModified: new Date() }];
}
```


---

**Assignment 135:** Implement `app/robots.ts` allowing/disallowing crawlers.

```tsx
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/private/" }, sitemap: "https://example.com/sitemap.xml" };
}
```


---

**Assignment 136:** Inject JSON-LD structured data for an article in a Server Component.

```tsx
export default function ArticleJsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```


---

**Assignment 137:** Set canonical URLs for duplicate content routes.

```tsx
import type { Metadata } from "next";
export const metadata: Metadata = { alternates: { canonical: "https://example.com/a" } };
```


---

**Assignment 138:** Use `generateStaticParams` to maximize statically generated SEO pages.

```tsx
export async function generateStaticParams() {
  return [{ slug: "a" }, { slug: "b" }];
}
```


---

**Assignment 139:** Provide `hreflang` alternates for a simple EN/ES marketing setup.

```tsx
import type { Metadata } from "next";
export const metadata: Metadata = {
  alternates: { languages: { en: "https://example.com/en", es: "https://example.com/es" } },
};
```


---

**Assignment 140:** Merge metadata from layout and page for a consistent SEO hierarchy.

```tsx
/** Child metadata overrides/extends parent; use title.template in root layout for consistency */
```


---

---

## ADVANCED LEVEL (Assignments 141–200)

### Streaming & Suspense (141–148)

**Assignment 141:** Stream UI with `<Suspense>` around async Server Component children.

```tsx
import { Suspense } from "react";
async function A() {
  await new Promise((r) => setTimeout(r, 300));
  return <p>A</p>;
}
export default function Page() {
  return (
    <Suspense fallback={<p>fa</p>}>
      <A />
    </Suspense>
  );
}
```


---

**Assignment 142:** Nest multiple Suspense boundaries for independent sections.

```tsx
import { Suspense } from "react";
async function X() { await new Promise((r) => setTimeout(r, 200)); return <aside>X</aside>; }
async function Y() { await new Promise((r) => setTimeout(r, 400)); return <section>Y</section>; }
export default function Page() {
  return (
    <>
      <Suspense fallback={<p>fx</p>}><X /></Suspense>
      <Suspense fallback={<p>fy</p>}><Y /></Suspense>
    </>
  );
}
```


---

**Assignment 143:** Rely on `loading.tsx` at multiple segment levels and describe the hierarchy.

```tsx
// loading.tsx at app/loading.tsx wraps segment; nested loading.tsx wraps deeper routes.
```


---

**Assignment 144:** Load two independent data regions in parallel inside one page.

```tsx
// Two Suspense siblings each wrap independent async RSC fetches (parallel).
```


---

**Assignment 145:** Demonstrate sequential streaming: outer shell first, inner deferred.

```tsx
// Outer shell static/streaming first; inner Suspense streams later (sequential perceived load).
```


---

**Assignment 146:** Build skeleton components matching final layout for key pages.

```tsx
export function Skeleton() {
  return <div className="animate-pulse h-4 w-2/3 rounded bg-zinc-200" />;
}
```


---

**Assignment 147:** Progressive loading: show partial content while secondary metrics load.

```tsx
// Show hero immediately; defer secondary metrics inside nested Suspense.
```


---

**Assignment 148:** Combine error boundaries (`error.tsx`) with Suspense around risky subtrees.

```tsx
// error.tsx handles errors in segment; wrap risky async in Suspense; errors bubble to nearest error boundary.
```


---

### Advanced Data Patterns (149–158)

**Assignment 149:** Refactor a waterfall into parallel fetches where dependencies allow.

```tsx
// Replace dependent waterfalls with Promise.all when queries are independent.
```


---

**Assignment 150:** Preload data from a layout for a child using shared `cache()` helpers.

```tsx
import { cache } from "react";
export const preload = cache(async (id: string) => {
  void fetch(`https://api/x/${id}`, { next: { tags: [`x-${id}`] } });
});
export default async function Layout({ children }: { children: React.ReactNode }) {
  preload("1");
  return <>{children}</>;
}
```


---

**Assignment 151:** Warm caches after deploy via a secure internal revalidation route.

```tsx
// POST /api/revalidate with secret header → revalidateTag("all") after deploy hook.
```


---

**Assignment 152:** Implement stale-while-revalidate UX: show cached data, refresh in background.

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export function SWRish({ initial }: { initial: string }) {
  const [x, setX] = useState(initial);
  const r = useRouter();
  useEffect(() => {
    const t = setInterval(() => r.refresh(), 30_000);
    return () => clearInterval(t);
  }, [r]);
  return <p>{x}</p>;
}
```


---

**Assignment 153:** Optimistic list updates with rollback on Server Action failure.

```tsx
// useOptimistic + rollback: on catch call router.refresh() or reset local state.
```


---

**Assignment 154:** Poll an API from a Client Component with `useEffect` + `router.refresh()`.

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function Poll() {
  const r = useRouter();
  useEffect(() => {
    const id = setInterval(() => r.refresh(), 5000);
    return () => clearInterval(id);
  }, [r]);
  return null;
}
```


---

**Assignment 155:** Integrate WebSocket messages into client state with Server Component initial payload.

```tsx
"use client";
import { useEffect, useState } from "react";
export function Live({ seed }: { seed: unknown }) {
  const [m, setM] = useState(seed);
  useEffect(() => {
    const ws = new WebSocket("wss://example.com");
    ws.onmessage = (e) => setM(JSON.parse(e.data));
    return () => ws.close();
  }, []);
  return <pre>{JSON.stringify(m)}</pre>;
}
```


---

**Assignment 156:** Push live updates using SSE from a route handler consumed on the client.

```tsx
"use client";
import { useEffect, useState } from "react";
export function Sse() {
  const [t, setT] = useState("");
  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (e) => setT(e.data);
    return () => es.close();
  }, []);
  return <p>{t}</p>;
}
```


---

**Assignment 157:** Infinite scroll: Client fetches next pages via route handler or Server Action.

```tsx
"use client";
import { useCallback, useState } from "react";
export function Infinite({ first }: { first: unknown[] }) {
  const [rows, setRows] = useState(first);
  const more = useCallback(async () => {
    const r = await fetch(`/api/list?cursor=${rows.length}`);
    const j = await r.json();
    setRows((x) => [...x, ...j.items]);
  }, [rows.length]);
  return (
    <>
      {rows.map((x, i) => (
        <div key={i}>{JSON.stringify(x)}</div>
      ))}
      <button type="button" onClick={more}>
        More
      </button>
    </>
  );
}
```


---

**Assignment 158:** Hybrid: Server Component for first page, client for subsequent pages.

```tsx
// First page from RSC; append pages via client fetching same route handler / action.
```


---

### Performance (159–168)

**Assignment 159:** Analyze bundles with `@next/bundle-analyzer` configuration.

```tsx
// npm i @next/bundle-analyzer
// const withBundleAnalyzer = require("@next/bundle-analyzer")({ enabled: process.env.ANALYZE === "true" });
// module.exports = withBundleAnalyzer(nextConfig);
```


---

**Assignment 160:** Lazy-load a heavy Client Component with `dynamic()` and `ssr: false` when appropriate.

```tsx
import dynamic from "next/dynamic";
const Admin = dynamic(() => import("./admin-panel"), { ssr: false, loading: () => <p>…</p> });
export default function Page() {
  return <Admin />;
}
```


---

**Assignment 161:** Split vendor code using dynamic imports for rare admin tools.

```tsx
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("./chart"), { loading: () => null });
export function Report() {
  return <Chart />;
}
```


---

**Assignment 162:** Optimize fonts with `display: swap` and subsetting via `next/font`.

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap", adjustFontFallback: true });
export default function L({ children }: { children: React.ReactNode }) {
  return <html className={inter.className}><body>{children}</body></html>;
}
```


---

**Assignment 163:** Define an image optimization strategy (sizes, formats, priority).

```tsx
/** Use priority+LCP image, correct sizes, modern formats via next/image, avoid layout shift */
```


---

**Assignment 164:** Measure and improve LCP, CLS, and INP on a sample page.

```tsx
// Measure with web-vitals in app or Vercel Analytics; fix CLS (dimensions), LCP (priority), INP (client JS).
```


---

**Assignment 165:** Explain Partial Prerendering (PPR) concept and static shell + dynamic holes.

```tsx
/** PPR: static shell prerendered; dynamic holes stream (Next experimental PPR flags in config). */
```


---

**Assignment 166:** Choose static vs dynamic segments for a mixed content site.

```tsx
// Marketing static (SSG); personalized dashboard force-dynamic; segment-level choice.
```


---

**Assignment 167:** Run selected route handlers on the Edge runtime.

```tsx
// app/api/edge/route.ts
export const runtime = "edge";
export function GET() {
  return new Response("edge");
}
```


---

**Assignment 168:** Stream HTML responses from a route handler compatible with RSC patterns.

```tsx
// Stream from route handler with ReadableStream; pair with client consumption progressively.
```


---

### Deployment & Production (169–176)

**Assignment 169:** Deploy to Vercel with environment variables configured per environment.

```tsx
// Vercel: connect repo; set Production/Preview env vars; deploy main + PR previews automatically.
```


---

**Assignment 170:** Configure `output: 'standalone'` for self-hosted Node deployments.

```ts
// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "standalone" };
export default nextConfig;
```


---

**Assignment 171:** Write a multi-stage `Dockerfile` for a Next.js 15 production image.

```bash
# Dockerfile (sketch)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
CMD ["node", "server.js"]
```


---

**Assignment 172:** Separate secrets vs public env vars and document them in `.env.example`.

```bash
# .env.example
DATABASE_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_SITE_URL=
```


---

**Assignment 173:** Use preview deployments for pull requests.

```tsx
// Vercel/GitHub: each PR → Preview URL; use for QA before merge.
```


---

**Assignment 174:** Add basic production logging hooks (e.g. `instrumentation.ts` pattern).

```ts
// instrumentation.ts (Next 15)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("instrumentation");
  }
}
```


---

**Assignment 175:** Integrate error tracking (e.g. Sentry) initialization for App Router.

```tsx
// Sentry.init in instrumentation.ts or sentry.client.config.ts per Sentry Next.js guide.
```


---

**Assignment 176:** Expose `/api/health` for load balancer health checks.

```tsx
// app/api/health/route.ts returns 200 { ok:true } for probes.
```


---

### Testing (177–184)

**Assignment 177:** Unit test a pure Client Component with React Testing Library.

```tsx
// counter.test.tsx — @testing-library/react
import { render, screen, fireEvent } from "@testing-library/react";
import { C } from "./c";
test("inc", () => {
  render(<C />);
  fireEvent.click(screen.getByRole("button"));
});
```


---

**Assignment 178:** Document limitations and patterns for testing async Server Components.

```tsx
/** Test RSC via integration/e2e; unit-test pure utils; snapshot serialized tree sparingly */
```


---

**Assignment 179:** Test a Server Action as a plain async function with mocked data layer.

```tsx
// import { save } from "./actions";
// test("save", async () => { await expect(save(mockFd)).resolves.toEqual({ ok: true }); });
```


---

**Assignment 180:** Integration test API route handlers with `GET`/`POST` requests.

```tsx
// import { GET } from "@/app/api/x/route";
// const res = await GET(new Request("http://localhost"));
// expect(res.status).toBe(200);
```


---

**Assignment 181:** Add a Playwright test for critical navigation flows.

```tsx
// playwright.config.ts + test("home", async ({ page }) => { await page.goto("/"); });
```


---

**Assignment 182:** Test middleware redirect behavior with mocked `NextRequest`.

```tsx
// Unit-test middleware by constructing NextRequest with cookies/headers.
```


---

**Assignment 183:** Snapshot JSON responses from route handlers for regression safety.

```tsx
// expect(await res.json()).toMatchSnapshot(); for stable API contracts.
```


---

**Assignment 184:** Mock `fetch` or database modules in Vitest/Jest for isolated tests.

```tsx
// vi.mock("next/cache") or jest.mock; mock prisma/fetch in server action tests.
```


---

### Advanced Patterns (185–192)

**Assignment 185:** Sketch module federation or multi-zone routing for micro-frontends.

```tsx
// Multi-zone: app1.example + app2.example rewrites; or module federation host/remote.
```


---

**Assignment 186:** Outline a Turborepo monorepo with `apps/web` and `packages/ui`.

```tsx
// turbo.json pipelines: build dependsOn ^build; apps/web depends on packages/ui.
```


---

**Assignment 187:** Add `next-intl` (or similar) for App Router i18n routing.

```tsx
// next-intl: middleware localePrefix; [locale] segment; messages/*.json.
```


---

**Assignment 188:** Describe multi-tenant routing with subdomain or path-based tenants.

```tsx
// Tenant from subdomain: middleware reads host → sets header x-tenant for data layer.
```


---

**Assignment 189:** Feature flags evaluated in middleware with cookie/query overrides.

```tsx
// middleware: read flag cookie or ?flags=x, set request header for server components.
```


---

**Assignment 190:** A/B split traffic in middleware assigning variant cookies.

```tsx
// middleware randomly assigns Set-Cookie ab=A|B for experiments.
```


---

**Assignment 191:** Inject analytics (e.g. Vercel Analytics or third-party) in root layout.

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```


---

**Assignment 192:** Fetch CMS content in Server Components with draft mode preview route.

```tsx
// draftMode() from next/headers + preview secret route; fetch CMS with draft token in RSC.
```


---

### Real-World Projects (193–200)

**Assignment 193:** Blueprint a blog: posts list, MDX content, tags, RSS.

```tsx
// Blog: app/blog/page.tsx list; [slug]/page.mdx or CMS fetch; app/rss.xml/route.ts.
```


---

**Assignment 194:** Blueprint an e-commerce store: catalog, cart Server Actions, checkout API.

```tsx
// E-com: app/products, cart Server Actions, Stripe webhook route handler.
```


---

**Assignment 195:** Blueprint a SaaS dashboard: teams, billing webhook route, settings.

```tsx
// SaaS: team switcher middleware, billing portal links, /api/stripe/webhook.
```


---

**Assignment 196:** Blueprint a social app: feed, likes Server Actions, real-time notifications.

```tsx
// Social: feed RSC infinite scroll client, like Server Action, notifications SSE.
```


---

**Assignment 197:** Blueprint a job board: filters in URL, saved searches, employer portal.

```tsx
// Jobs: searchParams filters server-side, saved searches in cookies/db, employer CRUD.
```


---

**Assignment 198:** Blueprint a real estate site: map client boundary, image gallery, lead forms.

```tsx
// Real estate: Map client-only dynamic import, next/image gallery, lead form Server Action.
```


---

**Assignment 199:** Blueprint a documentation site: sidebar layout, versioned docs, search.

```tsx
// Docs: docs/layout sidebar, version param [...slug], Algolia/doc search API route.
```


---

**Assignment 200:** Blueprint a project management tool: boards, tasks, comments, permissions.

```tsx
// PM tool: projects/[id] board (client DnD optional), tasks Server Actions, role guards.
```


---

